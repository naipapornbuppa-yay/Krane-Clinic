/* Shared lexical runtime: load through the handoff build; see DEPENDENCIES.md. */

  function revealConsultationSummary(){
    typingTimer=null;
    const activeId=document.querySelector('.screen.active')?.id;
    if(!['consult','video'].includes(activeId)) return;
    const chat=document.getElementById('consult');
    const typing=chat?.querySelector('[data-typing]');
    const status=chat?.querySelector('[data-rx-bar]');
    const plan=chat?.querySelector('[data-plan-card]');
    if(!plan) return;
    if(typing) typing.style.display='none';
    if(status) status.style.display='none';
    plan.removeAttribute('data-wait-hidden');
    plan.classList.add('reveal-in');
    plan.dataset.shown='1';
    if(activeId==='video'){
      syncConsultationSummaryUnread(true);
    }else{
      syncConsultationSummaryUnread(false);
      const body=chat.querySelector('.chat-body');
      if(body) body.scrollTop=body.scrollHeight;
    }
  }

  function scheduleConsultationSummary(){
    /* The embedded landing showcase demonstrates the conversation only. The
       real consultation still reveals the prescription summary as normal. */
    if(document.getElementById('consult')?.classList.contains('consult--showcase-chat')) return;
    const plan=document.querySelector('#consult [data-plan-card]');
    if(!plan || plan.dataset.shown || typingTimer) return;
    typingTimer=setTimeout(revealConsultationSummary,reduceMotion ? 300 : 1900);
  }

/** Initialization is called by shared/runtime.js at the original dependency-safe position. */
function kraneInit_consult_675(){
  /* QA deep links can open a checkpoint in a clean tab without weakening the real
     sequence guards. The query explicitly opts into a seeded demo state; an ordinary
     direct hash still returns the user to the first incomplete prerequisite. */
  (function seedDemoFromQuery(){
    const params=new URLSearchParams(location.search);
    const demoStage=params.get('demoStage');
    const demoStatus=params.get('demoStatus');
    const demoCategory=params.get('category');
    const showcaseChat=params.get('showcaseChat')==='1';
    if(showcaseChat) document.getElementById('consult')?.classList.add('consult--showcase-chat');
    if(demoCategory) setSelectedCategory(demoCategory);
    if(demoStage){
      seedPartnerStage(demoStage);
      seedClinicalDemoStage(demoStage);
      window.kraneDemoStage=demoStage;
    }
    if(demoStatus){
      seedClinicalDemoStage('tracking');
      window.kraneDemoStatus=demoStatus;
    }
  })();
}


/** Initialization is called by shared/runtime.js at the original dependency-safe position. */
function kraneInit_consult_677(){

  /* The landing embeds these screens as a showcase, not as something to press:
     each phone plays a short loop of the real app and takes no input at all
     (the iframe is pointer-events:none). Only a demo deep link starts a loop,
     so a real consultation is never navigated away from. */
  (function playLandingShowcase(){
    const stage=window.kraneDemoStage;
    if(!stage) return;
    const showcaseQuestion=new URLSearchParams(location.search).get('showcaseQuestion');
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    /* The intake demo is visual-only: select real option elements so the
       component's production selected state is shown, but do not dispatch a
       click (which would save a draft). The following beat changes the real
       screen, making the mockup read as a short intake rather than a poster. */
    const animateIntakeAnswers=(indexes=[0]) => {
      const screen=document.querySelector('.screen.active');
      if(!screen || !INTAKE_ONE_QUESTION_SCREENS.includes(screen.id)) return;
      const scope=screen.querySelector('[data-intake-question]:not([hidden])') || screen;
      const options=[...scope.querySelectorAll('.option[data-select],.option[data-multi]')];
      if(!options.length) return;
      options.forEach(option => {
        option.setAttribute('aria-selected','false');
        option.classList.remove('is-showcase-tap');
      });
      indexes.forEach((index,order) => {
        const option=options[Math.min(index,options.length-1)];
        window.setTimeout(() => {
          if(!screen.classList.contains('active')) return;
          option.setAttribute('aria-selected','true');
          option.classList.remove('is-showcase-tap');
          void option.offsetWidth;
          option.classList.add('is-showcase-tap');
          window.setTimeout(() => option.classList.remove('is-showcase-tap'),620);
        },520+(order*650));
      });
    };
    /* A beat either moves to another screen or changes something on the screen
       that is already open. Nothing here writes to storage: the tracking beat
       sets the flag in memory and re-renders, it does not persist an order. */
    const showcases={
      intake1:[
        {screen:'intake1',hold:2600,after(){animateIntakeAnswers([0]);}},
        {screen:'intake2',hold:2600,after(){animateIntakeAnswers([1]);}},
        {screen:'intake3',hold:3000,after(){animateIntakeAnswers([0,1]);}}
      ],
      video:[
        {screen:'video',hold:3200},
        {screen:'consult',hold:4200,before(){
          // Replay the typing beat each pass, rather than reopening a thread
          // that already has the medicine list sitting in it.
          const plan=document.querySelector('#consult [data-plan-card]');
          if(plan) delete plan.dataset.seenInChat;
        }}
      ]
      /* No tracking beat. It flipped the order between delivered and not every
         three seconds, which is the one thing a tracking screen must never seem
         to do on its own; the running connector on the active step carries the
         motion instead (client, 13 Sep). */
    };
    const beats=showcases[stage];
    if(!beats || beats.length<2) return;
    let step=1;
    /* A beat must never trip a route guard. The intake pages a category actually
       has vary, so asking for one it does not have used to redirect and raise
       the "finish the required steps first" warning inside a phone that is only
       meant to be looked at. A beat that would redirect is skipped instead. */
    const reachable=id => normalizeScreenTarget(requiredRouteFor(id))===normalizeScreenTarget(id);
    const tick=() => {
      const beat=beats[step % beats.length];
      step+=1;
      if(beat.before) beat.before();
      if(beat.screen && beat.screen!==document.querySelector('.screen.active')?.id && reachable(beat.screen)){
        show(beat.screen,false);
      }
      if(beat.after) beat.after();
      setTimeout(tick,beat.hold);
    };
    /* The query keeps the first frame on the goal question, but no longer
       freezes it. Show its first answer being pressed before screen 2 enters. */
    if(stage==='intake1' && showcaseQuestion==='goal') animateIntakeAnswers([0]);
    setTimeout(tick,1800);
  })();
}

