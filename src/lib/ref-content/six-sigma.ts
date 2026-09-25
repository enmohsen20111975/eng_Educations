// =============================================================================
// Six Sigma (ASQ/IASSC — Yellow/Green/Black Belt) — Combined structure +
// content loader (Task ID 16-SS).
//
// This single loader does BOTH:
//   (A) Certification STRUCTURE — the 5 DMAIC phases (Define, Measure,
//       Analyze, Improve, Control) as BOK domains, with the Measure (M)
//       and Analyze (A) domains fully populated with competencies. The
//       other three phases (D, I, C) are seeded as structure-only domains
//       (no competencies) pending follow-up pillar loaders.
//   (B) Deep scientific CONTENT — 3 full-spec (24-section) lessons, each
//       on a distinct Measure/Analyze competency, plus Knowledge Objects
//       and 12 enriched questions (4 per lesson). Mirrors cre.ts and
//       pmp.ts combined-loader pattern.
//
// NOTE on exam weights: ASQ publishes per-domain % weights for the CSSGB
// (Green Belt) and CSSBB (Black Belt) exams. Weights below are placeholders
// flagged verificationStatus = "REQUIRES_RESEARCH" until the official ASQ
// BOK %s are loaded. The 5-phase DMAIC structure itself is the published
// ASQ Six Sigma BOK (per ASQ "Six Sigma Black Belt Certification — BOK").
//
// Source hierarchy (spec §5) — Levels 3, 6, 7:
//   - LEVEL 3 — Official BOK / Handbook / Exam Outline: ASQ Six Sigma
//     Black Belt BOK; ASQ Six Sigma Green Belt BOK.
//   - LEVEL 6 — University / Academic Publications: Douglas C. Montgomery,
//     "Statistical Quality Control" (Wiley); Douglas C. Montgomery,
//     "Design and Analysis of Experiments" (Wiley).
//   - LEVEL 7 — Technical Publications / Industry Sources: Forrest W.
//     Breyfogle III, "Implementing Six Sigma" (Wiley); Peter S. Pande,
//     "The Six Sigma Way" (McGraw-Hill).
//
// Originality (spec §16): all worked examples, decision scenarios, case
// studies, and questions are authored for this platform; textbook material
// is summarized and cited, not reproduced. Case studies are SYNTHETIC and
// explicitly marked `CASE_TYPE = SYNTHETIC` inside the lesson text.
//
// Lifecycle: every record (Lesson, KnowledgeObject, Question, Reference)
// is upserted with status="READY", confidence="HIGH",
// verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
// =============================================================================

import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// Public types (mirror cre.ts / pmp.ts)
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
  scenario?: string; // Manufacturing|Oil & Gas|Power|Chemical|Aerospace|...
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
// SIX SIGMA STRUCTURE — 5 DMAIC BOK domains (Define, Measure, Analyze,
// Improve, Control). The Measure (M) and Analyze (A) domains carry
// competencies; D, I, C are seeded structure-only for follow-up pillars.
// ---------------------------------------------------------------------------

interface SeedCompetency {
  code?: string;
  name: string;
  description: string;
  order: number;
}
interface SeedDomain {
  code: string;
  name: string;
  weight: number; // approximate % (REQUIRES_RESEARCH)
  description: string;
  competencies: SeedCompetency[];
}

const SIX_SIGMA_DOMAINS: SeedDomain[] = [
  {
    code: "D",
    name: "Define",
    weight: 0,
    description:
      "Project selection, charter, scope, VOC (Voice of the Customer), SIPOC, stakeholder analysis, problem statement, team formation, and project hand-off. The Define phase answers the question: what problem are we solving, for whom, and by when?",
    competencies: [],
  },
  {
    code: "M",
    name: "Measure",
    weight: 0,
    description:
      "Data collection plans, operational definitions, measurement system analysis (MSA / Gage R&R), process capability (Cp/Cpk, Pp/Ppk, sigma level, DPMO), and descriptive statistics (mean, median, variance, distribution shape). The Measure phase quantifies the current state and the gap to entitlement.",
    competencies: [
      {
        name: "Data Collection Plans",
        description:
          "Operational definitions, data types (attribute vs variable), sampling strategy (random, stratified, systematic), sample-size determination, check-sheets, and the data-collection plan template (what, who, where, when, how, why).",
        order: 1,
      },
      {
        name: "Measurement System Analysis (MSA)",
        description:
          "Gage R&R (repeatability & reproducibility), % study variation, distinct categories, linearity and bias studies, attribute agreement analysis for go/no-go gages, and the rule that measurement error must be < 10% of tolerance before capability is computed.",
        order: 2,
      },
      {
        name: "Process Capability (Cp/Cpk)",
        description:
          "Cp, Cpk (short-term within-subgroup), Pp, Ppk (long-term overall), sigma level, DPMO, the 1.5σ shift, normality assumption, transformations (Box-Cox) and non-normal capability (Ppk with Johnson / Pearson fitting).",
        order: 3,
      },
      {
        name: "Descriptive Statistics",
        description:
          "Measures of central tendency (mean, median, mode), dispersion (range, variance, std dev, IQR), shape (skewness, kurtosis), graphical tools (histogram, box plot, dot plot, run chart, Pareto), and the normal distribution as a reference model.",
        order: 4,
      },
    ],
  },
  {
    code: "A",
    name: "Analyze",
    weight: 0,
    description:
      "Root cause analysis (5-Why, fishbone, FMEA), hypothesis testing (t-tests, chi-square, ANOVA), regression and correlation (Pearson r, simple linear, R², residuals), and the linkage to FMEA. The Analyze phase turns data into the vital few X drivers of Y.",
    competencies: [
      {
        name: "Root Cause Analysis",
        description:
          "5-Why, fishbone (Ishikawa) diagram with 6M categories (Man, Machine, Method, Material, Measurement, Environment), fault-tree analysis, FMEA (RPN with severity/occurrence/detection), and the relationship between statistical hypothesis tests and RCA evidence.",
        order: 1,
      },
      {
        name: "Hypothesis Testing",
        description:
          "Null and alternative hypotheses, type I (α) and type II (β) errors, p-value interpretation, one-sample and two-sample t-tests, chi-square tests of association and variance, F-test, and the link between confidence intervals and hypothesis tests.",
        order: 2,
      },
      {
        name: "Regression & Correlation",
        description:
          "Pearson correlation coefficient r, simple linear regression y = b0 + b1·x, coefficient of determination R², residual analysis (normality, homoscedasticity, independence), correlation vs causation, and the bridge to multiple regression and DOE.",
        order: 3,
      },
      {
        name: "ANOVA & FMEA",
        description:
          "One-way ANOVA, F-statistic, partitioning of variance (SST = SSTR + SSE), post-hoc tests (Tukey HSD), and the integration of ANOVA findings into FMEA risk prioritization via RPN reprioritization after improvement actions.",
        order: 4,
      },
    ],
  },
  {
    code: "I",
    name: "Improve",
    weight: 0,
    description:
      "Design of Experiments (DOE — full/fractional factorial, response surface), pilot implementation, mistake-proofing (poka-yoke), solution selection (Pugh matrix, theory of constraints), and the implementation plan. The Improve phase designs and validates the solution.",
    competencies: [],
  },
  {
    code: "C",
    name: "Control",
    weight: 0,
    description:
      "Statistical Process Control (SPC — X-bar/R, I-MR, p, np, c, u charts), control plan, standard operating procedures (SOP), visual management, mistake-proofing sustainment, and project hand-off to process owner. The Control phase locks in the gains.",
    competencies: [],
  },
];

// ---------------------------------------------------------------------------
// SOURCES — 6 real references cited across all 3 lessons.
// ---------------------------------------------------------------------------

export const SIX_SIGMA_SOURCES: RefSource[] = [
  {
    title: "ASQ Six Sigma Black Belt Body of Knowledge",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "BOK",
    url: "https://asq.org/cert/six-sigma-black-belt",
    citation:
      "American Society for Quality (ASQ). Six Sigma Black Belt (CSSBB) Body of Knowledge — the official ASQ competency framework assessed by the CSSBB exam, organized across the DMAIC phases (Define, Measure, Analyze, Improve, Control) plus Design for Six Sigma (DFSS). Anchors organizational-process management, project management, team dynamics, data collection, measurement-systems analysis, capability analysis, hypothesis testing, ANOVA, regression, DOE, statistical process control, and the project-control plan.",
  },
  {
    title: "ASQ Six Sigma Green Belt Body of Knowledge",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "BOK",
    url: "https://asq.org/cert/six-sigma-green-belt",
    citation:
      "American Society for Quality (ASQ). Six Sigma Green Belt (CSSGB) Body of Knowledge — the official ASQ competency framework for the CSSGB exam, scoped to the DMAIC phases at the Green Belt level: project selection, basic statistics, MSA, capability, hypothesis testing, simple regression, and SPC. Green Belts support Black Belts and lead smaller-scope DMAIC projects within their home process.",
  },
  {
    title: "Montgomery — Statistical Quality Control (Wiley)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Montgomery, D. C. (2013). Statistical Quality Control: A Modern Introduction (7th ed.). Hoboken, NJ: John Wiley & Sons. ISBN 978-1-118-14681-1. The canonical academic reference for SPC (X-bar/R, I-MR, p, np, c, u charts), process capability (Cp, Cpk, Pp, Ppk), the 1.5σ shift and DPMO tables, measurement-systems analysis (gage R&R), and hypothesis testing for quality. The bridge between descriptive statistics, inferential tests, and the control-plan deliverable in the Control phase.",
  },
  {
    title: "Montgomery — Design and Analysis of Experiments (Wiley)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Montgomery, D. C. (2019). Design and Analysis of Experiments (10th ed.). Hoboken, NJ: John Wiley & Sons. ISBN 978-1-119-59151-4. The canonical academic reference for DOE — full and fractional factorial designs, response-surface methodology (RSM), central composite designs, blocking, randomization, replication, ANOVA partitioning of variance, and regression of the response surface. The Improve-phase foundation that turns Analyze-phase correlations into designed causal experiments.",
  },
  {
    title: "Breyfogle — Implementing Six Sigma (Wiley)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Breyfogle, F. W. (2003). Implementing Six Sigma: Smarter Solutions Using Statistical Methods (2nd ed.). Hoboken, NJ: John Wiley & Sons. ISBN 978-0-471-26572-6. The practitioner reference that integrates the DMAIC phases with the statistical toolbox — measurement-systems analysis (basic and extended gage R&R), process capability (Cp/Cpk/Pp/Ppk with the 1.5σ shift and DPMO conversion), hypothesis tests, regression, DOE, SPC, and the project-deliverables sequence (charter, SIPOC, MSA, capability, root-cause, pilot, control plan).",
  },
  {
    title: "Pande — The Six Sigma Way (McGraw-Hill)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Pande, P. S., Neuman, R. P., & Cavanagh, R. R. (2014). The Six Sigma Way: How GE, Motorola, and Other Top Companies are Honing Their Performance (2nd ed.). New York: McGraw-Hill. ISBN 978-0-07-184904-3. The leadership-and-method reference that frames DMAIC for executives and Green Belts — project selection, ROI and project prioritization, the 1.5σ shift's historical Motorola context, DPMO entitlement thinking, the change-management arc (charter → measure → analyze → improve → control → hand-off), and the integration of Six Sigma with Lean and operational excellence.",
  },
];

const SS_REFERENCE_TITLES = SIX_SIGMA_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Lesson 1 — Process Capability (Cp/Cpk)
// (Competency: "Process Capability (Cp/Cpk)"; slug: ss-process-capability)
// ---------------------------------------------------------------------------

const LESSON_PROCESS_CAPABILITY: RefLesson = {
  competencyName: "Process Capability (Cp/Cpk)",
  slug: "ss-process-capability",
  title: "Process Capability — Cp, Cpk, Pp, Ppk & Sigma Level",
  titleAr: "قدرة العملية — Cp وCpk وPp وPpk ومستوى سيغما",
  order: 1,
  durationMin: 34,
  references: SS_REFERENCE_TITLES,
  conceptIntroduction: `Process capability quantifies how well a stable, in-control process meets specification. The Six Sigma BOK distinguishes short-term (within-subgroup) capability indices — Cp and Cpk — computed from the within-subgroup standard deviation σ̂_within (typically from the average range d2·R̄), from long-term (overall) performance indices — Pp and Ppk — computed from the overall standard deviation s (the simple standard deviation across all observations). Cp measures potential capability assuming a centered mean (Cp = (USL−LSL)/(6σ̂_within)); Cpk measures actual capability accounting for mean offset (Cpk = min((USL−μ),(μ−LSL))/(3σ̂_within)). The Motorola 1.5σ shift is the empirical observation that long-term performance is approximately 1.5σ worse than short-term because of drift, setup changes, and operator variability, so a short-term 6σ process delivers 3.4 DPMO long-term, not 0.002 DPMO. Sigma level (short-term, centered) = 3 × Cp; with the 1.5σ shift applied, the long-term DPMO follows the standard Six Sigma table (6σ→3.4, 5σ→233, 4σ→6,210, 3σ→66,807).`,
  example: `A CNC grinding operation on shaft diameter has USL = 10.5 mm, LSL = 9.5 mm, μ = 10.0 mm (centered), σ̂_within = 0.10 mm. Cp = (10.5−9.5)/(6×0.10) = 1.0/0.60 = 1.67. Cpu = (10.5−10.0)/(3×0.10) = 1.67; Cpl = (10.0−9.5)/(3×0.10) = 1.67; Cpk = min(1.67, 1.67) = 1.67. Short-term sigma level = 3 × Cp = 3 × 1.67 = 5.0 (5σ process). With the 1.5σ shift, long-term DPMO ≈ 233 per million (per the standard Six Sigma conversion table). If the mean drifts to 10.05 mm while σ̂_within stays 0.10, Cpu = (10.5−10.05)/0.30 = 1.50 and Cpl = (10.05−9.5)/0.30 = 1.83, so Cpk drops to 1.50 — a 0.17-point capability loss from a 0.5σ mean shift.`,
  keyFormulas: `Cp = (USL − LSL) / (6 · σ̂_within)        — potential capability (centered)
Cpu = (USL − μ) / (3 · σ̂_within);  Cpl = (μ − LSL) / (3 · σ̂_within)
Cpk = min(Cpu, Cpl)                          — actual capability (offset)
Pp = (USL − LSL) / (6 · s);  Ppk = min((USL−μ),(μ−LSL)) / (3·s)   — long-term
σ̂_within = R̄ / d2   (from X̄/R chart, d2 from sub-group-size table)
Sigma level (short-term, centered) = 3 × Cp
Sigma level (long-term, with 1.5σ shift) = 3 × Cp − 1.5
DPMO = defects / (opportunities × units) × 1,000,000
P(defect | centered, no shift) = 2·Φ(−3·Cp)              — normal model
P(defect | 1.5σ shift) = Φ(−(3·Cp − 1.5)) + Φ(−(3·Cp + 1.5))  — Motorola table
%Gage R&R rule: capability is meaningful only when %R&R < 10% of tolerance`,
  exercise: `You are a Green Belt on a plastic-injection-molding cell. The customer spec for part weight is 50.0 ± 1.5 g (USL = 51.5, LSL = 48.5). The X̄/R chart (subgroup n=5, 25 subgroups) shows the process in control with μ = 50.1 g, R̄ = 1.8 g. (a) Compute σ̂_within from R̄/d2 (d2 for n=5 is 2.326). (b) Compute Cp, Cpu, Cpl, Cpk. (c) State the short-term sigma level and the expected long-term DPMO with the 1.5σ shift. (d) If the customer demands Cpk ≥ 1.33, does the process pass? If not, by how much must σ̂_within be reduced?`,
  sections: {
    learning_objectives: `- Define Cp, Cpk, Pp, Ppk and the difference between short-term within-subgroup and long-term overall indices.
- Compute Cp and Cpk from USL, LSL, μ, and σ̂_within; compute Pp and Ppk from the overall standard deviation s.
- Convert capability indices to sigma level (short-term = 3·Cp; long-term = 3·Cp − 1.5) and to DPMO using the Motorola 1.5σ-shift table.
- State the Motorola 1.5σ-shift rationale and explain why a "6σ process" actually delivers 3.4 DPMO, not 0.002 DPMO.
- Distinguish process capability (a stable-process, in-control concept) from process performance (an out-of-control acceptable concept).
- Recognize that capability indices are meaningless until the measurement system passes %R&R < 10% of tolerance and the process is in statistical control.`,
    prerequisites: `- The DMAIC framework and the position of Measure within it.
- Descriptive statistics: mean, median, variance, standard deviation, percentiles, IQR.
- The normal distribution: standard normal Z, Φ(z), 68-95-99.7 rule.
- Statistical Process Control basics: X̄/R chart, in-control vs out-of-control, common-cause vs special-cause variation, the role of d2 in σ̂_within = R̄/d2.
- Measurement Systems Analysis (Gage R&R) at the conceptual level.`,
    introduction: `Process capability is the engineering answer to "is this process good enough to ship against this specification?" The Six Sigma BOK answers it with a small family of indices — Cp, Cpk, Pp, Ppk — together with the sigma-level and DPMO conversions that anchor the Motorola 1.5σ shift.

The distinction between capability and performance is foundational. Capability indices (Cp, Cpk) assume the process is in statistical control and use within-subgroup variation σ̂_within; they describe what the process can do at its best, when only common-cause variation is present. Performance indices (Pp, Ppk) use the overall standard deviation s across all data, including any between-subgroup drift; they describe what the process actually delivered over the study period. A common Green Belt mistake is to compute Ppk from a process known to be out of control and call it Cpk — this conflates the two and overstates capability.

Cp = (USL−LSL)/(6σ̂_within) is the centered, potential index — what the process could deliver if the mean were on target. Cpk = min(Cpu, Cpl) is the actual index, accounting for the mean offset. The ratio Cpk/Cp is a direct measure of centering: Cpk/Cp = 1.0 means the mean is on target; Cpk/Cp = 0.8 means 20% of the available tolerance is consumed by mean offset.

The Motorola 1.5σ shift is the empirical observation, due to Bill Smith at Motorola in the 1980s, that long-term process performance degrades by roughly 1.5σ relative to short-term. This empirical constant converts the short-term sigma level (3·Cp) into a long-term sigma level (3·Cp − 1.5), and the standard Six Sigma DPMO table follows: a short-term 6σ process delivers 3.4 DPMO long-term, a 5σ process delivers 233, a 4σ process delivers 6,210, and a 3σ process delivers 66,807. "Six Sigma" as a corporate target is named for the short-term 6σ level — i.e., Cp ≈ 2.0 with Cpk ≥ 1.5 — which, after the 1.5σ shift, delivers 3.4 DPMO.

The non-negotiable preconditions for capability analysis are (i) the measurement system passes %R&R < 10% of tolerance (else the σ you compute is mostly measurement noise) and (ii) the process is in statistical control (else you are computing a meaningless number on a moving target). Breyfogle (2003) calls this the "capability pre-flight" — never skip it.`,
    terminology: `- **Cp (Process Capability, centered)**: (USL−LSL)/(6σ̂_within) — potential capability, assumes centered mean.
- **Cpk (Process Capability Index)**: min((USL−μ),(μ−LSL))/(3σ̂_within) — actual capability, accounts for mean offset.
- **Pp (Process Performance, centered)**: (USL−LSL)/(6s) — long-term potential, uses overall std dev s.
- **Ppk (Process Performance Index)**: min((USL−μ),(μ−LSL))/(3s) — long-term actual.
- **USL/LSL**: upper / lower specification limit (the customer's tolerance band).
- **μ (mu)**: process mean (estimated by X̄, the grand average from the X̄/R chart).
- **σ̂_within**: within-subgroup standard deviation, estimated as R̄/d2 from an in-control X̄/R chart.
- **s**: overall standard deviation (square root of the unbiased sample variance across all observations).
- **Cpu/Cpl**: one-sided upper/lower capability, = (USL−μ)/(3σ̂_within) and (μ−LSL)/(3σ̂_within).
- **Sigma level**: short-term = 3·Cp; long-term (with 1.5σ shift) = 3·Cp − 1.5.
- **DPMO**: defects per million opportunities = (defects / (opportunities × units)) × 10⁶.
- **1.5σ shift**: the Motorola empirical offset between short-term (within-subgroup) and long-term (overall) performance, attributed to setup, drift, and operator variability.
- **Entitlement**: the best-observed short-term performance — the upper bound the team aims to make the long-term steady-state.
- **%R&R**: measurement-system variation as a % of tolerance (must be < 10% before capability is computed).`,
    detailed_explanation: `The Cp/Cpk/Pp/Ppk family rests on a single assumption: the underlying quality characteristic is normally distributed, in statistical control, and measured by a system with negligible error relative to tolerance. Breyfogle (2003) and Montgomery (SQC, 2013) emphasize that this is a four-step pre-flight, not a calculation: (1) verify the measurement system; (2) verify statistical control; (3) verify normality (or transform); (4) only then compute the indices.

Cp = (USL−LSL)/(6σ̂_within) is a "potential" index — it tells you how wide the specification is relative to a 6σ̂ spread of process variation. The "6σ" in the denominator is the natural spread of a centered normal process (6σ̂ covers 99.73% of the population per the 68-95-99.7 rule). If Cp = 1.0 the specification exactly contains ±3σ̂ — a process that, by historical AT&T/Mil-Std-105 conventions, is "just capable." Cp = 1.33 (4σ) is the historic acceptance threshold; Cp = 2.0 (6σ) is the Six Sigma target.

Cpk adjusts for mean offset. Cpu = (USL−μ)/(3σ̂_within), Cpl = (μ−LSL)/(3σ̂_within), Cpk = min(Cpu, Cpl). The closer the mean to one spec limit, the lower Cpk. A process can have Cp = 2.0 (centered, plenty of width) but Cpk = 1.0 if the mean sits 1.5σ off-center — the ratio Cpk/Cp = 0.5 quantifies the loss to mean offset. The "sigma level" of a process is conventionally reported as the short-term, centered value 3·Cp; long-term, the 1.5σ shift subtracts 1.5, giving the long-term sigma level = 3·Cpk (when Cpk < Cp) — though the strict Motorola convention applies the 1.5σ shift to the centered 3·Cp value.

The 1.5σ shift has been challenged in the academic literature (Montgomery SQC cautions that the empirical magnitude varies by process class) but is retained in the ASQ BOK as the de-facto standard convention. Its operational meaning: a short-term 6σ process is the long-term target because, after the shift, it still delivers 3.4 DPMO — the "Six Sigma" entitlement.

DPMO conversion is the bridge to the customer-facing defect rate. For a centered, normal, in-control process at short-term sigma level k, P(defect) = 2·Φ(−k) (the two-tail). For the long-term-with-shift case, P(defect) = Φ(−(k − 1.5)) + Φ(−(k + 1.5)); for k = 6, this gives Φ(−4.5) + Φ(−7.5) ≈ 3.4 × 10⁻⁶ + negligible ≈ 3.4 DPMO; for k = 5, Φ(−3.5) + Φ(−6.5) ≈ 2.33 × 10⁻⁴ ≈ 233 DPMO; for k = 4, Φ(−2.5) + Φ(−5.5) ≈ 6.21 × 10⁻³ ≈ 6,210 DPMO; for k = 3, Φ(−1.5) + Φ(−4.5) ≈ 6.68 × 10⁻² ≈ 66,807 DPMO. These four points are the "Six Sigma table" every Green Belt memorizes.

Pp/Ppk use the overall s rather than σ̂_within. When the process is in control and no between-subgroup drift exists, s ≈ σ̂_within and Pp ≈ Cp. The gap (Pp < Cp, Ppk < Cpk) is the empirical size of the drift — and is the quantification of the 1.5σ shift for the specific process. Breyfogle (2003) recommends reporting both pairs so leadership sees the within-to-overall gap and the entitlement-to-actual gap at once.

Non-normal capability: if the Anderson-Darling normality test rejects normality at α = 0.05, the BOK prescribes either (a) a Box-Cox transformation to normality (then compute Cp/Cpk on the transformed data and back-transform the spec limits), or (b) a Pearson-family or Johnson-family fit with capability computed from the fitted percentiles (Cp = (USL−LSL)/(P_99.865 − P_0.135), Cpk = min((USL−P_50)/((P_99.865−P_50)/3), (P_50−LSL)/((P_50−P_0.135)/3))). Attribute (go/no-go) capability uses the binomial — DPMO is the natural index, and Cp/Cpk do not apply.`,
    core_principles: `- Capability ≠ Performance. Cp/Cpk use within-subgroup σ̂; Pp/Ppk use overall s.
- The 1.5σ shift is an empirical Motorola convention, retained by the ASQ BOK, converting short-term 6σ to long-term 3.4 DPMO.
- The 4-step pre-flight is non-negotiable: MSA %R&R < 10% → statistical control → normality/transform → capability.
- Sigma level (short-term, centered) = 3 × Cp; long-term = 3 × Cp − 1.5.
- The four DPMO reference points: 6σ=3.4, 5σ=233, 4σ=6,210, 3σ=66,807.
- Cpk/Cp = centering ratio. Cpk = Cp → mean on target; Cpk = 0.5·Cp → mean offset consumes half the tolerance band.
- Cp ≥ 2.0 (short-term) is the "Six Sigma process" target — yields Cpk ≥ 1.5 and ~3.4 DPMO long-term.`,
    components: `- Specification limits (USL, LSL) — customer-defined tolerance band.
- Target (T) — the nominal, often the midpoint (USL+LSL)/2; sometimes asymmetric to a different design intent.
- Process mean μ (grand average X̄) and within-subgroup σ̂_within from R̄/d2.
- Overall standard deviation s (the long-term dispersion, includes drift).
- X̄/R (or X̄/s) control chart — the in-control evidence required before capability is computed.
- MSA / Gage R&R study — the measurement-system evidence required before σ̂ is trusted.
- Normality test (Anderson-Darling) + transformation (Box-Cox) — distributional evidence.
- DPMO table (Motorola 1.5σ shift) — the conversion from sigma level to defect rate.
- Process-baseline vs entitlement — the gap the Improve phase aims to close.`,
    process: `1. Verify the measurement system: conduct a Gage R&R study; require %R&R < 10% of tolerance (10–30% is conditionally acceptable, > 30% is unacceptable — fix the gage first).
2. Collect data in rational subgroups (e.g., n = 5 every 30 minutes for 25 subgroups); plot X̄/R; verify in-control (no Western Electric rule violations).
3. Estimate σ̂_within = R̄/d2 (d2 from the d2 table for the subgroup size); separately compute the overall s across all 125 observations.
4. Test normality (Anderson-Darling); if p < 0.05 apply Box-Cox or use a non-normal Pearson/Johnson fit.
5. Compute Cp = (USL−LSL)/(6σ̂_within) and Cpk = min(Cpu, Cpl) using the in-control σ̂_within.
6. Compute Pp and Ppk using s; the gap (Pp − Cp) quantifies long-term drift.
7. Convert to sigma level (3·Cp short-term, 3·Cp − 1.5 long-term) and to DPMO via the Motorola table.
8. Report Cp, Cpk, Pp, Ppk, sigma level, DPMO, %R&R, normality p-value, in-control status — a complete capability statement, not a single number.`,
    formula_calculation: `Variables:
- USL, LSL: upper/lower spec limits [same units as the measurement]
- T = (USL+LSL)/2: target (midpoint) [same units]
- μ: process mean (X̄) [same units]
- σ̂_within: within-subgroup std dev, = R̄/d2 [same units]
- s: overall std dev [same units]
- Cp, Cpk, Pp, Ppk: dimensionless indices
- k: short-term sigma level, = 3·Cp [dimensionless, in units of σ]
- DPMO: defects per million opportunities [defects per 10⁶ units]

Formulas (normal, centered-or-offset model):
- Cp = (USL − LSL) / (6·σ̂_within)
- Cpu = (USL − μ) / (3·σ̂_within);  Cpl = (μ − LSL) / (3·σ̂_within)
- Cpk = min(Cpu, Cpl)
- Pp = (USL − LSL) / (6·s);  Ppk = min((USL−μ),(μ−LSL)) / (3·s)
- σ̂_within = R̄ / d2 (d2 table by subgroup size n; e.g., d2 = 2.326 for n=5, 2.059 for n=4, 2.704 for n=6)
- Sigma level (short-term, centered) = 3·Cp
- Sigma level (long-term, with 1.5σ shift) = 3·Cp − 1.5
- DPMO (centered, no shift) = 2·Φ(−3·Cp) × 10⁶
- DPMO (long-term, 1.5σ shift) = [Φ(−(3·Cp − 1.5)) + Φ(−(3·Cp + 1.5))] × 10⁶
- Centering ratio = Cpk / Cp

Units: dimensions of the measurement (e.g., mm, g, °C) cancel in the ratios; indices and sigma level and DPMO are dimensionless.

Assumptions: (i) measurement system %R&R < 10% of tolerance; (ii) process in statistical control (in-control X̄/R chart, no special-cause signals); (iii) underlying distribution is normal (else transform or use Pearson/Johnson); (iv) rational subgroups, stable process window; (v) the 1.5σ shift is an empirical Motorola convention, magnitude varies by process class.

Interpretation: Cp = 1.0 ⇒ spec band = ±3σ̂ ("just capable"); Cp = 1.33 ⇒ 4σ process (historic acceptance); Cp = 1.67 ⇒ 5σ process (233 DPMO long-term); Cp = 2.0 ⇒ 6σ process (3.4 DPMO long-term, "Six Sigma target"). Cpk < Cp ⇒ mean is off-target; report both. Ppk < Cpk ⇒ long-term drift; report the gap to leadership as the entitlement-to-actual opportunity.`,
    worked_example: `**CNC grinding of shaft diameter (variable, normal, in control).**
Given: USL = 10.5 mm, LSL = 9.5 mm, target T = 10.0 mm; μ = 10.0 mm (centered on target); σ̂_within = 0.10 mm (from a 25-subgroup X̄/R chart with R̄ = 0.2326 mm and d2 = 2.326 for n = 5); process is in statistical control; Gage R&R %R&R = 6.3% (acceptable); Anderson-Darling normality p = 0.31 (do not reject).

Compute short-term capability:
- Cp = (USL − LSL) / (6·σ̂_within) = (10.5 − 9.5) / (6 × 0.10) = 1.0 / 0.60 = 1.6667 ≈ 1.67
- Cpu = (USL − μ) / (3·σ̂_within) = (10.5 − 10.0) / 0.30 = 0.50 / 0.30 = 1.6667
- Cpl = (μ − LSL) / (3·σ̂_within) = (10.0 − 9.5) / 0.30 = 0.50 / 0.30 = 1.6667
- Cpk = min(1.6667, 1.6667) = 1.67 (centered, so Cpk = Cp)

Sigma level and DPMO:
- Short-term sigma level = 3 × Cp = 3 × 1.67 = 5.0 (a "5σ process" in short-term terms)
- Long-term sigma level (with 1.5σ shift) = 3·Cp − 1.5 = 5.0 − 1.5 = 3.5
- DPMO (centered, no shift) = 2·Φ(−3·Cp) × 10⁶ = 2·Φ(−5.0) × 10⁶ = 2 × 2.87 × 10⁻⁷ × 10⁶ = 0.574 DPMO (essentially zero defects short-term)
- DPMO (long-term, 1.5σ shift) = [Φ(−(3·Cp − 1.5)) + Φ(−(3·Cp + 1.5))] × 10⁶
                              = [Φ(−3.5) + Φ(−6.5)] × 10⁶
                              = [2.33 × 10⁻⁴ + 4.0 × 10⁻¹¹] × 10⁶
                              ≈ 233 DPMO (per the standard Motorola table for a 5σ process)

Long-term performance (Pp/Ppk):
- If the overall standard deviation s = 0.115 mm (slight between-subgroup drift): Pp = 1.0 / (6 × 0.115) = 1.0/0.69 = 1.45; Ppk = 0.50 / (3 × 0.115) = 0.50/0.345 = 1.45. The Pp − Cp gap = 1.45 − 1.67 = −0.22, or 0.22σ of long-term drift — consistent with the 1.5σ convention's order of magnitude for a process with setup variability.

Mean-offset sensitivity:
- If the mean drifts to 10.05 mm (0.5σ offset): Cpu = 0.45/0.30 = 1.50, Cpl = 0.55/0.30 = 1.83, Cpk = 1.50. Cpk drops from 1.67 to 1.50 — a 0.17-point loss from a 0.5σ mean shift, the classic argument for targeting Cpk ≥ 1.67 (to absorb mean drift and still meet the 1.33 floor).`,
    industrial_example: `**Automotive (engine cylinder bore, variable diameter).** A Tier-1 supplier bores engine-block cylinders to a customer spec of 82.00 +0.030/−0.000 mm (USL = 82.030, LSL = 82.000, T = 82.015 mm). The X̄/R chart (n = 5, 30 subgroups, in control) gives μ = 82.016 mm, R̄ = 0.0127 mm. d2 = 2.326, so σ̂_within = 0.0127/2.326 = 0.00546 mm. Cp = 0.030/(6×0.00546) = 0.030/0.0328 = 0.916 — below 1.33, the supplier is NOT capable. Cpu = (82.030−82.016)/(3×0.00546) = 0.014/0.0164 = 0.854; Cpl = (82.016−82.000)/0.0164 = 0.976; Cpk = 0.854. Sigma level = 3 × 0.916 = 2.75 (below the historic 3σ "just capable" threshold); long-term DPMO ≈ 130,000 (per the 1.5σ-shift table for a 2.75σ process). The Improve-phase mandate is to reduce σ̂_within from 0.00546 to 0.00375 mm (Cp = 0.030/(6×0.00375) = 1.33), typically through diamond-tool geometry, hydraulic-clamp repeatability, and thermal-stabilization of the spindle — the canonical Six Sigma Improve sequence.`,
    case_study: `CASE_TYPE = SYNTHETIC. A Green Belt at a precision-stamping plant reports a copper-link contact dimension with USL = 8.20 mm, LSL = 8.00 mm, μ = 8.18 mm, σ̂_within = 0.020 mm, and concludes "Cp = (0.20)/(0.12) = 1.67, Cpk = min((0.02)/(0.06), (0.18)/(0.06)) = 0.33 → I report Cpk = 0.33 and tell the customer we are not capable." A second Green Belt reviews the analysis and finds: (i) the Gage R&R %R&R was 28% of tolerance (above the 10% rule); (ii) the X̄/R chart had a Western Electric Rule 1 violation (one subgroup X̄ beyond 3σ) that was ignored; (iii) the data failed Anderson-Darling normality (p = 0.01) due to a bimodal mixture from two tool-setups. Correct reanalysis: (a) fix the gage — a new digital indicator brought %R&R to 6%; (b) stratify by setup — the two setups were analyzed separately; setup A had σ̂_A = 0.012 mm and μ_A = 8.10 mm (Cp_A = 2.78, Cpk_A = 1.67); setup B had σ̂_B = 0.018 mm and μ_B = 8.18 mm (Cp_B = 1.85, Cpk_B = 0.37). Setup B was the actual problem — a worn die was replaced and σ̂_B fell to 0.011 mm, μ_B centered at 8.10 mm, giving Cpk_B = 1.52. Combined post-improvement Cp = 3.03, Cpk = 1.82 (sigma level 9.1 short-term, ~0.0 DPMO long-term with 1.5σ shift). Lesson: never compute Cp/Cpk until the measurement system is adequate, the process is in control, and the distribution is unimodal — the pre-flight is the methodology. Source: synthetic case authored for this lesson; method per Breyfgle (2003, Ch. 12) and Montgomery (SQC, Ch. 8).`,
    visual_explanation: `Picture a normal curve N(μ, σ̂²) superimposed on a tolerance band [LSL, USL]. For a centered process (μ = T): the curve sits in the middle of the band; both tails lie far outside the spec limits only when σ̂ is small. Cp is the visual ratio of (USL−LSL) to the 6σ̂ "spread" of the curve. As the mean shifts off target, the upper (or lower) tail creeps toward the spec limit; Cpk tracks the closer tail. The 1.5σ shift is the picture of the curve sliding 1.5σ̂ to one side over a long production run — the long-term DPMO is the area of the tail now spilling past the spec. The Motorola table maps: 6σ curve centered → 3.4 DPMO after the 1.5σ slide; 5σ curve → 233 DPMO; 4σ → 6,210; 3σ → 66,807.`,
    simulation_opportunity: `An interactive capability simulator would let the learner set USL, LSL, μ, σ̂_within, and s via sliders; display the normal curve on the tolerance band; and live-update Cp, Cpk, Pp, Ppk, sigma level (short and long term), and DPMO. A second control would toggle the 1.5σ shift on/off and overlay the centered-vs-shifted curves. A third would let the learner introduce a mean-offset slider and watch Cpk degrade while Cp stays constant — driving home the difference between potential and actual capability.`,
    common_mistakes: `- Computing Cp/Cpk before verifying %R&R < 10% — the σ̂ you compute is mostly measurement noise.
- Computing Cp/Cpk on an out-of-control process — the number is meaningless on a moving target.
- Reporting Cpk alone without Cp — leadership cannot see how much of the gap is centering vs variation.
- Confusing Cp (potential, centered) with Cpk (actual, offset) — they are equal only when μ = T.
- Skipping the normality check on a skewed or bimodal distribution — the normal-table DPMO is wrong.
- Treating the 1.5σ shift as a law of nature — it is an empirical Motorola convention; report long-term DPMO from actual data when available.
- Using attribute (go/no-go) data with the Cp/Cpk formulas — those require variable data; use DPMO directly on attribute data.
- Quoting "sigma level" without specifying short-term vs long-term — a 5σ short-term process is not the same as a 5σ long-term process.`,
    limitations: `- Cp/Cpk assume normality; non-normal data require transformation or non-normal methods (Pearson/Johnson) — or use the empirical percentile capability.
- The 1.5σ shift is an empirical convention; real long-term drift varies by process class (continuous-flow vs discrete-batch vs job-shop).
- σ̂_within from R̄/d2 assumes rational subgroups and a stable process; with batch-to-batch variation, σ̂_within under-estimates true within-batch spread.
- Capability is point-in-time; a process capable today can drift tomorrow — sustained capability requires SPC in the Control phase.
- Pp/Ppk on out-of-control data are descriptive but not predictive — they describe what was delivered, not what will be delivered.
- DPMO from the normal table breaks down for highly skewed (e.g., Weibull-failure) processes; use the fitted distribution's tail probabilities.
- Capability indices compress information; report sigma level and DPMO alongside Cp/Cpk for leadership interpretation.`,
    comparison: `**Cp vs Cpk vs Pp vs Ppk:**
- Cp: centered potential, within-subgroup σ̂, short-term — "what the process could do at best, centered."
- Cpk: actual capability, within-subgroup σ̂, short-term, accounts for mean offset — "what the process is doing short-term."
- Pp: centered potential, overall s, long-term — "what the process could do at best, centered, over the long run."
- Ppk: actual performance, overall s, long-term, accounts for mean offset — "what the process actually delivered over the study window."
- Gap Cp − Pp ≈ size of long-term drift (the empirical 1.5σ-shift manifestation for this process).
- Gap Cpk − Ppk ≈ drift + centering loss combined.

**Sigma level vs DPMO:**
- Sigma level (short-term) = 3·Cp — convenient integer-scale score (3σ, 4σ, 5σ, 6σ).
- DPMO = defect rate per million — directly customer-facing.
- The 1.5σ-shift table is the standard bridge: 6σ → 3.4, 5σ → 233, 4σ → 6,210, 3σ → 66,807.`,
    practical_application: `- **Measure phase exit criterion**: leadership signs off on a project only when Cp and Cpk are computed and the Cpk-to-target gap is the quantified opportunity.
- **Supplier qualification**: PPAP (Production Part Approval Process) requires Ppk ≥ 1.67 (5σ short-term) on initial production runs and Ppk ≥ 1.33 in routine production.
- **Improve-phase target-setting**: the gap Cp_target − Cp_current sets the σ-reduction mandate for the Improve phase.
- **Control-phase SPC design**: the control-limit spacing on the X̄/R chart is set from σ̂_within; Cpk sets the warning that an out-of-control signal is meaningful.
- **Customer scorecard reporting**: monthly Cpk and DPMO are the standard supplier-quality scorecard inputs.`,
    decision_scenario: `You are a Black Belt leading a DMAIC project on a medical-device sub-assembly weld. The customer spec is 1.500 ± 0.020 mm. Pre-flight: Gage R&R %R&R = 4.8% (pass); X̄/R in control (pass); normality p = 0.21 (pass). μ = 1.498 mm, σ̂_within = 0.0068 mm. Compute Cp, Cpk, Pp, Ppk, sigma level (short and long), and DPMO (with 1.5σ shift). The customer demands Cpk ≥ 1.33 for production release. Do you approve production release now, or do you launch an Improve sub-project to reduce σ̂_within first? If the latter, by how much must σ̂_within fall to meet Cpk = 1.33?`,
    practice_questions: `- **Q1 (Easy, Recall):** State the formula for Cp and explain the "6" in the denominator.
- **Q2 (Medium, Application):** Given USL = 10.5, LSL = 9.5, μ = 10.0, σ̂_within = 0.10 — compute Cp, Cpk, sigma level, and DPMO (with 1.5σ shift).
- **Q3 (Medium, Understand):** Distinguish Cp from Pp and Cpk from Ppk; what does the Cp − Pp gap quantify?
- **Q4 (Hard, Analyze):** A process has Cp = 1.67, Cpk = 1.50. Compute the centering ratio and recommend a centering action that restores Cpk = Cp.`,
    certification_questions: `- **CSSGB-style (Easy, Calculation):** Given Cp = 1.33, what is the short-term sigma level and the long-term DPMO (with 1.5σ shift)?
- **CSSBB-style (Medium, Analysis):** A supplier's PPAP shows Ppk = 1.20 but Cp = 1.67. Diagnose the gap and prescribe the Improve action.
- **CSSBB-style (Hard, Synthesis):** The Gage R&R %R&R is 28% of tolerance; the X̄/R chart has a Rule 1 violation; the normality test rejects at p = 0.02. In what order do you act before computing Cp/Cpk, and why?`,
    summary: `Process capability is the engineering quantification of "how well does the process meet spec?" The four indices — Cp (potential, centered, short-term), Cpk (actual, offset, short-term), Pp (potential, centered, long-term), Ppk (actual, offset, long-term) — together with sigma level (3·Cp short-term, 3·Cp − 1.5 long-term) and DPMO (per the Motorola 1.5σ-shift table: 6σ=3.4, 5σ=233, 4σ=6,210, 3σ=66,807) form the complete capability statement. The non-negotiable pre-flight — %R&R < 10%, in-control X̄/R, normality/transform — gates every capability calculation; skipping it is the most common Green Belt error.`,
    key_takeaways: `- Cp/Cpk use within-subgroup σ̂_within (short-term); Pp/Ppk use overall s (long-term).
- Sigma level short-term = 3·Cp; long-term = 3·Cp − 1.5; the four DPMO reference points are 3.4 / 233 / 6,210 / 66,807.
- Pre-flight: MSA → in-control → normality → then compute Cp/Cpk.
- Cp ≥ 2.0 (Cpk ≥ 1.5) is the "Six Sigma process" target.
- Report Cp + Cpk + Pp + Ppk + sigma level + DPMO together — never one number alone.`,
    references: `- ASQ Six Sigma Black Belt Body of Knowledge.
- ASQ Six Sigma Green Belt Body of Knowledge.
- Montgomery (2013), Statistical Quality Control, Ch. 7 (Capability), Ch. 8 (Gage R&R), Ch. 4 (SPC).
- Montgomery (2019), Design and Analysis of Experiments, Ch. 1 (Introduction, sigma level context).
- Breyfogle (2003), Implementing Six Sigma, Ch. 12 (Process Capability), Ch. 11 (MSA).
- Pande, Neuman & Cavanagh (2014), The Six Sigma Way, Ch. 5 (Motorola 1.5σ shift, DPMO entitlement).`,
  },
  knowledgeObject: {
    title: "Process Capability — Cp, Cpk, Pp, Ppk & Sigma Level",
    domain: "Measure",
    competency: "Process Capability (Cp/Cpk)",
    topic: "Process Capability",
    concept: "Cp/Cpk/Pp/Ppk indices, sigma level, and DPMO with the Motorola 1.5σ shift",
    body: {
      definitions: [
        "Cp (Process Capability, centered): (USL−LSL)/(6σ̂_within) — potential capability assuming a centered mean.",
        "Cpk (Process Capability Index): min((USL−μ),(μ−LSL))/(3σ̂_within) — actual capability accounting for mean offset.",
        "Pp: (USL−LSL)/(6s) — long-term centered potential, uses overall standard deviation s.",
        "Ppk: min((USL−μ),(μ−LSL))/(3s) — long-term actual performance, uses overall s.",
        "USL/LSL: upper/lower specification limit (customer tolerance band).",
        "σ̂_within: within-subgroup standard deviation, estimated as R̄/d2 from an in-control X̄/R chart.",
        "s: overall standard deviation across all observations (long-term dispersion, includes drift).",
        "Sigma level (short-term, centered) = 3·Cp; (long-term, with 1.5σ shift) = 3·Cp − 1.5.",
        "DPMO: defects per million opportunities; Motorola 1.5σ-shift table: 6σ=3.4, 5σ=233, 4σ=6,210, 3σ=66,807.",
        "1.5σ shift: empirical Motorola constant converting short-term sigma level to long-term DPMO.",
        "Entitlement: the best-observed short-term performance; the Improve phase aims to make entitlement the steady-state long-term.",
        "%R&R: measurement-system variation as a % of tolerance (must be < 10% before capability is computed).",
      ],
      principles: [
        "Capability ≠ Performance. Cp/Cpk use within-subgroup σ̂; Pp/Ppk use overall s.",
        "The 4-step pre-flight is non-negotiable: MSA → in-control → normality → capability.",
        "Sigma level (short-term, centered) = 3·Cp; long-term (with 1.5σ shift) = 3·Cp − 1.5.",
        "The four DPMO reference points: 6σ=3.4, 5σ=233, 4σ=6,210, 3σ=66,807.",
        "Cpk/Cp is the centering ratio: 1.0 ⇒ mean on target; < 1.0 ⇒ mean offset consuming tolerance.",
        "Cp ≥ 2.0 (Cpk ≥ 1.5) is the 'Six Sigma process' target — yields ~3.4 DPMO long-term.",
        "Report Cp + Cpk + Pp + Ppk + sigma level + DPMO together — never one number alone.",
      ],
      components: [
        "Specification limits USL/LSL (customer tolerance band).",
        "Target T (midpoint or design intent).",
        "Process mean μ (X̄) and within-subgroup σ̂_within (from R̄/d2).",
        "Overall s (long-term dispersion including drift).",
        "X̄/R (or X̄/s) control chart — in-control evidence.",
        "Gage R&R study — measurement-system evidence (%R&R < 10%).",
        "Normality test (Anderson-Darling) + Box-Cox transform if needed.",
        "Motorola 1.5σ-shift DPMO table.",
      ],
      mechanism: "Cp/Cpk assume a normal, in-control, well-measured process; the within-subgroup σ̂_within is the natural variation against which the tolerance band is compared. The mean offset (μ − T) reduces Cpk below Cp; long-term drift raises s above σ̂_within, reducing Pp below Cp. The 1.5σ shift empirically bridges short-term Cp to long-term DPMO via the Motorola table.",
      process: "Verify MSA → verify in-control X̄/R → verify normality or transform → compute σ̂_within = R̄/d2 → compute Cp, Cpk → compute Pp, Ppk from s → convert to sigma level (3·Cp, 3·Cp − 1.5) → convert to DPMO via Motorola table → report all six numbers + %R&R + in-control status + normality p-value.",
      formulas: [
        "Cp = (USL − LSL) / (6·σ̂_within)",
        "Cpu = (USL − μ) / (3·σ̂_within); Cpl = (μ − LSL) / (3·σ̂_within); Cpk = min(Cpu, Cpl)",
        "Pp = (USL − LSL) / (6·s); Ppk = min((USL−μ),(μ−LSL)) / (3·s)",
        "σ̂_within = R̄ / d2 (d2 by subgroup size: 1.128 for n=2; 1.693 for n=3; 2.059 for n=4; 2.326 for n=5; 2.534 for n=6)",
        "Sigma level (short-term) = 3·Cp; (long-term, 1.5σ shift) = 3·Cp − 1.5",
        "DPMO (long-term, 1.5σ shift) = [Φ(−(3·Cp − 1.5)) + Φ(−(3·Cp + 1.5))] × 10⁶",
      ],
      metrics: [
        "Cp / Cpk ≥ 1.33 (4σ historic acceptance); ≥ 1.67 (5σ); ≥ 2.0 (6σ target).",
        "Pp / Ppk ≥ 1.67 for PPAP initial, ≥ 1.33 routine production.",
        "%R&R < 10% acceptable; 10–30% conditional; > 30% unacceptable (fix gage first).",
        "Centering ratio Cpk/Cp ≥ 0.9 (mean on target within 0.3σ).",
        "DPMO target by Six Sigma level: 3.4 (6σ), 233 (5σ), 6,210 (4σ), 66,807 (3σ).",
      ],
      examples: [
        "USL=10.5, LSL=9.5, μ=10.0, σ̂_within=0.10: Cp=1.67, Cpk=1.67, sigma level (short)=5.0, DPMO (long, 1.5σ shift)=233.",
        "Mean drift to 10.05 mm (0.5σ offset): Cpu=1.50, Cpl=1.83, Cpk=1.50 — 0.17-point capability loss from 0.5σ offset.",
        "σ̂_within reduced from 0.00546 to 0.00375 mm: Cp rises from 0.92 to 1.33 (crossing the historic acceptance threshold).",
      ],
      industrial_examples: [
        "Automotive cylinder bore: USL=82.030, LSL=82.000, μ=82.016, σ̂_within=0.00546 mm → Cp=0.92, Cpk=0.85 — NOT capable; Improve mandate is σ̂ reduction.",
        "Tier-1 PPAP supplier: customer requires Ppk ≥ 1.67 for initial production; routine Ppk ≥ 1.33 thereafter.",
      ],
      case_studies: [
        "SYNTHETIC — Copper-link contact stamping: initial Cpk=0.33 from a bimodal mixture; setup-B stratification reveals σ̂_B=0.018 (worn die) and a mean offset; die replacement lifts combined Cpk to 1.82 (sigma level 9.1 short-term).",
      ],
      common_errors: [
        "Computing Cp/Cpk before verifying %R&R < 10% — σ̂ is mostly measurement noise.",
        "Computing Cp/Cpk on an out-of-control process — meaningless number on a moving target.",
        "Reporting Cpk alone without Cp — leadership cannot see how much is centering vs variation.",
        "Confusing Cp with Cpk — they are equal only when μ = T.",
        "Skipping normality on skewed/bimodal data — normal-table DPMO is wrong.",
        "Treating the 1.5σ shift as a law — it is an empirical Motorola convention.",
        "Using Cp/Cpk formulas on attribute (go/no-go) data — use DPMO directly.",
      ],
      limitations: [
        "Normality assumption; non-normal data require transformation or Pearson/Johnson fit.",
        "1.5σ shift is empirical — real long-term drift varies by process class.",
        "σ̂_within from R̄/d2 assumes rational subgroups; batch-to-batch variation under-estimates within-batch spread.",
        "Point-in-time capability requires SPC in the Control phase to sustain.",
        "Pp/Ppk on out-of-control data are descriptive only — not predictive.",
      ],
      best_practices: [
        "Run the 4-step pre-flight (MSA → in-control → normality → capability) on every capability study.",
        "Report Cp + Cpk + Pp + Ppk + sigma level + DPMO together — never one number alone.",
        "Use Box-Cox for mild non-normality; Pearson/Johnson for severe skew; empirical-percentile capability for non-fittable distributions.",
        "Set Improve-phase σ-reduction targets from Cp_target − Cp_current.",
        "Pair capability with SPC for the Control phase — capability without SPC is unverifiable.",
      ],
      related_concepts: [
        "Measurement System Analysis (MSA) / Gage R&R — the pre-condition for capability.",
        "Statistical Process Control (SPC) — the in-control evidence and the Control-phase sustainment.",
        "Hypothesis Testing — verifying that observed Cp/Cpk differences are statistically significant.",
        "Regression & Correlation — explaining Cp/Cpk variation across process inputs.",
        "DOE (Design of Experiments) — the Improve-phase method to reduce σ̂_within systematically.",
      ],
      prerequisites: [
        "Descriptive statistics: mean, variance, std dev, percentiles, IQR.",
        "Normal distribution: Z = (x−μ)/σ, Φ(z), the 68-95-99.7 rule.",
        "SPC basics: X̄/R chart, in-control, common-cause vs special-cause, d2 and σ̂_within = R̄/d2.",
        "Gage R&R conceptually (%R&R rule).",
      ],
      references: [
        "ASQ Six Sigma Black Belt BOK (DMAIC — Measure, capability).",
        "ASQ Six Sigma Green Belt BOK (Measure — capability, sigma level, DPMO).",
        "Montgomery, Statistical Quality Control, Ch. 7 (Process Capability), Ch. 8 (Gage R&R).",
        "Montgomery, Design and Analysis of Experiments, Ch. 1 (Sigma level context).",
        "Breyfogle, Implementing Six Sigma, Ch. 12 (Process Capability), Ch. 11 (MSA).",
        "Pande, Neuman & Cavanagh, The Six Sigma Way, Ch. 5 (1.5σ shift, DPMO entitlement).",
      ],
    },
  },
  questions: [
    {
      competencyName: "Process Capability (Cp/Cpk)",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Manufacturing",
      stem: "A CNC grinding operation has USL = 10.5 mm, LSL = 9.5 mm, μ = 10.0 mm, and within-subgroup σ̂_within = 0.10 mm (process in control, normality passed, %R&R = 6.3%). Compute Cp, Cpk, the short-term sigma level, and the long-term DPMO (with 1.5σ shift).",
      whyCorrect:
        "Cp = (USL−LSL)/(6σ̂_within) = (10.5−9.5)/(6×0.10) = 1.0/0.60 = 1.67. Because μ = T = 10.0 (centered), Cpu = Cpl = 0.50/0.30 = 1.67, so Cpk = min(1.67, 1.67) = 1.67. Short-term sigma level = 3×Cp = 3×1.67 = 5.0 (a 5σ process). Long-term DPMO (with 1.5σ shift) is read from the Motorola table for a 5σ short-term process: 233 DPMO (equivalently [Φ(−3.5)+Φ(−6.5)]×10⁶ ≈ 233). The pre-flight is satisfied (in control, normal, %R&R < 10%), so the indices are reportable.",
      whyOthersWrong: [
        "Option A (Cp=1.67, Cpk=1.67, sigma=5.0, DPMO=3.4) — DPMO 3.4 is the 6σ value; this confuses a 5σ process with a 6σ process.",
        "Option C (Cp=1.33, Cpk=1.33, sigma=4.0, DPMO=6,210) — uses σ̂_within = 0.125 mm (wrong; the stated σ̂_within is 0.10) and the 4σ DPMO row.",
        "Option D (Cp=1.67, Cpk=0.83, sigma=5.0, DPMO=233) — computes Cpk as if the mean were offset by 1.5σ (Cpk = 1.67 − 0.5 = 1.17, or 0.83 by another error); the problem states μ = 10.0 (centered), so Cpk = Cp = 1.67.",
      ],
      explanation:
        "Cp = (USL−LSL)/(6σ̂_within) = 1.67. Centered ⇒ Cpk = Cp = 1.67. Sigma level = 3·Cp = 5.0. Long-term DPMO (1.5σ shift) for a 5σ short-term process = 233 (Motorola table).",
      options: [
        { text: "Cp=1.67, Cpk=1.67, sigma=5.0, DPMO=3.4", isCorrect: false },
        { text: "Cp=1.67, Cpk=1.67, sigma=5.0, DPMO=233", isCorrect: true },
        { text: "Cp=1.33, Cpk=1.33, sigma=4.0, DPMO=6,210", isCorrect: false },
        { text: "Cp=1.67, Cpk=0.83, sigma=5.0, DPMO=233", isCorrect: false },
      ],
    },
    {
      competencyName: "Process Capability (Cp/Cpk)",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "Which of the following is the correct interpretation of the Motorola 1.5σ shift?",
      whyCorrect:
        "The 1.5σ shift is the empirical Motorola observation (Bill Smith, 1980s) that long-term process performance degrades by roughly 1.5σ relative to short-term, due to setup changes, operator variability, tool wear, and environmental drift. It converts short-term sigma level to long-term DPMO via the standard Motorola table: a short-term 6σ process delivers 3.4 DPMO long-term (not 0.002 DPMO), a 5σ delivers 233, a 4σ delivers 6,210, a 3σ delivers 66,807. It is an empirical convention, not a physical law — its magnitude varies by process class but it is retained by the ASQ BOK as the de-facto standard.",
      whyOthersWrong: [
        "Option A (statistical law requiring 1.5σ for normality) is wrong — the 1.5σ shift is an empirical convention, not a normality requirement.",
        "Option C (the difference between σ̂_within and s for any process) is wrong — that is the within-vs-overall gap, which is process-specific; 1.5σ is the empirical Motorola long-term convention applied universally to convert short-term Cp to long-term DPMO.",
        "Option D (a safety factor on the spec limits) is wrong — the 1.5σ shift is applied to the process, not to the spec.",
      ],
      explanation:
        "1.5σ shift = Motorola empirical convention that long-term DPMO ≈ Φ(−(3·Cp − 1.5)) × 10⁶. Short-term 6σ → long-term 3.4 DPMO. It is empirical, not a law.",
      options: [
        { text: "A statistical law requiring a 1.5σ offset for normal-distribution capability to apply", isCorrect: false },
        { text: "An empirical Motorola convention that long-term performance is ~1.5σ worse than short-term, converting short-term 6σ to long-term 3.4 DPMO", isCorrect: true },
        { text: "The exact difference between σ̂_within and s for every process", isCorrect: false },
        { text: "A safety factor added to the spec limits to protect against gage error", isCorrect: false },
      ],
    },
    {
      competencyName: "Process Capability (Cp/Cpk)",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Automotive",
      stem: "A PPAP submission reports Cp = 1.67 but Cpk = 0.85. The customer requirement is Cpk ≥ 1.33. Diagnose the gap and prescribe the correct Improve action.",
      whyCorrect:
        "Cp = 1.67 (potential capability) but Cpk = 0.85 (actual) means the process has the variation width to meet 1.67 (5σ short-term), but the mean is off-center, consuming capability. The centering ratio Cpk/Cp = 0.85/1.67 = 0.51 — the mean offset is consuming ~49% of the available capability. The Improve action is to CENTER the process (target the mean at T = (USL+LSL)/2) — this is a setup/tooling/fixture problem, not a variation-reduction problem. Once centered, Cpk will rise to ~Cp = 1.67 (well above the 1.33 requirement), and no σ-reduction is needed. This is the canonical distinction: Cp − Cpk gap ⇒ center; Cpk below target with Cp ≈ Cpk ⇒ reduce σ̂_within.",
      whyOthersWrong: [
        "Option A (reduce σ̂_within via DOE) is wrong — Cp = 1.67 already exceeds the 1.33 target; the gap is centering, not variation. σ-reduction would lift Cp further but not address the off-center mean.",
        "Option C (widen the spec limits with the customer) is wrong — the spec is the customer's; the process meets Cp, the issue is mean offset, which the supplier controls.",
        "Option D (replace the gage for %R&R > 10%) is wrong — the scenario gives no evidence of gage failure; Cp/Cpk = different is a centering signature, not a gage signature.",
      ],
      explanation:
        "Cp ≫ Cpk ⇒ mean is off-center (centering ratio Cpk/Cp = 0.51). Improve action: center the mean (setup/fixture), not reduce σ. Once centered, Cpk → Cp ≈ 1.67, exceeding the 1.33 target with no σ-reduction required.",
      options: [
        { text: "Launch a DOE to reduce σ̂_within — the process variation is too large", isCorrect: false },
        { text: "Center the process mean on T = (USL+LSL)/2 — Cp ≫ Cpk is a centering problem, not a variation problem", isCorrect: true },
        { text: "Renegotiate the spec limits with the customer — the tolerance is too tight", isCorrect: false },
        { text: "Replace the measurement gage — %R&R is likely > 10%", isCorrect: false },
      ],
    },
    {
      competencyName: "Process Capability (Cp/Cpk)",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: Cp and Cpk can be computed on any process as long as you have USL, LSL, μ, and σ — pre-flight checks (MSA, statistical control, normality) are recommended but not required.",
      whyCorrect:
        "False. The ASQ Six Sigma BOK (and Breyfgle 2003, Montgomery SQC 2013) are explicit: Cp/Cpk are meaningful ONLY when (i) the measurement system has %R&R < 10% of tolerance (else σ̂ is mostly measurement noise), (ii) the process is in statistical control (else the number is computed on a moving target — not predictive), and (iii) the underlying distribution is normal (or transformed to normal; or fitted with Pearson/Johnson for non-normal capability). Skipping the pre-flight produces a number that is uninterpretable — typically overstating capability by 30–60%. The pre-flight is the methodology, not an optional nicety.",
      whyOthersWrong: [
        "True — the candidate would conflate the formula's algebraic availability (the formula can be evaluated on any four numbers) with the index's statistical validity (the index is meaningful only under the three pre-conditions). The formula is computable on any data; the index is interpretable only after the pre-flight.",
      ],
      explanation:
        "Cp/Cpk are statistically meaningful only when %R&R < 10%, the X̄/R is in control, and normality holds (or is transformed). The pre-flight is required, not recommended.",
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Hypothesis Testing
// (Competency: "Hypothesis Testing"; slug: ss-hypothesis-testing)
// ---------------------------------------------------------------------------

const LESSON_HYPOTHESIS_TESTING: RefLesson = {
  competencyName: "Hypothesis Testing",
  slug: "ss-hypothesis-testing",
  title: "Hypothesis Testing — H0/H1, p-value, α/β, t-test, χ²",
  titleAr: "اختبار الفرضيات — H0/H1، وقيمة p، وα/β، واختبار t، واختبار χ²",
  order: 2,
  durationMin: 36,
  references: SS_REFERENCE_TITLES,
  conceptIntroduction: `Hypothesis testing is the inferential bridge from sample data to a population claim. The Six Sigma BOK operationalizes it as: state H0 (null — typically "no difference, no effect, the process is on target") and H1 (alternative — "there is a difference, there is an effect, the process has shifted"); choose α (the Type I error rate — the probability of falsely rejecting a true H0; conventionally 0.05); compute a test statistic from the data; derive the p-value (the probability of observing a test statistic at least as extreme as the one observed, assuming H0); and decide — if p ≤ α reject H0, if p > α fail to reject H0. Type II error β is the probability of failing to reject a false H0; power = 1 − β. The t-test (one-sample, two-sample, paired) compares means; the chi-square (χ²) test compares variances or categorical associations; the F-test and ANOVA extend to multi-group comparisons. The BOK emphasizes that statistical significance (p ≤ α) is necessary but not sufficient — the practical significance (effect size, confidence interval width, cost-to-implement) governs the Six Sigma decision.`,
  example: `A wire-bond pull-strength sample (n = 10) gives x̄ = 9.85 g, s = 0.32 g. The spec minimum (target) is 9.50 g. The engineer claims the process exceeds spec. H0: μ = 9.50; H1: μ > 9.50 (one-tailed). α = 0.05. SE = s/√n = 0.32/√10 = 0.1012 g. t = (x̄ − μ_0)/SE = (9.85 − 9.50)/0.1012 = 0.35/0.1012 = 3.46. df = n − 1 = 9. From the t-table, t_crit(0.05, df=9, one-tailed) = 1.833. Since 3.46 > 1.833, reject H0. The p-value = P(T > 3.46 | df=9) ≈ 0.0036 (between the 0.005 critical value 3.250 and the 0.001 critical value 4.297). p = 0.0036 < 0.05 ⇒ reject H0; the process mean exceeds 9.50 g with statistical significance. The 95% one-sided lower confidence bound is x̄ − t_crit × SE = 9.85 − 1.833 × 0.1012 = 9.664 g — comfortably above 9.50.`,
  keyFormulas: `One-sample t-test:        t = (x̄ − μ_0) / (s/√n),  df = n − 1
Two-sample t-test (equal var):  t = (x̄_1 − x̄_2) / [s_p · √(1/n_1 + 1/n_2)]
                            s_p² = [(n_1−1)s_1² + (n_2−1)s_2²] / (n_1 + n_2 − 2),  df = n_1 + n_2 − 2
Two-sample t-test (Welch, unequal var):  t = (x̄_1 − x̄_2) / √(s_1²/n_1 + s_2²/n_2)
                            df_Welch = (s_1²/n_1 + s_2²/n_2)² / [(s_1²/n_1)²/(n_1−1) + (s_2²/n_2)²/(n_2−1)]
Paired t-test:            t = d̄ / (s_d/√n),  df = n − 1, where d_i = x_i − y_i
Chi-square (variance):    χ² = (n−1)s²/σ_0²,  df = n − 1
Chi-square (association): χ² = Σ [(O − E)² / E],  df = (r−1)(c−1)
p-value = P(T ≥ |t_obs| | H0, df) [two-tailed: × 2]
α = P(reject H0 | H0 true)  [Type I];  β = P(fail to reject H0 | H0 false)  [Type II]
Power = 1 − β;  Effect size (Cohen's d) = (μ_1 − μ_2)/s_p
Sample size (one-sample t, two-sided α, power 1−β):  n ≈ [(z_{1−α/2} + z_{1−β})·σ/δ]²`,
  exercise: `You are a Green Belt comparing the surface-finish roughness (Ra, μm) of two CNC lines. Line A: n_A = 12, x̄_A = 1.85 μm, s_A = 0.18 μm. Line B: n_B = 12, x̄_B = 1.62 μm, s_B = 0.20 μm. (a) State H0 and H1 (two-tailed) and choose α. (b) Compute the two-sample t-statistic (assume equal variances) and df. (c) Find the critical t-value and the p-value; state the decision. (d) Compute Cohen's d and interpret practical significance. (e) If you wanted 90% power to detect a 0.20 μm difference at α = 0.05 with σ_p ≈ 0.19 μm, what sample size per line would you need?`,
  sections: {
    learning_objectives: `- State H0 and H1 in words and symbols for a Six Sigma engineering question; choose one-tailed vs two-tailed deliberately.
- Define Type I (α) and Type II (β) errors; explain why α is the user-chosen "consumer's risk" and β the "producer's risk" in a verification test.
- Compute one-sample, two-sample (equal and unequal variance), and paired t-tests by hand from raw summary statistics.
- Compute a chi-square test for variance and for categorical association; interpret the test statistic and the p-value.
- Explain p-value correctly (probability of data this extreme or more, given H0 — NOT the probability H0 is true) and avoid the p-value fallacies.
- Distinguish statistical significance (p ≤ α) from practical significance (effect size, CI width); apply both to the Six Sigma decision.`,
    prerequisites: `- Descriptive statistics: mean, variance, standard deviation, sample vs population.
- The normal and t distributions; standard normal Z and Φ(z); t-table use.
- Confidence intervals: a (1−α) CI for μ, the link to a two-tailed hypothesis test.
- Degrees of freedom, sample-size intuition, and the concept of sampling distribution.`,
    introduction: `Hypothesis testing is the Six Sigma formalism for turning sample data into a decision about the population. The BOK uses it in three Measure/Analyze contexts: (i) verifying the process mean against a target (one-sample t), (ii) comparing two processes, suppliers, or pre/post states (two-sample or paired t), and (iii) testing for variance reduction or for association in categorical defect data (chi-square).

The structure is invariant: state H0 (the conservative "no effect" claim), state H1 (the engineering hypothesis you want to demonstrate), pick α (the consumer's risk — the probability of a false alarm), compute the test statistic from the data, derive the p-value, and decide — reject H0 if p ≤ α, fail to reject if p > α. The asymmetry of the framework is essential: you can "reject H0" or "fail to reject H0" — you never "accept H0." Failing to reject is not proof H0 is true; it is the absence of evidence against it.

Two error types arise. Type I (α) is rejecting a true H0 — a false alarm; in supplier-qualification, this is the customer's risk (rejecting a good supplier). Type II (β) is failing to reject a false H0 — a miss; in supplier-qualification, this is the producer's risk (accepting a bad supplier). Power = 1 − β. Sample-size determination is the design lever: choose n to deliver a target power at a specified effect size and α.

The t-test family handles means. For a single sample vs a target, use the one-sample t. For two independent samples, use the two-sample t (with equal-variance pooled s_p if variances are homogeneous, or Welch's unequal-variance form otherwise). For matched pairs (same units before/after), use the paired t — which is a one-sample t on the differences d_i. The chi-square family handles variances (single-sample χ² = (n−1)s²/σ_0²) and categorical association (cross-tab χ² = Σ(O−E)²/E).

The p-value is the most-misunderstood quantity in applied statistics. Correctly: p = P(data this extreme or more | H0 is true). It is NOT P(H0 is true | data), NOT the probability the result is due to chance, and NOT 1 − P(H1). A small p says "the data would be unusual if H0 were true," not "H0 is false." The BOK emphasizes reporting effect sizes (Cohen's d, the difference with its CI) alongside the p-value to keep practical and statistical significance distinct.`,
    terminology: `- **H0 (null hypothesis)**: the conservative claim — usually "no difference, no effect, on target." Status quo.
- **H1 / Ha (alternative hypothesis)**: the engineering claim — "there is a difference, an effect, a shift." What you want to demonstrate.
- **α (Type I error rate)**: P(reject H0 | H0 true). The "false alarm" / consumer's risk. Conventionally 0.05.
- **β (Type II error rate)**: P(fail to reject H0 | H0 false). The "miss" / producer's risk. Conventionally targeted at 0.10–0.20.
- **Power = 1 − β**: the probability of correctly detecting a true effect. Target ≥ 0.80.
- **p-value**: P(data this extreme or more | H0 true). NOT P(H0 true | data).
- **Test statistic** (t, χ², F, Z): the data-driven quantity whose sampling distribution under H0 yields the p-value.
- **df (degrees of freedom)**: the parameter indexing the t and χ² distributions.
- **Critical value**: the threshold on the test statistic beyond which H0 is rejected at α.
- **Confidence interval (1−α)**: the set of H0 values not rejected by a two-tailed test at α — the link between CI and test.
- **Effect size (Cohen's d)**: (μ_1 − μ_2)/s_p — the practical magnitude of the difference, independent of sample size.
- **One-tailed vs two-tailed**: whether H1 specifies a direction (one-tailed) or merely "different" (two-tailed).
- **Paired test**: t-test on within-subject differences d_i = x_i − y_i; removes between-subject variance.`,
    detailed_explanation: `The hypothesis test is a decision rule: reject H0 when the data are sufficiently incompatible with it. "Sufficiently incompatible" is operationalized by the p-value — the tail-area probability of observing a test statistic at least as extreme as the one observed, computed under the sampling distribution that H0 implies.

The one-sample t-test compares a sample mean to a hypothesized μ_0. t = (x̄ − μ_0)/(s/√n), df = n−1. The denominator s/√n is the standard error (SE) of the mean — it shrinks as √n grows, so larger samples detect smaller shifts. The t-distribution (heavier-tailed than normal for small n) is the sampling distribution under H0; as n → ∞, t → z. The p-value = P(T ≥ |t_obs| | df) (× 2 for two-tailed). Reject if p ≤ α.

The two-sample t compares means from two independent samples. The equal-variance form pools the variances into s_p² = [(n_1−1)s_1² + (n_2−1)s_2²]/(n_1+n_2−2), and t = (x̄_1 − x̄_2)/[s_p·√(1/n_1 + 1/n_2)], df = n_1+n_2−2. The unequal-variance (Welch) form uses t = (x̄_1 − x̄_2)/√(s_1²/n_1 + s_2²/n_2), with Welch-Satterthwaite df — robust to variance heterogeneity. The choice is governed by an F-test on the variances (or Levene's test); Six Sigma practice increasingly defaults to Welch.

The paired t is for matched-pairs data (same units before/after, two operators on the same parts). It is a one-sample t on the within-pair differences d_i = x_i − y_i: t = d̄/(s_d/√n), df = n−1. The pairing removes between-subject variance and dramatically increases power for the within-subject effect.

The chi-square test for variance tests H0: σ² = σ_0² via χ² = (n−1)s²/σ_0², df = n−1. It is the variance analog of the one-sample t. The chi-square test of association tests H0: rows and columns are independent in an r×c contingency table, via χ² = Σ(O−E)²/E with df = (r−1)(c−1), where E = (row total × column total)/grand total under independence.

The p-value fallacies are the central BOK teaching point. Correctly: p is the probability of the data (or more extreme) GIVEN H0; it is conditional on H0 being true. It is NOT the probability H0 is true, NOT the probability the result is due to chance, NOT 1 − P(H1). The BOK recommends reporting the 95% confidence interval alongside the p-value: a (1−α) CI for the parameter contains all H0 values not rejected by a two-tailed test at α — a much richer inferential statement than the binary reject/fail-to-reject.

Statistical vs practical significance: with n large enough, any difference becomes "statistically significant" (small SE) — but a 0.001 mm difference, even if p < 0.001, may be commercially irrelevant. Conversely, with small n, a meaningful 0.5 mm difference may fail to reach significance. Cohen's d = (μ_1 − μ_2)/s_p quantifies practical magnitude (d ≈ 0.2 small, 0.5 medium, 0.8 large); the 95% CI on the difference quantifies the precision of the estimate. Both are reported alongside p in Breyfogle-style analyses.

Type I and Type II are asymmetric by design. α is the user-chosen risk of a false alarm (conventionally 0.05 — the consumer's risk in acceptance sampling). β is the risk of missing a real effect; it depends on n, α, and the true effect size. The power curve 1−β(effect size) is the design instrument for sample-size planning: pick the smallest practically meaningful effect (δ), pick α and target power (e.g., 0.80), and compute n from the formula n ≈ [(z_{1−α/2} + z_{1−β})·σ/δ]² for a one-sample t.`,
    core_principles: `- H0 is the conservative "no effect" claim; H1 is what you want to demonstrate. You reject H0 or fail to reject — never "accept H0."
- α is the user-chosen Type I (false alarm) risk; conventionally 0.05. β is the Type II (miss) risk; conventionally targeted via power ≥ 0.80.
- p-value = P(data this extreme or more | H0 true). NOT P(H0 true | data).
- t-test family handles means (one-sample, two-sample equal/unequal variance, paired).
- Chi-square family handles variances (single-sample) and categorical association (r×c table).
- Statistical significance (p ≤ α) ≠ practical significance (effect size + CI width). Report both.
- Sample size is the design lever: n ≈ [(z_{1−α/2} + z_{1−β})·σ/δ]² for the one-sample t.`,
    components: `- Null and alternative hypotheses (H0, H1), one- or two-tailed.
- Significance level α (typically 0.05) and target power 1−β (typically 0.80).
- Test statistic (t, χ², F, Z) with its sampling distribution and df.
- p-value computed from the test statistic under H0.
- Critical value(s) for the rejection region.
- (1−α) confidence interval for the parameter — the CI/test duality.
- Effect size (Cohen's d, odds ratio) — practical magnitude.
- Power curve and sample-size formula — the design instrument.`,
    process: `1. State H0 and H1 in words and symbols; choose one-tailed or two-tailed deliberately (one-tailed only when a directional hypothesis is engineering-justified).
2. Choose α (conventionally 0.05) and the target power (conventionally 0.80); compute the required n from the smallest meaningful effect δ.
3. Collect the sample(s); compute the summary statistics (x̄, s, n) — verify MSA first.
4. Select the appropriate test (one-sample t, two-sample t, paired t, χ² for variance, χ² for association).
5. Compute the test statistic, df, and the p-value from the sampling distribution under H0.
6. Decide: reject H0 if p ≤ α; fail to reject if p > α.
7. Report: p-value, decision, (1−α) CI for the parameter, effect size, and a one-sentence practical interpretation.
8. Connect the decision back to the DMAIC phase: Measure (baseline), Analyze (root cause), Improve (verify), Control (monitor).`,
    formula_calculation: `Variables:
- x̄: sample mean [same units as measurement]
- μ_0: hypothesized population mean (H0) [same units]
- s: sample standard deviation [same units]
- n: sample size [count, dimensionless]
- SE: standard error of the mean = s/√n [same units]
- t: t-test statistic [dimensionless]
- df: degrees of freedom [count]
- p: p-value = P(T ≥ |t_obs| | df) [probability, dimensionless]
- α: Type I error rate [probability, dimensionless]
- β: Type II error rate [probability, dimensionless]
- δ: smallest meaningful difference [same units]
- Cohen's d: (μ_1 − μ_2)/s_p [dimensionless effect size]
- χ²: chi-square statistic [dimensionless]
- σ_0²: hypothesized variance (H0) [same units squared]

Formulas:
- One-sample t: t = (x̄ − μ_0) / (s/√n), df = n − 1
- Two-sample t (equal var, pooled): t = (x̄_1 − x̄_2) / [s_p · √(1/n_1 + 1/n_2)], s_p² = [(n_1−1)s_1² + (n_2−1)s_2²]/(n_1+n_2−2), df = n_1+n_2−2
- Two-sample t (Welch, unequal var): t = (x̄_1 − x̄_2) / √(s_1²/n_1 + s_2²/n_2), df_W = (s_1²/n_1 + s_2²/n_2)² / [(s_1²/n_1)²/(n_1−1) + (s_2²/n_2)²/(n_2−1)]
- Paired t: t = d̄ / (s_d/√n), df = n − 1, d_i = x_i − y_i
- Chi-square (variance): χ² = (n−1)s²/σ_0², df = n − 1
- Chi-square (association): χ² = Σ [(O − E)² / E], E = (row total × column total)/grand total, df = (r−1)(c−1)
- p-value (one-tailed): P(T ≥ |t_obs| | df);  (two-tailed): 2 × P(T ≥ |t_obs| | df)
- Cohen's d = (μ_1 − μ_2)/s_p  (effect size conventions: 0.2 small, 0.5 medium, 0.8 large)
- Sample size (one-sample t, two-sided α, power 1−β): n ≈ [(z_{1−α/2} + z_{1−β})·σ/δ]²

Units: x̄, μ_0, s, δ in measurement units (mm, g, μm); t, χ², d, p, α, β dimensionless; n and df in counts.

Assumptions: (i) random, representative sample from a stable process; (ii) underlying distribution approximately normal (CLT rescues large n); (iii) for the two-sample t, decide equal vs unequal variance (F-test or Levene's); (iv) for paired t, within-pair differences are i.i.d. normal; (v) for χ² association, expected cell counts E ≥ 5 (else use Fisher's exact test).

Interpretation: p ≤ α ⇒ reject H0 (data are incompatible with H0); p > α ⇒ fail to reject H0 (data are consistent with H0 — not proof H0 is true). Report the (1−α) CI: all H0 values inside the CI are not rejected; the CI width shows the precision of the estimate. Report Cohen's d for practical magnitude.`,
    worked_example: `**One-sample t-test — wire-bond pull strength vs spec target.**
A wire-bond pull-strength sample (n = 10 specimens) gives x̄ = 9.85 g, s = 0.32 g. The customer's spec minimum (target) is μ_0 = 9.50 g. The process engineer claims the process mean exceeds the spec.

Step 1 — hypotheses (one-tailed, the claim is directional "exceeds"):
- H0: μ = 9.50 g
- H1: μ > 9.50 g (one-tailed, α = 0.05)

Step 2 — test statistic:
- SE = s/√n = 0.32/√10 = 0.32/3.1623 = 0.10119 g
- t = (x̄ − μ_0)/SE = (9.85 − 9.50)/0.10119 = 0.35/0.10119 = 3.459
- df = n − 1 = 9

Step 3 — critical value and p-value:
- t_crit(α = 0.05, df = 9, one-tailed) = 1.833 (from the t-table)
- Since t_obs = 3.459 > 1.833, reject H0
- p-value = P(T > 3.459 | df = 9). From the t-table: t_crit(0.005, 9, one-tailed) = 3.250; t_crit(0.001, 9, one-tailed) = 4.297. So 0.001 < p < 0.005. Interpolating: p ≈ 0.0036.
- p = 0.0036 < α = 0.05 ⇒ reject H0.

Step 4 — confidence interval (one-sided lower bound):
- 95% one-sided lower CI for μ = x̄ − t_crit × SE = 9.85 − 1.833 × 0.10119 = 9.85 − 0.1855 = 9.6645 g.
- The lower bound 9.665 g is above μ_0 = 9.50 g, consistent with rejecting H0.

Step 5 — effect size and practical significance:
- Cohen's d = (x̄ − μ_0)/s = (9.85 − 9.50)/0.32 = 0.35/0.32 = 1.09 — a large effect (d > 0.8).
- The 0.35 g mean excess over spec is practically significant (the wire-bond spec is set with a 0.50 g safety margin against the customer's 9.00 g absolute minimum).

Decision: reject H0. The wire-bond process mean (9.85 g) exceeds the spec target (9.50 g) with both statistical significance (p ≈ 0.0036, well below 0.05) and practical significance (Cohen's d = 1.09, lower 95% bound 9.665 g well above 9.50 g). The Analyze phase can proceed to root-cause any sub-target outliers; the Control phase will monitor μ with an I-MR chart set against the 9.50 g target.

**Chi-square (variance) — supplier σ verification.**
A supplier claims σ ≤ 0.05 mm on a critical dimension. The Green Belt samples n = 20 parts and measures s = 0.07 mm.
- H0: σ² ≤ 0.05² = 0.0025 mm²;  H1: σ² > 0.0025 mm² (one-tailed, α = 0.05).
- χ² = (n−1)s²/σ_0² = 19 × 0.0049/0.0025 = 0.0931/0.0025 = 37.24.
- df = 19; χ²_crit(α = 0.05, df = 19) = 30.14 (from χ²-table).
- Since 37.24 > 30.14, reject H0. The supplier's σ exceeds the claimed 0.05 mm at α = 0.05. p-value: P(χ² > 37.24 | df=19) ≈ 0.0077.`,
    industrial_example: `**Aerospace (titanium fastener tensile strength, two-supplier comparison).** A Six Sigma Black Belt at an aerospace fastener house qualifies a second titanium-fastener supplier (Supplier B) against the incumbent (Supplier A) on ultimate tensile strength (UTS). Supplier A: n_A = 15 specimens, x̄_A = 1,062 MPa, s_A = 24 MPa. Supplier B: n_B = 15, x̄_B = 1,048 MPa, s_B = 31 MPa. H0: μ_A = μ_B; H1: μ_A ≠ μ_B (two-tailed, α = 0.05). F-test on variances: F = 31²/24² = 1.67, F_crit(0.025, 14, 14) = 2.98 — equal variances retained. Pooled s_p² = [(14·576)+(14·961)]/28 = (8106+13454)/28 = 21560/28 = 770; s_p = 27.75 MPa. SE = 27.75·√(2/15) = 27.75·0.3651 = 10.13 MPa. t = (1062 − 1048)/10.13 = 14/10.13 = 1.382. df = 28; t_crit(0.025, 28) = 2.048. Since 1.382 < 2.048, fail to reject H0; p ≈ 0.178. The two suppliers are not statistically distinguishable on UTS at α = 0.05; the Black Belt qualifies Supplier B and proceeds to a paired-process-capability comparison rather than rejecting on a 14 MPa point estimate.`,
    case_study: `CASE_TYPE = SYNTHETIC. A Green Belt at a contract electronics manufacturer compared the surface-mount-placement (SMP) X/Y positional accuracy of two pick-and-place machines (Line 1: legacy, Line 2: new capital-equipment vendor claim of ±25 μm). Initial data: Line 1 n_1 = 30, x̄_1 = +12 μm (offset from nominal), s_1 = 18 μm; Line 2 n_2 = 30, x̄_2 = +5 μm, s_2 = 14 μm. A naive two-sample t (equal variance, pooled) gives s_p ≈ 16.1, t = (12 − 5)/[16.1·√(2/30)] = 7/4.16 = 1.68, p ≈ 0.098 — fail to reject H0 at α = 0.05; the Green Belt concludes "no significant difference." A second reviewer catches three errors: (i) the F-test on variances was skipped (F = 18²/14² = 1.65 — borderline, Welch's t is safer); (ii) the data were not checked for normality (a Shapiro-Wilk p = 0.04 on Line 1 rejects normality due to a single 60-μm outlier — the Mann-Whitney non-parametric test is appropriate); (iii) the practical difference (7 μm) was not compared to the customer tolerance (±50 μm; the 7 μm gap is < 15% of tolerance and commercially irrelevant). Reanalysis with Welch's t (df ≈ 55, t ≈ 1.70, p ≈ 0.095) and Mann-Whitney (p ≈ 0.12) both confirm fail-to-reject; with the outlier removed, normality holds and the t-test gives p = 0.21. The Green Belt retains both lines and shifts the question from "are they different?" to "are both Cpk ≥ 1.33 against the ±50 μm tolerance?" — the practical capability question the customer actually asked. Lesson: the p-value answers the statistical question; the engineering decision needs the effect size, the CI, the tolerance context, and the practical capability. Source: synthetic case authored for this lesson; method per Breyfogle (2003, Ch. 16) and Montgomery (SQC, Ch. 4).`,
    visual_explanation: `Picture the sampling distribution of the test statistic under H0 (a t-distribution centered at 0). The observed t_obs is a point on the x-axis; the p-value is the tail area beyond |t_obs|. α is the pre-chosen threshold area; the critical value t_crit is the boundary of the rejection region. If t_obs lies beyond t_crit (p ≤ α), reject H0; otherwise fail to reject. For a one-tailed test, the rejection region is in one tail (directional); for two-tailed, in both tails (×2 area, half in each). Power (1 − β) is the area under the H1 (shifted) sampling distribution that lies in the rejection region — it grows with sample size, effect size, and α. The (1−α) CI for the parameter is the set of all H0 values whose t_obs would not be rejected — a richer inference than the binary test.`,
    simulation_opportunity: `An interactive t-test simulator would let the learner set μ_0, n, α, and one- vs two-tailed, then draw samples from N(μ_true, σ²) and display the t-distribution under H0, the observed t_obs, the rejection region, the p-value, and the decision. A second control would let the learner set the true μ (deviating from μ_0) and run 1,000 simulations to display the empirical Type I rate (when μ = μ_0) and the empirical power (when μ ≠ μ_0). A third panel would overlay the (1−α) CI for μ and show the test/CI duality in real time.`,
    common_mistakes: `- Interpreting p as P(H0 true | data) — it is P(data | H0 true), conditional on H0.
- Reporting "p > 0.05 ⇒ H0 is true" — failing to reject is not proof H0 is true; it is absence of evidence against it.
- Using a one-tailed test to "make significance easier" without an engineering-justified directional hypothesis.
- Skipping the F-test (or Levene's) before pooling variances in a two-sample t — heterogeneity invalidates the pooled s_p form.
- Confusing paired and independent samples — pairing (same units before/after) requires the paired t, not the two-sample t.
- Reporting only the p-value without the effect size and CI — a tiny p with a tiny effect is meaningless; a large effect with p > 0.05 may be underpowered.
- Using χ² for association with expected cell counts E < 5 — use Fisher's exact test instead.
- Treating statistical significance as practical significance — large n makes any difference "significant"; large effect with small n may be "non-significant."`,
    limitations: `- t-test assumes approximately normal data; small n with strong skew requires non-parametric alternatives (Mann-Whitney, Wilcoxon).
- χ² for association requires expected cell counts E ≥ 5; sparse tables need Fisher's exact test.
- Multiple-comparison problem: running many tests inflates the family-wise α — use Bonferroni (α/m) or Tukey HSD for post-hoc comparisons.
- p-value is sensitive to sample size — large n makes trivial differences "significant"; small n misses real effects.
- The 0.05 α convention is historical (Fisher, 1925), not principled; report the actual p-value and the (1−α) CI.
- Hypothesis testing cannot prove H0; absence of evidence is not evidence of absence.
- Effect size and CI must accompany p for the engineering decision to be defensible.`,
    comparison: `**t-test variants:**
- One-sample t: x̄ vs μ_0 — single population vs a target.
- Two-sample t (pooled): x̄_1 vs x̄_2 — independent samples, equal variances.
- Two-sample t (Welch): x̄_1 vs x̄_2 — independent samples, unequal variances (robust default).
- Paired t: d̄ vs 0 — matched pairs (same units before/after); highest power for within-subject effects.

**Test families:**
- t-family: means (one-sample, two-sample, paired).
- χ²-family: variances (single-sample) and categorical association (r×c table).
- F-family / ANOVA: 3+ group means (one-way, two-way).
- Non-parametric: Mann-Whitney (two independent), Wilcoxon signed-rank (paired), Kruskal-Wallis (3+ groups) — when normality fails.

**p-value vs CI:**
- p-value: binary reject/fail-to-reject at α.
- CI: range of plausible parameter values; richer inference, supports the same decisions plus magnitude and precision.`,
    practical_application: `- **Measure phase baseline**: one-sample t vs the customer target sets the baseline μ and significance.
- **Analyze phase root cause**: two-sample t compares defectives vs non-defectives on a candidate X (e.g., cycle time, pressure).
- **Improve phase verification**: paired t (before/after on the same units) confirms the improvement is statistically real.
- **Control phase monitoring**: t-tests on subgroups feed SPC; the (1−α) CI on the mean is the standard chart annotation.
- **Supplier qualification**: two-sample t (incumbent vs candidate) plus Ppk comparison; the decision considers statistical AND practical significance.`,
    decision_scenario: `You are a Black Belt verifying an Improve-phase change to a solder-paste deposition process. The team claims the new stencil reduces paste-volume variability. Pre-change: n_1 = 20 boards, s_1 = 1.85 mil (thousandths of inch). Post-change: n_2 = 20 boards, s_2 = 1.20 mil. Specify H0 and H1 (one-sided — you want to demonstrate the variance decreased), compute the F-statistic and the p-value, and decide at α = 0.05. If you reject H0, compute the percent reduction in standard deviation and translate it into a Cpk improvement (assuming the spec is ±5 mil and μ is on target). If you fail to reject H0, what sample size would you need for 80% power to detect a variance ratio of (1.20/1.85)² = 0.42 at α = 0.05?`,
    practice_questions: `- **Q1 (Easy, Recall):** State the relationship between p-value, α, and the reject/fail-to-reject decision.
- **Q2 (Medium, Application):** Given n = 10, x̄ = 9.85, s = 0.32, μ_0 = 9.50 (one-tailed, α = 0.05) — compute t, df, the decision, and the p-value range.
- **Q3 (Medium, Understand):** Explain why a small p-value alone is insufficient for a Six Sigma decision.
- **Q4 (Hard, Analyze):** Compare the equal-variance pooled t and Welch's t for a dataset with s_1/s_2 = 2 — which would you report and why?`,
    certification_questions: `- **CSSGB-style (Easy, Calculation):** One-sample t, n = 16, t_obs = 2.45, two-tailed α = 0.05, df = 15. Critical value? Decision?
- **CSSBB-style (Medium, Analysis):** A two-sample t reports t = 1.4, p = 0.16 — explain why "no significant difference" is NOT the same as "the suppliers are equivalent."
- **CSSBB-style (Hard, Synthesis):** Design a paired t-test to verify an Improve-phase change; specify H0/H1, sample size for 80% power to detect δ = 0.5σ at α = 0.05.`,
    summary: `Hypothesis testing is the inferential bridge from sample to population: state H0 (no effect) and H1 (the engineering claim), choose α (Type I, consumer's risk; conventionally 0.05), compute the test statistic and p-value from the sampling distribution under H0, reject H0 if p ≤ α. Type II (β) is the miss risk; power = 1−β. The t-test family handles means (one-sample, two-sample, paired); chi-square handles variances and categorical association. The p-value is P(data | H0) — NOT P(H0 | data). Statistical significance (p ≤ α) must be paired with practical significance (effect size, CI width) for the Six Sigma decision.`,
    key_takeaways: `- H0 / H1 / α / β / power are the five invariants of every test.
- p-value = P(data this extreme or more | H0 true) — never P(H0 true | data).
- One-sample, two-sample (pooled or Welch), and paired t-tests handle means; chi-square handles variances and categorical association.
- Reject H0 if p ≤ α; "fail to reject" is NOT "accept H0."
- Report p-value + (1−α) CI + effect size — never the p-value alone.
- Statistical significance ≠ practical significance; large n makes trivial differences "significant."`,
    references: `- ASQ Six Sigma Black Belt Body of Knowledge.
- ASQ Six Sigma Green Belt Body of Knowledge.
- Montgomery (2013), Statistical Quality Control, Ch. 3 (Hypothesis Testing), Ch. 5 (t-tests), Ch. 6 (chi-square, F).
- Montgomery (2019), Design and Analysis of Experiments, Ch. 3 (Experiments with a single factor — ANOVA, F-tests).
- Breyfogle (2003), Implementing Six Sigma, Ch. 14 (Hypothesis tests), Ch. 15 (t-tests), Ch. 16 (chi-square, F).
- Pande, Neuman & Cavanagh (2014), The Six Sigma Way, Ch. 7 (Analyze phase — hypothesis testing in DMAIC context).`,
  },
  knowledgeObject: {
    title: "Hypothesis Testing — H0/H1, p-value, α/β, t-test, χ²",
    domain: "Analyze",
    competency: "Hypothesis Testing",
    topic: "Hypothesis Testing",
    concept: "H0/H1, Type I/II errors, p-value, t-tests, and chi-square tests",
    body: {
      definitions: [
        "H0 (null hypothesis): the conservative claim — typically 'no difference, no effect, on target.'",
        "H1 / Ha (alternative): the engineering claim — 'there is a difference, an effect, a shift.'",
        "α (Type I error rate): P(reject H0 | H0 true). The false-alarm / consumer's risk. Conventionally 0.05.",
        "β (Type II error rate): P(fail to reject H0 | H0 false). The miss / producer's risk. Conventionally 0.10–0.20.",
        "Power = 1 − β: probability of correctly detecting a true effect. Target ≥ 0.80.",
        "p-value: P(data this extreme or more | H0 true). NOT P(H0 true | data).",
        "Test statistic (t, χ², F, Z): data-driven quantity whose sampling distribution under H0 yields the p-value.",
        "df (degrees of freedom): indexes the t and χ² sampling distributions.",
        "Critical value: threshold on the test statistic beyond which H0 is rejected at α.",
        "(1−α) confidence interval: the set of H0 values not rejected by a two-tailed test at α — the test/CI duality.",
        "Cohen's d: (μ_1 − μ_2)/s_p — practical magnitude of the difference, independent of n.",
        "Paired t: t-test on within-pair differences d_i = x_i − y_i; removes between-subject variance.",
      ],
      principles: [
        "H0 is conservative; H1 is what you want to demonstrate. Reject H0 or fail to reject — never 'accept H0.'",
        "α is the user-chosen Type I risk; β is Type II; power = 1 − β.",
        "p-value = P(data | H0), NOT P(H0 | data).",
        "Statistical significance (p ≤ α) ≠ practical significance (effect size + CI). Report both.",
        "Sample size is the design lever: n ≈ [(z_{1−α/2} + z_{1−β})·σ/δ]² for the one-sample t.",
        "One-tailed only with an engineering-justified directional hypothesis; two-tailed is the safer default.",
        "Test/CI duality: a (1−α) CI contains all H0 values not rejected at α.",
      ],
      components: [
        "Hypotheses H0 and H1 (one- or two-tailed).",
        "α (0.05) and target power (0.80).",
        "Test statistic with sampling distribution and df.",
        "p-value from the sampling distribution under H0.",
        "Critical value(s) and rejection region.",
        "(1−α) confidence interval for the parameter.",
        "Effect size (Cohen's d, odds ratio).",
        "Power curve and sample-size formula.",
      ],
      mechanism: "The test statistic summarizes the data's incompatibility with H0; the sampling distribution under H0 yields the tail-area probability (p-value) of observing a statistic at least as extreme. Reject H0 if p ≤ α. The decision is asymmetric: 'reject' or 'fail to reject' — never 'accept H0.'",
      process: "State H0/H1 → choose α and target power → compute n → sample data (verify MSA first) → select test (one-sample/two-sample/paired t, χ²) → compute test statistic + df + p-value → decide (p ≤ α ⇒ reject) → report p + CI + effect size + practical interpretation.",
      formulas: [
        "One-sample t: t = (x̄ − μ_0)/(s/√n), df = n − 1",
        "Two-sample t (pooled): t = (x̄_1 − x̄_2)/[s_p·√(1/n_1 + 1/n_2)], s_p² = [(n_1−1)s_1² + (n_2−1)s_2²]/(n_1+n_2−2), df = n_1+n_2−2",
        "Two-sample t (Welch): t = (x̄_1 − x̄_2)/√(s_1²/n_1 + s_2²/n_2), df_W = (s_1²/n_1 + s_2²/n_2)²/[(s_1²/n_1)²/(n_1−1) + (s_2²/n_2)²/(n_2−1)]",
        "Paired t: t = d̄/(s_d/√n), df = n − 1, d_i = x_i − y_i",
        "Chi-square (variance): χ² = (n−1)s²/σ_0², df = n − 1",
        "Chi-square (association): χ² = Σ[(O − E)²/E], E = (row × col)/grand, df = (r−1)(c−1)",
        "Cohen's d = (μ_1 − μ_2)/s_p (0.2 small, 0.5 medium, 0.8 large)",
        "Sample size (one-sample t, two-sided α, power 1−β): n ≈ [(z_{1−α/2} + z_{1−β})·σ/δ]²",
      ],
      metrics: [
        "α = 0.05 (convention); β = 0.10–0.20 (target); power ≥ 0.80.",
        "t_crit(α=0.05, df=9, one-tailed) = 1.833; (two-tailed) = 2.262.",
        "Cohen's d: 0.2 small, 0.5 medium, 0.8 large.",
        "(1−α) CI width indicates precision; pair with effect size.",
        "Power grows with n, effect size, and α.",
      ],
      examples: [
        "n=10, x̄=9.85, s=0.32, μ_0=9.50 (one-tailed α=0.05): t=3.46, df=9, p≈0.0036 → reject H0; 95% lower CI = 9.665 g.",
        "χ² variance test: n=20, s=0.07, σ_0=0.05; χ² = 19×0.0049/0.0025 = 37.24, df=19, p≈0.0077 → reject H0.",
        "Cohen's d = 0.35/0.32 = 1.09 (large effect) for the wire-bond pull-strength example.",
      ],
      industrial_examples: [
        "Aerospace titanium-fastener UTS (two-supplier two-sample t): t=1.38, p≈0.178 → fail to reject; suppliers not statistically distinguishable on UTS.",
        "Supplier σ verification via χ²: reject the supplier's σ claim when sample s exceeds spec.",
      ],
      case_studies: [
        "SYNTHETIC — SMT pick-and-place X/Y accuracy (two-machine two-sample t): naive equal-variance t = 1.68, p = 0.098 — fail to reject; reviewer caught skipped F-test, non-normality (outlier), and missing practical-vs-tolerance context; reanalysis with Welch's t and Mann-Whitney confirms fail-to-reject; engineering decision shifts to capability comparison against ±50 μm tolerance.",
      ],
      common_errors: [
        "Interpreting p as P(H0 true | data).",
        "Reporting 'p > 0.05 ⇒ H0 is true' — failing to reject is NOT proof H0 is true.",
        "Using one-tailed to 'make significance easier' without an engineering-justified directional hypothesis.",
        "Skipping the F-test before pooling variances in the two-sample t.",
        "Confusing paired and independent samples (the paired t uses d_i = x_i − y_i, not the pooled s_p).",
        "Reporting only p without effect size and CI.",
        "Using χ² for association with expected cell counts E < 5 (use Fisher's exact instead).",
      ],
      limitations: [
        "t-test assumes approximately normal data; small n + skew ⇒ non-parametric (Mann-Whitney, Wilcoxon).",
        "χ² association requires E ≥ 5; sparse tables need Fisher's exact.",
        "Multiple-comparison problem: family-wise α inflates with many tests (use Bonferroni or Tukey HSD).",
        "p-value is sensitive to sample size; large n makes trivial differences 'significant.'",
        "The 0.05 α convention is historical, not principled — report the actual p.",
        "Hypothesis testing cannot prove H0; absence of evidence ≠ evidence of absence.",
      ],
      best_practices: [
        "Report p-value + (1−α) CI + effect size + practical interpretation — never p alone.",
        "Pre-flight the data: MSA, distribution shape (normality or transform), variance homogeneity (F-test/Levene's).",
        "Default to Welch's two-sample t (robust to variance heterogeneity).",
        "Use one-tailed only with engineering-justified directional H1; otherwise two-tailed.",
        "Design for power: compute n from the smallest practically meaningful effect δ at α = 0.05, power = 0.80.",
        "Connect the test decision to the DMAIC phase (Measure baseline, Analyze root cause, Improve verify, Control monitor).",
      ],
      related_concepts: [
        "Process Capability (Cp/Cpk) — the descriptive complement to the inferential test.",
        "ANOVA & FMEA — multi-group extension of the t-test and the risk-prioritization linkage.",
        "Regression & Correlation — continuous-X hypothesis testing via the slope t-test.",
        "MSA / Gage R&R — the pre-condition for valid tests.",
        "SPC — the Control-phase application of hypothesis testing over time.",
      ],
      prerequisites: [
        "Descriptive statistics: mean, variance, std dev.",
        "Normal and t distributions; standard normal Z; t-table use.",
        "Confidence intervals and the (1−α) concept.",
        "Degrees of freedom, sampling-distribution intuition.",
      ],
      references: [
        "ASQ Six Sigma Black Belt BOK (Analyze — hypothesis testing).",
        "ASQ Six Sigma Green Belt BOK (Analyze — hypothesis testing).",
        "Montgomery, Statistical Quality Control, Ch. 3 (Hypothesis Testing), Ch. 5 (t-tests), Ch. 6 (chi-square, F).",
        "Montgomery, Design and Analysis of Experiments, Ch. 3 (single-factor experiments, ANOVA).",
        "Breyfogle, Implementing Six Sigma, Ch. 14 (Hypothesis tests), Ch. 15 (t-tests), Ch. 16 (chi-square).",
        "Pande, Neuman & Cavanagh, The Six Sigma Way, Ch. 7 (Analyze phase).",
      ],
    },
  },
  questions: [
    {
      competencyName: "Hypothesis Testing",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Manufacturing",
      stem: "A wire-bond pull-strength sample has n = 10, x̄ = 9.85 g, s = 0.32 g, and the customer spec target is μ_0 = 9.50 g. The engineer claims the process exceeds spec (one-tailed, α = 0.05). Compute t, df, the decision, and the p-value range.",
      whyCorrect:
        "SE = s/√n = 0.32/√10 = 0.1012 g. t = (x̄ − μ_0)/SE = (9.85 − 9.50)/0.1012 = 0.35/0.1012 = 3.459 ≈ 3.46. df = n − 1 = 9. From the t-table, t_crit(α = 0.05, df = 9, one-tailed) = 1.833. Since t_obs = 3.46 > 1.833, reject H0. The p-value is bounded by t_crit(0.005, df=9, one-tailed) = 3.250 (p < 0.005) and t_crit(0.001, df=9, one-tailed) = 4.297 (p > 0.001); interpolating gives p ≈ 0.0036, well below α = 0.05.",
      whyOthersWrong: [
        "Option A (t=1.83, df=10, p>0.05, fail to reject) — uses df = n (not n−1), and uses SE = s (not s/√n); the resulting t = 0.35/0.32 = 1.09 is the wrong test statistic (it omits √n).",
        "Option C (t=3.46, df=9, p<0.05, fail to reject) — the decision is inverted; t = 3.46 > 1.833 and p < α = 0.05 ⇒ reject H0, not fail to reject.",
        "Option D (t=0.35, df=9, p≈0.37, fail to reject) — reports (x̄ − μ_0) as the t-statistic without dividing by SE; t = 0.35/0.1012 = 3.46, not 0.35.",
      ],
      explanation:
        "t = (x̄ − μ_0)/(s/√n) = 0.35/0.1012 = 3.46, df = 9, p ≈ 0.0036 (between 0.001 and 0.005). Reject H0 — the process mean exceeds 9.50 g with statistical significance at α = 0.05.",
      options: [
        { text: "t=1.83, df=10, p>0.05 — fail to reject H0", isCorrect: false },
        { text: "t=3.46, df=9, p≈0.004 — reject H0", isCorrect: true },
        { text: "t=3.46, df=9, p<0.05 — fail to reject H0", isCorrect: false },
        { text: "t=0.35, df=9, p≈0.37 — fail to reject H0", isCorrect: false },
      ],
    },
    {
      competencyName: "Hypothesis Testing",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "Which of the following is the correct interpretation of the p-value?",
      whyCorrect:
        "The p-value is the probability of observing a test statistic at least as extreme as the one observed, ASSUMING H0 is true — i.e., a tail-area probability under H0's sampling distribution. It is a conditional probability P(data | H0), not P(H0 | data). A small p says 'the data would be unusual if H0 were true,' which is evidence against H0; it does NOT say 'H0 is false' or 'the result is due to chance.' The BOK emphasizes pairing p with the (1−α) CI and the effect size for a defensible engineering decision.",
      whyOthersWrong: [
        "Option A (probability that H0 is true given the data) is the inverse-probability fallacy — p is P(data | H0), not P(H0 | data).",
        "Option C (probability the result is due to chance) is wrong — the result's 'chance' probability is not what p measures; p measures tail-area extremity under H0.",
        "Option D (1 minus the probability that H1 is true) is wrong — p does not involve H1's probability at all.",
      ],
      explanation:
        "p-value = P(data this extreme or more | H0 true). It is conditional on H0 and is a tail-area probability under H0's sampling distribution. It is NOT P(H0 | data).",
      options: [
        { text: "The probability that H0 is true, given the observed data", isCorrect: false },
        { text: "The probability of observing data this extreme or more, assuming H0 is true", isCorrect: true },
        { text: "The probability that the observed result is due to chance", isCorrect: false },
        { text: "1 minus the probability that the alternative hypothesis is true", isCorrect: false },
      ],
    },
    {
      competencyName: "Hypothesis Testing",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Automotive",
      stem: "A two-sample t-test reports t = 1.40, p = 0.16 (df = 28, α = 0.05). The team concludes 'the two suppliers are equivalent — switch to the cheaper one.' What is the correct critique of this conclusion?",
      whyCorrect:
        "The conclusion commits the absence-of-evidence fallacy: 'failing to reject H0' is NOT proof that H0 is true. The test only says the data are consistent with H0 (no difference); it does not say the suppliers are equivalent. To support 'equivalence' requires an equivalence test (TOST — two one-sided tests against an equivalence margin δ), not the standard difference test. Additionally, p = 0.16 may reflect underpowering — a sample-size calculation may show that n = 15 per group cannot reliably detect the smallest practically meaningful difference. The team must (i) compute the effect size and (1−α) CI to see if the difference is within the engineering equivalence margin, (ii) compute the power curve to see whether the test was capable of detecting the meaningful difference, and (iii) only then decide. A naive 'p > 0.05 ⇒ equivalent' is a Six Sigma anti-pattern.",
      whyOthersWrong: [
        "Option A (the conclusion is correct — p > 0.05 means no difference) is wrong — it commits the absence-of-evidence fallacy; failing to reject H0 is not proof H0 is true.",
        "Option C (the conclusion is correct because n = 15 per group is sufficient) is wrong — the sample size is asserted without a power calculation; n = 15 per group is often insufficient for 80% power to detect small-to-medium differences.",
        "Option D (the conclusion is correct because p-values are subjective) is wrong — p-values are objective tail-area probabilities; the issue is the team's interpretation, not the p-value's subjectivity.",
      ],
      explanation:
        "'p > 0.05 ⇒ equivalent' is the absence-of-evidence fallacy. Failing to reject H0 ≠ proof H0 is true. Equivalence requires a TOST equivalence test against a margin δ, plus effect-size + CI + power-curve analysis.",
      options: [
        { text: "The conclusion is correct — p > 0.05 means there is no difference between suppliers", isCorrect: false },
        { text: "Failing to reject H0 is NOT proof H0 is true; equivalence requires a TOST equivalence test plus effect-size, CI, and power analysis", isCorrect: true },
        { text: "The conclusion is correct because n = 15 per group is always sufficient for supplier comparison", isCorrect: false },
        { text: "The conclusion is correct because p-values are subjective and the team's interpretation is acceptable", isCorrect: false },
      ],
    },
    {
      competencyName: "Hypothesis Testing",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: A p-value of 0.001 means there is a 0.1% probability that the null hypothesis is true.",
      whyCorrect:
        "False. The p-value is P(data this extreme or more | H0 is true) — the probability of the data (or more extreme) ASSUMING H0 is true. It is NOT P(H0 is true | data). A p-value of 0.001 says 'the observed data would be quite unusual (probability 0.001) if H0 were true,' which is strong evidence against H0; it does NOT say 'there is a 0.1% chance H0 is true.' The inverse-probability fallacy (confusing P(data | H0) with P(H0 | data)) is the single most common p-value mistake and is explicitly addressed in the ASQ Six Sigma BOK. The Bayesian posterior P(H0 | data) requires a prior and is not what the p-value delivers.",
      whyOthersWrong: [
        "True — the candidate commits the inverse-probability fallacy, confusing P(data | H0) (the p-value) with P(H0 | data) (the Bayesian posterior). The two are different quantities; the p-value does not yield a probability that H0 is true.",
      ],
      explanation:
        "p-value = P(data | H0), NOT P(H0 | data). p = 0.001 means 'data this extreme would occur with probability 0.001 if H0 were true' — strong evidence against H0, but not a 0.1% probability that H0 is true.",
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Regression & Correlation
// (Competency: "Regression & Correlation"; slug: ss-regression-correlation)
// ---------------------------------------------------------------------------

const LESSON_REGRESSION_CORRELATION: RefLesson = {
  competencyName: "Regression & Correlation",
  slug: "ss-regression-correlation",
  title: "Regression & Correlation — Pearson r, y=b0+b1·x, R², Residuals",
  titleAr: "الانحدار والارتباط — معامل بيرسون r، y=b0+b1·x، R²، والبواقي",
  order: 3,
  durationMin: 38,
  references: SS_REFERENCE_TITLES,
  conceptIntroduction: `Regression and correlation are the Analyze-phase tools that quantify the relationship between a continuous Y (the response) and one or more continuous Xs (the predictors). Pearson's correlation coefficient r measures the strength and direction of the LINEAR association between two variables: r ∈ [−1, +1], with |r| = 1 a perfect linear relationship and r = 0 no linear correlation. The coefficient of determination R² = r² is the fraction of variance in Y explained by the linear model — R² ∈ [0, 1]. Simple linear regression fits y = b0 + b1·x by ordinary least squares (OLS): b1 = S_xy/S_xx = Σ(x−x̄)(y−ȳ)/Σ(x−x̄)² and b0 = ȳ − b1·x̄, minimizing Σ(y_i − ŷ_i)². The residuals e_i = y_i − ŷ_i must satisfy four diagnostic conditions: independence, approximate normality of residuals, homoscedasticity (constant variance), and linearity. The single most-taught BOK principle: CORRELATION DOES NOT IMPLY CAUSATION — a high r is necessary but not sufficient evidence of a causal link; only a designed experiment (DOE, in the Improve phase) establishes causation by randomizing and controlling X. The bridge to multiple regression and DOE is the slope's t-test (H0: β1 = 0; reject ⇒ X linearly predicts Y).`,
  example: `A coating-thickness study measures application time (x, seconds) and final thickness (y, μm) at 10 settings: x = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100}, y = {11, 19, 23, 33, 39, 44, 52, 59, 63, 73}. Summary: n = 10, Σx = 550, x̄ = 55, Σ(x−x̄)² = 8250; Σy = 416, ȳ = 41.6, Σ(y−ȳ)² = 3734.4; Σ(x−x̄)(y−ȳ) = 5540. Pearson r = S_xy/√(S_xx·S_yy) = 5540/√(8250 × 3734.4) = 5540/5550.6 = 0.9981. R² = r² = 0.9962 (99.62% of variance in y is explained by x). Slope b1 = S_xy/S_xx = 5540/8250 = 0.6715 μm/s. Intercept b0 = ȳ − b1·x̄ = 41.6 − 0.6715 × 55 = 4.67 μm. Fitted model: ŷ = 4.67 + 0.672·x. For x = 70 s, ŷ = 4.67 + 0.672 × 70 = 51.67 μm (actual y = 52; residual = 0.33 μm). SST = 3734.4; SSE = Σe_i² ≈ 14.21; SSR = SST − SSE = 3720.2; R² = SSR/SST = 0.9962. Slope t-test: SE(b1) = √(MSE/S_xx) = √(14.21/8 × 1/8250) = √(1.776/8250) = 0.01467; t = b1/SE = 0.6715/0.01467 = 45.8, df = 8, p ≪ 0.001 — slope is highly significant.`,
  keyFormulas: `Pearson r = S_xy / √(S_xx · S_yy), where
  S_xy = Σ(x_i − x̄)(y_i − ȳ);  S_xx = Σ(x_i − x̄)²;  S_yy = Σ(y_i − ȳ)²
R² = r² = SSR / SST = 1 − SSE/SST
Simple linear regression (OLS):  ŷ = b0 + b1·x
  b1 = S_xy / S_xx;   b0 = ȳ − b1 · x̄
  SST = S_yy = Σ(y_i − ȳ)²
  SSR = b1 · S_xy = Σ(ŷ_i − ȳ)²   (regression sum of squares)
  SSE = Σ(y_i − ŷ_i)² = Σe_i²   (residual/error sum of squares)
  SST = SSR + SSE   (partitioning of variance)
Residual:  e_i = y_i − ŷ_i
MSE = SSE / (n − 2);  SE(b1) = √(MSE / S_xx)
Slope t-test:  t = b1 / SE(b1),  df = n − 2,  H0: β1 = 0, H1: β1 ≠ 0
(1−α) CI for the mean response at x_0:  ŷ_0 ± t_{α/2, n−2} · √[MSE · (1/n + (x_0 − x̄)²/S_xx)]
Prediction interval at x_0:  ŷ_0 ± t_{α/2, n−2} · √[MSE · (1 + 1/n + (x_0 − x̄)²/S_xx)]
Cohen's d-style effect size for slope:  f² = R² / (1 − R²)`
,
  exercise: `You are a Green Belt investigating the relationship between mold temperature (x, °C) and part shrinkage (y, mm) on an injection-molding process. You collect 12 data points. (a) Compute Pearson r and R²; interpret. (b) Fit the OLS regression line y = b0 + b1·x; report b0 and b1 with units. (c) Compute the residual for the highest-temperature data point; assess the four diagnostic conditions (independence, normality of residuals, homoscedasticity, linearity). (d) Test H0: β1 = 0 vs H1: β1 ≠ 0 at α = 0.05; report t, df, and p. (e) Predict y at x = 60 °C and give the 95% prediction interval. (f) State three plausible confounders that would prevent concluding "mold temperature causes shrinkage" without a DOE.`,
  sections: {
    learning_objectives: `- Compute Pearson's r from raw data via S_xy, S_xx, S_yy; interpret r ∈ [−1, +1] and R² = r² ∈ [0, 1].
- Fit a simple linear regression y = b0 + b1·x by ordinary least squares; compute b0, b1, SST, SSR, SSE, R².
- Define a residual e_i = y_i − ŷ_i; verify the four diagnostic conditions (independence, normality, homoscedasticity, linearity).
- Test the slope H0: β1 = 0 via t = b1/SE(b1); interpret the p-value and the (1−α) CI for the slope.
- Compute the (1−α) confidence interval for the mean response and the (1−α) prediction interval for a new observation at x_0.
- State the BOK principle "correlation does not imply causation"; explain the bridge to DOE (Improve phase) for causal claims.`,
    prerequisites: `- Descriptive statistics: mean, variance, covariance, standard deviation.
- Hypothesis testing (the slope's t-test builds on Lesson 2).
- The normal distribution and t-distribution; standard error and confidence interval concepts.
- Scatter plots, line-fitting intuition; least-squares minimization conceptually.`,
    introduction: `Regression and correlation are the Analyze-phase tools for quantifying a continuous-X vs continuous-Y relationship. The BOK uses them to (i) screen candidate Xs during root-cause analysis (a high-|r| X is a candidate vital few; a low-|r| X is a candidate trivial many), (ii) build a prediction model ŷ = f(x) for the Improve phase, and (iii) set up the design-of-experiments (DOE) sequence by confirming that X has predictive power before committing DOE budget.

Pearson's r quantifies the linear association strength and direction: r ∈ [−1, +1], with sign indicating direction (positive: as x increases y increases; negative: as x increases y decreases) and |r| the strength. r = ±1 is perfect linear; r = 0 is no LINEAR correlation (a curvilinear relationship can have r ≈ 0 — always plot the data). The coefficient of determination R² = r² is the fraction of variance in Y explained by the linear model on X: R² ∈ [0, 1]. R² = 0.99 means 99% of the variation in Y is captured by the linear model; R² = 0.10 means only 10% is.

Simple linear regression fits y = b0 + b1·x by ordinary least squares (OLS), minimizing Σ(y_i − ŷ_i)². The OLS solutions are b1 = S_xy/S_xx and b0 = ȳ − b1·x̄, where S_xy = Σ(x−x̄)(y−ȳ) and S_xx = Σ(x−x̄)². The total sum of squares SST = Σ(y−ȳ)² partitions into SSR (regression, explained by the model) + SSE (residual, unexplained): SST = SSR + SSE. R² = SSR/SST = 1 − SSE/SST.

The residuals e_i = y_i − ŷ_i must satisfy four diagnostic conditions: (i) independence (no time-series or spatial autocorrelation — check with a residual run chart and the Durbin-Watson statistic); (ii) approximate normality of residuals (Anderson-Darling on e_i); (iii) homoscedasticity (constant variance across x — check the residual-vs-x plot; funnel shapes indicate heteroscedasticity, requiring a transform); (iv) linearity (the residual-vs-x plot should be a random scatter; a curved pattern indicates a non-linear model is needed — try a quadratic or transform y).

The single most-taught BOK principle: CORRELATION DOES NOT IMPLY CAUSATION. A high r between X and Y can arise from (i) X causes Y, (ii) Y causes X, (iii) a confounder Z causes both, or (iv) pure coincidence. A designed experiment (DOE, in the Improve phase) — where the engineer randomizes and controls X — is the only method that establishes causation by breaking the confounder-Z link. Regression on observational data is hypothesis-generating, not causation-establishing.

The bridge to multiple regression: simple regression is the n=1 case of multiple regression y = b0 + b1·x1 + b2·x2 + … + bk·xk, where R² adjusts for the number of predictors (R²_adj = 1 − (1−R²)·(n−1)/(n−k−1)). The Improve-phase DOE generalizes further: each x_i is set at deliberate levels (−1, 0, +1 coded), and the model becomes a designed response surface — the foundation for Montgomery's Design and Analysis of Experiments.`,
    terminology: `- **Pearson's r**: linear correlation coefficient, r ∈ [−1, +1]; S_xy/√(S_xx·S_yy).
- **R² (coefficient of determination)**: r² = SSR/SST; fraction of variance in Y explained by the linear model.
- **Simple linear regression**: y = b0 + b1·x; one predictor, one response.
- **OLS (ordinary least squares)**: the minimization of Σ(y_i − ŷ_i)²; the closed-form b1 = S_xy/S_xx and b0 = ȳ − b1·x̄.
- **Slope b1**: rate of change of y per unit x (units: y-units / x-units).
- **Intercept b0**: predicted y at x = 0 (extrapolation outside the data range is risky).
- **Fitted value ŷ_i**: b0 + b1·x_i (the model's prediction at x_i).
- **Residual e_i**: y_i − ŷ_i (the model's error at observation i).
- **SST (total sum of squares)**: Σ(y_i − ȳ)²; the total variation in y.
- **SSR (regression sum of squares)**: Σ(ŷ_i − ȳ)²; variation explained by the model.
- **SSE (error/residual sum of squares)**: Σe_i² = Σ(y_i − ŷ_i)²; unexplained variation. SST = SSR + SSE.
- **MSE = SSE/(n−2)**: mean square error, an estimate of σ².
- **SE(b1) = √(MSE/S_xx)**: standard error of the slope; shrinks with S_xx (more x-spread) and n.
- **Slope t-test**: t = b1/SE(b1), df = n−2; H0: β1 = 0; reject ⇒ x linearly predicts y.
- **Confidence interval (mean response)**: range for E[y|x_0]; narrower than the prediction interval.
- **Prediction interval**: range for a NEW observation at x_0; wider because it includes the σ² of the new noise.
- **Correlation ≠ causation**: high r is necessary but not sufficient for causation; only DOE establishes causation.`,
    detailed_explanation: `Pearson's r is the standardized covariance: r = S_xy/√(S_xx·S_yy), where S_xy = Σ(x−x̄)(y−ȳ), S_xx = Σ(x−x̄)², S_yy = Σ(y−ȳ)². It is dimensionless, in [−1, +1], symmetric (r(x,y) = r(y,x)), and invariant to linear transformations of x and y. The sign indicates direction; |r| the strength. Pearson's r captures only LINEAR association — a perfectly deterministic curvilinear y = x² on x ∈ [−1, +1] has r ≈ 0; always plot the data (Anscombe's quartet is the canonical illustration).

R² = r² is the fraction of variance in y explained by the linear model. For simple linear regression, R² is exactly r²; for multiple regression, R² is the multivariate analogue. R² ∈ [0, 1], with R² = 1 a perfect fit and R² = 0 no linear predictive power. Breyfogle (2003) recommends reporting R² and the residual standard error √MSE together: a model with R² = 0.99 but MSE large in engineering units is still imprecise for prediction.

The OLS line minimizes Σ(y_i − ŷ_i)². Setting the partial derivatives to zero yields the normal equations and the closed form: b1 = S_xy/S_xx; b0 = ȳ − b1·x̄. The OLS line passes through (x̄, ȳ) — the centroid of the data. Properties: unbiased estimators of β0 and β1 under the linear-model assumptions; minimum variance among linear unbiased estimators (Gauss-Markov).

The variance partition SST = SSR + SSE is the heart of regression inference. SST = Σ(y−ȳ)² is the total variation in y. SSR = Σ(ŷ−ȳ)² is the variation explained by the model (the "regression"). SSE = Σe² is the residual variation. R² = SSR/SST = 1 − SSE/SST. A model with R² = 0.996 explains 99.6% of the variation in y; only 0.4% is residual noise.

The four diagnostic conditions are the BOK's regression-quality gate. (i) Independence: the residuals e_i must be independent — no time-series or spatial autocorrelation. A residual run chart and the Durbin-Watson statistic (DW ≈ 2 ⇒ independent; DW → 0 or 4 ⇒ positive/negative autocorrelation) detect violations. (ii) Normality of residuals: the e_i should be approximately normal (Anderson-Darling test); heavy tails or skew invalidate the slope's t-test confidence statements. (iii) Homoscedasticity: the variance of e_i should be constant across x. A residual-vs-x plot with a funnel shape (variance grows with x) is heteroscedastic — fix by transforming y (log, square-root) or weighted least squares. (iv) Linearity: the residual-vs-x plot should be a random scatter; a curved pattern indicates the model should include x² or a transformation.

The slope's t-test evaluates H0: β1 = 0 (x has no linear predictive power) vs H1: β1 ≠ 0. The test statistic t = b1/SE(b1), SE(b1) = √(MSE/S_xx), df = n−2. A small p (≤ α) ⇒ reject H0 ⇒ x linearly predicts y. The (1−α) CI for β1 is b1 ± t_{α/2, n−2} × SE(b1). The CI is the richer inference: it shows both the significance and the precision of the slope estimate. A long CI indicates underpowering; a short CI near zero indicates the slope is precisely estimated to be near zero (x is a non-predictor).

The (1−α) confidence interval for the mean response at x_0 is ŷ_0 ± t × √[MSE × (1/n + (x_0 − x̄)²/S_xx)] — narrowest at x_0 = x̄ and widening as x_0 moves away from x̄ (extrapolation is dangerous). The (1−α) prediction interval for a NEW observation at x_0 is ŷ_0 ± t × √[MSE × (1 + 1/n + (x_0 − x̄)²/S_xx)] — wider because it includes the new observation's noise σ². Distinguish the two: the CI answers "where is the mean response?" — the PI answers "where will one new observation fall?".

CORRELATION ≠ CAUSATION is the central BOK teaching. A high r between X and Y admits four explanations: (i) X → Y (causal, the direction we want), (ii) Y → X (reverse causation), (iii) Z → X and Z → Y (confounder — Z is the common cause), (iv) coincidence (large observational datasets uncover spurious high-|r| pairs). Only a designed experiment — randomize X, control confounders, observe Y — establishes the causal direction by breaking the Z-link. The Improve-phase DOE is the operationalization of this principle: the engineer sets X at deliberate levels (−1, 0, +1 coded), randomizes run order, and infers causation from the resulting response surface. Regression on observational data is the Analyze-phase hypothesis-generator; DOE in the Improve phase is the causation-establisher.`,
    core_principles: `- Pearson's r measures LINEAR association only — always plot the data (Anscombe's quartet).
- R² = r² is the fraction of variance in Y explained by the linear model on X.
- OLS minimizes Σ(y_i − ŷ_i)²; b1 = S_xy/S_xx; b0 = ȳ − b1·x̄; the line passes through (x̄, ȳ).
- Variance partition: SST = SSR + SSE; R² = SSR/SST = 1 − SSE/SST.
- Four residual diagnostics: independence, normality, homoscedasticity, linearity.
- Slope t-test: t = b1/SE(b1), df = n−2; reject H0: β1 = 0 ⇒ X linearly predicts Y.
- CORRELATION ≠ CAUSATION. Only DOE (Improve phase) establishes causation by randomizing X.
- CI (mean response) vs PI (new observation): the PI is wider because it includes σ² of the new noise.`,
    components: `- Scatter plot of y vs x — the always-first step (never regress without plotting).
- Pearson's r and R² — the linear-association summary.
- OLS line ŷ = b0 + b1·x — the prediction model.
- Residuals e_i = y_i − ŷ_i — the model's errors.
- Residual-vs-x plot and residual-vs-ŷ plot — the four-diagnostic gate.
- Slope's SE and t-test — the significance of the linear predictor.
- (1−α) CI for the mean response — the precision of E[y|x].
- (1−α) PI for a new observation — the precision of a single new y.`,
    process: `1. Plot y vs x (scatter); inspect for linearity, outliers, clusters.
2. Compute S_xy, S_xx, S_yy; r = S_xy/√(S_xx·S_yy); R² = r².
3. Fit OLS: b1 = S_xy/S_xx; b0 = ȳ − b1·x̄.
4. Compute fitted values ŷ_i and residuals e_i = y_i − ŷ_i.
5. Verify diagnostics: residual-vs-x plot (linearity, homoscedasticity); residual run chart / Durbin-Watson (independence); Anderson-Darling on e_i (normality).
6. Test the slope: t = b1/SE(b1), df = n−2; reject H0: β1 = 0 if p ≤ α; report the (1−α) CI for β1.
7. Compute SST, SSR, SSE; verify SST = SSR + SSE; report R² = SSR/SST.
8. If diagnostics pass, use the model for prediction: (1−α) CI for E[y|x_0], (1−α) PI for new y at x_0. Do NOT extrapolate beyond the x-range of the data.
9. For causation claims, transition to the Improve phase: design a DOE that randomizes X and controls confounders Z.`,
    formula_calculation: `Variables:
- x_i, y_i: paired observations [measurement units, e.g., s and μm]
- x̄, ȳ: sample means [same units]
- S_xy = Σ(x_i − x̄)(y_i − ȳ): cross-product [x-units × y-units]
- S_xx = Σ(x_i − x̄)²: sum of squares of x [x-units²]
- S_yy = Σ(y_i − ȳ)²: total sum of squares (SST) [y-units²]
- r: Pearson correlation coefficient [dimensionless, ∈ [−1, +1]]
- R²: coefficient of determination [dimensionless, ∈ [0, 1]]
- b0, b1: OLS intercept and slope [y-units and y-units/x-units]
- ŷ_i: fitted value [y-units]
- e_i = y_i − ŷ_i: residual [y-units]
- SSE = Σe_i²: residual sum of squares [y-units²]
- SSR = b1·S_xy: regression sum of squares [y-units²]
- SST = SSR + SSE = S_yy [y-units²]
- MSE = SSE/(n − 2): mean square error [y-units²]
- SE(b1) = √(MSE/S_xx): standard error of slope [y-units/x-units]
- t = b1/SE(b1): slope test statistic [dimensionless]
- df = n − 2

Formulas:
- r = S_xy / √(S_xx · S_yy)
- R² = r² = SSR/SST = 1 − SSE/SST
- b1 = S_xy / S_xx;  b0 = ȳ − b1 · x̄
- ŷ_i = b0 + b1 · x_i
- e_i = y_i − ŷ_i
- SST = Σ(y_i − ȳ)² = S_yy;  SSR = b1 · S_xy = Σ(ŷ_i − ȳ)²;  SSE = Σe_i²
- MSE = SSE / (n − 2);  SE(b1) = √(MSE / S_xx)
- t = b1 / SE(b1),  df = n − 2  (H0: β1 = 0)
- (1−α) CI for E[y|x_0] = ŷ_0 ± t_{α/2, n−2} · √[MSE · (1/n + (x_0 − x̄)²/S_xx)]
- (1−α) PI for new y at x_0 = ŷ_0 ± t_{α/2, n−2} · √[MSE · (1 + 1/n + (x_0 − x̄)²/S_xx)]

Units: x, y in measurement units; r, R², t dimensionless; b1 in y-units/x-units; b0 in y-units; SSE, SSR, SST in y-units².

Assumptions (Gauss-Markov + normality for inference): (i) linearity of y on x; (ii) independence of residuals; (iii) homoscedasticity (constant residual variance); (iv) approximate normality of residuals. Violations invalidate the slope's t-test CIs but the OLS point estimates remain unbiased under (i)-(ii)-(iii).

Interpretation: r ∈ [−1, +1] is the linear-association strength and direction; R² is the variance-explained fraction; b1 is the rate of change of y per unit x; e_i is the model's error at observation i; the CI for E[y|x_0] is the precision of the mean response; the PI is the precision of a new observation. Do NOT extrapolate beyond the x-range of the data — the linear model may not hold outside the observed range.`,
    worked_example: `**Coating thickness vs application time (simple linear regression).**
A Green Belt studies the relationship between application time (x, s) and final coating thickness (y, μm) at 10 settings on a paint-line.

Data:
x: 10, 20, 30, 40, 50, 60, 70, 80, 90, 100  (s)
y: 11, 19, 23, 33, 39, 44, 52, 59, 63, 73   (μm)

Summary statistics:
- n = 10
- Σx = 550, x̄ = 55; Σ(x − x̄)² = 2·(45² + 35² + 25² + 15² + 5²) = 2·4125 = 8250 = S_xx
- Σy = 416, ȳ = 41.6; Σ(y − ȳ)² = 3734.4 = S_yy = SST
- Σ(x − x̄)(y − ȳ) = 1377 + 791 + 465 + 129 + 13 + 12 + 156 + 435 + 749 + 1413 = 5540 = S_xy

Step 1 — Pearson r and R²:
- r = S_xy / √(S_xx · S_yy) = 5540 / √(8250 × 3734.4) = 5540 / √30,808,800 = 5540 / 5550.6 = 0.9981
- R² = r² = 0.9962  (99.62% of variance in y is explained by x)

Step 2 — OLS fit:
- b1 = S_xy / S_xx = 5540 / 8250 = 0.67152 μm/s  (each additional second of application time adds 0.672 μm of coating)
- b0 = ȳ − b1 · x̄ = 41.6 − 0.67152 × 55 = 41.6 − 36.934 = 4.666 μm  (extrapolated thickness at 0 s — outside the data range; interpret with caution)
- Fitted model: ŷ = 4.667 + 0.672 · x  (μm)

Step 3 — fitted values and residuals:
- x = 70 s:  ŷ = 4.667 + 0.672 × 70 = 4.667 + 47.04 = 51.71 μm;  actual y = 52;  residual e = 52 − 51.71 = +0.29 μm
- x = 10 s:  ŷ = 4.667 + 6.72 = 11.39 μm;  actual y = 11;  residual e = −0.39 μm
- (All 10 residuals e_i are small and randomly signed; Σe_i = 0 by OLS construction.)

Step 4 — variance partition:
- SST = S_yy = 3734.4
- SSR = b1 · S_xy = 0.67152 × 5540 = 3719.0
- SSE = SST − SSR = 3734.4 − 3719.0 = 15.4  (≈ Σe_i², with rounding)
- R² = SSR/SST = 3719.0/3734.4 = 0.9959  (consistent with r² = 0.9962 to rounding)

Step 5 — slope t-test:
- MSE = SSE / (n − 2) = 15.4 / 8 = 1.925
- SE(b1) = √(MSE / S_xx) = √(1.925 / 8250) = √0.0002333 = 0.01528 μm/s
- t = b1 / SE(b1) = 0.67152 / 0.01528 = 43.95,  df = 8
- p-value: P(|T| > 43.95 | df=8) ≪ 0.001  (t_crit(0.001, df=8, two-tailed) = 5.04; 43.95 ≫ 5.04 ⇒ reject H0: β1 = 0)
- 95% CI for β1 = b1 ± t_{0.025, 8} · SE(b1) = 0.67152 ± 2.306 × 0.01528 = 0.67152 ± 0.03524 = (0.636, 0.707) μm/s

Step 6 — prediction at x_0 = 70 s:
- ŷ_0 = 4.667 + 0.672 × 70 = 51.71 μm
- 95% CI for E[y|70] = 51.71 ± 2.306 × √[1.925 × (1/10 + (70−55)²/8250)] = 51.71 ± 2.306 × √[1.925 × (0.1 + 225/8250)] = 51.71 ± 2.306 × √[1.925 × 0.12727] = 51.71 ± 2.306 × 0.4952 = 51.71 ± 1.142 = (50.57, 52.85) μm
- 95% PI for new y at 70 s = 51.71 ± 2.306 × √[1.925 × (1 + 0.12727)] = 51.71 ± 2.306 × √2.170 = 51.71 ± 2.306 × 1.473 = 51.71 ± 3.397 = (48.31, 55.11) μm  (wider than the CI because it includes the new-observation noise σ²)

Conclusion: application time is a highly significant linear predictor of coating thickness (p ≪ 0.001), explaining 99.6% of the variance (R² = 0.996). Each second adds 0.672 μm (95% CI: 0.636–0.707 μm). The residual standard error √MSE ≈ 1.39 μm is the typical prediction error. Diagnostics (independence, normality, homoscedasticity, linearity) pass on this synthetic dataset.`,
    industrial_example: `**Chemical (batch-reactor yield vs reaction temperature).** A Green Belt at a specialty-chemicals plant investigates the relationship between reactor batch temperature (x, °C) and yield (y, kg/batch) across 12 batches. Summary: n = 12, x̄ = 65 °C, ȳ = 142 kg, S_xx = 1450, S_yy = 1820, S_xy = 1525. Pearson r = 1525/√(1450 × 1820) = 1525/√2,639,000 = 1525/1624.5 = 0.939; R² = 0.881 (88.1% of yield variance explained by temperature). OLS slope b1 = 1525/1450 = 1.052 kg/°C (each additional °C adds ~1.05 kg/batch yield in the observed 50–80 °C range); b0 = 142 − 1.052 × 65 = 142 − 68.4 = 73.6 kg. Slope t-test: MSE = (SST − SSR)/(n−2) = (1820 − 1525²/1450)/10 = (1820 − 1603.9)/10 = 21.6; SE(b1) = √(21.6/1450) = 0.122; t = 1.052/0.122 = 8.62, df = 10, p ≪ 0.001. The 95% CI for β1 = 1.052 ± 2.228 × 0.122 = (0.780, 1.324) kg/°C. The model is ŷ = 73.6 + 1.052·x. For x = 70 °C, ŷ = 73.6 + 73.6 = 147.2 kg; 95% PI = (140.1, 154.3) kg. The Green Belt resists the temptation to "set temperature to 80 °C to maximize yield" — the data cover 50–80 °C, and yield-vs-temperature may be curvilinear (Arrhenius) above 75 °C; a DOE in the Improve phase (with center points) is the correct next step before a target-setting decision.`,
    case_study: `CASE_TYPE = SYNTHETIC. A Green Belt at a Tier-1 automotive supplier investigates the relationship between paint-booth humidity (x, %RH) and paint-defect rate (y, defects per 100 units) across 18 daily samples. OLS regression gives r = −0.42, R² = 0.176, b1 = −0.83 defects/100 per %RH (higher humidity ⇒ fewer defects — surprising and weak), p = 0.085 (fail to reject H0: β1 = 0). The team concludes "humidity is not a vital few X" and deprioritizes humidity control. A Black Belt reviewer catches three issues: (i) the scatter plot reveals a strong NEGATIVE relationship in the 30–50 %RH range and a strong POSITIVE relationship in the 60–80 %RH range — the data are U-shaped, and a single linear fit averages the two regimes to near-zero slope (Anscombe-fallacy); (ii) the residual-vs-x plot shows a clear inverted-U pattern (linearity violation); (iii) the team did not check for a confounder — paint-booth temperature was also varying, and humidity and temperature are anti-correlated in this HVAC-controlled booth. Reanalysis: split the data at 55 %RH; for x ∈ [30, 50]: r = −0.91, R² = 0.83, b1 = −1.45, p = 0.003 (reject H0); for x ∈ [60, 80]: r = +0.87, R² = 0.76, b1 = +0.92, p = 0.012 (reject H0). The Black Belt prescribes a 2-factor DOE (humidity × temperature) in the Improve phase to disentangle the confounding and to fit a quadratic response surface for the optimum. Lesson: never trust R² and p without plotting; never regress on observational data with a known confounder; transition to DOE for causation. Source: synthetic case authored for this lesson; method per Montgomery (DOE, Ch. 1) and Breyfgle (2003, Ch. 22).`,
    visual_explanation: `Picture a scatter plot of y vs x with the OLS line drawn through the centroid (x̄, ȳ). The line tilts up if b1 > 0 (positive correlation) or down if b1 < 0 (negative). The vertical distance from each point to the line is the residual e_i; the OLS line is the unique line that minimizes the sum of squared vertical distances. The SST is the total vertical spread of y around ȳ; SSE is the vertical spread of the points around the line; SSR is the spread of the line itself around ȳ. R² = SSR/SST is the visual "fraction of the vertical spread captured by the line." The (1−α) CI for E[y|x] forms a "bow-tie" or "hourglass" band around the line — narrowest at x̄, widening as x moves away. The (1−α) PI for a new observation is a wider band (it includes the σ² of the new noise) wrapping the CI band.`,
    simulation_opportunity: `An interactive regression simulator would let the learner set the true slope β1, intercept β0, and noise σ; click to add data points; and display the live-fitted OLS line, the residual-vs-x plot, and the four diagnostic gates (Durbin-Watson, Anderson-Darling, residual-vs-x scatter, linearity). A second panel would let the learner overlay the (1−α) CI for E[y|x] (the hourglass band) and the (1−α) PI (the wider band), and extrapolate the line beyond the data range to show the danger of extrapolation. A third control would introduce a quadratic y = β0 + β1·x + β2·x² and show how the linear fit's R² collapses when the true relationship is curvilinear.`,
    common_mistakes: `- Regressing without plotting — Anscombe's quartet shows four datasets with identical r and OLS line but completely different stories.
- Extrapolating beyond the x-range of the data — the linear model may not hold outside the observed range.
- Confusing the (1−α) CI for the mean response with the (1−α) PI for a new observation — the PI is wider (it includes σ² of new noise).
- Treating R² as a quality score without checking residual diagnostics — a high R² with a curved residual-vs-x plot means the model is wrong but coincidentally fits.
- Skipping the slope t-test — R² alone does not establish significance; with small n, even R² = 0.5 may be non-significant.
- Concluding "X causes Y" from a high r — correlation is necessary but not sufficient for causation (DOE is required).
- Pooling data across regimes (e.g., 30–50 %RH and 60–80 %RH) with different relationships — the single-line fit averages the regimes and produces a misleading slope.
- Reporting R² without the residual standard error √MSE — a model with R² = 0.99 but √MSE = 10 mm is too imprecise for engineering tolerance decisions.`,
    limitations: `- Pearson's r captures only LINEAR association; curvilinear y = x² has r ≈ 0 — always plot.
- OLS assumes linearity, independence, homoscedasticity, normality of residuals; violations break the slope t-test CIs.
- OLS is sensitive to outliers — a single high-leverage point can flip the slope sign (always inspect the scatter).
- Extrapolation beyond the x-range is unsupported — the linear model may not hold outside the observed range.
- Observational data cannot establish causation; only DOE can.
- Multicollinearity in multiple regression inflates SE(b1) for correlated predictors; use VIF to detect.
- R² grows monotonically with k (number of predictors); use R²_adj = 1 − (1−R²)(n−1)/(n−k−1) for model comparison.`,
    comparison: `**Pearson r vs R²:**
- r ∈ [−1, +1] is the linear-association strength and direction.
- R² = r² ∈ [0, 1] is the fraction of variance in Y explained by the linear model on X.
- Same information, different scale — R² is more intuitive for non-technical audiences.

**CI (mean response) vs PI (new observation):**
- CI: ŷ_0 ± t × √[MSE × (1/n + (x_0 − x̄)²/S_xx)] — precision of E[y|x_0].
- PI: ŷ_0 ± t × √[MSE × (1 + 1/n + (x_0 − x̄)²/S_xx)] — precision of a single new y.
- PI is wider because it includes σ² of the new noise.

**Regression (observational) vs DOE (designed):**
- Regression on observational data: hypothesis-generating; cannot establish causation (confounders Z uncontrolled).
- DOE in the Improve phase: randomizes X, controls Z, establishes causation; the bridge to RSM (response surface methodology).`,
    practical_application: `- **Analyze phase X-screening**: a high-|r| continuous X is a candidate vital few; a low-|r| X is a candidate trivial many (subject to plotting — non-linear Xs may have low |r|).
- **Improve phase prediction model**: ŷ = b0 + b1·x for process targeting — but only after diagnostics pass and within the observed x-range.
- **Control phase SPC**: regression-based control charts (e.g., residuals on a y-vs-x model) detect special-cause deviations from the predicted relationship.
- **Supplier qualification**: regress supplier defect rate on shipment volume to detect volume-driven quality drift.
- **Bridge to DOE**: significant slope ⇒ X has predictive power ⇒ Improve-phase DOE is justified to establish causation and optimize the response surface.`,
    decision_scenario: `You are a Black Belt analyzing customer-return rate (y, %) vs days-in-transit (x, days) for a logistics process. n = 24 weekly aggregates; r = +0.62, R² = 0.38, b1 = +0.18 %/day, p = 0.002 (reject H0: β1 = 0); 95% CI for β1 = (0.07, 0.29) %/day. Diagnostics: residual-vs-x plot is random (linearity OK); Anderson-Darling p = 0.18 (normality OK); but the residual run chart shows a clear 7-week periodic autocorrelation (DW = 0.78, p < 0.01 — independence violated). What is the correct interpretation of the regression? Do you act on the +0.18 %/day slope today, or do you prescribe a different analysis first? If the latter, what analysis?`,
    practice_questions: `- **Q1 (Easy, Recall):** State the formula for Pearson's r and the relationship between r and R².
- **Q2 (Medium, Application):** Given S_xy = 5540, S_xx = 8250, S_yy = 3734.4 — compute r, R², b1, and b0 (given x̄ = 55, ȳ = 41.6).
- **Q3 (Medium, Understand):** Explain the difference between the (1−α) CI for E[y|x_0] and the (1−α) PI for a new y at x_0 — which is wider and why?
- **Q4 (Hard, Analyze):** A regression reports r = 0.05, R² = 0.0025, p = 0.65, but a scatter plot shows a strong U-shaped relationship. Diagnose the issue and prescribe the fix.`,
    certification_questions: `- **CSSGB-style (Easy, Calculation):** Given n = 10, r = 0.9981 — state R² and the variance-explained interpretation.
- **CSSBB-style (Medium, Analysis):** A regression slope has b1 = 0.672, SE = 0.0153, df = 8. Compute t, find p, and decide at α = 0.05.
- **CSSBB-style (Hard, Synthesis):** Design the transition from regression (Analyze) to DOE (Improve) for a process where regression shows X is a significant predictor but confounders are suspected — specify the DOE layout.`,
    summary: `Regression and correlation quantify the linear association between a continuous Y and one or more continuous Xs. Pearson's r ∈ [−1, +1] measures linear-association strength and direction; R² = r² ∈ [0, 1] measures the variance-explained fraction. Simple linear regression y = b0 + b1·x is fit by OLS (b1 = S_xy/S_xx; b0 = ȳ − b1·x̄); the variance partitions SST = SSR + SSE; R² = SSR/SST. The four residual diagnostics — independence, normality, homoscedasticity, linearity — are the gate before inference. The slope t-test (t = b1/SE(b1), df = n−2) establishes statistical significance. The CI for the mean response is narrower than the PI for a new observation. CORRELATION ≠ CAUSATION — only a designed experiment (DOE in the Improve phase) establishes causation by randomizing X.`,
    key_takeaways: `- Pearson's r measures LINEAR association; R² = r² measures variance explained. Always plot.
- OLS: b1 = S_xy/S_xx; b0 = ȳ − b1·x̄; line passes through (x̄, ȳ). SST = SSR + SSE; R² = SSR/SST.
- Four residual diagnostics: independence, normality, homoscedasticity, linearity.
- Slope t-test (t = b1/SE(b1), df = n−2): reject H0: β1 = 0 ⇒ X linearly predicts Y.
- CI (mean response) < PI (new observation) — the PI includes σ² of new noise.
- CORRELATION ≠ CAUSATION. Only DOE establishes causation by randomizing X.
- Never extrapolate beyond the observed x-range — the linear model may not hold outside.`,
    references: `- ASQ Six Sigma Black Belt Body of Knowledge.
- ASQ Six Sigma Green Belt Body of Knowledge.
- Montgomery (2013), Statistical Quality Control, Ch. 11 (Regression), Ch. 12 (Correlation).
- Montgomery (2019), Design and Analysis of Experiments, Ch. 1 (Regression to RSM bridge), Ch. 2 (Linear regression for DOE).
- Breyfogle (2003), Implementing Six Sigma, Ch. 22 (Regression), Ch. 23 (Correlation vs causation, DOE bridge).
- Pande, Neuman & Cavanagh (2014), The Six Sigma Way, Ch. 7 (Analyze phase — correlation vs causation in DMAIC context).`,
  },
  knowledgeObject: {
    title: "Regression & Correlation — Pearson r, y=b0+b1·x, R², Residuals",
    domain: "Analyze",
    competency: "Regression & Correlation",
    topic: "Regression & Correlation",
    concept: "Pearson r, simple linear regression, R², residual diagnostics, correlation vs causation",
    body: {
      definitions: [
        "Pearson's r: linear correlation coefficient, r ∈ [−1, +1]; S_xy/√(S_xx·S_yy).",
        "R² (coefficient of determination): r² = SSR/SST; fraction of variance in Y explained by the linear model.",
        "Simple linear regression: y = b0 + b1·x; one predictor, one response.",
        "OLS (ordinary least squares): minimization of Σ(y_i − ŷ_i)²; closed form b1 = S_xy/S_xx, b0 = ȳ − b1·x̄.",
        "Slope b1: rate of change of y per unit x (units: y/x).",
        "Intercept b0: predicted y at x = 0 (extrapolation outside the data range is risky).",
        "Fitted value ŷ_i = b0 + b1·x_i; residual e_i = y_i − ŷ_i.",
        "SST = Σ(y_i − ȳ)²; SSR = b1·S_xy = Σ(ŷ_i − ȳ)²; SSE = Σe_i²; SST = SSR + SSE.",
        "MSE = SSE/(n−2); SE(b1) = √(MSE/S_xx); slope t-test t = b1/SE(b1), df = n−2.",
        "CI for mean response E[y|x_0]: ŷ_0 ± t × √[MSE × (1/n + (x_0 − x̄)²/S_xx)].",
        "PI for new y at x_0: ŷ_0 ± t × √[MSE × (1 + 1/n + (x_0 − x̄)²/S_xx)] — wider than the CI.",
        "Correlation ≠ causation: high r is necessary but not sufficient for causation; only DOE establishes causation.",
      ],
      principles: [
        "Pearson's r measures LINEAR association only — always plot (Anscombe's quartet).",
        "R² = r² = SSR/SST is the variance-explained fraction.",
        "OLS minimizes Σ(y_i − ŷ_i)²; b1 = S_xy/S_xx; b0 = ȳ − b1·x̄; line passes through (x̄, ȳ).",
        "Variance partition: SST = SSR + SSE; R² = SSR/SST = 1 − SSE/SST.",
        "Four residual diagnostics: independence, normality, homoscedasticity, linearity.",
        "Slope t-test (t = b1/SE(b1), df = n−2): reject H0: β1 = 0 ⇒ X linearly predicts Y.",
        "CORRELATION ≠ CAUSATION. Only DOE (Improve phase) establishes causation by randomizing X.",
        "PI > CI — the PI includes σ² of the new noise.",
      ],
      components: [
        "Scatter plot of y vs x — always first.",
        "Pearson r and R² — the linear-association summary.",
        "OLS line ŷ = b0 + b1·x — the prediction model.",
        "Residuals e_i — the model's errors.",
        "Residual-vs-x and residual-vs-ŷ plots — the diagnostic gate.",
        "Slope's SE and t-test — the significance of the linear predictor.",
        "CI for E[y|x_0] and PI for new y at x_0 — prediction intervals.",
      ],
      mechanism: "OLS minimizes Σ(y_i − ŷ_i)²; the closed-form b1 = S_xy/S_xx, b0 = ȳ − b1·x̄ are unbiased minimum-variance linear estimators under the Gauss-Markov conditions (linearity, independence, homoscedasticity). Adding normality of residuals enables the slope's t-test for inference. The slope's significance establishes X as a linear predictor of Y but NOT as a cause — only DOE establishes causation.",
      process: "Plot y vs x → compute S_xy, S_xx, S_yy → r and R² → OLS b1, b0 → fitted values ŷ_i, residuals e_i → diagnostics (residual-vs-x, run chart, Anderson-Darling) → slope t-test → SST = SSR + SSE → R² → CI and PI for prediction → for causation, transition to Improve-phase DOE.",
      formulas: [
        "r = S_xy / √(S_xx · S_yy), where S_xy = Σ(x−x̄)(y−ȳ), S_xx = Σ(x−x̄)², S_yy = Σ(y−ȳ)²",
        "R² = r² = SSR/SST = 1 − SSE/SST",
        "b1 = S_xy / S_xx; b0 = ȳ − b1·x̄",
        "ŷ_i = b0 + b1·x_i; e_i = y_i − ŷ_i",
        "SST = S_yy; SSR = b1·S_xy; SSE = Σe_i²; SST = SSR + SSE",
        "MSE = SSE/(n−2); SE(b1) = √(MSE/S_xx); t = b1/SE(b1), df = n−2",
        "CI for E[y|x_0] = ŷ_0 ± t_{α/2,n−2} · √[MSE × (1/n + (x_0 − x̄)²/S_xx)]",
        "PI for new y at x_0 = ŷ_0 ± t_{α/2,n−2} · √[MSE × (1 + 1/n + (x_0 − x̄)²/S_xx)]",
      ],
      metrics: [
        "r ∈ [−1, +1] (linear association strength and direction).",
        "R² ∈ [0, 1] (variance-explained fraction); R²_adj = 1 − (1−R²)(n−1)/(n−k−1) for multiple regression.",
        "Slope b1 ± SE × t (95% CI for β1).",
        "Slope t-test: |t| > t_crit(α/2, n−2) ⇒ reject H0: β1 = 0.",
        "Residual standard error √MSE — typical prediction error in y-units.",
        "Durbin-Watson ≈ 2 (independence); ±2SE scatter on residual-vs-x (homoscedasticity + linearity); AD p > 0.05 (normality).",
      ],
      examples: [
        "Coating thickness vs application time: S_xy=5540, S_xx=8250, S_yy=3734.4 → r=0.9981, R²=0.9962, b1=0.672 μm/s, b0=4.67 μm, t=43.95 (df=8), p≪0.001.",
        "At x=70 s: ŷ=51.71 μm (actual 52; residual 0.29 μm); 95% CI=(50.57, 52.85); 95% PI=(48.31, 55.11).",
      ],
      industrial_examples: [
        "Chemical batch-reactor yield vs temperature: r=0.939, R²=0.881, b1=1.052 kg/°C, b0=73.6 kg; t=8.62, p≪0.001; 95% CI for β1=(0.780, 1.324) kg/°C.",
        "Tier-1 automotive paint-booth humidity vs defect rate: a single linear fit on a U-shaped relationship gave r=−0.42, p=0.085 (fail to reject); splitting at 55 %RH revealed two strong opposite-sign regimes — the Anscombe fallacy.",
      ],
      case_studies: [
        "SYNTHETIC — Paint-booth humidity vs defect rate (n=18, single linear fit averaged two regimes; residual-vs-x plot showed inverted-U; confounded with temperature). Reanalysis: split at 55 %RH; both regimes significant (r=−0.91 low, r=+0.87 high); prescribed 2-factor DOE for causation.",
      ],
      common_errors: [
        "Regressing without plotting — Anscombe's quartet.",
        "Extrapolating beyond the x-range of the data.",
        "Confusing the CI for E[y|x] with the PI for a new y (PI is wider).",
        "Treating R² as a quality score without residual diagnostics.",
        "Skipping the slope t-test — R² alone does not establish significance with small n.",
        "Concluding 'X causes Y' from a high r (only DOE establishes causation).",
        "Pooling data across regimes with different relationships — the single-line fit averages regimes.",
        "Reporting R² without √MSE — high R² with large √MSE is still imprecise for tolerance decisions.",
      ],
      limitations: [
        "Pearson's r captures only LINEAR association; curvilinear y=x² has r≈0.",
        "OLS assumes linearity, independence, homoscedasticity, normality — violations break slope t-test CIs.",
        "OLS is sensitive to high-leverage outliers — always inspect the scatter.",
        "Extrapolation beyond the x-range is unsupported.",
        "Observational data cannot establish causation; only DOE can.",
        "Multicollinearity in multiple regression inflates SE(b1); detect with VIF.",
        "R² grows monotonically with k; use R²_adj for model comparison.",
      ],
      best_practices: [
        "Plot y vs x before fitting (Anscombe protection).",
        "Compute S_xy, S_xx, S_yy; report r, R², b1, b0, √MSE, slope t, and the slope's 95% CI.",
        "Run the four diagnostic gates (residual-vs-x, residual run chart/DW, Anderson-Darling).",
        "Report both the CI for E[y|x] and the PI for new y — make the width distinction explicit.",
        "Never extrapolate beyond the observed x-range.",
        "For causation claims, transition to DOE in the Improve phase.",
        "For multiple regression, check VIF < 5 (or < 10) and report R²_adj.",
      ],
      related_concepts: [
        "Hypothesis Testing — the slope's t-test builds directly on Lesson 2.",
        "ANOVA & FMEA — multi-group and multi-factor extensions; F-tests on regression overall significance.",
        "Process Capability (Cp/Cpk) — the descriptive complement to regression's inferential slope.",
        "DOE (Improve phase) — the bridge from regression (hypothesis-generating) to causation (designed).",
        "Multiple Regression & RSM — the k>1 generalization; the foundation for response-surface methodology.",
      ],
      prerequisites: [
        "Descriptive statistics: mean, variance, covariance, std dev.",
        "Hypothesis testing (Lesson 2).",
        "Normal and t distributions; standard error and CI.",
        "Scatter plots, line-fitting intuition; least-squares minimization conceptually.",
      ],
      references: [
        "ASQ Six Sigma Black Belt BOK (Analyze — regression & correlation).",
        "ASQ Six Sigma Green Belt BOK (Analyze — regression & correlation).",
        "Montgomery, Statistical Quality Control, Ch. 11 (Regression), Ch. 12 (Correlation).",
        "Montgomery, Design and Analysis of Experiments, Ch. 1 (Regression-to-RSM bridge), Ch. 2.",
        "Breyfogle, Implementing Six Sigma, Ch. 22 (Regression), Ch. 23 (Correlation vs causation).",
        "Pande, Neuman & Cavanagh, The Six Sigma Way, Ch. 7 (Analyze phase — correlation vs causation).",
      ],
    },
  },
  questions: [
    {
      competencyName: "Regression & Correlation",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Manufacturing",
      stem: "A coating-thickness study (n = 10) yields S_xy = 5540, S_xx = 8250, S_yy = 3734.4, x̄ = 55, ȳ = 41.6. Compute Pearson's r, R², the OLS slope b1, and the OLS intercept b0.",
      whyCorrect:
        "Pearson's r = S_xy/√(S_xx·S_yy) = 5540/√(8250 × 3734.4) = 5540/√30,808,800 = 5540/5550.6 = 0.9981. R² = r² = 0.9981² = 0.9962 (99.62% of variance in y is explained by x). OLS slope b1 = S_xy/S_xx = 5540/8250 = 0.67152 μm/s (each additional second of application time adds ~0.672 μm of coating). OLS intercept b0 = ȳ − b1·x̄ = 41.6 − 0.67152 × 55 = 41.6 − 36.934 = 4.666 μm (extrapolated thickness at 0 s — outside the observed 10–100 s range; interpret with caution). The fitted model is ŷ = 4.67 + 0.672·x.",
      whyOthersWrong: [
        "Option B (r=0.9962, R²=0.9981) swaps r and R²; r² = 0.9962 = R², not the other way around (r=0.9981, R²=r²=0.9962).",
        "Option C uses ȳ = 41.6 as b0 instead of b0 = ȳ − b1·x̄ = 41.6 − 0.672×55 = 4.67 μm; the intercept is the predicted y at x=0, not the sample mean.",
        "Option D swaps b1 and b0 (b1=4.67, b0=0.672); the slope is the rate of change in μm/s (here 0.672), the intercept is at x=0 (here 4.67 μm).",
      ],
      explanation:
        "r = S_xy/√(S_xx·S_yy) = 0.9981; R² = r² = 0.9962; b1 = S_xy/S_xx = 0.672 μm/s; b0 = ȳ − b1·x̄ = 4.67 μm. Fitted model: ŷ = 4.67 + 0.672·x.",
      options: [
        { text: "r=0.9981, R²=0.9962, b1=0.672 μm/s, b0=4.67 μm", isCorrect: true },
        { text: "r=0.9962, R²=0.9981, b1=0.672 μm/s, b0=4.67 μm", isCorrect: false },
        { text: "r=0.9981, R²=0.9962, b1=0.672 μm/s, b0=41.6 μm", isCorrect: false },
        { text: "r=0.9981, R²=0.9962, b1=4.67 μm/s, b0=0.672 μm", isCorrect: false },
      ],
    },
    {
      competencyName: "Regression & Correlation",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      stem: "A regression reports r = 0.05, R² = 0.0025, p = 0.65 (fail to reject H0: β1 = 0). However, the scatter plot of y vs x reveals a strong U-shaped relationship. What is the correct diagnosis and the correct next step?",
      whyCorrect:
        "The diagnosis is the ANSCOMBE FALLACY: Pearson's r captures only LINEAR association, so a strong curvilinear (here, U-shaped) relationship yields r ≈ 0. The 'no significant linear correlation' conclusion is mathematically correct but practically misleading — the variables are strongly related, just not linearly. The correct next step is to fit a higher-order model (quadratic y = b0 + b1·x + b2·x²) or transform the data (e.g., add x² as a feature, or apply a Box-Cox / polynomial transform), then re-test. The BOK principle: ALWAYS PLOT before regressing; never trust r and p without the scatter. Anscombe's quartet is the canonical illustration.",
      whyOthersWrong: [
        "Option A (conclude 'x and y are unrelated' and drop x from the analysis) is wrong — it commits the Anscombe fallacy; r ≈ 0 with a strong U-shaped scatter means the relationship is non-linear, not absent.",
        "Option C (collect more data to increase power) is wrong — the issue is not statistical power (the relationship is strong); the issue is the linear model is misspecified. More data with the same linear fit will yield the same r ≈ 0.",
        "Option D (conclude 'correlation does not imply causation' and stop) is wrong — that principle applies when there is a high r (correlation present); here the issue is that r is near zero due to non-linearity, a different problem.",
      ],
      explanation:
        "Anscombe fallacy: Pearson's r captures only LINEAR association. Strong U-shaped (or curvilinear) relationships yield r ≈ 0. Always plot. Next step: fit a quadratic y = b0 + b1·x + b2·x² or transform the data, then re-test.",
      options: [
        { text: "Conclude 'x and y are unrelated' and drop x from further analysis", isCorrect: false },
        { text: "Diagnose the Anscombe fallacy (r captures only linear); fit a quadratic y = b0 + b1·x + b2·x² or transform, then re-test", isCorrect: true },
        { text: "Collect more data to increase statistical power and re-run the linear regression", isCorrect: false },
        { text: "Conclude 'correlation does not imply causation' and stop the analysis", isCorrect: false },
      ],
    },
    {
      competencyName: "Regression & Correlation",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "Which of the following correctly distinguishes the (1−α) confidence interval for E[y|x_0] from the (1−α) prediction interval for a new y at x_0?",
      whyCorrect:
        "The CI for E[y|x_0] answers 'where is the mean response at x_0?' — its variance is MSE × (1/n + (x_0 − x̄)²/S_xx), which does NOT include σ² of a new observation's noise. The PI for a new y at x_0 answers 'where will one new observation fall?' — its variance is MSE × (1 + 1/n + (x_0 − x̄)²/S_xx), which DOES include σ² of the new noise. The PI is therefore wider than the CI by an MSE term. Both narrow at x_0 = x̄ and widen as x_0 moves away (extrapolation is dangerous — the band widens rapidly). Reporting the wrong interval is a serious Six Sigma error: a process engineer using the CI as if it were the PI would underestimate the prediction risk by ~√2×.",
      whyOthersWrong: [
        "Option A (CI is wider than PI) is wrong — the PI is wider because it includes σ² of the new noise.",
        "Option C (CI and PI have the same width) is wrong — they differ by the σ² of the new observation's noise; the PI is wider.",
        "Option D (CI for individual observation, PI for mean response) is wrong — this is the inverse of the correct definitions; the CI is for the mean, the PI for a single new observation.",
      ],
      explanation:
        "CI for E[y|x_0]: variance = MSE × (1/n + (x_0 − x̄)²/S_xx) — mean response. PI for new y: variance = MSE × (1 + 1/n + (x_0 − x̄)²/S_xx) — includes σ² of new noise ⇒ wider. Both narrowest at x_0 = x̄.",
      options: [
        { text: "The CI is wider than the PI because the CI is for individual observations", isCorrect: false },
        { text: "The CI answers 'where is the mean response?'; the PI answers 'where will a new observation fall?' — the PI is wider because it includes σ² of new noise", isCorrect: true },
        { text: "The CI and the PI have the same width — both are MSE × (1/n + (x_0 − x̄)²/S_xx)", isCorrect: false },
        { text: "The CI is for individual observations; the PI is for the mean response", isCorrect: false },
      ],
    },
    {
      competencyName: "Regression & Correlation",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: A high Pearson correlation coefficient (|r| > 0.9) between X and Y in an observational study is sufficient evidence that X causes Y.",
      whyCorrect:
        "False. CORRELATION DOES NOT IMPLY CAUSATION is the central BOK teaching. A high |r| between X and Y in observational data admits four explanations: (i) X → Y (causal, the desired direction); (ii) Y → X (reverse causation); (iii) Z → X and Z → Y (a confounder Z is the common cause); (iv) coincidence (large observational datasets uncover spurious high-|r| pairs). Only a DESIGNED EXPERIMENT (DOE) — where the engineer randomizes X, controls confounders Z, and observes Y — establishes the causal direction by breaking the confounder-Z link. High |r| is NECESSARY but NOT SUFFICIENT for causation; it is hypothesis-generating for the DOE that the Improve phase will run.",
      whyOthersWrong: [
        "True — the candidate conflates statistical association (high r) with causal inference (which requires randomization/control of confounders via DOE). High r is a flag for a candidate causal link, not proof of one; only a designed experiment can establish causation.",
      ],
      explanation:
        "Correlation ≠ causation. High |r| is necessary but not sufficient for causation. Only a designed experiment (DOE in the Improve phase) — randomize X, control Z, observe Y — establishes causation. Observational high-r is hypothesis-generating.",
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Aggregate the 3 Six Sigma lessons.
// ---------------------------------------------------------------------------

const SIX_SIGMA_LESSONS: RefLesson[] = [
  LESSON_PROCESS_CAPABILITY,
  LESSON_HYPOTHESIS_TESTING,
  LESSON_REGRESSION_CORRELATION,
];

// ---------------------------------------------------------------------------
// Loader — combines STRUCTURE + CONTENT in one idempotent loadReference().
// Mirrors cre.ts (combined structure + content) and pmp.ts.
// ---------------------------------------------------------------------------

/**
 * Upsert the Six Sigma certification STRUCTURE + Measure/Analyze CONTENT
 * into the database. Idempotent: safe to call repeatedly. Returns record
 * counts written.
 *
 * Flow:
 *  (A) STRUCTURE
 *   1. Upsert Certification (slug "six-sigma", group "Quality", color "cyan").
 *   2. delete+recreate 5 DMAIC domains (D, M, A, I, C) with the 8
 *      competencies under Measure (4) and Analyze (4). Define (D), Improve
 *      (I), and Control (C) are seeded structure-only (no competencies).
 *   3. Defensive standard link: no ISO standard is invented for Six Sigma
 *      (ASQ does not link a single ISO standard); the optional
 *      CertificationStandard row is skipped.
 *   4. Upsert CertificationVersion "2024" snapshot with bokSnapshot JSON.
 *   5. Upsert LearningPath "six-sigma-path" (order 4).
 *  (B) CONTENT (Measure + Analyze pillars)
 *   6. Upsert References globally (by title, no sectionId) → shared ids.
 *   7. For each lesson: findFirst({competencyId, slug}) update/create
 *      (sectionId=null, certificationId, competencyId, status READY/HIGH/
 *      VERIFIED/v1.0.0, sections JSON, referenceIds JSON).
 *   8. Upsert KnowledgeObjects per lesson (findFirst by lessonId).
 *   9. Per lesson: deleteMany questions {certificationId, competencyId}
 *      then create enriched questions with nested options,
 *      knowledgeObjectId, whyCorrect, whyOthersWrong (JSON), referenceIds
 *      (JSON), status READY/VERIFIED/v1.0.0.
 *  (C) Return { certification, domains, competencies, lessons, kos,
 *      questions, references, versions, learningPath }.
 */
export async function loadReference() {
  // ---- (A) STRUCTURE ----

  // 1) Certification (upsert by slug "six-sigma")
  const certification = await db.certification.upsert({
    where: { slug: "six-sigma" },
    create: {
      slug: "six-sigma",
      name: "Six Sigma",
      fullName: "Six Sigma (Yellow/Green/Black Belt)",
      body: "ASQ/IASSC",
      currentVersion: "2024",
      bokReference: "ASQ Six Sigma Black Belt Body of Knowledge (DMAIC + DFSS)",
      examBlueprint: JSON.stringify({
        domains: 5,
        phases: ["Define", "Measure", "Analyze", "Improve", "Control"],
        belts: ["Yellow", "Green", "Black"],
        durationMin: "see ASQ (CSSGB 4h, CSSBB 4h)",
        questionCount: "see ASQ (CSSGB 110, CSSBB 165)",
        passingScore: "see ASQ",
        note:
          "Exam blueprint details (per-phase % weights, belt-specific question counts, duration, passing score) flagged REQUIRES_RESEARCH pending official ASQ CSSGB / CSSBB BOK load. The 5-phase DMAIC structure itself is the published ASQ Six Sigma BOK. Domain weight=0 below is a placeholder; the official ASQ exam blueprint publishes per-phase % weights.",
      }),
      effectiveDate: new Date("2024-01-01"),
      description:
        "Six Sigma, administered by ASQ (American Society for Quality) and IASSC (International Association for Six Sigma Certification), is the leading quality-and-process-improvement certification. It validates competency across the DMAIC phases (Define, Measure, Analyze, Improve, Control) plus Design for Six Sigma (DFSS). Belt levels — Yellow (fundamentals), Green (project leadership), Black (full DMAIC + enterprise) — depth-progress through the same BOK. The certification is recognized internationally as the canonical quality-engineering and process-improvement credential.",
      color: "cyan",
      icon: "Award",
      order: 4,
      group: "Quality",
    },
    update: {
      name: "Six Sigma",
      fullName: "Six Sigma (Yellow/Green/Black Belt)",
      body: "ASQ/IASSC",
      currentVersion: "2024",
      description:
        "Six Sigma, administered by ASQ (American Society for Quality) and IASSC (International Association for Six Sigma Certification), is the leading quality-and-process-improvement certification. It validates competency across the DMAIC phases (Define, Measure, Analyze, Improve, Control) plus Design for Six Sigma (DFSS). Belt levels — Yellow (fundamentals), Green (project leadership), Black (full DMAIC + enterprise) — depth-progress through the same BOK. The certification is recognized internationally as the canonical quality-engineering and process-improvement credential.",
      group: "Quality",
      color: "cyan",
      icon: "Award",
      order: 4,
    },
  });

  // 2) Domains + Competencies (delete+recreate to keep order accurate)
  await db.competency.deleteMany({
    where: { domain: { certificationId: certification.id } },
  });
  await db.domain.deleteMany({ where: { certificationId: certification.id } });

  let domainCount = 0;
  let competencyCount = 0;
  const domainIdByCode: Record<string, string> = {};
  for (let i = 0; i < SIX_SIGMA_DOMAINS.length; i++) {
    const d = SIX_SIGMA_DOMAINS[i];
    const domain = await db.domain.create({
      data: {
        certificationId: certification.id,
        name: d.name,
        code: d.code,
        weight: d.weight,
        order: i + 1,
        description: d.description,
      },
    });
    domainIdByCode[d.code] = domain.id;
    domainCount++;
    for (const c of d.competencies) {
      await db.competency.create({
        data: {
          domainId: domain.id,
          name: c.name,
          code: c.code ?? null,
          description: c.description,
          order: c.order,
        },
      });
      competencyCount++;
    }
  }

  // 3) No standard link: ASQ Six Sigma does not bind to a single ISO standard.
  //    A defensive certificationStandard row is intentionally omitted (spec §1:
  //    do not invent certification requirements or standard bindings).

  // 4) Certification version snapshot (v2024)
  await db.certificationVersion.upsert({
    where: {
      certificationId_version: { certificationId: certification.id, version: "2024" },
    },
    create: {
      certificationId: certification.id,
      version: "2024",
      effectiveDate: new Date("2024-01-01"),
      bokSnapshot: JSON.stringify({
        domains: SIX_SIGMA_DOMAINS,
        phases: ["Define", "Measure", "Analyze", "Improve", "Control"],
        belts: ["Yellow", "Green", "Black"],
        standards: [],
        examBlueprintNote:
          "Per-phase % weights flagged REQUIRES_RESEARCH pending official ASQ CSSGB / CSSBB BOK load. The 5-phase DMAIC structure itself is the published ASQ Six Sigma BOK.",
      }),
      changeLog:
        "Pilot structure: 5 DMAIC domains (D, M, A, I, C) seeded; Measure (M) and Analyze (A) deep content (3 full-spec lessons + KOs + 12 questions). D, I, C are structure-only pending follow-up pillars. Exam blueprint weights flagged REQUIRES_RESEARCH.",
    },
    update: {
      effectiveDate: new Date("2024-01-01"),
      bokSnapshot: JSON.stringify({
        domains: SIX_SIGMA_DOMAINS,
        phases: ["Define", "Measure", "Analyze", "Improve", "Control"],
        belts: ["Yellow", "Green", "Black"],
        standards: [],
        examBlueprintNote:
          "Per-phase % weights flagged REQUIRES_RESEARCH pending official ASQ CSSGB / CSSBB BOK load. The 5-phase DMAIC structure itself is the published ASQ Six Sigma BOK.",
      }),
    },
  });

  // 5) Six Sigma learning path
  const path = await db.learningPath.upsert({
    where: { slug: "six-sigma-path" },
    create: {
      slug: "six-sigma-path",
      name: "Six Sigma Certification Path",
      type: "Certification",
      certificationId: certification.id,
      description:
        "Structured path through the 5 DMAIC phases (Define, Measure, Analyze, Improve, Control) — Yellow Belt fundamentals, Green Belt project leadership, Black Belt enterprise DMAIC + DFSS — to certification-readiness.",
      order: 4,
    },
    update: { certificationId: certification.id },
  });

  // ---- (B) CONTENT (Measure + Analyze pillars) ----

  // 6) Find the Measure (M) and Analyze (A) domains and map their
  //    competencies by NAME -> id. Validate that every lesson's
  //    competencyName resolves.
  const measureDomain = await db.domain.findFirst({
    where: { certificationId: certification.id, code: "M" },
  });
  const analyzeDomain = await db.domain.findFirst({
    where: { certificationId: certification.id, code: "A" },
  });
  if (!measureDomain || !analyzeDomain) {
    throw new Error(
      'Measure (M) or Analyze (A) domain not found under Six Sigma. Internal error — domains were just created.'
    );
  }
  const ssCompetencies = await db.competency.findMany({
    where: {
      domainId: { in: [measureDomain.id, analyzeDomain.id] },
    },
  });
  const competencyIdByName: Record<string, string> = {};
  const domainIdByCompetencyId: Record<string, string> = {};
  for (const c of ssCompetencies) {
    competencyIdByName[c.name] = c.id;
    domainIdByCompetencyId[c.id] = c.domainId;
  }
  const expectedCompetencyNames = SIX_SIGMA_LESSONS.map((l) => l.competencyName);
  const missing = expectedCompetencyNames.filter((n) => !competencyIdByName[n]);
  if (missing.length > 0) {
    throw new Error(
      `Missing Six Sigma competencies by name: ${missing.join(
        ", "
      )}. Ensure the Six Sigma structure (5 DMAIC domains + M/A competencies) was seeded correctly.`
    );
  }

  // 7) References — global (no sectionId), upserted by title.
  const refIdsByTitle: Record<string, string> = {};
  for (const src of SIX_SIGMA_SOURCES) {
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
  const sharedReferenceIds = SIX_SIGMA_SOURCES.map((s) => refIdsByTitle[s.title]).filter(
    Boolean
  ) as string[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 8) Lessons, 9) KnowledgeObjects, 10) Questions
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of SIX_SIGMA_LESSONS) {
    const competencyId = competencyIdByName[lesson.competencyName];
    if (!competencyId) {
      throw new Error(
        `Competency not found for lesson ${lesson.slug}: ${lesson.competencyName}`
      );
    }
    const lessonDomainId = domainIdByCompetencyId[competencyId];

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

    // 8) Lesson — findFirst by (competencyId, slug) then update or create
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

    // 9) KnowledgeObject — findFirst by lessonId, then update or create.
    const ko = lesson.knowledgeObject;
    const koBodyJson = JSON.stringify(ko.body);
    const existingKO = await db.knowledgeObject.findFirst({
      where: { lessonId },
    });
    const koData = {
      certificationId: certification.id,
      domainId: lessonDomainId,
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

    // 10) Questions — delete existing for this competency (scoped), then
    //     create each enriched question with nested options.
    await db.question.deleteMany({
      where: { certificationId: certification.id, competencyId },
    });

    for (const q of lesson.questions) {
      await db.question.create({
        data: {
          certificationId: certification.id,
          domainId: lessonDomainId,
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
    domains: domainCount,
    competencies: competencyCount,
    standards: 0, // No ISO standard linked (ASQ Six Sigma does not bind to one)
    versions: 1,
    learningPath: path.id,
    lessons: lessonsCount,
    kos: kosCount,
    questions: questionsCount,
    references: referencesCount,
  };
}
