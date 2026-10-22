/* Patient requests and doctor review decisions; approval never creates an Rx. */
(()=>{
 const api=window.KraneClinical;if(!api)return;
 const el=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n};
 function render(){ return kraneRenderClinicalRequests(api,el); }
 if(api.role==='patient'){
  false;
  const refill=document.querySelector('#refill-sheet .modal-dialog');if(refill){const button=el('button','ขอให้แพทย์ทบทวนการเติมยา');button.type='button';button.className='btn btn--secondary';button.onclick=()=>{try{api.request({kind:'ทบทวนการเติมยา',note:api.current().category});button.textContent='ส่งคำขอแล้ว';button.disabled=true;}catch{button.textContent='ส่งไม่สำเร็จ ลองอีกครั้ง';}};refill.append(button);}
 }
 window.addEventListener('krane:clinical-change',render);render();
})();
