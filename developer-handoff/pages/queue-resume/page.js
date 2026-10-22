/* queue-resume: Page-specific functions, rendering and lifecycle are in page.js; cross-page state/services and generic components remain shared.
 * Source references in dependencies.json are relative to developer-handoff/.
 */

// Called once at the original bootstrap position.
function kraneInit_queue_resume_queueActions() {
document.addEventListener('click',event => {
    if(event.target.closest('[data-queue-close]')){
      if(pendingQueue){pendingQueue.suspended=true;savePendingQueue()}
      clearTimeout(waitTimer); clearInterval(waitCountdownTimer); stopWaitroomEntryWindow();
      queueDismissOnce=true;show('landing');
    }
    if(event.target.closest('[data-queue-resume]')){
      if(pendingQueue){pendingQueue.suspended=false;savePendingQueue()}
      show('waitroom');
    }
    if(event.target.closest('[data-queue-book]')){
      saveIntakeDraft();
      persistFlowState();
      clearTimeout(waitTimer);
      clearInterval(waitCountdownTimer);
      stopWaitroomEntryWindow();
      pendingQueue=null;
      if(!queuePreview) try{localStorage.removeItem(QUEUE_KEY)}catch(_){}
      show('appointment');
    }
  });
}
