/* Run every release gate and retain a failing exit status for any failed stage. */
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const stages=['contract-check.mjs','public-redesign-qa.mjs','cookie-consent-qa.mjs','landing-motion-qa.mjs','condition-detail-responsive-qa.mjs','privacy-envelope-motion-qa.mjs','vertical-reviews-qa.mjs','weight-story-qa.mjs'];
const failures=[];
for(const stage of stages){
 console.log(`\n=== UI gate: ${stage} ===`);
 const result=spawnSync(process.execPath,[fileURLToPath(new URL(stage,import.meta.url))],{stdio:'inherit',env:process.env});
 if(result.error||result.signal||result.status!==0){failures.push(stage);console.error(`UI gate FAILED: ${stage}`,result.error?.message||result.signal||result.status)}
 else console.log(`UI gate PASSED: ${stage}`);
}
console.log(`\nUI gate summary: ${stages.length-failures.length}/${stages.length} stages passed.`);
if(failures.length)console.error(`Failed stages: ${failures.join(', ')}`);
process.exitCode=failures.length?1:0;
