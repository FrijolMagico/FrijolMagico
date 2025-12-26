#!/bin/bash
# optimize.sh - Optimize images for CDN (WebP, 800x800, 85% quality)
# Usage: ./cdn/scripts/optimize.sh <input> <output-folder>
# Example: ./cdn/scripts/optimize.sh ~/Downloads/artist.png cdn/bucket/artistas

set -e

# Configuration
MAX_SIZE="800x800"
QUALITY="85"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

usage() {
    echo "Usage: $0 <input-file-or-folder> <output-folder>"
    echo ""
    echo "Examples:"
    echo "  $0 ~/Downloads/artist.png cdn/bucket/artistas"
    echo "  $0 ~/Downloads/batch/ cdn/bucket/artistas"
    echo ""
    echo "Options:"
    echo "  - Converts to WebP format"
    echo "  - Resizes to max ${MAX_SIZE} (maintains aspect ratio)"
    echo "  - Quality: ${QUALITY}%"
    exit 1
}

optimize_image() {
    local input="$1"
    local output_dir="$2"
    local filename=$(basename "$input")
    local name="${filename%.*}"
    # Convert to lowercase slug
    local slug=$(echo "$name" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9-]//g')
    local output="${output_dir}/${slug}.webp"

    echo -e "${YELLOW}Processing:${NC} $filename"
    
    # Check if ImageMagick is installed
    if ! command -v magick &> /dev/null; then
        echo -e "${RED}Error:${NC} ImageMagick not found. Install with: brew install imagemagick"
        exit 1
    fi

    # Create output directory if needed
    mkdir -p "$output_dir"

    # Optimize and convert (crop central, don't upscale)
    magick "$input" \
        -resize "${MAX_SIZE}^>" \
        -gravity center \
        -extent "${MAX_SIZE}" \
        -quality "$QUALITY" \
        -strip \
        "$output"

    # Get file sizes
    local input_size=$(stat -c%s "$input" 2>/dev/null || stat -f%z "$input")
    local output_size=$(stat -c%s "$output" 2>/dev/null || stat -f%z "$output")
    local savings=$((100 - (output_size * 100 / input_size)))

    echo -e "${GREEN}Created:${NC} $output"
    echo -e "  Size: $(numfmt --to=iec $input_size 2>/dev/null || echo "${input_size}B") -> $(numfmt --to=iec $output_size 2>/dev/null || echo "${output_size}B") (${savings}% smaller)"
    echo ""
}

# Check arguments
if [ $# -lt 2 ]; then
    usage
fi

INPUT="$1"
OUTPUT_DIR="$2"

# Process input
if [ -f "$INPUT" ]; then
    # Single file
    optimize_image "$INPUT" "$OUTPUT_DIR"
elif [ -d "$INPUT" ]; then
    # Directory - process all images
    echo -e "${GREEN}Processing folder:${NC} $INPUT"
    echo ""
    count=0
    for img in "$INPUT"/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP} 2>/dev/null; do
        [ -f "$img" ] || continue
        optimize_image "$img" "$OUTPUT_DIR"
        ((count++))
    done
    echo -e "${GREEN}Done!${NC} Processed $count images"
else
    echo -e "${RED}Error:${NC} Input not found: $INPUT"
    exit 1
fi
