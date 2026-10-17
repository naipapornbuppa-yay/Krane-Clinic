# Doctor frontend workflow review — 17 October 2026

Scope: Doctor Portal and its B2C recipients, browser-only simulation. This work is not part of the BE DEV handoff. The handoff branch remains `handoff/be-dev-2026-10-11` at `3beddab450c9a6da9649c75dddce402dbc9cd39d`. Landing remains WIP; doctor/admin are later deliveries.

## Shared workflow

`krane-clinical-workflow.js` extends the existing clinical adapter. `krane-clinical-workspace.js` renders submitted records on both surfaces, with shared component styling. The snapshot `krane.clinical.workflow.v1` holds encounters, plans, appointments, programmes, requests, documents, orders, feedback and notifications. Files live in IndexedDB rather than base64 localStorage. Existing chat remains in the original adapter.

| Flow | Doctor interaction | B2C recipient |
| --- | --- | --- |
| Intake and consent | Own queue → submitted answers, health/contact/consent and files | Creates encounter on completing intake |
| Admission | Accept → enter room; callback, cancellation, no-show and reassignment require appropriate state/reason | Shared room status; actual encounters do not use automatic demo admission |
| Consultation | Encounter-specific chat draft and private SOAP, reconnect/invite | Chat and room connection state; SOAP excluded |
| Medicines | Catalogue search/add, quantity/instructions, explicit chat preview, save and confirm | Exact published medicine plan → checkout; payment/fulfilment status visible to doctor |
| Other outcomes | No medicine or referral with instructions | Published outcome and consultation history |
| Scheduling | Shared weekly hours/date overrides and reserved appointments; protect booked hours | Same available slots, conflict revalidation |
| Pause/resume | Programme state and cancelled/new follow-up encounter | Patient programme pause cancels future matching appointments; resume reserves a new encounter |
| Review requests | Start/decline with reason; open separate review encounter and publish outcome | Request status resolves after completed review |
| Documents | Publish unsigned preview, revised immutable version, revoke | Patient-scoped version/status and download |
| Feedback | Completed encounter scores, order status | Submitted review, no duplicate review |

## Evidence and limits

The lifecycle browser suite covers admissions, draft/patient isolation, Rx preview and checkout, no-medicine/referral, pause/resume, requests, versioned documents, feedback, reassignment, invalid early admission/no-show, stale revision and storage-failure preservation, TH/EN and responsive widths 390/1440. A separate file test uploads a fictional PDF, reloads the doctor page and checks the download filename. Existing clinical-sync QA checks receiving DOM, not only localStorage. B2C consistency checks passed 114 page/viewport cases. See `qa-evidence/2026-10-17/` and the scripts in `b2c/tools/`.

Initial failures: booked/cancelled states lacked legacy banner mapping (P1, opening an appointment threw a page error); language test selected a hidden duplicate language control (test defect); initial appointment picker rendered a closed day (P2). These were corrected. The final lifecycle batch recorded 11 passing groups and a schedule-test timeout caused by targeting its scrim instead of the visible close control; the affected schedule group passed on targeted rerun. The responsive snapshots were recaptured with reduced motion after an earlier screenshot caught the drawer transition. The lifecycle test selector was also updated to use visible controls and the actual shared panels instead of hidden fixture panels.

Not production acceptance: this is one browser/origin, no backend/auth/real video, clinical signature, payment provider, pharmacy stock or delivery service. Local revision checks and fresh slot validation do not guarantee cross-process/distributed booking transactions. IndexedDB files are local and are lost if browser data is cleared. SOAP drafts are session scoped, not durable medical records. Static fixture/demo routes remain for design review; the populated shared encounter path is the functional test scope. Original video was not newly reviewed. Admin operational controls remain outside this Doctor Portal change.

Run: `QA_TIMEOUT_FACTOR=2 node b2c/tools/doctor-workflow-qa.mjs`; `node b2c/tools/clinical-sync-qa.mjs`; `CHROMIUM_PATH=/tmp/krane-chrome-software.sh node b2c/tools/contract-check.mjs`; `CHROMIUM_PATH=/tmp/krane-chrome-software.sh QA_TIMEOUT_FACTOR=10 node b2c/tools/qa-chrome-consistency.mjs`. Wrapper uses installed Google Chrome with `--disable-gpu` on this machine; it is not a project runtime requirement.

Additional regression found during recipient cleanup: the first CSS rule hid the existing patient request panel along with static fixtures (P1, activity → request decision invisible). It was narrowed to preserve shared clinical panels and the rendered clinical-sync test passed again. Successful-rating feedback now appears only after persistence; real patients' account fields initialize from their own record rather than the default demo name.

The contract fixture previously clicked tomorrow unconditionally; Sunday is now correctly closed by shared doctor hours. The test chooses a working day with at least six starts while retaining the original six-slot assertion. No contract inventory or minimum was removed. Duplicate pending requests of the same kind/encounter are rejected; request buttons reset when switching encounters.

## Fixed findings and reproduction

| Severity | Route / precondition / steps | Before → expected after | Evidence |
| --- | --- | --- | --- |
| P1 | Doctor queue, 1440px; create future booked patient → open case | Undefined banner state threw an exception → appointment details open without error | lifecycle and schedule recheck |
| P1 | Patient notifications, same-origin request; doctor starts review → patient opens notifications | Shared review panel was hidden by fixture cleanup CSS → decision is visible | clinical-sync.log |
| P1 | Doctor consult, two patients; enter unsent message/SOAP for A → switch to B → return A | Prevent cross-patient drafts → B is empty, A restores its own session draft | lifecycle draft isolation |
| P1 | Doctor schedule, booked future slot; mark its date off → save | Block silent closure of booked time → preserve existing schedule, show error, editor stays open | schedule-recheck.json |
| P2 | B2C appointment, Saturday/Sunday; initialize picker | Closed initial day could show no starts → first working date is selected; deliberately closed dates still stay unavailable | contract and lifecycle schedule checks |
| P2 | Patient account, newly submitted fictional patient → open account | Demo patient's default name → selected patient's own name/contact | profile isolation lifecycle |

Responsive inspection: populated queue at 390 and 1440 pixels; patient history overflow checked at both. This is not a claim that every CMS screen received visual review at every breakpoint. The automated full B2C consistency inventory is separate.

## Responsibility boundary against B2C

- Partner insurance/self-pay and direct intake keep their existing questions/order. The doctor consumes channel, fee/entitlement summary and submitted health/consent; the doctor does not approve insurance or collect payment.
- Patient delivery addresses, payment methods, coupons, pickup locations and tracking remain patient/operations workflows. Doctor sees the resulting clinical order status; no duplicate checkout UI is added to the doctor surface.
- Refills and uploaded prescriptions create review tasks. A review does not automatically authorize medicine: it requires a separate encounter and explicit plan publication.
- Patient programme pause/resume and follow-up appointments reach the doctor workflow. Review ratings/documents/history are patient scoped.
- Editorial landing, admin stock/logistics/refunds and backend enforcement are outside this iteration. Existing static design examples are not evidence of those operational functions.

Final result: B2C contract **170/170**, B2C consistency **114/114**, rendered clinical-sync checks passed. Doctor lifecycle **12 groups passed cumulatively**: final batch 11 passes plus schedule group passed on targeted recheck after fixing its hidden-scrim test selector. File persistence, responsive visual and request-duplicate checks passed. This wording deliberately preserves the first failure and targeted-rerun history rather than presenting a single clean batch.
