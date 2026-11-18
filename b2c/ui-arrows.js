/* One stroke and baseline for directional UI icons, including dynamic controls. */
(() => {
  const style=document.createElement('style');
  style.textContent='a svg[class*="lucide-arrow"],button svg[class*="lucide-arrow"],a svg[class*="lucide-chevron"],button svg[class*="lucide-chevron"]{stroke-width:1.75;vertical-align:middle;flex-shrink:0}';
  document.head.append(style);
  const paths = {'→':'M5 12h14m-6-6 6 6-6 6','←':'M19 12H5m6-6-6 6 6 6','↗':'M6 18 18 6M6 6h12v12'};
  function icon(symbol) {
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    for(const [key,value] of Object.entries({viewBox:'0 0 24 24',width:'18',height:'18',fill:'none',stroke:'currentColor','stroke-width':'1.75','stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true',focusable:'false'}))svg.setAttribute(key,value);
    svg.classList.add('krane-direction-icon');
    svg.style.cssText='display:inline-block;vertical-align:middle;flex-shrink:0;';
    const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',paths[symbol]);svg.append(path);return svg;
  }
  function normalize(root) {
    if(root.nodeType!==1 || root.closest('svg,script,style,textarea,[contenteditable]'))return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const matches=[];
    while(walker.nextNode()) {
      const node=walker.currentNode;
      if(/[→←↗]/.test(node.data) && node.parentElement.closest('a,button') && !node.parentElement.closest('svg,script,style'))matches.push(node);
    }
    for(const node of matches){const fragment=document.createDocumentFragment();for(const part of node.data.split(/([→←↗])/))fragment.append(paths[part]?icon(part):document.createTextNode(part));node.replaceWith(fragment);}
    root.querySelectorAll('svg.lucide-arrow-right,svg.lucide-arrow-left,svg.lucide-arrow-up-right').forEach(svg=>{svg.setAttribute('stroke-width','1.75');svg.style.verticalAlign='middle';svg.style.flexShrink='0';});
  }
  const start=()=>{normalize(document.body);new MutationObserver(records=>{for(const record of records){if(record.type==='characterData')normalize(record.target.parentElement);else for(const node of record.addedNodes)normalize(node.nodeType===1?node:node.parentElement);}}).observe(document.body,{childList:true,subtree:true,characterData:true});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
