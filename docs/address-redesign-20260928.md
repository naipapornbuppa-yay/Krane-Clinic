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
