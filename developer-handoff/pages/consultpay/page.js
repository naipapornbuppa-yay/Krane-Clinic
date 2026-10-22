/* consultpay: Page-specific functions, rendering and lifecycle are in page.js; cross-page state/services and generic components remain shared.
 * Source references in dependencies.json are relative to developer-handoff/.
 */

  function syncConsultationAppointmentSummary(){
    const row=document.querySelector('#consultpay [data-consult-appointment-row]');
    const time=row?.querySelector('[data-consult-appointment-datetime]');
    if(!row || !time) return;
    const when=flowState.appointmentAt ? new Date(flowState.appointmentAt) : null;
    const booked=Boolean(flowState.appointmentWhen && when && !Number.isNaN(when.getTime()));
    row.hidden=!booked;
    if(booked){
      time.dateTime=when.toISOString();
      time.textContent=`${formatFollowUpDate(when)} · ${formatFollowUpTime(when)}`;
    } else {
      time.removeAttribute('datetime');
      time.textContent='';
    }
  }


  /* A medicine stepped down to 0 is declined rather than removed: it leaves the
     order list and appears under "รายการที่คุณเลือกไม่รับ" with a way back.
     Without this a zeroed row sat in the list at ฿0, indistinguishable from one
     the patient kept. */
  /* Q1 (pending). When the coverage flag is on, the consultation fee is shown
     struck through and a deduction line brings it to zero. Off by default, so
     the screen behaves exactly as before until the decision is made. */
  function applyCoverageFlag(){
    const scr=document.getElementById('consultpay');
    if(!scr) return;
    const row=scr.querySelector('[data-coverage-row]');
    const applies = KRANE_FLAGS.coverageLine &&
      (KRANE_FLAGS.coverageAllEntries || document.body.dataset.entry === 'partner');
    if(row) row.hidden = !applies;
    scr.querySelectorAll('[data-consult-fee]').forEach(el => {
      el.style.textDecoration = applies ? 'line-through' : '';
      el.style.opacity = applies ? '.55' : '';
    });
  }

  function syncConsultationCheckoutMode(){
    const screen=document.getElementById('consultpay');
    if(!screen) return;
    const noticeMode=flowState.consultationPaymentTiming!=='before' && !flowState.consultationPaid;
    const fullyCovered=consultationBalanceDue()<=0 && CONSULTATION_FEE_BAHT>0;
    screen.dataset.checkoutMode=noticeMode ? 'fee-notice' : 'consultation-payment';
    /* Nothing to pay means nothing to choose: a payment method, a discount code
       and a paid extra are all meaningless when the balance is zero, but they
       stayed on screen whenever insurance covered the fee in full (client,
       20 Aug). The screen is an acknowledgement then, so it reads as one. */
    screen.querySelectorAll('[data-consult-payment-control]').forEach(control => { control.hidden=noticeMode || fullyCovered; });
    const label=screen.querySelector('[data-consultpay-label]');
    const amount=screen.querySelector('[data-pay-btn-amt]');
    if(label) label.textContent=fullyCovered || noticeMode ? 'ดำเนินการต่อ' : 'ชำระเงิน';
    screen.querySelector('[data-consultpay-go]')?.setAttribute('data-string-id',fullyCovered || noticeMode ? 'action.continue' : 'action.pay');
    if(amount) amount.hidden=true;
  }

/** Initialization is called by shared/runtime.js at the original dependency-safe position. */
function kraneInit_consultpay_551(){
  // consultation Pay -> open the gateway on whichever method the patient picked
  document.body.addEventListener('click', e => {
    if(!e.target.closest('[data-consultpay-go]')) return;
    if(document.getElementById('consultpay')?.dataset.checkoutMode==='fee-notice'){
      flowState.consultationFeeAcknowledged=true;
      persistFlowState();
      show(consultationHandoffTarget());
      return;
    }
    const sel = document.querySelector('#consultpay .option[aria-selected="true"]');
    const tab = sel && /QR|PromptPay/i.test(sel.textContent) ? 'qr' : 'card';
    syncConsultationPaymentAmount();
    show('consultpay-gw');
    resetGatewayAttempt('consultpay-gw');
    activateGatewayMethod('consultpay-gw',tab);
  });
}


/** Page-owned initialization; invoked once at its original position by shared/runtime.js. */
function kraneInit_consultpay_owned_226(){
document.body.addEventListener('change', e => {
    const c = e.target.closest('[data-cert-check]');
    if(!c) return;
    syncConsultationPaymentAmount();
  });
}
