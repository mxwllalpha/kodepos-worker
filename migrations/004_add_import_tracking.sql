-- Migration 004: Add Import Tracking Tables
-- Supports database import functionality with job tracking and status management

-- Import Jobs Table
-- Tracks import operations with status, timing, and statistics
CREATE TABLE IF NOT EXISTS import_jobs (
    id TEXT PRIMARY KEY,                    -- UUID v4 for job identification
    filename TEXT NOT NULL,                  -- Original filename
    file_size INTEGER NOT NULL,              -- File size in bytes
    content_type TEXT NOT NULL,              -- MIME type (application/json, text/csv)
    status TEXT NOT NULL DEFAULT 'pending',  -- Job status (pending, processing, completed, failed, cancelled)
    total_records INTEGER DEFAULT 0,         -- Total records in file
    processed_records INTEGER DEFAULT 0,     -- Records processed so far
    successful_records INTEGER DEFAULT 0,   -- Successfully imported records
    failed_records INTEGER DEFAULT 0,        -- Records that failed validation/insert
    duplicate_records INTEGER DEFAULT 0,     -- Records identified as duplicates
    started_at TIMESTAMP,                    -- Job start timestamp
    completed_at TIMESTAMP,                  -- Job completion timestamp
    processing_time_ms INTEGER DEFAULT 0,    -- Total processing time in milliseconds
    error_message TEXT,                      -- Error details if job failed
    created_by TEXT,                        -- User or system that initiated import
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Import Validation Results Table
-- Stores detailed validation errors for failed records
CREATE TABLE IF NOT EXISTS import_validation_results (
    id TEXT PRIMARY KEY,                    -- UUID for validation result
    job_id TEXT NOT NULL,                    -- Reference to import job
    row_number INTEGER NOT NULL,             -- Row number in original file
    record_data TEXT NOT NULL,               -- Original record data (JSON)
    validation_errors TEXT NOT NULL,         -- Validation error details (JSON)
    severity TEXT NOT NULL DEFAULT 'error',  -- Error severity (error, warning, info)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES import_jobs(id) ON DELETE CASCADE
);

-- Import Statistics Table
-- Aggregated statistics for import operations and performance monitoring
CREATE TABLE IF NOT EXISTS import_statistics (
    id TEXT PRIMARY KEY,                    -- UUID for statistic record
    job_id TEXT NOT NULL,                    -- Reference to import job
    processing_phase TEXT NOT NULL,           -- Import phase (validation, transformation, insertion)
    operation_type TEXT NOT NULL,             -- Operation type (batch_insert, validation, duplicate_check)
    records_count INTEGER NOT NULL,          -- Number of records processed
    execution_time_ms INTEGER NOT NULL,      -- Execution time in milliseconds
    memory_usage_kb INTEGER,                -- Memory usage in kilobytes
    cache_hits INTEGER DEFAULT 0,            -- Number of cache hits
    cache_misses INTEGER DEFAULT 0,          -- Number of cache misses
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES import_jobs(id) ON DELETE CASCADE
);

-- Import Configuration Table
-- Stores import job configuration and preferences
CREATE TABLE IF NOT EXISTS import_configuration (
    id TEXT PRIMARY KEY,                    -- UUID for configuration
    job_id TEXT NOT NULL,                    -- Reference to import job
    duplicate_strategy TEXT NOT NULL DEFAULT 'skip', -- How to handle duplicates (skip, update, error)
    batch_size INTEGER NOT NULL DEFAULT 1000, -- Batch processing size
    validate_coordinates BOOLEAN NOT NULL DEFAULT 1, -- Whether to validate coordinates
    skip_invalid_records BOOLEAN NOT NULL DEFAULT 1, -- Skip invalid records instead of failing
    notification_email TEXT,                 -- Email for completion notifications
    custom_validation_rules TEXT,           -- Custom validation rules (JSON)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES import_jobs(id) ON DELETE CASCADE
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_import_jobs_status ON import_jobs(status);
CREATE INDEX IF NOT EXISTS idx_import_jobs_created_at ON import_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_import_jobs_filename ON import_jobs(filename);
CREATE INDEX IF NOT EXISTS idx_import_validation_results_job_id ON import_validation_results(job_id);
CREATE INDEX IF NOT EXISTS idx_import_validation_results_severity ON import_validation_results(severity);
CREATE INDEX IF NOT EXISTS idx_import_statistics_job_id ON import_statistics(job_id);
CREATE INDEX IF NOT EXISTS idx_import_statistics_processing_phase ON import_statistics(processing_phase);

-- Create trigger for automatic updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_import_jobs_updated_at
    AFTER UPDATE ON import_jobs
    FOR EACH ROW
BEGIN
    UPDATE import_jobs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;