# tdiih

"This Day in Islamic History" — an Expo / React Native (SDK 54, TypeScript) mobile
app. The app lives in `mobile/`; `docs/` is the GitHub Pages source that serves the
live `events.json` content feed.

## Cursor Cloud specific instructions

- The app code is in `mobile/`. Run all `npm`/`expo` commands from there. Standard
  scripts are in `mobile/package.json` (`start`, `start:tunnel`, `android`, `ios`).
  Lint/typecheck is `npx tsc --noEmit` (strict TS; no ESLint configured).
- No iOS Simulator / Android emulator exists in the cloud VM. To run and visually
  verify the app, use the **web target**: `cd mobile && npx expo start --web` and open
  `http://localhost:8081` in Chrome. The web runtime deps (`react-dom`,
  `react-native-web`, `@expo/metro-runtime`) are installed for this purpose; Expo Go
  on a device remains the primary target for real use.
- Metro started with `CI=1` runs in CI mode (no file watching / hot reload). After
  editing code, restart Metro and clear caches (`rm -rf mobile/.expo mobile/node_modules/.cache`)
  to pick up changes. Drop `CI=1` to get normal watch-mode hot reload.
- `babel-preset-expo` gotcha: with npm it tends to nest under `expo/node_modules`
  (cyclic `peerOptional expo`), which makes Metro fail with
  `Cannot find module 'babel-preset-expo'`. It is pinned as an explicit
  `devDependency` so `npm install` hoists it to top-level `node_modules`. If you ever
  hit that error, confirm `mobile/node_modules/babel-preset-expo` exists.
- Event data is keyed by Hijri **day-month** (e.g. `"17-9"` = 17 Ramaḍān, `"10-1"` =
  10 Muḥarram), not month-day. `hijriKey()` in `src/utils/hijri.ts` must match this.
- Content is offline-first: `mobile/src/data/events.json` is bundled into the app and
  `docs/events.json` is the remote copy fetched from GitHub Pages on launch. Keep the
  two in sync; bump `version` in the remote copy when you want clients to adopt it.
  Remote fetch failures are swallowed and the app falls back to bundled data.
