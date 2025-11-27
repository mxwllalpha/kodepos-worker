# Enhanced Development Guide

**Kodepos API Indonesia - Comprehensive Development Setup, Architecture & Contribution Guide**

*Author: Maxwell Alpha (https://github.com/mxwllalpha) - mxwllalpha@gmail.com*
*Version: 2.0.0 - Enhanced with Complete Development Lifecycle*

---

## 🚀 Quick Start

### Prerequisites

**Required Software:**
- **Node.js**: 18.x or higher (LTS recommended)
- **npm**: 8.x or higher (or yarn 1.22+ / pnpm 7+)
- **Git**: Latest version (2.30+ recommended)
- **Cloudflare Account**: Free tier sufficient for development
- **GitHub CLI**: For repository management and automation

**Development Environment Requirements:**
- **Operating System**: Windows 10+, macOS 10.15+, or Linux
- **Memory**: Minimum 4GB RAM, 8GB recommended
- **Storage**: Minimum 2GB free space
- **Network**: Internet connection for package downloads and API access

**Recommended Tools:**
- **IDE**: VS Code with extensions
- **Database Tool**: DBeaver or TablePlus for D1 visualization
- **API Testing**: Postman, Insomnia, or curl
- **Code Quality**: SonarCloud for static analysis
- **Version Control**: GitHub Desktop (optional)

### Installation & Setup

#### 1. Repository Setup

```bash
# Clone the repository
git clone https://github.com/mxwllalpha/kodepos-api.git
cd kodepos-api

# Or for development with fork
git clone https://github.com/YOUR_USERNAME/kodepos-api.git
cd kodepos-api
git remote add upstream https://github.com/mxwllalpha/kodepos-api.git

# Switch to development branch
git checkout -b develop
git pull upstream develop
```

#### 2. Environment Configuration

```bash
# Create environment files
cp .env.example .env.development
cp .env.example .env.production

# Edit environment files
nano .env.development
```

**Environment Variables (.env.development):**
```bash
# Cloudflare Configuration
CF_ACCOUNT_ID=your_account_id
CF_API_TOKEN=your_api_token
CF_ZONE_ID=your_zone_id

# Database Configuration
D1_DATABASE_ID=your_database_id
D1_DATABASE_NAME=kodepos-db-dev

# Development Settings
NODE_ENV=development
API_BASE_URL=http://localhost:8787
LOG_LEVEL=debug

# Testing
TEST_DATABASE_ID=your_test_database_id
CI_API_URL=http://localhost:8787
```

#### 3. Dependency Installation

```bash
# Install dependencies
npm install

# Or with package managers
yarn install
pnpm install

# Install development dependencies globally
npm install -g typescript @types/node vitest wrangler

# Install additional development tools
npm install -g prettier eslint prettier-plugin-packagejson
```

#### 4. Cloudflare Setup

```bash
# Login to Cloudflare
npx wrangler auth login

# Create D1 database (interactive)
npx wrangler d1 create kodepos-db-dev

# Note the database ID and update wrangler.toml

# Create D1 database for testing
npx wrangler d1 create kodepos-db-test --local
```

#### 5. Database Setup

```bash
# Apply database migrations
npm run db:migrate:local

# Import sample data
npm run db:import:local

# Verify database setup
npm run db:test:seed
```

#### 6. Development Server

```bash
# Start development server with hot reload
npm run dev

# Start with specific port
npm run dev -- --port 3000

# Start with database simulation
npm run dev:local

# Run in production mode locally
npm run dev:prod
```

### Project Structure Deep Dive

```
kodepos-worker/
├── 📁 src/                          # Source code
│   ├── index.ts                    # Main application entry point
│   ├── types/
│   │   └── kodepos.ts             # TypeScript interfaces and types
│   └── services/
│       ├── kodepos.service.ts     # Core business logic
│       └── legacy-adapter.service.ts  # Legacy API compatibility
│
├── 📁 migrations/                  # Database migrations
│   ├── 001_create_kodepos_tables.sql      # Schema creation
│   ├── 002_import_kodepos_data.sql       # Data import
│   └── 003_add_indexes.sql              # Performance indexes
│
├── 📁 scripts/                     # Utility scripts
│   ├── import-data.js              # Data import utility
│   ├── migrate.js                  # Migration runner
│   └── seed-test-data.js          # Test data generator
│
├── 📁 tests/                        # Test files
│   ├── unit/                       # Unit tests
│   ├── integration/                # Integration tests
│   ├── e2e/                        # End-to-end tests
│   └── fixtures/                   # Test data fixtures
│
├── 📁 docs/                         # Documentation
│   ├── DEVELOPMENT.md              # This development guide
│   ├── API.md                      # API documentation
│   ├── architecture.md             # Architecture overview
│   └── TROUBLESHOOTING.md         # Troubleshooting guide
│
├── 📁 examples/                     # Integration examples
│   ├── javascript/                # JavaScript examples
│   ├── python/                    # Python examples
│   ├── react/                     # React examples
│   └── mobile/                    # Mobile app examples
│
├── 📁 data/                         # Source data
│   ├── kodepos.json               # 83,761 postal codes
│   └── sample-requests.json       # Sample API requests
│
├── 📁 .github/                      # GitHub workflows
│   └── workflows/
│       ├── ci.yml                 # Continuous Integration
│       ├── deploy.yml              # Deployment automation
│       └── security.yml           # Security scanning
│
├── 📄 wrangler.toml                # Cloudflare configuration
├── 📄 package.json                 # Project dependencies
├── 📄 tsconfig.json                # TypeScript configuration
├── 📄 eslint.config.js             # ESLint configuration
├── 📄 vitest.config.ts             # Vitest configuration
├── 📄 .gitignore                   # Git ignore rules
├── 📄 .env.example                 # Environment template
└── 📄 README.md                    # Project overview
```

### Development Workflow

```bash
# 1. Setup development environment
git checkout -b feature/your-feature-name
npm install
npm run setup:dev

# 2. Make changes
npm run dev          # Start development server
npm run test         # Run tests
npm run lint         # Check code quality

# 3. Test thoroughly
npm run test:coverage   # Run with coverage
npm run test:e2e        # End-to-end tests

# 4. Commit and push
git add .
npm run type-check
npm run build
git commit -m "feat: add new feature"
git push origin feature/your-feature-name

# 5. Create pull request
# (Manual step on GitHub)
```

### Verification Checklist

After setup, verify everything is working:

```bash
# Health check
curl http://localhost:8787/health

# Basic search test
curl "http://localhost:8787/search?q=Jakarta"

# Database connection test
npm run db:test:connection

# Type checking
npm run type-check

# Linting
npm run lint

# Test suite
npm test
```

## 🔧 Complete Local Development Setup

### Development Environment Configuration

#### VS Code Setup (Recommended)

Install these VS Code extensions:
```bash
# Install VS Code extensions
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension ms-vscode.vscode-json
code --install-extension ms-kubernetes-tools.vscode-kubernetes-tools
```

**VS Code Settings (.vscode/settings.json):**
```json
{
  "typescript.preferences.preferTypeOnlyAutoImports": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.fixAll.format": true
  },
  "files.associations": {
    "*.sql": "sql"
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true
  },
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/dist/**": true,
    "**/build/**": true
  }
}
```

#### Docker Development Environment

```bash
# Create docker-compose.yml
version: '3.8'
services:
  kodepos-api:
    build: .
    ports:
      - "8787:8787"
    environment:
      - NODE_ENV=development
      - D1_DATABASE_ID=${D1_DATABASE_ID}
      - CF_ACCOUNT_ID=${CF_ACCOUNT_ID}
      - CF_API_TOKEN=${CF_API_TOKEN}
    volumes:
      - ./src:/app/src
      - ./tests:/app/tests
      - ./data:/app/data
    depends_on:
      - d1-proxy

  d1-proxy:
    image: ghcr.io/cloudflare/d1-proxy:latest
    environment:
      - DATABASE_NAME=kodepos-db-dev
      - DATABASE_URL=file:./dev.db
    volumes:
      - ./dev.db:/dev.db

volumes:
  dev-db:
```

#### Development Scripts Configuration

**package.json Development Scripts:**
```json
{
  "scripts": {
    "dev": "wrangler dev --local --port 8787",
    "dev:local": "wrangler dev --local --port 8787 --env local",
    "dev:prod": "wrangler dev --local --port 8787 --env production",

    "build": "tsc --noEmit",
    "build:check": "npm run build && npm run type-check",
    "build:watch": "tsc --watch --noEmit",

    "type-check": "tsc --noEmit --strict",
    "lint": "eslint src tests --ext .ts",
    "lint:fix": "eslint src tests --ext .ts --fix",
    "format": "prettier --write src tests",
    "format:check": "prettier --check src tests",

    "test": "vitest",
    "test:unit": "vitest run --config vitest.config.unit.ts",
    "test:integration": "vitest run --config vitest.config.integration.ts",
    "test:e2e": "vitest run --config vitest.config.e2e.ts",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch",

    "db:migrate": "wrangler d1 execute kodepos-db-dev --file=./migrations/001_create_kodepos_tables.sql",
    "db:migrate:local": "wrangler d1 execute kodepos-db-dev --local --file=./migrations/001_create_kodepos_tables.sql",
    "db:import": "node scripts/import-data.js",
    "db:import:local": "node scripts/import-data.js --local",
    "db:reset": "wrangler d1 execute kodepos-db-dev --local --command=\"DELETE FROM postal_codes\"",
    "db:test:seed": "node scripts/seed-test-data.js",
    "db:test:connection": "wrangler d1 execute kodepos-db-dev --local --command=\"SELECT 1\" --silent",

    "setup:dev": "npm install && npm run db:migrate:local && npm run db:import:local",
    "setup:prod": "npm install && npm run db:migrate && npm run db:import",

    "deploy": "wrangler deploy",
    "deploy:dev": "wrangler deploy --env development",
    "deploy:prod": "wrangler deploy --env production",

    "preview": "wrangler deploy --preview",
    "tail": "wrangler tail",

    "ci:lint": "npm run lint && npm run type-check && npm run format:check",
    "ci:test": "npm run test:coverage",
    "ci:build": "npm run build:check"
  }
}
```

### Database Development Setup

#### Local Database Configuration

**wrangler.toml Local Configuration:**
```toml
[env.local]
name = "kodepos-worker-local"
main = "src/index.ts"
compatibility_date = "2025-11-26"

[[env.local.d1_databases]]
binding = "KODEPOS_DB"
database_name = "kodepos-db-dev"
database_id = "your-local-db-id"

[env.local.env]
NODE_ENV = "development"
LOG_LEVEL = "debug"
```

#### Database Migration Management

**Migration Script (scripts/migrate.js):**
```javascript
#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const MIGRATIONS_DIR = './migrations';
const DATABASES = {
  local: 'kodepos-db-dev',
  test: 'kodepos-db-test',
  production: 'kodepos-db-prod'
};

function getMigrationFiles() {
  return fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();
}

async function runMigration(env = 'local', migrationFile) {
  try {
    console.log(`Running migration: ${migrationFile} on ${env}`);

    const command = `wrangler d1 execute ${DATABASES[env]} --env ${env} --file=${path.join(MIGRATIONS_DIR, migrationFile)}`;
    execSync(command, { stdio: 'inherit' });

    console.log(`✅ Migration ${migrationFile} completed successfully`);
  } catch (error) {
    console.error(`❌ Migration ${migrationFile} failed:`, error.message);
    process.exit(1);
  }
}

async function rollbackMigration(env = 'local', steps = 1) {
  console.log(`Rolling back ${steps} migration(s) on ${env}`);
  // Implement rollback logic based on your migration tracking
}

export { runMigration, rollbackMigration, getMigrationFiles };
```

### Testing Environment Setup

#### Test Configuration Files

**vitest.config.unit.ts:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/unit/setup.ts'],
  },
  resolve: {
    alias: {
      '@': './src',
    },
  },
});
```

**vitest.config.integration.ts:**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/integration/setup.ts'],
  },
});
```

**vitest.config.e2e.ts:**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/e2e/setup.ts'],
  },
});
```

### Development Dependencies

Enhanced package.json dependencies:
```json
{
  "dependencies": {
    "hono": "^4.6.9"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20241022.0",
    "@types/node": "^22.9.0",
    "typescript": "^5.6.3",
    "wrangler": "^3.94.0",

    // Development tools
    "vitest": "^1.6.0",
    "@vitest/coverage-v8": "^1.6.0",
    "jsdom": "^24.0.0",
    "happy-dom": "^14.0.0",

    // Code quality
    "eslint": "^8.57.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.2.1",
    "prettier": "^3.3.3",
    "prettier-plugin-packagejson": "^2.5.3",

    // TypeScript
    "@typescript-eslint/eslint-plugin": "^7.2.0",
    "@typescript-eslint/parser": "^7.2.0",

    // Testing utilities
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/react": "^14.2.0",
    "@testing-library/user-event": "^14.5.0"
  }
}
```

---

## 🧪 Comprehensive Testing Strategy & Procedures

### Testing Philosophy

**Testing Goals:**
- **Code Coverage**: Minimum 90% line coverage for production code
- **Test Quality**: Unit tests for business logic, integration tests for APIs, E2E tests for critical flows
- **Performance**: Test API performance under load
- **Security**: Test input validation and error handling
- **Reliability**: Ensure tests are deterministic and fast

**Testing Pyramid:**
```
          📦 E2E Tests (5%)
       📦 Integration Tests (15%)
    📦 Unit Tests (80%)
```

### Testing Infrastructure

#### Test Configuration Files

**tests/unit/setup.ts:**
```typescript
import { vi, beforeEach, afterEach } from 'vitest';
import { mockD1Database } from '../fixtures/database-mock';

// Mock global console for test environment
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
};

// Mock D1 database for unit tests
beforeEach(() => {
  vi.clearAllMocks();

  // Set up test database
  const mockDb = mockD1Database();
  global.process.env.TEST_DATABASE = mockDb;
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

**tests/integration/setup.ts:**
```typescript
import { vi, beforeAll, afterAll } from 'vitest';
import { setupTestDatabase, teardownTestDatabase } from '../fixtures/database-setup';

// Integration test setup
beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await teardownTestDatabase();
});
```

**tests/e2e/setup.ts:**
```typescript
import { vi, beforeAll, afterAll } from 'vitest';
import { setupE2ETestEnvironment, cleanupE2ETestEnvironment } from '../fixtures/e2e-setup';

// E2E test setup with real database
beforeAll(async () => {
  await setupE2ETestEnvironment();
});

afterAll(async () => {
  await cleanupE2ETestEnvironment();
});
```

### Unit Testing

#### Service Layer Tests

**tests/unit/services/kodepos.service.test.ts:**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KodeposService } from '../../../src/services/kodepos.service';
import { mockD1Database } from '../fixtures/database-mock';

describe('KodeposService', () => {
  let service: KodeposService;
  let mockDb: any;

  beforeEach(() => {
    mockDb = mockD1Database();
    service = new KodeposService(mockDb);
  });

  describe('search', () => {
    it('should return search results for valid query', async () => {
      // Arrange
      const mockResults = [
        {
          kodepos: 10110,
          kelurahan: 'Menteng',
          kecamatan: 'Menteng',
          kota: 'Jakarta Pusat',
          provinsi: 'DKI Jakarta',
          latitude: -6.1944,
          longitude: 106.8229
        }
      ];

      mockDb.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({ results: mockResults })
        })
      });

      // Act
      const result = await service.search({ search: 'Jakarta' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].kodepos).toBe(10110);
      expect(result.data[0].kelurahan).toBe('Menteng');
    });

    it('should handle empty search query', async () => {
      // Act & Assert
      await expect(service.search({ search: '' }))
        .rejects.toThrow('Search query is required');
    });

    it('should handle search errors gracefully', async () => {
      // Arrange
      mockDb.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockRejectedValue(new Error('Database error'))
        })
      });

      // Act & Assert
      await expect(service.search({ search: 'Jakarta' }))
        .rejects.toThrow('Database error');
    });
  });

  describe('detectLocation', () => {
    it('should detect location by coordinates', async () => {
      // Arrange
      const mockResults = [
        {
          kodepos: 10110,
          kelurahan: 'Menteng',
          kecamatan: 'Menteng',
          kota: 'Jakarta Pusat',
          provinsi: 'DKI Jakarta',
          latitude: -6.1944,
          longitude: 106.8229,
          distance: 0.5
        }
      ];

      mockDb.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({ results: mockResults })
        })
      });

      // Act
      const result = await service.detectLocation(-6.1944, 106.8229, 1.0);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.distance).toBe(0.5);
    });

    it('should handle invalid coordinates', async () => {
      // Act & Assert
      await expect(service.detectLocation(-999, 999, 1.0))
        .rejects.toThrow('Invalid coordinates');
    });

    it('should return not found when no location matches', async () => {
      // Arrange
      mockDb.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({ results: [] })
        })
      });

      // Act
      const result = await service.detectLocation(-6.1944, 106.8229, 1.0);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Location not found');
    });
  });

  describe('findByCoordinates', () => {
    it('should find locations within radius', async () => {
      // Arrange
      const mockResults = [
        {
          kodepos: 10110,
          kelurahan: 'Menteng',
          kecamatan: 'Menteng',
          kota: 'Jakarta Pusat',
          provinsi: 'DKI Jakarta',
          latitude: -6.1944,
          longitude: 106.8229,
          distance: 2.3
        },
        {
          kodepos: 10111,
          kelurahan: 'Gambir',
          kecamatan: 'Gambir',
          kota: 'Jakarta Pusat',
          provinsi: 'DKI Jakarta',
          latitude: -6.1763,
          longitude: 106.8293,
          distance: 3.1
        }
      ];

      mockDb.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({ results: mockResults })
        })
      });

      // Act
      const result = await service.findByCoordinates(-6.1944, 106.8229, 5.0);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data![0].distance_km).toBe(2.3);
      expect(result.data![1].distance_km).toBe(3.1);
    });

    it('should handle radius parameter correctly', async () => {
      // Arrange
      mockDb.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({ results: [] })
        })
      });

      // Act
      const result1 = await service.findByCoordinates(-6.1944, 106.8229, 1.0);
      const result2 = await service.findByCoordinates(-6.1944, 106.8229, 10.0);

      // Assert
      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
    });
  });
});
```

#### Adapter Service Tests

**tests/unit/services/legacy-adapter.service.test.ts:**
```typescript
import { describe, it, expect } from 'vitest';
import {
  transformToLegacyFormat,
  createLegacyResponse,
  createLegacyErrorResponse,
  validateSearchQuery,
  validateCoordinates
} from '../../../src/services/legacy-adapter.service';
import type { PostalCode, DetectResult } from '../../../src/types/kodepos';

describe('LegacyAdapterService', () => {
  describe('transformToLegacyFormat', () => {
    it('should transform modern format to legacy format', () => {
      // Arrange
      const modernData: PostalCode[] = [
        {
          kodepos: 10110,
          kelurahan: 'Menteng',
          kecamatan: 'Menteng',
          kota: 'Jakarta Pusat',
          provinsi: 'DKI Jakarta',
          latitude: -6.1944,
          longitude: 106.8229,
          elevation: 12,
          timezone: 'WIB'
        }
      ];

      // Act
      const result = transformToLegacyFormat(modernData);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe(10110);
      expect(result[0].village).toBe('Menteng');
      expect(result[0].district).toBe('Menteng');
      expect(result[0].regency).toBe('Jakarta Pusat');
      expect(result[0].province).toBe('DKI Jakarta');
    });
  });

  describe('validateSearchQuery', () => {
    it('should validate valid search query', () => {
      // Act
      const result = validateSearchQuery('Jakarta');

      // Assert
      expect(result.valid).toBe(true);
      expect(result.query).toBe('Jakarta');
    });

    it('should reject empty query', () => {
      // Act
      const result = validateSearchQuery('');

      // Assert
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Search query is required');
    });

    it('should reject null query', () => {
      // Act
      const result = validateSearchQuery(null);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Search query is required');
    });

    it('should reject overly long query', () => {
      // Arrange
      const longQuery = 'a'.repeat(101);

      // Act
      const result = validateSearchQuery(longQuery);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Search query too long (max 100 characters)');
    });
  });

  describe('validateCoordinates', () => {
    it('should validate valid Indonesian coordinates', () => {
      // Act
      const result = validateCoordinates('-6.1944', '106.8229');

      // Assert
      expect(result.valid).toBe(true);
      expect(result.latitude).toBe(-6.1944);
      expect(result.longitude).toBe(106.8229);
    });

    it('should reject invalid latitude', () => {
      // Act
      const result = validateCoordinates('-999', '106.8229');

      // Assert
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Latitude must be between -11 and 6');
    });

    it('should reject invalid longitude', () => {
      // Act
      const result = validateCoordinates('-6.1944', '999');

      // Assert
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Longitude must be between 95 and 141');
    });
  });
});
```

### Integration Testing

#### API Endpoint Tests

**tests/integration/api.test.ts:**
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Hono } from 'hono';
import { KodeposService } from '../../src/services/kodepos.service';
import app from '../../src/index';
import { setupTestDatabase, teardownTestDatabase } from '../fixtures/database-setup';

describe('API Integration Tests', () => {
  let testDb: any;

  beforeAll(async () => {
    testDb = await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase(testDb);
  });

  describe('GET /api/v1/search', () => {
    it('should return modern API response format', async () => {
      // Act
      const res = await app.request('/api/v1/search?q=Jakarta', {}, testDb);
      const data = await res.json();

      // Assert
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.total).toBeGreaterThan(0);
      expect(data.query_time_ms).toBeGreaterThan(0);
      expect(data.timestamp).toBeDefined();
    });

    it('should handle search filters', async () => {
      // Act
      const res = await app.request('/api/v1/search?provinsi=DKI Jakarta&kota=Jakarta Pusat', {}, testDb);
      const data = await res.json();

      // Assert
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.length).toBeGreaterThan(0);
    });

    it('should return 400 for invalid parameters', async () => {
      // Act
      const res = await app.request('/api/v1/search', {}, testDb);
      const data = await res.json();

      // Assert
      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should handle postal code search', async () => {
      // Act
      const res = await app.request('/api/v1/search?kodepos=10110', {}, testDb);
      const data = await res.json();

      // Assert
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].kodepos).toBe(10110);
    });
  });

  describe('GET /api/v1/detect', () => {
    it('should detect location by coordinates', async () => {
      // Act
      const res = await app.request('/api/v1/detect?latitude=-6.1944&longitude=106.8229', {}, testDb);
      const data = await res.json();

      // Assert
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.kodepos).toBeDefined();
      expect(data.data.distance).toBeDefined();
    });

    it('should return 400 for missing coordinates', async () => {
      // Act
      const res = await app.request('/api/v1/detect', {}, testDb);
      const data = await res.json();

      // Assert
      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('latitude and longitude');
    });

    it('should return 400 for invalid coordinates', async () => {
      // Act
      const res = await app.request('/api/v1/detect?latitude=-999&longitude=999', {}, testDb);
      const data = await res.json();

      // Assert
      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid coordinates');
    });
  });

  describe('GET /api/v1/nearby', () => {
    it('should find nearby postal codes', async () => {
      // Act
      const res = await app.request('/api/v1/nearby?latitude=-6.1944&longitude=106.8229&radius=5', {}, testDb);
      const data = await res.json();

      // Assert
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.radius_km).toBe(5);
      expect(data.data.length).toBeGreaterThan(0);
    });

    it('should use default radius when not specified', async () => {
      // Act
      const res = await app.request('/api/v1/nearby?latitude=-6.1944&longitude=106.8229', {}, testDb);
      const data = await res.json();

      // Assert
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.radius_km).toBe(5); // default value
    });
  });

  describe('Legacy Endpoints', () => {
    it('should maintain legacy compatibility for /search', async () => {
      // Act
      const res = await app.request('/search?q=Jakarta', {}, testDb);
      const data = await res.json();

      // Assert
      expect(res.status).toBe(200);
      expect(data.statusCode).toBe(200);
      expect(data.code).toBe('OK');
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should maintain legacy compatibility for /detect', async () => {
      // Act
      const res = await app.request('/detect?latitude=-6.1944&longitude=106.8229', {}, testDb);
      const data = await res.json();

      // Assert
      expect(res.status).toBe(200);
      expect(data.statusCode).toBe(200);
      expect(data.code).toBe('OK');
      expect(data.data).toBeDefined();
      expect(data.data.distance).toBeDefined();
    });
  });

  describe('Health Check Endpoints', () => {
    it('should return basic health status', async () => {
      // Act
      const res = await app.request('/health', {}, testDb);
      const data = await res.json();

      // Assert
      expect(res.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.database).toBe('connected');
      expect(data.version).toBeDefined();
    });

    it('should return detailed health information', async () => {
      // Act
      const res = await app.request('/health/detailed', {}, testDb);
      const data = await res.json();

      // Assert
      expect(res.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.total_records).toBeGreaterThan(0);
      expect(data.cache_enabled).toBe(true);
    });
  });
});
```

### E2E Testing

#### End-to-End Test Suite

**tests/e2e/kodepos-api.test.ts:**
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupE2ETestEnvironment, cleanupE2ETestEnvironment } from '../fixtures/e2e-setup';

describe('Kodepos API E2E Tests', () => {
  let baseUrl: string;

  beforeAll(async () => {
    await setupE2ETestEnvironment();
    baseUrl = process.env.E2E_BASE_URL || 'http://localhost:8787';
  });

  afterAll(async () => {
    await cleanupE2ETestEnvironment();
  });

  describe('API Workflow Tests', () => {
    it('should complete full search workflow', async () => {
      // Step 1: Health check
      const healthRes = await fetch(`${baseUrl}/health`);
      expect(healthRes.status).toBe(200);
      const healthData = await healthRes.json();
      expect(healthData.status).toBe('healthy');

      // Step 2: Search for Jakarta
      const searchRes = await fetch(`${baseUrl}/search?q=Jakarta`);
      expect(searchRes.status).toBe(200);
      const searchData = await searchRes.json();
      expect(searchData.statusCode).toBe(200);
      expect(searchData.data.length).toBeGreaterThan(0);

      // Step 3: Detect location using coordinates from search result
      const firstResult = searchData.data[0];
      const detectRes = await fetch(`${baseUrl}/detect?latitude=${firstResult.latitude}&longitude=${firstResult.longitude}`);
      expect(detectRes.status).toBe(200);
      const detectData = await detectRes.json();
      expect(detectData.statusCode).toBe(200);

      // Step 4: Find nearby locations
      const nearbyRes = await fetch(`${baseUrl}/api/v1/nearby?latitude=${firstResult.latitude}&longitude=${firstResult.longitude}&radius=2`);
      expect(nearbyRes.status).toBe(200);
      const nearbyData = await nearbyRes.json();
      expect(nearbyData.success).toBe(true);
      expect(nearbyData.data.length).toBeGreaterThan(0);
    });

    it('should handle error scenarios gracefully', async () => {
      // Invalid coordinates
      const invalidCoordsRes = await fetch(`${baseUrl}/detect?latitude=-999&longitude=999`);
      expect(invalidCoordsRes.status).toBe(400);
      const invalidCoordsData = await invalidCoordsRes.json();
      expect(invalidCoordsData.statusCode).toBe(400);

      // Missing parameters
      const missingParamsRes = await fetch(`${baseUrl}/detect`);
      expect(missingParamsRes.status).toBe(400);

      // Empty search
      const emptySearchRes = await fetch(`${baseUrl}/search?q=`);
      expect(emptySearchRes.status).toBe(400);
    });

    it('should maintain performance under load', async () => {
      const concurrentRequests = 10;
      const requests = [];

      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(
          fetch(`${baseUrl}/search?q=Jakarta`)
            .then(res => res.json())
            .then(data => ({ success: data.statusCode === 200, time: Date.now() }))
        );
      }

      const results = await Promise.all(requests);
      const successCount = results.filter(r => r.success).length;

      expect(successCount).toBe(concurrentRequests);
      // All requests should complete within 5 seconds
      const maxTime = Math.max(...results.map(r => r.time));
      expect(maxTime).toBeLessThan(5000);
    });
  });

  describe('API Consistency Tests', () => {
    it('should return consistent results between legacy and modern endpoints', async () => {
      const query = 'Jakarta';

      // Legacy endpoint
      const legacyRes = await fetch(`${baseUrl}/search?q=${query}`);
      const legacyData = await legacyRes.json();

      // Modern endpoint
      const modernRes = await fetch(`${baseUrl}/api/v1/search?q=${query}`);
      const modernData = await modernRes.json();

      // Both should return successful responses
      expect(legacyRes.status).toBe(200);
      expect(modernRes.status).toBe(200);

      // Both should return results
      expect(legacyData.data.length).toBeGreaterThan(0);
      expect(modernData.data.length).toBeGreaterThan(0);

      // Results should be consistent (converted)
      expect(legacyData.data.length).toBe(modernData.data.length);
    });

    it('should handle pagination correctly', async () => {
      const params = new URLSearchParams({
        q: 'Jakarta',
        limit: '5',
        offset: '0'
      });

      const res = await fetch(`${baseUrl}/api/v1/search?${params}`);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Rate Limiting Tests', () => {
    it('should handle rate limiting gracefully', async () => {
      // Make multiple requests quickly to test rate limiting
      const requests = Array.from({ length: 20 }, () =>
        fetch(`${baseUrl}/search?q=test`)
      );

      const responses = await Promise.all(requests);
      const successCount = responses.filter(r => r.status === 200).length;

      // Most requests should succeed, but some might be rate limited
      expect(successCount).toBeGreaterThan(15); // At least 75% should succeed
    });
  });
});
```

### Test Fixtures and Utilities

#### Database Mock

**tests/fixtures/database-mock.ts:**
```typescript
export function mockD1Database() {
  const mockResults = [
    {
      kodepos: 10110,
      kelurahan: 'Menteng',
      kecamatan: 'Menteng',
      kota: 'Jakarta Pusat',
      provinsi: 'DKI Jakarta',
      latitude: -6.1944,
      longitude: 106.8229,
      elevation: 12,
      timezone: 'WIB'
    },
    {
      kodepos: 10111,
      kelurahan: 'Gambir',
      kecamatan: 'Gambir',
      kota: 'Jakarta Pusat',
      provinsi: 'DKI Jakarta',
      latitude: -6.1763,
      longitude: 106.8293,
      elevation: 8,
      timezone: 'WIB'
    }
  ];

  return {
    prepare: (sql: string) => {
      // Mock different SQL queries
      if (sql.includes('WHERE kelurahan LIKE')) {
        return {
          bind: (params: any[]) => ({
            all: () => Promise.resolve({ results: mockResults })
          })
        };
      } else if (sql.includes('WHERE distance')) {
        return {
          bind: (params: any[]) => ({
            all: () => Promise.resolve({ results: mockResults.slice(0, 1) })
          })
        };
      } else {
        return {
          bind: (params: any[]) => ({
            all: () => Promise.resolve({ results: [] })
          })
        };
      }
    },
    exec: () => Promise.resolve(),
    batch: () => Promise.resolve()
  };
}
```

#### Test Data Generator

**tests/fixtures/test-data-generator.ts:**
```typescript
export function generateTestPostalCode(
  kodepos: number,
  kelurahan: string,
  kecamatan: string,
  kota: string,
  provinsi: string,
  latitude: number,
  longitude: number
) {
  return {
    kodepos,
    kelurahan,
    kecamatan,
    kota,
    provinsi,
    latitude,
    longitude,
    elevation: Math.floor(Math.random() * 1000),
    timezone: 'WIB'
  };
}

export function generateTestPostalCodes(count: number = 100) {
  const provinces = ['DKI Jakarta', 'Jawa Barat', 'Jawa Timur', 'Bali'];
  const cities = ['Jakarta Pusat', 'Jakarta Selatan', 'Bandung', 'Surabaya', 'Denpasar'];
  const districts = ['Menteng', 'Gambir', 'Cipayung', 'Cilincing', 'Kebayoran Baru'];
  const villages = ['Kelurahan A', 'Kelurahan B', 'Kelurahan C', 'Kelurahan D', 'Kelurahan E'];

  const postalCodes = [];

  for (let i = 0; i < count; i++) {
    const province = provinces[Math.floor(Math.random() * provinces.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const district = districts[Math.floor(Math.random() * districts.length)];
    const village = villages[Math.floor(Math.random() * villages.length)];

    // Generate coordinates in Indonesia
    const latitude = -11 + Math.random() * 17; // -11 to 6
    const longitude = 95 + Math.random() * 46; // 95 to 141

    const kodepos = 10000 + i;

    postalCodes.push({
      kodepos,
      kelurahan: village,
      kecamatan: district,
      kota: city,
      provinsi: province,
      latitude,
      longitude,
      elevation: Math.floor(Math.random() * 1000),
      timezone: 'WIB'
    });
  }

  return postalCodes;
}
```

### Testing Commands and Scripts

**package.json Test Scripts:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --config vitest.config.unit.ts",
    "test:integration": "vitest run --config vitest.config.integration.ts",
    "test:e2e": "vitest run --config vitest.config.e2e.ts",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch",
    "test:coverage:report": "vitest --coverage --coverage.reporter=text coverage/lcov-report/index.html",

    "test:performance": "node tests/performance/load-test.js",
    "test:security": "npm audit && npm audit --audit-level moderate",

    "test:ci": "npm run test:coverage && npm run test:performance && npm run test:security",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e"
  }
}
```

### Continuous Integration Testing

**.github/workflows/test.yml:**
```yaml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run type checking
      run: npm run type-check

    - name: Run linting
      run: npm run lint

    - name: Run unit tests
      run: npm run test:unit

    - name: Run integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: postgres://postgres:postgres@localhost:5432/kodepos_test

    - name: Run E2E tests
      run: npm run test:e2e

    - name: Run coverage tests
      run: npm run test:coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
        fail_ci_if_error: true

    - name: Run performance tests
      run: npm run test:performance

    - name: Security scan
      run: npm run test:security
```

---

## 🔧 Development Workflow

### Local Development

```bash
# Start development server with hot reload
npm run dev

# Start with database simulation
npm run dev:local

# Run type checking
npm run type-check

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Database Management

```bash
# Apply migrations (development)
npm run db:migrate

# Apply migrations (production)
npm run db:migrate:prod

# Import data from JSON file
npm run db:import

# Reset database
npm run db:reset

# View database schema
npm run db:schema
```

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- src/services/kodepos.service.test.ts

# Run tests in watch mode
npm run test:watch
```

### Build and Deployment

```bash
# Build for production
npm run build

# Build and check types
npm run build:check

# Deploy to development
npm run deploy:dev

# Deploy to production
npm run deploy

# Preview deployment
npm run preview
```

---

## 📝 Coding Standards

### TypeScript Configuration

**Strict Mode Enabled:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Code Style

**ESLint Configuration:**
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "no-console": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Naming Conventions

**Files:**
- **TypeScript files**: `kebab-case.ts` (e.g., `kodepos-service.ts`)
- **Test files**: `*.test.ts` or `*.spec.ts`
- **SQL migrations**: `XXX_description.sql`

**Code Elements:**
- **Classes**: `PascalCase` (e.g., `KodeposService`)
- **Functions/Methods**: `camelCase` (e.g., `searchPostalCodes`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_QUERY_LENGTH`)
- **Interfaces/Types**: `PascalCase` (e.g., `PostalCode`)

### Documentation Standards

**Function Documentation:**
```typescript
/**
 * Search postal codes by location name
 * @param query - Search query (1-100 characters)
 * @param options - Optional search filters
 * @returns Promise with search results
 * @throws ValidationError for invalid queries
 * @example
 * ```typescript
 * const results = await searchPostalCodes("Jakarta");
 * console.log(results.data[0].village);
 * ```
 */
async function searchPostalCodes(
  query: string,
  options?: SearchOptions
): Promise<SearchResult> {
  // Implementation
}
```

**Class Documentation:**
```typescript
/**
 * Kodepos API Service
 *
 * Provides business logic for Indonesian postal code operations
 * including search, location detection, and data validation.
 *
 * @example
 * ```typescript
 * const service = new KodeposService(db);
 * const results = await service.search({ search: "Jakarta" });
 * ```
 */
export class KodeposService {
  // Implementation
}
```

---

## 🏗️ Architecture Patterns

### Service Layer Pattern

```typescript
// Service interface
interface IKodeposService {
  search(params: SearchParams): Promise<SearchResult>;
  detectLocation(lat: number, lng: number): Promise<DetectResult>;
  findNearby(lat: number, lng: number, radius: number): Promise<NearbyResult>;
}

// Service implementation
export class KodeposService implements IKodeposService {
  constructor(private db: D1Database) {}

  async search(params: SearchParams): Promise<SearchResult> {
    // Implementation
  }
}
```

### Adapter Pattern for Legacy Compatibility

```typescript
// Legacy adapter service
export class LegacyAdapterService {
  static toLegacySearchResponse(data: PostalCode[]): LegacySearchResponse {
    return {
      statusCode: 200,
      code: "OK",
      data: data.map(item => this.transformPostalCode(item))
    };
  }

  private static transformPostalCode(item: PostalCode): LegacyPostalCode {
    return {
      code: item.kodepos,
      village: item.kelurahan,
      district: item.kecamatan,
      regency: item.kota,
      province: item.provinsi,
      // ... other transformations
    };
  }
}
```

### Repository Pattern

```typescript
// Repository interface
interface IKodeposRepository {
  findByQuery(query: string): Promise<PostalCode[]>;
  findByCoordinates(lat: number, lng: number, radius: number): Promise<PostalCode[]>;
  findClosest(lat: number, lng: number): Promise<PostalCode | null>;
}

// Repository implementation
export class KodeposRepository implements IKodeposRepository {
  constructor(private db: D1Database) {}

  async findByQuery(query: string): Promise<PostalCode[]> {
    const sql = `
      SELECT * FROM postal_codes
      WHERE kelurahan LIKE ?
         OR kecamatan LIKE ?
         OR kota LIKE ?
         OR provinsi LIKE ?
      `;
    const params = [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];

    const result = await this.db.prepare(sql).bind(...params).all();
    return result.results as PostalCode[];
  }
}
```

---

## 🏗️ Architecture Patterns & Best Practices

### System Architecture Overview

The Kodepos API follows a clean, scalable microservices architecture designed for high performance and maintainability:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Cloudflare Worker Runtime                   │
│                   (Edge Computing Environment)                 │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
    ┌───────▼──────┐ ┌───────▼──────┐ ┌───────▼──────┐
    │   HonoJS     │ │    Services │ │   Middleware  │
    │   Framework  │ │   Layer     │ │   & Filters   │
    └──────────────┘ └──────────────┘ └──────────────┘
            │                 │                 │
            └─────────────────┼─────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │    D1 Database     │
                    │   (SQLite Engine)  │
                    └───────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Legacy Adapter   │
                    │   (Compatibility)  │
                    └───────────────────┘
```

### Design Principles

#### 1. Clean Architecture

**Dependency Rule:**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Controllers   │───▶│   Services     │───▶│   Repositories  │
│   (API Layer)   │    │   (Business)    │    │   (Data Access) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
       ▲                       ▲                       ▲
       │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Interfaces    │    │   Interfaces    │    │   Interfaces    │
│   (Contracts)   │    │   (Contracts)   │    │   (Contracts)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Implementation:**
```typescript
// Service Interface (Contract)
interface IKodeposService {
  search(params: SearchParams): Promise<SearchResult>;
  detectLocation(lat: number, lng: number, radius: number): Promise<DetectResult>;
  findByCoordinates(lat: number, lng: number, radius: number): Promise<NearbyResult>;
}

// Service Implementation
export class KodeposService implements IKodeposService {
  constructor(private repository: IKodeposRepository) {}

  async search(params: SearchParams): Promise<SearchResult> {
    // Business logic here
    const results = await this.repository.findByQuery(params.query);
    return this.mapToSearchResult(results);
  }
}

// Repository Interface
interface IKodeposRepository {
  findByQuery(query: string): Promise<PostalCode[]>;
  findByCoordinates(lat: number, lng: number, radius: number): Promise<PostalCode[]>;
  findClosest(lat: number, lng: number): Promise<PostalCode | null>;
}
```

#### 2. Domain-Driven Design (DDD)

**Bounded Contexts:**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Search Domain │    │ Location Domain │    │ Data Domain     │
│                 │    │                 │    │                 │
│ - Search Filters│    │ - Coordinates   │    │ - Postal Codes  │
│ - Query Logic   │    │ - Distance      │    │ - Validation    │
│ - Results       │    │ - Location Dect.│    │ - Storage       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Domain Models:**
```typescript
// Domain Entity
export class PostalCode {
  constructor(
    public readonly kodepos: number,
    public readonly kelurahan: string,
    public readonly kecamatan: string,
    public readonly kota: string,
    public readonly provinsi: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly elevation?: number,
    public readonly timezone?: string
  ) {}

  // Domain methods
  public isWithinRadius(lat: number, lng: number, radiusKm: number): boolean {
    return this.calculateDistance(lat, lng) <= radiusKm;
  }

  public calculateDistance(lat: number, lng: number): number {
    // Haversine formula implementation
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat - this.latitude);
    const dLon = this.toRadians(lng - this.longitude);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(this.latitude)) * Math.cos(this.toRadians(lat)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

// Value Object
export class SearchQuery {
  constructor(
    public readonly value: string,
    public readonly filters?: SearchFilters
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new ValidationError('Search query cannot be empty');
    }

    if (this.value.length > 100) {
      throw new ValidationError('Search query too long (max 100 characters)');
    }
  }
}

// Aggregate Root
export class Location {
  constructor(
    public readonly postalCode: PostalCode,
    public readonly address: string,
    public readonly administrative: AdministrativeHierarchy
  ) {}
}

// Value Object
export class AdministrativeHierarchy {
  constructor(
    public readonly province: string,
    public readonly city: string,
    public readonly district: string,
    public readonly village: string
  ) {}

  public matches(query: string): boolean {
    return [this.province, this.city, this.district, this.village]
      .some(area => area.toLowerCase().includes(query.toLowerCase()));
  }
}
```

#### 3. Hexagonal Architecture

**Ports and Adapters Pattern:**
```typescript
// Primary Port - Application Service
export interface IKodeposApplicationService {
  searchPostalCodes(query: SearchQuery): Promise<SearchResult>;
  detectLocation(coordinates: Coordinates): Promise<DetectResult>;
  findNearbyLocations(center: LocationPoint, radius: Radius): Promise<NearbyResult>;
}

// Secondary Port - Repository Interface
export interface IKodeposRepository {
  find(query: SearchCriteria): Promise<PostalCode[]>;
  findNearby(point: LocationPoint, radius: Radius): Promise<PostalCode[]>;
}

// Primary Adapter - Controller
export class KodeposController {
  constructor(private service: IKodeposApplicationService) {}

  async handleSearch(request: SearchRequest): Promise<SearchResponse> {
    try {
      const query = new SearchQuery(request.query);
      const result = await this.service.searchPostalCodes(query);
      return new SearchResponse(result);
    } catch (error) {
      return new ErrorResponse(error);
    }
  }
}

// Secondary Adapter - Database
export class D1KodeposRepository implements IKodeposRepository {
  constructor(private db: D1Database) {}

  async find(query: SearchCriteria): Promise<PostalCode[]> {
    const sql = this.buildQuery(query);
    const { results } = await this.db.prepare(sql).bind(...query.parameters).all();
    return results.map(this.mapToPostalCode);
  }

  async findNearby(point: LocationPoint, radius: Radius): Promise<PostalCode[]> {
    // Haversine-based SQL query
    const sql = this.buildNearbyQuery(point, radius);
    const { results } = await this.db.prepare(sql).bind(point.latitude, point.longitude).all();
    return results.map(this.mapToPostalCode);
  }
}
```

### Performance Optimization Techniques

#### 1. Database Optimization

**Indexing Strategy:**
```sql
-- Full-text search indexes
CREATE INDEX idx_search_all ON postal_codes(kelurahan, kecamatan, kota, provinsi);

-- Geographic indexes for spatial queries
CREATE INDEX idx_coordinates ON postal_codes(latitude, longitude);

-- Composite indexes for filtered searches
CREATE INDEX idx_province_city ON postal_codes(provinsi, kota);
CREATE INDEX idx_province_district ON postal_codes(provinsi, kecamatan);
CREATE INDEX idx_postal_code ON postal_codes(kodepos);

-- Performance monitoring
CREATE INDEX idx_query_performance ON postal_codes(
  kelurahan, kecamatan, kota, provinsi, kodepos
);
```

**Query Optimization:**
```typescript
// Optimized search query with proper indexing
export class OptimizedKodeposRepository {
  async searchByMultipleFields(filters: SearchFilters): Promise<PostalCode[]> {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters.search) {
      conditions.push(
        '(kelurahan LIKE ? OR kecamatan LIKE ? OR kota LIKE ? OR provinsi LIKE ? OR kodepos LIKE ?)'
      );
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (filters.provinsi) {
      conditions.push('provinsi = ?');
      params.push(filters.provinsi);
    }

    if (filters.kota) {
      conditions.push('kota = ?');
      params.push(filters.kota);
    }

    if (filters.kecamatan) {
      conditions.push('kecamatan = ?');
      params.push(filters.kecamatan);
    }

    if (filters.kodepos) {
      conditions.push('kodepos = ?');
      params.push(parseInt(filters.kodepos));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT * FROM postal_codes ${whereClause} ORDER BY kelurahan LIMIT 100`;

    const { results } = await this.db.prepare(sql).bind(...params).all();
    return results;
  }

  async findNearbyOptimized(lat: number, lng: number, radiusKm: number): Promise<PostalCode[]> {
    // Optimized Haversine calculation using database functions
    const sql = `
      SELECT
        *,
        (6371 * acos(cos(radians(?)) * cos(radians(latitude)) *
        cos(radians(longitude) - radians(?)) + sin(radians(?)) *
        sin(radians(latitude)))) AS distance
      FROM postal_codes
      HAVING distance <= ?
      ORDER BY distance
      LIMIT 50
    `;

    const { results } = await this.db.prepare(sql)
      .bind(lat, lng, lat, radiusKm)
      .all();

    return results.map(this.mapWithDistance);
  }
}
```

#### 2. Caching Strategy

**Multi-Layer Caching:**
```typescript
export class MultiLayerCache {
  constructor(
    private memoryCache: MapCache,
    private kvCache: KVCache,
    private databaseCache: DatabaseCache
  ) {}

  async get(key: string): Promise<any> {
    // 1. Check memory cache (fastest, TTL: 5min)
    const memoryResult = await this.memoryCache.get(key);
    if (memoryResult) return memoryResult;

    // 2. Check KV cache (medium speed, TTL: 1 hour)
    const kvResult = await this.kvCache.get(key);
    if (kvResult) {
      // Store in memory cache for faster access
      await this.memoryCache.set(key, kvResult, 300);
      return kvResult;
    }

    // 3. Check database cache (slowest, TTL: 24 hours)
    const dbResult = await this.databaseCache.get(key);
    if (dbResult) {
      // Store in both caches
      await this.memoryCache.set(key, dbResult, 300);
      await this.kvCache.set(key, dbResult, 3600);
      return dbResult;
    }

    return null;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    // Store in all layers
    await this.memoryCache.set(key, value, Math.min(ttl, 300));
    await this.kvCache.set(key, value, ttl);
    await this.databaseCache.set(key, value, ttl * 24);
  }
}

// Memory cache implementation
export class MapCache {
  private cache = new Map<string, CacheEntry>();

  async get(key: string): Promise<any> {
    const entry = this.cache.get(key);
    if (!entry || Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    const expiry = Date.now() + (ttl * 1000);
    this.cache.set(key, { value, expiry });
  }
}

// KV cache implementation for Cloudflare
export class KVCache {
  constructor(private kv: KVNamespace) {}

  async get(key: string): Promise<any> {
    try {
      const value = await this.kv.get(key, { type: 'json' });
      return value;
    } catch {
      return null;
    }
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    try {
      await this.kv.put(key, JSON.stringify(value), {
        expirationTtl: ttl
      });
    } catch (error) {
      console.error('KV cache set error:', error);
    }
  }
}
```

#### 3. Response Optimization

**Response Compression and Formatting:**
```typescript
export class OptimizedResponseHandler {
  private static readonly CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff'
  };

  static createSuccessResponse(
    data: any,
    queryTime: number,
    cached: boolean = false
  ): Response {
    const response = {
      success: true,
      data,
      total: Array.isArray(data) ? data.length : 1,
      query_time_ms: queryTime,
      cached,
      message: 'Request completed successfully',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...this.CACHE_HEADERS,
        'X-Query-Time': `${queryTime}ms`,
        'X-Cached': cached ? 'true' : 'false',
        'Content-Length': Buffer.byteLength(JSON.stringify(response))
      }
    });
  }

  static createErrorResponse(
    error: string,
    statusCode: number = 400,
    details?: any
  ): Response {
    const response = {
      success: false,
      error,
      message: details?.message || error,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      request_id: generateRequestId()
    };

    return new Response(JSON.stringify(response), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Error-Code': error.replace(/\s+/g, '-').toLowerCase()
      }
    });
  }
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
```

### Security Best Practices

#### 1. Input Validation and Sanitization

```typescript
export class InputValidator {
  private static readonly PATTERNS = {
    postalCode: /^[0-9]{5}$/,
    coordinate: /^-?\d+(\.\d+)?$/,
    searchQuery: /^[a-zA-Z0-9\s\-.,]{1,100}$/
  };

  static validatePostalCode(postalCode: string): boolean {
    return this.PATTERNS.postalCode.test(postalCode);
  }

  static validateCoordinate(value: string, isLatitude: boolean = true): boolean {
    if (!this.PATTERNS.coordinate.test(value)) return false;

    const num = parseFloat(value);
    if (isLatitude) {
      return num >= -11 && num <= 6; // Indonesian latitude bounds
    } else {
      return num >= 95 && num <= 141; // Indonesian longitude bounds
    }
  }

  static validateSearchQuery(query: string): ValidationResult {
    if (!query || typeof query !== 'string') {
      return { valid: false, error: 'Search query is required' };
    }

    if (query.length > 100) {
      return { valid: false, error: 'Search query too long (max 100 characters)' };
    }

    if (!this.PATTERNS.searchQuery.test(query)) {
      return { valid: false, error: 'Invalid characters in search query' };
    }

    // Check for SQL injection patterns
    const sqlInjectionPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC)\b)/i,
      /(;|\-\-|\/\*|\*\/|@@|#)/
    ];

    for (const pattern of sqlInjectionPatterns) {
      if (pattern.test(query)) {
        return { valid: false, error: 'Invalid input detected' };
      }
    }

    return { valid: true };
  }
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}
```

#### 2. Rate Limiting

```typescript
export class RateLimiter {
  private static instance: RateLimiter;
  private requests = new Map<string, RequestCount>();

  static getInstance(): RateLimiter {
    if (!this.instance) {
      this.instance = new RateLimiter();
    }
    return this.instance;
  }

  async isAllowed(requestId: string): Promise<{ allowed: boolean; remaining: number }> {
    const now = Date.now();
    const window = 60 * 1000; // 1 minute window
    const limit = 100; // 100 requests per minute

    const requestCount = this.requests.get(requestId) || {
      count: 0,
      resetTime: now + window
    };

    // Clean expired entries
    if (now > requestCount.resetTime) {
      requestCount.count = 0;
      requestCount.resetTime = now + window;
    }

    requestCount.count++;

    this.requests.set(requestId, requestCount);

    const remaining = Math.max(0, limit - requestCount.count);
    const allowed = requestCount.count <= limit;

    return { allowed, remaining };
  }

  getResetTime(requestId: string): number {
    const requestCount = this.requests.get(requestId);
    return requestCount?.resetTime || Date.now();
  }
}

// Usage in middleware
export async function rateLimitMiddleware(c: Context, next: () => Promise<void>) {
  const clientIP = c.req.raw.headers.get('CF-Connecting-IP') || 'unknown';
  const limiter = RateLimiter.getInstance();

  const { allowed, remaining } = await limiter.isAllowed(clientIP);

  if (!allowed) {
    return c.json(
      {
        success: false,
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retry_after: Math.ceil((limiter.getResetTime(clientIP) - Date.now()) / 1000)
      },
      429
    );
  }

  // Add rate limit headers
  c.header('X-RateLimit-Limit', '100');
  c.header('X-RateLimit-Remaining', remaining.toString());
  c.header('X-RateLimit-Reset', Math.ceil(limiter.getResetTime(clientIP) / 1000).toString());

  await next();
}
```

#### 3. CORS and Security Headers

```typescript
export class SecurityMiddleware {
  static configureCORS(): MiddlewareHandler {
    return async (c, next) => {
      const origin = c.req.header('Origin') || '*';

      // Allow specific origins in production
      const allowedOrigins = [
        'https://yourdomain.com',
        'https://app.yourdomain.com',
        'https://localhost:3000'
      ];

      const isDevelopment = process.env.NODE_ENV === 'development';
      const isAllowedOrigin = isDevelopment || allowedOrigins.includes(origin);

      c.header('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
      c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
      c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      c.header('Access-Control-Max-Age', '86400');
      c.header('Access-Control-Allow-Credentials', 'true');

      // Handle preflight requests
      if (c.req.method === 'OPTIONS') {
        return c.text('', 204);
      }

      await next();
    };
  }

  static setSecurityHeaders(): MiddlewareHandler {
    return async (c, next) => {
      c.header('X-Content-Type-Options', 'nosniff');
      c.header('X-Frame-Options', 'DENY');
      c.header('X-XSS-Protection', '1; mode=block');
      c.header('Referrer-Policy', 'strict-origin-when-cross-origin');

      // Content Security Policy
      c.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';");

      // HSTS (in production)
      if (process.env.NODE_ENV === 'production') {
        c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      }

      await next();
    };
  }
}
```

---

## 🐛 Debugging & Monitoring Procedures

### Debugging Architecture

#### 1. Logging Infrastructure

**Structured Logging Implementation:**
```typescript
export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  timestamp: string;
  requestId: string;
  service: string;
  method: string;
  path: string;
  userAgent?: string;
  ip?: string;
  duration?: number;
  query?: any;
  result?: any;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  metadata?: Record<string, any>;
}

export class Logger {
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static createLogContext(
    level: LogEntry['level'],
    service: string,
    req: Request,
    duration: number
  ): LogEntry {
    return {
      level,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
      service,
      method: req.method,
      path: req.url,
      userAgent: req.headers.get('User-Agent'),
      ip: req.headers.get('CF-Connecting-IP'),
      duration,
      metadata: {}
    };
  }

  static info(context: LogEntry, message: string, data?: any): void {
    context.message = message;
    context.metadata = { ...context.metadata, ...data };
    this.log(context);
  }

  static error(context: LogEntry, error: Error, data?: any): void {
    context.level = 'error';
    context.error = {
      message: error.message,
      stack: error.stack,
      code: (error as any).code
    };
    context.metadata = { ...context.metadata, ...data };
    this.log(context);
  }

  private static log(entry: LogEntry): void {
    // Console logging with colors
    const colorMap = {
      debug: '\x1b[36m', // cyan
      info: '\x1b[32m',  // green
      warn: '\x1b[33m',  // yellow
      error: '\x1b[31m'  // red
    };

    const color = colorMap[entry.level];
    const reset = '\x1b[0m';

    console.log(`${color}[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.service}]${reset}`, {
      requestId: entry.requestId,
      method: entry.method,
      path: entry.path,
      duration: entry.duration ? `${entry.duration}ms` : undefined,
      message: entry.message,
      error: entry.error,
      metadata: entry.metadata
    });

    // In production, send to external logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(entry);
    }
  }

  private static async sendToLoggingService(entry: LogEntry): Promise<void> {
    try {
      await fetch(process.env.LOGGING_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      console.error('Failed to send logs to external service:', error);
    }
  }
}

// Request logging middleware
export function requestLoggingMiddleware(serviceName: string): MiddlewareHandler {
  return async (c, next) => {
    const startTime = Date.now();
    const requestId = Logger.generateRequestId();

    c.set('requestId', requestId);

    try {
      await next();
      const duration = Date.now() - startTime;

      const logContext = Logger.createLogContext(
        'info',
        serviceName,
        c.req,
        duration
      );

      Logger.info(logContext, 'Request completed', {
        statusCode: c.res.status,
        responseSize: c.res.headers.get('Content-Length')
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      const logContext = Logger.createLogContext(
        'error',
        serviceName,
        c.req,
        duration
      );

      Logger.error(logContext, error as Error);
      throw error;
    }
  };
}
```

#### 2. Debug Mode Configuration

**Environment-Specific Debugging:**
```typescript
export class DebugConfig {
  static isDebugMode(): boolean {
    return process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true';
  }

  static getLogLevel(): string {
    if (this.isDebugMode()) return 'debug';
    return process.env.LOG_LEVEL || 'info';
  }

  static enableVerboseLogging(): boolean {
    return this.isDebugMode() && process.env.VERBOSE === 'true';
  }

  static shouldLogQuery(): boolean {
    return this.isDebugMode() && process.env.LOG_QUERIES === 'true';
  }

  static shouldLogPerformance(): boolean {
    return this.isDebugMode() || process.env.LOG_PERFORMANCE === 'true';
  }
}

// Debug middleware for development
export function debugMiddleware(serviceName: string): MiddlewareHandler {
  return async (c, next) => {
    if (!DebugConfig.isDebugMode()) {
      return await next();
    }

    const startTime = Date.now();
    const requestId = c.get('requestId') || Logger.generateRequestId();

    console.log(`[${requestId}] 🚀 [${serviceName}] Starting request:`, {
      method: c.req.method,
      url: c.req.url,
      headers: Object.fromEntries(c.req.headers),
      query: Object.fromEntries(c.req.query()),
      body: await c.req.text()
    });

    try {
      await next();
      const duration = Date.now() - startTime;

      console.log(`[${requestId}] ✅ [${serviceName}] Request completed:`, {
        statusCode: c.res.status,
        duration: `${duration}ms`,
        responseSize: c.res.headers.get('Content-Length')
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[${requestId}] ❌ [${serviceName}] Request failed:`, {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        duration: `${duration}ms`
      });
      throw error;
    }
  };
}
```

#### 3. Database Query Debugging

**Query Performance Monitoring:**
```typescript
export class QueryDebugger {
  private static queries = new Map<string, QueryStats>();

  static logQuery(
    sql: string,
    params: any[],
    duration: number,
    resultCount: number
  ): void {
    const queryId = this.generateQueryId(sql, params);

    if (!this.queries.has(queryId)) {
      this.queries.set(queryId, {
        sql,
        params,
        count: 0,
        totalTime: 0,
        avgTime: 0,
        maxTime: 0,
        minTime: Infinity,
        resultCount: 0
      });
    }

    const stats = this.queries.get(queryId)!;
    stats.count++;
    stats.totalTime += duration;
    stats.avgTime = stats.totalTime / stats.count;
    stats.maxTime = Math.max(stats.maxTime, duration);
    stats.minTime = Math.min(stats.minTime, duration);
    stats.resultCount += resultCount;

    if (DebugConfig.shouldLogQuery()) {
      console.log('🔍 [Query Debug]:', {
        sql: this.sanitizeQuery(sql),
        params,
        duration: `${duration}ms`,
        resultCount,
        avgTime: `${stats.avgTime}ms`,
        count: stats.count
      });
    }
  }

  static getSlowQueries(threshold: number = 100): QueryStats[] {
    return Array.from(this.queries.values())
      .filter(query => query.avgTime > threshold)
      .sort((a, b) => b.avgTime - a.avgTime);
  }

  static reset(): void {
    this.queries.clear();
  }

  private static generateQueryId(sql: string, params: any[]): string {
    const normalizedSql = sql.replace(/\s+/g, ' ').trim();
    const paramString = JSON.stringify(params);
    return `${normalizedSql}:${paramString}`;
  }

  private static sanitizeQuery(sql: string): string {
    // Remove sensitive information from logged queries
    return sql
      .replace(/'[^']*'/g, "'***'")
      .replace(/"[^"]*"/g, '"***"');
  }
}

interface QueryStats {
  sql: string;
  params: any[];
  count: number;
  totalTime: number;
  avgTime: number;
  maxTime: number;
  minTime: number;
  resultCount: number;
}

// Database debugging wrapper
export class DebugDatabaseWrapper {
  constructor(private db: D1Database) {}

  async prepare(sql: string): D1PreparedStatement {
    const startTime = DebugConfig.shouldLogQuery() ? Date.now() : 0;

    return {
      ...this.db.prepare(sql),
      async bind(...params: any[]): Promise<D1Result> {
        const result = await this.db.prepare(sql).bind(...params).all();

        if (DebugConfig.shouldLogQuery()) {
          const duration = Date.now() - startTime;
          QueryDebugger.logQuery(sql, params, duration, result.results.length);
        }

        return result;
      }
    };
  }
}
```

### Monitoring and Alerting

#### 1. Health Check Enhancements

**Comprehensive Health Monitoring:**
```typescript
export class EnhancedHealthMonitor {
  constructor(
    private db: D1Database,
    private cache: KVCache,
    private logger: Logger
  ) {}

  async performHealthCheck(): Promise<HealthCheckResult> {
    const checks = await Promise.allSettled([
      this.checkDatabaseConnection(),
      this.checkCacheConnection(),
      this.checkMemoryUsage(),
      this.checkResponseTime(),
      this.checkDiskSpace()
    ]);

    const results = checks.map((check, index) => {
      const checkNames = [
        'database',
        'cache',
        'memory',
        'response_time',
        'disk_space'
      ];

      return {
        name: checkNames[index],
        status: check.status === 'fulfilled' ? 'healthy' : 'unhealthy',
        message: check.status === 'fulfilled' ?
          (check.value as any).message :
          (check.reason as Error).message,
        details: check.status === 'fulfilled' ?
          (check.value as any).details :
          { error: check.reason as Error }
      };
    });

    const overallStatus = results.every(r => r.status === 'healthy') ? 'healthy' : 'degraded';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      checks: results,
      metrics: await this.collectMetrics()
    };
  }

  private async checkDatabaseConnection(): Promise<HealthCheckItem> {
    const startTime = Date.now();

    try {
      await this.db.prepare('SELECT 1 as test').first();
      const duration = Date.now() - startTime;

      return {
        status: 'healthy',
        message: 'Database connection successful',
        details: {
          responseTime: `${duration}ms`,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Database connection failed',
        details: {
          error: error instanceof Error ? error.message : error,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  private async checkCacheConnection(): Promise<HealthCheckItem> {
    try {
      await this.cache.get('health-check-test');
      return {
        status: 'healthy',
        message: 'Cache connection successful',
        details: { timestamp: new Date().toISOString() }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Cache connection failed',
        details: {
          error: error instanceof Error ? error.message : error,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  private async checkMemoryUsage(): Promise<HealthCheckItem> {
    const memoryUsage = process.memoryUsage();
    const usedMemory = memoryUsage.heapUsed / 1024 / 1024; // MB
    const totalMemory = memoryUsage.heapTotal / 1024 / 1024; // MB
    const memoryPercentage = (usedMemory / totalMemory) * 100;

    return {
      status: memoryPercentage < 80 ? 'healthy' : 'warning',
      message: `Memory usage: ${memoryPercentage.toFixed(1)}%`,
      details: {
        usedMemory: `${usedMemory.toFixed(2)}MB`,
        totalMemory: `${totalMemory.toFixed(2)}MB`,
        percentage: `${memoryPercentage.toFixed(1)}%`,
        rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)}MB`
      }
    };
  }

  private async checkResponseTime(): Promise<HealthCheckItem> {
    const startTime = Date.now();

    try {
      await this.db.prepare('SELECT 1').first();
      const responseTime = Date.now() - startTime;

      return {
        status: responseTime < 100 ? 'healthy' : 'warning',
        message: `Database query time: ${responseTime}ms`,
        details: { responseTime: `${responseTime}ms` }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Failed to measure response time',
        details: { error: error instanceof Error ? error.message : error }
      };
    }
  }

  private async checkDiskSpace(): Promise<HealthCheckItem> {
    try {
      // Cloudflare Workers doesn't have direct disk access, but we can check through other means
      return {
        status: 'healthy',
        message: 'Disk space check not available in Workers environment',
        details: { note: 'This check is skipped in Cloudflare Workers' }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Disk space check failed',
        details: { error: error instanceof Error ? error.message : error }
      };
    }
  }

  private async collectMetrics(): Promise<Metrics> {
    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      requests: await this.getRequestMetrics(),
      database: await this.getDatabaseMetrics()
    };
  }

  private async getRequestMetrics(): Promise<RequestMetrics> {
    // Implement request counter and metrics
    return {
      total: 0,
      successful: 0,
      failed: 0,
      averageResponseTime: 0
    };
  }

  private async getDatabaseMetrics(): Promise<DatabaseMetrics> {
    // Implement database query metrics
    return {
      totalQueries: 0,
      averageQueryTime: 0,
      slowQueries: 0
    };
  }
}

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: HealthCheckItem[];
  metrics: Metrics;
}

interface HealthCheckItem {
  name: string;
  status: 'healthy' | 'warning' | 'unhealthy';
  message: string;
  details: any;
}

interface Metrics {
  timestamp: string;
  uptime: number;
  memory: NodeJS.MemoryUsage;
  requests: RequestMetrics;
  database: DatabaseMetrics;
}

interface RequestMetrics {
  total: number;
  successful: number;
  failed: number;
  averageResponseTime: number;
}

interface DatabaseMetrics {
  totalQueries: number;
  averageQueryTime: number;
  slowQueries: number;
}
```

#### 2. Performance Monitoring

**Real-time Performance Tracking:**
```typescript
export class PerformanceMonitor {
  private static metrics = new Map<string, PerformanceMetrics>();

  static startTracking(operation: string): () => void {
    const startTime = Date.now();
    const id = `${operation}_${startTime}`;

    return () => {
      const duration = Date.now() - startTime;
      this.recordMetric(operation, duration);
    };
  }

  static recordMetric(operation: string, duration: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, {
        count: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: 0,
        errors: 0,
        successCount: 0,
        errorCount: 0
      });
    }

    const metric = this.metrics.get(operation)!;
    metric.count++;
    metric.totalTime += duration;
    metric.minTime = Math.min(metric.minTime, duration);
    metric.maxTime = Math.max(metric.maxTime, duration);

    if (duration > 1000) { // Slow threshold
      console.warn(`⚠️ [Performance] Slow operation detected:`, {
        operation,
        duration: `${duration}ms`,
        threshold: '1000ms'
      });
    }

    this.checkAlerts(operation, duration);
  }

  static getMetrics(operation?: string): PerformanceMetrics | Map<string, PerformanceMetrics> {
    if (operation) {
      return this.metrics.get(operation) || this.getEmptyMetrics();
    }
    return this.metrics;
  }

  static resetMetrics(): void {
    this.metrics.clear();
  }

  private static getEmptyMetrics(): PerformanceMetrics {
    return {
      count: 0,
      totalTime: 0,
      minTime: Infinity,
      maxTime: 0,
      errors: 0,
      successCount: 0,
      errorCount: 0
    };
  }

  private static checkAlerts(operation: string, duration: number): void {
    if (duration > 5000) { // Critical threshold
      console.error(`🚨 [Performance Alert] Critical operation:`, {
        operation,
        duration: `${duration}ms`,
        threshold: '5000ms'
      });

      // Send alert to monitoring service
      this.sendAlert(operation, duration, 'critical');
    } else if (duration > 2000) { // Warning threshold
      console.warn(`⚠️ [Performance Alert] Slow operation:`, {
        operation,
        duration: `${duration}ms`,
        threshold: '2000ms'
      });

      this.sendAlert(operation, duration, 'warning');
    }
  }

  private static async sendAlert(
    operation: string,
    duration: number,
    level: 'critical' | 'warning'
  ): Promise<void> {
    try {
      await fetch(process.env.ALERTS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation,
          duration,
          level,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV
        })
      });
    } catch (error) {
      console.error('Failed to send performance alert:', error);
    }
  }
}

interface PerformanceMetrics {
  count: number;
  totalTime: number;
  minTime: number;
  maxTime: number;
  errors: number;
  successCount: number;
  errorCount: number;
}

// Usage in services
export class KodeposService {
  async search(params: SearchParams): Promise<SearchResult> {
    const endTracking = PerformanceMonitor.startTracking('kodepos_search');

    try {
      const result = await this.repository.search(params);
      endTracking();
      return result;
    } catch (error) {
      PerformanceMonitor.recordMetric('kodepos_search', 0); // Record with 0 duration to indicate failure
      throw error;
    }
  }
}
```

#### 3. Error Tracking and Reporting

**Comprehensive Error Handling:**
```typescript
export class ErrorTracker {
  static async trackError(
    error: Error,
    context: ErrorContext,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<string> {
    const errorId = this.generateErrorId();

    const errorReport = {
      id: errorId,
      timestamp: new Date().toISOString(),
      severity,
      context,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: (error as any).code
      },
      environment: process.env.NODE_ENV,
      version: '1.0.0'
    };

    // Log the error
    console.error(`🚨 [Error #${errorId}]`, errorReport);

    // Send to error tracking service
    await this.sendToErrorService(errorReport);

    // Check if this is a critical error that needs immediate attention
    if (severity === 'critical') {
      await this.sendCriticalAlert(errorReport);
    }

    return errorId;
  }

  private static generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static async sendToErrorService(errorReport: any): Promise<void> {
    try {
      await fetch(process.env.ERROR_TRACKING_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorReport)
      });
    } catch (error) {
      console.error('Failed to send error to tracking service:', error);
    }
  }

  private static async sendCriticalAlert(errorReport: any): Promise<void> {
    try {
      await fetch(process.env.CRITICAL_ALERTS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...errorReport,
          alert_type: 'critical_error'
        })
      });
    } catch (error) {
      console.error('Failed to send critical alert:', error);
    }
  }
}

interface ErrorContext {
  service: string;
  method: string;
  requestId?: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  parameters?: any;
  stackTrace?: string;
}

// Enhanced error handling middleware
export function errorHandlingMiddleware(serviceName: string): MiddlewareHandler {
  return async (c, next) => {
    const requestId = c.get('requestId');

    try {
      await next();
    } catch (error) {
      const errorContext: ErrorContext = {
        service: serviceName,
        method: c.req.method,
        requestId,
        ipAddress: c.req.raw.headers.get('CF-Connecting-IP'),
        userAgent: c.req.raw.headers.get('User-Agent'),
        parameters: Object.fromEntries(c.req.query()),
        stackTrace: error instanceof Error ? error.stack : undefined
      };

      // Determine severity based on error type
      const severity = this.determineErrorSeverity(error);

      // Track the error
      const errorId = await ErrorTracker.trackError(
        error as Error,
        errorContext,
        severity
      );

      // Return user-friendly error response
      return c.json({
        success: false,
        error: 'Internal server error',
        errorId,
        message: process.env.NODE_ENV === 'development' ?
          (error as Error).message :
          'An unexpected error occurred',
        timestamp: new Date().toISOString()
      }, 500);
    }
  };
}

function determineErrorSeverity(error: any): 'low' | 'medium' | 'high' | 'critical' {
  if (error instanceof Error) {
    if (error.message.includes('database') || error.message.includes('connection')) {
      return 'high';
    }

    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return 'low';
    }
  }

  return 'medium';
}
```

## 🔧 Development Workflow

### Unit Testing

**Example: Service Testing**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { KodeposService } from '../src/services/kodepos.service';

describe('KodeposService', () => {
  let service: KodeposService;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      prepare: vi.fn(),
      batch: vi.fn(),
      exec: vi.fn()
    };
    service = new KodeposService(mockDb);
  });

  describe('search', () => {
    it('should return search results for valid query', async () => {
      // Arrange
      const mockResults = [
        { kodepos: 10110, kelurahan: 'Menteng', kecamatan: 'Menteng' }
      ];
      mockDb.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({ results: mockResults })
        })
      });

      // Act
      const result = await service.search({ search: 'Menteng' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].kodepos).toBe(10110);
    });

    it('should handle empty search query', async () => {
      // Act & Assert
      await expect(service.search({ search: '' }))
        .rejects.toThrow('Search query is required');
    });
  });
});
```

### Integration Testing

**Example: API Endpoint Testing**
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../src/index';

describe('API Endpoints', () => {
  let testDb: D1Database;

  beforeAll(async () => {
    // Setup test database
    testDb = await createTestDatabase();
  });

  afterAll(async () => {
    // Cleanup test database
    await cleanupTestDatabase(testDb);
  });

  describe('GET /search', () => {
    it('should return legacy compatible response', async () => {
      const res = await app.request('/search?q=Jakarta', {}, testDb);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.statusCode).toBe(200);
      expect(data.code).toBe('OK');
      expect(Array.isArray(data.data)).toBe(true);
    });
  });
});
```

### Performance Testing

**Example: Load Testing Script**
```typescript
import { performance } from 'perf_hooks';

async function loadTest() {
  const concurrent = 100;
  const requests = [];

  for (let i = 0; i < concurrent; i++) {
    requests.push(
      fetch('https://your-api.workers.dev/search?q=Jakarta')
    );
  }

  const startTime = performance.now();
  const responses = await Promise.all(requests);
  const endTime = performance.now();

  const successCount = responses.filter(r => r.ok).length;
  const avgResponseTime = (endTime - startTime) / concurrent;

  console.log(`Success Rate: ${successCount}/${concurrent}`);
  console.log(`Avg Response Time: ${avgResponseTime}ms`);
}
```

---

## 🐛 Debugging Guide

### Local Debugging

**Enable Debug Logging:**
```typescript
const DEBUG = process.env.NODE_ENV === 'development';

function debugLog(message: string, data?: any) {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`, data);
  }
}
```

**Database Query Debugging:**
```typescript
async function debugQuery(db: D1Database, sql: string, params: any[]) {
  debugLog('Executing query', { sql, params });

  const startTime = performance.now();
  const result = await db.prepare(sql).bind(...params).all();
  const endTime = performance.now();

  debugLog('Query completed', {
    duration: `${endTime - startTime}ms`,
    resultCount: result.results.length
  });

  return result;
}
```

### Cloudflare Workers Debugging

**Local Testing with Wrangler:**
```bash
# Start local development with debugging
wrangler dev --local --debug

# Test with console logging
wrangler dev --log-level debug
```

**Remote Debugging:**
```typescript
// Add comprehensive logging for production debugging
app.use('*', async (c, next) => {
  const startTime = Date.now();
  const path = c.req.path;
  const method = c.req.method;

  console.log(`[${new Date().toISOString()}] ${method} ${path}`);

  try {
    await next();

    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${method} ${path} - ${c.res.status} (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] ${method} ${path} - ERROR (${duration}ms)`, error);
    throw error;
  }
});
```

### Common Issues and Solutions

**1. Database Connection Issues**
```typescript
// Always validate database connection
export async function validateDatabaseConnection(db: D1Database): Promise<boolean> {
  try {
    const result = await db.prepare('SELECT 1 as test').first();
    return result?.test === 1;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
```

**2. Memory Issues with Large Datasets**
```typescript
// Process results in batches to avoid memory issues
export async function processLargeDataset<T>(
  query: string,
  batchSize: number = 1000,
  processor: (batch: T[]) => Promise<void>
): Promise<void> {
  let offset = 0;

  while (true) {
    const batch = await db.prepare(query)
      .bind(batchSize, offset)
      .all();

    if (batch.results.length === 0) break;

    await processor(batch.results as T[]);
    offset += batchSize;
  }
}
```

**3. Coordinate Validation**
```typescript
// Indonesian coordinate bounds validation
export function validateIndonesianCoordinates(lat: number, lng: number): boolean {
  // Indonesia spans approximately -11 to 6 latitude, 95 to 141 longitude
  const INDONESIA_BOUNDS = {
    minLat: -11,
    maxLat: 6,
    minLng: 95,
    maxLng: 141
  };

  return lat >= INDONESIA_BOUNDS.minLat &&
         lat <= INDONESIA_BOUNDS.maxLat &&
         lng >= INDONESIA_BOUNDS.minLng &&
         lng <= INDONESIA_BOUNDS.maxLng;
}
```

---

## 🔄 Contributing Guidelines

### Pull Request Process

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone locally
   git clone https://github.com/YOUR_USERNAME/kodepos-api.git
   cd kodepos-api
   git remote add upstream https://github.com/mxwllalpha/kodepos-api.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Follow coding standards
   - Add tests for new features
   - Update documentation
   - Ensure all tests pass

4. **Submit Pull Request**
   ```bash
   git push origin feature/your-feature-name
   # Create PR on GitHub with detailed description
   ```

### Commit Message Standards

**Conventional Commits Format:**
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no functional changes)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

**Examples:**
```bash
git commit -m "feat(api): add nearby postal codes endpoint"
git commit -m "fix(database): resolve query timeout issue"
git commit -m "docs(api): update migration guide"
```

### Code Review Guidelines

**Review Checklist:**
- [ ] Code follows project standards
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No breaking changes (or documented)
- [ ] Performance considerations addressed
- [ ] Security implications reviewed
- [ ] Error handling is comprehensive

**Review Process:**
1. Self-review before creating PR
2. Request review from maintainers
3. Address all feedback
4. Ensure CI checks pass
5. Merge with approval

### Release Process

**Version Bumping:**
```bash
# Patch version (bug fixes)
npm version patch

# Minor version (new features)
npm version minor

# Major version (breaking changes)
npm version major
```

**Release Checklist:**
- [ ] Update CHANGELOG.md
- [ ] Update version in package.json
- [ ] Run full test suite
- [ ] Deploy to staging for testing
- [ ] Deploy to production
- [ ] Create GitHub release
- [ ] Update documentation

---

## 📚 API Development

### Adding New Endpoints

**1. Define Service Method**
```typescript
// src/services/kodepos.service.ts
export class KodeposService {
  async getPostalCodesByProvince(province: string): Promise<ServiceResult<PostalCode[]>> {
    const sql = 'SELECT * FROM postal_codes WHERE provinsi = ? ORDER BY kota, kecamatan, kelurahan';
    const result = await this.db.prepare(sql).bind(province).all();

    return {
      success: true,
      data: result.results as PostalCode[],
      total: result.results.length,
      query_time_ms: Date.now() - startTime
    };
  }
}
```

**2. Add API Endpoint**
```typescript
// src/index.ts
app.get('/api/v1/provinces/:province/cities', async (c) => {
  const db = c.env.KODEPOS_DB;
  const kodeposService = new KodeposService(db);

  const province = c.req.param('province');
  const result = await kodeposService.getCitiesByProvince(province);

  return c.json(result);
});
```

**3. Add Type Definitions**
```typescript
// src/types/kodepos.ts
export interface CitiesByProvinceParams {
  province: string;
}

export interface CitiesByProvinceResult {
  cities: string[];
  total: number;
}
```

**4. Add Tests**
```typescript
// tests/services/kodepos.service.test.ts
describe('getCitiesByProvince', () => {
  it('should return cities for valid province', async () => {
    const result = await service.getCitiesByProvince('DKI Jakarta');

    expect(result.success).toBe(true);
    expect(result.data).toContain('Jakarta Pusat');
    expect(result.data).toContain('Jakarta Selatan');
  });
});
```

### Response Format Standards

**Modern API Response Format:**
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  total?: number;
  query_time_ms?: number;
  cached?: boolean;
  message: string;
  timestamp: string;
  version: string;
}
```

**Legacy API Response Format:**
```typescript
interface LegacyApiResponse<T = any> {
  statusCode: number;
  code: string;
  data: T;
}
```

---

## 🔧 Environment Configuration

### Development Environment

**Environment Variables:**
```bash
# .env.development
NODE_ENV=development
CF_ACCOUNT_ID=your-account-id
CF_API_TOKEN=your-api-token
D1_DATABASE_ID=your-dev-database-id
KV_NAMESPACE_ID=your-dev-kv-id
```

**wrangler.toml:**
```toml
name = "kodepos-worker"
main = "src/index.ts"
compatibility_date = "2025-11-26"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "KODEPOS_DB"
database_name = "kodepos-db-dev"
database_id = "your-dev-database-id"

[[kv_namespaces]]
binding = "KODEPOS_CACHE"
id = "your-dev-kv-id"
preview_id = "your-preview-kv-id"

[env.production]
[[env.production.d1_databases]]
binding = "KODEPOS_DB"
database_name = "kodepos-db-prod"
database_id = "your-prod-database-id"
```

### Production Environment

**Environment Variables:**
```bash
# .env.production
NODE_ENV=production
CF_ACCOUNT_ID=your-production-account-id
CF_API_TOKEN=your-production-api-token
D1_DATABASE_ID=your-prod-database-id
KV_NAMESPACE_ID=your-prod-kv-id
```

---

## 📖 Additional Resources

### Documentation
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [D1 Database Documentation](https://developers.cloudflare.com/d1/)
- [HonoJS Framework](https://hono.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Tools and Libraries
- [Wrangler CLI](https://github.com/cloudflare/workers-sdk)
- [Vitest Testing Framework](https://vitest.dev/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)

### Community and Support
- [Cloudflare Discord](https://discord.cloudflare.com/)
- [GitHub Issues](https://github.com/mxwllalpha/kodepos-api/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/cloudflare-workers)

---

*Last Updated: November 26, 2025*
*Development Guide Version: 1.0.0*
*Author: Maxwell Alpha (https://github.com/mxwllalpha)*