# 个人主页优化建议

完整的优化建议文档，包含 80+ 优化项。

## 已实施 ✅

### 高优先级
- [x] 深色模式支持
- [x] 页面加载动画
- [x] 阅读进度条
- [x] Toast 通知系统
- [x] 性能优化（代码分割、字体域名预连接）
- [x] SEO 优化（Schema.org 结构化数据）
- [x] 项目卡片悬停效果增强
- [x] 一键复制联系方式
- [x] 移动端汉堡菜单 - 当前导航在小屏幕不够友好
- [x] 图片优化 - 使用 Astro Image 组件，WebP 格式
- [x] 错误边界 - React Error Boundary 处理组件崩溃
- [x] 返回顶部按钮：滚动超过500px显示，平滑滚动

### 中优先级
- [x] 字体渲染优化
- [x] 可访问性改进（ARIA 属性）

### 低优先级（锦上添花）
- [x] **音效反馈** - 按钮点击音效（可选）
- [x] **键盘快捷键** - 快捷导航（如 Cmd+K 搜索）

---

## 待实施 📋

### 中优先级（可选功能）
- [ ] **项目图片预览** - 本轮撤回项目截图方案，恢复文字信息与 GitHub / arXiv 等跳转标签，避免低质量截图干扰项目阅读
- [x] **成就证明预览** - 数学竞赛、CSP、蓝桥杯、创新创业和学术科研奖学金支持条目悬浮/聚焦浮出证明；公开素材中的身份证号、注册号等敏感字段已遮挡

### 本轮评估后暂不实施
- [ ] **技能雷达图 / 进度条** - 熟练度百分比缺乏客观标尺，容易传达不可靠的精确度，必要性低
- [ ] **联系表单** - 当前邮件、微信、电话入口已覆盖联系需求；引入第三方表单会增加隐私、垃圾消息和运维成本
- [ ] **3D Hero / 粒子效果增强** - 与当前克制的研究型视觉方向冲突，并增加首屏性能负担
- [ ] **动态 OG 图片生成** - 单页站点收益有限，后续有稳定品牌主视觉时再统一制作

---

## 详细优化建议

### 1. 移动端导航优化

**问题**：当前导航在移动端可能显示不全

**解决方案**：
```tsx
// 创建 MobileNav.tsx
- 汉堡菜单图标
- 全屏覆盖导航
- 滑动过渡动画
- 支持手势关闭
```

### 2. 项目预览

**实现**：
```tsx
// 项目卡片保留标题、摘要、技术标签和 GitHub / arXiv 跳转链接。
// 不使用低质量静态截图作为项目主视觉。
```

### 3. 技能可视化

**方案 A: 雷达图（Chart.js）**
```tsx
import { Radar } from 'react-chartjs-2';

<Radar 
  data={{
    labels: ['Python', 'PyTorch', 'React', 'GSAP'],
    datasets: [{
      data: [90, 85, 75, 80]
    }]
  }}
/>
```

**方案 B: 进度条**
```tsx
<div className="skill-bar">
  <div className="skill-bar__fill" style={{ width: '90%' }} />
</div>
```

### 4. 联系表单

**推荐方案：Formspree**
```tsx
<form action="https://formspree.io/f/your-id" method="POST">
  <input type="email" name="email" required />
  <textarea name="message" required />
  <button type="submit">发送</button>
</form>
```

---

## 性能优化清单

### 已完成
- [x] 代码分割（client:load / client:idle / client:visible）
- [x] 字体域名预连接（避免对 Google Fonts 内部版本路径做易失效的手工预加载）
- [x] GSAP ScrollTrigger 懒加载

### 待优化
- [x] 图片懒加载（奖励证明和统计模块）
- [ ] Service Worker（离线支持）
- [ ] 资源预获取（prefetch）
- [ ] Bundle 分析（rollup-plugin-visualizer）

---

## SEO 优化清单

### 已完成
- [x] Schema.org 结构化数据
- [x] Open Graph 元标签
- [x] Canonical URL

### 待优化
- [x] Sitemap 生成（@astrojs/sitemap）
- [x] Robots.txt
- [ ] 动态 OG 图片生成
- [ ] 404 页面

---

## 可访问性清单

### 已完成
- [x] ARIA 属性（role, aria-label）
- [x] 键盘导航支持
- [x] 焦点样式
- [x] prefers-reduced-motion

### 待优化
- [x] 跳转到主内容链接
- [ ] 颜色对比度检查（WCAG AA）
- [ ] 屏幕阅读器测试
- [ ] 语义化 HTML 完善

---

## 工具与资源

### 推荐库
- **动画**: framer-motion, GSAP
- **图表**: Chart.js, recharts
- **表单**: react-hook-form, Formspree
- **3D**: three.js, @react-three/fiber
- **图标**: lucide-react, react-icons

### 测试工具
- **性能**: Lighthouse, WebPageTest
- **可访问性**: axe DevTools, WAVE
- **SEO**: Google Search Console, Ahrefs
- **跨浏览器**: BrowserStack

---

## 实施建议

### 优先级排序
1. 修复明显问题（移动端导航）
2. 完善核心功能（表单、图片）
3. 增强视觉效果（证明浮层、图表）
4. 添加高级特性（3D、动效）

### 时间分配
- 高优先级：1-2 周
- 中优先级：2-4 周
- 低优先级：可持续迭代

### 渐进式实施
建议每次实施 2-3 个优化项，测试无误后再继续，避免一次性改动过大导致问题难以排查。

---

完整的代码示例和实现细节，请参考项目代码或随时询问。
