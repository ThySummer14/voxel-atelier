#!/bin/bash
# 出图：本地起 http 服务 → Chrome 无头渲染 → 存 PNG
# 用法: tools/shoot.sh <输出名> [query 覆盖]
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NAME="${1:-shot}"
Q="${2:-}"
PORT=8123
OUT="$ROOT/shots/$NAME.png"

pkill -f "http.server $PORT" 2>/dev/null || true
sleep 0.3
cd "$ROOT"
python3 -m http.server $PORT --bind 127.0.0.1 >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null || true' EXIT
sleep 0.8

URL="http://127.0.0.1:$PORT/index.html?shot=1&t=9&$Q"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --no-sandbox --hide-scrollbars \
  --user-data-dir="$(mktemp -d /tmp/ccshot.XXXXXX)" --disable-application-cache \
  --enable-unsafe-swiftshader --use-angle=swiftshader \
  --window-size=1600,1087 --force-device-scale-factor=1 --virtual-time-budget=45000 \
  --screenshot="$OUT" "$URL" >/dev/null 2>&1 &
CH=$!
( sleep 300; kill $CH 2>/dev/null ) &
WATCH=$!
wait $CH 2>/dev/null || true
kill $WATCH 2>/dev/null || true

kill $SRV 2>/dev/null || true
ls -lh "$OUT" 2>/dev/null || echo "FAILED: $OUT 不存在"