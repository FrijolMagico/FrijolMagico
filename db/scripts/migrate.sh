#!/bin/bash
# =============================================================================
# FRIJOL MÁGICO - DATABASE MIGRATION SCRIPT
# =============================================================================
# Applies pending migrations to the Turso database.
# Tracks applied migrations in the _migrations table.
# =============================================================================

set -e

# Load utilities
source "$(dirname "$0")/utils.sh"

# Initialize database connection
init_db
print_header "Turso Migration Script"

# =============================================================================
# MIGRATION FUNCTIONS
# =============================================================================

# Check if a migration has been applied
is_migration_applied() {
    local migration_name="$1"
    local result
    result=$(run_sql "SELECT COUNT(*) FROM _migrations WHERE name = '$migration_name';" 2>/dev/null || echo "0")
    # Extract the number, trimming whitespace and skipping header
    result=$(echo "$result" | tr -d ' ' | grep -E '^[0-9]+$' | head -1)
    [ "$result" = "1" ]
}

# Record a migration as applied
record_migration() {
    local migration_name="$1"
    run_sql "INSERT INTO _migrations (name) VALUES ('$migration_name');"
}

# =============================================================================
# MAIN
# =============================================================================

# Get all migration files sorted by name
migration_files=$(find "$MIGRATIONS_DIR" -name "*.sql" -type f | sort)

if [ -z "$migration_files" ]; then
    print_warning "No migration files found in $MIGRATIONS_DIR"
    exit 0
fi

# Count migrations
total_migrations=$(echo "$migration_files" | wc -l)
applied_count=0
skipped_count=0

echo -e "Found ${BLUE}$total_migrations${NC} migration file(s)"
echo ""

# Process each migration file
for migration_file in $migration_files; do
    migration_name=$(basename "$migration_file")
    
    # Special handling for the migrations table itself
    if [ "$migration_name" = "0000-create-migrations-table.sql" ]; then
        print_info "->  $migration_name"
        print_warning "    Ensuring migrations table exists..."
        run_sql_file "$migration_file"
        
        # Only record if not already recorded (use INSERT OR IGNORE)
        run_sql "INSERT OR IGNORE INTO _migrations (name) VALUES ('$migration_name');"
        print_success "    Migrations table ready"
        echo ""
        continue
    fi
    
    # Check if migration has already been applied
    if is_migration_applied "$migration_name"; then
        echo -e "${GREEN}[x]${NC} $migration_name ${YELLOW}(already applied)${NC}"
        ((skipped_count++)) || true
    else
        print_info "->  $migration_name"
        print_warning "    Applying..."
        
        if run_sql_file "$migration_file"; then
            record_migration "$migration_name"
            print_success "    Done"
            ((applied_count++)) || true
        else
            print_error "    Failed!"
            exit 1
        fi
    fi
done

echo ""
print_info "=== Migration Summary ==="
echo -e "Applied: ${GREEN}$applied_count${NC}"
echo -e "Skipped: ${YELLOW}$skipped_count${NC}"
print_success "All migrations completed successfully!"
