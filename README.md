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
│   ├── style.css               # 主样式表
│   ├── fonts/                  # FontAwesome 字体文件
│   └── images/
│       └── banner.jpg          # 页头横幅图
├── js/
│   └── script.js               # 站点交互脚本
└── fancybox/                   # Fancybox 图片灯箱库
```

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 静态生成 | Hexo | 3.8.0 |
| JS 库 | jQuery | 3.7.1 (jsDelivr CDN) |
| 图片灯箱 | Fancybox | 1.x |
| 图标字体 | FontAwesome | 4.0.3 |
| 代码字体 | Source Code Pro | Google Fonts |
| 部署平台 | GitHub Pages | — |

## 站点功能

- **响应式布局**: 适配桌面端（>768px）、平板和移动端（<479px 切换为侧滑导航）
- **文章分享**: 支持 Twitter、Facebook、Pinterest 一键分享
- **站内搜索**: 基于 Google 自定义搜索
- **图片灯箱**: 文章图片自动启用 Fancybox 放大查看
- **代码高亮**: 内置语法高亮主题（深色背景）
- **RSS 订阅**: 通过 `/atom.xml` 提供 Atom Feed

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
