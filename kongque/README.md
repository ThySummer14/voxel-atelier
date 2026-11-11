# 孔雀开屏 · PEACOCK DISPLAY

> 体素工坊 · 第 29 件 · 题材「生灵」 · 标注模型 **Qwen4-Max-Preview** · 2026.11
> 参考物：真实蓝孔雀（*Pavo cristatus*）雄鸟开屏。**未参考任何体素作品**；造型与配色取自真实照片与解剖观察（见 `design.md` 与 `reference/`）。

一只正在开屏的蓝孔雀：透空蕾丝状的放射尾屏、158 枚带同心环带的眼斑、虹彩钴蓝的颈胸、金绿鳞状披肩、黑白虫蠹斑的折叠翼，立在暮色里的一块苔石草丘上。尾屏不是实心圆盘——细羽轴 + 人字羽枝 + 末端眼斑，背景可透过羽屏，忠实于真实开屏照片。

## 实时查看

```bash
# 在仓库根目录
python3 -m http.server 8899
# 打开 http://localhost:8899/kongque/
```

不要以 `file://` 打开（ES modules + fetch 需要 HTTP）。three.js 已本地 vendored 于 `vendor/`，无 CDN 依赖。

- 拖拽环视 · 滚轮推拉 · **点击羽屏聚焦眼斑**
- 视角预设：正面 / 三四侧 / 侧面 / 俯视 / 眼斑特写
- 演绎开关：自动环游 / 虹彩 / 落英 / 辉光
- 虹彩为视角相关薄膜近似：眼斑与颈胸随视角在 蓝↔绿↔金 间流转；羽屏微摆呼吸、冠羽轻颤、落英飘落

## 体量

| 项 | 值 |
|---|---|
| 网格 | 460 × 300 × 220（体素 ≈ 0.5 cm） |
| 可见（表面）体素 | 308,805 |
| 实心体素 | 547,023 |
| 眼斑羽 | 158（5 行同心弧 + 填充羽） |
| 调色板 | 46 色 / 3 材质（虹彩 / 金属 / 哑光） |
| 包围盒 | 449 × 285 × 175 |

## 导出

- `export/peacock.vox` — MagicaVoxel（z-up；因单模型坐标上限 255，按 256 分块为 4 个模型 + 场景图变换）
- `export/peacock.schem` — Minecraft Sponge schematic v2（gzip NBT，449×285×175，25 种方块）。可用 WorldEdit `//schem load` 或 Litematica 载入，在 Fabric 服务器直接建造。
- `export/full.npz` — 完整实心体素（位置 + 调色板索引），供再加工。

## 复现

```bash
cd source
python3 generate.py   # 生成 js/voxels.bin / palette.json / stats.json / export/full.npz
python3 render.py iso 3            # 软件预览（可选）
python3 export.py     # 导出 .vox / .schem 并读回校验
python3 cover.py      # 干净静帧 + 展厅封面（需本地 HTTP + playwright）
python3 accept.py     # 验收自检
```

## 目录

```
kongque/
├── index.html            # 入口（importmap 指向本地 vendor）
├── assets/style.css      # HUD 样式
├── js/main.js            # 实例化渲染 + 虹彩 shader + 光照 + 动画 + 交互
├── js/voxels.bin         # 表面体素（位置/调色板/AO/材质/种子）
├── js/palette.json       # 46 色 + 材质 + 自发光
├── js/stats.json         # 体量统计
├── vendor/               # three.js 0.160 本地 vendored（core + jsm）
├── source/               # generate / render / export / cover / shot / accept
├── export/               # .vox / .schem / full.npz / export_info.json
├── renders/              # 干净静帧与预览
├── reference/            # 真实孔雀参考照片（仅本地研究用，不入库）
├── design.md             # 设计文档 + 迭代记录
└── DELIVERY.md           # 交付报告 + 验收清单
```