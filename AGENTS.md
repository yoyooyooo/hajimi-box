# Repository Guidelines

## Project Structure & Modules
- Root: Bun workspaces monorepo (`package.json`, `bunfig.toml`).
- App: `apps/box` — React + Vite frontend (`src/`) and Tauri Rust backend (`src-tauri/`).
- Frontend: components and hooks under `apps/box/src` (alias `@` → `apps/box/src`). Assets in `apps/box/src/assets`.
- Backend: Rust code in `apps/box/src-tauri/src`, SQLx migrations in `apps/box/src-tauri/migrations`.
- Docs/scripts: `README.md`, ad‑hoc test helpers `quick-test.ts`, `test-crud.ts`.

## Build, Test, Dev
- Install deps: `bun install` (at repo root).
- Run app (dev): `bun run dev:box` (starts Vite + `tauri dev`).
- Build app (release): `bun run build:box` (Vite build + `tauri build`).
- Clean artifacts: `bun run clean`.
- App-local: from `apps/box` — `bun run tauri:dev`, `bun run tauri:build`, `bun run check`.
- CRUD smoke tests: in dev, open app DevTools Console and run `runSqlxTests()` (from `test-crud.ts`).

## Coding Style & Naming
- TypeScript/React: 2-space indent; functional components; files `PascalCase.tsx` for components, `camelCase.ts` for utilities; keep module paths using `@/...` alias.
- Rust (Tauri): follow rustfmt defaults; modules in separate files; avoid blocking on async (`tokio` used throughout).
- Imports: prefer ESM; avoid default exports for React components.

## Testing Guidelines
- Framework: none configured; rely on manual and ad‑hoc tests.
- Database: migrations live in `apps/box/src-tauri/migrations` and run automatically on startup.
- Quick checks: `quick-test.ts` and `test-crud.ts` exercise `invoke` commands (`init_db`, `create_user`, etc.). Use the console inside `tauri dev`.

## Commit & PR Guidelines
- Commits: use Conventional Commits where possible (e.g., `feat(box): add user manager UI`, `fix(tauri): handle DB init error`).
- PRs: include purpose, linked issues, platform tested (macOS/Windows/Linux), and screenshots/GIFs for UI changes. Mention any schema/migration changes and upgrade notes.

## Security & Configuration
- Secrets: keep local values in `apps/box/.env.local`; do not commit secrets.
- Paths: app stores the SQLite DB under the OS app-data dir; don’t hardcode absolute paths.
- Permissions: review `src-tauri/tauri.conf.json` and `capabilities/` when adding plugins or file access.

