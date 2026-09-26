"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/** EVM (Earned Value Management) Calculator — CPI/SPI/EAC/VAC for PMP. */
export function EVMSimulation() {
  const [bac, setBac] = React.useState(100000);
  const [pv, setPv] = React.useState(60000);
  const [ev, setEv] = React.useState(50000);
  const [ac, setAc] = React.useState(72000);

  const cv = ev - ac;
  const sv = ev - pv;
  const cpi = ac > 0 ? ev / ac : 0;
  const spi = pv > 0 ? ev / pv : 0;
  const eac1 = cpi > 0 ? bac / cpi : 0; // EAC = BAC/CPI
  const vac = bac - eac1;
  const tcpi = (bac - ev) / (bac - ac);

  const fmt = (n: number) => "$" + Math.round(n).toLocaleString();
  const pct = (n: number) => (n * 100).toFixed(1) + "%";

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2"><Info className="h-4 w-4 text-emerald-600" /><h3 className="text-sm font-semibold">Earned Value Management (EVM) — CPI/SPI/EAC/VAC</h3></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="BAC (Budget)" value={bac} set={setBac} fmt={fmt} />
        <Field label="PV (Planned)" value={pv} set={setPv} fmt={fmt} />
        <Field label="EV (Earned)" value={ev} set={setEv} fmt={fmt} />
        <Field label="AC (Actual)" value={ac} set={setAc} fmt={fmt} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="CV (Cost Var)" value={fmt(cv)} good={cv >= 0} />
        <Metric label="SV (Sched Var)" value={fmt(sv)} good={sv >= 0} />
        <Metric label="CPI (Cost Perf)" value={pct(cpi)} good={cpi >= 1} />
        <Metric label="SPI (Sched Perf)" value={pct(spi)} good={spi >= 1} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Metric label="EAC (BAC/CPI)" value={fmt(eac1)} good={eac1 <= bac} />
        <Metric label="VAC (BAC-EAC)" value={fmt(vac)} good={vac >= 0} />
        <Metric label="TCPI (to BAC)" value={pct(tcpi)} good={tcpi <= 1} />
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs">
        <AlertCircle className={cn("h-4 w-4", cpi >= 1 && spi >= 1 ? "text-emerald-500" : "text-rose-500")} />
        <span className="text-muted-foreground">
          {cpi >= 1 && spi >= 1 ? "Project on track — under budget and ahead of schedule." : cpi < 1 && spi < 1 ? "Project over budget AND behind schedule. Take corrective action." : cpi < 1 ? "Over budget. Review cost controls." : "Behind schedule. Review resource allocation."}
        </span>
      </div>
    </Card>
  );
}
function Field({ label, value, set, fmt }: { label: string; value: number; set: (n: number) => void; fmt: (n: number) => string }) {
  return (<div><Label className="text-[10px]">{label}</Label><Input type="number" value={value} onChange={(e) => set(+e.target.value)} className="h-8 text-sm" /><span className="text-[10px] text-muted-foreground">{fmt(value)}</span></div>);
}
function Metric({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (<div className={cn("rounded-lg border p-2 text-center", good ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5")}><p className="text-[9px] font-medium uppercase text-muted-foreground">{label}</p><p className={cn("text-base font-bold tabular-nums", good ? "text-emerald-600" : "text-rose-600")}>{value}</p></div>);
}
