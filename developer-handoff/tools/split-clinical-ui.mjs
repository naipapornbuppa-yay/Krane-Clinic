import fs from'node:fs';import path from'node:path';import{fileURLToPath}from'node:url';import{parse}from'acorn';import assert from'node:assert/strict';
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),root=path.dirname(dir);
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const append=(id,s)=>fs.appendFileSync(path.join(dir,`pages/${id}/page.js`),'\n'+s+'\n');
assert.ok(!read('developer-handoff/pages/upload-rx/page.js').includes('kraneInitPrescriptionUpload'));
const source=read('krane-clinical-requests.js'),ast=parse(source,{ecmaVersion:'latest'}),body=ast.body[0].expression.callee.body.body;
const render=body.find(n=>n.id?.name==='render');
append('notifications',`/** Request-list renderer, using the shared clinical store; no transport here. */\nfunction kraneRenderClinicalRequests(api,el)${source.slice(render.body.start,render.body.end)}\n`);
const patient=body.find(n=>n.type==='IfStatement'&&source.slice(n.test.start,n.test.end).includes("api.role==='patient'"));
const uploadNodes=patient.consequent.body.slice(0,2);assert.equal(uploadNodes[0].declarations[0].id.name,'upload');
append('upload-rx',`/** Baseline prototype upload validation and browser-local request submission. */\nfunction kraneInitPrescriptionUpload(api,el){\n${source.slice(uploadNodes[0].start,uploadNodes[1].end)}\n}`);
let adapted=source;for(const e of [{start:render.body.start,end:render.body.end,text:'{ return kraneRenderClinicalRequests(api,el); }'},{start:uploadNodes[0].start,end:uploadNodes[1].end,text:'kraneInitPrescriptionUpload(api,el);'}].sort((a,b)=>b.start-a.start))adapted=adapted.slice(0,e.start)+e.text+adapted.slice(e.end);
fs.writeFileSync(path.join(dir,'shared/adapters/clinical-requests.js'),adapted);
const ui=read('krane-clinical-ui.js'),ua=parse(ui,{ecmaVersion:'latest'}),ub=ua.body[0].expression.callee.body.body,ur=ub.find(n=>n.id?.name==='render');
const edits=[];
const threadIndex=ur.body.body.findIndex(n=>n.type==='VariableDeclaration'&&n.declarations[0].id.name==='thread');
const thread=ur.body.body.slice(threadIndex,threadIndex+2);
append('consult',`/** Consultation message rendering; shared clinical store remains central. */\nfunction kraneRenderClinicalMessages(api,doctor,node,c,messages){\n${ui.slice(thread[0].start,thread[1].end)}\n}`);
edits.push({start:thread[0].start,end:thread[1].end,text:'kraneRenderClinicalMessages(api,doctor,node,c,messages);'});
function walk(n){if(!n||typeof n!=='object')return;if(n.type==='IfStatement'){
 const t=ui.slice(n.test.start,n.test.end);let id,name;if(t.startsWith("key==='plan'")){id='rx-plan';name='kraneAppendAcceptPlanAction';}if(t.startsWith("key==='document'")){id='my-documents';name='kraneAppendPrescriptionDownload';}
 if(name){append(id,`/** Page-specific clinical action; common plan summary is shared. */\nfunction ${name}(el,node,c,plan)${ui.slice(n.consequent.start,n.consequent.end)}\n`);edits.push({start:n.consequent.start,end:n.consequent.end,text:`{ ${name}(el,node,c,plan); }`});return;}
 }for(const[k,v]of Object.entries(n)){if(['start','end'].includes(k))continue;if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v)}}walk(ur);
adapted=ui;for(const e of edits.sort((a,b)=>b.start-a.start))adapted=adapted.slice(0,e.start)+e.text+adapted.slice(e.end);
fs.writeFileSync(path.join(dir,'shared/adapters/clinical-ui.js'),adapted);
const shell=path.join(dir,'shared/shell.html');fs.writeFileSync(shell,fs.readFileSync(shell,'utf8').replace('../krane-clinical-ui.js?v=20261012-sync','../developer-handoff/shared/adapters/clinical-ui.js').replace('../krane-clinical-requests.js?v=20261012-sync','../developer-handoff/shared/adapters/clinical-requests.js'));
