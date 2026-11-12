# 个人主页

闫家锋的个人主页。它既是简历的补充材料（论文、仓库、证书都能点开），也是一个独立的空间，而不是一份放大版的简历。

**在线访问**: [https://jiafeng-yan.github.io/portfolio/](https://jiafeng-yan.github.io/portfolio/)

## 技术栈

| 层 | 方案 |
|---|---|
| 站点框架 | Astro 6（`output: 'static'`，子路径 `/portfolio`） |
| 交互组件 | React 18 岛屿（`client:load` / `client:visible` / `client:idle`） |
| 动效 | GSAP + ScrollTrigger（入场、视差） |
| 滚动 | Lenis（平滑滚动） |
| 背景 | Canvas 2D 流体光晕与微粒（无 WebGL、无重型依赖） |
| 样式 | 原生 CSS + 设计 token（无 CSS 框架） |

## 本地开发

需要 Node 20 以上（CI 使用 Node 22）。

```bash
npm install
npm run dev       # http://localhost:4321/portfolio/
npm run build     # 输出到 dist/
npm run preview   # 预览构建结果
```

注意 `astro.config.mjs` 里 `base: '/portfolio'`，本地访问也必须带这个子路径。

## 项目结构

```
.
├── .github/workflows/deploy.yml   # 抓取 → 构建 → 部署 → 回写数据
├── public/                        # favicon、robots.txt、自托管字体、WebP 证书与二维码
├── assets/                        # 未部署的原图（证书 JPG、二维码 PNG）
├── scripts/
│   ├── scrape-github.mjs          # GitHub GraphQL → src/data/github.json
│   ├── scrape-leetcode.mjs        # Puppeteer + LeetCode GraphQL → src/data/leetcode.json
│   ├── browser.mjs                # 统一启动本机 Chrome / Edge（CI 回退到 Puppeteer 自带）
│   ├── review-shots.mjs           # 桌面 / 移动 / 深色环境三套截图（深色用于确认仍为浅色纸面）
│   ├── debug-calendar-sweep.mjs   # 扫描日历各滚动位置，校验年份与日期对应
│   └── perf-probe.mjs             # FPS / 长任务 / 样式重算采样（可调 DPR 与 CPU 降速）
├── src/
│   ├── components/
│   │   ├── Hero.astro             # 首屏：主张 + 署名 + 01—05 空间索引
│   │   ├── Navigation.astro       # 顶栏、锚点高亮、移动端全屏菜单
│   │   ├── Profile.astro          # 01 关于
│   │   ├── ProjectShowcase.tsx    # 02 项目：科研 / 工程双面板
│   │   ├── ProjectCard.tsx        # 项目卡（含 arXiv / GitHub 入口）
│   │   ├── Skills.astro           # 03 技能
│   │   ├── Experience.astro       # 04 经历 + 获奖「证明」浮层
│   │   ├── StatsWidgets.astro     # 05 痕迹：GitHub / LeetCode
│   │   ├── FluidBackground.tsx    # Canvas 流体背景
│   │   ├── CustomCursor.tsx       # 自绘光标（系统光标隐藏）
│   │   ├── ScrollAnimations.tsx   # GSAP 入场与视差
│   │   ├── SmoothScroll.tsx       # Lenis
│   │   ├── ReadingProgress.tsx    # 顶部阅读进度
│   │   ├── BackToTop.tsx          # 回到顶部
│   │   ├── SoundToggle.tsx        # 音效开关（默认关闭）
│   │   └── Toast.tsx / ToastManager.tsx
│   ├── data/                      # 抓取快照，由 CI 自动回写
│   ├── layouts/Layout.astro       # head、SEO、Schema.org
│   ├── pages/index.astro          # 页面编排与 8 个项目的数据
│   └── styles/global.css          # 设计 token 与全局样式
├── docs/OPTIMIZATION_SUGGESTIONS.md
├── PREFERENCE.md                  # 设计决策与迭代记录
└── astro.config.mjs
```

`KeyboardShortcuts.*`、`PageTransition.tsx`、`ProjectCategory.tsx`、`ErrorBoundary.tsx` 仍在仓库里，但**当前没有挂载**，属于保留备用，不要把它们当作现有能力描述。

## 页面结构

| 区块 | 锚点 | 内容 |
|---|---|---|
| 入口 | — | 一句话主张、两段自述、署名、联系方式、01—05 索引 |
| 01 关于 | `#profile` | 自述 + 教育 / 排名 / 课程 / 联系四行信息 |
| 02 项目 | `#projects` | 科研（5）与工程（3）双面板，卡片可点开论文 / 仓库 |
| 03 技能 | `#skills` | 四类工具与研究方向 |
| 04 经历 | `#experience` | 竞赛荣誉（带证书浮层）与学生工作 / 实习 |
| 05 痕迹 | `#stats` | GitHub 贡献、LeetCode 统计 |

区块标题统一为「编号 + 中文 kicker、一句标题、一句导语」左对齐；新增区块需要同时更新 `Navigation.astro` 的 `sections` 与 `Hero.astro` 的索引。

## 设计系统

### 颜色

全站**锁定浅色纸面**，不提供深色模式：背景由 Canvas 固定绘制成米白，若文字变量跟随系统切深色会出现浅底浅字。`Layout.astro` 声明 `color-scheme: light`。

| Token | 值 | 用途 | 于 `#f8f6f3` 上的对比度 |
|---|---|---|---|
| `--color-bg` | `#f8f6f3` | 页面底色 | — |
| `--color-text` | `#2c2825` | 标题与正文 | 13.5:1 |
| `--color-text-muted` | `#5a5652` | 次要正文 | 6.7:1 |
| `--color-text-subtle` | `#6f6a65` | 注释、时间、坐标 | 5.0:1 |
| `--color-primary` | `#b8704a` | 装饰线、圆点、浅底 | 3.6:1（仅装饰） |
| `--color-primary-ink` | `#9c5b38` | 可读级棕：kicker、arXiv 标签 | 4.9:1 |
| `--color-accent-cool` | `#7a9bb8` | 冷色装饰 | 2.7:1（仅装饰） |
| `--color-accent-cool-ink` | `#4d708f` | 可读级冷色：Demo 标签 | 4.8:1 |

规则：任何**文字**只能用 `text` / `text-muted` / `text-subtle` / `*-ink`；`primary` 与 `accent-cool` 只用于线、点、底纹。

### 字体与版式

- 正文 `Inter` + 中文回退（`PingFang SC` / `Microsoft YaHei`）；标签 `JetBrains Mono`，等宽栈同样补了中文回退，避免中文落进宋体
- 字体自托管在 `public/fonts/`，不再请求 Google Fonts：避免渲染阻塞，也保证国内网络可达
- 内容栏 `--max-width: 1280px`，左右留白 `--page-gutter`；五个区块与顶栏共用同一条左右边界
- 区块上下留白 `clamp(2.5rem, 5vw, 6rem)`
- 中文标题一律 `letter-spacing: normal`，不使用负字距

## 交互与动效

- **平滑滚动**：Lenis；锚点跳转用 `scroll-margin-top` 避让顶栏
- **入场动画**：GSAP ScrollTrigger，元素默认可见，滚动进入时才播放。不要给 `section` 预设 `opacity: 0`，否则锚点直达或脚本异常时整段内容会消失
- **项目面板**：桌面端固定高度 `clamp(560px, 70vh, 720px)`，悬停面板 62/38 展开、未激活面板淡化到 0.72；面板内滚轮代理到卡片列表，到顶 / 到底后交还页面。移动端（≤900px）改为堆叠、自然页面滚动
- **日历**：GitHub / LeetCode 两张日历横向滚动，年份标签用 `position: sticky` 固定在左缘；鼠标悬停时纵向滚轮转为横向滚动，**到两端后停在原地**，不会突然变成上下滚页
- **自定义光标**：`body { cursor: none }`，可交互元素由自绘圆点变形提示。这是刻意保留的设计
- **音效**：默认关闭，开关在右下角，音量已压低
- **无键盘快捷键面板**：`KeyboardShortcuts` 组件未挂载

## 性能

首屏不再有任何第三方阻塞请求。2026-11 的优化与基线：

- **移除阻塞脚本**：ClustrMaps 不可达时，同步 `<script>` 会把 DOMContentLoaded 卡住 30 秒以上；现已移除。首屏 DCL 约 0.34s、FCP 约 0.5s
- **首屏传输 2.5MB → 约 183KB，无任何外部请求**：6 张证书图转 WebP（2.3MB → 454KB）并懒加载，字体自托管（140KB），原图移出 public
- **删除 54 个 `backdrop-filter`**：背景 Canvas 在动，每个毛玻璃元素每帧都要重新模糊；改为半透明白底 + 边框
- **Canvas 降本**：光斑预渲染为贴图、30fps、DPR 上限 1.25，底色改 CSS 渐变，不再每帧两次全屏填充 + 全屏噪点
- **动画按需**：首屏离开视口后轨道动画暂停，滚到统计区时样式重算从约 413 次/2.5s 降到约 29 次/2.5s
- **滚动**：4x CPU 降速、DPR 2 下，滚动采样帧率由约 111fps 提升到 125–164fps（首屏 / 统计区）

可以用 `scripts/perf-probe.mjs` 复测，改动后对比同一组参数即可。

## 数据管道

```
GitHub Actions（每日 00:05 / 12:05 北京时间，以及 push）
  ├─ node scripts/scrape-leetcode.mjs   → src/data/leetcode.json
  ├─ node scripts/scrape-github.mjs     → src/data/github.json
  ├─ npm run build
  ├─ git commit "chore: update ... [skip ci]" 并 push
  └─ 部署到 GitHub Pages
```

- **LeetCode**：Puppeteer 打开 leetcode.cn 抓 GraphQL，用户名 `anagke-59`
- **GitHub**：GraphQL 取贡献日历与用户统计，需要 `GH_PAT`（含私有仓库的 `read:user` 权限）；本地没有 token 时不要直接跑，会得到不完整数据
- **失败保护**：抓取失败时**保留上一次成功快照**，只追加 `error` 与 `lastAttemptAt`，`scrapedAt` 不动，页面上的「数据更新于」不会说谎
- **回写仓库**：`contents: write` + `Commit scraped data` 步骤。抓取结果会进仓库，因此本地 `npm run dev` 看到的是同一份快照；每天一次提交同时避免公开仓库 60 天无活动被 GitHub 停用定时任务
- **本地数据**：`src/data/*.json` 只是快照，`git pull` 后才与线上同步

## 本地校验脚本

脚本默认访问 `http://127.0.0.1:4322/portfolio/`，先启动预览：

```bash
npm run build
npx astro preview --port 4322

node scripts/review-shots.mjs        # 截图输出到 output/review/
node scripts/debug-calendar-sweep.mjs # 打印各滚动位置的年份 / 日期对应
DPR=2 CPU=4 node scripts/perf-probe.mjs # 首屏与统计区的 FPS / 长任务 / 重算
```

`scripts/browser.mjs` 会优先使用本机 Chrome / Edge；CI 或没有本机浏览器时回退到 Puppeteer 自带 Chromium。
也可以用 `CHROME_PATH` 指定路径。Puppeteer 缓存被清理后，如需重新下载：

```bash
npx puppeteer browsers install chrome
```

`output/` 与 `.workbuddy/` 已在 `.gitignore` 中，本地产物不会进仓库。

## 部署

1. 推送到 `main` 即触发 `.github/workflows/deploy.yml`
2. Pages Source 设为 **GitHub Actions**
3. 定时任务会先抓数据再构建；`workflow_dispatch` 可手动触发

## 维护约定

- 改文案 → `src/pages/index.astro`（项目数据）与对应区块组件
- 改配色 → 只动 `global.css` 的 token，不要在组件里写死颜色；新颜色必须满足 4.5:1
- 新增区块 → 同步 `Navigation.astro` 与 `Hero.astro` 索引，并检查 `scroll-margin-top`
- 不要引入深色变量，除非同时改 Canvas 背景层
- 不要恢复「所有链接悬停位移 + 阴影」这类全局规则，交给组件自己定义
- **不要给卡片加 `backdrop-filter`**：背景 Canvas 在动，几十个元素逐帧重新模糊会直接掉帧；用半透明白底 + 边框分层
- 背景 Canvas 只画会动的光斑（贴图 + 30fps + DPR 上限 1.25），底色交给 CSS 渐变；首屏离开视口后轨道动画暂停
- 图片优先 WebP 并加 `loading="lazy"`；证书图在 `public/previews/awards/`，原图放 `assets/`，不要放回 public

更细的设计取舍与历史决策见 [`PREFERENCE.md`](./PREFERENCE.md)，待办清单见 [`docs/OPTIMIZATION_SUGGESTIONS.md`](./docs/OPTIMIZATION_SUGGESTIONS.md)。
