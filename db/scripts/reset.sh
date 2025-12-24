#!/bin/bash
# =============================================================================
# FRIJOL MÁGICO - DATABASE RESET SCRIPT
# =============================================================================
# Destroys and recreates the Turso database, then applies all migrations.
# WARNING: This will delete ALL data in the database!
# =============================================================================

set -e

# Load utilities
SCRIPT_DIR="$(dirname "$0")"
source "$SCRIPT_DIR/utils.sh"

# Initialize database connection
init_db
print_header "Turso Database Reset Script"

print_error "WARNING: This will DELETE ALL DATA in the database!"
echo ""

# =============================================================================
# MAIN
# =============================================================================

# Step 1: Destroy the database
print_info "Step 1/4: Destroying database..."
if turso db destroy "$DB_NAME" --yes 2>/dev/null; then
    print_success "Database destroyed"
else
    print_warning "Database did not exist or could not be destroyed (continuing...)"
fi
echo ""

# Step 2: Create the database
print_info "Step 2/4: Creating database..."
if turso db create "$DB_NAME"; then
    print_success "Database created"
else
    print_error "Failed to create database"
    exit 1
fi
echo ""

# Step 3: Run migrations
print_info "Step 3/4: Running migrations..."
echo ""
"$SCRIPT_DIR/migrate.sh"

echo ""

# Step 4: Run seed
print_info "Step 4/4: Running seed..."
echo ""
"$SCRIPT_DIR/seed.sh"

echo ""
print_success "=== Database reset completed! ==="
