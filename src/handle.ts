import type { IchigoJamRunner } from "./wasm/ichigojam_web";
import type { IchigoJamHandle } from "./types";

/**
 * IchigoJamHandle 形の委譲先を返すゲッタから、実際に呼び出し可能な
 * IchigoJamHandle を組み立てる。ゲッタが null を返す間は既定値 (no-op /
 * 0 / false 等) にフォールバックする。createHandle と useIchigoJam の
 * フォワーディングハンドルはどちらもこの一箇所だけに依存するので、
 * IchigoJamHandle の仕様が変わっても更新箇所は 1 つで済む。
 */
export function delegateHandle(getSource: () => IchigoJamHandle | null): IchigoJamHandle {
  return {
    type: (t) => getSource()?.type(t),
    exec: (l) => getSource()?.exec(l),
    loadProgram: (t) => getSource()?.loadProgram(t),
    run: () => getSource()?.run(),
    reset: () => getSource()?.reset(),
    keyDown: (c) => getSource()?.keyDown(c),
    keyUp: (c) => getSource()?.keyUp(c),
    break: () => getSource()?.break(),
    getScreenText: () => getSource()?.getScreenText() ?? "",
    getVar: (n) => getSource()?.getVar(n) ?? 0,
    peek: (a) => getSource()?.peek(a) ?? 0,
    isLed: () => getSource()?.isLed() ?? false,
    isKana: () => getSource()?.isKana() ?? false,
  };
}

/**
 * 動作中の wasm ランナーへ委譲する IchigoJamHandle を作る。getRunner は
 * 呼び出しごとに最新ランナー (未生成なら null) を返すゲッタ。返すハンドルは
 * 毎回 getter 越しにランナーを引くので、ランナーを作り直しても同じハンドルを
 * 使い続けられる。snake_case の wasm 名 (is_led/is_kana) を camelCase へ正規化する
 * 唯一の場所であり、useImperativeHandle と onReady が共有する。
 */
export function createHandle(getRunner: () => IchigoJamRunner | null): IchigoJamHandle {
  return delegateHandle(() => {
    const runner = getRunner();
    if (!runner) return null;
    return {
      type: (t) => runner.type(t),
      exec: (l) => runner.exec(l),
      loadProgram: (t) => runner.loadProgram(t),
      run: () => runner.run(),
      reset: () => runner.reset(),
      keyDown: (c) => runner.keyDown(c),
      keyUp: (c) => runner.keyUp(c),
      break: () => runner.break(),
      getScreenText: () => runner.getScreenText(),
      getVar: (n) => runner.getVar(n),
      peek: (a) => runner.peek(a),
      isLed: () => runner.is_led(),
      isKana: () => runner.is_kana(),
    };
  });
}
