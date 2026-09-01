# Standing UI rules (Krane B2C)

Rules the client has already asked for once. They apply to every screen from now on —
new work is expected to follow them without being told again. Each rule names the
mechanism in the code so it can be checked, not just remembered.

**These rules are enforced, not just written down.** `b2c/ui-contract.json` lists every
screen, component and flow that must exist; `npm run check:ui` asserts all of it in a
real browser, and CI runs it on every push. If something agreed is deleted, the build
fails with the name of what went missing. Removing a line from the contract is allowed
only when the client asks for it, and the reason goes in the commit message.

## 1. Choice inputs

- **Single-choice = tap to commit.** A list where exactly one option can win has no
  Continue button and no radio tick: the tap is the answer and the view moves on.
  Intake: `intakeQuestionIsSingleChoice()` → `[data-intake-auto-advance]`.
  Sheets: the option handler commits and closes (payment method).
- **Multi-choice keeps its CTA and its ticks.** There is no way to know when someone
  has finished with a multi-select, a text field or a dropdown.
- **Segmented control** (`.partner-binary`, `.partner-duration-units`) is the pattern for
  2–4 short mutually exclusive values. Selected = white surface + shadow on a sunken track.
- **Two panels on one screen use that same control, not bespoke tabs** (client,
  1 Sep). Treatment detail had its own 72px boxed tab strip welded to the top of
  the record card; it is `.partner-binary--accent` now, the same switch as
  delivery/pickup on checkout. Text only — a switch this size does not need
  icons, and a screen already called hard to read does not need decoration.

## 2. One page, one question

- Paginated intake shows one question per page (`INTAKE_ONE_QUESTION_SCREENS`).
- **The question is the page heading.** Where a page carries exactly one labelled
  question, that label is promoted to heading size (`.intake-question__title`) and the
  screen title steps aside. Never show a big screen title over a small grey question.
- A prompt that only qualifies the one above it (a duration, a unit) folds into that
  question instead of taking its own page.
- The `n / N` counter rides on whichever heading is showing.

## 3. Buttons

- **One geometry for every action:** `--button-radius: var(--control-radius)`.
  Rounded rectangle, never a pill. Pills are for statuses only (`.live-pill`, chips).
- Primary height is `--control-h`; the same button reads the same on landing, home,
  intake and checkout.
- **Dialog and sheet actions stack:** primary full width on top, the way out full width
  under it. Never side by side — Thai labels wrap.
- A blocked primary says *why* in its own label ("เลือกที่อยู่ก่อน"), it does not just grey out.
- **A blocked primary is still tappable, and the tap answers it.** `disabled`
  swallows the click, so the one thing a stuck patient tries does nothing.
  Checkout's is `aria-disabled` + `.btn--blocked`; pressing it scrolls to the
  blocker and outlines it red (`CHECKOUT_BLOCKERS`).

## 4. Copy density

- Body copy on a state screen: heading + one line. Anything longer is either cut or
  demoted.
- A precondition for the button is an **info chip** on the button (`.info-chip`), one line,
  icon + text — not a paragraph above it.
- Question-shaped titles end in `?`.
- **One medicine per row.** A line item names one active ingredient and its
  strength. Never "Med A + Med B + Med C" — a fixed-dose combination writes a
  four-line name into a 52px row and no one reads it.
- No kicker/eyebrow labels above headings.

## 5. Colour

- Icons and interactive accents use the app blue `--color-accent`. Not the grey-teal
  `--color-info` default.
- Yellow `--surface-notice` means caution or "read this" — never decoration.
- Every colour pair is contrast-checked (≥4.5:1 for body text) before it ships.

## 6. Forms

- Long forms are grouped into labelled sections, not one flat run of fields.
- Every text field that can be wrong has an error state: red outline + help text under
  the field, not only a toast.
- Every editable field carries a clear (`×`) affordance (`.field--clearable`).
- Address search offers suggestions while typing; picking one prefills the fields.
  Choosing a point on the map prefills them too.

## 7. Reviews

- **One review, after the medicine arrives** (`#csat-modal`), rating three
  things: the doctor's advice, the app, and the video/sound quality. It fires
  when the patient confirms receipt on the Delivered step. The two-point split
  tried on 18 Aug was dropped on 19 Aug; the trigger moved off payment on
  20 Aug, because the review asks about the whole thing and at payment half of
  it has not happened yet.
- **It can be closed.** The order is already complete by then, so the review is
  a request, not a gate: the scrim and "ไว้ทีหลัง" both dismiss it. Submitting
  still needs all three rows — a partial rating is not a review.
- Never ask about something that has not happened yet.

## 8. Language

- **English means English.** Nothing stays Thai when the toggle is on English,
  and nothing stays English when it is on Thai. Both directions are asserted by
  `noThaiInEnglish` rules in the contract, on the app and on every marketing page.
- **The check covers screens you cannot see.** One screen is active at a time,
  so checking only what is on show checked one screen out of seventy; 73
  untranslated strings piled up behind it before 31 Aug. The rule now activates
  every `section.screen` in turn, reveals hidden `.modal-layer` dialogs, and
  reads `placeholder` and `aria-label` as well as text, then puts everything
  back. Adding a screen means it is covered from the moment it exists.
- The app is English-source: new English copy goes in the markup, its Thai in
  `TH` (`b2c/i18n.js`). The flow screens are Thai-source: new Thai copy goes in
  the markup, its English in `EN_FROM_TH` in the same file.
- Marketing pages are Thai-source. English lives in `translations.en`
  (`data-i18n`) or in `b2c/th-en.js` for anything without a key.
- A label that carries a calculated amount gets a pattern in `EN_PATTERNS`, not
  one key per possible number.
- `?lang=en` works on every page, app and marketing alike.

## 9. Checkout and fulfilment

- **Checkout is ordered like a delivery app** (client, 20 Aug: "ทำลอก grab มาเลย"):
  where it goes → what is in it → offers → how it is paid → the bill → what you
  get afterwards. The address is near the top, not below the basket. Pinned by
  the `order` rule in the contract.
- **Saving an address runs the quote and comes straight back.** One loading
  state with a five-second counter covers the wait; checkout then scrolls to the
  address row and pulses it (`.checkout-row.is-just-set`), so the answer is
  where the patient is looking.
- **The pharmacy runs after payment, never before it.** Payment is gated on the
  delivery quote alone. Once paid, `#pharmacypending` plays two stages on one
  screen — เภสัชกำลังจัดยา, then จัดยาสำเร็จแล้ว — and hands over to this
  order's own timeline (`#tracking`), not the list of orders. Activity keeps its
  progress bars for coming back later.
- A blocked pay button names the real precondition ("คำนวณค่าจัดส่งก่อน"), and
  a pay button that says a price goes to the gateway, not somewhere else.

## 10. Loading and waiting screens

Every `.state-view` screen is the same three things, in this order, and nothing
else (client, 23 Aug):

1. **One line of title.** If it wraps, it is too long.
2. **One description, two lines at most.**
3. **A time counter, only if there really is one.** Prose in the counter slot is
   a third line of copy pretending to be a number — either it counts or the slot
   is empty. The dwell and the counter read from the same constant, so the
   screen cannot say 5 seconds and wait 2.

- **One state per screen.** A loading screen does not rewrite its own heading
  halfway through: two headings in five seconds reads as two pages.
- All of them use the house illustration set (`#krane-state-*`) with a badge.
  The paper-crane flipbook belongs to the app's own boot screen.

## 11. Treatments and refills

- **Every case has a follow-up** (client, 27 Aug). There is no such thing as an
  active treatment nobody is following, so every card on the home screen carries
  its follow-up row and its "เริ่มติดตามผล" action.
- **Refilling is a separate errand, not a substitute for a follow-up.** Both sit
  on the card; the follow-up is the primary.
- **The card is the tap target on home** (client, 28 Aug). Five buttons across
  two cards was the clutter. A treatment card opens its refill; the follow-up
  keeps its own entry point in the banner above, which names the doctor and the
  next date.
- **Refill is multi-choice**: the patient ticks which prescriptions to re-order
  and can tick more than one, so it keeps its ticks and one footer CTA (rule 1).
  The CTA names the count and the total; blocked, it says what it is waiting for.
- **Any prescription still in date can be refilled**, not only the newest one
  (clinic back-office, 28 Aug). Expired ones are listed but not selectable, with
  the expiry as the reason — `retireExpiredRefills()` reads `data-refill-expires`
  so a stale row cannot be left selectable by hand.
- **The word is เติมยา**, everywhere. Not สั่งซื้อซ้ำ, not สั่งซ้ำ. `คำสั่งซื้อ`
  is a different thing (an order) and keeps its own word.
- **One doctor looks after every case** (client, 28 Aug) — a regular doctor, not
  a name per condition. Changing them is handled by a person, so the home screen
  carries a quiet line pointing at LINE or email rather than a control that
  implies self-service.

## 12. Booking

- **Sexual health goes through matching and fails it** (New, 31 Aug), it does
  not skip to booking. The route New wants tested is *matching flags no doctor →
  forced scheduling*, so the patient sees the match attempt and the failure, not
  just the time picker. `directClinicalStartTarget()` sends every route to
  `#matching` and sets `doctorAvailable` from `needsAppointment()`; the matching
  timer re-reads `needsAppointment()` so a deep link straight to `#matching`
  fails the same way. `APPOINTMENT_ONLY` holds the group and its conditions, and
  `needsAppointment()` reads both `selectedCategoryId` and `selectedConditionId`
  because the picker uses one for the group and one for the condition.
- **One screen picks a consultation time.** `#appointment` (SCR-007B) owns it.
  The old `#noslots` (SCR-007) was a second, English, option-pill design for the
  same job reachable only from the demo rail, and was retired on 31 Aug — two
  scheduling patterns in one build makes a comparison test unreadable.
- Because the patient arrives from a failed match, the booking screen says so
  ("ขณะนี้ไม่มีแพทย์ว่างสำหรับเรื่องนี้"). It must not claim the condition needs
  booking in advance; that is a different story from the one just shown.
- A booked consultation ends on its own confirmation, **not the waiting room**.
- The booking screen is two single choices then a commit, so it keeps its CTA
  (rule 1), and the CTA reads back the time about to be booked. Changing the day
  clears the time — a slot free today may be taken tomorrow. Taken slots stay
  visible and struck through so the day does not look emptier than it is.

## 13. Sign-up

- **Order of the chain** (client, 26 Aug): intake → account → OTP → consent →
  name and phone → **height / weight / conditions** → doctor → payment.
  Everything the patient knows about themselves is asked in one run, and only
  then does the app go looking for a doctor. The health page used to sit on the
  far side of matching and the fee. `directNextAfterPatientInfo()` is the
  hand-off; `DIRECT_PRE_DOCTOR_GATE_TARGETS` holds everything that waits on it.
- **Direct access does not ask for an ID card** (client, 23 Aug). Both users in
  the 22 Aug test refused to upload one, and it was the wall they hit before
  they had seen anything the clinic does. `identityRequired()` in
  `krane-b2c.html` is the single switch; the contract asserts that asking for
  `#identity` on a direct session lands on the patient record instead.
- The partner channel keeps its own document step (`#partner-idcard`).
  `#identity` stays in the app for the contexts that still need it.

## 14. Navigation

- Back returns to the page the user came from, including deep links.
- Re-consulting from an existing treatment card skips the condition picker.
- Landing and web-app share one nav bar and one drawer.
- **The home quick menu draws no boxes** (client, 1 Sep: "เอากรอบ…ตรงควิกเมนูออก
  ไม่สวยไม่คลีน"). No plate behind the action and no disc behind the icon — four
  actions were putting eight containers across the top of the home screen. The
  icon sits on the page in brand blue and the **label** identifies the action,
  so labels stay one line and never wrap. The follow-up is marked by accent
  colour on its label, not by a filled tile; the blue banner below it is the
  loud version of the same action and does not need a second one above.
- With no plate to darken, a quick-menu press is answered by the item itself
  (scale and fade), and focus by an outline. An action with no visible feedback
  reads as broken — the same finding as the greyed-out pay button.
