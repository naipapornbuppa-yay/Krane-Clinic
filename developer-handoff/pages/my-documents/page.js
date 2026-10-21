/* Shared lexical runtime: load through the handoff build; see DEPENDENCIES.md. */

  function refreshMyDocuments(){
    const screen=document.getElementById('my-documents');
    if(!screen) return;
    const list=screen.querySelector('[data-document-list]');
    const search=screen.querySelector('[data-document-search]');
    const sort=screen.querySelector('[data-document-sort]');
    const empty=screen.querySelector('[data-document-empty]');
    if(!list) return;
    const query=(search?.value || '').trim().toLocaleLowerCase(document.documentElement.lang || 'th');
    const direction=sort?.value === 'oldest' ? 1 : -1;
    const items=[...list.querySelectorAll('[data-document-item]')];
    items.sort((a,b) => direction * String(a.dataset.documentDate || '').localeCompare(String(b.dataset.documentDate || '')))
      .forEach(item => list.appendChild(item));
    let visible=0;
    items.forEach(item => {
      const haystack=`${item.dataset.documentSearchText || ''} ${item.textContent || ''}`.toLocaleLowerCase(document.documentElement.lang || 'th');
      item.hidden=Boolean(query) && !haystack.includes(query);
      if(!item.hidden) visible+=1;
    });
    if(empty) empty.hidden=visible!==0;
  }

/** Page-owned initialization; invoked once at its original position by shared/runtime.js. */
function kraneInit_my_documents_owned_124(){
document.querySelector('[data-document-search]')?.addEventListener('input',refreshMyDocuments);
}

/** Page-owned initialization; invoked once at its original position by shared/runtime.js. */
function kraneInit_my_documents_owned_125(){
document.querySelector('[data-document-sort]')?.addEventListener('change',refreshMyDocuments);
}
