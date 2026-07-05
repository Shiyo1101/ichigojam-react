import { useRef } from "react";
import type { RefObject } from "react";
import type { IchigoJamHandle } from "./types";
import { delegateHandle } from "./handle";

export interface UseIchigoJam {
  /** IchigoJam コンポーネントの ref に渡す ref。 */
  ref: RefObject<IchigoJamHandle>;
  /** .current を介さず直接叩ける安定ハンドル (マウント前は no-op)。 */
  ij: IchigoJamHandle;
}

/**
 * 単一の IchigoJam コンポーネントを .current 無しで制御する糖衣フック。返した ref を
 * コンポーネントへ渡し、ij のメソッドをそのまま呼ぶ (ij.run() など)。
 *
 * ij はマウント前でも参照できる安定オブジェクトで、内部で ref.current
 * (コンポーネントが公開する IchigoJamHandle) へ委譲する。未マウント中の
 * 呼び出しは no-op (getter は既定値) になる。
 *
 * 複数インスタンス: 個数が静的なら本フックを必要数だけ呼べばよい (Rules of
 * Hooks を満たす)。動的リストにはフックを使わず、onReady でハンドルを
 * 外部の Map 等へ集約する。
 */
export function useIchigoJam(): UseIchigoJam {
  // null 初期値で RefObject<IchigoJamHandle> 型 (forwardRef にそのまま渡せる)。
  const ref = useRef<IchigoJamHandle>(null);
  const ij = useRef<IchigoJamHandle | null>(null);
  if (!ij.current) ij.current = createForwardingHandle(ref);
  return { ref, ij: ij.current };
}

/**
 * ref.current (公開ハンドル) へ委譲する安定ハンドルを作る。転送ロジック自体は
 * delegateHandle と共有しているので、IchigoJamHandle にメソッドが
 * 増減しても更新箇所は handle.ts の一箇所で済む。
 */
function createForwardingHandle(ref: RefObject<IchigoJamHandle>): IchigoJamHandle {
  return delegateHandle(() => ref.current);
}
