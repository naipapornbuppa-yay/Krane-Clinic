/* Storage preferences for the current static site. No optional providers exist.
   Adding a provider requires a policy/inventory update and a new consent version;
   never load an optional script merely because decision is "accept_all". */
(() => {
 'use strict';
 const KEY='krane_cookie_preferences_v1',VERSION=1;
 const base=new URL('.',document.currentScript.src),policy=new URL('cookies.html',base).href;
 const words={
  title:['คุกกี้และความเป็นส่วนตัว','Cookies and privacy'],
  intro:['เราใช้พื้นที่เก็บข้อมูลในเบราว์เซอร์เพื่อให้เว็บไซต์ทำงานและจำภาษาที่คุณเลือก ขณะนี้ไม่มีเครื่องมือวิเคราะห์หรือโฆษณา','We use browser storage to operate the site and remember your chosen language. No analytics or advertising tools are currently used.'],
  policy:['อ่านเรื่องคุกกี้และข้อมูลในเบราว์เซอร์','Read the cookie and storage notice'],
  reject:['ใช้เฉพาะที่จำเป็น','Necessary only'],accept:['ยอมรับทั้งหมด','Accept all'],settings:['ตั้งค่าคุกกี้','Cookie settings'],
  preferences:['การตั้งค่าความเป็นส่วนตัว','Privacy preferences'],
  explanation:['เลือกได้ว่าจะอนุญาตข้อมูลเสริมหรือไม่ รุ่นนี้ยังไม่มีหมวดเสริมให้เปิดใช้ ทุกตัวเลือกจึงคงเฉพาะข้อมูลที่จำเป็น','Choose whether to allow optional storage. This version has no optional categories to enable, so every choice currently keeps necessary storage only.'],
  necessary:['ข้อมูลที่จำเป็น','Necessary storage'],necessaryCopy:['ใช้สำหรับการทำงานของเว็บไซต์ ภาษาที่เลือก และการจำตัวเลือกความเป็นส่วนตัวของคุณ','Used for site functions, your chosen language, and remembering your privacy choice.'],always:['ใช้งานเสมอ','Always active'],
  analytics:['การวิเคราะห์การใช้งาน','Analytics'],advertising:['การโฆษณา','Advertising'],notUsed:['ยังไม่มีการใช้งาน','Not used on this site'],off:['ปิดอยู่','Off'],
  save:['บันทึกการตั้งค่า','Save preferences'],close:['ปิดการตั้งค่า','Close settings'],saved:['บันทึกตัวเลือกความเป็นส่วนตัวแล้ว','Privacy choice saved'],session:['บันทึกได้เฉพาะเซสชันของแท็บนี้','Saved for this tab session only'],memory:['เบราว์เซอร์ไม่อนุญาตให้บันทึก จะใช้ตัวเลือกนี้เฉพาะหน้านี้','Browser storage is unavailable. This choice applies to this page only.']
 };
 const english=()=>document.documentElement.lang==='en';
 const label=key=>words[key][english()?1:0];
 const valid=record=>record&&record.version===VERSION&&record.necessary===true&&record.analytics===false&&record.advertising===false&&['necessary_only','accept_all','save'].includes(record.decision)&&typeof record.savedAt==='string'&&Number.isFinite(Date.parse(record.savedAt));
 function read(){for(const name of ['localStorage','sessionStorage'])try{const record=JSON.parse(window[name].getItem(KEY));if(valid(record))return record;}catch{}return null;}
 let current=read(),banner,dialog,returnFocus,status,statusKey,statusTimer;
 function open(opener){
  if(window.top!==window.self){try{window.top.KraneCookieConsent?.open(opener);return;}catch{return;}}
  returnFocus=opener||document.activeElement;
  if(!dialog.open){translate();dialog.showModal();dialog.querySelector('h2').focus();}
 }
 window.KraneCookieConsent={open,getPreferences:()=>({...current,necessary:true,analytics:false,advertising:false}),isAllowed:category=>category==='necessary'};
 function translate(){
  document.querySelectorAll('[data-cookie-copy]').forEach(el=>el.textContent=label(el.dataset.cookieCopy));
  document.querySelectorAll('[data-cookie-label]').forEach(el=>el.setAttribute('aria-label',label(el.dataset.cookieLabel)));
  if(banner)banner.setAttribute('aria-label',label('title'));
  if(status&&statusKey)status.textContent=label(statusKey);
 }
 document.addEventListener('click',event=>{
  const target=event.target.closest('[data-cookie-settings],a[href]');if(!target)return;
  let settings=target.hasAttribute('data-cookie-settings');
  if(!settings&&target.tagName==='A'){const url=new URL(target.href,location.href);settings=url.origin===location.origin&&url.pathname.endsWith('/cookies.html')&&url.hash==='#controls';}
  if(settings){event.preventDefault();open(target);}
 });
 // The shell owns consent when the marketing landing is embedded in the app.
 if(window.top!==window.self)return;
 const span=key=>'<span data-cookie-copy="'+key+'">'+label(key)+'</span>';
 const button=(action,key)=>'<button type="button" data-cookie-action="'+action+'">'+span(key)+'</button>';
 function save(decision){
  current={version:VERSION,necessary:true,analytics:false,advertising:false,decision,savedAt:new Date().toISOString()};
  let stored='memory';for(const name of ['localStorage','sessionStorage'])try{window[name].setItem(KEY,JSON.stringify(current));stored=name;break;}catch{}
  banner.hidden=true;
  if(dialog.open)dialog.close();
  statusKey=stored==='localStorage'?'saved':stored==='sessionStorage'?'session':'memory';status.textContent=label(statusKey);
  clearTimeout(statusTimer);statusTimer=setTimeout(()=>{status.textContent='';statusKey=null;},5000);
  window.dispatchEvent(new CustomEvent('krane:cookiechange',{detail:{...current}}));
 }
 function boot(){
  banner=document.createElement('aside');banner.className='krane-cookie-banner';banner.dataset.cookieBanner='';banner.hidden=Boolean(current);
  banner.innerHTML='<img src="'+new URL('../assets/brand-final/krane-lockup.svg',base).href+'" width="158" height="24" alt="Krane Clinic"><h2>'+span('title')+'</h2><p>'+span('intro')+'</p><a href="'+policy+'">'+span('policy')+'</a><div class="krane-cookie-actions">'+button('reject','reject')+button('accept','accept')+button('open','settings')+'</div>';
  dialog=document.createElement('dialog');dialog.className='krane-cookie-dialog';dialog.dataset.cookiePreferences='';dialog.setAttribute('aria-labelledby','krane-cookie-heading');dialog.setAttribute('aria-describedby','krane-cookie-description');
  dialog.innerHTML='<div class="krane-cookie-handle" aria-hidden="true"></div><button type="button" class="krane-cookie-close" data-cookie-action="close" data-cookie-label="close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button><h2 id="krane-cookie-heading" tabindex="-1">'+span('preferences')+'</h2><p id="krane-cookie-description">'+span('explanation')+'</p><div class="krane-cookie-category"><label><input type="checkbox" checked disabled><strong>'+span('necessary')+'</strong></label><span class="krane-cookie-tag">'+span('always')+'</span><p>'+span('necessaryCopy')+'</p></div>'+['analytics','advertising'].map(key=>'<div class="krane-cookie-category"><label><input type="checkbox" disabled data-cookie-category="'+key+'"><strong>'+span(key)+'</strong></label><span class="krane-cookie-tag">'+span('off')+'</span><p>'+span('notUsed')+'</p></div>').join('')+'<a href="'+policy+'">'+span('policy')+'</a><div class="krane-cookie-dialog-actions">'+button('save','save')+'<div>'+button('reject','reject')+button('accept','accept')+'</div></div>';
  status=document.createElement('div');status.className='krane-cookie-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  document.body.append(banner,dialog,status);
  [banner,dialog].forEach(root=>root.addEventListener('click',event=>{const action=event.target.closest('[data-cookie-action]')?.dataset.cookieAction;if(action==='open')open(event.target.closest('button'));else if(action==='close')dialog.close();else if(action)save(action==='reject'?'necessary_only':action==='accept'?'accept_all':'save');}));
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{if(returnFocus?.isConnected&&!returnFocus.closest('[hidden]'))returnFocus.focus({preventScroll:true});});
  new MutationObserver(translate).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  window.addEventListener('storage',event=>{if(event.key===KEY||event.key===null){current=read();banner.hidden=Boolean(current);if(dialog.open)dialog.close();}});
  translate();
  if(location.pathname.endsWith('/cookies.html')&&location.hash==='#controls')open();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
