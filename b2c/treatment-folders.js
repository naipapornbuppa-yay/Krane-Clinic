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
  const buttons=visits.map((visit,i)=>{
   const tab=document.createElement('button');tab.type='button';tab.setAttribute('role','tab');tab.id=card.id+'-tab-'+visit.number;tab.setAttribute('aria-controls',card.id);
   tab.textContent=(document.documentElement.lang==='en'?'Consultation ':'ปรึกษาครั้งที่ ')+visit.number;
   tab.onclick=()=>select(i);tabs.append(tab);return tab;
  });
  function select(index){
   const visit=visits[index];buttons.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;});
   card.setAttribute('aria-labelledby',buttons[index].id);
   Object.keys(card.dataset).filter(k=>k.startsWith('treatment')).forEach(k=>delete card.dataset[k]);
   Object.entries(visit).forEach(([key,value])=>{if(key.startsWith('treatment'))card.dataset[key]=value;});
   card.setAttribute('data-treatment-open','');card.dataset.consultationNumber=visit.number;
   if(visit.doctor)card.querySelector('.followup-row strong').textContent=visit.doctor;
   if(visit.followup){const row=card.querySelector('.followup-row:last-child strong');row.textContent=visit.followup;}
  }
  tabs.onkeydown=e=>{const i=buttons.indexOf(document.activeElement);if(i<0)return;let next;if(e.key==='ArrowRight')next=(i+1)%buttons.length;if(e.key==='ArrowLeft')next=(i-1+buttons.length)%buttons.length;if(e.key==='Home')next=0;if(e.key==='End')next=buttons.length-1;if(next!==undefined){e.preventDefault();select(next);buttons[next].focus();}};
  folder.selectLatest=()=>select(visits.length-1);
  select(visits.length-1);
 }
 function init(){document.querySelectorAll('#profile .treatment-card').forEach(mount);}
 new MutationObserver(()=>{if(document.querySelector('#profile.active'))document.querySelectorAll('.treatment-folder').forEach(folder=>folder.selectLatest?.());}).observe(document.getElementById('profile'),{attributes:true,attributeFilter:['class']});
 window.kraneTreatmentFolders={mount,init};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
