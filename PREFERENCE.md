# 个人主页设计偏好文档

> 本文件记录设计取舍与迭代历史。**当前生效的 token、结构与交互说明以 README 为准**；
> 第 1—5 轮属于历史存档，其中部分描述已被后续轮次覆盖（会就地标注）。

## 项目概述
- **定位**: 简历的补充材料 + 独立空间。读者看完能点开论文、仓库、证书，而不是把简历再读一遍
- **技术栈**: Astro 6（静态输出）+ React 18 岛屿 + GSAP / ScrollTrigger + Lenis + Canvas 2D
- **设计哲学**: 「克制的张力」——暖米色纸面、低饱和墨色、大量留白；动效服务于阅读，不抢注意力

---

## 部署配置
- **部署平台**: GitHub Pages
- **访问路径**: `/portfolio`（子路径部署）
- **仓库要求**: Public（免费账户限制）
- **访问地址**: `https://jiafeng-yan.github.io/portfolio/`

---

## 当前设计系统（2026-11-11 生效）

### 颜色（低饱和度，锁定浅色纸面）
| Token | 值 | 用途 |
|---|---|---|
| `--color-bg` | `#f8f6f3` | 页面底色 |
| `--color-text` | `#2c2825` | 标题与正文（13.5:1） |
| `--color-text-muted` | `#5a5652` | 次要正文（6.7:1） |
| `--color-text-subtle` | `#6f6a65` | 注释、时间、坐标（5.0:1） |
| `--color-primary` | `#b8704a` | 装饰线、圆点（3.6:1，不用于正文） |
| `--color-primary-ink` | `#9c5b38` | 可读级棕：kicker、arXiv 标签（4.9:1） |
| `--color-accent-cool` | `#7a9bb8` | 冷色装饰（2.7:1，不用于正文） |
| `--color-accent-cool-ink` | `#4d708f` | 可读级冷色：Demo 标签（4.8:1） |

**不提供深色模式**：Canvas 背景固定绘制米白，若文字变量跟随系统切深色会出现浅底浅字。
`Layout.astro` 声明 `color-scheme: light`，任何设备统一显示浅色纸面。

### 排版原则
- 极简主义，大量留白；单栏纵向滚动
- 中文标题不带负字距，行距不小于 1.3
- 五个区块统一「编号 + 中文 kicker / 一句标题 / 一句导语」左对齐，共用 `--max-width: 1280px` 与 `--page-gutter`
- 英文只用于论文标题、`AAAI 2026 Poster` 这类专有名词

### 动效原则
- 丝滑、克制；内容默认可见，动画只在进入视口时补齐
- 悬停只做轻微浮起或颜色变化，不改动布局宽度（项目面板的 62/38 展开是唯一例外，且保留了「抽屉」手感）
- 悬浮控件（音效、回到顶部）保持 40px 描边圆，不压正文

---

## 已实现功能（当前挂载）

### 核心组件
1. **FluidBackground.tsx** - 流体背景（Canvas 2D）
   - 5 个暖色光球的多谐波呼吸、微粒星图、鼠标斥力与涟漪
   - 多层视差与 `visibilitychange` 休眠；`prefers-reduced-motion` 下减弱运动
   - 颜色随 `--color-bg` 的暖纸面体系（琥珀、水墨、陶土、米白）

2. **CustomCursor.tsx** - 自定义光标（**刻意保留，不提供关闭**）
   - 双层结构（外圈 + 内点），可交互元素处变形
   - `body { cursor: none }`，链接 / 按钮 / 日历容器同样隐藏系统光标

3. **Hero.astro** - 首屏「空间入口」
   - 地点与年份 meta → 主张「把看不清的地方，算清楚。」→ 两段自述
   - 署名行（闫家锋 / Yan Jiafeng）→ 文字型联系方式 → 状态行
   - 右侧 01—05 索引兼作导航；底部坐标与「继续 ↓」；轨道雕塑在画面外侧右上
   - **已不再使用**大字号姓名、数据条、实心按钮（见第六轮）

4. **ProjectCard.tsx** - 项目卡片
   - 标题、副标题、描述、要点、技术标签、状态徽章
   - arXiv / GitHub / Paper / Demo 入口按类型彩色填充，与灰色技术标签区分
   - 触摸设备不依赖悬停

5. **ProjectShowcase.tsx** - 项目双栏主展区
   - 科研（5）/ 工程（3）双面板，科研在左
   - 桌面端固定高度 `clamp(560px, 70vh, 720px)`，悬停 62/38 展开、未激活面板 0.72
   - 面板内滚轮代理到卡片列表，到顶 / 到底交还页面；移动端（≤900px）堆叠

6. **Profile.astro** - 01 关于
   - 自述 + 教育 / 排名 / 课程 / 联系四行信息表

7. **Skills.astro** - 03 技能（「手上有的工具」）
   - 四类：研究方向、编程语言、开发工具、系统实践与英语
   - 标签不可点击，因此没有 hover 抬起与手型光标

8. **Experience.astro** - 04 经历（「比赛、荣誉与课外」）
   - 竞赛获奖（带「证明」浮层，向下展开、右缘对齐）、学生工作与实习

9. **StatsWidgets.astro** - 05 痕迹
   - GitHub 贡献日历（整行，头部含 Pull Shark 成就）+ LeetCode 统计（整行，摘要下含 17 枚勋章）
   - 日历年份标签 `position: sticky`，滚轮横向滑动；数据来自 `src/data/*.json`

10. **Navigation.astro** - 顶栏与移动端全屏菜单（中文标签、细下划线）

11. **ScrollAnimations.tsx** / **SmoothScroll.tsx** - GSAP 入场、Lenis 平滑滚动
12. **ReadingProgress / BackToTop / SoundToggle / Toast** - 阅读进度、回到顶部、音效（默认关）、复制提示

### 项目数据
- 8 个项目（5 科研/科研竞赛 + 3 开发/课程项目），数据写在 `src/pages/index.astro`
- 真实简历内容（闫家锋，中央财经大学）

### 未挂载（保留备用）
- `KeyboardShortcuts.tsx` / `.css`：快捷键逻辑还在，但入口与组件均已从页面移除
- `PageTransition.tsx`：与 ScrollAnimations 重复，已停用
- `ProjectCategory.tsx`：早期分类面板方案，被 ProjectShowcase 取代
- `ErrorBoundary.tsx`：未被任何岛屿包裹

---

## 第一轮优化（2026-04-28）✅ 已完成（历史存档）

### 1. 背景闪烁问题 ✅ 已修复
- **现象**: 鼠标移动时背景画面闪烁，不动则正常
- **原因**: `mousePos` 状态变化触发 `useEffect` 重新执行动画循环
- **解决方案**: 
  - 使用 `useRef` 替代 `useState` 存储鼠标位置
  - 避免状态变化导致动画重置
- **实现**: `FluidBackground.tsx` 中 `mousePosRef` 替代 `mousePos`

### 2. 项目卡片交互优化 ✅ 已完成
- **实现效果**:
  - 横向排列，一排一个（flexbox 单列布局）
  - 未聚焦时只展示 venue、status、title、subtitle
  - 悬停时展开 description、technologies、links
  - CSS `max-height` + `opacity` 过渡动画
  - GSAP 缩放动画保留
- **文件**: `index.astro`, `ProjectCard.tsx`

### 3. 项目链接展示 ✅ 已完成
- **实现效果**:
  - 支持 `links` 数组，每个链接包含 `type` 和 `url`
  - 内联 SVG 图标（GitHub、arXiv、paper）
  - 零外部依赖
  - 链接在卡片展开时显示
- **文件**: `ProjectCard.tsx`, `index.astro`

### 4. 其它项排版优化 ✅ 已完成
- **实现效果**:
  - Skills 类目标题增大至 1rem，font-weight 600
  - Skills 项目悬停上移效果（translateY -2px）
  - Achievements 卡片悬停上移 + 阴影效果
  - ScrollTrigger 滚动进入动画（stagger）
  - Education 从左侧滑入动画
- **文件**: `Skills.astro`, `ScrollAnimations.tsx`

### 5. 背景漂浮四边形 ✅ 已完成
- **实现效果**:
  - 4 个不规则四边形（非扁平、非梯形）
  - 持续小幅度变换（旋转 + 形变）
  - 视差滚动效果（不同 parallax factor）
  - 低透明度（0.02-0.04 alpha）
- **文件**: `FluidBackground.tsx`

### 6. 可交互动效增强 ✅ 已完成
- **实现效果**:
  - SCROLL 指示器横向脉冲波纹（20px → 80px）
  - 链接悬停上移效果
  - 按钮样式链接悬停阴影
- **文件**: `Hero.astro`, `global.css`

### 7. 多设备适配 ✅ 已完成
- **实现效果**:
  - Mobile (< 480px): 减小间距、缩小字体、单列网格
  - Tablet (< 768px): 2 列技能网格、隐藏自定义光标
  - Touch devices: 隐藏自定义光标、卡片始终展开、触摸高亮
  - Desktop (> 768px): 完整效果
- **文件**: `global.css`, `Hero.astro`, `Skills.astro`, `ProjectCard.tsx`, `index.astro`

---

## 第二轮优化（2026-04-28）✅ 全部完成

### N1. 光标叠加问题 ✅ 已修复
- **现象**: GitHub、Email 等可点击内容，鼠标会叠加一个传统的"手"指示
- **原因**: `<a>` 标签默认有 `cursor: pointer`
- **解决方案**: 在 `global.css` 中为 `a, button, [data-cursor-hover]` 设置 `cursor: none`
- **文件**: `global.css`

### N2. SCROLL 波纹效果优化 ✅ 已完成
- **现象**: 单个波纹，位置错位
- **期望效果**: 从上到下由大到小排列多个更扁的波纹，配合竖线，拟态波动的电圈
- **实现效果**:
  - 3 个椭圆堆叠（宽度:高度 ~3:1）
  - 尺寸: 80x24, 60x18, 40x12
  - 动画延迟: 0s, 0.3s, 0.6s（错开形成波动效果）
  - 脉冲动画: scale 0.8→1.2 + opacity fade
- **文件**: `Hero.astro`

### N3. 项目卡片收缩/展开优化 ✅ 已完成
- **现象**: 项目默认显示过多内容，收缩/展开效果不明显
- **期望效果**: 默认只展示标题和简要信息，鼠标移到其上，容器上浮并展示更多内容
- **实现效果**:
  - 默认: 只显示 title, subtitle, venue
  - 悬停: 卡片上浮 8px + 阴影，内容展开
  - GSAP 动画: y: -8, boxShadow
  - 触摸设备: 始终展开
- **文件**: `ProjectCard.tsx`

### N4. 项目分级布局重构 ✅ 已完成
- **现象**: 所有项目混在一起，只有一个"科研项目"标题
- **期望效果**: 科研项目和开发项目分别放在左右，默认只展示标题周围一圈圆角矩形边框，鼠标移到其中一个矩形上面时，该矩形变宽并显现内置的项目
- **实现效果**:
  - 新组件: `ProjectCategory.tsx`
  - 默认: 45% 宽度，显示标题 + 项目数量
  - 悬停: 扩展到 70% 宽度，显示项目列表
  - 另一分类淡出并右移（opacity 0.2, translateX 30px）
  - 移动端: 垂直堆叠，全宽
- **文件**: `ProjectCategory.tsx`, `index.astro`

### N5. Index 页面重构 ✅ 已完成
- **实现效果**:
  - 项目按 venue 分类: "科研项目" (4个) 和 "开发项目" (2个)
  - 两列并排布局
  - 移动端: 垂直堆叠
- **文件**: `index.astro`

---

## 第三轮优化（2026-04-29）✅ 全部完成

### T1. 项目分栏平滑联动 ✅ 已完成
- **现象**: 科研项目和开发项目之间的伸缩过于僵硬
- **实现效果**:
  - `ProjectShowcase.tsx` 从 flex 宽度切换改为 CSS Grid 轨道过渡
  - 悬停 / 聚焦时采用更柔和的 `cubic-bezier(0.19, 1, 0.22, 1)`
  - 激活面板轻微上浮，非激活面板降低透明度并下移，形成平滑空间层次
- **文件**: `ProjectShowcase.tsx`

### T2. 项目容器固定高度与内部滚动 ✅ 已完成
- **期望效果**: 科研和开发列表高度一致，避免左右内容长度差造成视觉不平衡
- **实现效果**:
  - 桌面端项目面板固定为 `clamp(560px, 70vh, 720px)`
  - 内部项目卡片列表使用 `overflow-y: auto`
  - 移动端取消固定高度，避免触摸设备出现不自然的嵌套滚动
- **文件**: `ProjectShowcase.tsx`

### T3. 内容迁移 ✅ 已完成
- **实现效果**:
  - “氢能产业终端促进企业低碳转型”从补充经历迁移至科研项目末尾
  - 原补充经历位置改为“大同市发展和改革委员会 · 国民经济综合科实习生”
  - 创新创业奖项仍保留在表彰区，便于 HR 快速扫描获奖情况
- **文件**: `index.astro`, `Experience.astro`

### T4. 背景悬浮装饰与滚动视差 ✅ 已完成
- **实现效果**:
  - 在 Canvas 2D 背景中新增 orbit / thread / plate 三类低透明度悬浮装饰
  - 页面滚动时装饰以较小倍率进行同向视差移动，形成轻微纵深感
  - 继续使用静态页面可运行的 Canvas 方案，不引入 WebGL 或重型依赖
  - `prefers-reduced-motion` 下保留静态氛围但降低运动幅度
- **文件**: `FluidBackground.tsx`

---

## 第四轮微调（2026-04-30）✅ 全部完成

### Q1. 项目面板滚轮代理 ✅ 已完成
- **期望效果**: 鼠标只要位于对应 `project-showcase__panel` 内，滚轮即可滚动该面板内的项目列表
- **实现效果**:
  - 桌面端在 panel 层监听 `wheel`，将滚轮位移转发给内部 `.project-showcase__cards`
  - 内部列表还能滚动时拦截页面滚动，列表到顶 / 到底后恢复页面滚动
  - 移动端保持自然页面滚动，不引入嵌套滚动干扰
- **文件**: `ProjectShowcase.tsx`

### Q2. 背景装饰可见性增强 ✅ 已完成
- **现象**: 悬浮装饰过淡，且 `z-index: -1` 在部分环境中可能被页面背景层削弱
- **实现效果**:
  - Canvas 背景层改为稳定的 `z-index: 0`，正文内容保持在更高层级
  - 适度提高 orbit / thread / plate 装饰的透明度与线宽
  - 保持低饱和、低干扰的纵深感，不使用重型 WebGL 或额外依赖
- **文件**: `FluidBackground.tsx`

---

## 第五轮优化（2026-08-15）✅ 全部完成

### M1. 背景流体与微粒星图网络重构 ✅ 已完成
- **实现效果**:
  - 多谐波正弦耦合流体呼吸光晕（琥珀金、水墨灰蓝、陶土玫瑰、鼠尾草绿、羊绒米）
  - 神经微粒子星图网络（38 颗微粒缓速巡游 + 近距离淡雅连线 + 鼠标轻柔斥力扩散）
  - 鼠标物理涟漪与波环扩散（滑行与点击触发衰减光波）
  - 多层纵深滚动视差与 `visibilitychange` 智能休眠
- **文件**: `FluidBackground.tsx`

### M2. 全局卡片 Spotlight 光斑与光标磁吸 ✅ 已完成
- **实现效果**:
  - 基于 GPU 合成层 CSS 变量的 Spotlight 动态漫反射光斑系统
  - 光标流体速度形变（移动拉伸、停止回正）与关键按钮物理磁吸吸附
- **文件**: `CustomCursor.tsx`, `global.css`, `ProjectCard.tsx`, `Profile.astro`, `Skills.astro`, `Experience.astro`

### M3. Hero 动力学天体雕塑与全站滚动叙事升级 ✅ 已完成
- **实现效果**:
  - 右侧立体天体轨道雕塑（多轴自旋 + 卫星光点 + 桌面端鼠标陀螺仪微倾斜）
  - 项目卡片 3D 微透视倾角（±3.5°）
  - 各版块顶部线条生长入场与精细化 GSAP Stagger 动画编排
- **文件**: `Hero.astro`, `ProjectCard.tsx`, `ScrollAnimations.tsx`

### 设计约束（长期有效）
- Canvas 2D 而非 WebGL（轻量化），不引入重型依赖，保证首屏加载速度
- GitHub Pages 纯静态部署即可完整运行当前 Canvas / React island 动效
- 若浏览器性能不足，以降低透明度、减小视差倍率来妥协，而不是删掉动效

---

## 第六轮：从「简历封面」改为「空间入口」（2026-11-11）✅ 已完成

**方向调整**：主页不只是简历补充，也是一个独立空间。此前的巨型姓名与"求职标签"读起来过于自我，改为「空间入口」的叙事——场所先行，人物以署名出现。

### P1. 首屏重构 ✅
- 移除 160px 巨型姓名（原 `闫 / 家锋` 两行，负行距导致两字重叠 16px）、绿色 "Open to Opportunities" 胶囊、AAAI/GPA/CSP 数据条、四个实心按钮
- 新结构：地点与年份 meta → 一句话主张「把看不清的地方，算清楚。」→ 两段自述 → 署名行（闫家锋 / Yan Jiafeng）→ 文字型联系方式 → 状态行（AAAI 2026 Poster · TIP 投稿中）
- 右侧新增「空间索引」01—05，替代原空置的右侧区域，兼作导航；轨道雕塑右移半个身位，成为画外的一件远景
- 底部加入坐标行（北京 · 39.96°N 116.36°E）与「继续」提示，收住画面
- **文件**: `Hero.astro`, `ScrollAnimations.tsx`

### P2. 标签与文案去自我化 ✅
- 区块 kicker 统一为 `01 / 关于`、`02 / 项目`、`03 / 技能`、`04 / 经历`、`05 / 痕迹`，导航改为中文
- 删除 "Open to HR"、"候选人" 等求职话术；「关于」标题改为「还在学着，把问题拆小。」
- 项目卡片去掉与面板重复的类别标签（如面板「科研项目」里的「科研项目」），只保留状态徽章
- **文件**: `Navigation.astro`, `Profile.astro`, `Skills.astro`, `Experience.astro`, `StatsWidgets.astro`, `index.astro`, `ProjectCard.tsx`

### P3. 一致性与可读性修复 ✅
- 深色模式：移除与固定米白画布冲突的 dark 变量，全站锁定浅色纸面（此前深色系统下浅底浅字，几乎不可读）
- 锚点跳转：`[data-section] { scroll-margin-top: 5.5rem }`，标题不再被顶栏切掉
- 对比度：新增 `--color-primary-ink #9c5b38`（4.9:1）与 `--color-accent-cool-ink #4d708f`（4.8:1），替换原 3.57:1 / 2.70:1 的强调色
- 内容宽度统一为 `--max-width: 1280px`，五个区块左缘对齐成一条线；五个区块标题统一为「kicker + 标题 + 导语」左对齐
- 删掉重复的 `PageTransition` 动画层（与 `ScrollAnimations` 同时给同一批 section 设 opacity:0，导致锚点直达/整页截图时内容空白）；section 入场改为 `onEnter` 触发，内容默认可见
- **文件**: `global.css`, `Layout.astro`, `index.astro`, `ScrollAnimations.tsx`

### P4. 细节收敛 ✅
- 移除键盘快捷键入口与首访欢迎弹窗；交互音效默认关闭，按钮改为 40px 圆形图标
- 技能标签去掉假按钮态（不再有 hover 抬起与手型光标）
- 项目面板未激活态淡化从 0.58 提到 0.72，位移 8px→3px；删除重复的 01—05 标题清单
- 获奖「证明」浮层改为向下展开并对齐右缘，不再压住右侧经历栏
- 统计区：删除第三方访客地图（常加载失败，**第八轮重新接入、第十轮已彻底撤除**）、LeetCode 图标改内联、日历改暖墨/冷墨灰阶、数字摘要去底色块
- **文件**: `Skills.astro`, `ProjectShowcase.tsx`, `Experience.astro`, `StatsWidgets.astro`, `SoundToggle.*`, `sound.ts`, `KeyboardShortcuts.tsx`

---

## 第七轮：细节瑕疵修复（2026-11-11）✅ 已完成

### D1. 首屏链接基线错位 ✅
- **现象**: `GitHub / Email / 微信 / 电话` 里 Email 明显比其他几个高
- **原因**: 混排了 `<a>` 与 `<button>`，按钮保留了浏览器默认字体与 `1px 6px` 内边距，且容器 `align-items: center`
- **解决**: `.hero__link` 统一 `font: inherit`、清零默认 padding、`appearance: none`；容器改 `align-items: baseline`
- **文件**: `Hero.astro`

### D2. 状态行的小圆点 ✅
- 去掉「最近 · …」前面的棕色圆点，改为纯文字行（该圆点无信息量且抢注意力）
- **文件**: `Hero.astro`

### D3. 中文落进等宽字体回退 ✅
- **现象**: kicker、meta、状态行里的中文被渲染成宋体（`monospace` 回退），与正文无衬线不一致
- **解决**: `--font-mono` 补上 `'PingFang SC', 'Microsoft YaHei'` 回退；`--font-sans` 同样显式补中文
- **文件**: `global.css`

### D4. 区块左缘不统一 ✅
- **现象**: 导航 80 / 项目区 112 / 关于·技能·经历 144 / 痕迹区 38，四条不同的左缘
- **解决**: 新增 `--page-gutter` 与统一写法 `width: min(var(--max-width), 100% - 2 * var(--page-gutter))`，五个区块与导航共用一条竖线；区块上下留白改为 `clamp(2.5rem, 5vw, 6rem)`
- **文件**: `global.css`, `Profile/Skills/Experience/StatsWidgets.astro`, `index.astro`

### D5. 移动端全屏菜单被顶栏困住 ✅
- **现象**: 手机上点开菜单，链接挤在顶栏那一条里，露出页面内容
- **原因**: `.nav` 的 `transform` 与 `backdrop-filter` 会让它成为固定定位子元素的包含块
- **解决**: 去掉毛玻璃、`is-visible` 时用 `transform: none`、底色改 0.97 不透明；导航层级提到 1000 以盖住右下角悬浮按钮；移动端顺序改为 logo 左、微信与菜单按钮右
- **文件**: `Navigation.astro`

### D6. 其他细节 ✅
- 首屏轨道雕塑移到右上角外侧，不再穿过索引文字
- 索引第 02 项注解改为「研究在前，工程在后」（不再写死数量）
- 导航当前项由灰底胶囊改为细下划线；微信按钮由品牌绿实心改为描边
- 阅读进度条 3px 渐变+发光 → 2px 单色 60% 透明
- 回到顶部按钮由 48px 黑色实心 → 40px 浅色描边，与音效按钮成对
- 页脚由居中改为左版权 / 右链接，与首屏底栏呼应
- 荣誉条目「证明」浮层改为向下展开并对齐右缘
- LeetCode 难度进度条（原粉红/亮绿）改低饱和；进度条宽度限制在 32rem；更新时间行左对齐
- **文件**: `Hero.astro`, `index.astro`, `Navigation.astro`, `BackToTop.css`, `ReadingProgress.css`, `StatsWidgets.astro`, `Experience.astro`

---

## 数据管道修复（2026-11-11）✅ 已完成

- **问题**：仓库里的 `src/data/*.json` 停在 2026-09-13，本地看到的 LeetCode 2476 / GitHub 104 都是旧快照
- **定位**：提交 `967e46f`（9/13）删掉了 workflow 里的「Commit scraped data」步骤，权限从 `contents: write` 降为 `read`。
  抓取与构建仍在跑（线上站点数据是最新的：2026/11/11、2503 题），但结果不再提交回仓库
- **附带风险**：GitHub 会在公开仓库连续 60 天无提交时自动停用定时任务；最后一次提交是 9/13，已接近阈值
- **修复**：
  - 恢复提交步骤并给回 `contents: write`，消息带 `[skip ci]`，`continue-on-error` 不影响部署
  - 两个爬虫脚本在失败时保留上一次成功快照，不再用 0 覆盖（避免某天抓取失败导致线上显示「0 已解决」）
  - 本地重抓 LeetCode，`scrapedAt` 更新为 2026-11-11
  - README 更新自动化说明

---

## 第八轮：访客地图回归与入口强化（2026-11-11）✅ 已完成

### V1. 恢复访客地图 ✅（第十轮已撤除）
- 统计区顶部恢复「GitHub + 访客地图」两栏（此前因第三方脚本常加载失败被整块删除）
- 保留原有同步嵌入方式（`map_v2.js` 依赖脚本在文档中的插入位置，改异步反而可能失效）
- 卡片右上角新增「查看详情 ↗」指向 ClustrMaps 站点页
- 脚本被拦截 / 网络不可达时显示占位（`data-clustrmaps-fallback`），注入成功后由 `MutationObserver` 移除；观察器 15 秒后自动断开
- **文件**: `StatsWidgets.astro`

### V2. 日历滚轮横滑 ✅
- 指针位于 GitHub / LeetCode 日历上时，纵向滚轮转为横向滚动；触控板横向手势优先
- 行 / 页为单位的滚轮按单位换算；到两端不再拦截，滚动交还页面
- `stopPropagation` 拦住 Lenis，避免边横滑边纵向滚页
- 容器去掉 `scroll-behavior: smooth`（滚轮和拖拽要跟手），初次定位改用 `scrollTo({ behavior: 'smooth' })`
- **文件**: `StatsWidgets.astro`

### V3. arXiv / GitHub 入口突出 ✅
- 论文与代码入口原来与灰色技术标签同为浅灰胶囊，几乎不被注意
- 改为按类型填充：GitHub 墨黑 `#2c2825`、arXiv 暖棕 `#9c5b38`、Paper 中灰、Demo 冷蓝 `#4d708f`
- 反白文字、字号 0.72 → 0.78rem 并加粗、全圆角；hover 只做轻微上浮 + 阴影
- 与技术标签形成「可点开的东西 vs 技术关键词」的区分
- **文件**: `ProjectCard.tsx`

---

## 第九轮：文档与代码同步（2026-11-11）✅ 已完成

- README 重写：补齐技术栈、项目结构、页面结构、设计 token 与对比度、交互细节、数据管道、访客（后已撤除）、校验脚本、维护约定
- 修正三处过时描述：配色仍是早期灰 / 米 / 蓝、`ghchart.rshah.org` 外部图表（实际早已改为读取 `github.json` 自绘日历）、组件树缺少 Navigation / StatsWidgets 等
- PREFERENCE 顶部改为「当前设计系统」，标注第 1—5 轮为历史存档；补记第八轮
- `docs/OPTIMIZATION_SUGGESTIONS.md` 重写为「已完成 / 已决策不实施 / 待办」三档，删除与代码不符的勾选项
- 记录未挂载组件（KeyboardShortcuts / PageTransition / ProjectCategory / ErrorBoundary），避免文档把预留代码当成能力
- **文件**: `README.md`, `PREFERENCE.md`, `docs/OPTIMIZATION_SUGGESTIONS.md`

---

## 第十轮：性能治理与访客组件撤除（2026-11-12）✅ 已完成

### X1. 撤除访客组件 ✅
- **背景**：ClustrMaps 自 2026 年起整体不可达、RevolverMaps 已关停；同步脚本还会阻塞解析 30 秒以上
- 曾用本地点阵地图 + Abacus 计数替代，但地图数据来自低精度世界轮廓，无法保证领土边界表达准确（例如漏掉台湾），
  而且没有真实地理定位交互，装饰性地图本身就是误导
- **决定**：整个访客卡撤掉，不再保留计数、地图或任何访客统计；统计区回到「GitHub 贡献 + LeetCode」两张卡
- **文件**: `StatsWidgets.astro`

### X2. 性能治理 ✅
- **移除 54 个 `backdrop-filter`**：动态 Canvas 背景上每帧重新模糊，是主要掉帧来源；改为半透明白底 + 边框
- **Canvas 降本**：5 个光斑预渲染为 256px 贴图，30fps，DPR 上限 2 → 1.25；底色改 CSS 渐变，删掉每帧两次全屏填充与全屏噪点
- **首屏动画按需**：`IntersectionObserver` 离开视口后暂停三个轨道环与核心脉冲；陀螺仪循环收敛后不再写样式
- **字体自托管**：Inter / JetBrains Mono 放 `public/fonts/`，移除 Google Fonts 的渲染阻塞请求（国内也不可达）
- **图片**：6 张证书 2.3MB → 454KB WebP 并懒加载；微信二维码 236KB → 44KB；原图移至 `assets/` 不再部署
- **阅读进度**：由 React state 改为 rAF 内直接写 transform，滚动时不再触发组件重渲染
- **实测**：首屏 DCL 30s+ → 0.34s；首屏传输 2.5MB → 183KB；统计区样式重算 413 → 29 次/2.5s；滚动 111 → 125–164fps（4x CPU、DPR 2）
- **文件**: `global.css`, `FluidBackground.tsx`, `Hero.astro`, `ReadingProgress.tsx`, `Layout.astro`, `Experience.astro`, `Navigation.astro`

### X3. 日历滚轮到头不再穿透 ✅
- 指针在日历上时始终接管滚轮，到头后停在原地；移出日历才恢复页面滚动
- 容器加 `overscroll-behavior-x: contain`，触控板也不会把残余滚动传给页面
- **文件**: `StatsWidgets.astro`

### X4. 细节 ✅
- 项目卡去掉重复的「个人项目 + 已开源」双徽章
- 视觉回归脚本改用系统 Chrome / Edge（`scripts/browser.mjs`），不再依赖 Puppeteer 缓存

---

## 第十一轮：徽章展示与滚动条评估（2026-11-12）✅ 已完成

### Y1. GitHub / LeetCode 徽章 ✅
- GitHub 成就没有公开 API，抓取公开成就页与详情页；当前 1 枚 Pull Shark（2 次 PR 被合并，2026-11-07）
- LeetCode 用公开 GraphQL `userBadges` 取到 17 枚勋章；按「获得年份」分组，避免把 1000 天勋章归到设计年份
- 图标统一压成 128px WebP，自托管 `public/badges/`（17 枚约 70KB），懒加载；缺本地图标时回退官方 CDN
- 展示位置：GitHub 卡头部一枚 chip；LeetCode 摘要下方一条横向勋章架，移动端可横滑
- 抓取失败保留上一次快照，不清空已有徽章
- **文件**: `StatsWidgets.astro`, `scrape-github.mjs`, `scrape-leetcode.mjs`, `src/data/*.json`, `public/badges/`

### Y2. 滚动条标准化：不做 ✅
- 指南扫描发现全局只有 `::-webkit-scrollbar`，建议补 `scrollbar-color` / `scrollbar-width`
- 标准化不改变滚动功能，但 Chrome / Safari 会改用浏览器原生 thin 条：失去 8px 宽、4px 圆角、透明轨道和 hover 变深
- **决定**：保留当前样式；Firefox 显示系统默认滚动条，差异可接受
- 如果以后只想照顾 Firefox，可用 `@supports not selector(::-webkit-scrollbar)` 单独补标准属性，Chrome / Safari 不受影响

---

## 已决策不实施

| 项 | 决定 | 原因 |
|---|---|---|
| 项目面板改纵向平铺 | 保留「抽屉」 | 双面板 + 内滚是页面节奏的一部分，用户明确要求不动 |
| 自定义光标可关闭 | 保留 | 属于空间感的一部分，用户明确要求不修改 |
| 技能雷达图 / 进度条 | 不做 | 熟练度百分比缺乏客观标尺 |
| 联系表单 | 不做 | 邮件 / 微信 / 电话已覆盖，第三方表单带来隐私与运维成本 |
| 3D Hero / 粒子增强 | 不做 | 与克制的研究型视觉冲突，且增加首屏负担 |
| 动态 OG 图 | 暂不做 | 单页收益有限，等有稳定主视觉再做 |
| 项目截图主视觉 | 不做 | 低质量截图会干扰阅读，保留文字 + 链接 |
| 访客统计 / 地图 | 不做 | 没有可靠、可维护的真实地理数据源；装饰性地图会误导，边界表达也难以保证准确 |

## 后续迭代方向
- [ ] 深色模式（需同时改 Canvas 背景、卡片底色与阴影，成本高，非必需）
- [ ] 静态 OG 分享图（1200×630）
- [ ] 自定义 404 页面
- [ ] 项目详情页 / 博客模块（先有内容再做）
- [ ] `KeyboardShortcuts` / `PageTransition` / `ProjectCategory` / `ErrorBoundary` 的去留（目前保留未挂载）
- [ ] 性能：bundle 体积检查、图片懒加载走查
