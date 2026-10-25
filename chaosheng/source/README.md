# 潮生 / TIDEBORN

一座原创、可交互的体素海岛。四层山城沿着岩壁通向灯塔，石桥连接磨坊，四艘船停靠在海湾里。所有建筑与道具均由代码逐块构筑，没有使用现成的三维模型或图片贴图。

创作模型：**GPT-6.1 sol**。

## 体验

直接双击 `output/潮生-TIDEBORN.html`，即可离线体验完整作品，无需安装或启动服务器。该文件包含所有代码、样式和模型下载。下面的命令用于继续开发。

```sh
npm install
npm run dev
```

打开终端显示的 Local 地址。拖动旋转，滚轮缩放，右键拖动平移；手机支持单指旋转、双指缩放和平移。底部有五个镜头，光点可以打开地标故事，右上角可以切换晨光、日落和入夜。音景需要点击开启。

按 `1`—`5` 切换镜头，`R` 返回全景，`M` 切换光照，`Esc` 收起手记或故事。系统开启减少动态时，环境动画静止、镜头立即切换。

“保存画面”会重新渲染宽度为 3200 px 的 PNG，不包含界面。作品手记中的下载链接提供 `public/潮生-TIDEBORN.vox`，可在 MagicaVoxel 中继续编辑。

## 作品文件

- `src/world.js`：可复现的场景定义，固定 seed `270819`。19,385 个独立方块，19 座建筑、4 艘船、18 棵树、11 位居民和 9 只海鸥。
- `src/main.js`：Three.js 实时渲染、正交镜头、分层海水、光照、阴影、环境遮蔽、辉光、动画和 PNG 导出。
- `src/ambience.js`：通过 Web Audio 合成海浪、风和远处海鸥的可选音景。
- `public/潮生-TIDEBORN.vox`：整座岛的静态体素文件，包含海水底座。0.4 世界单位采样，239 × 199 × 124；保留主要颜色，其余颜色映射到 MagicaVoxel 的 255 色调色板。动态、光照和文字招牌效果保留在交互版本中。

## 构建与验证

```sh
npm run export:vox
npm run check
npm run build
npm run package:artwork
npm run preview
```

`check` 验证场景可复现、几何数据有效、动画引用完整，以及导出文件的 chunk、体素坐标、唯一性和调色板。需要支持 WebGL 2 的浏览器。场景会在持续帧率不足时自动降低像素密度并关闭环境遮蔽，保留模型和交互。

`scripts/browser-qa.mjs` 可交给 `playwright-cli run-code --filename` 执行，实际验证镜头、光照、拖动、缩放、环游、全屏、音景、文件下载、手机布局与减少动态设置。检查产物保存在 `output/`。

本项目使用 Three.js 和 Vite。`package-lock.json` 固定依赖，`dist/` 是本地生产构建。
