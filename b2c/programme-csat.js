/* Public aggregate-only CSAT adapter. Replace data-csat-endpoint with the production endpoint. */
(() => {
 const fit=document.querySelector('.programme-fit');
 if(!fit)return;
 const raw=new URLSearchParams(location.search).get('condition')||'weight';
 const key=({ed:'re-flow','sexual-health':'re-flow','hair-skin':'hair-loss'})[raw]||raw;
 const section=document.createElement('section');section.className='programme-csat';section.setAttribute('aria-labelledby','csat-title');section.dataset.csatEndpoint='csat-demo.json';
 section.innerHTML='<header><h2 id="csat-title">ประสบการณ์เล็ก ๆ<br>ที่ช่วยให้ตัดสินใจง่ายขึ้น</h2></header><div class="programme-csat__body"></div><p class="programme-csat__status" role="status">กำลังโหลดคะแนน…</p>';
 const intro=fit.closest('.programme-intro');
 (intro || fit).after(section);
 // The review tab now targets the comments section; remove the duplicate video rail.
 const removeVideoReviews=()=>{
   const old=document.querySelector('.cd-reviews#reviews');
   if(old){old.querySelectorAll('video').forEach(video=>video.pause());old.remove();}
   section.id='reviews';section.dataset.cdPanel='reviews';
   const tab=document.querySelector('#cd-tab-reviews');
   tab?.addEventListener('click',event=>{
     event.preventDefault();event.stopImmediatePropagation();
     const nav=document.querySelector('.cd-tabs');
     const offset=(parseFloat(getComputedStyle(nav).top)||90)+nav.getBoundingClientRect().height+16;
     section.style.scrollMarginTop=offset+'px';
     window.scrollTo({top:window.scrollY+section.getBoundingClientRect().top-offset,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
     document.querySelectorAll('[data-cd-tab]').forEach(button=>{const active=button===tab;button.classList.toggle('is-active',active);button.setAttribute('aria-selected',String(active));});
   },true);
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',removeVideoReviews,{once:true});else removeVideoReviews();

 const body=section.querySelector('.programme-csat__body'),status=section.querySelector('[role=status]');section.querySelector('header').append(body);
 const node=(tag,text,cls)=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e};
 const comments=node('div','','programme-comments');section.append(comments);
 let reviews=[],selected=0,sort="newest",isDemo=false;
 const english=()=>document.documentElement.lang==='en';
 const local=(th,en)=>english()?en:th;
 let railObserver;
 function renderComments(){
  railObserver?.disconnect();comments.replaceChildren();if(!reviews.length)return;
  if(isDemo)comments.append(node('p',local('ตัวอย่างสมมติสำหรับแสดงหน้าจอ · คะแนนและความคิดเห็นไม่ใช่รีวิวจากผู้รับบริการจริง','Illustrative mock content · Ratings and comments are not real patient reviews'),'programme-comments__disclosure'));
  const toolbar=node('div','','programme-comments__toolbar');toolbar.append(node('h3','ความคิดเห็น'));
  const label=node('label','เรียงตาม '),select=document.createElement('select');
  [['newest','ล่าสุด'],['highest','คะแนนสูงสุด'],['lowest','คะแนนต่ำสุด']].forEach(([value,text])=>{const option=node('option',text);option.value=value;select.append(option)});
  select.value=sort;select.addEventListener('change',()=>{sort=select.value;renderComments();comments.querySelector('select').focus()});label.append(select);toolbar.append(label);comments.append(toolbar);
  const filters=node('div','','programme-comments__filters');filters.setAttribute('aria-label','กรองคะแนนความคิดเห็น');
  [0,5,4,3,2,1].forEach(rating=>{const button=node('button',rating?rating+' ★':'ทั้งหมด');button.type='button';button.setAttribute('aria-pressed',String(selected===rating));button.addEventListener('click',()=>{selected=rating;renderComments();comments.querySelector('[aria-pressed="true"]').focus()});filters.append(button)});comments.append(filters);
  const list=node('div','','programme-comments__list');list.tabIndex=0;list.setAttribute('aria-label','ความคิดเห็น เลื่อนเพื่ออ่านเพิ่มเติม');
  const visible=reviews.filter(r=>!selected||r.rating===selected).sort((a,b)=>sort==='newest'?b.date.localeCompare(a.date):sort==='highest'?b.rating-a.rating:a.rating-b.rating);
  if(!visible.length)list.append(node('p','ยังไม่มีความคิดเห็นในคะแนนนี้','programme-comments__empty'));
  visible.forEach(r=>{
   const article=node('article','','programme-comment'),meta=node('div','','programme-comment__meta');
   const avatar=node('span',Array.from(r.name)[0],'programme-comment__avatar');avatar.setAttribute('aria-hidden','true');
   const identity=node('div');identity.append(node('strong',r.name));
   const time=node('time',new Intl.DateTimeFormat(english()?'en-GB':'th-TH',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(r.date)));time.dateTime=r.date;identity.append(time);meta.append(avatar,identity);
   const stars=node('div','★'.repeat(r.rating)+'☆'.repeat(5-r.rating),'programme-comment__stars');stars.setAttribute('aria-label',r.rating+' จาก 5 ดาว');article.append(stars);
   if(typeof r.title==='string')article.append(node('h3',english()&&r.titleEn?r.titleEn:r.title));
   article.append(node('blockquote','“'+(english()&&r.textEn?r.textEn:r.text)+'”'));
   if(isDemo)article.append(node('small',local('ตัวอย่างสมมติ','Mock example'),'programme-comment__mock'));
   article.dataset.rating=r.rating;
   article.append(meta);
   list.append(article);
  });comments.append(list);
  if(visible.length){
   const dots=node('nav','','programme-comments__dots carousel-dots carousel-dots--inverse');dots.setAttribute('aria-label','หน้าความคิดเห็น');comments.append(dots);
   let targets=[];
   const update=()=>{
    const cards=[...list.querySelectorAll('.programme-comment')];
    const perPage=Math.max(1,Math.round((list.clientWidth+14)/(cards[0].getBoundingClientRect().width+14)));
    const maximum=Math.max(0,list.scrollWidth-list.clientWidth);
    targets=cards.filter((_,i)=>i%perPage===0).map(card=>Math.min(maximum,card.offsetLeft-cards[0].offsetLeft));
    targets=[...new Set(targets)];
    dots.replaceChildren();dots.hidden=targets.length<2;
    targets.forEach((left,i)=>{
     const button=node('button','');button.type='button';
     button.setAttribute('aria-label',local('ไปหน้าความคิดเห็น ','Go to comments page ')+(i+1));
     button.onclick=()=>list.scrollTo({left,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
     dots.append(button);
    });markActive();
   };
   const markActive=()=>{
    const active=targets.reduce((best,target,i)=>Math.abs(target-list.scrollLeft)<Math.abs(targets[best]-list.scrollLeft)?i:best,0);
    [...dots.children].forEach((button,i)=>{button.setAttribute('aria-current',i===active?'page':'false');button.classList.toggle('is-current',i===active)});
   };
   list.addEventListener('scroll',markActive,{passive:true});railObserver=new ResizeObserver(update);railObserver.observe(list);update();
  }
 }
 let pending=false;
 async function refresh(){
  if(pending||document.hidden)return;pending=true;
  try{
   const response=await fetch(section.dataset.csatEndpoint,{cache:'no-cache',signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('CSAT unavailable');
   const payload=await response.json(),d=payload.programmes?.[key];
   if(!d||!Array.isArray(d.distribution)||d.distribution.length!==5||!d.distribution.every(n=>Number.isInteger(n)&&n>=0)||d.distribution.reduce((a,b)=>a+b,0)!==d.total||!Array.isArray(d.dimensions)||!d.dimensions.every(x=>typeof x.label==='string'&&Number.isFinite(x.score)&&x.score>=0&&x.score<=5))throw Error('Invalid aggregate');

   isDemo=payload.demo===true;
   reviews=Array.isArray(d.comments)?d.comments.filter(r=>typeof r.name==='string'&&typeof r.text==='string'&&Number.isInteger(r.rating)&&r.rating>=1&&r.rating<=5&&/^\d{4}-\d{2}-\d{2}$/.test(r.date)&&Number.isFinite(Date.parse(r.date))):[];renderComments();
   const average=d.total?d.distribution.reduce((sum,n,i)=>sum+n*(5-i),0)/d.total:0;
   const score=node('div','','programme-csat__score');score.append(node('strong',d.total?average.toFixed(1):'—'),node('span',' / 5'));
   const detail=node('div','','programme-csat__detail');
   const stars=node('div','★★★★★','programme-csat__stars');stars.setAttribute('aria-label',average.toFixed(1)+' จาก 5 ดาว');stars.style.setProperty('--rating',average/5*100+'%');
   detail.append(stars,node('small',d.total+' การประเมิน'));
   body.replaceChildren(score,detail);status.textContent=d.total?'':'ยังไม่มีการประเมิน';

  }catch(error){comments.replaceChildren();body.replaceChildren();status.textContent='ยังโหลดคะแนนไม่ได้ กรุณาลองใหม่ภายหลัง';}finally{pending=false}
 }
 document.addEventListener('krane:languagechange',renderComments);
 new MutationObserver(renderComments).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 refresh();const timer=setInterval(refresh,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
})();
