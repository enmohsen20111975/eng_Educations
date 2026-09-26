"use client";

import * as React from "react";
import { WeibullSimulation } from "./weibull-plot";
import { OEESimulation } from "./oee-calculator";
import { ControlChartSimulation } from "./control-chart";
import { FMEASimulation } from "./fmea-matrix";
import { BathtubCurveSimulation } from "./bathtub-curve";
import { ParetoChartSimulation } from "./pareto-chart";
import { RBDSimulation } from "./rbd-diagram";
import { EVMSimulation } from "./evm-calculator";
import { CPMSimulation } from "./cpm-network";
import { FishboneSimulation } from "./fishbone-diagram";

/** Maps lesson slug/competency keywords to relevant interactive simulations. */
const SIM_MAP: { match: string[]; Sim: React.ComponentType }[] = [
  { match: ["oee", "measurements", "production-reliability", "production", "6-big-loss", "tpm"], Sim: OEESimulation },
  { match: ["weibull", "distributions", "reliability-concepts", "equipment-reliability", "mtbf", "availability"], Sim: WeibullSimulation },
  { match: ["bathtub", "reliability-concepts", "reliability-program", "bathtub-curve"], Sim: BathtubCurveSimulation },
  { match: ["control-chart", "spc", "control", "shewhart", "western-electric", "six-sigma-control"], Sim: ControlChartSimulation },
  { match: ["fmea", "failure-modes", "failure-mode", "rpn", "fmeca"], Sim: FMEASimulation },
  { match: ["pareto", "80-20", "pareto-principle", "root-cause"], Sim: ParetoChartSimulation },
  { match: ["rbd", "reliability-block", "redundancy", "voting", "series", "parallel", "modeling", "markov"], Sim: RBDSimulation },
  { match: ["evm", "earned-value", "cost-management", "cpi", "spi", "eac", "vac", "pmp-process", "schedule"], Sim: EVMSimulation },
  { match: ["cpm", "pert", "critical-path", "network", "schedule", "pmp-process", "gantt"], Sim: CPMSimulation },
  { match: ["fishbone", "ishikawa", "root-cause", "rca", "5-why", "cause"], Sim: FishboneSimulation },

];

/** Returns matching simulations for a lesson based on its slug + competency name. */
export function getSimulations(slug: string, competencyName?: string): React.ComponentType[] {
  const hay = `${slug} ${competencyName || ""}`.toLowerCase();
  const sims: React.ComponentType[] = [];
  for (const { match, Sim } of SIM_MAP) {
    if (match.some((m) => hay.includes(m))) sims.push(Sim);
  }
  // Always show Weibull + OEE + FMEA + Control as a "suggested" set if no specific match
  if (sims.length === 0) {
    sims.push(WeibullSimulation, OEESimulation, FMEASimulation, ControlChartSimulation);
  }
  return sims;
}

/** Renders the matching simulations for a lesson. */
export function SimulationRenderer({ slug, competencyName }: { slug: string; competencyName?: string }) {
  const sims = React.useMemo(() => getSimulations(slug, competencyName), [slug, competencyName]);
  return (
    <div className="space-y-4">
      {sims.map((Sim, i) => (
        <Sim key={i} />
      ))}
    </div>
  );
}
