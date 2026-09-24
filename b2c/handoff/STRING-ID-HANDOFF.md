# Krane B2C string ID handoff

This is the shared copy contract for the B2C app and backend. The canonical
catalog is [`string-ids.v1.json`](./string-ids.v1.json).

It does not replace the current UI translation runtime yet, so introducing the
catalog does not change any rendered text, spacing, or visual behavior.

## What the backend sends

Send a stable `messageId` and named `params`. Do not send a finished Thai or
English sentence as application state.

```json
{
  "status": "PREPARING",
  "messageId": "order.status.preparing",
  "params": {
    "pharmacyName": "ร้านยาฟาสซิโน อารีย์"
  }
}
```

The frontend maps `PREPARING` to the same message ID as a fallback, resolves
the current locale, safely interpolates `{pharmacyName}`, and renders:

- TH: `ร้านยาฟาสซิโน อารีย์ กำลังจัดยา`
- EN: `ร้านยาฟาสซิโน อารีย์ is preparing your medicine.`

## Rules for P'Tinn / backend

1. Treat `messageId` as an API enum. Never edit or translate it.
2. Send `params` as raw values. Do not concatenate a sentence on the backend.
3. Parameter names must match the catalog exactly and are case-sensitive.
4. Monetary values sent for display should already contain the currency, for
   example `"฿ 350"`. Machine calculations must use separate numeric fields.
5. Dates and times should also be sent as machine fields (`ISO 8601`) whenever
   possible. Display params are only a temporary prototype bridge.
6. Unknown IDs fall back to `error.common.generic`; the frontend should log the
   unknown ID for QA rather than displaying the ID to a patient.
7. Additive IDs are backward compatible. Renaming or deleting an ID requires a
   new catalog schema version and a migration note.

## Ownership

- `owner: "backend"`: the API or business state selects the message ID.
- `owner: "frontend"`: validation or interaction state selects the ID locally.
- The frontend owns all Thai and English display copy in both cases.

## Naming convention

IDs use lowercase dot notation:

```text
domain.feature.state
```

Examples:

- `auth.otp.expired`
- `checkout.delivery_quote.ready`
- `payment.status.succeeded`
- `order.status.dispatched`

Do not put screen numbers, HTTP status codes, Thai words, dates, patient names,
or release numbers in an ID.

## Status enums

`backendStatusMap` is the agreed conversion from backend enum to display ID.
The enum remains useful for business logic; the string ID is only for copy.
This avoids coupling UI wording to a backend status name.

## Adding a string

1. Add one item to `strings` with a new stable ID.
2. Add both `th` and `en` values.
3. List every `{parameter}` in `params`.
4. Run `npm run check:strings`.
5. Backend and frontend can then adopt the ID independently.

## Migration note

The current prototype in `i18n.js` uses whole English or Thai sentences as
lookup keys and a DOM text-node walker. Keep it running for the current visual
prototype. During backend integration, migrate one domain at a time to this ID
catalog, starting with order, payment, delivery quote, consultation, and OTP
messages. Do not perform a single large replacement because it would create
unnecessary UI-regression risk.
