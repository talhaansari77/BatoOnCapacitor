# iOS Dashboard startup JS error — defensive response fix

Observed WKWebView JavaScript exception:

`TypeError: Y.find is not a function` when rendering the dashboard's active hair package.

The original `src/pages/Dashboard.jsx` ran `.find(...)` on the result of
`base44.entities.Package.filter(...)` without checking whether it was an array.

Changes:

- Added `src/lib/entityResponse.js` to check array responses at the API boundary.
- `Dashboard.jsx` now validates its Base44 entity query results. Both array results
  and a `{data:[...]}` response envelope are handled. An error-shaped or malformed
  response causes a visible dashboard retry/error state rather than a blank screen.
- Added guards for a malformed `Package` query cached elsewhere in React Query.
- Added `entityResponse.test.mjs` to cover the response guard.

**This does not fix backend/API configuration or Base44 browser-redirect authentication.**
If the dashboard shows an error after these changes, inspect the WKWebView Console
and Network panel in Safari > Develop, and check `VITE_BASE44_APP_ID`,
`VITE_BASE44_BACKEND_URL`, Base44 session, HTTP status, and CORS. Do not print or
share access tokens or patient payloads.

Rebuild and copy changed web assets into the native project before running:

```
npm install
npm run native:sync
npm run native:ios
```

If iOS project already exists, `npm run native:sync` followed by rebuilding from Xcode
is sufficient; `npm run native:ios` also syncs and opens Xcode.
