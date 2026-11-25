/* Shared doctor profile drawer for the landing and directory. */
(() => {
  const expertProfiles = {
    "1": {
      name: "นพ. ไพรัช เกตุรัตนกุล ว.",
      role: "ผู้อำนวยการแพทย์",
      specialty: "อายุรศาสตร์ · อนุสาขาโรคระบบการหายใจ",
      education: "แพทยศาสตรบัณฑิต · วิทยาศาสตรบัณฑิต จุฬาลงกรณ์มหาวิทยาลัย",
      bio: "ดูแลทิศทางและมาตรฐานทางการแพทย์ของ Krane พร้อมให้คำปรึกษาโดยพิจารณาจากข้อมูลสุขภาพและความเหมาะสมของผู้รับบริการแต่ละคน"
    },
    "2": {
      name: "พญ. กรผกา ขันติโกสุม ว.",
      role: "แพทย์ที่ปรึกษา Krane · เส้นผมและผิวหนัง",
      specialty: "ตจวิทยา (ผิวหนัง)",
      education: "แพทยศาสตรบัณฑิต ศิริราชพยาบาล มหาวิทยาลัยมหิดล · วุฒิบัตรตจวิทยา จุฬาลงกรณ์มหาวิทยาลัย",
      bio: "ให้คำปรึกษาด้านเส้นผม หนังศีรษะ และผิวหนัง พร้อมออกแบบแนวทางการดูแลตามอาการ ประวัติสุขภาพ และความเหมาะสมของแต่ละคน"
    },
    "3": {
      name: "อ.นพ. พหล สโรจวิสุทธิ์ ว.",
      role: "แพทย์ที่ปรึกษา Krane · การลดน้ำหนัก",
      specialty: "อายุรศาสตร์ · อนุสาขาโภชนศาสตร์คลินิก",
      education: "แพทยศาสตรบัณฑิต มหาวิทยาลัยรังสิต · วุฒิบัตรอายุรศาสตร์ และอนุสาขาโภชนศาสตร์คลินิก",
      bio: "ให้คำปรึกษาด้านการควบคุมน้ำหนักและโภชนศาสตร์คลินิก โดยทบทวนปัจจัยสุขภาพ เป้าหมาย และความเหมาะสมก่อนวางแผนร่วมกับผู้รับบริการ"
    },
    "4": {
      name: "อ.นพ. ชวลิต หงส์เลิศสกุล ว.",
      role: "แพทย์ที่ปรึกษา Krane · สุขภาพทางเพศ",
      specialty: "ศัลยศาสตร์ยูโรวิทยา",
      education: "ข้อมูลการศึกษาอยู่ระหว่างการตรวจสอบและอัปเดต",
      bio: "ให้คำปรึกษาเรื่องสุขภาพผู้ชายและระบบทางเดินปัสสาวะอย่างเป็นส่วนตัว พร้อมอธิบายทางเลือกและข้อควรระวังตามการประเมินทางการแพทย์"
    }
  };
  Object.entries(window.KraneDoctorSource||{}).forEach(([id,record])=>{expertProfiles[id]={...expertProfiles[id],...record,education:[record.education,...(record.training||[])],bio:(id==="2"?"เทคนิคปลูกผม FUE/DHI และหัตถการด้านผิวหนัง":record.bio)+" ปัจจุบัน: "+(record.workplaces||[]).join(" · ")};});
  const expertDialog = document.querySelector("[data-expert-dialog]");
  const expertDialogClose = document.querySelector("[data-expert-close]");
  const expertDialogMedia = document.querySelector("[data-expert-dialog-media]");
  const expertDialogName = document.querySelector("[data-expert-dialog-name]");
  const expertDialogRole = document.querySelector("[data-expert-dialog-role]");
  const expertDialogBio = document.querySelector("[data-expert-dialog-bio]");
  const expertDialogSpecialty = document.querySelector("[data-expert-dialog-specialty]");
  const expertDialogEducation = document.querySelector("[data-expert-dialog-education]");
  const expertDetailLink = document.querySelector("[data-expert-detail-link]");
  let expertDialogReturnFocus = null;

  function openExpertDialog(card) {
    if (!expertDialog || typeof expertDialog.showModal !== "function") return;
    const id = card.dataset.doctorId;
    const profile = expertProfiles[id];
    const media = card.querySelector(".expert-card__media");
    if (!profile || !media) return false;
    if (expertDialog.open) return true;
    expertDialogReturnFocus = card;
    expertDialogMedia.replaceChildren(media.cloneNode(true));
    expertDialogName.textContent = profile.name;
    expertDialogRole.textContent = profile.role;
    expertDialogBio.textContent = profile.bio;
    const fillPills = (target, value) => {
      target.replaceChildren(...value.split(' · ').filter(Boolean).map(text => {
        const pill = document.createElement('span');
        pill.className = 'expert-dialog__pill';
        pill.textContent = text;
        return pill;
      }));
    };
    fillPills(expertDialogSpecialty, profile.specialty);
    const educationRows=Array.isArray(profile.education)?profile.education:(profile.education||"").split(" · ");
    const educationList=document.createElement("ul");
    educationList.className="expert-dialog__education-list";
    educationRows.filter(Boolean).forEach(text=>{
      const item=document.createElement("li");
      item.textContent=text;
      educationList.append(item);
    });
    expertDialogEducation.replaceChildren(educationList);
    // The sheet no longer carries a CTA; keep the link in sync if one returns.
    if (expertDetailLink) expertDetailLink.href = `doctor-detail.html?doctor=${id}`;
    document.body.classList.add("expert-open");
    expertDialog.showModal();
    expertDialog.scrollTop = 0;
    requestAnimationFrame(() => expertDialogClose?.focus({preventScroll:true}));
    return true;
  }

  document.addEventListener("click", (event) => {
    const card = event.target.closest("[data-expert-open]");
    if (!card || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (openExpertDialog(card)) event.preventDefault();
  });
  const requested = new URLSearchParams(location.search).get("doctor");
  if (requested && document.body.classList.contains("doctors-index-page")) {
    const card = [...document.querySelectorAll("[data-expert-open]")].find(item => item.dataset.doctorId === requested);
    if (card) openExpertDialog(card);
  }
  expertDialogClose?.addEventListener("click", () => expertDialog?.close());
  expertDialog?.addEventListener("click", (event) => {
    if (event.target === expertDialog) expertDialog.close();
  });
  expertDialog?.addEventListener("close", () => {
    document.body.classList.remove("expert-open");
    expertDialogReturnFocus?.focus({preventScroll:true});
  });

})();
