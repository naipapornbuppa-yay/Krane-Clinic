/* Animate the illustrative weight records only while the chart is visible. */
(()=>{
 const chart=document.querySelector('.care-weight-chart');if(!chart)return;
 const metric=chart.querySelector('.care-weight-chart__metric strong');
 const record=chart.querySelector('.care-weight-chart__metric>span:last-child');
 const line=chart.querySelector('svg path[stroke="white"]');
 const dots=[...chart.querySelectorAll('svg circle')];
 const labels=[...chart.querySelectorAll('svg text')].slice(0,3);
 if(!metric||!line)return;
 const number=document.createElement('span');number.textContent='72.0';metric.firstChild.replaceWith(number);
 const length=line.getTotalLength(), reduced=matchMedia('(prefers-reduced-motion: reduce)');
 line.style.strokeDasharray=String(length);
 let frame=0,start=0,elapsed=0,visible=false;
 const values=[82.4,77.6,72];
 function render(t){
  const stage=Math.min(2,Math.floor(t/1800));
  const fraction=Math.min(1,(t-stage*1800)/1000),ease=1-Math.pow(1-fraction,3);
  const value=stage===0?values[0]:values[stage-1]+(values[stage]-values[stage-1])*ease;
  number.textContent=value.toFixed(1);
  record.textContent=`ตัวอย่างบันทึกครั้งที่ ${stage+1} จาก 3`;
  const progress=stage===0?0:(stage-1+ease)/2;
  line.style.strokeDashoffset=String(length*(1-progress));
  dots.forEach((dot,i)=>{dot.style.opacity=i<=stage?'1':'.18'});
  labels.forEach((label,i)=>{label.style.opacity=i<=stage?'1':'.18'});
 }
 function stop(){cancelAnimationFrame(frame);frame=0;start=0}
 function tick(now){if(!start)start=now-elapsed;elapsed=now-start;render(Math.min(elapsed,5400));if(elapsed>8000){elapsed=0;start=now}frame=requestAnimationFrame(tick)}
 function sync(){stop();if(reduced.matches){render(5400);return}if(visible&&!document.hidden)frame=requestAnimationFrame(tick)}
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()},{threshold:.25}).observe(chart);
 reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);window.addEventListener('pagehide',stop,{once:true});sync();
})();

(()=>{const section=document.querySelector('.programme-focus--hair');if(!section)return;let visible=false;const sync=()=>section.classList.toggle('is-hair-visible',visible&&!document.hidden);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()},{threshold:.15}).observe(section);document.addEventListener('visibilitychange',sync)})();
