#!/bin/bash
# optimize.sh - Optimize images for CDN (WebP)
# Usage: ./cdn/scripts/optimize.sh <input> <output> [options]
#
# Examples:
#   ./optimize.sh ~/img.png cdn/out/                        # Convert to WebP only
#   ./optimize.sh ~/img.png cdn/out/custom.webp             # With specific name
#   ./optimize.sh ~/img.png cdn/out/ -s 800x800 -c -q 85    # Avatar (square with crop)
#   ./optimize.sh ~/img.png cdn/out/poster.webp -s x800     # Poster (max height)
#   ./optimize.sh ~/batch/ cdn/out/ -s 400x -q 75           # Batch with max width

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Defaults
SIZE=""
QUALITY=""
CROP=false

usage() {
    echo -e "${CYAN}optimize.sh${NC} - Optimize images for CDN (WebP)"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo "  $0 <input> <output> [options]"
    echo ""
    echo -e "${YELLOW}Arguments:${NC}"
    echo "  input     Input file or folder"
    echo "  output    Output folder (auto-generates slug.webp) or exact path (*.webp)"
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo "  -s, --size=GEOMETRY   Resize dimension (ImageMagick syntax)"
    echo "                        Examples: 800x800, 800x, x800, 50%"
    echo "  -q, --quality=N       Quality 1-100 (default: ImageMagick default ~92)"
    echo "  -c, --crop            Enable center crop (requires WxH size)"
    echo "  -h, --help            Show this help"
    echo ""
    echo -e "${YELLOW}Size syntax:${NC}"
    echo "  WxH    Fit within WxH, maintain aspect ratio"
    echo "  Wx     Limit width, height proportional"
    echo "  xH     Limit height, width proportional"
    echo "  N%     Scale by percentage"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 ~/img.png cdn/out/                        # Convert to WebP only"
    echo "  $0 ~/img.png cdn/out/custom.webp             # With specific name"
    echo "  $0 ~/img.png cdn/out/ -s 800x800 -c -q 85    # Avatar (square with crop)"
    echo "  $0 ~/img.png cdn/out/poster.webp -s x800     # Poster (max height)"
    echo "  $0 ~/batch/ cdn/out/ -s 400x -q 75           # Batch with max width"
    exit 0
}

# Parse arguments
POSITIONAL=()
while [[ $# -gt 0 ]]; do
    case $1 in
        -s=*|--size=*)
            SIZE="${1#*=}"
            shift
            ;;
        -s|--size)
            SIZE="$2"
            shift 2
            ;;
        -q=*|--quality=*)
            QUALITY="${1#*=}"
            shift
            ;;
        -q|--quality)
            QUALITY="$2"
            shift 2
            ;;
        -c|--crop)
            CROP=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        -*)
            echo -e "${RED}Error:${NC} Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
        *)
            POSITIONAL+=("$1")
            shift
            ;;
    esac
done

# Restore positional parameters
set -- "${POSITIONAL[@]}"

# Check required arguments
if [ ${#POSITIONAL[@]} -lt 2 ]; then
    echo -e "${RED}Error:${NC} Missing required arguments"
    echo "Use --help for usage information"
    exit 1
fi

INPUT="$1"
OUTPUT="$2"

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    echo -e "${RED}Error:${NC} ImageMagick not found."
    echo "Install with: sudo apt install imagemagick (Linux) or brew install imagemagick (macOS)"
    exit 1
fi

# Validate crop requires WxH format
if [ "$CROP" = true ] && [ -n "$SIZE" ]; then
    if ! [[ "$SIZE" =~ ^[0-9]+x[0-9]+$ ]]; then
        echo -e "${RED}Error:${NC} --crop requires WxH size format (e.g., 800x800)"
        exit 1
    fi
fi

# Generate slug from filename
generate_slug() {
    local filename="$1"
    local name="${filename%.*}"
    echo "$name" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9-]//g'
}

# Get output path for a file
get_output_path() {
    local input_file="$1"
    local output_base="$2"
    
    # If output ends with .webp, use it directly
    if [[ "$output_base" == *.webp ]]; then
        echo "$output_base"
    else
        # Otherwise, generate slug and append to directory
        local filename=$(basename "$input_file")
        local slug=$(generate_slug "$filename")
        # Ensure output_base ends with /
        output_base="${output_base%/}/"
        echo "${output_base}${slug}.webp"
    fi
}

# Format file size for display
format_size() {
    local size=$1
    if command -v numfmt &> /dev/null; then
        numfmt --to=iec "$size" 2>/dev/null || echo "${size}B"
    else
        # Fallback for systems without numfmt
        if [ "$size" -ge 1048576 ]; then
            echo "$(( size / 1048576 ))M"
        elif [ "$size" -ge 1024 ]; then
            echo "$(( size / 1024 ))K"
        else
            echo "${size}B"
        fi
    fi
}

# Optimize a single image
optimize_image() {
    local input="$1"
    local output="$2"
    
    local filename=$(basename "$input")
    echo -e "${YELLOW}Processing:${NC} $filename"
    
    # Create output directory if needed
    local output_dir=$(dirname "$output")
    mkdir -p "$output_dir"
    
    # Build magick command
    local cmd=(magick "$input")
    
    # Add resize if specified
    if [ -n "$SIZE" ]; then
        if [ "$CROP" = true ]; then
            # Crop mode: resize to cover, then crop to exact size
            cmd+=(-resize "${SIZE}^>")
            cmd+=(-gravity center)
            cmd+=(-extent "$SIZE")
        else
            # Normal mode: fit within size, don't upscale
            cmd+=(-resize "${SIZE}>")
        fi
    fi
    
    # Add quality if specified
    if [ -n "$QUALITY" ]; then
        cmd+=(-quality "$QUALITY")
    fi
    
    # Strip metadata
    cmd+=(-strip)
    
    # Output file
    cmd+=("$output")
    
    # Execute
    "${cmd[@]}"
    
    # Get file sizes
    local input_size=$(stat -c%s "$input" 2>/dev/null || stat -f%z "$input")
    local output_size=$(stat -c%s "$output" 2>/dev/null || stat -f%z "$output")
    local savings=$((100 - (output_size * 100 / input_size)))
    
    # Get output dimensions
    local output_dims=$(magick identify -format "%wx%h" "$output")
    
    echo -e "${GREEN}Created:${NC} $output"
    echo -e "  Dimensions: ${output_dims}"
    echo -e "  Size: $(format_size $input_size) -> $(format_size $output_size) (${savings}% smaller)"
    echo ""
}

# Main execution
if [ ! -e "$INPUT" ]; then
    echo -e "${RED}Error:${NC} Input not found: $INPUT"
    exit 1
fi

if [ -f "$INPUT" ]; then
    # Single file
    output_path=$(get_output_path "$INPUT" "$OUTPUT")
    optimize_image "$INPUT" "$output_path"
elif [ -d "$INPUT" ]; then
    # Directory - process all images
    # Check that output is a directory (not a specific file)
    if [[ "$OUTPUT" == *.webp ]]; then
        echo -e "${RED}Error:${NC} Output must be a directory when input is a folder"
        exit 1
    fi
    
    echo -e "${CYAN}Processing folder:${NC} $INPUT"
    echo -e "${CYAN}Options:${NC} size=${SIZE:-default} quality=${QUALITY:-default} crop=${CROP}"
    echo ""
    
    count=0
    shopt -s nullglob
    for img in "$INPUT"/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP,gif,GIF}; do
        output_path=$(get_output_path "$img" "$OUTPUT")
        optimize_image "$img" "$output_path"
        ((count++))
    done
    shopt -u nullglob
    
    if [ $count -eq 0 ]; then
        echo -e "${YELLOW}Warning:${NC} No images found in $INPUT"
    else
        echo -e "${GREEN}Done!${NC} Processed $count images"
    fi
else
    echo -e "${RED}Error:${NC} Input is neither a file nor a directory: $INPUT"
    exit 1
fi
