"use client";

import * as React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

/** Weibull Reliability Simulation — interactive R(t) = exp(-(t/η)^β).
 * Sliders for shape (β) and scale (η) parameters. Shows the reliability curve,
 * the hazard rate, MTBF, and key points (R=0.5, R=0.3679=e^-1). */
export function WeibullSimulation() {
  const [beta, setBeta] = React.useState(2.0);
  const [eta, setEta] = React.useState(10000);
  const [tMax, setTMax] = React.useState(20000);

  const data = React.useMemo(() => {
    const pts = [];
    for (let t = 0; t <= tMax; t += tMax / 100) {
      const Rt = Math.exp(-Math.pow(t / eta, beta));
      const ht = (beta / eta) * Math.pow(t / eta, beta - 1);
      pts.push({ t: Math.round(t), R: +Rt.toFixed(4), h: +ht.toFixed(6) });
    }
    return pts;
  }, [beta, eta, tMax]);

  const mtbf = eta * (1 + 1 / beta); // simplified
  const b10 = eta * Math.pow(-Math.log(0.9), 1 / beta); // t at R=0.9
  const median = eta * Math.pow(Math.log(2), 1 / beta); // t at R=0.5

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <Info className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-semibold">Weibull Reliability Simulation — R(t) = exp(-(t/η)^β)</h3>
      </div>

      {/* Controls */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-medium">Shape (β)</span>
            <span className="tabular-nums">{beta.toFixed(2)}</span>
          </div>
          <Slider value={[beta]} min={0.3} max={5} step={0.1} onValueChange={(v) => setBeta(v[0])} />
          <p className="mt-1 text-[10px] text-muted-foreground">
            β&lt;1: infant mortality · β=1: exponential · β&gt;1: wear-out
          </p>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-medium">Scale (η) hours</span>
            <span className="tabular-nums">{eta.toLocaleString()}</span>
          </div>
          <Slider value={[eta]} min={1000} max={50000} step={500} onValueChange={(v) => setEta(v[0])} />
          <p className="mt-1 text-[10px] text-muted-foreground">Characteristic life (R=0.3679 at t=η)</p>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-medium">Time range</span>
            <span className="tabular-nums">{tMax.toLocaleString()}h</span>
          </div>
          <Slider value={[tMax]} min={5000} max={100000} step={1000} onValueChange={(v) => setTMax(v[0])} />
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="t" tick={{ fontSize: 10 }} label={{ value: "Time (hours)", position: "insideBottom", offset: -2, style: { fontSize: 10 } }} />
            <YAxis yAxisId="L" domain={[0, 1]} tick={{ fontSize: 10 }} label={{ value: "R(t)", angle: -90, position: "insideLeft", style: { fontSize: 10 } }} />
            <YAxis yAxisId="R" orientation="right" domain={[0, "auto"]} tick={{ fontSize: 10 }} label={{ value: "h(t)", angle: 90, position: "insideRight", style: { fontSize: 10 } }} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
            <ReferenceLine yAxisId="L" y={0.5} stroke="#94a3b8" strokeDasharray="4 2" label={{ value: "R=0.5", style: { fontSize: 9 } }} />
            <Line yAxisId="L" type="monotone" dataKey="R" stroke="#10b981" strokeWidth={2.5} dot={false} name="Reliability R(t)" />
            <Line yAxisId="R" type="monotone" dataKey="h" stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="Hazard h(t)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Key metrics */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="MTBF" value={`${Math.round(mtbf).toLocaleString()} h`} hint="≈ η·Γ(1+1/β)" />
        <Metric label="B10 Life" value={`${Math.round(b10).toLocaleString()} h`} hint="R=0.90" />
        <Metric label="Median" value={`${Math.round(median).toLocaleString()} h`} hint="R=0.50" />
        <Metric label="R(η)" value="36.79%" hint="Characteristic life" />
      </div>
    </Card>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-[10px] font-medium uppercase text-muted-foreground">{label}</p>
      <p className="text-lg font-bold tabular-nums">{value}</p>
      <p className="text-[10px] text-muted-foreground">{hint}</p>
    </div>
  );
}
