import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const mode=process.argv[2]||'baseline', folder=process.env.KRANE_COMPONENT_AUDIT||'/private/tmp/krane-component-audit';
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true});
const records=[], errors=[], screenshots=[];
const properties=['display','boxSizing','height','minHeight','paddingTop','paddingRight','paddingBottom','paddingLeft','borderTopWidth','borderTopColor','borderRadius','backgroundColor','color','fontFamily','fontSize','fontWeight','lineHeight','gap','boxShadow','outlineWidth','outlineColor','resize','alignItems','justifyContent'];
const selector='.btn,.input,.textarea,.select,.float-field__box,.phone-field,.password-field,.custom-select__trigger,.ui-icon,.back,.form-group__title,.section-label,.option,.qty-btn';
try{
for(const width of [320,390,768,1440]){
 const page=await browser.newPage({viewport:{width,height:1000}});
 await page.clock.setFixedTime(new Date('2026-09-28T10:00:00Z'));
 if(process.env.KRANE_AUDIT_REF)await page.route('http://127.0.0.1:5178/b2c/**',async route=>{
  const path=new URL(route.request().url()).pathname.slice(1);
  if(!/\.(html|css)$/.test(path))return route.continue();
  try{const body=execFileSync('git',['show',`${process.env.KRANE_AUDIT_REF}:${path}`]);await route.fulfill({body,contentType:path.endsWith('.css')?'text/css':'text/html'});}catch{await route.continue();}
 });
 page.on('pageerror',e=>errors.push(e.message));
 await page.route(/tile.openstreetmap|nominatim/,r=>r.abort());
 await page.goto('http://127.0.0.1:5178/b2c/krane-b2c.html',{waitUntil:'domcontentloaded'});
 await page.evaluate(()=>document.fonts.ready);
 await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}'});
 await page.evaluate(()=>{
  const host=document.createElement('div');host.id='component-probe';host.style='position:fixed;inset:0 auto auto 0;width:300px;z-index:99999;background:white';
  host.innerHTML='<button class="btn btn--primary">Continue</button><div class="field float-field"><div class="float-field__box"><span class="float-field__slot"><input class="input" placeholder=" " id="probe-input"><label for="probe-input">Name</label></span></div></div><div class="field"><select class="select"><option>Choose</option></select></div>';
  document.body.append(host);
 });
 for(const state of ['normal','hover','focus','disabled','invalid']){
  const input=page.locator('#probe-input');
  if(state==='hover')await input.hover();
  if(state==='focus')await input.focus();
  if(state==='disabled')await input.evaluate(el=>{el.blur();el.disabled=true;});
  if(state==='invalid')await input.evaluate(el=>{el.disabled=false;el.closest('.field').classList.add('is-invalid');});
  const rows=await page.locator('#component-probe').evaluate((host,{properties,state,width,selector})=>[...host.querySelectorAll(selector)].map((el,index)=>({key:`${width}/states/${state}/${index}`,type:el.className,style:Object.fromEntries(properties.map(p=>[p,getComputedStyle(el)[p]]))})),{properties,state,width,selector});
  records.push(...rows);
 }
 await page.locator('#component-probe').evaluate(el=>el.remove());
 const result=await page.evaluate(({selector,properties,width})=>{
  const screens=[...document.querySelectorAll('section.screen')],rows=[];
  screens.forEach(s=>s.classList.remove('active'));
  for(const screen of screens){
   screen.classList.add('active');
   [...screen.querySelectorAll(selector)].forEach((el,index)=>{
    const style=getComputedStyle(el);if(!el.getClientRects().length)return;
    rows.push({key:`${width}/${screen.id}/${index}`,type:el.className.baseVal??el.className,style:Object.fromEntries(properties.map(p=>[p,style[p]]))});
   });
   screen.classList.remove('active');
  }
  return {rows,screens:screens.length};
 },{selector,properties,width});
 records.push(...result.rows);
 console.log(`${width}px: ${result.screens} screens, ${result.rows.length} rendered component instances`);
 if([390,1440].includes(width))for(const id of ['signup','login','intake4','payment','address','waitroom','rx-writing','tracking']){
  if(!await page.locator(`#${id}`).count())continue;
  await page.evaluate(id=>{document.querySelectorAll('section.screen').forEach(s=>s.classList.toggle('active',s.id===id));},id);
  const bytes=await page.screenshot({path:`${folder}/${mode}-${width}-${id}.png`});
  screenshots.push({key:`${width}/${id}`,hash:createHash('sha256').update(bytes).digest('hex')});
 }
 await page.close();
}
await writeFile(`${folder}/${mode}.json`,JSON.stringify({records,errors,screenshots},null,2));
if(mode!=='baseline'){
 const before=JSON.parse(await readFile(`${folder}/baseline.json`,'utf8'));
 const changes=[];const map=new Map(before.records.map(r=>[r.key,r]));
 for(const row of records){const old=map.get(row.key);if(!old||JSON.stringify(old.style)!==JSON.stringify(row.style))changes.push({key:row.key,before:old,after:row});map.delete(row.key);}
 changes.push(...[...map.values()].map(before=>({before})));
 await writeFile(`${folder}/changes.json`,JSON.stringify(changes,null,2));
 const visualChanges=screenshots.filter(row=>before.screenshots?.find(old=>old.key===row.key)?.hash!==row.hash);
 console.log(`${visualChanges.length} changed screenshots out of ${screenshots.length}`);
 if(visualChanges.length)process.exitCode=1;
 console.log(`${changes.length} changed component styles; ${errors.length} page errors`);
 if(changes.length||errors.length)process.exitCode=1;
}
}finally{await browser.close();}
