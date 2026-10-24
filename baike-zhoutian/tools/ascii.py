#!/usr/bin/env python3
"""ASCII 预览：把 PPM 降采样成字符图，色类映射字符——离线构图审查用。"""
import sys

def classify(r, g, b):
    mx, mn = max(r, g, b), min(r, g, b)
    if mx > 235 and mn > 200: return '*'   # 星/纸亮
    if b > 130 and b > r + 30: return '~'  # 水/夜蓝
    if g > 90 and g > r + 25 and g > b + 15: return 'G'  # 琉璃绿
    if r > 130 and r > g + 45 and r > b + 45: return 'R' # 朱
    if r > 175 and g > 160 and b < 175: return 'W'       # 白壁/石
    if r > 90 and g > 60 and b < 100 and r > b + 40: return 'B'  # 铜/木
    if r > 150 and g > 110 and b < 90: return 'Y'        # 金
    if mx < 60: return 'K'  # 暗部
    if mx > 200 and mn > 150: return 'w' # 中亮
    return '.'

def main(path, cols=88, rows=40):
    data = open(path, 'rb').read()
    i = 0
    parts = []
    while len(parts) < 4:
        while data[i:i+1].isspace(): i += 1
        j = i
        while not data[j:j+1].isspace(): j += 1
        parts.append(data[i:j]); i = j
    i += 1
    w, h = int(parts[1]), int(parts[2])
    px = data[i:]
    out = []
    for ry in range(rows):
        line = []
        for rx in range(cols):
            x0, x1 = rx * w // cols, (rx + 1) * w // cols
            y0, y1 = ry * h // rows, (ry + 1) * h // rows
            counts = {}
            for y in range(y0, max(y0 + 1, y1)):
                for x in range(x0, max(x0 + 1, x1)):
                    o = (y * w + x) * 3
                    c = classify(px[o], px[o+1], px[o+2])
                    counts[c] = counts.get(c, 0) + 1
            line.append(max(counts, key=counts.get))
        out.append(''.join(line))
    print('\n'.join(out))

if __name__ == '__main__':
    main(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 88,
         int(sys.argv[3]) if len(sys.argv) > 3 else 40)
