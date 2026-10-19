# BATO Clinic — Capacitor standalone iOS UI preview

This archive contains the **original Base44 export** plus a **Capacitor iOS mobile build adaptation**. The native application starts at Welcome, has a local simulated sign-in, runs the original onboarding screens using fictional local records, and then shows the dashboard. It does **not** require a Base44 server or Node.js API for its initial UI flow.

**Start here:** [STANDALONE_IOS_README.md](./STANDALONE_IOS_README.md)

On a Mac with a recent Node.js version and Xcode:

```bash
npm install
npm run ios:demo
```

**This is a source project, not a pre-signed IPA.** Backend functionality and real authentication are not implemented. Never enter real patient data in this demo.
