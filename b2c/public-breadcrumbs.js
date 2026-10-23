(()=>{
 const run=()=>document.querySelectorAll('main a.back-link,main a.public-back').forEach(back=>{
  if(back.closest('.public-breadcrumb'))return;
  const scope=back.closest('#article,#library')||document.querySelector('main');
  const heading=scope.querySelector('h1');
  const nav=document.createElement('nav');nav.className='public-breadcrumb';nav.setAttribute('aria-label','Breadcrumb');
  const home=document.createElement('a');home.href='krane-b2c-landing.html';home.textContent='Krane';nav.append(home);
  const sep=()=>{const e=document.createElement('span');e.textContent='›';e.setAttribute('aria-hidden','true');nav.append(e)};
  if(!back.href.includes('krane-b2c-landing.html')){sep();const parent=back.cloneNode(true);parent.className='';parent.replaceChildren(document.createTextNode(back.textContent.trim().replace(/^กลับหน้า(?:โปรแกรม)?\s*/,'')));nav.append(parent)}
  sep();const current=document.createElement('span');current.setAttribute('aria-current','page');nav.append(current);
  const sync=()=>current.textContent=heading?.textContent.trim()||document.title.split('|')[0];sync();if(heading)new MutationObserver(sync).observe(heading,{childList:true,subtree:true,characterData:true});
  const hero=back.closest('.library-hero,.info-hero,.doctors-hero,.detail-hero,.safety-hero,.condition-hero,.pricing-hero');
  if(hero){hero.before(nav);back.remove()}else back.replaceWith(nav);
 });
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();