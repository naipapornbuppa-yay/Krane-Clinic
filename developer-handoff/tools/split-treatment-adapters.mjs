import fs from'node:fs';import path from'node:path';import{fileURLToPath}from'node:url';import{parse}from'acorn';import assert from'node:assert/strict';
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),root=path.dirname(dir);
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const append=(id,s)=>fs.appendFileSync(path.join(dir,`pages/${id}/page.js`),'\n'+s+'\n');
assert.ok(!read('developer-handoff/pages/profile/page.js').includes('function kraneInitProfileTreatmentFolders'));
const source=read('b2c/treatment-folders.js'),ast=parse(source,{ecmaVersion:'latest'}),outer=ast.body[0].expression.callee.body;
const mount=outer.body.find(n=>n.id?.name==='mount');
const listener=mount.body.body.find(n=>n.expression?.callee?.property?.name==='addEventListener'&&n.expression.arguments[0]?.value==='treatment-record-open').expression.arguments[1];
append('treatment-detail',`/** Renders visit history when a profile treatment record opens. */\nfunction kraneRenderTreatmentVisitHistory(card,visits,select)${source.slice(listener.body.start,listener.body.end)}\n`);
let folderBody=source.slice(outer.start+1,outer.end-1);const a=listener.body.start-outer.start-1,b=listener.body.end-outer.start-1;
folderBody=folderBody.slice(0,a)+'{ kraneRenderTreatmentVisitHistory(card,visits,select); }'+folderBody.slice(b);
append('profile',`/** Once-only profile folder UI, capture listener, animation and re-entry observer. */\nfunction kraneInitProfileTreatmentFolders(){${folderBody}\n}`);
const pause=read('b2c/treatment-pause.js'),pa=parse(pause,{ecmaVersion:'latest'}).body[0].expression.callee.body;
const text=n=>pause.slice(n.start,n.end),find=name=>pa.body.find(n=>n.id?.name===name||n.type==='VariableDeclaration'&&n.declarations[0].id.name===name);
const originalFolders=find('originalFolders'),sort=find('sortFolders'),decorate=find('decorate');
append('profile',`/** Shared pause state is passed in; folder ordering/status belongs to profile. */\nfunction kraneCreateProfileProgramPresentation(isPaused,appointmentFor){\n${text(originalFolders)}\n${text(sort)}\n${text(decorate)}\nreturn {sortFolders,decorate};\n}`);
// Data and persistence identity are shared by the profile and treatment detail.
fs.writeFileSync(path.join(dir,'shared/lib/program-state.js'),`/** Prototype pause state only. The page owns modal/form rendering. */
function kraneCreateProgramPauseState(){
 const key='krane.paused-programs.v1';
 let paused={};try{paused=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch{}
 const state={key,paused};
 state.isPaused=category=>Boolean(state.paused[category] && state.paused[category].state!=='active');
 state.hasCancelledFollowup=category=>Boolean(state.paused[category]);
 state.appointmentFor=category=>!state.isPaused(category)?state.paused[category]?.appointmentAt:null;
 return state;
}\n`);
const removeNames=new Set(['key','paused','isPaused','hasCancelledFollowup','appointmentFor']);
const edits=[];
for(const n of pa.body){
 if(n.type==='VariableDeclaration'&&removeNames.has(n.declarations[0].id.name))edits.push({start:n.start,end:n.end,text:''});
 // The try following paused initializes the shared store, not page UI.
 if(n.type==='TryStatement'&&text(n).includes('localStorage.getItem(key)'))edits.push({start:n.start,end:n.end,text:''});
}
edits.push({start:originalFolders.start,end:originalFolders.end,text:'const {sortFolders,decorate}=kraneCreateProfileProgramPresentation(isPaused,appointmentFor);'});
edits.push({start:sort.start,end:sort.end,text:''},{start:decorate.start,end:decorate.end,text:''});
// Replace only remaining identifier references to the mutable store, not text.
function walk(n,parent,key){if(!n||typeof n!=='object')return;if(n.type==='Identifier'&&n.name==='paused'&&!edits.some(e=>e.start<=n.start&&e.end>=n.end))edits.push({start:n.start,end:n.end,text:'programState.paused'});for(const[k,v]of Object.entries(n)){if(['start','end'].includes(k))continue;if(Array.isArray(v))v.forEach(x=>walk(x,n,k));else if(v&&typeof v==='object')walk(v,n,k)}}walk(pa);
let pauseBody=pause.slice(pa.start+1,pa.end-1);for(const e of edits.sort((a,b)=>b.start-a.start))pauseBody=pauseBody.slice(0,e.start-pa.start-1)+e.text+pauseBody.slice(e.end-pa.start-1);
append('treatment-detail',`/** Once-only treatment detail pause/resume dialog and schedule UI. */\nfunction kraneInitTreatmentPause(){\nconst programState=kraneCreateProgramPauseState();\nconst {key,isPaused,hasCancelledFollowup,appointmentFor}=programState;\n${pauseBody}\n}`);
fs.writeFileSync(path.join(dir,'shared/adapters/treatment-folders.js'),'/* Preserve the original post-router initialization position. */\nkraneInitProfileTreatmentFolders();\n');
fs.writeFileSync(path.join(dir,'shared/adapters/treatment-pause.js'),'/* Preserve the original post-folder initialization position. */\nkraneInitTreatmentPause();\n');
const shell=path.join(dir,'shared/shell.html');fs.writeFileSync(shell,fs.readFileSync(shell,'utf8').replace('treatment-folders.js?v=20261011-program-resume','../developer-handoff/shared/adapters/treatment-folders.js').replace('treatment-pause.js?v=20261013-resume-edit','../developer-handoff/shared/adapters/treatment-pause.js'));
const m=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json')));m.libraries.push('shared/lib/program-state.js');fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(m,null,2)+'\n');
