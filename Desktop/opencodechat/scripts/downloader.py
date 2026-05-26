#!/usr/bin/env python3
"""
OpenCodeChat Downloader
Robust file downloader with redirect handling, integrity checks, and progress reporting.

Usage:
    python downloader.py <URL> [--output PATH] [--checksum HASH] [--timeout SECONDS]

Examples:
    python downloader.py https://example.com/file.zip
    python downloader.py https://example.com/file.zip --output myfile.zip
    python downloader.py https://example.com/file.zip --checksum abc123 --algorithm sha256
"""

import argparse
import hashlib
import os
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

def get_filename_from_url(url: str, headers: dict = None) -> str:
    """Extract filename from URL or Content-Disposition header."""
    # Try Content-Disposition header first
    if headers:
        cd = headers.get("Content-Disposition", "")
        if "filename=" in cd:
            fname = cd.split("filename=")[-1].strip().strip('"').strip("'")
            if fname:
                return fname

    # Fall back to URL path
    parsed = urlparse(url)
    path = parsed.path
    if path and "/" in path:
        fname = path.rsplit("/", 1)[-1]
        if fname and "." in fname:
            return fname

    return "download"


def format_size(size_bytes: int) -> str:
    """Format bytes to human-readable string."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    elif size_bytes < 1024 * 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.1f} MB"
    else:
        return f"{size_bytes / (1024 * 1024 * 1024):.1f} GB"


def compute_checksum(filepath: str, algorithm: str = "sha256") -> str:
    """Compute file checksum."""
    h = hashlib.new(algorithm)
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def download_curl(url: str, dest: str, timeout: int = 60) -> dict:
    """Download using curl (preferred on most systems)."""
    import subprocess
    
    cmd = [
        "curl", "-L",  # Follow redirects
        "--max-time", str(timeout),
        "--connect-timeout", "15",
        "-o", dest,
        "-w", "%{http_code}|%{size_download}|%{content_type}|%{url_effective}",
        "-s",  # Silent
        url,
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout + 10)
    
    if result.returncode != 0:
        return {
            "success": False,
            "error": f"curl failed (exit {result.returncode}): {result.stderr.strip() or 'unknown error'}"
        }
    
    parts = result.stdout.strip().split("|")
    if len(parts) >= 4:
        status_code = int(parts[0]) if parts[0].isdigit() else 0
        size = int(parts[1]) if parts[1].isdigit() else 0
        content_type = parts[2]
        effective_url = parts[3]
    else:
        status_code = 200
        size = os.path.getsize(dest) if os.path.exists(dest) else 0
        content_type = "unknown"
        effective_url = url
    
    if status_code not in (200, 201, 206):
        if os.path.exists(dest):
            os.remove(dest)
        return {
            "success": False,
            "error": f"HTTP {status_code}: download failed",
            "status_code": status_code,
        }
    
    return {
        "success": True,
        "size": size,
        "content_type": content_type,
        "effective_url": effective_url,
        "path": dest,
    }


def download_python(url: str, dest: str, timeout: int = 60) -> dict:
    """Download using Python's urllib (fallback)."""
    import urllib.request
    import urllib.error
    
    req = urllib.request.Request(url, headers={
        "User-Agent": "OpenCodeChat-Downloader/1.0",
    })
    
    try:
        response = urllib.request.urlopen(req, timeout=timeout)
        status_code = response.getcode()
        
        if status_code not in (200, 201, 206):
            return {
                "success": False,
                "error": f"HTTP {status_code}",
                "status_code": status_code,
            }
        
        # Read and save
        data = response.read()
        os.makedirs(os.path.dirname(dest) or ".", exist_ok=True)
        with open(dest, "wb") as f:
            f.write(data)
        
        content_type = response.headers.get("Content-Type", "unknown")
        effective_url = response.geturl()
        
        return {
            "success": True,
            "size": len(data),
            "content_type": content_type,
            "effective_url": effective_url,
            "path": dest,
        }
    
    except urllib.error.HTTPError as e:
        return {
            "success": False,
            "error": f"HTTP {e.code}: {e.reason}",
            "status_code": e.code,
        }
    except urllib.error.URLError as e:
        return {
            "success": False,
            "error": f"URL error: {e.reason}",
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }


def download_wget(url: str, dest: str, timeout: int = 60) -> dict:
    """Download using wget (fallback)."""
    import subprocess
    
    cmd = [
        "wget",
        "--timeout", str(timeout),
        "--tries", "3",
        "--no-check-certificate",
        "-O", dest,
        url,
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout + 10)
    
    if result.returncode != 0:
        if os.path.exists(dest):
            os.remove(dest)
        return {
            "success": False,
            "error": f"wget failed (exit {result.returncode}): {result.stderr.strip() or 'unknown error'}"
        }
    
    size = os.path.getsize(dest) if os.path.exists(dest) else 0
    return {
        "success": True,
        "size": size,
        "path": dest,
    }


def main():
    parser = argparse.ArgumentParser(
        description="OpenCodeChat Downloader - Robust file downloader",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("url", help="URL of the file to download")
    parser.add_argument("-o", "--output", help="Output file path (default: auto-detect from URL)")
    parser.add_argument("-c", "--checksum", help="Expected checksum to verify integrity")
    parser.add_argument("-a", "--algorithm", default="sha256", choices=["md5", "sha1", "sha256", "sha512"],
                        help="Checksum algorithm (default: sha256)")
    parser.add_argument("-t", "--timeout", type=int, default=60, help="Download timeout in seconds (default: 60)")
    parser.add_argument("-v", "--verbose", action="store_true", help="Verbose output")
    
    args = parser.parse_args()
    
    # Validate URL
    parsed = urlparse(args.url)
    if not parsed.scheme or not parsed.netloc:
        print(f"❌ Invalid URL: {args.url}", file=sys.stderr)
        sys.exit(1)
    
    # Determine output path
    dest = args.output
    if not dest:
        fname = get_filename_from_url(args.url)
        dest = os.path.join("downloads", fname)
    
    # Ensure output directory exists
    dest_dir = os.path.dirname(dest)
    if dest_dir:
        os.makedirs(dest_dir, exist_ok=True)
    
    # Avoid overwriting
    if os.path.exists(dest):
        base, ext = os.path.splitext(dest)
        counter = 1
        while os.path.exists(dest):
            dest = f"{base}_{counter}{ext}"
            counter += 1
    
    if args.verbose:
        print(f"📥 Downloading: {args.url}")
        print(f"💾 Saving to: {dest}")
    
    # Try downloaders in order of preference
    downloaders = [
        ("curl", download_curl),
        ("wget", download_wget),
        ("python", download_python),
    ]
    
    result = None
    for name, func in downloaders:
        try:
            result = func(args.url, dest, args.timeout)
            if result.get("success"):
                if args.verbose:
                    print(f"✅ Downloaded via {name}")
                break
            elif args.verbose:
                print(f"⚠️ {name} failed: {result.get('error')}")
        except FileNotFoundError:
            if args.verbose:
                print(f"⚠️ {name} not available")
            continue
        except Exception as e:
            if args.verbose:
                print(f"⚠️ {name} error: {e}")
            continue
    
    if not result or not result.get("success"):
        print(f"❌ Download failed: {result.get('error') if result else 'no downloader available'}", file=sys.stderr)
        sys.exit(1)
    
    # Verify checksum if provided
    if args.checksum:
        if args.verbose:
            print(f"🔍 Verifying {args.algorithm} checksum...")
        actual = compute_checksum(dest, args.algorithm)
        if actual.lower() != args.checksum.lower():
            os.remove(dest)
            print(f"❌ Checksum mismatch!", file=sys.stderr)
            print(f"   Expected: {args.checksum}", file=sys.stderr)
            print(f"   Actual:   {actual}", file=sys.stderr)
            sys.exit(1)
        if args.verbose:
            print(f"✅ Checksum verified: {actual}")
    
    # Report
    size = result.get("size", os.path.getsize(dest))
    print(f"✅ Downloaded: {dest}")
    print(f"   Size: {format_size(size)}")
    if result.get("content_type"):
        print(f"   Type: {result['content_type']}")
    if result.get("effective_url") and result["effective_url"] != args.url:
        print(f"   Final URL: {result['effective_url']}")


if __name__ == "__main__":
    main()
