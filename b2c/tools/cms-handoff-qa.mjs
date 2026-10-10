import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=process.cwd(),out=process.env.QA_OUTPUT||'/tmp/krane-cms-handoff';await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const p=resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!p.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'})[extname(p)]||'application/octet-stream');res.end(await readFile(p));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.KRANE_BASE||`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const results=[],inventory=[];
try{for(const role of ['doctor','admin'])for(const width of [390,1440]){
 const context=await browser.newContext({viewport:{width,height:900}});const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(`${base}/cms/cms-${role}.html`,{waitUntil:'networkidle'});
 const ids=await p.locator('section.page[id]').evaluateAll(es=>es.map(e=>e.id));
 for(const id of ids){await p.evaluate(id=>{location.hash=id},id);await p.waitForTimeout(160);
 const state=await p.evaluate(id=>{const e=document.getElementById(id);return {active:e?.classList.contains('is-active'),overflow:document.documentElement.scrollWidth>innerWidth+2,heading:e?.querySelector('h1,h2,.page-head__t')?.textContent.trim(),actions:[...e.querySelectorAll('button,a.btn,input,select,textarea')].map(x=>({tag:x.tagName,type:x.type,label:(x.textContent||x.getAttribute('aria-label')||x.placeholder||'').trim().slice(0,100),id:x.id,attributes:[...x.attributes].filter(a=>a.name.startsWith('data-')).map(a=>[a.name,a.value])}))}},id);
 results.push({test:`${role}/${id}/${width}`,status:state.active&&!state.overflow?'pass':'fail',active:state.active,overflow:state.overflow,severity:state.active?'P2':'P1',steps:`Open cms/cms-${role}.html#${id} at ${width}px`});if(width===1440)inventory.push({role,id,...state});
 if(!state.active||state.overflow)await p.screenshot({path:`${out}/${role}-${id}-${width}.png`});
 }
 results.push({test:`${role}/runtime/${width}`,status:errors.length?'fail':'pass',errors});await context.close();
}
}finally{await writeFile(out+'/results.json',JSON.stringify(results,null,2));await writeFile(out+'/inventory.json',JSON.stringify(inventory,null,2));console.log(JSON.stringify({checks:results.length,failures:results.filter(r=>r.status==='fail'),out},null,2));await browser.close();server.close();}
if(results.some(r=>r.status==='fail'))process.exitCode=1;
