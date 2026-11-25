/* Browser-only CMS adapter. Fictional content; replace with authenticated APIs.
   Published snapshots are separate from drafts so editing cannot leak to B2C. */
(function(){
 'use strict';
 const key='krane-editorial-demo-v1',clone=x=>JSON.parse(JSON.stringify(x));
 // Invalidate only stale public demo snapshots; do not delete a local editor draft.
 const publicationEpoch='20261124-docs-parity';
 function records(){
  let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}')}catch{}
  if(!saved||typeof saved!=='object'||Array.isArray(saved))saved={};
  const valid=r=>r&&r.draft&&Array.isArray(r.draft.sections)&&Array.isArray(r.draft.tags)&&r.draft.author&&(!r.published||(Array.isArray(r.published.sections)&&Array.isArray(r.published.tags)&&r.published.author));
  saved=Object.fromEntries(Object.entries(saved).filter(([,r])=>valid(r)));
  const seeds=KraneArticleSeed.map(seed=>saved[seed.id]||{id:seed.id,status:'Published',draft:clone(seed),published:clone(seed)});
  return seeds.concat(Object.values(saved).filter(r=>r&&r.id&&!seeds.some(s=>s.id===r.id)&&r.draft));
 }
 function save(id,draft,status){
  if(!['Draft','Pending approval','Published'].includes(status))throw Error('Invalid editorial status');
  const all=records(),record=all.find(x=>x.id===id);if(!record)throw Error('Unknown article');
  if(!draft.title?.trim()||!draft.summary?.trim()||(draft.image && draft.image !== window.KraneArticleImage.placeholder && !draft.imageAlt?.trim())||!draft.sections?.length||draft.sections.some(s=>!s.heading?.trim()||!s.copy?.trim()))throw Error('กรอกชื่อ บทสรุป คำอธิบายภาพ และเนื้อหาให้ครบ');
  for(const url of [draft.image,draft.author?.photo,draft.source])if(url&&!/^(https?:\/\/|assets\/)/.test(url))throw Error('ใช้ลิงก์ https หรือรูปจาก assets เท่านั้น');
  for(const section of draft.sections){const media=section.media;if(media?.src&&(!/^((https:\/\/)|assets\/)[^\s<>]+$/.test(media.src)||!media.alt?.trim()))throw Error('รูปในเนื้อหาต้องใช้ลิงก์ https หรือ assets พร้อมคำอธิบายภาพ');}
  record.draft=clone({...draft,id});record.status=status;
  if(status==='Published'){
   record.published=clone({...record.draft,publicationApproved:true});
   record.publicationEpoch=publicationEpoch;
  }
  localStorage.setItem(key,JSON.stringify(Object.fromEntries(all.map(r=>[r.id,r]))));
  window.dispatchEvent(new CustomEvent('krane-articles-changed'));
  return clone(record);
 }
 window.KraneArticleStore={records,save,create(){
  const id='article-'+crypto.randomUUID(),all=records(),draft=clone(KraneArticleSeed[0]);
  Object.assign(draft,{id,title:'บทความใหม่',summary:'',sections:[{heading:'',copy:''}]});delete draft.manuscriptMarkdown;delete draft.en;delete draft.publicationApproved;delete draft.editorialReview;delete draft.manuscriptUrl;
  all.push({id,status:'Draft',draft,published:null});
  localStorage.setItem(key,JSON.stringify(Object.fromEntries(all.map(r=>[r.id,r]))));return id;
 },published:()=>{
  const canonical=new Map(KraneArticleSeed.map(seed=>[seed.id,seed]));
  return records().map(record=>record.publicationEpoch===publicationEpoch && record.published?.publicationApproved
    ? record.published : canonical.get(record.id)).filter(article=>article?.publicationApproved).map(clone);
 }};
 window.addEventListener('storage',e=>{if(e.key===key)window.dispatchEvent(new CustomEvent('krane-articles-changed'))});
})();
