/* Legacy flow/visual tests explicitly start after a necessary-only choice.
   cookie-consent-qa.mjs separately exercises genuine first-visit consent UI. */
export async function necessaryConsent(context){
 await context.addInitScript(()=>{
  try{if(!localStorage.getItem('krane_cookie_preferences_v1'))localStorage.setItem('krane_cookie_preferences_v1',JSON.stringify({version:1,necessary:true,analytics:false,advertising:false,decision:'necessary_only',savedAt:'2026-10-27T00:00:00.000Z'}));}catch{}
 });
}
