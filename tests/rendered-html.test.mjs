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
    "consent-terms", "partner-patient-info", "partner-insurance", "partner-concern", "partner-intake", "partner-nurse",
    "partner-nurse-session", "partner-phr", "plan", "tracking"
  ]) assert.ok(screenIds.includes(id), `missing #${id}`);
  for (const id of ["partner-access", "partner-review", "pharmacy-locate", "refund"]) {
    assert.ok(!screenIds.includes(id), `outdated #${id} must stay removed`);
  }
  assert.ok(!screenIds.includes("partner-payment-choice"), "payment choice must be integrated into partner confirmation");
  assert.doesNotMatch(html, /id="partner-consent"|data-partner-consent/);
  assert.doesNotMatch(html, /syncPartnerConsentContinue/, "removed partner consent must not leave a runtime callback behind");
  assert.match(html, /data-go="consent-terms" data-entry-channel="partner"/);
  assert.match(html, /const consentSource=flowState\.entryChannel==='partner' \? 'partner' : 'direct'/);
  assert.match(html, /target==='partner-phr' && !flowState\.partnerNurseComplete/);
  assert.ok(!screenIds.includes("partner-review"), "partner review screen must be removed");
  assert.doesNotMatch(html, /data-go="partner-review"|data-partner-review-/);
  assert.match(html, /const order=\['consent-terms','partner-patient-info','partner-insurance','partner-concern','partner-intake','matching'\]/);
  assert.match(html, /if\(\['partner-nurse','partner-nurse-session','partner-phr'\]\.includes\(target\)\) targetIndex=6/);
  assert.match(html, /id="partner-patient-info"[\s\S]*data-partner-payment-options[\s\S]*aria-selected="true" data-select data-partner-payment-choice-value="insurance"/);
  assert.match(html, /if\(paymentMethod==='insurance'\) insuranceEntry='partner';[\s\S]*show\(paymentMethod==='insurance' \? 'insurance' : 'partner-concern'\)/);
  assert.match(html, /insuranceEntry === 'partner'[\s\S]*show\('partner-insurance'\)/);
  assert.match(html, /data-go="insurance" data-insurance-entry="partner">ตรวจสอบสิทธิ์ประกัน[\s\S]*data-go="partner-insurance">สิทธิ์และการชำระเงิน/);
  const partnerCoverageScreen = screenFragment(html, "partner-insurance");
  assert.match(partnerCoverageScreen, /Coverage &amp; payment[\s\S]*ตรวจสอบสิทธิ์ประกันแล้ว/);
  assert.match(partnerCoverageScreen, /ค่าปรึกษาแพทย์[\s\S]*เครดิตค่ายา[\s\S]*ค่าจัดส่ง/);
  assert.match(partnerCoverageScreen, /data-partner-payment="insurance" data-go="partner-concern">Noted/);
  assert.doesNotMatch(partnerCoverageScreen, /data-partner-payment="self-pay"/);
  assert.doesNotMatch(partnerCoverageScreen, /ครอบคลุม ฿ 350/);
  assert.doesNotMatch(screenFragment(html, "partner-insurance"), /พบ 1 กรมธรรม์ที่ใช้ได้กับบริการนี้/);
  assert.doesNotMatch(html, /id="insurance-policy-number"|Policy number \(เลขกรมธรรม์\)|placeholder="Policy no\."/);
  assert.match(html, /id="partner-intake"[\s\S]*partner-health-compact[\s\S]*partner-health-grid[\s\S]*partner-clinical-grid/);
  assert.equal((screenFragment(html, "partner-intake").match(/data-partner-history="/g) || []).length, 3);
  assert.equal((screenFragment(html, "partner-intake").match(/data-partner-history-choice="none"/g) || []).length, 3);
  assert.equal((screenFragment(html, "partner-intake").match(/data-partner-history-choice="yes"/g) || []).length, 3);
  assert.equal((screenFragment(html, "partner-intake").match(/data-partner-history-detail/g) || []).length, 3);
  assert.equal((screenFragment(html, "partner-intake").match(/autocomplete="off" disabled/g) || []).length, 3);
  assert.match(html, /input\.disabled=!hasDetails;[\s\S]*if\(!hasDetails\) input\.value=''/);
  assert.match(html, /function partnerHistoryValue\(key\)/);
  assert.match(html, /showActionToast\(`กรุณาระบุ\$\{label\}`,'warning'\)/);
  assert.doesNotMatch(screenFragment(html, "partner-intake"), /partner-lifestyle|การสูบบุหรี่หรือดื่มแอลกอฮอล์/);
  assert.match(components, /@media\(max-width:780px\)\{[\s\S]*#partner-intake \.partner-health-grid\{grid-template-columns:minmax\(0,1fr\);gap:12px\}/);
  assert.match(components, /\.partner-binary__option\[aria-checked="true"\]/);
  assert.match(components, /\.partner-history-field\{[^}]*width:100%[^}]*min-inline-size:0[^}]*display:flex;flex-direction:column;align-items:stretch/);
  assert.match(components, /\.partner-history-field>\.partner-binary\{width:100%;align-self:stretch\}/);
  assert.match(components, /\.partner-history-detail\{[^}]*width:100%[^}]*min-width:0[^}]*max-width:100%/);
  assert.match(html, /submitOnce\('partner-intake'[\s\S]*flowState\.partnerReviewComplete=true;[\s\S]*flowState\.identityVerified=true;[\s\S]*show\(partnerClinicalStartTarget\(\)\)/);
  assert.match(html, /function partnerClinicalStartTarget\(\)\{[\s\S]*if\(PARTNER_NURSE_SCREENING_ENABLED\) return 'partner-nurse';[\s\S]*return 'matching'/);
  assert.match(html, /data-partner-nurse-complete[\s\S]*ยืนยันและพบแพทย์ที่พยาบาลเลือก/);
  assert.match(html, /flowState\.partnerNurseComplete=true;[\s\S]*flowState\.identityVerified=true;[\s\S]*show\(consultationHandoffTarget\(\)\)/);
  assert.doesNotMatch(html, /พยาบาล ปรียา/);
  assert.match(html, /viewport-fit=cover/);
  assert.doesNotMatch(html, /class="devicebar"|id="fontPreview"|fontPreviewStacks|krane_font_preview/, "client-facing QA must not expose prototype device or font controls");
  const designTokens = await readFile(path.join(publicRoot, "b2c/design-tokens.css"), "utf8");
  assert.match(designTokens, /--font-thai-base:\s*"Noto Sans Thai"/);
  assert.match(designTokens, /--font-thai-display:\s*"Prompt"/);
  assert.match(components, /@media\(min-width:781px\)\{[\s\S]*\.stage \.screen--web\{max-width:min\(var\(--desktop-frame\),100%\)\}/);
  assert.match(components, /\.care-journey__steps\{display:grid;width:100%;grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
  assert.match(components, /@media\(max-width:780px\)\{[\s\S]*\.care-journey__current\{display:none\}[\s\S]*\.care-journey__name\{display:block/);
  assert.match(html, /if\(flowConfig\.get\('entry'\)==='direct'\) flowState\.entryChannel='direct'/);
  assert.match(html, /cj\.hidden=flowState\.entryChannel==='partner' \|\| coldAuth/);
  assert.match(html, /Every ordinary landing navigation is a Krane-direct entry[\s\S]*flowState\.entryChannel='direct'/);
  for (const id of ["partner-patient-info", "partner-insurance", "partner-concern", "partner-intake"]) {
    assert.doesNotMatch(screenFragment(html, id), /care-journey/, `${id} must not embed Direct progress UI`);
  }
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
  assert.match(components, /\.date-control__display\{[\s\S]*grid-template-columns:24px minmax\(0,1fr\) 24px/);
  assert.match(components, /\.date-control>input\[type="date"\]\{[\s\S]*pointer-events:auto[\s\S]*touch-action:manipulation/);
  assert.match(html, /function enhancePatientDateFields\(\)\{[\s\S]*วว \/ ดด \/ ปปปป/);
  assert.match(html, /function openPatientDatePicker\(input\)\{[\s\S]*input\.showPicker\(\)/);
  assert.match(html, /input\.addEventListener\('click',\(\) => openPatientDatePicker\(input\)\)/);
  assert.match(html, /event\.key!=='Enter' && event\.key!==' '/);
  assert.match(html, /id="social-birth-date"[^>]*required/);
  assert.match(html, /id="insurance-dob"[^>]*required/);
  assert.match(html, /id="partner-dob"[^>]*required/);
  assert.match(components, /@media\(max-width:780px\)\{[\s\S]*\.screen__body\{padding:16px\}[\s\S]*\.partner-health-grid\{grid-template-columns:minmax\(0,1fr\);gap:16px\}/);
  assert.match(components, /#partner-intake \.input,#partner-intake \.select,#partner-intake \.partner-binary\{[^}]*font-size:16px/);
  assert.match(components, /\.quick-row a \.qic\{[^}]*border-radius:50%[^}]*border:0/);
  assert.match(components, /\.setting-row \.ic\{[^}]*border-radius:50%[^}]*border:0/);
  assert.match(components, /\.notif \.ic\{[^}]*border-radius:50%[^}]*border:0/);
  assert.match(components, /#profile \.screen__body\{background:var\(--color-bg\)\}/);
  assert.match(html, /function hasCurrentConsent\(source\)\{/);
  assert.match(html, /flowState\.consentsComplete && !hasCurrentConsent\('direct'\) && !hasCurrentConsent\('partner'\)/);
  assert.match(html, /function directClinicalStartTarget\(\)\{/);
  assert.match(html, /function directClinicalStartTarget\(\)\{[\s\S]*if\(DIRECT_NURSE_SCREENING_ENABLED\) return 'nurse';[\s\S]*return 'matching'/);
  assert.doesNotMatch(html, /<section class="screen" id="booking"/, "the redundant doctor-match introduction screen must stay removed");
  assert.match(html, /id="rx-writing"[\s\S]*data-go="plan">View treatment plan/);
  assert.match(html, /if\(id==='rx-writing'\)[\s\S]*replaceCurrent\('plan'\)/);
  assert.match(html, /tracking:'confirm', feedback:'consult'/);
  assert.match(html, /noMatch\.closest\('\.rail'\)[\s\S]*seedClinicalDemoStage\('matching'\)/);
  assert.match(html, /noStock\.closest\('\.rail'\)[\s\S]*seedClinicalDemoStage\('pharmacy-search'\)/);
  assert.match(html, /show\(nextAfterAuthentication\(\)\)/);
  assert.match(html, /document\.querySelectorAll\('\.screen'\)\.forEach/);
  assert.match(html, /property="og:title" content="Krane Clinic · Online Care"/);
  assert.match(html, /property="og:image" content="\/b2c\/assets\/landing-573\/latest\/hero-base\.png"/);
  assert.doesNotMatch(html, /chatgpt\.site|proudproudd|naipaporn|Proud B\.|Proud Boonsiri|Proud Buppa/i);
  assert.doesNotMatch(html, /Client QA Review|Patient Flow Prototype|demo\.patient@example\.com|KRANE-DEMO/i);
  assert.doesNotMatch(html, /Last edited|edits are timestamped|F35\.3/);
  await assert.doesNotReject(access(path.join(publicRoot, "b2c/assets/landing-573/latest/hero-base.png")));
  assert.match(components, /#consent-terms\{min-height:0;overflow:hidden\}/);
  assert.match(components, /#consent-terms\{height:100%;max-height:100%\}/);
  assert.match(components, /#consent-terms \.consent-doc\{height:auto;min-height:0;max-height:none;overflow:visible/);
  assert.match(components, /\.option\{[\s\S]*font:inherit;color:var\(--color-ink\)/);
  assert.match(html, /if\(location\.hash\) applyHash\(\);\s*else \{\s*history=\['landing'\];\s*show\('landing',false\);\s*\}/);
  assert.doesNotMatch(html, /กู้คืนแบบประเมินและขั้นตอนล่าสุดแล้ว/);
  assert.doesNotMatch(html, /<section class="screen" id="summary"/, "patients must not see a duplicate answer-review screen");
  assert.doesNotMatch(html, /data-go="summary"/, "patient navigation must not expose the removed review route");
  assert.match(html, /<template id="doctor-intake-summary">[\s\S]*data-summary-concern/, "the doctor-facing intake summary source must remain available");
});

test("legacy patient URLs redirect to the canonical B2C routes", async () => {
  const legacyPatient = await readFile(path.join(publicRoot, "krane-b2c.html"), "utf8");
  const legacyLanding = await readFile(path.join(publicRoot, "krane-b2c-landing.html"), "utf8");
  assert.match(legacyPatient, /location\.replace\("\.\/b2c\/krane-b2c\.html" \+ location\.search \+ location\.hash\)/);
  assert.match(legacyLanding, /location\.replace\("\.\/b2c\/krane-b2c-landing\.html" \+ location\.search \+ location\.hash\)/);
  assert.doesNotMatch(legacyPatient, /url=\/b2c\//, "legacy patient redirect must retain the GitHub Pages project prefix");
  assert.doesNotMatch(legacyLanding, /url=\/b2c\//, "legacy landing redirect must retain the GitHub Pages project prefix");
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
  assert.match(onboarding, /data-go="conditions">Start /);
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
  const customSelect = await readFile(path.join(publicRoot, "b2c/custom-select.js"), "utf8");
  const customSelectCss = await readFile(path.join(publicRoot, "b2c/custom-select.css"), "utf8");
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
  assert.doesNotMatch(html, /data-native-select/, "intake dropdowns must not fall back to inconsistent browser pickers");
  assert.match(html, /window\.kraneSyncSelects\) window\.kraneSyncSelects\(activeScreen\)/);
  assert.match(html, /new CustomEvent\('krane:screenchange'/);
  assert.match(customSelect, /querySelectorAll\('select:not\(\[data-cms-select-ready\]\)'\)\.forEach\(enhance\)/);
  assert.match(customSelect, /new MutationObserver\(function\(mutations\)/, "dynamically rendered selects must work before refresh");
  assert.match(customSelect, /document\.addEventListener\('krane:screenchange'/);
  assert.match(customSelect, /function liveRecordFor\(select\)[\s\S]*root\.isConnected[\s\S]*root\.contains\(select\)/);
  assert.match(customSelectCss, /\.custom-select__trigger\{[\s\S]*pointer-events:auto[\s\S]*touch-action:manipulation/);
  assert.match(customSelectCss, /@media\(max-width:600px\)\{[\s\S]*\.custom-select\.is-open\{z-index:1000\}/);
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
  assert.doesNotMatch(screenFragment(html, "conditions"), /conditionCategoryLabel/);
  assert.match(screenFragment(html, "conditions"), /What are you particularly concerned about\?/);
  assert.match(i18n, /"What are you particularly concerned about\?":"กังวลเรื่องใดเป็นพิเศษ"/);
  for (const copy of [
    '"Where is your hair thinning or shedding?":"ผมบางหรือร่วงบริเวณใด?"',
    '"Select duration":"เลือกระยะเวลา"',
    '"Select when it started":"เลือกช่วงเวลา"',
    '"Select result":"เลือกผลลัพธ์"'
  ]) assert.ok(i18n.includes(copy), `missing intake translation ${copy}`);
});

test("direct entry defaults to self-pay and clinical intake shows one question at a time", async () => {
  const html = await readFile(path.join(publicRoot, "b2c/krane-b2c.html"), "utf8");
  const components = await readFile(path.join(publicRoot, "b2c/components.css"), "utf8");
  const patientInfo = screenFragment(html, "patient-info");

  assert.match(patientInfo, /aria-selected="true" data-select data-patient-payment-choice-value="self-pay"/);
  assert.doesNotMatch(patientInfo, /aria-selected="true"[^>]*data-patient-payment-choice-value="insurance"/);
  assert.match(html, /paymentPreference:'self-pay'/);
  assert.match(html, /const INTAKE_ONE_QUESTION_SCREENS = \['intake1','intake2','intake3','intake-general'\]/);
  assert.match(html, /function setupIntakeQuestionPages\(screenOrId,\{reset=false\}=\{\}\)/);
  assert.match(html, /question\.hidden=!active/);
  assert.match(html, /advanceIntakeQuestionPage\(intakeQuestionScreen\)/);
  assert.match(html, /retreatIntakeQuestionPage\(backScreen\)/);
  assert.match(html, /screen\.querySelector\('\[data-intake-question\]:not\(\[hidden\]\)'\) \|\| screen/);
  assert.match(components, /\[data-intake-question\]\[hidden\]\{display:none!important\}/);
});

test("partner entry keeps its locked concern and compact health-profile sequence", async () => {
  const html = await readFile(path.join(publicRoot, "b2c/krane-b2c.html"), "utf8");

  assert.match(html, /data-go="consent-terms" data-entry-channel="partner"/);
  assert.match(html, /const consentNext = consentSource==='partner'[\s\S]*\? 'partner-patient-info'/);
  assert.match(html, /show\(paymentMethod==='insurance' \? 'insurance' : 'partner-concern'\)/);
  assert.match(html, /target==='partner-intake' && !flowState\.partnerConcernComplete\) return 'partner-concern'/);
  assert.match(html, /data-partner-concern-continue[\s\S]*flowState\.partnerConcernComplete = true[\s\S]*show\('partner-intake'\)/);
  assert.match(html, /data-partner-photo-input/);
  assert.match(html, /partnerHealth:\{[^}]*sex:''[^}]*dob:''[^}]*height:''[^}]*weight:''/);

  for (const field of ["sex", "dob", "height", "weight"]) {
    assert.match(html, new RegExp(`${field}:document\\.getElementById\\('partner-${field}'\\)`), `partner state must save ${field}`);
  }
  assert.doesNotMatch(html, /data-partner-review-/);
});

test("eligible partner coverage gates consultation cash checkout through explicit entry state", async () => {
  const html = await readFile(path.join(publicRoot, "b2c/krane-b2c.html"), "utf8");
  assert.match(html, /entryChannel\s*:\s*['"]direct['"]/);
  assert.match(html, /coverage\s*:\s*(?:null|\{)/);
  assert.match(html, /eligiblePartnerPolicy=paymentMethod==='insurance' && Boolean\(partnerPayment\.closest\('#partner-insurance'\)\)/);
  assert.match(html, /flowState\.entryChannel\s*=\s*['"]partner['"]/);
  assert.match(html, /flowState\.coverage\s*=/);

  const partnerCoverageScreen = screenFragment(html, "partner-insurance");
  assert.match(partnerCoverageScreen, /data-partner-payment="insurance" data-go="partner-concern">Noted/);
  assert.doesNotMatch(partnerCoverageScreen, /฿\s*350|ชำระ|Pay now/i);
  assert.match(html, /coveredPartner \? 'ครอบคลุม'/);
  assert.match(html, /function consultationHandoffTarget\(\)\{[\s\S]*if\(consultationBalanceDue\(\)<=0\) return 'waitroom'/);

  const balanceSource = html.match(/function consultationBalanceDue\(\)\{([\s\S]*?)\n  \}/);
  assert.ok(balanceSource, "consultation balance function must remain extractable");
  assert.match(balanceSource[1], /flowState\.entryChannel/);
  assert.match(balanceSource[1], /flowState\.coverage/);
  assert.doesNotMatch(balanceSource[1], /entryChannel !== 'partner'\) return CONSULTATION_FEE_BAHT/);
  assert.doesNotMatch(balanceSource[1], /history|lastPartnerIndex|lastDirectIndex/, "coverage must not be inferred from navigation history");
  assert.match(html, /flowState\.entryChannel='insured';[\s\S]*consultationCredit:CONSULTATION_FEE_BAHT,medicineCredit:1000/);

  const coverageSource = html.match(/function partnerMedicineCoverageCredit\(\)\{([\s\S]*?)\n  \}/);
  assert.ok(coverageSource, "medicine coverage function must remain extractable");
  assert.match(coverageSource[1], /flowState\.entryChannel/);
  assert.match(coverageSource[1], /flowState\.coverage/);
  assert.match(html, /function refreshMedicationCheckout\(\)\{[\s\S]*partnerMedicineCoverageCredit\(\)[\s\S]*setPaymentContext/);
  assert.match(html, /function setMedicationCheckoutContext\(\)\{\s*refreshMedicationCheckout\(\);\s*\}/);
  assert.match(html, /function consultationHandoffTarget\(\)\{[\s\S]*consultationPaymentTiming[\s\S]*consultationFeeAcknowledged/);
  assert.match(html, /data-screen-code="SCR-008" data-checkout-mode="consultation"/);
  assert.match(html, /data-screen-code="SCR-015" data-checkout-mode="final"/);
  assert.match(html, /data-consult-checkout-title[\s\S]*data-consultpay-label/);
  assert.match(html, /data-consultation-balance-amount/);
  assert.match(html, /data-consultation-payment-status/);
  assert.match(html, /replaceCurrent\(doctorAvailable \? 'consultpay' : 'noslots'\)/);
  assert.match(html, /if\(go\.dataset\.go === 'consultpay'\)\{[\s\S]*show\(consultationHandoffTarget\(\)\)/);
  assert.match(html, /if\(go\.dataset\.go === 'payment' && !go\.hasAttribute\('data-keep-payment-total'\)\) setMedicationCheckoutContext\(\)/);
});

test("payment totals and pharmacy fallback remain consistent across edge states", async () => {
  const html = await readFile(path.join(publicRoot, "b2c/krane-b2c.html"), "utf8");
  assert.ok((html.match(/data-consult-payment-total/g) || []).length >= 4);
  assert.match(html, /function syncConsultationPaymentAmount\(\)\{[\s\S]*consultationBalanceDue\(\)[\s\S]*const amount=balance[\s\S]*#consultpay-gw \[data-consult-payment-total\]/);
  assert.match(html, /syncConsultationPaymentAmount\(\);\s*show\('consultpay-gw'\)/);
  assert.match(html, /data-payment-failure-total/);
  assert.match(html, /function syncMedicationFailureAmount\(amount=currentMedicationDue\(\)\)/);
  assert.match(html, /syncMedicationFailureAmount\((?:due|finalDue)\)/);

  const issueScreen = screenFragment(html, "pharmacyissue");
  const issueActions = [...issueScreen.matchAll(/data-pharmacy-issue-action="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(issueActions, ["postal"], "fallback must offer one explicit postal confirmation");
  assert.match(issueScreen, /เปลี่ยนเป็นการจัดส่งมาตรฐานก่อนชำระเงิน[\s\S]*data-pharmacy-issue-action="postal"/);
  assert.doesNotMatch(issueScreen, /data-pharmacy-issue-confirm|Confirm choice/i);

  const fallbackHandler = html.match(/const pharmacyIssueAction = e\.target\.closest\('\[data-pharmacy-issue-action\]'\);([\s\S]*?)\n    const insuranceConfirm/);
  assert.ok(fallbackHandler, "immediate pharmacy fallback handler must remain extractable");
  assert.match(fallbackHandler[1], /deliveryMethod='postal'/);
  assert.match(fallbackHandler[1], /stockLocked=true/);
  assert.match(fallbackHandler[1], /show\('payment'\)/);
  assert.doesNotMatch(fallbackHandler[1], /show\('refund'\)|show\('pharmacy-search'\)|show\('pharmacypending'\)/);
});

test("post-consultation checkout carries the accepted order into delivery and payment outcomes", async () => {
  const html = await readFile(path.join(publicRoot, "b2c/krane-b2c.html"), "utf8");
  const plan = screenFragment(html, "plan");
  const address = screenFragment(html, "address");
  const payment = screenFragment(html, "payment");
  const failure = screenFragment(html, "payfail");
  const success = screenFragment(html, "confirm");

  assert.match(plan, /Review medicine order[\s\S]*data-plan-continue[\s\S]*ยืนยันรายการยาและเลือกการจัดส่ง/, "medicine acceptance must continue to fulfilment details");
  assert.match(html, /closest\('\[data-plan-continue\]'\)[\s\S]*show\(hasFulfillableItems\(\) \? 'address' : 'payment'\)/, "accepted medicines must open address while a zero-medicine order skips it");
  assert.match(payment, /data-go="address"[\s\S]*data-payment-address-action/, "payment must expose an explicit address action");
  assert.match(payment, /ยังไม่ได้เพิ่มที่อยู่จัดส่ง/, "a fresh checkout must not silently assume a saved address");
  assert.match(payment, /data-payment-go[\s\S]*ไปหน้าชำระเงิน/, "checkout must use a specific payment action");
  assert.match(address, /data-address-save[^>]*>บันทึกและคำนวณค่าจัดส่ง/, "the address form must make delivery repricing explicit");
  assert.match(html, /function checkoutActionState\(\)[\s\S]*addressConfirmed[\s\S]*deliveryQuoteStatus!=='accepted'[\s\S]*!flowState\.orderState\.stockLocked/, "checkout readiness must require a confirmed address and locked pharmacy quote");
  assert.match(html, /MALI_SAVED_ADDRESS[\s\S]*เดอะ เบส พาร์ค เวสต์/, "the saved delivery address must live in persisted order state");
  assert.match(html, /if\(wantSavedAddress\)\{[\s\S]*addressConfirmed=true[\s\S]*stockLocked=true/, "the explicit returning-patient route must restore a payable locked quote");
  assert.doesNotMatch(html, /flowState\.orderState\.address=Object\.assign\(\s*\{\},\s*MALI_SAVED_ADDRESS,/, "fresh checkout state must not inherit a partial saved address");
  assert.match(html, /MALI_SAVED_ADDRESS = \{[\s\S]*recipientName:[\s\S]*recipientPhone:[\s\S]*subdistrict:[\s\S]*districtName:[\s\S]*province:[\s\S]*postcode:/, "the returning-patient fixture must hydrate every required address field");
  assert.match(html, /closest\('\[data-address-save\]'\)[\s\S]*show\('delivery-quote',false\)/, "saving an address must open the pre-payment pharmacy quote state");
  const quote = screenFragment(html, "delivery-quote");
  assert.match(quote, /กำลังคำนวณการจัดส่ง[\s\S]*ค่าจัดส่งโดยประมาณ[\s\S]*ร้านยายืนยัน/, "the quote state must stay an estimate before pharmacy acceptance");
  assert.doesNotMatch(quote, /ยืนยันการชำระเงินแล้ว|payment is confirmed/i, "the pre-payment quote must not claim that payment already happened");
  assert.match(html, /id==='delivery-quote'[\s\S]*invalidateFulfillmentQuote\(\)[\s\S]*replaceCurrent\('pharmacy-search'\)/, "the delivery estimate must continue to pharmacy review without unlocking payment");
  assert.match(html, /id === 'pharmacy-search'[\s\S]*deliveryQuoteStatus='accepted'[\s\S]*stockLocked=true[\s\S]*replaceCurrent\('payment'\)/, "pharmacy review must lock stock and final price before checkout");
  assert.match(html, /const lockedDeliveryFee=flowState\.orderState\.deliveryMethod==='same-day' \? calculatedSameDayDeliveryFee\(\) : 0;[\s\S]*deliveryQuoteStatus='accepted';[\s\S]*deliveryQuoteAmount=lockedDeliveryFee/, "the final delivery fee must be calculated before the quote becomes accepted");
  assert.match(html, /const SIM_PLACES = \[[\s\S]*subdistrict:[\s\S]*districtName:[\s\S]*province:[\s\S]*postcode:[\s\S]*function applyAddress\(place\)[\s\S]*set\('addrSubdistrict',place\.subdistrict\)[\s\S]*set\('addrPostcode',place\.postcode\)/, "mock map selection must prefill every structured address field");

  const planItems = [...plan.matchAll(/data-order-item="([^"]+)"/g)].map((match) => match[1]);
  const paymentItems = [...payment.matchAll(/data-order-item="([^"]+)"/g)].map((match) => match[1]);
  assert.ok(planItems.length >= 2, "the accepted plan must expose stable order-item keys");
  assert.equal(new Set(planItems).size, planItems.length, "plan order-item keys must be unique");
  assert.deepEqual(new Set(paymentItems), new Set(planItems), "checkout must mirror every accepted plan item by key");
  assert.equal((plan.match(/data-qty(?=[\s>])/g) || []).length, planItems.length, "the pre-pay medicine list must let patients reduce within the prescription ceiling");
  assert.equal((plan.match(/data-min="0"/g) || []).length, planItems.length, "the pre-pay medicine list must support declining every medicine");
  assert.equal((payment.match(/data-qty(?=[\s>])/g) || []).length, paymentItems.length, "checkout must provide one quantity control per medicine");
  assert.equal((payment.match(/data-min="0"/g) || []).length, paymentItems.length, "checkout must let a patient omit an individual medicine without editing the prescription");
  assert.equal((payment.match(/data-qty-minus/g) || []).length, paymentItems.length);
  assert.equal((payment.match(/data-qty-plus/g) || []).length, paymentItems.length);
  assert.match(html, /querySelectorAll\(`#payment \[data-order-item="\$\{key\}"\]`\)/, "quantity changes must not rewrite the doctor's treatment plan");
  assert.match(payment, /data-no-fulfillment-notice[^>]*hidden/);
  assert.ok((payment.match(/data-fulfillment-section/g) || []).length >= 2, "delivery-only sections must be independently hideable");
  assert.match(html, /function hasFulfillableItems\(\)\{ return hasMedicines\(\) \|\| selectedAddOnTotal\(\)>0; \}/);
  assert.match(html, /function checkoutActionState\(\)\{[\s\S]*if\(!hasFulfillableItems\(\)\) return[\s\S]*addressConfirmed/, "a zero-fulfilment checkout must bypass address and stock requirements");
  assert.match(html, /if\(due<=0\)\{[\s\S]*documentsUnlocked=true[\s\S]*show\(hasFulfillableItems\(\) \? 'payment-success' : 'prescription'\)/, "a fully covered zero-medicine order must unlock documents without a gateway");
  const discountIndex = payment.indexOf('ส่วนลดและสิทธิ์');
  const calculationIndex = payment.indexOf('checkout-final-summary');
  assert.ok(discountIndex >= 0 && calculationIndex > discountIndex, "cost metadata and final calculation must follow discounts");
  assert.ok(payment.indexOf('checkout-calc') > calculationIndex, "delivery quote metadata belongs inside the final calculation block");

  const deliveryValues = [...payment.matchAll(/data-delivery-value="([^"]+)"/g)].map((match) => match[1]);
  assert.ok(deliveryValues.includes("same-day"), "payment needs a same-day choice");
  assert.ok(deliveryValues.includes("postal"), "payment needs a postal choice");
  assert.match(payment, /data-delivery-value="same-day"[\s\S]{0,500}ค่าประมาณ ฿80 ถึง ฿180/, "same-day must remain an estimate until the pharmacy locks the quote");
  assert.equal((payment.match(/data-payment-delivery(?=[\s>])/g) || []).length, 1, "only the selected delivery bill row should receive the calculated fee");
  assert.doesNotMatch(address, /data-delivery-value=/, "delivery speed belongs on payment, not the address editor");
  assert.doesNotMatch(address, /รูปแบบการจัดส่ง|ได้รับยาภายใน 1–3 ชั่วโมง/, "address editing must not duplicate a delivery promise");
  assert.match(html, /closest\('\[data-delivery-value\]'\)/);
  assert.match(html, /const nextDeliveryMethod=deliveryChoice\.dataset\.deliveryValue[\s\S]*flowState\.orderState\.deliveryMethod=nextDeliveryMethod/);
  assert.match(html, /flowState\.orderState\.deliveryMethod=nextDeliveryMethod[\s\S]{0,500}refreshMedicationCheckout\(\)/, "delivery selection must refresh the fee and total");

  assert.doesNotMatch(payment, /data-payment-note|โน้ตถึงไรเดอร์|note (?:for|to) (?:the )?rider/i);
  assert.doesNotMatch(payment, /data-payment-pdpa|\bPDPA\b|personal data protection|privacy policy|นโยบายความเป็นส่วนตัว/i);
  assert.match(payment, /data-payment-addons/);
  assert.match(payment, /checkout-addon-rail/);
  assert.ok((payment.match(/data-addon-item/g) || []).length >= 2, "optional products must form a horizontal card rail");
  assert.equal((payment.match(/assets\/addons-v2\/[^"']+\.png/g) || []).length, 3, "every optional product must use a distinct product image");
  assert.equal((payment.match(/aria-pressed="false"/g) || []).length, 3, "optional product cards must expose button toggle state");
  assert.doesNotMatch(payment, /role="listitem"/, "interactive add-on cards must retain button semantics");
  assert.doesNotMatch(payment, /data-delivery-value="[^"]+"[\s\S]{0,350}opt-check/, "delivery rows must not duplicate selection with checkbox controls");
  assert.doesNotMatch(payment, /฿ 350 (?:ชำระแล้ว|อยู่ในสิทธิ์)/);
  assert.match(payment, /ใบสั่งยาโดย<\/span><strong>คุณหมอนรินทร์ ทานากะ<\/strong>/);

  const pharmacyAccepted = screenFragment(html, "pharmacyaccepted");
  assert.match(html, /closest\('\[data-payment-go\]'\)[\s\S]*checkoutState==='quote-required'[\s\S]*show\('delivery-quote',false\)[\s\S]*show\('payment-gw'\)/, "checkout must obtain a locked pharmacy quote before opening the gateway");
  assert.match(html, /activateGatewayMethod\('payment-gw',paymentMethod,\{persistMedicationMethod:true\}\)/, "the selected checkout method must activate the matching gateway pane");
  assert.match(html, /screen\?\.id==='payment-gw'/, "switching gateway tabs must persist the medication payment method");
  assert.match(html, /id==='payment-success'[\s\S]*hasFulfillableItems\(\)[\s\S]*replaceCurrent\('pharmacypending'\)/, "bank confirmation must start preparation without a second pharmacy search");
  assert.match(screenFragment(html, "pharmacypending"), /data-go="pharmacyaccepted"/, "preparation must continue into the post-payment pharmacy status");
  assert.match(pharmacyAccepted, /ร้านยารับออเดอร์ที่ชำระแล้ว[\s\S]*data-pharmacy-accepted-continue[\s\S]*ดูการยืนยันออเดอร์/, "pharmacy acceptance must be a post-payment fulfilment state");
  assert.match(html, /closest\('\[data-pharmacy-accepted-continue\]'\)[\s\S]*show\('confirm'\)/, "accepted fulfilment must continue to order confirmation without charging again");
  assert.match(pharmacyAccepted, /state-view__visual--success/, "pharmacy acceptance should use the shared animated state signal");
  assert.doesNotMatch(pharmacyAccepted, /pharmacy-accepted__summary|class="card/, "pharmacy acceptance should keep essential facts out of a second information box");
  assert.doesNotMatch(pharmacyAccepted, /photo-graphic|ตรวจสอบรายการและยอดชำระ/, "pharmacy acceptance must not repeat checkout UI");
  assert.match(screenFragment(html, "pharmacypending"), /state-view__visual--loading/, "medicine preparation should share the state pattern");
  assert.doesNotMatch(html, /id="refund"|refundAmount/, "obsolete refund fallback must stay removed");

  const css = await readFile(path.join(publicRoot, "b2c/components.css"), "utf8");
  assert.match(css, /\.checkout-pay \.btn\{[^}]*min-height:var\(--control-h\)/, "the payment CTA must keep a full touch target at 320px");
  assert.match(css, /\.checkout-addon-card\{[^}]*clamp\(156px,44vw,176px\)[^}]*min-height:190px/, "mobile add-on cards must remain compact and show the next choice");
  assert.match(css, /\.checkout-addon-card__visual img\{[^}]*object-fit:contain/, "product cutouts must stay fully visible inside each add-on card");
  assert.match(css, /\.checkout-addon-card__visual\{[^}]*height:100px[^}]*overflow:visible[^}]*background:transparent/, "add-on products must float on an unclipped stage");
  assert.match(css, /\.checkout-addon-card__visual::before\{[^}]*82px[^}]*border-radius:50%[^}]*#dbe4f2/, "add-on products must share the landing menu's circular powder-blue stage");
  assert.match(css, /\.checkout-addon-card__visual img\{[^}]*animation:loading-illustration-float/, "add-on cutouts must use the shared floating motion");
  assert.match(css, /\.state-view\{[^}]*align-items:center[^}]*justify-content:center/, "state screens must use one centered mobile-first hierarchy");
  assert.match(css, /\.state-view__image,\.state-view__tile>img\{?[\s\S]*animation:loading-illustration-float/, "state imagery needs one restrained floating motion");
  assert.doesNotMatch(css, /state-view__tile--brand::after\{[^}]*background-image:url/, "state tiles must not add a separate logo tag");
  assert.match(css, /\.state-view__tile--brand::before\{[\s\S]*border-radius:50%/, "outcome tiles must use the shared circular stage");

  assert.match(failure, /data-payment-outcome-amount/);
  assert.match(failure, /data-payment-outcome-method/);
  assert.doesNotMatch(failure, /data-payment-outcome-delivery/, "failed payment must not promise a delivery time");
  assert.match(success, /data-payment-outcome-amount/);
  assert.match(success, /data-payment-outcome-delivery/);
  assert.match(html, /querySelectorAll\('\[data-payment-outcome-amount\]'\)/);
  assert.match(html, /querySelectorAll\('\[data-payment-outcome-method\]'\)/);
  assert.match(html, /querySelectorAll\('\[data-payment-outcome-delivery\]'\)/);

  assert.match(failure, /data-payment-alternate-method/);
  assert.match(failure, /data-payment-retry/, "retrying the same payment must remain available");
  assert.match(html, /closest\('\[data-payment-alternate-method\]'\)/, "alternate payment must have its own handler");
});

test("video consultation shares one circular mode FAB and surfaces unread medication summaries", async () => {
  const html = await readFile(path.join(publicRoot, "b2c/krane-b2c.html"), "utf8");
  const components = await readFile(path.join(publicRoot, "b2c/components.css"), "utf8");
  const video = screenFragment(html, "video");

  assert.match(video, /assets\/consultation\/doctor-video-live\.jpg/);
  assert.match(video, /class="call-fab"[\s\S]*data-consult-unread-badge/);
  assert.match(components, /\.chat-fab,\s*\n\.call-fab\{[^}]*width:56px[^}]*height:56px[^}]*border-radius:50%/);
  assert.match(components, /\.call-fab__badge\{[^}]*background:var\(--color-danger\)/);
  assert.match(html, /function revealConsultationSummary\(\)[\s\S]*activeId==='video'[\s\S]*syncConsultationSummaryUnread\(true\)/);
  assert.match(html, /Switching[\s\S]*between video and chat does not[\s\S]*if\(!\['consult','video'\]\.includes\(id\)\)/);
});

test("standalone patient states share one concise visual hierarchy", async () => {
  const html = await readFile(path.join(publicRoot, "b2c/krane-b2c.html"), "utf8");
  const stateIds = [
    "ineligible", "matching", "noslots", "consultpay-fail", "waitroom",
    "rx-writing", "pharmacy-search",
    "payment-success", "payfail", "pharmacypending", "pharmacyaccepted",
    "pharmacyissue", "confirm", "feedbackdone",
    "empty-activities", "empty-history", "preloader",
  ];

  for (const id of stateIds) {
    const fragment = screenFragment(html, id);
    assert.match(fragment, /class="screen__body state-view/, `${id} must use the shared state layout`);
    assert.match(fragment, /state-view__visual/, `${id} must include one floating visual`);
    assert.match(fragment, /state-view__copy/, `${id} must keep title and description together`);
  }

  assert.doesNotMatch(screenFragment(html, "waitroom"), /class="timeline"|data-wait-card/, "waitroom must not repeat its state in a timeline or information card");
  assert.doesNotMatch(screenFragment(html, "payfail"), /class="alert|class="card/, "payment failure must use one explanation, not stacked information boxes");
  assert.doesNotMatch(screenFragment(html, "confirm"), /class="card|confirm-mark/, "confirmation must share the same product-state visual");
  assert.doesNotMatch(html, /dotlottie-player|@dotlottie\/player-component/, "preloader must not rely on a separate third-party visual system");
  assert.match(html, /if\(id==='preloader'\)[\s\S]*replaceCurrent\('landing'\)/, "directly opened preloaders must always resolve");
  const preloader = screenFragment(html, "preloader");
  assert.match(preloader, /data-loader="paper-crane"/, "preloader must expose the branded paper-crane loader");
  for (const stage of ["sheet", "base", "forming", "crane"]) {
    assert.match(html, new RegExp(`ks-fold-stage--${stage}`), `paper-crane loader must include the ${stage} fold stage`);
  }
  assert.match(html, /@keyframes ks-fold-crane/, "paper-crane loader must animate into the final crane");
  assert.match(html, /@media\(prefers-reduced-motion:reduce\)[\s\S]*ks-fold-stage--crane\{opacity:1;transform:none\}/, "paper-crane loader must show a static final crane when motion is reduced");
  assert.match(html, /if\(window\.kraneDemoStage===id \|\| window\.kraneDemoStatus\) seedClinicalDemoStage\(id\)/, "ordinary hash links must not silently seed completed clinical state");
});

test("all outcome graphics use the shared circular stage without a logo tag", async () => {
  const html = await readFile(path.join(publicRoot, "b2c/krane-b2c.html"), "utf8");
  const components = await readFile(path.join(publicRoot, "b2c/components.css"), "utf8");
  assert.match(components, /\.state-view__tile--brand\{[\s\S]*border-radius:0[\s\S]*background:transparent[\s\S]*box-shadow:none/);
  assert.match(components, /\.state-view__tile--brand::before\{[\s\S]*border-radius:50%[\s\S]*background:#dbe4f2/);
  assert.match(components, /\.state-view__tile--brand::after\{content:none\}/);
  assert.match(components, /\.state-view__tile--brand>img\{[\s\S]*object-fit:contain[\s\S]*loading-illustration-float/);
  assert.match(components, /img\[src\*="assets\/state-v2\/"\][\s\S]*border-radius:50%[\s\S]*clip-path:circle\(50%\)/);
  assert.doesNotMatch(components, /state-view__tile--brand::after\{[\s\S]*krane-review-wordmark/);
  assert.ok((html.match(/state-view__tile--brand/g) || []).length >= 10, "all outcome screens must keep the shared circular treatment");
});

test("each loading stage uses a stage-specific graphic", async () => {
  const html = await readFile(path.join(publicRoot, "b2c/krane-b2c.html"), "utf8");
  const components = await readFile(path.join(publicRoot, "b2c/components.css"), "utf8");
  const expected = {
    matching: "krane-state-doctor-matching",
    waitroom: "krane-state-waiting-room",
    "rx-writing": "krane-state-treatment-plan",
    "pharmacy-search": "krane-state-pharmacy-search",
    pharmacypending: "krane-state-medicine-preparing",
    preloader: "krane-state-loading-info"
  };
  for (const [screen, symbol] of Object.entries(expected)) {
    const fragment = screenFragment(html, screen);
    const close = fragment.indexOf("</section>");
    const screenMarkup = close < 0 ? fragment : fragment.slice(0, close + 10);
    assert.match(screenMarkup, new RegExp(`href="#${symbol}"`), `${screen} must use ${symbol}`);
    assert.match(html, new RegExp(`<symbol id="${symbol}"`), `${symbol} must be defined once in the shared SVG sprite`);
    assert.match(screenMarkup, /class="krane-state-art"/, `${screen} must use the shared art treatment`);
    assert.match(screenMarkup, /state-view__tile--cutout/, `${screen} must use the unclipped cutout stage`);
    assert.doesNotMatch(screenMarkup, /state-view__tile--brand/, `${screen} must not overlay a logo on loading artwork`);
    assert.doesNotMatch(screenMarkup, /assets\/state-v2|assets\/loading(?:-v2)?\/|realistic-v1/, `${screen} must not use a stale loading asset`);
    assert.doesNotMatch(screenMarkup, /hair-loss-prevention\.png/, `${screen} must not reuse the generic treatment bottle`);
  }
  assert.match(html, /\.krane-state-art \.(?:ks-float|ks-float-late)[\s\S]*animation:ks-float/, "vector loading art must retain restrained motion");
  assert.match(components, /\.state-view__tile\.loading-illustration\.state-view__tile--cutout\{[^}]*overflow:visible[^}]*background:transparent/);
  assert.match(components, /\.state-view__tile\.loading-illustration\.state-view__tile--cutout::before\{[^}]*border-radius:50%[^}]*#dbe4f2/);
  assert.match(components, /\.state-view__tile\.loading-illustration\.state-view__tile--cutout>img\{[^}]*object-fit:contain[^}]*loading-illustration-float/);
});

test("state symbols use the mood-board editorial artwork while the crane loader stays vector", async () => {
  const html = await readFile(path.join(publicRoot, "b2c/krane-b2c.html"), "utf8");
  const defs = html.match(/<svg class="krane-state-defs"[\s\S]*?<\/svg>/)?.[0] || "";
  assert.ok(defs, "state illustration definitions must exist");

  const editorialHrefs = [...defs.matchAll(/<image href="(assets\/state-editorial-v1\/[^"]+\.jpg)"/g)].map((match) => match[1]);
  assert.ok(editorialHrefs.length >= 19, "all non-loader state symbols should use the mood-board artwork set");
  assert.ok(new Set(editorialHrefs).size >= 17, "distinct care states should retain distinct narrative artwork");
  for (const href of new Set(editorialHrefs)) await access(path.join(publicRoot, "b2c", href));

  const loader = defs.match(/<symbol id="krane-state-loading-info"[\s\S]*?<\/symbol>/)?.[0] || "";
  assert.match(loader, /ks-fold-stage--sheet/);
  assert.match(loader, /ks-fold-stage--crane/);
  assert.doesNotMatch(loader, /<image\b/, "the paper-to-crane loader must remain native animated vector artwork");
});

test("patient states never reuse the generic treatment bottle as status artwork", async () => {
  const html = await readFile(path.join(publicRoot, "b2c/krane-b2c.html"), "utf8");
  assert.doesNotMatch(html, /assets\/landing-573\/treatments\/hair-loss-prevention\.png/);
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
    "INTAKE_DRAFT_SCREENS",
    "REQUIRED_CARE_TARGETS",
    "insuranceEntry",
    "intakeSkipped",
    "skipForwardFrom",
    `return function requiredRouteFor(target){${requiredRouteSource[1]}\n}`
  )(cleanState, [], [], new Set(), "checkout", () => false, (target) => target);

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
  assert.match(html, /consentPageScroll\.scrollTop=consentPageScroll\.scrollHeight;[\s\S]*completeConsentBundleAfterDelay\(consentPageScroll,true\);/,
    "the scroll-to-bottom control must finish at the exact end and force the delayed auto-check");
  assert.match(html, /signup:'intake-general', login:'landing'/);
  assert.doesNotMatch(html, /<section class="screen" id="summary"|data-go="summary"/);
  assert.match(html, /data-intake-complete[\s\S]*flowState\.draftReady=true;[\s\S]*saveIntakeDraft\(\);[\s\S]*show\('signup'\)/);
  assert.match(html, /'consent-terms':'landing'/);
  assert.match(html, /const consentSubmit = e\.target\.closest\('\[data-consent-continue\]'\);[\s\S]*if\(!consentIdentityVerified\(\)\)/);
});

test("Figma landing keeps every client access route and responsive menu contract", async () => {
  const html = await readFile(path.join(publicRoot, "b2c/krane-b2c-landing.html"), "utf8");
  const css = await readFile(path.join(publicRoot, "b2c/krane-b2c-landing.css"), "utf8");
  const script = await readFile(path.join(publicRoot, "b2c/krane-b2c-landing.js"), "utf8");

  for (const route of ["login", "articles", "consent-terms"]) {
    assert.match(html, new RegExp(`data-route="${route}"`), `landing must preserve ${route} access`);
  }
  assert.doesNotMatch(html, /data-route="partner-access"|#partner-access/);
  assert.match(html, /data-route="consent-terms" data-entry-channel="partner"/);
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
  assert.match(html, /เลือกการดูแลที่เหมาะกับคุณ/);
  assert.match(html, /มาตรฐานคลินิกจริง<br>ความเป็นส่วนตัวจริง/);
  assert.match(css, /\.expert-card p:nth-of-type\(n\+2\)\{display:none\}/);
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

test("all canonical B2C brand placements use the new Krane wordmark without clinic", async () => {
  const patient = await readFile(path.join(publicRoot, "b2c/krane-b2c.html"), "utf8");
  const landing = await readFile(path.join(publicRoot, "b2c/krane-b2c-landing.html"), "utf8");
  const doctor = await readFile(path.join(publicRoot, "b2c/doctor-detail.html"), "utf8");
  const advisor = await readFile(path.join(publicRoot, "b2c/advisor-detail.html"), "utf8");
  const components = await readFile(path.join(publicRoot, "b2c/components.css"), "utf8");
  const canonicalBrand = /krane-review-wordmark\.svg\?v=20260730logo1/;

  assert.match(screenFragment(patient, "profile"), canonicalBrand);
  assert.match(patient, new RegExp(canonicalBrand.source, "g"));
  assert.match(landing, canonicalBrand);
  assert.match(doctor, canonicalBrand);
  assert.match(advisor, canonicalBrand);
  for (const html of [patient, landing, doctor, advisor]) {
    assert.doesNotMatch(html, /krane-lockup-(?:charcoal|navy|bone)\.svg/);
  }
  assert.doesNotMatch(landing, /hero-clinic\.svg|hero__brand-clinic|hero__brand-divider/);
  assert.match(components, /\.brand-logo\{[^}]*width:112px[^}]*max-height:29px[^}]*object-fit:contain/);
});

test("mobile profile scales medication lists and keeps navigation compact", async () => {
  const patient = await readFile(path.join(publicRoot, "b2c/krane-b2c.html"), "utf8");
  const components = await readFile(path.join(publicRoot, "b2c/components.css"), "utf8");
  const profile = screenFragment(patient, "profile");

  assert.match(profile, /class="treatment-medications" role="list"/);
  assert.equal((profile.match(/class="treatment-medication" role="listitem"/g) || []).length, 3);
  assert.match(profile, /Next refill in 24 days/);
  assert.doesNotMatch(profile, /Need the doctor before 12 Sep/);
  assert.match(components, /\.treatment-medication\{[^}]*grid-template-columns:minmax\(0,1fr\) auto/);
  assert.match(components, /@media\(max-width:780px\)\{[\s\S]*\.bottomnav\{left:0;right:0;bottom:0/);
  assert.match(components, /\.screen:has\(\.bottomnav\) \.screen__body\{padding-bottom:calc\(72px/);
});

test("prototype rail nests error cases under related happy-flow pages", async () => {
  const patient = await readFile(path.join(publicRoot, "b2c/krane-b2c.html"), "utf8");

  assert.match(patient, /class="rail-legend"[^>]*>[\s\S]*Happy flow[\s\S]*Error case/);
  assert.match(patient, /4 · Urgent safety[\s\S]*data-go="intake4"[\s\S]*class="rail-error-menu"[\s\S]*data-go="ineligible"/);
  assert.match(patient, /Doctor matching[\s\S]*data-go="matching">Auto-match[\s\S]*class="rail-error-menu"[\s\S]*data-demo-nomatch[\s\S]*data-go="noslots"/);
  assert.match(patient, /Insurance checkout[\s\S]*data-go="insurance"[\s\S]*ตรวจสอบสิทธิ์ประกัน/);
  assert.doesNotMatch(patient, /id="insurance-policy"|id="reduce-order"|data-go="insurance-policy"|data-go="reduce-order"/);
  assert.match(patient, /Pharmacy confirmation[\s\S]*data-go="pharmacyaccepted"[\s\S]*class="rail-error-menu"[\s\S]*data-demo-nostock/);
  assert.doesNotMatch(patient, /rail-group--exceptions/);
  assert.doesNotMatch(patient, /<span class="rail-step">QA<\/span>/);
  assert.match(patient, /\.rail-error-menu\{[^}]*--color-danger-ink/);
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
  assert.match(directory, /data-access-gate/);
  assert.match(directory, /placeholder="Access code"/);
  assert.match(directory, /sessionStorage\.getItem\('krane-qa-access'\)/);
  assert.match(directory, /try \{ return sessionStorage\.getItem\('krane-qa-access'\); \}[\s\S]*catch \{ return null; \}/);
  assert.match(directory, /try \{ sessionStorage\.setItem\('krane-qa-access', 'granted'\); \}[\s\S]*catch \{/);
  assert.match(directory, /\.\/assets\/krane-review-wordmark\.svg\?v=20260803logo2/);
  assert.match(directory, /href="\.\/b2c\/krane-b2c\.html\?entry=partner#consent-terms"/);
  assert.doesNotMatch(directory, /#partner-access/);
  assert.match(directory, /href="\.\/b2c\/krane-b2c\.html#landing"/);
  assert.match(directory, /href="\.\/cms\/cms-doctor\.html"/);
  assert.match(directory, /href="\.\/cms\/cms-admin\.html"/);
  assert.match(directory, /แอปผู้รับบริการ/);
  assert.match(directory, /พอร์ทัลแพทย์/);
  assert.match(directory, /พอร์ทัลผู้ดูแล/);
});

test("master Mermaid separates consent, coverage, fulfilment exceptions, and continuity", async () => {
  const flow = await readFile(path.join(root, "docs/KRANE_MASTER_E2E_FLOW.md"), "utf8");
  assert.match(flow, /flowchart LR/);
  assert.match(flow, /Return to details; keep prior consent/);
  assert.match(flow, /Exception case.*Partner nurse screening/);
  assert.doesNotMatch(flow, /Mandatory partner nurse screening/);
  assert.match(flow, /No, fully covered/);
  assert.match(flow, /Coverage and payment notice; record consultation and medicine coverage/);
  assert.match(flow, /Noted; no payment captured/);
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
