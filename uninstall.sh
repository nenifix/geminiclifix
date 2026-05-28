#!/bin/bash
# uninstall.sh — geminiclifix uninstaller
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "=== geminiclifix uninstaller ==="
echo "Developed by nenifix.com"
echo ""
echo "This will remove geminiclifix from: $SCRIPT_DIR"
echo ""
read -p "Are you sure? [y/N] " confirm
[[ "$confirm" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }
echo ""
echo "Stop the bot first:"
echo "  pkill -f geminiclifix"
echo "  pkill -f 'node dist/index.js'"
echo ""
echo "Then delete the app directory:"
echo "  rm -rf \"$SCRIPT_DIR\""
echo ""
echo "If installed globally, also remove:"
echo "  sudo rm /usr/local/bin/geminiclifix"
echo ""
echo "geminiclifix uninstall complete."
