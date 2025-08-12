import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // 路径别名配置
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // 构建配置
  build: {
    // 构建输出目录
    outDir: "dist",
    // 源码映射
    sourcemap: false,
    // 清除构建目录
    emptyOutDir: true,
    // 构建目标
    target: "esnext",
    // 资源内联限制
    assetsInlineLimit: 4096,
    // Rollup 选项
    rollupOptions: {
      output: {
        // 代码分割
        manualChunks: {
          vendor: ["react", "react-dom"],
          tauri: ["@tauri-apps/api"],
        },
      },
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1450,
    strictPort: true,
    host: host || false,
    // 开发服务器配置
    open: false,
    cors: true,
    hmr: host
      ? {
          protocol: "ws" as const,
          host,
          port: 1461,
        }
      : true,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**", "**/target/**"],
    },
  },

  // 环境变量前缀
  envPrefix: ["VITE_", "TAURI_"],

  // CSS 配置
  css: {
    // 开发时保留注释
    devSourcemap: true,
  },
});
