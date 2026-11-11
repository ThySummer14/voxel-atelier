# 交付报告 · 孔雀开屏（PEACOCK DISPLAY）

- 作品：体素工坊第 29 件 · 题材「生灵」（合集新增类目）
- 标注模型：**Qwen4-Max-Preview**
- 日期：2026-11-11
- 参考物：真实蓝孔雀 *Pavo cristatus* 雄鸟开屏（真实照片/解剖，**未参考任何体素作品**）
- 入口：`kongque/index.html`（实时 WebGL，three.js 0.160 本地 vendored，无 CDN）

## 交付内容

1. **实时查看器**：InstancedMesh 三组（身体+地面/尾屏/冠羽）；每实例 AO/材质/种子/自发光属性；onBeforeCompile 注入视角相关虹彩（蓝↔绿↔金，无品红偏色）与按材质分区 roughness/metalness；半球+暖主光(2048 阴影)+冷补+轮廓光、PMREM 环境、暮色天幕、FogExp2、UnrealBloom；OrbitControls + 5 视角预设 + 点击聚焦眼斑 + 4 演绎开关；羽屏微摆/冠羽轻颤/落英粒子；`prefers-reduced-motion` 降级。
2. **程序化生成器** `source/generate.py`：身体 SDF + 尾屏羽毛光栅化（辐射羽轴/人字羽枝/同心环眼斑/5 行同心弧+填充羽）+ 苔石草丘底座；输出表面体素二进制 + 调色板 + 统计 + 完整实心 npz。
3. **导出**：`export/peacock.vox`（MagicaVoxel，4 分块+场景图，547,023 体素）；`export/peacock.schem`（Sponge v2 gzip NBT，449×285×175，25 方块，可供 WorldEdit/Litematica 在 Fabric 建造）。
4. **静帧与封面**：`renders/clean_*.png`（5 视角干净静帧）；`assets/covers/kongque.jpg`(1600×1000) 与 `kongque@800.jpg`(800×500)。
5. **展厅集成**：`assets/js/works.js` 新增记录；`gallery.js` categoryOrder 加「生灵」；根 `index.html` 与 `README.md` 计数/文案/跑马灯更新为 29 件 / 15 模型 / 6 题材。
6. **文档**：`design.md`（参考来源/造型/调色板/迭代记录）、`README.md`（运行/交互/导出/复现）、本报告、`source/accept.py` 验收脚本。

## 体量

表面 308,805 · 实心 547,023 · 调色板 46 · 眼斑羽 158 · 网格 460×300×220 · 包围盒 449×285×175。

## 验收结果

- `source/accept.py`：**32/32 PASS**（文件齐备、无外部 CDN、体素二进制与统计自洽、调色板字段、.vox 分块体素和==实心数、.schem NBT 读回尺寸/调色板/BlockData 自洽、封面尺寸、展厅集成）。
- 浏览器（playwright headless chromium，`--use-angle=metal`）：作品页与展厅首页 **console 无 error、无 404/failed request**；5 视角截图正常；首页「生灵」筛选 chip=1、kongque 卡片在、stat-works=29。
- 迭代：5 轮"渲染→观察→修正"（见 design.md §5），修正了实心盘失真、平面尾屏、煎蛋眼斑、串珠网、薄荷绿地面、品红虹彩、高光溢出领环等问题。

## 复现命令

```bash
cd kongque/source
python3 generate && python3 export && python3 accept
# 需本地 HTTP + playwright 时：
python3 cover && python3 shot
```

## 已知限制

- 尾屏为透空蕾丝（忠实真实），非实心盘；低角度侧视时羽屏呈薄壳。
- `.vox` 因格式单模型坐标上限 255 采用 4 分块+场景图；MagicaVoxel 打开为组合场景。
- 参考照片仅本地研究（`reference/`，已 gitignore），不随仓库分发。