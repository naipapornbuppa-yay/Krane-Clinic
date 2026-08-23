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

## 11. Sign-up

- **Direct access does not ask for an ID card** (client, 23 Aug). Both users in
  the 22 Aug test refused to upload one, and it was the wall they hit before
  they had seen anything the clinic does. The direct chain is intake → account
  → OTP → consent → patient record → care. `identityRequired()` in
  `krane-b2c.html` is the single switch; the contract asserts that asking for
  `#identity` on a direct session lands on the patient record instead.
- The partner channel keeps its own document step (`#partner-idcard`).
  `#identity` stays in the app for the contexts that still need it.

## 12. Navigation

- Back returns to the page the user came from, including deep links.
- Re-consulting from an existing treatment card skips the condition picker.
- Landing and web-app share one nav bar and one drawer.
