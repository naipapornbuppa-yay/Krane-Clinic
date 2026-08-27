/* ============================================================
   KRANE marketing pages: Thai source -> English.

   The landing page translates [data-i18n] elements and the service pages
   translate [data-nav-i18n] in the header. Everything else on those pages is
   Thai written straight into the markup, so English mode used to leave most of
   the page in Thai (client audit, 19 Aug). This walks the remaining text and
   swaps it, keyed on the exact Thai string, and puts the Thai back when the
   page returns to Thai.

   It is deliberately additive: it never touches a node that another handler
   already translated, because that node is no longer Thai.
   ============================================================ */
(function () {
  var EN = {
    "ข้ามไปยังเนื้อหาหลัก":"Skip to main content",
    "จัดส่งยาได้ทั่วประเทศ":"Nationwide medicine delivery",
    "ปรึกษาหมอส่วนตัว 1 ต่อ 1":"Private 1-to-1 doctor consultation",
    "แพทย์มีใบอนุญาต":"Licensed doctors",
    "เริ่มทันที 100% ออนไลน์":"Start instantly, 100% online",
    "ยาผ่านการรับรองจาก อย.":"Thai FDA-approved medicine",
    "แผนการรักษาเฉพาะบุคคล":"Personalised treatment plans",
    "บรรจุภัณฑ์มิดชิด":"Discreet packaging",
    "พญ. กรผกา ขันติโกสุม ว.":"Dr. Kornpaka Khantikosum, MD",
    "นพ. ไพรัช เกตุรัตนกุล ว.":"Dr. Pairat Ketrattanakul, MD",
    "อ.นพ. พหล สโรจวิสุทธิ์ ว.":"Dr. Pahol Sarojwisut, MD",
    "อ.นพ. ชวลิต หงส์เลิศสกุล ว.":"Dr. Chawalit Hongloetsakul, MD",
    "แพทย์ที่ปรึกษา Krane · เส้นผมและผิวหนัง":"Krane consulting doctor · hair and skin",
    "แพทย์ที่ปรึกษา Krane · การลดน้ำหนัก":"Krane consulting doctor · weight management",
    "แพทย์ที่ปรึกษา Krane · สุขภาพทางเพศ":"Krane consulting doctor · sexual health",
    "แพทย์ที่ปรึกษา · เส้นผมและผิวหนัง":"Consulting doctor · hair and skin",
    "แพทย์ที่ปรึกษา · การลดน้ำหนัก":"Consulting doctor · weight management",
    "แพทย์ที่ปรึกษา · สุขภาพทางเพศ":"Consulting doctor · sexual health",
    "ผู้อำนวยการแพทย์":"Medical director",
    "โภชนศาสตร์คลินิก":"Clinical nutrition",
    "ศัลยศาสตร์ยูโรวิทยา":"Urological surgery",
    "ตจวิทยา (ผิวหนัง)":"Dermatology",
    "ดูประวัติเต็ม":"See full profile",
    "ดูประวัติเต็ม →":"See full profile →",
    "ดูประวัติ พญ. กรผกา ขันติโกสุม":"See Dr. Kornpaka Khantikosum's profile",
    "ดูประวัติ นพ. ไพรัช เกตุรัตนกุล":"See Dr. Pairat Ketrattanakul's profile",
    "ดูประวัติ อ.นพ. พหล สโรจวิสุทธิ์":"See Dr. Pahol Sarojwisut's profile",
    "ดูประวัติ อ.นพ. ชวลิต หงส์เลิศสกุล":"See Dr. Chawalit Hongloetsakul's profile",
    "แพทย์ก่อนหน้า":"Previous doctor",
    "แพทย์ถัดไป":"Next doctor",
    "ทีมแพทย์ของเรา":"Our doctors",
    "การดูแลของ Krane ออกแบบและทบทวนโดยทีมแพทย์เฉพาะทางที่ได้รับใบอนุญาต ทุกแผนเริ่มจากข้อมูลสุขภาพจริงของคุณ และปรับตามความเหมาะสมทางคลินิกเมื่อข้อมูลเปลี่ยนไป":"Krane's care is designed and reviewed by licensed specialists. Every plan starts from your own health information and is adjusted on clinical grounds as that information changes.",
    "วิธีที่ทีมแพทย์ร่วมออกแบบการดูแล":"How the doctors shape your care",
    "ทุกขั้นตอนเริ่มจากข้อมูลสุขภาพจริง และผ่านการพิจารณาทางการแพทย์ก่อนเสนอทางเลือกที่เหมาะสม":"Every step starts from real health information and is reviewed clinically before any option is offered.",
    "รอรูปจาก workshop":"Awaiting images from the workshop",
    "เริ่มจากเรื่องที่คุณกังวล":"Start with what concerns you",
    "แบบประเมินรวบรวมอาการ ประวัติสุขภาพ และเป้าหมาย เพื่อให้แพทย์เห็นภาพรวมก่อนเริ่มปรึกษา":"The questionnaire gathers your symptoms, health history and goals so the doctor sees the whole picture before the consultation.",
    "ทบทวนทางเลือกอย่างมีเหตุผล":"Weigh the options with reasons",
    "แพทย์อธิบายประโยชน์ ข้อควรระวัง และทางเลือก โดยการสั่งยาขึ้นอยู่กับความเหมาะสมทางคลินิกของแต่ละคน":"The doctor explains the benefits, the cautions and the alternatives. Whether medicine is prescribed depends on what is clinically appropriate for you.",
    "ติดตามและปรับแผนต่อเนื่อง":"Follow up and adjust",
    "ทีมแพทย์ใช้ข้อมูลติดตามผลเพื่อประเมินความคืบหน้า ความปลอดภัย และปรับแผนเมื่อสุขภาพหรือเป้าหมายเปลี่ยนไป":"The doctors use your follow-up data to judge progress and safety, and adjust the plan when your health or goals change.",
    "บทความสุขภาพ":"Health articles",
    "ทำความเข้าใจกลไก ระยะเวลาที่เห็นผล และข้อควรระวังก่อนเริ่มใช้":"How it works, how long results take, and what to watch for before starting.",
    "วิธีใช้ให้ถูกต้อง ผลข้างเคียงที่พบได้ และช่วงเวลาที่ควรประเมินซ้ำ":"How to use it correctly, the side effects you may see, and when to reassess.",
    "การนอน อาหาร และความเครียด ส่งผลต่อวงจรเส้นผมอย่างไร":"How sleep, diet and stress affect the hair cycle.",
    "เริ่มจากข้อมูลสุขภาพจริงของคุณ":"Start from your own health information",
    "ปรึกษาแพทย์เลย":"Talk to a doctor",
    "กลับหน้าหลัก":"Back to home",
    "กลับหน้าแรก":"Back to home",
    "ข้อมูลวิชาชีพและความเชี่ยวชาญอ้างอิงจากข้อมูลที่ Krane Clinic จัดเตรียม และอาจมีการอัปเดตเพิ่มเติม":"Professional details and specialties come from information supplied by Krane Clinic and may be updated.",
    "รายชื่อแพทย์":"Doctor list",
    "เริ่มการดูแล":"Start care",
    "ก่อนและหลังการดูแล":"Before and after care",
    "ภาพติดตามผลถ่ายในมุมและระยะเดิมทุกครั้ง แพทย์เป็นผู้ประเมินความคืบหน้าร่วมกับคุณ":"Follow-up photos are taken at the same angle and distance every time. Your doctor assesses progress with you.",
    "ก่อน":"Before",
    "หลัง":"After",
    "ผมร่วง · ติดตามผล 6 เดือน":"Hair loss · 6-month follow-up",
    "ผิวและสิว · ติดตามผล 3 เดือน":"Skin and acne · 3-month follow-up",
    "น้ำหนัก · ติดตามผล 6 เดือน":"Weight · 6-month follow-up",
    "ตัวอย่างพื้นที่ภาพ รอภาพจริงจากผู้รับบริการที่ยินยอมให้เผยแพร่ · ผลลัพธ์แตกต่างกันในแต่ละบุคคล":"Placeholder images, awaiting real photographs from patients who consent to publication · results vary from person to person",
    "คุณ @bright.mind":"@bright.mind",
    "ผมร่วง":"Hair loss",
    "ผมร่วง · อ่าน 4 นาที":"Hair loss · 4 min read",
    "ผมร่วง · อ่าน 3 นาที":"Hair loss · 3 min read",
    "ฟีนาสเตอไรด์ได้ผลจริงไหม":"Does finasteride really work?",
    "สรุปหลักฐานทางการแพทย์ ผลที่คาดหวังได้ และข้อควรระวังก่อนเริ่มใช้":"The medical evidence in brief, what to expect, and what to watch for before starting.",
    "ไมน็อกซิดิล ต้องคาดหวังอะไรบ้าง":"Minoxidil: what to expect",
    "ไทม์ไลน์การเห็นผลจริง วิธีใช้ให้ต่อเนื่อง และอาการข้างเคียงที่พบบ่อย":"A realistic timeline, how to keep it up, and the common side effects.",
    "ไลฟ์สไตล์":"Lifestyle",
    "ไลฟ์สไตล์ · อ่าน 5 นาที":"Lifestyle · 5 min read",
    "นิสัยดี ๆ เพื่อสุขภาพผม":"Good habits for healthy hair",
    "การนอน อาหาร และความเครียด ส่งผลกับเส้นผมมากกว่าที่คิด":"Sleep, diet and stress affect your hair more than you would think.",
    "น้ำหนัก":"Weight",
    "น้ำหนัก · อ่าน 6 นาที":"Weight · 6 min read",
    "ลดน้ำหนักอย่างปลอดภัยใต้การดูแลแพทย์":"Losing weight safely under a doctor's care",
    "เริ่มจากประเมินสุขภาพ ตั้งเป้าที่ทำได้จริง และติดตามผลเป็นระยะ":"Start with a health assessment, set goals you can actually reach, and review as you go.",
    "ดูบทความทั้งหมด":"See all articles",
    "ทำไมถึงเลือก Krane":"Why choose Krane",
    "บริการอื่น ๆ":"Other services",
    "รีวิวจากสมาชิก":"Member reviews",
    "เปิดรีวิวของ @peach.vlog":"Open @peach.vlog's review",
    "เปิดรีวิวของ @ton_fitlife":"Open @ton_fitlife's review",
    "เปิดรีวิวของ @dr.oak_active":"Open @dr.oak_active's review",
    "เปิดรีวิวของ @bright.mind":"Open @bright.mind's review",
    "เปิดรีวิวของ @mick.antiag":"Open @mick.antiag's review",
    "เปิดรีวิวของ @gun_review":"Open @gun_review's review",
    "กลับไปดูบริการทั้งหมด":"Back to all services",
    "เริ่มประเมิน":"Start the assessment",
    "เริ่มแบบประเมิน":"Start the questionnaire",
    "เริ่มประเมินสุขภาพ":"Start a health assessment",
    "ปรึกษาส่วนตัวกับแพทย์ที่มีใบอนุญาต · ใช้เวลา 5 นาที":"A private consultation with a licensed doctor · about 5 minutes",
    "แพทย์ดูข้อมูลก่อนคุย":"The doctor reviews your information before you talk",
    "ไม่ต้องเริ่มเล่าใหม่ทั้งหมด":"You do not need to start the story again",
    "เป็นส่วนตัว":"Private by design",
    "ปรึกษาออนไลน์จากที่ที่คุณสบายใจ":"Consult online from wherever you feel comfortable",
    "เห็นค่าใช้จ่ายก่อนจ่าย":"See every cost before you pay",
    "แยกค่าปรึกษา ยา และจัดส่งชัดเจน":"Consultation, medicine and delivery are itemised clearly",
    "ดูแลต่อเนื่อง":"Continuous care",
    "ติดตามกับทีมเดิมและปรับแผนได้":"Follow up with the same team and adjust the plan when needed",
    "บริการนี้เหมาะกับคุณไหม":"Is this service right for you?",
    "เช็กภาพรวมก่อนทำแบบประเมิน คำตอบสุดท้ายขึ้นอยู่กับการประเมินของแพทย์":"Review the basics before the questionnaire. The final decision depends on the doctor's assessment.",
    "อาจเหมาะ หากคุณ…":"It may be suitable if you…",
    "มีอาการต่อเนื่องหรือเกิดซ้ำจนกระทบความมั่นใจ":"Symptoms continue or recur and affect your confidence",
    "ต้องการคุยกับแพทย์อย่างเป็นส่วนตัว":"You want to speak with a doctor privately",
    "ต้องการหาสาเหตุ ไม่ใช่ซื้อยาอย่างเดียว":"You want to understand the cause, not just buy medicine",
    "ควรแจ้งแพทย์ก่อน หากคุณ…":"Tell the doctor first if you…",
    "มีอาการเจ็บหน้าอก เหนื่อยผิดปกติ หรือโรคหัวใจ":"Have chest pain, unusual breathlessness or heart disease",
    "ใช้ยากลุ่ม nitrate หรือยาที่ไม่แน่ใจว่าใช้ร่วมกันได้":"Use nitrates or medicine you are unsure can be taken together",
    "มีอาการฉับพลัน รุนแรง หรือการแข็งตัวนานเกิน 4 ชั่วโมง":"Have sudden or severe symptoms, or an erection lasting more than four hours",
    "ตัดสินใจก่อนชำระเงินได้เสมอ":"Decide before you pay",
    "ค่าปรึกษา ค่ายา และค่าจัดส่งจะแสดงแยกรายการให้ตรวจสอบก่อนยืนยัน ไม่มีการสั่งยาโดยอัตโนมัติ":"Consultation, medicine and delivery costs are itemised for review before confirmation. Medicine is never ordered automatically.",
    "เริ่มประเมินก่อน":"Start with an assessment",
    "มีหมอและแผนเดิมดูแลคุณต่อ":"Continue with the same doctor and care plan",
    "ทุกครั้งที่กลับมา ประวัติ แผน และสิ่งที่เคยคุยจะอยู่ในที่เดียว เพื่อให้การติดตามต่อเนื่องและปรับได้จริง":"Whenever you return, your history, plan and previous conversations stay together so follow-up is continuous and can genuinely adapt.",
    "คุยกับแพทย์":"Talk with the doctor",
    "แพทย์อ่านแบบประเมินและประวัติก่อนเริ่มปรึกษา":"The doctor reads your questionnaire and history before the consultation starts.",
    "เก็บแผนไว้ในโปรไฟล์":"Keep the plan in your profile",
    "ดูแผนการรักษา วิธีใช้ยา และนัดครั้งถัดไปได้เสมอ":"See your care plan, medicine instructions and next appointment at any time.",
    "ติดตามกับทีมเดิม":"Follow up with the same team",
    "กลับมาคุยต่อจากเดิม พร้อมรายงานผลและอาการข้างเคียง":"Continue the conversation where you left off and report progress or side effects.",
    "ปรับเมื่อจำเป็น":"Adjust when needed",
    "แพทย์ทบทวนผลแล้วปรับแผน ไม่ปล่อยให้คุณจัดการคนเดียว":"The doctor reviews your progress and adjusts the plan, so you are not left to manage it alone.",
    "สิ่งที่ควรรู้ก่อนเริ่ม":"What to know before you start",
    "จำเป็นต้องเปิดกล้องไหม":"Do I need to turn on my camera?",
    "แพทย์อาจขอข้อมูลที่จำเป็นต่อการประเมิน แต่คุณสามารถแจ้งข้อกังวลเรื่องความเป็นส่วนตัวก่อนเริ่มได้":"The doctor may request information needed for the assessment, but you can raise privacy concerns before you begin.",
    "แพทย์จะสั่งยาให้เลยไหม":"Will the doctor prescribe medicine straight away?",
    "ไม่เสมอไป แพทย์จะทบทวนสาเหตุ สุขภาพหัวใจ และยาที่ใช้อยู่ก่อนเลือกแนวทาง":"Not necessarily. The doctor reviews the cause, your heart health and current medicines before choosing an approach.",
    "ติดตามกับแพทย์คนเดิมได้ไหม":"Can I follow up with the same doctor?",
    "ระบบออกแบบให้เห็นประวัติและแผนเดิม เพื่อให้ทีมดูแลติดตามต่อจากข้อมูลครั้งก่อน":"The system keeps your history and existing plan visible so the care team can continue from your previous information.",
    "ไม่มีแผนสำเร็จรูป มีแต่แผนของคุณ":"No off-the-shelf plans, only yours",
    "แพทย์อ่านคำตอบของคุณทุกข้อก่อนการปรึกษา แล้วออกแบบแนวทางจากข้อมูลจริง ไม่ใช่จากแพ็กเกจที่ตั้งไว้ล่วงหน้า":"The doctor reads every answer before the consultation and builds an approach from real information, not from a pre-set package.",
    "ตอบแบบประเมินสุขภาพ":"Answer the health questionnaire",
    "คำถามปรับตามอาการที่คุณเลือก ตอบทีละข้ออย่างเป็นส่วนตัว":"Questions adapt to the concern you pick, one at a time and in private.",
    "แพทย์ทบทวนก่อนคุย":"The doctor reviews before you talk",
    "อ่านประวัติ ยาที่ใช้อยู่ และความเสี่ยง ก่อนเข้าห้องปรึกษา":"Your history, current medicines and risks are read before the consultation room opens.",
    "ได้แผนเฉพาะของคุณ":"Get a plan that is yours",
    "เลือกแนวทางจากข้อบ่งใช้และเป้าหมาย พร้อมเหตุผลที่อธิบายได้":"An approach chosen from the indications and your goals, with reasons that can be explained.",
    "ติดตามและปรับ":"Follow up and adjust",
    "ทบทวนผลและผลข้างเคียงเป็นระยะ แล้วปรับแผนเมื่อจำเป็น":"Results and side effects are reviewed periodically, and the plan changes when it needs to.",
    "สิ่งที่แพทย์จะประเมิน":"What the doctor will assess",
    "บทความเกี่ยวกับอาการนี้":"Articles about this concern",
    "อ่าน 6 นาที":"6 min read",
    "อ่าน 5 นาที":"5 min read",
    "อ่าน 4 นาที":"4 min read",
    "อ่าน 3 นาที":"3 min read",
    "หน้านี้ให้ข้อมูลทั่วไป ไม่ใช่การวินิจฉัย":"This page is general information, not a diagnosis",
    "หากมีอาการรุนแรง เกิดขึ้นฉับพลัน หรือรู้สึกไม่ปลอดภัย ควรไปห้องฉุกเฉินหรือโทร 1669 แทนการรอปรึกษาออนไลน์":"If symptoms are severe, come on suddenly, or you feel unsafe, go to an emergency department or call 1669 rather than waiting for an online consultation.",
    "เริ่มจากแบบประเมินสั้น ๆ":"Start with a short questionnaire",
    "ตอบทีละหนึ่งคำถามและพูดคุยกับแพทย์อย่างเป็นส่วนตัว":"One question at a time, then a private conversation with a doctor.",
    "© 2026 Krane Clinic · การรักษาและการสั่งยาขึ้นอยู่กับการประเมินของแพทย์":"© 2026 Krane Clinic · treatment and prescribing depend on a doctor's assessment",
    "ผลลัพธ์จากการติดตามอย่างต่อเนื่อง":"Results from continuous follow-up",
    "เดือนที่ 6":"Month 6",
    "เดือนที่ 4":"Month 4",
    "เดือนที่ 9":"Month 9",
    "ผู้รับบริการ อายุ 34":"Patient, age 34",
    "ผู้รับบริการ อายุ 41":"Patient, age 41",
    "ผู้รับบริการ อายุ 29":"Patient, age 29",
    "ติดตามกับแพทย์ทุก 8 สัปดาห์":"Doctor follow-up every 8 weeks",
    "ปรับแผนหลังการติดตามครั้งที่สอง":"Plan adjusted after the second follow-up",
    "ดูแลต่อเนื่องพร้อมปรับพฤติกรรม":"Ongoing care alongside behaviour change",
    "ภาพประกอบเป็นตัวอย่างระหว่างรอภาพเคสจริงที่ได้รับความยินยอม ·":"Illustrations stand in until consented photographs of real cases are available ·",
    "ผลลัพธ์แตกต่างกันในแต่ละบุคคล ขึ้นอยู่กับแผนการดูแลและการติดตามกับแพทย์":"results vary from person to person, depending on the care plan and follow-up with the doctor",
    "ผลลัพธ์แตกต่างกันในแต่ละบุคคล ขึ้นอยู่กับสาเหตุและแผนการดูแลของแพทย์":"results vary from person to person, depending on the cause and the doctor's care plan",
    "รูปแบบยาที่แพทย์อาจพิจารณา":"The forms of medicine a doctor may consider",
    "แพทย์เลือกรูปแบบและขนาดยาจากข้อบ่งใช้ เป้าหมาย และประวัติสุขภาพของคุณ":"The doctor chooses the form and dose from the indications, your goals and your health history.",
    "ลดน้ำหนักด้วยแผนที่แพทย์ออกให้คุณ":"Lose weight on a plan a doctor writes for you",
    "เริ่มจากการประเมินโดยแพทย์ที่มีใบอนุญาต แล้ววางแผนที่ทำต่อได้จริงในชีวิตคุณ":"Start with an assessment by a licensed doctor, then a plan you can actually keep to.",
    "น้ำหนักมีหลายปัจจัยมากกว่าตัวเลขบนตาชั่ง":"Weight is more than the number on the scale",
    "ฮอร์โมนความอิ่ม พันธุกรรม การนอน ยาที่ใช้อยู่ และภาวะสุขภาพ ล้วนกำหนดว่าร่างกายเก็บและใช้พลังงานอย่างไร นี่คือเหตุผลที่แผนเดียวกันไม่ได้ผลกับทุกคน":"Satiety hormones, genetics, sleep, the medicines you take and your health conditions all shape how your body stores and uses energy. That is why the same plan does not work for everyone.",
    "~1 ใน 3":"~1 in 3",
    "ผู้ใหญ่ไทยอยู่ในเกณฑ์น้ำหนักเกิน":"Thai adults are in the overweight range",
    "น้ำหนักที่ลดลงก็เริ่มเห็นผลต่อสุขภาพแล้ว":"of weight lost already shows health benefits",
    "12+ เดือน":"12+ months",
    "ระยะเวลาที่ควรติดตามผลอย่างต่อเนื่อง":"is how long follow-up should continue",
    "ส่วนสูง น้ำหนัก และการเปลี่ยนแปลงที่ผ่านมา":"Height, weight and how they have changed",
    "โรคประจำตัว ประวัติการผ่าตัด และยาที่ใช้อยู่":"Existing conditions, past surgery and current medicines",
    "ประวัติตับอ่อน ถุงน้ำดี ต่อมไทรอยด์ และการตั้งครรภ์":"Pancreas, gallbladder and thyroid history, and pregnancy",
    "เป้าหมาย พฤติกรรมอาหาร การนอน และการเคลื่อนไหว":"Goals, eating habits, sleep and movement",
    "ใช้ต่อเนื่อง":"Ongoing use",
    "ฉีดใต้ผิวหนังสัปดาห์ละครั้ง":"A subcutaneous injection once a week",
    "ปากกาฉีด GLP-1":"GLP-1 injection pen",
    "เช่น semaglutide หรือ tirzepatide":"such as semaglutide or tirzepatide",
    "ตามข้อบ่งใช้รายบุคคล":"By individual indication",
    "ยารับประทาน":"Oral medicine",
    "แพทย์พิจารณาเมื่อเหมาะกับสุขภาพและเป้าหมาย":"Considered when it suits your health and goals",
    "Semaglutide และ tirzepatide เป็นยาที่ต้องประเมินข้อบ่งใช้ ข้อห้ามใช้ และติดตามผลโดยแพทย์ ไม่เหมาะสำหรับทุกคน":"Semaglutide and tirzepatide require a doctor to assess indications and contraindications and to monitor treatment. They are not suitable for everyone.",
    "GLP-1 ทำงานอย่างไรกับความอยากอาหาร":"How GLP-1 works on appetite",
    "กลไกโดยย่อ ผลข้างเคียงที่พบบ่อย และเหตุผลที่ต้องค่อย ๆ ปรับขนาดยา":"The mechanism in brief, the common side effects, and why the dose is raised slowly.",
    "คุยเรื่องนี้กับแพทย์ได้ โดยไม่ต้องเดินเข้าคลินิก":"Talk to a doctor about it without walking into a clinic",
    "ประเมินออนไลน์อย่างเป็นส่วนตัว หาสาเหตุที่แท้จริง แล้วเลือกทางที่ปลอดภัยกับหัวใจของคุณ":"A private online assessment to find the real cause, then an option that is safe for your heart.",
    "ED มักเป็นสัญญาณของร่างกาย ไม่ใช่ความล้มเหลว":"ED is usually a signal from the body, not a failure",
    "การแข็งตัวต้องอาศัยหลอดเลือด เส้นประสาท ฮอร์โมน และสภาพจิตใจทำงานร่วมกัน เมื่อส่วนใดส่วนหนึ่งเปลี่ยนไป อาการจึงปรากฏ และบ่อยครั้งมาก่อนโรคหัวใจหลายปี":"An erection depends on blood vessels, nerves, hormones and state of mind working together. When one of them changes, symptoms appear — often years before heart disease does.",
    "ผู้ชายอายุ 40–70 ปีเคยมีอาการในระดับหนึ่ง":"of men aged 40–70 have had it to some degree",
    "3–5 ปี":"3–5 years",
    "ED อาจมาก่อนอาการโรคหลอดเลือดหัวใจ":"is how far ED can precede coronary symptoms",
    "ตอบสนองต่อการรักษาเมื่อประเมินสาเหตุถูกต้อง":"respond to treatment when the cause is assessed correctly",
    "อาการเริ่มเมื่อไร เกิดทุกครั้งหรือเป็นบางครั้ง":"When it started, and whether it happens every time or sometimes",
    "โรคหัวใจ ความดัน เบาหวาน และระดับไขมัน":"Heart disease, blood pressure, diabetes and lipid levels",
    "ยาที่ใช้อยู่ โดยเฉพาะยากลุ่ม nitrate":"Current medicines, nitrates in particular",
    "ความต้องการทางเพศ อาการตอนตื่นนอน และปัจจัยด้านอารมณ์":"Libido, morning erections and emotional factors",
    "ระยะเวลาออกฤทธิ์และขนาดยาต้องเลือกจากสุขภาพหัวใจและยาที่คุณใช้อยู่":"Duration of action and dose are chosen from your heart health and the medicines you already take.",
    "ใช้เมื่อจำเป็น":"As needed",
    "รับประทานก่อนมีกิจกรรม":"Taken before activity",
    "ยากลุ่ม PDE5":"PDE5 inhibitors",
    "เช่น sildenafil หรือ tadalafil เมื่อไม่มีข้อห้ามใช้":"such as sildenafil or tadalafil, where there is no contraindication",
    "สำหรับบางกรณีตามการประเมิน":"For some cases, on assessment",
    "ขนาดต่ำรายวัน":"Low daily dose",
    "แพทย์พิจารณาเมื่อเหมาะกับรูปแบบอาการ":"Considered when it suits the pattern of symptoms",
    "ห้ามใช้ sildenafil หรือ tadalafil ร่วมกับยากลุ่ม nitrate และยาทั้งสองอาจไม่เหมาะกับผู้มีภาวะหัวใจบางชนิด แพทย์ต้องประเมินก่อนสั่งใช้":"Never take sildenafil or tadalafil with a nitrate. Neither is suitable for some heart conditions, and a doctor must assess you before prescribing.",
    "สุขภาพผู้ชาย":"Men's health",
    "ED อาจเป็นสัญญาณของสุขภาพหลอดเลือด":"ED can be a sign of vascular health",
    "ทำไมแพทย์จึงถามเรื่องความดัน เบาหวาน และไขมัน ก่อนพิจารณายา":"Why a doctor asks about blood pressure, diabetes and lipids before considering medicine.",
    "ยากลุ่ม PDE5 ต่างกันอย่างไร":"How the PDE5 inhibitors differ",
    "ระยะเวลาออกฤทธิ์ ข้อห้ามใช้ที่สำคัญ และสิ่งที่ต้องบอกแพทย์เสมอ":"Duration of action, the contraindications that matter, and what to always tell your doctor.",
    "หากมีอาการเจ็บหน้าอก หายใจไม่ออก อ่อนแรงเฉียบพลัน หรือการแข็งตัวนานเกิน 4 ชั่วโมง ให้ไปห้องฉุกเฉินหรือโทร 1669 ทันที":"Chest pain, breathlessness, sudden weakness, or an erection lasting more than 4 hours: go to an emergency department or call 1669 immediately.",
    "กลับไปดูทีมแพทย์":"Back to the doctors",
    "ทีมแพทย์ Krane":"Krane doctors",
    "ความเชี่ยวชาญ":"Specialty",
    "การศึกษาและการอบรม":"Education and training",
    "ข้อมูลการศึกษาอยู่ระหว่างการตรวจสอบและอัปเดต":"Education details are being verified and updated",
    "ขอบเขตการดูแล":"Scope of care",
    "ดูแลและให้คำปรึกษาด้านตจวิทยา (ผิวหนัง) โดยพิจารณาจากข้อมูลสุขภาพและแบบประเมินของผู้รับบริการ":"Provides dermatology care and advice, based on the patient's health information and questionnaire.",
    "รูปแบบการปรึกษา":"How the consultation works",
    "แพทย์จะทบทวนข้อมูลก่อนเริ่มนัดหมาย และให้คำปรึกษาผ่านระบบออนไลน์ที่เป็นส่วนตัว":"The doctor reviews your information before the appointment and consults through a private online session.",
    "ความเหมาะสมทางคลินิก":"Clinical suitability",
    "หากการปรึกษาทางไกลไม่เหมาะกับอาการ แพทย์อาจแนะนำการตรวจเพิ่มเติมหรือการพบแพทย์ด้วยตนเอง":"If a remote consultation does not suit your symptoms, the doctor may recommend further tests or an in-person visit.",
    "วิธีที่เราทำงานร่วมกัน":"How we work together",
    "ทีมแพทย์ร่วมออกแบบ":"The doctors shape",
    "การดูแลของ Krane อย่างไร":"how Krane cares for you",
    "ทุกขั้นตอนเริ่มจากข้อมูลสุขภาพจริงของผู้รับบริการ และผ่านการพิจารณาทางการแพทย์ก่อนเสนอทางเลือกที่เหมาะสม":"Every step starts from the patient's real health information and is reviewed clinically before any option is offered.",
    "แบบประเมินช่วยรวบรวมอาการ ประวัติสุขภาพ เป้าหมาย และข้อมูลสำคัญ เพื่อให้ทีมแพทย์เห็นภาพรวมก่อนเริ่มการปรึกษา":"The questionnaire gathers symptoms, health history, goals and other key details so the doctors see the whole picture before the consultation.",
    "แพทย์ซักถามเพิ่มเติม อธิบายประโยชน์ ข้อควรระวัง และทางเลือกที่เป็นไปได้ โดยการสั่งยาขึ้นอยู่กับความเหมาะสมทางคลินิกของแต่ละคน":"The doctor asks further questions and explains the benefits, the cautions and the possible alternatives. Whether medicine is prescribed depends on what is clinically appropriate for each person.",
    "หลังเริ่มการดูแล ทีมแพทย์ใช้ข้อมูลติดตามผลเพื่อประเมินความคืบหน้า ความปลอดภัย และปรับแผนเมื่อสุขภาพหรือเป้าหมายของคุณเปลี่ยนไป":"Once care has started, the doctors use follow-up data to judge progress and safety, and adjust the plan when your health or goals change.",
    "หน้ารายละเอียดแพทย์":"Doctor profile page",
    "Krane Clinic หน้าหลัก":"Krane Clinic home",
    "ข้อมูลการดูแล":"Care information",
    "คณะที่ปรึกษาทางการแพทย์":"Medical advisory board",
    "หน้าแยกสำหรับอธิบายบทบาทของที่ปรึกษา ซึ่งแตกต่างจากแพทย์ผู้ให้คำปรึกษากับผู้รับบริการโดยตรง":"A separate page explaining the advisers' role, which differs from that of the doctors who consult with patients directly.",
    "รอข้อมูลที่ปรึกษาจริงจากลูกค้า":"Awaiting the real adviser details from the client",
    "บทบาท":"Role",
    "ขอบเขตการกำกับคุณภาพทางการแพทย์":"Scope of medical quality oversight",
    "การทบทวนแนวทางการดูแล":"Review of care guidelines",
    "ความเกี่ยวข้องกับบริการแต่ละด้าน":"Relevance to each service area",
    "ประวัติ":"Background",
    "มหาวิทยาลัยและวุฒิการศึกษา":"University and qualifications",
    "ตำแหน่งและประสบการณ์ปัจจุบัน":"Current position and experience",
    "ผลงานหรือองค์กรที่อนุญาตให้เผยแพร่":"Publications or organisations cleared for publication",
    "สาขาที่ให้คำปรึกษากับ Krane":"Areas advised on for Krane",
    "ประสบการณ์ที่เกี่ยวข้องกับ telemedicine":"Relevant telemedicine experience",
    "ภาษาและพื้นที่ที่ให้คำแนะนำ":"Languages and regions advised",
    "หน้านี้เป็นโครงสร้างสำหรับทดสอบการนำเสนอข้อมูล ไม่อ้างว่าที่ปรึกษาเป็นผู้ตรวจหรือรักษาผู้รับบริการ เว้นแต่ลูกค้ายืนยันบทบาทนั้นอย่างชัดเจน":"This page is a structure for testing how the information reads. It does not claim that advisers examine or treat patients unless the client confirms that role explicitly.",
    "หน้ารายละเอียดที่ปรึกษา":"Adviser profile page",
    "ข้อมูลที่ปรึกษาที่ต้องใช้":"Adviser details still needed",
    "พส":"PS",
    "ชห":"CH"
  };

  var pending = false, mo = null, ownsLang = false;

  /* Two of these pages (doctor and adviser profiles) carry no language control
     and no header script, so nothing ever set <html lang> on them and they
     stayed Thai whatever the reader had chosen. Where no other handler owns the
     language, this module reads the same stored choice the rest of the site
     uses — Thai unless English was explicitly picked — and sets it. */
  function prefersEnglish() {
    try { if (localStorage.getItem("krane_lang") === "en") return true; } catch (e) {}
    return /[?&#]lang=en\b/.test(location.href);
  }
  function isEnglish() {
    return ownsLang ? prefersEnglish() : document.documentElement.lang === "en";
  }

  function walk(en) {
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode && n.parentNode.nodeName;
        return (p === "SCRIPT" || p === "STYLE" || p === "NOSCRIPT") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], n;
    while ((n = w.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      if (en) {
        var key = (node.__thSrc !== undefined ? node.__thSrc : node.nodeValue).trim();
        if (EN[key] !== undefined) {
          if (node.__thSrc === undefined) node.__thSrc = node.nodeValue;
          node.nodeValue = node.__thSrc.replace(key, EN[key]);
        }
      } else if (node.__thSrc !== undefined) {
        node.nodeValue = node.__thSrc;
        delete node.__thSrc;
      }
    });
    document.querySelectorAll("[placeholder]").forEach(function (el) {
      var th = el.getAttribute("data-ph-th");
      if (en) {
        var p = (th || el.getAttribute("placeholder") || "").trim();
        if (EN[p] !== undefined) { if (!th) el.setAttribute("data-ph-th", el.getAttribute("placeholder")); el.setAttribute("placeholder", EN[p]); }
      } else if (th) { el.setAttribute("placeholder", th); el.removeAttribute("data-ph-th"); }
    });
    document.querySelectorAll("[aria-label]").forEach(function (el) {
      var th = el.getAttribute("data-al-th");
      if (en) {
        var a = (th || el.getAttribute("aria-label") || "").trim();
        if (EN[a] !== undefined) { if (!th) el.setAttribute("data-al-th", el.getAttribute("aria-label")); el.setAttribute("aria-label", EN[a]); }
      } else if (th) { el.setAttribute("aria-label", th); el.removeAttribute("data-al-th"); }
    });
  }

  function observeOff() { if (mo) mo.disconnect(); }
  function observeOn() { if (mo) mo.observe(document.body, { childList: true, subtree: true, characterData: true }); }

  function apply() {
    var en = isEnglish();
    if (ownsLang) document.documentElement.lang = en ? "en" : "th";
    observeOff();
    walk(en);
    observeOn();
  }

  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; apply(); });
  }

  function boot() {
    ownsLang = !document.querySelector("[data-language], [data-lang] .lang__opt, .lang .lang__opt");
    if (window.MutationObserver) mo = new MutationObserver(schedule);
    apply();
    /* The page's own language handler runs first and changes <html lang>; both
       of those are watched so this pass always lands after it. */
    new MutationObserver(schedule).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    document.addEventListener("krane:languagechange", schedule);
    document.addEventListener("change", function (e) {
      if (e.target && e.target.matches && e.target.matches("[data-language]")) schedule();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
