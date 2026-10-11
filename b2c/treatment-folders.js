/* Explicit presentation fixtures: stack count and visit history share these records. */
(()=>{
 function mount(card){
  if(card.closest('.treatment-folder'))return;
  let visits;try{visits=JSON.parse(card.dataset.consultations||'null')}catch{}
  if(!Array.isArray(visits)||!visits.length){
   const count=({'weight':6,'hair-skin':4,'sexual-health':2,'general':1})[card.dataset.category]||1;
   const base={...card.dataset};
   visits=Array.from({length:count},(_,i)=>({...base,number:i+1,treatmentDate:i===count-1?base.treatmentDate:`${String(1+i*3).padStart(2,'0')}/05/2026`,treatmentRx:i===count-1?base.treatmentRx:`RX-DEMO-${card.dataset.category}-${i+1}`}));
  }
  // Records may arrive out of order; visit number is the stable chronology.
  visits=visits.map((v,i)=>({...v,number:Number(v.number)||i+1})).sort((a,b)=>a.number-b.number);
  const folder=document.createElement('div');folder.className='treatment-folder';
  const tabs=document.createElement('div');tabs.className='treatment-folder__tabs';
  tabs.setAttribute('aria-label',`ปรึกษาแล้ว ${visits.length} ครั้ง`);
  card.before(folder);folder.append(tabs,card);card.id='treatment-folder-'+card.dataset.category;
  folder.dataset.visitCount=visits.length;
  const depth=visits.length-1;
  folder.style.setProperty('--folder-depth',depth);
  for(let layer=depth;layer>0;layer--){const sheet=document.createElement('i');sheet.className='treatment-folder__sheet';sheet.style.setProperty('--layer',layer);sheet.setAttribute('aria-hidden','true');folder.prepend(sheet);}
  visits.forEach((visit,i)=>{const spine=document.createElement('span');spine.className='treatment-folder__spine';spine.style.setProperty('--spine',i);spine.setAttribute('aria-hidden','true');tabs.append(spine);});
  const label=document.createElement('span');label.className='treatment-folder__label';label.textContent=`ปรึกษาแล้ว ${visits.length} ครั้ง`;tabs.append(label);
  function select(index){
   const visit=visits[index];
   Object.keys(card.dataset).filter(k=>k.startsWith('treatment')).forEach(k=>delete card.dataset[k]);
   Object.entries(visit).forEach(([key,value])=>{if(key.startsWith('treatment'))card.dataset[key]=value;});
   card.setAttribute('data-treatment-open','');card.dataset.consultationNumber=visit.number;
   if(visit.doctor)card.querySelector('.followup-row strong').textContent=visit.doctor;
   if(visit.followup){const row=card.querySelector('.followup-row:last-child strong');row.textContent=visit.followup;}
  }
  card.addEventListener('treatment-record-open',()=>{
   const certificate=document.querySelector('#treatment-detail .treatment-record__certificate-card');
   if(!certificate)return;
   document.getElementById('treatment-visit-history')?.remove();
   const history=document.createElement('details');history.id='treatment-visit-history';
   const summary=document.createElement('summary');summary.textContent='ประวัติการปรึกษา · '+visits.length+' ครั้ง';history.append(summary);
   const current=Number(card.dataset.consultationNumber);
   const label=document.createElement('p');label.className='hint';label.textContent='กำลังดูการปรึกษาครั้งที่ '+current;history.append(label);
   const other=visits.map((visit,index)=>({visit,index})).reverse();
   if(!other.length){const empty=document.createElement('p');empty.className='hint';empty.textContent='ยังไม่มีการปรึกษาครั้งก่อน';history.append(empty);}
   other.forEach(({visit,index})=>{const button=document.createElement('button');button.type='button';button.className='doc-row';button.textContent='ปรึกษาครั้งที่ '+visit.number+(visit.treatmentDate?' · '+visit.treatmentDate:'')+'  ›';button.setAttribute('aria-current',String(visit.number===current));button.onclick=()=>{select(index);card.click();document.querySelector('#treatment-detail .screen__body')?.scrollTo({top:0,behavior:'smooth'});};history.append(button);});
   certificate.after(history);
  });
  folder.selectLatest=()=>select(visits.length-1);
  select(visits.length-1);
 }
 function init(){document.querySelectorAll('#profile .treatment-card').forEach(mount);}
 new MutationObserver(()=>{if(document.querySelector('#profile.active'))document.querySelectorAll('.treatment-folder').forEach(folder=>folder.selectLatest?.());}).observe(document.getElementById('profile'),{attributes:true,attributeFilter:['class']});
 window.kraneTreatmentFolders={mount,init};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
