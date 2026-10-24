# 经天纬地 · 花楼提花机的体素转译

一台**会真的织**的体素花楼提花机：花本（打孔卡）上每一张的孔，就是这一纬要提起的经线；
孔亮了、经线抬起、彩梭穿过去、筘打紧、卷布轴前移——织出来的锦与花本数据**逐格一一对应**。

三本原创花本：**落花流水**（宋锦骨架）、**团花宝相**、**星图·北斗**。一匹 60 经 × 42 纬。

## 跑起来

```bash
node tools/serve.mjs            # 默认 :8945
# 浏览器打开 http://localhost:8945/index.html
```

拖动旋转 · 滚轮远近 · 点织机开/停 · 点花本带换本 · 1–5 切机位 · L 熄灯。
界面：开织/整匹快进/换花本、速度 ×½–×4、去机架 / 隐线束 / 熄灯 / 声音（首次点击才起声）。

## 复验（唯一可信口径）

```bash
node tools/accept-node.mjs       # 离线 59 条：花本真值表 / 时刻表 / 逐帧采样 / 几何实测 / 体量预算
python3 tools/accept-web.py      # 在线 18 条：真网页跑一遍（需先起 serve.mjs）
python3 tools/shoot.py --out renders   # 出图 12 张 + manifest（FPS 一并记录）
node tools/raster.mjs --out /tmp/a.png --cam cover --pattern 1 --time 30   # 离线软光栅秒级看图
node tools/patterns-report.mjs   # 花本 ASCII 打样 + 每纬彩纬段数
```

## 目录

```
index.html style.css          界面
js/spec.js                    全部旋钮：布局、配色、光照、时序、机位、梭架
js/voxel.js                   体素缓存 + 贪心合并 + 光照烘焙（AO/日光硬投影/多灯）
js/dynmesh.js                 动态件轻量几何（会转的轴、会飞的梭、会长出的布）
js/patterns.js                三个花本 + 提综表 + 期望布面（单一来源）
js/weave.js                   编织引擎（纯逻辑状态机，浏览器与离线共用）
js/pose.js                    一帧 → 每个部件的变换
js/sculpt/room.js             工坊：地面、墙、左墙窗、天井屋面、灯架、布架
js/sculpt/loom.js             织机：机架、花楼、经轴/胸梁/卷布轴、筘、提花线束、花本带、梭、晾锦架
js/main.js js/audio.js        浏览器端：three 视图、交互、合成音效
tools/                        serve / raster / accept-node / accept-web / shoot / png / patterns-report
vendor/three.module.js        three r160（第三方库）
```

## 别修回去的三处

1. **光照全烘进顶点色**（MeshBasicMaterial + 顶点色），离线软光栅器与浏览器共用同一份常数——
   离线看到什么就是交付什么。没有实时灯光、没有后期、没有阴影贴图。
2. **花本卡与提综表同源**（`cardHoles()` 一个出口）：孔位即经线的提起集合，断言锁死这一条。
3. **花本带吊在 z=-30 的花楼后段、提花线束在 y=96 折向花本**：这是避让「窗外月光通路」算出来的位置，
   挪回去会在布面上打出条状阴影。

## 已知未验

真机浏览器（Chrome/Safari/Firefox）、移动端触屏、真实 GPU 帧率（headless 软栅格下 60fps）、声音音色。