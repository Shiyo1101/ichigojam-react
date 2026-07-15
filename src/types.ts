import type { CSSProperties } from "react";

/**
 * keyDown/keyUp/BTN() で使う IchigoJam の標準ボタンのキーコード。
 * 生の数値の代わりに IchigoCrateButton.Left のように使える。英字・数字は
 * ASCII コード (例: 'A' = 65) をそのまま渡す。
 */
export const IchigoCrateButton = {
  Left: 28,
  Right: 29,
  Up: 30,
  Down: 31,
  Space: 32,
  X: 88,
} as const;

export type IchigoCrateButton = (typeof IchigoCrateButton)[keyof typeof IchigoCrateButton];

/**
 * peek(addr) で読めるメモリ空間の先頭アドレス一覧 (ram.h の仮想アドレス
 * マップに対応)。生の 16 進数の代わりに IchigoCrateMemory.Vram のように使える。
 *
 * #000-#6FF   RomFont (ROM フォント、先頭 224 文字)
 * #700-#7FF   Pcg     (ユーザー定義フォント, RAM)
 * #800-#8FF   Var     (配列 + 変数 A-Z)
 * #900-#BFF   Vram    (32x24 画面)
 * #C00-#1001  List    (プログラム本体)
 * #1002-#1081 Keybuf  (キー入力バッファ)
 * #1082-#1149 Linebuf (行編集バッファ)
 * #114A-#117F I2cbuf  (I2C バッファ)
 *
 * アドレス空間は #000-#117F の連続領域で、これより外側は peek が常に
 * 0 を返す (実機同様エラーにはならない)。範囲外かどうかを明示的に判定したい
 * 場合は isValidAddress を使う。
 */
export const IchigoCrateMemory = {
  RomFont: 0x000,
  Pcg: 0x700,
  Var: 0x800,
  Vram: 0x900,
  List: 0xc00,
  Keybuf: 0x1002,
  Linebuf: 0x1082,
  I2cbuf: 0x114a,
} as const;

export type IchigoCrateMemory = (typeof IchigoCrateMemory)[keyof typeof IchigoCrateMemory];

/** peek/poke が実データを持つアドレス空間の終端 (排他的、#1180)。 */
const ADDRESS_SPACE_END = 0x1180;

/**
 * addr が peek(addr) で実データを読めるアドレス空間 (#000-#117F) 内か
 * を判定する。peek 自体は範囲外でも例外を投げず 0 を返すため、返ってきた
 * 0 が実際のメモリ値か範囲外による既定値かを区別したい場合に使う。
 */
export function isValidAddress(addr: number): boolean {
  return Number.isInteger(addr) && addr >= 0 && addr < ADDRESS_SPACE_END;
}

/**
 * 実行時エラー。即時文 (exec/type の改行確定) または RUN 中のプログラムが
 * 停止理由付きで止まったときに onError へ渡る。ESC=Break による中断は通知されない。
 */
export interface IchigoCrateError {
  /** IchigoJam 標準のエラー番号 (1..=12)。 */
  code: number;
  /** 画面表示と同じ文言 (例 "Syntax error", "Divide by 0")。 */
  message: string;
}

/**
 * 命令ハンドル: ref 経由で動作中の IchigoCrate を外部制御する。
 * すべて wasm ランナーの公開メソッドへ委譲する。
 */
export interface IchigoCrateHandle {
  /** 文字列をタイプ入力する (キーボード入力と同等)。実行中は INKEY()/INPUT へ。 */
  type(text: string): void;
  /** REPL の 1 行を直接実行する (停止中のみ)。 */
  exec(line: string): void;
  /** 複数行をまとめて投入する (行番号付きは LIST へ格納)。 */
  loadProgram(text: string): void;
  /** RUN 相当。格納済みプログラムの実行を開始する。 */
  run(): void;
  /** 変数・プログラム・実行状態・画面をリセットする (実機の電源スイッチ ON<->OFF 相当)。 */
  reset(): void;
  /** INKEY()/BTN() 用の物理キー押下 (IchigoCrateButton または ASCII コード)。 */
  keyDown(code: number): void;
  /** INKEY()/BTN() 用の物理キー解放。 */
  keyUp(code: number): void;
  /** 実行中プログラムを中断する (ESC = Break 相当)。 */
  break(): void;
  /** 画面 (VRAM) の文字列スナップショットを取得する。 */
  getScreenText(): string;
  /** 変数 A-Z の値を取得する (先頭 1 文字・大小無視)。 */
  getVar(name: string): number;
  /**
   * メモリ (PEEK 相当) を読む。有効アドレス空間は IchigoCrateMemory 参照
   * (#000-#117F)。範囲外・不正な addr でも例外は投げず 0 を返す (実機の
   * PEEK と同じ挙動)。返ってきた 0 が実際の値か範囲外による既定値かを
   * 区別したい場合は事前に isValidAddress で判定する。
   */
  peek(addr: number): number;
  /** LED が点灯中か。 */
  isLed(): boolean;
  /** カナ入力モードか。 */
  isKana(): boolean;
}

export interface IchigoCrateProps {
  /**
   * 起動時に投入するプログラム (改行区切り)。React の defaultValue と同じく
   * マウント時に一度だけ適用され、以降の変更は無視される (動的更新は ref /
   * useIchigoCrate のハンドルで行う)。
   */
  defaultProgram?: string;
  /** defaultProgram 投入後に自動で RUN するか (マウント時に一度だけ)。 */
  autoRun?: boolean;
  /** 画面出力ストリーミングを購読する。 */
  onPrint?: (chunk: string) => void;
  /** 実行時エラーを購読する (ESC=Break は通知されない)。 */
  onError?: (error: IchigoCrateError) => void;
  /**
   * ランナー生成・初期プログラム適用が済み、外部制御が可能になったときに一度呼ばれる
   * (React StrictMode の二重マウントでは都度)。handle を直接受け取れるので、動的な
   * 複数インスタンスはこれを Map 等へ集約して制御する。
   */
  onReady?: (handle: IchigoCrateHandle) => void;
  /** SAVE/LOAD のスロットを分離する localStorage キー接頭辞 (複数インスタンス用)。 */
  storagePrefix?: string;
  /** false でスロットを永続化しない揮発モードにする (既定 true)。 */
  persist?: boolean;
  /**
   * wasm バイナリの取得 URL。未指定なら同梱の base64 インライン版を使う。
   * instantiate はページにつき 1 回だけなので、ページ内で最初にマウントされた
   * IchigoCrate コンポーネントの値がページ全体に適用される。以降のインスタンスで
   * 異なる値を指定しても無視され (console.warn で通知)、既にロード済みの版が使われる。
   */
  wasmUrl?: string;
  /** ピクセル拡大率 (論理 256×192 を CSS で何倍に表示するか、既定 3)。 */
  scale?: number;
  className?: string;
  style?: CSSProperties;
}
