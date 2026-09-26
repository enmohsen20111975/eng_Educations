"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/** RBD Simulator — series/parallel/koon blocks + compute system reliability. */
export function RBDSimulation() {
  const [nBlocks, setNBlocks] = React.useState(3);
  const [rBlock, setRBlock] = React.useState(0.9);
  const [mode, setMode] = React.useState<"series" | "parallel" | "koon">("series");
  const [k, setK] = React.useState(2); // for koon: k-of-n

  const systemR = React.useMemo(() => {
    if (mode === "series") return Math.pow(rBlock, nBlocks);
    if (mode === "parallel") return 1 - Math.pow(1 - rBlock, nBlocks);
    // koon: k-out-of-n working = success
    let p = 0;
    const comb = (n: number, k: number) => { let c = 1; for (let i = 0; i < k; i++) c = c * (n - i) / (i + 1); return c; };
    for (let i = k; i <= nBlocks; i++) p += comb(nBlocks, i) * Math.pow(rBlock, i) * Math.pow(1 - rBlock, nBlocks - i);
    return p;
  }, [nBlocks, rBlock, mode, k]);

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2"><Info className="h-4 w-4 text-emerald-600" /><h3 className="text-sm font-semibold">Reliability Block Diagram (RBD) — Series / Parallel / k-of-n</h3></div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div><div className="mb-1 flex justify-between text-xs"><span className="font-medium">Blocks (n)</span><span className="tabular-nums">{nBlocks}</span></div><Slider value={[nBlocks]} min={1} max={10} step={1} onValueChange={(v) => setNBlocks(v[0])} /></div>
        <div><div className="mb-1 flex justify-between text-xs"><span className="font-medium">Block R</span><span className="tabular-nums">{rBlock.toFixed(2)}</span></div><Slider value={[rBlock]} min={0.5} max={1} step={0.01} onValueChange={(v) => setRBlock(v[0])} /></div>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium">Mode</p>
          <div className="flex gap-1">
            {(["series", "parallel", "koon"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={cn("rounded px-2 py-1 text-[10px] font-medium", mode === m ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground")}>{m === "koon" ? "k-of-n" : m}</button>
            ))}
          </div>
        </div>
        {mode === "koon" ? <div><div className="mb-1 flex justify-between text-xs"><span className="font-medium">k (need)</span><span className="tabular-nums">{k}</span></div><Slider value={[k]} min={1} max={nBlocks} step={1} onValueChange={(v) => setK(v[0])} /></div> : null}
      </div>
      {/* Visual blocks */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: nBlocks }, (_, i) => (
          <React.Fragment key={i}>
            <div className={cn("flex h-12 w-16 items-center justify-center rounded-lg border-2 text-xs font-bold", i < (mode === "koon" ? k : nBlocks) ? "border-emerald-500 bg-emerald-500/10 text-emerald-700" : "border-slate-300 bg-slate-50 text-slate-600")}>
              R={rBlock.toFixed(2)}
            </div>
            {mode === "series" && i < nBlocks - 1 ? <span className="text-lg">→</span> : null}
            {mode === "parallel" ? <span className="text-lg" style={{ display: i < nBlocks - 1 ? "inline" : "none" }}>⫼</span> : null}
          </React.Fragment>
        ))}
      </div>
      {/* Result */}
      <div className="mt-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-4 text-center">
        <p className="text-xs font-medium uppercase text-muted-foreground">System Reliability R<sub>sys</sub></p>
        <p className="text-4xl font-bold tabular-nums text-emerald-600">{(systemR * 100).toFixed(2)}%</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {mode === "series" ? `R_series = R^n = ${rBlock.toFixed(2)}^${nBlocks}` : mode === "parallel" ? `R_parallel = 1-(1-R)^n = 1-${(1 - rBlock).toFixed(2)}^${nBlocks}` : `R_${k}oo${nBlocks} = Σ C(n,i)·R^i·(1-R)^(n-i)`}
        </p>
      </div>
    </Card>
  );
}
