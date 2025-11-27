#!/usr/bin/env node

/**
 * Database Setup Script for Kodepos Worker
 * Automatically creates D1 database and applies migrations
 * Used by GitHub Actions workflow
 *
 * Usage:
 *   node scripts/setup-database.js [environment]
 *
 * Environments:
 *   - production: Creates kodepos-db
 *   - staging: Creates kodepos-db-staging
 *   - development: Creates kodepos-db-dev
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DatabaseSetup {
  constructor(environment = 'production') {
    this.environment = environment;
    this.databaseName = this.getDatabaseName();
    this.workerName = this.getWorkerName();
  }

  getDatabaseName() {
    const names = {
      production: 'kodepos-db',
      staging: 'kodepos-db-staging',
      development: 'kodepos-db-dev'
    };
    return names[this.environment] || 'kodepos-db';
  }

  getWorkerName() {
    const names = {
      production: 'kodepos-api',
      staging: 'kodepos-worker-staging',
      development: 'kodepos-worker-dev'
    };
    return names[this.environment] || 'kodepos-worker';
  }

  async executeCommand(command, description) {
    console.log(`🔧 ${description}...`);
    try {
      const result = execSync(command, {
        encoding: 'utf8',
        stdio: 'pipe',
        maxBuffer: 1024 * 1024 // 1MB buffer
      });

      console.log(`✅ ${description} completed`);
      return result.trim();
    } catch (error) {
      // Don't fail if database already exists
      if (error.stdout && error.stdout.includes('already exists')) {
        console.log(`✅ ${description} - already exists`);
        return error.stdout.trim();
      }

      console.error(`❌ ${description} failed:`, error.message);
      if (error.stdout) console.error('STDOUT:', error.stdout);
      if (error.stderr) console.error('STDERR:', error.stderr);
      throw error;
    }
  }

  async createDatabase() {
    const command = `npx wrangler d1 create ${this.databaseName} --environment=${this.environment}`;
    return await this.executeCommand(command, `Creating ${this.environment} database: ${this.databaseName}`);
  }

  async getDatabaseInfo() {
    const command = `npx wrangler d1 info ${this.databaseName} --json`;
    try {
      const result = await this.executeCommand(command, `Getting ${this.environment} database info`);
      const info = JSON.parse(result);
      return info;
    } catch (error) {
      console.log(`⚠️ Could not get database info, will create during deployment`);
      return null;
    }
  }

  async applyMigrations() {
    console.log(`🗄️ Applying migrations to ${this.environment} database: ${this.databaseName}`);

    const migrationsDir = path.join(__dirname, '..', 'migrations');

    if (!fs.existsSync(migrationsDir)) {
      console.log(`❌ Migrations directory not found: ${migrationsDir}`);
      return;
    }

    // Get all SQL files in numerical order
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort((a, b) => {
        const aNum = parseInt(a.split('_')[0]) || 0;
        const bNum = parseInt(b.split('_')[0]) || 0;
        return aNum - bNum;
      });

    console.log(`📋 Found ${migrationFiles.length} migration files`);

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const command = `npx wrangler d1 execute ${this.databaseName} --file="${filePath}" --remote --environment=${this.environment}`;

      await this.executeCommand(command, `Applying migration: ${file}`);
    }

    console.log(`✅ All migrations applied to ${this.environment} database`);
  }

  async updateWranglerToml(databaseInfo) {
    if (!databaseInfo || !databaseInfo.database_id) {
      console.log(`⚠️ No database ID available, skipping wrangler.toml update`);
      return;
    }

    const wranglerPath = path.join(__dirname, '..', 'wrangler.toml');

    if (!fs.existsSync(wranglerPath)) {
      console.log(`❌ wrangler.toml not found: ${wranglerPath}`);
      return;
    }

    let content = fs.readFileSync(wranglerPath, 'utf8');
    const oldId = `database_id = "AUTO-CREATED-BY-GITHUB-ACTIONS"`;
    const newId = `database_id = "${databaseInfo.database_id}"`;

    // Update for specific environment
    const envSection = new RegExp(
      `\\[env\\.${this.environment}\\]([\\s\\S]*?)\\[\\s\\S*\\[env\\.|\\]`,
      'gms'
    );

    const updatedContent = content.replace(envSection, (match, content) => {
      const updated = content.replace(oldId, newId);
      return `[env.${this.environment}]${updated}`;
    });

    if (updatedContent !== content) {
      fs.writeFileSync(wranglerPath, updatedContent);
      console.log(`✅ Updated wrangler.toml with ${this.environment} database ID: ${databaseInfo.database_id}`);
    } else {
      console.log(`✅ wrangler.toml already up to date`);
    }
  }

  async runHealthCheck() {
    console.log(`🏥 Running health check for ${this.environment}...`);

    // Get worker URL based on environment
    let workerUrl;
    if (this.environment === 'production') {
      workerUrl = 'https://kodepos-api.tekipik.workers.dev/health';
    } else if (this.environment === 'staging') {
      workerUrl = 'https://kodepos-worker-staging.tekipik.workers.dev/health';
    } else {
      console.log(`⚠️ Skipping health check for ${this.environment} (not deployed)`);
      return;
    }

    try {
      const response = await fetch(workerUrl);
      if (response.ok) {
        console.log(`✅ Health check passed for ${this.environment}: ${workerUrl}`);
      } else {
        console.log(`⚠️ Health check failed for ${this.environment}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`⚠️ Health check failed for ${this.environment}: ${error.message}`);
    }
  }

  async setup() {
    console.log(`🚀 Setting up ${this.environment} environment for ${this.workerName}`);
    console.log(`📊 Database: ${this.databaseName}`);
    console.log(`===================================`);

    try {
      // Step 1: Create database (if doesn't exist)
      await this.createDatabase();

      // Step 2: Get database info
      const databaseInfo = await this.getDatabaseInfo();

      // Step 3: Update wrangler.toml with actual database ID
      await this.updateWranglerToml(databaseInfo);

      // Step 4: Apply migrations
      await this.applyMigrations();

      // Step 5: Run health check (if deployed)
      await this.runHealthCheck();

      console.log(`🎉 Setup completed for ${this.environment} environment!`);

      if (databaseInfo && databaseInfo.database_id) {
        console.log(`📋 Summary:`);
        console.log(`   Environment: ${this.environment}`);
        console.log(`   Worker: ${this.workerName}`);
        console.log(`   Database: ${this.databaseName}`);
        console.log(`   Database ID: ${databaseInfo.database_id}`);

        if (this.environment === 'production') {
          console.log(`   URL: https://kodepos-api.tekipik.workers.dev`);
        } else if (this.environment === 'staging') {
          console.log(`   URL: https://kodepos-worker-staging.tekipik.workers.dev`);
        }
      }

    } catch (error) {
      console.error(`❌ Setup failed for ${this.environment}:`, error.message);
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const environment = process.argv[2] || 'production';
  const validEnvironments = ['production', 'staging', 'development'];

  if (!validEnvironments.includes(environment)) {
    console.error(`❌ Invalid environment: ${environment}`);
    console.error(`Valid environments: ${validEnvironments.join(', ')}`);
    process.exit(1);
  }

  const setup = new DatabaseSetup(environment);
  setup.setup().catch(error => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
}

module.exports = DatabaseSetup;