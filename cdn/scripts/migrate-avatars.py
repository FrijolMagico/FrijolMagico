#!/usr/bin/env python3
"""
migrate-avatars.py - Migrate artist avatars from public/ to CDN bucket
Usage: python3 migrate-avatars.py [--dry-run]
"""

import csv
import os
import re
import subprocess
import sys
from pathlib import Path

# Configuration
SCRIPT_DIR = Path(__file__).parent.resolve()
PROJECT_ROOT = SCRIPT_DIR.parent.parent
CSV_FILE = PROJECT_ROOT / "tmp" / "INFORMACIÓN - Hoja 1.csv"
SOURCE_DIR = PROJECT_ROOT / "public" / "sections" / "catalogo" / "images" / "artists"
OUTPUT_DIR = PROJECT_ROOT / "cdn" / "bucket" / "artistas"
MAX_SIZE = "800x800"
QUALITY = "85"

# Colors
RED = '\033[0;31m'
GREEN = '\033[0;32m'
YELLOW = '\033[1;33m'
BLUE = '\033[0;34m'
NC = '\033[0m'

def generate_slug(name: str) -> str:
    """Generate URL-friendly slug from artist name."""
    slug = name.lower()
    # Replace accented characters
    replacements = {
        'á': 'a', 'à': 'a', 'ä': 'a', 'â': 'a',
        'é': 'e', 'è': 'e', 'ë': 'e', 'ê': 'e',
        'í': 'i', 'ì': 'i', 'ï': 'i', 'î': 'i',
        'ó': 'o', 'ò': 'o', 'ö': 'o', 'ô': 'o',
        'ú': 'u', 'ù': 'u', 'ü': 'u', 'û': 'u',
        'ñ': 'n'
    }
    for old, new in replacements.items():
        slug = slug.replace(old, new)
    # Replace spaces with hyphens
    slug = slug.replace(' ', '-')
    # Remove non-alphanumeric characters (except hyphens)
    slug = re.sub(r'[^a-z0-9-]', '', slug)
    # Remove multiple consecutive hyphens
    slug = re.sub(r'-+', '-', slug)
    # Remove leading/trailing hyphens
    slug = slug.strip('-')
    return slug

def get_image_dimensions(filepath: Path) -> tuple[int, int]:
    """Get image dimensions using ImageMagick."""
    result = subprocess.run(
        ['magick', 'identify', '-format', '%wx%h', str(filepath)],
        capture_output=True, text=True
    )
    if result.returncode == 0:
        dims = result.stdout.strip()
        w, h = dims.split('x')
        return int(w), int(h)
    return 0, 0

def optimize_avatar(source: Path, dest: Path) -> bool:
    """Optimize and convert avatar to WebP."""
    width, height = get_image_dimensions(source)
    
    # Determine target size (don't upscale small images)
    target_size = MAX_SIZE
    if width < 800 and height < 800:
        largest = max(width, height)
        target_size = f"{largest}x{largest}"
    
    # Create destination directory
    dest.parent.mkdir(parents=True, exist_ok=True)
    
    # Run ImageMagick
    result = subprocess.run([
        'magick', str(source),
        '-resize', f'{target_size}^',
        '-gravity', 'center',
        '-extent', target_size,
        '-quality', QUALITY,
        '-strip',
        str(dest)
    ], capture_output=True, text=True)
    
    return result.returncode == 0

def get_file_size(filepath: Path) -> int:
    """Get file size in bytes."""
    return filepath.stat().st_size if filepath.exists() else 0

def format_size(size_bytes: int) -> str:
    """Format bytes as human readable."""
    if size_bytes < 1024:
        return f"{size_bytes}B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes // 1024}KB"
    else:
        return f"{size_bytes // (1024 * 1024)}MB"

def main():
    dry_run = '--dry-run' in sys.argv
    
    if dry_run:
        print(f"{YELLOW}DRY RUN MODE{NC} - No files will be created\n")
    
    # Check dependencies
    result = subprocess.run(['which', 'magick'], capture_output=True)
    if result.returncode != 0:
        print(f"{RED}Error:{NC} ImageMagick not found. Install with: brew install imagemagick")
        sys.exit(1)
    
    if not CSV_FILE.exists():
        print(f"{RED}Error:{NC} CSV file not found: {CSV_FILE}")
        sys.exit(1)
    
    print(f"{BLUE}=== Avatar Migration ==={NC}")
    print(f"Source: {SOURCE_DIR}")
    print(f"Output: {OUTPUT_DIR}")
    print()
    
    # Create output directory
    if not dry_run:
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Counters
    total = 0
    success = 0
    errors = 0
    total_input_size = 0
    total_output_size = 0
    
    # Read CSV and process each row
    with open(CSV_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get('name', '').strip()
            avatar = row.get('avatar', '').strip()
            
            # Skip if no avatar
            if not avatar:
                continue
            
            total += 1
            
            # Generate slug
            slug = generate_slug(name)
            
            # Source and destination paths
            source_file = SOURCE_DIR / avatar
            dest_file = OUTPUT_DIR / slug / "avatar.webp"
            
            # Check if source exists
            if not source_file.exists():
                print(f"{RED}✗{NC} {name}: Source not found: {avatar}")
                errors += 1
                continue
            
            if dry_run:
                print(f"{YELLOW}→{NC} {name} ({avatar}) → {slug}/avatar.webp")
                success += 1
                continue
            
            # Optimize and convert
            input_size = get_file_size(source_file)
            
            if optimize_avatar(source_file, dest_file):
                output_size = get_file_size(dest_file)
                savings = 100 - (output_size * 100 // input_size) if input_size > 0 else 0
                
                total_input_size += input_size
                total_output_size += output_size
                
                print(f"{GREEN}✓{NC} {name} → {slug}/avatar.webp ({format_size(input_size)} → {format_size(output_size)}, {savings}% smaller)")
                success += 1
            else:
                print(f"{RED}✗{NC} {name}: Failed to optimize")
                errors += 1
    
    # Summary
    print()
    print(f"{BLUE}=== Summary ==={NC}")
    print(f"Total artists: {total}")
    print(f"{GREEN}Success: {success}{NC}")
    if errors > 0:
        print(f"{RED}Errors: {errors}{NC}")
    
    if dry_run:
        print()
        print(f"{YELLOW}This was a dry run. Run without --dry-run to execute.{NC}")
    elif success > 0:
        print()
        print(f"Total size: {format_size(total_input_size)} → {format_size(total_output_size)}")

if __name__ == '__main__':
    main()
