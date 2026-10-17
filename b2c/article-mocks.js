/* B2C renderer using the shared prototype editorial store. Replace transport with the agreed CMS API. */
(function () {
  'use strict';
  let articles = window.KraneArticleStore.published();
  let byId = Object.fromEntries(articles.map(article => [article.id,article]));
  const requested = new URLSearchParams(location.search).get('article');
  let selectedId = byId[requested] ? requested : articles[0].id;
  let filter = 'all';
  const el = (tag,className,text) => {
    const node=document.createElement(tag);
    if(className) node.className=className;
    if(text != null) node.textContent=text;
    return node;
  };
  function localized(article){if(document.documentElement.lang!=='en')return article;if(!article.en)return {...article,categoryLabel:({hair:'Hair loss',weight:'Weight',lifestyle:'Lifestyle','sexual-health':'Sexual health'})[article.category]||'Health'};return {...article,...article.en,categoryLabel:({hair:'Hair loss',weight:'Weight','sexual-health':'Sexual health'})[article.category]||article.categoryLabel,sections:[{heading:'Thai manuscript',copy:'The full manuscript supplied by Krane is in Thai. Use the language menu to switch to Thai and read it. An English clinical translation is not yet available.'}],tags:[({hair:'Hair loss',weight:'Weight','sexual-health':'Sexual health'})[article.category]],byline:'Krane Editorial'};}
  function articleAuthor(article){
    const row=el('span','article-author');
    const photo=el('img','article-author__photo');photo.src=article.author.photo||'../assets/brand-final/krane-logotype.svg';photo.alt='';photo.width=40;photo.height=40;
    const text=el('span','article-author__text');text.append(el('strong','',article.author.name),el('small','',article.contentStatus==='client-review'?(document.documentElement.lang==='en'?'Editorial review manuscript · Oct 2026':'ต้นฉบับสำหรับตรวจทาน · ต.ค. 2569'):'ผู้เขียนตัวอย่าง · อัปเดต ต.ค. 2569'));
    if(article.author.photo)row.append(photo);row.append(text);return row;
  }
  function articleCredits(article){
    const en=document.documentElement.lang==='en';
    const card=(role,name,photo,initials,note)=>{
      const item=el('div','article-credit'),avatar=photo?el('img','article-credit__avatar'):el('span','article-credit__avatar',initials);
      if(photo){avatar.src=photo;avatar.alt='';avatar.width=48;avatar.height=48;}
      const copy=el('span','article-credit__copy');copy.append(el('small','',role),el('strong','',name));if(note)copy.append(el('span','',note));item.append(avatar,copy);return item;
    };
    const writer=card(en?'Written by':'ผู้เขียน',article.contentStatus==='client-review'?(en?'Krane Editorial':'ทีมบรรณาธิการ Krane'):article.author.name,article.contentStatus==='client-review'?'':article.author.photo,'K',en?'Editorial team':'ทีมบรรณาธิการ');
    // Only use named reviewers present in the supplied manuscript headers.
    const hair=article.id.startsWith('library-hair-loss-'),weight=article.id.startsWith('library-obesity-');
    const reviewer=hair?card(en?'Medical reviewer':'ผู้ตรวจทานทางการแพทย์',en?'Dr. Kornphaka Kantikosum':'พญ. กรผกา ขันติโกสุม','assets/landing-573/doctors/client-doctor-ploy.png','',en?'Dermatology':'ตจวิทยา (ผิวหนัง)'):weight?card(en?'Medical reviewer':'ผู้ตรวจทานทางการแพทย์',en?'Dr. Phahol Sarojvisut':'อ.นพ. พหล สโรจวิสุทธิ์','','พส',en?'Internal medicine · Clinical nutrition':'อายุรศาสตร์ · โภชนศาสตร์คลินิก'):card(en?'Medical / pharmacy reviewer':'ผู้ตรวจทานทางการแพทย์หรือเภสัชกรรม',en?'Reviewer to be confirmed':'รอยืนยันชื่อผู้ตรวจทาน','','—',en?'Not specified in the manuscript':'ต้นฉบับยังไม่ได้ระบุชื่อ');
    return [writer,reviewer];
  }
  function articleReadAction(){
    const action=el('span','article-teaser__action','อ่านบทความ');
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('class','ui-icon ui-icon--sm');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M5 12h14M12 5l7 7-7 7');svg.append(path);action.append(svg);return action;
  }
  function renderFeed(){
    const feed=document.querySelector('[data-article-feed]');
    if(!feed) return;
    const query=(document.querySelector('[data-article-search]')?.value || '').trim().toLocaleLowerCase('th');
    const visible=articles.filter(article =>
      (filter==='all' || article.category===filter || (filter==='men' && article.category==='sexual-health')) &&
      (!query || [article.title,article.summary,article.categoryLabel,...article.tags].join(' ').toLocaleLowerCase('th').includes(query)));
    feed.replaceChildren(...visible.map((sourceArticle,index) => {
      const article=localized(sourceArticle);
      const button=el('button','article-teaser');
      button.type='button';button.dataset.go='article';button.dataset.articleId=article.id;
      const image=el('img','article-teaser__image');image.src=article.image;image.alt=article.imageAlt;image.loading='lazy';image.width=1280;image.height=800;
      const body=el('span','article-teaser__body');
      body.append(el('span','article-teaser__meta',document.documentElement.lang==='en'?article.categoryLabel+' · '+article.minutes+' min read':article.categoryLabel+' · อ่าน '+article.minutes+' นาที'),
        el('span','article-teaser__title',article.title),el('span','article-teaser__summary',article.summary));
      const footer=el('span','article-teaser__footer');footer.append(articleAuthor(article),articleReadAction());body.append(footer);button.append(image,body);return button;
    }));
    const empty=document.querySelector('[data-article-empty]');if(empty) empty.hidden=visible.length>0;
  }
  // Render the supplied Markdown as DOM nodes; raw HTML is deliberately text only.
  function inline(node,text){
    const pattern=/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
    let start=0,match;
    while((match=pattern.exec(text))){
      node.append(document.createTextNode(text.slice(start,match.index)));
      const child=el(match[1]?'a':match[3]?'strong':'em','',match[1]||match[3]||match[4]);
      if(match[1]){child.href=match[2];child.target='_blank';child.rel='noopener noreferrer';}
      node.append(child);start=pattern.lastIndex;
    }
    node.append(document.createTextNode(text.slice(start)));
  }
  function manuscriptNodes(markdown){
    const fragment=document.createDocumentFragment(),lines=markdown.split('\n');
    let section=fragment;
    const cells=line=>line.trim().replace(/^\||\|$/g,'').split('|').map(value=>value.trim());
    for(let i=0;i<lines.length;){
      let line=lines[i].trim();if(!line){i++;continue;}
      const heading=line.match(/^(#{2,6})\s+(.+)$/);
      if(heading){section=el('section','article-reading__section');fragment.append(section);const h=el(heading[1].length<=2?'h2':'h3');inline(h,heading[2]);section.append(h);i++;continue;}
      if(line.startsWith('|')&&/^\|?[\s:|\-]+$/.test((lines[i+1]||'').trim())){
        const wrap=el('div','article-reading__table-scroll');wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label','ตารางประกอบบทความ เลื่อนเพื่ออ่านทุกคอลัมน์');
        const table=el('table','article-reading__table'),head=el('thead'),header=el('tr'),body=el('tbody');
        cells(line).forEach(value=>{const th=el('th');th.scope='col';inline(th,value);header.append(th);});head.append(header);table.append(head,body);i+=2;
        while(i<lines.length&&lines[i].trim().startsWith('|')){const row=el('tr');cells(lines[i]).forEach(value=>{const td=el('td');inline(td,value);row.append(td);});body.append(row);i++;}
        wrap.append(table);section.append(wrap);continue;
      }
      const isList=value=>/^(?:>\s*)?(?:[-*]|\d+\.)\s+/.test(value);
      if(isList(line)){
        const quote=line.startsWith('>'),list=el(/^\d+\./.test(line)?'ol':'ul');
        while(i<lines.length&&isList(lines[i].trim())){const li=el('li');inline(li,lines[i].trim().replace(/^(?:>\s*)?(?:[-*]|\d+\.)\s+/,''));list.append(li);i++;}
        if(quote){const callout=el('blockquote','article-reading__key-points');callout.append(list);section.append(callout);}else section.append(list);continue;
      }
      const paragraph=el('p'),parts=[line.replace(/^>\s*/,'')];i++;
      while(i<lines.length&&lines[i].trim()&&!/^(#{2,6}\s|\||>)/.test(lines[i].trim())&&!isList(lines[i].trim()))parts.push(lines[i++].trim());
      inline(paragraph,parts.join(' '));section.append(paragraph);
    }
    return fragment;
  }
  function renderDetail(){
    const article=localized(byId[selectedId] || articles[0]);
    const screen=document.getElementById('article');if(!screen) return;
    screen.dataset.articleId=article.id;
    screen.querySelector('[data-article-hero]').src=article.image;
    screen.querySelector('[data-article-hero]').alt=article.imageAlt;
    screen.querySelector('[data-article-meta]').textContent=document.documentElement.lang==='en'?article.categoryLabel+' · '+article.minutes+' min read':article.categoryLabel+' · อ่าน '+article.minutes+' นาที';
    screen.querySelector('[data-article-title]').textContent=article.title;
    screen.querySelector('[data-article-byline]').replaceChildren(...articleCredits(article));
    screen.querySelector('[data-article-summary]').textContent=article.summary;
    const body=screen.querySelector('[data-article-body]');
    if(article.manuscriptMarkdown && document.documentElement.lang!=='en') body.replaceChildren(manuscriptNodes(article.manuscriptMarkdown));
    else body.replaceChildren(...article.sections.map(section => {
      const block=el('section','article-reading__section');
      block.append(el('h3','',section.heading));
      const paragraphs=section.copy.split(/\n\n+/);let table=null;
      paragraphs.forEach(copy=>{
        if(copy.startsWith('|')){
          if(/^\|[\s:|\-]+$/.test(copy))return;
          if(!table){table=el('table','article-reading__table');table.style.width='100%';table.style.tableLayout='fixed';block.append(table);}
          const row=el('tr');copy.split('|').slice(1,-1).forEach(value=>{const cell=el('td','',value.trim());cell.style.padding='10px';cell.style.borderBottom='1px solid var(--color-line)';cell.style.overflowWrap='anywhere';row.append(cell);});table.append(row);return;
        }
        table=null;const paragraph=el('p','',copy);paragraph.style.whiteSpace='pre-line';paragraph.style.overflowWrap='anywhere';paragraph.style.marginBottom='16px';block.append(paragraph);
      });return block;
    }));
    const source=el('a','article-reading__source',document.documentElement.lang==='en'?'Read the supporting source':'อ่านแหล่งข้อมูลประกอบ');
    source.href=article.source;source.target='_blank';source.rel='noopener noreferrer';
    const references=el('details','article-references'),summary=el('summary','',document.documentElement.lang==='en'?'References':'อ้างอิง'),referenceBody=el('div','article-references__body');
    body.querySelectorAll('.article-reading__section').forEach(section=>{
      const heading=section.querySelector('h2,h3');
      if(heading&&/^(อ้างอิง|เอกสารอ้างอิง|แหล่งอ้างอิง|references)/i.test(heading.textContent.trim())){heading.remove();referenceBody.append(...section.childNodes);section.remove();}
    });
    referenceBody.append(source);references.append(summary,referenceBody);body.append(references);
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
  window.addEventListener('krane-articles-changed',()=>{
    articles=window.KraneArticleStore.published();byId=Object.fromEntries(articles.map(a=>[a.id,a]));
    window.kraneArticleMock.articles=articles;renderFeed();renderDetail();
  });
  new MutationObserver(()=>{renderFeed();renderDetail();}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  renderFeed();
})();
