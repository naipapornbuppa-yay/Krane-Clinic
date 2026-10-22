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
      const copy=el('span','article-credit__copy');copy.append(el('small','',role),el('strong','',name));item.append(avatar,copy);return item;
    };
    const writer=card(en?'Written by':'ผู้เขียน',article.contentStatus==='client-review'?(en?'Krane Editorial':'ทีมบรรณาธิการ Krane'):article.author.name,article.contentStatus==='client-review'?'../assets/brand-final/krane-logomark.svg':article.author.photo,'K',en?'Editorial team':'ทีมบรรณาธิการ');
    if(article.contentStatus==='client-review')writer.querySelector('img')?.classList.add('article-credit__avatar--brand');
    // Only use named reviewers present in the supplied manuscript headers.
    const hair=article.id.startsWith('library-hair-loss-'),weight=article.id.startsWith('library-obesity-');
    const reviewer=hair?card(en?'Medical reviewer':'ผู้ตรวจทานทางการแพทย์',en?'Dr. Kornphaka Kantikosum':'พญ. กรผกา ขันติโกสุม','assets/landing-573/doctors/client-doctor-ploy.png','',en?'Dermatology':'ตจวิทยา (ผิวหนัง)'):weight?card(en?'Medical reviewer':'ผู้ตรวจทานทางการแพทย์',en?'Dr. Phahol Sarojvisut':'อ.นพ. พหล สโรจวิสุทธิ์','','พส',en?'Internal medicine · Clinical nutrition':'อายุรศาสตร์ · โภชนศาสตร์คลินิก'):card(en?'Medical / pharmacy reviewer':'ผู้ตรวจทานทางการแพทย์หรือเภสัชกรรม',en?'Reviewer to be confirmed':'รอยืนยันชื่อผู้ตรวจทาน','','—',en?'Not specified in the manuscript':'ต้นฉบับยังไม่ได้ระบุชื่อ');
    if(!article.editorialReview)return [writer,reviewer];
    const pharmacist=card(en?'Pharmacy review':'ผู้ตรวจทานข้อมูลยา',en?'Reviewer not yet confirmed':'รอยืนยันชื่อเภสัชกร','','—',en?'Review completion not confirmed':'ยังไม่ยืนยันการตรวจทาน');
    return [writer,pharmacist];
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
      const image=el('img','article-teaser__image');window.KraneArticleImage.bind(image,article);image.loading='lazy';image.width=1280;image.height=800;
      const body=el('span','article-teaser__body');
      body.append(el('span','article-teaser__meta',document.documentElement.lang==='en'?article.categoryLabel+' · '+article.minutes+' min read':article.categoryLabel+' · อ่าน '+article.minutes+' นาที'),
        el('span','article-teaser__title',article.title),el('span','article-teaser__summary',article.summary));
      const footer=el('span','article-teaser__footer');footer.append(articleAuthor(article),articleReadAction());body.append(footer);button.append(image,body);return button;
    }));
    const empty=document.querySelector('[data-article-empty]');if(empty) empty.hidden=visible.length>0;
  }
  // Render the supplied Markdown as DOM nodes; raw HTML is deliberately text only.
  function inline(node,text){
    let buffer='';const flush=()=>{if(buffer)node.append(document.createTextNode(buffer));buffer='';};
    for(let i=0;i<text.length;){
      if(text[i]==='\\'&&/[\\`*{}\[\]()#+\-.!_>]/.test(text[i+1]||'')){buffer+=text[i+1];i+=2;continue;}
      if(text[i]==='['){
        const labelEnd=text.indexOf('](',i+1);
        if(labelEnd!==-1&&/^https?:\/\//.test(text.slice(labelEnd+2))){
          let end=labelEnd+2,depth=1;
          for(;end<text.length&&depth;end++){if(text[end]==='(')depth++;else if(text[end]===')')depth--;}
          if(depth===0){flush();const link=el('a');inline(link,text.slice(i+1,labelEnd));link.href=text.slice(labelEnd+2,end-1).replace(/\\([()])/g,'$1');link.target='_blank';link.rel='noopener noreferrer';node.append(link);i=end;continue;}
        }
      }
      if(text[i]==='*'){
        const marker=text.startsWith('**',i)?'**':'*',end=text.indexOf(marker,i+marker.length);
        if(end>i+marker.length){flush();const emphasis=el(marker==='**'?'strong':'em');inline(emphasis,text.slice(i+marker.length,end));node.append(emphasis);i=end+marker.length;continue;}
      }
      buffer+=text[i++];
    }
    flush();
  }
  const safeMediaURL=value=>typeof value==='string'&&/^(https:\/\/|assets\/)[^\s<>]+$/.test(value);
  function articleFigure(media){
    if(!media||!safeMediaURL(media.src)||!media.alt?.trim())return null;
    const figure=el('figure','article-reading__figure'),image=el('img');
    image.src=media.src;image.alt=media.alt;image.loading='lazy';image.decoding='async';image.width=1200;image.height=800;figure.append(image);
    if(media.caption)figure.append(el('figcaption','',media.caption));return figure;
  }
  const headingKey=value=>(value||'').replace(/[*_`]/g,'').replace(/^\s*\d+[.)]\s*/,'').trim().toLocaleLowerCase();
  function prepareReading(body,article){
    body.querySelectorAll('.article-reading__section').forEach(section=>{
      const heading=section.querySelector('h2,h3');if(!heading)return;
      const key=headingKey(heading.textContent),config=article.sections.find(s=>headingKey(s.heading)===key);
      if(/^(ประเด็นสำคัญ|key (?:points|takeaways))$/i.test(key))section.classList.add('article-reading__section--summary');
      if(/^(สรุป|summary|conclusion)$/i.test(key))section.classList.add('article-reading__section--conclusion');
      if(config&&['callout','steps','comparison'].includes(config.presentation))section.classList.add('article-reading__section--'+config.presentation);
      const figure=articleFigure(config?.media);if(figure)heading.after(figure);
      section.querySelectorAll('table').forEach(table=>{
        table.setAttribute('role','table');table.querySelectorAll('tr').forEach(row=>row.setAttribute('role','row'));table.querySelectorAll('th').forEach(cell=>cell.setAttribute('role','columnheader'));table.querySelectorAll('td').forEach(cell=>cell.setAttribute('role','cell'));
        const labels=[...table.querySelectorAll('thead th')].map(th=>th.textContent);
        table.querySelectorAll('tbody tr').forEach(row=>[...row.children].forEach((cell,i)=>cell.dataset.label=labels[i]||''));
      });
    });
  }
  function manuscriptNodes(markdown){
    const fragment=document.createDocumentFragment(),lines=markdown.split('\n');
    let section=fragment;
    const contentHeadings=lines.filter(line=>/^#{2,6}\s/.test(line)&&!/(อ้างอิง|references)/i.test(line));
    const baseLevel=Math.min(...contentHeadings.map(line=>line.match(/^#+/)[0].length),3);
    const cells=line=>line.trim().replace(/^\||\|$/g,'').split('|').map(value=>value.trim());
    for(let i=0;i<lines.length;){
      let line=lines[i].trim();if(!line){i++;continue;}
      const image=line.match(/^!\[([^\]]*)\]\((https:\/\/[^\s]+|assets\/[^\s]+?)(?:\s+"([^"]*)")?\)$/);
      if(image){const figure=articleFigure({src:image[2],alt:image[1],caption:image[3]||''});if(figure)section.append(figure);i++;continue;}
      const heading=line.match(/^(#{2,6})\s+(.+)$/)||(/^\*\*ประเด็นสำคัญ\*\*$/.test(line)?['','##','ประเด็นสำคัญ']:null);
      if(heading){section=el('section','article-reading__section');fragment.append(section);const h=el(heading[1].length<=baseLevel?'h2':'h3');inline(h,heading[2]);section.append(h);i++;continue;}
      if(line.startsWith('|')&&/^\|?[\s:|\-]+$/.test((lines[i+1]||'').trim())){
        const wrap=el('div','article-reading__table-scroll');wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label','ตารางประกอบบทความ เลื่อนเพื่ออ่านทุกคอลัมน์');
        const table=el('table','article-reading__table'),head=el('thead'),header=el('tr'),body=el('tbody');
        cells(line).forEach(value=>{const th=el('th');th.scope='col';inline(th,value);header.append(th);});head.append(header);table.append(head,body);i+=2;
        while(i<lines.length&&lines[i].trim().startsWith('|')){const row=el('tr');cells(lines[i]).forEach(value=>{const td=el('td');inline(td,value);row.append(td);});body.append(row);i++;}
        wrap.append(table);section.append(wrap);continue;
      }
      const isList=value=>/^(?:>\s*)?(?:[-*]|\d+\.)\s+/.test(value);
      if(isList(line)){
        const quote=line.startsWith('>'),list=el(/^\d+\./.test(line.replace(/^>\s*/,''))?'ol':'ul');
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
    window.KraneArticleImage.bind(screen.querySelector('[data-article-hero]'),article);
    screen.querySelector('[data-article-meta]').textContent=document.documentElement.lang==='en'?article.categoryLabel+' · '+article.minutes+' min read':article.categoryLabel+' · อ่าน '+article.minutes+' นาที';
    screen.querySelector('[data-article-title]').textContent=article.title;
    screen.querySelector('[data-article-byline]').replaceChildren(...articleCredits(article));
    screen.querySelector('[data-article-summary]').textContent=article.summary;
    const body=screen.querySelector('[data-article-body]');
    if(article.manuscriptMarkdown && document.documentElement.lang!=='en') body.replaceChildren(manuscriptNodes(article.manuscriptMarkdown));
    else body.replaceChildren(...article.sections.map(section=>manuscriptNodes('## '+section.heading+'\n\n'+section.copy.replace(/\n\n(?=\|)/g,'\n'))));
    const source=el('a','article-reading__source',document.documentElement.lang==='en'?'Read the supporting source':'อ่านแหล่งข้อมูลประกอบ');
    source.href=article.source;source.target='_blank';source.rel='noopener noreferrer';
    const references=el('details','article-references'),summary=el('summary','',document.documentElement.lang==='en'?'References':'อ้างอิง'),referenceBody=el('div','article-references__body');
    body.querySelectorAll('.article-reading__section').forEach(section=>{
      const heading=section.querySelector('h2,h3');
      if(heading&&/^(อ้างอิง|เอกสารอ้างอิง|แหล่งอ้างอิง|references)/i.test(heading.textContent.trim())){heading.remove();referenceBody.append(...section.childNodes);section.remove();}
    });
    referenceBody.append(source);references.append(summary,referenceBody);body.append(references);
    prepareReading(body,article);
    {
      const headings=[...body.querySelectorAll('.article-reading__section>h2,.article-reading__section>h3')].filter(h=>!/^(ประเด็นสำคัญ|key (?:points|takeaways))$/i.test(h.textContent.trim()));
      if(headings.length){
        const toc=el('details','article-toc'),label=el('summary','',document.documentElement.lang==='en'?'Contents':'สารบัญ'),nav=el('nav'),list=el('ol');nav.setAttribute('aria-label',document.documentElement.lang==='en'?'Article contents':'สารบัญบทความ');toc.open=true;
        headings.forEach((heading,index)=>{heading.id=article.id+'-section-'+(index+1);heading.tabIndex=-1;const item=el('li'),link=el('a','',heading.textContent);link.href='#'+heading.id;link.addEventListener('click',event=>{event.preventDefault();heading.focus({preventScroll:true});heading.scrollIntoView({block:'start',behavior:'instant'});});item.append(link);list.append(item);});
        nav.append(list);toc.append(label,nav);body.prepend(toc);
      }
    }
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
