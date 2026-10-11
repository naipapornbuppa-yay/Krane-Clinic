/* Each visit owns its record data. No synthetic consultation count is added. */
(()=>{
 function mount(card){
  if(card.closest('.treatment-folder'))return;
  let visits;try{visits=JSON.parse(card.dataset.consultations||'null')}catch{}
  if(!Array.isArray(visits)||!visits.length)visits=[{...card.dataset}];
  // Records may arrive out of order; visit number is the stable chronology.
  visits=visits.map((v,i)=>({...v,number:Number(v.number)||i+1})).sort((a,b)=>a.number-b.number);
  const folder=document.createElement('div');folder.className='treatment-folder';
  const tabs=document.createElement('div');tabs.className='treatment-folder__tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','ครั้งที่ปรึกษา');
  card.before(folder);folder.append(tabs,card);card.id='treatment-folder-'+card.dataset.category;
  card.setAttribute('role','tabpanel');
  const followup=card.querySelector('.followup-row:last-child strong')?.textContent.trim();
  const upcoming=document.createElement('div');upcoming.className='treatment-folder__upcoming';upcoming.hidden=true;upcoming.id=card.id+'-upcoming';upcoming.setAttribute('role','tabpanel');
  const heading=document.createElement('strong');heading.textContent='นัดถัดไป';
  const date=document.createElement('p');date.textContent=followup && !/ไม่มี|no follow/i.test(followup)?followup:'ยังไม่มีนัดหมายถัดไป';
  upcoming.append(heading,date);folder.append(upcoming);
  const depth=Math.min(4,Math.max(0,visits.length-1));
  folder.style.setProperty('--folder-depth',depth);
  for(let layer=depth;layer>0;layer--){const sheet=document.createElement('i');sheet.className='treatment-folder__sheet';sheet.style.setProperty('--layer',layer);sheet.setAttribute('aria-hidden','true');folder.prepend(sheet);}
  const buttons=visits.map((visit,i)=>{
   const tab=document.createElement('button');tab.type='button';tab.setAttribute('role','tab');tab.id=card.id+'-tab-'+visit.number;tab.setAttribute('aria-controls',card.id);
   tab.textContent=i===visits.length-1?'ครั้งล่าสุด':'ครั้งก่อน';
   tab.setAttribute('aria-label','ปรึกษาครั้งที่ '+visit.number);
   tab.hidden=i<visits.length-2;
   tab.onclick=()=>select(i);tabs.append(tab);return tab;
  });
  const nextTab=document.createElement('button');nextTab.type='button';nextTab.setAttribute('role','tab');nextTab.textContent='นัดถัดไป';nextTab.id=card.id+'-next-tab';nextTab.setAttribute('aria-controls',upcoming.id);upcoming.setAttribute('aria-labelledby',nextTab.id);tabs.append(nextTab);
  nextTab.onclick=()=>{buttons.forEach(b=>{b.setAttribute('aria-selected','false');b.tabIndex=-1;});nextTab.setAttribute('aria-selected','true');nextTab.tabIndex=0;card.hidden=true;upcoming.hidden=false;};
  function select(index){
   card.hidden=false;upcoming.hidden=true;nextTab.setAttribute('aria-selected','false');nextTab.tabIndex=-1;

   const visit=visits[index];buttons.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;});
   card.setAttribute('aria-labelledby',buttons[index].id);
   buttons.forEach((b,i)=>b.hidden=i<visits.length-2 && i!==index);
   if(index<visits.length-2)buttons[visits.length-2].hidden=true;
   Object.keys(card.dataset).filter(k=>k.startsWith('treatment')).forEach(k=>delete card.dataset[k]);
   Object.entries(visit).forEach(([key,value])=>{if(key.startsWith('treatment'))card.dataset[key]=value;});
   card.setAttribute('data-treatment-open','');card.dataset.consultationNumber=visit.number;
   if(visit.doctor)card.querySelector('.followup-row strong').textContent=visit.doctor;
   if(visit.followup){const row=card.querySelector('.followup-row:last-child strong');row.textContent=visit.followup;}
  }
  tabs.onkeydown=e=>{const visible=[...tabs.querySelectorAll('button:not([hidden])')];const i=visible.indexOf(document.activeElement);let next;if(e.key==='ArrowRight')next=(i+1)%visible.length;if(e.key==='ArrowLeft')next=(i-1+visible.length)%visible.length;if(e.key==='Home')next=0;if(e.key==='End')next=visible.length-1;if(next!==undefined){e.preventDefault();visible[next].click();visible[next].focus();}};
  card.addEventListener('treatment-record-open',()=>{
   const certificate=document.querySelector('#treatment-detail .treatment-record__certificate-card');
   if(!certificate)return;
   document.getElementById('treatment-visit-history')?.remove();
   const history=document.createElement('details');history.id='treatment-visit-history';
   const summary=document.createElement('summary');summary.textContent='ประวัติการปรึกษา';history.append(summary);
   const current=Number(card.dataset.consultationNumber);
   const label=document.createElement('p');label.className='hint';label.textContent='กำลังดูการปรึกษาครั้งที่ '+current;history.append(label);
   const other=visits.map((visit,index)=>({visit,index})).filter(({visit})=>visit.number!==current).reverse();
   if(!other.length){const empty=document.createElement('p');empty.className='hint';empty.textContent='ยังไม่มีการปรึกษาครั้งก่อน';history.append(empty);}
   other.forEach(({visit,index})=>{const button=document.createElement('button');button.type='button';button.className='doc-row';button.textContent='ปรึกษาครั้งที่ '+visit.number+(visit.treatmentDate?' · '+visit.treatmentDate:'')+'  ›';button.onclick=()=>{select(index);card.click();document.querySelector('#treatment-detail .screen__body')?.scrollTo({top:0,behavior:'smooth'});};history.append(button);});
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
