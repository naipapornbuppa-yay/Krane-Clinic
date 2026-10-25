/* Each template keeps editable Thai/English copy directly in its own HTML. */
(()=>{const title=document.querySelector('h1 [data-info-th]');const sync=()=>{const en=document.documentElement.lang==='en';const labels={'ภาษา':'Language','เมนูหลัก':'Main navigation','เปิดเมนูโปรไฟล์':'Open profile menu','ข้อมูล Krane Clinic':'Krane Clinic information'};document.querySelectorAll('[aria-label]').forEach(node=>{const th=node.dataset.infoAriaTh||node.getAttribute('aria-label');if(labels[th]){node.dataset.infoAriaTh=th;node.setAttribute('aria-label',en?labels[th]:th)}});document.querySelectorAll('.site-header span,.site-header h2,.mobile-menu span,.mobile-menu h2').forEach(node=>{const th=node.dataset.infoLabelTh||node.textContent.trim();if(labels[th]&&node.children.length===0){node.dataset.infoLabelTh=th;node.textContent=en?labels[th]:th}});document.querySelectorAll('[data-info-th]').forEach(node=>{const value=en?node.dataset.infoEn:node.dataset.infoTh;if(node.textContent!==value)node.textContent=value});if(title)document.title=title.textContent+' | Krane Clinic'};new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});document.addEventListener('krane:languagechange',sync);sync()})();

/* Keep the reading navigation aligned with the active section. */
(()=>{
 const links=[...document.querySelectorAll('.info-toc a[href^="#"]')];
 const sections=links.map(a=>document.getElementById(a.hash.slice(1))).filter(Boolean);
 if(!sections.length)return;
 const activate=id=>links.forEach(a=>{const active=a.hash==='#'+id;a.classList.toggle('is-active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});
 let pending=false;
 const update=()=>{pending=false;let current=sections[0];for(const section of sections){if(section.getBoundingClientRect().top<=parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)+parseFloat(getComputedStyle(section).scrollMarginTop)+4)current=section}activate(current.id)};
 addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update)}},{passive:true});
 links.forEach(a=>a.addEventListener('click',()=>activate(a.hash.slice(1))));
 update();
})();
