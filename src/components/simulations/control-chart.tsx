"use client";

import * as React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Dot } from "recharts";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info, AlertTriangle } from "lucide-react";

/** Control Chart Simulator — X̄ chart with UCL/LCL + Western Electric rule detection. */
export function ControlChartSimulation() {
  const [mean, setMean] = React.useState(10.0);
  const [stdDev, setStdDev] = React.useState(0.15);
  const [n, setN] = React.useState(5);
  const [subgroups, setSubgroups] = React.useState(20);

  const A2 = 0.577; // for n=5
  const ucl = mean + A2 * stdDev * Math.sqrt(n) / Math.sqrt(n) * Math.sqrt(n); // approx: mean + A2*Rbar
  const simplifiedUCL = mean + 3 * stdDev / Math.sqrt(n);
  const lcl = mean - 3 * stdDev / Math.sqrt(n);

  const data = React.useMemo(() => {
    const pts = [];
    for (let i = 0; i < subgroups; i++) {
      // Generate random sample mean around `mean` with noise
      const noise = (Math.random() - 0.5) * 2 * stdDev / Math.sqrt(n) * 3;
      const xbar = mean + noise;
      // Inject a special-cause on subgroup 8, 15
      const special = i === 8 ? stdDev * 2 : i === 15 ? -stdDev * 1.8 : 0;
      pts.push({ subgroup: i + 1, xbar: +(xbar + special).toFixed(3), ucl: +simplifiedUCL.toFixed(3), lcl: +lcl.toFixed(3), mean: +mean.toFixed(3), outOfControl: (xbar + special) > simplifiedUCL || (xbar + special) < lcl });
    }
    return pts;
  }, [mean, stdDev, n, subgroups, simplifiedUCL, lcl]);

  const violations = data.filter((d) => d.outOfControl);

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <Info className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-semibold">Control Chart (X̄) — UCL/LCL + Western Electric Rules</h3>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div><Label className="text-xs">Process Mean (μ)</Label><Input type="number" step="0.01" value={mean} onChange={(e) => setMean(+e.target.value)} className="h-8 text-sm" /></div>
        <div><Label className="text-xs">Std Dev (σ)</Label><Input type="number" step="0.01" value={stdDev} onChange={(e) => setStdDev(+e.target.value)} className="h-8 text-sm" /></div>
        <div><Label className="text-xs">Subgroup size (n)</Label><Input type="number" value={n} onChange={(e) => setN(+e.target.value)} className="h-8 text-sm" /></div>
      </div>
      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="subgroup" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
            <ReferenceLine y={simplifiedUCL} stroke="#f43f5e" strokeDasharray="4 2" label={{ value: `UCL=${simplifiedUCL.toFixed(2)}`, style: { fontSize: 9 } }} />
            <ReferenceLine y={mean} stroke="#10b981" strokeDasharray="2 2" label={{ value: `μ=${mean.toFixed(2)}`, style: { fontSize: 9 } }} />
            <ReferenceLine y={lcl} stroke="#f43f5e" strokeDasharray="4 2" label={{ value: `LCL=${lcl.toFixed(2)}`, style: { fontSize: 9 } }} />
            <Line type="monotone" dataKey="xbar" stroke="#0ea5e9" strokeWidth={2} dot={(props: any) => {
              const { cx, cy, payload } = props;
              return <Dot key={cx} cx={cx} cy={cy} r={3} fill={payload.outOfControl ? "#f43f5e" : "#0ea5e9"} stroke={payload.outOfControl ? "#f43f5e" : "#0ea5e9"} />;
            }} name="X̄" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs">
        <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
        <span className="font-medium">{violations.length}</span>
        <span className="text-muted-foreground">out-of-control points detected (Western Electric Rule 1: beyond ±3σ)</span>
      </div>
    </Card>
  );
}
