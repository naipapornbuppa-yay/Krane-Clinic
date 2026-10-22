/* ineligible: Page-specific functions, rendering and lifecycle are in page.js; cross-page state/services and generic components remain shared.
 * Source references in dependencies.json are relative to developer-handoff/.
 */

  function openRedFlagSheet(screen,index){
    const state=intakeQuestionPageState(screen);
    const source=state.questions[index];
    if(!redFlagSource(source)) return;
    document.getElementById('red-flag-modal')?.remove();
    const flaggedOptions=[...source.querySelectorAll('[data-flag]')];
    const entries=flaggedOptions.length ? flaggedOptions.map(option=>({title:option.textContent.trim(),yes:option,no:null})) : [{title:source.querySelector('.section-label').textContent.trim(),yes:source.querySelectorAll('.option')[0],no:source.querySelectorAll('.option')[1]}];
    const answers=entries.map(entry=>entry.yes.getAttribute('aria-selected')==='true'?'yes':entry.no?.getAttribute('aria-selected')==='true'?'no':null);
    let step=0;
    const modal=document.createElement('div');modal.id='red-flag-modal';modal.className='modal-layer';
    modal.innerHTML='<button class="modal-layer__scrim" type="button" aria-label="ย้อนกลับ"></button><section class="modal-dialog health-history-dialog" role="dialog" aria-modal="true" aria-labelledby="red-flag-title"><h2 id="red-flag-title">ยืนยันข้อมูลความปลอดภัย</h2><p class="hint" data-step></p><div data-questions></div><div class="modal-dialog__actions"><button class="btn btn--primary" type="button" data-next>ถัดไป</button><button class="btn btn--ghost" type="button" data-prev>ย้อนกลับ</button></div></section>';
    document.body.append(modal);document.body.classList.add('modal-open');
    const close=()=>{modal.remove();document.body.classList.remove('modal-open');};
    const back=()=>{if(step){step--;render();}else{close();if(index>0)activateIntakeQuestionPage(screen,index-1);else screen.querySelector('[data-back]')?.click();}};
    function render(){
      modal.querySelector('[data-step]').textContent=entries.length>3?`${step+1} / ${Math.ceil(entries.length/3)}`:'';
      const host=modal.querySelector('[data-questions]');host.replaceChildren();
      entries.slice(step*3,step*3+3).forEach((entry,offset)=>{
        const i=step*3+offset,field=document.createElement('fieldset'),legend=document.createElement('legend');legend.textContent=entry.title;field.append(legend);
        const options=document.createElement('div');options.className='partner-binary';options.setAttribute('role','radiogroup');options.setAttribute('aria-label',entry.title);
        ['no','yes'].forEach(value=>{const button=document.createElement('button');button.type='button';button.className='partner-binary__option';button.setAttribute('role','radio');button.setAttribute('aria-checked',String(answers[i]===value));button.textContent=value==='yes'?'ใช่':'ไม่';button.onclick=()=>{answers[i]=value;if(entry.no)source.querySelectorAll('.option').forEach(option=>option.setAttribute('aria-selected','false'));entry.yes.setAttribute('aria-selected',String(value==='yes'));entry.no?.setAttribute('aria-selected',String(value==='no'));saveIntakeDraft();render();};options.append(button);});field.append(options);host.append(field);
      });
      modal.querySelector('[data-next]').disabled=answers.slice(step*3,step*3+3).some(value=>value===null);
    }
    modal.querySelector('[data-prev]').onclick=back;modal.querySelector('.modal-layer__scrim').onclick=back;
    modal.onkeydown=event=>{if(event.key==='Escape'){event.stopPropagation();back();}};
    modal.querySelector('[data-next]').onclick=()=>{
      if(answers.includes('yes')){close();document.querySelector('#ineligible .btn--ghost').dataset.go=screen.id;show('ineligible');return;}
      if((step+1)*3<entries.length){step++;render();return;}
      if(flaggedOptions.length){source.querySelectorAll(".option:not([data-flag])").forEach(option=>option.setAttribute("aria-selected","true"));}
      saveIntakeDraft();close();syncIntakeDropdownContinue(screen);
      if(!advanceIntakeQuestionPage(screen))screen.querySelector('.screen__footer .btn--primary[data-go]')?.click();
    };
    render();modal.querySelector('[role="radio"]')?.focus();
  }
