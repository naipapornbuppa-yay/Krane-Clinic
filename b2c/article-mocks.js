/* B2C editorial fixture. Replace this array with published records from the
   admin CMS later; the B2B field mapping and API contract are intentionally
   deferred. Stable id values are for routing and handoff, not CMS record IDs. */
(function () {
  'use strict';
  const articles = [
    {
      id:'finasteride', category:'hair', categoryLabel:'ผมร่วง', minutes:4,
      title:'ฟีนาสเตอไรด์ได้ผลจริงไหม',
      summary:'ทำความเข้าใจว่าการรักษาผมร่วงชนิดนี้ทำงานอย่างไร ต้องรอนานแค่ไหน และควรคุยอะไรกับแพทย์ก่อนเริ่ม',
      image:'assets/articles/editorial-v1/finasteride-evidence.jpg', imageAlt:'ภาพประกอบเรื่องการดูแลปัญหาผมร่วง',
      byline:'ทีมบรรณาธิการ Krane Clinic · อัปเดต ต.ค. 2569',
      sections:[
        {heading:'ยานี้ช่วยอย่างไร',copy:'ฟีนาสเตอไรด์ลดการเปลี่ยนฮอร์โมนเทสโทสเทอโรนเป็น DHT ซึ่งเกี่ยวข้องกับผมร่วงแบบพันธุกรรม การใช้ยาต้องอยู่ภายใต้การประเมินของแพทย์ เพราะสาเหตุผมร่วงของแต่ละคนไม่เหมือนกัน'},
        {heading:'ควรคาดหวังผลเมื่อไร',copy:'การเปลี่ยนแปลงของเส้นผมใช้เวลา โดยทั่วไปอาจเริ่มสังเกตผลหลังใช้ต่อเนื่องประมาณ 3–6 เดือน แพทย์จะช่วยประเมินผลและความเหมาะสมของการรักษาตามช่วงเวลา'},
        {heading:'ก่อนเริ่มใช้ ควรถามอะไร',copy:'บอกแพทย์เกี่ยวกับโรคประจำตัว ยาที่ใช้อยู่ และอาการที่กังวล รวมถึงถามเรื่องผลข้างเคียงและวิธีติดตามผล หากมีอาการผิดปกติระหว่างใช้ยา ให้ติดต่อแพทย์ผู้ดูแล'}
      ],
      tags:['ฟีนาสเตอไรด์','ผมร่วง'],
      source:'https://www.nhs.uk/medicines/finasteride/common-questions-about-finasteride/'
    },
    {
      id:'minoxidil', category:'hair', categoryLabel:'ผมร่วง', minutes:3,
      title:'ไมน็อกซิดิล ต้องคาดหวังอะไรบ้าง',
      summary:'การดูแลผมร่วงต้องอาศัยเวลาและความสม่ำเสมอ รู้จักสิ่งที่ควรติดตามก่อนตัดสินใจเริ่มการรักษา',
      image:'assets/articles/editorial-v1/minoxidil-expectations.jpg', imageAlt:'ภาพประกอบผลิตภัณฑ์ดูแลเส้นผม',
      byline:'ทีมบรรณาธิการ Krane Clinic · อัปเดต ต.ค. 2569',
      sections:[
        {heading:'เริ่มจากการหาสาเหตุ',copy:'ผมร่วงมีได้หลายรูปแบบ การทราบสาเหตุก่อนเลือกการรักษาช่วยให้ตั้งความคาดหวังได้ตรงขึ้น แพทย์อาจสอบถามระยะเวลาที่ผมร่วง ตำแหน่ง และสุขภาพโดยรวม'},
        {heading:'ติดตามผลอย่างไร',copy:'บันทึกภาพเส้นผมในแสงและมุมที่ใกล้เคียงกันตามช่วงเวลาที่แพทย์แนะนำ การเปรียบเทียบระยะสั้นวันต่อวันมักไม่ช่วยให้เห็นภาพการเปลี่ยนแปลง'},
        {heading:'เมื่อไรควรปรึกษาอีกครั้ง',copy:'หากมีอาการระคายเคืองหรือข้อกังวลเกี่ยวกับผลิตภัณฑ์ ควรแจ้งแพทย์หรือเภสัชกร ไม่ควรปรับวิธีใช้หรือเริ่มยาชนิดอื่นเอง'}
      ],
      tags:['ไมน็อกซิดิล','ผมร่วง'],
      source:'https://www.royalberkshire.nhs.uk/media/n3onzj1d/minoxidil-for-hair-loss_oct25.pdf'
    },
    {
      id:'safe-weight-loss', category:'weight', categoryLabel:'น้ำหนัก', minutes:6,
      title:'ลดน้ำหนักอย่างปลอดภัยใต้การดูแลแพทย์',
      summary:'เป้าหมายที่ทำได้จริง การติดตามสุขภาพ และแผนที่ปรับตามชีวิตประจำวันสำคัญกว่าการเร่งตัวเลขบนตาชั่ง',
      image:'assets/articles/editorial-v1/safe-weight-loss.jpg', imageAlt:'ภาพประกอบการจัดการน้ำหนักอย่างปลอดภัย',
      byline:'ทีมบรรณาธิการ Krane Clinic · อัปเดต ต.ค. 2569',
      sections:[
        {heading:'เริ่มด้วยเป้าหมายที่เหมาะกับตัวเอง',copy:'การจัดการน้ำหนักที่ยั่งยืนรวมเรื่องอาหาร การเคลื่อนไหว การนอน และการรับมือความเครียด แพทย์ช่วยพิจารณาสุขภาพเดิมและตั้งเป้าหมายที่เหมาะกับแต่ละคน'},
        {heading:'ติดตามมากกว่าน้ำหนัก',copy:'จดพฤติกรรมและสิ่งที่ทำได้จริงในแต่ละสัปดาห์ เช่น การกินและกิจกรรมที่สม่ำเสมอ นัดติดตามช่วยให้ปรับแผนเมื่อเจออุปสรรค'},
        {heading:'เมื่อไรควรขอคำแนะนำ',copy:'หากมีโรคประจำตัว ใช้ยาอยู่ หรือกังวลกับน้ำหนัก ควรปรึกษาผู้เชี่ยวชาญก่อนเริ่มแผนใหม่ เพื่อเลือกแนวทางที่เหมาะสมและปลอดภัย'}
      ],
      tags:['จัดการน้ำหนัก','สุขภาพ'],
      source:'https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html'
    },
    {
      id:'healthy-hair', category:'hair', categoryLabel:'เส้นผม', minutes:5,
      title:'ดูแลเส้นผมอย่างไรให้แผนการรักษาไปได้ไกลกว่าเดิม',
      summary:'วิธีดูแลเส้นผมและหนังศีรษะแบบอ่อนโยนในชีวิตประจำวัน เพื่อช่วยลดการดึงรั้งและการขาดของเส้นผม',
      image:'assets/articles/editorial-v1/healthy-hair-habits.jpg', imageAlt:'ภาพประกอบการดูแลเส้นผมในชีวิตประจำวัน',
      byline:'ทีมบรรณาธิการ Krane Clinic · อัปเดต ต.ค. 2569',
      sections:[
        {heading:'ดูแลอย่างอ่อนโยน',copy:'เวลาสระผมใช้ปลายนิ้วและหลีกเลี่ยงการขยี้แรง โดยเฉพาะเมื่อผมเปียกเพราะเส้นผมเปราะบางได้ง่าย'},
        {heading:'ลดแรงดึงรั้ง',copy:'ทรงผมที่ดึงแน่นซ้ำ ๆ อาจทำให้เส้นผมเสียหาย ลองเลือกทรงที่หลวมขึ้นและใช้หวีซี่ห่างเมื่อจำเป็น'},
        {heading:'แยกการดูแลออกจากการรักษา',copy:'พฤติกรรมดูแลผมช่วยลดการขาดของเส้นผม แต่ไม่แทนการวินิจฉัย หากผมร่วงเพิ่มขึ้นหรือหนังศีรษะมีอาการผิดปกติ ควรปรึกษาแพทย์'}
      ],
      tags:['เส้นผม','ดูแลตนเอง'],
      source:'https://www.gloshospitals.nhs.uk/your-visit/patient-information-leaflets/good-hair-care-advice/'
    }
  ];
  const byId = Object.fromEntries(articles.map(article => [article.id,article]));
  const requested = new URLSearchParams(location.search).get('article');
  let selectedId = byId[requested] ? requested : articles[0].id;
  let filter = 'all';
  const el = (tag,className,text) => {
    const node=document.createElement(tag);
    if(className) node.className=className;
    if(text != null) node.textContent=text;
    return node;
  };
  function renderFeed(){
    const feed=document.querySelector('[data-article-feed]');
    if(!feed) return;
    const query=(document.querySelector('[data-article-search]')?.value || '').trim().toLocaleLowerCase('th');
    const visible=articles.filter(article =>
      (filter==='all' || article.category===filter) &&
      (!query || [article.title,article.summary,article.categoryLabel,...article.tags].join(' ').toLocaleLowerCase('th').includes(query)));
    feed.replaceChildren(...visible.map((article,index) => {
      const button=el('button','article-teaser' + (index ? ' article-teaser--compact' : ''));
      button.type='button';button.dataset.go='article';button.dataset.articleId=article.id;
      const image=el('img','article-teaser__image');image.src=article.image;image.alt=article.imageAlt;image.loading='lazy';image.width=1280;image.height=800;
      const body=el('span','article-teaser__body');
      body.append(el('span','article-teaser__meta',article.categoryLabel+' · อ่าน '+article.minutes+' นาที'),
        el('span','article-teaser__title',article.title),el('span','article-teaser__summary',article.summary),
        el('span','article-teaser__action','อ่านบทความ →'));
      button.append(image,body);return button;
    }));
    const empty=document.querySelector('[data-article-empty]');if(empty) empty.hidden=visible.length>0;
  }
  function renderDetail(){
    const article=byId[selectedId] || articles[0];
    const screen=document.getElementById('article');if(!screen) return;
    screen.dataset.articleId=article.id;
    screen.querySelector('[data-article-hero]').src=article.image;
    screen.querySelector('[data-article-hero]').alt=article.imageAlt;
    screen.querySelector('[data-article-meta]').textContent=article.categoryLabel+' · อ่าน '+article.minutes+' นาที';
    screen.querySelector('[data-article-title]').textContent=article.title;
    screen.querySelector('[data-article-byline]').textContent=article.byline;
    screen.querySelector('[data-article-summary]').textContent=article.summary;
    const body=screen.querySelector('[data-article-body]');
    body.replaceChildren(...article.sections.map(section => {
      const block=el('section','article-reading__section');
      block.append(el('h3','',section.heading),el('p','',section.copy));return block;
    }));
    const source=el('a','article-reading__source','อ่านแหล่งข้อมูลประกอบ');
    source.href=article.source;source.target='_blank';source.rel='noopener noreferrer';body.append(source);
    const tags=screen.querySelector('[data-article-tags]');
    tags.replaceChildren(...article.tags.map(tag => el('span','article-tags__tag',tag)));
  }
  document.addEventListener('click',event => {
    const card=event.target.closest('[data-article-id][data-go="article"]');
    if(card && byId[card.dataset.articleId]) selectedId=card.dataset.articleId;
    const choice=event.target.closest('[data-article-filter]');
    if(choice){filter=choice.dataset.articleFilter;document.querySelectorAll('[data-article-filter]').forEach(button => button.setAttribute('aria-pressed',String(button===choice)));renderFeed();}
  },true);
  document.querySelector('[data-article-search]')?.addEventListener('input',renderFeed);
  window.kraneArticleMock={renderFeed,renderDetail,select(id){if(byId[id]) selectedId=id;},articles};
  renderFeed();
})();
