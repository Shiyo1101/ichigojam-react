import init, { IchigoCrateRunner } from "./wasm/ichigocrate_web";
import { wasmBase64 } from "./wasm/wasmBinary";

/**
 * wasm モジュールの初期化はページ (モジュールスコープ) につき一度だけ行う。
 * 複数の IchigoCrate コンポーネントを貼っても instantiate は 1 回で、各コンポーネントは
 * ランナーだけを生成する。wasm-bindgen の "web" target は生成物がモジュール
 * スコープの単一インスタンスを共有するため、2 個目以降の異なる wasmUrl を
 * 実際に読み込み直すことはできない (既存インスタンスのポインタが無効になる)。
 * そのため既にロード済みなら警告を出したうえで先にロードした版を使い続ける。
 */
let initPromise: Promise<void> | null = null;
let loadedWasmUrl: string | undefined;

function decodeBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * wasm を初期化し IchigoCrateRunner クラスを返す。wasmUrl 指定時はそこから
 * fetch し、未指定なら同梱の base64 インライン版を instantiate する。
 * 初期化に失敗した場合は状態をリセットするので、次の呼び出し (再マウント等) で
 * リトライできる。
 */
export async function loadIchigoCrate(wasmUrl?: string): Promise<typeof IchigoCrateRunner> {
  if (initPromise && loadedWasmUrl !== wasmUrl) {
    console.warn(
      `[ichigocrate-react] wasm はページにつき 1 回だけ初期化されます。既に "${loadedWasmUrl ?? "(bundled)"}" でロード済みのため "${wasmUrl ?? "(bundled)"}" は無視されます。`,
    );
  }
  if (!initPromise) {
    loadedWasmUrl = wasmUrl;
    const input = wasmUrl ? wasmUrl : decodeBase64(wasmBase64);
    initPromise = init(input)
      .then(() => undefined)
      .catch((error) => {
        initPromise = null;
        loadedWasmUrl = undefined;
        throw error;
      });
  }
  await initPromise;
  return IchigoCrateRunner;
}
