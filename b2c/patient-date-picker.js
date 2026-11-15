/* Keep the native date input as the form value and validation source. */
(() => {
  const mobile = matchMedia('(max-width:760px), (pointer:coarse)');
  const reducedMotion = matchMedia('(prefers-reduced-motion:reduce)');
  const dateParts = value => value.split('-').map(Number);
  const localToday = () => {
    const now = new Date();
    return [now.getFullYear(), now.getMonth() + 1, now.getDate()];
  };
  const daysInMonth = (year, month) => new Date(year, month, 0).getDate();
  const range = (first, last) => Array.from({length:last - first + 1}, (_, i) => first + i);
  let sheet;

  window.KranePatientDatePicker = {
    intercepts: () => mobile.matches && typeof window.HTMLDialogElement?.prototype.showModal === 'function',
    open(input) {
      if (sheet?.open) return;
      const english = document.documentElement.lang === 'en';
      const labels = english ? ['Day', 'Month', 'Year'] : ['วัน', 'เดือน', 'ปี'];
      const [minYear, minMonth, minDay] = dateParts(input.min);
      const [maxYear, maxMonth, maxDay] = dateParts(input.max);
      let [year, month, day] = input.value ? dateParts(input.value) : localToday();
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
        input.focus({preventScroll:true});
      }, {once:true});
      document.body.append(sheet);
      sheet.showModal();
      wheels[2].set(range(minYear, maxYear), year);
      refreshLimits();
      wheels[0].wheel.focus({preventScroll:true});
    }
  };
})();
