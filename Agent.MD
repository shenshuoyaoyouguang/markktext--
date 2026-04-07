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
