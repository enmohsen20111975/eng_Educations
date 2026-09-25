"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Database, Target, TrendingUp, Layers3, Save } from "lucide-react";
import { api } from "@/lib/api";
import { EmptyState, PageLoader, StatCard, SectionIcon } from "@/components/shared";
import { accentGradient } from "@/lib/student-key";
import type { MatrixCell } from "@/lib/types";
import { BLOOM_LEVELS, DIFFICULTIES, QUESTION_TYPES } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function MatrixDashboard() {
  const qc = useQueryClient();
  const { data: cells, isLoading } = useQuery<MatrixCell[]>({
    queryKey: ["matrix"],
    queryFn: api.matrix,
  });
  const [sectionId, setSectionId] = React.useState<string>("");

  const sections = React.useMemo(() => {
    const seen = new Map<string, { id: string; title: string; color: string; icon: string }>();
    for (const c of cells || []) {
      if (!seen.has(c.sectionId))
        seen.set(c.sectionId, {
          id: c.sectionId,
          title: c.sectionTitle,
          color: c.sectionColor,
          icon: "Calculator",
        });
    }
    return Array.from(seen.values());
  }, [cells]);

  React.useEffect(() => {
    if (!sectionId && sections.length > 0) setSectionId(sections[0].id);
  }, [sections, sectionId]);

  const totals = React.useMemo(() => {
    const current = cells?.reduce((s, c) => s + c.currentCount, 0) ?? 0;
    const target = cells?.reduce((s, c) => s + c.targetCount, 0) ?? 0;
    return { current, target, pct: target ? Math.round((current / target) * 100) : 0 };
  }, [cells]);

  const bySection = React.useMemo(() => {
    const map = new Map<string, { title: string; color: string; current: number; target: number }>();
    for (const c of cells || []) {
      const cur = map.get(c.sectionId) || { title: c.sectionTitle, color: c.sectionColor, current: 0, target: 0 };
      cur.current += c.currentCount;
      cur.target += c.targetCount;
      map.set(c.sectionId, cur);
    }
    return Array.from(map.entries())
      .map(([id, v]) => ({ id, ...v, pct: v.target ? Math.round((v.current / v.target) * 100) : 0 }))
      .sort((a, b) => b.pct - a.pct);
  }, [cells]);

  if (isLoading) return <PageLoader label="Loading matrix…" />;
  if (!cells || cells.length === 0)
    return <EmptyState icon={Database} title="Matrix not built" description="Run the seed to generate matrix cells." />;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Questions now" value={totals.current} icon={Database} hint="Live in the bank" accent="emerald" />
        <StatCard label="Target total" value={totals.target} icon={Target} hint="All matrix cells" accent="amber" />
        <StatCard label="Overall fill" value={`${totals.pct}%`} icon={TrendingUp} hint="Toward target" accent="teal" />
        <StatCard label="Stretch goal" value="5,000" icon={Layers3} hint="Documented roadmap" accent="cyan" />
      </section>

      {/* Per-section grid */}
      <Card className="p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold">Section matrix</h3>
            <p className="text-xs text-muted-foreground">
              Each cell = difficulty × Bloom level × type. Edit targets inline.
            </p>
          </div>
          <div className="w-full sm:w-72">
            <Select value={sectionId} onValueChange={setSectionId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {sections.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <SectionMatrixGrid sectionId={sectionId} cells={cells} />
      </Card>

      {/* All sections ranking */}
      <Card className="p-5">
        <h3 className="mb-1 text-sm font-semibold">Fill by discipline</h3>
        <p className="mb-4 text-xs text-muted-foreground">Ranked by progress toward target.</p>
        <div className="eng-scroll max-h-96 space-y-2.5 overflow-y-auto pr-1">
          {bySection.map((s) => (
            <div key={s.id} className="flex items-center gap-3">
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white", accentGradient(s.color))}>
                <SectionIcon name="Calculator" className="h-4 w-4" />
              </span>
              <div className="w-36 shrink-0 truncate text-sm font-medium">{s.title}</div>
              <Progress value={s.pct} className="h-2.5 flex-1" />
              <div className="w-28 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                {s.current}/{s.target} · {s.pct}%
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SectionMatrixGrid({
  sectionId,
  cells,
}: {
  sectionId: string;
  cells: MatrixCell[];
}) {
  const qc = useQueryClient();
  const sectionCells = cells.filter((c) => c.sectionId === sectionId);

  const upsertMut = useMutation({
    mutationFn: (data: Partial<MatrixCell>) => api.upsertMatrixCell(data),
    onSuccess: () => {
      toast.success("Target updated");
      qc.invalidateQueries({ queryKey: ["matrix"] });
    },
    onError: (e: any) => toast.error(e.message || "Update failed"),
  });

  const cellFor = (d: string, b: string, t: string) =>
    sectionCells.find((c) => c.difficulty === d && c.bloomLevel === b && c.type === t);

  if (!sectionId) return <EmptyState icon={Database} title="Pick a section" />;

  const typeTotals = QUESTION_TYPES.map((t) => {
    const cur = sectionCells.filter((c) => c.type === t).reduce((s, c) => s + c.currentCount, 0);
    const tgt = sectionCells.filter((c) => c.type === t).reduce((s, c) => s + c.targetCount, 0);
    return { type: t, cur, tgt };
  });

  return (
    <div>
      {/* type summary chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {typeTotals.map((tt) => (
          <span key={tt.type} className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs">
            <span className="font-medium">{tt.type === "MultipleChoice" ? "MCQ" : "True/False"}</span>
            <span className="ml-2 text-muted-foreground tabular-nums">{tt.cur}/{tt.tgt}</span>
          </span>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-1 text-sm">
          <thead>
            <tr>
              <th className="rounded-md bg-muted/50 px-3 py-2 text-left text-xs font-medium text-muted-foreground">Bloom \ Difficulty</th>
              {DIFFICULTIES.map((d) => (
                <th key={d} className="rounded-md bg-muted/50 px-3 py-2 text-center text-xs font-medium text-muted-foreground">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BLOOM_LEVELS.map((b) => (
              <tr key={b}>
                <td className="rounded-md bg-muted/30 px-3 py-2 text-xs font-medium">{b}</td>
                {DIFFICULTIES.map((d) => {
                  const mc = cellFor(d, b, "MultipleChoice");
                  const tf = cellFor(d, b, "TrueFalse");
                  const cur = (mc?.currentCount ?? 0) + (tf?.currentCount ?? 0);
                  const tgt = (mc?.targetCount ?? 0) + (tf?.targetCount ?? 0);
                  const pct = tgt ? Math.min(100, Math.round((cur / tgt) * 100)) : 0;
                  return (
                    <td key={d} className="align-top">
                      <div className="rounded-lg border border-border p-2">
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase text-muted-foreground">{cur}/{tgt}</span>
                          <span className={cn("text-[10px] font-bold", pct >= 100 ? "text-emerald-600 dark:text-emerald-400" : pct >= 50 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400")}>{pct}%</span>
                        </div>
                        <Progress value={pct} className="h-1.5" />
                        <div className="mt-2 grid grid-cols-2 gap-1.5">
                          <MatrixCellInput label="MCQ" cell={mc} onSubmit={(v) => upsertMut.mutate({ sectionId, difficulty: d, bloomLevel: b, type: "MultipleChoice", targetCount: v })} />
                          <MatrixCellInput label="T/F" cell={tf} onSubmit={(v) => upsertMut.mutate({ sectionId, difficulty: d, bloomLevel: b, type: "TrueFalse", targetCount: v })} />
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Each cell shows live questions vs target. Adjust the target numbers to
        reflect your roadmap toward the 5,000-question bank.
      </p>
    </div>
  );
}

function MatrixCellInput({
  label,
  cell,
  onSubmit,
}: {
  label: string;
  cell?: MatrixCell;
  onSubmit: (v: number) => void;
}) {
  const [val, setVal] = React.useState(String(cell?.targetCount ?? 0));
  React.useEffect(() => setVal(String(cell?.targetCount ?? 0)), [cell?.targetCount]);
  return (
    <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
      <span className="shrink-0">{label}</span>
      <Input
        type="number"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => {
          const n = Math.max(0, Number(val) || 0);
          if (cell && n !== cell.targetCount) onSubmit(n);
          else setVal(String(cell?.targetCount ?? 0));
        }}
        className="h-6 px-1 py-0 text-[11px]"
      />
    </label>
  );
}
