/* Prototype editorial adapter; production must enforce staff authorization server-side. */
(function(){
 const form=document.querySelector('[data-editorial-form]'),rows=document.querySelector('[data-editorial-rows]');if(!form)return;
 let selected=KraneArticleStore.records()[0].id,sectionCount=0;
 const status={Draft:'ฉบับร่าง','Pending approval':'รออนุมัติ',Published:'เผยแพร่แล้ว'};
 function node(tag,text){const el=document.createElement(tag);el.textContent=text;return el}
 function render(){
  rows.replaceChildren(...KraneArticleStore.records().map(r=>{const tr=node('tr','');tr.append(node('td',r.draft.title),node('td',status[r.status]));const cell=node('td',''),button=node('button','แก้ไข');button.type='button';button.className='btn btn--ghost btn--sm';button.dataset.editArticle=r.id;cell.append(button);tr.append(cell);return tr}));
 }
 function sectionFields(section,i){
  const group=node('div','');group.className='field';
  for(const [field,label] of [['heading','หัวข้อ'],['copy','เนื้อหา']]){
   const title=node('label',`${label} ${i+1}`),input=node(field==='copy'?'textarea':'input','');input.id=`editor-${field}-${i}`;title.htmlFor=input.id;input.className='input';input.name=`${field}-${i}`;input.value=section[field]||'';input.required=true;if(field==='copy')input.rows=5;group.append(title,input);
  }
  const layoutLabel=node('label','รูปแบบเซคชัน');layoutLabel.htmlFor=`editor-presentation-${i}`;const select=node('select','');select.id=layoutLabel.htmlFor;select.name=`presentation-${i}`;select.className='select';
  for(const [value,label] of [['text','เนื้อหาปกติ'],['callout','กล่องเน้นข้อความ'],['steps','ขั้นตอน'],['comparison','ตารางเปรียบเทียบ']]){const option=node('option',label);option.value=value;select.append(option)}select.value=section.presentation||'text';group.append(layoutLabel,select);
  const media=node('details',''),summary=node('summary','ภาพประกอบเซคชัน (ไม่บังคับ)');media.append(summary);
  for(const [field,label,value] of [['mediaSrc','ลิงก์ภาพ https หรือ assets',section.media?.src],['mediaAlt','คำอธิบายภาพสำหรับผู้อ่าน',section.media?.alt],['mediaCaption','คำบรรยายใต้ภาพ / เครดิตภาพ',section.media?.caption]]){
   const title=node('label',label),input=node('input','');input.id=`editor-${field}-${i}`;title.htmlFor=input.id;input.name=`${field}-${i}`;input.className='input';input.value=value||'';media.append(title,input);
  }
  media.append(node('p','ภาพจะแสดงใต้หัวข้อนี้ หากไม่ใส่ภาพจะไม่มีพื้นที่ว่างในบทความ'));group.append(media);return group;
 }
 function load(id){
  selected=id;const record=KraneArticleStore.records().find(r=>r.id===id),article=record.draft;
  form.querySelector('[data-editorial-preview]').hidden=!record.published;
  for(const name of ['title','summary','image','imageAlt'])form.elements[name].value=article[name]||'';
  if(![...form.elements.category.options].some(option=>option.value===article.category)){const option=node('option',article.categoryLabel||article.category);option.value=article.category;form.elements.category.append(option);}
  form.elements.category.value=article.category;form.elements.tags.value=article.tags.join(', ');form.elements.source.value=article.source;
  form.elements.authorName.value=article.author.name;form.elements.authorPhoto.value=article.author.photo||'';form.elements.authorPhoto.required=false;
  const host=form.querySelector('[data-editorial-sections]');host.replaceChildren();
  sectionCount=article.sections.length;article.sections.forEach((section,i)=>host.append(sectionFields(section,i)));
  form.querySelector('[data-editorial-preview]').href=`../b2c/articles.html?article=${encodeURIComponent(id)}`;
  form.querySelector('[data-editorial-feedback]').textContent='';
 }
 rows.addEventListener('click',e=>{const b=e.target.closest('[data-edit-article]');if(b)load(b.dataset.editArticle)});
 form.addEventListener('submit',e=>{e.preventDefault();const feedback=form.querySelector('[data-editorial-feedback]');try{
  const draft=KraneArticleStore.records().find(r=>r.id===selected).draft;
  for(const name of ['title','summary','image','imageAlt'])draft[name]=form.elements[name].value.trim();
  draft.author={...draft.author,name:form.elements.authorName.value.trim(),photo:form.elements.authorPhoto.value.trim()};
  draft.category=form.elements.category.value;draft.categoryLabel=({hair:'ผมร่วง',weight:'น้ำหนัก',men:'สุขภาพทางเพศ','sexual-health':'สุขภาพทางเพศ',lifestyle:'ไลฟ์สไตล์',general:'ทั่วไป'})[draft.category]||draft.categoryLabel;draft.tags=form.elements.tags.value.split(',').map(s=>s.trim()).filter(Boolean);draft.source=form.elements.source.value.trim();
  const previousCopy=JSON.stringify(draft.sections.map(section=>[section.heading,section.copy]));
  draft.sections=Array.from({length:sectionCount},(_,i)=>{
   const section={heading:form.elements[`heading-${i}`].value.trim(),copy:form.elements[`copy-${i}`].value.trim(),presentation:form.elements[`presentation-${i}`].value};
   const src=form.elements[`mediaSrc-${i}`].value.trim();if(src)section.media={src,alt:form.elements[`mediaAlt-${i}`].value.trim(),caption:form.elements[`mediaCaption-${i}`].value.trim()};return section;
  });
  if(previousCopy!==JSON.stringify(draft.sections.map(section=>[section.heading,section.copy])))delete draft.manuscriptMarkdown;
  const segmenter=new Intl.Segmenter('th',{granularity:'word'});draft.minutes=Math.max(1,Math.ceil([...segmenter.segment(draft.summary+' '+draft.sections.map(s=>s.copy).join(' '))].filter(s=>s.isWordLike).length/180));
  const saved=KraneArticleStore.save(selected,draft,e.submitter?.value||'Draft');form.querySelector('[data-editorial-preview]').hidden=!saved.published;render();feedback.textContent=e.submitter?.value==='Published'?'เผยแพร่ในต้นแบบเบราว์เซอร์นี้แล้ว เปิดดูหน้าบทความบนอุปกรณ์นี้ได้':'บันทึกแล้ว บทความที่เผยแพร่ยังไม่เปลี่ยน';
 }catch(error){feedback.textContent=error.message;}});
 document.querySelector('[data-editorial-new]').addEventListener('click',()=>{try{const id=KraneArticleStore.create();render();load(id)}catch(e){form.querySelector('[data-editorial-feedback]').textContent='บันทึกไม่ได้ โปรดตรวจการอนุญาตพื้นที่จัดเก็บของเบราว์เซอร์'}});
 form.querySelector('[data-editorial-add-section]').addEventListener('click',()=>{const i=sectionCount++;form.querySelector('[data-editorial-sections]').append(sectionFields({},i))});
 render();load(selected);
})();
