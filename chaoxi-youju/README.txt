潮汐邮局 · THE TIDAL POST
Original voxel diorama, 2026-10-05

一座小岛，把迟来的信留到下一次潮汐。
A little island keeping the late mail until the next tide.

作品内容
• tidal_post_hero.png: 1800 × 1800 主视图，Blender Cycles 光线追踪。
• 潮汐邮局_离线3D.html: 独立离线 3D 查看器。下载后在支持 WebGL 2 的桌面浏览器中打开；拖动旋转，滚轮/双指缩放，按钮可自动环绕或复位。无需登录或联网。
• tidal_post.glb: 通用可编辑 3D 交换文件。
• tidal_post.blend: Blender 4.3.2 场景，保留相机、材质、灯光与按部件分类的几何。
• build_scene.py: 可复现的原始建模与渲染代码。使用 Blender 后台 Python 运行。
• viewer/main.js: 查看器源代码；其依赖和版本记录在 package.json / package-lock.json。

艺术设计
珊瑚红屋顶、奶油色灯塔、青蓝海水；琥珀色灯室是主焦点。邮局门前的小路经实体支撑石阶直达木码头。包裹、邮筒、邮差和邮船构成同一条生活叙事。每一块岩石、瓦片、门窗和护栏均为实际立方体/长方体几何，没有以平面图片冒充模型。

制作与兼容性
全部场景几何由原创代码生成，无第三方模型或贴图。场景按语义部件和材质合批，以避免大量独立物件。GLB 约 10 MB。查看器将模型和 Three.js 一并嵌入 HTML，不依赖 CDN。GLB/实时查看器使用实时照明，外观与高质量光线追踪主图会有差异。
离线查看器已完成文件结构、模型嵌入及 JavaScript 打包检查；当前受限测试环境未能完成浏览器交互实测。未声称支持 macOS Quick Look。优先使用桌面版 Chrome、Edge、Firefox 或 Safari 的现代版本。

参考与来源（仅研究，未复制素材）
• MagicaVoxel 官方：https://ephtracy.github.io/
  查阅工具与体素表达背景。
• Voxelmade / MagicaVoxel gallery：https://www.voxelmade.com/magicavoxel/
  查阅夜间体素建筑的层级与暖冷对比；Lisbon by night 图像被检索，未复制模型或图像。
• Cedric Chase / Home in Voxels：https://www.cedricchase.com/art/voxel-home
  查阅作者关于空间、细部和灯光保真的制作说明。
• Blender 官方 AgX 文档：https://docs.blender.org/manual/en/5.0/render/color_management/displays_views.html
  搜索摘要可访问，正文请求受限；只采用已核实的高动态范围/高亮去饱和原则。

第三方软件
Blender 4.3.2 用于建模和渲染。Three.js 0.180.0 (MIT) 用于离线查看器；完整许可见 THREE-LICENSE.txt。esbuild 0.25.10 (MIT) 用于构建，许可见 ESBUILD-LICENSE.txt。未使用付费素材或付费服务。
