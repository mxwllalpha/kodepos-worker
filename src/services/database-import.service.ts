/**
 * Database Import Service
 * Comprehensive import orchestration with job tracking, validation, and processing
 *
 * @author Maxwell Alpha
 * @website https://github.com/mxwllalpha
 */

import type { D1Database } from '@cloudflare/workers-types';
import {
  ImportJob,
  ImportConfiguration,
  ImportStatus,
  ImportUploadResponse,
  ImportStatusResponse,
  ContentType
} from '../types/import';
import { ImportValidatorService } from './import-validator.service';
import { ImportProcessorService } from './import-processor.service';

export class DatabaseImportService {
  private db: D1Database;
  private validator: ImportValidatorService;
  private processor: ImportProcessorService;

  constructor(db: D1Database) {
    this.db = db;
    this.validator = new ImportValidatorService(db);
    this.processor = new ImportProcessorService(db);
  }

  /**
   * Create new import job
   */
  async createImportJob(
    filename: string,
    fileSize: number,
    contentType: ContentType,
    configuration: Partial<ImportConfiguration>,
    createdBy?: string
  ): Promise<ImportJob> {
    const jobId = crypto.randomUUID();
    const now = new Date().toISOString();

    const job: ImportJob = {
      id: jobId,
      filename,
      file_size: fileSize,
      content_type: contentType,
      status: 'pending',
      total_records: 0,
      processed_records: 0,
      successful_records: 0,
      failed_records: 0,
      duplicate_records: 0,
      processing_time_ms: 0,
      created_by: createdBy,
      created_at: now,
      updated_at: now
    };

    // Insert job record
    await this.db.prepare(`
      INSERT INTO import_jobs (
        id, filename, file_size, content_type, status,
        total_records, processed_records, successful_records,
        failed_records, duplicate_records, processing_time_ms,
        created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      job.id,
      job.filename,
      job.file_size,
      job.content_type,
      job.status,
      job.total_records,
      job.processed_records,
      job.successful_records,
      job.failed_records,
      job.duplicate_records,
      job.processing_time_ms,
      job.created_by,
      job.created_at,
      job.updated_at
    ).run();

    // Insert configuration
    const defaultConfig = this.getDefaultConfiguration();
    const finalConfig = { ...defaultConfig, ...configuration };

    await this.db.prepare(`
      INSERT INTO import_configuration (
        id, job_id, duplicate_strategy, batch_size,
        validate_coordinates, skip_invalid_records,
        notification_email, custom_validation_rules, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      jobId,
      finalConfig.duplicate_strategy,
      finalConfig.batch_size,
      finalConfig.validate_coordinates ? 1 : 0,
      finalConfig.skip_invalid_records ? 1 : 0,
      finalConfig.notification_email,
      JSON.stringify(finalConfig.custom_validation_rules || {}),
      now
    ).run();

    return job;
  }

  /**
   * Process uploaded file and start import job
   */
  async processImportFile(
    jobId: string,
    fileContent: string
  ): Promise<ImportUploadResponse> {
    try {

      // Get job details
      const job = await this.getImportJob(jobId);
      if (!job) {
        return { success: false, error: 'Import job not found' };
      }

      // Update job status to processing
      await this.updateJobStatus(jobId, 'processing');

      // Parse file content based on content type
      let records: Record<string, unknown>[];

      if (job.content_type === 'application/json') {
        try {
          const parsed = JSON.parse(fileContent);
          records = Array.isArray(parsed) ? parsed : [parsed];
        } catch (error) {
          await this.failJob(jobId, 'Invalid JSON format');
          return { success: false, error: 'Invalid JSON format' };
        }
      } else if (job.content_type === 'text/csv') {
        records = await this.parseCSV(fileContent);
      } else {
        await this.failJob(jobId, 'Unsupported file format');
        return { success: false, error: 'Unsupported file format' };
      }

      // Update job with total records
      await this.updateJobRecordCount(jobId, records.length);

      // Start processing in background (simulate async processing)
      this.processRecordsAsync(jobId, records);

      return {
        success: true,
        job_id: jobId,
        filename: job.filename,
        total_records: records.length,
        estimated_duration: Math.ceil(records.length / 100), // Rough estimate
        message: 'Import job started successfully'
      };

    } catch (error) {
      await this.failJob(jobId, error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get import job status
   */
  async getImportJobStatus(jobId: string): Promise<ImportStatusResponse> {
    try {
      const job = await this.getImportJob(jobId);

      if (!job) {
        return { success: false, error: 'Import job not found' };
      }

      const progressPercentage = job.total_records > 0
        ? Math.round((job.processed_records / job.total_records) * 100)
        : 0;

      let estimatedRemainingTime = undefined;
      if (job.processed_records > 0 && job.status === 'processing') {
        const avgTimePerRecord = job.processing_time_ms / Math.max(job.processed_records, 1);
        const remainingRecords = job.total_records - job.processed_records;
        estimatedRemainingTime = Math.ceil((remainingRecords * avgTimePerRecord) / 1000);
      }

      return {
        success: true,
        job,
        progress_percentage: progressPercentage,
        estimated_remaining_time: estimatedRemainingTime,
        message: this.getStatusMessage(job.status)
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get import job list
   */
  async getImportJobs(
    status?: ImportStatus,
    page: number = 1,
    perPage: number = 20
  ): Promise<{ jobs: ImportJob[]; total_count: number }> {
    let sql = `
      SELECT * FROM import_jobs
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(perPage, (page - 1) * perPage);

    const result = await this.db.prepare(sql).bind(...params).all();

    // Get total count
    let countSql = 'SELECT COUNT(*) as count FROM import_jobs WHERE 1=1';
    const countParams: (string | number)[] = [];

    if (status) {
      countSql += ' AND status = ?';
      countParams.push(status);
    }

    const countResult = await this.db.prepare(countSql).bind(...countParams).first();

    return {
      jobs: (result.results as unknown) as ImportJob[] || [],
      total_count: ((countResult as { count?: number })?.count) || 0
    };
  }

  /**
   * Cancel import job
   */
  async cancelImportJob(jobId: string): Promise<boolean> {
    try {
      const job = await this.getImportJob(jobId);

      if (!job) {
        return false;
      }

      if (['completed', 'failed', 'cancelled'].includes(job.status)) {
        return false; // Cannot cancel completed jobs
      }

      await this.updateJobStatus(jobId, 'cancelled');
      return true;

    } catch (error) {
      console.error('Error cancelling import job:', error);
      return false;
    }
  }

  /**
   * Private helper methods
   */
  private async getImportJob(jobId: string): Promise<ImportJob | null> {
    const result = await this.db.prepare(`
      SELECT * FROM import_jobs WHERE id = ?
    `).bind(jobId).first();

    return result ? (result as unknown) as ImportJob : null;
  }

  private async updateJobStatus(jobId: string, status: ImportStatus): Promise<void> {
    await this.db.prepare(`
      UPDATE import_jobs
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(status, jobId).run();
  }

  private async updateJobRecordCount(jobId: string, totalRecords: number): Promise<void> {
    await this.db.prepare(`
      UPDATE import_jobs
      SET total_records = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(totalRecords, jobId).run();
  }

  private async failJob(jobId: string, errorMessage: string): Promise<void> {
    await this.db.prepare(`
      UPDATE import_jobs
      SET status = 'failed', error_message = ?,
          completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(errorMessage, jobId).run();
  }

  private async completeJob(jobId: string): Promise<void> {
    await this.db.prepare(`
      UPDATE import_jobs
      SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(jobId).run();
  }

  private getDefaultConfiguration(): ImportConfiguration {
    return {
      duplicate_strategy: 'skip',
      batch_size: 1000,
      validate_coordinates: true,
      skip_invalid_records: true,
      custom_validation_rules: {}
    };
  }

  private getStatusMessage(status: ImportStatus): string {
    const messages = {
      pending: 'Import job is waiting to start',
      processing: 'Import job is currently processing',
      validating: 'Validating import data',
      transforming: 'Transforming import data',
      inserting: 'Inserting records into database',
      completed: 'Import job completed successfully',
      failed: 'Import job failed',
      cancelled: 'Import job was cancelled'
    };

    return messages[status] || 'Unknown status';
  }

  private async parseCSV(csvContent: string): Promise<Record<string, string>[]> {
    const lines = csvContent.trim().split('\n');
    if (lines.length === 0) {
      return [];
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const records: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const record: Record<string, string> = {};

      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });

      records.push(record);
    }

    return records;
  }

  private async processRecordsAsync(
    jobId: string,
    records: Record<string, unknown>[]
  ): Promise<void> {
    // This would normally be a background job or queue
    // For now, we'll simulate the processing
    try {
      // Update status to validating
      await this.updateJobStatus(jobId, 'validating');

      // Validate records
      const validationResults = await this.validator.validateRecords(records, jobId);

      // Update status to transforming
      await this.updateJobStatus(jobId, 'transforming');

      // Transform valid records to KodeposData format
      const validRecords = validationResults.filter(r => r.is_valid);
      const transformedRecords = await this.processor.transformRecords(validRecords.map(r => r.data));

      // Update status to inserting
      await this.updateJobStatus(jobId, 'inserting');

      // Insert records in batches
      await this.processor.insertRecordsBatch(jobId, transformedRecords);

      // Complete job
      await this.completeJob(jobId);

    } catch (error) {
      await this.failJob(jobId, error instanceof Error ? error.message : 'Unknown error');
    }
  }
}