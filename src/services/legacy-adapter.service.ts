/**
 * Legacy Response Adapter Service
 * Transforms modern API responses to legacy format for compatibility
 *
 * @author Maxwell Alpha
 * @website https://github.com/mxwllalpha
 * @email mxwllalpha@gmail.com
 */

import type { KodeposData } from '../types/kodepos';

export interface LegacyPostalCode {
  code: string;
  village: string;
  district: string;
  regency: string;
  province: string;
  latitude: number;
  longitude: number;
  elevation: number | null;
  timezone: string;
}

export interface LegacyApiResponse<T = any> {
  statusCode: number;
  code: string;
  data: T;
}

export interface LegacyDetectResponse {
  statusCode: number;
  code: string;
  data: {
    code: number;
    village: string;
    district: string;
    regency: string;
    province: string;
    latitude: number;
    longitude: number;
    elevation: number;
    timezone: string;
    distance?: number;
  };
}

/**
 * Transform modern KodeposData to legacy format
 */
export function transformToLegacyFormat(data: KodeposData[]): LegacyPostalCode[] {
  return data.map(item => ({
    code: item.code?.toString() || '0',
    village: item.village || '',
    district: item.district || '',
    regency: item.regency || '',
    province: item.province || '',
    latitude: item.latitude || 0,
    longitude: item.longitude || 0,
    elevation: item.elevation || null,
    timezone: item.timezone || 'WIB'
  }));
}

/**
 * Transform modern data to legacy detect format
 */
export function transformToLegacyDetectFormat(item: any, distance?: number): LegacyDetectResponse['data'] {
  return {
    code: item.kodepos || item.code || 0,
    village: item.kelurahan || item.village || '',
    district: item.kecamatan || item.district || '',
    regency: item.kota || item.regency || '',
    province: item.provinsi || item.province || '',
    latitude: item.latitude || 0,
    longitude: item.longitude || 0,
    elevation: item.elevation || 0,
    timezone: item.timezone || 'WIB',
    distance: distance
  };
}

/**
 * Create successful legacy API response
 */
export function createLegacyResponse<T>(data: T, code: string = 'OK'): LegacyApiResponse<T> {
  return {
    statusCode: 200,
    code,
    data
  };
}

/**
 * Create error legacy API response
 */
export function createLegacyErrorResponse<T>(message: string, statusCode: number = 400): LegacyApiResponse<T> {
  return {
    statusCode,
    code: 'ERROR',
    data: [] as unknown as T
  };
}

/**
 * Create not found legacy API response
 */
export function createLegacyNotFoundResponse(message: string = 'Not found'): LegacyApiResponse<any> {
  return {
    statusCode: 404,
    code: 'NOT_FOUND',
    data: []
  };
}

/**
 * Create server error legacy API response
 */
export function createLegacyServerErrorResponse(message: string = 'Internal server error'): LegacyApiResponse<any> {
  return {
    statusCode: 500,
    code: 'SERVER_ERROR',
    data: []
  };
}

/**
 * Validate and transform search query parameters
 */
export function validateSearchQuery(query: string | null): { valid: boolean; error?: string; query?: string } {
  if (!query) {
    return { valid: false, error: 'Missing required parameter: q' };
  }

  // Clean and validate query
  const cleanedQuery = query.trim();
  if (!cleanedQuery) {
    return { valid: false, error: 'Query parameter cannot be empty' };
  }

  if (cleanedQuery.length > 100) {
    return { valid: false, error: 'Query parameter too long (max 100 characters)' };
  }

  return { valid: true, query: cleanedQuery };
}

/**
 * Validate coordinates
 */
export function validateCoordinates(lat: string | null, lng: string | null): {
  valid: boolean;
  error?: string;
  latitude?: number;
  longitude?: number
} {
  if (!lat || !lng) {
    return { valid: false, error: 'Missing required parameters: latitude and longitude' };
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return { valid: false, error: 'Invalid coordinates' };
  }

  // Validate Indonesian coordinate bounds
  if (latitude < -11 || latitude > 6) {
    return { valid: false, error: 'Latitude must be between -11 and 6 for Indonesian coordinates' };
  }

  if (longitude < 95 || longitude > 141) {
    return { valid: false, error: 'Longitude must be between 95 and 141 for Indonesian coordinates' };
  }

  return { valid: true, latitude, longitude };
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  }
  return `${Math.round(distanceKm)}km`;
}