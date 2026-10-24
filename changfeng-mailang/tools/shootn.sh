#!/bin/bash
# 一次出多张：tools/shootn.sh "名称:query" "名称:query" ...
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT=$((8130 + RANDOM % 200))
cd "$ROOT"
python3 -m http.server $PORT --bind 127.0.0.1 >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null' EXIT
sleep 1
pids=()
for spec in "$@"; do
  NAME="${spec%%:*}"; Q="${spec#*:}"
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    --headless=new --no-sandbox --hide-scrollbars \
    --enable-unsafe-swiftshader --use-angle=swiftshader \
    --window-size=1600,1087 --force-device-scale-factor=1 --virtual-time-budget=70000 \
    --user-data-dir="/tmp/cc-$NAME-$$" \
    --screenshot="$ROOT/shots/$NAME.png" \
    "http://127.0.0.1:$PORT/index.html?shot=1&t=11&$Q" >/dev/null 2>&1 &
  pids+=($!)
done
for p in "${pids[@]}"; do wait $p; done
ls -lh "$ROOT"/shots/*.png | tail -6