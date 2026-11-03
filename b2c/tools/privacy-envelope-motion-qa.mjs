/* Node-only regression tests for scroll-linked 3D envelope lifecycle. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../programme-motion.js',import.meta.url),'utf8');
const start=source.indexOf(' // The envelope tilts in 3D');
assert(start>=0,'scroll-linked envelope block exists');
const block=source.slice(start,source.indexOf(' // Full-height UGC story viewer',start));
function setup(initialReduced=false){
 const events={},motionEvents={},windowEvents={},queued=new Map();let observe,resizeObserver,id=0,reads=0,base='matrix(1, 0, 0, 1, 0, 0)';
 const rect={top:800,height:400};
 const frame={getBoundingClientRect(){reads++;return rect}};
 const style={transform:'',removeProperty(key){if(key==='will-change')delete this.willChange}};
 const photo={style,closest:()=>frame};
 const reduced={matches:initialReduced,addEventListener:(event,fn)=>motionEvents[event]=fn};
 const document={hidden:false,documentElement:{clientHeight:800},addEventListener:(event,fn)=>events[event]=fn};
 class ResizeObserver{constructor(fn){resizeObserver=fn}observe(target){assert.equal(target,frame)}}
 const window={innerHeight:800,ResizeObserver,addEventListener:(event,fn,options)=>{windowEvents[event]=fn;assert.equal(options.passive,true)}};
 vm.runInNewContext(block,{privacy:{querySelector:()=>photo},reduced,document,window,ResizeObserver,getComputedStyle:()=>({transform:base}),requestAnimationFrame:fn=>{queued.set(++id,fn);return id},cancelAnimationFrame:id=>queued.delete(id),IntersectionObserver:class{constructor(fn,options){observe=fn;assert.equal(options.threshold,0)}observe(target){assert.equal(target,frame)}}});
 return {style,rect,window,get reads(){return reads},get pending(){return queued.size},flush(){const frames=[...queued.values()];queued.clear();frames.forEach(fn=>fn())},entry(visible){observe([{isIntersecting:visible}])},scroll(){windowEvents.scroll()},resize(value){base=value;windowEvents.resize()},resizeCard(){resizeObserver()},language(){events['krane:languagechange']()},hidden(value){document.hidden=value;events.visibilitychange()},reduce(value){reduced.matches=value;motionEvents.change()}};
}
const angles=h=>[...h.style.transform.matchAll(/rotate[XYZ]\((-?[\d.]+)deg\)/g)].map(m=>Number(m[1]));
let h=setup();h.scroll();assert.equal(h.pending,0,'offscreen scroll is idle');h.entry(true);assert.equal(h.pending,1);h.flush();assert.deepEqual(angles(h),[10,-18,-2]);assert(h.style.transform.startsWith('perspective(900px)'));assert(h.style.transform.endsWith('matrix(1, 0, 0, 1, 0, 0)'),'base transform preserved');assert.equal(h.pending,0,'no perpetual RAF');
h.rect.top=200;for(let i=0;i<20;i++)h.scroll();assert.equal(h.pending,1,'scroll events coalesce');h.flush();assert.deepEqual(angles(h),[0,0,0]);
h.rect.top=-400;h.scroll();h.flush();assert.deepEqual(angles(h),[-10,18,2]);h.rect.top=800;h.scroll();h.flush();assert.deepEqual(angles(h),[10,-18,-2],'reverse scrolling reverses rotation');
for(const top of [-10000,10000]){h.rect.top=top;h.scroll();h.flush();const [x,y,z]=angles(h);assert(Math.abs(x)<=10&&Math.abs(y)<=18&&Math.abs(z)<=2,'bounded rotation');}
h.scroll();h.entry(false);assert.equal(h.pending,0,'exit cancels queued work');assert.equal(h.style.willChange,undefined);const reads=h.reads;h.scroll();h.flush();assert.equal(h.reads,reads,'offscreen does no layout reads');h.entry(true);h.flush();
h.scroll();h.hidden(true);assert.equal(h.pending,0,'hidden tab cancels queued work');h.scroll();assert.equal(h.pending,0);h.hidden(false);assert.equal(h.pending,1,'visible tab resumes at current position');h.flush();
h.scroll();h.reduce(true);assert.equal(h.pending,0);assert.equal(h.style.transform,'','reduced motion restores static CSS');assert.equal(h.style.willChange,undefined);h.scroll();assert.equal(h.pending,0);h.reduce(false);h.flush();assert.equal(angles(h).length,3);
h.resize('matrix(0.99, 0.1, -0.1, 0.99, 0, 0)');h.flush();assert(h.style.transform.endsWith('matrix(0.99, 0.1, -0.1, 0.99, 0, 0)'),'responsive base refreshed');h.resizeCard();assert.equal(h.pending,1);h.flush();h.language();assert.equal(h.pending,1);h.flush();
h.window.innerHeight=390;h.rect.height=200;h.rect.top=95;h.scroll();h.flush();assert.deepEqual(angles(h),[0,0,0],'mobile viewport uses its own scroll progress');
h=setup(true);h.entry(true);h.scroll();h.flush();assert.equal(h.style.transform,'');assert.equal(h.reads,0,'initial reduced motion remains static');h.reduce(false);h.flush();assert.equal(angles(h).length,3);
const css=fs.readFileSync(new URL('../programme-focus.css',import.meta.url),'utf8');assert(css.includes('.pc-privacy .pc-package{overflow:clip}'));
const cards=fs.readFileSync(new URL('../programme-card-motion.js',import.meta.url),'utf8');assert(!cards.includes("add('.pc-ed .pc-package-photo'"),'finite card animation must not compete with scroll tilt');
console.log('PASS: scroll-linked perspective XYZ, reverse scrolling, angle bounds, RAF coalescing/no loop, offscreen/background suspension, reduced static restoration, responsive base/viewport, layout updates and isolated transform ownership. Browser visual/overflow QA remains separate.');
