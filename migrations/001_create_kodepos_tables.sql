-- Kodepos Database Migration 001
-- Create tables for Indonesian postal code data (83,761 records)
-- Author: Maxwell Alpha (https://github.com/mxwllalpha) - mxwllalpha@gmail.com

-- Main postal codes table - optimized for 83,761 records
CREATE TABLE IF NOT EXISTS postal_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code INTEGER NOT NULL UNIQUE,              -- Postal code (e.g., 12345)
  village TEXT NOT NULL,                        -- Kelurahan name
  district TEXT NOT NULL,                       -- Kecamatan name
  regency TEXT NOT NULL,                         -- Kota/Kabupaten name
  province TEXT NOT NULL,                        -- Province name
  latitude REAL NOT NULL,                        -- Geographic latitude
  longitude REAL NOT NULL,                       -- Geographic longitude
  elevation INTEGER DEFAULT NULL,               -- Elevation in meters
  timezone TEXT DEFAULT 'WIB',                    -- Timezone (WIB/WITA/WIT)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CHECK(code > 9999 AND code < 100000),            -- Valid Indonesian postal codes
  CHECK(latitude >= -11 AND latitude <= 6),          -- Indonesian latitude bounds
  CHECK(longitude >= 95 AND longitude <= 141)         -- Indonesian longitude bounds
);

-- Indexes for fast querying - optimized for 83,761 records
CREATE INDEX IF NOT EXISTS idx_postal_codes_code ON postal_codes(code);
CREATE INDEX IF NOT EXISTS idx_postal_codes_province ON postal_codes(province);
CREATE INDEX IF NOT EXISTS idx_postal_codes_regency ON postal_codes(regency);
CREATE IF NOT EXISTS idx_postal_codes_district ON postal_codes(district);
CREATE INDEX IF NOT EXISTS idx_postal_codes_village ON postal_codes(village);

-- Coordinates index for location-based queries - critical for nearby search
CREATE INDEX IF NOT EXISTS idx_postal_codes_coordinates ON postal_codes(latitude, longitude);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_postal_codes_province_code ON postal_codes(province, code);
CREATE INDEX IF NOT EXISTS idx_postal_codes_regency_code ON postal_codes(regency, code);

-- Location cache for coordinate-based lookups (performance optimization)
CREATE TABLE IF NOT EXISTS location_cache (
  cache_key TEXT PRIMARY KEY,                    -- e.g., "lat_lng_radius"
  latitude REAL NOT NULL,                       -- Center latitude
  longitude REAL NOT NULL,                      -- Center longitude
  radius_km REAL NOT NULL DEFAULT 5.0,         -- Search radius in km
  result_count INTEGER DEFAULT 0,                 -- Number of results found
  result_data TEXT,                                 -- JSON string of postal codes
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME DEFAULT (CURRENT_TIMESTAMP + 3600)  -- 1 hour TTL
);

-- Index for cache performance
CREATE INDEX IF NOT EXISTS idx_location_cache_key ON location_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_location_cache_expires ON location_cache(expires_at);

-- API usage statistics for monitoring
CREATE TABLE IF NOT EXISTS api_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint TEXT NOT NULL,                         -- API endpoint name
  method TEXT NOT NULL DEFAULT 'GET',               -- HTTP method
  status_code INTEGER NOT NULL,                     -- HTTP status code
  response_time_ms INTEGER,                          -- Response time in ms
  cache_hit BOOLEAN DEFAULT FALSE,                    -- Was response cached
  user_agent TEXT,                                  -- User agent string
  ip_address TEXT,                                   -- Client IP (hashed)
  request_date DATE DEFAULT CURRENT_DATE,             -- Date grouping
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_api_stats_endpoint ON api_stats(endpoint);
CREATE IF NOT EXISTS idx_api_stats_status ON api_stats(status_code);
CREATE IF NOT EXISTS idx_api_stats_date ON api_stats(request_date);

-- Popular searches cache
CREATE TABLE IF NOT EXISTS popular_searches (
  search_term TEXT PRIMARY KEY,
  search_count INTEGER DEFAULT 1,
  last_searched DATETIME DEFAULT CURRENT_TIMESTAMP,
  result_count INTEGER DEFAULT 0
);

-- Data source version tracking
CREATE TABLE IF NOT EXISTS data_version (
  table_name TEXT PRIMARY KEY,                     -- Table name
  version TEXT NOT NULL,                            -- Version identifier
  record_count INTEGER NOT NULL,                    -- Number of records
  import_date DATETIME NOT NULL,                     -- Import timestamp
  checksum TEXT,                                    -- File checksum for validation
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Initial data version entry
INSERT OR IGNORE INTO data_version (table_name, version, record_count, import_date, created_at) VALUES (
  'postal_codes',
  '1.0.0',
  0, -- Will be updated after import
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Migration tracking table
CREATE TABLE IF NOT EXISTS d1_migrations (
  name TEXT PRIMARY KEY,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Record this migration
INSERT INTO d1_migrations (name, applied_at) VALUES (
  '001_create_kodepos_tables',
  CURRENT_TIMESTAMP
) ON CONFLICT(name) DO NOTHING;