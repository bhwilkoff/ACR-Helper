#!/bin/sh
# Screenshots of the stage harness (mock TEST data) at Meet's stage sizes.
# Usage: tools/stage_screens.sh OUTDIR [query]   e.g. "row=3&votes=revealed"
set -e
OUT=${1:-/tmp/acr-screens}; Q=${2:-row=1}
mkdir -p "$OUT"
cd "$(dirname "$0")/.."
python3 -m http.server 8765 >/dev/null 2>&1 & SRV=$!
trap 'kill $SRV' EXIT
sleep 1
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for S in 560,315 805,455 1280,720; do
  NAME=$(echo "$Q" | tr '=&' '-_')_$(echo $S | tr , x)
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --window-size=$S \
    --virtual-time-budget=3000 --screenshot="$OUT/$NAME.png" \
    "http://localhost:8765/addon/stage/?harness=1&mock=1&$Q" >/dev/null 2>&1
  echo "$OUT/$NAME.png"
done
