(function () {
  const profiles = {
    "1": {name:"นพ. ไพรัช เกตุรัตนกุล ว.",role:"ผู้อำนวยการแพทย์",specialty:"อายุรศาสตร์ · อนุสาขาโรคระบบการหายใจ",education:"แพทยศาสตรบัณฑิต · วิทยาศาสตรบัณฑิต จุฬาลงกรณ์มหาวิทยาลัย",bio:"ดูแลทิศทางและมาตรฐานทางการแพทย์ของ Krane พร้อมให้คำปรึกษาโดยพิจารณาจากข้อมูลสุขภาพและความเหมาะสมของผู้รับบริการแต่ละคน",image:"assets/landing-573/doctors/client-doctor-phairat.png"},
    "2": {name:"พญ. กรผกา ขันติโกสุม ว.",role:"แพทย์ที่ปรึกษา Krane · เส้นผมและผิวหนัง",specialty:"ตจวิทยา (ผิวหนัง)",education:"ข้อมูลการศึกษาอยู่ระหว่างการตรวจสอบและอัปเดต",bio:"ให้คำปรึกษาด้านเส้นผม หนังศีรษะ และผิวหนัง พร้อมออกแบบแนวทางการดูแลตามอาการ ประวัติสุขภาพ และความเหมาะสมของแต่ละคน",image:"assets/landing-573/doctors/client-doctor-ploy.png"},
    "3": {name:"อ.นพ. พหล สโรจวิสุทธิ์ ว.",role:"แพทย์ที่ปรึกษา Krane · การลดน้ำหนัก",specialty:"อายุรศาสตร์ · อนุสาขาโภชนศาสตร์คลินิก",education:"ข้อมูลการศึกษาอยู่ระหว่างการตรวจสอบและอัปเดต",bio:"ให้คำปรึกษาด้านการควบคุมน้ำหนักและโภชนศาสตร์คลินิก โดยทบทวนปัจจัยสุขภาพ เป้าหมาย และความเหมาะสมก่อนวางแผนร่วมกับผู้รับบริการ",initials:"พส"},
    "4": {name:"อ.นพ. ชวลิต หงส์เลิศสกุล ว.",role:"แพทย์ที่ปรึกษา Krane · สุขภาพทางเพศ",specialty:"ศัลยศาสตร์ยูโรวิทยา",education:"ข้อมูลการศึกษาอยู่ระหว่างการตรวจสอบและอัปเดต",bio:"ให้คำปรึกษาเรื่องสุขภาพผู้ชายและระบบทางเดินปัสสาวะอย่างเป็นส่วนตัว พร้อมอธิบายทางเลือกและข้อควรระวังตามการประเมินทางการแพทย์",initials:"ชห"}
  };
  const dialog=document.querySelector("[data-doctor-dialog]");
  const closeButton=document.querySelector("[data-doctor-close]");
  const media=document.querySelector("[data-doctor-dialog-media]");
  const name=document.querySelector("[data-doctor-dialog-name]");
  const role=document.querySelector("[data-doctor-dialog-role]");
  const bio=document.querySelector("[data-doctor-dialog-bio]");
  const specialty=document.querySelector("[data-doctor-dialog-specialty]");
  const education=document.querySelector("[data-doctor-dialog-education]");
  let returnFocus=null;
  function renderMedia(profile){
    if(profile.image){const image=document.createElement("img");image.src=profile.image;image.alt=profile.name;image.width=667;image.height=1200;media.replaceChildren(image);media.classList.remove("doctor-profile-dialog__media--identity");return;}
    const identity=document.createElement("span");identity.className="doctor-profile-dialog__identity";const initials=document.createElement("b");initials.textContent=profile.initials;const label=document.createElement("small");label.textContent=profile.specialty;identity.append(initials,label);media.replaceChildren(identity);media.classList.add("doctor-profile-dialog__media--identity");
  }
  function openProfile(trigger){if(!dialog||typeof dialog.showModal!=="function")return;const profile=profiles[trigger.dataset.doctorId];if(!profile)return;returnFocus=trigger;renderMedia(profile);name.textContent=profile.name;role.textContent=profile.role;bio.textContent=profile.bio;specialty.textContent=profile.specialty;education.textContent=profile.education;document.body.classList.add("doctor-dialog-open");dialog.showModal();requestAnimationFrame(()=>closeButton?.focus());}
  document.querySelectorAll("[data-doctor-open]").forEach((trigger)=>{trigger.addEventListener("click",(event)=>{if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;if(!dialog||typeof dialog.showModal!=="function")return;event.preventDefault();openProfile(trigger);});});
  closeButton?.addEventListener("click",()=>dialog?.close());
  dialog?.addEventListener("click",(event)=>{if(event.target===dialog)dialog.close();});
  dialog?.addEventListener("close",()=>{document.body.classList.remove("doctor-dialog-open");resetDrag();returnFocus?.focus();});

  /* Swipe right to dismiss. The panel scrolls vertically, so a gesture only
     becomes a dismissal once it is clearly horizontal — otherwise a normal
     scroll would drag the sheet sideways. */
  let dragId=null,startX=0,startY=0,dx=0,axis="";
  function resetDrag(){
    dragId=null;dx=0;axis="";
    if(!dialog) return;
    dialog.classList.remove("is-dragging","is-settling","is-dismissing");
    dialog.style.transform="";
  }
  function settle(){
    if(!dialog) return;
    dialog.classList.remove("is-dragging");
    const width=dialog.getBoundingClientRect().width || 1;
    if(dx > Math.min(120,width*0.28)){
      dialog.classList.add("is-dismissing");
      dialog.style.transform="";
      const done=()=>{dialog.removeEventListener("transitionend",done);dialog.close();};
      dialog.addEventListener("transitionend",done);
      window.setTimeout(done,320);
      return;
    }
    dialog.classList.add("is-settling");
    dialog.style.transform="translateX(0)";
    const clear=()=>{dialog.removeEventListener("transitionend",clear);dialog.classList.remove("is-settling");dialog.style.transform="";};
    dialog.addEventListener("transitionend",clear);
    window.setTimeout(clear,320);
    dragId=null;axis="";dx=0;
  }
  dialog?.addEventListener("pointerdown",(event)=>{
    if(event.pointerType==="mouse" || dragId!==null) return;
    if(event.target.closest("a,button")) return;
    dragId=event.pointerId;startX=event.clientX;startY=event.clientY;dx=0;axis="";
  });
  dialog?.addEventListener("pointermove",(event)=>{
    if(event.pointerId!==dragId) return;
    const moveX=event.clientX-startX, moveY=event.clientY-startY;
    if(!axis){
      if(Math.abs(moveX)<8 && Math.abs(moveY)<8) return;
      axis=Math.abs(moveX)>Math.abs(moveY)*1.3 ? "x" : "y";
      if(axis==="y"){dragId=null;return;}
      dialog.classList.add("is-dragging");
    }
    dx=Math.max(0,moveX);
    dialog.style.transform="translateX("+dx+"px)";
  });
  ["pointerup","pointercancel"].forEach((type)=>{
    dialog?.addEventListener(type,(event)=>{
      if(event.pointerId!==dragId) return;
      if(axis!=="x"){dragId=null;axis="";return;}
      settle();
    });
  });
}());
