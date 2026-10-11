# Program pause and review completion QA — 11 October 2026

## Change and behavior

- Standard small red text action below treatment history: พักโปรแกรมการรักษา.
- Confirmation is required; cancel preserves the active program. Confirm changes only the selected program to paused, suppresses its follow-up reminder/join UI, retains readable history and persists after reload. Program state is local prototype storage only.
- Four complete review scores lead to SID-050 / feedbackdone; its CTA returns home. Incomplete scores remain in the sheet; dismissing does not submit.
- Handoff index, developer notes, current ledger, readiness, logic book, integration and edge-case documents point to the latest addendum. String catalogs and runtime-copy locations were regenerated without deleting any previous static/dynamic IDs.

## Verification

| Check | Result | Reproduction / expectation |
|---|---|---|
| Pause persistence at 390 and 890 px | PASS | Open first home program → red action → cancel: remains active. Reopen → confirm: only weight program pauses. Reload: pause persists. Reopen detail: history accessible and action reports paused. |
| Pause storage failure | PASS | Inject setItem failure for pause key → confirm: inline error, dialog remains open, program stays active. |
| Four-section CSAT | PASS | Submit empty: stays open. Rate all four → submit: feedbackdone active. Return home: profile active; review reminder absent. |
| English UI audit | PASS after adding new labels | Switch to English and inspect screens/dialogs including pause copy; no untranslated text in tested inventory. |
| Modal preview gallery | PASS | New pause dialog should join the existing gallery and use the right canvas. |
| UI contract | PASS 170 checks | Original run found a time-dependent fixture assertion: only four slots remained today while the test required six. Product behavior was correct; component inventory now selects tomorrow before checking quantity, retaining the minimum and separate today/booking checks. |
| String ID contract | PASS | 87 stable IDs and locale placeholders match. Catalog retains all old IDs. |

Mobile and desktop paused detail screenshots were visually inspected for readable history and placement beneath the accordion. No CMS/backend, actual appointment cancellation service or clinician notification was tested. Production needs account/case IDs, cancellation transaction, notification/audit, conflict handling and a resume policy.

Evidence: `/tmp/krane-pause-final/`, `/tmp/krane-four-section-csat-submit/`, `/tmp/krane-pause-locale-final/`, `/tmp/krane-pause-gallery/`, `/tmp/krane-pause-contract-final.log`.

Saved machine evidence: [qa-program-pause-2026-10-11](qa-program-pause-2026-10-11/).

## Resume and refill follow-up

Passed pause/resume persistence and storage failure tests at 390 and 890px. The centered action is outside all record cards; paused programs sort last. Resume proposes an available fixture appointment, supports choosing another time, and requires confirmation before activation without incrementing the consultation number. History uses consultation dates. Refill folders share home positioning, subtitle placement and responsive outline geometry. Refill selection still opens checkout. English UI audit passed. Availability remains a frontend fixture requiring backend booking integration.
