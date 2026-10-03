#!/usr/bin/env node
'use strict';
async function getSource(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Source HTTP ${response.status}`);
  const text = await response.text();
  return { data: url.startsWith('https://hn.algolia.com/') ? JSON.parse(text) : text };
}
const cheerio = require('cheerio');
const fs = require('node:fs');
const path = require('node:path');
const aiPattern = /\b(ai|artificial intelligence|machine learning|deep learning|llm|gpt|transformers?|agents?|neural|chatgpt|claude|gemini|openai|anthropic)\b/i;
const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
const safeUrl = value => { try { const u = new URL(value); return /^https?:$/.test(u.protocol) ? u.href : null; } catch { return null; } };
const md = value => clean(value).replace(/[\\`*_{}\[\]<>]/g, '\\$&');
class AINewsCrawler {
  constructor({ now = new Date(), get = getSource } = {}) { this.now = now; this.get = get; this.warnings = []; }
  async request(url, params) { return (await this.get(`${url}?${new URLSearchParams(params)}`, { timeout: 20000 })).data; }
  async parseHackerNews() {
    const data = await this.request('https://hn.algolia.com/api/v1/search_by_date', { tags: 'story', query: 'AI', hitsPerPage: 100, numericFilters: `created_at_i>=${Math.floor(this.now.getTime()/1000)-172800}` });
    return data.hits.filter(x => aiPattern.test(x.title || '')).map(x => ({ title: clean(x.title), url: safeUrl(x.url) || `https://news.ycombinator.com/item?id=${x.objectID}`, source: 'Hacker News', date: x.created_at, score: x.points || 0, dateLabel: 'HN 提交時間' }));
  }
  async parseArXiv() {
    const xml = await this.request('https://export.arxiv.org/api/query', { search_query: 'cat:cs.AI', start: 0, max_results: 20, sortBy: 'submittedDate', sortOrder: 'descending' });
    const $ = cheerio.load(xml, { xmlMode: true });
    return $('entry').toArray().map(el => ({ title: clean($(el).find('title').text()), url: safeUrl($(el).find('id').text()), source: 'arXiv（未經同行評審）', date: $(el).find('published').text(), dateLabel: '論文首次發布時間', score: 0 }));
  }
  selectNews(items) {
    const now = this.now.getTime();
    return Array.from(new Map(items.filter(x => x.title && safeUrl(x.url) && Number.isFinite(Date.parse(x.date)) && Date.parse(x.date) <= now && Date.parse(x.date) >= now - 7*86400000).map(x => [x.url, x])).values()).sort((a,b) => (b.score-a.score) || (Date.parse(b.date)-Date.parse(a.date))).slice(0,10);
  }
  async fetchAllNews() {
    const results = await Promise.allSettled([this.parseHackerNews(), this.parseArXiv()]);
    const items = [];
    results.forEach((r,i) => { if(r.status === 'fulfilled') items.push(...r.value); else this.warnings.push(`${['Hacker News','arXiv'][i]} 本次未能取得資料`); });
    const news = this.selectNews(items);
    if (!news.length) throw new Error('No recent verifiable news found; refusing to publish an empty edition.');
    return news;
  }
  generateSummaryArticle(news) {
    const date = this.now.toISOString().slice(0,10);
    const body = news.map((x,i) => `### ${i+1}. ${md(x.title)}\n\n來源：${md(x.source)}  \n${x.dateLabel}：${new Date(x.date).toISOString()}  \n[閱讀來源](<${x.url}>)\n`).join('\n');
    return { date, filename: `${date.replaceAll('-','/')}/ai-news/index.md`, content: `---\ntitle: AI 資訊日報 - ${date}\ndate: ${date}\ntags: ["AI新聞", "日報"]\nsummary: ${news.length} 則近期 AI 資訊與研究連結；保留來源時間，供核對原文。\n---\n\n## AI 資訊日報\n\n整理時間：${this.now.toISOString()}。本期收錄 ${news.length} 則；HN 檢索最近 48 小時的提交，論文最長回看 7 天。HN 提交時間不代表原文發布時間。以下為來源標題與連結，未生成未經核實的新聞摘要。\n\n${this.warnings.length ? `資料完整性：${this.warnings.join('；')}。\n\n` : ''}${body}` };
  }
  async run(contentDir) { const existing = path.join(contentDir, this.now.toISOString().slice(0,10).replaceAll('-','/'), 'ai-news/index.md'); if (fs.existsSync(existing)) { console.log('Preserving existing daily edition'); return existing; } const article = this.generateSummaryArticle(await this.fetchAllNews()); const file = path.join(contentDir,article.filename); fs.mkdirSync(path.dirname(file),{recursive:true}); fs.writeFileSync(file,article.content); return file; }
}
module.exports = AINewsCrawler;
if (require.main === module) new AINewsCrawler().run(path.join(__dirname,'../content')).then(file => console.log(`Saved ${file}`)).catch(error => { console.error(error.message); process.exitCode=1; });
