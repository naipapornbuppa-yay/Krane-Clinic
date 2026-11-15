/* Content shared with the library and real review media. */
(() => {
  const rail=document.querySelector('.articles-row');
  if(rail && window.KraneArticleStore){
    const pictures={'library-hair-loss-01':'47474','library-hair-loss-02':'3685a','library-hair-loss-03':'6cc8a','library-hair-loss-04':'03780','library-hair-loss-05':'44179','library-obesity-01':'205e9','library-obesity-02':'cb6f7','library-obesity-03':'fd1f4','library-obesity-04':'c7aa8','library-obesity-05':'55226','library-ed-01':'34c1d','library-ed-02':'e8d07','library-ed-03':'cb867','library-ed-04':'d8f5e','library-ed-05':'7a06d'};
    const articles=KraneArticleStore.published();
    const order=Object.keys(pictures);
    articles.sort((a,b)=>(order.includes(a.id)?order.indexOf(a.id):99)-(order.includes(b.id)?order.indexOf(b.id):99));
    for(const article of articles){
      const li=document.createElement('li'),a=document.createElement('a');
      a.dataset.articleId=article.id;if(pictures[article.id])a.dataset.landingImage='assets/landing-exact/'+pictures[article.id]+'.png';a.href='articles.html?article='+encodeURIComponent(article.id);
      li.append(a);rail.append(li);
    }
    window.dispatchEvent(new Event('krane-articles-changed'));
  }
  document.querySelectorAll('[data-landing-review]').forEach(button=>button.addEventListener('click',()=>{const items=(window.KraneReviews||[]).map(item=>({...item,attribution:[item.name,item.province].filter(Boolean).join(' · ')}));document.dispatchEvent(new CustomEvent('krane:open-review-stories',{detail:{items,activeId:button.dataset.landingReview,trigger:button}}));}));
  document.querySelectorAll('[data-rail-dots]').forEach(dots=>{
    const rail=dots.parentElement.querySelector(dots.dataset.railDots);
    const update=()=>{const max=rail.scrollWidth-rail.clientWidth;const count=Math.max(1,Math.ceil(rail.scrollWidth/rail.clientWidth));dots.replaceChildren();for(let i=0;i<count;i++){const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','ความคิดเห็น หน้าที่ '+(i+1));b.setAttribute('aria-current',String(i===Math.round(rail.scrollLeft/Math.max(1,max)*(count-1))));b.onclick=()=>rail.scrollTo({left:count===1?0:max*i/(count-1),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});dots.append(b);}};
    new ResizeObserver(update).observe(rail);rail.addEventListener('scroll',update,{passive:true});update();
  });
})();
