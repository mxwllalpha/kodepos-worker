/**
 * Unit Tests for ConfigurationService
 * Tests configuration management and environment handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConfigurationService } from '../../src/services/configuration.service';
import type { Env } from '../../src/types/kodepos';

describe('ConfigurationService', () => {
  let configService: ConfigurationService;
  let mockEnv: Env;

  beforeEach(() => {
    // Reset singleton instance
    (ConfigurationService as any).instance = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should create singleton instance', () => {
      const mockEnv: Env = {
        KODEPOS_DB: {} as any,
        ENVIRONMENT: 'production'
      };

      const instance1 = ConfigurationService.getInstance(mockEnv);
      const instance2 = ConfigurationService.getInstance(mockEnv);

      expect(instance1).toBe(instance2);
    });

    it('should create new instance if none exists', () => {
      const mockEnv: Env = {
        KODEPOS_DB: {} as any,
        ENVIRONMENT: 'development'
      };

      const instance = ConfigurationService.getInstance(mockEnv);

      expect(instance).toBeInstanceOf(ConfigurationService);
    });
  });

  describe('loadConfiguration', () => {
    it('should load production configuration', () => {
      const mockEnv: Env = {
        KODEPOS_DB: {} as any,
        ENVIRONMENT: 'production',
        API_VERSION: '1.0.0'
      };

      configService = new ConfigurationService(mockEnv);
      const config = configService.getConfig();

      expect(config.ENVIRONMENT).toBe('production');
      expect(config.API_BASE_URL).toBe('https://kodepos-api.tekipik.workers.dev');
      expect(config.WORKER_NAME).toBe('kodepos-worker');
      expect(config.DATABASE_NAME).toBe('kodepos-db');
      expect(config.VERSION).toBe('1.0.0');
      expect(config.LOG_LEVEL).toBe('info');
    });

    it('should load staging configuration', () => {
      const mockEnv: Env = {
        KODEPOS_DB: {} as any,
        ENVIRONMENT: 'staging'
      };

      configService = new ConfigurationService(mockEnv);
      const config = configService.getConfig();

      expect(config.ENVIRONMENT).toBe('staging');
      expect(config.API_BASE_URL).toBe('https://kodepos-worker-staging.tekipik.workers.dev');
      expect(config.WORKER_NAME).toBe('kodepos-worker-staging');
      expect(config.DATABASE_NAME).toBe('kodepos-db-staging');
    });

    it('should load development configuration', () => {
      const mockEnv: Env = {
        KODEPOS_DB: {} as any,
        ENVIRONMENT: 'development'
      };

      configService = new ConfigurationService(mockEnv);
      const config = configService.getConfig();

      expect(config.ENVIRONMENT).toBe('development');
      expect(config.API_BASE_URL).toBe('http://localhost:8787');
      expect(config.WORKER_NAME).toBe('kodepos-worker-dev');
      expect(config.DATABASE_NAME).toBe('kodepos-db-dev');
    });

    it('should use environment variables over defaults', () => {
      const mockEnv: Env = {
        KODEPOS_DB: {} as any,
        ENVIRONMENT: 'production',
        API_BASE_URL: 'https://custom.example.com',
        WORKER_NAME: 'custom-worker',
        DATABASE_NAME: 'custom-db',
        LOG_LEVEL: 'debug'
      };

      configService = new ConfigurationService(mockEnv);
      const config = configService.getConfig();

      expect(config.API_BASE_URL).toBe('https://custom.example.com');
      expect(config.WORKER_NAME).toBe('custom-worker');
      expect(config.DATABASE_NAME).toBe('custom-db');
      expect(config.LOG_LEVEL).toBe('debug');
    });

    it('should default to development for unknown environment', () => {
      const mockEnv: Env = {
        KODEPOS_DB: {} as any,
        ENVIRONMENT: 'unknown'
      };

      configService = new ConfigurationService(mockEnv);
      const config = configService.getConfig();

      expect(config.ENVIRONMENT).toBe('unknown');
      expect(config.API_BASE_URL).toBe('http://localhost:8787');
    });

    it('should handle missing environment gracefully', () => {
      const mockEnv: Env = {
        KODEPOS_DB: {} as any
      };

      configService = new ConfigurationService(mockEnv);
      const config = configService.getConfig();

      expect(config.ENVIRONMENT).toBe('development');
    });
  });

  describe('getter methods', () => {
    beforeEach(() => {
      const mockEnv: Env = {
        KODEPOS_DB: {} as any,
        ENVIRONMENT: 'production'
      };
      configService = new ConfigurationService(mockEnv);
    });

    it('should get API base URL', () => {
      expect(configService.getApiBaseUrl()).toBe('https://kodepos-api.tekipik.workers.dev');
    });

    it('should get worker URL', () => {
      expect(configService.getWorkerUrl()).toBe('https://kodepos-api.tekipik.workers.dev');
    });

    it('should get worker name', () => {
      expect(configService.getWorkerName()).toBe('kodepos-worker');
    });

    it('should get database name', () => {
      expect(configService.getDatabaseName()).toBe('kodepos-db');
    });

    it('should get environment', () => {
      expect(configService.getEnvironment()).toBe('production');
    });

    it('should get version', () => {
      expect(configService.getVersion()).toBe('1.0.0');
    });

    it('should get log level', () => {
      expect(configService.getLogLevel()).toBe('info');
    });

    it('should get cache TTL', () => {
      expect(configService.getCacheTtl()).toBe(3600);
    });

    it('should get rate limit', () => {
      expect(configService.getRateLimit()).toBe(100);
    });
  });

  describe('environment detection methods', () => {
    it('should detect production environment', () => {
      const mockEnv: Env = {
        KODEPOS_DB: {} as any,
        ENVIRONMENT: 'production'
      };
      configService = new ConfigurationService(mockEnv);

      expect(configService.isProduction()).toBe(true);
      expect(configService.isStaging()).toBe(false);
      expect(configService.isDevelopment()).toBe(false);
    });

    it('should detect staging environment', () => {
      const mockEnv: Env = {
        KODEPOS_DB: {} as any,
        ENVIRONMENT: 'staging'
      };
      configService = new ConfigurationService(mockEnv);

      expect(configService.isProduction()).toBe(false);
      expect(configService.isStaging()).toBe(true);
      expect(configService.isDevelopment()).toBe(false);
    });

    it('should detect development environment', () => {
      const mockEnv: Env = {
        KODEPOS_DB: {} as any,
        ENVIRONMENT: 'development'
      };
      configService = new ConfigurationService(mockEnv);

      expect(configService.isProduction()).toBe(false);
      expect(configService.isStaging()).toBe(false);
      expect(configService.isDevelopment()).toBe(true);
    });
  });

  describe('URL generation methods', () => {
    beforeEach(() => {
      const mockEnv: Env = {
        KODEPOS_DB: {} as any,
        ENVIRONMENT: 'production'
      };
      configService = new ConfigurationService(mockEnv);
    });

    it('should generate health check URL', () => {
      expect(configService.getHealthCheckUrl()).toBe('https://kodepos-api.tekipik.workers.dev/health');
    });

    it('should generate detailed health check URL', () => {
      expect(configService.getDetailedHealthCheckUrl()).toBe('https://kodepos-api.tekipik.workers.dev/health/detailed');
    });

    it('should generate API endpoint URL', () => {
      expect(configService.getApiEndpoint('/api/v1/search')).toBe('https://kodepos-api.tekipik.workers.dev/api/v1/search');
      expect(configService.getApiEndpoint('api/v1/search')).toBe('https://kodepos-api.tekipik.workers.dev/api/v1/search');
    });

    it('should generate search endpoint URL', () => {
      expect(configService.getSearchEndpoint()).toBe('https://kodepos-api.tekipik.workers.dev/api/v1/search');
    });

    it('should generate detect endpoint URL', () => {
      expect(configService.getDetectEndpoint()).toBe('https://kodepos-api.tekipik.workers.dev/api/v1/detect');
    });

    it('should generate nearby endpoint URL', () => {
      expect(configService.getNearbyEndpoint()).toBe('https://kodepos-api.tekipik.workers.dev/api/v1/nearby');
    });

    it('should generate provinces endpoint URL', () => {
      expect(configService.getProvincesEndpoint()).toBe('https://kodepos-api.tekipik.workers.dev/api/v1/provinces');
    });

    it('should generate stats endpoint URL', () => {
      expect(configService.getStatsEndpoint()).toBe('https://kodepos-api.tekipik.workers.dev/api/v1/stats');
    });
  });

  describe('validateConfiguration', () => {
    it('should validate correct configuration', () => {
      const mockEnv: Env = {
        KODEPOS_DB: {} as any,
        ENVIRONMENT: 'production'
      };
      configService = new ConfigurationService(mockEnv);

      const validation = configService.validateConfiguration();

      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should detect missing API base URL', () => {
      const mockEnv: Env = {
        KODEPOS_DB: {} as any,
        ENVIRONMENT: 'production',
        API_BASE_URL: ''
      };
      configService = new ConfigurationService(mockEnv);

      const validation = configService.validateConfiguration();

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('API_BASE_URL is required');
    });

    it('should detect missing worker name', () => {
      const mockEnv: Env = {
        KODEPOS_DB: {} as any,
        ENVIRONMENT: 'production',
        WORKER_NAME: ''
      };
      configService = new ConfigurationService(mockEnv);

      const validation = configService.validateConfiguration();

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('WORKER_NAME is required');
    });

    it('should detect missing database name', () => {
      const mockEnv: Env = {
        KODEPOS_DB: {} as any,
        ENVIRONMENT: 'production',
        DATABASE_NAME: ''
      };
      configService = new ConfigurationService(mockEnv);

      const validation = configService.validateConfiguration();

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('DATABASE_NAME is required');
    });

    it('should detect invalid environment', () => {
      const mockEnv: Env = {
        KODEPOS_DB: {} as any,
        ENVIRONMENT: 'invalid-env'
      };
      configService = new ConfigurationService(mockEnv);

      const validation = configService.validateConfiguration();

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('ENVIRONMENT must be one of: development, staging, production');
    });

    it('should detect invalid URL', () => {
      const mockEnv: Env = {
        KODEPOS_DB: {} as any,
        ENVIRONMENT: 'production',
        API_BASE_URL: 'invalid-url'
      };
      configService = new ConfigurationService(mockEnv);

      const validation = configService.validateConfiguration();

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('API_BASE_URL must be a valid URL');
    });

    it('should collect all validation errors', () => {
      const mockEnv: Env = {
        KODEPOS_DB: {} as any,
        ENVIRONMENT: 'invalid-env',
        API_BASE_URL: 'invalid-url',
        WORKER_NAME: '',
        DATABASE_NAME: ''
      };
      configService = new ConfigurationService(mockEnv);

      const validation = configService.validateConfiguration();

      expect(validation.valid).toBe(false);
      expect(validation.errors).toHaveLength(4);
      expect(validation.errors).toContain('API_BASE_URL is required');
      expect(validation.errors).toContain('WORKER_NAME is required');
      expect(validation.errors).toContain('DATABASE_NAME is required');
      expect(validation.errors).toContain('ENVIRONMENT must be one of: development, staging, production');
    });
  });

  describe('edge cases and security', () => {
    it('should handle malicious environment values', () => {
      const mockEnv: Env = {
        KODEPOS_DB: {} as any,
        ENVIRONMENT: 'production; DROP TABLE users; --',
        API_BASE_URL: 'https://evil.com/api?token=secret'
      };
      configService = new ConfigurationService(mockEnv);

      // Should not execute malicious commands
      expect(configService.getEnvironment()).toBe('production; DROP TABLE users; --');

      // URL validation should catch malicious URLs
      const validation = configService.validateConfiguration();
      expect(validation.errors).toContain('ENVIRONMENT must be one of: development, staging, production');
    });

    it('should handle extremely long values', () => {
      const longString = 'a'.repeat(10000);
      const mockEnv: Env = {
        KODEPOS_DB: {} as any,
        ENVIRONMENT: 'production',
        API_BASE_URL: `https://example.com/${longString}`,
        WORKER_NAME: longString,
        DATABASE_NAME: longString
      };
      configService = new ConfigurationService(mockEnv);

      // Should handle long values gracefully
      expect(configService.getWorkerName()).toBe(longString);
      expect(configService.getDatabaseName()).toBe(longString);
    });

    it('should handle null and undefined values', () => {
      const mockEnv: Env = {
        KODEPOS_DB: {} as any,
        ENVIRONMENT: null as any,
        API_BASE_URL: undefined as any,
        WORKER_NAME: undefined as any,
        DATABASE_NAME: null as any
      };
      configService = new ConfigurationService(mockEnv);

      // Should fall back to defaults
      expect(configService.getEnvironment()).toBe('development');
      expect(configService.getApiBaseUrl()).toBe('http://localhost:8787');
      expect(configService.getWorkerName()).toBe('kodepos-worker-dev');
      expect(configService.getDatabaseName()).toBe('kodepos-db-dev');
    });
  });
});