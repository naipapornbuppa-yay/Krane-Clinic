/* Three public masthead variants. The page owns content; this adapter owns layout. */
(()=>{
 const team='assets/doctors/team-hero-concept-20261017.png';
 const editorial='assets/journey-web/krane-phone-consultation-v1-960.webp';
 function bind(hero,copy,media,type){
  if(!hero||!copy)return;
  hero.classList.add('public-hero','public-hero--'+type);copy.classList.add('public-hero__copy');
  if(media)media.classList.add('public-hero__media');
 }
 function split(hero,image){
  if(!hero)return;
  let copy=hero.querySelector('.library-hero__copy,.safety-hero__copy');
  if(!copy){copy=document.createElement('div');while(hero.firstChild)copy.append(hero.firstChild);hero.append(copy)}
  let media=hero.querySelector('.public-hero__media');
  if(!media){media=document.createElement('figure');const img=document.createElement('img');img.src=image;img.alt='';img.decoding='async';media.append(img);hero.append(media)}
  bind(hero,copy,media,'split');
 }
 const doctors=document.querySelector('.doctors-about');if(doctors)bind(doctors,doctors.querySelector('.doctors-about__copy'),doctors.querySelector('.doctors-about__portraits'),'full');
 const programme=document.querySelector('.condition-hero');if(programme){bind(programme,programme.querySelector('.condition-hero__copy'),programme.querySelector('.condition-hero__image'),'split');if(new URLSearchParams(location.search).get('condition')==='hair-loss')programme.classList.add('public-hero--hair');}
 document.querySelectorAll('.library-hero--reading').forEach(hero=>{
  const media=hero.querySelector('.library-hero__media');
  if(!hero.classList.contains('has-editorial-photo')){hero.classList.add('has-editorial-photo');media.querySelector('img').src=editorial;media.querySelector('img').alt=''}
  bind(hero,hero.querySelector('.library-hero__copy'),media,'split');
 });
 split(document.querySelector('.library-intro'),editorial);
 document.querySelectorAll('.info-hero').forEach(hero=>split(hero,location.pathname.endsWith('careers.html')?'assets/doctors/workshop-team-planning.png':location.pathname.endsWith('about.html')?team:editorial));
 split(document.querySelector('.safety-hero'),editorial);
 const price=document.querySelector('.pricing-hero');if(price){const copy=document.createElement('div');while(price.firstChild)copy.append(price.firstChild);price.append(copy);bind(price,copy,null,'text')}
})();
