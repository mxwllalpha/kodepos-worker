/**
 * Unit Tests for KodeposService
 * Tests core postal code data operations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KodeposService } from '../../src/services/kodepos.service';
import type { KodeposData } from '../../src/types/kodepos';
import { mockD1Database, mockPostalData } from '../setup';

describe('KodeposService', () => {
  let kodeposService: KodeposService;
  let mockDb: any;

  beforeEach(() => {
    mockDb = { ...mockD1Database };
    kodeposService = new KodeposService(mockDb);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('search', () => {
    it('should return search results with valid query', async () => {
      // Mock database response
      mockDb.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({
            results: mockPostalData
          })
        })
      });

      const result = await kodeposService.search({ search: 'Jambi' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPostalData);
      expect(result.total).toBe(2);
      expect(result.query_time_ms).toBeDefined();
    });

    it('should handle empty search results', async () => {
      mockDb.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({
            results: []
          })
        })
      });

      const result = await kodeposService.search({ search: 'Unknown' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should build query with multiple filters', async () => {
      mockDb.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({
            results: [mockPostalData[0]]
          })
        })
      });

      const result = await kodeposService.search({
        province: 'Jambi',
        regency: 'Sungai Penuh',
        code: '10110'
      });

      expect(result.success).toBe(true);
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('AND province = ? AND regency = ? AND code = ?')
      );
    });

    it('should handle database errors gracefully', async () => {
      mockDb.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockRejectedValue(new Error('Database connection failed'))
        })
      });

      const result = await kodeposService.search({ search: 'test' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Database connection failed');
    });

    it('should handle SQL injection attempts safely', async () => {
      const maliciousInput = "'; DROP TABLE postal_codes; --";
      mockDb.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({
            results: []
          })
        })
      });

      const result = await kodeposService.search({ search: maliciousInput });

      expect(result.success).toBe(true);
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('LOWER(province) LIKE LOWER(?)')
      );
      // Verify parameterized queries are used
      expect(mockDb.prepare().bind).toHaveBeenCalledWith(
        expect.stringContaining(maliciousInput)
      );
    });

    it('should limit results to 100 records', async () => {
      mockDb.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({
            results: mockPostalData
          })
        })
      });

      await kodeposService.search({ search: 'test' });

      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT 100')
      );
    });
  });

  describe('detectLocation', () => {
    it('should detect location by coordinates', async () => {
      const mockLocationData = {
        province: 'Jambi',
        regency: 'Sungai Penuh',
        district: 'Ketapang',
        village: 'Petonggan',
        code: '10110',
        latitude: -2.0374,
        longitude: 101.6543,
        distance_km: 0.5
      };

      mockDb.prepare.mockImplementation((query: string) => {
        if (query.includes('location_cache')) {
          return {
            bind: vi.fn().mockReturnValue({
              first: vi.fn().mockResolvedValue(null)
            })
          };
        }
        return {
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue({
              ...mockLocationData,
              elevation: 100,
              timezone: 'Asia/Jakarta'
            })
          })
        };
      });

      const result = await kodeposService.detectLocation(-2.0374, 101.6543, 1.0);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        ...mockLocationData,
        elevation: 100,
        timezone: 'Asia/Jakarta'
      });
      expect(result.cached).toBe(false);
    });

    it('should return cached location when available', async () => {
      const cachedData = {
        province: 'Jambi',
        regency: 'Sungai Penuh',
        district: 'Ketapang',
        village: 'Petonggan',
        code: '10110',
        latitude: -2.0374,
        longitude: 101.6543
      };

      mockDb.prepare.mockImplementation((query: string) => {
        if (query.includes('location_cache')) {
          return {
            bind: vi.fn().mockReturnValue({
              first: vi.fn().mockResolvedValue({
                result_data: JSON.stringify(cachedData)
              })
            })
          };
        }
        return {
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue(null)
          })
        };
      });

      const result = await kodeposService.detectLocation(-2.0374, 101.6543, 1.0);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(cachedData);
      expect(result.cached).toBe(true);
    });

    it('should handle location not found', async () => {
      mockDb.prepare.mockImplementation(() => ({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null)
        })
      }));

      const result = await kodeposService.detectLocation(0, 0, 1.0);

      expect(result.success).toBe(false);
      expect(result.message).toBe('No location found within specified radius');
    });

    it('should validate coordinate inputs', async () => {
      const result1 = await kodeposService.detectLocation(NaN, 101.6543, 1.0);
      const result2 = await kodeposService.detectLocation(-2.0374, Infinity, 1.0);

      // Should handle gracefully through database error
      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
    });

    it('should cache detection results for 24 hours', async () => {
      const mockLocationData = {
        province: 'Jambi',
        regency: 'Sungai Penuh',
        district: 'Ketapang',
        village: 'Petonggan',
        code: '10110',
        latitude: -2.0374,
        longitude: 101.6543,
        distance_km: 0.5
      };

      const mockCacheSave = vi.fn();
      mockDb.prepare.mockImplementation((query: string) => {
        if (query.includes('INSERT OR REPLACE INTO location_cache')) {
          return {
            bind: vi.fn().mockReturnValue({
              run: mockCacheSave
            })
          };
        }
        return {
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue(null) // No cache hit
          })
        };
      });

      // Mock the second call to return location data
      let callCount = 0;
      mockDb.prepare.mockImplementation((query: string) => {
        callCount++;
        if (query.includes('location_cache')) {
          if (callCount === 1) {
            return {
              bind: vi.fn().mockReturnValue({
                first: vi.fn().mockResolvedValue(null) // No cache hit
              })
            };
          }
          return {
            bind: vi.fn().mockReturnValue({
              run: vi.fn()
            })
          };
        }
        if (query.includes('HAVING distance_km')) {
          return {
            bind: vi.fn().mockReturnValue({
              first: vi.fn().mockResolvedValue(mockLocationData)
            })
          };
        }
        return {
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue(null)
          })
        };
      });

      await kodeposService.detectLocation(-2.0374, 101.6543, 1.0);

      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO location_cache')
      );
    });
  });

  describe('findByCoordinates', () => {
    it('should find locations within radius', async () => {
      mockDb.prepare.mockImplementation(() => ({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({
            results: mockPostalData
          })
        })
      }));

      const result = await kodeposService.findByCoordinates(-2.0374, 101.6543, 5.0);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPostalData);
      expect(result.total).toBe(2);
    });

    it('should return cached coordinates when available', async () => {
      mockDb.prepare.mockImplementation((query: string) => {
        if (query.includes('location_cache')) {
          return {
            bind: vi.fn().mockReturnValue({
              first: vi.fn().mockResolvedValue({
                result_data: JSON.stringify(mockPostalData)
              })
            })
          };
        }
        return {
          bind: vi.fn().mockReturnValue({
            all: vi.fn().mockResolvedValue({
              results: []
            })
          })
        };
      });

      const result = await kodeposService.findByCoordinates(-2.0374, 101.6543, 5.0);

      expect(result.success).toBe(true);
      expect(result.cached).toBe(true);
    });

    it('should limit nearby results to 50 records', async () => {
      mockDb.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({
            results: mockPostalData
          })
        })
      });

      await kodeposService.findByCoordinates(-2.0374, 101.6543, 5.0);

      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT 50')
      );
    });
  });

  describe('getProvinces', () => {
    it('should return unique provinces', async () => {
      const mockProvinces = [
        { province: 'Jambi' },
        { province: 'Jakarta' },
        { province: 'Sumatera Barat' }
      ];

      mockDb.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({
            results: mockProvinces
          })
        })
      });

      const result = await kodeposService.getProvinces();

      expect(result).toEqual(['Jambi', 'Jakarta', 'Sumatera Barat']);
    });

    it('should handle empty provinces list', async () => {
      mockDb.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({
            results: []
          })
        })
      });

      const result = await kodeposService.getProvinces();

      expect(result).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      mockDb.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockRejectedValue(new Error('Database error'))
        })
      });

      const result = await kodeposService.getProvinces();

      expect(result).toEqual([]);
    });
  });

  describe('getCities', () => {
    it('should return cities in specified province', async () => {
      const mockCities = [
        { regency: 'Sungai Penuh' },
        { regency: 'Kota Jambi' }
      ];

      mockDb.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({
            results: mockCities
          })
        })
      });

      const result = await kodeposService.getCities('Jambi');

      expect(result).toEqual(['Sungai Penuh', 'Kota Jambi']);
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('WHERE LOWER(province) = LOWER(?)')
      );
      expect(mockDb.prepare().bind).toHaveBeenCalledWith('Jambi');
    });

    it('should handle case insensitive province matching', async () => {
      mockDb.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({
            results: [{ regency: 'Kota Jambi' }]
          })
        })
      });

      const result = await kodeposService.getCities('jambi');

      expect(result).toEqual(['Kota Jambi']);
    });

    it('should handle empty cities list', async () => {
      mockDb.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({
            results: []
          })
        })
      });

      const result = await kodeposService.getCities('Unknown Province');

      expect(result).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('should return database statistics', async () => {
      const mockStats = {
        count: 83761
      };

      mockDb.prepare.mockReturnValue({
        first: vi.fn().mockResolvedValue(mockStats)
      });

      const result = await kodeposService.getStats();

      expect(result.total_records).toBe(83761);
      expect(result.provinces).toBe(83761);
      expect(result.cities).toBe(83761);
      expect(result.districts).toBe(83761);
      expect(result.villages).toBe(83761);
    });

    it('should handle stats database errors', async () => {
      mockDb.prepare.mockReturnValue({
        first: vi.fn().mockRejectedValue(new Error('Stats query failed'))
      });

      const result = await kodeposService.getStats();

      expect(result.total_records).toBe(0);
      expect(result.provinces).toBe(0);
      expect(result.cities).toBe(0);
      expect(result.districts).toBe(0);
      expect(result.villages).toBe(0);
    });
  });

  describe('bulkInsert', () => {
    it('should insert data in batches', async () => {
      const mockData: KodeposData[] = [
        {
          id: 1,
          code: 10110,
          village: 'Petonggan',
          district: 'Ketapang',
          regency: 'Sungai Penuh',
          province: 'Jambi',
          latitude: -2.0374,
          longitude: 101.6543
        }
      ];

      mockDb.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          run: vi.fn().mockResolvedValue({ success: true })
        })
      });

      const result = await kodeposService.bulkInsert(mockData);

      expect(result.success).toBe(true);
      expect(result.inserted).toBe(1);
      expect(result.errors).toEqual([]);
    });

    it('should handle batch insert errors', async () => {
      const mockData: KodeposData[] = [
        {
          id: 1,
          code: 10110,
          village: 'Petonggan',
          district: 'Ketapang',
          regency: 'Sungai Penuh',
          province: 'Jambi',
          latitude: -2.0374,
          longitude: 101.6543
        }
      ];

      mockDb.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          run: vi.fn().mockRejectedValue(new Error('Insert failed'))
        })
      });

      const result = await kodeposService.bulkInsert(mockData);

      expect(result.success).toBe(false);
      expect(result.inserted).toBe(0);
      expect(result.errors.length).toBe(1);
    });
  });

  describe('cleanExpiredCache', () => {
    it('should clean expired cache entries', async () => {
      mockDb.prepare.mockReturnValue({
        run: vi.fn().mockResolvedValue({
          meta: { changes: 5 }
        })
      });

      const result = await kodeposService.cleanExpiredCache();

      expect(result).toBe(5);
    });

    it('should handle cache cleaning errors', async () => {
      mockDb.prepare.mockReturnValue({
        run: vi.fn().mockRejectedValue(new Error('Cache cleanup failed'))
      });

      const result = await kodeposService.cleanExpiredCache();

      expect(result).toBe(0);
    });
  });
});