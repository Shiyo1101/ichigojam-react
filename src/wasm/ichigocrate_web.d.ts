/* tslint:disable */
/* eslint-disable */

/**
 * IchigoJam VM を 1 つ抱えるランナー。JS から `new IchigoCrateRunner(canvas)` で生成。
 */
export class IchigoCrateRunner {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * 実行中プログラムを中断する (ESC 相当)。暴走停止に使う。
     */
    break(): void;
    /**
     * REPL の 1 行を直接実行する (画面エディタを介さない最もクリーンな経路)。
     * 実行中・入力待ち中は無視される。
     */
    exec(line: string): void;
    /**
     * 画面 (VRAM) を文字列スナップショットとして取得する。各行の末尾空白は
     * 詰め、行は改行で連結する。印字不能・グラフィック文字は `?` に潰す。
     */
    getScreenText(): string;
    /**
     * 変数 A-Z の値を取得する (`name` の先頭 1 文字、大小無視)。
     */
    getVar(name: string): number;
    /**
     * 現在カナモードか (タイトル表示などに使う)。
     */
    is_kana(): boolean;
    /**
     * LED が点灯中か (`LED 1` で true)。実機 LED の代わりにフロント側が画面枠を
     * 赤くするなどの表示に使う (枠描画はフロントの責務)。
     */
    is_led(): boolean;
    /**
     * INKEY()/BTN() 用の物理キー押下。`code` は IchigoJam キーコード
     * (例: 28=←, 32=スペース, 88='X')。
     */
    keyDown(code: number): void;
    /**
     * INKEY()/BTN() 用の物理キー解放。
     */
    keyUp(code: number): void;
    /**
     * 複数行をまとめて投入する (行番号付きは LIST 領域へ格納される)。
     */
    loadProgram(text: string): void;
    /**
     * `canvas` を描画先に紐付けてランナーを生成する。canvas の解像度は論理
     * 画面サイズ (IMG_W×IMG_H) に設定し、拡大表示は CSS 側に委ねる。
     *
     * `storage_prefix` は SAVE/LOAD/FILES の localStorage キー接頭辞 (複数
     * インスタンスのスロット分離用、既定 "")。`persist` が false なら永続化せず
     * セッション内のみ有効な揮発ストレージになる (既定 true)。
     */
    constructor(canvas: HTMLCanvasElement, storage_prefix?: string | null, persist?: boolean | null);
    /**
     * 実行時エラーのコールバックを登録する。`cb({ code, message })` が、即時文
     * (`exec`/`type` の改行確定) または RUN 中のプログラムが停止理由付きで止まった
     * ときに呼ばれる。`code` は IchigoJam 標準のエラー番号 (1..=12)、`message` は
     * 画面表示と同じ文言。`null`/未指定で解除。
     *
     * ESC=Break による中断は意図的操作なのでエラーとしては通知しない (画面には
     * 従来どおり `Break in NN` が出る)。
     */
    onError(cb?: Function | null): void;
    /**
     * 画面出力ストリーミングのコールバックを登録する。`cb(chunk: string)` が
     * フレームごとに新規出力分を受け取る (PRINT 出力・OK・キー入力エコーを含む
     * 画面出力ストリーム)。`null`/未指定で解除。
     *
     * 実装は core を改変せず VRAM 差分で近似するため、1 フレーム内に画面外へ
     * スクロールし切った行や、LOCATE 等でカーソルを戻して上書きした出力は
     * 取りこぼすことがある。確実な全画面状態は [`get_screen_text`] を併用する。
     */
    onPrint(cb?: Function | null): void;
    /**
     * キーイベントを 1 件処理する。`code` は `KeyboardEvent.code` (物理キー位置)、
     * `shift`/`alt` は対応する修飾キー状態、`pressed` は keydown=true / keyup=false。
     *
     * 物理キー位置で keymap を引くため、`KBD` コマンドの US/JA 切替が OS の
     * 入力レイアウトに依らず効く。
     */
    on_key(code: string, shift: boolean, alt: boolean, pressed: boolean): void;
    /**
     * メモリ (PEEK 相当) を読む。
     */
    peek(addr: number): number;
    /**
     * 実機の RESET ボタン (電源 ON/OFF による再起動) 相当。BASIC の `RESET`
     * コマンドと同じ [`Machine::power_on_reset`] へ委譲するので、LED・画面・
     * カナ入力・VIDEO 設定なども含めて丸ごと起動直後の状態へ戻る。
     */
    reset(): void;
    /**
     * `RUN` 相当。格納済みプログラムの実行を開始する。
     */
    run(): void;
    /**
     * 1 フレーム進めて再描画する。`now_ms` は `performance.now()` を渡す。
     */
    tick(now_ms: number): void;
    /**
     * 文字列をタイプ入力する (キーボード入力と同等)。実行中は INKEY()/INPUT へ、
     * 停止中は REPL 行編集へ流れる。ASCII 以外の文字は無視する (グラフィック文字を
     * 流したいときは将来の bytes 版を使う想定)。
     */
    type(text: string): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_ichigocraterunner_free: (a: number, b: number) => void;
    readonly ichigocraterunner_break: (a: number) => void;
    readonly ichigocraterunner_exec: (a: number, b: number, c: number) => void;
    readonly ichigocraterunner_getScreenText: (a: number) => [number, number];
    readonly ichigocraterunner_getVar: (a: number, b: number, c: number) => number;
    readonly ichigocraterunner_is_kana: (a: number) => number;
    readonly ichigocraterunner_is_led: (a: number) => number;
    readonly ichigocraterunner_keyDown: (a: number, b: number) => void;
    readonly ichigocraterunner_keyUp: (a: number, b: number) => void;
    readonly ichigocraterunner_loadProgram: (a: number, b: number, c: number) => void;
    readonly ichigocraterunner_new: (a: any, b: number, c: number, d: number) => [number, number, number];
    readonly ichigocraterunner_onError: (a: number, b: number) => void;
    readonly ichigocraterunner_onPrint: (a: number, b: number) => void;
    readonly ichigocraterunner_on_key: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
    readonly ichigocraterunner_peek: (a: number, b: number) => number;
    readonly ichigocraterunner_reset: (a: number) => void;
    readonly ichigocraterunner_run: (a: number) => void;
    readonly ichigocraterunner_tick: (a: number, b: number) => void;
    readonly ichigocraterunner_type: (a: number, b: number, c: number) => void;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
