/* Shared lexical runtime: load through the handoff build; see DEPENDENCIES.md. */

  function createPostpayThumbnailOverflow(remaining){
    const more=document.createElement('button');
    more.type='button';
    more.className='postpay-order-snapshot__more';
    more.dataset.go='order-summary';
    more.textContent=`+${remaining}`;
    more.setAttribute('aria-label',document.documentElement.lang==='th'
      ? `ดูรายการที่เหลืออีก ${remaining} รายการและใบเสร็จ`
      : `View ${remaining} more items and the receipt`);
    return more;
  }
