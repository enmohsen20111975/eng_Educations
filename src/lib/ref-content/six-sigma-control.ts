// =============================================================================
// Six Sigma (ASQ / IASSC) — DMAIC Control (C) phase — Deep scientific reference
// (Task ID 17-SS-CTRL2).
//
// Certification slug: "six-sigma" (ASQ/IASSC, group "Quality"). Domain code:
// "C" (Control) — the 5th and final DMAIC BOK domain. The C domain exists in
// src/lib/ref-content/six-sigma.ts (the combined structure+M/A-content
// loader) but is seeded with NO competencies. This CONTENT-only loader
// creates the 3 Control competencies inside loadReference() and then loads
// the deep scientific content (3 full-spec 24-section lessons + KOs + 12
// enriched questions).
//
// Three lessons, one per Control competency (created below in loadReference()):
//   1. Statistical Process Control (SPC)         (slug: c-spc-charts)
//   2. Control Plans & Standardization            (slug: c-control-plan-sop)
//   3. Continuous Improvement & Visual Management (slug: c-continuous-improvement-visual)
//
// Each lesson ships:
//   - The full 24-section data-collector template (spec §9, LESSON_TEMPLATE
//     in src/lib/spec.ts), with every applicable section filled with real,
//     in-depth professional Control-phase content. No padding.
//   - A Knowledge Object body (spec §7, KO_FIELDS) with applicable arrays
//     (definitions, principles, components, mechanism, process, formulas,
//     metrics, examples, industrial_examples, case_studies, common_errors,
//     limitations, best_practices, related_concepts, prerequisites,
//     references) populated with real content.
//   - 4 enriched questions (whyCorrect + one whyOthersWrong per distractor +
//     cognitiveLevel + KO link + scenario/industry metadata), mixing 3 MCQ
//     and 1 True/False, spanning Easy/Medium/Hard × Remember/Understand/
//     Apply/Analyze. Total in this file: 12 questions.
//
// Source hierarchy (spec §5) — Levels 3, 6, 7:
//   - LEVEL 3 — Official BOK / Handbook / Exam Outline: ASQ Six Sigma Black
//     Belt BOK (DMAIC Control domain); ASQ Six Sigma Green Belt BOK.
//   - LEVEL 6 — University / Academic Publications: Douglas C. Montgomery,
//     "Statistical Quality Control: A Modern Introduction" (Wiley, 7th ed.).
//   - LEVEL 7 — Technical Publications / Industry Sources: Forrest W.
//     Breyfogle III, "Implementing Six Sigma" (Wiley, 2nd ed.);
//     Jeffrey K. Liker, "The Toyota Way" (McGraw-Hill, 2nd ed.);
//     Masaaki Imai, "Kaizen" (McGraw-Hill).
//
// Originality (spec §16): all worked examples, decision scenarios, case
// studies, and questions are authored for this platform; textbook material
// is summarized and cited, not reproduced. Case studies are SYNTHETIC and
// explicitly marked `CASE_TYPE = SYNTHETIC` inside the lesson text.
//
// Lifecycle: every record (Competency, Lesson, KnowledgeObject, Question,
// Reference) is upserted with status="READY", confidence="HIGH",
// verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
//
// IMPORTANT: This loader does NOT call six-sigma.ts and does NOT wipe other
// Six Sigma domains (D, M, A, I). It operates exclusively on the Control (C)
// domain — it deletes only the existing C competencies (idempotent
// re-create) before creating the 3 C competencies and loading the deep
// content.
// =============================================================================

import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// Public types (mirror six-sigma-define.ts & six-sigma.ts)
// ---------------------------------------------------------------------------

export interface RefOption {
  text: string;
  isCorrect: boolean;
}

export interface RefQuestion {
  competencyName: string;
  type: "MultipleChoice" | "TrueFalse";
  difficulty: "Easy" | "Medium" | "Hard";
  bloomLevel: "Remember" | "Understand" | "Apply" | "Analyze";
  cognitiveLevel: string; // Recall|Understanding|Application|Analysis|Evaluation|Calculation|Scenario|DecisionMaking
  skillType?: string; // Definitional|Conceptual|Numerical|Procedural
  scenario?: string; // Manufacturing|Oil & Gas|Power|Chemical|Healthcare|...
  stem: string;
  explanation?: string;
  whyCorrect: string;
  whyOthersWrong: string[];
  options: RefOption[];
}

export interface RefLesson {
  competencyName: string;
  slug: string;
  title: string;
  titleAr?: string;
  order: number;
  durationMin: number;
  conceptIntroduction: string;
  example?: string;
  keyFormulas?: string;
  exercise?: string;
  /** Titles of RefSource entries this lesson cites. */
  references: string[];
  /** The 24-section template (spec §9); values are markdown-ish strings or "NOT_APPLICABLE". */
  sections: Record<string, string>;
  knowledgeObject: {
    title: string;
    domain: string;
    competency: string;
    topic: string;
    concept: string;
    body: Record<string, any>;
  };
  questions: RefQuestion[];
}

export interface RefSource {
  title: string;
  level: string; // "1".."9"
  levelLabel: string;
  type: string; // BOOK|STANDARD|HANDBOOK|PAPER|WEBSITE|BOK|EXAM_OUTLINE
  url?: string;
  citation: string;
}

// ---------------------------------------------------------------------------
// SOURCES — 6 real references cited across all 3 Control lessons.
// ---------------------------------------------------------------------------

export const SS_CONTROL_SOURCES: RefSource[] = [
  {
    title: "ASQ Six Sigma Black Belt Body of Knowledge — Control phase",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "BOK",
    url: "https://asq.org/cert/six-sigma-black-belt",
    citation:
      "American Society for Quality (ASQ). Six Sigma Black Belt (CSSBB) Body of Knowledge — Control phase. The official ASQ competency framework for the Control stage of DMAIC: statistical process control (objectives and benefits; common vs. special cause variation; rational subgroups; selection of variable, attribute, and special-purpose charts: X̄-R, X̄-s, I-MR, p, np, c, u; control-chart interpretation and Western Electric / Nelson run rules); control plan construction (characteristic, specification, measurement method, sample size/frequency, control method, reaction plan); sustaining controls (standard work / SOPs, poka-yoke, visual management, training, OPLs); project hand-off to the process owner; lessons learned and toll-gate review. Anchors the CSSBB exam's Control-phase questions and the lock-in-the-gains competency expected of every Black Belt.",
  },
  {
    title: "ASQ Six Sigma Green Belt Body of Knowledge — Control phase",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "BOK",
    url: "https://asq.org/cert/six-sigma-green-belt",
    citation:
      "American Society for Quality (ASQ). Six Sigma Green Belt (CSSGB) Body of Knowledge — Control phase. The official ASQ competency framework for Green-Belt project close-out: control charts (X̄-R, p, np, c, u) at the level of chart selection and interpretation; control plan basics (characteristic, spec, measurement, sample, control method, reaction); visual management and 5S workplace organization; SOP and training hand-off; project closure with sponsor sign-off and benefits tracking. Green Belts support Black Belts in writing SOPs, posting control charts, and running tier huddles to sustain gains within their home process.",
  },
  {
    title: "Montgomery — Statistical Quality Control (Wiley)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Montgomery, D. C. (2013). Statistical Quality Control: A Modern Introduction (7th ed.). Hoboken, NJ: John Wiley & Sons. ISBN 978-1-118-14681-1. Chapter 6 (introduction to statistical process control — Shewhart's two-cause model, the in-control vs out-of-control distinction, rational subgroups, the role of the control chart as the online detection device); Chapter 7 (variable control charts: X̄-R, X̄-s, I-MR; the constants A2, D3, D4, d2; rational subgrouping strategy, run rules including the Western Electric zone rules); Chapter 8 (attribute charts: p, np, c, u; the binomial and Poisson process models); Chapter 10 (process-capability analysis and the link between SPC and Cp/Cpk). The canonical academic reference for SPC theory, chart constants, and the Western Electric zone rules.",
  },
  {
    title: "Breyfogle — Implementing Six Sigma (Wiley)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Breyfogle, F. W. (2003). Implementing Six Sigma: Smarter Solutions Using Statistical Methods (2nd ed.). Hoboken, NJ: John Wiley & Sons. ISBN 978-0-471-26572-6. Chapter 10 (the control plan as the bridge between the Analyze/Improve findings and the sustaining system; the control-plan matrix — characteristic, specification, measurement method, sample size/frequency, control method, reaction plan); Chapter 38 (SPC chart selection — the variable vs attribute decision tree, X̄-R, X̄-s, I-MR, p, np, c, u); Chapter 39 (control-chart interpretation — the run rules, out-of-control action plans, the OC curve and ARL); Chapter 43 (project hand-off to the process owner, control-plan sustainment audit). The practitioner reference that anchors the Control-phase deliverable set.",
  },
  {
    title: "Liker — The Toyota Way (McGraw-Hill)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Liker, J. K. (2004). The Toyota Way: 14 Management Principles from the World's Greatest Manufacturer. New York: McGraw-Hill. ISBN 978-0-07-139231-0. Principle 1 (base management decisions on long-term philosophy, even at the expense of short-term financial goals); Principle 5 (build a culture of stopping to fix problems — jidoka and the Andon, the right to pull the cord and call help); Principle 6 (standardized tasks are the foundation for continuous improvement and employee empowerment — standard work as the platform for Kaizen); Principle 8 (use only reliable, thoroughly tested technology that serves your people and processes); Principle 13 (make decisions slowly by consensus, thoroughly considering all options; implement rapidly — nemawashi and henshō); Principle 14 (become a learning organization through relentless reflection — hansei — and continuous improvement — Kaizen). The 14 principles underpin the Control-phase sustainment system: standard work, Andon, tier huddles, and hansei/Kaizen.",
  },
  {
    title: "Imai — Kaizen (McGraw-Hill)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Imai, M. (1986). Kaizen: The Key to Japan's Competitive Success. New York: McGraw-Hill. ISBN 978-0-07-554332-8. The original popularization of the Kaizen philosophy: improvement that is continuous, incremental, and worker-driven, as opposed to innovation that is radical, episodic, and technology-driven. Part I (the Kaizen umbrella — total quality control, JIT, QC circles, suggestion systems, 5S, kanban, visual management, TPM); Part II (the PDCA cycle as the engine of improvement — Plan-Do-Check-Act at every level, the SDCA stabilization cycle — Standardize-Do-Check-Act — that locks in the current process before improvement is attempted); Part III (the role of the supervisor and the Gemba — the real place — where value is created). The philosophical anchor for Lesson 3's PDCA/SDCA, Kaizen, 5S, Kanban, visual management, Andon, and tier huddles.",
  },
];

const SS_CONTROL_REFERENCE_TITLES = SS_CONTROL_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Lesson 1 — Statistical Process Control (SPC)
// (Competency: "Statistical Process Control (SPC)"; slug: c-spc-charts)
// ---------------------------------------------------------------------------

const LESSON_SPC: RefLesson = {
  competencyName: "Statistical Process Control (SPC)",
  slug: "c-spc-charts",
  title: "Statistical Process Control — Shewhart Charts, Run Rules, Rational Subgroups",
  titleAr: "الضبط الإحصائي للعمليات — خرائط شيوارت، قواعد الجري، المجموعات الرشيدة",
  order: 1,
  durationMin: 38,
  references: SS_CONTROL_REFERENCE_TITLES,
  conceptIntroduction: `Statistical Process Control (SPC) is the online detection device that distinguishes common-cause from special-cause variation in a running process. Walter A. Shewhart's two-cause model (1924, Bell Labs) partitions variation into (a) common cause — the inherent, random, noise-level variation present in any stable process, attributable to the system itself (the design of the equipment, the choice of materials, the way the process is operated); and (b) special cause — the assignable, non-random, statistically detectable signals of a process change (a shift in mean, a step in variance, a drift, a cycle, a stratification). The two causes call for two different responses: a common-cause signal cannot be removed by tampering with individual points — only by redesigning the system (a management action, often an Improve-phase project); a special-cause signal must be investigated, its root cause identified, and either eliminated (if adverse) or institutionalized (if beneficial). Tampering with a stable process (reacting to common-cause points as if they were special) — Deming's funnel-experiment pathology — doubles the variance instead of reducing it.

The control chart is the operational instrument of SPC. A Shewhart chart plots a sample statistic (X̄ for variables, p for attributes) against time, bracketed by an upper control limit (UCL) and lower control limit (LCL) set at ±3 standard deviations of the plotted statistic from the centerline. The 3σ limits are designed so that, in a stable process, only 0.27% of points fall outside by chance — yielding a low false-alarm rate (1 in ~370, ARL₀ ≈ 370). The chart selection tree is governed by data type: continuous data (length, weight, time, temperature) is charted on variable charts — X̄-R (subgroup n=2-10, mean and range), X̄-s (subgroup n≥10, mean and standard deviation), or I-MR (n=1, individuals and moving range); counted-as-defective data (pass/fail, conforming/nonconforming) is charted on p (proportion) or np (count) charts; counted-as-defects data (number of scratches, errors, voids per unit) is charted on c (constant area) or u (variable area) charts. Subgroup size and sampling frequency are deliberate design choices — rational subgroups are constructed so that within-subgroup variation captures common cause (the noise) and between-subgroup differences expose special cause (the signal).

The Western Electric zone rules (WECO, 1958) and the Nelson rules (1984) extend Shewhart's original single rule (1 point beyond 3σ) to detect smaller, sustained shifts. The four core WECO rules signal when: (1) 1 point beyond 3σ; (2) 2 of 3 consecutive points beyond 2σ on the same side; (3) 4 of 5 consecutive points beyond 1σ on the same side; (4) 8 consecutive points on one side of the centerline. Rule 1 catches the large spike; rule 2 catches a ~1.5σ step shift; rule 3 catches a ~1σ drift; rule 4 catches a small sustained mean shift. The control plan (Lesson 2) operationalizes the chart's signal: every out-of-control point triggers the reaction plan (investigate, contain, root-cause, corrective-action, restart) and the Andon (Lesson 3) calls for help.`,
  example: `A CNC grinding cell produces shafts whose OD CTQ is 10.000 ± 0.020 mm (USL=10.020, LSL=9.980). The Improve phase locked wheel-feed at 0.180 mm/s and fixture clamp at 22 kN. Control enters with 25 subgroups of n=5 (one subgroup per hour). The historical grand averages are X̄̄ = 10.000 mm and R̄ = 0.340 mm.

**Chart selection.** Continuous data, subgroup n=5 (2 ≤ n ≤ 10), the chart of choice is X̄-R. Constants for n=5: A2=0.577, D3=0, D4=2.114, d2=2.326.

**Limit calculations.**
- Centerline X̄ = X̄̄ = 10.000 mm.
- σ̂_within = R̄ / d2 = 0.340 / 2.326 = 0.1462 mm.
- 3σ of the X̄ statistic = A2·R̄ = 0.577 × 0.340 = 0.196 mm → UCL_X̄ = 10.196, LCL_X̄ = 9.804.
- R chart centerline R̄ = 0.340; UCL_R = D4·R̄ = 2.114 × 0.340 = 0.719 mm; LCL_R = D3·R̄ = 0.

**Capability.** Cp = (USL − LSL)/(6·σ̂_within) = 0.040/(6×0.1462) = 0.046 → process is INCAPABLE of meeting the 10.000 ± 0.020 spec even when in statistical control. (Capability needs σ̂ ≤ 0.0066 mm for Cp=1.0.) The Belt raises a follow-up Improve project; Control meanwhile monitors the X̄-R chart to lock the existing sigma level and detect drift.

**Western Electric rule-2 detection.** Hours 14, 15, 16 deliver X̄ = 10.142, 10.168, 10.121. The 2σ zone lines on the X̄ chart are at X̄̄ ± (2/3)·A2·R̄ = 10.000 ± 0.131 = (10.131 upper, 9.869 lower). Hours 14 and 15 fall above the upper 2σ zone line (10.131); hour 16 is between 1σ and 2σ. That is 2 of 3 consecutive points beyond 2σ on the same side — WECO rule 2 fires → assignable cause suspected. The operator runs the reaction plan: stop, call the process engineer (Andon tier-1), investigate. Root cause: wheel-grit freshness decayed (X4 from the Define charter); corrective action: schedule wheel-dress every 12 subgroups; restart, re-baseline.`,
  keyFormulas: `X̄ chart (Shewhart variables, n=2-10):
  Centerline X̄̄ = (Σ X̄ᵢ) / k   (k = number of subgroups)
  UCL_X̄ = X̄̄ + A2 · R̄
  LCL_X̄ = X̄̄ − A2 · R̄
R chart (companion):
  Centerline R̄ = (Σ Rᵢ) / k   ;  UCL_R = D4 · R̄   ;  LCL_R = D3 · R̄   (D3 = 0 for n ≤ 6)
Within-subgroup standard deviation:  σ̂_within = R̄ / d2
Process capability (potential):  Cp = (USL − LSL) / (6 · σ̂_within)
p chart (attribute, proportion defective):
  p̄ = Σ(nᵢ · pᵢ) / Σnᵢ  = Σ(defects) / Σ(inspected)
  UCL_p = p̄ + 3 · √(p̄(1−p̄) / n̄)   ;   LCL_p = max(0, p̄ − 3 · √(p̄(1−p̄) / n̄))
np chart:  Center = n · p̄   ;   UCL = n·p̄ + 3·√(n·p̄(1−p̄))   (constant n)
c chart (Poisson defects, constant area):  Center = c̄   ;   UCL = c̄ + 3·√c̄
u chart (defects/unit, variable area):  ū = Σc/Σn   ;   UCL = ū + 3·√(ū/n̄)
Western Electric run rules (WECO 1958): Rule 1 = 1 pt beyond 3σ; Rule 2 = 2 of 3 pts beyond 2σ (same side); Rule 3 = 4 of 5 pts beyond 1σ (same side); Rule 4 = 8 consecutive pts one side of center. Average Run Length ARL₀ ≈ 1/(α) where α is the false-alarm probability of the rule combination; for Rule 1 alone, ARL₀ ≈ 370.`,
  exercise: `A Green Belt in a PCB SMT line wants to chart solder-bridge defectives. Daily sampling: 100 boards inspected, defects counted. Historical: 25 days, total boards 2,500, total solder-bridge defects 250. (a) Compute p̄, UCL_p, LCL_p. (b) Day 26 reports 16 defects on 100 boards — is the process in control? (c) If on day 27 the count is 4 defects, but on day 28 it is 18, what rule fires? (d) The line improves and the new p̄ = 0.04 — recompute the limits and discuss whether to switch from p-chart to np-chart. (e) Explain why a rational subgroup of 100 boards is taken from a single shift and not spread across three shifts.`,
  sections: {
    learning_objectives: `- Distinguish common-cause from special-cause variation; explain why tampering with a stable process inflates variance (Deming funnel experiment).
- Select the correct Shewhart chart from the data type and subgroup size: variable (X̄-R for n=2-10, X̄-s for n≥10, I-MR for n=1); attribute (p, np for defective proportions/counts; c, u for defects).
- Construct an X̄-R chart from k subgroups: compute X̄̄, R̄, σ̂_within, A2·R̄, D4·R̄ limits; interpret the in-control vs out-of-control pattern.
- Construct a p-chart: compute p̄, UCL_p, LCL_p using the binomial standard error √(p̄(1−p̄)/n̄).
- Apply the Western Electric zone rules (1-4) and the Nelson rules; compute 2σ and 1σ zone lines and detect a 1.5σ mean shift via rule 2.
- Design rational subgroups: maximize within-subgroup common cause, expose between-subgroup special cause; defend the subgroup size, frequency, and subgrouping logic.
- Compute Cp from σ̂_within = R̄/d2 and interpret the link between SPC stability and process capability.
- Build the reaction plan triggered by every out-of-control signal; explain how the Andon escalates the response (tier huddles).`,
    prerequisites: `- Measure-phase MSA (Gage R&R %R&R < 10%): the chart is only as good as the gage.
- Measure-phase capability analysis (Cp, Cpk, Pp, Ppk) and DPMO/sigma-level conversion.
- The normal distribution, the binomial, and the Poisson — the three statistical models behind X̄-R, p/np, and c/u charts.
- DMAIC Improve — the validated solution that the Control phase must sustain.
- Conceptual familiarity with run rules and the false-alarm/trade-off (ARL₀ vs ARL₁).`,
    terminology: `- Common cause variation — inherent, random, system-level noise; removable only by redesigning the system.
- Special cause variation — assignable, non-random signal of a process change; investigate, contain, root-cause, fix.
- Shewhart control chart — time-ordered plot of a sample statistic with 3σ control limits.
- X̄ chart, R chart — variable charts for subgroup means and ranges (n=2-10).
- X̄-s chart — variable chart for n≥10 (s replaces R for efficiency).
- I-MR chart — individuals & moving-range chart for n=1 (low-volume, destructive test, batch chemistry).
- p chart, np chart — attribute charts for proportion / count of nonconforming units.
- c chart, u chart — attribute charts for count / rate of defects (Poisson model).
- Rational subgroup — a subgroup designed so within-subgroup variation captures common cause and between-subgroup variation exposes special cause.
- Western Electric (WECO) rules / Nelson rules — pattern-based run rules that augment Shewhart's single 3σ rule.
- ARL — average run length to a signal; ARL₀ (in-control, false alarm), ARL₁ (out-of-control, detection).
- Reaction plan — the documented steps taken when a chart signals: stop, contain, investigate, fix, restart.
- Tampering (Deming funnel experiment) — adjusting a process in response to common-cause points; doubles variance.`,
    detailed_explanation: `The Shewhart chart is a hypothesis test run repeatedly on the running process. Each plotted point asks: "Is this subgroup's statistic consistent with the hypothesis that the process is stable at the historical centerline and historical variance?" The 3σ limits are the critical values; a point outside rejects the stability hypothesis at α ≈ 0.0027 (two-sided). The choice of 3σ (rather than 2σ or 6σ) is a deliberate economic balance: 3σ gives a low false-alarm rate (ARL₀ ≈ 370 subgroups between false alarms) while still detecting a 3σ shift in one point (ARL₁ ≈ 1) and a 2σ shift within ~6 subgroups (using rule 2).

The chart selection tree begins with the data type. Continuous (variable) data — anything measured on a continuous scale (length, mass, time, temperature, voltage) — uses variable charts. For n=2-10 the X̄-R pair is standard: the X̄ chart monitors the process mean, the R chart monitors within-subgroup dispersion, and R feeds the X̄ limits via A2·R̄. For n≥10 the s chart replaces R (s is statistically more efficient at larger n) using A3·s̄. For n=1 (low-volume production, destructive tests, batch chemistry, financial data) the I-MR chart is the only choice — the individuals chart plots the single reading, the moving range (|x_i − x_{i-1}|) estimates short-term dispersion.

Attribute data uses one of four charts depending on whether the unit is classified as conforming/nonconforming (defective, p/np) or whether defects are counted (c/u). The p chart plots the proportion defective — the centerline is p̄ and the standard error is √(p̄(1−p̄)/n̄); the np chart plots the count and is preferred when n is constant. The c chart plots the count of defects in a constant inspection area; the u chart plots the rate (defects per unit) when the inspection area varies. All four attribute charts rest on a probability model — the binomial for p/np, the Poisson for c/u — and the ±3σ limits come from that model's standard error.

Rational subgrouping is the design backbone of any Shewhart chart. The subgroup is constructed so that within-subgroup variation captures only common cause (the noise floor) — units within a subgroup are produced under essentially the same conditions, in the same short time window, by the same operator, on the same equipment, from the same material lot. Between-subgroup variation then exposes any special cause — a new operator, a different material lot, a drift in temperature, a tool wear step. Mis-subgrouping destroys the chart: pooling across two machines in one subgroup inflates within-subgroup variance, suppresses the X̄ limits, and hides between-machine shifts; subgroups taken too far apart in time blur drifts; subgroups taken too close together miss the slow drifts entirely.

The Western Electric zone rules convert the chart from a spike-detector into a small-shift detector. The chart is divided by 1σ, 2σ, and 3σ zone lines on each side of the centerline (giving 6 zones); rules 1-4 (above) detect a 3σ spike, a 1.5σ step, a 1σ drift, and a small sustained mean shift respectively. Adding rules 5-8 (Nelson: 6-point trend, 14-point alternating, 15-point within 1σ, 8-point beyond 2σ both sides) detects trends, oscillations, reduced variability, and mixture/stratification. Each rule has its own ARL profile; the trade-off is sensitivity (short ARL₁) vs false-alarm inflation (short ARL₀). The control plan should specify which rules are active and the reaction plan for each.`,
    core_principles: `- Common cause vs special cause is the foundational distinction; the two call for different responses.
- Tampering with a stable process inflates variance — never react to common-cause points as if they were special.
- The 3σ limit balances false-alarm cost (ARL₀ ≈ 370) against detection speed (ARL₁ ≈ 1 for a 3σ shift).
- Rational subgroups capture common cause within and expose special cause between.
- Chart selection follows the data type — variable (X̄-R, X̄-s, I-MR), attribute defective (p, np), attribute defects (c, u).
- A chart in control is not the same as a chart capable — stability ≠ Cp ≥ 1; lock in control first, then close the capability gap.
- Run rules extend the chart's reach to small sustained shifts that the single 3σ rule misses; trade sensitivity against false alarms.
- Every out-of-control signal triggers a documented reaction plan (stop, contain, root-cause, fix, restart); the Andon escalates.
- Control limits are estimated from the process history — they are NOT engineering specifications; never confuse UCL/LCL with USL/LSL.
- The chart is a sensor; the control plan is the actuator — the chart without a reaction plan is decoration.`,
    components: [
      `Shewhart chart — the chart body (centerline, UCL, LCL, plotted points, zone lines).`,
      `Subgroup statistic — X̄, R, s, p, np, c, or u depending on data type.`,
      `Control limits — ±3σ of the plotted statistic from the centerline (UCL/LCL); 1σ and 2σ zone lines for run rules.`,
      `Rational subgroup — the design unit; n=2-10 (variables), n=20-100+ (attributes); one subgroup per time slice.`,
      `Sampling frequency — hourly, per shift, per lot, per batch; chosen to catch the expected special-cause timescale.`,
      `Run-rule set — WECO rules 1-4 (or Nelson 1-8) active per the control plan.`,
      `Reaction plan — the written steps triggered by an out-of-control signal.`,
      `Andon escalation — tier-1 operator, tier-2 team leader, tier-3 process engineer.`,
      `Control plan link — the chart's row in the control plan document (Lesson 2).`,
      `Audit trail — the chart log, the OCAP (out-of-control action plan) forms, and the corrective-action records.`,
    ].join("\n"),
    process: [
      `1. Verify the gage is adequate (%R&R < 10%) — SPC on a gage that is part of the noise floor is invalid.`,
      `2. Select the chart by data type and subgroup size: variable (X̄-R / X̄-s / I-MR), attribute defective (p / np), attribute defects (c / u).`,
      `3. Design the rational subgroup: same operator, same machine, same material lot, same short time window — within-subgroup captures common cause only.`,
      `4. Pick sampling frequency to catch the expected special-cause timescale (hourly for tool-wear drift, per-lot for material variation, per-batch for chemistry).`,
      `5. Collect k ≥ 25 subgroups of baseline data while the process is stable; the control limits are estimated from this baseline.`,
      `6. Compute the centerline (X̄̄, R̄, p̄, c̄) and the limits (A2·R̄, D4·R̄, 3·√(p̄(1−p̄)/n̄), 3·√c̄).`,
      `7. Compute the 1σ and 2σ zone lines for the active run rules.`,
      `8. Plot the baseline; confirm the process was in control (no rule fired). If a rule fired, investigate and re-baseline after the assignable cause is removed.`,
      `9. Set the chart live; every subgroup triggers the run-rule evaluation; any rule firing triggers the reaction plan + Andon escalation.`,
      `10. Periodically re-baseline the limits (monthly/quarterly) only after a deliberate, sustained process change — never auto-re-baseline on a rule firing.`,
      `11. At project hand-off, transfer the chart, the limits, the reaction plan, and the OCAP to the process owner; embed in the control plan.`,
    ].join("\n"),
    formula_calculation: `X̄ chart limits: UCL_X̄ = X̄̄ + A2·R̄ ; LCL_X̄ = X̄̄ − A2·R̄
  Variables: X̄̄ = grand mean of subgroup means (mm); A2 = Shewhart constant depending on n (A2=0.577 for n=5); R̄ = mean of subgroup ranges (mm).
  Units: same as the measurement (mm, kg, s, °C).
  Assumptions: subgroups are rational (within-subgroup common cause only); process is stable during baseline; n is fixed.
  Interpretation: UCL_X̄ is the upper 3σ limit on the X̄ statistic — a point beyond rejects stability at α≈0.0027.

R chart limits: UCL_R = D4·R̄ ; LCL_R = D3·R̄   (D3=0 for n≤6)
  Variables: D4 (D4=2.114 for n=5), D3 (D3=0 for n=5), R̄ (mean range).

Within-subgroup sigma: σ̂_within = R̄ / d2 (d2=2.326 for n=5) — used for Cp.
Potential capability: Cp = (USL − LSL) / (6·σ̂_within)

p chart limits: p̄ = Σ(npᵢ) / Σnᵢ ; UCL_p = p̄ + 3·√(p̄(1−p̄)/n̄) ; LCL_p = max(0, p̄ − 3·√(p̄(1−p̄)/n̄))
  Variables: npᵢ = defectives in subgroup i; nᵢ = inspected in subgroup i; n̄ = mean subgroup size; p̄ = pooled proportion defective.
  Units: dimensionless proportion; limits in proportion.
  Assumptions: binomial model (constant p per subgroup, independent trials); nᵢ ≥ 5·p̄/(1−p̄) for normality.
  Interpretation: a point above UCL_p signals a process producing more defectives than the historical baseline.

Zone lines for WECO rules: 1σ = ±(1/3)·A2·R̄ ; 2σ = ±(2/3)·A2·R̄ from centerline X̄̄.

Average Run Length: ARL₀ = 1/α where α = false-alarm probability of the active rule combination; ARL₁ = 1/(1−β) where β = miss probability for a given shift.`,
    worked_example: `X̄-R chart, 25 subgroups of n=5 on shaft OD = 10.000 ± 0.020 mm.

Baseline: X̄̄ = 10.000 mm, R̄ = 0.340 mm. Constants (n=5): A2=0.577, D3=0, D4=2.114, d2=2.326.

Step 1 — R chart limits:
  UCL_R = D4·R̄ = 2.114 × 0.340 = 0.719 mm.
  LCL_R = D3·R̄ = 0 × 0.340 = 0 mm.
  Centerline R̄ = 0.340 mm.

Step 2 — X̄ chart limits:
  UCL_X̄ = X̄̄ + A2·R̄ = 10.000 + 0.577 × 0.340 = 10.000 + 0.1962 = 10.196 mm.
  LCL_X̄ = X̄̄ − A2·R̄ = 10.000 − 0.1962 = 9.804 mm.
  Centerline X̄̄ = 10.000 mm.

Step 3 — Zone lines for WECO rules (X̄ chart):
  σ_X̄ = A2·R̄/3 = 0.1962/3 = 0.0654 mm.
  +2σ zone line = 10.000 + 0.131 = 10.131 mm (upper).
  +1σ zone line = 10.000 + 0.065 = 10.065 mm.
  −1σ zone line = 9.935 mm.
  −2σ zone line = 9.869 mm (lower).

Step 4 — σ̂_within and Cp:
  σ̂_within = R̄/d2 = 0.340/2.326 = 0.1462 mm.
  Cp = (USL − LSL)/(6·σ̂_within) = (10.020 − 9.980)/(6 × 0.1462) = 0.040/0.8772 = 0.046. (Incapable — follow-up Improve needed.)

Step 5 — Western Electric rule-2 detection:
  Hours 14, 15, 16 deliver X̄ = 10.142, 10.168, 10.121.
  Upper 2σ zone line = 10.131.
  Hour 14: 10.142 > 10.131 → beyond +2σ (above).
  Hour 15: 10.168 > 10.131 → beyond +2σ (above).
  Hour 16: 10.121 → between +1σ and +2σ.
  → 2 of 3 consecutive points beyond +2σ on the same side → WECO rule 2 fires.
  Estimated mean shift = ~1.5σ_X̄ ≈ 0.098 mm above target (a 1.5σ mean shift).

Step 6 — Reaction: stop the line; operator escalates via Andon tier-1 (team leader) then tier-2 (process engineer). OCAP step: inspect wheel-grit freshness (X4 from Define charter). Finding: wheel dressing overdue → corrective action = dress wheel + re-baseline. Restart; re-establish control.

p-chart companion example: 25 days, n=100 boards/day, 250 total solder-bridge defects. p̄ = 250/2500 = 0.100. UCL_p = 0.100 + 3·√(0.100·0.900/100) = 0.100 + 3·0.030 = 0.190; LCL_p = 0.100 − 0.090 = 0.010. Day 26 reports 16/100 = 0.16 → in control (below 0.190). Day 27 = 4/100 = 0.04 → in control. Day 28 = 18/100 = 0.18 → in control but rule-3 (4 of 5 beyond +1σ) likely firing if pattern persists.`,
    industrial_example: `Manufacturing — CNC grinding cell (shaft OD = 10.000 ± 0.020 mm). X̄-R chart, n=5 per hour. The chart locks the post-Improve sigma level; WECO rule 2 catches wheel-wear drift (X4 driver from the Define charter) before spec is violated; the Andon escalates operator→team-leader→process-engineer within 5 min.

Healthcare — Emergency Department wait-time (CTQ: door-to-provider time ≤ 2 h). I-MR chart on the daily mean (low-volume per-shift data; n=1) because ED volumes are not constant enough for X̄-R. Limits calculated from 30 stable days; rule 4 (8 consecutive above center) flags a small sustained mean-shift; the reaction plan triggers a tier-2 huddle to investigate staffing or registration process change.

Electronics — SMT solder-bridge defectives. p-chart with n=100 boards/day; limits p̄=0.10, UCL_p=0.19, LCL_p=0.01. A day reporting 16 defects (0.16) is in control; a day reporting 22 defects (0.22) signals an out-of-control spike — the reaction plan calls the SMT line engineer and quarantines the lot.

Container Terminal — crane move cycle-time. X̄-s chart, n=12 moves per vessel-hour (n≥10 → use s chart). The s chart catches variance shifts (a worn sheave, an intermittent PLC fault); the X̄ chart catches mean shifts (operator change, vessel-size mix).

Chemical — batch reactor yield. I-MR chart on per-batch yield (destructive final test → n=1). Reaction plan: rule 1 firing → quarantine batch, investigate raw material lot, polymerization temperature, and catalyst activity.`,
    case_study: `CASE_TYPE = SYNTHETIC. A medical-device manufacturer of IV-connector hubs (CTQ = peel force 4.0 ± 0.5 N) sustained a 4-month post-Improve Control period using an X̄-R chart, n=5 per lot, 25 lots/month. Baseline: X̄̄=4.00 N, R̄=0.340 N, Cp=0.99 (post-Improve sigma level ≈ 3.0). The control plan specified WECO rules 1-4 active with the reaction plan (stop, quarantine lot, call process engineer). Month 2: WECO rule 4 fired (8 consecutive lots above centerline) on the X̄ chart → investigation found a glue-lot change that nudged the mean up by 0.07 N (a 1σ_X̄ shift) — caught before any lot breached the 4.5 N spec. Corrective action: tighten glue-lot qualification (viscosity band); re-baseline. Month 4: rule 2 fired (2 of 3 beyond +2σ) on the R chart → a fixture-clamp pressure regulator had a slow leak (variance increase); replaced. Final: 12-month sustained Cp ≈ 1.0, 0 lots out-of-spec, 2 special-cause events caught and fixed — Control hand-off to plant quality with control plan, SOP, and training package.`,
    visual_explanation: `Picture two charts stacked. The top is the X̄ chart: a horizontal centerline at 10.000 mm, a +3σ line at 10.196, a −3σ line at 9.804, with lighter +1σ/+2σ and −1σ/−2σ zone lines forming 6 colored zones (green-amber-red on each side). Twenty-five dots drift around the centerline. At hours 14-15 two dots pierce the upper +2σ zone line; the chart's rule-2 highlighter flashes. The bottom is the R chart: centerline at 0.340, UCL at 0.719, LCL at 0; the dots drift between 0.18 and 0.42. Beside the charts, an Andon column shows three stacked lights — green (in control), amber (rule 4 active), red (rule 1/2/3 active) — currently amber, signaling the operator to escalate to the team leader. The control plan card on the right lists the reaction-plan steps with checkboxes.`,
    simulation_opportunity: `Simulator: X̄-R chart with adjustable mean (μ), within-subgroup sigma (σ_w), subgroup size (n), and a special-cause trigger (mean shift, variance shift, drift, cycle). Learner toggles WECO rules 1-4 on/off, sets k=25-100 subgroups, and watches ARL₀/ARL₁ update live. Challenge: detect a 1.5σ mean shift within 5 subgroups using only rule 1 vs rules 1-4 — measure the false-alarm cost (extra investigations) against the detection-speed gain. Bonus: mis-subgroup across two machines and watch the within-subgroup variance inflate, suppressing the X̄ limits and hiding the between-machine shift.`,
    common_mistakes: `- Confusing control limits (UCL/LCL, ±3σ of the statistic) with engineering spec limits (USL/LSL) — they are different numbers and answer different questions.
- Reacting to common-cause points as if they were special — Deming funnel-experiment tampering that doubles variance.
- Mis-subgrouping across two machines or two operators in one subgroup — inflates within-subgroup variance, hides between-subgroup shifts.
- Setting limits too tight (auto-re-baselining on every rule firing) — narrows limits until every point is "out," generating false alarms.
- Setting limits too wide (baseline includes out-of-control data) — widens limits until no signal can fire.
- Using a p-chart when n is small and p̄ is near 0 or 1 — the normal approximation fails; switch to I-MR or to a binomial exact-chart.
- Posting a chart with no reaction plan — the chart is decoration; the operator has no idea what to do when a rule fires.
- Adding WECO rules 1-8 blindly — the false-alarm rate climbs and the team learns to ignore the chart.
- Treating the chart as a QC gate (inspect, accept/reject) — the chart is a process-monitoring device, not a lot-acceptance tool.
- Forgetting to verify %R&R first — a chart on a noisy gage is just expensive noise.`,
    limitations: `- Shewhart 3σ limits are designed for a stable, normal (variable) or binomial (p) or Poisson (c) process; non-normal data needs a transform or a non-parametric chart.
- The X̄ chart is slow to detect small shifts (ARL₁ for a 1σ shift with rule 1 alone ≈ 44 subgroups); run rules trade detection speed against false alarms.
- Rational subgrouping depends on process knowledge — wrong subgrouping invalidates the limits silently.
- Attribute charts require large n (n·p̄ ≥ 5 and n·(1−p̄) ≥ 5) for the normal approximation; small-N attributes need exact limits.
- Control limits are estimated from k ≥ 25 baseline subgroups; small k yields unstable limits.
- The chart catches the change after it occurs — it is a detection device, not a prevention device (the latter is poka-yoke, Lesson 2).
- The chart needs the process to be in statistical control before the limits mean anything; an out-of-control baseline yields meaningless limits.
- Multivariate processes (e.g., a 3-axis CMM) need T² / Hotelling charts, not three univariate X̄ charts run in parallel.`,
    comparison: `X̄-R vs X̄-s: identical math for n=2-10; X̄-s is more efficient at n≥10 (s uses every deviation, R uses only the max−min). I-MR: the only choice for n=1 (low-volume, destructive, batch). p vs np: identical detection; np is convenient when n is constant. p vs c: p counts defective units (pass/fail); c counts defects (scratches, errors) — a unit can have many defects and still be conforming. WECO vs CUSUM vs EWMA: Shewhart+WECO catches large and moderate shifts; CUSUM and EWMA catch small sustained shifts faster (lower ARL₁ for σ-level shifts) but are harder to read and harder to train. Shewhart chart vs pre-control: pre-control (green/yellow/red zones based on spec) is simpler but statistically inferior; it is a stop-gap, not a sustainment tool. SPC chart vs capability plot: the chart asks "stable?"; capability asks "capable?" — both needed.`,
    practical_application: `1. Walk the process with the process owner; identify the CTQs and the data type.
2. Verify the gage (%R&R < 10%) — fix the gage first if it is the noise floor.
3. Design the rational subgroup: same operator/machine/material/short-window; pick n and frequency to match the expected special-cause timescale.
4. Collect k=25-30 baseline subgroups; compute X̄̄, R̄ (or p̄, c̄); set limits; verify the baseline is in control.
5. Compute 1σ/2σ zone lines for WECO rules; activate rules 1-4 (and 5-8 if small-shift detection is worth the false-alarm cost).
6. Write the reaction plan (stop, contain, investigate, fix, restart); embed in the control plan (Lesson 2); post the chart at the gemba.
7. Train the operator and the team leader on rule interpretation and the Andon escalation.
8. Audit weekly for the first month; re-baseline quarterly or after a deliberate process change.
9. At project hand-off, transfer chart + limits + reaction plan + audit cadence to the process owner; embed in the control plan document.`,
    decision_scenario: `You inherit a CNC line where the outgoing quality is good (0.4% rejects) but the X̄-R chart has been removed because "we are already at 6σ." The line is staffed by three operators on three shifts; raw bar stock is from two suppliers alternately. Decision: (a) Re-instate the chart — but with what subgroup design? (b) Subgrouping across two suppliers inflates within-subgroup variance — choose to subgroup per supplier (two charts) or fix the supplier mix. (c) Subgrouping across three shifts inflates within-subgroup variance if one subgroup spans shifts — pick one shift per subgroup and chart three charts. (d) Operator effect: post one chart per shift so operators see their own process. (e) Frequency: hourly for tool-wear drift. (f) Rules: WECO 1-4 + Nelson 5 (trend) for tool-wear. The right design is three X̄-R charts (one per shift), n=5 per hour, supplier-tagged, with WECO 1-4+5 — not one chart across three shifts and two suppliers.`,
    practice_questions: `Q1 (Recall): Name the two Shewhart causes of variation. (A: common cause and special cause; the first is system noise, the second is assignable.)
Q2 (Application): A CNC line has continuous OD data with n=5 per hour. Which chart? (A: X̄-R.)
Q3 (Calculation): X̄̄=10.000, R̄=0.340, n=5. Compute UCL_X̄, LCL_X̄, UCL_R, LCL_R. (A: 10.196, 9.804, 0.719, 0.)
Q4 (Analysis): Three consecutive X̄ points: 10.142, 10.168, 10.121 — given 2σ zone line at 10.131. Which WECO rule fires? (A: Rule 2 — 2 of 3 beyond 2σ same side.)
Q5 (Conceptual): Why is tampering with a stable process harmful? (A: It doubles variance — Deming funnel experiment.)
Q6 (Procedural): When do you switch from p-chart to np-chart? (A: When n is constant; np plots the count directly, simplifying arithmetic and operator reading.)`,
    certification_questions: `CSSBB-style: A Green Belt is monitoring the proportion of conforming catheter tips per shift. n=200 per shift, p̄=0.04. Compute UCL_p and LCL_p. (A: σ_p = √(0.04·0.96/200) = 0.0139; UCL_p = 0.04 + 3·0.0139 = 0.082; LCL_p = max(0, 0.04 − 0.042) = 0.)
CSSGB-style: Which chart is best for the number of bubbles per m² of glass (a constant area)? (A: c-chart — Poisson defects in a constant inspection area.)
CSSBB-style: An X̄-R chart has 25 subgroups, X̄̄=12.50, R̄=0.80, n=4 (A2=0.729, D3=0, D4=2.282). Compute UCL_X̄, LCL_X̄, UCL_R. (A: UCL_X̄ = 12.50 + 0.729·0.80 = 13.083; LCL_X̄ = 11.917; UCL_R = 2.282·0.80 = 1.826.)
CSSBB-style: The control chart shows 8 consecutive points above the centerline but all within ±1σ. Which rule fires? (A: WECO rule 4 — 8 consecutive one side of center.)
CSSBB-style: Tampering with a stable process inflates variance by approximately what factor (Deming funnel)? (A: ≈2× — variance doubles.)`,
    summary: `SPC is the online detection device that separates common cause (system noise — fixable only by redesign) from special cause (assignable signal — investigate and fix). The Shewhart chart plots a sample statistic against time with ±3σ limits; the chart is selected by data type and subgroup size — X̄-R (n=2-10), X̄-s (n≥10), I-MR (n=1), p/np (defective), c/u (defects). Rational subgroups capture common cause within and expose special cause between. The Western Electric zone rules extend the chart from a spike-detector to a small-shift detector. Every signal triggers a documented reaction plan; the Andon escalates. Stability ≠ capability — first lock in control, then close the capability gap. The chart is a sensor; the control plan (Lesson 2) is the actuator.`,
    key_takeaways: `- Shewhart's two-cause model: common cause (system noise) vs special cause (assignable signal) — different responses.
- 3σ limits balance false-alarm cost (ARL₀≈370) against detection speed (ARL₁≈1 for a 3σ shift).
- Variable data: X̄-R (n=2-10), X̄-s (n≥10), I-MR (n=1); attribute: p/np (defective), c/u (defects).
- Rational subgroups maximize within-subgroup common cause, expose between-subgroup special cause.
- WECO rules 1-4 detect 3σ spikes, 1.5σ steps, 1σ drifts, and small sustained mean shifts; Nelson 5-8 add trends, oscillations, mixtures.
- Stability ≠ capability — control limits (UCL/LCL) ≠ spec limits (USL/LSL).
- Every signal triggers a documented reaction plan; the Andon escalates operator → team-leader → process-engineer.
- Never tamper with a stable process — Deming's funnel experiment shows variance doubles.
- The chart is a sensor; the control plan is the actuator.`,
    references: `- ASQ Six Sigma Black Belt Body of Knowledge — Control phase.
- ASQ Six Sigma Green Belt Body of Knowledge — Control phase.
- Montgomery (2013), Statistical Quality Control, Ch. 6-8, 10 (SPC theory, variable & attribute charts, capability).
- Breyfogle (2003), Implementing Six Sigma, Ch. 10, 38-39, 43 (control plan, SPC selection, chart interpretation, hand-off).
- Liker (2004), The Toyota Way, Principle 5 (jidoka/Andon), Principle 6 (standard work).
- Imai (1986), Kaizen, Part I & II (Kaizen umbrella, PDCA, SDCA, the Gemba).`,
  },
  knowledgeObject: {
    title: "Statistical Process Control (SPC) — Shewhart Charts, Run Rules, Rational Subgroups",
    domain: "Control",
    competency: "Statistical Process Control (SPC)",
    topic: "DMAIC Control — Online Variation Detection",
    concept: "Common vs special cause; variable and attribute Shewhart charts; Western Electric run rules; rational subgrouping",
    body: {
      definitions: [
        "Common cause variation: inherent, random, system-level noise; removable only by redesigning the process (an Improve-level change).",
        "Special cause variation: assignable, non-random signal of a process change; investigate, contain, root-cause, fix.",
        "Shewhart control chart: time-ordered plot of a sample statistic with centerline, UCL, and LCL set at ±3σ of the plotted statistic.",
        "X̄ chart: variable chart for subgroup means (n=2-10) with limits X̄̄ ± A2·R̄.",
        "R chart: variable chart for subgroup ranges with UCL_R = D4·R̄.",
        "X̄-s chart: variable chart for n≥10; s replaces R for statistical efficiency.",
        "I-MR chart: individuals & moving-range chart for n=1 (low-volume, destructive, batch chemistry).",
        "p chart: attribute chart for proportion defective; limits p̄ ± 3·√(p̄(1−p̄)/n̄).",
        "np chart: attribute chart for count of defectives (constant n).",
        "c chart: attribute chart for count of defects in a constant inspection area (Poisson model); UCL = c̄ + 3·√c̄.",
        "u chart: attribute chart for rate of defects per unit (variable area).",
        "Rational subgroup: a subgroup designed so within-subgroup variation captures only common cause and between-subgroup variation exposes special cause.",
        "Western Electric (WECO) rules: pattern rules 1-4 that augment Shewhart's 3σ rule to detect small sustained shifts.",
        "Nelson rules: extended run rules 1-8 (adds trend, oscillation, mixture, stratification, reduced variability).",
        "ARL: average run length to a signal; ARL₀ (false-alarm rate), ARL₁ (detection speed).",
        "Reaction plan (OCAP): the documented steps triggered by an out-of-control signal — stop, contain, investigate, fix, restart.",
        "Tampering (Deming funnel): adjusting a stable process in response to common-cause points; doubles variance.",
        "Andon: the visual + audible escalation system (green/amber/red light) that calls for help when a chart signals.",
      ],
      principles: [
        "Common cause vs special cause is the foundational distinction; the two call for different responses.",
        "Tampering with a stable process inflates variance — never react to common-cause points as if they were special (Deming funnel).",
        "The 3σ limit balances false-alarm cost (ARL₀≈370) against detection speed (ARL₁≈1 for a 3σ shift).",
        "Rational subgroups capture common cause within and expose special cause between — wrong subgrouping invalidates the chart.",
        "Chart selection follows the data type: variable (X̄-R, X̄-s, I-MR); attribute defective (p, np); attribute defects (c, u).",
        "A chart in control is not the same as a chart capable — stability ≠ Cp ≥ 1.",
        "Run rules extend the chart's reach to small sustained shifts; trade sensitivity against false alarms.",
        "Every out-of-control signal triggers a documented reaction plan; the Andon escalates the response.",
        "Control limits (UCL/LCL) are NOT engineering specifications (USL/LSL) — never confuse the two.",
        "The chart is a sensor; the control plan (Lesson 2) is the actuator — a chart without a reaction plan is decoration.",
      ],
      components: [
        "Shewhart chart body (centerline, UCL, LCL, plotted points, zone lines).",
        "Subgroup statistic (X̄, R, s, p, np, c, u — data-type dependent).",
        "Control limits at ±3σ of the plotted statistic; 1σ and 2σ zone lines for run rules.",
        "Rational subgroup design (n, frequency, within-subgroup homogeneity).",
        "Run-rule set (WECO 1-4 or Nelson 1-8).",
        "Reaction plan (OCAP) — stop, contain, investigate, fix, restart.",
        "Andon escalation — tier-1 operator, tier-2 team leader, tier-3 process engineer.",
        "Control-plan link — the chart's row in the control plan document.",
        "Audit trail — chart log, OCAP forms, corrective-action records.",
      ],
      mechanism: [
        "SPC lifecycle: select chart → verify gage (%R&R<10%) → design rational subgroup → baseline k≥25 subgroups → compute limits + zone lines → verify baseline in control → set live → every subgroup triggers run-rule evaluation → any rule firing triggers reaction plan + Andon → investigate and fix → re-baseline only after deliberate change.",
      ],
      process: [
        "1. Verify the gage is adequate (%R&R < 10%) — SPC on a noisy gage is invalid.",
        "2. Select chart by data type and subgroup size.",
        "3. Design the rational subgroup — same operator/machine/material/short-window.",
        "4. Pick sampling frequency to match the expected special-cause timescale.",
        "5. Collect k≥25 baseline subgroups; compute centerline and limits.",
        "6. Compute 1σ and 2σ zone lines for the active run rules.",
        "7. Plot baseline; confirm in control; re-baseline if a rule fired.",
        "8. Set live; every subgroup triggers rule evaluation; any firing triggers reaction plan + Andon.",
        "9. Periodically re-baseline after a deliberate process change (never auto-re-baseline on a rule firing).",
        "10. At hand-off, transfer chart + limits + reaction plan to the process owner; embed in the control plan.",
      ],
      formulas: [
        "UCL_X̄ = X̄̄ + A2·R̄ ; LCL_X̄ = X̄̄ − A2·R̄ (A2 = 0.577 for n=5).",
        "UCL_R = D4·R̄ ; LCL_R = D3·R̄ (D4 = 2.114, D3 = 0 for n=5).",
        "σ̂_within = R̄ / d2 (d2 = 2.326 for n=5); Cp = (USL − LSL)/(6·σ̂_within).",
        "p̄ = Σ(npᵢ)/Σnᵢ ; UCL_p = p̄ + 3·√(p̄(1−p̄)/n̄) ; LCL_p = max(0, p̄ − 3·√(p̄(1−p̄)/n̄).",
        "np chart: Center = n·p̄ ; UCL = n·p̄ + 3·√(n·p̄(1−p̄)).",
        "c chart: Center = c̄ ; UCL = c̄ + 3·√c̄ ; LCL = max(0, c̄ − 3·√c̄).",
        "u chart: ū = Σc/Σn ; UCL = ū + 3·√(ū/n̄).",
        "WECO rule 1: 1 pt beyond 3σ; rule 2: 2 of 3 beyond 2σ same side; rule 3: 4 of 5 beyond 1σ same side; rule 4: 8 consecutive one side of center.",
        "ARL₀ = 1/α (α = false-alarm probability); ARL₁ = 1/(1−β) for a given shift.",
      ],
      metrics: [
        "ARL₀ (in-control false-alarm rate) and ARL₁ (out-of-control detection speed).",
        "Cp / Cpk (potential / actual capability) from σ̂_within = R̄/d2.",
        "Number of out-of-control signals per quarter (special-cause frequency).",
        "Time-to-detect (subgroups from shift onset to rule firing).",
        "Time-to-resolve (hours from Andon to corrective-action close-out).",
        "Reaction-plan execution rate (% of signals where the OCAP was followed).",
        "Operator chart-reading competency rate (audit score).",
      ],
      examples: [
        "X̄-R chart, n=5: X̄̄=10.000, R̄=0.340 → UCL_X̄=10.196, LCL_X̄=9.804, UCL_R=0.719.",
        "p chart, n=100, p̄=0.10 → UCL_p=0.190, LCL_p=0.010.",
        "WECO rule 2: X̄ points 10.142, 10.168, 10.121 with +2σ zone at 10.131 → 2 of 3 beyond 2σ → fires.",
        "Tampering demo (Deming funnel): adjusting a stable process doubles variance.",
        "Mis-subgrouping across two machines inflates within-subgroup variance, suppresses limits, hides between-machine shift.",
      ],
      industrial_examples: [
        "Manufacturing — CNC grinding cell (shaft OD 10.000 ± 0.020 mm), X̄-R chart, n=5 per hour; WECO rule 2 catches wheel-wear drift.",
        "Healthcare — ED door-to-provider time, I-MR chart on daily mean (low-volume, n=1); rule 4 catches sustained mean shift.",
        "Electronics — SMT solder-bridge defectives, p-chart n=100/day, p̄=0.10, UCL_p=0.19; day with 22 defects signals.",
        "Container Terminal — crane move cycle-time, X̄-s chart, n=12 per vessel-hour; s chart catches variance shift.",
        "Chemical — batch reactor yield, I-MR chart (destructive final test, n=1); rule 1 firing quarantines batch.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Medical-device IV-connector hub (peel force 4.0 ± 0.5 N), X̄-R n=5 per lot, Cp≈1.0. Month 2: WECO rule 4 fired (8 lots above center) → glue-lot change caught before spec breach. Month 4: rule 2 on R chart → fixture-clamp regulator leak. 12-month sustained 0 out-of-spec, 2 special-cause events caught and fixed — Control hand-off to plant quality with control plan + SOP + training package.",
      ],
      common_errors: [
        "Confusing control limits (UCL/LCL) with spec limits (USL/LSL) — different numbers, different questions.",
        "Tampering with a stable process (Deming funnel) — doubles variance.",
        "Mis-subgrouping across machines/operators in one subgroup — inflates within-subgroup variance, hides shifts.",
        "Auto-re-baselining on every rule firing — narrows limits until every point is out.",
        "Using p-chart when n is small and p̄ near 0 or 1 — normal approximation fails.",
        "Posting a chart with no reaction plan — operator has no idea what to do when a rule fires.",
        "Activating WECO rules 1-8 blindly — false-alarm rate climbs, team learns to ignore the chart.",
        "Treating the chart as a lot-acceptance gate — it is a process-monitoring device.",
        "Forgetting to verify %R&R first — chart on a noisy gage is noise.",
      ],
      limitations: [
        "Shewhart limits assume a stable, normal (variable) or binomial (p) or Poisson (c) process; non-normal needs transform or non-parametric chart.",
        "X̄ chart is slow for small shifts (ARL₁ ≈ 44 for a 1σ shift with rule 1 alone).",
        "Rational subgrouping depends on process knowledge — wrong subgrouping silently invalidates limits.",
        "Attribute charts require n·p̄ ≥ 5 and n·(1−p̄) ≥ 5 for the normal approximation.",
        "Control limits need k ≥ 25 baseline subgroups; small k yields unstable limits.",
        "The chart catches the change after it occurs — detection, not prevention (the latter is poka-yoke, Lesson 2).",
        "Multivariate processes need T² / Hotelling charts, not parallel univariate charts.",
      ],
      best_practices: [
        "Walk the process with the owner; identify CTQs and data type before selecting the chart.",
        "Verify the gage (%R&R < 10%) first — fix the gage before posting the chart.",
        "Design the rational subgroup — same operator/machine/material/short-window; pick n and frequency for the expected shift timescale.",
        "Collect k=25-30 baseline subgroups; verify in control; set limits and zone lines.",
        "Activate WECO rules 1-4 (add Nelson 5-8 if small-shift detection is worth the false-alarm cost).",
        "Write the reaction plan; embed in the control plan; post the chart at the gemba; train the operator and team leader.",
        "Audit weekly for the first month; re-baseline quarterly or after a deliberate change.",
        "At hand-off, transfer chart + limits + reaction plan + audit cadence to the process owner.",
      ],
      related_concepts: [
        "Control Plans & Standardization (Lesson 2) — the control plan is the actuator that operationalizes the chart's signal.",
        "Continuous Improvement & Visual Management (Lesson 3) — PDCA/SDCA, Kaizen, 5S, Andon, tier huddles that sustain the chart.",
        "Measure phase — Gage R&R, Cp/Cpk, DPMO/sigma-level baselining (the chart's pre-conditions).",
        "Analyze phase — run rules mimic hypothesis tests applied repeatedly; ANOVA/regression inform rational subgroup design.",
        "Improve phase — DOE validates the optimal X settings that the Control chart then monitors.",
      ],
      prerequisites: [
        "Measure-phase MSA (Gage R&R %R&R < 10%) — the chart is only as good as the gage.",
        "Measure-phase capability (Cp, Cpk, Pp, Ppk) and DPMO/sigma-level conversion.",
        "The normal, binomial, and Poisson distributions — the three probability models behind the chart families.",
        "DMAIC Improve — the validated solution the Control chart must sustain.",
        "Conceptual familiarity with run rules and the false-alarm trade-off (ARL₀ vs ARL₁).",
      ],
      references: [
        "ASQ Six Sigma Black Belt Body of Knowledge — Control phase.",
        "ASQ Six Sigma Green Belt Body of Knowledge — Control phase.",
        "Montgomery (2013), Statistical Quality Control, Ch. 6-8, 10.",
        "Breyfogle (2003), Implementing Six Sigma, Ch. 10, 38-39, 43.",
        "Liker (2004), The Toyota Way, Principles 5-6.",
        "Imai (1986), Kaizen, Parts I & II.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Statistical Process Control (SPC)",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which of the following BEST distinguishes common-cause from special-cause variation?",
      whyCorrect:
        "Common-cause variation is the inherent, random, system-level noise present in any stable process — attributable to the design of equipment, materials, and the way the process is operated. It can be removed only by redesigning the system (an Improve-level change). Special-cause variation is the assignable, non-random, statistically detectable signal of a process change (a shift, drift, cycle, or stratification) that must be investigated, root-caused, and either eliminated (if adverse) or institutionalized (if beneficial). The two call for different responses — the distinction is Shewhart's foundational contribution (1924).",
      whyOthersWrong: [
        "Option A ('Common cause is large variation; special cause is small variation') — confuses magnitude with cause. A small but persistent 1σ mean shift is special cause; large random noise is common cause. Size does not determine the category.",
        "Option B ('Common cause is operator error; special cause is equipment failure') — both operator error and equipment failure are special causes. Common cause is the system-level noise from the design of the process, not assignable to a single factor.",
        "Option D ('Common cause is random system noise; special cause is process tampering') — close, but tampering is the response to common cause that creates NEW special cause; the special cause is the resulting shift, not the tampering itself.",
      ],
      explanation:
        "Common cause = system noise (random, inherent); special cause = assignable signal (non-random, detectable). Tampering is reacting to common cause as if it were special — it creates new special cause (Deming funnel).",
      options: [
        { text: "Common cause is large variation; special cause is small variation", isCorrect: false },
        { text: "Common cause is operator error; special cause is equipment failure", isCorrect: false },
        { text: "Common cause is inherent random system noise; special cause is an assignable non-random signal of a process change", isCorrect: true },
        { text: "Common cause is random system noise; special cause is the act of tampering with the process", isCorrect: false },
      ],
    },
    {
      competencyName: "Statistical Process Control (SPC)",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Manufacturing",
      stem: "An X̄-R chart on shaft OD has 25 subgroups of n=5. X̄̄ = 10.000 mm, R̄ = 0.340 mm. Constants (n=5): A2 = 0.577, D3 = 0, D4 = 2.114, d2 = 2.326. Compute UCL_X̄, LCL_X̄, UCL_R, and the within-subgroup standard deviation σ̂_within.",
      whyCorrect:
        "UCL_X̄ = X̄̄ + A2·R̄ = 10.000 + 0.577 × 0.340 = 10.000 + 0.1962 = 10.196 mm. LCL_X̄ = X̄̄ − A2·R̄ = 10.000 − 0.1962 = 9.804 mm. UCL_R = D4·R̄ = 2.114 × 0.340 = 0.719 mm (LCL_R = D3·R̄ = 0). σ̂_within = R̄/d2 = 0.340/2.326 = 0.1462 mm. This is the canonical variable-chart calculation — A2·R̄ gives ±3σ of the X̄ statistic; d2 converts the mean range to within-subgroup sigma for capability.",
      whyOthersWrong: [
        "Option A (UCL_X̄ = 10.020, LCL_X̄ = 9.980, UCL_R = 0.340, σ̂_within = 0.340) — confuses spec limits (USL/LSL = 10.000 ± 0.020) with control limits; treats R̄ as σ̂_within (missing the d2 conversion).",
        "Option B (UCL_X̄ = 10.340, LCL_X̄ = 9.660, UCL_R = 0.719, σ̂_within = 0.340) — uses X̄̄ ± R̄ for the X̄ limits (forgot the A2 multiplier); also treats R̄ as σ̂_within.",
        "Option D (UCL_X̄ = 10.196, LCL_X̄ = 9.804, UCL_R = 0.719, σ̂_within = 0.340) — the X̄ and R limits are correct but σ̂_within is wrong (forgot d2; σ̂_within ≠ R̄, it is R̄/d2 = 0.146).",
      ],
      explanation:
        "UCL_X̄ = 10.000 + 0.577·0.340 = 10.196; LCL_X̄ = 9.804; UCL_R = 2.114·0.340 = 0.719; σ̂_within = 0.340/2.326 = 0.146 mm.",
      options: [
        { text: "UCL_X̄ = 10.020, LCL_X̄ = 9.980, UCL_R = 0.340, σ̂_within = 0.340", isCorrect: false },
        { text: "UCL_X̄ = 10.340, LCL_X̄ = 9.660, UCL_R = 0.719, σ̂_within = 0.340", isCorrect: false },
        { text: "UCL_X̄ = 10.196, LCL_X̄ = 9.804, UCL_R = 0.719, σ̂_within = 0.146 mm", isCorrect: true },
        { text: "UCL_X̄ = 10.196, LCL_X̄ = 9.804, UCL_R = 0.719, σ̂_within = 0.340 mm", isCorrect: false },
      ],
    },
    {
      competencyName: "Statistical Process Control (SPC)",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Analysis",
      skillType: "Procedural",
      scenario: "Electronics",
      stem: "On a p-chart for SMT solder-bridge defectives, 25 days of n=100 boards yield 250 total defects. The 2σ zone line on the p-chart sits at 0.16. Day 26 reports 16 defects, Day 27 reports 4, Day 28 reports 18. Which Western Electric rule (if any) fires, and what is the correct response?",
      whyCorrect:
        "Compute the plotted proportions: day 26 = 16/100 = 0.16 (at the 2σ zone line, not beyond), day 27 = 4/100 = 0.04 (well within), day 28 = 18/100 = 0.18 (above the +2σ zone line of 0.16). Only one of the last three points (day 28) is beyond +2σ — WECO rule 2 requires 2 of 3 consecutive points beyond 2σ on the same side, which is not met. None of rules 1-4 fires. The correct response is to log the data point, continue monitoring, and not trigger the reaction plan. Note that 0.18 is below UCL_p (= 0.190), so no out-of-control signal exists.",
      whyOthersWrong: [
        "Option A ('Rule 2 fires — stop the line and call the process engineer') — incorrect; rule 2 requires 2 of 3 beyond 2σ. Only day 28 (0.18) is beyond 0.16; day 26 (0.16) is at the line, not beyond; rule 2 does not fire.",
        "Option C ('Rule 1 fires — quarantine the lot') — incorrect; rule 1 requires a point beyond 3σ (UCL_p=0.19). 0.18 is below 0.19 — no rule-1 signal.",
        "Option D ('Rule 4 fires — 8 consecutive above center') — incorrect; rule 4 requires 8 consecutive points on one side of the centerline (p̄=0.10). Day 27 (0.04) is below the centerline, breaking any consecutive run.",
      ],
      explanation:
        "p̄ = 250/2500 = 0.10; σ_p = √(0.10·0.90/100) = 0.030; UCL_p = 0.10 + 0.090 = 0.190; +2σ zone line = 0.16. Day 28 (0.18) is below UCL_p and is the only point of the last three beyond +2σ — no rule fires. Continue monitoring.",
      options: [
        { text: "Rule 2 fires — stop the line and call the process engineer", isCorrect: false },
        { text: "No rule fires — log the data and continue monitoring (day 28 is below UCL_p=0.190)", isCorrect: true },
        { text: "Rule 1 fires — quarantine the lot", isCorrect: false },
        { text: "Rule 4 fires — 8 consecutive above center", isCorrect: false },
      ],
    },
    {
      competencyName: "Statistical Process Control (SPC)",
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Manufacturing",
      stem: "True or False: A CNC line is in statistical control on its X̄-R chart but Cp = 0.46 (well below 1.0). The correct Control-phase action is to widen the control limits until Cp ≥ 1.",
      whyCorrect:
        "FALSE. Widening the control limits does not change Cp — control limits (UCL/LCL) and capability (Cp) answer different questions. Control limits are estimated from the process history (the X̄ ± 3σ statistic); they describe stability. Cp = (USL − LSL)/(6·σ̂_within) is computed from the within-subgroup sigma (R̄/d2) and the engineering spec; it describes capability. A process can be stable (in control) yet incapable (Cp < 1) — the noise floor is wider than the spec allows. The correct Control-phase action is: (1) sustain the chart and the reaction plan to lock in the current sigma level; (2) launch a follow-up Improve project to reduce σ̂_within (redesign the fixture, change the wheel spec, add a poka-yoke) until Cp ≥ 1.33. Tampering with the control limits to 'make Cp look good' is statistically meaningless — it is the funnel experiment in a new disguise.",
      whyOthersWrong: [
        "Option TRUE — implies widening control limits improves capability; this conflates two different metrics. Control limits describe stability; capability describes the noise-vs-spec gap. Widening limits hides special-cause signals (every shift looks 'in control') without changing the underlying process variation.",
      ],
      explanation:
        "FALSE. Control limits (stability) and Cp (capability) are different metrics. A stable-but-incapable process needs a follow-up Improve project to reduce σ̂_within; widening limits is tampering that hides signals without improving capability.",
      options: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Control Plans & Standardization
// (Competency: "Control Plans & Standardization"; slug: c-control-plan-sop)
// ---------------------------------------------------------------------------

const LESSON_CONTROL_PLAN: RefLesson = {
  competencyName: "Control Plans & Standardization",
  slug: "c-control-plan-sop",
  title: "Control Plan, SOPs, Standard Work & Response Plan — Locking in the Gains",
  titleAr: "خطة الضبط وإجراءات التشغيل القياسية والعمل القياسي وخطة الاستجابة — تثبيت المكاسب",
  order: 2,
  durationMin: 36,
  references: SS_CONTROL_REFERENCE_TITLES,
  conceptIntroduction: `The control plan is the single most important document of the Control phase — the bridge between the validated Improve solution and the sustaining system. It is a one-page-per-CTQ matrix that captures, for every critical characteristic, the specification (target ± tolerance), the measurement method (gage + MSA status), the sample size and frequency, the control method (the chart or poka-yoke or 100%-inspection that monitors the characteristic), the reaction plan (the documented steps when the control method signals), and the responsible role. The control plan operationalizes the chart's signal (Lesson 1): when the X̄-R chart fires WECO rule 2, the operator does not guess — the operator follows the documented reaction-plan steps in the control-plan row for that CTQ. The control plan is the actuator that makes the chart's sensor actionable.

Three artifacts reinforce the control plan. (1) Standard Operating Procedures (SOPs) — the written, step-by-step, gage-referenced, picture-illustrated procedure that an operator follows to produce the output. The SOP codifies the Improve-phase settings (the validated wheel-feed rate, the fixture clamp, the cycle-time steps). (2) Standard work — the Toyota-Production-System concept that goes one step beyond the SOP: standard work is the documented best-known sequence of operator steps, with cycle-time elements (takt time, manual time, machine time, walking time) — the platform on which Kaizen runs (Liker Principle 6: standardized tasks are the foundation for continuous improvement). Without standard work, there is no baseline against which to measure improvement. (3) The response plan / OCAP (out-of-control action plan) — the decision-tree that an operator or team leader follows when a control-chart signal fires: stop the process, contain the affected units, investigate the most-likely assignable causes (in priority order), apply the documented fix, restart, log the event.

The FMEA-to-control-plan linkage is the design backbone. The Process FMEA (PFMEA), developed in the Analyze / Improve phase, lists every potential failure mode with its Severity (S) × Occurrence (O) × Detection (D) = RPN. The high-RPN failure modes are the candidates for control — for each, the recommended action column becomes a control-plan row: the characteristic is the failure-mode's effect; the control method is the action that reduces Occurrence (a poka-yoke) or improves Detection (a chart with a reaction plan) or reduces Severity (a design change). The control plan is therefore not invented from scratch — it is the operationalization of the PFMEA's high-RPN actions. Traceability runs PFMEA → control plan → SOP → training package → audit; an audit that finds a high-RPN failure mode with no control-plan row is a control-plan gap.

Standardization is the cultural artifact that makes the control plan stick. The control plan is a paper document until the operator is trained, the SOP is posted at the gemba, the chart is on the wall, the Andon is working, the tier huddles are running, and the audit cadence is in place. The hand-off to the process owner closes the DMAIC project: the owner signs the control plan, accepts the SOP package, accepts the training records, and commits to the audit cadence. The benefits tracker then runs for 6-12 months to confirm the projected COPQ recovery; any loss of gain triggers a re-engagement of the Belt for a sustaining-action project. Standardization — the SDCA half of PDCA/SDCA (Imai) — is what locks in the improvement so that the next PDCA cycle starts from a new, higher baseline.`,
  example: `A Green Belt on the CNC grinding cell (CTQ = shaft OD 10.000 ± 0.020 mm) is closing the Control phase. The Improve phase locked wheel-feed at 0.180 mm/s, fixture clamp at 22 kN, and wheel-dress every 12 subgroups. The Measure-phase PFMEA identified 7 failure modes; the 3 high-RPN modes drive the control plan.

**Control plan (extract — 3 CTQ rows).**
| Char | Spec | Gage / MSA | Sample | Control method | Reaction plan | Owner |
|---|---|---|---|---|---|---|
| Shaft OD | 10.000 ± 0.020 mm | CMM C-3, %R&R = 6.2% (pass) | n=5 / hour | X̄-R chart, WECO 1-4 | Stop, quarantine lot, call process engr (Andon tier-2), investigate X4 (wheel-grit) | Operator / Team Ldr |
| Surface finish Ra | ≤ 0.8 µm | Profilometer P-1, %R&R = 8.1% (pass) | n=1 / hour | I-MR chart, WECO 1-4 | Stop, call met-engr, check coolant flow + wheel-grit | Operator |
| Wheel-dress interval | Every 12 subgroups | PLC log, audit | 100% audit | Andon countdown + visual kanban | Auto-stop at subgroup 12, force dress, resume | PLC / Operator |

**SOP (extract — wheel-dress step).**
Step 4.7: At subgroup 12 (PLC Andon amber), pause grinder, engage dresser (lever F-22), dress wheel 3 cycles, verify dressing log entry, resume grinder. Reference picture: SOP-G07-04.7 p. 2 (annotated photo).

**Standard work (cycle-time breakdown for one shaft, target takt = 90 s).**
Manual load 15 s → grinder cycle 60 s → unload+gage 12 s → walk+log 3 s = 90 s total (matches takt).

**OCAP (decision tree for OD rule-2 signal).** Stop → quarantine last 5 shafts → check wheel-grit freshness (most likely, X4) → if grit < spec, dress wheel, re-baseline, resume; if grit OK, check fixture clamp pressure (X3, 22 kN target ± 1 kN) → if out, adjust, re-baseline; if both OK, escalate to process engineer (tier-3 Andon). Log OCAP form F-CP-01; corrective-action record CAR-C-3.

**FMEA-to-control-plan traceability.** PFMEA row R-04 (failure: wheel-grit dull → effect: OD drift → S=8, O=5, D=4, RPN=160) → control plan OD row (control method: X̄-R WECO 1-4; reaction: OCAP F-CP-01). PFMEA row R-07 (failure: coolant flow low → effect: Ra drift → S=6, O=4, D=6, RPN=144) → control plan Ra row (control method: I-MR; reaction: call met-engr). PFMEA row R-02 (failure: dresser interval missed → effect: OD drift → S=8, O=6, D=2, RPN=96) → control plan wheel-dress row (control method: Andon countdown + visual kanban, reaction: auto-stop).`,
  keyFormulas: `RPN (Risk Priority Number) = Severity × Occurrence × Detection   (1-10 each; RPN range 1-1000; high-RPN threshold commonly 100 or top 20%)
Control plan row anatomy (6 canonical fields):
  (1) Characteristic (Y, the CTQ from Define)
  (2) Specification (target ± tolerance, or LSL/USL, or attribute pass/fail)
  (3) Measurement method (gage, MSA %R&R status)
  (4) Sample size & frequency (n, per shift/hour/lot/batch)
  (5) Control method (chart + rules, or poka-yoke, or 100% inspection, or audit)
  (6) Reaction plan (OCAP — stop, contain, investigate, fix, restart)
Standard work cycle-time balance: Σ(manual + machine + walk) ≤ takt time
Takt time = available work time / customer demand (s/unit)
Process capability from MSA-validated data: Cp = (USL − LSL)/(6·σ̂_within), Cpk = min((USL−X̄̄)/(3σ̂_within), (X̄̄−LSL)/(3σ̂_within))
Training package coverage rate = (# operators trained / # operators assigned) × 100% (target 100%)
Control plan audit pass rate = (# rows audited conforming / # rows in plan) × 100% (target ≥ 95%)
Benefits tracker: realized COPQ recovery vs projected COPQ recovery (target ≥ 90% at 6 months, ≥ 100% at 12 months)`,
  exercise: `You are a Green Belt closing Control on a hospital's ED door-to-provider CTQ (target ≤ 2 h 0 min, current 1 h 55 min post-Improve). The PFMEA identified 3 high-RPN failure modes: (a) triage nurse unavailable at peak (RPN 168); (b) EHR timestamp missing on provider-first-contact (RPN 144); (c) resident hand-off delay (RPN 96). (1) Draft the 3-row control plan (characteristic, spec, gage, sample, control method, reaction, owner). (2) Draft the SOP for the triage step. (3) Compute the standard-work takt for an 8-hour ED with 200 patient arrivals/day. (4) Write the OCAP for triage-nurse-unavailable signal. (5) Specify the audit cadence (who, when, what is checked) and the benefits tracker timeline (6 / 12 months).`,
  sections: {
    learning_objectives: `- Author a one-page-per-CTQ control plan with the six canonical fields (characteristic, spec, measurement, sample, control method, reaction plan).
- Translate the PFMEA's high-RPN failure modes into control-plan rows — the failure mode → characteristic, recommended action → control method.
- Write a step-by-step SOP with gage references, annotated pictures, and revision control.
- Construct a standard-work sheet with cycle-time elements (manual, machine, walk) balanced to takt time.
- Write an OCAP (out-of-control action plan) decision tree that an operator or team leader can follow when a chart signals.
- Design the training package (operator certification, on-the-job training, sign-off) at 100% coverage before hand-off.
- Plan the audit cadence (daily gemba walk, weekly control-plan audit, monthly SOP review) and the benefits tracker (6- and 12-month COPQ recovery check).
- Execute the project hand-off to the process owner with the control plan, SOPs, training records, and benefits tracker signed.`,
    prerequisites: `- The Analyze-phase PFMEA (Severity × Occurrence × Detection = RPN) — the source of control-plan rows.
- The Improve-phase validated solution (the new X settings, poka-yokes, and SOPs the control plan must sustain).
- Measure-phase MSA (Gage R&R) — every control-plan row references the gage and its %R&R status.
- The DMAIC charter (COPQ baseline and target) — the benefits tracker measures recovery against the charter.
- Conceptual familiarity with the Toyota Production System (standard work, jidoka, Andon — Liker) and PDCA/SDCA (Imai).`,
    terminology: `- Control plan — the one-page-per-CTQ matrix that documents how each critical characteristic is monitored and reacted to.
- Standard Operating Procedure (SOP) — the written, step-by-step, gage-referenced, picture-illustrated operator procedure.
- Standard work — the TPS cycle-time-balanced operator sequence (manual + machine + walk ≤ takt); the platform for Kaizen.
- Takt time — available work time / customer demand (s/unit); the rhythm at which the customer consumes product.
- Reaction plan / OCAP (out-of-control action plan) — the decision tree triggered by a control-chart signal (stop, contain, investigate, fix, restart).
- PFMEA (Process Failure Mode and Effects Analysis) — the source of high-RPN failure modes that drive control-plan rows.
- RPN (Risk Priority Number) — Severity × Occurrence × Detection (1-10 each); the PFMEA prioritization metric.
- Poka-yoke (mistake-proofing) — a device or design that prevents or detects an error at the source (a control method).
- Andon — the visual + audible escalation system that calls for help (green/amber/red).
- Training package — operator certification materials, on-the-job training, sign-off records.
- Audit cadence — daily gemba walk, weekly control-plan audit, monthly SOP review, quarterly benefits check.
- Benefits tracker — the 6- and 12-month COPQ-recovery measurement confirming projected gains are realized.
- Project hand-off — the formal transfer of the control plan + SOPs + training + benefits tracker from the Belt to the process owner.
- SDCA (Standardize-Do-Check-Act) — Imai's stabilization cycle that locks in the current process before PDCA improvement.`,
    detailed_explanation: `The control plan is the contract that operationalizes the Improve-phase solution. Where Lesson 1's chart is a sensor (it detects the signal), the control plan is the actuator (it specifies what to do when the signal fires). The plan's anatomy is six canonical fields per row: (1) the characteristic (the CTQ from Define — the Y that the customer cares about); (2) the specification (target ± tolerance, or LSL/USL, or attribute pass/fail); (3) the measurement method (the gage, the calibration interval, the MSA %R&R status — every row references the gage's quality); (4) the sample size and frequency (n=5 per hour, or 100% audit, or one-per-lot); (5) the control method (the X̄-R chart with WECO rules, or a poka-yoke, or 100% inspection, or a daily audit); (6) the reaction plan (the OCAP — the documented decision tree the operator follows when the control method signals). A row without one of these fields is a control-plan gap.

The PFMEA is the upstream document that determines which rows belong in the plan. The Analyze-phase PFMEA lists every potential process failure mode; for each, the team assigned Severity (S, 1-10), Occurrence (O, 1-10), Detection (D, 1-10), and computed RPN = S·O·D. The high-RPN failure modes (common threshold: RPN ≥ 100, or the top 20% of RPNs) drive the control plan: each high-RPN failure mode's recommended action becomes a control-plan row. The characteristic is the failure mode's effect (the Y affected); the control method is the action that reduces Occurrence (a poka-yoke that prevents the failure) or improves Detection (a chart with a reaction plan that catches the failure sooner) or reduces Severity (a design change that makes the failure less harmful). Traceability runs PFMEA → control plan → SOP → training → audit — an audit that finds a high-RPN failure mode with no control-plan row is a control-plan gap.

SOPs and standard work are the operational documents the control plan references. The SOP is the written, step-by-step procedure an operator follows; it codifies the Improve-phase settings (the validated wheel-feed rate, the fixture clamp pressure, the cycle-time steps), references the gage, and is illustrated with annotated pictures. Standard work (TPS) goes one step further: it documents the best-known operator sequence with cycle-time elements (manual time, machine time, walking time) balanced to takt time (available work time / customer demand). Liker's Principle 6 — standardized tasks are the foundation for continuous improvement — captures the role: without standard work, there is no baseline against which to measure Kaizen; without a baseline, improvement is invisible. The SDCA cycle (Standardize-Do-Check-Act, Imai) is the stabilization loop that locks in the current standard; PDCA (Plan-Do-Check-Act) is the improvement loop that raises the standard — both run continuously.

The OCAP is the decision tree triggered by a control-chart signal. The first step is always stop and contain (quarantine the affected units so defective product does not reach the customer). The next steps are an ordered investigation of the most-likely assignable causes — drawn from the PFMEA's failure modes (the high-Occurrence, high-Detection-difficulty ones first). For each likely cause, the OCAP prescribes the documented fix (dress the wheel, adjust the clamp, call the met-engineer). If the first-level fixes do not restore control, the OCAP escalates to the next Andon tier (operator → team leader → process engineer). Every OCAP execution is logged (form CAR-C-3 or equivalent) and the corrective-action record feeds back into the PFMEA, updating Occurrence and Detection scores.

Training and audit close the loop. The control plan is paper until every operator is trained on the SOP and the OCAP; training is documented (operator sign-off, on-the-job-training records) at 100% coverage before hand-off. The audit cadence runs daily (gemba walk by the team leader), weekly (control-plan audit by the supervisor), monthly (SOP review by the process engineer), quarterly (benefits tracker by the finance reviewer), and annually (full re-baseline if material change). The benefits tracker runs for 6-12 months after hand-off — the projected COPQ recovery from the Define charter is the target; if realized recovery ≥ 90% at 6 months, the project is declared sustained; if < 90%, a sustaining-action project is launched.`,
    core_principles: `- The control plan is the bridge between the Improve solution and the sustaining system; the chart is the sensor, the plan is the actuator.
- Every control-plan row carries six canonical fields (characteristic, spec, gage, sample, control method, reaction).
- The PFMEA is the source of high-RPN failure modes that drive control-plan rows; traceability runs PFMEA → control plan → SOP → training → audit.
- Standard work (TPS) is the platform for Kaizen — without a standard, improvement is invisible.
- SDCA (stabilization) precedes PDCA (improvement) — lock in the current standard before improving it.
- The OCAP is the decision tree the operator follows when the chart signals; it always starts with stop-and-contain.
- Poka-yoke (mistake-proofing) is preferred over a chart — prevention beats detection.
- Training coverage is 100% before hand-off; the plan is paper until every operator is certified.
- The audit cadence (daily/weekly/monthly/quarterly) is the institutional memory that catches drift.
- The benefits tracker (6/12 months) confirms the projected COPQ recovery; < 90% triggers a sustaining-action project.`,
    components: [
      `Control plan matrix (one row per CTQ × 6 canonical fields).`,
      `Process FMEA (PFMEA) — the upstream source of high-RPN rows.`,
      `SOPs (one per operator task) — written, gage-referenced, picture-illustrated, revision-controlled.`,
      `Standard work sheet — operator sequence with cycle-time elements balanced to takt time.`,
      `OCAP decision tree — stop, contain, investigate, fix, restart, escalate.`,
      `Training package — certification materials, OJT records, sign-off.`,
      `Audit cadence — daily gemba walk, weekly control-plan audit, monthly SOP review, quarterly benefits.`,
      `Benefits tracker — 6- and 12-month COPQ-recovery measurement.`,
      `Andon system — green/amber/red escalation.`,
      `Hand-off package — control plan + SOPs + training + benefits tracker, signed by process owner.`,
    ].join("\n"),
    process: [
      `1. Pull the high-RPN failure modes from the Analyze-phase PFMEA (RPN ≥ 100 or top 20%).`,
      `2. For each high-RPN mode, draft a control-plan row: characteristic = failure effect; spec = CTQ tolerance; gage = MSA-validated; sample = n and frequency; control method = chart, poka-yoke, or audit; reaction = OCAP.`,
      `3. Write the SOP for every operator task the control plan references — step-by-step, gage-referenced, picture-illustrated.`,
      `4. Build the standard-work sheet — break each task into manual/machine/walk elements; balance to takt time.`,
      `5. Write the OCAP decision tree for each chart-signal trigger — stop, contain, investigate (ordered by PFMEA Occurrence), fix, escalate, restart, log.`,
      `6. Build the training package — classroom + OJT + sign-off; deliver to every operator; reach 100% coverage.`,
      `7. Install the Andon system (light + audible escalation; tier-1/2/3 response).`,
      `8. Set the audit cadence — daily gemba walk (team leader), weekly control-plan audit (supervisor), monthly SOP review (process engineer), quarterly benefits (finance).`,
      `9. Hand off the package to the process owner — control plan, SOPs, training records, benefits tracker; owner signs the hand-off form.`,
      `10. Run the benefits tracker for 6 and 12 months; if < 90% recovery, launch a sustaining-action project.`,
    ].join("\n"),
    formula_calculation: `RPN = Severity (S, 1-10) × Occurrence (O, 1-10) × Detection (D, 1-10); range 1-1000.
  Variables: S = impact of the failure on the customer (10 = catastrophic); O = likelihood the failure occurs (10 = almost certain); D = likelihood the failure escapes detection before the customer (10 = undetectable).
  Units: dimensionless priority score.
  Assumptions: S, O, D are rated on the 1-10 PFMEA scale by a cross-functional team.
  Interpretation: high RPN drives control-plan rows; threshold commonly RPN ≥ 100 or top 20%.

Control plan row (6 canonical fields): (1) characteristic (Y, the CTQ); (2) specification (target ± tolerance, LSL/USL, or pass/fail); (3) measurement method (gage + MSA %R&R status); (4) sample size & frequency (n and per-shift/hour/lot); (5) control method (chart + rules, poka-yoke, 100% inspection, or audit); (6) reaction plan (OCAP decision tree).

Takt time = available work time / customer demand (s/unit).
Standard work cycle: Σ(manual time + machine time + walk time) ≤ takt time.

Training coverage = (# operators trained / # operators assigned) × 100% (target 100%).
Control plan audit pass rate = (# rows conforming / # rows in plan) × 100% (target ≥ 95%).
Benefits tracker: realized COPQ recovery / projected COPQ recovery (target ≥ 90% at 6 months, ≥ 100% at 12 months).`,
    worked_example: `CNC grinding cell — Control phase close-out (CTQ: shaft OD = 10.000 ± 0.020 mm).

Step 1 — PFMEA pulls (extract):
  R-04: failure = wheel-grit dull → effect = OD drift → S=8, O=5, D=4 → RPN = 160.
  R-07: failure = coolant flow low → effect = Ra drift → S=6, O=4, D=6 → RPN = 144.
  R-02: failure = dresser interval missed → effect = OD drift → S=8, O=6, D=2 → RPN = 96.
  → All three RPN ≥ 90 → all three become control-plan rows.

Step 2 — Control plan matrix (extract, 3 rows; full plan has 7 rows):
  Row 1: Char = Shaft OD; Spec = 10.000 ± 0.020 mm; Gage = CMM C-3 (%R&R=6.2%, pass); Sample = n=5/hr; Control = X̄-R chart WECO 1-4; Reaction = OCAP F-CP-01 (investigate X4 wheel-grit first, X3 clamp pressure second, escalate tier-3); Owner = Operator / Team Ldr.
  Row 2: Char = Surface finish Ra; Spec = ≤ 0.8 µm; Gage = Profilometer P-1 (%R&R=8.1%, pass); Sample = n=1/hr; Control = I-MR chart WECO 1-4; Reaction = stop, call met-engr, check coolant flow (X6) + wheel-grit (X5); Owner = Operator.
  Row 3: Char = Wheel-dress interval; Spec = every 12 subgroups; Gage = PLC log (100% audit); Sample = 100% audit; Control = Andon countdown + visual kanban; Reaction = auto-stop at subgroup 12, force dress, resume; Owner = PLC / Operator.

Step 3 — SOP (extract, step 4.7 wheel-dress):
  'At subgroup 12 (PLC Andon amber), pause grinder G07, engage dresser lever F-22, dress wheel 3 cycles, verify dressing log entry, resume grinder.' Reference picture SOP-G07-04.7 p.2 (annotated photo of the lever position).

Step 4 — Standard work (one shaft, target takt = 90 s):
  Manual load = 15 s; grinder cycle = 60 s; unload+gage = 12 s; walk+log = 3 s; total = 90 s = takt. (Operator cycle balanced to takt — no overproduction, no waiting.)

Step 5 — OCAP decision tree (OD rule-2 signal):
  Stop grinder → quarantine last 5 shafts (contain) → step 1: check wheel-grit freshness (X4) [PFMEA R-04 highest Occurrence] → if grit < spec, dress wheel, re-baseline, resume; → step 2: if grit OK, check fixture clamp pressure (X3, 22 kN ± 1) → if out, adjust, re-baseline; → step 3: if both OK, escalate to process engineer (Andon tier-3). → Log OCAP form F-CP-01; corrective-action record CAR-C-3; update PFMEA Occurrence/Detection after the fix.

Step 6 — Training package: 8 operators × 4-hour classroom + 8-hour OJT + sign-off = 100% coverage at hand-off.

Step 7 — Audit cadence: daily gemba walk (team leader), weekly control-plan audit (supervisor), monthly SOP review (process engineer), quarterly benefits tracker (finance). Hand-off form signed by process owner.

Step 8 — Benefits tracker: Define-charter COPQ recovery target = $520k/year. 6-month check: realized $468k (90%); 12-month check: realized $530k (102% — above target, project declared sustained).`,
    industrial_example: `Manufacturing — CNC grinding cell (shaft OD = 10.000 ± 0.020 mm). 7-row control plan; X̄-R + I-MR + Andon countdown; OCAP F-CP-01 with tier-3 escalation; SOPs with annotated pictures; standard work balanced to 90-s takt; 8 operators trained; 6-month benefits tracker confirmed 90% COPQ recovery; project handed off to plant quality.

Healthcare — ED door-to-provider CTQ (target ≤ 2 h). Control plan: triage nurse staffing (control method = hourly audit + Andon), EHR timestamp completeness (control = daily IT audit), resident hand-off (control = standard work + SOP). Reaction plan: when hourly audit shows triage gap > 10 min, escalate to charge nurse. Benefits tracker: 6-month 85% COPQ recovery (slightly below 90% → sustaining-action project on peak-staffing model).

Electronics — SMT solder-bridge CTQ. Control plan: p-chart (n=100/day), paste-viscosity audit (twice/shift), reflow-profile verification (per setup). Reaction plan: lot quarantine + SMT engineer call. PFMEA R-12 (paste viscosity drift) drives the audit row; PFMEA R-09 (reflow peak temp) drives the profile row. Standard work: cycle-time balanced to takt = 38 s/board.

Chemical — batch reactor yield. Control plan: I-MR on batch yield, raw-material-lot qualification (per-lot poka-yoke — reject unqualified lot at receipt), catalyst-activity test (per-batch). Reaction plan: rule-1 firing → quarantine batch, investigate material lot, polymerization temperature, catalyst activity. Standard work: batch cycle = 4 h 20 min balanced to 4 h 30 min takt.`,
    case_study: `CASE_TYPE = SYNTHETIC. A Tier-1 automotive supplier of stamped control arms (CTQ: hole-position tolerance ± 0.15 mm) closed Control with a 12-row control plan derived from a 47-mode PFMEA (top 20% RPN ≥ 120). High-RPN rows: die-wear (RPN 192), stock-lubricant drift (RPN 168), press-tonnage deviation (RPN 144). Control methods: X̄-s chart (n=12 per shift) on hole position, Andon on press tonnage, kanban on lubricant replacement. OCAP: stop → quarantine last 50 parts → check die-wear (X1, ultrasonic thickness gage) → check lubricant (X2, viscosity) → check tonnage (X3, press PLC log) → escalate. Training: 14 operators × 4-hour classroom + 8-hour OJT + sign-off = 100% coverage. SOPs: 6 procedures, 23 annotated pictures, revision 1.0. Audit cadence: daily gemba walk, weekly control-plan audit, monthly SOP review. Benefits tracker: charter-projected COPQ recovery $1.8M/year; 6-month realized $1.55M (86% → sustaining-action launched on die-wear tracking); 12-month realized $1.95M (108% — project declared sustained, Control hand-off to plant quality).`,
    visual_explanation: `Picture a one-page matrix on the gemba wall: 7 rows × 6 columns (Char | Spec | Gage | Sample | Control method | Reaction). Each row's control-method column shows a mini-chart (X̄-R, I-MR, Andon countdown); the reaction column shows a flowchart (stop → contain → investigate → fix → restart). Above the matrix, an Andon column of three stacked lights (green/amber/red). Beside it, the SOP binder with annotated pictures; the standard-work sheet with cycle-time bars balanced to the takt line; the OCAP flowchart card the operator pulls when the chart signals. Below, the audit-cadence calendar (daily walk, weekly audit, monthly review, quarterly benefits) and the benefits-tracker line chart trending toward $520k/year.`,
    simulation_opportunity: `Simulator: a control-plan builder with a PFMEA import. Learner drags high-RPN rows from the PFMEA into the control-plan matrix; for each row, picks the control method (chart, poka-yoke, audit, 100% inspection) and writes the OCAP. The simulator runs the process for 30 days; out-of-control signals fire; if the OCAP is correct the process recovers, if not the defective units reach the customer (COPQ penalty). Score: COPQ recovery % vs charter target. Bonus: turn off the audit cadence and watch the SOP drift after 60 days (the institutional-memory loss the audit prevents).`,
    common_mistakes: `- Writing the control plan from scratch instead of pulling PFMEA rows — loses the failure-mode traceability.
- Omitting the reaction-plan column — the chart fires and the operator has no idea what to do.
- Using a chart where a poka-yoke is feasible — detection is inferior to prevention.
- Posting the SOP without annotated pictures — operators misread the steps.
- Skipping the training step — the plan is paper until the operator is certified.
- Forgetting the audit cadence — the SOP drifts after 60 days; the control plan becomes decoration.
- No benefits tracker — the team declares victory at hand-off and the gains quietly erode.
- Auto-re-baselining the chart when the control plan changes — the new baseline must be deliberate, not reactive.
- Writing the OCAP without the stop-and-contain first step — defective product reaches the customer.
- Putting more than one Accountable role per row — RACI violation, no one owns the reaction.`,
    limitations: `- The control plan is only as good as the PFMEA upstream — a weak PFMEA yields a weak plan.
- The SOP is a snapshot; process drift requires re-issue (revision control is essential).
- Poka-yoke design requires engineering effort and capital — not every failure mode is mistake-proofable.
- The audit cadence depends on supervisor bandwidth — under-resourced audits drift.
- The benefits tracker depends on the Finance reviewer's commitment — under-staffed finance delays the 6-month check.
- The training package assumes operator stability — high turnover invalidates 100% coverage within months.
- The control plan cannot prevent a redesign-induced failure — only the FMEA-on-the-new-design can.
- Multivariate or chemically-coupled CTQs need multivariate control plans (T² charts); the one-page matrix oversimplifies.`,
    comparison: `Control plan vs PFMEA: PFMEA is the upstream analysis (failure modes, RPN); control plan is the downstream actuator (monitoring + reaction). SOP vs standard work: SOP is the written procedure; standard work is the cycle-time-balanced operator sequence with takt. Chart vs poka-yoke: chart detects after the fact; poka-yoke prevents at the source — prefer poka-yoke. OCAP vs work instruction: OCAP is the decision tree for an out-of-control signal; work instruction is the normal-sequence procedure. Audit vs inspection: audit verifies the control plan is being followed; inspection verifies the product. Benefits tracker vs MSA: tracker measures COPQ recovery over time; MSA measures gage quality. SDCA vs PDCA: SDCA stabilizes the current standard; PDCA improves it — both run continuously (Imai). Hand-off vs project closure: hand-off transfers ownership; closure terminates the Belt's involvement (the tracker still runs).`,
    practical_application: `1. Open the Analyze-phase PFMEA; pull every row with RPN ≥ 100 (or top 20%).
2. For each, draft a control-plan row with the 6 canonical fields; verify gage %R&R < 10%.
3. Write the SOP for each operator task — step-by-step, gage-referenced, annotated pictures, revision 1.0.
4. Build the standard-work sheet — break each task into manual/machine/walk; balance to takt time.
5. Write the OCAP decision tree for each chart-signal trigger; the first step is always stop-and-contain.
6. Prefer poka-yoke over a chart wherever engineering feasible — prevention beats detection.
7. Build the training package; deliver classroom + OJT; achieve 100% operator sign-off.
8. Install the Andon system (light + audible); train tier-1/2/3 responders.
9. Set the audit cadence — daily gemba walk, weekly control-plan audit, monthly SOP review, quarterly benefits.
10. Hand off the package to the process owner; the owner signs the hand-off form.
11. Run the benefits tracker at 6 and 12 months; if < 90% recovery, launch a sustaining-action project.`,
    decision_scenario: `A Green Belt inherits a Control-phase project where the existing control plan has 22 rows — too many to audit weekly. The PFMEA has 6 high-RPN rows and 16 low-RPN rows. Decision: (a) Audit-cadence split — daily gemba walk on all 22, weekly deep audit on the 6 high-RPN rows, monthly spot-audit on the 16 low-RPN. (b) Convert 4 low-RPN rows from charts to poka-yokes (one-time engineering effort, eliminates weekly audit burden). (c) Convert 6 low-RPN rows from charts to 100% inspection where the gage is automatic (no operator burden). (d) Retain 6 high-RPN rows on charts with OCAPs. The decision reduces weekly audit from 22 to 6 rows while preserving coverage; the conversion to poka-yoke and automatic 100% inspection removes operator burden and the chart-reading competency gap.`,
    practice_questions: `Q1 (Recall): Name the six canonical fields of a control-plan row. (A: characteristic, spec, measurement method, sample size/frequency, control method, reaction plan.)
Q2 (Calculation): PFMEA row has S=8, O=5, D=4. Compute RPN. (A: 160.)
Q3 (Conceptual): Why is poka-yoke preferred over a chart? (A: prevention at the source beats detection after the fact.)
Q4 (Procedural): What is the first step of every OCAP? (A: stop and contain — quarantine affected units so defective product does not reach the customer.)
Q5 (Analysis): Takt = 90 s; manual load 15 s + grinder cycle 60 s + unload 12 s + walk 3 s. Is the operator cycle balanced? (A: yes, total 90 s = takt.)
Q6 (Definitional): What is SDCA and how does it relate to PDCA? (A: Standardize-Do-Check-Act stabilizes the current standard; PDCA raises it — both run continuously, per Imai.)`,
    certification_questions: `CSSBB-style: Which document is the upstream source of high-RPN rows in a control plan? (A: the Process FMEA.)
CSSGB-style: A control-plan row lists the characteristic, spec, and control method but omits the reaction plan. What is the consequence? (A: when the chart signals, the operator has no documented steps to follow — defective product may reach the customer.)
CSSBB-style: PFMEA row R-04 has S=8, O=5, D=4 → RPN=160. The recommended action is a poka-yoke. Which Occurrence score would the improved PFMEA show? (A: typically O=1, the poka-yoke prevents the failure → RPN drops from 160 to 8×1×4=32.)
CSSBB-style: Per Liker's Principle 6, what is the role of standard work in continuous improvement? (A: standardized tasks are the foundation for continuous improvement — without a standard there is no baseline against which to measure Kaizen.)
CSSGB-style: A process has takt = 90 s and standard work cycle = 105 s. What is the implication? (A: the operator cycle exceeds takt — the process cannot meet customer demand without rebalancing (reduce manual time, reduce machine time, or add a second operator).`,
    summary: `The control plan is the actuator that operationalizes the chart's signal — a one-page-per-CTQ matrix with six canonical fields (characteristic, spec, gage, sample, control method, reaction plan). The PFMEA is the upstream source; every high-RPN failure mode becomes a control-plan row. SOPs and standard work (TPS) codify the Improve-phase settings, balanced to takt time; the OCAP decision tree specifies stop-contain-investigate-fix-restart for every chart signal. Poka-yoke is preferred over a chart (prevention beats detection). Training coverage is 100% before hand-off; the audit cadence (daily/weekly/monthly/quarterly) preserves institutional memory; the benefits tracker (6/12 months) confirms COPQ recovery. SDCA stabilizes, PDCA improves — both run continuously (Imai). Hand-off to the process owner closes the DMAIC project.`,
    key_takeaways: `- Control plan = actuator; chart = sensor; the plan operationalizes the signal.
- Six canonical fields per row: characteristic, spec, gage, sample, control method, reaction plan.
- PFMEA → control plan → SOP → training → audit — full traceability.
- Standard work (TPS) is the platform for Kaizen; SDCA precedes PDCA (Imai).
- OCAP first step is always stop-and-contain — quarantine affected units.
- Poka-yoke (prevention) is preferred over a chart (detection).
- Training coverage = 100% before hand-off; the plan is paper without certified operators.
- Audit cadence (daily/weekly/monthly/quarterly) is the institutional memory; without it the SOP drifts.
- Benefits tracker (6/12 months) confirms COPQ recovery; < 90% triggers a sustaining-action project.
- Project hand-off to the process owner formally closes the DMAIC project.`,
    references: `- ASQ Six Sigma Black Belt Body of Knowledge — Control phase (control plan, SOP, training, project hand-off).
- ASQ Six Sigma Green Belt Body of Knowledge — Control phase (control plan basics, SOP, visual management, project closure).
- Montgomery (2013), Statistical Quality Control, Ch. 6 (control plan and the link to SPC).
- Breyfogle (2003), Implementing Six Sigma, Ch. 10 (control plan matrix), Ch. 43 (project hand-off and sustainment audit).
- Liker (2004), The Toyota Way, Principle 6 (standardized tasks), Principle 5 (jidoka/Andon).
- Imai (1986), Kaizen, Part II (PDCA/SDCA, the Gemba, the standardization cycle).`,
  },
  knowledgeObject: {
    title: "Control Plans, SOPs, Standard Work & OCAP — Locking in the Gains",
    domain: "Control",
    competency: "Control Plans & Standardization",
    topic: "DMAIC Control — Sustainment & Standardization",
    concept: "Control plan matrix (6 fields), PFMEA linkage, SOP/standard work, OCAP, training, audit cadence, benefits tracker, project hand-off",
    body: {
      definitions: [
        "Control plan: the one-page-per-CTQ matrix documenting how each critical characteristic is monitored and reacted to.",
        "Standard Operating Procedure (SOP): the written, step-by-step, gage-referenced, picture-illustrated operator procedure.",
        "Standard work (TPS): the cycle-time-balanced operator sequence (manual + machine + walk ≤ takt); the platform for Kaizen.",
        "Takt time: available work time / customer demand (s/unit); the rhythm at which the customer consumes product.",
        "Reaction plan / OCAP (out-of-control action plan): the decision tree triggered by a chart signal — stop, contain, investigate, fix, restart.",
        "PFMEA (Process FMEA): the upstream source of high-RPN failure modes that drive control-plan rows.",
        "RPN (Risk Priority Number): Severity × Occurrence × Detection (1-10 each); PFMEA prioritization metric.",
        "Poka-yoke (mistake-proofing): a device or design that prevents or detects an error at the source.",
        "Andon: the visual + audible escalation system that calls for help (green/amber/red).",
        "Training package: operator certification materials, OJT records, sign-off.",
        "Audit cadence: daily gemba walk, weekly control-plan audit, monthly SOP review, quarterly benefits check.",
        "Benefits tracker: the 6- and 12-month COPQ-recovery measurement confirming projected gains are realized.",
        "Project hand-off: formal transfer of control plan + SOPs + training + benefits tracker from the Belt to the process owner.",
        "SDCA (Standardize-Do-Check-Act): Imai's stabilization cycle that locks in the current process before PDCA improvement.",
      ],
      principles: [
        "The control plan is the bridge between the Improve solution and the sustaining system; chart = sensor, plan = actuator.",
        "Every control-plan row carries the six canonical fields (characteristic, spec, gage, sample, control method, reaction).",
        "The PFMEA is the upstream source of high-RPN rows; traceability runs PFMEA → control plan → SOP → training → audit.",
        "Standard work (TPS) is the platform for Kaizen — without a standard, improvement is invisible.",
        "SDCA (stabilization) precedes PDCA (improvement) — lock in the current standard before improving it.",
        "The OCAP always starts with stop-and-contain — defective product must not reach the customer.",
        "Poka-yoke (prevention) is preferred over a chart (detection) wherever engineering-feasible.",
        "Training coverage is 100% before hand-off; the plan is paper without certified operators.",
        "The audit cadence is the institutional memory that catches SOP drift.",
        "The benefits tracker (6/12 months) confirms COPQ recovery; < 90% triggers a sustaining-action project.",
      ],
      components: [
        "Control plan matrix (one row per CTQ × 6 canonical fields).",
        "PFMEA — the upstream source of high-RPN rows.",
        "SOPs — written, gage-referenced, picture-illustrated, revision-controlled.",
        "Standard work sheet — operator sequence balanced to takt time.",
        "OCAP decision tree — stop, contain, investigate, fix, escalate.",
        "Training package — classroom + OJT + sign-off.",
        "Audit cadence — daily/weekly/monthly/quarterly.",
        "Benefits tracker — 6- and 12-month COPQ-recovery measurement.",
        "Andon system — green/amber/red escalation.",
        "Hand-off package — control plan + SOPs + training + benefits tracker, signed by the process owner.",
      ],
      mechanism: [
        "Control-plan lifecycle: pull PFMEA high-RPN rows → draft control-plan rows (6 fields each) → write SOPs (step-by-step, pictures) → build standard work (cycle-time balanced to takt) → write OCAP decision trees → build training package → install Andon → set audit cadence → hand off to process owner → run benefits tracker 6/12 months.",
      ],
      process: [
        "1. Pull high-RPN failure modes from the Analyze-phase PFMEA (RPN ≥ 100 or top 20%).",
        "2. For each high-RPN mode, draft a control-plan row with the 6 canonical fields.",
        "3. Write the SOP for every operator task — step-by-step, gage-referenced, picture-illustrated.",
        "4. Build the standard-work sheet — break each task into manual/machine/walk; balance to takt.",
        "5. Write the OCAP decision tree for each chart-signal trigger — stop, contain, investigate (PFMEA-ordered), fix, escalate.",
        "6. Prefer poka-yoke over a chart wherever engineering-feasible.",
        "7. Build the training package; deliver classroom + OJT; achieve 100% operator sign-off.",
        "8. Install the Andon system (light + audible; tier-1/2/3 response).",
        "9. Set the audit cadence — daily gemba walk, weekly control-plan audit, monthly SOP review, quarterly benefits.",
        "10. Hand off the package to the process owner; owner signs the hand-off form.",
        "11. Run the benefits tracker at 6 and 12 months; if < 90% recovery, launch a sustaining-action project.",
      ],
      formulas: [
        "RPN = Severity × Occurrence × Detection (1-10 each; range 1-1000; high-RPN threshold ≥ 100 or top 20%).",
        "Control plan row: (1) characteristic; (2) spec; (3) measurement method; (4) sample size/frequency; (5) control method; (6) reaction plan.",
        "Takt time = available work time / customer demand (s/unit).",
        "Standard work: Σ(manual + machine + walk) ≤ takt.",
        "Training coverage = (# trained / # assigned) × 100% (target 100%).",
        "Audit pass rate = (# rows conforming / # rows in plan) × 100% (target ≥ 95%).",
        "Benefits tracker: realized COPQ recovery / projected (target ≥ 90% at 6 months, ≥ 100% at 12 months).",
      ],
      metrics: [
        "Number of control-plan rows (coverage of high-RPN failure modes).",
        "Gage %R&R per row (< 10% required).",
        "RPN reduction post-action (target ≥ 70% reduction on the row's PFMEA RPN).",
        "Training coverage % (target 100% before hand-off).",
        "Audit pass rate (target ≥ 95%).",
        "Time-to-OCAP-execution (hours from chart signal to corrective action).",
        "Benefits tracker realized COPQ recovery % (target ≥ 90% at 6 months).",
        "Sustaining-action project count (lower is better — indicates durable standardization).",
      ],
      examples: [
        "CNC grinding cell control plan: 7 rows, X̄-R + I-MR + Andon countdown, OCAP F-CP-01.",
        "PFMEA R-04 (wheel-grit dull, RPN=160) → control plan OD row → OCAP step 1 check X4.",
        "Standard work balanced to 90-s takt: manual 15 s + grinder 60 s + unload 12 s + walk 3 s.",
        "Training: 8 operators × 4-hour classroom + 8-hour OJT + sign-off = 100% coverage.",
        "Benefits tracker: charter $520k/year target; 6-month $468k (90%); 12-month $530k (102% — sustained).",
      ],
      industrial_examples: [
        "Manufacturing — CNC grinding cell (shaft OD); control plan with X̄-R + Andon countdown + OCAP F-CP-01.",
        "Healthcare — ED door-to-provider CTQ; control plan with triage-nurse audit + EHR timestamp audit + standard work for hand-off.",
        "Electronics — SMT solder-bridge CTQ; control plan with p-chart + paste-viscosity audit + reflow-profile verification.",
        "Chemical — batch reactor yield; control plan with I-MR + raw-material-lot poka-yoke + catalyst-activity test.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Automotive Tier-1 stamped control arm (CTQ hole position ± 0.15 mm). 12-row control plan from 47-mode PFMEA (top 20% RPN ≥ 120). High-RPN rows: die-wear (192), stock-lubricant drift (168), press-tonnage deviation (144). Control methods: X̄-s chart, Andon, kanban. Training: 14 operators × classroom+OJT = 100%. Benefits tracker: $1.8M target; 6-month $1.55M (86% → sustaining action); 12-month $1.95M (108% sustained, Control hand-off to plant quality).",
      ],
      common_errors: [
        "Writing the control plan from scratch instead of pulling PFMEA rows — loses failure-mode traceability.",
        "Omitting the reaction-plan column — operator has no steps to follow when the chart signals.",
        "Using a chart where a poka-yoke is feasible — detection is inferior to prevention.",
        "Posting the SOP without annotated pictures — operators misread steps.",
        "Skipping the training step — plan is paper until the operator is certified.",
        "Forgetting the audit cadence — SOP drifts after 60 days; plan becomes decoration.",
        "No benefits tracker — team declares victory at hand-off and gains erode.",
        "Auto-re-baselining the chart when the control plan changes — must be deliberate.",
        "OCAP without stop-and-contain first step — defective product reaches the customer.",
        "More than one Accountable role per row — RACI violation, no one owns the reaction.",
      ],
      limitations: [
        "The control plan is only as good as the PFMEA upstream — a weak PFMEA yields a weak plan.",
        "The SOP is a snapshot; process drift requires re-issue (revision control is essential).",
        "Poka-yoke design requires engineering effort and capital — not every failure mode is mistake-proofable.",
        "The audit cadence depends on supervisor bandwidth — under-resourced audits drift.",
        "The benefits tracker depends on the Finance reviewer's commitment — under-staffed finance delays checks.",
        "The training package assumes operator stability — high turnover invalidates 100% coverage within months.",
        "Multivariate or chemically-coupled CTQs need multivariate control plans; the one-page matrix oversimplifies.",
      ],
      best_practices: [
        "Pull high-RPN rows from the Analyze-phase PFMEA; do not invent control-plan rows from scratch.",
        "For each row, populate all six canonical fields; verify gage %R&R < 10%.",
        "Prefer poka-yoke over a chart wherever engineering-feasible (prevention beats detection).",
        "Write the OCAP with stop-and-contain as the first step; order the investigation by PFMEA Occurrence.",
        "Annotate the SOP with pictures; revision-control every issue.",
        "Balance standard work to takt time; do not exceed takt on any cycle.",
        "Train every operator to 100% coverage; document classroom + OJT + sign-off.",
        "Install the Andon; train tier-1/2/3 responders.",
        "Set the audit cadence and the benefits tracker; review at the project gate.",
        "Hand off the package to the process owner with a signed form; close the DMAIC project.",
      ],
      related_concepts: [
        "Statistical Process Control (SPC) (Lesson 1) — the chart is the sensor; the control plan is the actuator.",
        "Continuous Improvement & Visual Management (Lesson 3) — PDCA/SDCA, Kaizen, 5S, Kanban, Andon, tier huddles.",
        "Analyze phase — the PFMEA (failure modes, RPN) is the upstream source of control-plan rows.",
        "Improve phase — the validated solution (X settings, poka-yokes, SOPs) the control plan must sustain.",
        "Measure phase — Gage R&R (MSA) validates every control-plan gage reference.",
      ],
      prerequisites: [
        "The Analyze-phase PFMEA (Severity × Occurrence × Detection = RPN) — the source of high-RPN rows.",
        "The Improve-phase validated solution (X settings, poka-yokes, SOPs).",
        "Measure-phase MSA (Gage R&R %R&R < 10%) — every row references the gage's quality.",
        "The DMAIC charter (COPQ baseline and target) — the benefits tracker measures recovery against it.",
        "Conceptual familiarity with the Toyota Production System (standard work, jidoka, Andon — Liker) and PDCA/SDCA (Imai).",
      ],
      references: [
        "ASQ Six Sigma Black Belt Body of Knowledge — Control phase.",
        "ASQ Six Sigma Green Belt Body of Knowledge — Control phase.",
        "Montgomery (2013), Statistical Quality Control, Ch. 6.",
        "Breyfogle (2003), Implementing Six Sigma, Ch. 10, 43.",
        "Liker (2004), The Toyota Way, Principles 5-6.",
        "Imai (1986), Kaizen, Parts I & II.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Control Plans & Standardization",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which document is the upstream source of high-RPN rows in a Six Sigma control plan?",
      whyCorrect:
        "The Process Failure Mode and Effects Analysis (PFMEA) — developed in the Analyze phase — lists every potential process failure mode with its Severity, Occurrence, and Detection ratings and the RPN = S × O × D. The high-RPN failure modes (RPN ≥ 100 or top 20%) drive the control plan: each becomes a row whose characteristic is the failure's effect, whose control method is the action that reduces Occurrence or Detection, and whose reaction plan is the documented OCAP. Traceability runs PFMEA → control plan → SOP → training → audit. Without the PFMEA, the control plan is invented from scratch and loses its failure-mode justification.",
      whyOthersWrong: [
        "Option A (Project charter) — the charter carries the problem, goal, business case, scope, team, milestones; it does not list failure modes. The charter is the Define-phase governance contract, not the Control-phase row source.",
        "Option C (SIPOC) — the SIPOC is the high-level process map (Supplier-Input-Process-Output-Customer); it does not quantify failure-mode risk. It is a Define-phase artifact.",
        "Option D (Gage R&R study) — the MSA validates the measurement system referenced in the control plan's gage column; it does not identify failure modes or drive row selection.",
      ],
      explanation:
        "PFMEA → control plan. The high-RPN failure modes (RPN ≥ 100 or top 20%) drive the control-plan rows; the charter, SIPOC, and Gage R&R are upstream inputs but not the row source.",
      options: [
        { text: "Project charter", isCorrect: false },
        { text: "Process FMEA (PFMEA)", isCorrect: true },
        { text: "SIPOC diagram", isCorrect: false },
        { text: "Gage R&R study", isCorrect: false },
      ],
    },
    {
      competencyName: "Control Plans & Standardization",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Manufacturing",
      stem: "A PFMEA row for a stamped-part hole-position failure mode has Severity S=8, Occurrence O=6, and Detection D=2. Compute the RPN. The team installs a poka-yoke that prevents the failure (Occurrence → 1) and improves Detection to D=1. Compute the post-action RPN and the % reduction.",
      whyCorrect:
        "RPN_pre = S × O × D = 8 × 6 × 2 = 96. After the poka-yoke reduces Occurrence to 1 and Detection to 1, RPN_post = 8 × 1 × 1 = 8. % reduction = (RPN_pre − RPN_post) / RPN_pre × 100% = (96 − 8) / 96 × 100% = 88 / 96 × 100% = 91.7% ≈ 92%. This is a strong Control-phase outcome: a single poka-yoke that prevents the failure reduces the RPN by ~92%, taking the row from a high-priority (RPN ≥ 96) to a residual-risk (RPN = 8). The control plan now lists the poka-yoke as the control method (prevention) rather than a chart (detection).",
      whyOthersWrong: [
        "Option B (RPN_pre = 96, RPN_post = 16, 83% reduction) — uses O=2, D=1 post (only Detection improved, not Occurrence); the poka-yoke prevents the failure so Occurrence → 1, not 2.",
        "Option C (RPN_pre = 48, RPN_post = 4, 92% reduction) — uses S=4 (the team's Severity score was 8, not 4; confusing Severity with Detection or with the post-action Detection score).",
        "Option D (RPN_pre = 96, RPN_post = 1, 99% reduction) — uses O=1, D=1 but also S=1; the poka-yoke does not reduce Severity (the failure's impact is unchanged — only its likelihood and detectability change).",
      ],
      explanation:
        "RPN_pre = 8×6×2 = 96; poka-yoke reduces O to 1 and D to 1; RPN_post = 8×1×1 = 8; reduction = (96−8)/96 × 100% = 91.7% ≈ 92%.",
      options: [
        { text: "RPN_pre = 96, RPN_post = 8, 92% reduction", isCorrect: true },
        { text: "RPN_pre = 96, RPN_post = 16, 83% reduction", isCorrect: false },
        { text: "RPN_pre = 48, RPN_post = 4, 92% reduction", isCorrect: false },
        { text: "RPN_pre = 96, RPN_post = 1, 99% reduction", isCorrect: false },
      ],
    },
    {
      competencyName: "Control Plans & Standardization",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "DecisionMaking",
      skillType: "Procedural",
      scenario: "Manufacturing",
      stem: "A control-plan row lists the characteristic, spec, gage, sample size, and control method — but omits the reaction-plan field. What is the operational consequence?",
      whyCorrect:
        "The reaction-plan field tells the operator exactly what to do when the control method (the chart, the poka-yoke, the audit) signals an out-of-control condition. Without it, when the X̄-R chart fires WECO rule 2, the operator has no documented steps — no stop-and-contain instruction, no ordered investigation of likely assignable causes, no escalation path, no OCAP form to log. The operator will either ignore the signal (the chart becomes decoration) or improvise (ad-hoc troubleshooting that may or may not quarantine defective product). The defective product can reach the customer. The reaction-plan field is the actuator that makes the chart's sensor actionable; without it, the row is a sensor with no actuator — a documentation gap that an audit must catch.",
      whyOthersWrong: [
        "Option A ('No consequence — the chart will still detect the signal') — wrong; detection is meaningless without a documented response. The chart will fire and the operator will not know what to do; the signal is wasted.",
        "Option B ('The operator can use the SOP instead') — wrong; the SOP is the normal-sequence procedure (how to produce good output), not the out-of-control-action procedure (what to do when the chart signals). The OCAP is a different artifact.",
        "Option D ('The control plan will fail audit and the project cannot be handed off') — too strong; the audit will flag the gap, the team will add the reaction-plan field, and the hand-off proceeds after the fix. The consequence is operational (no documented response to a signal), not a project blocker.",
      ],
      explanation:
        "Without the reaction-plan field, when the chart signals the operator has no documented steps — no stop-and-contain, no OCAP, no escalation. The chart becomes decoration; defective product may reach the customer. An audit must catch this gap before hand-off.",
      options: [
        { text: "No consequence — the chart will still detect the signal", isCorrect: false },
        { text: "The operator can use the SOP instead of a reaction plan", isCorrect: false },
        { text: "When the chart signals, the operator has no documented steps — no stop/contain/OCAP — defective product may reach the customer", isCorrect: true },
        { text: "The control plan will fail audit and the project cannot be handed off", isCorrect: false },
      ],
    },
    {
      competencyName: "Control Plans & Standardization",
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Manufacturing",
      stem: "True or False: Per Liker's Principle 6, standard work is the foundation of continuous improvement — without a documented standard, Kaizen cannot measure improvement, so the team should standardize first (SDCA) before attempting improvement (PDCA).",
      whyCorrect:
        "TRUE. Liker's Principle 6: 'Standardized tasks are the foundation for continuous improvement and employee empowerment.' Imai's SDCA (Standardize-Do-Check-Act) cycle is the stabilization loop that locks in the current best-known method as the standard; PDCA (Plan-Do-Check-Act) is the improvement loop that raises the standard. Without a documented standard, there is no baseline against which to measure a Kaizen change — improvement is invisible, and tampering is indistinguishable from improvement. The Control phase's standardization (SOP + standard work + control plan) is the SDCA half of the cycle; the next PDCA improvement cycle starts from this new, higher baseline. The DMAIC Control phase therefore exists precisely to install the SDCA loop that locks in the Improve-phase gains and sets the platform for the next PDCA cycle.",
      whyOthersWrong: [
        "Option FALSE — would imply that improvement can proceed without a standard; this is the anti-pattern. Without a standard, every operator works differently (no baseline), Kaizen changes cannot be measured, and tampering is indistinguishable from improvement. The team must standardize (SDCA) before improving (PDCA).",
      ],
      explanation:
        "TRUE. Standard work is the platform for Kaizen (Liker Principle 6). SDCA (standardize) precedes PDCA (improve) — lock in the standard, then improve from the new baseline (Imai).",
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Continuous Improvement & Visual Management
// (Competency: "Continuous Improvement & Visual Management"; slug: c-continuous-improvement-visual)
// ---------------------------------------------------------------------------

const LESSON_CONTINUOUS_IMPROVEMENT: RefLesson = {
  competencyName: "Continuous Improvement & Visual Management",
  slug: "c-continuous-improvement-visual",
  title: "PDCA/SDCA, Kaizen, 5S, Kanban, Andon & Tier Huddles — The Sustainment Culture",
  titleAr: "PDCA/SDCA، كايزن، 5S، كانبان، الأندون واجتماعات الطبقات — ثقافة الاستدامة",
  order: 3,
  durationMin: 36,
  references: SS_CONTROL_REFERENCE_TITLES,
  conceptIntroduction: `Continuous improvement (Kaizen, Imai 1986) is the cultural engine that sustains the gains the DMAIC project delivered. Where the Control plan and SPC chart (Lessons 1 and 2) are technical artifacts, Kaizen is the organizational habit that keeps them alive. Imai's Kaizen philosophy rests on three claims: (1) improvement is continuous and incremental — many small changes accumulate to outperform episodic radical innovation; (2) improvement is worker-driven — the operators at the gemba (the real place where value is created) know the process best and are the source of the best ideas; (3) improvement requires a baseline — without a documented standard, change cannot be measured. The two engines of Kaizen are PDCA (Plan-Do-Check-Act, the improvement cycle) and SDCA (Standardize-Do-Check-Act, the stabilization cycle). SDCA locks in the current standard; PDCA raises it. Both run continuously — when a PDCA cycle validates a new method, the new method becomes the standard, and SDCA re-stabilizes; the next PDCA cycle starts from the higher baseline.

Visual management is the operationalization of Kaizen at the gemba. The principle: anyone walking the workplace should see, in 30 seconds, the normal vs abnormal state of every process, every CTQ, every operator, every machine. The toolkit: (1) 5S (Sort, Set in Order, Shine, Standardize, Sustain) — workplace organization that removes clutter, gives every tool a labeled home, makes cleanliness an audit metric, and standardizes the layout so abnormality is visible; (2) Kanban — the visual pull system (a card or container that authorizes the upstream process to produce only what the downstream process has consumed, capping WIP and exposing imbalance); (3) Andon — the visual + audible escalation system that calls for help when a process abnormality is detected (green = normal, amber = degraded, red = stopped); (4) tier huddles — the structured daily management meetings at each organizational layer (tier-1 operator, tier-2 team-leader, tier-3 value-stream-manager) that review the prior day's metrics, surface issues, and assign owners for the day's Kaizen actions.

The Andon is the heart of jidoka (Liker Principle 5: build a culture of stopping to fix problems). Every operator has the right — and the obligation — to pull the Andon cord when a defect, an abnormality, or a chart signal appears. The Andon amber calls the team leader (tier-1) within 60 seconds; if the issue is not resolved in 5 minutes, the Andon escalates to red, calling the process engineer (tier-2); if not resolved in another 10 minutes, escalation to tier-3 (value-stream manager). The line stops — production of bad product is preferred over production of more bad product. The tier huddle reviews the day's Andon pulls, root-causes the top issues, and assigns Kaizen actions; the next day's huddle checks the actions. This is the daily-improvement engine that sustains the gains.

The 5S audit cadence is the institutional memory. A 5S score (each S scored 0-5, total 0-25) is taken weekly by the team leader, monthly by the supervisor, quarterly by the value-stream manager. A 5S score below 15 triggers a corrective action; a score above 20 earns recognition. The Kanban card count and the WIP cap are audited daily; an Andon pull log is reviewed at every tier huddle. The combination of visual management (the workplace itself tells the truth), the Andon (escalation within minutes), the tier huddles (structured daily Kaizen), and the audit cadence (institutional memory) makes the Control phase a self-sustaining culture rather than a paper plan. The DMAIC project handed off in Lesson 2 lives or dies on the strength of this culture; the Belt's final deliverable is not the control plan but the trained, empowered, Andon-pulling, huddle-attending, 5S-auditing team that runs it.`,
  example: `A Black Belt is closing the Control phase on the CNC grinding cell. The control plan, SOP, and standard work are signed off (Lesson 2). The Belt now installs the visual management + Kaizen system that will sustain the gains.

**5S implementation (gemba = grinding cell).**
- Sort (Seiri): red-tag every item not used in the last 30 days → 47 items removed (old wheels, broken gages, obsolete fixtures).
- Set in Order (Seiton): label every tool's home; shadow-board for wrenches, gauges, calibrated to spec; cycle-time walk reduced from 12 m to 4 m.
- Shine (Seiso): end-of-shift 5-min clean; coolant-tray swarf logged; weekly deep-clean.
- Standardize (Seiketsu): the 5S standard is posted; the 5S audit form is at the gemba; every operator audits weekly on a rotating schedule.
- Sustain (Shitsuke): monthly 5S score; recognition at ≥ 20/25; corrective action at < 15/25; the team's 5S score trends on the tier-3 board.

**Kanban (wheel-grit and finished shafts).**
- Wheel-grit Kanban: 2-bin system; when bin 1 empties, the kanban card authorizes Materials to issue a new bin; bin 2 keeps the line running. WIP cap = 2 bins (≤ 2 weeks supply); eliminates stock-outs and over-stock.
- Finished-shaft Kanban: a container of 25 shafts authorizes the downstream assembly to consume; when the container empties, the kanban card travels back upstream and authorizes the cell to produce the next 25. WIP cap = 4 containers (≤ 100 shafts) between grinding and assembly.

**Andon escalation.**
- Green: in control (X̄-R chart stable, OD within spec).
- Amber: WECO rule 4 fires (8 consecutive above center) or 5S score < 15 → operator pulls cord → team leader (tier-1) responds within 60 s.
- Red: WECO rule 1/2/3 fires (3σ spike or 2σ sustained) → operator pulls cord → process engineer (tier-2) responds within 5 min; if unresolved in 10 min, value-stream manager (tier-3).

**Tier huddles (daily, 15 min each).**
- Tier-1 (operator, 7:00 AM): yesterday's OD chart, today's plan, any safety issue; assigns today's 5S area.
- Tier-2 (team leaders, 7:15 AM): all 5 cells' charts, Andon pulls, OCAP actions, 5S scores; assigns owners for unresolved issues.
- Tier-3 (value-stream manager, 7:30 AM): daily COPQ, monthly trend, Kaizen project portfolio; resolves resource barriers.

**Kaizen suggestion system.** Operators submit Kaizen cards (one idea per card); 30-day target = 1 idea/operator/month; 70% implementation rate; recognized at the monthly Kaizen circle. Examples: cycle-time reduced 4 s by re-orienting the gage; 5S score +3 by re-labeling the wheel bin.

**Audit cadence.** 5S weekly (team leader), monthly (supervisor), quarterly (VSM). Andon pull log reviewed at every tier huddle. Kanban card count audited daily. Chart audit (limit + zone lines + reaction-plan execution) weekly by the supervisor.`,
  keyFormulas: `5S audit score = Sort + Set in Order + Shine + Standardize + Sustain   (each 0-5; total 0-25; corrective action < 15; recognition ≥ 20)
Kanban card count (WIP cap) = (downstream demand during replenishment lead time) / (container size); rounded up
  WIP = Σ(kanban cards × container size)
Andon response time SLA: tier-1 ≤ 60 s; tier-2 ≤ 5 min; tier-3 ≤ 15 min (escalation triggers per the Andon decision tree)
Tier huddle duration SLA: 15 min × 3 tiers = 45 min/day for daily management
Kaizen suggestion rate = (suggestions submitted / operators) / month; target ≥ 1/operator/month
Kaizen implementation rate = (suggestions implemented / submitted) × 100%; target ≥ 70%
COPQ recovery sustainment = (realized COPQ recovery / projected COPQ recovery) × 100%; target ≥ 100% at 12 months
PDCA cycle: Plan (define the change, the metric, the hypothesis) → Do (test the change small-scale) → Check (measure the metric) → Act (standardize if validated, return to Plan if not)
SDCA cycle: Standardize (lock in current best) → Do (run to standard) → Check (audit conformance) → Act (correct deviations, restore standard)
Visual management test: an outsider can identify normal vs abnormal state of every process in 30 s (yes/no per gemba walk)`,
  exercise: `You are a Green Belt installing the visual-management + Kaizen system in a hospital's ED (door-to-provider CTQ sustained at ≤ 2 h). (1) Design the 5S for the triage station (Sort, Set in Order, Shine, Standardize, Sustain) with specific items. (2) Design the Kanban for the EHR-terminal supply (paper wristbands, label rolls, sanitizer). (3) Define the Andon escalation (green/amber/red) for the ED, with response-time SLAs. (4) Draft the 3 tier huddles (charge nurse, ED director, hospital operations) with agenda and duration. (5) Design the Kaizen suggestion system for the ED staff (rate, implementation, recognition). (6) Define the audit cadence and the sustainment metrics (5S score, COPQ recovery, Kaizen rate) tracked on the tier-3 board.`,
  sections: {
    learning_objectives: `- Distinguish PDCA (improvement) from SDCA (stabilization) and explain why SDCA must precede PDCA (Imai).
- Implement 5S (Sort, Set in Order, Shine, Standardize, Sustain) with weekly/monthly/quarterly audit cadence and a 0-25 scoring rubric.
- Design a Kanban pull system (card count, container size, WIP cap) that exposes imbalance and prevents overproduction.
- Configure an Andon escalation (green/amber/red) with tier-1/2/3 response-time SLAs (60 s / 5 min / 15 min).
- Run the three tier huddles (operator, team leader, value-stream manager) with 15-min agendas that surface issues and assign owners.
- Build a Kaizen suggestion system with ≥ 1/operator/month rate, ≥ 70% implementation rate, monthly recognition.
- Define the audit cadence (5S, Andon log, Kanban card count, chart audit) and the tier-3 sustainment dashboard.
- Explain why visual management (the workplace tells the truth) is the cultural backbone of the Control phase.`,
    prerequisites: `- The Control plan and SOPs (Lesson 2) — the standard that SDCA locks in.
- The SPC chart and reaction plan (Lesson 1) — the sensor whose signals the Andon escalates.
- Conceptual familiarity with the Toyota Production System (jidoka, Andon, standard work — Liker) and Kaizen (Imai).
- The DMAIC charter's COPQ-recovery target — the sustainment metric on the tier-3 board.
- Basic meeting-facilitation and Gemba-walk skills (daily management cadence).`,
    terminology: `- Kaizen — continuous, incremental, worker-driven improvement (Imai 1986).
- PDCA (Plan-Do-Check-Act) — the improvement cycle that raises the standard.
- SDCA (Standardize-Do-Check-Act) — the stabilization cycle that locks in the standard.
- Gemba — the real place where value is created (the factory floor, the ED, the warehouse).
- 5S — Sort, Set in Order, Shine, Standardize, Sustain (workplace organization).
- Kanban — visual pull system (card or container authorizing upstream production).
- WIP cap — work-in-progress limit (Σ cards × container size).
- Andon — visual + audible escalation system (green/amber/red); operator's right to pull the cord.
- Jidoka — automation with a human touch (the machine / operator stops on abnormality; Liker Principle 5).
- Tier huddle — structured daily management meeting at a specific organizational layer (tier-1/2/3).
- Kaizen suggestion system — the worker-driven idea pipeline (cards, rate, implementation %, recognition).
- Audit cadence — 5S weekly/monthly/quarterly; Andon log daily; Kanban card count daily; chart weekly.
- Sustainment dashboard — the tier-3 board showing 5S score, COPQ recovery, Kaizen rate, Andon pulls.
- Hansei — relentless reflection (the learning step after a problem or a success).
- Muda / Mura / Muri — the three wastes Lean targets (waste / unevenness / overburden).`,
    detailed_explanation: `Imai's Kaizen rests on three claims: improvement is continuous and incremental (many small changes outperform episodic innovation); improvement is worker-driven (the gemba operators know the process best); improvement requires a baseline (without a standard, change cannot be measured). The two engines are PDCA and SDCA. PDCA — Plan (define the change, the metric, the hypothesis), Do (test small-scale), Check (measure), Act (standardize if validated, return to Plan if not) — is the improvement cycle that raises the standard. SDCA — Standardize (lock in current best), Do (run to standard), Check (audit), Act (correct deviations) — is the stabilization cycle. SDCA must precede PDCA: lock in the standard first, then improve from a measured baseline; without the standard, tampering is indistinguishable from improvement. The DMAIC Control phase is the install of the SDCA loop; the post-DMAIC culture runs SDCA + PDCA continuously.

Visual management is the operationalization of Kaizen at the gemba. The principle is captured in the 30-second test: anyone walking the workplace should see, in 30 seconds, the normal vs abnormal state of every process, every CTQ, every operator, every machine. The toolkit: 5S (Sort, Set in Order, Shine, Standardize, Sustain) removes clutter, gives every tool a labeled home, makes cleanliness an audit metric, and standardizes the layout so abnormality is visible. Sort (Seiri) red-tags and removes every item not used in 30 days; Set in Order (Seiton) labels every tool's home and uses shadow-boards; Shine (Seiso) makes end-of-shift clean a habit and a metric; Standardize (Seiketsu) posts the 5S standard and the audit form at the gemba; Sustain (Shitsuke) audits and recognizes. The 0-25 5S score is taken weekly by the team leader, monthly by the supervisor, quarterly by the value-stream manager; corrective action below 15, recognition above 20.

Kanban is the visual pull system that caps WIP and exposes imbalance. A Kanban card (or container) travels downstream with the product; when the downstream process consumes the product, the empty container (or returned card) authorizes the upstream process to produce the next batch. The card count is the WIP cap — calculated as (downstream demand during replenishment lead time) / (container size), rounded up. Overproduction (the worst of the seven wastes) becomes impossible — the upstream process cannot produce without an authorization card. Imbalance becomes visible — a cell with empty kanban slots is starved (downstream bottleneck); a cell with full slots is over-producing (upstream bottleneck). The tier huddle reviews the kanban pattern and rebalances.

The Andon is the heart of jidoka (Liker Principle 5: build a culture of stopping to fix problems). Every operator has the right — and the obligation — to pull the Andon cord when a defect, an abnormality, or a chart signal appears. Green = normal; amber = degraded (chart's rule 4 firing, 5S below 15, kanban imbalance); red = stopped (chart's rule 1/2/3 firing, defect detected, safety issue). Amber calls the team leader (tier-1) within 60 seconds; red calls the process engineer (tier-2) within 5 minutes; tier-3 (value-stream manager) escalates at 15 minutes. The line stops — Toyota's principle: produce no bad product. The Andon pull log is reviewed at every tier huddle; the top issues are root-caused and assigned Kaizen actions; the next day's huddle checks the actions. This is the daily-improvement engine.

The three tier huddles run daily, 15 minutes each. Tier-1 (operator, 7:00 AM): yesterday's chart, today's plan, safety issue, today's 5S area — assigns today's Kaizen actions to the operator. Tier-2 (team leaders, 7:15 AM): all cells' charts, Andon pulls, OCAP actions, 5S scores — assigns owners for unresolved tier-1 issues. Tier-3 (value-stream manager, 7:30 AM): daily COPQ, monthly trend, Kaizen project portfolio, resource barriers — resolves cross-cell barriers. The huddles are structured (same agenda, same time, same place, 15-minute cap, stand-up format) so issues surface and owners are assigned within 45 minutes of shift start. The tier-3 board displays the 5S score trend, COPQ recovery vs charter target, Kaizen suggestion rate, Andon pulls by category, and the open-issue list with owners and dates.

The Kaizen suggestion system is the worker-driven idea pipeline. Operators submit Kaizen cards (one idea per card); the team leader reviews within 7 days; implemented ideas are recognized at the monthly Kaizen circle. Targets: ≥ 1 suggestion/operator/month, ≥ 70% implementation rate. The system is not a suggestion box (passive) — it is an active, facilitated, recognized pipeline that operationalizes the worker-driven claim. The combination of visual management (the workplace tells the truth), the Andon (escalation within minutes), the tier huddles (structured daily Kaizen), the Kaizen suggestion system (worker-driven ideas), and the audit cadence (institutional memory) makes the Control phase a self-sustaining culture rather than a paper plan.`,
    core_principles: `- Kaizen is continuous, incremental, worker-driven — many small changes outperform episodic innovation.
- SDCA precedes PDCA — lock in the standard before improving it; without a standard, change is unmeasurable.
- Visual management: anyone walking the gemba should see normal vs abnormal in 30 seconds.
- 5S makes abnormality visible — Sort, Set in Order, Shine, Standardize, Sustain, with weekly/monthly/quarterly audit.
- Kanban caps WIP and exposes imbalance — overproduction becomes impossible.
- Andon is the heart of jidoka — every operator has the right and the obligation to pull the cord (Liker Principle 5).
- Tier huddles surface issues and assign owners within 45 minutes of shift start.
- Kaizen suggestion system: ≥ 1/operator/month, ≥ 70% implementation, monthly recognition.
- The audit cadence is the institutional memory — without it, the SOP drifts and the gains erode.
- Hansei (relentless reflection) closes the loop — learning after every problem and every success.`,
    components: [
      `PDCA cycle (Plan-Do-Check-Act) — the improvement engine.`,
      `SDCA cycle (Standardize-Do-Check-Act) — the stabilization engine.`,
      `5S audit (Sort, Set in Order, Shine, Standardize, Sustain) — 0-25 score, weekly/monthly/quarterly.`,
      `Kanban pull system (card count, container size, WIP cap).`,
      `Andon escalation (green/amber/red; tier-1/2/3 SLAs of 60 s / 5 min / 15 min).`,
      `Tier huddles (operator, team leader, value-stream manager) — 15 min each, daily.`,
      `Kaizen suggestion system (cards, rate, implementation %, recognition).`,
      `Tier-3 sustainment dashboard (5S score, COPQ recovery, Kaizen rate, Andon pulls, open issues).`,
      `Audit cadence (5S, Andon log, Kanban card count, chart audit).`,
      `Hansei (reflection) — the learning step after every problem and every success.`,
    ].join("\n"),
    process: [
      `1. Document the standard (SOP + standard work + control plan — Lesson 2's deliverable); this is the SDCA 'Standardize' step.`,
      `2. Implement 5S: red-tag and remove (Sort), label and shadow-board (Set in Order), end-of-shift clean (Shine), post the standard (Standardize), audit and recognize (Sustain).`,
      `3. Design the Kanban pull system: card count = (downstream demand × lead time) / container size; cap WIP; post the kanban board at the gemba.`,
      `4. Install the Andon: light + audible; tier-1 (team leader), tier-2 (process engineer), tier-3 (value-stream manager); response-time SLAs 60 s / 5 min / 15 min.`,
      `5. Launch the three tier huddles (operator / team leader / VSM), 15 min each, daily; standardize the agenda.`,
      `6. Launch the Kaizen suggestion system: cards, 7-day review, ≥ 1/operator/month target, ≥ 70% implementation, monthly recognition.`,
      `7. Build the tier-3 sustainment dashboard: 5S score trend, COPQ recovery, Kaizen rate, Andon pulls, open issues.`,
      `8. Set the audit cadence: 5S weekly/monthly/quarterly; Andon log daily; Kanban card count daily; chart weekly.`,
      `9. Run hansei at every project gate and every monthly Kaizen circle — reflect on what worked and what did not.`,
      `10. The Belt hands off the culture (not just the plan) to the process owner; the owner runs SDCA + PDCA continuously.`,
    ].join("\n"),
    formula_calculation: `5S audit score = Sort + Set in Order + Shine + Standardize + Sustain   (each 0-5; total 0-25)
  Variables: each S is rated 0-5 by the auditor; the rubric is posted at the gemba.
  Units: dimensionless score.
  Assumptions: the auditor is trained; the audit is unannounced; the score is trended.
  Interpretation: < 15 = corrective action; ≥ 20 = recognition; trend over weeks is the institutional-memory signal.

Kanban card count (WIP cap) = ⌈(downstream demand during replenishment lead time) / (container size)⌉
  Variables: downstream demand (units/day); replenishment lead time (days); container size (units/card).
  Units: cards (integer).
  Assumptions: demand is stable; lead time is known; container size is fixed.
  Interpretation: WIP = Σ(cards × container size); overproduction impossible without authorization.

Andon response-time SLAs: tier-1 ≤ 60 s; tier-2 ≤ 5 min; tier-3 ≤ 15 min. Escalation triggers per the Andon decision tree (green = normal; amber = degraded; red = stopped).

Tier huddle: 15 min × 3 tiers = 45 min/day for daily management (operator, team leader, VSM).

Kaizen suggestion rate = (suggestions submitted / operators) / month; target ≥ 1/operator/month.
Kaizen implementation rate = (suggestions implemented / submitted) × 100%; target ≥ 70%.

COPQ recovery sustainment = (realized COPQ recovery / projected COPQ recovery) × 100%; target ≥ 100% at 12 months.

PDCA cycle: Plan → Do → Check → Act; SDCA cycle: Standardize → Do → Check → Act.

Visual management test: an outsider can identify normal vs abnormal state of every process in 30 s (yes/no per gemba walk).`,
    worked_example: `CNC grinding cell — visual management + Kaizen system install (post-Lesson 2 close-out).

Step 1 — 5S audit rubric (each S scored 0-5):
  Sort: red-tag and remove 47 items (old wheels, broken gages, obsolete fixtures) → score 5.
  Set in Order: shadow-board for 12 wrenches + 4 gages; cycle-time walk reduced 12 m → 4 m → score 5.
  Shine: end-of-shift 5-min clean; coolant-tray swarf logged weekly → score 4.
  Standardize: 5S standard posted; audit form at gemba; rotating weekly audit → score 5.
  Sustain: monthly score trended on tier-3 board; recognition at ≥ 20 → score 4.
  Total = 5+5+4+5+4 = 23/25. (Above 20 → recognition; the 2-point gap on Shine and Sustain becomes the next Kaizen focus.)

Step 2 — Kanban card count (wheel-grit, 2-bin system):
  Downstream demand = 1 bin / 2 weeks = 0.5 bin/week.
  Replenishment lead time = 1 week.
  Container size = 1 bin.
  Card count = ⌈(0.5 × 1) / 1⌉ = ⌈0.5⌉ = 1 card → 2-bin system (1 active + 1 in replenishment = 2 cards effectively, but standard 2-bin uses the empty bin as the kanban signal). WIP cap = 2 bins (≤ 4 weeks supply; eliminates stock-outs and over-stock).

Step 3 — Andon escalation matrix:
  Green: X̄-R chart stable, all OD within spec, 5S ≥ 20.
  Amber: WECO rule 4 (8 above center) OR 5S < 15 → operator pulls cord → tier-1 team leader responds ≤ 60 s.
  Red: WECO rule 1/2/3 fires OR defect detected OR safety issue → tier-2 process engineer ≤ 5 min; tier-3 VSM ≤ 15 min.
  Andon pull log: 12 pulls last month (8 amber, 4 red); top cause = wheel-grit (5 pulls, all caught by WECO rule 2); Kaizen action: shorten dress interval from 12 to 10 subgroups.

Step 4 — Tier huddles (daily, 15 min each):
  Tier-1 (operator, 7:00 AM): yesterday's X̄-R chart, today's production plan, safety, today's 5S area (cell 3) — 4 operators + team leader.
  Tier-2 (team leaders, 7:15 AM): all 5 cells' charts, Andon pulls, OCAP actions, 5S scores — 5 team leaders + supervisor.
  Tier-3 (VSM, 7:30 AM): daily COPQ, monthly trend, Kaizen portfolio — VSM + 2 supervisors + finance reviewer.

Step 5 — Kaizen suggestion system:
  8 operators × 1 suggestion/operator/month = 8/month target.
  Last month: 9 submitted; 7 implemented (78% — above 70% target).
  Recognized at monthly Kaizen circle: top 3 ideas posted on the tier-3 board.
  Examples: cycle-time reduced 4 s by re-orienting gage; 5S score +3 by re-labeling wheel bin; Andon response cut 20 s by relocating team-leader desk.

Step 6 — Tier-3 sustainment dashboard (monthly trend):
  5S score: 21 (target ≥ 20).
  COPQ recovery: $530k / $520k = 102% (above 100% target).
  Kaizen rate: 1.13/operator/month (above 1.0 target).
  Andon pulls: 12 (down from 28 six months ago).
  Open issues: 2 (one tier-2 unresolved from yesterday's amber pull).

Step 7 — Audit cadence:
  5S: weekly (team leader), monthly (supervisor), quarterly (VSM).
  Andon log: daily (tier-1 huddle).
  Kanban card count: daily (tier-2 huddle).
  Chart audit: weekly (supervisor).

Step 8 — Hansei: at the monthly Kaizen circle, the team reflects on what worked (Andon response time down 60%) and what did not (Shine score stuck at 4 — the coolant-tray swarf cleanup is not yet a habit); assigns the next Kaizen action (install a swarf-skimmer auto-clean).

Step 9 — Hand-off: the Belt hands off the culture (not just the plan) to the plant quality manager; the manager runs SDCA + PDCA continuously.`,
    industrial_example: `Manufacturing — CNC grinding cell (shaft OD). 5S score trend 21/25; Kanban 2-bin wheel-grit + 4-container shafts; Andon tier-1/2/3 with 60 s/5 min/15 min SLAs; 3 tier huddles daily; Kaizen 1.13/operator/month, 78% implementation; COPQ recovery 102%.

Healthcare — Emergency Department (door-to-provider CTQ ≤ 2 h). 5S at the triage station (Sort obsolete forms, Set in Order EHR-terminal supplies, Shine end-of-shift, Standardize the triage SOP, Sustain monthly audit). Andon: green/amber/red lights at each triage bay; tier-1 charge nurse, tier-2 ED director, tier-3 hospital operations. Tier huddles: charge nurse (7:00 AM), ED director (7:15), hospital ops (7:30). Kaizen: nurses submit cards; monthly recognition. COPQ recovery on the tier-3 board.

Electronics — SMT solder-bridge CTQ. 5S at the SMT line (Sort obsolete stencils, Set in Order the paste-refrigerator, Shine the printer, Standardize the reflow profile, Sustain weekly audit). Kanban for paste consumption. Andon on the AOI machine. Tier huddles at the line. Kaizen from operators and AOI techs. COPQ recovery tracked monthly.

Container Terminal — crane move cycle-time. 5S at the crane cab (Sort, Set in Order, Shine, Standardize, Sustain). Kanban for spreader maintenance. Andon on the crane (operator pulls if cycle-time breaches the chart limit). Tier huddles at the shift change. Kaizen from crane operators. COPQ recovery tracked monthly.`,
    case_study: `CASE_TYPE = SYNTHETIC. A medium-sized Tier-1 automotive stamping plant (4 lines, 120 operators, $42M revenue) installed the visual-management + Kaizen system post-DMAIC. Baseline (pre-install): 5S score 9/25, Andon pulls 47/month, COPQ recovery 73% at 12 months (below 90% — sustaining-action project triggered). The install: 5S Sort (340 red-tagged items removed), Set in Order (shadow-boards on every line), Shine (end-of-shift clean), Standardize (5S standard posted), Sustain (monthly score on the tier-3 board). Kanban for coil stock (2-bin) and finished blanks (3-container). Andon at every press (green/amber/red). 3 tier huddles daily. Kaizen suggestion system with monthly recognition. 12 months post-install: 5S score 22/25 (+13); Andon pulls 14/month (−70%); COPQ recovery 108% (+35 pts); Kaizen rate 1.21/operator/month; implementation 81%. The plant quality manager reports the system is self-sustaining: the tier-3 board drives the daily management, the audit cadence catches drift in days, and the Kaizen pipeline generates 100+ implemented ideas per year.`,
    visual_explanation: `Picture the gemba at 7:00 AM. At each cell: a 5S score card (0-25) on the wall, a shadow-board of labeled tools, an X̄-R chart on a board (centerline, UCL/LCL, zone lines, dots, an amber highlight on the last point that fired rule 4). Above the cell, an Andon column of three stacked lights — green today. The operator stands at tier-1 huddle (15 min). At 7:15, the team leaders gather at the tier-2 board showing 5 cells' charts, Andon-pull log (12 amber, 4 red), and OCAP actions. At 7:30, the VSM stands at the tier-3 sustainment dashboard: 5S trend line climbing, COPQ recovery at 102%, Kaizen rate 1.13/operator/month, Andon pulls trending down. Beside the dashboard, the Kaizen card rack holds 9 cards from last month, 7 marked 'implemented' with the operator's name. The whole system runs in 45 minutes of huddles, then the cells run the rest of the day.`,
    simulation_opportunity: `Simulator: a 4-cell factory with installable visual-management toolkit. Learner toggles 5S / Kanban / Andon / tier huddles / Kaizen suggestion system on/off and runs 90 days. Metrics: 5S score, Andon pulls, COPQ recovery, Kaizen rate. Challenge: turn off the tier huddles (daily Kaizen engine) and watch the SOP drift over 60 days (institutional-memory loss); turn off the Andon and watch defect escapes climb; turn off the Kaizen suggestion system and watch the Kaizen rate fall to zero. Bonus: start with no 5S and watch operators cycle between tools (cycle-time up 25%) before the first 5S Sort.`,
    common_mistakes: `- Treating 5S as a one-time cleanup — without the weekly/monthly/quarterly audit cadence, the gains erode in 60 days.
- Posting the Andon but not training the operators to pull it — the right to pull the cord is meaningless if operators fear retaliation.
- Running tier huddles as status updates (15 min of reporting) — they are Kaizen engines (issues surfaced, owners assigned).
- Setting the Kaizen suggestion target too high (≥ 5/operator/month) — quantity over quality; implementation rate collapses.
- Setting the Andon SLA too tight (tier-1 ≤ 30 s) — unachievable; the Andon is ignored.
- Capping WIP too low — starvation; the downstream cell idles waiting for the next kanban card.
- Capping WIP too high — overproduction returns; imbalance is hidden.
- Scoring 5S subjectively (no rubric) — scores inflate, the trend becomes meaningless.
- Treating hansei as a blame session — reflection without blame; learning, not punishment.
- Skipping the tier-3 dashboard — the VSM has no view of the system; barriers go unresolved.`,
    limitations: `- Kaizen is a culture, not a project — installing it requires leadership commitment for 12-24 months before the gains are durable.
- 5S without the audit cadence reverts in 60 days (the "Sort and Set in Order on Monday, mess by Friday" pathology).
- Kanban assumes stable demand — lumpy demand needs a safety stock or a heijunka box.
- Andon requires operator psychological safety — cultures that punish the messenger kill the Andon.
- Tier huddles need 45 minutes of daily management discipline — under-resourced supervisors skip them.
- Kaizen suggestion systems need a 7-day review SLA — slow review kills the pipeline.
- Visual management assumes literacy and numeracy — non-Latin scripts or low-numeracy operators need pictograms.
- The system is fragile to leadership turnover — a new VSM can dismantle the tier-3 dashboard in a quarter.`,
    comparison: `Kaizen vs innovation (Imai): Kaizen is continuous, incremental, worker-driven; innovation is radical, episodic, technology-driven — both needed, Kaizen anchors the culture. PDCA vs SDCA: PDCA raises the standard; SDCA locks it in — both run continuously. 5S vs housekeeping: housekeeping is Shine alone; 5S is the 5-step system with audit. Kanban vs MRP: Kanban is visual pull (WIP cap, authorization card); MRP is push (forecast-driven schedule). Kanban exposes imbalance; MRP hides it. Andon vs help desk: Andon is in-process escalation (operator pulls, tier-1/2/3 in 60 s/5 min/15 min); help desk is out-of-process (ticket, queue, days). Tier huddle vs staff meeting: huddle is 15 min, daily, gemba, standing, action-oriented; staff meeting is 60 min, weekly, conference room, status-oriented. Kaizen suggestion system vs idea competition: suggestion system is continuous, worker-driven, ≥ 70% implementation; competition is episodic, top-down, low implementation. Hansei vs post-mortem: hansei is reflection without blame; post-mortem is often blame-seeking.`,
    practical_application: `1. Document the standard (Lesson 2's deliverable); this is SDCA's Standardize.
2. Implement 5S with a 0-25 rubric; install weekly/monthly/quarterly audit cadence.
3. Design the Kanban pull system; cap WIP; post the kanban board at the gemba.
4. Install the Andon (light + audible); train operators to pull; train tier-1/2/3 responders.
5. Launch the 3 tier huddles (operator/team-leader/VSM), 15 min each, daily; standardize the agenda.
6. Launch the Kaizen suggestion system with 7-day review SLA; monthly recognition.
7. Build the tier-3 sustainment dashboard (5S, COPQ recovery, Kaizen rate, Andon pulls).
8. Run hansei at every project gate and every monthly Kaizen circle.
9. Audit the system weekly for the first month, monthly thereafter.
10. Hand off the culture (not just the plan) to the process owner; the owner runs SDCA + PDCA continuously.`,
    decision_scenario: `A Green Belt inherits a post-DMAIC plant where the tier-3 dashboard shows 5S at 17, COPQ recovery at 78%, Andon pulls trending up, and Kaizen rate at 0.4/operator/month. Diagnosis: the audit cadence has slipped (5S not weekly), the Andon is being ignored (operators fear pulling), the Kaizen suggestion system has a 30-day review backlog, and the tier huddles have become 60-min status meetings. Decision: (a) Re-instate the weekly 5S audit; re-train auditors on the rubric. (b) Hold a 1-hour Andon-pull training for all operators; publish the no-blame policy. (c) Clear the suggestion backlog in a weekend sprint; commit to a 7-day review SLA going forward. (d) Reformat the tier huddles to 15-min standing, action-oriented agendas; train the team leaders. (e) Re-baseline the tier-3 dashboard; set 90-day targets (5S ≥ 20, COPQ ≥ 90%, Andon ≤ 20/month, Kaizen ≥ 0.9). Review at 90 days.`,
    practice_questions: `Q1 (Recall): Name the 5S in order. (A: Sort, Set in Order, Shine, Standardize, Sustain.)
Q2 (Conceptual): Why must SDCA precede PDCA? (A: lock in the standard first, then improve from a measured baseline; without a standard, change is unmeasurable.)
Q3 (Calculation): 5S scores — Sort 5, Set in Order 4, Shine 3, Standardize 5, Sustain 3. Total? (A: 20 — above the recognition threshold.)
Q4 (Procedural): Kanban card count = ⌈(demand × lead time) / container size⌉; demand 100/day, lead time 5 days, container 250. Compute cards. (A: ⌈500/250⌉ = 2 cards.)
Q5 (Analysis): Andon tier-1 SLA is 60 s, tier-2 is 5 min, tier-3 is 15 min. A red Andon is pulled; tier-1 arrives in 90 s. What happens? (A: the SLA is breached; the escalation should have auto-fired to tier-2 at 60 s; the audit log records the miss.)
Q6 (Definitional): What is hansei? (A: relentless reflection — the learning step after every problem and every success, without blame.)`,
    certification_questions: `CSSBB-style: Which two cycles, per Imai, drive Kaizen? (A: PDCA improvement + SDCA stabilization; SDCA must precede PDCA.)
CSSGB-style: A 5S audit scores Sort=5, Set in Order=4, Shine=3, Standardize=5, Sustain=3. What is the total score and the action? (A: 20/25 — above the recognition threshold; no corrective action.)
CSSBB-style: An operator pulls the Andon cord (amber) for a WECO rule-4 signal on the X̄-R chart. Per the SLA, the team leader must respond within how many seconds? (A: 60 seconds.)
CSSBB-style: Downstream demand = 200 units/day, replenishment lead time = 4 days, container size = 100 units. Compute the Kanban card count. (A: ⌈(200×4)/100⌉ = ⌈800/100⌉ = 8 cards; WIP cap = 8×100 = 800 units.)
CSSGB-style: Which Liker principle underpins the Andon and the operator's right to pull the cord? (A: Principle 5 — build a culture of stopping to fix problems; jidoka.)`,
    summary: `Continuous improvement (Kaizen, Imai) is the cultural engine that sustains the gains. PDCA raises the standard; SDCA locks it in — SDCA precedes PDCA. Visual management (5S, Kanban, Andon, tier huddles, Kaizen suggestion system, audit cadence, hansei) is the operationalization at the gemba: anyone walking the workplace should see normal vs abnormal in 30 seconds. 5S makes abnormality visible (Sort, Set in Order, Shine, Standardize, Sustain; 0-25 weekly audit). Kanban caps WIP and exposes imbalance. Andon is the heart of jidoka (Liker Principle 5) — every operator has the right and the obligation to pull the cord; tier-1/2/3 SLAs of 60 s/5 min/15 min. Tier huddles (operator/team-leader/VSM, 15 min each daily) surface issues and assign owners. The Kaizen suggestion system runs ≥ 1/operator/month at ≥ 70% implementation. The tier-3 sustainment dashboard tracks 5S score, COPQ recovery, Kaizen rate, Andon pulls. The Belt's final deliverable is not the control plan but the trained, empowered, Andon-pulling, huddle-attending, 5S-auditing team that runs the culture.`,
    key_takeaways: `- Kaizen = continuous, incremental, worker-driven (Imai); many small changes outperform episodic innovation.
- SDCA precedes PDCA — lock in the standard, then improve from a measured baseline.
- Visual management: anyone walking the gemba sees normal vs abnormal in 30 seconds.
- 5S (Sort, Set in Order, Shine, Standardize, Sustain) — 0-25 weekly audit; corrective < 15, recognition ≥ 20.
- Kanban caps WIP and exposes imbalance — overproduction becomes impossible.
- Andon is the heart of jidoka (Liker Principle 5) — every operator has the right and obligation to pull.
- Tier huddles surface issues and assign owners in 45 min of daily management.
- Kaizen suggestion system: ≥ 1/operator/month, ≥ 70% implementation, monthly recognition.
- Audit cadence is the institutional memory — without it, the SOP drifts in 60 days.
- Hansei (relentless reflection) closes the loop — learning, not blame.`,
    references: `- ASQ Six Sigma Black Belt Body of Knowledge — Control phase (visual management, sustainment, hand-off).
- ASQ Six Sigma Green Belt Body of Knowledge — Control phase (visual management, 5S, project closure).
- Montgomery (2013), Statistical Quality Control, Ch. 6 (the in-control process as the visual-management backbone).
- Breyfogle (2003), Implementing Six Sigma, Ch. 10, 43 (control plan + sustainment audit, project hand-off).
- Liker (2004), The Toyota Way, Principles 1, 5, 6, 8, 13, 14 (long-term philosophy, jidoka/Andon, standard work, reliable technology, nemawashi, hansei/Kaizen).
- Imai (1986), Kaizen, Parts I, II, III (the Kaizen umbrella, PDCA/SDCA, the Gemba).`,
  },
  knowledgeObject: {
    title: "Continuous Improvement & Visual Management — PDCA/SDCA, Kaizen, 5S, Kanban, Andon, Tier Huddles",
    domain: "Control",
    competency: "Continuous Improvement & Visual Management",
    topic: "DMAIC Control — Sustainment Culture",
    concept: "Kaizen philosophy, PDCA/SDCA cycles, 5S, Kanban, Andon, tier huddles, Kaizen suggestion system, audit cadence, hansei",
    body: {
      definitions: [
        "Kaizen: continuous, incremental, worker-driven improvement (Imai 1986).",
        "PDCA (Plan-Do-Check-Act): the improvement cycle that raises the standard.",
        "SDCA (Standardize-Do-Check-Act): the stabilization cycle that locks in the standard.",
        "Gemba: the real place where value is created (factory floor, ED, warehouse).",
        "5S: Sort, Set in Order, Shine, Standardize, Sustain (workplace organization).",
        "Kanban: visual pull system (card or container authorizing upstream production).",
        "WIP cap: work-in-progress limit (Σ cards × container size).",
        "Andon: visual + audible escalation system (green/amber/red); operator's right to pull.",
        "Jidoka: automation with a human touch; the operator stops on abnormality (Liker Principle 5).",
        "Tier huddle: structured daily management meeting at a specific organizational layer.",
        "Kaizen suggestion system: worker-driven idea pipeline (cards, rate, implementation %, recognition).",
        "Audit cadence: 5S weekly/monthly/quarterly; Andon log daily; Kanban card count daily; chart weekly.",
        "Sustainment dashboard: tier-3 board showing 5S score, COPQ recovery, Kaizen rate, Andon pulls.",
        "Hansei: relentless reflection — the learning step after every problem and every success.",
        "Muda / Mura / Muri: the three wastes Lean targets (waste / unevenness / overburden).",
      ],
      principles: [
        "Kaizen is continuous, incremental, worker-driven — many small changes outperform episodic innovation.",
        "SDCA precedes PDCA — lock in the standard before improving it; without a standard, change is unmeasurable.",
        "Visual management: anyone walking the gemba sees normal vs abnormal in 30 seconds.",
        "5S makes abnormality visible — Sort, Set in Order, Shine, Standardize, Sustain, with weekly/monthly/quarterly audit.",
        "Kanban caps WIP and exposes imbalance — overproduction becomes impossible.",
        "Andon is the heart of jidoka — every operator has the right and the obligation to pull the cord (Liker Principle 5).",
        "Tier huddles surface issues and assign owners within 45 minutes of shift start.",
        "Kaizen suggestion system: ≥ 1/operator/month, ≥ 70% implementation, monthly recognition.",
        "The audit cadence is the institutional memory — without it, the SOP drifts and the gains erode.",
        "Hansei (relentless reflection) closes the loop — learning after every problem and every success, without blame.",
      ],
      components: [
        "PDCA cycle (Plan-Do-Check-Act) — the improvement engine.",
        "SDCA cycle (Standardize-Do-Check-Act) — the stabilization engine.",
        "5S audit (Sort, Set in Order, Shine, Standardize, Sustain) — 0-25 score, weekly/monthly/quarterly.",
        "Kanban pull system (card count, container size, WIP cap).",
        "Andon escalation (green/amber/red; tier-1/2/3 SLAs of 60 s / 5 min / 15 min).",
        "Tier huddles (operator, team leader, value-stream manager) — 15 min each, daily.",
        "Kaizen suggestion system (cards, rate, implementation %, recognition).",
        "Tier-3 sustainment dashboard (5S score, COPQ recovery, Kaizen rate, Andon pulls, open issues).",
        "Audit cadence (5S, Andon log, Kanban card count, chart audit).",
        "Hansei (reflection) — the learning step.",
      ],
      mechanism: [
        "Visual-management + Kaizen lifecycle: document standard (SDCA Standardize) → 5S install → Kanban design → Andon install → tier huddles launch → Kaizen suggestion system launch → tier-3 dashboard build → audit cadence set → hansei at every gate → hand off the culture (not just the plan) to the process owner.",
      ],
      process: [
        "1. Document the standard (Lesson 2 deliverable); this is SDCA's Standardize.",
        "2. Implement 5S with a 0-25 rubric; install weekly/monthly/quarterly audit cadence.",
        "3. Design the Kanban pull system; cap WIP; post the kanban board at the gemba.",
        "4. Install the Andon (light + audible); train operators to pull; train tier-1/2/3 responders with SLAs.",
        "5. Launch the 3 tier huddles (operator/team-leader/VSM), 15 min each, daily; standardize the agenda.",
        "6. Launch the Kaizen suggestion system with 7-day review SLA; monthly recognition.",
        "7. Build the tier-3 sustainment dashboard (5S, COPQ recovery, Kaizen rate, Andon pulls).",
        "8. Set the audit cadence (5S weekly/monthly/quarterly; Andon log daily; Kanban daily; chart weekly).",
        "9. Run hansei at every project gate and every monthly Kaizen circle.",
        "10. Hand off the culture to the process owner; the owner runs SDCA + PDCA continuously.",
      ],
      formulas: [
        "5S audit score = Sort + Set in Order + Shine + Standardize + Sustain (each 0-5; total 0-25; corrective < 15; recognition ≥ 20).",
        "Kanban card count = ⌈(downstream demand × replenishment lead time) / container size⌉; WIP = Σ(cards × container size).",
        "Andon SLAs: tier-1 ≤ 60 s; tier-2 ≤ 5 min; tier-3 ≤ 15 min.",
        "Tier huddle: 15 min × 3 tiers = 45 min/day.",
        "Kaizen suggestion rate = (suggestions submitted / operators) / month; target ≥ 1/operator/month.",
        "Kaizen implementation rate = (suggestions implemented / submitted) × 100%; target ≥ 70%.",
        "COPQ recovery sustainment = (realized COPQ recovery / projected) × 100%; target ≥ 100% at 12 months.",
        "Visual management test: an outsider can identify normal vs abnormal state of every process in 30 s (yes/no per gemba walk).",
      ],
      metrics: [
        "5S score (weekly/monthly/quarterly trend).",
        "Kanban card count and WIP cap (daily audit).",
        "Andon pulls per month (by category: green/amber/red; by cause).",
        "Andon response-time SLA adherence (% ≤ 60 s / 5 min / 15 min).",
        "Tier huddle attendance and on-time rate.",
        "Kaizen suggestion rate (per operator per month) and implementation rate (%).",
        "COPQ recovery sustainment % vs charter target.",
        "Hansei cadence (reflections per month per cell).",
      ],
      examples: [
        "CNC grinding cell: 5S score 23/25; Kanban 2-bin wheel-grit; Andon 12 pulls/month (down from 28 six months prior); tier huddles daily; Kaizen 1.13/operator/month, 78% implementation; COPQ recovery 102%.",
        "5S audit scores (example): 5+5+4+5+4 = 23 → above recognition threshold 20.",
        "Kanban card count: demand 0.5 bin/week × lead time 1 week ÷ container 1 bin = 0.5 → ⌈0.5⌉ = 1 (2-bin system).",
        "Andon SLA matrix: tier-1 60 s, tier-2 5 min, tier-3 15 min.",
        "Tier huddles: 7:00 / 7:15 / 7:30, 15 min each, 45 min total daily management.",
      ],
      industrial_examples: [
        "Manufacturing — CNC grinding cell; 5S 23/25, Andon tier-1/2/3, Kanban 2-bin wheel-grit + 4-container shafts, 3 tier huddles.",
        "Healthcare — ED door-to-provider; 5S at triage, Andon at each bay, tier huddles (charge nurse / ED director / hospital ops).",
        "Electronics — SMT line; 5S at the line, Kanban for paste, Andon on the AOI machine, tier huddles at the line.",
        "Container Terminal — crane cab; 5S, Kanban for spreader maintenance, Andon on the crane, tier huddles at the shift change.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Automotive stamping plant (4 lines, 120 operators, $42M revenue). Baseline: 5S 9/25, Andon 47/month, COPQ recovery 73% (below 90%). Install: 5S Sort (340 items removed), Set in Order (shadow-boards), Shine (end-of-shift), Standardize, Sustain (monthly audit). Kanban for coil stock and finished blanks. Andon at every press. 3 tier huddles daily. Kaizen suggestion system with monthly recognition. 12 months post-install: 5S 22/25 (+13); Andon 14/month (−70%); COPQ recovery 108% (+35 pts); Kaizen rate 1.21/operator/month; implementation 81%. Self-sustaining culture confirmed.",
      ],
      common_errors: [
        "Treating 5S as a one-time cleanup — without the weekly/monthly/quarterly audit, gains erode in 60 days.",
        "Posting the Andon but not training operators to pull it — the right to pull is meaningless if operators fear retaliation.",
        "Running tier huddles as 15-min status reports — they are Kaizen engines (issues surfaced, owners assigned).",
        "Setting the Kaizen suggestion target too high (≥ 5/operator/month) — quantity over quality; implementation collapses.",
        "Setting the Andon SLA too tight (tier-1 ≤ 30 s) — unachievable; the Andon is ignored.",
        "Capping WIP too low — starvation; the downstream cell idles.",
        "Capping WIP too high — overproduction returns; imbalance is hidden.",
        "Scoring 5S subjectively (no rubric) — scores inflate; the trend becomes meaningless.",
        "Treating hansei as a blame session — reflection without blame; learning, not punishment.",
        "Skipping the tier-3 dashboard — the VSM has no system view; barriers go unresolved.",
      ],
      limitations: [
        "Kaizen is a culture, not a project — 12-24 months of leadership commitment before gains are durable.",
        "5S without the audit cadence reverts in 60 days.",
        "Kanban assumes stable demand — lumpy demand needs safety stock or a heijunka box.",
        "Andon requires operator psychological safety — cultures that punish the messenger kill the Andon.",
        "Tier huddles need 45 min of daily discipline — under-resourced supervisors skip them.",
        "Kaizen suggestion systems need a 7-day review SLA — slow review kills the pipeline.",
        "Visual management assumes literacy/numeracy — pictograms for low-numeracy contexts.",
        "The system is fragile to leadership turnover — a new VSM can dismantle the dashboard in a quarter.",
      ],
      best_practices: [
        "Document the standard first (SDCA Standardize); without it, change is unmeasurable.",
        "Install 5S with a 0-25 rubric and weekly/monthly/quarterly audit; trend the score on the tier-3 board.",
        "Design Kanban to cap WIP and expose imbalance; post the kanban board at the gemba.",
        "Install the Andon with green/amber/red; train operators to pull; publish the no-blame policy.",
        "Run the 3 tier huddles daily, 15 min each, standing, action-oriented; standardize the agenda.",
        "Launch the Kaizen suggestion system with a 7-day review SLA and monthly recognition.",
        "Build the tier-3 sustainment dashboard; review daily.",
        "Run hansei at every gate and every monthly Kaizen circle.",
        "Audit weekly for the first month, monthly thereafter.",
        "Hand off the culture (not just the plan) to the process owner.",
      ],
      related_concepts: [
        "Statistical Process Control (SPC) (Lesson 1) — the chart signal that the Andon escalates.",
        "Control Plans & Standardization (Lesson 2) — the SOP/standard work that SDCA stabilizes.",
        "Analyze phase — PDCA is the post-DMAIC extension of Analyze's hypothesis-test cycle.",
        "Improve phase — the validated solution that becomes the new SDCA standard.",
        "Toyota Production System (Liker) — jidoka, Andon, standard work, heijunka; Kaizen (Imai) — PDCA/SDCA, the Gemba.",
      ],
      prerequisites: [
        "The Control plan and SOPs (Lesson 2) — the standard that SDCA locks in.",
        "The SPC chart and reaction plan (Lesson 1) — the sensor whose signals the Andon escalates.",
        "Conceptual familiarity with the Toyota Production System (jidoka, Andon, standard work — Liker) and Kaizen (Imai).",
        "The DMAIC charter's COPQ-recovery target — the sustainment metric on the tier-3 board.",
        "Basic meeting-facilitation and Gemba-walk skills (daily management cadence).",
      ],
      references: [
        "ASQ Six Sigma Black Belt Body of Knowledge — Control phase.",
        "ASQ Six Sigma Green Belt Body of Knowledge — Control phase.",
        "Montgomery (2013), Statistical Quality Control, Ch. 6.",
        "Breyfogle (2003), Implementing Six Sigma, Ch. 10, 43.",
        "Liker (2004), The Toyota Way, Principles 1, 5, 6, 8, 13, 14.",
        "Imai (1986), Kaizen, Parts I, II, III.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Continuous Improvement & Visual Management",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which of the following correctly names the five S's of 5S in canonical order?",
      whyCorrect:
        "The 5S system, derived from the Toyota Production System and codified by Hirano and Imai, comprises Sort (Seiri — separate the needed from the unneeded, red-tag and remove), Set in Order (Seiton — give every needed item a labeled home, use shadow-boards), Shine (Seiso — clean and inspect, make cleanliness an audit metric), Standardize (Seiketsu — post the 5S standard and the audit form at the gemba), Sustain (Shitsuke — audit, recognize, build the habit). The order is canonical: Sort must precede Set in Order (cannot organize clutter), Set in Order must precede Shine (cannot clean unorganized items), Shine must precede Standardize (cannot standardize an unmeasured state), Standardize must precede Sustain (cannot sustain without a standard).",
      whyOthersWrong: [
        "Option A (Sort, Shine, Set in Order, Standardize, Sustain) — Shine precedes Set in Order; you cannot clean what is not yet organized (the order is canonical).",
        "Option B (Sort, Set in Order, Standardize, Shine, Sustain) — Standardize precedes Shine; you cannot post a standard for a state you have not yet measured (Shine audits the Set-in-Order state).",
        "Option D (Sort, Set in Order, Shine, Sustain, Standardize) — Sustain precedes Standardize; you cannot sustain a habit that has not yet been standardized (the audit rubric must exist first).",
      ],
      explanation:
        "5S in canonical order: Sort → Set in Order → Shine → Standardize → Sustain. Each step builds on the prior — Sort before Set in Order, Set in Order before Shine, Shine before Standardize, Standardize before Sustain.",
      options: [
        { text: "Sort, Shine, Set in Order, Standardize, Sustain", isCorrect: false },
        { text: "Sort, Set in Order, Standardize, Shine, Sustain", isCorrect: false },
        { text: "Sort, Set in Order, Shine, Standardize, Sustain", isCorrect: true },
        { text: "Sort, Set in Order, Shine, Sustain, Standardize", isCorrect: false },
      ],
    },
    {
      competencyName: "Continuous Improvement & Visual Management",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Manufacturing",
      stem: "A downstream stamping cell consumes 200 blanks/day from an upstream blanking line. The replenishment lead time is 4 days. The container size (kanban) is 100 blanks. Compute the kanban card count and the WIP cap.",
      whyCorrect:
        "Kanban card count = ⌈(downstream demand × replenishment lead time) / container size⌉ = ⌈(200 × 4) / 100⌉ = ⌈800/100⌉ = ⌈8⌉ = 8 cards. The WIP cap = cards × container size = 8 × 100 = 800 blanks (maximum inventory between the two cells). This caps overproduction (the upstream cannot produce without an authorization card), exposes imbalance (a cell with empty slots is starved; a cell with full slots is overproducing), and ensures the downstream cell never stocks out during the 4-day replenishment lead time. The 8-card, 800-blank cap is the visual signal the tier-2 huddle reviews daily.",
      whyOthersWrong: [
        "Option A (2 cards, 200 blanks) — divides container size by demand (inverted the formula); also uses demand ÷ lead time instead of demand × lead time.",
        "Option B (4 cards, 400 blanks) — uses lead time (4 days) as the card count directly, ignoring demand and container size; the formula is not just lead-time-derived.",
        "Option D (16 cards, 1600 blanks) — doubles the lead time or the demand (likely 200 × 8 ÷ 100 = 16); the lead time is 4 days, not 8.",
      ],
      explanation:
        "Card count = ⌈(200 × 4)/100⌉ = 8 cards; WIP cap = 8 × 100 = 800 blanks. Overproduction is capped; the downstream cell is protected for the 4-day lead time.",
      options: [
        { text: "2 cards; WIP cap = 200 blanks", isCorrect: false },
        { text: "4 cards; WIP cap = 400 blanks", isCorrect: false },
        { text: "8 cards; WIP cap = 800 blanks", isCorrect: true },
        { text: "16 cards; WIP cap = 1,600 blanks", isCorrect: false },
      ],
    },
    {
      competencyName: "Continuous Improvement & Visual Management",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "DecisionMaking",
      skillType: "Procedural",
      scenario: "Manufacturing",
      stem: "An operator pulls the Andon cord (amber) at 10:00 because the X̄-R chart's WECO rule 4 has just fired (8 consecutive points above the centerline). The team leader arrives at 10:02, the process engineer at 10:08. Which SLA was breached, and what is the correct action?",
      whyCorrect:
        "The Andon SLA matrix specifies tier-1 (team leader) response ≤ 60 seconds and tier-2 (process engineer) ≤ 5 minutes from the pull. The team leader arrived at 10:02 (2 minutes = 120 s), breaching the 60-second tier-1 SLA. The process engineer arrived at 10:08 (8 minutes), breaching the 5-minute tier-2 SLA. Correct action: (1) the Andon should have auto-escalated to tier-2 at 60 s (because tier-1 did not respond) and to tier-3 at 5 min (because tier-2 did not respond); (2) the audit log records both SLA misses; (3) the root cause of the missed SLAs is investigated at the next tier-2 huddle (was the team leader on another call? was the process engineer paged correctly?); (4) corrective action is assigned (e.g., redundant paging, on-call rotation); (5) the WECO rule-4 signal itself is investigated as a separate issue (the 8-points-above-center pattern is a small sustained mean shift that needs root-causing per the OCAP).",
      whyOthersWrong: [
        "Option A ('No SLA breached; both responders arrived within 15 minutes') — wrong; the tier-1 SLA is 60 s, not 15 min (15 min is the tier-3 SLA). The 2-minute team-leader response breaches the 60-s tier-1 SLA.",
        "Option B ('Only the tier-1 SLA was breached; the tier-2 was met') — wrong; the process engineer arrived at 10:08 (8 minutes), breaching the 5-minute tier-2 SLA. Both SLAs were breached.",
        "Option C ('Both SLAs breached; the correct action is to discipline the responders') — wrong on the action; the responders are not disciplined — the SLA miss is a system signal (auto-escalation should have fired; the root cause of the miss is investigated at the next huddle). Hansei is reflection without blame (Imai); discipline is the anti-pattern.",
      ],
      explanation:
        "Tier-1 SLA = 60 s; team leader arrived at 2 min → breach. Tier-2 SLA = 5 min; process engineer arrived at 8 min → breach. Both SLAs were missed; the Andon should have auto-escalated; the audit log records both; the root cause is investigated at the next huddle (no blame).",
      options: [
        { text: "No SLA breached; both responders arrived within 15 minutes", isCorrect: false },
        { text: "Only the tier-1 SLA was breached; the tier-2 was met", isCorrect: false },
        { text: "Both the tier-1 (60 s) and tier-2 (5 min) SLAs were breached; the Andon should have auto-escalated; the audit log records both; root cause investigated at the next huddle (no blame)", isCorrect: true },
        { text: "Both SLAs breached; the correct action is to discipline the responders", isCorrect: false },
      ],
    },
    {
      competencyName: "Continuous Improvement & Visual Management",
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Manufacturing",
      stem: "True or False: Per Imai, the SDCA cycle (Standardize-Do-Check-Act) must precede the PDCA cycle (Plan-Do-Check-Act); without a documented standard, a Kaizen change cannot be measured and tampering becomes indistinguishable from improvement.",
      whyCorrect:
        "TRUE. Imai's Kaizen rests on the claim that improvement requires a baseline — without a documented standard, change cannot be measured. SDCA is the stabilization cycle (Standardize-Do-Check-Act) that locks in the current best-known method as the standard; PDCA is the improvement cycle (Plan-Do-Check-Act) that raises the standard. SDCA must precede PDCA: first lock in the standard (the SOP + standard work + control plan installed in Lesson 2), then run a PDCA cycle on a small change, measure the change against the locked-in standard, and — if the change validates — adopt the new method as the new standard (a new SDCA cycle begins). Without the standard, every operator works differently (no baseline); tampering (random adjustments to common-cause variation) is indistinguishable from improvement (deliberate changes to special-cause signals); and the chart's signal is uninterpretable. The DMAIC Control phase therefore exists to install the SDCA loop; the post-DMAIC culture runs SDCA + PDCA continuously.",
      whyOthersWrong: [
        "Option FALSE — would imply that improvement can proceed without a standard; this is the anti-pattern. Without a standard, there is no baseline against which to measure change, and the operator's tampering cannot be distinguished from deliberate improvement. The team must standardize first (SDCA), then improve (PDCA). Imai's claim is unambiguous.",
      ],
      explanation:
        "TRUE. SDCA (stabilize) precedes PDCA (improve). Without a documented standard, change is unmeasurable and tampering is indistinguishable from improvement (Imai). The DMAIC Control phase installs the SDCA loop; post-DMAIC culture runs SDCA + PDCA continuously.",
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Competencies — the 3 Control competencies (created in loadReference()).
// ---------------------------------------------------------------------------

interface SeedCompetency {
  name: string;
  description: string;
  order: number;
}

const SS_CONTROL_COMPETENCIES: SeedCompetency[] = [
  {
    name: "Statistical Process Control (SPC)",
    description:
      "Shewhart's two-cause model (common vs special cause); variable control charts (X̄-R for n=2-10, X̄-s for n≥10, I-MR for n=1); attribute control charts (p, np, c, u); the 3σ control limit and the ARL₀/ARL₁ trade-off; rational subgroups (within-subgroup common cause, between-subgroup special cause); the Western Electric zone rules (1-4) and Nelson rules (5-8) for small-shift detection; the reaction plan / OCAP triggered by every out-of-control signal; the Andon escalation; the link to process capability (σ̂_within = R̄/d2, Cp). The technical sensor of the Control phase.",
    order: 1,
  },
  {
    name: "Control Plans & Standardization",
    description:
      "The control plan matrix (six canonical fields: characteristic, specification, measurement method, sample size/frequency, control method, reaction plan); the PFMEA-to-control-plan linkage (high-RPN failure modes drive the rows); SOPs (step-by-step, gage-referenced, picture-illustrated, revision-controlled); standard work (TPS — cycle-time balanced to takt time, the platform for Kaizen); the OCAP decision tree (stop, contain, investigate, fix, restart, escalate); poka-yoke (mistake-proofing — prevention preferred over detection); the training package (100% coverage before hand-off); the audit cadence (daily gemba walk, weekly control-plan audit, monthly SOP review, quarterly benefits tracker); the project hand-off to the process owner with the benefits tracker running 6/12 months. The actuator that operationalizes the chart's signal.",
    order: 2,
  },
  {
    name: "Continuous Improvement & Visual Management",
    description:
      "Kaizen (Imai — continuous, incremental, worker-driven improvement); PDCA (Plan-Do-Check-Act, the improvement cycle) and SDCA (Standardize-Do-Check-Act, the stabilization cycle — SDCA precedes PDCA); 5S (Sort, Set in Order, Shine, Standardize, Sustain, 0-25 weekly audit); Kanban (visual pull system — card count = ⌈(demand × lead time) / container size⌉, WIP cap); Andon (visual + audible escalation, tier-1/2/3 SLAs of 60 s / 5 min / 15 min, the operator's right and obligation to pull the cord, jidoka — Liker Principle 5); tier huddles (operator, team leader, value-stream manager — 15 min each daily); the Kaizen suggestion system (≥ 1/operator/month, ≥ 70% implementation, monthly recognition); the audit cadence as institutional memory; hansei (relentless reflection without blame). The cultural engine that sustains the gains.",
    order: 3,
  },
];

// ---------------------------------------------------------------------------
// Lessons — array of the 3 Control RefLessons.
// ---------------------------------------------------------------------------

const SS_CONTROL_LESSONS: RefLesson[] = [
  LESSON_SPC,
  LESSON_CONTROL_PLAN,
  LESSON_CONTINUOUS_IMPROVEMENT,
];

// ---------------------------------------------------------------------------
// Loader — CONTENT-only (mirrors six-sigma-define.ts) with the additional
// step of creating the 3 Control competencies inside loadReference().
// ---------------------------------------------------------------------------

/**
 * Upsert the Six Sigma Control (C) phase CONTENT into the database.
 * Idempotent: safe to call repeatedly. Returns record counts written.
 *
 * Flow:
 *  1. Find Six Sigma certification by slug "six-sigma" (the structure+M/A
 *     content loader in src/lib/ref-content/six-sigma.ts is a prerequisite).
 *  2. Find the Control (C) domain by code "C" (certificationId = six-sigma.id).
 *     The C domain exists in six-sigma.ts with NO competencies — delete any
 *     stale C competencies and create the 3 C competencies from
 *     SS_CONTROL_COMPETENCIES. Map by NAME -> id. (Scope is restricted to
 *     the C domain — other Six Sigma domains D, M, A, I are NOT touched.)
 *  3. Upsert References globally (by title, no sectionId) → shared ids
 *     applied to every Control lesson, KO, and question.
 *  4. For each lesson:
 *     - db.lesson.findFirst({where:{competencyId, slug}}) then update or
 *       create with sectionId=null, certificationId, competencyId, slug,
 *       title, titleAr, order, durationMin, conceptIntroduction, example,
 *       keyFormulas, exercise, sections (JSON.stringify), referenceIds
 *       (JSON.stringify shared), status="READY", confidence="HIGH",
 *       verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
 *  5. Upsert KnowledgeObject per lesson: findFirst({where:{lessonId}}) then
 *     create/update with certificationId, domainId (C), competencyId,
 *     lessonId, body JSON, referenceIds (JSON shared), certificationIds
 *     (JSON [six-sigma.id]), status="READY", confidence="HIGH",
 *     verificationStatus="VERIFIED", version="1.0.0".
 *  6. Per lesson: deleteMany questions {certificationId, competencyId} then
 *     create each enriched question with nested QuestionOption records,
 *     knowledgeObjectId link, whyCorrect, whyOthersWrong (JSON),
 *     referenceIds (JSON shared), status="READY", verificationStatus=
 *     "VERIFIED", reviewStatus="PENDING", version="1.0.0".
 *  7. Return { certification, domain, competencies, lessons, kos,
 *      questions, references } counts.
 *
 * IMPORTANT: This loader does NOT call six-sigma.ts and does NOT wipe other
 * Six Sigma domains (D, M, A, I). It operates exclusively on the Control
 * (C) domain — only C competencies are deleted and re-created.
 */
export async function loadReference() {
  // 1) Certification (find by slug "six-sigma")
  const certification = await db.certification.findUnique({
    where: { slug: "six-sigma" },
  });
  if (!certification) {
    throw new Error(
      'Six Sigma certification not found. Run the Six Sigma structure+M/A-content loader (src/lib/ref-content/six-sigma.ts) first.'
    );
  }

  // 2) Find the Control (C) domain by code "C" (certificationId). The C
  //    domain exists in six-sigma.ts with NO competencies — delete any stale
  //    C competencies and create the 3 C competencies here.
  const controlDomain = await db.domain.findFirst({
    where: { certificationId: certification.id, code: "C" },
  });
  if (!controlDomain) {
    throw new Error(
      'Control (C) domain not found under Six Sigma. Run the Six Sigma structure+M/A-content loader (src/lib/ref-content/six-sigma.ts) first.'
    );
  }

  // Delete any existing C competencies (idempotent re-create). Scoped to
  // the C domain only — D, M, A, I competencies are NOT touched.
  await db.competency.deleteMany({
    where: { domainId: controlDomain.id },
  });

  // Create the 3 C competencies.
  for (const c of SS_CONTROL_COMPETENCIES) {
    await db.competency.create({
      data: {
        domainId: controlDomain.id,
        name: c.name,
        description: c.description,
        order: c.order,
      },
    });
  }

  // Map C competencies by NAME -> id.
  const controlCompetencies = await db.competency.findMany({
    where: { domainId: controlDomain.id },
  });
  const competencyIdByName: Record<string, string> = {};
  for (const c of controlCompetencies) {
    competencyIdByName[c.name] = c.id;
  }
  // Validate that all 3 expected C competencies exist by name.
  const expectedCompetencyNames = SS_CONTROL_LESSONS.map((l) => l.competencyName);
  const missing = expectedCompetencyNames.filter(
    (n) => !competencyIdByName[n]
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing Control competencies by name: ${missing.join(
        ", "
      )}. Ensure SS_CONTROL_COMPETENCIES matches SS_CONTROL_LESSONS competencyName.`
    );
  }

  // 3) References — global (no sectionId), upserted by title.
  const refIdsByTitle: Record<string, string> = {};
  for (const src of SS_CONTROL_SOURCES) {
    const existing = await db.reference.findFirst({
      where: { title: src.title },
    });
    const data = {
      sectionId: null,
      title: src.title,
      level: src.level,
      levelLabel: src.levelLabel,
      type: src.type,
      url: src.url ?? null,
      citation: src.citation,
    };
    if (existing) {
      await db.reference.update({ where: { id: existing.id }, data });
      refIdsByTitle[src.title] = existing.id;
    } else {
      const created = await db.reference.create({ data });
      refIdsByTitle[src.title] = created.id;
    }
  }
  const sharedReferenceIds = SS_CONTROL_SOURCES.map(
    (s) => refIdsByTitle[s.title]
  ).filter(Boolean) as string[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 4) Lessons, 5) KnowledgeObjects, 6) Questions
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of SS_CONTROL_LESSONS) {
    const competencyId = competencyIdByName[lesson.competencyName];
    if (!competencyId) {
      // Already validated above; defensive guard for TS.
      throw new Error(
        `Competency not found for lesson ${lesson.slug}: ${lesson.competencyName}`
      );
    }

    // Derive legacy fields from the 24-section content (with fallbacks).
    const conceptIntroduction =
      lesson.conceptIntroduction ??
      lesson.sections.learning_objectives ??
      "";
    const example = lesson.example ?? lesson.sections.worked_example ?? null;
    const keyFormulas =
      lesson.keyFormulas ?? lesson.sections.formula_calculation ?? null;
    const exercise =
      lesson.exercise ?? lesson.sections.practice_questions ?? null;

    const sectionsJson = JSON.stringify(lesson.sections);

    // 4) Lesson — findFirst by (competencyId, slug) then update or create
    //    (sectionId is null on the certification track).
    const existingLesson = await db.lesson.findFirst({
      where: { competencyId, slug: lesson.slug },
    });
    const lessonData = {
      sectionId: null,
      certificationId: certification.id,
      competencyId,
      slug: lesson.slug,
      title: lesson.title,
      titleAr: lesson.titleAr ?? null,
      order: lesson.order,
      durationMin: lesson.durationMin,
      conceptIntroduction,
      example,
      keyFormulas,
      exercise,
      sections: sectionsJson,
      referenceIds: sharedReferenceIdsJson,
      sharedAcrossCerts: false,
      status: "READY",
      confidence: "HIGH",
      verificationStatus: "VERIFIED",
      version: "1.0.0",
      lastReviewedAt: new Date(),
    };
    let lessonId: string;
    if (existingLesson) {
      const updated = await db.lesson.update({
        where: { id: existingLesson.id },
        data: lessonData,
      });
      lessonId = updated.id;
    } else {
      const created = await db.lesson.create({ data: lessonData });
      lessonId = created.id;
    }
    lessonsCount += 1;

    // 5) KnowledgeObject — findFirst by lessonId, then update or create.
    const ko = lesson.knowledgeObject;
    const koBodyJson = JSON.stringify(ko.body);
    const existingKO = await db.knowledgeObject.findFirst({
      where: { lessonId },
    });
    const koData = {
      certificationId: certification.id,
      domainId: controlDomain.id,
      competencyId,
      lessonId,
      title: ko.title,
      domain: ko.domain,
      competency: ko.competency,
      topic: ko.topic,
      concept: ko.concept,
      body: koBodyJson,
      version: "1.0.0",
      confidence: "HIGH",
      verificationStatus: "VERIFIED",
      status: "READY",
      referenceIds: sharedReferenceIdsJson,
      certificationIds: JSON.stringify([certification.id]),
    };
    let koId: string;
    if (existingKO) {
      const updated = await db.knowledgeObject.update({
        where: { id: existingKO.id },
        data: koData,
      });
      koId = updated.id;
    } else {
      const created = await db.knowledgeObject.create({ data: koData });
      koId = created.id;
    }
    kosCount += 1;

    // 6) Questions — delete existing for this competency (scoped), then
    //    create each enriched question with nested options.
    await db.question.deleteMany({
      where: { certificationId: certification.id, competencyId },
    });

    for (const q of lesson.questions) {
      await db.question.create({
        data: {
          certificationId: certification.id,
          domainId: controlDomain.id,
          competencyId,
          lessonId,
          knowledgeObjectId: koId,
          type: q.type,
          difficulty: q.difficulty,
          bloomLevel: q.bloomLevel,
          cognitiveLevel: q.cognitiveLevel,
          skillType: q.skillType ?? null,
          scenario: q.scenario ?? null,
          industry: q.scenario ?? null,
          language: "en",
          stem: q.stem,
          explanation: q.explanation ?? null,
          whyCorrect: q.whyCorrect,
          whyOthersWrong: JSON.stringify(q.whyOthersWrong),
          referenceIds: sharedReferenceIdsJson,
          status: "READY",
          verificationStatus: "VERIFIED",
          reviewStatus: "PENDING",
          version: "1.0.0",
          options: {
            create: q.options.map((opt, i) => ({
              text: opt.text,
              isCorrect: opt.isCorrect,
              order: i,
            })),
          },
        },
      });
      questionsCount += 1;
    }
  }

  return {
    certification: certification.id,
    domain: controlDomain.id,
    competencies: controlCompetencies.length,
    lessons: lessonsCount,
    kos: kosCount,
    questions: questionsCount,
    references: referencesCount,
  };
}
