/* Public aggregate-only CSAT adapter. Replace data-csat-endpoint with the production endpoint. */
(() => {
 const fit=document.querySelector('.programme-fit');
 if(!fit)return;
 const raw=new URLSearchParams(location.search).get('condition')||'weight';
 const key=({ed:'re-flow','sexual-health':'re-flow','hair-skin':'hair-loss'})[raw]||raw;
 const section=document.createElement('section');section.className='programme-csat';section.setAttribute('aria-labelledby','csat-title');section.dataset.csatEndpoint='csat-demo.json';
 section.innerHTML='<header><div><p class="programme-csat__eyebrow">คะแนนประสบการณ์การดูแล</p><h2 id="csat-title">เสียงตอบรับต่อโปรแกรม</h2></div></header><div class="programme-csat__body"></div><p class="programme-csat__status" role="status">กำลังโหลดคะแนน…</p>';
 fit.after(section);
 const body=section.querySelector('.programme-csat__body'),status=section.querySelector('[role=status]');
 const node=(tag,text,cls)=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e};
 let pending=false;
 async function refresh(){
  if(pending||document.hidden)return;pending=true;
  try{
   const response=await fetch(section.dataset.csatEndpoint,{cache:'no-cache',signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('CSAT unavailable');
   const payload=await response.json(),d=payload.programmes?.[key];
   if(!d||!Array.isArray(d.distribution)||d.distribution.length!==5||!d.distribution.every(n=>Number.isInteger(n)&&n>=0)||d.distribution.reduce((a,b)=>a+b,0)!==d.total||!Array.isArray(d.dimensions)||!d.dimensions.every(x=>typeof x.label==='string'&&Number.isFinite(x.score)&&x.score>=0&&x.score<=5))throw Error('Invalid aggregate');

   const average=d.total?d.distribution.reduce((sum,n,i)=>sum+n*(5-i),0)/d.total:0;
   const score=node('div','','programme-csat__score');score.append(node('strong',d.total?average.toFixed(1):'—'),node('span',' / 5'));
   const stars=node('div','★★★★★','programme-csat__stars');stars.setAttribute('aria-label',average.toFixed(1)+' จาก 5 ดาว');stars.style.setProperty('--rating',average/5*100+'%');score.append(stars,node('p',d.total+' การประเมิน'+(payload.demo?'จำลอง':'')));
   const bars=node('div','','programme-csat__bars');d.distribution.forEach((n,i)=>{const row=node('div');row.append(node('span',(5-i)+' ★'));const bar=document.createElement('meter');bar.min=0;bar.max=d.total||1;bar.value=n;bar.setAttribute('aria-label',(5-i)+' ดาว '+n+' การประเมิน');row.append(bar,node('span',String(n)));bars.append(row)});
   const dimensions=node('ul','','programme-csat__dimensions');d.dimensions.forEach(x=>{const li=node('li');li.append(node('span',x.label),node('strong',x.score.toFixed(1)+' / 5'));dimensions.append(li)});
   body.replaceChildren(score,bars,dimensions);status.textContent=d.total?'คะแนนด้านประสบการณ์บริการ ไม่ใช่ผลลัพธ์ทางการรักษา':'ยังไม่มีการประเมิน';
  }catch(error){body.replaceChildren();status.textContent='ยังโหลดคะแนนไม่ได้ กรุณาลองใหม่ภายหลัง';}finally{pending=false}
 }
 refresh();const timer=setInterval(refresh,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
})();
