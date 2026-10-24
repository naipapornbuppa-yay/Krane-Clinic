/* Illustrative care-planning periods, not promised treatment outcomes. */
(()=>{
 const key=new URLSearchParams(location.search).get('condition')||'weight';
 if(!['weight','hair-loss','re-flow','sexual-health'].includes(key))return;
 const panel=document.querySelector('#cd-panel-steps');if(!panel)return;
 let guide=panel.querySelector('.programme-start-guide');
 if(!guide){guide=document.createElement('details');guide.className='programme-start-guide';const summary=document.createElement('summary');summary.textContent='ดูรายละเอียดการเริ่มต้นและรับยา';guide.append(summary,...panel.childNodes)}
 const phases=key==='weight'?[
 ['เดือนที่ 1–2','เริ่มต้นอย่างมั่นใจ','ประเมินสุขภาพ ตั้งเป้าหมายกับคุณหมอ และเริ่มแผนการกิน การเคลื่อนไหว หรือยาหากเหมาะสม'],
 ['เดือนที่ 3–4','ปรับแผนให้เข้ากับคุณ','ทบทวนความคืบหน้าและอาการระหว่างดูแล ให้คุณหมอปรับแผนตามการตอบสนองของคุณ'],
 ['เดือนที่ 5 เป็นต้นไป','ดูแลระยะยาว','วางแผนดูแลน้ำหนักและพฤติกรรมที่ทำต่อได้ พร้อมติดตามความเหมาะสมของการรักษากับแพทย์']
 ]:key==='hair-loss'?[
 ['เดือนที่ 1–2','เข้าใจสาเหตุและเริ่มดูแล','ประเมินเส้นผมและหนังศีรษะ บันทึกภาพตั้งต้น แล้วเริ่มแนวทางดูแลที่แพทย์เลือกให้'],
 ['เดือนที่ 3–6','ติดตามอย่างต่อเนื่อง','ทบทวนการใช้ยาและการดูแล เปรียบเทียบภาพในมุมเดิม พร้อมปรึกษาแพทย์หากมีอาการผิดปกติ'],
 ['เดือนที่ 7 เป็นต้นไป','ทบทวนผลและวางแผนต่อ','ประเมินการเปลี่ยนแปลงร่วมกับคุณหมอ และวางแผนดูแลเส้นผมระยะยาวให้เหมาะกับคุณ']
 ]:[
 ['ก่อนเริ่มดูแล','คุยกับแพทย์','ประเมินสุขภาพและเลือกแผนที่เหมาะกับคุณ'],
 ['เริ่มตามแผน','รับคำแนะนำจากแพทย์','รับคำแนะนำและยา หากแพทย์เห็นว่าเหมาะสม'],
 ['ดูแลต่อเนื่อง','ติดตามและปรับแผน','ทบทวนผลและปรับแผนร่วมกับคุณหมอ']
 ];
 const timeline=document.createElement('div');timeline.className='programme-monthly';
 timeline.innerHTML='<h2>เส้นทางสู่เป้าหมายของคุณ</h2><p class="programme-monthly__note">ช่วงเวลาการดูแล แต่ละคนอาจใช้เวลาต่างกันตามการประเมินของแพทย์</p><ol>'+phases.map(([period,title,copy])=>`<li><p class="programme-monthly__period">${period}</p><h3>${title}</h3><p>${copy}</p></li>`).join('')+'</ol>';
 panel.replaceChildren(timeline,guide);
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const milestones=[...timeline.querySelectorAll('li')];let scheduled=false;
 const updateProgress=()=>{scheduled=false;const trigger=innerHeight*.72;
  milestones.forEach(step=>{const rect=step.getBoundingClientRect();const progress=reduced.matches?1:Math.max(0,Math.min(1,(trigger-rect.top)/Math.max(rect.height,1)));step.style.setProperty('--scroll-progress',progress);step.classList.toggle('is-entering',reduced.matches||rect.top<trigger);});
 };
 const schedule=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateProgress)}};
 timeline.classList.add('is-animated');
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});reduced.addEventListener('change',schedule);
 new ResizeObserver(schedule).observe(timeline);requestAnimationFrame(updateProgress);
 const price=document.getElementById('cd-panel-price');
 if(price && !panel.parentElement.classList.contains('programme-journey-columns')){
  const columns=document.createElement('div');columns.className='programme-journey-columns';
  panel.before(columns);columns.append(panel,price);
 }
 const fullGuide=document.createElement('section');fullGuide.className='programme-start-section';
 fullGuide.setAttribute('aria-labelledby','programme-start-title');
 const title=document.createElement('h2');title.id='programme-start-title';title.textContent='ขั้นตอนการเริ่มต้นและรับยา';
 fullGuide.append(title);guide.querySelector(':scope > summary')?.remove();fullGuide.append(...guide.childNodes);guide.remove();
 (panel.closest('.programme-journey-columns')||panel).after(fullGuide);
})();
