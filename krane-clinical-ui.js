/* Render only explicitly patient-visible fields. SOAP remains in the doctor session. */
(() => {
 const api=window.KraneClinical;if(!api)return;
 const doctor=api.role==='doctor';
 const node=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;};
 function panel(parent,key,title){let el=document.querySelector('[data-clinical-panel="'+key+'"]');if(!el&&parent){el=node('section',undefined,doctor?'panel stack':'card stack');el.style.cssText='padding:20px;margin:16px 0;overflow-wrap:anywhere';el.dataset.clinicalPanel=key;parent.prepend(el);}if(el){el.replaceChildren(node('h3',title));}return el;}
 let signature='';
 function render(){
  const c=api.current(),plan=api.plan(),messages=api.messages();const sig=JSON.stringify([c,plan,messages,api.cases(),api.records('program'),api.records('request')]);if(sig===signature)return;signature=sig;
  const thread=document.querySelector(doctor?'#consult .chat__thread':'#consult .chat-body');
  if(thread){thread.querySelectorAll('[data-clinical-message]').forEach(n=>n.remove());if(c.id!=='CONS-2041')thread.querySelectorAll('.bubble:not([data-clinical-message])').forEach(n=>n.hidden=true);
   messages.forEach(m=>{const b=node('div',undefined,'bubble '+(m.role===api.role?'bubble--out':'bubble--in'));b.dataset.clinicalMessage=m.id;
    if(m.items){const card=node('div',undefined,'rx-card');card.append(node('b','ใบสั่งยา (ร่าง)'));m.items.forEach(d=>{const row=node('div',undefined,'rx-card__row');row.append(node('b',d.name),node('div',d.directions||d.dirTH||d.dir||''),node('small','จำนวน: '+d.qty));card.append(row);});card.append(node('small','ตัวอย่างสำหรับปรึกษา ยังไม่ใช่คำสั่งซื้อ'));b.append(card);}else b.textContent=m.text;
    thread.append(b);});
  }
  if(doctor){
   const actual=c.id!=='CONS-2041';
   document.querySelectorAll('#preconsult .patient-grid').forEach(n=>n.hidden=actual);
   document.querySelectorAll('#consult .ctx > .ctx__sec').forEach((n,i)=>{if(i===1||i===2)n.hidden=actual;});
   const orderStatus=document.querySelector('[data-done-order-status]');if(plan&&orderStatus)orderStatus.textContent=plan.outcome==='prescription'?(c.orderStatus==='paid'?'ชำระแล้ว':'รอผู้ป่วยชำระเงิน'):'ไม่มีคำสั่งซื้อ';
   const queue=panel(document.querySelector('#patients')||document.querySelector('[data-consult-rows]')?.closest('.panel')?.parentElement,'queue','เคสจากแอปผู้ป่วย');
   if(queue)api.cases().forEach(v=>{const button=node('button',v.name+' · '+v.id.slice(-8)+' · '+v.category,'btn btn--secondary');button.type='button';button.dataset.clinicalSelect=v.id;queue.append(button);});
   const intake=panel(document.querySelector('#preconsult'),'intake','ข้อมูลที่ผู้ป่วยส่ง');
   if(intake){intake.append(node('p',c.name+' · '+c.patientId+' · '+c.id),node('p',(c.channel||'Demo')+' · '+(c.consent?'ยืนยันความยินยอมแล้ว':'ยังไม่มีข้อมูลความยินยอม')));if(c.concern)intake.append(node('p',c.concern));if(c.health)Object.entries(c.health).forEach(([k,v])=>intake.append(node('p',k+': '+v)));(c.answers||[]).forEach(a=>intake.append(node('p',a.label+': '+a.value)));if(!c.answers?.length)intake.append(node('p','ยังไม่มีคำตอบที่ส่งจากแอปสำหรับเคสนี้'));}
   const follow=panel(document.querySelector('#followups'),'programs','สถานะโปรแกรมจากผู้ป่วย');
   if(follow){const programs=api.records('program');programs.forEach(v=>{const name=api.cases().find(c=>c.patientId===v.patientId)?.name||v.patientId.slice(-8);const row=node('p',name+' · '+v.category+' · '+(v.state==='active'?'กลับมารักษาต่อ · '+(v.appointmentAt||'ยังไม่มีนัด'):'พักโปรแกรม · ยกเลิกนัดครั้งถัดไป'));row.dataset.sharedProgram=v.state;follow.append(row);});}

  }else{
   for(const [selector,key,title] of [['#rx-plan .screen__body','plan','แผนจากแพทย์'],['#activity .screen__body','history','ผลการปรึกษาล่าสุด'],['#my-documents .screen__body','document','ใบสั่งยาจากแพทย์'],['#notifications .screen__body','notification','อัปเดตการปรึกษา']]){
    if(!plan)continue;const el=panel(document.querySelector(selector),key,title);if(!el)continue;
    el.append(node('p',c.name+' · '+new Date(plan.at).toLocaleDateString('th-TH')),node('p',plan.outcome==='prescription'?'แพทย์ยืนยันแผนการรักษาแล้ว':plan.outcome==='referral'?'ส่งต่อ: '+plan.referral:'จบการปรึกษาโดยไม่จ่ายยา'));
    plan.items.forEach(d=>el.append(node('p',d.name+' · '+(d.directions||d.dirTH||d.dir)+' · จำนวน '+d.qty)));
    if(key==='plan' && plan.outcome==='prescription'){const button=node('button','ตรวจรายการยาและดำเนินการต่อ','btn btn--primary');button.type='button';button.onclick=()=>document.dispatchEvent(new Event('krane:accept-plan'));el.append(button);}
    if(key==='document' && plan.outcome==='prescription'){const button=node('button','Download prescription preview','btn btn--secondary');button.type='button';button.onclick=()=>{const doc=document.implementation.createHTMLDocument('Prescription preview');doc.body.append(node('h1','Krane Clinic'),node('p','Frontend preview - not a signed medical document'),node('p',c.name+' / '+c.patientId+' / '+plan.id));plan.items.forEach(d=>doc.body.append(node('p',d.name+' / '+(d.directions||d.dirTH||d.dir)+' / '+d.qty)));const url=URL.createObjectURL(new Blob(['<!doctype html>'+doc.documentElement.outerHTML],{type:'text/html;charset=utf-8'}));const a=node('a');a.href=url;a.download=plan.id+'.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};el.append(button);}
    if(plan.summary)el.append(node('p',plan.summary));if(plan.followUp)el.append(node('p','นัดติดตาม: '+plan.followUp));
   }
  }
 }
 document.addEventListener('click',e=>{const btn=e.target.closest('[data-clinical-select]');if(!btn)return;api.select(btn.dataset.clinicalSelect);const c=api.current();document.dispatchEvent(new CustomEvent('krane:open-clinical-case',{detail:c}));window.go?.('preconsult');});
 window.addEventListener('krane:clinical-change',render);
 window.addEventListener('storage',e=>{if(e.key==='krane.paused-programs.v1'){signature='';render();}});
 document.addEventListener('krane:program-paused',()=>{signature='';render();});
 if(doctor){window.addEventListener('load',()=>{if(api.id()!=='CONS-2041')document.dispatchEvent(new CustomEvent('krane:open-clinical-case',{detail:api.current()}));});}
 render();
})();
