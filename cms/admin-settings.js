/* Admin prototype persistence only. Does not publish pricing, coupons or clinical policy to B2C.
   Replace local storage with authorized, versioned configuration APIs during integration. */
(function(){
 'use strict';
 const key='krane-admin-settings-demo-v1';
 const T=(en,th)=>document.documentElement.lang==='th'?th:en;
 const pricing=document.getElementById('pricing'),config=document.getElementById('config'),coupons=document.getElementById('coupons');
 if(!pricing||!config||!coupons)return;
 const priceInputs=[...pricing.querySelectorAll('tbody input')],configInputs=[...config.querySelectorAll('input,select')];
 const form=coupons.querySelector('[data-coupon-form]'),field=name=>form.querySelector(`[name="${name}"]`);
 function feedback(section,text,error=false){const el=section.querySelector('[data-admin-feedback]');el.textContent=text;el.setAttribute('role',error?'alert':'status');}
 for(const section of [pricing,config,coupons]){
  const note=document.createElement('p');note.className='hint';note.textContent=T('Prototype: changes are saved in this browser only and do not change patient checkout or clinical rules.','ข้อมูลต้นแบบ: บันทึกเฉพาะเบราว์เซอร์นี้ ไม่เปลี่ยนยอดชำระหรือกฎการรักษาของผู้รับบริการ');
  const status=document.createElement('p');status.className='hint';status.dataset.adminFeedback='';status.setAttribute('role','status');
  section.querySelector('.page-head').after(note,status);
 }
 let state={prices:null,config:null,coupons:[]};
 try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved&&typeof saved==='object')state={prices:saved.prices,config:saved.config,coupons:Array.isArray(saved.coupons)?saved.coupons.filter(validCoupon):[]};}catch{}
 function persist(next,section){try{localStorage.setItem(key,JSON.stringify(next));state=next;return true;}catch{feedback(section,T('Could not save. Browser storage is unavailable; your changes remain in the form.','บันทึกไม่ได้ เบราว์เซอร์ไม่อนุญาตให้จัดเก็บข้อมูล กรุณาลองใหม่'),true);return false;}}
 priceInputs.forEach((input,i)=>{input.type='number';input.min='0';input.step='0.01';input.setAttribute('aria-label',`${input.closest('tr').cells[0].textContent.trim()} price`);if(Array.isArray(state.prices)&&Number.isFinite(state.prices[i])&&state.prices[i]>=0)input.value=state.prices[i];});
 configInputs.forEach((input,i)=>{input.dataset.configField=String(i);if(!input.getAttribute('aria-label'))input.setAttribute('aria-label',`Configuration ${i+1}`);const value=state.config?.[i];if(input.type==='checkbox'&&typeof value==='boolean')input.checked=value;else if(input.tagName==='SELECT'&&Number.isInteger(value)&&value>=0&&value<input.options.length){input.selectedIndex=value;input.dispatchEvent(new Event('change',{bubbles:true}));}});
 function margins(){priceInputs.forEach(input=>{const row=input.closest('tr'),base=Number(row.cells[1].textContent.replace(/[^\d.]/g,'')),difference=Number(input.value)-base;row.cells[3].textContent=`${difference>=0?'+':'−'}฿ ${Math.abs(difference).toLocaleString('en-US')}`;row.cells[3].style.color=difference>=0?'var(--color-success)':'var(--color-text)';});}
 margins();
 const seedCodes=new Set([...coupons.querySelectorAll('tbody tr')].map(r=>r.cells[0].textContent.trim().toUpperCase()));
 function validDate(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;}
 function validCoupon(c){return c&&typeof c.code==='string'&&/^[A-Z0-9_-]{2,40}$/.test(c.code)&&['fixed','percent'].includes(c.type)&&Number.isFinite(c.value)&&c.value>=0&&(c.type!=='percent'||c.value<=100)&&Number.isSafeInteger(c.maxUses)&&c.maxUses>0&&validDate(c.start)&&validDate(c.end)&&c.start<=c.end&&['both','consultation','medication'].includes(c.scope)&&['all','hair','skin','sleep'].includes(c.vertical);}
 function renderCoupons(){
  coupons.querySelectorAll('[data-saved-coupon]').forEach(e=>e.remove());
  const today=new Date(),day=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  for(const record of state.coupons){
   const tr=document.createElement('tr');tr.dataset.savedCoupon=record.code;
   const labels={both:T('Both checkouts','ทั้งสองยอดชำระ'),consultation:T('Consultation fee','ค่าปรึกษา'),medication:T('Medication','ค่ายา'),all:T('All','ทั้งหมด'),hair:T('Hair loss','ผมร่วง'),skin:T('Skin care','ผิวหนัง'),sleep:T('Sleep & stress','การนอนและความเครียด')};
   const status=day<record.start?T('Scheduled','ยังไม่เริ่ม'):day>record.end?T('Expired','หมดอายุ'):T('Active','ใช้งานได้');
   for(const value of [record.code,record.type==='percent'?`${record.value}%`:`฿ ${record.value}`,labels[record.scope],labels[record.vertical],`${record.start} – ${record.end}`,`0 / ${record.maxUses}`,status]){const td=document.createElement('td');td.textContent=value;tr.append(td);}
   coupons.querySelector('tbody').append(tr);
  }
 }
 function resetCoupon(){form.querySelectorAll('input').forEach(i=>i.value='');form.querySelectorAll('select').forEach(i=>{i.selectedIndex=0;i.dispatchEvent(new Event('change',{bubbles:true}));});feedback(coupons,'');}
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-admin-save],[data-coupon-save],[data-coupon-cancel]');if(!button)return;
  event.preventDefault();event.stopImmediatePropagation(); // Avoid the legacy generic success-toast fallback.
  if(button.hasAttribute('data-coupon-cancel')){resetCoupon();return;}
  if(button.dataset.adminSave==='pricing'){
   const values=priceInputs.map(i=>i.value.trim()===''?NaN:Number(i.value));
   if(values.some(v=>!Number.isFinite(v)||v<0)){feedback(pricing,T('Enter a valid non-negative price for every item.','กรอกราคาทุกรายการเป็นตัวเลขตั้งแต่ศูนย์ขึ้นไป'),true);return;}
   if(persist({...state,prices:values},pricing)){margins();feedback(pricing,T('Prices saved in this browser.','บันทึกราคาในเบราว์เซอร์แล้ว'));}return;
  }
  if(button.dataset.adminSave==='config'){
   const values=configInputs.map(i=>i.type==='checkbox'?i.checked:i.selectedIndex);
   if(persist({...state,config:values},config))feedback(config,T('Configuration saved in this browser.','บันทึกการตั้งค่าในเบราว์เซอร์แล้ว'));return;
  }
  const record={code:field('couponCode').value.trim().toUpperCase(),type:field('couponType').value,value:field('couponValue').value.trim()===''?NaN:Number(field('couponValue').value),scope:field('couponScope').value,vertical:field('couponVertical').value,start:field('couponStart').value,end:field('couponEnd').value,maxUses:Number(field('couponMaxUses').value)};
  if(!validCoupon(record)){feedback(coupons,T('Check code (2–40 letters/numbers), value (0–100 for percent), start/end dates and a positive whole-number usage limit.','ตรวจรหัส 2–40 ตัวอักษรภาษาอังกฤษหรือตัวเลข มูลค่าส่วนลด (เปอร์เซ็นต์ไม่เกิน 100) วันเริ่ม–สิ้นสุด และจำนวนสิทธิ์เต็มจำนวนมากกว่าศูนย์'),true);return;}
  if(seedCodes.has(record.code)||state.coupons.some(c=>c.code===record.code)){feedback(coupons,T('This coupon code already exists.','รหัสคูปองนี้มีอยู่แล้ว'),true);return;}
  if(persist({...state,coupons:[...state.coupons,record]},coupons)){renderCoupons();resetCoupon();feedback(coupons,T('Coupon saved in this browser.','บันทึกคูปองในเบราว์เซอร์แล้ว'));}
 },true);
 renderCoupons();
 document.addEventListener('click',e=>{if(e.target.closest('.lang__opt'))setTimeout(renderCoupons,0);});
})();
