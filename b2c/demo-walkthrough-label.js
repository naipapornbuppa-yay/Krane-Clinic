/* Explicit static-host guest UX. Never enables itself on production. */
(()=>{
 const guest=location.hostname==='naipapornbuppa-yay.github.io'&&location.pathname==='/Krane-Clinic/b2c/krane-b2c.html'&&new URLSearchParams(location.search).get('sandbox')==='guest';
 if(!guest)return;
 const isSample=()=>window.KraneClinical?.id()==='CONS-2041';
 const safe=isSample();
 // Keep the screenshot clean: no repeated banner in an ordinary guest demo.
 // Show plain, contextual disclosure only where someone could enter real data.
 const notes=[];
 const addNote=(host,kind)=>{
  if(!host)return;
  const note=document.createElement('p');
  note.style.cssText=kind==='unavailable'
    ? 'margin:0;padding:5px 14px;background:#e7eefb;color:#234780;font-size:11px;line-height:1.4;flex:none'
    : 'margin:0 0 8px;color:#536177;font-size:12px;line-height:1.4';
  host.prepend(note);
  notes.push({note,kind});
 };
 if(!safe){
  document.querySelectorAll('section.screen').forEach(screen=>addNote(screen,'unavailable'));
 }else{
  addNote(document.querySelector('#intake1 .screen__body'),'entry');
  const photoScreen=document.querySelector('[data-photo-input]')?.closest('.screen');
  addNote(photoScreen?.querySelector('.screen__body'),'photo');
  ['consultpay-gw','payment-gw'].forEach(id=>addNote(document.getElementById(id)?.querySelector('.screen__body'),'payment'));
 }
 const localize=()=>{
  const en=document.documentElement.lang.startsWith('en');
  const copy=en ? {
   entry:'Use sample information only. This demo does not connect to a doctor.',
   photo:'Use sample photos only. Do not upload personal photos.',
   payment:'Simulated payment only. Do not enter real payment details.',
   unavailable:'Demo disabled for this case. Open a fresh private window.'
  } : {
   entry:'ใช้ข้อมูลสมมติเท่านั้น เดโมนี้ไม่ได้เชื่อมต่อแพทย์จริง',
   photo:'ใช้รูปตัวอย่างเท่านั้น ไม่ต้องอัปโหลดรูปส่วนตัว',
   payment:'ชำระเงินจำลองเท่านั้น ไม่ต้องกรอกข้อมูลชำระเงินจริง',
   unavailable:'เดโมใช้กับเคสนี้ไม่ได้ กรุณาเปิดหน้าต่างส่วนตัวใหม่'
  };
  notes.forEach(({note,kind})=>{note.textContent=copy[kind];});
 };
 localize();
 new MutationObserver(localize).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 if(!safe)return;

 // Preserve the normal login and sign-up UI in the public review build.
 // Only the submit actions change here. They run the isolated sample instead
 // of accepting a phone number, storing credentials, or launching OAuth.
 const authScreens=['login','signup'].map(id=>document.getElementById(id)).filter(Boolean);
 for(const screen of authScreens){
  screen.querySelectorAll('input').forEach(input=>{
   input.readOnly=true;
   input.autocomplete='off';
  });
  const bridge=document.createElement('button');
  bridge.type='button';
  bridge.hidden=true;
  bridge.dataset.staticGuestAccount='';
  screen.append(bridge);
  screen.addEventListener('click',event=>{
   const action=event.target.closest('[data-login-submit],[data-signup-phone],[data-social],[data-login-forgot]');
   if(!action)return;
   event.preventDefault();
   event.stopImmediatePropagation();
   if(isSample()&&!action.matches('[data-login-forgot]'))bridge.click();
  },true);
 }
})();
