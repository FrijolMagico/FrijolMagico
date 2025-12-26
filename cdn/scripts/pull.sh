#!/bin/bash
# pull.sh - Download Cloudflare R2 bucket to local cdn/bucket/
# Usage: ./cdn/scripts/pull.sh [--dry-run]

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

# Parse arguments
DRY_RUN=""
if [ "$1" == "--dry-run" ]; then
    DRY_RUN="--dry-run"
    echo -e "${YELLOW}DRY RUN MODE${NC} - No files will be downloaded"
    echo ""
fi

echo -e "${CYAN}CDN Pull from Cloudflare R2${NC}"
echo -e "Bucket: ${GREEN}${BUCKET}${NC}"
echo -e "Local: ${GREEN}${LOCAL_DIR}${NC}"
echo ""

# Show remote files
echo -e "${YELLOW}Remote files:${NC}"
rclone ls "${REMOTE}:${BUCKET}" $RCLONE_FLAGS | while read -r size file; do
    echo "  $file ($(numfmt --to=iec $size 2>/dev/null || echo "${size}B"))"
done
echo ""

# Create local directory if needed
mkdir -p "$LOCAL_DIR"

# Sync from R2
echo -e "${YELLOW}Downloading...${NC}"
rclone sync "${REMOTE}:${BUCKET}" "$LOCAL_DIR" $RCLONE_FLAGS $DRY_RUN --progress

echo ""
echo -e "${GREEN}Done!${NC}"

# List local files
echo ""
echo -e "${CYAN}Local files:${NC}"
find "$LOCAL_DIR" -type f \( -name "*.webp" -o -name "*.jpg" -o -name "*.png" \) 2>/dev/null | while read -r file; do
    relative_path="${file#$LOCAL_DIR/}"
    echo "  $relative_path"
done
