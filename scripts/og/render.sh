#!/usr/bin/env bash
# Renderiza scripts/og/og-image.html a public/og-image.png con Chromium headless.
set -euo pipefail
cd "$(dirname "$0")/../.."
CHROME="${CHROME:-$(ls -d ~/.cache/ms-playwright/chromium_headless_shell-*/chrome-linux/headless_shell 2>/dev/null | tail -1)}"
"$CHROME" --no-sandbox --disable-gpu --hide-scrollbars --window-size=1200,630 \
  --virtual-time-budget=5000 --screenshot=public/og-image.png "file://$PWD/scripts/og/og-image.html"
