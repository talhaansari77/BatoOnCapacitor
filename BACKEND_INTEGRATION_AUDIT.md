# BATO Clinic: backend replacement / integration audit

This is a preliminary **source inventory**, not a claim that endpoints have been connected.
The provided export includes 45 Base44 entity schemas and 7 server functions; the
separate Node.js API is not present in the attachment.

## Existing integration points

| Area | Examples seen in the React source | Needed from Node.js API |
| --- | --- | --- |
| Authentication and accounts | `base44.auth.me`, `loginViaEmailPassword`, `redirectToLogin`, `logout`, `updateMe` | Login/refresh/logout/session endpoints, identity shape and authorization model |
| Patient profile and care | `BATOProfile`, `CaseFile`, `ProfileLinker`, `TreatmentGoal`, `ProgressPhoto` | Profile CRUD, patient ownership rules, clinical records and media uploads |
| Booking and journeys | `Appointment`, `TreatmentSession`, `Package`, `ConsultationOutcome` | Services/slots/booking/reschedule/cancel endpoints and validation |
| Notifications and chat | `Notification`, `Message`, agent conversations | Message CRUD/realtime or polling, notification statuses/push plan |
| Shop and billing | `Product`, `Order`, `Payment`, `Invoice` | Catalog/cart/checkout/order/payments endpoints and secure webhooks |
| Community and loyalty | `CommunityPost`, `CommunityLike`, `CommunityComment`, `Referral`, `ClientLifecycle`, `PointTransaction` | Feed moderation, points calculations, referral rules and access control |
| Training/assessment/AI | `AcademyContent`, `AcademyProgress`, `AssessmentLead`, `Core.InvokeLLM` | LMS/progress, assessments, LLM calls proxied via server |

## Existing Base44 server functions (not included in Capacitor's web bundle)

- `place-order`: order creation and checkout validation — implement securely on the server.
- `cancel-shop-order`: cancellation/refund conditions and authorization.
- `exchange-rates`: rate fetch and currency rules.
- `recalculateBiomarkerInterpretations`: health data calculations (server-side).
- `makeUserAdmin`: **privileged** administrative operation; never ship admin privileges to the app.
- `createTestBiomarkers` and `seedProgressPhotos`: test/seed functions; do not expose to production patients.

## High-priority mobile risks to resolve after receiving the backend

1. **Login/session:** current `AuthContext.jsx` fetches Base44 public settings and uses
   browser redirect URLs. Native sign-in needs a deliberate session and deep-link plan;
   client storage must not contain server secrets. Use secure native storage for tokens.
2. **Database/data ownership:** client-side Base44 entity filters are not a substitute
   for Node API authorization; each request must be restricted to the authorized patient.
3. **Uploads:** `Core.UploadFile` is used for progress photos and community media.
   Plan for file-size limits, content validation, protected URLs and upload permissions.
4. **Payments:** do not compute trusted totals on the mobile device; confirm amounts
   server-side and handle payment callbacks via verified server/webhook integration.
5. **AI:** `Core.InvokeLLM` and agent calls need corresponding protected Node services.
6. **Network/CORS:** WKWebView/Android WebView have app origins such as
   `capacitor://localhost` / `https://localhost`. Configure CORS as appropriate;
   all real patient APIs should use HTTPS.
7. **QA:** validate Arabic/English, three style themes and both light/dark modes,
   native back button, uploads/camera, keyboard, payment return links and deep links.

## Best next file to provide

Provide the Node.js API project ZIP or its OpenAPI JSON / Postman collection,
plus a note about its authentication scheme. We can then map the above Base44
calls to concrete routes and implement features screen by screen.
