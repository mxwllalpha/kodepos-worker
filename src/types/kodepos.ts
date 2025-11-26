/**
 * Kodepos API Types
 * Type definitions for Indonesian postal code data
 *
 * @author Maxwell Alpha
 * @website https://github.com/mxwlllph
 */

export interface KodeposData {
  id: string;
  kodepos: string;
  provinsi: string;
  kota: string;
  kecamatan: string;
  kelurahan: string;
  latitude?: number;
  longitude?: number;
}

export interface LocationQuery {
  search?: string;
  provinsi?: string;
  kota?: string;
  kecamatan?: string;
  kelurahan?: string;
  kodepos?: string;
}

export interface CoordinateQuery {
  latitude: number;
  longitude: number;
  radius_km?: number;
}

export interface KodeposResponse {
  success: boolean;
  data?: KodeposData | KodeposData[];
  message?: string;
  total?: number;
  query_time_ms?: number;
  cached?: boolean;
}

export interface DetectLocationResponse {
  success: boolean;
  data?: {
    provinsi: string;
    kota: string;
    kecamatan: string;
    kelurahan: string;
    kodepos: string;
    latitude: number;
    longitude: number;
  };
  message?: string;
  query_time_ms?: number;
  cached?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  version: string;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  database: 'connected' | 'error';
  total_records: number;
  cache_enabled: boolean;
}