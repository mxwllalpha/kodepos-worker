/**
 * Configuration Service - Centralized Environment Management
 * Provides unified configuration management across all environments
 *
 * @author Maxwell Alpha
 * @website https://github.com/mxwllalpha
 */

import type { Env } from '../types/kodepos';

export interface KodeposEnvironment {
  API_BASE_URL: string;
  WORKER_NAME: string;
  DATABASE_NAME: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  VERSION: string;
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
}

export interface EnvironmentConfig {
  API_BASE_URL: string;
  WORKER_NAME: string;
  DATABASE_NAME: string;
  CACHE_TTL?: number;
  RATE_LIMIT?: number;
}

export class ConfigurationService {
  private static instance: ConfigurationService;
  private config: KodeposEnvironment;

  constructor(env: Env) {
    this.config = this.loadConfiguration(env);
  }

  public static getInstance(env: Env): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService(env);
    }
    return ConfigurationService.instance;
  }

  private loadConfiguration(env: Env): KodeposEnvironment {
    const environment = env.ENVIRONMENT || 'development';
    const envConfig = this.getEnvironmentConfig(environment);

    return {
      API_BASE_URL: env.API_BASE_URL || envConfig.API_BASE_URL,
      WORKER_NAME: env.WORKER_NAME || envConfig.WORKER_NAME,
      DATABASE_NAME: env.DATABASE_NAME || envConfig.DATABASE_NAME,
      ENVIRONMENT: environment as KodeposEnvironment['ENVIRONMENT'],
      VERSION: env.API_VERSION || '1.0.0',
      LOG_LEVEL: (env.LOG_LEVEL as any) || 'info'
    };
  }

  private getEnvironmentConfig(environment: string): EnvironmentConfig {
    const configs: Record<string, EnvironmentConfig> = {
      production: {
        API_BASE_URL: 'https://kodepos-api.tekipik.workers.dev',
        WORKER_NAME: 'kodepos-worker',
        DATABASE_NAME: 'kodepos-db',
        CACHE_TTL: 3600,
        RATE_LIMIT: 100
      },
      staging: {
        API_BASE_URL: 'https://kodepos-worker-staging.tekipik.workers.dev',
        WORKER_NAME: 'kodepos-worker-staging',
        DATABASE_NAME: 'kodepos-db-staging',
        CACHE_TTL: 1800,
        RATE_LIMIT: 50
      },
      development: {
        API_BASE_URL: 'http://localhost:8787',
        WORKER_NAME: 'kodepos-worker-dev',
        DATABASE_NAME: 'kodepos-db-dev',
        CACHE_TTL: 300,
        RATE_LIMIT: 10
      }
    };

    return configs[environment] || configs.development;
  }

  // Public getters for configuration values
  public getApiBaseUrl(): string {
    return this.config.API_BASE_URL;
  }

  public getWorkerUrl(): string {
    return this.config.API_BASE_URL;
  }

  public getWorkerName(): string {
    return this.config.WORKER_NAME;
  }

  public getDatabaseName(): string {
    return this.config.DATABASE_NAME;
  }

  public getEnvironment(): string {
    return this.config.ENVIRONMENT;
  }

  public getVersion(): string {
    return this.config.VERSION;
  }

  public getLogLevel(): string {
    return this.config.LOG_LEVEL;
  }

  public getCacheTtl(): number {
    const envConfig = this.getEnvironmentConfig(this.config.ENVIRONMENT);
    return envConfig.CACHE_TTL || 300;
  }

  public getRateLimit(): number {
    const envConfig = this.getEnvironmentConfig(this.config.ENVIRONMENT);
    return envConfig.RATE_LIMIT || 50;
  }

  // Utility methods
  public isProduction(): boolean {
    return this.config.ENVIRONMENT === 'production';
  }

  public isStaging(): boolean {
    return this.config.ENVIRONMENT === 'staging';
  }

  public isDevelopment(): boolean {
    return this.config.ENVIRONMENT === 'development';
  }

  public getConfig(): KodeposEnvironment {
    return { ...this.config };
  }

  // Validation methods
  public validateConfiguration(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.API_BASE_URL) {
      errors.push('API_BASE_URL is required');
    }

    if (!this.config.WORKER_NAME) {
      errors.push('WORKER_NAME is required');
    }

    if (!this.config.DATABASE_NAME) {
      errors.push('DATABASE_NAME is required');
    }

    if (!['development', 'staging', 'production'].includes(this.config.ENVIRONMENT)) {
      errors.push('ENVIRONMENT must be one of: development, staging, production');
    }

    try {
      new URL(this.config.API_BASE_URL);
    } catch {
      errors.push('API_BASE_URL must be a valid URL');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Health check URL generation
  public getHealthCheckUrl(): string {
    return `${this.config.API_BASE_URL}/health`;
  }

  public getDetailedHealthCheckUrl(): string {
    return `${this.config.API_BASE_URL}/health/detailed`;
  }

  // API endpoint URLs
  public getApiEndpoint(path: string): string {
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${this.config.API_BASE_URL}/${cleanPath}`;
  }

  public getSearchEndpoint(): string {
    return `${this.config.API_BASE_URL}/api/v1/search`;
  }

  public getDetectEndpoint(): string {
    return `${this.config.API_BASE_URL}/api/v1/detect`;
  }

  public getNearbyEndpoint(): string {
    return `${this.config.API_BASE_URL}/api/v1/nearby`;
  }

  public getProvincesEndpoint(): string {
    return `${this.config.API_BASE_URL}/api/v1/provinces`;
  }

  public getStatsEndpoint(): string {
    return `${this.config.API_BASE_URL}/api/v1/stats`;
  }
}