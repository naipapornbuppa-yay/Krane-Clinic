/* ============================================================
   KRANE CMS: rounded date and time pickers
   ------------------------------------------------------------
   The browser's own date and time popovers are square, blue, English-only and
   cannot be styled, so they broke the surface system everywhere a shift or a
   working hour is set. This enhances the native inputs in place: the real
   <input> stays in the DOM and keeps holding the value, so every existing
   script that reads `.value` or listens for `change` keeps working unchanged.

   Follows the same shape as cms-select.js: a wrapper, a button trigger, and a
   fixed-position popover appended to the body so it escapes modal clipping.
   ============================================================ */
(function () {
  'use strict';

  var widgets = [];
  var serial = 0;

  var ICON_DATE = '<svg class="cms-picker__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"></rect><path d="M3 10h18M8 3v4M16 3v4"></path></svg>';
  var ICON_TIME = '<svg class="cms-picker__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>';

  function isThai() {
    var on = document.querySelector('.lang__opt[data-lng="th"].is-active');
    return !!on || document.documentElement.lang === 'th';
  }

  function pad(value) { return String(value).padStart(2, '0'); }
  function keyOf(date) { return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()); }
  function parseKey(value) {
    var parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
    if (!parts) return null;
    return new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]), 12, 0, 0);
  }
  function sameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  /* Thai dates use the Buddhist calendar, matching the doctor calendar header. */
  function formatDate(date) {
    if (!date) return '';
    var locale = isThai() ? 'th-TH-u-ca-buddhist' : 'en-GB';
    return new Intl.DateTimeFormat(locale, {day:'numeric', month:'short', year:'numeric'}).format(date);
  }
  function formatMonth(date) {
    var locale = isThai() ? 'th-TH-u-ca-buddhist' : 'en-GB';
    return new Intl.DateTimeFormat(locale, {month:'long', year:'numeric'}).format(date);
  }
  function weekdayNames() {
    return isThai()
      ? ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  }
  function todayLabel() { return isThai() ? 'วันนี้' : 'Today'; }

  function close(widget, restoreFocus) {
    if (!widget.open) return;
    widget.open = false;
    widget.wrapper.classList.remove('is-open');
    widget.trigger.setAttribute('aria-expanded', 'false');
    widget.pop.hidden = true;
    if (restoreFocus) widget.trigger.focus();
  }
  function closeAll(except) {
    widgets.forEach(function (widget) { if (widget !== except) close(widget, false); });
  }

  function place(widget) {
    var rect = widget.wrapper.getBoundingClientRect();
    var pop = widget.pop;
    pop.style.left = '0px';
    pop.style.top = '0px';
    var width = Math.max(rect.width, pop.offsetWidth);
    var height = Math.min(pop.scrollHeight, 340);
    var left = Math.min(rect.left, window.innerWidth - width - 12);
    var top = rect.bottom + 6;
    if (top + height > window.innerHeight - 12 && rect.top - height - 6 > 12) top = rect.top - height - 6;
    pop.style.left = Math.max(12, left) + 'px';
    pop.style.top = Math.max(12, top) + 'px';
  }

  function open(widget) {
    if (widget.input.disabled) return;
    closeAll(widget);
    widget.open = true;
    widget.wrapper.classList.add('is-open');
    widget.trigger.setAttribute('aria-expanded', 'true');
    widget.pop.hidden = false;
    widget.render();
    place(widget);
    if (widget.kind === 'time') {
      var selected = widget.pop.querySelector('.cms-picker__time.is-selected');
      if (selected) widget.pop.querySelector('.cms-picker__times').scrollTop = selected.offsetTop - 96;
    }
  }

  function commit(widget, value) {
    widget.input.value = value;
    widget.input.dispatchEvent(new Event('input', {bubbles:true}));
    widget.input.dispatchEvent(new Event('change', {bubbles:true}));
    widget.sync();
  }

  /* ---- date ---- */
  function buildDate(widget) {
    var pop = widget.pop;
    pop.innerHTML =
      '<div class="cms-picker__head">' +
        '<button type="button" class="cms-picker__nav" data-shift="-1" aria-label="เดือนก่อนหน้า">‹</button>' +
        '<strong class="cms-picker__month"></strong>' +
        '<button type="button" class="cms-picker__nav" data-shift="1" aria-label="เดือนถัดไป">›</button>' +
      '</div>' +
      '<div class="cms-picker__weekdays"></div>' +
      '<div class="cms-picker__grid"></div>' +
      '<div class="cms-picker__foot"><button type="button" class="cms-picker__today"></button></div>';

    widget.render = function () {
      var selected = parseKey(widget.input.value);
      var today = new Date(); today.setHours(12, 0, 0, 0);
      if (!widget.cursor) widget.cursor = new Date(selected || today);
      pop.querySelector('.cms-picker__month').textContent = formatMonth(widget.cursor);
      pop.querySelector('.cms-picker__today').textContent = todayLabel();
      pop.querySelector('.cms-picker__weekdays').innerHTML =
        weekdayNames().map(function (day) { return '<span>' + day + '</span>'; }).join('');

      var first = new Date(widget.cursor.getFullYear(), widget.cursor.getMonth(), 1, 12, 0, 0);
      var offset = (first.getDay() + 6) % 7;   // weeks start on Monday, as in the calendar
      var cells = '';
      for (var index = 0; index < 42; index++) {
        var cell = new Date(first);
        cell.setDate(1 - offset + index);
        var out = cell.getMonth() !== widget.cursor.getMonth();
        var classes = 'cms-picker__day';
        if (out) classes += ' is-out';
        if (sameDay(cell, today)) classes += ' is-today';
        if (selected && sameDay(cell, selected)) classes += ' is-selected';
        cells += '<button type="button" class="' + classes + '" data-day="' + keyOf(cell) + '"' +
          (selected && sameDay(cell, selected) ? ' aria-current="date"' : '') + '>' + cell.getDate() + '</button>';
      }
      pop.querySelector('.cms-picker__grid').innerHTML = cells;
    };

    pop.addEventListener('click', function (event) {
      var nav = event.target.closest('[data-shift]');
      if (nav) {
        widget.cursor.setMonth(widget.cursor.getMonth() + Number(nav.dataset.shift));
        widget.render();
        return;
      }
      if (event.target.closest('.cms-picker__today')) {
        var today = new Date(); today.setHours(12, 0, 0, 0);
        widget.cursor = new Date(today);
        commit(widget, keyOf(today));
        close(widget, true);
        return;
      }
      var day = event.target.closest('[data-day]');
      if (day) {
        widget.cursor = parseKey(day.dataset.day);
        commit(widget, day.dataset.day);
        close(widget, true);
      }
    });

    widget.sync = function () {
      var selected = parseKey(widget.input.value);
      widget.value.textContent = selected ? formatDate(selected) : (isThai() ? 'เลือกวันที่' : 'Pick a date');
      widget.wrapper.classList.toggle('is-empty', !selected);
      widget.trigger.disabled = widget.input.disabled;
      widget.wrapper.classList.toggle('is-disabled', widget.input.disabled);
    };
  }

  /* ---- time ---- */
  function buildTime(widget) {
    var pop = widget.pop;
    pop.innerHTML = '<div class="cms-picker__times" role="listbox"></div>';
    var list = pop.querySelector('.cms-picker__times');

    widget.render = function () {
      var current = widget.input.value;
      var rows = '';
      // 15 minute steps: fine enough for clinic hours and short enough to scan.
      for (var minutes = 0; minutes < 24 * 60; minutes += 15) {
        var value = pad(Math.floor(minutes / 60)) + ':' + pad(minutes % 60);
        rows += '<button type="button" class="cms-picker__time' + (value === current ? ' is-selected' : '') +
          '" role="option" aria-selected="' + (value === current) + '" data-time="' + value + '">' + value + '</button>';
      }
      list.innerHTML = rows;
    };

    pop.addEventListener('click', function (event) {
      var option = event.target.closest('[data-time]');
      if (!option) return;
      commit(widget, option.dataset.time);
      close(widget, true);
    });

    widget.sync = function () {
      widget.value.textContent = widget.input.value || (isThai() ? 'เลือกเวลา' : 'Pick a time');
      widget.wrapper.classList.toggle('is-empty', !widget.input.value);
      widget.trigger.disabled = widget.input.disabled;
      widget.wrapper.classList.toggle('is-disabled', widget.input.disabled);
    };
  }

  function enhance(input) {
    if (input.dataset.cmsPickerReady === 'true') return;
    input.dataset.cmsPickerReady = 'true';
    serial += 1;

    var kind = input.type === 'date' ? 'date' : 'time';
    var wrapper = document.createElement('div');
    wrapper.className = 'cms-picker cms-picker--' + kind;

    var originalStyle = input.getAttribute('style');
    if (originalStyle) { wrapper.setAttribute('style', originalStyle); input.removeAttribute('style'); }

    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    input.classList.add('cms-picker__native');
    input.tabIndex = -1;
    input.setAttribute('aria-hidden', 'true');

    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'cms-picker__trigger';
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML = '<span class="cms-picker__value"></span>' + (kind === 'date' ? ICON_DATE : ICON_TIME);

    var field = wrapper.closest('.field');
    var fieldLabel = field && field.querySelector('label');
    if (fieldLabel) {
      if (!fieldLabel.id) fieldLabel.id = 'cms-picker-label-' + serial;
      trigger.setAttribute('aria-labelledby', fieldLabel.id);
    } else {
      trigger.setAttribute('aria-label', input.getAttribute('aria-label') || (kind === 'date' ? 'Date' : 'Time'));
    }
    wrapper.appendChild(trigger);

    var pop = document.createElement('div');
    pop.className = 'cms-picker__pop cms-picker__pop--' + kind;
    pop.id = 'cms-picker-pop-' + serial;
    pop.hidden = true;
    trigger.setAttribute('aria-controls', pop.id);
    document.body.appendChild(pop);

    var widget = {input:input, wrapper:wrapper, trigger:trigger, pop:pop, kind:kind, open:false, cursor:null};
    widget.value = trigger.querySelector('.cms-picker__value');
    if (kind === 'date') buildDate(widget); else buildTime(widget);
    widgets.push(widget);

    trigger.addEventListener('click', function () {
      if (widget.open) close(widget, false); else open(widget);
    });
    trigger.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open(widget);
      }
    });
    input.addEventListener('change', widget.sync);
    widget.sync();
  }

  function enhanceAll() {
    Array.prototype.forEach.call(
      document.querySelectorAll('input[type="date"], input[type="time"]'),
      enhance
    );
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhanceAll);
  else enhanceAll();

  document.addEventListener('click', function (event) {
    if (event.target.closest('.lang__opt')) {
      // Thai and English format the same value differently, so relabel every trigger.
      setTimeout(function () { widgets.forEach(function (widget) { widget.sync(); }); }, 0);
    }
    widgets.forEach(function (widget) {
      if (!widget.wrapper.contains(event.target) && !widget.pop.contains(event.target)) close(widget, false);
    });
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeAll();
  });
  window.addEventListener('resize', function () { closeAll(); });
  /* Clicking a field can scroll it into view, so closing on any scroll shut the
     popover on the same click that opened it. Follow the field instead, and only
     close once the field itself has left the viewport. */
  window.addEventListener('scroll', function (event) {
    widgets.forEach(function (widget) {
      if (!widget.open) return;
      if (widget.pop.contains(event.target)) return;
      var rect = widget.wrapper.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) close(widget, false);
      else place(widget);
    });
  }, true);
  window.kraneSyncPickers = function () { widgets.forEach(function (widget) { widget.sync(); }); };
})();
