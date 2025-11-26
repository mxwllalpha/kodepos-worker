#!/usr/bin/env node

/**
 * Kodepos API Indonesia - Professional Data Import Script
 * Optimized for 83,761 records with validation and progress tracking
 *
 * Author: Maxwell Alpha (https://github.com/mxwllalpha) - mxwllalpha@gmail.com
 * License: MIT
 *
 * Usage:
 * node scripts/import-data.js [source] [options]
 *
 * Sources:
 * - json: Import from JSON file (default: ./data/kodepos.json)
 * - sample: Import sample data for testing
 *
 * Options:
 * --batch-size=<number>: Batch size for SQL generation (default: 1000)
 * --validate: Enable data validation (default: true)
 * --output=<file>: Output SQL file (default: migrations/002_import_kodepos_data.sql)
 *
 * Examples:
 * node scripts/import-data.js json --batch-size=500 --validate=true
 * node scripts/import-data.js sample
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  BATCH_SIZE: parseInt(process.argv.find(arg => arg.startsWith('--batch-size='))?.split('=')[1]) || 1000,
  VALIDATE: process.argv.includes('--validate') ? true : !process.argv.includes('--no-validate'),
  OUTPUT_FILE: process.argv.find(arg => arg.startsWith('--output='))?.split('=')[1] || 'migrations/002_import_kodepos_data.sql',
  MAX_DISPLAY_ITEMS: 5
};

// Sample data for testing
const sampleData = [
  {
    "code": 10110,
    "village": "Menteng",
    "district": "Menteng",
    "regency": "Jakarta Pusat",
    "province": "DKI Jakarta",
    "latitude": -6.1944,
    "longitude": 106.8229,
    "elevation": 12,
    "timezone": "WIB"
  },
  {
    "code": 10120,
    "village": "Cikini",
    "district": "Menteng",
    "regency": "Jakarta Pusat",
    "province": "DKI Jakarta",
    "latitude": -6.1856,
    "longitude": 106.8341,
    "elevation": 15,
    "timezone": "WIB"
  }
];

/**
 * Progress tracking class
 */
class ProgressTracker {
  constructor(total) {
    this.total = total;
    this.processed = 0;
    this.errors = 0;
    this.startTime = Date.now();
    this.lastUpdate = this.startTime;
  }

  update(increment = 1, isError = false) {
    this.processed += increment;
    if (isError) this.errors += increment;

    const now = Date.now();
    if (now - this.lastUpdate > 1000) { // Update every second
      this.printProgress();
      this.lastUpdate = now;
    }
  }

  printProgress() {
    const percentage = ((this.processed / this.total) * 100).toFixed(1);
    const elapsed = (Date.now() - this.startTime) / 1000;
    const rate = Math.round(this.processed / elapsed);
    const eta = this.processed > 0 ? Math.round((this.total - this.processed) / rate) : 0;

    process.stdout.write(`\r📊 Progress: ${percentage}% (${this.processed}/${this.total}) | ${rate} records/s | ETA: ${eta}s | Errors: ${this.errors}`);
  }

  finish() {
    this.printProgress();
    const totalTime = (Date.now() - this.startTime) / 1000;
    console.log(`\n✅ Completed in ${totalTime.toFixed(2)}s | ${Math.round(this.processed / totalTime)} records/s | Errors: ${this.errors}`);
  }
}

/**
 * Data validation functions
 */
const validator = {
  isValidPostalCode: (code) => typeof code === 'number' && code > 9999 && code < 100000,
  isValidCoordinate: (coord) => typeof coord === 'number' && coord >= -180 && coord <= 180,
  isValidName: (name) => typeof name === 'string' && name.trim().length > 0,
  isValidTimezone: (tz) => typeof tz === 'string' && ['WIB', 'WITA', 'WIT'].includes(tz),

  validateRecord: (record, index) => {
    const errors = [];

    if (!validator.isValidPostalCode(record.code)) {
      errors.push(`Invalid postal code: ${record.code}`);
    }

    if (!validator.isValidName(record.village)) {
      errors.push(`Invalid village name: ${record.village}`);
    }

    if (!validator.isValidName(record.district)) {
      errors.push(`Invalid district name: ${record.district}`);
    }

    if (!validator.isValidName(record.regency)) {
      errors.push(`Invalid regency name: ${record.regency}`);
    }

    if (!validator.isValidName(record.province)) {
      errors.push(`Invalid province name: ${record.province}`);
    }

    if (!validator.isValidCoordinate(record.latitude)) {
      errors.push(`Invalid latitude: ${record.latitude}`);
    }

    if (!validator.isValidCoordinate(record.longitude)) {
      errors.push(`Invalid longitude: ${record.longitude}`);
    }

    const timezone = record.timezone || 'WIB';
    if (!validator.isValidTimezone(timezone)) {
      errors.push(`Invalid timezone: ${timezone}`);
    }

    return errors;
  }
};

/**
 * Transform data from source format to target format
 */
function transformData(rawData) {
  console.log(`🔄 Transforming data format...`);

  return rawData.map((record, index) => {
    // Handle different field name formats
    const transformed = {
      code: record.kodepos || record.code,
      village: record.kelurahan || record.village,
      district: record.kecamatan || record.district,
      regency: record.kota || record.regency || record.city,
      province: record.provinsi || record.province,
      latitude: record.latitude,
      longitude: record.longitude,
      elevation: record.elevation || null,
      timezone: record.timezone || 'WIB'
    };

    // Clean string fields
    ['village', 'district', 'regency', 'province'].forEach(field => {
      if (transformed[field]) {
        transformed[field] = transformed[field].trim();
      }
    });

    return transformed;
  });
}

/**
 * Process and validate data
 */
function processData(rawData, progress) {
  console.log(`📊 Processing ${rawData.length} records...`);

  // Transform data format
  const transformedData = transformData(rawData);
  const validData = [];
  const invalidRecords = [];

  transformedData.forEach((record, index) => {
    progress.update();

    if (CONFIG.VALIDATE) {
      const errors = validator.validateRecord(record, index);
      if (errors.length > 0) {
        invalidRecords.push({ index, record, errors });
        progress.update(0, true);
      } else {
        validData.push(record);
      }
    } else {
      validData.push(record);
    }
  });

  // Report validation results
  if (CONFIG.VALIDATE && invalidRecords.length > 0) {
    console.log(`\n⚠️ Found ${invalidRecords.length} invalid records`);
    console.log('Sample errors:');
    invalidRecords.slice(0, CONFIG.MAX_DISPLAY_ITEMS).forEach(({ index, record, errors }) => {
      console.log(`  Record ${index}: ${errors.join(', ')}`);
    });

    if (invalidRecords.length > CONFIG.MAX_DISPLAY_ITEMS) {
      console.log(`  ... and ${invalidRecords.length - CONFIG.MAX_DISPLAY_ITEMS} more`);
    }
  }

  console.log(`✅ Valid records: ${validData.length} | Invalid records: ${invalidRecords.length}`);

  return validData;
}

/**
 * Create optimized SQL insert statements with proper escaping
 */
function createInsertSQL(data) {
  console.log(`💾 Generating SQL with batch size: ${CONFIG.BATCH_SIZE}`);

  const statements = [];
  const totalBatches = Math.ceil(data.length / CONFIG.BATCH_SIZE);

  for (let i = 0; i < data.length; i += CONFIG.BATCH_SIZE) {
    const batch = data.slice(i, i + CONFIG.BATCH_SIZE);
    const batchNumber = Math.floor(i / CONFIG.BATCH_SIZE) + 1;

    // Escape SQL values to prevent injection
    const values = batch.map(item => {
      const escape = (str) => str ? str.replace(/'/g, "''") : null;

      return `(
        ${item.code},
        '${escape(item.village)}',
        '${escape(item.district)}',
        '${escape(item.regency)}',
        '${escape(item.province)}',
        ${item.latitude},
        ${item.longitude},
        ${item.elevation || 'NULL'},
        '${item.timezone || 'WIB'}',
        datetime('now')
      )`;
    }).join(',\n    ');

    const sql = `-- Batch ${batchNumber} of ${totalBatches} (Records ${i + 1}-${Math.min(i + CONFIG.BATCH_SIZE, data.length)})
INSERT INTO postal_codes (
  code, village, district, regency, province,
  latitude, longitude, elevation, timezone, created_at
) VALUES
    ${values};`;

    statements.push(sql);
  }

  return statements.join('\n\n');
}

/**
 * Generate statistics report
 */
function generateStatistics(data) {
  const stats = {
    total: data.length,
    provinces: new Set(data.map(r => r.province)).size,
    regencies: new Set(data.map(r => r.regency)).size,
    districts: new Set(data.map(r => r.district)).size,
    withCoordinates: data.filter(r => r.latitude && r.longitude).length,
    timezones: {}
  };

  data.forEach(record => {
    const tz = record.timezone || 'WIB';
    stats.timezones[tz] = (stats.timezones[tz] || 0) + 1;
  });

  return stats;
}

/**
 * Main import function
 */
function main() {
  const source = process.argv[2] || 'json';

  console.log('🇮🇩 Kodepos API Indonesia - Professional Data Import Script');
  console.log(`👤 Author: Maxwell Alpha (https://github.com/mxwllalpha) - mxwllalpha@gmail.com`);
  console.log(`📂 Source: ${source} | Batch Size: ${CONFIG.BATCH_SIZE} | Validation: ${CONFIG.VALIDATE ? 'ON' : 'OFF'}`);
  console.log('');

  let rawData;
  let jsonFile = './data/kodepos.json'; // Default to the 83,761 records file

  try {
    switch (source) {
      case 'sample':
        console.log('📝 Using sample data for demonstration...');
        rawData = sampleData;
        break;

      case 'json':
        if (process.argv[3]) {
          jsonFile = process.argv[3];
        }
        console.log(`📄 Loading data from JSON: ${jsonFile}`);

        if (!fs.existsSync(jsonFile)) {
          throw new Error(`File not found: ${jsonFile}`);
        }

        const startTime = Date.now();
        const fileContent = fs.readFileSync(jsonFile, 'utf8');
        const loadTime = Date.now() - startTime;

        console.log(`📖 File loaded in ${loadTime}ms, parsing...`);
        rawData = JSON.parse(fileContent);

        const parseTime = Date.now() - startTime - loadTime;
        console.log(`✅ Parsed ${rawData.length} records in ${parseTime}ms`);
        break;

      default:
        throw new Error(`Unknown source: ${source}. Use 'json' or 'sample'`);
    }

    if (!Array.isArray(rawData) || rawData.length === 0) {
      throw new Error('No valid data found to import');
    }

    // Initialize progress tracking
    const progress = new ProgressTracker(rawData.length);

    // Process and validate data
    const validData = processData(rawData, progress);

    if (validData.length === 0) {
      throw new Error('No valid data to import after processing');
    }

    progress.finish();

    // Generate statistics
    console.log('\n📊 Data Statistics:');
    const stats = generateStatistics(validData);
    console.log(`   Total Records: ${stats.total}`);
    console.log(`   Provinces: ${stats.provinces}`);
    console.log(`   Regencies: ${stats.regencies}`);
    console.log(`   Districts: ${stats.districts}`);
    console.log(`   With Coordinates: ${stats.withCoordinates} (${((stats.withCoordinates/stats.total)*100).toFixed(1)}%)`);
    console.log(`   Timezones: ${Object.entries(stats.timezones).map(([tz, count]) => `${tz}: ${count}`).join(', ')}`);

    // Show sample data
    console.log('\n📋 Sample Records:');
    validData.slice(0, CONFIG.MAX_DISPLAY_ITEMS).forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.code} - ${item.village}, ${item.district}, ${item.regency}, ${item.province}`);
    });

    // Generate SQL
    console.log('\n💾 Generating SQL statements...');
    const sqlStartTime = Date.now();
    const sql = createInsertSQL(validData);
    const sqlTime = Date.now() - sqlStartTime;
    console.log(`✅ SQL generated in ${sqlTime}ms`);

    // Ensure migrations directory exists
    const migrationsDir = path.dirname(CONFIG.OUTPUT_FILE);
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    // Write SQL file
    fs.writeFileSync(CONFIG.OUTPUT_FILE, sql);
    const fileSize = fs.statSync(CONFIG.OUTPUT_FILE).size;
    const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);

    console.log(`💾 SQL file saved: ${CONFIG.OUTPUT_FILE}`);
    console.log(`📄 File size: ${fileSizeMB} MB`);

    // Instructions
    console.log('\n🎉 Import preparation complete!');
    console.log('\n📝 Next Steps:');
    console.log('1. Create D1 database: npx wrangler d1 create kodepos-db');
    console.log('2. Apply migrations: npx wrangler d1 migrations apply kodepos-db --remote');
    console.log(`3. Import data: npx wrangler d1 execute kodepos-db --file=${CONFIG.OUTPUT_FILE} --remote`);
    console.log('4. Test API: npm run dev');
    console.log('5. Deploy: npm run deploy');

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the script if called directly
main();

export {
  transformData,
  processData,
  createInsertSQL,
  validator,
  ProgressTracker,
  generateStatistics
};