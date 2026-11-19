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
