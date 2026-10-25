/* Programme-specific safety summaries. Sources are rendered with each summary. */
(() => {
  const condition = new URLSearchParams(location.search).get('condition') || 'weight';
  const hair = ['hair-loss','hair','re-hair'].includes(condition);
  const flow = ['re-flow','ed','sexual-health'].includes(condition);
  const back = document.querySelector('.safety-hero__back');
  const route = hair ? 'hair-loss' : flow ? 're-flow' : 'weight';
  document.body.dataset.programme = route;
  if (back) { back.href = `condition-detail.html?condition=${route}`; back.lastChild.textContent = ' กลับหน้าโปรแกรม '+(hair?'re:hair':flow?'re:flow':'re:body'); }
  document.querySelectorAll('.safety-aside a').forEach(a => a.href = `krane-b2c.html?entry=direct#intake1?category=${hair?'hair-skin':flow?'sexual-health':'weight'}&entry=direct&fresh=1`);
  if (!hair && !flow) return;
  const programme = hair ? 're:hair' : 're:flow';
  document.title = `ข้อมูลความปลอดภัย ${programme} | Krane Clinic`;
  document.querySelector('#page-title').innerHTML = `ข้อมูลความปลอดภัย<br><span>โปรแกรม ${programme}</span>`;
  document.querySelector('.safety-hero__lead').textContent = hair ? 'ข้อควรรู้เกี่ยวกับ finasteride และ minoxidil ชนิดทา ก่อนเริ่มดูแลเส้นผมกับแพทย์' : 'ข้อควรรู้เกี่ยวกับ sildenafil และ tadalafil ก่อนเริ่มดูแลสุขภาพทางเพศกับแพทย์';
  const content = hair ? [
    ['overview','เริ่มจากประเมินสาเหตุผมร่วง','การเลือกยาและรูปแบบการใช้ขึ้นอยู่กับการประเมินของแพทย์ ข้อมูล minoxidil ในหน้านี้กล่าวถึงชนิดทา ไม่ใช่ชนิดรับประทาน'],
    ['avoid','ข้อจำกัดแตกต่างกันตามชนิดยา','แจ้งประวัติแพ้ยาและการตั้งครรภ์ก่อนเริ่มใช้ finasteride ไม่เหมาะสำหรับผู้ตั้งครรภ์ และไม่ควรสัมผัสยาเม็ดที่แตกหรือบด'],
    ['tell-doctor','บอกข้อมูลสุขภาพและยาที่ใช้อยู่','แจ้งโรคประจำตัว ยา อาหารเสริม ปัญหาหนังศีรษะ และประวัติอารมณ์ซึมเศร้า เพื่อให้แพทย์เลือกวิธีที่เหมาะสม'],
    ['side-effects','ติดตามการเปลี่ยนแปลงระหว่างใช้ยา','Finasteride อาจมีผลต่อความต้องการหรือการทำงานทางเพศ ส่วน minoxidil ชนิดทาอาจทำให้หนังศีรษะระคายเคือง หากรบกวนการใช้ชีวิตให้ติดต่อแพทย์'],
    ['urgent','อาการที่ต้องขอความช่วยเหลือ','หากใช้ finasteride เพื่อผมร่วงแล้วมีอารมณ์ซึมเศร้า ให้หยุดยาและติดต่อแพทย์ทันที หากมีความคิดทำร้ายตัวเองให้ขอความช่วยเหลือฉุกเฉิน หากใช้ minoxidil แล้วเจ็บหน้าอก ใจเต้นเร็ว หรือเวียนศีรษะ ให้หยุดใช้และพบแพทย์'],
    ['safe-use','ใช้ตามชนิดและวิธีที่ได้รับ','อย่าเพิ่มปริมาณหรือสลับชนิดทากับชนิดรับประทานเอง อ่านเอกสารของผลิตภัณฑ์ที่ได้รับ และติดตามผลตามนัด']
  ] : [
    ['overview','ให้แพทย์ประเมินก่อนเลือกยา','Sildenafil และ tadalafil เป็นคนละตัวยา วิธีใช้และระยะออกฤทธิ์ต่างกัน ใช้ตามใบสั่งและเอกสารกำกับยาที่ได้รับ'],
    ['avoid','ห้ามใช้ร่วมกับยาไนเตรต','ห้ามใช้ร่วมกับยาไนเตรตหรือสารกลุ่ม poppers แจ้งแพทย์หากมีโรคหัวใจ เพิ่งมีหัวใจขาดเลือดหรือโรคหลอดเลือดสมอง หรือมีความดันผิดปกติ'],
    ['tell-doctor','แจ้งยาและโรคประจำตัวทั้งหมด','รวมถึงยาหัวใจ ยาลดความดัน ยารักษาต่อมลูกหมาก และยาเสริมสมรรถภาพอื่น เพื่อประเมินการใช้ยาร่วมกัน'],
    ['side-effects','อาการที่อาจพบระหว่างใช้ยา','เช่น ปวดศีรษะ เวียนศีรษะ หรืออาการทางทางเดินอาหาร หากไม่ดีขึ้นหรือรบกวนการใช้ชีวิตให้ปรึกษาแพทย์หรือเภสัชกร'],
    ['urgent','อาการที่ควรรับการรักษาทันที','เจ็บหน้าอก แพ้รุนแรง การมองเห็นลดลงฉับพลัน หรือแข็งตัวต่อเนื่องเกิน 4 ชั่วโมง ให้รับการรักษาทันที หากเจ็บหน้าอกอย่าใช้ยาไนเตรตเอง และแจ้งทีมรักษาว่าใช้ยาใดไปเมื่อไร'],
    ['safe-use','อย่าเพิ่มยาหรือผสมยาเอง','ใช้ตามขนาดและเวลาที่แพทย์กำหนด ไม่ใช้ร่วมกับยาเสริมสมรรถภาพอื่นโดยไม่ปรึกษาแพทย์ และไม่รับยาจากแหล่งที่ตรวจสอบไม่ได้']
  ];
  const emergencyButton=document.querySelector('#urgent .emergency-button')?.cloneNode(true);
  content.forEach(([id,title,text],i)=>{
    const section=document.getElementById(id);
    section.innerHTML=`<p class="eyebrow">${['ภาพรวม','ใครไม่ควรใช้','แจ้งแพทย์ก่อนเริ่ม','ผลข้างเคียง','สัญญาณอันตราย','ใช้อย่างปลอดภัย'][i]}</p><h2 id="${id}-title">${title}</h2><p>${text}</p>`;
  });
  if(emergencyButton)document.getElementById('urgent').append(emergencyButton);
  const sources=hair ? [
    ['NHS: finasteride','https://www.nhs.uk/medicines/finasteride/'],
    ['NHS: ผลข้างเคียง finasteride','https://www.nhs.uk/medicines/finasteride/side-effects-of-finasteride/'],
    ['เอกสารกำกับยา minoxidil ชนิดทา','https://www.medicines.org.uk/emc/product/100306/pil']
  ] : [
    ['NHS: sildenafil','https://www.nhs.uk/medicines/sildenafil-viagra/'],
    ['เอกสารกำกับยา tadalafil','https://www.medicines.org.uk/emc/product/9729/pil']
  ];
  document.getElementById('sources').innerHTML='<p class="eyebrow">แหล่งข้อมูลทางการ</p><h2 id="sources-title">อ่านข้อมูลยาเพิ่มเติม</h2><p>สรุปข้อควรรู้ ไม่แทนเอกสารกำกับยาหรือคำแนะนำเฉพาะบุคคลจากแพทย์</p>'+sources.map(([name,url])=>`<a class="programme-source" href="${url}" target="_blank" rel="noopener">${name} ↗</a>`).join('');
})();
