/** One-time migration utility. Run only into an EMPTY output directory. */
import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse as parseHtml} from 'parse5';
import {parse as parseJs} from 'acorn';
import postcss from 'postcss';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=path.join(root,'developer-handoff');
try { await fs.access(path.join(out,'manifest.json')); throw new Error('Refusing to overwrite an existing handoff. Edit source modules and run build instead.'); } catch(e) { if(e.code!=='ENOENT')throw e; }
const inputPath='b2c/krane-b2c.html';
const html=await fs.readFile(path.join(root,inputPath),'utf8');
const doc=parseHtml(html,{sourceCodeLocationInfo:true});
const walk=(node,fn)=>{fn(node); for(const child of node.childNodes||[])walk(child,fn);};
const attr=(node,key)=>node.attrs?.find(a=>a.name===key)?.value;
const screens=[];const inline=[];const styles=[];
walk(doc,n=>{if(n.tagName==='section'&&(attr(n,'class')||'').split(/\s+/).includes('screen')&&attr(n,'id'))screens.push(n);if(n.tagName==='script'&&!attr(n,'src'))inline.push(n);if(n.tagName==='style')styles.push(n);});
const ids=screens.map(n=>attr(n,'id'));
const elementOwner=new Map();
for(const s of screens)walk(s,n=>{if(attr(n,'id'))elementOwner.set(attr(n,'id'),attr(s,'id'));});
const pages=Object.fromEntries(ids.map(id=>[id,{id,html:`pages/${id}/index.html`,js:`pages/${id}/page.js`,css:`pages/${id}/page.css`,functions:[],initializers:[],dependencies:[],cssBlocks:[],sourceLine:0}]));
const write=async(p,s)=>{await fs.mkdir(path.dirname(path.join(out,p)),{recursive:true});await fs.writeFile(path.join(out,p),s);};
const edits=[];
for(const s of screens){const id=attr(s,'id'),l=s.sourceCodeLocation;pages[id].sourceLine=l.startLine;await write(pages[id].html,html.slice(l.startOffset,l.endOffset));edits.push({start:l.startOffset,end:l.endOffset,text:`<!-- @krane-page ${id} -->`});}
const main=inline.reduce((a,b)=>(b.sourceCodeLocation.endOffset-b.sourceCodeLocation.startOffset)>(a.sourceCodeLocation.endOffset-a.sourceCodeLocation.startOffset)?b:a);
const ml=main.sourceCodeLocation;const js=html.slice(ml.startTag.endOffset,ml.endTag.startOffset);
const ast=parseJs(js,{ecmaVersion:'latest',sourceType:'script',locations:true});
const jsWalk=(n,fn)=>{if(!n||typeof n!=='object')return;fn(n);for(const [k,v]of Object.entries(n)){if(['loc','start','end'].includes(k))continue;if(Array.isArray(v))for(const a of v)jsWalk(a,fn);else if(v&&typeof v==='object')jsWalk(v,fn);}};
function owners(n){const dom=new Set(),routes=new Set();jsWalk(n,x=>{if(x.type==='Literal'&&typeof x.value==='string'){if(elementOwner.has(x.value))routes.add(elementOwner.get(x.value));for(const m of x.value.matchAll(/#([A-Za-z][\w-]*)/g))if(elementOwner.has(m[1]))dom.add(elementOwner.get(m[1]));}if(x.type==='CallExpression'&&['getElementById'].includes(x.callee?.property?.name)){const a=x.arguments[0]?.value;if(elementOwner.has(a))dom.add(elementOwner.get(a));}});return {dom:[...dom],routes:[...routes]};}
const alwaysShared=new Set(['show','applyHash','requiredRouteFor','normalizeScreenTarget','persistFlowState','readSessionJson','writeSessionJson','seededHistory','guardActiveCase','renderIntakeQuestions','setSelectedCategory','selectedCategory','selectedCondition','showActionToast','syncThemeColor']);
function domain(name){if(/^(?:show|applyHash|requiredRouteFor|normalizeScreenTarget|seededHistory|guardActiveCase|syncThemeColor)$/.test(name))return 'navigation';if(/intake|category|condition|consent|partner|obesity|draft/i.test(name))return 'intake';if(/address|district|province|postal|osm|geo/i.test(name))return 'address';if(/payment|order|checkout|delivery|promo|price|cart|prescription/i.test(name))return 'orders';if(/otp|auth|login|password|phone|account|profile/i.test(name))return 'identity';if(/clinical|consult|appointment|queue|doctor|tracking|document|csat/i.test(name))return 'clinical';return 'ui';}
const buckets=new Map();const metadata=[];const runtimeEdits=[];let previous=0;
function add(file,code){buckets.set(file,(buckets.get(file)||'')+code+'\n');}
for(const [i,node]of ast.body.entries()){
 const code=js.slice(previous,node.end);const actual=js.slice(node.start,node.end);const o=owners(node);const page=o.dom.length===1?o.dom[0]:(!o.dom.length&&o.routes.length===1?o.routes[0]:null);
 if(node.type==='FunctionDeclaration'){
  const name=node.id.name;const owner=alwaysShared.has(name)?null:page;const file=owner?pages[owner].js:`shared/lib/${domain(name)}.js`;
  add(file,code);if(owner)pages[owner].functions.push(name);
  metadata.push({kind:'function',name,file,sourceLine:ml.startTag.endLine+node.loc.start.line-1,screenReferences:o,originalStart:node.start,originalEnd:node.end});
  runtimeEdits.push({start:previous,end:node.end,text:`\n/* ${name}: ${file} */\n`});
 }else if(page&&node.type==='ExpressionStatement'&&node.expression?.type!=='Literal'){
  const name=`kraneInit_${page.replaceAll('-','_')}_${i}`;const file=pages[page].js;
  add(file,`\n/** Initialization is called by shared/runtime.js at the original dependency-safe position. */\nfunction ${name}(){${code}\n}\n`);
  pages[page].initializers.push(name);
  metadata.push({kind:'initializer',name,file,sourceLine:ml.startTag.endLine+node.loc.start.line-1,screenReferences:o,originalStart:node.start,originalEnd:node.end});
  runtimeEdits.push({start:previous,end:node.end,text:`\n${name}();\n`});
 }
 previous=node.end;
}
const replace=(s,changes)=>changes.sort((a,b)=>b.start-a.start).reduce((s,c)=>s.slice(0,c.start)+c.text+s.slice(c.end),s);
await write('shared/runtime.js',replace(js,runtimeEdits));
for(const [file,code]of buckets)await write(file,`/* Shared lexical runtime: load through the handoff build; see DEPENDENCIES.md. */\n${code}`);
for(const id of ids){if(!buckets.has(pages[id].js))await write(pages[id].js,`/* ${id}: behavior is supplied by shared libraries. No duplicate per-page implementation.\n * Add page-owned functions here; shared/runtime.js owns ordered initialization.\n */\n`);}
// Exact cross-module global references. Conservative by design; includes potential reads/writes.
const globals=new Map();
for(const n of ast.body){if(n.type==='FunctionDeclaration')globals.set(n.id.name,metadata.find(m=>m.name===n.id.name)?.file||'shared/runtime.js');if(n.type==='VariableDeclaration')for(const d of n.declarations){if(d.id.type==='Identifier')globals.set(d.id.name,'shared/runtime.js');}}
for(const id of ids){const code=await fs.readFile(path.join(out,pages[id].js),'utf8');const node=parseJs(code,{ecmaVersion:'latest'});const deps=new Set();jsWalk(node,n=>{if(n.type==='Identifier'&&globals.has(n.name)&&globals.get(n.name)!==pages[id].js)deps.add(n.name);});pages[id].dependencies=[...deps].sort();}
const libraries=[...buckets.keys()].filter(f=>f.startsWith('shared/lib/')).sort();
edits.push({start:ml.startOffset,end:ml.endOffset,text:'<!-- @krane-scripts -->'});
// Extract other inline scripts into shared bootstrap files without changing their original position.
for(const [i,n]of inline.entries()){if(n===main)continue;const l=n.sourceCodeLocation;const file=`shared/bootstrap-${i}.js`;await write(file,html.slice(l.startTag.endOffset,l.endTag.startOffset));edits.push({start:l.startOffset,end:l.endOffset,text:`<script src="../developer-handoff/${file}"></script>`});}
const cssSources=[];const cssPageBlocks=Object.fromEntries(ids.map(id=>[id,[]]));let blockSeq=0;
function cssOwner(node){const refs=new Set();let eligible=true;const inspect=r=>{if(r.type!=='rule')return;for(const selector of r.selectors||[]){const hits=[...selector.matchAll(/#([A-Za-z][\w-]*)/g)].map(m=>elementOwner.get(m[1])).filter(Boolean);if(!hits.length){eligible=false;return;}hits.forEach(x=>refs.add(x));}};if(node.type==='rule')inspect(node);else if(node.type==='atrule')node.walkRules(inspect);else return null;return eligible&&refs.size===1?[...refs][0]:null;}
async function splitCss(key,css,output){const parsed=postcss.parse(css);const changes=[];for(const n of parsed.nodes){const owner=cssOwner(n);if(!owner)continue;const start=n.source.start.offset,end=n.source.end.offset+1;const id=`css-${String(++blockSeq).padStart(4,'0')}`;cssPageBlocks[owner].push(`/* @krane-css ${id} */\n${css.slice(start,end)}\n/* @krane-css-end ${id} */`);pages[owner].cssBlocks.push(id);changes.push({start,end,text:`/* @krane-css-include ${owner} ${id} */`});}const template=`shared/styles/${key}.css`;await write(template,replace(css,changes));cssSources.push({template,output});return template;}
for(const [i,n]of styles.entries()){const l=n.sourceCodeLocation;const template=await splitCss(`inline-${i}`,html.slice(l.startTag.endOffset,l.endTag.startOffset),null);edits.push({start:l.startTag.endOffset,end:l.endTag.startOffset,text:`/* @krane-style ${template} */`});}
// components.css is the screen/component owner; all other existing central assets remain reused.
await splitCss('components',await fs.readFile(path.join(root,'b2c/components.css'),'utf8'),'b2c/krane-handoff-components.css');
for(const id of ids)await write(pages[id].css,`/* Page-owned CSS. The build preserves original cascade positions.\n * Shared tokens/primitives: b2c/design-tokens.css and shared/styles/components.css. */\n${cssPageBlocks[id].join('\n\n')}\n`);
const componentsHref=html.match(/<link[^>]+href="(components\.css[^"]*)"/)[1];
let shell=replace(html,edits).replace(`href="${componentsHref}"`,'href="krane-handoff-components.css"');
await write('shared/shell.html',shell);
await write('manifest.json',JSON.stringify({version:1,source:{commit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),path:inputPath,componentsHref},output:'b2c/krane-b2c-handoff.html',libraries,pages:Object.values(pages),cssSources,functions:metadata},null,2)+'\n');
console.log(JSON.stringify({screens:ids.length,functions:metadata.filter(m=>m.kind==='function').length,pageFunctions:Object.values(pages).reduce((n,p)=>n+p.functions.length,0),pageInitializers:Object.values(pages).reduce((n,p)=>n+p.initializers.length,0),cssBlocks:blockSeq},null,2));
