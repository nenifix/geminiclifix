#!/bin/bash
# install.sh — geminiclifix installer
# curl -fsSL https://raw.githubusercontent.com/nenifix/nenicoder/main/apps/geminiclifix/install.sh | bash
set -euo pipefail
echo "=== geminiclifix installer ==="
echo "Developed by nenifix.com"
echo ""
command -v node &>/dev/null && echo "[OK] Node $(node -v)" || { echo "ERROR: Node.js >= 18 required"; exit 1; }
command -v git &>/dev/null && echo "[OK] git" || { echo "ERROR: git required"; exit 1; }
INSTALL_DIR="${GEMINICLIFIX_DIR:-$HOME/geminiclifix}"
REPO="https://github.com/nenifix/nenicoder.git"
if [ -d "$INSTALL_DIR/.git" ]; then
  echo "Updating $INSTALL_DIR..."
  git -C "$INSTALL_DIR" pull --rebase 2>/dev/null || true
else
  git clone "$REPO" "$INSTALL_DIR" 2>/dev/null || { echo "ERROR: Clone failed"; exit 1; }
fi
cd "$INSTALL_DIR"
npm install --production 2>/dev/null || true
[ ! -f .env ] && cp .env.example .env 2>/dev/null || true
chmod +x bin/geminiclifix
echo ""
echo "Installed at $INSTALL_DIR"
echo "Edit .env, then run: ./bin/geminiclifix"
