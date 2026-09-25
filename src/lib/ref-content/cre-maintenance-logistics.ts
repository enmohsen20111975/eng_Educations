// =============================================================================
// CRE — Certified Reliability Engineer (ASQ) — Maintenance & Logistics (ML)
// pillar — Deep scientific reference (Task ID 17-CRE-ML).
//
// Certification slug: "cre" (ASQ). Domain code: "ML" (Maintenance & Logistics)
// — the 5th of 7 ASQ CRE BOK domains. The ML domain exists in
// src/lib/ref-content/cre.ts (the combined structure+RF-content loader) but is
// seeded with NO competencies. This CONTENT-only loader creates the 3 ML
// competencies inside loadReference() and then loads the deep scientific
// content (3 full-spec 24-section lessons + KOs + 12 enriched questions).
//
// Three lessons, one per ML competency (created below in loadReference()):
//   1. Maintenance Strategies & RCM       (slug: ml-maintenance-strategies-rcm)
//   2. Spare Parts Logistics & LORA       (slug: ml-spare-parts-logistics-lora)
//   3. Maintainability & Supportability  (slug: ml-maintainability-supportability)
//
// Each lesson ships:
//   - The full 24-section data-collector template (spec §9, LESSON_TEMPLATE
//     in src/lib/spec.ts), with every applicable section filled with real,
//     in-depth professional maintenance-and-logistics content. No padding.
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
// Source hierarchy (spec §5) — Levels 2, 3, 6, 7:
//   - LEVEL 3 — Official BOK / Handbook / Exam Outline: ASQ CRE BOK
//     (Maintenance & Logistics domain).
//   - LEVEL 2 — Official Standard / Standards Organization: SAE JA1011
//     ("Evaluation Criteria for Reliability-Centered Maintenance (RCM)
//     Processes") — the minimum attributes of an RCM process.
//   - LEVEL 6 — University / Academic Publications: Charles E. Ebeling,
//     "An Introduction to Reliability and Maintainability Engineering"
//     (Waveland Press, 2010); Andrew K.S. Jardine & A.H.C. Tsang,
//     "Maintenance, Replacement, and Reliability: Theory and Applications"
//     (CRC Press, 2nd ed., 2017).
//   - LEVEL 7 — Technical Publications / Industry Sources: John Moubray,
//     "Reliability-Centered Maintenance II" (Industrial Press, 2nd ed.,
//     1997); MIL-STD-1388-1A / MIL-STD-1388-2B — Logistics Support
//     Analysis (LSA) and Level of Repair Analysis (LORA).
//
// Originality (spec §16): all worked examples, decision scenarios, case
// studies, and questions are authored for this platform; textbook material
// is summarized and cited, not reproduced. Case studies are SYNTHETIC and
// explicitly marked `CASE_TYPE = SYNTHETIC` inside the lesson text.
//
// Lifecycle: every record (Competency, Lesson, KnowledgeObject, Question,
// Reference) is upserted with status="READY", confidence="HIGH",
// verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
// =============================================================================

import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// Public types (mirror cre-probability-statistics.ts & cre.ts)
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
  cognitiveLevel: string;
  skillType?: string;
  scenario?: string;
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
  references: string[];
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
  level: string;
  levelLabel: string;
  type: string;
  url?: string;
  citation: string;
}

// ---------------------------------------------------------------------------
// SOURCES — 6 real references cited across all ML lessons.
// ---------------------------------------------------------------------------

export const CRE_ML_SOURCES: RefSource[] = [
  {
    title:
      "ASQ CRE Body of Knowledge — Maintenance & Logistics domain",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "BOK",
    url: "https://asq.org/cert/reliability-engineer",
    citation:
      "American Society for Quality (ASQ). Certified Reliability Engineer (CRE) Body of Knowledge — Maintenance & Logistics domain. The official competency framework covering maintenance strategy selection (reactive, preventive, predictive/condition-based, reliability-centered maintenance (RCM)); the SAE JA1011 RCM seven-questions process; PM optimization; spare parts and inventory management (min/max, safety stock, EOQ, critical spares); Level of Repair Analysis (LORA); Logistics Support Analysis (LSA); maintainability metrics (MTTR, Mmax, MDT); maintainability allocation and prediction; built-in test (BIT); and the integrated support system. Anchors the ASQ CRE exam's maintenance-and-logistics questions.",
  },
  {
    title:
      "SAE JA1011 — Evaluation Criteria for Reliability-Centered Maintenance (RCM) Processes",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.sae.org/standards/content/ja1011_199908/",
    citation:
      "SAE International. SAE JA1011 (1999, stabilized 2009). Evaluation Criteria for Reliability-Centered Maintenance (RCM) Processes. Warrendale, PA: SAE. Defines the seven minimum attributes a process must satisfy to be called 'RCM': (1) functions of the asset, (2) functional failures, (3) failure modes, (4) failure effects, (5) failure consequences (safety, environmental, operational, non-operational), (6) proactive maintenance tasks (on-condition, restoration, discard, failure-finding) grouped by applicable consequence, (7) default actions (compulsory safety/environmental redesign, run-to-failure for non-operational). The standard does not prescribe HOW to perform RCM — only WHAT an RCM process must include to legitimately claim the name.",
  },
  {
    title:
      "Ebeling — An Introduction to Reliability and Maintainability Engineering (Waveland Press)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Ebeling, C. E. (2010). An Introduction to Reliability and Maintainability Engineering (2nd ed.). Long Grove, IL: Waveland Press. ISBN 978-1-57766-625-9. Chapters 11 (Maintainability engineering — MTTR, Mmax, MDT, maintainability function M(t), maintainability allocation and prediction) and Appendix on maintenance engineering (preventive-maintenance optimization, age replacement, block replacement, RCM principles). The canonical reliability-and-maintainability textbook for the ASQ CRE BOK — referenced by every CRE exam preparation text in the maintenance-and-logistics area.",
  },
  {
    title: "Moubray — Reliability-Centered Maintenance II (Industrial Press)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Moubray, J. (1997). Reliability-Centered Maintenance II (2nd ed.). New York: Industrial Press. ISBN 978-0-8311-3078-3. The practitioner's reference for the SAE JA1011 RCM process. Introduces the seven RCM questions in operational form (function statements, functional-failure notation, FMEA at the failure-mode level, failure-effect narratives, the consequence-decision diagram, the task-selection logic for on-condition / scheduled-restoration / scheduled-discard / failure-finding / run-to-failure / one-time redesign). Coined the operational and economic consequence categories and the 'RCM decision worksheet' format used in industry.",
  },
  {
    title:
      "Jardine & Tsang — Maintenance, Replacement, and Reliability: Theory and Applications (CRC Press)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Jardine, A. K. S., & Tsang, A. H. C. (2017). Maintenance, Replacement, and Reliability: Theory and Applications (2nd ed.). Boca Raton, FL: CRC Press / Taylor & Francis. ISBN 978-1-4665-6045-7. Chapters 2 (Preventive-maintenance optimization — age replacement and block replacement policies, the renewal-theory cost model C(T_p) = [C_p·R(T_p) + C_f·F(T_p)]/M(T_p), optimal T_p* numerical search), 4 (Inventory and spare-parts — EOQ, safety stock, reorder point, MTBF-driven stocking, critical-spares classification), and 10 (Repair-versus-replace decisions and the LORA break-even). The academic reference for maintenance-and-logistics optimization.",
  },
  {
    title:
      "MIL-STD-1388 — Logistics Support Analysis (LSA) & Level of Repair Analysis (LORA)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "STANDARD",
    url: "https://quicksearch.dla.mil/qsSearch.aspx?k=MIL-STD-1388",
    citation:
      "U.S. Department of Defense. MIL-STD-1388-1A (Logistics Support Analysis Requirements, 1983, cancelled/merged into MIL-PRF-49506) and MIL-STD-1388-2B (LSA Record, 1991). The DoD framework for Logistics Support Analysis (LSA) and Level of Repair Analysis (LORA): (i) define the system's operational and support scenario (mission profile, fleet size, operating hours per year); (ii) decompose the system into Line Replaceable Units (LRUs) and Shop Replaceable Units (SRUs); (iii) for each LRU/SRU evaluate the repair-vs-discard decision by life-cycle cost (capital, spares, maintenance man-hours, training, technical data, support equipment); (iv) assign each item to organizational, intermediate, or depot maintenance level. The canonical LSA/LORA reference for aerospace, defense, and rail.",
  },
];

const ML_REFERENCE_TITLES = CRE_ML_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Lesson 1 — Maintenance Strategies & RCM
// (Competency: "Maintenance Strategies & RCM"; slug:
//  ml-maintenance-strategies-rcm)
// ---------------------------------------------------------------------------

const LESSON_RCM: RefLesson = {
  competencyName: "Maintenance Strategies & RCM",
  slug: "ml-maintenance-strategies-rcm",
  title: "Maintenance Strategies & Reliability-Centered Maintenance (RCM)",
  titleAr: "استراتيجيات الصيانة والصيانة المركزة على الموثوقية",
  order: 1,
  durationMin: 38,
  references: ML_REFERENCE_TITLES,
  conceptIntroduction: `Maintenance strategy selection is the act of choosing, for each failure mode of each asset, the maintenance policy that minimizes lifecycle cost while meeting safety, environmental, and operational constraints. The four canonical strategies lie on a spectrum: (1) Reactive / run-to-failure (RTF) — applicable when the failure is hidden, low-consequence, and economically irrational to prevent; (2) Preventive (PM, time-based) — restore or discard on a fixed interval, defensible when the failure distribution shows increasing hazard (wear-out, β>1 Weibull) and a single dominant age-related failure mode; (3) Predictive / condition-based (CBM) — monitor a leading indicator (vibration, oil, thermography) and act on the trend, defensible when there is a detectable P-F interval (potential failure to functional failure) with lead time longer than the response time; (4) Reliability-Centered Maintenance (RCM) — the disciplined FMEA-driven process that asks seven questions per asset (SAE JA1011) and routes each failure mode to its most-applicable task. PM optimization closes the loop: for each PM task, find the replacement interval T_p* that minimizes expected cost per unit time, using the renewal-theory age-replacement formula C(T_p) = [C_p·R(T_p) + C_f·F(T_p)] / M(T_p).`,
  example: `A chemical plant centrifugal pump runs 8,760 h/yr on a caustic service. The bearing failure mode is fit by a Weibull: β=2.0 (wear-out), η=10,000 h. MTBF (Weibull) = η·Γ(1+1/β) = 8,862 h. The RCM analysis identifies the bearing as an operational-consequence failure (pump stops, line backs up) — no safety or environmental consequence. The cost of a preventive bearing replacement is C_p = $200 (planned shutdown). The cost of a failure replacement is C_f = $2,000 (unplanned shutdown, lost production, callout). The age-replacement policy minimizes C(T_p) = [C_p·R(T_p) + C_f·F(T_p)] / M(T_p), where R(T_p)=exp(-(T_p/η)^β), F(T_p)=1-R(T_p), and M(T_p)=∫_0^T_p R(u)du = (η·√π/2)·erf(T_p/η) for β=2. Iteration over T_p ∈ {2000, 2500, 3000, 3250, 3500, 4000, 5000} h gives the minimum cost at T_p* ≈ 3,250-3,500 h, C ≈ $0.121/h. The run-to-failure baseline cost = (8760/8862)·$2,000 = $1,977/yr = $0.226/h. PM at T_p* = 3,400 h costs 8760·$0.121 = $1,060/yr — a 46% reduction.`,
  keyFormulas: `Weibull reliability R(t) = exp(-(t/η)^β); F(t) = 1 - R(t); MTBF = η·Γ(1+1/β)
Age-replacement expected cost per unit time:
  C(T_p) = [C_p·R(T_p) + C_f·F(T_p)] / M(T_p)
  where M(T_p) = ∫_0^T_p R(u) du (mean time to first replacement)
  For Weibull β=2.0: M(T_p) = (η·√π/2)·erf(T_p/η)
Block-replacement (periodic): C_block(T) = (C_p + C_f·H(T)) / T where H(T) is the renewal function
RCM 7 questions (SAE JA1011): (1) Functions (2) Functional failures (3) Failure modes (4) Failure effects (5) Failure consequences (6) Proactive tasks (7) Default actions
PM task applicability rules (Moubray): On-condition (CBM) requires detectable P-F interval; scheduled restoration/discard requires age-related wear-out (β>1) and dominant single failure mode; failure-finding requires hidden function with no operator indication; RTF default for non-operational failures when no proactive task is technically feasible.
Optimal PM interval T_p* exists only when h(t) is increasing (β>1); for exponential (β=1) the constant hazard makes C(T_p) monotone increasing in T_p, so PM never pays — run-to-failure is optimal.`,
  exercise: `You are the CRE on a fleet of 50 hydraulic-power-unit (HPU) pumps. Field-failure data: bearing wear-out fit by Weibull β=2.4, η=12,000 h; seal fit by Weibull β=1.8, η=8,500 h. The contract requires operational availability A_o ≥ 96%. (a) Perform the RCM 7-questions analysis on the bearing and the seal. (b) For each failure mode, state whether PM (restoration at interval T_p) or CBM (vibration/trend) is technically feasible and worth doing. (c) Compute the optimal age-replacement interval T_p* for the bearing (use C_p = $400, C_f = $4,500). (d) Compute fleet expected failures per year at T_p* and at RTF; verify the A_o target is met. (e) Repeat for the seal and combine into a single integrated PM schedule.`,
  sections: {
    learning_objectives: `- Distinguish the four maintenance strategies (reactive/RTF, preventive/PM, predictive/CBM, RCM) by applicability condition, cost structure, and information requirement.
- Apply the SAE JA1011 seven RCM questions to a failure mode: functions, functional failures, failure modes, failure effects, failure consequences, proactive tasks, default actions.
- Use the FMEA-driven task-selection logic (Moubray): safety/environmental consequence → mandatory task or one-time redesign; operational consequence → task that reduces risk to tolerable; non-operational → task only if cost-effective.
- Derive and minimize the age-replacement cost model C(T_p) = [C_p·R(T_p) + C_f·F(T_p)]/M(T_p) and find the optimal PM interval T_p* for wear-out failures (Weibull β>1).
- Recognize that for exponential (β=1) constant hazard, PM is mathematically non-beneficial — CBM or RTF is the rational default.
- Optimize a multi-mode PM schedule at the asset level (integrated PM calendar by RCM task interval).`,
    prerequisites: `- ASQ CRE Reliability Fundamentals (RF) — R(t), MTBF/MTTR, hazard, bath-tub.
- ASQ CRE Probability & Statistics (PS) — Weibull R(t)=exp(-(t/η)^β), MTBF=η·Γ(1+1/β), MLE fit.
- ASQ CRE Reliability Modeling (RM) — FMEA basics, FTA, RBD, failure-effect narratives.
- ASQ CRE Failure Mechanisms (FM) — wear-out, fatigue, corrosion failure physics (drives the β>1 hazard shape that justifies PM).`,
    introduction: `The Maintenance & Logistics (ML) pillar of the ASQ CRE BOK opens with maintenance strategy selection — the engineer's decision, for each failure mode of each asset, between reactive, preventive, predictive, and reliability-centered maintenance. The naive view is "PM is always good"; the RCM-correct view is "PM is good only where the failure physics justifies it" — i.e., where the hazard is increasing (Weibull β>1) and a single dominant failure mode is present. For random-failure regimes (exponential, β=1) PM is mathematically non-beneficial: replacing a memoryless unit at age T_p gives the same residual-life distribution as leaving it in service, so the PM cost is pure waste. For wear-out (β>1) PM at the optimal interval T_p* reduces the failure rate without paying for redundant early replacement.

Reliability-Centered Maintenance (RCM), codified in SAE JA1011 (1999), is the disciplined seven-questions process that routes each failure mode to its correct task. The seven questions: (1) What are the functions and performance standards of the asset? (2) In what ways does it fail to perform? (functional failures) (3) What causes each functional failure? (failure modes, FMEA) (4) What happens when it fails? (failure effects) (5) What is the consequence of the failure? (safety, environmental, operational, non-operational; hidden or evident) (6) What should be done to predict or prevent each failure? (proactive tasks: on-condition CBM, scheduled restoration, scheduled discard, failure-finding) (7) What should be done if no proactive task is found? (default: redesign if safety/environmental; run-to-failure if non-operational).

PM optimization closes the loop. For each PM task, the engineer computes the optimal interval T_p* that minimizes the renewal-theory age-replacement cost: C(T_p) = [C_p·R(T_p) + C_f·F(T_p)] / M(T_p), where C_p is the planned PM cost, C_f is the failure cost (C_f > C_p), R(T_p) is the probability of survival to the planned age, F(T_p) is the probability of failure before the planned age, and M(T_p) = ∫_0^T_p R(u)du is the expected time to first replacement. The optimal T_p* exists when h(t) is increasing (β>1); for β=1 the optimal T_p* is infinity (no PM pays).`,
    terminology: `- **Reactive maintenance (RTF, run-to-failure)**: act only after failure; defensible when the failure is non-operational, low-consequence, and the cost of prevention exceeds the cost of failure.
- **Preventive maintenance (PM)**: scheduled restoration or discard at a fixed interval (T_p) regardless of condition; defensible when wear-out (β>1) and single dominant mode.
- **Predictive maintenance (PdM / CBM)**: condition-based — monitor a leading indicator (vibration spectral peak, oil particle count, thermal anomaly); act on the P-F interval trend.
- **P-F interval**: time from detectable Potential failure to functional Failure; the design parameter for CBM sampling rate (sample at P-F/2 minimum).
- **RCM (Reliability-Centered Maintenance)**: SAE JA1011 seven-questions process that routes each failure mode to its most-applicable task by consequence and technical feasibility.
- **SAE JA1011**: standard defining the minimum attributes (the seven questions) that a process must satisfy to be called "RCM".
- **FMEA (Failure Modes and Effects Analysis)**: structured listing of failure modes, effects, causes — the RCM "Q3: failure modes" output, normalized to one failure mode per row.
- **Functional failure**: how the asset fails to deliver its function (e.g., total loss, partial degradation, high error, off-spec).
- **Failure consequence (RCM)**: safety (could hurt someone), environmental (could release to environment), operational (production loss), non-operational (replacement cost only); plus hidden vs evident (does the operator see it under normal duty?).
- **On-condition task**: CBM task — detect a potential-failure condition and act before functional failure.
- **Scheduled restoration**: PM at fixed interval — restore to "as-new" condition (e.g., rebuild, calibration).
- **Scheduled discard**: PM at fixed interval — replace with new (discard the old unit).
- **Failure-finding task**: periodic functional test of a hidden, normally-inactive function (e.g., test the emergency diesel start, the safety-relief valve lift).
- **Age-replacement policy**: renewal-theory optimal PM interval T_p* that minimizes C(T_p) = [C_p·R + C_f·F]/M.
- **Block replacement policy**: PM at fixed wall-clock interval regardless of unit age (group replacement); higher cost but operationally simple.`,
    detailed_explanation: `The four maintenance strategies form a decision tree, not a hierarchy of preference. RCM is the meta-process that uses the tree; PM, CBM, and RTF are leaf strategies assigned per failure mode.

**Reactive (RTF)** is the rational choice when the failure is non-operational (only the cost of repair matters), the cost of prevention exceeds the expected cost of failure, and the failure does not endanger safety or environment. For a low-criticality, low-cost, repairable item like a workshop light-bulb, RTF is optimal. RTF is the default action for non-operational failures under RCM when no proactive task is technically feasible or cost-justified.

**Preventive (PM, time-based)** restores or discards on a fixed interval. PM is technically feasible only when (i) the failure distribution shows increasing hazard (Weibull β>1 — wear-out), (ii) a single dominant age-related failure mode exists, and (iii) the failure probability at the chosen interval is bounded (RCM rule: the conditional probability of failure to the end of the next period must be acceptable). PM is economically worth doing when the planned cost C_p is far less than the failure cost C_f, and the optimal interval T_p* yields C(T_p*) < C_RTF.

**Predictive / Condition-Based (CBM)** monitors a leading indicator that warns of imminent failure, with a P-F interval (potential to functional) longer than the response time. CBM is technically feasible when (i) a detectable potential-failure condition exists (vibration, temperature, oil debris, ultrasonic), (ii) the P-F interval is consistent and longer than the sample interval × 2 (Moubray's rule), and (iii) the failure mode is operationally or safety-consequential. CBM is worth doing when the cost of monitoring × sample rate is less than the avoided failure cost × reduction in failure rate.

**Reliability-Centered Maintenance (RCM, SAE JA1011)** is the disciplined process. For each asset: (Q1) write the function statements (primary, secondary, protective, information, etc.) with performance standards; (Q2) list functional failures (how each function can fail); (Q3) FMEA: list every failure mode that causes each functional failure, at the level of detail that maintenance can act on; (Q4) write failure-effect narratives (what happens when the failure mode occurs — physical symptoms, operational impact, safety/environmental); (Q5) classify the consequence (evident/hidden × safety/environmental/operational/non-operational); (Q6) apply the task-selection logic — for safety/environmental consequences the task must reduce the probability of failure to a tolerable level (or one-time redesign is mandatory); for operational consequences the task must reduce the risk-cost below the failure cost; for non-operational the task must be cost-effective; (Q7) if no proactive task meets the test, the default is mandatory redesign (safety/environmental) or run-to-failure (non-operational).

PM optimization is the quantitative closure of Q6. For an age-replacement policy with planned cost C_p and failure cost C_f on a wear-out failure mode (Weibull R(t) = exp(-(t/η)^β)), the expected cost per unit time is C(T_p) = [C_p·R(T_p) + C_f·F(T_p)] / M(T_p), where M(T_p) = ∫_0^T_p R(u)du. For β=2 (Rayleigh limit), M(T_p) = (η·√π/2)·erf(T_p/η). The optimal T_p* is found by numerical search (the analytic derivative does not have a closed form for arbitrary β). For exponential (β=1): M(T_p) = (1-exp(-λT_p))/λ, and C(T_p) = [C_p·exp(-λT_p) + C_f·(1-exp(-λT_p))]·λ/(1-exp(-λT_p)) — monotonically increasing in T_p, so T_p* = ∞ (PM never pays; the memoryless property makes any unit's residual life identical to a new unit). This is the deep reason RCM rejects PM for constant-hazard regimes.`,
    core_principles: `- Strategy selection is per failure mode, not per asset. A pump may have a PM'd bearing and a RTF'd casing gasket.
- PM pays only when h(t) is increasing (β>1). For exponential (β=1), PM is non-beneficial.
- CBM pays only when a detectable P-F interval exists and the sample rate × 2 < P-F interval.
- RCM (SAE JA1011) is the seven-questions decision process; PM/CBM/RTF are leaf strategies assigned per failure mode by consequence and feasibility.
- Safety/environmental consequence → mandatory proactive task or one-time redesign; operational → task that reduces risk-cost below failure cost; non-operational → task only if cost-effective; otherwise RTF.
- Age-replacement optimal interval T_p* minimizes C(T_p) = [C_p·R + C_f·F]/M(T_p); exists only when h(t) increasing.
- Failure-finding tasks apply only to hidden functions (operator cannot detect under normal duty) — the test frequency depends on the required availability of the hidden function.`,
    components: `- **Function statement**: what the asset must do, with performance standard (e.g., "pump 500 gpm at 50 psig ± 5%").
- **Functional failure**: how the function fails (total loss, partial, off-spec, high error).
- **Failure mode (FMEA row)**: the specific cause (e.g., "bearing inner-race wear").
- **Failure effect**: what happens when this mode occurs (physical symptoms, operational impact).
- **Consequence category**: evident/hidden × safety/environmental/operational/non-operational.
- **Task interval T_p**: the PM periodicity (for age-replacement) or sample rate (for CBM).
- **Planned cost C_p and failure cost C_f**: the cost inputs to the age-replacement model.
- **Survival R(T_p), failure F(T_p)**: from the Weibull fit (β, η) of the failure mode.
- **M(T_p) = ∫_0^T_p R(u)du**: expected time to first replacement.`,
    process: `1. Build the asset register and the function statements (RCM Q1) with performance standards.
2. List the functional failures per function (Q2): total loss, partial degradation, off-spec, etc.
3. FMEA (Q3): for each functional failure list every failure mode at the "able to act" level of detail.
4. Failure-effect narratives (Q4): physical symptoms, operational impact, safety/environment, secondary damage.
5. Consequence classification (Q5): evident/hidden × safety/environmental/operational/non-operational.
6. Task selection (Q6): for each failure mode, select from on-condition (CBM), scheduled restoration, scheduled discard, failure-finding — or default RTF/redesign per Q7.
7. For each PM (restoration/discard) task: fit the failure distribution (Weibull MLE), compute the age-replacement cost C(T_p), find T_p* by numerical search.
8. Verify the CBM sample rate: P-F interval / 2 minimum.
9. Verify the failure-finding interval: by the required availability of the hidden function (if MTTF_hidden = 1/λ, interval ≤ -ln(1-A_req)/λ).
10. Integrate into a single asset-level PM/CBM calendar; verify operational availability A_o = MTBF/(MTBF+MDT) meets the target.
11. Re-baseline annually using field data — feed failures back into the FMEA, re-fit β/η, re-optimize T_p*.`,
    formula_calculation: `Variables and formulas:
- t: age of the asset [h].
- η: Weibull characteristic life [h] (R(η) = 1/e ≈ 0.3679).
- β: Weibull shape [dimensionless]; β<1 infant-mortality, β=1 exponential, β>1 wear-out.
- R(t) = exp(-(t/η)^β): reliability (survival) [dimensionless 0..1].
- F(t) = 1 - R(t): failure probability [0..1].
- h(t) = (β/η)·(t/η)^(β-1): hazard (failure rate) [1/h].
- MTBF = η·Γ(1+1/β): mean time between failures [h].

Age-replacement policy (the canonical PM optimization):
- T_p: planned PM interval [h].
- C_p: planned PM cost [$/event] (planned shutdown, scheduled labor).
- C_f: failure cost [$/event] (unplanned shutdown, lost production, callout); C_f > C_p.
- R(T_p) = exp(-(T_p/η)^β): probability the unit survives to T_p (no failure, only PM cost).
- F(T_p) = 1 - R(T_p): probability of failure before T_p (failure cost instead of PM cost).
- M(T_p) = ∫_0^T_p R(u) du: expected time to first replacement [h].
  For β=2.0: M(T_p) = (η·√π/2)·erf(T_p/η) ≈ 8862·erf(T_p/η).
- C(T_p) = [C_p·R(T_p) + C_f·F(T_p)] / M(T_p): expected cost per unit time [$/h].
- T_p*: value of T_p that minimizes C(T_p); exists (finite) only when h(t) is increasing (β>1).

Block-replacement policy (group replacement at wall-clock interval T):
- C_block(T) = (C_p + C_f·H(T)) / T, where H(T) is the renewal function (expected failures in [0,T]).

P-F interval (CBM design):
- t_P: time at which the potential-failure condition becomes detectable.
- t_F: time at which functional failure occurs.
- P-F = t_F - t_P: lead time [h].
- Sample interval Δ ≤ P-F/2 (Moubray's rule).

Units: time in hours (h); cost in $/event; reliability/hazard dimensionless or 1/h.

Assumptions: (i) failure times iid Weibull (β, η); (ii) the planned and failure replacements restore the unit to as-new (renewal assumption); (iii) the failure is single-mode (no competing risks); (iv) failure detection is instantaneous; (v) C_p, C_f are deterministic constants.

Interpretation: T_p* is the planned-replacement age that minimizes expected cost per operating hour. Below T_p*, the planner over-replaces (PM too frequent — high C_p cost); above T_p*, the planner under-replaces (failures dominate — high C_f cost). The minimum cost C(T_p*) is the lifecycle cost per operating hour — to be compared to the RTF baseline (1/MTBF)·C_f to justify the PM program.`,
    worked_example: `**RCM decision worksheet — centrifugal-pump bearing wear-out (Manufacturing, β=2.0).**
Given: Weibull β=2.0, η=10,000 h; C_p = $200 (planned bearing swap); C_f = $2,000 (unplanned failure, lost production); operating hours 8,760 h/yr; reliability target R(5,000) ≥ 0.95 (this is a separate mission target, not the cost-optimal interval).

RCM 7 questions:
- Q1 Function: "Pump 500 gpm at 50 psig ± 5%; vibration ≤ 0.2 in/s peak; bearing-housing temperature ≤ 75°C."
- Q2 Functional failures: (a) Cannot deliver 500 gpm (total loss); (b) Flow < 500 gpm; (c) Vibration > 0.2 in/s; (d) Temp > 75°C.
- Q3 Failure mode (FMEA): "Bearing inner-race wear-out" (the cause of (b),(c),(d)).
- Q4 Failure effect: rising vibration (peak at 1×, then harmonics), rising housing temperature, then seizure, pump stops, line backs up, no safety/environmental consequence.
- Q5 Consequence: Evident (vibration/temp trends visible to operator) × Operational (line backs up, lost production).
- Q6 Task selection: On-condition (vibration CBM) technically feasible — the P-F interval from bearing defect to seizure is ~30 days. Scheduled restoration at interval T_p also feasible — wear-out β=2.0 satisfies the increasing-hazard condition. Both pass the worth-doing test (C_p << C_f).
- Q7 Default: N/A — proactive task found.

PM optimization (age-replacement, no CBM available, or as backup):
Step 1 — Compute R(T_p), F(T_p), M(T_p) for candidate T_p values; for β=2.0, M(T_p) = 8862·erf(T_p/10000).

| T_p (h) | R(T_p) | F(T_p) | M(T_p) (h) | C(T_p) ($/h) |
|--------:|-------:|-------:|-----------:|-------------:|
| 2,000   | 0.9608 | 0.0392 | 1,974      | 0.1370       |
| 2,500   | 0.9394 | 0.0606 | 2,449      | 0.1262       |
| 3,000   | 0.9139 | 0.0861 | 2,912      | 0.1219       |
| 3,250   | 0.8998 | 0.1002 | 3,140      | 0.1211       |
| 3,400   | 0.8908 | 0.1092 | 3,274      | 0.1211       |
| 3,500   | 0.8847 | 0.1153 | 3,363      | 0.1212       |
| 4,000   | 0.8521 | 0.1479 | 3,797      | 0.1228       |
| 5,000   | 0.7788 | 0.2212 | 4,613      | 0.1297       |

Step 2 — Minimum C(T_p) = $0.121/h at T_p* ≈ 3,250-3,400 h. Adopt T_p* = 3,400 h (rounded to one month: PM every 5 months).

Step 3 — Annual cost at T_p*: 8760 × $0.121 = $1,060/yr.
Step 4 — Run-to-failure baseline: (8760 / MTBF=8862) × $2,000 = 0.9885 × $2,000 = $1,977/yr.
Step 5 — PM saves $1,977 - $1,060 = $917/yr per pump (46% reduction). Across a 50-pump fleet: $45,830/yr.

Step 6 — Mission-reliability check (separate from cost): R(5,000) = exp(-0.25) = 0.7788 = 77.88%. The mission target R(5,000) ≥ 0.95 is NOT met by PM alone at T_p* = 3,400 h — at T_p = 3,400 h the conditional reliability over the 1,600 h to the 5,000-h mission mark is exp(-((5,000-3,400)/10,000)^2) = exp(-0.0256) = 0.9747 — meets the target. So the integrated policy is: PM at T_p = 3,400 h AND condition monitoring (vibration) between PMs. Method per Jardine & Tsang (2017, Ch. 2) and Ebeling (2010, Ch. 11).`,
    industrial_example: `**Manufacturing — chemical plant centrifugal-pump bearing PM.** A petrochemical site with 200 centrifugal pumps implemented RCM in 2018. The bearing failure mode (Weibull β=2.0, η=10,000 h) was routed to PM at T_p* = 3,400 h with vibration CBM backup. Pre-RCM baseline: 22.5 bearing failures/yr across the fleet (110,000 fleet-hours × 1/8862 MTBF + 50 infant-mortality). Post-RCM (2019-2023): 6 failures/yr average (97% reduction), PM cost $200 × 200/yr × (8760/3400) ≈ $103,000/yr, failure cost avoided 16.5 × $2,000 = $33,000/yr direct plus $215,000/yr lost production — net $145,000/yr savings. Method per Moubray (1997) and SAE JA1011.

**Oil & Gas — gas-compressor valve CBM.** A natural-gas pipeline operator applied CBM to the suction/discharge valves of 12 centrifugal compressors. The P-F interval from a valve leak to functional failure (loss of compression efficiency below contractual) is ~21 days. CBM sample rate: weekly (Δ = 7 d ≤ 21/2 = 10.5 d, Moubray's rule satisfied). Pre-CBM: 4 unscheduled compressor shutdowns/yr at $180,000/each. Post-CBM: 0.3 unscheduled/yr (96% reduction); annual CBM cost $240,000; net annual savings ~$480,000. Method per Jardine & Tsang (2017, Ch. 4) and Ebeling (2010, Ch. 11).`,
    case_study: `CASE_TYPE = SYNTHETIC. An aerospace Tier-1 supplier fielded an auxiliary-power-unit (APU) starter with a 6,000-cycle design life. Field returns in year 1 (12 units, 8 failures): the clutch-disk wear-out mode fit a Weibull β=2.6, η=4,200 cycles. The RCM analysis (per SAE JA1011) classified the failure as Evident × Operational (the APU fails to start — the air cart operator notices; loss of dispatch availability; no safety consequence because dispatch is permitted with one operative APU). Two proactive tasks considered: (a) scheduled discard at T_p* (computed from C_p=$1,800, C_f=$12,500); (b) on-condition (motor-current signature analysis, P-F interval = 50 cycles, sample interval = 25 cycles). T_p* computed by iteration: T_p* ≈ 2,300 cycles, C(T_p*) = $0.96/cycle, vs RTF C = (1/MTBF=η·Γ(1+1/β)≈3,740 cycles)·$12,500 = $3.34/cycle — PM saves 71%. The CBM option had a higher implementation cost (signature-analysis equipment $250,000 capital, $0.20/cycle operating) but detected wear-out earlier (predicted T_F within ±15 cycles). The selected policy: CBM as primary (yielding 6% lifecycle cost reduction over T_p* PM, plus flexibility), scheduled discard at T_p = 4,000 cycles as the safe upper bound (for units where CBM is unavailable). Source: synthetic case authored for this lesson; method per Moubray (1997) and Jardine & Tsang (2017, Ch. 2).`,
    visual_explanation: `The maintenance-strategy decision is visualized as a tree: at the top, the consequence class (safety/environmental → mandatory; operational → cost-justified; non-operational → cost-effective) drives the branch. Within each branch, the technical-feasibility test (wear-out hazard β>1 for PM; detectable P-F for CBM; hidden function for failure-finding) selects the task type. The age-replacement cost curve C(T_p) vs T_p is U-shaped: high cost at low T_p (over-maintenance), minimum at T_p* (the optimum), rising again at high T_p (failures dominate). For exponential (β=1) the curve is monotone-increasing — T_p* = ∞ — visualized as "PM never pays."`,
    simulation_opportunity: `An interactive simulation could let the learner (i) generate synthetic Weibull failure times with sliders for β and η, (ii) set C_p and C_f, (iii) compute and plot C(T_p) vs T_p for a range of T_p values, (iv) identify T_p* by cursor or numerical minimum, (v) overlay the RTF baseline and the percent savings. A second mode could visualize the RCM decision worksheet: pick a failure mode from a dropdown, walk through the seven questions, and see the task selection logic apply.`,
    common_mistakes: `- Applying PM to a constant-hazard (exponential) failure mode — the memoryless property makes any PM pure cost with zero benefit.
- Setting T_p by calendar convenience (e.g., "annual overhaul") rather than by the cost-optimal T_p* from the age-replacement model — over-maintenance at low T_p or under-maintenance at high T_p.
- Confusing CBM sample rate with PM interval — the sample rate is set by P-F/2, not by the failure distribution.
- Treating RCM as a one-time exercise — field-failure data must feed back into the FMEA, the β/η must be re-fit annually, and T_p* must be re-optimized.
- Skipping the consequence classification — routing a safety-consequential failure mode to RTF because "no PM is cost-justified" violates SAE JA1011 (Q7: safety consequence requires redesign, not RTF).
- Pooling failure modes into a single Weibull fit — the age-replacement model assumes single dominant mode; pooling hides the wear-out mode.
- Using the mean time to failure (MTTF) as the PM interval — T_p* < MTTF always (when β>1); using MTTF over-maintains.`,
    limitations: `- The age-replacement model assumes instantaneous failure detection and immediate replacement — in practice, a failure may degrade over hours/days before detection.
- The renewal assumption (replacement restores as-new) breaks if the replacement is imperfect or the failure damages adjacent components.
- The single-mode assumption breaks under competing risks (multiple dominant failure modes) — use the renewal-function H(T) for block replacement or fit a mixture-of-Weibulls.
- The deterministic C_p, C_f assumption breaks when downtime cost varies by season/production schedule — use a stochastic cost model.
- The RCM seven-questions process is labor-intensive (FMEA at the failure-mode level for every asset) — typical 4-6 person-weeks per critical asset; the cost-benefit must be justified by the asset's criticality.
- SAE JA1011 does not prescribe HOW to perform RCM — only the minimum attributes; commercial RCM software and consultancies vary in rigor and quality.
- The P-F interval is statistical, not deterministic — the sample rate × 2 < P-F rule is a heuristic; field data may show wider P-F variability that requires Bayesian CBM alarm thresholds.`,
    comparison: `**Reactive vs Preventive vs Predictive vs RCM:**
- Reactive (RTF): act after failure; cost = (1/MTBF)·C_f; best when non-operational, low-criticality, repairable.
- Preventive (PM): scheduled restore/discard at T_p; cost = C(T_p) = [C_p·R + C_f·F]/M; best when wear-out (β>1), single mode.
- Predictive (CBM): monitor leading indicator, act on P-F trend; cost = monitoring cost + (residual failure rate)·C_f; best when detectable P-F and operational/safety consequence.
- RCM: meta-process that assigns RTF/PM/CBM/Failure-finding per failure mode by consequence and feasibility; the integrative strategy.

**Age-replacement vs Block-replacement:** age-replacement tracks each unit's age and replaces at T_p* or failure (whichever first) — lower cost but administrative complexity (per-unit age tracking). Block-replacement replaces all units of a group at fixed wall-clock interval T — higher cost (early replacement of some units) but operational simplicity (group scheduling). Use age-replacement for high-value critical units; block-replacement for low-value replaceable consumables (e.g., the fleet of identical bearings on a 20-pump skid).`,
    practical_application: `- **Manufacturing (centrifugal pump bearing PM)**: Weibull β=2.0; PM at T_p* = 3,400 h with CBM backup; 46% annual cost reduction vs RTF.
- **Oil & Gas (compressor-valve CBM)**: weekly CBM with P-F = 21 d; 96% reduction in unscheduled shutdowns.
- **Aerospace (APU starter PM/CBM)**: scheduled discard at T_p* = 2,300 cycles + CBM motor-current signature; 71% lifecycle cost reduction vs RTF.
- **Power (turbine-governor PM)**: Weibull β=3.0 wear-out; PM at T_p* = 8,500 h (annual outage).
- **Mining (haul-truck engine PM)**: Weibull β=2.5; PM at T_p* = 4,000 h with oil-spectroscopy CBM; 35% reduction in engine replacements.`,
    decision_scenario: `You are the CRE on a 50-unit hydraulic-power-unit (HPU) fleet. Field data: bearing wear-out Weibull β=2.4, η=12,000 h; seal wear-out Weibull β=1.8, η=8,500 h. Contract requires operational availability A_o ≥ 96%. (a) Perform RCM Q1-Q7 on the bearing. (b) For the bearing, is on-condition (vibration CBM) feasible? P-F = 35 d. (c) Compute T_p* for the bearing (C_p = $400, C_f = $4,500) by iterating the age-replacement cost. (d) Compute fleet expected failures/yr at T_p* vs RTF. (e) Verify A_o at T_p* with MDT = 8 h (assume PM takes 4 h planned, failure takes 8 h unplanned + 16 h logistics). (f) Repeat for the seal and integrate.`,
    practice_questions: `- **Q1 (Easy, Recall):** State the SAE JA1011 seven RCM questions.
- **Q2 (Medium, Calculation):** A Weibull β=2.0, η=10,000 h failure mode; C_p=$200, C_f=$2,000. Compute C(T_p) at T_p=3,000 h; compare to T_p=5,000 h.
- **Q3 (Medium, Application):** An exponential (β=1) failure mode; C_p=$200, C_f=$2,000. Should you do PM? Justify mathematically.
- **Q4 (Hard, Analyze):** A failure mode has safety consequence and no technically-feasible proactive task. What does RCM Q7 prescribe? Why?`,
    certification_questions: `- **CRE-style (Easy):** Under SAE JA1011, which is NOT one of the seven RCM questions? (a) Functions (b) Failure modes (c) Spare-parts inventory (d) Failure consequences.
- **CRE-style (Medium, Calculation):** A Weibull β=2.0, η=10,000 h; C_p=$200, C_f=$2,000. The age-replacement optimal interval T_p* is approximately (a) 1,000 h (b) 3,400 h (c) 8,862 h (d) 10,000 h.
- **CRE-style (Hard, Analysis):** For an exponential (β=1) failure mode with C_p=$200, C_f=$2,000, what is the optimal PM interval? Justify.`,
    summary: `Maintenance strategy selection is per failure mode, not per asset. The four strategies (reactive, preventive, predictive, RCM) form a decision tree where RCM is the meta-process. SAE JA1011 prescribes the seven RCM questions (functions → functional failures → failure modes → failure effects → failure consequences → proactive tasks → default actions). PM optimization uses the age-replacement model C(T_p) = [C_p·R + C_f·F]/M(T_p), with the optimal T_p* found by numerical search; T_p* exists only when h(t) is increasing (Weibull β>1). For exponential constant-hazard regimes (β=1) PM is non-beneficial — the memoryless property makes any planned replacement waste. CBM requires a detectable P-F interval with sample rate ≤ P-F/2. RCM requires annual re-baselining from field failure data to re-fit β/η and re-optimize T_p*.`,
    key_takeaways: `- Strategy is per failure mode, not per asset; an asset may have a PM'd bearing and a RTF'd gasket.
- PM is technically feasible only when h(t) increasing (β>1 Weibull wear-out) and single dominant mode.
- CBM is technically feasible only when detectable P-F interval exists with sample rate ≤ P-F/2.
- RCM (SAE JA1011) seven questions route each failure mode to its most-applicable task by consequence.
- Age-replacement cost C(T_p) = [C_p·R + C_f·F]/M(T_p); T_p* exists only when β>1.
- For exponential (β=1) T_p* = ∞: PM never pays; CBM or RTF is rational.
- Safety/environmental consequence → mandatory proactive task or one-time redesign; non-operational → RTF if no cost-justified task.`,
    references: `- ASQ CRE Body of Knowledge — Maintenance & Logistics domain.
- SAE JA1011 — Evaluation Criteria for Reliability-Centered Maintenance (RCM) Processes.
- Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 11 (Maintainability) & maintenance appendix (PM optimization).
- Moubray (1997), Reliability-Centered Maintenance II, the seven-questions process and task-selection logic.
- Jardine & Tsang (2017), Maintenance, Replacement, and Reliability, Ch. 2 (PM optimization — age & block replacement).
- MIL-STD-1388 — LSA/LORA framework (referenced for the support-system integration of RCM tasks).`,
  },
  knowledgeObject: {
    title: "Maintenance Strategies & RCM",
    domain: "Maintenance & Logistics",
    competency: "Maintenance Strategies & RCM",
    topic: "Maintenance Strategy Selection and RCM",
    concept: "Reactive / Preventive / Predictive / RCM strategies, SAE JA1011 seven questions, age-replacement PM optimization",
    body: {
      definitions: [
        "Reactive maintenance (RTF, run-to-failure): act only after failure; defensible when non-operational, low-consequence, repairable.",
        "Preventive maintenance (PM): scheduled restoration or discard at fixed interval T_p; defensible when wear-out (β>1) and single dominant mode.",
        "Predictive maintenance (PdM, CBM): condition-based — monitor leading indicator (vibration, oil, thermal), act on P-F interval trend.",
        "P-F interval: time from detectable Potential failure to functional Failure; CBM sample rate ≤ P-F/2 (Moubray's rule).",
        "RCM (Reliability-Centered Maintenance): SAE JA1011 seven-questions process routing each failure mode to its most-applicable task.",
        "SAE JA1011: standard defining minimum attributes (seven questions) a process must satisfy to be called RCM.",
        "Functional failure: how the asset fails to deliver its function (total loss, partial, off-spec).",
        "Failure consequence (RCM): safety, environmental, operational, non-operational × evident/hidden.",
        "On-condition task: CBM task — detect potential-failure condition, act before functional failure.",
        "Scheduled restoration: PM at fixed interval — restore to as-new (rebuild, calibrate).",
        "Scheduled discard: PM at fixed interval — replace with new (discard old unit).",
        "Failure-finding task: periodic functional test of a hidden, normally-inactive function.",
        "Age-replacement policy: renewal-theory optimal PM interval T_p* that minimizes C(T_p) = [C_p·R + C_f·F]/M(T_p).",
      ],
      principles: [
        "Strategy selection is per failure mode, not per asset.",
        "PM pays only when h(t) is increasing (β>1); for exponential (β=1) PM is non-beneficial.",
        "CBM pays only when detectable P-F interval exists and sample rate × 2 < P-F.",
        "RCM Q7: safety/environmental consequence with no proactive task → mandatory redesign; non-operational → RTF.",
        "Age-replacement optimal T_p* exists only when h(t) increasing; C(T_p) U-shaped in T_p.",
        "Failure-finding interval driven by required availability of hidden function (interval ≤ -ln(1-A_req)/λ).",
        "RCM is iterative — field data feeds back into FMEA, β/η re-fit, T_p* re-optimization annually.",
      ],
      components: [
        "Function statement (with performance standard).",
        "Functional failure (total loss, partial, off-spec).",
        "Failure mode (FMEA row — the cause at maintenance-actionable level).",
        "Failure effect (physical symptoms, operational impact).",
        "Consequence category (evident/hidden × safety/env/operational/non-operational).",
        "Task interval T_p (PM) or sample rate Δ (CBM).",
        "Planned cost C_p and failure cost C_f (age-replacement model inputs).",
        "Survival R(T_p), failure F(T_p), expected time M(T_p) = ∫_0^T_p R(u)du.",
      ],
      mechanism: [
        "RCM lifecycle: write functions → list functional failures → FMEA failure modes → failure-effect narratives → classify consequence → select task (CBM/restoration/discard/failure-finding) by feasibility + worth-doing → compute T_p* by age-replacement optimization → integrate into asset PM/CBM calendar → verify A_o → annual re-baseline from field data.",
      ],
      process: [
        "1. Build asset register + function statements with performance standards (RCM Q1).",
        "2. List functional failures per function (Q2): total loss, partial, off-spec.",
        "3. FMEA (Q3): every failure mode at the maintenance-actionable level.",
        "4. Failure-effect narratives (Q4): symptoms, operational impact, safety/environmental.",
        "5. Consequence classification (Q5): evident/hidden × safety/env/operational/non-operational.",
        "6. Task selection (Q6): on-condition / scheduled restoration / scheduled discard / failure-finding — by feasibility + worth-doing.",
        "7. Compute T_p* by age-replacement C(T_p) minimization (PM tasks) or P-F/2 (CBM tasks).",
        "8. Verify failure-finding interval by required availability of hidden function.",
        "9. Integrate into asset-level PM/CBM calendar; verify operational availability target.",
        "10. Annual re-baseline: re-fit β/η from field failures, re-optimize T_p*.",
      ],
      formulas: [
        "R(t) = exp(-(t/η)^β); F(t) = 1 - R(t); MTBF = η·Γ(1+1/β).",
        "Age-replacement: C(T_p) = [C_p·R(T_p) + C_f·F(T_p)] / M(T_p), M(T_p) = ∫_0^T_p R(u)du.",
        "For β=2.0: M(T_p) = (η·√π/2)·erf(T_p/η) ≈ 8862·erf(T_p/η).",
        "Block replacement: C_block(T) = (C_p + C_f·H(T))/T (H = renewal function).",
        "P-F interval design: Δ ≤ P-F/2 (Moubray's rule for CBM sample rate).",
        "Failure-finding interval: FF ≤ -ln(1-A_req)/λ_hidden (hidden-function availability target).",
      ],
      metrics: [
        "C(T_p) [$/h] — age-replacement expected cost per unit time.",
        "T_p* [h] — optimal PM interval (minimum of C(T_p)).",
        "P-F [h or d] — potential-to-functional failure lead time (CBM design parameter).",
        "Δ [h or d] — CBM sample interval (≤ P-F/2).",
        "A_o = MTBF/(MTBF+MDT) — operational availability (RCM program success metric).",
        "Percent cost reduction vs RTF: (C_RTF - C(T_p*))/C_RTF × 100%.",
        "Failures per year per fleet: N·t_op/MTBF (RTF) or N·t_op/T_p*·F(T_p*) + N·(t_op/T_p*)·R(T_p*)/MTBF_segment (PM).",
      ],
      examples: [
        "Bearing wear-out β=2.0, η=10,000 h, C_p=$200, C_f=$2,000: T_p* ≈ 3,400 h, C = $0.121/h; RTF C = $0.226/h; PM saves 46%.",
        "Exponential β=1, λ=1×10⁻⁴/h, C_p=$200, C_f=$2,000: C(T_p) monotone increasing in T_p → T_p* = ∞ (PM never pays).",
        "CBM with P-F = 30 d → sample interval ≤ 15 d → weekly sampling safe.",
        "Failure-finding for hidden function λ=1×10⁻⁴/h, required A=0.99 → FF ≤ -ln(0.01)/1e-4 = 4,605 h (test every 6 months).",
      ],
      industrial_examples: [
        "Manufacturing — chemical plant centrifugal-pump bearing PM at T_p* = 3,400 h; 97% failure reduction; $145,000/yr fleet savings.",
        "Oil & Gas — gas-compressor valve CBM weekly (P-F = 21 d); 96% reduction in unscheduled shutdowns; $480,000/yr savings.",
        "Aerospace — APU starter clutch-disk wear-out (β=2.6); scheduled discard at T_p* = 2,300 cycles + motor-current CBM; 71% lifecycle cost reduction.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Aerospace APU starter: 12 units, 8 failures in year 1; Weibull β=2.6, η=4,200 cycles; RCM classified as Evident×Operational; age-replacement T_p* = 2,300 cycles (C_p=$1,800, C_f=$12,500); CBM (motor-current, P-F=50 cycles, sample=25 cycles) selected as primary with discard at 4,000 cycles safe upper bound. Method per Moubray (1997) and Jardine & Tsang (2017, Ch. 2).",
      ],
      common_errors: [
        "Applying PM to exponential (β=1) constant-hazard failure modes.",
        "Setting T_p by calendar convenience instead of cost-optimal T_p*.",
        "Confusing CBM sample rate with PM interval — sample rate is P-F/2, not by failure distribution.",
        "Treating RCM as one-time — must re-baseline annually from field data.",
        "Routing safety-consequential failures to RTF because no cost-justified PM — SAE JA1011 Q7 mandates redesign.",
        "Pooling competing failure modes into a single Weibull fit — age-replacement assumes single dominant mode.",
        "Using MTTF as the PM interval — T_p* < MTTF always (when β>1).",
      ],
      limitations: [
        "Age-replacement model assumes instantaneous detection, immediate replacement, perfect renewal (as-new), deterministic costs.",
        "Single-mode assumption breaks under competing risks — use renewal-function H(T) or mixture-of-Weibulls.",
        "RCM is labor-intensive (4-6 person-weeks per critical asset) — cost-benefit must be justified by asset criticality.",
        "SAE JA1011 does not prescribe HOW to do RCM — commercial variants vary in rigor.",
        "P-F interval is statistical — sample-rate × 2 < P-F is heuristic; field variability may require Bayesian CBM thresholds.",
      ],
      best_practices: [
        "Always select strategy per failure mode, not per asset — an asset may have a PM'd bearing and a RTF'd gasket.",
        "Fit Weibull (β, η) by MLE from field failure data before computing T_p*; check the 95% CI on β excludes 1.0 (to justify PM over RTF).",
        "Iterate C(T_p) over a grid of T_p values to find T_p* numerically (no closed form for general β).",
        "Verify CBM feasibility: P-F interval measured > 2 × sample interval (Moubray rule).",
        "Verify failure-finding feasibility: interval ≤ -ln(1-A_req)/λ_hidden.",
        "Annual re-baseline: re-fit β/η, re-optimize T_p*, update FMEA.",
        "Integrate PM and CBM into a single asset-level calendar with operational availability target verified (A_o ≥ target).",
      ],
      related_concepts: [
        "Spare Parts Logistics & LORA (Lesson 2) — spare-parts stocking is driven by the failure rate λ and the PM interval T_p*.",
        "Maintainability & Supportability (Lesson 3) — MDT (mean downtime) depends on the support system (spares, training, BIT).",
        "ASQ CRE Reliability Modeling (RM) — FMEA is the input to RCM Q3.",
        "ASQ CRE Failure Mechanisms (FM) — wear-out physics drives the Weibull β>1 that justifies PM.",
      ],
      prerequisites: [
        "ASQ CRE Reliability Fundamentals (RF) — R(t), MTBF, MTTR, bath-tub, hazard.",
        "ASQ CRE Probability & Statistics (PS) — Weibull R(t)=exp(-(t/η)^β), MTBF=η·Γ(1+1/β), MLE fit.",
        "ASQ CRE Reliability Modeling (RM) — FMEA basics, FTA, RBD.",
        "ASQ CRE Failure Mechanisms (FM) — wear-out, fatigue, corrosion failure physics.",
      ],
      references: [
        "ASQ CRE Body of Knowledge — Maintenance & Logistics domain.",
        "SAE JA1011 — Evaluation Criteria for RCM Processes (1999).",
        "Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 11.",
        "Moubray (1997), Reliability-Centered Maintenance II.",
        "Jardine & Tsang (2017), Maintenance, Replacement, and Reliability, Ch. 2.",
        "MIL-STD-1388 — LSA/LORA framework (support-system integration of RCM tasks).",
      ],
    },
  },
  questions: [
    {
      competencyName: "Maintenance Strategies & RCM",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which statement best describes a maintenance strategy that is technically feasible for an exponential (constant-hazard, β=1) failure mode?",
      whyCorrect:
        "For an exponential distribution the hazard h(t) = λ is constant (memoryless). The residual life of a unit that has survived to age t is identical to a new unit. Any preventive replacement at planned interval T_p gives zero reduction in failure probability per operating hour — the planned cost C_p is pure waste. The optimal age-replacement interval T_p* = ∞ (PM never pays). The correct strategies are condition-based (if a P-F interval exists despite constant hazard — e.g., detectable precursor to a random-overload failure) or run-to-failure (if non-operational).",
      whyOthersWrong: [
        "Option A (Scheduled restoration at MTBF) — for exponential the MTBF = 1/λ; restoring at MTBF gives the same failure rate as a new unit (memoryless), so the PM cost is pure waste; R(T_p) at T_p = MTBF is exp(-1) = 0.3679 (the 36.8% survive rule) but the failure rate after replacement is still λ — no reliability gain.",
        "Option B (Scheduled discard at T_p* < MTBF) — for exponential there is no finite T_p*; the age-replacement cost C(T_p) is monotonically increasing in T_p (because M(T_p) = (1-exp(-λT_p))/λ and the cost numerator also rises, but the ratio is monotone), so T_p* = ∞ — any finite T_p is suboptimal.",
        "Option D (Annual overhaul regardless of condition) — calendar-based overhaul on a constant-hazard mode is the canonical RCM anti-pattern; SAE JA1011 Q6 (worth-doing test) fails because the reduction in failure probability per dollar of PM cost is zero.",
      ],
      explanation:
        "Exponential (β=1): h(t)=λ constant; memoryless; age-replacement T_p* = ∞ (PM never pays). Use CBM (if P-F exists) or RTF.",
      options: [
        { text: "Scheduled restoration at the MTBF interval", isCorrect: false },
        { text: "Scheduled discard at T_p* less than the MTBF", isCorrect: false },
        { text: "Condition-based (CBM) if a P-F interval is detectable, or run-to-failure (RTF) if non-operational", isCorrect: true },
        { text: "Annual calendar-based overhaul regardless of condition", isCorrect: false },
      ],
    },
    {
      competencyName: "Maintenance Strategies & RCM",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Manufacturing",
      stem: "A centrifugal-pump bearing wear-out mode is fit by Weibull β=2.0, η=10,000 h. C_p=$200 (planned), C_f=$2,000 (failure). The optimal age-replacement PM interval T_p* and the resulting expected cost per operating hour are approximately:",
      whyCorrect:
        "The age-replacement model: C(T_p) = [C_p·R(T_p) + C_f·F(T_p)] / M(T_p), where R(T_p)=exp(-(T_p/η)^β), F(T_p)=1-R(T_p), and M(T_p)=∫_0^T_p R(u)du = (η·√π/2)·erf(T_p/η) for β=2.0 (≈ 8862·erf(T_p/η)). Iterating over T_p ∈ {2000, 2500, 3000, 3250, 3400, 3500, 4000, 5000} h: at T_p=3,250 h, R=0.8998, F=0.1002, M=3,140 h, C=(200·0.8998+2000·0.1002)/3140 = (179.96+200.40)/3140 = 380.36/3140 = $0.1211/h. At T_p=3,400 h, R=0.8908, F=0.1092, M=3,274 h, C=(178.16+218.40)/3274 = 396.56/3274 = $0.1211/h. The minimum is ≈ $0.121/h at T_p* ≈ 3,250-3,400 h. Adopt T_p* ≈ 3,400 h (rounded to one month).",
      whyOthersWrong: [
        "Option A (T_p* = 8,862 h, $0.06/h) — 8,862 h is the MTBF (η·Γ(1.5)); using MTBF as T_p is a common mistake (it ignores the U-shape of C(T_p)); at T_p=MTBF, R(MTBF)=exp(-0.7862)=0.4556, F=0.5444, M(MTBF)=η·Γ(1.5)·erf(MTBF/η)=8862·0.78 = 6,913 h; C=(200·0.4556+2000·0.5444)/6913 = (91.12+1088.80)/6913 = 1179.92/6913 = $0.1707/h — well above the optimum $0.121/h.",
        "Option B (T_p* = 1,000 h, $0.155/h) — 1,000 h is far below the cost-optimal T_p (over-maintenance); at T_p=1,000, R=exp(-0.01)=0.9900, F=0.0099, M=8862·erf(0.1)=8862·0.1125=997 h, C=(200·0.99+2000·0.01)/997=(198+20)/997=218/997=$0.2185/h — much worse than $0.121/h.",
        "Option D (T_p* = 10,000 h, $0.085/h) — 10,000 h = η (characteristic life); at T_p=η, R=exp(-1)=0.3679, F=0.6321, M(η)=8862·erf(1)=8862·0.8427=7,470 h, C=(200·0.3679+2000·0.6321)/7470=(73.58+1264.20)/7470=1337.78/7470=$0.1791/h — also well above $0.121/h.",
      ],
      explanation:
        "T_p* ≈ 3,400 h; C(T_p*) ≈ $0.121/h. The U-shape of C(T_p) gives a clear finite minimum only when β>1 (wear-out); the minimum balances the over-maintenance cost (low T_p, high C_p) against the failure cost (high T_p, high C_f).",
      options: [
        { text: "T_p* = 8,862 h (MTBF); C ≈ $0.06/h", isCorrect: false },
        { text: "T_p* = 1,000 h; C ≈ $0.155/h", isCorrect: false },
        { text: "T_p* ≈ 3,400 h; C ≈ $0.121/h", isCorrect: true },
        { text: "T_p* = 10,000 h (η); C ≈ $0.085/h", isCorrect: false },
      ],
    },
    {
      competencyName: "Maintenance Strategies & RCM",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Oil & Gas",
      stem: "An RCM analysis (SAE JA1011) classifies a failure mode as having a safety consequence, and no technically-feasible proactive maintenance task is found (no detectable P-F, no age-related wear-out, no functional test that would reveal the hidden failure). What does RCM Question 7 prescribe as the default action?",
      whyCorrect:
        "Under SAE JA1011, the seventh RCM question (default actions) prescribes: for a failure mode with safety or environmental consequence, if no proactive task (CBM, scheduled restoration/discard, failure-finding) is technically feasible AND worth doing, the default action is a one-time redesign that eliminates the failure mode or reduces its probability of occurrence to a tolerable level. The reasoning: safety/environmental consequences cannot be tolerated, so RTF is not an acceptable default — the asset must be re-engineered (e.g., add redundancy, substitute a safer technology, add an interlock). This is the strongest of the RCM defaults and the one that most often drives engineering change in safety-critical industries (aerospace, nuclear, oil & gas).",
      whyOthersWrong: [
        "Option A (Run-to-failure with enhanced spares) — RTF is the default for NON-OPERATIONAL consequences only; for safety consequences SAE JA1011 mandates redesign. Enhanced spares do not reduce the probability of the safety event; they only shorten the recovery time, which is insufficient when the failure itself could hurt someone.",
        "Option B (Increase PM frequency on adjacent assets) — this addresses neighboring failure modes, not the one under analysis; it does not satisfy Q7 for the safety-consequential mode itself.",
        "Option D (Accept the residual risk with documentation) — risk acceptance without engineering action is not an SAE JA1011 default for safety consequences; the standard mandates redesign. Risk acceptance may be appropriate only after a documented ALARP (as-low-as-reasonably-practicable) analysis with regulatory approval in specific safety-regulated industries, but it is not a Q7 default.",
      ],
      explanation:
        "SAE JA1011 Q7: safety/environmental consequence with no technically-feasible proactive task → mandatory one-time redesign (eliminate the mode or reduce probability to tolerable). RTF default applies only to non-operational consequences.",
      options: [
        { text: "Run-to-failure with enhanced spare-parts stocking", isCorrect: false },
        { text: "Increase preventive-maintenance frequency on adjacent assets", isCorrect: false },
        { text: "One-time redesign of the asset to eliminate the failure mode or reduce its probability to a tolerable level", isCorrect: true },
        { text: "Accept the residual risk with formal documentation and management sign-off", isCorrect: false },
      ],
    },
    {
      competencyName: "Maintenance Strategies & RCM",
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Manufacturing",
      stem: "True or False: Under the SAE JA1011 RCM process, an on-condition (CBM) task is technically feasible only when a potential-failure condition exists that is detectable before functional failure, and the P-F (potential to functional) interval is longer than twice the sample (inspection) interval.",
      whyCorrect:
        "TRUE. SAE JA1011 (and Moubray's operational RCM II) specify two technical-feasibility conditions for an on-condition (CBM) task: (i) there must exist a detectable potential-failure condition that clearly indicates that functional failure is impending (a precursor symptom — vibration, temperature, oil debris, ultrasonic, motor-current signature); (ii) the P-F interval (the time between when the potential-failure condition first becomes detectable and when functional failure actually occurs) must be reasonably consistent and longer than the time needed to take corrective action. Moubray's operational rule of thumb: the inspection (sample) interval Δ should be at most half the P-F interval (Δ ≤ P-F/2), so that the failure is detected with at least one sampling period of lead time before functional failure. If P-F varies widely, or if the inspection cannot be performed at least twice per P-F, the CBM task is not technically feasible — and RCM routes to a different task type or to redesign/RTF default.",
      whyOthersWrong: [
        "Option FALSE — would imply that CBM feasibility does not require a detectable P-F interval; in fact SAE JA1011's Q6 task-selection logic explicitly tests for the existence of a clear P-F interval as a precondition for on-condition tasks. Without a P-F interval, the CBM task cannot give early warning, and the failure would be detected only after functional failure — equivalent to RTF with a sensor. Moubray's P-F/2 rule is the operational expression of this feasibility test.",
      ],
      explanation:
        "TRUE. CBM feasibility requires: (i) detectable potential-failure condition before functional failure, (ii) consistent P-F interval > 2 × inspection interval (Moubray's rule: Δ ≤ P-F/2).",
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Spare Parts Logistics & LORA
// (Competency: "Spare Parts Logistics & LORA"; slug:
//  ml-spare-parts-logistics-lora)
// ---------------------------------------------------------------------------

const LESSON_LORA: RefLesson = {
  competencyName: "Spare Parts Logistics & LORA",
  slug: "ml-spare-parts-logistics-lora",
  title: "Spare Parts Logistics & Level of Repair Analysis (LORA)",
  titleAr: "لوجستيات قطع الغيار وتحليل مستوى الإصلاح",
  order: 2,
  durationMin: 38,
  references: ML_REFERENCE_TITLES,
  conceptIntroduction: `Spare-parts inventory and Level of Repair Analysis (LORA) are the quantitative core of logistics engineering. Spare-parts inventory determines how many spares to hold, where to hold them, and when to reorder — balancing the cost of inventory (capital, holding, obsolescence) against the cost of stockout (downtime, lost production, expedited procurement). The canonical models are the Economic Order Quantity (EOQ = √(2DS/H)), safety stock (SS = Z·σ_LT where σ_LT is the lead-time demand standard deviation), and the reorder point (ROP = d·L + SS). For reliability-driven spares, demand is failure-driven: expected annual demand D = N·t_op/MTBF where N is fleet size and t_op is operating hours per year. Critical-spares classification (ABC by value, VED by criticality, HML by lead time) prioritizes which items justify safety stock vs. which can be expedited on demand. LORA (per MIL-STD-1388) is the engineering decision for each Line Replaceable Unit (LRU) and Shop Replaceable Unit (SRU): repair at depot (or intermediate) vs. discard and replace with new. The break-even failure count n* = C_standby/(C_discard - C_repair - C_logistics) tells whether the unit's expected failure rate justifies the capital investment in repair tooling, training, and standby spares.`,
  example: `A pump impeller is a wear part. Fleet size N = 50 pumps, t_op = 8,000 h/yr, MTBF_impeller = 4,000 h → expected annual demand D = 50·8000/4000 = 100 units/yr. Unit cost C_u = $500. Ordering cost S = $50/order. Annual holding cost per unit H = $1.25/unit/month = $15/unit/yr (30% of unit cost). EOQ = √(2DS/H) = √(2·100·50/15) = √(666.67) = 25.82 → 26 units/order. Annual ordering cost = (D/EOQ)·S = (100/26)·50 = $192/yr. Annual holding cost = (EOQ/2)·H = 13·$15 = $195/yr. Total inventory cost = $387/yr. Lead time L = 60 days; daily demand d = 100/365 = 0.274 units/day; demand-during-lead-time = d·L = 16.4 units. Std dev of daily demand σ_d = 0.6 units/day (failure-driven Poisson → σ_d = √(d) = √0.274 = 0.524); σ_LT = σ_d·√L = 0.524·√60 = 4.06 units. Service level 95% → Z = 1.645; safety stock SS = Z·σ_LT = 1.645·4.06 = 6.68 → 7 units. Reorder point ROP = d·L + SS = 16.4 + 7 = 23.4 → 24 units. Min/Max: Min = ROP = 24; Max = ROP + EOQ = 24 + 26 = 50.`,
  keyFormulas: `MTBF-driven demand: D = N·t_op / MTBF  (expected annual spare demand)
Economic Order Quantity (EOQ): Q* = √(2DS/H)
  D = annual demand [units/yr]; S = ordering cost [$/order]; H = annual holding cost per unit [$/unit/yr]
Annual ordering cost = (D/Q)·S; Annual holding cost = (Q/2)·H; Total = (D/Q)·S + (Q/2)·H
Safety Stock (SS) for service level (1-α): SS = Z_α · σ_LT
  σ_LT = σ_d · √L  (lead-time demand std dev = daily-demand std dev × √(lead time in days))
  Z_α = standard normal quantile at service level (90%→1.282, 95%→1.645, 99%→2.326)
Reorder Point (ROP): ROP = d·L + SS  (d = daily demand, L = lead time in days)
Min/Max inventory: Min = ROP; Max = ROP + EOQ
LORA break-even (repair vs discard):
  Annual discard cost: A_discard = n · C_d  (n = annual failures, C_d = new-unit cost)
  Annual repair cost: A_repair = n · (C_r + C_log) + C_standby  (C_r = repair cost, C_log = logistics per event, C_standby = capital for standby spare + tooling/training)
  Break-even: n* = C_standby / (C_d - C_r - C_log)
  If n > n*, repair pays; if n < n*, discard pays.
VARI-METRIC (multi-echelon) extends the single-echelon EOQ/SS model to base-depot-warehouse networks (Sherbrooke).`,
  exercise: `You are the CRE on a 30-unit mining-haul-truck fleet. The diesel-hydraulic pump MTBF = 2,500 h, t_op = 6,000 h/yr, unit cost $3,200, ordering cost $200/order, holding cost 25% of unit cost per year. Lead time 45 days. (a) Compute MTBF-driven annual demand D and EOQ. (b) Compute safety stock at 95% service (Poisson failure assumption σ_d = √d). (c) Compute ROP and Min/Max. (d) For the LORA decision: new pump $3,200, depot repair $1,400 + $250 logistics, one standby pump $3,200 + $5,000 tooling/training capital. Compute n* and recommend repair or discard. (e) Compute the 5-year cumulative savings of the recommended policy vs the alternative.`,
  sections: {
    learning_objectives: `- Distinguish the four inventory models (EOQ for deterministic demand, (s,S) for stochastic demand, NEWSEVOR for one-time spares, multi-echelon VARI-METRIC for base-depot networks).
- Compute the MTBF-driven annual demand D = N·t_op/MTBF and use it as the input to EOQ, safety stock, and ROP.
- Apply the EOQ formula Q* = √(2DS/H) and the safety-stock formula SS = Z·σ_LT with σ_LT = σ_d·√L.
- Compute the reorder point ROP = d·L + SS and the Min/Max inventory policy.
- Classify spares by criticality (VED — Vital, Essential, Desirable; ABC by value; HML by lead time) and choose the inventory policy accordingly.
- Perform Level of Repair Analysis (LORA) per MIL-STD-1388: decompose the system into LRUs and SRUs, compute the break-even failure count n* = C_standby/(C_d - C_r - C_log), and decide repair vs discard for each item.
- Integrate the spares plan with the maintenance plan (T_p* from Lesson 1) to verify operational availability A_o = MTBF/(MTBF+MDT) with MDT including the spares delay.`,
    prerequisites: `- ASQ CRE Reliability Fundamentals (RF) — MTBF, failure rate λ, the constant-failure-rate assumption.
- ASQ CRE Probability & Statistics (PS) — the Poisson distribution (failure counts), the normal approximation to Poisson, Z-quantiles.
- ASQ CRE Maintenance Strategies & RCM (Lesson 1 of this pillar) — T_p* and the failure rate drive spare-parts demand.
- Basic inventory accounting: holding cost, ordering cost, stockout cost, the trade-off triangle.`,
    introduction: `Spare-parts logistics answers two engineering questions: (1) how many spares to hold and where (the inventory policy), and (2) for each failed unit, whether to repair it or discard it (the LORA decision). The first is governed by inventory theory; the second by life-cycle cost analysis under MIL-STD-1388 (Logistics Support Analysis, LSA).

The inventory policy is set by the demand process. For reliability-driven spares, demand is failure-driven: the expected number of failures per year is D = N·t_op/MTBF where N is the fleet size and t_op is the operating hours per year per unit. The Poisson character of constant-λ failures makes the demand-during-lead-time also Poisson (with mean d·L), and for large d·L the normal approximation gives σ_LT = √(d·L) (i.e., σ_d = √d, σ_LT = σ_d·√L). The safety stock SS = Z·σ_LT sets the buffer for service level (1-α). The EOQ formula Q* = √(2DS/H) sets the order quantity that minimizes the sum of ordering and holding cost. The reorder point ROP = d·L + SS triggers the next order.

Critical-spares classification (the VED × ABC × HML cube) prioritizes: Vital (V) — production stops, safety, environmental; Essential (E) — production degrades; Desirable (D) — convenience. Combined with ABC (value A=high-cost/low-count, B=medium, C=low-cost/high-count) and HML (lead time Hard/medium/easy), the policy matrix yields: Vital+Hard+High-cost → high safety stock (Z=2.326, 99% service); Desirable+Easy+Low-cost → no safety stock, expedite on demand.

LORA (Level of Repair Analysis, per MIL-STD-1388) decomposes the system into Line Replaceable Units (LRUs — swapped at the operational site) and Shop Replaceable Units (SRUs — sub-modules swapped at the intermediate or depot shop). For each LRU/SRU, the engineer evaluates the repair-vs-discard decision by life-cycle cost: capital (tooling, training, technical data, facilities), recurring (per-failure repair cost, logistics, spares pipeline), and risk (cannibalization, deferred maintenance). The break-even failure count n* = C_standby/(C_d - C_r - C_log) — above which repair pays, below which discard pays — provides the quantitative decision. MIL-STD-1388 prescribes the LSA (Logistics Support Analysis) record format that documents the decision rationale for each item.`,
    terminology: `- **Spare part**: a replaceable item held in inventory to restore a failed asset to service.
- **EOQ (Economic Order Quantity)**: order quantity Q* that minimizes total inventory cost = ordering + holding.
- **Safety stock (SS)**: buffer inventory to absorb demand variability during lead time; SS = Z·σ_LT.
- **Reorder point (ROP)**: inventory level at which a new order is placed; ROP = d·L + SS.
- **Min/Max policy**: Min = ROP (trigger), Max = ROP + EOQ (fill-up level).
- **Lead time (L)**: time from order placement to receipt [days].
- **Demand during lead time (DDL)**: expected demand while waiting for the order; = d·L.
- **σ_d**: std dev of daily demand [units/day].
- **σ_LT**: std dev of demand during lead time = σ_d·√L.
- **Z_α**: standard normal quantile at service level (1-α).
- **Service level (1-α)**: probability of no stockout during lead time (e.g., 95%, 99%).
- **VED classification**: Vital / Essential / Desirable (criticality).
- **ABC classification**: A=high-value low-count, B=medium, C=low-value high-count.
- **HML classification**: Hard (long-lead), Medium, Low (short-lead).
- **LORA (Level of Repair Analysis)**: repair-vs-discard decision per LRU/SRU.
- **LRU (Line Replaceable Unit)**: swapped at the operational site (organizational level).
- **SRU (Shop Replaceable Unit)**: sub-module swapped at the intermediate or depot shop.
- **LSA (Logistics Support Analysis)**: MIL-STD-1388 framework documenting LORA + spares + support equipment + training + technical data per item.
- **Multi-echelon**: inventory held at multiple levels (base, depot, warehouse) — VARI-METRIC model (Sherbrooke).`,
    detailed_explanation: `Spare-parts demand is the engine of the inventory policy. For a constant-failure-rate fleet (exponential MTBF), the expected annual failures are D = N·t_op/MTBF; for a wear-out fleet (Weibull β>1) with PM at T_p*, the demand becomes D = N·(t_op/T_p*)·F(T_p*) (the failures within a PM interval) — typically far lower. The Poisson character of constant-λ demand gives σ_d = √d (the daily-demand std dev equals the square root of the mean daily demand), and σ_LT = σ_d·√L (the variance accumulates over lead time). For high-volume spares (d·L > ~10) the normal approximation to Poisson is accurate; for low-volume (rare-but-critical spares, d·L < ~5) use the exact Poisson quantile.

The EOQ formula Q* = √(2DS/H) derives from minimizing C(Q) = (D/Q)·S + (Q/2)·H — the ordering cost (more orders → more cost) plus the holding cost (more inventory → more cost). The optimum is where the derivatives balance: dC/dQ = -DS/Q² + H/2 = 0 → Q* = √(2DS/H). At Q* the ordering cost equals the holding cost (each ≈ √(DSH/2)). The EOQ assumption is deterministic constant demand — it does not directly account for stockout risk; that is the role of safety stock.

Safety stock SS = Z·σ_LT sets the inventory buffer for the chosen service level. Service level (1-α) is the probability of no stockout during lead time. Z = 1.282 (90%), 1.645 (95%), 2.326 (99%), 3.09 (99.9%). For Vital+Hard-lead spares, Z=2.326 (99%) is typical; for Desirable+Easy-lead, Z=0 (no safety stock, expedite on demand). The reorder point ROP = d·L + SS triggers the next EOQ order.

Critical-spares classification (the VED×ABC×HML cube) sets the inventory policy per item. A high-value Vital+Hard-lead LRU (e.g., the gearbox of a critical compressor) justifies Z=2.326 + multi-echelon stocking (base + depot). A low-value Desirable+Easy-lead consumable (e.g., workshop light-bulb) justifies Z=0 + spot-purchase on demand.

LORA (Level of Repair Analysis) is the engineering decision per LRU/SRU. For each item, the engineer compares the discard policy (always replace with new, no repair capability) against the repair policy (depot or intermediate maintenance, repair cost < new-unit cost, but capital investment in tooling/training/standby spares). The annual cost comparison:
- Discard: A_discard = n · C_d (n = annual failures, C_d = new-unit cost).
- Repair: A_repair = n · (C_r + C_log) + C_standby (C_r = per-repair labor/parts cost, C_log = logistics/shipping per event, C_standby = one-time capital for standby spares + tooling/training + technical data).
- Break-even: n* = C_standby / (C_d - C_r - C_log). Above n*, repair pays; below n*, discard pays.

The LSA (Logistics Support Analysis) record per MIL-STD-1388 documents each LORA decision with the inputs (failure rate, fleet size, operating profile), the cost model, the recommendation, and the assigned maintenance level (organizational, intermediate, depot, or factory). Multi-echelon inventory (VARI-METRIC, Sherbrooke) extends the single-echelon EOQ/SS model to base-depot-warehouse networks by accounting for the lateral-supply and pipeline-delay interactions between echelons.`,
    core_principles: `- Demand for spares is failure-driven: D = N·t_op/MTBF (constant-λ) or D = N·(t_op/T_p*)·F(T_p*) (PM'd wear-out).
- EOQ balances ordering cost (more orders → more cost) against holding cost (more inventory → more cost); at Q* the two are equal.
- Safety stock buffers lead-time variability; SS = Z·σ_LT; σ_LT = σ_d·√L; σ_d = √d (Poisson).
- ROP = d·L + SS triggers the next order; Min/Max policy: Min=ROP, Max=ROP+EOQ.
- Criticality classification (VED × ABC × HML) sets the service level Z per item.
- LORA break-even n* = C_standby/(C_d - C_r - C_log) decides repair vs discard per LRU/SRU.
- Multi-echelon inventory (VARI-METRIC) accounts for lateral supply and pipeline delays across base-depot-warehouse networks.
- LSA per MIL-STD-1388 documents the LORA decision + spares + support equipment + training + technical data per item.`,
    components: `- **D (annual demand)**: expected annual spare consumption [units/yr].
- **N (fleet size), t_op (operating hours/yr/unit), MTBF**: the demand drivers.
- **EOQ Q* = √(2DS/H)**: the optimal order quantity.
- **S (ordering cost), H (holding cost per unit per year)**: the cost drivers of EOQ.
- **σ_d (daily-demand std dev), L (lead time), σ_LT = σ_d·√L**: the safety-stock inputs.
- **Z (service-level quantile), SS = Z·σ_LT**: the safety stock.
- **ROP = d·L + SS, Min, Max**: the inventory policy parameters.
- **C_d (new-unit cost), C_r (per-repair cost), C_log (per-event logistics), C_standby (one-time capital)**: LORA cost inputs.
- **n* = C_standby/(C_d - C_r - C_log)**: LORA break-even failure count.
- **LSA record (MIL-STD-1388)**: the documentation artifact per item.`,
    process: `1. Build the spares master: each LRU/SRU with unit cost C_d, lead time L, MTBF, VED/ABC/HML classification.
2. Compute MTBF-driven annual demand D = N·t_op/MTBF (constant-λ) or D = N·(t_op/T_p*)·F(T_p*) (PM'd wear-out from Lesson 1).
3. Per item: compute EOQ Q* = √(2DS/H), σ_LT = σ_d·√L (Poisson σ_d = √d), SS = Z·σ_LT, ROP = d·L + SS, Min/Max.
4. Classify by VED×ABC×HML: set Z (90/95/99/99.9%) and echelon (single/multi).
5. For multi-echelon: run VARI-METRIC to allocate safety stock across base/depot/warehouse.
6. For each LRU/SRU: perform LORA — compute n* = C_standby/(C_d - C_r - C_log), compare to expected n.
7. Document the LORA decision + spares + support equipment + training + technical data per MIL-STD-1388 LSA record.
8. Integrate with the maintenance plan (Lesson 1 T_p*) to verify operational availability A_o = MTBF/(MTBF+MDT) with MDT including the spares delay.
9. Re-baseline annually using field failure data — re-fit MTBF, recompute D, re-optimize Q*, SS, and the LORA decision.`,
    formula_calculation: `Variables and formulas:
- N: fleet size [units]; t_op: operating hours/yr/unit [h]; MTBF: mean time between failures [h].
- D = N·t_op/MTBF: expected annual demand [units/yr].
- d = D/365: mean daily demand [units/day] (use D/52 for weekly, D/12 for monthly as the unit basis).
- σ_d = √d (Poisson): daily-demand std dev [units/day] (for constant-λ fleet; for PM'd wear-out use the binomial std dev per PM interval).
- L: lead time [days] (or whichever unit basis matches d).
- σ_LT = σ_d · √L: lead-time-demand std dev [units].
- Z_α: standard normal quantile at service level (1-α); 90%→1.282, 95%→1.645, 99%→2.326, 99.9%→3.09.
- SS = Z_α · σ_LT: safety stock [units].

EOQ:
- S: ordering cost [$/order] (order processing, supplier setup, receiving, inspection).
- H: annual holding cost per unit [$/unit/yr] = i·C_u where i is the holding cost rate (typically 20-30%/yr) and C_u is the unit cost.
- Q* = √(2DS/H): optimal order quantity [units].
- Total inventory cost C(Q*) = (D/Q*)·S + (Q*/2)·H = √(2DSH) [$/yr] (ordering cost = holding cost at optimum).

Reorder point:
- ROP = d·L + SS [units].
- Min = ROP; Max = ROP + Q* (Min/Max policy).

LORA (per MIL-STD-1388):
- n: annual failures [failures/yr] = D (same as above for the LRU).
- C_d: new-unit cost [$/unit] (replace with new).
- C_r: per-repair recurring cost [$/event] (depot labor, repair parts).
- C_log: per-event logistics cost [$/event] (shipping, handling, packaging).
- C_standby: one-time capital [$/LORA-decision] (standby spare + tooling + training + technical data + facilities).
- A_discard = n · C_d [$/yr].
- A_repair = n · (C_r + C_log) + C_standby [$/yr].
- Break-even: n* = C_standby / (C_d - C_r - C_log) [failures/yr].
- If n > n*: repair pays. If n < n*: discard pays.

Multi-echelon (VARI-METRIC, Sherbrooke): extends the single-echelon formulas by accounting for the pipeline delay (in-transit inventory), lateral supply (base-to-base borrowing), and the echelon's own service level. The model computes the optimal allocation of safety stock across base/depot/warehouse to maximize fleet availability at minimum total inventory capital.

Units: count (units); time (days, h); cost ($); service level [dimensionless 0..1].

Assumptions: (i) constant-λ fleet (Poisson demand) for the σ_d = √d simplification; (ii) deterministic lead time L (no lead-time variability — if variable, use σ_LT² = σ_d²·L + d²·σ_L²); (iii) independent demands across items (no cannibalization); (iv) single-item decision (no spare-pooling across LRUs); (v) constant unit and logistics costs.

Interpretation: EOQ is the order quantity that minimizes the sum of ordering and holding cost; safety stock is the buffer for service level; ROP is the trigger. LORA n* is the failure count above which the repair capital investment is paid back; the annual saving A_discard - A_repair = n·(C_d - C_r - C_log) - C_standby grows linearly in n above n*.`,
    worked_example: `**Spare-parts EOQ + safety stock + LORA — hydraulic-valve actuator (Oil & Gas).**

Step 1 — MTBF-driven annual demand:
Fleet size N = 50 units; t_op = 8,000 h/yr/unit; MTBF_LRU = 10,000 h (exponential, λ = 1×10⁻⁴/h).
D = N·t_op/MTBF = 50·8000/10000 = 40 units/yr.
d = D/365 = 0.1096 units/day.

Step 2 — EOQ:
Unit cost C_u = $500; ordering cost S = $50/order; holding cost H = 0.30·500 = $150/unit/yr.
EOQ Q* = √(2DS/H) = √(2·40·50/150) = √(26.67) = 5.16 → 6 units/order.
Annual ordering cost = (D/Q*)·S = (40/6)·50 = $333/yr.
Annual holding cost = (Q*/2)·H = 3·150 = $450/yr.
Total inventory cost = $783/yr (compared to $1,000/yr at Q=10 or $960/yr at Q=4 — the EOQ minimum is real).

Step 3 — Safety stock:
Lead time L = 30 days; σ_d = √d = √0.1096 = 0.331 units/day (Poisson).
σ_LT = σ_d·√L = 0.331·√30 = 0.331·5.477 = 1.813 units.
Service level 95% → Z = 1.645.
SS = Z·σ_LT = 1.645·1.813 = 2.98 → 3 units.

Step 4 — Reorder point:
ROP = d·L + SS = 0.1096·30 + 3 = 3.29 + 3 = 6.29 → 7 units.
Min/Max: Min = 7, Max = 7 + 6 = 13 units.

Step 5 — LORA repair-vs-discard:
Inputs: C_d = $500 (new actuator), C_r = $120 (depot repair labor + sub-parts), C_log = $30/event (shipping).
C_standby = one standby spare ($500) + tooling ($1,500) + training ($1,000) + tech data ($500) = $3,500 one-time capital.
n* = C_standby / (C_d - C_r - C_log) = $3,500 / ($500 - $120 - $30) = $3,500 / $350 = 10.0 failures/yr.
Actual n = D = 40 failures/yr >> n* = 10 → REPAIR pays.

Step 6 — Annual savings:
A_discard = 40·$500 = $20,000/yr.
A_repair = 40·($120 + $30) + $3,500 = 40·$150 + $3,500 = $6,000 + $3,500 = $9,500/yr.
Annual savings = $20,000 - $9,500 = $10,500/yr (53% reduction).
Payback period (on the standby capital C_standby = $3,500) = $3,500 / $10,500 = 0.33 yr ≈ 4 months.

Step 7 — 5-year cumulative savings:
5-yr discard cost = 5·$20,000 = $100,000.
5-yr repair cost = 5·$6,000 + $3,500 (capital one-time) = $33,500.
5-yr cumulative savings = $100,000 - $33,500 = $66,500.

Method per Jardine & Tsang (2017, Ch. 4) for EOQ/SS, MIL-STD-1388 for the LSA/LORA record format, and Ebeling (2010, Ch. 11) for the multi-echelon context.`,
    industrial_example: `**Oil & Gas — hydraulic-valve actuator spares (40 failures/yr fleet).** A pipeline operator with 50 compressor-station valve actuators (MTBF = 10,000 h, t_op = 8,000 h/yr) implemented the EOQ + safety stock + LORA plan above: EOQ = 6 units, SS = 3 units, ROP = 7 units; LORA repair pays (n* = 10 < n = 40). Annual savings $10,500/yr; 5-yr cumulative $66,500; payback 4 months on the $3,500 capital. The LSA record per MIL-STD-1388 documents the inputs, the decision, and the assigned depot maintenance level. Method per Jardine & Tsang (2017, Ch. 4) and MIL-STD-1388.

**Aerospace — engine LRU multi-echelon.** A regional jet fleet of 80 aircraft × 2 engines × 12 monitored LRUs each = 1,920 LRUs fleet. MTBF_LRU = 12,000 h; t_op = 3,000 h/yr; D = 1,920·3000/12000 = 480 units/yr fleet-wide. Multi-echelon VARI-METRIC (Sherbrooke) allocates safety stock across 4 main bases + 1 central depot; total capital $4.2M; fleet availability A_o = 99.4% (target 99.0%); 4 base spare stockouts/yr (vs. 12 single-echelon) — a 67% reduction in stockouts at equivalent capital. Method per Sherbrooke (VARI-METRIC) and MIL-STD-1388.`,
    case_study: `CASE_TYPE = SYNTHETIC. A mining haul-truck fleet (30 trucks, MTBF_hydraulic-pump = 2,500 h, t_op = 6,000 h/yr) implemented the integrated spares+LORA plan. D = 30·6000/2500 = 72 pumps/yr. EOQ = √(2·72·200/(0.25·3200)) = √(28800/800) = √36 = 6 units/order. σ_d = √(72/365) = √0.197 = 0.444 units/day; σ_LT = 0.444·√45 = 0.444·6.708 = 2.98; SS = 1.645·2.98 = 4.90 → 5 units; ROP = (72/365)·45 + 5 = 8.88 + 5 = 13.88 → 14 units; Min/Max = 14/20. LORA: C_d = $3,200, C_r = $1,400, C_log = $250, C_standby = $5,000 + $3,200 (one standby) = $8,200; n* = $8,200/($3,200-$1,400-$250) = $8,200/$1,550 = 5.29 failures/yr; n = 72 >> n* → REPAIR pays. Annual savings = 72·($3,200-$1,650) - $8,200 = 72·$1,550 - $8,200 = $111,600 - $8,200 = $103,400/yr; 5-yr cumulative $509,000. The LSA record per MIL-STD-1388 documents the LORA decision; depot maintenance level assigned (organizational-level swap of the LRU + depot-level repair of the SRU sub-components). Source: synthetic case authored for this lesson; method per Jardine & Tsang (2017, Ch. 4) and MIL-STD-1388.`,
    visual_explanation: `The EOQ cost curve C(Q) = (D/Q)·S + (Q/2)·H is U-shaped: high cost at low Q (ordering dominates), high cost at high Q (holding dominates), minimum at Q* = √(2DS/H) where the two components balance. The saw-tooth inventory-vs-time plot shows: drop from Max to ROP over (Q/d) days, jump back to Max at receipt, drop to Min during lead time, jump back at receipt. The LORA break-even plot shows two cost lines vs annual failures n: A_discard (slope C_d, intercept 0) and A_repair (slope C_r+C_log, intercept C_standby); they cross at n* = C_standby/(C_d-C_r-C_log). Above n*, the repair line is below the discard line — repair pays.`,
    simulation_opportunity: `An interactive simulation could let the learner (i) input fleet size, MTBF, operating hours to compute MTBF-driven demand D, (ii) input unit cost, ordering cost, holding cost rate, lead time, service level → compute EOQ, SS, ROP, Min/Max, total inventory cost; (iii) animate the saw-tooth inventory-vs-time plot with stochastic demand; (iv) for LORA, input C_d/C_r/C_log/C_standby → compute n* and the 5-yr cumulative savings curve; (v) animate the break-even crossing on the cost-vs-failures plot. A second mode could visualize multi-echelon VARI-METRIC allocation across base/depot/warehouse.`,
    common_mistakes: `- Using demand based on historical consumption only (lagging indicator) instead of MTBF-driven demand (the reliability-engineering input) — under-stocks for new equipment, over-stocks for legacy.
- Setting safety stock by "weeks of supply" rule-of-thumb instead of Z·σ_LT — ignores lead time and service level.
- Using EOQ for low-volume critical (VED Vital) spares where the Poisson quantile (not the normal approximation) is required.
- Forgetting that LORA n* is a one-time decision that must be re-evaluated if MTBF drifts, costs change, or fleet size shrinks.
- Pooling LORA decisions across LRUs that have different failure rates — n* is per LRU, not aggregate.
- Ignoring the standby spare's own failure rate (the standby may degrade in storage — particularly batteries, elastomers).
- Treating LORA as a pure cost decision — ignoring the strategic, regulatory, or supplier-base considerations (e.g., sole-source risk for new units, ITAR/EAR restrictions on depot repair).`,
    limitations: `- EOQ assumes deterministic constant demand; for stochastic demand the (s,S) policy is the canonical extension (order up to S when inventory hits s).
- σ_d = √d (Poisson) assumes constant-λ fleet; for PM'd wear-out (Weibull β>1 with PM at T_p*) the demand is binomial within each PM interval — the std dev is smaller than Poisson, so safety stock is over-stated if the Poisson formula is used blindly.
- Single-echelon EOQ/SS ignores lateral supply and pipeline delay; multi-echelon VARI-METRIC (Sherbrooke) is required for distributed fleets.
- The LORA break-even n* assumes constant unit and logistics costs; for high-volume repair, learning-curve effects reduce C_r over time.
- The standby spare's reliability is assumed perfect; in practice, standby spares degrade (battery self-discharge, elastomer aging) — the standby MTBF may be lower than the operating MTBF.
- LORA ignores cannibalization (borrowing sub-modules from failed units) — significant for aerospace and military fleets.
- Multi-echelon VARI-METRIC is computationally intensive (matrix inversion at each echelon); approximations exist but may be optimistic for low-volume critical spares.`,
    comparison: `**EOQ vs (s,S) vs NEWSEVOR vs VARI-METRIC:**
- EOQ: deterministic constant demand; single-echelon; order quantity Q* = √(2DS/H); zero safety stock.
- (s,S) policy: stochastic demand; single-echelon; reorder at s (trigger), order up to S (target); safety stock built into s.
- NEWSEVOR (newsvendor): single-period demand (newspaper-boy problem); order quantity = μ + Z·σ for service level; for one-time spares (long-life capital equipment with no recurring demand).
- VARI-METRIC: stochastic demand; multi-echelon (base/depot/warehouse); optimizes safety stock allocation across echelons to maximize fleet availability at minimum capital.

**LORA discard vs repair:**
- Discard: A = n·C_d; zero capital; pays when n < n* = C_standby/(C_d-C_r-C_log).
- Repair: A = n·(C_r+C_log) + C_standby; capital investment; pays when n > n*; recurring savings (C_d-C_r-C_log) per failure.`,
    practical_application: `- **Oil & Gas (valve actuator spares)**: D = 40/yr, EOQ = 6, SS = 3, ROP = 7; LORA repair pays (n* = 10 < n = 40); $10,500/yr savings, 4-month payback.
- **Aerospace (engine LRU multi-echelon)**: VARI-METRIC allocates $4.2M capital across 4 bases + 1 depot; A_o = 99.4%; 67% stockout reduction vs single-echelon.
- **Mining (haul-truck hydraulic pump)**: D = 72/yr, EOQ = 6, SS = 5, ROP = 14; LORA repair pays (n* = 5.29 < n = 72); $103,400/yr savings.
- **Power (turbine governor)**: D = 8/yr (low-volume Vital spare); NEWSEVOR with Z=2.326 → 99% service; safety stock 6 units; LORA discard (n* = 12 > n = 8).
- **Manufacturing (consumable bearings)**: D = 500/yr, EOQ = 70, SS = 2 (Easy lead, low Z); spot-purchase on demand for non-Vital C-class.`,
    decision_scenario: `You are the CRE on a 30-unit mining haul-truck fleet. Hydraulic-pump MTBF = 2,500 h, t_op = 6,000 h/yr, unit cost $3,200, ordering cost $200, holding 25%/yr, lead time 45 days, service level 95%. (a) Compute D and EOQ. (b) Compute SS and ROP. (c) LORA: new $3,200, depot repair $1,400+$250 logistics, $8,200 capital; compute n* and recommend. (d) Compute 5-yr cumulative savings of the recommended policy. (e) If the maintenance team implements PM at T_p* (Lesson 1) that reduces failures to 24/yr, how does the LORA decision change? (f) What if a supplier offers a 10-yr supply guarantee at +$400/unit on the new price — does discard become preferred?`,
    practice_questions: `- **Q1 (Easy, Recall):** State the EOQ formula and the safety-stock formula.
- **Q2 (Medium, Calculation):** D=100/yr, S=$50, H=$15/unit/yr; compute EOQ and total inventory cost.
- **Q3 (Medium, Application):** MTBF=4,000 h, N=50, t_op=8,000 h; compute D.
- **Q4 (Hard, Analyze):** C_d=$3,200, C_r=$1,400, C_log=$250, C_standby=$8,200; compute n* and recommend repair or discard for n=72/yr.`,
    certification_questions: `- **CRE-style (Easy):** The Economic Order Quantity formula is (a) √(2DH/S) (b) √(2DS/H) (c) D·S/H (d) 2DS/H.
- **CRE-style (Medium, Calculation):** Annual demand 40 units, ordering $50, holding $150/unit/yr; EOQ ≈ (a) 4 (b) 6 (c) 10 (d) 40.
- **CRE-style (Hard, Analysis):** LORA break-even n* = 10 failures/yr. For n=40, recommend (a) discard (b) repair (c) indeterminate (d) cross-dock.`,
    summary: `Spare-parts logistics combines MTBF-driven demand (D = N·t_op/MTBF) with classical inventory theory: EOQ = √(2DS/H) sets the order quantity, safety stock SS = Z·σ_LT (with σ_LT = σ_d·√L and Poisson σ_d = √d) sets the buffer, and ROP = d·L + SS triggers the next order. Critical-spares classification (VED × ABC × HML) sets the service level Z per item. LORA per MIL-STD-1388 decides repair vs discard per LRU/SRU by the break-even failure count n* = C_standby/(C_d - C_r - C_log); above n*, repair pays. Multi-echelon VARI-METRIC (Sherbrooke) extends single-echelon models to distributed fleets. LSA documents each decision. The spares plan must integrate with the maintenance plan (T_p* from Lesson 1) — PM reduces failure demand and may shift the LORA decision from repair to discard.`,
    key_takeaways: `- Demand D = N·t_op/MTBF (constant-λ) or N·(t_op/T_p*)·F(T_p*) (PM'd wear-out).
- EOQ Q* = √(2DS/H) balances ordering vs holding; at optimum the two are equal.
- Safety stock SS = Z·σ_LT; σ_LT = σ_d·√L; Poisson σ_d = √d (constant-λ).
- ROP = d·L + SS; Min/Max = ROP / ROP+EOQ.
- Criticality (VED×ABC×HML) sets Z (90/95/99/99.9%) per item.
- LORA n* = C_standby/(C_d - C_r - C_log); above n*, repair pays; below, discard.
- Multi-echelon VARI-METRIC allocates safety stock across base/depot/warehouse for maximum availability at minimum capital.
- LSA (MIL-STD-1388) documents each LORA decision + spares + support + training + tech data.`,
    references: `- ASQ CRE Body of Knowledge — Maintenance & Logistics domain.
- MIL-STD-1388 — Logistics Support Analysis (LSA) and LORA framework.
- Jardine & Tsang (2017), Maintenance, Replacement, and Reliability, Ch. 4 (Inventory, EOQ, spares).
- Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 11 (multi-echelon context).
- Moubray (1997), RCM II (referenced for the PM-driven demand that sets spares consumption).
- SAE JA1011 (referenced for the failure-mode-level inputs to LSA).`,
  },
  knowledgeObject: {
    title: "Spare Parts Logistics & LORA",
    domain: "Maintenance & Logistics",
    competency: "Spare Parts Logistics & LORA",
    topic: "Spare-Parts Inventory and Level of Repair Analysis",
    concept: "EOQ, safety stock, reorder point, critical-spares classification, LORA break-even, multi-echelon VARI-METRIC",
    body: {
      definitions: [
        "Spare part: replaceable item held in inventory to restore a failed asset to service.",
        "EOQ (Economic Order Quantity): order quantity Q* = √(2DS/H) that minimizes total inventory cost (ordering + holding).",
        "Safety stock (SS): buffer inventory = Z·σ_LT to absorb lead-time demand variability for service level (1-α).",
        "Reorder point (ROP): inventory level triggering next order = d·L + SS.",
        "Min/Max policy: Min = ROP (trigger), Max = ROP + EOQ (fill-up).",
        "Lead time (L): time from order placement to receipt [days].",
        "Demand during lead time (DDL): expected demand while waiting = d·L.",
        "σ_d: daily-demand std dev; for Poisson constant-λ = √d.",
        "σ_LT = σ_d·√L: lead-time-demand std dev.",
        "VED classification: Vital / Essential / Desirable (criticality).",
        "ABC classification: A=high-value low-count, B=medium, C=low-value high-count.",
        "HML classification: Hard (long-lead), Medium, Low (short-lead).",
        "LORA (Level of Repair Analysis): repair-vs-discard decision per LRU/SRU.",
        "LRU (Line Replaceable Unit): swapped at the operational site (organizational level).",
        "SRU (Shop Replaceable Unit): sub-module swapped at intermediate or depot shop.",
        "LSA (Logistics Support Analysis): MIL-STD-1388 framework documenting LORA + spares + support + training + tech data per item.",
        "VARI-METRIC: multi-echelon inventory model (Sherbrooke) allocating safety stock across base/depot/warehouse.",
      ],
      principles: [
        "Demand is failure-driven: D = N·t_op/MTBF (constant-λ) or D = N·(t_op/T_p*)·F(T_p*) (PM'd wear-out).",
        "EOQ balances ordering cost (more orders) vs holding cost (more inventory); at Q* the two are equal.",
        "Safety stock SS = Z·σ_LT; σ_LT = σ_d·√L; Poisson σ_d = √d.",
        "ROP = d·L + SS; Min/Max = ROP / ROP+EOQ.",
        "Criticality (VED×ABC×HML) sets service level Z per item.",
        "LORA n* = C_standby/(C_d - C_r - C_log); above n*, repair pays; below, discard.",
        "Multi-echelon VARI-METRIC allocates safety stock across echelons for max availability at min capital.",
        "LSA (MIL-STD-1388) documents each LORA decision + spares + support + training + tech data per item.",
      ],
      components: [
        "D (annual demand) — MTBF-driven.",
        "EOQ Q* = √(2DS/H).",
        "S (ordering cost), H (holding cost per unit per year).",
        "σ_d, L, σ_LT = σ_d·√L.",
        "Z (service-level quantile), SS = Z·σ_LT.",
        "ROP = d·L + SS; Min, Max.",
        "C_d, C_r, C_log, C_standby — LORA inputs.",
        "n* = C_standby/(C_d-C_r-C_log) — LORA break-even.",
        "LSA record (MIL-STD-1388) — the documentation artifact.",
      ],
      mechanism: [
        "Spare-parts lifecycle: build spares master → compute MTBF-driven D → EOQ + SS + ROP → VED/ABC/HML classify → multi-echelon VARI-METRIC (if distributed) → LORA per LRU/SRU (n* decision) → LSA record per MIL-STD-1388 → integrate with maintenance plan (T_p* from Lesson 1) → verify A_o → annual re-baseline.",
      ],
      process: [
        "1. Build spares master: each LRU/SRU with C_d, L, MTBF, VED/ABC/HML.",
        "2. Compute D = N·t_op/MTBF (constant-λ) or D = N·(t_op/T_p*)·F(T_p*) (PM'd wear-out).",
        "3. Per item: EOQ = √(2DS/H), σ_LT = σ_d·√L, SS = Z·σ_LT, ROP = d·L + SS, Min/Max.",
        "4. VED×ABC×HML classify; set Z (90/95/99/99.9%) and echelon (single/multi).",
        "5. Multi-echelon: run VARI-METRIC to allocate SS across base/depot/warehouse.",
        "6. LORA per LRU/SRU: compute n* = C_standby/(C_d-C_r-C_log); compare to expected n.",
        "7. Document LSA record per MIL-STD-1388 (decision + spares + support + training + tech data).",
        "8. Integrate with maintenance plan; verify A_o = MTBF/(MTBF+MDT) including spares delay.",
        "9. Annual re-baseline: re-fit MTBF, recompute D, re-optimize Q*/SS/LORA.",
      ],
      formulas: [
        "D = N·t_op/MTBF (constant-λ) or D = N·(t_op/T_p*)·F(T_p*) (PM'd wear-out).",
        "EOQ: Q* = √(2DS/H); C_total = (D/Q*)·S + (Q*/2)·H = √(2DSH).",
        "σ_d = √d (Poisson, constant-λ); σ_LT = σ_d·√L.",
        "SS = Z_α·σ_LT; Z_90=1.282, Z_95=1.645, Z_99=2.326, Z_99.9=3.09.",
        "ROP = d·L + SS; Min = ROP, Max = ROP + EOQ.",
        "LORA break-even: n* = C_standby/(C_d - C_r - C_log); A_discard = n·C_d; A_repair = n·(C_r+C_log) + C_standby.",
        "VARI-METRIC: multi-echelon allocation (Sherbrooke) — pipeline delay + lateral supply.",
      ],
      metrics: [
        "D [units/yr] — annual demand (MTBF-driven).",
        "EOQ Q* [units] — optimal order quantity.",
        "SS [units] — safety stock.",
        "ROP [units] — reorder point; Min/Max inventory.",
        "Service level (1-α) [%] — probability of no stockout during lead time.",
        "n* [failures/yr] — LORA break-even.",
        "Annual savings ($) = A_discard - A_repair.",
        "A_o = MTBF/(MTBF+MDT) — operational availability including spares delay in MDT.",
      ],
      examples: [
        "Hydraulic valve actuator (Oil & Gas): D=40/yr, EOQ=6, SS=3, ROP=7; LORA n*=10 < n=40 → repair; $10,500/yr savings, 4-month payback.",
        "Mining haul-truck pump: D=72/yr, EOQ=6, SS=5, ROP=14; LORA n*=5.29 < n=72 → repair; $103,400/yr savings.",
        "Aerospace engine LRU multi-echelon: $4.2M capital across 4 bases + depot; A_o=99.4%; 67% stockout reduction vs single-echelon.",
        "Power turbine governor (low-volume Vital): NEWSEVOR with Z=2.326 → 99% service, SS=6 units; LORA discard (n*=12 > n=8).",
      ],
      industrial_examples: [
        "Oil & Gas — pipeline valve actuator fleet: EOQ=6, SS=3, LORA repair pays; $10,500/yr savings.",
        "Aerospace — regional jet engine LRUs: VARI-METRIC multi-echelon, $4.2M capital, A_o=99.4%.",
        "Mining — haul-truck hydraulic pump: D=72, EOQ=6, LORA repair; $103,400/yr savings.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Mining haul-truck fleet (30 units, MTBF=2,500h, t_op=6,000h/yr): D=72/yr, EOQ=6, SS=5, ROP=14, Min/Max=14/20; LORA n*=5.29 < n=72 → repair; annual savings $103,400; 5-yr cumulative $509,000; depot-level repair of SRUs. Method per Jardine & Tsang (2017, Ch. 4) and MIL-STD-1388.",
      ],
      common_errors: [
        "Using historical consumption for demand (lagging) instead of MTBF-driven D (reliability-driven).",
        "Setting safety stock by 'weeks of supply' rule instead of Z·σ_LT (ignores lead time and service level).",
        "Using EOQ for low-volume Vital spares where Poisson quantile (not normal approximation) is required.",
        "Forgetting LORA n* is a one-time decision that must be re-evaluated if MTBF drifts or costs change.",
        "Pooling LORA decisions across LRUs with different failure rates — n* is per LRU.",
        "Ignoring the standby spare's own reliability (battery self-discharge, elastomer aging).",
        "Treating LORA as pure cost — ignoring strategic, regulatory, supplier-base considerations.",
      ],
      limitations: [
        "EOQ assumes deterministic constant demand; for stochastic use (s,S) policy.",
        "σ_d = √d (Poisson) assumes constant-λ; PM'd wear-out gives binomial demand with smaller σ.",
        "Single-echelon EOQ/SS ignores lateral supply and pipeline delay; VARI-METRIC required for distributed fleets.",
        "LORA assumes constant C_d, C_r, C_log; learning-curve effects reduce C_r over time at high volume.",
        "Standby spare's reliability assumed perfect; in practice degrades in storage.",
        "LORA ignores cannibalization (significant for aerospace, military).",
        "Multi-echelon VARI-METRIC computationally intensive; approximations may be optimistic for low-volume critical spares.",
      ],
      best_practices: [
        "Compute D from MTBF + fleet + t_op — not from lagging historical consumption.",
        "Use Poisson exact quantile (not normal Z) for low-volume Vital spares (d·L < 5).",
        "Set Z by VED×ABC×HML classification — not by one-size-fits-all rule-of-thumb.",
        "For distributed fleets, use VARI-METRIC (Sherbrooke) — not independent single-echelon models per base.",
        "Re-evaluate LORA n* annually with updated MTBF and costs.",
        "Account for standby spare's own degradation (storage conditions, periodic verification).",
        "Document each LORA decision in an LSA record per MIL-STD-1388 — inputs, cost model, recommendation, assigned maintenance level.",
      ],
      related_concepts: [
        "Maintenance Strategies & RCM (Lesson 1) — T_p* and failure rate drive spare demand; PM reduces D and may shift LORA from repair to discard.",
        "Maintainability & Supportability (Lesson 3) — MDT includes the spares delay; BIT and LSA integrate the support system.",
        "ASQ CRE Reliability Modeling (RM) — FMEA and FTA identify the LRUs/SRUs that the LSA decomposes.",
        "ASQ CRE Probability & Statistics (PS) — Poisson, normal approximation, Z-quantiles.",
      ],
      prerequisites: [
        "ASQ CRE Reliability Fundamentals (RF) — MTBF, failure rate λ, Poisson failure counts.",
        "ASQ CRE Probability & Statistics (PS) — Poisson, normal approximation, Z-quantiles.",
        "ASQ CRE Maintenance Strategies & RCM (Lesson 1) — T_p* drives spares demand.",
        "Basic inventory accounting (ordering, holding, stockout cost trade-off).",
      ],
      references: [
        "ASQ CRE Body of Knowledge — Maintenance & Logistics domain.",
        "MIL-STD-1388 — LSA/LORA framework.",
        "Jardine & Tsang (2017), Maintenance, Replacement, and Reliability, Ch. 4 (EOQ, spares, LORA).",
        "Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 11 (multi-echelon context).",
        "Moubray (1997), RCM II (PM-driven demand inputs).",
        "SAE JA1011 (failure-mode-level inputs to LSA).",
      ],
    },
  },
  questions: [
    {
      competencyName: "Spare Parts Logistics & LORA",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "What does the Economic Order Quantity (EOQ) formula Q* = √(2DS/H) minimize?",
      whyCorrect:
        "The EOQ formula minimizes the sum of two opposing inventory costs: (i) the annual ordering cost (D/Q)·S — more orders (smaller Q) → more cost; (ii) the annual holding cost (Q/2)·H — more inventory (larger Q) → more cost. Taking the derivative of total cost C(Q) = (D/Q)·S + (Q/2)·H with respect to Q and setting to zero gives dC/dQ = -DS/Q² + H/2 = 0, solving for Q* = √(2DS/H). At the optimum, ordering cost equals holding cost (each = √(DSH/2)). EOQ does not directly minimize stockout cost — that is the role of safety stock SS = Z·σ_LT. Nor does it minimize unit purchase cost (assumed constant per unit) — quantity discounts are an extension to the basic EOQ model.",
      whyOthersWrong: [
        "Option A (Stockout cost only) — EOQ does not model stockout risk; the demand is assumed deterministic constant, so stockout is zero by construction in the basic model. Safety stock (separately) handles the stockout probability for stochastic demand.",
        "Option B (Unit purchase cost) — the unit purchase cost C_u is assumed constant per unit (no quantity discount); EOQ minimizes ordering + holding, not unit purchase. Quantity-discount EOQ is a separate extension.",
        "Option D (Lead time only) — EOQ does not depend on lead time L; lead time enters the reorder point ROP = d·L + SS, not the order quantity. The two are computed independently in the basic model.",
      ],
      explanation:
        "EOQ Q* = √(2DS/H) minimizes total inventory cost = ordering cost (D/Q)·S + holding cost (Q/2)·H. At optimum the two are equal (= √(DSH/2)). Stockout risk is handled by separate safety stock SS = Z·σ_LT.",
      options: [
        { text: "Stockout cost only", isCorrect: false },
        { text: "Unit purchase cost only", isCorrect: false },
        { text: "The sum of annual ordering cost and annual holding cost", isCorrect: true },
        { text: "Lead time only", isCorrect: false },
      ],
    },
    {
      competencyName: "Spare Parts Logistics & LORA",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Oil & Gas",
      stem: "A pipeline valve-actuator fleet: N=50, MTBF=10,000 h, t_op=8,000 h/yr, unit cost $500, ordering cost $50/order, holding 30%/yr, lead time 30 days, service level 95%. Compute the EOQ, safety stock (SS), and reorder point (ROP).",
      whyCorrect:
        "Step 1 — MTBF-driven demand: D = N·t_op/MTBF = 50·8000/10000 = 40 units/yr; d = 40/365 = 0.1096 units/day. Step 2 — EOQ: H = 0.30·500 = $150/unit/yr; Q* = √(2DS/H) = √(2·40·50/150) = √(26.67) = 5.16 → 6 units. Step 3 — Safety stock: σ_d = √d = √0.1096 = 0.331 units/day (Poisson); σ_LT = σ_d·√L = 0.331·√30 = 0.331·5.477 = 1.813 units; Z_95 = 1.645; SS = Z·σ_LT = 1.645·1.813 = 2.98 → 3 units. Step 4 — ROP: ROP = d·L + SS = 0.1096·30 + 3 = 3.29 + 3 = 6.29 → 7 units. So: EOQ = 6 units (rounded), SS = 3 units, ROP = 7 units.",
      whyOthersWrong: [
        "Option A (EOQ=2, SS=10, ROP=12) — these values reflect an error: EOQ=2 would result from inverting D and S (using D=50, S=40); SS=10 from using σ_d=D/365=0.1096 directly instead of √d=0.331 (missing the Poisson square-root); ROP then mis-computed.",
        "Option B (EOQ=6, SS=2, ROP=5) — EOQ is correct (6); SS=2 would result from using Z=1.282 (90%) instead of 1.645 (95%); ROP=5 from mis-applying d·L = 2 instead of 3.29 — both errors understate the safety buffer and reorder trigger.",
        "Option D (EOQ=10, SS=5, ROP=11) — EOQ=10 from inverting H (using H=15 instead of 150, i.e., holding rate 3% instead of 30%); SS=5 from using σ_d=D (40) instead of √d; ROP mis-summed.",
      ],
      explanation:
        "D = N·t_op/MTBF = 50·8000/10000 = 40/yr; d = 0.1096/day; EOQ = √(2·40·50/150) = 6 units; σ_d = √0.1096 = 0.331; σ_LT = 0.331·√30 = 1.81; SS = 1.645·1.81 = 3 units; ROP = 0.1096·30 + 3 = 7 units.",
      options: [
        { text: "EOQ = 2; SS = 10; ROP = 12", isCorrect: false },
        { text: "EOQ = 6; SS = 2; ROP = 5", isCorrect: false },
        { text: "EOQ = 6; SS = 3; ROP = 7", isCorrect: true },
        { text: "EOQ = 10; SS = 5; ROP = 11", isCorrect: false },
      ],
    },
    {
      competencyName: "Spare Parts Logistics & LORA",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Mining",
      stem: "LORA inputs for a hydraulic pump LRU: new-unit cost C_d = $3,200; depot repair cost C_r = $1,400 per event; logistics C_log = $250 per event; one-time capital for standby spare + tooling + training + tech data C_standby = $8,200. The fleet expects n = 72 failures/yr. Compute the break-even failure count n* and recommend repair or discard.",
      whyCorrect:
        "LORA break-even: n* = C_standby / (C_d - C_r - C_log) = $8,200 / ($3,200 - $1,400 - $250) = $8,200 / $1,550 = 5.29 failures/yr. The decision rule: if n > n*, repair pays (the per-failure savings C_d - C_r - C_log exceeds the per-failure share of the standby capital); if n < n*, discard pays. Here n = 72 >> n* = 5.29, so REPAIR is decisively preferred. Annual savings = n·(C_d - C_r - C_log) - C_standby = 72·$1,550 - $8,200 = $111,600 - $8,200 = $103,400/yr. The payback period on the C_standby capital is C_standby / annual_savings = $8,200/$103,400 = 0.079 yr ≈ 1 month.",
      whyOthersWrong: [
        "Option A (n* = 72; recommend discard) — confuses n with n*; n is the actual annual failures (72), n* is the break-even (5.29); since n > n*, repair is preferred, not discard.",
        "Option C (n* = 5.29; recommend discard) — correctly computes n* but applies the decision rule backwards: repair pays when n > n* (because per-failure savings C_d-C_r-C_log exceed the per-failure share of the standby capital). With n=72 >> 5.29, repair is decisively preferred.",
        "Option D (n* = 1.55; indeterminate) — n* = 1.55 results from inverting the ratio (C_d-C_r-C_log)/C_standby = $1,550/$8,200 = 0.189; the correct n* is its reciprocal $8,200/$1,550 = 5.29. And with n=72 well above either value, the decision is clearly repair, not indeterminate.",
      ],
      explanation:
        "n* = C_standby/(C_d - C_r - C_log) = $8,200/$1,550 = 5.29 failures/yr. Since n=72 >> n*=5.29, REPAIR pays. Annual savings = 72·$1,550 - $8,200 = $103,400/yr; payback ~1 month.",
      options: [
        { text: "n* = 72; recommend discard", isCorrect: false },
        { text: "n* = 5.29; recommend repair", isCorrect: true },
        { text: "n* = 5.29; recommend discard", isCorrect: false },
        { text: "n* = 1.55; indeterminate — needs additional cost data", isCorrect: false },
      ],
    },
    {
      competencyName: "Spare Parts Logistics & LORA",
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Aerospace",
      stem: "True or False: For a constant-failure-rate (exponential MTBF) fleet, the standard deviation of the daily spare-parts demand equals the square root of the mean daily demand (σ_d = √d), because the underlying failure process is Poisson.",
      whyCorrect:
        "TRUE. For a fleet of N units each operating at a constant failure rate λ (exponential MTBF), the total failure process over a time interval Δt is Poisson with mean μ = N·λ·Δt (the sum of independent Poisson processes is Poisson). The Poisson distribution has the property that the variance equals the mean (σ² = μ), so the standard deviation is σ = √μ. For daily demand, μ_d = N·λ·(1 day) = d (the mean daily demand); hence σ_d = √d. This is the foundational property that allows the safety-stock formula SS = Z·σ_LT = Z·σ_d·√L to be computed from the MTBF-driven demand d alone — no separate demand-variability data is required for the constant-λ fleet. For PM'd wear-out fleets (Weibull β>1 with PM at T_p*) the demand becomes binomial within each PM interval — the std dev is smaller than Poisson, so the Poisson-based σ_d = √d over-states the safety stock requirement (a conservative approximation).",
      whyOthersWrong: [
        "Option FALSE — would imply that the daily-demand std dev is unrelated to the mean for a constant-λ fleet; in fact, the Poisson property σ² = μ (variance equals mean) gives σ_d = √d exactly. This is the single most important reason MTBF-driven demand can be used directly to compute safety stock without separate variability data — the variability is determined by the mean (and the lead time) for Poisson processes.",
      ],
      explanation:
        "TRUE. For constant-λ fleet, failure process is Poisson; σ² = μ → σ_d = √d. This enables safety stock SS = Z·σ_LT = Z·σ_d·√L from MTBF-driven demand alone.",
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Maintainability & Supportability
// (Competency: "Maintainability & Supportability"; slug:
//  ml-maintainability-supportability)
// ---------------------------------------------------------------------------

const LESSON_MAINT: RefLesson = {
  competencyName: "Maintainability & Supportability",
  slug: "ml-maintainability-supportability",
  title: "Maintainability & Supportability",
  titleAr: "قابلية الصيانة وقابلية الدعم",
  order: 3,
  durationMin: 38,
  references: ML_REFERENCE_TITLES,
  conceptIntroduction: `Maintainability is the design characteristic of an asset that determines how easily, quickly, and safely it can be restored to service after a failure — measured by MTTR (mean time to repair), Mmax (maximum repair time at a percentile, typically 95%), and the maintainability function M(t) = 1 - exp(-t/MTTR). Supportability is the broader engineering characteristic of the *system* (asset + spares + tools + training + tech data + BIT) that determines whether the asset can actually be repaired in the field — measured by MDT (mean downtime, = MTTR + logistics + admin delay) and operational availability A_o = MTBF/(MTBF+MDT). Maintainability allocation distributes a system-level MTTR target across the LRUs (sub-assemblies) by failure-rate weighting and complexity. Maintainability prediction (per MIL-HDBK-472 methods) builds up MTTR from the elementary maintenance actions (access time, diagnostic time, repair time, verification time). Supportability analysis (per MIL-STD-1388 LSA) integrates the LORA decisions, spares plan, support equipment, training, technical data, and built-in-test (BIT) coverage into the integrated support system that determines MDT. BIT (Built-in Test) is the on-asset automatic detection/diagnosis capability that drives the diagnostic-time component of MTTR; its effectiveness is measured by detection coverage and false-alarm rate (which extend MTTR by sending technicians on wild-goose chases).`,
  example: `A manufacturing CNC machine has a system MTBF = 1,000 h (Σλ = 1×10⁻³/h) and a system MTTR target MTTR_sys_alloc = 2.0 h. Three LRUs: LRU1 (Power Supply), λ1 = 5×10⁻⁴/h (frequent, simple swap); LRU2 (Drive Controller), λ2 = 3×10⁻⁴/h (moderate, complex debug); LRU3 (Sensor Module), λ3 = 2×10⁻⁴/h (rare, calibration-intensive). Maintainability allocation by equal per-failure downtime contribution (λ_i·MTTR_i = constant): MTTR_i = MTTR_sys·(λ_avg/λ_i) where λ_avg = Σλ/3 = 3.333×10⁻⁴/h. Computed: MTTR1 = 2.0·(3.333e-4/5e-4) = 1.333 h; MTTR2 = 2.0·(3.333e-4/3e-4) = 2.222 h; MTTR3 = 2.0·(3.333e-4/2e-4) = 3.333 h. Verification: Σλ_i·MTTR_i = 5e-4·1.333 + 3e-4·2.222 + 2e-4·3.333 = 6.667e-4 + 6.667e-4 + 6.667e-4 = 2×10⁻³; MTTR_sys = 2×10⁻³/1×10⁻³ = 2.0 h ✓. Mmax_95 = -MTTR·ln(1-0.95) = 2.996·MTTR = 6.0 h (system). MDT = MTTR + LDT + ADT = 2.0 + 4.0 + 1.0 = 7.0 h (assuming 4 h logistics for spares, 1 h admin). A_inherent = 1000/(1000+2) = 99.80%; A_operational = 1000/(1000+7) = 99.30%.`,
  keyFormulas: `Maintainability function M(t) = 1 - exp(-t/MTTR) — exponential repair-time model (CDF of repair times)
MTTR_sys (failure-rate-weighted) = Σ(λ_i·MTTR_i)/Σλ_i
Mmax_p (p-th percentile repair time) = -MTTR·ln(1-p); e.g., Mmax_95 = 2.996·MTTR
MDT (Mean Down Time) = MTTR + LDT (logistics delay) + ADT (admin delay)
A_inherent = MTBF / (MTBF + MTTR)  — inherent availability (design)
A_operational = MTBF / (MTBF + MDT)  — operational availability (field)
Maintainability allocation (equal per-failure contribution): MTTR_i = MTTR_sys·(λ_avg / λ_i), where λ_avg = Σλ/n
Maintainability allocation (complexity-weighted, Greenman's): MTTR_i = MTTR_sys·(K_i/λ_i) / Σ(K_j/λ_j), where K_i is the complexity factor
Maintainability prediction (MIL-HDBK-472): MTTR = Σ(MTTR_action × n_action) / Σ n_action — sum over elementary maintenance actions
BIT detection coverage = (failures detected by BIT) / (total failures) — drives diagnostic-time component of MTTR
BIT false-alarm rate = (false alarms) / (total BIT indications) — extends MTTR via wild-goose-chase time
LSA (per MIL-STD-1388): integrated support-system analysis — LORA + spares + support equipment + training + tech data + BIT coverage → MDT.`,
  exercise: `You are the CRE on a 4-subsystem manufacturing cell (CNC machine + robot + conveyor + vision). System MTBF target = 800 h; system MTTR target = 1.5 h; A_o target ≥ 98%. Subsystem failure rates (per h): CNC 5×10⁻⁴, Robot 3×10⁻⁴, Conveyor 2×10⁻⁴, Vision 1×10⁻⁴. (a) Compute Σλ and verify the MTBF target. (b) Allocate MTTR to each subsystem by equal per-failure contribution. (c) Compute Mmax_95 for the system. (d) Compute A_o assuming LDT = 6 h, ADT = 1 h. (e) If A_o falls below target, propose two design changes to bring it back (improve MTTR via BIT, reduce LDT via spares). (f) Compute the MTBF sensitivity: how much must MTBF improve to reach A_o = 99% at the same MDT?`,
  sections: {
    learning_objectives: `- Distinguish maintainability (asset-level design characteristic) from supportability (system-level engineering characteristic).
- Define and compute MTTR, Mmax_p (95th-percentile), and the maintainability function M(t) = 1 - exp(-t/MTTR).
- Compute the system MTTR by failure-rate weighting: MTTR_sys = Σ(λ_i·MTTR_i)/Σλ_i.
- Perform maintainability allocation: distribute a system MTTR target across LRUs by failure-rate weighting and complexity (Greenman's method).
- Apply maintainability prediction (MIL-HDBK-472): build up MTTR from elementary maintenance actions (access, diagnostic, repair, verification).
- Compute MDT = MTTR + LDT + ADT and the two availability metrics A_inherent = MTBF/(MTBF+MTTR), A_operational = MTBF/(MTBF+MDT).
- Evaluate BIT effectiveness: detection coverage and false-alarm rate; their effect on diagnostic time and MTTR.
- Integrate supportability analysis (MIL-STD-1388 LSA): LORA + spares + support equipment + training + tech data + BIT → the integrated support system that determines MDT.`,
    prerequisites: `- ASQ CRE Reliability Fundamentals (RF) — MTBF, MTTR, availability A = MTBF/(MTBF+MTTR).
- ASQ CRE Probability & Statistics (PS) — the exponential distribution, the CDF, percentiles via inverse-CDF.
- ASQ CRE Maintenance Strategies & RCM (Lesson 1) — MTTR is the planned/failure replacement cost input; PM and CBM reduce MTTR via earlier detection.
- ASQ CRE Spare Parts Logistics & LORA (Lesson 2) — spares + LORA drive the logistics delay component LDT of MDT.`,
    introduction: `Maintainability and supportability are two distinct but coupled engineering disciplines. Maintainability is an asset-level *design* characteristic — the asset's built-in ease of repair, measured by MTTR (mean time to repair), Mmax (max repair time at a percentile), and the maintainability function M(t) (the probability that a repair is complete by time t). Supportability is a system-level *engineering* characteristic — whether the integrated support system (spares + tools + training + tech data + BIT + maintenance organization) can actually deliver the asset's design MTTR in the field, measured by MDT (mean downtime) and operational availability A_o = MTBF/(MTBF+MDT).

The three maintainability metrics — MTTR, Mmax, MDT — answer three different questions:
- MTTR: "How long does the *repair* take, averaged over failures?" (design + skill + access + diagnostics).
- Mmax: "What's the *worst-case* repair time we should plan for?" (e.g., the 95th percentile — the time by which 95% of failures are repaired).
- MDT: "How long is the asset actually *down* per failure?" (MTTR + logistics + admin — the operational reality).

Maintainability allocation is the engineering decision: given a system MTTR target (e.g., MTTR_sys = 2.0 h), distribute the budget across the LRUs. The simplest allocation is equal-MTTR (every LRU gets MTTR_sys) — but this is rarely realistic (a complex debug controller needs more time than a simple power-supply swap). The failure-rate-weighted allocation (Greenman's method): MTTR_i = MTTR_sys·(K_i/λ_i)/Σ(K_j/λ_j), where K_i is a complexity factor and λ_i is the LRU's failure rate. This satisfies the failure-rate-weighted system constraint: MTTR_sys = Σ(λ_i·MTTR_i)/Σλ_i = the design target.

Maintainability prediction (MIL-HDBK-472) builds up MTTR from elementary maintenance actions: access time (open enclosure, reach the LRU), diagnostic time (find the failed sub-module), repair time (swap the LRU or repair the sub-module), verification time (close up, test, return to service). The prediction sums MTTR = Σ(MTTR_action × n_action)/Σ n_action over the elementary actions, weighted by their frequency.

Supportability analysis (LSA, MIL-STD-1388) integrates the LORA decisions (Lesson 2), the spares plan (Lesson 2), the support equipment (tools, test gear), the training plan, the technical data (manuals, troubleshooting trees), and the BIT coverage (Lesson 3) into a single integrated support system that determines MDT. BIT (Built-in Test) is the on-asset automatic detection/diagnosis capability — it drives the diagnostic-time component of MTTR. BIT effectiveness is measured by detection coverage (fraction of failures automatically detected) and false-alarm rate (fraction of BIT indications that are spurious — sending technicians on wild-goose chases that extend MTTR).`,
    terminology: `- **Maintainability**: design characteristic of an asset — ease of repair; quantified by MTTR, Mmax, M(t).
- **Supportability**: system-level engineering characteristic — whether the integrated support system can deliver the design MTTR in the field; quantified by MDT, A_o.
- **MTTR (Mean Time To Repair)**: average repair time across failures [h].
- **Mmax (Maximum repair time at percentile p)**: e.g., Mmax_95 = repair time by which 95% of failures are fixed; Mmax_95 = -MTTR·ln(1-0.95) = 2.996·MTTR.
- **M(t) (Maintainability function)**: probability that a repair is complete by time t; M(t) = 1 - exp(-t/MTTR) for exponential repair times.
- **MDT (Mean Down Time)**: MTTR + LDT + ADT — the operational downtime per failure.
- **LDT (Logistics Delay Time)**: time waiting for spares, tools, transport.
- **ADT (Administrative Delay Time)**: time waiting for scheduling, permits, technician dispatch.
- **A_inherent (inherent availability)**: MTBF/(MTBF+MTTR) — design availability (no logistics/admin).
- **A_o (operational availability)**: MTBF/(MTBF+MDT) — field availability (with real downtime).
- **Maintainability allocation**: distribute system MTTR target across LRUs by failure-rate weighting + complexity.
- **Maintainability prediction (MIL-HDBK-472)**: build up MTTR from elementary maintenance actions (access, diagnostic, repair, verify).
- **BIT (Built-in Test)**: on-asset automatic detection/diagnosis; drives diagnostic-time component of MTTR.
- **BIT detection coverage**: fraction of failures automatically detected.
- **BIT false-alarm rate**: fraction of BIT indications that are spurious.
- **LSA (Logistics Support Analysis)**: MIL-STD-1388 framework integrating LORA + spares + support + training + tech data + BIT into MDT.
- **LORA**: repair-vs-discard per LRU/SRU (Lesson 2) — feeds supportability via the maintenance level assigned.`,
    detailed_explanation: `Maintainability is a design characteristic, quantified by the maintainability function M(t) = 1 - exp(-t/MTTR) (the CDF of repair times under the exponential repair-time model). At t = MTTR, M(MTTR) = 1 - exp(-1) = 0.632 — 63.2% of repairs are complete by MTTR (analogous to the "63.2% survive to MTBF" rule for reliability). At t = Mmax_95 = -MTTR·ln(1-0.95) = 2.996·MTTR, M(Mmax_95) = 0.95 — 95% of repairs are complete by Mmax_95. For MTTR = 2.0 h, Mmax_95 = 6.0 h. The exponential model is the simplest (constant repair rate); lognormal repair-time distributions are also common (MIL-HDBK-472 Method 5A).

The system MTTR is the failure-rate-weighted average of the LRU MTTRs: MTTR_sys = Σ(λ_i·MTTR_i)/Σλ_i. This reflects the operational reality: failures of high-λ (frequent) LRUs dominate the system downtime. If LRU1 fails 5× as often as LRU2, the system MTTR is 5× more sensitive to MTTR1 than to MTTR2.

Maintainability allocation distributes a system MTTR target across the LRUs. Greenman's method: MTTR_i = MTTR_sys·(K_i/λ_i)/Σ(K_j/λ_j), where K_i is a complexity factor (engineering judgment — number of sub-modules, accessibility, debug difficulty). The simpler equal-per-failure-contribution allocation (a special case with K_i = constant) gives MTTR_i = MTTR_sys·(λ_avg/λ_i), where λ_avg = Σλ/n. This satisfies the constraint Σ(λ_i·MTTR_i)/Σλ_i = MTTR_sys by construction. The allocation trades off: high-λ (frequent failure) LRUs get tighter MTTR (less time, because they dominate the system average); low-λ (rare but complex) LRUs get more MTTR budget (more time, because they contribute little to the system average).

Maintainability prediction (MIL-HDBK-472) builds MTTR from elementary maintenance actions: MTTR = Σ(MTTR_action × n_action)/Σ n_action, where each action (access, isolate, disassemble, replace, reassemble, align, verify) has a time estimate from time-and-motion studies. The prediction is more accurate than allocation but requires detailed maintenance task analysis (MTA) per failure mode — labor-intensive but the canonical method for new equipment when field data is unavailable.

Supportability analysis (LSA per MIL-STD-1388) is the integrative engineering activity: it pulls together the LORA decisions (Lesson 2), the spares plan (Lesson 2), the support equipment (test gear, tools), the training plan (technician skill levels, course hours), the technical data (operating manuals, troubleshooting trees, illustrated parts breakdowns), and the BIT coverage (detection rate, false-alarm rate) into a single integrated support system. The output is the MDT estimate (MTTR + LDT + ADT) and the operational availability A_o = MTBF/(MTBF+MDT).

BIT (Built-in Test) is the on-asset automatic detection/diagnosis capability. Detection coverage = (failures detected by BIT)/(total failures) — drives the diagnostic-time component of MTTR (high coverage → short diagnostic time → low MTTR). False-alarm rate = (false BIT indications)/(total BIT indications) — extends MTTR by sending technicians on wild-goose chases (the unit was fine; the BIT mis-diagnosed). The canonical design goal: detection coverage ≥ 95%, false-alarm rate ≤ 5% (the "95/5" rule of thumb). The BIT effectiveness trades off with complexity: more BIT sensors → higher coverage but higher false-alarm rate (the more you look, the more false positives you get). The cost-optimal BIT design balances the cost of additional BIT (more sensors, more software) against the avoided MTTR cost.`,
    core_principles: `- Maintainability is design (asset-level); supportability is engineering (system-level).
- M(t) = 1 - exp(-t/MTTR) (exponential); M(MTTR) = 0.632; M(Mmax_95) = 0.95 where Mmax_95 = 2.996·MTTR.
- MTTR_sys = Σ(λ_i·MTTR_i)/Σλ_i — failure-rate-weighted average.
- Allocation: distribute MTTR_sys across LRUs; high-λ gets tighter, low-λ gets more (Greenman's: K_i/λ_i).
- Prediction (MIL-HDBK-472): MTTR = Σ(MTTR_action × n_action)/Σ n_action from elementary maintenance actions.
- MDT = MTTR + LDT + ADT; A_inherent = MTBF/(MTBF+MTTR); A_o = MTBF/(MTBF+MDT).
- BIT drives MTTR: high coverage → low diagnostic time; high false-alarm rate → extended MTTR.
- LSA (MIL-STD-1388) integrates LORA + spares + support + training + tech data + BIT → MDT.
- The 95/5 BIT rule (95% detection, ≤5% false alarms) is the canonical design goal.`,
    components: `- **MTTR (mean time to repair)**: average repair time [h].
- **Mmax_p (max repair time at percentile p)**: e.g., Mmax_95 = 2.996·MTTR.
- **M(t) (maintainability function)**: probability repair complete by t.
- **λ_i (LRU failure rate)**: the failure-rate weighting in MTTR_sys.
- **K_i (complexity factor)**: Greenman's allocation input.
- **MTTR_action × n_action**: elementary maintenance action time × frequency (prediction).
- **LDT (logistics delay time), ADT (admin delay time)**: MDT components beyond MTTR.
- **A_inherent, A_o**: design vs operational availability.
- **BIT detection coverage, false-alarm rate**: BIT effectiveness metrics.
- **LSA record (MIL-STD-1388)**: the integrative support-system artifact.`,
    process: `1. Build the asset reliability model: LRUs with λ_i, MTBF_sys = 1/Σλ.
2. Set system MTTR target (from customer requirement or competitive benchmark).
3. Allocate MTTR across LRUs: Greenman's MTTR_i = MTTR_sys·(K_i/λ_i)/Σ(K_j/λ_j).
4. Verify allocation: compute MTTR_sys = Σ(λ_i·MTTR_i)/Σλ_i — must equal target.
5. Maintainability prediction (MIL-HDBK-472): for each LRU, decompose repair into elementary actions (access, isolate, disassemble, replace, reassemble, align, verify); sum MTTR_action × n_action / Σ n_action.
6. Compute Mmax_p = -MTTR·ln(1-p) for p=95% (and 90%, 99% as needed).
7. Compute MDT = MTTR + LDT (spares delay, Lesson 2) + ADT (admin delay).
8. Compute A_inherent = MTBF/(MTBF+MTTR) and A_o = MTBF/(MTBF+MDT); verify against target.
9. Design BIT: detection coverage (target ≥ 95%) and false-alarm rate (target ≤ 5%); trade off complexity vs MTTR reduction.
10. Integrate LSA per MIL-STD-1388: LORA + spares + support + training + tech data + BIT → MDT.
11. Re-baseline annually from field MTTR data — re-predict, re-allocate, re-verify A_o.`,
    formula_calculation: `Variables and formulas:
- t: time since start of repair [h].
- MTTR: mean time to repair [h] (constant repair rate, exponential model).
- M(t) = 1 - exp(-t/MTTR): maintainability function [dimensionless 0..1].
- M(MTTR) = 1 - exp(-1) = 0.632; M(Mmax_95) = 0.95 where Mmax_95 = -MTTR·ln(0.05) = 2.996·MTTR.
- λ_i: failure rate of LRU i [1/h]; Σλ: system failure rate [1/h].
- MTBF_sys = 1/Σλ: system mean time between failures [h].
- MTTR_sys = Σ(λ_i·MTTR_i)/Σλ_i: system MTTR (failure-rate-weighted) [h].

Maintainability allocation (Greenman's method):
- K_i: complexity factor for LRU i (engineering judgment — sub-module count, accessibility, debug difficulty).
- MTTR_i = MTTR_sys · (K_i/λ_i) / Σ(K_j/λ_j): allocated MTTR for LRU i [h].
- Special case (K_i = constant = equal contribution): MTTR_i = MTTR_sys · (λ_avg / λ_i), λ_avg = Σλ/n.

Maintainability prediction (MIL-HDBK-472):
- MTTR_action: time for elementary maintenance action (access, isolate, disassemble, replace, reassemble, align, verify) [h].
- n_action: frequency of the action across the failure modes of the LRU [count per failure].
- MTTR = Σ(MTTR_action × n_action) / Σ n_action: predicted MTTR [h].

Mean Down Time and availability:
- LDT: logistics delay time [h] (waiting for spares, tools, transport — driven by Lesson 2 inventory policy).
- ADT: administrative delay time [h] (scheduling, permits, technician dispatch).
- MDT = MTTR + LDT + ADT [h].
- A_inherent = MTBF/(MTBF+MTTR): inherent availability (design) [dimensionless 0..1].
- A_o = MTBF/(MTBF+MDT): operational availability (field) [dimensionless 0..1].

BIT effectiveness:
- Detection coverage = (failures detected by BIT)/(total failures) [dimensionless 0..1].
- False-alarm rate = (false BIT indications)/(total BIT indications) [dimensionless 0..1].
- Diagnostic time = MTTR_diagnostic ≈ (1 - coverage)·MTTR_manual_isolation + (false_alarm_rate)·MTTR_wild_goose_chase.

Units: time in hours (h); failure rate in 1/h; availability and BIT metrics dimensionless [0..1].

Assumptions: (i) exponential repair-time distribution (constant repair rate); (ii) LRU repair times independent; (iii) logistics and admin delays are deterministic (constant LDT, ADT — in practice stochastic); (iv) BIT false alarms extend MTTR linearly (one wild-goose chase per false alarm).

Interpretation: MTTR is the design maintainability metric; Mmax_95 is the planning metric (the time by which the customer can expect 95% of repairs complete); MDT is the operational metric (the actual downtime per failure in the field). A_o is the bottom-line operational availability that the customer experiences; A_inherent is the upper bound (no logistics/admin delays). BIT coverage drives MTTR down (faster diagnosis); BIT false alarms push MTTR up (wasted technician time).`,
    worked_example: `**MTTR allocation + Mmax + MDT + availability — CNC machine (Manufacturing).**

Given: System MTBF_sys target = 1,000 h (Σλ = 1×10⁻³/h); system MTTR_sys_alloc = 2.0 h. Three LRUs:
- LRU1 (Power Supply): λ1 = 5×10⁻⁴/h (frequent failures, simple swap).
- LRU2 (Drive Controller): λ2 = 3×10⁻⁴/h (moderate failures, complex debug).
- LRU3 (Sensor Module): λ3 = 2×10⁻⁴/h (rare failures, calibration-intensive).
Sum: Σλ = 1×10⁻³/h; MTBF = 1/Σλ = 1,000 h ✓.

Step 1 — Allocate MTTR by equal per-failure contribution (special case K_i = constant):
λ_avg = Σλ/n = 1×10⁻³/3 = 3.333×10⁻⁴/h.
MTTR1 = MTTR_sys·(λ_avg/λ1) = 2.0·(3.333e-4/5e-4) = 2.0·0.6667 = 1.333 h.
MTTR2 = MTTR_sys·(λ_avg/λ2) = 2.0·(3.333e-4/3e-4) = 2.0·1.1111 = 2.222 h.
MTTR3 = MTTR_sys·(λ_avg/λ3) = 2.0·(3.333e-4/2e-4) = 2.0·1.6667 = 3.333 h.

Step 2 — Verify (failure-rate-weighted check):
Σ(λ_i·MTTR_i) = 5e-4·1.333 + 3e-4·2.222 + 2e-4·3.333
              = 6.667×10⁻⁴ + 6.667×10⁻⁴ + 6.667×10⁻⁴
              = 2.0×10⁻³.
MTTR_sys = Σ(λ_i·MTTR_i)/Σλ_i = 2.0×10⁻³ / 1.0×10⁻³ = 2.0 h ✓ (matches target).

Step 3 — Mmax_95 (system, exponential model):
Mmax_95 = -MTTR·ln(1-0.95) = -2.0·ln(0.05) = 2.0·2.996 = 5.99 ≈ 6.0 h.
(Interpretation: 95% of system failures are repaired within 6 h.)

Step 4 — MDT (assume LDT = 4 h spares delivery, ADT = 1 h scheduling):
MDT = MTTR + LDT + ADT = 2.0 + 4.0 + 1.0 = 7.0 h.

Step 5 — Availability:
A_inherent = MTBF/(MTBF+MTTR) = 1000/(1000+2) = 1000/1002 = 0.99800 = 99.80%.
A_operational = MTBF/(MTBF+MDT) = 1000/(1000+7) = 1000/1007 = 0.99305 = 99.30%.

Step 6 — Sensitivity: what MTBF would be required to achieve A_o = 99.50% at the same MDT?
A_o = MTBF/(MTBF+7) = 0.9950 → MTBF = 0.9950·(MTBF+7) → MTBF·(1-0.9950) = 0.9950·7 → MTBF = 0.9950·7/0.0050 = 1,393 h.
So MTBF must improve from 1,000 h to 1,393 h (+39%) to hit A_o = 99.50% at MDT = 7 h — alternatively, MDT must fall from 7 h to 5 h (via spares LDT reduction from 4 h to 2 h, e.g., on-site spares), which keeps MTBF = 1,000 h.

Method per Ebeling (2010, Ch. 11 — maintainability allocation and Mmax) and MIL-STD-1388 (LSA integrating LORA + spares + BIT into MDT).`,
    industrial_example: `**Manufacturing — CNC machine MTTR allocation.** A machine-tool OEM allocated MTTR_sys = 2.0 h to 3 LRUs (power supply, drive controller, sensor module) using Greenman's equal-contribution method (MTTR1=1.33 h, MTTR2=2.22 h, MTTR3=3.33 h). Predicted Mmax_95 = 6.0 h. With LDT = 4 h (off-site spares) and ADT = 1 h, MDT = 7.0 h, A_o = 99.30%. To meet A_o ≥ 99.50%, the OEM chose to reduce LDT by stocking critical spares on-site (LDT: 4 h → 1 h, MDT: 7 h → 4 h), achieving A_o = 99.60%. Method per Ebeling (2010, Ch. 11) and MIL-STD-1388.

**Aerospace — engine LRU BIT and supportability.** A turbofan engine OEM integrated BIT into the FADEC (Full Authority Digital Engine Controller) with detection coverage 95% and false-alarm rate 3%. The BIT reduced the diagnostic component of MTTR from 0.6 h (manual isolation) to 0.15 h (auto-isolation), a 75% reduction. Combined with the LSA-spares plan (Lesson 2 multi-echelon), MDT dropped from 8 h (pre-BIT) to 4 h (post-BIT); A_o rose from 98.5% to 99.4%. Method per MIL-STD-1388 (LSA) and Ebeling (2010, Ch. 11).`,
    case_study: `CASE_TYPE = SYNTHETIC. A medical-device manufacturer fielded a CT scanner with a system MTBF = 2,000 h and a customer contractual A_o ≥ 99%. Initial design allocated MTTR_sys = 4.0 h (with manual diagnosis), LDT = 8 h (off-site depot), ADT = 2 h → MDT = 14 h, A_o = 2000/2014 = 99.30% (meets 99% but customer wants 99.30% margin → target 99.40%). The maintainability engineer proposed two design changes: (a) BIT in the X-ray controller with coverage 96%, false-alarm 4% → diagnostic MTTR reduction from 1.0 h to 0.25 h; total MTTR_sys = 3.25 h (19% reduction). (b) On-site critical spares for the 5 highest-λ LRUs → LDT = 8 h → 2 h. New MDT = 3.25 + 2 + 2 = 7.25 h; A_o = 2000/2007.25 = 99.64% — exceeds 99.40% target with 0.24 pp margin. The supportability analysis (LSA per MIL-STD-1388) documented the BIT design, the on-site spares plan, the support equipment (one test cart per site), the training (8 h technician course), and the tech data (illustrated troubleshooting tree). Annual cost of the changes: $420,000 (BIT development + on-site spares + training). Annual benefit: 8 avoided contractual penalty events at $50K each = $400,000/yr + A_o margin → near-breakeven in year 1. Source: synthetic case authored for this lesson; method per Ebeling (2010, Ch. 11) and MIL-STD-1388.`,
    visual_explanation: `The maintainability function M(t) = 1 - exp(-t/MTTR) is the rising-exponential mirror of the reliability R(t) = exp(-t/MTBF) — same form, opposite direction. M(t) rises from 0 to 1; at t = MTTR, M = 0.632 (63.2% complete); at t = Mmax_95 = 2.996·MTTR, M = 0.95. The MTTR allocation bar chart shows the LRU MTTRs distributed by failure-rate-inverse weighting — high-λ (frequent) LRUs get tight MTTR (short bars), low-λ (rare) get more (tall bars). The availability triangle: A_inherent (no logistics) at the apex, A_o (with real MDT) at the base — the gap is the support-system inefficiency. The BIT effectiveness matrix: detection coverage on one axis (high good), false-alarm rate on the other (low good); the 95/5 corner is the design target.`,
    simulation_opportunity: `An interactive simulation could let the learner (i) input the LRU count, failure rates, and target MTTR_sys; (ii) perform Greenman's allocation and visualize the bar chart; (iii) verify by recomputing MTTR_sys; (iv) compute Mmax_p with a slider for p (90/95/99/99.9%); (v) input LDT and ADT to compute MDT and A_o; (vi) simulate a BIT upgrade (coverage +, false-alarm -) and watch MTTR_diagnostic and MDT shrink, A_o rise; (vii) run a Monte-Carlo on the exponential repair-time distribution to visualize the M(t) curve and verify M(MTTR) = 0.632.`,
    common_mistakes: `- Confusing MTTR with MDT — MTTR is the *repair* time only; MDT = MTTR + logistics + admin (operational reality).
- Reporting A_inherent (MTBF/(MTBF+MTTR)) as the field availability — A_operational (MTBF/(MTBF+MDT)) is what the customer experiences.
- Allocating MTTR equally across LRUs (every LRU gets MTTR_sys) — ignores failure-rate weighting; the high-λ LRU dominates the system average.
- Setting Mmax = MTTR — Mmax_95 is 3× MTTR for exponential; using MTTR understates the planning time.
- Ignoring BIT false-alarm rate — high coverage with high false-alarm pushes MTTR up (wild-goose-chase time).
- Treating maintainability as an after-the-fact measurement rather than a design allocation (the asset must be designed to meet the MTTR target; you cannot test your way to it).
- Forgetting that LDT is a function of the spares plan (Lesson 2) — improving spares (lower LDT) is often more cost-effective than improving MTTR.`,
    limitations: `- Exponential repair-time distribution (constant repair rate) is the simplest model; lognormal (MIL-HDBK-472 Method 5A) is more realistic but requires more parameters.
- LDT and ADT are stochastic in practice; using deterministic averages can understate MDT variability.
- Greenman's allocation uses engineering-judgment K_i — subjective; sensitivity analysis needed.
- MIL-HDBK-472 prediction assumes the elementary action times are well-known; in practice they are estimated from time-and-motion studies on similar equipment.
- BIT false-alarm rate is hard to estimate pre-fielding; field data is needed to validate the design assumption.
- The 95/5 BIT rule is a heuristic; high-consequence systems (aerospace, nuclear) may require 99/1 or stricter.
- LSA is labor-intensive (typically 2-3 person-years per major system); cost-benefit must be justified by the system's criticality and fielding size.`,
    comparison: `**MTTR vs Mmax vs MDT vs A_o:**
- MTTR: average repair time (design metric).
- Mmax_95: 95th-percentile repair time (planning metric) = 2.996·MTTR (exponential).
- MDT: operational downtime per failure = MTTR + LDT + ADT (field metric).
- A_inherent = MTBF/(MTBF+MTTR): design availability (no logistics).
- A_o = MTBF/(MTBF+MDT): operational availability (field, includes logistics + admin).

**Maintainability vs Supportability:**
- Maintainability: asset-level design characteristic — MTTR, Mmax, M(t). The asset's built-in ease of repair.
- Supportability: system-level engineering characteristic — MDT, A_o, LSA. The integrated support system's ability to deliver the design MTTR in the field.
- BIT bridges the two: it improves maintainability (lower MTTR_diagnostic) and supportability (lower MDT).

**Allocation vs Prediction:**
- Allocation: distribute the system MTTR target across LRUs (Greenman's) — design-down from a top-level requirement.
- Prediction: build up MTTR from elementary actions (MIL-HDBK-472) — design-up from detailed task analysis.
- In practice, allocation is done first (top-down design); prediction is done to verify (bottom-up check).`,
    practical_application: `- **Manufacturing (CNC machine MTTR allocation)**: Greenman's; MTTR1=1.33 h, MTTR2=2.22 h, MTTR3=3.33 h; Mmax_95=6 h; on-site spares reduce LDT 4→1 h; A_o = 99.30% → 99.60%.
- **Aerospace (turbofan engine BIT)**: BIT coverage 95%, false-alarm 3% → MTTR_diagnostic 0.6→0.15 h (75% reduction); MDT 8→4 h; A_o 98.5% → 99.4%.
- **Medical (CT scanner supportability)**: BIT 96/4 + on-site spares; MTTR_sys 4.0→3.25 h; LDT 8→2 h; MDT 14→7.25 h; A_o 99.30% → 99.64% (meets 99.40% target with margin).
- **Power (turbine-governor Mmax)**: Mmax_95 = 2.996·MTTR = 2.996·4 = 12 h; planning metric for the 95th-percentile repair.
- **Oil & Gas (compressor LSA)**: integrated LSA per MIL-STD-1388 documents LORA + spares + support + training + tech data → MDT = 6 h, A_o = 98.8%.`,
    decision_scenario: `You are the CRE on a 4-subsystem manufacturing cell (CNC + robot + conveyor + vision). MTBF target = 800 h, MTTR target = 1.5 h, A_o ≥ 98%. Failure rates (per h): CNC 5×10⁻⁴, Robot 3×10⁻⁴, Conveyor 2×10⁻⁴, Vision 1×10⁻⁴. (a) Compute Σλ; verify MTBF. (b) Allocate MTTR by equal per-failure contribution. (c) Compute Mmax_95 for the system. (d) Compute A_o with LDT = 6 h, ADT = 1 h. (e) If A_o < 98%, propose two design changes (improve MTTR via BIT, reduce LDT via on-site spares) and quantify the A_o improvement. (f) Compute the MTBF sensitivity: how much must MTBF improve to hit A_o = 99% at the same MDT?`,
    practice_questions: `- **Q1 (Easy, Recall):** Distinguish MTTR from MDT; state the relationship.
- **Q2 (Medium, Calculation):** A 3-LRU system with λ = [5e-4, 3e-4, 2e-4]/h, MTTR_sys_alloc = 2.0 h. Allocate MTTR by equal per-failure contribution.
- **Q3 (Medium, Application):** MTBF = 1000 h, MTTR = 2 h, LDT = 4 h, ADT = 1 h. Compute A_inherent and A_o.
- **Q4 (Hard, Analyze):** BIT coverage 95%, false-alarm 5%. Explain why high coverage alone is not enough — the false-alarm rate matters too.`,
    certification_questions: `- **CRE-style (Easy):** A_inherent = MTBF/(MTBF+MTTR). A_o = (a) MTBF/(MTBF+MTTR) (b) MTBF/(MTBF+Mmax) (c) MTBF/(MTBF+MDT) (d) 1 - MTTR/MTBF.
- **CRE-style (Medium, Calculation):** MTTR_sys = 2.0 h (exponential repair). Mmax_95 ≈ (a) 2.0 h (b) 4.0 h (c) 6.0 h (d) 8.0 h.
- **CRE-style (Hard, Analysis):** BIT coverage 98%, false-alarm 5%. Does this satisfy the canonical 95/5 design goal? Justify.`,
    summary: `Maintainability is the asset-level design characteristic (MTTR, Mmax, M(t) = 1 - exp(-t/MTTR)); supportability is the system-level engineering characteristic (MDT, A_o). MTTR_sys = Σ(λ_i·MTTR_i)/Σλ_i (failure-rate-weighted). Allocation (Greenman's): MTTR_i = MTTR_sys·(K_i/λ_i)/Σ(K_j/λ_j). Prediction (MIL-HDBK-472): MTTR from elementary maintenance actions. Mmax_95 = 2.996·MTTR. MDT = MTTR + LDT + ADT. A_inherent = MTBF/(MTBF+MTTR) (design); A_o = MTBF/(MTBF+MDT) (field). BIT bridges maintainability and supportability — high coverage (≥95%) drives MTTR down; high false-alarm rate (≤5%) keeps it down. LSA (MIL-STD-1388) integrates LORA + spares + support + training + tech data + BIT into the MDT and A_o. Supportability is improved more cost-effectively by reducing LDT (spares) than by reducing MTTR (design) in many fielded systems.`,
    key_takeaways: `- Maintainability is design (MTTR, Mmax, M(t)); supportability is engineering (MDT, A_o).
- MTTR_sys = Σ(λ_i·MTTR_i)/Σλ_i — failure-rate-weighted average.
- Greenman's allocation: MTTR_i = MTTR_sys·(K_i/λ_i)/Σ(K_j/λ_j); equal-contribution special case: MTTR_i = MTTR_sys·(λ_avg/λ_i).
- Mmax_95 = 2.996·MTTR; M(MTTR) = 0.632; M(Mmax_95) = 0.95.
- MDT = MTTR + LDT + ADT; A_inherent = MTBF/(MTBF+MTTR); A_o = MTBF/(MTBF+MDT).
- BIT 95/5 design goal: detection ≥95%, false-alarm ≤5%.
- LSA (MIL-STD-1388) integrates LORA + spares + support + training + tech data + BIT → MDT, A_o.
- Reducing LDT (spares) is often more cost-effective than reducing MTTR (design).`,
    references: `- ASQ CRE Body of Knowledge — Maintenance & Logistics domain.
- Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 11 (maintainability allocation, prediction, Mmax, MDT).
- MIL-STD-1388 — LSA framework integrating LORA + spares + support + training + tech data + BIT.
- Moubray (1997), RCM II (referenced for the maintenance task definitions feeding MTTR).
- Jardine & Tsang (2017), Maintenance, Replacement, and Reliability (referenced for the MTBF-MDT availability linkage).
- SAE JA1011 (referenced for the failure-mode-level inputs to the LSA).`,
  },
  knowledgeObject: {
    title: "Maintainability & Supportability",
    domain: "Maintenance & Logistics",
    competency: "Maintainability & Supportability",
    topic: "Maintainability Metrics, Allocation, Prediction, and Supportability Analysis",
    concept: "MTTR, Mmax, MDT, maintainability allocation/prediction, BIT, LSA, A_inherent vs A_operational",
    body: {
      definitions: [
        "Maintainability: design characteristic of an asset — ease of repair; MTTR, Mmax, M(t).",
        "Supportability: system-level engineering characteristic — integrated support system's ability to deliver design MTTR in field; MDT, A_o.",
        "MTTR (Mean Time To Repair): average repair time across failures [h].",
        "Mmax_p: max repair time at percentile p; Mmax_95 = 2.996·MTTR (exponential).",
        "M(t): maintainability function = 1 - exp(-t/MTTR); probability repair complete by t.",
        "MDT (Mean Down Time): MTTR + LDT + ADT — operational downtime per failure.",
        "LDT (Logistics Delay Time): waiting for spares, tools, transport.",
        "ADT (Administrative Delay Time): waiting for scheduling, permits, technician dispatch.",
        "A_inherent = MTBF/(MTBF+MTTR): design availability (no logistics/admin).",
        "A_o (operational availability) = MTBF/(MTBF+MDT): field availability.",
        "Maintainability allocation: distribute system MTTR target across LRUs by failure-rate weighting + complexity.",
        "Maintainability prediction (MIL-HDBK-472): build MTTR from elementary maintenance actions (access, isolate, disassemble, replace, reassemble, align, verify).",
        "BIT (Built-in Test): on-asset automatic detection/diagnosis; drives diagnostic-time component of MTTR.",
        "BIT detection coverage: fraction of failures automatically detected.",
        "BIT false-alarm rate: fraction of BIT indications that are spurious.",
        "LSA (Logistics Support Analysis): MIL-STD-1388 framework integrating LORA + spares + support + training + tech data + BIT into MDT.",
      ],
      principles: [
        "Maintainability is design (asset-level); supportability is engineering (system-level).",
        "M(t) = 1 - exp(-t/MTTR); M(MTTR) = 0.632; M(Mmax_95) = 0.95.",
        "MTTR_sys = Σ(λ_i·MTTR_i)/Σλ_i — failure-rate-weighted average.",
        "Allocation: high-λ LRUs get tighter MTTR; low-λ get more (Greenman's K_i/λ_i).",
        "Prediction (MIL-HDBK-472): MTTR = Σ(MTTR_action × n_action)/Σ n_action from elementary actions.",
        "MDT = MTTR + LDT + ADT; A_inherent vs A_o (the gap is support-system inefficiency).",
        "BIT 95/5 design goal: detection ≥95%, false-alarm ≤5%.",
        "LSA (MIL-STD-1388) integrates LORA + spares + support + training + tech data + BIT → MDT.",
        "Reducing LDT (spares) is often more cost-effective than reducing MTTR (design).",
      ],
      components: [
        "MTTR (mean time to repair).",
        "Mmax_p (max repair time at percentile p).",
        "M(t) (maintainability function).",
        "λ_i (LRU failure rate) — weighting in MTTR_sys.",
        "K_i (complexity factor) — Greenman's allocation.",
        "MTTR_action × n_action (elementary maintenance actions).",
        "LDT, ADT — MDT components beyond MTTR.",
        "A_inherent, A_o — design vs operational availability.",
        "BIT detection coverage, false-alarm rate.",
        "LSA record (MIL-STD-1388).",
      ],
      mechanism: [
        "Supportability lifecycle: build reliability model (LRU λ_i) → set MTTR_sys target → allocate MTTR (Greenman's) → predict MTTR (MIL-HDBK-472) → compute Mmax_p → compute MDT (with LDT, ADT from Lesson 2 spares) → compute A_inherent, A_o → design BIT (95/5) → integrate LSA per MIL-STD-1388 → verify A_o target → annual re-baseline from field MTTR data.",
      ],
      process: [
        "1. Build asset reliability model: LRUs with λ_i, MTBF_sys = 1/Σλ.",
        "2. Set system MTTR target (customer requirement or competitive benchmark).",
        "3. Allocate MTTR across LRUs: Greenman's MTTR_i = MTTR_sys·(K_i/λ_i)/Σ(K_j/λ_j).",
        "4. Verify allocation: MTTR_sys = Σ(λ_i·MTTR_i)/Σλ_i must equal target.",
        "5. Maintainability prediction (MIL-HDBK-472): decompose into elementary actions, sum MTTR_action × n_action / Σ n_action.",
        "6. Compute Mmax_p = -MTTR·ln(1-p) for p=95%.",
        "7. Compute MDT = MTTR + LDT (Lesson 2 spares) + ADT.",
        "8. Compute A_inherent = MTBF/(MTBF+MTTR) and A_o = MTBF/(MTBF+MDT); verify target.",
        "9. Design BIT: detection ≥95%, false-alarm ≤5% (95/5 design goal).",
        "10. Integrate LSA per MIL-STD-1388: LORA + spares + support + training + tech data + BIT → MDT.",
        "11. Annual re-baseline from field MTTR data — re-predict, re-allocate, re-verify A_o.",
      ],
      formulas: [
        "M(t) = 1 - exp(-t/MTTR); M(MTTR) = 0.632; Mmax_95 = 2.996·MTTR.",
        "MTTR_sys = Σ(λ_i·MTTR_i)/Σλ_i (failure-rate-weighted average).",
        "Greenman allocation: MTTR_i = MTTR_sys·(K_i/λ_i)/Σ(K_j/λ_j); special case MTTR_i = MTTR_sys·(λ_avg/λ_i).",
        "MIL-HDBK-472 prediction: MTTR = Σ(MTTR_action × n_action)/Σ n_action.",
        "MDT = MTTR + LDT + ADT.",
        "A_inherent = MTBF/(MTBF+MTTR); A_o = MTBF/(MTBF+MDT).",
        "BIT detection coverage = failures_detected/total_failures; false-alarm rate = false_indications/total_indications.",
      ],
      metrics: [
        "MTTR [h] — mean time to repair (design metric).",
        "Mmax_95 [h] — 95th-percentile repair time (planning metric).",
        "MDT [h] — mean downtime per failure (operational metric).",
        "A_inherent, A_o [dimensionless 0..1] — design vs operational availability.",
        "BIT detection coverage [%] — fraction of failures auto-detected.",
        "BIT false-alarm rate [%] — fraction of spurious BIT indications.",
        "MTBF sensitivity: dA_o/dMTBF at the operating point.",
      ],
      examples: [
        "CNC machine 3 LRUs (λ=[5e-4, 3e-4, 2e-4]/h, MTTR_sys=2.0 h): MTTR1=1.333 h, MTTR2=2.222 h, MTTR3=3.333 h; check Σλ_i·MTTR_i=2.0e-3 → MTTR_sys=2.0 h ✓.",
        "Mmax_95 = 2.996·2.0 = 6.0 h; M(6 h) = 1 - exp(-3) = 0.9502.",
        "MDT = 2.0 + 4.0 + 1.0 = 7.0 h; A_inherent = 99.80%, A_o = 99.30%.",
        "BIT coverage 95%, false-alarm 5%: 95/5 design goal met.",
      ],
      industrial_examples: [
        "Manufacturing — CNC machine MTTR allocation by Greenman's; on-site spares reduce LDT 4→1 h; A_o 99.30% → 99.60%.",
        "Aerospace — turbofan engine BIT in FADEC (95/3); MTTR_diagnostic 0.6→0.15 h (75% reduction); MDT 8→4 h; A_o 98.5% → 99.4%.",
        "Medical — CT scanner BIT 96/4 + on-site spares; MDT 14→7.25 h; A_o 99.30% → 99.64% (meets 99.40% target).",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Medical CT scanner (MTBF=2000 h, customer A_o≥99%): initial design MTTR=4 h, LDT=8 h, ADT=2 h → MDT=14 h, A_o=99.30%; BIT 96/4 + on-site critical spares → MTTR=3.25 h, LDT=2 h, MDT=7.25 h, A_o=99.64%; cost $420K/yr, benefit $400K/yr (8 avoided penalty events @ $50K) — near-breakeven year 1. Method per Ebeling (2010, Ch. 11) and MIL-STD-1388.",
      ],
      common_errors: [
        "Confusing MTTR with MDT — MTTR is repair only; MDT = MTTR + LDT + ADT (operational).",
        "Reporting A_inherent as the field availability — A_o (with MDT) is what the customer experiences.",
        "Allocating MTTR equally across LRUs — ignores failure-rate weighting; high-λ dominates the system.",
        "Setting Mmax = MTTR — Mmax_95 = 3× MTTR for exponential; understates planning time.",
        "Ignoring BIT false-alarm rate — high coverage with high false-alarm pushes MTTR up (wild-goose-chase).",
        "Treating maintainability as after-the-fact measurement — must be a design allocation.",
        "Forgetting LDT is a function of the spares plan (Lesson 2) — improving spares is often more cost-effective than improving MTTR.",
      ],
      limitations: [
        "Exponential repair-time model is simplest; lognormal (MIL-HDBK-472 Method 5A) more realistic but more parameters.",
        "LDT, ADT stochastic in practice; deterministic averages understate MDT variability.",
        "Greenman's K_i is subjective; sensitivity analysis needed.",
        "MIL-HDBK-472 prediction assumes well-known action times — estimated from time-and-motion on similar equipment.",
        "BIT false-alarm rate hard to estimate pre-fielding; field data required to validate.",
        "95/5 BIT rule is a heuristic; high-consequence systems may require 99/1 or stricter.",
        "LSA labor-intensive (2-3 person-years per major system); cost-benefit must be justified by criticality and fielding size.",
      ],
      best_practices: [
        "Always report A_o (with MDT) as the field availability — A_inherent is the upper bound only.",
        "Allocate MTTR by Greenman's method (failure-rate-weighted) — not equal-MTTR.",
        "Verify allocation by recomputing MTTR_sys = Σ(λ_i·MTTR_i)/Σλ_i.",
        "Use Mmax_95 = 2.996·MTTR for planning, not MTTR itself.",
        "Design BIT to the 95/5 goal; validate the false-alarm rate in the field.",
        "Integrate LSA per MIL-STD-1388 — LORA + spares + support + training + tech data + BIT.",
        "Improve supportability by reducing LDT (spares) before reducing MTTR (design) — usually more cost-effective.",
      ],
      related_concepts: [
        "Maintenance Strategies & RCM (Lesson 1) — T_p* and PM task definitions drive the MTTR allocation inputs.",
        "Spare Parts Logistics & LORA (Lesson 2) — spares + LORA drive LDT (logistics delay) component of MDT.",
        "ASQ CRE Reliability Modeling (RM) — FMEA identifies the LRUs whose MTTR is allocated.",
        "ASQ CRE Reliability Fundamentals (RF) — MTBF/MTTR/availability basics.",
      ],
      prerequisites: [
        "ASQ CRE Reliability Fundamentals (RF) — MTBF, MTTR, availability A = MTBF/(MTBF+MTTR).",
        "ASQ CRE Probability & Statistics (PS) — exponential distribution, CDF, percentiles.",
        "ASQ CRE Maintenance Strategies & RCM (Lesson 1) — PM and CBM reduce MTTR via earlier detection.",
        "ASQ CRE Spare Parts Logistics & LORA (Lesson 2) — spares + LORA drive LDT (logistics delay).",
      ],
      references: [
        "ASQ CRE Body of Knowledge — Maintenance & Logistics domain.",
        "Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 11 (maintainability allocation, prediction, Mmax, MDT).",
        "MIL-STD-1388 — LSA framework integrating LORA + spares + support + training + tech data + BIT.",
        "Moubray (1997), RCM II (maintenance task definitions feeding MTTR).",
        "Jardine & Tsang (2017), Maintenance, Replacement, and Reliability (MTBF-MDT availability linkage).",
        "SAE JA1011 (failure-mode-level inputs to LSA).",
      ],
    },
  },
  questions: [
    {
      competencyName: "Maintainability & Supportability",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which is the correct relationship between MTTR (mean time to repair) and MDT (mean down time) in the operational availability formula A_o = MTBF/(MTBF+MDT)?",
      whyCorrect:
        "MDT (Mean Down Time) is the operational downtime per failure in the field — it includes MTTR (the actual repair time) plus the logistics delay time LDT (waiting for spares, tools, transport) plus the administrative delay time ADT (scheduling, permits, technician dispatch). So MDT = MTTR + LDT + ADT. MTTR is the design characteristic (the asset's built-in repair time); MDT is the operational reality (the actual downtime the customer experiences). The two operational availability metrics — A_inherent = MTBF/(MTBF+MTTR) (design, no logistics) and A_o = MTBF/(MTBF+MDT) (field, with logistics) — bracket the customer's experience; A_o ≤ A_inherent always (MDT ≥ MTTR). Reducing LDT (via better spares, Lesson 2) is often more cost-effective than reducing MTTR (via design changes) to improve A_o.",
      whyOthersWrong: [
        "Option A (MTTR = MDT - MTBF) — dimensional nonsense (mixing repair time and time-between-failures); MTTR and MDT are both [h], MTBF is [h], but MTTR + MTBF ≠ MDT; the relationship is MDT = MTTR + LDT + ADT (no MTBF term).",
        "Option B (MDT = MTTR × A_o) — circular; A_o is defined from MDT, not the other way around; also the relationship is additive (MDT = MTTR + LDT + ADT), not multiplicative.",
        "Option D (MDT = MTTR + MTBF) — MTBF is the time the asset is *up* between failures; adding it to the downtime MTTR gives a total cycle time, not the downtime per failure; MDT is the downtime per failure (MTTR + delays).",
      ],
      explanation:
        "MDT = MTTR + LDT (logistics delay) + ADT (admin delay). MTTR is the repair-time design characteristic; MDT is the operational reality (with logistics + admin). A_o = MTBF/(MTBF+MDT) ≤ A_inherent = MTBF/(MTBF+MTTR).",
      options: [
        { text: "MTTR = MDT − MTBF", isCorrect: false },
        { text: "MDT = MTTR × A_o", isCorrect: false },
        { text: "MDT = MTTR + LDT + ADT (logistics delay time + administrative delay time)", isCorrect: true },
        { text: "MDT = MTTR + MTBF", isCorrect: false },
      ],
    },
    {
      competencyName: "Maintainability & Supportability",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Manufacturing",
      stem: "A CNC machine system has MTTR_sys = 2.0 h (exponential repair-time model). Three LRUs with λ1 = 5×10⁻⁴/h, λ2 = 3×10⁻⁴/h, λ3 = 2×10⁻⁴/h. Allocate MTTR by equal per-failure contribution (Greenman's special case MTTR_i = MTTR_sys·(λ_avg/λ_i)). Compute the three allocated MTTRs and verify the system check.",
      whyCorrect:
        "Greenman's special case (K_i = constant = equal per-failure contribution): MTTR_i = MTTR_sys·(λ_avg/λ_i), where λ_avg = Σλ/n. Step 1 — λ_avg = (5e-4 + 3e-4 + 2e-4)/3 = 1e-3/3 = 3.333×10⁻⁴/h. Step 2 — Allocate: MTTR1 = 2.0·(3.333e-4/5e-4) = 2.0·0.6667 = 1.333 h; MTTR2 = 2.0·(3.333e-4/3e-4) = 2.0·1.1111 = 2.222 h; MTTR3 = 2.0·(3.333e-4/2e-4) = 2.0·1.6667 = 3.333 h. Step 3 — System check: Σ(λ_i·MTTR_i) = 5e-4·1.333 + 3e-4·2.222 + 2e-4·3.333 = 6.667e-4 + 6.667e-4 + 6.667e-4 = 2.0×10⁻³; MTTR_sys_check = Σ(λ_i·MTTR_i)/Σλ_i = 2.0e-3/1.0e-3 = 2.0 h ✓ (matches target). The allocation gives high-λ LRU1 the tightest MTTR (1.333 h — frequent failures, simple swap) and low-λ LRU3 the loosest (3.333 h — rare failures, calibration-intensive) — operationally intuitive.",
      whyOthersWrong: [
        "Option A (MTTR1=MTTR2=MTTR3=2.0 h) — equal-MTTR allocation ignores failure-rate weighting; the system MTTR check would give 2.0 h (matches target trivially), but the allocation is operationally wrong — it gives the high-λ frequent-failure LRU1 too much MTTR budget (over-engineering a simple swap) and the low-λ rare-failure LRU3 too little (under-budgeting a calibration-intensive repair).",
        "Option B (MTTR1=0.667 h, MTTR2=1.111 h, MTTR3=1.667 h) — these are the *ratios* λ_avg/λ_i (without the MTTR_sys multiplier of 2.0); the Σλ_i·MTTR_i = 1.0×10⁻³, giving MTTR_sys = 1.0 h (half the target) — allocation under-delivers.",
        "Option D (MTTR1=4.0 h, MTTR2=2.4 h, MTTR3=1.6 h) — these are inverse to the correct allocation (high-λ gets MORE MTTR instead of less) — would give Σλ_i·MTTR_i = 5e-4·4.0 + 3e-4·2.4 + 2e-4·1.6 = 2e-3 + 7.2e-4 + 3.2e-4 = 3.04e-3, MTTR_sys = 3.04 h — well above the 2.0 h target (allocation fails).",
      ],
      explanation:
        "λ_avg = Σλ/3 = 3.333e-4/h. MTTR_i = 2.0·(λ_avg/λ_i): MTTR1=1.333 h, MTTR2=2.222 h, MTTR3=3.333 h. Check: Σλ_i·MTTR_i = 2.0e-3; MTTR_sys = 2.0 h ✓.",
      options: [
        { text: "MTTR1 = MTTR2 = MTTR3 = 2.0 h (equal allocation)", isCorrect: false },
        { text: "MTTR1 = 0.667 h; MTTR2 = 1.111 h; MTTR3 = 1.667 h", isCorrect: false },
        { text: "MTTR1 = 1.333 h; MTTR2 = 2.222 h; MTTR3 = 3.333 h", isCorrect: true },
        { text: "MTTR1 = 4.0 h; MTTR2 = 2.4 h; MTTR3 = 1.6 h", isCorrect: false },
      ],
    },
    {
      competencyName: "Maintainability & Supportability",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Aerospace",
      stem: "A BIT (Built-in Test) subsystem has 98% detection coverage and 5% false-alarm rate. Which statement is correct regarding this design's effect on MTTR and the canonical 95/5 design goal?",
      whyCorrect:
        "The canonical BIT design goal (the '95/5 rule') specifies detection coverage ≥ 95% AND false-alarm rate ≤ 5%. This BIT design (98% coverage, 5% false-alarm) satisfies the detection coverage target (98% ≥ 95%) but is at the boundary of the false-alarm target (5% = 5%, not strictly less than 5%). The BIT's effect on MTTR is dual: high coverage drives the diagnostic component of MTTR DOWN (98% of failures are auto-isolated, eliminating manual isolation time); but the 5% false-alarm rate drives MTTR UP via 'wild-goose-chase' time (technicians dispatched to investigate spurious indications — 5% of all BIT indications are false, each costing a wasted diagnostic visit). The net MTTR is reduced only if the avoided manual-isolation time exceeds the wild-goose-chase time; for typical aerospace designs at 5% false-alarm the net is still a substantial MTTR reduction, but the 5% is the upper boundary — higher false-alarm rates quickly erode the BIT benefit. Best practice: 99/2 or stricter for high-consequence systems.",
      whyOthersWrong: [
        "Option A (The design exceeds the 95/5 goal because 98% > 95% detection) — only the coverage criterion is satisfied; the false-alarm rate (5%) is at the boundary, not strictly less than 5%. The 95/5 goal is a joint criterion (both ≥95% AND ≤5%); 5% is the limit, not a clear pass.",
        "Option B (The BIT will increase MTTR because of the false-alarm rate; coverage is irrelevant) — coverage is not irrelevant; high coverage (98%) drives MTTR DOWN by auto-isolating 98% of failures, eliminating manual isolation time. The 5% false-alarm rate does push MTTR up (wild-goose-chase), but for typical designs the avoided manual isolation time dominates the wasted false-alarm time — net MTTR reduction.",
        "Option D (False-alarm rate is irrelevant to MTTR; only coverage matters) — false-alarm rate is highly relevant: each false alarm consumes technician time (dispatch, isolate, document, return to service); the 5% false-alarm rate means 5% of all BIT indications are wild-goose-chases that extend MTTR linearly in the false-alarm count.",
      ],
      explanation:
        "BIT 98% coverage / 5% false-alarm: coverage satisfies 95/5 (98≥95); false-alarm is at the 5% boundary (not strictly <5%). Coverage drives MTTR down (auto-isolation); false-alarm drives MTTR up (wild-goose-chase). Net MTTR reduction requires the avoided manual isolation to exceed the wasted false-alarm time. Stricter (99/2) for high-consequence systems.",
      options: [
        { text: "The design exceeds the 95/5 goal because 98% > 95% detection; false-alarm rate is irrelevant", isCorrect: false },
        { text: "The BIT will increase MTTR because of the 5% false-alarm rate; coverage is irrelevant", isCorrect: false },
        { text: "Coverage (98%) satisfies the ≥95% target; false-alarm (5%) is at the ≤5% boundary; high coverage drives MTTR down but false alarms push MTTR up via wild-goose-chase time", isCorrect: true },
        { text: "False-alarm rate is irrelevant to MTTR; only coverage matters", isCorrect: false },
      ],
    },
    {
      competencyName: "Maintainability & Supportability",
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Manufacturing",
      stem: "True or False: Under the exponential repair-time model M(t) = 1 - exp(-t/MTTR), the 95th-percentile maximum repair time Mmax_95 equals 2.996 × MTTR, and the probability a repair is complete by the MTTR itself is 0.632 (63.2%).",
      whyCorrect:
        "TRUE. For the exponential repair-time distribution with mean MTTR, the maintainability function (CDF) is M(t) = 1 - exp(-t/MTTR). At t = MTTR: M(MTTR) = 1 - exp(-1) = 1 - 0.3679 = 0.6321 = 63.21% — so 63.2% of repairs are complete by the MTTR (analogous to the '63.2% survive to MTBF' rule for reliability). For the 95th percentile, set M(Mmax_95) = 0.95: 1 - exp(-Mmax_95/MTTR) = 0.95 → exp(-Mmax_95/MTTR) = 0.05 → -Mmax_95/MTTR = ln(0.05) = -2.996 → Mmax_95 = 2.996 × MTTR. So for MTTR = 2.0 h: Mmax_95 = 5.99 ≈ 6.0 h (95% of repairs complete within 6 h). The exponential model is the simplest constant-repair-rate model; the lognormal model (MIL-HDBK-472 Method 5A) gives a tighter (more peaked) distribution where Mmax_95/MTTR is smaller (closer to 1.5-2.0 for σ_lognormal ≈ 0.5).",
      whyOthersWrong: [
        "Option FALSE — would imply Mmax_95 is not 2.996·MTTR or that M(MTTR) is not 0.632; in fact both are direct consequences of the exponential model's CDF. The exponential distribution has the same memoryless property as the failure-time exponential: the residual repair time at any point is exponential with the same MTTR. For planning purposes the 2.996×MTTR factor gives the 95th-percentile repair time the customer should expect — a 3× rule of thumb widely used in maintainability engineering.",
      ],
      explanation:
        "TRUE. Exponential M(t) = 1 - exp(-t/MTTR); M(MTTR) = 1 - exp(-1) = 0.632 (63.2% by MTTR); M(Mmax_95) = 0.95 → Mmax_95 = -MTTR·ln(0.05) = 2.996·MTTR.",
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lessons table
// ---------------------------------------------------------------------------

export const CRE_ML_LESSONS: RefLesson[] = [
  LESSON_RCM,
  LESSON_LORA,
  LESSON_MAINT,
];

// ---------------------------------------------------------------------------
// ML competencies created inside loadReference() (ML domain exists in
// src/lib/ref-content/cre.ts with NO competencies yet — this loader seeds
// the 3 ML competencies and then loads the deep content).
// ---------------------------------------------------------------------------

interface SeedCompetency {
  name: string;
  description: string;
  order: number;
}

const CRE_ML_COMPETENCIES: SeedCompetency[] = [
  {
    name: "Maintenance Strategies & RCM",
    description:
      "Maintenance strategy selection (reactive/run-to-failure, preventive/time-based, predictive/condition-based, reliability-centered maintenance (RCM)); the SAE JA1011 seven-questions process (functions, functional failures, failure modes, failure effects, failure consequences, proactive tasks, default actions); FMEA-driven task selection; PM optimization by the renewal-theory age-replacement cost C(T_p) = [C_p·R + C_f·F]/M(T_p); the technical-feasibility tests (β>1 wear-out for PM; P-F interval for CBM; hidden-function test for failure-finding).",
    order: 1,
  },
  {
    name: "Spare Parts Logistics & LORA",
    description:
      "Spare-parts inventory: MTBF-driven demand D = N·t_op/MTBF; Economic Order Quantity EOQ = √(2DS/H); safety stock SS = Z·σ_LT (σ_LT = σ_d·√L, Poisson σ_d = √d); reorder point ROP = d·L + SS; Min/Max policy; VED×ABC×HML criticality classification. Level of Repair Analysis (LORA) per MIL-STD-1388: LRU/SRU decomposition; repair-vs-discard break-even n* = C_standby/(C_d - C_r - C_log); multi-echelon VARI-METRIC (Sherbrooke); LSA (Logistics Support Analysis) documentation of the integrated support system.",
    order: 2,
  },
  {
    name: "Maintainability & Supportability",
    description:
      "Maintainability metrics (MTTR, Mmax_p = -MTTR·ln(1-p), M(t) = 1 - exp(-t/MTTR)); maintainability allocation (Greenman's MTTR_i = MTTR_sys·(K_i/λ_i)/Σ(K_j/λ_j) satisfying MTTR_sys = Σ(λ_i·MTTR_i)/Σλ_i); maintainability prediction (MIL-HDBK-472 elementary-action build-up); supportability analysis (LSA per MIL-STD-1388 integrating LORA + spares + support equipment + training + tech data + BIT); MDT = MTTR + LDT + ADT; A_inherent = MTBF/(MTBF+MTTR) vs A_operational = MTBF/(MTBF+MDT); built-in test (BIT) with the 95/5 design goal (detection ≥95%, false-alarm ≤5%).",
    order: 3,
  },
];

// ---------------------------------------------------------------------------
// Loader — CONTENT-only (mirrors cre-probability-statistics.ts) with the
// additional step of creating the 3 ML competencies inside loadReference().
// ---------------------------------------------------------------------------

/**
 * Upsert the CRE Maintenance & Logistics (ML) CONTENT into the database.
 * Idempotent: safe to call repeatedly. Returns record counts written.
 *
 * Flow:
 *  1. Find CRE certification by slug "cre" (the structure+RF-content loader
 *     in src/lib/ref-content/cre.ts is a prerequisite).
 *  2. Find the ML domain by code "ML" (certificationId = cre.id). The ML
 *     domain exists in cre.ts with NO competencies — delete any stale ML
 *     competencies and create the 3 ML competencies from
 *     CRE_ML_COMPETENCIES. Map by NAME -> id.
 *  3. Upsert References globally (by title, no sectionId) → shared ids
 *     applied to every ML lesson, KO, and question.
 *  4. For each lesson:
 *     - db.lesson.findFirst({where:{competencyId, slug}}) then update or
 *       create with sectionId=null, certificationId, competencyId, slug,
 *       title, titleAr, order, durationMin, conceptIntroduction, example,
 *       keyFormulas, exercise, sections (JSON.stringify), referenceIds
 *       (JSON.stringify shared), status="READY", confidence="HIGH",
 *       verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
 *  5. Upsert KnowledgeObject per lesson: findFirst({where:{lessonId}}) then
 *     create/update with certificationId, domainId (ML), competencyId,
 *     lessonId, body JSON, referenceIds (JSON shared), certificationIds
 *     (JSON [cre.id]), status="READY", confidence="HIGH",
 *     verificationStatus="VERIFIED", version="1.0.0".
 *  6. Per lesson: deleteMany questions {certificationId, competencyId} then
 *     create each enriched question with nested QuestionOption records,
 *     knowledgeObjectId link, whyCorrect, whyOthersWrong (JSON),
 *     referenceIds (JSON shared), status="READY", verificationStatus=
 *     "VERIFIED", reviewStatus="PENDING", version="1.0.0".
 *  7. Return { certification, domain, competencies, lessons, kos,
 *      questions, references } counts.
 */
export async function loadReference() {
  // 1) Certification (find by slug "cre")
  const certification = await db.certification.findUnique({
    where: { slug: "cre" },
  });
  if (!certification) {
    throw new Error(
      'CRE certification not found. Run the CRE structure+RF-content loader (src/lib/ref-content/cre.ts) first.'
    );
  }

  // 2) Find the ML domain by code "ML" (certificationId = cre.id). The ML
  //    domain exists in cre.ts but is seeded with NO competencies — delete
  //    any stale ML competencies and create the 3 ML competencies here.
  const mlDomain = await db.domain.findFirst({
    where: { certificationId: certification.id, code: "ML" },
  });
  if (!mlDomain) {
    throw new Error(
      'Maintenance & Logistics (ML) domain not found under CRE. Run the CRE structure+RF-content loader (src/lib/ref-content/cre.ts) first.'
    );
  }

  // Delete any existing ML competencies (idempotent re-create).
  await db.competency.deleteMany({
    where: { domainId: mlDomain.id },
  });

  // Create the 3 ML competencies.
  for (const c of CRE_ML_COMPETENCIES) {
    await db.competency.create({
      data: {
        domainId: mlDomain.id,
        name: c.name,
        description: c.description,
        order: c.order,
      },
    });
  }

  // Map ML competencies by NAME -> id.
  const mlCompetencies = await db.competency.findMany({
    where: { domainId: mlDomain.id },
  });
  const competencyIdByName: Record<string, string> = {};
  for (const c of mlCompetencies) {
    competencyIdByName[c.name] = c.id;
  }
  // Validate that all 3 expected ML competencies exist by name.
  const expectedCompetencyNames = CRE_ML_LESSONS.map((l) => l.competencyName);
  const missing = expectedCompetencyNames.filter(
    (n) => !competencyIdByName[n]
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing ML competencies by name: ${missing.join(
        ", "
      )}. Ensure CRE_ML_COMPETENCIES matches CRE_ML_LESSONS competencyName.`
    );
  }

  // 3) References — global (no sectionId), upserted by title.
  const refIdsByTitle: Record<string, string> = {};
  for (const src of CRE_ML_SOURCES) {
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
  const sharedReferenceIds = CRE_ML_SOURCES.map((s) => refIdsByTitle[s.title]).filter(
    Boolean
  ) as string[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 4) Lessons, 5) KnowledgeObjects, 6) Questions
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of CRE_ML_LESSONS) {
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
      domainId: mlDomain.id,
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
          domainId: mlDomain.id,
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
    domain: mlDomain.id,
    competencies: mlCompetencies.length,
    lessons: lessonsCount,
    kos: kosCount,
    questions: questionsCount,
    references: referencesCount,
  };
}
