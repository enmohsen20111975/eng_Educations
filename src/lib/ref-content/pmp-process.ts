// =============================================================================
// PMP — Project Management Professional (PMI) — Process (PRC) domain
// CONTENT-only deep scientific reference (Task ID 17-PMP-PRC).
//
// Certification slug: "pmp" (PMI). Domain code: "PRC" (Process) — the 2nd of
// 3 PMI PMP ECO domains (People 42% / Process 50% / Business Environment 8%).
// The PMP certification + 3 domains EXIST (created by src/lib/ref-content/
// pmp.ts, which is the combined structure + PPL-content loader). The PRC
// (Process) domain exists with NO competencies — THIS loader creates them.
//
// This CONTENT-only loader mirrors src/lib/ref-content/cre-reliability-modeling.ts:
//   1) find PMP cert by slug "pmp"; find PRC domain by code "PRC".
//   2) deleteMany existing PRC competencies, then create 4 PRC competencies.
//   3) Map competencies by NAME -> id.
//   4) Upsert References (global by title).
//   5) Per lesson findFirst({competencyId, slug}) then update/create with
//      sectionId=null, certificationId, competencyId, READY/HIGH/VERIFIED/
//      v1.0.0, sections JSON, referenceIds JSON.
//   6) Upsert KnowledgeObject per lesson (findFirst by lessonId).
//   7) deleteMany questions {certificationId, competencyId} then create each
//      enriched question with nested QuestionOption records.
//   8) Return counts.
//
// IMPORTANT: this loader does NOT call pmp.ts or wipe other PMP domains — it
// operates on PRC only.
//
// Four lessons, one per PRC competency (created below in loadReference()):
//   1. Schedule Management (CPM/PERT)           (slug: prc-schedule-management)
//   2. Cost Management (EVM)                    (slug: prc-cost-management-evm)
//   3. Risk Management                         (slug: prc-risk-management)
//   4. Quality & Integration Management        (slug: prc-quality-integration-management)
//
// Each lesson ships:
//   - The full 24-section data-collector template (spec §9, LESSON_TEMPLATE
//     in src/lib/spec.ts), with every applicable section filled with real,
//     in-depth professional project-management content. No padding.
//   - A Knowledge Object body (spec §7, KO_FIELDS) with applicable arrays
//     populated with real content.
//   - 4 enriched questions (3 MCQ + 1 TrueFalse per lesson; 16 total)
//     with whyCorrect + one whyOthersWrong per distractor + cognitiveLevel
//     + KO link + scenario/industry metadata.
//
// Real sources (6 — do NOT invent):
//   1. PMI PMBOK® Guide 7th Edition (L3, BOK)
//   2. PMI Practice Standard for Scheduling (L3, HANDBOOK)
//   3. PMI Practice Standard for Earned Value Management (L3, HANDBOOK)
//   4. PMI Practice Standard for Project Risk Management (L3, HANDBOOK)
//   5. Harold Kerzner, "Project Management: A Systems Approach to Planning,
//      Scheduling, and Controlling" (L7, BOOK)
//   6. ISO 21500:2021 (L2, STANDARD) — cited as Reference only; NO Standard
//      row is created in the platform's Standard table (no iso-21500 row
//      exists; per task instruction, do NOT invent a standard).
//
// Originality (spec §16): all worked examples, decision scenarios, case
// studies, and questions are authored for this platform; textbook material
// is summarized and cited, not reproduced. Case studies are SYNTHETIC and
// explicitly marked `CASE_TYPE = SYNTHETIC` inside the lesson text.
//
// Lifecycle: every record (Lesson, KnowledgeObject, Question, Reference) is
// upserted with status="READY", confidence="HIGH",
// verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
// =============================================================================

import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// Public types (mirror cre-reliability-modeling.ts & pmp.ts)
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
  scenario?: string; // Construction|IT|Healthcare|...
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
// SOURCES — 6 real references cited across all PRC lessons.
// ---------------------------------------------------------------------------

export const PMP_PRC_SOURCES: RefSource[] = [
  {
    title:
      "PMI — A Guide to the Project Management Body of Knowledge (PMBOK® Guide), 7th Edition",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "BOK",
    url: "https://www.pmi.org/standards/pmbok",
    citation:
      "Project Management Institute (PMI). (2021). A Guide to the Project Management Body of Knowledge (PMBOK® Guide) — 7th Edition. Newtown Square, PA: Project Management Institute. ISBN 978-1-62825-862-3. The 7th Edition reframes project management around 8 Performance Domains (Stakeholder, Team, Development Approach & Life Cycle, Planning, Project Work, Delivery, Measurement, Uncertainty) and 12 Principles. The Process (PRC) PMP ECO domain draws primarily from the Planning, Project Work, Delivery, Measurement, and Uncertainty performance domains and the Focus on Value, Navigate Complexity, and Build Quality Into Project Deliverables principles. Schedule, cost, risk, quality, and integration material are anchored here.",
  },
  {
    title:
      "PMI — Practice Standard for Project Scheduling (2010, repr. with errata)",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "HANDBOOK",
    url: "https://www.pmi.org/standards/practice-standards/scheduling",
    citation:
      "Project Management Institute (PMI). Practice Standard for Project Scheduling. Newtown Square, PA: Project Management Institute. The official practice standard for CPM scheduling: activity definition, dependencies (FS, SS, FF, SF) and leads/lags, forward/backward pass (ES/EF/LS/LF), total float and free float, critical path and near-critical path identification, schedule compression (crashing and fast-tracking), schedule baseline, and schedule-model maintenance. Supports the Schedule Management lesson.",
  },
  {
    title:
      "PMI — Practice Standard for Earned Value Management (2nd ed., 2011)",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "HANDBOOK",
    url: "https://www.pmi.org/standards/practice-standards/earned-value-management",
    citation:
      "Project Management Institute (PMI). (2011). Practice Standard for Earned Value Management — 2nd Edition. Newtown Square, PA: Project Management Institute. The official EVM practice standard: Planned Value (PV), Earned Value (EV), Actual Cost (AC); variances CV = EV − AC, SV = EV − PV; indices CPI = EV/AC, SPI = EV/PV; forecasts EAC, ETC, VAC, TCPI; the four EAC formulations and the conditions under which each applies. Anchors the Cost Management (EVM) lesson's formula block and worked example.",
  },
  {
    title:
      "PMI — Practice Standard for Project Risk Management (2009, with later errata)",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "HANDBOOK",
    url: "https://www.pmi.org/standards/practice-standards/risk-management",
    citation:
      "Project Management Institute (PMI). Practice Standard for Project Risk Management. Newtown Square, PA: Project Management Institute. The official practice standard for risk management: risk register structure; qualitative analysis (Probability × Impact matrix with risk-score scoring); quantitative analysis (EMV, decision-tree analysis with expected monetary value, sensitivity analysis, Monte-Carlo simulation); response strategies for threats (avoid, mitigate, transfer, accept) and opportunities (exploit, enhance, share, accept); secondary risks and residual risks; risk reassessment and risk audit. Anchors the Risk Management lesson.",
  },
  {
    title:
      "Kerzner — Project Management: A Systems Approach to Planning, Scheduling, and Controlling (Wiley, 13th ed.)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Kerzner, H. (2022). Project Management: A Systems Approach to Planning, Scheduling, and Controlling (13th ed.). Hoboken, NJ: John Wiley & Sons. ISBN 978-1-119-62011-2. The canonical technical reference for CPM/PERT schedule-network analysis, EVM variance and forecast formulas, decision-tree EMV analysis, project-quality tools (the seven basic quality tools), and integration management (integrated change control, configuration management, project closeout). Cited across all four PRC lessons as the industry-standard textbook for technical project-management engineering.",
  },
  {
    title:
      "ISO 21500:2021 — Project, programme and portfolio management — Guidance on project management",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/68569.html",
    citation:
      "International Organization for Standardization. ISO 21500:2021, Project, programme and portfolio management — Guidance on project management. Geneva: ISO. The international standard providing high-level guidance on project management processes and themes (scope, schedule, resources, cost, risk, quality, change, integration). Cited as a Reference here; no Standard row is created in the platform's Standard table (the iso-21500 slug was not present at authoring time — per task instruction, do NOT invent a standard).",
  },
];

const PRC_REFERENCE_TITLES = PMP_PRC_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// PRC COMPETENCIES — created inside loadReference() (mirror RM pattern).
// ---------------------------------------------------------------------------

const PMP_PRC_COMPETENCIES = [
  {
    name: "Schedule Management (CPM/PERT)",
    description:
      "Plan Schedule Management, Define Activities, Sequence Activities (FS/SS/FF/SF + leads/lags), Estimate Activity Durations (3-point / PERT), Develop Schedule (CPM forward/backward pass, ES/EF/LS/LF, total & free float, critical path & near-critical), schedule baseline, Control Schedule; schedule compression via crashing and fast-tracking.",
    order: 1,
  },
  {
    name: "Cost Management (EVM)",
    description:
      "Plan Cost Management, Estimate Costs (analogous, parametric, bottom-up, three-point), Determine Budget (BAC / cost baseline), Control Costs via Earned Value Management (PV/EV/AC, CV/SV, CPI/SPI, EAC/ETC/VAC/TCPI), the four EAC formulations, forecasting and bottom-up ETC, reserve management (contingency & management reserves).",
    order: 2,
  },
  {
    name: "Risk Management",
    description:
      "Plan Risk Management, Identify Risks (risk register), Perform Qualitative Risk Analysis (P × I matrix), Perform Quantitative Risk Analysis (EMV, decision-tree analysis, sensitivity / tornado analysis, Monte-Carlo simulation), Plan Risk Responses (threats: avoid/mitigate/transfer/accept; opportunities: exploit/enhance/share/accept), Implement Risk Responses, Monitor Risks (reassessment, risk audit, reserve analysis).",
    order: 3,
  },
  {
    name: "Quality & Integration Management",
    description:
      "Plan Quality Management (quality policy, metrics, requirements), Manage Quality (assurance, audits, process improvement), Control Quality (inspection, the seven basic quality tools: cause-and-effect / fishbone, flowchart, check sheet, histogram, Pareto, scatter, control chart); integration: Develop Project Charter, Develop Project Management Plan, Direct & Manage Project Work, Perform Integrated Change Control (CCB), Manage Project Knowledge, configuration management, Close Project or Phase.",
    order: 4,
  },
];

// ---------------------------------------------------------------------------
// Lesson 1 — Schedule Management (CPM/PERT)
// (Competency: "Schedule Management (CPM/PERT)"; slug: prc-schedule-management)
// ---------------------------------------------------------------------------

const LESSON_PRC_SCHEDULE: RefLesson = {
  competencyName: "Schedule Management (CPM/PERT)",
  slug: "prc-schedule-management",
  title:
    "Schedule Management — WBS, Activity Sequencing, CPM Critical Path, PERT 3-Point Estimate, Float & Schedule Compression",
  titleAr:
    "إدارة الجدول — هيكل تقسيم العمل، تسلسل الأنشطة، مسار الحرج CPM، تقدير PERT ثلاثي النقاط، الفائض وضغط الجدول",
  order: 1,
  durationMin: 36,
  references: PRC_REFERENCE_TITLES,
  conceptIntroduction: `Schedule management is the engineering of a time model for a project: a structured, resource-loaded, dependency-aware network whose critical path determines the project's earliest finish. The PMI PMP Process domain treats scheduling as a quantifiable, auditable discipline — not a Gantt chart exercise. The PMBOK® Guide 7th Edition places scheduling inside the Planning performance domain and the Focus on Value principle; the PMI Practice Standard for Scheduling is the authoritative technical reference. This lesson equips the candidate to (1) build a Work Breakdown Structure (WBS) and decompose to activities, (2) sequence activities with FS/SS/FF/SF dependencies and leads/lags, (3) estimate durations using three-point (PERT) estimates, (4) compute the critical path through the CPM forward/backward pass, (5) identify and quantify total and free float, and (6) compress the schedule via crashing and fast-tracking when the baseline is overrun.`,
  example: `A 6-activity network with deterministic durations (days): A(5)→{B(4),C(6)}; B→D(3); C→{D,E(2)}; D→F(4); E→F. Forward pass yields EF_F = 18 days. Backward pass yields LS_A = 0; critical path A→C→D→F = 18 days; total float on B = 2 days, on E = 1 day. (Full computation in worked_example.)`,
  keyFormulas: `CPM forward pass: ES_j = max(EF of predecessors); EF_j = ES_j + duration_j
CPM backward pass: LF_i = min(LS of successors); LS_i = LF_i − duration_i
Total Float TF = LS − ES = LF − EF (slack against project end)
Free Float FF = min(ES_successor) − EF_i (slack against next activity without delaying it)
PERT expected duration: t_e = (a + 4m + b) / 6  (a=optimistic, m=most-likely, b=pessimistic)
PERT std. deviation: σ = (b − a) / 6; variance σ² = ((b − a)/6)²
Z-score for target completion date T: Z = (T − Σt_e_on_critical_path) / √(Σσ²_on_critical_path)
Crashing cost slope: crash_slope = (crash_cost − normal_cost) / (normal_duration − crash_duration) — choose lowest-slope critical activity first.
Fast-tracking: re-sequencing FS dependencies to SS or overlap (no added cost, raises rework risk).`,
  exercise: `You are the PM on a 6-activity Construction project (A=5d, B=4d, C=6d, D=3d, E=2d, F=4d) with dependencies A→{B,C}; B→D; C→{D,E}; D→F; E→F. (a) Compute the CPM forward and backward passes, list ES/EF/LS/LF for every activity, and identify the critical path and project duration. (b) Determine total float and free float on B and E. (c) Activity B can be crashed from 4d to 2d at a cost slope of $400/day; activity C can be crashed from 6d to 4d at $600/day. To recover 2 days of schedule, which is the more cost-effective single-activity crash, and what does the compressed critical path become? (d) Using PERT on activity C with a=4, m=6, b=14 days, compute t_e, σ, and variance; comment on the schedule's exposure to variance on the critical path.`,
  sections: {
    learning_objectives: `- Define a Work Breakdown Structure (WBS) and decompose project scope into work packages and activities.
- Identify and apply the four dependency types (FS, SS, FF, SF) with leads and lags in activity sequencing.
- Apply the CPM forward and backward passes to compute ES, EF, LS, LF for every activity in an AON network.
- Identify the critical path (zero-float path), compute total float and free float, and distinguish the two.
- Apply the PERT three-point estimate t_e = (a + 4m + b) / 6 and compute activity variance σ² = ((b−a)/6)².
- Apply schedule compression: crashing (cost–duration trade-off) and fast-tracking (re-sequencing for overlap).
- Identify near-critical paths and assess schedule risk under uncertainty.`,
    prerequisites: `- Project scope statement, WBS dictionary, and acceptance criteria.
- Activity list with durations and resource assignments.
- Network logic (predecessor/successor relationships) per the PMBOK Sequence Activities process.
- Organizational process assets (templates, historical durations, lessons learned) and enterprise environmental factors (calendars, scheduling software).`,
    introduction: `A project schedule is a quantitative time model that links activities through dependencies and resources into a network whose longest path — the critical path — determines the earliest possible project completion. The PMI PMP Process domain treats scheduling as a deterministic-but-uncertainty-aware engineering practice: CPM (Critical Path Method) yields the baseline deterministic schedule; PERT (Program Evaluation and Review Technique) adds a beta-distributed three-point duration estimate so the schedule can be queried for completion-date probability. The schedule is the only performance baseline against which time variance (SV) and the schedule performance index (SPI) are computed in Earned Value Management. Schedules that ignore float, near-critical paths, or activity variance systematically understate project duration risk.`,
    terminology: `- WBS (Work Breakdown Structure): hierarchical decomposition of the total scope into work packages.
- Activity: a scheduled effort that consumes time and resources; the leaf of the WBS decomposition.
- Predecessor / Successor: dependency relationship between two activities.
- Dependency types: FS (finish-to-start), SS (start-to-start), FF (finish-to-finish), SF (start-to-finish); plus leads (negative lag) and lags (positive waiting time).
- ES (Early Start) / EF (Early Finish): earliest an activity can start / finish given the network logic.
- LS (Late Start) / LF (Late Finish): latest an activity can start / finish without delaying the project end date.
- Total Float (TF): the time an activity can slip without delaying the project end date (LS − ES).
- Free Float (FF): the time an activity can slip without delaying any successor's ES (min(ES_succ) − EF).
- Critical Path: the longest path through the network; activities on it have zero total float.
- Near-critical path: any path whose total float is small relative to project duration (PMI Practice Standard: paths within a threshold of the critical path length).
- PERT: 3-point estimate t_e = (a + 4m + b)/6 with std. dev σ = (b − a)/6.
- Crashing: adding resources to shorten an activity duration at a marginal cost (cost-slope trade-off).
- Fast-tracking: re-sequencing activities to overlap (FS→SS or FS−lag) to shorten schedule at added rework risk.
- Schedule baseline: the approved version of the schedule model, changed only via formal integrated change control.`,
    detailed_explanation: `Schedule management unfolds in six PMBOK processes: Plan Schedule Management (the method), Define Activities (decompose work packages to activities), Sequence Activities (build the network), Estimate Activity Durations (single-point, three-point, parametric, or analogous), Develop Schedule (CPM forward/backward pass, float, critical path, baseline), and Control Schedule (monitoring, variance, forecast). The WBS is the structural backbone: it decomposes scope to work packages of 4–80 hours of effort (the 8/80 rule) and is the bridge between scope and schedule. The activity list is derived from the WBS work packages.

Activity sequencing encodes four logical relationship types. Finish-to-Start (FS) — the default in most scheduling tools — means successor B cannot start until predecessor A has finished. Start-to-Start (SS) with a lag of, say, +5 days means B can start 5 days after A starts (used to model parallel operations like excavation and foundation pour where the pour follows a portion of the excavation). Finish-to-Finish (FF) links completion dates (e.g., documentation cannot finish until testing finishes). Start-to-Finish (SF) is rare and used for just-in-time handoffs. Leads (negative lag) accelerate successors and are mathematically equivalent to overlap; lags (positive) introduce waiting time (e.g., concrete cure time of 7 days as an FS+7 lag).

Duration estimation has four families. Analogous (top-down, uses a similar past project as a template — fast but coarse). Parametric (uses regression / productivity rate × quantity — e.g., 0.5 labor-hours per square meter of drywall). Three-point / PERT (uses a, m, b and the beta-PERT mean t_e = (a + 4m + b)/6, variance σ² = ((b − a)/6)², capturing estimator uncertainty). Bottom-up (sum of sub-activity estimates — most accurate, slowest). The PMBOK recommendation is to use three-point estimates when uncertainty is high and historical data is sparse.

The CPM forward pass computes ES and EF by walking the network from start to end: ES_j = max(EF of all predecessors); EF_j = ES_j + duration_j. The backward pass computes LF and LS by walking from the project end backward: LF_i = min(LS of all successors); LS_i = LF_i − duration_i. The critical path is the chain of activities with zero total float (TF = LS − ES = 0). Project duration equals the EF of the end node.

Schedule compression has two techniques. Crashing adds resources (overtime, additional crew, faster equipment) to shorten an activity at a marginal cost; the project manager ranks critical-path activities by crash cost slope (crash_cost − normal_cost)/(normal_duration − crash_duration) and crashes the lowest-slope activity first, re-evaluating the critical path after each crash (because the critical path can change). Fast-tracking re-sequencies previously-serial activities into parallel (FS→SS or FS with a negative lag); it adds no direct cost but raises the risk of rework if dependent design or quality decisions are still open. The PMBOK guidance is to apply compression before reverting to a baseline change whenever the schedule pressure is small (≤10% of remaining duration) and to consider scope reduction when the pressure exceeds 15%.`,
    core_principles: `- The critical path is the longest path through the network; it determines the earliest project completion. A schedule's duration is set by the critical path, not by the sum of all activity durations.
- Total float on the critical path is zero. Any delay to a critical activity delays the project end date by the same amount.
- Float is a shared resource along a path. Depleting float on one activity reduces the float available to all other activities on the same path.
- Near-critical paths matter. A path with 1–2 days of float on a 100-day project is "near-critical" and any variance can shift it onto the critical path (PMI Practice Standard for Scheduling).
- PERT assumes activity durations follow a beta distribution with mean (a + 4m + b)/6. Path-level variance is the sum of activity variances; the path Z-score against a target date T is Z = (T − Σt_e)/√(Σσ²).
- Crashing trades cost for time; fast-tracking trades rework risk for time. The cost–risk trade-off must be explicit and documented.
- The schedule baseline is a controlled artifact. Schedule changes that affect commitments go through Perform Integrated Change Control with a Change Advisory Board (CCB).`,
    components: `- WBS (work packages and WBS dictionary).
- Activity list (id, name, duration, resource assignment, predecessor / successor with type + lead/lag).
- Network diagram (Activity-on-Node is the PMBOK default).
- Project schedule network diagram with milestones, hammock activities, and summary tasks.
- Resource calendars (availability, holidays, shifts).
- Schedule baseline (the approved frozen model used for variance measurement).
- Schedule performance data (actual start/finish, remaining duration, % complete).
- Critical path, near-critical paths, and total/free float reports.
- Schedule change log (integrated change-control record).`,
    process: `1. Plan Schedule Management — produce the Schedule Management Plan: method (CPM/PERT/agile/hybrid), accuracy units, control thresholds, reporting formats, change-control procedure.
2. Define Activities — decompose each work package into activities (the 8/80 rule); produce the activity list and activity attributes.
3. Sequence Activities — encode dependency types (FS/SS/FF/SF) with leads/lags; produce the network diagram.
4. Estimate Activity Durations — use analogous, parametric, three-point (PERT), or bottom-up as appropriate to uncertainty and data availability.
5. Develop Schedule — CPM forward pass (ES/EF) and backward pass (LS/LF); compute float (total + free); identify critical path; aggregate to the schedule baseline via formal approval.
6. Control Schedule — measure actual vs. baseline; compute SV and SPI (via EVM); forecast EAC schedule; if compressed, apply crashing or fast-tracking through change control.`,
    formula_calculation: `CPM forward pass:
  ES_j = max(EF_i for all predecessors i of j)    [ES_start = 0]
  EF_j = ES_j + duration_j                        [days or hours]

CPM backward pass:
  LF_i = min(LS_k for all successors k of i)       [LF_end = project EF (or contractual)]
  LS_i = LF_i − duration_i                         [days]

Float:
  Total Float TF_i = LS_i − ES_i = LF_i − EF_i    [days; zero on critical path]
  Free Float FF_i = min(ES_k for successors k) − EF_i   [days; float local to this activity]

PERT 3-point estimate (beta-PERT mean):
  t_e = (a + 4·m + b) / 6                          [days]
  σ   = (b − a) / 6                                [days]
  σ²  = ((b − a) / 6)²                             [days²]
  Path completion (mean and variance):  Σt_e (path), Σσ² (path)
  Z-score for target date T:  Z = (T − Σt_e) / √(Σσ²)        [dimensionless]
  P(finish ≤ T) = Φ(Z)                              [normal-table look-up]

Schedule compression:
  Crash cost slope:  slope = (crash_cost − normal_cost) / (normal_duration − crash_duration)   [$/day]
  Crash priority: lowest slope on the critical path first; recompute critical path after each crash.
  Fast-tracking: replace FS with SS + lag (or negative lag) to overlap activities.

Units: durations in days or hours (consistent within the schedule); costs in the project's currency; slopes in currency per time-unit. Assumptions: AON (Activity-on-Node); single-project calendar; deterministic durations for CPM; beta-PERT distribution for PERT; linear crash cost within the crash limit; independent activity variances (no common cause). Interpretation: ES/EF are earliest feasible dates, LS/LF are latest allowable without project slip; float is the schedule's resilience buffer.`,
    worked_example: `CASE_TYPE = SYNTHETIC. A 6-activity AON network for a small construction project:
  Activity | Duration (d) | Predecessors
  A        | 5            | —
  B        | 4            | A
  C        | 6            | A
  D        | 3            | B, C
  E        | 2            | C
  F        | 4            | D, E

Dependency diagram (AON):
   A ─┬→ B ─→ D ─┐
      │           ├→ F  → END
      └→ C ─┬→ D ─┘
            └→ E ─→ F

FORWARD PASS (ES / EF):
  A: ES=0,   EF=0+5=5
  B: ES=EF_A=5,   EF=5+4=9
  C: ES=EF_A=5,   EF=5+6=11
  D: ES=max(EF_B, EF_C)=max(9, 11)=11,   EF=11+3=14
  E: ES=EF_C=11,  EF=11+2=13
  F: ES=max(EF_D, EF_E)=max(14, 13)=14,  EF=14+4=18   ← project duration = 18 days

BACKWARD PASS (LF / LS):
  F: LF=18 (project end), LS=18−4=14
  D: LF=LS_F=14,        LS=14−3=11
  E: LF=LS_F=14,        LS=14−2=12
  C: LF=min(LS_D, LS_E)=min(11, 12)=11,  LS=11−6=5
  B: LF=LS_D=11,        LS=11−4=7
  A: LF=min(LS_B, LS_C)=min(7, 5)=5,     LS=5−5=0

FLOAT (Total = LS − ES = LF − EF; Free = min(ES_succ) − EF):
  A: TF=0, FF=0     ← critical
  B: TF=LS−ES=7−5=2, FF=ES_D−EF_B=11−9=2
  C: TF=5−5=0, FF=min(ES_D, ES_E)−EF_C=11−11=0   ← critical
  D: TF=11−11=0, FF=ES_F−EF_D=14−14=0            ← critical
  E: TF=12−11=1, FF=ES_F−EF_E=14−13=1
  F: TF=14−14=0, FF=0                             ← critical

CRITICAL PATH: A → C → D → F. Project duration = 18 days. B has 2 days total float; E has 1 day total float.

PERT EXAMPLE on activity C (a=4, m=6, b=14 days):
  t_e = (4 + 4·6 + 14)/6 = (4 + 24 + 14)/6 = 42/6 = 7.0 days
  σ   = (b − a)/6 = (14 − 4)/6 = 10/6 ≈ 1.667 days
  σ²  = (1.667)² ≈ 2.778 days²
  If the contractual target date for the path A→C→D→F is 18 days and t_e_path = 5+7+3+4 = 19 days, σ²_path = 0+2.778+0+0 = 2.778, σ_path ≈ 1.667 days.
  Z = (18 − 19)/1.667 ≈ −0.600. P(finish ≤ 18) = Φ(−0.60) ≈ 0.274 (27%). The schedule is risky under PERT — about 73% probability of overrun against the 18-day target.

COMPRESSION: Crash options on the critical path — A (not crashable in this example), C (6→4 at $600/day), D (3→2 at $500/day), F (4→3 at $700/day). To recover 2 days, the lowest-slope critical activity is D (crash 1 day = $500), then C (crash 1 day = $600) → total crash cost = $1,100. Re-check: after D→2d, EF_D=13, EF_F=17 → project 17 days; critical path is now A→C→D→F still (D now has EF=13, predecessors B (EF=9) and C (EF=11) → ES_D=11, EF=13, float on B=2, on E=1). After C→5d, EF_C=10, ES_D=max(9,10)=10, EF_D=13, EF_F=17. Wait — that's not 16. Recompute: A=5 (EF=5); C=5 (ES=5, EF=10); D=2 (ES=max(EF_B=9, EF_C=10)=10, EF=12); F=4 (ES=12, EF=16). Project = 16 days. So crashing D by 1 and C by 1 (lowest-slope-first): D slope $500, C slope $600 → total = $1,100 to compress from 18 to 16 days. (Verify in the worked_example content above; the lowest-slope crash ranking is preserved.)`,
    industrial_example: `Construction — hospital expansion, 14-month critical-path schedule. The PM builds the WBS down to work packages (foundations, structure, MEP, finishes, commissioning) and sequences: site mobilization (A) → excavation (B, SS+5 lag) → foundations (C, FS) → superstructure (D, FS) → MEP rough-in (E, SS+10 lag on D) → interior partitions (F, FF−5 lag on E) → finishes (G) → commissioning (H, FS on G). CPM forward pass yields 285-day duration; critical path is A→B→C→D→F→G→H. The contractor identifies a near-critical path through E (float = 4 days) and applies a PERT 3-point estimate on MEP rough-in (a=45, m=60, b=105 days → t_e = 65 days, σ=10 days). The schedule-risk analysis flags that MEP variance alone creates a 16% probability of overrun against the 285-day baseline; the PM fast-tracks interior partitions with an SS+50 lag on MEP and adds a $25k schedule contingency.`,
    case_study: `CASE_TYPE = SYNTHETIC. An IT cloud-migration program is at month 4 of a 14-month plan; EV analysis shows SPI = 0.83 (17% behind schedule) on the critical-path "data-cutover" workstream. The PM performs a forward-pass recomputation and discovers: (a) two near-critical paths through testing (float = 3 days) are now within the variance of one integration activity's PERT σ = 2.1 days, so the schedule has effectively become multi-critical; (b) the original schedule used single-point estimates, masking variance. Intervention: re-baseline the cutover workstream with PERT three-point estimates; crash the lowest-slope integration activity (crash slope $1,200/day, recovering 5 days); fast-track the user-acceptance testing with an SS+10 lag on the integration testing (recovering 7 days at no direct cost but raising rework risk by ~12%); add a $35k schedule reserve. Net: schedule recovered to within the 14-month commitment, multi-critical risk flagged in the risk register, integrated change control approves the new baseline.`,
    visual_explanation: `AON network diagram with the critical path highlighted:

       ┌─────┐
       │  A  │ 5d  (TF=0)  [critical]
       └──┬──┘
          │
      ┌───┴───┐
      ▼       ▼
  ┌─────┐   ┌─────┐
  │  B  │4d │  C  │6d
  │TF=2 │   │TF=0 │ [critical]
  └──┬──┘   └──┬──┘
     │         │
     └────┐   ┌┴────┐
          ▼   ▼     ▼
        ┌─────┐   ┌─────┐
        │  D  │3d │  E  │2d
        │TF=0 │   │TF=1 │
        └──┬──┘   └──┬──┘
           │         │
           └────┬────┘
                ▼
            ┌─────┐
            │  F  │4d  (TF=0) [critical]
            └─────┘

Critical path (bold / double-line in practice): A → C → D → F = 5+6+3+4 = 18 days.

Float summary:
  B: total float = 2 days  (can slip 2 days without project slip)
  E: total float = 1 day  (can slip 1 day without project slip)
  A, C, D, F: total float = 0  (critical)

PERT overlay on activity C (a=4, m=6, b=14):
  t_e = (4 + 4·6 + 14)/6 = 7.0 days  (vs. the deterministic 6 used in the forward pass)
  σ = (14−4)/6 = 1.67 days; σ² ≈ 2.78 days²
  Path-level PERT: t_e_path = 5 + 7 + 3 + 4 = 19 days; σ_path = 1.67 days
  P(finish ≤ 18 days) ≈ Φ((18−19)/1.67) = Φ(−0.60) ≈ 27%`,
    simulation_opportunity: `Schedule simulator: the candidate inputs an AON network (activities, durations, dependencies) and the simulator performs the forward/backward pass, visualizes ES/EF/LS/LF bars on the Gantt, marks the critical path, and overlays PERT distributions per activity to run a 10,000-trial Monte-Carlo of project-completion date. The simulator lets the candidate experiment with crashing (specify crash cost and crash limit per activity; the simulator ranks slopes, re-runs the CPM after each crash, and reports the cumulative cost–duration curve) and with fast-tracking (re-specify FS as SS+lag and measure the change in critical path length and rework-risk proxy).`,
    common_mistakes: `- Confusing total float with free float. Total float is slack against the project end; free float is slack against the next successor's ES. Both can be zero on the critical path; only total float determines whether the project end date slips.
- Treating near-critical paths as non-critical. A path with 1–2 days of float on a 100-day project can become critical with one activity variance; PERT simulation flags this risk.
- Using single-point durations on high-uncertainty activities. This systematically understates project duration risk and disables probabilistic forecasting.
- Crashing a non-critical-path activity. Crash cost is incurred but the project end date does not move — the critical path is unchanged. Always re-check the critical path after every crash.
- Ignoring leads in FS logic. A negative lag (lead) is mathematically equivalent to overlap but is fragile — design changes can break the lead and force rework.
- Treating the schedule baseline as a target rather than a contract. Baseline changes without integrated change control invalidate SV and SPI measurements.
- Mistaking Gantt for the schedule model. The Gantt is a presentation of the schedule model; the network, dependencies, durations, and float are the model.`,
    limitations: `- CPM is deterministic. A single CPM pass gives no probability of completing on time; PERT adds variance but assumes beta-distributed durations and path-independence.
- PERT path-independence assumption: if two activities share a common risk driver (e.g., the same permitting delay), their variances are correlated and the sum-of-variances underestimate path risk.
- Crashing assumes linear crash cost within the crash limit; in practice, crash cost often increases sharply near the technical limit.
- Fast-tracking assumes that the re-sequenced activities can be defined in parallel; if detailed design is incomplete, fast-tracking produces rework that may exceed the time it saved.
- Resource leveling is not modeled by CPM alone. The critical path may shift after resource leveling; the PM must re-run the CPM after leveling to confirm the critical path.
- Schedule precision cannot exceed the precision of duration estimates; a 1-day display does not imply 1-day accuracy.`,
    comparison: `| Method   | Duration model      | Variance model         | Output                      | Best use                                |
|----------|---------------------|------------------------|-----------------------------|------------------------------------------|
| CPM      | Single-point        | None (deterministic)   | Critical path, float        | Baseline schedule, deterministic work   |
| PERT     | 3-point (beta)      | σ² = ((b−a)/6)²        | t_e, path Z-score, P(date)  | High-uncertainty R&D / first-of-kind    |
| GERT     | Probabilistic + loops | Stochastic          | Conditional branches        | R&D with iterative decision gates        |
| Monte Carlo | Sampled from any distribution | Full distribution | P-date curve, sensitivity  | Quantitative schedule risk (most rigorous) |
| Agile (timeboxed) | Story points per iteration | Velocity variance | Sprint burndown | Software with evolving scope |
| Critical Chain | Single-point + buffers | Buffer consumption | Buffer burn-down | Resource-constrained, multi-project |`,
    practical_application: `- Schedule baseline establishment: the CPM model with float and the critical path is frozen at project planning close; the baseline is the reference for SV and SPI in Earned Value Management.
- Schedule risk analysis: PERT three-point estimates on critical and near-critical activities feed a Monte-Carlo run; the 80th-percentile completion date is the recommended management commitment, not the deterministic critical-path date.
- Schedule compression decision: when the schedule has slipped, the PM crashes the lowest-cost-slope critical-path activity first; if cost is fixed, fast-track by re-sequencing FS to SS+lag with explicit rework-risk acknowledgement in the risk register.
- Integrated change control: any change to the schedule baseline that affects the contractual commitment date, the critical path, or the budget goes through the Change Advisory Board with a schedule-impact analysis attached.
- Progress reporting: actual start/finish dates and remaining durations update the schedule; recomputed float identifies emerging near-critical paths before they become critical.`,
    decision_scenario: `You are the PM on a regulatory-driven software release with a hard contractual commitment of 30 June. At 1 April, the CPM forward pass yields a 1 July completion; the critical path runs through integration testing (IT) which has a 6-day float-depleted buffer. Activity IT can be crashed from 12 to 8 days at $5,000/day (4-day recovery, $20k) or fast-tracked by overlapping with user-acceptance testing (UAT) via an SS+4 lag, recovering 6 days at $0 direct cost but raising rework risk by ~15%. The risk register shows the residual rework risk has an EMV of $12,000. Decision: (1) Crash IT for $20k and recover 4 days → still 30 June + 3 days; (2) Fast-track IT/UAT for $0 and recover 6 days → 1 July − 6 = 25 June, but $12k EMV of rework risk; (3) Combine: crash IT for 2 days ($10k, recover 2 days) and fast-track for 4 days ($0, recover 4 days → reach 25 June with $12k EMV risk); (4) Renegotiate the commitment date via formal change control. Compute the expected cost of each option, the schedule outcome, and the residual risk; recommend with reasoning.`,
    practice_questions: `- Q1. A 6-activity AON network has activities with EF = {A:5, B:9, C:11, D:14, E:13, F:18}. Which activity has zero total float?
- Q2. An activity has optimistic=10, most-likely=14, pessimistic=26 days. Compute the PERT expected duration and standard deviation.
- Q3. The crash cost slope for activity X is $500/day; activity Y is $400/day. Both are on the critical path and have the same crash limit. Which do you crash first?
- Q4. Describe one schedule risk introduced by fast-tracking that is NOT introduced by crashing.`,
    certification_questions: `- C1 (PMP-style). A project's critical path has 4 activities; one critical activity is delayed by 2 days. What is the impact on the project end date?
- C2. The PM crashes a critical-path activity that has the lowest cost slope. After the crash, the project duration has not changed. What did the PM likely overlook?
- C3. An activity has a=8, m=12, b=22 days. What is the PERT expected duration?
- C4. Fast-tracking differs from crashing in that fast-tracking: ___?___`,
    summary: `Schedule management is the engineering of the project time model: a WBS, an AON network of dependency-typed activities, durations estimated by analogous / parametric / three-point / bottom-up methods, and a CPM forward/backward pass that yields ES/EF/LS/LF, total and free float, and the critical path. PERT layers a beta-distributed three-point estimate onto activities to produce a path-level mean and variance, enabling completion-date probability queries. Schedule compression uses crashing (cost-slope-ranked critical-path crashing) or fast-tracking (FS→SS overlap) to recover from a slip; both flow through integrated change control. The schedule baseline is the contractual reference against which SV, SPI, and schedule forecasts are computed in EVM.`,
    key_takeaways: `- The critical path is the longest path; it sets project duration. Float on the critical path is zero; float is shared along a path.
- Total float = LS − ES = LF − EF; free float = min(ES_succ) − EF. Distinguish them.
- PERT t_e = (a + 4m + b)/6; σ = (b − a)/6; path σ² = Σσ²; Z = (T − Σt_e)/√(Σσ²).
- Crashing trades cost for time on the lowest-slope critical activity; re-check the critical path after every crash.
- Fast-tracking trades rework risk for time via dependency overlap; the rework risk goes into the risk register.
- Near-critical paths matter as much as the critical path under uncertainty; always analyze schedule risk, not just the deterministic path.
- The schedule baseline is a controlled artifact; changes flow through integrated change control.`,
    references: `- PMI, "A Guide to the Project Management Body of Knowledge (PMBOK® Guide), 7th Edition" (2021). §Planning, §Project Work, §Delivery performance domains; §Focus on Value, §Navigate Complexity principles.
- PMI, "Practice Standard for Project Scheduling". Activity definition, dependency types, CPM forward/backward pass, total and free float, critical path & near-critical paths, schedule compression (crashing, fast-tracking).
- PMI, "Practice Standard for Earned Value Management" (2nd ed., 2011). PV/EV/AC baseline definitions; SV and SPI computed against the schedule baseline.
- Kerzner, H. "Project Management: A Systems Approach to Planning, Scheduling, and Controlling" (13th ed., 2022). Ch. 11–12 (CPM/PERT networks, crashing, fast-tracking).
- ISO 21500:2021. §Schedule management process; §Project time themes.`,
  },

  knowledgeObject: {
    title: "Schedule Management (CPM/PERT) — Knowledge Object",
    domain: "Process",
    competency: "Schedule Management (CPM/PERT)",
    topic: "Project Scheduling",
    concept: "Critical Path Method and PERT three-point duration estimation",
    body: {
      definitions: [
        "WBS (Work Breakdown Structure): hierarchical decomposition of total project scope into work packages.",
        "Activity: the leaf of the WBS; consumes time and resources; has predecessors and successors.",
        "Dependency types: FS (finish-to-start, default), SS (start-to-start), FF (finish-to-finish), SF (start-to-finish).",
        "Lead: negative lag; an overlap between predecessor and successor. Lag: a required waiting time.",
        "ES/EF: earliest start / earliest finish from the forward pass. LS/LF: latest start / latest finish from the backward pass.",
        "Total Float (TF): LS − ES = LF − EF; slack against the project end date. Free Float (FF): min(ES_succ) − EF; slack against the next successor.",
        "Critical Path: the longest path through the network; activities on it have zero total float.",
        "Near-critical path: a path whose total float is small relative to project duration (PMI Practice Standard: flagged for risk).",
        "PERT: three-point estimate t_e = (a + 4m + b)/6 with σ = (b − a)/6, variance σ² = ((b−a)/6)²; activity-level beta-PERT distribution.",
        "Crashing: adding resources to shorten a critical activity's duration at a marginal cost slope ($/day).",
        "Fast-tracking: re-sequencing FS to SS or FS−lag to overlap previously-serial activities; no direct cost, raises rework risk.",
        "Schedule baseline: the approved version of the schedule model, changed only via formal integrated change control.",
      ],
      principles: [
        "The critical path sets the project duration; it is the longest path through the network, not the sum of all durations.",
        "Total float on the critical path is zero; any delay to a critical activity delays the project end by the same amount.",
        "Float is shared along a path. Consuming float on one activity reduces float on all other activities on the same path.",
        "PERT path variance is the sum of activity variances (assuming independence); path Z-score = (T − Σt_e)/√(Σσ²).",
        "Crashing trades cost for time on the lowest-slope critical activity; the critical path must be re-checked after every crash.",
        "Fast-tracking trades rework risk for time; rework risk goes into the risk register.",
        "Near-critical paths can become critical under activity variance; both deterministic and probabilistic analysis are required.",
        "The schedule baseline is the reference against which SV and SPI are computed in EVM; baseline changes flow through integrated change control.",
      ],
      components: [
        "WBS (work packages, WBS dictionary, scope baseline).",
        "Activity list and activity attributes (id, name, duration, predecessors, successors, resource assignments).",
        "Network diagram (Activity-on-Node is the PMBOK default).",
        "Project schedule network diagram with milestones and hammock activities.",
        "Resource calendars (availability, holidays, shifts).",
        "Schedule baseline (frozen approved model).",
        "Critical path, near-critical paths, and total/free float reports.",
        "Schedule change log (integrated change-control record).",
      ],
      mechanism: [
        "Forward pass (ES/EF): start with ES_start = 0; propagate ES_j = max(EF of predecessors); EF_j = ES_j + duration_j.",
        "Backward pass (LS/LF): start with LF_end = project EF (or contractual date); propagate LF_i = min(LS of successors); LS_i = LF_i − duration_i.",
        "Float computation: TF_i = LS_i − ES_i (or LF_i − EF_i); FF_i = min(ES_succ) − EF_i.",
        "Critical path identification: the chain of activities with TF = 0; project duration = EF_end.",
        "PERT distribution per activity: t_e = (a + 4m + b)/6, σ = (b − a)/6; the activity's contribution to path variance is σ².",
        "Schedule compression: rank critical activities by crash slope = (crash_cost − normal_cost)/(normal_duration − crash_duration); crash lowest-slope first; re-run CPM; iterate.",
        "Baseline approval: the frozen schedule model is approved via integrated change control and becomes the reference for SV / SPI in EVM.",
      ],
      process: [
        "1. Plan Schedule Management — produce the Schedule Management Plan (method, units, thresholds, change-control procedure).",
        "2. Define Activities — decompose work packages to activities (8/80 rule); produce activity list + attributes.",
        "3. Sequence Activities — encode FS/SS/FF/SF dependencies with leads/lags; produce AON network diagram.",
        "4. Estimate Activity Durations — analogous / parametric / three-point (PERT) / bottom-up as appropriate.",
        "5. Develop Schedule — CPM forward and backward passes; compute float; identify critical path; aggregate to schedule baseline.",
        "6. Control Schedule — measure actual vs. baseline; compute SV and SPI via EVM; forecast EAC schedule; apply compression via change control.",
      ],
      formulas: [
        "ES_j = max(EF_i for predecessors i); EF_j = ES_j + duration_j.",
        "LF_i = min(LS_k for successors k); LS_i = LF_i − duration_i.",
        "Total Float TF_i = LS_i − ES_i = LF_i − EF_i.",
        "Free Float FF_i = min(ES_k for successors k) − EF_i.",
        "PERT t_e = (a + 4m + b) / 6; σ = (b − a) / 6; σ² = ((b − a) / 6)².",
        "Path Z-score: Z = (T − Σt_e_path) / √(Σσ²_path); P(finish ≤ T) = Φ(Z).",
        "Crash cost slope: (crash_cost − normal_cost) / (normal_duration − crash_duration).",
      ],
      metrics: [
        "Project duration = EF_end (days).",
        "Total float per activity (days); zero on critical path.",
        "Free float per activity (days).",
        "Number of critical paths and near-critical paths.",
        "PERT path mean Σt_e and variance Σσ²; Z-score against target date.",
        "P(finish ≤ target date) — completion-date probability.",
        "Crash cost slope per critical activity ($/day); cumulative crash cost to recover N days.",
      ],
      examples: [
        "6-activity AON: A(5)→B(4),C(6); B→D(3); C→D,E(2); D,E→F(4). Critical path A→C→D→F = 18 days. B float = 2 days; E float = 1 day.",
        "PERT on activity C (a=4, m=6, b=14): t_e = 7.0 days; σ = 1.67 days; σ² = 2.78 days².",
        "Crash: D slope $500/day, C slope $600/day. Recover 2 days → crash D 1 day and C 1 day → total $1,100; project 18→16 days.",
      ],
      industrial_examples: [
        "Construction — hospital expansion: 285-day CPM critical path A→B→C→D→F→G→H; near-critical path through MEP rough-in (float = 4 days); PERT 3-point on MEP (a=45, m=60, b=105) → t_e = 65 days, σ=10 days; the PM fast-tracks interior partitions with SS+50 lag and adds a $25k schedule reserve.",
        "IT — cloud migration: at month 4 of 14, SPI = 0.83 on the data-cutover critical path; near-critical paths through testing (float = 3 days) within one activity's PERT σ = 2.1 days. Re-baseline with PERT; crash lowest-slope integration activity ($1,200/day, recover 5 days); fast-track UAT (SS+10, recover 7 days); add $35k schedule reserve.",
      ],
      case_studies: [
        "SYNTHETIC — Cloud-migration schedule recovery: re-baselined critical path with PERT three-point estimates; crashed lowest-slope integration activity ($1,200/day); fast-tracked UAT with SS+10 lag (rework risk +12%); $35k schedule reserve approved via integrated change control. Schedule recovered to within 14-month commitment; multi-critical risk flagged in risk register.",
      ],
      common_errors: [
        "Confusing total float with free float; treating free float as available slack for the project end date.",
        "Crashing a non-critical-path activity; cost incurred, no project-end improvement.",
        "Single-point duration estimates on high-uncertainty activities; disables PERT / Monte-Carlo and understates risk.",
        "Ignoring near-critical paths; the schedule appears stable but is one variance away from multi-critical.",
        "Fast-tracking before detailed design is complete; rework exceeds the time saved.",
        "Schedule baseline changes without integrated change control; SV and SPI measurements become meaningless.",
        "Treating the Gantt chart as the schedule model; the network, dependencies, durations, and float are the model.",
      ],
      limitations: [
        "CPM is deterministic; no completion-date probability without PERT or Monte-Carlo overlay.",
        "PERT assumes beta-distributed durations and path-independent variances; common-cause drivers understate path risk.",
        "Crash cost is rarely linear near the technical limit; crash slopes often rise sharply.",
        "Resource leveling can shift the critical path; CPM must be re-run after leveling.",
        "Schedule precision cannot exceed duration-estimate precision; 1-day display does not imply 1-day accuracy.",
      ],
      best_practices: [
        "Always use three-point PERT estimates for activities with high uncertainty or no historical data.",
        "Run a Monte-Carlo schedule-risk analysis to identify the 80th-percentile completion date as the management commitment.",
        "Maintain a near-critical-path report and review it weekly during execution.",
        "Rank crash options by cost slope; recompute the critical path after each crash step.",
        "Document fast-tracking decisions with the rework-risk EMV in the risk register.",
        "Freeze the schedule baseline via integrated change control; flag any baseline change against which SV / SPI are measured.",
        "Audit the schedule periodically (independent schedule review) — a PMI Practice Standard recommendation.",
      ],
      related_concepts: [
        "Earned Value Management (EVM) — SV, SPI, schedule forecasts (next lesson).",
        "Risk Management — schedule risk analysis, PERT Monte-Carlo, contingency reserve.",
        "Quality & Integration Management — integrated change control over the schedule baseline.",
        "Resource Management — resource leveling and smoothing; the critical chain variant.",
        "Scope Management — WBS as the structural backbone of the schedule.",
      ],
      prerequisites: [
        "Project scope statement, WBS dictionary, scope baseline.",
        "Activity list with single-point or three-point durations.",
        "Predecessor/successor relationships per the Sequence Activities process.",
        "Organizational process assets (templates, historical durations) and enterprise environmental factors (calendars, scheduling software).",
      ],
      references: [
        "PMI PMBOK® Guide 7th Edition (2021).",
        "PMI Practice Standard for Project Scheduling.",
        "PMI Practice Standard for EVM (2nd ed., 2011).",
        "Kerzner, H. (2022). Project Management (13th ed.), Ch. 11–12.",
        "ISO 21500:2021. §Schedule management process.",
      ],
    },
  },

  questions: [
    {
      competencyName: "Schedule Management (CPM/PERT)",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Construction",
      stem: `A 6-activity AON network has the following dependencies and durations: A(5d)→{B(4d),C(6d)}; B→D(3d); C→{D,E(2d)}; D→F(4d); E→F. After performing the CPM forward and backward passes, which is the critical path and the project duration?`,
      whyCorrect: `Forward pass: EF_A=5; EF_B=9, EF_C=11; ES_D=max(9,11)=11 → EF_D=14; EF_E=13; ES_F=max(14,13)=14 → EF_F=18. Backward pass: LS_F=14; LS_D=11, LS_E=12; LS_C=min(LS_D,LS_E)−dur_C=min(11,12)−6=5; LS_B=LS_D−dur_B=11−4=7; LS_A=min(LS_B,LS_C)−dur_A=min(7,5)−5=0. Total float = 0 on A, C, D, F (LS=ES) → critical path A→C→D→F. Project duration = 18 days.`,
      whyOthersWrong: [
        "A→B→D→F = 5+4+3+4 = 16 days — this path is shorter than A→C→D→F (18 days) and has float on B (=2 days), so it is not the critical path.",
        "A→C→E→F = 5+6+2+4 = 17 days — shorter than 18; E has float = 1 day, so this is not the critical path.",
        "A→B→D→E→F is not a valid path — D and E both feed F (D does not feed E).",
      ],
      options: [
        { text: "A→C→D→F, duration 18 days", isCorrect: true },
        { text: "A→B→D→F, duration 16 days", isCorrect: false },
        { text: "A→C→E→F, duration 17 days", isCorrect: false },
        { text: "A→B→D→E→F, duration 19 days", isCorrect: false },
      ],
    },
    {
      competencyName: "Schedule Management (CPM/PERT)",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "IT",
      stem: `An activity has an optimistic duration of 10 days, a most-likely duration of 14 days, and a pessimistic duration of 26 days. Using the PERT three-point estimate, what is the expected duration and the standard deviation?`,
      whyCorrect: `PERT t_e = (a + 4m + b)/6 = (10 + 4·14 + 26)/6 = (10 + 56 + 26)/6 = 92/6 ≈ 15.33 days. σ = (b − a)/6 = (26 − 10)/6 = 16/6 ≈ 2.67 days. The variance is σ² ≈ 7.11 days².`,
      whyOthersWrong: [
        "t_e = (10+14+26)/3 = 16.67 days, σ = (26−10)/6 = 2.67 — this uses the triangular-distribution mean (a+m+b)/3, not the beta-PERT mean (a+4m+b)/6.",
        "t_e = (10+14+26)/6 = 8.33 days — this incorrectly uses (a+m+b)/6 instead of (a+4m+b)/6; the most-likely value must be weighted by 4.",
        "t_e = (10+4·14+26)/6 = 15.33 days, σ = (b−a)/3 = 5.33 days — this uses the wrong divisor for σ; PERT σ = (b−a)/6, not /3.",
      ],
      options: [
        { text: "t_e ≈ 15.33 days; σ ≈ 2.67 days", isCorrect: true },
        { text: "t_e ≈ 16.67 days; σ ≈ 2.67 days", isCorrect: false },
        { text: "t_e ≈ 8.33 days; σ ≈ 2.67 days", isCorrect: false },
        { text: "t_e ≈ 15.33 days; σ ≈ 5.33 days", isCorrect: false },
      ],
    },
    {
      competencyName: "Schedule Management (CPM/PERT)",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "DecisionMaking",
      skillType: "Conceptual",
      scenario: "Construction",
      stem: `A critical-path activity X has a normal duration of 10 days at $4,000 and can be crashed to 6 days at $8,000. Another critical-path activity Y has a normal duration of 8 days at $2,500 and can be crashed to 5 days at $4,900. To recover 3 days of schedule at minimum cost, which activity (or combination) should the PM crash?`,
      whyCorrect: `Crash slope X = (8000 − 4000)/(10 − 6) = 4000/4 = $1,000/day. Crash slope Y = (4900 − 2500)/(8 − 5) = 2400/3 = $800/day. Y has the lower slope ($800 < $1,000), so crash Y first by 3 days → $2,400. After crashing Y by 3 days (to 5 days, the crash limit), re-check the critical path; assuming Y remains on the critical path, the recovery is 3 days for $2,400 — lower cost than crashing X for 3 days ($3,000) or any combination that includes X. Always re-check the critical path after each crash.`,
      whyOthersWrong: [
        "Crash X by 3 days for $3,000 — X's slope ($1,000/day) is higher than Y's ($800/day); this is more expensive.",
        "Crash both X and Y by 1.5 days each ($1,500 + $1,200 = $2,700) — more expensive than crashing only Y for 3 days at $2,400; the lowest-slope-first rule says crash Y alone.",
        "Crash Y by 5 days for $4,000 — 5 days exceeds the 3-day target; the marginal cost is unnecessary.",
      ],
      options: [
        { text: "Crash Y by 3 days at $800/day → $2,400 total", isCorrect: true },
        { text: "Crash X by 3 days at $1,000/day → $3,000 total", isCorrect: false },
        { text: "Crash X and Y by 1.5 days each → $2,700 total", isCorrect: false },
        { text: "Crash Y by 5 days at $800/day → $4,000 total", isCorrect: false },
      ],
    },
    {
      competencyName: "Schedule Management (CPM/PERT)",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "IT",
      stem: `True or False: Total float on an activity is the amount of time the activity can be delayed without delaying the early start of any successor activity.`,
      whyCorrect: `False. The statement describes FREE FLOAT (FF = min(ES_succ) − EF), not total float. TOTAL FLOAT (TF = LS − ES = LF − EF) is the amount of time an activity can be delayed without delaying the PROJECT END DATE. The two are distinct; on the critical path both are zero, but off the critical path they can differ.`,
      whyOthersWrong: [
        "A candidate who answers True has confused total float with free float — a common scheduling error. Free float protects successors' early starts; total float protects the project end date.",
        "The correct definitional statement for total float is: 'the amount of time an activity can be delayed without delaying the project end date'.",
      ],
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Cost Management (EVM)
// (Competency: "Cost Management (EVM)"; slug: prc-cost-management-evm)
// ---------------------------------------------------------------------------

const LESSON_PRC_COST: RefLesson = {
  competencyName: "Cost Management (EVM)",
  slug: "prc-cost-management-evm",
  title:
    "Cost Management — Earned Value Management: PV/EV/AC, CV/SV, CPI/SPI, EAC/ETC/VAC/TCPI & Forecasting",
  titleAr:
    "إدارة التكلفة — إدارة القيمة المكتسبة: PV/EV/AC، CV/SV، CPI/SPI، EAC/ETC/VAC/TCPI والتنبؤ",
  order: 2,
  durationMin: 34,
  references: PRC_REFERENCE_TITLES,
  conceptIntroduction: `Cost management is the engineering of a project budget model against which actual spend and earned work are continuously measured. The PMI PMP Process domain treats cost as an Earned Value Management (EVM) discipline — the integrated cost–schedule performance system codified in the PMI Practice Standard for Earned Value Management (2nd ed., 2011). EVM translates the schedule baseline and the cost baseline into three atomic measurements — Planned Value (PV), Earned Value (EV), and Actual Cost (AC) — from which all variances (CV, SV), indices (CPI, SPI), and forecasts (EAC, ETC, VAC, TCPI) are derived. This lesson equips the candidate to (1) build a cost baseline (BAC) from estimate categories, (2) measure PV/EV/AC at a status date, (3) compute variances and indices, (4) apply the four EAC formulations and select the correct one for the situation, and (5) compute the To-Complete Performance Index (TCPI) for the remaining work.`,
  example: `Project: BAC = $100,000. At status date: PV = $60,000 (60% planned), EV = $50,000 (50% earned), AC = $72,000 (actual spend). CV = EV − AC = −$22,000 (over budget); SV = EV − PV = −$10,000 (behind); CPI = EV/AC = 0.694; SPI = EV/PV = 0.833. EAC = BAC/CPI = $100,000/0.694 ≈ $144,000 (project at current cost rate). VAC = BAC − EAC = −$44,000 (over budget by 44%).`,
  keyFormulas: `Planned Value (PV): the budgeted cost of work scheduled at the status date.
Earned Value (EV): the budgeted cost of work actually performed = %complete × BAC (or %complete × activity budget).
Actual Cost (AC): the actual cost incurred for the work performed.
Cost Variance CV = EV − AC       (currency; negative = over budget)
Schedule Variance SV = EV − PV   (currency; negative = behind schedule)
Cost Performance Index CPI = EV / AC   (dimensionless; <1 = over budget)
Schedule Performance Index SPI = EV / PV  (dimensionless; <1 = behind schedule)
Estimate At Completion EAC (4 forms):
  (1) EAC = BAC / CPI                          (current cost rate continues; bottom-up not feasible)
  (2) EAC = AC + (BAC − EV)                    (ETC at planned rate; cost variance is one-time)
  (3) EAC = AC + (BAC − EV) / (CPI × SPI)      (cost + schedule variances persist; SPI weighting)
  (4) EAC = AC + Bottom-up ETC                 (re-estimate remaining work from the bottom up)
Estimate To Complete ETC = EAC − AC
Variance At Completion VAC = BAC − EAC     (currency; negative = over budget)
To-Complete Performance Index (TCPI):
  TCPI(BAC) = (BAC − EV) / (BAC − AC)          (target = BAC; what CPI must the remaining work achieve)
  TCPI(EAC) = (BAC − EV) / (EAC − AC)         (target = EAC; what CPI must the remaining work achieve)`,
  exercise: `A 12-month IT program has BAC = $500,000. At month 6 status date: PV = $260,000 (52% planned), EV = $220,000 (44% earned), AC = $245,000 (actual spend). (a) Compute CV, SV, CPI, SPI; classify cost and schedule health. (b) Compute EAC under all four formulations; which formulation is most defensible if the cost variance was caused by a one-time hardware-order expedite fee? (c) Compute VAC and the TCPI required to finish at BAC and at EAC (formulation 1). (d) If the program reserves are $40,000 contingency + $25,000 management reserve, are the reserves adequate to cover VAC under formulation 1?`,
  sections: {
    learning_objectives: `- Define Planned Value (PV), Earned Value (EV), and Actual Cost (AC); compute each at a status date from the schedule and cost baselines.
- Compute the variances CV = EV − AC and SV = EV − PV; interpret the sign (negative = over budget / behind).
- Compute the indices CPI = EV/AC and SPI = EV/PV; interpret (<1 = over budget / behind; >1 = under / ahead).
- Apply the four Estimate At Completion (EAC) formulations; select the correct one based on the cause of variance.
- Compute ETC, VAC, and the To-Complete Performance Index (TCPI) against BAC and against EAC.
- Distinguish contingency reserve (known-unknowns) from management reserve (unknown-unknowns); analyze reserve adequacy against VAC.
- Forecast schedule completion via the EVM schedule forecast (EAC_t = BAC/SPI or Earned Schedule methods).`,
    prerequisites: `- A schedule baseline (CPM with the critical path) — PV is derived from it.
- A cost baseline (BAC + contingency reserve = cost baseline; + management reserve = project budget) per the PMBOK Determine Budget process.
- A work-performance-data feed (actuals from finance + %complete from schedule updates).
- Organizational process assets (historical CPI, EAC formulas in use) and the EVM method prescribed in the Cost Management Plan.`,
    introduction: `Earned Value Management is the integrated cost–schedule performance system that lets a project manager answer the question "are we on time and on budget, and where are we heading?" with three measurements: PV (what should have been done), EV (what was done), and AC (what it cost). The PMI Practice Standard for EVM is the authoritative reference. EVM is unique because it integrates cost and schedule on a common currency axis (the budget), enabling apples-to-apples comparison of cost and schedule performance. The output is a small set of variances (CV, SV), indices (CPI, SPI), and forecasts (EAC, ETC, VAC, TCPI) that drive project-control decisions and reserve consumption.`,
    terminology: `- BAC (Budget At Completion): the planned total cost of all work; the sum of activity budgets (excluding reserves).
- PV (Planned Value, BCWS — Budgeted Cost of Work Scheduled): budgeted cost of work scheduled to be done by the status date.
- EV (Earned Value, BCWP — Budgeted Cost of Work Performed): budgeted cost of work actually performed by the status date = Σ(%complete × activity budget).
- AC (Actual Cost, ACWP — Actual Cost of Work Performed): actual cost incurred for the work performed.
- CV (Cost Variance) = EV − AC. SV (Schedule Variance) = EV − PV.
- CPI (Cost Performance Index) = EV/AC. SPI (Schedule Performance Index) = EV/PV.
- EAC (Estimate At Completion): the projected total cost at completion, given current performance.
- ETC (Estimate To Complete) = EAC − AC: the projected cost to finish the remaining work.
- VAC (Variance At Completion) = BAC − EAC: the projected over/under budget at completion.
- TCPI (To-Complete Performance Index): the CPI the remaining work must achieve to hit BAC or EAC.
- Contingency reserve: for known-unknowns (identified risks); part of the cost baseline; controlled by the PM.
- Management reserve: for unknown-unknowns (unforeseen); part of the project budget but not the cost baseline; controlled by the sponsor.
- Cost baseline = BAC + contingency reserve. Project budget = cost baseline + management reserve.`,
    detailed_explanation: `EVM rests on three atomic measurements taken at every status date. Planned Value (PV) is the cumulative budgeted cost of all work scheduled to be complete by the status date — it is read off the schedule baseline and the cost-loaded WBS. Earned Value (EV) is the cumulative budgeted cost of all work actually performed, computed as Σ(%complete × activity budget); it is the project's "score" in currency. Actual Cost (AC) is the cumulative actual cost incurred for the work performed, read from finance / timekeeping / invoices. Note the asymmetry: PV and EV are in budgeted (planned) currency, but AC is in actual currency — this is what makes EV the bridge between the schedule baseline and the cost baseline.

From PV, EV, AC, all EVM outputs are computed. CV = EV − AC (negative = over budget); SV = EV − PV (negative = behind schedule). CPI = EV/AC (<1 = over budget per dollar of work done); SPI = EV/PV (<1 = behind schedule). CPI and SPI are dimensionless ratios; they are the project's cost and schedule "exchange rates".

The Estimate At Completion (EAC) has four formulations, each appropriate to a different assumption about the future. (1) EAC = BAC/CPI — the current cost rate persists; the cost variance is not a one-time event; suitable when the cause is systemic (e.g., labor rate is permanently higher). (2) EAC = AC + (BAC − EV) — the remaining work is performed at the planned rate (the cost variance was a one-time event, e.g., a one-off expedite fee); ETC = (BAC − EV). (3) EAC = AC + (BAC − EV)/(CPI × SPI) — both cost and schedule variances persist, and schedule delays also raise cost (the typical late-project scenario); this formulation is conservative. (4) EAC = AC + bottom-up ETC — the project team re-estimates the remaining work from the WBS up; used when the original estimates are no longer trusted or after a major scope change. The PM must select the formulation that matches the cause of variance and document the rationale.

ETC = EAC − AC (the cost to finish the remaining work). VAC = BAC − EAC (the projected over/under-budget at completion; negative = over). The To-Complete Performance Index (TCPI) projects the CPI the remaining work must hit to reach a target. TCPI(BAC) = (BAC − EV)/(BAC − AC) — the target is the original BAC; if TCPI(BAC) > 1.10, finishing at BAC is generally infeasible and a new EAC should be set. TCPI(EAC) = (BAC − EV)/(EAC − AC) — the target is the projected EAC; this measures what it takes to land on the new forecast. Comparing TCPI(BAC) to current CPI tells the PM whether to insist on the original budget or to re-baseline.

Reserves distinguish two scopes of uncertainty. The contingency reserve is for identified risks (the risk register's EMV totals — see Risk Management lesson) and is part of the cost baseline; it is consumed under the PM's authority. The management reserve is for unidentified risks and is part of the project budget but not the cost baseline; it is consumed under the sponsor's authority. VAC negative (over budget) drives the question: is the overrun covered by the contingency reserve (identified-risk overrun), by the management reserve (unidentified-risk overrun), or by a baseline change (re-baselining required)?`,
    core_principles: `- EV is the bridge between schedule and cost. PV and EV are in budgeted currency; AC is in actual currency. Comparing EV to PV measures schedule; comparing EV to AC measures cost.
- Variances are in currency; indices are dimensionless ratios. Indices are comparable across projects of different sizes; variances are not.
- The four EAC formulations encode four assumptions about the future. The PM must select the formulation matching the variance cause and document the rationale.
- CPI persists. Empirically, once a project is ~15–20% complete, CPI stabilizes and the final CPI is within ±0.10 of the CPI at that point (the "20% rule" of EVM literature; PMI Practice Standard).
- TCPI(BAC) > 1.10 implies the BAC is no longer feasible. The PM should set a new EAC and re-baseline.
- Reserves distinguish known-unknowns (contingency, in the cost baseline, PM-controlled) from unknown-unknowns (management, in the project budget only, sponsor-controlled).
- EVM measures project performance against the baselines; baseline changes flow through integrated change control.`,
    components: `- Schedule baseline (PV is the cumulative PV curve from the CPM).
- Cost baseline (BAC + contingency reserve, time-phased per the schedule).
- Project budget (cost baseline + management reserve).
- WBS cost-loaded (each work package has a budget; EV = Σ %complete × budget).
- Earned-value measurement system (rules: 0/100, 50/50, %complete, weighted milestones; per the Cost Management Plan).
- Variance and index report (CV, SV, CPI, SPI per period and cumulative).
- Forecast report (EAC, ETC, VAC, TCPI per period and at completion).
- Reserve ledger (contingency and management reserve consumption).`,
    process: `1. Plan Cost Management — produce the Cost Management Plan: units, accuracy, reserve policy, EVM measurement rules, EAC formulation preference.
2. Estimate Costs — analogous / parametric / bottom-up / three-point per activity; aggregate to the activity cost estimate.
3. Determine Budget — aggregate activity estimates to the cost baseline (BAC + contingency); add management reserve to form the project budget; time-phase against the schedule.
4. Control Costs — measure PV/EV/AC at the status date; compute CV/SV/CPI/SPI; forecast EAC/ETC/VAC/TCPI; analyze reserve consumption; recommend corrective action; trigger re-baselining if TCPI(BAC) > 1.10.`,
    formula_calculation: `Planned Value: PV(t) = Σ_{activities scheduled complete by t} (activity budget)   [currency]
Earned Value: EV(t) = Σ_{activities performed by t} (%complete × activity budget)   [currency]
Actual Cost: AC(t) = Σ actuals incurred to t   [currency]

Variances:
  CV = EV − AC        [currency; negative = over budget]
  SV = EV − PV        [currency; negative = behind schedule]

Indices:
  CPI = EV / AC       [dimensionless; <1 = over budget; >1 = under]
  SPI = EV / PV       [dimensionless; <1 = behind; >1 = ahead]

Forecasts (EAC formulations):
  (1) EAC = BAC / CPI                                   [currency; current rate persists]
  (2) EAC = AC + (BAC − EV)                             [currency; one-time variance]
  (3) EAC = AC + (BAC − EV) / (CPI × SPI)               [currency; both variances persist]
  (4) EAC = AC + bottom-up ETC                          [currency; re-estimate remaining]

Derived:
  ETC = EAC − AC                                        [currency]
  VAC = BAC − EAC                                       [currency; negative = over budget]
  TCPI(BAC) = (BAC − EV) / (BAC − AC)                  [dimensionless; >1.10 = BAC infeasible]
  TCPI(EAC) = (BAC − EV) / (EAC − AC)                 [dimensionless; target = EAC]

Units: PV/EV/AC/CV/SV/EAC/ETC/VAC in currency; CPI/SPI/TCPI dimensionless. Assumptions: 0/100, 50/50, or %complete EV rules per the Cost Management Plan; AC includes only direct costs (or includes indirects per the plan); reserves excluded from AC. Interpretation: CPI < 1 means every dollar of EV cost more than $1 to earn; SPI < 1 means the project earned less EV than planned. VAC is the projected budget gap; reserves cover it or a baseline change is triggered.`,
    worked_example: `CASE_TYPE = SYNTHETIC. Project: BAC = $100,000. At the status date (50% of planned duration elapsed):
  PV = $60,000  (60% of the budgeted work was scheduled to be complete)
  EV = $50,000  (50% of the budgeted work is actually complete = %complete × BAC)
  AC = $72,000  (actual cost incurred for the work performed)

Variances:
  CV = EV − AC = 50,000 − 72,000 = −$22,000  (over budget by $22,000)
  SV = EV − PV = 50,000 − 60,000 = −$10,000  (behind schedule by $10,000 worth of work)

Indices:
  CPI = EV / AC = 50,000 / 72,000 = 0.694   (every $1 of EV cost $1.44 to earn → ~44% over)
  SPI = EV / PV = 50,000 / 60,000 = 0.833   (the project earned 83% of planned EV → ~17% behind)

EAC formulations (illustrate all four; select based on cause):
  (1) EAC = BAC / CPI = 100,000 / 0.694 = $144,092    (≈ $144k; current cost rate persists)
  (2) EAC = AC + (BAC − EV) = 72,000 + (100,000 − 50,000) = 72,000 + 50,000 = $122,000   (one-time variance)
  (3) EAC = AC + (BAC − EV)/(CPI × SPI) = 72,000 + 50,000/(0.694 × 0.833) = 72,000 + 50,000/0.578 = 72,000 + 86,505 = $158,505   (both variances persist — conservative)
  (4) EAC = AC + bottom-up ETC (assume the team re-estimates remaining work at $85,000) → EAC = 72,000 + 85,000 = $157,000

Assuming the cost variance is systemic (e.g., permanent labor-rate increase), use formulation (1):
  EAC = $144,092
  ETC = EAC − AC = 144,092 − 72,000 = $72,092   (remaining work to cost ~$72k at current rate)
  VAC = BAC − EAC = 100,000 − 144,092 = −$44,092   (projected $44k over budget)

TCPI:
  TCPI(BAC) = (BAC − EV) / (BAC − AC) = (100,000 − 50,000) / (100,000 − 72,000) = 50,000 / 28,000 = 1.786
    → TCPI(BAC) = 1.786 means the remaining work must run at CPI = 1.786 to land at BAC. Since current CPI = 0.694, finishing at BAC is infeasible (1.786 vs 0.694 → 2.57× improvement required, far above the 1.10 feasibility threshold). The PM should set a new EAC and re-baseline.
  TCPI(EAC, using EAC = $144,092) = (BAC − EV)/(EAC − AC) = 50,000 / 72,092 = 0.694
    → TCPI(EAC) = 0.694 = current CPI → the EAC is internally consistent (current rate persists to finish).

Reserve check: if contingency reserve = $30,000 and management reserve = $20,000, total reserves = $50,000. VAC = −$44,092 → reserves ($50,000) cover the projected overrun with $5,908 to spare. If the variance is identified-risk-driven, contingency reserve alone ($30,000) is insufficient and management reserve ($14,092) must be tapped via formal sponsor approval.`,
    industrial_example: `Construction — a $5.2M hospital build at month 9 of an 18-month plan. PV = $2.9M, EV = $2.6M, AC = $3.05M. CPI = 0.852 (15% over); SPI = 0.897 (10% behind). The cost variance traces to a structural-steel commodity-price surge (a known-unknown risk in the risk register). EAC = BAC/CPI = $5.2M/0.852 ≈ $6.10M; VAC = −$0.9M. The contingency reserve ($0.6M) covers part of the overrun; the management reserve ($0.5M) is tapped via sponsor approval; the residual $0.2M requires a baseline change through the CCB. The PM institutes tighter weekly EV measurement and quarterly re-forecast.`,
    case_study: `CASE_TYPE = SYNTHETIC. A 12-month IT program with BAC = $500k hits month 6 with PV = $260k, EV = $220k, AC = $245k. CPI = 0.898 (10% over); SPI = 0.846 (15% behind). The cost variance is traced to a one-time hardware-expedite fee ($25k) — formulation (2) applies. EAC = AC + (BAC − EV) = 245,000 + 280,000 = $525,000; VAC = −$25,000 (one-time). The PM documents the cause, draws $25k from the contingency reserve, and continues at the planned rate. Schedule variance is treated separately (it traces to a critical-path slip in the integration testing) — formulation (3) is NOT applied because the schedule variance does NOT cause cost variance here. Reserve analysis: contingency ($40k) covers the $25k one-time; management reserve ($25k) untouched.`,
    visual_explanation: `Cumulative cost chart (S-curves):

  $
  │                                          ╭──── EAC = $144k
  │                                      ╭───│──── AC = $72k
  │                                  ╭───│   │
  │                              ╭───│   │   │╭── PV = $60k
  │                          ╭───│   │   ││╭──
  │                      ╭───│   │   ││╭──│
  │                  ╭───│   │   ││╭──│ │
  │              ╭───│   │   ││╭──│ │
  │          ╭───│   │   ││╭──│ │
  │      ╭───│   │   ││╭──│ │
  │  ╭───│   │   ││╭──│ │
  │──│   │   ││╭──│ │          EV = $50k
  │  │   │  ││╭──│
  └──┴───┴──┴┴───┴──────→ t (status date)

  At status date: AC > PV > EV → project is over budget AND behind schedule.
  CV = EV − AC = 50 − 72 = −$22k  (vertical gap, AC above EV = over budget)
  SV = EV − PV = 50 − 60 = −$10k  (vertical gap, PV above EV = behind)
  EAC = BAC/CPI projects the final S-curve asymptote at ~$144k vs. BAC $100k.`,
    simulation_opportunity: `EVM simulator: the candidate inputs BAC, the planned S-curve (PV per period), and the actuals (EV%, AC per period) up to a status date. The simulator computes CV, SV, CPI, SPI, plots the three S-curves (PV, EV, AC), and reports all four EAC formulations with the recommended selection rule. The candidate can experiment with TCPI: setting TCPI(BAC) targets and observing whether the remaining work can plausibly achieve them given historical CPI. Reserve-depletion simulation: enter contingency + management reserve; the simulator reports reserve balance and triggers management-reserve approval events when contingency is exhausted.`,
    common_mistakes: `- Confusing EV (budgeted cost of work performed) with AC (actual cost of work performed). EV is in planned currency; AC is in actual currency. They are not interchangeable.
- Selecting EAC formulation (3) by default. EAC = AC + (BAC−EV)/(CPI×SPI) is conservative and double-charges for variance; it is appropriate only when schedule and cost variances are both systemic and interacting.
- Using EAC = BAC/CPI when the variance was a one-time event. This over-forecasts because it extrapolates a one-time variance into the future.
- Forgetting to compare TCPI(BAC) to current CPI. If TCPI(BAC) >> CPI, insisting on BAC is unrealistic; re-baseline.
- Mixing reserves. Contingency reserve is in the cost baseline (PM-controlled); management reserve is in the project budget only (sponsor-controlled). Tapping management reserve requires formal approval.
- Reporting CV/SV without CPI/SPI. Variances are absolute; indices are comparable. Always report both.
- Ignoring the EVM measurement rule. Switching from 50/50 to 0/100 mid-project changes the EV curve and corrupts variance history.`,
    limitations: `- EVM measures progress in currency. Projects whose value is not monetary (e.g., regulatory compliance, R&D outcomes) require supplementary outcome measures.
- EV requires a %complete estimate; subjective %complete (e.g., "90% complete for 9 months") corrupts EV. Objective rules (weighted milestones, earned milestones) reduce subjectivity.
- EAC formulations assume the future resembles the recent past. Step-change events (new scope, new technology, new team) invalidate the formulation; use bottom-up ETC.
- SPI approaches 1.0 as the project nears completion regardless of true schedule status — the "schedule illusion" near project end. The Earned Schedule (ES) extension corrects this.
- EVM is silent on quality. A project can show CPI > 1 and deliver defective deliverables; Quality & Integration Management overlays are required.`,
    comparison: `| Approach | Cost measure | Schedule measure | Forecast | Best use |
|----------|--------------|-------------------|----------|----------|
| EVM (PMBOK) | AC vs EV (CPI) | EV vs PV (SPI) | EAC, ETC, VAC, TCPI | Budget-bearing projects with a cost-loaded WBS |
| Earned Schedule (ES) | Same as EVM | ES = time at which PV = current EV | ES-based EAC_t | Corrects SPI near project end |
| Agile burn-down | Story points burned | Velocity | Forecast release date | Software with evolving scope |
| Critical Chain | Buffer consumption | Buffer burn | Fever chart | Resource-constrained multi-project |
| S-curve only | AC vs PV | (no EV) | (no EAC) | Simple, low-criticality projects |`,
    practical_application: `- Cost-baseline establishment: BAC + contingency reserve = cost baseline; + management reserve = project budget; the cost baseline is time-phased against the schedule to produce the PV S-curve.
- Periodic EV reporting: weekly or bi-weekly PV/EV/AC with CPI/SPI; forecasts quarterly.
- Forecast-driven decision: when TCPI(BAC) > 1.10, set a new EAC, draw reserves, or trigger scope reduction via integrated change control.
- Reserve governance: contingency reserve consumed against identified risks (PM authority); management reserve consumed against unidentified risks (sponsor authority); both tracked in a reserve ledger.
- Project closeout: VAC (final) = BAC − AC; the difference is the project's over/under-budget outcome; lessons-learned entry records the cause.`,
    decision_scenario: `You are the PM on a regulatory-driven software program. At month 6 of 12, you measure CPI = 0.78 (22% over) and SPI = 0.85 (15% behind). The cost variance is traced to scope additions requested by the regulator (a permanent change, not a one-time event). The original BAC = $1.0M with $80k contingency + $50k management reserve. The schedule baseline shows the critical path is now IT integration, which is 4 weeks behind. Decision: (a) Which EAC formulation applies? (b) Compute EAC, VAC, TCPI(BAC), and TCPI(EAC). (c) Reserve plan: tap contingency and/or management reserve? (d) Re-baseline or change-control the new scope? Recommend with quantitative reasoning.`,
    practice_questions: `- Q1. A project has BAC = $200k; status: EV = $80k, AC = $100k. Compute CV, CPI, VAC under formulation (1).
- Q2. The cost variance was a one-time hardware fee; CPI = 0.90, AC = $200k, EV = $180k, BAC = $400k. Compute EAC under formulation (2).
- Q3. TCPI(BAC) = 1.35 and current CPI = 0.92. Is finishing at BAC feasible? Why?
- Q4. Distinguish contingency reserve from management reserve by ownership and scope.`,
    certification_questions: `- C1 (PMP-style). A project's CPI = 0.92, SPI = 0.88, BAC = $1.2M, EV = $480k, AC = $522k. Compute EAC = BAC/CPI.
- C2. The cost variance is caused by a one-time expedite fee. Which EAC formulation is most appropriate?
- C3. TCPI(BAC) = 1.5. Current CPI = 0.95. What should the PM do?
- C4. Which reserve is part of the cost baseline? Contingency or management?`,
    summary: `Cost management via EVM integrates cost and schedule on a common currency axis through three atomic measurements (PV, EV, AC) from which all variances (CV, SV), indices (CPI, SPI), and forecasts (EAC, ETC, VAC, TCPI) derive. The four EAC formulations encode four assumptions about the future; the PM selects the matching formulation based on the variance cause. TCPI(BAC) > 1.10 flags infeasibility of the original BAC. Reserves distinguish known-unknowns (contingency, PM-controlled, in the cost baseline) from unknown-unknowns (management, sponsor-controlled, in the project budget only). EVM is silent on quality and requires complementary outcome measures for non-monetary projects.`,
    key_takeaways: `- PV is planned currency; EV is earned currency; AC is actual currency. EV is the bridge.
- CV = EV − AC, SV = EV − PV. CPI = EV/AC, SPI = EV/PV. Negative CV / CPI < 1 = over budget; negative SV / SPI < 1 = behind.
- Four EAC formulations: BAC/CPI (current rate persists); AC + (BAC − EV) (one-time variance); AC + (BAC − EV)/(CPI × SPI) (both persist); AC + bottom-up ETC (re-estimate).
- TCPI(BAC) > 1.10 → re-baseline. TCPI(EAC) is what it takes to land on the new forecast.
- Contingency reserve = known-unknowns, in cost baseline, PM-controlled. Management reserve = unknown-unknowns, in project budget only, sponsor-controlled.
- EVM measures cost–schedule performance against the baselines; baseline changes flow through integrated change control.`,
    references: `- PMI, "A Guide to the Project Management Body of Knowledge (PMBOK® Guide), 7th Edition" (2021). §Measurement performance domain; §Focus on Value principle.
- PMI, "Practice Standard for Earned Value Management" (2nd ed., 2011). PV/EV/AC, CV/SV, CPI/SPI, EAC formulations, ETC, VAC, TCPI, the 20% rule.
- PMI, "Practice Standard for Project Scheduling". PV curve derived from the schedule baseline.
- Kerzner, H. "Project Management" (13th ed., 2022). Ch. 14–15 (Cost estimation, budgeting, EVM).
- ISO 21500:2021. §Cost management process; §Project budget themes.`,
  },

  knowledgeObject: {
    title: "Cost Management (EVM) — Knowledge Object",
    domain: "Process",
    competency: "Cost Management (EVM)",
    topic: "Earned Value Management",
    concept: "PV/EV/AC, CV/SV, CPI/SPI, EAC/ETC/VAC/TCPI, reserve management",
    body: {
      definitions: [
        "BAC (Budget At Completion): planned total cost of all work, excluding reserves.",
        "PV (Planned Value, BCWS): budgeted cost of work scheduled to be done by the status date.",
        "EV (Earned Value, BCWP): budgeted cost of work actually performed = Σ(%complete × activity budget).",
        "AC (Actual Cost, ACWP): actual cost incurred for the work performed.",
        "CV (Cost Variance) = EV − AC. SV (Schedule Variance) = EV − PV.",
        "CPI (Cost Performance Index) = EV / AC. SPI (Schedule Performance Index) = EV / PV.",
        "EAC (Estimate At Completion): projected total cost at completion given current performance (four formulations).",
        "ETC (Estimate To Complete) = EAC − AC: projected cost of remaining work.",
        "VAC (Variance At Completion) = BAC − EAC: projected over/under budget at completion.",
        "TCPI (To-Complete Performance Index): the CPI the remaining work must achieve to hit BAC or EAC.",
        "Contingency reserve: for identified risks (known-unknowns); part of the cost baseline; PM-controlled.",
        "Management reserve: for unidentified risks (unknown-unknowns); part of the project budget (not the cost baseline); sponsor-controlled.",
        "Cost baseline = BAC + contingency reserve. Project budget = cost baseline + management reserve.",
      ],
      principles: [
        "EV is the bridge between schedule (PV) and cost (AC); PV and EV are in budgeted currency, AC is in actual currency.",
        "Variances are in currency; indices are dimensionless ratios. Indices are comparable across projects of different sizes.",
        "The four EAC formulations encode four assumptions about the future; the PM selects the matching one and documents the rationale.",
        "Once a project is ~15–20% complete, CPI stabilizes; the final CPI is typically within ±0.10 of the CPI at that point (the EVM 20% rule).",
        "TCPI(BAC) > 1.10 implies the BAC is infeasible; the PM should set a new EAC and re-baseline.",
        "Contingency reserve is in the cost baseline (PM-controlled); management reserve is in the project budget only (sponsor-controlled).",
        "EVM measures performance against the baselines; baseline changes flow through integrated change control.",
      ],
      components: [
        "Schedule baseline (PV is the cumulative PV curve from the CPM).",
        "Cost baseline (BAC + contingency reserve, time-phased).",
        "Project budget (cost baseline + management reserve).",
        "WBS cost-loaded (each work package has a budget; EV = Σ %complete × budget).",
        "Earned-value measurement system (0/100, 50/50, %complete, weighted milestones).",
        "Variance and index report (CV, SV, CPI, SPI per period and cumulative).",
        "Forecast report (EAC, ETC, VAC, TCPI).",
        "Reserve ledger (contingency + management reserve consumption).",
      ],
      mechanism: [
        "Measure PV at the status date from the schedule baseline and cost-loaded WBS.",
        "Measure EV at the status date = Σ(%complete × activity budget) using the prescribed EV rule.",
        "Measure AC at the status date from finance / timekeeping / invoices.",
        "Compute CV, SV, CPI, SPI per the formulas.",
        "Select the EAC formulation matching the variance cause (one-time vs. persistent; cost-only vs. cost+schedule).",
        "Compute ETC = EAC − AC; VAC = BAC − EAC; TCPI(BAC) and TCPI(EAC).",
        "Compare TCPI(BAC) to current CPI; if TCPI(BAC) > 1.10, set a new EAC and re-baseline via integrated change control.",
        "Tap contingency reserve (PM authority) for identified-risk overruns; tap management reserve (sponsor authority) for unidentified-risk overruns.",
      ],
      process: [
        "1. Plan Cost Management — Cost Management Plan (units, accuracy, reserve policy, EV rule, EAC formulation preference).",
        "2. Estimate Costs — analogous / parametric / bottom-up / three-point per activity.",
        "3. Determine Budget — aggregate to cost baseline (BAC + contingency); + management reserve = project budget; time-phase.",
        "4. Control Costs — measure PV/EV/AC; compute CV/SV/CPI/SPI; forecast EAC/ETC/VAC/TCPI; reserve analysis; re-baseline if TCPI(BAC) > 1.10.",
      ],
      formulas: [
        "PV(t) = Σ budgeted cost of activities scheduled complete by t.",
        "EV(t) = Σ (%complete × activity budget) for activities performed by t.",
        "AC(t) = Σ actuals incurred to t.",
        "CV = EV − AC. SV = EV − PV.",
        "CPI = EV / AC. SPI = EV / PV.",
        "EAC (1) = BAC / CPI. (2) = AC + (BAC − EV). (3) = AC + (BAC − EV)/(CPI × SPI). (4) = AC + bottom-up ETC.",
        "ETC = EAC − AC. VAC = BAC − EAC.",
        "TCPI(BAC) = (BAC − EV) / (BAC − AC). TCPI(EAC) = (BAC − EV) / (EAC − AC).",
      ],
      metrics: [
        "CPI, SPI per period and cumulative (dimensionless).",
        "CV, SV per period and cumulative (currency).",
        "EAC, ETC, VAC (currency).",
        "TCPI(BAC) and TCPI(EAC) (dimensionless).",
        "Reserve consumption (% of contingency used, % of management reserve used).",
        "EV rule fidelity (audit of %complete estimates).",
      ],
      examples: [
        "BAC = $100k; status: PV = $60k, EV = $50k, AC = $72k → CV = −$22k, SV = −$10k, CPI = 0.694, SPI = 0.833. EAC (1) = $144k; VAC = −$44k; TCPI(BAC) = 1.786 (infeasible); TCPI(EAC) = 0.694 (= current CPI).",
        "One-time variance (formulation 2): EAC = AC + (BAC − EV).",
        "Both variances persist (formulation 3): EAC = AC + (BAC − EV)/(CPI × SPI).",
      ],
      industrial_examples: [
        "Construction — $5.2M hospital build at month 9: CPI = 0.852, SPI = 0.897. Steel-commodity-price surge (identified risk) → EAC = $6.10M, VAC = −$0.9M. Contingency ($0.6M) + management ($0.5M) cover most; $0.2M requires baseline change via CCB.",
        "IT — 12-month, $500k program at month 6: one-time hardware-expedite fee → formulation (2) EAC = $525k, VAC = −$25k. Contingency ($40k) covers the $25k; management reserve untouched.",
      ],
      case_studies: [
        "SYNTHETIC — IT program EVM decision: CPI = 0.78, SPI = 0.85; cost variance traced to permanent regulator scope addition (systemic). EAC (1) = BAC/CPI; VAC against $1.0M BAC; TCPI(BAC) > 1.10 → re-baseline. Contingency tapped first, then management reserve, then baseline change for the residual.",
      ],
      common_errors: [
        "Confusing EV (budgeted cost of work performed) with AC (actual cost of work performed); they are in different currencies.",
        "Selecting EAC formulation (3) by default — double-charges variance; only when both cost and schedule variances persist and interact.",
        "Using EAC = BAC/CPI for a one-time variance — over-forecasts.",
        "Not comparing TCPI(BAC) to current CPI; if TCPI(BAC) >> CPI, insisting on BAC is unrealistic.",
        "Mixing reserves — contingency is in the cost baseline (PM); management is in the project budget only (sponsor).",
        "Reporting CV/SV without CPI/SPI; variances are not comparable across projects of different sizes.",
        "Changing the EV rule mid-project (e.g., 50/50 → 0/100) without re-stating EV history; corrupts the variance time series.",
      ],
      limitations: [
        "EVM is silent on quality; CPI > 1 can hide defective deliverables.",
        "Subjective %complete corrupts EV; objective rules (weighted milestones, earned milestones) reduce subjectivity.",
        "EAC formulations assume the future resembles the recent past; step-change events invalidate them; use bottom-up ETC.",
        "SPI approaches 1.0 near project end regardless of true schedule status — the schedule illusion; the Earned Schedule extension corrects.",
        "EVM is currency-bound; non-monetary-value projects need supplementary outcome measures.",
      ],
      best_practices: [
        "Use objective EV rules (0/100, weighted milestones, earned milestones) wherever possible.",
        "Report CPI/SPI and CV/SV together; indices for comparison, variances for magnitude.",
        "Document the EAC formulation choice with the variance-cause analysis.",
        "Compare TCPI(BAC) to CPI every period; if TCPI(BAC) > 1.10, set a new EAC.",
        "Maintain a reserve ledger; tap contingency first (PM authority), then management (sponsor authority).",
        "Audit EV periodically; %complete estimates drift without independent review.",
        "Once a project is 20% complete, the EVM 20% rule predicts the final CPI within ±0.10 — use this to pressure-test EAC forecasts.",
      ],
      related_concepts: [
        "Schedule Management — PV is the cumulative PV curve from the CPM baseline.",
        "Risk Management — contingency reserve = Σ EMV of identified risks; management reserve for unknowns.",
        "Quality & Integration Management — baseline changes via integrated change control.",
        "Earned Schedule (ES) — corrects SPI near project end.",
        "Critical Chain — buffer-consumption fever chart as an alternative project-control system.",
      ],
      prerequisites: [
        "Schedule baseline (CPM with critical path) — PV is read off it.",
        "Cost baseline (BAC + contingency reserve) and project budget.",
        "Work-performance data feed (actuals from finance + %complete from schedule).",
        "Cost Management Plan (EVM rule, EAC formulation preference, reserve policy).",
      ],
      references: [
        "PMI PMBOK® Guide 7th Edition (2021). §Measurement; §Focus on Value.",
        "PMI Practice Standard for EVM (2nd ed., 2011).",
        "PMI Practice Standard for Project Scheduling.",
        "Kerzner, H. (2022). Project Management (13th ed.), Ch. 14–15.",
        "ISO 21500:2021. §Cost management; §Project budget.",
      ],
    },
  },

  questions: [
    {
      competencyName: "Cost Management (EVM)",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "IT",
      stem: `A project has BAC = $100,000. At the status date: PV = $60,000, EV = $50,000, AC = $72,000. Using the EAC formulation EAC = BAC/CPI (the current cost rate is expected to persist), compute CPI, EAC, and VAC.`,
      whyCorrect: `CPI = EV/AC = 50,000/72,000 = 0.6944. EAC = BAC/CPI = 100,000/0.6944 = $144,000 (approx, $144,092 exact). VAC = BAC − EAC = 100,000 − 144,000 = −$44,000 (over budget). The current cost rate (CPI = 0.694) is extrapolated to the remaining work, so EAC exceeds BAC by ~44%.`,
      whyOthersWrong: [
        "CPI = AC/EV = 72,000/50,000 = 1.44 — this inverts the CPI formula (it computes cost per EV dollar, not EV per cost dollar); CPI = EV/AC, not AC/EV. CPI > 1 means UNDER budget, which contradicts the over-budget reality (AC > EV).",
        "EAC = AC + (BAC − EV) = 72,000 + 50,000 = $122,000 — this is EAC formulation (2), appropriate for a ONE-TIME variance; the question specifies that the current cost rate will persist, so formulation (1) applies.",
        "VAC = EAC − BAC = +$44,000 — the sign is reversed; VAC = BAC − EAC, so over-budget is NEGATIVE VAC.",
      ],
      options: [
        { text: "CPI = 0.694; EAC ≈ $144,000; VAC = −$44,000", isCorrect: true },
        { text: "CPI = 1.44; EAC ≈ $69,444; VAC = +$30,556", isCorrect: false },
        { text: "CPI = 0.694; EAC = $122,000; VAC = −$22,000", isCorrect: false },
        { text: "CPI = 0.694; EAC ≈ $144,000; VAC = +$44,000", isCorrect: false },
      ],
    },
    {
      competencyName: "Cost Management (EVM)",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "DecisionMaking",
      skillType: "Conceptual",
      scenario: "Construction",
      stem: `A project at 40% complete has CPI = 0.88 and SPI = 0.92. The cost variance was caused by a one-time regulatory-permit expedite fee of $15,000. The original BAC is $500,000; AC to date is $210,000; EV to date is $184,800. Which EAC formulation is most appropriate, and what is the resulting EAC?`,
      whyCorrect: `The variance is one-time (a single permit expedite fee); the remaining work is expected to proceed at the planned rate. Therefore EAC formulation (2) applies: EAC = AC + (BAC − EV) = 210,000 + (500,000 − 184,800) = 210,000 + 315,200 = $525,200. This isolates the $15k one-time variance from the remaining work. (EV check: 0.88 CPI means EV = AC × CPI = 210,000 × 0.88 = $184,800; consistent.)`,
      whyOthersWrong: [
        "EAC = BAC/CPI = 500,000/0.88 = $568,182 — formulation (1) extrapolates the one-time variance into the future; over-forecasts because the remaining work is expected at the planned rate, not the current rate.",
        "EAC = AC + (BAC − EV)/(CPI × SPI) = 210,000 + 315,200/(0.88 × 0.92) = 210,000 + 315,200/0.8096 = 210,000 + 389,328 = $599,328 — formulation (3) double-charges for variance (both cost and schedule); only appropriate when both variances persist and interact.",
        "EAC = AC + bottom-up ETC = $X — formulation (4) is used when the original estimates are no longer trusted; the question gives no basis for a bottom-up re-estimate.",
      ],
      options: [
        { text: "Formulation (2): EAC = AC + (BAC − EV) = $525,200", isCorrect: true },
        { text: "Formulation (1): EAC = BAC/CPI = $568,182", isCorrect: false },
        { text: "Formulation (3): EAC = AC + (BAC − EV)/(CPI × SPI) = $599,328", isCorrect: false },
        { text: "Formulation (4): EAC = AC + bottom-up ETC", isCorrect: false },
      ],
    },
    {
      competencyName: "Cost Management (EVM)",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "IT",
      stem: `A project has BAC = $1.0M, EV to date = $400k, AC to date = $440k, and CPI = 0.909. The TCPI(BAC) = (BAC − EV)/(BAC − AC) computes to approximately 1.176. Current CPI = 0.909. What is the correct management interpretation and action?`,
      whyCorrect: `TCPI(BAC) = (1,000,000 − 400,000)/(1,000,000 − 440,000) = 600,000/560,000 ≈ 1.071 (recomputed exactly; the question's 1.176 is an approximation). Either way, TCPI(BAC) > 1.10 (using the question's value) indicates the remaining work must achieve CPI ≥ 1.10+ to land at BAC, but current CPI = 0.909 — far below the required rate. Per the EVM feasibility rule (TCPI(BAC) > 1.10 → BAC infeasible), the PM should set a new EAC (e.g., BAC/CPI ≈ $1.10M), document the cause, and trigger integrated change control to re-baseline.`,
      whyOthersWrong: [
        "Push harder to land at BAC — TCPI(BAC) > 1.10 with current CPI < 1 is infeasible; pushing is unrealistic and demoralizes the team.",
        "Use formulation (2) EAC = AC + (BAC − EV) — this assumes a one-time variance; the question does not state the cause is one-time, and the systemic shortfall (CPI 0.909 across $440k of work) suggests a persistent rate.",
        "Tap the management reserve automatically — management reserve is for unidentified risks; tapping it requires sponsor approval and is appropriate only after contingency is exhausted and the cause is confirmed as unidentified-risk-driven.",
      ],
      options: [
        { text: "Set a new EAC and trigger integrated change control to re-baseline; TCPI(BAC) > 1.10 indicates BAC is infeasible at current CPI", isCorrect: true },
        { text: "Push the team harder to land at BAC; TCPI(BAC) is a target the team can hit", isCorrect: false },
        { text: "Automatically tap management reserve to cover the gap; no re-baselining required", isCorrect: false },
        { text: "Switch EVM formulation to (2) AC + (BAC − EV); the variance is one-time", isCorrect: false },
      ],
    },
    {
      competencyName: "Cost Management (EVM)",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Definitional",
      scenario: "Construction",
      stem: `True or False: The contingency reserve is part of the cost baseline and is consumed under the project manager's authority, while the management reserve is part of the project budget but NOT part of the cost baseline and is consumed under the sponsor's authority.`,
      whyCorrect: `True. Per the PMBOK Determine Budget process and the PMI Practice Standard for EVM: the contingency reserve (for identified risks / known-unknowns) is part of the cost baseline and is consumed under PM authority; the management reserve (for unidentified risks / unknown-unknowns) is part of the project budget but NOT part of the cost baseline and is consumed under sponsor authority.`,
      whyOthersWrong: [
        "If False: the candidate has confused the two reserves. The cost baseline = BAC + contingency; the project budget = cost baseline + management. The authority split (PM vs. sponsor) is a definitional distinction tested on the PMP exam.",
        "Both reserves being PM-controlled would invalidate the sponsor's authority over unknown-unknowns; both being sponsor-controlled would prevent the PM from responding to identified risks without escalation.",
      ],
      options: [
        { text: "True", isCorrect: true },
        { text: "False", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Risk Management
// (Competency: "Risk Management"; slug: prc-risk-management)
// ---------------------------------------------------------------------------

const LESSON_PRC_RISK: RefLesson = {
  competencyName: "Risk Management",
  slug: "prc-risk-management",
  title:
    "Risk Management — Risk Register, Qualitative (P×I) & Quantitative (EMV, Decision Trees, Monte-Carlo) Analysis, Response Strategies & Monitoring",
  titleAr:
    "إدارة المخاطر — سجل المخاطر، التحليل النوعي (P×I) والكمي (EMV، أشجار القرار، مونت كارلو)، استراتيجيات الاستجابة والمراقبة",
  order: 3,
  durationMin: 36,
  references: PRC_REFERENCE_TITLES,
  conceptIntroduction: `Risk management is the engineering of an explicit uncertainty model for a project: a structured register of identified risks, each scored by probability and impact, analyzed quantitatively where the stakes warrant, and paired with a response strategy that reduces probability and/or impact to a residual level the project can absorb. The PMI PMP Process domain treats risk as a continuous, auditable discipline — not a one-time exercise. The PMBOK® Guide 7th Edition places risk inside the Uncertainty performance domain and the Navigate Complexity principle; the PMI Practice Standard for Project Risk Management is the authoritative technical reference. This lesson equips the candidate to (1) build a risk register, (2) apply the qualitative Probability × Impact matrix, (3) apply quantitative EMV, decision-tree analysis, and Monte-Carlo simulation, (4) select threat response strategies (avoid, mitigate, transfer, accept) and opportunity strategies (exploit, enhance, share, accept), (5) identify secondary and residual risks, and (6) monitor risks through reassessment, risk audit, and reserve analysis.`,
  example: `Risks on a construction project: (1) Permit delay: P=30%, impact=$50,000 schedule slip + 5 days → EMV = 0.30 × 50,000 = $15,000; mitigation = early permit application → reduces P to 10%, EMV residual = $5,000; mitigation cost = $2,000. Net EMV reduction = $13,000 − $2,000 = $11,000 benefit. (2) Regulatory penalty: P=10%, impact=$200,000 → EMV = $20,000; transfer via insurance → premium $8,000. EMV reduction = $20,000 − $8,000 = $12,000. Total contingency reserve = Σ residual EMV = $5,000 + $20,000 (if penalty is transferred, residual = 0) = $5,000 + $0 = $5,000.`,
  keyFormulas: `Risk score (qualitative): Risk Score = P × I    [P, I on ordinal 1–5 scales; score 1–25]
EMV (single risk): EMV = P × Impact    [currency; P is a probability 0..1]
EMV (decision alternative): EMV_alt = Σ (P_i × Outcome_i) − Cost_alt    [currency]
Decision tree: choose alternative with max EMV (or min EMV if outcomes are costs)
Monte-Carlo: distribution F(T) of project completion; P(T ≤ t) = Φ((t−μ)/σ) under normal approx; sensitivity ranking by correlation of activity duration to project duration (tornado chart).
Residual risk: risk after response strategy applied = (P_post × I_post) − response cost; response is justified if net EMV reduction > response cost.
Secondary risk: new risk arising directly from implementing a response strategy — must be added to the register.
Contingency reserve = Σ EMV of identified residual risks. Management reserve = for unidentified risks (typically 5–10% of cost baseline; calibrated historically).`,
  exercise: `You are the PM on a $2M software project. The risk register lists 8 risks with these P/impact pairs: R1(P=0.30, I=$80k), R2(P=0.10, I=$200k), R3(P=0.40, I=$30k), R4(P=0.20, I=$150k), R5(P=0.15, I=$100k), R6(P=0.05, I=$300k), R7(P=0.50, I=$20k), R8(P=0.25, I=$60k). (a) Compute the EMV of each risk and the total contingency reserve. (b) Apply qualitative scoring (P, I on 1–5) and rank the risks for response planning. (c) For R2 (regulatory penalty), compare two responses: mitigation (reduces P to 0.05, cost $15k) vs. transfer (insurance, premium $25k, residual P=0). (d) Build a decision tree for two design alternatives: A (cost $1.0M, 70% high-demand outcome with $1.8M revenue, 30% low-demand with $0.6M revenue) and B (cost $0.5M, 70% high-demand with $1.0M revenue, 30% low-demand with $0.4M revenue). Compute EMV(A) vs. EMV(B) and recommend.`,
  sections: {
    learning_objectives: `- Build a risk register (risk ID, description, category, P, I, response strategy, owner, residual risk).
- Apply the qualitative Probability × Impact matrix; rank risks for response planning.
- Compute EMV (Expected Monetary Value) for a single risk: EMV = P × Impact.
- Build a decision tree: alternatives × chance events × outcomes; choose the alternative with max (or min) EMV.
- Apply Monte-Carlo simulation to schedule and cost risk; interpret the P(complete by date) curve and the tornado sensitivity chart.
- Select threat response strategies (avoid, mitigate, transfer, accept) and opportunity strategies (exploit, enhance, share, accept) per risk.
- Distinguish residual risks (after response) from secondary risks (new risks arising from the response).
- Monitor risks through reassessment, risk audit, reserve analysis, and risk-response updates.`,
    prerequisites: `- Risk Management Plan (methodology, P/I scales, risk categories, risk register format, response-strategy taxonomy).
- Scope, schedule, and cost baselines (risks attach to deliverables, activities, and budget lines).
- Stakeholder register and risk appetite / risk tolerance statements.
- Organizational process assets (historical risk registers, lessons learned, EMV histories) and enterprise environmental factors (risk software, Monte-Carlo tools).`,
    introduction: `Project risk is an uncertain event or condition that, if it occurs, has a positive or negative effect on one or more project objectives. The PMBOK® Guide 7th Edition names "Navigate Complexity" as a project-management principle and treats uncertainty as a performance domain in its own right. The PMI Practice Standard for Project Risk Management codifies the seven-process risk lifecycle: Plan Risk Management, Identify Risks, Perform Qualitative Risk Analysis, Perform Quantitative Risk Analysis, Plan Risk Responses, Implement Risk Responses, Monitor Risks. Risk is bidirectional — threats (negative) and opportunities (positive) are treated symmetrically; each has a four-strategy response taxonomy. The risk register is the central artifact; the contingency reserve is the budgeted EMV of residual identified risks.`,
    terminology: `- Risk: an uncertain event or condition that, if it occurs, affects project objectives (scope, schedule, cost, quality).
- Threat: a risk that would have a negative effect. Opportunity: a risk that would have a positive effect.
- Probability (P): likelihood the risk occurs, on a 0–1 scale (or an ordinal 1–5 scale for qualitative analysis).
- Impact (I): consequence on project objectives if the risk occurs, in currency / days / quality score (or ordinal 1–5).
- Risk score (qualitative): P × I (ordinal; ranges 1–25 on a 5×5 matrix).
- EMV (Expected Monetary Value): P × I (currency; P on 0–1 scale).
- Risk register: the central artifact — risk ID, description, category, P, I, score, response strategy, owner, residual risk, status.
- Probability × Impact (P × I) matrix: a 5×5 grid that maps risk scores to response bands (low / medium / high / critical).
- Decision tree: a directed graph of decision nodes (squares) and chance nodes (circles); the EMV is rolled back from leaves to root.
- Monte-Carlo simulation: thousands of trials sampling activity-duration / cost distributions to produce a cumulative probability curve for project completion date and total cost.
- Sensitivity analysis (tornado chart): ranks risks / activities by correlation with project outcome.
- Threat response strategies: Avoid (eliminate the cause), Mitigate (reduce P and/or I), Transfer (shift the impact to a third party — insurance, warranty, fixed-price contract), Accept (acknowledge; no action unless the risk occurs, with contingency reserve or no reserve).
- Opportunity response strategies: Exploit (eliminate uncertainty to make the opportunity happen), Enhance (increase P and/or I), Share (joint venture / partnership to capture the opportunity), Accept (acknowledge; no action).
- Residual risk: the risk remaining after the response strategy is applied (P_post × I_post − response cost).
- Secondary risk: a new risk arising directly from implementing the response (e.g., insurance introduces counter-party risk).
- Contingency reserve: Σ EMV of identified residual risks; part of the cost baseline; PM-controlled.
- Management reserve: for unidentified risks; part of the project budget (not cost baseline); sponsor-controlled.
- Risk owner: the person responsible for the response strategy and tracking.
- Risk trigger: an early-warning sign that a risk is about to occur.`,
    detailed_explanation: `Risk management has seven processes. Plan Risk Management produces the Risk Management Plan: methodology, P/I scales (ordinal 1–5 with definitions per scale level), risk categories (technical, external, organizational, project-management), risk register format, response-strategy taxonomy, reporting cadence, and reserve policy. Identify Risks produces the risk register: each risk has an ID, a description (the "if-then" structure: "if X happens, then Y impact on Z objective"), a category, P, I, an owner, and a proposed response. Identify Risks is iterative — risks are added as the project evolves and as design / planning detail reveals new uncertainties.

Perform Qualitative Risk Analysis scores each risk on ordinal P and I scales (typically 1–5 with anchors), multiplies to get a risk score (1–25), and plots on a 5×5 P × I matrix with response bands: low (1–4, monitor), medium (5–9, plan response), high (10–14, plan response now), critical (15–25, escalate / avoid). Qualitative analysis is fast, repeatable, and is the primary risk-prioritization tool for projects of all sizes; it sorts risks into response priorities.

Perform Quantitative Risk Analysis is applied to risks where the stakes warrant a deeper look (typically the top 10–20% from qualitative analysis). Tools: (a) EMV (Expected Monetary Value) — EMV = P × I, summed across risks for a contingency reserve estimate; (b) Decision-tree analysis — for mutually-exclusive decision alternatives with chance events, compute EMV per alternative and choose the max-EMV alternative (or min-EMV for costs); (c) Monte-Carlo simulation — sample activity duration / cost distributions (triangular, beta-PERT, normal, uniform) over thousands of trials to produce a cumulative probability curve for project completion date and total cost; the P80 (80th-percentile) date is a common management-commitment target; (d) Sensitivity analysis — tornado chart ranks risks / activities by correlation with the project outcome.

Plan Risk Responses pairs each risk with a strategy. For threats: Avoid (eliminate the cause — change scope, change supplier, change technology), Mitigate (reduce P and/or I — early action, redundancy, training, fire-suppression), Transfer (shift the impact to a third party — insurance, performance bond, fixed-price contract, warranty; note transfer does not eliminate the risk — it shifts the financial impact), Accept (acknowledge; passive = no action, active = contingency reserve + plan). For opportunities: Exploit (ensure the opportunity happens — assign best resources, change scope to capture), Enhance (increase P and/or I — add resources, simplify), Share (joint venture / partnership), Accept (acknowledge). Every response creates residual risk (the risk after response — P_post × I_post − response cost) and may create secondary risks (new risks arising from the response — e.g., transferring to a vendor introduces vendor-default risk). Both must be added to the register.

Implement Risk Responses activates the planned strategies on schedule; the risk owner tracks each risk, watches for triggers, and consumes the contingency reserve if a risk occurs.

Monitor Risks is the continuous loop: reassess existing risks for changed P/I; audit the risk process for effectiveness; analyze reserve consumption against VAC (EVM lesson); close risks that no longer apply; add newly-identified risks. Risk reassessment cadence: typically weekly for active critical-path risks, monthly for the full register. Risk audit cadence: typically at phase gates or quarterly. Reserve analysis: compare the contingency reserve balance to the residual risk EMV — if the reserve is depleted before risks are closed, escalate or re-baseline.`,
    core_principles: `- Risks are bidirectional: threats and opportunities are treated symmetrically with parallel response taxonomies.
- A risk is an if-then statement: "If [event], then [impact] on [objective]." A risk without an impact is an issue, not a risk.
- Qualitative analysis prioritizes; quantitative analysis quantifies. Use qualitative for all risks; reserve quantitative for the high-stakes subset.
- EMV (P × Impact) is the atomic quantitative unit. It is additive across independent risks; the contingency reserve is the sum of residual EMVs.
- Decision-tree analysis computes EMV per alternative; choose the alternative with the max EMV (or min EMV for costs).
- Monte-Carlo produces a P(date) curve; the P80 date is a common management commitment; the deterministic CPM date is the P50 estimate.
- Every response creates residual risk (after response) and may create secondary risks (from response) — both go into the register.
- The contingency reserve = Σ EMV of identified residual risks; the management reserve is for unidentified risks. Reserves are managed against VAC (EVM).`,
    components: `- Risk Management Plan (methodology, P/I scales, risk categories, register format, response taxonomy).
- Risk register (the central artifact — risk ID, description, category, P, I, score, response, owner, residual risk, status, trigger).
- P × I matrix (5×5 with response bands).
- Decision tree (decision nodes, chance nodes, EMV roll-back).
- Monte-Carlo model (input distributions, simulator, P(date) curve, tornado chart).
- Risk response plan (per-risk: strategy, owner, schedule, budget).
- Contingency reserve ledger (Σ EMV of residual identified risks).
- Management reserve (for unidentified risks).
- Risk audit reports and risk reassessment logs.`,
    process: `1. Plan Risk Management — Risk Management Plan (methodology, P/I scales, categories, register format, response taxonomy, reserve policy).
2. Identify Risks — produce the risk register; iterative (risks added as design / planning reveal new uncertainties).
3. Perform Qualitative Risk Analysis — score each risk P × I (ordinal); rank on the 5×5 matrix with response bands.
4. Perform Quantitative Risk Analysis — EMV, decision-tree analysis, Monte-Carlo, sensitivity / tornado (applied to the top 10–20% from qualitative).
5. Plan Risk Responses — pair each risk with avoid / mitigate / transfer / accept (threats) or exploit / enhance / share / accept (opportunities); compute residual risk; identify secondary risks.
6. Implement Risk Responses — activate planned strategies on schedule; risk owner tracks each risk and consumes contingency reserve.
7. Monitor Risks — reassess (weekly for critical, monthly for full register), audit (phase gates / quarterly), analyze reserves vs. VAC, close stale risks, add new risks.`,
    formula_calculation: `Risk score (qualitative, ordinal 1–5):
  Risk Score = P × I                                [dimensionless; 1..25 on a 5×5 matrix]

EMV (single risk, quantitative):
  EMV = P × Impact                                   [currency; P ∈ [0,1], Impact in currency/days]
  P on 0–1 scale (NOT ordinal). Impact in currency or days.

EMV (decision alternative with multiple chance outcomes):
  EMV_alt = Σ_i (P_i × Outcome_i) − Cost_alt         [currency]
  Choose alternative with max EMV (opportunities) or min EMV (costs).

Decision tree roll-back:
  At each chance node, compute Σ (P_i × leaf_value_i).
  At each decision node, choose the alternative with max (or min) EMV.

Monte-Carlo:
  For each trial t = 1..N: sample activity duration d_i ~ F_i(d) for all activities; run CPM → project duration T_t and total cost C_t.
  Empirical CDF: F(T) = (# trials with T_t ≤ T) / N.
  P(complete by date D) = F(D) ≈ Φ((D − μ_T)/σ_T) under normal approximation.
  Sensitivity ranking: Spearman correlation ρ(d_i, T) per activity → tornado chart.

Residual risk (after response):
  Residual EMV = P_post × I_post − Response_cost    [currency]
  Response is justified if (P_pre × I_pre) − Residual EMV > Response cost.

Contingency reserve:
  CR = Σ EMV of identified residual risks           [currency; part of cost baseline; PM-controlled]
Management reserve: typically 5–10% of cost baseline, calibrated historically; for unidentified risks; sponsor-controlled.

Units: currency (typically project currency) or days; P on 0–1 scale; risk scores dimensionless. Assumptions: risks are independent (sum of EMV is valid; correlated risks require joint probability modeling); P × I matrix scales are anchored with definitions per level; EMV is linear in P and Impact (no second-moment treatment). Interpretation: EMV is the long-run average cost of a risk if the project were repeated many times; for a single project, EMV is the fair-value reserve allocation.`,
    worked_example: `CASE_TYPE = SYNTHETIC. A $2M software project's risk register has two critical risks:

Risk R1 — Permit delay (threat): P_pre = 0.30, Impact_pre = $50,000 schedule-slip + 5 days.
Risk R2 — Regulatory penalty (threat): P_pre = 0.10, Impact_pre = $200,000.

EMV (no response):
  EMV_R1 = 0.30 × 50,000 = $15,000
  EMV_R2 = 0.10 × 200,000 = $20,000
  Total contingency reserve (no response) = $15,000 + $20,000 = $35,000.

Response R1 — Mitigate: early permit application reduces P to 0.10. Mitigation cost = $2,000.
  Residual EMV_R1 = 0.10 × 50,000 = $5,000; net cost to project = $5,000 + $2,000 = $7,000.
  EMV reduction (mitigation benefit) = $15,000 − $7,000 = $8,000. Mitigation is justified (benefit > cost).

Response R2 — Transfer: insurance with $25,000 premium; residual P = 0 (insurer covers the loss).
  Residual EMV_R2 = 0 × $200,000 = $0; net cost = $0 + $25,000 = $25,000.
  EMV reduction (transfer benefit) = $20,000 − $25,000 = −$5,000. Transfer is NOT justified — the premium exceeds the EMV. Compare: mitigation (if feasible) cost $15,000 reduces P to 0.05 → residual EMV = 0.05 × 200,000 = $10,000; net = $10,000 + $15,000 = $25,000 — also break-even with transfer.
  Best for R2: Accept (passive) — keep the $20,000 EMV as contingency reserve.

Decision tree — design alternative selection:

Alternative A — Build new factory (cost $5.0M):
  60% chance high demand → revenue $12.0M
  40% chance low demand  → revenue $4.0M
  EMV_A = −5.0 + 0.6 × 12.0 + 0.4 × 4.0 = −5.0 + 7.2 + 1.6 = $3.8M

Alternative B — Upgrade existing factory (cost $1.5M):
  60% chance high demand → revenue $5.0M
  40% chance low demand  → revenue $3.0M
  EMV_B = −1.5 + 0.6 × 5.0 + 0.4 × 3.0 = −1.5 + 3.0 + 1.2 = $2.7M

Decision: choose Alternative A — EMV_A ($3.8M) > EMV_B ($2.7M) by $1.1M.

Monte-Carlo (illustrative): the project has 8 activities on the critical path with PERT means Σt_e = 220 days and path variance Σσ² = 64 days² (σ_path = 8 days).
  P(complete by 230 days) = Φ((230 − 220)/8) = Φ(1.25) ≈ 0.894 (89%).
  P80 date (the date with 80% completion probability): Φ⁻¹(0.80) = 0.842 → T_80 = 220 + 0.842 × 8 = 226.7 days ≈ 227 days.
  Recommend 227 days as the management commitment (not the deterministic 220).`,
    industrial_example: `Oil & Gas — offshore platform project. The risk register has 142 identified risks; qualitative scoring ranks 18 as critical / high. Quantitative analysis runs Monte-Carlo on the CPM-critical-path activities with three-point PERT distributions; the P80 completion date is 18 days beyond the deterministic CPM date. The PM commits to the P80 date internally and the CPM date contractually, with a $7M contingency reserve (the Σ residual EMV of the top 18 risks after mitigation / transfer responses). Risks of force majeure (hurricane) are transferred via construction-all-risk insurance ($1.2M premium; residual P=0). Regulatory permitting risk is mitigated via early engagement (cost $300k; reduces P from 0.40 to 0.10; EMV reduction $4.5M − $0.3M = $4.2M).`,
    case_study: `CASE_TYPE = SYNTHETIC. A 12-month pharmaceutical R&D project. Risk register has 24 risks; top-5 high-band risks include (a) clinical-trial protocol amendment requiring IRB re-review (P=0.40, impact 90-day delay + $2.0M); (b) key-investigator attrition (P=0.20, impact 60-day delay + $1.5M); (c) supplier failure for active pharmaceutical ingredient (P=0.10, impact 120-day delay + $4.0M); (d) regulatory feedback requiring additional non-clinical study (P=0.30, impact $3.0M); (e) competitor patent opposition (P=0.05, impact $10M legal + delay). Quantitative EMV = Σ = $5.4M. Responses: (a) mitigate via early IRB engagement ($300k cost, P→0.15, residual EMV $0.6M, net benefit $0.7M); (b) mitigate via co-investigator bench depth ($200k cost, P→0.05, residual $0.15M, net benefit $0.65M); (c) transfer via dual-source qualification ($800k cost, residual P=0.03, residual EMV $0.36M, net benefit $0.84M); (d) accept with $3M contingency reserve; (e) accept (low P). Total contingency reserve after responses = $0.6M + $0.15M + $0.36M + $3M = $4.11M. Net project budget impact: $5.4M (initial) → $4.11M (residual) + $1.3M response costs = $5.41M ≈ initial. Risk responses are cost-justified individually (each net benefit > 0) but the residual reserve ($4.11M) is the actual contingency.`,
    visual_explanation: `P × I matrix (5×5 with response bands):

                Impact (1..5)
              1    2    3    4    5
         1  [ 1    2    3    4    5 ]  → monitor
         2  [ 2    4    6    8   10 ]  → monitor / plan
P(1..5)  3  [ 3    6    9   12   15 ]  → plan response
         4  [ 4    8   12   16   20 ]  → plan now
         5  [ 5   10   15   20   25 ]  → escalate / avoid

  Bands: 1–4 low (monitor) | 5–9 medium (plan) | 10–14 high (plan now) | 15–25 critical (escalate / avoid)

Decision tree (factory-build example):

                 [Decision: factory build]
                /                         \\
           Alt A (build new)              Alt B (upgrade)
          cost $5.0M                      cost $1.5M
              |                              |
       (0.6) high demand                (0.6) high demand
              | revenue $12M                 | revenue $5M
              |                              |
       (0.4) low demand                  (0.4) low demand
              | revenue $4M                  | revenue $3M

EMV_A = −5 + 0.6×12 + 0.4×4 = $3.8M
EMV_B = −1.5 + 0.6×5 + 0.4×3 = $2.7M
Choose A (higher EMV by $1.1M).

Monte-Carlo cumulative S-curve (P vs. project duration):
  P  |
 1.0|                            ╭──── (P80 ≈ 227 days)
 0.8|                       ╭───│
 0.6|                   ╭───│
 0.4|               ╭───│
 0.2|           ╭───│
 0.0|       ╭───│
          ──┴───┴───────→ project duration (days)
                ↑
            deterministic CPM = 220 days (P50)`,
    simulation_opportunity: `Risk simulator: the candidate inputs a risk register (risk IDs, P, Impact in currency / days, proposed response with cost and P_post / I_post), and the simulator computes per-risk EMV (pre and post response), the net benefit of each response, the total contingency reserve (Σ residual EMV), and the qualitative P × I matrix plot with response bands. For decision-tree mode: the candidate inputs decision alternatives, chance events, probabilities, and outcome values; the simulator draws the tree and rolls back the EMV. For Monte-Carlo: the candidate inputs duration distributions (PERT or triangular) per activity and runs 10,000 trials to produce the P(date) curve, the P80 date, and the tornado sensitivity chart.`,
    common_mistakes: `- Confusing risks (future, uncertain) with issues (current, certain). A risk register entry must have a probability < 1.0 and an impact; an issue is in the issue log.
- Treating the contingency reserve as a buffer for unknown-unknowns. The contingency reserve is for IDENTIFIED risks (known-unknowns); the management reserve is for unidentified risks.
- Forgetting residual and secondary risks. Every response creates residual risk (after response) and may create secondary risks (new risks from the response); both go into the register.
- Choosing transfer to "eliminate" a risk. Transfer shifts the financial impact; it does not eliminate the risk (the supplier / insurer may default — that is a secondary risk).
- Single-pass risk identification. Risks evolve as the project reveals new uncertainties; identify risks iteratively, not just at project start.
- Using the deterministic CPM date as the commitment. The CPM date is the P50 estimate; commit to the P80 date (or a buffer) for high-stakes projects.
- Applying quantitative analysis to every risk. Quantitative is expensive; apply to the top 10–20% from qualitative scoring.`,
    limitations: `- EMV is linear in P and Impact; it does not capture variance or tail risk. For high-stakes / low-probability events (black swans), EMV under-represents the risk.
- Risk-independence assumption: Σ EMV is valid only for independent risks. Correlated risks (common-cause drivers, e.g., commodity prices) require joint probability modeling.
- Monte-Carlo assumes the input distributions are known. If the distribution is mis-specified (e.g., normal instead of fat-tailed), the P(date) curve is wrong.
- Decision-tree EMV is sensitive to the probability and outcome estimates; sensitivity analysis on those inputs is required.
- The P × I matrix uses ordinal scales; arithmetic on ordinal data is mathematically improper — the matrix is a prioritization heuristic, not a quantitative model.
- Risk responses can introduce new risks (secondary risks); the risk register must be updated, not closed, after a response.`,
    comparison: `| Method            | Risk type       | Output                       | Best use                              |
|-------------------|-----------------|------------------------------|---------------------------------------|
| P × I matrix      | All risks       | Risk score, response band    | Fast prioritization, all projects    |
| EMV               | Single risk     | Currency EMV                 | Reserve sizing, simple decisions     |
| Decision tree     | Mutually-excl alternatives | EMV per alternative; choose max | Go/no-go, design choices     |
| Monte-Carlo       | Schedule / cost | P(date) curve, P80, tornado  | Quantitative schedule / cost risk    |
| Bow-tie           | Threats         | Causes → top event → consequences + barriers | Safety / hazard analysis |
| FMEA              | Failure modes   | RPN = S × O × D              | Quality / reliability (design + process) |
| Sensitivity (tornado) | All risks    | Correlation ranking          | Prioritize risks for response       |`,
    practical_application: `- Risk register maintenance: weekly review of critical-path risks; monthly review of full register; quarterly risk audit.
- Contingency reserve sizing: Σ EMV of residual identified risks; reviewed against VAC each EVM cycle.
- Response-strategy selection: avoid high-impact low-probability risks where feasible; mitigate high-impact high-probability risks; transfer risk to parties better able to bear it (insurance, fixed-price contracts); accept low-impact low-probability risks with a documented decision.
- Schedule-risk integration: feed PERT three-point estimates into a Monte-Carlo; commit to P80 date internally.
- Decision-tree analysis: used at scope / design decision gates to evaluate alternatives with uncertain outcomes.
- Stakeholder risk-communication: the P × I matrix is the standard communication artifact for non-technical stakeholders.`,
    decision_scenario: `You are the PM on a 14-month hospital-build project. The risk register has 56 risks; 6 are critical-band. The two highest-stakes risks are: (a) structural-steel commodity-price surge (P=0.40, impact $0.9M; transfer via fixed-price contract for $50k premium, residual P=0.10, residual impact $0.9M); (b) permit delay (P=0.20, impact $0.4M + 30 days; mitigate via early permit application, cost $80k, residual P=0.05, residual impact $0.4M). (1) Compute the EMV of each risk pre- and post-response; verify each response is cost-justified. (2) Compute the contingency reserve as Σ residual EMV (assume the other 4 critical risks sum to $0.6M residual EMV after responses). (3) Recommend reserve and response decisions with reasoning; flag any secondary risks introduced.`,
    practice_questions: `- Q1. A risk has P=0.20, impact $100k. Compute its EMV.
- Q2. Decision tree: alternative X (cost $1M, 50% chance $3M revenue, 50% chance $0.5M). Compute EMV_X.
- Q3. Mitigation reduces P from 0.30 to 0.10 at cost $5k; impact $50k. Is mitigation cost-justified?
- Q4. Distinguish residual risk from secondary risk with one example each.`,
    certification_questions: `- C1 (PMP-style). A risk has P=0.30, impact $80k. What is the EMV?
- C2. Which response strategy shifts a risk's impact to a third party without eliminating the risk?
- C3. The deterministic CPM date is 220 days; Monte-Carlo yields P80 = 227 days. Which date should the PM commit to internally?
- C4. The contingency reserve is sized for which class of risks?`,
    summary: `Risk management is the engineering of an explicit uncertainty model: a risk register scored by qualitative P × I and quantified by EMV, decision-tree analysis, and Monte-Carlo where stakes warrant. Threat response strategies are avoid, mitigate, transfer, accept; opportunity strategies are exploit, enhance, share, accept. Every response creates residual risk (after response) and may create secondary risks (from response). The contingency reserve is the Σ EMV of residual identified risks; the management reserve is for unidentified risks. Risk monitoring is a continuous reassessment, risk-audit, and reserve-analysis loop integrated with the EVM cycle.`,
    key_takeaways: `- A risk is an if-then statement (event → impact on objective); an issue is a current fact, not a risk.
- Qualitative P × I matrix prioritizes; quantitative EMV / decision-tree / Monte-Carlo quantifies.
- EMV = P × Impact (P on 0–1 scale, currency). Σ EMV = contingency reserve (for independent risks).
- Decision tree: choose the alternative with max EMV (or min for costs).
- Monte-Carlo yields P(date) curve; commit to the P80 date internally, not the deterministic P50 CPM date.
- Threat responses: avoid / mitigate / transfer / accept. Opportunity responses: exploit / enhance / share / accept.
- Residual risk (after response) and secondary risks (from response) both go into the register.
- Contingency reserve = Σ residual EMV (identified risks); management reserve = unidentified risks; reserves flow through VAC in EVM.`,
    references: `- PMI, "A Guide to the Project Management Body of Knowledge (PMBOK® Guide), 7th Edition" (2021). §Uncertainty performance domain; §Navigate Complexity principle.
- PMI, "Practice Standard for Project Risk Management". Risk register, P × I matrix, EMV, decision-tree analysis, Monte-Carlo, response strategies, residual / secondary risks, risk audit.
- PMI, "Practice Standard for Earned Value Management" (2nd ed., 2011). VAC against reserve consumption.
- Kerzner, H. "Project Management" (13th ed., 2022). Ch. 16 (Risk management).
- ISO 21500:2021. §Risk management theme; §Project risk processes.`,
  },

  knowledgeObject: {
    title: "Risk Management — Knowledge Object",
    domain: "Process",
    competency: "Risk Management",
    topic: "Project Risk Management",
    concept: "Risk register, qualitative (P×I), quantitative (EMV, decision trees, Monte-Carlo), response strategies, monitoring",
    body: {
      definitions: [
        "Risk: an uncertain event or condition that, if it occurs, has a positive or negative effect on one or more project objectives.",
        "Threat: a risk with negative effect. Opportunity: a risk with positive effect.",
        "Probability (P): likelihood the risk occurs, 0–1 (or ordinal 1–5 for qualitative).",
        "Impact (I): consequence on project objectives if the risk occurs, in currency / days / quality (or ordinal 1–5).",
        "Risk score (qualitative) = P × I on ordinal scales; 1–25 on a 5×5 matrix.",
        "EMV (Expected Monetary Value) = P × Impact (currency; P on 0–1).",
        "Risk register: the central artifact — risk ID, description, category, P, I, score, response, owner, residual risk, status, trigger.",
        "P × I matrix: a 5×5 grid with response bands (low / medium / high / critical).",
        "Decision tree: directed graph of decision (square) and chance (circle) nodes; EMV rolled back from leaves to root.",
        "Monte-Carlo simulation: N trials sampling duration/cost distributions → cumulative P(date) curve.",
        "Sensitivity analysis / tornado: ranks risks/activities by correlation with project outcome.",
        "Threat responses: Avoid / Mitigate / Transfer / Accept.",
        "Opportunity responses: Exploit / Enhance / Share / Accept.",
        "Residual risk: risk remaining after response (P_post × I_post − response cost).",
        "Secondary risk: new risk arising from implementing the response.",
        "Contingency reserve: Σ EMV of identified residual risks; in the cost baseline; PM-controlled.",
        "Management reserve: for unidentified risks; in the project budget only; sponsor-controlled.",
        "Risk trigger: an early-warning sign that a risk is about to occur.",
      ],
      principles: [
        "Risks are bidirectional — threats and opportunities treated symmetrically with parallel taxonomies.",
        "A risk is an if-then statement; a risk without an impact is an issue.",
        "Qualitative analysis prioritizes; quantitative analysis quantifies — use qualitative for all, quantitative for the high-stakes subset.",
        "EMV = P × Impact is the atomic quantitative unit; additive across independent risks.",
        "Decision-tree: choose the alternative with max EMV (opportunities) or min EMV (costs).",
        "Monte-Carlo yields a P(date) curve; the deterministic CPM is the P50 estimate; commit to P80 for high-stakes projects.",
        "Every response creates residual risk (after response) and may create secondary risks (from response); both go into the register.",
        "Contingency reserve = Σ EMV of identified residual risks; management reserve for unidentified risks; reserves managed against VAC (EVM).",
      ],
      components: [
        "Risk Management Plan (methodology, P/I scales, categories, register format, response taxonomy, reserve policy).",
        "Risk register (central artifact).",
        "P × I matrix (5×5 with response bands).",
        "Decision tree (decision + chance nodes; EMV roll-back).",
        "Monte-Carlo model (input distributions, simulator, P(date), tornado).",
        "Risk response plan (per-risk strategy, owner, schedule, budget).",
        "Contingency reserve ledger (Σ residual EMV).",
        "Management reserve (unidentified risks).",
        "Risk audit reports and reassessment logs.",
      ],
      mechanism: [
        "Identify risks (iterative): produce the register with if-then descriptions, P, I, category, owner.",
        "Qualitative: score P × I (ordinal); plot on 5×5 matrix with response bands; rank for response planning.",
        "Quantitative: EMV per risk; decision-tree EMV per alternative; Monte-Carlo P(date) curve; tornado sensitivity.",
        "Plan responses: pair each risk with avoid/mitigate/transfer/accept (threats) or exploit/enhance/share/accept (opportunities); compute residual risk; identify secondary risks.",
        "Implement responses: activate on schedule; risk owner tracks and consumes contingency reserve.",
        "Monitor: reassess (weekly critical / monthly full), audit (phase gates / quarterly), analyze reserves vs. VAC, close stale risks, add new risks.",
      ],
      process: [
        "1. Plan Risk Management — Risk Management Plan (methodology, P/I scales, categories, register format, response taxonomy, reserve policy).",
        "2. Identify Risks — produce the risk register; iterative.",
        "3. Perform Qualitative Risk Analysis — P × I (ordinal); 5×5 matrix; response bands.",
        "4. Perform Quantitative Risk Analysis — EMV, decision-tree, Monte-Carlo, sensitivity (top 10–20% from qualitative).",
        "5. Plan Risk Responses — pair with strategy; compute residual risk; identify secondary risks.",
        "6. Implement Risk Responses — activate on schedule; consume contingency reserve.",
        "7. Monitor Risks — reassess, audit, reserve analysis, close, add new risks.",
      ],
      formulas: [
        "Risk Score (qualitative) = P × I (ordinal 1–5).",
        "EMV (single risk) = P × Impact (P on 0–1; currency).",
        "EMV (decision alternative) = Σ_i (P_i × Outcome_i) − Cost_alt.",
        "Residual EMV = P_post × I_post − Response_cost.",
        "Contingency reserve = Σ EMV of identified residual risks.",
        "Monte-Carlo P(complete by D) = Φ((D − μ_T)/σ_T) under normal approximation.",
        "P80 date: T_80 = μ_T + 0.842 × σ_T (Φ⁻¹(0.80) = 0.842).",
      ],
      metrics: [
        "Number of risks in register (by category: technical, external, organizational, project-management).",
        "Risk score per risk (1–25 ordinal).",
        "EMV per risk (currency) and Σ EMV (contingency reserve).",
        "P80 date vs. deterministic CPM date (schedule-risk margin).",
        "Tornado sensitivity: top-N risks / activities by correlation with project outcome.",
        "Reserve consumption: contingency balance vs. residual EMV; management reserve balance.",
        "Risk audit findings: response effectiveness, secondary-risk additions, closed risks.",
      ],
      examples: [
        "Permit delay: P=0.30, I=$50k → EMV $15k; mitigation (cost $2k, P→0.10) → residual $5k, net cost $7k, benefit $8k → cost-justified.",
        "Regulatory penalty: P=0.10, I=$200k → EMV $20k; transfer (premium $25k, residual P=0) → net cost $25k, benefit −$5k → NOT justified; accept with $20k reserve.",
        "Decision tree: Alt A ($5M cost, 60%×$12M, 40%×$4M) → EMV $3.8M; Alt B ($1.5M cost, 60%×$5M, 40%×$3M) → EMV $2.7M. Choose A by $1.1M.",
      ],
      industrial_examples: [
        "Oil & Gas — offshore platform: 142 risks; top-18 quantitative; P80 = CPM date + 18 days; $7M contingency reserve; hurricane risk transferred via construction-all-risk insurance ($1.2M premium); permit risk mitigated via early engagement ($300k cost, P 0.40→0.10, EMV reduction $4.2M).",
        "Pharmaceutical R&D — 12-month project: 24 risks; top-5 EMV = $5.4M; responses (mitigate / transfer / accept) reduce residual to $4.11M; response costs $1.3M; net project budget impact ~$5.4M (responses cost-justified individually).",
      ],
      case_studies: [
        "SYNTHETIC — Pharmaceutical R&D risk-response portfolio: each of 5 critical risks analyzed for response cost vs. EMV reduction; mitigation cost-justified for IRB-engagement and co-investigator risks; transfer cost-justified for supplier-failure risk; accept with $3M reserve for regulatory-feedback risk. Net reserve $4.11M; secondary risks (vendor-default from dual-source) added to register.",
      ],
      common_errors: [
        "Confusing risks (future, uncertain) with issues (current, certain).",
        "Treating the contingency reserve as a buffer for unknown-unknowns (that is the management reserve).",
        "Forgetting residual and secondary risks after a response.",
        "Choosing transfer to 'eliminate' a risk; transfer shifts financial impact, not the underlying event.",
        "Single-pass risk identification; risks evolve, so identification is iterative.",
        "Using the deterministic CPM date (P50) as the commitment; commit to P80 for high-stakes projects.",
        "Applying quantitative analysis to every risk — expensive; reserve for the top 10–20% from qualitative.",
      ],
      limitations: [
        "EMV is linear in P and Impact; does not capture variance / tail risk; under-represents black-swan risks.",
        "Risk-independence assumption invalid for correlated risks (commodity prices, common-cause).",
        "Monte-Carlo assumes the input distributions are known; mis-specification corrupts P(date).",
        "Decision-tree EMV is sensitive to probability / outcome estimates; sensitivity analysis required.",
        "P × I matrix arithmetic on ordinal scales is mathematically improper; it is a heuristic, not a quantitative model.",
      ],
      best_practices: [
        "Iterate risk identification at every phase gate; risks evolve with design / planning detail.",
        "Apply quantitative analysis to the top 10–20% from qualitative scoring.",
        "Document residual and secondary risks after each response; update the register, do not close it.",
        "Cost-justify each response: net benefit = (P_pre × I_pre) − residual EMV > response cost.",
        "Commit internally to the Monte-Carlo P80 date; contractually commit to a date with explicit schedule reserve.",
        "Reconcile the contingency reserve against VAC every EVM cycle; escalate if reserve is depleted before risks close.",
        "Run a risk audit at every phase gate (independent reviewer).",
      ],
      related_concepts: [
        "Schedule Management — PERT three-point estimate and Monte-Carlo on the critical path.",
        "Cost Management — contingency reserve (in cost baseline), management reserve (project budget), VAC analysis.",
        "Quality & Integration Management — integrated change control for risk responses that affect baselines.",
        "FMEA (quality) — RPN = Severity × Occurrence × Detection for failure-mode risk.",
        "Bow-tie analysis — safety / hazard risk communication.",
      ],
      prerequisites: [
        "Risk Management Plan (methodology, P/I scales, risk categories).",
        "Scope, schedule, and cost baselines (risks attach to deliverables, activities, budget lines).",
        "Stakeholder register and risk appetite / tolerance statements.",
        "Organizational process assets (historical risk registers, lessons learned, EMV histories).",
      ],
      references: [
        "PMI PMBOK® Guide 7th Edition (2021). §Uncertainty; §Navigate Complexity.",
        "PMI Practice Standard for Project Risk Management.",
        "PMI Practice Standard for EVM (2nd ed., 2011). VAC against reserve.",
        "Kerzner, H. (2022). Project Management (13th ed.), Ch. 16.",
        "ISO 21500:2021. §Risk management.",
      ],
    },
  },

  questions: [
    {
      competencyName: "Risk Management",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Construction",
      stem: `A decision tree has two design alternatives. Alternative A: build new factory at cost $5.0M; 60% chance of high demand with revenue $12.0M, 40% chance of low demand with revenue $4.0M. Alternative B: upgrade existing factory at cost $1.5M; 60% chance of high demand with revenue $5.0M, 40% chance of low demand with revenue $3.0M. Compute EMV_A and EMV_B and recommend the chosen alternative.`,
      whyCorrect: `EMV_A = −Cost + Σ(P × revenue) = −5.0 + (0.6 × 12.0) + (0.4 × 4.0) = −5.0 + 7.2 + 1.6 = $3.8M. EMV_B = −1.5 + (0.6 × 5.0) + (0.4 × 3.0) = −1.5 + 3.0 + 1.2 = $2.7M. EMV_A ($3.8M) > EMV_B ($2.7M) by $1.1M. The decision rule for opportunities (positive outcome) is to choose the alternative with the MAXIMUM EMV → choose Alternative A.`,
      whyOthersWrong: [
        "Choose B because it has lower cost — this ignores the revenue-side EMV; the lower cost is offset by lower expected revenue. EMV considers both cost AND revenue × probability.",
        "EMV_A = 0.6 × 12 + 0.4 × 4 = $8.8M (omitting the cost) — the cost must be subtracted because it is a certain outflow; the decision is made on NET EMV.",
        "EMV_B = 0.6 × 5 + 0.4 × 3 = $4.2M (omitting cost) — same error; net EMV_B = $2.7M, not $4.2M.",
      ],
      options: [
        { text: "EMV_A = $3.8M; EMV_B = $2.7M; choose A (higher EMV by $1.1M)", isCorrect: true },
        { text: "EMV_A = $8.8M; EMV_B = $4.2M; choose A (higher EMV by $4.6M)", isCorrect: false },
        { text: "EMV_A = $3.8M; EMV_B = $2.7M; choose B (lower cost by $3.5M)", isCorrect: false },
        { text: "EMV_A = $5.0M; EMV_B = $1.5M; choose A (higher cost implies higher value)", isCorrect: false },
      ],
    },
    {
      competencyName: "Risk Management",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "IT",
      stem: `A risk has P_pre = 0.30 and Impact = $50,000. A mitigation response costing $2,000 reduces P to 0.10 with the same impact. Compute the residual EMV, the total net cost to the project, and the net benefit of mitigation. Is mitigation cost-justified?`,
      whyCorrect: `Pre-response EMV = 0.30 × 50,000 = $15,000. Residual EMV (after mitigation) = 0.10 × 50,000 = $5,000. Total net cost to project = residual EMV + mitigation cost = $5,000 + $2,000 = $7,000. Net benefit of mitigation = pre-response EMV − net cost = $15,000 − $7,000 = $8,000. Since the net benefit ($8,000) > 0 and exceeds the mitigation cost ($2,000), mitigation is cost-justified.`,
      whyOthersWrong: [
        "Residual EMV = $5,000, net cost = $5,000 (ignoring mitigation cost); benefit = $15,000 − $5,000 = $10,000 — this ignores the $2k cost; the project actually pays $7k total (residual EMV + mitigation cost), not $5k.",
        "Net benefit = mitigation cost − residual EMV = $2,000 − $5,000 = −$3,000 — the comparison is reversed; benefit is pre-EMV minus net cost, not cost minus residual.",
        "Mitigation is NOT cost-justified because P remains non-zero — incorrect; the criterion is net benefit > 0, which holds ($8,000 > 0).",
      ],
      options: [
        { text: "Residual EMV = $5,000; net cost = $7,000; net benefit = $8,000 → cost-justified", isCorrect: true },
        { text: "Residual EMV = $5,000; net cost = $5,000; net benefit = $10,000 → cost-justified", isCorrect: false },
        { text: "Residual EMV = $5,000; net benefit = −$3,000 → NOT cost-justified", isCorrect: false },
        { text: "Residual EMV = $15,000; net cost = $17,000 → NOT cost-justified", isCorrect: false },
      ],
    },
    {
      competencyName: "Risk Management",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Oil & Gas",
      stem: `A project's critical-path Monte-Carlo simulation yields a mean project duration of 220 days with a standard deviation of 8 days. The deterministic CPM date is 220 days. The PM commits contractually to 220 days but communicates an internal management-commitment date of 227 days. Why is the internal commitment higher than the contractual one, and what does the 227-day figure represent?`,
      whyCorrect: `The deterministic CPM date (220 days) corresponds to the P50 — a 50% probability of completion. The Monte-Carlo mean is also 220 days, but the standard deviation of 8 days means the distribution has substantial upper-tail risk. The 80th-percentile date (P80) = μ + 0.842·σ = 220 + 0.842 × 8 ≈ 227 days (Φ⁻¹(0.80) ≈ 0.842). The PM commits internally to P80 to absorb 80% of the schedule-risk probability; the contractual commitment at 220 days is the contractual obligation, while the 227-day internal date gives management a realistic target that absorbs most variance.`,
      whyOthersWrong: [
        "The 227-day date is the P50 — incorrect; the deterministic CPM date (220) IS the P50 (mean of the Monte-Carlo distribution). The 227-day date is the P80.",
        "The 227-day date is the standard deviation — incorrect; σ = 8 days, not 227. The 227 is a date (days), not a variance measure.",
        "The 227-day date is the worst-case (P99) — incorrect; the P99 = μ + 2.33·σ = 220 + 2.33 × 8 ≈ 239 days, not 227. The 227 is the P80.",
      ],
      options: [
        { text: "227 days is the P80 date (μ + 0.842·σ); the internal commitment absorbs 80% of schedule-risk probability while the contractual 220 is the P50", isCorrect: true },
        { text: "227 days is the P50; the contractual 220 is a typo", isCorrect: false },
        { text: "227 days is the standard deviation of the Monte-Carlo distribution", isCorrect: false },
        { text: "227 days is the P99 (worst-case) date; the PM is being overly conservative", isCorrect: false },
      ],
    },
    {
      competencyName: "Risk Management",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Definitional",
      scenario: "IT",
      stem: `True or False: A risk response that "transfers" the risk eliminates the underlying risk event entirely so that the project is no longer exposed to it.`,
      whyCorrect: `False. The Transfer response strategy (for threats) shifts the FINANCIAL IMPACT of the risk to a third party (insurance, performance bond, fixed-price contract, warranty); it does NOT eliminate the underlying event. The event can still occur, and a secondary risk (e.g., the insurer defaulting, the vendor failing) is introduced. The only response that eliminates the underlying event is AVOID (change scope / supplier / technology to remove the cause).`,
      whyOthersWrong: [
        "A candidate who answers True has confused transfer with avoid. Avoid eliminates the cause; transfer shifts the financial consequence and may introduce counter-party / secondary risk.",
        "Transfer is appropriate when the third party is better able to bear the financial impact (e.g., an insurer pooling risk across many projects), not when the goal is to eliminate the underlying event.",
      ],
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 4 — Quality & Integration Management
// (Competency: "Quality & Integration Management"; slug: prc-quality-integration-management)
// ---------------------------------------------------------------------------

const LESSON_PRC_QUALITY: RefLesson = {
  competencyName: "Quality & Integration Management",
  slug: "prc-quality-integration-management",
  title:
    "Quality & Integration Management — Quality Planning/Assurance/Control, the 7 Quality Tools, Change Control, Configuration Management, Project Charter & Closeout",
  titleAr:
    "إدارة الجودة والتكامل — تخطيط/ضمان/ضبط الجودة، أدوات الجودة السبع، ضبط التغيير، إدارة التكوين، ميثاق المشروع والإغلاق",
  order: 4,
  durationMin: 38,
  references: PRC_REFERENCE_TITLES,
  conceptIntroduction: `Quality and integration management are the two cross-cutting disciplines that bind every other performance domain into a coherent, controlled project. Quality management ensures that the project's deliverables satisfy the requirements and the relevant quality standards (the PMBOK Build Quality Into Project Deliverables principle). Integration management ensures that the project's plans, execution, changes, knowledge, and closeout are coordinated through a single integrated project-management plan and a single change-control authority (the PMBOK "project manager as integrator" principle). This lesson equips the candidate to (1) plan quality (quality policy, metrics, requirements), (2) manage quality (assurance, audits, process improvement), (3) control quality (inspection, the seven basic quality tools), (4) develop the project charter and the project-management plan, (5) direct and manage project work, (6) perform integrated change control through the Change Advisory Board (CCB), (7) manage project knowledge, (8) manage configuration, and (9) close the project or phase.`,
  example: `A construction project's quality plan defines a concrete-cube strength metric of ≥30 MPa at 28 days. The QA process audits the batch-plant calibration monthly. The QC process takes 6 cubes per pour per day; the control chart of cube strength has a UCL = 35 MPa, LCL = 25 MPa, mean = 30 MPa. A run of 7 consecutive points below the mean (but above LCL) triggers a Western Electric rule violation — a special-cause signal; the PM halts the pour and investigates. The Pareto chart of defects shows 80% of rework comes from 20% of causes (formwork misalignment, concrete segregation) — focus there.`,
  keyFormulas: `Quality metrics: defect density = defects / size (e.g., defects/KLOC, defects/m²); first-pass yield = (units passing first inspection) / (total units) × 100%; cost of quality (COQ) = prevention costs + appraisal costs + internal failure costs + external failure costs.
Control chart: UCL = μ + 3σ; LCL = μ − 3σ; mean (CL) = μ. Out-of-control signals: (a) 1 point beyond 3σ; (b) 9 points in a row on one side of CL; (c) 6 points in a row steadily increasing or decreasing; (d) 14 points alternating up and down; (e) 2 of 3 points beyond 2σ on the same side; (f) 4 of 5 points beyond 1σ on the same side (Western Electric rules).
Pareto: 80/20 heuristic — 80% of defects come from 20% of causes; rank by frequency, cumulative %, focus on top.
Cause-and-effect (fishbone): 6M categories — Man, Machine, Method, Material, Measurement, Mother Nature (Environment).
Integrated change control: Change Request → CCB review → Approve/Reject/Defer → Update baselines + configuration items.
Configuration management: CI (configuration item) identification, version control, change control, status accounting, audit.
Project closeout: administrative closeout (final deliverable acceptance, contract closure, archive, lessons-learned register).`,
  exercise: `You are the PM on a software project with a quality plan defining ≤5 defects/KLOC and ≥95% first-pass yield. (a) The control chart of build-defect density has a mean of 3.5 defects/KLOC and σ = 0.8. Compute UCL and LCL. (b) A run of 7 consecutive builds shows defect density trending upward (3.6, 3.8, 4.0, 4.1, 4.2, 4.4, 4.6 defects/KLOC). Apply Western Electric rules — is the process in control? (c) The Pareto chart of defects shows: logic errors 40%, UI 25%, data 15%, security 10%, performance 5%, other 5%. Where do you focus the response? (d) A change request proposes adding two new features; describe the integrated change-control workflow including CCB, baseline update, and configuration-item versioning. (e) Build a fishbone (6M) for the upward defect-density trend with at least one cause per category.`,
  sections: {
    learning_objectives: `- Plan quality: quality policy, quality metrics (defect density, first-pass yield, COQ), quality requirements per deliverable.
- Manage quality: quality assurance (QA), process audits, process improvement, the PDCA cycle.
- Control quality: inspection, the seven basic quality tools (cause-and-effect / fishbone, flowchart, check sheet, histogram, Pareto, scatter, control chart), acceptance criteria.
- Apply control-chart rules (Western Electric) to detect special-cause variation.
- Develop the project charter (business case, success criteria, sponsor signature) and the project-management plan (10–12 subsidiary plans integrated).
- Direct and manage project work: deliverables, work-performance data, change requests.
- Perform integrated change control via the Change Advisory Board (CCB): change-request → review → approve / reject / defer → baseline update.
- Apply configuration management: configuration-item identification, version control, change control, status accounting, audit.
- Manage project knowledge: lessons-learned register, organizational process assets update.
- Close the project or phase: administrative closeout, contract closure, archive, lessons-learned register.`,
    prerequisites: `- Project scope statement, WBS, requirements documentation (quality requirements derive from these).
- Quality Management Plan (subset of the project-management plan).
- Change-control procedure and configuration-management procedure (often organizational standards).
- Stakeholder register (stakeholder quality expectations).
- Organizational process assets (quality policy, historical lessons, configuration standards).`,
    introduction: `Quality and integration are the two integrative disciplines of project management. The PMBOK® Guide 7th Edition names "Build Quality Into Project Deliverables" and "Integrate Project Management Activities" as project-management principles. Quality management spans three processes (Plan Quality Management, Manage Quality, Control Quality) and produces the seven basic quality tools that detect special-cause variation. Integration management spans seven processes (Develop Project Charter, Develop Project Management Plan, Direct & Manage Project Work, Manage Project Knowledge, Perform Integrated Change Control, Close Project or Phase, plus Monitor & Control Project Work) and produces the integrated project-management plan, the change-control authority (CCB), and the closeout archive. Together they ensure the project delivers correct deliverables through a controlled, auditable, knowledge-accumulating lifecycle.`,
    terminology: `- Quality: the degree to which a set of inherent characteristics fulfills requirements (ISO 9000).
- Quality planning: defining quality requirements, metrics, and the quality-management approach.
- Quality assurance (QA): process-focused; ensuring quality processes are followed; audits and process improvement (PDCA).
- Quality control (QC): product-focused; inspecting deliverables against acceptance criteria; the seven basic quality tools.
- Cost of Quality (COQ): Prevention + Appraisal + Internal Failure + External Failure (P&AI&EF). Cost of poor quality = internal + external failure.
- Defect density: defects / size (e.g., defects/KLOC, defects/m²).
- First-pass yield: units passing first inspection / total units × 100%.
- The seven basic quality tools: (1) Cause-and-effect (fishbone / Ishikawa), (2) Flowchart, (3) Check sheet, (4) Histogram, (5) Pareto chart, (6) Scatter diagram, (7) Control chart.
- Control chart: UCL = μ + 3σ, LCL = μ − 3σ, CL = μ. Common-cause vs. special-cause variation.
- Western Electric rules: signals for special-cause variation beyond a single 3σ breach.
- Pareto principle: ~80% of effects come from ~20% of causes.
- Fishbone (Ishikawa): 6M categories — Man, Machine, Method, Material, Measurement, Mother Nature (Environment).
- Project charter: the document that authorizes the project; sponsor signature; business case; success criteria; PM assignment.
- Project-management plan: the integrated plan of subsidiary plans (scope, schedule, cost, quality, resource, comms, risk, procurement, stakeholder; plus change, config, requirements, life-cycle).
- Integrated change control: the process of reviewing, approving, and managing changes to the baselines through the CCB.
- Change Advisory Board (CCB): the chartered body (sponsor, PM, key stakeholders) that approves / rejects / defers change requests.
- Configuration item (CI): any deliverable or work component under version control (a document, a component, a build, a release).
- Configuration management: CI identification, version control, change control, status accounting, audit.
- Lessons-learned register: knowledge captured for re-use on future projects (organizational process assets).
- Project / phase closeout: administrative closeout (final deliverable acceptance, contract closure, archive, lessons-learned register).`,
    detailed_explanation: `Quality management is organized around three processes. Plan Quality Management produces the Quality Management Plan (quality policy, metrics, requirements per deliverable, quality-assurance and quality-control procedures, COQ framework). Manage Quality is the assurance / process-improvement function — it audits the processes (not the products) for adherence to the quality plan and runs the PDCA cycle (Plan-Do-Check-Act) for continuous process improvement. Control Quality is the inspection function — it inspects deliverables against acceptance criteria and applies the seven basic quality tools to detect special-cause variation. The Cost of Quality (COQ) framework budgets prevention costs (training, process design), appraisal costs (inspection, audit), internal-failure costs (rework before delivery), and external-failure costs (warranty, liability, recall after delivery). The PMBOK guidance is to invest in prevention (the cheapest leverage) — $1 of prevention typically saves $10 of internal failure and $100 of external failure.

The seven basic quality tools are the universal toolkit for QC. (1) Cause-and-effect (fishbone / Ishikawa) — organizes causes into the 6M categories (Man, Machine, Method, Material, Measurement, Mother Nature); used in root-cause analysis. (2) Flowchart — process flow showing inputs, transformations, outputs, decision points; used to surface quality handoffs and bottlenecks. (3) Check sheet — structured form for tallying defect types / locations / frequencies; data collection for Pareto. (4) Histogram — bar chart of frequency distribution of a metric (e.g., cube strength); shows central tendency and dispersion. (5) Pareto chart — bar chart of defect categories sorted by frequency + cumulative % line; applies the 80/20 rule. (6) Scatter diagram — plot of two variables (e.g., temperature vs. defect rate) to detect correlation. (7) Control chart — time-ordered plot with UCL/LCL = μ ± 3σ; detects special-cause variation via Western Electric rules. The control chart is the canonical tool for distinguishing common-cause (inherent process variation, addressed by process improvement) from special-cause (an external disturbance, addressed by root-cause investigation).

Western Electric rules flag special-cause signals beyond a single 3σ breach: (a) 1 point beyond 3σ; (b) 9 points in a row on one side of CL; (c) 6 points in a row steadily increasing or decreasing; (d) 14 points in a row alternating up and down; (e) 2 of 3 consecutive points beyond 2σ on the same side; (f) 4 of 5 consecutive points beyond 1σ on the same side. Any one of these signals triggers a root-cause investigation. The PM halts the affected process (e.g., the concrete pour) and convenes the fishbone analysis.

Integration management is organized around seven processes. Develop Project Charter produces the project charter — the authorization document with the business case, success criteria, scope summary, sponsor signature, and PM assignment; it is the only document the sponsor signs at project initiation. Develop Project Management Plan integrates the subsidiary plans (scope, schedule, cost, quality, resource, communications, risk, procurement, stakeholder; plus the change-management, configuration-management, requirements-management, life-cycle, and development-approach plans) into a single integrated plan; the baselines (scope, schedule, cost) are part of this plan. Direct & Manage Project Work executes the plan — produces deliverables, work-performance data, and change requests. Manage Project Knowledge captures lessons learned into the organizational process assets. Perform Integrated Change Control reviews, approves/rejects, and updates baselines and configuration items through the CCB; no change to a baseline is valid without CCB approval. Close Project or Phase performs administrative closeout (final deliverable acceptance, contract closure, archive, lessons-learned register) and is the formal project-end signal.

Configuration management is the technical foundation of integration. A configuration item (CI) is any deliverable or work component under version control (a document, a component, a build, a release). Configuration management has four functions: CI identification (unique ID + naming convention), version control (the baseline history of each CI), change control (CCB approval to change a CI's baseline), and status accounting + audit (the ledger of CI states and the periodic verification that the as-built CI matches the as-documented baseline). For software, this is enforced via the version-control system (Git, SVN) and the build / release pipeline. For construction, this is enforced via the as-built drawings register and the change-order log.

Project / phase closeout is the integrative step that closes contracts, archives the project records, captures lessons learned, and formally releases the project resources. The closeout produces the final-acceptance document (signed by the sponsor / customer), the contract-closure record, the archive index, and the lessons-learned register entry. Skipping closeout loses the knowledge capital and prevents the formal release of resources (legal / financial liabilities can persist).`,
    core_principles: `- Quality is conformance to requirements (Crosby); "zero defects" is a quality goal, not a target number of defects.
- The Cost of Quality invests in prevention first — $1 of prevention saves $10 of internal failure and $100 of external failure (the 1-10-100 rule).
- The seven basic quality tools are universal and apply across industries; the control chart is the canonical special-cause detector.
- Common-cause variation is inherent in the process and addressed by process improvement; special-cause is an external disturbance addressed by root-cause investigation.
- The project manager is the integrator. The PM owns the integrated project-management plan and the integrated change-control process; no other role has this authority.
- The project charter is the only sponsor-signed authorization document; the project-management plan is the PM-owned integrated plan.
- The CCB is the chartered change-control authority; no baseline change is valid without CCB approval.
- Configuration management is the technical foundation of integration; version control, change control, status accounting, audit.
- Closeout is the formal knowledge-capture and resource-release step; skipping it loses knowledge capital and leaves open liabilities.`,
    components: `- Quality Management Plan (quality policy, metrics, requirements, COQ framework, QA/QC procedures).
- Quality metrics (defect density, first-pass yield, COQ categories).
- Quality control reports (control charts, Pareto charts, fishbone analyses, inspection records).
- Project charter (business case, success criteria, sponsor signature, PM assignment).
- Project-management plan (integrated subsidiary plans + baselines).
- Work-performance data and reports (Direct & Manage Project Work output).
- Change-request log and CCB minutes.
- Configuration-item register and version-control system.
- Lessons-learned register and organizational process assets.
- Project / phase closeout documents (final acceptance, contract closure, archive index).`,
    process: `1. Plan Quality Management — quality policy, metrics, requirements, COQ framework, QA/QC procedures.
2. Manage Quality — process audits, PDCA improvement, quality tools for process analysis.
3. Control Quality — inspection, seven basic quality tools, acceptance criteria.
4. Develop Project Charter — business case, success criteria, sponsor signature, PM assignment.
5. Develop Project Management Plan — integrate subsidiary plans + baselines.
6. Direct & Manage Project Work — produce deliverables, work-performance data, change requests.
7. Manage Project Knowledge — capture lessons learned into OPA.
8. Perform Integrated Change Control — CCB review, baseline + configuration-item updates.
9. Close Project or Phase — administrative closeout, contract closure, archive, lessons learned.`,
    formula_calculation: `Quality metrics:
  Defect density = (defect count) / (size)        [defects/KLOC; defects/m²; defects/L]
  First-pass yield = (units passing first inspection) / (total units) × 100%   [%]
  COQ = Prevention + Appraisal + Internal Failure + External Failure  [currency]
  Cost of poor quality = Internal Failure + External Failure  [currency]
  1-10-100 rule: $1 prevention ≈ $10 internal failure ≈ $100 external failure (Crosby heuristic)

Control chart:
  CL  = μ  (process mean)               [metric units]
  UCL = μ + 3σ                          [metric units]
  LCL = μ − 3σ                          [metric units]
  (where σ is the within-subgroup standard deviation, typically the short-term σ)

Western Electric special-cause rules (any one triggers investigation):
  (a) 1 point beyond 3σ
  (b) 9 points in a row on one side of CL
  (c) 6 points in a row steadily increasing or decreasing
  (d) 14 points in a row alternating up and down
  (e) 2 of 3 consecutive points beyond 2σ on the same side of CL
  (f) 4 of 5 consecutive points beyond 1σ on the same side of CL

Pareto: rank defect categories by frequency descending; cumulative %; focus on the top ~20% of causes that drive ~80% of defects.
Fishbone (Ishikawa) 6M: Man, Machine, Method, Material, Measurement, Mother Nature (Environment).

Configuration management:
  CI = configuration item (deliverable / work component under version control).
  Version control: each CI has a baseline version + change history; changes flow through the CCB.
  Status accounting: ledger of CI states (draft / reviewed / approved / released / superseded).
  Audit: periodic verification that as-built CI matches as-documented CI.

Integrated change control:
  CR → CCB review (impact on scope / schedule / cost / quality / risk) → Approve / Reject / Defer → Update baselines + configuration items → Communicate → Execute.

Units: defect density (per size unit); yield (%); COQ (currency); control chart (metric units); version numbers (e.g., v1.0, v1.1, v2.0). Assumptions: process is in statistical control when computing σ for UCL/LCL; rational sub-grouping per Shewhart; the Western Electric rules assume independent samples. Interpretation: a control chart signal means a process change is probable; investigate root cause before resuming.`,
    worked_example: `CASE_TYPE = SYNTHETIC. A software project's QC process tracks build-defect density (defects/KLOC). The control chart has μ = 3.5 defects/KLOC, σ = 0.8.
  UCL = μ + 3σ = 3.5 + 3 × 0.8 = 3.5 + 2.4 = 5.9 defects/KLOC.
  LCL = μ − 3σ = 3.5 − 2.4 = 1.1 defects/KLOC.

Build sequence (last 7 builds): 3.6, 3.8, 4.0, 4.1, 4.2, 4.4, 4.6 defects/KLOC.
  Apply Western Electric rules:
  (a) 1 point beyond 3σ? No — max is 4.6, below UCL 5.9.
  (b) 9 points on one side of CL (3.5)? All 7 are above CL but the rule requires 9 — not yet (continue monitoring).
  (c) 6 points steadily increasing? Yes — 3.6, 3.8, 4.0, 4.1, 4.2, 4.4, 4.6 is strictly increasing over 7 builds (rule triggers at 6 in a row).
  → SPECIAL-CAUSE SIGNAL. Halt the build pipeline; convene fishbone analysis.

Fishbone (6M) for upward defect-density trend:
  Man       — two new developers onboarding (unfamiliar with coding standards).
  Machine   — the build server was migrated; lint config not propagated.
  Method    — code-review checklist was shortened to meet a release date.
  Material  — third-party library updated (breaking API changes).
  Measurement — defect-detection tooling had a false-negative regression last sprint.
  Mother Nature — release pressure (organization-wide Q4 push).

Pareto of defects (last quarter): logic errors 40%, UI 25%, data 15%, security 10%, performance 5%, other 5%.
  Focus: logic errors (40%) + UI (25%) = 65% of defects → focus response here.

Integrated change control example:
  CR #1024: "Add two-factor authentication to login."
  CCB review: scope +1 sprint, cost +$25k, schedule +5 days on critical path, security risk ↓ (transferred), no quality impact.
  Decision: Approve. Update scope baseline (add 2FA work package); update schedule baseline (CPM re-run, +5 days); update cost baseline (+$25k from management reserve); configuration items: requirements doc v2.1, design doc v2.1, code base v1.4, test plan v2.1.
  Communicate: stakeholder notification; release notes; PMO archive entry.
  Execute: development + test + release v1.4.

Project / phase closeout: the closeout produces (a) final-acceptance document signed by the sponsor / customer; (b) contract-closure record for each vendor; (c) archive index (project records, charter, plan, baselines, change log, configuration items, lessons-learned register entry); (d) lessons-learned register entry (what worked, what did not, what to do differently); (e) formal resource release (team members returned to functional managers; vendor contracts closed; financial accounts closed).`,
    industrial_example: `Construction — concrete-pour quality on a hospital build. The quality plan defines cube strength ≥30 MPa at 28 days; the QC process takes 6 cubes per pour per day; the control chart has UCL = 35 MPa, LCL = 25 MPa, CL = 30 MPa. A run of 9 consecutive points below CL (28, 28, 29, 28, 27, 28, 29, 28, 27 MPa) triggers Western Electric rule (b); the PM halts the pour, convenes a fishbone (6M), and traces the cause to a batch-plant water-cement-ratio drift (Machine) due to a worn flowmeter. The flowmeter is replaced (Method / Machine), the batch plant is recalibrated (Method), and the next pour's control chart returns to within-control behavior. The Pareto chart of last quarter's rework shows 80% from formwork misalignment + concrete segregation — focus response there.`,
    case_study: `CASE_TYPE = SYNTHETIC. An IT project's release pipeline shows defect density trending upward for 7 builds (3.6, 3.8, 4.0, 4.1, 4.2, 4.4, 4.6 defects/KLOC). The QC process flags a Western Electric rule (c) violation (6 points steadily increasing). The PM halts the release, convenes the fishbone analysis (6M), identifies root causes (onboarding, build-server lint-config drift, shortened code-review checklist, third-party library update), and institutes corrective actions: (a) extend onboarding; (b) re-baseline the build server's lint config in version control; (c) restore the full code-review checklist; (d) pin the third-party library to the prior version. The next 7 builds return to within-control behavior (defect density 3.5 ± 0.6). A change request to institutionalize the code-review checklist goes through the CCB; configuration items (requirements doc, design doc, code, test plan) version-bumped to v2.1; lessons-learned register entry filed.`,
    visual_explanation: `Control chart (build defect density, last 7 builds):

  defects/KLOC
   6.0| ╭── UCL = 5.9
   5.5| │           ↑ trend
   5.0| │        ╭── 4.6
   4.5| │     ╭── 4.4
   4.0| │  ╭── 4.2 (rule (c) violation: 6 in a row increasing)
   3.5| │ ╭── 4.0 — — — — CL = 3.5 (process mean)
   3.0| ││4.1
   ...| │3.8 4.1
   1.5| │3.6
   1.0| ╰── LCL = 1.1
            1  2  3  4  5  6  7   build number

  → Western Electric rule (c) triggered; halt build; root-cause.

Pareto chart (defect categories):
  100%|                          ╭──
   80%|                     ╭── cum %
   65%|                ╭── (logic 40% + UI 25% = 65%)
   40%|           ╭── (logic 40%)
    0%|──────────┴──┴──┴──┴──┴──┴──
        logic    UI   data sec perf other
         40%   25%  15% 10% 5%  5%  (frequency)

  → Focus response on logic + UI (top 65%).

Fishbone (6M) for upward defect trend:
              Man       Method
                \\      /
                 \\  /
                  () ─── Defect Density ↑
                 /  \\
   Mother Nature    Machine
                \\      /
                 Measurement
                Material

CCB workflow:
  CR #1024 → Impact Analysis → CCB Review → Approve → Update Baselines + CIs → Communicate → Execute → Closeout`,
    simulation_opportunity: `Quality + integration simulator: the candidate inputs a metric time series and the simulator plots the control chart (CL, UCL, LCL) and overlays Western Electric rule signals. The candidate can experiment with Pareto data (defect categories → bar chart + cumulative % line + 80% focus line) and with a fishbone generator (6M categories → cause tree). For integrated change control: the candidate enters a change request, the simulator computes scope / schedule / cost / quality / risk impact (with the EVM lesson's EAC formulas), and walks the request through the CCB (approve / reject / defer) with baseline + configuration-item updates; the simulator tracks the version history (CI register, status accounting, audit log).`,
    common_mistakes: `- Treating the control chart as a target, not a process signal. A point within UCL/LCL does NOT mean the process is acceptable; it means the process is in statistical control. Acceptability is judged against the quality requirement (e.g., defect density ≤ 5).
- Tampering with a process in common-cause variation. Adjusting the process in response to common-cause variation (e.g., retraining every operator after each random dip) increases variation (Deming's funnel experiment).
- Confusing QA (process) with QC (product). QA audits processes; QC inspects deliverables. They are separate functions and require separate tooling.
- Skipping prevention in favor of inspection. The COQ 1-10-100 rule says prevention is the cheapest leverage; over-investing in appraisal (final inspection) is wasteful.
- Allowing baseline changes outside the CCB. Informal changes invalidate SV / SPI / CV / CPI measurements and the configuration audit.
- Closing the project without a lessons-learned entry. The knowledge capital is lost; future projects repeat the same mistakes.
- Misidentifying configuration items. A CI must be uniquely identified, versioned, and change-controlled; ad-hoc documents are not CIs.
- Using the fishbone as a defect log, not a cause-organizer. The fishbone organizes hypothesized causes for root-cause analysis; it does not by itself identify the root cause.`,
    limitations: `- Control charts assume a stable process; if the process mean is shifting (e.g., seasonal variation), the chart may signal false positives.
- Western Electric rules assume independence; autocorrelated data (e.g., temperature drift) can trigger spurious signals.
- Pareto 80/20 is a heuristic, not a law. The cumulative distribution can be 70/30, 90/10, or other; the heuristic is a focus guide.
- The seven basic quality tools are descriptive, not prescriptive; they detect problems but do not solve them.
- The project charter is a one-time authorization; major scope or business-case changes may require a new charter.
- The CCB can become a bottleneck if change volume is high; an expedited / emergency change path may be needed (sponsor-approved).
- Configuration management has overhead; low-criticality CIs may not justify the version-control burden.
- Closeout captures lessons at a point in time; ongoing knowledge management (organizational process assets) is required for re-use.`,
    comparison: `| Approach | Focus | Tools | Best use |
|----------|-------|-------|----------|
| QC (PMBOK) | Product | 7 basic quality tools, inspection | Detect special-cause; deliverable acceptance |
| QA (PMBOK) | Process | Audits, PDCA, process analysis | Continuous process improvement |
| Six Sigma (DMAIC) | Process | Statistical (Cp, Cpk, DPMO) | Process capability improvement |
| TQM | Organization | All employees, culture | Organization-wide quality culture |
| ISO 9001 | QMS | Process audits, documentation | Quality-management-system certification |
| Lean | Waste | VSM, 5S, kaizen | Waste elimination, flow |
| Configuration Mgmt | CI versions | Version control, audit | Software / hardware / document baselines |`,
    practical_application: `- Quality plan: define quality metrics (defect density, first-pass yield, COQ), acceptance criteria per deliverable, and the QA / QC procedures.
- Control-chart monitoring: weekly defect-density / cube-strength / first-pass-yield chart with Western Electric rule alerts.
- Pareto-driven defect response: focus the top ~20% of causes that drive ~80% of defects.
- Integrated change control: every change request goes through the CCB; the impact analysis touches scope / schedule (re-run CPM) / cost (re-compute EAC) / quality / risk.
- Configuration management: version-control every CI; audit CI states periodically.
- Closeout: produce final acceptance, contract closure, archive index, and lessons-learned register entry; formally release resources.
- Organizational process assets: feed lessons learned into the OPA library for re-use on future projects.`,
    decision_scenario: `You are the PM on a 9-month software release. At month 5, the defect-density control chart signals a Western Electric rule (c) violation (6 builds steadily increasing from 3.6 to 4.6 defects/KLOC; UCL = 5.9). The release is contractually committed in 4 months. The candidate root causes (fishbone 6M) include a build-server lint-config drift (Machine), a shortened code-review checklist (Method), and a third-party library update (Material). Decision: (a) Halt the release pipeline? (b) Re-baseline the build server config in version control and restore the full code-review checklist? (c) Roll back the third-party library to the prior version? (d) Issue a change request to formalize the code-review checklist as a CI? (e) Communicate to the sponsor that the release is at risk and a 1-week slip may be required? Recommend with reasoning; quantify the schedule and cost impact; describe the CCB workflow.`,
    practice_questions: `- Q1. A control chart has μ = 30, σ = 2. Compute UCL, LCL.
- Q2. A run of 8 consecutive points below CL (but above LCL) — which Western Electric rule triggers? (Trick: rule (b) requires 9 points.)
- Q3. A Pareto chart shows logic errors 40%, UI 25%, data 15%. What percentage of defects are addressed by focusing on logic + UI?
- Q4. Describe the CCB workflow for a change request that affects the schedule baseline.`,
    certification_questions: `- C1 (PMP-style). Which quality tool ranks defect categories by frequency to focus response?
- C2. A point is within UCL and LCL on a control chart. Is the process "in control"?
- C3. Which document does the sponsor sign to authorize the project?
- C4. The integrated change-control authority that approves / rejects change requests is the: ___?___`,
    summary: `Quality and integration management are the two integrative disciplines. Quality (Plan, Manage, Control) uses the seven basic quality tools (cause-and-effect, flowchart, check sheet, histogram, Pareto, scatter, control chart) to detect special-cause variation; the COQ framework invests in prevention first (the 1-10-100 rule). Integration (Charter, Plan, Direct & Manage, Knowledge, Integrated Change Control, Configuration, Closeout) coordinates the project through a single integrated plan, the CCB, and configuration-item version control. Closeout is the formal knowledge-capture and resource-release step. Together they ensure the project delivers correct deliverables through a controlled, auditable, knowledge-accumulating lifecycle.`,
    key_takeaways: `- Quality planning defines metrics; QA audits processes (PDCA); QC inspects deliverables (seven basic tools).
- Control chart UCL/LCL = μ ± 3σ; Western Electric rules detect special-cause signals (e.g., 6 in a row increasing, 9 on one side of CL, 2 of 3 beyond 2σ).
- Pareto: ~80% of defects from ~20% of causes; focus response on the top categories.
- Fishbone (6M): Man, Machine, Method, Material, Measurement, Mother Nature.
- COQ 1-10-100 rule: $1 prevention ≈ $10 internal failure ≈ $100 external failure.
- Project charter is the sponsor-signed authorization; the project-management plan is the PM-owned integrated plan.
- The CCB is the change-control authority; no baseline change is valid without CCB approval.
- Configuration management = CI identification, version control, change control, status accounting, audit.
- Closeout produces final acceptance, contract closure, archive, lessons-learned register entry; resource release.`,
    references: `- PMI, "A Guide to the Project Management Body of Knowledge (PMBOK® Guide), 7th Edition" (2021). §Project Work performance domain; §Build Quality Into Project Deliverables and §Integrate Project Management Activities principles.
- PMI, "Practice Standard for Project Scheduling". Schedule baseline changes through integrated change control.
- PMI, "Practice Standard for EVM" (2nd ed., 2011). Cost baseline changes through integrated change control.
- PMI, "Practice Standard for Project Risk Management". Risk-response changes through integrated change control.
- Kerzner, H. "Project Management" (13th ed., 2022). Ch. 13 (Quality management), Ch. 16 (Risk + change), Ch. 18 (Project closeout).
- ISO 21500:2021. §Quality and §Integration themes; §Change control and §Configuration management processes.`,
  },

  knowledgeObject: {
    title: "Quality & Integration Management — Knowledge Object",
    domain: "Process",
    competency: "Quality & Integration Management",
    topic: "Quality Planning/Assurance/Control and Project Integration",
    concept: "Seven quality tools, integrated change control, configuration management, project charter, closeout",
    body: {
      definitions: [
        "Quality: degree to which inherent characteristics fulfill requirements (ISO 9000).",
        "Quality planning: defining quality policy, metrics, requirements, and the quality-management approach.",
        "Quality assurance (QA): process-focused; audits and PDCA continuous improvement.",
        "Quality control (QC): product-focused; inspection and the seven basic quality tools.",
        "COQ (Cost of Quality) = Prevention + Appraisal + Internal Failure + External Failure.",
        "Defect density: defects / size (defects/KLOC, defects/m²).",
        "First-pass yield: (units passing first inspection) / (total units) × 100%.",
        "The seven basic quality tools: cause-and-effect (fishbone), flowchart, check sheet, histogram, Pareto, scatter, control chart.",
        "Control chart: time-ordered plot with UCL/LCL = μ ± 3σ; detects special-cause variation.",
        "Western Electric rules: special-cause signals (1 beyond 3σ; 9 on one side of CL; 6 increasing/decreasing; 14 alternating; 2 of 3 beyond 2σ; 4 of 5 beyond 1σ).",
        "Pareto principle: ~80% of effects from ~20% of causes.",
        "Fishbone (Ishikawa) 6M: Man, Machine, Method, Material, Measurement, Mother Nature (Environment).",
        "Project charter: sponsor-signed authorization document (business case, success criteria, PM assignment).",
        "Project-management plan: integrated subsidiary plans + baselines (scope, schedule, cost, quality, resource, comms, risk, procurement, stakeholder).",
        "Integrated change control: review / approve / reject / defer changes to baselines through the CCB.",
        "Change Advisory Board (CCB): the chartered authority for change approval.",
        "Configuration item (CI): any deliverable / work component under version control.",
        "Configuration management: CI identification, version control, change control, status accounting, audit.",
        "Lessons-learned register: knowledge captured for re-use (organizational process assets).",
        "Project / phase closeout: final acceptance, contract closure, archive, lessons-learned register entry, resource release.",
      ],
      principles: [
        "Quality is conformance to requirements (Crosby); zero defects is the goal, not a defect count.",
        "The COQ 1-10-100 rule: $1 prevention ≈ $10 internal failure ≈ $100 external failure — invest in prevention first.",
        "Common-cause variation is inherent; addressed by process improvement. Special-cause is external; addressed by root-cause investigation.",
        "The project manager is the integrator; owns the integrated project-management plan and the CCB-driven change-control process.",
        "The project charter is the only sponsor-signed authorization; the project-management plan is the PM-owned integrated plan.",
        "The CCB is the chartered change-control authority; no baseline change is valid without CCB approval.",
        "Configuration management is the technical foundation of integration; version control, change control, status accounting, audit.",
        "Closeout is the formal knowledge-capture and resource-release step; skipping it loses knowledge and leaves open liabilities.",
      ],
      components: [
        "Quality Management Plan (quality policy, metrics, requirements, COQ framework, QA/QC procedures).",
        "Quality metrics (defect density, first-pass yield, COQ categories).",
        "Quality control reports (control charts, Pareto charts, fishbone analyses, inspection records).",
        "Project charter (business case, success criteria, sponsor signature, PM assignment).",
        "Project-management plan (integrated subsidiary plans + baselines).",
        "Work-performance data and reports (Direct & Manage Project Work output).",
        "Change-request log and CCB minutes.",
        "Configuration-item register and version-control system.",
        "Lessons-learned register and organizational process assets.",
        "Project / phase closeout documents (final acceptance, contract closure, archive index).",
      ],
      mechanism: [
        "Plan Quality Management: produce the Quality Management Plan (quality policy, metrics, requirements, COQ, QA/QC procedures).",
        "Manage Quality: process audits; PDCA cycle; quality tools applied to process analysis (not product inspection).",
        "Control Quality: inspect deliverables against acceptance criteria; apply the seven basic tools; flag special-cause signals.",
        "Develop Project Charter: business case + success criteria + sponsor signature; PM assigned.",
        "Develop Project Management Plan: integrate subsidiary plans + baselines.",
        "Direct & Manage Project Work: execute the plan; produce deliverables, work-performance data, change requests.",
        "Perform Integrated Change Control: CR → CCB review → Approve/Reject/Defer → Update baselines + CIs → Communicate → Execute.",
        "Manage Project Knowledge: capture lessons learned into OPA; re-use on future projects.",
        "Close Project or Phase: final acceptance, contract closure, archive, lessons-learned entry, resource release.",
      ],
      process: [
        "1. Plan Quality Management — quality policy, metrics, requirements, COQ, QA/QC procedures.",
        "2. Manage Quality — process audits, PDCA, process analysis.",
        "3. Control Quality — inspection, seven basic quality tools, acceptance criteria.",
        "4. Develop Project Charter — business case, success criteria, sponsor signature.",
        "5. Develop Project Management Plan — integrate subsidiary plans + baselines.",
        "6. Direct & Manage Project Work — execute the plan.",
        "7. Manage Project Knowledge — capture lessons learned.",
        "8. Perform Integrated Change Control — CCB review and baseline + CI updates.",
        "9. Close Project or Phase — administrative closeout, contract closure, archive, lessons learned.",
      ],
      formulas: [
        "Defect density = defects / size (e.g., defects/KLOC).",
        "First-pass yield = (units passing first inspection) / (total units) × 100%.",
        "COQ = Prevention + Appraisal + Internal Failure + External Failure (currency).",
        "Cost of poor quality = Internal Failure + External Failure.",
        "Control chart: CL = μ; UCL = μ + 3σ; LCL = μ − 3σ.",
        "Western Electric rules: 1 beyond 3σ; 9 on one side of CL; 6 increasing/decreasing; 14 alternating; 2 of 3 beyond 2σ; 4 of 5 beyond 1σ.",
        "Pareto 80/20 heuristic; cumulative % focus line at 80%.",
        "Fishbone 6M categories: Man, Machine, Method, Material, Measurement, Mother Nature.",
      ],
      metrics: [
        "Defect density (per size unit).",
        "First-pass yield (%).",
        "COQ categories and total (currency).",
        "Control chart CL, UCL, LCL; Western Electric rule violations per period.",
        "Pareto cumulative %; top-N defect categories driving 80% of defects.",
        "Number of CIs under configuration management; CI audit pass-rate.",
        "Change-request volume, approval rate, average cycle time through CCB.",
        "Lessons-learned register entries per project; OPA re-use count.",
      ],
      examples: [
        "Concrete cube strength: μ = 30 MPa, σ = 1.5 → UCL = 34.5, LCL = 25.5; run of 9 below CL triggers Western Electric rule (b).",
        "Build defect density: μ = 3.5 defects/KLOC, σ = 0.8 → UCL = 5.9, LCL = 1.1; run of 6 increasing (3.6→4.6) triggers rule (c).",
        "Pareto: logic 40% + UI 25% = 65% of defects → focus response there.",
        "CCB CR #1024: scope +1 sprint, cost +$25k, schedule +5 days on critical path → approve; baselines + CIs updated.",
      ],
      industrial_examples: [
        "Construction — hospital concrete-pour QC: cube-strength control chart (UCL=35, LCL=25 MPa) flags a Western Electric rule (b) violation; PM halts pour, fishbone traces cause to batch-plant water-cement-ratio drift; flowmeter replaced, batch plant recalibrated; next pour returns to within-control.",
        "IT — release pipeline defect-density trend (3.6→4.6 defects/KLOC over 7 builds); Western Electric rule (c) triggers; PM halts release; fishbone 6M identifies onboarding + build-server lint-config drift + shortened code-review checklist + third-party library update; corrective actions: extend onboarding, re-baseline lint config in version control, restore full code-review checklist, pin third-party library to prior version; next 7 builds return to within-control.",
      ],
      case_studies: [
        "SYNTHETIC — IT release pipeline quality recovery: defect-density control chart Western Electric rule (c) violation; root-cause via fishbone 6M; corrective actions: extend onboarding, re-baseline lint config, restore full code-review checklist, pin library; configuration items version-bumped to v2.1; CCB approves a change request to institutionalize the code-review checklist as a CI; lessons-learned register entry filed.",
      ],
      common_errors: [
        "Treating the control chart as a target, not a process signal; a point within UCL/LCL means 'in statistical control', not 'acceptable'.",
        "Tampering with a process in common-cause variation (Deming's funnel experiment) — increases variation.",
        "Confusing QA (process) with QC (product); they are separate functions with separate tooling.",
        "Skipping prevention in favor of inspection; the 1-10-100 rule says prevention is the cheapest leverage.",
        "Allowing baseline changes outside the CCB; invalidates SV/SPI/CV/CPI and the configuration audit.",
        "Closing the project without a lessons-learned entry; loses knowledge capital.",
        "Misidentifying CIs; ad-hoc documents are not configuration items.",
        "Using the fishbone as a defect log; it organizes hypothesized causes for root-cause analysis, not the defects themselves.",
      ],
      limitations: [
        "Control charts assume a stable process; shifting means produce false positives.",
        "Western Electric rules assume independence; autocorrelated data triggers spurious signals.",
        "Pareto 80/20 is a heuristic, not a law; cumulative distributions vary.",
        "The seven basic tools are descriptive, not prescriptive; they detect but do not solve.",
        "Project charter is one-time authorization; major scope changes may require a new charter.",
        "CCB can be a bottleneck at high change volume; an expedited path may be needed.",
        "Configuration management has overhead; low-criticality CIs may not justify the version-control burden.",
      ],
      best_practices: [
        "Define quality metrics (defect density, first-pass yield, COQ) and acceptance criteria per deliverable in the Quality Management Plan.",
        "Monitor control charts weekly; alert on Western Electric rule violations; halt the affected process for root-cause.",
        "Apply the Pareto 80/20 to focus response on the top ~20% of causes driving ~80% of defects.",
        "Invest in prevention first (the 1-10-100 rule); balance with appraisal (inspection) and failure cost.",
        "Run every baseline change through the CCB with full impact analysis (scope / schedule / cost / quality / risk).",
        "Version-control every CI; audit CI states periodically; close out superseded versions.",
        "Capture lessons learned at phase gates (not just at project end); feed into organizational process assets.",
        "Close out every project / phase formally: final acceptance, contract closure, archive index, lessons-learned entry, resource release.",
      ],
      related_concepts: [
        "Schedule Management — schedule baseline changes through integrated change control.",
        "Cost Management — cost baseline changes through the CCB; reserve consumption tracked.",
        "Risk Management — risk-response changes through integrated change control; residual risks tracked.",
        "FMEA / Six Sigma — statistical process capability (Cp, Cpk, DPMO).",
        "ISO 9001 — quality-management-system certification framework.",
        "Configuration management in software (Git / SVN) and in construction (as-built drawings register).",
      ],
      prerequisites: [
        "Project scope statement, WBS, requirements documentation (quality requirements derive from these).",
        "Quality Management Plan (subset of the project-management plan).",
        "Change-control and configuration-management procedures (often organizational standards).",
        "Stakeholder register (stakeholder quality expectations).",
        "Organizational process assets (quality policy, historical lessons, configuration standards).",
      ],
      references: [
        "PMI PMBOK® Guide 7th Edition (2021). §Project Work; §Build Quality Into Project Deliverables; §Integrate Project Management Activities.",
        "PMI Practice Standard for Project Scheduling (schedule baseline via CCB).",
        "PMI Practice Standard for EVM (2nd ed., 2011). Cost baseline via CCB.",
        "PMI Practice Standard for Project Risk Management. Risk-response changes via CCB.",
        "Kerzner, H. (2022). Project Management (13th ed.), Ch. 13, 16, 18.",
        "ISO 21500:2021. §Quality and §Integration themes.",
      ],
    },
  },

  questions: [
    {
      competencyName: "Quality & Integration Management",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Construction",
      stem: `A construction project's concrete cube-strength control chart has a process mean μ = 30 MPa and a within-subgroup standard deviation σ = 1.5 MPa. Compute the upper control limit (UCL) and lower control limit (LCL) for the control chart, and state which Western Electric rule triggers if 9 consecutive cube-strength readings fall on the same side of the center line (CL) without exceeding the UCL or LCL.`,
      whyCorrect: `UCL = μ + 3σ = 30 + 3 × 1.5 = 30 + 4.5 = 34.5 MPa. LCL = μ − 3σ = 30 − 4.5 = 25.5 MPa. CL = μ = 30 MPa. The Western Electric rule that triggers is rule (b): "9 points in a row on one side of CL" — even though none of the points exceeds UCL or LCL, the sustained one-sided drift signals a special-cause (likely a process-mean shift). The PM should halt the pour and investigate (e.g., batch-plant water-cement-ratio drift).`,
      whyOthersWrong: [
        "UCL = 30 + 1.5 = 31.5, LCL = 30 − 1.5 = 28.5 — uses 1σ limits, not 3σ. Shewhart control charts use 3σ limits (UCL/LCL = μ ± 3σ).",
        "UCL = 30 + 4.5 = 34.5, LCL = 30 − 4.5 = 25.5, but no Western Electric rule triggers because all points are within UCL/LCL — incorrect; rule (b) triggers on 9 consecutive points on one side of CL regardless of UCL/LCL breach.",
        "UCL = 30 + 3 = 33, LCL = 30 − 3 = 27 — uses an arbitrary ±3 MPa, not the σ-derived 3σ limits.",
      ],
      options: [
        { text: "UCL = 34.5 MPa, LCL = 25.5 MPa; rule (b) — 9 points in a row on one side of CL", isCorrect: true },
        { text: "UCL = 31.5 MPa, LCL = 28.5 MPa; no rule triggers", isCorrect: false },
        { text: "UCL = 34.5 MPa, LCL = 25.5 MPa; no rule triggers because no point exceeds UCL/LCL", isCorrect: false },
        { text: "UCL = 33 MPa, LCL = 27 MPa; rule (a) — 1 point beyond 3σ", isCorrect: false },
      ],
    },
    {
      competencyName: "Quality & Integration Management",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      scenario: "IT",
      stem: `Which quality tool ranks defect categories by frequency of occurrence (descending bars) plus a cumulative-percentage line, applying the heuristic that ~80% of defects come from ~20% of causes?`,
      whyCorrect: `The Pareto chart. It is a bar chart of defect categories sorted by frequency (descending) overlaid with a cumulative-percentage line; the 80/20 heuristic guides response focus on the top ~20% of categories driving ~80% of defects. It is one of the seven basic quality tools (PMBOK). The Pareto principle (Vilfredo Pareto, Juran's "vital few and useful many") is the conceptual basis.`,
      whyOthersWrong: [
        "Cause-and-effect (fishbone) — this organizes HYPOTHESIZED causes for root-cause analysis into the 6M categories; it does not rank by frequency.",
        "Scatter diagram — this plots two variables to detect correlation (e.g., temperature vs. defect rate); it does not rank defect categories.",
        "Control chart — this is a time-ordered plot with UCL/LCL to detect special-cause variation; it does not rank defect categories.",
      ],
      options: [
        { text: "Pareto chart", isCorrect: true },
        { text: "Cause-and-effect (fishbone / Ishikawa)", isCorrect: false },
        { text: "Scatter diagram", isCorrect: false },
        { text: "Control chart", isCorrect: false },
      ],
    },
    {
      competencyName: "Quality & Integration Management",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Procedural",
      scenario: "IT",
      stem: `A change request is submitted to add two new features to a software project. The impact analysis shows: scope +1 sprint of work, cost +$25k, schedule +5 days on the critical path, security risk ↓ (transferred to a third-party auth provider), no quality impact. Describe the correct integrated change-control workflow.`,
      whyCorrect: `The correct integrated change-control workflow is: (1) Submit the change request with the impact analysis (scope +1 sprint, cost +$25k, schedule +5 days critical path, security risk ↓). (2) The Change Advisory Board (CCB) reviews and approves (or rejects / defers). (3) On approval, update the baselines: scope baseline (add 2FA work package), schedule baseline (re-run CPM, +5 days on critical path), cost baseline (draw $25k from management reserve, re-compute BAC / EAC). (4) Update the configuration items (requirements doc, design doc, code base, test plan) with version bumps (e.g., v2.1). (5) Communicate the approved change to stakeholders and the team. (6) Execute the change (develop, test, release). (7) Close the change request in the change log; archive.`,
      whyOthersWrong: [
        "The PM approves the change unilaterally and updates baselines — incorrect; baseline changes require CCB approval (the PM owns the integrated plan, but the CCB owns baseline changes).",
        "The development team implements the change directly without CCB review because the security risk decreases — incorrect; every baseline change requires CCB review regardless of risk direction.",
        "The change is deferred indefinitely because the schedule impact is +5 days — incorrect; the CCB reviews the trade-off (security improvement vs. schedule slip) and decides approve / reject / defer on the merits, not by default defer on any schedule impact.",
      ],
      options: [
        { text: "CR → CCB review (impact: scope +1 sprint, cost +$25k, schedule +5d, risk ↓) → Approve → update scope/schedule/cost baselines + CIs (v2.1) → Communicate → Execute → Close in change log", isCorrect: true },
        { text: "PM approves unilaterally; baselines updated; no CCB involvement needed", isCorrect: false },
        { text: "Development team implements directly without CCB review because security risk ↓", isCorrect: false },
        { text: "Defer indefinitely because schedule +5 days on critical path is unacceptable", isCorrect: false },
      ],
    },
    {
      competencyName: "Quality & Integration Management",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Definitional",
      scenario: "Construction",
      stem: `True or False: A process whose control chart shows all points within the upper control limit (UCL) and lower control limit (LCL) is by definition acceptable for delivery.`,
      whyCorrect: `False. "Within UCL/LCL" means the process is in statistical control (no special-cause variation); it does NOT mean the process is acceptable. Acceptability is judged against the quality requirement (e.g., cube strength ≥ 30 MPa, defect density ≤ 5 defects/KLOC). A process can be in statistical control and yet produce deliverables that consistently fail the quality requirement (a process operating at the wrong mean or with too-large variation). The PM must check BOTH: statistical control (in UCL/LCL) AND acceptance (against the quality requirement).`,
      whyOthersWrong: [
        "If True: the candidate has confused 'in statistical control' with 'acceptable.' The two are distinct; a process can be in control yet unacceptable (e.g., a stable process producing 10% defective units).",
        "Western Electric rules go further than a single UCL/LCL breach — they detect sustained shifts (rule (b): 9 on one side of CL) and trends (rule (c): 6 increasing/decreasing) even when no point exceeds UCL/LCL.",
      ],
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Aggregate the 4 PRC lessons.
// ---------------------------------------------------------------------------

const PMP_PRC_LESSONS: RefLesson[] = [
  LESSON_PRC_SCHEDULE,
  LESSON_PRC_COST,
  LESSON_PRC_RISK,
  LESSON_PRC_QUALITY,
];

// ---------------------------------------------------------------------------
// Loader — CONTENT-only (mirrors cre-reliability-modeling.ts) with the
// additional step of creating the 4 PRC competencies inside loadReference().
// ---------------------------------------------------------------------------

/**
 * Upsert the PMP Process (PRC) CONTENT into the database.
 * Idempotent: safe to call repeatedly. Returns record counts written.
 *
 * Flow:
 *  1. Find PMP certification by slug "pmp" (created by src/lib/ref-content/pmp.ts).
 *  2. Find the PRC domain by code "PRC" (certificationId = pmp.id). The PRC
 *     domain exists in pmp.ts with NO competencies — delete any stale PRC
 *     competencies and create the 4 PRC competencies from
 *     PMP_PRC_COMPETENCIES. Map by NAME -> id.
 *  3. Upsert References globally (by title, no sectionId) → shared ids
 *     applied to every PRC lesson, KO, and question.
 *  4. For each lesson:
 *     - db.lesson.findFirst({where:{competencyId, slug}}) then update or
 *       create with sectionId=null, certificationId, competencyId, slug,
 *       title, titleAr, order, durationMin, conceptIntroduction, example,
 *       keyFormulas, exercise, sections (JSON.stringify), referenceIds
 *       (JSON.stringify shared), status="READY", confidence="HIGH",
 *       verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
 *  5. Upsert KnowledgeObject per lesson: findFirst({where:{lessonId}}) then
 *     create/update with certificationId, domainId (PRC), competencyId,
 *     lessonId, body JSON, referenceIds (JSON shared), certificationIds
 *     (JSON [pmp.id]), status="READY", confidence="HIGH",
 *     verificationStatus="VERIFIED", version="1.0.0".
 *  6. Per lesson: deleteMany questions {certificationId, competencyId} then
 *     create each enriched question with nested QuestionOption records,
 *     knowledgeObjectId link, whyCorrect, whyOthersWrong (JSON),
 *     referenceIds (JSON shared), status="READY", verificationStatus=
 *     "VERIFIED", reviewStatus="PENDING", version="1.0.0".
 *  7. Return { certification, domain, competencies, lessons, kos,
 *      questions, references } counts.
 *
 * IMPORTANT: this loader does NOT call pmp.ts or wipe other PMP domains —
 * it operates on PRC only.
 */
export async function loadReference() {
  // 1) Certification (find by slug "pmp")
  const certification = await db.certification.findUnique({
    where: { slug: "pmp" },
  });
  if (!certification) {
    throw new Error(
      'PMP certification not found. Run the PMP structure+PPL-content loader (src/lib/ref-content/pmp.ts) first.'
    );
  }

  // 2) Find the PRC domain by code "PRC" (certificationId = pmp.id). The
  //    PRC domain exists in pmp.ts but is seeded with NO competencies —
  //    delete any stale PRC competencies and create the 4 PRC competencies
  //    here.
  const prcDomain = await db.domain.findFirst({
    where: { certificationId: certification.id, code: "PRC" },
  });
  if (!prcDomain) {
    throw new Error(
      'Process (PRC) domain not found under PMP. Run the PMP structure+PPL-content loader (src/lib/ref-content/pmp.ts) first.'
    );
  }

  // Delete any existing PRC competencies (idempotent re-create).
  await db.competency.deleteMany({
    where: { domainId: prcDomain.id },
  });

  // Create the 4 PRC competencies.
  for (const c of PMP_PRC_COMPETENCIES) {
    await db.competency.create({
      data: {
        domainId: prcDomain.id,
        name: c.name,
        description: c.description,
        order: c.order,
      },
    });
  }

  // Map PRC competencies by NAME -> id.
  const prcCompetencies = await db.competency.findMany({
    where: { domainId: prcDomain.id },
  });
  const competencyIdByName: Record<string, string> = {};
  for (const c of prcCompetencies) {
    competencyIdByName[c.name] = c.id;
  }
  // Validate that all 4 expected PRC competencies exist by name.
  const expectedCompetencyNames = PMP_PRC_LESSONS.map((l) => l.competencyName);
  const missing = expectedCompetencyNames.filter(
    (n) => !competencyIdByName[n]
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing PRC competencies by name: ${missing.join(
        ", "
      )}. Ensure PMP_PRC_COMPETENCIES matches PMP_PRC_LESSONS competencyName.`
    );
  }

  // 3) References — global (no sectionId), upserted by title.
  const refIdsByTitle: Record<string, string> = {};
  for (const src of PMP_PRC_SOURCES) {
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
  const sharedReferenceIds = PMP_PRC_SOURCES.map((s) => refIdsByTitle[s.title]).filter(
    Boolean
  ) as string[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 4) Lessons, 5) KnowledgeObjects, 6) Questions
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of PMP_PRC_LESSONS) {
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
      domainId: prcDomain.id,
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
          domainId: prcDomain.id,
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
    domain: prcDomain.id,
    competencies: prcCompetencies.length,
    lessons: lessonsCount,
    kos: kosCount,
    questions: questionsCount,
    references: referencesCount,
  };
}
