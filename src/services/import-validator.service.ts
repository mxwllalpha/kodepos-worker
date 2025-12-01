/**
 * Import Validator Service
 * Comprehensive validation for import data with configurable rules
 *
 * @author Maxwell Alpha
 * @website https://github.com/mxwllalpha
 */

import type { D1Database } from '@cloudflare/workers-types';
import {
  ImportValidationResult,
  ImportError,
  ValidationSeverity,
  ContentType,
  ImportConfiguration
} from '../types/import';

interface ValidationResult {
  is_valid: boolean;
  errors: ImportError[];
}

interface RecordValidationResult extends ValidationResult {
  data: Record<string, unknown>;
}

export class ImportValidatorService {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Validate import file format and structure
   */
  async validateFileFormat(
    fileContent: string,
    contentType: ContentType
  ): Promise<{ is_valid: boolean; errors: string[]; sample_records: Record<string, string>[] }> {
    const errors: string[] = [];
    let sampleRecords: Record<string, string>[] = [];

    try {
      if (contentType === 'application/json') {
        const parsed = JSON.parse(fileContent);
        const records = Array.isArray(parsed) ? parsed : [parsed];

        if (records.length === 0) {
          errors.push('JSON file contains no records');
        } else {
          sampleRecords = records.slice(0, 3);
        }

      } else if (contentType === 'text/csv') {
        const lines = fileContent.trim().split('\n');
        if (lines.length <= 1) {
          errors.push('CSV file contains no data rows');
        } else {
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          const requiredHeaders = ['province', 'city', 'district', 'village'];

          for (const header of requiredHeaders) {
            if (!headers.map(h => h.toLowerCase()).includes(header.toLowerCase())) {
              errors.push(`Missing required header: ${header}`);
            }
          }

          // Parse sample records
          for (let i = 1; i <= Math.min(3, lines.length - 1); i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const record: Record<string, string> = {};

            headers.forEach((header, index) => {
              record[header] = values[index] || '';
            });

            sampleRecords.push(record);
          }
        }

      } else {
        errors.push(`Unsupported content type: ${contentType}`);
      }

      return {
        is_valid: errors.length === 0,
        errors,
        sample_records: sampleRecords
      };

    } catch (error) {
      return {
        is_valid: false,
        errors: [`File parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        sample_records: []
      };
    }
  }

  /**
   * Validate all records in import data
   */
  async validateRecords(
    records: Record<string, unknown>[],
    jobId: string
  ): Promise<RecordValidationResult[]> {
    const results: RecordValidationResult[] = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const validationResult = await this.validateRecord(record, i + 1, jobId);

      results.push({
        ...validationResult,
        data: record
      });

      // Store validation results for invalid records
      if (!validationResult.is_valid && validationResult.errors.length > 0) {
        await this.saveValidationResult(jobId, i + 1, record, validationResult.errors);
      }
    }

    return results;
  }

  /**
   * Validate individual record
   */
  async validateRecord(
    record: Record<string, unknown>,
    rowNumber: number,
    jobId?: string
  ): Promise<ValidationResult> {
    const errors: ImportError[] = [];

    // Required field validation
    const requiredFields = ['province', 'city', 'district', 'village'];
    for (const field of requiredFields) {
      if (!record[field] || record[field].toString().trim() === '') {
        errors.push({
          code: 'MISSING_REQUIRED_FIELD',
          message: `Missing required field: ${field}`,
          field,
          row_number: rowNumber,
          severity: 'error'
        });
      }
    }

    // Postal code validation
    if (record.kodepos || record.postal_code) {
      const postalCode = record.kodepos || record.postal_code;
      if (!this.validatePostalCode(String(postalCode))) {
        errors.push({
          code: 'INVALID_POSTAL_CODE',
          message: 'Invalid postal code format (should be 5 digits)',
          field: 'kodepos',
          row_number: rowNumber,
          severity: 'error'
        });
      }
    }

    // Coordinate validation
    if (record.latitude && record.longitude) {
      const lat = parseFloat(String(record.latitude));
      const lng = parseFloat(String(record.longitude));

      if (isNaN(lat) || isNaN(lng)) {
        errors.push({
          code: 'INVALID_COORDINATES',
          message: 'Coordinates must be valid numbers',
          field: 'coordinates',
          row_number: rowNumber,
          severity: 'error'
        });
      } else if (lat < -11 || lat > 6 || lng < 95 || lng > 141) {
        errors.push({
          code: 'COORDINATES_OUT_OF_RANGE',
          message: 'Coordinates outside Indonesia geographic range',
          field: 'coordinates',
          row_number: rowNumber,
          severity: 'warning'
        });
      }
    }

    // Data type validation
    if (record.elevation) {
      const elevation = parseFloat(String(record.elevation));
      if (isNaN(elevation)) {
        errors.push({
          code: 'INVALID_ELEVATION',
          message: 'Elevation must be a valid number',
          field: 'elevation',
          row_number: rowNumber,
          severity: 'warning'
        });
      }
    }

    // Length validation
    const lengthFields = [
      { field: 'province', maxLength: 50 },
      { field: 'city', maxLength: 100 },
      { field: 'district', maxLength: 100 },
      { field: 'village', maxLength: 100 }
    ];

    for (const { field, maxLength } of lengthFields) {
      const fieldValue = String(record[field] || '');
      if (fieldValue && fieldValue.length > maxLength) {
        errors.push({
          code: 'FIELD_TOO_LONG',
          message: `${field} exceeds maximum length of ${maxLength} characters`,
          field,
          row_number: rowNumber,
          severity: 'warning'
        });
      }
    }

    // Check for duplicates if job ID provided
    if (jobId && record.kodepos) {
      const isDuplicate = await this.checkDuplicate(record.kodepos.toString());
      if (isDuplicate) {
        errors.push({
          code: 'DUPLICATE_POSTAL_CODE',
          message: 'Postal code already exists in database',
          field: 'kodepos',
          row_number: rowNumber,
          severity: 'error'
        });
      }
    }

    return {
      is_valid: errors.filter(e => e.severity === 'error').length === 0,
      errors
    };
  }

  /**
   * Validate postal code format
   */
  validatePostalCode(postalCode: string): boolean {
    // Remove any non-digit characters
    const cleanCode = postalCode.replace(/\D/g, '');
    // Check if exactly 5 digits
    return /^[0-9]{5}$/.test(cleanCode);
  }

  /**
   * Check for duplicate postal code
   */
  async checkDuplicate(postalCode: string): Promise<boolean> {
    try {
      const result = await this.db.prepare(`
        SELECT COUNT(*) as count FROM postal_codes WHERE code = ?
      `).bind(postalCode).first();

      return ((result as { count?: number })?.count || 0) > 0;
    } catch (error) {
      console.error('Error checking duplicate postal code:', error);
      return false;
    }
  }

  /**
   * Validate geographic coordinates for Indonesia
   */
  validateIndonesiaCoordinates(latitude: number, longitude: number): boolean {
    // Indonesia geographic bounds (approximate)
    // Latitude: -11 to 6, Longitude: 95 to 141
    return latitude >= -11 && latitude <= 6 && longitude >= 95 && longitude <= 141;
  }

  /**
   * Validate import configuration
   */
  validateConfiguration(config: Partial<ImportConfiguration>): { is_valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.batch_size && (config.batch_size < 1 || config.batch_size > 10000)) {
      errors.push('Batch size must be between 1 and 10000');
    }

    if (config.duplicate_strategy && !['skip', 'update', 'error'].includes(config.duplicate_strategy)) {
      errors.push('Invalid duplicate strategy. Must be skip, update, or error');
    }

    if (config.notification_email && !this.validateEmail(config.notification_email)) {
      errors.push('Invalid notification email format');
    }

    return {
      is_valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Save validation result to database
   */
  private async saveValidationResult(
    jobId: string,
    rowNumber: number,
    record: Record<string, unknown>,
    errors: ImportError[]
  ): Promise<void> {
    try {
      const resultId = crypto.randomUUID();
      const hasError = errors.some(e => e.severity === 'error');

      if (!hasError) {
        return; // Only save records with errors
      }

      await this.db.prepare(`
        INSERT INTO import_validation_results (
          id, job_id, row_number, record_data, validation_errors, severity, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(
        resultId,
        jobId,
        rowNumber,
        JSON.stringify(record),
        JSON.stringify(errors),
        'error'
      ).run();

    } catch (error) {
      console.error('Error saving validation result:', error);
    }
  }

  /**
   * Get validation results for a job
   */
  async getValidationResults(
    jobId: string,
    severity?: ValidationSeverity
  ): Promise<ImportValidationResult[]> {
    try {
      let sql = `
        SELECT * FROM import_validation_results
        WHERE job_id = ?
      `;
      const params: (string | ValidationSeverity)[] = [jobId];

      if (severity) {
        sql += ' AND severity = ?';
        params.push(severity);
      }

      sql += ' ORDER BY row_number ASC';

      const result = await this.db.prepare(sql).bind(...params).all();
      return (result.results as unknown) as ImportValidationResult[] || [];

    } catch (error) {
      console.error('Error getting validation results:', error);
      return [];
    }
  }

  /**
   * Clean old validation results
   */
  async cleanOldValidationResults(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)
        .toISOString().slice(0, 19).replace('T', ' ');

      const result = await this.db.prepare(`
        DELETE FROM import_validation_results
        WHERE created_at < ?
      `).bind(cutoffDate).run();

      return result.meta.changes || 0;

    } catch (error) {
      console.error('Error cleaning validation results:', error);
      return 0;
    }
  }
}