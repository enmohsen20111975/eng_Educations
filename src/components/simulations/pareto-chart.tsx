"use client";
import * as React from "react";
import { BarChart, Bar, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";

/** Pareto Chart — bar (frequency) + line (cumulative %), 80/20 analysis. */
export function ParetoChartSimulation() {
  const [raw, setRaw] = React.useState("120,85,60,35,20,12,8,5,3,2");
  const data = React.useMemo(() => {
    const vals = raw.split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n) && n > 0).sort((a, b) => b - a);
    const total = vals.reduce((s, v) => s + v, 0);
    let cum = 0;
    return vals.map((v, i) => { cum += v; return { name: `#${i + 1}`, value: v, cumPct: +((cum / total) * 100).toFixed(1) }; });
  }, [raw]);
  const top80 = data.filter((d) => d.cumPct <= 80).length;
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2"><Info className="h-4 w-4 text-emerald-600" /><h3 className="text-sm font-semibold">Pareto Chart — 80/20 Analysis</h3></div>
      <div className="mb-3"><Label className="text-xs">Failure frequencies (comma-separated, e.g. 120,85,60,35,...)</Label><Input value={raw} onChange={(e) => setRaw(e.target.value)} className="text-sm" /></div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="L" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="R" orientation="right" domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
            <Bar yAxisId="L" dataKey="value" name="Frequency" radius={[4, 4, 0, 0]}>{data.map((_, i) => <Cell key={i} fill={i < top80 ? "#10b981" : "#cbd5e1"} />)}</Bar>
            <Line yAxisId="R" type="monotone" dataKey="cumPct" stroke="#f43f5e" strokeWidth={2.5} name="Cumulative %" dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 rounded-lg bg-emerald-500/10 p-2 text-center text-sm">
        <span className="font-bold text-emerald-600">{top80}</span> of {data.length} causes = <span className="font-bold text-emerald-600">80%</span> of failures (Pareto principle)
      </div>
    </Card>
  );
}
