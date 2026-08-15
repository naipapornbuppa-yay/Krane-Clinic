(() => {
  const NAV_TRANSLATIONS = {
    navWeight: "Weight",
    navMen: "Men's health",
    navHairSkin: "Hair & skin",
    navMore: "More",
    menuWeightStart: "Start a weight-loss plan",
    menuWeightGlp1: "GLP-1 options",
    menuWeightCheck: "Check your eligibility",
    menuEd: "Erectile dysfunction (ED)",
    menuSexual: "Sexual health",
    menuHormone: "Hormones & TRT",
    menuHair: "Hair loss & scalp",
    menuSkin: "Skin & acne",
    menuSkinAge: "Skin & healthy ageing",
    menuSleep: "Sleep & stress",
    navHow: "How it works",
    navDoctors: "Our doctors",
    healthArticles: "Health articles",
    login: "Log in",
    chooseCare: "Choose your care",
    language: "Language",
    partnerAccess: "Partner access"
  };

  const CONDITIONS = {
    weight: {
      category: "weight",
      tone: "weight",
      image: "assets/product-hero/weight-injection-landscape-v2.png",
      kicker: "ดูแลน้ำหนักกับแพทย์",
      title: "การดูแลน้ำหนักที่เริ่มจากสุขภาพของคุณ",
      lead: "ทำความเข้าใจทางเลือก ขั้นตอน และสิ่งที่แพทย์จะประเมิน ก่อนเริ่มแผนดูแลที่เหมาะกับคุณ",
      overviewTitle: "น้ำหนักมีหลายปัจจัยมากกว่าตัวเลขบนตาชั่ง",
      overview: "เป้าหมาย รูปแบบการกิน การนอน ภาวะสุขภาพ และยาที่ใช้อยู่ ล้วนมีผลต่อแผนที่เหมาะสม แพทย์จึงประเมินภาพรวมก่อนแนะนำแนวทาง",
      facts: [
        ["activity", "เป้าหมายของคุณ", "คุยถึงเป้าหมายที่เป็นจริงและติดตามผลได้"],
        ["heart-pulse", "สุขภาพโดยรวม", "ทบทวนโรคประจำตัว ประวัติครอบครัว และความเสี่ยง"],
        ["utensils", "พฤติกรรมประจำวัน", "ดูรูปแบบอาหาร การเคลื่อนไหว การนอน และความเครียด"],
        ["chart-no-axes-combined", "ติดตามต่อเนื่อง", "ประเมินผลข้างเคียงและปรับแผนเมื่อจำเป็น"]
      ],
      optionsTitle: "แผนดูแลน้ำหนักที่อาจใช้ร่วมกัน",
      options: [
        ["salad", "โภชนาการและพฤติกรรม", "ตั้งเป้าหมายและปรับกิจวัตรให้ทำต่อได้จริง"],
        ["video", "การติดตามกับแพทย์", "ทบทวนความคืบหน้า อุปสรรค และความปลอดภัย"],
        ["syringe", "ยาควบคุมน้ำหนัก", "เช่น semaglutide หรือ tirzepatide เมื่อมีข้อบ่งใช้และเหมาะสม"]
      ],
      assessment: ["ส่วนสูง น้ำหนัก และการเปลี่ยนแปลงที่ผ่านมา", "โรคประจำตัว ประวัติการผ่าตัด และยาที่ใช้อยู่", "ประวัติตับอ่อน ถุงน้ำดี ต่อมไทรอยด์ และการตั้งครรภ์", "เป้าหมาย พฤติกรรมอาหาร การนอน และการเคลื่อนไหว"],
      medicalNote: "Semaglutide และ tirzepatide เป็นยาที่ต้องประเมินข้อบ่งใช้ ข้อห้ามใช้ และติดตามผลโดยแพทย์ ไม่เหมาะสำหรับทุกคน",
      productsTitle: "ตัวเลือกการดูแลน้ำหนัก",
      productsLead: "แพทย์อาจพิจารณารูปแบบยาต่างกันตามข้อบ่งใช้ เป้าหมาย และประวัติสุขภาพ",
      products: [["pen", "ปากกาฉีด GLP-1", "เช่น semaglutide หรือ tirzepatide*", "assets/product-hero/weight-care-studio-v4.jpg"], ["bottle", "ทางเลือกอื่นตามข้อบ่งใช้", "แพทย์เลือกตามความเหมาะสมรายบุคคล*", "assets/product-hero/weight-care-prep-v5.png"]]
    },
    ed: {
      category: "sexual-health",
      tone: "ed",
      image: "assets/product-hero/ed-care-couple-short-sleepwear-bed-pills-v13.png",
      kicker: "ดูแลภาวะ ED อย่างเป็นส่วนตัว",
      title: "คุยเรื่องสมรรถภาพทางเพศได้อย่างตรงไปตรงมา",
      lead: "ภาวะหย่อนสมรรถภาพอาจเกี่ยวข้องกับหลอดเลือด ฮอร์โมน ยาที่ใช้ หรือความเครียด การประเมินช่วยหาทางเลือกที่ปลอดภัยกว่า",
      overviewTitle: "ED เป็นเรื่องสุขภาพ ไม่ใช่เรื่องที่ต้องอาย",
      overview: "อาการอาจเกิดเป็นครั้งคราวหรือต่อเนื่อง แพทย์จะถามรูปแบบอาการ สุขภาพหัวใจและหลอดเลือด ยาที่ใช้อยู่ และปัจจัยด้านอารมณ์",
      facts: [
        ["heart-pulse", "สุขภาพหัวใจและหลอดเลือด", "ประเมินความดัน เบาหวาน ไขมัน และอาการที่เกี่ยวข้อง"],
        ["pill", "ยาและอาหารเสริม", "ทบทวนยาที่อาจมีผลต่ออาการหรือเกิดปฏิกิริยาระหว่างยา"],
        ["brain", "ความเครียดและความสัมพันธ์", "แยกปัจจัยทางกายและอารมณ์โดยไม่ตัดสิน"],
        ["lock-keyhole", "คุยอย่างเป็นส่วนตัว", "ข้อมูลสุขภาพได้รับการดูแลตามมาตรฐานความเป็นส่วนตัว"]
      ],
      optionsTitle: "ทางเลือกดูแล ED ที่แพทย์อาจพิจารณา",
      options: [
        ["message-circle-heart", "ปรับปัจจัยเสี่ยง", "ดูการนอน แอลกอฮอล์ บุหรี่ ความเครียด และสุขภาพเมตาบอลิก"],
        ["pill", "ยากลุ่ม PDE5", "เช่น sildenafil หรือ tadalafil เมื่อไม่มีข้อห้ามใช้"],
        ["microscope", "ตรวจเพิ่มเติม", "แพทย์อาจแนะนำการตรวจเลือดหรือส่งต่อเมื่อมีข้อบ่งชี้"]
      ],
      assessment: ["อาการเริ่มเมื่อไร เกิดทุกครั้งหรือเป็นบางครั้ง", "โรคหัวใจ ความดัน เบาหวาน และระดับไขมัน", "ยาที่ใช้อยู่ โดยเฉพาะยากลุ่ม nitrate", "ความต้องการทางเพศ อาการตอนตื่นนอน และปัจจัยด้านอารมณ์"],
      medicalNote: "ห้ามใช้ sildenafil หรือ tadalafil ร่วมกับยากลุ่ม nitrate และยาทั้งสองอาจไม่เหมาะกับผู้มีภาวะหัวใจบางชนิด แพทย์ต้องประเมินก่อนสั่งใช้",
      productsTitle: "ตัวเลือกดูแลภาวะ ED",
      productsLead: "รูปแบบยา ระยะเวลาออกฤทธิ์ และขนาดยาต้องเลือกจากสุขภาพและยาที่ใช้อยู่",
      products: [["blister", "ยากลุ่ม PDE5", "ตัวอย่าง sildenafil หรือ tadalafil*", "assets/product-hero/ed-care-product-closeup-v5.jpg"], ["bottle", "แผนติดตามอาการ", "ทบทวนผลและความปลอดภัยกับแพทย์*", "assets/product-hero/ed-care-couple-short-sleepwear-bed-pills-v13.png"]],
      safety: "หากมีอาการเจ็บหน้าอก หายใจไม่ออก อ่อนแรงเฉียบพลัน หรือการแข็งตัวนานเกิน 4 ชั่วโมง ให้ไปห้องฉุกเฉินหรือโทร 1669 ทันที"
    },
    "sexual-health": {
      category: "sexual-health",
      tone: "ed",
      image: "assets/product-hero/ed-care-couple-short-sleepwear-bed-pills-v13.png",
      kicker: "สุขภาพทางเพศแบบเป็นส่วนตัว",
      title: "เริ่มต้นจากการคุยกับแพทย์โดยไม่ถูกตัดสิน",
      lead: "อาการด้านสมรรถภาพ ความต้องการทางเพศ หรือข้อกังวลอื่น ๆ สามารถประเมินออนไลน์อย่างเป็นส่วนตัวได้",
      overviewTitle: "สุขภาพทางเพศเชื่อมโยงกับสุขภาพกายและใจ",
      overview: "แพทย์จะฟังสิ่งที่กังวล ทบทวนสุขภาพโดยรวม และช่วยแยกสาเหตุที่อาจเกี่ยวข้องก่อนวางแผนร่วมกัน",
      facts: [["heart-pulse", "สุขภาพกาย", "ประเมินโรคประจำตัว ฮอร์โมน และยาที่ใช้อยู่"], ["brain", "สุขภาพใจ", "ดูความเครียด ความกังวล และคุณภาพการนอน"], ["users", "ความสัมพันธ์", "พูดคุยบริบทโดยเคารพขอบเขตและความเป็นส่วนตัว"], ["shield-check", "แผนที่ปลอดภัย", "แนะนำการตรวจ ยา หรือการส่งต่อเมื่อมีข้อบ่งชี้"]],
      optionsTitle: "แนวทางที่อาจใช้ตามสาเหตุ",
      options: [["messages-square", "คำแนะนำและการติดตาม", "ทำความเข้าใจรูปแบบอาการและสิ่งกระตุ้น"], ["pill", "ยาเมื่อเหมาะสม", "เลือกตามข้อบ่งใช้และยาที่ใช้อยู่"], ["microscope", "ตรวจหรือส่งต่อ", "เมื่อสงสัยภาวะฮอร์โมน หลอดเลือด หรือโรคอื่น"]],
      assessment: ["ลักษณะอาการ ระยะเวลา และผลต่อชีวิตประจำวัน", "โรคประจำตัว การผ่าตัด และยาที่ใช้", "ความเครียด การนอน และความสัมพันธ์", "อาการร่วมที่อาจต้องตรวจหรือส่งต่อ"],
      medicalNote: "แนวทางและยาที่เหมาะสมแตกต่างกันตามอาการ สาเหตุ และข้อห้ามใช้ แพทย์ต้องประเมินเป็นรายบุคคล",
      productsTitle: "ทางเลือกดูแลสุขภาพทางเพศ",
      productsLead: "แพทย์เริ่มจากสาเหตุและความปลอดภัยก่อนพิจารณายา การตรวจ หรือการส่งต่อ",
      products: [["blister", "ยาเมื่อมีข้อบ่งใช้", "เลือกตามอาการและข้อห้ามใช้*", "assets/product-hero/ed-care-product-closeup-v5.jpg"], ["bottle", "การดูแลตามสาเหตุ", "อาจรวมคำแนะนำ การตรวจ และการติดตาม*", "assets/treatment-editorial/sexual-performance-editorial-v6.jpg"]]
    },
    "hair-loss": {
      category: "hair-skin",
      tone: "hair",
      image: "assets/product-hero/hair-care-vanity-v10-left-hand.png",
      kicker: "ฟื้นฟูเส้นผม",
      title: "หาสาเหตุผมร่วงก่อนเลือกวิธีดูแล",
      lead: "รูปแบบผมร่วง หนังศีรษะ ประวัติครอบครัว สุขภาพ และความเครียด ช่วยให้แพทย์แนะนำทางเลือกได้ตรงจุดขึ้น",
      overviewTitle: "ผมร่วงแต่ละแบบดูแลไม่เหมือนกัน",
      overview: "ผมบางแบบกรรมพันธุ์ ผมร่วงเป็นหย่อม การอักเสบ หรือผมร่วงหลังความเครียดและเจ็บป่วย อาจต้องใช้การดูแลต่างกัน",
      facts: [["scan", "ดูรูปแบบผมร่วง", "แนวไรผม กลางศีรษะ เป็นหย่อม หรือร่วงกระจาย"], ["history", "ทบทวนช่วงเวลา", "เริ่มเมื่อไร เปลี่ยนเร็วเพียงใด และมีเหตุการณ์กระตุ้นหรือไม่"], ["sparkles", "ประเมินหนังศีรษะ", "ดูอาการคัน แดง สะเก็ด แผล หรือการอักเสบ"], ["dna", "ประวัติสุขภาพและครอบครัว", "รวมยา โภชนาการ ฮอร์โมน และกรรมพันธุ์"]],
      optionsTitle: "แนวทางดูแลผมที่อาจพิจารณา",
      options: [["droplets", "ยาทาหรือผลิตภัณฑ์เฉพาะที่", "เช่น minoxidil เมื่อเหมาะกับรูปแบบอาการ"], ["pill", "ยารับประทาน", "เช่น finasteride โดยแพทย์ประเมินประโยชน์และความเสี่ยง"], ["microscope", "ตรวจเพิ่มเติม", "อาจตรวจเลือดหรือส่งต่อแพทย์ผิวหนังเมื่อมีสัญญาณผิดปกติ"]],
      assessment: ["รูปแบบและระยะเวลาที่ผมร่วง", "อาการคัน เจ็บ แดง สะเก็ด หรือแผลบนหนังศีรษะ", "ยา อาหารเสริม การเจ็บป่วย และความเครียดที่ผ่านมา", "ประวัติผมบางในครอบครัวและภาพถ่ายติดตาม"],
      medicalNote: "Finasteride และ minoxidil มีข้อควรระวังและผลข้างเคียงต่างกัน ผลลัพธ์ต้องใช้เวลาและไม่เหมือนกันในแต่ละคน",
      productsTitle: "ตัวเลือกดูแลผมร่วง",
      productsLead: "มีทั้งยาทาและยารับประทาน โดยต้องเลือกให้ตรงกับรูปแบบผมร่วงและข้อควรระวัง",
      products: [["pump", "ยาทาหนังศีรษะ", "ตัวอย่าง minoxidil*", "assets/product-hero/hair-serum-scalp-v2.png"], ["bottle", "ยารับประทาน", "ตัวอย่าง finasteride เมื่อแพทย์เห็นว่าเหมาะสม*", "assets/product-hero/hair-care-vanity-v10-left-hand.png"]]
    },
    skin: {
      category: "skin",
      tone: "skin",
      image: "assets/treatment-editorial/skin-hands-cream-editorial-v2.png",
      kicker: "ผิวพรรณ & ชะลอวัย",
      title: "ดูแลปัญหาผิวด้วยแผนที่เหมาะกับผิวของคุณ",
      lead: "สิว รอยดำ ความไวของผิว และริ้วรอยมีหลายปัจจัย แพทย์จะประเมินอาการและผลิตภัณฑ์ที่ใช้อยู่ก่อนแนะนำแผน",
      overviewTitle: "ผิวที่ดูคล้ายกันอาจมีสาเหตุต่างกัน",
      overview: "ตำแหน่ง ลักษณะ ระยะเวลา สิ่งกระตุ้น และการตอบสนองต่อผลิตภัณฑ์ ช่วยแยกแนวทางที่เหมาะสมและลดการระคายเคือง",
      facts: [["scan-face", "ลักษณะและตำแหน่ง", "ดูชนิดของสิว รอย จุดด่างดำ หรือความเปลี่ยนแปลงของผิว"], ["flask-conical", "ผลิตภัณฑ์ที่ใช้อยู่", "ทบทวนสารสำคัญ ความถี่ และอาการแพ้ระคายเคือง"], ["sun", "แสงแดดและสิ่งกระตุ้น", "ประเมินพฤติกรรมกันแดด ฮอร์โมน และสิ่งแวดล้อม"], ["calendar-check", "ติดตามการตอบสนอง", "ปรับแผนตามผลลัพธ์และความทนของผิว"]],
      optionsTitle: "องค์ประกอบของแผนดูแลผิว",
      options: [["sparkles", "กิจวัตรพื้นฐาน", "ทำความสะอาด เติมความชุ่มชื้น และป้องกันแสงแดด"], ["pipette", "ยาทาหรือสารออกฤทธิ์", "เลือกตามปัญหา ความเข้มข้น และความไวของผิว"], ["video", "ติดตามกับแพทย์", "ทบทวนผลข้างเคียงและปรับความถี่เมื่อจำเป็น"]],
      assessment: ["อาการหลัก ตำแหน่ง ระยะเวลา และภาพถ่ายที่ชัดเจน", "ผลิตภัณฑ์และยาทุกชนิดที่ใช้อยู่", "ประวัติแพ้ ระคายเคือง ตั้งครรภ์ หรือให้นมบุตร", "เป้าหมายและเวลาที่พร้อมติดตามผล"],
      medicalNote: "ยาทาบางชนิดรวมถึง retinoids มีข้อควรระวัง โดยเฉพาะระหว่างตั้งครรภ์หรือวางแผนตั้งครรภ์ ควรให้แพทย์ประเมินก่อนใช้",
      productsTitle: "ตัวเลือกดูแลผิว",
      productsLead: "เนื้อยา ความเข้มข้น และความถี่ต้องเหมาะกับปัญหาและความไวของผิว",
      products: [["tube", "ยาทาเฉพาะที่", "เลือกสารออกฤทธิ์ตามปัญหาผิว*", "assets/medicine/real-v1/tretinoin-retin-a-0025.jpg"], ["pump", "ผลิตภัณฑ์สนับสนุนผิว", "จัดกิจวัตรให้ใช้ร่วมกับแผนแพทย์ได้*", "assets/treatment-editorial/skin-hands-cream-editorial-v2.png"]]
    },
    hormone: {
      category: "hormone",
      tone: "hormone",
      image: "assets/treatment-editorial/hormone-hands-consult-editorial-v2.png",
      kicker: "ฮอร์โมน & TRT",
      title: "อาการคล้ายฮอร์โมนต่ำต้องประเมินให้ครบก่อน",
      lead: "ความเหนื่อยล้า สมรรถภาพลดลง หรือมวลกล้ามเนื้อเปลี่ยน อาจมีหลายสาเหตุ จึงไม่ควรเริ่ม TRT จากอาการอย่างเดียว",
      overviewTitle: "อาการเพียงอย่างเดียวยังยืนยันภาวะฮอร์โมนต่ำไม่ได้",
      overview: "แพทย์จะดูอาการ เวลาเกิดโรคประจำตัว การนอน ยาที่ใช้ และผลตรวจทางห้องปฏิบัติการที่เหมาะสมก่อนวินิจฉัย",
      facts: [["clipboard-pulse", "ทบทวนอาการ", "ดูพลังงาน อารมณ์ สมรรถภาพ และการเปลี่ยนแปลงร่างกาย"], ["test-tube-diagonal", "ตรวจยืนยันเมื่อมีข้อบ่งชี้", "ผลตรวจต้องตีความร่วมกับเวลาเก็บตัวอย่างและอาการ"], ["moon-star", "คัดกรองสาเหตุอื่น", "เช่น การนอน ความเครียด ยา และโรคเมตาบอลิก"], ["shield-check", "ติดตามความปลอดภัย", "หากรักษาต้องติดตามผลและตัวชี้วัดตามแพทย์"]],
      optionsTitle: "แนวทางขึ้นอยู่กับสาเหตุที่พบ",
      options: [["bed", "ปรับปัจจัยพื้นฐาน", "ดูการนอน น้ำหนัก การออกกำลัง และยาที่เกี่ยวข้อง"], ["microscope", "ตรวจเพิ่มเติม", "ยืนยันระดับฮอร์โมนและประเมินสาเหตุเมื่อจำเป็น"], ["syringe", "ฮอร์โมนทดแทน", "พิจารณาเฉพาะผู้ที่วินิจฉัยชัดและไม่มีข้อห้าม"]],
      assessment: ["อาการ ระยะเวลา และผลกระทบต่อชีวิตประจำวัน", "การนอน น้ำหนัก การออกกำลัง และความเครียด", "ยา อาหารเสริม การใช้ฮอร์โมนหรือสารกระตุ้นที่ผ่านมา", "ประวัติภาวะเจริญพันธุ์ ต่อมลูกหมาก หัวใจ และลิ่มเลือด"],
      medicalNote: "TRT ไม่ใช่ผลิตภัณฑ์ชะลอวัยทั่วไป ต้องมีการวินิจฉัยที่เหมาะสมและติดตามความปลอดภัยโดยแพทย์",
      productsTitle: "รูปแบบการรักษาที่ต้องวินิจฉัยก่อน",
      productsLead: "TRT พิจารณาเฉพาะผู้ที่มีอาการและผลตรวจสอดคล้องกัน พร้อมแผนติดตามความปลอดภัย",
      products: [["vial", "ฮอร์โมนตามใบสั่งแพทย์", "ใช้เฉพาะเมื่อวินิจฉัยชัดเจน*", "assets/treatment-editorial/hormone-hands-consult-editorial-v2.png"], ["bottle", "การดูแลปัจจัยร่วม", "การนอน น้ำหนัก ยาที่ใช้ และสุขภาพเมตาบอลิก*", "assets/product-hero/weight-care-prep-v5.png"]]
    },
    "sleep-stress": {
      category: "sleep-stress",
      tone: "mind",
      image: "assets/treatment-editorial/sleep-hands-winddown-editorial-v2.png",
      kicker: "การนอนและความเครียด",
      title: "ดูแลการนอนและใจจากรูปแบบชีวิตจริงของคุณ",
      lead: "ปัญหาการนอน สมาธิ และความเครียดอาจเชื่อมโยงกัน การประเมินช่วยหาสัญญาณที่ควรปรับพฤติกรรม รักษา หรือส่งต่อ",
      overviewTitle: "การนอนที่ไม่ดีมีได้หลายรูปแบบ",
      overview: "นอนหลับยาก ตื่นบ่อย ตื่นไม่สดชื่น ง่วงกลางวัน หรือความกังวลต่อเนื่อง อาจต้องประเมินสาเหตุแตกต่างกัน",
      facts: [["moon-star", "รูปแบบการนอน", "ดูเวลาเข้านอน การตื่นกลางคืน และคุณภาพหลังตื่น"], ["brain", "อารมณ์และความเครียด", "ประเมินความกังวล อารมณ์ และผลต่อชีวิตประจำวัน"], ["coffee", "พฤติกรรมและสารกระตุ้น", "คาเฟอีน แอลกอฮอล์ หน้าจอ และเวลาทำงาน"], ["activity", "คัดกรองภาวะร่วม", "เช่น กรน หยุดหายใจ หรืออาการขาอยู่ไม่สุข"]],
      optionsTitle: "แนวทางที่แพทย์อาจแนะนำ",
      options: [["calendar-clock", "ปรับกิจวัตรการนอน", "ตั้งเวลาและสภาพแวดล้อมที่สอดคล้องกับชีวิตจริง"], ["messages-square", "การบำบัดหรือให้คำปรึกษา", "เหมาะกับความเครียด ความกังวล หรือพฤติกรรมการนอนบางแบบ"], ["stethoscope", "ตรวจหรือส่งต่อ", "เมื่อสงสัยภาวะหยุดหายใจขณะหลับหรืออาการที่ซับซ้อน"]],
      assessment: ["เวลานอน เวลาตื่น และความถี่ของอาการ", "การกรน หยุดหายใจ ง่วงกลางวัน หรืออุบัติเหตุ", "คาเฟอีน แอลกอฮอล์ ยา และอาหารเสริม", "ระดับความเครียด อารมณ์ และสัญญาณความไม่ปลอดภัย"],
      medicalNote: "ยานอนหลับไม่ใช่ทางเลือกแรกสำหรับทุกคน และอาจมีความเสี่ยง แพทย์จะประเมินสาเหตุและทางเลือกอื่นก่อน",
      productsTitle: "ทางเลือกดูแลการนอนและความเครียด",
      productsLead: "การรักษาเริ่มจากรูปแบบอาการและสาเหตุ ไม่ได้เริ่มจากยานอนหลับเสมอไป",
      products: [["bottle", "การดูแลตามสาเหตุ", "แพทย์เลือกแนวทางให้เหมาะกับความเสี่ยง*", "assets/treatment-editorial/hormone-hands-consult-editorial-v2.png"], ["pump", "แผนปรับพฤติกรรม", "ติดตามการนอน ความเครียด และกิจวัตร*", "assets/treatment-editorial/sleep-hands-winddown-editorial-v2.png"]]
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
  const image = document.querySelector("[data-hero-image]");
  if (image) image.src = data.image;
  setText("[data-kicker]", data.kicker);
  setText("[data-title]", data.title);
  setText("[data-lead]", data.lead);
  setText("[data-overview-title]", data.overviewTitle);
  setText("[data-overview]", data.overview);
  setText("[data-options-title]", data.optionsTitle);
  setText("[data-products-title]", data.productsTitle);
  setText("[data-products-lead]", data.productsLead);
  setText("[data-medical-note]", data.medicalNote);
  setText("[data-safety]", data.safety);
  setText("[data-closing-kicker]", `พร้อมเริ่มดูแล${data.kicker.replace("ดูแล", "").trim() || "สุขภาพ"}`);

  document.querySelectorAll("[data-intake-link]").forEach((link) => {
    // A condition detail is always a Krane-direct entry. Carry that context in
    // the deep link so a previous Partner session cannot hide the intake
    // progress UI when this page opens the specialty questionnaire.
    link.href = `krane-b2c.html?v=20260815-intake-progress-v1#intake1?category=${encodeURIComponent(data.category)}&entry=direct`;
    link.dataset.category = data.category;
  });

  const facts = document.querySelector("[data-facts]");
  if (facts) facts.innerHTML = data.facts.map(([icon, title, body]) => `
    <article class="fact-card"><i data-lucide="${icon}" aria-hidden="true"></i><strong>${title}</strong><p>${body}</p></article>
  `).join("");

  const options = document.querySelector("[data-options]");
  if (options) options.innerHTML = data.options.map(([icon, title, body]) => `
    <article class="option-card"><i data-lucide="${icon}" aria-hidden="true"></i><strong>${title}</strong><p>${body}</p></article>
  `).join("");

  const assessment = document.querySelector("[data-assessment-list]");
  if (assessment) assessment.innerHTML = data.assessment.map((item) => `<li>${item}</li>`).join("");

  const products = document.querySelector("[data-products]");
  if (products) products.innerHTML = (data.products || []).map(([kind, title, body, photo]) => `
    <article class="product-option-card" data-product-kind="${kind}">
      <div class="product-option-card__visual"><img class="product-option-card__photo" src="${photo}" width="1600" height="900" loading="lazy" decoding="async" alt=""></div>
      <div class="product-option-card__copy"><i>แพทย์ประเมินก่อนใช้</i><strong>${title}</strong><p>${body}</p></div>
    </article>
  `).join("");

  const mobileMenu = document.querySelector("#mobile-menu");
  const menuOpen = document.querySelector("[data-menu-open]");
  const menuClose = document.querySelector("[data-menu-close]");
  const mobileQuery = window.matchMedia("(max-width: 880px)");

  function mobileMenuIsOpen() {
    return mobileMenu && (mobileMenu.open || mobileMenu.hasAttribute("open"));
  }

  function openMobileMenu() {
    if (!mobileMenu || mobileMenuIsOpen()) return;
    document.body.classList.add("menu-open");
    menuOpen?.setAttribute("aria-expanded", "true");
    if (typeof mobileMenu.showModal === "function") mobileMenu.showModal();
    else mobileMenu.setAttribute("open", "");
    requestAnimationFrame(() => mobileMenu.querySelector("nav summary, nav > a")?.focus());
  }

  function closeMobileMenu({ restoreFocus = false } = {}) {
    if (!mobileMenu || !mobileMenuIsOpen()) return;
    if (typeof mobileMenu.close === "function") mobileMenu.close();
    else mobileMenu.removeAttribute("open");
    document.body.classList.remove("menu-open");
    menuOpen?.setAttribute("aria-expanded", "false");
    if (restoreFocus) menuOpen?.focus();
  }

  menuOpen?.addEventListener("click", openMobileMenu);
  menuClose?.addEventListener("click", () => closeMobileMenu({ restoreFocus: true }));
  mobileMenu?.addEventListener("click", (event) => {
    if (event.target === mobileMenu) closeMobileMenu({ restoreFocus: true });
  });
  mobileMenu?.addEventListener("close", () => {
    document.body.classList.remove("menu-open");
    menuOpen?.setAttribute("aria-expanded", "false");
  });
  mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMobileMenu()));
  mobileQuery.addEventListener("change", (event) => {
    if (!event.matches) closeMobileMenu();
  });

  const navMenus = [...document.querySelectorAll("[data-nav-menu]")];
  const hoverNavQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  let navCloseTimer = 0;

  function setNavMenu(activeMenu) {
    window.clearTimeout(navCloseTimer);
    navMenus.forEach((navMenu) => {
      const open = navMenu === activeMenu;
      navMenu.classList.toggle("is-open", open);
      navMenu.querySelector("[data-nav-menu-trigger]")?.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function queueNavClose() {
    window.clearTimeout(navCloseTimer);
    navCloseTimer = window.setTimeout(() => setNavMenu(null), 140);
  }

  navMenus.forEach((navMenu) => {
    const trigger = navMenu.querySelector("[data-nav-menu-trigger]");
    trigger?.addEventListener("click", (event) => {
      event.stopPropagation();
      const alreadyOpen = navMenu.classList.contains("is-open");
      const toggleCloses = alreadyOpen && (!hoverNavQuery.matches || event.detail === 0);
      setNavMenu(toggleCloses ? null : navMenu);
    });
    trigger?.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowDown") return;
      event.preventDefault();
      setNavMenu(navMenu);
      navMenu.querySelector(".nav-menu__menu a")?.focus();
    });
    if (hoverNavQuery.matches) {
      navMenu.addEventListener("pointerenter", () => setNavMenu(navMenu));
      navMenu.addEventListener("pointerleave", queueNavClose);
    }
    navMenu.addEventListener("focusout", (event) => {
      if (!navMenu.contains(event.relatedTarget)) queueNavClose();
    });
    navMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setNavMenu(null)));
  });

  document.querySelectorAll("[data-mobile-nav-section]").forEach((section, _, sections) => {
    section.addEventListener("toggle", () => {
      if (!section.open) return;
      sections.forEach((sibling) => {
        if (sibling !== section) sibling.open = false;
      });
    });
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element) || !event.target.closest("[data-nav-menu]")) setNavMenu(null);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const openNavMenu = navMenus.find((navMenu) => navMenu.classList.contains("is-open"));
    if (!openNavMenu) return;
    setNavMenu(null);
    openNavMenu.querySelector("[data-nav-menu-trigger]")?.focus();
  });

  const languageSelects = [...document.querySelectorAll("[data-language]")];
  function setNavigationLanguage(language) {
    const lang = language === "en" ? "en" : "th";
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-nav-i18n]").forEach((element) => {
      if (!element.dataset.navTh) element.dataset.navTh = element.innerHTML;
      element.innerHTML = lang === "en" ? NAV_TRANSLATIONS[element.dataset.navI18n] || element.dataset.navTh : element.dataset.navTh;
    });
    languageSelects.forEach((select) => { select.value = lang; });
    menuOpen?.setAttribute("aria-label", lang === "th" ? "เปิดเมนู" : "Open menu");
    menuClose?.setAttribute("aria-label", lang === "th" ? "ปิดเมนู" : "Close menu");
    try { localStorage.setItem("krane_lang", lang); } catch (_) {}
  }

  languageSelects.forEach((select) => select.addEventListener("change", () => setNavigationLanguage(select.value)));
  let initialLanguage = "th";
  try { initialLanguage = localStorage.getItem("krane_lang") || "th"; } catch (_) {}
  setNavigationLanguage(initialLanguage);

  const siteHeader = document.querySelector("[data-site-header]");
  const updateHeader = () => siteHeader?.classList.toggle("is-scrolled", window.scrollY > 24);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  window.lucide?.createIcons({ attrs: { "stroke-width": 1.8 } });
})();
