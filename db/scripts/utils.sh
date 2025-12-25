#!/bin/bash
# =============================================================================
# FRIJOL MÁGICO - DATABASE SCRIPTS UTILITIES
# =============================================================================
# Shared utilities for database scripts.
# Source this file in other scripts: source "$(dirname "$0")/utils.sh"
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the script directory and project root
UTILS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$UTILS_DIR/../.." && pwd)"

# Common paths
MIGRATIONS_DIR="$PROJECT_ROOT/db/migrations"
SEED_DIR="$PROJECT_ROOT/db/seed"
SEED_FILE="$SEED_DIR/seed.sql"

# =============================================================================
# ENVIRONMENT LOADING
# =============================================================================

# Load TURSO_DATABASE_NAME from .env files (priority order, last wins)
# Order: .env -> .env.local -> .env.production -> .env.production.local (etc.)
# Note: Only reads TURSO_DATABASE_NAME, does not export to environment
load_turso_db_name() {
    local env_files=()
    local db_name=""
    
    # Find all .env* files and sort them by priority
    # Base files first, then .local variants (which override)
    for f in "$PROJECT_ROOT"/.env "$PROJECT_ROOT"/.env.local; do
        [ -f "$f" ] && env_files+=("$f")
    done
    
    # Environment-specific files (production, development, etc.)
    for f in "$PROJECT_ROOT"/.env.*; do
        # Skip .local files (handled separately) and non-files
        [[ "$f" == *.local ]] && continue
        [[ "$f" == "$PROJECT_ROOT/.env.*" ]] && continue
        [ -f "$f" ] && env_files+=("$f")
    done
    
    # Environment-specific .local files (highest priority)
    for f in "$PROJECT_ROOT"/.env.*.local; do
        [[ "$f" == "$PROJECT_ROOT/.env.*.local" ]] && continue
        [ -f "$f" ] && env_files+=("$f")
    done
    
    # Load TURSO_DATABASE_NAME from each file (later files override earlier ones)
    for env_file in "${env_files[@]}"; do
        if [ -f "$env_file" ]; then
            local found_value
            found_value=$(grep -E '^TURSO_DATABASE_NAME=' "$env_file" 2>/dev/null | tail -1 | cut -d'=' -f2-)
            # Remove surrounding quotes (single or double)
            found_value=$(echo "$found_value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
            if [ -n "$found_value" ]; then
                echo -e "${BLUE}Loading:${NC} $(basename "$env_file")" >&2
                db_name="$found_value"
            fi
        fi
    done
    
    echo "$db_name"
}

# Initialize DB_NAME and validate it exists
# Call this at the start of each script after sourcing utils.sh
init_db() {
    DB_NAME=$(load_turso_db_name)
    echo ""
    
    if [ -z "$DB_NAME" ]; then
        echo -e "${RED}Error: TURSO_DATABASE_NAME not found in any .env file${NC}"
        echo "Please add TURSO_DATABASE_NAME=your-database-name to .env.local"
        exit 1
    fi
}

# =============================================================================
# DATABASE OPERATIONS
# =============================================================================

# Run SQL on Turso
# Usage: run_sql "SELECT * FROM table"
run_sql() {
    turso db shell "$DB_NAME" "$1"
}

# Run SQL file on Turso
# Usage: run_sql_file "/path/to/file.sql"
run_sql_file() {
    turso db shell "$DB_NAME" < "$1"
}

# =============================================================================
# OUTPUT HELPERS
# =============================================================================

# Print a header
# Usage: print_header "Script Name"
print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
    echo -e "Database: ${YELLOW}$DB_NAME${NC}"
    echo ""
}

# Print success message
# Usage: print_success "Operation completed"
print_success() {
    echo -e "${GREEN}$1${NC}"
}

# Print warning message
# Usage: print_warning "Something to note"
print_warning() {
    echo -e "${YELLOW}$1${NC}"
}

# Print error message
# Usage: print_error "Something went wrong"
print_error() {
    echo -e "${RED}$1${NC}"
}

# Print info message
# Usage: print_info "Some information"
print_info() {
    echo -e "${BLUE}$1${NC}"
}
