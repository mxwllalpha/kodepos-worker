/**
 * Kodepos API Types
 * Type definitions for Indonesian postal code data
 *
 * @author Maxwell Alpha
 * @website https://github.com/mxwlllph
 */

import type { D1Database } from '@cloudflare/workers-types';

export interface KodeposData {
  id: number;
  code: number;
  village: string;
  district: string;
  regency: string;
  province: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone?: string;
  created_at?: string;
}

export interface LocationQuery {
  search?: string;
  province?: string;
  regency?: string;
  district?: string;
  village?: string;
  code?: string;
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
    province: string;
    regency: string;
    district: string;
    village: string;
    code: string;
    latitude: number;
    longitude: number;
    elevation?: number;
    timezone?: string;
    distance_km?: number;
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

export interface Env {
  KODEPOS_DB: D1Database;
  ENVIRONMENT: string;
  API_VERSION: string;
  DATA_SOURCE_VERSION: string;

  // Configuration variables
  API_BASE_URL?: string;
  WORKER_NAME?: string;
  DATABASE_NAME?: string;
  LOG_LEVEL?: string;

  // Feature flags
  ENABLE_CACHE?: string;
  ENABLE_RATE_LIMITING?: string;
  ENABLE_LOGGING?: string;

  // Performance settings
  API_CACHE_TTL?: string;
  RATE_LIMIT_REQUESTS?: string;
  RATE_LIMIT_WINDOW?: string;

  // Security settings
  CORS_ORIGIN?: string;
  DEBUG?: string;

  // Cloudflare settings
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
}