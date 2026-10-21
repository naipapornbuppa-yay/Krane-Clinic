/* Shared lexical runtime: load through the handoff build; see DEPENDENCIES.md. */

  function intakeSkipped(id){
    if(intakeConcernKey()==='general' && GENERAL_COMPACT_SKIPPED_SCREENS.includes(id)) return true;
    // Weight's GLP-1 exclusions are a safety sheet over the last question, not a page.
    if(id==='intake4' && intakeConcernKey()==='weight' && flowState.entryChannel!=='partner') return true;
    if(!INTAKE_CONCERN_SPECIFIC.includes(id)) return false;
    try { return !((intakeTemplates[intakeConcernKey()] || {})[id]); }
    catch(e){ return false; }
  }
