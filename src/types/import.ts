/**
 * Import System Type Definitions
 * Types for database import functionality with comprehensive job tracking
 *
 * @author Maxwell Alpha
 * @website https://github.com/mxwllalpha
 */

export type ImportStatus = 'pending' | 'processing' | 'validating' | 'transforming' | 'inserting' | 'completed' | 'failed' | 'cancelled';
export type ValidationSeverity = 'error' | 'warning' | 'info';
export type DuplicateStrategy = 'skip' | 'update' | 'error';
export type ProcessingPhase = 'validation' | 'transformation' | 'insertion' | 'completion';
export type ContentType = 'application/json' | 'text/csv' | 'application/vnd.ms-excel';

/**
 * Import job configuration options
 */
export interface ImportConfiguration {
  duplicate_strategy: DuplicateStrategy;
  batch_size: number;
  validate_coordinates: boolean;
  skip_invalid_records: boolean;
  notification_email?: string;
  custom_validation_rules?: Record<string, unknown>;
}

/**
 * Import job metadata and tracking information
 */
export interface ImportJob {
  id: string;
  filename: string;
  file_size: number;
  content_type: ContentType;
  status: ImportStatus;
  total_records: number;
  processed_records: number;
  successful_records: number;
  failed_records: number;
  duplicate_records: number;
  started_at?: string;
  completed_at?: string;
  processing_time_ms: number;
  error_message?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Import validation result for individual records
 */
export interface ImportValidationResult {
  id: string;
  job_id: string;
  row_number: number;
  record_data: string; // JSON string of original record
  validation_errors: string; // JSON array of validation errors
  severity: ValidationSeverity;
  created_at: string;
}

/**
 * Import operation statistics for performance monitoring
 */
export interface ImportStatistics {
  id: string;
  job_id: string;
  processing_phase: ProcessingPhase;
  operation_type: string;
  records_count: number;
  execution_time_ms: number;
  memory_usage_kb?: number;
  cache_hits: number;
  cache_misses: number;
  created_at: string;
}

/**
 * Import file upload response
 */
export interface ImportUploadResponse {
  success: boolean;
  job_id?: string;
  filename?: string;
  total_records?: number;
  estimated_duration?: number; // in seconds
  message?: string;
  error?: string;
}

/**
 * Import job status response
 */
export interface ImportStatusResponse {
  success: boolean;
  job?: ImportJob;
  progress_percentage?: number;
  estimated_remaining_time?: number; // in seconds
  current_phase?: ProcessingPhase;
  message?: string;
  error?: string;
}

/**
 * Import job list response
 */
export interface ImportJobListResponse {
  success: boolean;
  jobs?: ImportJob[];
  total_count?: number;
  page?: number;
  per_page?: number;
  total_pages?: number;
  message?: string;
  error?: string;
}

/**
 * Import validation request
 */
export interface ImportValidationRequest {
  data: Record<string, string | number | boolean>[];
  configuration: Partial<ImportConfiguration>;
}

/**
 * Import validation response
 */
export interface ImportValidationResponse {
  success: boolean;
  validation_results?: ImportValidationResult[];
  total_records: number;
  valid_records: number;
  invalid_records: number;
  duplicate_records: number;
  estimated_import_time?: number; // in seconds
  message?: string;
  error?: string;
}

/**
 * Import progress update
 */
export interface ImportProgressUpdate {
  job_id: string;
  status: ImportStatus;
  processed_records: number;
  successful_records: number;
  failed_records: number;
  duplicate_records: number;
  current_phase?: ProcessingPhase;
  progress_percentage: number;
  estimated_remaining_time?: number; // in seconds
}

/**
 * Import file format validation
 */
export interface ImportFileValidation {
  is_valid: boolean;
  content_type: ContentType;
  total_records: number;
  has_required_headers: boolean;
  sample_records: Record<string, string | number | boolean>[];
  validation_errors: string[];
}

/**
 * Import operation result
 */
export interface ImportOperationResult {
  success: boolean;
  job_id: string;
  processed_records: number;
  successful_records: number;
  failed_records: number;
  duplicate_records: number;
  processing_time_ms: number;
  errors?: string[];
  warnings?: string[];
}

/**
 * Import statistics summary
 */
export interface ImportStatisticsSummary {
  total_jobs: number;
  successful_jobs: number;
  failed_jobs: number;
  total_records_processed: number;
  average_processing_time_ms: number;
  last_import_date?: string;
  active_jobs: number;
}

/**
 * Import history request parameters
 */
export interface ImportHistoryRequest {
  status?: ImportStatus;
  date_from?: string; // ISO 8601 date
  date_to?: string;   // ISO 8601 date
  created_by?: string;
  page?: number;
  per_page?: number;
  sort_by?: 'created_at' | 'completed_at' | 'processing_time_ms';
  sort_order?: 'asc' | 'desc';
}

/**
 * Import cache key generation
 */
export interface ImportCacheKey {
  type: 'validation' | 'statistics' | 'job_status';
  job_id?: string;
  identifier?: string;
  timestamp?: number;
}

/**
 * Import error details
 */
export interface ImportError {
  code: string;
  message: string;
  field?: string;
  row_number?: number;
  record_data?: Record<string, string | number | boolean>;
  severity: ValidationSeverity;
}

/**
 * Import batch processing configuration
 */
export interface ImportBatchConfig {
  batch_size: number;
  max_concurrent_batches: number;
  retry_attempts: number;
  retry_delay_ms: number;
  timeout_ms: number;
}

/**
 * Import notification settings
 */
export interface ImportNotificationSettings {
  send_on_completion: boolean;
  send_on_failure: boolean;
  send_on_warning: boolean;
  email_recipients: string[];
  webhook_url?: string;
  custom_template?: string;
}