/* Public aggregate-only CSAT adapter. Replace data-csat-endpoint with the production endpoint. */
(() => {
 const fit=document.querySelector('.programme-fit');
 if(!fit)return;
 const raw=new URLSearchParams(location.search).get('condition')||'weight';
 const key=({ed:'re-flow','sexual-health':'re-flow','hair-skin':'hair-loss'})[raw]||raw;
 const section=document.createElement('section');section.className='programme-csat';section.setAttribute('aria-labelledby','csat-title');section.dataset.csatEndpoint='csat-demo.json';
 section.innerHTML='<header><h2 id="csat-title">ประสบการณ์เล็ก ๆ<br>ที่ช่วยให้ตัดสินใจง่ายขึ้น</h2><p class="programme-csat__intro">อ่านเรื่องการปรึกษา การติดตาม และความสะดวก<br>จากมุมมองของผู้รับบริการ</p></header><div class="programme-csat__body"></div><p class="programme-csat__status" role="status">กำลังโหลดคะแนน…</p>';
 const intro=fit.closest('.programme-intro');
 (intro || fit).after(section);
 // The review tab now targets the comments section; remove the duplicate video rail.
 const removeVideoReviews=()=>{
   const old=document.querySelector('.cd-reviews#reviews');
   if(old){old.querySelectorAll('video').forEach(video=>video.pause());old.remove();}
   section.id='reviews';section.dataset.cdPanel='reviews';
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',removeVideoReviews,{once:true});else removeVideoReviews();

 const body=section.querySelector('.programme-csat__body'),status=section.querySelector('[role=status]');
 const node=(tag,text,cls)=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e};
 const comments=node('div','','programme-comments');section.append(comments);
 let reviews=[],selected=0,sort="newest",page=1;
 const PAGE_SIZE=3;
 function renderComments(){
  comments.replaceChildren();if(!reviews.length)return;
  const toolbar=node('div','','programme-comments__toolbar');toolbar.append(node('h3','ความคิดเห็น'));
  const label=node('label','เรียงตาม '),select=document.createElement('select');
  [['newest','ล่าสุด'],['highest','คะแนนสูงสุด'],['lowest','คะแนนต่ำสุด']].forEach(([value,text])=>{const option=node('option',text);option.value=value;select.append(option)});
  select.value=sort;select.addEventListener('change',()=>{sort=select.value;page=1;renderComments();comments.querySelector('select').focus()});label.append(select);toolbar.append(label);comments.append(toolbar);
  const filters=node('div','','programme-comments__filters');filters.setAttribute('aria-label','กรองคะแนนความคิดเห็น');
  [0,5,4,3,2,1].forEach(rating=>{const button=node('button',rating?rating+' ★':'ทั้งหมด');button.type='button';button.setAttribute('aria-pressed',String(selected===rating));button.addEventListener('click',()=>{selected=rating;page=1;renderComments();comments.querySelector('[aria-pressed="true"]').focus()});filters.append(button)});comments.append(filters);
  const list=node('div','','programme-comments__list');list.setAttribute('aria-live','polite');
  const visible=reviews.filter(r=>!selected||r.rating===selected).sort((a,b)=>sort==='newest'?b.date.localeCompare(a.date):sort==='highest'?b.rating-a.rating:a.rating-b.rating);
  if(!visible.length)list.append(node('p','ยังไม่มีความคิดเห็นในคะแนนนี้','programme-comments__empty'));
  const pages=Math.max(1,Math.ceil(visible.length/PAGE_SIZE));
  page=Math.min(page,pages);
  visible.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE).forEach(r=>{
   const article=node('article','','programme-comment'),meta=node('div','','programme-comment__meta');
   const avatar=node('span',Array.from(r.name)[0],'programme-comment__avatar');avatar.setAttribute('aria-hidden','true');
   const identity=node('div');identity.append(node('strong',r.name));
   const time=node('time',new Intl.DateTimeFormat('th-TH',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(r.date)));time.dateTime=r.date;identity.append(time);meta.append(avatar,identity);
   const stars=node('div','★'.repeat(r.rating)+'☆'.repeat(5-r.rating),'programme-comment__stars');stars.setAttribute('aria-label',r.rating+' จาก 5 ดาว');article.append(stars);
   if(typeof r.title==='string')article.append(node('h3',r.title));
   article.append(node('blockquote','“'+r.text+'”'));
   article.append(meta);
   list.append(article);
  });comments.append(list);
  if(pages>1){
   const pagination=node('nav','','programme-comments__pagination');pagination.setAttribute('aria-label','หน้าความคิดเห็น');
   const changePage=(next)=>{page=next;renderComments();const controls=comments.querySelector('.programme-comments__pagination');controls?.querySelector('button:not([disabled])')?.focus({preventScroll:true});comments.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});};
   const previous=node('button','ก่อนหน้า');previous.type='button';previous.disabled=page===1;previous.addEventListener('click',()=>changePage(page-1));
   const count=node('span',`หน้า ${page} / ${pages}`);count.setAttribute('role','status');
   const next=node('button','ถัดไป');next.type='button';next.disabled=page===pages;next.addEventListener('click',()=>changePage(page+1));
   pagination.append(previous,count,next);comments.append(pagination);
  }
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
