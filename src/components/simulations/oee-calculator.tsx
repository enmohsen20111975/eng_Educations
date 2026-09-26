"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";

/** OEE Simulator — Availability × Performance × Quality = Overall Equipment Effectiveness.
 * Interactive inputs for the 6 big losses. Shows OEE % + sigma level + breakdown bar. */
export function OEESimulation() {
  const [plannedTime, setPlannedTime] = React.useState(480); // minutes/shift
  const [downtime, setDowntime] = React.useState(42); // breakdown + setup
  const [idealCycle, setIdealCycle] = React.useState(2.5); // sec/unit
  const [actualOutput, setActualOutput] = React.useState(9500); // units produced
  const [defects, setDefects] = React.useState(120); // reject units

  const runTime = Math.max(0, plannedTime - downtime);
  const availability = runTime / plannedTime;
  const performance = actualOutput > 0 ? Math.min(1, (actualOutput * idealCycle) / (runTime * 60)) : 0;
  const goodUnits = Math.max(0, actualOutput - defects);
  const quality = actualOutput > 0 ? goodUnits / actualOutput : 0;
  const oee = availability * performance * quality;

  const sigmaLevel = oee > 0 ? (1.5 + 3.091 / Math.sqrt(1 - oee) ** 0.5) : 0; // rough
  const sigmaPct = oee > 0 ? (1 - (1 - oee)) * 100 : 0;

  const lossesData = [
    { name: "Availability", value: +(availability * 100).toFixed(1), color: "#10b981" },
    { name: "Performance", value: +(performance * 100).toFixed(1), color: "#0ea5e9" },
    { name: "Quality", value: +(quality * 100).toFixed(1), color: "#f59e0b" },
    { name: "OEE", value: +(oee * 100).toFixed(1), color: "#8b5cf6" },
  ];

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <Info className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-semibold">OEE Simulator — Availability × Performance × Quality</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <Label className="text-xs">Planned Production Time (min/shift)</Label>
            <Input type="number" value={plannedTime} onChange={(e) => setPlannedTime(+e.target.value)} className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">Downtime — breakdowns + setup (min)</Label>
            <Input type="number" value={downtime} onChange={(e) => setDowntime(+e.target.value)} className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">Ideal Cycle Time (sec/unit)</Label>
            <Input type="number" step="0.1" value={idealCycle} onChange={(e) => setIdealCycle(+e.target.value)} className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">Total Output (units)</Label>
            <Input type="number" value={actualOutput} onChange={(e) => setActualOutput(+e.target.value)} className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">Reject / Defect Units</Label>
            <Input type="number" value={defects} onChange={(e) => setDefects(+e.target.value)} className="h-8 text-sm" />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          <div className="rounded-xl bg-gradient-to-br from-violet-500/10 to-emerald-500/10 p-4 text-center">
            <p className="text-xs font-medium uppercase text-muted-foreground">Overall Equipment Effectiveness</p>
            <p className="text-4xl font-bold tabular-nums text-violet-600">{(oee * 100).toFixed(1)}%</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {oee >= 0.85 ? "🏆 World-class (≥85%)" : oee >= 0.6 ? "Good (60-85%)" : "Needs improvement (<60%)"}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Metric label="Availability" value={`${(availability * 100).toFixed(1)}%`} hint={`${runTime}min`} color="text-emerald-600" />
            <Metric label="Performance" value={`${(performance * 100).toFixed(1)}%`} hint={`${actualOutput}u`} color="text-sky-600" />
            <Metric label="Quality" value={`${(quality * 100).toFixed(1)}%`} hint={`${goodUnits} good`} color="text-amber-600" />
          </div>

          {/* Bar chart */}
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lossesData} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={70} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} formatter={(v: any) => `${v}%`} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {lossesData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  );
}

function Metric({ label, value, hint, color }: { label: string; value: string; hint: string; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-2 text-center">
      <p className="text-[9px] font-medium uppercase text-muted-foreground">{label}</p>
      <p className={`text-base font-bold tabular-nums ${color}`}>{value}</p>
      <p className="text-[9px] text-muted-foreground">{hint}</p>
    </div>
  );
}
