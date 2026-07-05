import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import type { IchigoJamRunner } from "./wasm/ichigojam_web";
import type { IchigoJamError, IchigoJamHandle, IchigoJamProps } from "./types";
import { createHandle } from "./handle";
import { loadIchigoJam } from "./wasmLoader";

// 論理画面サイズ (wasm 側の IMG_W/IMG_H と一致)。
const SCREEN_W = 256;
const SCREEN_H = 192;

// ブラウザ既定動作 (スクロール/リロード/フォーカス移動) と衝突するため、canvas に
// フォーカスがある間だけ抑止するキー。
const PREVENT_KEYS = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Space",
  "Tab",
  "Enter",
  "Backspace",
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
]);

/**
 * IchigoJam BASIC を 1 枚の canvas として描画する React コンポーネント。
 *
 * wasm の instantiate はページで一度だけ行われる (loadIchigoJam)。各インスタンスは
 * ランナーのみ生成するので 1 ページに複数貼れる。ref から命令ハンドル
 * (IchigoJamHandle) で外部制御できる。アンマウント時には rAF 停止・リスナ解除・
 * ランナー解放を行い、React StrictMode の二重マウントでもランナーが二重起動
 * しないようガードする。
 */
export const IchigoJam = forwardRef<IchigoJamHandle, IchigoJamProps>(function IchigoJam(
  {
    defaultProgram,
    autoRun,
    onPrint,
    onError,
    onReady,
    storagePrefix,
    persist,
    wasmUrl,
    scale = 3,
    className,
    style,
  },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runnerRef = useRef<IchigoJamRunner | null>(null);
  // 最新の onPrint/onError/onReady を ref で保持し、ランナーを作り直さず差し替えられるようにする。
  const onPrintRef = useRef(onPrint);
  onPrintRef.current = onPrint;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  // ランナーへ委譲する安定ハンドル。useImperativeHandle と onReady で共有する。
  const handleRef = useRef<IchigoJamHandle | null>(null);
  if (!handleRef.current) {
    handleRef.current = createHandle(() => runnerRef.current);
  }
  // defaultProgram/autoRun はコンポーネントの生涯で一度だけ適用する。effect の
  // 依存 (storagePrefix 等) 変化でランナーが作り直されても再適用しないためのガード。
  const appliedInitialRef = useRef(false);

  useImperativeHandle(ref, () => handleRef.current as IchigoJamHandle, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let raf = 0;
    let runner: IchigoJamRunner | null = null;

    const onKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd 併用 (コピー等) は OS/ブラウザに委ねる。
      if (e.ctrlKey || e.metaKey) return;
      runner?.on_key(e.code, e.shiftKey, e.altKey, true);
      if (PREVENT_KEYS.has(e.code)) e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      runner?.on_key(e.code, e.shiftKey, e.altKey, false);
    };

    loadIchigoJam(wasmUrl)
      .then((Runner) => {
        if (cancelled) return;

        runner = new Runner(canvas, storagePrefix, persist);
        runnerRef.current = runner;
        runner.onPrint((chunk: string) => onPrintRef.current?.(chunk));
        runner.onError((error: IchigoJamError) => onErrorRef.current?.(error));

        if (!appliedInitialRef.current) {
          appliedInitialRef.current = true;
          if (defaultProgram) runner.loadProgram(defaultProgram);
          if (autoRun) runner.run();
        }

        // ランナー生成・初期プログラム適用が済み、外部制御が可能になった通知。
        onReadyRef.current?.(handleRef.current as IchigoJamHandle);

        canvas.addEventListener("keydown", onKeyDown);
        canvas.addEventListener("keyup", onKeyUp);

        // 直前の LED 状態をキャッシュし、変化したフレームだけ style を書き換える。
        let lastLed: boolean | null = null;
        const frame = (t: number) => {
          if (cancelled || !runner) return;
          runner.tick(t);
          const led = runner.is_led();
          if (led !== lastLed) {
            // 実機 LED の代わりに点灯中は枠を赤くする。
            canvas.style.borderColor = led ? "#e62828" : "#333";
            lastLed = led;
          }
          raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("[IchigoJam] failed to load wasm module", error);
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("keyup", onKeyUp);
      runnerRef.current = null;
      runner?.free();
    };
    // defaultProgram/autoRun はマウント時のみ反映する (動的更新は ref ハンドルで)。
    // 再生成が必要なのはストレージ構成と wasm の取得元が変わったときだけ。
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [storagePrefix, persist, wasmUrl]);

  const canvasStyle = useMemo(
    () => ({
      imageRendering: "pixelated" as const,
      width: SCREEN_W * scale,
      height: SCREEN_H * scale,
      background: "#000",
      border: "8px solid #333",
      outline: "none",
      ...style,
    }),
    [scale, style],
  );

  return <canvas ref={canvasRef} tabIndex={0} className={className} style={canvasStyle} />;
});
