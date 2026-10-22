/* Shared editorial store adapter, run before the main router at the baseline position. */
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
})();
