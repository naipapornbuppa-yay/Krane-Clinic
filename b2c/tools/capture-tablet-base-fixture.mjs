/* Read-only approved-source tablet shell fixtures. Not live workflow QA. */
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,relative,extname} from 'node:path';
const root=resolve(process.argv[2]||'.'),out=resolve(process.env.QA_OUTPUT||'/tmp/tablet-base-reference');await mkdir(out,{recursive:true});
const src=await readFile(resolve(root,'b2c/krane-b2c.html'),'utf8');
function slice(a,b){const start=src.indexOf(a),end=src.indexOf(b,start);if(start<0||end<0)throw Error('Missing audited source anchor '+a);return src.slice(start,end)}
const chrome=slice('  const careJourneyLabels =','  // Photo upload on the intake photo step:')+slice('  function ensureAppBarLockup(id)','  function setupIntakeQuestionPages(');
// Audited DOM-only source spans. See tablet-account-pure-render-audit.json.
const normalizer=slice("  document.querySelectorAll('.screen').forEach(screen => {","  const screens = [...document.querySelectorAll('.screen')];");
const accountRender=slice('  const consentDocuments = {','  const partnerConsentVersions = {')+
 slice("  document.querySelectorAll('[data-consent-scroll]').forEach(box => {","  const consentPageScroll=document.querySelector('[data-consent-page-scroll]');")+
 slice('  function isEnglishUi(){','  function setPrototypeRailCollapsed(')+
 slice('  function formatPatientDate(value){',"  document.addEventListener('krane:languagechange',syncPatientDateFields);")+
 slice('  function openPatientDatePicker(input){','  // initialise now that featureMap + toast exist');
const fixture=src.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace('<head>','<head><base href="/b2c/">');
const server=createServer(async(req,res)=>{try{if(req.url==='/tablet-fixture.html'){res.setHeader('Content-Type','text/html');res.end(fixture);return;}const f=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));if(relative(root,f).startsWith('..'))throw Error('outside root');res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2'})[extname(f)]||'application/octet-stream');res.end(await readFile(f));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({args:['--no-sandbox']}),results=[];
const samples=[['profile-1440','profile',null,1440],['profile-390','profile',null,390],['cold-login-1440','login',null,1440],['cold-login-768','login',null,768],['cold-login-390','login',null,390],['cold-otp-1440','otp',null,1440],['cold-otp-768','otp',null,768],['cold-otp-390','otp',null,390],['profile','profile'],['login','login'],['signup','signup'],['otp','otp'],['consent','consent-terms'],['patient-info','patient-info'],['social-confirm','social-confirm'],['social-date-open','social-confirm'],['set-password','set-password'],['waiting','waitroom'],['ready','waitroom'],['active-case-modal','login','active-case-modal']];
try{for(const [key,id,modal,sampleWidth=768] of samples){
 const ctx=await browser.newContext({viewport:{width:sampleWidth,height:sampleWidth===390?844:sampleWidth===1440?900:1024},deviceScaleFactor:1,reducedMotion:'reduce',hasTouch:true});
 await ctx.route('**/*',r=>r.request().url().startsWith(origin)||r.request().url().startsWith('data:')?r.continue():r.abort());
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(origin+'/tablet-fixture.html',{waitUntil:'networkidle'});
 await page.evaluate(({id,modal,key})=>{for(const n of document.querySelectorAll('.screen'))n.classList.remove('active');const target=document.getElementById(id);if(!target)throw Error('Missing source section '+id);target.classList.add('active');if(modal){const m=document.getElementById(modal);m.hidden=false;m.setAttribute('aria-hidden','false');}
 if(key==='waiting'){
 // Display-only initial default from resetWaitroom source10798–10822.
 // Never invoke resetWaitroom: it persists queue and starts clinical/timer logic.
 target.dataset.queueState='waiting';
 target.querySelector('[data-queue-clock]').hidden=false;
 target.querySelector('[data-wait-note]').hidden=false;
 target.querySelector('[data-wait-title]').textContent='กำลังรอคิวเข้าห้องปรึกษา';
 target.querySelector('[data-wait-copy]').textContent='คุณอยู่คิวที่ 2'; // source fallback queuePosition || 2, explicit fixture default
 const enter=target.querySelector('[data-wait-enter]');enter.hidden=true;enter.classList.remove('is-ready-pop');
 target.querySelector('[data-wait-enter-label]').textContent='รอเรียกเข้าห้อง…';
 const visual=target.querySelector('[data-wait-visual]');visual.classList.add('state-view__visual--loading');visual.classList.remove('state-view__visual--success','is-ready');
 target.querySelector('[data-wait-art]').setAttribute('href','#krane-state-waiting-room');
 target.querySelector('[data-queue-book]').hidden=true;
 // Leave the raw source elapsed00:00 untouched: no elapsed time asserted.
 }
 if(key==='ready'){target.dataset.queueState='ready';target.querySelector('[data-wait-title]').textContent='ถึงคิวแล้ว!';target.querySelector('[data-wait-copy]').textContent='กดเข้าห้องได้เลย แพทย์นรินทร์ พร้อมเจอคุณแล้ว';target.querySelector('[data-queue-clock]').hidden=true;target.querySelector('[data-queue-book]').hidden=true;target.querySelector('[data-wait-enter]').hidden=false;target.querySelector('[data-wait-enter-label]').textContent='เข้าห้องปรึกษา';target.querySelector('[data-wait-visual]').classList.remove('state-view__visual--loading');target.querySelector('[data-wait-visual]').classList.add('state-view__visual--success','is-ready');target.querySelector('[data-wait-art]').setAttribute('href','#krane-state-enter-room');target.querySelector('[data-wait-timer]').textContent='05:00';}
 },{id,modal,key});
 await page.addScriptTag({content:normalizer});
 await page.addScriptTag({url:origin+'/b2c/patient-date-picker.js'});
 await page.addScriptTag({content:accountRender+'\nenhancePatientDateFields();'});
 await page.addScriptTag({content:chrome+`\nensureAppBarLockup(${JSON.stringify(id)});syncCareJourneyFill(${JSON.stringify(id)});`});
 // Cold auth display-only rule from source10217-10227; no controller/state persistence.
 if(key.startsWith('cold-'))await page.evaluate(id=>{document.querySelectorAll('#'+id+' .care-journey').forEach(cj=>cj.hidden=true);},id);
 // Source presentation decorator only; no card clicks, clinical controller, auth or external requests.
 if(id==='profile'){
  await page.addScriptTag({url:origin+'/b2c/treatment-folders.js'});
  await page.evaluate(()=>{const p=document.getElementById('profile');p.querySelector('[data-followup-toast]').hidden=false;p.querySelector('[data-home-cta]').hidden=true;});
 }
 await page.addScriptTag({url:origin+'/b2c/assets/lucide.min.js'});await page.evaluate(()=>window.lucide.createIcons({attrs:{'stroke-width':1.8}}));await page.evaluate(()=>document.fonts.ready);
 if(key==='social-date-open'){await page.evaluate(()=>{const input=document.getElementById('social-birth-date');if(!window.KranePatientDatePicker?.intercepts())throw Error('Expected coarse-pointer date sheet');window.KranePatientDatePicker.open(input);});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
 const metrics=await page.evaluate(({id,modal,key})=>{function renderedLines(n){if(n.children.length||!n.firstChild||n.firstChild.nodeType!==Node.TEXT_NODE)return undefined;const text=n.firstChild.textContent,range=document.createRange(),lines=[];for(let i=0;i<text.length;i++){range.setStart(n.firstChild,i);range.setEnd(n.firstChild,i+1);const rect=range.getBoundingClientRect();if(!rect.height)continue;let line=lines.find(x=>Math.abs(x.y-rect.y)<1);if(!line){line={y:rect.y,text:''};lines.push(line);}line.text+=text[i];}return lines.sort((a,b)=>a.y-b.y);}const root=key==='social-date-open'?document.querySelector('.patient-date-sheet'):document.getElementById(modal||id),nodes=[root,...root.querySelectorAll('*')];return {pointerCoarse:matchMedia('(pointer:coarse)').matches,viewport:{width:innerWidth,height:innerHeight},documentWidth:document.documentElement.scrollWidth,nodes:nodes.filter(n=>{const r=n.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(n).visibility!=='hidden'}).map(n=>{const r=n.getBoundingClientRect(),c=getComputedStyle(n);return {tag:n.tagName,id:n.id,classes:n.className?.baseVal??n.className,x:r.x,y:r.y,w:r.width,h:r.height,text:n.children.length?undefined:n.textContent,renderedLines:renderedLines(n),font:c.fontFamily,size:c.fontSize,line:c.lineHeight,weight:c.fontWeight,color:c.color,bg:c.backgroundColor,display:c.display,gap:c.gap,padding:c.padding,radius:c.borderRadius,maxWidth:c.maxWidth,grid:c.gridTemplateColumns,flexDirection:c.flexDirection};})};},{id,modal,key});
 await page.screenshot({path:`${out}/${(key.startsWith('cold-')||key==='profile-1440'||key==='profile-390')?key:key+'-768'}.png`,fullPage:true,scale:'css'});results.push({key,sourceSection:id,modal,errors,metrics});await ctx.close();
}await writeFile(`${out}/tablet-base-reference.json`,JSON.stringify({source:'1db34f9cb4a762df4fe6dde00d6a8889b1761240',fixture:'Waiting is explicitly selected initial default with source fallback queue2 and untouched raw00:00; no queue exists or timer runs. Audited source footer normalizer, consent document DOM renderer, date display enhancer and local patient-date-picker restored. No consent unlock listeners or consent recording code loaded. Date dialog opened only, never confirmed. Auth EN raw text and control enrichment still partial. Product scripts removed. Exact source pure careJourney/lockup restored; static source default bodies, Ready fixed state. No submit, auth, payment, medical or external requests. Auth default body remains unenriched by controllers; use for shell geometry, not final copy parity.',results},null,2));}finally{await browser.close();await new Promise(r=>server.close(r));}
