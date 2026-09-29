# Delivery address redesign

28 September 2026. Scope: Krane customer delivery-address editor and its handoff to checkout. Reference applications inform interaction logic only; Krane components, colors and typography remain the visual system.

## Reference evidence

- [Health at Work via OCEAN LIFE](https://www.ocean.co.th/en/services/digital-healthcare/telemedxhealthatwork) publishes a service sequence that includes treatment summary, payment of any difference, then selection of a medicine-delivery address. It does not document field-level layout.
- [MorDee official service guide](https://mordeeapp.com/th/article/โรคทั่วไป/mordeeappxnhso) describes collecting an address during registration for its NHSO journey, followed by consultation and medicine delivery. This specific program should not be generalized to every MorDee flow.
- [Grab official recipient-delivery guidance](https://www.grab.com/mm/en/blog/send-a-meal/) asks for destination details and the recipient's phone number so delivery partners can contact the person receiving the order. This is an older published guide, not evidence of the latest app screen design.

No authenticated competitor screens were inspected. The information hierarchy below is a Krane design decision informed by those service tasks, not a reproduction of undocumented competitor UI. No comparative usability test supports a claim that Krane is better than these applications.

## Design decisions

1. Keep one concise page title. Remove duplicate location headings and explanatory text that crowd out the task.
2. Present the destination as a readable address with a compact map and an explicit edit action outside the map.
3. Place required recipient/contact inputs immediately after the location. Do not hide missing required data behind an empty summary card.
4. Distinguish optional floor, room and rider instructions from required recipient details.
5. Keep a predictable confirmation action. Explain missing information at the field or relevant section and focus the first invalid field when requested.
6. Preserve drafts across map edits and return navigation. Only confirmation commits a destination to checkout.

## Existing implementation limits

The prototype's administrative-area data covers selected districts in three provinces. Typed addresses do not resolve an exact coordinate, map fallback is illustrative, and delivery estimates are demo calculations. This redesign does not add nationwide geocoding or production delivery services.

## Verification

- Inspected stable screenshots at 390px and 1440px, including the optional-details section; checked horizontal overflow at 320px.
- Address flow checks cover missing inputs, invalid phone, dependent administrative-area resets, refresh recovery, recipient/note retention through map edits, confirmation to payment, back/cancel draft isolation, and saving an address label.
- No browser runtime errors in the address flow check.
- Global UI contract remains 148/164 with the same 16 previously recorded failures. These include legacy address assertions; no assertions were removed to force a green result.
- The address-specific audit was updated for the intentional change from a disabled-looking confirmation action to an enabled action with inline validation and a stable label.

## Follow-up review after LINE access was unavailable

Continued with public research and inspection of the working flow. [GrabExpress's published delivery form](https://www.grab.com/ph/express-delivery-service/) separately verifies the recipient's name/contact and delivery location. [GOV.UK's error guidance](https://design-system.service.gov.uk/components/error-summary/) emphasizes directing users to fields needing correction. These are supporting interaction principles, not visual templates.

The next concrete issue was draft persistence: the save-for-next-time checkbox was not stored with the address draft, so reload could silently drop the user's request to save the address. The follow-up change preserves the explicit checked or unchecked preference, alongside the draft address label, without committing a draft before confirmation.

Verified the new regression failed before the fix and passes after it. Coverage includes checked and unchecked reload behavior, retained label text, no saved-entry mutation on back, and no duplicate saved entry on repeated confirmation. Existing targeted address checks still pass with no runtime errors.

## Explicit current-location picker

The address-entry screen now contains the manual form and a current-address button. The map and location readout appear only in a separate native modal dialog after that button is activated. Geolocation is requested by that action, not by merely opening the address form.

Map results remain provisional until confirmation. Closing or cancelling leaves the manually entered address intact; late location/reverse-geocoding responses are ignored after cancellation or a newer request. When location or map services are unavailable, the interface offers manual entry instead of claiming that a fixed sample location is the user's current location.

The current-location entry point now sits on the delivery-address thumbnail. It opens the map dialog directly and confirmation updates the delivery card. The separate edit-address action opens the manual fields; cancellation preserves the existing delivery address.

## Address book entry and reuse

Both the delivery review and manual-address form expose “เลือกจากสมุดที่อยู่”. The dialog lists named destinations, recipient details, an explicit use action, edit, and add-new. Opening/cancelling the dialog does not select or commit an address. Selecting fills an editable delivery draft; the normal confirmation still validates and commits it.

Explicitly remembered addresses persist in local browser storage under the verified phone/patient key (guest fallback), so a new session in that browser can reuse them. This is device/browser storage, not a server-backed account address book. Existing session entries remain usable. Editing updates the chosen entry without duplicates; unchecking remember no longer silently deletes a previously saved entry. The old silent six-entry eviction was removed.

Validated with address-book-check.mjs (selection/cancel, draft isolation, recipient hydration, explicit save, new-session reuse, edit, add-new, empty book and 320px layout), plus the existing address-flow and address-picker checks.
