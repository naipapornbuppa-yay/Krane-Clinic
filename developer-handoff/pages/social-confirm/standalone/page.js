function kraneHandle_social_confirm_continue(e, authContinue) {
      const phone=document.getElementById('social-phone')?.value.trim() || '';
      const birthDate=document.getElementById('social-birth-date');
      if(!birthDate?.value){
        showActionToast('กรุณาเลือกวันเกิด','warning');
        birthDate?.focus();
        return true;
      }
      if(!isValidThaiMobile(phone)){
        showActionToast('กรุณากรอกเบอร์มือถือ 10 หลักให้ถูกต้อง','warning');
        document.getElementById('social-phone')?.focus();
        return true;
      }
      const phoneChanged=normalizePhone(phone)!==normalizePhone(flowState.verifiedPhone);
      if(phoneChanged || !flowState.otpVerified){
        flowState.pendingPhone=normalizePhone(phone);
        flowState.phoneOtpPending=true;
        flowState.phoneOtpReturn='social-confirm';
        flowState.phoneOtpDestination=authNext;
        flowState.phoneOtpCompletesAuth=true;
        persistFlowState();
        show('otp');
        return true;
      }
      submitOnce('social-confirm',authContinue,() => completeAuthentication(authNext));
      return true;

  return false;
}

function kraneHandle_social_confirm_provider(e, social) {
      const provider = social.dataset.social;
      flowState.authProvider=provider;
      socialCompletesAuth = Boolean(social.closest('#login'));
      flowState.returningLogin = socialCompletesAuth;
      persistFlowState();
      authNext = socialCompletesAuth ? postAuthNext : (social.dataset.authNext || 'consent-terms');
      const name = document.querySelector('[data-auth-provider-name]'); if(name) name.textContent = provider;
      const providerIcons={Google:'#logo-google',Apple:'#logo-apple',LINE:'#logo-line'};
      const use = document.querySelector('[data-auth-provider-icon] use'); if(use) use.setAttribute('href', providerIcons[provider] || '#logo-line');
      // The prototype has no live OAuth callback. Reuse only profile fields
      // actually returned by an integration or saved from this provider.
      const saved=readSessionJson(AUTH_PROFILE_KEY);
      const providerData=window.kraneOAuthProfiles?.[provider]
        || (saved.authenticated && saved.provider===provider ? saved : {});
      const savedName=splitRecipientName(providerData.displayName);
      const first=String(providerData.firstName || savedName.firstName || '').trim();
      const last=String(providerData.lastName || savedName.lastName || '').trim();
      const email=String(providerData.email || '').trim();
      const phone=String(providerData.phone || (saved.provider===provider ? flowState.verifiedPhone : '') || '').trim();
      const displayName=document.querySelector('[data-auth-display-name]');
      if(displayName) displayName.textContent=[first,last].filter(Boolean).join(' ') || 'บัญชีของคุณ';
      const emailLabel=document.querySelector('[data-auth-email]'); if(emailLabel) emailLabel.textContent=email;
      for(const [field,value] of [['social-first-name',first],['social-last-name',last],['social-email',email],['social-birth-date',providerData.birthDate || ''],['social-phone',phone ? formatPhoneForDisplay(phone) : '']]){
        const input=document.getElementById(field);
        if(input) input.value=value;
      }
      show('social-confirm'); return true;

  return false;
}