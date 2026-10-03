#!/usr/bin/env node
'use strict';
// Add daily editions without regenerating or removing existing historical posts.
const fs = require('node:fs');
const path = require('node:path');
const { globSync } = require('glob');
const Handlebars = require('handlebars');
const { marked } = require('marked');
const { parseFrontMatter } = require('../generate');
function buildNews(root = path.resolve(__dirname,'../..')) {
  const generator = path.join(root,'blog-generator');
  const files = globSync('content/**/ai-news/index.md',{cwd:generator}).sort().reverse();
  if (!files.length) throw new Error('No news editions to build');
  const template = Handlebars.compile(fs.readFileSync(path.join(generator,'templates/post.hbs'),'utf8'));
  const escape = Handlebars.escapeExpression;
  const archive = [];
  const cards = files.map(file => {
    const {metadata,content} = parseFrontMatter(fs.readFileSync(path.join(generator,file),'utf8'));
    const relative = path.dirname(file).slice('content/'.length);
    if (!/^\d{4}\/\d{2}\/\d{2}\/ai-news$/.test(relative)) throw new Error('Invalid news path');
    archive.push({ date: metadata.date, title: metadata.title, path: '/' + relative + '/', backfill: (metadata.tags || []).includes('歷史補檔') });
    const output = path.join(root,relative,'index.html'); fs.mkdirSync(path.dirname(output),{recursive:true});
    const tags = metadata.tags.map(t=>`<span class="post-tag">${escape(t)}</span>`).join('');
    fs.writeFileSync(output,template({...metadata,formattedDate:metadata.date,content:marked(content),postTags:tags,tagsDisplay:tags}));
    return `<article class="post-card"><div class="post-date">${escape(metadata.date)}</div><h2 class="post-title"><a href="/${relative}/">${escape(metadata.title)}</a></h2><p class="post-summary">${escape(metadata.summary)}</p><div class="post-tags">${tags}</div></article>`;
  });
  const start='<!-- DAILY-AI-NEWS:START -->', end='<!-- DAILY-AI-NEWS:END -->';
  const block=`${start}\n<p><a href="/ai-news/">查看全部 AI 資訊日期與歷史補檔</a></p>\n${cards.join('\n')}\n${end}`;
  const indexFile=path.join(root,'index.html'); let index=fs.readFileSync(indexFile,'utf8');
  if(index.includes(start)) index=index.replace(/<!-- DAILY-AI-NEWS:START -->[\s\S]*?<!-- DAILY-AI-NEWS:END -->/,block);
  else { const anchor=/<div\b[^>]*id="postsContainer"[^>]*>/; if(!anchor.test(index)) throw new Error('Homepage post container missing'); index=index.replace(anchor,m=>`${m}\n${block}`); }
  fs.writeFileSync(indexFile,index);
  const archiveContent = '<h2>AI 資訊日期列表</h2><p>依來源日期歸檔；標示「歷史補檔」的頁面是事後整理，並非當日已發布。各頁列出日期依據與資料限制。</p><ul>' + archive.map(x => `<li><a href="${x.path}">${escape(x.date)} · ${escape(x.title)}</a>${x.backfill ? '（歷史補檔）' : ''}</li>`).join('\n') + '</ul><p><a href="/">返回首頁</a></p>';
  fs.mkdirSync(path.join(root,'ai-news'),{recursive:true});
  fs.writeFileSync(path.join(root,'ai-news/index.html'), template({title:'AI 資訊歷史列表',formattedDate:'',content:archiveContent,postTags:'',tagsDisplay:''}));
  return files.length;
}
module.exports={buildNews};
if(require.main===module) console.log(`Built ${buildNews()} news editions; historical pages preserved.`);
