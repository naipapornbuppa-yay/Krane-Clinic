# User testing: findings and status

Findings from usability testing, and where each one actually stands in the
code. This file exists because the first round's prioritisation lived only in
chat and had to be reconstructed from the source four days later. Same reason
as `b2c/ui-contract.json`: if it is not written down, it goes missing.

**Status is checked against the code, not remembered.** Each open item names
the file and the mechanism, so the next person can verify it in one grep
rather than trusting this file.

Last verified: 31 Aug 2026 against `61a5e8f`, which is what the live link is
serving (Pages build 507, UI contract run 126, both green on that SHA).

**Nine of the thirteen round-1 findings are still open** — one P0, six P1, two
P2. Everything the client has asked for directly since 22 Aug is live; almost
none of what user testing found is. Those are two different lists, and only one
of them is moving.

---

## Round 1 — 22 Aug 2026, 2 participants

### Fixed

| # | Finding | Hit by | Shipped |
|---|---------|--------|---------|
| 1 | **ID upload refused outright.** The identity step was the wall, and it came before anything the clinic does had been seen. | 2/2 | `816a05b` — `identityRequired()` in `krane-b2c.html`; direct access never asks. The partner channel keeps `#partner-idcard`. A contract flow fails the build if `#identity` reappears in the direct route. |
| 2 | **Map picker not found**, so the whole address was typed by hand. | 2/2 | `c29e689` — `.address-map-pill` is filled blue (`components.css`). |
| 3 | **Greyed-out pay button did nothing** when pressed, which is the one thing a stuck person tries. | — | `c29e689` — `aria-disabled` + `.btn--blocked`; pressing it scrolls to the blocker and outlines it red (`CHECKOUT_BLOCKERS`). |

### Open — P0

| # | Finding | Where it lives |
|---|---------|----------------|
| 4 | **An account is demanded before any value is delivered.** The chain is still intake → account → OTP → consent → patient record → **pay** → doctor. A phone number and money both change hands before the patient has seen a doctor exist. This is the other half of the finding that produced #1, and it is untouched. | `krane-b2c.html:5640` (`signup:'intake-general'`), `:6333` (`requiredRouteFor`) |

### Open — P1

| # | Finding | Hit by | Where it lives |
|---|---------|--------|----------------|
| 5 | **Date of birth picker.** Raw `<input type="date">`, no Thai-year affordance, no keyboard entry path. Three at the time of the finding; **five now** — the redesign work added two more of the same kind. | 2/2 | `krane-b2c.html`, 5 × `type="date"` |
| 6 | **The price is nowhere on the landing page.** No ฿ amount anywhere; only "ฟรี" in the promo bar. "What does this cost" cannot be answered before signing up. | — | `krane-b2c-landing.html` |
| 7 | **Two payment models are not explained.** Pay-before and pay-after both exist in the flow and read as a mistake rather than a choice. | — | `flowState.consultationPaymentTiming`, 6 sites in `krane-b2c.html` |
| 8 | **Single-choice and multi-choice look the same** until you tap one and the page moves. | — | `[data-intake-auto-advance]` is the only marker |
| 9 | **No scroll affordance** outside the consent screen, so long screens read as finished. | — | `consent-scroll-cue` exists on consent only |
| 10 | **Medicine names are free text** on the safety screen, so nothing can be checked against them. | — | `krane-b2c.html` `#intake-medications` |

### Open — P2

| # | Finding | Where it lives |
|---|---------|----------------|
| ~~11~~ | ~~No max length on phone fields.~~ **Fixed 28 Aug**: the three the patient types into (`signup-phone`, `login-phone`, `recipientPhone`) cap at 12 characters, the length of 08x-xxx-xxxx. The readonly and international fields are left alone. The validator also asked for ten digits while accepting nine; it asks for ten now. | `krane-b2c.html` |
| 12 | **Copy is long throughout.** The 23 Aug pass (`c29e689`) fixed the sixteen `.state-view` screens only; the rest of the app has not had one. | — |
| 13 | **Choosing your own doctor** is built but not offered in the default route. | `#choosedoc` |

### Needs a decision, not a fix

These were raised on 22 Aug and are still waiting.

- **Where general-health information belongs** in the flow.
- **The locked-documents block at checkout** — it takes real estate to promise
  documents that neither participant cared about.
- **Positioning.** Both participants read the landing as beauty / weight-loss,
  not telemedicine. Worth re-opening: everything shipped to the landing since
  23 Aug has been product photography of pens, tablets and bottles, which
  pushes further toward "shop" and away from "clinic" — against this finding
  rather than with it.

---

## Shipped 29–31 Aug, and where it came from

Verified present on `61a5e8f`. Every one of these came from the client
directly, not from the round-1 list — worth seeing side by side with the nine
open findings above.

| Change | Verified by |
|--------|-------------|
| Sexual health / ED books a time instead of queueing for a doctor | `APPOINTMENT_ONLY`, `#appointment`, `#appointment-booked`, contract flow |
| Refill is multi-select, and only from prescriptions that have not expired | `[data-refill-option]`, `retireExpiredRefills()` |
| "เติมยา" replaces "สั่งซื้อซ้ำ" app-wide | 8 × `เติมยา`, 0 × `สั่งซื้อซ้ำ` |
| Every case has a follow-up; the home banner changes when one exists | `.followup-row` |
| Home cards are tappable; the per-card buttons are gone | contract components |
| One regular doctor, with a small route to request a change | `.care-team-note` |
| The yellow refill reassurance note is gone | no `refill-note` in markup or CSS |
| Height / weight / conditions moved to directly after name + phone | `directNextAfterPatientInfo()` |
| The language check now sees screens that are not on show | `noThaiInEnglish` walks every `section.screen` |

## Round 2 — pending

New is collecting 5–10 participants and filling a **"next round UT responses"**
tab in the UT sheet. Nothing has been read from it yet.

When it lands, the findings go in this file with the same three columns —
finding, how many hit it, and the file it lives in — and merge into one ranked
list with the open rows above rather than becoming a second list.
