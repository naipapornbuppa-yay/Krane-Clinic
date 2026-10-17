# Client content update — 17 October 2026

## Scope
Prepare public content for review; keep doctor/admin portal out of the BE DEV handoff. No backend integration. The supplied conversation mentions a 12 December launch target; treat this as a discussion target, not a confirmed delivery commitment.

## Sources verified
- Program Detail Page Outline: https://docs.google.com/document/d/1PGo7u-DcgzdzixqNkrJrZyykrdNcu3S-BNusP-Vn58Q/edit — updated 15 October. Re:Body is populated; Re:Hair and Re:Flow are headings without detailed copy.
- Doctor info: https://docs.google.com/spreadsheets/d/1PXOR0Kv_wnURI-HKDcjb_4WseRYq4ErjEKtEiGWsc14/edit — updated 13 October. Contains Kittin, Kornphaka and Phahol. No image links in the populated cells inspected.

## Applied / compared
- Re:Body already includes the five treatment steps, 9,999-baht initial medicine price and shipping exclusion, first consultation free / subsequent 350-baht FAQ, follow-up and conditional refill.
- Clarified the hero's matching to an available regular doctor after assessment.
- Expanded coaching copy to include eating habits and calorie counting.
- Clarified no monthly membership, payment on medicine orders, and physician assessment before prescribing.
- Kept source placeholder licence number 12345 out of the published page.

## Not complete / review questions
- Health Library: shared folder not found through connected Drive search or mounted Krane folder; need exact shared URL to import real articles. Existing articles must not be described as the newly supplied library.
- Doctor photos: no verified new portrait assets found; keep existing portraits until the actual shared assets are accessible.
- Doctor roster: reconcile new three-doctor sheet with the existing four public profiles; confirm whether Phairat and Chawalit are removed or remain additional doctors before replacing the roster.
- Re:Hair / Re:Flow: detailed source copy is still missing from the outline.
- Outline's BMI eligibility, three-hour cold-chain promise and medical outcome claims require reconciliation with existing clinical/operational rules before making stronger public promises.
- Real reviews / before-and-after / videos remain a source-content dependency; do not invent testimonials.

## Validation
Run b2c/tools/service-pages-qa.cjs for seven conditions plus safety page at desktop/mobile sizes. Record final execution outcome in the chat. This note does not certify full content readiness.

## Browser discovery — Shared with me
The connected Drive search omitted a folder that is visible in the signed-in browser under Shared with me:
- Krane Clinic Health Library: https://drive.google.com/drive/u/0/folders/1DG01j8h_EvPz6-zEEk5NR8-1xJ-h6yQP
- Its visible folders are Kittin (หมอคิว), Kornphaka (หมอพลอย), and Phahol (หมอวิน).
- Kittin folder: https://drive.google.com/drive/u/0/folders/13PB0JqMcj0BwJwkXaN-sJoyxu29YkBgL — five documents labelled [ตรวจ] ED 01–05: sildenafil, oral ED medicines, losing erection during intercourse, low testosterone and ED, and unregulated sexual-performance medicines. A [ตรวจ] label is not evidence of final editorial approval.
- Separate recently shared jpeg folder: https://drive.google.com/drive/u/0/folders/16zlLHDFjMum89q3beTYMvoxhr6CqRLsl — listing shows _1010001.JPG through _1010050.JPG. Image previews failed to load, so these are unverified photo candidates, not confirmed doctor portraits.
- Connector fetch for the Health Library folder returns 404 even though the signed-in browser can list it. Subsequent browser image opening remained on Working and navigation returned ERR_ABORTED. Do not interpret this as missing client files or ask the client to re-share the already found Library URL.
No newly discovered article or photo has been imported or published yet.

## Current implementation — 17 October, Health Library import
Supersedes the earlier "not imported" status above.
- Browser export retrieved all 15 manuscripts: 5 hair loss, 5 obesity, 5 ED. Exact source snapshots are in docs/source-content/20261017/.
- Added the 15 manuscripts to the shared article seed. Landing featured cards, doctor-directory article links and the three corresponding service reading lists now open the supplied content.
- These are labelled as review manuscripts, not certified final medical publication. Editorial attribution is Krane Editorial; omitted placeholder reviewer licence numbers and the unnamed pharmacist attribution. Did not assign a fictional doctor as author.
- Hair loss 01 contains overlapping "100-200 50–100" in the key-points bullet. Omitted that single unresolved bullet from the rendered preview; source snapshot is preserved. The main body remains intact.
- All 15 article detail views render at 1440px and 390px without horizontal page overflow; no xxxxx placeholder appears in article body. Landing featured title matches the shared seed. Service route regression covers seven variants plus safety at both viewports.
- Portraits were found in Product Images (IMG_8525/8534/8539 and IMG_8548/8554/8561); previous assumption that these were medicine images was incorrect. Local copies exist, but no portrait/name association is published. Automatic approval review blocked an earlier proposed identity mapping / roster replacement. No doctor has been replaced or removed.
- BE DEV handoff branch, backend and doctor/admin portal remain outside this content update.
- Updated existing Kornphaka and Phahol education text from Doctor info consistently in landing preview, directory preview and full profiles. Did not infer portrait identity or replace any other doctor.
- English cards/titles are translated. Full supplied manuscripts are Thai-only: English detail explicitly tells readers to switch to Thai for the full source rather than presenting an invented clinical translation.
- First contract execution found missing English coverage; fixed locale-aware article rendering plus the new public-page strings and reran the check. See final chat report for the completed result.
