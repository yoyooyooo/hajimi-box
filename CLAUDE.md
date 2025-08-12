# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a monorepo for hajimi-box, a desktop application built with Tauri. The project structure:

- **Root**: Bun workspace configuration with shared scripts
- **apps/box**: Main Tauri desktop application
  - Frontend: React + TypeScript + Vite
  - Backend: Rust with Tauri framework
  - Custom hooks for Tauri command invocation and window management

The application demonstrates a simple React frontend communicating with Rust backend through Tauri's invoke system.

## Commands

### Development
```bash
# Install all dependencies
bun install

# Run desktop app in development mode
bun run dev:box
# or
bun run dev

# Type checking for the box app
bun run --filter box check
```

### Building
```bash
# Build desktop app for production
bun run build:box
# or  
bun run build

# Build frontend only (inside apps/box)
bun run build
```

### Cleaning
```bash
# Clean all node_modules and Rust target directories
bun run clean:deps

# Clean all dist directories
bun run clean:dist

# Clean everything
bun run clean
```

## Key Components

- `apps/box/src/hooks.ts`: Custom React hooks for Tauri integration
  - `useTauriCommand<T>`: Generic hook for invoking Rust commands
  - `useWindowSize`: Hook for tracking window dimensions
- `apps/box/src-tauri/src/lib.rs`: Rust backend with Tauri commands
- Frontend uses React 18 with TypeScript strict mode

## Requirements

- Bun 1.2+
- Rust toolchain (rustup, cargo, rustc)
- Platform-specific Tauri dependencies (e.g., Xcode on macOS)
- 永远不要帮用户启动服务,他自己会做的,你只需提示用户可以这么做了