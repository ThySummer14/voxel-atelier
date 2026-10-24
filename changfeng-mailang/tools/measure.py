#!/usr/bin/env python3
"""出图后的客观体检：亮度分布、饱和度、天空色相、裁切、对比度。
我是没有图像能力的模型，所以靠这些数字判断画面是否成立。"""
import sys
import numpy as np
from PIL import Image

path = sys.argv[1]
im = Image.open(path).convert('RGB')
a = np.asarray(im).astype(np.float32) / 255.0
h, w, _ = a.shape
lum = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
mx = a.max(axis=2)
mn = a.min(axis=2)
sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)

def band(y0, y1, label):
    sl = slice(int(h * y0), int(h * y1))
    L, S = lum[sl], sat[sl]
    r, g, b = a[sl, :, 0].mean(), a[sl, :, 1].mean(), a[sl, :, 2].mean()
    print(f'{label:>10}  L均值={L.mean():.3f}  饱和={S.mean():.3f}  RGB=({r:.3f},{g:.3f},{b:.3f})  '
          f'过曝L>0.95={(L>0.95).mean()*100:.2f}%  死黑L<0.06={(L<0.06).mean()*100:.2f}%')

print(f'== {path}  {w}x{h} ==')
print(f'整体 L={lum.mean():.3f}  饱和={sat.mean():.3f}  '
      f'对比度(std)={lum.std():.3f}  '
      f'高光>0.95={(lum>0.95).mean()*100:.2f}%  暗部<0.08={(lum<0.08).mean()*100:.2f}%')
band(0, 1 / 3, '上1/3')
band(1 / 3, 2 / 3, '中1/3')
band(2 / 3, 1, '下1/3')

# 直方图：中间调是否断层
hist, _ = np.histogram(lum, bins=10, range=(0, 1))
print('直方图(0→1, 各桶%):', ' '.join(f'{v*100/h*w:.1f}' for v in hist))
mid = (hist[3:7].sum() / lum.size) * 100
print(f'中间调(0.3-0.7)占比 = {mid:.1f}%')

# 地平线：逐行均值，找亮度突变最大的行
row = lum.mean(axis=1)
d = np.abs(np.diff(row))
k = int(np.argmax(d[5:h - 5])) + 5
print(f'地平线候选 y={k} ({k/h*100:.1f}%)  行跳变={d[k]:.4f}  上方L={row[max(0,k-8):k].mean():.3f} 下方L={row[k:k+8].mean():.3f}')

# 天空带颜色（画面上部）
sky = a[0:int(h * 0.18)]
print(f'天空带 RGB=({sky[...,0].mean():.3f},{sky[...,1].mean():.3f},{sky[...,2].mean():.3f})  '
      f'饱和={sat[0:int(h*0.18)].mean():.3f}  B-R={sky[...,2].mean()-sky[...,0].mean():+.3f}')

# 四个象限亮度（检查左右/上下是否失衡）
q = [lum[:h//2, :w//2].mean(), lum[:h//2, w//2:].mean(), lum[h//2:, :w//2].mean(), lum[h//2:, w//2:].mean()]
print(f'四象限 L: 左上={q[0]:.3f} 右上={q[1]:.3f} 左下={q[2]:.3f} 右下={q[3]:.3f}  左右差={(q[0]+q[2])-(q[1]+q[3]):+.3f}')

# 唯一色数（判断是否有断层/色带）
flat = (a.reshape(-1, 3) * 255).astype(np.uint8)
uniq = len(np.unique(flat[::7], axis=0))
print(f'抽采样唯一色数 = {uniq}')
# —— 地标取样：画面里该有的东西有没有、颜色对不对（按 tools/framing.mjs 算出的屏幕坐标）——
regions = {
    '风车区': (0.47, 0.06, 0.70, 0.47),
    '农舍区': (0.14, 0.41, 0.31, 0.64),
    '小桥区': (0.32, 0.84, 0.39, 0.91),
    '太阳区': (0.235, 0.05, 0.29, 0.12),
    '麦田区': (0.40, 0.55, 0.62, 0.78),
    '近景麦田': (0.35, 0.80, 0.65, 0.97),
    '天空上部': (0.05, 0.02, 0.95, 0.18),
}
# 地平线上方一条窄带：黄昏的暖色应该出现在这里
band = a[int(h*0.295):int(h*0.325)]
print(f'地平线上暖带 RGB=({band[...,0].mean():.3f},{band[...,1].mean():.3f},{band[...,2].mean():.3f})  R-B={band[...,0].mean()-band[...,2].mean():+.3f}')

print('--- 地标取样 ---')
for k, (x0, y0, x1, y1) in regions.items():
    s = a[int(h*y0):int(h*y1), int(w*x0):int(w*x1)]
    L = 0.2126*s[...,0] + 0.7152*s[...,1] + 0.0722*s[...,2]
    print(f'{k:>6} L={L.mean():.3f}  RGB=({s[...,0].mean():.3f},{s[...,1].mean():.3f},{s[...,2].mean():.3f})  '
          f'最亮={L.max():.2f}  唯一色={len(np.unique((s.reshape(-1,3)*255).astype(np.uint8),axis=0))}')

print('--- 逐行亮度剖面（每 6%）---')
print(' '.join(f'{y*100:.0f}%:{lum[int(h*y)-2:int(h*y)+2].mean():.2f}' for y in np.arange(0.02, 1.0, 0.06)))
