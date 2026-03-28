#!/usr/bin/env node

/**
 * Hardy's Blog - Static Site Generator
 * 使用 Handlebars 模板和 Markdown 内容生成静态博客
 */

const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const { marked } = require('marked');
const glob = require('glob');

const CONFIG = {
  contentDir: path.join(__dirname, 'content'),
  templateDir: path.join(__dirname, 'templates'),
  outputDir: path.join(__dirname, '..'),
  dataDir: path.join(__dirname, 'data'),
};

// 确保输出目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 解析 Markdown 文件中的 Front Matter
function parseFrontMatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error('Invalid markdown format: missing front matter');
  }

  const [, frontMatterStr, markdown] = match;
  const frontMatter = {};

  frontMatterStr.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      const value = valueParts.join(':').trim();
      // 处理数组
      if (value.startsWith('[') && value.endsWith(']')) {
        frontMatter[key.trim()] = JSON.parse(value);
      } else if (value === 'true') {
        frontMatter[key.trim()] = true;
      } else if (value === 'false') {
        frontMatter[key.trim()] = false;
      } else {
        frontMatter[key.trim()] = value;
      }
    }
  });

  return {
    metadata: frontMatter,
    content: markdown.trim(),
  };
}

// 格式化日期
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// 生成文章 HTML
function generatePost(markdownFile) {
  const content = fs.readFileSync(markdownFile, 'utf-8');
  const { metadata, content: markdown } = parseFrontMatter(content);

  // 转换 Markdown 为 HTML
  const htmlContent = marked(markdown);

  // 生成输出路径
  const relativePath = path.relative(CONFIG.contentDir, markdownFile);
  const dirName = path.dirname(relativePath);
  const outputPath = path.join(CONFIG.outputDir, dirName, 'index.html');

  ensureDir(path.dirname(outputPath));

  // 加载模板
  const templatePath = path.join(CONFIG.templateDir, 'post.hbs');
  const template = Handlebars.compile(fs.readFileSync(templatePath, 'utf-8'));

  // 准备数据
  const data = {
    title: metadata.title,
    date: metadata.date,
    formattedDate: formatDate(metadata.date),
    tags: metadata.tags || [],
    tagsDisplay: (metadata.tags || []).map(tag => `<span class="tag">${tag}</span>`).join(''),
    content: htmlContent,
    postTags: (metadata.tags || []).map(tag => `<span class="post-tag">${tag}</span>`).join(''),
  };

  // 渲染模板
  const html = template(data);

  // 写入文件
  fs.writeFileSync(outputPath, html);
  console.log(`✓ Generated: ${outputPath}`);

  return {
    path: `/${dirName}/`,
    ...metadata,
    formattedDate: data.formattedDate,
  };
}

// 生成主页
function generateIndex(posts) {
  const templatePath = path.join(CONFIG.templateDir, 'index.hbs');
  const template = Handlebars.compile(fs.readFileSync(templatePath, 'utf-8'));

  // 按日期排序
  const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // 提取所有标签
  const allTags = new Set();
  posts.forEach(post => {
    if (post.tags) {
      post.tags.forEach(tag => allTags.add(tag));
    }
  });

  const data = {
    posts: sortedPosts,
    tags: Array.from(allTags).sort(),
  };

  const html = template(data);
  const outputPath = path.join(CONFIG.outputDir, 'index.html');
  fs.writeFileSync(outputPath, html);
  console.log(`✓ Generated: ${outputPath}`);
}

// 主函数
function main() {
  console.log('🚀 Starting blog generation...\n');

  try {
    // 查找所有 Markdown 文件
    const markdownFiles = glob.sync(path.join(CONFIG.contentDir, '**/*.md'));
    console.log(`Found ${markdownFiles.length} markdown files\n`);

    // 生成所有文章
    const posts = markdownFiles.map(file => generatePost(file));

    console.log(`\n✓ Generated ${posts.length} posts`);

    // 生成主页
    generateIndex(posts);

    console.log('\n✅ Blog generation completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generatePost, generateIndex, parseFrontMatter };
