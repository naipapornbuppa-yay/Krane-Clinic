# Krane string IDs

This is the inventory of static screen copy in `krane-b2c.html`. It also
records JavaScript template literals with interpolation. API-driven messages
have a separate stable contract in `../handoff/string-ids.v1.json`. Ordinary
JavaScript toast literals are inventoried in
`../handoff/runtime-copy-inventory.json`; they are not yet ID-backed.

## Why this exists

The prototype has no string IDs. `i18n/en.json` is keyed by the English source
text and `th-en.js` maps Thai text to English, so translation works by matching
the literal string. That has two consequences:

1. Editing a word of copy silently breaks its translation, because the key was
   the old text.
2. There is no list of what copy exists, so nobody can tell what still needs
   translating, or review the wording as a whole.

These files give reviewers stable references, but the current prototype still
renders its original inline text. Adopting the IDs in the runtime is integration
work for the next developer.

## The files

| File | What it is |
|---|---|
| `krane-strings.json` | Static screen text with stable IDs; old entries are marked `status: retired` |
| `krane-strings-dynamic.json` | JavaScript template literals with named placeholders |
| `krane-strings-missing-en.json` | Active Thai screen strings that have no English yet |

## ID convention

```
<screen>.<role><nn>
```

`screen` is the screen's `id` in `krane-b2c.html`, so an ID always says where
the string appears. `role` says what the string does on that screen:

`title`, `heading`, `body`, `label`, `option`, `action`, `hint`, `alertTitle`,
`text`.

```json
"consultpay.alertTitle01": {
  "th": "นี่คือค่าปรึกษาแพทย์เท่านั้น",
  "en": "",
  "screen": "consultpay",
  "role": "alertTitle"
}
```

The extractor reuses an existing ID when its screen and text still match. It
allocates new IDs above the highest number in that screen and role, even when
older entries have been retired. Never renumber or reuse a retired ID for a
different message.

## Placeholders

Strings that interpolate a value keep the value as a named slot:

```json
"dynamic.msg23": {
  "pattern": "คุณอยู่คิวที่ {queuePos}",
  "params": ["queuePos"],
  "hasConditional": false,
  "lang": "th"
}
```

`hasConditional: true` means the original also switched whole phrases on a
condition (`{choice}` in the pattern). Those need splitting into separate IDs,
one per branch, rather than one string with a slot.

## Before implementing

Three things found while extracting these, which need a decision rather than a
straight port:

- **540 active Thai strings have no English in this extracted catalog.** Thai is the default and English is
  opt-in, so today an English speaker sees a mix of both languages.
- **Some copy is split across elements.** `waitroom.hint01` is the fragment
  "กดเข้าห้องได้เลย แพทย์" because a `<span>` holding the doctor's name sits in
  the middle of the sentence. Split sentences cannot be translated: the whole
  sentence has to become one string with a placeholder.
- **Some screens mix languages in the source**, for example `consultpay` has
  "Doctor consultation" and "ค่าปรึกษาแพทย์" as separate strings on one card.

## Regenerating

These are extracted from `krane-b2c.html`. Re-run after copy changes from the
`b2c` directory with `python3 strings/extract-strings.py`. The extractor
preserves IDs for unchanged copy, adds new IDs, and marks text no longer in
markup as `retired`. Review the diff: a retired entry and a new entry on one
screen may represent a copy edit that needs a translation review.

As of the October 2026 handoff, this catalog has 952 active static entries,
173 retired entries, and 53 active dynamic templates. It is an inventory, not
proof of translation completeness or a runtime integration.

## Shared primary CTA IDs

`shared-cta-ids.json` is the canonical copy map for equivalent primary actions.
Use `action.pay` for an actual positive payment, `action.continue` when no payment
is due, and `action.check_eligibility` for insurance verification. The page
marks these buttons with `data-string-id`; do not embed a changing amount or a
security claim in the button label. Show the payable amount in the order summary.
