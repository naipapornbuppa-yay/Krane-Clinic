function kraneHandle_appointment_booked_lifecycle_14(){

      const when=document.querySelector('#appointment-booked [data-appointment-when]');
      if(when) when.textContent=flowState.appointmentWhen || '';

return false;
}