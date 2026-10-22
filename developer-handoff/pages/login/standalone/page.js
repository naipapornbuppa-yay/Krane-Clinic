function kraneHandle_login_submit(e, loginSubmit) {
      const phone=document.getElementById('login-phone').value.trim();
      const password=document.getElementById('login-password').value;
      if(!phone){ showActionToast('กรุณากรอกเบอร์โทรศัพท์','warning'); return true; }
      if(!isValidThaiMobile(phone)){ showActionToast('กรุณากรอกเบอร์มือถือ 10 หลักให้ถูกต้อง','warning'); return true; }
      if(!password){ showActionToast('กรุณากรอกรหัสผ่าน','warning'); document.getElementById('login-password')?.focus(); return true; }
      submitOnce('login-submit',loginSubmit,() => {
        flowState.accountCreated=true;
        flowState.otpVerified=true;
        flowState.passwordSet=true;
        flowState.returningIdentityValid=true;
        flowState.returningLogin=true;
        flowState.verifiedPhone=normalizePhone(phone);
        persistFlowState();
        applyAuthenticatedAccount({returning:true});
        const patientPhone=document.getElementById('patient-phone');
        if(patientPhone) patientPhone.value=formatPhoneForDisplay(phone);
        showActionToast('เข้าสู่ระบบแล้ว','success');
        show(nextAfterAuthentication());
      });
      return true;

  return false;
}

function kraneHandle_login_forgot(e, loginForgot) {
      const phone=document.getElementById('login-phone').value.trim();
      if(!isValidThaiMobile(phone)){ showActionToast('กรอกเบอร์โทรศัพท์ก่อน แล้วเราจะส่งรหัส OTP ไปให้','warning'); document.getElementById('login-phone')?.focus(); return true; }
      flowState.accountCreated=true;
      flowState.returningIdentityValid=true;
      flowState.returningLogin=true;
      flowState.passwordResetPending=true;
      flowState.verifiedPhone=normalizePhone(phone);
      persistFlowState();
      showActionToast('ส่งรหัส OTP ไปที่เบอร์ของคุณแล้ว','success');
      show('otp');
      return true;

  return false;
}

function kraneRoute_login_5(id){
const loginIntakeNotice=document.querySelector('[data-login-intake-notice]');
    if(loginIntakeNotice && id==='login'){
      // A saved intake draft plus a clinical destination means this login was
      // opened from the assessment, not from the ordinary landing/profile nav.
      // Keep the message contextual so a cold login never implies treatment has
      // already started.
      loginIntakeNotice.hidden=!(flowState.draftReady && postAuthNext!=='profile');
    }
}