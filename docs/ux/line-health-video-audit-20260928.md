# LINE Health recording → Krane UX audit

**Updated product decision (v182):** Krane does not offer queue cancellation/reset. Both waiting and resume screens offer appointment booking instead, preserving intake and consent. This supersedes the cancellation recommendations and validation described below; those describe the reference recording and v181 history.

Reference: RPReplay_Final1790595474.MP4, duration 10:17. Screen frames inspected every 15 seconds and every 2 seconds during exit/re-entry/cancellation (9:02–10:17). This is a UI observation, not evidence of the provider's backend implementation.

| Video | Observed behavior | Krane comparison/action |
|---|---|---|
| 0:30 | Consent before proceeding | Existing consent document/read and identity gates retained. |
| 0:45–1:15 | Symptoms, duration/unit, previous relief, conditional Other, optional images | Existing intake controls retained; no duplicate form introduced. |
| 1:30–1:45 | Medical-history choice required before save | Existing health-history assessment retained. |
| 2:00 | Fee and service terms before requesting consultation | Existing Krane fee/consent flow retained. Reference prices, shipping hours and policies are not copied. |
| 2:15 | Intake submitted/loading acknowledgement | Existing matching status retained. |
| 2:30–8:15 | Waiting with visible timer and cancellation | Added visible elapsed time separate from the hidden room-entry button; estimate is explicitly approximate. |
| 8:30–9:08 | Timeout changes to long-wait copy; queue remains active | Retained delayed state, clarified uncertain wait time. Explicit long-wait preview now stays waiting instead of admitting after 30 seconds. |
| 9:10–9:28 | Close webview; return shows continue/restart choice | Existing resume screen retained; queue start time and room-entry deadline persist across close/reload. |
| 9:30–9:34 | Continue returns to the same delayed state | Tested elapsed time survives resume. |
| 9:36–9:40 | Cancel requires confirmation | Existing confirmation retained; backing out preserves queue. |
| 9:42–10:04 | After cancellation, entering again opens empty intake | Existing reset path verified; cancellation removes pending queue and intake/consent draft. |

Additional related corrections: expired room-entry buttons are hidden; rematching discards the expired queue clock while keeping intake answers; attempted navigation cannot delete a queue before route prerequisites have passed.

Not observed in this clip: failed network requests, failed payment, doctor disconnection, denied camera/microphone permission. Do not attribute handling of these cases to the reference video.

Prototype boundary: Krane currently simulates admission after 150 seconds, with a two-minute delay threshold and a five-minute room-entry window. These are prototype values, not copied service commitments. `?wait=long` demonstrates indefinite delay; `?wait=ready` demonstrates admission. Production must use server-owned queue status/deadlines and cancellation acknowledgement; this change does not create that backend.

Validation: `queue-lifecycle-check.mjs` passes the queue transitions with no browser errors; mobile waiting layout inspected at 390×844. The broader UI contract reports 20 failures/164 checks, covering unrelated/stale screen-tab, address, profile, receipt, detail-page and translation expectations. It is not a clean full-app regression run; those results are not represented as passing.
