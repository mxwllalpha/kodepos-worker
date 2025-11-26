# Development Guide

**Kodepos API Indonesia - Development Setup and Contribution**

*Author: Maxwell Alpha (https://github.com/mxwllalpha) - mxwllalpha@gmail.com*
*Version: 1.0.0*

---

## 🚀 Quick Start

### Prerequisites

**Required Software:**
- **Node.js**: 18.x or higher
- **npm**: 8.x or higher
- **Git**: Latest version
- **Cloudflare Account**: For deployment
- **GitHub CLI**: For repository management

**Recommended Tools:**
- **VS Code**: with TypeScript extensions
- **Wrangler CLI**: Cloudflare Workers CLI
- **Postman/Insomnia**: For API testing

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/mxwllalpha/kodepos-api.git
cd kodepos-api

# 2. Install dependencies
npm install

# 3. Login to Cloudflare
npx wrangler auth login

# 4. Create D1 database
npx wrangler d1 create kodepos-db

# 5. Update wrangler.toml with your database ID
# 6. Apply database migrations
npm run db:migrate

# 7. Import data
npm run db:import

# 8. Start development server
npm run dev
```

### Project Structure

```
kodepos-worker/
├── src/
│   ├── index.ts                 # Main API application
│   ├── types/
│   │   └── kodepos.ts           # TypeScript definitions
│   └── services/
│       ├── kodepos.service.ts   # Core business logic
│       └── legacy-adapter.service.ts  # Response transformation
├── migrations/                  # Database migrations
│   ├── 001_create_kodepos_tables.sql
│   └── 002_import_kodepos_data.sql
├── scripts/                     # Utility scripts
│   └── import-data.js          # Data import utility
├── docs/                       # Documentation
├── data/                       # Source data
│   └── kodepos.json           # 83,761 postal codes
├── tests/                      # Test files
├── wrangler.toml              # Cloudflare configuration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
└── README.md                  # Project documentation
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

## 🧪 Testing Strategy

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