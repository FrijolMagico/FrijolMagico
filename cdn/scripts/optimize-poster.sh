#!/bin/bash
# optimize-poster.sh - Optimize poster images for CDN (WebP, max 800px height, 85% quality)
# Usage: ./cdn/scripts/optimize-poster.sh <input> <output-path>
# Example: ./cdn/scripts/optimize-poster.sh ~/posters/afiche.png cdn/bucket/festivales/frijol-magico/afiche-i.webp
#
# Unlike optimize.sh (for avatars), this script:
# - Does NOT crop images (maintains aspect ratio)
# - Limits HEIGHT to 800px (not both dimensions)
# - If height < 800px, only reduces quality without resizing

set -e

# Configuration
MAX_HEIGHT="800"
QUALITY="85"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

usage() {
    echo "Usage: $0 <input-file> <output-path>"
    echo ""
    echo "Examples:"
    echo "  $0 ~/posters/afiche.png cdn/bucket/festivales/frijol-magico/afiche-i.webp"
    echo ""
    echo "Options:"
    echo "  - Converts to WebP format"
    echo "  - Resizes to max ${MAX_HEIGHT}px height (maintains aspect ratio)"
    echo "  - If height < ${MAX_HEIGHT}px, only reduces quality"
    echo "  - Quality: ${QUALITY}%"
    exit 1
}

# Check arguments
if [ $# -lt 2 ]; then
    usage
fi

INPUT="$1"
OUTPUT="$2"

# Check if input exists
if [ ! -f "$INPUT" ]; then
    echo -e "${RED}Error:${NC} Input file not found: $INPUT"
    exit 1
fi

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    echo -e "${RED}Error:${NC} ImageMagick not found. Install with: sudo apt install imagemagick"
    exit 1
fi

# Create output directory if needed
OUTPUT_DIR=$(dirname "$OUTPUT")
mkdir -p "$OUTPUT_DIR"

# Get input dimensions
INPUT_HEIGHT=$(magick identify -format "%h" "$INPUT")

echo -e "${YELLOW}Processing:${NC} $(basename "$INPUT")"
echo -e "  Input height: ${INPUT_HEIGHT}px"

# Optimize and convert
if [ "$INPUT_HEIGHT" -gt "$MAX_HEIGHT" ]; then
    # Resize to max height, maintain aspect ratio
    echo -e "  Resizing to ${MAX_HEIGHT}px height..."
    magick "$INPUT" \
        -resize "x${MAX_HEIGHT}" \
        -quality "$QUALITY" \
        -strip \
        "$OUTPUT"
else
    # Only reduce quality, no resize
    echo -e "  Height < ${MAX_HEIGHT}px, only reducing quality..."
    magick "$INPUT" \
        -quality "$QUALITY" \
        -strip \
        "$OUTPUT"
fi

# Get file sizes
INPUT_SIZE=$(stat -c%s "$INPUT" 2>/dev/null || stat -f%z "$INPUT")
OUTPUT_SIZE=$(stat -c%s "$OUTPUT" 2>/dev/null || stat -f%z "$OUTPUT")
SAVINGS=$((100 - (OUTPUT_SIZE * 100 / INPUT_SIZE)))

# Get output dimensions
OUTPUT_DIMS=$(magick identify -format "%wx%h" "$OUTPUT")

echo -e "${GREEN}Created:${NC} $OUTPUT"
echo -e "  Dimensions: ${OUTPUT_DIMS}"
echo -e "  Size: $(numfmt --to=iec $INPUT_SIZE 2>/dev/null || echo "${INPUT_SIZE}B") -> $(numfmt --to=iec $OUTPUT_SIZE 2>/dev/null || echo "${OUTPUT_SIZE}B") (${SAVINGS}% smaller)"
echo ""
