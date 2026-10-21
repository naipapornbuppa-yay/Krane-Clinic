/* Service-specific question templates. Shared by intake1–intake4.
 * This is the single source for authored question order and category content. */
function kraneCreateIntakeTemplates(){
 return {
    hair:{
      intake1:`
        <div><h2 class="h1">แบบประเมินผมร่วงและหนังศีรษะ</h2></div>
        ${intakeChoiceQuestion({
          id:'hair.current_goal',
          title:'สุขภาพเส้นผมตอนนี้เป็นอย่างไร และคุณอยากได้ผลลัพธ์แบบไหน?',
          helper:'แพทย์จะได้เข้าใจลักษณะอาการของคุณ และแนะนำแนวทางรักษาที่เหมาะสมให้ได้',
          options:['มีผมบาง ผมร่วง มาสักพักแล้ว กำลังหาแนวทางรักษาอยู่','เพิ่งเริ่มสังเกตว่าหัวเริ่มเถิกขึ้น อยากเริ่มรักษาทันที','ผมยังปกติดีอยู่ แต่อยากเริ่มทานยาป้องกันไว้ก่อน']
        })}
        ${intakeChoiceQuestion({
          id:'hair.previous_treatment',
          title:'คุณเคยลองรักษาอาการผมบาง ผมร่วงวิธีไหนมาแล้วบ้าง?',
          helper:'เลือกทุกข้อที่ตรง',
          multiple:true,
          options:['ยา อาหารเสริม หรือผลิตภัณฑ์ทั่วไป','ยาตามใบสั่งแพทย์','ปลูกผม','ยังไม่เคย']
        })}`,
      intake2:`
        <div><h2 class="h1">แบบประเมินผมร่วงและหนังศีรษะ</h2></div>
        ${intakeChoiceQuestion({
          id:'hair.onset',
          title:'คุณเริ่มสังเกตเห็นว่าผมเริ่มร่วงและบางลงครั้งแรกเมื่อไหร่?',
          helper:'เลือกข้อที่ตรงที่สุด',
          options:['นานกว่า 1 ปีแล้ว','ภายในปีนี้','ภายในช่วงไม่กี่เดือนนี้','ไม่แน่ใจ']
        })}
        <div class="common-group" data-question-id="hair.loss_area" data-string-id="intake.hair.loss_area.title">
          <div class="section-label">คุณสังเกตว่าผมร่วงหรือผมบางบริเวณไหนบ้าง?</div>
          <p class="hint">เลือกได้มากกว่า 1 ข้อ</p>
          <div class="stack-3 hair-area-options">
            ${[
              [1,'แนวไรผมด้านหน้าหรือขมับ','assets/intake/line-v2/hair-area-side-receded-v9.png'],
              [2,'กลางศีรษะหรือขม่อม','assets/intake/line-v2/hair-area-bald-crown-v9.png'],
              [4,'ผมร่วงเป็นหย่อม ๆ','assets/intake/line-v2/hair-area-side-no-hand-patchy-v8.svg'],
              [5,'หนังศีรษะคัน แดง หรือมีสะเก็ด','assets/intake/line-v2/hair-area-side-scalp-no-hand-v6.png']
            ].map(([id,label,image]) => `<button class="option hair-area-option" type="button" data-multi data-answer-id="hair.loss_area.${id}"><span class="hair-area-option__visual" aria-hidden="true"><img src="${image}" alt="" loading="lazy"></span><span class="opt-body"><span class="opt-title">${label}</span></span><span class="opt-check"></span></button>`).join('')}
          </div>
        </div>
        ${intakeChoiceQuestion({
          id:'hair.family_history',
          title:'มีคนในครอบครัวหรือญาติสายตรงที่มีอาการผมบาง ผมร่วง ไหม?',
          options:['มี','ไม่มี','ไม่แน่ใจ']
        })}`,
      intake3:`
        <div><h2 class="h1">แบบประเมินผมร่วงและหนังศีรษะ</h2></div>
        ${intakeChoiceQuestion({
          id:'hair.severity',
          title:'คุณผมร่วงไปมากเท่าไหร่แล้ว?',
          options:['ค่อนข้างมาก - ทุกคนสังเกตเห็นได้','ปานกลาง - มีแค่คนใกล้ตัวที่เห็น','น้อยมาก - สังเกตเห็นเองคนเดียว']
        })}
        ${intakeChoiceQuestion({
          id:'hair.scalp_symptoms',
          title:'มีอาการคัน แสบ ปวด สะเก็ด ตุ่ม หรือรอยแดงที่หนังศีรษะร่วมด้วยหรือไม่?',
          options:['มี','ไม่มี']
        })}`,
      intake4:`
        <div><h2 class="h1">แบบประเมินผมร่วงและหนังศีรษะ</h2></div>
        ${intakeChoiceQuestion({
          id:'hair.female_cycle_weight',
          title:'มีปัญหาประจำเดือนมาไม่สม่ำเสมอ หรือน้ำหนักเปลี่ยนแปลงผิดปกติหรือไม่?',
          options:['มี','ไม่มี']
        })}
        ${intakeChoiceQuestion({
          id:'hair.female_pregnancy',
          title:'คุณกำลังตั้งครรภ์หรือมีแผนตั้งครรภ์อยู่หรือไม่?',
          options:['มี','ไม่มี']
        })}`
    },

    /* Obesity / weight loss, 13 Sep: these are the client's own questions, from
       "obesity intake Qs" in the progress doc, in the client's order. The doctor's
       SOP behind them screens the indication by BMI first, then the other causes
       of obesity and the contraindications for the NuSH (GLP-1) medicines, before
       a doctor ever sees the case. Each block below is one page: the intake
       pager splits the body's children, so six questions across three screens
       read one at a time. */
    weight:{
      intake1:`
        <div><h2 class="h1">ประเมินการลดน้ำหนัก</h2></div>
        <div class="common-group" data-question-id="weight.preferred_treatment" data-string-id="intake.weight.preferred_treatment.title">
          <div class="section-label">คุณมีแนวทางการรักษาที่อยากลองไว้ในใจแล้วหรือยัง?</div>
          <div class="stack-3">
            <button class="option" data-select><span class="opt-body"><span class="opt-title">ปากกาลดน้ำหนัก GLP-1</span></span><span class="opt-check"></span></button>
            <button class="option" data-select><span class="opt-body"><span class="opt-title">ยาเม็ด GLP-1</span></span><span class="opt-check"></span></button>
            <button class="option" data-select><span class="opt-body"><span class="opt-title">อยากให้แพทย์แนะนำการรักษาที่เหมาะให้</span></span><span class="opt-check"></span></button>
            <button class="option" data-select><span class="opt-body"><span class="opt-title">อยากปรึกษาแพทย์เพื่อเรียนรู้เพิ่มเติม</span></span><span class="opt-check"></span></button>
          </div>
        </div>
        <div class="common-group" data-question-id="weight.previous_glp1" data-string-id="intake.weight.previous_glp1.title">
          <div class="section-label">คุณเคยลองลดน้ำหนักผ่านยาประเภท GLP-1 แล้วหรือยัง?</div>
          <div class="stack-3">
            <button class="option" data-select><span class="opt-body"><span class="opt-title">ยังไม่เคย นี่เป็นครั้งแรก</span></span><span class="opt-check"></span></button>
            <button class="option" data-select><span class="opt-body"><span class="opt-title">เคยแล้ว</span></span><span class="opt-check"></span></button>
          </div>
        </div>`,
      intake2:`
        <div><h2 class="h1">ประเมินการลดน้ำหนัก</h2></div>
        <div class="common-group" data-question-id="weight.motivation" data-string-id="intake.weight.motivation.title">
          <div class="section-label">ทำไมคุณถึงอยากเริ่มลดน้ำหนัก?</div>
          <p class="hint">เลือกได้มากกว่า 1 ข้อ</p>
          <div class="stack-3">
            <button class="option" data-multi><span class="opt-body"><span class="opt-title">สุขภาพโดยรวมที่ดีขึ้น</span></span><span class="opt-check"></span></button>
            <button class="option" data-multi><span class="opt-body"><span class="opt-title">รู้สึกและคุณภาพชีวิตดีขึ้น</span></span><span class="opt-check"></span></button>
            <button class="option" data-multi><span class="opt-body"><span class="opt-title">มั่นใจมากขึ้น</span></span><span class="opt-check"></span></button>
            <button class="option" data-multi><span class="opt-body"><span class="opt-title">ได้ใส่เสื้อผ้าที่อยากใส่</span></span><span class="opt-check"></span></button>
            <button class="option" data-multi><span class="opt-body"><span class="opt-title">ลดความเสี่ยงเกิดโรคแทรกซ้อน</span></span><span class="opt-check"></span></button>
            <button class="option" data-multi><span class="opt-body"><span class="opt-title">อื่น ๆ</span></span><span class="opt-check"></span></button>
          </div>
          <p class="intake-privacy-note"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5c0 4.6 2.7 8.2 7 10 4.3-1.8 7-5.4 7-10V6Z"></path><path d="m9 12 2 2 4-4"></path></svg><span>เป็นส่วนตัว · เปิดให้เฉพาะแพทย์ที่ดูแลคุณ</span></p>
        </div>`,
      intake3:`
        <div><h2 class="h1">ประเมินการลดน้ำหนัก</h2></div>
        <div class="common-group" data-question-id="weight.starting_point" data-string-id="intake.weight.starting_point.title">
          <div class="section-label">เข้าใจแล้ว! มาเริ่มกันเลย จุดเริ่มต้นของคุณอยู่ที่ตรงไหน?</div>
          <div class="partner-health-grid">
            <div class="field grow float-field"><div class="float-field__box"><span class="float-field__slot"><input class="input" id="obesity-height" inputmode="numeric" data-obesity-metric="height" placeholder=" "><label for="obesity-height">ส่วนสูง (ซม.)</label></span></div></div>
            <div class="field grow float-field"><div class="float-field__box"><span class="float-field__slot"><input class="input" id="obesity-weight" inputmode="numeric" data-obesity-metric="weight" placeholder=" "><label for="obesity-weight">น้ำหนัก (กก.)</label></span></div></div>
          </div>
          <!-- The BMI is the indication the doctor's SOP screens on, so it is
               shown the moment both numbers exist rather than kept back. -->
          <div class="obesity-bmi" data-obesity-bmi hidden role="status" aria-live="polite">
            <span class="obesity-bmi__label">BMI ของคุณ</span>
            <strong class="obesity-bmi__value" data-obesity-bmi-value>—</strong>
            <span class="obesity-bmi__unit">กก./ม.²</span>
          </div>
          <aside class="intake-explainer" data-intake-guidance><strong class="intake-explainer__title">ทำไมเราถึงถาม</strong><p class="intake-explainer__copy">BMI คือข้อบ่งใช้ที่แพทย์ต้องประเมินก่อนพิจารณายาลดน้ำหนัก ตัวเลขนี้จึงมาก่อนการปรึกษา</p></aside>
          <p class="intake-privacy-note"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5c0 4.6 2.7 8.2 7 10 4.3-1.8 7-5.4 7-10V6Z"></path><path d="m9 12 2 2 4-4"></path></svg><span>เป็นส่วนตัว · เปิดให้เฉพาะแพทย์ที่ดูแลคุณ</span></p>
        </div>
        <div class="common-group" data-question-id="weight.goal" data-string-id="intake.weight.goal.title">
          <div class="section-label">เป้าหมายการลดน้ำหนักของคุณ?</div>
          <p class="hint">บอกเราถึงเป้าหมายน้ำหนักของคุณ แพทย์จะแนะนำขั้นตอนเพื่อให้คุณลดน้ำหนักได้อย่างมีคุณภาพและดูแลสุขภาพไปพร้อมกัน</p>
          <div class="field float-field"><div class="float-field__box"><span class="float-field__slot"><input class="input" id="obesity-target" inputmode="numeric" data-obesity-metric="target" placeholder=" "><label for="obesity-target">น้ำหนักเป้าหมาย (กก.)</label></span></div></div>
          ${intakeDurationControl({label:'คุณอยากบรรลุเป้าหมายภายในเวลาเท่าไหร่?',thai:true})}
        </div>`
    },
    hormone:{
      intake1:`
        <div><h2 class="h1">อาการใดที่ทำให้คุณอยากประเมินฮอร์โมน</h2></div>
        <div class="stack-3">
          <button class="option" data-multi><span class="opt-body"><span class="opt-title">อ่อนเพลียหรือพลังงานลดลง</span></span><span class="opt-check"></span></button>
          <button class="option" data-multi><span class="opt-body"><span class="opt-title">ความต้องการทางเพศหรือสมรรถภาพลดลง</span></span><span class="opt-check"></span></button>
          <button class="option" data-multi><span class="opt-body"><span class="opt-title">มวลกล้ามเนื้อหรือความแข็งแรงลดลง</span></span><span class="opt-check"></span></button>
          <button class="option" data-multi><span class="opt-body"><span class="opt-title">อารมณ์ สมาธิ หรือคุณภาพการนอนเปลี่ยน</span></span><span class="opt-check"></span></button>
          <button class="option" data-multi><span class="opt-body"><span class="opt-title">มีผลตรวจฮอร์โมนและต้องการให้แพทย์ช่วยประเมิน</span></span><span class="opt-check"></span></button>
        </div>
        ${intakeDurationControl({label:'มีอาการมานานเท่าไร?',thai:true})}`,
      intake2:`
        <div><h2 class="h1">ข้อมูลสุขภาพที่เกี่ยวข้อง</h2></div>
        <div class="stack-3">
          <button class="option" data-multi><span class="opt-body"><span class="opt-title">มีโรคหัวใจ ความดัน เบาหวาน หรือไขมันสูง</span></span><span class="opt-check"></span></button>
          <button class="option" data-multi><span class="opt-body"><span class="opt-title">มีปัญหาต่อมลูกหมากหรือการปัสสาวะ</span></span><span class="opt-check"></span></button>
          <button class="option" data-multi><span class="opt-body"><span class="opt-title">มีภาวะหยุดหายใจขณะหลับหรือกรนมาก</span></span><span class="opt-check"></span></button>
          <button class="option" data-multi><span class="opt-body"><span class="opt-title">ต้องการมีบุตรในอนาคต</span></span><span class="opt-check"></span></button>
          <button class="option" data-multi><span class="opt-body"><span class="opt-title">ไม่มีข้อใดตรง</span></span><span class="opt-check"></span></button>
        </div>`,
      intake3:`
        <div><h2 class="h1">เคยตรวจหรือใช้ฮอร์โมนมาก่อนหรือไม่</h2></div>
        <div class="stack-3">
          <button class="option" data-multi><span class="opt-body"><span class="opt-title">ยังไม่เคยตรวจหรือรักษา</span></span><span class="opt-check"></span></button>
          <button class="option" data-multi><span class="opt-body"><span class="opt-title">มีผลตรวจฮอร์โมนในช่วง 6 เดือนที่ผ่านมา</span></span><span class="opt-check"></span></button>
          <button class="option" data-multi><span class="opt-body"><span class="opt-title">เคยใช้ TRT ภายใต้การดูแลของแพทย์</span></span><span class="opt-check"></span></button>
          <button class="option" data-multi><span class="opt-body"><span class="opt-title">เคยใช้ฮอร์โมนหรือสารเสริมเอง</span></span><span class="opt-check"></span></button>
          <button class="option" data-multi><span class="opt-body"><span class="opt-title">ใช้ยา อาหารเสริม หรือสารกระตุ้นเป็นประจำ</span></span><span class="opt-check"></span></button>
        </div>`
    },
    general:{
      intake1:`
        <div><h2 class="h1">วันนี้อยากปรึกษาเรื่องอะไร?</h2></div>
        <div class="field float-field"><div class="float-field__box"><span class="float-field__slot"><textarea class="textarea" id="general-description" placeholder="เล่าอาการหรือสิ่งที่กังวล" required></textarea><label for="general-description">เล่าอาการหรือสิ่งที่กังวล</label></span></div></div>
        ${intakeDurationControl({label:'เริ่มมีอาการเมื่อไร?',thai:true})}`
    }
  ,
    skin:{
      intake1:`
        <div><h2 class="h1">ตอนนี้ผิวของคุณเป็นอย่างไร</h2></div>
        <div class="common-group"><div class="section-label">ผิวของคุณมีลักษณะแบบไหน?</div>
          <div class="stack-3"><button class="option" data-multi><span class="opt-body"><span class="opt-title">สิวอุดตัน หัวขาวหรือหัวดำ</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">สิวอักเสบ แดงและเจ็บ</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">สิวหนองหรือสิวซีสต์</span><span class="opt-sub">ก้อนใต้ผิวขนาดใหญ่</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">รอยดำหรือรอยแดงหลังสิว</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">ผื่น คัน หรือผิวลอก</span></span><span class="opt-check"></span></button></div>
        </div>
        <div class="common-group"><div class="section-label">เป็นบริเวณใดบ้าง?</div>
          <div class="stack-3"><button class="option" data-multi><span class="opt-body"><span class="opt-title">ใบหน้า</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">ลำคอหรือกราม</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">หลังหรือหน้าอก</span></span><span class="opt-check"></span></button></div>
        </div>
        <div class="common-group">${intakeDurationControl({label:'เป็นมานานเท่าไร?',thai:true})}</div>
      `,
      intake2:`
        <div class="stack-2"><h2 class="h1">อาการเป็นแบบไหน</h2></div>
        <div class="common-group"><div class="section-label">อาการรุนแรงแค่ไหน?</div>
          <div class="stack-3"><button class="option" aria-selected="true" data-select><span class="opt-body"><span class="opt-title">เล็กน้อย</span><span class="opt-sub">มีสิวเป็นบางจุด</span></span><span class="opt-check"></span></button><button class="option" data-select><span class="opt-body"><span class="opt-title">ปานกลาง</span><span class="opt-sub">มีสิวหลายจุดและมีรอยตามมา</span></span><span class="opt-check"></span></button><button class="option" data-select><span class="opt-body"><span class="opt-title">มาก</span><span class="opt-sub">อักเสบเป็นบริเวณกว้างหรือเริ่มมีแผลเป็น</span></span><span class="opt-check"></span></button></div>
        </div>
        <div class="common-group"><div class="section-label">อะไรทำให้อาการเป็นมากขึ้น?</div>
          <div class="stack-3"><button class="option" data-multi><span class="opt-body"><span class="opt-title">ช่วงมีประจำเดือน</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">ความเครียดหรือพักผ่อนน้อย</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">เครื่องสำอางหรือครีมกันแดด</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">อาหารบางชนิด</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">ไม่แน่ใจ</span></span><span class="opt-check"></span></button></div>
        </div>
        <div class="common-group">${intakeDropdown({
          id:'intake-skin-type',
          label:'ประเภทผิว',
          placeholder:'เลือกประเภทผิว',
          options:[['oily','ผิวมัน'],['dry','ผิวแห้ง'],['combination','ผิวผสม'],['sensitive','ผิวแพ้ง่าย']]
        })}</div>
      `,
      intake3:`
        <div class="stack-2"><h2 class="h1">เคยใช้ยาหรือผลิตภัณฑ์อะไรมาก่อน</h2></div>
        <div class="common-group"><div class="section-label">เคยใช้การรักษาใดมาก่อน?</div>
          <div class="stack-3"><button class="option" data-multi><span class="opt-body"><span class="opt-title">ไม่เคยรักษามาก่อน</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">ยาทากลุ่มเรตินอยด์</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">ยาทา Benzoyl peroxide</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">ยาปฏิชีวนะชนิดรับประทาน</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">ยา Isotretinoin</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">ยาคุมกำเนิดเพื่อรักษาสิว</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">ทรีตเมนต์ที่คลินิก</span></span><span class="opt-check"></span></button></div>
        </div>
        <div class="common-group">${intakeDropdown({
          id:'intake-treatment-result',
          label:'ผลเป็นอย่างไร?',
          placeholder:'เลือกผลลัพธ์',
          options:[['better','ดีขึ้น'],['no-change','ไม่เปลี่ยนแปลง'],['irritated','ระคายเคืองหรือแพ้'],['not-treated','ยังไม่เคยรักษา']]
        })}</div>
      `
    },
    sexual:{
      intake1:`
        <div><h2 class="h1">แบบประเมินสุขภาพเพศชาย</h2></div>
        ${intakeChoiceQuestion({
          id:'ed.confidence_goal',
          title:'เรื่องไหนที่คุณอยากมั่นใจขึ้นมากที่สุด?',
          options:['เริ่มแข็งตัวง่ายขึ้น','ความแข็งเพียงพอสำหรับสอดใส่','แข็งตัวได้นานขึ้น','ทั้งหมด','ยังไม่แน่ใจ อยากปรึกษาแพทย์ก่อน']
        })}
        ${intakeChoiceQuestion({
          id:'ed.previous_treatment',
          title:'เคยลองวิธีไหนเพื่อช่วยเรื่องการแข็งตัวมาก่อนไหม?',
          options:['ยังไม่เคย','เคยลองกินยาแล้ว แต่ยังไม่ได้ผล','เคยใช้ยาแต่มีอาการข้างเคียง','เคยลองกินยาแล้ว แต่ต้องการหาตัวเลือกการรักษาอื่น ๆ']
        })}`,
      intake2:`
        <div><h2 class="h1">แบบประเมินสุขภาพเพศชาย</h2></div>
        ${intakeChoiceQuestion({
          id:'ed.motivation',
          title:'เหตุผลที่อยากเริ่มรักษาตอนนี้?',
          helper:'เลือกได้มากกว่า 1 ข้อ',
          multiple:true,
          options:['อยากมั่นใจขึ้นกว่าเดิม','ต้องการทางเลือกในการรักษาที่ดีขึ้น','อาการเริ่มเกิดบ่อยขึ้นและรบกวนมากขึ้น','กังวลว่าอาการนี้อาจเกี่ยวข้องกับเรื่องสุขภาพด้านอื่น','อื่น ๆ']
        })}`,
      intake3:`
        <div><h2 class="h1">แบบประเมินสุขภาพเพศชาย</h2></div>
        ${intakeChoiceQuestion({
          id:'ed.heart_history',
          title:'เข้าใจแล้ว! มาเริ่มกันเลย คุณเคยมีประวัติเป็นโรคหัวใจไหม? หรือมีอาการผิดปกติขณะออกแรงหรือไม่?',
          options:['มี','ไม่มี','ไม่แน่ใจ']
        })}`,
      intake4:`
        <div><h2 class="h1">แบบประเมินสุขภาพเพศชาย</h2></div>
        ${intakeChoiceQuestion({
          id:'ed.nitrate_use',
          title:'ปัจจุบันใช้ยาอม ยาพ่น หรือยารักษาอาการเจ็บหน้าอกกลุ่ม Nitrate อยู่หรือไม่?',
          options:['มี','ไม่มี','ไม่แน่ใจ']
        })}`
    },
    sleep:{
      intake1:`
        <div><h2 class="h1">การนอนของคุณเป็นอย่างไร</h2></div>
        <div class="common-group"><div class="section-label">ผิวของคุณมีลักษณะแบบไหน?</div>
          <div class="stack-3"><button class="option" data-multi><span class="opt-body"><span class="opt-title">หลับยาก ใช้เวลานานกว่าจะหลับ</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">ตื่นกลางดึกแล้วหลับต่อยาก</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">ตื่นเช้ากว่าที่ต้องการ</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">หลับได้แต่ตื่นมาไม่สดชื่น</span></span><span class="opt-check"></span></button></div>
        </div>
        <div class="common-group">${intakeDurationControl({label:'มีปัญหาการนอนมานานเท่าไร?',thai:true})}</div>
        <div class="common-group">${intakeDropdown({
          id:'intake-sleep-hours',
          label:'คุณนอนคืนละกี่ชั่วโมง?',
          placeholder:'เลือกจำนวนชั่วโมง',
          options:[['lt-4h','น้อยกว่า 4 ชั่วโมง'],['4-6h','4 ถึง 6 ชั่วโมง'],['gt-6h','มากกว่า 6 ชั่วโมง']]
        })}</div>
      `,
      intake2:`
        <div class="stack-2"><h2 class="h1">ผลกระทบในเวลากลางวัน</h2></div>
        <div class="common-group"><div class="section-label">ตอนกลางวันคุณรู้สึกอย่างไร?</div>
          <div class="stack-3"><button class="option" data-multi><span class="opt-body"><span class="opt-title">ง่วงหรือเพลียระหว่างวัน</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">สมาธิสั้นลง จำอะไรได้น้อยลง</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">หงุดหงิดง่ายกว่าปกติ</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">กังวลหรือคิดวนไม่หยุด</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">ไม่มีผลกระทบชัดเจน</span></span><span class="opt-check"></span></button></div>
        </div>
        <div class="common-group"><div class="section-label">ก่อนนอนคุณทำอะไรบ้าง?</div>
          <div class="stack-3"><button class="option" data-multi><span class="opt-body"><span class="opt-title">ดื่มกาแฟหรือชาช่วงบ่ายถึงเย็น</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">ใช้โทรศัพท์หรือจอก่อนนอน</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">ทำงานเป็นกะหรือเวลานอนไม่แน่นอน</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">ดื่มแอลกอฮอล์เพื่อช่วยให้หลับ</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">ไม่มีข้อใดตรง</span></span><span class="opt-check"></span></button></div>
        </div>
      `,
      intake3:`
        <div class="stack-2"><h2 class="h1">เคยใช้อะไรช่วยให้หลับบ้าง</h2></div>
        <div class="common-group"><div class="section-label">เคยใช้อะไรมาก่อน?</div>
          <div class="stack-3"><button class="option" data-multi><span class="opt-body"><span class="opt-title">ไม่เคยใช้</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">ยานอนหลับที่แพทย์สั่ง</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">ยานอนหลับที่ซื้อเอง</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">เมลาโทนิน</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">สมุนไพรหรืออาหารเสริม</span></span><span class="opt-check"></span></button><button class="option" data-multi><span class="opt-body"><span class="opt-title">ปรับพฤติกรรมการนอน</span></span><span class="opt-check"></span></button></div>
        </div>
        <div class="common-group">${intakeDropdown({
          id:'intake-treatment-result',
          label:'ผลเป็นอย่างไร?',
          placeholder:'เลือกผลลัพธ์',
          options:[['better','ดีขึ้น'],['no-change','ไม่เปลี่ยนแปลง'],['side-effect','มีผลข้างเคียง'],['not-tried','ยังไม่เคยลอง']]
        })}</div>
      `
    }
  };
}
