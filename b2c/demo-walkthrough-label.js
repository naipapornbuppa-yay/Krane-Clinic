/* Explicit static-host guest UX. Never enables itself on production. */
(()=>{
 const guest=location.hostname==='naipapornbuppa-yay.github.io'&&location.pathname==='/Krane-Clinic/b2c/krane-b2c.html'&&new URLSearchParams(location.search).get('sandbox')==='guest';
 if(!guest)return;
 const isSample=()=>window.KraneClinical?.id()==='CONS-2041';
 const safe=isSample();
 const notices=Array.from(document.querySelectorAll('section.screen'),screen=>{
  const notice=document.createElement('p');
  notice.style.cssText='margin:0;padding:5px 14px;background:#e7eefb;color:#234780;font-size:11px;line-height:1.4;flex:none';
  screen.prepend(notice);
  return notice;
 });
 const localize=()=>{
  const en=document.documentElement.lang.startsWith('en');
  const copy=safe
    ? (en?'Demo only · No real account, doctor, booking or payment.':'เดโมเท่านั้น · ไม่มีบัญชี แพทย์ นัดหมาย หรือชำระเงินจริง')
    : (en?'Demo disabled for this case. Open a fresh private window.':'เดโมใช้กับเคสนี้ไม่ได้ กรุณาเปิดหน้าต่างส่วนตัวใหม่');
  notices.forEach(notice=>{notice.textContent=copy;});
 };
 localize();
 new MutationObserver(localize).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 if(!safe)return;

 // Reuse the app's existing synthetic identity handler. It rechecks host,
 // fixture and no shared encounter before advancing to the usual next screen.
 // The bridge is never a button the visitor has to see or operate.
 const bridges=[];
 for(const id of ['signup','login']){
  const screen=document.getElementById(id);
  const body=screen?.querySelector('.screen__body');
  if(!body)continue;
  const trigger=document.createElement('button');
  trigger.type='button';
  trigger.hidden=true;
  trigger.dataset.staticGuestAccount='';
  body.replaceChildren(trigger);
  bridges.push({screen,trigger});
 }
 let previous=null;
 const advance=()=>{
  const bridge=bridges.find(item=>item.screen.classList.contains('active')) || null;
  if(bridge===previous)return;
  previous=bridge;
  if(bridge && isSample())bridge.trigger.click();
 };
 const activation=new MutationObserver(advance);
 bridges.forEach(({screen})=>activation.observe(screen,{attributes:true,attributeFilter:['class']}));
 advance();
})();
/* Visible disclosure only. Does not change routing, consent, payment or admission. */
(() => {
  const q=new URLSearchParams(location.search);
  if(q.get('demoMode')!=='walkthrough'||!q.get('demoStage'))return;
  const refresh=()=>{
    const fixture=window.KraneClinical?.id()==='CONS-2041';
    const en=document.documentElement.lang.startsWith('en');
    document.querySelectorAll('section.screen').forEach(screen=>{
      let note=screen.querySelector('[data-walkthrough-notice]');
      if(!note){note=document.createElement('p');note.dataset.walkthroughNotice='';note.setAttribute('role','status');note.style.cssText='margin:0;padding:8px 16px;background:#e7eefb;color:#395aa4;font-size:12px;line-height:1.5;flex:none';screen.prepend(note);}
      note.textContent=fixture?(en?'DEMO · Existing sample case. No real appointment, payment or doctor connection.':'เดโม · เคสตัวอย่างเดิม ไม่ใช่การนัดหมาย ชำระเงิน หรือเชื่อมต่อแพทย์จริง'):(en?'Quick demo is inactive for this case. Use a fresh private window for the sample walkthrough; this case still needs its clinician.':'เดโมแบบเร็วไม่ทำงานกับเคสนี้ เปิดหน้าต่างส่วนตัวใหม่เพื่อดูเคสตัวอย่าง เคสนี้ยังต้องรอแพทย์รับเข้าห้อง');
    });
  };
  refresh();window.addEventListener('krane:clinical-change',refresh);
  new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
