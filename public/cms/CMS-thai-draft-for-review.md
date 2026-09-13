# CMS Thai copy, DRAFT for review

> **STATUS: UNREVIEWED MACHINE DRAFT. DO NOT SHIP.**
> Nothing in this file has been applied to Figma or written into `i18n.js`.
> Every Thai string below was drafted by Claude, not pulled from the existing
> dictionary, and none has been clinician or native-speaker reviewed.

## Why this file exists

WORKING-RULES rule 5 makes Thai the default language for both apps, so the CMS
screens in Figma (`cms / doctor + admin`) were localised from `cms/i18n.js`.
Of the 185 translatable strings on those 19 screens:

- **72 had a real entry in `i18n.js`** and were applied directly (205 text nodes).
- **113 had no entry.** About a dozen of those are proper nouns that should stay
  as they are. The remaining **101 are drafted below** and are still showing in
  English on the Figma screens.

## How to use this

1. Read down the **Draft Thai** column and correct anything that is wrong.
2. Approved rows go into `cms/i18n.js` in the `TH` object, keyed by the exact
   English string, so the runtime toggle picks them up.
3. Once `i18n.js` has them, the Figma screens can be re-localised in one pass.

Terminology follows the conventions already in the 1,072 `i18n.js` entries:
ผู้ป่วย (patient), แพทย์ (doctor), การปรึกษา (consultation), การติดตามผล
(follow-up), ร้านยา (pharmacy), ช่องทาง (channel), แผนการรักษา (treatment plan),
สถานะ (status), คืนเงิน (refund), ใช้งานอยู่ (active), เสร็จสิ้น (done).

## Do not translate

These stay in Latin script: `Krane`, `Dr. Narin T.`, `Fascino`, `AskMacy`,
`B2C`, `MTL`, `Finasteride`, `Minoxidil`, `Dutasteride`, `KR-10293`, `KRANE10`,
`FIRSTCONSULT`, `WELCOME50`, all dates, times, prices and percentages.
`Dermatology` is listed below because a Thai specialty name is likely wanted,
but confirm it against how the client names specialties elsewhere.

---

## 1. Navigation and chrome

| English | Draft Thai | Screens |
|---|---|---|
| Today overview | ภาพรวมวันนี้ | all Doctor |
| Follow-ups | การติดตามผล | all Doctor |
| Calendar | ปฏิทิน | all Doctor |
| Search patients, orders, articles… | ค้นหาผู้ป่วย คำสั่งซื้อ บทความ… | all 19 |
| Operations | ปฏิบัติการ | all Admin |
| Operations overview | ภาพรวมปฏิบัติการ | all Admin, admin-cases |
| Catalogue | แคตตาล็อก | all Admin |
| System | ระบบ | all Admin |
| System map | แผนผังระบบ | all Admin, admin-sysmap |

## 2. Doctor queue and follow-ups

| English | Draft Thai | Screens |
|---|---|---|
| Today's patient schedule | ตารางผู้ป่วยวันนี้ | doctor-dashboard |
| Time | เวลา | doctor-dashboard, doctor-queue |
| Ready | พร้อม | doctor-dashboard, doctor-queue |
| Follow-up cases | เคสติดตามผล | doctor-dashboard, doctor-followups |
| Queue | คิว | doctor-queue |
| Intake | แบบประเมิน | doctor-queue |
| Wait | เวลารอ | doctor-queue |
| Complete | ครบถ้วน | doctor-queue |
| Partial | ไม่ครบ | doctor-queue |
| Due | ถึงกำหนด | doctor-followups |
| Follow-up reason | เหตุผลการติดตามผล | doctor-followups |
| Last consultation | การปรึกษาครั้งล่าสุด | doctor-followups |
| Due date | วันครบกำหนด | doctor-followups |
| 3-month review | ทบทวนผล 3 เดือน | doctor-followups |
| Dose check | ตรวจสอบขนาดยา | doctor-followups |
| Overdue | เกินกำหนด | doctor-followups |
| Side effect check | ตรวจสอบผลข้างเคียง | doctor-followups |
| 3 patients are due for a follow-up review this week. | มีผู้ป่วย 3 รายที่ถึงกำหนดติดตามผลในสัปดาห์นี้ | doctor-dashboard |
| Set your working hours and confirm your profile so the matching engine can route patients to you. | ตั้งเวลาทำงานและยืนยันโปรไฟล์ของคุณ เพื่อให้ระบบจับคู่ส่งผู้ป่วยมาหาคุณได้ | doctor-empty |

## 3. Clinical

| English | Draft Thai | Screens |
|---|---|---|
| Medicine | ยา | doctor-record, doctor-prescribe |
| Directions | วิธีใช้ | doctor-record |
| Qty | จำนวน | doctor-record |
| Apply twice daily | ทาวันละ 2 ครั้ง | doctor-record |
| Video consultation | การปรึกษาผ่านวิดีโอ | doctor-consult |
| Patient context | ข้อมูลประกอบของผู้ป่วย | doctor-consult |
| Strength | ความแรง | doctor-prescribe |
| Channel status | สถานะช่องทาง | doctor-prescribe |
| Approved | อนุมัติแล้ว | doctor-prescribe |
| Restricted | จำกัดการใช้ | doctor-prescribe |
| Patient calendar | ปฏิทินผู้ป่วย | doctor-schedule |
| Month view | มุมมองรายเดือน | doctor-schedule |
| Hair thinning at the crown, 6 months to 2 years, moderate severity. No prior treatment. | ผมบางบริเวณกลางศีรษะ ระยะเวลา 6 เดือน ถึง 2 ปี ความรุนแรงปานกลาง ไม่เคยรักษามาก่อน | doctor-preconsult |
| No known drug allergies. No contraindications flagged by screening. | ไม่มีประวัติแพ้ยา ไม่พบข้อห้ามใช้จากการคัดกรอง | doctor-preconsult |
| First consultation 2 Apr 2026. Review 12 May 2026. | ปรึกษาครั้งแรก 2 เม.ย. 2026 ทบทวนผล 12 พ.ค. 2026 | doctor-preconsult |
| Patient reports gradual thinning at the crown over 8 months. No systemic symptoms. | ผู้ป่วยแจ้งว่าผมบางบริเวณกลางศีรษะแบบค่อยเป็นค่อยไปในช่วง 8 เดือน ไม่มีอาการทางระบบ | doctor-record |
| 1 image uploaded, scalp area, verified. | อัปโหลดรูป 1 ภาพ บริเวณหนังศีรษะ ตรวจสอบแล้ว | doctor-record |
| Diagnosis: androgenetic alopecia. Plan issued and accepted by patient. | การวินิจฉัย: ผมร่วงจากพันธุกรรม ออกแผนการรักษาและผู้ป่วยยอมรับแล้ว | doctor-record |
| Video call in progress. Chat is available from the floating action button. | กำลังปรึกษาผ่านวิดีโอ เปิดแชทได้จากปุ่มลอย | doctor-consult |
| Intake summary, safety screening and prior consultations shown alongside the call. | แสดงสรุปแบบประเมิน การคัดกรองความปลอดภัย และประวัติการปรึกษาไว้ข้างหน้าจอสนทนา | doctor-consult |
| Select medicines, set directions and duration, then send the plan to the patient for acceptance. | เลือกยา กำหนดวิธีใช้และระยะเวลา แล้วส่งแผนการรักษาให้ผู้ป่วยยอมรับ | doctor-prescribe |
| Confirmed consultations, follow-ups and blocked time across the month. | การปรึกษาที่ยืนยันแล้ว การติดตามผล และช่วงเวลาที่ปิดรับ ตลอดทั้งเดือน | doctor-schedule |

## 4. Doctor profile

| English | Draft Thai | Screens |
|---|---|---|
| Details · Admin-managed | รายละเอียด · จัดการโดยผู้ดูแล | doctor-profile |
| Field | ข้อมูล | doctor-profile |
| Value | ค่า | doctor-profile |
| Name | ชื่อ | doctor-profile |
| Licence | เลขใบอนุญาต | doctor-profile |
| Specialty | สาขาเฉพาะทาง | doctor-profile |
| Dermatology | ตจวิทยา (ผิวหนัง) | doctor-profile |
| Signature on file, used on issued prescriptions. | มีลายเซ็นในระบบ ใช้กับใบสั่งยาที่ออกให้ | doctor-profile |

## 5. Admin operations

| English | Draft Thai | Screens |
|---|---|---|
| Actions required | รายการที่ต้องดำเนินการ | admin-cases |
| Case | เคส | admin-cases |
| Owner | ผู้รับผิดชอบ | admin-cases |
| Support | ฝ่ายสนับสนุน | admin-cases |
| Refund review | ตรวจสอบการคืนเงิน | admin-cases |
| System health | สถานะระบบ | admin-cases |
| Step | ขั้นตอน | admin-fulfilment |
| Order accepted | รับคำสั่งซื้อแล้ว | admin-fulfilment |
| Pharmacy preparing | ร้านยากำลังเตรียม | admin-fulfilment |
| Confirm refund | ยืนยันการคืนเงิน | admin-fulfilment |
| All channels operational. Pharmacy API latency within normal range. | ทุกช่องทางทำงานปกติ ความหน่วงของ API ร้านยาอยู่ในเกณฑ์ปกติ | admin-cases |
| Refund is available while the order has not left the partner pharmacy. | คืนเงินได้ตราบใดที่คำสั่งซื้อยังไม่ออกจากร้านยาพันธมิตร | admin-fulfilment |

## 6. Admin users and content

| English | Draft Thai | Screens |
|---|---|---|
| All users | ผู้ใช้ทั้งหมด | admin-users |
| User | ผู้ใช้ | admin-users |
| Specialty / service | สาขาเฉพาะทาง / บริการ | admin-users |
| Nurse | พยาบาล | admin-users |
| Pre-screening | การคัดกรองเบื้องต้น | admin-users |
| Articles | บทความ | admin-content |
| Hair | ผม | admin-content |
| In review | อยู่ระหว่างตรวจสอบ | admin-content |
| Preparing for your consult | เตรียมตัวก่อนปรึกษาแพทย์ | admin-content |
| Guides | คู่มือ | admin-content |
| Editorial | กองบรรณาธิการ | admin-content |
| Sleep and stress basics | พื้นฐานการนอนและความเครียด | admin-content |
| Sleep | การนอน | admin-content |
| Per-channel medicine lists control what doctors can prescribe. | รายการยาแยกตามช่องทางเป็นตัวกำหนดว่าแพทย์สั่งยาอะไรได้บ้าง | admin-content |

## 7. Pricing and coupons

| English | Draft Thai | Screens |
|---|---|---|
| Items | รายการ | admin-pricing |
| Item | รายการ | admin-pricing |
| Fascino base | ราคาต้นทุน Fascino | admin-pricing |
| Krane price | ราคา Krane | admin-pricing |
| All coupons | คูปองทั้งหมด | admin-coupons |
| Percent | เปอร์เซ็นต์ | admin-coupons |
| Fixed | จำนวนคงที่ | admin-coupons |
| Expired | หมดอายุ | admin-coupons |
| Inactive | ปิดใช้งาน | admin-coupons |

## 8. Channels and system map

| English | Draft Thai | Screens |
|---|---|---|
| Corporate | องค์กร | admin-config |
| Capability mapping | การจับคู่ความสามารถ | admin-sysmap |
| Krane capability | ความสามารถของ Krane | admin-sysmap |
| Verdict | ข้อสรุป | admin-sysmap |
| Note | หมายเหตุ | admin-sysmap |
| Intake & triage | แบบประเมินและการคัดแยก | admin-sysmap |
| Build | สร้างเอง | admin-sysmap |
| Reuse | ใช้ของเดิม | admin-sysmap |
| Forms | ฟอร์ม | admin-sysmap |
| Krane-specific logic | ตรรกะเฉพาะของ Krane | admin-sysmap |
| Telehealth | การแพทย์ทางไกล | admin-sysmap |
| Integrate via API | เชื่อมต่อผ่าน API | admin-sysmap |
| Pharmacy fulfilment | การจัดส่งจากร้านยา | admin-sysmap |
| Orders | คำสั่งซื้อ | admin-sysmap |
| Fascino integration | การเชื่อมต่อกับ Fascino | admin-sysmap |
| Integration model (recommended) | รูปแบบการเชื่อมต่อ (แนะนำ) | admin-sysmap |
| Krane owns the patient experience and clinical flow. AskMacy base modules are integrated behind an API boundary. | Krane เป็นเจ้าของประสบการณ์ผู้ป่วยและกระบวนการทางคลินิก โดยเชื่อมต่อโมดูลพื้นฐานของ AskMacy ไว้หลังขอบเขต API | admin-sysmap |

---

## Notes for the reviewer

- **"Intake"** is drafted as แบบประเมิน to match the B2C dictionary, where the
  patient-facing intake is already called that. If the back office should use a
  more clinical term, change it once here and it stays consistent.
- **"Complete" / "Partial"** describe how much of the intake the patient filled
  in, not the case status. Drafted as ครบถ้วน / ไม่ครบ rather than เสร็จสิ้น so
  they do not collide with the existing เสร็จสิ้น for "Done".
- **"Build" / "Reuse"** on the system map are verdicts in a decision table, so
  they are drafted as สร้างเอง / ใช้ของเดิม rather than as imperatives.
- **"Dermatology"** and any other specialty names should follow whatever the
  client already uses on doctor profiles.
- **Field / Value** are generic table headers. If the profile table gets real
  labels instead, these two rows disappear.
