# Krane string IDs

Every piece of user-facing copy in the patient app, given a stable ID so it can
be changed, translated and reviewed without going through the HTML.

## Why this exists

The prototype has no string IDs. `i18n/en.json` is keyed by the English source
text and `th-en.js` maps Thai text to English, so translation works by matching
the literal string. That has two consequences:

1. Editing a word of copy silently breaks its translation, because the key was
   the old text.
2. There is no list of what copy exists, so nobody can tell what still needs
   translating, or review the wording as a whole.

These files replace that with IDs that do not change when the words do.

## The files

| File | What it is |
|---|---|
| `krane-strings.json` | Every string, by ID, with its Thai and English forms |
| `krane-strings-dynamic.json` | Messages that interpolate values, with named placeholders |
| `krane-strings-missing-en.json` | Thai strings that have no English yet |

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

Add new strings with the next free number in that screen and role. Never renumber
an existing ID: the number is only there to make it unique, not to record order.

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

- **648 Thai strings have no English.** Thai is the default and English is
  opt-in, so today an English speaker sees a mix of both languages.
- **Some copy is split across elements.** `waitroom.hint01` is the fragment
  "กดเข้าห้องได้เลย แพทย์" because a `<span>` holding the doctor's name sits in
  the middle of the sentence. Split sentences cannot be translated: the whole
  sentence has to become one string with a placeholder.
- **Some screens mix languages in the source**, for example `consultpay` has
  "Doctor consultation" and "ค่าปรึกษาแพทย์" as separate strings on one card.

## Regenerating

These are extracted from `krane-b2c.html`. Re-run the extraction after copy
changes, then diff: new IDs mean new copy, and a changed `th` on an existing ID
means that string needs re-translating.
