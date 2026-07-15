import { useRef } from "react";
import type { RefObject } from "react";
import type { IchigoCrateHandle } from "./types";
import { delegateHandle } from "./handle";

export interface UseIchigoCrate {
  /** IchigoCrate コンポーネントの ref に渡す ref。 */
  ref: RefObject<IchigoCrateHandle>;
  /** .current を介さず直接叩ける安定ハンドル (マウント前は no-op)。 */
  ij: IchigoCrateHandle;
}

/**
 * 単一の IchigoCrate コンポーネントを .current 無しで制御する糖衣フック。返した ref を
 * コンポーネントへ渡し、ij のメソッドをそのまま呼ぶ (ij.run() など)。
 *
 * ij はマウント前でも参照できる安定オブジェクトで、内部で ref.current
 * (コンポーネントが公開する IchigoCrateHandle) へ委譲する。未マウント中の
 * 呼び出しは no-op (getter は既定値) になる。
 *
 * 複数インスタンス: 個数が静的なら本フックを必要数だけ呼べばよい (Rules of
 * Hooks を満たす)。動的リストにはフックを使わず、onReady でハンドルを
 * 外部の Map 等へ集約する。
 */
export function useIchigoCrate(): UseIchigoCrate {
  // null 初期値で RefObject<IchigoCrateHandle> 型 (forwardRef にそのまま渡せる)。
  const ref = useRef<IchigoCrateHandle>(null);
  const ij = useRef<IchigoCrateHandle | null>(null);
  if (!ij.current) ij.current = createForwardingHandle(ref);
  return { ref, ij: ij.current };
}

/**
 * ref.current (公開ハンドル) へ委譲する安定ハンドルを作る。転送ロジック自体は
 * delegateHandle と共有しているので、IchigoCrateHandle にメソッドが
 * 増減しても更新箇所は handle.ts の一箇所で済む。
 */
function createForwardingHandle(ref: RefObject<IchigoCrateHandle>): IchigoCrateHandle {
  return delegateHandle(() => ref.current);
}
