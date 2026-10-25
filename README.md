# 体素工坊 · VOXEL ATELIER

> 2026 年秋季的 24 件体素作品合集。山水、楼阁、机械与时间，同一个命题，不同模型的答卷。

- **在线展厅**：<https://thysummer14.github.io/voxel-atelier/>
- **仓库**：<https://github.com/ThySummer14/voxel-atelier>

除《上元灯市》为 CPU 光线投射静帧外，其余作品均为实时 WebGL 页面，可拖拽、滚轮、点击。建议使用桌面浏览器观看。

## 收录

| # | 目录 | 作品 | 题材 | 标注模型 | 原目录 |
|---:|---|---|---|---|---|
| 01 | `qinglv-qianli/` | 青绿千里 | 山水 | Qwen 3.8 Max | `青绿千里-qwen3.8 max` |
| 02 | `chaoxi-shengshan/` | 潮汐之山 | 建筑 | Kimi K3.1 Pro | `潮汐圣山-kimi k3.1pro` |
| 03 | `jixin/` | 机心 | 机械 | Qwen 3.8 Flash | `机心-qwen 3.8 flash` |
| 04 | `baike-zhoutian/` | 百刻周天 | 机械 | GLM 5.3 | `百刻周天-glm5.3` |
| 05 | `liuli-futu/` | 琉璃浮屠 | 建筑 | Qwen 3.8 Flash | `琉璃浮屠-qwen 3.8 flash` |
| 06 | `jingtian-weidi/` | 经天纬地 | 机械 | DeepSeek V4.1 Flash | `经天纬地-deepseek v4.1 flash` |
| 07 | `houfeng/` | 候风 | 机械 | LongCat 2.5 Pre | `候风-longcat 2.5 pre` |
| 08 | `jiye-liuhuo/` | 极夜流火 | 机械 | Gemini 3.8 Flash | `极夜流火- Gemini 3.8 flash` |
| 09 | `shanghe-hongqiao/` | 上河虹桥 | 山水 | 未标注 | `上河虹桥` |
| 10 | `yunhai-zhixing/` | 云海织星 | 奇想 | DeepSeek V4.1 Flash | `云海织星- DeepSeek v4.1 flash 1017` |
| 11 | `fukong-qianji-shuyuan/` | 浮空千机书院 | 建筑 | Gemini 4 Argon | `浮空千机书院- Gemini 4 Argon` |
| 12 | `chaoxi-youju/` | 潮汐邮局 | 建筑 | Dot | `潮汐邮局-dot` |
| 13 | `yehang-qundao/` | 夜航群岛 | 奇想 | Dot | `夜航群岛世界-dot` |
| 14 | `fudao-chating/` | 浮岛茶庭 | 建筑 | 未标注 | `浮岛茶庭7:10` |
| 15 | `fuyu-dengliao/` | 浮屿灯寮 | 山水 | 未标注 | `浮屿灯寮3:10` |
| 16 | `canghai-longgong/` | 沧海龙宫 | 建筑 | 未标注 | `沧海龙宫` |
| 17 | `shenyin-tianque/` | 神隐天阙 | 建筑 | 未标注 | `神隐天阙` |
| 18 | `beiming-zaishan/` | 北冥载山 | 奇想 | 未标注 | `北冥载山6:10` |
| 19 | `shaiqiu/` | 晒秋 | 山水 | 未标注 | `晒秋` |
| 20 | `wanzhao-yantian/` | 晚照盐田 | 山水 | 未标注 | `晚照盐田` |
| 21 | `changfeng-mailang/` | 长风麦浪 | 山水 | Space Bunny Alpha | `长风麦浪` |
| 22 | `jingluo-youju/` | 鲸落邮局 | 奇想 | 未标注 | `鲸落邮局6:10` |
| 23 | `shangyuan-dengshi/` | 上元灯市 | 静帧 | 未标注 | `上元灯市` |
| 24 | `chaosheng/` | 潮生 | 建筑 | GPT-6.1 sol | `体素测试 / 潮生` |

编号为展厅动线，不代表创作次序。模型名取自作品目录或交付文档；没有可靠记录的早期作品统一显示「模型未标注」。

## 目录结构

```text
.
├── index.html                 # 展厅首页
├── assets/
│   ├── css/gallery.css
│   ├── js/works.js            # 作品元数据（新增作品只改这里）
│   ├── js/gallery.js          # 渲染、筛选、深链
│   └── covers/                # 统一封面：1600×1000 与 800×500
├── <slug>/                    # 每件作品一个自包含目录
│   └── index.html             # 入口（个别作品另有中文名入口包装）
├── .nojekyll                  # GitHub Pages 原样发布，不经 Jekyll
├── .gitignore
└── README.md
```

每件作品内部保留自己的 `js/`、`assets/`、`vendors`、`renders/`、`design.md`、交付报告与验收脚本。绝大多数作品已把 three.js 本地 vendored，不依赖 CDN；只有极少数历史文件里还留有外部引用，但运行路径均为本地资源。

## 本地预览

```bash
cd 体素
python3 -m http.server 8899
# 打开 http://localhost:8899/
```

不要直接用 `file://` 打开：作品使用 ES modules 与 `fetch`，需要 HTTP 环境。

## 新增一件作品

1. 新建 ASCII slug 目录（如 `my-work/`），把作品放进去，入口命名为 `index.html`。如果入口必须保留中文文件名，再加一个轻量重定向 `index.html`（可参考 `yehang-qundao/`）。
2. 生成两张封面，存入 `assets/covers/`：
   - `my-work.jpg`：1600×1000
   - `my-work@800.jpg`：800×500
3. 在 `assets/js/works.js` 末尾增加一条记录：

```js
{
  slug: "my-work",
  title: "作品名",
  en: "WORK NAME",
  cat: "山水",              // 山水 / 建筑 / 机械 / 奇想 / 静帧
  model: "模型名",           // 不知道就留空
  date: "2026.10",
  accent: "#3d6a45",        // 卡片小色块
  desc: "一句话介绍。"
}
```

4. 本地打开首页与作品页，确认 console 无报错、资源无 404。
5. 提交并推送到 `main`。GitHub Pages 会自动发布，无需构建步骤。

## 发布

- GitHub Pages：`main` 分支根目录，静态发布。
- 根目录必须保留 `.nojekyll`，否则带下划线或特殊字符的资源可能被 Jekyll 忽略。
- Git 单文件上限 100MB；`node_modules/`、嵌套 `.git/`、`__pycache__/`、`.playwright-cli/`、`.claude/` 已在 `.gitignore` 中排除。
- 大体积历史渲染图与 `.blend` 源文件按原样收录，便于回溯；如仓库继续膨胀，再考虑 Git LFS。

## 说明

- 2026-10 整理进本仓库时，23 个中文目录改为拼音 slug，展示标题与模型信息统一收进 `assets/js/works.js`。
- 《云海织星》原有的独立仓库 `astral-loom` 仍保留在其 GitHub 历史中；本仓库只收录作品文件，不包含嵌套 `.git`。
- 作品与代码版权归各自作者所有；仓库未附统一开源许可，复用前请先联系作者。
