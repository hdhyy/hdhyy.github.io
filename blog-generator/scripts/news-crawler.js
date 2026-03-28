#!/usr/bin/env node

/**
 * AI 新闻爬虫与总结发布系统
 * 每天自动抓取 AI 领域的 Top 10 新闻并发布总结文章
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class AINewsCrawler {
  constructor() {
    this.newsAPIs = [
      {
        name: 'HackerNews',
        url: 'https://hacker-news.firebaseio.com/v0',
        parser: this.parseHackerNews.bind(this)
      },
      {
        name: 'ArXiv',
        url: 'http://export.arxiv.org/api/query',
        parser: this.parseArXiv.bind(this)
      }
    ];
  }

  // 从 HackerNews 获取 AI 相关新闻
  async parseHackerNews() {
    try {
      // 获取最新的 story IDs
      const topStoriesRes = await axios.get(`${this.newsAPIs[0].url}/topstories.json`);
      const topStoryIds = topStoriesRes.data.slice(0, 30);

      const stories = [];
      for (const id of topStoryIds.slice(0, 10)) {
        const storyRes = await axios.get(`${this.newsAPIs[0].url}/item/${id}.json`);
        const story = storyRes.data;
        
        // 筛选 AI 相关的新闻
        if (story && story.title && this.isAIRelated(story.title)) {
          stories.push({
            title: story.title,
            url: story.url || `https://news.ycombinator.com/item?id=${id}`,
            source: 'HackerNews',
            score: story.score || 0,
            date: new Date(story.time * 1000).toISOString()
          });
        }
      }
      return stories;
    } catch (error) {
      console.error('Error fetching from HackerNews:', error.message);
      return [];
    }
  }

  // 从 ArXiv 获取 AI 论文
  async parseArXiv() {
    try {
      const response = await axios.get(this.newsAPIs[1].url, {
        params: {
          search_query: 'cat:cs.AI AND submittedDate:[202603010000 TO 202603312359]',
          start: 0,
          max_results: 10,
          sortBy: 'submittedDate',
          sortOrder: 'descending'
        }
      });

      const papers = [];
      const entries = response.data.match(/<entry>[\s\S]*?<\/entry>/g) || [];
      
      entries.forEach(entry => {
        const titleMatch = entry.match(/<title>([^<]+)<\/title>/);
        const linkMatch = entry.match(/<link href="([^"]+)" rel="alternate"/);
        const summaryMatch = entry.match(/<summary>([^<]+)<\/summary>/);

        if (titleMatch && linkMatch) {
          papers.push({
            title: titleMatch[1],
            url: linkMatch[1],
            source: 'ArXiv',
            summary: summaryMatch ? summaryMatch[1] : '',
            date: new Date().toISOString()
          });
        }
      });

      return papers;
    } catch (error) {
      console.error('Error fetching from ArXiv:', error.message);
      return [];
    }
  }

  // 判断是否与 AI 相关
  isAIRelated(text) {
    const aiKeywords = [
      'AI', 'artificial intelligence', 'machine learning', 'deep learning',
      'neural network', 'LLM', 'GPT', 'transformer', 'agent', 'model',
      'algorithm', 'data science', 'NLP', 'computer vision', 'reinforcement learning'
    ];
    
    const lowerText = text.toLowerCase();
    return aiKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
  }

  // 获取所有新闻
  async fetchAllNews() {
    console.log('🔍 Fetching AI news from multiple sources...\n');
    
    let allNews = [];
    
    // 从 HackerNews 获取
    const hackerNewsStories = await this.parseHackerNews();
    allNews = allNews.concat(hackerNewsStories);
    
    // 从 ArXiv 获取
    const arxivPapers = await this.parseArXiv();
    allNews = allNews.concat(arxivPapers);

    // 去重并排序
    const uniqueNews = Array.from(
      new Map(allNews.map(item => [item.title, item])).values()
    );
    
    const sortedNews = uniqueNews
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 10);

    return sortedNews;
  }

  // 生成总结文章
  generateSummaryArticle(news) {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const formattedDate = today.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    let newsContent = '';
    news.forEach((item, index) => {
      newsContent += `\n### ${index + 1}. ${item.title}\n\n`;
      newsContent += `**来源**: ${item.source}  \n`;
      newsContent += `**链接**: [阅读原文](${item.url})\n\n`;
      if (item.summary) {
        newsContent += `**摘要**: ${item.summary}\n\n`;
      }
    });

    const content = `---
title: AI 新闻周报 - ${formattedDate}
date: ${dateStr}
tags: ["AI新闻", "周报", "行业动态"]
summary: 本周 AI 领域的重要新闻和研究进展总结。涵盖大语言模型、机器学习、计算机视觉等多个领域的最新动态。
---

## 本周 AI 新闻 Top 10

本周为您精选了 AI 领域最重要的 10 条新闻和研究进展。
${newsContent}

## 总体趋势

本周 AI 领域的主要趋势包括：

1. **大语言模型的持续演进** - 各大公司继续推出更强大的语言模型
2. **多模态 AI 的应用拓展** - 视觉-语言模型在更多领域得到应用
3. **AI 安全与伦理的重视** - 业界对 AI 安全性的关注度持续提升
4. **边缘计算与 AI 的结合** - 轻量级模型在移动设备上的应用增加
5. **开源 AI 工具的繁荣** - 越来越多高质量的开源 AI 项目涌现

## 推荐阅读

- 关注最新的 ArXiv 论文发布
- 订阅主要 AI 研究机构的博客
- 参与 AI 社区的讨论和分享

---

**下期预告**: 下周我们将继续为您带来 AI 领域的最新动态和深度分析。
`;

    return {
      filename: `ai-news-${dateStr}.md`,
      content: content,
      date: dateStr
    };
  }

  // 保存文章
  saveArticle(article, contentDir) {
    const filepath = path.join(contentDir, article.filename);
    fs.writeFileSync(filepath, article.content);
    console.log(`✓ Saved: ${article.filename}`);
    return filepath;
  }

  // 主流程
  async run(contentDir) {
    try {
      const news = await this.fetchAllNews();
      
      if (news.length === 0) {
        console.log('⚠️  No AI news found today');
        return null;
      }

      console.log(`✓ Found ${news.length} AI news items\n`);
      
      const article = this.generateSummaryArticle(news);
      const filepath = this.saveArticle(article, contentDir);
      
      console.log(`\n✅ AI news summary published!`);
      return filepath;
    } catch (error) {
      console.error('❌ Error:', error.message);
      return null;
    }
  }
}

// 导出爬虫类
module.exports = AINewsCrawler;

// 如果直接运行此文件
if (require.main === module) {
  const crawler = new AINewsCrawler();
  const contentDir = path.join(__dirname, '../content');
  
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }

  crawler.run(contentDir);
}
