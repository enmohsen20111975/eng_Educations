"use client";
import * as React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

/** Bathtub Curve Simulator — failure rate over the asset lifecycle.
 * Three phases: infant mortality (decreasing), useful life (constant), wear-out (increasing). */
export function BathtubCurveSimulation() {
  const [infantRate, setInfantRate] = React.useState(0.08);
  const [usefulRate, setUsefulRate] = React.useState(0.005);
  const [wearoutRate, setWearoutRate] = React.useState(0.06);
  const [lifecycle, setLifecycle] = React.useState(100);

  const data = React.useMemo(() => {
    const pts = [];
    const infantEnd = lifecycle * 0.1;
    const wearoutStart = lifecycle * 0.7;
    for (let t = 0; t <= lifecycle; t += lifecycle / 100) {
      let h;
      if (t < infantEnd) h = infantRate * Math.exp(-t / (infantEnd / 3));
      else if (t < wearoutStart) h = usefulRate;
      else h = usefulRate + wearoutRate * Math.pow((t - wearoutStart) / (lifecycle - wearoutStart), 2);
      pts.push({ t: Math.round(t), h: +h.toFixed(5) });
    }
    return pts;
  }, [infantRate, usefulRate, wearoutRate, lifecycle]);

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2"><Info className="h-4 w-4 text-emerald-600" /><h3 className="text-sm font-semibold">Bathtub Curve — Failure Rate Over Asset Lifecycle</h3></div>
      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SliderParam label="Infant mortality λ" value={infantRate} set={setInfantRate} min={0.01} max={0.2} step={0.01} />
        <SliderParam label="Useful life λ" value={usefulRate} set={setUsefulRate} min={0.001} max={0.02} step={0.001} />
        <SliderParam label="Wear-out rate" value={wearoutRate} set={setWearoutRate} min={0.01} max={0.15} step={0.01} />
        <SliderParam label="Lifecycle (time units)" value={lifecycle} set={setLifecycle} min={50} max={200} step={10} />
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
            <defs><linearGradient id="bt" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="t" tick={{ fontSize: 10 }} label={{ value: "Time", position: "insideBottom", offset: -2, style: { fontSize: 10 } }} />
            <YAxis tick={{ fontSize: 10 }} label={{ value: "λ(t)", angle: -90, position: "insideLeft", style: { fontSize: 10 } }} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
            <Area type="monotone" dataKey="h" stroke="#10b981" strokeWidth={2.5} fill="url(#bt)" name="Failure rate λ(t)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded bg-rose-500/10 p-2"><p className="font-semibold text-rose-600">Infant Mortality</p><p className="text-muted-foreground">Decreasing λ (burn-in)</p></div>
        <div className="rounded bg-emerald-500/10 p-2"><p className="font-semibold text-emerald-600">Useful Life</p><p className="text-muted-foreground">Constant λ (random)</p></div>
        <div className="rounded bg-amber-500/10 p-2"><p className="font-semibold text-amber-600">Wear-Out</p><p className="text-muted-foreground">Increasing λ (aging)</p></div>
      </div>
    </Card>
  );
}
function SliderParam({ label, value, set, min, max, step }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step: number }) {
  return (<div><div className="mb-1 flex justify-between text-xs"><span className="font-medium">{label}</span><span className="tabular-nums">{value.toFixed(3)}</span></div><Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => set(v[0])} /></div>);
}
