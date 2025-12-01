/**
 * Import Routes Tests
 * Integration tests for import API endpoints
 *
 * @author Maxwell Alpha
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import importRouter from '../../../src/routes/import';
import type { D1Database } from '@cloudflare/workers-types';
import type { Env } from '../../../src/types/kodepos';

// Mock environment
const mockEnv: Env = {
  KODEPOS_DB: null as any
};

const mockDb = {
  prepare: vi.fn(),
  batch: vi.fn(),
  exec: vi.fn()
} as unknown as D1Database;

mockEnv.KODEPOS_DB = mockDb;

// Create test app
const app = new Hono<{ Bindings: Env }>();
app.route('/api/v1/import', importRouter);

describe('Import Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/import/upload', () => {
    it('should successfully upload and process JSON file', async () => {
      const fileContent = JSON.stringify([
        {
          kodepos: '10110',
          province: 'DKI Jakarta',
          city: 'Jakarta Pusat',
          district: 'Menteng',
          village: 'Menteng'
        }
      ]);

      const formData = new FormData();
      formData.append('file', new File([fileContent], 'test.json', { type: 'application/json' }));
      formData.append('configuration', JSON.stringify({
        duplicate_strategy: 'skip',
        batch_size: 100
      }));

      // Mock database operations
      mockDb.prepare = vi.fn().mockReturnValue({
        bind: vi.fn().mockResolvedValue({
          meta: { changes: 1 },
          results: []
        })
      });

      const request = new Request('http://localhost/api/v1/import/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const response = await app.request(request, mockEnv);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should reject file larger than 10MB', async () => {
      const largeFile = 'x'.repeat(11 * 1024 * 1024); // 11MB
      const formData = new FormData();
      formData.append('file', new File([largeFile], 'large.json', { type: 'application/json' }));

      const request = new Request('http://localhost/api/v1/import/upload', {
        method: 'POST',
        body: formData
      });

      const response = await app.request(request, mockEnv);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toContain('File size exceeds 10MB limit');
    });

    it('should reject unsupported file types', async () => {
      const formData = new FormData();
      formData.append('file', new File(['test'], 'test.txt', { type: 'text/plain' }));

      const request = new Request('http://localhost/api/v1/import/upload', {
        method: 'POST',
        body: formData
      });

      const response = await app.request(request, mockEnv);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toContain('File type text/plain not allowed');
    });

    it('should handle missing file', async () => {
      const formData = new FormData();

      const request = new Request('http://localhost/api/v1/import/upload', {
        method: 'POST',
        body: formData
      });

      const response = await app.request(request, mockEnv);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toBe('No file uploaded');
    });
  });

  describe('GET /api/v1/import/status/:jobId', () => {
    it('should return job status successfully', async () => {
      const mockJob = {
        id: 'job-123',
        filename: 'test.json',
        status: 'processing',
        total_records: 100,
        processed_records: 50,
        successful_records: 45,
        failed_records: 5,
        duplicate_records: 0,
        processing_time_ms: 5000,
        created_at: '2025-12-01T12:00:00.000Z',
        updated_at: '2025-12-01T12:00:05.000Z'
      };

      mockDb.prepare = vi.fn().mockReturnValue({
        bind: vi.fn().mockResolvedValue({
          results: [mockJob]
        })
      });

      const request = new Request('http://localhost/api/v1/import/status/job-123', {
        method: 'GET'
      });

      const response = await app.request(request, mockEnv);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.progress_percentage).toBe(50);
    });

    it('should handle non-existent job', async () => {
      mockDb.prepare = vi.fn().mockReturnValue({
        bind: vi.fn().mockResolvedValue({
          results: []
        })
      });

      const request = new Request('http://localhost/api/v1/import/status/non-existent', {
        method: 'GET'
      });

      const response = await app.request(request, mockEnv);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Import job not found');
    });
  });

  describe('GET /api/v1/import/history', () => {
    it('should return paginated job history', async () => {
      const mockJobs = [
        { id: 'job-1', status: 'completed' },
        { id: 'job-2', status: 'processing' }
      ];

      mockDb.prepare = vi.fn().mockImplementation((query) => {
        if (query.includes('SELECT * FROM import_jobs')) {
          return {
            bind: vi.fn().mockResolvedValue({
              results: mockJobs
            })
          };
        }
        if (query.includes('SELECT COUNT(*) as count')) {
          return {
            bind: vi.fn().mockResolvedValue({
              results: [{ count: 2 }]
            })
          };
        }
        return { bind: vi.fn() };
      });

      const request = new Request('http://localhost/api/v1/import/history?page=1&per_page=10', {
        method: 'GET'
      });

      const response = await app.request(request, mockEnv);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.jobs).toHaveLength(2);
      expect(result.data.total_count).toBe(2);
      expect(result.data.page).toBe(1);
      expect(result.data.per_page).toBe(10);
    });

    it('should filter by status', async () => {
      mockDb.prepare = vi.fn().mockReturnValue({
        bind: vi.fn().mockResolvedValue({
          results: [{ id: 'job-1', status: 'completed' }],
          results: [{ count: 1 }]
        })
      });

      const request = new Request('http://localhost/api/v1/import/history?status=completed', {
        method: 'GET'
      });

      const response = await app.request(request, mockEnv);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
    });
  });

  describe('POST /api/v1/import/validate', () => {
    it('should validate import data successfully', async () => {
      const validationData = {
        data: [
          {
            kodepos: '10110',
            province: 'DKI Jakarta',
            city: 'Jakarta Pusat',
            district: 'Menteng',
            village: 'Menteng'
          }
        ],
        configuration: {
          validate_coordinates: true
        }
      };

      mockDb.prepare = vi.fn().mockReturnValue({
        bind: vi.fn().mockResolvedValue({
          meta: { changes: 1 },
          results: []
        })
      });

      const request = new Request('http://localhost/api/v1/import/validate', {
        method: 'POST',
        body: JSON.stringify(validationData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await app.request(request, mockEnv);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.total_records).toBe(1);
      expect(result.data.valid_records).toBe(1);
    });

    it('should handle invalid request body', async () => {
      const invalidData = {
        data: 'not an array'
      };

      const request = new Request('http://localhost/api/v1/import/validate', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await app.request(request, mockEnv);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/import/cancel/:jobId', () => {
    it('should cancel running job successfully', async () => {
      const mockJob = {
        id: 'job-123',
        status: 'processing'
      };

      mockDb.prepare = vi.fn().mockReturnValue({
        bind: vi.fn().mockResolvedValue({
          results: [mockJob],
          meta: { changes: 1 }
        })
      });

      const request = new Request('http://localhost/api/v1/import/cancel/job-123', {
        method: 'DELETE'
      });

      const response = await app.request(request, mockEnv);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.cancelled).toBe(true);
    });

    it('should not cancel completed job', async () => {
      const mockJob = {
        id: 'job-123',
        status: 'completed'
      };

      mockDb.prepare = vi.fn().mockReturnValue({
        bind: vi.fn().mockResolvedValue({
          results: [mockJob]
        })
      });

      const request = new Request('http://localhost/api/v1/import/cancel/job-123', {
        method: 'DELETE'
      });

      const response = await app.request(request, mockEnv);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot cancel job');
    });
  });

  describe('GET /api/v1/import/statistics', () => {
    it('should return import system statistics', async () => {
      const mockStats = [
        { count: 100 }, // total jobs
        { count: 80 },  // successful jobs
        { count: 15 },  // failed jobs
        { count: 5 },   // active jobs
        { avg_time: 5000 }, // avg processing time
        { completed_at: '2025-12-01T12:00:00.000Z' }, // last import
        { total: 10000 } // total records
      ];

      mockDb.prepare = vi.fn().mockReturnValue({
        bind: vi.fn().mockResolvedValue({
          results: mockStats.map(stat => [stat])
        })
      });

      const request = new Request('http://localhost/api/v1/import/statistics', {
        method: 'GET'
      });

      const response = await app.request(request, mockEnv);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.total_jobs).toBe(100);
      expect(result.data.successful_jobs).toBe(80);
      expect(result.data.failed_jobs).toBe(15);
      expect(result.data.active_jobs).toBe(5);
    });
  });

  describe('GET /api/v1/import/config', () => {
    it('should return default import configuration', async () => {
      const request = new Request('http://localhost/api/v1/import/config', {
        method: 'GET'
      });

      const response = await app.request(request, mockEnv);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.duplicate_strategy).toBe('skip');
      expect(result.data.batch_size).toBe(1000);
      expect(result.data.validate_coordinates).toBe(true);
      expect(result.data.skip_invalid_records).toBe(true);
    });
  });

  describe('GET /api/v1/import/templates', () => {
    it('should return import file templates', async () => {
      const request = new Request('http://localhost/api/v1/import/templates', {
        method: 'GET'
      });

      const response = await app.request(request, mockEnv);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.json).toBeDefined();
      expect(result.data.csv).toBeDefined();
      expect(result.data.json.content_type).toBe('application/json');
      expect(result.data.csv.content_type).toBe('text/csv');
    });
  });
});