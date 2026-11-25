/* Mobile DOB values stay ISO, without any interactive native date control. */
(() => {
  const mobile = matchMedia('(max-width:760px), (pointer:coarse)');
  const reducedMotion = matchMedia('(prefers-reduced-motion:reduce)');
  const dateParts = value => value.split('-').map(Number);
  const format = (value, english) => {
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return '';
    const [year,month,day]=dateParts(value);
    return [day,month,english?year:year+543].map(n=>String(n).padStart(2,'0')).join(' / ');
  };
  const localToday = () => {
    const now = new Date();
    return [now.getFullYear(), now.getMonth() + 1, now.getDate()];
  };
  const daysInMonth = (year, month) => new Date(year, month, 0).getDate();
  function valid(input){
    const value=input?.value;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return false;
    const [year,month,day]=dateParts(value);
    return year>=1&&month>=1&&month<=12&&day>=1&&day<=daysInMonth(year,month)
      &&(!input.min||value>=input.min)&&(!input.max||value<=input.max);
  }
  const range = (first, last) => Array.from({length:last - first + 1}, (_, i) => first + i);
  let sheet;
  const triggers = new WeakMap();
  const intercepts = () => mobile.matches && typeof window.HTMLDialogElement?.prototype.showModal === 'function';

  // Mobile Safari can open the native calendar when the date input receives
  // focus, before any click handler can cancel it. The real button is the only
  // interactive control in wheel mode; the original input still stores and
  // validates the form value. Desktop keeps the original native affordance.
  function enhance(input) {
    const control = input.closest('.date-control');
    if (!control || triggers.has(input)) return;
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'patient-date-trigger';
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.style.cssText = 'position:absolute;z-index:3;inset:0;width:100%;height:100%;margin:0;padding:0;border:0;border-radius:inherit;background:transparent;cursor:pointer;touch-action:manipulation';
    const originalDisplay = input.style.display;
    const originalTabIndex = input.getAttribute('tabindex');
    const originalHidden = input.getAttribute('aria-hidden');
    const originalInputMode = input.getAttribute('inputmode');
    function update() {
      const useWheel = intercepts();
      input.setCustomValidity(useWheel && input.value && !valid(input) ? 'Invalid date' : '');
      const label = input.closest('.float-field')?.querySelector('label')?.textContent?.trim() || 'Date of birth';
      const value = format(input.value,document.documentElement.lang==='en');
      trigger.setAttribute('aria-label', value ? label + ', ' + value : label);
      trigger.disabled = input.disabled || input.readOnly;
      trigger.style.display = useWheel ? 'block' : 'none';
      // Even if iOS forwards a tap to the label's associated input, there
      // is no type=date for WebKit to activate while the wheel owns the field.
      input.type = useWheel ? 'text' : 'date';
      input.style.display = useWheel ? 'none' : originalDisplay;
      if(useWheel){
        input.tabIndex=-1;
        input.setAttribute('aria-hidden','true');
        input.setAttribute('inputmode','none');
      }else{
        for(const [name,value] of [['tabindex',originalTabIndex],['aria-hidden',originalHidden],['inputmode',originalInputMode]]){
          if(value===null)input.removeAttribute(name);
          else input.setAttribute(name,value);
        }
      }
    }
    triggers.set(input, trigger);
    control.appendChild(trigger);
    input.closest('.float-field')?.querySelector('label')?.addEventListener('click',event=>{
      if(!intercepts())return;
      event.preventDefault();
      if(!trigger.disabled){trigger.focus({preventScroll:true});trigger.click();}
    });
    trigger.addEventListener('click', () => {
      if (intercepts() && !input.disabled && !input.readOnly) window.KranePatientDatePicker.open(input);
    });
    input.addEventListener('invalid', event => {
      if (!intercepts()) return;
      event.preventDefault();
      trigger.focus({preventScroll:true});
    });
    input.addEventListener('input', update);
    input.addEventListener('change', update);
    document.addEventListener('krane:languagechange', update);
    if (mobile.addEventListener) mobile.addEventListener('change', update);
    else mobile.addListener(update);
    new MutationObserver(update).observe(input,{attributes:true,attributeFilter:['readonly','disabled']});
    update();
  }
  function focus(input) {
    if (!input) return;
    (intercepts() && triggers.get(input) || input).focus({preventScroll:true});
  }

  window.KranePatientDatePicker = {
    intercepts, enhance, focus, format, valid,
    open(input) {
      if (sheet?.open) return;
      const english = document.documentElement.lang === 'en';
      const labels = english ? ['Day', 'Month', 'Year'] : ['วัน', 'เดือน', 'ปี'];
      const [minYear, minMonth, minDay] = dateParts(input.min);
      const [maxYear, maxMonth, maxDay] = dateParts(input.max);
      let [year, month, day] = valid(input) ? dateParts(input.value) : localToday();
      year = Math.max(minYear, Math.min(maxYear, year));
      const monthFormat = new Intl.DateTimeFormat(english ? 'en' : 'th', {month:'short', timeZone:'UTC'});

      sheet = document.createElement('dialog');
      sheet.className = 'patient-date-sheet';
      sheet.setAttribute('aria-labelledby', 'patient-date-title');
      sheet.innerHTML = '<div class="patient-date-sheet__handle" aria-hidden="true"></div>' +
        '<h2 id="patient-date-title"></h2><div class="patient-date-sheet__wheels"></div>' +
        '<div class="patient-date-sheet__actions"><button type="button" class="btn btn--secondary"></button><button type="button" class="btn btn--primary"></button></div>';
      sheet.querySelector('h2').textContent = input.closest('.float-field')?.querySelector('label')?.textContent ||
        (english ? 'Date of birth' : 'วันเกิด');
      const [cancel, confirm] = sheet.querySelectorAll('button');
      cancel.textContent = english ? 'Cancel' : 'ยกเลิก';
      confirm.textContent = english ? 'Confirm date' : 'ยืนยันวันที่';

      const rowHeight = 44;
      const wheels = labels.map((label, index) => {
        const column = document.createElement('div');
        const heading = document.createElement('div');
        heading.className = 'patient-date-sheet__label';
        heading.textContent = label;
        const wheel = document.createElement('div');
        wheel.className = 'patient-date-sheet__wheel';
        wheel.tabIndex = 0;
        wheel.setAttribute('role', 'listbox');
        wheel.setAttribute('aria-label', label);
        column.append(heading, wheel);
        sheet.querySelector('.patient-date-sheet__wheels').append(column);

        function read() {
          return Math.max(0, Math.min(wheel.children.length - 1, Math.round(wheel.scrollTop / rowHeight)));
        }
        function go(option, smooth = false) {
          wheel.scrollTo({top: option * rowHeight, behavior: smooth && !reducedMotion.matches ? 'smooth' : 'instant'});
        }
        function selection() {
          return Number(wheel.children[read()]?.dataset.value);
        }
        function mark() {
          const active = wheel.children[read()];
          if (!active || wheel.getAttribute('aria-activedescendant') === active.id) return;
          wheel.querySelector('[aria-selected="true"]')?.setAttribute('aria-selected', 'false');
          active.setAttribute('aria-selected', 'true');
          wheel.setAttribute('aria-activedescendant', active.id);
        }
        function set(values, selected, format = String) {
          if (wheel.firstElementChild?.dataset.value !== String(values[0]) ||
              wheel.lastElementChild?.dataset.value !== String(values.at(-1))) {
            wheel.replaceChildren(...values.map(value => {
              const option = document.createElement('div');
              option.id = `patient-date-option-${index}-${value}`;
              option.setAttribute('role', 'option');
              option.setAttribute('aria-selected', 'false');
              option.dataset.value = value;
              option.textContent = format(value);
              return option;
            }));
            wheel.removeAttribute('aria-activedescendant');
          }
          const valid = Math.max(values[0], Math.min(values.at(-1), selected));
          if (selection() !== valid) go(values.indexOf(valid));
          mark();
          return valid;
        }
        wheel.addEventListener('click', event => {
          const option = event.target.closest('[role="option"]');
          if (option) go([...wheel.children].indexOf(option), true);
        });
        wheel.addEventListener('keydown', event => {
          const moves = {ArrowDown:read() + 1, ArrowUp:read() - 1, Home:0, End:wheel.children.length - 1};
          if (!(event.key in moves)) return;
          event.preventDefault();
          go(Math.max(0, Math.min(wheel.children.length - 1, moves[event.key])));
        });
        wheel.addEventListener('scroll', () => {
          mark();
          if (index === 2) year = selection();
          if (index === 1) month = selection();
          if (index === 0) day = selection();
          if (index !== 0) refreshLimits();
        }, {passive:true});
        return {set, selection, wheel};
      });

      function refreshLimits() {
        const firstMonth = year === minYear ? minMonth : 1;
        const lastMonth = year === maxYear ? maxMonth : 12;
        const shortMonth = value => monthFormat.format(new Date(Date.UTC(2024, value - 1, 1)));
        month = wheels[1].set(range(firstMonth, lastMonth), month, shortMonth);
        const firstDay = year === minYear && month === minMonth ? minDay : 1;
        const lastDay = year === maxYear && month === maxMonth ? maxDay : daysInMonth(year, month);
        day = wheels[0].set(range(firstDay, lastDay), day);
      }
      cancel.addEventListener('click', () => sheet.close());
      confirm.addEventListener('click', () => {
        year = wheels[2].selection();
        month = wheels[1].selection();
        day = wheels[0].selection();
        refreshLimits();
        input.value = [year, month, day].map((part, index) => String(part).padStart(index === 0 ? 4 : 2, '0')).join('-');
        input.dispatchEvent(new Event('input', {bubbles:true}));
        input.dispatchEvent(new Event('change', {bubbles:true}));
        sheet.close();
      });
      sheet.addEventListener('close', () => {
        sheet.remove();
        sheet = null;
        focus(input);
      }, {once:true});
      document.body.append(sheet);
      sheet.showModal();
      wheels[2].set(range(minYear, maxYear), year, value=>String(english?value:value+543));
      refreshLimits();
      wheels[0].wheel.focus({preventScroll:true});
    }
  };
})();
