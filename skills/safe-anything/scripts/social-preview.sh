#!/bin/sh
# Renders docs/assets/social-preview.png from docs/assets/social.html.
set -eu
cd "$(dirname "$0")/../docs/assets"
chrome="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
"$chrome" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1280,640 --screenshot="$PWD/social-preview.png" "file://$PWD/social.html" 2>/dev/null
echo "docs/assets/social-preview.png"
