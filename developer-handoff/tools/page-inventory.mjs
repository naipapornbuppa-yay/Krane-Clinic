/** Independent source census: starts at HTML + parsed source, not handler declarations. */
import fs from'node:fs';import path from'node:path';import{fileURLToPath}from'node:url';import{createHash}from'node:crypto';import{parse}from'acorn';import{parse as html}from'parse5';import assert from'node:assert/strict';
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),root=path.dirname(dir),read=f=>fs.readFileSync(path.join(dir,f),'utf8');
const m=JSON.parse(read('manifest.json')),ids=new Map(),attrs=new Map(),classes=new Map();
function walk(n,fn){if(!n||typeof n!=='object')return;fn(n);for(const[k,v]of Object.entries(n)){if(['loc','parentNode','sourceCodeLocation','start','end'].includes(k))continue;if(Array.isArray(v))v.forEach(x=>walk(x,fn));else if(v&&typeof v==='object')walk(v,fn)}}
function add(map,key,id){if(!map.has(key))map.set(key,new Set());map.get(key).add(id)}
const documents=new Map(m.pages.map(p=>[p.id,html(read(p.html),{sourceCodeLocationInfo:true})]));
for(const[id,doc]of documents)walk(doc,n=>{for(const a of n.attrs||[]){if(a.name==='id')ids.set(a.value,id);if(a.name.startsWith('data-'))add(attrs,a.name,id);if(a.name==='class')for(const c of a.value.split(/\s+/))add(classes,c,id)}});
function selectorOwners(n){const out=new Set();walk(n,x=>{if(x.type!=='CallExpression'||!['querySelector','querySelectorAll','closest','matches','getElementById'].includes(x.callee?.property?.name))return;const s=x.arguments[0]?.value;if(typeof s!=='string')return;const direct=[];if(x.callee.property.name==='getElementById'&&ids.has(s))direct.push(ids.get(s));for(const a of s.matchAll(/#([\w-]+)/g))if(ids.has(a[1]))direct.push(ids.get(a[1]));if(direct.length){direct.forEach(p=>out.add(p));return}for(const a of s.matchAll(/\[([\w-]+)/g))if(attrs.get(a[1])?.size===1)out.add([...attrs.get(a[1])][0]);for(const a of s.matchAll(/\.([a-zA-Z][\w-]*)/g))if(classes.get(a[1])?.size===1)out.add([...classes.get(a[1])][0]);});return[...out]}
const sharedReasons={
 activateIntakeQuestionPage:'Pagination engine reused across all intake template screens; screen is a parameter.',
 setupIntakeQuestionPages:'Template pagination and condition routing across intake screens; the intake1 special case does not make the engine page-local.',
 kraneHandle_intake_durationStep:'Same duration control is used by dynamically generated service questions and shared concern forms.',
 kraneHandle_intake_durationUnit:'Same duration control is used by dynamically generated service questions and shared concern forms.',
 setPaymentContext:'Renders shared medication totals in payment and payment-gw together; state remains authoritative in one location.',
 syncCareJourneyFill:'Updates the multi-page care stepper; OTP is one of its states.',
 redFlagSource:'Shared safety modal source resolver across authored category templates.',
 followUpNodeForCase:'Shared schedule lookup used by home banner, follow-up modal and treatment/refill flows.',
 refillCardFor:'Reusable card renderer for the shared refill sheet, sourced from treatment records and used from home/detail.',
 activateGatewayMethod:'Shared bank/card/QR control for consultation and medication gateways.',
 renderPostpaySnapshotThumbnails:'Reusable order snapshot thumbnail component across tracking and receipt/outcome views.'
};
const sources=new Map(),functions=[],residual=[];
for(const file of [...m.libraries,...m.pages.map(p=>p.js),'shared/runtime.js']){
 const source=read(file);sources.set(file,source);const ast=parse(source,{ecmaVersion:'latest',locations:true});
 for(const n of ast.body){if(n.type!=='FunctionDeclaration')continue;const owners=selectorOwners(n),row={name:n.id.name,source:file,line:n.loc.start.line,selectorOwners:owners,eventRegistrations:0,timers:0,uiWrites:0};
  walk(n,x=>{if(x.type==='CallExpression'){if(x.callee?.property?.name==='addEventListener')row.eventRegistrations++;if(['setTimeout','setInterval'].includes(x.callee?.name||x.callee?.property?.name))row.timers++;}if(x.type==='AssignmentExpression'&&['innerHTML','textContent','hidden','value','onclick','onchange'].includes(x.left?.property?.name))row.uiWrites++});functions.push(row);
  if(file.startsWith('shared/lib/')&&owners.length===1){assert.ok(sharedReasons[row.name],`Unclassified page-specific shared function: ${row.name} -> ${owners}`);residual.push({...row,reason:sharedReasons[row.name]});}
 }
}
const externalReasons={
 'shared/bootstrap-0.js':'Release redirect compatibility only.',
 '../b2c/review-tools.js':'Prototype reviewer navigation and preview tooling across screens.',
 '../krane-clinical-demo.js':'Shared browser-local clinical store/API and event transport; no production authorization.',
 '../krane-golden-fixture.js':'Shared explicit demonstration data and scenario transitions.',
 '../b2c/custom-select.js':'Reusable accessible select enhancement across all forms.',
 '../b2c/i18n.js':'Shared localization lookup and dynamic page text translation.',
 '../krane-golden-patient.js':'Shared demonstration patient-store synchronization.',
 '../b2c/assets/lucide.min.js':'Third-party icon renderer.',
 '../b2c/b2c-icons.js':'Shared icon lookup/markup helpers.',
 '../b2c/qa-session-reset.js':'Shared prototype session reset/bootstrap.',
 '../b2c/shared-view-components.js':'Reusable identity fields and payment gateway templates, parameterized by host.',
 '../b2c/article-data.js':'Shared authored article data.',
 '../b2c/article-store.js':'Shared editorial store/publishing adapter; page renderers extracted.',
 '../b2c/modal-chrome.js':'Generic dismissal, Escape and modal chrome across all dialogs.',
 'shared/adapters/articles.js':'Editorial state/update coordinator; feed/detail/capture bodies belong to their pages.',
 'shared/adapters/treatment-folders.js':'Single call into the profile initializer at original script position.',
 'shared/adapters/treatment-pause.js':'Single call into the treatment-detail initializer at original script position.',
 'shared/adapters/clinical-ui.js':'Shared clinical store subscription and common summary component across four patient screens; consult and page-specific actions extracted. Doctor-only branch is outside the 62-page B2C scope.',
 'shared/adapters/clinical-requests.js':'Shared clinical API subscription and reusable refill-sheet action; upload and notification rendering extracted. Doctor-only controls are outside B2C scope.'
};
const external=new Set(m.preRuntimeScripts||[]);
for(const a of read('shared/shell.html').matchAll(/<script[^>]*src="([^"]+)"/g))external.add(path.relative(dir,path.resolve(root,'b2c',a[1].split('?')[0])));
const externalAudit=[];for(const file of external){assert.ok(externalReasons[file],`Unreviewed loaded adapter: ${file}`);const source=read(file);sources.set(file,source);externalAudit.push({source:file,sha256:createHash('sha256').update(source).digest('hex'),reason:externalReasons[file]});}
const staticNotes={
 'payment-items':['shared-static','Shared reduce-only quantity controls and order renderer; no separate page-specific input algorithm.'],
 'empty-activities':['shared-static','Empty-state text and shared navigation.'],
 'empty-history':['shared-static','Empty-state text and shared navigation.'],
 feedbackdone:['shared-static','Static confirmation and shared navigation.'],
 'insurance-result':['unimplemented-prototype','Static prototype result with shared route links; no live eligibility engine.'],
 settings:['unimplemented-prototype','Shared language control, route links and help toasts; no settings persistence service.']
};
const pages=m.pages.map(p=>{
 const own=functions.filter(f=>f.source===p.js),classification=own.length?'owned':staticNotes[p.id]?.[0];assert.ok(classification,`Unclassified page ${p.id}`);
 const controls=[];walk(documents.get(p.id),n=>{if(!['a','button','input','select','textarea','summary'].includes(n.tagName)&&!n.attrs?.some(a=>a.name==='role'&&['button','radio','switch','tab'].includes(a.value)))return;
  const attributes=Object.fromEntries((n.attrs||[]).map(a=>[a.name,a.value]));const keys=Object.keys(attributes).filter(k=>k.startsWith('data-'));if(attributes.id)keys.push(attributes.id);
  const evidence=[...sources].flatMap(([file,s])=>{const matched=keys.filter(k=>s.includes(k));return matched.length?[{source:file,keys:matched}]:[];});
  let kind=evidence.length?'source-referenced':n.tagName==='summary'?'native-disclosure':attributes.href?'native-link':['input','select','textarea'].includes(n.tagName)?'native-field':'baseline-static-or-inert';
  if('data-go'in attributes||'data-back'in attributes)kind='shared-navigation';
  if('data-toast'in attributes)kind='prototype-toast';
  controls.push({tag:n.tagName,line:n.sourceCodeLocation?.startLine,attributes,classification:kind,evidence});
 });
 return{id:p.id,classification,note:staticNotes[p.id]?.[1]||'Page-specific functions, rendering and lifecycle are in page.js; cross-page state/services and generic components remain shared.',functions:own,controls};
});
const report={baseline:m.source.commit,pathsRelativeTo:'developer-handoff/',method:'Independent HTML control census, AST function/event/timer/write census, unique-selector residual scan and explicit audit of every loaded external script. Source references are conservative evidence, not proof that a control persists data or a complete dynamic call graph.',pages,sharedResidualExceptions:residual,externalAdapters:externalAudit};
const output=JSON.stringify(report,null,2)+'\n';if(process.argv.includes('--check'))assert.equal(read('page-ownership-inventory.json'),output,'Ownership inventory is stale');else fs.writeFileSync(path.join(dir,'page-ownership-inventory.json'),output);
console.log(JSON.stringify({pages:pages.length,owned:pages.filter(p=>p.classification==='owned').length,sharedStatic:pages.filter(p=>p.classification==='shared-static').length,unimplementedPrototype:pages.filter(p=>p.classification==='unimplemented-prototype').length,controls:pages.reduce((n,p)=>n+p.controls.length,0),sharedExceptions:residual.length,externalScripts:externalAudit.length}));
