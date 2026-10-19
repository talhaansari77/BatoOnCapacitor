# BATO Clinic — iOS standalone UI with local sign-in

## Goal

Run the original Base44 React interface inside Capacitor on iOS and exercise the real navigation order **Welcome → Sign in / Create account → Onboarding → Dashboard** before the Node.js APIs are ready.

## What changed in this edition

- The Sign In actions on `Welcome.jsx` now open `src/pages/SignIn.jsx` instead of a demo-button page.
- `SignIn.jsx` includes a bilingual, BATO-styled email/password screen and a Create account tab.
- Mobile-only local session logic is isolated in `src/native/localAuth.js`, with persistent per-email fictional data stored by the offline preview adapter in `src/test-mode/previewClient.js`.
- New users enter onboarding, returning users with completed onboarding go to Dashboard; logout returns to Welcome; relaunch restores the local session.
- The old fixed demo banner and Welcome notice have been removed. Error screens no longer describe themselves as demo.
- Existing web/Base44 behavior outside mobile build mode remains unchanged.
- Previous v1 offline demo sessions do not grant a session in this version, so the new sign-in screen is shown.

## Mac simulator instructions

Open Terminal inside the extracted folder and run:

```sh
npm install
npm run ios:local
```

In Xcode choose an iPhone simulator and click Run. **After every source edit**, rebuild the bundled assets before pressing Run:

```sh
npm run native:sync
npx cap open ios
```

If you previously ran this app, you may still see old WebView assets until `native:sync` is run and the app is rebuilt in Xcode. Capacitor native folders from an earlier workspace can be kept; this exported ZIP contains source and the setup script to generate them.

## How to check

1. A fresh installation opens Welcome.
2. Tap **Sign In**; you should now see the BATO email/password form.
3. Use only made-up email and test password of at least six characters. Select Sign in or Create account.
4. Finish the existing onboarding flow to reach Dashboard. Use Logout to return to Welcome.
5. Sign in again with the same test email; completed onboarding should remain saved.
6. Sign in with a *different* test email and verify its onboarding progress is independent.

## Critical limitations

**This is a local UI flow, not real authentication.** The entered password is discarded and **not** verified, stored or sent. The app saves only a mock email/name session in WebView localStorage and fictitious local records, which are **not suitable for real patient data, medical records, or production use**. Do not use a real password or real patient information.

Real account registration, password verification, OTP, secure session management, email delivery, booking, payments and actual clinic data require the future Node.js API integration.

This ZIP is Capacitor-ready **source**, not a signed IPA. Native compilation and simulator/device testing require macOS with Xcode and installed npm dependencies.
