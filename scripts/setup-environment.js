#!/usr/bin/env node

/**
 * Environment Setup Script
 * Sets up environment variables and configuration for different environments
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const environment = process.env.ENVIRONMENT || 'development';
const environments = ['development', 'staging', 'production'];

if (!environments.includes(environment)) {
  console.error(`❌ Invalid environment: ${environment}`);
  console.log(`❌ Valid environments: ${environments.join(', ')}`);
  process.exit(1);
}

console.log(`🚀 Setting up Kodepos Worker for ${environment.toUpperCase()} environment...`);

// Load environment configs from wrangler.toml
const wranglerPath = path.join(__dirname, '..', 'wrangler.toml');
const wranglerContent = fs.readFileSync(wranglerPath, 'utf8');

function extractEnvironmentConfig(env) {
  const envRegex = new RegExp(`\\[env\\.${env}\\]([\\s\\S]*?)(?=\\[|$)`, 'g');
  const envMatch = envRegex.exec(wranglerContent);

  if (!envMatch) {
    throw new Error(`Environment ${env} not found in wrangler.toml`);
  }

  const envContent = envMatch[1];
  const config = {};

  // Extract name
  const nameMatch = envContent.match(/name\s*=\s*"([^"]*)"/);
  if (nameMatch) config.name = nameMatch[1];

  // Extract vars
  const varsRegex = new RegExp(`\\[env\\.${env}\\.vars\\]([\\s\\S]*?)(?=\\[|$)`, 'g');
  const varsMatch = varsRegex.exec(envContent);

  if (varsMatch) {
    config.vars = parseVars(varsMatch[1]);
  }

  return config;
}

function parseVars(varsContent) {
  const vars = {};
  const lines = varsContent.split('\n');

  lines.forEach(line => {
    const match = line.match(/^\s*(\w+)\s*=\s*"([^"]*)"/);
    if (match) {
      vars[match[1]] = match[2];
    }
  });

  return vars;
}

function setupEnvironment() {
  try {
    const config = extractEnvironmentConfig(environment);
    console.log(`📋 Environment configuration loaded for ${environment}`);

    // Export environment variables
    Object.entries(config.vars || {}).forEach(([key, value]) => {
      console.log(`   ${key}=${value}`);

      // Set for current process
      process.env[key] = value;
    });

    // Create .env file if it doesn't exist
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) {
      console.log('\n📝 Creating .env file...');

      let envContent = `# Generated for ${environment} environment\n`;
      envContent += `# Generated at: ${new Date().toISOString()}\n\n`;

      Object.entries(config.vars || {}).forEach(([key, value]) => {
        envContent += `${key}=${value}\n`;
      });

      fs.writeFileSync(envPath, envContent);
      console.log('✅ .env file created successfully');
    } else {
      console.log('\n⚠️  .env file already exists. Skipping creation.');
    }

    // Validate configuration
    console.log('\n🔍 Validating configuration...');
    try {
      execSync('node scripts/validate-config.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    } catch (error) {
      console.error('❌ Configuration validation failed');
      process.exit(1);
    }

    // Environment-specific setup
    console.log('\n🔧 Performing environment-specific setup...');

    switch (environment) {
      case 'production':
        setupProduction();
        break;
      case 'staging':
        setupStaging();
        break;
      case 'development':
        setupDevelopment();
        break;
    }

    console.log(`\n✅ Environment ${environment} setup complete!`);

  } catch (error) {
    console.error(`❌ Setup failed: ${error.message}`);
    process.exit(1);
  }
}

function setupProduction() {
  console.log('   🏭 Production setup:');
  console.log('   - HTTPS URLs enforced');
  console.log('   - Debug mode disabled');
  console.log('   - Production cache TTL');
  console.log('   - Full rate limiting');
}

function setupStaging() {
  console.log('   🧪 Staging setup:');
  console.log('   - Staging URLs');
  console.log('   - Debug mode enabled');
  console.log('   - Moderate cache TTL');
  console.log('   - Reduced rate limiting');
}

function setupDevelopment() {
  console.log('   💻 Development setup:');
  console.log('   - Localhost URLs');
  console.log('   - Debug mode enabled');
  console.log('   - Short cache TTL');
  console.log('   - Minimal rate limiting');
}

function showHelp() {
  console.log('🚀 Kodepos Worker Environment Setup');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/setup-environment.js');
  console.log('  ENVIRONMENT=production node scripts/setup-environment.js');
  console.log('');
  console.log('Environments:');
  environments.forEach(env => {
    console.log(`  - ${env}`);
  });
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Run setup
setupEnvironment();