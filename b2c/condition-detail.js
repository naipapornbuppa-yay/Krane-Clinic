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
      title: "ลดน้ำหนักอย่างปลอดภัยใต้การดูแลแพทย์",
      excerpt: "เริ่มจากประเมินสุขภาพ ตั้งเป้าที่ทำได้จริง และติดตามผลเป็นระยะ",
      image: "assets/landing-573/treatments/weight-management.png"
    },
    {
      tags: ["weight"],
      category: "น้ำหนัก",
      meta: "อ่าน 4 นาที",
      title: "GLP-1 ทำงานอย่างไรกับความอยากอาหาร",
      excerpt: "กลไกโดยย่อ ผลข้างเคียงที่พบบ่อย และเหตุผลที่ต้องค่อย ๆ ปรับขนาดยา",
      image: "assets/landing-573/treatments/hormonal-balance-trt.png"
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
      image: "assets/product-hero/weight-injection-hand-bright-v7.png",
      kicker: "ดูแลน้ำหนักกับแพทย์",
      hook: "น้ำหนักไม่ใช่เรื่องวินัย แต่เป็นเรื่องสุขภาพ",
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
        ["ปากกาฉีด GLP-1", "ฉีดใต้ผิวหนังสัปดาห์ละครั้ง", "เช่น semaglutide หรือ tirzepatide", "assets/condition-detail/products-diecut-v1/weight-pen.png", "pen"],
        ["ยารับประทาน", "ตามข้อบ่งใช้รายบุคคล", "แพทย์พิจารณาเมื่อเหมาะกับสุขภาพและเป้าหมาย", "assets/condition-detail/products-diecut-v1/oral-tablet.png", "oral"]
      ],
      resultsNote: "ผลลัพธ์แตกต่างกันในแต่ละบุคคล ขึ้นอยู่กับแผนการดูแลและการติดตามกับแพทย์"
    },
    ed: {
      category: "sexual-health",
      tone: "ed",
      image: "assets/product-hero/ed-care-couple-short-sleepwear-bed-pills-v13.png",
      kicker: "ดูแลภาวะ ED อย่างเป็นส่วนตัว",
      hook: "คุยเรื่องนี้กับแพทย์ได้ โดยไม่ต้องเดินเข้าคลินิก",
      lead: "ประเมินออนไลน์อย่างเป็นส่วนตัว หาสาเหตุที่แท้จริง แล้วเลือกทางที่ปลอดภัยกับหัวใจของคุณ",
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
        ["ยากลุ่ม PDE5", "รับประทานก่อนมีกิจกรรม", "เช่น sildenafil หรือ tadalafil เมื่อไม่มีข้อห้ามใช้", "assets/condition-detail/products-diecut-v1/sexual-capsule.png", "oral"],
        ["ขนาดต่ำรายวัน", "สำหรับบางกรณีตามการประเมิน", "แพทย์พิจารณาเมื่อเหมาะกับรูปแบบอาการ", "assets/condition-detail/products-diecut-v1/oral-tablet.png", "oral"]
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
        ["ยาเมื่อมีข้อบ่งใช้", "เลือกตามอาการและข้อห้ามใช้", "แพทย์ทบทวนยาที่ใช้อยู่ทุกครั้งก่อนสั่งจ่าย", "assets/condition-detail/products-diecut-v1/sexual-capsule.png", "oral"],
        ["การดูแลตามสาเหตุ", "คำแนะนำ การตรวจ และการติดตาม", "บางกรณีไม่ต้องใช้ยาเลย", "assets/condition-detail/products-diecut-v1/oral-tablet.png", "oral"]
      ],
      resultsNote: "ผลลัพธ์แตกต่างกันในแต่ละบุคคล ขึ้นอยู่กับสาเหตุและแผนการดูแลของแพทย์"
    },
    "hair-loss": {
      category: "hair-skin",
      tone: "hair",
      image: "assets/product-hero/hair-care-vanity-v10-left-hand.png",
      kicker: "ฟื้นฟูเส้นผม",
      hook: "รู้สาเหตุก่อน แล้วผมจะกลับมาถูกทาง",
      lead: "รูปแบบผมร่วง หนังศีรษะ ประวัติครอบครัว และความเครียด ช่วยให้แพทย์เลือกวิธีดูแลได้ตรงจุด",
      knowledgeTitle: "ผมร่วงแต่ละแบบดูแลไม่เหมือนกัน",
      knowledge:
        "ผมบางจากพันธุกรรม ผมร่วงเป็นหย่อม การอักเสบของหนังศีรษะ และผมร่วงหลังความเครียดหรือเจ็บป่วย ล้วนมีกลไกต่างกัน การรักษาที่ได้ผลกับแบบหนึ่งอาจไม่ช่วยอีกแบบเลย",
      knowledgeStats: [
        ["ราว 50%", "ผู้ชายมีผมบางจากพันธุกรรมเมื่ออายุ 50 ปี"],
        ["3–6 เดือน", "ระยะเวลาก่อนเริ่มเห็นผลของการรักษา"],
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
        ["ยาทาหนังศีรษะ", "ใช้วันละ 1–2 ครั้ง", "เช่น minoxidil ตามรูปแบบอาการ", "assets/condition-detail/products-diecut-v1/hair-pump.png", "topical"],
        ["ยารับประทาน", "วันละครั้ง ตามใบสั่งแพทย์", "เช่น finasteride เมื่อแพทย์เห็นว่าเหมาะสม", "assets/condition-detail/products-diecut-v1/hair-bottle.png", "oral"],
        ["เซรั่มบำรุงหนังศีรษะ", "ใช้ร่วมกับแผนหลัก", "ช่วยเรื่องความชุ่มชื้นและการระคายเคือง", "assets/condition-detail/products-diecut-v1/hair-dropper.png", "topical"]
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
        ["ยาทาเฉพาะที่", "ทาบาง ๆ ก่อนนอน", "เลือกสารออกฤทธิ์ตามปัญหาผิว", "assets/condition-detail/products-diecut-v1/skin-serum.png", "topical"],
        ["ผลิตภัณฑ์สนับสนุนผิว", "ใช้ร่วมกับแผนแพทย์", "จัดกิจวัตรให้ผิวทนต่อสารออกฤทธิ์ได้", "assets/condition-detail/products-diecut-v1/hair-pump.png", "topical"]
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
        ["ฮอร์โมนตามใบสั่งแพทย์", "ใช้เฉพาะเมื่อวินิจฉัยชัดเจน", "พร้อมแผนติดตามผลเลือดเป็นระยะ", "assets/condition-detail/products-diecut-v1/hormone-vial.png", "injection"],
        ["การดูแลปัจจัยร่วม", "การนอน น้ำหนัก และยาที่ใช้", "หลายกรณีอาการดีขึ้นโดยไม่ต้องใช้ฮอร์โมน", "assets/condition-detail/products-diecut-v1/oral-tablet.png", "oral"]
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
        ["แผนปรับพฤติกรรมการนอน", "ติดตามเป็นสัปดาห์", "แนวทางแรกที่มีหลักฐานรองรับมากที่สุด", "assets/condition-detail/products-diecut-v1/oral-tablet.png", "oral"],
        ["ยาเมื่อมีข้อบ่งใช้", "ระยะสั้นภายใต้การดูแล", "แพทย์เลือกเมื่อประเมินความเสี่ยงแล้ว", "assets/condition-detail/products-diecut-v1/hormone-vial.png", "oral"]
      ],
      resultsNote: "ผลลัพธ์แตกต่างกันในแต่ละบุคคล ขึ้นอยู่กับสาเหตุและความต่อเนื่องของแผน"
    }
  };

  const key = new URLSearchParams(location.search).get("condition") || "weight";
  const data = CONDITIONS[key] || CONDITIONS.weight;
  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (node && value) node.textContent = value;
  };

  document.title = `${data.kicker} | Krane Clinic`;
  document.querySelector(".condition-hero")?.setAttribute("data-tone", data.tone);
  document.querySelector("main")?.setAttribute("data-tone", data.tone);
  const image = document.querySelector("[data-hero-image]");
  if (image) image.src = data.image;
  setText("[data-kicker]", data.kicker);
  setText("[data-title]", data.hook);
  setText("[data-lead]", data.lead);
  setText("[data-knowledge-title]", data.knowledgeTitle);
  setText("[data-knowledge]", data.knowledge);
  setText("[data-products-title]", data.productsTitle);
  setText("[data-products-lead]", data.productsLead);
  setText("[data-medical-note]", data.medicalNote);
  setText("[data-safety]", data.safety);
  setText("[data-results-note]", data.resultsNote);
  setText("[data-closing-kicker]", `พร้อมเริ่มดูแล${data.kicker.replace("ดูแล", "").trim() || "สุขภาพ"}`);

  document.querySelectorAll("[data-intake-link]").forEach((link) => {
    // A condition detail is always a Krane-direct entry. Carry that context in
    // the deep link so a previous Partner session cannot hide the intake
    // progress UI when this page opens the specialty questionnaire.
    link.href = `krane-b2c.html?v=20260815-intake-progress-v1#intake1?category=${encodeURIComponent(data.category)}&entry=direct`;
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

  const products = document.querySelector("[data-products]");
  if (products) products.innerHTML = (data.products || []).map(([title, form, body, photo, kind]) => `
    <article class="product-card" data-product-kind="${kind}">
      <span class="product-card__stage"><img src="${photo}" width="768" height="768" loading="lazy" decoding="async" alt=""></span>
      <div class="product-card__copy">
        <span class="product-card__form">${form}</span>
        <strong>${title}</strong>
        <p>${body}</p>
      </div>
    </article>
  `).join("");

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
        <li><a class="article-card" href="krane-b2c.html#articles" target="_parent" data-route="articles">
          <span class="article-card__thumb"><img src="${article.image}" width="256" height="256" loading="lazy" decoding="async" alt=""></span>
          <span class="article-card__body">
            <span class="article-card__tags"><em class="article-card__tag">${article.category}</em><span class="article-card__meta">${article.meta}</span></span>
            <strong class="article-card__title">${article.title}</strong>
            <span class="article-card__excerpt">${article.excerpt}</span>
          </span>
        </a></li>
      `).join("");
    }
  }
})();
