/** Shared editorial DOM primitives used by feed and detail; no screen renderer here. */
function kraneArticleElement(tag,className,text){
    const node=document.createElement(tag);
    if(className) node.className=className;
    if(text != null) node.textContent=text;
    return node;
  }
function kraneArticleAuthor(article){
    const row=kraneArticleElement('span','article-author');
    const photo=kraneArticleElement('img','article-author__photo');photo.src=article.author.photo;photo.alt='';photo.width=40;photo.height=40;
    const text=kraneArticleElement('span','article-author__text');text.append(kraneArticleElement('strong','',article.author.name),kraneArticleElement('small','','ผู้เขียนตัวอย่าง · อัปเดต ต.ค. 2569'));
    row.append(photo,text);return row;
  }
function kraneArticleReadAction(){
    const action=kraneArticleElement('span','article-teaser__action','อ่านบทความ');
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('class','ui-icon ui-icon--sm');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M5 12h14M12 5l7 7-7 7');svg.append(path);action.append(svg);return action;
  }
