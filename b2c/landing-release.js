/* Content shared with the library and real review media. */
(() => {
  const rail=document.querySelector('.articles-row');
  if(rail && window.KraneArticleStore){
    for(const article of KraneArticleStore.published()){
      const li=document.createElement('li'),a=document.createElement('a');
      a.dataset.articleId=article.id;a.href='articles.html?article='+encodeURIComponent(article.id);
      li.append(a);rail.append(li);
    }
    window.dispatchEvent(new Event('krane-articles-changed'));
  }
  document.querySelectorAll('[data-care-reviews]').forEach(section=>{
    const category={'hair-skin':'hair-loss','sexual-health':'sexual-health'}[section.dataset.careReviews]||section.dataset.careReviews;
    let rows=(window.KraneReviews||[]).filter(r=>r.category===category);
    if(!rows.length)rows=(window.KraneReviews||[]).filter(r=>r.id==='confidence-real-med');
    rows.forEach(r=>{
      const card=document.createElement('article');card.className='care-quote';
      const icon=document.createElement('span');icon.className='stars';icon.textContent='“';icon.setAttribute('aria-hidden','true');
      const p=document.createElement('p');p.textContent=(r.quote||r.caption).replace(/<br\s*\/?>/g,' ');
      const name=document.createElement('small');name.textContent=r.name;
      const button=document.createElement('button');button.type='button';button.className='care-quote__watch';button.textContent='ดูเรื่องราว →';
      button.addEventListener('click',()=>document.dispatchEvent(new CustomEvent('krane:open-review-stories',{detail:{items:rows,activeId:r.id,trigger:button}})));
      card.append(icon,p,name,button);section.querySelector('.care-quotes').append(card);
    });
  });
})();
