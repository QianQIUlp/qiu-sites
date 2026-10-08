# 千秋 · me.qiu.works

2026-09-30：首页字体改为固定版本、自托管的 WOFF2 子集，控制符号改为内联 SVG。保留现有空间构图、文案及导航；详情与再生成方法见 `src/assets/me/fonts/README.md`。本次修复以 PR 交回用户审核，不合并、不由本地验收推定发布。

2026-09-22：将用户确认的中英文空间原型接入根站 Astro。`qiu.works` 仍由 `developer/` 中的 QStudio 负责；本次不修改该应用。

2026-09-29：用户确认将 `prototypes/me-current.html` 的九宫格扩展、作品切面与自动演示、吉他性能优化实装到源码。保留原有风格，源码与构建产物不依赖原型目录。此次授权为本地实装与验收，部署和 PR 留待审阅。

## 源码

- `src/pages/index.astro` 与 `src/pages/en/index.astro`：正式首页入口。
- `src/layouts/PersonalHome.astro`：首页独立布局、双语 SEO、分享图和无 JavaScript 阅读入口。
- `src/components/me/Room.astro`、`MoreRooms.astro`、`Pedalboard.astro`：共享的双语页面与踏板标记，初始文案在构建时输出；交互文案沿用 `language.js`，无翻译库。
- `src/styles/me/`：已确认的空间、吉他、音乐及英文排版；`site.css` 是站点导航接入细节。
- `src/styles/me/fonts.css`、`icons.css`：首页专用字体及共享 SVG 尺寸；`Icon.astro` 与 `icons.js` 让初始标记和动态状态共用同一图形。
- `src/scripts/me/scene.js`：空间、纸张、画线、音色控制与循环录音。
- `src/scripts/me/boot.js`：先启动空间与操作，再动态载入三维和新增区域。
- `src/scripts/me/extra-rooms.js`、`nine-rooms.js`：莫比乌斯纸带、放下纸片、路径演奏和错位文字；状态仅留在当前访问中。
- `src/scripts/me/work-specimen.js`：按需载入的四件项目雕塑，切面展示起因、做法与边界。
- `src/scripts/me/guitar-model.js`：照片投射与几何共同构成的 Three.js 吉他。
- `src/scripts/me/guitar-surface.js`、`guitar-surface-worker.js`、`guitar-batches.js`：后台计算同一琴身曲面、合并静态五金绘制，不削减几何或贴图分辨率。
- `src/scripts/me/audio-engine.js`：原生 Web Audio 拨弦合成、过载、滤波与反馈回声。
- `src/assets/me/`：四张本地贴图及两张模型无损预览；Vite 输出带内容指纹的静态 URL，无原型目录依赖。
- `src/vendor/three/`：沿用原型的 Three.js 0.180.0，保留 MIT LICENSE。未增加 npm 依赖。

运行 `npm ci`、`npm run dev`。发布前运行 `npm run build`、`npm run preview`，检查实际构建产物。首页代码仅在首页加载，阅读页继续使用原有布局与主题。

## 路由与交互

中文 `/`、英文 `/en/`，两种语言都保留姓名「千秋」。九宫格的上排为 `#paths`、`#trace`、`#blindspot`，中排为 `#papers`、`#home`、`#music`，下排为 `#rethink`、`#idle`、`#work`；`#overview` 查看全貌。地图、空间入口、拖动和键盘都可导航。语言切换保留位置，但整页导航清空临时录音、纸张位置及线条。散页和新增区域的文章来源指向中文原文；「所有文章 / 项目档案」进入对应语言的现有列表。

入口吉他随鼠标轻转，点击打开近看。近看支持拖动、缩放、方向键、细节位置、空格复位和 Esc 返回。闲置与离屏时不持续渲染；减少动态偏好与手动关闭动态均停止跟随和缓动。WebGL 无法初始化时，首页保留同模型预览，近看保留参考照片。

「另一面」让一条连续纸带承载判断的修正；「盲点」保留中文造型「确定」，英文旁注解释其含义，转动后显示真实文章中留下的自我纠正。「未走之路」可改变线束与路线，只有主动点击聆听才启用声音；「不赶时间」可拖动或点击放下四个「应该」，并随时恢复。

「拆开看看」用四种象征性雕塑承载 VeriSilo、MealCircuit、Crewlight 和 Hadoop Lab 的真实问题、做法与边界，不宣称物理硬件模型。首次进入和每次选择作品，自动播放一次 13.4 秒完整展示；可暂停、继续、重播。手动拖动切面或选择阶段会接管演示，离开暂停，已播放后普通返回不会重新开始。关闭动态时保留切面展示，取消镜头环绕。

音乐区支持六根弦、A S D F G H、空格扫弦及 Open / Em / G / C / D。九个旋钮支持竖直拖动、滚轮、方向键、Shift 精调及双击复位。三个踏板均可旁通，四个预设提供起点。

初始静音，主动弹奏或打开声音后才启动音频，不请求麦克风。6 秒循环记录音高与力度，可叠录；所有层共用当前效果器，并非独立音轨。后台暂停录音和循环、静音输出，返回后不会自动恢复循环。刷新后不保留录音。

## 素材与表达边界

琴型为用户确认的 **BanG Dream! POTBELLY FM Rāna**，琴头是 BanG Dream! 标识。琴颈拾音器 SH-1n 带银色罩；琴桥 SH-16 开放式反斑马，奶油色线圈朝琴颈、黑色朝琴桥。

| 资产 | 来源与用途 |
| --- | --- |
| `qiu-potbelly-stringless.png` → `.webp` | 用户实拍的去弦派生图，1064 × 1478，运行时用于拾音器及五金细节 |
| `qiu-potbelly-bare-body.png` → `.webp` | 同一实拍移除弦和五金的派生图，1064 × 1478，运行时用作琴身底材 |
| `bangdream-potbelly-stringless.png` → `.webp` | 官方正面参考的去弦派生图，1254 × 1254，运行时用于指板及琴头弦路径 |
| `bangdream-potbelly-fm-rana.png` → `.webp` | ESP 官方正面参考，2400 × 2400，运行时用于琴头标记、加载回退和 WebGL 回退 |
| `rana-home.webp` | Rāna 官方实拍缩至 1600 × 1600 的透明 WebP；首页吉他本体（2026-10-08 起取代三维中性帧 `guitar-home.webp`） |
| `jam-strings.webp` | 同一张实拍的琴身特写（拾音器、琴桥、六根弦），旋转为横向，860 × 620；琴弦之间的可弹奏琴弦 |
| `work-home.webp` | 已确认的 VeriSilo 雕塑中性帧，1191 × 636，无损透明 WebP；展区载入时显示 |

PNG 保留为贴图源文件；首页和 Three.js 运行时加载同尺寸的高质量 WebP（quality 95）。四张贴图总量从 4.95 MB 降至 1.05 MB，约减少 79%。

入口预览约 194 KB，优先加载；三张模型专用贴图以低优先级提前请求，官方参考图直接复用页面图片，避免重复传输。曲面通过 Vite 打包的 Worker 计算，Worker 不可用时按批让出主线程；静态几何按材质合并，贴图尺寸、顶点、法线与 UV 保持原型。作品三维代码在展区可见时才加载，离屏停止渲染。原型的本机性能对照保留为研发证据，不能当作访客网络下的速度承诺。

官方来源：[型号页](https://espguitars.co.jp/collaborate/33185/)、[正面图片](https://espguitars.co.jp/wp-content/uploads/2023/11/BanGDream_POTBELLY_FM_Rana_front.png)。官方图片与品牌标识属于各自权利人，不适用仓库代码的 MIT 授权。

原型阶段使用 imagegen 去除实拍中的弦和五金，再以独立几何重建，避免把弦和开关烙在漆面上。本次直接复用已确认贴图。被遮挡木纹是补绘，背面与侧面材质是近似重建，模型不是实物扫描；未找到可核实的匹配官方背面图片，因此没有开放完整 360° 旋转。

音色是拨弦合成与经典踏板灵感，并非实琴采样或原机电路仿真。BD-2 的外观参考 [BOSS 产品页](https://www.boss.info/us/products/bd-2/)。原型音频检查已覆盖输出、旁通、静音、最大增益、回声尾音和九个旋钮；接入时沿用音频算法，仅调整模块路径。

## 发布边界

Astro `site`、canonical、语言 alternate、robots 与 sitemap 指向 `https://me.qiu.works`。这次只是源码接入，**未发布、未绑定 Cloudflare 域名**。

发布时将 `me.qiu.works` 绑定到根站 Pages 项目，确认 TLS 与中英文路径；保留旧 `room.qiu.works` 可访问或配置保留路径/查询参数的跳转，避免 QStudio 和外部旧链接失效。主站 QStudio 当前分支的未推送修改不包含在本次个人站分支中。
