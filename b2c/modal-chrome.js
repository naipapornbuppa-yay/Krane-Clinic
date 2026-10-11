/* Shared dismissal chrome; reuse each dialog's existing close action for cleanup. */
(()=>{
 const mounted=new WeakSet();
 function mount(layer){
  if(mounted.has(layer))return;
  const panel=layer.querySelector('.modal-dialog');if(!panel)return;mounted.add(layer);
  const scrim=layer.querySelector('.modal-layer__scrim');
  const oldClose=[...panel.querySelectorAll('button')].find(b=>[...b.attributes].some(a=>/^data-.*close$/.test(a.name))||/ปิด|close/i.test(b.getAttribute('aria-label')||''));
  function dismiss(){
   if(oldClose)oldClose.click();else if(scrim)scrim.click();
   if(!layer.hidden){layer.hidden=true;layer.setAttribute('aria-hidden','true');}
   if(!document.querySelector('.modal-layer:not([hidden])'))document.body.classList.remove('modal-open');
  }
  const handle=document.createElement('span');handle.className='shared-sheet-handle';handle.setAttribute('aria-hidden','true');panel.prepend(handle);
  if(oldClose && (oldClose.className.includes('close') || /ปิด|close/i.test(oldClose.getAttribute('aria-label')||'')))oldClose.hidden=true;
  const close=document.createElement('button');close.type='button';close.className='shared-modal-close';close.setAttribute('aria-label','ปิดหน้าต่าง');close.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';close.onclick=dismiss;panel.prepend(close);
  if(scrim)scrim.addEventListener('click',()=>{if(oldClose)oldClose.click();else queueMicrotask(()=>{layer.hidden=true;layer.setAttribute('aria-hidden','true');if(!document.querySelector('.modal-layer:not([hidden])'))document.body.classList.remove('modal-open');});});
  layer.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();dismiss();}});
 }
 function scan(){document.querySelectorAll('.modal-layer').forEach(mount)}
 new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});scan();
})();
