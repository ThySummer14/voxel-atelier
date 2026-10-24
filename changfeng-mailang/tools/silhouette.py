#!/usr/bin/env python3
"""白模剪影分析：确认画面里几何体到底占了哪些地方。
用地标屏幕坐标验证「该看见的有没有被挡住」，并找出真正的地平线（几何轮廓）。"""
import sys
import numpy as np
from PIL import Image

a = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(np.float32) / 255.0
h, w, _ = a.shape
lum = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
geo = lum > 0.5                      # 几何 = 亮
print(f'几何覆盖率 = {geo.mean() * 100:.1f}%')

# 真正的地平线：逐列找「从下往上第一个非几何像素」的高度
top = []
for x in range(0, w, 8):
    col = geo[:, x:x + 8].any(axis=1)
    idx = np.argmax(col)                # 从上往下第一个 True = 几何顶边
    top.append(idx if col.any() else h)
top = np.array(top, dtype=float)
print(f'几何轮廓顶边：最低 y={np.percentile(top, 5):.0f} 中位 y={np.median(top):.0f} 最高 y={np.percentile(top, 95):.0f}')
print(f'  → 轮廓中位在画面 {np.median(top)/h*100:.1f}% 处（中位数即远处地平线）')
for frac in (0.1, 0.25, 0.5, 0.75, 0.9):
    x0, x1 = int(w * (frac - 0.06)), int(w * (frac + 0.06))
    print(f'  x={frac*100:.0f}% 附近轮廓 y={top[int(frac*len(top))]:.0f}')

# 地标框：几何占比 + 是否被前景挡住
regions = {
    '风车(帆顶)': (0.56, 0.04, 0.63, 0.28),
    '风车(塔身)': (0.56, 0.28, 0.63, 0.45),
    '农舍': (0.14, 0.40, 0.32, 0.66),
    '小桥': (0.31, 0.83, 0.40, 0.92),
    '谷仓': (0.72, 0.34, 0.80, 0.44),
    '麦田中景': (0.40, 0.55, 0.62, 0.78),
    '近景麦田': (0.30, 0.80, 0.70, 0.98),
    '天空上部': (0.05, 0.02, 0.95, 0.14),
}
print('--- 地标几何占比 ---')
for k, (x0, y0, x1, y1) in regions.items():
    r = geo[int(h*y0):int(h*y1), int(w*x0):int(w*x1)]
    print(f'{k:>10} 几何={r.mean()*100:5.1f}%  期望={"低(应为天空)" if "天空" in k else "高"}')

# 找出画面里「悬空的几何」：某一整行几乎全空，但上方有几何、下方有几何
rows = geo.mean(axis=1)
gaps = [y for y in range(4, h - 4) if rows[y] < 0.02 and rows[y-4] > 0.5 and rows[y+4] > 0.5]
print(f'疑似悬空断裂行: {gaps[:12]}')

# ID 模式：按颜色找物体包围盒
rgb = (a * 255).astype(int)
for name, target, tol in [
    ('风车叶片', (255, 255, 255), 12),
    ('溪水', (47, 107, 255), 40),
    ('窗玻璃', (255, 47, 47), 60),
]:
    m = (np.abs(rgb - np.array(target)).max(axis=2) < tol)
    n = m.sum()
    if n < 40:
        print(f'{name}: 未检出')
        continue
    ys, xs = np.where(m)
    print(f'{name}: {n}px  x={xs.min()/w*100:.1f}%~{xs.max()/w*100:.1f}%  y={ys.min()/h*100:.1f}%~{ys.max()/h*100:.1f}%')