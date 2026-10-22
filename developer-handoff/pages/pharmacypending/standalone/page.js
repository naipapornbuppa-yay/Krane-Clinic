function kraneRoute_pharmacypending_3(id){
clearInterval(prepCountdownTimer);
    /* Legacy/direct links may still open this transition screen. It is only a
       stock-confirmation handoff before payment and must never create a paid or
       dispatched order. */
    clearTimeout(phPreparedTimer);
    if(id === 'pharmacypending'){
      const scr=document.getElementById('pharmacypending');
      const thai=document.documentElement.lang==='th';
      const prepEl=scr.querySelector('[data-prep-countdown]');
      const title=scr.querySelector('[data-prep-title]');
      const copy=scr.querySelector('[data-prep-copy]');
      const badge=scr.querySelector('[data-prep-badge]');
      scr.dataset.prepStage='confirmed';
      if(title) title.textContent=thai ? 'ร้านยายืนยันสต็อกแล้ว' : 'Pharmacy stock confirmed';
      if(copy) copy.textContent=thai ? 'อัปเดตสต็อกและยอดเรียบร้อย กำลังกลับไปหน้าชำระเงิน' : 'Stock and total updated. Returning to checkout.';
      if(prepEl) prepEl.textContent='';
      if(badge) badge.setAttribute('data-lucide','package-check');
      window.lucide?.createIcons({attrs:{'stroke-width':1.8}});
      phPreparedTimer=setTimeout(() => {
        if(!scr.classList.contains('active')) return;
        replaceCurrent('payment');
      }, reduceMotion ? 300 : 900);
    }
}