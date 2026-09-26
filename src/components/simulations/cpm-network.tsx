"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity { id: string; name: string; duration: number; deps: string[]; es: number; ef: number; ls: number; lf: number; float: number; critical: boolean; }

/** CPM/PERT Network — Critical Path Method with interactive activity list. */
export function CPMSimulation() {
  const [activities, setActivities] = React.useState([
    { id: "A", name: "Requirements", duration: 5, deps: [] },
    { id: "B", name: "Design", duration: 8, deps: ["A"] },
    { id: "C", name: "Procurement", duration: 6, deps: ["A"] },
    { id: "D", name: "Build", duration: 12, deps: ["B"] },
    { id: "E", name: "Install", duration: 4, deps: ["C"] },
    { id: "F", name: "Commission", duration: 3, deps: ["D", "E"] },
  ]);

  const computed = React.useMemo(() => {
    const acts: Activity[] = activities.map((a) => ({ ...a, es: 0, ef: 0, ls: 0, lf: 0, float: 0, critical: false }));
    const map = new Map(acts.map((a) => [a.id, a]));
    // Forward pass
    for (const a of acts) {
      a.es = a.deps.length > 0 ? Math.max(...a.deps.map((d) => map.get(d)?.ef ?? 0)) : 0;
      a.ef = a.es + a.duration;
    }
    const totalDur = Math.max(...acts.map((a) => a.ef));
    // Backward pass
    for (let i = acts.length - 1; i >= 0; i--) {
      const a = acts[i];
      const successors = acts.filter((x) => x.deps.includes(a.id));
      a.lf = successors.length > 0 ? Math.min(...successors.map((s) => s.ls)) : totalDur;
      a.ls = a.lf - a.duration;
      a.float = a.ls - a.es;
      a.critical = a.float === 0;
    }
    return { acts, totalDur, criticalPath: acts.filter((a) => a.critical).map((a) => a.id).join(" → ") };
  }, [activities]);

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2"><Info className="h-4 w-4 text-emerald-600" /><h3 className="text-sm font-semibold">CPM Critical Path — Forward/Backward Pass</h3></div>
      {/* Network visual: nodes in sequence */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {computed.acts.map((a) => (
          <React.Fragment key={a.id}>
            <div className={cn("flex h-14 w-20 flex-col items-center justify-center rounded-lg border-2 text-xs", a.critical ? "border-rose-500 bg-rose-500/10 text-rose-700" : "border-slate-300 bg-slate-50 text-slate-600")}>
              <span className="font-bold">{a.id}</span>
              <span className="text-[9px]">{a.duration}d</span>
            </div>
            {a.id !== computed.acts[computed.acts.length - 1].id ? <span className="text-slate-400">→</span> : null}
          </React.Fragment>
        ))}
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="py-1">ID</th><th>Name</th><th>Dur</th><th>ES</th><th>EF</th><th>LS</th><th>LF</th><th>Float</th>
          </tr></thead>
          <tbody>
            {computed.acts.map((a) => (
              <tr key={a.id} className={cn("border-b", a.critical && "bg-rose-500/5")}>
                <td className="py-1 font-bold">{a.id}</td><td>{a.name}</td><td>{a.duration}</td><td>{a.es}</td><td>{a.ef}</td><td>{a.ls}</td><td>{a.lf}</td><td className={a.float === 0 ? "font-bold text-rose-600" : ""}>{a.float}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-500/10 p-2 text-sm">
        <span className="font-bold text-rose-600">Critical Path:</span><span>{computed.criticalPath}</span>
        <span className="ml-auto text-muted-foreground">Total: {computed.totalDur} days</span>
      </div>
    </Card>
  );
}
