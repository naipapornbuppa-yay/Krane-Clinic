# Krane Clinic — ชุดส่งต่อBE DEV

ชุดส่งต่อนี้แยกจาก branch เว็บที่เผยแพร่ ใช้โค้ดจาก `3b667fb` (11 ตุลาคม 2026) พร้อมเอกสารและ QA ล่าสุด

## เริ่มใน 2 นาที

ต้องมี Python 3 เปิด Terminal ที่โฟลเดอร์นี้แล้วรัน:

```sh
python3 -m http.server 8000
```

เปิด URL ตามงาน:

- ผู้รับบริการ: http://localhost:8000/b2c/krane-b2c.html?screens=1&entry=partner#profile
- แพทย์: http://localhost:8000/cms/cms-doctor.html#dashboard
- Admin: http://localhost:8000/cms/cms-admin.html

ใช้ HTTP server เพื่อให้ assets, modules และ shared browser state ทำงานร่วมกัน อย่าเปิด HTML ด้วย file://

## แก้ไฟล์ไหน

| งาน | แหล่งที่ดูแลอยู่ |
|---|---|
| Patient app | `b2c/krane-b2c.html` และ CSS/JS ใน `b2c/` |
| Doctor portal | `cms/cms-doctor.html`, `cms/doctor-core-flow.js` |
| Admin portal | `cms/cms-admin.html` และ modules ใน `cms/` |
| Shared demo state | `krane-golden-fixture.js` และ `krane-golden-{patient,doctor,admin}.js` |
| Brand assets | `assets/brand-final/`, ดู `assets/BRAND-ASSETS.md` |

**อย่าแก้ `public/` หรือ HTML/CSS เก่าระดับ root แทน canonical files ข้างบน** เก็บไว้เพื่อรักษา compatibility/reference ของ snapshot ไม่ใช่แหล่งหลักสำหรับพัฒนาต่อ

Landing page ยัง WIP ไม่ใช่งานที่อนุมัติส่งมอบ การมีไฟล์อยู่ไม่ได้หมายความว่าหน้านั้น final

## อ่านก่อนเริ่มพัฒนา

1. [สรุปส่งต่อและรายการงานค้าง](HANDOFF-BE-DEV.md)
2. [Developer start here](b2c/handoff/START-HERE.md)
3. [พฤติกรรมล่าสุด — ใช้ทับคำอธิบายเก่าที่ขัดกัน](b2c/handoff/LATEST-B2C-HANDOFF.md)
4. [Flow intake / partner / direct](b2c/handoff/INTAKE-FLOWS.md)
5. [Backend integration matrix](b2c/handoff/CROSS-SURFACE-INTEGRATION-MATRIX.md)
6. [Doctor UX audit](cms/DOCTOR-UX-AUDIT-2026-10-11.md)
7. [UI rules](b2c/UI-RULES.md)

## สถานะการส่งมอบ

นี่คือ **frontend prototype + developer handoff** ไม่ใช่ production medical system ข้อมูลคนไข้/OTP/ยา/การชำระเงินใน demo เป็น fixtures; browser storage ไม่ใช่ backend หรือระบบตรวจสิทธิ์ อ่านข้อจำกัดและงานค้างใน HANDOFF-BE-DEV.md ก่อนต่อ API

ไม่มี credentials และไม่มี node_modules ใน ZIP ใช้ข้อมูลสมมติสำหรับ QA เท่านั้น

## รัน QA (ต้องติดตั้ง Node.js/npm และ Chrome)

```sh
npm install
npm run check:strings
CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm run check:ui
node b2c/tools/cms-actions-qa.mjs
node b2c/tools/doctor-lifecycle-qa.mjs
```

สามเครื่องมือ CMS ใช้ Chrome path บน macOS เป็นค่าเริ่มต้น ถ้าใช้ OS อื่นให้ตั้ง `CHROMIUM_PATH` เป็น Chrome executable ที่ติดตั้งอยู่ (doctor-lifecycle และ cms-actions รองรับตัวแปรนี้) QA เป็น optional สำหรับเปิดหน้าเว็บ; static frontend ไม่ต้อง build

branch นี้เป็น snapshot ส่งต่อ ไม่ได้เชื่อมให้ deploy อัตโนมัติไป `gh-pages` ห้าม push ทับ branch เว็บจนตกลง release กัน
