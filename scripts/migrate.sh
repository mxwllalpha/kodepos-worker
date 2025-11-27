#!/bin/bash

/**
 * Migration Script for Kodepos Worker
 * Automated database migration for all environments
 * Used by GitHub Actions workflow
 *
 * Usage:
 *   ./scripts/migrate.sh [environment]
 *
 * Environments:
 *   - production: Migrates kodepos-db
 *   - staging: Migrates kodepos-db-staging
 *   - development: Migrates kodepos-db-dev
 */

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="${1:-production}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Database names by environment
declare -A DATABASES=(
  ["production"]="kodepos-db"
  ["staging"]="kodepos-db-staging"
  ["development"]="kodepos-db-dev"
)

declare -A WORKER_NAMES=(
  ["production"]="kodepos-api"
  ["staging"]="kodepos-worker-staging"
  ["development"]="kodepos-worker-dev"
)

# Helper functions
log_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
  echo -e "${RED}❌ $1${NC}"
}

# Check if wrangler is installed
check_dependencies() {
  log_info "Checking dependencies..."

  if ! command -v npx &> /dev/null; then
    log_error "npx not found. Please install Node.js and npm."
    exit 1
  fi

  if ! npx wrangler --version &> /dev/null; then
    log_warning "Installing wrangler..."
    npm install -g wrangler
  fi

  log_success "Dependencies checked"
}

# Get database information
get_database_info() {
  local db_name="${DATABASES[$ENVIRONMENT]}"
  log_info "Getting database info for: $db_name"

  if npx wrangler d1 info "$db_name" --environment="$ENVIRONMENT" &> /dev/null; then
    local info=$(npx wrangler d1 info "$db_name" --environment="$ENVIRONMENT" --json)
    echo "$info"
    return 0
  else
    log_warning "Database $db_name not found in $ENVIRONMENT environment"
    return 1
  fi
}

# Create database if it doesn't exist
ensure_database_exists() {
  local db_name="${DATABASES[$ENVIRONMENT]}"

  log_info "Ensuring database exists: $db_name"

  if ! get_database_info > /dev/null; then
    log_info "Creating database: $db_name"
    npx wrangler d1 create "$db_name" --environment="$ENVIRONMENT"
    log_success "Database created: $db_name"
  else
    log_success "Database already exists: $db_name"
  fi
}

# Apply a single migration file
apply_migration() {
  local migration_file="$1"
  local db_name="${DATABASES[$ENVIRONMENT]}"

  log_info "Applying migration: $(basename "$migration_file")"

  # Validate migration file
  if [[ ! -f "$migration_file" ]]; then
    log_error "Migration file not found: $migration_file"
    return 1
  fi

  # Apply migration
  if npx wrangler d1 execute "$db_name" --file="$migration_file" --environment="$ENVIRONMENT" --remote; then
    log_success "Migration applied: $(basename "$migration_file")"
    return 0
  else
    log_error "Migration failed: $(basename "$migration_file")"
    return 1
  fi
}

# Apply all migrations in order
apply_all_migrations() {
  local migrations_dir="$PROJECT_ROOT/migrations"

  log_info "Applying migrations from: $migrations_dir"

  if [[ ! -d "$migrations_dir" ]]; then
    log_error "Migrations directory not found: $migrations_dir"
    return 1
  fi

  # Get all SQL files sorted numerically
  local migration_files=($(find "$migrations_dir" -name "*.sql" | sort -V))

  if [[ ${#migration_files[@]} -eq 0 ]]; then
    log_warning "No migration files found in: $migrations_dir"
    return 0
  fi

  log_info "Found ${#migration_files[@]} migration file(s)"

  local applied_count=0
  local failed_count=0

  for migration_file in "${migration_files[@]}"; do
    if apply_migration "$migration_file"; then
      ((applied_count++))
    else
      ((failed_count++))
      # Continue with other migrations even if one fails
      log_warning "Continuing with remaining migrations..."
    fi
  done

  log_info "Migration summary: $applied_count applied, $failed_count failed"

  if [[ $failed_count -gt 0 ]]; then
    log_error "Some migrations failed. Please check the logs above."
    return 1
  fi

  return 0
}

# Verify database setup
verify_setup() {
  local db_name="${DATABASES[$ENVIRONMENT]}"
  local worker_name="${WORKER_NAMES[$ENVIRONMENT]}"

  log_info "Verifying database setup for: $worker_name"

  # Check if database exists
  if ! get_database_info > /dev/null; then
    log_error "Database verification failed: $db_name not found"
    return 1
  fi

  # Get database info for reporting
  local db_info=$(get_database_info)
  local db_id=$(echo "$db_info" | jq -r '.database_id // "unknown"')

  log_success "Database verified: $db_name (ID: $db_id)"

  # Report environment details
  log_info "Environment details:"
  echo "  Environment: $ENVIRONMENT"
  echo "  Worker: $worker_name"
  echo "  Database: $db_name"
  echo "  Database ID: $db_id"

  if [[ "$ENVIRONMENT" == "production" ]]; then
    echo "  URL: https://kodepos-api.tekipik.workers.dev"
  elif [[ "$ENVIRONMENT" == "staging" ]]; then
    echo "  URL: https://kodepos-worker-staging.tekipik.workers.dev"
  fi

  return 0
}

# Update wrangler.toml with database ID
update_wrangler_config() {
  local db_name="${DATABASES[$ENVIRONMENT]}"

  log_info "Updating wrangler.toml with database ID..."

  # Get database info
  local db_info
  if db_info=$(get_database_info); then
    local db_id=$(echo "$db_info" | jq -r '.database_id')

    if [[ -n "$db_id" && "$db_id" != "null" ]]; then
      # Update wrangler.toml using sed
      local wrangler_file="$PROJECT_ROOT/wrangler.toml"

      # Update database_id for the specific environment
      sed -i.bak "/\[env\\.$ENVIRONMENT\\]/,/\\[env\\./{ s/database_id = \".*\"/database_id = \"$db_id\"/; }" "$wrangler_file"

      log_success "Updated wrangler.toml with database ID: $db_id"
      return 0
    else
      log_warning "Could not extract database ID from info"
      return 1
    fi
  else
    log_warning "Could not get database info, skipping config update"
    return 1
  fi
}

# Main migration function
migrate() {
  log_info "Starting migration for environment: $ENVIRONMENT"
  log_info "Project root: $PROJECT_ROOT"
  log_info "========================================"

  # Change to project root
  cd "$PROJECT_ROOT"

  # Step 1: Check dependencies
  check_dependencies

  # Step 2: Ensure database exists
  ensure_database_exists

  # Step 3: Apply all migrations
  apply_all_migrations

  # Step 4: Update wrangler.toml with database ID
  update_wrangler_config

  # Step 5: Verify setup
  verify_setup

  log_success "Migration completed for environment: $ENVIRONMENT"
}

# Help function
show_help() {
  echo "Kodepos Worker Migration Script"
  echo ""
  echo "Usage: $0 [ENVIRONMENT]"
  echo ""
  echo "Environments:"
  echo "  production  (default) - Migrates kodepos-db for production"
  echo "  staging               - Migrates kodepos-db-staging for staging"
  echo "  development           - Migrates kodepos-db-dev for development"
  echo ""
  echo "Examples:"
  echo "  $0                # Migrate production database"
  echo "  $0 staging         # Migrate staging database"
  echo "  $0 development      # Migrate development database"
}

# Script entry point
main() {
  # Parse command line arguments
  case "${1:-}" in
    -h|--help)
      show_help
      exit 0
      ;;
    production|staging|development)
      ENVIRONMENT="$1"
      ;;
    "")
      ENVIRONMENT="production"
      ;;
    *)
      log_error "Invalid environment: $1"
      show_help
      exit 1
      ;;
  esac

  # Validate environment
  if [[ -z "${DATABASES[$ENVIRONMENT]}" ]]; then
    log_error "Unknown environment: $ENVIRONMENT"
    show_help
    exit 1
  fi

  # Run migration
  migrate
}

# Run main function with all arguments
main "$@"