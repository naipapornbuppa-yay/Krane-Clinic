function kraneInit_my_documents_owned_124(){
document.querySelector('[data-document-search]')?.addEventListener('input',refreshMyDocuments);
}

function kraneInit_my_documents_owned_125(){
document.querySelector('[data-document-sort]')?.addEventListener('change',refreshMyDocuments);
}

function kraneHandle_my_documents_open(e, docOpen) {
      const documentUrls={receipt:'assets/documents-v1/receipt-v3.pdf',cert:'assets/documents-v1/medical-certificate-v3.pdf'};
      const file=documentUrls[docOpen.dataset.docOpen];
      if(file) window.open(file,'_blank','noopener');
      else show('treatment-detail');
      return true;

  return false;
}

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

function kraneHandle_my_documents_tab(e, tog) {
        const dScr = tog.closest('.screen');
        dScr.querySelectorAll('[data-doc]').forEach(b => { b.hidden = b.dataset.doc !== tog.dataset.docTab; });

  return false;
}

function kraneAppendPrescriptionDownload(el,node,c,plan){const button=node('button','Download prescription preview','btn btn--secondary');button.type='button';button.onclick=()=>{const doc=document.implementation.createHTMLDocument('Prescription preview');doc.body.append(node('h1','Krane Clinic'),node('p','Frontend preview - not a signed medical document'),node('p',c.name+' / '+c.patientId+' / '+plan.id));plan.items.forEach(d=>doc.body.append(node('p',d.name+' / '+(d.directions||d.dirTH||d.dir)+' / '+d.qty)));const url=URL.createObjectURL(new Blob(['<!doctype html>'+doc.documentElement.outerHTML],{type:'text/html;charset=utf-8'}));const a=node('a');a.href=url;a.download=plan.id+'.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};el.append(button);}