/** Prototype pause state only. The page owns modal/form rendering. */
function kraneCreateProgramPauseState(){
 const key='krane.paused-programs.v1';
 let paused={};try{paused=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch{}
 const state={key,paused};
 state.isPaused=category=>Boolean(state.paused[category] && state.paused[category].state!=='active');
 state.hasCancelledFollowup=category=>Boolean(state.paused[category]);
 state.appointmentFor=category=>!state.isPaused(category)?state.paused[category]?.appointmentAt:null;
 return state;
}
