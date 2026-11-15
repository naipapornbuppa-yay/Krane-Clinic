/* Landing previews use the same card anatomy as the article library. */
(()=>{
 const el=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls;if(text)n.textContent=text;return n;};
 function arrow(){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('class','article-teaser__arrow');
  svg.setAttribute('viewBox','0 0 24 24');
  svg.setAttribute('fill','none');
  svg.setAttribute('stroke','currentColor');
  svg.setAttribute('stroke-linecap','round');
  svg.setAttribute('stroke-linejoin','round');
  svg.setAttribute('aria-hidden','true');
  const path=document.createElementNS(svg.namespaceURI,'path');
  path.setAttribute('d','M5 12h14m-7-7 7 7-7 7');
  svg.append(path);
  return svg;
 }
 function render(){const byId=Object.fromEntries(KraneArticleStore.published().map(a=>[a.id,a]));document.querySelectorAll('.articles-row [data-article-id]').forEach(card=>{let a=byId[card.dataset.articleId];if(!a)return;const en=document.documentElement.lang==='en';if(en&&a.en)a={...a,...a.en,categoryLabel:({hair:'Hair loss',weight:'Weight','sexual-health':'Sexual health'})[a.category]||a.categoryLabel};card.className='article-teaser';const image=el('img','article-teaser__image');if(card.dataset.landingImage){image.src=card.dataset.landingImage;image.alt=a.title;}else window.KraneArticleImage.bind(image,a);image.loading='lazy';image.width=1280;image.height=800;const body=el('span','article-teaser__body');body.append(el('span','article-teaser__meta',a.categoryLabel),el('span','article-teaser__title',a.title),el('span','article-teaser__summary',a.summary));const footer=el('span','article-teaser__footer');footer.append(el('span','article-read-time',en?`${a.minutes}-minute read`:`อ่าน ${a.minutes} นาที`),arrow());body.append(footer);card.replaceChildren(image,body);});}
 render();new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});window.addEventListener('krane-articles-changed',render);
})();
