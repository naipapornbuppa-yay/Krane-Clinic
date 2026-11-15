(() => {
  const root = document.querySelector('[data-programme]');
  const themes = {
    rehair: { brand:'re:hair', category:'hair-skin', key:'hair', name:'เส้นผม', timeline:['เริ่มต้น','เริ่มเห็นผล','ดูแลต่อเนื่อง'] },
    rebody: { brand:'re:body', category:'weight', key:'body', name:'น้ำหนัก', timeline:['เริ่มต้น','เริ่มเห็นผล','ดูแลต่อเนื่อง'] },
    reflow: { brand:'re:flow', category:'sexual-health', key:'flow', name:'สุขภาพเพศชาย', timeline:['เริ่มต้น','หาแผนที่ใช่','ดูแลต่อเนื่อง'] },
  };
  const id = root.dataset.programme;
  const data = themes[id];
  const asset = name => 'assets/programme-opt1/' + name + '.webp' + (name.includes('-timeline-') ? '?v=20261115-final-photo' : '');
  const intake = 'krane-b2c.html?entry=direct&fresh=1&category=' + data.category + '#intake1';
  const cta = (label='เริ่มปรึกษาแพทย์') => '<a class="opt-cta" href="'+intake+'">'+label+' <span aria-hidden="true">→</span></a>';
  const pic = (name,alt='', eager=false) => '<img src="'+asset(name)+'" alt="'+alt+'" '+(eager?'fetchpriority="high"':'loading="lazy"')+' decoding="async">';
  const section = (klass,markup,anchor='') => '<section class="'+klass+'"'+(anchor?' id="'+anchor+'"':'')+'>'+markup+'</section>';
  const stepsCopy = ['เริ่มจากปรึกษาแพทย์เพื่อประเมินสุขภาพและออกแบบแผนที่เหมาะกับคุณ รับคำแนะนำสำหรับการเริ่มดูแลและติดตามอาการ','ติดตามผลและทบทวนการตอบสนองกับแพทย์ เพื่อปรับแผนตามความเหมาะสม','ดูแลอย่างต่อเนื่องกับแพทย์ และทบทวนผลเมื่อถึงเวลานัด'];
  const periods = id==='reflow' ? ['ปรึกษาครั้งแรก','สัปดาห์ที่ 2–4','ระยะยาว'] : id==='rebody' ? ['เดือนที่ 1','เดือนที่ 2–3','4 เดือนขึ้นไป'] : ['เดือนที่ 1–2','เดือนที่ 3–6','6 เดือนขึ้นไป'];
  const firstStep = {
    rehair:'ช่วงแรกอาจยังไม่เห็นความเปลี่ยนแปลงชัดเจน และบางคนอาจมีผมเส้นเล็กที่ร่วงมากกว่าปกติเล็กน้อย ซึ่งเป็นเรื่องที่พบได้และมักเกิดขึ้นชั่วคราว หากกังวล นัดปรึกษาแพทย์ประจำตัวของคุณได้เสมอ',
    reflow:'แพทย์ประจำตัวจะประเมินสุขภาพ ประวัติการใช้ยา และปัจจัยที่อาจเกี่ยวข้อง เช่น ความดันหรือน้ำตาลในเลือด ก่อนออกแบบแผนดูแลเฉพาะบุคคล ยาจัดส่งถึงบ้านในบรรจุภัณฑ์ที่เป็นส่วนตัว'
  };
  if (firstStep[id]) stepsCopy[0] = firstStep[id];
  const timeline = section('opt-stage','<div class="opt-hero"><h1 class="visually-hidden">'+data.brand+' · '+data.name+'</h1><ul class="opt-hero-badges"><li>แพทย์ดูแลเป็นรายบุคคล</li><li>เริ่มต้นปรึกษาออนไลน์</li><li>ติดตามและปรับแผนได้</li></ul></div><div class="opt-wrap opt-timeline"><header><h2>'+data.brand+'<br>ไทม์ไลน์การดูแล</h2><p>ช่วงเวลาการดูแล<br>ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล</p></header><div class="opt-timeline-list" data-single>'+data.timeline.map((label,i)=>'<details '+(!i?'open':'')+'><summary><span class="opt-eyebrow">'+periods[i]+'</span><strong>'+label+'</strong></summary><div class="opt-step-copy"><p>'+stepsCopy[i]+'</p>'+pic(data.key+'-timeline-'+(i+1),data.brand+' · '+label)+'</div></details>').join('')+'</div></div>','steps');
  const reviewData = window.KraneReviews || [];
  const storyIds = ['weight-02','weight-04','weight-05','hair-pha','hair-03','confidence-real-med'];
  const storyMarkup = storyIds.map(reviewId => {
    const story = reviewData.find(item => item.id === reviewId);
    if (!story) return '';
    return '<button class="opt-story" type="button" data-story="'+reviewId+'">'+
      '<img src="'+story.poster+'" alt="" loading="lazy" decoding="async">'+
      '<span class="opt-story-name">'+story.name+'</span><span class="opt-story-play" aria-hidden="true">▶</span>'+
      '<span class="opt-story-caption">'+story.caption+'</span></button>';
  }).join('');
  const stories = section('opt-stories opt-wrap',
    '<div class="opt-section-head"><h2>ประสบการณ์จากผู้ใช้บริการ Krane</h2></div>'+
    '<div class="opt-rail opt-story-rail" data-rail>'+storyMarkup+'</div>'+
    '<div class="opt-rail-controls"><button type="button" data-scroll="-1" aria-label="วิดีโอก่อนหน้า">‹</button>'+
    '<button type="button" data-scroll="1" aria-label="วิดีโอถัดไป">›</button></div>');
  const pairItems = ['hair-pha','hair-03'].map(key=>reviewData.find(r=>r.id===key)).filter(r=>r?.before&&r?.after);
  const pairs = pairItems.length ? pairItems.map(r=>'<article class="opt-pair"><div><img src="'+r.before+'" alt="ก่อน"><img src="'+r.after+'" alt="หลัง"></div><p>'+r.name+' · ผลลัพธ์แตกต่างกันในแต่ละบุคคล</p></article>').join('') : '<article class="opt-pair"><div>'+pic('before','ก่อน')+pic('after','หลัง')+'</div><p>ผลลัพธ์แตกต่างกันในแต่ละบุคคล</p></article>';
  const comparison = section('opt-comparison','<div class="opt-wrap"><h2>เรื่องราวก่อนและหลัง</h2><div class="opt-rail" data-rail>'+pairs+'</div></div>');
  const benefits = document.querySelector('#programme-care-benefits');
  const captions = {
    rebody: ['re:flow', '<strong>แข็ง</strong>แรงอย่างมั่นใจ'],
    rehair: ['re:hair', '<strong>ผมหนา</strong>ขึ้นด้วยวิธีที่มีงานวิจัยรองรับ'],
    reflow: ['re:body', '<strong>มิติใหม่</strong> ในการลดน้ำหนักออนไลน์']
  };
  const [interviewBrand, interviewTitle] = captions[id];
  const interview = section('opt-interview',
    '<div class="opt-interview-media" data-editorial="'+data.key+'">'+pic(data.key+'-doctor')+
    '<div class="opt-wrap"><div><p class="opt-editorial-brand">'+interviewBrand+'</p><h2>'+interviewTitle+
    '</h2></div><div class="opt-editorial-actions">'+cta('เริ่มปรึกษา')+'</div></div></div>');
  const feedback = section('opt-feedback opt-wrap','<div class="opt-feedback-inner"><header><div><h2>ประสบการณ์เล็ก ๆ<br>ที่ช่วยให้ตัดสินใจง่ายขึ้น</h2><p>ตัวอย่างรีวิวและคะแนนเพื่อแสดงรูปแบบ · ผลลัพธ์แตกต่างกันในแต่ละบุคคล</p></div><div class="opt-rating">4.8<small> / 5</small> <span>★★★★★</span></div></header><div class="opt-filter-heading"><h3>ความคิดเห็น</h3><label><span class="visually-hidden">เรียงรีวิว</span><select data-sort><option value="latest">ล่าสุด</option><option value="top">คะแนนสูงสุด</option></select></label></div><div class="opt-filters" aria-label="กรองตามคะแนน">'+['ทั้งหมด',5,4,3,2,1].map((n,i)=>'<button type="button" data-score="'+(i?n:0)+'" aria-pressed="'+!i+'">'+n+(i?' ★':'')+'</button>').join('')+'</div><div class="opt-rail opt-feedback-rail" data-rail aria-live="polite"></div><div class="opt-rail-controls"><button data-scroll="-1" aria-label="ก่อนหน้า">‹</button><button data-scroll="1" aria-label="ถัดไป">›</button></div></div>','reviews');
  const price = section('opt-price','', 'program-pricing');
  const articleData = [
    ['ผมร่วงแบบไหนควรพบแพทย์?', 'library-hair-loss-03'],
    ['เข้าใจการดูแลผมบาง', 'library-hair-loss-01'],
    ['วิธีดูแลเส้นผมในชีวิตประจำวัน', 'library-hair-loss-02'],
    ['เตรียมตัวก่อนปรึกษาแพทย์', ''],
    ['อ่านเรื่องสุขภาพเพิ่มเติม', '']
  ];
  const articles = section('opt-articles','<div class="opt-wrap"><h2>บทความสุขภาพ</h2><a href="articles.html">อ่านเพิ่มเติม →</a><div class="opt-rail opt-article-rail" data-rail>'+articleData.map(([title,slug])=>'<a href="articles.html'+(slug?'?article='+slug:'')+'">'+pic('article')+'<div><small>บทความสุขภาพ</small><h3>'+title+'</h3><span>อ่านบทความ <b>→</b></span></div></a>').join('')+'</div></div>');
  const faqData = [
    ['Krane Clinic คืออะไร?','บริการปรึกษาแพทย์ทางไกล แพทย์ประเมินและให้คำแนะนำตามข้อมูลสุขภาพของแต่ละคน'],
    ['ทำแบบประเมินแล้วจะได้รับยาทุกคนไหม?','แพทย์จะพิจารณาจากข้อมูลสุขภาพและความเหมาะสมก่อนสั่งยา'],
    ['รับยาจากที่ไหน?','หลังแพทย์ออกใบสั่งยา คุณสามารถตรวจสอบรายการยาและรายละเอียดการจัดส่งได้ในบัญชี'],
    ['จัดส่งราคาเท่าไหร่และใช้เวลานานไหม?','ค่าจัดส่งและระยะเวลาขึ้นอยู่กับพื้นที่และวิธีส่ง ระบบจะแสดงข้อมูลก่อนยืนยันคำสั่งซื้อ'],
    ['ใครเข้าถึงข้อมูลสุขภาพของฉันได้บ้าง?','ทีมที่เกี่ยวข้องใช้ข้อมูลตามความจำเป็นในการดูแล อ่านรายละเอียดในนโยบายความเป็นส่วนตัว']
  ];
  const faq = section('opt-faq','<div class="opt-wrap"><h2>คำถามที่พบบ่อย</h2><a href="faq.html">อ่านเพิ่มเติม →</a><div class="opt-faq-glass" data-single>'+faqData.map(([q,a])=>'<details><summary>'+q+'</summary><p>'+a+'</p></details>').join('')+'</div></div>','faq');
  root.innerHTML = timeline+(id==='reflow'?'':comparison)+stories+interview+feedback+price+articles+faq;
  if (benefits) root.querySelector('.opt-interview').before(benefits.content.cloneNode(true));
  root.querySelectorAll('a[href^="#"]').forEach(a => { a.href=location.pathname+location.search+a.getAttribute('href'); });

  const reviewCards = [
    { score:5, name:'ผู้ใช้บริการ Krane', date:'22 ต.ค. 2569', text:'คุณหมออธิบายให้เข้าใจและช่วยวางแผนที่ทำต่อได้' },
    { score:5, name:'ผู้ใช้บริการ Krane', date:'21 ต.ค. 2569', text:'ปรึกษากับคุณหมอออนไลน์ได้จากที่บ้าน' },
    { score:4, name:'ผู้ใช้บริการ Krane', date:'20 ต.ค. 2569', text:'สอบถามรายละเอียดและติดตามการดูแลได้สะดวก' },
    { score:4, name:'ผู้ใช้บริการ Krane', date:'19 ต.ค. 2569', text:'เลือกเวลาปรึกษาที่สะดวกได้' },
  ];
  let score = 0;
  const reviewRail=root.querySelector('.opt-feedback-rail');
  const renderReview=()=>{
    const list=reviewCards.filter(r=>!score||r.score===score);
    if(root.querySelector('[data-sort]').value==='top')list.sort((a,b)=>b.score-a.score);
    reviewRail.innerHTML=list.length?list.map(r=>'<article><span class="opt-stars">'+ '★'.repeat(r.score) +'☆'.repeat(5-r.score)+'</span><p>“'+r.text+'”</p><small>'+r.name+' · '+r.date+'</small></article>').join(''):'<p class="opt-empty">ไม่มีรีวิวในคะแนนนี้</p>';
  };
  renderReview();
  root.querySelector('[data-sort]').addEventListener('change',renderReview);
  root.addEventListener('click',e=>{
    const filter=e.target.closest('[data-score]');
    if(filter){
      score=Number(filter.dataset.score);
      root.querySelectorAll('[data-score]').forEach(b=>b.setAttribute('aria-pressed',String(b===filter)));
      renderReview();
    }
    const arrow=e.target.closest('[data-scroll]');
    if(arrow){
      const rail=arrow.closest('section').querySelector('[data-rail]');
      rail.scrollBy({left:rail.clientWidth*.65*Number(arrow.dataset.scroll),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    }
    const story=e.target.closest('[data-story]');
    if(story){
      const dialog=document.querySelector('#opt-story-dialog');
      const id=story.dataset.story;
      dialog.querySelector('video').src=reviewData.find(r=>r.id===id)?.src || 'assets/reviews/'+id+'.mp4';
      dialog.showModal();
    }
  });
  root.querySelectorAll('[data-single] details').forEach(item=>item.addEventListener('toggle',()=>{
    if(item.open) item.parentElement.querySelectorAll('details[open]').forEach(other=>{if(other!==item)other.open=false;});
  }));
  const dialog=document.querySelector('#opt-story-dialog');
  dialog.addEventListener('close',()=>{const video=dialog.querySelector('video');video.pause();video.removeAttribute('src');video.load();});
})();
