/** One-time, checked extraction from 52d8aac. Never rerun on an edited handoff. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse} from 'acorn';
import assert from 'node:assert/strict';
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(dir,f),'utf8');
const write=(f,s)=>fs.writeFileSync(path.join(dir,f),s);
const manifest=JSON.parse(read('manifest.json'));
assert.ok(!manifest.lifecycleOwnershipVersion,'Already migrated');
const ownership=JSON.parse(read('handler-ownership.json'));
const records=[];
const walk=(n,fn,skipFunctions=false)=>{if(!n||typeof n!=='object')return;if(skipFunctions&&/Function/.test(n.type))return;fn(n);for(const[k,v]of Object.entries(n)){if(['loc','start','end'].includes(k))continue;if(Array.isArray(v))v.forEach(x=>walk(x,fn,skipFunctions));else if(v&&typeof v==='object')walk(v,fn,skipFunctions);}};
const append=(id,code)=>fs.appendFileSync(path.join(dir,`pages/${id}/page.js`),'\n'+code+'\n');
let sequence=0;
function process(file,select){
 const source=read(file),ast=parse(source,{ecmaVersion:'latest',locations:true}),edits=[];
 const hooks={
  branch(n,id,params=[]){
   const name=`kraneHandle_${id.replaceAll('-','_')}_lifecycle_${++sequence}`;
   let body=source.slice(n.consequent.start,n.consequent.end),offset=n.consequent.start;
   const returns=[];walk(n.consequent,x=>{if(x.type==='ReturnStatement'){assert.equal(x.argument,null);returns.push(x);}},true);
   for(const r of returns.sort((a,b)=>b.start-a.start))body=body.slice(0,r.start-offset)+'return true;'+body.slice(r.end-offset);
   if(n.consequent.type==='BlockStatement')body=body.slice(1,-1);
   append(id,`/** Activation/event branch; called in its original order by ${file}. */\nfunction ${name}(${params.join(',')}){\n${body}\nreturn false;\n}`);
   edits.push({start:n.consequent.start,end:n.consequent.end,text:`{ if (${name}(${params.join(',')})) return; }`});
   const record={kind:'branch',name,owner:`pages/${id}/page.js`,dispatch:file,sourceLine:n.loc.start.line,condition:source.slice(n.test.start,n.test.end),params,originalBodyType:n.consequent.type,selectors:[],baseline:'52d8aac'};
   ownership.handlers.push(record);records.push(record);
  },
  statements(nodes,id,params=[]){
   const name=`kraneRoute_${id.replaceAll('-','_')}_${++sequence}`;
   const start=nodes[0].start,end=nodes.at(-1).end,body=source.slice(start,end);
   let outerReturn=false;for(const n of nodes)walk(n,x=>{if(x.type==='ReturnStatement')outerReturn=true;},true);assert.ok(!outerReturn,'Statement hook cannot swallow a return');
   append(id,`/** Route lifecycle, including cleanup on exit/re-entry. Invoked at the original router position. */\nfunction ${name}(${params.join(',')}){\n${body}\n}`);
   edits.push({start,end,text:`${name}(${params.join(',')});`});
   const record={kind:'statements',name,owner:`pages/${id}/page.js`,dispatch:file,params,sourceLine:nodes[0].loc.start.line,baseline:'52d8aac'};records.push(record);
  }
 };
 select(ast,hooks,source);
 for(const e of edits.sort((a,b)=>b.start-a.start)){
  assert.ok(!edits.some(x=>x!==e&&x.start>e.start&&x.start<e.end),'Overlapping extraction');
 }
 let result=source;for(const e of edits.sort((a,b)=>b.start-a.start))result=result.slice(0,e.start)+e.text+result.slice(e.end);
 write(file,result);
}
process('shared/lib/navigation.js',(ast,h,s)=>{
 const show=ast.body.find(n=>n.id?.name==='show'),body=show.body.body;
 const pos=prefix=>{const i=body.findIndex(n=>s.slice(n.start,n.end).startsWith(prefix));assert.ok(i>=0,prefix);return i;};
 const grouped=new Set();
 function group(first,last,id){const a=pos(first),b=body.findIndex((n,i)=>i>=a&&s.slice(n.start,n.end).startsWith(last));assert.ok(b>=a);const ns=body.slice(a,b+1);ns.forEach(n=>grouped.add(n));h.statements(ns,id,['id']);}
 group('clearTimeout(matchTimer)','if(id === \'matching\'','matching');
 group('clearTimeout(phTimer)','if(id === \'pharmacy-search\'','pharmacy-search');
 group('clearInterval(prepCountdownTimer)','if(id === \'pharmacypending\'','pharmacypending');
 group('clearTimeout(rxTimer)','if(id===\'rx-writing\'','rx-writing');
 group("const loginIntakeNotice=","if(loginIntakeNotice",'login');
 // Page-specific activation bodies; router keeps routing decisions and order.
 const targets=new Set(['consent-terms','patient-info','insurance','address','appointment-booked','delivery-quote','payment','video','consult','conditions','preloader','tracking','payment-success']);
 for(const n of body){
  if(grouped.has(n)||n.type!=='IfStatement'||n.consequent.type!=='BlockStatement')continue;
  const text=s.slice(n.test.start,n.test.end),id=/\bid\s*===\s*['"]([^'"]+)/.exec(text)?.[1];
  if(!targets.has(id)||n.start<posStart())continue;
  // Cross-page guards before rendering remain shared routing policy.
  if(/requested|flowState\.appointmentWhen|queueDismissOnce/.test(text))continue;
  if(n.alternate)continue;
  const local=['id','prevId'].filter(name=>{let seen=false;walk(n.consequent,x=>{if(x.type==='Identifier'&&x.name===name)seen=true});return seen;});
  h.branch(n,id,local);
 }
 function posStart(){return body[pos("if(id==='payment-success'")].start;}
});
process('shared/runtime.js',(ast,h,s)=>{
 walk(ast,n=>{
  if(n.type!=='IfStatement')return;
  const t=s.slice(n.test.start,n.test.end);
  if(t.includes("backScreen?.id==='otp'"))h.branch(n,'otp');
  if(t.includes("backScreen?.id==='address'"))h.branch(n,'address');
 });
});
// Named renderers that select a single page. Generic selectors, cross-screen
// checkout/gateway renderers, intake engines and shared state helpers stay central.
const moves={
 address:['renderAddressList','confirmDeleteSavedAddress','renderAddressPinPreview','activeAddressSearch','closeAddressSuggestions','setupAddressSearch'],
 conditions:['renderConsultationCatalog'],
 'set-password':['syncPasswordScreen'],
 'partner-phr':['syncPartnerReview'],
 'partner-insurance':['syncPartnerPolicySummary'],
 notifications:['syncDeliveryNotification'],
 waitroom:['startWaitroomEntryWindow','stopWaitroomEntryWindow','openWaitroomExpiredModal','closeWaitroomExpiredModal'],
 payment:['closePaymentMethodModal','closePromoModal','syncPickupBranch','closePickupBranchModal']
};
for(const file of manifest.libraries){let s=read(file),edits=[];for(const n of parse(s,{ecmaVersion:'latest'}).body){const id=Object.keys(moves).find(id=>moves[id].includes(n.id?.name));if(id){append(id,s.slice(n.start,n.end));edits.push(n);records.push({kind:'named-function',name:n.id.name,from:file,owner:`pages/${id}/page.js`});}}for(const n of edits.sort((a,b)=>b.start-a.start))s=s.slice(0,n.start)+s.slice(n.end);write(file,s);}
manifest.lifecycleOwnershipVersion=1;
write('manifest.json',JSON.stringify(manifest,null,2)+'\n');
write('handler-ownership.json',JSON.stringify(ownership,null,2)+'\n');
write('lifecycle-ownership.json',JSON.stringify({baseline:'52d8aac630703e666edc2bdefc81ae393db654af',records},null,2)+'\n');
console.log(`Extracted ${records.length} page-owned lifecycle/handler/function units.`);
