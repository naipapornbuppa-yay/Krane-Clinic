/* B2C renderer using the shared prototype editorial store. Replace transport with the agreed CMS API. */
(function () {
  'use strict';
  let articles = window.KraneArticleStore.published();
  let byId = Object.fromEntries(articles.map(article => [article.id,article]));
  const requested = new URLSearchParams(location.search).get('article');
  let selectedId = byId[requested] ? requested : articles[0].id;
  let filter = 'all';
  const el = (tag,className,text) => {
    const node=document.createElement(tag);
    if(className) node.className=className;
    if(text != null) node.textContent=text;
    return node;
  };
  function articleAuthor(article){
    const row=el('span','article-author');
    const photo=el('img','article-author__photo');photo.src=article.author.photo;photo.alt='';photo.width=40;photo.height=40;
    const text=el('span','article-author__text');text.append(el('strong','',article.author.name),el('small','','ผู้เขียนตัวอย่าง · อัปเดต ต.ค. 2569'));
    row.append(photo,text);return row;
  }
  function articleReadAction(){
    const action=el('span','article-teaser__action','อ่านบทความ');
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('class','ui-icon ui-icon--sm');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M5 12h14M12 5l7 7-7 7');svg.append(path);action.append(svg);return action;
  }
  function renderFeed(){
    const feed=document.querySelector('[data-article-feed]');
    if(!feed) return;
    const query=(document.querySelector('[data-article-search]')?.value || '').trim().toLocaleLowerCase('th');
    const visible=articles.filter(article =>
      (filter==='all' || article.category===filter) &&
      (!query || [article.title,article.summary,article.categoryLabel,...article.tags].join(' ').toLocaleLowerCase('th').includes(query)));
    feed.replaceChildren(...visible.map((article,index) => {
      const button=el('button','article-teaser' + (index ? ' article-teaser--compact' : ''));
      button.type='button';button.dataset.go='article';button.dataset.articleId=article.id;
      const image=el('img','article-teaser__image');image.src=article.image;image.alt=article.imageAlt;image.loading='lazy';image.width=1280;image.height=800;
      const body=el('span','article-teaser__body');
      body.append(el('span','article-teaser__meta',article.categoryLabel+' · อ่าน '+article.minutes+' นาที'),
        el('span','article-teaser__title',article.title),el('span','article-teaser__summary',article.summary),
        articleReadAction());
      body.append(articleAuthor(article));button.append(image,body);return button;
    }));
    const empty=document.querySelector('[data-article-empty]');if(empty) empty.hidden=visible.length>0;
  }
  function renderDetail(){
    const article=byId[selectedId] || articles[0];
    const screen=document.getElementById('article');if(!screen) return;
    screen.dataset.articleId=article.id;
    screen.querySelector('[data-article-hero]').src=article.image;
    screen.querySelector('[data-article-hero]').alt=article.imageAlt;
    screen.querySelector('[data-article-meta]').textContent=article.categoryLabel+' · อ่าน '+article.minutes+' นาที';
    screen.querySelector('[data-article-title]').textContent=article.title;
    screen.querySelector('[data-article-byline]').replaceChildren(articleAuthor(article));
    screen.querySelector('[data-article-summary]').textContent=article.summary;
    const body=screen.querySelector('[data-article-body]');
    body.replaceChildren(...article.sections.map(section => {
      const block=el('section','article-reading__section');
      block.append(el('h3','',section.heading),el('p','',section.copy));return block;
    }));
    const source=el('a','article-reading__source','อ่านแหล่งข้อมูลประกอบ');
    source.href=article.source;source.target='_blank';source.rel='noopener noreferrer';body.append(source);
    const tags=screen.querySelector('[data-article-tags]');
    tags.replaceChildren(...article.tags.map(tag => el('span','article-tags__tag',tag)));
  }
  document.addEventListener('click',event => {
    const card=event.target.closest('[data-article-id][data-go="article"]');
    if(card && byId[card.dataset.articleId]) selectedId=card.dataset.articleId;
    const choice=event.target.closest('[data-article-filter]');
    if(choice){filter=choice.dataset.articleFilter;document.querySelectorAll('[data-article-filter]').forEach(button => button.setAttribute('aria-pressed',String(button===choice)));renderFeed();}
  },true);
  document.querySelector('[data-article-search]')?.addEventListener('input',renderFeed);
  window.kraneArticleMock={renderFeed,renderDetail,select(id){if(byId[id]) selectedId=id;},articles};
  window.addEventListener('krane-articles-changed',()=>{
    articles=window.KraneArticleStore.published();byId=Object.fromEntries(articles.map(a=>[a.id,a]));
    window.kraneArticleMock.articles=articles;renderFeed();renderDetail();
  });
  renderFeed();
})();
