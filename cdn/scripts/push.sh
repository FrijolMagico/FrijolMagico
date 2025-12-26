#!/bin/bash
# push.sh - Sync local cdn/bucket/ folder to Cloudflare R2
# Usage: ./cdn/scripts/push.sh [--dry-run]

set -e

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Configuration
BUCKET="frijolmagico-cdn"
REMOTE="r2"
LOCAL_DIR="$PROJECT_ROOT/cdn/bucket"
RCLONE_FLAGS="--s3-no-check-bucket"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if rclone is installed
if ! command -v rclone &> /dev/null; then
    echo -e "${RED}Error:${NC} rclone not found. Install with: brew install rclone"
    exit 1
fi

# Check if local bucket directory exists
if [ ! -d "$LOCAL_DIR" ]; then
    echo -e "${RED}Error:${NC} Local cdn/bucket/ directory not found"
    exit 1
fi

# Parse arguments
DRY_RUN=""
if [ "$1" == "--dry-run" ]; then
    DRY_RUN="--dry-run"
    echo -e "${YELLOW}DRY RUN MODE${NC} - No files will be uploaded"
    echo ""
fi

echo -e "${CYAN}CDN Push to Cloudflare R2${NC}"
echo -e "Bucket: ${GREEN}${BUCKET}${NC}"
echo -e "URL: ${GREEN}https://cdn.frijolmagico.cl/${NC}"
echo ""

# Show what will be synced
echo -e "${YELLOW}Local files:${NC}"
find "$LOCAL_DIR" -type f \( -name "*.webp" -o -name "*.jpg" -o -name "*.png" \) 2>/dev/null | while read -r file; do
    size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file")
    relative_path="${file#$LOCAL_DIR/}"
    echo "  $relative_path ($(numfmt --to=iec $size 2>/dev/null || echo "${size}B"))"
done
echo ""

# Sync to R2
echo -e "${YELLOW}Syncing...${NC}"
rclone sync "$LOCAL_DIR" "${REMOTE}:${BUCKET}" $RCLONE_FLAGS $DRY_RUN --progress

echo ""
echo -e "${GREEN}Done!${NC}"

# List remote files
echo ""
echo -e "${CYAN}Files on R2:${NC}"
rclone ls "${REMOTE}:${BUCKET}" $RCLONE_FLAGS | while read -r size file; do
    echo "  https://cdn.frijolmagico.cl/$file"
done
