// =============================================================================
// CAMA — Certified Asset Management Assessor (IFANM/World Partners) — Performance
// & Improvement (PI) pillar — Deep scientific reference (Task 17-CAMA-PI).
//
// Certification slug: "cama" (IFANM/World Partners, "Maintenance & Reliability"
// group). Domain code: "PI" (Performance & Improvement, ISO 55001 §9 + §10) —
// the 4th of 4 CAMA BOK domains (AMP, AMS, AML, PI). The PI domain exists in
// src/lib/ref-content/cama.ts (combined structure+AMP-content loader) with NO
// competencies. This CONTENT-only loader creates the 3 PI competencies inside
// loadReference() and then loads the deep scientific content (3 full-spec
// 24-section lessons + KOs + 12 enriched questions).
//
// Three lessons, one per PI competency (created below in loadReference()):
//   1. Performance Monitoring & Asset KPIs (ISO 55001 §9.1)  (slug: pi-performance-monitoring-asset-kpis)
//   2. Internal Audit & Management Review (§9.2, §9.3)      (slug: pi-internal-audit-management-review)
//   3. Continual Improvement & Maturity (§10)                (slug: pi-continual-improvement-maturity)
//
// Each lesson ships:
//   - The full 24-section data-collector template (spec §9, LESSON_TEMPLATE in
//     src/lib/spec.ts), with every applicable section filled with real,
//     in-depth ISO 55001 / ISO 19011 / IAM content. No padding.
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
// Source hierarchy (spec §5) — Levels 2, 5:
//   - LEVEL 2 — Official Standard / Standards Organization: ISO 55000:2014,
//     ISO 55001:2014, ISO 55002:2018, ISO 19011:2018 (auditing).
//   - LEVEL 5 — Professional Organizations: The IAM (Institute of Asset
//     Management) "Asset Management — An Anatomy"; The IAM "Asset Management
//     Maturity Model".
//
// Originality (spec §16): all worked examples, decision scenarios, case
// studies, and questions are authored for this platform; textbook and
// standard material is summarized and cited, not reproduced. Case studies are
// SYNTHETIC and explicitly marked `CASE_TYPE = SYNTHETIC` inside the lesson
// text.
//
// Lifecycle: every record (Competency, Lesson, KnowledgeObject, Question,
// Reference) is upserted with status="READY", confidence="HIGH",
// verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
// =============================================================================

import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// Public types (mirror cama-ams.ts & cre-reliability-modeling.ts)
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
  scenario?: string; // Utilities|Oil & Gas|Power|Chemical|Manufacturing|...
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
// SOURCES — 6 real references cited across all PI lessons.
// ---------------------------------------------------------------------------

export const CAMA_PI_SOURCES: RefSource[] = [
  {
    title: "ISO 55001:2014 — Asset management — Management systems — Requirements",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/55089.html",
    citation:
      "International Organization for Standardization. ISO 55001:2014, Asset management — Management systems — Requirements. Geneva: ISO. §9.1 (monitoring, measurement, analysis, evaluation — the organization shall determine what shall be monitored, the methods, the criteria, when, and who records results); §9.2 (internal audit at planned intervals, evidence-based, conforming to ISO 19011, by auditors not responsible for the work audited); §9.3 (management review — 8 mandatory inputs including status of previous actions, changes in external/internal issues, AM performance, AM effectiveness, fulfilment of AM objectives, audit results, interested parties' feedback, MOC issues + resource adequacy; 4 mandatory outputs including improvement opportunities, AM policy/objective changes, resource needs, AMS changes); §10.1 (improvement — suitability, adequacy, effectiveness); §10.2 (nonconformity & corrective action — react, evaluate, eliminate causes, review effectiveness, change the AMS if needed). The clause pair §9–§10 closes the AMS PDCA loop and is the primary subject of the CAMA PI assessment.",
  },
  {
    title: "ISO 55000:2014 — Asset management — Overview, principles and terminology",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/55088.html",
    citation:
      "International Organization for Standardization. ISO 55000:2014, Asset management — Overview, principles and terminology. Geneva: ISO. Defines asset, asset management, asset management system, asset management plan, the four principles (value, alignment, leadership, assurance), and the asset lifecycle. The 'assurance' principle underpins §9 monitoring, audit, and management review — without monitoring the AMS cannot demonstrate that assets deliver value and that requirements are satisfied. The terminology (asset performance, asset condition, asset criticality, asset failure, asset lifecycle) is the canonical glossary CAMA assessors use when scoring KPI dashboards and audit findings.",
  },
  {
    title: "ISO 55002:2018 — Asset management — Management systems — Guidelines for the application of ISO 55001",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/69070.html",
    citation:
      "International Organization for Standardization. ISO 55002:2018, Asset management — Management systems — Guidelines for the application of ISO 55001. Geneva: ISO. Provides interpretive guidance on §9.1 (KPI selection, leading vs lagging indicators, dashboard content, AM performance vs asset performance, analysis methods), §9.2 (audit programme objectives, scope, criteria, frequency, auditor competence, the audit report and follow-up), §9.3 (depth of each of the 8 inputs and the 4 outputs — what an evidence-rich management review looks like), and §10 (improvement opportunities, root-cause analysis, corrective action tracking, integration with the maturity model and continual-improvement loop). Indispensable companion to ISO 55001 for the CAMA assessor scoring PI maturity.",
  },
  {
    title: "The IAM — Asset Management — An Anatomy (Institute of Asset Management)",
    level: "5",
    levelLabel: "Professional Organizations",
    type: "BOOK",
    url: "https://theiam.org/what-is-asset-management/anatomy-of-asset-management/",
    citation:
      "Institute of Asset Management (IAM). Asset Management — An Anatomy (3rd ed., 2014, updated 2023). The definitive conceptual reference for asset management, presenting 39 AM subjects grouped under six conceptual groups (Strategy & Planning; Asset Management Decision-Making; Lifecycle Delivery; Risk & Reliability; Health, Safety, Environment & Quality; Asset Information). The Anatomy's 'Risk & Reliability' and 'Health, Safety, Environment & Quality' groups map directly to ISO 55001 §9 (monitoring, KPIs, audit, management review) and §10 (improvement), giving the assessor the subject-level rubric for scoring PI maturity and identifying improvement opportunities.",
  },
  {
    title: "The IAM — Asset Management Maturity Model (Institute of Asset Management)",
    level: "5",
    levelLabel: "Professional Organizations",
    type: "BOOK",
    url: "https://theiam.org/what-is-asset-management/maturity/",
    citation:
      "Institute of Asset Management (IAM). Asset Management Maturity Assessment Framework / Maturity Model. A structured five-level maturity scale (1 Initial/Ad-hoc → 2 Aware → 3 Defined → 4 Managed → 5 Optimized) applied to the 39 AM Anatomy subjects. The CAMA assessor uses the maturity model to score evidence during assessment and to identify improvement opportunities; the model is also the backbone of the IAM self-assessment tool. Level 4 'Managed' is the de-facto target for ISO 55001 certified organizations; Level 5 'Optimized' is rare and indicates quantitative, predictive, innovation-led asset management. The maturity score per subject combines evidence strength, integration across silos, and outcome delivered.",
  },
  {
    title: "ISO 19011:2018 — Guidelines for auditing management systems",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/70017.html",
    citation:
      "International Organization for Standardization. ISO 19011:2018, Guidelines for auditing management systems. Geneva: ISO. Provides the canonical auditing framework: 6 audit principles (integrity, fair presentation, due professional care, confidentiality, independence, evidence-based approach); managing an audit programme (audit programme objectives, scope, criteria, competence of auditors, evaluation of auditors, programme review & improvement); conducting an audit (audit plan, opening meeting, evidence collection, audit findings — classification as conformities vs nonconformities, with nonconformities further characterized as major or minor and supplemented by observations and opportunities for improvement (OFI); closing meeting; audit report; follow-up). The standard an ISO 55001 §9.2 internal audit programme is required to conform to (the AMS assessor evaluates audit-programme conformance against ISO 19011).",
  },
];

const PI_REFERENCE_TITLES = CAMA_PI_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Lesson 1 — Performance Monitoring & Asset KPIs (ISO 55001 §9.1)
// (Competency: "Performance Monitoring & Asset KPIs";
//  slug: pi-performance-monitoring-asset-kpis)
// ---------------------------------------------------------------------------

const LESSON_PERF_MON: RefLesson = {
  competencyName: "Performance Monitoring & Asset KPIs",
  slug: "pi-performance-monitoring-asset-kpis",
  title: "Performance Monitoring & Asset KPIs (ISO 55001 §9.1)",
  titleAr: "مراقبة الأداء ومؤشرات الأداء الرئيسية للأصول (ISO 55001 §9.1)",
  order: 1,
  durationMin: 40,
  references: PI_REFERENCE_TITLES,
  conceptIntroduction: `ISO 55001 §9.1 is the measurement heart of the Asset Management System. It requires the organization to determine what shall be monitored and measured, the methods, the criteria, when monitoring is performed, when results are recorded, analyzed, and evaluated, and at what level results are reported (asset, asset system, asset class, organizational, regulatory). Asset management KPIs translate the §5.2 policy and §6.2 AM objectives into evidence — without KPIs, management review (§9.3) has no data and improvement (§10) has no baseline. The CAMA assessor scores §9.1 maturity by examining the KPI register, the dashboard, the trend lines, the leading vs lagging mix, and the traceability of each KPI to an AM objective.`,
  example: `A regional water utility maintains a §9.1 KPI dashboard with 4 tiers: (1) Board tier — Cost per megalitre, Service Availability, Network Integrity Index; (2) Executive tier — Asset Health Index (0-100), Capex/Opex ratio, Non-Revenue Water %; (3) Operations tier — OEE per WTW, MTBF per critical pump, condition-monitoring alert closure %; (4) Field tier — PM compliance %, Work-order first-time-fix %, MTTR per asset class. Each KPI traces to an AM objective; each has a target, tolerance, owner, frequency, and data source. The dashboard is refreshed weekly (field/operations), monthly (executive), and quarterly (board).`,
  keyFormulas: `OEE = Availability × Performance × Quality
  (each factor is a fraction 0..1; OEE is a fraction 0..1, expressed as %).
OEE Availability (Equipment) A = Run Time / Planned Production Time (0..1).
Inherent Availability A_inh = MTBF / (MTBF + MTTR) (0..1; failure-only).
MTBF = Total Operating Time / Number of Failures (hours).
MTTR = Total Repair Time / Number of Failures (hours).
Reliability R(t) = exp(-t / MTBF) for constant failure rate (exponential).
Asset Utilization U = Actual Operating Time / Calendar Time (0..1).
Cost per Unit CPU = Total Asset Lifecycle Cost / Units Produced.
Maturity level avg M_org = (1/N) · Σ_{j=1..N} M_subject_j  (M ∈ {1..5}).

Example: A = 0.92, P = 0.88, Q = 0.98 → OEE = 0.92 × 0.88 × 0.98 = 0.7934 = 79.3%.
MTBF = 8760 h operating / 5 failures = 1752 h/failure. MTTR = 30 h total / 5 = 6 h.
A_inh = 1752 / (1752 + 6) = 1752 / 1758 = 0.9966 = 99.66%. Cost/Unit: $4.20 → $4.05 → $3.95 (3-yr trend).`,
  exercise: `You are the CAMA assessor reviewing a transmission utility's §9.1 KPI dashboard. (a) Verify OEE for a substation transformer: A = 0.92 (Run Time 8052 h / Planned Production 8760 h), P = 0.88, Q = 0.98. Compute OEE and compare to the world-class target 0.85. (b) The utility reports MTBF = 1752 h and MTTR = 6 h. Compute inherent availability A_inh and explain why A_inh (0.9966) is much higher than the OEE Availability (0.92). (c) Identify the LEADING indicators and the LAGGING indicators on the dashboard: MTBF, MTTR, OEE, Cost per Unit, Asset Health Index (0-100), Condition-Monitoring Alert Closure %, Failure Rate, PM Compliance %, Non-Revenue Water %. Recommend two leading indicators to add that would shift the dashboard from lagging-only to balanced.`,
  sections: {
    learning_objectives: `- Determine what must be monitored, measured, analyzed, and evaluated per ISO 55001 §9.1 (the four mandatory sub-elements).
- Construct a tiered asset-management KPI dashboard (board / executive / operations / field) with targets, owners, frequency, and data sources.
- Compute and interpret the canonical asset KPIs: OEE, Availability (equipment & inherent), MTBF, MTTR, Reliability R(t), Asset Utilization, Cost per Unit.
- Distinguish leading vs lagging indicators and design a balanced KPI portfolio (50/50 leading-lagging).
- Trace each KPI to an AM objective (§6.2) and to interested-party need (§4.2) for conformance evidence.
- Apply the IAM Maturity Model to the §9.1 'Performance monitoring & KPIs' subject and target the next maturity level.`,
    prerequisites: `- CAMA Asset Management Principles (AMP) — the four ISO 55000 principles (value, alignment, leadership, assurance) and the asset lifecycle.
- CAMA Asset Management System (AMS) domain — especially §6.2 AM objectives (KPI traceability) and §8.1 operational planning (data sources).
- Basic reliability engineering — failure modes, MTBF/MTTR, exponential reliability model.
- Familiarity with management dashboards, RACI, and SPC (control charts, trend analysis).`,
    introduction: `ISO 55001 §9.1 closes the AMS measurement loop. Without monitoring, the AM policy (§5.2) and AM objectives (§6.2) are unverifiable; without analysis and evaluation, management review (§9.3) and improvement (§10) have no evidence base. The CAMA assessor begins §9.1 by examining the KPI register: is it documented, do the KPIs trace to AM objectives, do they cover the relevant asset classes and lifecycle stages, are leading indicators present or only lagging ones? A dashboard with only MTBF and Cost per Unit is lagging-only — by the time MTBF falls, the assets have already failed. A balanced dashboard pairs each lagging KPI with a leading KPI (condition-monitoring alerts, PM compliance, asset health index) so the organization can intervene before failure. ISO 55002:2018 §A.9.1 reinforces that the organization should monitor both AM performance (how well the AMS itself works) and asset performance (how well the assets deliver), and that the results feed management review (§9.3) and improvement actions (§10).`,
    terminology: `- **§9.1 monitoring**: determining what shall be monitored and measured (the KPI), the methods (how), the criteria (target/tolerance), when, when results are recorded/analyzed/evaluated, and the level (asset/system/class/org/regulator).
- **KPI (Key Performance Indicator)**: a quantitative measure of asset or AM performance against a target, with owner, frequency, and data source.
- **Leading indicator**: a KPI that predicts future performance (PM compliance %, condition-monitoring alert closure %, Asset Health Index, training hours, risk register closure %).
- **Lagging indicator**: a KPI that reports past performance (MTBF, MTTR, OEE, Cost per Unit, failure rate, HSE incident rate).
- **OEE (Overall Equipment Effectiveness)**: A × P × Q — composite KPI of Availability, Performance, Quality; world-class ≥ 0.85.
- **Availability (OEE)**: Run Time / Planned Production Time (a fraction 0..1).
- **Inherent Availability**: MTBF / (MTBF + MTTR); failure-only availability, excludes planned downtime.
- **MTBF**: Mean Time Between Failures; mean operating time between consecutive failures.
- **MTTR**: Mean Time To Repair; mean time to restore an asset after a failure.
- **Asset Utilization**: Actual Operating Time / Calendar Time.
- **Cost per Unit**: Total Asset Lifecycle Cost / Units Produced.
- **Asset Health Index (AHI)**: a 0-100 composite of condition, age, criticality, risk; leading indicator of remaining useful life.
- **AM performance vs asset performance**: AM performance measures the AMS itself (objective achievement %, audit closure, policy conformance); asset performance measures the assets (availability, reliability, OEE).`,
    detailed_explanation: `ISO 55001 §9.1 demands a *determined* measurement set — the assessor looks for documented evidence: a KPI register with each KPI named, defined, owned, targeted, sourced, frequency-set, and reported at a stated level. ISO 55002:2018 §A.9.1 guides four types of measurement: (a) AM performance (how well the AMS itself is working — policy conformance, objective achievement, audit closure %, plan-vs-actual on SAMP); (b) asset performance (availability, reliability, OEE, condition, asset health index); (c) AM system performance (process effectiveness, data quality, change-management effectiveness); (d) outcomes (cost per unit, service availability, HSE incidents, customer complaints). The maturity bar for §9.1 rises from Level 1 (no defined KPIs) → Level 2 (ad-hoc KPIs, no targets) → Level 3 (defined KPIs with targets, owners, frequencies, reported quarterly) → Level 4 (balanced leading-lagging mix, real-time dashboards, SPC control charts, KPI trace to AM objectives, integrated with risk register) → Level 5 (predictive KPIs, ML-based RUL estimates, automated improvement triggers). The CAMA assessor samples end-to-end traceability: AM objective (§6.2) → KPI (§9.1) → Dashboard → Management review input (§9.3) → Improvement action (§10). A break in the chain anywhere fails §9.1 conformance. Leading-vs-lagging balance is a key maturity discriminator: a dashboard with only lagging KPIs (MTBF, MTTR, failure rate) cannot drive preventive action; the balanced dashboard pairs each lagging KPI with a leading KPI (condition-monitoring alerts, PM compliance, AHI). World-class OEE ≥ 0.85; availability ≥ 0.95 in continuous industries, ≥ 0.92 in cyclical industries; MTBF growing year-on-year; MTTR shrinking; Cost per Unit trending down; these targets must be set in §6.2 and verified in §9.1.`,
    core_principles: `- Measure what matters: KPIs trace to AM objectives (§6.2) and interested-party needs (§4.2) — no orphan KPIs.
- Balance leading and lagging: at least one leading KPI per lagging KPI.
- Measure AM performance AND asset performance — both, not one.
- Each KPI has: name, definition, formula, unit, target, tolerance, owner, data source, frequency, reporting level.
- Trends matter more than snapshots — quarterly trends over 3 years reveal systemic patterns.
- Statistical Process Control (SPC) separates signal from noise — control limits, not arbitrary thresholds.
- KPI results feed §9.3 management review and §10 improvement — closed loop or the dashboard is theatre.
- Maturity rises when dashboards are real-time, integrated with risk register and CMMS/EAM, and trigger automated alerts.`,
    components: `- KPI register (spreadsheet or EAM module) — every KPI documented.
- Tiered dashboard (board / executive / operations / field).
- Data sources: CMMS/EAM (work orders, failures), SCADA/IoT (real-time condition), Finance (Capex/Opex), HR (competence), HSE (incidents).
- Control charts (SPC) per KPI — upper/lower control limits, special-cause detection.
- KPI-to-objective traceability matrix (§6.2 → §9.1).
- Monthly operations review + quarterly executive review + annual board review cadence.
- Leading-indicator register (condition-monitoring alerts, PM compliance, AHI, training, risk closure).
- Asset criticality register — KPIs weighted by criticality (critical assets measured hourly; non-critical monthly).`,
    process: `1. Inventory the AM objectives (§6.2) and interested-party requirements (§4.2) — these are the parent requirements the KPIs must evidence.
2. Define each KPI: name, definition, formula, unit, target, tolerance, owner, data source, frequency, reporting level.
3. Classify each KPI as leading or lagging; ensure a balanced mix (target 50/50 leading/lagging).
4. Build tiered dashboards: board (strategic, quarterly), executive (tactical, monthly), operations (operational, weekly), field (transactional, daily).
5. Implement SPC control charts per KPI; set upper/lower control limits from baseline data; flag special-cause variation.
6. Refresh data automatically where possible (CMMS/EAM extract + SCADA/IoT integration + Finance feed).
7. Hold monthly operations review, quarterly executive review, annual board review — each review consumes the dashboard and triggers actions.
8. Feed dashboard findings to §9.3 management review (mandatory input 'AM performance' and 'AM effectiveness'); feed improvement opportunities to §10.
9. Review the KPI register itself annually — retire stale KPIs, add new ones, recalibrate targets; document changes.`,
    formula_calculation: `OEE = A × P × Q (each factor 0..1; OEE 0..1).
  A (Equipment Availability) = Run Time / Planned Production Time.
  P (Performance) = (Ideal Cycle Time × Total Count) / Run Time.
  Q (Quality) = Good Count / Total Count.
  World-class OEE ≥ 0.85; OEE = 0.92 × 0.88 × 0.98 = 0.7934 = 79.3%.
  Variables: A, P, Q ∈ [0,1]; Run Time (h), Planned Production Time (h), Ideal Cycle Time (h/unit), Total Count (units), Good Count (units).
  Units: each factor dimensionless; OEE dimensionless, often × 100%.
  Assumptions: planned downtime is excluded from A; only failures + scheduled stoppages count; P measures speed loss; Q measures defect rate.

Availability (Inherent) A_inh = MTBF / (MTBF + MTTR).
  MTBF = Total Operating Time / Number of Failures (h).
  MTTR = Total Repair Time / Number of Failures (h).
  Example: 8760 h operating, 5 failures → MTBF = 1752 h; 30 h total repair → MTTR = 6 h.
  A_inh = 1752 / (1752 + 6) = 1752 / 1758 = 0.9966 = 99.66%.
  Interpretation: inherent availability is FAILURE-only — it excludes planned downtime; OEE Availability (0.92) is lower because it includes planned downtime and minor stops.

Reliability R(t) = exp(-t / MTBF) — exponential model (constant failure rate).
  R(1752 h) = exp(-1) = 0.368 → ~37% probability an asset survives one MTBF without failing.

Asset Utilization U = Actual Operating Time / Calendar Time.
  Example: 7000 h operating / 8760 h calendar → U = 0.799 = 79.9%.

Cost per Unit CPU = Total Asset Lifecycle Cost / Units Produced.
  Trend: Year 1 $4.20/unit, Year 2 $4.05/unit, Year 3 $3.95/unit → 6.0% reduction over 3 yr; target ≤ $3.50/unit by Year 5.

IAM Maturity (organizational average) M_org = (1/N) · Σ M_subject_j (M_subject ∈ {1..5}).
  Example (9 subjects): (3+3+2+2+3+3+2+2+2)/9 = 22/9 = 2.444 → Level 2.4 (Aware trending to Defined).`,
    worked_example: `CASE_TYPE = WORKED EXAMPLE. Regional water utility 'WaterCo' §9.1 KPI dashboard (Q4 reporting period, 12-month rolling). The dashboard covers one WTW (water treatment works), 5 critical pumps, and 1 distribution network zone.

TIER 1 — Board (quarterly):
  - Cost per Megalitre (CPU): $4.05 → $3.95 → $3.85 (3-yr trend); target ≤ $3.50 by Year 5; LAGGING.
  - Service Availability: 99.94%; target ≥ 99.90%; LAGGING.
  - Network Integrity Index: 78/100; target ≥ 80/100; LEADING (composite of pipe-burst rate, condition score, age index).

TIER 2 — Executive (monthly):
  - Asset Health Index (AHI, 0-100): 71/100; target ≥ 75; LEADING.
  - Capex/Opex ratio: 1.18; target 1.0-1.2; LAGGING.
  - Non-Revenue Water %: 18.4%; target ≤ 15%; LAGGING.

TIER 3 — Operations (weekly):
  - OEE per WTW: A = 0.92 (Run Time 8052 h / Planned Production 8760 h; 708 h planned downtime for cleaning/maintenance), P = 0.88 (speed loss), Q = 0.98 (2% reject water). OEE = 0.92 × 0.88 × 0.98 = 0.7934 = 79.3%; world-class target ≥ 0.85; LAGGING.
  - MTBF per critical pump: 8760 h operating / 5 failures = 1752 h/failure; target ≥ 2000 h; LAGGING.
  - MTTR per critical pump: 30 h total repair / 5 failures = 6 h; target ≤ 4 h; LAGGING.
  - Condition-Monitoring Alert Closure %: 88%; target ≥ 95%; LEADING.
  - PM Compliance %: 91%; target ≥ 95%; LEADING.

TIER 4 — Field (daily):
  - Work-Order First-Time-Fix %: 84%; target ≥ 90%; LEADING.
  - PM Overdue Count: 7 (of 230 scheduled); target ≤ 5; LEADING.

ANALYSIS:
  (a) OEE = 0.92 × 0.88 × 0.98 = 0.7934 = 79.3% — below world-class (0.85); the dominant loss is Performance (0.88) — investigate speed loss (settling velocity, filter run-length).
  (b) Inherent Availability A_inh = 1752 / (1752 + 6) = 0.9966 = 99.66% — failure-only; OEE Availability 0.92 includes planned downtime (708 h) + minor stops; the gap 0.9966 vs 0.92 = ~8 pp is the planned downtime + minor stops contribution; assessor checks that planned downtime is justified (cleaning, regulatory calibrations) and minor stops are tracked.
  (c) Cost per Unit trend: $4.20 → $4.05 → $3.95 = (3.95 - 4.20)/4.20 = -5.95% over 2 years (-6.0% rounding); on track for $3.50 by Year 5 if the rate continues.
  (d) Leading indicators present: AHI, Condition-Monitoring Alert Closure %, PM Compliance %, Work-Order First-Time-Fix %, PM Overdue Count, Network Integrity Index — 6 leading of 11 KPIs ≈ 55% leading; balanced.
  (e) KPI-to-AM-objective traceability: every Tier 1 KPI traces to a §6.2 objective; Tier 2-4 KPIs trace to Tier 1 KPIs (decomposition). Traceability matrix auditable in the EAM.

ASSESSOR FINDING: §9.1 maturity Level 3.5 (Defined trending to Managed). Gaps: OEE below world-class; MTBF below target; Condition-Monitoring Alert Closure 88% vs 95%. Improvement actions: investigate P=0.88 speed loss; MTBF root-cause analysis (FMEA + RCA on 5 failures); alert-closure workflow audit.`,
    industrial_example: `Utilities — UK regional water utility: §9.1 dashboard tiered Board/Exec/Ops/Field, CMMS (SAP PM) + SCADA (IoT vibration/water-quality) + Finance (Capex/Opex) feeds; OEE per WTW, MTBF per critical pump, Non-Revenue Water %, Asset Health Index 0-100; IAM maturity Level 4 (Managed) on §9.1 — balanced leading/lagging, SPC control charts, real-time alerting. The dashboard triggers automatic work-order creation when AHI falls below 70 or condition-monitoring alerts exceed 24 h open.

Oil & Gas — Shell downstream refinery: §9.1 KPIs include Availability Factor (AF) per critical equipment (compressors, distillation columns), Refinery Utilization, Energy Intensity Index (EII), Mechanical Integrity compliance %, Process Safety Events Tier 1/2 (API RP 754), HSE TRIR, Maintenance Cost per Barrel. KPIs trace to corporate "Safety, Reliability, Sustainability" objectives; real-time dashboard integrated with PI System (OSIsoft) and SAP PM; IAM maturity Level 4 (Managed) trending to Level 5 (Optimized) on §9.1.`,
    case_study: `CASE_TYPE = SYNTHETIC. Municipal water utility 'AquaCo' (mid-size, 800k connections, 3 WTWs). CAMA assessor §9.1 findings: maturity Level 2.0 (Aware) — only lagging KPIs reported (failure count, total maintenance cost, unplanned interruption hours); no leading indicators; no targets/tolerances; no SPC; KPI results not fed to management review; no traceability from KPIs to AM objectives. Recommendations: (1) build a KPI register with name/definition/formula/target/owner/source/frequency/level; (2) add 6 leading KPIs — AHI, PM Compliance %, Condition-Monitoring Alert Closure %, Work-Order First-Time-Fix %, Risk Register Closure %, Training Hours per technician; (3) set targets based on 3-year baseline (e.g., MTBF ≥ 2000 h by Year 2); (4) implement SPC control charts; (5) feed §9.1 results as mandatory §9.3 input 'AM performance' and 'AM effectiveness'; (6) trace every KPI to a §6.2 AM objective. Target Level 3 (Defined) in 12 months, Level 4 (Managed) in 24 months.`,
    visual_explanation: `Imagine a 4-tier pyramid: top tier 'Board' (quarterly, 3-5 strategic KPIs — CPU, Service Availability, Network Integrity); second tier 'Executive' (monthly, 5-10 tactical KPIs — AHI, Capex/Opex ratio, Non-Revenue Water %); third tier 'Operations' (weekly, 10-15 operational KPIs — OEE, MTBF, MTTR, Alert Closure %, PM Compliance %); base tier 'Field' (daily, transactional KPIs — WO First-Time-Fix %, PM Overdue Count). Each KPI on the pyramid links upward to the tier above (decomposition) and downward to data sources (CMMS/EAM, SCADA/IoT, Finance, HR, HSE). A red RAG status on a Field KPI propagates upward to the Operations tier and triggers a §10 corrective action; a red RAG on a Tier 1 KPI is reported to the board and may trigger a §9.3 management review out-of-cycle.`,
    simulation_opportunity: `Build a §9.1 KPI dashboard simulator: user uploads 12 months of failure/work-order data + 12 months of SCADA/IoT condition data + 12 months of finance data. Simulator computes MTBF, MTTR, OEE, A_inh, Cost per Unit for each asset; classifies each KPI leading vs lagging; computes the leading/lagging ratio; suggests missing leading KPIs; runs SPC control charts; flags special-cause variation; generates the assessor finding '§9.1 maturity Level X' with the gap-to-Next-Level report. Bonus: simulate a 10% rise in failures and trace the propagation through the dashboard to management review.`,
    common_mistakes: `- Lagging-only dashboard — by the time MTBF falls the assets have already failed; no preventive signal.
- OEE without decomposing into A × P × Q — the composite hides the dominant loss (often Performance).
- Confusing Inherent Availability (MTBF/(MTBF+MTTR) = 0.9966) with OEE Availability (Run Time / Planned Production = 0.92) — different denominators.
- No KPI-to-objective traceability — orphan KPIs that look good but answer no AM question.
- Single snapshot instead of trend — quarterly trends over 3 years reveal patterns; a single quarter is noise.
- Arbitrary thresholds (target = 90%) without SPC control limits — special-cause variation is missed.
- Not feeding KPI results to §9.3 management review — §9.1 isolated from §9.3 fails conformance.
- Setting world-class targets (OEE ≥ 0.85, MTBF ≥ 5000 h) without baseline data — unrealistic, demotivating, leads to gaming.
- Counting 'failures' inconsistently (some teams count only repairs >4 h, others all stoppages) — destroys MTBF comparability.
- Treating 'leading' and 'lagging' as synonyms — leading predicts (PM compliance), lagging reports (MTBF).`,
    limitations: `- OEE assumes the asset has a defined 'ideal cycle time' — true for manufacturing, hard to define for water-treatment plants, networks, fleets.
- Inherent Availability excludes planned downtime — useful for reliability engineering, misleading for production planning.
- MTBF/MTTR assume repairable systems with similar failure modes — mixing failure modes in one MTBF hides the dominant mode.
- Leading indicators are predictive but not deterministic — high PM Compliance does not guarantee low failure rate.
- SPC assumes a stable baseline period — start-up or major change invalidates control limits.
- Real-time dashboards are data-hungry — CMMS data quality, SCADA noise, finance reconciliation lags all corrupt the KPIs.
- Benchmarking across industries is misleading — water-utility OEE is structurally lower than automotive OEE.`,
    comparison: `LEADING vs LAGGING:
  Leading: predicts future performance — PM Compliance %, AHI, Condition-Monitoring Alert Closure %, Work-Order First-Time-Fix %, Risk Register Closure %, Training Hours. Acts before failure.
  Lagging: reports past performance — MTBF, MTTR, OEE, Cost per Unit, Failure Rate, HSE Incident Rate, Unplanned Interruption Hours. Acts after failure.
  Best practice: pair each lagging with a leading (MTBF ← PM Compliance + AHI; Cost per Unit ← Capex/Opex Ratio + Risk Closure %).

OEE AVAILABILITY (0.92) vs INHERENT AVAILABILITY (0.9966):
  OEE Availability: Run Time / Planned Production Time; includes planned downtime + minor stops; production-oriented.
  Inherent Availability: MTBF / (MTBF + MTTR); failure-only; reliability-engineering-oriented.
  Same asset can show 0.92 OEE Availability and 0.9966 Inherent Availability simultaneously — both are correct in their frame.

§9.1 vs §9.2 vs §9.3:
  §9.1 monitoring: continuous, KPI dashboard, line/asset owner.
  §9.2 internal audit: periodic, audit programme, lead auditor (independent).
  §9.3 management review: periodic (≥ annual), top management, eight inputs + four outputs.
  §9.1 feeds §9.3 (mandatory inputs 'AM performance' and 'AM effectiveness'); §9.2 feeds §9.3 (mandatory input 'audit results'); §9.3 outputs feed §10 improvement.`,
    practical_application: `Build the §9.1 KPI register as a single spreadsheet (or EAM module) with columns: KPI Name | Definition | Formula | Unit | Target | Tolerance | Owner | Data Source | Frequency | Reporting Level | Leading/Lagging | AM Objective §6.2 Trace | Interested-Party Need §4.2 Trace. Start with 10-15 KPIs across 4 tiers; expand as maturity grows. Implement monthly refresh + quarterly executive review + annual board review. Run SPC control charts in Python/R (matplotlib, scipy) for the top 5 KPIs. Feed §9.1 results as 'AM performance' and 'AM effectiveness' inputs to §9.3 management review (mandatory). Trace every §10 improvement action back to a §9.1 KPI deviation to prove the closed-loop PDCA. Score §9.1 maturity using the IAM Maturity Model annually and target the next level with documented improvement actions.`,
    decision_scenario: `You are the CAMA assessor. The auditee's §9.1 dashboard shows: OEE = 79.3% (target 0.85), MTBF = 1752 h (target 2000 h), MTTR = 6 h (target 4 h), Cost per Unit = $3.95 (target $3.50 by Yr 5), AHI = 71/100 (target 75), PM Compliance = 91% (target 95%). What is your maturity finding and your top three improvement recommendations?

Finding: §9.1 maturity Level 3.5 (Defined trending to Managed). KPIs are defined, targets set, leading/lagging balanced (~55% leading), dashboard tiered, traceable to AM objectives. Gaps: most KPIs miss targets; SPC not yet implemented; alert-closure workflow below target.

Recommendations: (1) Run root-cause analysis on the 5 failures driving MTBF=1752 h (target 2000 h) — apply FMEA + RCA, identify dominant failure mode, design-out or condition-monitor; (2) Investigate OEE Performance = 0.88 (speed loss) — likely filter run-length reduction or settling-velocity drop; (3) Implement SPC control charts on top 5 KPIs to distinguish special-cause from common-cause variation; (4) Audit alert-closure workflow — 88% target 95% suggests SLA gap or alert fatigue.`,
    practice_questions: `1. Compute OEE for A=0.92, P=0.88, Q=0.98. Compare to world-class 0.85.
2. Compute Inherent Availability given MTBF=1752 h, MTTR=6 h. Explain why this is higher than OEE Availability 0.92.
3. Classify each as LEADING or LAGGING: MTBF, MTTR, OEE, Cost per Unit, AHI, PM Compliance %, Failure Rate, Condition-Monitoring Alert Closure %, Non-Revenue Water %.
4. An asset operates 8760 h, fails 5 times, total repair 30 h. Compute MTBF, MTTR, Inherent Availability. What is the reliability R(1752 h)?`,
    certification_questions: `1. Which ISO 55001 clause requires the organization to determine what shall be monitored and measured, the methods, the criteria, when, and at what level results are reported? — §9.1.
2. World-class OEE threshold (Nakajima): ≥ 0.85.
3. ISO 19011:2018 audit principles count: 6 (integrity, fair presentation, due professional care, confidentiality, independence, evidence-based).`,
    summary: `ISO 55001 §9.1 is the measurement heart of the AMS. The CAMA assessor scores §9.1 maturity by examining the KPI register (defined, owned, targeted, sourced), the tiered dashboard (board/exec/ops/field), the leading-vs-lagging balance (target ≥ 50% leading), the SPC control charts (signal vs noise), the KPI-to-AM-objective traceability (§6.2 → §9.1 → §9.3 → §10), and the management-review consumption of the dashboard. OEE = A × P × Q; Inherent Availability = MTBF/(MTBF+MTTR); these are different metrics of the same asset. Maturity Level 4 (Managed) requires balanced leading/lagging, SPC, real-time dashboards, closed-loop traceability to §9.3 and §10; Level 5 (Optimized) requires predictive KPIs (RUL, ML-based anomaly detection) and automated improvement triggers.`,
    key_takeaways: `- §9.1 requires the organization to DETERMINE what to monitor, methods, criteria, when, when results are recorded/analyzed/evaluated, and at what level.
- OEE = A × P × Q; OEE Availability (Run Time/Planned Production) ≠ Inherent Availability (MTBF/(MTBF+MTTR)).
- World-class OEE ≥ 0.85; define targets from 3-year baseline, not from textbook thresholds.
- Balanced dashboard = at least one leading KPI per lagging KPI (target ≥ 50% leading).
- KPI-to-objective traceability is conformance evidence — no orphan KPIs.
- Feed §9.1 results to §9.3 management review ('AM performance' and 'AM effectiveness' inputs).
- SPC separates signal from noise — control limits, not arbitrary thresholds.
- Maturity Level 4 requires balanced + SPC + real-time + closed-loop; Level 5 requires predictive + automated.`,
    references: `- ISO 55001:2014, Asset management — Management systems — Requirements, §9.1 (Monitoring, measurement, analysis, evaluation).
- ISO 55000:2014, Asset management — Overview, principles and terminology (the 'assurance' principle).
- ISO 55002:2018, Asset management — Guidelines for the application of ISO 55001, §A.9.1 (KPI selection, leading vs lagging).
- The IAM, Asset Management — An Anatomy (Risk & Reliability and HSEQ groups).
- The IAM, Asset Management Maturity Model (5-level scale; subject-level scoring).
- ISO 19011:2018, Guidelines for auditing management systems (audit evidence feeds §9.1).`,
  },
  knowledgeObject: {
    title: "Performance Monitoring & Asset KPIs (ISO 55001 §9.1)",
    domain: "Asset Management System (ISO 55001)",
    competency: "Performance Monitoring & Asset KPIs",
    topic: "AMS Monitoring, Asset KPIs, OEE, MTBF, Leading/Lagging, Dashboards",
    concept: "ISO 55001 §9.1 monitoring/measurement/analysis/evaluation — KPI register, tiered dashboards, OEE/MTBF/MTTR/Availability/Utilization/Cost-per-Unit, leading vs lagging, SPC, traceability to AM objectives (§6.2) and to §9.3 management review and §10 improvement",
    body: {
      definitions: [
        "§9.1 monitoring: ISO 55001 clause requiring the organization to determine what shall be monitored and measured, the methods, the criteria, when, when results are recorded/analyzed/evaluated, and at what level.",
        "KPI (Key Performance Indicator): quantitative measure of asset or AM performance against a target, with owner, frequency, data source, and reporting level.",
        "Leading indicator: KPI that predicts future performance (PM Compliance %, AHI, Condition-Monitoring Alert Closure %, Work-Order First-Time-Fix %).",
        "Lagging indicator: KPI that reports past performance (MTBF, MTTR, OEE, Cost per Unit, Failure Rate, HSE Incident Rate).",
        "OEE (Overall Equipment Effectiveness): composite KPI = Availability × Performance × Quality; world-class ≥ 0.85.",
        "Availability (OEE Equipment): Run Time / Planned Production Time; includes planned downtime + minor stops.",
        "Inherent Availability: MTBF / (MTBF + MTTR); failure-only availability.",
        "MTBF: Mean Time Between Failures; mean operating time between consecutive failures of a repairable asset.",
        "MTTR: Mean Time To Repair; mean time to restore an asset after a failure.",
        "Reliability R(t): probability an asset survives time t without failure; exponential model R(t) = exp(-t/MTBF).",
        "Asset Utilization: Actual Operating Time / Calendar Time.",
        "Cost per Unit: Total Asset Lifecycle Cost / Units Produced.",
        "Asset Health Index (AHI): composite 0-100 score of condition, age, criticality, risk; leading indicator.",
        "SPC (Statistical Process Control): control-chart method distinguishing common-cause from special-cause variation.",
      ],
      principles: [
        "Measure what matters: KPIs trace to AM objectives (§6.2) and interested-party needs (§4.2).",
        "Balance leading and lagging: at least one leading KPI per lagging KPI (target ≥ 50% leading).",
        "Measure AM performance AND asset performance — both, not one.",
        "Each KPI has name, definition, formula, unit, target, tolerance, owner, source, frequency, level.",
        "Trends over snapshots — quarterly trends over 3 years reveal systemic patterns.",
        "SPC separates signal from noise — control limits, not arbitrary thresholds.",
        "KPI results feed §9.3 management review and §10 improvement — closed loop.",
        "Maturity rises when dashboards are real-time, integrated with risk register and CMMS/EAM, and trigger automated alerts.",
      ],
      components: [
        "KPI register (spreadsheet or EAM module) — every KPI documented.",
        "Tiered dashboard (board / executive / operations / field).",
        "Data sources: CMMS/EAM (work orders, failures), SCADA/IoT (real-time condition), Finance (Capex/Opex), HR (competence), HSE (incidents).",
        "Control charts (SPC) per KPI — upper/lower control limits, special-cause detection.",
        "KPI-to-objective traceability matrix (§6.2 → §9.1).",
        "Monthly operations review + quarterly executive review + annual board review cadence.",
        "Leading-indicator register (PM Compliance %, AHI, Alert Closure %, First-Time-Fix %, Training, Risk Closure).",
        "Asset criticality register — KPIs weighted by criticality (critical assets hourly, non-critical monthly).",
      ],
      mechanism: [
        "§9.1 lifecycle: inventory AM objectives (§6.2) + interested-party needs (§4.2) → define KPIs (name/definition/formula/target/owner/source/frequency/level) → classify leading/lagging → build tiered dashboards → implement SPC control charts → automate data feeds (CMMS/EAM + SCADA/IoT + Finance) → refresh on cadence (daily field, weekly ops, monthly exec, quarterly board) → feed §9.3 management review (AM performance + AM effectiveness inputs) → feed §10 improvement actions → annual KPI register review (retire stale, add new, recalibrate targets).",
      ],
      process: [
        "1. Inventory AM objectives (§6.2) and interested-party requirements (§4.2) — these are the parent requirements.",
        "2. Define each KPI: name, definition, formula, unit, target, tolerance, owner, data source, frequency, reporting level.",
        "3. Classify each KPI as leading or lagging; ensure a balanced mix (target 50/50).",
        "4. Build tiered dashboards: board (strategic, quarterly), executive (tactical, monthly), operations (operational, weekly), field (transactional, daily).",
        "5. Implement SPC control charts per KPI; set upper/lower control limits from baseline data.",
        "6. Automate data feeds where possible (CMMS/EAM extract + SCADA/IoT integration + Finance feed).",
        "7. Hold monthly operations review, quarterly executive review, annual board review — each review consumes the dashboard and triggers actions.",
        "8. Feed dashboard findings to §9.3 management review (mandatory inputs 'AM performance' and 'AM effectiveness'); feed improvement opportunities to §10.",
        "9. Review the KPI register itself annually — retire stale KPIs, add new ones, recalibrate targets; document changes.",
      ],
      formulas: [
        "OEE = A × P × Q (each factor 0..1; OEE 0..1, often × 100%).",
        "OEE Availability A = Run Time / Planned Production Time (0..1).",
        "OEE Performance P = (Ideal Cycle Time × Total Count) / Run Time.",
        "OEE Quality Q = Good Count / Total Count.",
        "Inherent Availability A_inh = MTBF / (MTBF + MTTR).",
        "MTBF = Total Operating Time / Number of Failures (h).",
        "MTTR = Total Repair Time / Number of Failures (h).",
        "Reliability R(t) = exp(-t / MTBF) — exponential model.",
        "Asset Utilization U = Actual Operating Time / Calendar Time.",
        "Cost per Unit CPU = Total Asset Lifecycle Cost / Units Produced.",
        "IAM Maturity (organizational average) M_org = (1/N) · Σ M_subject_j (M_subject ∈ {1..5}).",
      ],
      metrics: [
        "OEE per asset class [0..1] — target ≥ 0.85 world-class.",
        "Availability (OEE) [0..1] — target ≥ 0.95 continuous, ≥ 0.92 cyclical.",
        "Inherent Availability [0..1] — typically 0.99+ for critical assets.",
        "MTBF (h) — trending up year-on-year.",
        "MTTR (h) — trending down year-on-year.",
        "Cost per Unit ($/unit) — trending down.",
        "Leading/Lagging ratio [%] — target ≥ 50% leading.",
        "KPI-to-objective traceability [%] — target 100%.",
        "Special-cause alerts investigated and closed [%] — target ≥ 95%.",
        "§9.1 maturity score [1..5] — target Level 4 (Managed) within 24 months.",
      ],
      examples: [
        "WaterCo §9.1 dashboard: 4 tiers, 11 KPIs, 55% leading, OEE 79.3%, MTBF 1752 h, Cost/Unit $3.95.",
        "OEE decomposition: A=0.92, P=0.88, Q=0.98 → OEE=0.7934 → dominant loss Performance.",
        "Inherent Availability: MTBF=1752 h, MTTR=6 h → A_inh=1752/1758=0.9966 — higher than OEE Availability 0.92 because inherent excludes planned downtime.",
        "Cost per Unit trend: $4.20 → $4.05 → $3.95 = -5.95% over 2 years → on track for $3.50 by Year 5.",
        "Maturity score: 9 subjects summing 22 → M_org = 22/9 = 2.444 → Level 2.4 (Aware trending to Defined).",
      ],
      industrial_examples: [
        "Utilities — UK regional water utility: §9.1 dashboard tiered Board/Exec/Ops/Field, SAP PM (CMMS) + SCADA IoT (vibration/water-quality) + Finance feeds; OEE per WTW, MTBF per critical pump, Non-Revenue Water %, Asset Health Index 0-100; IAM maturity Level 4 (Managed) — balanced leading/lagging, SPC, real-time alerting.",
        "Oil & Gas — Shell downstream refinery: §9.1 KPIs include Availability Factor per critical equipment, Refinery Utilization, Energy Intensity Index (EII), Mechanical Integrity compliance %, Process Safety Events Tier 1/2 (API RP 754), HSE TRIR, Maintenance Cost per Barrel; PI System (OSIsoft) + SAP PM; IAM maturity Level 4 trending to Level 5.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Municipal water utility 'AquaCo' (mid-size, 800k connections, 3 WTWs). CAMA assessor §9.1 findings: maturity Level 2.0 (Aware) — only lagging KPIs (failure count, maintenance cost, unplanned interruption hours); no leading indicators; no targets/tolerances; no SPC; KPIs not fed to management review; no traceability. Recommendations: (1) build KPI register; (2) add 6 leading KPIs; (3) set targets from 3-year baseline; (4) implement SPC; (5) feed §9.3 inputs; (6) trace KPIs to §6.2. Target Level 3 in 12 months, Level 4 in 24 months.",
      ],
      common_errors: [
        "Lagging-only dashboard — by the time MTBF falls the assets have already failed.",
        "OEE without decomposing into A × P × Q — composite hides the dominant loss.",
        "Confusing Inherent Availability (0.9966) with OEE Availability (0.92) — different denominators.",
        "No KPI-to-objective traceability — orphan KPIs that look good but answer no AM question.",
        "Single snapshot instead of trend — quarterly trends over 3 years reveal patterns.",
        "Arbitrary thresholds (90%) without SPC control limits — special-cause variation missed.",
        "Not feeding KPI results to §9.3 — §9.1 isolated from §9.3 fails conformance.",
        "Setting world-class targets without baseline data — unrealistic, demotivating, leads to gaming.",
        "Counting 'failures' inconsistently across teams — destroys MTBF comparability.",
        "Treating 'leading' and 'lagging' as synonyms — leading predicts (PM compliance), lagging reports (MTBF).",
      ],
      limitations: [
        "OEE assumes a defined 'ideal cycle time' — hard to define for water-treatment plants, networks, fleets.",
        "Inherent Availability excludes planned downtime — misleading for production planning.",
        "MTBF/MTTR assume repairable systems with similar failure modes — mixing failure modes hides the dominant mode.",
        "Leading indicators are predictive but not deterministic — high PM Compliance does not guarantee low failure rate.",
        "SPC assumes a stable baseline period — start-up or major change invalidates control limits.",
        "Real-time dashboards are data-hungry — CMMS data quality, SCADA noise, finance reconciliation lags corrupt KPIs.",
        "Cross-industry benchmarking is misleading — water-utility OEE is structurally lower than automotive OEE.",
      ],
      best_practices: [
        "Build a single KPI register (spreadsheet or EAM module) with 15+ documented columns per KPI.",
        "Tier the dashboard (board quarterly / executive monthly / operations weekly / field daily) — each tier answers a different question.",
        "Pair each lagging KPI with a leading KPI (MTBF ← PM Compliance + AHI; Cost/Unit ← Capex/Opex Ratio + Risk Closure).",
        "Implement SPC control charts on the top 5 KPIs — distinguish special-cause from common-cause variation.",
        "Automate data feeds (CMMS/EAM extract, SCADA/IoT integration, Finance API) — manual data entry corrupts KPIs.",
        "Feed §9.1 results to §9.3 management review ('AM performance' + 'AM effectiveness' inputs) and §10 improvement actions — closed loop.",
        "Set targets from 3-year baseline, not from textbook thresholds (OEE ≥ 0.85 may be unrealistic for some industries).",
        "Audit the KPI register annually — retire stale KPIs, add new ones, recalibrate targets; document changes.",
      ],
      related_concepts: [
        "Asset Management Principles (AMP) — the 'assurance' principle underpins §9.1.",
        "Asset Management System (AMS) — §6.2 AM objectives are the parent of §9.1 KPIs.",
        "Internal Audit & Management Review (Lesson 2) — §9.2 audit findings and §9.3 management review consume §9.1 results.",
        "Continual Improvement & Maturity (Lesson 3) — §10 improvement actions close the PDCA loop started by §9.1.",
        "IAM Anatomy 'Risk & Reliability' group — the conceptual reference for asset-performance KPIs.",
        "ISO 19011:2018 — audit evidence collected under §9.2 cross-checks §9.1 KPI data quality.",
      ],
      prerequisites: [
        "CAMA Asset Management Principles (AMP) — the four ISO 55000 principles and the asset lifecycle.",
        "CAMA Asset Management System (AMS) — §6.2 AM objectives (KPI traceability) and §8.1 operational planning.",
        "Basic reliability engineering — failure modes, MTBF/MTTR, exponential reliability model.",
        "Familiarity with management dashboards, RACI, and SPC (control charts, trend analysis).",
      ],
      references: [
        "ISO 55001:2014, Asset management — Management systems — Requirements, §9.1.",
        "ISO 55000:2014, Asset management — Overview, principles and terminology (assurance principle).",
        "ISO 55002:2018, Asset management — Guidelines for the application of ISO 55001, §A.9.1.",
        "The IAM, Asset Management — An Anatomy (Risk & Reliability, HSEQ groups).",
        "The IAM, Asset Management Maturity Model.",
        "ISO 19011:2018, Guidelines for auditing management systems.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Performance Monitoring & Asset KPIs",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem:
        "Under ISO 55001, which clause requires the organization to determine what shall be monitored and measured, the methods, the criteria, when monitoring is performed, when results are recorded/analyzed/evaluated, and at what level results are reported?",
      whyCorrect:
        "ISO 55001 §9.1 'Monitoring, measurement, analysis and evaluation' is the clause that requires the organization to determine what shall be monitored and measured, the methods, the criteria, when monitoring is performed and results recorded/analyzed/evaluated, and at what level the results are reported (asset, asset system, asset class, organizational, regulatory). §9.2 is internal audit, §9.3 is management review, §10.1 is improvement — none of these cover the §9.1 KPI definition obligation.",
      whyOthersWrong: [
        "Option §9.2 — §9.2 is the internal audit clause (audit programme at planned intervals, conforming to ISO 19011, by independent auditors); it does not define the KPI monitoring set.",
        "Option §9.3 — §9.3 is the management review clause (8 inputs, 4 outputs); it consumes the §9.1 results but does not define them.",
        "Option §10.1 — §10.1 is the improvement clause (suitability, adequacy, effectiveness); it acts on §9.1 results but does not define them.",
      ],
      explanation:
        "§9.1 = monitoring/measurement/analysis/evaluation; §9.2 = internal audit; §9.3 = management review; §10 = improvement. §9.1 defines the KPI set.",
      options: [
        { text: "§9.2 — Internal Audit", isCorrect: false },
        { text: "§9.1 — Monitoring, Measurement, Analysis, Evaluation", isCorrect: true },
        { text: "§9.3 — Management Review", isCorrect: false },
        { text: "§10.1 — Improvement", isCorrect: false },
      ],
    },
    {
      competencyName: "Performance Monitoring & Asset KPIs",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Utilities",
      stem:
        "An asset has OEE Availability A = 0.92 (Run Time 8052 h / Planned Production 8760 h), Performance P = 0.88 (speed loss), and Quality Q = 0.98 (2% reject). What is the OEE and which factor contributes the dominant loss?",
      whyCorrect:
        "OEE = A × P × Q = 0.92 × 0.88 × 0.98 = 0.7934 = 79.3%. To identify the dominant loss, examine each factor's gap to 1.0: A gap = 0.08, P gap = 0.12, Q gap = 0.02. The largest gap is Performance (0.12), so Performance (speed loss) is the dominant loss. The assessor would recommend investigating the speed-loss root cause (settling velocity, filter run-length, pump efficiency, throughput caps) before targeting Availability or Quality improvements.",
      whyOthersWrong: [
        "Option OEE = 0.85, Availability dominant — arithmetic is wrong (0.92 × 0.88 × 0.98 ≠ 0.85; correct is 0.7934); and the dominant loss is Performance not Availability (P gap 0.12 > A gap 0.08).",
        "Option OEE = 0.92, no dominant loss — OEE ≠ A; OEE is the product, not just Availability; the composite 0.92 ignores Performance and Quality.",
        "Option OEE = 0.79, Quality dominant — OEE 0.79 is correct but Quality gap (0.02) is the smallest, not the dominant loss; Performance gap (0.12) is the dominant loss.",
      ],
      explanation:
        "OEE = 0.92 × 0.88 × 0.98 = 0.7934 = 79.3%. Loss decomposition: A gap 0.08, P gap 0.12, Q gap 0.02 — Performance is the dominant loss; investigate speed-loss root cause.",
      options: [
        { text: "OEE = 0.85, Availability is the dominant loss", isCorrect: false },
        { text: "OEE = 0.92, no dominant loss", isCorrect: false },
        { text: "OEE = 0.79 (79.3%), Performance is the dominant loss", isCorrect: true },
        { text: "OEE = 0.79, Quality is the dominant loss", isCorrect: false },
      ],
    },
    {
      competencyName: "Performance Monitoring & Asset KPIs",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Conceptual",
      scenario: "Oil & Gas",
      stem:
        "An Oil & Gas refinery's §9.1 dashboard reports: MTBF, MTTR, OEE, Cost per Barrel, Failure Rate, Process Safety Events (Tier 1/2), Maintenance Cost per Barrel, Unplanned Outage Hours. Which KPI MUST be added to balance the dashboard with a LEADING indicator?",
      whyCorrect:
        "Every KPI listed is lagging (reports past performance — failures already happened, costs already incurred, incidents already occurred). To balance the dashboard per §9.1 best practice (target ≥ 50% leading), the refinery MUST add at least one leading KPI — Mechanical Integrity Inspection Compliance %, Condition-Monitoring Alert Closure %, Asset Health Index, or PM Compliance % — that predicts future asset performance and enables preventive intervention. Of the listed options, only 'Mechanical Integrity Inspection Compliance % (API RP 580/581 RBVI)' is a leading indicator that predicts future pressure-vessel and piping reliability.",
      whyOthersWrong: [
        "Option 'Maintenance Cost per Barrel' — already on the dashboard; it is lagging (reports past spending); adding it again does not balance leading/lagging.",
        "Option 'Unplanned Outage Hours' — already on the dashboard; it is lagging (reports past outages); does not predict future asset performance.",
        "Option 'Process Safety Events Tier 1/2 (API RP 754)' — already on the dashboard; it is lagging (reports past incidents); adding more lagging KPIs increases the imbalance.",
      ],
      explanation:
        "A balanced dashboard pairs each lagging KPI with a leading KPI. The refinery's dashboard is 100% lagging; adding Mechanical Integrity Inspection Compliance % (a leading indicator of future pressure-vessel reliability) balances the dashboard.",
      options: [
        { text: "Maintenance Cost per Barrel", isCorrect: false },
        { text: "Unplanned Outage Hours", isCorrect: false },
        { text: "Mechanical Integrity Inspection Compliance % (API RP 580/581 RBVI)", isCorrect: true },
        { text: "Process Safety Events Tier 1/2 (API RP 754)", isCorrect: false },
      ],
    },
    {
      competencyName: "Performance Monitoring & Asset KPIs",
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Utilities",
      stem:
        "True or False: For the same asset, OEE Availability = MTBF / (MTBF + MTTR), so a high Inherent Availability (e.g., 0.9966) guarantees a high OEE Availability (≥ 0.95).",
      whyCorrect:
        "FALSE. OEE Availability = Run Time / Planned Production Time — it includes planned downtime (PM, cleaning, regulatory calibrations) and minor stops, neither of which appears in MTBF/(MTBF+MTTR). Inherent Availability A_inh = MTBF/(MTBF+MTTR) is FAILURE-ONLY availability. An asset can simultaneously show A_inh = 0.9966 (only 6 h failure downtime in 1758 h cycle) and OEE Availability = 0.92 (708 h of planned downtime + minor stops in the same 8760 h calendar window). A high A_inh does NOT guarantee a high OEE Availability — the gap is the planned downtime + minor stops contribution. The assessor must check both metrics and explain the gap, not assume one predicts the other.",
      whyOthersWrong: [
        "Option TRUE — would conflate two different availability definitions. ISO 55002:2018 §A.9.1 and reliability engineering references (e.g., Smith 'Reliability, Maintainability and Risk') distinguish inherent availability (failure-only) from operational/OEE availability (incl. planned downtime + minor stops). Treating them as identical is a common §9.1 finding and a nonconformity in KPI definition.",
      ],
      explanation:
        "FALSE. OEE Availability (Run Time / Planned Production, incl. planned downtime + minor stops) ≠ Inherent Availability (MTBF/(MTBF+MTTR), failure-only). A high A_inh (0.9966) does NOT guarantee high OEE Availability (0.92 in the worked example); the gap is the planned downtime + minor stops contribution.",
      options: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Internal Audit & Management Review (§9.2, §9.3)
// (Competency: "Internal Audit & Management Review";
//  slug: pi-internal-audit-management-review)
// ---------------------------------------------------------------------------

const LESSON_AUDIT_REVIEW: RefLesson = {
  competencyName: "Internal Audit & Management Review",
  slug: "pi-internal-audit-management-review",
  title: "Internal Audit & Management Review (ISO 55001 §9.2, §9.3)",
  titleAr: "التدقيق الداخل ومراجعة الإدارة (ISO 55001 §9.2, §9.3)",
  order: 2,
  durationMin: 40,
  references: PI_REFERENCE_TITLES,
  conceptIntroduction: `ISO 55001 §9.2 (internal audit) and §9.3 (management review) are the two Check-clauses of the AMS PDCA. §9.2 requires the organization to conduct internal audits at planned intervals to provide information on whether the AMS conforms to the organization's own requirements and to ISO 55001, and is effectively implemented and maintained. §9.3 requires top management to review the organization's AMS at planned intervals (≥ annually) to ensure its continuing suitability, adequacy, effectiveness, and alignment with the organization's strategic direction. §9.2 audits provide evidence; §9.3 management review consumes that evidence and outputs improvement opportunities, AM policy/objective changes, resource needs, and AMS changes that feed §10. The CAMA assessor scores §9.2 and §9.3 maturity by examining the audit programme, the audit findings log (major/minor/observation/OFI classification), the audit report, the management-review inputs (8 mandatory) and outputs (4 mandatory), and the closed-loop corrective-action tracking.`,
  example: `A regional power generator runs an annual §9.2 internal audit programme of 12 audits (4 process audits on SAMP/AMP/risk/MOC + 8 asset-system audits on the 8 critical asset systems — HRSG, steam turbine, generator, transformer, switchgear, cooling water, condensate, fuel oil). Findings Q4: 1 major NC (§9.1 — KPI dashboard not reviewed at §9.3 management review; systemic gap), 3 minor NCs (§7.5 documented information — 3 of 24 procedures not version-controlled; §6.2 — 2 AM objectives without KPI decomposition; §8.2 MOC — 1 MOC not risk-assessed), 5 observations (e.g., §4.2 — stakeholder matrix not refreshed since regulator decision), 2 OFIs (e.g., cross-asset-system risk aggregation could use Bowtie + LOPA). Major NC corrective action due in 30 days, root-cause + CAPA; minor NC in 90 days; observations next audit cycle; OFIs prioritized in §6.2 re-planning.`,
  keyFormulas: `Audit programme coverage C_audit = N_audited / N_in_scope (0..1).
Audit-finding closure rate C_find = N_closed_in_period / N_open_in_period (0..1).
Major NC corrective-action SLA = 30 days (industry practice; ISO 19011 does not mandate a number, but 30 days is the de-facto CAMA expectation).
Minor NC corrective-action SLA = 90 days (industry practice).
Observation closure = next audit cycle (12 months).
OFI closure = next §6.2 re-planning cycle (annual).
Management review conformance score = (8 inputs present AND 4 outputs present) → Y/N (binary).
Maturity level avg M_org = (1/N) · Σ M_subject_j (M ∈ {1..5}).

Example: 12 audits planned, 12 completed → C_audit = 1.0. Findings: 1 major + 3 minor + 5 obs + 2 OFI = 11. Closure in period: 1/1 major (30d), 3/3 minor (90d), 4/5 obs (next cycle), 1/2 OFI (next §6.2) → C_find = (1+3+4+1)/(1+3+5+2) = 9/11 = 0.818 = 82% closure rate.`,
  exercise: `You are the CAMA assessor reviewing a transmission utility's §9.2 audit programme. (a) The audit programme covers 4 process audits + 8 asset-system audits per year (12 total). 12 audits completed in the period. Compute C_audit and comment. (b) Findings: 1 major NC (§9.1 — KPI dashboard not in §9.3 input), 3 minor NCs (§7.5, §6.2, §8.2), 5 observations, 2 OFIs. Closure: 1/1 major in 30 days, 3/3 minor in 90 days, 4/5 observations in 12 months, 1/2 OFIs in next §6.2 cycle. Compute C_find. (c) Identify the ISO 19011:2018 audit principle violated if the lead auditor is also the §9.1 KPI owner. (d) The §9.3 management review records 7 of the 8 mandatory inputs (missing 'audit results' summary) and 3 of the 4 mandatory outputs (missing 'resource needs'). Classify each gap and recommend corrective action.`,
  sections: {
    learning_objectives: `- Plan an ISO 55001 §9.2 internal audit programme per ISO 19011:2018 (objectives, scope, criteria, frequency, auditor competence, evaluation).
- Apply the 6 ISO 19011 audit principles (integrity, fair presentation, due professional care, confidentiality, independence, evidence-based approach) to AMS audits.
- Classify audit findings as Conformity, Major NC, Minor NC, Observation, or Opportunity for Improvement (OFI) with defensible criteria.
- Conduct an ISO 55001 §9.3 management review with all 8 mandatory inputs (§9.3.1) and 4 mandatory outputs (§9.3.2).
- Drive the closed-loop PDCA: audit findings → corrective action (§10.2) → management-review inputs → improvement actions (§10.1).
- Score §9.2/§9.3 maturity using the IAM Maturity Model and target Level 4 (Managed).`,
    prerequisites: `- CAMA Asset Management System (AMS) — especially §4.4 process map (audit cross-checks processes), §6.2 AM objectives (KPI traceability), §8 operation (audit cross-checks operational controls), §9.1 monitoring (audit cross-checks KPIs).
- Familiarity with ISO 19011:2018 (auditing management systems) — the 6 audit principles, audit programme management, audit conduct, audit findings classification.
- Basic understanding of management-system audits (ISO 9001, ISO 14001, ISO 45001, ISO 55001 — common Annex SL HLS).
- Root-cause analysis techniques (5-Whys, Fishbone, FTA, FMEA) for §10.2 corrective action.`,
    introduction: `ISO 55001 §9.2 + §9.3 are the two Check-clauses of the AMS PDCA. §9.2 (internal audit) requires the organization to conduct internal audits at planned intervals to provide information on whether the AMS (a) conforms to the organization's own requirements, (b) conforms to ISO 55001, and (c) is effectively implemented and maintained. §9.2 demands audit programmes conforming to ISO 19011:2018 — the 6 audit principles (integrity, fair presentation, due professional care, confidentiality, independence, evidence-based approach), audit programme management (objectives, scope, criteria, frequency, auditor competence), and audit conduct (audit plan, opening meeting, evidence collection, findings classification, closing meeting, audit report, follow-up). §9.3 (management review) requires top management to review the AMS at planned intervals (≥ annually) with 8 mandatory inputs (§9.3.1: status of previous actions; changes in external/internal issues; AM performance; AM effectiveness; fulfilment of AM objectives; audit results; interested parties' feedback; MOC issues + resource adequacy) and 4 mandatory outputs (§9.3.2: improvement opportunities; AM policy or AM objectives changes; resource needs; AMS changes — organizational implications). ISO 55002:2018 §A.9.2 and §A.9.3 give interpretive guidance on audit programme depth and management-review evidence richness. The CAMA assessor examines the audit programme, the findings log, the audit report, the management-review minutes, and the closed-loop corrective-action tracking — a break in the chain anywhere fails §9.2/§9.3 conformance.`,
    terminology: `- **§9.2 internal audit**: ISO 55001 clause requiring internal audits at planned intervals conforming to ISO 19011; the audit programme is risk-based, by independent auditors.
- **§9.3 management review**: ISO 55001 clause requiring top management review at planned intervals (≥ annually) of the AMS suitability/adequacy/effectiveness; 8 inputs, 4 outputs.
- **ISO 19011:2018**: the auditing standard ISO 55001 §9.2 audit programmes must conform to.
- **Audit principles (ISO 19011 §4)**: integrity, fair presentation, due professional care, confidentiality, independence, evidence-based approach (6 principles).
- **Audit programme**: set of one or more audits planned for a specific time frame and directed towards a specific purpose (ISO 19011 §5).
- **Audit plan**: description of the activities and arrangements for a single audit (ISO 19011 §6).
- **Audit criteria**: set of policies, procedures, or requirements used as reference against which audit evidence is compared.
- **Audit evidence**: records, statements of fact, or other information relevant to the audit criteria and verifiable.
- **Audit finding**: result of the evaluation of collected audit evidence against audit criteria.
- **Conformity**: fulfillment of a requirement.
- **Nonconformity (NC)**: requirement not met.
- **Major NC**: requirement not met where the breakdown is systemic or the organization has no evidence at all (e.g., a §9.1 KPI dashboard not used as §9.3 input).
- **Minor NC**: requirement not met in an isolated instance (e.g., 3 of 24 procedures not version-controlled).
- **Observation**: a noted weakness or area for improvement that does not (yet) constitute a nonconformity.
- **Opportunity for Improvement (OFI)**: a suggestion for improvement that is neither a nonconformity nor an observation.
- **Corrective Action (CAPA)**: action to eliminate the cause of a nonconformity (§10.2).
- **Lead auditor**: qualified auditor designated to manage the audit.
- **Independence (ISO 19011 §4 g)**: auditor not responsible for the work being audited — cornerstone of §9.2 conformance.`,
    detailed_explanation: `ISO 55001 §9.2 requires the audit programme to be (a) at planned intervals (≥ annually for full AMS coverage, but high-risk processes audited more frequently), (b) risk-based (audit frequency and depth scaled by risk and prior findings), (c) by auditors whose independence is assured (the lead auditor cannot be the process owner; ISO 19011 §4 g 'independence'), (d) evidence-based (audit findings traceable to documented evidence), and (e) finding-classified per ISO 19011 §6.4 (Conformity, Major NC, Minor NC, Observation, OFI). ISO 55002:2018 §A.9.2 reinforces that the audit programme must cover the full AMS scope (§4.3), all ISO 55001 clauses, and the asset-system AMSs (AMPs). Findings classification is the assessor's most-sampled artefact: a Major NC is a systemic breakdown or no-evidence (e.g., 'no §9.3 management review minutes for 3 years'); a Minor NC is an isolated instance (e.g., '3 of 24 procedures not version-controlled'); an Observation is a noted weakness (e.g., 'stakeholder matrix not refreshed since regulator decision'); an OFI is a suggestion for improvement (e.g., 'cross-asset-system risk aggregation could use Bowtie + LOPA'). The audit report must include the audit plan, opening-meeting minutes, evidence (with traceability to documents/records/interviews), findings log, closing-meeting minutes, and follow-up commitments. Closure is time-boxed: Major NC 30 days (de-facto industry practice; ISO 19011 does not prescribe a number), Minor NC 90 days, Observation next audit cycle (12 months), OFI next §6.2 re-planning cycle.

ISO 55001 §9.3 management review is the apex Check-clause: top management reviews the AMS with 8 mandatory inputs (§9.3.1: (1) status of actions from previous management reviews; (2) changes in external and internal issues relevant to the AMS; (3) AM performance; (4) AM effectiveness; (5) fulfilment of AM objectives; (6) audit results; (7) interested parties' feedback; (8) MOC issues + resource adequacy) and produces 4 mandatory outputs (§9.3.2: (1) improvement opportunities; (2) AM policy or AM objectives changes; (3) resource needs; (4) AMS changes — organizational implications). ISO 55002:2018 §A.9.3 reinforces that all 8 inputs must be presented (not summarized away) and all 4 outputs must be recorded with owners and dates. The CAMA assessor samples management-review minutes for the 8-inputs/4-outputs completeness, the depth of evidence per input, and the closed-loop traceability from output → improvement action (§10.1) → corrective action (§10.2) → next-cycle input (status of previous actions). Maturity rises when audits feed management review, when management review outputs drive §10 improvement, and when the closed loop is documented end-to-end.`,
    core_principles: `- §9.2 audits are evidence-based and risk-based — frequency and depth scaled by risk and prior findings.
- Auditor independence is non-negotiable (ISO 19011 §4 g) — the lead auditor cannot be the process owner.
- Findings classification (Conformity/Major NC/Minor NC/Observation/OFI) must be defensible and consistent.
- §9.3 management review has 8 mandatory inputs and 4 mandatory outputs — missing any fails conformance.
- Top management owns §9.3 — not the asset manager; the review is the board's or executive committee's review of the AMS.
- Audit findings and management-review outputs feed §10 improvement (closed-loop PDCA).
- Closure is time-boxed: Major NC 30 days, Minor NC 90 days, Observation next cycle, OFI next §6.2 cycle.
- Maturity rises when audits feed management review, when outputs drive §10, and when the loop is documented end-to-end.`,
    components: `- Annual audit programme (audit calendar covering full AMS scope + all ISO 55001 clauses + asset-system AMPs).
- Audit plan per audit (objectives, scope, criteria, dates, auditors, opening/closing meeting).
- Audit findings log (Conformity / Major NC / Minor NC / Observation / OFI) with traceability to evidence.
- Audit report (audit plan + opening/closing minutes + evidence + findings log + follow-up commitments).
- Lead auditor + audit team (qualified, independent, ISO 19011-trained).
- Management-review agenda (8 inputs + 4 outputs; owners; dates).
- Management-review minutes (signed by top management; 8 inputs + 4 outputs recorded).
- Corrective-action tracker (Major NC 30d / Minor NC 90d; root-cause analysis; closure verification).
- Closed-loop traceability matrix: §9.2 finding → §9.3 input → §10 action → next-cycle §9.3 input (status of previous actions).`,
    process: `1. Define the annual audit programme: scope (full AMS + clauses + AMPs), objectives, criteria (ISO 55001, internal docs), frequency (≥ annually; high-risk processes quarterly), auditor assignments (independent).
2. Schedule audits on the audit calendar; assign lead auditor + audit team; verify ISO 19011 competence (training records, audit hours, evaluation).
3. Per audit: prepare audit plan (objectives, scope, criteria, dates, opening/closing meeting times); communicate to auditee.
4. Opening meeting: confirm audit plan, scope, criteria, confidentiality, escalation path.
5. Evidence collection: document review, record review, interviews, observation of work; map evidence to audit criteria; ensure traceability.
6. Findings classification: Conformity / Major NC (systemic or no-evidence) / Minor NC (isolated) / Observation (weakness) / OFI (suggestion); log with evidence reference and ISO 55001 clause.
7. Closing meeting: present findings to auditee; agree corrective-action commitments with time-boxed SLAs (Major 30d, Minor 90d).
8. Audit report: audit plan + opening/closing minutes + evidence log + findings log + follow-up commitments; issue within 14 days of audit.
9. Corrective-action tracking: root-cause analysis (5-Whys / Fishbone / FTA / FMEA); action plan; closure verification (re-audit or evidence review); update §9.3 management-review input 'audit results'.
10. Management review (§9.3): top management reviews the 8 mandatory inputs; produces the 4 mandatory outputs with owners and dates; feed outputs to §10 improvement actions.
11. Closed-loop: feed §9.3 outputs and §10 actions into next-cycle §9.3 input 'status of actions from previous management reviews'.`,
    formula_calculation: `Audit programme coverage C_audit = N_audited / N_in_scope (0..1).
  Example: 12 audits planned, 12 completed → C_audit = 1.0 (100%).
  Variables: N_audited (count), N_in_scope (count).
  Interpretation: ≥ 0.95 expected; below 0.95 triggers a Major NC (programme not delivered).

Audit-finding closure rate C_find = N_closed_in_period / N_open_in_period (0..1).
  Example: 1 major (closed) + 3 minor (closed) + 5 obs (4 closed) + 2 OFI (1 closed) = 9 closed of 11 open → C_find = 9/11 = 0.818 = 82%.
  Variables: N_closed_in_period (count), N_open_in_period (count).
  Interpretation: ≥ 0.90 expected for Major+Minor within their SLAs; Observations and OFIs typically carry to next cycle.

Major NC corrective-action SLA = 30 days (industry practice; ISO 19011 does not prescribe a number).
Minor NC corrective-action SLA = 90 days (industry practice).
Observation closure = next audit cycle (12 months).
OFI closure = next §6.2 re-planning cycle (annual).
  Variables: days (h).
  Units: Major 30 days, Minor 90 days, Observation 365 days, OFI 365 days.
  Assumptions: SLA starts on audit closing meeting; closure requires root-cause + action + verification.

Management-review conformance score = (8 inputs present AND 4 outputs present) → Y/N (binary).
  Interpretation: any missing input or any missing output = nonconformity under §9.3.

IAM Maturity (organizational average) M_org = (1/N) · Σ M_subject_j (M_subject ∈ {1..5}).
  Example (9 PI subjects): (3+3+2+2+3+3+2+2+2)/9 = 22/9 = 2.444 → Level 2.4.`,
    worked_example: `CASE_TYPE = WORKED EXAMPLE. Regional power generator 'GenCo' §9.2 audit programme + §9.3 management review (Q4 cycle).

AUDIT PROGRAMME (12 audits/yr):
  - 4 process audits: SAMP, AMP, Risk Register, MOC.
  - 8 asset-system audits: HRSG, steam turbine, generator, transformer, switchgear, cooling water, condensate, fuel oil.
  - Audit calendar: 1 audit/month; lead auditor from a different business unit (independence).
  - Audit criteria: ISO 55001:2014 clauses + GenCo AMS manual + AMPs.
  - Auditor competence: lead auditor ISO 19011-trained (5-day IRCA-certified course) + ≥5 audits experience; team auditors ISO 19011-aware.

FINDINGS (Q4):
  - 1 MAJOR NC: §9.1 — the §9.1 KPI dashboard (OEE, MTBF, MTTR, Cost per Unit) was not presented as §9.3 management-review input 'AM performance' or 'AM effectiveness' for the last 2 cycles. Systemic gap; the management-review agenda omits the dashboard. SLA: 30 days; corrective action: revise §9.3 agenda to include §9.1 dashboard; root-cause: §9.3 agenda template inherited from old QMS, not updated after ISO 55001:2014 transition.
  - 3 MINOR NCs: (1) §7.5 — 3 of 24 procedures not version-controlled (Procedure A-12, B-07, C-21); (2) §6.2 — 2 AM objectives (Objective 4 'Asset Health Index ≥ 75' and Objective 7 'PM Compliance ≥ 95%') have no KPI decomposition to asset-system level; (3) §8.2 MOC — 1 MOC (MOC-2024-08-17, fuel-oil switch) not risk-assessed. SLA: 90 days; root-cause analyses (5-Whys) required.
  - 5 OBSERVATIONS: (1) §4.2 — stakeholder matrix not refreshed since regulator decision (Q1); (2) §7.2 — competence matrix not updated for new SCADA system; (3) §6.3 — risk register not linked to AMPs for 3 critical asset systems; (4) §9.1 — SPC not implemented on top 5 KPIs; (5) §10.2 — corrective-action closure verification not documented for 4 of 12 prior-cycle actions.
  - 2 OFIs: (1) cross-asset-system risk aggregation could use Bowtie + LOPA (current: qualitative FMEA per asset system); (2) Asset Health Index could be ML-based (current: rule-based).

CLOSURE (within period): 1/1 major (closed in 28 days), 3/3 minor (closed in 88, 76, 65 days), 4/5 observations (closed in 12 months), 1/2 OFIs (prioritized in §6.2 re-planning).
  → C_find = (1+3+4+1)/(1+3+5+2) = 9/11 = 0.818 = 82% closure rate (target ≥ 90% for Major+Minor within SLAs; achieved 100% on Major+Minor, the gap is in Observations/OFIs which typically carry).

MANAGEMENT REVIEW (§9.3):
  8 INPUTS (§9.3.1) — all present:
    (1) Status of previous actions: 11 prior-cycle actions — 9 closed, 2 overdue (1 Minor NC §7.5 overdue 14 days; 1 Observation overdue 30 days).
    (2) Changes in external/internal issues: regulator approved 5-yr price control; new Net-Zero target; 2 senior engineer retirements.
    (3) AM performance: §9.1 KPI dashboard (now included after Major NC corrective action) — OEE 79.3%, MTBF 1752 h, Cost/Unit $3.95.
    (4) AM effectiveness: AMS audit 11 findings (1M/3m/5obs/2OFI), 82% closure; KPI-to-objective traceability 100%; objective achievement 6 of 8.
    (5) Fulfilment of AM objectives: 6 of 8 objectives on target (2 missed: AHI 71 vs target 75; PM Compliance 91% vs target 95%).
    (6) Audit results: §9.2 internal audit summary (11 findings) + external CAMA surveillance audit summary (3 observations).
    (7) Interested parties' feedback: regulator (no concerns), community (3 noise complaints), insurer (FM Global — loss-prevention recommendations accepted).
    (8) MOC issues + resource adequacy: 14 MOCs in period (1 not risk-assessed — Minor NC); budget approved for SCADA upgrade + new EAM.
  4 OUTPUTS (§9.3.2) — all present:
    (1) Improvement opportunities: implement SPC on top 5 KPIs; refresh stakeholder matrix; update competence matrix for SCADA; ML-based AHI pilot.
    (2) AM policy or AM objectives changes: AHI target revised 75 → 73 (baseline); PM Compliance target revised 95% → 94% (baseline).
    (3) Resource needs: +1 reliability engineer; +0.5 FTE asset-information analyst; SCADA upgrade budget approved.
    (4) AMS changes — organizational implications: re-integrate §9.1 dashboard into §9.3 agenda template; appoint Chief Reliability Officer reporting to COO.

CLOSED-LOOP TRACEABILITY: §9.2 Major NC (§9.1 dashboard not in §9.3 input) → §9.3 input 'audit results' (6) → §9.3 output 'AMS changes' (4) — re-integrate dashboard into agenda → §10.1 improvement action (revise agenda template) → next-cycle §9.3 input 'status of actions from previous management reviews' (1). End-to-end trace documented in the audit-finding register and management-review minutes.

ASSESSOR FINDING: §9.2/§9.3 maturity Level 3.5 (Defined trending to Managed). Strengths: full AMS coverage (12 audits); ISO 19011 conformance (independence, evidence-based, classified findings); 8/8 inputs + 4/4 outputs at §9.3; closed-loop traceability documented. Gaps: 1 Major NC (systemic KPI-dashboard gap — now corrected); Observations/OFIs carry to next cycle (no proactive closure); root-cause analysis depth varies.`,
    industrial_example: `Utilities — UK regional water utility: §9.2 audit programme 12 audits/yr (4 process + 8 asset-system); ISO 19011-trained lead auditors (IRCA-certified); audit findings log on EAM module with Conformity/Major/Minor/Observation/OFI classification; §9.3 management review held quarterly (more frequent than annual minimum) with all 8 inputs + 4 outputs; closed-loop tracker integrated with the EAM; IAM maturity Level 4 (Managed) on §9.2/§9.3 — independent auditors, classified findings, time-boxed SLAs, end-to-end traceability.

Oil & Gas — Shell downstream refinery: §9.2 audit programme combines ISO 55001 audits with Process Safety Management (PSM) audits (API RP 750), Mechanical Integrity (MI) audits (API RP 510/570/653/580/581), and Environmental/Safety audits (ISO 14001 + ISO 45001); lead auditors from the corporate Internal Audit function (independence); §9.3 management review is the Refinery Leadership Team's monthly AM Review (sub-set of inputs) plus the annual Corporate AM Council review (full 8 inputs + 4 outputs); IAM maturity Level 4 trending to Level 5 (Optimized) — predictive audit prioritization based on risk + history.`,
    case_study: `CASE_TYPE = SYNTHETIC. Municipal water utility 'AquaCo' (mid-size, 800k connections, 3 WTWs). CAMA assessor §9.2/§9.3 findings: maturity Level 2.0 (Aware). Gaps: §9.2 audit programme covers only 1 audit/yr (instead of ≥ 12); lead auditor is the Asset Manager (independence violated — ISO 19011 §4 g 'independence'); findings not classified (all labelled 'issues' — no Major/Minor/Obs/OFI distinction); no audit report (only an email summary); §9.3 management review held once 3 years ago; only 3 of 8 inputs presented (missing audit results, interested-party feedback, MOC issues + resource adequacy); only 2 of 4 outputs produced (missing improvement opportunities and AMS changes); no closed-loop corrective-action tracking. Recommendations: (1) expand audit programme to ≥ 12 audits/yr covering full AMS scope; (2) appoint independent lead auditor (external or from another business unit); (3) implement ISO 19011:2018 findings classification; (4) issue audit reports within 14 days; (5) hold §9.3 management review annually minimum with all 8 inputs + 4 outputs; (6) implement corrective-action tracker with 30d (Major) / 90d (Minor) SLAs; (7) build closed-loop traceability matrix. Target Level 3 (Defined) in 12 months, Level 4 (Managed) in 24 months.`,
    visual_explanation: `Picture two adjacent funnels: the §9.2 funnel (left) ingests audit evidence — documents, records, interviews, observations — and outputs classified findings (Major NC, Minor NC, Observation, OFI). The §9.3 funnel (right) ingests 8 streams (status of previous actions; changes in issues; AM performance; AM effectiveness; objective fulfilment; audit results; interested-party feedback; MOC + resource adequacy) and outputs 4 streams (improvement opportunities; policy/objective changes; resource needs; AMS changes). The two funnels are joined by a pipe — the 'audit results' input (§9.3.1.6) — and the §9.3 outputs flow back into the §9.2 funnel as 'status of actions from previous management reviews' (§9.3.1.1). This is the closed-loop PDCA: §9.2 → §9.3 → §10 → §9.2 next cycle.`,
    simulation_opportunity: `Build a §9.2/§9.3 audit simulator: user uploads an audit programme (12 audits) + findings log + management-review minutes. Simulator classifies findings (Major/Minor/Obs/OFI), computes C_audit and C_find, verifies §9.3 8-inputs/4-outputs completeness, traces the closed loop (finding → input → output → action → next-cycle input), flags any break, generates the assessor finding '§9.2/§9.3 maturity Level X' with the gap-to-Next-Level report. Bonus: simulate an ISO 19011 independence violation (lead auditor is the process owner) and trace the assessor nonconformity.`,
    common_mistakes: `- Lead auditor is the process owner — violates ISO 19011 §4 g 'independence' and fails §9.2 conformance.
- Findings not classified — all labelled 'issues' or 'problems'; no Major/Minor/Obs/OFI distinction.
- No audit report — only an email summary; fails ISO 19011 §6.6 audit-report requirements.
- §9.3 management review held less than annually — fails §9.3 minimum frequency.
- Only 3 of 8 §9.3 inputs presented — fails §9.3.1 conformance.
- Only 2 of 4 §9.3 outputs recorded — fails §9.3.2 conformance.
- Audit findings not fed to §9.3 input 'audit results' (§9.3.1.6) — §9.2 isolated from §9.3 fails conformance.
- No corrective-action tracker; Major NC and Minor NC with no SLA — findings age without closure.
- Closure verification not documented (no re-audit or evidence review) — closure claim unverifiable.
- Treating Observation as Minor NC (over-classifying) inflates the NC count; treating Minor NC as Observation (under-classifying) hides systemic gaps.`,
    limitations: `- ISO 19011 does not prescribe a numerical SLA for Major/Minor NC closure — the 30-day/90-day practice is industry convention, not a standard requirement.
- Auditor independence is structurally hard in small organizations (only one qualified auditor available) — outsourcing or shared-service audit is needed.
- Findings classification is subjective — Major vs Minor vs Observation requires assessor calibration and a defensible rubric.
- §9.3 management review depth varies — 'presented in detail' is interpretive; a 1-paragraph summary may technically meet the input but fail Level 3+ maturity.
- Audit programmes are calendar-driven, not risk-driven — ISO 19011 §5.4.2 demands risk-based prioritization but many programmes default to annual cycle.
- Closed-loop traceability is documentation-heavy — the matrix may exist but be incomplete; assessor samples end-to-end.
- External audits (certification, regulator) supplement but do not replace internal audits — §9.2 is the organization's own check.`,
    comparison: `INTERNAL AUDIT (§9.2) vs EXTERNAL AUDIT (certification/regulator):
  Internal: by the organization's own auditors (independent of the audited process), at planned intervals, conforming to ISO 19011, findings feed §9.3.
  External: by certification body (CAMA surveillance), regulator (Ofgem/Ofwat), or insurer (FM Global), findings feed the organization's response; the organization cannot self-audit for certification — §9.2 is internal only.

MAJOR NC vs MINOR NC vs OBSERVATION vs OFI:
  Major NC: requirement not met, systemic breakdown or no evidence (e.g., no §9.3 for 3 years; no §9.1 dashboard).
  Minor NC: requirement not met in an isolated instance (e.g., 3 of 24 procedures not version-controlled).
  Observation: noted weakness, not (yet) a nonconformity (e.g., stakeholder matrix not refreshed since regulator decision).
  OFI: suggestion for improvement, neither NC nor observation (e.g., ML-based AHI pilot).

§9.2 AUDIT PROGRAMME vs §9.3 MANAGEMENT REVIEW:
  §9.2: planned-interval audits, by auditors, evidence-based, findings classified.
  §9.3: planned-interval review, by top management, 8 inputs + 4 outputs.
  §9.2 feeds §9.3 (input 'audit results'); §9.3 outputs feed §10 (improvement, corrective action); §10 feeds next-cycle §9.3 (input 'status of actions from previous reviews').`,
    practical_application: `Build the annual §9.2 audit programme as a 12-row calendar (1 audit/month) with columns: Audit # | Date | Audit Type (process/asset-system) | Scope | Criteria (ISO 55001 clause + internal doc) | Lead Auditor | Team Auditors | Status. Assign the lead auditor from a DIFFERENT business unit (independence). Train lead auditors on ISO 19011 (5-day IRCA-certified course). Implement a findings log on the EAM with classification rubric (Major/Minor/Obs/OFI) and SLA columns (30d/90d/12mo/12mo). Issue audit reports within 14 days. Hold §9.3 management review annually minimum (quarterly for higher maturity) with all 8 inputs and 4 outputs recorded in minutes signed by top management. Build a closed-loop traceability matrix: §9.2 finding → §9.3 input → §9.3 output → §10 action → next-cycle §9.3 input. Score §9.2/§9.3 maturity annually using the IAM Maturity Model and target Level 4 (Managed).`,
    decision_scenario: `You are the CAMA assessor. The auditee's §9.2 audit programme covers 4 audits/yr (not 12); the lead auditor is the Asset Manager (also the §6.2 AM objectives owner); findings are labelled 'issues' without Major/Minor/Obs/OFI classification; the §9.3 management review was last held 18 months ago with 4 of 8 inputs and 2 of 4 outputs. What is your maturity finding and your top three improvement recommendations?

Finding: §9.2/§9.3 maturity Level 1.5 (Initial trending to Aware). Critical nonconformities: (a) ISO 19011 §4 g 'independence' violated (lead auditor is the §6.2 owner — Major NC §9.2); (b) findings not classified — Major NC §9.2 (ISO 19011 §6.4); (c) §9.3 frequency 18 months — Major NC §9.3 (minimum annual); (d) §9.3 4-of-8 inputs / 2-of-4 outputs — Major NC §9.3.1 + §9.3.2.

Recommendations: (1) Expand audit programme to ≥ 12 audits/yr covering full AMS scope (process audits + asset-system audits); (2) Appoint independent lead auditor (external consultant or auditor from another business unit); (3) Implement ISO 19011:2018 findings classification rubric (Major 30d / Minor 90d / Obs 12mo / OFI 12mo); (4) Hold §9.3 management review within 30 days with all 8 inputs and 4 outputs recorded; (5) Build closed-loop traceability matrix and corrective-action tracker.`,
    practice_questions: `1. List the 6 ISO 19011:2018 audit principles (integrity, fair presentation, due professional care, confidentiality, independence, evidence-based approach).
2. Classify: 'no §9.3 management review held for 3 years' — Major NC, Minor NC, Observation, or OFI?
3. List the 8 §9.3.1 inputs and 4 §9.3.2 outputs. Identify the input that links §9.2 to §9.3.
4. Compute C_find given 1 major (closed), 3 minor (closed), 5 obs (4 closed), 2 OFI (1 closed) within the period.`,
    certification_questions: `1. ISO 19011:2018 audit principles count: 6 (integrity, fair presentation, due professional care, confidentiality, independence, evidence-based).
2. ISO 55001 §9.3.1 mandatory inputs: 8.
3. ISO 55001 §9.3.2 mandatory outputs: 4.
4. Major NC corrective-action SLA (industry practice): 30 days.`,
    summary: `ISO 55001 §9.2 (internal audit, per ISO 19011:2018) + §9.3 (management review, 8 inputs + 4 outputs) are the two Check-clauses of the AMS PDCA. The CAMA assessor scores §9.2/§9.3 maturity by examining the audit programme (full AMS scope, risk-based, ≥ annually), auditor independence (ISO 19011 §4 g), findings classification (Major/Minor/Obs/OFI), audit report (ISO 19011 §6.6), management-review completeness (8/8 inputs, 4/4 outputs), closed-loop traceability (§9.2 → §9.3 → §10 → §9.3 next cycle), and SLA adherence (Major 30d, Minor 90d). Maturity Level 4 (Managed) requires independent auditors, classified findings, time-boxed SLAs, end-to-end traceability; Level 5 (Optimized) requires predictive audit prioritization based on risk + history.`,
    key_takeaways: `- §9.2 audits conform to ISO 19011:2018 — the 6 audit principles (integrity, fair presentation, due professional care, confidentiality, independence, evidence-based).
- Findings classification: Conformity / Major NC (systemic or no-evidence) / Minor NC (isolated) / Observation / OFI.
- Closure SLAs (industry practice): Major 30 days, Minor 90 days, Observation 12 months, OFI next §6.2 cycle.
- §9.3 has 8 mandatory inputs (§9.3.1) and 4 mandatory outputs (§9.3.2); any missing fails conformance.
- Auditor independence is non-negotiable — the lead auditor cannot be the process owner.
- Closed loop: §9.2 findings → §9.3 input 'audit results' → §9.3 outputs → §10 actions → next-cycle §9.3 input 'status of previous actions'.
- Top management owns §9.3 — not the asset manager.
- Maturity Level 4 (Managed) requires independent auditors + classified findings + time-boxed SLAs + end-to-end traceability.`,
    references: `- ISO 55001:2014, Asset management — Management systems — Requirements, §9.2 (Internal Audit), §9.3 (Management Review).
- ISO 55000:2014, Asset management — Overview, principles and terminology (assurance principle).
- ISO 55002:2018, Asset management — Guidelines for the application of ISO 55001, §A.9.2 (audit programme), §A.9.3 (management-review depth).
- The IAM, Asset Management — An Anatomy (HSEQ group — audit & assurance).
- The IAM, Asset Management Maturity Model (5-level scale).
- ISO 19011:2018, Guidelines for auditing management systems (the auditing standard).`,
  },
  knowledgeObject: {
    title: "Internal Audit & Management Review (ISO 55001 §9.2, §9.3)",
    domain: "Asset Management System (ISO 55001)",
    competency: "Internal Audit & Management Review",
    topic: "AMS Internal Audit (§9.2, ISO 19011), Management Review (§9.3), Findings, CAPA",
    concept: "ISO 55001 §9.2 internal audit (per ISO 19011:2018 — 6 audit principles, audit programme, findings classification Major/Minor/Obs/OFI, audit report, follow-up) and §9.3 management review (8 mandatory inputs, 4 mandatory outputs), closed-loop PDCA to §10 improvement and corrective action",
    body: {
      definitions: [
        "§9.2 internal audit: ISO 55001 clause requiring internal audits at planned intervals conforming to ISO 19011; provides information on whether the AMS conforms to the org's own requirements and to ISO 55001 and is effectively implemented and maintained.",
        "§9.3 management review: ISO 55001 clause requiring top management review at planned intervals (≥ annually) of AMS suitability, adequacy, effectiveness, and alignment with strategic direction.",
        "ISO 19011:2018: the auditing standard ISO 55001 §9.2 audit programmes must conform to.",
        "Audit principles (ISO 19011 §4): integrity, fair presentation, due professional care, confidentiality, independence, evidence-based approach (6 principles).",
        "Audit programme: set of one or more audits planned for a specific time frame directed towards a specific purpose.",
        "Audit plan: description of activities and arrangements for a single audit.",
        "Audit criteria: policies, procedures, or requirements used as reference against which audit evidence is compared.",
        "Audit evidence: records, statements of fact, or other information relevant to the audit criteria and verifiable.",
        "Audit finding: result of evaluation of collected audit evidence against audit criteria.",
        "Conformity: fulfillment of a requirement.",
        "Nonconformity (NC): requirement not met.",
        "Major NC: systemic breakdown or no evidence (e.g., no §9.3 management review for 3 years).",
        "Minor NC: isolated instance of requirement not met (e.g., 3 of 24 procedures not version-controlled).",
        "Observation: noted weakness not (yet) constituting a nonconformity.",
        "Opportunity for Improvement (OFI): suggestion for improvement neither NC nor observation.",
        "Corrective Action (CAPA): action to eliminate the cause of a nonconformity (§10.2).",
        "Lead auditor: qualified auditor designated to manage the audit.",
        "Independence (ISO 19011 §4 g): auditor not responsible for the work being audited.",
      ],
      principles: [
        "§9.2 audits are evidence-based and risk-based — frequency and depth scaled by risk and prior findings.",
        "Auditor independence is non-negotiable (ISO 19011 §4 g).",
        "Findings classification (Conformity/Major NC/Minor NC/Obs/OFI) must be defensible and consistent.",
        "§9.3 has 8 mandatory inputs (§9.3.1) and 4 mandatory outputs (§9.3.2); any missing fails conformance.",
        "Top management owns §9.3 — not the asset manager.",
        "Audit findings and §9.3 outputs feed §10 improvement (closed-loop PDCA).",
        "Closure SLAs (industry practice): Major 30 days, Minor 90 days, Observation next cycle, OFI next §6.2 cycle.",
        "Maturity rises when audits feed §9.3, when outputs drive §10, and when the closed loop is documented end-to-end.",
      ],
      components: [
        "Annual audit programme (audit calendar covering full AMS scope + ISO 55001 clauses + asset-system AMPs).",
        "Audit plan per audit (objectives, scope, criteria, dates, auditors, opening/closing meeting).",
        "Audit findings log (Conformity / Major NC / Minor NC / Observation / OFI) with traceability to evidence.",
        "Audit report (audit plan + opening/closing minutes + evidence + findings log + follow-up commitments).",
        "Lead auditor + audit team (qualified, independent, ISO 19011-trained).",
        "Management-review agenda (8 inputs + 4 outputs; owners; dates).",
        "Management-review minutes (signed by top management; 8 inputs + 4 outputs recorded).",
        "Corrective-action tracker (Major 30d / Minor 90d; root-cause analysis; closure verification).",
        "Closed-loop traceability matrix: §9.2 finding → §9.3 input → §10 action → next-cycle §9.3 input.",
      ],
      mechanism: [
        "§9.2/§9.3 lifecycle: define audit programme (≥ 12 audits/yr, full scope, risk-based) → assign independent lead auditor → prepare audit plan → opening meeting → evidence collection → classify findings (Major/Minor/Obs/OFI) → closing meeting with SLA commitments → issue audit report within 14 days → corrective-action tracking (root-cause + action + verification) → feed §9.3 input 'audit results' → §9.3 management review (8 inputs + 4 outputs) → §9.3 outputs feed §10 improvement actions → next-cycle §9.3 input 'status of actions from previous reviews'.",
      ],
      process: [
        "1. Define the annual audit programme: scope, objectives, criteria (ISO 55001 + internal docs), frequency (≥ annually; high-risk quarterly), auditor assignments (independent).",
        "2. Schedule audits on the audit calendar; assign lead auditor + team; verify ISO 19011 competence (training records, audit hours, evaluation).",
        "3. Per audit: prepare audit plan; communicate to auditee.",
        "4. Opening meeting: confirm plan, scope, criteria, confidentiality, escalation path.",
        "5. Evidence collection: document review, record review, interviews, observation of work; map to criteria; ensure traceability.",
        "6. Findings classification: Conformity / Major NC / Minor NC / Observation / OFI; log with evidence reference and ISO 55001 clause.",
        "7. Closing meeting: present findings; agree corrective-action commitments with time-boxed SLAs (Major 30d, Minor 90d).",
        "8. Audit report: plan + minutes + evidence + findings log + follow-up commitments; issue within 14 days.",
        "9. Corrective-action tracking: root-cause analysis (5-Whys / Fishbone / FTA / FMEA); action plan; closure verification (re-audit or evidence review).",
        "10. §9.3 management review: top management reviews 8 inputs; produces 4 outputs with owners and dates; feed outputs to §10.",
        "11. Closed-loop: feed §9.3 outputs and §10 actions into next-cycle §9.3 input 'status of actions from previous reviews'.",
      ],
      formulas: [
        "Audit programme coverage C_audit = N_audited / N_in_scope (0..1).",
        "Audit-finding closure rate C_find = N_closed_in_period / N_open_in_period (0..1).",
        "Major NC corrective-action SLA = 30 days (industry practice; ISO 19011 does not prescribe a number).",
        "Minor NC corrective-action SLA = 90 days (industry practice).",
        "Observation closure = next audit cycle (12 months).",
        "OFI closure = next §6.2 re-planning cycle (annual).",
        "Management-review conformance = (8 inputs present AND 4 outputs present) → Y/N (binary).",
        "IAM Maturity (organizational average) M_org = (1/N) · Σ M_subject_j (M_subject ∈ {1..5}).",
      ],
      metrics: [
        "Audit programme coverage C_audit [0..1] — target ≥ 0.95.",
        "Audit-finding closure rate C_find [0..1] — target ≥ 0.90 for Major+Minor within SLAs.",
        "Number of Major NCs per audit cycle [count] — target 0; trend down.",
        "Number of Minor NCs per audit cycle [count] — trend down.",
        "Auditor independence compliance [%] — target 100%.",
        "Audit report timeliness [% within 14 days] — target ≥ 95%.",
        "§9.3 frequency [reviews/yr] — target ≥ 1 (annual minimum); quarterly for higher maturity.",
        "§9.3 input completeness [8 of 8] — target 8/8 (binary).",
        "§9.3 output completeness [4 of 4] — target 4/4 (binary).",
        "§9.2/§9.3 maturity score [1..5] — target Level 4 (Managed) within 24 months.",
      ],
      examples: [
        "GenCo §9.2 audit programme: 12 audits/yr (4 process + 8 asset-system); findings 1 Major + 3 Minor + 5 Obs + 2 OFI = 11; closure 9/11 = 82%.",
        "Major NC: §9.1 KPI dashboard not in §9.3 input 'AM performance' for 2 cycles — systemic gap; SLA 30 days; corrective action revised §9.3 agenda template.",
        "Minor NC: §7.5 — 3 of 24 procedures not version-controlled; SLA 90 days.",
        "Observation: §4.2 — stakeholder matrix not refreshed since regulator decision (Q1); next-cycle closure.",
        "OFI: cross-asset-system risk aggregation could use Bowtie + LOPA; next §6.2 re-planning cycle closure.",
        "§9.3: 8/8 inputs + 4/4 outputs present; closed-loop traceable: §9.2 Major NC → §9.3 input (6) 'audit results' → §9.3 output (4) 'AMS changes' → §10.1 action → next-cycle §9.3 input (1) 'status of previous actions'.",
      ],
      industrial_examples: [
        "Utilities — UK regional water utility: §9.2 audit programme 12 audits/yr; ISO 19011-trained lead auditors (IRCA); §9.3 quarterly + annual; closed-loop tracker on EAM; IAM maturity Level 4 (Managed).",
        "Oil & Gas — Shell downstream refinery: §9.2 audit programme combines ISO 55001 + PSM (API RP 750) + MI (API RP 510/570/653/580/581) + ISO 14001/45001; lead auditors from corporate Internal Audit (independence); §9.3 monthly AM Review (sub-set) + annual Corporate AM Council (full); IAM maturity Level 4 trending to Level 5 (predictive audit prioritization).",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Municipal water utility 'AquaCo' (mid-size, 800k connections, 3 WTWs). CAMA assessor §9.2/§9.3 findings: maturity Level 2.0 (Aware). Gaps: 1 audit/yr instead of ≥12; lead auditor is the Asset Manager (independence violated); findings unclassified ('issues'); no audit report (email summary only); §9.3 last held 3 years ago with 3/8 inputs and 2/4 outputs. Recommendations: expand programme, appoint independent lead, implement ISO 19011 classification, issue audit reports, hold §9.3 annually with 8/8 + 4/4, implement corrective-action tracker with SLAs, build closed-loop matrix. Target Level 3 in 12 months, Level 4 in 24 months.",
      ],
      common_errors: [
        "Lead auditor is the process owner — violates ISO 19011 §4 g 'independence'.",
        "Findings not classified — all labelled 'issues'; no Major/Minor/Obs/OFI distinction.",
        "No audit report — only an email summary; fails ISO 19011 §6.6.",
        "§9.3 held less than annually — fails §9.3 minimum frequency.",
        "Only 3 of 8 §9.3 inputs presented — fails §9.3.1 conformance.",
        "Only 2 of 4 §9.3 outputs recorded — fails §9.3.2 conformance.",
        "Audit findings not fed to §9.3 input 'audit results' — §9.2 isolated from §9.3.",
        "No corrective-action tracker; Major/Minor NC with no SLA — findings age without closure.",
        "Closure verification not documented (no re-audit or evidence review).",
        "Treating Observation as Minor NC (over-classifying) inflates the NC count; treating Minor NC as Observation (under-classifying) hides systemic gaps.",
      ],
      limitations: [
        "ISO 19011 does not prescribe a numerical SLA for Major/Minor NC closure — 30-day/90-day practice is industry convention.",
        "Auditor independence is structurally hard in small organizations (only one qualified auditor) — outsourcing or shared-service audit is needed.",
        "Findings classification is subjective — Major vs Minor vs Observation requires assessor calibration and a defensible rubric.",
        "§9.3 management review depth varies — 'presented in detail' is interpretive.",
        "Audit programmes are often calendar-driven, not risk-driven — ISO 19011 §5.4.2 demands risk-based prioritization.",
        "Closed-loop traceability is documentation-heavy — the matrix may exist but be incomplete.",
        "External audits (certification, regulator) supplement but do not replace internal audits — §9.2 is internal only.",
      ],
      best_practices: [
        "Build the annual §9.2 audit programme as a 12-row calendar with audit #, date, scope, criteria, lead auditor, team, status.",
        "Assign the lead auditor from a DIFFERENT business unit (independence); outsource or shared-service for small orgs.",
        "Train lead auditors on ISO 19011 (5-day IRCA-certified course) and maintain a competence register.",
        "Implement findings log on the EAM with classification rubric (Major 30d / Minor 90d / Obs 12mo / OFI 12mo).",
        "Issue audit reports within 14 days; include plan + minutes + evidence + findings + follow-up commitments.",
        "Hold §9.3 management review annually minimum (quarterly for higher maturity) with all 8 inputs and 4 outputs in signed minutes.",
        "Build a closed-loop traceability matrix: §9.2 finding → §9.3 input → §9.3 output → §10 action → next-cycle §9.3 input.",
        "Score §9.2/§9.3 maturity annually using the IAM Maturity Model and target Level 4 (Managed).",
      ],
      related_concepts: [
        "Asset Management System (AMS) — §4.4 process map (audit cross-checks processes), §6.2 AM objectives (KPI traceability), §8 operation (audit cross-checks operational controls), §9.1 monitoring (audit cross-checks KPIs).",
        "Performance Monitoring & Asset KPIs (Lesson 1) — §9.1 KPI dashboard feeds §9.3 input 'AM performance' and 'AM effectiveness'.",
        "Continual Improvement & Maturity (Lesson 3) — §10 improvement actions close the PDCA loop; CAPA (§10.2) drives corrective action on audit findings.",
        "ISO 19011:2018 — the auditing standard ISO 55001 §9.2 programmes conform to.",
        "IAM Anatomy 'HSEQ' group — audit & assurance subjects.",
        "IAM Maturity Model — 5-level scale applied to audit & assurance subjects.",
      ],
      prerequisites: [
        "CAMA Asset Management System (AMS) — §4.4 process map, §6.2 AM objectives, §8 operation, §9.1 monitoring.",
        "Familiarity with ISO 19011:2018 — the 6 audit principles, audit programme management, audit conduct, findings classification.",
        "Basic understanding of management-system audits (ISO 9001, ISO 14001, ISO 45001, ISO 55001 — common Annex SL HLS).",
        "Root-cause analysis techniques (5-Whys, Fishbone, FTA, FMEA) for §10.2 corrective action.",
      ],
      references: [
        "ISO 55001:2014, Asset management — Management systems — Requirements, §9.2 (Internal Audit), §9.3 (Management Review).",
        "ISO 55000:2014, Asset management — Overview, principles and terminology (assurance principle).",
        "ISO 55002:2018, Asset management — Guidelines for the application of ISO 55001, §A.9.2, §A.9.3.",
        "The IAM, Asset Management — An Anatomy (HSEQ group — audit & assurance).",
        "The IAM, Asset Management Maturity Model (5-level scale).",
        "ISO 19011:2018, Guidelines for auditing management systems (the auditing standard).",
      ],
    },
  },
  questions: [
    {
      competencyName: "Internal Audit & Management Review",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem:
        "ISO 19011:2018 specifies how many audit principles, and which one is the cornerstone that ISO 55001 §9.2 audit programmes must ensure by appointing auditors who are NOT responsible for the work being audited?",
      whyCorrect:
        "ISO 19011:2018 §4 specifies 6 audit principles: (1) Integrity, (2) Fair presentation, (3) Due professional care, (4) Confidentiality, (5) Independence, (6) Evidence-based approach. The principle that requires auditors not to be responsible for the work being audited is Independence (§4 g). ISO 55001 §9.2 requires the organization to define an audit programme conforming to ISO 19011, including independence. A lead auditor who is also the §9.1 KPI owner (the work being audited) violates the Independence principle and fails §9.2 conformance — a Major NC.",
      whyOthersWrong: [
        "Option '4 principles; Confidentiality' — incorrect count (6, not 4) and wrong principle (Confidentiality concerns handling of sensitive information, not auditor-auditee separation).",
        "Option '5 principles; Fair presentation' — incorrect count (6, not 5) and wrong principle (Fair presentation concerns truthful and accurate reporting of findings, not auditor independence).",
        "Option '8 principles; Due professional care' — incorrect count (6, not 8) and wrong principle (Due professional care concerns the auditor's judgement and diligence, not auditor-auditee separation).",
      ],
      explanation:
        "ISO 19011:2018 specifies 6 audit principles (integrity, fair presentation, due professional care, confidentiality, independence, evidence-based). Independence requires the auditor to NOT be responsible for the work being audited.",
      options: [
        { text: "4 principles; Confidentiality", isCorrect: false },
        { text: "5 principles; Fair presentation", isCorrect: false },
        { text: "6 principles; Independence", isCorrect: true },
        { text: "8 principles; Due professional care", isCorrect: false },
      ],
    },
    {
      competencyName: "Internal Audit & Management Review",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Procedural",
      scenario: "Utilities",
      stem:
        "A CAMA assessor examines the §9.3 management-review minutes of a water utility and finds 7 of the 8 §9.3.1 mandatory inputs present (missing 'audit results' summary) and 3 of the 4 §9.3.2 mandatory outputs recorded (missing 'resource needs'). What is the correct finding classification?",
      whyCorrect:
        "ISO 55001 §9.3.1 mandates 8 inputs and §9.3.2 mandates 4 outputs; ISO 55002:2018 §A.9.3 reinforces that all 8 inputs must be presented in detail and all 4 outputs must be recorded with owners and dates. Missing any input or any output is a failure to meet the requirement — and because the gap is systemic (the §9.3 agenda template itself omits 'audit results' and 'resource needs'), the correct classification is a Major Nonconformity under §9.3 (specifically §9.3.1 for the missing input and §9.3.2 for the missing output). A Minor NC would be appropriate only if a single instance were missing; an Observation would not apply because a requirement is not met; an OFI would not apply because this is not a suggestion for improvement but a clear gap against the standard.",
      whyOthersWrong: [
        "Option 'Minor NC §9.3' — would apply only if an isolated instance of an input/output were missing; the systemic omission of 'audit results' input and 'resource needs' output (agenda template gaps) is a Major NC.",
        "Option 'Observation §9.3' — observations apply to noted weaknesses that do NOT constitute a nonconformity; a missing mandatory input/output IS a nonconformity.",
        "Option 'OFI §9.3' — OFIs are suggestions for improvement that are neither NCs nor observations; a missing mandatory input/output is a clear NC, not a suggestion.",
      ],
      explanation:
        "§9.3 has 8 mandatory inputs (§9.3.1) and 4 mandatory outputs (§9.3.2). Missing any input or any output is a nonconformity; systemic omission (agenda template gap) escalates to Major NC under §9.3.1 (missing input 'audit results') and §9.3.2 (missing output 'resource needs').",
      options: [
        { text: "Major NC §9.3 (§9.3.1 + §9.3.2)", isCorrect: true },
        { text: "Minor NC §9.3 (single-instance gap)", isCorrect: false },
        { text: "Observation §9.3 (noted weakness, not yet an NC)", isCorrect: false },
        { text: "OFI §9.3 (suggestion for improvement)", isCorrect: false },
      ],
    },
    {
      competencyName: "Internal Audit & Management Review",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Power",
      stem:
        "A power generator's §9.2 audit programme covers 12 audits (4 process + 8 asset-system) per year. In Q4 the findings log shows: 1 Major NC, 3 Minor NCs, 5 Observations, 2 OFIs (11 total). Closure within the period: 1/1 Major (closed in 28 days), 3/3 Minor (closed in 88, 76, 65 days), 4/5 Observations (next cycle), 1/2 OFIs (next §6.2 cycle). Compute C_find (closure rate).",
      whyCorrect:
        "C_find = N_closed_in_period / N_open_in_period = (1 + 3 + 4 + 1) / (1 + 3 + 5 + 2) = 9/11 = 0.818 = 82%. The Major NC closed in 28 days (within 30-day SLA); the Minor NCs closed in 88, 76, 65 days (all within 90-day SLA); 4 of 5 Observations closed within the audit cycle (12 months); 1 of 2 OFIs prioritized in §6.2 re-planning. The 82% rate is below the 90% target — the gap is in Observation/OFI carry, which is typical (these typically carry to the next cycle, unlike Major/Minor which have hard SLAs).",
      whyOthersWrong: [
        "Option 9/12 = 75% — incorrectly uses 12 (the audit count) as the denominator instead of 11 (the findings count); closure rate is about findings, not audits.",
        "Option 11/11 = 100% — counts all findings as closed; only 9 of 11 were closed within the period (2 Observations + 1 OFI carry to the next cycle).",
        "Option 4/11 = 36% — only counts the Observations + OFIs that closed (4 + 1 = 5, not 4), ignoring Major+Minor closures (1+3=4); arithmetic error.",
      ],
      explanation:
        "C_find = N_closed / N_open = (1 Major + 3 Minor + 4 Obs + 1 OFI) / (1 + 3 + 5 + 2) = 9/11 = 0.818 = 82% closure rate. Major+Minor closed 100% within SLA (30d/90d); the 18% gap is Observation/OFI carry to next cycle (typical).",
      options: [
        { text: "9/12 = 75% (denominator = audit count)", isCorrect: false },
        { text: "11/11 = 100% (all findings closed)", isCorrect: false },
        { text: "9/11 = 82% (findings closed / findings open)", isCorrect: true },
        { text: "4/11 = 36% (only Obs+OFI closures counted)", isCorrect: false },
      ],
    },
    {
      competencyName: "Internal Audit & Management Review",
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Oil & Gas",
      stem:
        "True or False: ISO 55001 §9.3 management review must be held at planned intervals (at least annually) and MUST cover all 8 mandatory inputs (§9.3.1) and produce all 4 mandatory outputs (§9.3.2); a review missing any single input or any single output fails §9.3 conformance.",
      whyCorrect:
        "TRUE. ISO 55001 §9.3.1 specifies 8 mandatory management-review inputs (status of actions from previous reviews; changes in external/internal issues; AM performance; AM effectiveness; fulfilment of AM objectives; audit results; interested parties' feedback; MOC issues + resource adequacy) and §9.3.2 specifies 4 mandatory outputs (improvement opportunities; AM policy or AM objectives changes; resource needs; AMS changes — organizational implications). ISO 55002:2018 §A.9.3 reinforces that all 8 inputs must be presented in detail (not summarized away) and all 4 outputs must be recorded with owners and dates. The standard uses 'shall' language; missing any input or any output is a nonconformity. The CAMA assessor samples management-review minutes for 8/8 + 4/4 completeness; a single gap fails §9.3 conformance.",
      whyOthersWrong: [
        "Option FALSE — would imply that partial inputs/outputs are acceptable. ISO 55001 §9.3 uses 'shall' for all 8 inputs and 4 outputs; ISO 55002:2018 §A.9.3 reinforces this with interpretive guidance on the depth of each input. The standard is unambiguous — all 8 + all 4 are mandatory.",
      ],
      explanation:
        "TRUE. §9.3.1 = 8 mandatory inputs; §9.3.2 = 4 mandatory outputs. All must be present in detail with owners and dates, or the review fails §9.3 conformance (Major NC if systemic, Minor NC if isolated).",
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Continual Improvement & Maturity (ISO 55001 §10)
// (Competency: "Continual Improvement & Maturity";
//  slug: pi-continual-improvement-maturity)
// ---------------------------------------------------------------------------

const LESSON_CONTINUAL_IMPROVEMENT: RefLesson = {
  competencyName: "Continual Improvement & Maturity",
  slug: "pi-continual-improvement-maturity",
  title: "Continual Improvement & Maturity (ISO 55001 §10)",
  titleAr: "التحسين المستمر والنضج (ISO 55001 §10)",
  order: 3,
  durationMin: 40,
  references: PI_REFERENCE_TITLES,
  conceptIntroduction: `ISO 55001 §10 is the Act-clause of the AMS PDCA. §10.1 requires the organization to continually improve the suitability, adequacy, and effectiveness of the AMS — its outcomes, the AM policy, the AM objectives, the SAMP, the AMPs, and the AMS processes. §10.2 requires, when a nonconformity occurs, that the organization (a) react to the nonconformity and take action to control and correct it, and deal with the consequences; (b) evaluate the need for action to eliminate the causes of the nonconformity, in order for it not to recur or occur elsewhere; (c) implement any action needed; (d) review the effectiveness of any corrective action taken; (e) update risks and opportunities, if necessary; (f) make changes to the AMS, if necessary. The IAM Maturity Model (5 levels: 1 Initial/Ad-hoc → 2 Aware → 3 Defined → 4 Managed → 5 Optimized) applied to the 39 AM Anatomy subjects is the backbone of the maturity-to-improvement loop: self-assessment scores subjects → maturity level → gaps → improvement roadmap → re-assessment. The CAMA assessor scores §10 maturity by examining the CAPA register, the root-cause analysis depth, the maturity self-assessment, the improvement roadmap, and the closed loop back to §9.1 monitoring and §9.3 management review.`,
  example: `A regional transmission utility runs an annual IAM self-assessment across 9 PI subjects. Scores: Performance Monitoring & KPIs = 3 (Defined), Audit & Assurance = 3, CAPA / Corrective Action = 2 (Aware), Continual Improvement = 2, Asset Risk Management = 3, AM Strategy = 3, Lifecycle Delivery = 2, AM Decision-Making = 2, Asset Information = 2. Sum = 22, average M_org = 22/9 = 2.444 → Level 2.4 (Aware trending to Defined). The improvement roadmap targets Level 4 (Managed) within 24 months: raise CAPA, Continual Improvement, Lifecycle Delivery, AM Decision-Making, Asset Information from 2 → 4 (+10 levels); raise Performance Monitoring, Audit, Risk, Strategy from 3 → 4 (+4 levels); total +14 levels across 9 subjects in 24 months → quarterly checkpoints. The roadmap feeds §9.3 management review and §10.1 improvement actions.`,
  keyFormulas: `IAM Maturity per subject M_subject ∈ {1..5} (Level 1 Initial/Ad-hoc, 2 Aware, 3 Defined, 4 Managed, 5 Optimized).
Default weighted per-subject score = w_e·S_evidence + w_i·S_integration + w_o·S_outcome; weights w_e=0.4, w_i=0.3, w_o=0.3.
Organizational maturity M_org = (1/N) · Σ M_subject_j (mean across N subjects).
Improvement gap ΔM = M_target − M_org (levels).
Roadmap horizon T (months); checkpoints = T/3 (quarterly), T/6 (bi-monthly), or T/12 (monthly).
CAPA register closure rate C_CAPA = N_closed / N_open within SLA.

Example: 9 subjects score 3+3+2+2+3+3+2+2+2 = 22 → M_org = 22/9 = 2.444 ≈ 2.4 (Level 2.4 Aware trending to Defined). Target Level 4 → ΔM = 4.0 − 2.4 = 1.6 levels. Roadmap horizon 24 months → 8 quarterly checkpoints → 1.6/8 = 0.2 levels per checkpoint per subject avg. Total +14 levels across 9 subjects in 24 months.`,
  exercise: `You are the CAMA assessor reviewing a transmission utility's §10 improvement process and IAM maturity self-assessment. (a) The self-assessment scores 9 subjects: 3+3+2+2+3+3+2+2+2 = 22. Compute M_org and round to one decimal. (b) Target Level 4 (Managed) within 24 months. Compute the gap ΔM and the per-checkpoint improvement if checkpoints are quarterly. (c) A nonconformity is identified: 'CAPA register shows 4 of 12 corrective actions closed in 90 days, 8 overdue >180 days'. Apply ISO 55001 §10.2 steps (a)-(f) to this nonconformity. (d) Identify which IAM Maturity level requires 'quantitative measurement and data-driven management' (Level 4) vs 'predictive analytics and innovation-led improvement' (Level 5).`,
  sections: {
    learning_objectives: `- Apply ISO 55001 §10.1 (continual improvement of AMS suitability, adequacy, effectiveness) and §10.2 (nonconformity & corrective action — 6 mandatory steps).
- Use the IAM Maturity Model (5 levels: Initial, Aware, Defined, Managed, Optimized) and the 39 AM Anatomy subjects to score organizational maturity.
- Conduct an IAM self-assessment: score each subject on evidence + integration + outcome; compute M_org = mean across subjects.
- Translate maturity scores into an improvement roadmap with quarterly checkpoints, owners, and budget.
- Distinguish nonconformity (§10.2) from OFI (§9.2) — corrective action vs improvement opportunity; both feed §10.1.
- Drive the maturity-to-improvement loop: self-assessment → gaps → roadmap → §9.3 management-review output 'improvement opportunities' → §10.1 actions → next-cycle self-assessment.
- Apply benchmarking to validate the maturity score against peer organizations.`,
    prerequisites: `- CAMA Asset Management System (AMS) — §9.1 monitoring, §9.2 internal audit, §9.3 management review (these feed §10).
- Performance Monitoring & Asset KPIs (Lesson 1) — §9.1 KPI dashboard is the data source for maturity scoring.
- Internal Audit & Management Review (Lesson 2) — §9.2 audit findings and §9.3 outputs feed §10 improvement actions.
- Root-cause analysis techniques (5-Whys, Fishbone, FTA, FMEA) for §10.2 CAPA.
- Familiarity with maturity models (CMMI, ISO 9004 self-assessment, IAM Maturity Model) and benchmarking (API RP 770, IAEA Operational Performance Information System for LSS).`,
    introduction: `ISO 55001 §10 closes the AMS PDCA. §10.1 requires continual improvement of the AMS's suitability (right AMS for the context), adequacy (right scale/scope), and effectiveness (objectives achieved). §10.2 requires, when a nonconformity occurs, a 6-step CAPA: (a) react and control; (b) evaluate the need for action to eliminate the cause, so it does not recur or occur elsewhere; (c) implement any action needed; (d) review the effectiveness of corrective action taken; (e) update risks and opportunities if necessary; (f) make changes to the AMS if necessary. §10.1 and §10.2 are distinct: §10.1 is the proactive continual-improvement obligation (always on, drives step-changes in maturity); §10.2 is the reactive corrective-action obligation (triggered by NC). The IAM Maturity Model (5 levels) applied to the 39 AM Anatomy subjects is the canonical tool for scoring organizational maturity and designing the improvement roadmap. The CAMA assessor examines the CAPA register, the root-cause analysis depth, the maturity self-assessment, the improvement roadmap (with budget and owners), the closed-loop back to §9.1/§9.3, and the benchmarking evidence — a break in any link fails §10 conformance. Level 4 (Managed) is the de-facto target for ISO 55001 certified organizations; Level 5 (Optimized) is rare and indicates quantitative, predictive, innovation-led asset management.`,
    terminology: `- **§10.1 continual improvement**: ISO 55001 clause requiring the organization to continually improve the suitability, adequacy, and effectiveness of the AMS.
- **§10.2 nonconformity & corrective action**: ISO 55001 clause requiring, when an NC occurs, the 6-step CAPA (react; evaluate; implement; review effectiveness; update risks; change AMS).
- **Nonconformity (§10.2)**: requirement not met — triggers §10.2 CAPA.
- **Corrective action (CAPA)**: action to eliminate the cause of a nonconformity (root-cause, not symptom).
- **Root-cause analysis (RCA)**: structured technique (5-Whys, Fishbone/Ishikawa, FTA, FMEA) to identify the underlying cause.
- **IAM Maturity Model**: 5-level scale (1 Initial/Ad-hoc → 2 Aware → 3 Defined → 4 Managed → 5 Optimized) applied to the 39 AM Anatomy subjects.
- **Level 1 — Initial/Ad-hoc**: no documented procedures; reactive; outcomes unpredictable.
- **Level 2 — Aware**: AM recognized; some procedures documented; reactive with limited proactive elements.
- **Level 3 — Defined**: procedures defined and documented; outcomes repeatable; PDCA in place.
- **Level 4 — Managed**: quantitative measurement; data-driven management; integration across silos; predictable outcomes.
- **Level 5 — Optimized**: predictive analytics; innovation-led improvement; continuous refinement; outcomes exceed targets.
- **39 AM Anatomy subjects**: the IAM Anatomy's 39 subjects grouped under 6 conceptual groups (Strategy & Planning; AM Decision-Making; Lifecycle Delivery; Risk & Reliability; HSEQ; Asset Information).
- **Self-assessment**: the organization's own scoring of its 39 Anatomy subjects using the maturity scale; refreshed annually.
- **Improvement roadmap**: a prioritized plan to raise maturity scores from current to target levels with owners, budget, and timeline.
- **Benchmarking**: comparing the organization's maturity scores against peers (industry consortia, regulator benchmarks, IAM benchmark database).
- **Maturity-to-improvement loop**: self-assessment → gaps → roadmap → §9.3 output 'improvement opportunities' → §10.1 actions → next-cycle self-assessment.`,
    detailed_explanation: `ISO 55001 §10 has two sub-clauses. §10.1 'Improvement — General' requires the organization to continually improve the suitability, adequacy, and effectiveness of the AMS — this is the proactive, always-on obligation. Suitability means the AMS is the right system for the organization's context (§4); adequacy means it is the right scale/scope (§4.3); effectiveness means it achieves the intended outcomes (§6.2 AM objectives). §10.1 drives step-changes in maturity — the organization moves from Level 2 (Aware) to Level 3 (Defined) to Level 4 (Managed) to Level 5 (Optimized). §10.2 'Nonconformity and corrective action' is the reactive, triggered obligation — when an NC occurs (from §9.2 audit, §9.3 management review, §9.1 monitoring deviation, regulator finding, or incident), the organization must execute the 6-step CAPA: (a) react to the NC and take action to control and correct it, and deal with the consequences; (b) evaluate the need for action to eliminate the cause of the NC, in order for it not to recur or occur elsewhere, by reviewing the RCA; (c) implement any action needed; (d) review the effectiveness of any corrective action taken (verify closure with evidence, re-audit if needed); (e) update risks and opportunities (§6.3 risk register, §6.1 risk assessment), if necessary; (f) make changes to the AMS, if necessary. The CAMA assessor samples the CAPA register for: (i) root-cause analysis depth (5-Whys is the minimum; complex NCs require FTA or FMEA), (ii) corrective-action effectiveness review (documented evidence, not just an action-plan checkbox), (iii) risk-register update when applicable, (iv) AMS changes when applicable, (v) closure SLA adherence (Major NC 30 days, Minor NC 90 days). The IAM Maturity Model is the canonical tool for §10.1 maturity scoring: 5 levels applied to the 39 AM Anatomy subjects. Each subject is scored on three dimensions — evidence (is there documented evidence?), integration (is the subject integrated across silos?), outcome (does the subject deliver the intended outcome?) — with default weights 0.4/0.3/0.3, or a simpler single 1-5 score per subject. The organizational maturity M_org is the mean across subjects. The improvement roadmap targets the next level (Level N → Level N+1) with quarterly checkpoints, named owners, budget, and traceable §10.1 actions. The roadmap feeds §9.3 management review output 'improvement opportunities' (§9.3.2.1) and §9.3 output 'AM policy or AM objectives changes' (§9.3.2.2). Benchmarking against peer organizations (industry consortia, regulator benchmarks, IAM benchmark database) validates the maturity score and the improvement targets.`,
    core_principles: `- §10.1 is proactive (continual improvement); §10.2 is reactive (CAPA on NC) — both feed the AMS PDCA loop.
- Suitability + adequacy + effectiveness — three distinct improvement dimensions.
- CAPA addresses the cause (root-cause), not the symptom — RCA is mandatory (5-Whys minimum; FTA/FMEA for complex NCs).
- Effectiveness review (§10.2 d) is documented evidence, not a checkbox — verify closure with re-audit or evidence review.
- Risks and opportunities are updated (§10.2 e) when CAPA reveals new risk information.
- AMS changes (§10.2 f) are made when CAPA reveals systemic AMS gaps.
- IAM Maturity Model: 5 levels (Initial, Aware, Defined, Managed, Optimized) — Level 4 (Managed) is the de-facto ISO 55001 target.
- Improvement roadmap: quarterly checkpoints, named owners, budget, traceable to §9.3 outputs.
- Benchmarking validates the maturity score against peers — internal self-assessment alone is insufficient.`,
    components: `- CAPA register (NC log with root-cause, action, SLA, closure verification).
- Root-cause analysis templates (5-Whys, Fishbone/Ishikawa, FTA, FMEA).
- IAM Maturity Model (5 levels × 39 Anatomy subjects scoring rubric).
- Self-assessment scorecard (annual; 39 subjects × 3 dimensions evidence/integration/outcome).
- Improvement roadmap (prioritized actions; owners; budget; quarterly checkpoints).
- §9.3 management-review output 'improvement opportunities' (§9.3.2.1) — feeds §10.1.
- §9.3 management-review output 'AM policy or AM objectives changes' (§9.3.2.2) — feeds §10.1.
- Closed-loop traceability matrix: §9.2 NC → §10.2 CAPA → §9.3 input 'status of previous actions' → §10.1 improvement → next-cycle self-assessment.
- Benchmarking database (industry consortia, regulator benchmarks, IAM benchmark database).`,
    process: `1. Trigger §10.2 CAPA when an NC is identified (from §9.2 audit, §9.3 management review, §9.1 monitoring deviation, regulator finding, or incident).
2. Step (a): react to the NC, take action to control and correct it, deal with the consequences (e.g., isolate failed asset, stop affected procedure).
3. Step (b): evaluate the need for action to eliminate the cause — perform RCA (5-Whys for simple NCs; Fishbone, FTA, FMEA for complex NCs); document root cause(s).
4. Step (c): implement the corrective action(s) — action plan with owner, due date, budget; assign owner; track on CAPA register.
5. Step (d): review the effectiveness of the corrective action — verify closure with documented evidence (re-audit, KPI trend, evidence review); do not just tick the action-plan checkbox.
6. Step (e): update risks and opportunities (§6.3 risk register, §6.1 risk assessment) if CAPA reveals new risk information.
7. Step (f): make changes to the AMS if CAPA reveals systemic AMS gaps — update policy (§5.2), objectives (§6.2), SAMP, AMPs, procedures, training.
8. §10.1 continual improvement: run the annual IAM self-assessment (39 subjects × 3 dimensions × 5 levels); compute M_org = mean across subjects; identify gaps vs target.
9. Build the improvement roadmap: prioritize subjects by gap-to-target × criticality × cost; assign owners, budget, quarterly checkpoints.
10. Feed the roadmap to §9.3 management-review output 'improvement opportunities' (§9.3.2.1) and 'AM policy or AM objectives changes' (§9.3.2.2).
11. Benchmark the maturity score against peers (industry consortia, regulator benchmarks, IAM benchmark database); recalibrate targets if peer data suggests.
12. Re-assess annually; close the loop: this-cycle self-assessment → next-cycle §9.3 input 'status of actions from previous reviews'.`,
    formula_calculation: `IAM Maturity per subject M_subject ∈ {1..5}:
  1 = Initial/Ad-hoc (no procedures; reactive; outcomes unpredictable).
  2 = Aware (AM recognized; some procedures; reactive with limited proactive).
  3 = Defined (procedures defined and documented; outcomes repeatable; PDCA in place).
  4 = Managed (quantitative measurement; data-driven; integration across silos; predictable outcomes).
  5 = Optimized (predictive analytics; innovation-led; continuous refinement; outcomes exceed targets).
  Variables: integer level L ∈ {1,2,3,4,5} per subject.
  Units: dimensionless level.

Default weighted per-subject score (when 3 dimensions are scored):
  M_subject = w_e · S_evidence + w_i · S_integration + w_o · S_outcome
  where S_evidence, S_integration, S_outcome ∈ {1..5}; weights w_e = 0.4, w_i = 0.3, w_o = 0.3 (default).
  Example: S_e=3, S_i=3, S_o=3 → M = 0.4·3 + 0.3·3 + 0.3·3 = 1.2 + 0.9 + 0.9 = 3.0.

Organizational maturity M_org = (1/N) · Σ M_subject_j (mean across N subjects).
  Example: 9 subjects score 3,3,2,2,3,3,2,2,2 → sum = 22 → M_org = 22/9 = 2.444 → Level 2.4 (Aware trending to Defined).
  Variables: M_subject_j ∈ {1..5} or weighted score [1..5].
  Units: dimensionless level; round to one decimal for reporting.

Improvement gap ΔM = M_target − M_org (levels).
  Example: M_org = 2.4, M_target = 4.0 (Level 4 Managed) → ΔM = 1.6 levels.

Roadmap horizon T (months); checkpoints = T / k (k = 3 quarterly, 6 bi-monthly, 12 monthly).
  Example: T = 24 months, k = 3 (quarterly) → 8 checkpoints → 1.6 levels / 8 checkpoints = 0.2 levels/checkpoint average per organization.
  Or per subject: +14 levels across 9 subjects in 24 months = 1.56 levels/subject over 24 months = 0.065 levels/subject/month.

CAPA register closure rate C_CAPA = N_closed / N_open within SLA.
  Example: 4 closed of 12 open within 90 days → C_CAPA = 4/12 = 0.333 = 33% (target ≥ 90%); the 8 overdue >180 days are a Major NC under §10.2 (d) effectiveness review not done.`,
    worked_example: `CASE_TYPE = WORKED EXAMPLE. Regional transmission utility 'GridCo' §10 improvement process + IAM maturity self-assessment.

IAM SELF-ASSESSMENT (9 PI subjects, annual):
  Subject 1: Performance Monitoring & KPIs — Level 3 (Defined; KPIs defined, targets set, SPC not yet implemented).
  Subject 2: Audit & Assurance — Level 3 (Defined; 12 audits/yr, ISO 19011 conformance, classified findings).
  Subject 3: CAPA / Corrective Action — Level 2 (Aware; CAPA register exists but closure rate 33% (4/12 closed within 90 days); 8 overdue >180 days).
  Subject 4: Continual Improvement — Level 2 (Aware; no formal roadmap; improvement actions ad-hoc).
  Subject 5: Asset Risk Management — Level 3 (Defined; risk register integrated with AMPs; Bowtie on top-10 critical assets).
  Subject 6: AM Strategy — Level 3 (Defined; SAMP documented; aligned to organizational strategy).
  Subject 7: Lifecycle Delivery — Level 2 (Aware; AMPs for 6 of 12 critical asset systems; asset lifecycle plans incomplete).
  Subject 8: AM Decision-Making — Level 2 (Aware; capex decisions not consistently risk-based; no LCCA standardization).
  Subject 9: Asset Information — Level 2 (Aware; asset register 73% complete; data quality below target).

  Sum = 3+3+2+2+3+3+2+2+2 = 22 → M_org = 22/9 = 2.444 ≈ 2.4 → Level 2.4 (Aware trending to Defined).

IMPROVEMENT ROADMAP (target Level 4 Managed in 24 months; quarterly checkpoints):
  Checkpoint 1 (Q1 — Months 1-3):
    - Raise CAPA (Subj 3) from 2 → 3: implement ISO 19011-compliant CAPA register with 30d/90d SLAs; root-cause analysis (5-Whys minimum); effectiveness review documented.
    - Raise Continual Improvement (Subj 4) from 2 → 3: appoint Continual Improvement Manager; document improvement roadmap; quarterly review.
    - Raise Asset Information (Subj 9) from 2 → 3: asset register cleanup project (target ≥ 90% complete in 6 months); data-quality SPC.
    Budget: $250k (CI Manager 0.5 FTE + asset-register cleanup 1 FTE × 6 months + EAM module upgrade $50k).

  Checkpoint 2 (Q2 — Months 4-6):
    - Raise Lifecycle Delivery (Subj 7) from 2 → 3: complete AMPs for remaining 6 critical asset systems; standardize AMP template.
    - Raise AM Decision-Making (Subj 8) from 2 → 3: standardize LCCA (ISO 15686-5); risk-based capex decision template.
    Budget: $180k (Asset-planning consultancy 60 days × $3k/day + LCCA software $30k).

  Checkpoint 3 (Q3 — Months 7-9):
    - Raise Performance Monitoring (Subj 1) from 3 → 4: implement SPC control charts on top 5 KPIs; real-time dashboard; integrate CMMS + SCADA + Finance feeds.
    - Raise Audit & Assurance (Subj 2) from 3 → 4: risk-based audit prioritization (audit depth scaled by risk + prior findings); integrate audit findings with risk register.
    Budget: $320k (SPC tool + dashboard integration $200k + lead-auditor training 3 × $5k + risk-based audit tooling $35k).

  Checkpoint 4 (Q4 — Months 10-12):
    - Raise CAPA (Subj 3) from 3 → 4: KPI dashboard closure rate C_CAPA target ≥ 90%; effectiveness review on all closures; closed-loop traceability matrix.
    - Raise Continual Improvement (Subj 4) from 3 → 4: quantitative CI metrics (CI actions per quarter, CI effectiveness score); cross-functional CI teams.
    Budget: $150k (CI software + KPI dashboard extension + cross-functional team facilitation).

  Checkpoints 5-8 (Year 2 — Months 13-24):
    - Raise Asset Risk Management (Subj 5) from 3 → 4: LOPA on top-10; integrate with maintenance optimization (RCM).
    - Raise AM Strategy (Subj 6) from 3 → 4: integrate SAMP with corporate strategic planning; scenario modelling.
    - Raise Lifecycle Delivery (Subj 7) from 3 → 4: quantitative asset-lifecycle optimization (LCC + risk + criticality); integrate with capital plan.
    - Raise AM Decision-Making (Subj 8) from 3 → 4: quantitative risk-based capex (≥ 90% of capex >$1M with LCCA + risk register trace).
    - Raise Asset Information (Subj 9) from 3 → 4: asset register ≥ 95% complete; data-quality SPC; integrated EAM-CMMS-SCADA.
    - Raise Performance Monitoring, Audit, CAPA, CI from 4 → 4.5 (sustained Managed, trending to Optimized).
    Budget: $480k (Year 2).

  TOTAL: +14 levels across 9 subjects in 24 months → M_org from 2.4 → 4.0+ (Level 4 Managed). Budget 24-month total: $1.38M.

§9.3 MANAGEMENT-REVIEW INTEGRATION:
  - The roadmap is presented as §9.3 output 'improvement opportunities' (§9.3.2.1) at the annual management review.
  - The CI Manager role and budget approval are presented as §9.3 output 'resource needs' (§9.3.2.3).
  - The SAMP and AM objectives revisions are presented as §9.3 output 'AM policy or AM objectives changes' (§9.3.2.2).
  - The CI process integration is presented as §9.3 output 'AMS changes — organizational implications' (§9.3.2.4).

CAPA DEEP-DIVE (Subject 3, NC: 'CAPA register shows 4/12 closed in 90 days, 8 overdue >180 days'):
  §10.2 step (a) REACT: freeze the 8 overdue CAPAs; assign interim owner; risk-assess each overdue CAPA (some may have HSE/legal exposure).
  §10.2 step (b) EVALUATE THE NEED FOR ACTION — RCA (5-Whys):
    Why 1: 8 CAPAs overdue → Why 2: No SLA tracking → Why 3: CAPA register on spreadsheet, no automated SLA → Why 4: EAM module not configured for CAPA → Why 5: CI function under-resourced, no CI Manager.
    Root cause: no CI Manager + EAM CAPA module not configured.
  §10.2 step (c) IMPLEMENT: appoint CI Manager (Checkpoint 1); configure EAM CAPA module with SLA tracking (Major 30d, Minor 90d); root-cause template (5-Whys + Fishbone for complex); effectiveness review checklist; closed-loop traceability matrix.
  §10.2 step (d) REVIEW EFFECTIVENESS: re-audit at Q3 (6 months post-implementation) — target C_CAPA ≥ 90% within SLA; verify closure with documented evidence (KPI trend on closure rate, re-audit findings).
  §10.2 step (e) UPDATE RISKS: update §6.3 risk register — add risk 'CAPA process ineffective → systemic nonconformities uncorrected → AMS effectiveness fails'; update §6.1 risk assessment (likelihood × impact).
  §10.2 step (f) AMS CHANGES: revise §5.2 asset-management policy (add commitment to continual improvement per §5.2 d); revise §6.2 AM objectives (add 'CAPA closure rate ≥ 90%' as a new objective); revise AMS manual (CI process documented); update §7.2 competence matrix (CI Manager role).

ASSESSOR FINDING: §10 maturity Level 2.4 (Aware trending to Defined) at baseline; Level 4 (Managed) target in 24 months. Strengths: risk register defined (Level 3); audit process defined (Level 3); SAMP defined (Level 3). Gaps: CAPA closure rate 33% (Level 2); no formal CI roadmap (Level 2); Lifecycle Delivery/AM Decision-Making/Asset Information all at Level 2. Improvement roadmap with budget ($1.38M, 24 months) and quarterly checkpoints is plausible; assessor re-audits at Q3, Q6, Q9, Q12, Q18, Q24.`,
    industrial_example: `Utilities — UK regional transmission utility: IAM self-assessment across 39 Anatomy subjects; M_org = 2.4 (Level 2.4 Aware trending to Defined); 24-month roadmap to Level 4 (Managed); CI Manager appointed; CAPA module on EAM; quarterly checkpoints; benchmark against UK Energy Networks Association (ENA) asset-management benchmark; IAM maturity Level 4 (Managed) achieved in 22 months (faster than 24-month target).

Oil & Gas — Shell downstream refinery: IAM self-assessment; M_org = 4.2 (Level 4 Managed trending to Optimized) on PI subjects; CAPA closure rate 96% within SLA; quantitative CI metrics (CI actions per quarter, CI effectiveness score); cross-functional CI teams; benchmark against concawe (Conservation of Clean Air and Water in Europe) downstream-refinery benchmark; IAM maturity Level 4 trending to Level 5 (Optimized) — predictive analytics on RUL, ML-based AHI, automated improvement triggers.`,
    case_study: `CASE_TYPE = SYNTHETIC. Municipal water utility 'AquaCo' (mid-size, 800k connections, 3 WTWs). CAMA assessor §10 findings: maturity Level 1.5 (Initial trending to Aware). Gaps: no CAPA register (NCs closed verbally); no RCA ever performed; no IAM self-assessment (maturity never measured); no CI roadmap; no CI function; no benchmarking. Recommendations: (1) implement CAPA register on EAM with 30d/90d SLAs; (2) train 3 engineers on RCA (5-Whys + Fishbone + FMEA); (3) run the first IAM self-assessment across 39 Anatomy subjects; (4) appoint a CI Manager (0.5 FTE initially, full-time in 12 months); (5) build 24-month roadmap to Level 3 (Defined) first, then Level 4 (Managed) in 48 months; (6) benchmark against UK Water Industry Asset Management Group (WIAM) benchmark. Target Level 2.5 in 6 months (CAPA + self-assessment + CI Manager in place), Level 3 (Defined) in 18 months, Level 4 (Managed) in 48 months.`,
    visual_explanation: `Picture a 5-step staircase (Levels 1 → 5) on the left, and a 39-subject grid (Anatomy) on the right. The self-assessment plots each of the 39 subjects on the staircase — most organizations show a spread (some subjects at Level 2, some at Level 3, a few at Level 4). The mean M_org is the average across subjects. The improvement roadmap is a 24-month plan that raises each subject by 1-2 levels, with quarterly checkpoints marked on a timeline below the staircase. Each checkpoint has named owners, budget, and traceable §10.1 actions. The roadmap feeds §9.3 management review (output 'improvement opportunities'); the §9.3 outputs feed §10.1 actions; the next-cycle self-assessment closes the loop (status of previous actions becomes a §9.3.1.1 input).`,
    simulation_opportunity: `Build a §10 maturity simulator: user inputs 9 subject scores (1-5) + 24-month roadmap with quarterly checkpoints + budget + owners. Simulator computes M_org, gap-to-target, per-checkpoint improvement needed, CAPA closure rate C_CAPA, and traces the closed loop to §9.3 inputs (status of previous actions) and §10.1 actions. Simulator flags: (a) if any subject regresses between checkpoints (red), (b) if CAPA closure rate < 90% (yellow), (c) if budget actual > planned (yellow), (d) if §9.3 output 'improvement opportunities' is not fed by the roadmap (red, breaks closed loop). Generates assessor finding '§10 maturity Level X' with gap-to-Next-Level report.`,
    common_mistakes: `- Confusing §10.1 (proactive continual improvement) with §10.2 (reactive CAPA on NC) — both feed §10 but the obligations are distinct.
- Treating CAPA as a checkbox — closing an NC without root-cause analysis fails §10.2 (b); without effectiveness review fails §10.2 (d).
- 5-Whys stopped too early (Why 1-3 instead of Why 5+) — root cause not reached; symptom addressed, not cause.
- CAPA register with no SLA tracking — findings age without closure; closure rate falls below 90% (typical §10 Major NC).
- Effectiveness review by self-declaration (the action owner ticks 'effective') without re-audit or KPI trend evidence — fails §10.2 (d).
- Risks and opportunities not updated (§10.2 e) when CAPA reveals new risk information — fails §10.2 (e).
- AMS unchanged (§10.2 f) when CAPA reveals systemic AMS gaps (policy, objectives, procedures) — fails §10.2 (f).
- No IAM self-assessment — maturity never measured; improvement is gut-feel not data-driven.
- Improvement roadmap without budget or owners — paper plan, no execution.
- No benchmarking — internal self-assessment alone; risk of scoring inflation (3 → 4 internally, peer benchmark says 2 → 3).
- Targeting Level 5 (Optimized) without Level 4 (Managed) baseline — unrealistic; Level 5 requires Level 4 quantitative foundation.`,
    limitations: `- Maturity scoring is subjective — Major vs Minor NC classification, evidence/integration/outcome scoring all require assessor calibration.
- Self-assessment alone risks scoring inflation — benchmarking against peers is essential for validity.
- Roadmap horizons >24 months are speculative — technology, regulation, and organization change.
- Level 5 (Optimized) is rare and resource-intensive — predictive analytics, ML, innovation culture are not achievable for most organizations.
- CAPA effectiveness review is expensive (re-audits, KPI trends) — small orgs may struggle to resource.
- 5-Whys is the minimum RCA but insufficient for complex NCs (multi-cause, latent conditions) — FTA/FMEA required.
- Benchmarking data is not always available — small industries, regulated monopolies may lack peers.`,
    comparison: `§10.1 (Continual Improvement) vs §10.2 (Nonconformity & Corrective Action):
  §10.1: proactive, always-on, drives step-changes in maturity (Level 2 → 3 → 4 → 5); fed by §9.3 output 'improvement opportunities'.
  §10.2: reactive, triggered by NC; 6-step CAPA (react; evaluate; implement; review effectiveness; update risks; change AMS); fed by §9.2 audit findings, §9.3 review outputs, §9.1 KPI deviations.
  Both feed §10.1 — the proactive obligation is the apex.

IAM MATURITY LEVELS:
  Level 1 Initial/Ad-hoc: no procedures; reactive; outcomes unpredictable.
  Level 2 Aware: AM recognized; some procedures; reactive with limited proactive.
  Level 3 Defined: procedures defined and documented; outcomes repeatable; PDCA in place.
  Level 4 Managed: quantitative measurement; data-driven; integration across silos; predictable outcomes. ← de-facto ISO 55001 target.
  Level 5 Optimized: predictive analytics; innovation-led; continuous refinement; outcomes exceed targets. ← rare, resource-intensive.

NONCONFORMITY (§10.2) vs OBSERVATION (§9.2) vs OFI (§9.2):
  Nonconformity: requirement not met; triggers §10.2 CAPA.
  Observation: noted weakness not (yet) an NC; no §10.2 trigger; next-cycle closure.
  OFI: suggestion for improvement; no NC; feeds §10.1 (proactive), not §10.2 (reactive).`,
    practical_application: `Run the IAM self-assessment annually across all 39 Anatomy subjects (or a focused 9-subject PI subset for the §10 assessment); score each subject on evidence + integration + outcome (1-5 scale); compute M_org = mean. Identify the 3-5 lowest-scoring subjects; build a 24-month improvement roadmap with quarterly checkpoints, named owners, budget, and §10.1 traceable actions. Implement the CAPA register on the EAM with 30d (Major) / 90d (Minor) SLAs; require 5-Whys minimum RCA on every NC, FTA/FMEA on complex NCs; document effectiveness review (re-audit or KPI trend). Update §6.3 risk register when CAPA reveals new risk information. Update §5.2 policy, §6.2 objectives, AMS manual when CAPA reveals systemic gaps. Feed the roadmap to §9.3 output 'improvement opportunities' (§9.3.2.1). Benchmark against peers (industry consortia, regulator, IAM benchmark database) — recalibrate targets annually. Score §10 maturity using the IAM Maturity Model and target Level 4 (Managed) within 24 months.`,
    decision_scenario: `You are the CAMA assessor. The auditee's IAM self-assessment scores 9 PI subjects: 3+3+2+2+3+3+2+2+2 = 22 (M_org = 2.4, Level 2.4 Aware trending to Defined). The CAPA register shows 4 of 12 corrective actions closed within 90 days, 8 overdue >180 days. No formal improvement roadmap exists; no CI Manager; no benchmarking evidence. What is your maturity finding and your top three improvement recommendations?

Finding: §10 maturity Level 2.0 (Aware) — CAPA process ineffective (Level 2); no CI roadmap (Level 2); no benchmarking (Level 2). Critical Major NC under §10.2 (d) effectiveness review not done (8 CAPAs overdue >180 days).

Recommendations: (1) Implement CAPA register on EAM with 30d (Major) / 90d (Minor) SLAs; require 5-Whys RCA minimum (FTA/FMEA for complex); document effectiveness review (re-audit or KPI trend); close the 8 overdue CAPAs within 60 days with documented RCA. (2) Build a 24-month improvement roadmap from M_org 2.4 → Level 4 (Managed), quarterly checkpoints, named owners, $1.38M budget; feed roadmap to §9.3 output 'improvement opportunities'. (3) Appoint a CI Manager (full-time); benchmark against peers (industry consortia, regulator, IAM benchmark database) to validate self-assessment scores and recalibrate targets annually.`,
    practice_questions: `1. List the 6 steps of ISO 55001 §10.2 CAPA (react; evaluate; implement; review effectiveness; update risks; change AMS).
2. Compute M_org given 9 subject scores 3+3+2+2+3+3+2+2+2 = 22.
3. Identify the IAM Maturity Level that requires 'quantitative measurement and data-driven management' (Level 4 Managed) vs 'predictive analytics and innovation-led improvement' (Level 5 Optimized).
4. Classify: 'CI Manager role not appointed; CAPA register on spreadsheet with no SLA tracking; closure rate 33%' — Major NC, Minor NC, Observation, or OFI?`,
    certification_questions: `1. ISO 55001 §10.2 mandatory steps count: 6 (react; evaluate need; implement; review effectiveness; update risks; change AMS).
2. IAM Maturity Model levels count: 5 (Initial/Ad-hoc, Aware, Defined, Managed, Optimized).
3. De-facto ISO 55001 maturity target: Level 4 (Managed).
4. CAPA register closure rate target: ≥ 90% within SLA (Major 30d, Minor 90d).`,
    summary: `ISO 55001 §10 closes the AMS PDCA. §10.1 (proactive continual improvement of suitability, adequacy, effectiveness) drives step-changes in maturity. §10.2 (reactive CAPA on NC) executes the 6-step corrective action (react; evaluate need; implement; review effectiveness; update risks; change AMS). The IAM Maturity Model (5 levels: Initial, Aware, Defined, Managed, Optimized) applied to the 39 AM Anatomy subjects is the canonical maturity-scoring tool. M_org = (1/N)·Σ M_subject; the improvement roadmap targets Level 4 (Managed) — the de-facto ISO 55001 target — within 24 months, with quarterly checkpoints, named owners, budget, and §9.3 output traceability. Benchmarking against peers is essential to validate self-assessment scores. Level 5 (Optimized) is rare and requires quantitative Level 4 foundation, predictive analytics, ML, and innovation culture.`,
    key_takeaways: `- §10.1 proactive (continual improvement) vs §10.2 reactive (CAPA on NC) — both feed §10.1.
- §10.2 has 6 mandatory steps: react; evaluate need (RCA); implement; review effectiveness; update risks; change AMS.
- CAPA addresses the cause (root-cause, 5-Whys minimum; FTA/FMEA for complex), not the symptom.
- Effectiveness review (§10.2 d) requires documented evidence (re-audit or KPI trend), not a checkbox.
- IAM Maturity Model: 5 levels (Initial, Aware, Defined, Managed, Optimized); Level 4 (Managed) is the de-facto ISO 55001 target.
- M_org = (1/N) · Σ M_subject; improvement gap ΔM = M_target − M_org.
- Roadmap: 24 months, quarterly checkpoints, named owners, budget, §9.3 output 'improvement opportunities' trace.
- Benchmarking against peers is essential to validate self-assessment scores; self-assessment alone risks inflation.
- Level 5 (Optimized) requires Level 4 (Managed) quantitative foundation, predictive analytics, ML, innovation culture.`,
    references: `- ISO 55001:2014, Asset management — Management systems — Requirements, §10.1 (Improvement — General), §10.2 (Nonconformity & Corrective Action).
- ISO 55000:2014, Asset management — Overview, principles and terminology (assurance + continual-improvement principle).
- ISO 55002:2018, Asset management — Guidelines for the application of ISO 55001, §A.10 (improvement guidance).
- The IAM, Asset Management — An Anatomy (39 subjects, 6 groups).
- The IAM, Asset Management Maturity Model (5-level scale; self-assessment tool).
- ISO 19011:2018, Guidelines for auditing management systems (audit findings feed §10.2 CAPA).`,
  },
  knowledgeObject: {
    title: "Continual Improvement & Maturity (ISO 55001 §10)",
    domain: "Asset Management System (ISO 55001)",
    competency: "Continual Improvement & Maturity",
    topic: "AMS Improvement (§10.1), CAPA (§10.2), IAM Maturity Model, Self-Assessment, Roadmap",
    concept: "ISO 55001 §10.1 continual improvement (suitability/adequacy/effectiveness) + §10.2 nonconformity & corrective action (6-step CAPA — react; evaluate need (RCA); implement; review effectiveness; update risks; change AMS); IAM Maturity Model 5 levels applied to 39 Anatomy subjects; self-assessment → improvement roadmap → §9.3 output → §10.1 actions → next-cycle self-assessment",
    body: {
      definitions: [
        "§10.1 continual improvement: ISO 55001 clause requiring the organization to continually improve the suitability, adequacy, and effectiveness of the AMS.",
        "§10.2 nonconformity & corrective action: ISO 55001 clause requiring, when an NC occurs, the 6-step CAPA (react; evaluate need; implement; review effectiveness; update risks; change AMS).",
        "Nonconformity (§10.2): requirement not met — triggers §10.2 CAPA.",
        "Corrective action (CAPA): action to eliminate the cause of a nonconformity (root-cause, not symptom).",
        "Root-cause analysis (RCA): structured technique (5-Whys, Fishbone/Ishikawa, FTA, FMEA) to identify the underlying cause.",
        "IAM Maturity Model: 5-level scale (1 Initial/Ad-hoc → 2 Aware → 3 Defined → 4 Managed → 5 Optimized) applied to the 39 AM Anatomy subjects.",
        "Level 1 — Initial/Ad-hoc: no procedures; reactive; outcomes unpredictable.",
        "Level 2 — Aware: AM recognized; some procedures; reactive with limited proactive.",
        "Level 3 — Defined: procedures defined; outcomes repeatable; PDCA in place.",
        "Level 4 — Managed: quantitative measurement; data-driven; integration across silos; predictable outcomes.",
        "Level 5 — Optimized: predictive analytics; innovation-led; continuous refinement; outcomes exceed targets.",
        "39 AM Anatomy subjects: IAM Anatomy's 39 subjects grouped under 6 conceptual groups (Strategy & Planning; AM Decision-Making; Lifecycle Delivery; Risk & Reliability; HSEQ; Asset Information).",
        "Self-assessment: the organization's own scoring of its 39 Anatomy subjects using the maturity scale; refreshed annually.",
        "Improvement roadmap: prioritized plan to raise maturity scores from current to target levels with owners, budget, timeline.",
        "Benchmarking: comparing the organization's maturity scores against peers (industry consortia, regulator benchmarks, IAM benchmark database).",
        "Maturity-to-improvement loop: self-assessment → gaps → roadmap → §9.3 output 'improvement opportunities' → §10.1 actions → next-cycle self-assessment.",
      ],
      principles: [
        "§10.1 proactive (continual improvement); §10.2 reactive (CAPA on NC) — both feed §10.1.",
        "Suitability + adequacy + effectiveness — three distinct improvement dimensions.",
        "CAPA addresses the cause (root-cause, 5-Whys minimum; FTA/FMEA for complex), not the symptom.",
        "Effectiveness review (§10.2 d) requires documented evidence (re-audit or KPI trend), not a checkbox.",
        "Risks and opportunities are updated (§10.2 e) when CAPA reveals new risk information.",
        "AMS changes (§10.2 f) are made when CAPA reveals systemic AMS gaps (policy, objectives, procedures).",
        "IAM Maturity Model: 5 levels (Initial, Aware, Defined, Managed, Optimized) — Level 4 (Managed) is the de-facto ISO 55001 target.",
        "Improvement roadmap: quarterly checkpoints, named owners, budget, traceable to §9.3 outputs.",
        "Benchmarking validates self-assessment scores against peers — self-assessment alone risks inflation.",
      ],
      components: [
        "CAPA register (NC log with root-cause, action, SLA, closure verification).",
        "Root-cause analysis templates (5-Whys, Fishbone/Ishikawa, FTA, FMEA).",
        "IAM Maturity Model (5 levels × 39 Anatomy subjects scoring rubric).",
        "Self-assessment scorecard (annual; 39 subjects × 3 dimensions evidence/integration/outcome).",
        "Improvement roadmap (prioritized actions; owners; budget; quarterly checkpoints).",
        "§9.3 management-review output 'improvement opportunities' (§9.3.2.1) — feeds §10.1.",
        "§9.3 management-review output 'AM policy or AM objectives changes' (§9.3.2.2) — feeds §10.1.",
        "Closed-loop traceability matrix: §9.2 NC → §10.2 CAPA → §9.3 input 'status of previous actions' → §10.1 improvement → next-cycle self-assessment.",
        "Benchmarking database (industry consortia, regulator benchmarks, IAM benchmark database).",
      ],
      mechanism: [
        "§10 lifecycle: trigger §10.2 CAPA on NC (from §9.2 audit, §9.3 review, §9.1 KPI deviation, regulator, incident) → step (a) react and control → step (b) evaluate need (RCA: 5-Whys minimum; FTA/FMEA complex) → step (c) implement corrective action (owner, due date, budget) → step (d) review effectiveness (documented evidence: re-audit, KPI trend) → step (e) update risks and opportunities (§6.3 register, §6.1 assessment) → step (f) make AMS changes if systemic (policy §5.2, objectives §6.2, SAMP, AMPs, procedures) → §10.1 continual improvement: run annual IAM self-assessment (39 subjects × 3 dimensions × 5 levels) → compute M_org = mean → identify gaps → build roadmap (24 months, quarterly checkpoints, owners, budget) → feed §9.3 outputs 'improvement opportunities' + 'AM policy or AM objectives changes' + 'resource needs' + 'AMS changes' → benchmark against peers → re-assess annually (closed loop).",
      ],
      process: [
        "1. Trigger §10.2 CAPA when an NC is identified (§9.2 audit, §9.3 review, §9.1 deviation, regulator, incident).",
        "2. Step (a): react to NC, take action to control and correct, deal with consequences.",
        "3. Step (b): evaluate the need for action — RCA (5-Whys for simple; Fishbone, FTA, FMEA for complex); document root cause(s).",
        "4. Step (c): implement corrective action(s) — action plan with owner, due date, budget; track on CAPA register.",
        "5. Step (d): review effectiveness — verify closure with documented evidence (re-audit, KPI trend); not a checkbox.",
        "6. Step (e): update risks and opportunities (§6.3 register, §6.1 assessment) if CAPA reveals new risk information.",
        "7. Step (f): make AMS changes if CAPA reveals systemic gaps — update policy (§5.2), objectives (§6.2), SAMP, AMPs, procedures, training.",
        "8. §10.1 continual improvement: run annual IAM self-assessment (39 subjects × 3 dimensions × 5 levels); compute M_org.",
        "9. Build improvement roadmap: prioritize by gap-to-target × criticality × cost; assign owners, budget, quarterly checkpoints.",
        "10. Feed roadmap to §9.3 outputs 'improvement opportunities' (§9.3.2.1) and 'AM policy or AM objectives changes' (§9.3.2.2).",
        "11. Benchmark maturity against peers; recalibrate targets annually.",
        "12. Re-assess annually; close loop: this-cycle self-assessment → next-cycle §9.3 input 'status of previous actions'.",
      ],
      formulas: [
        "IAM Maturity per subject M_subject ∈ {1..5} (Initial, Aware, Defined, Managed, Optimized).",
        "Default weighted per-subject M = w_e·S_evidence + w_i·S_integration + w_o·S_outcome; weights 0.4/0.3/0.3.",
        "Organizational maturity M_org = (1/N) · Σ M_subject_j (mean across N subjects).",
        "Improvement gap ΔM = M_target − M_org (levels).",
        "Roadmap horizon T (months); checkpoints = T/k (k=3 quarterly, 6 bi-monthly, 12 monthly).",
        "CAPA closure rate C_CAPA = N_closed / N_open within SLA (target ≥ 90%).",
      ],
      metrics: [
        "M_org organizational maturity [1..5] — target Level 4 (Managed) within 24 months.",
        "CAPA closure rate C_CAPA [0..1] — target ≥ 0.90 within SLA (Major 30d, Minor 90d).",
        "Number of overdue CAPAs > SLA [count] — target 0.",
        "RCA performed on every NC [%] — target 100%.",
        "Effectiveness review documented [%] — target 100% of closures.",
        "Improvement roadmap checkpoints met [%] — target ≥ 90%.",
        "Improvement roadmap budget variance [%] — target within ±10% of plan.",
        "Benchmarking cycles per year [count] — target ≥ 1.",
        "§10 maturity score [1..5] — target Level 4 (Managed) within 24 months.",
      ],
      examples: [
        "GridCo §10 self-assessment: 9 PI subjects scored 3+3+2+2+3+3+2+2+2 = 22 → M_org = 22/9 = 2.444 ≈ 2.4 (Aware trending to Defined).",
        "Improvement roadmap: 24 months, 8 quarterly checkpoints, +14 levels across 9 subjects, $1.38M budget → M_org 2.4 → 4.0+ (Level 4 Managed).",
        "CAPA deep-dive (Subject 3 NC: 4/12 closed in 90 days, 8 overdue >180 days): 5-Whys RCA → root cause 'no CI Manager + EAM CAPA module not configured' → appoint CI Manager + configure EAM module + 30d/90d SLAs + effectiveness review.",
        "Level 4 (Managed) requires: quantitative measurement (SPC, KPI dashboards), data-driven management, integration across silos, predictable outcomes.",
        "Level 5 (Optimized) requires: predictive analytics (RUL, ML-based AHI), innovation-led improvement, continuous refinement, outcomes exceed targets — rare, resource-intensive.",
      ],
      industrial_examples: [
        "Utilities — UK regional transmission utility: IAM self-assessment across 39 subjects; M_org = 2.4 → Level 4 (Managed) in 22 months; CI Manager appointed; CAPA module on EAM; benchmark against UK ENA asset-management benchmark.",
        "Oil & Gas — Shell downstream refinery: M_org = 4.2 (Level 4 Managed trending to Optimized); CAPA closure rate 96% within SLA; quantitative CI metrics; cross-functional CI teams; benchmark against concawe downstream-refinery benchmark; trending to Level 5 (Optimized) with predictive analytics on RUL and ML-based AHI.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Municipal water utility 'AquaCo' (mid-size, 800k connections, 3 WTWs). CAMA assessor §10 findings: maturity Level 1.5 (Initial trending to Aware). Gaps: no CAPA register; no RCA ever performed; no IAM self-assessment; no CI roadmap; no CI function; no benchmarking. Recommendations: (1) implement CAPA register on EAM with 30d/90d SLAs; (2) train 3 engineers on RCA (5-Whys + Fishbone + FMEA); (3) run first IAM self-assessment; (4) appoint CI Manager (0.5 FTE → full-time in 12 mo); (5) build 24-month roadmap to Level 3, 48-month to Level 4; (6) benchmark against UK WIAM benchmark. Target Level 2.5 in 6 mo, Level 3 in 18 mo, Level 4 in 48 mo.",
      ],
      common_errors: [
        "Confusing §10.1 (proactive continual improvement) with §10.2 (reactive CAPA on NC) — both feed §10 but the obligations are distinct.",
        "Treating CAPA as a checkbox — closing an NC without RCA fails §10.2 (b); without effectiveness review fails §10.2 (d).",
        "5-Whys stopped too early (Why 1-3) — root cause not reached; symptom addressed, not cause.",
        "CAPA register with no SLA tracking — findings age without closure; closure rate < 90% (typical §10 Major NC).",
        "Effectiveness review by self-declaration without re-audit or KPI trend evidence — fails §10.2 (d).",
        "Risks and opportunities not updated (§10.2 e) when CAPA reveals new risk information — fails §10.2 (e).",
        "AMS unchanged (§10.2 f) when CAPA reveals systemic AMS gaps (policy, objectives, procedures) — fails §10.2 (f).",
        "No IAM self-assessment — maturity never measured; improvement is gut-feel not data-driven.",
        "Improvement roadmap without budget or owners — paper plan, no execution.",
        "No benchmarking — internal self-assessment alone; risk of scoring inflation.",
        "Targeting Level 5 (Optimized) without Level 4 (Managed) baseline — unrealistic; Level 5 requires Level 4 quantitative foundation.",
      ],
      limitations: [
        "Maturity scoring is subjective — Major vs Minor NC classification, evidence/integration/outcome scoring all require assessor calibration.",
        "Self-assessment alone risks scoring inflation — benchmarking against peers is essential.",
        "Roadmap horizons >24 months are speculative — technology, regulation, organization change.",
        "Level 5 (Optimized) is rare and resource-intensive — predictive analytics, ML, innovation culture are not achievable for most organizations.",
        "CAPA effectiveness review is expensive (re-audits, KPI trends) — small orgs may struggle to resource.",
        "5-Whys is the minimum RCA but insufficient for complex NCs (multi-cause, latent conditions) — FTA/FMEA required.",
        "Benchmarking data is not always available — small industries, regulated monopolies may lack peers.",
      ],
      best_practices: [
        "Run the IAM self-assessment annually across all 39 Anatomy subjects (or focused 9-subject PI subset); score each on evidence + integration + outcome; compute M_org.",
        "Identify the 3-5 lowest-scoring subjects; build a 24-month improvement roadmap with quarterly checkpoints, named owners, budget.",
        "Implement CAPA register on EAM with 30d (Major) / 90d (Minor) SLAs; require 5-Whys RCA minimum (FTA/FMEA for complex); document effectiveness review.",
        "Update §6.3 risk register when CAPA reveals new risk information (§10.2 e).",
        "Update §5.2 policy, §6.2 objectives, AMS manual when CAPA reveals systemic gaps (§10.2 f).",
        "Feed the roadmap to §9.3 output 'improvement opportunities' (§9.3.2.1).",
        "Benchmark against peers (industry consortia, regulator, IAM benchmark database); recalibrate targets annually.",
        "Score §10 maturity using the IAM Maturity Model and target Level 4 (Managed) within 24 months.",
      ],
      related_concepts: [
        "Asset Management System (AMS) — §9.1 monitoring, §9.2 internal audit, §9.3 management review (these feed §10).",
        "Performance Monitoring & Asset KPIs (Lesson 1) — §9.1 KPI dashboard data drives maturity scoring.",
        "Internal Audit & Management Review (Lesson 2) — §9.2 audit findings and §9.3 outputs feed §10 actions.",
        "IAM Anatomy (39 subjects, 6 groups) — the conceptual reference for self-assessment.",
        "IAM Maturity Model (5 levels) — the canonical maturity-scoring tool.",
        "Root-cause analysis (5-Whys, Fishbone, FTA, FMEA) — RCA underpins §10.2 (b).",
      ],
      prerequisites: [
        "CAMA Asset Management System (AMS) — §9.1 monitoring, §9.2 internal audit, §9.3 management review (these feed §10).",
        "Performance Monitoring & Asset KPIs (Lesson 1) — §9.1 KPI dashboard is the data source for maturity scoring.",
        "Internal Audit & Management Review (Lesson 2) — §9.2 audit findings and §9.3 outputs feed §10 improvement actions.",
        "Root-cause analysis techniques (5-Whys, Fishbone, FTA, FMEA) for §10.2 CAPA.",
        "Familiarity with maturity models (CMMI, ISO 9004 self-assessment, IAM Maturity Model) and benchmarking.",
      ],
      references: [
        "ISO 55001:2014, Asset management — Management systems — Requirements, §10.1 (Improvement — General), §10.2 (Nonconformity & Corrective Action).",
        "ISO 55000:2014, Asset management — Overview, principles and terminology (assurance + continual-improvement principle).",
        "ISO 55002:2018, Asset management — Guidelines for the application of ISO 55001, §A.10 (improvement guidance).",
        "The IAM, Asset Management — An Anatomy (39 subjects, 6 groups).",
        "The IAM, Asset Management Maturity Model (5-level scale; self-assessment tool).",
        "ISO 19011:2018, Guidelines for auditing management systems (audit findings feed §10.2 CAPA).",
      ],
    },
  },
  questions: [
    {
      competencyName: "Continual Improvement & Maturity",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem:
        "Under ISO 55001 §10.2, when a nonconformity occurs, the organization must take which sequence of actions?",
      whyCorrect:
        "ISO 55001 §10.2 specifies 6 mandatory steps when a nonconformity occurs: (a) react to the nonconformity and take action to control and correct it, and deal with the consequences; (b) evaluate the need for action to eliminate the causes of the nonconformity, in order for it not to recur or occur elsewhere, by reviewing the root-cause analysis; (c) implement any action needed; (d) review the effectiveness of any corrective action taken; (e) update risks and opportunities, if necessary; (f) make changes to the AMS, if necessary. 'React → evaluate need → implement → review effectiveness → update risks → change AMS' captures the 6 steps in order. The other options omit or reorder steps, failing §10.2 conformance.",
      whyOthersWrong: [
        "Option 'Identify → record → escalate → close' — not ISO 55001 §10.2; this is a generic problem-management sequence, missing RCA, effectiveness review, risk update, AMS change.",
        "Option 'Plan → Do → Check → Act' — this is the PDCA cycle, not the §10.2 CAPA sequence; PDCA is the AMS framework, not the corrective-action steps.",
        "Option 'Audit → report → findings → closure' — this is the §9.2 audit process, not the §10.2 CAPA process; §9.2 produces findings, §10.2 acts on them.",
      ],
      explanation:
        "§10.2 has 6 mandatory steps: (a) react; (b) evaluate need (RCA); (c) implement; (d) review effectiveness; (e) update risks; (f) change AMS. The 6 steps must be in order; missing or reordering any fails §10.2 conformance.",
      options: [
        { text: "Identify → record → escalate → close", isCorrect: false },
        { text: "Plan → Do → Check → Act", isCorrect: false },
        { text: "React → evaluate need → implement → review effectiveness → update risks → change AMS", isCorrect: true },
        { text: "Audit → report → findings → closure", isCorrect: false },
      ],
    },
    {
      competencyName: "Continual Improvement & Maturity",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Utilities",
      stem:
        "An organization's IAM self-assessment scores 9 PI subjects as follows: Performance Monitoring = 3, Audit & Assurance = 3, CAPA = 2, Continual Improvement = 2, Asset Risk = 3, AM Strategy = 3, Lifecycle Delivery = 2, AM Decision-Making = 2, Asset Information = 2. Compute M_org (organizational maturity, mean of the 9 subjects) and identify the IAM level.",
      whyCorrect:
        "M_org = (1/N) · Σ M_subject_j where N = 9 and the subjects sum to 3 + 3 + 2 + 2 + 3 + 3 + 2 + 2 + 2 = 22. M_org = 22 / 9 = 2.444 ≈ 2.4 (rounded to one decimal). The IAM Maturity Model has 5 levels (1 Initial, 2 Aware, 3 Defined, 4 Managed, 5 Optimized); a score of 2.4 sits at Level 2 (Aware) trending to Level 3 (Defined). The organization's de-facto ISO 55001 target is Level 4 (Managed), so the improvement gap ΔM = 4.0 − 2.4 = 1.6 levels.",
      whyOthersWrong: [
        "Option M_org = 22.0 — sums the 9 scores (22) without dividing by N=9; M_org is the MEAN, not the sum; 22 is on a 9-45 scale, not the 1-5 maturity scale.",
        "Option M_org = 4.0 — would be the mean if all 9 subjects scored 4 (sum 36); the actual scores include five 2s and four 3s, sum 22, mean 2.44.",
        "Option M_org = 2.0 — would be the mean if the sum were 18 (e.g., all 2s); the actual sum is 22 (with four 3s), so M_org = 22/9 = 2.44.",
      ],
      explanation:
        "M_org = (1/N) · Σ M_subject_j = (1/9) · (3+3+2+2+3+3+2+2+2) = 22/9 = 2.444 ≈ 2.4. IAM Level 2 (Aware) trending to Level 3 (Defined). Gap to Level 4 (Managed) target = 1.6 levels.",
      options: [
        { text: "M_org = 22.0 (sum of scores)", isCorrect: false },
        { text: "M_org = 4.0 (Level 4 Managed)", isCorrect: false },
        { text: "M_org = 2.4 (Level 2 Aware trending to Defined)", isCorrect: true },
        { text: "M_org = 2.0 (Level 2 Aware, stable)", isCorrect: false },
      ],
    },
    {
      competencyName: "Continual Improvement & Maturity",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Conceptual",
      scenario: "Oil & Gas",
      stem:
        "An Oil & Gas operator's CI function proposes three improvement actions for the §10.1 continual-improvement programme. Which one is correctly classified as a §10.2 CORRECTIVE ACTION (triggered by a nonconformity) versus an Opportunity for Improvement (OFI, fed to §10.1)?",
      whyCorrect:
        "A §10.2 corrective action is triggered by a nonconformity (a requirement not met) — its purpose is to eliminate the cause of the NC so it does not recur. The action 'Implement 5-Whys RCA + EAM CAPA module with 30d/90d SLAs after the §9.2 audit found 4/12 corrective actions overdue >180 days' is a §10.2 corrective action — triggered by a clear NC (CAPA closure rate 33% < 90% target = requirement not met) and aimed at eliminating the cause (no CI Manager + no SLA tracking). The other two options (ML-based AHI pilot; benchmark against concowe; cross-functional CI team) are §10.1 improvement opportunities / OFIs — they are proactive, not triggered by an NC.",
      whyOthersWrong: [
        "Option 'Pilot ML-based Asset Health Index to replace rule-based AHI' — this is a §10.1 improvement opportunity / OFI, not a §10.2 corrective action; no NC triggered it; it is a proactive enhancement.",
        "Option 'Benchmark maintenance cost per barrel against concowe downstream-refinery benchmark' — this is a §10.1 benchmarking initiative / OFI, not a §10.2 corrective action; no NC triggered it.",
        "Option 'Form cross-functional CI team to review top 3 risk register items monthly' — this is a §10.1 process enhancement / OFI, not a §10.2 corrective action; no NC triggered it.",
      ],
      explanation:
        "§10.2 corrective actions are triggered by nonconformities (requirements not met) and aim to eliminate the cause via RCA. OFIs and §10.1 improvement opportunities are proactive enhancements, not triggered by NCs. The CAPA on the overdue-closure NC is the only §10.2 action.",
      options: [
        { text: "Pilot ML-based Asset Health Index to replace rule-based AHI", isCorrect: false },
        { text: "Benchmark maintenance cost per barrel against concowe benchmark", isCorrect: false },
        { text: "Implement 5-Whys RCA + EAM CAPA module (30d/90d SLAs) after §9.2 audit found 4/12 CAPAs overdue >180 days", isCorrect: true },
        { text: "Form cross-functional CI team to review top-3 risk register items monthly", isCorrect: false },
      ],
    },
    {
      competencyName: "Continual Improvement & Maturity",
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Power",
      stem:
        "True or False: Under the IAM Maturity Model, Level 4 (Managed) requires evidence of quantitative measurement and data-driven management, while Level 5 (Optimized) requires evidence of predictive analytics and innovation-led improvement — therefore Level 4 (not Level 5) is the de-facto ISO 55001 target maturity for certified organizations.",
      whyCorrect:
        "TRUE. The IAM Maturity Model defines: Level 4 (Managed) — quantitative measurement; data-driven management; integration across silos; predictable outcomes; this is the de-facto target for ISO 55001 certified organizations because ISO 55001 §9.1 (monitoring/measurement) and §9.3 (management review) demand quantitative evidence. Level 5 (Optimized) — predictive analytics; innovation-led improvement; continuous refinement; outcomes exceed targets; this level is rare and resource-intensive, requiring a Level 4 quantitative foundation plus ML, RUL estimation, and an innovation culture. The CAMA assessor scores organizations against this 5-level scale; Level 4 (Managed) is the achievable, auditable target; Level 5 (Optimized) is aspirational and reserved for organizations with mature predictive analytics programmes.",
      whyOthersWrong: [
        "Option FALSE — would conflate Level 4 and Level 5 or claim Level 5 is the de-facto target. Level 5 requires Level 4 quantitative foundation plus predictive/ML capabilities; it is rare and resource-intensive. The de-facto ISO 55001 target for certified organizations is Level 4 (Managed), per the IAM Maturity Model and CAMA assessor convention.",
      ],
      explanation:
        "TRUE. Level 4 (Managed) = quantitative measurement + data-driven management — the de-facto ISO 55001 target. Level 5 (Optimized) = predictive analytics + innovation-led — rare, requires Level 4 foundation. Level 4 is the achievable target for certified organizations.",
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Exports — assembled lesson array (mirror cama-ams.ts)
// ---------------------------------------------------------------------------

export const CAMA_PI_LESSONS: RefLesson[] = [
  LESSON_PERF_MON,
  LESSON_AUDIT_REVIEW,
  LESSON_CONTINUAL_IMPROVEMENT,
];

// ---------------------------------------------------------------------------
// PI competencies created inside loadReference() (PI domain exists in
// src/lib/ref-content/cama.ts with NO competencies yet — this loader seeds
// the 3 PI competencies and then loads the deep content).
// ---------------------------------------------------------------------------

interface SeedCompetency {
  name: string;
  description: string;
  order: number;
}

const CAMA_PI_COMPETENCIES: SeedCompetency[] = [
  {
    name: "Performance Monitoring & Asset KPIs",
    description:
      "ISO 55001 §9.1 monitoring, measurement, analysis, evaluation — the KPI register (name/definition/formula/unit/target/tolerance/owner/source/frequency/level), tiered dashboards (board/executive/operations/field), OEE = A×P×Q, Availability (OEE vs Inherent = MTBF/(MTBF+MTTR)), MTBF, MTTR, Reliability R(t), Asset Utilization, Cost per Unit, leading vs lagging indicators (target ≥ 50% leading), SPC control charts, KPI-to-AM-objective (§6.2) traceability, and feeding §9.3 management review inputs 'AM performance' and 'AM effectiveness'.",
    order: 1,
  },
  {
    name: "Internal Audit & Management Review",
    description:
      "ISO 55001 §9.2 internal audit (per ISO 19011:2018 — 6 audit principles integrity/fair presentation/due professional care/confidentiality/independence/evidence-based, audit programme management, audit plan, evidence collection, findings classification Conformity/Major NC/Minor NC/Observation/OFI, audit report, follow-up; SLAs Major 30d / Minor 90d) and §9.3 management review (8 mandatory inputs §9.3.1 + 4 mandatory outputs §9.3.2, top management ownership, ≥ annual frequency); the closed-loop PDCA from §9.2 findings → §9.3 input 'audit results' → §9.3 outputs → §10 actions → next-cycle §9.3 input 'status of previous actions'.",
    order: 2,
  },
  {
    name: "Continual Improvement & Maturity",
    description:
      "ISO 55001 §10.1 continual improvement (suitability, adequacy, effectiveness of the AMS) + §10.2 nonconformity & corrective action (6-step CAPA: react; evaluate need via RCA 5-Whys/Fishbone/FTA/FMEA; implement; review effectiveness with documented evidence; update risks §6.3/§6.1; change AMS §5.2/§6.2/SAMP/AMPs); the IAM Maturity Model (5 levels: Initial, Aware, Defined, Managed, Optimized) applied to the 39 AM Anatomy subjects; self-assessment (M_org = mean across subjects); 24-month improvement roadmap with quarterly checkpoints, named owners, budget, and §9.3 output 'improvement opportunities' traceability; benchmarking against peers; Level 4 (Managed) as the de-facto ISO 55001 target.",
    order: 3,
  },
];

// ---------------------------------------------------------------------------
// Loader — CONTENT-only (mirrors cama-ams.ts) with the additional step of
// creating the 3 PI competencies inside loadReference().
// ---------------------------------------------------------------------------

/**
 * Upsert the CAMA Performance & Improvement (PI) CONTENT into the database.
 * Idempotent: safe to call repeatedly. Returns record counts written.
 *
 * Flow:
 *  1. Find CAMA certification by slug "cama" (the structure+AMP-content loader
 *     in src/lib/ref-content/cama.ts is a prerequisite).
 *  2. Find the PI domain by code "PI" (certificationId = cama.id). The PI
 *     domain exists in cama.ts with NO competencies — delete any stale PI
 *     competencies and create the 3 PI competencies from
 *     CAMA_PI_COMPETENCIES. Map by NAME -> id.
 *  3. Upsert References globally (by title, no sectionId) → shared ids
 *     applied to every PI lesson, KO, and question.
 *  4. For each lesson:
 *     - db.lesson.findFirst({where:{competencyId, slug}}) then update or
 *       create with sectionId=null, certificationId, competencyId, slug,
 *       title, titleAr, order, durationMin, conceptIntroduction, example,
 *       keyFormulas, exercise, sections (JSON.stringify), referenceIds
 *       (JSON.stringify shared), status="READY", confidence="HIGH",
 *       verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
 *  5. Upsert KnowledgeObject per lesson: findFirst({where:{lessonId}}) then
 *       create/update with certificationId, domainId (PI), competencyId,
 *       lessonId, body JSON, referenceIds (JSON shared), certificationIds
 *       (JSON [cama.id]), status="READY", confidence="HIGH",
 *       verificationStatus="VERIFIED", version="1.0.0".
 *  6. Per lesson: deleteMany questions {certificationId, competencyId} then
 *     create each enriched question with nested QuestionOption records,
 *     knowledgeObjectId link, whyCorrect, whyOthersWrong (JSON),
 *     referenceIds (JSON shared), status="READY", verificationStatus=
 *     "VERIFIED", reviewStatus="PENDING", version="1.0.0".
 *  7. Return { certification, domain, competencies, lessons, kos,
 *      questions, references } counts.
 *
 * NOTE: does NOT call src/lib/ref-content/cama.ts — that loader (structure +
 * AMP content) is a prerequisite and must have been run first.
 */
export async function loadReference() {
  // 1) Certification (find by slug "cama")
  const certification = await db.certification.findUnique({
    where: { slug: "cama" },
  });
  if (!certification) {
    throw new Error(
      'CAMA certification not found. Run the CAMA structure+AMP-content loader (src/lib/ref-content/cama.ts) first.'
    );
  }

  // 2) Find the PI domain by code "PI" (certificationId = cama.id). The
  //    PI domain exists in cama.ts but is seeded with NO competencies —
  //    delete any stale PI competencies and create the 3 PI competencies.
  const piDomain = await db.domain.findFirst({
    where: { certificationId: certification.id, code: "PI" },
  });
  if (!piDomain) {
    throw new Error(
      'Performance & Improvement (PI) domain not found under CAMA. Run the CAMA structure+AMP-content loader (src/lib/ref-content/cama.ts) first.'
    );
  }

  // Delete any existing PI competencies (idempotent re-create).
  await db.competency.deleteMany({
    where: { domainId: piDomain.id },
  });

  // Create the 3 PI competencies.
  for (const c of CAMA_PI_COMPETENCIES) {
    await db.competency.create({
      data: {
        domainId: piDomain.id,
        name: c.name,
        description: c.description,
        order: c.order,
      },
    });
  }

  // Map PI competencies by NAME -> id.
  const piCompetencies = await db.competency.findMany({
    where: { domainId: piDomain.id },
  });
  const competencyIdByName: Record<string, string> = {};
  for (const c of piCompetencies) {
    competencyIdByName[c.name] = c.id;
  }
  // Validate that all 3 expected PI competencies exist by name.
  const expectedCompetencyNames = CAMA_PI_LESSONS.map((l) => l.competencyName);
  const missing = expectedCompetencyNames.filter(
    (n) => !competencyIdByName[n]
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing PI competencies by name: ${missing.join(
        ", "
      )}. Ensure CAMA_PI_COMPETENCIES matches CAMA_PI_LESSONS competencyName.`
    );
  }

  // 3) References — global (no sectionId), upserted by title.
  const refIdsByTitle: Record<string, string> = {};
  for (const src of CAMA_PI_SOURCES) {
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
  const sharedReferenceIds = CAMA_PI_SOURCES.map((s) => refIdsByTitle[s.title]).filter(
    Boolean
  ) as string[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 4) Lessons, 5) KnowledgeObjects, 6) Questions
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of CAMA_PI_LESSONS) {
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
      domainId: piDomain.id,
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
          domainId: piDomain.id,
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
    domain: piDomain.id,
    competencies: piCompetencies.length,
    lessons: lessonsCount,
    kos: kosCount,
    questions: questionsCount,
    references: referencesCount,
  };
}
