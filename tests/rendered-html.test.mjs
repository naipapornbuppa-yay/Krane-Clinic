import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { QA_ROUTE_ALIASES } from "../worker/routes.mjs";

const root = path.resolve(import.meta.dirname, "..");
const publicRoot = path.join(root, "public");
const canonicalPages = [
  "b2c/krane-b2c-landing.html",
  "b2c/krane-b2c.html",
  "cms/cms-doctor.html",
  "cms/cms-admin.html",
  "ui-inventory/ui-components.html"
];

function assetFile(fromFile, reference) {
  const clean = reference.split(/[?#]/, 1)[0];
  if (!clean || /['"`+]/.test(clean) || /^(?:https?:|data:|mailto:|tel:|javascript:)/i.test(clean)) return null;
  if (clean.startsWith("/")) {
    const alias = QA_ROUTE_ALIASES[clean.replace(/\/+$/, "")];
    return path.join(publicRoot, alias || clean);
  }
  return path.resolve(path.dirname(path.join(publicRoot, fromFile)), clean);
}

function screenFragment(html, id) {
  const start = html.search(new RegExp(`<section class="[^"]*\\bscreen\\b[^"]*" id="${id}"`));
  assert.ok(start >= 0, `missing #${id}`);
  const next = html.slice(start + 1).search(/<section class="[^"]*\bscreen\b[^"]*" id="[^"]+"/);
  return next < 0 ? html.slice(start) : html.slice(start, start + 1 + next);
}

test("patient app inline JavaScript parses after flow updates", async () => {
  const html = await readFile(path.join(publicRoot, "b2c/krane-b2c.html"), "utf8");
  const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(([, attributes, source]) => !/\btype=["']application\/ld\+json["']/i.test(attributes) && source.trim())
    .map(([, , source]) => source);

  assert.ok(inlineScripts.length, "patient app must retain its inline controller");
  inlineScripts.forEach((source, index) => {
    assert.doesNotThrow(
      () => new vm.Script(source, { filename: `krane-b2c-inline-${index + 1}.js` }),
      `inline patient controller ${index + 1} must parse`
    );
  });
});

test("canonical QA pages do not contain broken local href/src references", async () => {
  for (const page of canonicalPages) {
    const html = await readFile(path.join(publicRoot, page), "utf8");
    const references = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
    for (const reference of references) {
      const file = assetFile(page, reference);
      if (file) await assert.doesNotReject(access(file), `${page}: missing ${reference}`);
    }
  }
});

test("patient app contains unique screens and the guarded partner journey", async () => {
  const html = await readFile(path.join(publicRoot, "b2c/krane-b2c.html"), "utf8");
  const components = await readFile(path.join(publicRoot, "b2c/components.css"), "utf8");
  const screenIds = [...html.matchAll(/<section class="[^"]*\bscreen\b[^"]*" id="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(screenIds).size, screenIds.length, "screen ids must be unique");
  for (const id of [
    "partner-access", "consent-terms", "partner-patient-info",
    "partner-concern", "partner-intake", "partner-review", "partner-nurse",
    "partner-nurse-session", "partner-phr", "plan", "tracking"
  ]) assert.ok(screenIds.includes(id), `missing #${id}`);
  assert.ok(!screenIds.includes("partner-payment-choice"), "payment choice must be integrated into partner confirmation");
  assert.doesNotMatch(html, /id="partner-consent"|data-partner-consent/);
  assert.match(html, /data-go="consent-terms" data-entry-channel="partner"/);
  assert.match(html, /const consentSource=flowState\.entryChannel==='partner' \? 'partner' : 'direct'/);
  assert.match(html, /target==='partner-phr' && !flowState\.partnerNurseComplete/);
  assert.match(html, /data-partner-review-concern/);
  assert.match(html, /target==='partner-insurance' \? 3 : order\.indexOf\(target\)/);
  assert.match(html, /target==='partner-insurance' \? 'insurance'/);
  assert.match(html, /id="partner-patient-info"[\s\S]*data-partner-payment-options[\s\S]*aria-selected="true" data-select data-partner-payment-choice-value="insurance"/);
  assert.match(html, /if\(paymentMethod==='insurance'\) insuranceEntry='partner';[\s\S]*show\(paymentMethod==='insurance' \? 'insurance' : 'partner-concern'\)/);
  assert.match(html, /insuranceEntry === 'partner'[\s\S]*show\('partner-insurance'\)/);
  assert.match(html, /data-go="insurance" data-insurance-entry="partner">ตรวจสอบสิทธิ์ประกัน[\s\S]*data-go="partner-insurance">เลือกกรมธรรม์/);
  assert.match(html, /id="partner-insurance"[\s\S]*พบ 1 กรมธรรม์ที่ใช้ได้กับบริการนี้[\s\S]*data-partner-payment="insurance" data-go="partner-concern"/);
  assert.doesNotMatch(html, /id="insurance-policy-number"|Policy number \(เลขกรมธรรม์\)|placeholder="Policy no\."/);
  assert.match(html, /id="partner-concern"[\s\S]*data-partner-duration-step="-1"[\s\S]*data-partner-duration-unit="วัน"[\s\S]*data-partner-relief-value="ยังไม่ได้ทำ"/);
  assert.doesNotMatch(html, /id="partner-concern-severity"/);
  assert.match(components, /\.partner-duration-units button\[aria-selected="true"\]/);
  assert.match(html, /id="partner-intake"[\s\S]*partner-health-compact[\s\S]*partner-health-grid[\s\S]*partner-clinical-grid/);
  assert.doesNotMatch(screenFragment(html, "partner-intake"), /partner-lifestyle|การสูบบุหรี่หรือดื่มแอลกอฮอล์/);
  assert.match(components, /#partner-intake \.partner-health-grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(html, /data-partner-nurse-complete[\s\S]*ยืนยันและส่งต่อแพทย์/);
  assert.match(html, /flowState\.partnerNurseComplete=true;[\s\S]*flowState\.identityVerified=true;[\s\S]*show\('booking'\)/);
  assert.doesNotMatch(html, /พยาบาล ปรียา/);
  assert.match(html, /viewport-fit=cover/);
  assert.doesNotMatch(html, /class="devicebar"|id="fontPreview"|fontPreviewStacks|krane_font_preview/, "client-facing QA must not expose prototype device or font controls");
  const designTokens = await readFile(path.join(publicRoot, "b2c/design-tokens.css"), "utf8");
  assert.match(designTokens, /--font-thai-base:\s*"Prompt"/);
  assert.match(designTokens, /--font-thai-display:\s*"Prompt"/);
  assert.match(components, /@media\(min-width:781px\)\{[\s\S]*\.stage \.screen--web\{max-width:min\(var\(--desktop-frame\),100%\)\}/);
  assert.match(components, /\.care-journey__steps\{display:grid;width:100%;grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
  assert.match(components, /@media\(max-width:780px\)\{[\s\S]*\.care-journey__current\{display:none\}[\s\S]*\.care-journey__name\{display:block/);
  assert.match(html, /flowState\.phoneOtpPending/);
  assert.match(html, /data-otp-code inputmode="numeric" autocomplete="one-time-code" maxlength="6"/);
  assert.doesNotMatch(html, /maxlength="1"/);
  assert.equal((html.match(/data-otp-cell/g) || []).length, 7);
  assert.match(html, /function renderOtpCells\(input\)\{[\s\S]*cell\.textContent=value\[index\] \|\| ''/);
  assert.match(html, /function prepareFreshOtpChallenge\(\)\{[\s\S]*input\.value='';[\s\S]*input\?\.focus\(\{preventScroll:true\}\)/);
  assert.match(html, /input\.value=input\.value\.replace\(\/\\D\/g,''\)\.slice\(0,6\)/);
  assert.match(html, /if\(id === 'otp'\) prepareFreshOtpChallenge\(\)/);
  assert.match(html, /returnFromPhoneOtp\('partner-patient-info'\)/);
  assert.match(html, /returnFromPhoneOtp\(returnTarget\)/);
  assert.match(html, /class="partner-health-grid"[\s\S]*id="partner-dob" type="date"/);
  assert.match(components, /input\[type="date"\]\.input\{[^}]*min-inline-size:0/);
  assert.match(components, /@media\(max-width:780px\)\{[\s\S]*\.screen__body\{padding:16px\}[\s\S]*\.partner-health-grid\{grid-template-columns:minmax\(0,1fr\);gap:16px\}/);
  assert.match(components, /\.quick-row a \.qic\{[^}]*border-radius:50%[^}]*border:0/);
  assert.match(components, /\.setting-row \.ic\{[^}]*border-radius:50%[^}]*border:0/);
  assert.match(components, /\.notif \.ic\{[^}]*border-radius:50%[^}]*border:0/);
  assert.match(components, /#profile \.screen__body\{background:var\(--color-bg\)\}/);
  assert.match(html, /function hasCurrentConsent\(source\)\{/);
  assert.match(html, /flowState\.consentsComplete && !hasCurrentConsent\('direct'\) && !hasCurrentConsent\('partner'\)/);
  assert.match(html, /function directClinicalStartTarget\(\)\{/);
  assert.match(html, /DIRECT_NURSE_SCREENING_ENABLED \? 'nurse' : 'booking'/);
  assert.match(html, /id="rx-writing"[\s\S]*data-go="plan">ดูแผนการรักษา \(เดโม\)[\s\S]*data-go="notifications">จัดการการแจ้งเตือน/);
  assert.match(html, /tracking:'confirm', feedback:'consult'/);
  assert.match(html, /noMatch\.closest\('\.rail'\)[\s\S]*seedClinicalDemoStage\('matching'\)/);
  assert.match(html, /noStock\.closest\('\.rail'\)[\s\S]*seedClinicalDemoStage\('pharmacy-search'\)/);
  assert.match(html, /show\(nextAfterAuthentication\(\)\)/);
  assert.match(html, /document\.querySelectorAll\('\.screen'\)\.forEach/);
  assert.match(html, /property="og:title" content="Krane Clinic · Client QA Review"/);
  assert.match(html, /property="og:image" content="\/b2c\/assets\/krane-qa-line-share\.png\?v=20260728a"/);
  assert.doesNotMatch(html, /chatgpt\.site|proudproudd|naipaporn|Proud B\.|Proud Boonsiri|Proud Buppa/i);
  await assert.doesNotReject(access(path.join(publicRoot, "b2c/assets/krane-qa-line-share.png")));
  const sharePreviewSource = await readFile(path.join(publicRoot, "b2c/assets/krane-qa-line-share.svg"), "utf8");
  assert.doesNotMatch(sharePreviewSource, /proud|naipaporn|chatgpt\.site/i);
  assert.match(sharePreviewSource, /demo\.patient@example\.com/);
  assert.match(components, /#consent-terms\{min-height:0;overflow:hidden\}/);
  assert.match(components, /#consent-terms\{height:100%;max-height:100%\}/);
  assert.match(components, /#consent-terms \.consent-doc\{height:auto;min-height:0;max-height:none;overflow:visible/);
  assert.match(components, /\.option\{[\s\S]*font:inherit;color:var\(--color-ink\)/);
  assert.match(html, /if\(location\.hash\) applyHash\(\);\s*else \{\s*history=\['landing'\];\s*show\('landing',false\);\s*\}/);
  assert.doesNotMatch(html, /กู้คืนแบบประเมินและขั้นตอนล่าสุดแล้ว/);
  assert.match(screenFragment(html, "summary"), /data-post-auth="booking">Confirm answers &amp; continue<\/button>/);
  assert.doesNotMatch(screenFragment(html, "summary"), /Continue as|Mali S\./, "summary actions must describe the task, not expose a demo patient name");
});

test("legacy patient URLs redirect to the canonical B2C routes", async () => {
  const legacyPatient = await readFile(path.join(publicRoot, "krane-b2c.html"), "utf8");
  const legacyLanding = await readFile(path.join(publicRoot, "krane-b2c-landing.html"), "utf8");
  assert.match(legacyPatient, /location\.replace\("\/b2c\/krane-b2c\.html"/);
  assert.match(legacyLanding, /location\.replace\("\/b2c\/krane-b2c-landing\.html"/);
  assert.doesNotMatch(legacyPatient, /class="devicebar"/);
});

test("onboarding is a clean bilingual three-step value sequence with stable controls", async () => {
  const html = await readFile(path.join(publicRoot, "b2c/krane-b2c.html"), "utf8");
  const components = await readFile(path.join(publicRoot, "b2c/components.css"), "utf8");
  const i18n = await readFile(path.join(publicRoot, "i18n.js"), "utf8");
  const start = html.indexOf('<section class="screen screen--onboard" id="onboard1">');
  const end = html.indexOf("<!-- ===================== CATEGORY", start);
  const onboarding = html.slice(start, end);

  assert.ok(start >= 0 && end > start, "onboarding block must remain extractable");
  assert.equal((onboarding.match(/class="screen screen--onboard"/g) || []).length, 3);
  assert.equal((onboarding.match(/select data-language aria-label="Language"/g) || []).length, 3);
  assert.equal((onboarding.match(/<figure class="onboard-visual /g) || []).length, 3);
  assert.match(onboarding, /onboard-visual--consult/);
  assert.match(onboarding, /onboard-visual--plan/);
  assert.match(onboarding, /onboard-visual--delivery/);
  assert.doesNotMatch(onboarding, /<img|entry-media|doctor-profile-male|cure_clarity|mens-health-review/);
  assert.match(onboarding, /data-go="onboard2" aria-label="Next"/);
  assert.match(onboarding, /data-go="onboard3" aria-label="Next"/);
  assert.match(onboarding, /data-go="concern">Start /);
  assert.match(onboarding, /aria-label="Step 1 of 3"/);
  assert.match(onboarding, /aria-label="Step 2 of 3"/);
  assert.match(onboarding, /aria-label="Step 3 of 3"/);

  assert.match(components, /\.screen--onboard \.screen__top\{[\s\S]*position:absolute/);
  assert.match(components, /\.screen--onboard \.screen__footer\.onboard-footer\{[\s\S]*position:absolute/);
  assert.match(components, /\.onboard-visual\{[\s\S]*border-radius:36px[\s\S]*overflow:hidden/);
  assert.match(components, /\.onboard-language select\{[\s\S]*min-width:64px[\s\S]*height:44px/);
  assert.match(components, /\.onboard-progress\{/);
  assert.match(components, /\.onboard-arrow,/);
  assert.match(i18n, /select\[data-language\]/);
  assert.match(i18n, /"Start":"เริ่มต้น"/);
  assert.match(i18n, /"Private care, wherever you are\.":"ดูแลสุขภาพอย่างเป็นส่วนตัวได้ทุกที่"/);
});

test("intake keeps multi-select questions visible and uses compact required controls", async () => {
  const html = await readFile(path.join(publicRoot, "b2c/krane-b2c.html"), "utf8");
  const i18n = await readFile(path.join(publicRoot, "b2c/i18n.js"), "utf8");
  const components = await readFile(path.join(publicRoot, "b2c/components.css"), "utf8");
  const hairStart = html.indexOf("hair:{");
  const hairEnd = html.indexOf("intake2:`", hairStart);
  const hairFirstQuestion = html.slice(hairStart, hairEnd);
  const firstQuestionTemplates = [...html.matchAll(/intake1:`([\s\S]*?)`,\s*intake2:`/g)].map((match) => match[1]);

  assert.ok(hairStart >= 0 && hairEnd > hairStart, "hair intake template must remain extractable");
  assert.equal(firstQuestionTemplates.length, 5, "every service intake needs a first-question template");
  firstQuestionTemplates.forEach((template) => {
    assert.doesNotMatch(template, /<p class="hint">/, "first intake titles must not include a redundant description");
  });
  assert.doesNotMatch(screenFragment(html, "intake1"), /<p class="hint">/, "the fallback first intake screen must not include a redundant description");
  assert.equal((hairFirstQuestion.match(/data-multi/g) || []).length, 5, "hair locations must remain visible multi-select cards");
  assert.doesNotMatch(hairFirstQuestion, /data-select/, "hair duration must no longer render as a radio-card list");
  assert.match(hairFirstQuestion, /intakeDurationControl\(\{label:'How long has this been happening\?'\}\)/);
  assert.match(html, /function intakeDurationControl\(\{label,thai=false\}\)/);
  assert.match(html, /data-intake-duration-step="-1"/);
  assert.match(html, /data-intake-duration-unit="day"/);
  assert.match(html, /input\[data-intake-role="duration"\]\[required\]/);
  assert.match(html, /function intakeDropdown\(\{id,label,placeholder,options,role=''\}\)/);
  assert.doesNotMatch(html, /data-native-select data-intake-select/);
  assert.match(html, /function intakeRequirementState\(screenOrId\)/);
  assert.match(html, /function syncIntakeDropdownContinue\(screenOrId\)/);
  assert.match(html, /missingGroup = optionGroups\.find/);
  assert.match(html, /continueButton\.disabled = false/);
  assert.match(html, /continueButton\.classList\.toggle\('is-disabled',!state\.ready\)/);
  assert.match(html, /control\.selectedOptions\[0\]\?\.textContent\.trim\(\)/);
  assert.match(html, /const DRAFT_KEY = 'krane-p01-intake-draft-v2'/);
  assert.match(components, /\.intake-dropdown-field \.select\{font-size:16px\}/, "mobile intake selects must not trigger iOS input zoom");
  assert.match(components, /\.intake-duration-control\{max-width:620px\}/);
  assert.match(components, /@media\(max-width:780px\)\{[\s\S]*?\.care-journey__name\{display:block;margin-top:2px;font-size:9\.5px;font-weight:var\(--fw-regular\);line-height:1\.12\}/);
  assert.match(components, /\.care-journey__step\.is-current \.care-journey__name\{font-weight:var\(--fw-medium\)\}/);
  for (const copy of [
    '"Where is your hair thinning or shedding?":"ผมบางหรือร่วงบริเวณใด?"',
    '"Select duration":"เลือกระยะเวลา"',
    '"Select when it started":"เลือกช่วงเวลา"',
    '"Select result":"เลือกผลลัพธ์"'
  ]) assert.ok(i18n.includes(copy), `missing intake translation ${copy}`);
});

test("partner intake persists photo previews and optional health details into review", async () => {
  const html = await readFile(path.join(publicRoot, "b2c/krane-b2c.html"), "utf8");

  assert.match(html, /data-partner-photo-input/);
  assert.match(html, /data-partner-photo-thumbs/);
  assert.match(html, /data-partner-review-photo-thumbs/);
  assert.match(html, /partnerHealth:\{[^}]*sex:''[^}]*dob:''[^}]*height:''[^}]*weight:''[^}]*photos:\[\]/);
  assert.match(html, /function partnerPhotoRecords\(\)\{[\s\S]*flowState\.partnerHealth\.photos/);
  assert.match(html, /function createPartnerPhotoRecord\(file\)\{[\s\S]*canvas\.toDataURL\('image\/jpeg',0\.78\)/);
  assert.match(html, /partnerPhotoRecords\(\)\.push\(await createPartnerPhotoRecord\(file\)\)[\s\S]*persistFlowState\(\)[\s\S]*renderPartnerPhotos\(\)/);
  assert.match(html, /flowState\.partnerHealth\.photos=partnerPhotoRecords\(\)\.filter\(photo => photo\.id!==remove\.dataset\.partnerPhotoRemove\)/);

  for (const field of ["sex", "dob", "height", "weight"]) {
    assert.match(html, new RegExp(`partnerHealth\\.${field}`), `partner review must render ${field}`);
    assert.match(html, new RegExp(`${field}:document\\.getElementById\\('partner-${field}'\\)`), `partner state must save ${field}`);
  }
  assert.match(html, /data-partner-review-details/);
  assert.match(html, /data-partner-review-photos/);
  assert.match(html, /details\.textContent=optional\.join\(' · '\) \|\| 'ยังไม่ได้ระบุ \(ไม่บังคับ\)'/);
  assert.match(html, /const photoCount=partnerPhotoRecords\(\)\.length/);
  assert.match(html, /photos\.textContent=photoCount/);
});

test("eligible partner coverage gates consultation cash checkout through explicit entry state", async () => {
  const html = await readFile(path.join(publicRoot, "b2c/krane-b2c.html"), "utf8");
  assert.match(html, /entryChannel\s*:\s*['"]direct['"]/);
  assert.match(html, /coverage\s*:\s*(?:null|\{)/);
  assert.match(html, /eligiblePartnerPolicy=paymentMethod==='insurance' && Boolean\(partnerPayment\.closest\('#partner-insurance'\)\)/);
  assert.match(html, /flowState\.entryChannel\s*=\s*['"]partner['"]/);
  assert.match(html, /flowState\.coverage\s*=/);

  const balanceSource = html.match(/function consultationBalanceDue\(\)\{([\s\S]*?)\n  \}/);
  assert.ok(balanceSource, "consultation balance function must remain extractable");
  assert.match(balanceSource[1], /flowState\.entryChannel/);
  assert.match(balanceSource[1], /flowState\.coverage/);
  assert.doesNotMatch(balanceSource[1], /history|lastPartnerIndex|lastDirectIndex/, "coverage must not be inferred from navigation history");

  const coverageSource = html.match(/function partnerMedicineCoverageCredit\(\)\{([\s\S]*?)\n  \}/);
  assert.ok(coverageSource, "medicine coverage function must remain extractable");
  assert.match(coverageSource[1], /flowState\.entryChannel/);
  assert.match(coverageSource[1], /flowState\.coverage/);
  assert.match(html, /function refreshMedicationCheckout\(\)\{[\s\S]*partnerMedicineCoverageCredit\(\)[\s\S]*setPaymentContext/);
  assert.match(html, /function setMedicationCheckoutContext\(\)\{\s*refreshMedicationCheckout\(\);\s*\}/);
  assert.match(html, /function consultationHandoffTarget\(\)\{[\s\S]*consultationBalanceDue\(\) > 0 \? 'consultpay' : 'waitroom'/);
  assert.match(html, /data-consultation-balance-amount/);
  assert.match(html, /data-consultation-payment-status/);
  assert.match(html, /replaceCurrent\(doctorAvailable \? consultationHandoffTarget\(\) : 'noslots'\)/);
  assert.match(html, /if\(go\.dataset\.go === 'consultpay'\)\{[\s\S]*show\(consultationHandoffTarget\(\)\)/);
  assert.match(html, /if\(go\.dataset\.go === 'payment' && !go\.hasAttribute\('data-keep-payment-total'\)\) setMedicationCheckoutContext\(\)/);
});

test("payment totals and pharmacy fallback remain consistent across edge states", async () => {
  const html = await readFile(path.join(publicRoot, "b2c/krane-b2c.html"), "utf8");
  assert.ok((html.match(/data-consult-payment-total/g) || []).length >= 4);
  assert.match(html, /function syncConsultationPaymentAmount\(\)\{[\s\S]*consultationBalanceDue\(\)[\s\S]*balance \+ \(on \? 100 : 0\)[\s\S]*#consultpay-gw \[data-consult-payment-total\]/);
  assert.match(html, /syncConsultationPaymentAmount\(\);\s*show\('consultpay-gw'\)/);
  assert.match(html, /data-payment-failure-total/);
  assert.match(html, /function syncMedicationFailureAmount\(amount=currentMedicationDue\(\)\)/);
  assert.match(html, /syncMedicationFailureAmount\((?:due|finalDue)\)/);

  const issueScreen = screenFragment(html, "pharmacyissue");
  const issueActions = [...issueScreen.matchAll(/data-pharmacy-issue-action="([^"]+)"/g)].map((match) => match[1]);
  assert.ok(issueActions.length >= 3, "every pharmacy issue choice must be an immediate action");
  assert.equal(new Set(issueActions).size, issueActions.length, "pharmacy issue actions must be distinct");
  assert.doesNotMatch(issueScreen, /data-pharmacy-issue-confirm|Confirm choice/i);

  const fallbackHandler = html.match(/const pharmacyIssueAction = e\.target\.closest\('\[data-pharmacy-issue-action\]'\);([\s\S]*?)\n    const insuranceConfirm/);
  assert.ok(fallbackHandler, "immediate pharmacy fallback handler must remain extractable");
  assert.match(fallbackHandler[1], /show\('refund'\)/);
  assert.match(fallbackHandler[1], /show\('pharmacy-search'\)/);
  assert.doesNotMatch(fallbackHandler[1], /show\([^)]*pharmacyaccepted/);
});

test("post-consultation checkout carries the accepted order into delivery and payment outcomes", async () => {
  const html = await readFile(path.join(publicRoot, "b2c/krane-b2c.html"), "utf8");
  const plan = screenFragment(html, "plan");
  const address = screenFragment(html, "address");
  const payment = screenFragment(html, "payment");
  const failure = screenFragment(html, "payfail");
  const success = screenFragment(html, "confirm");

  assert.match(plan, /data-go="payment"/, "accepting the plan must go directly to payment");
  assert.doesNotMatch(plan, /data-go="address"|data-go="pharmacy-locate"/, "accepting the plan must not force an address or pharmacy-locate detour");
  assert.match(payment, /data-go="address"[\s\S]*เปลี่ยนที่อยู่/, "payment must expose an explicit Change address action");
  assert.match(address, /data-address-save/, "the address form must have a dedicated save-and-return action");
  assert.match(html, /address:\{building:/, "the saved delivery address must live in persisted order state");
  assert.match(html, /closest\('\[data-address-save\]'\)[\s\S]*history\.pop\(\)[\s\S]*show\('payment',false\)/, "saving an address must return to the existing payment step without duplicating history");

  const planItems = [...plan.matchAll(/data-order-item="([^"]+)"/g)].map((match) => match[1]);
  const paymentItems = [...payment.matchAll(/data-order-item="([^"]+)"/g)].map((match) => match[1]);
  assert.ok(planItems.length >= 2, "the accepted plan must expose stable order-item keys");
  assert.equal(new Set(planItems).size, planItems.length, "plan order-item keys must be unique");
  assert.deepEqual(new Set(paymentItems), new Set(planItems), "checkout must mirror every accepted plan item by key");

  const deliveryValues = [...payment.matchAll(/data-delivery-value="([^"]+)"/g)].map((match) => match[1]);
  assert.ok(deliveryValues.includes("same-day"), "payment needs a same-day choice");
  assert.ok(deliveryValues.includes("postal"), "payment needs a postal choice");
  assert.match(payment, /data-delivery-value="same-day"[\s\S]{0,500}฿ 120/, "same-day must keep its quoted price when postal is selected");
  assert.equal((payment.match(/data-payment-delivery(?=[\s>])/g) || []).length, 1, "only the selected delivery bill row should receive the calculated fee");
  assert.doesNotMatch(address, /data-delivery-value=/, "delivery speed belongs on payment, not the address editor");
  assert.match(html, /closest\('\[data-delivery-value\]'\)/);
  assert.match(html, /flowState\.orderState\.deliveryMethod\s*=\s*\w+\.dataset\.deliveryValue/);
  assert.match(html, /flowState\.orderState\.deliveryMethod\s*=\s*\w+\.dataset\.deliveryValue[\s\S]{0,900}refreshMedicationCheckout\(\)/, "delivery selection must refresh the fee and total");

  assert.doesNotMatch(payment, /data-payment-note|โน้ตถึงไรเดอร์|note (?:for|to) (?:the )?rider/i);
  assert.doesNotMatch(payment, /data-payment-pdpa|\bPDPA\b|personal data protection|privacy policy|นโยบายความเป็นส่วนตัว/i);
  assert.match(payment, /data-payment-addons/);
  assert.match(payment, /data-addon-item/);

  for (const outcome of [failure, success]) {
    assert.match(outcome, /data-payment-outcome-amount/);
    assert.match(outcome, /data-payment-outcome-method/);
    assert.match(outcome, /data-payment-outcome-delivery/);
  }
  assert.match(html, /querySelectorAll\('\[data-payment-outcome-amount\]'\)/);
  assert.match(html, /querySelectorAll\('\[data-payment-outcome-method\]'\)/);
  assert.match(html, /querySelectorAll\('\[data-payment-outcome-delivery\]'\)/);

  assert.match(failure, /data-payment-alternate-method/);
  assert.match(failure, /data-payment-retry/, "retrying the same payment must remain available");
  assert.match(html, /closest\('\[data-payment-alternate-method\]'\)/, "alternate payment must have its own handler");
});

test("public login and legal routes bypass intake while consent acceptance still requires OTP", async () => {
  const html = await readFile(path.join(publicRoot, "b2c/krane-b2c.html"), "utf8");
  const requiredRouteSource = html.match(/function requiredRouteFor\(target\)\{([\s\S]*?)\n  \}\n  function show\(id/);
  assert.ok(requiredRouteSource, "requiredRouteFor must remain extractable for route-contract tests");

  const cleanState = {
    draftReady: false,
    accountCreated: false,
    otpVerified: false,
    patientInfoComplete: false,
    identityVerified: false,
    returningIdentityValid: false,
    consentsComplete: false,
    partnerPhoneOtpPending: false,
    phoneOtpPending: false
  };
  const requiredRouteFor = Function(
    "flowState",
    "PARTNER_SCREENS",
    "REQUIRED_CARE_TARGETS",
    `return function requiredRouteFor(target){${requiredRouteSource[1]}\n}`
  )(cleanState, [], new Set());

  assert.equal(requiredRouteFor("login"), "login", "clean-session login must open directly");
  assert.equal(requiredRouteFor("signup"), "concern", "first-time signup still begins with intake");
  assert.equal(requiredRouteFor("consent-terms"), "consent-terms", "public legal documents must be readable without OTP");
  assert.equal(requiredRouteFor("patient-info"), "concern", "clinical patient details remain guarded");

  const syncConsentSource = html.match(/function syncConsentContinue\(\)\{([\s\S]*?)\n  \}\n  consentChecks/);
  assert.ok(syncConsentSource, "syncConsentContinue must remain extractable for consent-contract tests");
  const consentButton = { disabled: false };
  const completedChecks = [{ disabled: false, checked: true }, { disabled: false, checked: true }];
  const makeConsentSync = (state) => Function(
    "flowState",
    "consentContinue",
    "consentChecks",
    "consentIdentityVerified",
    `return function syncConsentContinue(){${syncConsentSource[1]}\n}`
  )(state, consentButton, completedChecks, () => Boolean(
    state.entryChannel === "partner"
      ? state.partnerAccessComplete && state.partnerPhoneVerified
      : state.otpVerified
  ));

  makeConsentSync({ otpVerified: false, entryChannel: "direct" })();
  assert.equal(consentButton.disabled, true, "anonymous legal readers cannot accept consent");
  makeConsentSync({ otpVerified: true, entryChannel: "direct" })();
  assert.equal(consentButton.disabled, false, "verified patients can accept fully read consent");
  makeConsentSync({
    otpVerified: false,
    entryChannel: "partner",
    partnerAccessComplete: true,
    partnerPhoneVerified: true
  })();
  assert.equal(consentButton.disabled, false, "verified partner patients use the same consent control");

  assert.match(html, /data-consent-page-scroll/, "consent must read as one continuous legal page");
  assert.match(html, /consentChecked\.pdpa = true;[\s\S]*consentChecked\.telemedicine = true;/,
    "reaching the end must select both consent records automatically");
  assert.match(html, /signup:'summary', login:'landing'/);
  assert.match(html, /'consent-terms':'landing'/);
  assert.match(html, /const consentSubmit = e\.target\.closest\('\[data-consent-continue\]'\);[\s\S]*if\(!consentIdentityVerified\(\)\)/);
});

test("Figma landing keeps every client access route and responsive menu contract", async () => {
  const html = await readFile(path.join(publicRoot, "b2c/krane-b2c-landing.html"), "utf8");
  const css = await readFile(path.join(publicRoot, "b2c/krane-b2c-landing.css"), "utf8");
  const script = await readFile(path.join(publicRoot, "b2c/krane-b2c-landing.js"), "utf8");

  for (const route of ["login", "partner-access", "articles", "consent-terms"]) {
    assert.match(html, new RegExp(`data-route="${route}"`), `landing must preserve ${route} access`);
  }
  assert.doesNotMatch(html, /data-route="concern"/, "landing must not route through the removed category-selection page");
  assert.match(html, /data-treatment-menu-trigger[\s\S]*id="desktop-treatment-menu"/);
  assert.match(html, /class="mobile-treatment-menu"/);
  for (const category of ["hair-skin", "sexual-health", "skin", "general", "sleep-stress"]) {
    assert.match(html, new RegExp(`data-category="${category}"`), `landing must preserve ${category} treatment route`);
  }
  assert.match(html, /<dialog class="mobile-menu"/);
  assert.match(html, /id="experts"/);
  assert.match(html, /href="#experts" data-i18n="navDoctors"/);
  assert.match(css, /@media\s*\(max-width:\s*700px\)/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /\.mobile-menu\s*\{[\s\S]*?overflow:\s*auto/);
  assert.match(script, /mobileQuery\.addEventListener\("change"/);
  assert.match(script, /window\.parent\.postMessage\(\{\s*krane: "nav"/);
  assert.match(html, /assets\/landing-573\/latest\/hero-base\.png/);
  assert.match(html, /assets\/landing-573\/latest\/hero-overlay\.png/);
  assert.match(html, /<section class="compliance(?:\s|")/);
  assert.match(html, /latest\/compliance\/thai-fda\.png/);
  assert.match(html, /latest\/compliance\/pdpa\.png/);
  assert.match(html, /latest\/compliance\/medical-council\.png/);
  assert.match(html, /latest\/compliance\/nhso\.png/);
  assert.match(html, /latest\/compliance\/iso-27001\.png/);
  assert.match(html, /class="compliance__track"/);
  assert.equal((html.match(/class="compliance__group"/g) || []).length, 2);
  assert.match(html, /class="compliance__group" aria-hidden="true"/);
  assert.match(html, /data-compliance-toggle/);
  assert.match(html, /โปรแกรมการรักษาเฉพาะบุคคล/);
  const treatmentHashes = new Set();
  for (const image of [
    "hair-loss-prevention.png",
    "sexual-performance.png",
    "skin-anti-aging.png",
    "weight-management.png",
    "hormonal-balance-trt.png",
    "daily-focus-mind.png"
  ]) {
    assert.match(html, new RegExp(`assets/landing-573/treatments/${image.replace(".", "\\.")}`));
    const treatmentPath = path.join(publicRoot, `b2c/assets/landing-573/treatments/${image}`);
    await assert.doesNotReject(access(treatmentPath));
    const treatmentImage = await readFile(treatmentPath);
    assert.ok([4, 6].includes(treatmentImage[25]), `${image} must preserve a transparent PNG channel`);
    treatmentHashes.add(createHash("sha256").update(treatmentImage).digest("hex"));
  }
  assert.equal(treatmentHashes.size, 6, "every symptom needs a distinct product image");
  assert.equal((html.match(/assets\/landing-573\/treatments\/[^"]+\.png/g) || []).length, 6);
  assert.doesNotMatch(html, /class="care-marquee"/);
  assert.match(css, /\.hero\{[\s\S]*height:512px/);
  assert.match(css, /@media\(max-width:700px\)\{[\s\S]*?\.hero__photo\{[\s\S]*?height:calc\(100% \+ 20px\)/, "the mobile hero photo must extend past the blue section so it cannot create a cropped color seam");
  assert.match(css, /\.treatments\{[\s\S]*min-height:352px/);
  assert.match(css, /\.compliance\{[\s\S]*min-height:312px/);
  assert.match(css, /--landing-blue-2:#1973ff/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css, /\.motion-enabled \.reveal-item/);
  assert.match(script, /new IntersectionObserver/);
  assert.match(script, /reducedMotionQuery/);
  assert.match(script, /--hero-parallax/);
  assert.match(html, /data-review-dialog/);
  assert.match(script, /function openReview/);
  assert.match(html, /class="announcement"/);
  assert.match(html, /announcement__track" aria-hidden="true"/);
  const announcementRule = css.match(/\.announcement\{([\s\S]*?)\}/)?.[1] || "";
  assert.doesNotMatch(announcementRule, /mask-image|filter|blur/, "announcement marquee must have a clean edge without a white fade");
  assert.match(css, /@keyframes announcement-scroll\{to\{transform:translate3d\(-50%,0,0\)\}\}/);
  assert.match(css, /@keyframes compliance-marquee\{\s*to\{transform:translate3d\(-50%,0,0\)\}\s*\}/);
  assert.match(css, /animation:compliance-marquee 24s linear infinite/);
  assert.match(css, /\.compliance__group,\s*\.compliance__group\[aria-hidden="true"\]\{[\s\S]*display:flex/);
  assert.match(css, /\.compliance__group\[aria-hidden="true"\]\{display:none\}/);
  assert.match(script, /compliance\?\.classList\.toggle\("is-paused"\)/);
  assert.match(css, /--landing-blue:#1973ff/);
  assert.match(css, /\.hero\{[\s\S]*background:var\(--landing-blue\)/);
  assert.doesNotMatch(css, /background:#0b4cac|background:#073b98/);
  assert.match(css, /height:clamp\(590px,72svh,630px\)/);
  const protocolProductHashes = new Set();
  for (const image of [
    "clinical-injectors-v2.png",
    "clinical-hair-v2.png",
    "clinical-sexual-v2.png"
  ]) {
    const reference = `assets/landing-573/products/${image}`;
    assert.match(`${html}\n${script}`, new RegExp(reference.replace(".", "\\.")));
    const productPath = path.join(publicRoot, `b2c/${reference}`);
    await assert.doesNotReject(access(productPath));
    const productImage = await readFile(productPath);
    assert.ok([4, 6].includes(productImage[25]), `${image} must preserve a transparent PNG channel`);
    protocolProductHashes.add(createHash("sha256").update(productImage).digest("hex"));
  }
  assert.equal(protocolProductHashes.size, 3, "protocol carousel products must be visually distinct assets");
  assert.doesNotMatch(`${html}\n${script}`, /protocol-hair\.png|protocol-sexual\.png|clinical-pens\.png/);
  assert.match(css, /\.product-stage__image\{[\s\S]*object-fit:contain;object-position:center/);
  assert.equal((html.match(/data-product-tag="[0-2]"/g) || []).length, 3, "protocol needs three reusable image annotations");
  for (const slide of ["injectors", "hair", "sexual"]) {
    assert.match(script, new RegExp(`id: "${slide}"`), `${slide} needs slide-specific annotation content`);
    assert.match(css, new RegExp(`\\.product-stage\\[data-product-slide="${slide}"\\]`), `${slide} needs slide-specific annotation positions`);
  }
  for (const label of ["ปากกาฉีด", "หัวทาหนังศีรษะ", "ยาเม็ดรับประทาน", "Injection pen", "Scalp applicator", "Oral tablets"]) {
    assert.match(`${html}\n${script}`, new RegExp(label), `protocol annotation must include ${label}`);
  }
  assert.match(script, /document\.addEventListener\("krane:languagechange", renderProductCopy\)/);
  assert.doesNotMatch(html, /FDA Approved|Clinically Proven|Fast Acting/);
  assert.match(css, /--landing-section-title-size:56px/);
  assert.match(css, /--landing-section-title-weight:500/);
  assert.match(css, /\.section-heading h2\{[\s\S]*font-size:var\(--landing-section-title-size\)[\s\S]*font-weight:var\(--landing-section-title-weight\)/);
  assert.match(css, /\.protocol__heading h2\{[\s\S]*font-size:var\(--landing-section-title-size\)[\s\S]*font-weight:var\(--landing-section-title-weight\)/);
  assert.match(css, /\.guarantee__copy h2\{[\s\S]*font-size:var\(--landing-section-title-size\)[\s\S]*font-weight:var\(--landing-section-title-weight\)/);
  assert.doesNotMatch(html, /class="guarantee__copy"[\s\S]*?<a class="button button--outline"/, "the standards section must not include a secondary CTA");
  assert.match(css, /--landing-section-title-size:clamp\(32px,9vw,40px\)/);
  assert.match(css, /\.hero__signals\{top:20px;[\s\S]*flex-wrap:nowrap;justify-content:space-between\}/);
  assert.match(css, /\.hero__signals>span\{min-width:0;gap:4px;font-size:clamp\(8px,2\.55vw,10px\);white-space:nowrap\}/);
  assert.doesNotMatch(css, /\.hero__signals>span:last-child\{width:100%/);
  assert.match(css, /\.steps li\.reveal-item::before\{[\s\S]*scaleY\(0\)/);
  assert.match(css, /\.steps li\.is-revealed::before\{opacity:1;transform:scaleY\(1\)\}/);
  assert.match(css, /\.steps li:last-child::before\{display:none\}/);
  assert.match(script, /function animateReviews/);
  assert.match(script, /reviewHorizontalLoopWidth/);
  assert.match(script, /reviewInteractionPauseUntil/);
  assert.match(html, /data-member-count data-count-target="3000"/);
  assert.doesNotMatch(html, /3,000,000/);
  assert.match(script, /function startMemberCount\(\)/);
  assert.match(script, /const duration = 1400/);
  assert.match(script, /reviewCollage\.scrollLeft \+= elapsed \* 0\.035/);
  assert.match(css, /\.review-column,\.review-column--offset,\.review-column--reverse,\.review-mobile-sequence\{display:contents\}/);
  assert.match(script, /reviewDialog\?\.open/);
  assert.match(script, /reducedMotionQuery\.addEventListener\?\.\("change", syncReviewMotionPreference\)/);

  const reviewHashes = new Set();
  for (const image of [
    "hair-progress.png",
    "skin-progress.png",
    "weight-progress.png",
    "telehealth-review.png",
    "focus-review.png",
    "mens-health-review.png"
  ]) {
    assert.match(html, new RegExp(`assets/landing-573/reviews-asian/${image.replace(".", "\\.")}`));
    const reviewPath = path.join(publicRoot, `b2c/assets/landing-573/reviews-asian/${image}`);
    await assert.doesNotReject(access(reviewPath));
    reviewHashes.add(createHash("sha256").update(await readFile(reviewPath)).digest("hex"));
  }
  assert.equal(reviewHashes.size, 6, "review reel thumbnails must be six distinct Asian UGC images");
});

test("doctor cards open matching responsive profiles instead of a placeholder template", async () => {
  const landing = await readFile(path.join(publicRoot, "b2c/krane-b2c-landing.html"), "utf8");
  const detail = await readFile(path.join(publicRoot, "b2c/doctor-detail.html"), "utf8");
  const css = await readFile(path.join(publicRoot, "b2c/detail-pages.css"), "utf8");
  const legacy = await readFile(path.join(publicRoot, "doctor-detail.html"), "utf8");

  for (const doctor of ["1", "2", "3", "4"]) {
    assert.match(landing, new RegExp(`href="doctor-detail\\.html\\?doctor=${doctor}"`));
    assert.match(detail, new RegExp(`"${doctor}": \\{`));
  }
  assert.match(detail, /new URLSearchParams\(location\.search\)\.get\("doctor"\)/);
  assert.match(detail, /data-doctor-name/);
  assert.match(detail, /data-doctor-specialty/);
  assert.doesNotMatch(detail, /Doctor profile template|รอข้อมูลแพทย์จริงจากลูกค้า/);
  assert.match(css, /@media\(max-width:520px\)\{[\s\S]*body\{padding:16px\}/);
  assert.match(legacy, /location\.replace\("b2c\/doctor-detail\.html" \+ location\.search \+ location\.hash\)/);
});

test("public QA review gate preserves deep links and uses a signed server cookie", async () => {
  const worker = await readFile(path.join(root, "worker/index.ts"), "utf8");
  const patient = await readFile(path.join(publicRoot, "b2c/krane-b2c.html"), "utf8");
  const directory = await readFile(path.join(publicRoot, "START-HERE.html"), "utf8");
  assert.match(worker, /QA_REVIEW_PASSWORD\?: string/);
  assert.match(worker, /QA_REVIEW_COOKIE_SECRET\?: string/);
  assert.match(worker, /return env\.QA_REVIEW_PASSWORD \|\| "234"/);
  assert.match(worker, /HttpOnly\$\{secure\}; SameSite=Lax/);
  assert.match(worker, /crypto\.subtle\.sign\("HMAC"/);
  assert.match(worker, /location\.pathname \+ location\.search \+ location\.hash/);
  assert.match(worker, /action="\/qa-unlock"/);
  assert.match(worker, /status: 303/);
  assert.match(worker, /PUBLIC_REVIEW_ASSETS/);
  assert.match(worker, /"\/b2c\/assets\/landing-573\/latest\/hero-base\.png"/);
  assert.match(worker, /<h1>ตัวอย่างงานออกแบบ<\/h1>/);
  assert.match(worker, /placeholder="Access code"/);
  assert.match(worker, /width:min\(100%,650px\)/);
  assert.match(worker, /background:#d9dcde/);
  assert.match(worker, /backdrop-filter:blur\(22px\)/);
  assert.match(worker, /min-height:100%;min-height:100dvh/);
  assert.match(worker, /img-src 'self'/);
  assert.match(worker, /location: `\$\{url\.pathname\}\$\{url\.search\}\$\{url\.hash\}`/);
  assert.doesNotMatch(worker, /Response\.redirect\(url\.toString\(\), 307\)/);
  assert.doesNotMatch(patient, /data-qa-access/);
  assert.doesNotMatch(patient, /sessionStorage\.getItem\('krane-qa-access'\)/);
  assert.match(directory, /href="\/b2c\/krane-b2c#landing"/);
  assert.match(directory, /href="\/cms\/doctor"/);
  assert.match(directory, /href="\/cms\/admin"/);
  assert.match(directory, /แอปผู้รับบริการ/);
  assert.match(directory, /พอร์ทัลแพทย์/);
  assert.match(directory, /พอร์ทัลผู้ดูแล/);
});

test("master Mermaid separates consent, coverage, fulfilment exceptions, and continuity", async () => {
  const flow = await readFile(path.join(root, "docs/KRANE_MASTER_E2E_FLOW.md"), "utf8");
  assert.match(flow, /flowchart LR/);
  assert.match(flow, /Return to details; keep prior consent/);
  assert.match(flow, /Mandatory partner nurse screening/);
  assert.match(flow, /No, fully covered/);
  assert.match(flow, /Another eligible pharmacy available\?/);
  assert.match(flow, /refundDone\(\["Refund confirmed"\]\)/);
  assert.match(flow, /Follow-up and refill are separate journeys/);
  assert.match(flow, /Parallel doctor and admin operations/);
});

test("golden record cannot regress fulfilment and shares one follow-up date", async () => {
  const doctorOverlay = await readFile(path.join(publicRoot, "krane-golden-doctor.js"), "utf8");
  const fixture = await readFile(path.join(publicRoot, "krane-golden-fixture.js"), "utf8");
  const doctor = await readFile(path.join(publicRoot, "cms/cms-doctor.html"), "utf8");
  const adminOverlay = await readFile(path.join(publicRoot, "krane-golden-admin.js"), "utf8");
  assert.doesNotMatch(doctorOverlay, /consultationStatus:\s*"Plan sent",\s*fulfilmentStatus/);
  assert.match(fixture, /followUp:\s*"26 Aug 2026"/);
  assert.match(doctor, /data-golden-follow-up value="26 ส\.ค\. 2026"/);
  assert.match(adminOverlay, /"Dispatched":\s*"ไรเดอร์รับสินค้าแล้ว กำลังจัดส่งให้ผู้ป่วย"/);
});
