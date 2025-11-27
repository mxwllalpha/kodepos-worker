#!/bin/bash

# =============================================================================
# Kodepos API Indonesia - Interactive Installer Script
# Author: Maxwell Alpha (https://github.com/mxwllalpha) - mxwllalpha@gmail.com
# License: MIT
#
# This script helps users set up Kodepos API on Cloudflare Workers
# with interactive prompts and step-by-step guidance.
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script info
SCRIPT_VERSION="1.0.0"
GITHUB_REPO="https://github.com/mxwllalpha/kodepos-api"

# Progress bar functions
show_progress() {
    local current=$1
    local total=$2
    local width=50
    local percentage=$((current * 100 / total))
    local filled=$((current * width / total))
    local empty=$((width - filled))

    printf "\r${CYAN}Progress: [${NC}"
    printf "%*s" $filled | tr ' ' '█'
    printf "%*s" $empty | tr ' ' '░'
    printf "${CYAN}]${NC} ${percentage}%% (${current}/${total})"

    if [ "$current" -eq "$total" ]; then
        echo ""  # New line when complete
    fi
}

start_spinner() {
    local message="$1"
    local spinner_chars=("⠋" "⠙" "⠹" "⠸" "⠼" "⠴" "⠦" "⠧" "⠇" "⠏")
    local i=0

    # Hide cursor
    tput civis 2>/dev/null || true

    while kill -0 $$ 2>/dev/null; do
        printf "\r${YELLOW}%s${NC} %s" "${spinner_chars[$i]}" "$message"
        i=$(( (i + 1) % 10 ))
        sleep 0.1
    done
}

stop_spinner() {
    # Show cursor again
    tput cnorm 2>/dev/null || true
    printf "\r%*s\r" 100  # Clear the spinner line
}

estimate_time() {
    local current=$1
    local total=$2
    local start_time=$3

    if [ "$current" -gt 0 ]; then
        local elapsed=$(($(date +%s) - start_time))
        local eta=$((elapsed * total / current - elapsed))

        if [ "$eta" -gt 60 ]; then
            local minutes=$((eta / 60))
            local seconds=$((eta % 60))
            echo "${minutes}m ${seconds}s"
        else
            echo "${eta}s"
        fi
    else
        echo "calculating..."
    fi
}

# Function to print colored output
print_header() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${CYAN}  Kodepos API Indonesia - Installer${NC}"
    echo -e "${BLUE}  Version: ${SCRIPT_VERSION}${NC}"
    echo -e "${BLUE}  Author: Maxwell Alpha${NC}"
    echo -e "${BLUE}  Email: mxwllalpha@gmail.com${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${PURPLE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${CYAN}🔄 Step $1: $2${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to prompt user for input
prompt() {
    local prompt_text="$1"
    local default_value="$2"
    local required="$3"

    while true; do
        if [ -n "$default_value" ]; then
            read -p "$prompt_text [$default_value]: " input_value
            input_value="${input_value:-$default_value}"
        else
            read -p "$prompt_text: " input_value
        fi

        if [ -n "$input_value" ] || [ "$required" = "false" ]; then
            echo "$input_value"
            break
        else
            print_error "This field is required. Please enter a value."
        fi
    done
}

# Function to confirm action
confirm() {
    local prompt_text="$1"
    local default="${2:-n}"

    while true; do
        read -p "$prompt_text [y/N]: " yn
        yn="${yn:-$default}"

        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
        esac
    done
}

# Function to validate email
validate_email() {
    local email="$1"
    if [[ "$email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Function to validate numeric input
validate_number() {
    local input="$1"
    local min="$2"
    local max="$3"

    if [[ "$input" =~ ^[0-9]+$ ]] && [ "$input" -ge "$min" ] && [ "$input" -le "$max" ]; then
        return 0
    else
        return 1
    fi
}

# Function to check prerequisites
check_prerequisites() {
    print_step "1" "Checking Prerequisites"

    local all_good=true

    # Check Node.js
    if command_exists node; then
        local node_version=$(node --version | cut -d'v' -f2)
        print_success "Node.js found (version $node_version)"

        # Check if version is >= 18
        if [[ $(echo "$node_version" | cut -d'.' -f1) -lt 18 ]]; then
            print_warning "Node.js version should be >= 18.0.0 for best compatibility"
        fi
    else
        print_error "Node.js not found. Please install Node.js >= 18.0.0"
        print_info "Download from: https://nodejs.org/"
        all_good=false
    fi

    # Check npm
    if command_exists npm; then
        local npm_version=$(npm --version)
        print_success "npm found (version $npm_version)"
    else
        print_error "npm not found. Please install npm"
        all_good=false
    fi

    # Check git
    if command_exists git; then
        local git_version=$(git --version | cut -d' ' -f3)
        print_success "git found (version $git_version)"
    else
        print_error "git not found. Please install git"
        all_good=false
    fi

    # Check wrangler
    if command_exists wrangler; then
        local wrangler_version=$(wrangler --version)
        print_success "Wrangler CLI found ($wrangler_version)"
    else
        print_error "Wrangler CLI not found"
        print_info "Installing Wrangler CLI globally..."
        npm install -g wrangler
        if command_exists wrangler; then
            print_success "Wrangler CLI installed successfully"
        else
            print_error "Failed to install Wrangler CLI"
            all_good=false
        fi
    fi

    if [ "$all_good" = false ]; then
        print_error "Some prerequisites are missing. Please install them and run this script again."
        exit 1
    fi

    echo ""
}

# Function to setup project
setup_project() {
    print_step "2" "Setting Up Project"

    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -d "src" ]; then
        print_error "Please run this script from the kodepos-api project directory"
        exit 1
    fi

    print_success "Project directory verified"

    # Install dependencies
    print_info "Installing npm dependencies..."
    npm install

    print_success "Dependencies installed"
    echo ""
}

# Function to setup Cloudflare authentication
setup_cloudflare_auth() {
    print_step "3" "Cloudflare Authentication"

    print_info "We need to authenticate with Cloudflare to deploy the API."
    print_info "This will open your browser to login to Cloudflare."

    if confirm "Do you want to authenticate with Cloudflare now?" "y"; then
        wrangler auth login
        print_success "Cloudflare authentication completed"
    else
        print_warning "Skipping Cloudflare authentication. You can run 'wrangler auth login' later."
    fi

    echo ""
}

# Function to setup D1 database
setup_database() {
    print_step "4" "Setting Up D1 Database"

    local db_name="kodepos-db"

    print_info "Creating D1 database: $db_name"
    print_info "This will create a database on your Cloudflare account"

    # Check if already authenticated
    if ! wrangler whoami >/dev/null 2>&1; then
        print_warning "Not authenticated with Cloudflare"
        print_info "Please run: wrangler auth login"
        exit 1
    fi

    # Create database
    print_info "Running: npx wrangler d1 create $db_name"
    local db_output=$(npx wrangler d1 create "$db_name" 2>&1)

    if echo "$db_output" | grep -q "Successfully created DB"; then
        # Extract database ID from output
        local db_id=$(echo "$db_output" | grep -A 10 'd1_databases' | grep 'database_id' | head -1 | sed 's/.*database_id[^"]*"\([^"]*\)".*/\1/' | tr -d '"')
        print_success "Database created successfully"
        print_info "Database Name: $db_name"
        print_info "Database ID: $db_id"

        # Check if wrangler.toml exists and update it
        if [ -f "wrangler.toml" ]; then
            print_info "Updating wrangler.toml with database configuration..."

            # Create backup
            cp wrangler.toml wrangler.toml.bak

            # Update database_id in wrangler.toml
            sed -i.bak "s/database_id = \"your-database-id\"/database_id = \"$db_id\"/" wrangler.toml

            # Also update database_name if needed
            sed -i.bak "s/database_name = \"your-database-name\"/database_name = \"$db_name\"/" wrangler.toml

            print_success "Database configuration updated in wrangler.toml"

            # Show the configuration
            print_info "Current D1 configuration in wrangler.toml:"
            grep -A 5 '\[\[ d1_databases \]\]' wrangler.toml || grep -A 5 'd1_databases:' wrangler.toml || true
        else
            print_warning "wrangler.toml not found. Please ensure it exists and contains D1 database configuration."
        fi

        DATABASE_ID="$db_id"
        DATABASE_NAME="$db_name"
    else
        print_error "Failed to create database"
        print_info "Output from wrangler d1 create:"
        echo "$db_output"
        print_info ""
        print_info "Troubleshooting:"
        print_info "1. Ensure you're authenticated: wrangler auth login"
        print_info "2. Check your Cloudflare account permissions"
        print_info "3. Verify you have D1 database quota available"
        exit 1
    fi

    echo ""
}

# Function to run database migrations
run_migrations() {
    print_step "5" "Running Database Migrations"

    if [ -z "$DATABASE_NAME" ]; then
        print_error "Database name not set. Please run setup_database first."
        exit 1
    fi

    print_info "Applying database schema migrations for: $DATABASE_NAME"
    print_info "Running: npx wrangler d1 migrations apply $DATABASE_NAME --remote"

    if npx wrangler d1 migrations apply "$DATABASE_NAME" --remote; then
        print_success "Database migrations applied successfully"

        # Show migration status
        print_info "Checking migration status..."
        npx wrangler d1 migrations list "$DATABASE_NAME" --remote
    else
        print_error "Failed to apply database migrations"
        print_info "Troubleshooting:"
        print_info "1. Ensure wrangler.toml has correct D1 database configuration"
        print_info "2. Check migrations directory exists"
        print_info "3. Verify database was created successfully"
        exit 1
    fi

    echo ""
}

# Function to import postal code data with progress indicators
import_data() {
    print_step "6" "Importing Postal Code Data"

    print_info "This will import 83,761 Indonesian postal code records."
    print_info "The data source should be: ./data/kodepos.json"

    # Check if data file exists
    local data_file="./data/kodepos.json"
    if [ ! -f "$data_file" ]; then
        print_warning "Data file not found at: $data_file"

        if confirm "Do you want to use sample data instead?" "y"; then
            print_info "Using sample data for testing..."
            print_info "Running: node scripts/import-data.js sample"

            # Start spinner for data preparation
            start_spinner "Preparing sample data..." &
            local spinner_pid=$!

            if node scripts/import-data.js sample; then
                stop_spinner
                print_success "Sample data import prepared"
            else
                stop_spinner
                print_error "Failed to prepare sample data"
                exit 1
            fi
        else
            print_error "Please place kodepos.json in the data directory and run again"
            print_info "Expected location: $(pwd)/data/kodepos.json"
            exit 1
        fi
    else
        local file_size=$(du -h "$data_file" | cut -f1)
        print_info "Found data file: $data_file ($file_size)"

        # Validate JSON file with progress
        print_info "Validating JSON file structure..."
        start_spinner "Validating JSON file..." &
        local spinner_pid=$!

        if node -e "try { JSON.parse(require('fs').readFileSync('$data_file', 'utf8')); console.log('✅ JSON is valid'); } catch(e) { console.error('❌ Invalid JSON:', e.message); process.exit(1); }"; then
            stop_spinner
            print_success "JSON file validation passed"
        else
            stop_spinner
            print_error "Invalid JSON file format"
            exit 1
        fi

        if confirm "Do you want to import the 83,761 postal code records now?" "y"; then
            print_info "Importing postal code data..."
            print_info "Running: node scripts/import-data.js json \"$data_file\""

            # Start spinner for data preparation
            start_spinner "Preparing SQL import file..." &
            local spinner_pid=$!

            local import_start_time=$(date +%s)

            if node scripts/import-data.js json "$data_file"; then
                stop_spinner
                print_success "Postal code data import prepared"

                # Check if SQL file was generated
                if [ -f "migrations/002_import_kodepos_data.sql" ]; then
                    local sql_size=$(du -h "migrations/002_import_kodepos_data.sql" | cut -f1)
                    print_info "SQL import file generated: $sql_size"

                    # Import to database with progress tracking
                    print_info "Applying data to database (this may take 3-5 minutes)..."
                    print_info "Running: npx wrangler d1 execute kodepos-db --file=migrations/002_import_kodepos_data.sql --remote"

                    # Start background spinner for database import
                    start_spinner "Importing 83,761 records to database..." &
                    local db_spinner_pid=$!

                    local db_import_start=$(date +%s)

                    if npx wrangler d1 execute kodepos-db --file=migrations/002_import_kodepos_data.sql --remote; then
                        stop_spinner

                        # Calculate import time
                        local db_import_time=$(($(date +%s) - db_import_start))
                        print_success "Database import completed in ${db_import_time}s"

                        # Verify data import with progress
                        print_info "Verifying data import..."
                        start_spinner "Counting imported records..." &
                        local verify_pid=$!

                        local record_count=$(npx wrangler d1 execute kodepos-db --command="SELECT COUNT(*) as total FROM postal_codes" --remote --json 2>/dev/null | grep -o '"total":[^,}]*' | cut -d':' -f2 | tr -d ' ')

                        stop_spinner

                        if [ -n "$record_count" ] && [ "$record_count" -gt 0 ]; then
                            # Show progress for record count
                            local expected=83761
                            show_progress $record_count $expected

                            if [ "$record_count" -eq "$expected" ]; then
                                print_success "Database contains all $record_count postal code records (100% complete)"
                            elif [ "$record_count" -gt 80000 ]; then
                                print_success "Database contains $record_count postal code records ($(( record_count * 100 / expected ))% complete)"
                            else
                                print_warning "Database contains $record_count postal code records (expected ~$expected). Some records may be missing."
                            fi

                            # Calculate performance metrics
                            local total_time=$(($(date +%s) - import_start_time))
                            local records_per_sec=$((record_count / total_time))
                            print_info "Performance: $records_per_sec records/second"

                        else
                            print_warning "Could not verify record count. Please check manually."
                        fi
                    else
                        stop_spinner
                        print_error "Failed to import data to database"
                        print_info "You can manually run: npx wrangler d1 execute kodepos-db --file=migrations/002_import_kodepos_data.sql --remote"

                        # Suggest retry with batch size
                        print_info "If the import failed due to size, consider:"
                        print_info "1. Check your D1 database quota"
                        print_info "2. Try importing in smaller batches"
                        print_info "3. Check your internet connection stability"

                        exit 1
                    fi
                else
                    stop_spinner
                    print_error "SQL import file was not generated"
                    exit 1
                fi
            else
                stop_spinner
                print_error "Failed to prepare postal code data"
                exit 1
            fi
        else
            print_warning "Skipping data import."
            print_info "You can manually run: node scripts/import-data.js json \"$data_file\""
            print_info "Then apply with: npx wrangler d1 execute kodepos-db --file=migrations/002_import_kodepos_data.sql --remote"
        fi
    fi

    echo ""
}

# Function to deploy to Cloudflare Workers
deploy_worker() {
    print_step "7" "Deploying to Cloudflare Workers"

    print_info "Deploying the Kodepos API to Cloudflare Workers..."

    if wrangler deploy; then
        print_success "Deployment completed successfully!"

        # Try to get the worker URL
        local worker_url=$(grep -A 5 'name = ' wrangler.toml | grep -v 'name = ' | tail -1 | sed 's/.*= //' | tr -d '"')
        if [ -n "$worker_url" ]; then
            print_success "Your API is now live at: https://$worker_url.workers.dev"
        else
            print_success "Your API is now live! Check your Cloudflare dashboard for the URL."
        fi
    else
        print_error "Deployment failed"
        exit 1
    fi

    echo ""
}

# Function to test deployment
test_deployment() {
    print_step "8" "Testing Deployment"

    print_info "Running basic API health check..."

    # Try to get the worker URL from wrangler.toml
    local worker_name=$(grep 'name = ' wrangler.toml | head -1 | sed 's/.*= //' | tr -d '"')

    if [ -n "$worker_name" ]; then
        local api_url="https://$worker_name.{$(wrangler whoami | grep 'Account Name' | cut -d':' -f2 | tr -d ' ')}.workers.dev"

        print_info "Testing API at: $api_url/health"

        if curl -s "$api_url/health" | grep -q "healthy"; then
            print_success "API health check passed!"
            print_info "Your API is ready to use!"
        else
            print_warning "API health check failed. The API may still be deploying."
            print_info "Please try again in a few minutes or check the Cloudflare dashboard."
        fi
    else
        print_warning "Could not determine API URL. Please test manually."
    fi

    echo ""
}

# Function to show next steps
show_next_steps() {
    print_step "9" "Setup Complete!"

    echo -e "${GREEN}🎉 Kodepos API Indonesia has been successfully installed!${NC}"
    echo ""

    echo -e "${CYAN}📚 API Documentation:${NC}"
    echo "   - README.md: Comprehensive documentation"
    echo "   - API endpoints: https://your-worker-url.workers.dev/api/v1/search?q=Jakarta"
    echo "   - Health check: https://your-worker-url.workers.dev/health"
    echo ""

    echo -e "${CYAN}🔗 Useful Commands:${NC}"
    echo "   - Test locally: npm run dev"
    echo "   - Deploy: npm run deploy"
    echo "   - View logs: wrangler tail"
    echo "   - Database status: wrangler d1 info kodepos-db"
    echo ""

    echo -e "${CYAN}📊 API Examples:${NC}"
    echo "   - Search: curl 'https://your-api.workers.dev/api/v1/search?q=Jakarta'"
    echo "   - By code: curl 'https://your-api.workers.dev/api/v1/code/12345'"
    echo "   - Nearby: curl 'https://your-api.workers.dev/api/v1/nearby?lat=-6.2088&lng=106.8456'"
    echo ""

    echo -e "${CYAN}💬 Support:${NC}"
    echo "   - GitHub: $GITHUB_REPO"
    echo "   - Email: mxwllalpha@gmail.com"
    echo "   - Issues: $GITHUB_REPO/issues"
    echo ""

    echo -e "${GREEN}Thank you for using Kodepos API Indonesia! 🇮🇩${NC}"
}

# Function to handle errors
handle_error() {
    local line_number=$1
    print_error "Script failed at line $line_number"
    print_info "Please check the error message above and try again"
    print_info "For support, visit: $GITHUB_REPO/issues"
    exit 1
}

# Main function
main() {
    # Set up error handling
    trap 'handle_error $LINENO' ERR

    print_header

    echo -e "${PURPLE}This installer will help you set up Kodepos API Indonesia on Cloudflare Workers${NC}"
    echo -e "${PURPLE}with 83,761 Indonesian postal code records.${NC}"
    echo ""

    if ! confirm "Do you want to continue with the installation?" "y"; then
        print_info "Installation cancelled."
        exit 0
    fi

    echo ""

    # Run installation steps
    check_prerequisites
    setup_project
    setup_cloudflare_auth
    setup_database
    run_migrations
    import_data
    deploy_worker
    test_deployment
    show_next_steps
}

# Run main function
main "$@"