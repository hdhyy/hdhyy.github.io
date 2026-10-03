const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'../..');const out=path.join(root,'_site');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out);
for(const item of fs.readdirSync(root,{withFileTypes:true})) {
 if((item.isDirectory() && (/^\d{4}$/.test(item.name)||['ai-news','archives','css','js','fancybox','images','fonts'].includes(item.name))) || (item.isFile() && /\.(html|svg|ico|xml|txt)$/.test(item.name))) fs.cpSync(path.join(root,item.name),path.join(out,item.name),{recursive:true});
}
fs.writeFileSync(path.join(out,'.nojekyll'),'');
