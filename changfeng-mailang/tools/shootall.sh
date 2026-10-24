#!/bin/bash
# 顺序出全套机位图（软件渲染很吃 CPU，别并行）
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
for spec in "$@"; do
  NAME="${spec%%:*}"; Q="${spec#*:}"
  "$ROOT/tools/shoot.sh" "$NAME" "$Q" >/dev/null 2>&1
  echo "done $NAME"
done
