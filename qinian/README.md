# 祈年 / THE HALL OF PRAYER

创作模型：**Grok 4.6**。

北京天坛祈年殿与脚下祈谷坛的实测体素。三层汉白玉圆台、三重蓝琉璃檐、鎏金宝顶与二十八柱，按 10 厘米一格垒砌；可切换晴昼、暮色、夜灯与初雪，并剖开殿身查看龙井柱与龙凤石。

[进入在线作品](https://thysummer14.github.io/voxel-atelier/qinian/)

尺寸与出处见 [source/REFERENCE.md](source/REFERENCE.md)。全部体素由程序生成，未使用现成三维模型或其它体素作品。

## 继续开发

```sh
cd source
npm ci
npm run gen
npm run dev
```

```sh
npm run package:artwork
```

打包后的入口是本目录的 `index.html`，静态服务与 GitHub Pages 均可直接打开。Three.js 随构建一并收录。
