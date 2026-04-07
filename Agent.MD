# Agent Notes

## 2026-04-07 — Windows CI E2E startup timeout root cause

- Symptom: GitHub Windows CI E2E repeatedly timed out during `launchElectron()` / `beforeAll`.
- Actual root cause uncovered by `tools/electronPreflight.js`: Electron main process was failing very early because native addon `ced.node` was missing, so the GUI never reached first-window creation.
- Why it was confusing: the failure initially looked like a slow startup problem, but deeper diagnostics showed `src/main/filesystem/encoding.js` imported `ced` eagerly at main-process startup.
- Important build-chain detail: `yarn install` may build native modules for the host Node runtime, but Electron still needs ABI-compatible rebuild output. Earlier CI changes skipped the rebuild path, which can leave `ced` unavailable for Electron.
- Practical guidance for future agents:
  - Do not assume E2E startup timeouts are timing-only issues; check main-process stderr / native bindings first.
  - When investigating Electron startup failures, inspect `test-artifacts/electron-preflight/` and `test-artifacts/e2e-launch/`.
  - If `ced.node` is missing on Windows CI, verify the `rebuild:ced` step and the uploaded native-module diagnostics before changing timeouts again.

## 2026-04-07 — Fork release workflow pitfalls

- Surprise #1: `electron-builder` published against the upstream `marktext/marktext` release because `package.json.repository.url` still pointed at the upstream repo. In GitHub Actions, the release job looked successful, but assets were skipped with `existing type not compatible with publishing type` because upstream already had a published `v0.17.1`.
- Fix: add explicit `publish` config in `electron-builder.yml` and source `owner` / `repo` from workflow env (`EP_GH_OWNER`, `EP_GH_REPO`) so release assets go to the current fork instead of relying on repository autodetection.
- Surprise #2: the Windows `rebuild:startup-native` step was intended to be diagnostic-only, but a non-zero `electron-rebuild` exit still failed the GitHub Actions step before the rest of the Windows verification/build pipeline could run.
- Fix: mark that step `continue-on-error: true` in the release workflow so diagnostics are still captured, while lint/tests/build continue.

## 2026-04-07 — Windows packaged app missing keytar.node

- Symptom: the installed Windows app crashed in the Electron main process with `Cannot find module '../build/Release/keytar.node'` while loading `keytar/lib/keytar.js`.
- Actual root cause: upstream `keytar@7.9.0` ships a `files` whitelist that excludes its compiled `build/Release` directory. `electron-builder` therefore packaged `lib/keytar.js` into `app.asar` but dropped `build/Release/keytar.node`, so startup crashed before the first window opened.
- Practical guidance for future agents:
  - If a packaged app crashes on startup with a missing native addon, inspect both the dependency's own `package.json.files` field and `resources/app.asar.unpacked`, not just the source `node_modules` tree.
  - For `keytar`, keep an explicit include such as `node_modules/keytar/build/Release/**/*` in `electron-builder.yml`, because `asarUnpack` cannot unpack files that were never copied into the package.
  - Keep the main-process `keytar` load lazy/optional so packaging regressions degrade GitHub token persistence instead of crashing the whole app.
  - Surprise during local packaging: even `electron-builder build --publish never` still expands `${env.EP_GH_OWNER}` / `${env.EP_GH_REPO}` from `electron-builder.yml`. If you run Windows packaging locally, export those env vars first or the build can fail before artifacts are finalized.
