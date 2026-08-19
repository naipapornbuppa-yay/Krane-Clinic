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

- **One review, after payment** (`#csat-modal`), rating three things: the
  doctor's advice, the app, and the video/sound quality. The two-point split
  tried on 18 Aug was dropped on 19 Aug — delivery is not rated separately.
- Asked once per order and it cannot be skipped: the rating is the way past the
  dialog, and all three rows are required.
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

## 9. Navigation

- Back returns to the page the user came from, including deep links.
- Re-consulting from an existing treatment card skips the condition picker.
- Landing and web-app share one nav bar and one drawer.
