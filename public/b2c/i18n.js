/* ============================================================
   KRANE: bilingual TH/EN runtime (shared by krane-b2c + krane-cms)
   INTERIM Thai (draft). Final TH should be produced with Typhoon Translate (SCB)
   via i18n/translate-with-typhoon.py and clinician-reviewed; replace TH below.
   Mechanism: walk text nodes + input placeholders, swap EN->TH by exact match.
   Wires itself to any [data-lang] toggle (buttons with data-lng="en"/"th").
   ============================================================ */
(function () {
  var TH = {
    /* ---- common / buttons ---- */
    "Continue":"ดำเนินการต่อ","Next":"ถัดไป","Skip":"ข้าม","Back":"ย้อนกลับ","Send":"ส่ง","Pay":"ชำระ","securely":"อย่างปลอดภัย","Apply":"ใช้","Edit":"แก้ไข","log in":"เข้าสู่ระบบ","Log in":"เข้าสู่ระบบ",
    "Get started":"เริ่มต้นใช้งาน","Start your visit":"เริ่มการปรึกษา","Continue to payment":"ไปต่อที่การชำระเงิน","Skip for now":"ข้ามไปก่อน",
    "Use my current location":"ใช้ตำแหน่งปัจจุบันของฉัน","Set location on the map":"ปักหมุดบนแผนที่","Refill now":"สั่งซื้อซ้ำ","Reorder now":"สั่งซื้อซ้ำ",
    "Already have an account? Log in":"มีบัญชีอยู่แล้ว? เข้าสู่ระบบ","Mark all read":"ทำเครื่องหมายว่าอ่านแล้วทั้งหมด","All read":"อ่านแล้วทั้งหมด","Edit answers":"แก้ไขคำตอบ",
    "Confirm answers & continue":"ยืนยันคำตอบและดำเนินการต่อ","Submit & find a doctor":"ส่งข้อมูลและหาแพทย์","Review safety answers":"ตรวจทานคำตอบด้านความปลอดภัย","Find pharmacy & continue":"ค้นหาร้านยาและไปต่อ","Try payment again":"ลองชำระเงินอีกครั้ง","View order activity":"ดูสถานะคำสั่งซื้อ","Check entitlement & pay ฿ 160":"ตรวจสอบสิทธิ์และชำระ ฿ 160","required · final questions":"จำเป็น · คำถามสุดท้าย",
    /* ---- key message (project tagline) ---- */
    "Personalized treatment programs designed by medical specialists.":"โปรแกรมการรักษาเฉพาะบุคคล ออกแบบโดยแพทย์ผู้เชี่ยวชาญ",
    /* ---- onboarding / entry ---- */
    "Care that":"การดูแล","moves with":"ที่ไปกับ","you.":"คุณ","Care that moves with you.":"ดูแลสุขภาพได้ ในแบบที่เข้ากับชีวิตคุณ","Private. Personal. Always accessible.":"เป็นส่วนตัว เฉพาะคุณ เข้าถึงได้เสมอ",
    "Modern":"การดูแลสุขภาพ","healthcare,":"ยุคใหม่","personalized":"ออกแบบ","for you.":"เพื่อคุณ","Modern healthcare, personalized for you.":"การดูแลสุขภาพ ที่ออกแบบเพื่อคุณ","Consult. Treat. Thrive.":"ปรึกษา รักษา ดูแลต่อเนื่อง",
    "Delivered":"จัดส่งถึง","to your":"หน้าบ้าน","door.":"คุณ","Delivered to your door.":"รับการดูแลต่อเนื่อง ส่งถึงบ้านคุณ","Discreet. Unbranded. Yours.":"เป็นส่วนตัว ไม่ระบุชนิดยา ส่งถึงคุณ",
    /* ---- concern / category ---- */
    "What kind of care do you need?":"คุณต้องการการดูแลแบบไหน?","Tap a category to begin. If your concern doesn't fit one, choose General consultation.":"แตะหมวดเพื่อเริ่ม ถ้าไม่ตรงหมวดไหน เลือกปรึกษาทั่วไป",
    "General consultation":"ปรึกษาทั่วไป","Not sure where to start? Talk to a doctor without choosing a disease path.":"ไม่รู้จะเริ่มตรงไหน? คุยกับแพทย์ได้โดยไม่ต้องเลือกโรค",
    "Hair, skin & appearance":"ผม ผิว และรูปลักษณ์","Hair loss, scalp, skin and appearance-related care.":"ดูแลปัญหาผมร่วง หนังศีรษะ ผิว และรูปลักษณ์","Hair loss & scalp":"ผมร่วงและหนังศีรษะ","Hair thinning, shedding and scalp concerns.":"ผมบาง ผมร่วง และปัญหาหนังศีรษะ","Skin & acne":"ผิวและสิว","Acne, irritation and other skin concerns.":"สิว การระคายเคือง และปัญหาผิว",
    "Sexual health":"สุขภาพเพศชาย","ED, performance concerns and related men's health questions.":"ปัญหาสมรรถภาพ และเรื่องสุขภาพเพศชายอื่น ๆ",
    "Sleep & stress":"การนอนและความเครียด","Sleep quality, stress, energy and daily functioning.":"คุณภาพการนอน ความเครียด พลังงาน และการใช้ชีวิตประจำวัน",
    "Everyday health":"สุขภาพทั่วไป","General symptoms, wellness checks and care navigation.":"อาการทั่วไป ตรวจสุขภาพ และคำแนะนำการดูแล",
    "Choose a category":"เลือกหมวด","Choose a condition":"เลือกอาการ","What should the doctor review?":"อยากให้แพทย์ดูเรื่องอะไร?","Pick the closest match. You can still explain the details during intake.":"เลือกที่ใกล้เคียงที่สุด อธิบายรายละเอียดเพิ่มได้ตอนทำแบบสอบถาม",
    "Hair loss":"ผมร่วง","Skin concern":"ปัญหาผิว","Erectile dysfunction":"ภาวะหย่อนสมรรถภาพ","Launch":"เปิดให้บริการ","Soon":"เร็ว ๆ นี้","General":"ทั่วไป",
    /* ---- intake ---- */
    "About your concern":"เกี่ยวกับอาการของคุณ","How long have you noticed hair loss?":"คุณสังเกตเห็นผมร่วงมานานแค่ไหน?","Pick the closest answer.":"เลือกคำตอบที่ใกล้เคียงที่สุด",
    "Less than 6 months":"น้อยกว่า 6 เดือน","6 months to 2 years":"6 เดือน ถึง 2 ปี","More than 2 years":"มากกว่า 2 ปี",
    "Current symptoms":"อาการปัจจุบัน","What are you noticing right now?":"ตอนนี้คุณสังเกตเห็นอะไรบ้าง?","Select all that apply. The doctor will review this before seeing you.":"เลือกได้มากกว่าหนึ่งข้อ แพทย์จะดูข้อมูลนี้ก่อนพบคุณ",
    "Hair thinning or shedding":"ผมบางหรือผมร่วง","Scalp irritation, redness or itching":"หนังศีรษะระคายเคือง แดง หรือคัน","Skin change, rash or acne":"ผิวเปลี่ยน ผื่น หรือสิว","Sleep, stress or energy concern":"ปัญหาการนอน ความเครียด หรือพลังงาน","Something else":"อื่น ๆ",
    "Medical history":"ประวัติทางการแพทย์","Do you have any existing medical conditions?":"คุณมีโรคประจำตัวหรือไม่?","Select all that apply. Heart-related answers are important for safe prescribing.":"เลือกได้มากกว่าหนึ่งข้อ ข้อมูลเกี่ยวกับหัวใจสำคัญต่อการสั่งยาอย่างปลอดภัย",
    "Heart attack, angina or chest pain":"หัวใจวาย เจ็บหน้าอก หรือแน่นหน้าอก","Heart rhythm problem or heart failure":"หัวใจเต้นผิดจังหวะหรือหัวใจล้มเหลว","High or low blood pressure":"ความดันสูงหรือต่ำ","Liver or kidney disease":"โรคตับหรือไต","Diabetes":"เบาหวาน","Depression, anxiety or sleep disorder":"ซึมเศร้า วิตกกังวล หรือปัญหาการนอน","Prostate or hormone-related condition":"ปัญหาต่อมลูกหมากหรือฮอร์โมน","None of the above":"ไม่มีข้อใดข้างต้น",
    "Medication & allergies":"ยาและการแพ้ยา","What medicine or supplements are relevant?":"มียาหรืออาหารเสริมที่เกี่ยวข้องไหม?","No current or recent medicine":"ไม่มียาที่ใช้อยู่หรือใช้ล่าสุด",
    "Treatment history & safety":"ประวัติการรักษาและความปลอดภัย","A few safety checks before matching":"ตรวจความปลอดภัยสั้น ๆ ก่อนจับคู่แพทย์",
    "About you":"เกี่ยวกับตัวคุณ","Height (cm)":"ส่วนสูง (ซม.)","Weight (kg)":"น้ำหนัก (กก.)","Smoke":"สูบบุหรี่","Drink alcohol regularly":"ดื่มแอลกอฮอล์เป็นประจำ","Sleep under 6 hours a night":"นอนน้อยกว่า 6 ชั่วโมงต่อคืน","None of these":"ไม่มีข้อเหล่านี้",
    "Photos · optional":"รูปภาพ · ไม่บังคับ","Add a photo of the area you're concerned about":"เพิ่มรูปบริเวณที่คุณกังวล","Private & encrypted":"เป็นส่วนตัวและเข้ารหัส",
    "While a doctor reviews your answers":"ระหว่างที่แพทย์ตรวจคำตอบของคุณ",
    "Review your answers":"ตรวจทานคำตอบ","Review before sending to your doctor.":"ตรวจสอบก่อนส่งให้แพทย์",
    "Concern":"อาการที่ปรึกษา","Duration / severity":"ระยะเวลา / ความรุนแรง","Medical conditions":"โรคประจำตัว","Medication":"ยา","Allergies":"การแพ้ยา","Previous treatment":"การรักษาก่อนหน้า","Safety screening":"การคัดกรองความปลอดภัย","Photos":"รูปภาพ","None reported":"ไม่มีรายงาน","No known allergies":"ไม่มีประวัติแพ้ยา","Clear for online review":"ผ่านเกณฑ์ปรึกษาออนไลน์","None":"ไม่มี",
    /* ---- intake v4: service-specific questions + universal final health step ---- */
    "1-6 months":"1-6 เดือน","Tell us more about this concern":"เล่าอาการนี้ให้เรารู้เพิ่มอีกนิด","These details change with the service you selected. Pick the closest answers.":"คำถามส่วนนี้จะเปลี่ยนตามบริการที่คุณเลือก โปรดเลือกคำตอบที่ใกล้เคียงที่สุด",
    "How is it affecting you?":"อาการนี้ส่งผลกับคุณแค่ไหน?","What have you noticed?":"คุณสังเกตเห็นอะไรบ้าง?","Appearance or visible change":"มีการเปลี่ยนแปลงที่มองเห็นได้","Pain, itching or discomfort":"เจ็บ คัน หรือรู้สึกไม่สบาย","Change in function or performance":"การทำงานหรือสมรรถภาพเปลี่ยนไป","It comes and goes":"เป็น ๆ หาย ๆ",
    "What have you tried for this concern?":"คุณเคยลองดูแลอาการนี้อย่างไรบ้าง?","Include treatment from a doctor, pharmacy products or anything you stopped because of side effects.":"รวมทั้งการรักษาจากแพทย์ ผลิตภัณฑ์จากร้านยา หรือสิ่งที่หยุดใช้เพราะผลข้างเคียง","Previous care or treatment":"การดูแลหรือการรักษาก่อนหน้า","What happened?":"ผลเป็นอย่างไร?","It helped":"อาการดีขึ้น","No clear change":"ไม่เห็นการเปลี่ยนแปลงชัดเจน","It caused a side effect or made things worse":"เกิดผลข้างเคียงหรืออาการแย่ลง","Not applicable or not sure":"ไม่เกี่ยวข้องหรือไม่แน่ใจ","Treatment details (optional)":"รายละเอียดการรักษา (ไม่บังคับ)","Name of treatment, how long you used it and what happened":"ชื่อการรักษา ระยะเวลาที่ใช้ และผลที่เกิดขึ้น",
    "Do any urgent warning signs apply today?":"วันนี้คุณมีสัญญาณอันตรายเร่งด่วนเหล่านี้หรือไม่?","If they do, online care may not be the safest option right now.":"หากมี การดูแลออนไลน์อาจไม่ใช่ทางเลือกที่ปลอดภัยที่สุดในตอนนี้",
    "Required for every consultation":"จำเป็นสำหรับทุกการปรึกษา","Your general health information":"ข้อมูลสุขภาพทั่วไปของคุณ","Every patient completes this final step, whatever they want to discuss. It helps the doctor prescribe safely.":"ทุกคนต้องตอบขั้นตอนสุดท้ายนี้ ไม่ว่าจะปรึกษาเรื่องใด เพื่อช่วยให้แพทย์สั่งยาได้อย่างปลอดภัย",
    "No existing medical conditions":"ไม่มีโรคประจำตัว","Heart condition or blood pressure problem":"โรคหัวใจหรือปัญหาความดันโลหิต","Diabetes or hormone-related condition":"เบาหวานหรือภาวะเกี่ยวกับฮอร์โมน","Another condition":"มีโรคประจำตัวอื่น","Current medicine and supplements":"ยาและอาหารเสริมที่ใช้อยู่","No current medicine or supplements":"ไม่มียาหรืออาหารเสริมที่ใช้อยู่","Prescription medicine":"ยาที่แพทย์สั่ง","Over-the-counter medicine":"ยาที่ซื้อได้เอง","Vitamins, supplements or herbal products":"วิตามิน อาหารเสริม หรือผลิตภัณฑ์สมุนไพร","Names and details (if any)":"ชื่อและรายละเอียด (ถ้ามี)","Medicine, allergy or condition details the doctor should know":"รายละเอียดเรื่องยา การแพ้ หรือโรคประจำตัวที่แพทย์ควรรู้",
    "Duration":"ระยะเวลา","Concern detail":"รายละเอียดอาการ","Moderate · visible change":"ปานกลาง · มีการเปลี่ยนแปลงที่มองเห็นได้","Medication & supplements":"ยาและอาหารเสริม","Height / weight":"ส่วนสูง / น้ำหนัก",
    /* ---- prototype journey rail ---- */
    "Patient journey":"เส้นทางผู้รับบริการ","Start & discover":"เริ่มต้นและค้นหาบริการ","Onboarding":"แนะนำบริการ","Choose care":"เลือกการดูแล","Health guide":"ความรู้สุขภาพ","Health intake":"แบบสอบถามสุขภาพ","Previous care":"การดูแลก่อนหน้า","Urgent safety":"คัดกรองเร่งด่วน","In-person care":"ควรพบแพทย์ที่สถานพยาบาล","Photo":"รูปภาพ","optional":"ไม่บังคับ","General health":"สุขภาพทั่วไป","required":"จำเป็น","Health education":"ความรู้ก่อนพบแพทย์","Review + PDPA":"ตรวจทาน + PDPA",
    "Account & consent":"บัญชีและความยินยอม","Before assessment":"ก่อนเริ่มแบบประเมิน","Create account":"สร้างบัญชี","Social confirmation":"ยืนยันบัญชีโซเชียล","Returning user login":"เข้าสู่ระบบสำหรับผู้ใช้เดิม","Identity & consent":"ยืนยันตัวตนและความยินยอม","Terms + PDPA":"ข้อตกลง + PDPA","Identity verification":"ยืนยันตัวตน","OTP verification":"ยืนยัน OTP",
    "Match & book":"จับคู่และนัดหมาย","Nurse pre-screen":"คัดกรองโดยพยาบาล","Doctor matching":"จับคู่แพทย์","Consultation payment":"ชำระค่าปรึกษา","Order summary":"สรุปยอด","Payment gateway":"ช่องทางชำระเงิน","Consultation":"การปรึกษา","Consultation room":"ห้องปรึกษา","Treatment plan":"แผนการรักษา","Checkout":"ชำระเงินและจัดส่ง","Accept treatment":"ยอมรับการรักษา","Insurance checkout":"ชำระด้วยประกัน","Medication payment":"ชำระค่ายา","Fulfillment":"การจัดเตรียมและจัดส่ง","Pharmacy confirmation":"ยืนยันจากร้านยา","Order confirmation":"ยืนยันคำสั่งซื้อ","Delivery tracking":"ติดตามการจัดส่ง","Ongoing care":"การดูแลต่อเนื่อง","Post-visit feedback":"ประเมินหลังการปรึกษา","Profile home":"หน้าหลักโปรไฟล์","Personal details":"ข้อมูลส่วนตัว","Refill treatment":"สั่งการรักษาซ้ำ","System states":"สถานะระบบ","Pre-loader overlay":"หน้ารอโหลด",
    "Landing":"หน้าหลัก","Step 1 · Private care":"ขั้นที่ 1 · ดูแลอย่างเป็นส่วนตัว","Step 2 · Personal care":"ขั้นที่ 2 · ดูแลเฉพาะคุณ","Step 3 · Delivery":"ขั้นที่ 3 · จัดส่งถึงบ้าน","Choose category":"เลือกหมวดบริการ","Choose condition":"เลือกอาการ","Browse articles":"เลือกอ่านบทความ","Article detail":"หน้าบทความ",
    "1 · Symptoms & duration":"1 · อาการและระยะเวลา","2 · Concern detail":"2 · รายละเอียดอาการ","3 · Previous care":"3 · การดูแลก่อนหน้า","4 · Urgent safety":"4 · คัดกรองเร่งด่วน","State · In-person care":"สถานะ · ควรพบแพทย์ที่สถานพยาบาล","5 · Photo":"5 · รูปภาพ","6 · Insurance":"6 · ประกัน","7 · General health":"7 · สุขภาพทั่วไป","8 · Health education":"8 · ความรู้ก่อนพบแพทย์","9 · Review + PDPA":"9 · ตรวจทาน + PDPA",
    "State · Social confirmation":"สถานะ · ยืนยันบัญชีโซเชียล","Default · Auto-match":"ค่าตั้งต้น · จับคู่อัตโนมัติ","State · Matching":"สถานะ · กำลังจับคู่","Option · Choose doctor":"ตัวเลือก · เลือกแพทย์","State · No doctor now":"สถานะ · ยังไม่มีแพทย์ว่าง","Default · Chat":"ค่าตั้งต้น · แชท","State · Connecting":"สถานะ · กำลังเชื่อมต่อ","Mode · Video":"โหมด · วิดีโอ","Mode · Voice":"โหมด · เสียง","State · Writing prescription":"สถานะ · กำลังเขียนใบสั่งยา","Plan ready":"แผนพร้อมแล้ว","Prescription document":"เอกสารใบสั่งยา",
    "Pharmacy matching":"จับคู่ร้านยา","State · Finding pharmacy":"สถานะ · กำลังหาร้านยา","Check entitlement":"ตรวจสอบสิทธิ์","Choose policy":"เลือกกรมธรรม์","State · Over limit":"สถานะ · เกินวงเงิน","State · Payment failed":"สถานะ · ชำระเงินไม่สำเร็จ","State · Preparing":"สถานะ · กำลังจัดเตรียม","State · Accepted":"สถานะ · ร้านยารับแล้ว","State · SLA issue":"สถานะ · เกินเวลาที่กำหนด","State · Refund":"สถานะ · คืนเงิน","Rate visit":"ประเมินการปรึกษา","State · Thank you":"สถานะ · ขอบคุณ","State · Empty":"สถานะ · ไม่มีข้อมูล","1 added":"เพิ่มแล้ว 1 รูป",
    /* ---- ineligible ---- */
    "Let's get you the right care":"พาคุณไปสู่การดูแลที่เหมาะสม","This needs in-person care":"กรณีนี้ควรพบแพทย์ที่สถานพยาบาล","What you can do next":"สิ่งที่คุณทำต่อได้",
    /* ---- account ---- */
    "Before your assessment":"ก่อนเริ่มแบบประเมิน","Keep your health information with the right person":"เก็บข้อมูลสุขภาพไว้กับบัญชีที่ถูกต้อง","Create an account or log in before answering health questions. This keeps your assessment, doctor messages and prescriptions together securely.":"สร้างบัญชีหรือเข้าสู่ระบบก่อนตอบคำถามสุขภาพ เพื่อเก็บแบบประเมิน ข้อความจากแพทย์ และใบสั่งยาไว้ด้วยกันอย่างปลอดภัย","Assessment complete":"ทำแบบประเมินเสร็จแล้ว","Save your assessment to your account":"บันทึกแบบประเมินไว้ในบัญชี","Your intake is complete. Create an account or log in to save your answers before reviewing consent.":"แบบประเมินเสร็จแล้ว สร้างบัญชีหรือเข้าสู่ระบบเพื่อบันทึกคำตอบ ก่อนตรวจสอบและให้ความยินยอม","Temporary secure draft":"แบบประเมินชั่วคราวที่ปลอดภัย","Your completed answers stay on this device while you verify your account.":"คำตอบที่ทำเสร็จจะเก็บไว้ชั่วคราวบนอุปกรณ์นี้ ระหว่างที่คุณยืนยันบัญชี","Verify your account next":"ยืนยันบัญชีในขั้นตอนถัดไป","We will verify your phone, patient information and identity before consent.":"เราจะยืนยันเบอร์โทรศัพท์ ข้อมูลผู้รับบริการ และตัวตน ก่อนให้ความยินยอม","I already have an account":"ฉันมีบัญชีแล้ว","Create your account":"สร้างบัญชีของคุณ","Create your secure care account":"สร้างบัญชีสุขภาพที่ปลอดภัย","Your completed assessment will be attached to this account after phone verification.":"แบบประเมินที่ทำเสร็จจะเชื่อมกับบัญชีนี้ หลังยืนยันเบอร์โทรศัพท์","Create account & continue":"สร้างบัญชีและไปต่อ","Continue with LINE":"ดำเนินการต่อด้วย LINE","Continue with Google":"ดำเนินการต่อด้วย Google","Full name":"ชื่อ-นามสกุล","Phone number":"เบอร์โทรศัพท์","Welcome back":"ยินดีต้อนรับกลับ","You'll review service, privacy and telemedicine consent on the next step.":"ขั้นตอนถัดไปจะแสดงข้อตกลงบริการ ความเป็นส่วนตัว และการแพทย์ทางไกลให้ตรวจสอบ","New here? Create an account":"ยังไม่มีบัญชี? สร้างบัญชี",
    /* ---- booking / matching ---- */
    "See a doctor":"พบแพทย์","We'll match you with a doctor":"เราจะจับคู่แพทย์ให้คุณ","Match me with a doctor":"จับคู่แพทย์ให้ฉัน","No doctor free right now?":"ตอนนี้ไม่มีแพทย์ว่าง?","Prefer to choose your doctor?":"อยากเลือกแพทย์เองไหม?","Auto-match (recommended)":"จับคู่อัตโนมัติ (แนะนำ)","Consultation fee due now":"ค่าปรึกษาที่ต้องชำระตอนนี้",
    "Matching you":"กำลังจับคู่","Finding your doctor…":"กำลังหาแพทย์ให้คุณ…","Matching you with a licensed doctor for your concern who is available now. Usually under 10 seconds.":"กำลังจับคู่แพทย์ที่มีใบอนุญาตและเหมาะกับอาการของคุณ โดยปกติใช้เวลาไม่เกิน 10 วินาที","If nobody is available immediately, we'll offer the next suitable appointment automatically.":"หากไม่มีแพทย์ว่างทันที ระบบจะแสดงเวลานัดหมายที่เหมาะสมถัดไปให้โดยอัตโนมัติ","Continue (matched)":"ไปต่อ (จับคู่แล้ว)","Choose your doctor":"เลือกแพทย์","Continue with selected doctor":"ไปต่อกับแพทย์ที่เลือก","Just match me automatically":"จับคู่อัตโนมัติให้เลย",
    "Pick a time":"เลือกเวลา","No doctor is free right now":"ตอนนี้ไม่มีแพทย์ว่าง","Book & pay":"จองและชำระเงิน",
    "Pay consultation fee":"ชำระค่าปรึกษา","Pay with":"ชำระด้วย","QR / PromptPay":"QR / พร้อมเพย์","Credit / debit card":"บัตรเครดิต / เดบิต","Change slot":"เปลี่ยนเวลา",
    /* ---- KBank gateway ---- */
    "Secure payment":"ชำระเงินอย่างปลอดภัย","First payment":"การชำระเงินครั้งแรก","Doctor match":"แพทย์ที่จับคู่","Discount":"ส่วนลด","Pay now":"ชำระตอนนี้","Discount code (optional)":"รหัสส่วนลด (ถ้ามี)","Enter code":"กรอกรหัส",
    "Amount to pay":"ยอดที่ต้องชำระ","Merchant":"ร้านค้า","Amount":"จำนวนเงิน","Card":"บัตร","Mobile banking":"โมบายแบงก์กิ้ง","CVV":"รหัส CVV","Secured":"ปลอดภัย","PromptPay":"พร้อมเพย์",
    "Scan with any Thai banking app · code expires in":"สแกนด้วยแอปธนาคารใดก็ได้ · รหัสหมดอายุใน","You are on KBank's secure page. Krane never sees or stores your card details.":"คุณอยู่บนหน้าชำระเงินที่ปลอดภัยของ KBank · Krane ไม่เห็นและไม่เก็บข้อมูลบัตรของคุณ",
    /* ---- waiting room / consult ---- */
    "Waiting room":"ห้องรอ","Waiting for Dr. Narin to let you in":"กำลังรอ คุณหมอนรินทร์ ทานากะ เรียกเข้าห้อง","Enter the room":"เข้าห้องปรึกษา","Notify me when it's ready":"แจ้งเตือนเมื่อพร้อม",
    "Message your doctor…":"พิมพ์ข้อความถึงแพทย์…","Voice":"เสียง","Video":"วิดีโอ","Consultation fee paid":"ชำระค่าปรึกษาแล้ว",
    /* ---- v3 client-feedback strings ---- */
    "Treatment plan ready":"แผนการรักษาพร้อมแล้ว","Accept plan":"ยอมรับแผน","View full details":"ดูรายละเอียดทั้งหมด",
    "Accepting the plan is a clinical step. Medicine preparation and payment happen separately at the pharmacy step.":"การยอมรับแผนเป็นขั้นตอนทางคลินิก การเตรียมยาและการชำระค่ายาเป็นคนละขั้นตอนที่ฝั่งร้านยา",
    "No doctor approval needed. Your doctor set your refill allowance during the consultation.":"ไม่ต้องรอหมออนุมัติ หมอกำหนดจำนวนสั่งซ้ำให้คุณตั้งแต่ตอนปรึกษาแล้ว",
    "Intake quiz · admin":"แบบสอบถามคัดกรอง · ผู้ดูแล","Edit quiz questions":"แก้ไขคำถาม","Preview":"ดูตัวอย่าง","New intake required":"ต้องกรอกใหม่","Condition":"อาการ","Approved medicine list (channel)":"รายการยาที่อนุมัติ (ช่องทาง)",
    "Once (first visit)":"ครั้งเดียว (ครั้งแรก)","Every visit":"ทุกครั้งที่ปรึกษา",
    "Add your available slots. Doctors can add availability only. Removing or changing existing slots is admin-only.":"เพิ่มช่วงเวลาว่างของคุณ แพทย์เพิ่มเวลาว่างได้เท่านั้น การลบหรือแก้สลอตเดิมเป็นสิทธิ์ผู้ดูแล",
    /* ---- missing-content screens (client v3) ---- */
    "Terms & Conditions":"ข้อกำหนดและเงื่อนไข","Before you start":"ก่อนเริ่มใช้งาน","How the service works":"บริการทำงานอย่างไร","Possible outcomes of care":"ผลที่อาจเกิดจากการรักษา","Risks of telemedicine":"ความเสี่ยงของการแพทย์ทางไกล","I have read and accept the Terms & Conditions.":"ฉันได้อ่านและยอมรับข้อกำหนดและเงื่อนไข",
    "Your consent":"ความยินยอมของคุณ","PDPA · personal data":"PDPA · ข้อมูลส่วนบุคคล","PDPA · account data":"PDPA · ข้อมูลบัญชี","I consent to Krane processing my identity and contact details to create and protect my account.":"ฉันยินยอมให้ Krane ประมวลผลข้อมูลยืนยันตัวตนและข้อมูลติดต่อเพื่อสร้างและปกป้องบัญชีของฉัน","Telemedicine consent":"ความยินยอมการแพทย์ทางไกล","Agree & continue":"ยอมรับและไปต่อ",
    "Verify your identity":"ยืนยันตัวตน","National ID card":"บัตรประชาชน","Selfie holding your ID":"เซลฟีถือบัตรประชาชน","Email":"อีเมล",
    "Verify your code":"ยืนยันรหัส","Enter the code":"กรอกรหัส","Verify & continue":"ยืนยันและไปต่อ",
    "Choose your policy":"เลือกกรมธรรม์","Which policy should we use?":"จะใช้กรมธรรม์ไหนดี?","Continue with this policy":"ใช้กรมธรรม์นี้","Pay myself instead":"จ่ายเองแทน",
    "Adjust your order":"ปรับคำสั่งซื้อ","Over your insurance limit":"เกินวงเงินประกัน","Confirm order":"ยืนยันคำสั่งซื้อ","Reduce items to fit my limit":"ลดจำนวนยาให้พอดีวงเงิน",
    "Prescription":"ใบสั่งยา","Presenting symptom":"อาการที่มารักษา","Diagnosis":"คำวินิจฉัย","Prescription no.":"เลขที่ใบสั่งยา","Issued date":"วันที่ออกใบสั่งยา","Follow-up date":"วันนัดติดตาม","Refills":"จำนวนสั่งซ้ำ","Medicines & directions":"รายการยาและวิธีใช้","Download PDF":"ดาวน์โหลด PDF","Request medical certificate":"ขอใบรับรองแพทย์",
    "Medical certificate":"ใบรับรองแพทย์","Request a certificate":"ขอใบรับรอง","Purpose":"วัตถุประสงค์","Request certificate":"ขอใบรับรอง",
    "Follow-up":"การติดตามผล","Start follow-up consult":"เริ่มปรึกษาติดตามผล","Back to home":"กลับหน้าหลัก",
    "Upload a prescription":"อัปโหลดใบสั่งยา","Order with your own prescription":"สั่งยาด้วยใบสั่งยาของคุณเอง","Upload prescription":"อัปโหลดใบสั่งยา","Submit for review":"ส่งให้ตรวจสอบ",
    "Refer a friend":"แนะนำเพื่อน","Your share code":"รหัสแนะนำของคุณ","Copy code":"คัดลอกรหัส","Share via LINE":"แชร์ผ่าน LINE","Copy link":"คัดลอกลิงก์","Your referrals":"เพื่อนที่คุณแนะนำ","Back to profile":"กลับไปโปรไฟล์","Refer":"แนะนำ",
    "Just a moment…":"สักครู่นะ…","Continue with this policy":"ใช้กรมธรรม์นี้",
    /* ---- plan / accept ---- */
    "Your treatment plan":"แผนการรักษาของคุณ","Prescription details":"รายละเอียดใบสั่งยา","Next follow-up":"นัดติดตามครั้งถัดไป","Refills allowed":"จำนวนครั้งที่สั่งซ้ำได้","Prescription valid until":"ใบสั่งยาใช้ได้ถึง","Accept & continue":"ยอมรับและไปต่อ","Discuss with doctor":"ปรึกษากับแพทย์","Plan accepted":"ยอมรับแผนแล้ว",
    /* ---- address ---- */
    "Delivery address":"ที่อยู่จัดส่ง","Where should we deliver?":"จัดส่งที่ไหนดี?","Search building, condo, landmark or street":"ค้นหาอาคาร คอนโด จุดสังเกต หรือถนน","Building / room":"อาคาร / ห้อง","Floor":"ชั้น","Street / soi":"ถนน / ซอย","District / Province":"เขต / จังหวัด",
    "Delivery speed":"ความเร็วในการจัดส่ง","Same day":"ส่งวันนี้","Next day":"ส่งวันถัดไป","Standard":"มาตรฐาน","Free":"ฟรี",
    /* ---- payment / fulfilment ---- */
    "Secure payment":"ชำระเงินอย่างปลอดภัย","Amount to pay":"ยอดที่ต้องชำระ","Discount code":"รหัสส่วนลด","Medicine subtotal":"ยอดค่ายา","Same-day delivery":"จัดส่งวันนี้","Doctor consultation":"ค่าปรึกษาแพทย์","Card number":"หมายเลขบัตร","Expiry":"วันหมดอายุ","Name on card":"ชื่อบนบัตร",
    "Your order":"คำสั่งซื้อของคุณ","Your medicine is being prepared":"กำลังจัดเตรียมยาของคุณ","Order confirmed":"ยืนยันคำสั่งซื้อแล้ว","Preview ready":"ดูตัวอย่างเมื่อพร้อม",
    "Payment successful":"ชำระเงินสำเร็จ","Fascino Ari confirmed your order and is preparing your medicine now.":"Fascino Ari ยืนยันคำสั่งซื้อของคุณแล้ว และกำลังจัดเตรียมยาให้คุณตอนนี้","Amount paid":"ยอดที่ชำระแล้ว","View order details":"ดูรายละเอียดคำสั่งซื้อ","Same day · by 6pm":"ส่งวันนี้ · ภายใน 18:00 น.",
    "Refund":"คืนเงิน","Your refund is on its way":"กำลังดำเนินการคืนเงินให้คุณ","Back to home":"กลับหน้าหลัก","Start a new consultation":"เริ่มปรึกษาใหม่",
    "Order tracking":"ติดตามคำสั่งซื้อ","Consultation completed":"ปรึกษาเสร็จสิ้น","Medication payment confirmed":"ยืนยันการชำระค่ายาแล้ว","Pharmacy accepted order":"ร้านยารับคำสั่งซื้อแล้ว","Preparing medicine":"กำลังจัดยา","Rider pickup":"ไรเดอร์รับของ","Out for delivery":"กำลังจัดส่ง","Delivered":"จัดส่งสำเร็จ","Pending":"รอดำเนินการ","Next":"ถัดไป",
    /* ---- profile / settings ---- */
    "Hi, Mali":"สวัสดี, Mali","Active treatments":"การรักษาที่กำลังดำเนินอยู่","Active orders":"คำสั่งซื้อที่กำลังดำเนินอยู่","Past orders":"คำสั่งซื้อที่ผ่านมา","On track":"เป็นไปตามแผน","Message":"ข้อความ","Track order":"ติดตามคำสั่งซื้อ","History":"ประวัติ","New consult":"ปรึกษาใหม่",
    "Notifications":"การแจ้งเตือน","New":"ใหม่","Earlier":"ก่อนหน้า","Medical history":"ประวัติการรักษา","Active treatment":"การรักษาปัจจุบัน","Past consultations":"การปรึกษาที่ผ่านมา","Prescriptions":"ใบสั่งยา",
    "Settings":"ตั้งค่า","Account":"บัญชี","Personal details":"ข้อมูลส่วนตัว","Delivery addresses":"ที่อยู่จัดส่ง","Payment methods":"ช่องทางชำระเงิน","Language":"ภาษา","Order updates":"อัปเดตคำสั่งซื้อ","Doctor messages":"ข้อความจากแพทย์","Refill reminders":"แจ้งเตือนการสั่งซ้ำ","Privacy & support":"ความเป็นส่วนตัวและการช่วยเหลือ","Privacy & PDPA consent":"ความเป็นส่วนตัวและความยินยอม PDPA","Help & support":"ช่วยเหลือและสนับสนุน","Log out":"ออกจากระบบ","Profile":"โปรไฟล์","Activities":"กิจกรรม","Alerts":"แจ้งเตือน",
    "Refill a treatment":"สั่งซื้อยาซ้ำ","Refill this treatment":"สั่งซื้อยานี้ซ้ำ","Start a quick re-consult":"เริ่มปรึกษาซ้ำอย่างรวดเร็ว",
    /* ---- health articles ---- */
    "Health guide":"คู่มือสุขภาพ","Start a consultation":"เริ่มการปรึกษา","Consult a doctor":"ปรึกษาแพทย์","Back to guide":"กลับไปคู่มือ",
    /* ============ BACK OFFICE (CMS) ============ */
    "On call":"พร้อมรับเคส","Patient queue":"คิวผู้ป่วย","First day / empty":"วันแรก / ยังว่าง","Consultation":"การปรึกษา","Pre-consult":"ก่อนปรึกษา","Prescribe & send":"สั่งยาและส่ง","Schedule":"ตารางเวลา","My profile":"โปรไฟล์ของฉัน","My practice":"งานของฉัน","Today":"วันนี้","Admin":"ผู้ดูแล","Doctor":"แพทย์",
    "Cases & orders":"เคสและคำสั่งซื้อ","Fulfilment":"การจัดส่ง","Users":"ผู้ใช้","Content (CMS)":"เนื้อหา (CMS)","Pricing":"ราคา",
    "Today's queue":"คิววันนี้","Waiting now":"กำลังรออยู่","In consultation":"กำลังปรึกษา","Plans to send":"แผนที่ต้องส่ง","Avg consult time":"เวลาปรึกษาเฉลี่ย","Open":"เปิด","Resume":"ทำต่อ","Prescribe":"สั่งยา","View":"ดู","Summary":"สรุป","All":"ทั้งหมด","Waiting":"กำลังรอ","In progress":"กำลังดำเนินการ","Plan pending":"รอแผน","Done":"เสร็จสิ้น","Upcoming":"กำลังจะมาถึง","Completed":"เสร็จสมบูรณ์","Submitted":"ส่งแล้ว","Not yet":"ยังไม่ส่ง",
    "Good morning, Dr. Narin":"สวัสดีตอนเช้า, คุณหมอนรินทร์","Go offline":"ออฟไลน์","Go on call":"กลับมาพร้อมรับเคส","Patient ready · waiting to be admitted":"ผู้ป่วยพร้อม · กำลังรอเข้าห้อง","Review & admit":"ตรวจและรับเข้า","Reassign":"จับคู่ใหม่","Today at a glance":"ภาพรวมวันนี้","Patients seen":"ผู้ป่วยที่พบ",
    "Patients can't be matched to you yet":"ยังจับคู่ผู้ป่วยให้คุณไม่ได้","Set your availability":"ตั้งเวลาว่างของคุณ",
    "Start consultation":"เริ่มการปรึกษา","Admit & start consultation":"รับเข้าและเริ่มปรึกษา","Intake answers":"คำตอบแบบสอบถาม","Safety & allergies":"ความปลอดภัยและการแพ้ยา","Past consultations & orders":"ประวัติการปรึกษาและคำสั่งซื้อ","Internal notes":"บันทึกภายใน",
    "Treatment plan":"แผนการรักษา","Approved medicines (hair loss)":"ยาที่อนุมัติ (ผมร่วง)","Send plan to patient":"ส่งแผนให้ผู้ป่วย","Total medicine":"ยอดค่ายารวม",
    /* ---- consultation room, video first (F13/F14), both apps ---- */
    "End call":"วางสาย","Turn video back on":"เปิดวิดีโออีกครั้ง","Demo: patient stops video":"ตัวอย่าง: คนไข้ปิดวิดีโอ",
    "Participants":"ผู้เข้าร่วม","Share Screen":"แชร์หน้าจอ","Leave":"ออกจากห้อง","Recording":"กำลังบันทึก","Encrypted":"เข้ารหัส",
    "Camera off":"ปิดกล้องอยู่","Start my video":"เปิดวิดีโอของฉัน","You":"คุณ",
    "Cam off":"ปิดกล้อง","Cam on":"เปิดกล้อง",
    "Video starts automatically. You can turn it off any time.":"วิดีโอจะเริ่มอัตโนมัติ ปิดได้ทุกเมื่อ",
    "Turning your camera off keeps the call on voice. End hangs up.":"ปิดกล้องแล้วยังคุยด้วยเสียงต่อได้ ปุ่มวางสายคือจบการโทร",
    "Turn your camera back on at any point. End hangs up.":"เปิดกล้องอีกครั้งได้ทุกเมื่อ ปุ่มวางสายคือจบการโทร",
    "You turned your camera off. The consultation continues on voice and chat.":"คุณปิดกล้อง การปรึกษายังดำเนินต่อด้วยเสียงและแชท",
    "Dr. Narin turned their camera off. The consultation continues on voice and chat.":"คุณหมอนรินทร์ปิดกล้อง การปรึกษายังดำเนินต่อด้วยเสียงและแชท",
    "Camera off. The consultation continues on voice and chat.":"ปิดกล้องแล้ว การปรึกษายังดำเนินต่อด้วยเสียงและแชท",
    /* ---- doctor: consultation history + record (F24) ---- */
    "Consultation history":"ประวัติการปรึกษา","2 visits":"2 ครั้ง","Follow-up consultation":"การปรึกษาติดตามผล",
    "Prescription issued":"ออกใบสั่งยาแล้ว","No prescription":"ไม่มีใบสั่งยา",
    "8 May 2026 · Dr. Narin Tanaka · Hair loss":"8 พ.ค. 2026 · คุณหมอนรินทร์ ทานากะ · ผมร่วง",
    "2 Apr 2026 · Dr. Anong · Hair loss":"2 เม.ย. 2026 · คุณหมออนงค์ · ผมร่วง",
    "Open a visit to read the clinical notes and what was prescribed.":"เปิดแต่ละครั้งเพื่ออ่านบันทึกทางคลินิกและยาที่สั่ง",
    "Consultation record":"บันทึกการปรึกษา","‹ Back to patient profile":"‹ กลับไปข้อมูลผู้ป่วย",
    "Clinical notes":"บันทึกทางคลินิก","Medicine prescribed":"ยาที่สั่ง","Visit summary":"สรุปการปรึกษา","Date":"วันที่","Doctor":"แพทย์",
    "Intake answers at the time":"คำตอบแบบสอบถามในครั้งนั้น",
    "Internal notes are shared across the Krane clinical team and are never shown to the patient.":"บันทึกภายในใช้ร่วมกันในทีมแพทย์ของ Krane และไม่แสดงให้ผู้ป่วยเห็น",
    "No medicine was prescribed in this visit.":"การปรึกษาครั้งนี้ไม่ได้สั่งยา",
    "Refills allowed 3 · dispatched by Fascino Ari · delivered 12 May 2026":"เติมยาซ้ำได้ 3 ครั้ง · จัดส่งโดย Fascino อารีย์ · ส่งถึง 12 พ.ค. 2026",
    "Norwood II with early frontal recession. Family history on the maternal side. Discussed finasteride and topical minoxidil, including the side effect profile. Patient prefers to think it over before starting medicine. Asked for follow-up photos in 4 weeks.":"ผมร่วงระดับ Norwood II แนวผมด้านหน้าเริ่มร่น มีประวัติในครอบครัวฝั่งมารดา ได้อธิบายยาฟีนาสเตอไรด์และไมนอกซิดิลชนิดทา รวมถึงผลข้างเคียง ผู้ป่วยขอกลับไปตัดสินใจก่อนเริ่มยา นัดส่งรูปติดตามผลใน 4 สัปดาห์",
    "Comparison photos show continued frontal thinning since April. No contraindications and no drug allergies. Started finasteride 1mg daily with topical minoxidil 5% twice daily. Explained that visible change takes about 3 months. Review at 12 weeks.":"รูปเปรียบเทียบแสดงว่าผมด้านหน้าบางลงต่อเนื่องตั้งแต่เดือนเมษายน ไม่มีข้อห้ามใช้ยาและไม่มีประวัติแพ้ยา เริ่มฟีนาสเตอไรด์ 1 มก. วันละครั้ง ร่วมกับไมนอกซิดิล 5% ทาวันละ 2 ครั้ง อธิบายว่าจะเห็นผลชัดประมาณ 3 เดือน นัดประเมินซ้ำที่ 12 สัปดาห์",
    "Handover note: patient returned after the April visit and is ready to start treatment. Baseline photos are in the record.":"บันทึกส่งต่อ ผู้ป่วยกลับมาหลังการปรึกษาเดือนเมษายนและพร้อมเริ่มการรักษา รูปตั้งต้นอยู่ในบันทึกแล้ว",
    "1 tablet daily":"วันละ 1 เม็ด","Apply 1ml twice daily":"ทา 1 มล. วันละ 2 ครั้ง",
    "Consultation length":"ระยะเวลาการปรึกษา","Follow-up set":"นัดติดตามผล","Photos in 4 weeks":"ส่งรูปใน 4 สัปดาห์",
    "18 min":"18 นาที","22 min":"22 นาที","2 Apr 2026":"2 เม.ย. 2026","8 May 2026":"8 พ.ค. 2026","12 Sep 2026":"12 ก.ย. 2026",
    "Dr. Narin Tanaka":"คุณหมอนรินทร์ ทานากะ","Dr. Anong":"คุณหมออนงค์",
    "2 uploaded":"อัปโหลดแล้ว 2 รูป","3 uploaded":"อัปโหลดแล้ว 3 รูป","Duration":"ระยะเวลา",
    "Photos from the patient":"รูปที่ผู้ป่วยส่งมา","Front hairline":"แนวไรผมด้านหน้า","Crown":"กลางศีรษะ","Back of the head":"ท้ายทอย",
    "2 Apr 2026 · 10:41":"2 เม.ย. 2026 · 10:41","2 Apr 2026 · 10:42":"2 เม.ย. 2026 · 10:42",
    "8 May 2026 · 13:52":"8 พ.ค. 2026 · 13:52","8 May 2026 · 13:53":"8 พ.ค. 2026 · 13:53","8 May 2026 · 13:54":"8 พ.ค. 2026 · 13:54",
    "2 Apr 2026 · 11:24":"2 เม.ย. 2026 · 11:24","8 May 2026 · 14:06":"8 พ.ค. 2026 · 14:06","8 May 2026 · 09:15":"8 พ.ค. 2026 · 09:15",
    "My schedule":"ตารางเวลาของฉัน","Add availability":"เพิ่มเวลาว่าง","Copy last week":"คัดลอกสัปดาห์ที่แล้ว","Available":"ว่าง","Booked":"ถูกจอง","Off":"หยุด",
    "Cases & orders":"เคสและคำสั่งซื้อ","Active cases":"เคสที่กำลังดำเนินอยู่","Awaiting payment":"รอชำระเงิน","Export":"ส่งออก","Stalled":"ค้าง","Stage":"ขั้นตอน","Updated":"อัปเดต","Patient":"ผู้ป่วย",
    "Delivery status":"สถานะการจัดส่ง","Update status":"อัปเดตสถานะ","Manual status override":"เปลี่ยนสถานะด้วยตนเอง","Branch":"สาขา",
    "Add user":"เพิ่มผู้ใช้","Role":"บทบาท","Status":"สถานะ","Active":"ใช้งานอยู่","Deactivated":"ปิดใช้งาน","Manage":"จัดการ","Patients":"ผู้ป่วย","Doctors":"แพทย์","Admins":"ผู้ดูแล","Partner doctor":"แพทย์พาร์ตเนอร์",
    "Content":"เนื้อหา","New article":"บทความใหม่","Title":"หัวข้อ","Category":"หมวดหมู่","Author":"ผู้เขียน","Published":"เผยแพร่แล้ว","Pending approval":"รออนุมัติ","Draft":"ฉบับร่าง","Approve":"อนุมัติ","Approve & publish":"อนุมัติและเผยแพร่","Send back to draft":"ส่งกลับเป็นฉบับร่าง",
    "Save changes":"บันทึกการเปลี่ยนแปลง","Margin":"กำไรส่วนต่าง",
    "Details":"รายละเอียด","Admin-managed":"จัดการโดยผู้ดูแล","You manage":"คุณจัดการได้","Signature":"ลายเซ็น","Upload new signature":"อัปโหลดลายเซ็นใหม่","Edit availability":"แก้ไขเวลาว่าง",
    /* ---- coverage pass (B2C buttons / status / payment / edge states) ---- */
    "Create account":"สร้างบัญชี","Choose an option":"เลือกตัวเลือก","Confirm choice":"ยืนยันตัวเลือก","Pay now":"ชำระเงินตอนนี้","Payment":"การชำระเงิน","Delivery":"การจัดส่ง","Subtotal":"ยอดรวมย่อย","Order total":"ยอดรวมทั้งหมด","Amount":"จำนวนเงิน","Amount due":"ยอดที่ต้องชำระ","Discount":"ส่วนลด","Discount code (optional)":"รหัสส่วนลด (ไม่บังคับ)","Try again":"ลองอีกครั้ง","View plan":"ดูแผนการรักษา","View treatment plan":"ดูแผนการรักษา","Review treatment plan":"ตรวจดูแผนการรักษา","Submit feedback":"ส่งความคิดเห็น","Use a different method":"ใช้วิธีอื่น","Go to home":"กลับหน้าแรก","Back to matching":"กลับไปจับคู่แพทย์","Pick a time instead":"เลือกเวลาแทน","Review my answers":"ตรวจทานคำตอบของฉัน","Choose delivery":"เลือกการจัดส่ง","Request a refund instead":"ขอคืนเงินแทน",
    "Mild":"เล็กน้อย","Moderate":"ปานกลาง","Severe or rapidly worsening":"รุนแรงหรือแย่ลงอย่างรวดเร็ว","Default":"ค่าเริ่มต้น","Pharmacy":"ร้านยา","Preparing":"กำลังเตรียม","Online":"ออนไลน์","End":"วางสาย","Cam":"กล้อง","Mute":"ปิดเสียง","Spkr":"ลำโพง","Skin":"ผิว","Passport":"พาสปอร์ต","ID card":"บัตรประชาชน","Reference":"เลขอ้างอิง","Expires":"หมดอายุ","Merchant":"ร้านค้า","Secured":"ปลอดภัย","Identification":"การยืนยันตัวตน","Same-day":"ส่งวันนี้","Next-day":"ส่งวันถัดไป","Card":"บัตร","Mobile banking":"โมบายแบงก์กิ้ง","First payment":"การชำระเงินครั้งแรก","Consultation fee":"ค่าปรึกษา","Doctor match":"แพทย์ที่จับคู่","Current status":"สถานะปัจจุบัน","Estimated next step":"ขั้นตอนถัดไปโดยประมาณ","Current medication":"ยาที่ใช้อยู่","Date of birth":"วันเกิด","Medicines":"ยา","Medication order":"รายการสั่งยา","Last order":"คำสั่งซื้อล่าสุด","No active orders":"ไม่มีคำสั่งซื้อที่ดำเนินอยู่","Orders needing action":"คำสั่งซื้อที่ต้องดำเนินการ","Nothing here yet":"ยังไม่มีรายการ","Symptom duration":"ระยะเวลาของอาการ","Symptom severity":"ความรุนแรงของอาการ","Before your doctor":"ก่อนพบแพทย์","Almost done":"เกือบเสร็จแล้ว","Confirm your symptoms":"ยืนยันอาการของคุณ",
    "How was your consultation?":"การปรึกษาเป็นอย่างไรบ้าง?","This is taking longer than expected":"ใช้เวลานานกว่าที่คาดไว้","Same-day preparation is taking longer than expected":"การเตรียมยาแบบส่งวันนี้ใช้เวลานานกว่าที่คาด","Payment didn't go through":"การชำระเงินไม่สำเร็จ","Your bank declined the charge. No money has been taken.":"ธนาคารปฏิเสธการชำระเงิน ยังไม่มีการตัดเงิน","Treatment plan ready":"แผนการรักษาพร้อมแล้ว","Treatment plan accepted":"ยอมรับแผนการรักษาแล้ว","Your medicine is being prepared.":"กำลังจัดเตรียมยาของคุณ","Payment received":"ได้รับการชำระเงินแล้ว","You're all set.":"เรียบร้อยแล้ว","Your refund has been returned to your card":"คืนเงินเข้าบัตรของคุณแล้ว","Refund amount":"จำนวนเงินที่คืน","Refunded to":"คืนเงินไปยัง","You are in the queue":"คุณอยู่ในคิว","In waiting room":"อยู่ในห้องรอ","Prepare while you wait":"เตรียมตัวระหว่างรอ","Intake submitted":"ส่งแบบสอบถามแล้ว","Admitted to the room":"เข้าห้องปรึกษาแล้ว","Doctor is preparing the room":"แพทย์กำลังเตรียมห้อง","Reviewing availability":"กำลังตรวจสอบแพทย์ที่ว่าง","Assigning your doctor":"กำลังมอบหมายแพทย์ให้คุณ","Two doctors are available now":"มีแพทย์ว่าง 2 ท่านในขณะนี้","No doctor available right now?":"ตอนนี้ไม่มีแพทย์ว่าง?","Cancel & refund this order":"ยกเลิกและคืนเงินคำสั่งซื้อนี้","Switch to next-day delivery":"เปลี่ยนเป็นจัดส่งวันถัดไป","Keep waiting for same-day":"รอจัดส่งวันนี้ต่อไป","Full refund back to your card":"คืนเงินเต็มจำนวนเข้าบัตรของคุณ","Receipt saved to your account":"บันทึกใบเสร็จในบัญชีของคุณแล้ว","Doctor can review your answers & photos":"แพทย์สามารถดูคำตอบและรูปภาพของคุณได้","Chat first, video available":"เริ่มด้วยแชท วิดีโอพร้อมใช้งาน","Fastest way to be seen by a licensed doctor":"วิธีที่เร็วที่สุดในการพบแพทย์ที่มีใบอนุญาต","If you do nothing, auto-match remains the fastest route.":"หากไม่เลือก ระบบจับคู่อัตโนมัติยังเป็นวิธีที่เร็วที่สุด","We'll confirm the match in a moment":"เราจะยืนยันการจับคู่ในอีกสักครู่","Checking doctors online for your concern":"กำลังตรวจสอบแพทย์ออนไลน์สำหรับอาการของคุณ","Begin your first consultation":"เริ่มการปรึกษาครั้งแรกของคุณ","New here? Start a consultation":"เพิ่งเริ่มใช้งาน? เริ่มการปรึกษา","Pick up your treatment and consultations where you left off.":"กลับมาดูการรักษาและการปรึกษาที่ค้างไว้","By continuing you agree to our terms & privacy policy.":"การดำเนินการต่อถือว่าคุณยอมรับข้อกำหนดและนโยบายความเป็นส่วนตัว","We'll send a one-time code (OTP) to verify it's you.":"เราจะส่งรหัส OTP เพื่อยืนยันตัวตนของคุณ","We'll text a one-time code (OTP). No password needed.":"เราจะส่งรหัส OTP ทาง SMS ไม่ต้องใช้รหัสผ่าน","or use your phone":"หรือใช้เบอร์โทรศัพท์","ID / passport number":"เลขบัตรประชาชน / พาสปอร์ต","Packaged discreetly, no clinic branding on the outside.":"บรรจุอย่างมิดชิด ไม่มีตราคลินิกด้านนอก","Shared only with your assigned doctor.":"แชร์ให้เฉพาะแพทย์ที่ดูแลคุณเท่านั้น","Structured choices help the doctor spot interactions quickly.":"ตัวเลือกที่เป็นระบบช่วยให้แพทย์เห็นปฏิกิริยาระหว่างยาได้เร็ว","Your feedback is private and helps us improve care quality.":"ความคิดเห็นของคุณเป็นความลับ และช่วยให้เราพัฒนาคุณภาพการดูแล","Thanks for the feedback.":"ขอบคุณสำหรับความคิดเห็น","Overall satisfaction":"ความพึงพอใจโดยรวม","Your experience end to end":"ประสบการณ์ของคุณตั้งแต่ต้นจนจบ","Video quality":"คุณภาพวิดีโอ","Voice quality":"คุณภาพเสียง","Care, clarity & attentiveness":"การดูแล ความชัดเจน และความใส่ใจ",
    "Noticeable but not affecting daily life":"สังเกตได้แต่ไม่กระทบชีวิตประจำวัน","Affecting confidence, comfort or routine":"กระทบความมั่นใจ ความสบายใจ หรือกิจวัตร","Have you tried any hair loss treatment before?":"คุณเคยลองรักษาผมร่วงมาก่อนหรือไม่?","No previous treatment":"ไม่เคยรักษามาก่อน","Stopped because of side effects":"หยุดเพราะผลข้างเคียง","Currently under specialist care for this issue":"อยู่ระหว่างการดูแลของแพทย์เฉพาะทางสำหรับเรื่องนี้","Not sure":"ไม่แน่ใจ","None of these apply":"ไม่มีข้อใดตรง","No, this is my first time.":"ไม่เคย นี่เป็นครั้งแรก","Sure, go ahead.":"ได้เลย ดำเนินการต่อ","No current medication":"ไม่มียาที่ใช้อยู่","No recent medication":"ไม่มียาที่ใช้ล่าสุด","Blood pressure or heart medication":"ยาความดันหรือยาหัวใจ","ED medication or performance supplements":"ยารักษา ED หรืออาหารเสริมสมรรถภาพ","Antidepressants, sleep aids or anxiety medicine":"ยาต้านซึมเศร้า ยานอนหลับ หรือยาคลายกังวล","Antibiotics, steroids or anti-inflammatory medicine":"ยาปฏิชีวนะ สเตียรอยด์ หรือยาต้านการอักเสบ","Hormone, prostate or fertility medication":"ยาฮอร์โมน ต่อมลูกหมาก หรือยาเจริญพันธุ์","Supplements or herbal products":"อาหารเสริมหรือผลิตภัณฑ์สมุนไพร","Medicine allergy":"แพ้ยา","Food or supplement allergy":"แพ้อาหารหรืออาหารเสริม","Skin product or topical allergy":"แพ้ผลิตภัณฑ์ผิวหรือยาทา","Over-the-counter product":"ยาที่ซื้อได้เอง","Medicine prescribed by a doctor":"ยาที่แพทย์สั่ง","Used within the past 3 months":"ใช้ภายใน 3 เดือนที่ผ่านมา","Other medication or allergy details (optional)":"รายละเอียดยาหรือการแพ้อื่น ๆ (ไม่บังคับ)","Anything else? (optional)":"มีอะไรเพิ่มเติมไหม? (ไม่บังคับ)","Chest pain, fainting or shortness of breath":"เจ็บหน้าอก เป็นลม หรือหายใจลำบาก","Severe pain, swelling, fever or infection signs":"ปวดรุนแรง บวม ไข้ หรือสัญญาณติดเชื้อ","Sudden major symptom change":"อาการเปลี่ยนแปลงรุนแรงเฉียบพลัน","Including nitrates or chest-pain medicine":"รวมถึงยาไนเตรตหรือยาแก้เจ็บหน้าอก","Check basic eligibility":"ตรวจสอบคุณสมบัติเบื้องต้น","Thinning, receding hairline, shedding or scalp concerns.":"ผมบาง แนวผมร่น ผมร่วง หรือปัญหาหนังศีรษะ","Acne, irritation, rash or ageing-related concerns.":"สิว การระคายเคือง ผื่น หรือปัญหาเรื่องวัย","Crown, temples, hairline or overall density":"กลางศีรษะ ขมับ แนวผม หรือความหนาแน่นโดยรวม","Use this when the concern does not fit a named condition.":"ใช้เมื่ออาการไม่ตรงกับโรคที่ระบุไว้","Use General consultation if none of these fits":"เลือกปรึกษาทั่วไปหากไม่มีข้อใดตรง","Skin care":"ดูแลผิว","General appearance consultation":"ปรึกษาเรื่องรูปลักษณ์ทั่วไป","Hair, skin or sexual-health treatment":"การรักษาเรื่องผม ผิว หรือสุขภาพเพศ",
    "Prescribed by Dr. Narin":"สั่งโดย คุณหมอนรินทร์ ทานากะ","Can request more medication?":"ขอยาเพิ่มได้หรือไม่?","Yes · while valid":"ได้ · ระหว่างที่ใบสั่งยายังไม่หมดอายุ","No refills left":"สั่งซ้ำครบแล้ว","Allowance used · needs a new consult":"ใช้สิทธิ์ครบแล้ว · ต้องปรึกษาใหม่","Hair loss treatment":"การรักษาผมร่วง","Hair loss review":"ทบทวนการรักษาผมร่วง","Hair loss refill":"สั่งยาผมร่วงซ้ำ","Initial consultation":"การปรึกษาครั้งแรก","Message from your doctor":"ข้อความจากแพทย์","Your doctor has shared a recommended plan.":"แพทย์ได้แชร์แผนการรักษาที่แนะนำให้คุณแล้ว","Your doctor shared a recommended plan.":"แพทย์ได้แชร์แผนการรักษาที่แนะนำ","After packing":"หลังแพ็คเสร็จ","Pharmacy accepted · medicine being prepared":"ร้านยารับแล้ว · กำลังจัดยา","Pay myself instead":"ชำระเงินเอง","Check insurance entitlement":"ตรวจสอบสิทธิประกัน","Use insurance credit":"ใช้วงเงินประกัน","Nurse check-in":"พบพยาบาลคัดกรอง","Start nurse check-in":"เริ่มการคัดกรองกับพยาบาล","Refer you to the right doctor":"ส่งต่อให้คุณพบแพทย์ที่เหมาะสม",
    /* ---- coverage pass 2 (status / fulfilment / edge / edu / articles) ---- */
    "Accepted · Fascino Ari":"รับแล้ว · Fascino Ari","Allowed":"อนุญาตให้สั่งซ้ำ","Apply twice daily · regrowth":"ทาวันละสองครั้ง · ช่วยให้ผมงอกใหม่","Arrives tomorrow · we refund the same-day fee":"ถึงพรุ่งนี้ · คืนค่าส่งวันนี้ให้","Arriving by 6pm today":"ถึงภายใน 18:00 น. วันนี้","Audio clarity during the call":"ความชัดของเสียงระหว่างการโทร","Clarity of the video stream":"ความชัดของภาพวิดีโอ","Clinic procedure or lab test":"หัตถการที่คลินิกหรือการตรวจแล็บ","Connecting…":"กำลังเชื่อมต่อ…","Consultation receipt":"ใบเสร็จค่าปรึกษา","Continue to delivery & medication payment":"ไปต่อที่การจัดส่งและชำระค่ายา","Delivery & status alerts":"แจ้งเตือนการจัดส่งและสถานะ","Dermatology · available now · licensed doctor":"ผิวหนัง · ว่างตอนนี้ · แพทย์มีใบอนุญาต","Does finasteride really work?":"ฟีนาสเตอไรด์ได้ผลจริงไหม?","Estimated by 6pm":"ประมาณ 18:00 น.","Great. I'm preparing a treatment plan for you now.":"เยี่ยมเลย กำลังจัดเตรียมแผนการรักษาให้คุณ","Hair thinning":"ผมบาง","Healthy habits for your hair":"นิสัยดี ๆ เพื่อสุขภาพผม","Insurance check":"ตรวจสอบสิทธิประกัน","Preview slow / SLA fallback":"ดูตัวอย่างกรณีล่าช้า / เกิน SLA","Refill reminder":"แจ้งเตือนการสั่งซ้ำ","Registered nurse · partner: MTL":"พยาบาลวิชาชีพ · พาร์ตเนอร์: MTL","Same-day · completed":"ส่งวันนี้ · เสร็จสิ้น","Skip (when not required)":"ข้าม (เมื่อไม่จำเป็น)","Tags:":"แท็ก:","Take a photo or upload":"ถ่ายรูปหรืออัปโหลด","Tap to choose next-day, wait, or refund":"แตะเพื่อเลือกส่งวันถัดไป รอ หรือคืนเงิน","The consultation fee is separate and is not affected by this refund.":"ค่าปรึกษาแยกต่างหากและไม่ได้รับผลกระทบจากการคืนเงินนี้","The good news:":"ข่าวดี:","These answers help us decide whether online care is suitable today.":"คำตอบเหล่านี้ช่วยให้เราตัดสินใจว่าการดูแลออนไลน์เหมาะสมในวันนี้หรือไม่","Today's doctor availability":"แพทย์ที่ว่างวันนี้","Tomorrow 09:30":"พรุ่งนี้ 09:30","We'll keep trying and keep you posted":"เราจะพยายามต่อและแจ้งให้คุณทราบ","You can adjust how much to draw from your credit limit (F35.3).":"คุณสามารถปรับจำนวนที่จะใช้จากวงเงินได้","You pay (overage)":"คุณชำระ (ส่วนเกิน)","You're next. Please wait to be admitted":"คุณเป็นคิวถัดไป กรุณารอเรียกเข้าห้อง","Your doctor":"แพทย์ของคุณ","Your next refill is due in 24 days.":"ครบกำหนดสั่งซ้ำครั้งถัดไปในอีก 24 วัน","can drive hair shedding and thinning.":"อาจทำให้ผมร่วงและผมบางได้","doctor-led treatment":"การรักษาที่นำโดยแพทย์","Paying with insurance? Check entitlement →":"จ่ายด้วยประกัน? ตรวจสอบสิทธิ์ →","· Come back and consult us once you've been assessed":"· กลับมาปรึกษาเราอีกครั้งหลังได้รับการประเมิน","· Message our care team if you think this is a mistake":"· ส่งข้อความถึงทีมดูแลหากคิดว่านี่เป็นข้อผิดพลาด","· See a doctor at a clinic or hospital near you":"· พบแพทย์ที่คลินิกหรือโรงพยาบาลใกล้คุณ","“Let me know how you're getting on with the plan.”":"“บอกฉันด้วยว่าแผนการรักษาเป็นอย่างไรบ้าง”",
    "Hair loss · 4 min read":"ผมร่วง · อ่าน 4 นาที","Hair loss · 3 min read":"ผมร่วง · อ่าน 3 นาที","Lifestyle · 5 min read":"ไลฟ์สไตล์ · อ่าน 5 นาที","What the evidence says, when results usually appear, and what to ask your doctor.":"สรุปหลักฐาน ช่วงเวลาที่มักเริ่มเห็นผล และคำถามที่ควรถามแพทย์","Read article":"อ่านบทความ",
    /* ---- coverage pass 3 (body paragraphs / hints / PDPA consent) ---- */
    "A clear photo helps the doctor assess you accurately. For hair loss, show the thinning area from the top and front. You can skip this and add photos later.":"รูปที่ชัดเจนช่วยให้แพทย์ประเมินคุณได้แม่นยำ สำหรับผมร่วง ให้ถ่ายบริเวณที่ผมบางจากด้านบนและด้านหน้า คุณสามารถข้ามขั้นตอนนี้และเพิ่มรูปภายหลังได้",
    "A licensed doctor for your concern is assigned automatically. No need to pick a slot. If one is online now, you'll be connected right away.":"แพทย์ที่มีใบอนุญาตสำหรับอาการของคุณจะถูกจับคู่ให้โดยอัตโนมัติ ไม่ต้องเลือกเวลา หากมีแพทย์ออนไลน์อยู่ คุณจะได้เชื่อมต่อทันที",
    "A nurse will run a quick screening so you see the right doctor. This usually takes 2-3 minutes.":"พยาบาลจะคัดกรองเบื้องต้นเพื่อให้คุณได้พบแพทย์ที่เหมาะสม โดยทั่วไปใช้เวลา 2-3 นาที",
    "A refill lets you request more of this medicine without restarting the consultation flow, up to the number your doctor allowed and before the prescription expires.":"การสั่งซ้ำช่วยให้คุณขอรับยานี้เพิ่มได้โดยไม่ต้องเริ่มการปรึกษาใหม่ ภายในจำนวนที่แพทย์อนุญาตและก่อนใบสั่งยาหมดอายุ",
    "Based on your answers, an online consultation isn't the safest option for you right now.":"จากคำตอบของคุณ การปรึกษาออนไลน์อาจไม่ใช่ทางเลือกที่ปลอดภัยที่สุดสำหรับคุณในขณะนี้",
    "Choose a time when a doctor is available and we'll match you and remind you before it starts.":"เลือกเวลาที่มีแพทย์ว่าง แล้วเราจะจับคู่ให้และเตือนคุณก่อนเริ่ม",
    "Clinical step: review and accept the treatment plan. Medication payment happens separately after this.":"ขั้นตอนทางการแพทย์: ตรวจสอบและยอมรับแผนการรักษา การชำระค่ายาจะแยกทำหลังจากนี้",
    "Consultation fee received. The doctor can see your intake and is preparing the consultation room.":"ได้รับค่าปรึกษาแล้ว แพทย์สามารถดูแบบสอบถามของคุณและกำลังเตรียมห้องปรึกษา",
    "Dr. Narin joins the room first. You'll be admitted the moment they're ready. Please keep this screen open.":"คุณหมอนรินทร์ ทานากะ จะเข้าห้องก่อน คุณจะได้รับเข้าทันทีที่แพทย์พร้อม กรุณาเปิดหน้าจอนี้ค้างไว้",
    "Drag the map to set the pin, or search your building. Your saved address is prefilled below.":"ลากแผนที่เพื่อปักหมุด หรือค้นหาอาคารของคุณ ที่อยู่ที่บันทึกไว้ถูกกรอกไว้ด้านล่างแล้ว",
    "Eligible refills go straight to delivery and medication payment. A new consultation is only needed when the prescription has expired or no refills remain.":"การสั่งซ้ำที่เข้าเกณฑ์จะไปที่การจัดส่งและชำระค่ายาทันที จำเป็นต้องปรึกษาใหม่เฉพาะเมื่อใบสั่งยาหมดอายุหรือสั่งซ้ำครบแล้ว",
    "Fascino Ari accepted the prescription and is preparing your medicine in discreet packaging.":"Fascino Ari รับใบสั่งยาแล้วและกำลังจัดเตรียมยาของคุณในบรรจุภัณฑ์ที่มิดชิด",
    "Finasteride is a once-daily tablet that lowers the hormone linked to male-pattern hair loss. Most people notice results after 3-6 months of consistent use.":"ฟีนาสเตอไรด์เป็นยาเม็ดวันละครั้งที่ช่วยลดฮอร์โมนที่เกี่ยวข้องกับผมร่วงแบบพันธุกรรมในผู้ชาย ส่วนใหญ่จะเห็นผลหลังใช้ต่อเนื่อง 3-6 เดือน",
    "Hi, I've reviewed your intake. A couple of quick questions before I recommend a plan.":"สวัสดีครับ ผมได้ตรวจแบบสอบถามของคุณแล้ว ขอถามสั้น ๆ สองสามข้อก่อนแนะนำแผนการรักษา",
    "I consent to Krane processing my health data and photos for this consultation (PDPA). Consent is recorded and timestamped.":"ฉันยินยอมให้ Krane ประมวลผลข้อมูลสุขภาพและรูปภาพของฉันสำหรับการปรึกษานี้ (PDPA) ความยินยอมจะถูกบันทึกพร้อมวันเวลา",
    "I consent to the processing of my health data for this treatment (PDPA).":"ฉันยินยอมให้ประมวลผลข้อมูลสุขภาพของฉันสำหรับการรักษานี้ (PDPA)",
    "It goes straight to our care team. Your treatment plan is ready to review.":"ข้อความจะส่งตรงถึงทีมดูแลของเรา แผนการรักษาของคุณพร้อมให้ตรวจสอบแล้ว",
    "Keep this screen open, stay somewhere private, and have your current medication or allergy details nearby in case the doctor asks.":"เปิดหน้าจอนี้ค้างไว้ อยู่ในที่ส่วนตัว และเตรียมข้อมูลยาที่ใช้อยู่หรือประวัติการแพ้ไว้ใกล้ตัวเผื่อแพทย์สอบถาม",
    "Krane can assign one automatically, or you can choose from the available doctor cards.":"Krane สามารถจับคู่ให้อัตโนมัติ หรือคุณจะเลือกจากการ์ดแพทย์ที่ว่างก็ได้",
    "Leaving this screen will not cancel your place, but keeping it open helps you enter quickly.":"การออกจากหน้าจอนี้จะไม่ยกเลิกคิวของคุณ แต่การเปิดค้างไว้ช่วยให้คุณเข้าห้องได้เร็วขึ้น",
    "Matching you with a licensed doctor for hair loss who is available now. This usually takes a few seconds.":"กำลังจับคู่คุณกับแพทย์ที่มีใบอนุญาตด้านผมร่วงที่ว่างอยู่ตอนนี้ โดยทั่วไปใช้เวลาไม่กี่วินาที",
    "Medicine is dispensed and delivered by our partner pharmacy. You are paying for the prescribed medicine and delivery only; the consultation fee was already paid before the doctor room.":"ยาจะถูกจ่ายและจัดส่งโดยร้านยาพาร์ตเนอร์ของเรา คุณชำระเฉพาะค่ายาที่สั่งและค่าจัดส่งเท่านั้น ค่าปรึกษาได้ชำระไปแล้วก่อนเข้าห้องแพทย์",
    "Not sure about an item? Message your doctor to adjust before you accept.":"ไม่แน่ใจเกี่ยวกับรายการใด? ส่งข้อความถึงแพทย์เพื่อปรับก่อนยอมรับ",
    "One or more of your responses suggests a condition that a doctor should assess face-to-face before prescribing. We don't want to recommend treatment that isn't right for you.":"คำตอบของคุณบางข้อบ่งชี้ถึงภาวะที่แพทย์ควรตรวจประเมินแบบพบหน้าก่อนสั่งยา เราไม่ต้องการแนะนำการรักษาที่ไม่เหมาะกับคุณ",
    "Paid once to enter the doctor consultation. If the doctor prescribes medicine, medication and delivery are paid separately afterwards.":"ชำระครั้งเดียวเพื่อเข้าปรึกษาแพทย์ หากแพทย์สั่งยา ค่ายาและค่าจัดส่งจะชำระแยกภายหลัง",
    "Photos are visible only to your assigned doctor and are stored securely under PDPA.":"รูปภาพจะมองเห็นได้เฉพาะแพทย์ที่ดูแลคุณ และถูกจัดเก็บอย่างปลอดภัยตาม PDPA",
    "Same-day delivery can't be guaranteed for this order right now. Choose what works best for you. Your payment is safe.":"ขณะนี้ไม่สามารถรับประกันการจัดส่งภายในวันนี้สำหรับคำสั่งซื้อนี้ได้ เลือกตัวเลือกที่เหมาะกับคุณที่สุด การชำระเงินของคุณปลอดภัย",
    "Same-day price is calculated from the distance to the nearest pharmacy branch with your items in stock.":"ค่าจัดส่งวันนี้คำนวณจากระยะทางไปยังสาขาร้านยาที่ใกล้ที่สุดซึ่งมีสินค้าของคุณในสต็อก",
    "The pharmacy confirmed your order and same-day delivery. It's now being packed discreetly.":"ร้านยายืนยันคำสั่งซื้อและการจัดส่งวันนี้แล้ว กำลังแพ็คอย่างมิดชิด",
    "The pharmacy has your order and is packing it now. We'll let you know the moment it's on the way.":"ร้านยาได้รับคำสั่งซื้อของคุณและกำลังแพ็ค เราจะแจ้งให้ทราบทันทีที่จัดส่ง",
    "These licensed doctors are available for hair loss now. This card view also appears when the choose-doctor feature is enabled for a service channel.":"แพทย์ที่มีใบอนุญาตเหล่านี้ว่างสำหรับผมร่วงตอนนี้ มุมมองการ์ดนี้จะปรากฏเมื่อเปิดฟีเจอร์เลือกแพทย์สำหรับช่องทางบริการด้วย",
    "This article is for education only and isn't a substitute for a consultation. Talk to a Krane doctor about what's right for you.":"บทความนี้มีไว้เพื่อให้ความรู้เท่านั้น ไม่ใช่การทดแทนการปรึกษาแพทย์ ปรึกษาแพทย์ของ Krane เกี่ยวกับสิ่งที่เหมาะกับคุณ",
    "This can happen if the card has insufficient funds or the QR code expired. Your treatment plan is saved. Try again or pick another method.":"อาจเกิดขึ้นได้หากบัตรมีเงินไม่พอหรือ QR หมดอายุ แผนการรักษาของคุณถูกบันทึกไว้ ลองอีกครั้งหรือเลือกวิธีอื่น",
    "This payment unlocks the doctor consultation. Medicine is not included here and is paid only if the doctor prescribes a treatment plan.":"การชำระเงินนี้เป็นการปลดล็อกการปรึกษาแพทย์ ยาไม่รวมอยู่ในนี้และจะชำระเฉพาะเมื่อแพทย์สั่งแผนการรักษา",
    "This room stays open until the doctor closes it and shares the treatment plan.":"ห้องนี้จะเปิดอยู่จนกว่าแพทย์จะปิดและส่งแผนการรักษา",
    "We've refunded this medication order in full. Your bank may take a few days to show it on your statement.":"เราได้คืนเงินค่ายานี้เต็มจำนวนแล้ว ธนาคารของคุณอาจใช้เวลาสองสามวันจึงจะแสดงในรายการเดินบัญชี",
    "When you accept a treatment plan, your orders and deliveries will show up here.":"เมื่อคุณยอมรับแผนการรักษา คำสั่งซื้อและการจัดส่งของคุณจะปรากฏที่นี่",
    "You are on KBank's secure page. Krane never sees or stores your card details.":"คุณอยู่บนหน้าชำระเงินที่ปลอดภัยของ KBank Krane จะไม่เห็นหรือเก็บข้อมูลบัตรของคุณ",
    "You can leave this screen. We'll notify you when it's out for delivery.":"คุณออกจากหน้าจอนี้ได้ เราจะแจ้งเตือนเมื่อสินค้าออกจัดส่ง",
    "You can't order more than your doctor approved. Need a change? Start a new consultation.":"คุณไม่สามารถสั่งเกินจำนวนที่แพทย์อนุมัติ ต้องการเปลี่ยนแปลง? เริ่มการปรึกษาใหม่",
    "Your answers are ready. Create a quick account so a doctor can review them and we can match you.":"คำตอบของคุณพร้อมแล้ว สร้างบัญชีอย่างรวดเร็วเพื่อให้แพทย์ตรวจสอบและเราจับคู่ให้คุณได้",
    "Your consultations and prescriptions will appear here after your first visit.":"การปรึกษาและใบสั่งยาของคุณจะปรากฏที่นี่หลังการใช้งานครั้งแรก",
    "Your doctor consultation is complete. Next is pharmacy fulfilment and medication payment.":"การปรึกษาแพทย์ของคุณเสร็จสิ้นแล้ว ขั้นต่อไปคือการจัดยาโดยร้านยาและการชำระค่ายา",
    "can target those causes, so many men see visibly thicker, fuller hair in":"สามารถจัดการกับสาเหตุเหล่านั้นได้ ผู้ชายหลายคนจึงเห็นผมหนาขึ้นอย่างชัดเจนภายใน",
    /* ---- coverage pass 4 (intake option / edu highlighted terms / titles) ---- */
    "Less than 1 month":"น้อยกว่า 1 เดือน","Dr. Narin · ready now":"คุณหมอนรินทร์ ทานากะ · พร้อมแล้ว","Minoxidil: what to expect":"ไมน็อกซิดิล: สิ่งที่ควรคาดหวัง","Factors like":"ปัจจัยอย่าง","aging":"อายุที่มากขึ้น","family history":"ประวัติครอบครัว","stress":"ความเครียด","and":"และ",
    /* ---- coverage pass 5 (b2c edu leftover + CMS back-links) ---- */
    "3 to 6 months":"3 ถึง 6 เดือน","Open full queue ›":"เปิดคิวทั้งหมด ›","Pharmacy delay":"ร้านยาล่าช้า","Prescribe treatment":"สั่งการรักษา","View full intake ›":"ดูแบบสอบถามทั้งหมด ›","‹ Back to cases":"‹ กลับไปที่เคส","‹ Back to consultation":"‹ กลับไปการปรึกษา","‹ Back to on call":"‹ กลับไปหน้าพร้อมรับเคส",
    /* ---- coverage pass 6 (motion/interaction pass 2 Jul: waitroom gating, matching cue, stage handover, personal details, CMS coupons + config) ---- */
    "Usually under 10 seconds.":"โดยปกติไม่เกิน 10 วินาที",
    "Matching you with a licensed doctor for hair loss who is available now. Usually under 10 seconds.":"กำลังจับคู่คุณกับแพทย์ที่มีใบอนุญาตด้านผมร่วงที่ว่างตอนนี้ โดยปกติไม่เกิน 10 วินาที",
    "Waiting to be admitted…":"รอแพทย์เปิดห้องให้เข้า…","Doctor is ready":"แพทย์พร้อมแล้ว","Dr. Narin is ready for you now":"คุณหมอนรินทร์ ทานากะ พร้อมพบคุณแล้ว",
    "You have been admitted. Enter the room to start with chat; video is one tap away.":"คุณได้รับอนุญาตให้เข้าห้องแล้ว เข้าห้องเพื่อเริ่มแชท วิดีโอคอลเปิดได้ในแตะเดียว",
    "Plan accepted. Handing over to the pharmacy":"ยอมรับแผนแล้ว ส่งต่อให้ร้านยา",
    "Your clinical step with Dr. Narin is complete. A licensed pharmacist now takes over medicine preparation, payment and delivery.":"ขั้นตอนทางคลินิกกับ คุณหมอนรินทร์ ทานากะ เสร็จสิ้นแล้ว เภสัชกรที่มีใบอนุญาตจะดูแลการจัดยา การชำระเงิน และการจัดส่งต่อจากนี้",
    "Doctor":"แพทย์","Pharmacy":"ร้านยา","Consultation & prescription":"ปรึกษาและใบสั่งยา","Medicine prep & payment":"จัดยาและชำระเงิน",
    "Personal details":"ข้อมูลส่วนตัว","Name, phone, email, card · edits are timestamped":"ชื่อ เบอร์ อีเมล บัตร · ทุกการแก้ไขบันทึกเวลา",
    "Update your contact and payment details. Fields cannot be left empty, and every change is recorded with a timestamp for your security.":"อัปเดตข้อมูลติดต่อและการชำระเงินของคุณ ช่องต้องไม่เว้นว่าง และทุกการเปลี่ยนแปลงจะถูกบันทึกพร้อมเวลาเพื่อความปลอดภัยของคุณ",
    "Full name":"ชื่อ-นามสกุล","Phone":"เบอร์โทร","Email":"อีเมล","Card on file":"บัตรที่บันทึกไว้","Replace":"เปลี่ยน","Save changes":"บันทึกการเปลี่ยนแปลง","Cancel":"ยกเลิก",
    "Change history is kept":"ระบบเก็บประวัติการแก้ไข",
    "Each edit is saved with the date and time it was made. Contact support to review your change history.":"ทุกการแก้ไขถูกบันทึกพร้อมวันและเวลา ติดต่อฝ่ายสนับสนุนเพื่อดูประวัติการแก้ไขของคุณ",
    "Tap an empty slot to add availability. Removing or changing existing slots is admin-only.":"แตะช่องว่างเพื่อเพิ่มเวลาว่าง การลบหรือแก้ไขช่องเดิมทำได้เฉพาะแอดมิน",
    "Coupons":"คูปอง","Discount codes redeemable at both checkouts: consultation fee and medication payment":"โค้ดส่วนลดใช้ได้ทั้งสองจุดชำระเงิน: ค่าปรึกษาแพทย์และค่ายา",
    "+ New coupon":"+ สร้างคูปอง","Active codes":"โค้ดที่ใช้งานอยู่","Redemptions this month":"การใช้โค้ดเดือนนี้","Discount given this month":"ส่วนลดที่ให้เดือนนี้",
    "Code":"โค้ด","Type":"ประเภท","Applies to":"ใช้กับ","Vertical":"บริการ","Validity":"ช่วงเวลาใช้ได้","Uses":"จำนวนใช้","Status":"สถานะ",
    "Both checkouts":"ทั้งสองจุดชำระเงิน","Scheduled":"ตั้งเวลาไว้","Test":"ทดสอบ","Active":"ใช้งานอยู่",
    "Create a coupon":"สร้างคูปอง","Code & value":"โค้ดและมูลค่า","Fixed amount or percentage. Zero-value codes are allowed for QA.":"จำนวนคงที่หรือเปอร์เซ็นต์ อนุญาตโค้ดมูลค่า 0 สำหรับการทดสอบ",
    "Redeemable at the consultation-fee checkout, the medication checkout, or both.":"ใช้ได้ที่จุดชำระค่าปรึกษา จุดชำระค่ายา หรือทั้งสองจุด",
    "Validity window & max uses":"ช่วงเวลาและจำนวนครั้งสูงสุด","Multi-use codes are limited to once per account.":"โค้ดแบบใช้หลายครั้งจำกัดหนึ่งครั้งต่อบัญชี",
    "Restrict to a vertical":"จำกัดเฉพาะบริการ","Optional. Limit the code to one service type, e.g. hair loss.":"ไม่บังคับ จำกัดโค้ดให้ใช้กับบริการเดียว เช่น ผมร่วง",
    "Save coupon":"บันทึกคูปอง","Coupon created as draft":"สร้างคูปองเป็นฉบับร่างแล้ว","Coupon saved":"บันทึกคูปองแล้ว",
    "Channels & configuration":"ช่องทางและการตั้งค่า","Turn features on or off for each partner channel. Every channel runs from the same setup, so one change rolls out everywhere.":"เปิดหรือปิดฟีเจอร์ของแต่ละช่องทางพาร์ทเนอร์ได้ ทุกช่องทางใช้การตั้งค่าชุดเดียวกัน แก้ครั้งเดียวมีผลทุกช่องทาง",
    "Channels":"ช่องทาง","3 channels":"3 ช่องทาง","Channel":"ช่องทาง","Auto-match":"จับคู่อัตโนมัติ","Patient picks doctor":"ให้ผู้ป่วยเลือกแพทย์ได้","Nurse pre-screen":"คัดกรองโดยพยาบาล","Medicine list":"รายการยา","Theme":"ธีม",
    "Krane direct":"Krane โดยตรง","Fascino fulfilment":"จัดส่งโดย Fascino","MTL insurance":"ประกัน MTL","Sends patients to Krane":"ช่องทางที่ส่งผู้ป่วยมาให้","Grab partner":"พาร์ทเนอร์ Grab","Sends patients, also delivers":"ส่งผู้ป่วยและช่วยจัดส่ง",
    "Intake quiz":"แบบสอบถามก่อนพบแพทย์","Edit quiz questions":"แก้ไขคำถาม","Fresh intake required every time. Fixed by clinical policy.":"ต้องทำแบบสอบถามใหม่ทุกครั้ง กำหนดโดยนโยบายทางคลินิก",
    "Always on":"เปิดเสมอ","Intake once before the first consultation. Toggle to re-prompt on every visit.":"ทำแบบสอบถามครั้งเดียวก่อนพบแพทย์ครั้งแรก เปิดสวิตช์เพื่อถามใหม่ทุกครั้ง",
    "Notifications & timing":"การแจ้งเตือนและเวลา","Payment steps: waiting on client decision":"ขั้นตอนการชำระเงิน รอสรุปกับลูกค้า",
    "Channel priority":"ลำดับช่องทางแจ้งเตือน","Order-status and follow-up alerts. LINE first, then email.":"แจ้งสถานะคำสั่งซื้อและนัดติดตาม ส่ง LINE ก่อน แล้วจึงอีเมล",
    "Appointment reminder":"เตือนนัดหมาย","Hours before the booked time.":"จำนวนชั่วโมงก่อนเวลานัด","Consultation slot length":"ช่วงเวลาต่อเคส","The same booked window applies to chat, voice, and video consultations.":"ใช้ช่วงเวลาเดียวกันสำหรับการปรึกษาผ่านแชท เสียง และวิดีโอ","Time left":"เหลือเวลา",
    "No-show escalation":"ติดตามเมื่อไม่เข้าห้อง","Re-alert via SMS, LINE and email if the patient has not entered the session.":"แจ้งซ้ำทาง SMS, LINE และอีเมล หากผู้ป่วยยังไม่เข้าห้องปรึกษา",
    "Payment window (auto-cancel)":"เวลาชำระเงิน (ยกเลิกอัตโนมัติ)","Unpaid orders cancel automatically and the POS bill hold is released.":"คำสั่งซื้อที่ไม่ชำระจะถูกยกเลิกอัตโนมัติ และปลดบิลที่พักไว้ใน POS",
    "Configuration saved":"บันทึกการตั้งค่าแล้ว","Quiz editor is a build-phase feature":"ตัวแก้ไขแบบสอบถามเป็นฟีเจอร์ช่วงพัฒนา",
    "Availability added":"เพิ่มเวลาว่างแล้ว","Slot removed (admin)":"ลบช่องเวลาแล้ว (แอดมิน)","Removing slots is admin-only":"การลบช่องเวลาทำได้เฉพาะแอดมิน",
    "Channels & config":"ช่องทางและการตั้งค่า","No items in this view.":"ไม่มีรายการในมุมมองนี้",
    /* ---- coverage pass 7 (profile refill hierarchy) ---- */
    "Refill soon":"ใกล้ถึงรอบเติมยา","Melatonin 5mg · next refill in 9 days":"เมลาโทนิน 5mg · เติมยาได้ในอีก 9 วัน",
    /* ---- coverage pass 8 (merged consent screen, toggles) ---- */
    "Review the terms, then switch on each consent. Everything is recorded with a timestamp.":"อ่านข้อตกลง แล้วเปิดสวิตช์ยินยอมแต่ละรายการ ทุกอย่างถูกบันทึกพร้อมเวลา",
    "Terms & conditions":"ข้อตกลงและเงื่อนไข","I have read and accept the terms above.":"ฉันได้อ่านและยอมรับข้อตกลงข้างต้น",
    "I consent to Krane processing my health data and photos for this consultation.":"ฉันยินยอมให้ Krane ประมวลผลข้อมูลสุขภาพและรูปภาพของฉันสำหรับการปรึกษาครั้งนี้",
    /* ---- coverage pass 9 (call/chat switching, insurance intake, reduce-only qty) ---- */
    "Chat":"แชท","Chat keeps the call running. End hangs up.":"ปุ่มแชทคงสายไว้ ปุ่ม End คือวางสาย",
    "Call in progress · chat stays open":"สายยังดำเนินอยู่ · แชทเปิดต่อได้","Return to call":"กลับสู่สาย",
    "Do you have health insurance?":"คุณมีประกันสุขภาพไหม?",
    "If your insurer partners with Krane, medication can be billed to your policy first. You only pay any amount above your coverage.":"หากประกันของคุณเป็นพาร์ทเนอร์กับ Krane ค่ายาจะเบิกจากกรมธรรม์ก่อน คุณจ่ายเฉพาะส่วนที่เกินวงเงินเท่านั้น",
    "Yes, I have insurance":"มีประกัน","AIA, Muang Thai Life and partner insurers":"AIA เมืองไทยประกันชีวิต และพาร์ทเนอร์อื่น ๆ",
    "No, I'll pay myself":"ไม่มี ฉันจ่ายเอง","Pay by card, QR or mobile banking":"จ่ายด้วยบัตร QR หรือโมบายแบงก์กิ้ง",
    "You can still change how you pay at checkout.":"คุณยังเปลี่ยนวิธีชำระเงินได้ตอนชำระเงิน","Insurance":"ประกัน",
    "You can reduce a quantity, not increase it. Need more? Message your doctor to adjust the prescription.":"ลดจำนวนได้ แต่เพิ่มไม่ได้ หากต้องการมากขึ้น ส่งข้อความให้แพทย์ปรับใบสั่งยา",
    "month":"เดือน","bottles":"ขวด",
    /* ---- coverage pass 10 (follow-up "what to expect") ---- */
    "Share fresh photos of the area and tell Dr. Narin how the treatment feels so far.":"ส่งรูปถ่ายล่าสุดของบริเวณที่รักษา และเล่าให้ คุณหมอนรินทร์ ทานากะ ฟังว่าการรักษาเป็นอย่างไรบ้าง",
    "Plan adjustment":"ปรับแผนการรักษา","The doctor confirms your plan, adjusts the dose, or updates the prescription.":"แพทย์ยืนยันแผน ปรับขนาดยา หรืออัปเดตใบสั่งยา",
    "Treatment continues":"การรักษาดำเนินต่อ","Your refill allowance renews so there is no gap in your medication.":"สิทธิ์เติมยาของคุณต่ออายุ การรักษาจึงไม่ขาดช่วง",
    "Progress review":"ทบทวนความคืบหน้า",
    "Usually a short chat, about 10 minutes. Video is available if the doctor needs a closer look.":"ปกติเป็นแชทสั้น ๆ ราว 10 นาที เปิดวิดีโอได้หากแพทย์ต้องการดูใกล้ขึ้น",
    /* ---- coverage pass 11 (follow-up merged into the profile treatment card) ---- */
    "Next follow-up":"นัดติดตามครั้งถัดไป","12 Sep 2026 · Dr. Narin":"12 ก.ย. 2026 · คุณหมอนรินทร์ ทานากะ","Start follow-up":"เริ่มติดตามผล",
    /* ---- coverage pass 12 (medical certificate add-on at consult-fee checkout) ---- */
    "Add a medical certificate · ฿ 100":"เพิ่มใบรับรองแพทย์ · ฿ 100","Medical certificate":"ใบรับรองแพทย์",
    "Issued by your doctor after the consultation. A signed PDF appears in your documents.":"ออกโดยแพทย์ของคุณหลังการปรึกษา ไฟล์ PDF พร้อมลายเซ็นจะอยู่ในเอกสารของคุณ",
    /* ---- coverage pass 13 (upload-prescription entry points) ---- */
    "Already have a prescription? Upload it to order medicine":"มีใบสั่งยาอยู่แล้ว? อัปโหลดเพื่อสั่งยาได้เลย",
    "Have a prescription from another clinic?":"มีใบสั่งยาจากคลินิกอื่น?",
    "Upload it and order the medicine here. A licensed pharmacist reviews it before the order is accepted.":"อัปโหลดแล้วสั่งยาที่นี่ได้เลย เภสัชกรที่มีใบอนุญาตจะตรวจสอบก่อนรับคำสั่งซื้อ",
    "Upload a prescription":"อัปโหลดใบสั่งยา",
    /* ---- coverage pass 14 (activity tab + pharmacy search step) ---- */
    "Activity":"กิจกรรม","View all orders ›":"ดูคำสั่งซื้อทั้งหมด ›","Consultations":"การปรึกษา",
    "Hair loss consultation":"การปรึกษาผมร่วง","Plan accepted · 3 refills":"ยอมรับแผนแล้ว · เติมยาได้ 3 ครั้ง","Completed":"เสร็จสิ้น",
    "Finding a pharmacy":"กำลังหาร้านยา","Finding the nearest pharmacy…":"กำลังหาร้านยาที่ใกล้ที่สุด…",
    "Checking branches near your address with your medicine in stock. Usually a few seconds.":"กำลังเช็คสาขาใกล้ที่อยู่ของคุณที่มียาพร้อมจ่าย ใช้เวลาไม่กี่วินาที",
    "Checking stock near you":"เช็คสต็อกใกล้คุณ","Branches within same-day range of your address":"สาขาในระยะส่งวันเดียวจากที่อยู่ของคุณ",
    "Confirming your order":"ยืนยันคำสั่งซื้อ","The pharmacy accepts before you pay":"ร้านยารับออเดอร์ก่อนที่คุณจะจ่าย",
    "Fascino Ari · 3.2 km is usually the closest branch for this address.":"Fascino อารีย์ · 3.2 กม. มักเป็นสาขาที่ใกล้ที่สุดสำหรับที่อยู่นี้",
    "Continue (pharmacy found)":"ดำเนินการต่อ (พบร้านยาแล้ว)",
    /* ---- coverage pass 15 (talk-now vs scheduled follow-up) ---- */
    "Message Dr. Narin now":"ทัก คุณหมอนรินทร์ ทานากะ ตอนนี้",
    "A question between visits? Message your doctor anytime. The follow-up stays booked either way.":"มีคำถามระหว่างรอนัด? ส่งข้อความหาแพทย์ได้ทุกเมื่อ นัดติดตามยังคงอยู่เหมือนเดิม",
    /* ---- coverage pass 16 (booked-consult model, rx-writing status, documents tabs, wayfinding) ---- */
    "Consult now":"ปรึกษาตอนนี้",
    "Need the doctor before 12 Sep? Book a consult now (normal consultation fee). Your follow-up stays booked.":"อยากพบแพทย์ก่อน 12 ก.ย.? นัดปรึกษาได้เลย (ค่าปรึกษาตามปกติ) นัดติดตามเดิมยังคงอยู่",
    "You can reduce a quantity, not increase it. Need more? Ask your doctor in the consult, or book a new one.":"ลดจำนวนได้ แต่เพิ่มไม่ได้ ต้องการมากขึ้น ถามแพทย์ในห้องปรึกษา หรือนัดใหม่",
    "Preparing your plan":"กำลังเตรียมแผนของคุณ","Dr. Narin is writing your prescription":"คุณหมอนรินทร์ ทานากะ กำลังเขียนใบสั่งยาของคุณ",
    "This can take a little while. We'll notify you the moment your treatment plan is ready. You can leave this screen.":"ขั้นตอนนี้อาจใช้เวลาสักครู่ เราจะแจ้งทันทีที่แผนการรักษาพร้อม คุณออกจากหน้านี้ได้",
    "Consultation finished":"การปรึกษาเสร็จสิ้น","Today, 11:02 · chat and video ended":"วันนี้ 11:02 · จบแชทและวิดีโอแล้ว",
    "Writing your prescription":"กำลังเขียนใบสั่งยา","Medicines, dosage and plain-language notes":"รายการยา ขนาดยา และคำอธิบายแบบเข้าใจง่าย",
    "Treatment plan ready":"แผนการรักษาพร้อมแล้ว","Review and accept, then medication payment":"ตรวจสอบและยอมรับ จากนั้นชำระค่ายา",
    "We'll let you know":"เราจะแจ้งให้ทราบ","You'll get a LINE message and an app alert the moment the plan arrives.":"คุณจะได้รับข้อความ LINE และการแจ้งเตือนในแอปทันทีที่แผนมาถึง",
    "View treatment plan (ready)":"ดูแผนการรักษา (พร้อมแล้ว)","Notify me":"แจ้งเตือนฉัน","View status":"ดูสถานะ",
    "Documents":"เอกสาร","Prescription":"ใบสั่งยา",
    "Signed by your doctor, for work or reimbursement. Add it at checkout or request it here.":"ลงนามโดยแพทย์ของคุณ ใช้สำหรับลางานหรือเบิกค่ารักษา เพิ่มตอนชำระเงินหรือขอที่นี่ได้",
    "Request certificate":"ขอใบรับรอง","Back":"กลับ","Home":"หน้าหลัก","Categories":"หมวดหมู่"
  };

  /* ---- QA flow alignment · 28 Jul ---- */
  var TH_QA28 = {
    "26 Aug 2026":"26 ส.ค. 2026",
    "12 Dec 2026":"12 ธ.ค. 2026",
    "1 tablet daily · slows hair loss":"รับประทานวันละ 1 เม็ด · ช่วยชะลอผมร่วง",
    "Apply twice daily · regrowth · ฿ 225 per bottle":"ทาวันละ 2 ครั้ง · ช่วยกระตุ้นการงอก · ขวดละ ฿ 225",
    "Review order & pay":"ตรวจสอบออเดอร์และชำระเงิน",
    "Pharmacist review":"เภสัชกรตรวจสอบ",
    "Sending your paid order for pharmacist review…":"กำลังส่งออเดอร์ที่ชำระแล้วให้เภสัชกรตรวจสอบ…",
    "A licensed pharmacist verifies the prescription and confirms stock before accepting the order.":"เภสัชกรที่มีใบอนุญาตจะตรวจใบสั่งยาและยืนยันสต็อกก่อนรับออเดอร์",
    "Prescription verification":"ตรวจสอบใบสั่งยา",
    "Licensed pharmacist checks the signed prescription":"เภสัชกรตรวจใบสั่งยาที่แพทย์ลงนาม",
    "Stock and delivery check":"ตรวจสต็อกและการจัดส่ง",
    "Nearest eligible branch confirms every prescribed item":"สาขาที่เข้าเกณฑ์ใกล้ที่สุดยืนยันยาทุกรายการ",
    "Accept into pharmacy POS":"รับออเดอร์เข้าระบบ POS ร้านยา",
    "Payment remains protected while the order is routed":"ยอดชำระได้รับการคุ้มครองระหว่างส่งต่อออเดอร์",
    "Trying Fascino Ari first · 3.2 km from the delivery address.":"กำลังส่งให้ Fascino Ari ก่อน · ห่างจากที่อยู่จัดส่ง 3.2 กม.",
    "Trying a second licensed pharmacy…":"กำลังลองร้านยาที่มีใบอนุญาตแห่งที่สอง…",
    "Trying a third licensed pharmacy…":"กำลังลองร้านยาที่มีใบอนุญาตแห่งที่สาม…",
    "A pharmacist is reviewing your paid order":"เภสัชกรกำลังตรวจสอบออเดอร์ที่ชำระแล้ว",
    "The prescription and stock are being checked before the pharmacy accepts the order into its POS.":"กำลังตรวจใบสั่งยาและสต็อกก่อนร้านยารับออเดอร์เข้าสู่ระบบ POS",
    "Fascino Ari accepted your order":"Fascino Ari รับออเดอร์ของคุณแล้ว",
    "The pharmacist verified the prescription and stock. The paid order is now in POS for pick and pack.":"เภสัชกรตรวจใบสั่งยาและสต็อกแล้ว ออเดอร์ที่ชำระแล้วเข้าสู่ระบบ POS เพื่อหยิบและแพ็กยา"
  };
  for (var _kqa28 in TH_QA28) TH[_kqa28] = TH_QA28[_kqa28];

  /* ---- CMS interim Thai (added) ---- */
  var TH_CMS = {
    "Search patients, orders, articles…":"ค้นหาผู้ป่วย ออเดอร์ บทความ…",
    "Message Mali…":"พิมพ์ข้อความถึงผู้ป่วย…",
    "Private clinical notes…":"บันทึกทางคลินิก (ส่วนตัว)…",
    "Search the approved medicine list…":"ค้นหาในรายการยาที่อนุมัติ…",
    "Optional message":"ข้อความ (ไม่บังคับ)",
    "Note to patient":"ข้อความถึงผู้ป่วย",
    "CODE":"รหัส",
    "Value":"มูลค่า",
    "Max uses":"ใช้ได้สูงสุด",
    "Krane CMS · Doctor & Admin Back Office":"Krane CMS · ระบบหลังบ้านแพทย์และผู้ดูแล",
    "Tue 24 Jun · on call until 6:00 PM":"อ. 24 มิ.ย. · ออนคอลถึง 18:00 น.",
    "· 34 · Hair loss":"· 34 · ผมร่วง",
    "Auto-matched 35s ago · consultation fee paid · intake submitted":"จับคู่อัตโนมัติเมื่อ 35 วิ. ที่แล้ว · ชำระค่าปรึกษาแล้ว · ส่งแบบสอบถามแล้ว",
    "✓ Sent back to matching, the next available doctor will be assigned.":"✓ ส่งกลับเข้าคิวจับคู่แล้ว ระบบจะมอบหมายให้แพทย์ท่านถัดไปที่ว่าง",
    "On-call window":"ช่วงเวลาออนคอล",
    "8 min":"8 นาที",
    "8m":"8 น.",
    "4 min":"4 นาที",
    "1 min":"1 นาที",
    "Shift reminder sent 1 h before your window (configurable).":"ระบบเตือนเวรล่วงหน้า 1 ชม. ก่อนถึงช่วงเวลาของคุณ (ตั้งค่าได้)",
    "Upcoming (booked times)":"ที่กำลังจะถึง (เวลาที่จองไว้)",
    "when no doctor was free":"เมื่อไม่มีแพทย์ว่าง",
    "Hair loss · intake submitted":"ผมร่วง · ส่งแบบสอบถามแล้ว",
    "General consultation · intake pending":"ปรึกษาทั่วไป · รอทำแบบสอบถาม",
    "First-day setup":"ตั้งค่าวันแรก",
    "Offline":"ออฟไลน์",
    "Set your weekly availability so Krane can route patients to you during your on-call hours. Matching only assigns patients to available, on-call doctors.":"ตั้งเวลาว่างรายสัปดาห์ เพื่อให้ระบบส่งผู้ป่วยมาหาคุณในช่วงที่คุณออนคอล ระบบจะจับคู่ผู้ป่วยกับแพทย์ที่ว่างและออนคอลเท่านั้น",
    "Once you're available and on call, matched patients appear here automatically, no need to browse or pick.":"เมื่อคุณว่างและออนคอล ผู้ป่วยที่จับคู่แล้วจะปรากฏที่นี่อัตโนมัติ ไม่ต้องเลือกเอง",
    "Tue 24 Jun · 6 patients · 2 waiting now":"อ. 24 มิ.ย. · ผู้ป่วย 6 ราย · รออยู่ 2 ราย",
    "Today ▾":"วันนี้ ▾",
    "Refresh":"รีเฟรช",
    "Longest wait 4 min":"รอนานสุด 4 นาที",
    "last 7 days":"7 วันล่าสุด",
    "Time":"เวลา",
    "Intake":"แบบสอบถาม",
    "Wait":"เวลารอ",
    "In consult":"กำลังปรึกษา",
    "34 · male":"34 · ชาย",
    "41 · male":"41 · ชาย",
    "38 · male":"38 · ชาย",
    "29 · male":"29 · ชาย",
    "45 · male":"45 · ชาย",
    "36 · male":"36 · ชาย",
    "34 · male · Hair loss · matched 11:00 · patient ID #PT-2041":"34 · ชาย · ผมร่วง · จับคู่ 11:00 · รหัสผู้ป่วย #PT-2041",
    "Patient is waiting in the room. You join first, admitting opens the consultation for them.":"ผู้ป่วยกำลังรออยู่ในห้อง คุณเข้าก่อน เมื่อรับเข้าจะเปิดห้องปรึกษาให้ผู้ป่วย",
    "6 months to 2 years · moderate":"6 เดือน ถึง 2 ปี · ปานกลาง",
    "Medication (3 mo)":"ยาที่ใช้ (3 เดือน)",
    "1 uploaded":"อัปโหลด 1 รูป",
    "No drug allergies declared · cleared for online care":"ไม่มีประวัติแพ้ยา · ผ่านเกณฑ์การดูแลออนไลน์",
    "PDPA consent":"ความยินยอม PDPA",
    "Given · 24 Jun 10:58":"ให้แล้ว · 24 มิ.ย. 10:58",
    "First consultation":"การปรึกษาครั้งแรก",
    "2 Apr 2026 · Dr. Anong":"2 เม.ย. 2026 · Dr. Anong",
    "No Rx":"ไม่มีใบสั่งยา",
    "Order #KR-10170":"ออเดอร์ #KR-10170",
    "Hair loss · delivered 12 May":"ผมร่วง · จัดส่ง 12 พ.ค.",
    "‹ Mali S. · pre-consult":"‹ Mali S. (Demo) · ก่อนปรึกษา",
    "Consultation · Mali S.":"การปรึกษา · Mali S. (Demo)",
    "In room · 03:14 · consultation fee paid (฿350)":"อยู่ในห้อง · 03:14 · ชำระค่าปรึกษาแล้ว (฿350)",
    "Hi doctor, I've been noticing more shedding at the crown.":"สวัสดีครับคุณหมอ ช่วงนี้ผมร่วงเยอะขึ้นบริเวณกลางศีรษะครับ",
    "Thanks Mali. I've reviewed your intake and photo. Any family history of hair loss?":"ขอบคุณครับ ผมได้ดูแบบสอบถามและรูปของคุณแล้ว มีประวัติคนในครอบครัวผมร่วงหรือไม่ครับ",
    "Yes, my father had a receding hairline.":"มีครับ คุณพ่อของผมมีภาวะผมร่นแนวหน้าผาก",
    "Understood. I'll prepare a treatment plan for you now.":"เข้าใจแล้วครับ ผมจะจัดแผนการรักษาให้คุณตอนนี้เลยครับ",
    "Mali S. · 34 · male":"Mali S. (Demo) · 34 · ชาย",
    "Hair loss · ID #PT-2041":"ผมร่วง · รหัส #PT-2041",
    "Duration":"ระยะเวลา",
    "6mo-2y":"6 ด. ถึง 2 ปี",
    "Conditions":"โรคประจำตัว",
    "Meds":"ยา",
    "(not shown to patient)":"(ไม่แสดงต่อผู้ป่วย)",
    "Family hx of AGA. Suitable for finasteride + minoxidil. No contraindications.":"มีประวัติครอบครัวเป็น AGA เหมาะกับ finasteride + minoxidil ไม่มีข้อห้ามใช้",
    "Prescribe treatment · Mali S.":"สั่งการรักษา · Mali S. (Demo)",
    "Approved medicines only · auto-signed on send":"เฉพาะยาที่อนุมัติ · เซ็นอัตโนมัติเมื่อส่ง",
    "Tablet · slows hair loss":"ชนิดเม็ด · ชะลอผมร่วง",
    "Scalp health":"สุขภาพหนังศีรษะ",
    "Only approved medicines can be selected, to prevent wrong-item errors.":"เลือกได้เฉพาะยาที่อนุมัติ เพื่อป้องกันการจ่ายผิดรายการ",
    "Slows the hormone linked to male-pattern hair loss. Take with or without food.":"ชะลอฮอร์โมนที่เกี่ยวข้องกับผมร่วงแบบพันธุกรรมในเพศชาย รับประทานพร้อมหรือไม่พร้อมอาหารก็ได้",
    "Signed with your uploaded signature on send. Patient reviews & pays before Fascino dispatch.":"ลงนามด้วยลายเซ็นที่คุณอัปโหลดเมื่อกดส่ง ผู้ป่วยตรวจสอบและชำระเงินก่อน Fascino จัดส่ง",
    "23-29 Jun":"23-29 มิ.ย.",
    "+ Add availability":"+ เพิ่มเวลาว่าง",
    "32h":"32 ชม.",
    "available this week":"ว่างสัปดาห์นี้",
    "booked":"ถูกจอง",
    "days off":"วันหยุด",
    "default window":"ช่วงเวลาเริ่มต้น",
    "Booked (patient initial shown)":"ถูกจอง (แสดงอักษรย่อผู้ป่วย)",
    "Most fields are admin-managed. You manage your schedule and signature.":"ข้อมูลส่วนใหญ่จัดการโดยผู้ดูแล คุณจัดการเฉพาะตารางเวลาและลายเซ็น",
    "Most fields are admin-managed. You manage your signature here.":"ข้อมูลส่วนใหญ่จัดการโดยผู้ดูแล คุณจัดการลายเซ็นได้ที่นี่",
    "Name":"ชื่อ",
    "Licence no.":"เลขใบอนุญาต",
    "Specialty":"สาขาเฉพาะทาง",
    "Languages":"ภาษา",
    "Consultation types":"รูปแบบการปรึกษา",
    "Signature (auto-stamped on prescriptions)":"ลายเซ็น (ประทับอัตโนมัติบนใบสั่งยา)",
    "Signature on file ✓":"มีลายเซ็นในระบบ ✓",
    "Used automatically on prescriptions you send.":"ระบบจะใช้ลายเซ็นนี้อัตโนมัติบนใบสั่งยาที่คุณส่ง",
    "Signature preview updated":"อัปเดตตัวอย่างลายเซ็นแล้ว",
    "Dermatology":"ผิวหนัง",
    "All in-progress consultations and orders across doctors":"การปรึกษาและออเดอร์ที่กำลังดำเนินการของแพทย์ทุกคน",
    "Stalled > 30 min":"ค้างเกิน 30 นาที",
    "Consult in progress":"กำลังปรึกษา",
    "Plan sent":"ส่งแผนแล้ว",
    "Dispatched":"จัดส่งแล้ว",
    "Case":"เคส",
    "2 min ago":"2 นาทีที่แล้ว",
    "20 min ago":"20 นาทีที่แล้ว",
    "32 min ago":"32 นาทีที่แล้ว",
    "41 min ago":"41 นาทีที่แล้ว",
    "1 h ago":"1 ชม.ที่แล้ว",
    "Order #KR-10295 · Win T.":"ออเดอร์ #KR-10295 · Win T.",
    "Hair loss refill · Fascino Ari · ฿1,160 paid":"สั่งซ้ำผมร่วง · Fascino Ari · ชำระ ฿1,160",
    "Paid":"ชำระแล้ว",
    "Pharmacy accepted":"ร้านยารับออเดอร์",
    "Same-day SLA exceeded, patient offered next-day or refund.":"เกินกำหนดส่งภายในวัน ผู้ป่วยได้รับตัวเลือกส่งวันถัดไปหรือคืนเงิน",
    "Patients, doctors and roles":"ผู้ป่วย แพทย์ และสิทธิ์การใช้งาน",
    "User":"ผู้ใช้",
    "Specialty / service":"สาขา / บริการ",
    "Dermatology · Hair loss":"ผิวหนัง · ผมร่วง",
    "Dermatology · Skin":"ผิวหนัง · ผิว",
    "Internal medicine":"อายุรกรรม",
    "partner · MTL channel":"พันธมิตร · ช่องทาง MTL",
    "Health articles · two-step publish (draft → approve → live)":"บทความสุขภาพ · เผยแพร่สองขั้น (ร่าง → อนุมัติ → เผยแพร่)",
    "Lifestyle":"ไลฟ์สไตล์",
    "Krane team":"ทีม Krane",
    "Review · Minoxidil: what to expect":"ตรวจทาน · Minoxidil: สิ่งที่ควรรู้",
    "Doctor attribution":"ระบุชื่อแพทย์",
    "No medical content goes live without an explicit approval action.":"เนื้อหาทางการแพทย์จะไม่เผยแพร่จนกว่าจะมีการกดอนุมัติ",
    "Patients complete intake once before their first consultation. Edit the questionnaire, and choose per condition whether a fresh intake is required on every visit.":"ผู้ป่วยทำแบบสอบถามหนึ่งครั้งก่อนการปรึกษาครั้งแรก แก้ไขแบบสอบถาม และเลือกรายโรคว่าต้องทำแบบสอบถามใหม่ทุกครั้งหรือไม่",
    "Krane · Direct":"Krane · ตรง",
    "Partner · MTL":"พันธมิตร · MTL",
    "Krane price per item (separate from Fascino base price)":"ราคา Krane ต่อรายการยา (แยกจากราคาต้นทุน Fascino)",
    "SKU":"รายการยา",
    "Fascino base":"ต้นทุน Fascino",
    "Krane price":"ราคา Krane",
    "Fixed ฿ 50":"ลด ฿ 50",
    "Fixed ฿ 0":"ลด ฿ 0",
    "Fixed ฿ 100":"ลด ฿ 100",
    "1 Jun to 30 Sep":"1 มิ.ย. ถึง 30 ก.ย.",
    "1 Jul to 31 Jul":"1 ก.ค. ถึง 31 ก.ค.",
    "Internal QA":"ทดสอบภายใน",
    "Starts 1 Aug":"เริ่ม 1 ส.ค.",
    "1 Aug to 31 Aug":"1 ส.ค. ถึง 31 ส.ค.",
    "Fixed ฿":"จำนวนเงิน ฿",
    "Percent %":"เปอร์เซ็นต์ %",
    "All verticals":"ทุกหมวดบริการ",
    "Krane list":"รายการ Krane",
    "MTL eligible":"MTL ครอบคลุม",
    "MTL brand":"แบรนด์ MTL",
    "Partner list":"รายการพันธมิตร",
    "Grab brand":"แบรนด์ Grab",
    "2 · Email":"2 · อีเมล",
    "1 hour":"1 ชม.",
    "2 hours":"2 ชม.",
    "4 hours":"4 ชม.",
    "15 min":"15 นาที",
    "30 min":"30 นาที",
    "60 min":"60 นาที",
    "45 min":"45 นาที"
  };
  for (var _kc in TH_CMS) TH[_kc] = TH_CMS[_kc];

  var TH_CMS2 = {
    "Mon":"จ.",
    "Tue":"อ.",
    "Wed":"พ.",
    "Thu":"พฤ.",
    "Fri":"ศ.",
    "Sat":"ส.",
    "Sun":"อา.",
    "Available":"ว่าง",
    "Off":"หยุด",
    "Doctor":"แพทย์",
    "Admin":"ผู้ดูแล",
    "Slot removed (admin)":"ลบช่วงเวลาแล้ว (ผู้ดูแล)",
    "Removing slots is admin-only":"การลบช่วงเวลาทำได้เฉพาะผู้ดูแล",
    "Availability added":"เพิ่มเวลาว่างแล้ว",
    "Coupon created as draft":"สร้างคูปองเป็นฉบับร่างแล้ว",
    "Coupon saved":"บันทึกคูปองแล้ว",
    "Configuration saved":"บันทึกการตั้งค่าแล้ว",
    "Quiz editor is a build-phase feature":"ตัวแก้ไขแบบสอบถามเป็นฟีเจอร์ในเฟสพัฒนา"
  };
  for (var _kd in TH_CMS2) TH[_kd] = TH_CMS2[_kd];

  /* ---- client feedback · 14 Jul: doctor dashboard/calendar + social auth confirmation ---- */
  var TH_CLIENT14 = {
    "Today overview":"ภาพรวมวันนี้","Calendar":"ปฏิทิน","Tuesday, 24 June · your clinical day at a glance":"วันอังคารที่ 24 มิถุนายน · ภาพรวมงานดูแลผู้ป่วยวันนี้","Wednesday, 24 June · your clinical day at a glance":"วันพุธที่ 24 มิถุนายน · ภาพรวมงานดูแลผู้ป่วยวันนี้","Wed 24 Jun · 6 patients · 2 waiting now":"พ. 24 มิ.ย. · ผู้ป่วย 6 ราย · รออยู่ 2 ราย",
    "Patients today":"ผู้ป่วยวันนี้","Total":"ทั้งหมด","4 completed · 4 remaining":"เสร็จแล้ว 4 · เหลือ 4","4 completed, 4 remaining":"เสร็จแล้ว 4 ราย เหลือ 4 ราย","Needs attention":"ต้องดูแล","Next patient":"ผู้ป่วยรายถัดไป","Ready":"พร้อม",
    "Longest wait 4 minutes":"รอนานสุด 4 นาที","Outstanding plans":"แผนที่ยังไม่เสร็จ","Prescription to send":"ใบสั่งยาที่ต้องส่ง",
    "Mali S. · intake submitted":"Mali S. (Demo) · ส่งแบบสอบถามแล้ว","Mali S. · intake complete":"Mali S. (Demo) · แบบสอบถามครบ","Plans to finish":"แผนที่ต้องทำให้เสร็จ","After visit":"หลังพบผู้ป่วย","Win T. · prescription pending":"Win T. · รอจัดใบสั่งยา",
    "Today’s patient schedule":"ตารางผู้ป่วยวันนี้","One active case at a time · tap a patient to review their case":"ดูแลทีละหนึ่งเคส · แตะชื่อผู้ป่วยเพื่อดูข้อมูล","Open calendar":"เปิดปฏิทิน",
    "Hair loss · intake complete · fee paid":"ผมร่วง · แบบสอบถามครบ · ชำระแล้ว","Hair loss · intake complete":"ผมร่วง · แบบสอบถามครบ","General consultation · intake pending":"ปรึกษาทั่วไป · แบบสอบถามยังไม่ครบ","Skin concern · intake complete":"ปัญหาผิว · แบบสอบถามครบ",
    "Waiting 4m":"รอ 4 นาที","Waiting 1m":"รอ 1 นาที","Current priority":"สิ่งที่ต้องทำก่อน","2 patients are waiting":"มีผู้ป่วยรออยู่ 2 ราย","Ready since 10:56":"พร้อมตั้งแต่ 10:56",
    "Review case":"ดูข้อมูลเคส","Krane only assigns the next patient after the current case is closed or reassigned.":"Krane จะส่งผู้ป่วยรายถัดไปเมื่อปิดหรือส่งต่อเคสปัจจุบันแล้ว","Today’s progress":"ความคืบหน้าวันนี้","4 / 8 patients":"ผู้ป่วย 4 / 8 ราย","Average visit":"เวลาต่อเคสเฉลี่ย","View full patient queue ›":"ดูคิวผู้ป่วยทั้งหมด ›",
    "Outstanding work":"งานที่ยังต้องทำ","Finish these after patient visits":"ทำรายการเหล่านี้ให้เสร็จหลังพบผู้ป่วย","2 tasks":"2 งาน","Win T. · visit completed at 10:20":"Win T. · พบผู้ป่วยเสร็จเมื่อ 10:20","Intake incomplete":"แบบสอบถามยังไม่ครบ","Korn P. · appointment at 12:00":"Korn P. · นัดเวลา 12:00","One active case at a time":"ดูแลทีละหนึ่งเคส","Krane assigns the next patient after the current case is closed or reassigned.":"Krane จะส่งผู้ป่วยรายถัดไปเมื่อปิดหรือส่งต่อเคสปัจจุบันแล้ว",
    "You’re offline":"ขณะนี้ออฟไลน์","You won’t receive new patient assignments while you’re offline.":"ระบบจะไม่ส่งเคสผู้ป่วยใหม่ให้คุณขณะออฟไลน์","Go on call":"พร้อมรับเคส","Your schedule is saved. Go on call when you’re ready to see patients.":"ตารางงานยังถูกบันทึกไว้ กดพร้อมรับเคสเมื่อพร้อมดูแลผู้ป่วย",
    "Patient calendar":"ปฏิทินผู้ป่วย","Review scheduled cases by month or by day, similar to your everyday calendar.":"ดูเคสที่นัดหมายแบบรายเดือนหรือรายวัน ใช้งานเหมือนปฏิทินทั่วไป","patients today":"ผู้ป่วยวันนี้","patients this month":"ผู้ป่วยเดือนนี้","waiting now":"กำลังรอ","today’s availability":"เวลาว่างวันนี้",
    "Previous period":"ช่วงก่อนหน้า","Next period":"ช่วงถัดไป","June 2026":"มิถุนายน 2569","Tuesday, 24 June 2026":"วันอังคารที่ 24 มิถุนายน 2569","09:00 to 18:00":"09:00 ถึง 18:00","Month":"เดือน","Day":"วัน","Year":"ปี","Calendar view":"มุมมองปฏิทิน","case":"เคส","cases":"เคส","more":"เพิ่มเติม",
    "Upcoming":"กำลังจะมาถึง","Waiting":"กำลังรอ","Completed":"เสร็จสิ้น","Tap a patient event to open the case. Availability changes are recorded separately.":"แตะนัดหมายเพื่อเปิดเคส การแก้ไขเวลาว่างจะถูกบันทึกแยกต่างหาก",
    "Patient waiting · intake complete":"ผู้ป่วยกำลังรอ · แบบสอบถามครบ","Completed · summary available":"เสร็จแล้ว · ดูสรุปได้","Upcoming · review intake":"กำลังจะมาถึง · ตรวจแบบสอบถาม","Done":"เสร็จแล้ว",
    "Confirm your account":"ยืนยันบัญชีของคุณ","You’re signed in":"เข้าสู่ระบบแล้ว","Review the details from":"ตรวจสอบข้อมูลจาก","Verified":"ยืนยันแล้ว","First name":"ชื่อ","Last name":"นามสกุล","Confirm & continue":"ยืนยันและไปต่อ","Use another account":"ใช้บัญชีอื่น",
    "I confirm these details are mine and may be used for appointment updates, prescriptions and delivery.":"ฉันยืนยันว่าข้อมูลนี้เป็นของฉัน และอนุญาตให้ใช้สำหรับแจ้งนัด ใบสั่งยา และการจัดส่ง","You can edit these details now or later in Settings.":"แก้ไขข้อมูลได้ตอนนี้หรือภายหลังในหน้าตั้งค่า",
    "Send OTP":"ส่งรหัส OTP","or":"หรือ","Social login · confirm account (KRANE-F03)":"Social login · ยืนยันบัญชี (KRANE-F03)","▶ Start walkthrough":"▶ เริ่มเดโม","↻ Restart walkthrough":"↻ เริ่มเดโมใหม่",
    "Log in with LINE":"เข้าสู่ระบบด้วย LINE","Log in with Google":"เข้าสู่ระบบด้วย Google","Sign up with LINE":"สมัครด้วย LINE","Sign up with Google":"สมัครด้วย Google",
    "Save insurance info":"บันทึกข้อมูลประกัน","We will check your entitlement automatically the next time you have an order.":"เราจะตรวจสอบสิทธิ์ประกันให้อัตโนมัติเมื่อคุณมีคำสั่งซื้อครั้งถัดไป",
    "Trying a second nearby pharmacy…":"กำลังลองร้านยาใกล้เคียงร้านที่สอง…","Trying a third nearby pharmacy…":"กำลังลองร้านยาใกล้เคียงร้านที่สาม…",
    "Sending your order to the pharmacy":"กำลังส่งคำสั่งซื้อไปที่ร้านยา","We hold your slot while they check the shelf":"เราจองคิวไว้ให้ระหว่างร้านตรวจสอบสต็อก",
    "Pharmacy confirms your order":"ร้านยายืนยันคำสั่งซื้อ","They accept before you pay":"ร้านยืนยันก่อนที่คุณจะชำระเงิน",
    "This branch cannot confirm your order":"ร้านนี้ไม่สามารถยืนยันคำสั่งซื้อได้","They are out of stock right now. We can look for another nearby pharmacy.":"ร้านนี้ของหมดสต็อกในขณะนี้ เราสามารถหาร้านยาใกล้เคียงร้านอื่นให้ได้",
    "Try another pharmacy":"ลองร้านยาอื่น","Change delivery address":"เปลี่ยนที่อยู่จัดส่ง"
  };
  for (var _ke in TH_CLIENT14) TH[_ke] = TH_CLIENT14[_ke];

  /* ---- doctor follow-up workflow · 15 Jul ---- */
  var TH_DOCTOR15 = {
    "Follow-ups":"ติดตามผล","Follow-ups due":"เคสติดตามที่ถึงกำหนด","1 overdue, 2 due today":"เลยกำหนด 1 ราย · ถึงกำหนดวันนี้ 2 ราย",
    "Follow-up cases":"เคสติดตามผล","Patients due for clinical review":"ผู้ป่วยที่ถึงกำหนดติดตามอาการ","3 due":"ถึงกำหนด 3 ราย","View all follow-ups ›":"ดูเคสติดตามทั้งหมด ›",
    "Win T. · overdue":"Win T. · เลยกำหนด","Treatment response · due yesterday":"ติดตามผลการรักษา · ครบกำหนดเมื่อวาน","Korn P. · due today":"Korn P. · ถึงกำหนดวันนี้","30-day check-in · last visit 24 May":"ติดตามครบ 30 วัน · พบล่าสุด 24 พ.ค.","Ton S. · due today":"Ton S. · ถึงกำหนดวันนี้","Review symptoms · last visit 10 Jun":"ติดตามอาการ · พบล่าสุด 10 มิ.ย.",
    "1 overdue":"เลยกำหนด 1 ราย","3 due · 1 overdue · 2 due today":"ถึงกำหนด 3 ราย · เลยกำหนด 1 ราย · วันนี้ 2 ราย","This week ▾":"สัปดาห์นี้ ▾","Overdue":"เลยกำหนด","Review first":"ตรวจสอบก่อน","Due today":"ถึงกำหนดวันนี้","Clinical review needed":"ต้องประเมินอาการ","Upcoming this week":"กำลังจะถึงสัปดาห์นี้","Next 7 days":"ภายใน 7 วัน","Completed this week":"เสร็จแล้วสัปดาห์นี้","Up to date":"เป็นปัจจุบัน",
    "Follow-up reason":"เหตุผลที่ติดตาม","Last consultation":"พบแพทย์ล่าสุด","Due date":"วันครบกำหนด","Treatment response":"ติดตามผลการรักษา","30-day check-in":"ติดตามครบ 30 วัน","Review symptoms":"ติดตามอาการ","Skin treatment response":"ติดตามผลการรักษาผิว","Hair-loss progress":"ติดตามอาการผมร่วง","Overdue 1 day":"เลยกำหนด 1 วัน","Today, 24 Jun":"วันนี้ 24 มิ.ย.",
    "24 May 2026":"24 พ.ค. 2569","10 Jun 2026":"10 มิ.ย. 2569","12 Jun 2026":"12 มิ.ย. 2569","22 May 2026":"22 พ.ค. 2569","23 Jun":"23 มิ.ย.","26 Jun":"26 มิ.ย.","22 Jun":"22 มิ.ย.",
    "Patient ready to enter":"ผู้ป่วยพร้อมเข้าห้องปรึกษา","Waiting for you":"กำลังรอคุณ","Join first. Krane opens the consultation room for the patient automatically after you enter.":"กรุณาเข้าห้องก่อน ระบบจะเปิดห้องให้ผู้ป่วยเข้าอัตโนมัติหลังจากคุณเข้าห้องแล้ว","Join consultation":"เข้าห้องปรึกษา"
  };
  for (var _kg in TH_DOCTOR15) TH[_kg] = TH_DOCTOR15[_kg];

  /* ---- admin operations refresh · 15 Jul ---- */
  var TH_ADMIN15 = {
    "Operations":"งานปฏิบัติการ","Overview":"ภาพรวม","Manage":"จัดการ","Users & roles":"ผู้ใช้และสิทธิ์","Promotions":"โปรโมชัน","Channels":"ช่องทาง",
    "Operations overview":"ภาพรวมงานปฏิบัติการ","Wednesday, 24 June · clinical and order exceptions that need attention":"วันพุธที่ 24 มิถุนายน · เคสและคำสั่งซื้อที่ต้องตรวจสอบ","Export report":"ส่งออกรายงาน",
    "Needs attention":"ต้องตรวจสอบ","Cases stalled over 30 minutes":"เคสค้างเกิน 30 นาที","Open clinical cases":"เคสการรักษาที่ยังเปิดอยู่","Across 6 doctors":"จากแพทย์ 6 คน",
    "Payments pending":"รอชำระเงิน","Oldest pending 41 minutes":"รายการเก่าสุดรอ 41 นาที","In fulfilment":"กำลังจัดส่ง","1 pharmacy delay":"ร้านยาล่าช้า 1 รายการ",
    "Actions required":"รายการที่ต้องดำเนินการ","Sorted by risk and time waiting":"เรียงตามความเสี่ยงและเวลาที่รอ","2 need attention":"ต้องตรวจสอบ 2 รายการ","Owner":"ผู้รับผิดชอบ","Review":"ตรวจสอบ",
    "System health":"สถานะระบบ","Live services supporting patient care":"บริการที่รองรับการดูแลผู้ป่วย","Payment gateway":"ระบบชำระเงิน","Fascino POS":"Fascino POS","LINE notifications":"การแจ้งเตือน LINE","Video service":"ระบบวิดีโอ",
    "Operational":"ทำงานปกติ","Monitoring":"กำลังเฝ้าระวัง","Last synced 1 minute ago":"ซิงก์ล่าสุด 1 นาทีที่แล้ว","Manage channels":"จัดการช่องทาง","Status updated":"อัปเดตสถานะแล้ว","Article published":"เผยแพร่บทความแล้ว",
    "Assigned branch or owner":"สาขาหรือผู้รับผิดชอบ","Escalation":"การติดตามปัญหา","Not contacted":"ยังไม่ได้ติดต่อ","Contacted just now":"ติดต่อแล้วเมื่อสักครู่","Contact branch":"ติดต่อสาขา","Contact again":"ติดต่ออีกครั้ง",
    "Confirm refund":"ยืนยันการคืนเงิน","Return the captured payment to the patient and stop fulfilment for this order.":"คืนยอดที่ชำระให้ผู้ป่วยและหยุดการจัดส่งของออเดอร์นี้","No payment captured":"ยังไม่มีการตัดเงิน","Refunded":"คืนเงินแล้ว","Just now":"เมื่อสักครู่","Refund initiated":"เริ่มดำเนินการคืนเงินแล้ว",
    "Stock confirmation is overdue. The branch has not replied for 32 minutes.":"เกินเวลายืนยันสต็อก สาขายังไม่ตอบกลับเป็นเวลา 32 นาที","Payment has not been captured. No fulfilment request has been sent.":"ยังไม่มีการตัดเงิน และยังไม่ได้ส่งคำขอจัดยา","No active issue. Rider is on the way to the patient.":"ไม่มีปัญหาที่ต้องดำเนินการ ไรเดอร์กำลังนำส่งให้ผู้ป่วย","Medicine is being prepared within the expected service window.":"กำลังจัดยาอยู่ภายในกรอบเวลาบริการ","Order delivered. No action is required.":"จัดส่งสำเร็จแล้ว ไม่ต้องดำเนินการเพิ่มเติม","Refund initiated. The patient will receive the funds through the original payment method.":"เริ่มคืนเงินแล้ว ผู้ป่วยจะได้รับเงินผ่านช่องทางชำระเงินเดิม",
    "Partners":"พาร์ทเนอร์","Partner operator":"เจ้าหน้าที่พาร์ทเนอร์","Operations · refunds · roles":"งานปฏิบัติการ · คืนเงิน · สิทธิ์","Fulfilment · Ari branch":"การจัดส่ง · สาขาอารีย์","Add user":"เพิ่มผู้ใช้","Manage user":"จัดการผู้ใช้","Create or update an account, role, access scope, and status.":"สร้างหรือแก้ไขบัญชี บทบาท ขอบเขตสิทธิ์ และสถานะ","Email or phone":"อีเมลหรือเบอร์โทร","Role":"บทบาท","Specialty or service":"สาขาหรือบริการ","Permissions":"สิทธิ์การใช้งาน","Assigned cases":"เคสที่รับผิดชอบ","Clinical records":"เวชระเบียน","Operations & refunds":"งานปฏิบัติการและคืนเงิน","Content & pricing":"เนื้อหาและราคา","Account active":"เปิดใช้งานบัญชี","Save user":"บันทึกผู้ใช้","Close":"ปิด","Cancel":"ยกเลิก"
  };
  for (var _kf in TH_ADMIN15) TH[_kf] = TH_ADMIN15[_kf];

  /* ---- branched intake: condition-specific vs general consultation · 15 Jul ---- */
  var TH_INTAKE_BRANCH = {
    "1 · Service-specific symptoms":"1 · อาการตามบริการที่เลือก",
    "2 · Severity & pattern":"2 · ความรุนแรงและรูปแบบอาการ",
    "condition-specific · optional":"เฉพาะบางบริการ · ไม่บังคับ",
    "required · penultimate":"จำเป็น · ข้อก่อนสุดท้าย",
    "final question":"คำถามสุดท้าย",
    "Supporting content":"เนื้อหาเสริม",
    "Hair education interstitial":"ความรู้เรื่องผมระหว่างขั้นตอน",
    "Review answers":"ตรวจทานคำตอบ",
    "Every patient completes this near the end, whatever they want to discuss. It helps the doctor assess and prescribe safely.":"ทุกคนต้องตอบช่วงท้าย ไม่ว่าจะปรึกษาเรื่องใด เพื่อช่วยให้แพทย์ประเมินและสั่งยาได้อย่างปลอดภัย",
    "Pregnant, planning pregnancy or breastfeeding (if applicable)":"กำลังตั้งครรภ์ วางแผนตั้งครรภ์ หรือให้นมบุตร (ถ้าเกี่ยวข้อง)",
    "Where is your hair thinning or shedding?":"ผมบางหรือร่วงบริเวณใด?",
    "Select all that apply.":"เลือกได้มากกว่าหนึ่งข้อ",
    "Select duration":"เลือกระยะเวลา",
    "Where are you noticing hair loss?":"คุณสังเกตเห็นผมร่วงบริเวณใด?",
    "Choose all areas or changes that apply. Your doctor will use this to understand the pattern.":"เลือกบริเวณหรือการเปลี่ยนแปลงที่ตรงกับคุณ แพทย์จะใช้ข้อมูลนี้ดูรูปแบบผมร่วง",
    "Crown or top of the scalp":"กลางศีรษะหรือด้านบน",
    "Temples or receding hairline":"ขมับหรือแนวไรผมร่น",
    "Diffuse shedding across the scalp":"ผมร่วงกระจายทั่วศีรษะ",
    "Round or patchy areas":"ร่วงเป็นวงหรือเป็นหย่อม",
    "Scalp itching, redness or flaking":"หนังศีรษะคัน แดง หรือลอก",
    "How long has this been happening?":"เป็นอาการนี้มานานแค่ไหน?",
    "How has your hair changed?":"ผมของคุณเปลี่ยนแปลงอย่างไร?",
    "Tell us how noticeable it is and how the pattern is changing.":"บอกระดับที่สังเกตเห็นและรูปแบบที่กำลังเปลี่ยนไป",
    "How much is it affecting you?":"อาการนี้ส่งผลกับคุณแค่ไหน?",
    "What best describes the change?":"ข้อใดอธิบายการเปลี่ยนแปลงได้ใกล้เคียงที่สุด?",
    "Gradual thinning":"ผมค่อย ๆ บางลง",
    "More shedding than usual":"ผมร่วงมากกว่าปกติ",
    "Hairline or crown is receding":"แนวไรผมหรือกลางศีรษะบางลง",
    "Patchy hair loss":"ผมร่วงเป็นหย่อม",
    "Scalp discomfort or visible change":"หนังศีรษะไม่สบายหรือมีการเปลี่ยนแปลงที่มองเห็นได้",
    "What would you like help with today?":"วันนี้คุณอยากปรึกษาเรื่องอะไร?",
    "What can we help with today?":"วันนี้อยากปรึกษาเรื่องอะไร?",
    "Select all that apply. You do not need to know the condition name.":"เลือกได้มากกว่าหนึ่งข้อ ไม่จำเป็นต้องรู้ชื่อโรค",
    "Choose the closest topic. You do not need to know the name of a condition.":"เลือกหัวข้อที่ใกล้เคียงที่สุด คุณไม่จำเป็นต้องรู้ชื่อโรค",
    "Pain or physical discomfort":"ปวดหรือไม่สบายทางร่างกาย",
    "Fever, infection or feeling unwell":"มีไข้ สงสัยติดเชื้อ หรือรู้สึกไม่สบาย",
    "Digestive or urinary concern":"ปัญหาระบบย่อยอาหารหรือทางเดินปัสสาวะ",
    "Sleep, stress, mood or energy":"การนอน ความเครียด อารมณ์ หรือพลังงาน",
    "Sexual or reproductive health":"สุขภาพทางเพศหรือระบบสืบพันธุ์",
    "Other or not sure":"เรื่องอื่นหรือยังไม่แน่ใจ",
    "Briefly describe what is happening":"เล่าอาการโดยย่อ",
    "Main symptom, where you feel it, and anything else the doctor should know":"อาการหลัก ตำแหน่งที่รู้สึก และข้อมูลอื่นที่แพทย์ควรรู้",
    "When did it start?":"เริ่มมีอาการเมื่อไร?",
    "Select when it started":"เลือกช่วงเวลา",
    "Today":"วันนี้",
    "2-7 days ago":"2-7 วันที่แล้ว",
    "1-4 weeks ago":"1-4 สัปดาห์ที่แล้ว",
    "More than 1 month ago":"มากกว่า 1 เดือนแล้ว",
    "How are you feeling now?":"ตอนนี้คุณรู้สึกอย่างไร?",
    "This helps the doctor understand urgency and what to focus on first.":"ข้อมูลนี้ช่วยให้แพทย์ประเมินความเร่งด่วนและสิ่งที่ควรดูก่อน",
    "I can continue normal daily activities":"ยังทำกิจวัตรประจำวันได้ตามปกติ",
    "It is affecting sleep, work or normal activities":"กระทบการนอน งาน หรือกิจวัตรประจำวัน",
    "What is the pattern?":"อาการมีลักษณะอย่างไร?",
    "What was the result?":"ผลเป็นอย่างไร?",
    "Select result":"เลือกผลลัพธ์",
    "It is constant":"เป็นตลอดเวลา",
    "It is getting worse":"อาการแย่ลง",
    "Several symptoms started together":"มีหลายอาการเริ่มพร้อมกัน"
  };
  for (var _kib in TH_INTAKE_BRANCH) TH[_kib] = TH_INTAKE_BRANCH[_kib];

  /* ---- implementation QA coverage for the client walkthrough · 15 Jul ---- */
  var TH_B2C_QA15 = {
    "Payment preference":"รูปแบบการชำระเงิน","Self-pay":"ชำระเอง","Pay ฿ 350 securely":"ชำระ ฿ 350 อย่างปลอดภัย","Doctor admits you in 2-3 min":"แพทย์จะเปิดห้องให้ภายใน 2-3 นาที","in room · licence 12345":"อยู่ในห้อง · ใบอนุญาต 12345","from Dr. Narin":"จาก คุณหมอนรินทร์ ทานากะ","1-month plan · review & accept here":"แผน 1 เดือน · ตรวจและยืนยันที่นี่","You":"คุณ","Video consultation · 02:14":"ปรึกษาผ่านวิดีโอ · 02:14","Voice consultation · 00:42":"ปรึกษาผ่านเสียง · 00:42",
    "Order #KR-10293 is on its way, arriving by 6pm.":"ออเดอร์ #KR-10293 กำลังนำส่ง คาดว่าจะถึงก่อน 18:00","Consent":"ความยินยอม",
    "Krane provides doctor-led telemedicine and medicine delivery. By continuing you agree to how the service is delivered and your responsibilities as a patient.":"Krane ให้บริการพบแพทย์ทางไกลและจัดส่งยา โดยการดำเนินการต่อถือว่าคุณยอมรับรูปแบบบริการและหน้าที่ของผู้รับบริการ",
    "Online consultation has limits. A doctor may ask you to seek in-person care if your condition is not suitable for remote treatment.":"การปรึกษาออนไลน์มีข้อจำกัด แพทย์อาจแนะนำให้ไปพบแพทย์ที่สถานพยาบาล หากอาการไม่เหมาะกับการดูแลทางไกล",
    "Remote assessment cannot fully replace a physical examination. You agree to give accurate information and follow the doctor's guidance.":"การประเมินทางไกลไม่สามารถแทนการตรวจร่างกายได้ทั้งหมด คุณตกลงให้ข้อมูลที่ถูกต้องและปฏิบัติตามคำแนะนำของแพทย์",
    "I understand this is a remote medical service and consent to being assessed and treated online by a licensed doctor.":"ฉันเข้าใจว่านี่คือบริการทางการแพทย์ทางไกล และยินยอมให้แพทย์ที่มีใบอนุญาตประเมินและดูแลผ่านระบบออนไลน์",
    "Each consent is stored with a timestamp for your compliance record.":"ความยินยอมแต่ละรายการจะถูกบันทึกพร้อมวันและเวลาเพื่อเป็นหลักฐาน",
    "Identity verification · IAL 2.2":"ยืนยันตัวตน · IAL 2.2","Required once for first-time sign-up. Your documents are encrypted and used only to verify it's you.":"ทำครั้งเดียวเมื่อสมัครครั้งแรก เอกสารถูกเข้ารหัสและใช้เพื่อยืนยันตัวตนเท่านั้น","Photo of the front of your Thai ID card.":"รูปด้านหน้าบัตรประชาชนไทย","Upload":"อัปโหลด","A photo of you holding your ID card next to your face (physical comparison).":"รูปคุณถือบัตรประชาชนข้างใบหน้าเพื่อเปรียบเทียบตัวตน","Take":"ถ่ายรูป",
    "We sent a 6-digit code to your verified phone number. Enter it to confirm it's you.":"เราส่งรหัส 6 หลักไปยังเบอร์โทรศัพท์ที่ยืนยันไว้ โปรดกรอกเพื่อยืนยันตัวตน","Didn't get it?":"ยังไม่ได้รับรหัส?","Resend code":"ส่งรหัสอีกครั้ง","· sent via SMS":"· ส่งผ่าน SMS",
    "You have more than one eligible policy. Pick the one to apply to this order.":"คุณมีกรมธรรม์ที่ใช้ได้มากกว่าหนึ่งรายการ เลือกรายการที่ต้องการใช้กับออเดอร์นี้","Reduce quantities to stay within your credit limit, or pay the difference yourself.":"ลดจำนวนให้อยู่ในวงเงิน หรือชำระส่วนต่างด้วยตนเอง","You pay":"คุณชำระ",
    "Have a valid prescription from another provider? Upload it to order the medicine directly, without a new consultation.":"มีใบสั่งยาที่ยังใช้ได้จากผู้ให้บริการอื่น? อัปโหลดเพื่อสั่งยาได้โดยไม่ต้องปรึกษาใหม่","Photo or PDF from a licensed doctor.":"รูปหรือ PDF จากแพทย์ที่มีใบอนุญาต","Choose":"เลือก","A pharmacist reviews first":"เภสัชกรตรวจสอบก่อน","A licensed pharmacist checks your prescription before the order is accepted.":"เภสัชกรที่มีใบอนุญาตจะตรวจใบสั่งยาก่อนรับออเดอร์","Give ฿150, get ฿150":"ให้ ฿150 รับ ฿150","Share your code. Your friend gets ฿150 off their first visit, and you get ฿150 credit when they complete it.":"แชร์โค้ดให้เพื่อนรับส่วนลด ฿150 สำหรับครั้งแรก และคุณรับเครดิต ฿150 เมื่อเพื่อนใช้บริการสำเร็จ",
    "In room · consultation fee paid (฿350)":"อยู่ในห้อง · ชำระค่าปรึกษาแล้ว (฿350)","18 min ago":"18 นาทีที่แล้ว","Item":"รายการ"
  };
  for (var _kqa in TH_B2C_QA15) TH[_kqa] = TH_B2C_QA15[_kqa];

  /* ---- Thai coverage pass · client mobile QA 29 Jul ---- */
  var TH_CLIENT_MOBILE = {
    "A clear photo helps the doctor assess you accurately. You can skip this and add photos later.":"รูปที่ชัดเจนช่วยให้แพทย์ประเมินได้แม่นยำ คุณสามารถข้ามและเพิ่มรูปภายหลังได้",
    "Choose the answers that best describe what you're experiencing.":"เลือกคำตอบที่ตรงกับอาการของคุณมากที่สุด",
    "Select any that apply. For severe symptoms or immediate danger, call emergency services or go to the nearest emergency department now.":"เลือกทุกข้อที่ตรงกับอาการ หากมีอาการรุนแรงหรืออันตรายเร่งด่วน ให้โทรขอความช่วยเหลือฉุกเฉินหรือไปห้องฉุกเฉินที่ใกล้ที่สุดทันที",
    "Choose the option closest to your concern. Not sure? Select General consultation.":"เลือกหัวข้อที่ใกล้เคียงกับเรื่องที่กังวล หากไม่แน่ใจ ให้เลือกปรึกษาทั่วไป",
    "Accept & continue to payment":"ยอมรับและไปต่อที่การชำระเงิน",
    "Activity · Empty":"กิจกรรม · ยังไม่มีรายการ",
    "After payment · Pharmacist review":"หลังชำระเงิน · เภสัชกรตรวจสอบ",
    "Already have a prescription? Upload it for pharmacy review":"มีใบสั่งยาแล้ว? อัปโหลดให้เภสัชกรตรวจสอบ",
    "Androgenetic alopecia":"ผมร่วงจากพันธุกรรม",
    "Apply to the scalp twice daily.":"ทาบนหนังศีรษะวันละ 2 ครั้ง",
    "Apply twice daily · regrowth · ฿ 225 per bottle":"ทาวันละ 2 ครั้ง · ช่วยให้ผมงอกใหม่ · ฿225 ต่อขวด",
    "Article":"บทความ",
    "Before payment · Find nearest pharmacy":"ก่อนชำระเงิน · ค้นหาร้านยาใกล้ที่สุด",
    "Biotin + Zinc":"ไบโอติน + ซิงก์",
    "Certificate fee":"ค่าหนังสือรับรอง",
    "Checking availability":"กำลังตรวจสอบคิวว่าง",
    "Checking stock and a delivery quote for your saved address.":"กำลังตรวจสอบสต็อกและค่าจัดส่งสำหรับที่อยู่ที่บันทึกไว้",
    "Clinical safety":"ความปลอดภัยทางการแพทย์",
    "Consult a licensed doctor from your phone, without travelling to a clinic.":"ปรึกษาแพทย์ที่มีใบอนุญาตผ่านโทรศัพท์ โดยไม่ต้องเดินทางไปคลินิก",
    "Corporate entry":"เข้าสู่ระบบผ่านองค์กร",
    "Coverage & payment":"สิทธิ์และการชำระเงิน",
    "Default · Video":"ค่าเริ่มต้น · วิดีโอ",
    "Deliver to":"จัดส่งไปที่",
    "Delivery speed and its final fee are selected on the payment page.":"เลือกความเร็วและค่าจัดส่งสุดท้ายในหน้าชำระเงิน",
    "Demo edge cases":"กรณีทดสอบเพิ่มเติม",
    "Digitally signed":"ลงนามดิจิทัลแล้ว",
    "Doctor availability":"คิวแพทย์",
    "Dr":"แพทย์",
    "Dr. Anong S.":"คุณหมออนงค์ ส.",
    "Dr. Narin":"คุณหมอนรินทร์",
    "Dr. Narin T.":"คุณหมอนรินทร์ ท.",
    "Dr. Narin · licence 12345":"คุณหมอนรินทร์ · ใบอนุญาต 12345",
    "Edit saved delivery address":"แก้ไขที่อยู่จัดส่งที่บันทึกไว้",
    "Empty states":"สถานะที่ยังไม่มีข้อมูล",
    "Fallback · Chat":"สำรอง · แชท",
    "Fascino Ari · estimated 15-25 min":"ฟาสซิโน อารีย์ · ประมาณ 15-25 นาที",
    "Finding medicine near you":"กำลังค้นหายาใกล้คุณ",
    "Full refund to the original method":"คืนเงินเต็มจำนวนไปยังช่องทางเดิม",
    "Home · The Base Park West, Sukhumvit 77":"บ้าน · เดอะ เบส พาร์ค เวสต์ สุขุมวิท 77",
    "If prescribed, receive your treatment discreetly and continue your care at home.":"หากแพทย์สั่งยา คุณจะได้รับการจัดส่งอย่างเป็นส่วนตัวและดูแลต่อเนื่องที่บ้าน",
    "Insurance credit":"วงเงินประกัน",
    "Invited":"เชิญแล้ว",
    "Issued after doctor review, usually within 24 hours.":"ออกให้หลังแพทย์ตรวจสอบ โดยปกติภายใน 24 ชั่วโมง",
    "Joined · ฿150":"เข้าร่วมแล้ว · ฿150",
    "Last edited 14 Jun 2026, 09:41":"แก้ไขล่าสุด 14 มิ.ย. 2026 เวลา 09:41",
    "Last edited 2 May 2026, 18:02":"แก้ไขล่าสุด 2 พ.ค. 2026 เวลา 18:02",
    "Last edited 2 May 2026, 18:03 · card details are stored by the payment gateway, not Krane":"แก้ไขล่าสุด 2 พ.ค. 2026 เวลา 18:03 · ข้อมูลบัตรจัดเก็บโดยผู้ให้บริการชำระเงิน ไม่ใช่ Krane",
    "Medical history · Empty":"ประวัติการแพทย์ · ยังไม่มีข้อมูล",
    "Nearest area":"พื้นที่ใกล้ที่สุด",
    "Note for the rider":"หมายเหตุถึงพนักงานจัดส่ง",
    "Nothing was charged. Retry or choose another method.":"ยังไม่มีการเรียกเก็บเงิน ลองอีกครั้งหรือเลือกช่องทางอื่น",
    "Nurse Priya":"พยาบาลปรียา",
    "Original payment method":"ช่องทางชำระเงินเดิม",
    "Other":"อื่น ๆ",
    "PDPA & consents":"PDPA และความยินยอม",
    "Partner access":"เข้าสู่ระบบผ่านพาร์ตเนอร์",
    "Partner coverage":"สิทธิ์จากพาร์ตเนอร์",
    "Payment confirmed":"ยืนยันการชำระเงินแล้ว",
    "Payment did not go through":"ชำระเงินไม่สำเร็จ",
    "Payment method":"ช่องทางชำระเงิน",
    "Pharmacy & fulfilment":"ร้านยาและการจัดส่ง",
    "Pharmacy review":"เภสัชกรตรวจสอบ",
    "Policy number (เลขกรมธรรม์)":"เลขกรมธรรม์",
    "Prescribed by Dr. A · 12 May 2026":"สั่งโดยคุณหมอ A · 12 พ.ค. 2026",
    "Prescribed by Dr. B · 2 Apr 2026":"สั่งโดยคุณหมอ B · 2 เม.ย. 2026",
    "Prescribed by Dr. Narin T. · licence 12345":"สั่งโดยคุณหมอนรินทร์ ท. · ใบอนุญาต 12345",
    "Rate this consultation":"ให้คะแนนการปรึกษา",
    "Reimbursement / claim":"เบิกคืน / เคลม",
    "Save address & return to payment":"บันทึกที่อยู่และกลับไปชำระเงิน",
    "Screen · Booking slot":"หน้าจอ · เลือกเวลานัด",
    "Setting things up for you.":"กำลังเตรียมทุกอย่างให้คุณ",
    "Ships tomorrow · ฿120 delivery fee refunded":"จัดส่งพรุ่งนี้ · คืนค่าจัดส่ง ฿120",
    "Sick leave":"ใบลาป่วย",
    "Start":"เริ่ม",
    "State · No doctor now (run fallback)":"สถานะ · ยังไม่มีแพทย์ว่าง",
    "State · Pharmacy declines (run reroute)":"สถานะ · ร้านยาไม่รับคำสั่งซื้อ",
    "Take 1 tablet by mouth once daily.":"รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง",
    "Take photo":"ถ่ายรูป",
    "Use another method":"ใช้ช่องทางอื่น",
    "Valid":"ใช้ได้",
    "You can reduce quantities within the prescription limit.":"คุณสามารถลดจำนวนได้ภายในขอบเขตที่แพทย์สั่ง",
    "Your doctor reviews your health and recommends a plan that fits your needs.":"แพทย์จะตรวจข้อมูลสุขภาพและแนะนำแผนที่เหมาะกับคุณ",
    "1 tablet daily · refill in 24 days":"วันละ 1 เม็ด · สั่งซ้ำในอีก 24 วัน",
    "Twice daily · refill in 24 days":"วันละ 2 ครั้ง · สั่งซ้ำในอีก 24 วัน",
    "2 refills left":"เหลือสิทธิ์สั่งซ้ำ 2 ครั้ง",
    "3 refills":"สั่งซ้ำได้ 3 ครั้ง",
    "1 total":"ทั้งหมด 1 รายการ",
    "3 total":"ทั้งหมด 3 รายการ",
    "1d":"1 วัน",
    "1h":"1 ชม.",
    "2d":"2 วัน",
    "2m":"2 นาที",
    "12 May 2026":"12 พ.ค. 2026",
    "12 May 2026 · Dr. assigned":"12 พ.ค. 2026 · มอบหมายแพทย์แล้ว",
    "2 Apr 2026 · Dr. assigned":"2 เม.ย. 2026 · มอบหมายแพทย์แล้ว",
    "2 Jul 2026":"2 ก.ค. 2026",
    "30 Jun 2026":"30 มิ.ย. 2026",
    "6 · General health":"6 · สุขภาพทั่วไป",
    "7 · Insurance":"7 · ประกัน",
    "#POL-77420 · credit ฿ 5,000 left":"#POL-77420 · เหลือวงเงิน ฿5,000",
    "#POL-88123 · credit ฿ 1,000 left":"#POL-88123 · เหลือวงเงิน ฿1,000",
    "(optional)":"(ไม่บังคับ)",
    "n/a":"ไม่มีข้อมูล",
    "partner only":"เฉพาะพาร์ตเนอร์",
    "self-pay path":"เส้นทางชำระเอง",
    "self-pay vs insurance":"ชำระเองเทียบกับประกัน",
    "skips stage 1":"ข้ามขั้นตอนที่ 1",
    "straight to stage 2":"ไปขั้นตอนที่ 2 ทันที",
    "→ joins booking":"→ ไปยังการนัดหมาย",
    "฿ 1,160 paid":"ชำระแล้ว ฿1,160",
    "฿ 225 / bottle":"฿225 / ขวด",
    "฿ 590 / month":"฿590 / เดือน",
    "Care built around you.":"การดูแลที่ออกแบบรอบตัวคุณ",
    "From consultation to your door.":"ตั้งแต่การปรึกษาจนถึงหน้าบ้านคุณ",
    "Private care, wherever you are.":"การดูแลที่เป็นส่วนตัว ไม่ว่าคุณอยู่ที่ไหน",
    "Dr. A., Dermatology · reviewed Jun 2026 · 4 min read":"คุณหมอ A, ผิวหนัง · ตรวจทาน มิ.ย. 2026 · อ่าน 4 นาที",
    "Ari · Bangkok":"อารีย์ · กรุงเทพฯ",
    "Bank gateway":"ช่องทางชำระเงินของธนาคาร",
    "Kasikornbank · secure checkout":"ธนาคารกสิกรไทย · ชำระเงินอย่างปลอดภัย",
    "Muang Thai Life (MTL)":"เมืองไทยประกันชีวิต (MTL)",
    "MTL Group":"กลุ่ม MTL",
    "Phra Khanong Nuea, Watthana, Bangkok 10110 · 3.2 km":"พระโขนงเหนือ เขตวัฒนา กรุงเทพฯ 10110 · 3.2 กม.",
    "Suan Luang, Bangkok 10250 · 8.7 km":"สวนหลวง กรุงเทพฯ 10250 · 8.7 กม.",
    "The Base Garden, Rama 9":"เดอะ เบส การ์เดน พระราม 9",
    "The Base Park West":"เดอะ เบส พาร์ค เวสต์",
    "The Base Park West, Rm 22/418 · Watthana, Bangkok 10110":"เดอะ เบส พาร์ค เวสต์ ห้อง 22/418 · เขตวัฒนา กรุงเทพฯ 10110",
    "Today, 11:05":"วันนี้ 11:05",
    "Today, 11:20":"วันนี้ 11:20",
    "Today, 11:22":"วันนี้ 11:22",
    "Order #KR-10293":"คำสั่งซื้อ #KR-10293",
    "Finasteride":"ฟีนาสเตอไรด์",
    "Finasteride 1mg":"ฟีนาสเตอไรด์ 1 มก.",
    "Finasteride · Minoxidil":"ฟีนาสเตอไรด์ · ไมน็อกซิดิล",
    "Finasteride 1mg · Minoxidil 5% · next refill in 24 days":"ฟีนาสเตอไรด์ 1 มก. · ไมน็อกซิดิล 5% · สั่งซ้ำในอีก 24 วัน",
    "Finasteride 1mg · Minoxidil 5% · started 12 May 2026":"ฟีนาสเตอไรด์ 1 มก. · ไมน็อกซิดิล 5% · เริ่ม 12 พ.ค. 2026",
    "Minoxidil 5%":"ไมน็อกซิดิล 5%",
    "Minoxidil 5% topical":"ไมน็อกซิดิลชนิดทา 5%",
    "Melatonin 5mg":"เมลาโทนิน 5 มก.",
    "Melatonin 5mg · next refill in 9 days":"เมลาโทนิน 5 มก. · เติมยาได้ในอีก 9 วัน",
    "Tretinoin 0.025%":"เตรทิโนอิน 0.025%",
    "เมลาโทนิน 5mg · เติมยาได้ในอีก 9 วัน":"เมลาโทนิน 5 มก. · เติมยาได้ในอีก 9 วัน",
    "175 cm · 70 kg":"175 ซม. · 70 กก.",
    "ขั้นตอนที่ 1 จาก 5, health concern":"ขั้นตอนที่ 1 จาก 5, อาการที่ปรึกษา",
    "ขั้นตอนที่ 2 จาก 5, patient details":"ขั้นตอนที่ 2 จาก 5, รายละเอียดผู้รับบริการ",
    "ขั้นตอนที่ 3 จาก 5, payment":"ขั้นตอนที่ 3 จาก 5, การชำระเงิน",
    "ขั้นตอนที่ 4 จาก 5, doctor consultation":"ขั้นตอนที่ 4 จาก 5, การปรึกษาแพทย์",
    "ขั้นตอนที่ 5 จาก 5, home delivery":"ขั้นตอนที่ 5 จาก 5, การจัดส่งถึงบ้าน",
    "กำลังรอแผนการรักษาจาก Dr. Narin":"กำลังรอแผนการรักษาจากคุณหมอนรินทร์",
    "ข้อมูลสุขภาพ (prefilled)":"ข้อมูลสุขภาพ (กรอกล่วงหน้าแล้ว)"
  };
  for (var _kclient in TH_CLIENT_MOBILE) TH[_kclient] = TH_CLIENT_MOBILE[_kclient];

  function swap(th) {
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) { var p = n.parentNode && n.parentNode.nodeName; return (p === "SCRIPT" || p === "STYLE") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
    });
    var nodes = [], n; while ((n = w.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      if (th) {
        var key = (node.__en !== undefined ? node.__en : node.nodeValue).trim();
        if (TH[key] !== undefined) { if (node.__en === undefined) node.__en = node.nodeValue; /* Replace inside the remembered English source, never the live value: a TH string that contains its own EN key ("CVV" -> "\u0e23\u0e2b\u0e31\u0e2a CVV") compounded on every screen change. */ node.nodeValue = node.__en.replace(key, TH[key]); }
      } else if (node.__en !== undefined) { node.nodeValue = node.__en; }
    });
    document.querySelectorAll("input[placeholder],textarea[placeholder]").forEach(function (el) {
      var o = el.getAttribute("data-ph-en") || el.getAttribute("placeholder");
      if (th) { if (TH[(o || "").trim()] !== undefined) { el.setAttribute("data-ph-en", o); el.setAttribute("placeholder", TH[o.trim()]); } }
      else if (el.getAttribute("data-ph-en")) { el.setAttribute("placeholder", el.getAttribute("data-ph-en")); }
    });
  }

  /* ---- persistence + cross-frame sync so the choice carries through the whole app ---- */
  var KEY = "krane_lang", current = false, mo = null, pending = false;

  function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function persist(th) { try { localStorage.setItem(KEY, th ? "th" : "en"); } catch (e) {} }
  function setToggles(th) {
    [].forEach.call(document.querySelectorAll("[data-lang] .lang__opt, .lang .lang__opt"), function (x) {
      if (x.dataset.lng) x.classList.toggle("is-active", (x.dataset.lng === "th") === th);
    });
  }
  function observeOn() { if (mo && current && document.body) mo.observe(document.body, { childList: true, subtree: true, characterData: true }); }
  function observeOff() { if (mo) mo.disconnect(); }

  function apply(th) {
    current = th;
    document.documentElement.lang = th ? "th" : "en";
    if (document.body) {
      document.body.classList.toggle("lang-th", th);
      document.body.classList.toggle("lang-en", !th);
    }
    observeOff();
    swap(th);
    observeOn();
    setToggles(th);
  }

  // re-translate content that scripts render after load (catalog, schedule, role switch, new screens)
  if (window.MutationObserver) {
    mo = new MutationObserver(function () {
      if (!current || pending) return;
      pending = true;
      requestAnimationFrame(function () { pending = false; observeOff(); swap(true); observeOn(); });
    });
  }

  function broadcast(th) {
    try { if (window.parent && window.parent !== window) window.parent.postMessage({ krane: "lang", th: th }, "*"); } catch (e) {}
    [].forEach.call(document.querySelectorAll("iframe"), function (f) { try { f.contentWindow.postMessage({ krane: "lang", th: th }, "*"); } catch (e) {} });
  }

  window.kraneSetLang = function (th) { apply(th); };

  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".lang__opt");
    if (!b || !b.dataset.lng) return;
    var th = b.dataset.lng === "th";
    apply(th); persist(th); broadcast(th);
  });

  // a toggle in another frame (landing iframe <-> app) keeps both in sync live
  window.addEventListener("message", function (e) {
    if (e.data && e.data.krane === "lang" && e.data.th !== current) { apply(e.data.th); persist(e.data.th); }
  });

  // Thai is the default language on every page load for both apps.
  // English only sticks if the user explicitly chose it (saved "en") or ?lang=en is set.
  function boot() {
    var en = (saved() === "en") || /[?&#]lang=en\b/.test(location.href);
    if (en) apply(false);
    else apply(true);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
