/* Shared review rhythm: same-person faces, staggered and motion-aware. */
(()=>{
 const data=window.KraneReviews||[],reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const attribution=item=>`${item.name} · ${item.age} ปี · ${item.occupation}`;
 document.querySelectorAll('.weight-story-gallery__video-copy,.review-video__copy').forEach(e=>e.remove());
 document.querySelectorAll('.weight-story-gallery__quote-slide[data-review-id]').forEach(slide=>{const item=data.find(i=>i.id===slide.dataset.reviewId);if(!item)return;const cite=slide.querySelector('cite');if(cite)cite.textContent=attribution(item)});
 document.querySelectorAll('.weight-story-gallery__photos figcaption,.review-video__photos figcaption,.review-video--comparison>.cd-fine').forEach(e=>e.remove());
 // Group each person's initial video, quotation and matching photos together.
 document.querySelectorAll('.review-marquee__set').forEach(set=>{
  [...set.children].forEach(card=>{const item=data.find(i=>i.id===card.dataset.reviewId);if(!item)return;card.dataset.startFace='video';let last=card;
   ['quote','comparison'].forEach(kind=>{if(kind==='quote'&&!item.quote||kind==='comparison'&&!(item.before&&item.after))return;const copy=card.cloneNode(true);copy.dataset.startFace=kind;last.after(copy);last=copy});
  });
 });
 // Existing programme galleries already rotate within their own frame.
 const cards=[...document.querySelectorAll('.review-video[data-review-id],.review-marquee__set figure[data-review-id]')];
 const tones={weight:'#be7d61','hair-loss':'#7ea99e','re-flow':'#1c3e56'};
 const states=[];
 cards.forEach((card,index)=>{
  const item=data.find(i=>i.id===card.dataset.reviewId),video=card.querySelector('video');if(!item||!video)return;
  video.controls=false;
  if(card.closest('.review-marquee')){
   card.tabIndex=card.closest('[aria-hidden=true]')?-1:0;
   const open=event=>{if(card.dataset.storyKind!=='video'||event.target.closest('.review-rhythm-selector'))return;event.preventDefault();event.stopImmediatePropagation();
    const modal=document.createElement('dialog');modal.className='review-rhythm-modal';modal.setAttribute('aria-label','วิดีโอรีวิวฉบับเต็ม');modal.innerHTML='<button aria-label="ปิดวิดีโอ">×</button><video controls playsinline></video>';document.body.append(modal);const full=modal.querySelector('video');full.src=item.src;modal.querySelector('button').onclick=()=>modal.close();modal.addEventListener('close',()=>{full.pause();modal.remove();card.focus({preventScroll:true})});modal.showModal();full.play().catch(()=>{});
   };card.addEventListener('click',open,true);card.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key))open(event)},true);
  }
  card.classList.add('review-rhythm-card');card.style.setProperty('--review-tone',tones[item.category]||'#395aa4');
  const faces=['video'];
  if(item.quote){const face=document.createElement('div');face.className='review-rhythm-face review-rhythm-quote';face.dataset.face='quote';face.innerHTML=`<blockquote><p>“${esc(item.quote).replace(/&lt;br&gt;/g,'<br>')}”</p><cite>${esc(item.name)}<span>${item.age} ปี · ${esc(item.occupation)}</span></cite></blockquote>`;card.append(face);faces.push('quote')}
  if(item.before&&item.after){const face=document.createElement('div');face.className='review-rhythm-face review-rhythm-photos';face.dataset.face='comparison';face.innerHTML=`<figure><img src="${esc(item.before)}" alt="ภาพก่อนของ ${esc(item.name)}" loading="lazy"></figure><figure><img src="${esc(item.after)}" alt="ภาพหลังของ ${esc(item.name)}" loading="lazy"></figure>`;card.append(face);faces.push('comparison')}
  // Prefer video / quotation / comparison across neighbouring people.
  const desired=card.dataset.startFace||['video','quote','comparison'][index%3];let active=faces.includes(desired)?faces.indexOf(desired):index%faces.length;
  let visible=false,elapsed=0;const interval=7000+(index%3)*1200;
  const show=()=>{const kind=faces[active];card.dataset.storyKind=kind;card.querySelectorAll('[data-face]').forEach(f=>f.hidden=f.dataset.face!==kind);video.style.visibility=kind==='video'?'visible':'hidden';if(kind!=='video'||!visible||document.hidden)video.pause();else if(!reduced.matches)video.play().catch(()=>{});if(card.classList.contains('review-video')){card.setAttribute('role',kind==='video'?'button':'group');card.setAttribute('aria-label',kind==='video'?'เปิดวิดีโอเต็ม: '+item.name:kind==='quote'?'คำพูดของ '+item.name:'ภาพก่อนและหลังของ '+item.name)}};
  // Keep hidden faces silent even when an existing visibility observer tries to play.
  video.addEventListener('play',()=>{if(card.dataset.storyKind!=='video')video.pause()});
  new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);show()},{threshold:.15}).observe(card);
  const dots=document.createElement('div');dots.className='review-rhythm-selector';dots.setAttribute('aria-label','เปลี่ยนด้านของรีวิว');
  if(faces.length>1){faces.forEach((kind,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',({video:'วิดีโอ',quote:'คำพูด',comparison:'ก่อนและหลัง'})[kind]+'ของ '+item.name);b.onclick=e=>{e.stopPropagation();active=i;elapsed=0;show()};b.onkeydown=e=>e.stopPropagation();dots.append(b)});card.append(dots)}
  const sync=()=>[...dots.children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===active)));
  new MutationObserver(sync).observe(card,{attributes:true,attributeFilter:['data-story-kind']});
  states.push({tick:dt=>{if(!visible||document.hidden||reduced.matches||card.matches(':hover,:focus-within')||document.querySelector('dialog[open]'))return;elapsed+=dt;if(elapsed>=interval){elapsed=0;active=(active+1)%faces.length;show()} }});show();sync();
 });
 let last=performance.now();setInterval(()=>{const now=performance.now(),dt=Math.min(now-last,500);last=now;states.forEach(s=>s.tick(dt))},250);
 // One quiet note per review section, rather than repeated copy over videos.
 document.querySelectorAll('.cd-reviews,#reviews.reviews,[data-interview-reviews]').forEach(section=>{if(section.querySelector('.review-rhythm-note'))return;const p=document.createElement('p');p.className='review-rhythm-note';p.textContent='ประสบการณ์เฉพาะบุคคล ผลลัพธ์อาจแตกต่างกัน · ชื่อ อายุ และอาชีพบางส่วนเป็นข้อมูลตัวอย่าง';section.append(p)});
})();
