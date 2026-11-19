/* Explicit static-host guest UX. Never enables itself on production. */
(()=>{
 const guest=location.hostname==='naipapornbuppa-yay.github.io'&&location.pathname==='/Krane-Clinic/b2c/krane-b2c.html'&&new URLSearchParams(location.search).get('sandbox')==='guest';
 if(!guest)return;
 const safe=window.KraneClinical?.id()==='CONS-2041';
 for(const screen of document.querySelectorAll('section.screen')){
  const notice=document.createElement('p');notice.style.cssText='margin:0;padding:10px 16px;background:#e7eefb;color:#234780;font-size:12px;line-height:1.5';
  notice.textContent=safe?'GUEST DEMO · ใช้ข้อมูลจำลองเท่านั้น ไม่มีบัญชี การนัด แพทย์ หรือการชำระเงินจริง / Synthetic walkthrough only.':'เดโมไม่ทำงานกับเคสที่มีอยู่ กรุณาใช้หน้าต่างส่วนตัวใหม่ / Existing shared case: demo disabled.';
  screen.prepend(notice);
 }
 if(!safe)return;
 for(const id of ['signup','login']){
  const screen=document.getElementById(id);if(!screen)continue;
  const button=document.createElement('button');button.type='button';button.className='btn btn--primary';button.dataset.staticGuestAccount='';
  button.textContent='ใช้บัญชีตัวอย่าง Guest Demo / Continue with sample account';
  const body=screen.querySelector('.screen__body');if(body){body.replaceChildren(button);}
 }
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
