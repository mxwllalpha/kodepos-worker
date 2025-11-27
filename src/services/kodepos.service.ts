/**
 * Kodepos Service
 * Core service for Indonesian postal code data operations
 *
 * @author Maxwell Alpha
 * @website https://github.com/mxwllalpha
 * @email mxwllalpha@gmail.com
 */

import type { D1Database } from '@cloudflare/workers-types';
import type { KodeposData, LocationQuery, CoordinateQuery, KodeposResponse, DetectLocationResponse } from '../types/kodepos';

export class KodeposService {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Search postal codes by various criteria
   */
  async search(query: LocationQuery): Promise<KodeposResponse> {
    const startTime = Date.now();

    try {
      let sql = 'SELECT * FROM postal_codes WHERE 1=1';
      const params: any[] = [];

      // Build dynamic query
      if (query.code) {
        sql += ' AND code = ?';
        params.push(query.code);
      }
      if (query.province) {
        sql += ' AND LOWER(province) LIKE LOWER(?)';
        params.push(`%${query.province}%`);
      }
      if (query.regency) {
        sql += ' AND LOWER(regency) LIKE LOWER(?)';
        params.push(`%${query.regency}%`);
      }
      if (query.district) {
        sql += ' AND LOWER(district) LIKE LOWER(?)';
        params.push(`%${query.district}%`);
      }
      if (query.village) {
        sql += ' AND LOWER(village) LIKE LOWER(?)';
        params.push(`%${query.village}%`);
      }
      if (query.search) {
        sql += ' AND (LOWER(province) LIKE LOWER(?) OR LOWER(regency) LIKE LOWER(?) OR LOWER(district) LIKE LOWER(?) OR LOWER(village) LIKE LOWER(?) OR code = ?)';
        const searchTerm = `%${query.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, query.search);
      }

      // Limit results for performance
      sql += ' LIMIT 100';

      const result = await this.db.prepare(sql).bind(...params).all();

      const queryTime = Date.now() - startTime;

      return {
        success: true,
        data: result.results as unknown as KodeposData[],
        total: result.results?.length || 0,
        query_time_ms: queryTime,
        cached: false
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        query_time_ms: Date.now() - startTime
      };
    }
  }

  /**
   * Detect location by coordinates (reverse geocoding)
   * Finds nearest postal code within specified radius
   */
  async detectLocation(latitude: number, longitude: number, radiusKm: number = 1.0): Promise<DetectLocationResponse> {
    const startTime = Date.now();

    try {
      // Check cache first
      const cacheKey = `detect_${latitude.toFixed(4)}_${longitude.toFixed(4)}_${radiusKm}`;
      const cachedResult = await this.getLocationCache(cacheKey);

      if (cachedResult) {
        return {
          success: true,
          data: cachedResult,
          query_time_ms: Date.now() - startTime,
          cached: true
        };
      }

      // Haversine formula for distance calculation
      const sql = `
        SELECT *,
          (6371 * acos(
            cos(radians(?)) * cos(radians(latitude)) *
            cos(radians(longitude) - radians(?)) +
            sin(radians(?)) * sin(radians(latitude))
          )) as distance_km
        FROM postal_codes
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        HAVING distance_km <= ?
        ORDER BY distance_km
        LIMIT 1
      `;

      const result = await this.db.prepare(sql)
        .bind(latitude, longitude, latitude, radiusKm)
        .first();

      if (!result) {
        return {
          success: false,
          message: 'No location found within specified radius',
          query_time_ms: Date.now() - startTime
        };
      }

      const locationData: DetectLocationResponse['data'] = {
        province: result.province as string,
        regency: result.regency as string,
        district: result.district as string,
        village: result.village as string,
        code: (result.code as number).toString(),
        latitude: result.latitude as number,
        longitude: result.longitude as number,
        elevation: result.elevation as number,
        timezone: result.timezone as string,
        distance_km: result.distance_km as number
      };

      // Cache the result for 24 hours
      await this.saveLocationCache(cacheKey, locationData, 24);

      return {
        success: true,
        data: locationData,
        query_time_ms: Date.now() - startTime,
        cached: false
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        query_time_ms: Date.now() - startTime
      };
    }
  }

  /**
   * Find locations within radius of coordinates
   */
  async findByCoordinates(latitude: number, longitude: number, radiusKm: number = 5.0): Promise<KodeposResponse> {
    const startTime = Date.now();

    try {
      const cacheKey = `coords_${latitude.toFixed(4)}_${longitude.toFixed(4)}_${radiusKm}`;
      const cachedResult = await this.getLocationCache(cacheKey);

      if (cachedResult) {
        return {
          success: true,
          data: cachedResult,
          query_time_ms: Date.now() - startTime,
          cached: true
        };
      }

      // Haversine formula with multiple results
      const sql = `
        SELECT *,
          (6371 * acos(
            cos(radians(?)) * cos(radians(latitude)) *
            cos(radians(longitude) - radians(?)) +
            sin(radians(?)) * sin(radians(latitude))
          )) as distance_km
        FROM postal_codes
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        HAVING distance_km <= ?
        ORDER BY distance_km
        LIMIT 50
      `;

      const result = await this.db.prepare(sql)
        .bind(latitude, longitude, latitude, radiusKm)
        .all();

      const queryTime = Date.now() - startTime;

      // Cache for 6 hours
      if (result.results && result.results.length > 0) {
        await this.saveLocationCache(cacheKey, result.results, 6);
      }

      return {
        success: true,
        data: result.results as unknown as KodeposData[],
        total: result.results?.length || 0,
        query_time_ms: queryTime,
        cached: false
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        query_time_ms: Date.now() - startTime
      };
    }
  }

  /**
   * Get unique provinces
   */
  async getProvinces(): Promise<string[]> {
    try {
      const result = await this.db.prepare(`
        SELECT DISTINCT province FROM postal_codes
        ORDER BY province
      `).all();

      return result.results?.map(row => row.province as string) || [];
    } catch (error) {
      console.error('Error fetching provinces:', error);
      return [];
    }
  }

  /**
   * Get cities in a province
   */
  async getCities(province: string): Promise<string[]> {
    try {
      const result = await this.db.prepare(`
        SELECT DISTINCT regency FROM postal_codes
        WHERE LOWER(province) = LOWER(?)
        ORDER BY regency
      `).bind(province).all();

      return result.results?.map(row => row.regency as string) || [];
    } catch (error) {
      console.error('Error fetching cities:', error);
      return [];
    }
  }

  /**
   * Bulk insert postal codes
   */
  async bulkInsert(kodeposData: KodeposData[]): Promise<{ success: boolean; inserted: number; errors: string[] }> {
    const errors: string[] = [];
    let inserted = 0;

    try {
      // Process in batches to avoid hitting limits
      const batchSize = 100;
      for (let i = 0; i < kodeposData.length; i += batchSize) {
        const batch = kodeposData.slice(i, i + batchSize);

        const sql = `
          INSERT OR REPLACE INTO kodepos
          (id, kodepos, provinsi, kota, kecamatan, kelurahan, latitude, longitude)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        for (const data of batch) {
          try {
            await this.db.prepare(sql).bind(
              data.id,
              data.code,
              data.province,
              data.regency,
              data.district,
              data.village,
              data.latitude,
              data.longitude
            ).run();

            inserted++;
          } catch (error) {
            errors.push(`Failed to insert ${data.code}: ${error}`);
          }
        }
      }

      return { success: errors.length === 0, inserted, errors };
    } catch (error) {
      return {
        success: false,
        inserted,
        errors: [`Bulk insert failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{ total_records: number; provinces: number; cities: number; districts: number; villages: number; last_updated?: string }> {
    try {
      const [totalResult, provinceResult, cityResult, districtResult, villageResult] = await Promise.all([
        this.db.prepare('SELECT COUNT(*) as count FROM postal_codes').first(),
        this.db.prepare('SELECT COUNT(DISTINCT province) as count FROM postal_codes').first(),
        this.db.prepare('SELECT COUNT(DISTINCT regency) as count FROM postal_codes').first(),
        this.db.prepare('SELECT COUNT(DISTINCT district) as count FROM postal_codes').first(),
        this.db.prepare('SELECT COUNT(DISTINCT village) as count FROM postal_codes').first()
      ]);

      return {
        total_records: (totalResult as any)?.count || 0,
        provinces: (provinceResult as any)?.count || 0,
        cities: (cityResult as any)?.count || 0,
        districts: (districtResult as any)?.count || 0,
        villages: (villageResult as any)?.count || 0
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return { total_records: 0, provinces: 0, cities: 0, districts: 0, villages: 0 };
    }
  }

  /**
   * Cache management methods
   */
  private async getLocationCache(cacheKey: string): Promise<any> {
    try {
      const result = await this.db.prepare(`
        SELECT result_data FROM location_cache
        WHERE cache_key = ? AND expires_at > CURRENT_TIMESTAMP
      `).bind(cacheKey).first();

      return result ? JSON.parse(result.result_data as string) : null;
    } catch (error) {
      return null;
    }
  }

  private async saveLocationCache(cacheKey: string, data: any, hoursToExpire: number): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + hoursToExpire * 60 * 60 * 1000)
        .toISOString().slice(0, 19).replace('T', ' ');

      await this.db.prepare(`
        INSERT OR REPLACE INTO location_cache (cache_key, result_data, expires_at)
        VALUES (?, ?, ?)
      `).bind(cacheKey, JSON.stringify(data), expiresAt).run();
    } catch (error) {
      console.warn('Failed to cache location data:', error);
    }
  }

  /**
   * Clean expired cache entries
   */
  async cleanExpiredCache(): Promise<number> {
    try {
      const result = await this.db.prepare(`
        DELETE FROM location_cache WHERE expires_at <= CURRENT_TIMESTAMP
      `).run();

      return result.meta.changes || 0;
    } catch (error) {
      console.error('Error cleaning cache:', error);
      return 0;
    }
  }
}