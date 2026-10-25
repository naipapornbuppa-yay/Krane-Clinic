(()=>{'use strict';const index=document.querySelector('[data-library-index]'),reading=document.getElementById('article');function editorialLayout(){
const article=window.kraneArticleMock.articles.find(a=>a.id===reading.dataset.articleId);if(!article)return;reading.querySelector('[data-article-tags]').hidden=true;
const en=document.documentElement.lang==='en',header=reading.querySelector('.library-hero--reading'),credits=reading.querySelector('[data-article-byline]');header.querySelector('.library-hero__copy').append(credits);
const heroImage=header.querySelector('[data-article-hero]'),heroMedia=header.querySelector('.library-hero__media');
const titleText=article.title.toLowerCase();
const weightCutouts={'library-obesity-02':['assets/medicine/weight-diecut-v1/mounjaro-kwikpen-diecut-v1.png','ปากกายา Mounjaro KwikPen'],'library-obesity-04':['assets/medicine/weight-diecut-v1/ozempic-pens-diecut-v1.png','ปากกายา Ozempic']};
const product=weightCutouts[article.id] || (titleText.includes('sildenafil')?['assets/medicine/ed-sheet-v1/sildenafil-tablet-hires.jpg','ภาพถ่ายเม็ดยา sildenafil ด้านที่มีตรา Pfizer']:titleText.includes('tadalafil')?['assets/medicine/ed-sheet-v1/cialis-20mg-c20-cutout.png','เม็ดยา tadalafil ตราสัญลักษณ์ C20']:null);
const hasPhoto=!!product || (article.image && article.image!==window.KraneArticleImage.placeholder);
header.classList.toggle('has-editorial-photo',!!hasPhoto);heroMedia.hidden=!hasPhoto;heroMedia.classList.toggle('is-product',!!product&&!titleText.includes('sildenafil'));
reading.querySelector('.article-photo-credit')?.remove();if(titleText.includes('sildenafil')){const credit=document.createElement('p');credit.className='article-photo-credit';credit.innerHTML='Photo: Tim Reckmann · <a href="https://commons.wikimedia.org/wiki/File:Viagra_Tablette.jpg" target="_blank" rel="noopener">Wikimedia Commons</a> · <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener">CC BY-SA 3.0</a>';header.after(credit);}
if(product){heroImage.src=product[0];heroImage.alt=product[1];}else window.KraneArticleImage.bind(heroImage,article);
const hairComparison=titleText.includes('finasteride')&&titleText.includes('minoxidil');
heroMedia.querySelector('.article-medicine-pair')?.remove();heroMedia.classList.toggle('has-medicine-pair',hairComparison);heroImage.hidden=hairComparison;
if(hairComparison){
 const pair=document.createElement('div');pair.className='article-medicine-pair';
 [['propecia-bottle-current.jpg','Propecia · finasteride 1 mg'],['rogaine-bottle-official.png','Rogaine · minoxidil 5%']].forEach(([file,label])=>{const item=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');img.src='assets/medicine/condition-real-v1/'+file;img.alt=label;caption.textContent=label;item.append(img,caption);pair.append(item)});
 heroMedia.append(pair);
 const credit=document.createElement('p');credit.className='article-photo-credit';credit.innerHTML='ภาพผลิตภัณฑ์: <a href="https://www.henryschein.com/Products/1406711_US_Front_01_600x600.jpg" target="_blank" rel="noopener">Henry Schein</a> · <a href="https://www.rogaine.com/" target="_blank" rel="noopener">Rogaine</a>';header.after(credit);
}

const body=reading.querySelector('[data-article-body]'),takeaways=body.querySelector('.article-reading__section--summary');if(takeaways){
body.prepend(takeaways);
const intro=document.createElement('div');intro.className='article-reading__intro';
[...takeaways.children].filter(node=>!node.matches('h2,h3,blockquote,ul,ol')).forEach(node=>intro.append(node));
if(intro.childNodes.length)takeaways.after(intro);
if(article.id==='library-obesity-01'&&!en){
const concise=['GLP-1 เลียนแบบฮอร์โมนอิ่ม เพื่อช่วยดูแลน้ำหนัก','ไม่เหมาะกับทุกคน ต้องให้แพทย์ประเมินก่อนใช้','ชนิดฉีดในไทยต้องมีใบสั่งแพทย์และจ่ายผ่านเภสัชกร','ใช้ควบคู่กับการกิน การออกกำลังกาย และติดตามผลระยะยาว'];
takeaways.querySelectorAll('li').forEach((li,i)=>{if(concise[i])li.textContent=concise[i]});
}
}
const toc=body.querySelector('.article-toc');if(toc)toc.open=false;
reading.querySelector('.article-editorial-footer')?.remove();
const footer=document.createElement('div');footer.className='article-editorial-footer';
const refs=reading.querySelector('.article-references');if(refs){refs.open=true;footer.append(refs)}
const experts=document.createElement('section');experts.className='article-experts';const heading=document.createElement('h2');heading.textContent=en?'Behind this article':'ผู้เขียนและผู้ตรวจทาน';experts.append(heading,credits.cloneNode(true));experts.querySelector('[data-article-byline]').removeAttribute('data-article-byline');footer.append(experts);
const related=document.createElement('section');related.className='article-related';const title=document.createElement('h2');title.textContent=en?'Related articles':'บทความที่เกี่ยวข้อง';related.append(title);const rail=document.createElement('div');rail.className='article-related__rail';
window.kraneArticleMock.articles.filter(a=>a.id!==article.id&&a.category===article.category).slice(0,4).forEach(a=>{const card=document.createElement('a');card.className='article-teaser';card.href='?article='+encodeURIComponent(a.id);card.dataset.go='article';card.dataset.articleId=a.id;const img=document.createElement('img');img.className='article-teaser__image';img.alt='';img.loading='lazy';window.KraneArticleImage.bind(img,a);const label=document.createElement('span');label.className='article-teaser__body';const name=document.createElement('h3');name.className='article-teaser__title';name.textContent=en&&a.en?a.en.title:a.title;label.append(name);card.append(img,label);rail.append(card)});if(rail.children.length){related.append(rail);footer.append(related)}
const cta=document.createElement('section');cta.className='article-consult';const message=document.createElement('h2');message.textContent=en?'Find care that fits you':'หาคำตอบที่เหมาะกับสุขภาพของคุณ';const link=document.createElement('a');link.textContent=en?'Explore our programmes →':'ดูโปรแกรมและปรึกษาแพทย์ →';link.href='krane-b2c-landing.html#services';cta.append(message,link);footer.append(cta);reading.append(footer);
}document.addEventListener('krane-article-rendered',editorialLayout);
function show(){const id=new URLSearchParams(location.search).get('article');const valid=window.kraneArticleMock.articles.some(a=>a.id===id);index.hidden=valid;reading.hidden=!valid;const home=document.querySelector("[data-library-home]");if(home)home.hidden=valid;if(valid){window.kraneArticleMock.select(id);window.kraneArticleMock.renderDetail();document.title=document.querySelector('[data-article-title]').textContent+' | Krane Clinic';}else document.title='บทความสุขภาพ | Krane Clinic';}document.addEventListener('click',event=>{const card=event.target.closest('[data-go="article"][data-article-id]'),back=event.target.closest('[data-library-back]');if(!card&&!back)return;event.preventDefault();history.pushState({},'',card?'?article='+encodeURIComponent(card.dataset.articleId):'articles.html');show();window.scrollTo({top:0,behavior:'instant'});if(card)document.querySelector('[data-article-title]').focus({preventScroll:true});});window.addEventListener('popstate',show);show();})();
