"use client";

import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** FMEA RPN Simulator — Risk Priority Number = Severity × Occurrence × Detection.
 * Interactive sliders for S, O, D (1-10 each). Shows RPN + risk band + action guidance. */
export function FMEASimulation() {
  const [severity, setSeverity] = React.useState(8);
  const [occurrence, setOccurrence] = React.useState(4);
  const [detection, setDetection] = React.useState(3);

  const rpn = severity * occurrence * detection;
  const maxRpn = 1000;

  const riskBand = rpn >= 200 ? "Critical" : rpn >= 100 ? "High" : rpn >= 50 ? "Medium" : "Low";
  const riskColor = rpn >= 200 ? "text-rose-600" : rpn >= 100 ? "text-amber-600" : rpn >= 50 ? "text-sky-600" : "text-emerald-600";
  const needsAction = rpn >= 100;

  const params = [
    { label: "Severity (S)", value: severity, set: setSeverity, desc: "Impact if failure occurs" },
    { label: "Occurrence (O)", value: occurrence, set: setOccurrence, desc: "Likelihood of the failure" },
    { label: "Detection (D)", value: detection, set: setDetection, desc: "Difficulty to detect (higher = harder)" },
  ];

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <Info className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-semibold">FMEA Risk Priority Number — RPN = S × O × D</h3>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Sliders */}
        <div className="sm:col-span-2 space-y-5">
          {params.map((p) => (
            <div key={p.label}>
              <div className="mb-2 flex justify-between">
                <div>
                  <p className="text-sm font-medium">{p.label}</p>
                  <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                </div>
                <span className="text-2xl font-bold tabular-nums">{p.value}</span>
              </div>
              <Slider value={[p.value]} min={1} max={10} step={1} onValueChange={(v) => p.set(v[0])} />
              <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
                <span>1 (low)</span>
                <span>5 (medium)</span>
                <span>10 (high)</span>
              </div>
            </div>
          ))}
        </div>

        {/* RPN Result */}
        <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-900 dark:to-slate-800">
          <p className="text-xs font-medium uppercase text-muted-foreground">Risk Priority Number</p>
          <p className={cn("text-5xl font-bold tabular-nums", riskColor)}>{rpn}</p>
          <p className={cn("text-sm font-semibold", riskColor)}>{riskBand}</p>
          <div className="mt-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
            <div className={cn("h-2 rounded-full transition-all", riskBand === "Critical" ? "bg-rose-500" : riskBand === "High" ? "bg-amber-500" : riskBand === "Medium" ? "bg-sky-500" : "bg-emerald-500")} style={{ width: `${(rpn / maxRpn) * 100}%` }} />
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">max RPN = 1000</p>
          {needsAction ? (
            <div className="mt-2 flex items-center gap-1 text-xs text-rose-600">
              <AlertTriangle className="h-3.5 w-3.5" /> Action required (RPN ≥ 100)
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" /> Monitor (RPN &lt; 100)
            </div>
          )}
        </div>
      </div>

      {/* Action guidance */}
      <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3 text-xs">
        <p className="font-medium text-foreground">Action guidance:</p>
        <p className="mt-1 text-muted-foreground">
          {riskBand === "Critical"
            ? `Reduce Severity (design-out the failure mode) or Occurrence (preventive action). Current S=${severity} → target S≤4. Current O=${occurrence} → target O≤2.`
            : riskBand === "High"
              ? `Reduce Occurrence or Detection. Current O=${occurrence} → target O≤2. Current D=${detection} → target D≤2 (easier detection).`
              : riskBand === "Medium"
                ? `Monitor; reduce Detection if possible (D=${detection} → D≤2) for early warning.`
                : `Acceptable risk. Monitor via periodic FMEA review.`}
        </p>
      </div>
    </Card>
  );
}
