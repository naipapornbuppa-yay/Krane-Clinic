/** Standalone documents share original services but mount exactly one screen.
 * No archive code is executed. See STANDALONE.md for the migration contract. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse} from 'acorn';
import {JSDOM} from 'jsdom';
import postcss from 'postcss';
import {createHash} from 'node:crypto';
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.dirname(dir), read=p=>fs.readFile(path.join(dir,p),'utf8');
const manifest=JSON.parse(await read('manifest.json'));
const behavior=JSON.parse(await read('page-behavior.json'));
const handlerOwnership=JSON.parse(await read('handler-ownership.json'));
const ids=manifest.pages.map(p=>p.id), funcs=new Map(), vars=new Map();
const runtime=await read('shared/runtime.js'),sharedUiSource=runtime+'\n'+await read('shared/lib/ui.js'), ast=parse(runtime,{ecmaVersion:'latest'});
function walk(n,fn,parent){if(!n||typeof n!=='object')return;fn(n,parent);for(const[k,v]of Object.entries(n)){if(['start','end'].includes(k))continue;if(Array.isArray(v))v.forEach(x=>walk(x,fn,n));else if(v?.type)walk(v,fn,n)}}
function refs(s){const found=new Set();walk(parse(s,{ecmaVersion:'latest',allowReturnOutsideFunction:true}),(n,p)=>{if(n.type==='Identifier'&&!(p?.type==='MemberExpression'&&p.property===n&&!p.computed)&&!(p?.type==='Property'&&p.key===n&&!p.computed&&!p.shorthand))found.add(n.name)});return found}
const sources=[...manifest.libraries,...manifest.pages.map(p=>p.js)];
for(const src of sources){const s=await read(src);for(const n of parse(s,{ecmaVersion:'latest'}).body){if(n.type==='FunctionDeclaration')funcs.set(n.id.name,{text:s.slice(n.start,n.end),source:src,owner:manifest.pages.find(p=>p.js===src)?.id});else if(n.type==='VariableDeclaration')for(const d of n.declarations)if(d.id.type==='Identifier')vars.set(d.id.name,{text:`${n.kind} ${s.slice(d.start,d.end)};`,source:src,start:-1,kind:n.kind});}}
for(const n of ast.body)if(n.type==='VariableDeclaration')for(const d of n.declarations)if(d.id.type==='Identifier')vars.set(d.id.name,{text:`${n.kind} ${runtime.slice(d.start,d.end)};`,source:'shared/runtime.js',start:n.start,kind:n.kind});
const preserve=['history','selectedCategoryId','selectedConditionId','isAuthenticated','journeyActive','hasActiveCase','postAuthNext','patientInfoNext','doctorAvailable','insuranceEntry','authNext','socialCompletesAuth','appointmentDay','appointmentSlot','pharmacyRetryCount','pharmacyForceDecline','deliveryMethod','paymentMethod','paymentDue','paymentCredit','paymentConsultationDiscount','appliedPromo','obesityRiskStep'];
let base=await read('shared/shell.html');
// Compose CSS exactly as the prior migration, then partition selectors by screen.
const blocks=new Map();for(const p of manifest.pages){const css=await read(p.css);for(const m of css.matchAll(/\/\* @krane-css ([\w-]+) \*\/\n([\s\S]*?)\n\/\* @krane-css-end \1 \*\//g))blocks.set(m[1],m[2]);}
const compose=s=>s.replace(/\/\* @krane-css-include ([\w-]+) ([\w-]+) \*\//g,(_,owner,id)=>blocks.get(id));
const cssSources=[];for(const item of manifest.cssSources){const css=compose(await read(item.template));cssSources.push({source:item.template,css});base=base.replace(`/* @krane-style ${item.template} */`,()=>css)}
// These original initializers serve controls on more than one page.
const sharedPageInitializers={intake3:['kraneInit_intake2_obesityMetrics'],waitroom:['kraneInit_queue_resume_queueActions']};
const usesSharedInitializer=(id,name)=>(sharedPageInitializers[id]||[]).includes(name);
function editCalls(s,id){const edits=[];walk(parse(s,{ecmaVersion:'latest',allowReturnOutsideFunction:true}),(n)=>{if(n.type==='CallExpression'&&n.callee.type==='Identifier'){const f=funcs.get(n.callee.name);if(f?.owner&&f.owner!==id&&!usesSharedInitializer(id,n.callee.name)&&/^krane(?:Init|Route|Handle|Render)/.test(n.callee.name))edits.push([n.start,n.end,'false']);}});for(const[a,b,t]of edits.sort((a,b)=>b[0]-a[0]))s=s.slice(0,a)+t+s.slice(b);return s;}
function pruneDestination(s,id){
 const edits=[];
 function val(n){if(!n)return undefined;if(n.type==='Literal')return n.value;if(n.type==='Identifier'&&n.name==='id')return id;if(n.type==='ArrayExpression'){const a=n.elements.map(val);return a.every(x=>x!==undefined)?a:undefined;}if(n.type==='BinaryExpression'){const a=val(n.left),b=val(n.right);if(a===undefined||b===undefined)return undefined;if(['===','=='].includes(n.operator))return a===b;if(['!==','!='].includes(n.operator))return a!==b;}if(n.type==='LogicalExpression'){const a=val(n.left),b=val(n.right);if(n.operator==='&&'){if(a===false||b===false)return false;if(a===true)return b;}if(n.operator==='||'){if(a===true||b===true)return true;if(a===false)return b;}}if(n.type==='CallExpression'&&n.callee.type==='MemberExpression'&&n.callee.property.name==='includes'){const a=val(n.callee.object),b=val(n.arguments[0]);if(Array.isArray(a)&&b!==undefined)return a.includes(b);}return undefined;}
 function visit(n){if(!n||typeof n!=='object')return;if(n.type==='IfStatement'){const v=val(n.test);if(v===false){edits.push([n.start,n.end,n.alternate?s.slice(n.alternate.start,n.alternate.end):'']);return;}if(v===true){edits.push([n.start,n.end,s.slice(n.consequent.start,n.consequent.end)]);return;}}for(const v of Object.values(n)){if(Array.isArray(v))v.forEach(visit);else if(v?.type)visit(v);}}
 visit(parse(s,{ecmaVersion:'latest'}));for(const[a,b,t]of edits.sort((a,b)=>b[0]-a[0]))s=s.slice(0,a)+t+s.slice(b);return s;
}
function pruneEvents(s,doc,dynamic=''){
 const missing=new Set(), edits=[];const tree=parse(s,{ecmaVersion:'latest',allowReturnOutsideFunction:true});
 walk(tree,(n,p)=>{if(n.type==='CallExpression'&&n.callee.type==='MemberExpression'&&['closest','matches'].includes(n.callee.property.name)&&n.arguments[0]?.type==='Literal'&&typeof n.arguments[0].value==='string'&&/\.(?:target|currentTarget)\b/.test(s.slice(n.callee.object.start,n.callee.object.end))){let exists=true;try{exists=!!doc.querySelector(n.arguments[0].value)||[...n.arguments[0].value.matchAll(/(?:\[|\.)([\w-]+)/g)].some(m=>dynamic.includes(m[1]))}catch{}if(!exists){edits.push([n.start,n.end,'null']);if(p?.type==='VariableDeclarator'&&p.id.type==='Identifier')missing.add(p.id.name);}}});
 for(const[a,b,t]of edits.sort((a,b)=>b[0]-a[0]))s=s.slice(0,a)+t+s.slice(b);
 for(let pass=0;pass<3;pass++){const cuts=[];function truth(n){if(!n)return undefined;if(n.type==='Literal')return Boolean(n.value);if(n.type==='Identifier'&&missing.has(n.name))return false;if(n.type==='UnaryExpression'&&n.operator==='!'){const v=truth(n.argument);return v===undefined?undefined:!v;}if(n.type==='LogicalExpression'){const a=truth(n.left),b=truth(n.right);if(n.operator==='&&'&&(a===false||b===false))return false;if(n.operator==='||'&&a===false)return b;}return undefined;}
 function visit(n){if(!n||typeof n!=='object')return;if(n.type==='IfStatement'){const v=truth(n.test);if(v!==undefined){cuts.push([n.start,n.end,v?s.slice(n.consequent.start,n.consequent.end):(n.alternate?s.slice(n.alternate.start,n.alternate.end):'')]);return;}}for(const v of Object.values(n)){if(Array.isArray(v))v.forEach(visit);else if(v?.type)visit(v);}}visit(parse(s,{ecmaVersion:'latest',allowReturnOutsideFunction:true}));for(const[a,b,t]of cuts.sort((a,b)=>b[0]-a[0]))s=s.slice(0,a)+t+s.slice(b);}
 return s;
}

function patchFunction(name,s,id){
 s=editCalls(s,id);
 if(name==='show')s=s.replace('if(!queueDismissOnce && pendingQueue?.suspended','if(kraneEntryPermit!==id && !queueDismissOnce && pendingQueue?.suspended');
 if(name==='show')s=s.replace('id=normalizeScreenTarget(requiredRouteFor(id));',"id=normalizeScreenTarget(kraneEntryPermit===id ? (kraneEntryPermit=null,id) : requiredRouteFor(id));");
 if(name==='kraneInitProfileTreatmentFolders')s=s.replace("card.dataset.consultationNumber=visit.number;","card.dataset.consultationNumber=visit.number;card.dataset.consultations=JSON.stringify(visits);");
 if(name==='openRedFlagSheet')s=s.replace("document.querySelector('#ineligible .btn--ghost').dataset.go=screen.id;","flowState.ineligibleReturn=screen.id;persistFlowState();");
 if(name==='resetRequiredFlow')s=s.replace('function resetRequiredFlow(){',"function resetRequiredFlow(){for(const key of Object.keys(sessionStorage))if(key.startsWith('krane-page-form:')||key==='krane-standalone-answers')sessionStorage.removeItem(key);");
 if(name==='show')s=s.replace(/const answers=\[\.\.\.document\.querySelectorAll[^\n]+;/, 'const answers=kraneStoredIntakeAnswers();');
 if(name==='openTreatmentDetail')s=s.replace('if(!detail) return;',"if(!detail){kraneTransferTreatment(card);show('treatment-detail');return;}");
 if(name==='saveIntakeDraft')s=s.replace('const fields={};','const previous=readSessionJson(DRAFT_KEY)||{}; const fields={...(previous.fields||{})};').replace('const options={};','const options={...(previous.options||{})};');
 if(name==='show' && id!=='tracking')s=s.replace("requestAnimationFrame(()=>openCsatModal('tracking',{preview:flowConfig.get('screens')==='1'}));",'');
 if(name==='show'){const marker=s.indexOf('/* A QA/shared link');s=s.slice(0,marker)+pruneDestination('function destination(){'+s.slice(marker,s.lastIndexOf('}'))+'}',id).replace(/^function destination\(\)\{/, '').replace(/}$/, '')+'}';}
 if(name==='normalizeScreenTarget')s=s.replace("document.getElementById(target) ? target : 'landing'","KRANE_PAGE_IDS.includes(target) ? target : 'landing'");
 if(name==='applyHash')s=s.replace('function applyHash(){','function applyHash(){kraneHashNavigation=true;try{');
 if(name==='applyHash')s=s.slice(0,s.lastIndexOf('}'))+'}finally{kraneHashNavigation=false;}}';
 if(name==='applyHash')s=s.replace('history=seededHistory(id); show(id, false);',"if(history.at(-1)!==id)history=seededHistory(id); show(id, false);").replace('id && document.getElementById(id)','id && KRANE_PAGE_IDS.includes(id)');
 if(name==='show')s=s.replace("window.history.replaceState(null,'','#'+id)","window.history.replaceState(null,'',location.pathname+location.search+'#'+id)").replace('/* A QA/shared link',`if(id!==KRANE_PAGE_ID){if(push && history.at(-1)!==id)history.push(id);kraneNavigateDocument(id);return;}\n    /* A QA/shared link`);
 return s;
}
await fs.mkdir(path.join(dir,'shared/standalone/functions'),{recursive:true});
// The original landing contains three demo iframes. Repoint them to individual
// documents too; otherwise landing would quietly load three all-screen apps.
await fs.mkdir(path.join(dir,'shared/standalone/landing'),{recursive:true});
const landingDoc=new JSDOM(await fs.readFile(path.join(root,'b2c/krane-b2c-landing.html'),'utf8')).window.document;
const landingBase=landingDoc.createElement('base');landingBase.href='../../../../b2c/';landingDoc.head.prepend(landingBase);
for(const el of landingDoc.querySelectorAll('[src],[href]')){const attr=el.hasAttribute('src')?'src':'href';const raw=el.getAttribute(attr);if(!raw.includes('krane-b2c.html'))continue;const url=new URL(raw,'https://example.invalid/b2c/');const target=url.hash.slice(1).split('?')[0]||url.searchParams.get('demoStage')||el.dataset.route||'landing';url.hash=target;el.setAttribute(attr,'../developer-handoff/pages/'+(ids.includes(target)?target:'landing')+'/index.html'+url.search+url.hash);}
for(const name of ['site-nav.js','article-landing.js','krane-b2c-landing.js']){const code=(await fs.readFile(path.join(root,'b2c',name),'utf8')).replaceAll('krane-b2c.html','../developer-handoff/pages/landing/index.html');await fs.writeFile(path.join(dir,'shared/standalone/landing',name),code);for(const script of landingDoc.querySelectorAll('script[src]'))if(script.getAttribute('src').split('?')[0]===name)script.src='../developer-handoff/shared/standalone/landing/'+name;}
await fs.writeFile(path.join(dir,'shared/standalone/landing/index.html'),'<!doctype html>\n'+landingDoc.documentElement.outerHTML);
const report=[];

const classOwners=new Map();
for(const page of manifest.pages){const text=await read(page.fragment||page.html)+'\n'+await read(page.js);for(const m of text.matchAll(/class=["'`]([^"'`]+)["'`]/g))for(const cls of m[1].split(/\s+/)){if(!classOwners.has(cls))classOwners.set(cls,new Set());classOwners.get(cls).add(page.id)}}

for(const p of manifest.pages){
 const id=p.id;const fragmentPath=p.fragment||p.html;const fragment=await read(fragmentPath);const pageSource=await read(p.js);
 let html=base.replace(/<!-- @krane-page ([\w-]+) -->/g,(_,key)=>key===id?fragment:'');
 if(id==='landing')html=html.replace('krane-b2c-landing.html?v=20261010-shared-views-v272','../developer-handoff/shared/standalone/landing/index.html');
 const dom=new JSDOM(html),doc=dom.window.document;
 doc.querySelectorAll('script,style,link[rel="stylesheet"]').forEach(el=>el.remove());
 doc.querySelector('#prototype-rail')?.remove();doc.querySelectorAll('.screen').forEach(el=>el.classList.remove('active'));
 const baseEl=doc.createElement('base');baseEl.href='../../../b2c/';doc.head.prepend(baseEl);
 doc.documentElement.dataset.page=id;doc.title=`Krane · ${id}`;
 const scripts=[],styleLinks=[];
 const script=src=>{const el=doc.createElement('script');el.src=src;doc.body.appendChild(el);scripts.push(src)};
 const style=href=>{const el=doc.createElement('link');el.rel='stylesheet';el.href=href;doc.head.appendChild(el);styleLinks.push(href)};
 for(const href of ['design-tokens.css','custom-select.css','state-illustrations.css','platform-compat.css','modal-chrome.css'])style(href);
 // Shared base rules are centralized; page-specific selectors are emitted only for their owner.
 const scoped=[];for(const c of cssSources){const tree=postcss.parse(c.css);tree.walkRules(rule=>{if(rule.parent.type==='atrule'&&/keyframes/.test(rule.parent.name))return;const selectors=rule.selectors.filter(sel=>{const owners=ids.filter(key=>new RegExp(`#${key}(?![\\w-])`).test(sel));if(owners.length&&!owners.includes(id))return false;const classes=[...sel.matchAll(/\.([a-zA-Z][\w-]*)/g)].map(m=>m[1]);return !classes.some(cls=>classOwners.has(cls)&&!classOwners.get(cls).has(id)&&!pageSource.includes(cls)&&!sharedUiSource.includes(cls)&&!doc.querySelector('.'+cls)&&!(id.startsWith('intake')&&/intake|option|partner|obesity|red-flag/.test(cls)))});if(!selectors.length)rule.remove();else rule.selectors=selectors;});scoped.push(tree.toString());}
 await fs.mkdir(path.join(dir,'pages',id,'standalone'),{recursive:true});
 const stylePath=path.join(dir,'pages',id,'standalone/styles.css');
 const rewriteCssUrls=css=>css.replace(/url\((['"]?)([^)'"]+)\1\)/g,(all,quote,url)=>{if(/^(?:data:|https?:|#|\/)/.test(url))return all;const [file,suffix='']=url.split(/(?=[?#])/);return 'url("'+path.relative(path.dirname(stylePath),path.resolve(root,'b2c',file)).split(path.sep).join('/')+suffix+'")';});
 await fs.writeFile(stylePath,rewriteCssUrls(scoped.join('\n')+'\n'+(await read(p.css)).replace(/\/\* @krane-css ([\w-]+) \*\/[\s\S]*?\/\* @krane-css-end \1 \*\//g,'')));
 style(`../developer-handoff/pages/${id}/standalone/styles.css`);
 style('../developer-handoff/shared/standalone/layout.css');
 if(['profile','treatment-detail'].includes(id))style('treatment-folders.css');
 // Existing generic icon/select/localization services do not mount application screens.
 for(const src of ['review-tools.js','../krane-clinical-demo.js','../krane-golden-fixture.js','assets/lucide.min.js','b2c-icons.js','shared-view-components.js','custom-select.js','i18n.js'])script(src);
 if(['articles','article'].includes(id))for(const src of ['article-data.js','article-store.js'])script(src);
 const selectedFns=new Map(),selectedVars=new Set();
 let statements=[];
 for(const n of ast.body){if(n.type==='VariableDeclaration')continue;let s=runtime.slice(n.start,n.end);
  if(n.type==='ExpressionStatement' && n.expression.type==='CallExpression' && n.expression.callee.type==='Identifier'){const owner=funcs.get(n.expression.callee.name)?.owner;if(owner && owner!==id && !usesSharedInitializer(id,n.expression.callee.name) && !(n.expression.callee.name==='restoreIntakeDraft'&&id.startsWith('intake')))continue;}
  if(n.start===0)continue;
  if(s.includes('pendingQueue && !queuePreview &&'))continue;
  if(id!=='tracking'&&id!=='feedbackdone'&&/csatModal|csatGroups|rating-row/.test(s))continue;
  if(!['tracking','order-summary','payment-success'].includes(id)&&/postpayHelpSheet|data-postpay-help|window.kraneSyncOrderProgress/.test(s))continue;
  if(!['payment','payment-items'].includes(id)&&s.includes("krane:languagechange',()=>{ try{ syncOrderCheckout"))continue;
  if(!['profile','appointment','appointment-booked','consultpay'].includes(id)&&s.includes('new MutationObserver'))continue;
  if(!id.startsWith('intake') && s.includes('const intakeScreen = event.target.closest(INTAKE_DRAFT_SCREENS'))continue;
  if(s.includes('window.KraneReviewTools.renderRail')||s.includes('rail a[data-screen-ref]'))continue;
  s=id.startsWith('intake')?editCalls(s,id):pruneEvents(editCalls(s,id),doc,pageSource);if(s.includes("window.addEventListener('pagehide'"))s=s.replace('if(pendingQueue){','if(pendingQueue && !kraneDocumentNavigation){');s=s.replace('messageTarget && document.getElementById(messageTarget)','messageTarget && KRANE_PAGE_IDS.includes(messageTarget)');if(s.trim()==='false;')continue;
  statements.push({start:n.start,text:s});
 }
 // Only the destination page's initialization runs. Generic setup is kept in original order.
 const extraPageStatements=parse(pageSource,{ecmaVersion:'latest'}).body.filter(n=>n.type!=='FunctionDeclaration').map(n=>pageSource.slice(n.start,n.end)).join('\n');
 const roots=extraPageStatements+'\n'+statements.map(x=>x.text).join('\n')+'\n'+[...funcs].filter(([,f])=>f.owner===id).map(([name])=>name).join(';');
 const needed=new Set([...refs(roots),'show','applyHash','seedPartnerStage','seedClinicalDemoStage','setSelectedCategory','persistFlowState',...preserve]);
 for(const name of needed){if(funcs.has(name)){const f=funcs.get(name);const text=patchFunction(name,f.text,id);selectedFns.set(name,{...f,text});for(const ref of refs(text))needed.add(ref);}if(vars.has(name)){selectedVars.add(name);for(const ref of refs(vars.get(name).text))needed.add(ref);}}
 // Compile common services once per distinct source transformation; each dependency is explicit.
 const depFiles=[];
 for(const[name,f]of selectedFns){if(f.owner===id)continue;const suffix=f.text===funcs.get(name).text?'':`-${id}`;const filename=`${name}${suffix}.js`;await fs.writeFile(path.join(dir,'shared/standalone/functions',filename),`/* Source: ${f.source}; ${name}. Generated by standalone-build.mjs. */\n${f.text}\n`);depFiles.push(`../developer-handoff/shared/standalone/functions/${filename}`);}
 for(const src of depFiles)script(src);
 await fs.writeFile(path.join(dir,'pages',id,'standalone/page.js'),[...selectedFns.values()].filter(f=>f.owner===id).map(f=>f.text).join('\n\n'));
 script(`../developer-handoff/pages/${id}/standalone/page.js`);
 script('../developer-handoff/shared/standalone/page-state.js');
 if(['articles','article'].includes(id)){
 const editorial=`const records=window.KraneArticleStore.published();const byId=Object.fromEntries(records.map(a=>[a.id,a]));const saved=JSON.parse(sessionStorage.getItem('krane-article-selection')||'{}');window.kraneArticleState={articles:records,byId,selectedId:new URLSearchParams(location.search).get('article')||saved.selectedId||records[0].id,filter:saved.filter||'all'};window.kraneArticleMock={renderFeed(){if(typeof kraneRenderArticles==='function')kraneRenderArticles()},renderDetail(){if(typeof kraneRenderArticle==='function')kraneRenderArticle()}};if(typeof kraneInitArticlesAdapter==='function')kraneInitArticlesAdapter();`;
 await fs.writeFile(path.join(dir,'pages',id,'standalone/editorial.js'),editorial);script(`../developer-handoff/pages/${id}/standalone/editorial.js`);
 }

 const intro=`let kraneHashNavigation=false,kraneDocumentNavigation=false;\nlet kraneEntryPermit=sessionStorage.getItem('krane-standalone-entry-permit');sessionStorage.removeItem('krane-standalone-entry-permit');\nif(!location.hash && new URLSearchParams(location.search).get('entry')==='partner'){const u=new URL(location.href);u.hash='consent-terms';u.searchParams.set('fresh','1');window.history.replaceState(null,'',u); }\nwindow.kraneDemoStage=new URLSearchParams(location.search).get('demoStage')||undefined;\nconst KRANE_PAGE_ID=${JSON.stringify(id)}, KRANE_PAGE_IDS=${JSON.stringify(ids)};\nif(!location.hash)window.history.replaceState(null,'',location.pathname+location.search+'#'+KRANE_PAGE_ID);\nconst kraneSaved=JSON.parse(sessionStorage.getItem('krane-standalone-state')||'{}');\n`;
 let sequence=[];for(const name of selectedVars){const v=vars.get(name);let s=v.text;if(preserve.includes(name))s=s.replace(/=([\s\S]*);$/,`= Object.hasOwn(kraneSaved,${JSON.stringify(name)}) ? kraneSaved[${JSON.stringify(name)}] : ($1);`);sequence.push({start:v.start,text:s})}sequence.push(...statements);sequence.sort((a,b)=>a.start-b.start);
 const boot=intro+sequence.map(x=>x.text).join('\n')+`\nfunction kraneNavigateDocument(id){sessionStorage.setItem('krane-standalone-entry-permit',id);kraneSavePageForm();if(window.kraneArticleState)sessionStorage.setItem('krane-article-selection',JSON.stringify({selectedId:window.kraneArticleState.selectedId,filter:window.kraneArticleState.filter}));persistFlowState();sessionStorage.setItem('krane-standalone-state',JSON.stringify({${preserve.filter(x=>selectedVars.has(x)).join(',')}}));const url=new URL('../developer-handoff/pages/'+id+'/index.html',document.baseURI);url.search=location.search;url.searchParams.delete('fresh');url.searchParams.set('category',selectedCategoryId);url.hash=id;kraneDocumentNavigation=true;if(kraneHashNavigation)location.replace(url);else location.assign(url);}\nif(KRANE_PAGE_ID==='login'&&!Object.hasOwn(kraneSaved,'postAuthNext'))postAuthNext='profile';\nif(flowConfig.get('category'))setSelectedCategory(flowConfig.get('category'));\nif(window.kraneDemoStage){seedPartnerStage(window.kraneDemoStage);seedClinicalDemoStage(window.kraneDemoStage); }\napplyHash();\nkraneRestorePageForm();\nif(KRANE_PAGE_ID==='ineligible'&&flowState.ineligibleReturn)document.querySelector('#ineligible .btn--ghost').dataset.go=flowState.ineligibleReturn;\nif(typeof kraneRenderArticles==='function')kraneRenderArticles();\n${extraPageStatements}\ndocument.documentElement.dataset.pageReady='true';\n`;
 await fs.writeFile(path.join(dir,'pages',id,'standalone/boot.js'),boot);
 script(`../developer-handoff/pages/${id}/standalone/boot.js`);
 for(const adapter of ['clinical-ui','clinical-requests',...(id==='profile'?['treatment-folders']:[]),...(id==='treatment-detail'?['treatment-pause']:[])]){const source=editCalls(await read('shared/adapters/'+adapter+'.js'),id);await fs.writeFile(path.join(dir,'pages',id,'standalone/'+adapter+'.js'),source);script(`../developer-handoff/pages/${id}/standalone/${adapter}.js`);}
 if(id==='treatment-detail'){await fs.writeFile(path.join(dir,'pages',id,'standalone/restore.js'),'kraneRestoreTreatment();');script(`../developer-handoff/pages/${id}/standalone/restore.js`);}
 script('modal-chrome.js');
 await fs.writeFile(path.join(dir,'pages',id,'index.html'),'<!doctype html>\n'+doc.documentElement.outerHTML+'\n');
 report.push({id,scripts,styles:styleLinks,functions:[...selectedFns].map(([name,f])=>({name,source:f.source})),bindings:[...selectedVars]});
}
await fs.writeFile(path.join(dir,'standalone-dependencies.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.map(p=>({id:p.id,functions:p.functions.length,scripts:p.scripts.length})),null,2));

// Cache each shared service only once. Group identical dependency sets; a page
// requests only groups it uses. Source ownership remains in the manifest above.
const fileUsers=new Map();for(const page of report)for(const src of page.scripts.filter(s=>s.includes('/shared/standalone/functions/'))){if(!fileUsers.has(src))fileUsers.set(src,[]);fileUsers.get(src).push(page.id)}
const groups=new Map();for(const[src,users]of fileUsers){const key=users.sort().join(',');if(!groups.has(key))groups.set(key,{users,files:[]});groups.get(key).files.push(src)}
await fs.mkdir(path.join(dir,'shared/standalone/services'),{recursive:true});
const pageGroups=new Map(ids.map(id=>[id,[]]));
for(const[key,g]of groups){const name=createHash('sha256').update(key).digest('hex').slice(0,12);const href=`../developer-handoff/shared/standalone/services/${name}.js`;const code=(await Promise.all(g.files.map(src=>read(src.replace('../developer-handoff/',''))))).join('\n');await fs.writeFile(path.join(dir,'shared/standalone/services',name+'.js'),code);for(const id of g.users)pageGroups.get(id).push(href)}
for(const page of report){const target=path.join(dir,'pages',page.id,'index.html');let html=await fs.readFile(target,'utf8');let first=true;html=html.replace(/<script src="[^" ]*shared\/standalone\/functions\/[^" ]+"><\/script>/g,()=>{if(!first)return '';first=false;return pageGroups.get(page.id).map(src=>`<script src="${src}"></script>`).join('\n')});await fs.writeFile(target,html);page.scripts=page.scripts.filter(src=>!src.includes('/shared/standalone/functions/'));page.scripts.push(...pageGroups.get(page.id));}
await fs.writeFile(path.join(dir,'standalone-dependencies.json'),JSON.stringify(report,null,2)+'\n');
await fs.rm(path.join(dir,'shared/standalone/functions'),{recursive:true});
console.log('Grouped shared service dependencies:',groups.size);

for(const page of report){const original=manifest.pages.find(p=>p.id===page.id);const output={screen:page.id,eventHandlers:handlerOwnership.handlers.filter(h=>h.kind==='branch'&&h.owner===original.js),behavior:behavior[page.id]||{note:'Page-owned functions remain in '+original.js+'; shared services and the standalone adaptations are listed below.'},pathsRelativeTo:'developer-handoff/',assetUrlsRelativeTo:'b2c/ (repository root)',entry:`pages/${page.id}/index.html`,source:{html:original.fragment||original.html,js:original.js,css:original.css},mount:'Exactly one screen in a complete document. Other pages are not mounted.',navigation:'Destination document with session state and prerequisite guards; unload cancels timers.',scripts:page.scripts,styles:page.styles,functions:page.functions,prototypeBoundary:'Browser demonstration only; backend auth, OTP, payments, clinical services and persistence are not implemented.'};await fs.writeFile(path.join(dir,'pages',page.id,'dependencies.json'),JSON.stringify(output,null,2)+'\n');}

const usedServices=new Set(report.flatMap(p=>p.scripts).filter(s=>s.includes('/standalone/services/')).map(s=>path.basename(s)));
for(const file of await fs.readdir(path.join(dir,'shared/standalone/services')))if(!usedServices.has(file))await fs.unlink(path.join(dir,'shared/standalone/services',file));
