# Hardy Augustus - 个人博客

基于 [Hexo](https://hexo.io/) 构建的静态个人博客，托管于 GitHub Pages。

**线上地址**: https://hdhyy.github.io

## 项目结构

```
hdhyy.github.io/
├── index.html                  # 首页
├── archives/                   # 归档页面
│   ├── index.html              # 全部归档
│   └── 2019/                   # 按年/月归档
├── 2019/05/18/hello-world/     # 博客文章（按日期组织）
├── css/
│   ├── style.css               # 主样式表（CSS 变量 + Flexbox/Grid）
│   ├── fonts/                  # FontAwesome 字体文件
│   └── images/
│       └── banner.jpg          # 页头横幅图
├── js/
│   └── script.js               # 站点交互脚本（原生 JS，无 jQuery 依赖）
├── favicon.svg                 # SVG 站点图标
└── fancybox/                   # Fancybox 图片灯箱库
```

## 技术栈

| 类别 | 技术 | 说明 |
|------|------|------|
| 静态生成 | Hexo | 3.8.0 |
| 核心脚本 | Vanilla JS | 零依赖，原生 DOM API |
| 图片灯箱 | Fancybox + jQuery | 仅灯箱功能依赖 jQuery |
| 图标字体 | FontAwesome | 4.0.3 |
| 代码字体 | Source Code Pro | Google Fonts |
| 部署平台 | GitHub Pages | 自动部署 |

## 前端特性

### 现代 CSS 架构
- **CSS 自定义属性**: 全站使用 CSS Variables 管理颜色、间距、字体等设计令牌
- **Flexbox / Grid 布局**: 主内容区 Flexbox 两栏布局，归档页 CSS Grid 网格
- **自动暗色模式**: 通过 `prefers-color-scheme` 媒体查询自动适配系统主题
- **无障碍优先**: `:focus-visible` 焦点样式、ARIA 标签、`prefers-reduced-motion` 动画降级

### 响应式设计
- **桌面端** (>=768px): 双栏布局 + 侧边栏
- **平板端** (480-767px): 单栏布局，归档双列网格
- **移动端** (<479px): 汉堡菜单 + 侧滑导航

### 交互功能
- **文章分享**: Twitter、Facebook、Pinterest 一键分享
- **站内搜索**: 基于 Google 自定义搜索，动画展开
- **图片灯箱**: 文章图片自动启用 Fancybox 放大查看
- **返回顶部**: 滚动超过 400px 显示，`requestAnimationFrame` 节流
- **代码高亮**: Tomorrow Night 深色主题，桌面端圆角代码块

### 性能优化
- 核心脚本 **零 jQuery 依赖**，仅灯箱保留 jQuery
- `font-display: swap` 避免字体阻塞
- CSS 过渡使用 `transform` / `opacity` 触发 GPU 合成
- 自定义精简滚动条样式

## 本地开发

本仓库为 Hexo 编译后的静态产物，可直接用任意静态服务器预览：

```bash
# 方式一：Python
python3 -m http.server 8000

# 方式二：Node.js（需安装 serve）
npx serve .
```

然后访问 http://localhost:8000 即可。

## 部署

推送到 `master` 分支后，GitHub Pages 会自动部署更新。

```bash
git add .
git commit -m "更新内容"
git push origin master
```

## 许可证

本项目内容版权归 Hardy Augustus 所有。Hexo 主题遵循其原始许可协议。
