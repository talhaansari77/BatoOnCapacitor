# Customer mobile design acceptance
Scope: customer-facing routes; 320/390/430px, English/Arabic, Atelier/Prism/Contour light/dark.
Preserve Hair priority, journey discovery, icon-only navigation, Academy identity, narrow desktop.
No production publishing or real-customer transactions in verification.

## Fixed acceptance criteria
1. Alignment: shared edges; no horizontal overflow; ring and text columns agree.
2. Contrast: normal copy target 4.5:1, meaningful controls 3:1; verify translucent composites.
3. Balance: compact primary surface; supporting content visible; retain Hair prominence.
4. Hierarchy: unique purpose, primary action, coherent title/section/metadata levels.
5. Color: roles for text, surfaces, controls, icons, progress, selected and disabled states.
6. Space: coherent grouping; no nested empty-state padding or accidental giant blank areas.
7. Proportion: aligned icon optical bounds, touch targets, small emblems excluded from hero styling.
8. Repetition: shared section, control, empty/loading and progress components.
9. Rhythm: chapters, open closed-disclosure rows, surfaced expanded detail.
10. Movement: logical reading order, direction-aware layout and reduced-motion behavior.
11. Emphasis: prominent primary action, quieter secondary options, no repeated Hair Assessment eyebrow.
12. Proximity: next-date label/value grouped; errors with inputs; session count with progress.
13. Unity: booking, profile, communications, commerce and care use the same functional rules.

## Observed defects and fixes in this pass
- Appointment empty state fixed brown in Contour; duplicate nested padding.
- Small avatars/emblems incorrectly inherited full hero padding/material rules.
- Booking calendar dates and step indicators retained fixed brown selected styling.
- Calendar disabled dates lacked clear differentiation in dark mode.
- Dialog action/focus and form borders did not follow all three styles.
- Loading shimmer retained warm colors in cool/dark styles.
- Closed care disclosure cards repeated full card relief continuously.
- Dashboard care links consumed three full rows and pushed progress down.
- Hair navigation bulb approached SVG boundary.
- Page badges used faint legacy gray.
- Repeated Hair Assessment eyebrow diluted hierarchy.

Verification status is recorded after rendered checks; this file is not a claim that every app state has been tested.


## Verification completed in this pass
- Production build and ESLint passed, including final verification after fixes.
- Rendered customer review: active Hair dashboard, Hair discovery, expanded Hair case, booking date/time/review, appointment empty state, Profile appearance controls, Messages, Shop, Billing, Orders, ClinicTeam, Community, BATO Circles, Updates, Academy, and Arabic Skin/Laser/Health/Aesthetic discovery.
- Onboarding summary/progress and final personalization screen reviewed using a fictional local test persona. No real appointment, purchase or message was submitted.
- Six style/mode recipes reviewed across representative screens. 320px Arabic dashboard, 390px main review, and 430px Arabic entry screens checked. This is representative coverage, not every route multiplied by all widths/languages/states.
- Arabic and English selected-state controls, icon-only navigation labels, Hair ring, shared form borders and dialog surfaces checked.
- Narrow Arabic dashboard and Hair discovery DOM widths equal their content widths: no horizontal document overflow in those checks.
- Route reset corrected to reset both document and inner scrolling on route changes, while preserving explicit hash targets. Hair discovery confirmed at scrollTop 0 after navigation.
- Existing reduced-motion wrapper retained; skeleton animation explicitly disabled for reduced motion.
- Current fixtures include missing clinical records and empty states; real data-dependent long content and every backend error permutation are not claimed as visually verified.

## Contrast sample, calculated from palette recipes
Minimum across gradient endpoints; transparent surface and hero endpoints composited over their declared page background. These are token-pair checks, not an assertion that every rendered pixel in the app passed.
| Appearance | Secondary surface text | Secondary hero text | Control text | Hero action text |
| --- | ---: | ---: | ---: | ---: |
| atelier light | 5.27 | 5.27 | 12.45 | 12.45 |
| atelier dark | 6.61 | 7.44 | 11.11 | 7.75 |
| prism light | 10.33 | 8.41 | 11.75 | 11.75 |
| prism dark | 6.62 | 5.46 | 10.49 | 10.49 |
| contour light | 5.45 | 5.40 | 12.45 | 11.24 |
| contour dark | 6.53 | 6.40 | 6.91 | 6.91 |

## Additional defects resolved during rendered review
- Shop category badges had pale-on-pale text in dark mode.
- Shop, Community, Circles and location selectors retained fixed brown selected states; shared filter role applied and missing pressed semantics added.
- Academy tab bar inherited brown care styling; dedicated navy light/dark states applied.
- Billing tab wrapping produced an uneven 3+1 arrangement; responsive 2/4-column grid applied.
- Onboarding primary action had pale text on a warm fill; explicit shared action colors applied.
- Onboarding progress gradient and tiny metadata corrected; summary emphasis follows theme.
- Dashboard avatar inherited hero text color over its fixed gold fill; explicit action-pair role applied.
- Arabic select checkmark/padding now use logical start/end alignment.
- Drawer emblems now have explicit contrasting icon colors.
- Outer document scroll was retained on navigation; route reset now handles both scrolling containers.


- Profile and Academy Radix tab roots now receive explicit RTL/LTR direction so keyboard and visual ordering follow the selected language.

## Follow-up: populated records and recovery, 8 October 2026
- Reviewed fictional multi-currency billing records and the populated Arabic invoice dialog at 320px. Dialog client/scroll widths both measured 286px.
- Added RTL-aware ArrowLeft/ArrowRight, Home/End, roving tabIndex and labelled billing panels; verified focus and selected state move together and Home returns to invoices.
- Invoice identifiers, totals and line items can wrap; receipt action uses the theme control pair. Unit price and quantity now have separate localized labels to avoid bidirectional multiplication ambiguity.
- Shared loading/error card has a clear heading, readable themed surface and minimum-height retry action. A simulated read failure rendered correctly; pressing Retry restarted loading. Normal test loading restored afterward.
- Skeleton bars are capped to their container; flex text columns can shrink; loading header wraps and avatar spacing uses logical direction.
- Build, ESLint and existing mobileInteraction/customerNavigation test files passed.

- Populated Academy cards and Community reviewed at 320px; Community document/content widths both 305px. Localized system category badges (General etc.) after the Arabic populated-state check exposed English labels. Customer-authored content remains unchanged.

## Checklist closure — 8 October 2026
The earlier representative-pass statements above are retained as history. This section records the expanded final verification and the finite acceptance checklist that was closed.

### Route matrix
26 customer routes were exercised in all 12 combinations of Atelier/Prism/Contour, light/dark, English/Arabic, at 320/390/430px: 936 route/appearance/width structural observations. No horizontal document overflow or unnamed visible controls remained in these observations. Intentional internal scrollers were excluded from the overflow check; RTL scrollbar offsets were accounted for. These are DOM layout/name checks, not 936 independently scored visual designs.

Routes: Dashboard, HairJourney, SkinJourney, LaserJourney, HealthJourney, AestheticCare, ClinicAppointments, Appointments, Messages, Profile, Shop, Orders, MyBilling, Rewards, Academy, Community, BATOCircles, Updates, ClinicTeam, ClinicServices, ClinicLocation, TreatmentPlan, Welcome, HairAssessment, ProfileConnection, Onboarding?edit=1. Welcome correctly redirects an already-onboarded customer to Dashboard. Legacy care aliases were inspected for preserved query/hash routing.

### Final interaction checks
- Completed the six-question Arabic Hair assessment with fictional data. Next stays disabled without an answer; selections enable it. Advancing focuses the new question and places it below the fixed header.
- Reviewed the localized assessment summary and followed its Hair appointment action. The requested care team remains Hair.
- Selected date/time, reviewed, and submitted a fictional Arabic booking at 320px. Dialog clientWidth and scrollWidth both 286px. The dialog closed and the appointment showed awaiting confirmation.
- Opened rescheduling, checked blank submission does not send a request, then closed it. Customer-service contact opens the administrative channel.
- Sent an Arabic fictional message; the message appeared and the composer cleared. The narrow composer keeps a full-width writing row.
- Used Profile > Account appearance radios to select light, Prism and System; theme/mode changes apply through customer controls. Exactly three styles remain.
- Rechecked active Hair dashboard and expanded case with Omar, including 3/6 session progress, missing clinical records, discovery links and theme changes. Session completion is not presented as a medical outcome.
- Earlier checks in this same work include populated billing/learning/community, long invoice wrapping, RTL billing keyboard navigation, read failure/retry, booking review, onboarding personalization and five-persona regressions.

### Last defects closed
- Legacy appointment header double-reversed RTL; logical spacing and ordinary RTL flex ordering restored.
- Legacy appointment date blocks/status labels followed fixed colors and cramped rows; theme roles, larger metadata and wrapping applied.
- Both appointment views now use the shared loading/error/retry component.
- Appointment request arrows and assessment back/next arrows follow RTL.
- Hair assessment options and progress used faint fixed gold; meaningful outlines, selected marks, labels and progress now use theme roles. Added an accessible progressbar.
- Assessment step/summary focus and scrolling corrected; summary metadata enlarged and action colors themed.
- Conversation header inherited oversized hero padding; compact header padding restored. At 320px the composer gets a full-width text row with separate actions.
- Temporary audit harness and bridge removed after verification.

### Thirteen principles — accepted against the criteria above
| Principle | Closure evidence |
| --- | --- |
| Alignment | Shared gutters/edges, 936 structural observations, RTL controls, aligned ring/text columns |
| Contrast | Palette composite checks above; themed form outlines, selected states, dialog actions, assessment progress |
| Balance | Hair remains the dominant dashboard surface; secondary care discovery remains available |
| Hierarchy | Page/section/metadata levels; clear next action; compact conversation chrome |
| Color | Three intentional recipes in both modes; shared functional color roles; Academy navy retained |
| Space | Empty-state padding fixed; smaller emblems excluded from hero padding; usable narrow composer |
| Proportion | Bounded progress geometry, corrected Hair icon bounds, readable metadata and primary touch controls |
| Repetition | Shared controls, retry/loading/empty states, progress and care section patterns |
| Rhythm | Quiet collapsed rows, surfaced expanded detail and distinct section introductions |
| Movement | Direction-aware arrows/tabs, route reset, assessment focus/scroll, reduced-motion components |
| Emphasis | Hair priority, one primary next action per task, quieter supporting choices |
| Proximity | Related dates/counts and records grouped; progress beside sessions; form state near actions |
| Unity | Care, appointments, assessment, profile and communications obey common rules without removing style identities |

### Final verification boundary
Build, lint and all 13 regression tests passed after the functional/design changes; the final production build was repeated after audit-tool removal. Tests include five fictional customers, failed saves/retries, department isolation, currency handling, navigation, localization and mobile composer behavior. Visual review includes representative rendered screens and populated/error/empty/selected/disabled states; it cannot prove every possible future record, physical device or browser rendering. Real payments, live clinic delivery and real-account authentication were not exercised. No production publish was performed.
