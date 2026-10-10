/* Prototype editorial adapter; production must enforce staff authorization server-side. */
(function(){
 const form=document.querySelector('[data-editorial-form]'),rows=document.querySelector('[data-editorial-rows]');if(!form)return;
 let selected=KraneArticleStore.records()[0].id,sectionCount=0;
 const status={Draft:'ฉบับร่าง','Pending approval':'รออนุมัติ',Published:'เผยแพร่แล้ว'};
 function node(tag,text){const el=document.createElement(tag);el.textContent=text;return el}
 function render(){
  rows.replaceChildren(...KraneArticleStore.records().map(r=>{const tr=node('tr','');tr.append(node('td',r.draft.title),node('td',status[r.status]));const cell=node('td',''),button=node('button','แก้ไข');button.type='button';button.className='btn btn--ghost btn--sm';button.dataset.editArticle=r.id;cell.append(button);tr.append(cell);return tr}));
 }
 function load(id){
  selected=id;const record=KraneArticleStore.records().find(r=>r.id===id),article=record.draft;
  form.querySelector('[data-editorial-preview]').hidden=!record.published;
  for(const name of ['title','summary','image','imageAlt'])form.elements[name].value=article[name];
  form.elements.category.value=article.category;form.elements.tags.value=article.tags.join(', ');form.elements.source.value=article.source;
  form.elements.authorName.value=article.author.name;form.elements.authorPhoto.value=article.author.photo;
  const host=form.querySelector('[data-editorial-sections]');host.replaceChildren();
  sectionCount=article.sections.length;article.sections.forEach((section,i)=>{const group=node('div','');group.className='field';for(const [field,label] of [['heading','หัวข้อ'],['copy','เนื้อหา']]){const id=`editor-${field}-${i}`,title=node('label',`${label} ${i+1}`);title.htmlFor=id;const input=node(field==='copy'?'textarea':'input','');input.id=id;input.className='input';input.name=`${field}-${i}`;input.value=section[field];input.required=true;if(field==='copy')input.rows=5;group.append(title,input)}host.append(group)});
  form.querySelector('[data-editorial-preview]').href=`../b2c/krane-b2c.html?public=1&screens=1&article=${encodeURIComponent(id)}#article`;
  form.querySelector('[data-editorial-feedback]').textContent='';
 }
 rows.addEventListener('click',e=>{const b=e.target.closest('[data-edit-article]');if(b)load(b.dataset.editArticle)});
 form.addEventListener('submit',e=>{e.preventDefault();const feedback=form.querySelector('[data-editorial-feedback]');try{
  const draft=KraneArticleStore.records().find(r=>r.id===selected).draft;
  for(const name of ['title','summary','image','imageAlt'])draft[name]=form.elements[name].value.trim();
  draft.author={...draft.author,name:form.elements.authorName.value.trim(),photo:form.elements.authorPhoto.value.trim()};
  draft.category=form.elements.category.value;draft.categoryLabel=({hair:'เส้นผม',weight:'น้ำหนัก'})[draft.category];draft.tags=form.elements.tags.value.split(',').map(s=>s.trim()).filter(Boolean);draft.source=form.elements.source.value.trim();
  draft.sections=Array.from({length:sectionCount},(s,i)=>({heading:form.elements[`heading-${i}`].value.trim(),copy:form.elements[`copy-${i}`].value.trim()}));
  const segmenter=new Intl.Segmenter('th',{granularity:'word'});draft.minutes=Math.max(1,Math.ceil([...segmenter.segment(draft.summary+' '+draft.sections.map(s=>s.copy).join(' '))].filter(s=>s.isWordLike).length/180));
  const saved=KraneArticleStore.save(selected,draft,e.submitter?.value||'Draft');form.querySelector('[data-editorial-preview]').hidden=!saved.published;render();feedback.textContent=e.submitter?.value==='Published'?'เผยแพร่แล้ว เปิดดูในหน้าบทความได้':'บันทึกแล้ว บทความที่เผยแพร่ยังไม่เปลี่ยน';
 }catch(error){feedback.textContent=error.message;}});
 document.querySelector('[data-editorial-new]').addEventListener('click',()=>{try{const id=KraneArticleStore.create();render();load(id)}catch(e){form.querySelector('[data-editorial-feedback]').textContent='บันทึกไม่ได้ โปรดตรวจการอนุญาตพื้นที่จัดเก็บของเบราว์เซอร์'}});
 form.querySelector('[data-editorial-add-section]').addEventListener('click',()=>{const i=sectionCount++;const group=node('div','');group.className='field';for(const [field,label] of [['heading','หัวข้อ'],['copy','เนื้อหา']]){const title=node('label',`${label} ${i+1}`),input=node(field==='copy'?'textarea':'input','');input.id=`editor-${field}-${i}`;title.htmlFor=input.id;input.name=`${field}-${i}`;input.className='input';input.required=true;group.append(title,input)}form.querySelector('[data-editorial-sections]').append(group)});
 render();load(selected);
})();
