/* treatment-detail: Owns treatment record and visit-history rendering, pause/resume dialog and schedule form. Shared program/clinical data stay central.
 * Source references in dependencies.json are relative to developer-handoff/.
 */

  function setTreatmentDetailTab(name='plan'){
    const detail=document.getElementById('treatment-detail');
    if(!detail) return;
    detail.querySelectorAll('[data-treatment-tab]').forEach(tab => {
      const selected=tab.dataset.treatmentTab===name;
      tab.classList.toggle('is-active',selected);
      tab.setAttribute('aria-selected',String(selected));
      tab.tabIndex=selected ? 0 : -1;
    });
    detail.querySelectorAll('[data-treatment-panel]').forEach(panel => {
      panel.hidden=panel.dataset.treatmentPanel!==name;
    });
  }

  function openTreatmentDetail(card){
    if(!card) return;
    /* Activity cards are intentionally compact, but opening one must land on
       the same complete clinical record as its matching profile card. */
    const sourceCategory=card.dataset.treatmentSourceCategory;
    if(sourceCategory){
      const source=document.querySelector(`#profile [data-treatment-open][data-category="${sourceCategory}"]`);
      if(source) card=source;
    }
    card.dispatchEvent(new Event('treatment-record-open'));
    if(card.dataset.category) setSelectedCategory(card.dataset.category);
    /* The card head became .treatment-card__title, and the only .between left on
       the card is the follow-up row, so this had started naming the treatment
       after its next appointment date. */
    const title=card.dataset.treatmentTitle
      || card.querySelector('.treatment-card__title strong')?.textContent.trim()
      || card.querySelector('.between strong')?.textContent.trim() || 'ข้อมูลการรักษา';
    const status=window.kraneTreatmentPause?.isPaused(card.dataset.category)?'พักโปรแกรม':(card.querySelector('.badge')?.textContent.trim() || 'เป็นไปตามแผน');
    const diagnosis=card.dataset.treatmentDiagnosis || '';
    const plan=card.dataset.treatmentPlan || '';
    const date=card.dataset.treatmentDate || '';
    /* The cards no longer print the refill, so they carry it as data; cards that
       still render the line (the history screen) fall back to reading it. */
    const refill=card.dataset.treatmentRefillText
      || (card.querySelector('.treatment-refill')?.textContent.trim() || '').replace(/^ยาคงเหลือ\s*/,'');
    /* The date on its own — the row also carries the doctor's name, which is
       already two lines above this on the detail screen. The offset is mirrored
       rather than the text copied, so syncFollowUpDates() renders this date the
       same way as every other one and it follows the language toggle instead of
       freezing in whichever language the treatment happened to be opened in. */
    const followupNode=card.querySelector('.followup-row [data-followup-date]');
    const detail=document.getElementById('treatment-detail');
    if(!detail) return;
    /* Both tabs repeat the same case identity. Keep every matching node in
       sync so switching tabs never changes the apparent treatment. */
    const setDetail=(selector,value) => {
      detail.querySelectorAll(selector).forEach(node => { node.textContent=value; });
    };
    setDetail('[data-treatment-detail-title]',title);
    setDetail('[data-treatment-detail-status]',status);
    detail.dataset.programState=window.kraneTreatmentPause?.isPaused(card.dataset.category)?'paused':'active';
    setDetail('[data-treatment-detail-diagnosis]',diagnosis);
    setDetail('[data-treatment-detail-plan]',plan);
    setDetail('[data-treatment-detail-refill]',refill);
    const detailFollowups=[...detail.querySelectorAll('[data-treatment-detail-followup]')];
    detailFollowups.forEach(detailFollowup => {
      if(followupNode?.dataset.followupOffset){
        detailFollowup.dataset.followupOffset=followupNode.dataset.followupOffset;
        if(followupNode.dataset.followupCase) detailFollowup.dataset.followupCase=followupNode.dataset.followupCase;
        else detailFollowup.removeAttribute('data-followup-case');
        if(followupNode.dataset.followupDemoMinutes) detailFollowup.dataset.followupDemoMinutes=followupNode.dataset.followupDemoMinutes;
        else detailFollowup.removeAttribute('data-followup-demo-minutes');
      }else{
        detailFollowup.removeAttribute('data-followup-offset');
        detailFollowup.removeAttribute('data-followup-case');
        detailFollowup.removeAttribute('data-followup-demo-minutes');
        detailFollowup.textContent=followupNode?.textContent.trim() || card.querySelector('.followup-row:last-child strong')?.textContent.trim() || 'ไม่มีนัดติดตาม';
      }
    });
    if(detailFollowups.length && followupNode?.dataset.followupOffset) syncFollowUpDates();
    detail.querySelectorAll('[data-treatment-detail-date]').forEach(node => { node.textContent=date; });
    const rxNumber=detail.querySelector('[data-treatment-rx-number]');
    if(rxNumber && card.dataset.treatmentRx) rxNumber.textContent=card.dataset.treatmentRx;
    const rxDiagnosis=detail.querySelector('[data-treatment-rx-diagnosis]');
    if(rxDiagnosis && diagnosis) rxDiagnosis.textContent=diagnosis;
    const rxFollowup=detail.querySelector('[data-treatment-rx-followup]');
    if(rxFollowup && followupNode?.dataset.followupOffset){
      rxFollowup.dataset.followupOffset=followupNode.dataset.followupOffset;
    }
    /* The cards carry the prescription as data, so the medicine tab renders the
       same block the documents screen shows: what it is for, how to take it and
       what it can do. */
    const medicines=detail.querySelector('[data-treatment-detail-medications]');
    let list=[];
    try{ list=JSON.parse(card.dataset.treatmentMedicines || '[]'); }catch(err){ list=[]; }
    const makeMedicineBlock=(item) => {
      const block=document.createElement('div');
      block.className='doc-med';
      const head=document.createElement('div');
      head.className='doc-med__head';
      if(item.photo){
        const thumb=document.createElement('span');
        thumb.className='thumb med-thumb doc-med__thumb';
        thumb.setAttribute('aria-hidden','true');
        const photo=document.createElement('img');
        photo.src=item.photo;
        photo.loading='lazy';
        photo.decoding='async';
        photo.alt='';
        thumb.append(photo);
        head.append(thumb);
      }
      const title=document.createElement('span');
      title.className='doc-med__title';
      const name=document.createElement('strong');
      name.textContent=item.name || '';
      const kind=document.createElement('span');
      kind.className='hint';
      kind.textContent=item.kind || '';
      title.append(name,kind);
      head.append(title);
      block.append(head);
      if(item.purpose){
        const purpose=document.createElement('p');
        purpose.className='doc-med__purpose';
        purpose.textContent=item.purpose;
        block.append(purpose);
      }
      /* Same four icons the document uses, in the same order: dose, frequency,
         duration, then the warning. */
      const FACT_ICONS=['pill','clock','calendar-days','triangle-alert'];
      const facts=document.createElement('ul');
      facts.className='doc-med__facts';
      (item.facts || []).forEach((text,index) => {
        const li=document.createElement('li');
        const icon=document.createElement('i');
        icon.dataset.lucide=FACT_ICONS[Math.min(index,FACT_ICONS.length-1)];
        icon.className='ui-icon ui-icon--sm';
        icon.setAttribute('aria-hidden','true');
        const label=document.createElement('span');
        label.textContent=text;
        li.append(icon,label);
        facts.append(li);
      });
      block.append(facts);
      return block;
    };
    const medicineGroups=[
      {key:'ordered',title:'รายการที่สั่งซื้อ',items:list.filter(item => item.ordered !== false)},
      {key:'not-ordered',title:'รายการที่ไม่ได้สั่งซื้อ',items:list.filter(item => item.ordered === false)}
    ];
    medicines.replaceChildren(...medicineGroups.filter(group => group.items.length).map(group => {
      const section=document.createElement('section');
      section.className=`treatment-medicine-group treatment-medicine-group--${group.key}`;
      const heading=document.createElement('h3');
      heading.className='treatment-medicine-group__title';
      const label=document.createElement('span');
      label.textContent=group.title;
      const count=document.createElement('span');
      count.className='treatment-medicine-group__count';
      count.textContent=`${group.items.length} รายการ`;
      heading.append(label,count);
      const contents=document.createElement('div');
      contents.className='treatment-medicine-group__items';
      contents.replaceChildren(...group.items.map(makeMedicineBlock));
      section.append(heading,contents);
      return section;
    }));
    // The blocks are built after the page's icon pass, so run it over them.
    if(window.krane_normalizeIcons) window.krane_normalizeIcons();
    syncFollowUpDates();
    /* The plan tab is the clinician's note, so it is filled from the record the
       card carries rather than four paragraphs hard-coded in the markup. */
    let note={};
    try{ note=JSON.parse(card.dataset.treatmentNote || '{}'); }catch(err){ note={}; }
    const fillList=(selector,items) => {
      const list=detail.querySelector(selector);
      if(!list) return;
      list.replaceChildren(...(items || []).map(text => {
        const li=document.createElement('li');
        li.textContent=text;
        return li;
      }));
      const block=list.closest('.doc-soap__block');
      if(block) block.hidden=!(items && items.length);
    };
    fillList('[data-treatment-goals]',note.goals);
    fillList('[data-treatment-findings]',note.findings);
    fillList('[data-treatment-assessment]',note.assessment);
    fillList('[data-treatment-planlist]',note.plan);
    setTreatmentDetailTab('plan');
    show('treatment-detail');
  }

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_treatment_detail_tab(e, treatmentTab) { setTreatmentDetailTab(treatmentTab.dataset.treatmentTab); return true;
  return false;
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_treatment_detail_editSymptoms(e, followUpEditSymptoms) { show('intake1'); return true;
  return false;
}

// Called once at the original bootstrap position.
function kraneInit_treatment_detail_refill() {
document.body.addEventListener('click', event => {
    /* Client, 15 Sep: pressing refill from inside a treatment already answers
       the sheet's only question — this is that treatment's prescription — so it
       goes straight to the checkout. The sheet is for the quick menu, which is
       reached with no treatment in hand. */
    if(event.target.closest('[data-refill-treatment]')){
      if(!startRefill(selectedCategoryId)) openRefillSheet();
      return;
    }
    if(event.target.closest('[data-refill-open]')){ openRefillSheet(); return; }
    if(event.target.closest('[data-refill-sheet-close]')){ closeRefillSheet(); return; }
    const choice=event.target.closest('#refill-sheet [data-refill-choice]');
    if(choice) startRefill(choice.dataset.refillChoice);
  });
}

/** Renders visit history when a profile treatment record opens. */
function kraneRenderTreatmentVisitHistory(card,visits,select){
   const certificate=document.querySelector('#treatment-detail .treatment-record__certificate-card');
   if(!certificate)return;
   document.getElementById('treatment-visit-history')?.remove();
   const history=document.createElement('details');history.id='treatment-visit-history';
   const summary=document.createElement('summary');summary.innerHTML='<span>ประวัติการปรึกษา</span>'+window.kraneIcon('chevron-down','ui-icon--sm');history.append(summary);
   const current=Number(card.dataset.consultationNumber);
   const other=visits.map((visit,index)=>({visit,index})).reverse();
   if(!other.length){const empty=document.createElement('p');empty.className='hint';empty.textContent='ยังไม่มีการปรึกษาครั้งก่อน';history.append(empty);}
   other.forEach(({visit,index})=>{const button=document.createElement('button');button.type='button';button.className='doc-row treatment-record__certificate-card';const title=document.createElement('strong');title.textContent='ปรึกษาวันที่ '+(visit.treatmentDate||'');button.append(title);button.setAttribute('aria-current',String(visit.number===current));button.onclick=()=>{select(index);card.click();document.querySelector('#treatment-detail .screen__body')?.scrollTo({top:0,behavior:'smooth'});};history.append(button);});
   certificate.after(history);
   window.kraneTreatmentPause?.attach(card,history);
  }


/** Once-only treatment detail pause/resume dialog and schedule UI. */
function kraneInitTreatmentPause(){
const programState=kraneCreateProgramPauseState();
const {key,isPaused,hasCancelledFollowup,appointmentFor}=programState;






 const layer=document.createElement('div');layer.className='modal-layer';layer.id='treatment-pause-modal';layer.hidden=true;layer.setAttribute('aria-hidden','true');
 layer.innerHTML=`<button class="modal-layer__scrim" type="button" data-treatment-pause-close aria-label="ปิดหน้าต่าง"></button><section class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="treatment-pause-title" aria-describedby="treatment-pause-description" tabindex="-1"><div class="program-resume-art" aria-hidden="true" hidden><img src="assets/state-editorial-v5-ink/enter-consultation-room-same-patient-v5.png" alt="" width="1024" height="1600"></div><h2 id="treatment-pause-title">พักโปรแกรมการรักษา?</h2><p id="treatment-pause-description">เมื่อพักโปรแกรม นัดติดตามครั้งถัดไปจะถูกยกเลิก</p><p class="hint" data-pause-note>การพักโปรแกรมไม่ได้เปลี่ยนคำสั่งใช้ยาของแพทย์</p><p class="hint" data-treatment-pause-error hidden></p><div class="modal-dialog__actions"><button type="button" class="btn btn--primary" data-treatment-pause-confirm>ยืนยันพักโปรแกรม</button><button type="button" class="btn btn--ghost" data-treatment-pause-close>กลับไป</button></div></section>`;
 const schedule=document.createElement('div');schedule.hidden=true;schedule.className='program-resume-schedule';
 schedule.innerHTML='<div class="program-resume-appointment"><span class="program-resume-calendar" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4M17 3v4M3 11h18m-13 5 2 2 4-4"/></svg></span><div><p data-resume-doctor></p><p><strong data-resume-suggested></strong></p></div><button type="button" class="program-resume-edit" data-resume-change aria-label="แก้ไขวันและเวลานัด" aria-expanded="false" aria-controls="resume-program-fields"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15v5Z"/></svg></button></div><div id="resume-program-fields" data-resume-fields hidden><label for="resume-program-date">เลือกวัน</label><select class="input" id="resume-program-date"></select><label for="resume-program-time">เลือกเวลา</label><select class="input" id="resume-program-time"></select></div>';
 layer.querySelector('.modal-dialog__actions').before(schedule);
 const dateInput=schedule.querySelector('#resume-program-date'),timeInput=schedule.querySelector('#resume-program-time');
 const dateKey=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
 function updateTimes(){const slots=window.kraneProgramSchedule.slots(dateInput.value);timeInput.replaceChildren(...slots.map(time=>new Option(time,time)));window.kraneRefreshSelectOptions?.(timeInput);updateSuggested();}
 function updateSuggested(){const valid=Boolean(timeInput.value);layer.querySelector('[data-treatment-pause-confirm]').disabled=!valid;schedule.querySelector('[data-resume-suggested]').textContent=valid?`${dateInput.value.split('-').reverse().join('/')} · ${timeInput.value}`:'ไม่มีเวลาว่างในวันที่เลือก';}
 dateInput.onchange=updateTimes;timeInput.onchange=updateSuggested;
 schedule.querySelector('[data-resume-change]').onclick=()=>{const fields=schedule.querySelector('[data-resume-fields]');fields.hidden=!fields.hidden;schedule.querySelector('[data-resume-change]').setAttribute('aria-expanded',String(!fields.hidden));if(!fields.hidden){window.kraneSyncSelects?.(fields);fields.querySelector('.custom-select__trigger')?.focus();}};
 function prepareSchedule(card){const today=new Date();dateInput.replaceChildren(...Array.from({length:31},(_,day)=>{const date=new Date(today);date.setDate(today.getDate()+day);return new Option(dateKey(date).split('-').reverse().join('/'),dateKey(date));}));window.kraneRefreshSelectOptions?.(dateInput);schedule.querySelector('[data-resume-change]').setAttribute('aria-expanded','false');schedule.querySelector('[data-resume-fields]').hidden=true;schedule.querySelector('[data-resume-doctor]').textContent=card.querySelector('.followup-row strong')?.textContent||'';
 for(let day=0;day<=30;day++){const date=new Date(today);date.setDate(today.getDate()+day);dateInput.value=dateKey(date);if(window.kraneProgramSchedule.slots(dateInput.value).length)break;}window.kraneRefreshSelectOptions?.(dateInput);updateTimes();}
 document.body.append(layer);
 let target=null,opener=null;
 window.kraneTreatmentFolders?.init();
 const {sortFolders,decorate}=kraneCreateProfileProgramPresentation(isPaused,appointmentFor);

 function close(){layer.hidden=true;layer.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');opener?.focus({preventScroll:true});}

 function attach(card,history){
  document.getElementById('treatment-pause-action')?.remove();
  const button=document.createElement('button');button.type='button';button.id='treatment-pause-action';button.className='textlink treatment-pause-action';button.textContent=isPaused(card.dataset.category)?'กลับมารักษาต่อ':'พักโปรแกรมการรักษา';button.classList.toggle('is-resume',isPaused(card.dataset.category));document.querySelector('#treatment-detail > .screen__body').append(button);
  button.onclick=()=>{target=card;opener=button;const resume=isPaused(card.dataset.category);schedule.hidden=!resume;layer.classList.toggle('is-resuming',resume);layer.querySelector('.program-resume-art').hidden=!resume;layer.querySelector('[data-pause-note]').hidden=resume;layer.querySelector('[data-treatment-pause-confirm]').disabled=false;if(resume)prepareSchedule(card);layer.querySelector('h2').textContent=resume?'กลับมารักษาต่อ?':'พักโปรแกรมการรักษา?';layer.querySelector('#treatment-pause-description').textContent=resume?'ยืนยันนัดติดตามกับแพทย์เจ้าของเคสเพื่อกลับมารักษาต่อ':'เมื่อพักโปรแกรม นัดติดตามครั้งถัดไปจะถูกยกเลิก';layer.querySelector('[data-treatment-pause-confirm]').textContent=resume?'ยืนยันนัด':'ยืนยันพักโปรแกรม';layer.querySelector('[data-treatment-pause-error]').hidden=true;layer.hidden=false;layer.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');layer.querySelector('.modal-dialog').focus();};
 }
 layer.addEventListener('click',event=>{
  if(event.target.closest('[data-treatment-pause-close]')){close();return;}
  if(!event.target.closest('[data-treatment-pause-confirm]')||!target)return;
  const category=target.dataset.category;const resume=isPaused(category);
  if(resume&&!window.kraneProgramSchedule.slots(dateInput.value).includes(timeInput.value)){updateTimes();const error=layer.querySelector('[data-treatment-pause-error]');error.textContent='กรุณาเลือกเวลานัดใหม่';error.hidden=false;return;}
  const appointmentAt=resume?new Date(dateInput.value+'T'+timeInput.value+':00').toISOString():null;
  const next={...programState.paused,[category]:resume?{...programState.paused[category],state:'active',resumedAt:new Date().toISOString(),appointmentAt}:{state:'paused',pausedAt:new Date().toISOString()}};
  try{localStorage.setItem(key,JSON.stringify(next));}catch{const error=layer.querySelector('[data-treatment-pause-error]');error.textContent='บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง';error.hidden=false;return;}
  try{window.KraneClinical?.setProgram(category,next[category]);}catch{const error=layer.querySelector('[data-treatment-pause-error]');error.textContent='Could not sync. Please retry.';error.hidden=false;return;}
  programState.paused=next;decorate(target);sortFolders();close();document.dispatchEvent(new CustomEvent('krane:program-paused',{detail:{category:target.dataset.category}}));
 });
 document.querySelectorAll('#profile .treatment-card').forEach(decorate);
 sortFolders();
 window.kraneTreatmentPause={isPaused,hasCancelledFollowup,appointmentFor,attach};

}
