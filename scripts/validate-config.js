#!/usr/bin/env node

/**
 * Configuration Validation Script
 * Validates environment configuration across all environments
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load wrangler.toml
const wranglerPath = path.join(__dirname, '..', 'wrangler.toml');
const wranglerContent = fs.readFileSync(wranglerPath, 'utf8');

// Parse wrangler.toml sections
const environments = ['development', 'staging', 'production'];
const config = {};

// Simple parser for wrangler.toml (basic implementation)
environments.forEach(env => {
  const envConfig = extractEnvironmentConfig(env);
  config[env] = envConfig;
});

// Extract global vars
const globalVarsRegex = /\[vars\]([\s\S]*?)(?=\[|$)/g;
const globalVarsMatch = globalVarsRegex.exec(wranglerContent);
const globalVars = globalVarsMatch ? parseVars(globalVarsMatch[1]) : {};

function extractValue(content, key) {
  const regex = new RegExp(`${key}\\s*=\\s*"([^"]*)"`);
  const match = regex.exec(content);
  return match ? match[1] : null;
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

  // Extract vars - more robust regex
  const varsRegex = new RegExp(`\\[env\\.${env}\\.vars\\]([\\s\\S]*?)(?=\\[|$)`, 'g');
  const varsMatch = varsRegex.exec(envContent);

  if (varsMatch) {
    config.vars = parseVars(varsMatch[1]);
  }

  // Also extract global vars for this environment
  const envSectionRegex = new RegExp(`\\[env\\.${env}\\]([\\s\\S]*?)(?=\\[|$)`, 'g');
  const envSectionMatch = envSectionRegex.exec(wranglerContent);

  if (envSectionMatch) {
    const envSectionContent = envSectionMatch[1];
    // Parse all key-value pairs in this section
    const keyRegex = /(\w+)\s*=\s*"([^"]*)"/g;
    let keyMatch;

    if (!config.vars) config.vars = {};

    while ((keyMatch = keyRegex.exec(envSectionContent)) !== null) {
      config.vars[keyMatch[1]] = keyMatch[2];
    }
  }

  return config;
}

function validateEnvironment(envName, envConfig) {
  const errors = [];
  const warnings = [];

  // Merge with global vars
  const mergedVars = { ...globalVars, ...envConfig.vars };

  // Required variables
  const requiredVars = ['ENVIRONMENT', 'API_BASE_URL', 'WORKER_NAME', 'DATABASE_NAME'];
  requiredVars.forEach(varName => {
    if (!mergedVars[varName]) {
      errors.push(`Missing required variable: ${varName}`);
    }
  });

  // URL validation
  if (mergedVars.API_BASE_URL) {
    try {
      new URL(mergedVars.API_BASE_URL);
    } catch (e) {
      errors.push(`Invalid API_BASE_URL: ${mergedVars.API_BASE_URL}`);
    }
  }

  // Environment-specific checks
  if (envName === 'production') {
    if (mergedVars.API_BASE_URL && !mergedVars.API_BASE_URL.startsWith('https://')) {
      errors.push('Production API_BASE_URL must use HTTPS');
    }
    if (mergedVars.DEBUG === 'true') {
      warnings.push('Debug mode should be disabled in production');
    }
  }

  if (envName === 'development') {
    if (!mergedVars.API_BASE_URL.includes('localhost')) {
      warnings.push('Development API_BASE_URL should use localhost');
    }
  }

  return { errors, warnings };
}

function printValidationReport() {
  console.log('🔍 Kodepos Worker Configuration Validation Report\n');
  console.log('=' .repeat(60));

  let hasErrors = false;

  environments.forEach(env => {
    console.log(`\n📋 Environment: ${env.toUpperCase()}`);
    console.log('-'.repeat(30));

    const envConfig = config[env];
    if (!envConfig) {
      console.log(`❌ Environment ${env} not found in wrangler.toml`);
      hasErrors = true;
      return;
    }

    const validation = validateEnvironment(env, envConfig);

    if (validation.errors.length > 0) {
      console.log('❌ Errors:');
      validation.errors.forEach(error => console.log(`   - ${error}`));
      hasErrors = true;
    }

    if (validation.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      validation.warnings.forEach(warning => console.log(`   - ${warning}`));
    }

    if (validation.errors.length === 0 && validation.warnings.length === 0) {
      console.log('✅ Configuration is valid');
    }
  });

  console.log('\n' + '='.repeat(60));

  if (hasErrors) {
    console.log('❌ Validation failed! Please fix the errors above.');
    process.exit(1);
  } else {
    console.log('✅ All environments passed validation!');
  }
}

// Command line argument handling
const args = process.argv.slice(2);
const shouldValidateAll = args.includes('--all-env');

if (shouldValidateAll) {
  printValidationReport();
} else {
  // Default behavior: validate current environment from .env or process.env
  const currentEnv = process.env.ENVIRONMENT || 'development';
  console.log(`🔍 Validating current environment: ${currentEnv.toUpperCase()}`);

  const envConfig = config[currentEnv];
  if (!envConfig) {
    console.error(`❌ Environment ${currentEnv} not found in wrangler.toml`);
    process.exit(1);
  }

  const validation = validateEnvironment(currentEnv, envConfig);

  if (validation.errors.length > 0) {
    console.log('❌ Errors:');
    validation.errors.forEach(error => console.log(`   - ${error}`));
    process.exit(1);
  }

  if (validation.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    validation.warnings.forEach(warning => console.log(`   - ${warning}`));
  }

  if (validation.errors.length === 0 && validation.warnings.length === 0) {
    console.log('✅ Configuration is valid');
  }
}