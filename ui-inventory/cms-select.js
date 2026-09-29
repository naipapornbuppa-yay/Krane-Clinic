(function () {
  'use strict';

  var widgets = [];
  var serial = 0;
  var chevron = '<svg class="cms-select__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m8 10 4 4 4-4"></path></svg>';
  var check = '<svg class="cms-select__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m5 12 4 4 10-10"></path></svg>';

  function close(widget, restoreFocus) {
    if (!widget.open) return;
    widget.open = false;
    widget.wrapper.classList.remove('is-open');
    widget.trigger.setAttribute('aria-expanded', 'false');
    widget.menu.hidden = true;
    if (restoreFocus) widget.trigger.focus();
  }

  function closeAll(except) {
    widgets.forEach(function (widget) {
      if (widget !== except) close(widget, false);
    });
  }

  function placeMenu(widget) {
    var rect = widget.wrapper.getBoundingClientRect();
    var menu = widget.menu;
    menu.style.left = '0px';
    menu.style.top = '0px';
    menu.style.minWidth = rect.width + 'px';
    var width = Math.max(rect.width, Math.min(menu.scrollWidth, 320));
    var height = Math.min(menu.scrollHeight, 280);
    var left = Math.min(rect.left, window.innerWidth - width - 12);
    var top = rect.bottom + 6;
    if (top + height > window.innerHeight - 12 && rect.top - height - 6 > 12) top = rect.top - height - 6;
    menu.style.left = Math.max(12, left) + 'px';
    menu.style.top = Math.max(12, top) + 'px';
  }

  function open(widget, focusSelected) {
    if (widget.select.disabled) return;
    closeAll(widget);
    widget.open = true;
    widget.wrapper.classList.add('is-open');
    widget.trigger.setAttribute('aria-expanded', 'true');
    widget.menu.hidden = false;
    placeMenu(widget);
    if (focusSelected) {
      var selected = widget.menu.querySelector('[aria-selected="true"]');
      if (selected) selected.focus();
    }
  }

  function enhance(select) {
    if (select.dataset.cmsSelectReady === 'true' || select.multiple) return;
    select.dataset.cmsSelectReady = 'true';
    serial += 1;

    var originalStyle = select.getAttribute('style');
    var wrapper = document.createElement('div');
    wrapper.className = 'cms-select';
    if (select.hasAttribute('data-calendar-view-select')) wrapper.classList.add('cms-select--calendar');
    if (originalStyle) {
      wrapper.setAttribute('style', originalStyle);
      select.removeAttribute('style');
    }

    var parent = select.parentNode;
    parent.insertBefore(wrapper, select);
    wrapper.appendChild(select);
    select.classList.add('cms-select__native');
    select.tabIndex = -1;
    select.setAttribute('aria-hidden', 'true');

    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'cms-select__trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML = '<span class="cms-select__value"></span>' + chevron;

    var field = wrapper.closest('.field');
    var fieldLabel = field && field.querySelector('label');
    if (fieldLabel) {
      if (!fieldLabel.id) fieldLabel.id = 'cms-select-label-' + serial;
      trigger.setAttribute('aria-labelledby', fieldLabel.id);
    } else {
      trigger.setAttribute('aria-label', select.getAttribute('aria-label') || 'Select option');
    }

    var menu = document.createElement('div');
    menu.className = 'cms-select__menu';
    menu.id = 'cms-select-menu-' + serial;
    menu.setAttribute('role', 'listbox');
    menu.hidden = true;
    trigger.setAttribute('aria-controls', menu.id);

    Array.prototype.forEach.call(select.options, function (option) {
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'cms-select__option';
      item.setAttribute('role', 'option');
      item.dataset.value = option.value;
      item.disabled = option.disabled;
      var label = document.createElement('span');
      label.textContent = option.textContent.trim();
      item.appendChild(label);
      item.insertAdjacentHTML('beforeend', check);
      menu.appendChild(item);
    });

    wrapper.appendChild(trigger);
    document.body.appendChild(menu);

    var widget = {select:select, wrapper:wrapper, trigger:trigger, menu:menu, open:false};
    widgets.push(widget);

    function sync() {
      var option = select.options[select.selectedIndex] || select.options[0];
      if (!option) return;
      trigger.querySelector('.cms-select__value').textContent = option.textContent.trim();
      wrapper.classList.toggle('is-disabled', select.disabled);
      trigger.disabled = select.disabled;
      Array.prototype.forEach.call(menu.querySelectorAll('.cms-select__option'), function (item, index) {
        var selected = index === select.selectedIndex;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-selected', selected ? 'true' : 'false');
        var label = item.querySelector('span');
        if (select.options[index] && label) label.textContent = select.options[index].textContent.trim();
      });
    }

    trigger.addEventListener('click', function () {
      if (widget.open) close(widget, false); else open(widget, false);
    });
    trigger.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        open(widget, true);
      }
    });
    menu.addEventListener('click', function (event) {
      var item = event.target.closest('.cms-select__option');
      if (!item || item.disabled) return;
      select.value = item.dataset.value;
      select.dispatchEvent(new Event('change', {bubbles:true}));
      sync();
      close(widget, true);
    });
    menu.addEventListener('keydown', function (event) {
      var items = Array.prototype.filter.call(menu.querySelectorAll('.cms-select__option'), function (item) { return !item.disabled; });
      var index = items.indexOf(document.activeElement);
      if (event.key === 'Escape') { event.preventDefault(); close(widget, true); return; }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        var delta = event.key === 'ArrowDown' ? 1 : -1;
        items[(index + delta + items.length) % items.length].focus();
      }
      if (event.key === 'Home' && items.length) { event.preventDefault(); items[0].focus(); }
      if (event.key === 'End' && items.length) { event.preventDefault(); items[items.length - 1].focus(); }
    });
    select.addEventListener('change', sync);
    select.addEventListener('cms-sync', sync);
    new MutationObserver(sync).observe(select, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:['disabled']});
    sync();
  }

  Array.prototype.forEach.call(document.querySelectorAll('select.select, select[data-calendar-view-select]'), enhance);

  document.addEventListener('click', function (event) {
    widgets.forEach(function (widget) {
      if (!widget.wrapper.contains(event.target) && !widget.menu.contains(event.target)) close(widget, false);
    });
  });
  window.addEventListener('resize', function () { closeAll(); });
  window.addEventListener('scroll', function () { closeAll(); }, true);
  window.kraneSyncSelects = function () {
    widgets.forEach(function (widget) { widget.select.dispatchEvent(new Event('cms-sync')); });
  };
})();
