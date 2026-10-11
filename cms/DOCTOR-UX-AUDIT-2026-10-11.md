# Doctor portal — UX and functional audit

ตรวจ 11 ตุลาคม 2026 · canonical entry: `cms/cms-doctor.html` · ใช้ข้อมูลสมมติเท่านั้น

## ข้อสรุป

โครงของ workflow แพทย์มีเกือบครบและเดิน happy path ของเคสสาธิตได้ แต่ **ยังไม่ใช่ระบบพร้อมใช้กับคนไข้จริง** การเปิดหน้าผ่านไม่เท่ากับบันทึกเวชระเบียน ส่งข้อความ หรือทำธุรกรรมสำเร็จ ปัจจุบันรองรับ golden demo หนึ่งเคสเป็นหลัก เคสอื่นถูกปิดด้วย `demo-out-of-scope` ไม่ใช่ multi-patient EHR

## ถ้าเป็นแพทย์ ต้องทำอะไร และ UX ควรช่วยอย่างไร

| ช่วงงาน | สิ่งที่แพทย์ต้องทำ / UX ที่ควรเห็น | ปัจจุบันและผลตรวจ |
|---|---|---|
| เริ่มงาน | เข้าระบบ ตรวจบัญชี/ใบประกอบวิชาชีพ ตั้งว่าง/ไม่ว่าง | OTP demo ผ่าน validation รูปแบบเท่านั้น ไม่ใช่ auth; status UI ใช้ได้ |
| จัดตาราง | ตั้งเวลาทำงาน วันหยุด ช่วงพัก และนัดติดตาม | กันท้ายช่วงก่อนเวลาเริ่ม; save/reload ตารางและ availability ผ่านใน browser |
| รับเคส | เห็นชื่อ รหัสเคส เหตุผล เวลา และสถานะ; เปิดเคสตรงคน | ค้นหา/filter ได้ เคสสาธิตเปิดได้ เคสอื่นยังปิดไว้ |
| ก่อนปรึกษา | ทบทวนข้อมูลตัวตน consent ประวัติยา แพ้ยา โรคประจำตัว รูปและประวัติครั้งก่อน | มีข้อมูลและแท็บให้ดู แต่เป็น fixtures; ยังไม่มี authoritative verification workflow |
| ตัดสินใจรับ/ส่งคืน | รับเคสหรือส่งคืนพร้อมเหตุผลและผู้รับผิดชอบ | Reassign ปัจจุบันนำกลับ dashboard/ซ่อน incoming เท่านั้น; ยังไม่ใช่ queue transaction |
| เข้าห้อง | เห็นคนไข้/ตัวตนชัด ทดสอบอุปกรณ์ รับมือ no-show/permission/network failure | mic/camera/leave/reconnect UI ผ่าน; ไม่มีหลักฐานสื่อสาร media จริงหรือ no-show lifecycle |
| ระหว่างปรึกษา | วิดีโอ แชต และบันทึกส่วนตัวแยกชัด; บันทึกไม่หาย | SOAP เก็บร่างใน session และแสดงผลล้มเหลวจริงแล้ว; ไม่มี server record หรือ multi-device sync |
| เลือกยา | ค้นหาชื่อ/ยี่ห้อ/SKU เพิ่ม ลบ ตรวจจำนวนและวิธีใช้ | editor อยู่เหนือแชต; live search และเลือก/แก้/ลบผ่าน; validation เพิ่มแล้ว |
| คุยแผนกับคนไข้ | ส่ง snapshot ตัวอย่างใบสั่งยาเข้าแชต แยกจากการยืนยันจริง | ส่งรายการปัจจุบันจริงและข้อความร่าง; แก้รายการใหม่ไม่เปลี่ยน snapshot เก่า; เป็น local chat เท่านั้น |
| ทบทวนคำสั่งยา | เห็นยา dose/strength route frequency duration quantity และเงื่อนไขเติมยา | มีชื่อยา จำนวน และวิธีใช้ข้อความอิสระ; ยังไม่มี structured clinical fields/validation ครบ |
| จบแบบมียา | ทบทวน → บันทึก → ยืนยันคำสั่งซื้อ; แก้ไขต้องบันทึกใหม่ | ผ่าน; invalid/empty blocked; duplicate confirm event ในหน้าเดียวถูกกันแล้ว |
| จบแบบไม่มียา | บันทึกสรุปพร้อมคำแนะนำ ไม่สร้าง order | ผ่าน UI closeout; ต้องต่อ server record |
| ส่งต่อ | ระบุเหตุผล ความเร่งด่วน ปลายทาง และการรับทราบ | required destination/acknowledgement ผ่าน; ไม่ยืนยันว่าคนไข้ได้รับจริง |
| หลังจบ | แสดงงานเสร็จ/รอชำระแยกกัน ติดตามและเปิดประวัติได้ | golden state สื่อสารใน browser เดียวได้; ไม่ใช่ payment หรือ order backend |
| ติดตามผล | นัดใหม่ ดูการตอบสนอง ปรับแผน พัก/กลับมารักษาต่อ | มี follow-up list/filter แต่วัน/จำนวนเป็น fixture; ยังไม่เชื่อม pause/resume จาก patient portal |
| เอกสาร | ออก/ตรวจ/ลงนามใบสั่งยา ใบรับรองแพทย์และเอกสารที่เกี่ยวข้อง | ลายเซ็นอัปโหลดเป็นภาพ preview; ยังไม่มี signature/version/revoke workflow จริง |
| ตรวจสอบย้อนหลัง | ใครเปลี่ยนอะไร เมื่อไร ทำไม; ส่งออกได้ตามสิทธิ์ | audit CSV ผ่าน แต่รายการเป็น demo/in-page ไม่ใช่ immutable audit log |
| จบงาน | บันทึกค้างแจ้งชัด ออกจากระบบ ไม่เปิดข้อมูลค้างให้คนถัดไป | มี signout UI; session/security/access expiry ต้องทำหลังบ้าน |

## บั๊กที่แก้รอบนี้

| ระดับ | ทำซ้ำก่อนแก้ | ผลเดิม | ผลหลังแก้ |
|---|---|---|---|
| P1 | consult → แก้ SOAP → reload | ขึ้น saved แต่ค่าหาย | เก็บ session draft, restore, แจ้ง failed save เมื่อ storage ใช้ไม่ได้; copy ไม่อ้างว่าเข้าเวชระเบียนแล้ว |
| P1 | แก้ยา/วิธีใช้ → reload | ร่างกลับเป็น fixture | เก็บร่างใน browser session; ไม่อ้างว่าเป็นใบสั่งยาที่ลงนามแล้ว |
| P1 | จำนวน 0/ทศนิยม หรือวิธีใช้ว่าง → ส่ง/บันทึก | validation ไม่เพียงพอ | ต้องเป็นจำนวนเต็มบวกและมีวิธีใช้; กั้นทั้ง preview/save/confirm |
| P1 | แก้ข้อมูลแพ้ยาใน preconsult → consult | ข้อความ allergy เดิมยังค้าง | ห้องปรึกษาใช้ข้อความแพ้ยาที่แก้แล้ว |
| P2 | แก้ follow-up → สลับภาษา | fixture callback เขียนทับ | รักษาค่าที่แพทย์แก้แล้วระหว่าง redraw |
| P2 | กดยืนยัน order ซ้ำในหน้าเดิม | มีโอกาสส่ง event ซ้ำ | consume saved state ก่อน complete; backend idempotency ยังต้องทำ |

## งานที่ยังไม่พร้อมและต้องจัดลำดับก่อนใช้จริง

1. **P1 — Backend patient/encounter binding:** ทุก note, chat, prescription, allergy, consent และ attachment ต้องผูก encounter/doctor/patient และตรวจสิทธิ์ฝั่ง server; fixture หนึ่งเคสและ browser session ไม่เพียงพอ
2. **P1 — Clinical prescribing contract:** ให้ทีมแพทย์/เภสัชกำหนด schema dose/route/frequency/duration/quantity/refill และการตรวจข้อมูล ไม่ให้ระบบถือ default จากตัวอย่างว่าเป็นคำสั่งแพทย์; allergy/interactions/catalog/stock ต้องมาจากแหล่งที่รับรอง
3. **P1 — Real save/send/sign semantics:** บันทึก/ส่งสำเร็จต้องมาจาก server acknowledgement มี failure/retry/offline/conflict state; digital signing, revisions, cancellations และ audit ต้องเชื่อมจริง
4. **P1 — Video/chat lifecycle:** permission denied, reconnect, unavailable patient, no-show, failed message, delivery status, attachments และการรักษาร่างเมื่อสายหลุด
5. **P1 — Follow-up and program pause integration:** ผูก doctor availability กับ booking/reservation และคำขอพัก/กลับมารักษาต่อจากคนไข้; ขณะนี้สองส่วนเป็น fixtures คนละ flow
6. **P2 — Reassign and consultation link:** ปุ่มปัจจุบันเพียงเปลี่ยน UI/เพิ่ม log; ต้องมี reason, destination, transaction result และการติดตามงานที่ส่งต่อ
7. **P2 — Documents:** physician-owned certificate workflow, preview/sign/version/download/error; ภาพลายเซ็นยังไม่ใช่การลงนาม
8. **P2 — Placeholder controls:** สัปดาห์นี้/Refresh ใน follow-ups และบาง filter ช่วงเวลาใน audit ยังไม่มี behavioral coverage ที่พิสูจน์ได้ ไม่ควรนับเป็นฟีเจอร์เสร็จ
9. **P2 — UX density:** desktop ควรใช้พื้นที่วิดีโอ/แชตกับ panel ข้อมูลผู้ป่วยแบบสลับแท็บ; บนมือถือ editor หลายยาทำให้แชตอยู่ล่างมาก ควรมี jump-to-chat / ยุบร่างยา หลังยืนยันรูปแบบกับทีม
10. **P2 — Accessibility and language:** ทดสอบ keyboard-only, focus trap/return, screen reader, Thai/English ครบทุก modal ต่อ; รอบนี้ตรวจ render และ action สำคัญ ไม่ใช่ accessibility certification

## หลักฐานและขอบเขต

- `evidence-doctor-audit/routes.json`: 50 route/runtime checks doctor + admin shared surfaces, 390/1440px; **เป็น navigation/render เท่านั้น**
- `evidence-doctor-audit/actions.json`: 13 behavior scenarios (doctor 11, admin regression 2): OTP demo, prescription golden state, schedule, availability, profile, photo/signature, referral, no-medicine, audit export, filters, reassign UI
- `evidence-doctor-audit/lifecycle.json`: 10 focused regression scenarios: SOAP/reload/failure, invalid Rx, draft/reload, immutable preview, search/duplicate, media controls, follow-up edit, responsive editor, allergy propagation, dirty/duplicate confirmation
- UI media tests ตรวจการเปลี่ยนสถานะของ controls เท่านั้น ไม่ได้ทดสอบสายโทรจริง
- Reassign test ยืนยัน navigation เท่านั้น ไม่ได้พิสูจน์การย้ายคิว
- ไม่ได้ตรวจความถูกต้องทางคลินิกของ fixture doses, drug catalog, ข้อบ่งใช้ หรือกฎหมาย และไม่มีการรักษา/ส่งข้อความถึงคนไข้จริง
- ไม่ได้อ่านวิดีโอ/คู่มือภายนอกใหม่ในรอบนี้; ใช้ code, handoff contract และ user requests ที่มีอยู่

## แนวทาง UX ที่แนะนำ

ให้หน้าปรึกษามีงานหลักเรียงชัด: **ตรวจข้อมูล → สนทนา/บันทึก → ร่างยา → ส่งตัวอย่าง → จบการปรึกษา → ยืนยันแผน** ปุ่ม “ส่งตัวอย่าง” กับ “ยืนยันใบสั่งยา” ต้องเป็นคนละ action และแสดงสถานะ draft/sent/signed อย่างชัดเจน ปุ่มจบควรเลือกได้ทั้งมียา ไม่มียา และส่งต่อ ทุกทางต้องรักษางานที่เขียนแล้วและบอกผลบันทึกจริง
