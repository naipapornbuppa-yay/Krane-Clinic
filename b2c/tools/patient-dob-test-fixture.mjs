import assert from 'node:assert/strict';

// Exercise the actual wheel controls. The rotated/mobile backing field is
// intentionally not fillable; the desktop native field still is.
export async function selectPatientDob(page,selector,iso){
  const input=page.locator(selector);
  const trigger=page.locator('.date-control').filter({has:input}).locator('.patient-date-trigger');
  if(!await trigger.isVisible()){ await input.fill(iso); return; }
  const [year,month,day]=iso.split('-').map(Number);
  await trigger.click();
  const modal=page.locator('.patient-date-sheet[open]');
  const wheels=modal.locator('[role=listbox]');
  for(const [index,value] of [[2,year],[1,month],[0,day]]){
    const option=wheels.nth(index).locator('[role=option][data-value="'+value+'"]');
    await option.click();
    await option.and(wheels.nth(index).locator('[aria-selected=true]')).waitFor();
  }
  await modal.locator('.btn--primary').click();
  await modal.waitFor({state:'detached'});
  assert.equal(await input.inputValue(),iso,'date wheel stored the selected ISO date');
}
