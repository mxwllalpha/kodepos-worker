/**
 * Integration Tests for API Endpoints
 * Tests complete request/response cycles
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import app from '../../src/index';
import { mockD1Database, mockPostalData, createMockContext, mockHealthStats } from '../setup';

describe('API Integration Tests', () => {
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

  describe('Health Endpoints', () => {
    it('should return basic health check', async () => {
      mockD1Database.prepare.mockReturnValue({
        first: vi.fn().mockResolvedValue({ id: 1 })
      });

      const request = new Request('http://localhost/health');
      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.version).toBe('1.0.0');
      expect(data.database).toBe('connected');
      expect(data.cache_enabled).toBe(true);
    });

    it('should return unhealthy status when database fails', async () => {
      mockD1Database.prepare.mockReturnValue({
        first: vi.fn().mockRejectedValue(new Error('Database connection failed'))
      });

      const request = new Request('http://localhost/health');
      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('unhealthy');
      expect(data.database).toBe('error');
    });

    it('should return detailed health check with stats', async () => {
      mockD1Database.prepare.mockImplementation((query: string) => {
        if (query.includes('SELECT 1')) {
          return {
            first: vi.fn().mockResolvedValue({ id: 1 })
          };
        }
        return {
          first: vi.fn().mockResolvedValue(mockHealthStats)
        };
      });

      const request = new Request('http://localhost/health/detailed');
      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.total_records).toBe(mockHealthStats.total_records);
      expect(data.version).toBe('1.0.0');
    });
  });

  describe('Search API - /api/v1/search', () => {
    it('should search postal codes successfully', async () => {
      mockD1Database.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({
            results: mockPostalData
          })
        })
      });

      const request = new Request('http://localhost/api/v1/search?search=Jambi');
      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockPostalData);
      expect(data.message).toContain('found');
      expect(data.timestamp).toBeDefined();
      expect(data.version).toBe('1.0.0');
    });

    it('should search by specific postal code', async () => {
      mockD1Database.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({
            results: [mockPostalData[0]]
          })
        })
      });

      const request = new Request('http://localhost/api/v1/search?kodepos=10110');
      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
    });

    it('should handle search with no results', async () => {
      mockD1Database.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({
            results: []
          })
        })
      });

      const request = new Request('http://localhost/api/v1/search?search=Unknown');
      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });

    it('should handle database errors in search', async () => {
      mockD1Database.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockRejectedValue(new Error('Database error'))
        })
      });

      const request = new Request('http://localhost/api/v1/search?search=test');
      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Search failed');
    });

    it('should handle complex search queries', async () => {
      mockD1Database.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({
            results: mockPostalData
          })
        })
      });

      const request = new Request(
        'http://localhost/api/v1/search?provinsi=Jambi&kota=Sungai%20Penuh&kecamatan=Ketapang'
      );
      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify proper parameter binding
      expect(mockD1Database.prepare).toHaveBeenCalledWith(
        expect.stringContaining('LOWER(province) LIKE LOWER(?)')
      );
    });
  });

  describe('Location Detection API - /api/v1/detect', () => {
    it('should detect location by coordinates', async () => {
      const mockLocationData = {
        province: 'Jambi',
        regency: 'Sungai Penuh',
        district: 'Ketapang',
        village: 'Petonggan',
        code: '10110',
        latitude: -2.0374,
        longitude: 101.6543,
        distance_km: 0.5,
        elevation: 100,
        timezone: 'WIB'
      };

      mockD1Database.prepare.mockImplementation((query: string) => {
        if (query.includes('location_cache')) {
          return {
            bind: vi.fn().mockReturnValue({
              first: vi.fn().mockResolvedValue(null) // No cache hit
            })
          };
        }
        return {
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue(mockLocationData)
          })
        };
      });

      const request = new Request(
        'http://localhost/api/v1/detect?latitude=-2.0374&longitude=101.6543'
      );
      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockLocationData);
    });

    it('should handle missing coordinates', async () => {
      const request = new Request('http://localhost/api/v1/detect?latitude=-2.0374');
      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Missing required parameters: latitude and longitude');
    });

    it('should handle invalid coordinates', async () => {
      const request = new Request(
        'http://localhost/api/v1/detect?latitude=invalid&longitude=101.6543'
      );
      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid coordinates');
    });

    it('should handle location not found', async () => {
      mockD1Database.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null)
        })
      });

      const request = new Request(
        'http://localhost/api/v1/detect?latitude=0&longitude=0'
      );
      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Location detection failed');
    });

    it('should handle custom radius parameter', async () => {
      const request = new Request(
        'http://localhost/api/v1/detect?latitude=-2.0374&longitude=101.6543&radius=5.0'
      );

      mockD1Database.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null)
        })
      });

      const response = await app.fetch(request, mockEnv);

      // Should handle radius parameter properly in query
      expect(mockD1Database.prepare).toHaveBeenCalledWith(
        expect.stringContaining('HAVING distance_km <= ?')
      );
    });
  });

  describe('Nearby Search API - /api/v1/nearby', () => {
    it('should find nearby postal codes', async () => {
      mockD1Database.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({
            results: mockPostalData
          })
        })
      });

      const request = new Request(
        'http://localhost/api/v1/nearby?latitude=-2.0374&longitude=101.6543'
      );
      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockPostalData);
    });

    it('should handle missing coordinates for nearby search', async () => {
      const request = new Request('http://localhost/api/v1/nearby?latitude=-2.0374');
      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Missing required parameters: latitude and longitude');
    });

    it('should handle custom radius in nearby search', async () => {
      const request = new Request(
        'http://localhost/api/v1/nearby?latitude=-2.0374&longitude=101.6543&radius=10.0'
      );

      mockD1Database.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({
            results: []
          })
        })
      });

      const response = await app.fetch(request, mockEnv);

      // Should use radius in query
      expect(mockD1Database.prepare).toHaveBeenCalledWith(
        expect.stringContaining('HAVING distance_km <= ?')
      );
    });
  });

  describe('Provinces API - /api/v1/provinces', () => {
    it('should return list of provinces', async () => {
      const mockProvinces = ['Jambi', 'Jakarta', 'Sumatera Barat'];
      mockD1Database.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({
            results: mockProvinces.map(p => ({ province: p }))
          })
        })
      });

      const request = new Request('http://localhost/api/v1/provinces');
      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockProvinces);
    });

    it('should handle empty provinces list', async () => {
      mockD1Database.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({
            results: []
          })
        })
      });

      const request = new Request('http://localhost/api/v1/provinces');
      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });

    it('should handle database errors in provinces endpoint', async () => {
      mockD1Database.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockRejectedValue(new Error('Database error'))
        })
      });

      const request = new Request('http://localhost/api/v1/provinces');
      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch provinces');
    });
  });

  describe('Cities API - /api/v1/cities/:province', () => {
    it('should return cities for a province', async () => {
      const mockCities = ['Sungai Penuh', 'Kota Jambi'];
      mockD1Database.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({
            results: mockCities.map(c => ({ regency: c }))
          })
        })
      });

      const request = new Request('http://localhost/api/v1/cities/Jambi');
      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockCities);
    });

    it('should handle case insensitive province matching', async () => {
      mockD1Database.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({
            results: [{ regency: 'Kota Jambi' }]
          })
        })
      });

      const request = new Request('http://localhost/api/v1/cities/jambi');
      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockD1Database.prepare().bind).toHaveBeenCalledWith('jambi');
    });

    it('should handle empty cities for province', async () => {
      mockD1Database.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({
            results: []
          })
        })
      });

      const request = new Request('http://localhost/api/v1/cities/Unknown');
      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });
  });

  describe('Stats API - /api/v1/stats', () => {
    it('should return database statistics', async () => {
      mockD1Database.prepare.mockReturnValue({
        first: vi.fn().mockResolvedValue({ count: 1000 })
      });

      const request = new Request('http://localhost/api/v1/stats');
      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.total_records).toBe(1000);
      expect(data.data.provinces).toBe(1000);
      expect(data.data.cities).toBe(1000);
      expect(data.data.districts).toBe(1000);
      expect(data.data.villages).toBe(1000);
    });

    it('should handle stats database errors', async () => {
      mockD1Database.prepare.mockReturnValue({
        first: vi.fn().mockRejectedValue(new Error('Stats error'))
      });

      const request = new Request('http://localhost/api/v1/stats');
      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch statistics');
    });
  });

  describe('Legacy Compatibility Endpoints', () => {
    describe('/search - Legacy search', () => {
      it('should handle legacy search format', async () => {
        mockD1Database.prepare.mockReturnValue({
          bind: vi.fn().mockReturnValue({
            all: vi.fn().mockResolvedValue({
              results: mockPostalData
            })
          })
        });

        const request = new Request('http://localhost/search?q=Jambi');
        const response = await app.fetch(request, mockEnv);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.statusCode).toBe(200);
        expect(data.code).toBe('OK');
        expect(data.data).toBeDefined();
        expect(Array.isArray(data.data)).toBe(true);
      });

      it('should handle legacy search with no query parameter', async () => {
        const request = new Request('http://localhost/search');
        const response = await app.fetch(request, mockEnv);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.statusCode).toBe(400);
        expect(data.code).toBe('ERROR');
      });

      it('should handle legacy search with no results', async () => {
        mockD1Database.prepare.mockReturnValue({
          bind: vi.fn().mockReturnValue({
            all: vi.fn().mockResolvedValue({
              results: []
            })
          })
        });

        const request = new Request('http://localhost/search?q=Unknown');
        const response = await app.fetch(request, mockEnv);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.statusCode).toBe(404);
        expect(data.code).toBe('NOT_FOUND');
      });
    });

    describe('/detect - Legacy detect', () => {
      it('should handle legacy detect format', async () => {
        const mockLocationData = {
          province: 'Jambi',
          regency: 'Sungai Penuh',
          district: 'Ketapang',
          village: 'Petonggan',
          code: '10110',
          latitude: -2.0374,
          longitude: 101.6543,
          elevation: 100,
          timezone: 'WIB'
        };

        mockD1Database.prepare.mockReturnValue({
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue(mockLocationData)
          })
        });

        const request = new Request(
          'http://localhost/detect?latitude=-2.0374&longitude=101.6543'
        );
        const response = await app.fetch(request, mockEnv);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.statusCode).toBe(200);
        expect(data.code).toBe('OK');
        expect(data.data.code).toBe(10110);
        expect(data.data.province).toBe('Jambi');
      });

      it('should handle legacy detect with invalid coordinates', async () => {
        const request = new Request('http://localhost/detect?latitude=invalid');
        const response = await app.fetch(request, mockEnv);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.statusCode).toBe(400);
        expect(data.code).toBe('ERROR');
      });
    });
  });

  describe('Root Endpoint', () => {
    it('should return API information', async () => {
      const request = new Request('http://localhost/');
      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('Kodepos Worker API');
      expect(data.version).toBe('1.0.0');
      expect(data.author).toBe('Maxwell Alpha');
      expect(data.endpoints).toBeDefined();
      expect(data.features).toBeDefined();
      expect(data.status).toBe('operational');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown endpoints', async () => {
      const request = new Request('http://localhost/unknown');
      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Not Found');
      expect(data.availableEndpoints).toBeDefined();
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers', async () => {
      const request = new Request('http://localhost/health', {
        method: 'OPTIONS'
      });
      const response = await app.fetch(request, mockEnv);

      expect(response.headers.get('access-control-allow-origin')).toBe('*');
      expect(response.headers.get('access-control-allow-methods')).toContain('GET');
      expect(response.headers.get('access-control-allow-headers')).toContain('Content-Type');
    });

    it('should handle preflight requests', async () => {
      const request = new Request('http://localhost/api/v1/search', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://example.com',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      const response = await app.fetch(request, mockEnv);

      expect(response.status).toBe(200);
      expect(response.headers.get('access-control-allow-origin')).toBe('*');
    });
  });

  describe('Content Type Headers', () => {
    it('should return JSON content type', async () => {
      mockD1Database.prepare.mockReturnValue({
        first: vi.fn().mockResolvedValue({ id: 1 })
      });

      const request = new Request('http://localhost/health');
      const response = await app.fetch(request, mockEnv);

      expect(response.headers.get('content-type')).toContain('application/json');
    });
  });

  describe('Rate Limiting Considerations', () => {
    it('should handle high frequency requests gracefully', async () => {
      mockD1Database.prepare.mockReturnValue({
        first: vi.fn().mockResolvedValue({ id: 1 })
      });

      // Simulate multiple rapid requests
      const requests = Array(10).fill(null).map(() =>
        new Request('http://localhost/health')
      );

      const responses = await Promise.all(
        requests.map(req => app.fetch(req, mockEnv))
      );

      // All should succeed without rate limiting issues
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});