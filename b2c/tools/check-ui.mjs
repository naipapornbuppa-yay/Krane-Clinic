/* Run every release gate and retain a failing exit status for any failed stage. */
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const stages=['contract-check.mjs','public-redesign-qa.mjs','cookie-consent-qa.mjs','landing-motion-qa.mjs','condition-detail-responsive-qa.mjs','privacy-envelope-motion-qa.mjs','vertical-reviews-qa.mjs','weight-story-qa.mjs','rehair-opt1-qa.mjs'];
const failures=[];
for(const stage of stages){
 console.log(`\n=== UI gate: ${stage} ===`);
 const checks=stage==='contract-check.mjs'?[stage,'signup-flow-check.cjs']:[stage];
 let failed=false;
 for(const check of checks){
  const result=spawnSync(process.execPath,[fileURLToPath(new URL(check,import.meta.url))],{stdio:'inherit',env:process.env});
  if(result.error||result.signal||result.status!==0){
   failed=true;
   console.error(`UI gate FAILED: ${check}`,result.error?.message||result.signal||result.status);
  }
 }
 if(failed)failures.push(stage);
 else console.log(`UI gate PASSED: ${stage}`);
}
console.log(`\nUI gate summary: ${stages.length-failures.length}/${stages.length} stages passed.`);
if(failures.length)console.error(`Failed stages: ${failures.join(', ')}`);
process.exitCode=failures.length?1:0;
