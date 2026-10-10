import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=process.cwd(),out=process.env.QA_OUTPUT||'/tmp/krane-brand-qa';await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const p=resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!p.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'})[extname(p)]||'application/octet-stream');res.end(await readFile(p));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.KRANE_BASE||`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const results=[],inventory=[];

const targets=[['landing','b2c/krane-b2c-landing.html'],...['profile','intake-general','consultpay','payment','video','consult'].map(id=>[id,'b2c/krane-b2c.html?screens=1&demoStage='+id+'#'+id]),['doctor-login','cms/cms-doctor.html#login'],['doctor-rail','cms/cms-doctor.html#dashboard'],['admin-rail','cms/cms-admin.html#cases']];
try{for(const width of [390,1440])for(const [name,url] of targets.filter(([name])=>!process.env.BRAND_NAMES||process.env.BRAND_NAMES.split(',').includes(name))){
const context=await browser.newContext({viewport:{width,height:900}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(base+'/'+url,{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(500);
if(width===390&&name.endsWith('rail')){const toggle=page.locator('[data-nav-toggle]');if(await toggle.count())await toggle.click();else await page.locator('.cms-topbar__menu').click();await page.waitForTimeout(300)}
const logos=await page.evaluate(()=>[...document.querySelectorAll('img[src*="brand-final"],.intake-lockup,.brand-lockup')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(e).visibility!=='hidden'&&e.checkVisibility()}).map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {tag:e.tagName,src:e.currentSrc||e.src||s.maskImage||s.webkitMaskImage,cls:e.className,width:r.width,height:r.height,x:r.x,y:r.y,right:r.right,naturalWidth:e.naturalWidth,naturalHeight:e.naturalHeight,fit:s.objectFit,mask:s.maskImage||s.webkitMaskImage,filter:s.filter}}));
const favicon=await page.locator('link[rel="icon"]').getAttribute('href');const iconStatus=await page.request.get(new URL(favicon,page.url()).href).then(r=>r.status());
const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);
const failures=[];if(!logos.length)failures.push('No visible logo');if(overflow)failures.push('Document overflow');if(errors.length)failures.push(...errors);if(iconStatus!==200||!favicon.includes('brand-final'))failures.push('Favicon not final');
for(const l of logos){if(!l.src.includes('brand-final'))failures.push('Old visible logo source');if(l.tag==='IMG'&&(!l.naturalWidth||!l.naturalHeight))failures.push('Image failed');if(l.tag==='IMG'&&l.fit!=='contain'&&l.fit!=='cover'&&Math.abs(l.width/l.height-l.naturalWidth/l.naturalHeight)>.03)failures.push('Distorted image '+l.cls);if(l.x<-.5||l.right>width+.5)failures.push('Logo beyond viewport '+l.cls)}
const header=await page.evaluate(()=>{const e=document.querySelector('.screen.active .screen__top');if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}});
if(header&&name!=='profile'){const logo=logos.find(l=>l.cls==='intake-lockup'||l.cls==='checkout-brandbar__logo'||l.cls==='payment-topbar__logo');if(logo&&Math.abs(logo.y+logo.height/2-header.y-header.height/2)>.5)failures.push('Logo not vertically centred in shared header')}
results.push({header,test:name+'/'+width,status:failures.length?'fail':'pass',failures,logos,favicon});await page.screenshot({path:out+'/'+name+'-'+width+'.png'});await context.close();
}}finally{await writeFile(out+'/results.json',JSON.stringify(results,null,2));console.log(JSON.stringify({checks:results.length,failures:results.filter(r=>r.status==='fail'),out},null,2));await browser.close();server.close()}
if(results.some(r=>r.status==='fail'))process.exitCode=1;
