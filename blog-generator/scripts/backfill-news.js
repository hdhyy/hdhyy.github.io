#!/usr/bin/env node
'use strict';
// Historical research uses arXiv's original Atom published field, never HN submission dates.
const fs=require('node:fs');const path=require('node:path');const cheerio=require('cheerio');
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
const evidenceLabel=e=>typeof e==='string'?e:(e?.date_text?'官方原頁或公告列表標示日期：'+e.date_text:'官方原頁發布日期');
const escape=s=>clean(s).replace(/[\\`*_{}\[\]<>]/g,'\\$&');
function validDate(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||new Date(s+'T00:00:00Z').toISOString().slice(0,10)!==s)throw Error('Invalid date: '+s);return s;}
function datesBetween(start,end){validDate(start);validDate(end);if(start>end)throw Error('Invalid range');const result=[];for(let d=new Date(start+'T00:00:00Z');d<=new Date(end+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+1)){result.push(d.toISOString().slice(0,10));if(result.length>366)throw Error('Range too large');}return result;}
function parsePapers(xml,date){const $=cheerio.load(xml,{xmlMode:true});return $('entry').toArray().map(el=>{const url=$(el).find('link[rel="alternate"]').attr('href')||$(el).find('id').text();return {title:clean($(el).find('title').text()),url:url.replace(/^http:/,'https:'),published:$(el).find('published').text(),source:'arXiv',dateEvidence:'arXiv Atom published（首版提交時間）'};}).filter(x=>x.title&&/^https:\/\/arxiv.org\/abs\//.test(x.url)&&x.published.slice(0,10)===date).slice(0,3);}
function article(date,items,failures=[],retrievedAt=new Date().toISOString()){
 const entries=items.map((x,i)=>`### ${i+1}. ${escape(x.title)}\n\n來源：${escape(x.source)}\n\n來源時間：${escape(x.published)}（${escape(evidenceLabel(x.dateEvidence||x.evidence))}）\n\n[閱讀原始來源](<${x.url}>)${x.evidenceUrl ? `\n\n[核對官方日期列表](<${x.evidenceUrl}>)` : ''}\n`).join('\n');
 return `---\ntitle: AI 歷史資訊 - ${date}\ndate: ${date}\ntags: ["AI新聞", "歷史補檔"]\nsummary: 歷史補檔：${items.length} 則可核對來源日期的 AI 公告與研究；非當日即時發布。\n---\n\n## ${date} AI 歷史資訊\n\n本頁於 ${retrievedAt.slice(0,10)} 補建，整理的是 ${date} 的來源紀錄，並非聲稱當天已發布本頁。只列標題與來源連結，未生成或推測研究結論。\n\n日期依據：官方公告以原頁發布日期歸檔；研究以 arXiv API 的 published 首版提交時間（UTC）歸檔，不等同於網站公告上線時間。arXiv 預印本未經同行評審。沒有使用 Hacker News 轉貼時間替代來源日期。所列為可核對的選錄，不是完整新聞清單或重要性排名。\n\n${failures.length?`資料限制：${failures.map(escape).join('；')}。\n\n`:''}${items.length?entries:'此日目前沒有取得可核對來源日期的資料，因此保留空檔說明，不以其他日期的消息填補。\n'}\n[返回 AI 資訊歷史列表](/ai-news/)\n`;
}
async function run({start,end,root=path.resolve(__dirname,'../..'),announcements=[]}){
 const today=new Date().toISOString().slice(0,10);if(end>=today)throw Error('Backfill must end before today');
 const results=[];
 for(const date of datesBetween(start,end)){
  const file=path.join(root,'blog-generator/content',date.replaceAll('-','/'),'ai-news/index.md');
  if(fs.existsSync(file)){results.push({date,status:'preserved'});console.log(date+' preserved');continue;}
  const query=`cat:cs.AI AND submittedDate:[${date.replaceAll('-','')}0000 TO ${date.replaceAll('-','')}2359]`;
  const api='https://export.arxiv.org/api/query?'+new URLSearchParams({search_query:query,start:'0',max_results:'6',sortBy:'submittedDate',sortOrder:'descending'});
  let papers=[],failures=[];
  try{const r=await fetch(api,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('HTTP '+r.status);papers=parsePapers(await r.text(),date);}catch(e){failures.push('本次未能取得 arXiv 歷史資料');console.error(date,e.message);}
  const official=announcements.filter(x=>x.published.slice(0,10)===date && /^https:\/\//.test(x.url)).map(x=>({...x,dateEvidence:evidenceLabel(x.dateEvidence||x.evidence)}));
  const items=[...official,...papers];const retrievedAt=new Date().toISOString();
  fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,article(date,items,failures,retrievedAt));
  const audit=path.join(root,'blog-generator/data/backfill',date+'.json');fs.mkdirSync(path.dirname(audit),{recursive:true});fs.writeFileSync(audit,JSON.stringify({date,retrievedAt,api,items,failures},null,2)+'\n');
  results.push({date,status:'created',items:items.length,official:official.length,research:papers.length,failures});console.log(date+' '+items.length+' verified items');
  await new Promise(r=>setTimeout(r,3100));
 }
 return results;
}
module.exports={validDate,datesBetween,parsePapers,article,run};
if(require.main===module){const [start,end,announcementsFile]=process.argv.slice(2);const announcements=announcementsFile?JSON.parse(fs.readFileSync(announcementsFile,'utf8')):[];run({start,end,announcements}).then(r=>console.log(JSON.stringify(r))).catch(e=>{console.error(e);process.exitCode=1;});}
