(() => {
  const page = document.querySelector('main:is([data-programme="rebody"],[data-programme="rehair"])');
  if (!page) return;

  const timeline = page.querySelector('.opt-timeline-list');
  const comparisons = page.querySelector('.opt-comparison [data-rail]');
  const reviewData = window.KraneReviews || [];
  const cards = Array.from(comparisons?.children || []);
  const weightPairs = reviewData.filter(item => item.category === 'weight' && item.before && item.after);
  cards.forEach((card, index) => {
    if (page.dataset.programme === 'rebody') {
      const images = card.firstElementChild;
      const photos = Array.from(images.children);
      if (photos.length !== 2) return;
      // The data keys, not the card index or a different programme's reviews,
      // establish the order of this pair. Profile/sample durations aren't evidence.
      const pair = weightPairs.find(item =>
        photos[0].getAttribute('src') === item.before &&
        photos[1].getAttribute('src') === item.after);
      images.className = 'rebody-pair-images';
      photos.forEach((photo, position) => {
        const figure = document.createElement('figure');
        photo.alt = pair ? (position ? 'ภาพหลัง' : 'ภาพก่อน') : 'ภาพเปรียบเทียบ';
        photo.decoding = 'async';
        photo.replaceWith(figure);
        figure.append(photo);
        if (pair) {
          const label = document.createElement('figcaption');
          label.textContent = position ? 'หลัง' : 'ก่อน';
          figure.append(label);
        }
      });
      const copy = document.createElement('div');
      copy.className = 'rebody-pair-copy';
      const note = card.querySelector('p');
      note.textContent = 'ผลลัพธ์แตกต่างกันในแต่ละบุคคล';
      // Use released text only when it is attached to this exact photo pair.
      if (pair?.quote || pair?.caption) {
        const lead = document.createElement(pair.quote ? 'blockquote' : 'h3');
        if (pair.quote) {
          lead.textContent = '“' + pair.quote.replace(/<br\s*\/?\s*>/gi, ' ') + '”';
        } else {
          lead.className = 'rebody-pair-headline';
          lead.textContent = pair.caption;
        }
        copy.append(lead);
      }
      copy.append(note);
      card.append(copy);
      return;
    }
    const review = reviewData.find(item => item.id === ['hair-pha', 'hair-03'][index]);
    if (!review) return;
    const images = card.firstElementChild;
    images.className = 'rebody-pair-images';
    Array.from(images.children).forEach((img, imageIndex) => {
      const figure = document.createElement('figure');
      const label = document.createElement('figcaption');
      label.textContent = imageIndex ? 'หลัง · ' + review.exampleMonths + ' เดือน' : 'ก่อน';
      img.alt = (imageIndex ? 'ภาพหลังของ ' : 'ภาพก่อนของ ') + review.name;
      img.decoding = 'async';
      if (review.id === 'hair-pha' && imageIndex) img.className = 'rebody-pair-composite';
      img.replaceWith(figure);
      figure.append(img, label);
    });
    const copy = document.createElement('div');
    copy.className = 'rebody-pair-copy';
    const quote = document.createElement('blockquote');
    quote.textContent = '“' + review.quote.replace(/<br\s*\/?\s*>/gi, ' ') + '”';
    const name = card.querySelector('p');
    name.textContent = [review.name, review.age + ' ปี', review.province].filter(Boolean).join(' · ');
    copy.append(quote, name);
    card.append(copy);
  });
  if (page.dataset.programme === 'rebody') {
    const months = ['เดือนที่ 1', 'เดือนที่ 2–3', '4 เดือนขึ้นไป'];
    const descriptions = [
      'แพทย์ประจำตัวจะประเมินสุขภาพ ตั้งเป้าหมายร่วมกับคุณ และเริ่มแผนดูแลอย่างค่อยเป็นค่อยไป ช่วงแรกร่างกายกำลังปรับตัว บางคนอาจรู้สึกอิ่มเร็วขึ้นหรือคลื่นไส้เล็กน้อย ซึ่งพบได้และมักดีขึ้นเอง หากกังวล นัดปรึกษาแพทย์ประจำตัวได้เสมอ',
      'แพทย์จะติดตามผลและปรับแผนให้เหมาะกับร่างกายของคุณ พร้อมวางแผนการกินและการออกกำลังกายเฉพาะบุคคล',
      'ทบทวนผลกับแพทย์และวางแผนระยะยาว เพื่อให้ดูแลพฤติกรรมการกินและการออกกำลังกายได้อย่างต่อเนื่อง',
    ];
    timeline.querySelectorAll('details').forEach((item, index) => {
      item.name = 'rebody-care-timeline';
      item.querySelector('summary .opt-eyebrow').textContent = months[index];
      item.querySelector('.opt-step-copy p').textContent = descriptions[index];

    });
    const caption = document.createElement('small');
    caption.textContent = 'ผลลัพธ์ขึ้นอยู่กับแต่ละบุคคล';
    timeline.querySelector('.opt-step-copy').append(caption);
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      timeline.classList.add('is-in-view');
      observer.disconnect();
    });
    observer.observe(timeline);
  }

})();
