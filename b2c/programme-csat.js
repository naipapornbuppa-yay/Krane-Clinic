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
 const comments=node('div','','programme-comments');section.append(comments);
 let selected=0,sort='newest',reviews=[],demo=false;
 function renderComments(){
  comments.replaceChildren();if(!reviews.length)return;
  const toolbar=node('div','','programme-comments__toolbar');
  const heading=node('h3','ความคิดเห็น');toolbar.append(heading);
  const label=node('label','เรียงตาม '),select=document.createElement('select');
  [['newest','ล่าสุด'],['highest','คะแนนสูงสุด'],['lowest','คะแนนต่ำสุด']].forEach(([value,text])=>{const option=node('option',text);option.value=value;select.append(option)});select.value=sort;select.addEventListener('change',()=>{sort=select.value;renderComments()});label.append(select);toolbar.append(label);comments.append(toolbar);
  const filters=node('div','','programme-comments__filters');filters.setAttribute('aria-label','กรองคะแนนความคิดเห็น');
  [0,5,4,3,2,1].forEach(rating=>{const button=node('button',rating?rating+' ★':'ทั้งหมด');button.type='button';button.setAttribute('aria-pressed',String(selected===rating));button.addEventListener('click',()=>{selected=rating;renderComments();comments.querySelectorAll('.programme-comments__filters button')[[0,5,4,3,2,1].indexOf(rating)].focus()});filters.append(button)});comments.append(filters);
  const list=node('div','','programme-comments__list');list.setAttribute('aria-live','polite');
  const visible=reviews.filter(r=>!selected||r.rating===selected).sort((a,b)=>sort==='newest'?b.date.localeCompare(a.date):sort==='highest'?b.rating-a.rating:a.rating-b.rating);
  visible.forEach(r=>{const article=node('article','','programme-comment'),meta=node('div','','programme-comment__meta');meta.append(node('strong',r.name));const time=node('time',new Intl.DateTimeFormat('th-TH',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(r.date)));time.dateTime=r.date;meta.append(time);const stars=node('div','★'.repeat(r.rating)+'☆'.repeat(5-r.rating),'programme-comment__stars');stars.setAttribute('aria-label',r.rating+' จาก 5 ดาว');article.append(meta,stars,node('p',r.text));list.append(article)});
  if(!visible.length)list.append(node('p','ยังไม่มีความคิดเห็นในคะแนนนี้'));comments.append(list);
 }
 let pending=false;
 async function refresh(){
  if(pending||document.hidden)return;pending=true;
  try{
   const response=await fetch(section.dataset.csatEndpoint,{cache:'no-cache',signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('CSAT unavailable');
   const payload=await response.json(),d=payload.programmes?.[key];
   if(!d||!Array.isArray(d.distribution)||d.distribution.length!==5||!d.distribution.every(n=>Number.isInteger(n)&&n>=0)||d.distribution.reduce((a,b)=>a+b,0)!==d.total||!Array.isArray(d.dimensions)||!d.dimensions.every(x=>typeof x.label==='string'&&Number.isFinite(x.score)&&x.score>=0&&x.score<=5))throw Error('Invalid aggregate');

   reviews=Array.isArray(d.comments)?d.comments.filter(r=>typeof r.name==='string'&&typeof r.text==='string'&&Number.isInteger(r.rating)&&r.rating>=1&&r.rating<=5&&/^\d{4}-\d{2}-\d{2}$/.test(r.date)&&Number.isFinite(Date.parse(r.date))):[];demo=payload.demo===true;renderComments();
   const average=d.total?d.distribution.reduce((sum,n,i)=>sum+n*(5-i),0)/d.total:0;
   const score=node('div','','programme-csat__score');score.append(node('strong',d.total?average.toFixed(1):'—'),node('span',' / 5'));
   const stars=node('div','★★★★★','programme-csat__stars');stars.setAttribute('aria-label',average.toFixed(1)+' จาก 5 ดาว');stars.style.setProperty('--rating',average/5*100+'%');score.append(stars,node('p',d.total+' การประเมิน'));
   const bars=node('div','','programme-csat__bars');d.distribution.forEach((n,i)=>{const row=node('div');row.append(node('span',(5-i)+' ★'));const bar=document.createElement('meter');bar.min=0;bar.max=d.total||1;bar.value=n;bar.setAttribute('aria-label',(5-i)+' ดาว '+n+' การประเมิน');row.append(bar,node('span',String(n)));bars.append(row)});
   const dimensions=node('ul','','programme-csat__dimensions');d.dimensions.forEach(x=>{const li=node('li');li.append(node('span',x.label),node('strong',x.score.toFixed(1)+' / 5'));dimensions.append(li)});
   body.replaceChildren(score,bars,dimensions);status.textContent=payload.demo?'ข้อมูลตัวอย่าง':d.total?'':'ยังไม่มีการประเมิน';
  }catch(error){comments.replaceChildren();body.replaceChildren();status.textContent='ยังโหลดคะแนนไม่ได้ กรุณาลองใหม่ภายหลัง';}finally{pending=false}
 }
 refresh();const timer=setInterval(refresh,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
})();
