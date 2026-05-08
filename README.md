# 闫家锋 - 个人主页

基于 Astro 构建的个人主页，具备流体背景动效、自定义光标、悬停展开交互等特性。

**在线访问**: [https://jiafeng-yan.github.io/portfolio/](https://jiafeng-yan.github.io/portfolio/)

## 技术栈

- **Astro** - 静态站点生成器
- **React** - 交互组件
- **GSAP + ScrollTrigger** - 滚动动画
- **Lenis** - 平滑滚动
- **Canvas 2D** - 流体背景效果

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 部署到 GitHub Pages

1. 在 GitHub 创建仓库 `portfolio`
2. 推送代码到 `main` 分支
3. 在仓库设置中启用 GitHub Pages（Source: GitHub Actions）
4. GitHub Actions 会自动部署

访问地址：`https://jiafeng-yan.github.io/portfolio/`

## 项目结构

```
src/
├── components/
│   ├── FluidBackground.tsx    # 流体背景
│   ├── CustomCursor.tsx       # 自定义光标
│   ├── Hero.astro             # 首屏
│   ├── ProjectCard.tsx        # 项目卡片（悬停展开）
│   ├── Skills.astro           # 技能与成果
│   ├── ScrollAnimations.tsx   # GSAP 滚动动画
│   └── SmoothScroll.tsx       # Lenis 平滑滚动
├── layouts/
│   └── Layout.astro           # 基础布局
├── pages/
│   └── index.astro            # 首页
└── styles/
    └── global.css             # 全局样式
```

## 设计特点

- **克制的张力**：极简排版 + 局部流体艺术
- **渐进式信息披露**：悬停展开项目详情
- **自定义光标**：`mix-blend-mode: difference` 反色效果
- **平滑滚动**：Lenis 驱动的丝滑体验
- **响应式设计**：适配桌面与移动端

## 颜色方案

- 灰色：`#7a7a7a`（深灰）、`#5a5a5a`（网格）
- 米色：`#b8986c`
- 淡墨蓝：`#90b4ce`

低饱和度配色，符合"克制的张力"设计哲学。

## 流体背景效果

流体背景采用 Canvas 2D 实现，包含以下特性：

- **多层视差系统**：
  - 深层（Contour Fields）：`parallaxFactor 0.65-0.95`，移动缓慢，营造远景效果
  - 中层（Flow Lines）：`parallaxFactor 0.25-0.55`，中等移动速度
- **绝对坐标定位**：元素基于文档高度定位，随页面滚动自然呈现
- **鼠标视差**：鼠标移动时，近处元素移动幅度大，远处元素移动幅度小
- **性能优化**：视口外元素自动跳过渲染
- **响应式适配**：监听文档高度变化，动态调整元素分布

## 动态统计模块

新增统计组件展示开源贡献、刷题记录与访客分布：

### GitHub 贡献图表

- 使用 ghchart.rshah.org 服务展示过去一年的代码贡献记录
- 实时更新，反映 GitHub 活动情况

### LeetCode 刷题统计

- **自动数据更新**：通过 GitHub Actions 每日自动爬取 LeetCode 中国站数据
- **贡献瓷砖墙**：类似 GitHub 的贡献图，展示刷题活跃度
- **难度分布**：可视化展示简单/中等/困难题目的完成进度
- **统计指标**：已解决数、活跃天数、连续天数等
- **数据来源**：用户名 `anagke-59`，数据存储于 `src/data/leetcode.json`

### ClustrMaps 访客地图

- 全球访客分布可视化
- 实时追踪网站访问来源

### 技术实现

- **爬虫脚本**：`scripts/scrape-leetcode.mjs` 使用 Puppeteer 爬取 LeetCode 数据
- **自动化流程**：GitHub Actions 每日 UTC 0:00（北京时间 8:00）自动执行
- **数据持久化**：爬取结果自动提交到仓库，触发站点重新构建
