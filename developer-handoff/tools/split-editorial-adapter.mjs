import fs from 'node:fs';import path from 'node:path';import{fileURLToPath}from'node:url';import{parse}from'acorn';import assert from'node:assert/strict';
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),root=path.dirname(dir);
const source=fs.readFileSync(path.join(root,'b2c/article-mocks.js'),'utf8'),ast=parse(source,{ecmaVersion:'latest'}),body=ast.body[0].expression.callee.body.body;
const feed=body.find(n=>n.id?.name==='renderFeed'),detail=body.find(n=>n.id?.name==='renderDetail');
const replacements={articles:'state.articles',byId:'state.byId',selectedId:'state.selectedId',filter:'state.filter',el:'kraneArticleElement',articleAuthor:'kraneArticleAuthor',articleReadAction:'kraneArticleReadAction',renderFeed:'kraneRenderArticles',renderDetail:'kraneRenderArticle'};
function translate(n){const edits=[];function walk(x,parent,key){if(!x||typeof x!=='object')return;if(x.type==='Identifier'&&replacements[x.name]&&!(parent?.type==='MemberExpression'&&key==='property'&&!parent.computed)&&!(parent?.type==='Property'&&key==='key'&&!parent.computed))edits.push({start:x.start,end:x.end,text:replacements[x.name]});for(const[k,v]of Object.entries(x)){if(['start','end'].includes(k))continue;if(Array.isArray(v))v.forEach(a=>walk(a,x,k));else if(v&&typeof v==='object')walk(v,x,k)}}walk(n);let out=source.slice(n.start,n.end);for(const e of edits.sort((a,b)=>b.start-a.start))out=out.slice(0,e.start-n.start)+e.text+out.slice(e.end-n.start);return out;}
const append=(p,s)=>fs.appendFileSync(path.join(dir,`pages/${p}/page.js`),'\n'+s+'\n');
assert.ok(!fs.readFileSync(path.join(dir,'pages/articles/page.js'),'utf8').includes('function kraneRenderArticles'));
for(const[n,id,name]of [[feed,'articles','kraneRenderArticles'],[detail,'article','kraneRenderArticle']])append(id,`/** Owns this page's rendering; shared editorial data stays in kraneArticleState. */\nfunction ${name}(){\n const state=window.kraneArticleState;\n${translate(n.body).slice(1,-1)}\n}`);
const click=body.find(n=>n.type==='ExpressionStatement'&&n.expression?.callee?.property?.name==='addEventListener'&&n.expression.arguments[0]?.value==='click').expression.arguments[1];
append('articles',`/** Capture selection before the shared router consumes data-go. */\nfunction kraneArticleCapture(event){\n const state=window.kraneArticleState;\n${translate(click.body).slice(1,-1)}\n}\nfunction kraneInitArticlesAdapter(){\n document.addEventListener('click',kraneArticleCapture,true);\n document.querySelector('[data-article-search]')?.addEventListener('input',kraneRenderArticles);\n}`);
const el=body.find(n=>n.type==='VariableDeclaration'&&n.declarations[0].id.name==='el').declarations[0].init;
let helpers=`/** Shared editorial DOM primitives used by feed and detail; no screen renderer here. */\nfunction kraneArticleElement(tag,className,text)${source.slice(el.body.start,el.body.end)}\n`;
for(const name of ['articleAuthor','articleReadAction'])helpers+=translate(body.find(n=>n.id?.name===name))+'\n';
fs.writeFileSync(path.join(dir,'shared/lib/articles.js'),helpers);
fs.mkdirSync(path.join(dir,'shared/adapters'),{recursive:true});
fs.writeFileSync(path.join(dir,'shared/adapters/articles.js'),`/* Shared editorial store adapter, run before the main router at the baseline position. */
(function(){
 const articles=window.KraneArticleStore.published();
 const byId=Object.fromEntries(articles.map(article=>[article.id,article]));
 const requested=new URLSearchParams(location.search).get('article');
 const state=window.kraneArticleState={articles,byId,selectedId:byId[requested]?requested:articles[0].id,filter:'all'};
 kraneInitArticlesAdapter();
 window.kraneArticleMock={renderFeed:kraneRenderArticles,renderDetail:kraneRenderArticle,select(id){if(state.byId[id])state.selectedId=id;},articles};
 window.addEventListener('krane-articles-changed',()=>{
  state.articles=window.KraneArticleStore.published();state.byId=Object.fromEntries(state.articles.map(a=>[a.id,a]));
  window.kraneArticleMock.articles=state.articles;kraneRenderArticles();kraneRenderArticle();
 });
 kraneRenderArticles();
})();\n`);
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json')));manifest.libraries.push('shared/lib/articles.js');manifest.preRuntimeScripts=['shared/adapters/articles.js'];fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const shell=path.join(dir,'shared/shell.html');fs.writeFileSync(shell,fs.readFileSync(shell,'utf8').replace('  <script src="article-mocks.js?v=20261010-handoff-v273"></script>',''));
