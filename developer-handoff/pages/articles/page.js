/* articles: Owns feed rendering, search/filter, empty state and capture-phase card selection. Shared article data/store and update coordination remain central.
 * Source references in dependencies.json are relative to developer-handoff/.
 */

/** Owns this page's rendering; shared editorial data stays in kraneArticleState. */
function kraneRenderArticles(){
 const state=window.kraneArticleState;

    const feed=document.querySelector('[data-article-feed]');
    if(!feed) return;
    const query=(document.querySelector('[data-article-search]')?.value || '').trim().toLocaleLowerCase('th');
    const visible=state.articles.filter(article =>
      (state.filter==='all' || article.category===state.filter) &&
      (!query || [article.title,article.summary,article.categoryLabel,...article.tags].join(' ').toLocaleLowerCase('th').includes(query)));
    feed.replaceChildren(...visible.map((article,index) => {
      const button=kraneArticleElement('button','article-teaser' + (index ? ' article-teaser--compact' : ''));
      button.type='button';button.dataset.go='article';button.dataset.articleId=article.id;
      const image=kraneArticleElement('img','article-teaser__image');image.src=article.image;image.alt=article.imageAlt;image.loading='lazy';image.width=1280;image.height=800;
      const body=kraneArticleElement('span','article-teaser__body');
      body.append(kraneArticleElement('span','article-teaser__meta',article.categoryLabel+' · อ่าน '+article.minutes+' นาที'),
        kraneArticleElement('span','article-teaser__title',article.title),kraneArticleElement('span','article-teaser__summary',article.summary),
        kraneArticleReadAction());
      body.append(kraneArticleAuthor(article));button.append(image,body);return button;
    }));
    const empty=document.querySelector('[data-article-empty]');if(empty) empty.hidden=visible.length>0;

}

/** Capture selection before the shared router consumes data-go. */
function kraneArticleCapture(event){
 const state=window.kraneArticleState;

    const card=event.target.closest('[data-article-id][data-go="article"]');
    if(card && state.byId[card.dataset.articleId]) state.selectedId=card.dataset.articleId;
    const choice=event.target.closest('[data-article-filter]');
    if(choice){state.filter=choice.dataset.articleFilter;document.querySelectorAll('[data-article-filter]').forEach(button => button.setAttribute('aria-pressed',String(button===choice)));kraneRenderArticles();}

}
function kraneInitArticlesAdapter(){
 document.addEventListener('click',kraneArticleCapture,true);
 document.querySelector('[data-article-search]')?.addEventListener('input',kraneRenderArticles);
}
