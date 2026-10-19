# Customer test lab

Available only with Vite DEV (Base44 sandbox preview). Production builds remove the adapter, fixtures and toolbar. It changes no server auth or permissions.

Open the bottom-left Customer test lab button (اختبار تجربة العميل), choose one of five personas, and use the ordinary customer routes. No account signup is performed. The authenticated operator's real session remains intact.

Each persona has an independent sessionStorage dataset and cart in this browser tab. Switching uses a full navigation to discard query caches and pending component state. Reset restores that persona's original fixture and clears its test cart and failure mode. Exiting restores the operator's original language, branch and currency preference.

CRUD operations for every entity are local. Backend calls never fall through to the live SDK when a persona is selected. Appointment requests and team messages are local records; uploads use local data URLs. Shop placement/cancellation and concierge conversation replies are simulated. AI/unknown backend actions explicitly fail rather than invoke a live service. Exchange rates are fixed test values, not current market quotes.

These scenarios test the existing UI and customer behavior, not Base44 login, server permissions, real availability, clinical decisions, payment processing, delivery or real AI quality. OAuth consent is outside this customer testing workflow.

Five initial scenarios:
- New: no existing BATO profile; exercise onboarding without linking a phone.
- Hair: active 3/6 sessions without case file/photos.
- Skin: completed 4/4 sessions; inspect how historical programs are presented.
- Laser: active 2/6 and confirmed, pending and cancelled appointments.
- Multi: hair, skin and health; partial biomarker values and an unread team message.

Add the next 10 and then 15 fixtures to TEST_PERSONAS and seedPersona. No actual accounts or backend records are needed.

Verification:
`node src/test-mode/previewClient.test.mjs`
`npm run lint`
`npm run build`

After building, verify dist JavaScript contains no test fixture email domain, persona storage key or test panel label.

Customer walkthrough — 5 October 2026
---------------------------------------

Live preview checks, performed by the agent:
- Noura: reset to a fresh customer, skip phone linking, Arabic explorer onboarding through hair-detail/goal/branch/recommendation, complete without a phone, request a hair consultation in Kuwait, verify awaiting-confirmation status; send a local hair-team message; simulate failed save and verify warning plus retained draft.
- Omar: active 3/6 hair program with no case file, desktop/mobile dashboard progress, no invented treatment stage, failed-load retry screen and recovery.
- Sara: completed 4/4 skin program opens care history, 100% progress, recorded sessions and no package booking buttons; verified in Arabic mobile preview after switching accounts.
- Layla: laser-only dashboard shows 2/6 laser progress without hair instructions; full laser journey; AED default and KWD override; one-item pickup checkout creates an unpaid order at the matching KWD total; cancellation updates the order; mobile search results are visible and open Laser Journey.
- Youssef: separate hair/skin/health dashboard counts; Arabic partial biomarkers preserve the missing B12 result; selected skin card opens his 1/4 skin program; Arabic mobile dashboard has no horizontal overflow (358px content and scroll width).

Fixes from this pass:
- Active packages are visible even without a case file; unrelated programs no longer become hair programs.
- Program sessions and appointments are scoped by package, with conservative matching for unambiguous legacy records.
- Program links carry the selected package; completed skin history remains accessible and hair/laser history has a read-only fallback.
- Progress is bounded, zero totals do not invent sessions, and exhausted/inactive packages cannot submit a package booking.
- Missing assessment/review records remain pending rather than automatically completed.
- Visit preparation only appears for an open future appointment; cancelled appointments are excluded.
- Arabic onboarding copy, program names, session explanations, clinic visit dates/branches/types, message topic hints and readiness prompts are localized.
- Readiness prompts support keyboard interaction; redundant additional-program cards were removed.
- Dashboard load failures have an explicit retry state.

Automated checks:
`node src/test-mode/carePrograms.test.mjs`
`node src/test-mode/previewClient.test.mjs`
`npm run lint`
`npm run build`

Limitations: this verifies these five preview scenarios, not every possible customer record. Real authentication, server authorization, clinic availability, notification delivery, clinical outcomes, payment collection and fulfillment still need integration testing. They are not simulated proof of those integrations.
