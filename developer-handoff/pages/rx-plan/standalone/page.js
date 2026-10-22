function kraneHandle_rx_plan_cancelPlan(e) {
      const m=document.querySelector('[data-acceptplan-modal]');
      if(m) m.hidden=true;
      return true;

  return false;
}

function kraneHandle_rx_plan_confirmPlan(e) {
      const m=document.querySelector('[data-acceptplan-modal]');
      if(m) m.hidden=true;
      flowState.orderState.checkoutOrigin='consultation';
      resetOptionalAddOns();
      persistFlowState();
      show('rx-writing');
      return true;

  return false;
}

function kraneHandle_rx_plan_restoreMedicine(e, restore) {
      const key=restore.dataset.restoreItem;
      const row=document.querySelector(`#plan [data-order-item="${key}"]`);
      const ctl=row?.querySelector('[data-qty]');
      if(ctl){
        const nEl=ctl.querySelector('[data-qty-n]');
        const max=parseInt(ctl.dataset.max,10), unit=parseInt(ctl.dataset.unit,10);
        nEl.textContent=max;
        ctl.querySelector('[data-qty-minus]').disabled=false;
        ctl.querySelector('[data-qty-plus]').disabled=true;
        const line=row.querySelector('[data-line-price],[data-order-price]');
        if(line) line.textContent='฿ '+(unit*max).toLocaleString();
        flowState.orderState.quantities[key]=max;
        persistFlowState();
        syncDeclinedMedicines();
        syncOrderCheckout();
        refreshMedicationCheckout();
        showActionToast('เพิ่มกลับเข้ารายการแล้ว','success');
      }
      return true;

  return false;
}

function kraneHandle_rx_plan_acceptPlan(e) {
      e.preventDefault();
      const m=document.querySelector('[data-acceptplan-modal]');
      if(m){ m.hidden=false; fillDoctorName(m); return true; }

  return false;
}

function kraneAppendAcceptPlanAction(el,node,c,plan){const button=node('button','ตรวจรายการยาและดำเนินการต่อ','btn btn--primary');button.type='button';button.onclick=()=>document.dispatchEvent(new Event('krane:accept-plan'));el.append(button);}