/**
 * Kodepos Worker - Indonesian Postal Code API
 * High-performance postal code lookup service with global edge distribution
 *
 * @author Maxwell Alpha
 * @website https://github.com/mxwlllph
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

import { KodeposService } from './services/kodepos.service';
import { transformToLegacyFormat, createLegacyResponse, createLegacyErrorResponse, createLegacyNotFoundResponse, createLegacyServerErrorResponse, validateSearchQuery, transformToLegacyDetectFormat, validateCoordinates } from './services/legacy-adapter.service';
import { ConfigurationService } from './services/configuration.service';
import type { Env, ApiResponse, HealthCheckResponse } from './types/kodepos';

// Create Hono app
const app = new Hono<{ Bindings: Env }>();

/**
 * Global Middleware Configuration
 */
app.use('*', logger());
app.use('*', prettyJSON());

// CORS configuration
app.use('*', cors({
  origin: ['*'], // Allow all origins for public API
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));

/**
 * Helper function to create standardized API responses
 */
function createApiResponse<T = any>(
  success: boolean,
  data?: T,
  error?: string,
  message?: string
): ApiResponse<T> {
  return {
    success,
    data,
    error,
    message,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };
}

/**
 * Health Check Endpoints
 */

/**
 * GET /health
 * Basic health check
 */
app.get('/health', async (c) => {
  const db = c.env.KODEPOS_DB;
  let dbStatus: 'connected' | 'error' = 'error';

  try {
    await db.prepare('SELECT 1').first();
    dbStatus = 'connected';
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  const response: HealthCheckResponse = {
    status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    total_records: 0,
    cache_enabled: true
  };

  return c.json(response);
});

/**
 * GET /health/detailed
 * Detailed health check with statistics
 */
app.get('/health/detailed', async (c) => {
  const db = c.env.KODEPOS_DB;
  let dbStatus: 'connected' | 'error' = 'error';
  let totalRecords = 0;

  try {
    await db.prepare('SELECT 1').first();
    dbStatus = 'connected';

    const kodeposService = new KodeposService(db);
    const stats = await kodeposService.getStats();
    totalRecords = stats.total_records;

  } catch (error) {
    console.error('Database health check failed:', error);
  }

  const response: HealthCheckResponse = {
    status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    total_records: totalRecords,
    cache_enabled: true
  };

  return c.json(response);
});

/**
 * Kodepos API Endpoints
 */

/**
 * GET /api/v1/search
 * Search postal codes by various criteria
 * Query parameters:
 * - search: General search term
 * - kodepos: Specific postal code
 * - provinsi: Province name
 * - kota: City name
 * - kecamatan: District name
 * - kelurahan: Village name
 */
app.get('/api/v1/search', async (c) => {
  const db = c.env.KODEPOS_DB;
  const kodeposService = new KodeposService(db);

  try {
    const query = {
      search: c.req.query('search'),
      kodepos: c.req.query('kodepos'),
      provinsi: c.req.query('provinsi'),
      kota: c.req.query('kota'),
      kecamatan: c.req.query('kecamatan'),
      kelurahan: c.req.query('kelurahan')
    };

    const result = await kodeposService.search(query);

    return c.json(createApiResponse(true, result, undefined, result.message));

  } catch (error) {
    console.error('Search error:', error);
    return c.json(createApiResponse(false, undefined, 'Search failed', error instanceof Error ? error.message : 'Unknown error'), 500);
  }
});

/**
 * GET /api/v1/detect
 * Detect location by coordinates (reverse geocoding)
 * Query parameters:
 * - latitude: Latitude (required)
 * - longitude: Longitude (required)
 * - radius: Search radius in km (default: 1.0)
 */
app.get('/api/v1/detect', async (c) => {
  const db = c.env.KODEPOS_DB;
  const kodeposService = new KodeposService(db);

  try {
    const lat = c.req.query('latitude');
    const lng = c.req.query('longitude');
    const radius = c.req.query('radius');

    if (!lat || !lng) {
      return c.json(createApiResponse(false, undefined, 'Missing required parameters: latitude and longitude'), 400);
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = radius ? parseFloat(radius) : 1.0;

    if (isNaN(latitude) || isNaN(longitude)) {
      return c.json(createApiResponse(false, undefined, 'Invalid coordinates'), 400);
    }

    const result = await kodeposService.detectLocation(latitude, longitude, radiusKm);

    if (result.success) {
      return c.json(createApiResponse(true, result, undefined, result.message));
    } else {
      return c.json(createApiResponse(false, undefined, 'Location detection failed', result.message), 404);
    }

  } catch (error) {
    console.error('Detect error:', error);
    return c.json(createApiResponse(false, undefined, 'Location detection failed', error instanceof Error ? error.message : 'Unknown error'), 500);
  }
});

/**
 * GET /api/v1/nearby
 * Find postal codes within radius of coordinates
 * Query parameters:
 * - latitude: Latitude (required)
 * - longitude: Longitude (required)
 * - radius: Search radius in km (default: 5.0)
 */
app.get('/api/v1/nearby', async (c) => {
  const db = c.env.KODEPOS_DB;
  const kodeposService = new KodeposService(db);

  try {
    const lat = c.req.query('latitude');
    const lng = c.req.query('longitude');
    const radius = c.req.query('radius');

    if (!lat || !lng) {
      return c.json(createApiResponse(false, undefined, 'Missing required parameters: latitude and longitude'), 400);
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = radius ? parseFloat(radius) : 5.0;

    if (isNaN(latitude) || isNaN(longitude)) {
      return c.json(createApiResponse(false, undefined, 'Invalid coordinates'), 400);
    }

    const result = await kodeposService.findByCoordinates(latitude, longitude, radiusKm);

    if (result.success) {
      return c.json(createApiResponse(true, result, undefined, result.message));
    } else {
      return c.json(createApiResponse(false, undefined, 'Nearby search failed', result.message), 404);
    }

  } catch (error) {
    console.error('Nearby search error:', error);
    return c.json(createApiResponse(false, undefined, 'Nearby search failed', error instanceof Error ? error.message : 'Unknown error'), 500);
  }
});

/**
 * GET /api/v1/provinces
 * Get all unique provinces
 */
app.get('/api/v1/provinces', async (c) => {
  const db = c.env.KODEPOS_DB;
  const kodeposService = new KodeposService(db);

  try {
    const provinces = await kodeposService.getProvinces();
    return c.json(createApiResponse(true, provinces));
  } catch (error) {
    console.error('Get provinces error:', error);
    return c.json(createApiResponse(false, undefined, 'Failed to fetch provinces', error instanceof Error ? error.message : 'Unknown error'), 500);
  }
});

/**
 * GET /api/v1/cities/:province
 * Get all cities in a province
 */
app.get('/api/v1/cities/:province', async (c) => {
  const db = c.env.KODEPOS_DB;
  const kodeposService = new KodeposService(db);

  try {
    const province = c.req.param('province');
    const cities = await kodeposService.getCities(province);
    return c.json(createApiResponse(true, cities));
  } catch (error) {
    console.error('Get cities error:', error);
    return c.json(createApiResponse(false, undefined, 'Failed to fetch cities', error instanceof Error ? error.message : 'Unknown error'), 500);
  }
});

/**
 * GET /api/v1/stats
 * Get database statistics
 */
app.get('/api/v1/stats', async (c) => {
  const db = c.env.KODEPOS_DB;
  const kodeposService = new KodeposService(db);

  try {
    const stats = await kodeposService.getStats();
    return c.json(createApiResponse(true, stats));
  } catch (error) {
    console.error('Get stats error:', error);
    return c.json(createApiResponse(false, undefined, 'Failed to fetch statistics', error instanceof Error ? error.message : 'Unknown error'), 500);
  }
});

/**
 * Legacy compatibility endpoints
 * These maintain compatibility with the original Kodepos API format
 */

/**
 * GET /detect
 * Legacy endpoint for location detection
 * Compatible with https://kodepos.vercel.app/detect/
 */
app.get('/detect', async (c) => {
  const db = c.env.KODEPOS_DB;
  const kodeposService = new KodeposService(db);

  try {
    const lat = c.req.query('latitude');
    const lng = c.req.query('longitude');

    // Validate coordinates using the adapter service
    const validation = validateCoordinates(lat, lng);
    if (!validation.valid) {
      const errorResponse = createLegacyErrorResponse(validation.error || 'Invalid coordinates', 400);
      return c.json(errorResponse, 400);
    }

    const result = await kodeposService.detectLocation(validation.latitude!, validation.longitude!);

    if (result.success && result.data) {
      // Transform data to legacy detect format using the adapter service
      const legacyData = transformToLegacyDetectFormat(result.data, result.data.distance_km);
      return c.json({
        statusCode: 200,
        code: 'OK',
        data: legacyData
      });
    } else {
      const errorResponse = createLegacyNotFoundResponse(result.message || 'Location not found');
      return c.json(errorResponse, 404);
    }

  } catch (error) {
    console.error('Legacy detect error:', error);
    const errorResponse = createLegacyServerErrorResponse('Internal server error');
    return c.json(errorResponse, 500);
  }
});

/**
 * GET /search
 * Legacy endpoint for place search
 * Compatible with https://kodepos.vercel.app/search?q=Jakarta
 */
app.get('/search', async (c) => {
  const db = c.env.KODEPOS_DB;
  const kodeposService = new KodeposService(db);

  try {
    const query = c.req.query('q');

    // Validate query parameter
    const validation = validateSearchQuery(query);
    if (!validation.valid) {
      const errorResponse = createLegacyErrorResponse(validation.error || 'Invalid query', 400);
      return c.json(errorResponse, 400);
    }

    const result = await kodeposService.search({ search: validation.query! });

    if (result.success && result.data) {
      // Transform data to legacy format
      const legacyData = transformToLegacyFormat(result.data);
      return c.json(createLegacyResponse(legacyData, 'OK'));
    } else {
      const errorResponse = createLegacyNotFoundResponse(result.message || 'No results found');
      return c.json(errorResponse, 404);
    }

  } catch (error) {
    console.error('Legacy search error:', error);
    const errorResponse = createLegacyErrorResponse('Internal server error', 500);
    return c.json(errorResponse, 500);
  }
});

/**
 * Root endpoint
 * API information and documentation
 */
app.get('/', (c) => {
  return c.json({
    name: 'Kodepos Worker API',
    version: '1.0.0',
    author: 'Maxwell Alpha',
    description: 'High-performance Indonesian postal code API with global edge distribution',
    endpoints: {
      health: {
        basic: '/health',
        detailed: '/health/detailed'
      },
      api: {
        search: '/api/v1/search',
        detect: '/api/v1/detect',
        nearby: '/api/v1/nearby',
        provinces: '/api/v1/provinces',
        cities: '/api/v1/cities/:province',
        stats: '/api/v1/stats'
      },
      legacy: {
        search: '/search', // Compatible with https://kodepos.vercel.app/search
        detect: '/detect' // Compatible with original API
      }
    },
    features: [
      'Coordinate-based location detection',
      'Radius search for nearby postal codes',
      'Comprehensive search capabilities',
      'Built-in caching for performance',
      'Global edge distribution',
      'Legacy API compatibility',
      'High availability and performance'
    ],
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

/**
 * 404 handler
 */
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    availableEndpoints: {
      health: '/health',
      detailed: '/health/detailed',
      search: '/api/v1/search',
      detect: '/api/v1/detect',
      nearby: '/api/v1/nearby',
      provinces: '/api/v1/provinces',
      cities: '/api/v1/cities/:province',
      stats: '/api/v1/stats',
      legacy: {
        search: '/search',
        detect: '/detect'
      },
      root: '/'
    },
    version: '1.0.0',
    timestamp: new Date().toISOString()
  }, 404);
});

/**
 * Export for Cloudflare Workers
 */
export default {
  fetch: app.fetch,
};