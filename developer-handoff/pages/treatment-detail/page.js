/* Shared lexical runtime: load through the handoff build; see DEPENDENCIES.md. */

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
