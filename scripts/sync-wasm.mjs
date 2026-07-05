// ichigojam-rsの web クレートをビルドし、生成された wasm グルーと
// base64 インライン版を src/wasm/ へ同期する。
//
// 使い方:
//   IJ_RUST_DIR=/path/to/ichigojam-firm node scripts/sync-wasm.mjs
import { execFileSync } from "node:child_process";
import { mkdtempSync, copyFileSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(here, "..");
const rustDir = process.env.IJ_RUST_DIR ?? resolve(pkgRoot, "../../rust/ichigojam-firm");
const webCrate = join(rustDir, "ichigojam-rs", "web");
const wasmPath = join(rustDir, "target/wasm32-unknown-unknown/release/ichigojam_web.wasm");
const outDir = join(pkgRoot, "src", "wasm");

const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: "inherit" });

console.log(`[sync-wasm] building wasm in ${webCrate}`);
run(
  "cargo",
  ["build", "--release", "--target", "wasm32-unknown-unknown", "-p", "ichigojam-web"],
  rustDir,
);

const tmp = mkdtempSync(join(tmpdir(), "ijweb-"));
console.log(`[sync-wasm] wasm-bindgen -> ${tmp}`);
run("wasm-bindgen", [wasmPath, "--target", "web", "--out-dir", tmp]);

mkdirSync(outDir, { recursive: true });
copyFileSync(join(tmp, "ichigojam_web.js"), join(outDir, "ichigojam_web.js"));
copyFileSync(join(tmp, "ichigojam_web.d.ts"), join(outDir, "ichigojam_web.d.ts"));

const b64 = readFileSync(join(tmp, "ichigojam_web_bg.wasm")).toString("base64");
writeFileSync(
  join(outDir, "wasmBinary.ts"),
  `// 自動生成 (scripts/sync-wasm.mjs)。手で編集しない。\n` +
    `// ichigojam_web_bg.wasm を base64 インラインし、fetch なしで init へ渡す。\n` +
    `export const wasmBase64 =\n  "${b64}";\n`,
);

console.log(`[sync-wasm] done. wasm ${(b64.length / 1024) | 0}KB(base64) -> ${outDir}`);
