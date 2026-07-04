import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { defineConfig } from "vite";

// ライブラリ配布 (build.lib) と dev playground (index.html) を 1 つの設定で兼ねる。
// `vite` (dev) は ルートの index.html を HMR で配信し src を直接読む。
// `vite build` は build.lib に従い dist/index.js + 型を出す (index.html は無視)。
export default defineConfig({
  plugins: [
    react(),
    // src から .d.ts を dist へ出す。index.d.ts が同階層へ re-export する構成。
    dts({ include: ["src"] }),
  ],
  build: {
    sourcemap: true,
    target: "es2020",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      // React は利用側が用意する (二重ロード防止)。
      external: ["react", "react-dom", "react/jsx-runtime"],
    },
  },
});
