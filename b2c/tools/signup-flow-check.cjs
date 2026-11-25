const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
// Run in the checkout as node b2c/tools/signup-flow-check.cjs.
// An optional first argument points to an alternate b2c fixture directory.
// This is a mocked-DOM integration check of actual source handlers, not browser E2E.
const b2c=path.resolve(process.argv[2] || path.join(__dirname,'..'));
const html=fs.readFileSync(path.join(b2c,'krane-b2c.html'),'utf8');
const js=fs.readFileSync(path.join(b2c,'demo-walkthrough-label.js'),'utf8');
const bridge=html.slice(html.indexOf('  function isStaticGuestWalkthrough(){'),html.indexOf('  // Explicit fixture-only walkthrough.'));
const finish=html.slice(html.indexOf('  function finishDirectF02(){'),html.indexOf('  function skipForwardFrom('));
const dest=html.slice(html.indexOf('  function nextAfterAuthentication('),html.indexOf('  /* Signing in is signing in'));
assert.match(bridge,/function isStaticGuestWalkthrough/, 'static guest route handler not found');
assert.match(finish,/function finishDirectF02/, 'safety confirmation route handler not found');
assert.match(dest,/function nextAfterAuthentication/, 'post-authentication route handler not found');
assert.match(html,/closeObesityRiskModal\(\);\s*finishDirectF02\(\);/);
assert.match(html,/demo-walkthrough-label\.js(?:\?v=[^"\s]+)?/);
function test({lang='th',host='naipapornbuppa-yay.github.io',search='?sandbox=guest',sample='CONS-2041',shared=false,signed=false}={}){
 class El {
  constructor(id=''){Object.assign(this,{id,dataset:{},style:{},disabled:false,active:false,children:[],classList:{contains:()=>this.active}})}
  matches(x){return x==='input'&&this.input}
  contains(){return false}
  prepend(e){this.children.unshift(e)}
  append(e){this.children.push(e)}
  replaceChildren(e){this.children=[e];this.replaced=true}
  setAttribute(k,v){this[k]=v}
  removeAttribute(k){assert.equal(k,'data-signup-phone');this.real=false}
  click(){if(!this.disabled){document.click({target:this});flushMutations();}}
  closest(x){if(x==='[data-static-guest-account]')return Object.hasOwn(this.dataset,'staticGuestAccount')?this:null;if(x==='.screen')return this.screen}
 }
 const signup=new El('signup'), login=new El('login'), intro=new El(), submit=new El(), fields=[new El(), new El(),new El()], groups=[new El(),new El(),new El()], body=new El();
 fields.forEach(e=>e.input=true);
 submit.screen=signup;submit.real=true;
 signup.querySelector=s=>s.includes('phone')?submit:intro;
 signup.querySelectorAll=s=>s.startsWith('input')?fields:groups;
 login.querySelector=()=>body;
 const doclang={lang};
 const document={documentElement:doclang,getElementById:id=>({login,signup})[id],querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>new El(),addEventListener:(n,f)=>document[n]=f};
 const state={entryChannel:'direct',orderState:{},sharedEncounterId:shared?'other':null};
 const log=[], observers=new Map(), pending=new Set();
 const history=['intake4'];
 function activate(id,mode){
  for(const screen of [signup,login]){
   const active=id===screen.id;
   if(screen.active!==active) for(const f of observers.get(screen)||[])pending.add(f);
   screen.active=active;
  }
  log.push([mode,id]);if(mode==='replace')history.pop();history.push(id);
 }
 function flushMutations(){while(pending.size){const work=[...pending];pending.clear();work.forEach(f=>f());}}
 let selected=sample, changes=[];
 const context=vm.createContext({document,URLSearchParams,location:{hostname:host,pathname:'/Krane-Clinic/b2c/krane-b2c.html',search},window:{KraneClinical:{id:()=>selected},addEventListener:(k,v)=>changes.push(v)},flowState:state,history,MutationObserver:class{constructor(f){this.f=f} observe(e){const list=observers.get(e)||[];list.push(this.f);observers.set(e,list);}},postAuthNext:'',signedIn:()=>signed,persistFlowState:()=>{},saveIntakeDraft:()=>{},show:id=>activate(id,'push'),replaceCurrent:id=>activate(id,'replace'),directClinicalStartTarget:()=> 'matching'});
 vm.runInContext([bridge,finish,dest,js,'finishDirectF02()'].join('\n'),context);
 flushMutations();
 return {signup,submit,fields,groups,intro,state,log,change(x){selected=x;changes.forEach(f=>f());}};
}
for(const lang of ['th','en']){
 const a=test({lang}); assert.deepEqual(a.log,[['push','signup']], 'safety completion must stop on Signup without an automatic Consent transition');
 assert.equal(a.submit.real,false);assert.equal(a.submit['aria-disabled'],'false');assert.match(a.submit.textContent,lang==='en'?/Create Account/:/สร้างบัญชี/);
 assert(a.fields.every(e=>e.disabled&&e.autocomplete==='off')); assert(a.groups.every(e=>e.hidden));
 assert.equal(a.state.accountCreated,undefined);
 a.submit.click(); assert.deepEqual(a.log,[['push','signup'],['replace','consent-terms']]);
 assert.equal(a.state.accountCreated,true); assert.equal(a.state.consentsComplete,undefined); assert.equal(a.state.verifiedPhone,undefined);
}
for(const opts of [{search:''},{host:'clinic.invalid'},{sample:'other'}]){
 const a=test(opts);assert.equal(a.submit.real,true);assert(a.fields.every(e=>!e.disabled));assert.deepEqual(a.log,[['push','signup']]);
}
const shared=test({shared:true});shared.submit.click();assert.deepEqual(shared.log,[['push','signup']]);assert.equal(shared.state.accountCreated,undefined);
const switched=test();switched.change('other');assert.equal(switched.submit.disabled,true);switched.submit.click();assert.equal(switched.state.accountCreated,undefined);
assert.deepEqual(test({signed:true}).log,[['push','consent-terms']]);
console.log('PASS safety completion→visible TH/EN signup (no auto-next)→explicit synthetic account→unchanged consent; non-guest/signed-in/shared and fixture switching checked.');
