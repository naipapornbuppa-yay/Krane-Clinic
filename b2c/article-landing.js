/* Fill existing preview links from the same catalog as the article library. */
(() => {
  function render() {
    const articles = new Map(KraneArticleStore.published().map(article => [article.id, article]));
    const en = document.documentElement.lang === 'en';
    const categories = {hair: 'Hair loss', weight: 'Weight', 'sexual-health': 'Sexual health'};
    document.querySelectorAll('.articles-row [data-article-id]').forEach(card => {
      let article = articles.get(card.dataset.articleId);
      if (!article) return;
      if (en && article.en) {
        article = {...article, ...article.en, categoryLabel: categories[article.category] || article.categoryLabel};
      }
      card.classList.remove('article-card');
      window.renderKraneArticleCard(card, article);
    });
  }
  render();
  new MutationObserver(render).observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
  window.addEventListener('krane-articles-changed', render);
})();
