/* B2C editorial fixture. Replace this array with published records from the
   admin CMS later; the B2B field mapping and API contract are intentionally
   deferred. Stable id values are for routing and handoff, not CMS record IDs. */
(function () {
  'use strict';
  const articles = [
    {
      id:'finasteride', category:'hair', categoryLabel:'ผมร่วง', minutes:4,
      title:'ฟีนาสเตอไรด์ได้ผลจริงไหม',
      summary:'ทำความเข้าใจว่าการรักษาผมร่วงชนิดนี้ทำงานอย่างไร ต้องรอนานแค่ไหน และควรคุยอะไรกับแพทย์ก่อนเริ่ม',
      image:'assets/articles/editorial-v1/finasteride-evidence.jpg', imageAlt:'ภาพประกอบเรื่องการดูแลปัญหาผมร่วง',
      byline:'ทีมบรรณาธิการ Krane Clinic · อัปเดต ต.ค. 2569',
      sections:[
        {heading:'ยานี้ช่วยอย่างไร',copy:'ฟีนาสเตอไรด์ลดการเปลี่ยนฮอร์โมนเทสโทสเทอโรนเป็น DHT ซึ่งเกี่ยวข้องกับผมร่วงแบบพันธุกรรม การใช้ยาต้องอยู่ภายใต้การประเมินของแพทย์ เพราะสาเหตุผมร่วงของแต่ละคนไม่เหมือนกัน'},
        {heading:'ควรคาดหวังผลเมื่อไร',copy:'การเปลี่ยนแปลงของเส้นผมใช้เวลา โดยทั่วไปอาจเริ่มสังเกตผลหลังใช้ต่อเนื่องประมาณ 3–6 เดือน แพทย์จะช่วยประเมินผลและความเหมาะสมของการรักษาตามช่วงเวลา'},
        {heading:'ก่อนเริ่มใช้ ควรถามอะไร',copy:'บอกแพทย์เกี่ยวกับโรคประจำตัว ยาที่ใช้อยู่ และอาการที่กังวล รวมถึงถามเรื่องผลข้างเคียงและวิธีติดตามผล หากมีอาการผิดปกติระหว่างใช้ยา ให้ติดต่อแพทย์ผู้ดูแล'}
      ],
      tags:['ฟีนาสเตอไรด์','ผมร่วง'],
      source:'https://www.nhs.uk/medicines/finasteride/common-questions-about-finasteride/'
    },
    {
      id:'minoxidil', category:'hair', categoryLabel:'ผมร่วง', minutes:3,
      title:'ไมน็อกซิดิล ต้องคาดหวังอะไรบ้าง',
      summary:'การดูแลผมร่วงต้องอาศัยเวลาและความสม่ำเสมอ รู้จักสิ่งที่ควรติดตามก่อนตัดสินใจเริ่มการรักษา',
      image:'assets/articles/editorial-v1/minoxidil-expectations.jpg', imageAlt:'ภาพประกอบผลิตภัณฑ์ดูแลเส้นผม',
      byline:'ทีมบรรณาธิการ Krane Clinic · อัปเดต ต.ค. 2569',
      sections:[
        {heading:'เริ่มจากการหาสาเหตุ',copy:'ผมร่วงมีได้หลายรูปแบบ การทราบสาเหตุก่อนเลือกการรักษาช่วยให้ตั้งความคาดหวังได้ตรงขึ้น แพทย์อาจสอบถามระยะเวลาที่ผมร่วง ตำแหน่ง และสุขภาพโดยรวม'},
        {heading:'ติดตามผลอย่างไร',copy:'บันทึกภาพเส้นผมในแสงและมุมที่ใกล้เคียงกันตามช่วงเวลาที่แพทย์แนะนำ การเปรียบเทียบระยะสั้นวันต่อวันมักไม่ช่วยให้เห็นภาพการเปลี่ยนแปลง'},
        {heading:'เมื่อไรควรปรึกษาอีกครั้ง',copy:'หากมีอาการระคายเคืองหรือข้อกังวลเกี่ยวกับผลิตภัณฑ์ ควรแจ้งแพทย์หรือเภสัชกร ไม่ควรปรับวิธีใช้หรือเริ่มยาชนิดอื่นเอง'}
      ],
      tags:['ไมน็อกซิดิล','ผมร่วง'],
      source:'https://www.royalberkshire.nhs.uk/media/n3onzj1d/minoxidil-for-hair-loss_oct25.pdf'
    },
    {
      id:'safe-weight-loss', category:'weight', categoryLabel:'น้ำหนัก', minutes:6,
      title:'ลดน้ำหนักอย่างปลอดภัยใต้การดูแลแพทย์',
      summary:'เป้าหมายที่ทำได้จริง การติดตามสุขภาพ และแผนที่ปรับตามชีวิตประจำวันสำคัญกว่าการเร่งตัวเลขบนตาชั่ง',
      image:'assets/articles/editorial-v1/safe-weight-loss.jpg', imageAlt:'ภาพประกอบการจัดการน้ำหนักอย่างปลอดภัย',
      byline:'ทีมบรรณาธิการ Krane Clinic · อัปเดต ต.ค. 2569',
      sections:[
        {heading:'เริ่มด้วยเป้าหมายที่เหมาะกับตัวเอง',copy:'การจัดการน้ำหนักที่ยั่งยืนรวมเรื่องอาหาร การเคลื่อนไหว การนอน และการรับมือความเครียด แพทย์ช่วยพิจารณาสุขภาพเดิมและตั้งเป้าหมายที่เหมาะกับแต่ละคน'},
        {heading:'ติดตามมากกว่าน้ำหนัก',copy:'จดพฤติกรรมและสิ่งที่ทำได้จริงในแต่ละสัปดาห์ เช่น การกินและกิจกรรมที่สม่ำเสมอ นัดติดตามช่วยให้ปรับแผนเมื่อเจออุปสรรค'},
        {heading:'เมื่อไรควรขอคำแนะนำ',copy:'หากมีโรคประจำตัว ใช้ยาอยู่ หรือกังวลกับน้ำหนัก ควรปรึกษาผู้เชี่ยวชาญก่อนเริ่มแผนใหม่ เพื่อเลือกแนวทางที่เหมาะสมและปลอดภัย'}
      ],
      tags:['จัดการน้ำหนัก','สุขภาพ'],
      source:'https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html'
    },
    {
      id:'healthy-hair', category:'hair', categoryLabel:'เส้นผม', minutes:5,
      title:'ดูแลเส้นผมอย่างไรให้แผนการรักษาไปได้ไกลกว่าเดิม',
      summary:'วิธีดูแลเส้นผมและหนังศีรษะแบบอ่อนโยนในชีวิตประจำวัน เพื่อช่วยลดการดึงรั้งและการขาดของเส้นผม',
      image:'assets/articles/editorial-v1/healthy-hair-habits.jpg', imageAlt:'ภาพประกอบการดูแลเส้นผมในชีวิตประจำวัน',
      byline:'ทีมบรรณาธิการ Krane Clinic · อัปเดต ต.ค. 2569',
      sections:[
        {heading:'ดูแลอย่างอ่อนโยน',copy:'เวลาสระผมใช้ปลายนิ้วและหลีกเลี่ยงการขยี้แรง โดยเฉพาะเมื่อผมเปียกเพราะเส้นผมเปราะบางได้ง่าย'},
        {heading:'ลดแรงดึงรั้ง',copy:'ทรงผมที่ดึงแน่นซ้ำ ๆ อาจทำให้เส้นผมเสียหาย ลองเลือกทรงที่หลวมขึ้นและใช้หวีซี่ห่างเมื่อจำเป็น'},
        {heading:'แยกการดูแลออกจากการรักษา',copy:'พฤติกรรมดูแลผมช่วยลดการขาดของเส้นผม แต่ไม่แทนการวินิจฉัย หากผมร่วงเพิ่มขึ้นหรือหนังศีรษะมีอาการผิดปกติ ควรปรึกษาแพทย์'}
      ],
      tags:['เส้นผม','ดูแลตนเอง'],
      source:'https://www.gloshospitals.nhs.uk/your-visit/patient-information-leaflets/good-hair-care-advice/'
    }
  ];
  const extendedSections = {"finasteride": [{"heading": "เริ่มจากคำถามว่าผมร่วงแบบไหน", "copy": "ก่อนตัดสินใจเรื่องยา ลองเรียบเรียงสิ่งที่สังเกตได้ด้วยคำง่าย ๆ เช่น เริ่มเห็นแนวผมเปลี่ยนไปเมื่อไร ตำแหน่งใดเห็นหนังศีรษะชัดขึ้น และการเปลี่ยนแปลงเกิดขึ้นต่อเนื่องหรือเป็นช่วง ๆ ข้อมูลเหล่านี้ช่วยให้การสนทนากับแพทย์มีจุดเริ่มต้นที่ชัดเจนกว่าการบอกเพียงว่าผมร่วงมาก ไม่จำเป็นต้องสรุปสาเหตุด้วยตนเองหรือเลือกชื่อโรคให้ตรงก่อนนัดหมาย"}, {"heading": "เตรียมความคาดหวังให้เป็นเรื่องที่คุยกันได้", "copy": "คำว่าได้ผลอาจหมายถึงต่างกันสำหรับแต่ละคน บางคนอยากติดตามว่าผมร่วงลดลงหรือไม่ บางคนสนใจแนวผมด้านหน้า และบางคนต้องการรู้ว่าควรดูแลต่ออย่างไร ลองเลือกคำถามสำคัญสองหรือสามข้อแล้วนำไปคุยกับแพทย์ เป้าหมายที่ชัดช่วยให้การนัดติดตามมีประโยชน์ และลดการตัดสินผลจากภาพถ่ายครั้งเดียวที่แสงหรือมุมไม่เหมือนเดิม"}, {"heading": "ทำบันทึกที่กลับมาอ่านแล้วเข้าใจ", "copy": "หากกำลังรักษาอยู่ ให้เก็บวันที่เริ่มใช้ ชื่อผลิตภัณฑ์ และคำแนะนำที่ได้รับไว้ด้วยกัน เมื่อกลับมาทบทวนจะได้แยกสิ่งที่เกิดขึ้นก่อนและหลังเริ่มแผนได้ง่ายขึ้น บันทึกเฉพาะข้อเท็จจริงที่สังเกตได้ เช่น วันที่ถ่ายรูปหรือวันที่มีข้อสงสัย แทนการให้คะแนนตัวเองทุกวัน หากมีข้อกังวลระหว่างนัด ให้นำบันทึกไปถามผู้ดูแลโดยไม่ต้องรอให้มีข้อมูลครบทุกช่อง"}, {"heading": "ถามให้ชัดก่อนกลับจากการปรึกษา", "copy": "ก่อนจบการนัด ลองทวนด้วยภาษาของตัวเองว่าขั้นตอนต่อไปคืออะไร จะติดตามผลเมื่อไร และหากมีปัญหาควรติดต่อช่องทางไหน การเข้าใจแผนเป็นส่วนสำคัญของการดูแลต่อเนื่อง หากคำอธิบายยังไม่ชัด สามารถขอให้แพทย์อธิบายซ้ำได้ บทความนี้ใช้เป็นพื้นฐานสำหรับเตรียมคำถาม ไม่ใช่แผนการรักษาเฉพาะบุคคล"}], "minoxidil": [{"heading": "แยกสิ่งที่อยากรู้ก่อนเลือกผลิตภัณฑ์", "copy": "เมื่อเห็นผลิตภัณฑ์หลายรูปแบบ การเริ่มจากคำถามของตัวเองจะช่วยให้หาข้อมูลได้เป็นลำดับ เช่น ต้องการประเมินสาเหตุผมร่วง ต้องการทราบความเหมาะสมของผลิตภัณฑ์ หรือมีข้อสงสัยจากสิ่งที่เคยใช้มาก่อน จดชื่อผลิตภัณฑ์และรูปฉลากไว้เพื่อใช้คุยกับแพทย์หรือเภสัชกร จะช่วยลดความสับสนจากชื่อที่คล้ายกันโดยไม่จำเป็นต้องเดาวิธีใช้จากประสบการณ์ของคนอื่น"}, {"heading": "ให้การติดตามเข้ากับชีวิตประจำวัน", "copy": "เลือกวิธีเก็บข้อมูลที่ทำต่อได้จริง อาจเป็นโฟลเดอร์ภาพเดียวกับบันทึกสั้น ๆ ในโทรศัพท์ โดยเขียนวันที่และคำถามที่อยากถามไว้ด้วยกัน ไม่จำเป็นต้องทำตารางซับซ้อนหรือถ่ายภาพหลายครั้งต่อวัน จุดประสงค์คือให้คุณกับผู้ดูแลย้อนกลับไปดูข้อมูลชุดเดียวกันได้ง่าย เมื่อชีวิตประจำวันเปลี่ยนไปและทำตามแผนได้ยาก การบอกอุปสรรคตามจริงช่วยให้หารูปแบบที่เหมาะสมร่วมกันได้"}, {"heading": "อ่านรีวิวอย่างมีบริบท", "copy": "ภาพก่อนและหลังจากผู้อื่นอาจไม่ได้บอกระยะเวลา แสง มุมถ่าย หรือสิ่งที่ใช้ร่วมกันทั้งหมด จึงเหมาะสำหรับสร้างคำถามมากกว่านำมาเป็นเส้นตายให้ตัวเอง หากเจอคำอ้างที่ชวนสงสัย ให้เก็บประเด็นนั้นไว้ถามผู้ดูแล แยกข้อมูลที่ยืนยันได้ออกจากความรู้สึกของผู้เล่า และให้ความสำคัญกับการประเมินที่อ้างอิงประวัติของคุณเอง"}, {"heading": "เตรียมตัวสำหรับการนัดติดตาม", "copy": "ก่อนถึงวันนัด ทบทวนว่าช่วงที่ผ่านมาเกิดอะไรขึ้นบ้าง มีขั้นตอนไหนที่ยังไม่เข้าใจ และมีผลิตภัณฑ์อื่นเพิ่มเข้ามาหรือไม่ เลือกภาพที่เปรียบเทียบได้พร้อมวันที่ แล้วสรุปข้อสงสัยเป็นรายการสั้น ๆ การมีข้อมูลพร้อมไม่ได้หมายความว่าต้องวินิจฉัยตัวเอง แต่ช่วยให้ใช้เวลาร่วมกับแพทย์ไปกับคำถามที่สำคัญที่สุดสำหรับคุณ"}], "safe-weight-loss": [{"heading": "มองเห็นกิจวัตรก่อนตั้งเป้าหมาย", "copy": "ลองเริ่มจากการจดภาพรวมของวันธรรมดา เช่น เวลาที่สะดวกกินอาหาร ช่วงที่นั่งทำงานนาน และเวลาพักผ่อน บันทึกนี้ไม่ใช่ข้อสอบและไม่ต้องทำให้ดูสมบูรณ์แบบ สิ่งที่มีประโยชน์คือการเห็นข้อจำกัดจริงของชีวิต เมื่อคุยกับผู้ดูแล คุณจะอธิบายได้ว่าแผนแบบไหนทำได้ต่อเนื่อง และช่วงไหนต้องการทางเลือกที่ยืดหยุ่นกว่าเดิม"}, {"heading": "เลือกการเปลี่ยนแปลงที่วัดได้", "copy": "แทนการตั้งเป้ากว้าง ๆ ว่าจะดูแลตัวเองให้ดีขึ้น ลองเลือกสิ่งที่คุณอยากปรับแล้วระบุว่าจะทำเมื่อไรและติดตามอย่างไร เป้าหมายเล็กที่ชัดเจนช่วยให้รู้ว่าควรทบทวนส่วนใดเมื่อทำได้ยาก ไม่จำเป็นต้องเปลี่ยนทุกอย่างพร้อมกัน และไม่ควรใช้ผลในวันเดียวมาตัดสินว่าความพยายามทั้งหมดสำเร็จหรือล้มเหลว"}, {"heading": "เตรียมแผนสำหรับวันที่ไม่เป็นไปตามคาด", "copy": "วันเดินทาง งานเร่ง หรือกิจกรรมกับครอบครัวอาจทำให้กิจวัตรเปลี่ยนไป ลองคิดล่วงหน้าว่าจะเก็บข้อมูลหรือกลับมาทบทวนแผนเมื่อไร การมีทางเลือกช่วยให้การดูแลสุขภาพเป็นส่วนหนึ่งของชีวิต ไม่ใช่รายการที่ต้องทำให้ครบอย่างเคร่งครัดทุกวัน หากติดขัดซ้ำที่จุดเดิม ให้นำสถานการณ์นั้นมาคุยกับทีมดูแลเพื่อปรับแผนร่วมกัน"}, {"heading": "ทบทวนมากกว่าตัวเลขครั้งเดียว", "copy": "ในการนัดครั้งต่อไป คุณอาจเตรียมทั้งคำถามเกี่ยวกับเป้าหมาย สิ่งที่ทำได้ดี และสิ่งที่ยังติดขัด บันทึกที่เป็นรูปธรรมช่วยให้การสนทนาไม่จำกัดอยู่ที่ตัวเลขบนตาชั่งเพียงอย่างเดียว หากกำลังใช้ยาหรือมีโรคประจำตัว ให้แพทย์เป็นผู้ประเมินแผนที่เหมาะสม การอ่านบทความมีประโยชน์ในการเตรียมตัว แต่ไม่แทนการติดตามสุขภาพเฉพาะบุคคล"}], "healthy-hair": [{"heading": "สำรวจกิจวัตรที่ทำซ้ำทุกวัน", "copy": "เริ่มจากมองขั้นตอนที่ทำอยู่แล้ว ตั้งแต่สระ เช็ด หวี ไปจนถึงจัดทรง ลองสังเกตว่าขั้นตอนไหนทำรีบ ๆ หรือทำให้รู้สึกดึงรั้ง การเห็นกิจวัตรจริงช่วยให้เลือกปรับได้ทีละเรื่อง แทนการซื้อผลิตภัณฑ์ใหม่หลายอย่างพร้อมกัน หากต้องการถามผู้ดูแล สามารถเล่าขั้นตอนตามลำดับพร้อมชื่อผลิตภัณฑ์ที่ใช้อยู่ได้"}, {"heading": "แยกเรื่องเส้นผมกับหนังศีรษะ", "copy": "เมื่อจดข้อสงสัย ลองระบุว่ากังวลเรื่องผมขาด ผมบาง หรือความรู้สึกบนหนังศีรษะ คำอธิบายที่แยกกันช่วยให้สื่อสารได้ชัดขึ้นโดยไม่ต้องใช้ศัพท์ทางการแพทย์ หากถ่ายภาพไว้ ให้เลือกภาพที่เห็นตำแหน่งที่ต้องการถามจริง ๆ และเขียนวันที่กำกับ การมีตัวอย่างจะช่วยให้เล่าเรื่องได้ง่ายกว่าการพยายามจำทั้งหมดในวันนัด"}, {"heading": "จัดข้อมูลผลิตภัณฑ์ให้อยู่ที่เดียว", "copy": "เก็บรูปด้านหน้าของผลิตภัณฑ์และฉลากไว้ด้วยกัน โดยเฉพาะเมื่อใช้หลายชิ้นที่มีชื่อคล้ายกัน จดคร่าว ๆ ว่าเริ่มใช้เมื่อไรและกำลังสงสัยเรื่องอะไร ไม่จำเป็นต้องสรุปเองว่าผลิตภัณฑ์ใดเป็นสาเหตุของการเปลี่ยนแปลง ข้อมูลชุดนี้ใช้ประกอบการสนทนากับแพทย์หรือเภสัชกร และช่วยลดการบอกชื่อผิดหรือจำรายละเอียดสลับกัน"}, {"heading": "ให้เวลากับการทบทวนกิจวัตร", "copy": "หลังเลือกปรับสิ่งที่ทำอยู่ ลองกำหนดช่วงกลับมาดูบันทึกที่เหมาะกับตัวเอง สังเกตว่าขั้นตอนไหนทำได้ง่ายขึ้นและข้อสงสัยไหนยังอยู่ หากเรื่องที่กังวลไม่ชัดเจนหรือมีการเปลี่ยนแปลงใหม่ ให้ปรึกษาผู้ดูแลแทนการเพิ่มผลิตภัณฑ์ไปเรื่อย ๆ การดูแลอย่างเป็นลำดับช่วยให้เข้าใจสิ่งที่ตัวเองทำและเล่าต่อได้ตรงประเด็น"}]};
  const wordSegmenter = new Intl.Segmenter('th',{granularity:'word'});
  articles.forEach(article => {
    article.sections.push(...(extendedSections[article.id] || []));
    article.author={name:'แพทย์นรินทร์ ทานากะ',photo:'assets/doctor-profile-male-2026-07-25.png',isMock:true};
    const text=[article.summary,...article.sections.map(section=>section.heading+' '+section.copy)].join(' ');
    const words=[...wordSegmenter.segment(text)].filter(part=>part.isWordLike).length;
    article.minutes=Math.max(1,Math.ceil(words/180));
  });
  const byId = Object.fromEntries(articles.map(article => [article.id,article]));
  const requested = new URLSearchParams(location.search).get('article');
  let selectedId = byId[requested] ? requested : articles[0].id;
  let filter = 'all';
  const el = (tag,className,text) => {
    const node=document.createElement(tag);
    if(className) node.className=className;
    if(text != null) node.textContent=text;
    return node;
  };
  function articleAuthor(article){
    const row=el('span','article-author');
    const photo=el('img','article-author__photo');photo.src=article.author.photo;photo.alt='';photo.width=40;photo.height=40;
    const text=el('span','article-author__text');text.append(el('strong','',article.author.name),el('small','','ผู้เขียนตัวอย่าง · อัปเดต ต.ค. 2569'));
    row.append(photo,text);return row;
  }
  function articleReadAction(){
    const action=el('span','article-teaser__action','อ่านบทความ');
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('class','ui-icon ui-icon--sm');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M5 12h14M12 5l7 7-7 7');svg.append(path);action.append(svg);return action;
  }
  function renderFeed(){
    const feed=document.querySelector('[data-article-feed]');
    if(!feed) return;
    const query=(document.querySelector('[data-article-search]')?.value || '').trim().toLocaleLowerCase('th');
    const visible=articles.filter(article =>
      (filter==='all' || article.category===filter) &&
      (!query || [article.title,article.summary,article.categoryLabel,...article.tags].join(' ').toLocaleLowerCase('th').includes(query)));
    feed.replaceChildren(...visible.map((article,index) => {
      const button=el('button','article-teaser' + (index ? ' article-teaser--compact' : ''));
      button.type='button';button.dataset.go='article';button.dataset.articleId=article.id;
      const image=el('img','article-teaser__image');image.src=article.image;image.alt=article.imageAlt;image.loading='lazy';image.width=1280;image.height=800;
      const body=el('span','article-teaser__body');
      body.append(el('span','article-teaser__meta',article.categoryLabel+' · อ่าน '+article.minutes+' นาที'),
        el('span','article-teaser__title',article.title),el('span','article-teaser__summary',article.summary),
        articleReadAction());
      body.append(articleAuthor(article));button.append(image,body);return button;
    }));
    const empty=document.querySelector('[data-article-empty]');if(empty) empty.hidden=visible.length>0;
  }
  function renderDetail(){
    const article=byId[selectedId] || articles[0];
    const screen=document.getElementById('article');if(!screen) return;
    screen.dataset.articleId=article.id;
    screen.querySelector('[data-article-hero]').src=article.image;
    screen.querySelector('[data-article-hero]').alt=article.imageAlt;
    screen.querySelector('[data-article-meta]').textContent=article.categoryLabel+' · อ่าน '+article.minutes+' นาที';
    screen.querySelector('[data-article-title]').textContent=article.title;
    screen.querySelector('[data-article-byline]').replaceChildren(articleAuthor(article));
    screen.querySelector('[data-article-summary]').textContent=article.summary;
    const body=screen.querySelector('[data-article-body]');
    body.replaceChildren(...article.sections.map(section => {
      const block=el('section','article-reading__section');
      block.append(el('h3','',section.heading),el('p','',section.copy));return block;
    }));
    const source=el('a','article-reading__source','อ่านแหล่งข้อมูลประกอบ');
    source.href=article.source;source.target='_blank';source.rel='noopener noreferrer';body.append(source);
    const tags=screen.querySelector('[data-article-tags]');
    tags.replaceChildren(...article.tags.map(tag => el('span','article-tags__tag',tag)));
  }
  document.addEventListener('click',event => {
    const card=event.target.closest('[data-article-id][data-go="article"]');
    if(card && byId[card.dataset.articleId]) selectedId=card.dataset.articleId;
    const choice=event.target.closest('[data-article-filter]');
    if(choice){filter=choice.dataset.articleFilter;document.querySelectorAll('[data-article-filter]').forEach(button => button.setAttribute('aria-pressed',String(button===choice)));renderFeed();}
  },true);
  document.querySelector('[data-article-search]')?.addEventListener('input',renderFeed);
  window.kraneArticleMock={renderFeed,renderDetail,select(id){if(byId[id]) selectedId=id;},articles};
  renderFeed();
})();
