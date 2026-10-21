# Krane: page-separated developer handoff

> **21 October 2026 — page source handoff for Tin:** Use this guide for the new editable per-page HTML/JS/CSS and shared libraries. This is regenerated from this branch's own baseline `3beddab450c9a6da9649c75dddce402dbc9cd39d`, not the newer live `gh-pages` app. The original app and styles remain unchanged. Hair scalp screening stays before photos; ED heart and nitrate screening stay in separate steps. Pricing/navigation updates on `gh-pages` are a separate delivery. All screens still mount together in the compatibility runtime; these are not independently mounted production routes. B2C-only scope and the existing backend limitations remain.


สำหรับพี่ทิน: แยก source รายหน้าจากต้นแบบ B2C แล้ว โดยส่วนที่ใช้ร่วมกันยังมีที่แก้เพียงแห่งเดียว ไม่ได้คัดลอก state/router/helper ไปไว้ทุกหน้า

## Start here

- `pages/<screen-id>/index.html`: markup ของหน้านั้น
- `pages/<screen-id>/page.js`: ฟังก์ชันและ initializer ที่เป็นของหน้านั้น
- `pages/<screen-id>/page.css`: CSS เฉพาะหน้า; build จะวางกลับในลำดับ cascade เดิม
- `pages/<screen-id>/dependencies.json`: รายชื่อสิ่งที่ต้องใช้จาก library กลาง พร้อมข้อจำกัด lifecycle
- `shared/lib/`: navigation, intake, category question templates, identity, address, clinical, orders, UI helpers
- `shared/runtime.js`: state กลาง, bootstrap และลำดับ initialization ที่ใช้ร่วมกัน
- `shared/shell.html`: shell, dialog/overlay กลาง, assets และตำแหน่งประกอบแต่ละหน้า
- `manifest.json`: รายชื่อหน้าและการประกอบทั้งหมด

Some page scripts contain only a comment because the page uses shared behavior without page-specific functions. Do not duplicate that behavior just to fill the file.

## Run the working handoff

From the repository root:

```sh
npm ci --prefix developer-handoff
npm run build --prefix developer-handoff
python3 -m http.server 8080
```

Open:

- Developer directory: `http://localhost:8080/developer-handoff/index.html`
- Working app: `http://localhost:8080/b2c/krane-b2c-handoff.html?public=1#landing`
- Screen directory: `http://localhost:8080/b2c/krane-b2c-handoff.html?public=1&screens=1#landing`
- Example direct intake: `http://localhost:8080/b2c/krane-b2c-handoff.html?public=1&entry=direct&fresh=1&category=hair-skin#intake1`
- Partner entry: `http://localhost:8080/b2c/krane-b2c-handoff.html?public=1&entry=partner&fresh=1#consent-terms`

Use HTTP, not `file://`. Guards remain active. A deep link to a protected step may correctly take you to signup/consent first. Demo shortcuts remain prototype-only.

## Editing one page

1. Edit its HTML, JS or CSS under `pages/<screen-id>/`.
2. Edit a shared helper only in `shared/lib/` or shared state/bootstrap in `shared/runtime.js`.
3. Run `npm run build --prefix developer-handoff`.
4. Test the app route at desktop and mobile widths, including entering from a prior screen, going back and re-entering.
5. Run `npm run catalog --prefix developer-handoff` when dependencies or page functions change.

Edit existing CSS rules in place inside their annotated blocks. New page-specific CSS may be written outside those blocks; the build includes it once in `b2c/krane-handoff-pages.css`. Do not delete the block boundary comments because they preserve the existing cascade.

The generated `b2c/krane-b2c-handoff.html`, `b2c/krane-handoff-components.css` and `b2c/krane-handoff-pages.css` are build outputs. Do not edit them. The production prototype `b2c/krane-b2c.html` and its styles remain unchanged.

Page HTML files are **source fragments**, composed by the shared shell. They are not 62 independent patient apps. JavaScript is separated into actual page/shared files and loaded once; it is not copied into the HTML outputs. The compatibility runtime currently mounts all screen fragments before initializing and keeps them mounted. This avoids changing existing guards, cross-screen DOM references and event timing during the handoff. See [DEPENDENCIES.md](DEPENDENCIES.md) before changing the mounting model.

## Integration boundary

This package removes manual source extraction. It does not choose React/Vue/Laravel or a backend framework on your behalf. Include the page template and its dependency contract within your chosen app, or use the supplied build while replacing prototype adapters with agreed backend services.

The state/router is a **shared classic-script lexical runtime**, not ES-module imports. Load through the supplied shell/build; do not run a page script alone or reorder initialization calls. Moving to lazy-mounted components requires the lifecycle work described in DEPENDENCIES.md.

Auth, insurance, payment, clinical records and browser storage remain prototype adapters. No real patient data, production authentication or payment acceptance is established. The existing [developer handoff](../b2c/handoff/DEVELOPER-HANDOFF.md), [intake flow map](../b2c/handoff/INTAKE-FLOWS.md) and [screen-view contract](../b2c/handoff/screen-view-contract.json) remain relevant.

## Verification

```sh
# Initial migration proof against the original, unchanged prototype:
npm run check:migration --prefix developer-handoff
# Execute original and refactored local scripts in a DOM emulator:
npm run test:dom --prefix developer-handoff
# Real Chromium regression, mobile and desktop:
npx --prefix developer-handoff playwright install chromium
npm run test:browser --prefix developer-handoff
```

`check:migration` intentionally proves equivalence to the original snapshot. After intentional product changes, review the resulting differences instead of changing the old prototype just to make this migration check pass. DOM/runtime checks do not establish visual, accessibility, native-control or real-provider correctness. See [QA.md](QA.md) for actual run evidence.

The one-time extraction tools in `tools/extract.mjs` and `tools/refine-page-ownership.mjs` explain the migration. Do not rerun them over edited source. Normal work uses `build.mjs`.
