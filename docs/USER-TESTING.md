# User testing: findings and status

Findings from usability testing, and where each one actually stands in the
code. This file exists because the first round's prioritisation lived only in
chat and had to be reconstructed from the source four days later. Same reason
as `b2c/ui-contract.json`: if it is not written down, it goes missing.

**Status is checked against the code, not remembered.** Each open item names
the file and the mechanism, so the next person can verify it in one grep
rather than trusting this file.

Last verified: 26 Aug 2026 against `a1f1108`.

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
| 5 | **Date of birth picker.** Raw `<input type="date">`, no Thai-year affordance, no keyboard entry path. | 2/2 | `krane-b2c.html:922` (intake), `:1033` (social), `:1847` (insurance) |
| 6 | **The price is nowhere on the landing page.** No ฿ amount anywhere; only "ฟรี" in the promo bar. "What does this cost" cannot be answered before signing up. | — | `krane-b2c-landing.html` |
| 7 | **Two payment models are not explained.** Pay-before and pay-after both exist in the flow and read as a mistake rather than a choice. | — | `flowState.consultationPaymentTiming`, 6 sites in `krane-b2c.html` |
| 8 | **Single-choice and multi-choice look the same** until you tap one and the page moves. | — | `[data-intake-auto-advance]` is the only marker |
| 9 | **No scroll affordance** outside the consent screen, so long screens read as finished. | — | `consent-scroll-cue` exists on consent only |
| 10 | **Medicine names are free text** on the safety screen, so nothing can be checked against them. | — | `krane-b2c.html` `#intake-medications` |

### Open — P2

| # | Finding | Where it lives |
|---|---------|----------------|
| 11 | **No max length on phone fields.** Six inputs, none capped: `signup-phone`, `login-phone`, `social-phone`, `patient-phone`, `recipientPhone`, `account-phone`. | `krane-b2c.html` |
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

## Round 2 — pending

New is collecting 5–10 participants and filling a **"next round UT responses"**
tab in the UT sheet. Nothing has been read from it yet.

When it lands, the findings go in this file with the same three columns —
finding, how many hit it, and the file it lives in — and merge into one ranked
list with the open rows above rather than becoming a second list.
