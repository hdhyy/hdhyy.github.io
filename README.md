# Hardy Augustus - 技术博客

一个现代化的静态博客系统，专注于 AI、编程和技术分享。

## 🎯 特性

- **模板化内容管理** - 使用 Markdown 编写文章，Handlebars 模板生成 HTML
- **50+ AI 主题文章** - 涵盖 LLM、智能体、知识图谱、计算机视觉、NLP 等领域
- **每日 AI 新闻爬虫** - 自动抓取 HackerNews 和 ArXiv 的 AI 相关内容
- **GitHub Actions 定时任务** - 每天自动发布 AI 新闻总结
- **响应式设计** - 完美适配桌面、平板和手机
- **深色/浅色主题** - 一键切换主题，自动保存偏好
- **客户端搜索** - 实时搜索文章，无需后端

## 📁 项目结构

```
hdhyy.github.io/
├── blog-generator/              # 博客生成系统
│   ├── content/                 # Markdown 文章内容
│   ├── templates/               # Handlebars 模板
│   │   ├── index.hbs           # 主页模板
│   │   └── post.hbs            # 文章页面模板
│   ├── scripts/
│   │   └── news-crawler.js      # AI 新闻爬虫脚本
│   ├── generate.js              # 静态站点生成器
│   └── package.json
├── .github/workflows/
│   └── daily-news.yml           # GitHub Actions 定时任务
├── css/                         # 样式文件
│   ├── modern.css              # 现代化样式
│   └── post.css                # 文章页面样式
├── js/
│   └── app.js                  # 客户端脚本
├── index.html                  # 主页
└── 2026/                        # 文章页面目录
```

## 🚀 快速开始

### 本地开发

```bash
cd blog-generator

# 安装依赖
npm install

# 生成静态站点
node generate.js

# 测试 AI 新闻爬虫
node scripts/news-crawler.js
```

### 添加新文章

在 `blog-generator/content/` 目录下创建 Markdown 文件：

```markdown
---
title: 文章标题
date: 2026-03-28
tags: ["标签1", "标签2"]
summary: 文章摘要
---

## 正文

这是文章内容...
```

然后运行 `node generate.js` 生成静态 HTML。

## 📅 定时任务

GitHub Actions 配置在 `.github/workflows/daily-news.yml`，每天 UTC 8:00（北京时间 16:00）自动运行：

1. 从 HackerNews 和 ArXiv 抓取 AI 新闻
2. 生成新闻总结文章
3. 重新生成静态站点
4. 自动提交并推送到 GitHub

## 🔧 技术栈

- **静态生成**: Node.js + Handlebars + Marked
- **爬虫**: Axios + Cheerio
- **定时任务**: GitHub Actions + node-cron
- **前端**: HTML5 + CSS3 + Vanilla JavaScript
- **托管**: GitHub Pages

## 📝 文章管理

### 文章元数据

每篇文章的 Front Matter 包含：

- `title` - 文章标题
- `date` - 发布日期（YYYY-MM-DD 格式）
- `tags` - 标签数组
- `summary` - 文章摘要

### 自动生成的字段

- `formattedDate` - 格式化的日期
- `path` - 文章 URL 路径

## 🎨 主题定制

编辑 `css/modern.css` 中的 CSS 变量来自定义主题：

```css
:root {
  --primary-color: #f97316;
  --background: #ffffff;
  --foreground: #1a1a1a;
  /* ... 更多变量 */
}

.dark {
  --background: #0a0a0a;
  --foreground: #ffffff;
  /* ... */
}
```

## 📊 新闻爬虫配置

编辑 `blog-generator/scripts/news-crawler.js` 来：

- 添加新的新闻源
- 修改 AI 关键词过滤
- 调整新闻数量和排序

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**访问博客**: https://hdhyy.github.io/

**最后更新**: 2026-03-28
