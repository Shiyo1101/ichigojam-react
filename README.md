# ichigojam-react

IchigoJam BASIC を React コンポーネント `<IchigoJam />` として提供するライブラリ。Rust 実装のインタプリタ ([ichigojam-rs](https://github.com/Shiyo1101/ichigojam-rs)) を WebAssembly 化し、`<canvas>` 1 枚に描画する (wasm ~160KB)。

## インストール

```bash
pnpm add ichigojam-react
```

`react` / `react-dom` (>=18) は peer dependency。ESM 形式で wasm は base64 同梱のため、バンドラを問わず動作する。SSR/RSC ではブラウザ API を使うため client component (`"use client"`) として読み込むこと。

## 使い方

```tsx
import { IchigoJam, useIchigoJam } from "ichigojam-react";

export function App() {
  const { ref, ij } = useIchigoJam();
  return (
    <>
      <IchigoJam
        ref={ref}
        defaultProgram={`10 PRINT "HELLO"\n20 GOTO 10`}
        autoRun
        storagePrefix="demo"
        onPrint={(chunk) => console.log(chunk)}
        onError={(e) => console.warn(`error ${e.code}: ${e.message}`)}
      />
      <button onClick={() => ij.exec("PRINT 1+2")}>exec</button>
    </>
  );
}
```

canvas をクリックしてフォーカスすればキーボードで直接操作できる (`PRINT "HI"` → Enter、`F5` で RUN、`ESC` で中断)。

## Props

| prop                  | 型                             | 既定  | 説明                                                       |
| --------------------- | ------------------------------ | ----- | ---------------------------------------------------------- |
| `defaultProgram`      | `string`                       | —     | 起動時に投入するプログラム (マウント時に一度だけ適用)      |
| `autoRun`             | `boolean`                      | false | `defaultProgram` 投入後に自動 RUN するか (マウント時のみ)  |
| `onPrint`             | `(chunk: string) => void`      | —     | 画面出力ストリーミングの購読                               |
| `onError`             | `(e: IchigoJamError) => void`  | —     | 実行時エラーの購読 (`{ code, message }`。ESC=Break は除く) |
| `onReady`             | `(h: IchigoJamHandle) => void` | —     | 外部制御可能になった通知。ハンドルを直接受け取る           |
| `storagePrefix`       | `string`                       | `""`  | SAVE/LOAD スロットを分離する localStorage キー接頭辞       |
| `persist`             | `boolean`                      | true  | false でスロットを永続化しない揮発モード                   |
| `wasmUrl`             | `string`                       | —     | wasm の取得 URL (未指定なら同梱 base64 インライン版を使う) |
| `scale`               | `number`                       | 3     | ピクセル拡大率 (論理 256×192 を CSS で何倍に表示するか)    |
| `className` / `style` | —                              | —     | canvas へ渡すスタイル                                      |

## ハンドル (`IchigoJamHandle`)

動作中の IchigoJam を JS/TS で外部制御する。取得手段は 3 通り:

- **`useIchigoJam()`** — 単一インスタンス向け。`{ ref, ij }` を返し `ij` を `.current` 無しで叩ける。
- **生 `ref`** — `useRef<IchigoJamHandle>(null)` を渡し `ref.current?.*` で叩く。動的な数のインスタンスにも使える。
- **`onReady(handle)`** — 制御可能になった瞬間にハンドルを直接受け取る (下記「複数インスタンス」参照)。

```ts
import { IchigoJamButton, IchigoJamMemory } from "ichigojam-react";

ij.type("LIST\n"); // キーボード入力と同等
ij.exec("PRINT 1+2"); // REPL 1 行を直接実行 (停止中のみ)
ij.loadProgram("10 PRINT 1\n20 GOTO 10");
ij.run(); // RUN
ij.break(); // ESC で中断
ij.keyDown(IchigoJamButton.Left); // BTN()/INKEY() 用 物理キー
ij.keyUp(IchigoJamButton.Left);
ij.getScreenText(); // 画面スナップショット
ij.getVar("A"); // 変数 A-Z
ij.peek(IchigoJamMemory.Vram); // メモリ
ij.reset();
ij.isLed(); // LED 点灯状態
ij.isKana(); // カナ入力モードか
```

`keyDown`/`keyUp` には名前付き定数 `IchigoJamButton` (`Left`/`Right`/`Up`/`Down`/`Space`/`X`) を渡せる。それ以外の英数字は ASCII コード (例: `"A".charCodeAt(0)`) をそのまま渡す。

`peek` には生の 16 進数の代わりに `IchigoJamMemory` (`RomFont`/`Pcg`/`Var`/`Vram`/`List`/`Keybuf`/`Linebuf`/`I2cbuf`) を渡せる。有効アドレス空間は `#000`-`#117F` で、範囲外・不正な値でも例外を投げず `0` を返す (実機の PEEK と同じ挙動)。返ってきた `0` が実データか既定値かを区別したい場合は、事前に `isValidAddress(addr)` で判定する。

## 複数インスタンス

wasm の instantiate はページで一度きり、各 `<IchigoJam />` はランナーのみ生成するので 1 ページに複数貼れる。`storagePrefix` を変えれば SAVE/LOAD スロットもインスタンスごとに分離される。

- **静的に少数** — `useIchigoJam()` を必要な数だけ呼ぶ。
- **動的リスト** (`items.map(...)`) — フックをループ内で呼べないので、`onReady` でハンドルを Map へ集約する。

```tsx
import { useRef } from "react";
import { IchigoJam, IchigoJamButton, type IchigoJamHandle } from "ichigojam-react";

function Grid({ items }: { items: { id: string }[] }) {
  const handles = useRef(new Map<string, IchigoJamHandle>());
  return (
    <>
      {items.map((it) => (
        <IchigoJam key={it.id} onReady={(h) => handles.current.set(it.id, h)} />
      ))}
      <button onClick={() => handles.current.get("enemy-3")?.keyDown(IchigoJamButton.Left)}>
        move
      </button>
    </>
  );
}
```

## 開発 (Vite + pnpm)

```bash
pnpm install        # 依存をインストール
pnpm dev            # dev playground を HMR で起動
pnpm build          # dist へライブラリを出力 (Vite library mode + vite-plugin-dts)
pnpm preview        # build 成果物をローカル配信
pnpm typecheck      # tsc --noEmit
```

## wasm の更新

同梱の wasm (`src/wasm/`) は Rust 側 ([ichigojam-rs](https://github.com/Shiyo1101/ichigojam-rs)) のビルド成果物。`ichigojam-rs` の `web/` または `core/` が更新されると、`.github/workflows/sync-wasm.yml` が自動的に wasm を再ビルドして `src/wasm/` を同期し、差分があれば PR (`auto/sync-wasm` ブランチ) を作成する。手動で同期する必要はない。

## 商標

- IchigoJamは、株式会社jig.jpの登録商標です (IchigoJam is a registered trademark of jig.jp co., ltd.)
