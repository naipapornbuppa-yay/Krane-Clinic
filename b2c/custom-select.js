(function(){
  var enhanced=[];
  var sequence=0;

  function closeSelect(record,returnFocus){
    record.root.classList.remove('is-open');
    record.trigger.setAttribute('aria-expanded','false');
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

  function enhance(select){
    if(select.dataset.customSelectReady==='true')return;
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

    var label=select.id?document.querySelector('label[for="'+select.id+'"]'):null;
    if(label){
      if(!label.id)label.id=(select.id||'custom-select-'+sequence)+'-label';
      trigger.setAttribute('aria-labelledby',label.id+' '+trigger.id);
      label.addEventListener('click',function(event){event.preventDefault();trigger.focus()});
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
    root.append(select,trigger,menu);
    select.classList.add('custom-select__native');
    select.tabIndex=-1;
    select.setAttribute('aria-hidden','true');

    var record={root:root,select:select,trigger:trigger,value:value,menu:menu,options:optionButtons};
    enhanced.push(record);
    syncSelect(record);

    trigger.addEventListener('click',function(){record.root.classList.contains('is-open')?closeSelect(record,false):openSelect(record,false)});
    trigger.addEventListener('keydown',function(event){
      if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();openSelect(record,true)}
      if(event.key==='Escape'&&record.root.classList.contains('is-open')){event.preventDefault();closeSelect(record,false)}
    });
    select.addEventListener('change',function(){syncSelect(record)});
    root.addEventListener('focusout',function(){window.setTimeout(function(){if(!root.contains(document.activeElement))closeSelect(record,false)},0)});
  }

  function enhanceAll(root){
    var scope=root&&root.querySelectorAll?root:document;
    /* Skip selects the CMS enhancer already wrapped: both scripts load in the back
       office, and without this guard every select gets two visible triggers. */
    scope.querySelectorAll('select:not([data-native-select]):not([data-cms-select-ready])').forEach(enhance);
  }
  window.kraneEnhanceSelects=enhanceAll;
  document.addEventListener('click',function(event){enhanced.forEach(function(record){if(!record.root.contains(event.target))closeSelect(record,false)})});
  document.addEventListener('DOMContentLoaded',function(){enhanceAll(document)});
})();
