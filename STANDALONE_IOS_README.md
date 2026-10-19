# BATO Clinic — Standalone iOS UI preview

This is the original Base44 React/Vite export adapted as a **locally bundled Capacitor iOS app**. It includes the existing app screens and navigation, plus the previously reported dashboard array-guard fix.

## What this build does

- Bundles app UI assets into the native iOS app (not a hosted website wrapper).
- Boots to **Welcome** rather than Dashboard.
- **Welcome → simulated sign-in → original onboarding → Dashboard**. Returning demo sessions with completed onboarding go straight to Dashboard after tapping Continue.
- Uses an isolated, **fictional local data store** for Base44 entities in `vite build --mode mobile`, so it does not require a Base44 app ID or Node.js backend to display initial screens.
- The local preview persists sample records in the WebView's localStorage for app restarts. No real patient data should be entered.
- Adds a constant banner labeling the entire demo as offline/simulated. Unfinished screens show a recoverable error rather than leaving a blank WebView.
- The desktop/web mode remains unchanged, and the isolated store is **never** substituted for a production hosted web build.

## Mac — compile/run on an iOS simulator

```
npm install
npm run ios:demo
```

In Xcode, select a simulator, Product → Run. `ios:demo` creates the `ios/` project on your Mac, syncs the compiled assets, and opens Xcode.

For subsequent source changes:

```
npm run native:sync
npx cap open ios
```

To run on a real iPhone you must select an Apple development team under Xcode → Signing & Capabilities; a signed IPA/archive requires Apple's signing and macOS/Xcode tools.

## How to test

1. Launch BATO. Confirm **Welcome** is displayed with demo notice.
2. Tap **Sign In** → **Continue with demo data**.
3. Select **I'm exploring BATO** or **I already have an appointment** to test the original onboarding form, navigate the steps, and complete the appearance step.
4. Enter Dashboard, explore tab navigation and other screens. All local actions are simulations.
5. Relaunch the app; demo onboarding state remains in local storage.

If the UI is empty after a source change, run `npm run native:sync` again. Xcode might still be running an old bundled web build.

## Limitations — important

- This is **not a production-ready clinic app** and **does not provide real patient authentication, medical records, live appointments, real messages, real orders, notifications, or payments**.
- Some functions (cloud AI, external integrations, PDF/email delivery, appointment submission, external redirects) cannot work without services and may show error/disabled states. This should be addressed after receiving the Node.js API project.
- This repository is a source project, **not** an IPA. A signed iOS build cannot be produced without Xcode/macOS/signing.
- The embedded data store is for fictional content only; it is **not an encrypted or compliant storage solution for medical data**. Uploading photos/files is explicitly disabled in the standalone iOS demo.
- Capacitor packages must be installed by `npm install` and may require an environment with internet access to retrieve them.
