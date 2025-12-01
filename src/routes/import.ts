/**
 * Import API Routes
 * REST API endpoints for database import functionality
 *
 * @author Maxwell Alpha
 * @website https://github.com/mxwllalpha
 */

import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../types/kodepos';
import type {
  ImportValidationResponse,
  ImportConfiguration,
  ContentType,
  ImportJobListResponse
} from '../types/import';
import { DatabaseImportService } from '../services/database-import.service';
import { ImportValidatorService } from '../services/import-validator.service';

// Create import router
const importRouter = new Hono<{ Bindings: Env }>();

/**
 * Helper function to create standardized API responses
 */
function createImportApiResponse<T = unknown>(
  success: boolean,
  data?: T,
  error?: string,
  message?: string
): { success: boolean; data?: T; error?: string; message?: string; timestamp: string; } {
  return {
    success,
    data,
    error,
    message,
    timestamp: new Date().toISOString()
  };
}

/**
 * Helper function to validate and cast content type
 */
function validateContentType(contentType: string): ContentType {
  const validTypes: ContentType[] = ['application/json', 'text/csv', 'application/vnd.ms-excel'];

  if (validTypes.includes(contentType as ContentType)) {
    return contentType as ContentType;
  }

  // Default to JSON if invalid type
  return 'application/json';
}

/**
 * Validation schemas
 */
const UploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  configuration: z.object({
    duplicate_strategy: z.enum(['skip', 'update', 'error']).optional(),
    batch_size: z.number().min(1).max(10000).optional(),
    validate_coordinates: z.boolean().optional(),
    skip_invalid_records: z.boolean().optional(),
    notification_email: z.string().email().optional()
  }).optional()
});

const HistorySchema = z.object({
  status: z.enum(['pending', 'processing', 'validating', 'transforming', 'inserting', 'completed', 'failed', 'cancelled']).optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  created_by: z.string().optional(),
  page: z.number().min(1).optional(),
  per_page: z.number().min(1).max(100).optional(),
  sort_by: z.enum(['created_at', 'completed_at', 'processing_time_ms']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional()
});

/**
 * POST /api/v1/import/upload
 * Upload and process import file
 */
importRouter.post('/upload', async (c) => {
  const db = c.env.KODEPOS_DB;
  const importService = new DatabaseImportService(db);

  try {
    // Parse form data
    const formData = await c.req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return c.json(createImportApiResponse(false, undefined, 'No file uploaded'), 400);
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return c.json(createImportApiResponse(false, undefined, 'File size exceeds 10MB limit'), 400);
    }

    // Validate file type
    const allowedTypes = ['application/json', 'text/csv', 'application/vnd.ms-excel'];
    if (!allowedTypes.includes(file.type)) {
      return c.json(createImportApiResponse(false, undefined, `File type ${file.type} not allowed`), 400);
    }

    // Parse configuration
    const configText = formData.get('configuration') as string;
    let configuration = {};

    if (configText) {
      try {
        configuration = JSON.parse(configText);
        const validatedConfig = UploadSchema.parse({ filename: file.name, configuration });
        configuration = validatedConfig.configuration || {};
      } catch (error) {
        return c.json(createImportApiResponse(false, undefined, 'Invalid configuration format'), 400);
      }
    }

    // Read file content
    const fileContent = await file.text();

    // Validate file format
    const validator = new ImportValidatorService(db);
    const formatValidation = await validator.validateFileFormat(
      fileContent,
      validateContentType(file.type)
    );

    if (!formatValidation.is_valid) {
      return c.json(createImportApiResponse(false, undefined, formatValidation.errors.join(', ')), 400);
    }

    // Create import job
    const job = await importService.createImportJob(
      file.name,
      file.size,
      validateContentType(file.type),
      configuration,
      c.req.header('x-user-id') // Optional user ID
    );

    // Start processing (this would normally be in a background job)
    const result = await importService.processImportFile(job.id, fileContent);

    return c.json(createImportApiResponse(result.success, result, undefined, result.message));

  } catch (error) {
    console.error('Import upload error:', error);
    return c.json(createImportApiResponse(false, undefined, 'Import failed', error instanceof Error ? error.message : 'Unknown error'), 500);
  }
});

/**
 * GET /api/v1/import/status/:jobId
 * Get import job status
 */
importRouter.get('/status/:jobId', async (c) => {
  const db = c.env.KODEPOS_DB;
  const importService = new DatabaseImportService(db);

  try {
    const jobId = c.req.param('jobId');

    if (!jobId) {
      return c.json(createImportApiResponse(false, undefined, 'Job ID is required'), 400);
    }

    const status = await importService.getImportJobStatus(jobId);

    return c.json(createImportApiResponse(status.success, status.job, status.error, status.message));

  } catch (error) {
    console.error('Import status error:', error);
    return c.json(createImportApiResponse(false, undefined, 'Status check failed', error instanceof Error ? error.message : 'Unknown error'), 500);
  }
});

/**
 * GET /api/v1/import/history
 * Get import job history
 */
importRouter.get('/history', async (c) => {
  const db = c.env.KODEPOS_DB;
  const importService = new DatabaseImportService(db);

  try {
    // Parse query parameters
    const query = {
      status: c.req.query('status'),
      date_from: c.req.query('date_from'),
      date_to: c.req.query('date_to'),
      created_by: c.req.query('created_by'),
      page: c.req.query('page') ? parseInt(c.req.query('page') ?? '1') : 1,
      per_page: c.req.query('per_page') ? parseInt(c.req.query('per_page') ?? '20') : 20,
      sort_by: c.req.query('sort_by'),
      sort_order: c.req.query('sort_order')
    };

    // Validate query parameters
    const validatedQuery = HistorySchema.parse(query);

    const { jobs, total_count } = await importService.getImportJobs(
      validatedQuery.status,
      validatedQuery.page || 1,
      validatedQuery.per_page || 20
    );

    const response: ImportJobListResponse = {
      success: true,
      jobs,
      total_count,
      page: validatedQuery.page || 1,
      per_page: validatedQuery.per_page || 20,
      total_pages: Math.ceil(total_count / (validatedQuery.per_page || 20))
    };

    return c.json(createImportApiResponse(response.success, response));

  } catch (error) {
    console.error('Import history error:', error);
    return c.json(createImportApiResponse(false, undefined, 'History fetch failed', error instanceof Error ? error.message : 'Unknown error'), 500);
  }
});

/**
 * POST /api/v1/import/validate
 * Validate import data before processing
 */
importRouter.post('/validate', async (c) => {
  const db = c.env.KODEPOS_DB;
  const validator = new ImportValidatorService(db);

  try {
    const body = await c.req.json();

    // Validate request body
    const validationSchema = z.object({
      data: z.array(z.record(z.unknown())).min(1, 'Data array is required'),
      configuration: z.object({
        duplicate_strategy: z.enum(['skip', 'update', 'error']).optional(),
        validate_coordinates: z.boolean().optional()
      }).optional()
    });

    const { data } = validationSchema.parse(body);

    // Validate records
    const validationResults = await validator.validateRecords(data, 'validation');

    const validRecords = validationResults.filter(r => r.is_valid);
    const invalidRecords = validationResults.filter(r => !r.is_valid);

    const response: ImportValidationResponse = {
      success: true,
      validation_results: invalidRecords.map(r => ({
        id: crypto.randomUUID(),
        job_id: 'validation',
        row_number: 0,
        record_data: JSON.stringify(r.data),
        validation_errors: JSON.stringify(r.errors),
        severity: 'error',
        created_at: new Date().toISOString()
      })),
      total_records: data.length,
      valid_records: validRecords.length,
      invalid_records: invalidRecords.length,
      duplicate_records: 0, // Would need additional check
      estimated_import_time: Math.ceil(data.length / 100) // Rough estimate
    };

    return c.json(createImportApiResponse(response.success, response));

  } catch (error) {
    console.error('Import validation error:', error);
    return c.json(createImportApiResponse(false, undefined, 'Validation failed', error instanceof Error ? error.message : 'Unknown error'), 500);
  }
});

/**
 * DELETE /api/v1/import/cancel/:jobId
 * Cancel running import job
 */
importRouter.delete('/cancel/:jobId', async (c) => {
  const db = c.env.KODEPOS_DB;
  const importService = new DatabaseImportService(db);

  try {
    const jobId = c.req.param('jobId');

    if (!jobId) {
      return c.json(createImportApiResponse(false, undefined, 'Job ID is required'), 400);
    }

    const cancelled = await importService.cancelImportJob(jobId);

    if (cancelled) {
      return c.json(createImportApiResponse(true, { cancelled: true }, undefined, 'Import job cancelled successfully'));
    } else {
      return c.json(createImportApiResponse(false, undefined, 'Cannot cancel job - job not found or already completed'), 400);
    }

  } catch (error) {
    console.error('Import cancel error:', error);
    return c.json(createImportApiResponse(false, undefined, 'Cancel failed', error instanceof Error ? error.message : 'Unknown error'), 500);
  }
});

/**
 * GET /api/v1/import/statistics
 * Get import system statistics
 */
importRouter.get('/statistics', async (c) => {
  const db = c.env.KODEPOS_DB;

  try {
    // Get job statistics
    const [totalJobs, successfulJobs, failedJobs, activeJobs] = await Promise.all([
      db.prepare('SELECT COUNT(*) as count FROM import_jobs').first(),
      db.prepare('SELECT COUNT(*) as count FROM import_jobs WHERE status = "completed"').first(),
      db.prepare('SELECT COUNT(*) as count FROM import_jobs WHERE status = "failed"').first(),
      db.prepare('SELECT COUNT(*) as count FROM import_jobs WHERE status IN ("pending", "processing", "validating", "transforming", "inserting")').first()
    ]);

    // Get processing statistics
    const avgProcessingTime = await db.prepare(`
      SELECT AVG(processing_time_ms) as avg_time
      FROM import_jobs
      WHERE status = 'completed' AND processing_time_ms > 0
    `).first();

    // Get last import date
    const lastImport = await db.prepare(`
      SELECT completed_at
      FROM import_jobs
      WHERE status = 'completed'
      ORDER BY completed_at DESC
      LIMIT 1
    `).first();

    // Get total records processed
    const totalRecords = await db.prepare(`
      SELECT SUM(successful_records) as total
      FROM import_jobs
      WHERE status = 'completed'
    `).first();

    const statistics = {
      total_jobs: (totalJobs as { count?: number })?.count || 0,
      successful_jobs: (successfulJobs as { count?: number })?.count || 0,
      failed_jobs: (failedJobs as { count?: number })?.count || 0,
      active_jobs: (activeJobs as { count?: number })?.count || 0,
      total_records_processed: (totalRecords as { total?: number })?.total || 0,
      average_processing_time_ms: Math.round((avgProcessingTime as { avg_time?: number })?.avg_time || 0),
      last_import_date: (lastImport as { completed_at?: string })?.completed_at || null
    };

    return c.json(createImportApiResponse(true, statistics));

  } catch (error) {
    console.error('Import statistics error:', error);
    return c.json(createImportApiResponse(false, undefined, 'Statistics fetch failed', error instanceof Error ? error.message : 'Unknown error'), 500);
  }
});

/**
 * GET /api/v1/import/config
 * Get default import configuration
 */
importRouter.get('/config', async (c) => {
  try {
    const defaultConfig: ImportConfiguration = {
      duplicate_strategy: 'skip',
      batch_size: 1000,
      validate_coordinates: true,
      skip_invalid_records: true
    };

    return c.json(createImportApiResponse(true, defaultConfig));

  } catch (error) {
    console.error('Import config error:', error);
    return c.json(createImportApiResponse(false, undefined, 'Config fetch failed', error instanceof Error ? error.message : 'Unknown error'), 500);
  }
});

/**
 * GET /api/v1/import/templates
 * Get import file templates
 */
importRouter.get('/templates', async (c) => {
  try {
    const templates = {
      json: {
        content_type: 'application/json',
        example: [
          {
            kodepos: '10110',
            province: 'DKI Jakarta',
            city: 'Jakarta Pusat',
            district: 'Menteng',
            village: 'Menteng',
            latitude: -6.1944,
            longitude: 106.8229,
            elevation: 10,
            timezone: 'Asia/Jakarta'
          }
        ],
        description: 'JSON array format with complete postal code information'
      },
      csv: {
        content_type: 'text/csv',
        headers: ['kodepos', 'province', 'city', 'district', 'village', 'latitude', 'longitude', 'elevation', 'timezone'],
        example: 'kodepos,province,city,district,village,latitude,longitude,elevation,timezone\n10110,DKI Jakarta,Jakarta Pusat,Menteng,Menteng,-6.1944,106.8229,10,Asia/Jakarta',
        description: 'CSV format with headers in first row'
      }
    };

    return c.json(createImportApiResponse(true, templates));

  } catch (error) {
    console.error('Import templates error:', error);
    return c.json(createImportApiResponse(false, undefined, 'Templates fetch failed', error instanceof Error ? error.message : 'Unknown error'), 500);
  }
});

export default importRouter;