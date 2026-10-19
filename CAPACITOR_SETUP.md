# BATO Clinic — Capacitor Android + iOS starter

This project is the **original Base44 React/Vite export**, with a Capacitor
mobile shell added. All existing screens, CSS, language choices, and theme
logic remain in place. Capacitor is a **native WebView container**, not a
React Native conversion.

## What has been prepared

- `capacitor.config.ts`: BATO Clinic display name, `dist` asset directory,
  secure local origin; change the placeholder bundle ID before publishing.
- `vite.config.js`: mobile mode uses relative asset paths and skips the
  Base44 *editor* plugin. App runtime still uses Base44's SDK.
- `src/native/MobileNavigation.jsx`: Android hardware back key support.
- `src/api/nodeApiClient.js`: reusable HTTPS JSON/FormData client *foundation*;
  nothing calls it yet because the Node API specification was not provided.
- App scripts in `package.json` and `scripts/setup-native.mjs`.
- A **temporary B** favicon. Replace with approved clinic branding.

## Mac setup (required for iOS)

You need Node.js 22+, npm, Xcode (iOS) and Android Studio/Android SDK
(Android). The ZIP intentionally excludes `node_modules`, generated native
projects and compiled app binaries.

```bash
npm install
cp .env.mobile.example .env.mobile.local
# Edit .env.mobile.local with the applicable PUBLIC backend URL(s).
npm run native:init             # On macOS generates android/ and ios/
npm run native:android          # Opens Android Studio
npm run native:ios              # Opens Xcode (macOS only)
```

The native setup script builds Vite output, calls `cap add` for each missing
platform and `cap sync`. On non-macOS machines the default only creates
Android. For Android only on a Mac: `npm run native:init -- --android`.
For iOS only: `npm run native:init -- --ios`.

For subsequent code changes, run `npm run native:sync` before rebuilding in
Android Studio or Xcode. `npm run native:build` alone only creates web assets.

You can also use explicit CLI commands:

```bash
npm run native:build
npx cap add android
npx cap add ios
npx cap sync
npx cap open android
npx cap open ios
```

The `cap add` commands should be run **once** per platform, not on every build.
Your IDE then creates Android debug APK / release AAB or a signed iOS IPA.
Store/distribution builds require your own package identifier, app icons,
certificates/provisioning and signing configuration.

## Critical: backend integration is NOT yet finished

There are approximately 45 Base44 entity definitions and numerous calls to
`base44.auth`, `base44.entities`, `base44.functions`, `base44.integrations`,
and `base44.agents` throughout the project. The ZIP does **not** include your
separate Node.js API, its endpoints, authentication contract or a mapping of
entities to REST endpoints.

The React screens are prepared to build and display under Capacitor, but patient data,
authentication, appointments, ordering, payments, chat, uploads and AI calls
will **not** automatically work with your Node API merely because the new
`VITE_API_BASE_URL` variable is set. For a complete conversion we need your
Node.js backend (or OpenAPI/Postman collection). We should then:

1. Implement native-compatible sign-in/session flows and authorization.
2. Map Base44 entities/functions to Node endpoints, including pagination.
3. Migrate each feature screen/hook and replace the central Base44 client.
4. Verify file uploads, checkout/web payment callbacks, chat notifications,
   app lifecycle and error handling on real iOS/Android devices.
5. Protect patient information with HTTPS, proper server-side permissions,
   and secure token storage; never embed private backend credentials in Vite.

**Base44 sign-in note:** `AuthContext.jsx` and `SwitchAccount.jsx` assume
browser-based redirects and Base44 app/public-settings. These will require
native auth integration; a `capacitor://localhost` callback is not by itself
a working OAuth redirect. For first runs, do not expect a fully authenticated
app until the backend has been connected.

## Validation limits

This package was prepared in an environment without npm registry network
access or native iOS/Android build tooling. It has **not** been compiled into
an APK/AAB/IPA or tested on a simulator/device here. Run `npm install`,
`npm run native:build` and `npm run native:init` locally and report errors.

## Security note

The entire Vite client bundle is visible to an app user; `VITE_` variables are
never secret. Do not include signing keys, private API credentials, server-side
Base44 service-role keys or database connection strings in these files.
