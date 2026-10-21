/** One-time migration refinement; source files are the editing surface after migration. */
import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath}from'node:url';import{parse}from'acorn';import{parse as htmlParse}from'parse5';
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const m=JSON.parse(await fs.readFile(path.join(dir,'manifest.json'),'utf8'));
if(m.refinementVersion)throw new Error('Ownership refinement has already run. Edit page modules instead.');
const attrs=new Map(),classes=new Map(),ids=new Map(),bindings=new Map();
const add=(map,key,p)=>{if(!map.has(key))map.set(key,new Set());map.get(key).add(p);};
function walk(n,fn){if(!n||typeof n!=='object')return;fn(n);for(const[k,v]of Object.entries(n)){if(['loc','parentNode','sourceCodeLocation'].includes(k))continue;if(Array.isArray(v))v.forEach(x=>walk(x,fn));else if(v&&typeof v==='object')walk(v,fn);}}
for(const p of m.pages){const doc=htmlParse(await fs.readFile(path.join(dir,p.html),'utf8'));walk(doc,n=>{for(const a of n.attrs||[]){if(a.name==='id')ids.set(a.value,p.id);if(a.name==='class')for(const c of a.value.split(/\s+/))add(classes,c,p.id);if(a.name.startsWith('data-'))add(attrs,a.name,p.id);}});}
function selectors(s){const out=new Set();for(const a of s.matchAll(/#([\w-]+)/g))if(ids.has(a[1]))out.add(ids.get(a[1]));if(out.size)return out;for(const a of s.matchAll(/\[([\w-]+)/g)){const owners=attrs.get(a[1]);if(owners?.size===1)out.add([...owners][0]);}for(const a of s.matchAll(/\.([a-zA-Z][\w-]*)/g)){const owners=classes.get(a[1]);if(owners?.size===1)out.add([...owners][0]);}return out;}
function owners(n){const out=new Set();walk(n,x=>{if(x.type==='CallExpression'&&['querySelector','querySelectorAll','closest','matches','getElementById'].includes(x.callee?.property?.name)){const s=x.arguments[0]?.value;if(typeof s==='string'){if(x.callee.property.name==='getElementById'&&ids.has(s))out.add(ids.get(s));else for(const v of selectors(s))out.add(v);}}if(x.type==='Identifier'&&bindings.has(x.name))for(const v of bindings.get(x.name))out.add(v);});return out;}
const runtimePath=path.join(dir,'shared/runtime.js');let runtime=await fs.readFile(runtimePath,'utf8');const ast=parse(runtime,{ecmaVersion:'latest',locations:true});
for(let i=0;i<4;i++)for(const n of ast.body)if(n.type==='VariableDeclaration')for(const d of n.declarations)if(d.id.type==='Identifier'&&d.init){const own=owners(d.init);if(own.size===1)bindings.set(d.id.name,own);}
let count=0;const edits=[];
for(const [i,n]of ast.body.entries()){
 if(!['ExpressionStatement','IfStatement','ForStatement','ForOfStatement','ForInStatement','BlockStatement'].includes(n.type))continue;
 let unsafe=false;function check(x){if(!x||typeof x!=='object')return;if(/Function/.test(x.type))return;if(x.type==='VariableDeclaration'&&x.kind==='var')unsafe=true;for(const[k,v]of Object.entries(x)){if(k==='loc')continue;if(Array.isArray(v))v.forEach(check);else if(v&&typeof v==='object')check(v);}}check(n);if(unsafe)continue;
 const own=owners(n);if(own.size!==1)continue;const id=[...own][0];const p=m.pages.find(p=>p.id===id);const name=`kraneInit_${id.replaceAll('-','_')}_owned_${i}`;const code=runtime.slice(n.start,n.end);
 await fs.appendFile(path.join(dir,p.js),`\n/** Page-owned initialization; invoked once at its original position by shared/runtime.js. */\nfunction ${name}(){\n${code}\n}\n`);p.initializers.push(name);m.functions.push({kind:'initializer',name,file:p.js,runtimeLine:n.loc.start.line,screenReferences:{dom:[id]},migration:'ownership-refinement'});edits.push({start:n.start,end:n.end,text:`${name}();`});count++;
}
for(const e of edits.sort((a,b)=>b.start-a.start))runtime=runtime.slice(0,e.start)+e.text+runtime.slice(e.end);await fs.writeFile(runtimePath,runtime);
// Move category-authored question sets into one central factory, called at the original point.
const fresh=parse(runtime,{ecmaVersion:'latest'});const data=fresh.body.find(n=>n.type==='VariableDeclaration'&&n.declarations.some(d=>d.id.name==='intakeTemplates'));
if(data){const init=data.declarations.find(d=>d.id.name==='intakeTemplates').init;const factory='shared/lib/intake-templates.js';await fs.writeFile(path.join(dir,factory),`/* Service-specific question templates. Shared by intake1–intake4.\n * This is the single source for authored question order and category content. */\nfunction kraneCreateIntakeTemplates(){\n return ${runtime.slice(init.start,init.end)};\n}\n`);runtime=runtime.slice(0,init.start)+'kraneCreateIntakeTemplates()'+runtime.slice(init.end);await fs.writeFile(runtimePath,runtime);m.libraries.push(factory);}
m.refinementVersion=1;
await fs.writeFile(path.join(dir,'manifest.json'),JSON.stringify(m,null,2)+'\n');console.log(`Moved ${count} additional page-owned initializers; extracted shared category template factory.`);
