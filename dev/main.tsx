import { StrictMode, useCallback, useState } from "react";
import { createRoot } from "react-dom/client";
import { IchigoCrate, IchigoCrateButton, useIchigoCrate, type IchigoCrateError } from "../src";

const errorTextStyle = { color: "#f77" };

// src を直接 import する開発用 playground。pnpm dev で HMR が効く。
function App() {
  const { ref, ij } = useIchigoCrate();
  const [log, setLog] = useState("");
  const [err, setErr] = useState<IchigoCrateError | null>(null);

  const onPrint = useCallback((c: string) => setLog((s) => s + c), []);
  const execHello = useCallback(() => ij.exec("PRINT 1+2"), [ij]);
  const execError = useCallback(() => ij.exec("?1/0"), [ij]);
  const pressLeft = useCallback(() => ij.keyDown(IchigoCrateButton.Left), [ij]);
  const resetRunner = useCallback(() => ij.reset(), [ij]);

  return (
    <div className="row">
      <div>
        <IchigoCrate
          ref={ref}
          defaultProgram={'10 PRINT "HELLO"\n20 PRINT 6*7\n30 END'}
          autoRun
          storagePrefix="dev-a"
          onPrint={onPrint}
          onError={setErr}
        />
        <div>
          <button type="button" onClick={execHello}>
            exec
          </button>
          <button type="button" onClick={execError}>
            error
          </button>
          <button type="button" onClick={pressLeft}>
            btn←
          </button>
          <button type="button" onClick={resetRunner}>
            reset
          </button>
        </div>
        <pre>{log}</pre>
        {err && (
          <p style={errorTextStyle}>
            error {err.code}: {err.message}
          </p>
        )}
      </div>
      {/* 別 storagePrefix で共存する 2 つ目のインスタンス。 */}
      <IchigoCrate storagePrefix="dev-b" />
    </div>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
