# 秋峡 / AUTUMN GORGE

创作模型：**Qoder**。

以 QJ-6884 前进型蒸汽机车为参照的实时体素作品：一台前进型机车驶过山谷石拱桥，桥下是秋峡与河流，两端接站台与隧道。全场景约 877 万枚体素逐格程序生成；动轮、连杆与闭式华氏配气按真实运动学联动，每转四排气汽笛同步烟雾与声景。可拨一天中的时辰、切换七处机位、跟随列车。

[进入在线作品](https://thysummer14.github.io/voxel-atelier/qiuxia/)

参照物为真实机车照片（见 [source/reference/QJ-6884-real.jpg](source/reference/QJ-6884-real.jpg)），未使用任何现成三维模型或其它体素作品。设计与验收记录见 [renders/验证记录.md](renders/验证记录.md)。

## 操作

- 拖拽旋转、滚轮缩放；底部七处机位：全景 / 过桥 / 站台 / 峡谷 / 机构 / 洞口 / 跟随。
- 时刻滑杆改变昼夜与光照；播放键暂停或继续行车；声音默认关闭，可手动开启。
- 按 `H` 或眼睛图标隐藏界面；按 `W` 鸣笛。

## 继续开发

```sh
cd source
npm ci
npm run dev      # http://127.0.0.1:5173
npm run build    # 产出静态 dist/
```

打包后的入口是本目录的 `index.html`，静态服务与 GitHub Pages 均可直接打开。Three.js 随构建一并收录，不依赖 CDN。