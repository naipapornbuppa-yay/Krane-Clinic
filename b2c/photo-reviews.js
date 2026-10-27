/* Supplied same-person before/after photographs, separate from video reviews. */
(()=>{
 const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const category=new URLSearchParams(location.search).get('condition')||'weight';
 const items=(window.KraneReviews||[]).filter(i=>i.category===category&&i.before&&i.after);
 const reviews=document.querySelector('.cd-reviews');if(!reviews||!items.length)return;
 const section=document.createElement('section');section.className='photo-reviews';section.setAttribute('aria-label','ภาพก่อนและหลังจากผู้ใช้บริการ');
 section.innerHTML='<div class="photo-reviews__heading"><h2>เรื่องราวก่อนและหลัง</h2></div><div class="photo-reviews__viewport" tabindex="0" aria-label="ภาพก่อนและหลัง เลื่อนแนวนอนเพื่อดูเพิ่มเติม"><div class="photo-reviews__track"><div class="photo-reviews__set"></div></div></div><p class="photo-reviews__note">ประสบการณ์เฉพาะบุคคล ผลลัพธ์อาจแตกต่างกัน</p>';
 const set=section.querySelector('.photo-reviews__set');
 set.innerHTML=items.map(i=>`<article class="photo-review" data-review-id="${esc(i.id)}"><div class="photo-review__pair"><figure><img src="${esc(i.before)}" alt="ภาพก่อนของ ${esc(i.name)}" loading="lazy"><figcaption>ก่อน</figcaption></figure><figure><img src="${esc(i.after)}" alt="ภาพหลังของ ${esc(i.name)}" loading="lazy"><figcaption>หลัง${Number.isFinite(i.verifiedMonths)&&i.verifiedMonths>0?` · ${esc(i.verifiedMonths)} เดือน`:Number.isFinite(i.exampleMonths)&&i.exampleMonths>0?` · ${esc(i.exampleMonths)} เดือน (ตัวอย่าง)`:" · ระยะเวลารอยืนยัน"}</figcaption></figure></div><div class="photo-review__copy">${i.quote?`<blockquote>“${esc(i.quote).replace(/&lt;br&gt;/g,' ')}”</blockquote>`:`<p>${esc(i.caption)}</p>`}<p class="photo-review__name">${esc(i.name)} · ${esc(i.age)} ปี · ${esc(i.occupation)}</p></div></article>`).join('');
 const duplicate=set.cloneNode(true);duplicate.setAttribute('aria-hidden','true');duplicate.inert=true;section.querySelector('.photo-reviews__track').append(duplicate);
 const viewport=section.querySelector('.photo-reviews__viewport');let paused=false,visible=false,hover=false,last=0,position=0,loopWidth=0;const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 viewport.addEventListener('pointerenter',()=>hover=true);viewport.addEventListener('pointerleave',()=>hover=false);viewport.addEventListener('scroll',()=>{if(Math.abs(position-viewport.scrollLeft)>2)position=viewport.scrollLeft},{passive:true});
 viewport.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();viewport.scrollBy({left:e.key==='ArrowRight'?320:-320,behavior:'smooth'})}});
 new IntersectionObserver(entries=>visible=entries.some(e=>e.isIntersecting)).observe(section);
 function tick(time){const dt=Math.min(time-last,50);last=time;if(visible&&!paused&&!hover&&!document.hidden&&!reduced.matches&&!section.contains(document.activeElement)){position+=dt*.022;if(loopWidth>0)position%=loopWidth;viewport.scrollLeft=position}requestAnimationFrame(tick)}
 reviews.after(section);
 const measure=()=>{
  // Reduced-motion copies are display:none. Their offset is not a loop width,
  // and appending more hidden copies cannot fill the viewport.
  if(reduced.matches){loopWidth=0;viewport.dataset.loopWidth='0';return;}
  loopWidth=duplicate.offsetLeft-set.offsetLeft;if(loopWidth<=0)return;
  const track=set.parentElement;let copiesNeeded=Math.ceil(viewport.clientWidth/loopWidth)+1;
  while(track.scrollWidth<loopWidth+viewport.clientWidth+24&&copiesNeeded-- > 0){const extra=duplicate.cloneNode(true);track.append(extra)}
  position%=loopWidth;viewport.scrollLeft=position;viewport.dataset.loopWidth=String(loopWidth);
 };
 new ResizeObserver(measure).observe(viewport);reduced.addEventListener('change',measure);measure();requestAnimationFrame(tick);
})();
