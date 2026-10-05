(() => {
  /* Nav behaviour and NAV_TRANSLATIONS moved to site-header.js so every
     public page shares one implementation. */

  /* One article library for the whole site. Each entry carries the condition
     tags it belongs to, so a detail page shows only its own reading list and
     the landing page can show the same cards unfiltered. */
  const ARTICLES = [
    {
      tags: ["hair-skin"],
      category: "ผมร่วง",
      meta: "อ่าน 4 นาที",
      title: "ฟีนาสเตอไรด์ได้ผลจริงไหม",
      excerpt: "สรุปหลักฐานทางการแพทย์ ผลที่คาดหวังได้ และข้อควรระวังก่อนเริ่มใช้",
      image: "assets/landing-573/treatments/daily-focus-mind.png"
    },
    {
      tags: ["hair-skin"],
      category: "ผมร่วง",
      meta: "อ่าน 3 นาที",
      title: "ไมน็อกซิดิล ต้องคาดหวังอะไรบ้าง",
      excerpt: "ไทม์ไลน์การเห็นผลจริง วิธีใช้ให้ต่อเนื่อง และอาการข้างเคียงที่พบบ่อย",
      image: "assets/landing-573/treatments/hair-loss-prevention.png"
    },
    {
      tags: ["hair-skin", "skin"],
      category: "ไลฟ์สไตล์",
      meta: "อ่าน 5 นาที",
      title: "นิสัยดี ๆ เพื่อสุขภาพผมและผิว",
      excerpt: "การนอน อาหาร และความเครียด ส่งผลกับเส้นผมและผิวมากกว่าที่คิด",
      image: "assets/landing-573/treatments/skin-anti-aging.png"
    },
    {
      tags: ["weight"],
      category: "น้ำหนัก",
      meta: "อ่าน 6 นาที",
      title: "อะไรคือ GLP-1 agonists? ที่มาของ GLP-1",
      excerpt: "กลไกโดยย่อ ที่มาของยากลุ่มนี้ และเหตุผลที่แพทย์ต้องค่อย ๆ ปรับขนาดยา",
      image: "assets/landing-573/treatments/weight-management.png"
    },
    {
      tags: ["weight"],
      category: "น้ำหนัก",
      meta: "อ่าน 4 นาที",
      title: "semaglutide หรือ tirzepatide? ทำไมแพทย์ต้องเป็นผู้ประเมิน",
      excerpt: "สองตัวยาต่างกันอย่างไร และอะไรที่แพทย์ดูก่อนเลือกให้แต่ละคน",
      image: "assets/landing-573/treatments/hormonal-balance-trt.png"
    },
    {
      tags: ["weight"],
      category: "น้ำหนัก",
      meta: "อ่าน 5 นาที",
      title: "ผลข้างเคียงของ GLP-1 ที่พบบ่อย และวิธีรับมือ",
      excerpt: "อาการที่เจอได้ในช่วงแรก วิธีบรรเทา และสัญญาณที่ต้องแจ้งแพทย์",
      image: "assets/landing-573/treatments/daily-focus-mind.png"
    },
    {
      tags: ["weight"],
      category: "น้ำหนัก",
      meta: "อ่าน 4 นาที",
      title: "วิธีสังเกตยาของแท้ ทำไมยาควรมาในบรรจุภัณฑ์เดิม",
      excerpt: "บรรจุภัณฑ์จากผู้ผลิต เลข serial และการตรวจสอบกับ อย.",
      image: "assets/landing-573/treatments/hair-loss-prevention.png"
    },
    {
      tags: ["weight"],
      category: "น้ำหนัก",
      meta: "อ่าน 5 นาที",
      title: "ทำไมการออกกำลังกายสำคัญระหว่างใช้ GLP-1",
      excerpt: "รักษามวลกล้ามเนื้อระหว่างน้ำหนักลด และลดโอกาสน้ำหนักเด้งกลับ",
      image: "assets/landing-573/treatments/skin-anti-aging.png"
    },
    {
      tags: ["sexual-health"],
      category: "สุขภาพผู้ชาย",
      meta: "อ่าน 5 นาที",
      title: "ED อาจเป็นสัญญาณของสุขภาพหลอดเลือด",
      excerpt: "ทำไมแพทย์จึงถามเรื่องความดัน เบาหวาน และไขมัน ก่อนพิจารณายา",
      image: "assets/landing-573/treatments/sexual-performance.png"
    },
    {
      tags: ["sexual-health"],
      category: "สุขภาพผู้ชาย",
      meta: "อ่าน 3 นาที",
      title: "ยากลุ่ม PDE5 ต่างกันอย่างไร",
      excerpt: "ระยะเวลาออกฤทธิ์ ข้อห้ามใช้ที่สำคัญ และสิ่งที่ต้องบอกแพทย์เสมอ",
      image: "assets/landing-573/treatments/daily-focus-mind.png"
    },
    {
      tags: ["skin"],
      category: "ผิวพรรณ",
      meta: "อ่าน 5 นาที",
      title: "เริ่มใช้ retinoids โดยไม่ทำให้ผิวพัง",
      excerpt: "ความเข้มข้น ความถี่ และช่วงปรับตัวของผิวที่ควรรู้ก่อนเริ่ม",
      image: "assets/landing-573/treatments/skin-anti-aging.png"
    },
    {
      tags: ["hormone"],
      category: "ฮอร์โมน",
      meta: "อ่าน 6 นาที",
      title: "อาการเหนื่อยล้าไม่ได้แปลว่าฮอร์โมนต่ำเสมอไป",
      excerpt: "สาเหตุอื่นที่ต้องคัดกรองก่อน และเหตุผลที่ต้องตรวจยืนยันก่อน TRT",
      image: "assets/landing-573/treatments/hormonal-balance-trt.png"
    },
    {
      tags: ["sleep-stress"],
      category: "การนอน",
      meta: "อ่าน 4 นาที",
      title: "นอนไม่หลับเรื้อรัง เริ่มแก้จากตรงไหน",
      excerpt: "ทำไมการปรับกิจวัตรจึงมาก่อนยานอนหลับ และสัญญาณที่ควรพบแพทย์",
      image: "assets/landing-573/treatments/daily-focus-mind.png"
    }
  ];

  const CONDITIONS = {
    weight: {
      category: "weight",
      tone: "weight",
      image: "assets/product-hero/weight-care-couple-cool-greige-v9.png",
      kicker: "ดูแลน้ำหนักกับแพทย์",
      hook: "ลดน้ำหนักด้วยแผนที่แพทย์ออกให้คุณ",
      lead: "เริ่มจากการประเมินโดยแพทย์ที่มีใบอนุญาต แล้ววางแผนที่ทำต่อได้จริงในชีวิตคุณ",
      knowledgeTitle: "น้ำหนักมีหลายปัจจัยมากกว่าตัวเลขบนตาชั่ง",
      knowledge:
        "ฮอร์โมนความอิ่ม พันธุกรรม การนอน ยาที่ใช้อยู่ และภาวะสุขภาพ ล้วนกำหนดว่าร่างกายเก็บและใช้พลังงานอย่างไร นี่คือเหตุผลที่แผนเดียวกันไม่ได้ผลกับทุกคน",
      knowledgeStats: [
        ["~1 ใน 3", "ผู้ใหญ่ไทยอยู่ในเกณฑ์น้ำหนักเกิน"],
        ["5–10%", "น้ำหนักที่ลดลงก็เริ่มเห็นผลต่อสุขภาพแล้ว"],
        ["12+ เดือน", "ระยะเวลาที่ควรติดตามผลอย่างต่อเนื่อง"]
      ],
      facts: [
        ["activity", "เป้าหมายของคุณ", "คุยถึงเป้าหมายที่เป็นจริงและติดตามผลได้"],
        ["heart-pulse", "สุขภาพโดยรวม", "ทบทวนโรคประจำตัว ประวัติครอบครัว และความเสี่ยง"],
        ["utensils", "พฤติกรรมประจำวัน", "ดูรูปแบบอาหาร การเคลื่อนไหว การนอน และความเครียด"],
        ["chart-no-axes-combined", "ติดตามต่อเนื่อง", "ประเมินผลข้างเคียงและปรับแผนเมื่อจำเป็น"]
      ],
      assessment: [
        "ส่วนสูง น้ำหนัก และการเปลี่ยนแปลงที่ผ่านมา",
        "โรคประจำตัว ประวัติการผ่าตัด และยาที่ใช้อยู่",
        "ประวัติตับอ่อน ถุงน้ำดี ต่อมไทรอยด์ และการตั้งครรภ์",
        "เป้าหมาย พฤติกรรมอาหาร การนอน และการเคลื่อนไหว"
      ],
      medicalNote:
        "Semaglutide และ tirzepatide เป็นยาที่ต้องประเมินข้อบ่งใช้ ข้อห้ามใช้ และติดตามผลโดยแพทย์ ไม่เหมาะสำหรับทุกคน",
      productsTitle: "รูปแบบยาที่แพทย์อาจพิจารณา",
      productsLead: "แพทย์เลือกรูปแบบและขนาดยาจากข้อบ่งใช้ เป้าหมาย และประวัติสุขภาพของคุณ",
      products: [
          ["ปากกาฉีด GLP-1", "ฉีดใต้ผิวหนังสัปดาห์ละครั้ง", "เช่น semaglutide หรือ tirzepatide", "assets/medicine/weight-diecut-v1/wegovy-flex-touch-diecut-v1.png", "pen", "ใช้ต่อเนื่อง"],
          ["ยารับประทาน", "ตามข้อบ่งใช้รายบุคคล", "แพทย์พิจารณาเมื่อเหมาะกับสุขภาพและเป้าหมาย", "assets/medicine/weight-diecut-v1/rybelsus-bottles-diecut-v1.png", "oral", "ใช้ต่อเนื่อง"]
      ],
      resultsNote: "ผลลัพธ์แตกต่างกันในแต่ละบุคคล ขึ้นอยู่กับแผนการดูแลและการติดตามกับแพทย์"
    },
    "re-flow": {
      category: "sexual-health",
      tone: "ed",
      image: "assets/figma-draft-20260830/hero-ed-lifestyle-french-manicure-v4.png",
      kicker: "โปรแกรม re:flow",
      hook: "กลับมามั่นใจ ในจังหวะของคุณ",
      lead: "เริ่มจากการประเมินสุขภาพกับแพทย์อย่างเป็นส่วนตัว เพื่อหาสาเหตุและวางแผนการดูแลที่ปลอดภัยสำหรับคุณ",
      knowledgeTitle: "ED มักเป็นสัญญาณของร่างกาย ไม่ใช่ความล้มเหลว",
      knowledge:
        "การแข็งตัวต้องอาศัยหลอดเลือด เส้นประสาท ฮอร์โมน และสภาพจิตใจทำงานร่วมกัน เมื่อส่วนใดส่วนหนึ่งเปลี่ยนไป อาการจึงปรากฏ และบ่อยครั้งมาก่อนโรคหัวใจหลายปี",
      knowledgeStats: [
        ["~50%", "ผู้ชายอายุ 40–70 ปีเคยมีอาการในระดับหนึ่ง"],
        ["3–5 ปี", "ED อาจมาก่อนอาการโรคหลอดเลือดหัวใจ"],
        ["70%+", "ตอบสนองต่อการรักษาเมื่อประเมินสาเหตุถูกต้อง"]
      ],
      facts: [
        ["heart-pulse", "สุขภาพหัวใจและหลอดเลือด", "ประเมินความดัน เบาหวาน ไขมัน และอาการที่เกี่ยวข้อง"],
        ["pill", "ยาและอาหารเสริม", "ทบทวนยาที่อาจมีผลต่ออาการหรือเกิดปฏิกิริยาระหว่างยา"],
        ["brain", "ความเครียดและความสัมพันธ์", "แยกปัจจัยทางกายและอารมณ์โดยไม่ตัดสิน"],
        ["lock-keyhole", "คุยอย่างเป็นส่วนตัว", "ข้อมูลสุขภาพได้รับการดูแลตามมาตรฐานความเป็นส่วนตัว"]
      ],
      assessment: [
        "อาการเริ่มเมื่อไร เกิดทุกครั้งหรือเป็นบางครั้ง",
        "โรคหัวใจ ความดัน เบาหวาน และระดับไขมัน",
        "ยาที่ใช้อยู่ โดยเฉพาะยากลุ่ม nitrate",
        "ความต้องการทางเพศ อาการตอนตื่นนอน และปัจจัยด้านอารมณ์"
      ],
      medicalNote:
        "ห้ามใช้ sildenafil หรือ tadalafil ร่วมกับยากลุ่ม nitrate และยาทั้งสองอาจไม่เหมาะกับผู้มีภาวะหัวใจบางชนิด แพทย์ต้องประเมินก่อนสั่งใช้",
      productsTitle: "รูปแบบยาที่แพทย์อาจพิจารณา",
      productsLead: "ระยะเวลาออกฤทธิ์และขนาดยาต้องเลือกจากสุขภาพหัวใจและยาที่คุณใช้อยู่",
      products: [
        ["ยากลุ่ม PDE5", "รับประทานก่อนมีกิจกรรม", "เช่น sildenafil หรือ tadalafil เมื่อไม่มีข้อห้ามใช้", "assets/condition-detail/products-diecut-v1/sexual-capsule.png", "oral", "ใช้เมื่อจำเป็น"],
        ["ขนาดต่ำรายวัน", "สำหรับบางกรณีตามการประเมิน", "แพทย์พิจารณาเมื่อเหมาะกับรูปแบบอาการ", "assets/condition-detail/products-diecut-v1/oral-tablet.png", "oral", "ใช้ต่อเนื่อง"]
      ],
      safety:
        "หากมีอาการเจ็บหน้าอก หายใจไม่ออก อ่อนแรงเฉียบพลัน หรือการแข็งตัวนานเกิน 4 ชั่วโมง ให้ไปห้องฉุกเฉินหรือโทร 1669 ทันที",
      resultsNote: "ผลลัพธ์แตกต่างกันในแต่ละบุคคล ขึ้นอยู่กับสาเหตุและแผนการดูแลของแพทย์"
    },
    "sexual-health": {
      category: "sexual-health",
      tone: "ed",
      image: "assets/product-hero/ed-care-couple-short-sleepwear-bed-pills-v13.png",
      kicker: "สุขภาพทางเพศแบบเป็นส่วนตัว",
      hook: "เริ่มจากการคุย โดยไม่ถูกตัดสิน",
      lead: "อาการด้านสมรรถภาพ ความต้องการทางเพศ หรือข้อกังวลอื่น ๆ ประเมินออนไลน์กับแพทย์ได้อย่างเป็นส่วนตัว",
      knowledgeTitle: "สุขภาพทางเพศเชื่อมโยงกับสุขภาพกายและใจ",
      knowledge:
        "ฮอร์โมน หลอดเลือด ยาที่ใช้อยู่ คุณภาพการนอน และความเครียด ต่างส่งผลถึงกัน การแยกสาเหตุให้ชัดจึงสำคัญกว่าการรีบเลือกยา",
      knowledgeStats: [
        ["หลายสาเหตุ", "อาการเดียวกันมาจากคนละต้นเหตุได้"],
        ["100% ส่วนตัว", "ปรึกษาออนไลน์ ไม่ต้องเล่าหน้าเคาน์เตอร์"],
        ["มีใบอนุญาต", "ทุกแผนทบทวนโดยแพทย์"]
      ],
      facts: [
        ["heart-pulse", "สุขภาพกาย", "ประเมินโรคประจำตัว ฮอร์โมน และยาที่ใช้อยู่"],
        ["brain", "สุขภาพใจ", "ดูความเครียด ความกังวล และคุณภาพการนอน"],
        ["users", "ความสัมพันธ์", "พูดคุยบริบทโดยเคารพขอบเขตและความเป็นส่วนตัว"],
        ["shield-check", "แผนที่ปลอดภัย", "แนะนำการตรวจ ยา หรือการส่งต่อเมื่อมีข้อบ่งชี้"]
      ],
      assessment: [
        "ลักษณะอาการ ระยะเวลา และผลต่อชีวิตประจำวัน",
        "โรคประจำตัว การผ่าตัด และยาที่ใช้",
        "ความเครียด การนอน และความสัมพันธ์",
        "อาการร่วมที่อาจต้องตรวจหรือส่งต่อ"
      ],
      medicalNote:
        "แนวทางและยาที่เหมาะสมแตกต่างกันตามอาการ สาเหตุ และข้อห้ามใช้ แพทย์ต้องประเมินเป็นรายบุคคล",
      productsTitle: "รูปแบบการดูแลที่อาจใช้",
      productsLead: "แพทย์เริ่มจากสาเหตุและความปลอดภัย ก่อนพิจารณายา การตรวจ หรือการส่งต่อ",
      products: [
        ["ยาเมื่อมีข้อบ่งใช้", "เลือกตามอาการและข้อห้ามใช้", "แพทย์ทบทวนยาที่ใช้อยู่ทุกครั้งก่อนสั่งจ่าย", "assets/condition-detail/products-diecut-v1/sexual-capsule.png", "oral", "ใช้เมื่อจำเป็น"],
        ["การดูแลตามสาเหตุ", "คำแนะนำ การตรวจ และการติดตาม", "บางกรณีไม่ต้องใช้ยาเลย", "assets/condition-detail/products-diecut-v1/oral-tablet.png", "oral", "ไม่ใช้ยา"]
      ],
      resultsNote: "ผลลัพธ์แตกต่างกันในแต่ละบุคคล ขึ้นอยู่กับสาเหตุและแผนการดูแลของแพทย์"
    },
    "hair-loss": {
      category: "hair-skin",
      tone: "hair",
      image: "assets/product-hero/hair-asian-man-left-hand-final-v1.png",
      kicker: "ฟื้นฟูเส้นผม",
      hook: "รู้สาเหตุก่อน แล้วผมจะกลับมาถูกทาง",
      lead: "รูปแบบผมร่วง หนังศีรษะ ประวัติครอบครัว และความเครียด ช่วยให้แพทย์เลือกวิธีดูแลได้ตรงจุด",
      knowledgeTitle: "ผมร่วงแต่ละแบบดูแลไม่เหมือนกัน",
      knowledge:
        "ผมบางจากพันธุกรรม ผมร่วงเป็นหย่อม การอักเสบของหนังศีรษะ และผมร่วงหลังความเครียดหรือเจ็บป่วย ล้วนมีกลไกต่างกัน การรักษาที่ได้ผลกับแบบหนึ่งอาจไม่ช่วยอีกแบบเลย",
      knowledgeStats: [
        ["ราว 50%", "ผู้ชายมีผมบางจากพันธุกรรมเมื่ออายุ 50 ปี"],
        ["3 ถึง 6 เดือน", "ระยะเวลาก่อนเริ่มเห็นผลของการรักษา"],
        ["ต่อเนื่อง", "หยุดใช้ยา ผมมักกลับไปร่วงเหมือนเดิม"]
      ],
      facts: [
        ["scan", "ดูรูปแบบผมร่วง", "แนวไรผม กลางศีรษะ เป็นหย่อม หรือร่วงกระจาย"],
        ["history", "ทบทวนช่วงเวลา", "เริ่มเมื่อไร เปลี่ยนเร็วเพียงใด และมีเหตุการณ์กระตุ้นหรือไม่"],
        ["sparkles", "ประเมินหนังศีรษะ", "ดูอาการคัน แดง สะเก็ด แผล หรือการอักเสบ"],
        ["dna", "ประวัติสุขภาพและครอบครัว", "รวมยา โภชนาการ ฮอร์โมน และกรรมพันธุ์"]
      ],
      assessment: [
        "รูปแบบและระยะเวลาที่ผมร่วง",
        "อาการคัน เจ็บ แดง สะเก็ด หรือแผลบนหนังศีรษะ",
        "ยา อาหารเสริม การเจ็บป่วย และความเครียดที่ผ่านมา",
        "ประวัติผมบางในครอบครัวและภาพถ่ายติดตาม"
      ],
      medicalNote:
        "Finasteride และ minoxidil มีข้อควรระวังและผลข้างเคียงต่างกัน ผลลัพธ์ต้องใช้เวลาและไม่เหมือนกันในแต่ละคน",
      productsTitle: "รูปแบบยาที่แพทย์อาจพิจารณา",
      productsLead: "มีทั้งยาทาและยารับประทาน โดยต้องเลือกให้ตรงกับรูปแบบผมร่วงและข้อควรระวัง",
      products: [
        ["ยาทาหนังศีรษะ", "ใช้วันละ 1 ถึง 2 ครั้ง", "เช่น minoxidil ตามรูปแบบอาการ", "assets/condition-detail/products-diecut-v1/hair-pump.png", "topical", "ใช้ต่อเนื่อง"],
        ["ยารับประทาน", "วันละครั้ง ตามใบสั่งแพทย์", "เช่น finasteride เมื่อแพทย์เห็นว่าเหมาะสม", "assets/condition-detail/products-diecut-v1/hair-bottle.png", "oral", "ใช้ต่อเนื่อง"],
        ["เซรั่มบำรุงหนังศีรษะ", "ใช้ร่วมกับแผนหลัก", "ช่วยเรื่องความชุ่มชื้นและการระคายเคือง", "assets/condition-detail/products-diecut-v1/hair-dropper.png", "topical", "ใช้เสริม"]
      ],
      resultsNote: "ผลลัพธ์แตกต่างกันในแต่ละบุคคล ขึ้นอยู่กับสาเหตุ ระยะเวลา และความต่อเนื่องในการรักษา"
    },
    skin: {
      category: "skin",
      tone: "skin",
      image: "assets/treatment-editorial/skin-hands-cream-editorial-v2.png",
      kicker: "ผิวพรรณ & ชะลอวัย",
      hook: "ผิวที่ดูคล้ายกัน อาจต้องการคนละแผน",
      lead: "สิว รอยดำ ความไวของผิว และริ้วรอยมีหลายปัจจัย แพทย์ประเมินก่อนแนะนำสารออกฤทธิ์ที่เหมาะกับผิวคุณ",
      knowledgeTitle: "ตำแหน่งและลักษณะบอกสาเหตุได้มาก",
      knowledge:
        "สิวที่กราม สิวที่หน้าผาก รอยแดงหลังสิว และจุดด่างดำจากแดด มีกลไกต่างกัน การเลือกสารออกฤทธิ์ผิดจึงทำให้ผิวแย่ลงได้ แม้จะเป็นผลิตภัณฑ์ที่ดี",
      knowledgeStats: [
        ["4–12 สัปดาห์", "ช่วงที่ผิวต้องปรับตัวกับสารออกฤทธิ์ใหม่"],
        ["SPF ทุกวัน", "ปัจจัยเดียวที่ช่วยได้แทบทุกปัญหาผิว"],
        ["ทีละอย่าง", "เพิ่มสารออกฤทธิ์ทีละตัวเพื่อหาสาเหตุการระคายเคือง"]
      ],
      facts: [
        ["scan-face", "ลักษณะและตำแหน่ง", "ดูชนิดของสิว รอย จุดด่างดำ หรือความเปลี่ยนแปลงของผิว"],
        ["flask-conical", "ผลิตภัณฑ์ที่ใช้อยู่", "ทบทวนสารสำคัญ ความถี่ และอาการแพ้ระคายเคือง"],
        ["sun", "แสงแดดและสิ่งกระตุ้น", "ประเมินพฤติกรรมกันแดด ฮอร์โมน และสิ่งแวดล้อม"],
        ["calendar-check", "ติดตามการตอบสนอง", "ปรับแผนตามผลลัพธ์และความทนของผิว"]
      ],
      assessment: [
        "อาการหลัก ตำแหน่ง ระยะเวลา และภาพถ่ายที่ชัดเจน",
        "ผลิตภัณฑ์และยาทุกชนิดที่ใช้อยู่",
        "ประวัติแพ้ ระคายเคือง ตั้งครรภ์ หรือให้นมบุตร",
        "เป้าหมายและเวลาที่พร้อมติดตามผล"
      ],
      medicalNote:
        "ยาทาบางชนิดรวมถึง retinoids มีข้อควรระวัง โดยเฉพาะระหว่างตั้งครรภ์หรือวางแผนตั้งครรภ์ ควรให้แพทย์ประเมินก่อนใช้",
      productsTitle: "รูปแบบยาที่แพทย์อาจพิจารณา",
      productsLead: "เนื้อยา ความเข้มข้น และความถี่ต้องเหมาะกับปัญหาและความไวของผิว",
      products: [
        ["ยาทาเฉพาะที่", "ทาบาง ๆ ก่อนนอน", "เลือกสารออกฤทธิ์ตามปัญหาผิว", "assets/condition-detail/products-diecut-v1/skin-serum.png", "topical", "ใช้ต่อเนื่อง"],
        ["ผลิตภัณฑ์สนับสนุนผิว", "ใช้ร่วมกับแผนแพทย์", "จัดกิจวัตรให้ผิวทนต่อสารออกฤทธิ์ได้", "assets/condition-detail/products-diecut-v1/hair-pump.png", "topical", "ใช้เสริม"]
      ],
      resultsNote: "ผลลัพธ์แตกต่างกันในแต่ละบุคคล ขึ้นอยู่กับชนิดของปัญหาผิวและความต่อเนื่อง"
    },
    hormone: {
      category: "hormone",
      tone: "hormone",
      image: "assets/treatment-editorial/hormone-hands-consult-editorial-v2.png",
      kicker: "ฮอร์โมน & TRT",
      hook: "ก่อนจะเริ่ม TRT ต้องรู้ให้แน่ก่อนว่าใช่",
      lead: "ความเหนื่อยล้า สมรรถภาพลดลง หรือมวลกล้ามเนื้อเปลี่ยน มีได้หลายสาเหตุ การตรวจยืนยันจึงมาก่อนการรักษา",
      knowledgeTitle: "อาการอย่างเดียวยังยืนยันภาวะฮอร์โมนต่ำไม่ได้",
      knowledge:
        "ระดับเทสโทสเตอโรนเปลี่ยนตามเวลาของวัน การนอน น้ำหนัก และความเจ็บป่วย ผลตรวจครั้งเดียวจึงไม่พอ และหลายอาการที่คล้ายฮอร์โมนต่ำมาจากสาเหตุที่รักษาง่ายกว่า",
      knowledgeStats: [
        ["ตอนเช้า", "ช่วงเวลาที่ควรเจาะเลือดเพื่อผลที่แม่นยำ"],
        ["2 ครั้ง", "จำนวนผลตรวจที่ควรยืนยันก่อนวินิจฉัย"],
        ["ตลอดการรักษา", "TRT ต้องติดตามความปลอดภัยเป็นระยะ"]
      ],
      facts: [
        ["clipboard-pulse", "ทบทวนอาการ", "ดูพลังงาน อารมณ์ สมรรถภาพ และการเปลี่ยนแปลงร่างกาย"],
        ["test-tube-diagonal", "ตรวจยืนยันเมื่อมีข้อบ่งชี้", "ผลตรวจต้องตีความร่วมกับเวลาเก็บตัวอย่างและอาการ"],
        ["moon-star", "คัดกรองสาเหตุอื่น", "เช่น การนอน ความเครียด ยา และโรคเมตาบอลิก"],
        ["shield-check", "ติดตามความปลอดภัย", "หากรักษาต้องติดตามผลและตัวชี้วัดตามแพทย์"]
      ],
      assessment: [
        "อาการ ระยะเวลา และผลกระทบต่อชีวิตประจำวัน",
        "การนอน น้ำหนัก การออกกำลัง และความเครียด",
        "ยา อาหารเสริม การใช้ฮอร์โมนหรือสารกระตุ้นที่ผ่านมา",
        "ประวัติภาวะเจริญพันธุ์ ต่อมลูกหมาก หัวใจ และลิ่มเลือด"
      ],
      medicalNote:
        "TRT ไม่ใช่ผลิตภัณฑ์ชะลอวัยทั่วไป ต้องมีการวินิจฉัยที่เหมาะสมและติดตามความปลอดภัยโดยแพทย์",
      productsTitle: "รูปแบบการรักษาที่ต้องวินิจฉัยก่อน",
      productsLead: "TRT พิจารณาเฉพาะผู้ที่มีอาการและผลตรวจสอดคล้องกัน พร้อมแผนติดตามความปลอดภัย",
      products: [
        ["ฮอร์โมนตามใบสั่งแพทย์", "ใช้เฉพาะเมื่อวินิจฉัยชัดเจน", "พร้อมแผนติดตามผลเลือดเป็นระยะ", "assets/condition-detail/products-diecut-v1/hormone-vial.png", "injection", "ใช้ต่อเนื่อง"],
        ["การดูแลปัจจัยร่วม", "การนอน น้ำหนัก และยาที่ใช้", "หลายกรณีอาการดีขึ้นโดยไม่ต้องใช้ฮอร์โมน", "assets/condition-detail/products-diecut-v1/oral-tablet.png", "oral", "ไม่ใช้ยา"]
      ],
      resultsNote: "ผลลัพธ์แตกต่างกันในแต่ละบุคคล และต้องอยู่ภายใต้การติดตามของแพทย์"
    },
    "sleep-stress": {
      category: "sleep-stress",
      tone: "mind",
      image: "assets/treatment-editorial/sleep-hands-winddown-editorial-v2.png",
      kicker: "การนอนและความเครียด",
      hook: "นอนไม่ดีไม่ใช่เรื่องต้องทน",
      lead: "ปัญหาการนอน สมาธิ และความเครียดมักเชื่อมโยงกัน การประเมินช่วยหาว่าควรปรับพฤติกรรม รักษา หรือส่งต่อ",
      knowledgeTitle: "การนอนที่ไม่ดีมีได้หลายรูปแบบ",
      knowledge:
        "หลับยาก ตื่นกลางดึก ตื่นไม่สดชื่น หรือง่วงกลางวัน ล้วนชี้ไปคนละสาเหตุ บางแบบแก้ได้ด้วยกิจวัตร บางแบบต้องคัดกรองภาวะหยุดหายใจขณะหลับก่อน",
      knowledgeStats: [
        ["7–9 ชม.", "ช่วงเวลานอนที่ผู้ใหญ่ส่วนใหญ่ต้องการ"],
        ["CBT-I", "แนวทางแรกสำหรับการนอนไม่หลับเรื้อรัง"],
        ["ไม่ใช่ทางแรก", "ยานอนหลับไม่ใช่คำตอบเริ่มต้นสำหรับทุกคน"]
      ],
      facts: [
        ["moon-star", "รูปแบบการนอน", "ดูเวลาเข้านอน การตื่นกลางคืน และคุณภาพหลังตื่น"],
        ["brain", "อารมณ์และความเครียด", "ประเมินความกังวล อารมณ์ และผลต่อชีวิตประจำวัน"],
        ["coffee", "พฤติกรรมและสารกระตุ้น", "คาเฟอีน แอลกอฮอล์ หน้าจอ และเวลาทำงาน"],
        ["activity", "คัดกรองภาวะร่วม", "เช่น กรน หยุดหายใจ หรืออาการขาอยู่ไม่สุข"]
      ],
      assessment: [
        "เวลานอน เวลาตื่น และความถี่ของอาการ",
        "การกรน หยุดหายใจ ง่วงกลางวัน หรืออุบัติเหตุ",
        "คาเฟอีน แอลกอฮอล์ ยา และอาหารเสริม",
        "ระดับความเครียด อารมณ์ และสัญญาณความไม่ปลอดภัย"
      ],
      medicalNote:
        "ยานอนหลับไม่ใช่ทางเลือกแรกสำหรับทุกคน และอาจมีความเสี่ยง แพทย์จะประเมินสาเหตุและทางเลือกอื่นก่อน",
      productsTitle: "รูปแบบการดูแลที่อาจใช้",
      productsLead: "การรักษาเริ่มจากรูปแบบอาการและสาเหตุ ไม่ได้เริ่มจากยานอนหลับเสมอไป",
      products: [
        ["แผนปรับพฤติกรรมการนอน", "ติดตามเป็นสัปดาห์", "แนวทางแรกที่มีหลักฐานรองรับมากที่สุด", "assets/condition-detail/products-diecut-v1/oral-tablet.png", "oral", "ไม่ใช้ยา"],
        ["ยาเมื่อมีข้อบ่งใช้", "ระยะสั้นภายใต้การดูแล", "แพทย์เลือกเมื่อประเมินความเสี่ยงแล้ว", "assets/condition-detail/products-diecut-v1/hormone-vial.png", "oral", "ระยะสั้น"]
      ],
      resultsNote: "ผลลัพธ์แตกต่างกันในแต่ละบุคคล ขึ้นอยู่กับสาเหตุและความต่อเนื่องของแผน"
    }
  };

  // Keep bookmarked and shared legacy ED links working while re:flow is now
  // the canonical programme name and URL.
  CONDITIONS.ed = CONDITIONS["re-flow"];

  const SUPPORTING_CONTENT = {
    weight: {
      fit: [
        "ผู้ที่มองหาช่องทางเริ่มรักษาที่ไม่ต้องเดินทาง สะดวก และคุ้มค่า",
        "ผู้ที่ต้องการลดน้ำหนักภายใต้การดูแลของแพทย์",
        "ผู้ที่มีค่า BMI สูงกว่า 25",
        "ผู้ที่คุมอาหารแล้ว แต่น้ำหนักยังไม่ลดตามที่ต้องการ",
        "ผู้ที่มีภาวะน้ำหนักเกินที่อาจเกี่ยวข้องกับปัจจัยด้านสุขภาพอื่นๆ"
      ],
      consult: ["กำลังตั้งครรภ์ ให้นมบุตร หรือวางแผนตั้งครรภ์", "มีประวัติตับอ่อน ถุงน้ำดี หรือโรคต่อมไทรอยด์บางชนิด", "ใช้ยา หรือมีโรคประจำตัวที่อาจกระทบการรักษา"],
      faqs: [
        ["ต้องใช้ยาทุกคนไหม", "ไม่จำเป็น แพทย์จะเริ่มจากเป้าหมาย ประวัติสุขภาพ และสิ่งที่คุณเคยลอง ก่อนพิจารณาว่ายาช่วยได้หรือไม่"],
        ["จะรู้ค่าใช้จ่ายเมื่อไร", "ระบบจะแสดงค่าปรึกษา ค่ายา และค่าจัดส่งแยกรายการให้ตรวจสอบก่อนชำระเงิน"],
        ["ถ้าเริ่มยาแล้วต้องติดตามอย่างไร", "แพทย์จะนัดทบทวนผล อาการข้างเคียง และปรับแผนตามความเหมาะสมของแต่ละคน"]
      ]
    },
    "sexual-health": {
      fit: ["มีอาการต่อเนื่องหรือเกิดซ้ำจนกระทบความมั่นใจ", "ต้องการคุยกับแพทย์อย่างเป็นส่วนตัว", "ต้องการหาสาเหตุ ไม่ใช่ซื้อยาอย่างเดียว"],
      consult: ["มีอาการเจ็บหน้าอก เหนื่อยผิดปกติ หรือโรคหัวใจ", "ใช้ยากลุ่ม nitrate หรือยาที่ไม่แน่ใจว่าใช้ร่วมกันได้", "มีอาการฉับพลัน รุนแรง หรือการแข็งตัวนานเกิน 4 ชั่วโมง"],
      faqs: [
        ["จำเป็นต้องเปิดกล้องไหม", "แพทย์อาจขอข้อมูลที่จำเป็นต่อการประเมิน แต่คุณสามารถแจ้งข้อกังวลเรื่องความเป็นส่วนตัวก่อนเริ่มได้"],
        ["แพทย์จะสั่งยาให้เลยไหม", "ไม่เสมอไป แพทย์จะทบทวนสาเหตุ สุขภาพหัวใจ และยาที่ใช้อยู่ก่อนเลือกแนวทาง"],
        ["ติดตามกับแพทย์คนเดิมได้ไหม", "ระบบออกแบบให้เห็นประวัติและแผนเดิม เพื่อให้ทีมดูแลติดตามต่อจากข้อมูลครั้งก่อน"]
      ]
    },
    "hair-skin": {
      fit: ["ผมร่วงหรือผมบางต่อเนื่องและอยากรู้สาเหตุ", "ต้องการเปรียบเทียบภาพและติดตามผลเป็นระยะ", "พร้อมใช้แผนอย่างต่อเนื่องตามคำแนะนำ"],
      consult: ["ผมร่วงฉับพลัน เป็นหย่อม หรือมีแผลบนหนังศีรษะ", "กำลังตั้งครรภ์ ให้นมบุตร หรือวางแผนตั้งครรภ์", "ใช้ยา อาหารเสริม หรือมีโรคประจำตัวที่เกี่ยวข้อง"],
      faqs: [
        ["ต้องส่งรูปอะไรบ้าง", "ควรถ่ายแนวไรผม ด้านบน และบริเวณที่กังวลในแสงธรรมชาติ เพื่อให้แพทย์เปรียบเทียบได้ชัด"],
        ["เห็นผลเร็วแค่ไหน", "แผนดูแลผมส่วนใหญ่มักต้องใช้เวลาหลายเดือน แพทย์จะกำหนดจุดติดตามที่เหมาะกับสาเหตุและแนวทางที่ใช้"],
        ["หยุดยาได้เมื่อไร", "ขึ้นอยู่กับสาเหตุและยาที่ใช้ ไม่ควรหยุดหรือปรับเองก่อนคุยกับแพทย์"]
      ]
    },
    general: {
      fit: ["ต้องการประเมินอาการกับแพทย์อย่างเป็นส่วนตัว", "ต้องการแผนที่อ้างอิงจากประวัติสุขภาพจริง", "พร้อมติดตามผลและปรับแผนเมื่อจำเป็น"],
      consult: ["มีอาการรุนแรงหรือเกิดขึ้นฉับพลัน", "กำลังตั้งครรภ์ ให้นมบุตร หรือใช้ยาหลายชนิด", "มีโรคประจำตัวหรืออาการที่ยังไม่เคยตรวจ"],
      faqs: [
        ["ปรึกษาออนไลน์เหมาะกับทุกอาการไหม", "ไม่ทุกอาการ หากข้อมูลบ่งชี้ว่าต้องตรวจร่างกายหรือตรวจเพิ่มเติม แพทย์จะแนะนำให้พบสถานพยาบาล"],
        ["ระบบสั่งยาให้อัตโนมัติไหม", "ไม่ การสั่งยาเกิดขึ้นเมื่อแพทย์ประเมินแล้วว่าเหมาะสมเท่านั้น"],
        ["ข้อมูลครั้งก่อนหายไหม", "ประวัติและแผนการดูแลถูกออกแบบให้อยู่ในโปรไฟล์ เพื่อใช้ประกอบการติดตามครั้งถัดไป"]
      ]
    }
  };

  const key = new URLSearchParams(location.search).get("condition") || "weight";
  const data = CONDITIONS[key] || CONDITIONS.weight;
  const supporting = SUPPORTING_CONTENT[data.category] || SUPPORTING_CONTENT.general;
  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (node && value) node.textContent = value;
  };

  // Copy and section structure transcribed from the supplied programme design.
  // Existing hero, product and article image sources remain the source of truth.
  const programme = {
    weight: {
      title:'Re:Body Program',
      lead:'โปรแกรมลดน้ำหนักออนไลน์ด้วย GLP-1 ประเมินและดูแลโดยคุณหมอประจำตัวอย่างใกล้ชิด',
      overview:'แพทย์จะประเมินความเหมาะสมก่อนเริ่มการรักษาทุกครั้ง พร้อมนัดติดตามอาการและปรับแผนให้เหมาะกับคุณ ควบคู่กับ coaching ปรับไลฟ์สไตล์และการกิน โดยเน้นรักษามวลกล้ามเนื้อ และลดความเสี่ยงน้ำหนักเด้งกลับ (yo-yo effect)',
      knowledgeTitle:'น้ำหนักขึ้นได้จากหลายสาเหตุ',
      knowledge:'พันธุกรรม ฮอร์โมน การนอน ความเครียด และยาที่ใช้อยู่ ล้วนมีผลต่อน้ำหนัก แพทย์จะแยกสาเหตุก่อน แล้วจึงออกแบบแผนที่เหมาะกับคุณ',
      stats:[['5 ถึง 10%','น้ำหนักที่ลดลงอย่างมีคุณภาพ ช่วยลดความเสี่ยงสุขภาพได้ชัดเจน'],['3 ถึง 6 เดือน','ระยะเวลาที่เริ่มเห็นผลของการรักษา'],['ต่อเนื่อง','หยุดยาโดยไม่ปรับพฤติกรรม น้ำหนักมีโอกาสกลับมา']],
      quote:'โปรแกรมลดน้ำหนักผ่าน GLP-1 ต้องมีแพทย์คอยติดตามผลอย่างใกล้ชิด ช่องทางออนไลน์จะช่วยให้หลายคนเริ่มต้นได้ง่ายขึ้น ประหยัดเวลา และไม่ต้องเสียค่าเดินทางครับ'
    },
    'hair-skin':{
      title:'Re:hair Program',
      lead:'ปรึกษาเรื่องผมร่วงและหนังศีรษะแบบส่วนตัว กับแพทย์ที่มีใบอนุญาต พร้อมส่งยาถึงบ้าน',
      overview:'ดูแลผมร่วงอย่างมีหลักฐาน แพทย์จะประเมินรูปแบบผมร่วงและสาเหตุก่อนเริ่มการรักษาทุกครั้ง พร้อมนัดติดตามผลและปรับแผนให้เหมาะกับคุณเป็นรายบุคคล',
      knowledgeTitle:'ผมร่วงแต่ละแบบดูแลไม่เหมือนกัน',
      knowledge:'ผมบางจากพันธุกรรม ผมร่วงเป็นหย่อม การอักเสบของหนังศีรษะ และผมร่วงหลังความเครียดหรือเจ็บป่วย ล้วนมีกลไกต่างกัน การรักษาที่ได้ผลกับแบบหนึ่งอาจไม่ช่วยอีกแบบเลย',
      stats:[['ราว 50%','ผู้ชายมีผมบางจากพันธุกรรมเมื่ออายุ 50 ปี'],['3 ถึง 6 เดือน','ระยะเวลาที่เริ่มเห็นผลของการรักษา'],['ต่อเนื่อง','หยุดใช้ยา ผมมักกลับไปร่วงเหมือนเดิม']],
      quote:'ผมร่วงส่วนใหญ่ดูแลได้ ถ้าเริ่มถูกวิธีและติดตามต่อเนื่อง สิ่งสำคัญคือแยกสาเหตุให้ชัดก่อน แล้วจึงเลือกแนวทางที่เหมาะกับแต่ละคนครับ'
    },
    'sexual-health':{
      title:'Re:Flow Program',
      lead:'ปรึกษาเรื่องสมรรถภาพทางเพศแบบส่วนตัว กับแพทย์ที่มีใบอนุญาต พร้อมส่งยาถึงบ้าน',
      overview:'ดูแลปัญหาการแข็งตัวอย่างเป็นระบบ แพทย์จะประเมินสาเหตุและความเสี่ยงก่อนเริ่มการรักษาทุกครั้ง พร้อมนัดติดตามผลและปรับแผนให้เหมาะกับคุณเป็นรายบุคคล',
      knowledgeTitle:'ปัญหาการแข็งตัวมีได้หลายสาเหตุ',
      knowledge:'ความเครียด ฮอร์โมน การไหลเวียนเลือด ยาที่ใช้อยู่ และโรคประจำตัว ล้วนส่งผลต่อการแข็งตัวได้ แพทย์จะแยกสาเหตุก่อน แล้วจึงเลือกแนวทางที่เหมาะกับคุณ',
      stats:[['ราว 50%','ผู้ชายอายุ 40 ถึง 70 ปี เคยมีปัญหาการแข็งตัวในระดับหนึ่ง'],['30 ถึง 60 นาที','ระยะเวลาก่อนยาเริ่มออกฤทธิ์'],['ต่อเนื่อง','ยาช่วยเฉพาะตอนที่ใช้ ไม่ได้แก้ที่ต้นเหตุ']],
      quote:'ปัญหาการแข็งตัวมักเป็นสัญญาณของสุขภาพโดยรวม การตรวจให้ครบและเลือกยาให้เหมาะกับโรคประจำตัว สำคัญกว่าการรีบใช้ยาครับ'
    }
  }[data.category];
  if(programme){
    data.hook=programme.title;data.lead=programme.lead;
    data.knowledgeTitle=programme.knowledgeTitle;data.knowledge=programme.knowledge;data.knowledgeStats=programme.stats;
    setText('[data-overview-copy]',programme.overview);
    setText('[data-doctor-quote]',programme.quote);
    setText('[data-pricing-title]',data.category==='weight' ? 'ค่าบริการโปรแกรม Re:Body' : 'จ่ายตามจริง ไม่มีแพ็กเกจรายเดือน');
    setText('[data-pricing-note]',data.category==='weight' ? 'ราคาที่แจ้งรวมค่ายาแล้วในโปรแกรม ขึ้นอยู่กับแผนการรักษา แพทย์จะประเมินความเหมาะสมก่อนสั่งยาทุกครั้ง' : 'ปรึกษาแพทย์ครั้งแรกไม่มีค่าใช้จ่าย ค่ายาขึ้นอยู่กับแผนการรักษาของคุณ แพทย์จะแจ้งค่ายาและค่าจัดส่งให้ทราบก่อนยืนยันทุกครั้ง');
    document.querySelector('[data-programme-price]').hidden=data.category!=='weight';
    if(data.category==='weight') setText('[data-coaching-copy]','1:1 health coaching');
    /* The five questions and their answers are the design's, verbatim. They
       answer what the old three did and then the three the patient asks next
       — insurance, which medicine, and how much weight. */
    supporting.faqs=data.category==='weight' ? [
      ['ราคาเท่าไหร่? มีค่าใช้จ่ายอะไรบ้าง?',
       '<p>ไม่มีค่าสมาชิกรายเดือน ระบบจะแสดงรายการราคาทั้งหมดให้คุณยืนยันก่อนชำระเงินทุกครั้ง</p>'+
       '<ul><li><b>ค่าปรึกษาแพทย์:</b> ครั้งแรกฟรี สำหรับบัญชีใหม่ · ครั้งถัดไป 350 บาท/ครั้ง</li>'+
       '<li><b>ค่ายา:</b> ขึ้นอยู่กับชนิดและขนาดยาที่แพทย์สั่ง เช่น ยาขนาดเริ่มต้น 4 โดส (ใช้ได้ราว 1 เดือน) เพียง 9,999 บาท</li>'+
       '<li><b>ค่าจัดส่ง:</b> ส่งด่วน คิดตามระยะทางจริง · ส่งไปรษณีย์ 50 บาท</li></ul>'],
      ['ขั้นตอนทั้งหมดเป็นออนไลน์ใช่ไหม?',
       '<p>ใช่ ทุกขั้นตอนทำผ่านออนไลน์ ไม่ต้องเดินทางไปคลินิก</p>'+
       '<ul><li>ทำแบบประเมินสุขภาพและเป้าหมาย</li>'+
       '<li>ปรึกษาแพทย์ผ่านวิดีโอคอล เปิดกล้องช่วงแรกเพื่อยืนยันตัวตน จากนั้นเปลี่ยนเป็นแชทได้</li>'+
       '<li>รับยาที่บ้าน หากแพทย์ประเมินว่าเหมาะสม</li>'+
       '<li>ติดตามผลและเติมยาผ่านระบบออนไลน์</li></ul>'+
       '<p>บางกรณีแพทย์อาจขอผลตรวจเลือดเพิ่มเติม เพื่อความปลอดภัยก่อนเริ่มยา</p>'],
      ['ใช้สิทธิประกันอะไรได้บ้าง?',
       '<p>ขณะนี้ re:body ยังไม่รองรับการเบิกจ่ายตรงกับประกันสุขภาพ ประกันสังคม หรือสิทธิบัตรทอง</p>'+
       '<p>คุณขอใบเสร็จรับเงินเพื่อนำไปยื่นเบิกกับบริษัทประกันเองได้ ทั้งนี้ขึ้นอยู่กับเงื่อนไขกรมธรรม์ของคุณ</p>'],
      ['มียาอะไรที่แพทย์อาจจะจ่ายให้ได้บ้าง?',
       '<p>แพทย์จะเลือกยาจากประวัติสุขภาพ เป้าหมาย และความปลอดภัยของคุณเป็นหลัก โดยยาในโปรแกรมเป็นยากลุ่ม GLP-1 ที่ขึ้นทะเบียนกับ อย. แล้ว</p>'+
       '<p>ยาทุกกล่องจัดส่งโดย Fascino Pharmacy Chain ในบรรจุภัณฑ์เดิมจากผู้ผลิต และตรวจสอบเลข serial ได้ที่เว็บไซต์ อย.</p>'],
      ['จะลดน้ำหนักได้เท่าไหร่?',
       '<p>ขึ้นอยู่กับแต่ละคน ทั้งเป้าหมายน้ำหนัก ยาที่แพทย์สั่ง น้ำหนักตั้งต้น ความสม่ำเสมอ และไลฟ์สไตล์</p>'+
       '<p class="cd-faq__lead">ค่าเฉลี่ยจากงานวิจัยทางคลินิก*</p>'+
       '<div class="cd-faq__figures"><div><b>~10%</b><span>ใน 5 เดือนแรก</span></div><div><b>15–21%</b><span>ในราว 1 ปีครึ่ง</span></div></div>'+
       '<p class="cd-fine">*ผู้ใช้ยากลุ่ม GLP-1 ควบคู่กับการปรับพฤติกรรม ผลลัพธ์แตกต่างกันในแต่ละบุคคล ไม่ใช่การรับประกันผล · อ้างอิง: '+
       '<a href="https://jamanetwork.com/journals/jama/fullarticle/2777886" rel="noopener" target="_blank">STEP 4</a> · '+
       '<a href="https://www.nejm.org/doi/full/10.1056/NEJMoa2032183" rel="noopener" target="_blank">STEP 1</a> · '+
       '<a href="https://www.nejm.org/doi/full/10.1056/NEJMoa2206038" rel="noopener" target="_blank">SURMOUNT-1</a></p>']
    ] : [
      ['ต้องใช้ยาทุกคนไหม','<p>ไม่จำเป็น แพทย์จะเริ่มจากเป้าหมาย ประวัติสุขภาพ และสิ่งที่คุณเคยลอง ก่อนพิจารณาว่ายาช่วยได้หรือไม่</p>'],
      ['จะรู้ค่าใช้จ่ายเมื่อไร','<p>ค่าปรึกษา ค่ายา และค่าจัดส่งจะแสดงแยกรายการให้ตรวจสอบก่อนยืนยัน ไม่มีการสั่งยาโดยอัตโนมัติ</p>'],
      ['ถ้าเริ่มยาแล้วต้องติดตามอย่างไร','<p>แพทย์จะนัดติดตามผลและอาการข้างเคียงเป็นระยะ แล้วปรับแผนให้เหมาะกับคุณ ประวัติและแผนการรักษาอยู่ในบัญชีของคุณ</p>']
    ];
    /* Three cards in a rail, each a short clip beside the before/after pair,
       as the design draws them. The media is not shot yet, so every slot is a
       labelled placeholder rather than a stand-in photograph. */
    const reviews=document.querySelector('[data-programme-reviews]');
    setText('[data-overview-title]',data.category==='weight' ? 'ลดน้ำหนักอย่างมีคุณภาพ'
      : data.category==='hair-skin' ? 'ดูแลผมร่วงอย่างมีหลักฐาน' : 'ดูแลการแข็งตัวอย่างเป็นระบบ');
    if(reviews){
      const privateStory=data.category==='sexual-health';
      reviews.innerHTML=Array.from({length:3},()=>privateStory ? `
        <article class="cd-review cd-review--quote">
          <p class="cd-review__quote">“[คำรีวิวสั้น — เน้นประสบการณ์การดูแล เช่น หมอติดตามใกล้ชิด สะดวก]”</p>
          <span class="cd-fine"><b>[ชื่อย่อ]</b> · ผู้ใช้ ${programme.title}</span>
          <p class="cd-fine">เรื่องเล่าจากผู้ใช้ที่ยินยอมให้เผยแพร่ ไม่เปิดเผยตัวตน และไม่ใช้ภาพประกอบเพื่อความเป็นส่วนตัว</p>
        </article>` : `
        <article class="cd-review">
          <div class="cd-review__media">
            <span class="cd-ph cd-review__clip">[วิดีโอสั้น 9:16]<b class="cd-review__play" aria-hidden="true"><i data-lucide="play"></i></b><em class="cd-review__time">0:30</em></span>
            <span class="cd-review__pair">
              <span class="cd-ph">[ภาพก่อน]<em class="cd-review__tag">ก่อน</em></span>
              <span class="cd-ph">[ภาพหลัง]<em class="cd-review__tag cd-review__tag--after">หลัง [ระยะเวลา]</em></span>
            </span>
          </div>
          <div class="cd-review__copy">
            <p class="cd-review__quote">“[คำรีวิวสั้น — เน้นประสบการณ์การดูแล เช่น หมอติดตามใกล้ชิด สะดวก]”</p>
            <span class="cd-fine"><b>[ชื่อย่อ]</b> · ผู้ใช้ ${programme.title}</span>
            <p class="cd-fine">ใช้เป็นตัวอย่าง ผลจากการเข้ารับการรักษาแตกต่างกันในแต่ละบุคคล</p>
          </div>
        </article>`).join('');
    }
  }

  if(!programme){
    setText('[data-overview-copy]',data.lead);
    document.querySelectorAll('.doctor-perspective,.programme-reviews,.programme-pricing').forEach(node=>node.hidden=true);
    document.querySelectorAll('[data-section-tab="doctor-perspective"],[data-section-tab="reviews"],[data-section-tab="pricing"]').forEach(node=>node.hidden=true);
  }

  document.title = `${data.kicker} | Krane Clinic`;
  const hero = document.querySelector(".condition-hero");
  hero?.setAttribute("data-tone", data.tone);
  document.querySelector("main")?.setAttribute("data-tone", data.tone);
  const image = document.querySelector("[data-hero-image]");
  if (image) image.src = data.image;
  const imageAlt = document.querySelector("[data-hero-image-alt]");
  const hasAlternateHero = Boolean(imageAlt && data.imageAlt);
  if (imageAlt) {
    imageAlt.hidden = !hasAlternateHero;
    if (hasAlternateHero) imageAlt.src = data.imageAlt;
  }
  hero?.classList.toggle("has-alternate-image", hasAlternateHero);
  setText("[data-kicker]", data.kicker);
  setText("[data-title]", data.hook);
  setText("[data-lead]", data.lead);
  setText("[data-knowledge-title]", data.knowledgeTitle);
  setText("[data-knowledge]", data.knowledge);
  setText("[data-products-title]", data.productsTitle);
  setText("[data-products-lead]", data.productsLead);
  setText("[data-medical-note]", data.medicalNote);
  setText("[data-safety]", data.safety);
  setText("[data-closing-kicker]", `พร้อมเริ่มดูแล${data.kicker.replace("ดูแล", "").trim() || "สุขภาพ"}`);

  const safetyLink = document.querySelector(".safety__button");
  if (safetyLink && key === "weight") {
    safetyLink.href = "glp1-safety.html";
    safetyLink.textContent = "อ่านข้อมูลความปลอดภัย";
  }

  document.querySelectorAll("[data-intake-link]").forEach((link) => {
    // A condition detail is always a Krane-direct entry. Carry that context in
    // the deep link so a previous Partner session cannot hide the intake
    // progress UI when this page opens the specialty questionnaire.
    link.href = `krane-b2c.html?v=20260827-fresh-intake-v1#intake1?category=${encodeURIComponent(data.category)}&entry=direct&fresh=1`;
    link.dataset.category = data.category;
  });

  const stats = document.querySelector("[data-knowledge-stats]");
  if (stats) stats.innerHTML = (data.knowledgeStats || []).map(([value, label]) => `
    <div class="knowledge-stat"><b>${value}</b><span>${label}</span></div>
  `).join("");

  const facts = document.querySelector("[data-facts]");
  if (facts) facts.innerHTML = data.facts.map(([icon, title, body]) => `
    <article class="fact-card"><i data-lucide="${icon}" aria-hidden="true"></i><strong>${title}</strong><p>${body}</p></article>
  `).join("");

  const assessment = document.querySelector("[data-assessment-list]");
  if (assessment) assessment.innerHTML = data.assessment.map((item) => `<li>${item}</li>`).join("");

  const fitList = document.querySelector("[data-fit-list]");
  if (fitList) fitList.innerHTML = supporting.fit.map((item) => `<li>${item}</li>`).join("");

  const consultList = document.querySelector("[data-consult-list]");
  if (consultList) consultList.innerHTML = supporting.consult.map((item) => `<li>${item}</li>`).join("");

  const faqList = document.querySelector("[data-faq-list]");
  if (faqList) faqList.innerHTML = supporting.faqs.map(([question, answer], index) => `
    <details class="faq-item"${index === 0 ? " open" : ""}>
      <summary>${question}<i data-lucide="plus" aria-hidden="true"></i></summary>
      <div class="cd-faq__answer">${answer}</div>
    </details>
  `).join("");

  const products = document.querySelector("[data-products]");
  /* The sixth field is how the medicine is used over time — continuous, as
     needed, short course — shown as a tag on the photo (client, 18 Aug). */
  if (products) products.innerHTML = (data.products || []).map(([title, form, body, photo, kind, tag]) => `
    <article class="product-card" data-product-kind="${kind}">
      <div class="product-card__gallery" data-product-gallery>
        <span class="product-card__stage" data-gallery-stage data-gallery-view="front">
          <img src="${photo}" width="768" height="768" loading="lazy" decoding="async" alt="${title}">
          ${tag ? `<span class="product-card__tag">${tag}</span>` : ""}
        </span>
        <div class="product-card__thumbs" role="group" aria-label="เลือกรูปภาพ ${title}">
          ${[
            ["front", "ภาพผลิตภัณฑ์"],
            ["detail", "ภาพระยะใกล้"],
            ["angle", "ภาพอีกมุม"]
          ].map(([view, label], index) => `
            <button class="product-card__thumb${index === 0 ? " is-active" : ""}" type="button" data-gallery-view="${view}" aria-label="${label}" aria-pressed="${index === 0 ? "true" : "false"}">
              <img src="${photo}" width="96" height="96" loading="lazy" decoding="async" alt="">
            </button>
          `).join("")}
        </div>
      </div>
      <div class="product-card__copy">
        <span class="product-card__form">${form}</span>
        <strong>${title}</strong>
        <p>${body}</p>
      </div>
    </article>
  `).join("");

  products?.addEventListener("click", (event) => {
    const thumb = event.target.closest(".product-card__thumb[data-gallery-view]");
    const gallery = thumb?.closest("[data-product-gallery]");
    const stage = gallery?.querySelector("[data-gallery-stage]");
    if (!thumb || !gallery || !stage) return;
    stage.dataset.galleryView = thumb.dataset.galleryView;
    gallery.querySelectorAll(".product-card__thumb").forEach((button) => {
      const isActive = button === thumb;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  });

  /* Reuse the product-card source of truth for the comparison matrix. This
     prevents medicine artwork or copy from drifting between sections. */
  const comparison = document.querySelector("[data-comparison]");
  const comparisonProducts = (data.products || []).slice(0, 3);
  const reviewByKind = {
    pen: "ข้อบ่งใช้ ข้อห้าม และการติดตามหลังเริ่มยา",
    injection: "ผลตรวจ ข้อห้าม และแผนติดตามเป็นระยะ",
    oral: "โรคประจำตัว ยาที่ใช้อยู่ และความเสี่ยงเฉพาะบุคคล",
    topical: "ตำแหน่งที่ใช้ ความไวของผิว และอาการระคายเคือง"
  };
  setText("[data-comparison-title]", `เปรียบเทียบ ${comparisonProducts.length} ทางเลือก`);
  setText("[data-comparison-lead]", "ดูรูปแบบการใช้และข้อพิจารณาของแต่ละทางเลือก ก่อนคุยกับแพทย์เพื่อเลือกแผนที่เหมาะกับคุณ");
  if (comparison) {
    const rows = [
      ["วิธีใช้", comparisonProducts.map(([, form]) => form)],
      ["รูปแบบการดูแล", comparisonProducts.map(([, , , , , tag]) => tag || "ตามแพทย์แนะนำ")],
      ["แพทย์พิจารณาจาก", comparisonProducts.map(([, , , , kind]) => reviewByKind[kind] || "อาการ ประวัติสุขภาพ และเป้าหมายของคุณ")],
      ["สิ่งที่ควรรู้", comparisonProducts.map(([, , body]) => body)]
    ];
    comparison.style.setProperty("--compare-count", comparisonProducts.length);
    comparison.innerHTML = `
      <div class="comparison-row comparison-row--head" role="row">
        <div class="comparison-corner" role="columnheader"><span>ทางเลือก</span><strong>เทียบทีละข้อ</strong></div>
        ${comparisonProducts.map(([title, form, , photo]) => `
          <div class="comparison-product" role="columnheader">
            <span class="comparison-product__image"><img src="${photo}" width="144" height="144" loading="lazy" decoding="async" alt=""></span>
            <span><strong>${title}</strong><small>${form}</small></span>
          </div>
        `).join("")}
      </div>
      ${rows.map(([label, values]) => `
        <div class="comparison-row" role="row">
          <div class="comparison-label" role="rowheader">${label}</div>
          ${values.map((value) => `<div class="comparison-value" role="cell">${value}</div>`).join("")}
        </div>
      `).join("")}
    `;
  }

  /* Reading list: the shared library filtered to this condition's tag, so the
     page never links out to an article about a different concern. */
  const articles = document.querySelector("[data-articles]");
  const articlesSection = document.querySelector("[data-articles-section]");
  if (articles) {
    const matches = ARTICLES.filter((article) => article.tags.includes(data.category));
    if (!matches.length) {
      articlesSection?.remove();
    } else {
      articles.innerHTML = matches.map((article) => `
        <li><a class="cd-article" href="krane-b2c.html#articles" target="_parent" data-route="articles">
          <span class="cd-article__thumb"><img src="${article.image}" width="256" height="256" loading="lazy" decoding="async" alt=""></span>
          <span class="cd-article__title">${article.title}</span>
        </a></li>
      `).join("");
    }
  }

  /* Client, 5 Oct: the six-chapter rail that used to live here only scrolled
     the page between sections it was already showing. The design replaces it
     with three tabs over one panel, so the middle of the page is the one part
     the patient asked for rather than all of it at once. */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (hasAlternateHero && hero && !prefersReducedMotion.matches) {
    window.setInterval(() => {
      if (!document.hidden) hero.classList.toggle("is-showing-alternate");
    }, 5200);
  }

  const cdTabs = Array.from(document.querySelectorAll("[data-cd-tab]"));
  const cdPanels = Array.from(document.querySelectorAll("[data-cd-panel]"));
  const showCdPanel = (name) => {
    cdTabs.forEach((tab) => {
      const on = tab.dataset.cdTab === name;
      tab.classList.toggle("is-selected", on);
      tab.setAttribute("aria-selected", String(on));
    });
    cdPanels.forEach((panel) => { panel.hidden = panel.dataset.cdPanel !== name; });
  };
  cdTabs.forEach((tab) => {
    tab.addEventListener("click", () => showCdPanel(tab.dataset.cdTab));
    /* Arrow keys move between tabs, which is what a tablist owes a keyboard. */
    tab.addEventListener("keydown", (event) => {
      const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      const next = cdTabs[(cdTabs.indexOf(tab) + step + cdTabs.length) % cdTabs.length];
      showCdPanel(next.dataset.cdTab);
      next.focus();
    });
  });
  /* A link to #pricing or #faq from the nav still has to land somewhere, and
     the price is inside a panel now. */
  const hashPanel = { pricing: "price", price: "price", how: "steps", overview: "overview" };
  const openFromHash = () => {
    const name = hashPanel[decodeURIComponent(location.hash.slice(1))];
    if (name) showCdPanel(name);
  };
  openFromHash();
  window.addEventListener("hashchange", openFromHash);

  /* The landing page reveals one editorial chapter at a time. Detail pages
     use the same restrained movement so the system feels related without
     turning clinical content into a showreel. */
  const revealTargets = document.querySelectorAll(
    ".care-proof, .content-section, .price-clarity, .closing-cta"
  );
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.add("detail-motion-ready");
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });
    revealTargets.forEach((target) => revealObserver.observe(target));
  } else {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
  }

  /* site-header.js runs before dynamic FAQ/product content exists. Refresh the
     shared icon pass after the condition-specific markup has been inserted. */
  window.lucide?.createIcons({ attrs: { "stroke-width": 1.8 } });

  /* Hash links in the public nav target sections whose height depends on the
     condition-specific cards rendered above. Align after that markup exists,
     otherwise the browser can stop at the pre-render position. */
  if (location.hash) {
    const hashTarget = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    window.addEventListener("load", () => {
      requestAnimationFrame(() => hashTarget?.scrollIntoView());
    }, { once: true });
  }
})();
