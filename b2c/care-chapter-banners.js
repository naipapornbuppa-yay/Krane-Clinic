(() => {
  const template = document.querySelector('#care-chapter-banner-template');
  if (!template) return;

  for (const chapter of document.querySelectorAll('.care-chapter[data-programme-name]')) {
    const {programmeName, bannerImage, bannerEmphasis, bannerTail, intakeCategory, detailsPage, mobileLine} = chapter.dataset;
    const banner = template.content.firstElementChild.cloneNode(true);
    const image = banner.querySelector(':scope > img');
    image.src = `assets/landing-exact/${bannerImage}.png`;
    image.alt = `แพทย์แนะนำโปรแกรม ${programmeName}`;

    const title = banner.querySelector('h2');
    title.id = chapter.getAttribute('aria-labelledby');
    title.querySelector('.care-chapter__programme').textContent = programmeName;
    const headline = title.querySelector('.care-chapter__headline');
    headline.querySelector('strong').textContent = bannerEmphasis;
    headline.append(bannerTail);
    if (mobileLine) {
      const line = document.createElement('span');
      line.className = 'care-chapter__mobile-prefix care-chapter__title-line';
      line.textContent = mobileLine;
      headline.append(line);
    }

    banner.querySelectorAll('.care-chapter__cta--details, .care-chapter__mobile-details').forEach(link => {
      link.href = detailsPage;
    });
    banner.querySelector('.care-chapter__mobile-details').setAttribute('aria-describedby', title.id);
    const start = banner.querySelector('.care-chapter__cta--start');
    start.href = `krane-b2c.html?entry=direct&fresh=1&category=${intakeCategory}#intake1`;
    start.dataset.category = intakeCategory;
    chapter.prepend(banner);
  }
})();
