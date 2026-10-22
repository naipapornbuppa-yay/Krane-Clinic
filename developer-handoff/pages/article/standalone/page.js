function kraneRenderArticle(){
 const state=window.kraneArticleState;

    const article=state.byId[state.selectedId] || state.articles[0];
    const screen=document.getElementById('article');if(!screen) return;
    screen.dataset.articleId=article.id;
    screen.querySelector('[data-article-hero]').src=article.image;
    screen.querySelector('[data-article-hero]').alt=article.imageAlt;
    screen.querySelector('[data-article-meta]').textContent=article.categoryLabel+' · อ่าน '+article.minutes+' นาที';
    screen.querySelector('[data-article-title]').textContent=article.title;
    screen.querySelector('[data-article-byline]').replaceChildren(kraneArticleAuthor(article));
    screen.querySelector('[data-article-summary]').textContent=article.summary;
    const body=screen.querySelector('[data-article-body]');
    body.replaceChildren(...article.sections.map(section => {
      const block=kraneArticleElement('section','article-reading__section');
      block.append(kraneArticleElement('h3','',section.heading),kraneArticleElement('p','',section.copy));return block;
    }));
    const source=kraneArticleElement('a','article-reading__source','อ่านแหล่งข้อมูลประกอบ');
    source.href=article.source;source.target='_blank';source.rel='noopener noreferrer';body.append(source);
    const tags=screen.querySelector('[data-article-tags]');
    tags.replaceChildren(...article.tags.map(tag => kraneArticleElement('span','article-tags__tag',tag)));

}