/* activity: Page-specific functions, rendering and lifecycle are in page.js; cross-page state/services and generic components remain shared.
 * Source references in dependencies.json are relative to developer-handoff/.
 */

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_activity_filter(e, activityFilter) {
      const want=activityFilter.dataset.activityFilter;
      document.querySelectorAll('[data-activity-filter]').forEach(b => {
        const current=b===activityFilter;
        b.classList.toggle('is-current',current);
        b.setAttribute('aria-selected',String(current));
      });
      let shown=0;
      document.querySelectorAll('#activity [data-activity-type]').forEach(card => {
        const match=want==='all' || card.dataset.activityType===want;
        card.hidden=!match;
        if(match) shown+=1;
      });
      const empty=document.querySelector('[data-activity-empty]');
      if(empty) empty.hidden=shown>0;
      return true;

  return false;
}
