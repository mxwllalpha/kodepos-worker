# 🚀 Kodepos API Indonesia - Automated Deployment

<div align="center">

<a href="https://deploy.workers.cloudflare.com/?url=https://github.com/mxwllalpha/kodepos-worker">
  <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare Workers" />
</a>

[![Workflow Status](https://github.com/mxwllalpha/kodepos-worker/actions/workflows/deploy.yml/badge.svg)](https://github.com/mxwllalpha/kodepos-worker/actions)
[![Built with Cloudflare](https://workers.cloudflare.com/built-with-cloudflare.svg)](https://cloudflare.com)

![Kodepos API](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![Cloudflare Workers](https://img.shields.io/badge/Platform-Cloudflare%20Workers-orange.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue.svg)

**Lightning-fast Indonesian postal code API with 83,761 complete records**

[🚀 Quick Deploy](#-one-click-deployment-recommended) • [📖 Documentation](#-documentation) • [🔧 API Reference](#-api-reference) • [💻 Examples](#-examples) • [🤝 Contributing](CONTRIBUTING.md)

</div>

## ✨ Features

- 🇮🇩 **Complete Coverage**: 83,761 Indonesian postal codes with full administrative hierarchy
- ⚡ **Lightning Fast**: Built on Cloudflare Workers with <100ms response times
- 🎯 **Precise Search**: Advanced search with fuzzy matching and relevance scoring
- 📍 **Location-based**: Coordinate detection and nearby location search
- 🛡️ **Production Ready**: Rate limiting, caching, and comprehensive error handling
- 📚 **Developer Friendly**: RESTful API with comprehensive documentation
- 🆓 **Free Usage**: Generous free tier with no API keys required
- 🌍 **Global CDN**: Deployed on Cloudflare's global network
- 🚀 **Zero-Touch Deployment**: One-click deployment with automated database setup

## 📊 Data Coverage

| Metric | Count |
|--------|-------|
| **Total Postal Codes** | 83,761 |
| **Provinces** | 38 |
| **Regencies** | 514 |
| **Districts** | 7,024 |
| **Villages** | 83,761 |
| **Coordinates** | 100% |
| **Data Quality** | High |

## 🚀 One-Click Deployment (Recommended)

<a href="https://deploy.workers.cloudflare.com/?url=https://github.com/mxwllalpha/kodepos-worker">
  <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare Workers" />
</a>

**Zero Manual Setup Required!** 🎉

Click "Deploy to Cloudflare" button above for:
- ✅ **Automatic D1 database creation** (kodepos-db)
- ✅ **Automated migrations** (all tables, indexes, and 83,761 records)
- ✅ **Environment setup** (production + staging)
- ✅ **Global CDN deployment** on 200+ edge locations
- ✅ **Production-ready configuration** with rate limiting and caching
- ✅ **Health checks** and monitoring
- ✅ **Zero-touch deployment** from GitHub to production

### 🔄 Automatic Workflow Features

The GitHub Actions workflow handles:
1. **Database Creation**: Creates `kodepos-db` and `kodepos-db-staging`
2. **Migration Application**: Applies all SQL migrations in order
3. **Configuration Update**: Updates `wrangler.toml` with actual database IDs
4. **Deployment**: Deploys to production and staging environments
5. **Health Checks**: Verifies deployment and API functionality
6. **Environment Management**: Separate production and staging databases

### 🌐 Deployment URLs

After deployment, your API will be available at:
- **Production**: https://kodepos-worker.tekipik.workers.dev
- **Staging**: https://kodepos-worker-staging.tekipik.workers.dev
- **Development**: http://localhost:8787

### ⚙️ Environment Configuration

The deployment automatically configures three environments:

| Environment | Worker Name | Database | URL |
|-------------|--------------|----------|-----|
| **Production** | `kodepos-worker` | `kodepos-db` | https://kodepos-worker.tekipik.workers.dev |
| **Staging** | `kodepos-worker-staging` | `kodepos-db-staging` | https://kodepos-worker-staging.tekipik.workers.dev |
| **Development** | `kodepos-worker-dev` | `kodepos-db-dev` | Local development |

## 💻 Usage Examples

### Search by Postal Code

```javascript
// Find postal code 12345
const response = await fetch('https://kodepos-worker.tekipik.workers.dev/api/v1/code/12345');
const data = await response.json();

console.log(data);
// {
//   "success": true,
//   "data": {
//     "code": 12345,
//     "village": "Kelurahan Example",
//     "district": "Kecamatan Example",
//     "regency": "Kota Example",
//     "province": "DKI Jakarta",
//     "latitude": -6.2088,
//     "longitude": 106.8456
//   }
// }
```

### Search by Location Name

```javascript
// Search for locations named "Jakarta"
const response = await fetch('https://kodepos-worker.tekipik.workers.dev/api/v1/search?q=Jakarta&limit=10');
const data = await response.json();
```

### Find Nearby Locations

```javascript
// Find locations within 5km of coordinates
const response = await fetch('https://kodepos-worker.tekipik.workers.dev/api/v1/nearby?lat=-6.2088&lng=106.8456&radius=5');
const data = await response.json();
```

### List Administrative Areas

```javascript
// Get all provinces
const provinces = await fetch('https://kodepos-worker.tekipik.workers.dev/api/v1/provinces');

// Get regencies in a province
const regencies = await fetch('https://kodepos-worker.tekipik.workers.dev/api/v1/regencies/DKI%20Jakarta');
```

## 🔧 API Reference

### Core Endpoints

#### GET `/api/v1/search`
Search postal codes by various criteria
- **Parameters**: `search`, `kodepos`, `provinsi`, `kota`, `kecamatan`, `kelurahan`
- **Example**: `https://kodepos-worker.tekipik.workers.dev/api/v1/search?q=Jakarta`

#### GET `/api/v1/code/:kodepos`
Get specific postal code
- **Example**: `https://kodepos-worker.tekipik.workers.dev/api/v1/code/12345`

#### GET `/api/v1/detect`
Detect location by coordinates
- **Parameters**: `latitude`, `longitude`, `radius`
- **Example**: `https://kodepos-worker.tekipik.workers.dev/api/v1/detect?lat=-6.2088&lng=106.8456`

#### GET `/api/v1/nearby`
Find postal codes within radius
- **Example**: `https://kodepos-worker.tekipik.workers.dev/api/v1/nearby?lat=-6.2088&lng=106.8456&radius=5`

#### GET `/api/v1/provinces`
List all provinces
- **Example**: `https://kodepos-worker.tekipik.workers.dev/api/v1/provinces`

#### GET `/api/v1/cities/:province`
Get cities in a province
- **Example**: `https://kodepos-worker.tekipik.workers.dev/api/v1/cities/DKI%20Jakarta`

#### GET `/api/v1/stats`
Get database statistics
- **Example**: `https://kodepos-worker.tekipik.workers.dev/api/v1/stats`

### Health Check Endpoints

#### GET `/health`
Basic health check
- **Example**: `https://kodepos-worker.tekipik.workers.dev/health`

#### GET `/health/detailed`
Detailed health check with statistics
- **Example**: `https://kodepos-worker.tekipik.workers.dev/health/detailed`

### Legacy Compatibility

#### GET `/search`
Legacy endpoint for place search (compatible with original Kodepos API)
- **Example**: `https://kodepos-worker.tekipik.workers.dev/search?q=Jakarta`

#### GET `/detect`
Legacy endpoint for location detection
- **Example**: `https://kodepos-worker.tekipik.workers.dev/detect?latitude=-6.2088&longitude=106.8456`

## 📖 Documentation

### Core Concepts

#### Data Structure
Each postal code record contains:

```typescript
interface KodeposData {
  id: number;
  code: number;
  village: string;      // Kelurahan
  district: string;     // Kecamatan
  regency: string;      // Kabupaten/Kota
  province: string;     // Provinsi
  latitude: number;     // Latitude coordinate
  longitude: number;    // Longitude coordinate
  elevation?: number;   // Elevation above sea level
  timezone?: string;   // Timezone information
}
```

#### Administrative Hierarchy
Indonesian postal codes follow this hierarchy:
- **Province** (Provinsi) → **Regency** (Kabupaten/Kota) → **District** (Kecamatan) → **Village** (Kelurahan)

#### Response Format
All API responses follow this structure:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  version: string;
}
```

### Error Handling

#### HTTP Status Codes
- `200 OK` - Request successful
- `400 Bad Request` - Invalid parameters
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

#### Error Response Format
```json
{
  "success": false,
  "error": "Description of the error",
  "message": "Detailed error message",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### Rate Limiting

| Environment | Requests/Minute | Burst | Cache TTL |
|-------------|-----------------|-------|------------|
| **Production** | 100 | 10 | 1 hour |
| **Staging** | 50 | 5 | 30 minutes |
| **Development** | 10 | 2 | 5 minutes |

### Caching Strategy

- **Public endpoints**: 1 hour cache (production), 30 minutes (staging), 5 minutes (development)
- **Search results**: 15 minutes cache with intelligent invalidation
- **Geospatial queries**: 30 minutes cache for coordinate-based queries
- **Statistics**: 5 minutes cache for database statistics

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- Cloudflare account with Workers and D1 permissions
- Git

### Quick Start

```bash
# Clone repository
git clone https://github.com/mxwllalpha/kodepos-worker.git
cd kodepos-worker

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup local database and configuration
npm run setup:local

# Start development server
npm run dev
```

### Development Scripts

```bash
# Development
npm run dev                  # Start development server
npm run dev:staging          # Staging development
npm run dev:production         # Production development mode

# Database Management
npm run db:setup              # Create and migrate database
npm run db:migrate             # Run migrations
npm run db:info                # Show database info

# Testing and Validation
npm run test                   # Run tests
npm run type-check             # TypeScript checking
npm run lint:check             # ESLint checking
npm run config:validate         # Validate configuration
npm run config:validate:all     # Validate all environments

# Documentation
npm run docs:generate          # Generate documentation
npm run docs:check-consistency  # Check documentation consistency

# Deployment
npm run deploy:development    # Deploy to development
npm run deploy:staging        # Deploy to staging
npm run deploy                # Deploy to production
npm run deploy:all             # Deploy to all environments
```

### Environment Variables

Key environment variables for local development:

```bash
# Environment
ENVIRONMENT=development

# API Configuration
API_BASE_URL=http://localhost:8787
WORKER_NAME=kodepos-worker-dev
DATABASE_NAME=kodepos-db-dev

# Features
ENABLE_CACHE=true
ENABLE_RATE_LIMITING=false
ENABLE_LOGGING=true

# Debug
LOG_LEVEL=info
DEBUG=true
```

## 🔧 Configuration

This deployment automatically manages configuration for multiple environments:

### Environment-Specific Settings

| Setting | Development | Staging | Production |
|----------|-------------|---------|------------|
| **API_BASE_URL** | http://localhost:8787 | https://kodepos-worker-staging.tekipik.workers.dev | https://kodepos-worker.tekipik.workers.dev |
| **Database** | kodepos-db-dev | kodepos-db-staging | kodepos-db |
| **Cache TTL** | 300s | 1800s | 3600s |
| **Rate Limit** | 10/min | 50/min | 100/min |
| **Debug Mode** | Enabled | Enabled | Disabled |
| **Workers** | kodepos-worker-dev | kodepos-worker-staging | kodepos-worker |

### Configuration Management

All configuration is managed through:
- **wrangler.toml**: Environment definitions and variables
- **ConfigurationService**: Centralized configuration management
- **Environment validation**: Automated validation scripts
- **Template documentation**: Dynamic documentation generation

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm run test`
5. Validate configuration: `npm run config:validate`
6. Type check: `npm run type-check`
7. Commit changes: `npm run commit`
8. Push to your fork
9. Create a Pull Request

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Comprehensive linting rules
- **Prettier**: Consistent code formatting
- **Tests**: High test coverage required
- **Documentation**: Updated with changes

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Kodepos API**: Original inspiration and data source reference
- **Cloudflare Workers**: Serverless hosting platform
- **HonoJS**: Fast web framework
- **Indonesian Postal Service**: Data source and validation

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/mxwllalpha/kodepos-worker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mxwllalpha/kodepos-worker/discussions)
- **Email**: mxwllalpha@gmail.com

---

*Generated for PRODUCTION environment* | *Configuration: https://kodepos-worker.tekipik.workers.dev* | *Worker: kodepos-worker*
