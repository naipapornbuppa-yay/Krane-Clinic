/* Shared lexical runtime: load through the handoff build; see DEPENDENCIES.md. */

  /* These routes still go through matching (New, 31 Aug: "while matching doctor
     if system flag no doctor is available it will automatically force user to
     schedule appointment"). Skipping straight to the booking screen showed the
     time picker but never the moment that sends you there, which is the half
     that has never been user-tested. doctorAvailable=false makes the matching
     screen fail on its timer and hand over to #appointment. */
  function directClinicalStartTarget(){
    doctorAvailable = !needsAppointment();
    return 'matching';
  }

  /* Client, 6 Oct: nurse screening had two screens of its own that duplicated
     the doctor consultation — if it comes back it reuses #matching and the
     consultation screens rather than a second pair. */
  function partnerClinicalStartTarget(){
    doctorAvailable=true;
    return 'matching';
  }

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_matching_demoNoMatch(e, noMatch) {
      if(noMatch.closest('.rail')){
        seedClinicalDemoStage('matching');
        history=seededHistory('matching');
      }
      doctorAvailable = false;
      show('matching',!noMatch.closest('.rail'));
      return true;

  return false;
}
