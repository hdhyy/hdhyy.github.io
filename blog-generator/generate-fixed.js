#!/usr/bin/env node

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

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

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

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function generatePost(markdownFile) {
  const content = fs.readFileSync(markdownFile, 'utf-8');
  const { metadata, content: markdown } = parseFrontMatter(content);

  const htmlContent = marked(markdown);

  const relativePath = path.relative(CONFIG.contentDir, markdownFile);
  const dirName = path.dirname(relativePath);
  const outputPath = path.join(CONFIG.outputDir, dirName, 'index.html');

  ensureDir(path.dirname(outputPath));

  const templatePath = path.join(CONFIG.templateDir, 'post.hbs');
  const template = Handlebars.compile(fs.readFileSync(templatePath, 'utf-8'));

  const data = {
    title: metadata.title,
    date: metadata.date,
    formattedDate: formatDate(metadata.date),
    tags: metadata.tags || [],
    tagsDisplay: (metadata.tags || []).map(tag => `<span class="tag">${tag}</span>`).join(''),
    content: htmlContent,
    postTags: (metadata.tags || []).map(tag => `<span class="post-tag">${tag}</span>`).join(''),
  };

  const html = template(data);
  fs.writeFileSync(outputPath, html);
  console.log(`✓ Generated: ${outputPath}`);

  return {
    path: `/${dirName}/`,
    id: dirName,
    ...metadata,
    formattedDate: data.formattedDate,
  };
}

function generateIndex(posts) {
  const templatePath = path.join(CONFIG.templateDir, 'index.hbs');
  const template = Handlebars.compile(fs.readFileSync(templatePath, 'utf-8'));

  const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));

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

function main() {
  console.log('🚀 Starting blog generation...\n');

  try {
    const markdownFiles = glob.sync(path.join(CONFIG.contentDir, '**/*.md'));
    console.log(`Found ${markdownFiles.length} markdown files\n`);

    const posts = markdownFiles.map(file => generatePost(file));

    console.log(`\n✓ Generated ${posts.length} posts`);

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
