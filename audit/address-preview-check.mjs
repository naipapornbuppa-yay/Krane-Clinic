import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const b=await chromium.launch({headless:true});const p=await b.newPage({viewport:{width:390,height:844}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.addInitScript(()=>sessionStorage.setItem('krane-p01-flow-state-v1',JSON.stringify({patientInfoComplete:true,directGeneralHealthComplete:true,addressDraft:{building:'123',line:'ถนนสุขุมวิท',subdistrict:'คลองตันเหนือ',districtName:'วัฒนา',province:'กรุงเทพมหานคร',postcode:'10110',district:'วัฒนา กรุงเทพมหานคร 10110'}})));
await p.route(/tile.openstreetmap/,r=>r.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64')}));
try{
await p.goto('http://127.0.0.1:5178/b2c/krane-b2c.html#address');
for(const width of [390,573,768,1440,320]){
 await p.setViewportSize({width,height:844});await p.waitForTimeout(250);
 const coverage=await p.locator('#address [data-address-pin-map]').evaluate(host=>{const tiles=[...host.querySelectorAll('img')].map(el=>({x:parseFloat(el.style.left),y:parseFloat(el.style.top),w:el.width,h:el.height}));return {width:host.clientWidth,height:host.clientHeight,left:Math.min(...tiles.map(t=>t.x)),right:Math.max(...tiles.map(t=>t.x+t.w)),top:Math.min(...tiles.map(t=>t.y)),bottom:Math.max(...tiles.map(t=>t.y+t.h))};});
 assert.ok(coverage.left<=0&&coverage.top<=0&&coverage.right>=coverage.width&&coverage.bottom>=coverage.height,JSON.stringify(coverage));
}
assert.equal(await p.locator('#address .address-pin__hint, #address .address-recipient-editor > .hint, #address-readiness').count(),0);
assert.deepEqual(errors,[]);console.log('PASS: map tiles cover full thumbnail at 320/390/573/768/1440px after resizing; three requested helper texts absent; no page errors.');
}finally{await b.close();}
