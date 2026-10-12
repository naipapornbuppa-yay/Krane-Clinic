/* Same-origin frontend demo adapter. No authentication, backend or medical rules. */
(() => {
  const prefix='krane.clinical.v1.';
  const role=document.body?.classList.contains('role-doctor')?'doctor':location.pathname.includes('cms-doctor')?'doctor':'patient';
  const activeKey=prefix+role+'.active';
  const defaultCase={id:'CONS-2041',patientId:'PT-2041',name:'Mali S. (Demo)',category:'hair-skin',status:'waiting',answers:[],appointmentAt:null};
  function read(key,fallback){try{const value=localStorage.getItem(prefix+key);return value?JSON.parse(value):fallback;}catch{return fallback;}}
  function emit(){window.dispatchEvent(new Event('krane:clinical-change'));}
  function write(key,value){localStorage.setItem(prefix+key,JSON.stringify(value));emit();return value;}
  function id(){return sessionStorage.getItem(activeKey)||defaultCase.id;}
  function cases(){const result=[defaultCase];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key.startsWith(prefix+'case.')){const value=JSON.parse(localStorage.getItem(key));const index=result.findIndex(c=>c.id===value.id);if(index<0)result.push(value);else result[index]=value;}}return result;}
  function current(){return cases().find(c=>c.id===id())||defaultCase;}
  function select(value){if(!cases().some(c=>c.id===value))throw Error('Unknown encounter');sessionStorage.setItem(activeKey,value);emit();document.dispatchEvent(new Event('krane:clinical-selected'));}
  function create(details){const value={...details,id:'CONS-'+crypto.randomUUID(),patientId:details.patientId||'PT-'+crypto.randomUUID(),status:'waiting'};write('case.'+value.id,value);select(value.id);return value;}
  function patch(value){return write('case.'+id(),{...current(),...value,id:id()});}
  function messages(){const result=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key.startsWith(prefix+'message.'+id()+'.'))result.push(JSON.parse(localStorage.getItem(key)));}return result.sort((a,b)=>a.at.localeCompare(b.at)||a.id.localeCompare(b.id));}
  function send(text,items){if(!text?.trim()&&!items?.length)throw Error('Empty message');const msg={id:crypto.randomUUID(),encounterId:id(),role,text:text||'',items:items?JSON.parse(JSON.stringify(items)):null,at:new Date().toISOString()};return write('message.'+id()+'.'+msg.id,msg);}
  function plan(){return read('plan.'+id(),null);}
  function finalize(value){if(value.items?.some(d=>!d.name||!Number.isSafeInteger(d.qty)||d.qty<1||!Number.isFinite(d.price)||d.price<0||!(d.directions||d.dirTH||d.dir)))throw Error('Invalid prescription');const old=plan();if(old)throw Error('This encounter already has a finalized plan');return write('plan.'+id(),{...value,id:'RX-'+crypto.randomUUID(),encounterId:id(),patientId:current().patientId,at:new Date().toISOString()});}
  function program(category){return read('program.'+current().patientId+'.'+category,null);}
  function setProgram(category,value){return write('program.'+current().patientId+'.'+category,{...value,patientId:current().patientId,category,at:new Date().toISOString()});}
  function records(kind){const result=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key.startsWith(prefix+kind+'.'))result.push(JSON.parse(localStorage.getItem(key)));}return result;}
  function request(value){return write('request.'+crypto.randomUUID(),{...value,id:crypto.randomUUID(),encounterId:id(),patientId:current().patientId,name:current().name,status:'pending',at:new Date().toISOString()});}
  function decide(requestId,status,reason){if(!['reviewing','declined'].includes(status)||!reason?.trim())throw Error('Enter a reason');for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key.startsWith(prefix+'request.')){const value=JSON.parse(localStorage.getItem(key));if(value.id===requestId)return write(key.slice(prefix.length),{...value,status,reason});}}throw Error('Request not found');}
  window.KraneClinical={records,request,decide,id,current,cases,select,create,patch,messages,send,plan,finalize,program,setProgram,role};
  window.addEventListener('storage',e=>{if(e.key?.startsWith(prefix))emit();});
})();
