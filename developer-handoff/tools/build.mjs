import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.dirname(dir);
const manifest=JSON.parse(await fs.readFile(path.join(dir,'manifest.json'),'utf8'));
const read=p=>fs.readFile(path.join(dir,p),'utf8');
const cssBlocks=new Map();
const pageAdditions=[];
for(const p of manifest.pages){const css=await read(p.css);const re=/\/\* @krane-css ([\w-]+) \*\/\n([\s\S]*?)\n\/\* @krane-css-end \1 \*\//g;for(const m of css.matchAll(re)){if(cssBlocks.has(m[1]))throw new Error(`Duplicate CSS block ${m[1]}`);cssBlocks.set(m[1],m[2]);}const additional=css.replace(re,'').trim();if(additional)pageAdditions.push(`/* ${p.css} additions */\n${additional}`);}
const consumedCss=new Set();
function composeCss(css){return css.replace(/\/\* @krane-css-include ([\w-]+) ([\w-]+) \*\//g,(_,page,id)=>{if(!cssBlocks.has(id))throw new Error(`Missing ${page} CSS block ${id}`);if(consumedCss.has(id))throw new Error(`Repeated CSS include ${id}`);consumedCss.add(id);return cssBlocks.get(id);});}
const outputs=new Map();
let html=await read('shared/shell.html');
for(const p of manifest.pages){const marker=`<!-- @krane-page ${p.id} -->`;if(html.split(marker).length!==2)throw new Error(`Expected exactly one ${p.id} template slot`);}
// Replacement callbacks preserve literal $ characters in authored markup.
for(const p of manifest.pages){const markup=await read(p.html);html=html.replace(`<!-- @krane-page ${p.id} -->`,()=>markup);}
for(const item of manifest.cssSources){const css=composeCss(await read(item.template));if(item.output)outputs.set(item.output,css);else html=html.replace(`/* @krane-style ${item.template} */`,()=>css);}
if(consumedCss.size!==cssBlocks.size)throw new Error('An orphan CSS block would be omitted from the build');
const scripts=[...manifest.libraries,...manifest.pages.map(p=>p.js),...(manifest.preRuntimeScripts||[]),'shared/runtime.js'];
outputs.set('b2c/krane-handoff-pages.css',pageAdditions.join('\n\n')+'\n');
html=html.replace('<!-- @krane-scripts -->',()=>'<link rel="stylesheet" href="krane-handoff-pages.css">\n'+scripts.map(src=>`<script src="../developer-handoff/${src}"></script>`).join('\n'));
if(/@krane-(?:page|scripts|style|css-include)\b/.test(html))throw new Error('Unresolved source marker');
outputs.set(manifest.output,html);
const check=process.argv.includes('--check');
for(const [file,content]of outputs){const dest=path.join(root,file);if(check){if(await fs.readFile(dest,'utf8')!==content)throw new Error(`Stale build: ${file}`);}else await fs.writeFile(dest,content);}
console.log(`${check?'Verified':'Built'} ${manifest.pages.length} page templates, ${scripts.length} JS modules, ${cssBlocks.size} scoped CSS blocks.`);
