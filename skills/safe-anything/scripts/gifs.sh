#!/bin/sh
# Renders docs/assets/gif/<name>.html to docs/assets/<name>.gif with headless Chrome and ffmpeg.
# Each page puts its frame count in the title ("frames:N") and draws frame i for URL hash #i.
# Run from anywhere: sh scripts/gifs.sh [name...]
set -eu
cd "$(dirname "$0")/.."
chrome="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
fps=12
for page in docs/assets/gif/*.html; do
  name=$(basename "$page" .html)
  if [ $# -gt 0 ]; then
    case " $* " in *" $name "*) ;; *) continue ;; esac
  fi
  url="file://$PWD/$page"
  size=$(sed -n 's/.*data-size="\([0-9]*,[0-9]*\)".*/\1/p' "$page" | head -1)
  count=$("$chrome" --headless=new --disable-gpu --dump-dom "$url#0" 2>/dev/null | sed -n 's/.*<title>frames:\([0-9]*\)<\/title>.*/\1/p')
  [ -n "$count" ] || { echo "$page: no frame count in the title" >&2; exit 1; }
  frames=$(mktemp -d)
  i=0
  while [ "$i" -lt "$count" ]; do
    "$chrome" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
      --window-size="$size" --screenshot="$frames/f$(printf %04d "$i").png" "$url#$i" 2>/dev/null
    i=$((i + 1))
  done
  ffmpeg -y -loglevel error -framerate $fps -i "$frames/f%04d.png" -vf palettegen=max_colors=96:stats_mode=diff "$frames/palette.png"
  ffmpeg -y -loglevel error -framerate $fps -i "$frames/f%04d.png" -i "$frames/palette.png" \
    -lavfi paletteuse=dither=none:diff_mode=rectangle -loop 0 "docs/assets/$name.gif"
  rm -rf "$frames"
  echo "docs/assets/$name.gif: $count frames, $(($(wc -c < "docs/assets/$name.gif") / 1024)) KB"
done
