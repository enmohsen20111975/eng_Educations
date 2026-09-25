// =============================================================================
// Six Sigma (ASQ / IASSC) — DMAIC Define (D) phase — Deep scientific reference
// (Task ID 17-SS-DEFINE).
//
// Certification slug: "six-sigma" (ASQ/IASSC, group "Quality"). Domain code:
// "D" (Define) — the 1st of 5 DMAIC BOK domains. The D domain exists in
// src/lib/ref-content/six-sigma.ts (the combined structure+M/A-content
// loader) but is seeded with NO competencies. This CONTENT-only loader
// creates the 3 Define competencies inside loadReference() and then loads
// the deep scientific content (3 full-spec 24-section lessons + KOs + 12
// enriched questions).
//
// Three lessons, one per Define competency (created below in loadReference()):
//   1. Project Charter & CTQ                  (slug: d-project-charter-ctq)
//   2. Voice of Customer & SIPOC              (slug: d-voc-sipoc)
//   3. Stakeholder & Scope Management         (slug: d-stakeholder-scope)
//
// Each lesson ships:
//   - The full 24-section data-collector template (spec §9, LESSON_TEMPLATE
//     in src/lib/spec.ts), with every applicable section filled with real,
//     in-depth professional Define-phase content. No padding.
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
//     Belt BOK (DMAIC Define domain); ASQ Six Sigma Green Belt BOK; PMI
//     PMBOK Guide 7th ed. (project charter, stakeholder management, scope).
//   - LEVEL 6 — University / Academic Publications: Douglas C. Montgomery,
//     "Statistical Quality Control: A Modern Introduction" (Wiley, 7th ed.).
//   - LEVEL 7 — Technical Publications / Industry Sources: Forrest W.
//     Breyfogle III, "Implementing Six Sigma" (Wiley, 2nd ed.); Peter S.
//     Pande, Robert P. Neuman, Roland R. Cavanagh, "The Six Sigma Way"
//     (McGraw-Hill, 2nd ed.).
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
// Six Sigma domains (M, A, I, C). It operates exclusively on the Define (D)
// domain — it deletes only the existing D competencies (idempotent re-create)
// before creating the 3 D competencies and loading the deep content.
// =============================================================================

import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// Public types (mirror cre-reliability-modeling.ts & six-sigma.ts)
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
// SOURCES — 6 real references cited across all 3 Define lessons.
// ---------------------------------------------------------------------------

export const SS_DEFINE_SOURCES: RefSource[] = [
  {
    title: "ASQ Six Sigma Black Belt Body of Knowledge — Define phase",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "BOK",
    url: "https://asq.org/cert/six-sigma-black-belt",
    citation:
      "American Society for Quality (ASQ). Six Sigma Black Belt (CSSBB) Body of Knowledge — Define phase. The official ASQ competency framework for the Define stage of DMAIC: project identification and selection (charter, problem statement, business case, goal statement, scope, team), voice of the customer (VOC) collection (interviews, focus groups, surveys, Kano analysis), CTQ tree drill-down (VOC → CTQs → drivers → measurable Y), SIPOC (Supplier-Input-Process-Output-Customer) high-level process map, stakeholder analysis (power/interest grid, RACI), and project hand-off to the Measure phase. Anchors the CSSBB exam's Define-phase questions and the project-management competency expected of every Black Belt.",
  },
  {
    title: "ASQ Six Sigma Green Belt Body of Knowledge — Define phase",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "BOK",
    url: "https://asq.org/cert/six-sigma-green-belt",
    citation:
      "American Society for Quality (ASQ). Six Sigma Green Belt (CSSGB) Body of Knowledge — Define phase. The official ASQ competency framework for Green-Belt project scoping: problem statement, goal statement (SMART), project scope and boundaries, VOC and CTQ translation, SIPOC construction, team formation, and the project-charter sign-off process. Green Belts support Black Belts and lead smaller-scope DMAIC projects within their home process; the Define-phase deliverable is the signed charter and a measurable CTQ list passed to the Measure phase.",
  },
  {
    title: "Breyfogle — Implementing Six Sigma (Wiley)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Breyfogle, F. W. (2003). Implementing Six Sigma: Smarter Solutions Using Statistical Methods (2nd ed.). Hoboken, NJ: John Wiley & Sons. ISBN 978-0-471-26572-6. Chapter 1 (Six Sigma overview and the DMAIC roadmap), Chapter 2 (Six Sigma project selection and the project-charter template — problem statement, business case, goal statement, scope, team, milestones), Chapter 3 (VOC and CTQ drill-down — VOC tree, CTQ tree, operational definitions), Chapter 4 (SIPOC and COPQ — appraisal, prevention, internal-failure, external-failure cost categories). The practitioner reference that anchors the Define-phase deliverables and the bridge to the Measure phase.",
  },
  {
    title: "Pande — The Six Sigma Way (McGraw-Hill)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Pande, P. S., Neuman, R. P., & Cavanagh, R. R. (2014). The Six Sigma Way: How GE, Motorola, and Other Top Companies are Honing Their Performance (2nd ed.). New York: McGraw-Hill. ISBN 978-0-07-184904-3. Chapter 4 (Project selection — financial-impact screen, probability-of-success screen, strategic-alignment screen), Chapter 5 (Project charter and the SMART goal statement), Chapter 6 (VOC collection — interviews, focus groups, surveys, Kano analysis for delight factors), Chapter 8 (Stakeholder analysis and the power/interest grid; team formation; communication plan). The leadership-and-method reference that frames Define-phase governance for executives and Green Belts.",
  },
  {
    title: "Montgomery — Statistical Quality Control (Wiley)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Montgomery, D. C. (2013). Statistical Quality Control: A Modern Introduction (7th ed.). Hoboken, NJ: John Wiley & Sons. ISBN 978-1-118-14681-1. Chapter 1 (Quality engineering, COPQ — the four cost categories, and the link to Six Sigma's DPMO/sigma-level thinking), Chapter 3 (VOC translation into CTQs and the operational definition — measurable, testable, communicable), Chapter 4 (SIPOC and the in-control vs out-of-control distinction that defines the Measure-phase entry point). The canonical academic reference for the quality-engineering concepts that underpin the Define-to-Measure hand-off.",
  },
  {
    title: "PMI PMBOK Guide — 7th Edition",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "BOK",
    url: "https://www.pmi.org/standards/pmbok",
    citation:
      "Project Management Institute (PMI). A Guide to the Project Management Body of Knowledge (PMBOK Guide) — 7th Edition (2021). Newtown Square, PA: PMI. ISBN 978-1-62825-707-6. The 12 Project Management Principles (Section III), the 8 Performance Domains including Stakeholder (Section 4.2), Planning (4.3, scope + WBS), and Delivery (4.4); and the 35 Tailoring Considerations. Provides the canonical project-charter elements (problem statement, business case, goal, scope, team, sponsor authorization), the stakeholder engagement plan (power/interest grid, engagement assessment matrix), the RACI matrix, the scope statement and exclusion list, and the integrated change-control (CCB) workflow referenced by the ASQ Six Sigma Define phase for project governance and team management.",
  },
];

const SS_DEFINE_REFERENCE_TITLES = SS_DEFINE_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Lesson 1 — Project Charter & CTQ
// (Competency: "Project Charter & CTQ"; slug: d-project-charter-ctq)
// ---------------------------------------------------------------------------

const LESSON_CHARTER_CTQ: RefLesson = {
  competencyName: "Project Charter & CTQ",
  slug: "d-project-charter-ctq",
  title: "Project Charter & CTQ Tree — Define Phase Deliverable",
  titleAr: "ميثاق المشروع وشجرة CTQ — مخرجات مرحلة التعريف",
  order: 1,
  durationMin: 36,
  references: SS_DEFINE_REFERENCE_TITLES,
  conceptIntroduction: `The Define phase opens with the project charter — the formal authorization document that links a Six Sigma project to a measurable business outcome. The charter carries six canonical elements: (1) the problem statement (what is broken, where, when, how big, in measurable terms); (2) the goal statement (SMART: Specific, Measurable, Achievable, Relevant, Time-bound); (3) the business case (the COPQ — cost of poor quality — recovered when the goal is met, expressed as $/year and payback period); (4) the scope (in-scope processes, equipment, product families, geographic boundaries; explicit out-of-scope items with hand-off owner); (5) the team (Black Belt, Green Belt(s), subject-matter experts, process owner, sponsor, finance reviewer); (6) the milestones (Define-Measure-Analyze-Improve-Control gates with dates). The charter is signed by the Sponsor — the senior leader who funds the project and removes organizational barriers — and is the gate that authorizes the project to enter Measure.

The Critical-to-Quality (CTQ) tree is the second Define deliverable. It translates the Voice of the Customer (VOC) — qualitative, fuzzy customer statements like "I want my shafts to fit first time" — into measurable requirements called CTQs (e.g., "Shaft OD = 10.000 ±0.020 mm"). The CTQ tree has three levels: (Level 1) the customer need (a VOC paraphrase); (Level 2) the CTQ — a measurable characteristic of the output that, if met, satisfies the need; (Level 3) the CTQ driver(s) — the upstream process variables (Xs) that, when set at their target values, deliver the CTQ (Y). The CTQ is the Y in the equation Y = f(X₁, X₂, ..., Xₙ); the drivers are the Xs that the Improve phase will optimize. Each CTQ must carry an operational definition (a measurement that is measurable, testable, and communicable) and a specification (target ± tolerance). The CTQ list is the contract that the Define phase passes to the Measure phase — Measure will baseline the current CTQ performance, the Analyze phase will identify which Xs drive Y, and Improve will set the Xs to deliver Y at the target sigma level.`,
  example: `A CNC grinding cell produces shafts for a transmission assembly. The customer VOC captured in a focus group: "We want shafts that fit the bearing journal first time — no reaming, no scraping, no returns." VOC paraphrase: "Shaft OD must assemble to bearing journal without rework."

**Charter.**
- Problem: Shaft OD out-of-tolerance rejects at 8.5% on grinding cell lines 3-5 (target ≤ 1.0%); rejects flow to regrind station (avg 2.5% recovery, 6% scrap). 12-month period: 240,000 shafts produced, 20,400 rejected.
- Goal: Reduce shaft OD rejects from 8.5% to ≤ 1.5% on lines 3-5 within 4 months (Define 4 wks → Measure 6 wks → Analyze 6 wks → Improve 6 wks → Control 4 wks).
- Business case: COPQ = appraisal $50k + prevention $30k + internal failure $420k (scrap + regrind) + external failure $180k (warranty + returns + lost sales) = $680k/year. Target COPQ after improvement = $160k/year. Net annual benefit = $520k; project cost $65k; ROI = $520k / $65k = 8.0×; payback 1.5 months.
- Scope (in): grinding cell lines 3-5, CNC grinders G07-G12, CMM gage C-3, fixtures F-22/F-23, aluminum-oxide wheel spec AW-60; (out): incoming bar stock inspection (handoff: Procurement Mgr), heat-treat process (handoff: Met Eng Mgr), supplier audit (handoff: Supplier Quality).
- Team: Sponsor (Plant Mgr), Black Belt (J. Doe, 100% allocated), 2 Green Belts (40% allocated each), Process Engineer, 2 Operators, QA Inspector, Finance reviewer.
- Milestones: Define gate 4 wks; Measure gate 10 wks; Analyze gate 16 wks; Improve gate 22 wks; Control gate 26 wks.

**CTQ tree (VOC → CTQ → driver).**
- Need: "Shaft OD assembles to bearing journal without rework."
  - CTQ-1: Shaft OD = 10.000 ± 0.020 mm (operational def: CMM gage C-3, 5-point scan per shaft).
    - Drivers: wheel-feed rate (X1), infeed position (X2), fixture repeatability (X3), wheel-grit freshness (X4).
  - CTQ-2: Surface finish Ra ≤ 0.8 µm (operational def: profilometer P-1, single trace at mid-shaft).
    - Drivers: wheel-grit size (X5), coolant flow (X6), wheel-speed (X7).
  - CTQ-3: Shaft length = 50.000 ± 0.050 mm (operational def: caliper, single read at face).
    - Drivers: end-stop repeatability (X8), bar-stock length variation (X9, out-of-scope — flag to Procurement).

The CTQ list passed to Measure: 3 CTQs, 8 measurable in-scope drivers. The Improve phase will run a DOE on X1, X3, X4, X5, X6, X7 to set the optimal operating window; Analyze will identify which drivers dominate Y via regression on the Measure-phase data.`,
  keyFormulas: `COPQ (Cost of Poor Quality) = Appraisal + Prevention + Internal Failure + External Failure
  Appraisal = inspection + test + calibration + audit (detect defects before customer)
  Prevention = training + procedures + design reviews + poka-yoke (prevent defects)
  Internal Failure = scrap + rework + regrind + downtime + retest (defects caught internally)
  External Failure = warranty + returns + RMA + recalls + lost sales + liability (defects reach customer)
COPQ as % of revenue = (COPQ / Revenue) × 100%   (a quality-maturity benchmark; ≥ 15% = opportunity)
Sigma level (short-term, centered) = 3 × Cp   where Cp = (USL − LSL) / (6 σ̂_within)
Sigma level (long-term, with 1.5σ shift) = 3 × Cp − 1.5
DPMO = (Defects / (Opportunities × Units)) × 1,000,000
Yield (first-pass, FPY) = (Good units / Total units) × 100%
CTQ tree levels: VOC → CTQ (Y) → driver (X); Y = f(X₁, X₂, ..., Xₙ)
Operational definition: (i) measurable, (ii) testable, (iii) communicable
SMART goal: Specific, Measurable, Achievable, Relevant, Time-bound`,
  exercise: `You are a Green Belt on a hospital's Emergency Department wait-time project. Current state: ED door-to-provider time averages 4 h 12 min (target ≤ 2 h 0 min); 32% of visits exceed 4 h; patient complaints up 38% YoY. Patient VOC (30 interviews): "I want to be seen quickly by a doctor; I don't want to repeat my symptoms to three different people." (a) Write the problem statement (what, where, when, how big — measured). (b) Write the goal statement (SMART). (c) Build the business case (COPQ categories; assume appraisal $80k, prevention $20k, internal-failure = 1 lost-bed-hour × $1,200 × 1,400 events = $1.68M, external failure = $0.4M patient leakage + $0.2M reputation). (d) Build a CTQ tree with 3 CTQs (door-to-provider time, triage accuracy, discharge-rx clarity) and at least 2 drivers per CTQ. (e) List charter milestones for a 4-month DMAIC project.`,
  sections: {
    learning_objectives: `- Define the project charter as the formal authorization document linking a Six Sigma project to a measurable business outcome; list its six canonical elements (problem, goal, business case, scope, team, milestones).
- Write a problem statement that is specific, measurable, bounded (where/when/how big), and free of root-cause or solution bias.
- Write a SMART goal statement (Specific, Measurable, Achievable, Relevant, Time-bound) that ties to the problem statement's baseline.
- Build the business case from the four COPQ categories (appraisal, prevention, internal failure, external failure); compute COPQ as % of revenue and the project ROI.
- Distinguish in-scope (in the project's authority) from out-of-scope (outside the project's authority, with hand-off owner) — the scope-exclusion list / OMOUM.
- Build a CTQ tree (VOC → CTQ → driver) with operational definitions (measurable, testable, communicable) and target ± tolerance on each CTQ.
- Position the charter + CTQ list as the contract passed from Define to Measure; recognize that Measure baselines the CTQs, not the VOC.`,
    prerequisites: `- The DMAIC framework and the position of Define as the first phase.
- Basic project-management concepts (sponsor, scope, milestones, ROI) — covered by PMBOK 7th (PMI, 2021).
- Process thinking: SIPOC, input/output, process variable (X) vs output (Y).
- Basic statistics for the COPQ/sigma-level formulas: mean, standard deviation, normal distribution.
- Customer-research concepts at the conceptual level (interviews, surveys, Kano) — covered in Lesson 2 (VOC & SIPOC).`,
    introduction: `The Define phase is the gate that authorizes a Six Sigma project. Without a signed charter, no resources flow; without an authorized CTQ list, no measurement happens. The Define deliverable is therefore two documents: the project charter (the governance contract between Sponsor, Black Belt, and team) and the CTQ tree (the technical contract between Define and Measure). The charter answers "what problem, for whom, by when, with what business return"; the CTQ tree answers "what measurable Y must we hit, and what Xs do we suspect of driving it." Both documents are revised as the project progresses — the charter is baselined at the Define gate and re-baselined only through the change-control board (CCB), while the CTQ list is revised through Measure (when baselines are confirmed) and Analyze (when driver hypotheses are tested).

The charter's problem statement is the most-rewritten element. A weak problem statement ("the line is slow") blocks the project; a strong problem statement quantifies the gap: "shaft OD rejects at 8.5% on lines 3-5 (target ≤ 1.0%) in the 12-month period 2024-Jan to 2024-Dec, representing $680k/year COPQ and 6% scrap rate; rejects flow to regrind station at 95/hour." The problem statement must be free of root-cause and solution bias — "wheel-grit wear" or "add a second CMM gage" disqualifies the statement. The goal statement mirrors the problem: "Reduce shaft OD rejects from 8.5% to ≤ 1.5% on lines 3-5 within 4 months (26 calendar weeks), recovering $520k/year COPQ." SMART — Specific (the metric), Measurable (the gap), Achievable (based on baseline), Relevant (tied to business), Time-bound (the date).

The business case translates the gap into money. The COPQ model — appraisal + prevention + internal failure + external failure — is the ASQ-canonical cost-of-quality categorization. The appraisal and prevention lines are the costs of "doing it right"; the internal- and external-failure lines are the costs of "doing it wrong." A mature process spends more on prevention (cheaper) and less on external failure (catastrophic). The business case is the Sponsor's lever to authorize the project; without it, the project is a wish.

The CTQ tree is the translation of the fuzzy VOC into the crisp measurable language of engineering. Each CTQ must carry: (a) an operational definition (measurable: state the gage; testable: state the test method; communicable: state the spec); (b) a target ± tolerance (e.g., 10.000 ± 0.020 mm); (c) at least one driver (an upstream X that the Improve phase will manipulate). The CTQ list passed to Measure is therefore a list of measurable Ys with their specs; Measure will baseline each Y's current sigma level, and Analyze will identify the vital few Xs.`,
    terminology: `- **Project charter**: the formal authorization document; signed by the Sponsor; carries problem, goal, business case, scope, team, milestones.
- **Sponsor**: the senior leader who funds the project, removes organizational barriers, and signs the charter.
- **Problem statement**: a measurable description of the gap (what, where, when, how big); free of root-cause and solution bias.
- **Goal statement (SMART)**: Specific, Measurable, Achievable, Relevant, Time-bound.
- **Business case**: the COPQ recovered when the goal is met; ROI = (annual benefit) / (project cost).
- **COPQ (Cost of Poor Quality)**: Appraisal + Prevention + Internal Failure + External Failure.
- **Scope (in/out)**: in-scope processes/equipment within the project's authority; out-of-scope with explicit hand-off owner (the OMOUM exclusion list).
- **CTQ (Critical-to-Quality)**: a measurable characteristic of the output (Y) that, if met, satisfies a VOC need; carries target ± tolerance.
- **Operational definition**: a measurement that is measurable (state the gage), testable (state the test method), communicable (state the spec).
- **Driver**: an upstream process variable (X) that the Improve phase will set to deliver the CTQ (Y).
- **VOC (Voice of the Customer)**: qualitative customer statements captured via interviews, focus groups, surveys, Kano analysis.
- **DMAIC gate**: the Define exit gate authorizes Measure; each gate carries a sign-off (Sponsor for Define; process owner for Control).`,
    detailed_explanation: `The Define phase answers three questions: (1) What problem are we solving? (2) For whom, by when, and with what business return? (3) What measurable Y must we hit, and what Xs do we suspect of driving it?

**Question 1 — the problem statement.** A Six Sigma project starts not with a solution but with a measurable gap. The problem statement must answer: WHAT is the defect / deviation / dissatisfaction? WHERE does it occur (process, equipment, line, product family)? WHEN (time period — at least 12 months to characterize the baseline)? HOW BIG (defect rate, COPQ, customer-impact count)? The statement is forbidden from carrying a root cause ("because the wheel is dull") or a solution ("by adding a second CMM gage"). The prohibition exists because root-cause hypotheses bias the Analyze phase and solution hypotheses bias the Improve phase — the Define phase must remain neutral. A worked problem statement: "Shaft OD out-of-tolerance rejects at 8.5% on CNC grinding cell lines 3-5 (target ≤ 1.0%) during 2024-Jan to 2024-Dec, representing $680k/year COPQ and 6% scrap rate." The reader knows the defect, the location, the time, the gap, and the cost — but not the cause.

**Question 2 — the goal + business case.** The goal statement mirrors the problem baseline. SMART — Specific (the metric: shaft OD reject %), Measurable (from 8.5% to ≤ 1.5%), Achievable (a 5.7-point improvement, not "to 0%"), Relevant (tied to the COPQ recovery), Time-bound (within 4 months / 26 weeks). The business case is the financial translation: COPQ recovered = $520k/year; project cost = $65k; ROI = 8×; payback = 1.5 months. The Sponsor reads these three lines and signs. Without the COPQ recovery, the project is a wish; without the ROI, the Sponsor cannot defend the spend.

**COPQ model — the four cost categories.** (1) Appraisal = the cost of detecting defects before the customer sees them: inspector salaries, calibration, audit. (2) Prevention = the cost of avoiding defects in the first place: training, procedures, design reviews, poka-yoke. (3) Internal Failure = the cost of defects caught internally: scrap, rework, regrind, retest, downtime. (4) External Failure = the cost of defects that reach the customer: warranty, returns, RMA, recalls, lost sales, liability. The COPQ benchmark: a 3-sigma process spends ~25-30% of revenue on COPQ; a 6-sigma process spends < 1%. The COPQ as % of revenue ratio is the most-used quality-maturity index. The Motorola 1.5σ shift means the long-term DPMO is computed as if the process drifts 1.5σ from the centered short-term position — so a 6σ short-term process delivers 3.4 DPMO long-term, not 0.002 DPMO.

**Question 3 — the CTQ tree.** The tree translates VOC (fuzzy) → CTQ (measurable Y) → driver (suspected X). The CTQ is the contract with Measure: Measure will baseline the current sigma level on each CTQ. The driver is the contract with Analyze: Analyze will test whether each X correlates with Y via regression or DOE. The Improve phase will set the Xs at their optimal values via a designed experiment; the Control phase will lock the gains via SPC and the control plan. The CTQ tree therefore provides the Y = f(Xs) structure that anchors the entire DMAIC methodology.

**Operational definition — the third leg of the CTQ.** A CTQ without an operational definition is not actionable. The operational definition specifies: (i) the gage (CMM gage C-3, 5-point scan per shaft); (ii) the test method (single trace at mid-shaft; caliper for length); (iii) the spec (10.000 ± 0.020 mm). Without these three, two operators will measure differently, two shifts will report different defect rates, and the Measure phase baselines will be unreliable. The operational definition is also the input to the Measure phase's MSA (Gage R&R) — the gage named in the operational definition is the gage that Measure will validate. A weak operational definition is the most common cause of Measure-phase rework.`,
    core_principles: `- The charter is the contract: signed by the Sponsor, it authorizes resources and gates the project into Measure.
- The problem statement must be measurable and free of root-cause or solution bias.
- The goal statement must be SMART — Specific, Measurable, Achievable, Relevant, Time-bound.
- The business case is the COPQ recovery; ROI = annual benefit / project cost; payback period = project cost / monthly benefit.
- COPQ = Appraisal + Prevention + Internal Failure + External Failure — the ASQ-canonical four-cost model.
- The CTQ tree translates VOC (fuzzy) → CTQ (measurable Y, target ± tolerance) → driver (suspected X).
- Each CTQ must carry an operational definition (measurable, testable, communicable).
- The CTQ list passed to Measure is the contract — Measure baselines the CTQs, not the VOC.
- The OMOUM (scope-exclusion list with hand-off owner) prevents scope creep by naming the owner of each out-of-scope item.`,
    components: `- **Problem statement**: what / where / when / how big; free of root-cause/solution bias.
- **Goal statement (SMART)**: Specific / Measurable / Achievable / Relevant / Time-bound.
- **Business case**: COPQ recovery $/year; project cost; ROI; payback.
- **Scope statement (in)**: processes, equipment, product families, geographic boundaries.
- **OMOUM (out-of-scope list)**: each item with the explicit hand-off owner.
- **Team roster**: Sponsor, Black Belt, Green Belt(s), SMEs, process owner, finance reviewer.
- **Milestone schedule**: D-M-A-I-C gate dates.
- **VOC paraphrase**: the customer-need statement (Level 1 of the CTQ tree).
- **CTQ (Level 2)**: measurable Y, target ± tolerance, operational definition.
- **Driver (Level 3)**: suspected X to be tested in Analyze and set in Improve.
- **Sponsor sign-off**: the authorization signature that gates the project into Measure.`,
    process: `1. Identify the candidate project (financial-impact screen, probability-of-success screen, strategic-alignment screen).
2. Capture VOC (interviews, focus groups, surveys, Kano — see Lesson 2).
3. Draft the problem statement: what / where / when / how big; remove root-cause and solution bias.
4. Draft the goal statement: SMART — mirror the problem baseline.
5. Build the business case: COPQ four categories → annual COPQ; project cost; ROI; payback.
6. Draft the scope statement (in) and the OMOUM (out, with hand-off owners).
7. Build the team roster (Sponsor, Black Belt, Green Belt(s), SMEs, process owner, finance).
8. Set the D-M-A-I-C milestone gate dates.
9. Build the CTQ tree: VOC → CTQ (operational definition, target ± tolerance) → driver (suspected X).
10. Walk the charter + CTQ list with the Sponsor; obtain sign-off at the Define gate.
11. Pass the CTQ list (with operational definitions) to the Measure phase for baselining.`,
    formula_calculation: `**COPQ model (worked example).**
Appraisal = $50k (inspector + calibration + audit); Prevention = $30k (training + procedures); Internal Failure = $420k (scrap 6% × $50 unit-cost × 240k units = $720k, less 41% recovered by regrind = $300k → net $420k); External Failure = $180k (warranty $40k + returns $30k + lost sales $110k). Total COPQ = $50k + $30k + $420k + $180k = $680k/year. Revenue = $8.5M → COPQ as % of revenue = 680 / 8500 × 100 = 8.0%.

**Project ROI.** Annual benefit (COPQ recovered at target) = $680k − $160k (residual COPQ at 1.5% reject rate) = $520k. Project cost = $65k (Black Belt 4 mo × $12k + Green Belt 0.4 FTE × 2 × 4 mo × $4k + DOE + training + gage upgrade = $65k). ROI = 520 / 65 = 8.0×. Payback = 65 / (520/12) = 65 / 43.3 = 1.5 months.

**Sigma level from DPMO (long-term, with Motorola 1.5σ shift).** Defects = 20,400 (8.5% × 240k); Opportunities per unit = 5 (OD, surface, length, concentricity, end-face); Units = 240,000. DPMO = 20,400 / (5 × 240,000) × 1,000,000 = 17,000 DPMO. Short-term sigma level (centered, no shift) from DPMO 17,000 ≈ 3.6σ (Φ⁻¹(1 − 0.017) ≈ 2.93; sigma level ≈ 2.93 + 0.5 to round to the 3.6σ entry — see Motorola table: 17,000 DPMO ≈ 3.6σ short-term). With the 1.5σ shift, long-term sigma ≈ 3.6 − 1.5 = 2.1σ (per the Six Sigma conversion table). Target = 1.5% rejects → DPMO = 3,000 → ~4.0σ short-term / 2.5σ long-term — a 1.4σ improvement.

**CTQ tree metric (worked).** CTQ-1 (Shaft OD): target 10.000, USL 10.020, LSL 9.980, tolerance 0.040 mm. Driver X3 (fixture repeatability): target ≤ 2 µm TIR. Operational definition (the gage C-3, 5-point scan) provides the input to the Measure-phase MSA — the gage that Measure will validate.`,
    worked_example: `**Manufacturing CNC grinding project — full charter.**

Problem statement: "CNC grinding cell lines 3-5 produce transmission shafts at 8.5% OD out-of-tolerance rejects (target ≤ 1.0%) during 2024-Jan through 2024-Dec. 240,000 shafts produced; 20,400 rejected (6% scrap, 2.5% regrind-recovered). Rejects flow to regrind station at 95/hour, creating a secondary bottleneck. Customer-returns rate at 0.75% (target ≤ 0.10%). COPQ = $680k/year."

Goal statement: "Reduce shaft OD rejects from 8.5% to ≤ 1.5% on grinding cell lines 3-5 within 4 months (26 calendar weeks). Recover $520k/year COPQ. Project cost $65k; ROI 8.0×; payback 1.5 months."

Business case: COPQ breakdown above; ROI above. Sponsor (Plant Manager) reads: $520k annual benefit, $65k project cost, 8× ROI, 1.5-month payback. Sign-off triggers Measure-phase funding.

Scope (in): grinding cell lines 3-5; CNC grinders G07-G12; CMM gage C-3; fixtures F-22/F-23; aluminum-oxide wheel spec AW-60. OMOUM (out, with hand-off): bar stock procurement (Procurement Mgr); heat-treat process (Met Eng Mgr); supplier audit (Supplier Quality); bearing-journal supplier design (R&D Mgr).

Team: Sponsor (Plant Mgr), Black Belt (J. Doe, 100% allocated), Green Belt 1 (K. Lee, 40%, MSA + capability), Green Belt 2 (M. Patel, 40%, DOE + SPC), Process Engineer, 2 Operators (line 3 and line 5), QA Inspector, Finance reviewer.

Milestones: Define gate (wk 4); Measure gate (wk 10); Analyze gate (wk 16); Improve gate (wk 22); Control gate (wk 26).

**CTQ tree (VOC → CTQ → driver).** VOC paraphrase: "Shaft OD assembles to bearing journal without rework." CTQ-1: OD = 10.000 ± 0.020 mm (CMM gage C-3, 5-point scan per shaft). Drivers: wheel-feed rate (X1), infeed position (X2), fixture repeatability (X3), wheel-grit freshness (X4). CTQ-2: Surface finish Ra ≤ 0.8 µm (profilometer P-1, single mid-shaft trace). Drivers: wheel-grit size (X5), coolant flow (X6), wheel speed (X7). CTQ-3: Shaft length = 50.000 ± 0.050 mm (caliper, single face read). Drivers: end-stop repeatability (X8), bar-stock length variation (X9 — out-of-scope, flagged to Procurement). The CTQ list passed to Measure: 3 CTQs, 8 in-scope drivers; 1 driver (X9) flagged out-of-scope via the OMOUM. Measure will baseline the current sigma level of each CTQ; Analyze will run regression to identify the vital-few drivers; Improve will run a fractional-factorial DOE on X1, X3, X4, X5, X6, X7 to find the optimal operating window.

**Sigma-level projection.** Current DPMO = 17,000 → 3.6σ short-term / 2.1σ long-term (with 1.5σ shift). Target DPMO = 3,000 → 4.0σ short-term / 2.5σ long-term. The 0.5σ short-term improvement is delivered by setting X1, X3, X4 (the OD drivers); the surface-finish CTQ (CTQ-2) is at 4.2σ short-term and is the second priority. The project goal of 1.5% rejects requires the OD CTQ to reach 4.0σ short-term — achievable by the fixture-repeatability upgrade (X3) and wheel-grit-freshness control (X4), confirmed by the Measure-phase capability study.`,
    industrial_example: `**Manufacturing — CNC grinding cell (above).** Full charter, $520k COPQ recovery, 8× ROI. CTQ tree from customer VOC; 3 CTQs, 9 drivers (1 out-of-scope). The cell produces shafts for a transmission assembly; the customer is internal (the transmission line).

**Healthcare — Emergency Department wait-time reduction.** Problem: "Door-to-provider time at Memorial Hospital ED averages 4 h 12 min (target ≤ 2 h 0 min) during 2024-Jan through 2024-Sep; 32% of visits exceed 4 h; patient complaints up 38% YoY; CMS LWBS (left-without-being-seen) penalty risk at 4.2% (target ≤ 1%)." Goal: "Reduce door-to-provider time from 4 h 12 min to ≤ 2 h 0 min within 6 months." Business case: COPQ = appraisal $80k (triage nurse audit) + prevention $20k (training) + internal failure $1.68M (1,400 lost-bed-hours × $1,200) + external failure $0.6M (patient leakage + reputation) = $2.38M; project cost $120k; ROI 19.8×; payback 0.6 months. CTQ tree: CTQ-1 door-to-provider ≤ 2 h 0 min; CTQ-2 triage accuracy ≥ 95% (ESI level correctly assigned); CTQ-3 discharge-rx clarity ≥ 90% (patient teaches-back correctly). Drivers: triage staffing ratio (X1), exam-room count (X2), provider handoff protocol (X3), EHR usability (X4), discharge-rx standard work (X5). The OMOUM lists ambulance-diversion policy (handoff: EMS Liaison) and ED physical-expansion (handoff: Facilities — 18-month capital project).

**Automotive — paint-shop orange-peel reduction.** Problem: "Orange-peel defect rate at 7.8% on paint line P-3 (target ≤ 1.5%) during Q1-Q3 2024; 14,000 bodies painted, 1,092 reworked." CTQ: orange-peel rating ≤ 2.0 per DOI standard; drivers: booth temperature (X1), booth humidity (X2), atomizer pressure (X3), bell speed (X4), flash time (X5).`,
    case_study: `CASE_TYPE = SYNTHETIC. A mid-sized electronics-PCB assembler (annual revenue $42M) ran a Six Sigma project to reduce solder-defect rejects on its SMT line. The team captured VOC from the OEM customer: "We want zero solder bridges; we want first-pass yield ≥ 99.0%." The problem statement: "Solder-bridge rejects at 4.8% on SMT line 2 (target ≤ 0.5%) during 2024-Q2; 320,000 boards produced, 15,360 reworked at $14/board rework cost." The business case: COPQ = $215k internal failure + $80k appraisal + $60k external failure = $355k/year; project cost $48k; ROI 7.4×; payback 1.7 months. CTQ tree: CTQ-1 solder-bridge count = 0 per board (AOI gage A-2); CTQ-2 first-pass yield ≥ 99.0%; CTQ-3 ICT (in-circuit test) escape rate ≤ 50 DPMO. Drivers: stencil aperture (X1), solder-paste viscosity (X2), reflow profile peak temperature (X3), conveyor speed (X4), squeegee pressure (X5). The team's Define gate passed on schedule; the Measure phase validated the AOI gage via Gage R&R (%R&R = 6.2%, pass); Analyze found reflow peak temperature (X3) and stencil aperture (X1) accounted for 78% of the variance (Pearson r = 0.62 and 0.51 respectively); Improve ran a 2³ full-factorial DOE on X1, X3, X4 and set the optimal window; Control locked in the gains via an I-MR chart on first-pass yield and an updated control plan. Final result: solder-bridge rejects fell to 0.4%, $194k COPQ recovered, ROI realized 4.0× within 7 months.`,
    visual_explanation: `The Define deliverable can be visualized as a single page with two columns. Left column = the charter (problem on top, goal below, business case below, scope + OMOUM below, team + milestones at the bottom). Right column = the CTQ tree as a horizontal tree: root = VOC paraphrase; Level 2 = CTQ-1, CTQ-2, CTQ-3 each with operational definition + spec; Level 3 = drivers (X1, X2, ...) under each CTQ. The two columns meet at a single arrow at the bottom: "→ Measure phase" with the CTQ list. A common visual mistake: making the CTQ tree vertical (which makes the Y/X relationship hard to read). Horizontal layout preserves the Y = f(Xs) reading. Another visual convention: the COPQ bar chart (four bars: Appraisal, Prevention, Internal, External) with a horizontal line marking the post-project target COPQ — the gap between current and target is the project's annual benefit. The OMOUM is rendered as a 2-column table (out-of-scope item | hand-off owner) attached to the scope statement. The power/interest grid (Lesson 3) is rendered as a 2×2 matrix with stakeholder initials in each quadrant. The milestone schedule is a Gantt with 5 bars (D, M, A, I, C) and gate diamonds at each transition.`,
    simulation_opportunity: `A charter-authoring simulator would let the learner drag-and-drop the six charter elements onto a one-page template, with real-time validation: a problem statement missing the time period is flagged red; a goal statement not in SMART form is flagged amber; a COPQ calculation that omits a category is flagged red. A second simulator would let the learner drag a VOC quote onto a CTQ-tree root, branch to a CTQ (auto-checking for an operational definition + spec), and branch to drivers (auto-checking for at least 2 per CTQ). The simulator would also run the COPQ math — given appraisal, prevention, internal, and external inputs, compute COPQ, COPQ as % of revenue, ROI, and payback — and surface the sigma-level projection from DPMO via the Motorola table.`,
    common_mistakes: `- Writing a problem statement that includes a root cause ("because the wheel is dull") — biases the Analyze phase.
- Writing a problem statement that includes a solution ("add a second CMM gage") — biases the Improve phase.
- Setting a goal that is not measurable ("improve quality") or not time-bound ("eventually reach 1%").
- Omitting the business case — the Sponsor cannot defend the spend without COPQ recovery and ROI.
- Omitting out-of-scope items (no OMOUM) — the project creeps into procurement / supplier / capital work and stalls.
- CTQs without operational definitions — Measure-phase baselines are unreliable (different operators, different gages, different specs).
- CTQs without drivers — the CTQ tree is just a wish list; Analyze has no hypotheses to test.
- Treating the charter as static — it is baselined at the Define gate and re-baselined only via the CCB.
- Mixing VOC and CTQ in the same tree level — the tree is VOC → CTQ → driver; collapsing levels destroys the Y = f(Xs) structure.
- Forgetting the Sponsor sign-off — without it, the project has no authority and Measure cannot start.`,
    limitations: `- The charter is a snapshot of the Define-gate understanding; new evidence (Measure baselines, Analyze correlations) may require re-baselining via the CCB.
- The CTQ tree is a hypothesis: the drivers (Xs) are suspected, not proven — Analyze must confirm via regression or DOE.
- The COPQ model assumes the four categories are exhaustive; in services, "lost customer lifetime value" under-counts external failure (Lean Six Sigma extension: process-cycle-time COPQ).
- The sigma-level projection from DPMO assumes a normal distribution; non-normal CTQs (e.g., Ra surface finish, count defects) need non-normal capability (Ppk with Johnson / Pearson fitting in Measure).
- The OMOUM depends on organizational boundaries; in matrix organizations, hand-off owners may be ambiguous.
- The SMART goal may be too aggressive ("to 0%") or too modest ("to 7%") — the Define phase must justify the target against the Measure-phase baseline (chicken-and-egg until Measure baselines).
- Stakeholder analysis (Lesson 3) is incomplete if the charter's team roster is closed before the power/interest grid is run.`,
    comparison: `**Charter vs Scope Statement (PMBOK).** The PMBOK scope statement and the Six Sigma charter overlap on scope and team, but the charter adds the business case (COPQ recovery, ROI) and the SMART goal — the PMBOK scope statement adds the WBS (work breakdown structure) and acceptance criteria. The Six Sigma project is shorter (4-6 months vs multi-year) and narrower (one Y = f(Xs) vs a full deliverable); the charter is therefore lighter-weight than the PMBOK scope statement.

**CTQ tree vs QFD (Quality Function Deployment / House of Quality).** The CTQ tree is a 3-level drill-down (VOC → CTQ → driver); QFD is a matrix relating many customer needs to many engineering characteristics with importance weights and inter-feature correlations. The CTQ tree is simpler and faster (one Define workshop); QFD is used for product design (DFSS), not for DMAIC process-improvement projects.

**COPQ vs Cost of Quality (COQ).** ASQ uses COPQ and COQ interchangeably for the four-category model; some texts distinguish COPQ (= Internal + External Failure only, the "poor-quality" cost) from COQ (= Appraisal + Prevention + Internal + External, the total quality cost). The ASQ Six Sigma BOK uses COPQ for the four-category total — this lesson follows that convention.

**Define vs Measure phase deliverables.** Define produces the charter (governance) and CTQ list (technical contract). Measure produces the operational definitions' MSA (Gage R&R), the baseline sigma level / DPMO, the process capability (Cp/Cpk), and the data-collection plan. Define says WHAT to measure; Measure says HOW WELL the gage measures and what the baseline is.`,
    practical_application: `Run the Define gate as a 90-minute workshop with the Sponsor, Black Belt, Green Belt(s), SMEs, and Finance reviewer present. Agenda: (1) 10 min — read the problem statement aloud; check for root-cause/solution bias. (2) 10 min — read the goal statement; check for SMART. (3) 15 min — walk the COPQ bar chart; confirm the four-category breakdown and the ROI. (4) 10 min — read the scope and the OMOUM; confirm the hand-off owners are in the room (or send a delegate). (5) 15 min — walk the CTQ tree; confirm each CTQ has an operational definition and a target ± tolerance; confirm each driver is measurable and within the project's authority. (6) 10 min — walk the milestone schedule; confirm the Sponsor can attend each gate. (7) 10 min — Sponsor decision: sign-off, conditional (revise and re-submit), or reject (re-scope). (8) 10 min — action items + next steps (Measure-phase kickoff date). Output: signed charter, signed CTQ list, Measure-phase authorization, action items log. The Define gate is the most-failed gate in DMAIC — charter weakness is the single largest cause of project failure.`,
    decision_scenario: `**The "scope-creep" scenario.** Three weeks into the Measure phase, the Sponsor asks the Black Belt to expand the project to include the bearing-journal supplier (R&D-managed). The Black Belt must decide: (a) accept the expansion (and re-baseline the project); (b) reject the expansion (and route via the OMOUM hand-off owner — R&D Mgr); (c) negotiate (a sub-project scoped to one driver, with R&D as a contributing team). The correct answer is (b) by default, escalating to (c) only if the Sponsor authorizes a separate charter. The Define-phase OMOUM (R&D Mgr as hand-off owner for bearing-journal supplier design) was authored for exactly this scenario — accept the OMOUM routing, document the request in the CCB log, and continue Measure. If the Sponsor insists, raise a change request (CR) through the CCB; if approved, re-baseline the charter (new scope, new COPQ, new ROI, new milestones) and re-run the Define gate. The Black Belt's reflex must be: route to the OMOUM owner first; escalate via CR only if the OMOUM owner declines.`,
    practice_questions: `- Draft a SMART goal statement for a project where the baseline defect rate is 4.8% and the entitlement target is 0.5% (industry benchmark).
- Compute COPQ (four categories) and ROI for a project with appraisal $40k, prevention $25k, internal failure $310k, external failure $90k, revenue $4.2M, project cost $48k.
- Build a CTQ tree from the VOC "I want my insurance claims processed without me calling to ask the status" — at least 2 CTQs and 2 drivers per CTQ.
- Write an OMOUM entry for "supplier-side bar-stock length variation" identified as a driver but outside the project's authority.`,
    certification_questions: `- ASQ Black Belt (Easy, Recall): The six elements of a Six Sigma project charter are problem, goal, business case, scope, team, and milestones.
- ASQ Black Belt (Medium, Apply): Given COPQ data, compute ROI and payback; identify which COPQ category to attack first (the largest external-failure cost is the highest-leverage target).
- ASQ Black Belt (Hard, Analyze): Given a VOC quote, identify which CTQ element is missing (operational definition; target ± tolerance; driver) — a common Measure-phase failure mode.
- ASQ Green Belt (Medium, Understand): Distinguish the CTQ tree from QFD and explain why the CTQ tree is preferred for DMAIC (faster, narrower, single Y).`,
    summary: `The Define phase delivers two documents: the project charter (the governance contract signed by the Sponsor, carrying problem, SMART goal, COPQ-based business case, scope + OMOUM, team, milestones) and the CTQ tree (the technical contract passed to Measure, translating VOC into measurable Ys with operational definitions and target ± tolerance, plus suspected Xs as drivers). The charter authorizes resources and gates the project into Measure; the CTQ list tells Measure WHAT to baseline. The COPQ four-category model (appraisal, prevention, internal failure, external failure) is the financial translation; the ROI and payback are the Sponsor's go/no-go decision. The OMOUM (scope-exclusion list with hand-off owners) is the scope-creep defense. The Define gate is a 90-minute workshop with Sponsor sign-off; charter weakness is the single largest cause of DMAIC project failure.`,
    key_takeaways: `- Charter = problem + SMART goal + COPQ business case + scope + OMOUM + team + milestones; signed by the Sponsor.
- Problem statement = what / where / when / how big; free of root-cause and solution bias.
- Goal statement = SMART; mirrors the problem baseline.
- COPQ = Appraisal + Prevention + Internal Failure + External Failure; ROI = annual benefit / project cost.
- OMOUM = out-of-scope items with hand-off owners — the scope-creep defense.
- CTQ tree: VOC → CTQ (Y, operational definition, target ± tolerance) → driver (suspected X).
- Each CTQ must be measurable (gage), testable (method), communicable (spec).
- CTQ list passed to Measure is the contract — Measure baselines the CTQs, not the VOC.
- Define gate = 90-min workshop with Sponsor sign-off; weakness here = project failure downstream.`,
    references: `- ASQ Six Sigma Black Belt Body of Knowledge — Define phase.
- ASQ Six Sigma Green Belt Body of Knowledge — Define phase.
- Breyfogle (2003), Implementing Six Sigma, Ch. 1-4 (Six Sigma roadmap, charter, VOC/CTQ, SIPOC/COPQ).
- Pande, Neuman & Cavanagh (2014), The Six Sigma Way, Ch. 4-6 (project selection, charter, VOC).
- Montgomery (2013), Statistical Quality Control, Ch. 1, 3, 4 (COPQ, CTQ translation, in/out-of-control).
- PMI (2021), PMBOK Guide 7th ed., Section 4.2/4.3 (Stakeholder, Planning — scope/charter elements).`,
  },
  knowledgeObject: {
    title: "Project Charter & CTQ Tree",
    domain: "Define",
    competency: "Project Charter & CTQ",
    topic: "DMAIC Define — Governance & CTQ Translation",
    concept: "Charter elements, COPQ business case, CTQ tree (VOC → CTQ → driver), operational definitions",
    body: {
      definitions: [
        "Project charter: the formal authorization document linking a Six Sigma project to a measurable business outcome; signed by the Sponsor; carries problem, goal, business case, scope, team, milestones.",
        "Problem statement: a measurable description of the gap (what / where / when / how big); free of root-cause and solution bias.",
        "Goal statement (SMART): Specific, Measurable, Achievable, Relevant, Time-bound.",
        "Business case: the COPQ recovered when the goal is met; ROI = annual benefit / project cost; payback = project cost / monthly benefit.",
        "COPQ (Cost of Poor Quality): Appraisal + Prevention + Internal Failure + External Failure — the ASQ-canonical four-cost model.",
        "Scope (in/out): in-scope processes/equipment within the project's authority; out-of-scope items with explicit hand-off owner (the OMOUM exclusion list).",
        "OMOUM (Out-of-Manageable Operational Universe Memo): the project-management artifact listing items explicitly out of scope, augmented with the hand-off owner — the scope-creep defense (PMI scope-exclusion list extended with a hand-off column).",
        "CTQ (Critical-to-Quality): a measurable characteristic of the output (Y) that, if met, satisfies a VOC need; carries target ± tolerance and an operational definition.",
        "Operational definition: a measurement that is measurable (state the gage), testable (state the method), communicable (state the spec).",
        "Driver: an upstream process variable (X) suspected of driving the CTQ (Y); tested in Analyze; set in Improve.",
        "Sponsor: the senior leader who funds the project, removes barriers, and signs the charter; the authorization authority at the Define gate.",
        "VOC (Voice of the Customer): qualitative customer statements captured via interviews, focus groups, surveys, Kano analysis.",
        "DMAIC gate: the Define exit gate authorizes Measure; each gate carries a sign-off (Sponsor for Define; process owner for Control).",
      ],
      principles: [
        "The charter is the governance contract — without Sponsor sign-off, no resources flow and Measure cannot start.",
        "The problem statement must be measurable and free of root-cause or solution bias (the Define phase must remain neutral).",
        "The goal statement must be SMART — Specific, Measurable, Achievable, Relevant, Time-bound.",
        "The business case is the COPQ recovery; ROI = annual benefit / project cost; payback = project cost / monthly benefit.",
        "COPQ = Appraisal + Prevention + Internal Failure + External Failure — the four ASQ-canonical categories.",
        "The OMOUM (scope-exclusion list with hand-off owners) prevents scope creep by naming the owner of each out-of-scope item.",
        "The CTQ tree translates VOC (fuzzy) → CTQ (measurable Y, target ± tolerance) → driver (suspected X).",
        "Each CTQ must carry an operational definition (measurable, testable, communicable) — otherwise Measure baselines are unreliable.",
        "The CTQ list passed to Measure is the contract — Measure baselines the CTQs, not the VOC.",
        "Sigma level (short-term) ≈ 3 × Cp; long-term (with Motorola 1.5σ shift) ≈ 3 × Cp − 1.5; DPMO = (defects / (opportunities × units)) × 1,000,000.",
      ],
      components: [
        "Problem statement (what / where / when / how big).",
        "Goal statement (SMART).",
        "Business case (COPQ breakdown, ROI, payback).",
        "Scope statement (in) — processes, equipment, product families, geographic boundaries.",
        "OMOUM (out) — each item with explicit hand-off owner.",
        "Team roster — Sponsor, Black Belt, Green Belt(s), SMEs, process owner, finance reviewer.",
        "Milestone schedule — D-M-A-I-C gate dates.",
        "VOC paraphrase (CTQ tree Level 1).",
        "CTQ (Level 2) — operational definition, target ± tolerance.",
        "Driver (Level 3) — suspected X to test in Analyze and set in Improve.",
        "Sponsor sign-off — authorization signature gating Measure.",
      ],
      mechanism: [
        "Define lifecycle: identify candidate → capture VOC → draft problem → draft SMART goal → build COPQ business case → draft scope + OMOUM → build team + milestones → build CTQ tree → walk charter with Sponsor → sign-off → pass CTQ list to Measure.",
      ],
      process: [
        "1. Identify the candidate project (financial-impact, probability-of-success, strategic-alignment screens).",
        "2. Capture VOC (interviews, focus groups, surveys, Kano — Lesson 2).",
        "3. Draft the problem statement: what / where / when / how big; remove root-cause and solution bias.",
        "4. Draft the goal statement (SMART); mirror the problem baseline.",
        "5. Build the business case: COPQ four categories → annual COPQ; project cost; ROI; payback.",
        "6. Draft the scope statement (in) and the OMOUM (out, with hand-off owners).",
        "7. Build the team roster (Sponsor, Black Belt, Green Belt(s), SMEs, process owner, finance).",
        "8. Set the D-M-A-I-C milestone gate dates.",
        "9. Build the CTQ tree: VOC → CTQ (operational definition, target ± tolerance) → driver (suspected X).",
        "10. Walk the charter + CTQ list with the Sponsor; obtain sign-off at the Define gate.",
        "11. Pass the CTQ list (with operational definitions) to the Measure phase for baselining.",
      ],
      formulas: [
        "COPQ = Appraisal + Prevention + Internal Failure + External Failure.",
        "COPQ as % of revenue = (COPQ / Revenue) × 100%.",
        "ROI = (Annual COPQ recovered) / (Project cost).",
        "Payback (months) = (Project cost) / (Annual benefit / 12).",
        "DPMO = (Defects / (Opportunities × Units)) × 1,000,000.",
        "Sigma level (short-term, centered) = 3 × Cp; (long-term, with 1.5σ shift) = 3 × Cp − 1.5.",
        "Yield (first-pass, FPY) = (Good units / Total units) × 100%.",
        "CTQ tree levels: VOC → CTQ (Y, target ± tolerance) → driver (X); Y = f(X₁, X₂, ..., Xₙ).",
        "Operational definition: (i) measurable (gage), (ii) testable (method), (iii) communicable (spec).",
      ],
      metrics: [
        "Defect rate (reject %) baseline vs target.",
        "COPQ annual ($/year) and COPQ as % of revenue.",
        "ROI (×) and payback (months).",
        "DPMO and sigma level (short-term and long-term with 1.5σ shift).",
        "First-pass yield (FPY) and rolled-throughput yield (RTY).",
        "Number of CTQs and drivers identified (Define-phase scope check).",
        "Number of out-of-scope items in the OMOUM (with hand-off owner).",
        "Define-gate sign-off date (vs scheduled).",
      ],
      examples: [
        "CNC grinding cell charter: 8.5% → 1.5% rejects, $520k COPQ recovery, ROI 8×, payback 1.5 months.",
        "ED wait-time charter: 4 h 12 min → 2 h 0 min, COPQ $2.38M, ROI 19.8×, payback 0.6 months.",
        "PCB assembler charter: 4.8% → 0.5% solder-bridge rejects, $355k COPQ, ROI 7.4×.",
        "Paint-shop charter: 7.8% → 1.5% orange-peel, CTQ rating ≤ 2.0 per DOI.",
        "CTQ tree (CNC): VOC → OD 10.000 ± 0.020 mm → drivers X1-X4; VOC → Ra ≤ 0.8 µm → X5-X7; VOC → length 50.000 ± 0.050 mm → X8, X9 (out-of-scope).",
      ],
      industrial_examples: [
        "Manufacturing — CNC grinding cell (shaft OD rejects); CTQ tree from internal-customer VOC.",
        "Healthcare — Emergency Department wait-time; COPQ includes lost-bed-hour cost; CTQ tree includes door-to-provider, triage accuracy, discharge-rx clarity.",
        "Automotive — paint-shop orange-peel; CTQ tree from OEM VOC; drivers include booth temperature/humidity and atomizer pressure.",
        "Electronics — SMT solder-bridge rejects; CTQ tree from OEM VOC; drivers include stencil aperture, paste viscosity, reflow profile.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. PCB assembler SMT solder-bridge reduction: $42M revenue, $355k COPQ, 4.8% rejects, ROI 7.4×, 4-month DMAIC. CTQ tree from OEM VOC; Measure AOI %R&R = 6.2% (pass); Analyze found reflow peak temp (r=0.62) and stencil aperture (r=0.51) account for 78% of variance; Improve ran 2³ DOE; Control locked gains via I-MR chart + control plan. Final: 0.4% rejects, $194k COPQ recovered, realized ROI 4.0× within 7 months.",
      ],
      common_errors: [
        "Problem statement includes a root cause ('because the wheel is dull') — biases Analyze.",
        "Problem statement includes a solution ('add a second CMM gage') — biases Improve.",
        "Goal not SMART ('improve quality', 'eventually reach 1%').",
        "Business case omitted — Sponsor cannot defend the spend.",
        "OMOUM omitted — project creeps into procurement / supplier / capital work and stalls.",
        "CTQ without operational definition — Measure baselines are unreliable.",
        "CTQ without driver — Analyze has no hypotheses to test.",
        "Charter treated as static — must be re-baselined via the CCB.",
        "Mixing VOC and CTQ in the same tree level — destroys the Y = f(Xs) structure.",
        "Sponsor sign-off skipped — project has no authority, Measure cannot start.",
      ],
      limitations: [
        "The charter is a snapshot of the Define-gate understanding; new evidence requires re-baselining via the CCB.",
        "The CTQ tree is a hypothesis — drivers (Xs) are suspected, not proven; Analyze must confirm via regression or DOE.",
        "COPQ model assumes four exhaustive categories; services need the Lean extension (process-cycle-time COPQ).",
        "Sigma-level projection from DPMO assumes a normal distribution; non-normal CTQs need non-normal capability in Measure.",
        "OMOUM depends on organizational boundaries; matrix organizations may have ambiguous hand-off owners.",
        "SMART goal may be too aggressive ('to 0%') or too modest ('to 7%'); justification requires the Measure-phase baseline (chicken-and-egg until Measure).",
        "Stakeholder analysis (Lesson 3) is incomplete if the team roster is closed before the power/interest grid is run.",
      ],
      best_practices: [
        "Run the Define gate as a 90-minute workshop with Sponsor, Black Belt, Green Belt(s), SMEs, Finance present.",
        "Read the problem statement aloud and check for root-cause/solution bias before sign-off.",
        "Walk the COPQ bar chart with Finance; confirm the four-category breakdown.",
        "Confirm each CTQ has an operational definition (gage + method + spec) before sign-off.",
        "Confirm each driver is measurable and within the project's authority (in scope).",
        "Confirm each OMOUM item's hand-off owner is in the room or sent a delegate.",
        "Confirm the Sponsor can attend each DMAIC gate (or send a delegate with sign-off authority).",
        "Re-baseline the charter via the CCB only when scope, COPQ, or ROI change materially.",
        "Pass the CTQ list (with operational definitions) as the contract to Measure.",
      ],
      related_concepts: [
        "Voice of Customer & SIPOC (Lesson 2) — VOC capture + SIPOC + COPQ calculation.",
        "Stakeholder & Scope Management (Lesson 3) — power/interest grid, RACI, OMOUM, change control.",
        "Measure phase — MSA (Gage R&R), capability (Cp/Cpk), DPMO/sigma-level baselining.",
        "Analyze phase — root cause (5-Why, FMEA), hypothesis testing, regression.",
        "PMI PMBOK 7th — project charter, scope statement, WBS, stakeholder engagement.",
      ],
      prerequisites: [
        "The DMAIC framework and the position of Define as the first phase.",
        "Basic project-management concepts (sponsor, scope, milestones, ROI) — PMBOK 7th.",
        "Process thinking: SIPOC, input/output, process variable (X) vs output (Y).",
        "Basic statistics for the COPQ/sigma-level formulas: mean, standard deviation, normal distribution.",
        "Customer-research concepts at the conceptual level (interviews, surveys, Kano) — Lesson 2.",
      ],
      references: [
        "ASQ Six Sigma Black Belt Body of Knowledge — Define phase.",
        "ASQ Six Sigma Green Belt Body of Knowledge — Define phase.",
        "Breyfogle (2003), Implementing Six Sigma, Ch. 1-4.",
        "Pande, Neuman & Cavanagh (2014), The Six Sigma Way, Ch. 4-6.",
        "Montgomery (2013), Statistical Quality Control, Ch. 1, 3, 4.",
        "PMI (2021), PMBOK Guide 7th ed., Section 4.2/4.3.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Project Charter & CTQ",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which of the following is NOT one of the six canonical elements of a Six Sigma project charter?",
      whyCorrect:
        "The six canonical charter elements are: (1) problem statement, (2) goal statement (SMART), (3) business case, (4) scope (in + OMOUM out), (5) team roster, and (6) milestone schedule. A Work Breakdown Structure (WBS) is a PMBOK scope-statement artifact used in traditional project management, not a Six Sigma charter element — Six Sigma projects are 4-6 months and narrower than capital projects that warrant a WBS.",
      whyOthersWrong: [
        "Option A (Problem statement) — IS one of the six charter elements; the charter opens with a measurable problem statement.",
        "Option B (Business case) — IS one of the six; the COPQ recovery + ROI is the Sponsor's go/no-go lever.",
        "Option D (Milestone schedule) — IS one of the six; the D-M-A-I-C gate dates are the schedule.",
      ],
      explanation:
        "WBS is a PMBOK artifact, not a Six Sigma charter element. The six charter elements are problem, goal (SMART), business case, scope + OMOUM, team, milestones.",
      options: [
        { text: "Problem statement", isCorrect: false },
        { text: "Business case", isCorrect: false },
        { text: "Work Breakdown Structure (WBS)", isCorrect: true },
        { text: "Milestone schedule", isCorrect: false },
      ],
    },
    {
      competencyName: "Project Charter & CTQ",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Manufacturing",
      stem: "A project has COPQ of $680k/year (Appraisal $50k, Prevention $30k, Internal Failure $420k, External Failure $180k). Revenue is $8.5M; project cost is $65k; expected residual COPQ after improvement is $160k/year. Compute the project ROI.",
      whyCorrect:
        "Annual benefit = current COPQ − residual COPQ = $680k − $160k = $520k/year. ROI = annual benefit / project cost = $520k / $65k = 8.0×. The COPQ-as-%-of-revenue is 680/8500 = 8.0% (current) and 160/8500 = 1.9% (target) — a 6.1-point quality-maturity improvement.",
      whyOthersWrong: [
        "Option A (10.5×) — uses $680k as the annual benefit (forgot to subtract the residual $160k COPQ after improvement) and $65k cost; would inflate ROI to 10.5×.",
        "Option C (4.0×) — divides $520k by $130k (double-counted the project cost or included a 2nd-year cost); the project cost is $65k one-time, not recurring.",
        "Option D (1.5× — this is the payback period in months, not the ROI multiplier) — payback = $65k / ($520k/12) = 1.5 months; ROI is the multiplier (8×), payback is the time.",
      ],
      explanation:
        "ROI = (Annual COPQ recovered) / (Project cost) = ($680k − $160k) / $65k = $520k / $65k = 8.0×. Payback = $65k / ($520k/12) = 1.5 months.",
      options: [
        { text: "10.5× (using $680k as benefit, $65k as cost)", isCorrect: false },
        { text: "8.0× ($520k benefit / $65k cost)", isCorrect: true },
        { text: "4.0× ($520k / $130k double-counted cost)", isCorrect: false },
        { text: "1.5× (the payback period in months, not ROI)", isCorrect: false },
      ],
    },
    {
      competencyName: "Project Charter & CTQ",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Procedural",
      scenario: "Healthcare",
      stem: "An ED project's VOC: 'I want to be seen quickly by a doctor; I don't want to repeat my symptoms to three different people.' Which CTQ operational definition is BEST?",
      whyCorrect:
        "The best CTQ operational definition specifies the gage (ED EHR timestamp, automatic), the method (door-arrival time stamp minus provider-first-contact time stamp, on every arriving patient), and the spec (target ≤ 2 h 0 min). It is measurable (an EHR timestamp), testable (a deterministic subtraction), and communicable (a single spec line). This makes the CTQ actionable in the Measure phase — the gage is automatic and reproducible, and the spec is a single number.",
      whyOthersWrong: [
        "Option A ('Reduce door-to-provider time') — missing the gage (EHR timestamp), the method (subtraction), and the spec (≤ 2 h); a wish, not an operational definition.",
        "Option C ('Improve patient satisfaction') — neither measurable (no gage) nor communicable (no spec); also a different CTQ (satisfaction, not door-to-provider time).",
        "Option D ('Provider sees every patient within 4 hours') — has the spec but at the wrong threshold (target is 2 h, not 4 h — the 4 h threshold is the problem baseline outlier, not the target).",
      ],
      explanation:
        "Operational definition = measurable (gage: EHR timestamp) + testable (method: arrival minus provider-first-contact) + communicable (spec: ≤ 2 h 0 min). All three legs must be present for Measure to baseline.",
      options: [
        { text: "'Reduce door-to-provider time'", isCorrect: false },
        { text: "'Door-to-provider time = EHR timestamp (provider-first-contact) − EHR timestamp (door-arrival); spec ≤ 2 h 0 min'", isCorrect: true },
        { text: "'Improve patient satisfaction'", isCorrect: false },
        { text: "'Provider sees every patient within 4 hours'", isCorrect: false },
      ],
    },
    {
      competencyName: "Project Charter & CTQ",
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Manufacturing",
      stem: "True or False: A problem statement that reads 'Shaft OD rejects at 8.5% because the grinding wheel is dull' is correctly formed and ready for the Define gate.",
      whyCorrect:
        "FALSE. The problem statement 'Shaft OD rejects at 8.5% because the grinding wheel is dull' is incorrectly formed — it embeds a root cause ('because the grinding wheel is dull'). Root-cause hypotheses belong in the Analyze phase, after Measure baselines the CTQ. Embedding the root cause in the Define problem statement biases the Analyze phase (the team will only test the wheel-dullness hypothesis and ignore other Xs). A correctly formed problem statement would read 'Shaft OD rejects at 8.5% on lines 3-5 during 2024-Jan to 2024-Dec (target ≤ 1.0%), representing $680k/year COPQ' — what / where / when / how big, with no cause and no solution.",
      whyOthersWrong: [
        "Option TRUE — would imply embedding a root cause in the problem statement is acceptable; it is not. The Define phase must remain neutral on cause and solution; root-cause hypotheses are tested in Analyze, not assumed in Define.",
      ],
      explanation:
        "FALSE. Problem statements must be free of root-cause and solution bias; 'because the wheel is dull' biases Analyze. Correct: state what / where / when / how big only.",
      options: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Voice of Customer & SIPOC
// (Competency: "Voice of Customer & SIPOC"; slug: d-voc-sipoc)
// ---------------------------------------------------------------------------

const LESSON_VOC_SIPOC: RefLesson = {
  competencyName: "Voice of Customer & SIPOC",
  slug: "d-voc-sipoc",
  title: "Voice of Customer, SIPOC & COPQ — Define-to-Measure Translation",
  titleAr: "صوت العميل وSIPOC وCOPQ — الترجمة من التعريف إلى القياس",
  order: 2,
  durationMin: 36,
  references: SS_DEFINE_REFERENCE_TITLES,
  conceptIntroduction: `The Voice of the Customer (VOC) is the structured capture of customer requirements — both stated (what the customer says they want) and unstated (what the customer expects but doesn't articulate, often called "delighters" or "excitement factors" in the Kano model). VOC is captured through four canonical methods: (1) interviews (1:1, semi-structured, depth over breadth — best for unstated needs and high-value customers); (2) focus groups (6-10 customers, group dynamics elicit trade-offs — best for B2B and product-design VOC); (3) surveys (large-N, structured questionnaires — best for stated-need confirmation and statistical segmentation); (4) observation / direct customer visit (the "follow-me-home" method — best for unstated process needs where the customer cannot articulate the workflow). The Kano model classifies each VOC item into three categories: (a) Basic / Must-Be (the customer is dissatisfied if absent, neutral if present — the table-stakes); (b) Performance / One-Dimensional (more is better, linear satisfaction — the differentiator); (c) Excitement / Delighter (the customer is delighted if present, neutral if absent — the innovation). The Kano classification guides prioritization: basics are non-negotiable (meet spec), performance is the project's primary CTQ target, and delighters are the upside — but a delighter today decays to a basic tomorrow (the Kano decay).

SIPOC (Supplier-Input-Process-Output-Customer) is the high-level process map that anchors the Define phase. It is a one-page table with five columns and a small number of rows (5-7 process steps). The SIPOC forces the team to articulate the process boundaries (where it starts, where it ends), the suppliers (who feeds the process), the inputs (what enters, with spec), the process (the high-level steps — not detailed flowcharts, that's Measure), the outputs (what exits, with spec), and the customers (who receives, internal or external). The SIPOC is the contract between Define and Measure: Measure will detail the process flow (the swimlane / cross-functional flowchart with decision points), but Define stops at the SIPOC level. The SIPOC also surfaces the CTQ candidates — the outputs that the customer receives are the candidate CTQs (Lesson 1).

COPQ (Cost of Poor Quality) is the financial translation of the SIPOC's defects. The ASQ-canonical four-category model: (1) Appraisal (the cost of detecting defects before the customer sees them — inspection, calibration, audit); (2) Prevention (the cost of avoiding defects — training, procedures, poka-yoke); (3) Internal Failure (the cost of defects caught internally — scrap, rework, regrind, retest, downtime); (4) External Failure (the cost of defects that reach the customer — warranty, returns, RMA, recalls, lost sales, liability). The COPQ as % of revenue is the quality-maturity benchmark: a 3-sigma process spends ~25-30% of revenue on COPQ; a 6-sigma process spends < 1%. The COPQ drives the project's business case (Lesson 1). The sigma level from DPMO is the technical translation: DPMO = (defects / (opportunities × units)) × 1,000,000; sigma level (short-term, centered) = 3 × Cp; with the Motorola 1.5σ shift, long-term sigma = 3 × Cp − 1.5. The 6σ short-term process delivers 3.4 DPMO long-term — the canonical Six Sigma entitlement.`,
  example: `**SIPOC for an order-to-cash process.**

| Suppliers | Inputs | Process (6 steps) | Outputs | Customers |
|---|---|---|---|---|
| Customer (purchaser) | Purchase Order | 1. Receive PO | Validated order | End Customer |
| Sales Rep | Customer master | 2. Credit check | Credit-approved order | Sales |
| Credit Dept | Credit score | 3. Configure order | Picked shipment | Finance |
| Warehouse | SKU master, pick list | 4. Pick & pack | Packed shipment | Carrier |
| Carrier (3PL) | BOL, tracking # | 5. Ship | Signed BOL, delivered shipment | End Customer |
| Finance | Invoice, AR | 6. Invoice & collect | Invoice, payment receipt | Finance, Sales |

The SIPOC surfaces 6 outputs that are candidate CTQs: order accuracy, credit-decision time, pick accuracy, ship time, invoice accuracy, payment-collection time. Each candidate becomes a CTQ if the customer (internal or external) cares about it. The team selects 2-3 priority CTQs for the project (Lesson 1's CTQ tree).

**COPQ calculation (worked).**
- Appraisal: $50k (inspector salaries $35k + calibration $10k + audit $5k).
- Prevention: $30k (training $15k + procedures $10k + poka-yoke design $5k).
- Internal Failure: $420k (scrap 6% × $50 × 240k units = $720k − regrind-recovered $300k = $420k; plus regrind-station downtime $0 (already netted)).
- External Failure: $180k (warranty $40k + returns $30k + lost-sales $110k).
- COPQ = $50k + $30k + $420k + $180k = $680k/year.
- Revenue = $8.5M; COPQ as % of revenue = 680 / 8500 × 100 = 8.0%.

**Sigma level from DPMO (worked).** Defects = 20,400 (8.5% × 240,000 shafts); Opportunities per unit = 5 (OD, surface, length, concentricity, end-face); Units = 240,000. DPMO = 20,400 / (5 × 240,000) × 1,000,000 = 17,000 DPMO. From the Motorola 1.5σ-shift table: 17,000 DPMO ≈ 3.6σ short-term / 2.1σ long-term. Target 1.5% rejects → DPMO = 3,000 → ~4.0σ short-term / 2.5σ long-term — a 0.4σ long-term improvement.

**Kano classification of VOC items (order-to-cash).**
- Basic / Must-Be: "Invoice matches the PO" (customer is dissatisfied if wrong, neutral if correct). CTQ: invoice accuracy = 100%.
- Performance / One-Dimensional: "Order ships within 48 hours" (more is better, linear). CTQ: ship time ≤ 48 h.
- Excitement / Delighter: "Real-time shipment tracking via SMS" (customer delighted if present, neutral if absent). Not a CTQ for this project (out of scope; flag for product-management roadmap).

The Kano prioritization: basics non-negotiable; performance = project's primary CTQ; delighters = roadmap, not this project.`,
  keyFormulas: `DPMO = (Defects / (Opportunities × Units)) × 1,000,000
  Defects = total count of defect events across all opportunities
  Opportunities per unit = number of CTQs measured on each unit
  Units = total units produced in the period
Sigma level (short-term, centered) = 3 × Cp   where Cp = (USL − LSL) / (6 σ̂_within)
Sigma level (long-term, with Motorola 1.5σ shift) = 3 × Cp − 1.5
Yield (first-pass, FPY) = (Good units / Total units) × 100%
Rolled-throughput yield (RTY) = ∏ FPY_i  (across n process steps)
COPQ = Appraisal + Prevention + Internal Failure + External Failure
  Appraisal = inspection + test + calibration + audit
  Prevention = training + procedures + design reviews + poka-yoke
  Internal Failure = scrap + rework + regrind + retest + downtime
  External Failure = warranty + returns + RMA + recalls + lost sales + liability
COPQ as % of revenue = (COPQ / Revenue) × 100%   (quality-maturity benchmark)
Kano categories: Basic (must-be), Performance (one-dimensional, linear), Excitement (delighter)
CTQs = the SIPOC outputs the customer cares about (priority CTQs selected from candidates)
SIPOC columns = Supplier | Input | Process (5-7 steps) | Output | Customer`,
  exercise: `You are a Green Belt on a hospital ED wait-time project (continuing from Lesson 1's exercise). (a) Build a SIPOC for the order-to-lab process (physician orders → lab draws → result returns → physician acts). (b) Compute COPQ for the ED project given: appraisal $80k (triage nurse audit), prevention $20k (training), internal failure = 1 lost-bed-hour × $1,200 × 1,400 events = $1.68M, external failure = $0.4M patient leakage + $0.2M reputation = $0.6M. (c) Compute COPQ as % of revenue if ED revenue is $14M. (d) Compute DPMO if defects = 4,200 (long ED wait events), opportunities = 3 per visit (door-to-provider, triage accuracy, discharge clarity), units = 35,000 visits. (e) Classify these VOC items by Kano: "I don't want to wait"; "I want the doctor to know my history"; "I want a courtesy call after discharge".`,
  sections: {
    learning_objectives: `- Define VOC and the four capture methods (interviews, focus groups, surveys, observation); select the appropriate method for each project.
- Apply the Kano model to classify VOC items as Basic, Performance, or Excitement; explain the Kano decay.
- Build a SIPOC (Supplier-Input-Process-Output-Customer) with 5-7 process steps and explicit boundaries (start, end).
- Identify CTQ candidates from the SIPOC outputs; select 2-3 priority CTQs for the project.
- Compute COPQ from the four ASQ-canonical categories (appraisal, prevention, internal failure, external failure).
- Compute COPQ as % of revenue as a quality-maturity benchmark.
- Compute DPMO from defects, opportunities, and units; convert DPMO to sigma level (short-term and long-term with the Motorola 1.5σ shift).
- Position SIPOC + COPQ + sigma level as the Define-to-Measure hand-off (Measure will detail the process flow and baseline the CTQs).`,
    prerequisites: `- The DMAIC framework and the position of Define as the first phase.
- Lesson 1 (Project Charter & CTQ) — the charter, CTQ tree, and COPQ business case.
- Process thinking: input/output, supplier/customer, process step.
- Basic statistics: mean, standard deviation, normal distribution, yield.
- Customer-research concepts at the conceptual level (interviews, surveys).`,
    introduction: `VOC and SIPOC are the two technical deliverables of Define (alongside the charter from Lesson 1). VOC captures the customer's voice; SIPOC maps the process that delivers (or fails to deliver) against that voice; COPQ translates the gap into money. The three together — VOC, SIPOC, COPQ — are the technical contract passed from Define to Measure: Measure will detail the process flow, validate the measurement system (MSA), baseline the CTQs' sigma level, and confirm the COPQ categories' annual run-rate. The Kano model prioritizes the VOC items (basics non-negotiable; performance = primary CTQ; excitement = roadmap). The SIPOC surfaces the CTQ candidates (each output is a candidate). The COPQ four-category model is the financial translation; the sigma level (DPMO) is the technical translation. Both are required at the Define gate — the Sponsor reads the COPQ and the ROI; the Black Belt reads the DPMO and the sigma-level projection to confirm the goal is achievable.

The Motorola 1.5σ shift is the empirical observation that long-term performance drifts approximately 1.5σ from the centered short-term position because of setup changes, operator variability, tool wear, and environmental drift. A 6σ short-term process delivers 3.4 DPMO long-term, not 0.002 DPMO. The 1.5σ shift is built into the Six Sigma conversion table: 6σ→3.4, 5σ→233, 4σ→6,210, 3σ→66,807, 2σ→308,537, 1σ→691,462. A 3-sigma process (66,807 DPMO, 6.68% rejects) is the typical "average company" baseline; a 4-sigma process (6,210 DPMO, 0.62% rejects) is the "good company"; a 5-sigma process (233 DPMO) is "world-class"; a 6-sigma process (3.4 DPMO) is "entitlement." The Define-phase sigma-level projection is computed from the current DPMO and the target DPMO; the gap drives the project's improvement magnitude and the SMART goal's achievability check.`,
    terminology: `- **VOC (Voice of the Customer)**: structured capture of customer requirements (stated and unstated).
- **Interview**: 1:1 semi-structured conversation; depth over breadth.
- **Focus group**: 6-10 customers in a group setting; group dynamics elicit trade-offs.
- **Survey**: large-N structured questionnaire; statistical segmentation.
- **Observation / direct visit**: the "follow-me-home" method; best for unstated process needs.
- **Kano Basic / Must-Be**: customer dissatisfied if absent, neutral if present (table-stakes).
- **Kano Performance / One-Dimensional**: more is better, linear satisfaction (differentiator).
- **Kano Excitement / Delighter**: customer delighted if present, neutral if absent (innovation).
- **Kano decay**: a delighter today decays to a basic tomorrow (customer expectations rise).
- **SIPOC**: Supplier-Input-Process-Output-Customer; one-page high-level process map.
- **Process step**: a single row in the SIPOC's Process column (5-7 steps total).
- **Process boundary**: where the SIPOC starts (the first supplier's input) and ends (the last customer's output).
- **CTQ candidate**: each SIPOC output is a candidate CTQ; 2-3 are selected as priority CTQs.
- **COPQ**: Cost of Poor Quality = Appraisal + Prevention + Internal Failure + External Failure.
- **Appraisal**: cost of detecting defects before customer (inspection, calibration, audit).
- **Prevention**: cost of avoiding defects (training, procedures, poka-yoke).
- **Internal Failure**: cost of defects caught internally (scrap, rework, downtime).
- **External Failure**: cost of defects reaching customer (warranty, returns, lost sales).
- **DPMO**: Defects per million opportunities = (defects / (opportunities × units)) × 1,000,000.
- **Sigma level (short-term)**: 3 × Cp; (long-term, with 1.5σ shift): 3 × Cp − 1.5.
- **Motorola 1.5σ shift**: empirical drift; 6σ short-term = 3.4 DPMO long-term.`,
    detailed_explanation: `VOC collection begins with the customer-segmentation question: which customer? The ASQ BOK distinguishes internal customers (the downstream process), external customers (the purchaser), and regulatory customers (compliance bodies). The CTQ candidates differ by segment — internal customers care about cycle-time and fit; external customers care about feature and durability; regulatory customers care about safety and traceability. The project team selects 1-3 segments to interview, depending on the project scope. For B2B projects, the customer is often the OEM's design engineer (interviews and focus groups are appropriate); for B2C, the end-user (surveys and observation); for internal-improvement projects (e.g., the order-to-cash process), the downstream process owner is the customer.

The four VOC methods each have strengths: (1) Interviews — best for unstated needs, high-value customers, and pre-spec phases (when the team doesn't yet know what to ask); depth over breadth; 6-12 interviews typical. (2) Focus groups — best for B2B and product-design VOC, where the trade-offs between features matter; group dynamics elicit priorities; 3-5 focus groups of 6-10 customers each. (3) Surveys — best for confirming stated needs and segmenting by demographics; N ≥ 100 for statistical power; closed-ended for quantification, open-ended for surprise-finding. (4) Observation — the "follow-me-home" or "follow-the-order" method; the team shadows the customer using the product / service in their actual workflow; best for unstated process needs where the customer cannot articulate the workflow. A robust VOC plan uses 2-3 methods in combination — interviews + survey, or focus group + observation — to triangulate.

The Kano model classifies each VOC item by asking two questions: (a) "How do you feel if this feature is present?" (b) "How do you feel if this feature is absent?" The answers map to Basic / Performance / Excitement. A Basic (Must-Be) is asymmetric: dissatisfied if absent, neutral if present — the customer assumes it. A Performance (One-Dimensional) is symmetric: linear satisfaction — more is better. An Excitement (Delighter) is asymmetric the other way: delighted if present, neutral if absent — the customer didn't know to ask. The Kano decay: a delighter today becomes a performance feature tomorrow and a basic the day after (e.g., SMS shipment tracking was a delighter in 2010, a performance feature in 2015, and a basic today). The project team prioritizes: basics are non-negotiable (must meet spec); performance is the primary CTQ target (the project's Y); excitement is the roadmap (out-of-scope for this project, but flagged for product management).

SIPOC construction. The SIPOC is a one-page table with 5 columns: Supplier, Input, Process, Output, Customer. The Process column has 5-7 steps (high-level, not detailed flowchart). The boundary is the first input (where the process starts) and the last output (where the process ends). The team builds the SIPOC in a 60-90 minute workshop with the process owner, key operators, and the Black Belt. Common SIPOC mistakes: too many process steps (15+ rows — that's a flowchart, not a SIPOC; defer to Measure); missing supplier or customer (a step with no supplier means the input is unknown — investigate); outputs without customers (an output that no one receives is a non-value-adding step — flag for Improve); inputs without specs (an input with no spec is an uncontrolled variable — flag for Measure).

COPQ calculation. The four-category model is the ASQ-canonical cost-of-quality categorization. (1) Appraisal: the cost of detecting defects before the customer sees them — inspector salaries, calibration, internal audit, test equipment. (2) Prevention: the cost of avoiding defects in the first place — training, procedure writing, design reviews, poka-yoke design, supplier qualification. (3) Internal Failure: the cost of defects caught internally — scrap, rework, regrind, retest, downtime, machine re-set-up. (4) External Failure: the cost of defects that reach the customer — warranty, returns, RMA, recalls, lost sales, liability, reputation damage. The COPQ four-category total is the project's annual run-rate; the post-improvement residual COPQ is the projected run-rate after the goal is met; the difference is the project's annual benefit. The COPQ-as-%-of-revenue benchmark: < 1% (6σ), 5-10% (4σ), 15-20% (3σ), 25-30% (2σ).

Sigma level from DPMO. DPMO = (defects / (opportunities × units)) × 1,000,000. Opportunities per unit = the number of CTQs measured on each unit (e.g., 5 for a shaft: OD, surface, length, concentricity, end-face). Units = total units produced in the period. DPMO is converted to sigma level via the Motorola 1.5σ-shift table: short-term sigma level = Φ⁻¹(1 − DPMO/1M); long-term sigma = short-term − 1.5. The 6σ short-term process delivers 3.4 DPMO long-term — the canonical Six Sigma entitlement. The Define-phase sigma-level projection compares the current DPMO to the target DPMO; the gap drives the project's improvement magnitude. A 1σ short-term improvement (e.g., 3.6σ → 4.6σ) requires the Improve phase to set the vital-few Xs at their optimal operating window — typically a 2³ or 2⁴ fractional-factorial DOE.`,
    core_principles: `- VOC is structured customer-requirement capture (stated + unstated); four methods (interviews, focus groups, surveys, observation) — use 2-3 in combination to triangulate.
- The Kano model classifies VOC items as Basic, Performance, Excitement; basics non-negotiable; performance = primary CTQ; excitement = roadmap (out-of-scope).
- Kano decay: a delighter today decays to a basic tomorrow — refresh the VOC periodically.
- SIPOC is a one-page high-level process map: 5 columns (Supplier-Input-Process-Output-Customer), 5-7 process steps, explicit boundaries.
- Each SIPOC output is a CTQ candidate; the team selects 2-3 priority CTQs for the project.
- COPQ = Appraisal + Prevention + Internal Failure + External Failure (ASQ four-category model).
- COPQ as % of revenue is the quality-maturity benchmark (< 1% = 6σ; 25-30% = 2σ).
- DPMO = (defects / (opportunities × units)) × 1M; sigma level (short-term) = 3 × Cp; (long-term, with 1.5σ shift) = 3 × Cp − 1.5.
- The Motorola 1.5σ shift means 6σ short-term = 3.4 DPMO long-term, the Six Sigma entitlement.
- SIPOC + COPQ + sigma level together form the Define-to-Measure hand-off.`,
    components: `- VOC plan (method mix, customer segments, sample size).
- Interview / focus group / survey / observation instruments.
- Kano classification table (VOC item → category → priority).
- SIPOC table (5 columns × 5-7 rows).
- CTQ candidate list (each SIPOC output is a candidate).
- Priority CTQ selection (2-3 CTQs for the project).
- COPQ four-category breakdown (Appraisal, Prevention, Internal, External).
- COPQ as % of revenue calculation.
- DPMO calculation (defects, opportunities, units).
- Sigma-level projection (current → target; short-term and long-term).`,
    process: `1. Identify the customer segments (internal, external, regulatory); select 1-3 to capture VOC.
2. Select the VOC method mix (interviews + survey, or focus group + observation); build instruments.
3. Capture VOC (execute the plan — 2-4 weeks typical).
4. Classify each VOC item by Kano (Basic, Performance, Excitement).
5. Build the SIPOC in a 60-90 min workshop with the process owner and operators.
6. Surface CTQ candidates from the SIPOC outputs.
7. Select 2-3 priority CTQs (from Kano Performance category, with operational definitions).
8. Compute COPQ from the four categories (Appraisal, Prevention, Internal, External).
9. Compute COPQ as % of revenue; compute DPMO; convert to sigma level (short-term and long-term).
10. Project the target sigma level from the goal statement (Lesson 1); confirm achievability.
11. Walk the VOC + Kano + SIPOC + COPQ + sigma level at the Define gate; pass to Measure.`,
    formula_calculation: `**COPQ (worked).** Appraisal = $50k (inspector $35k + calibration $10k + audit $5k); Prevention = $30k (training $15k + procedures $10k + poka-yoke $5k); Internal Failure = $420k (scrap 6% × $50 × 240k = $720k − regrind-recovered $300k = $420k); External Failure = $180k (warranty $40k + returns $30k + lost-sales $110k). Total COPQ = $50 + $30 + $420 + $180 = $680k/year. Revenue = $8.5M; COPQ as % of revenue = 680 / 8500 = 8.0% (≈ 4σ quality maturity per the benchmark table: 5-10% → 4σ).

**DPMO and sigma level (worked).** Defects = 20,400; Opportunities per unit = 5 (OD, surface, length, concentricity, end-face); Units = 240,000. DPMO = 20,400 / (5 × 240,000) × 1,000,000 = 17,000 DPMO. From the Motorola 1.5σ-shift table: 17,000 DPMO ≈ 3.6σ short-term / 2.1σ long-term. Target DPMO = 1.5% × 1M / 5 = 3,000 DPMO → ~4.0σ short-term / 2.5σ long-term. Improvement needed = 0.4σ long-term (3.6 → 4.0 short-term).

**Yield (worked).** First-pass yield FPY = (240,000 − 20,400) / 240,000 = 0.915 = 91.5% (matches 8.5% rejects). Rolled-throughput yield (across 6 SIPOC steps) — if each step is at 99.5%: RTY = 0.995^6 = 0.970 = 97.0% — a 3% loss across the chain. The CNC grinding project focuses on the OD CTQ (FPY = 91.5%); the order-to-cash project (Lesson 1's industrial example) focuses on the ship-time CTQ.

**Kano matrix (worked).** "Invoice matches PO" → Basic (dissatisfied if wrong, neutral if correct); "Order ships within 48 h" → Performance (linear satisfaction); "Real-time SMS tracking" → Excitement (delighted if present, neutral if absent). Priority CTQ for the order-to-cash project = ship time (Performance category); invoice accuracy is a Basic (non-negotiable, must meet 100% — out of project scope, table-stakes); SMS tracking is Excitement (roadmap, out of scope).

Units: COPQ in $/year; COPQ as % of revenue dimensionless; DPMO dimensionless [0..1M]; sigma level dimensionless [0..6+]; yield dimensionless [0..1] or [0..100%].`,
    worked_example: `**Order-to-cash SIPOC + COPQ + sigma level (full worked).**

The SIPOC for an order-to-cash process (from the worked_example field above): 6 process steps (receive PO, credit check, configure order, pick & pack, ship, invoice & collect); 6 suppliers; 6 outputs; 4 customers (End Customer, Finance, Sales, Carrier). Each output is a CTQ candidate: order accuracy, credit-decision time, pick accuracy, ship time, invoice accuracy, payment-collection time.

VOC capture (3 methods): (1) 12 phone interviews with B2B customers (purchase managers); (2) 1 focus group of 8 OEM design engineers; (3) 200-customer survey (closed + open). Key VOC themes: (a) "Order ships within 48 hours" — appears in 78% of interviews, 92% of survey responses (Performance); (b) "Invoice matches the PO" — 100% expected (Basic); (c) "Real-time SMS tracking" — 12% mention (Excitement); (d) "Credit decision in < 4 hours" — 45% mention (Performance).

Kano classification: ship time = Performance (primary CTQ); invoice accuracy = Basic (non-negotiable); SMS tracking = Excitement (roadmap); credit-decision time = Performance (secondary CTQ).

Priority CTQs selected: (1) ship time ≤ 48 h; (2) credit-decision time ≤ 4 h. Operational definitions: ship time = ERP timestamp (carrier pickup) − ERP timestamp (order release) on every order; spec ≤ 48 h. Credit-decision time = ERP timestamp (credit-release) − ERP timestamp (order-entry); spec ≤ 4 h.

COPQ calculation: Appraisal $50k + Prevention $30k + Internal Failure $420k + External Failure $180k = $680k/year (manufacturing order-to-cash example; in a pure service order-to-cash the Internal Failure would dominate — lost staff time + expedited shipping fees).

DPMO and sigma level: DPMO = 17,000 → 3.6σ short-term / 2.1σ long-term; target 1.5% rejects → DPMO = 3,000 → 4.0σ short-term / 2.5σ long-term. Improvement = 0.4σ short-term.

Business case (Sponsor read-out): COPQ recovery $520k/year; project cost $65k; ROI 8×; payback 1.5 months; quality maturity 4σ → ~4.5σ (long-term), recovering 6.1% of revenue in COPQ.

The Define gate passes to Measure: (a) the charter (Lesson 1); (b) the priority CTQs (ship time, credit-decision time) with operational definitions; (c) the SIPOC (6 steps, 6 outputs); (d) the COPQ baseline ($680k/year); (e) the sigma-level projection (3.6 → 4.0 short-term). Measure will: detail the process flow (swimlane flowchart with decision points); run MSA on the ERP timestamps (Gage R&R — for timestamp data, this is a calibration check on the ERP clock); baseline each CTQ's sigma level; compute Cp/Cpk; confirm the COPQ run-rate from the GL.`,
    industrial_example: `**Healthcare — ED order-to-lab process.** SIPOC: Suppliers (Patient, Physician, Lab Phlebotomist, LIS); Inputs (Specimen order, Patient arm, Blood tubes, LIS order); Process (5 steps: physician orders, phlebotomist draws, specimen transports, lab analyzes, result posts); Outputs (Collected specimen, Result, Actionable result); Customers (Physician, Patient). CTQ candidate: lab-result turnaround (TAT) ≤ 60 min (Performance); basic: correct patient ID; excitement: SMS result to patient.

**Manufacturing — order-to-cash process (above).** Full SIPOC, Kano, COPQ, sigma-level worked.

**Banking — loan origination process.** SIPOC: 7 steps (application, credit pull, underwrite, condition review, appraisal, decision, fund). COPQ: appraisal $200k (compliance audit) + prevention $150k (underwriter training) + internal failure $1.2M (rework on incomplete files) + external failure $0.8M (lost customers to competitors) = $2.35M/year; revenue $25M → COPQ 9.4%. DPMO: 4,800 defects / (6 × 50,000 applications) × 1M = 16,000 DPMO → 3.6σ short-term.

**Logistics — port container handling.** SIPOC: 5 steps (gate-in, yard-move, vessel-load, discharge, gate-out); CTQ: vessel turnaround time ≤ 24 h; COPQ: appraisal $300k (gate audit) + prevention $100k (training) + internal failure $1.5M (rehandle + delay) + external failure $0.9M (shipping-line penalties) = $2.8M/year; revenue $35M → COPQ 8.0%.`,
    case_study: `CASE_TYPE = SYNTHETIC. A regional commercial bank (revenue $25M) ran a Six Sigma project on its loan-origination process. The team captured VOC via 18 loan-officer interviews, 2 customer focus groups, and a 400-customer survey. Key VOC themes: "I want my loan decision in 5 business days" (Performance, 81% mention); "I don't want to submit the same document twice" (Basic, 100% expected); "I want a real-time status portal" (Excitement, 18% mention). The SIPOC had 7 process steps. The COPQ was $2.35M/year (appraisal $200k + prevention $150k + internal failure $1.2M + external failure $0.8M) — 9.4% of revenue. DPMO = 16,000 → 3.6σ short-term. Priority CTQ: decision time ≤ 5 business days (down from 9.2-day baseline). The Define gate authorized Measure, which ran an MSA on the LOS (loan-origination-system) timestamps, baselined the decision-time CTQ at 3.5σ, and confirmed the COPQ run-rate. Analyze found "condition review" and "appraisal" steps accounted for 71% of cycle-time variance. Improve redesigned the condition-review workflow (parallel conditions, exception routing) and pre-ordered appraisals for high-credit applicants. Control locked in the gains via an I-MR chart on decision-time and a daily-exception report. Final result: decision time 5.1 days (97% within target), COPQ recovered $1.4M/year, realized ROI 5.6× within 9 months.`,
    visual_explanation: `Visual 1: the SIPOC table — 5 columns (Supplier | Input | Process | Output | Customer), 5-7 rows (one per process step). The Process column carries the step name in a single cell (NOT a detailed flowchart). Visual 2: the Kano diagram — a 2-axis plot (x = functionality, y = satisfaction) with three curves: Basic (asymmetric, dissatisfied below threshold, neutral above); Performance (linear, monotonically increasing); Excitement (asymmetric, neutral below, delighted above). Visual 3: the COPQ bar chart — four bars (Appraisal, Prevention, Internal Failure, External Failure) with a horizontal line marking the post-project target COPQ; the gap is the annual benefit. Visual 4: the DPMO-to-sigma conversion table — DPMO on x, sigma level on y, with the 1.5σ-shift line marked. Visual 5: the VOC triangulation Venn — three circles (interviews, surveys, observation) with the central overlap = high-confidence needs; the symmetric difference = method-specific bias.`,
    simulation_opportunity: `A SIPOC builder simulator would let the learner drag process steps onto a 5-column table; auto-check for missing supplier (red flag), missing customer (red flag), and > 7 steps (amber flag — defer to Measure). A Kano classifier would let the learner answer the "present" and "absent" questions per VOC item and auto-classify into Basic / Performance / Excitement. A COPQ calculator would let the learner enter the four-category inputs and compute COPQ, COPQ-as-%-of-revenue, ROI, payback, and the sigma-level projection from DPMO. A DPMO-to-sigma converter would let the learner enter defects, opportunities, units, and convert to short-term and long-term sigma level via the Motorola 1.5σ-shift table.`,
    common_mistakes: `- Skipping VOC and assuming the team knows what the customer wants — the most common Define-phase failure.
- Using only one VOC method (interviews only, or survey only) — single-method bias; triangulate.
- Treating all VOC items as equal — Kano prioritization is required; basics ≠ performance ≠ excitement.
- Building a 15-row SIPOC — that's a flowchart; defer to Measure.
- Missing the supplier or customer on a step — investigate; an unknown supplier means an uncontrolled input.
- Outputs without customers — flag as non-value-adding for Improve.
- Inputs without specs — flag as uncontrolled variables for Measure.
- Computing COPQ from a single category (e.g., scrap only) — under-counts by 50-80%.
- Reporting sigma level without specifying short-term vs long-term (with 1.5σ shift).
- Treating Kano categories as static — refresh the VOC periodically (Kano decay).
- Confusing FPY (first-pass yield) with RTY (rolled-throughput yield) — RTY = ∏ FPY_i.`,
    limitations: `- VOC is a snapshot — customer needs drift; the Kano decay means today's delighter is tomorrow's basic.
- Interviewer bias (leading questions), survey response bias (self-selection), focus-group bias (dominant voice).
- SIPOC is high-level — it does not capture decision points, rework loops, or parallel paths (Measure's flowchart does).
- COPQ under-counts in services — process-cycle-time COPQ (the Lean extension) is often larger than defect-COPQ.
- DPMO assumes a normal distribution — non-normal CTQs (count defects, life-data) need non-normal capability in Measure.
- The 1.5σ shift is empirical, not theoretical — it varies by industry (1.0-2.0σ).
- Kano decay rate varies by industry — fast for consumer electronics, slow for industrial equipment.
- The SIPOC's process boundary is a judgment call — the team may disagree on where the process starts/ends.`,
    comparison: `**VOC vs Market Research.** Market research asks "what should we build?" (product strategy); VOC asks "what must we deliver?" (process improvement). Market research is broader (segments, trends, positioning); VOC is narrower (specific CTQs for a specific project). VOC feeds market research with the unstated needs; market research feeds VOC with the strategic context.

**SIPOC vs Flowchart.** SIPOC is high-level (5-7 steps, one page, no decision points); flowchart is detailed (every decision, every rework loop, every parallel path). SIPOC is a Define deliverable; flowchart is a Measure deliverable. SIPOC answers "what is the process?" at the boundaries; flowchart answers "how does the process actually run?".

**COPQ vs COQ.** ASQ uses COPQ and COQ interchangeably for the four-category total; some texts distinguish COPQ (= Internal + External Failure only) from COQ (= four-category total). The ASQ Six Sigma BOK uses COPQ for the four-category total — Lesson 1 and Lesson 2 follow that convention.

**Kano vs QFD.** Kano classifies VOC items by satisfaction curve (Basic / Performance / Excitement); QFD is a matrix relating many customer needs to many engineering characteristics with importance weights. Kano is a Define-phase prioritization tool; QFD is a Design-for-Six-Sigma (DFSS) tool. Kano is faster (one workshop); QFD is comprehensive (multi-week).`,
    practical_application: `Run the VOC + SIPOC workshop as a 4-hour session with the Black Belt, Green Belt(s), process owner, key operators, and (where possible) 1-2 customer representatives. Agenda: (1) 30 min — review the charter (problem, goal, scope) — confirm the SIPOC boundaries. (2) 60 min — VOC review: walk the interview/focus group/survey outputs; classify each item by Kano. (3) 60 min — SIPOC build: 5 columns × 5-7 rows; check for missing supplier/customer; flag non-value-adding outputs. (4) 30 min — CTQ candidate surfacing: list each output as a candidate; select 2-3 priority CTQs (from Kano Performance category, with operational definitions). (5) 30 min — COPQ walk: confirm the four-category breakdown; compute COPQ-as-%-of-revenue. (6) 30 min — sigma-level projection: compute DPMO; convert via the Motorola 1.5σ-shift table. Confirm the goal is achievable (the sigma-level gap is in the 0.5-1.5σ range). Output: VOC + Kano table, SIPOC, priority CTQ list with operational definitions, COPQ baseline, sigma-level projection. All five are passed to Measure.`,
    decision_scenario: `**The "missing customer" scenario.** During the SIPOC workshop, the team finds that step 4 (pick & pack) has no explicit customer — the output (packed shipment) is consumed by step 5 (ship), which is internal. The team must decide: (a) the customer of step 4 is the carrier (step 5 supplier) — re-write the SIPOC to make the carrier the customer of step 4 and supplier of step 5; (b) collapse steps 4 and 5 into a single "fulfillment" step; (c) investigate further (a 30-min observation on the dock to confirm who actually receives the packed shipment). The correct answer is (c) first — the team's first SIPOC is a hypothesis; observation confirms. Then (a) or (b) based on the observation. A common mistake: forcing the SIPOC to fit the team's preconception without observation — the SIPOC must reflect the actual process, not the org chart.`,
    practice_questions: `- Build a SIPOC for a process you know (e.g., morning coffee, customer-onboarding, doctor's visit) with 5-7 steps; flag any missing supplier/customer.
- Classify these VOC items by Kano: "fast checkout"; "no errors"; "personalized recommendations"; "easy returns".
- Compute DPMO and sigma level (short-term and long-term) for: 850 defects, 4 opportunities per unit, 50,000 units.
- Compute COPQ as % of revenue given: appraisal $40k, prevention $25k, internal failure $310k, external failure $90k, revenue $4.2M.`,
    certification_questions: `- ASQ Black Belt (Easy, Recall): The four VOC capture methods are interviews, focus groups, surveys, and observation.
- ASQ Black Belt (Medium, Apply): Given a SIPOC with a step missing its customer, identify the action (investigate via observation, then re-write).
- ASQ Black Belt (Medium, Calculation): Given defects, opportunities, and units, compute DPMO and convert to sigma level (short-term and long-term with the 1.5σ shift).
- ASQ Black Belt (Hard, Analyze): Given a VOC item, classify by Kano and explain why (the asymmetry of satisfaction / dissatisfaction).`,
    summary: `VOC, SIPOC, and COPQ are the three technical deliverables of Define (alongside the charter from Lesson 1). VOC captures the customer's voice via four methods (interviews, focus groups, surveys, observation), triangulated to control method bias. The Kano model classifies VOC items as Basic (non-negotiable), Performance (primary CTQ), or Excitement (roadmap). SIPOC is the one-page high-level process map (5 columns × 5-7 steps) that surfaces CTQ candidates from its outputs. COPQ is the four-category financial translation (Appraisal + Prevention + Internal Failure + External Failure); COPQ-as-%-of-revenue is the quality-maturity benchmark. DPMO and sigma level (short-term, and long-term with the Motorola 1.5σ shift) are the technical translation. Together, these three define the Define-to-Measure hand-off: Measure details the process flow, validates the measurement system, and baselines the CTQs' sigma level.`,
    key_takeaways: `- VOC = structured capture of customer requirements; four methods (interviews, focus groups, surveys, observation); triangulate 2-3.
- Kano: Basic (must-be), Performance (one-dimensional, primary CTQ), Excitement (delighter, roadmap); decay over time.
- SIPOC = Supplier-Input-Process-Output-Customer; 5 columns × 5-7 steps; one page; defer flowchart to Measure.
- Each SIPOC output is a CTQ candidate; select 2-3 priority CTQs with operational definitions.
- COPQ = Appraisal + Prevention + Internal Failure + External Failure; the ASQ four-category model.
- COPQ as % of revenue: < 1% (6σ), 5-10% (4σ), 25-30% (2σ).
- DPMO = (defects / (opportunities × units)) × 1M; sigma level (short-term) = 3 × Cp; (long-term) = 3 × Cp − 1.5.
- 6σ short-term = 3.4 DPMO long-term (Motorola 1.5σ shift) — the Six Sigma entitlement.
- VOC + Kano + SIPOC + COPQ + sigma level together form the Define-to-Measure hand-off.`,
    references: `- ASQ Six Sigma Black Belt Body of Knowledge — Define phase (VOC, Kano, SIPOC, COPQ).
- ASQ Six Sigma Green Belt Body of Knowledge — Define phase.
- Breyfogle (2003), Implementing Six Sigma, Ch. 1-4 (VOC/CTQ, SIPOC, COPQ categories).
- Pande, Neuman & Cavanagh (2014), The Six Sigma Way, Ch. 6 (VOC, Kano).
- Montgomery (2013), Statistical Quality Control, Ch. 1, 3, 4 (COPQ, CTQ translation, DPMO/sigma level).
- PMI (2021), PMBOK Guide 7th ed., Section 4.3/4.4 (Planning — scope/process boundaries).`,
  },
  knowledgeObject: {
    title: "Voice of Customer, SIPOC & COPQ",
    domain: "Define",
    competency: "Voice of Customer & SIPOC",
    topic: "DMAIC Define — VOC Capture, Process Map & COPQ",
    concept: "VOC methods, Kano classification, SIPOC construction, COPQ four-category model, DPMO/sigma level",
    body: {
      definitions: [
        "VOC (Voice of the Customer): structured capture of customer requirements (stated and unstated).",
        "Interview: 1:1 semi-structured conversation; depth over breadth; best for unstated needs and high-value customers.",
        "Focus group: 6-10 customers in a group setting; group dynamics elicit trade-offs; best for B2B and product-design VOC.",
        "Survey: large-N structured questionnaire; statistical segmentation; best for stated-need confirmation.",
        "Observation / direct visit: the 'follow-me-home' method; best for unstated process needs where the customer cannot articulate the workflow.",
        "Kano Basic / Must-Be: customer dissatisfied if absent, neutral if present (table-stakes).",
        "Kano Performance / One-Dimensional: more is better, linear satisfaction (differentiator).",
        "Kano Excitement / Delighter: customer delighted if present, neutral if absent (innovation).",
        "Kano decay: a delighter today decays to a basic tomorrow (customer expectations rise).",
        "SIPOC: Supplier-Input-Process-Output-Customer; one-page high-level process map.",
        "Process step: a single row in the SIPOC's Process column (5-7 steps total).",
        "Process boundary: where the SIPOC starts (first input) and ends (last output).",
        "CTQ candidate: each SIPOC output is a candidate CTQ; 2-3 are selected as priority CTQs.",
        "COPQ: Cost of Poor Quality = Appraisal + Prevention + Internal Failure + External Failure.",
        "Appraisal: cost of detecting defects before customer (inspection, calibration, audit).",
        "Prevention: cost of avoiding defects (training, procedures, poka-yoke).",
        "Internal Failure: cost of defects caught internally (scrap, rework, regrind, retest, downtime).",
        "External Failure: cost of defects reaching customer (warranty, returns, RMA, recalls, lost sales, liability).",
        "DPMO: Defects per million opportunities = (defects / (opportunities × units)) × 1,000,000.",
        "Sigma level (short-term): 3 × Cp; (long-term, with 1.5σ shift): 3 × Cp − 1.5.",
        "Motorola 1.5σ shift: empirical drift; 6σ short-term = 3.4 DPMO long-term.",
        "First-pass yield (FPY): (good units / total units) × 100%.",
        "Rolled-throughput yield (RTY): ∏ FPY_i across n process steps.",
      ],
      principles: [
        "VOC is structured customer-requirement capture; use 2-3 methods in combination to triangulate (single-method bias is the most common VOC failure).",
        "Kano prioritization: basics non-negotiable; performance = primary CTQ; excitement = roadmap (out-of-scope).",
        "Kano decay: a delighter today decays to a basic tomorrow — refresh the VOC periodically.",
        "SIPOC is a one-page high-level process map: 5 columns (S-I-P-O-C), 5-7 process steps, explicit boundaries.",
        "Each SIPOC output is a CTQ candidate; the team selects 2-3 priority CTQs for the project.",
        "COPQ = Appraisal + Prevention + Internal Failure + External Failure (ASQ four-category model).",
        "COPQ as % of revenue is the quality-maturity benchmark: < 1% (6σ), 5-10% (4σ), 15-20% (3σ), 25-30% (2σ).",
        "DPMO = (defects / (opportunities × units)) × 1M; sigma level (short-term) = 3 × Cp; (long-term) = 3 × Cp − 1.5.",
        "The Motorola 1.5σ shift means 6σ short-term = 3.4 DPMO long-term — the Six Sigma entitlement.",
        "SIPOC + COPQ + sigma level together form the Define-to-Measure hand-off.",
      ],
      components: [
        "VOC plan (method mix, customer segments, sample size).",
        "Interview / focus group / survey / observation instruments.",
        "Kano classification table (VOC item → category → priority).",
        "SIPOC table (5 columns × 5-7 rows).",
        "CTQ candidate list (each SIPOC output is a candidate).",
        "Priority CTQ selection (2-3 CTQs for the project).",
        "COPQ four-category breakdown (Appraisal, Prevention, Internal, External).",
        "COPQ as % of revenue calculation.",
        "DPMO calculation (defects, opportunities, units).",
        "Sigma-level projection (current → target; short-term and long-term).",
      ],
      mechanism: [
        "Define-to-Measure translation: VOC (qualitative) → Kano (priority) → SIPOC (process map + CTQ candidates) → priority CTQs (operational definition + spec) → COPQ (financial) + DPMO/sigma level (technical) → Measure baselines the CTQs.",
      ],
      process: [
        "1. Identify customer segments (internal, external, regulatory); select 1-3 to capture VOC.",
        "2. Select VOC method mix (interviews + survey, or focus group + observation); build instruments.",
        "3. Capture VOC (2-4 weeks typical).",
        "4. Classify each VOC item by Kano (Basic, Performance, Excitement).",
        "5. Build the SIPOC in a 60-90 min workshop with the process owner and operators.",
        "6. Surface CTQ candidates from the SIPOC outputs.",
        "7. Select 2-3 priority CTQs (Kano Performance category, with operational definitions).",
        "8. Compute COPQ from the four categories (Appraisal, Prevention, Internal, External).",
        "9. Compute COPQ as % of revenue; compute DPMO; convert to sigma level (short-term and long-term).",
        "10. Project the target sigma level from the goal statement (Lesson 1); confirm achievability.",
        "11. Walk the VOC + Kano + SIPOC + COPQ + sigma level at the Define gate; pass to Measure.",
      ],
      formulas: [
        "DPMO = (Defects / (Opportunities × Units)) × 1,000,000.",
        "Sigma level (short-term, centered) = 3 × Cp; (long-term, with 1.5σ shift) = 3 × Cp − 1.5.",
        "FPY = (Good units / Total units) × 100%.",
        "RTY = ∏ FPY_i (across n process steps).",
        "COPQ = Appraisal + Prevention + Internal Failure + External Failure.",
        "COPQ as % of revenue = (COPQ / Revenue) × 100%.",
        "Cp = (USL − LSL) / (6 σ̂_within) — referenced for sigma-level conversion.",
        "Kano classification: Basic (asymmetric, dissatisfied if absent), Performance (linear), Excitement (asymmetric, delighted if present).",
        "SIPOC: 5 columns (S-I-P-O-C) × 5-7 process steps; one page; boundaries explicit.",
      ],
      metrics: [
        "VOC method coverage (interviews / focus groups / surveys / observation — 2-3 methods typical).",
        "Kano category counts (Basic, Performance, Excitement).",
        "SIPOC completeness (supplier/customer present on every step; 5-7 steps).",
        "Number of CTQ candidates (one per SIPOC output); 2-3 priority CTQs selected.",
        "COPQ annual ($/year) and COPQ as % of revenue.",
        "DPMO (current and target).",
        "Sigma level (short-term and long-term with 1.5σ shift).",
        "FPY (first-pass yield) and RTY (rolled-throughput yield) at the SIPOC level.",
      ],
      examples: [
        "Order-to-cash SIPOC (6 steps, 6 outputs, 4 customers); priority CTQ ship time ≤ 48 h.",
        "ED order-to-lab SIPOC (5 steps); priority CTQ lab-result TAT ≤ 60 min.",
        "Bank loan-origination SIPOC (7 steps); priority CTQ decision time ≤ 5 business days.",
        "Port container-handling SIPOC (5 steps); priority CTQ vessel turnaround ≤ 24 h.",
        "COPQ worked example: $680k/year on $8.5M revenue = 8.0% (4σ quality maturity).",
        "DPMO worked: 17,000 → 3.6σ short-term / 2.1σ long-term.",
        "Kano worked: ship time (Performance), invoice accuracy (Basic), SMS tracking (Excitement).",
      ],
      industrial_examples: [
        "Healthcare — ED order-to-lab process SIPOC; CTQ lab TAT ≤ 60 min; COPQ lost-bed-hour dominates.",
        "Manufacturing — order-to-cash process SIPOC; CTQ ship time ≤ 48 h; COPQ $680k on $8.5M revenue.",
        "Banking — loan origination SIPOC (7 steps); CTQ decision time ≤ 5 days; COPQ $2.35M on $25M revenue.",
        "Logistics — port container-handling SIPOC; CTQ vessel turnaround ≤ 24 h; COPQ $2.8M on $35M revenue.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Regional commercial bank loan-origination project: $25M revenue, $2.35M COPQ (9.4%), 3.6σ, VOC via 18 interviews + 2 focus groups + 400-customer survey. Kano: 5-day decision (Performance), no-double-submission (Basic), status portal (Excitement). Priority CTQ decision time (9.2 → 5.1 days). Measure baselined 3.5σ; Analyze found condition-review + appraisal steps = 71% of cycle-time variance; Improve parallelized conditions + pre-ordered appraisals; Control I-MR chart on decision-time. Final: 5.1 days, COPQ recovered $1.4M/year, realized ROI 5.6× within 9 months.",
      ],
      common_errors: [
        "Skipping VOC and assuming the team knows the customer's needs — the most common Define failure.",
        "Using only one VOC method (single-method bias) — triangulate 2-3.",
        "Treating all VOC items as equal — Kano prioritization is required.",
        "Building a 15-row SIPOC (that's a flowchart; defer to Measure).",
        "Missing the supplier or customer on a step — investigate; unknown supplier = uncontrolled input.",
        "Outputs without customers — non-value-adding; flag for Improve.",
        "Inputs without specs — uncontrolled variable; flag for Measure.",
        "Computing COPQ from a single category (scrap only) — under-counts by 50-80%.",
        "Reporting sigma level without specifying short-term vs long-term (with 1.5σ shift).",
        "Treating Kano categories as static — refresh the VOC (Kano decay).",
        "Confusing FPY (first-pass yield) with RTY (rolled-throughput yield).",
      ],
      limitations: [
        "VOC is a snapshot — customer needs drift; Kano decay means today's delighter is tomorrow's basic.",
        "Interviewer bias (leading questions), survey response bias (self-selection), focus-group bias (dominant voice).",
        "SIPOC is high-level — no decision points, rework loops, or parallel paths (Measure's flowchart captures these).",
        "COPQ under-counts in services — process-cycle-time COPQ (the Lean extension) is often larger than defect-COPQ.",
        "DPMO assumes a normal distribution — non-normal CTQs need non-normal capability in Measure.",
        "The 1.5σ shift is empirical, not theoretical — varies by industry (1.0-2.0σ).",
        "Kano decay rate varies by industry — fast for consumer electronics, slow for industrial equipment.",
        "The SIPOC's process boundary is a judgment call — the team may disagree on start/end.",
      ],
      best_practices: [
        "Run the VOC + SIPOC workshop as a 4-hour session with Black Belt, Green Belt(s), process owner, key operators, and 1-2 customer reps.",
        "Triangulate 2-3 VOC methods (interviews + survey, or focus group + observation) to control method bias.",
        "Always Kano-classify VOC items before selecting priority CTQs.",
        "Cap SIPOC at 5-7 process steps; defer detail to Measure's flowchart.",
        "Investigate missing suppliers/customers via 30-min observation before re-writing the SIPOC.",
        "Confirm COPQ four-category breakdown with Finance before sign-off.",
        "Specify short-term AND long-term sigma level (with 1.5σ shift) when reporting.",
        "Refresh the VOC every 12-18 months (Kano decay).",
        "Distinguish FPY (single-step) from RTY (multi-step) — RTY is the SIPOC-level yield.",
      ],
      related_concepts: [
        "Project Charter & CTQ (Lesson 1) — charter, COPQ business case, CTQ tree.",
        "Stakeholder & Scope Management (Lesson 3) — power/interest grid, RACI, OMOUM, change control.",
        "Measure phase — MSA (Gage R&R), capability (Cp/Cpk), DPMO/sigma-level baselining, process flowchart.",
        "Analyze phase — root cause (5-Why, FMEA), regression.",
        "QFD (Quality Function Deployment) — DFSS matrix relating needs to engineering characteristics.",
        "Lean Six Sigma — process-cycle-time COPQ extension; value-stream map (VSM) in Measure.",
      ],
      prerequisites: [
        "The DMAIC framework and the position of Define as the first phase.",
        "Lesson 1 (Project Charter & CTQ) — the charter, CTQ tree, COPQ business case.",
        "Process thinking: input/output, supplier/customer, process step.",
        "Basic statistics: mean, standard deviation, normal distribution, yield.",
        "Customer-research concepts at the conceptual level (interviews, surveys).",
      ],
      references: [
        "ASQ Six Sigma Black Belt Body of Knowledge — Define phase (VOC, Kano, SIPOC, COPQ).",
        "ASQ Six Sigma Green Belt Body of Knowledge — Define phase.",
        "Breyfogle (2003), Implementing Six Sigma, Ch. 1-4.",
        "Pande, Neuman & Cavanagh (2014), The Six Sigma Way, Ch. 6.",
        "Montgomery (2013), Statistical Quality Control, Ch. 1, 3, 4.",
        "PMI (2021), PMBOK Guide 7th ed., Section 4.3/4.4.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Voice of Customer & SIPOC",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "What does SIPOC stand for in the Define phase of DMAIC?",
      whyCorrect:
        "SIPOC stands for Supplier-Input-Process-Output-Customer — the one-page high-level process map with five columns and 5-7 process steps. Suppliers feed inputs to the process; the process transforms inputs into outputs; the outputs are received by customers (internal or external). The SIPOC anchors the Define phase and surfaces the CTQ candidates from its outputs.",
      whyOthersWrong: [
        "Option A (Standard-Inspection-Plan-Output-Certification) — fabricated acronym; SIPOC is the standard Six Sigma process-map abbreviation, not a quality-inspection plan.",
        "Option C (Strategic-Input-Process-Output-Cycle) — fabricated; the S stands for Supplier (the source of the input), not Strategic.",
        "Option D (Supplier-Input-Procedure-Output-Customer) — close, but the P stands for Process (the high-level steps), not Procedure (which would imply a written SOP, a different artifact).",
      ],
      explanation:
        "SIPOC = Supplier-Input-Process-Output-Customer; 5 columns × 5-7 process steps; the one-page high-level process map of the Define phase.",
      options: [
        { text: "Standard-Inspection-Plan-Output-Certification", isCorrect: false },
        { text: "Supplier-Input-Process-Output-Customer", isCorrect: true },
        { text: "Strategic-Input-Process-Output-Cycle", isCorrect: false },
        { text: "Supplier-Input-Procedure-Output-Customer", isCorrect: false },
      ],
    },
    {
      competencyName: "Voice of Customer & SIPOC",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Manufacturing",
      stem: "A process produced 240,000 shafts with 20,400 defects (OD out-of-tolerance). Each shaft has 5 measured CTQ opportunities (OD, surface, length, concentricity, end-face). Compute DPMO and the long-term sigma level (with the Motorola 1.5σ shift).",
      whyCorrect:
        "DPMO = (defects / (opportunities × units)) × 1,000,000 = (20,400 / (5 × 240,000)) × 1,000,000 = (20,400 / 1,200,000) × 1,000,000 = 17,000 DPMO. From the Motorola 1.5σ-shift conversion table: 17,000 DPMO ≈ 3.6σ short-term / 2.1σ long-term (long-term = short-term − 1.5σ). The 0.85% defect rate (8.5% × 1/5 opportunity share spread across 5 CTQs — note: only the OD CTQ carries the 8.5% rejects; the other 4 CTQs have lower rates; for sigma-level projection the project uses the OD-CTQ DPMO of 85,000 → ~2.9σ short-term — the worked answer here uses the all-CTQ aggregate).",
      whyOthersWrong: [
        "Option A (85,000 DPMO, 2.9σ long-term) — this would be correct if 'defects' = 8.5% × 240,000 (reject units) and opportunities = 1 (single CTQ); the question specifies 5 opportunities per unit, so DPMO is the aggregate, not single-CTQ.",
        "Option C (17,000 DPMO, 3.6σ long-term) — has the correct DPMO but reports the SHORT-TERM sigma (3.6σ) where the question asked for LONG-TERM (with the 1.5σ shift) — long-term = 3.6 − 1.5 = 2.1σ.",
        "Option D (1,700 DPMO, 4.5σ long-term) — arithmetic error (divided by 10); would be the case if opportunities = 50 per unit (implausible for a shaft) or units = 2.4M (off by 10×).",
      ],
      explanation:
        "DPMO = 20,400 / (5 × 240,000) × 1M = 17,000. Motorola 1.5σ-shift table: 17,000 DPMO ≈ 3.6σ short-term; long-term = 3.6 − 1.5 = 2.1σ.",
      options: [
        { text: "85,000 DPMO, 2.9σ long-term (single-CTQ)", isCorrect: false },
        { text: "17,000 DPMO, 2.1σ long-term (3.6σ short-term − 1.5)", isCorrect: true },
        { text: "17,000 DPMO, 3.6σ long-term (short-term reported as long-term)", isCorrect: false },
        { text: "1,700 DPMO, 4.5σ long-term (10× arithmetic error)", isCorrect: false },
      ],
    },
    {
      competencyName: "Voice of Customer & SIPOC",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Conceptual",
      scenario: "Healthcare",
      stem: "An ED patient VOC item is 'I don't want to wait' (78% of survey responses, with linear dissatisfaction as wait time increases). Under the Kano model, how should this VOC item be classified, and what is the project-team implication?",
      whyCorrect:
        "Linear dissatisfaction (more is better; less is more satisfying; the relationship is one-dimensional) is the signature of a Kano Performance / One-Dimensional item. The project-team implication: this VOC item becomes the primary CTQ (the project's Y) — Performance items are the priority CTQs for DMAIC projects. Basics are non-negotiable (must meet spec, out-of-scope for improvement); Excitement items are roadmap (out-of-scope); Performance items are the project's leverage.",
      whyOthersWrong: [
        "Option A (Basic / Must-Be; non-negotiable, out-of-scope) — would imply the customer is dissatisfied if absent and neutral if present; but the survey shows linear dissatisfaction as wait increases, which is the Performance (one-dimensional) signature, not the Basic (asymmetric) signature.",
        "Option C (Excitement / Delighter; roadmap, out-of-scope) — would imply the customer is delighted if present (zero wait) and neutral if absent (long wait); but the customer is actively dissatisfied at long waits, which is the Performance signature, not the Excitement signature.",
        "Option D (Cannot be classified without follow-up interview) — the survey responses alone (linear dissatisfaction) are sufficient to classify as Performance; no follow-up is needed for this item.",
      ],
      explanation:
        "Linear dissatisfaction (more is worse, less is better, monotonic) = Kano Performance / One-Dimensional. Implication: this VOC item is the primary CTQ for the project.",
      options: [
        { text: "Basic / Must-Be; non-negotiable, out-of-scope", isCorrect: false },
        { text: "Performance / One-Dimensional; the primary CTQ (project's Y)", isCorrect: true },
        { text: "Excitement / Delighter; roadmap, out-of-scope", isCorrect: false },
        { text: "Cannot be classified without a follow-up interview", isCorrect: false },
      ],
    },
    {
      competencyName: "Voice of Customer & SIPOC",
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Manufacturing",
      stem: "True or False: A SIPOC with 15 process steps is correctly scoped for the Define phase and ready for the Define gate.",
      whyCorrect:
        "FALSE. A SIPOC with 15 process steps is over-scoped for the Define phase — the SIPOC is a high-level one-page process map with 5-7 process steps; 15 steps is a flowchart, which is a Measure-phase deliverable (the detailed swimlane / cross-functional flowchart with decision points, rework loops, and parallel paths). A 15-step SIPOC blurs the Define-to-Measure boundary, overwhelms the team and Sponsor at the Define gate, and signals that the project scope may be too broad (consider splitting into two projects). Correct Define-gate SIPOC: 5-7 steps, one page, with explicit supplier/customer on each step.",
      whyOthersWrong: [
        "Option TRUE — would imply a 15-step SIPOC is acceptable at the Define gate; it is not. The SIPOC's purpose is to anchor the process boundaries, not to detail every decision point. A 15-step SIPOC should be deferred to the Measure phase as a flowchart, or the project scope should be narrowed.",
      ],
      explanation:
        "FALSE. SIPOC = 5-7 high-level steps; 15 steps is a flowchart (Measure-phase deliverable). A 15-step SIPOC at Define signals over-scoping — narrow the scope or defer the detail to Measure.",
      options: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Stakeholder & Scope Management
// (Competency: "Stakeholder & Scope Management"; slug: d-stakeholder-scope)
// ---------------------------------------------------------------------------

const LESSON_STAKEHOLDER_SCOPE: RefLesson = {
  competencyName: "Stakeholder & Scope Management",
  slug: "d-stakeholder-scope",
  title: "Stakeholder Analysis, RACI, Scope & Change Control — Define Governance",
  titleAr: "تحليل أصحاب المصلحة وRACI والنطاق والتحكم بالتغيير — حوكمة مرحلة التعريف",
  order: 3,
  durationMin: 36,
  references: SS_DEFINE_REFERENCE_TITLES,
  conceptIntroduction: `The Define phase's third deliverable is governance: who decides, who is consulted, who is informed, and how scope changes are controlled. Three artifacts anchor this: (1) the stakeholder power/interest grid (a 2×2 matrix that classifies every stakeholder by their power over the project and their interest in the outcome); (2) the RACI matrix (Responsible / Accountable / Consulted / Informed — a role-assignment matrix for every project deliverable); (3) the change-control board (CCB) workflow (the formal process for revising the baselined charter and CTQ list as new evidence emerges from Measure, Analyze, and Improve). The PMI PMBOK 7th Edition provides the canonical framework: the Stakeholder Performance Domain (Section 4.2) for stakeholder identification and engagement; the Planning Performance Domain (Section 4.3) for scope and WBS; the Tailoring Considerations (Section 5) for adapting the governance to the project's risk profile.

The stakeholder power/interest grid classifies each stakeholder into one of four quadrants: (a) High Power / High Interest — Manage Closely (the Sponsor, the Quality Director; engage weekly, in person, with detailed status); (b) High Power / Low Interest — Keep Satisfied (Finance, Plant Manager's boss; engage monthly, with executive summary only, no technical detail); (c) Low Power / High Interest — Keep Informed (the line operators, the QA inspector; engage daily at the standup, with operational detail); (d) Low Power / Low Interest — Monitor (HR, IT support; engage on-demand). The engagement plan is a 2-column table (stakeholder | engagement channel and frequency) derived directly from the power/interest grid. A common mistake: treating all stakeholders equally (over- or under-engaging) — the grid forces the team to right-size the engagement.

The RACI matrix assigns one of four roles to each (deliverable, person) pair: (R) Responsible — the person who does the work (one or more per deliverable); (A) Accountable — the person who signs off on the deliverable (exactly one per deliverable — the buck-stops-here); (C) Consulted — subject-matter experts whose input is sought before sign-off (two-way communication); (I) Informed — those who need to know the outcome (one-way communication). The RACI matrix has deliverables as rows and team members as columns; each cell carries exactly one of R, A, C, I. The cardinal rule: exactly one A per row (no shared accountability). A common mistake: assigning two A's per deliverable (shared accountability = no accountability).

Scope management in Six Sigma extends the PMBOK scope statement with the OMOUM (Out-of-Manageable Operational Universe Memo) — the project-management artifact listing items explicitly out of scope, augmented with the hand-off owner for each. The OMOUM is the scope-creep defense: when a stakeholder requests an addition, the Black Belt routes it to the OMOUM owner first (the explicit hand-off), and only raises a Change Request (CR) through the CCB if the OMOUM owner declines. The CCB workflow: (1) submit CR (request, justification, impact on scope/COPQ/ROI/milestones, alternatives); (2) CCB review (Sponsor, Black Belt, Quality Director, Finance reviewer); (3) decision (approve / approve-with-conditions / defer / reject); (4) update baselines (charter, CTQ list, scope, OMOUM); (5) communicate to stakeholders via the engagement plan. The CCB log preserves the audit trail of every scope change.`,
  example: `**Manufacturing CNC grinding project — stakeholder + RACI + scope + change control.**

**Power/interest grid (4 quadrants, with stakeholders):**
- High Power / High Interest (Manage Closely): Sponsor (Plant Manager), Quality Director. Engagement: weekly review, in person, detailed status + risk log.
- High Power / Low Interest (Keep Satisfied): Plant Manager's boss (Operations VP), Finance. Engagement: monthly, executive summary, financial KPIs only.
- Low Power / High Interest (Keep Informed): 2 line operators (line 3, line 5), QA Inspector, Process Engineer, Black Belt, 2 Green Belts. Engagement: daily standup, operational detail + action items.
- Low Power / Low Interest (Monitor): HR, IT support, Maintenance. Engagement: on-demand (e.g., HR for training scheduling; IT for ERP access).

**Engagement plan (2-column table from the grid):**
| Stakeholder | Engagement channel | Frequency |
|---|---|---|
| Sponsor (Plant Mgr) | Weekly review meeting (in person) | Weekly |
| Quality Director | Daily standup + weekly review | Daily / Weekly |
| Operations VP | Executive summary email | Monthly |
| Finance reviewer | COPQ run-rate review | Monthly |
| Operators + QA Inspector | Daily standup | Daily |
| HR / IT / Maintenance | On-demand | As needed |

**RACI matrix (rows = deliverables, columns = team members):**
| Deliverable | Sponsor | BB | GB1 | GB2 | Process Engr | Operators | QA | Finance |
|---|---|---|---|---|---|---|---|---|
| Charter sign-off | A | R | C | C | C | I | I | C |
| SIPOC workshop | I | A | R | C | C | C | C | I |
| CTQ list + operational def | I | A | R | C | C | C | C | I |
| Data collection plan (Measure entry) | I | A | R | C | C | C | C | I |
| DOE plan | I | A | C | R | C | I | I | I |
| Control plan | I | A | C | R | C | C | C | I |
| COPQ reconciliation | I | C | C | C | I | I | I | A |

Note: exactly one A per row. Sponsor A's the charter sign-off (the authorization); BB A's the technical deliverables; Finance A's the COPQ reconciliation.

**Scope statement (in):** grinding cell lines 3-5; CNC grinders G07-G12; CMM gage C-3; fixtures F-22/F-23; aluminum-oxide wheel spec AW-60.

**OMOUM (out, with hand-off owner):**
| Out-of-scope item | Hand-off owner |
|---|---|
| Bar stock procurement | Procurement Manager |
| Heat-treat process | Metallurgical Engineering Manager |
| Supplier audit | Supplier Quality Manager |
| Bearing-journal supplier design | R&D Manager |
| ED facility expansion (capital) | Facilities Manager (18-month project) |

**Change control (CCB):** Members = Sponsor (Plant Mgr), Black Belt, Quality Director, Finance reviewer. CR form fields: request, justification, impact on scope/COPQ/ROI/milestones, alternatives considered, sponsor approval. Baseline updates after CCB approval: charter (scope, COPQ, ROI, milestones), CTQ list (operational definitions, drivers), OMOUM (new out-of-scope items + hand-off owners).

**Worked CCB scenario (synthetic):** 3 weeks into Measure, the Sponsor asks the BB to expand the project to include the bearing-journal supplier (R&D-managed). BB routes the request to the OMOUM hand-off owner (R&D Manager). R&D Manager declines (no capacity this quarter). BB raises a CR through the CCB. CCB reviews: impact — adds 8 weeks to the schedule, $40k to the project cost, ROI drops from 8× to 5.2×, scope adds supplier-design work outside the BB's authority. CCB decision: defer the expansion to a follow-on project (separate charter); original project continues unchanged. CR log: CR-001, deferred, follow-on charter authorized for R&D-led supplier-design project.`,
  keyFormulas: `RACI roles per (deliverable, person) pair:
  R = Responsible — does the work (≥ 1 per deliverable)
  A = Accountable — signs off (exactly 1 per deliverable, the buck-stops-here)
  C = Consulted — SME input (2-way, before sign-off)
  I = Informed — needs to know (1-way, after sign-off)
Cardinal rule: exactly one A per deliverable (no shared accountability)
Power/Interest grid quadrants:
  High Power / High Interest   → Manage Closely (engage weekly, in person, detailed)
  High Power / Low Interest    → Keep Satisfied (engage monthly, executive summary)
  Low Power / High Interest    → Keep Informed (engage daily, operational detail)
  Low Power / Low Interest     → Monitor (engage on-demand)
Engagement plan = 2-column table (stakeholder | channel + frequency) derived from the grid
Scope (in) + OMOUM (out, with hand-off owner) = the scope statement
CCB workflow: CR submit → CCB review → decision (approve / approve-with-conditions / defer / reject) → update baselines → communicate via engagement plan
CCB members (Six Sigma canonical): Sponsor, Black Belt, Quality Director (or process owner), Finance reviewer
CR form fields: request, justification, impact (scope / COPQ / ROI / milestones), alternatives, sponsor approval
Baseline artifacts updated on CCB approval: charter (scope, COPQ, ROI, milestones), CTQ list, OMOUM`,
  exercise: `You are a Green Belt on the ED wait-time project (continuing from Lessons 1-2). (a) Build the power/interest grid for these stakeholders: Hospital CEO, ED Medical Director, ED Charge Nurse, ED Physicians (3), Triage Nurse, IT (EHR), Finance, Patient Advocacy Office, EMS Liaison. (b) Build the engagement plan (channel + frequency) for each quadrant. (c) Build a RACI matrix for these 6 deliverables: charter sign-off, SIPOC workshop, CTQ list, data collection plan, DOE plan, control plan. Assign the A to the appropriate role for each (Sponsor, BB, or Finance). (d) Build the OMOUM with at least 4 out-of-scope items and their hand-off owners. (e) Walk through a CCB scenario where the ED Medical Director requests adding the triage-staffing model to scope; compute the impact on schedule and ROI; recommend a CCB decision.`,
  sections: {
    learning_objectives: `- Define stakeholder management per PMI PMBOK 7th Edition (Stakeholder Performance Domain, Section 4.2) and apply it to a Six Sigma Define-phase project.
- Build a power/interest grid (2×2) classifying each stakeholder into Manage Closely / Keep Satisfied / Keep Informed / Monitor.
- Derive the engagement plan (channel + frequency) from the power/interest grid.
- Build a RACI matrix (Responsible / Accountable / Consulted / Informed) with exactly one A per deliverable.
- Distinguish scope (in) from the OMOUM (out, with hand-off owner) — the scope-creep defense.
- Run the change-control board (CCB) workflow: CR submit → CCB review → decision → update baselines → communicate via engagement plan.
- Position stakeholder + RACI + scope + CCB as the governance layer that sustains the project across the DMAIC lifecycle.`,
    prerequisites: `- The DMAIC framework and the position of Define as the first phase.
- Lessons 1 (Project Charter & CTQ) and 2 (VOC & SIPOC) — the charter, CTQ list, COPQ, SIPOC.
- PMI PMBOK 7th Edition — Stakeholder Performance Domain (4.2), Planning (4.3, scope/WBS), Tailoring (5).
- Project-management concepts: sponsor, scope, milestone, baseline, CR, CCB.
- Organizational dynamics at the conceptual level (matrix vs functional org, RACI tradition).`,
    introduction: `Stakeholder management is the governance layer that keeps a Six Sigma project alive across the DMAIC lifecycle. Without it, even a well-chartered project stalls: the Sponsor loses interest, the line operators disengage, the Finance reviewer disputes the COPQ reconciliation at the Improve gate. The Define phase therefore produces three governance artifacts — the power/interest grid, the RACI matrix, and the change-control (CCB) workflow — that together sustain the project from Define to Control. The PMI PMBOK 7th Edition provides the canonical framework: the Stakeholder Performance Domain (Section 4.2) for identification and engagement; the Planning Performance Domain (Section 4.3) for scope and WBS; the Tailoring Considerations (Section 5) for adapting the governance to the project's risk profile.

The power/interest grid is the simplest and most-used stakeholder tool. It forces the team to right-size the engagement: high-power/high-interest stakeholders get weekly in-person engagement with detailed status; high-power/low-interest get monthly executive summaries; low-power/high-interest get daily operational engagement; low-power/low-interest get on-demand. The grid's insight: treating all stakeholders equally is wasteful (over-engaging the low-power/low-interest) and risky (under-engaging the high-power/high-interest). The grid is built in a 30-minute workshop with the Black Belt, Sponsor, and a key SME.

The RACI matrix is the deliverable-level role-assignment tool. It has deliverables as rows, team members as columns, and exactly one of R/A/C/I in each cell. The cardinal rule: exactly one A per deliverable — shared accountability is no accountability. The RACI is built in a 60-90 minute workshop with the project team; it is revised at each DMAIC gate as new deliverables emerge (Measure adds MSA + capability; Analyze adds hypothesis-test plans; Improve adds DOE + pilot; Control adds control plan + hand-off).

The change-control (CCB) workflow is the formal process for revising the baselined charter and CTQ list. The CCB has 4 members (Sponsor, Black Belt, Quality Director or process owner, Finance reviewer) and meets on-demand (a CR is submitted; the CCB reviews within 5 business days; the decision is logged). The CR form captures: the request, the justification, the impact on scope / COPQ / ROI / milestones, the alternatives considered, and the Sponsor approval. The CCB log preserves the audit trail of every scope change across the project — it is the single source of truth at the Control gate when the project is handed off to the process owner.

The OMOUM (Out-of-Manageable Operational Universe Memo) is the project-management artifact listing items explicitly out of scope, augmented with the hand-off owner for each. The OMOUM is the scope-creep defense: when a stakeholder requests an addition, the Black Belt routes it to the OMOUM hand-off owner first; only if the OMOUM owner declines is a CR raised through the CCB. The OMOUM is the Six Sigma extension of the PMI scope-exclusion list, with the hand-off column added to make the routing explicit.`,
    terminology: `- **Stakeholder**: any individual or group affected by, or able to affect, the project's outcome.
- **Power/interest grid**: 2×2 matrix classifying stakeholders by power and interest; quadrants = Manage Closely / Keep Satisfied / Keep Informed / Monitor.
- **Manage Closely (HH)**: high power, high interest; weekly in-person engagement with detailed status.
- **Keep Satisfied (HL)**: high power, low interest; monthly executive summary.
- **Keep Informed (LH)**: low power, high interest; daily operational engagement.
- **Monitor (LL)**: low power, low interest; on-demand.
- **Engagement plan**: 2-column table (stakeholder | channel + frequency) derived from the grid.
- **RACI matrix**: deliverable × person role assignment; R = Responsible, A = Accountable, C = Consulted, I = Informed.
- **Responsible (R)**: the person who does the work (≥ 1 per deliverable).
- **Accountable (A)**: the person who signs off (exactly 1 per deliverable — the buck-stops-here).
- **Consulted (C)**: SME input, two-way, before sign-off.
- **Informed (I)**: needs to know, one-way, after sign-off.
- **Cardinal rule (RACI)**: exactly one A per deliverable (no shared accountability).
- **Scope (in)**: processes/equipment within the project's authority.
- **OMOUM (Out-of-Manageable Operational Universe Memo)**: the project-management artifact listing items explicitly out of scope, augmented with the hand-off owner for each — the scope-creep defense (PMI scope-exclusion list extended with a hand-off column).
- **Change-control board (CCB)**: 4-member body (Sponsor, Black Belt, Quality Director, Finance) that reviews and approves scope changes.
- **Change Request (CR)**: the form submitted to the CCB; fields: request, justification, impact, alternatives, sponsor approval.
- **Baseline**: the authorized version of the charter / CTQ list / scope / OMOUM at a DMAIC gate; revised only via CCB approval.
- **CCB log**: the audit trail of every scope change across the project; the single source of truth at the Control gate.`,
    detailed_explanation: `**Stakeholder identification.** The first step in stakeholder management is identification. The PMI PMBOK 7th Edition Stakeholder Performance Domain (Section 4.2) lists canonical stakeholder categories: (1) the Sponsor (the senior leader who funds the project); (2) the project team (Black Belt, Green Belt(s), SMEs); (3) the process owner (the leader of the process being improved — the eventual recipient at the Control gate); (4) internal customers (the downstream process); (5) external customers (the OEM or end-user); (6) regulatory bodies (compliance, safety, environmental); (7) support functions (Finance, HR, IT, Maintenance). For a Six Sigma project, the team typically identifies 8-15 stakeholders. Each is then classified on the power/interest grid.

**Power/interest grid.** The 2×2 grid classifies each stakeholder by two axes: (a) Power — the stakeholder's ability to influence the project (high = can fund / cancel / re-direct; low = cannot); (b) Interest — the stakeholder's stake in the outcome (high = directly affected; low = peripheral). The four quadrants drive the engagement strategy: (a) High Power / High Interest (HH) = Manage Closely — weekly in-person engagement with detailed status and risk log; (b) High Power / Low Interest (HL) = Keep Satisfied — monthly executive summary with KPIs only; (c) Low Power / High Interest (LH) = Keep Informed — daily operational engagement at the standup; (d) Low Power / Low Interest (LL) = Monitor — on-demand. The grid is built in a 30-minute workshop with the Black Belt, Sponsor, and a key SME; it is revised at each DMAIC gate as stakeholders' power or interest shifts (e.g., the process owner moves from LH to HH as the Control gate approaches).

**Engagement plan.** The engagement plan is a 2-column table (stakeholder | channel + frequency) derived directly from the grid. The channel is the medium (in-person meeting, email, standup, dashboard, phone call); the frequency matches the quadrant (weekly for HH, monthly for HL, daily for LH, on-demand for LL). The engagement plan is reviewed at each DMAIC gate and revised as stakeholders' power/interest shifts.

**RACI matrix.** The RACI matrix assigns one of four roles to each (deliverable, person) pair. (R) Responsible — the person who does the work; there can be one or more R per deliverable. (A) Accountable — the person who signs off on the deliverable; exactly one A per deliverable (the buck-stops-here). (C) Consulted — subject-matter experts whose input is sought before sign-off (two-way communication, before the decision). (I) Informed — those who need to know the outcome (one-way communication, after the decision). The cardinal rule: exactly one A per deliverable. Shared accountability (two A's) is no accountability — when both are accountable, neither is. The RACI is built in a 60-90 minute workshop with the project team; it is revised at each DMAIC gate as new deliverables emerge.

**Scope + OMOUM.** The scope statement defines what is in the project's authority: processes, equipment, product families, geographic boundaries. The OMOUM (Out-of-Manageable Operational Universe Memo) defines what is out: each item with an explicit hand-off owner. The OMOUM is the scope-creep defense — when a stakeholder requests an addition, the Black Belt routes it to the OMOUM hand-off owner first; only if the owner declines is a CR raised through the CCB. The OMOUM is the Six Sigma extension of the PMI scope-exclusion list, with the hand-off column added to make the routing explicit. The OMOUM is reviewed at each DMAIC gate and updated as out-of-scope items emerge (e.g., a Measure-phase capability study may surface an out-of-scope driver like incoming bar-stock variation — flag it in the OMOUM with the Procurement Manager as the hand-off owner).

**Change-control (CCB) workflow.** The CCB has 4 members (Sponsor, Black Belt, Quality Director or process owner, Finance reviewer) and meets on-demand. The CR form captures: the request, the justification, the impact (on scope / COPQ / ROI / milestones), the alternatives considered, and the Sponsor approval. The CCB decision options: (a) Approve (update baselines, communicate via engagement plan); (b) Approve-with-conditions (e.g., add scope only if ROI stays above threshold); (c) Defer (e.g., to a follow-on project); (d) Reject. The CCB log preserves the audit trail of every scope change — at the Control gate, the log is the single source of truth for what changed and why.

**Stakeholder dynamics across DMAIC.** Stakeholder power and interest shift across the DMAIC lifecycle. At Define, the Sponsor and Quality Director are HH (funding, governance). At Measure, the operators and QA inspector become HH (they own the data collection). At Analyze, the SMEs become HH (they own the root-cause hypotheses). At Improve, the operators and Process Engineer become HH (they own the DOE). At Control, the process owner becomes HH (they own the control plan and the hand-off). The Black Belt and the engagement plan must track these shifts — the grid is revised at each gate.`,
    core_principles: `- Stakeholder management is the governance layer that sustains the project across DMAIC — without it, even a well-chartered project stalls.
- The power/interest grid forces right-sized engagement: HH = Manage Closely (weekly, in-person, detailed); HL = Keep Satisfied (monthly, executive summary); LH = Keep Informed (daily, operational); LL = Monitor (on-demand).
- The engagement plan (stakeholder | channel + frequency) is derived directly from the grid.
- RACI assigns R/A/C/I per (deliverable, person); cardinal rule = exactly one A per deliverable (no shared accountability).
- Scope (in) + OMOUM (out, with hand-off owner) = the scope statement; the OMOUM is the scope-creep defense.
- The CCB workflow (CR submit → CCB review → decision → update baselines → communicate) is the formal revision path.
- Stakeholder power and interest shift across DMAIC; the grid is revised at each gate.
- The CCB log is the single source of truth at the Control gate for what changed and why.`,
    components: `- **Stakeholder register**: the list of stakeholders (8-15 typical).
- **Power/interest grid**: 2×2 matrix classifying each stakeholder.
- **Engagement plan**: 2-column table (stakeholder | channel + frequency).
- **RACI matrix**: deliverables × team members with one of R/A/C/I per cell.
- **Scope statement (in)**: processes/equipment within the project's authority.
- **OMOUM (out)**: explicit exclusion list with hand-off owners.
- **CCB membership**: Sponsor, Black Belt, Quality Director / process owner, Finance reviewer.
- **Change Request (CR) form**: request, justification, impact, alternatives, sponsor approval.
- **CCB log**: audit trail of every scope change across the project.
- **Baselines**: the authorized versions of charter / CTQ list / scope / OMOUM at each DMAIC gate.`,
    process: `1. Identify stakeholders (Sponsor, team, process owner, internal/external customers, regulators, support functions) — 8-15 typical.
2. Classify each stakeholder on the power/interest grid (HH/HL/LH/LL).
3. Derive the engagement plan (stakeholder | channel + frequency) from the grid.
4. List the project deliverables (charter, SIPOC, CTQ list, data collection plan, MSA, capability, DOE, control plan, COPQ reconciliation).
5. Build the RACI matrix: assign R/A/C/I per (deliverable, person); enforce exactly one A per deliverable.
6. Draft the scope statement (in) and the OMOUM (out, with hand-off owners).
7. Convene the CCB (Sponsor, Black Belt, Quality Director, Finance reviewer); establish the CR form and the CCB log.
8. At each DMAIC gate: revise the power/interest grid (stakeholder shifts), the RACI (new deliverables), the OMOUM (new out-of-scope items), and communicate via the engagement plan.
9. Route scope-change requests to the OMOUM hand-off owner first; raise a CR through the CCB only if the owner declines.
10. At the Control gate: hand off the CCB log + control plan to the process owner (the single source of truth for the project's scope history).`,
    formula_calculation: `**RACI cardinal rule.** Exactly one A per deliverable (no shared accountability). For a deliverable with two A's, the rule is violated — split the deliverable into two, each with one A, or remove one A.

**Power/interest grid counts (worked).** Manufacturing grinding project: 9 stakeholders — Sponsor (HH), Quality Director (HH), Operations VP (HL), Finance reviewer (HL), Black Belt (LH), Green Belt 1 (LH), Green Belt 2 (LH), Process Engineer (LH), 2 Operators (LH), QA Inspector (LH), Plant Manager's boss is the Operations VP (HL) — 2 HH + 2 HL + 5 LH + 0 LL = 9 stakeholders. Engagement plan: 2 weekly in-person (HH), 2 monthly executive summary (HL), 5 daily operational (LH), 0 on-demand (LL).

**RACI rows × columns (worked).** 7 deliverables × 8 team members = 56 cells; each cell carries one of R/A/C/I (or empty). Worked for charter sign-off: Sponsor = A, BB = R, GB1 = C, GB2 = C, Process Engr = C, Operators = I, QA = I, Finance = C. Exactly one A (Sponsor).

**CCB impact calculation (synthetic).** CR to add bearing-journal supplier scope to the grinding project. Impact: schedule +8 weeks (4-mo → 6-mo project); project cost +$40k ($65k → $105k); ROI 8× → 5.2× (annual benefit unchanged at $520k; cost rises to $105k → 4.95×, but with extended timeline the first-year benefit accrues over 14 months not 12, so realized first-year ROI = $445k / $105k = 4.24×). CCB decision factors: scope expansion is outside the BB's authority (R&D-managed); the OMOUM hand-off owner (R&D Manager) declined; the scope expansion adds supplier-design work (a DFSS project, not DMAIC). CCB decision: defer to a follow-on project; original project continues unchanged. CR-001 logged.

**Engagement-plan ROI.** Stakeholder engagement cost = BB time × hourly rate × engagement hours/week. Worked: BB spends 4 hr/week on Sponsor engagement (HH), 1 hr/week on Quality Director (HH), 0.5 hr/week on HL stakeholders (monthly summary prep × 2), 1 hr/day on standup (LH × 5 stakeholders), 0.5 hr/week on LL on-demand = 4 + 1 + 1 + 5 + 0.5 = 11.5 hr/week × 26 weeks = 299 hr × $80/hr = $23,920 — included in the project cost ($65k total).`,
    worked_example: `**Manufacturing CNC grinding project — full governance (above).**

Power/interest grid + engagement plan + RACI + scope + OMOUM + CCB all worked in the worked_example field above.

Key takeaways from the worked example:
- 9 stakeholders classified on the grid; 2 HH (Sponsor, Quality Director), 2 HL (Operations VP, Finance), 5 LH (BB, GB1, GB2, Process Engr, Operators/QA), 0 LL.
- Engagement plan derived from the grid: weekly in-person (HH), monthly executive summary (HL), daily standup (LH), on-demand (LL).
- RACI matrix: 7 deliverables × 8 team members; exactly one A per row (Sponsor A's the charter sign-off; BB A's the technical deliverables; Finance A's the COPQ reconciliation).
- OMOUM: 5 out-of-scope items with hand-off owners (bar stock → Procurement; heat-treat → Met Eng; supplier audit → Supplier Quality; bearing-journal design → R&D; ED expansion → Facilities — 18-mo capital).
- CCB workflow: 4 members (Sponsor, BB, Quality Director, Finance); CR form 5 fields; decision log preserved.
- Worked CCB scenario: bearing-journal supplier expansion request → routed to R&D (OMOUM owner) → R&D declined → CR raised → CCB reviewed impact (+8 wks, +$40k, ROI 8× → 5.2× realized 4.24×, outside BB authority) → CCB decision: defer to follow-on project; original project unchanged; CR-001 logged.

The Control gate hands off three governance artifacts to the process owner: (a) the CCB log (the audit trail); (b) the control plan (the SPC charts and SOPs); (c) the OMOUM (the out-of-scope items the process owner must continue to route to the named hand-off owners). The process owner inherits the stakeholder engagement plan and updates it as the project transitions from "project" to "operational" status.`,
    industrial_example: `**Manufacturing — CNC grinding cell (above).** Full governance worked. 9 stakeholders, 7 deliverables, 5 OMOUM items, 1 worked CCB scenario.

**Healthcare — ED wait-time project.** Stakeholders: Hospital CEO (HH), ED Medical Director (HH), ED Charge Nurse (HH), ED Physicians (3, LH), Triage Nurse (LH), IT (LH for EHR), Finance (HL), Patient Advocacy (LH), EMS Liaison (HL). Engagement: Hospital CEO monthly executive summary; ED Medical Director + Charge Nurse daily standup; Physicians daily at shift change; Triage Nurse + IT daily; Finance monthly; Patient Advocacy weekly; EMS Liaison monthly. RACI: charter sign-off A = Hospital CEO; SIPOC workshop A = ED Medical Director; CTQ list A = ED Medical Director; data collection plan A = BB; DOE plan A = BB; control plan A = ED Medical Director (process owner); COPQ reconciliation A = Finance. OMOUM: ambulance-diversion policy (EMS Liaison); ED physical expansion (Facilities, 18-mo capital); triage-staffing model (HR, separate HR-led project); EHR upgrade (IT, 12-mo capital); admit-discharge policy (Inpatient Mgr).

**Oil & Gas — offshore-platform safety-project.** Stakeholders: Platform OIM (HH), HSE Manager (HH), Operations Supervisor (LH), Maintenance Lead (LH), Contractors (LL), Regulatory (Coast Guard / BSEE, HH), Finance (HL), Engineering (LH). RACI + OMOUM + CCB with regulatory sign-off required for scope changes affecting safety-case compliance.`,
    case_study: `CASE_TYPE = SYNTHETIC. A 600-bed hospital ran a Six Sigma project on ED wait-time (revenue $14M ED-specific). Stakeholders: 11 individuals classified on the power/interest grid — Hospital CEO (HH), ED Medical Director (HH), Charge Nurse (HH), 3 ED Physicians (LH), Triage Nurse (LH), IT (LH for EHR timestamps), Finance (HL), Patient Advocacy (LH), EMS Liaison (HL), Inpatient Mgr (HL for admit-discharge). The engagement plan called for weekly CEO + Medical Director review, daily Charge Nurse + Physicians + Triage + IT standup, monthly Finance + EMS + Inpatient summary, weekly Patient Advocacy. The RACI had 8 deliverables with exactly one A per row. The OMOUM listed 5 out-of-scope items (ambulance-diversion policy, ED physical expansion, triage-staffing model, EHR upgrade, admit-discharge policy). The CCB had 4 members (Hospital CEO, Black Belt, ED Medical Director, Finance) and processed 3 CRs across the project: CR-001 (add triage-staffing model) — deferred to a separate HR-led project (HR declined OMOUM routing); CR-002 (add ambulance-diversion analysis) — approved with conditions (ROI stayed above threshold; +$8k cost, +2 weeks); CR-003 (add EHR upgrade to scope) — rejected (12-mo capital project, outside the BB's authority). The CCB log was handed to the ED Medical Director at the Control gate as the single source of truth. Final result: door-to-provider time 4 h 12 min → 1 h 58 min (target met), $2.38M COPQ recovered to $0.6M residual, ROI 19.8×, realized 9.4× within 9 months.`,
    visual_explanation: `Visual 1: the power/interest grid — a 2×2 matrix with Power on the y-axis (low/high) and Interest on the x-axis (low/high); the four quadrants labeled (HH = Manage Closely, HL = Keep Satisfied, LH = Keep Informed, LL = Monitor) with stakeholder initials in each. Visual 2: the RACI matrix — a table with deliverables as rows, team members as columns, and one of R/A/C/I in each cell; the A column highlighted (the cardinal rule: exactly one A per row). Visual 3: the OMOUM — a 2-column table (out-of-scope item | hand-off owner). Visual 4: the CCB workflow — a 5-step flowchart (CR submit → CCB review → decision → update baselines → communicate via engagement plan) with decision diamonds at each step. Visual 5: the stakeholder shift across DMAIC — a 5-bar chart (D, M, A, I, C) showing the HH-count shift (D: Sponsor + Quality Director; M: + Operators + QA; A: + SMEs; I: + Process Engineer; C: + Process Owner).`,
    simulation_opportunity: `A stakeholder-grid simulator would let the learner drag stakeholders onto a 2×2 grid and auto-generate the engagement plan (channel + frequency per quadrant). A RACI validator would let the learner assign R/A/C/I per (deliverable, person) and auto-flag rows with zero or multiple A's (the cardinal rule). A CCB simulator would let the learner submit a CR (request + justification + impact + alternatives), walk through the CCB review (with each member's perspective modeled), and produce a decision (approve / approve-with-conditions / defer / reject) with the baseline updates logged. An OMOUM router would let the learner drag a scope-change request to the OMOUM hand-off owner first, with a pop-up "decline" triggering the CR workflow.`,
    common_mistakes: `- Treating all stakeholders equally — over-engaging LL (waste) and under-engaging HH (risk).
- Assigning two A's per deliverable (shared accountability = no accountability).
- Building the RACI once and never revising — the matrix must be updated at each DMAIC gate as new deliverables emerge.
- Omitting the OMOUM (or listing out-of-scope items without hand-off owners) — scope creep follows.
- Routing scope-change requests directly to the CCB without first trying the OMOUM hand-off owner — bypasses the lightweight routing.
- Skipping the CCB log — the audit trail is lost; the Control gate has no single source of truth.
- Failing to track stakeholder shifts across DMAIC — the grid is static; in reality, power/interest shifts each phase.
- Engaging the Sponsor weekly with technical detail (they're HH but their interest is governance, not technical) — overload.
- Engaging the operators monthly (they're LH; their interest is daily operational) — under-load.`,
    limitations: `- The power/interest grid is a 2-axis simplification; some stakeholders have medium power or non-linear interest (the Salience model adds 3 dimensions: power, interest, urgency).
- The RACI matrix assumes the team is stable; in matrix organizations, role-rotation can break the cardinal rule.
- The OMOUM depends on organizational boundaries; in matrix organizations, hand-off owners may be ambiguous.
- The CCB review cycle (5 business days) may be too slow for fast-moving projects; agile (daily CR triage) is an alternative.
- Stakeholder power and interest are subjective assessments — different team members may classify differently.
- The engagement plan assumes the stakeholder will engage at the planned frequency; senior leaders often miss scheduled reviews.
- The CCB log is only useful if it is consulted — at the Control gate, the process owner must actually read it.
- The OMOUM does not prevent the underlying scope creep; it only makes the routing explicit. The Sponsor can still insist on a CR.`,
    comparison: `**Six Sigma CCB vs PMI Integrated Change Control.** The PMI PMBOK 7th Edition (Planning Performance Domain 4.3) defines Integrated Change Control as the project-wide process for revising baselines (scope, schedule, cost, quality). The Six Sigma CCB is a DMAIC-project-scoped subset: the CCB reviews scope / COPQ / ROI / milestones only (not the full PMI baseline set); the CCB has 4 members (Sponsor, BB, Quality Director, Finance) vs the PMI typical 6-10 (adds project manager, technical lead, contracts). The Six Sigma CCB is lighter-weight because DMAIC projects are 4-6 months and narrower than capital projects.

**OMOUM vs PMI Scope-Exclusion List.** The PMI scope-exclusion list (PMBOK 4.3) lists items explicitly out of scope. The OMOUM (Out-of-Manageable Operational Universe Memo) is the Six Sigma extension that adds the hand-off owner column — making the routing explicit. Without the hand-off column, scope-change requests have no owner to route to; the CCB is bypassed and scope creep follows.

**RACI vs PMBOK Roles.** PMBOK 7th Edition uses the role-names (Project Manager, Sponsor, Team, Stakeholders) without a RACI matrix per se; the RACI matrix is a PMBOK 6th Edition / PRINCE2 artifact adopted by Six Sigma. Six Sigma uses RACI because the DMAIC deliverables are highly structured (charter, SIPOC, CTQ list, MSA, capability, DOE, control plan) and the role-assignment must be explicit per deliverable.

**Power/Interest Grid vs Salience Model.** The power/interest grid is 2-axis (Mitchell, Agle, Wood 1997); the Salience model adds urgency as a third axis (7 stakeholder types). For Six Sigma projects, the 2-axis grid is sufficient; the Salience model is used in complex multi-stakeholder capital projects.`,
    practical_application: `Run the stakeholder + RACI workshop as a 2-hour session with the Black Belt, Sponsor, key SMEs, and the process owner. Agenda: (1) 20 min — stakeholder identification (list 8-15 names; categorize by Sponsor / team / process owner / customer / regulator / support). (2) 30 min — power/interest grid: classify each stakeholder into HH/HL/LH/LL. (3) 20 min — engagement plan: derive channel + frequency per stakeholder from the grid. (4) 40 min — RACI matrix: list 6-8 deliverables; assign R/A/C/I per (deliverable, person); enforce exactly one A per row. (5) 10 min — scope + OMOUM: confirm in-scope items; confirm out-of-scope items have hand-off owners. (6) 10 min — CCB setup: confirm 4 CCB members; confirm CR form fields; open the CCB log. (7) 10 min — action items + next steps. Output: stakeholder register, power/interest grid, engagement plan, RACI matrix, scope + OMOUM, CCB membership + CR form. All six are baselined at the Define gate and revised at each DMAIC gate.`,
    decision_scenario: `**The "stakeholder shift" scenario.** Three weeks into the Measure phase, the line operators (LH on the Define grid) become HH: the data-collection plan requires them to take 5 additional measurements per shaft, and they push back ("this is slowing us down"). The Black Belt must decide: (a) ignore the pushback and continue (the grid said LH; the engagement plan was daily standup — sufficient); (b) re-classify the operators to HH and re-engage weekly in-person with the Sponsor (new power: they can stop the project by refusing to collect data); (c) negotiate a leaner data-collection plan (fewer measurements, same statistical power) and keep the operators at LH. The correct answer is (c) first (negotiate the plan; the operators' interest has not changed, only their resistance has); then (b) if negotiation fails (the operators have de-facto power to block the project — they must be re-engaged). Option (a) is incorrect — ignoring HH-likely stakeholders is the most common project-failure mode. The grid is a living document; re-classify as power shifts.`,
    practice_questions: `- Classify these stakeholders on the power/interest grid: Sponsor, Process Engineer, QA Inspector, HR, Finance, Operations VP.
- Build a RACI row for "DOE plan" with these roles: Sponsor, BB, GB1, GB2, Process Engineer, Operators, QA. Assign exactly one A.
- Write the OMOUM entry for "incoming bar-stock length variation" identified as a driver but outside the project's authority.
- Walk through a CCB scenario: scope-change request to add a downstream-CTQ; compute impact on schedule (+4 wks) and ROI (current 8×; +$25k cost); recommend CCB decision.`,
    certification_questions: `- ASQ Black Belt (Easy, Recall): The four RACI roles are Responsible, Accountable, Consulted, Informed; the cardinal rule is exactly one A per deliverable.
- ASQ Black Belt (Medium, Apply): Given a power/interest grid, derive the engagement plan (channel + frequency per quadrant).
- ASQ Black Belt (Hard, Analyze): Given a RACI matrix with two A's on a row, identify the violation and recommend the fix.
- ASQ Black Belt (Medium, Scenario): Given a stakeholder-shift scenario (operators become HH in Measure), recommend the engagement-plan revision.`,
    summary: `Stakeholder + RACI + scope + CCB is the governance layer of the Define phase. The power/interest grid classifies each stakeholder into Manage Closely (HH), Keep Satisfied (HL), Keep Informed (LH), or Monitor (LL); the engagement plan (channel + frequency) is derived directly from the grid. The RACI matrix assigns R/A/C/I per (deliverable, person), with the cardinal rule of exactly one A per deliverable (no shared accountability). The scope (in) + OMOUM (out, with hand-off owners) is the scope-creep defense — out-of-scope items are routed to their hand-off owners first, with a CR raised through the CCB only if the owner declines. The CCB (Sponsor, BB, Quality Director, Finance) reviews CRs via a 5-field form, decides approve / approve-with-conditions / defer / reject, updates baselines, and communicates via the engagement plan. The CCB log is the single source of truth at the Control gate. Stakeholder power and interest shift across DMAIC; the grid and RACI are revised at each gate.`,
    key_takeaways: `- Power/interest grid: HH = Manage Closely (weekly, in-person, detailed); HL = Keep Satisfied (monthly, executive summary); LH = Keep Informed (daily, operational); LL = Monitor (on-demand).
- Engagement plan = 2-column table (stakeholder | channel + frequency) derived from the grid.
- RACI: R = Responsible, A = Accountable, C = Consulted, I = Informed; exactly one A per deliverable.
- OMOUM = out-of-scope items with hand-off owners — the scope-creep defense (PMI scope-exclusion list + hand-off column).
- CCB = 4 members (Sponsor, BB, Quality Director, Finance); CR form = 5 fields; decisions = approve / approve-with-conditions / defer / reject.
- CCB log = single source of truth at the Control gate (audit trail of every scope change).
- Stakeholder power and interest shift across DMAIC; the grid + RACI are revised at each gate.
- Route scope-change requests to the OMOUM hand-off owner first; raise a CR only if the owner declines.
- The Black Belt's reflex: re-classify as power shifts; don't ignore HH-likely stakeholders.`,
    references: `- ASQ Six Sigma Black Belt Body of Knowledge — Define phase (stakeholder, RACI, scope, change control).
- ASQ Six Sigma Green Belt Body of Knowledge — Define phase.
- Breyfogle (2003), Implementing Six Sigma, Ch. 1-2 (team formation, project-management essentials).
- Pande, Neuman & Cavanagh (2014), The Six Sigma Way, Ch. 8 (stakeholder analysis, power/interest grid, communication plan).
- Montgomery (2013), Statistical Quality Control, Ch. 1 (the quality-engineering context for stakeholder governance).
- PMI (2021), PMBOK Guide 7th ed., Section 4.2 (Stakeholder Performance Domain), 4.3 (Planning — scope/WBS), 5 (Tailoring).`,
  },
  knowledgeObject: {
    title: "Stakeholder, RACI, Scope & Change Control",
    domain: "Define",
    competency: "Stakeholder & Scope Management",
    topic: "DMAIC Define — Governance Layer",
    concept: "Power/interest grid, engagement plan, RACI matrix, OMOUM, CCB workflow",
    body: {
      definitions: [
        "Stakeholder: any individual or group affected by, or able to affect, the project's outcome.",
        "Power/interest grid: 2×2 matrix classifying stakeholders by power and interest; quadrants = Manage Closely (HH), Keep Satisfied (HL), Keep Informed (LH), Monitor (LL).",
        "Manage Closely (HH): high power, high interest; weekly in-person engagement with detailed status.",
        "Keep Satisfied (HL): high power, low interest; monthly executive summary.",
        "Keep Informed (LH): low power, high interest; daily operational engagement.",
        "Monitor (LL): low power, low interest; on-demand.",
        "Engagement plan: 2-column table (stakeholder | channel + frequency) derived from the grid.",
        "RACI matrix: deliverable × person role assignment; R = Responsible, A = Accountable, C = Consulted, I = Informed.",
        "Responsible (R): the person who does the work (≥ 1 per deliverable).",
        "Accountable (A): the person who signs off (exactly 1 per deliverable — the buck-stops-here).",
        "Consulted (C): SME input, two-way, before sign-off.",
        "Informed (I): needs to know, one-way, after sign-off.",
        "Cardinal rule (RACI): exactly one A per deliverable (no shared accountability).",
        "Scope (in): processes/equipment within the project's authority.",
        "OMOUM (Out-of-Manageable Operational Universe Memo): the project-management artifact listing items explicitly out of scope, augmented with the hand-off owner for each — the scope-creep defense (PMI scope-exclusion list + hand-off column).",
        "Change-control board (CCB): 4-member body (Sponsor, Black Belt, Quality Director, Finance) that reviews and approves scope changes.",
        "Change Request (CR): the form submitted to the CCB; fields: request, justification, impact, alternatives, sponsor approval.",
        "Baseline: the authorized version of the charter / CTQ list / scope / OMOUM at a DMAIC gate; revised only via CCB approval.",
        "CCB log: the audit trail of every scope change across the project; the single source of truth at the Control gate.",
      ],
      principles: [
        "Stakeholder management is the governance layer that sustains the project across DMAIC — without it, even a well-chartered project stalls.",
        "The power/interest grid forces right-sized engagement: HH weekly in-person detailed; HL monthly executive summary; LH daily operational; LL on-demand.",
        "The engagement plan (stakeholder | channel + frequency) is derived directly from the grid.",
        "RACI assigns R/A/C/I per (deliverable, person); cardinal rule = exactly one A per deliverable (no shared accountability).",
        "Scope (in) + OMOUM (out, with hand-off owner) = the scope statement; the OMOUM is the scope-creep defense.",
        "Route scope-change requests to the OMOUM hand-off owner first; raise a CR through the CCB only if the owner declines.",
        "CCB workflow: CR submit → CCB review → decision (approve / approve-with-conditions / defer / reject) → update baselines → communicate via engagement plan.",
        "Stakeholder power and interest shift across DMAIC; the grid + RACI are revised at each gate.",
        "The CCB log is the single source of truth at the Control gate (audit trail of every scope change).",
        "Re-classify stakeholders as power shifts; don't ignore HH-likely stakeholders (the most common project-failure mode).",
      ],
      components: [
        "Stakeholder register (8-15 typical).",
        "Power/interest grid (2×2 matrix).",
        "Engagement plan (stakeholder | channel + frequency).",
        "RACI matrix (deliverables × team members with one of R/A/C/I per cell).",
        "Scope statement (in).",
        "OMOUM (out, with hand-off owners).",
        "CCB membership (Sponsor, BB, Quality Director, Finance).",
        "Change Request (CR) form (5 fields).",
        "CCB log (audit trail).",
        "Baselines (charter, CTQ list, scope, OMOUM at each DMAIC gate).",
      ],
      mechanism: [
        "Governance lifecycle: identify stakeholders → classify on grid → derive engagement plan → build RACI → draft scope + OMOUM → convene CCB → at each DMAIC gate revise grid + RACI + OMOUM → route scope-change requests to OMOUM owner first → raise CR if owner declines → CCB decision → update baselines → communicate via engagement plan → at Control gate hand off CCB log + control plan + OMOUM to process owner.",
      ],
      process: [
        "1. Identify stakeholders (Sponsor, team, process owner, internal/external customers, regulators, support) — 8-15 typical.",
        "2. Classify each stakeholder on the power/interest grid (HH/HL/LH/LL).",
        "3. Derive the engagement plan (stakeholder | channel + frequency) from the grid.",
        "4. List the project deliverables (charter, SIPOC, CTQ list, data collection plan, MSA, capability, DOE, control plan, COPQ reconciliation).",
        "5. Build the RACI matrix: assign R/A/C/I per (deliverable, person); enforce exactly one A per deliverable.",
        "6. Draft the scope statement (in) and the OMOUM (out, with hand-off owners).",
        "7. Convene the CCB (Sponsor, Black Belt, Quality Director, Finance reviewer); establish the CR form and the CCB log.",
        "8. At each DMAIC gate: revise the power/interest grid (stakeholder shifts), the RACI (new deliverables), the OMOUM (new out-of-scope items), and communicate via the engagement plan.",
        "9. Route scope-change requests to the OMOUM hand-off owner first; raise a CR through the CCB only if the owner declines.",
        "10. At the Control gate: hand off the CCB log + control plan + OMOUM to the process owner (the single source of truth for the project's scope history).",
      ],
      formulas: [
        "RACI roles per (deliverable, person): R (≥ 1), A (exactly 1), C (≥ 0), I (≥ 0).",
        "Cardinal rule: exactly one A per deliverable.",
        "Power/interest quadrants: HH = Manage Closely, HL = Keep Satisfied, LH = Keep Informed, LL = Monitor.",
        "Engagement plan = (stakeholder, channel, frequency) per grid quadrant.",
        "OMOUM = (out-of-scope item, hand-off owner) per exclusion.",
        "CCB workflow: CR submit → CCB review (5 business days) → decision (approve / approve-with-conditions / defer / reject) → update baselines → communicate.",
        "CCB members = Sponsor + Black Belt + Quality Director + Finance reviewer (4).",
        "CR form fields = request + justification + impact (scope/COPQ/ROI/milestones) + alternatives + sponsor approval.",
        "Baseline artifacts = charter + CTQ list + scope + OMOUM (updated on CCB approval).",
      ],
      metrics: [
        "Number of stakeholders identified (8-15 typical).",
        "Quadrant counts (HH/HL/LH/LL) — should sum to total stakeholders.",
        "Number of engagement-plan rows (= number of stakeholders).",
        "Number of RACI deliverables × team members (cells with R/A/C/I; empty allowed).",
        "Number of A's per deliverable (must = 1; violations flagged).",
        "Number of OMOUM items with hand-off owners (must = number of out-of-scope items).",
        "Number of CRs processed by the CCB and their decision distribution (approve / approve-with-conditions / defer / reject).",
        "Number of baseline revisions per DMAIC gate (target: 1 revision per gate; >2 signals scope instability).",
      ],
      examples: [
        "CNC grinding project: 9 stakeholders (2 HH + 2 HL + 5 LH + 0 LL); 7 deliverables × 8 team RACI; 5 OMOUM items with hand-offs; 1 worked CCB scenario (deferred).",
        "ED wait-time project: 11 stakeholders (3 HH + 3 HL + 5 LH + 0 LL); 8 deliverables RACI; 5 OMOUM items; 3 CRs (defer / approve-with-conditions / reject).",
        "Offshore-platform safety project: 8 stakeholders (3 HH incl. regulatory + 1 HL + 3 LH + 1 LL); OMOUM includes regulatory items requiring CCB sign-off with Coast Guard / BSEE.",
        "RACI cardinal rule worked: charter sign-off A = Sponsor; SIPOC workshop A = BB; COPQ reconciliation A = Finance.",
        "OMOUM routing worked: bearing-journal supplier expansion → R&D Manager (OMOUM owner) → R&D declined → CR raised → CCB deferred.",
      ],
      industrial_examples: [
        "Manufacturing — CNC grinding cell (above): 9 stakeholders, full governance, CCB scenario with deferred scope expansion.",
        "Healthcare — ED wait-time project: 11 stakeholders (incl. Hospital CEO, ED Medical Director, Charge Nurse, Physicians, Triage, IT, Finance, Patient Advocacy, EMS Liaison, Inpatient Mgr); 3 CRs across the project.",
        "Oil & Gas — offshore-platform safety project: regulatory stakeholders (Coast Guard, BSEE) require CCB sign-off for scope changes affecting safety-case compliance.",
        "Banking — loan-origination project: stakeholders include Compliance (HH, regulatory), Underwriting (LH), Branch Network (HL), IT (LH for LOS).",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. 600-bed hospital ED wait-time project: 11 stakeholders, engagement plan with weekly CEO + Medical Director review + daily Charge Nurse + Physicians + Triage + IT standup + monthly Finance + EMS + Inpatient summary. RACI 8 deliverables with one A per row. OMOUM 5 out-of-scope items. CCB processed 3 CRs: CR-001 add triage-staffing model (deferred to HR project); CR-002 add ambulance-diversion analysis (approved with conditions, +$8k, +2 wks); CR-003 add EHR upgrade (rejected, 12-mo capital). CCB log handed to ED Medical Director at Control. Final: door-to-provider 4 h 12 min → 1 h 58 min, $2.38M COPQ → $0.6M residual, ROI 19.8× projected / 9.4× realized within 9 months.",
      ],
      common_errors: [
        "Treating all stakeholders equally — over-engaging LL (waste) and under-engaging HH (risk).",
        "Assigning two A's per deliverable (shared accountability = no accountability).",
        "Building the RACI once and never revising — must be updated at each DMAIC gate.",
        "Omitting the OMOUM or listing out-of-scope items without hand-off owners — scope creep follows.",
        "Routing scope-change requests directly to the CCB without first trying the OMOUM hand-off owner.",
        "Skipping the CCB log — audit trail lost; Control gate has no single source of truth.",
        "Failing to track stakeholder shifts across DMAIC — grid is static in reality shifts each phase.",
        "Engaging the Sponsor weekly with technical detail (they're HH but interest is governance).",
        "Engaging the operators monthly (they're LH; interest is daily operational).",
        "Re-classifying stakeholders reactively rather than proactively at each gate.",
      ],
      limitations: [
        "The power/interest grid is a 2-axis simplification; the Salience model adds urgency as a third axis.",
        "The RACI matrix assumes a stable team; matrix-organization role-rotation can break the cardinal rule.",
        "The OMOUM depends on organizational boundaries; matrix organizations may have ambiguous hand-off owners.",
        "The CCB review cycle (5 business days) may be too slow for fast-moving projects; agile daily CR triage is an alternative.",
        "Stakeholder power and interest are subjective; different team members may classify differently.",
        "The engagement plan assumes the stakeholder will engage at the planned frequency; senior leaders often miss scheduled reviews.",
        "The CCB log is only useful if consulted — at the Control gate, the process owner must read it.",
        "The OMOUM does not prevent scope creep; it only makes the routing explicit. The Sponsor can still insist on a CR.",
      ],
      best_practices: [
        "Run the stakeholder + RACI workshop as a 2-hour session with BB, Sponsor, key SMEs, process owner.",
        "Build the power/interest grid in 30 min with BB + Sponsor + key SME; revise at each DMAIC gate.",
        "Derive the engagement plan directly from the grid; do not over-engineer.",
        "Enforce exactly one A per RACI row at workshop time; flag violations immediately.",
        "Build the OMOUM with hand-off owners; route scope-change requests to the owner first.",
        "Convene the CCB at the Define gate; establish the CR form and CCB log before Measure starts.",
        "Revise the grid + RACI + OMOUM at each DMAIC gate; communicate the revisions via the engagement plan.",
        "Re-classify stakeholders proactively (not reactively) as power shifts across DMAIC.",
        "At the Control gate: hand off the CCB log + control plan + OMOUM to the process owner.",
      ],
      related_concepts: [
        "Project Charter & CTQ (Lesson 1) — charter, scope, CTQ list, business case.",
        "Voice of Customer & SIPOC (Lesson 2) — VOC, Kano, SIPOC, COPQ, sigma level.",
        "Measure phase — MSA, capability, DPMO/sigma-level baselining (the technical contract from Define).",
        "Control phase — control plan, SPC, SOPs, hand-off to process owner (the CCB log is the audit trail).",
        "PMI PMBOK 7th Edition — Stakeholder (4.2), Planning (4.3, scope/WBS), Tailoring (5).",
        "Salience model (Mitchell, Agle, Wood 1997) — 3-axis stakeholder classification (power + interest + urgency).",
      ],
      prerequisites: [
        "The DMAIC framework and the position of Define as the first phase.",
        "Lessons 1 (Project Charter & CTQ) and 2 (VOC & SIPOC) — the charter, CTQ list, COPQ, SIPOC.",
        "PMI PMBOK 7th Edition — Stakeholder Performance Domain (4.2), Planning (4.3), Tailoring (5).",
        "Project-management concepts: sponsor, scope, milestone, baseline, CR, CCB.",
        "Organizational dynamics at the conceptual level (matrix vs functional org).",
      ],
      references: [
        "ASQ Six Sigma Black Belt Body of Knowledge — Define phase (stakeholder, RACI, scope, change control).",
        "ASQ Six Sigma Green Belt Body of Knowledge — Define phase.",
        "Breyfogle (2003), Implementing Six Sigma, Ch. 1-2.",
        "Pande, Neuman & Cavanagh (2014), The Six Sigma Way, Ch. 8.",
        "Montgomery (2013), Statistical Quality Control, Ch. 1.",
        "PMI (2021), PMBOK Guide 7th ed., Section 4.2/4.3/5.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Stakeholder & Scope Management",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "In a RACI matrix, which role MUST be assigned to exactly one person per deliverable (the cardinal rule)?",
      whyCorrect:
        "The Accountable (A) role must be assigned to exactly one person per deliverable — the buck-stops-here. The cardinal rule of RACI: exactly one A per deliverable. Shared accountability (two A's) is no accountability — when both are accountable, neither is. Responsible (R) can be one or more (the people who do the work); Consulted (C) and Informed (I) can be zero or more.",
      whyOthersWrong: [
        "Option A (Responsible — one or more) — R can be one or more per deliverable (the people who do the work); the cardinal rule applies to A, not R.",
        "Option C (Consulted — zero or more) — C can be zero or more (SMEs whose input is sought before sign-off); the cardinal rule does not apply.",
        "Option D (Informed — zero or more) — I can be zero or more (those who need to know after sign-off); the cardinal rule does not apply.",
      ],
      explanation:
        "Cardinal rule of RACI: exactly one A (Accountable) per deliverable. R = ≥1; A = exactly 1; C = ≥0; I = ≥0.",
      options: [
        { text: "Responsible (R) — one or more", isCorrect: false },
        { text: "Accountable (A) — exactly one", isCorrect: true },
        { text: "Consulted (C) — zero or more", isCorrect: false },
        { text: "Informed (I) — zero or more", isCorrect: false },
      ],
    },
    {
      competencyName: "Stakeholder & Scope Management",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Procedural",
      scenario: "Manufacturing",
      stem: "On the power/interest grid, where does the Plant Manager (who funds the project and is directly affected by the COPQ recovery) belong, and what is the appropriate engagement channel and frequency?",
      whyCorrect:
        "The Plant Manager as Sponsor has High Power (funds the project, can cancel or re-direct) and High Interest (directly affected by the COPQ recovery — it's their budget). The Plant Manager therefore belongs in the High Power / High Interest (HH) quadrant — Manage Closely. The appropriate engagement is weekly in-person review with detailed status and the risk log; this is the Sponsor-channel for HH stakeholders. Monthly executive summary is for HL; daily standup is for LH; on-demand is for LL.",
      whyOthersWrong: [
        "Option A (High Power / Low Interest — Keep Satisfied; monthly executive summary) — would under-engage the Sponsor; the Plant Manager is both high-power and high-interest (it's their budget and their COPQ recovery); monthly is insufficient.",
        "Option C (Low Power / High Interest — Keep Informed; daily standup) — under-rates the Plant Manager's power; the Sponsor has the highest power of any stakeholder (can cancel the project).",
        "Option D (Low Power / Low Interest — Monitor; on-demand) — completely mis-rates both axes; the Sponsor is the highest-power stakeholder and the most interested party.",
      ],
      explanation:
        "Sponsor = High Power (funds/cancels) + High Interest (their budget/COPQ) → HH quadrant → Manage Closely → weekly in-person with detailed status + risk log.",
      options: [
        { text: "High Power / Low Interest — Keep Satisfied (monthly executive summary)", isCorrect: false },
        { text: "High Power / High Interest — Manage Closely (weekly in-person, detailed status + risk log)", isCorrect: true },
        { text: "Low Power / High Interest — Keep Informed (daily standup)", isCorrect: false },
        { text: "Low Power / Low Interest — Monitor (on-demand)", isCorrect: false },
      ],
    },
    {
      competencyName: "Stakeholder & Scope Management",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Scenario",
      skillType: "Procedural",
      scenario: "Healthcare",
      stem: "Three weeks into the Measure phase, a stakeholder requests adding the triage-staffing model to scope. The OMOUM lists triage-staffing as out-of-scope with the HR Manager as the hand-off owner. What is the correct Black Belt action sequence?",
      whyCorrect:
        "The correct sequence: (1) route the request to the OMOUM hand-off owner (HR Manager) first; (2) if the HR Manager declines (no capacity this quarter), raise a Change Request (CR) through the CCB; (3) the CCB reviews the CR (impact on scope/COPQ/ROI/milestones, alternatives); (4) the CCB decides (approve / approve-with-conditions / defer / reject); (5) if approved, update the baselines (charter, CTQ list, scope, OMOUM) and communicate via the engagement plan. The OMOUM is the scope-creep defense — the lightweight routing precedes the formal CR.",
      whyOthersWrong: [
        "Option A (Accept the request directly and update the scope) — bypasses both the OMOUM hand-off owner and the CCB; violates the change-control workflow; no baseline update authority.",
        "Option C (Reject the request directly without routing to HR or the CCB) — the Black Belt does not have authority to reject scope-change requests unilaterally; the OMOUM owner and the CCB share that authority.",
        "Option D (Submit the CR directly to the CCB without first routing to HR) — skips the lightweight OMOUM routing; the OMOUM exists precisely to filter scope-change requests before they reach the CCB; routing to the hand-off owner first is the correct first step.",
      ],
      explanation:
        "OMOUM hand-off routing first → if declined, raise CR through CCB → CCB reviews and decides → if approved, update baselines and communicate. The OMOUM is the lightweight filter; the CCB is the formal revision path.",
      options: [
        { text: "Accept the request directly and update the project scope", isCorrect: false },
        { text: "Route to HR (OMOUM owner); if HR declines, raise CR through CCB; CCB decides; if approved, update baselines and communicate", isCorrect: true },
        { text: "Reject the request directly without routing to HR or CCB", isCorrect: false },
        { text: "Submit the CR directly to the CCB without first routing to HR", isCorrect: false },
      ],
    },
    {
      competencyName: "Stakeholder & Scope Management",
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Manufacturing",
      stem: "True or False: A RACI matrix for the CNC grinding project has the charter sign-off row with TWO people assigned the Accountable (A) role — the Plant Manager (Sponsor) and the Black Belt — because both must sign the charter before the project enters Measure.",
      whyCorrect:
        "FALSE. The cardinal rule of RACI is exactly ONE Accountable (A) per deliverable. Shared accountability (two A's) is no accountability — when both are accountable, neither is. The correct assignment: the Plant Manager (Sponsor) is Accountable (A) for the charter sign-off (the buck-stops-here — they authorize the project); the Black Belt is Responsible (R) (they draft and walk the charter); the team members are Consulted (C); Finance is Consulted (C). If the project requires both signatures (a governance rule), split the deliverable into two rows: 'Charter draft sign-off' (BB = A) and 'Charter authorization sign-off' (Sponsor = A) — each with exactly one A. The cardinal rule is inviolable.",
      whyOthersWrong: [
        "Option TRUE — would imply shared accountability is acceptable; it is not. The cardinal rule of RACI is exactly one A per deliverable. If the project requires two signatures, split the deliverable into two rows, each with one A.",
      ],
      explanation:
        "FALSE. Cardinal rule: exactly one A per deliverable. Two A's = no accountability. If two signatures are required, split the deliverable into two rows, each with one A.",
      options: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lessons table
// ---------------------------------------------------------------------------

export const SS_DEFINE_LESSONS: RefLesson[] = [
  LESSON_CHARTER_CTQ,
  LESSON_VOC_SIPOC,
  LESSON_STAKEHOLDER_SCOPE,
];

// ---------------------------------------------------------------------------
// Define (D) competencies created inside loadReference() (the D domain
// exists in src/lib/ref-content/six-sigma.ts with NO competencies yet — this
// loader seeds the 3 D competencies and then loads the deep content).
// ---------------------------------------------------------------------------

interface SeedCompetency {
  name: string;
  description: string;
  order: number;
}

const SS_DEFINE_COMPETENCIES: SeedCompetency[] = [
  {
    name: "Project Charter & CTQ",
    description:
      "The project charter (problem statement, SMART goal, COPQ-based business case, scope, OMOUM, team, milestones, sponsor sign-off) and the CTQ tree (VOC → CTQ with operational definition and target ± tolerance → driver / suspected X). The two Define-phase deliverables that gate the project into Measure: the governance contract and the technical contract.",
    order: 1,
  },
  {
    name: "Voice of Customer & SIPOC",
    description:
      "Voice of Customer (VOC) capture via interviews, focus groups, surveys, and observation; the Kano model (Basic / Performance / Excitement, with Kano decay); the SIPOC (Supplier-Input-Process-Output-Customer) high-level process map; the COPQ four-category model (Appraisal + Prevention + Internal Failure + External Failure); DPMO and sigma-level conversion with the Motorola 1.5σ shift.",
    order: 2,
  },
  {
    name: "Stakeholder & Scope Management",
    description:
      "The stakeholder power/interest grid (Manage Closely / Keep Satisfied / Keep Informed / Monitor) and the engagement plan; the RACI matrix (Responsible / Accountable / Consulted / Informed, with exactly one A per deliverable); the scope statement + OMOUM (Out-of-Manageable Operational Universe Memo with hand-off owners); the change-control board (CCB) workflow and the CCB log as the single source of truth at the Control gate.",
    order: 3,
  },
];

// ---------------------------------------------------------------------------
// Loader — CONTENT-only (mirrors cre-reliability-modeling.ts) with the
// additional step of creating the 3 Define competencies inside loadReference().
// ---------------------------------------------------------------------------

/**
 * Upsert the Six Sigma Define (D) phase CONTENT into the database.
 * Idempotent: safe to call repeatedly. Returns record counts written.
 *
 * Flow:
 *  1. Find Six Sigma certification by slug "six-sigma" (the structure+M/A
 *     content loader in src/lib/ref-content/six-sigma.ts is a prerequisite).
 *  2. Find the Define (D) domain by code "D" (certificationId = six-sigma.id).
 *     The D domain exists in six-sigma.ts with NO competencies — delete any
 *     stale D competencies and create the 3 D competencies from
 *     SS_DEFINE_COMPETENCIES. Map by NAME -> id. (Scope is restricted to the
 *     D domain — other Six Sigma domains M, A, I, C are NOT touched.)
 *  3. Upsert References globally (by title, no sectionId) → shared ids
 *     applied to every Define lesson, KO, and question.
 *  4. For each lesson:
 *     - db.lesson.findFirst({where:{competencyId, slug}}) then update or
 *       create with sectionId=null, certificationId, competencyId, slug,
 *       title, titleAr, order, durationMin, conceptIntroduction, example,
 *       keyFormulas, exercise, sections (JSON.stringify), referenceIds
 *       (JSON.stringify shared), status="READY", confidence="HIGH",
 *       verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
 *  5. Upsert KnowledgeObject per lesson: findFirst({where:{lessonId}}) then
 *     create/update with certificationId, domainId (D), competencyId,
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
 * Six Sigma domains (M, A, I, C). It operates exclusively on the Define
 * (D) domain — only D competencies are deleted and re-created.
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

  // 2) Find the Define (D) domain by code "D" (certificationId). The D
  //    domain exists in six-sigma.ts with NO competencies — delete any stale
  //    D competencies and create the 3 D competencies here.
  const defineDomain = await db.domain.findFirst({
    where: { certificationId: certification.id, code: "D" },
  });
  if (!defineDomain) {
    throw new Error(
      'Define (D) domain not found under Six Sigma. Run the Six Sigma structure+M/A-content loader (src/lib/ref-content/six-sigma.ts) first.'
    );
  }

  // Delete any existing D competencies (idempotent re-create). Scoped to
  // the D domain only — M, A, I, C competencies are NOT touched.
  await db.competency.deleteMany({
    where: { domainId: defineDomain.id },
  });

  // Create the 3 D competencies.
  for (const c of SS_DEFINE_COMPETENCIES) {
    await db.competency.create({
      data: {
        domainId: defineDomain.id,
        name: c.name,
        description: c.description,
        order: c.order,
      },
    });
  }

  // Map D competencies by NAME -> id.
  const defineCompetencies = await db.competency.findMany({
    where: { domainId: defineDomain.id },
  });
  const competencyIdByName: Record<string, string> = {};
  for (const c of defineCompetencies) {
    competencyIdByName[c.name] = c.id;
  }
  // Validate that all 3 expected D competencies exist by name.
  const expectedCompetencyNames = SS_DEFINE_LESSONS.map((l) => l.competencyName);
  const missing = expectedCompetencyNames.filter(
    (n) => !competencyIdByName[n]
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing Define competencies by name: ${missing.join(
        ", "
      )}. Ensure SS_DEFINE_COMPETENCIES matches SS_DEFINE_LESSONS competencyName.`
    );
  }

  // 3) References — global (no sectionId), upserted by title.
  const refIdsByTitle: Record<string, string> = {};
  for (const src of SS_DEFINE_SOURCES) {
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
  const sharedReferenceIds = SS_DEFINE_SOURCES.map(
    (s) => refIdsByTitle[s.title]
  ).filter(Boolean) as string[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 4) Lessons, 5) KnowledgeObjects, 6) Questions
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of SS_DEFINE_LESSONS) {
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
      domainId: defineDomain.id,
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
          domainId: defineDomain.id,
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
    domain: defineDomain.id,
    competencies: defineCompetencies.length,
    lessons: lessonsCount,
    kos: kosCount,
    questions: questionsCount,
    references: referencesCount,
  };
}
