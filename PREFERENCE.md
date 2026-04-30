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

## 技术约束
- Canvas 2D 而非 WebGL（轻量化）
- 无重型依赖
- 保持首屏加载快速
- GitHub Pages 静态部署可完整运行当前 Canvas / React island 动效；若浏览器性能不足，效果以低透明度、低倍率视差进行妥协

---

## 后续迭代方向
- [ ] 深色模式支持
- [ ] 更多项目详情页
- [ ] 博客/文章模块
- [ ] 性能优化（图片懒加载等）
