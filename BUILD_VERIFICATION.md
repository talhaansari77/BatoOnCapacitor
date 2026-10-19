# Build and test status — local sign-in edition

- PASS: Local-only sign-in session helper tests (`npm run test:local-auth`): 2 tests.
- PASS: iOS-mode offline-adapter integration check executed on source: local login, account isolation, onboarding persistence, logout, fictional product records.
- PASS: Syntax parsing of 7 edited JSX/JS files with the installed TypeScript parser.
- PASS: 12 of the 14 original smoke tests without npm packages installed.
- NOT RUN: Two other tests depend on `lucide-react` and `date-fns`, neither installed in this environment.
- NOT RUN: Full Vite bundle and Xcode simulator compilation. npm registry was unreachable here (`EAI_AGAIN`).

On Mac, run `npm install && npm run ios:local`, then Xcode → Run. Build/install confirmation requires that native run.
