/* Shared lexical runtime: load through the handoff build; see DEPENDENCIES.md. */

  function syncFieldClearButtons(){
    const recipientClear=document.querySelector('[data-clear-recipient]');
    if(recipientClear) recipientClear.hidden=!recipientFields().some(hasClearableFieldValue);
    document.querySelectorAll('#address .field__clear').forEach(button => {
      const input=button.parentElement?.querySelector('input.input');
      button.hidden=!hasClearableFieldValue(input);
    });
  }

  function setupClearableFields(){
    const scope=document.getElementById('address');
    if(!scope) return;
    /* Each per-field × keeps itself in step from its own input event. The
       recipient's clear watches three fields at once, so one delegated
       listener keeps it in step with all of them. */
    if(!scope.dataset.sectionClearReady){
      scope.dataset.sectionClearReady='1';
      scope.addEventListener('input',() => syncFieldClearButtons());
    }
    // The search box is a field too — it needs the same × (client, 19 Aug).
    scope.querySelectorAll('.float-field__slot > input.input, .field > input.input, .address-search__field > input.input').forEach(input => {
      const field=input.closest('.float-field__box') || input.parentElement;
      if(field.querySelector('.field__clear')) return;
      field.classList.add('field--clearable');
      const button=document.createElement('button');
      button.type='button';
      button.className='field__clear';
      button.setAttribute('aria-label','ล้างข้อมูลในช่องนี้');
      button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg>';
      button.hidden=!hasClearableFieldValue(input);
      (input.closest('.float-field__slot') || input).insertAdjacentElement('afterend',button);
      ['input','change'].forEach(type => input.addEventListener(type,() => { button.hidden=!hasClearableFieldValue(input); }));
      button.addEventListener('click',() => {
        input.value='';
        input.dispatchEvent(new Event('input',{bubbles:true}));
        input.focus();
      });
    });
    /* Password managers and browser autofill can restore a value without an
       input event. Reconcile once after the restored paint and on pageshow. */
    window.requestAnimationFrame(syncFieldClearButtons);
  }


  function clearDeliveryAddressForm(){
    const screen=document.getElementById('address');
    if(!screen) return;
    window.clearTimeout(addressSearchTimer);
    addressSearchToken+=1;
    addressSuggestions=[];
    screen.querySelectorAll('input:not([type="radio"]),textarea').forEach(input => {
      input.value='';
      input.dispatchEvent(new Event('input',{bubbles:true}));
      clearFieldError(input);
    });
    const direct=screen.querySelector('input[name="dropoffMethod"][value="hand"]');
    if(direct) direct.checked=true;
    closeAddressSuggestions();
    const suggestions=screen.querySelector('[data-address-suggestions]');
    if(suggestions) suggestions.replaceChildren();
    screen.dataset.selectedKm='';
    writeDeliveryAddressDraft(screen,{});
    if(typeof simState==='object' && simState) simState.picked=false;
    flowState.orderState.address={};
    flowState.orderState.addressConfirmed=false;
    invalidateFulfillmentQuote();
    persistFlowState();
    syncFieldClearButtons();
    syncDeliveryAddress();
    screen.querySelector('#addrSearch')?.focus({preventScroll:true});
    showActionToast('ล้างข้อมูลที่อยู่ทั้งหมดแล้ว','success');
  }


  /* Client, 22 Sep: "ตรงผู้รับด้วยนะ". The button at the top of the page empties
     the whole screen; this one empties only the recipient, so correcting who it
     goes to does not throw away the address you just checked. */
  function recipientFields(){
    return ['recipientFirstName','recipientLastName','recipientPhone']
      .map(id => document.getElementById(id)).filter(Boolean);
  }

/** Initialization is called by shared/runtime.js at the original dependency-safe position. */
function kraneInit_address_155(){
  ['recipientFirstName','recipientLastName','recipientPhone','addrFloor','addrNote','addrLabel'].forEach(id => {
    document.getElementById(id)?.addEventListener('input',persistAddressEditorDraft);
  });
}


  function syncDeliveryAddress({hydrateForm=false}={}){
    const address=flowState.orderState.address;
    const confirmed=Boolean(flowState.orderState.addressConfirmed && address.building && address.line && address.district);
    const pickup=flowState.orderState.fulfillmentMode==='pickup';
    /* Client, 23 Sep: no description lines on the checkout rows. "ยังไม่ได้
       เลือกที่อยู่จัดส่ง" under "ที่อยู่จัดส่ง" said nothing the label and the
       "เพิ่มที่อยู่" tag beside it did not already say, so the second line is
       shown only once it carries the address itself. */
    document.querySelectorAll('[data-payment-address]').forEach(el => {
      el.textContent=confirmed ? deliveryAddressSummary(address) : '';
      el.hidden=!confirmed;
    });
    /* Client, 1 Sep: New wants the name on this screen, the way a delivery app
       shows it — who it is going to sits with where it is going, so the patient
       can check both without opening the address screen. Data-driven, so there
       is no fixed string here for the language pass to miss. */
    const recipient=document.querySelector('[data-payment-recipient]');
    if(recipient){
      const name=recipientNameParts(address);
      const fullName=[name.firstName,name.lastName].filter(Boolean).join(' ');
      const parts=[fullName,address.recipientPhone].map(part => (part || '').trim()).filter(Boolean);
      recipient.textContent=parts.join(' · ');
      recipient.hidden=!(confirmed && parts.length);
    }
    const row=document.querySelector('[data-payment-address-row]');
    const title=document.querySelector('[data-fulfillment-address-title]');
    if(title) title.hidden=confirmed;
    if(row){
      row.dataset.go='address';
      row.classList.toggle('checkout-row--empty',!confirmed);
      row.setAttribute('aria-label',confirmed
        ? `${pickup ? 'เปลี่ยนตำแหน่ง' : 'เปลี่ยนที่อยู่จัดส่ง'}: ${deliveryAddressSummary(address)}`
        : (pickup ? 'เพิ่มตำแหน่งเพื่อค้นหาสาขาใกล้คุณ' : 'เพิ่มที่อยู่จัดส่ง'));
    }
    const compactRow=document.querySelector('[data-delivery-address-detail-section]');
    if(compactRow) compactRow.dataset.go='address';
    const action=document.querySelector('[data-payment-address-action]');
    if(action){
      action.textContent=pickup ? 'เพิ่มตำแหน่ง' : 'เพิ่มที่อยู่';
      /* Once the address is on the row the tag repeated what the row and its
         chevron already said, so it is only shown while one is missing
         (client, 29 Sep). */
      action.hidden=confirmed;
      // Missing address blocks payment, so the tag carries the error tone.
      action.classList.toggle('checkout-row__tag--error',!confirmed);
    }
    const detail=document.querySelector('[data-payment-address-detail]');
    if(detail){
      const dropoffLabels={lobby:'วางไว้ที่ล็อบบี้',doorstep:'วางไว้หน้าประตู',security:'ฝากไว้ที่ รปภ.',hand:'ส่งให้ฉันโดยตรง'};
      const floor=address.floor ? (/^ชั้น\s/.test(address.floor) ? address.floor : `ชั้น ${address.floor}`) : '';
      detail.textContent=confirmed
        ? [floor,dropoffLabels[address.dropoffMethod || 'hand']].filter(Boolean).join(' · ')
        : '';
      detail.hidden=!confirmed;
    }
    const formAddress=deliveryAddressDraft();
    const previewTitles=document.querySelectorAll('[data-address-preview-title]');
    const previewDetails=document.querySelectorAll('[data-address-preview-detail]');
    const hasDraft=Boolean(formAddress.building && formAddress.line && formAddress.district);
    previewTitles.forEach(el => { el.textContent=hasDraft ? (formAddress.building || 'ที่อยู่จัดส่ง') : 'เลือกที่อยู่จัดส่ง'; });
    const previewParts=[...new Set([formAddress.building,formAddress.line,formAddress.district].filter(Boolean))];
    previewDetails.forEach(el => { el.textContent=hasDraft
      ? previewParts.join(' · ')
      : 'เลือกตำแหน่งจากแผนที่เพื่อระบุที่อยู่จัดส่ง'; });
    renderAddressPinPreview();
    syncAddressEditorReadiness();
    syncCheckoutReadiness();
    if(!hydrateForm) return;
    const screen=document.getElementById('address');
    if(!screen) return;
    /* The recipient defaults to the account holder on the ordinary address
       page, so a first order opens prefilled with the name and phone captured
       at signup. Adding a *new* address is the exception: that page is blank
       by request (client, 5 Oct), because the second address a patient saves
       is often going to somebody else. */
    const creatingNewAddress=flowState.addressDraftMode==='new';
    const recipientParts=creatingNewAddress
      ? {firstName:String(formAddress.recipientFirstName || '').trim(),
         lastName:String(formAddress.recipientLastName || '').trim()}
      : recipientNameParts(formAddress);
    const values={
      recipientFirstName:recipientParts.firstName,
      recipientLastName:recipientParts.lastName,
      recipientPhone:creatingNewAddress
        ? (formAddress.recipientPhone ?? '')
        : (formAddress.recipientPhone ?? flowState.verifiedPhone ?? ''),
      addrSearch:formAddress.building,
      addrLabel:formAddress.label,
      addrBuilding:formAddress.building,
      addrFloor:formAddress.floor,
      addrLine:formAddress.line,
      addrSubdistrict:formAddress.subdistrict,
      addrDistrictName:formAddress.districtName,
      addrProvince:formAddress.province,
      addrPostcode:formAddress.postcode,
      addrDistrict:formAddress.district,
      addrNote:formAddress.note
    };
    Object.entries(values).forEach(([id,value]) => {
      const input=screen.querySelector(`#${id}`);
      if(input) input.value=id==='recipientPhone' ? formatPhoneForDisplay(value) : (value || '');
    });
    const dropoff=screen.querySelector(`input[name="dropoffMethod"][value="${formAddress.dropoffMethod || 'hand'}"]`);
    if(dropoff) dropoff.checked=true;
    screen.dataset.selectedKm=formAddress.km || '3.2';
    /* Hydration writes .value directly, so no input event fires and the ×
       buttons keep whatever state they had. Re-sync them here or an emptied
       field keeps offering a clear (client, 19 Aug). */
    syncFieldClearButtons();
    writeDeliveryAddressDraft(screen,formAddress);
    syncAddressEditorReadiness();
  }

  function syncAddressMapCascade(changedId='',savedValues={}){
    const province=document.getElementById('addressMapProvince');
    const district=document.getElementById('addressMapDistrict');
    const subdistrict=document.getElementById('addressMapSubdistrict');
    const postcode=document.getElementById('addressMapPostcode');
    if(!province||!district||!subdistrict||!postcode)return;
    let provinceValue=savedValues.addressMapProvince ?? province.value;
    let districtValue=savedValues.addressMapDistrict ?? district.value;
    let subdistrictValue=savedValues.addressMapSubdistrict ?? subdistrict.value;
    let postcodeValue=savedValues.addressMapPostcode ?? postcode.value;
    if(changedId==='addressMapProvince'){districtValue='';subdistrictValue='';postcodeValue=''}
    if(changedId==='addressMapDistrict'){subdistrictValue='';postcodeValue=''}
    if(changedId==='addressMapSubdistrict')postcodeValue='';
    const districts=Object.keys(ADDRESS_MAP_GEOGRAPHY[provinceValue] || {});
    if(!districts.includes(districtValue) && !savedValues.addressMapDistrict)districtValue='';
    replaceAddressMapOptions(district,districts,districtValue,Boolean(provinceValue));
    const subdistricts=Object.keys(ADDRESS_MAP_GEOGRAPHY[provinceValue]?.[districtValue] || {});
    if(!subdistricts.includes(subdistrictValue) && !savedValues.addressMapSubdistrict)subdistrictValue='';
    replaceAddressMapOptions(subdistrict,subdistricts,subdistrictValue,Boolean(districtValue));
    const postcodes=ADDRESS_MAP_GEOGRAPHY[provinceValue]?.[districtValue]?.[subdistrictValue] || [];
    if(!postcodes.includes(postcodeValue) && !savedValues.addressMapPostcode)postcodeValue='';
    if(postcodes.length===1)postcodeValue=postcodes[0];
    replaceAddressMapOptions(postcode,postcodes,postcodeValue,Boolean(subdistrictValue));
  }

  function hydrateAddressMapSearch(){
    const address=deliveryAddressDraft();
    const search=flowState.addressSearchDraft;
    const query=document.getElementById('addressMapQuery');
    if(query)query.value=search?.query ?? [...new Set([address.building,address.line].filter(Boolean))].join(' ');
    const province=document.getElementById('addressMapProvince');
    if(province){
      const selectedProvince=search?.addressMapProvince ?? address.province;
      if(selectedProvince && ![...province.options].some(option => option.value===selectedProvince)){
        province.add(new Option(selectedProvince,selectedProvince));
        window.kraneRefreshSelectOptions?.(province);
      }
      province.value=search?.addressMapProvince ?? address.province ?? '';
      window.kraneRefreshSelectOptions?.(province);
      syncFloatingFieldState(province.closest('.float-field'));
    }
    syncAddressMapCascade('',{
      addressMapProvince:search?.addressMapProvince ?? address.province ?? '',
      addressMapDistrict:search?.addressMapDistrict ?? address.districtName ?? '',
      addressMapSubdistrict:search?.addressMapSubdistrict ?? address.subdistrict ?? '',
      addressMapPostcode:search?.addressMapPostcode ?? address.postcode ?? ''
    });
    syncFloatingFieldState(query?.closest('.float-field'));
    requestAnimationFrame(resizeAddressMapQuery);
  }

  function resizeAddressMapQuery(){
    const query=document.getElementById("addressMapQuery");
    if(!query || !query.clientWidth)return;
    query.style.height="auto";
    query.style.height=query.scrollHeight+"px";
  }

  function persistAddressSearchDraft(){
    const value=id => document.getElementById(id)?.value || '';
    flowState.addressSearchDraft={query:value('addressMapQuery'),...Object.fromEntries(ADDRESS_MAP_CASCADE_IDS.map(id => [id,value(id)]))};
    persistFlowState();
  }

/** Initialization is called by shared/runtime.js at the original dependency-safe position. */
function kraneInit_address_168(){
  document.getElementById('addressMapQuery')?.addEventListener('input',() => {
    resizeAddressMapQuery();
    persistAddressSearchDraft();
  });
}


  /* The manual fields sit on the form now, so what the patient types in them
     has to reach the address the form saves without a "check this address"
     round trip. Same mapping applyAddressMapSearch makes, minus the
     validation and the navigation: those belong to a submit, and there isn't
     one any more. */
  function commitManualAddress(){
    if(!document.getElementById('address')?.classList.contains('active')) return;
    const value=id => (document.getElementById(id)?.value || '').trim();
    const query=value('addressMapQuery');
    const place={title:query,building:query,floor:deliveryAddressDraft().floor || '',line:query,
      subdistrict:value('addressMapSubdistrict'),districtName:value('addressMapDistrict'),
      province:value('addressMapProvince'),postcode:value('addressMapPostcode')};
    place.district=composeDistrict(place);
    place.detail=[place.building,place.line,place.district].filter(Boolean).join(' · ');
    applyAddress(place);
    syncAddressEditorReadiness();
  }

/** Initialization is called by shared/runtime.js at the original dependency-safe position. */
function kraneInit_address_170(){
  ['addressMapQuery',...ADDRESS_MAP_CASCADE_IDS].forEach(id => {
    const field=document.getElementById(id);
    field?.addEventListener('change',commitManualAddress);
    field?.addEventListener('input',() => { clearFieldError(field); commitManualAddress(); });
  });
}


  /* Read the form itself. The old version read screen.dataset.addressDraft,
     which was only ever written by the fake "pick an address" demo button. That
     button is gone, so the draft stayed empty, validation always failed and the
     CTA refused to advance no matter how much you typed. */
  function readAddressInputs(){
    const v = id => (document.getElementById(id)?.value || '').trim();
    syncComposedDistrict();
    return {
      recipientFirstName:v('recipientFirstName'), recipientLastName:v('recipientLastName'),
      recipientName:[v('recipientFirstName'),v('recipientLastName')].filter(Boolean).join(' '), recipientPhone:normalizePhone(v('recipientPhone')),
      label:v('addrLabel'),
      remember:true,
      building:v('addrBuilding'), floor:v('addrFloor'), line:v('addrLine'),
      subdistrict:v('addrSubdistrict'), districtName:v('addrDistrictName'),
      province:v('addrProvince'), postcode:v('addrPostcode'),
      district:v('addrDistrict'), note:v('addrNote'),
      dropoffMethod:document.querySelector('#address input[name="dropoffMethod"]:checked')?.value || 'hand'
    };
  }

  function syncAddressEditorReadiness(){
    const screen=document.getElementById('address');
    if(!screen)return;
    const a=readAddressInputs();
    const locationComplete=Boolean(a.building && a.line && a.subdistrict && a.districtName && a.province && /^\d{5}$/.test(a.postcode));
    const recipientComplete=Boolean(a.recipientFirstName && a.recipientLastName && /^0\d{9}$/.test(normalizePhone(a.recipientPhone)));
    const button=screen.querySelector('[data-address-save]');
    if(button){
      button.disabled=false;
      button.classList.remove('btn--blocked');
      button.removeAttribute('aria-disabled');
      /* The form saves to the book and sends the order to this address, in
         both modes — the list is where an address is merely chosen. */
      button.textContent='บันทึกและใช้ที่อยู่นี้';

    }
    const recipient=screen.querySelector('[data-address-editor-recipient]');
    const phone=screen.querySelector('[data-address-editor-phone]');
    if(recipient) recipient.textContent=[a.recipientFirstName,a.recipientLastName].filter(Boolean).join(' ') || 'เพิ่มข้อมูลผู้รับยา';
    if(phone) phone.textContent=formatPhoneForDisplay(a.recipientPhone || '') || 'ยังไม่มีเบอร์โทรศัพท์';
  }

/** Initialization is called by shared/runtime.js at the original dependency-safe position. */
function kraneInit_address_173(){
  ['recipientFirstName','recipientLastName','recipientPhone','addrBuilding','addrLine','addrSubdistrict','addrDistrictName','addrProvince','addrPostcode']
    .forEach(id => document.getElementById(id)?.addEventListener('input',syncAddressEditorReadiness));
}


  /* Open the address form already showing which fields are empty, rather than
     leaving the patient to find them. hydrateAddressMapSearch runs on its own
     timeout when the screen opens, so the errors are painted after it. */
  function openAddressFormForGaps(gaps){
    /* The fields these gaps name are on the form now, not on a screen of
       their own, so this opens the form rather than the map. */
    addressFormIntent=true;
    show('address');
    window.setTimeout(() => {
      let first=null;
      const seen=new Set();
      gaps.forEach(({field,label}) => {
        if(seen.has(field)) return;
        seen.add(field);
        const input=document.getElementById(field);
        if(!input) return;
        setFieldError(input,'กรุณากรอก'+label);
        if(!first) first=input;
      });
      if(first){
        const focusTarget=first.closest('.field')?.querySelector('[role="combobox"]') || first;
        focusTarget.focus({preventScroll:false});
      }
    },0);
  }

  function saveDeliveryAddress(){
    const screen=document.getElementById('address');
    if(!screen) return false;
    const a=readAddressInputs();
    /* Postal values come from the dedicated pin/search screen. If there is no
       resolved location yet, take the patient there instead of surfacing
       invisible validation errors on this deliberately short form. */
    const gaps=addressLocationGaps(a);
    if(gaps.length){
      showActionToast('ที่อยู่ยังไม่ครบ กรอก'+gaps[0].label+'เพื่อไปต่อ','warning');
      openAddressFormForGaps(gaps);
      return false;
    }
    /* Recipient data normally comes from the verified account. It only opens
       here when the patient explicitly taps “แก้ไข” on the summary screen. */
    const required=[
      ['recipientFirstName','ชื่อ'], ['recipientLastName','นามสกุล'], ['recipientPhone','เบอร์โทรศัพท์']
    ];
    let firstMissing=null;
    for(const [id,label] of required){
      const el=document.getElementById(id);
      if(!el) continue;
      if(el.value.trim()){ clearFieldError(el); continue; }
      setFieldError(el,'กรุณากรอก'+label);
      if(!firstMissing) firstMissing=el;
    }
    const phone=document.getElementById('recipientPhone');
    if(phone && phone.value.trim() && !/^0\d{9}$/.test(normalizePhone(phone.value))){
      setFieldError(phone,'กรอกเบอร์โทรศัพท์ 10 หลักที่ขึ้นต้นด้วย 0');
      if(!firstMissing) firstMissing=phone;
    }
    if(firstMissing){
      addressRecipientEditing=true;
      const recipientEditor=document.querySelector('[data-address-recipient-editor]');
      if(recipientEditor) recipientEditor.hidden=false;
      showActionToast('ยังกรอกข้อมูลไม่ครบ ดูช่องที่ไฮไลต์ไว้','warning');
      firstMissing.focus();
      try{ firstMissing.scrollIntoView({block:'center',behavior:reduceMotion?'auto':'smooth'}) }catch(err){}
      return false;
    }
    writeDeliveryAddressDraft(screen,{
      building:a.building, floor:a.floor, line:a.line,
      subdistrict:a.subdistrict, districtName:a.districtName,
      province:a.province, postcode:a.postcode, district:a.district,
      note:a.note, dropoffMethod:a.dropoffMethod,
      km:screen.dataset.selectedKm || flowState.orderState.address.km || '3.2'
    });
    flowState.orderState.address={
      label:a.label,
      building:a.building, floor:a.floor, line:a.line,
      subdistrict:a.subdistrict, districtName:a.districtName,
      province:a.province, postcode:a.postcode, district:a.district, note:a.note,
      dropoffMethod:a.dropoffMethod,
      recipientFirstName:a.recipientFirstName, recipientLastName:a.recipientLastName,
      recipientName:a.recipientName, recipientPhone:a.recipientPhone,
      km:screen.dataset.selectedKm || flowState.orderState.address.km || '3.2'
    };
    flowState.orderState.addressConfirmed=true;
    delete flowState.addressDraft;
    rememberDeliveryAddress(flowState.orderState.address,{index:addressEditingSavedIndex});
    persistAddressBook();
    invalidateFulfillmentQuote();
    persistFlowState();
    syncDeliveryAddress();
    syncFieldClearButtons();
    addressRecipientEditing=false;
    return true;
  }

  function setAddressPageMode(mode,{focus=false}={}){
    /* New and existing addresses share one form; the heading and action make
       the task clear while the controls stay in the same places. */
    const editing=true;
    addressPageMode=mode==='new' ? 'new' : (mode==='list' ? 'list' : 'editor');
    document.getElementById('address')?.setAttribute('data-address-mode',addressPageMode);
    flowState.addressDraftMode=addressPageMode;
    persistFlowState();
    const listing=addressPageMode==='list';
    const editorView=document.querySelector('[data-address-editor-view]');
    const editorFooter=document.querySelector('[data-address-editor-footer]');
    const listView=document.querySelector('[data-address-list-view]');
    const listFooter=document.querySelector('[data-address-list-footer]');
    if(editorView) editorView.hidden=listing;
    if(editorFooter) editorFooter.hidden=listing;
    if(listView) listView.hidden=!listing;
    if(listFooter) listFooter.hidden=!listing;
    if(listing){ renderAddressList(); return; }
    const title=document.querySelector('[data-address-editor-title]');
    if(title){
      // Three states, and the heading names the one the patient is in.
      const draft=deliveryAddressDraft();
      title.textContent=addressPageMode==='new' ? 'เพิ่มที่อยู่ใหม่'
        : (draft.building ? 'แก้ไขที่อยู่จัดส่ง' : 'ที่อยู่จัดส่ง');
    }
    /* Optional delivery details are part of the canonical editor. A restored
       session could retain stale hidden attributes from the retired compact
       mode, leaving only the section title above the CTA. Clear those flags
       whenever the editor opens so its heading and controls stay together. */
    document.querySelectorAll('#address .address-essential-fields,#address .address-essential-fields>.field')
      .forEach(element => { element.hidden=false; });
    syncFieldClearButtons();
    syncAddressEditorReadiness();
    if(focus){
      const target=document.getElementById('addrSearch') || document.getElementById('addrNote');
      target?.focus({preventScroll:true});
    }
  }

  function useSavedAddress(index,{quiet=false}={}){
    const entry=savedAddresses()[index];
    if(!entry) return;
    delete flowState.addressSearchDraft;
    flowState.addressDraft={...entry,remember:true};
    addressPageMode='editor';
    flowState.addressDraftMode='editor';
    persistFlowState();
    addressEditingSavedIndex=index;
    addressFormIntent=true;
    show('address');
    syncDeliveryAddress({hydrateForm:true});
    syncFloatingFieldStates(document.getElementById('address'));
    document.querySelectorAll('#address .is-invalid input').forEach(clearFieldError);
    document.getElementById('addrSearch')?.focus({preventScroll:true});
    if(!quiet)showActionToast('เลือกที่อยู่แล้ว กรุณาตรวจสอบก่อนยืนยัน','success');
  }

  function syncAddressLabelChips(){
    const label=(document.getElementById('addrLabel')?.value || '').trim();
    const chips=[...document.querySelectorAll('[data-address-label]')];
    const preset=chips.find(chip => chip.dataset.addressLabel && chip.dataset.addressLabel===label);
    if(preset) addressLabelCustom=false;
    else if(label) addressLabelCustom=true;
    chips.forEach(chip => {
      const on=preset ? chip===preset : (!chip.dataset.addressLabel && addressLabelCustom);
      chip.classList.toggle('is-selected',on);
      chip.setAttribute('aria-pressed',String(on));
    });
    const custom=document.querySelector('[data-address-label-custom]');
    if(custom) custom.hidden=!addressLabelCustom;
  }

/** Initialization is called by shared/runtime.js at the original dependency-safe position. */
function kraneInit_address_205(){
  document.addEventListener('click',event => {
    const chip=event.target.closest('[data-address-label]');
    if(!chip) return;
    const field=document.getElementById('addrLabel');
    if(!field) return;
    const custom=document.querySelector('[data-address-label-custom]');
    if(chip.dataset.addressLabel){
      addressLabelCustom=false;
      field.value=chip.dataset.addressLabel;
      if(custom) custom.hidden=true;
    } else {
      addressLabelCustom=true;
      if(custom) custom.hidden=false;
      if([...document.querySelectorAll('[data-address-label]')].some(other => other.dataset.addressLabel===field.value.trim())) field.value='';
      field.focus({preventScroll:true});
    }
    field.dispatchEvent(new Event('input',{bubbles:true}));
    syncAddressLabelChips();
  });
}


/** Initialization is called by shared/runtime.js at the original dependency-safe position. */
function kraneInit_address_206(){
  document.getElementById('addrLabel')?.addEventListener('input',syncAddressLabelChips);
}


  function startNewAddress({focus=true}={}){
    delete flowState.addressSearchDraft;
    /* Client, 5 Oct: a new address starts blank, all of it. The recipient was
       left behind because only the address fields were listed here, so the
       page titled "เพิ่มที่อยู่ใหม่" opened with the last recipient already in
       it — and a second address is often for somebody else. */
    flowState.addressDraft={building:'',line:'',subdistrict:'',districtName:'',province:'',postcode:'',district:'',label:'',floor:'',note:'',
      recipientFirstName:'',recipientLastName:'',recipientName:'',recipientPhone:'',remember:false};
    ['addrSearch','addrLabel','addrBuilding','addrFloor','addrLine','addrSubdistrict','addrDistrictName','addrProvince','addrPostcode','addrNote',
     'addressMapQuery','addressMapProvince','addressMapDistrict','addressMapSubdistrict','addressMapPostcode',
     'recipientFirstName','recipientLastName','recipientPhone']
      .forEach(id => {
        const field=document.getElementById(id);
        if(!field) return;
        field.value='';
        field.dispatchEvent(new Event('input',{bubbles:true}));
        clearFieldError(field);
      });
    addressLabelCustom=false;
    addressEditingSavedIndex=-1;
    addressPageMode='new';
    flowState.addressDraftMode='new';
    persistFlowState();
    syncFieldClearButtons();
    addressFormIntent=true;
    show('address');
  }

/** Initialization is called by shared/runtime.js at the original dependency-safe position. */
function kraneInit_address_208(){
  document.addEventListener('click',event => {
    if(event.target.closest('[data-address-new]')){ startNewAddress(); return; }
    const listPick=event.target.closest('[data-address-list-pick]');
    if(listPick){ selectListAddress(Number(listPick.dataset.addressListPick)); return; }
    const remove=event.target.closest('[data-address-delete]');
    if(remove){ confirmDeleteSavedAddress(Number(remove.dataset.addressDelete),remove); return; }
    if(event.target.closest('[data-address-list-confirm]')){ confirmListAddress(); return; }
    const edit=event.target.closest('[data-address-edit]');
    if(edit){ editSavedAddress(Number(edit.dataset.addressEdit)); return; }
    if(event.target.closest('[data-address-confirm]')){
      if(!flowState.orderState.addressConfirmed){
        showActionToast('กรุณาเลือกหรือเพิ่มที่อยู่จัดส่ง','warning');
        return;
      }
      rememberDeliveryAddress(flowState.orderState.address);
      persistAddressBook();
      persistFlowState();
      focusCheckoutDelivery=true;
      replaceCurrent('payment');
      startInlineDeliveryQuote();
      return;
    }
    if(event.target.closest('[data-address-editor-recipient-edit]')){
      addressRecipientEditing=true;
      const editor=document.querySelector('[data-address-recipient-editor]');
      if(editor) editor.hidden=false;
      const first=document.getElementById('recipientFirstName');
      first?.focus({preventScroll:true});
      try{ editor?.scrollIntoView({block:'center',behavior:reduceMotion?'auto':'smooth'}) }catch(err){}
      return;
    }
  });
}


  function bindAddressSearch(wrap){
    const input=wrap.querySelector('[data-address-search]');
    const list=wrap.querySelector('[data-address-suggestions]');
    if(!input || !list || input.dataset.searchBound==='true') return;
    input.dataset.searchBound='true';
    input.addEventListener('input',event => { if(!event.isComposing) scheduleAddressSearch(input.value); });
    input.addEventListener('compositionend',() => scheduleAddressSearch(input.value));
    input.addEventListener('focus',() => { if(input.value) scheduleAddressSearch(input.value); });
    input.addEventListener('keydown',event => {
      if(event.key==='Escape') closeAddressSuggestions();
      if(event.key==='ArrowDown' && !list.hidden){
        event.preventDefault();
        list.querySelector('[data-address-suggestion]')?.focus();
      }
    });
    list.addEventListener('keydown',event => {
      const options=[...list.querySelectorAll('[data-address-suggestion]')];
      const index=options.indexOf(document.activeElement);
      if(event.key==='ArrowDown' && index>-1){ event.preventDefault(); options[(index+1)%options.length]?.focus(); }
      if(event.key==='ArrowUp' && index>-1){ event.preventDefault(); (index===0 ? input : options[index-1])?.focus(); }
      if(event.key==='Escape'){ event.preventDefault(); closeAddressSuggestions(); input.focus(); }
    });
    list.addEventListener('click',event => {
      const option=event.target.closest('[data-address-suggestion]');
      if(!option) return;
      const place=addressSuggestions[Number(option.dataset.addressSuggestion)];
      if(!place) return;
      applyAddress(place);
      input.value=place.title;
      closeAddressSuggestions();
      /* The search writes the stored address; the visible form has to be read
         back from it or the patient sees the old values in the fields below. */
      ['addressMapQuery',...ADDRESS_MAP_CASCADE_IDS].forEach(id => {
        const field=document.getElementById(id);
        if(field) clearFieldError(field);
      });
      /* Searching from the form moves the pin the form is showing. */
      if(document.getElementById('address')?.classList.contains('active')) renderAddressPinPreview();
      const gaps=addressLocationGaps();
      showActionToast(gaps.length
        ? 'กรอกที่อยู่จากผลการค้นหาแล้ว ยังขาด'+gaps[0].label
        : 'กรอกที่อยู่จากผลการค้นหาแล้ว', gaps.length ? 'warning' : 'success');
    });
  }


  function applyAddress(place){
    if(Number.isFinite(place.lat)&&Number.isFinite(place.lon)){
      ++manualMapRequest;
      Object.assign(osmView,{lat:place.lat,lon:place.lon});
    }
    delete flowState.addressSearchDraft;
    const before=deliveryAddressDraft();
    simState.picked=true;
    const set=(id,v)=>{ const el=document.getElementById(id); if(el && el.value!==v){ el.value=v; el.dispatchEvent(new Event('input',{bubbles:true})); } };
    set('addrBuilding',place.building); set('addrFloor',place.floor); set('addrLine',place.line);
    set('addrSubdistrict',place.subdistrict); set('addrDistrictName',place.districtName);
    set('addrProvince',place.province); set('addrPostcode',place.postcode);
    syncComposedDistrict();
    document.querySelectorAll('[data-address-preview-title]').forEach(el => { el.textContent=place.title; });
    document.querySelectorAll('[data-address-preview-detail]').forEach(el => { el.textContent=place.detail; });
    const prev=document.querySelector('[data-address-map]');
    if(prev) prev.classList.add('is-pin-selected');
    // Location edits remain a draft until the patient confirms the recipient.
    flowState.addressDraft={...before,
      building:place.building || '', floor:place.floor || before.floor || '',
      line:place.line || '', subdistrict:place.subdistrict || '',
      districtName:place.districtName || '', province:place.province || '',
      postcode:place.postcode || '', district:place.district || '',
      lat:place.lat ?? before.lat,lon:place.lon ?? before.lon};
    if(Number.isFinite(place.lat)&&Number.isFinite(place.lon)){hydrateAddressMapSearch();renderAddressPinPreview();}
    persistFlowState();
    syncFieldClearButtons();
  }


  /* addrDistrict is never typed into. It is recomposed from the four visible
     parts on every edit, so the payment summary and the km lookup keep reading
     exactly the string shape they read before the form was split. */
  function syncComposedDistrict(){
    const v=id=>(document.getElementById(id)?.value||'').trim();
    const el=document.getElementById('addrDistrict');
    if(!el) return;
    el.value=composeDistrict({subdistrict:v('addrSubdistrict'),districtName:v('addrDistrictName'),
                              province:v('addrProvince'),postcode:v('addrPostcode')});
    el.dispatchEvent(new Event('change',{bubbles:true}));
  }

/** Initialization is called by shared/runtime.js at the original dependency-safe position. */
function kraneInit_address_328(){

  /* Keep addrDistrict in step with the four visible parts. */
  ['addrSubdistrict','addrDistrictName','addrProvince','addrPostcode'].forEach(id => {
    document.addEventListener('input', e => { if(e.target && e.target.id===id) syncComposedDistrict(); });
  });
}


/** Initialization is called by shared/runtime.js at the original dependency-safe position. */
function kraneInit_address_329(){

  /* The map takes half the viewport, so every address field sits below the fold.
     On a phone the keyboard then covers whichever field is focused, so scroll it
     back into the visible half. scrollIntoView with block:'center' lands it above
     the keyboard on both 390px and 360px viewports. */
  document.addEventListener('focusin', e => {
    const field=e.target && e.target.closest && e.target.closest('#address .field');
    if(!field) return;
    setTimeout(() => { try{ field.scrollIntoView({block:'center',behavior:reduceMotion?'auto':'smooth'}) }catch(err){} }, 120);
  });
}


/** Initialization is called by shared/runtime.js at the original dependency-safe position. */
function kraneInit_address_579(){
  document.addEventListener('click', event => {
    if(event.target.closest('[data-open-branch]')){ openPickupBranchModal(); return; }
    if(event.target.closest('[data-branch-close]')){ closePickupBranchModal(); return; }
    if(event.target.closest('[data-pickup-location-add]')){
      closePickupBranchModal();
      show('address');
      return;
    }
    const option = event.target.closest('[data-branch-option]');
    if(!option || !pickupBranchModal || pickupBranchModal.hidden || !pickupLocationConfirmed()) return;
    flowState.orderState.pickupBranch = {
      id: option.dataset.branchOption,
      name: option.dataset.branchName,
      hint: option.dataset.branchHint,
      locationKey: pickupLocationKey()
    };
    persistFlowState();
    refreshMedicationCheckout();
    closePickupBranchModal();
    showActionToast('เลือก' + option.dataset.branchName + 'แล้ว','success');
  });
}


/** Page-owned initialization; invoked once at its original position by shared/runtime.js. */
function kraneInit_address_owned_104(){
document.querySelector('[data-clear-recipient]')?.addEventListener('click',clearRecipientFields);
}

/** Page-owned initialization; invoked once at its original position by shared/runtime.js. */
function kraneInit_address_owned_139(){
addressPicker?.addEventListener('close',() => {
    addressPickerSession++;
    osmReverseToken++;
    clearTimeout(osmReverseTimer);
    if(addressPickerSnapshot)Object.assign(osmView,addressPickerSnapshot);
    addressPickerSnapshot=null;
    addressPickerPlace=null;
    const focusTarget=document.querySelector('[data-address-picker-open]');
    focusTarget?.focus({preventScroll:true});
  });
}

/** Page-owned initialization; invoked once at its original position by shared/runtime.js. */
function kraneInit_address_owned_151(){
document.querySelectorAll('[data-address-pin-map]').forEach(host=>addressPreviewObserver.observe(host));
}

/** Page-owned initialization; invoked once at its original position by shared/runtime.js. */
function kraneInit_address_owned_327(){
if(addrSearch && addrSuggest){
    const sync = () => { addrSuggest.style.display = addrSearch.value.trim() ? '' : 'none'; };
    addrSearch.addEventListener('input', sync);
    addrSearch.addEventListener('focus', sync);
  }
}

/** Page-owned initialization; invoked once at its original position by shared/runtime.js. */
function kraneInit_address_owned_329(){
if(deliveryAddressScreen){
    // Update the persisted draft only from a field the patient is actively
    // editing. Background browser autofill never gets to replace the chosen pin.
    deliveryAddressScreen.addEventListener('input',event => {
      const key=ADDRESS_FIELD_KEYS[event.target.id];
      if(!key || document.activeElement!==event.target) return;
      const draft=readDeliveryAddressDraft(deliveryAddressScreen);
      draft[key]=event.target.value;
      draft.km=deliveryAddressScreen.dataset.selectedKm || draft.km || '3.2';
      writeDeliveryAddressDraft(deliveryAddressScreen,draft);
    });
  }
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_address_fillSuggestion(e, fillItem) {
      const g = fillItem.parentElement, scr = fillItem.closest('.screen'), d = fillItem.dataset;
      [...g.querySelectorAll('.ac-item')].forEach(x => x.setAttribute('aria-selected', x===fillItem));
      const set = (id,v) => { const el = scr.querySelector('#'+id); if(el && v!=null) el.value = v; };
      set('addrBuilding',d.building); set('addrFloor',d.floor); set('addrLine',d.addr); set('addrDistrict',d.district);
      if(d.km) scr.dataset.selectedKm=d.km;
      // reflect the choice in the search box and close the suggestions
      const sb = scr.querySelector('#addrSearch'); const nm = fillItem.querySelector('.ac-name');
      if(sb && nm) sb.value = nm.textContent.trim();
      const sg = scr.querySelector('#addrSuggest'); if(sg) sg.style.display = 'none';
      writeDeliveryAddressDraft(scr,{
        building:d.building,floor:d.floor,line:d.addr,district:d.district,
        note:scr.querySelector('#addrNote')?.value || '',km:d.km || scr.dataset.selectedKm
      });

  return false;
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_address_zoom(e, simZoom) {
      const dir=parseInt(simZoom.dataset.simZoom,10);
      if(osmZoomBy(dir)) return true;
      simState.z=Math.min(2.6,Math.max(.7, +(simState.z + dir*0.25).toFixed(2)));
      simApplyTransform(); return true;

  return false;
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_address_openPicker(e) { openAddressPicker(); return true;
  return false;
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_address_closePicker(e) { closeAddressPicker(); return true;
  return false;
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_address_locate(e) { simLocate(); return true;
  return false;
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_address_confirmMap(e) { confirmAddressPicker(); return true;
  return false;
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_address_save(e, addressSave) {
      if(!saveDeliveryAddress()) return true;
      addressEditingSavedIndex=-1;
      /* The form is done with; the page goes back to its list so returning to
         it shows the address that was just saved, selected. */
      addressListSelected=savedAddresses().findIndex(entry => addressBookKey(entry)===addressBookKey(flowState.orderState.address));
      setAddressPageMode('list');
      focusCheckoutDelivery=true;
      replaceCurrent('payment');
      startInlineDeliveryQuote();
      showActionToast('บันทึกและใช้ที่อยู่นี้แล้ว','success');
      return true;

  return false;
}

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_address_recipientEdit(e) {addressRecipientEditing=true;
  return false;
}

// Called once at the original bootstrap position.
function kraneInit_address_clearAll() {
document.querySelector('[data-address-clear-all]')?.addEventListener('click',clearDeliveryAddressForm);
}

// Called once at the original bootstrap position.
function kraneInit_address_cascade() {
document.addEventListener('change',event => {
    if(ADDRESS_MAP_CASCADE_IDS.includes(event.target?.id)){
      syncAddressMapCascade(event.target.id);
      commitManualAddress();
      persistAddressSearchDraft();
      syncMapFromAddressFields();
    }
  });
}

// Called once at the original bootstrap position.
function kraneInit_address_resize() {
window.addEventListener("resize",resizeAddressMapQuery);
}

// Called once at the original bootstrap position.
function kraneInit_address_places() {
SIM_PLACES.forEach(p => { p.district = composeDistrict(p); p.detail = p.line + ' · ' + p.district; });
}

// Called once at the original bootstrap position.
function kraneInit_address_pickupEscape() {
pickupBranchModal?.addEventListener('keydown', event => { if(event.key==='Escape') closePickupBranchModal(); });
}
