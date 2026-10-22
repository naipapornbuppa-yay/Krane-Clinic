/* order-summary: Page-specific functions, rendering and lifecycle are in page.js; cross-page state/services and generic components remain shared.
 * Source references in dependencies.json are relative to developer-handoff/.
 */

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
