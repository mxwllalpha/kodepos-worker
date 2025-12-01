/**
 * Import Processor Service
 * Data transformation, batch processing, and database operations for imports
 *
 * @author Maxwell Alpha
 * @website https://github.com/mxwllalpha
 */

import type { D1Database } from '@cloudflare/workers-types';
import { KodeposData } from '../types/kodepos';
import { DuplicateStrategy } from '../types/import';

export class ImportProcessorService {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Transform import records to KodeposData format
   */
  async transformRecords(records: Record<string, unknown>[]): Promise<KodeposData[]> {
    const transformed: KodeposData[] = [];

    for (const record of records) {
      try {
        const kodeposData: KodeposData = {
          code: parseInt(this.extractPostalCode(record)),
          province: this.normalizeText(record.province || record.provinsi),
          regency: this.normalizeText(record.city || record.kota || record.regency),
          district: this.normalizeText(record.district || record.kecamatan),
          village: this.normalizeText(record.village || record.kelurahan),
          latitude: this.extractCoordinate(record.latitude) || 0,
          longitude: this.extractCoordinate(record.longitude) || 0,
          elevation: this.extractElevation(record.elevation) || undefined,
          timezone: this.extractTimezone(record.timezone) || undefined
        };

        transformed.push(kodeposData);
      } catch (error) {
        console.error('Error transforming record:', record, error);
        // Skip invalid records - they should be caught by validation
        continue;
      }
    }

    return transformed;
  }

  /**
   * Insert records in batches with progress tracking
   */
  async insertRecordsBatch(
    jobId: string,
    records: KodeposData[],
    batchSize: number = 1000,
    duplicateStrategy: DuplicateStrategy = 'skip'
  ): Promise<{ successful: number; failed: number; duplicates: number }> {
    let successful = 0;
    let failed = 0;
    let duplicates = 0;

    try {
      const batchSql = `
        INSERT INTO postal_codes (
          code, province, regency, district, village,
          latitude, longitude, elevation, timezone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const batchStartTime = Date.now();

        for (const record of batch) {
          try {
            // Check for duplicate based on strategy
            if (await this.isDuplicate(record.code.toString(), duplicateStrategy)) {
              if (duplicateStrategy === 'error') {
                failed++;
                continue;
              } else if (duplicateStrategy === 'update') {
                await this.updateExistingRecord(record);
                successful++;
              } else {
                duplicates++;
              }
              continue;
            }

            // Insert new record
            await this.db.prepare(batchSql).bind(
              record.code.toString(),
              record.province,
              record.regency,
              record.district,
              record.village,
              record.latitude,
              record.longitude,
              record.elevation,
              record.timezone
            ).run();

            successful++;

          } catch (error) {
            console.error('Error inserting record:', record.code, error);
            failed++;
          }
        }

        const batchTime = Date.now() - batchStartTime;

        // Log batch statistics
        await this.logBatchStatistics(jobId, 'insertion', batch.length, batchTime);

        // Update job progress
        await this.updateJobProgress(jobId, i + batch.length, successful, failed, duplicates);

        // Small delay to prevent rate limiting
        if (i + batchSize < records.length) {
          await this.delay(100);
        }
      }

    } catch (error) {
      console.error('Error in batch insertion:', error);
      failed = records.length - successful - duplicates;
    }

    return { successful, failed, duplicates };
  }

  /**
   * Update existing record
   */
  private async updateExistingRecord(record: KodeposData): Promise<void> {
    const updateSql = `
      UPDATE postal_codes SET
        province = ?, regency = ?, district = ?, village = ?,
        latitude = ?, longitude = ?, elevation = ?, timezone = ?
      WHERE code = ?
    `;

    await this.db.prepare(updateSql).bind(
      record.province,
      record.regency,
      record.district,
      record.village,
      record.latitude,
      record.longitude,
      record.elevation,
      record.timezone,
      record.code.toString()
    ).run();
  }

  /**
   * Check if record is duplicate based on strategy
   */
  private async isDuplicate(postalCode: string, strategy: DuplicateStrategy): Promise<boolean> {
    if (strategy === 'skip' || strategy === 'error') {
      try {
        const result = await this.db.prepare(`
          SELECT COUNT(*) as count FROM postal_codes WHERE code = ?
        `).bind(postalCode).first();

        return ((result as { count?: number })?.count || 0) > 0;
      } catch (error) {
        console.error('Error checking duplicate:', error);
        return false;
      }
    }

    return false; // For 'update' strategy, we always proceed
  }

  /**
   * Extract and validate postal code
   */
  private extractPostalCode(record: Record<string, unknown>): string {
    const postalCode = record.kodepos || record.postal_code || record.code;

    if (!postalCode) {
      throw new Error('Postal code is required');
    }

    // Remove non-digit characters and validate
    const cleanCode = postalCode.toString().replace(/\D/g, '');

    if (!/^[0-9]{5}$/.test(cleanCode)) {
      throw new Error('Postal code must be exactly 5 digits');
    }

    return cleanCode;
  }

  /**
   * Normalize text fields (trim, proper case)
   */
  private normalizeText(text: unknown): string {
    if (!text) return '';

    const normalized = text.toString().trim();

    // Convert to title case for Indonesian names
    return normalized.toLowerCase().replace(/\b\w/g, (char: string) => char.toUpperCase());
  }

  /**
   * Extract and validate coordinate
   */
  private extractCoordinate(coord: unknown): number | null {
    if (!coord) return null;

    const parsed = parseFloat(coord.toString());

    if (isNaN(parsed)) {
      return null; // Invalid coordinates handled by validation
    }

    return parsed;
  }

  /**
   * Extract elevation in meters
   */
  private extractElevation(elevation: unknown): number | null {
    if (!elevation) return null;

    const parsed = parseFloat(elevation.toString());

    if (isNaN(parsed)) {
      return null;
    }

    return parsed;
  }

  /**
   * Extract timezone information
   */
  private extractTimezone(timezone: unknown): string | null {
    if (!timezone) return 'Asia/Jakarta'; // Default Indonesian timezone

    const tz = timezone.toString().trim();

    // Common Indonesian timezones
    const indonesianTimezones = [
      'Asia/Jakarta', 'Asia/Pontianak', 'Asia/Makassar', 'Asia/Jayapura',
      'WIB', 'WITA', 'WIT', 'UTC+7', 'UTC+8', 'UTC+9'
    ];

    if (indonesianTimezones.includes(tz)) {
      return tz.startsWith('UTC') ? this.convertUtcToTimezone(tz) : tz;
    }

    return 'Asia/Jakarta';
  }

  /**
   * Convert UTC offset to timezone name
   */
  private convertUtcToTimezone(utcOffset: string): string {
    const offsetMap: Record<string, string> = {
      'UTC+7': 'Asia/Jakarta',
      'UTC+8': 'Asia/Makassar',
      'UTC+9': 'Asia/Jayapura'
    };

    return offsetMap[utcOffset] || 'Asia/Jakarta';
  }

  /**
   * Log batch processing statistics
   */
  private async logBatchStatistics(
    jobId: string,
    operationType: string,
    recordsCount: number,
    executionTimeMs: number
  ): Promise<void> {
    try {
      const statisticId = crypto.randomUUID();

      await this.db.prepare(`
        INSERT INTO import_statistics (
          id, job_id, processing_phase, operation_type,
          records_count, execution_time_ms, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(
        statisticId,
        jobId,
        'insertion',
        operationType,
        recordsCount,
        executionTimeMs
      ).run();

    } catch (error) {
      console.error('Error logging batch statistics:', error);
    }
  }

  /**
   * Update job progress in database
   */
  private async updateJobProgress(
    jobId: string,
    processedRecords: number,
    successfulRecords: number,
    failedRecords: number,
    duplicateRecords: number
  ): Promise<void> {
    try {
      await this.db.prepare(`
        UPDATE import_jobs SET
          processed_records = ?,
          successful_records = ?,
          failed_records = ?,
          duplicate_records = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        processedRecords,
        successfulRecords,
        failedRecords,
        duplicateRecords,
        jobId
      ).run();

    } catch (error) {
      console.error('Error updating job progress:', error);
    }
  }

  /**
   * Generate processing summary report
   */
  async generateProcessingSummary(jobId: string): Promise<{
    total_processed: number;
    successful_records: number;
    failed_records: number;
    duplicate_records: number;
    processing_time_ms: number;
    validation_errors: number;
    warnings: number;
  }> {
    try {
      // Get job statistics
      const jobResult = await this.db.prepare(`
        SELECT * FROM import_jobs WHERE id = ?
      `).bind(jobId).first();

      if (!jobResult) {
        throw new Error('Import job not found');
      }

      // Get validation errors count
      const validationErrorsResult = await this.db.prepare(`
        SELECT COUNT(*) as count FROM import_validation_results
        WHERE job_id = ? AND severity = 'error'
      `).bind(jobId).first();

      // Get warnings count
      const warningsResult = await this.db.prepare(`
        SELECT COUNT(*) as count FROM import_validation_results
        WHERE job_id = ? AND severity = 'warning'
      `).bind(jobId).first();

      return {
        total_processed: Number(jobResult.processed_records) || 0,
        successful_records: Number(jobResult.successful_records) || 0,
        failed_records: Number(jobResult.failed_records) || 0,
        duplicate_records: Number(jobResult.duplicate_records) || 0,
        processing_time_ms: Number(jobResult.processing_time_ms) || 0,
        validation_errors: (validationErrorsResult as { count?: number })?.count || 0,
        warnings: (warningsResult as { count?: number })?.count || 0
      };

    } catch (error) {
      console.error('Error generating processing summary:', error);
      return {
        total_processed: 0,
        successful_records: 0,
        failed_records: 0,
        duplicate_records: 0,
        processing_time_ms: 0,
        validation_errors: 0,
        warnings: 0
      };
    }
  }

  /**
   * Clean up temporary data after successful import
   */
  async cleanupAfterImport(jobId: string, keepValidationResults: boolean = false): Promise<void> {
    try {
      if (!keepValidationResults) {
        await this.db.prepare(`
          DELETE FROM import_validation_results WHERE job_id = ?
        `).bind(jobId).run();
      }

      // Remove statistics older than 30 days
      const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString().slice(0, 19).replace('T', ' ');

      await this.db.prepare(`
        DELETE FROM import_statistics WHERE created_at < ?
      `).bind(cutoffDate).run();

    } catch (error) {
      console.error('Error cleaning up after import:', error);
    }
  }

  /**
   * Delay function for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}