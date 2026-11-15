/* Shared editorial card content for the landing page and public library. */
(() => {
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  window.renderKraneArticleCard = (card, article) => {
    const en = document.documentElement.lang === 'en';
    const image = element('img', 'article-teaser__image');
    window.KraneArticleImage.bind(image, article);
    image.loading = 'lazy';
    image.decoding = 'async';
    image.width = 1280;
    image.height = 800;

    const body = element('span', 'article-teaser__body');
    body.append(
      element('span', 'article-teaser__meta', article.categoryLabel),
      element('span', 'article-teaser__title', article.title),
    );

    const footer = element('span', 'article-teaser__footer');
    const minutes = en ? `${article.minutes}-minute read` : `อ่าน ${article.minutes} นาที`;
    footer.append(element('span', 'article-read-time', minutes));
    footer.insertAdjacentHTML('beforeend', '<svg class="article-teaser__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>');

    body.append(footer);
    card.classList.add('article-teaser', 'article-teaser--editorial');
    card.replaceChildren(image, body);
    return card;
  };
})();
