/* Public aggregate-only CSAT adapter. Replace data-csat-endpoint with the production endpoint. */
(() => {
 const fit=document.querySelector('.programme-fit');
 if(!fit)return;
 const raw=new URLSearchParams(location.search).get('condition')||'weight';
 const key=({ed:'re-flow','sexual-health':'re-flow','hair-skin':'hair-loss'})[raw]||raw;
 const section=document.createElement('section');section.className='programme-csat';section.setAttribute('aria-labelledby','csat-title');section.dataset.csatEndpoint='csat-demo.json';
 section.innerHTML='<header><h2 id="csat-title">ประสบการณ์เล็ก ๆ<br>ที่ช่วยให้ตัดสินใจง่ายขึ้น</h2><p class="programme-csat__intro">อ่านเรื่องการปรึกษา การติดตาม และความสะดวก<br>จากมุมมองของผู้รับบริการ</p></header><div class="programme-csat__body"></div><p class="programme-csat__status" role="status">กำลังโหลดคะแนน…</p>';
 fit.after(section);
 const body=section.querySelector('.programme-csat__body'),status=section.querySelector('[role=status]');
 const node=(tag,text,cls)=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e};
 const comments=node('div','','programme-comments');section.append(comments);
 let reviews=[];
 function renderComments(){
  comments.replaceChildren();if(!reviews.length)return;
  const list=node('div','','programme-comments__list');
  reviews.forEach(r=>{
   const article=node('article','','programme-comment'),meta=node('div','','programme-comment__meta');
   const avatar=node('span',Array.from(r.name)[0],'programme-comment__avatar');avatar.setAttribute('aria-hidden','true');
   const identity=node('div');identity.append(node('strong',r.name));
   const time=node('time',new Intl.DateTimeFormat('th-TH',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(r.date)));time.dateTime=r.date;identity.append(time);meta.append(avatar,identity);
   article.append(meta);
   if(typeof r.title==='string')article.append(node('h3',r.title));
   article.append(node('blockquote','“'+r.text+'”'));
   list.append(article);
  });comments.append(list);
 }
 let pending=false;
 async function refresh(){
  if(pending||document.hidden)return;pending=true;
  try{
   const response=await fetch(section.dataset.csatEndpoint,{cache:'no-cache',signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('CSAT unavailable');
   const payload=await response.json(),d=payload.programmes?.[key];
   if(!d||!Array.isArray(d.distribution)||d.distribution.length!==5||!d.distribution.every(n=>Number.isInteger(n)&&n>=0)||d.distribution.reduce((a,b)=>a+b,0)!==d.total||!Array.isArray(d.dimensions)||!d.dimensions.every(x=>typeof x.label==='string'&&Number.isFinite(x.score)&&x.score>=0&&x.score<=5))throw Error('Invalid aggregate');

   reviews=Array.isArray(d.comments)?d.comments.filter(r=>typeof r.name==='string'&&typeof r.text==='string'&&Number.isInteger(r.rating)&&r.rating>=1&&r.rating<=5&&/^\d{4}-\d{2}-\d{2}$/.test(r.date)&&Number.isFinite(Date.parse(r.date))):[];renderComments();
   const average=d.total?d.distribution.reduce((sum,n,i)=>sum+n*(5-i),0)/d.total:0;
   const score=node('div','','programme-csat__score');score.append(node('strong',d.total?average.toFixed(1):'—'),node('span',' / 5'));
   const detail=node('div','','programme-csat__detail');
   const stars=node('div','★★★★★','programme-csat__stars');stars.setAttribute('aria-label',average.toFixed(1)+' จาก 5 ดาว');stars.style.setProperty('--rating',average/5*100+'%');
   detail.append(stars,node('p','ความพึงพอใจต่อบริการ'),node('small',(payload.demo?'ข้อมูลตัวอย่าง · ':'')+d.total+' การประเมิน'));
   body.replaceChildren(score,detail);status.textContent=d.total?'':'ยังไม่มีการประเมิน';

  }catch(error){comments.replaceChildren();body.replaceChildren();status.textContent='ยังโหลดคะแนนไม่ได้ กรุณาลองใหม่ภายหลัง';}finally{pending=false}
 }
 refresh();const timer=setInterval(refresh,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
})();
