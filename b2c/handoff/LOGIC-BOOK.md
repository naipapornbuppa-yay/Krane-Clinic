# B2C logic book

## SID026 — Appointment availability (11 October 2026)

- Both screen-directory and public links use the same appointment renderer.
- Keep date selection. Remove morning, afternoon and evening tabs.
- Render only available slots in a single responsive grid, ordered earliest to latest.
- Service window: 09:00–24:00, every 15 minutes; last start 23:45.
- Hide occupied starts and starts less than 15 minutes away today. Prototype occupancy is deterministic mock data; production must use backend availability and revalidate at confirmation.
- Changing day clears the selected time. Confirmation stays disabled until an available time is selected.
- If no starts remain, leave the time grid empty with no helper message; keep date selection available and confirmation disabled. Initial entry defaults to tomorrow when today's service window has ended.
