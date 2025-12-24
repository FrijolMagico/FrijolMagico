#!/bin/bash
# =============================================================================
# FRIJOL MÁGICO - DATABASE SEED SCRIPT
# =============================================================================
# Inserts seed data (system-required catalogs) into the database.
# Uses INSERT OR IGNORE to be idempotent (safe to run multiple times).
# =============================================================================

set -e

# Load utilities
source "$(dirname "$0")/utils.sh"

# Initialize database connection
init_db
print_header "Turso Seed Script"

# =============================================================================
# MAIN
# =============================================================================

# Check if seed file exists
if [ ! -f "$SEED_FILE" ]; then
    print_error "Error: Seed file not found at $SEED_FILE"
    exit 1
fi

# Run seed
print_warning "Inserting seed data..."
if run_sql_file "$SEED_FILE"; then
    print_success "Seed data inserted successfully!"
else
    print_error "Failed to insert seed data"
    exit 1
fi
