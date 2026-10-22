import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {parse} from 'acorn';
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFile(path.join(dir,p),'utf8');
const manifest=JSON.parse(await read('manifest.json'));
const ownership=JSON.parse(await read('handler-ownership.json'));
const runtime=await read('shared/runtime.js');
const definitions=new Map();let checks=0;
const check=(value,message)=>{assert.ok(value,message);checks++;};
for(const file of [...manifest.libraries,...manifest.pages.map(p=>p.js)]){
  for(const fn of parse(await read(file),{ecmaVersion:'latest'}).body){
    check(fn.type==='FunctionDeclaration','Registration-only module: '+file);
    check(!definitions.has(fn.id.name),'Duplicate definition: '+fn.id.name);
    definitions.set(fn.id.name,{file,fn});
  }
}
for(const item of ownership.handlers){
  check(definitions.get(item.name)?.file===item.owner,'Incorrect ownership: '+item.name);
  check(runtime.split(item.name+'(').length===2,'Exactly one ordered dispatch/setup call: '+item.name);
}
for(const page of manifest.pages){
  const contract=JSON.parse(await read(`pages/${page.id}/dependencies.json`));
  const actual=ownership.handlers.filter(h=>h.kind==='branch'&&h.owner===page.js).map(h=>h.name);
  assert.deepEqual(contract.eventHandlers.map(h=>h.name),actual);checks++;
  check(Boolean(contract.behavior.note),'Every page explains its behavior ownership');
}
check(definitions.get('kraneHandle_account_documentType')?.file==='pages/account/page.js','Account handler owned by account');
check(definitions.get('kraneInit_partner_idcard_upload')?.file==='pages/partner-idcard/page.js','ID-card initializer owned by ID-card page');
check(definitions.get('kraneHandle_orders_quantity')?.file==='shared/lib/orders.js','Quantity handler shared by plan and item editor');
// Behavioral edit propagation: the same declared handler file loaded by the build
// changes its actual validation output when edited; invalid input still consumes.
const login=await read('pages/login/page.js');
const marker='OWNED-PAGE-EDIT-PROBE';
for(const [source,expected] of [[login,'กรุณากรอกเบอร์โทรศัพท์'],[login.replace('กรุณากรอกเบอร์โทรศัพท์',marker),marker]]){
  let message;
  const context=vm.createContext({document:{getElementById:()=>({value:''})},showActionToast:text=>{message=text;}});
  vm.runInContext(source,context);
  check(vm.runInContext('kraneHandle_login_submit({}, {})',context)===true,'Invalid login consumes dispatch');
  check(message===expected,'Page handler edit reaches behavior');
}
const output=await fs.readFile(path.join(dir,'..',manifest.output),'utf8');
check(output.split('src="../developer-handoff/pages/login/page.js"').length===2,'Build loads editable login file exactly once');
const owned=manifest.pages.filter(p=>p.functions.length+p.initializers.length).length;
console.log(JSON.stringify({result:'pass',checks,pagesWithOwnedCode:owned,pagesUsingOnlySharedOrExternalBehavior:manifest.pages.length-owned,branches:ownership.handlers.filter(h=>h.kind==='branch').length,newInitializers:ownership.handlers.filter(h=>h.kind==='initializer').length},null,2));
