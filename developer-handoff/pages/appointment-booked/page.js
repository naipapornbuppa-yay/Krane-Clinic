/* appointment-booked: Owns appointment confirmation time activation; routing and appointment state are shared.
 * Source references in dependencies.json are relative to developer-handoff/.
 */

/** Activation/event branch; called in its original order by shared/lib/navigation.js. */
function kraneHandle_appointment_booked_lifecycle_14(){

      const when=document.querySelector('#appointment-booked [data-appointment-when]');
      if(when) when.textContent=flowState.appointmentWhen || '';

return false;
}
