#!/bin/bash
# migrate-avatars.sh - Migrate artist avatars from public/ to CDN bucket
# Usage: ./cdn/scripts/migrate-avatars.sh [--dry-run]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

DRY_RUN=""
if [ "$1" == "--dry-run" ]; then
    DRY_RUN="--dry-run"
fi

# Run the Python script
python3 "$SCRIPT_DIR/migrate-avatars.py" $DRY_RUN
