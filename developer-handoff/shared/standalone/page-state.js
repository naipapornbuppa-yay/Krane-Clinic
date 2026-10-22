/* Session-only prototype continuity. Credentials, OTP codes and file bytes are never saved. */
function kranePageFormKey(){return 'krane-page-form:'+KRANE_PAGE_ID+':'+selectedCategoryId;}
function kraneSavePageForm(){
 const screen=document.getElementById(KRANE_PAGE_ID);if(!screen)return;
 const fields=[...screen.querySelectorAll('input,select,textarea')].filter(el=>el.type!=='password'&&el.type!=='file'&&!el.matches('[data-otp-code]')).map((el,index)=>({id:el.id,index,value:el.value,checked:el.checked,dataset:{...el.dataset}}));
 const selected=[...screen.querySelectorAll('[aria-selected],[aria-pressed],[aria-checked]')].map(el=>({selector:el.dataset.answerId?'[data-answer-id="'+CSS.escape(el.dataset.answerId)+'"]':el.id?'#'+CSS.escape(el.id):null,selected:el.getAttribute('aria-selected'),pressed:el.getAttribute('aria-pressed'),checked:el.getAttribute('aria-checked')}));
 if(KRANE_PAGE_ID.startsWith('intake')){
  const all=JSON.parse(sessionStorage.getItem('krane-standalone-answers')||'{}');
  const answers=[...screen.querySelectorAll('input,select,textarea')].filter(el=>!['file','password','hidden','button','submit'].includes(el.type)&&(!['checkbox','radio'].includes(el.type)||el.checked)&&el.value).map(el=>({label:el.closest('label')?.textContent.trim()||document.querySelector('label[for="'+CSS.escape(el.id)+'"]')?.textContent.trim()||el.name||el.id||'คำตอบ',value:el.value}));
  all[selectedCategoryId+':'+KRANE_PAGE_ID]=answers;sessionStorage.setItem('krane-standalone-answers',JSON.stringify(all));
 }
 sessionStorage.setItem(kranePageFormKey(),JSON.stringify({fields,selected,index:screen.querySelector('.screen__body')?.dataset.intakeQuestionIndex}));
}
function kraneRestorePageForm(){
 const screen=document.getElementById(KRANE_PAGE_ID);const saved=JSON.parse(sessionStorage.getItem(kranePageFormKey())||'null');if(!screen||!saved)return;
 const fields=[...screen.querySelectorAll('input,select,textarea')].filter(el=>el.type!=='password'&&el.type!=='file'&&!el.matches('[data-otp-code]'));
 saved.fields.forEach(v=>{const el=v.id?document.getElementById(v.id):fields[v.index];if(!el)return;el.value=v.value;el.checked=v.checked;Object.assign(el.dataset,v.dataset);});
 const selected=[...screen.querySelectorAll('[aria-selected],[aria-pressed],[aria-checked]')];saved.selected.forEach((v,i)=>{const el=(v.selector&&screen.querySelector(v.selector))||selected[i];if(!el)return;for(const attr of ['selected','pressed','checked'])if(v[attr]!==null)el.setAttribute('aria-'+attr,v[attr]);});
 if(saved.index!==undefined&&screen.querySelector('.screen__body')){screen.querySelector('.screen__body').dataset.intakeQuestionIndex=saved.index;if(typeof setupIntakeQuestionPages==='function')setupIntakeQuestionPages(screen);}
 if(typeof syncFloatingFieldStates==='function')syncFloatingFieldStates(screen);
 if(window.kraneSyncSelects)window.kraneSyncSelects(screen);
}
window.addEventListener('pagehide',()=>{if(typeof KRANE_PAGE_ID!=='undefined'&&typeof selectedCategoryId!=='undefined')kraneSavePageForm();});
function kraneTransferTreatment(card){
 const follow=card.querySelector('.followup-row [data-followup-date]');
 sessionStorage.setItem('krane-treatment-selection',JSON.stringify({dataset:{...card.dataset},title:card.querySelector('.treatment-card__title strong')?.textContent||'',status:card.querySelector('.badge')?.textContent||'',followup:{dataset:{...follow?.dataset},text:follow?.textContent||''}}));
}
function kraneRestoreTreatment(){
 const record=JSON.parse(sessionStorage.getItem('krane-treatment-selection')||'null');if(!record)return;
 const card=document.createElement('article');Object.assign(card.dataset,record.dataset);
 const title=document.createElement('div');title.className='treatment-card__title';const strong=document.createElement('strong');strong.textContent=record.title;title.append(strong);card.append(title);
 const badge=document.createElement('span');badge.className='badge';badge.textContent=record.status;card.append(badge);
 const row=document.createElement('div');row.className='followup-row';const follow=document.createElement('span');Object.assign(follow.dataset,record.followup.dataset);follow.textContent=record.followup.text;row.append(follow);card.append(row);
 card.onclick=()=>openTreatmentDetail(card);
 openTreatmentDetail(card);
 const visits=JSON.parse(card.dataset.consultations||'[]');
 const select=index=>{Object.assign(card.dataset,visits[index]);card.dataset.consultationNumber=visits[index].number;};
 kraneRenderTreatmentVisitHistory(card,visits,select);
}

function kraneStoredIntakeAnswers(){const records=JSON.parse(sessionStorage.getItem('krane-standalone-answers')||'{}');return Object.entries(records).filter(([key])=>key.startsWith(selectedCategoryId+':')).flatMap(([,answers])=>answers);}
