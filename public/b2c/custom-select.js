(function(){
  var enhanced=[];
  var sequence=0;
  var enhancementFrame=0;

  /* Safari composites -webkit-backdrop-filter elements above later content no matter
     how high the overlay's z-index is, so the blurred screen header and footer painted
     over the bottom of the option sheet and swallowed its last option. components.css
     flattens that chrome while body.overlay-open is set.

     The flag is always DERIVED from what is on the page, never incremented, so two
     overlay types can never clear each other's state: closing a select while a modal
     is still up must leave the flag on. Modals are matched by selector rather than
     wired at each call site, so a new one is covered the day it is added. */
  var OVERLAY_SELECTORS='.custom-select.is-open,.modal-layer:not([hidden]),.map-modal:not([hidden]),[data-acceptplan-modal]:not([hidden]),[data-endcall-modal]:not([hidden])';
  function syncSheetFlag(){
    if(!document.body)return;
    document.body.classList.toggle('overlay-open',!!document.querySelector(OVERLAY_SELECTORS));
  }
  window.kraneSyncOverlayFlag=syncSheetFlag;

  function closeSelect(record,returnFocus){
    record.root.classList.remove('is-open');
    record.trigger.setAttribute('aria-expanded','false');
    syncSheetFlag();
    if(returnFocus)record.trigger.focus();
  }

  function closeOthers(current){
    enhanced.forEach(function(record){if(record!==current)closeSelect(record,false)});
  }

  function focusOption(record,index){
    var options=record.options.filter(function(option){return !option.disabled});
    if(!options.length)return;
    var safeIndex=Math.max(0,Math.min(index,options.length-1));
    options[safeIndex].focus();
  }

  function openSelect(record,focusSelected){
    if(record.select.disabled)return;
    closeOthers(record);
    record.root.classList.add('is-open');
    record.trigger.setAttribute('aria-expanded','true');
    syncSheetFlag();
    if(focusSelected){
      var selectedIndex=record.options.findIndex(function(option){return option.getAttribute('aria-selected')==='true'});
      window.requestAnimationFrame(function(){focusOption(record,selectedIndex<0?0:selectedIndex)});
    }
  }

  function syncSelect(record){
    var nativeOption=record.select.options[record.select.selectedIndex];
    record.value.textContent=nativeOption?nativeOption.textContent:'';
    record.options.forEach(function(option,index){option.setAttribute('aria-selected',String(index===record.select.selectedIndex))});
    record.trigger.disabled=record.select.disabled;
    record.root.classList.toggle('is-placeholder',!record.select.value);
  }

  function chooseOption(record,index){
    if(record.options[index].disabled)return;
    record.select.selectedIndex=index;
    syncSelect(record);
    record.select.dispatchEvent(new Event('change',{bubbles:true}));
    closeSelect(record,true);
  }

  /* The only proof an enhancement is alive is a record in `enhanced` whose DOM is
     still connected. Markup alone proves nothing: an innerHTML round-trip copies
     the wrapper and the data flag but not the listeners, which is how a select
     could look enhanced and ignore every tap until a refresh rebuilt it. */
  function liveRecordFor(select){
    for(var i=0;i<enhanced.length;i++){
      if(enhanced[i].select===select && enhanced[i].root.isConnected && enhanced[i].root.contains(select))return enhanced[i];
    }
    return null;
  }

  /* Put a select back as authored, discarding a dead wrapper so it can rebuild. */
  function unwrap(select){
    var wrapper=select.closest?select.closest('.custom-select'):null;
    if(!wrapper||!wrapper.parentNode)return;
    wrapper.parentNode.insertBefore(select,wrapper);
    wrapper.remove();
    enhanced=enhanced.filter(function(record){return record.select!==select});
  }

  /* Strip enhancement from a subtree, so cached markup never captures generated
     DOM. Mutates the node passed in, so callers hand it a clone. */
  function stripEnhancement(root){
    if(!root||!root.querySelectorAll)return root;
    Array.prototype.forEach.call(root.querySelectorAll('.custom-select select'),function(select){
      var wrapper=select.closest('.custom-select');
      if(wrapper&&wrapper.parentNode){wrapper.parentNode.insertBefore(select,wrapper);wrapper.remove()}
      delete select.dataset.customSelectReady;
      select.classList.remove('custom-select__native');
      select.removeAttribute('tabindex');
      select.removeAttribute('aria-hidden');
      if(!select.getAttribute('class'))select.removeAttribute('class');
    });
    return root;
  }

  function enhance(select){
    if(!(select instanceof HTMLSelectElement))return;
    /* Enhanced and provably alive: no-op, so enhance() is safely idempotent. */
    if(liveRecordFor(select))return;
    /* Wrapper but no live record means copied or restored markup. Tear the dead
       wrapper off and rebuild instead of trusting the flag. */
    unwrap(select);
    delete select.dataset.customSelectReady;
    select.dataset.customSelectReady='true';
    sequence+=1;

    var computed=window.getComputedStyle(select);
    var root=document.createElement('div');
    root.className='custom-select';
    root.style.width=select.style.width||(select.classList.contains('select')||select.classList.contains('input')?'100%':computed.width);
    root.style.setProperty('--custom-select-height',select.style.height||computed.height);

    var trigger=document.createElement('button');
    trigger.type='button';
    trigger.className='custom-select__trigger';
    trigger.id=(select.id||'custom-select-'+sequence)+'-trigger';
    trigger.setAttribute('role','combobox');
    trigger.setAttribute('aria-haspopup','listbox');
    trigger.setAttribute('aria-expanded','false');

    var value=document.createElement('span');
    value.className='custom-select__value';
    var chevron=document.createElement('span');
    chevron.className='custom-select__chevron';
    chevron.setAttribute('aria-hidden','true');
    trigger.append(value,chevron);

    var menu=document.createElement('div');
    menu.className='custom-select__menu';
    menu.id=(select.id||'custom-select-'+sequence)+'-listbox';
    menu.setAttribute('role','listbox');
    trigger.setAttribute('aria-controls',menu.id);

    var scrim=document.createElement('button');
    scrim.type='button';
    scrim.className='custom-select__scrim';
    scrim.tabIndex=-1;
    scrim.setAttribute('aria-label','Close options');

    var label=select.id?document.querySelector('label[for="'+select.id+'"]'):null;
    if(label){
      if(!label.id)label.id=(select.id||'custom-select-'+sequence)+'-label';
      trigger.setAttribute('aria-labelledby',label.id+' '+trigger.id);
      label.addEventListener('click',function(event){
        event.preventDefault();
        trigger.focus();
        openSelect(record,false);
      });
    }else{
      trigger.setAttribute('aria-label',select.getAttribute('aria-label')||'Select option');
    }

    var optionButtons=Array.from(select.options).map(function(nativeOption,index){
      var option=document.createElement('button');
      option.type='button';
      option.className='custom-select__option';
      option.setAttribute('role','option');
      option.textContent=nativeOption.textContent;
      option.disabled=nativeOption.disabled;
      option.hidden=nativeOption.disabled && !nativeOption.value;
      option.addEventListener('click',function(){chooseOption(record,index)});
      option.addEventListener('keydown',function(event){
        var enabled=record.options.filter(function(item){return !item.disabled});
        var current=enabled.indexOf(option);
        if(event.key==='ArrowDown'){event.preventDefault();focusOption(record,current+1)}
        if(event.key==='ArrowUp'){event.preventDefault();focusOption(record,current-1)}
        if(event.key==='Home'){event.preventDefault();focusOption(record,0)}
        if(event.key==='End'){event.preventDefault();focusOption(record,enabled.length-1)}
        if(event.key==='Escape'){event.preventDefault();closeSelect(record,true)}
      });
      menu.appendChild(option);
      return option;
    });

    select.parentNode.insertBefore(root,select);
    root.append(select,trigger,scrim,menu);
    select.classList.add('custom-select__native');
    select.tabIndex=-1;
    select.setAttribute('aria-hidden','true');

    var record={root:root,select:select,trigger:trigger,value:value,menu:menu,scrim:scrim,options:optionButtons};
    enhanced.push(record);
    syncSelect(record);

    trigger.addEventListener('click',function(){record.root.classList.contains('is-open')?closeSelect(record,false):openSelect(record,false)});
    trigger.addEventListener('keydown',function(event){
      if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();openSelect(record,true)}
      if(event.key==='Escape'&&record.root.classList.contains('is-open')){event.preventDefault();closeSelect(record,false)}
    });
    scrim.addEventListener('click',function(){closeSelect(record,true)});
    select.addEventListener('change',function(){syncSelect(record)});
    root.addEventListener('focusout',function(){window.setTimeout(function(){if(!root.contains(document.activeElement))closeSelect(record,false)},0)});
  }

  function enhanceAll(root){
    var scope=root&&root.querySelectorAll?root:document;
    /* Skip selects the CMS enhancer already wrapped: both scripts load in the back
       office, and without this guard every select gets two visible triggers. */
    if(scope.matches&&scope.matches('select:not([data-cms-select-ready])'))enhance(scope);
    scope.querySelectorAll('select:not([data-cms-select-ready])').forEach(enhance);
  }

  function scheduleEnhancement(root){
    window.cancelAnimationFrame(enhancementFrame);
    enhancementFrame=window.requestAnimationFrame(function(){
      enhancementFrame=0;
      enhanceAll(root&&root.isConnected?root:document);
    });
  }
  window.kraneEnhanceSelects=enhanceAll;
  window.kraneStripSelectEnhancement=stripEnhancement;
  window.kraneSyncSelects=function(root){
    enhanceAll(root||document);
    enhanced=enhanced.filter(function(record){
      if(!record.root.isConnected)return false;
      syncSelect(record);
      return true;
    });
    /* A screen change can tear out an open sheet, so re-derive the flag from
       what is still on the page instead of leaving the chrome flattened. */
    syncSheetFlag();
  };
  document.addEventListener('click',function(event){enhanced.forEach(function(record){if(!record.root.contains(event.target))closeSelect(record,false)})});
  document.addEventListener('krane:screenchange',function(event){
    window.kraneSyncSelects(event.detail&&event.detail.screen||document);
  });
  document.addEventListener('DOMContentLoaded',function(){
    enhanceAll(document);
    syncSheetFlag();
    /* Modals open and close by flipping [hidden] in a dozen places. Watch the
       attribute instead of editing every one of them, so the chrome flattens for
       modals exactly as it does for the option sheet. */
    new MutationObserver(syncSheetFlag).observe(document.body,{
      attributes:true,attributeFilter:['hidden'],subtree:true
    });
    /* Intake templates and restored drafts replace screen markup after startup.
       Observe those replacements so the first tap works without a page refresh. */
    new MutationObserver(function(mutations){
      var root=null;
      mutations.some(function(mutation){
        return Array.from(mutation.addedNodes).some(function(node){
          if(node.nodeType!==1)return false;
          if(node.matches('select')||node.querySelector('select')){root=mutation.target;return true}
          return false;
        });
      });
      if(root)scheduleEnhancement(root);
    }).observe(document.body,{childList:true,subtree:true});
  });
})();
