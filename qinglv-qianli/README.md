# 青绿千里

《千里江山图》体素长卷互动作品。原生 HTML/CSS/JavaScript + Three.js r160，无构建步骤、无远程运行时依赖；全部 Three.js 模块已放在 `assets/`。

## 运行

```bash
node .serve.cjs
```

打开 <http://127.0.0.1:8912/index.html>。

## 主要能力

- 七章三远分镜：展卷、序曲、高远、深远、长桥、入画、渔火。
- 自右向左的全卷展卷，卷内读数覆盖 `0–1191.5 cm`。
- 三矾九染式重新显形（赭石打底 → 汁绿罩染 → 石青压顶，实测三段色相 27.5° → 103.7° → 128.5°）与绢本“读画”模式。
- 时辰、夜航渔火与水面倒影、显式环视、存影和响应式触控布局。
- 远峰岛链、可转水轮、飞鸟、鹤、人物、牲畜、船只、桥亭、寺观和村舍。
- Web Worker 后台体素构建（约 1.7 s）；无 Worker 环境自动退回主线程构建。
- 高远峰值、桥墩、寺观、村落围墙、全卷相机路径、**shader 注入是否命中**等关键不变量均有自动测试。

URL 参数 `?quality=high|balanced|eco` 可强制画质档位，方便验收与排查。

## 验收

安装依赖：无。运行期和 Node 测试均为零第三方依赖；浏览器验收需要本机已有 Python Playwright。

```bash
npm test
node tools/accept-node.mjs
node tools/measure.mjs
python3 tools/serve-and-accept.py
```

常用截图：

```bash
# 一次起一个浏览器出全部 13 张成片（含 JSON manifest），约 30 秒
python3 tools/shoot-all.py --out renders
python3 tools/shoot-all.py --out output/tmp --shot ch2,ch5     # 只出其中几张
python3 tools/shoot-all.py --out output/tmp --inline '[{"name":"t1","cam":[200,12,150,90,14,55,42],"time":0.6}]'

# 单张：带 FPS 量测与最低帧率断言
python3 tools/shot.py output/acceptance/ch3.png \
  --w 1600 --h 1000 --chapter 2 --still --stats --manifest --measure --min-fps 50
```

工具失败会返回非零退出码。浏览器验收会检查控制台、真实 WebGL renderer、shader 注入是否命中、
染色三阶段的色相推进、全卷路径、键盘焦点隔离和主要交互。

## 运行时探针（`window.QL`）

| 探针 | 用途 |
|---|---|
| `QL.shaderProbe()` | 每处 `onBeforeCompile` 注入是否真的命中了替换目标。染错色失效不报错、不掉帧，只有这条能拦住 |
| `QL.pick(x, y)` | 屏幕像素反查：命中的分组名、世界坐标、顶点色。用来回答「这块白到底是什么」 |
| `QL.probe()` | 当前画面平均 RGB、饱和像素圆均值色相、饱和度 |
| `QL.scrollPath(n)` | 全卷相机路径；两端读数取自页面真实文本，并探测地形遮挡与穿模（跑完自动还原机位） |
| `QL.hide(name, on)` | 单独关掉 sky / water / matte / cloud / fall / spray / mist / far / emit* 任一组 |
| `QL.stats` | draw calls、体素/面/三角、画质档、构建耗时、heap |

## 画质档位

- `high`：最高设备像素比、1.5× 后期分辨率、2× MSAA、Bloom。
- `balanced`：1× 后期分辨率，不使用 MSAA，保留 Bloom。
- `eco`：1.2 上限 DPR、0.8× 后期分辨率，关闭 Bloom、飞沫和次要雾层。

档位先按设备能力选择；高性能档连续低帧时会单向降级，避免来回抖动。`prefers-reduced-motion` 下会取消自动运镜、缩短染色并降低水轮和生灵运动。

## 浏览器与发布

目标基线是支持 WebGL2、ES Modules、import maps 和现代 CSS 的浏览器。页面支持硬件加速检测、WebGL context lost 提示、响应式布局、键盘焦点和 ARIA 状态。

`manifest.webmanifest`、`favicon.svg` 与 `sw.js` 用于正式静态部署。Service Worker 只在非 localhost 环境注册；开发时不会缓存旧模块。

## 目录

```text
index.html                 页面与展签 UI
css/style.css              响应式、焦点与 reduced-motion
js/main.js                 渲染、状态、画质、交互与验收探针
js/build-worker.js         后台体素构建
js/palette.js              青绿材质与程序纹理
js/sculpt/                 总谱、地形、建筑、生灵、云水与装配
js/voxel/                  稀疏体素、面剔除、AO 与粗块网格
tools/                     测试、量测、截图、批量出图与本地验收
design.md                  设计契约与偏离记录
交付报告.md                 实测结果与未验边界
```

## 已知边界

- 本机自动化覆盖 Chromium + Apple Metal；Safari、iOS Safari、Android Chrome 和真实低端设备仍需真机矩阵验证。
- 人物是带姿态的静态体素；飞鸟、鹤、水轮与水面持续运动。
- 色彩值、皴法与器物数量属于作品设定，不是文物测绘复原。
