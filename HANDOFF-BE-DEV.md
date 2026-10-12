# ส่งต่อBE DEV — 11 ตุลาคม 2026

## สิ่งที่รวมมา

- Patient app: partner insurance/self-pay, direct intake, appointment, consultation, payment/address/tracking, activity/documents, notifications, CSAT, program pause/resume
- Doctor portal: queue, preconsult, room/chat UI, SOAP, medicine search/editor + draft preview, prescribe/save/confirm, no-medicine/referral closeout, follow-ups, schedules/profile/audit
- Admin portal: review prototype, local demo operations/settings/editorial tools; ขอบเขตการทำงานจริงดู integration matrix
- Final brand assets, ตัวอย่าง PDF, UI contracts, status/message mapping และ QA evidence

## การเปลี่ยนแปลงล่าสุดที่ต้องรักษา

- แฟ้มหน้า home และ refill ใช้รูปทรงร่วมกัน กระดาษซ้อนกระจายไปทางขวามากขึ้น; หน้า home เป็น design reference
- ยาทั้งหมดที่เติมได้ใน refill เป็น secondary CTA; ลบข้อความ helper เรื่องจำนวนยาจาก modal ตาม review
- ใบสั่งยาใช้ pill icon; เอกสารการปรึกษาใช้ clipboard-list ตาม activity categories
- Mobile bottom sheet มี drag bar; desktop ไม่มี; shared modal close behavior และ preview ในพื้นที่จอด้านขวา
- ชื่อสถานะต้องตรงกับ progress เช่น กำลังจัดส่ง; ปุ่มดูตำแหน่งสูงเท่า status tag
- นัดหมายเรียงเวลาที่มีจากซ้ายในแต่ละชั่วโมง
- ประวัติเป็น “ปรึกษาวันที่…”; พักโปรแกรมอยู่กึ่งกลางล่างสุดนอกการ์ด; paused folder อยู่ท้ายรายการ
- Resume เสนอเวลาจาก fixture ให้ยืนยันก่อนเปิด active; ยังไม่ใช่ doctor booking API
- CSAT สี่หัวข้อ; ส่งเสร็จเปิด feedbackdone
- Doctor medicine editor อยู่เหนือแชต: ค้นหา/เพิ่ม/ลบ/แก้จำนวนและวิธีใช้ → ส่ง snapshot ร่างเข้าแชต → ยังไม่เป็น order จน save/confirm
- SOAP และ prescription drafts เก็บใน browser session, invalid Rx ถูกกั้น, allergy ในห้องใช้ข้อมูลที่แก้, แก้ follow-up แล้ว fixture ไม่เขียนทับ

## ต้องทำต่อก่อน production

1. Auth/RBAC และการผูก patient/encounter/doctor ฝั่ง server; ตอนนี้ doctor golden demo หนึ่งเคสเป็นหลัก
2. Persist/version/conflict/retry สำหรับเวชระเบียน แชต และใบสั่งยา; ป้องกัน duplicate order ฝั่ง server
3. ต่อ media/chat จริง พร้อม permission denied, no-show, reconnect, failed send และ delivery state
4. ให้ทีมแพทย์/เภสัชยืนยัน structured prescription schema/catalog/clinical validation; fixture ไม่ใช่คำแนะนำรักษา
5. ต่อ signing, audit log, certificate generation/revocation และเอกสารจริง
6. นัดหมาย/availability/reservation และ pause/resume ข้าม patient-doctor; ไม่ใช้ local fixture เป็น source of truth
7. Insurance eligibility, payment/webhooks/refund, shipping quote, stock และ pharmacy fulfillment จริง
8. ปุ่มสาธิตบางส่วน เช่น reassign/send-link/time filters ต้องต่อ action จริง; อย่านับ toast หรือเปลี่ยนหน้าเป็น transaction สำเร็จ
9. ตรวจ accessibility/keyboard/screen reader และ TH/EN ทั้งระบบก่อน acceptance; ยังไม่ผ่าน certification

## QA ที่มีหลักฐาน

- [Night QA](b2c/handoff/QA-NIGHT-2026-10-11.md): B2C contract 170, chrome consistency 114 และ targeted suites ตามวันที่ระบุ เป็นผล ณ snapshot ในรายงาน ไม่ใช่การรันครบใหม่ในวันแพ็ก ZIP
- [Doctor audit](cms/DOCTOR-UX-AUDIT-2026-10-11.md): route/render 50, action 13, lifecycle 10 ผ่าน; หมวดแรกรวม doctor/admin และไม่พิสูจน์ action
- Doctor lifecycle 10 scenarios ตรวจซ้ำบนเว็บเผยแพร่ผ่านหลัง audit fixes: [หลักฐาน live](cms/evidence-doctor-audit/lifecycle-live.json)
- [Pause/resume QA](b2c/handoff/QA-PROGRAM-PAUSE-2026-10-11.md)
- [ข้อผิดพลาดและ integration boundaries](b2c/handoff/ERROR-EDGE-CASES.md)

## วิธีใช้ชุดนี้

เริ่มจาก README.md และ canonical paths เท่านั้น ZIP กับ branch เป็น snapshot เดียวกัน ไม่มี .git, node_modules, browser profile หรือข้อมูลจาก session ผู้ใช้ใน ZIP รหัส demo อยู่ใน source ตามลักษณะ prototype; ไม่ใช่ secret สำหรับระบบจริง

โปรดอ่านเอกสาร latest ก่อนเอกสารประวัติเก่า รายงานเก่ามีไว้เป็นหลักฐาน ไม่ควรตีความว่า endpoint/auth/payment มีอยู่แล้ว
