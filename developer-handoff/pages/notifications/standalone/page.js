function kraneHandle_notifications_markRead(e, markRead) {
      document.querySelectorAll('#notifications .notif--unread').forEach(n => n.classList.remove('notif--unread'));
      markRead.textContent = 'อ่านทั้งหมดแล้ว';
      markRead.disabled = true;
      showActionToast('อ่านการแจ้งเตือนทั้งหมดแล้ว');
      return true;

  return false;
}

function syncDeliveryNotification(){
    if(orderFulfilmentStatus()==='Delivered' && !flowState.deliveryNotified){flowState.deliveryNotified=true;persistFlowState();}
    const notif=document.querySelector('[data-notif-delivered]');
    if(notif) notif.hidden=!flowState.deliveryNotified;
    const review=document.querySelector('[data-notif-review]');
    const preview=new URLSearchParams(location.search).get('screens')==='1';
    if(review) review.hidden=!!flowState.csatDone || !(flowState.deliveryNotified || preview);
  }

function kraneRenderClinicalRequests(api,el){
  const parent=document.querySelector(api.role==='doctor'?'#followups':'#notifications .screen__body');if(!parent)return;
  let box=parent.querySelector('[data-clinical-requests]');if(!box){box=el('section');box.dataset.clinicalRequests='';box.className=api.role==='doctor'?'panel stack':'card stack';box.style.cssText='padding:20px;margin:16px 0;overflow-wrap:anywhere';parent.prepend(box);}
  box.replaceChildren(el('h3','คำขอทบทวนใบสั่งยา'));
  const rows=api.records('request').filter(r=>api.role==='doctor'||r.patientId===api.current().patientId);
  if(!rows.length)box.append(el('p','ยังไม่มีคำขอ'));
  for(const r of rows){const card=el('div');card.className='stack';card.append(el('b',r.name+' · '+r.kind),el('p',({pending:'รอทบทวน',reviewing:'รับทบทวนแล้ว',declined:'ส่งกลับ'}[r.status])+' · '+(r.reason||r.note||'')));
   if(r.file){const link=el('a','ดาวน์โหลดใบสั่งยา');link.href=r.file;link.download='prescription';card.append(link);}
   if(api.role==='doctor'&&r.status==='pending'){
    const reason=el('input');reason.className='input';reason.placeholder='เหตุผล / ขั้นตอนถัดไป';reason.setAttribute('aria-label','เหตุผล');reason.oninput=()=>reason.setCustomValidity('');card.append(reason);
    for(const [status,label] of [['reviewing','รับทบทวน'],['declined','ส่งกลับพร้อมเหตุผล']]){const b=el('button',label);b.className='btn btn--secondary';b.type='button';b.onclick=()=>{try{api.decide(r.id,status,reason.value)}catch(e){reason.setCustomValidity(e.message);reason.reportValidity();}};card.append(b);}
   }box.append(card);
  }
 }