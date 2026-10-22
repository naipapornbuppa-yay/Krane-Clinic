/* Shared lexical runtime: load through the handoff build; see DEPENDENCIES.md. */

  function phoneFieldDial(field){
    return String(field?.querySelector('[data-phone-dial]')?.textContent || '+66').replace('+','');
  }

  function buildPhoneCountryMenu(field){
    if(field.querySelector('[data-phone-country-menu]')) return;
    const menu=document.createElement('div');
    menu.className='phone-field__menu';
    menu.hidden=true;
    menu.setAttribute('data-phone-country-menu','');
    const search=document.createElement('input');
    search.className='input phone-field__search';
    search.type='search';
    search.placeholder='ค้นหาประเทศ';
    search.setAttribute('data-phone-country-search','');
    const list=document.createElement('ul');
    list.className='phone-field__list';
    list.setAttribute('role','listbox');
    PHONE_COUNTRIES.forEach(([code,name,dial,flag]) => {
      const item=document.createElement('li');
      const button=document.createElement('button');
      button.type='button';
      button.className='phone-field__option';
      button.setAttribute('role','option');
      button.dataset.phoneCountry=code;
      button.dataset.phoneDial=dial;
      button.dataset.phoneFlag=flag;
      button.dataset.phoneName=name;
      button.innerHTML='<span class="phone-field__option-flag">'+flag+'</span>'+
        '<span class="phone-field__option-name">'+name+'</span>'+
        '<span class="phone-field__option-dial">+'+dial+'</span>';
      item.append(button);
      list.append(item);
    });
    menu.append(search,list);
    field.append(menu);
  }

  function closePhoneCountryMenus(except){
    document.querySelectorAll('[data-phone-field]').forEach(field => {
      if(field===except) return;
      const menu=field.querySelector('[data-phone-country-menu]');
      if(menu) menu.hidden=true;
      field.querySelector('[data-phone-country-trigger]')?.setAttribute('aria-expanded','false');
    });
  }


  function normalizePhone(value){
    return String(value || '').replace(/\D/g,'');
  }

  function formatThaiPhone(value){
    const digits=normalizePhone(value).slice(0,10);
    if(digits.length<=3) return digits;
    if(digits.length<=6) return digits.slice(0,3)+'-'+digits.slice(3);
    return digits.slice(0,3)+'-'+digits.slice(3,6)+'-'+digits.slice(6);
  }

  function formatPhoneForDisplay(value){
    const raw=String(value || '').trim();
    const digits=normalizePhone(raw);
    const usesThaiCountryCode=raw.startsWith('+66') || (/^66[689]\d{8}$/.test(digits));
    if(!usesThaiCountryCode) return formatThaiPhone(digits);
    const national=digits.slice(2,11);
    if(!national) return '+66';
    if(national.length<=2) return '+66 '+national;
    if(national.length<=5) return '+66 '+national.slice(0,2)+' '+national.slice(2);
    return '+66 '+national.slice(0,2)+' '+national.slice(2,5)+' '+national.slice(5);
  }

  function clearPhoneOtpContext(){
    flowState.phoneOtpPending=false;
    flowState.pendingPhone='';
    flowState.phoneOtpReturn='';
    flowState.phoneOtpDestination='';
    flowState.phoneOtpCompletesAuth=false;
  }

  /* The landing header and the application used to recognise two different
     session records. A patient authenticated by the landing/account provider
     could therefore open their profile successfully, then be sent through
     sign-up again by the first clinical action. Hydrate the app prerequisites
     from that same authenticated session once, so every profile route sees the
     patient as the returning account the header already showed. */
  function restoreAuthenticatedAccount(){
    const storedAuth=readSessionJson(AUTH_PROFILE_KEY);
    if(!storedAuth.authenticated){
      isAuthenticated=Boolean(flowState.accountCreated && flowState.otpVerified && flowState.passwordSet);
      return;
    }
    Object.assign(flowState,{
      accountCreated:true,
      otpVerified:true,
      returningIdentityValid:true,
      consentsComplete:true,
      patientInfoComplete:true
    });
    if(!flowState.authProvider && storedAuth.provider) flowState.authProvider=storedAuth.provider;
    if(!flowState.profileDisplayName && storedAuth.displayName) flowState.profileDisplayName=storedAuth.displayName;
    if(!flowState.patientName && storedAuth.displayName) flowState.patientName=storedAuth.displayName;
    if(!flowState.profilePictureUrl && storedAuth.pictureUrl) flowState.profilePictureUrl=storedAuth.pictureUrl;
    isAuthenticated=true;
    persistFlowState();
  }

  function nextAfterAuthentication(destination){
    if(!flowState.draftReady) return destination || postAuthNext || 'profile';
    if(!flowState.consentsComplete) return 'consent-terms';
    if(flowState.returningIdentityValid) return destination || postAuthNext || 'profile';
    if(!flowState.patientInfoComplete) return 'patient-info';
    if(identityRequired() && !flowState.identityVerified) return 'identity';
    return destination || postAuthNext || directClinicalStartTarget();
  }

  /* Signing in is signing in, draft or no draft (client, 19 Aug). These flags
     used to be set only when an intake draft existed, so logging in from the
     landing left the session anonymous and the next "ปรึกษา" asked for an
     account all over again. */
  function applyAuthenticatedAccount({returning=false}={}){
    isAuthenticated = true;
    flowState.accountCreated=true;
    flowState.otpVerified=true;
    /* Every finished route lands here: a saved password, a social account, or
       a returning log-in. A half-finished sign-up does not. */
    flowState.passwordSet=true;
    if(returning){
      /* An existing account gave its PDPA consent when it was created. Consent
         belongs to signup, not to every login. */
      flowState.returningIdentityValid=true;
      flowState.consentsComplete=true;
      flowState.signupDonePending=false;
    }
    if(flowState.returningIdentityValid) flowState.patientInfoComplete=true;
    // The delivery recipient defaults to the account holder, so the name has to
    // be on the session as soon as the account is.
    const first=document.getElementById('social-first-name')?.value.trim() || '';
    const last=document.getElementById('social-last-name')?.value.trim() || '';
    const fullName=[first,last].filter(Boolean).join(' ')
      || patientNameValue();
    if(fullName && (flowState.authProvider || !flowState.patientName)) flowState.patientName=fullName;
    if(fullName && flowState.authProvider) flowState.profileDisplayName=fullName;
    const phone=document.getElementById('social-phone')?.value.trim()
      || document.getElementById('login-phone')?.value.trim() || '';
    if(!flowState.verifiedPhone && phone) flowState.verifiedPhone=normalizePhone(phone);
    persistFlowState();
    writeSessionJson(AUTH_PROFILE_KEY,{
      authenticated:true,
      provider:flowState.authProvider || '',
      displayName:flowState.profileDisplayName || flowState.patientName || 'ผู้ใช้ Krane',
      firstName:flowState.authProvider ? first : patientNameValue().split(/\s+/)[0] || '',
      lastName:flowState.authProvider ? last : patientNameValue().split(/\s+/).slice(1).join(' '),
      phone:flowState.verifiedPhone || '',
      email:flowState.authProvider ? (document.getElementById('social-email')?.value.trim() || '') : '',
      birthDate:flowState.authProvider ? (document.getElementById('social-birth-date')?.value || '') : '',
      pictureUrl:flowState.lineProfilePictureUrl || flowState.profilePictureUrl || ''
    });
  }

  function passwordRuleState(value){
    return Object.entries(PASSWORD_RULES).map(([name,test]) => [name,test(value)]);
  }




  function completeAuthentication(destination){
    const returning=socialCompletesAuth || Boolean(flowState.returningLogin);
    applyAuthenticatedAccount({returning});
    if(!returning){
      flowState.signupDonePending=true;
      persistFlowState();
      show('consent-terms');
      return;
    }
    if(flowState.draftReady){
      show(nextAfterAuthentication(destination));
      return;
    }
    show(destination || postAuthNext || 'profile');
  }
