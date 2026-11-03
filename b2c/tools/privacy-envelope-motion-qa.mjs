/* Node-only regression tests for the envelope's bounded viewport lifecycle. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../programme-motion.js',import.meta.url),'utf8');
const block=source.slice(source.indexOf(' // The envelope replays once per visit'),source.indexOf(' // Full-height UGC story viewer'));
assert(block.includes("animation.id='pc-envelope-entry'"));
function setup(initialReduced=false){
 const animations=[],events={},motionEvents={};let observe;
 const frame={};
 const photo={closest:()=>frame,animate(frames,options){const a={frames,options,playState:'running',cancel(){this.playState='idle'},pause(){this.playState='paused'},play(){this.playState='running'}};animations.push(a);return a}};
 const reduced={matches:initialReduced,addEventListener:(event,fn)=>motionEvents[event]=fn};
 const document={hidden:false,addEventListener:(event,fn)=>events[event]=fn};
 vm.runInNewContext(block,{privacy:{querySelector:()=>photo},reduced,document,getComputedStyle:()=>({transform:'matrix(1, 0, 0, 1, 0, 0)'}),IntersectionObserver:class{constructor(fn,options){observe=fn;assert.deepEqual(Array.from(options.threshold),[0,.2])}observe(target){assert.equal(target,frame)}}});
 return {animations,entry(ratio){observe([{isIntersecting:ratio>0,intersectionRatio:ratio}])},hidden(value){document.hidden=value;events.visibilitychange()},reduce(value){reduced.matches=value;motionEvents.change()}};
}
let h=setup();h.entry(.1);assert.equal(h.animations.length,0);h.entry(.2);assert.equal(h.animations.length,1);const first=h.animations[0];assert.equal(first.options.duration,1500);assert.equal(first.options.iterations,1);assert.equal(first.frames.at(-1).offset,1);
h.entry(.5);h.entry(.1);h.entry(.3);assert.equal(h.animations.length,1,'partial exit cannot replay');
h.hidden(true);assert.equal(first.playState,'paused');h.hidden(false);assert.equal(first.playState,'running');first.playState='finished';h.hidden(true);h.hidden(false);assert.equal(first.playState,'finished','completed animation cannot restart');
h.entry(0);assert.equal(first.playState,'idle');h.entry(.25);assert.equal(h.animations.length,2,'re-entry from either direction replays');h.entry(0);h.entry(.4);assert.equal(h.animations.length,3);
h.reduce(true);assert.equal(h.animations.at(-1).playState,'idle');h.reduce(false);h.entry(.5);assert.equal(h.animations.length,3,'preference toggle cannot replay mid-visit');h.entry(0);h.entry(.3);assert.equal(h.animations.length,4);
h=setup(true);h.entry(.5);assert.equal(h.animations.length,0);h.reduce(false);h.entry(.6);assert.equal(h.animations.length,0);h.entry(0);h.entry(.3);assert.equal(h.animations.length,1);
h=setup();h.hidden(true);h.entry(.3);assert.equal(h.animations[0].playState,'paused');h.hidden(false);assert.equal(h.animations[0].playState,'running');
const css=fs.readFileSync(new URL('../programme-focus.css',import.meta.url),'utf8');assert(css.includes('.pc-privacy .pc-package{overflow:clip}'));
console.log('PASS: finite envelope entry, full-exit rearm, no threshold jitter replay, hidden pause/resume, reduced static/cancel, card clipping rule. Browser visual/overflow QA remains separate.');
