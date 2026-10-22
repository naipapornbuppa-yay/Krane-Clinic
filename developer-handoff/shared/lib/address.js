/* Shared lexical runtime: load through the handoff build; see DEPENDENCIES.md. */

  function deliveryAddressSummary(address=flowState.orderState.address){
    const primary=String(address.building || address.line || 'ยังไม่ได้เลือกที่อยู่จัดส่ง').trim();
    const district=String(address.district || '').trim();
    return district && !primary.includes(district) ? `${primary} · ${district}` : primary;
  }

  function replaceAddressMapOptions(control,options,value,enabled){
    if(!control)return;
    const safeOptions=[...new Set(options.filter(Boolean))];
    if(value && !safeOptions.includes(value))safeOptions.push(value);
    control.replaceChildren(new Option('',''),...safeOptions.map(option => new Option(option,option)));
    control.value=value && safeOptions.includes(value) ? value : '';
    control.disabled=!enabled;
    window.kraneRefreshSelectOptions?.(control);
    syncFloatingFieldState(control.closest('.float-field'));
  }

  async function syncMapFromAddressFields(){
    const token=++manualMapRequest;
    ++osmReverseToken;
    const values=ADDRESS_MAP_CASCADE_IDS.map(id=>document.getElementById(id)?.value || '');
    if(!values[0])return;
    const results=await osmSearch([...values.slice(0,3).reverse(),values[3],'ประเทศไทย'].filter(Boolean).join(' '));
    if(token!==manualMapRequest)return;
    const place=results?.find(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon));
    if(!place){showActionToast('ยังค้นหาตำแหน่งบนแผนที่ไม่ได้ กรุณาลองอีกครั้งหรือเลือกจุดบนแผนที่','warning');return;}
    Object.assign(osmView,{lat:place.lat,lon:place.lon,zoom:values[2]?15:values[1]?12:9});
    flowState.addressDraft={...deliveryAddressDraft(),lat:place.lat,lon:place.lon};
    persistFlowState();
    renderAddressPinPreview();
    if(addressPicker?.open)renderOsmTiles();
  }

  function addressLocationGaps(address){
    const a=address || readAddressInputs();
    return ADDRESS_GAP_FIELDS.filter(({key}) => {
      const value=String(a[key] || '').trim();
      if(key==='postcode') return !/^\d{5}$/.test(value);
      return !value;
    });
  }


  /* ---------- The address book ----------
     A patient who orders to more than one place was retyping the form every
     time, because the only address kept was the last one used. Saving keeps
     each one, keyed on the address itself rather than on an id the form would
     have to carry, so confirming the same place twice updates that entry
     instead of listing it again. */
  function addressBookKey(address){
    return [address.building,address.line,address.subdistrict,address.districtName,address.postcode]
      .map(part => String(part || '').trim().toLowerCase()).join('|');
  }

  function addressBookName(address){
    return String(address.label || '').trim() || String(address.building || '').trim() || 'ที่อยู่จัดส่ง';
  }

  function addressBookFullLine(address){
    const parts=[
      address.building,
      address.floor ? `ชั้น ${address.floor}` : '',
      address.line,
      address.subdistrict,
      address.districtName,
      address.province,
      address.postcode
    ].map(part => String(part || '').trim()).filter(Boolean);
    return [...new Set(parts)].join(' ');
  }

  function addressBookRecipientLine(address){
    const name=recipientNameParts(address);
    const fullName=[name.firstName,name.lastName].filter(Boolean).join(' ');
    const phone=formatPhoneForDisplay(address.recipientPhone || '');
    return [fullName,phone].filter(Boolean).join(' · ');
  }

  function escapeAddressText(value){
    return String(value ?? '').replace(/[&<>"']/g,char => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[char]);
  }

  function addressBookStorageKey(){
    return 'krane-address-book-v1:' + String(flowState.verifiedPhone || flowState.patientId || 'guest');
  }

  function persistAddressBook(){
    if(!IS_DEMO_EMBED)writeLocalJson(addressBookStorageKey(),{entries:savedAddresses()});
  }

  function savedAddresses(){
    if(!Array.isArray(flowState.savedAddresses)){
      const stored=readLocalJson(addressBookStorageKey());
      flowState.savedAddresses=Array.isArray(stored.entries) ? stored.entries : [];
    }
    return flowState.savedAddresses;
  }

  function rememberDeliveryAddress(address,{index=-1}={}){
    if(!address || !address.building) return;
    const book=savedAddresses();
    const key=addressBookKey(address);
    const at=index>=0 && index<book.length ? index : book.findIndex(entry => addressBookKey(entry)===key);
    const entry={...address,lastUsedAt:Date.now()};
    if(at>=0) book[at]=entry; else book.push(entry);
  }

  /* "ใช้ล่าสุด" marks the address the patient last had delivered to, which is
     almost always the one they want again — so the list says which that was
     rather than making them read all of them to work it out. */
  function lastUsedAddressIndex(){
    const book=savedAddresses();
    let at=-1, newest=0;
    book.forEach((entry,index) => {
      const used=Number(entry.lastUsedAt) || 0;
      if(used>newest){ newest=used; at=index; }
    });
    return at;
  }



  function selectListAddress(index){
    if(!savedAddresses()[index]) return;
    addressListSelected=index;
    renderAddressList();
  }



  function deleteSavedAddress(index){
    const book=savedAddresses();
    const entry=book[index];
    if(!entry) return;
    book.splice(index,1);
    if(addressListSelected>index) addressListSelected--;
    else if(addressListSelected===index) addressListSelected=-1;
    /* The order was going to this address. Deleting it leaves the order
       without one rather than silently moving it to a different address. */
    if(addressBookKey(flowState.orderState.address || {})===addressBookKey(entry)){
      flowState.orderState.address={};
      flowState.orderState.addressConfirmed=false;
      invalidateFulfillmentQuote();
    }
    persistAddressBook();
    persistFlowState();
    renderAddressList();
    syncDeliveryAddress();
    showActionToast('ลบ' + addressBookName(entry) + 'แล้ว','success');
  }

  function editSavedAddress(index){useSavedAddress(index,{quiet:true});}

  /* ==================== SIMULATED MAP (prototype only) ====================
     SIMULATED, NOT REAL. There is no Google Maps API key in this prototype and
     the previous implementation was a keyless `output=embed` iframe, which
     cannot be panned or pin-dropped by the host page and sends any tap inside
     it out to Google. That iframe is gone: nothing on this screen navigates
     away from the app any more.

     What is real here: pan, zoom, pin placement, the empty -> filled state
     transition, and the field auto-fill. What is fake: the geography (a CSS
     street grid), the reverse geocoding (a lookup table of Bangkok addresses
     chosen by map position), and "current location" (a fixed Bangkok point,
     not navigator.geolocation).

     FOR PRODUCTION: replace .sim-map with a Maps JS API or Leaflet canvas,
     swap simReverseGeocode() for a Geocoding API call, and swap simLocate()
     for navigator.geolocation.getCurrentPosition(). The DOM contract below
     (data-sim-* hooks and applyAddress()) can stay as-is.
     ====================================================================== */
  /* Address parts are stored split, the way a Thai address form asks for them.
     `district` stays as a composed string because the payment summary and the
     km lookup already read it, so splitting the inputs does not ripple into the
     payment path. composeDistrict() is the single place that joins them. */
  function composeDistrict(p){
    return [p.subdistrict, p.districtName, p.province, p.postcode].filter(Boolean).join(' ');
  }


  function simReverseGeocode(x,y){
    // FAKE. Deterministic pick so panning to the same spot gives the same result.
    const idx = Math.abs(Math.round(x/180) * 3 + Math.round(y/180)) % SIM_PLACES.length;
    return SIM_PLACES[idx];
  }

  function addressPickerStatus(text){
    const status=document.querySelector('[data-address-picker-status]');
    if(status) status.textContent=text;
    const confirm=addressPicker?.querySelector('[data-address-map-confirm]');
    if(confirm){
      confirm.disabled=!addressPickerPlace;
      confirm.textContent='ใช้ตำแหน่งนี้';
    }
  }

  function closeAddressPicker(){ addressPicker?.close(); }

  function openAddressPicker(){
    if(!addressPicker || addressPicker.open)return;
    addressPickerSnapshot={...osmView};
    addressPickerPlace=null;
    addressPickerSession++;
    addressPicker.showModal();
    setupAddressMap();
    requestAnimationFrame(renderOsmTiles);
    simLocate();
  }

  function confirmAddressPicker(){
    if(!addressPickerPlace)return;
    if(addressPickerPlace){
      const place=addressPickerPlace;
      applyAddress(place);
      renderAddressPinPreview();
      syncAddressEditorReadiness();
      addressPickerSnapshot=null;
      /* The pin resolved to something, but not to a whole address. Say what is
         missing and open the form on it rather than accepting the holes. */
      const gaps=addressLocationGaps();
      if(gaps.length){
        closeAddressPicker();
        showActionToast('ตำแหน่งนี้ยังไม่มี'+gaps[0].label+' กรอกเพิ่มเพื่อไปต่อ','warning');
        openAddressFormForGaps(gaps);
        return;
      }
    }
    closeAddressPicker();
  }

  function placeFromOsm(result){
    const a=result.address || {};
    const displayHead=(result.display_name || '').split(',')[0].trim();
    const name=result.name || displayHead;
    const fallback=partsFromDisplayName(result.display_name);
    const road=a.road || a.pedestrian || a.neighbourhood || fallback.line || '';
    const houseNumber=a.house_number || '';
    const building=[name && name!==road ? name : '', houseNumber].filter(Boolean).join(' ');
    const place={
      title:name || road || 'ตำแหน่งที่เลือก',
      building:building || houseNumber || name || road,
      floor:'',
      line:road,
      subdistrict:a.suburb || a.quarter || a.village || a.town || fallback.subdistrict || '',
      districtName:a.city_district || a.district || a.county || a.state_district || fallback.districtName || '',
      province:a.province || a.state || a.city || fallback.province || '',
      postcode:a.postcode || fallback.postcode || '',
      lat:Number(result.lat), lon:Number(result.lon)
    };
    place.district=composeDistrict(place);
    place.detail=[road,place.district].filter(Boolean).join(' · ') || (result.display_name || '');
    return place;
  }

  async function osmFetch(path,params){
    const url=new URL(OSM_ENDPOINT+path);
    Object.entries({format:'jsonv2',addressdetails:'1','accept-language':'th',...params})
      .forEach(([key,value]) => url.searchParams.set(key,value));
    const response=await fetch(url,{headers:{Accept:'application/json'}});
    if(!response.ok) throw new Error('geocoder '+response.status);
    return response.json();
  }

  async function osmSearch(query){
    try{
      const results=await osmFetch('/search',{q:query,countrycodes:'th',limit:'6'});
      return (Array.isArray(results) ? results : []).map(placeFromOsm);
    }catch(err){ return null; }
  }

  async function osmReverse(lat,lon){
    try{
      const result=await osmFetch('/reverse',{lat:String(lat),lon:String(lon),zoom:'18'});
      return result && result.address ? placeFromOsm(result) : null;
    }catch(err){ return null; }
  }

  function renderOsmTiles(){
    const host=document.querySelector('[data-osm-map]');
    const plane=host?.querySelector('[data-osm-plane]');
    if(!host || !plane) return;
    const width=host.clientWidth || 360, height=host.clientHeight || 320;
    const z=osmView.zoom, scale=Math.pow(2,z);
    const originX=osmLonToX(osmView.lon,z)*OSM_TILE_SIZE - width/2;
    const originY=osmLatToY(osmView.lat,z)*OSM_TILE_SIZE - height/2;
    const firstX=Math.floor(originX/OSM_TILE_SIZE), lastX=Math.floor((originX+width)/OSM_TILE_SIZE);
    const firstY=Math.floor(originY/OSM_TILE_SIZE), lastY=Math.floor((originY+height)/OSM_TILE_SIZE);
    const tiles=[];
    for(let y=firstY;y<=lastY;y++){
      if(y<0 || y>=scale) continue;
      for(let x=firstX;x<=lastX;x++){
        const wrapped=((x%scale)+scale)%scale;
        tiles.push(`<img class="osm-map__tile" alt="" aria-hidden="true" loading="eager" src="${OSM_TILES}/${z}/${wrapped}/${y}.png"
          style="left:${Math.round(x*OSM_TILE_SIZE-originX)}px;top:${Math.round(y*OSM_TILE_SIZE-originY)}px">`);
      }
    }
    plane.style.transform='translate(0,0)';
    plane.innerHTML=tiles.join('');
    /* One broken tile means no tile server. Hand the screen back to the
       offline grid rather than showing a blank rectangle. */
    plane.querySelectorAll('img').forEach(img => {
      img.addEventListener('error',() => { osmDisable(); },{once:true});
    });
  }

  /* A still of the pinned spot for the address form. The picker owns panning
     and reverse geocoding; this only draws where the pin currently is, so it
     is plain <img> tiles with no state of its own. The CSS street grid sits
     behind them, so a blocked or slow tile server leaves something that still
     reads as a map rather than an empty rectangle. */



  function osmDisable(){
    if(osmView.failed) return;
    osmView.failed=true;
    const host=document.querySelector('[data-osm-map]');
    if(host) host.hidden=true;
    document.querySelectorAll('[data-sim-map]').forEach(map => { map.hidden=true; });
    if(addressPicker?.open)addressPickerStatus('โหลดแผนที่ไม่ได้ กลับไปกรอกที่อยู่เอง');
  }

  /* announce is for the deliberate acts — "use my current location" — where
     silence reads as a broken button. Panning and zooming stay quiet. */
  function scheduleOsmReverse(announce){
    window.clearTimeout(osmReverseTimer);
    const token=++osmReverseToken;
    if(!addressPicker?.open)return;
    addressPickerPlace=null;
    addressPickerStatus('กำลังค้นหารายละเอียดที่อยู่…');
    osmReverseTimer=window.setTimeout(async () => {
      const place=await osmReverse(osmView.lat,osmView.lon);
      if(token!==osmReverseToken || !addressPicker.open)return;
      addressPickerPlace=place;
      addressPickerStatus(place ? [place.building,place.detail].filter(Boolean).join(' · ') : 'ยังดึงรายละเอียดที่อยู่ไม่ได้ กลับไปกรอกที่อยู่เอง');
    },420);
  }

  function osmSetView(lat,lon,zoom,announce){
    addressPickerSession++;
    osmView.lat=lat; osmView.lon=lon;
    if(zoom) osmView.zoom=Math.min(19,Math.max(4,zoom));
    renderOsmTiles();
    scheduleOsmReverse(announce);
  }

  function osmBindPan(host){
    if(host.dataset.osmBound==='true') return;
    host.dataset.osmBound='true';
    let active=false, sx=0, sy=0, dx=0, dy=0;
    const plane=host.querySelector('[data-osm-plane]');
    host.addEventListener('keydown',event => {
      const delta={ArrowLeft:[-60,0],ArrowRight:[60,0],ArrowUp:[0,-60],ArrowDown:[0,60]}[event.key];
      if(!delta)return;
      event.preventDefault();
      const z=osmView.zoom;
      osmSetView(osmYToLat(osmLatToY(osmView.lat,z)+delta[1]/OSM_TILE_SIZE,z),osmXToLon(osmLonToX(osmView.lon,z)+delta[0]/OSM_TILE_SIZE,z));
    });
    host.addEventListener('pointerdown',event => {
      if(event.target.closest('[data-sim-zoom],[data-sim-locate]')) return;
      active=true; sx=event.clientX; sy=event.clientY; dx=0; dy=0;
      host.classList.add('is-panning');
      if(host.setPointerCapture) try{ host.setPointerCapture(event.pointerId) }catch(err){}
    });
    host.addEventListener('pointermove',event => {
      if(!active) return;
      dx=event.clientX-sx; dy=event.clientY-sy;
      plane.style.transform=`translate(${dx}px,${dy}px)`;
    });
    const end=() => {
      if(!active) return;
      active=false;
      host.classList.remove('is-panning');
      const z=osmView.zoom;
      const centreX=osmLonToX(osmView.lon,z)-dx/OSM_TILE_SIZE;
      const centreY=osmLatToY(osmView.lat,z)-dy/OSM_TILE_SIZE;
      osmSetView(osmYToLat(centreY,z),osmXToLon(centreX,z));
    };
    host.addEventListener('pointerup',end);
    host.addEventListener('pointercancel',end);
    host.addEventListener('pointerleave',end);
  }

  function setupAddressMap(){
    const host=document.querySelector('[data-osm-map]');
    if(!host) return;
    osmView.failed=false;
    host.hidden=false;
    document.querySelectorAll('[data-sim-map]').forEach(map => { map.hidden=true; });
    osmBindPan(host);
    renderOsmTiles();
    osmView.ready=true;
  }

  function osmZoomBy(step){
    if(osmView.failed) return false;
    osmView.zoom=Math.min(19,Math.max(4,osmView.zoom+step));
    renderOsmTiles();
    scheduleOsmReverse();
    return true;
  }


  /* Typing is the fast path to an address; the map is for when you cannot name
     the place. Suggestions come from Nominatim, falling back to the built-in
     Bangkok samples, so both routes fill the form from one shape of object. */
  function addressSuggestionsFor(query){
    const q=query.trim().toLowerCase();
    if(q.length<1) return [];
    return SIM_PLACES.filter(place =>
      [place.title,place.aliases,place.line,place.district].join(' ').toLowerCase().includes(q)
    ).slice(0,5);
  }

  /* The form and the map screen each carry one of these, so a plain
     document.querySelector would answer for whichever comes first in the
     markup rather than for the one the patient is typing into. */


  function renderAddressSuggestions(matches,{allowEmptyMessage=false}={}){
    const {input,list}=activeAddressSearch();
    if(!list) return;
    addressSuggestions=matches;
    /* A search that finds nothing says so. Silence reads as a broken field. */
    if(!matches.length && allowEmptyMessage){
      list.innerHTML='<li class="address-suggestions__empty" role="option" aria-selected="false" aria-disabled="true">ไม่พบที่อยู่นี้ ลองพิมพ์ชื่ออาคาร ถนน หรือย่าน</li>';
      list.hidden=false;
      if(input) input.setAttribute('aria-expanded','true');
      return;
    }
    list.innerHTML=matches.map((place,index) => `
      <li role="option" aria-selected="false">
        <button type="button" class="address-suggestion" data-address-suggestion="${index}">
          <span class="address-suggestion__icon" aria-hidden="true"><i data-lucide="map-pin" class="ui-icon ui-icon--sm"></i></span>
          <span class="address-suggestion__body"><strong>${place.title}</strong><span>${place.detail}</span></span>
        </button>
      </li>`).join('');
    list.dataset.matchCount=String(matches.length);
    list.hidden=!matches.length;
    if(input) input.setAttribute('aria-expanded',String(Boolean(matches.length)));
    if(window.krane_normalizeIcons) window.krane_normalizeIcons();
  }



  function scheduleAddressSearch(query){
    window.clearTimeout(addressSearchTimer);
    const text=query.trim();
    if(text.length<1){ closeAddressSuggestions(); return; }
    renderAddressSuggestions(addressSuggestionsFor(text));
    addressSearchTimer=window.setTimeout(async () => {
      const token=++addressSearchToken;
      const remote=await osmSearch(text);
      if(token!==addressSearchToken) return;
      const {input}=activeAddressSearch();
      if(!input || input.value.trim()!==text) return;
      renderAddressSuggestions(remote && remote.length ? remote : addressSuggestionsFor(text),{allowEmptyMessage:true});
    },180);
  }
