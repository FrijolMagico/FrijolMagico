#!/usr/bin/env python3
"""
insert-avatar-images.py - Insert avatar images into artista_imagen table
Usage: python3 insert-avatar-images.py [--dry-run]

This script reads image metadata from cdn/bucket/artistas/ and inserts
records into the artista_imagen table in Turso production database.
"""

import json
import subprocess
import sys
from pathlib import Path

# Configuration
SCRIPT_DIR = Path(__file__).parent.resolve()
PROJECT_ROOT = SCRIPT_DIR.parent.parent
BUCKET_DIR = PROJECT_ROOT / "cdn" / "bucket" / "artistas"
DB_NAME = "frijolmagico"

# Colors
GREEN = '\033[0;32m'
RED = '\033[0;31m'
YELLOW = '\033[1;33m'
BLUE = '\033[0;34m'
NC = '\033[0m'


def get_image_metadata(filepath: Path) -> dict | None:
    """Get image metadata using ImageMagick."""
    result = subprocess.run(
        ['magick', 'identify', '-format', '%w|%h|%b', str(filepath)],
        capture_output=True, text=True
    )
    if result.returncode == 0:
        parts = result.stdout.strip().split('|')
        width = int(parts[0])
        height = int(parts[1])
        # Parse size (e.g., "121246B" -> 121246)
        size_str = parts[2].rstrip('B')
        size = int(size_str)
        
        # Calculate aspect ratio
        from math import gcd
        divisor = gcd(width, height)
        aspect_w = width // divisor
        aspect_h = height // divisor
        aspect_ratio = f"{aspect_w}:{aspect_h}"
        
        return {
            "width": width,
            "height": height,
            "size": size,
            "aspectRatio": aspect_ratio,
            "format": "webp"
        }
    return None


def run_turso_query(query: str) -> tuple[bool, str]:
    """Execute a query against Turso database."""
    result = subprocess.run(
        ['turso', 'db', 'shell', DB_NAME, query],
        capture_output=True, text=True
    )
    return result.returncode == 0, result.stdout + result.stderr


def get_artistas_with_slugs() -> dict:
    """Get all artistas with their slugs from the database."""
    success, output = run_turso_query("SELECT id, slug FROM artista WHERE slug IS NOT NULL")
    if not success:
        print(f"{RED}Error fetching artistas:{NC} {output}")
        return {}
    
    artistas = {}
    lines = output.strip().split('\n')
    for line in lines[1:]:  # Skip header
        if line.strip():
            parts = line.split()
            if len(parts) >= 2:
                artista_id = int(parts[0])
                slug = parts[1]
                artistas[slug] = artista_id
    return artistas


def main():
    dry_run = '--dry-run' in sys.argv
    
    if dry_run:
        print(f"{YELLOW}DRY RUN MODE{NC} - No records will be inserted\n")
    
    print(f"{BLUE}=== Insert Avatar Images ==={NC}")
    print(f"Bucket: {BUCKET_DIR}")
    print(f"Database: {DB_NAME}")
    print()
    
    # Check if ImageMagick is available
    result = subprocess.run(['which', 'magick'], capture_output=True)
    if result.returncode != 0:
        print(f"{RED}Error:{NC} ImageMagick not found")
        sys.exit(1)
    
    # Get artistas from database
    print(f"{YELLOW}Fetching artistas from database...{NC}")
    artistas = get_artistas_with_slugs()
    if not artistas:
        print(f"{RED}Error:{NC} No artistas found")
        sys.exit(1)
    print(f"Found {len(artistas)} artistas with slugs\n")
    
    # Check existing records
    success, output = run_turso_query("SELECT COUNT(*) FROM artista_imagen WHERE tipo = 'avatar'")
    if success and '0' not in output.split('\n')[1]:
        existing = output.split('\n')[1].strip()
        print(f"{YELLOW}Warning:{NC} artista_imagen already has {existing} avatar records")
        response = input("Continue anyway? (y/N): ")
        if response.lower() != 'y':
            print("Aborted.")
            sys.exit(0)
        print()
    
    # Process each avatar
    success_count = 0
    error_count = 0
    inserts = []
    
    for slug_dir in sorted(BUCKET_DIR.iterdir()):
        if not slug_dir.is_dir():
            continue
        
        slug = slug_dir.name
        avatar_file = slug_dir / "avatar.webp"
        
        if not avatar_file.exists():
            print(f"{RED}✗{NC} {slug}: avatar.webp not found")
            error_count += 1
            continue
        
        if slug not in artistas:
            print(f"{RED}✗{NC} {slug}: No matching artista in database")
            error_count += 1
            continue
        
        artista_id = artistas[slug]
        metadata = get_image_metadata(avatar_file)
        
        if not metadata:
            print(f"{RED}✗{NC} {slug}: Could not read image metadata")
            error_count += 1
            continue
        
        imagen_url = f"artistas/{slug}/avatar.webp"
        metadata_json = json.dumps(metadata, separators=(',', ':'))
        
        # Escape single quotes in JSON for SQL
        metadata_sql = metadata_json.replace("'", "''")
        
        insert_sql = f"INSERT INTO artista_imagen (artista_id, imagen_url, tipo, orden, metadata) VALUES ({artista_id}, '{imagen_url}', 'avatar', 1, '{metadata_sql}')"
        
        if dry_run:
            print(f"{YELLOW}→{NC} {slug} (id={artista_id}): {metadata['width']}x{metadata['height']}, {metadata['size']}B")
            success_count += 1
        else:
            inserts.append((slug, artista_id, metadata, insert_sql))
    
    # Execute inserts
    if not dry_run and inserts:
        print(f"{YELLOW}Inserting {len(inserts)} records...{NC}\n")
        
        for slug, artista_id, metadata, insert_sql in inserts:
            success, output = run_turso_query(insert_sql)
            if success:
                print(f"{GREEN}✓{NC} {slug} (id={artista_id}): {metadata['width']}x{metadata['height']}, {metadata['size']}B")
                success_count += 1
            else:
                print(f"{RED}✗{NC} {slug}: {output.strip()}")
                error_count += 1
    
    # Summary
    print()
    print(f"{BLUE}=== Summary ==={NC}")
    print(f"{GREEN}Success: {success_count}{NC}")
    if error_count > 0:
        print(f"{RED}Errors: {error_count}{NC}")
    
    if dry_run:
        print()
        print(f"{YELLOW}This was a dry run. Run without --dry-run to execute.{NC}")
    else:
        # Verify
        success, output = run_turso_query("SELECT COUNT(*) FROM artista_imagen WHERE tipo = 'avatar'")
        if success:
            count = output.split('\n')[1].strip()
            print(f"\nTotal avatar records in DB: {count}")


if __name__ == '__main__':
    main()
