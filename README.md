# hajimi-box

Monorepo initialized with Bun workspaces. The desktop app lives at `apps/box` and uses Tauri.

Structure
- apps/box: Tauri (Rust + Vite + TS) app scaffolded via create-tauri-app

Requirements
- Bun 1.2+
- Rust toolchain (for Tauri): rustup, cargo, rustc
- Platform-specific deps for Tauri (e.g., Xcode on macOS)

Commands
- Install all deps: `bun install`
- Run desktop app (dev): `bun run dev:box`
- Build desktop app: `bun run build:box`

Notes
- The app was scaffolded with the `vanilla-ts` template and Bun as the package manager.
