import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!p.startsWith(root+path.sep))throw Error();res.setHeader('Content-Type',mime[path.extname(p)]||'application/octet-stream');res.end(await fs.readFile(p))}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});const results=[];
try{for(const width of [390,1440])for(const app of ['b2c/krane-b2c.html','developer-handoff/pages/login/index.html']){
 const ctx=await browser.newContext({viewport:{width,height:900}});const p=await ctx.newPage(),errors=[],states=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(`${base}/${app}?public=1#login`);await p.waitForFunction(()=>typeof show==='function');
 await p.evaluate(()=>{seedClinicalDemoStage('waitroom');pendingQueue={startedAt:Date.now(),suspended:true,outcome:'ready'};savePendingQueue();show('queue-resume')});
 const at=async id=>{await p.locator('#'+id+'.active').waitFor();await p.waitForTimeout(250);assert.equal(await p.locator('.screen.active').getAttribute('id'),id);states.push(await p.evaluate(()=>({active:document.querySelector('.screen.active')?.id,suspended:pendingQueue?.suspended})));};
 await at('queue-resume');await p.locator('[data-queue-resume]').click();await at('waitroom');assert.equal(states.at(-1).suspended,false);
 /* The baseline hides this close control; exercise its delegated handler as a lifecycle fixture, not as a visible-UI assertion. */await p.locator('#waitroom.active [data-queue-close]').evaluate(el=>el.click());await at('landing');assert.equal(states.at(-1).suspended,true);
 await p.evaluate(()=>show('waitroom'));await at('queue-resume');await p.locator('[data-queue-resume]').click();await at('waitroom');
 await p.reload();await at('queue-resume');assert.equal(states.at(-1).suspended,true);
 await p.locator('#queue-resume.active [data-queue-book]').click();await at('appointment');assert.equal(await p.evaluate(()=>pendingQueue),null);
 assert.deepEqual(errors,[]);results.push({app,width,status:'pass',states});console.log('PASS queue lifecycle',width,app);await ctx.close();
 }
 for(const width of [390,1440])assert.deepEqual(results.filter(r=>r.width===width)[0].states,results.filter(r=>r.width===width)[1].states);
}finally{await fs.writeFile(path.join(root,'developer-handoff/qa/standalone-queue.json'),JSON.stringify(results,null,2)+'\n');await browser.close();await new Promise(r=>server.close(r));}
console.log('PASS 4 queue lifecycle runs; 14 original/standalone state checkpoints match.');
