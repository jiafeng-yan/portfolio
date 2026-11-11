# 个人主页设计偏好文档

## 项目概述
- **目标**: 创建个人主页 demo，部署到 GitHub Pages，面向 HR 展示
- **技术栈**: Astro + React + GSAP + Lenis + Canvas 2D
- **设计哲学**: "克制的张力" — 极简排版 + 流体艺术背景

---

## 部署配置
- **部署平台**: GitHub Pages
- **访问路径**: `/portfolio`（子路径部署）
- **仓库要求**: Public（免费账户限制）
- **访问地址**: `https://jiafeng-yan.github.io/portfolio/`

---

## 设计偏好

### 颜色方案（低饱和度）
- 灰色: `#a0a0a0`
- 米色: `#d2b48c`
- 淡墨蓝: `#b0c4de`
- 背景: `#fafafa`
- 主文字: `#1a1a1a`
- 次要文字: `#666666`

### 排版原则
- 极简主义，大量留白
- 竖版滚动布局
- 渐进式信息披露（悬停展开详情）

### 动效原则
- 丝滑、克制的动画
- 有意义的交互反馈
- 不干扰内容阅读

---

## 已实现功能

### 核心组件
1. **FluidBackground.tsx** - 流体背景（Canvas 2D）
   - 鼠标交互影响粒子运动
   - 低透明度渐变圆形
   - 颜色: 灰、米色、淡墨蓝

2. **CustomCursor.tsx** - 自定义光标
   - 双层结构（外圈 + 内点）
   - `mix-blend-mode: difference` 反色效果
   - 悬停交互元素时放大

3. **Hero.astro** - 首屏
   - 大字号姓名
   - 标题、副标题、简介
   - GitHub/Email 链接
   - Scroll 指示器

4. **ProjectCard.tsx** - 项目卡片
   - 悬停展开详情
   - GSAP 缩放动画
   - 技术标签展示

5. **ProjectShowcase.tsx** - 项目双栏主展区
   - 科研 / 开发项目分栏展示
   - 平滑轨道伸缩与内容渐移
   - 桌面端固定容器高度，项目列表内部滚动

6. **Profile.astro** - 个人速览
   - 教育背景、排名、课程、联系方式
   - 面向 HR 的快速扫描信息结构

7. **Skills.astro** - 技能与成果
   - 研究方向、编程语言、开发工具
   - 系统实践与英语能力

8. **Experience.astro** - 竞赛、表彰与补充经历
   - 竞赛获奖、校级荣誉、学生工作与实习经历

9. **ScrollAnimations.tsx** - GSAP 滚动动画
10. **SmoothScroll.tsx** - Lenis 平滑滚动

### 项目数据
- 8 个项目（5 科研/科研竞赛 + 3 开发/课程项目）
- 真实简历内容（闫家锋，中央财经大学）

---

## 已优化问题（2026-04-28）✅ 全部完成

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

---
- Canvas 2D 而非 WebGL（轻量化）
- 无重型依赖
- 保持首屏加载快速
- GitHub Pages 静态部署可完整运行当前 Canvas / React island 动效；若浏览器性能不足，效果以低透明度、低倍率视差进行妥协

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
- 统计区：删除第三方访客地图（常加载失败）、LeetCode 图标改内联、日历改暖墨/冷墨灰阶、数字摘要去底色块
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

## 后续迭代方向
- [ ] 深色模式可切换版本（需同时处理 Canvas 背景与卡片底色）
- [ ] 项目面板取消固定高度与内部滚动（当前仍为 630px + 内滚，8 张卡只能看到一张半）
- [ ] 自定义光标可关闭（当前 body `cursor: none`，可点性依赖自绘圆点）
- [ ] 更多项目详情页
- [ ] 博客/文章模块
- [ ] 性能优化（图片懒加载等）
