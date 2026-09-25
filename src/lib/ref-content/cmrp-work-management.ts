/**
 * CMRP — Work Management pillar — Deep scientific reference (Task ID 12).
 *
 * Certification slug: "cmrp" (Certified Maintenance & Reliability Professional).
 * Domain code: "WM" (Work Management) — one of the 5 official SMRP CMRP pillars.
 *
 * Six lessons, one per Work Management competency (as seeded in
 * src/lib/ref-content/cmrp.ts):
 *   1. Planning                       (slug: wm-planning)
 *   2. Scheduling                      (slug: wm-scheduling)
 *   3. Work Execution                  (slug: wm-work-execution)
 *   4. CMMS                            (slug: wm-cmms)
 *   5. MRO Materials Management        (slug: wm-mro-materials)
 *   6. Measurements & Reporting        (slug: wm-measurements-reporting)
 *
 * Each lesson ships:
 *   - The full 24-section data-collector template (spec §9, LESSON_TEMPLATE in
 *     src/lib/spec.ts), with every applicable section filled with real,
 *     in-depth professional maintenance & reliability content. No padding.
 *   - A Knowledge Object body (spec §7, KO_FIELDS) with applicable arrays
 *     (definitions, principles, components, mechanism, process, formulas,
 *     metrics, examples, industrial_examples, case_studies, common_errors,
 *     limitations, best_practices, related_concepts, prerequisites,
 *     references) populated with real content.
 *   - 4–6 enriched questions (whyCorrect + one whyOthersWrong per distractor +
 *     cognitiveLevel + KO link + scenario/industry metadata), mixing MCQ and a
 *     few True/False, spanning Easy/Medium/Hard × Remember/Understand/Apply/
 *     Analyze. Total in this file: 30 questions.
 *
 * Source hierarchy (spec §5) — Levels 2, 3, 5, 7:
 *   - LEVEL 3 — Official BOK / Handbook / Exam Outline: SMRP CMRP BOK (WM),
 *     SMRP CMRP exam outline.
 *   - LEVEL 2 — Official Standard / Standards Organization: ISO 55000:2014,
 *     ISO 55001:2014, ISO 55002:2018.
 *   - LEVEL 7 — Technical Publications / Industry Sources: Mobley
 *     (Maintenance Engineering Handbook), Campbell & Jardine (Maintenance
 *     Strategy), Palmer (Maintenance Planning and Scheduling Handbook),
 *     Ledet (Maintenance Planning and Scheduling).
 *   - LEVEL 5 — Professional Organizations: O'Hanlon, Uptime (Industrial
 *     Press) — Maintenance Excellence / Asset Management context.
 *
 * Originality (spec §16): all worked examples, decision scenarios, case
 * studies, and questions are authored for this platform; textbook material
 * is summarized and cited, not reproduced. Case studies are SYNTHETIC and
 * explicitly marked `CASE_TYPE = SYNTHETIC` inside the lesson text.
 *
 * Lifecycle: every record (Lesson, KnowledgeObject, Question, Reference) is
 * upserted with status="READY", confidence="HIGH",
 * verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
 *
 * Loader flow (see loadReference below):
 *   1. Find CMRP certification by slug "cmrp".
 *   2. Find the WM domain by code "WM"; map its 6 competencies by NAME -> id.
 *   3. Upsert References globally (by title, no sectionId) -> shared
 *      referenceIds array applied to every WM lesson / KO / question.
 *   4. For each lesson: db.lesson.findFirst({where:{competencyId, slug}})
 *      then update or create (sectionId = null, certificationId set,
 *      competencyId set, sections JSON, lifecycle metadata).
 *   5. Upsert KnowledgeObject per lesson: findFirst({where:{lessonId}}) then
 *      create/update with certificationId, competencyId, lessonId, body JSON,
 *      lifecycle metadata.
 *   6. For each lesson: deleteMany questions scoped to
 *      {certificationId, competencyId} then create each enriched question
 *      with nested options, knowledgeObjectId link, whyCorrect,
 *      whyOthersWrong (JSON), referenceIds (JSON), lifecycle metadata.
 *   7. Return { lessons, kos, questions, references, competencies } counts.
 */

import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// Public types (matches the Task 12 brief)
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
  scenario?: string; // Manufacturing|Oil & Gas|Power|Container Terminal|Chemical|...
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
// Sources (Levels 2, 3, 5, 7 — real, widely-known references)
// ---------------------------------------------------------------------------

export const CMRP_WM_SOURCES: RefSource[] = [
  {
    title: "SMRP CMRP Body of Knowledge — Work Management pillar",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "BOK",
    url: "https://www.smrp.org/certification/cmrp-exam",
    citation:
      "Society for Maintenance & Reliability Professionals (SMRP). CMRP Body of Knowledge — Work Management pillar: Planning, Scheduling, Work Execution, CMMS Administration, MRO Materials Management, and Measurements & Reporting. The official competency framework assessed by the CMRP exam.",
  },
  {
    title: "SMRP CMRP Exam Outline",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "EXAM_OUTLINE",
    url: "https://www.smrp.org/certification",
    citation:
      "SMRP. Certified Maintenance & Reliability Professional (CMRP) Exam Outline — published content domain weights, question count, time limit, and passing-score guidance. Cross-references the five-pillar BOK and details the Work Management competencies tested.",
  },
  {
    title: "ISO 55000:2014 — Asset management — Overview, principles and terminology",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/55088.html",
    citation:
      "International Organization for Standardization. ISO 55000:2014, Asset management — Overview, principles and terminology. Geneva: ISO. Defines asset, asset management, asset management system, and the value-of-asset-management principles that frame CMRP Work Management.",
  },
  {
    title: "ISO 55001:2014 — Asset management — Management systems — Requirements",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/55090.html",
    citation:
      "International Organization for Standardization. ISO 55001:2014, Asset management — Management systems — Requirements. Geneva: ISO. The requirements standard against which asset management systems (incl. maintenance work management) are assessed.",
  },
  {
    title: "ISO 55002:2018 — Asset management — Guidelines for the application of ISO 55001",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/68034.html",
    citation:
      "International Organization for Standardization. ISO 55002:2018, Asset management — Guidelines for the application of ISO 55001. Geneva: ISO. Interpretive guidance for the asset-management-system requirements, incl. asset lifecycle and the planning/scheduling controls that operationalize them.",
  },
  {
    title: "Mobley — Maintenance Engineering Handbook (McGraw-Hill)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "HANDBOOK",
    citation:
      "Mobley, R. K. (2008). Maintenance Engineering Handbook (7th ed.). McGraw-Hill. ISBN 978-0-07-154358-0. Section II (Work-order system, planning & estimating), Section IV (Preventive maintenance), Section VII (MRO & inventory control). The widely-cited technical reference for the work-management cycle.",
  },
  {
    title: "Campbell & Jardine — Maintenance Strategy (Productivity Press)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Campbell, J. D. & Jardine, A. K. S. (2001). Maintenance Strategy: A World Class Approach to Asset Management. Productivity Press / CRC. ISBN 978-0-415-36922-8. Develops the link between maintenance strategy, asset criticality, and the work-management cycle (incl. RCM-driven PM/PdM work generation).",
  },
  {
    title: "Palmer — Maintenance Planning and Scheduling Handbook (Elsevier)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "HANDBOOK",
    url: "https://www.elsevier.com/books/maintenance-planning-and-scheduling-handbook/palmer/978-0-08-092217-2",
    citation:
      "Palmer, R. (Doc) (2012). Maintenance Planning and Scheduling Handbook (2nd ed.). Elsevier / Butterworth-Heinemann. ISBN 978-0-08-092217-2. The definitive reference for the planner role, the job-package standard, the 6:1 planning ratio, the scheduling cycle, and wrench-time analysis.",
  },
  {
    title: "O'Hanlon — Uptime: The Uptime (Maintenance Excellence) Context",
    level: "5",
    levelLabel: "Professional Organizations",
    type: "BOOK",
    url: "https://www.industrialpress.com/uptime",
    citation:
      "O'Hanlon, T. (2006). Uptime: The Maintenance Excellence Context. Industrial Press. ISBN 978-0-8311-3358-8. Frames Maintenance Excellence and the link between work-management discipline and asset-management maturity (the foundation for ISO 55000 alignment).",
  },
];

// Shared reference list — every WM lesson cites the same set of WM sources.
const WM_REFERENCE_TITLES = CMRP_WM_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Lesson 1 — Planning
// ---------------------------------------------------------------------------

const LESSON_PLANNING: RefLesson = {
  competencyName: "Planning",
  slug: "wm-planning",
  title: "Work-Order Planning",
  titleAr: "تخطيط أوامر العمل",
  order: 1,
  durationMin: 28,
  references: WM_REFERENCE_TITLES,
  conceptIntroduction: `Work-order planning is the disciplined translation of a maintenance need into an executable job package. The planner — distinct from the scheduler and the supervisor — answers the question "what will it take to do this job safely, correctly, and efficiently?" The output is a job package that lists scope, parts, labor, tools, safety controls, procedures, and standards, with an estimated labor-hour budget. The planning ratio (Palmer) targets roughly 5 craft-hours planned per planner-hour, and a "navy ship" target of ≥90% of all craft labor coming from planned work orders.`,
  example: `Plan a centrifugal pump bearing replacement in a Chemical plant. WO scope: replace driver-end and non-drive-end bearings (SKF 6308-2RS) plus lip seals. Labor: 2 mechanical techs × 6 h = 12 craft-hours. Parts: 2× bearing @ $185, seal kit @ $74, gasket set @ $22, Loctite 243 @ $15. Tools: hydraulic gear puller, induction bearing heater, calibrated torque wrench (50–200 N·m), dial indicator. Safety: electrical LOTO + mechanical isolation (closed suction/discharge valves, drain), PPE (cut-resistant gloves, face shield, FR coveralls). Planner effort: 1.5 h to plan a 12-craft-hour job ⇒ planning ratio = 12/1.5 = 8:1 (above the 5:1 floor, below the 10:1 stretch).`,
  keyFormulas: `Planning ratio = planned craft-hours / planner-hours spent (target ≥ 5:1; world-class 10:1)
% planned work = planned craft-hours / total craft-hours worked × 100 (target ≥ 80%; world-class ≥ 90%)
Job package completeness = (# job-package elements present) / (# required elements) × 100
Estimate accuracy = |actual labor-hours − estimated labor-hours| / estimated labor-hours × 100 (target ≤ ±15%)`,
  exercise: `You are the maintenance planner at a Power plant. A WO arrives: replace the packing gland on a 6-inch boiler feedwater isolation valve. Scope the job package (parts, labor estimate, tools, safety, procedures). Justify your labor estimate of 4 craft-hours for 1 mechanic + 1 rigger.`,
  sections: {
    learning_objectives: `- Define the planner role and distinguish planning from scheduling and from supervision.
- Decompose a maintenance need into the seven job-package elements: scope, parts, labor, tools, safety, procedures, and standards.
- Produce a labor-hour estimate using standard data, history-matched job templates, and corrective factor (working conditions, accessibility, parallel/serial tasking).
- Build a complete bill of materials (BOM) and verify parts availability in the CMMS before work is released.
- Specify safety controls commensurate with job risk: LOTO (electrical, fluid power, mechanical, thermal), confined-space, hot-work, working-at-height, PPE.
- Apply the planning ratio and "% planned work" as the planner's own KPIs and explain why world-class plants target ≥90% planned work.`,
    prerequisites: `- The maintenance work-management cycle (identify → plan → schedule → execute → close-out → analyze).
- CMMS navigation: asset hierarchy, work-order (WO) lifecycle states, BOM lookup, stockroom reservations.
- Reading of P&ID, isometric, and OEM manual drawings.
- Awareness of plant safety standards: LOTO (29 CFR 1910.147 in the US), confined space (1910.146), hot work (1910.252), PPE (1910.132).`,
    introduction: `Work-order planning is the first reliability-affecting control point in the work-management cycle. A planned job has its scope decomposed, its labor estimated against standard data, its parts reserved, its tools staged, its safety controls specified, and its procedures attached before the craft ever touches the asset. The un-planned job, by contrast, sends a technician to the field with only the symptom — the craft spends paid time chasing parts, finding tools, waiting on permits, and re-doing work because the procedure was guessed at.

Palmer's central thesis is that "planning is not scheduling": planning decides what, how, and how-long; scheduling decides who, when, and where. The two roles are deliberately separated so that the planner can build a reusable job library while the scheduler adapts to the live state of the plant. The CMRP Body of Knowledge lists Planning as the first WM competency precisely because every downstream metric — schedule compliance, wrench time, PM compliance, planned-vs-actual variance — is gated by the quality of the job package.

ISO 55001:2014 (Clause 7.2) treats maintenance planning as part of asset-management operational planning; ISO 55002:2018 emphasizes that the asset-management plan must operationalize maintenance tasks through standard, repeatable work instructions. The planner is therefore the operational interface between strategic asset intent (RCM results, asset criticality, ISO 55000 asset-management plan) and tactical execution.`,
    terminology: `- **Work Order (WO)**: the digital record that initiates, controls, and closes a unit of maintenance work; carries scope, labor estimate, parts, status, actuals, and findings.
- **Job Package**: the assembled planning deliverable — scope statement, BOM, labor estimate, tools list, safety/permit requirements, OEM procedure references, photos/drawings, and QC checklist.
- **Planner**: the role that produces the job package; works ahead of the schedule (the "next week / next outage" backlog), does not direct crafts in real time.
- **Scheduler**: the role that matches planned WOs to available labor-hours, equipment availability, and operating windows; runs the daily/weekly scheduling meeting.
- **Planning Ratio**: planned craft-hours delivered per planner-hour spent (target ≥5:1; world-class 10:1).
- **% Planned Work**: planned craft-hours ÷ total craft-hours worked × 100 (target ≥80%; world-class ≥90%).
- **Standard Job / Job Template**: a reusable library entry that pre-defines scope, labor, parts, and procedure for a recurring task (e.g., "replace 6308 bearing on Pump P-101 type").
- **Bill of Materials (BOM)**: the structured parts list for an asset, attached to the asset or to the WO; an equipment BOM accelerates planning.
- **LOTO (Lockout/Tagout)**: the energy-isolation control that makes the asset safe to work on (electrical, fluid, mechanical, thermal, potential).
- **Backlog (planned)**: planned-but-not-yet-scheduled WO hours awaiting a scheduling slot.`,
    detailed_explanation: `A planner approaches a work request in four passes. **Pass 1 — scope definition**: read the WO narrative and the equipment history; visit the asset if possible; define the scope as a list of work items, each with an action verb (replace, inspect, calibrate, test, rebuild). Ambiguity ("check pump") is rejected in favour of measurable scope ("verify coupling alignment within 0.05 mm TIR, replace shims as required, document final dial-indicator reading"). Vague scope is the single most common cause of estimate error and rework.

**Pass 2 — labor estimate**: the planner draws from three sources: (i) the standard job library (the previous time this exact job was done on this asset class), (ii) OEM published service times in the equipment manual, and (iii) the planner's own judgment modified by accessibility, working conditions, parallel-versus-serial execution, and the skill mix. A best-practice planner estimates each task at the 50th percentile (median) of historical actuals, then applies a contingency factor (typically 1.10–1.25) for jobs >4 craft-hours or with first-time complexity. The estimate is decomposed to the task level (mechanical, electrical, instrumentation, rigging, civil, QC) so that the scheduler can match it to the right skill mix.

**Pass 3 — parts & tools**: the planner explodes the equipment BOM, verifies stock at the storeroom, and creates a reservation (kit) if the WO is within the planning horizon. Where a part is non-stock or long-lead, the planner either (a) places a pre-PO request and flags the WO as "parts-hold" or (b) breaks the WO into a "stage" job that buys time. Tools (specialty tools, lifting gear, calibrated instruments) are listed with the calibration due date for torque wrenches and dial indicators — a calibrated tool out of calibration invalidates the QC record.

**Pass 4 — safety, procedures, standards**: the planner applies the plant's job-safety-analysis (JSA) matrix. Energy isolation is enumerated (electrical disconnect, block-and-bleed for fluid, lock the rotating element, allow cooldown for thermal). Permits are pre-requested: confined space, hot work, working at height, excavation, electrical-energy isolation. The OEM procedure section is cited (manual, section, page). The acceptance standard is explicit ("impeller runout ≤ 0.05 mm", "alignment ≤ 0.05 mm TIR", "hydrotest at 1.5× MAWP for 30 min, no visible leakage"). The completed job package is now releasable to scheduling.

Palmer's 5:1 planning ratio is empirical: a planner spending one hour to plan a five-craft-hour job recovers the planner's wage several times over in reduced craft waiting, rework, and search time. The 10:1 stretch target is achievable when the standard job library is mature and the planner's craft experience matches the work mix. Below 5:1, the planner is either over-staffed, under-skilled, or planning low-complexity work that should be on a PM template.`,
    core_principles: `- **Separation of roles**: planning (what/how/how-long) is independent of scheduling (who/when/where) and of supervision (directing the craft in real time).
- **Plan ahead of the schedule**: planners work the backlog one to four weeks ahead so the schedule is built from planned WOs only.
- **Standard job library**: recurring work is templated once and reused; estimate drift is corrected by re-baselining the template against actuals.
- **Field-verified scope**: a planner who has not walked the asset cannot plan its job — photos, measurements, and drawings are gathered in the field, not at a desk.
- **Single source of truth**: the WO in the CMMS is the planning artefact; spreadsheets and sticky notes undermine data integrity.
- **Releasable package**: a planned WO is "ready to schedule" when scope, BOM (verified stock), labor, tools, safety, procedure, and standard are all populated.`,
    components: `- **Scope statement**: enumerated work items with action verbs and acceptance criteria.
- **Bill of Materials (BOM)**: part numbers, descriptions, quantities, stock status, reservations.
- **Labor estimate**: task-level, skill-coded (Mech/Elec/I&C/Rigging/Civil/QC), with skill mix and serial/parallel logic.
- **Tools & equipment list**: including specialty lifting gear, calibrated instruments with calibration-due dates.
- **Safety controls**: LOTO matrix (energy types enumerated), permits (confined space, hot work, working at height, excavation), PPE list, JSA.
- **Procedure references**: OEM manual section and page, plant standard work instruction, photos/drawings.
- **Acceptance criteria / QC**: measurable post-job tests (alignment, runout, hydrotest, functional test) with pass/fail thresholds.
- **Job standards folder / job library**: the planner's reusable templates that close the actuals→estimate feedback loop.`,
    process: `1. **Receive WO** (from operator round, PM due-list, condition-monitoring alert, or breakdown closeout).
2. **Verify asset** in CMMS hierarchy; pull history (last 3 jobs, failure modes, MTBF).
3. **Walk the asset** (or review photos) to confirm scope; reject ambiguous WOs back to the originator.
4. **Decompose scope** into work items with action verbs; assign skill and serial/parallel logic.
5. **Estimate labor** from standard-job library or OEM manual; apply skill-mix and condition factors.
6. **Explode BOM**: verify stock; reserve/kit parts; flag long-lead items; split WO if parts are not in window.
7. **List tools & lifting gear**; verify calibration status of QC instruments.
8. **Apply JSA**: enumerate energy types, select permits, list PPE.
9. **Attach procedure** references and acceptance criteria.
10. **Release WO to scheduling** with status = "Planned — Ready to Schedule".
11. **Close the feedback loop** after execution: compare actuals vs. estimate; correct the standard job template where drift exceeds ±15%.`,
    formula_calculation: `- **Planning ratio (Palmer)**:
  Planning Ratio = Planned craft-hours delivered / Planner-hours spent
  Variables: planned craft-hours [h] is the labor estimate × number of jobs released; planner-hours [h] is the planner's effort on those same jobs. Assumption: the planner's effort is logged to the WO via a planner-activity code. Interpretation: ≥5:1 is acceptable, 8:1 is good, 10:1 is world-class.
- **% Planned Work**:
  %Planned = (Planned craft-hours / Total craft-hours worked) × 100
  Variables: planned craft-hours excludes emergency/breakdown WOs that bypass planning; total craft-hours includes them. Target ≥80%; world-class ≥90%.
- **Job package completeness score**:
  Completeness = (Σ elements present) / (Σ elements required) × 100
  Elements: scope, BOM, labor, tools, safety, procedure, standard (7 elements). A "complete" WO = 7/7.
- **Estimate accuracy (post-execution feedback)**:
  Accuracy = 1 − |Actual labor-hours − Estimated labor-hours| / Estimated labor-hours
  Target ≥0.85 (i.e., within ±15% of estimate). Recurring drift >15% on a job template triggers a re-baseline.
- **Planner span of control** (empirical):
  Planner headcount ≈ Total craft headcount × 0.10–0.15 (one planner per ~7–10 craftspeople in mixed-trades plants; one per ~12 in single-trade plants).`,
    worked_example: `**Problem.** A Chemical plant centrifugal pump (P-401 A/B, service = 6% NaOH to the caustic scrubber) has been flagged by condition monitoring: driver-end bearing housing vibration velocity = 7.8 mm/s RMS (ISO 10816 zone C, "unacceptable for long-term operation"). The reliability engineer issues a corrective WO to replace both bearings and lip seals. You are the maintenance planner. Produce the job package and the labor estimate.

**Step 1 — Scope.** Work items:
  (1) Isolate pump per LOTO: electrical (415 V motor disconnect), mechanical (close suction & discharge valves, blind the casing drain, lock the coupling), fluid (drain casing, verify neutralization).
  (2) Disconnect coupling; remove motor to the shop for inspection (separate WO).
  (3) Remove bearing housing cap; extract worn DE bearing (SKF 6308-2RS) using a hydraulic gear puller; inspect shaft journal for fretting (≤ Ra 1.6 µm).
  (4) Press on new DE bearing using an induction heater (≤ 120 °C, no flame).
  (5) Repeat (3)–(4) for NDE.
  (6) Replace lip seals (DE and NDE); gasket-set the bearing housing cap.
  (7) Re-install motor; align coupling (≤ 0.05 mm TIR, soft-foot check first).
  (8) Remove LOTO, run-in (30 min no-load, then 2 h loaded), record vibration.
  (9) Close WO with vibration trend, labor actuals, parts consumed, failure code.

**Step 2 — Labor estimate (from standard job library).**
  - Bearing R&R pair on a 6308-sized pump: 4.0 craft-hours (standard job template).
  - Coupling alignment + soft-foot correction: 1.5 craft-hours.
  - LOTO + isolation + drain: 1.0 craft-hour.
  - Run-in + vibration + WO closeout: 1.5 craft-hours.
  - **Subtotal = 8.0 craft-hours.** Contingency factor for a corrosive service (NaOH, PPE/containment) = 1.25 ⇒ **10.0 craft-hours.**
  - Two mechanical techs in parallel for steps 3–5 ⇒ **5.0 clock-hours** for the in-situ work, but the labor estimate remains 10 craft-hours.

**Step 3 — BOM.**
  - SKF 6308-2RS bearing × 2 @ $185 = $370.
  - Lip seal kit (Burgmann / John Crane) × 1 @ $74.
  - Bearing-housing gasket set × 1 @ $22.
  - Loctite 243 (thread locker, 50 mL) @ $15.
  - **Total parts ≈ $481.** All in-stock (verified via CMMS BOM lookup; 6308-2RS on-hand = 8 units, ROP = 4).

**Step 4 — Tools.**
  - Hydraulic 10-ton gear puller (calibrated gauge).
  - Induction bearing heater (SKF TIH 030) with temperature probe (≤120 °C).
  - Calibrated torque wrench 50–200 N·m, calibration due 2024-09-15 (verified in-charge).
  - Dial indicator (mitutoyo 0.001 mm) + magnetic base for alignment.
  - Vibration pen (Fluke 805) for run-in.

**Step 5 — Safety.**
  - Electrical LOTO: 415 V motor disconnect, single padlock + tag, try-start verification.
  - Mechanical isolation: chain-block to lock coupling rotation; close & chain suction/discharge valves; blind the casing drain.
  - Fluid: drain casing to caustic-neutralization sump; verify pH ≥ 7 before opening.
  - Thermal: allow 30 min cooldown before casing drain.
  - PPE: cut-resistant gloves (level A4), face shield (chemical splash), FR coveralls, rubber boots (caustic), 4-gas monitor if confined space.
  - Permits: hot-work NOT required (no welding); confined-space NOT required (casing drain is below the entry threshold); chemical-handling permit YES.

**Step 6 — Procedure.** OEM manual: Goulds 3196 Installation, Operation, Maintenance Manual, §7 "Bearing Replacement", p. 27–31. Plant standard: MP-1023 "Bearing Replacement for Centrifugal Pumps ≤ 75 kW".

**Step 7 — Acceptance criteria.**
  - Shaft journal Ra ≤ 1.6 µm; no fretting > 0.05 mm depth.
  - Bearing heater temp ≤ 120 °C (over-heat damages the cage).
  - Coupling alignment: ≤ 0.05 mm TIR (radial + axial), soft-foot ≤ 0.05 mm.
  - Run-in vibration: ≤ 3.5 mm/s RMS at DE (ISO 10816 zone A/B) after 2 h loaded.
  - Final report: vibration trend, labor actuals, parts consumed, failure code (FC-104 "Bearing — lubrication/contamination").

**Step 8 — Planner effort.** 1.5 planner-hours (asset visit, BOM, OEM procedure, JSA, labor build).

**Result.** Job package complete (7/7 elements). Planning ratio = 10.0 / 1.5 ≈ 6.7:1 (above the 5:1 floor; re-baseline the standard job if next actual drifts > 15%).`,
    industrial_example: `**Chemical — caustic scrubber feed pump.** The example above is the canonical chemical-plant bearing-R&R scenario. The key chemical-specific risks are (a) caustic PPE and drainage to the neutralization sump, (b) verification of casing-pH before opening, and (c) the bearing-failure root cause is almost always lubrication/contamination (FC-104), so the planner pre-stages a grease-sample kit and adds a sample-collection step to the scope.

**Oil & Gas — multi-stage centrifugal gas-compressor.** A 5-MW compressor bearing swap is 40–80 craft-hours; the planner produces a critical-path network (CPM), identifies the long-lead bearing (8–12 weeks from SKF/COPI), pre-stages the 50-ton hydraulic nut, and books the OEM field-service rep. The job package exceeds 50 pages; the planning effort is 24–40 planner-hours, still meeting the 5:1 ratio.

**Manufacturing — robotic weld cell.** A weld robot MIG-torch overhaul: standard-job library entry reused 12×/year; planning effort = 0.5 h per WO; craft-hours = 6 h; ratio 12:1 (textbook reuse).
`,
    case_study: `**CASE_TYPE = SYNTHETIC.** A mid-size Container Terminal has 14 rubber-tired gantry cranes (RTGs). The maintenance manager commissions a planning pilot: one planner, two-week backlog, target 80% planned work. Baseline (before): 32% planned work, 22% wrench time, estimate accuracy 41%. After 12 weeks of disciplined planning (standard-job library built for the top-50 recurring RTG tasks, BOMs cleaned for the top-20 bad-actor components, planner-to-craft ratio = 1:9), the terminal reached 78% planned work, 31% wrench time, and estimate accuracy 79%. The schedule-compliance metric rose from 47% to 82%. The terminal also found that 19% of historical WO labor was on assets with no equipment BOM — those were either templated (46% of cases) or sent to engineering for BOM build (53%). The case demonstrates the lever: planning alone, without new headcount, moved four KPIs simultaneously.`,
    visual_explanation: `- **Work-management cycle diagram**: Identify → Plan → Schedule → Execute → Closeout → Analyze (loop back to Identify). The planner owns the Plan box.
- **Job-package block diagram**: seven labeled blocks (Scope | BOM | Labor | Tools | Safety | Procedure | Standard) all stacked into a "ready-to-schedule" WO.
- **Planning funnel**: 100 work requests → 60 templated from standard library (0.5 h each) + 30 planned from history (1.5 h each) + 10 planned from scratch (4 h each) = 75 planner-hours for ~600 craft-hours ⇒ ratio 8:1.
- **Estimate-vs-actual scatter**: each dot is a closed WO; x = estimate, y = actual; ±15% envelope; outliers above the envelope are re-baselined.`,
    simulation_opportunity: `CMMS simulation: a desktop exercise in which a learner is given a stream of incoming WOs (some templated, some new, some vague) and must produce 5 job packages within a 40-hour planner-week. The simulator scores: (a) completeness (7/7 elements per WO), (b) estimate accuracy against a hidden "actuals" baseline, (c) planning ratio, (d) rejection rate of vague WOs. A second-tier sim would inject parts-stockout and operator-availability disturbances so the learner practices scope-splitting and pre-PO requests.`,
    common_mistakes: `- **Conflating planning with scheduling**: the planner estimating labor and the scheduler assigning people become the same person, so neither job is done well.
- **Desk planning without visiting the asset**: scope is wrong (a "5-h" job turns into a 12-h job because a pipe spool blocks access that was not visible on the P&ID).
- **Single-source estimates**: the planner's gut, not the standard-job library, becomes the source of labor numbers — and the standard library never matures.
- **Vague scope acceptance**: WO narrative "check pump" is planned instead of returned to the originator with a request for measurable acceptance criteria.
- **No feedback loop**: actuals are captured but never compared to estimates; the standard-job template drifts, sometimes by 40%, and is never corrected.
- **Tools forgotten**: the planner omits the calibrated torque wrench (or its calibration is out of date), and the QC record is invalid.
- **Safety added late**: the JSA is built at execution time, not planning time, so the permit is requested after the craft arrives — wait time destroys wrench time.
- **Treating the CMMS as a printer of work tickets**: the BOM is not exploded, parts are not reserved, and the WO is "planned" only as a paper ticket.`,
    limitations: `- Planning does not eliminate execution-time variability: jobs that look identical in the standard library may differ in the field (corrosion, hidden damage, accessibility).
- The 5:1 ratio is empirical and presumes a mature standard-job library; a greenfield plant with no history cannot meet it on day one.
- A planner cannot plan a job for which the OEM procedure is not published or not purchased — the planner is dependent on documentation quality.
- Planning effort is non-linear in job complexity: small templated jobs cost little planner-time, but a one-off overhaul can consume 40+ planner-hours — the headcount model must accommodate the tail.`,
    comparison: `- **Planning vs. Scheduling**: planning answers what/how/how-long; scheduling answers who/when/where. Both are required; neither substitutes for the other.
- **Planning vs. Supervision**: the planner builds the package offline; the supervisor directs the craft online. The supervisor is the planner's customer.
- **Planning vs. Engineering**: engineering produces the asset BOM and the standard work instruction; planning consumes them. Where neither exists, planning must first commission engineering.
- **Planner-led vs. self-planned (craft-led) models**: planner-led plants reach ≥80% planned work and ≥30% wrench time; craft-led plants (each craft plans their own WO) typically plateau at 40% planned work and 20% wrench time (Palmer).`,
    practical_application: `- **Daily**: the planner clears the new-WO queue (≤24 h from creation to scope-confirm-or-reject), updates WOs from the standard library, walks the asset for ambiguous scope.
- **Weekly**: the planner prepares the next-week backlog for the scheduling meeting; verifies parts reservations; closes the feedback loop on last-week actuals.
- **Outage / turnaround**: the planner produces the critical-path network, identifies long-lead parts 60+ days out, books specialty labor (OEM rep, rigging), and publishes a gantt that the scheduler runs against.
- **Continuous**: the planner maintains the standard-job library, re-baselining templates whose actuals drift >15%, and feeds failure-code findings back to the reliability engineer for root-cause analysis.`,
    decision_scenario: `You inherit a planning function with one planner and 18 craftspeople across mechanical, electrical, and I&C. Last quarter: 38% planned work, 19% wrench time, 47% schedule compliance, and 60 open WOs aged 0–180 days. You can fund ONE of three actions:
  (A) Add a second planner (~$120k loaded).
  (B) Build the standard-job library (60-day consulting engagement, ~$80k).
  (C) Implement the CMMS equipment-BOM cleanup for the top-50 bad-actor assets (40-day internal project, ~$30k).

Decision: (B) — the standard-job library is the lever that multiplies the existing planner's effort; without it, adding a second planner only buys more desk-planning without improving estimate accuracy. (C) is the runner-up (planning cannot be fast without BOMs). (A) alone, without (B) and (C), produces 2 planners doing the same low-ratio work. Sequence: (B) first, then (C), and only then assess whether a second planner is needed.`,
    practice_questions: `- List the seven elements of a complete job package.
- Distinguish "planned work" from "scheduled work".
- A planner spent 6.5 h planning a backlog of 35 craft-hours of work. Compute the planning ratio. *(Answer: 35/6.5 ≈ 5.4:1 — just above the floor.)*
- A standard job template is 8 craft-hours; last 5 actuals = 9.2, 10.5, 8.4, 11.0, 9.8 h. Compute the mean actual and the estimate drift %. Should the template be re-baselined? *(Answer: mean = 9.78 h; drift = (9.78−8)/8 × 100 = 22.3% — yes, re-baseline.)*
- State why a planner who has not visited the asset cannot reliably plan the job.
- Give an example of a vague WO narrative and rewrite it with measurable acceptance criteria.`,
    certification_questions: `The CMRP exam tests Planning as the first WM competency. SMRP-aligned sample prompts:

(a) Given a job package missing two of the seven elements, identify the elements that must be added before the WO is "ready to schedule."

(b) Compute the planning ratio and "% planned work" from a 4-week dataset.

(c) Recognize that scope-ambiguity in the WO narrative is the planning problem to fix first — before parts, labor, or safety.

(d) Distinguish the planner role from the scheduler role on the exam blueprint.

The questions in this lesson's question bank are aligned to these Planning competencies.`,
    summary: `Work-order planning turns an ambiguous maintenance need into a releasable, source-of-truth job package. The planner owns the seven elements — scope, BOM, labor, tools, safety, procedure, standard — and is measured by the planning ratio (≥5:1), the % planned work (≥80%), and the estimate accuracy (±15% via the standard-job feedback loop). The separation of planning from scheduling and from supervision is non-negotiable; collapsing the roles collapses the metric. Planning is the upstream lever for every downstream KPI in the Work Management pillar — schedule compliance, wrench time, PM compliance, and reliability improvement all start at the planner's desk.`,
    key_takeaways: `- The seven job-package elements: scope, BOM, labor, tools, safety, procedure, standard.
- Planning ratio = planned craft-hours / planner-hours spent (≥5:1 floor; 10:1 stretch).
- % planned work ≥80% is the gate for credible schedule-compliance and wrench-time metrics.
- Estimate accuracy ±15% is enforced by closing the standard-job feedback loop on every closed WO.
- The planner is distinct from the scheduler; the WO is the single source of truth; the standard-job library is the planner's force-multiplier.`,
    references: `- SMRP. *CMRP Body of Knowledge — Work Management pillar: Planning.*
- SMRP. *CMRP Exam Outline.*
- ISO 55000:2014, *Asset management — Overview, principles and terminology.*
- ISO 55001:2014, *Asset management — Management systems — Requirements*, Clause 7.2.
- ISO 55002:2018, *Guidelines for the application of ISO 55001.*
- Mobley, R. K. (2008). *Maintenance Engineering Handbook* (7th ed.). McGraw-Hill. Section II.
- Campbell, J. D. & Jardine, A. K. S. (2001). *Maintenance Strategy*. Productivity Press.
- Palmer, R. (2012). *Maintenance Planning and Scheduling Handbook* (2nd ed.). Elsevier. Chapters 3, 7, 14.
- O'Hanlon, T. (2006). *Uptime*. Industrial Press.`,
  },
  knowledgeObject: {
    title: "Work-order planning — job package & planning ratio",
    domain: "Work Management",
    competency: "Planning",
    topic: "Work-order planning",
    concept: "Job package",
    body: {
      definitions: [
        "Work Order (WO): the digital record that initiates, controls, and closes a unit of maintenance work.",
        "Job package: scope + BOM + labor + tools + safety + procedure + standard (7 elements).",
        "Planner: produces the job package; works ahead of the schedule; does not direct craft in real time.",
        "Scheduler: matches planned WOs to available labor-hours, equipment availability, and operating windows.",
        "Standard job / job template: reusable library entry for a recurring task.",
        "Planning ratio: planned craft-hours / planner-hours spent (target ≥5:1; world-class 10:1).",
        "% planned work: planned craft-hours / total craft-hours worked × 100 (target ≥80%; world-class ≥90%).",
        "Backlog (planned): planned-but-not-yet-scheduled WO hours awaiting a scheduling slot.",
      ],
      principles: [
        "Separation of roles: planning ≠ scheduling ≠ supervision.",
        "Plan ahead of the schedule (1–4 weeks) so the schedule is built from planned WOs only.",
        "Standard-job library is the planner's force-multiplier (templating recurring work).",
        "Field-verified scope: a planner who has not walked the asset cannot plan its job.",
        "Single source of truth: the WO in the CMMS, not spreadsheets or sticky notes.",
        "Closed feedback loop: actuals vs. estimate drives template re-baselining.",
      ],
      components: [
        "Scope statement (action verbs, measurable acceptance criteria).",
        "Bill of Materials (parts list with stock status and reservations).",
        "Labor estimate (task-level, skill-coded, parallel/serial logic).",
        "Tools & lifting gear (with calibration due dates).",
        "Safety controls (LOTO matrix, permits, JSA, PPE).",
        "Procedure references (OEM manual section/page, plant standard).",
        "Acceptance criteria / QC (measurable post-job tests).",
        "Standard-job library (the planner's reusable templates).",
      ],
      mechanism: [
        "WO arrives → planner verifies asset & history → planner walks the asset → scope decomposed → labor estimated → BOM exploded & reserved → tools listed → JSA applied → procedure attached → WO released as 'Planned — Ready to Schedule' → after execution, actuals vs. estimate closes the loop.",
      ],
      process: [
        "1. Receive WO (operator round, PM due-list, CBM alert, breakdown closeout).",
        "2. Verify asset in CMMS hierarchy; pull history (last 3 jobs, failure modes, MTBF).",
        "3. Walk the asset; reject ambiguous WOs back to originator.",
        "4. Decompose scope into work items; assign skill & serial/parallel logic.",
        "5. Estimate labor from standard-job library or OEM manual; apply condition factor.",
        "6. Explode BOM; verify stock; reserve/kit; flag long-lead; split WO if out of window.",
        "7. List tools & lifting gear; verify calibration.",
        "8. Apply JSA: enumerate energy types; select permits; list PPE.",
        "9. Attach procedure references & acceptance criteria.",
        "10. Release WO to scheduling with status = 'Planned — Ready to Schedule'.",
        "11. After execution: compare actuals vs. estimate; re-baseline template if drift >15%.",
      ],
      formulas: [
        "Planning Ratio = Planned craft-hours delivered / Planner-hours spent (target ≥5:1; 10:1 stretch).",
        "% Planned Work = (Planned craft-hours / Total craft-hours worked) × 100 (target ≥80%; world-class ≥90%).",
        "Job package completeness = (Σ elements present) / (Σ elements required) × 100 (7 elements; 'complete' = 7/7).",
        "Estimate accuracy = 1 − |Actual labor-hours − Estimated labor-hours| / Estimated labor-hours (target ≥0.85).",
        "Planner span of control ≈ Total craft headcount × 0.10–0.15 (one planner per ~7–10 craftspeople).",
      ],
      metrics: [
        "Planning ratio (≥5:1 floor; 10:1 stretch).",
        "% planned work (≥80%; world-class ≥90%).",
        "Job-package completeness score (7/7 = releasable).",
        "Estimate accuracy (±15% — triggers template re-baseline).",
        "WO rejection rate (vague WOs returned to originator).",
        "Standard-job-library coverage (% of recurring jobs templated).",
      ],
      examples: [
        "Plan a centrifugal pump bearing R&R (Chemical): 2 mech techs × 6 h = 12 craft-hours; SKF 6308-2RS ×2 + seal kit + gaskets + Loctite; hydraulic puller, induction heater, calibrated torque wrench, dial indicator; electrical + mechanical + fluid LOTO; 1.5 planner-hours ⇒ planning ratio 8:1.",
        "Plan a 5-MW compressor bearing swap (Oil & Gas): 40–80 craft-hours; 24–40 planner-hours; long-lead bearing 8–12 weeks; CPM network; OEM field-service rep booked.",
        "Plan a robotic weld-cell MIG-torch overhaul (Manufacturing): standard-job library reused 12×/year; 0.5 planner-hour per WO; 6 craft-hours ⇒ ratio 12:1.",
      ],
      industrial_examples: [
        "Chemical — caustic scrubber feed pump: PPE for caustic, casing-pH verify before opening, FC-104 root cause pre-staged grease-sample kit.",
        "Oil & Gas — multi-stage gas compressor: CPM network, long-lead bearing, 50-ton hydraulic nut, OEM field-service rep on the job package.",
        "Manufacturing — robotic weld cell: standard-job library reused 12×/year, planning ratio 12:1.",
        "Container Terminal — RTG crane: bad-actor component BOM cleanup; planning pilot moves planned work 32%→78%, wrench time 22%→31%.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Container Terminal, 14 RTGs, planning pilot. One planner, two-week backlog, 80% planned-work target. 12 weeks: planned work 32%→78%, wrench time 22%→31%, estimate accuracy 41%→79%, schedule compliance 47%→82%. Discovered 19% of historical WO labor was on assets with no equipment BOM — 46% templated, 53% sent to engineering for BOM build.",
      ],
      common_errors: [
        "Conflating planning with scheduling (same person, neither job done well).",
        "Desk planning without visiting the asset (scope wrong from invisible access issues).",
        "Single-source estimates (planner's gut, not the standard library).",
        "Vague scope acceptance ('check pump' planned instead of returned to originator).",
        "No feedback loop (actuals never compared to estimates; template drifts uncorrected).",
        "Tools forgotten or calibration out of date (QC record invalid).",
        "Safety added late (JSA at execution, not planning — permit wait time destroys wrench time).",
        "CMMS used as a ticket-printer, not as a planning system (BOM not exploded, parts not reserved).",
      ],
      limitations: [
        "Planning cannot eliminate execution-time variability (corrosion, hidden damage, accessibility).",
        "5:1 ratio presumes mature standard-job library; greenfield plants cannot meet it on day one.",
        "Planner dependent on OEM procedure documentation quality.",
        "Planning effort is non-linear in job complexity (one-off overhaul can consume 40+ planner-hours).",
      ],
      best_practices: [
        "Walk the asset before planning.",
        "Use the standard-job library as the source of estimates; re-baseline from actuals.",
        "Explode the BOM and verify stock before releasing the WO.",
        "Apply the JSA at planning time, not execution time.",
        "Verify calibration status of QC instruments.",
        "Track planning ratio, % planned work, and estimate accuracy as the planner's KPIs.",
        "Reject vague WOs back to the originator — do not plan around ambiguity.",
        "Close the feedback loop on every closed WO.",
      ],
      related_concepts: [
        "Scheduling (next competency).",
        "CMMS — asset hierarchy & BOM (sister competency).",
        "MRO Materials Management — parts reservation & kitting.",
        "RCM — generates the PM/PdM work that flows into planning.",
        "ISO 55001 Clause 7.2 — asset-management operational planning.",
      ],
      prerequisites: [
        "Work-management cycle (identify → plan → schedule → execute → closeout → analyze).",
        "CMMS navigation: asset hierarchy, WO lifecycle, BOM lookup, stockroom reservations.",
        "P&ID, isometric, and OEM-manual reading.",
        "Plant safety standards: LOTO (US 29 CFR 1910.147), confined space (1910.146), hot work (1910.252), PPE (1910.132).",
      ],
      references: [
        "SMRP CMRP BOK — WM pillar: Planning.",
        "SMRP CMRP Exam Outline.",
        "ISO 55000:2014; ISO 55001:2014 Cl. 7.2; ISO 55002:2018.",
        "Mobley (2008), Maintenance Engineering Handbook, §II.",
        "Campbell & Jardine (2001), Maintenance Strategy.",
        "Palmer (2012), Maintenance Planning and Scheduling Handbook, Ch. 3, 7, 14.",
        "O'Hanlon (2006), Uptime.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Planning",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which of the following is NOT one of the seven elements of a complete maintenance job package as defined in the planner's standard?",
      whyCorrect:
        "A labor-union contact is not in the job-package standard. The seven elements are: scope, BOM (parts), labor, tools, safety, procedures, and standards (acceptance criteria).",
      whyOthersWrong: [
        "Scope is the first of the seven elements — the planner decomposes the work into items with measurable acceptance criteria.",
        "Bill of Materials is the second element — the parts list with stock status and reservations.",
        "Safety controls (LOTO, permits, JSA, PPE) are the fifth element — applied at planning time, not execution time.",
      ],
      explanation:
        "Palmer's job-package standard lists scope, BOM, labor, tools, safety, procedure, standard. Anything outside that set — including HR/union matters — is outside the planner's deliverable.",
      options: [
        { text: "A labor-union contact for the craft performing the work", isCorrect: true },
        { text: "Scope of work, decomposed into items with acceptance criteria", isCorrect: false },
        { text: "Bill of Materials with stock status and reservations", isCorrect: false },
        { text: "Safety controls: LOTO matrix, permits, JSA, PPE list", isCorrect: false },
      ],
    },
    {
      competencyName: "Planning",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Manufacturing",
      stem: "A planner spent 7.5 planner-hours preparing job packages that released 45 craft-hours of planned work. What is the planning ratio, and is it above the acceptable floor?",
      whyCorrect:
        "Planning ratio = planned craft-hours / planner-hours = 45 / 7.5 = 6.0:1. The Palmer floor is 5:1, so 6.0:1 is above the floor (but below the 10:1 stretch target).",
      whyOthersWrong: [
        "5.0:1 is the floor; the calculation 45/7.5 = 6.0, not 5.0 — dividing 45 by 9 would yield 5.0 but the planner-hours were 7.5.",
        "7.5:1 inverts the ratio (planner-hours over craft-hours) — the standard definition is craft-hours over planner-hours.",
        "0.17:1 is the inverse — a planning ratio below 1 would mean the planner is taking longer than the craft, which is impossible by definition (planners always work to release more work than they consume).",
      ],
      explanation:
        "Planning Ratio = Planned craft-hours delivered / Planner-hours spent. 45/7.5 = 6.0:1. Palmer's empirical floor is 5:1; world-class is 10:1.",
      options: [
        { text: "6.0:1 — above the 5:1 floor but below the 10:1 stretch", isCorrect: true },
        { text: "5.0:1 — exactly at the floor", isCorrect: false },
        { text: "7.5:1 — above the 10:1 stretch", isCorrect: false },
        { text: "0.17:1 — the ratio is inverted; well below the floor", isCorrect: false },
      ],
    },
    {
      competencyName: "Planning",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      stem: "A plant has 38% planned work and 19% wrench time. The maintenance manager can fund ONE action: (A) add a 2nd planner, (B) build the standard-job library, (C) clean up equipment BOMs for top-50 bad-actors. Which is the best sequence and why?",
      whyCorrect:
        "(B) first. The standard-job library is the lever that multiplies the existing planner's effort; without it, a second planner only buys more desk-planning without improving estimate accuracy. (C) is the runner-up; (A) alone without (B) and (C) produces 2 planners doing the same low-ratio work.",
      whyOthersWrong: [
        "(A) first: adding a planner without a standard-job library yields more desk-planning at the same low ratio — the lever is missing.",
        "(C) first: equipment-BOM cleanup is necessary but is the runner-up because templating first multiplies the planner's output even before BOMs are clean.",
        "(A) and (C) in parallel without (B): the standard-job library is the force-multiplier; skipping it leaves both investments below their leverage.",
      ],
      explanation:
        "Palmer's analysis of pilot programs shows the standard-job library is the upstream lever for both % planned work and estimate accuracy. Adding headcount without it does not move the metrics.",
      options: [
        { text: "(B) Build the standard-job library first, then (C) cleanup, then reassess (A)", isCorrect: true },
        { text: "(A) Add the second planner first to clear the backlog", isCorrect: false },
        { text: "(C) Clean up equipment BOMs first, then reassess", isCorrect: false },
        { text: "(A) and (C) in parallel; defer (B)", isCorrect: false },
      ],
    },
    {
      competencyName: "Planning",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "DecisionMaking",
      skillType: "Conceptual",
      scenario: "Oil & Gas",
      stem: "A 5-MW multi-stage centrifugal gas-compressor bearing swap is estimated at 60 craft-hours and requires an 8-week lead-time bearing from the OEM. Which planning action most directly protects the schedule?",
      whyCorrect:
        "Identifying the long-lead bearing on the critical path and pre-staging it 8+ weeks before the outage is the planning action that most protects the schedule; without the part on-site at T-0, no amount of labor planning matters.",
      whyOthersWrong: [
        "Adding a 2nd planner: more planner headcount does not accelerate a long-lead OEM bearing.",
        "Re-baselining the standard job template: there is no template for a 5-MW compressor swap; this is a one-off engineered job.",
        "Re-estimating the labor with a contingency factor: labor contingency does not affect the part's lead time on the critical path.",
      ],
      explanation:
        "Palmer and Campbell & Jardine both emphasize that for outage/turnaround work, the planner's first pass is the long-lead/critical-path material — without it the schedule is built on sand.",
      options: [
        { text: "Identify the long-lead bearing on the critical path; pre-stage it 8+ weeks before the outage", isCorrect: true },
        { text: "Add a 2nd planner to compress the planning effort", isCorrect: false },
        { text: "Re-baseline the standard-job template for compressors", isCorrect: false },
        { text: "Re-estimate labor with a 1.25× contingency factor", isCorrect: false },
      ],
    },
    {
      competencyName: "Planning",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: The maintenance planner and the maintenance scheduler are the same role and should be combined in plants with fewer than 20 craftspeople.",
      whyCorrect:
        "False. Planning (what/how/how-long) and scheduling (who/when/where) are deliberately separated. Combining them collapses both metrics — the planner builds a reusable job library while the scheduler adapts to the live state of the plant; conflating them is the single most common organizational mistake in work management.",
      whyOthersWrong: [
        "True — combining the roles in a small plant looks efficient but in practice it produces neither a mature job library nor a credible schedule; Palmer explicitly warns against it regardless of plant size.",
      ],
      explanation:
        "Palmer's separation-of-roles principle is unconditional: even small plants benefit from a planner who is distinct from the scheduler (the planner may then also be a working foreman, but the role boundary is preserved).",
      options: [
        { text: "False", isCorrect: true },
        { text: "True", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Scheduling
// ---------------------------------------------------------------------------

const LESSON_SCHEDULING: RefLesson = {
  competencyName: "Scheduling",
  slug: "wm-scheduling",
  title: "Work Scheduling & Backlog Management",
  titleAr: "جدولة العمل وإدارة التراكم",
  order: 2,
  durationMin: 26,
  references: WM_REFERENCE_TITLES,
  conceptIntroduction: `Scheduling is the matching of planned work orders to available labor-hours, equipment-availability windows, and operating constraints over a defined horizon (typically daily, weekly, and a 4-week rolling lookahead). The scheduler — distinct from the planner — runs the daily/weekly scheduling meeting, sequences the backlog against capacity, and is measured by Schedule Compliance (% jobs started/finished as scheduled) and Schedule Adherence. Capacity leveling converts "what we want to do" into "what we can actually do this week."`,
  example: `Schedule a weekly workload in a Manufacturing plant. Capacity: 4 technicians × 8 h × 5 days = 160 craft-hours/week; subtract 30% non-productive (breaks, training, meetings, waiting) ⇒ 112 available craft-hours. The planned backlog contains 14 WOs × 8 h each = 112 h. The scheduler loads exactly 14 WOs into next week's schedule, holds the overflow in backlog, and runs the daily scheduling meeting to track completion. Target schedule compliance = 85%.`,
  keyFormulas: `Weekly capacity = (Techs) × (Shift hours) × (Days) × (1 − Non-productive %)
Available craft-hours = Weekly capacity × Productive %
Schedule Compliance = (Jobs completed as scheduled) / (Jobs scheduled) × 100 (target ≥85%)
Schedule Adherence = (Craft-hours worked on scheduled jobs) / (Total craft-hours worked) × 100
Backlog weeks = Total backlog craft-hours / Weekly available craft-hours (target 2–4 weeks)`
  ,
  exercise: `You are the maintenance scheduler at a Container Terminal with 5 RTG technicians × 10 h × 6 days/week. Non-productive time is 25%. Backlog = 280 craft-hours of planned WOs. (a) Compute weekly available craft-hours. (b) Compute backlog weeks. (c) Decide whether to add a contractor crew.`,
  sections: {
    learning_objectives: `- Distinguish scheduling from planning and from supervision; describe the scheduler's deliverables.
- Build a daily, weekly, and 4-week rolling lookahead schedule from the planned-work backlog.
- Level available labor capacity against the work order queue; manage backlog weeks to the 2–4 week target.
- Identify equipment-availability windows with Operations and constraint (production schedule, weather for outdoor work).
- Run the daily/weekly scheduling meeting; capture commitment and follow-up.
- Measure and report Schedule Compliance and Schedule Adherence; explain why both are required.`,
    prerequisites: `- A complete lesson on Planning (Lesson 1) — the scheduler consumes planned WOs only.
- CMMS navigation: backlog query, WO status transitions, labor-availability calendar.
- Plant operating schedule (which units run, which are down, which are in turnaround).
- Basic resource-leveling arithmetic (capacity = techs × hours × days × productivity factor).`,
    introduction: `Scheduling is the second control point in the work-management cycle. Where the planner produces a releasable job package ("what will it take?"), the scheduler decides "who, when, and where" against the live state of the plant. The scheduler's input is the planned-work backlog (WOs in status "Planned — Ready to Schedule"); the scheduler's output is a daily/weekly schedule that the supervisor and crafts execute.

The discipline rests on three principles: (i) **only planned work is scheduled** — emergent corrective work is dispatched, not scheduled; (ii) **capacity is leveled** — the schedule sums to no more than the available craft-hours, after subtracting non-productive time; and (iii) **the schedule is a contract** — Operations commits to equipment-availability windows, Maintenance commits to the work, and the daily scheduling meeting reconciles the two.

ISO 55002:2018 frames scheduling as part of the operational planning of the asset-management system; the schedule is the bridge between the asset-management plan and tactical execution. The CMRP BOK lists Scheduling as the second WM competency, downstream of Planning and upstream of Work Execution.`,
    terminology: `- **Schedule**: the time-sequenced assignment of planned WOs to labor, equipment-availability windows, and dates over a defined horizon.
- **Scheduler**: the role that builds the schedule; runs the daily/weekly scheduling meeting; does not plan the job or supervise the craft.
- **Backlog**: planned-but-not-scheduled WO hours, aged by WO create date; managed to a 2–4 week target.
- **Backlog weeks**: total backlog craft-hours ÷ weekly available craft-hours (target 2–4 weeks).
- **Capacity leveling**: matching the work queue to available labor-hours; the scheduler's weekly arithmetic.
- **Schedule Compliance**: jobs completed as scheduled ÷ jobs scheduled × 100 (target ≥85%).
- **Schedule Adherence**: craft-hours worked on scheduled jobs ÷ total craft-hours worked × 100 (target ≥85%).
- **Rolling lookahead**: a 4-week (typical) forward view that lets the scheduler identify long-lead parts and specialty-labor conflicts.
- **Equipment-availability window**: a time block when Operations has released the asset to Maintenance (planned downtime, gen-outage, or operating deferral).
- **Daily scheduling meeting**: the 15–30 min stand-up where Maintenance, Operations, and (often) Engineering commit to the next 24 h of work.`,
    detailed_explanation: `Scheduling is an arithmetic problem first, a coordination problem second. The arithmetic: weekly capacity = (number of technicians) × (shift hours) × (days) × (1 − non-productive %). A 4-tech, 8-h, 5-day plant with 30% non-productive time has 4 × 8 × 5 × 0.70 = 112 available craft-hours per week. The scheduler loads the backlog into the week up to but not beyond 112 hours — over-loading produces schedule breakage; under-loading leaves backlog aging and craft idle.

The coordination problem is the scheduling meeting. A best-practice plant runs three meetings: (i) **daily** (15 min, morning) — review yesterday's completion, set today's schedule, surface emergent work; (ii) **weekly** (45 min, mid-week for the following week) — review the 4-week lookahead, commit Operations windows, lock the weekly schedule; (iii) **monthly** (60 min) — review the 12-week lookahead for turnaround/outage coordination. Each meeting has a fixed agenda, an owner (the scheduler), and a record (the CMMS schedule and a meeting minute).

**Backlog management** is the scheduler's balancing act. Too little backlog (under 1 week) means the schedule is brittle — any emergent work breaks it. Too much backlog (over 6 weeks) means planned work is aging and the planning function is outpacing execution. The 2–4 week band is the operating zone: enough work to fill the week plus a buffer, but not so much that the WO library drifts from current conditions.

**Capacity leveling** also includes the skill mix: a 112-hour weekly capacity may be 60 mechanical, 30 electrical, 15 I&C, and 7 rigging. The scheduler cannot trade skills across the boundaries (an I&C tech cannot perform a mechanical alignment). Where the skill mix does not match the work mix, the scheduler either (a) re-sequences the week (defers work whose skill is unavailable), (b) borrows a skill from another area, or (c) engages a contractor — typically only for routine skills (laborer, painter) to avoid depending on a contractor for critical execution.

**Schedule compliance** is the primary KPI: of the WOs scheduled for the week, how many were completed (started AND finished) within their scheduled window. World-class is ≥85%. Below 60% means the schedule is not a contract — either Operations broke the windows, Maintenance over-committed, or emergent work overwhelmed the plan. **Schedule adherence** is the second KPI: of the craft-hours actually worked, what % were on scheduled (vs. emergent) work — measures whether the craft adhered to the schedule or chased breakdowns.`,
    core_principles: `- **Only planned work is scheduled** (emergent work is dispatched, not scheduled).
- **Capacity leveling** — the schedule sums to no more than available craft-hours.
- **The schedule is a contract** — Operations commits windows, Maintenance commits work.
- **Backlog managed to 2–4 weeks** — neither brittle nor stale.
- **Three scheduling meetings** (daily/weekly/monthly) with fixed agendas and records.
- **Skill-mix matched** — the scheduler cannot trade skills across trade boundaries.`,
    components: `- **Planned-work backlog** (CMMS query: status = "Planned — Ready to Schedule", sorted by priority and aging).
- **Weekly capacity** (technician count × shift hours × days × productivity factor).
- **Equipment-availability calendar** (planned downtime, gen-outage, operating deferral windows, weather windows for outdoor work).
- **Skill-mix matrix** (mechanical / electrical / I&C / rigging / civil / QC hours available per week).
- **Long-lead and specialty-labor tracker** (OEM field-service rep, crane availability, scaffold build).
- **Scheduling meeting cadence** (daily/weekly/monthly agendas and minutes).
- **Schedule-compliance & schedule-adherence reporting** (CMMS, dashboard).`,
    process: `1. **Pull the planned-work backlog** from the CMMS.
2. **Compute weekly available capacity** (techs × hours × days × productivity).
3. **List equipment-availability windows** from Operations (planned downtime, deferrals).
4. **Sort backlog by priority** (safety > compliance > critical-asset > PM-due > corrective > improvement).
5. **Sequence WOs to capacity**: each WO's labor estimate is deducted from the matching skill-mix capacity bucket until the week is full.
6. **Reserve specialty resources** (cranes, scaffold, OEM rep) on the 4-week lookahead.
7. **Publish the week-ahead schedule**; run the weekly scheduling meeting to commit Operations windows and the Maintenance schedule.
8. **Run the daily scheduling meeting** (15 min, morning): review yesterday's completion, set today's schedule, surface emergent work.
9. **Track schedule compliance daily** (started and finished within window); log breaks with a reason code.
10. **Manage backlog aging**: WOs aged >4 weeks trigger a planner re-verification of scope; WOs aged >8 weeks trigger a re-plan or cancel decision.`,
    formula_calculation: `- **Weekly capacity**:
  Capacity = N × H × D × (1 − NP)
  Variables: N = # technicians [count]; H = shift hours [h]; D = days [d]; NP = non-productive fraction [0..1] (breaks, training, meetings, waiting). Units: [h/week]. Assumption: skills are homogeneous — for mixed trades, compute per skill bucket.
- **Available craft-hours per week** (post-non-productive):
  Avail = N × H × D × (1 − NP) — same as above, labelled "available".
- **Backlog weeks**:
  BW = Total backlog craft-hours / Weekly available craft-hours
  Variables: total backlog [h] is the sum of all planned-but-not-scheduled WO labor estimates; weekly available [h/week]. Target 2–4 weeks. <1 ⇒ brittle schedule; >6 ⇒ stale backlog (re-plan or cancel).
- **Schedule Compliance (SC)**:
  SC = (Jobs completed as scheduled) / (Jobs scheduled) × 100
  "Completed as scheduled" = started AND finished within the scheduled window. Target ≥85%; world-class ≥90%.
- **Schedule Adherence (SA)**:
  SA = (Craft-hours worked on scheduled jobs) / (Total craft-hours worked) × 100
  Measures whether the craft adhered to the schedule or chased breakdowns. Target ≥85%.
- **Schedule break reason code taxonomy**: Operations-window broken, Parts-stockout, Labor-short (absence), Emergent-work priority, Weather, Specialty-resource unavailable.`,
    worked_example: `**Problem.** A Manufacturing plant has 4 mechanical technicians on an 8-hour, 5-day shift. Non-productive time (breaks, training, meetings, waiting on permits) is 30%. The planned-work backlog contains 18 WOs with a total labor estimate of 156 craft-hours, of which 6 WOs (60 h) are on the cell-A paint line that Operations has scheduled for a 2-day window next week (Tuesday-Wednesday). Build the weekly schedule, compute the backlog weeks, and decide whether to defer work.

**Step 1 — Weekly capacity.**
  Capacity = 4 techs × 8 h × 5 days = 160 h/week.
  Available = 160 × (1 − 0.30) = 160 × 0.70 = **112 h/week**.

**Step 2 — Backlog weeks.**
  Total backlog = 156 h.
  BW = 156 / 112 ≈ **1.39 weeks.** This is at the low end of the 2–4 week target; the schedule is somewhat brittle — any emergent work will displace planned work.

**Step 3 — Skill mix.**
  Assume all 4 techs are mechanical (single-trade plant). No skill-mix constraint this week.

**Step 4 — Equipment-availability windows.**
  Cell-A paint-line window: Tuesday + Wednesday (2 days). WOs that require cell-A down-time (6 WOs, 60 h) must be sequenced into Tuesday-Wednesday; 2 techs × 2 days × 8 h = 32 h can be applied to cell-A. Of the 60 h of cell-A work, only 32 h fit; the other 28 h must defer to the next cell-A window or to the next plant down-day.

**Step 5 — Schedule.**
  Cell-A window (Tue-Wed, 2 techs × 16 h = 32 h): load 4 WOs of 8 h each = 32 h.
  Remaining weekly capacity: 112 − 32 = 80 h, distributed Mon, Thu, Fri (3 days × 2 techs × 8 h × 0.70 = 33.6 h per pair-of-techs-day ⇒ effectively ~16 h per tech-day × 3 days × 2 techs ≈ ~80 h).
  Load 10 more WOs of 8 h each = 80 h (Mon, Thu, Fri).
  Total scheduled = 14 WOs × 8 h = 112 h, matching available capacity exactly.

**Step 6 — Backlog deferral.**
  WOs not scheduled this week: 4 (the remaining cell-A WOs at 28 h + any others above 112 h). They age in backlog; the planner re-verifies scope at 4 weeks; at 8 weeks they are re-planned or canceled.

**Step 7 — Schedule Compliance target.**
  Target ≥85% ⇒ of 14 WOs scheduled, ≥12 must be completed as scheduled. The scheduler tracks this daily in the daily scheduling meeting.

**Result.** Weekly schedule = 14 WOs × 8 h = 112 h, capacity-leveled. Backlog weeks ≈ 1.39 (low; investigate why backlog is shrinking — either execution is out-pacing planning, or planning is gated on parts). Cell-A window conflict resolved by deferring 28 h of cell-A work to the next window. Schedule-compliance target ≥85%.`,
    industrial_example: `**Manufacturing — paint-cell window.** The example above is the canonical manufacturing scheduling problem: a 2-day cell-A window drives 60 h of work into 32 h of capacity. The scheduler must either negotiate a 3rd day of window with Operations, defer 28 h, or move some of the work off-window with containment (e.g., pump rebuilds done in the shop while the line runs).

**Power — planned unit outage.** A 600-MW coal unit has a 21-day planned outage every 4 years. The scheduler sequences ~2,400 WOs (boiler, turbine, generator, ESP, FGD) against a 60-tech, 12-h, 7-day capacity = 60 × 12 × 7 × 0.7 = 3,528 h/week × 3 weeks = 10,584 craft-hours, with a 12-week rolling lookahead for long-lead parts and specialty labor (NDE crews, turbine OEM rep, scaffold contractor).

**Container Terminal — RTG crane.** A single RTG crane is released for 8 h per week of maintenance. The scheduler sequences ~6 h of preventive work and 2 h of small corrective against the window; emergent RTG work is dispatched from a standby crew. Schedule compliance on the RTG fleet is the terminal's #1 availability KPI.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** A regional Power utility has 8 oil-fired peaking units at 4 sites. Each unit runs ~1,500 h/year and is offline otherwise. The maintenance scheduler inherits a backlog of 980 craft-hours and 14 technicians (3.5/site) on a 40-h week with 25% non-productive ⇒ 14 × 40 × 0.75 = 420 available h/week ⇒ backlog weeks = 980/420 ≈ 2.33. Good. But the scheduler discovers the backlog is bimodal: 420 h of unit-window work that requires the unit offline, and 560 h of shop-build / mobile-equipment work that does not. The 560 h is scheduled flat; the 420 h waits for unit windows (one weekend per month per unit, ~8 h window). The scheduler re-balances: 4 weekend windows per month × 8 h × 2 techs = 64 h/month unit-window capacity ⇒ 420 h requires ~7 weeks of windows. The scheduler publishes a 7-week lookahead with the windows; Operations commits; schedule compliance rises from 51% (pre-pilot) to 84% (post-pilot). The case shows that capacity leveling must distinguish unit-window-restricted work from unrestricted work.`,
    visual_explanation: `- **Capacity-vs-backlog bar chart**: weekly capacity (green bar) vs. backlog (amber bar); backlog weeks annotated. The chart is the scheduler's weekly dashboard.
- **Skill-mix matrix**: rows = trade (Mech/Elec/I&C/Rigging/Civil), columns = day (Mon–Sun), cell = tech-hours scheduled. Heatmap of over/under-load.
- **Gantt for the weekly schedule**: each WO is a bar on its scheduled window; cell-A window shown as a shaded region Tuesday-Wednesday.
- **Backlog aging Pareto**: WO counts by aging bucket (0–2 w, 2–4 w, 4–8 w, 8+ w); the 8+ bucket is the "re-plan or cancel" queue.`,
    simulation_opportunity: `A scheduling sim would present the learner with a backlog list, a capacity/skill-mix matrix, an equipment-availability calendar, and a "publish week" button. The simulator scores: (a) capacity-leveled arithmetic (sum ≤ capacity), (b) skill-mix matching (no trade violations), (c) window-matching (cell-A WOs only in cell-A windows), (d) backlog-weeks in target band, (e) emergent-work response (does the learner correctly displace the lowest-priority scheduled WO?). A second tier injects realistic disturbances (illness, weather, parts-stockout at T-0).`,
    common_mistakes: `- **Scheduling unplanned work**: the scheduler loads a WO with no BOM or no labor estimate into the week — the schedule is broken from T-0.
- **Over-loading the week**: scheduling 140 h against 112 h of capacity guarantees breakage; the schedule becomes fiction.
- **Skipping the daily scheduling meeting**: without the daily stand-up, the week-ahead schedule ages out by Tuesday; emergent work overwhelms the plan.
- **Not distinguishing schedule compliance from schedule adherence**: a plant may have 90% adherence but 50% compliance (craft worked scheduled hours on different jobs than the schedule said). Both KPIs are required.
- **No backlog aging review**: WOs age 12+ weeks silently, then a critical PM is overdue and a failure occurs.
- **Single skill-bucket arithmetic**: the scheduler treats 4 techs as fungible, but an I&C tech cannot do a mechanical alignment; the schedule breaks on Tuesday morning.
- **Scheduling specialty resources late**: the crane is double-booked; one WO waits on the crane, the schedule breaks.
- **Treating the weekly schedule as a wish-list**: the schedule is a contract — if Maintenance does not finish what it commits, Operations stops releasing windows.`,
    limitations: `- Scheduling cannot rescue a broken planning function: unplanned WOs in the schedule break the schedule from T-0.
- Capacity leveling assumes the labor estimate is accurate within ±15%; larger estimate error breaks the schedule even when arithmetic is right.
- Schedule compliance is gated by Operations honoring equipment-availability windows — a Maintenance-only KPI is misleading if Operations is not at the table.
- Backlog weeks is a single-number summary; it hides the bimodal distribution (window-restricted vs. unrestricted work) that requires separate scheduling logic.`,
    comparison: `- **Scheduling vs. Planning**: planning produces the WO package; scheduling matches it to capacity. Both are required.
- **Scheduling vs. Dispatching**: scheduled work is sequenced in advance; dispatched work is dispatched at execution time (emergent breakdowns). Dispatch is real-time; scheduling is forward-looking.
- **Scheduling vs. Supervision**: the scheduler publishes the schedule; the supervisor directs the craft on the day. The supervisor is the scheduler's customer.
- **Daily vs. Weekly vs. Monthly cadence**: daily = execution; weekly = commitment; monthly = lookahead/outage coordination. Skipping any cadence breaks the cycle.`,
    practical_application: `- **Daily (15 min, morning)**: review yesterday's completion %, set today's schedule, surface emergent work, allocate stand-by crew.
- **Weekly (45 min, mid-week)**: review the 4-week lookahead, commit Operations windows, lock the next-week schedule.
- **Monthly (60 min)**: review 12-week lookahead, plan outage/turnaround coordination, sequence long-lead parts.
- **Continuous**: track schedule compliance and schedule adherence daily; track backlog weeks weekly; manage aging >4 weeks (re-plan) and >8 weeks (cancel).`,
    decision_scenario: `You are the maintenance scheduler at a Container Terminal. Capacity: 5 RTG techs × 10 h × 6 days = 300 h/week; non-productive 25% ⇒ 225 available h/week. Backlog = 280 craft-hours of planned WOs, of which 140 h require a crane-down window (RTG out of service). Crane-down windows: 1 RTG per week × 8 h × 1 tech crew (3 techs) = 24 h/week. Backlog weeks = 280/225 ≈ 1.24 weeks (LOW). But the 140 h of crane-down work at 24 h/week capacity ⇒ 5.8 weeks of crane-down backlog (HIGH). Decision: schedule flat work at 225 h/week (clear in 0.6 weeks), but the crane-down backlog needs a 2nd crane-down window per week OR weekend overtime. Recommend weekend overtime: 1 weekend crane-down window × 8 h × 3 techs = 24 h extra ⇒ crane-down backlog clears in ~2.9 weeks. The flat work backlog is too small; the planner needs to generate more planned work — flat backlog <1 week is brittle.`,
    practice_questions: `- Compute weekly available capacity for 6 techs × 10 h × 5 days × 0.75 productivity. *(Answer: 225 h.)*
- Backlog = 320 h; weekly capacity = 160 h. Compute backlog weeks. *(Answer: 2.0 — in target band.)*
- 12 WOs scheduled, 9 completed as scheduled. Compute schedule compliance. *(Answer: 75% — below the 85% target.)*
- 140 craft-hours worked; of which 105 were on scheduled jobs. Compute schedule adherence. *(Answer: 75%.)*
- A WO has been in the backlog 9 weeks. What action should the scheduler take? *(Answer: re-plan or cancel.)*`,
    certification_questions: `The CMRP exam tests Scheduling as the second WM competency. SMRP-aligned prompts:

(a) Compute weekly capacity from a labor roster and a non-productive factor.

(b) Compute backlog weeks and recommend an action (re-plan, add contractor, defer).

(c) Distinguish schedule compliance from schedule adherence.

(d) Identify the correct sequencing action when the work mix exceeds a cell-down window capacity (defer vs. negotiate vs. off-window with containment).

The questions in this lesson's question bank are aligned to these Scheduling competencies.`,
    summary: `Scheduling matches planned WOs to available labor-hours, equipment windows, and operating constraints over daily, weekly, and monthly horizons. The scheduler's arithmetic (capacity leveling) is simple; the scheduler's coordination (the daily/weekly/monthly meetings) is hard. Schedule Compliance (≥85%) and Schedule Adherence (≥85%) are the two KPIs; backlog weeks (2–4) is the balancing metric. Scheduling cannot rescue a broken planning function, but a credible schedule is the entry gate to a credible wrench-time and reliability-improvement program.`,
    key_takeaways: `- Weekly capacity = techs × hours × days × (1 − non-productive %).
- Backlog weeks target 2–4 (brittle if <1, stale if >6).
- Schedule Compliance (jobs completed as scheduled / jobs scheduled) ≥85%.
- Schedule Adherence (scheduled craft-hours / total craft-hours worked) ≥85%.
- Only planned work is scheduled; emergent work is dispatched.
- The daily/weekly/monthly scheduling meetings are non-negotiable cadences.`,
    references: `- SMRP. *CMRP Body of Knowledge — Work Management pillar: Scheduling.*
- SMRP. *CMRP Exam Outline.*
- ISO 55002:2018, *Guidelines for the application of ISO 55001*, operational planning.
- Mobley, R. K. (2008). *Maintenance Engineering Handbook* (7th ed.). McGraw-Hill. §II.6.
- Campbell, J. D. & Jardine, A. K. S. (2001). *Maintenance Strategy*. Productivity Press. Ch. 7.
- Palmer, R. (2012). *Maintenance Planning and Scheduling Handbook* (2nd ed.). Elsevier. Ch. 9–13.
- Ledet, W. (1999). *Maintenance Planning and Scheduling*. (Training workshop, widely-cited capacity-leveling practices.)
- O'Hanlon, T. (2006). *Uptime*. Industrial Press.`,
  },
  knowledgeObject: {
    title: "Work scheduling — capacity leveling & backlog management",
    domain: "Work Management",
    competency: "Scheduling",
    topic: "Scheduling",
    concept: "Schedule & backlog",
    body: {
      definitions: [
        "Schedule: time-sequenced assignment of planned WOs to labor, equipment windows, and dates over a defined horizon.",
        "Scheduler: builds the schedule; runs the daily/weekly scheduling meeting; does not plan jobs or supervise craft.",
        "Backlog: planned-but-not-scheduled WO hours, aged by WO create date.",
        "Backlog weeks: total backlog craft-hours / weekly available craft-hours (target 2–4 weeks).",
        "Capacity leveling: matching work queue to available labor-hours per skill bucket.",
        "Schedule Compliance: jobs completed as scheduled / jobs scheduled × 100 (target ≥85%).",
        "Schedule Adherence: craft-hours on scheduled jobs / total craft-hours worked × 100 (target ≥85%).",
        "Rolling lookahead: 4-week (typical) forward view for long-lead parts and specialty-labor conflicts.",
        "Equipment-availability window: time block when Operations releases the asset to Maintenance.",
      ],
      principles: [
        "Only planned work is scheduled; emergent work is dispatched.",
        "Capacity leveling: schedule sums to no more than available craft-hours per skill bucket.",
        "The schedule is a contract: Operations commits windows; Maintenance commits work.",
        "Backlog managed to 2–4 weeks (brittle <1, stale >6).",
        "Three scheduling cadences: daily (15 min), weekly (45 min), monthly (60 min).",
        "Skill-mix matched — no trade violations.",
      ],
      components: [
        "Planned-work backlog query (status = Planned — Ready to Schedule).",
        "Weekly capacity = N × H × D × (1 − NP) per skill bucket.",
        "Equipment-availability calendar.",
        "Skill-mix matrix.",
        "Long-lead and specialty-labor tracker.",
        "Daily/weekly/monthly scheduling meeting cadence.",
        "Schedule-compliance & schedule-adherence reporting.",
      ],
      mechanism: [
        "Pull backlog → compute capacity → list windows → sort by priority → sequence WOs to capacity → reserve specialty resources → publish week-ahead → run daily meeting → track compliance → manage backlog aging.",
      ],
      process: [
        "1. Pull planned backlog from CMMS.",
        "2. Compute weekly available capacity per skill bucket.",
        "3. List equipment-availability windows from Operations.",
        "4. Sort backlog by priority (safety > compliance > critical-asset > PM-due > corrective > improvement).",
        "5. Sequence WOs to capacity: deduct labor estimate from matching skill bucket until week is full.",
        "6. Reserve specialty resources on 4-week lookahead.",
        "7. Publish week-ahead schedule; run weekly scheduling meeting.",
        "8. Run daily scheduling meeting (yesterday's completion, today's schedule, emergent work).",
        "9. Track schedule compliance daily; log breaks with reason code.",
        "10. Manage aging: 4+ weeks re-plan; 8+ weeks re-plan or cancel.",
      ],
      formulas: [
        "Weekly Capacity = N × H × D × (1 − NP) [h/week].",
        "Backlog Weeks = Total backlog craft-hours / Weekly available craft-hours [weeks]. Target 2–4.",
        "Schedule Compliance = (Jobs completed as scheduled) / (Jobs scheduled) × 100 [%]. Target ≥85%.",
        "Schedule Adherence = (Craft-hours worked on scheduled jobs) / (Total craft-hours worked) × 100 [%]. Target ≥85%.",
      ],
      metrics: [
        "Schedule Compliance (≥85%; world-class ≥90%).",
        "Schedule Adherence (≥85%).",
        "Backlog weeks (2–4 target).",
        "Backlog aging distribution (Pareto by 0–2 / 2–4 / 4–8 / 8+ week buckets).",
        "Capacity utilization (scheduled h / available h).",
      ],
      examples: [
        "Manufacturing paint cell: 4 techs × 8 h × 5 d × 0.7 = 112 h/week. Cell-A window Tue-Wed = 32 h capacity. 60 h of cell-A WOs ⇒ 32 h scheduled, 28 h deferred to next window.",
        "Power planned outage: 21-day outage; 60 tech × 12 h × 7 d × 0.7 = 3,528 h/week × 3 = 10,584 h; ~2,400 WOs sequenced on a 12-week lookahead.",
        "Container Terminal RTG: 1 RTG × 8 h window/week, 3-tech crew = 24 h/week crane-down capacity.",
      ],
      industrial_examples: [
        "Manufacturing — paint-cell window conflict drives 60 h of work into 32 h of capacity; resolve by deferral or off-window with containment.",
        "Power — planned unit outage (21 d, 60 tech, 12-week lookahead) is the canonical outage-scheduling problem.",
        "Container Terminal — RTG crane-down window is the bottleneck; crane-down backlog tracks separately from flat backlog.",
        "Power utility — bimodal backlog (unit-window-restricted vs. unrestricted) requires separate scheduling logic.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Power utility, 8 oil-fired peakers at 4 sites. 980 h backlog, 14 techs × 40 h × 0.75 = 420 h/week ⇒ BW 2.33. Bimodal: 420 h unit-window work + 560 h flat. Re-balanced flat at 420 h/week; unit-window at 64 h/month ⇒ 7 weeks of windows for 420 h. Schedule compliance 51%→84%.",
      ],
      common_errors: [
        "Scheduling unplanned WOs (no BOM, no estimate) — schedule breaks at T-0.",
        "Over-loading the week (140 h against 112 h capacity).",
        "Skipping the daily scheduling meeting.",
        "Confusing schedule compliance with schedule adherence (both required).",
        "No backlog-aging review (8+ week WOs age silently).",
        "Single skill-bucket arithmetic (I&C tech ≠ mechanical alignment).",
        "Specialty resources double-booked (crane, scaffold).",
        "Treating the schedule as a wish-list instead of a contract.",
      ],
      limitations: [
        "Cannot rescue a broken planning function.",
        "Capacity leveling assumes estimate accuracy ±15%.",
        "Schedule compliance is gated by Operations honoring windows — Maintenance-only KPI is misleading.",
        "Backlog weeks hides bimodal distribution (window-restricted vs. unrestricted work).",
      ],
      best_practices: [
        "Schedule only planned WOs.",
        "Capacity-level per skill bucket — never over-load.",
        "Run the daily/weekly/monthly cadences with fixed agendas.",
        "Track schedule compliance AND schedule adherence.",
        "Manage backlog aging: 4+ weeks re-plan; 8+ weeks cancel.",
        "Publish a 4-week rolling lookahead for specialty resources.",
        "Treat the schedule as a contract between Operations and Maintenance.",
      ],
      related_concepts: [
        "Planning (previous competency).",
        "Work Execution (next competency).",
        "CMMS — backlog query and WO status transitions.",
        "ISO 55002:2018 operational planning.",
      ],
      prerequisites: [
        "Planning lesson (Lesson 1).",
        "CMMS navigation: backlog query, WO status, labor calendar.",
        "Plant operating schedule (which units run/down).",
        "Basic resource-leveling arithmetic.",
      ],
      references: [
        "SMRP CMRP BOK — WM pillar: Scheduling.",
        "SMRP CMRP Exam Outline.",
        "ISO 55002:2018 operational planning.",
        "Mobley (2008), §II.6.",
        "Campbell & Jardine (2001), Ch. 7.",
        "Palmer (2012), Ch. 9–13.",
        "Ledet (1999), Maintenance Planning and Scheduling (training workshop).",
        "O'Hanlon (2006), Uptime.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Scheduling",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Manufacturing",
      stem: "A Manufacturing plant has 4 mechanical technicians × 8 h × 5 days with 30% non-productive time. What is the weekly available craft-hour capacity?",
      whyCorrect:
        "Weekly capacity = 4 × 8 × 5 × (1 − 0.30) = 160 × 0.70 = 112 h/week. The 30% non-productive factor accounts for breaks, training, meetings, and waiting.",
      whyOthersWrong: [
        "160 h is the gross weekly capacity (4 × 8 × 5) without subtracting non-productive time — that over-states available time and will over-load the schedule.",
        "128 h would result from multiplying 160 × 0.80 (a 20% non-productive factor) — but the problem states 30%.",
        "80 h is half of 160, which is not how the productivity factor is applied (it's multiplicative, not halving).",
      ],
      explanation:
        "Capacity = N × H × D × (1 − NP). Non-productive time must be subtracted; scheduling to gross capacity (160 h) guarantees schedule breakage.",
      options: [
        { text: "112 h/week", isCorrect: true },
        { text: "160 h/week", isCorrect: false },
        { text: "128 h/week", isCorrect: false },
        { text: "80 h/week", isCorrect: false },
      ],
    },
    {
      competencyName: "Scheduling",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Container Terminal",
      stem: "A Container Terminal has 280 craft-hours of planned backlog and a weekly available capacity of 225 h. What are the backlog weeks, and what action is indicated?",
      whyCorrect:
        "Backlog weeks = 280 / 225 ≈ 1.24 weeks. This is BELOW the 2–4 week target band — the schedule is brittle and the planner must generate more planned work, OR execution is out-pacing planning.",
      whyOthersWrong: [
        "2.0 weeks would be 450/225 — but the backlog is 280, not 450; dividing 280/225 = 1.24.",
        "5.8 weeks would only be correct if backlog were ~1,300 h — that's far above the stated 280 h.",
        "In-target (2–4 weeks) is wrong because 1.24 is below the 2-week lower bound of the target band.",
      ],
      explanation:
        "Backlog weeks = total backlog / weekly capacity. The 2–4 week target band prevents brittle schedules (<1 week) and stale backlogs (>6 weeks).",
      options: [
        { text: "1.24 weeks — below target; planner must generate more planned work or investigate execution out-pacing planning", isCorrect: true },
        { text: "2.0 weeks — in target band; no action needed", isCorrect: false },
        { text: "5.8 weeks — above target; defer or cancel aged WOs", isCorrect: false },
        { text: "0.80 weeks — severely brittle; engage contractor immediately", isCorrect: false },
      ],
    },
    {
      competencyName: "Scheduling",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "DecisionMaking",
      skillType: "Conceptual",
      scenario: "Container Terminal",
      stem: "A terminal's flat backlog is 0.6 weeks (LOW) but the crane-down backlog is 5.8 weeks (HIGH). Crane-down capacity is 24 h/week. Which is the BEST scheduling decision?",
      whyCorrect:
        "Add weekend overtime to add a 2nd crane-down window (1 × 8 h × 3 techs = 24 h extra/week ⇒ crane-down backlog clears in ~2.9 weeks). The flat backlog is too small (the planner needs to generate more planned work), but the lever on the crane-down backlog is overtime — not adding flat capacity.",
      whyOthersWrong: [
        "Engage a contractor for flat work — the flat backlog is not the problem; flat capacity is fine, the crane-down window is the constraint.",
        "Defer the flat work — deferring flat work makes the brittle flat backlog worse, not better.",
        "Cancel aged crane-down WOs — at 5.8 weeks, the crane-down backlog is high but not yet aged 8+ weeks; canceling before re-verification wastes planned work.",
      ],
      explanation:
        "The bimodal backlog requires separate scheduling logic; adding capacity to the constrained resource (crane-down window via overtime) is the correct lever. The flat work backlog is brittle but that is a planning-side issue.",
      options: [
        { text: "Add weekend overtime for a 2nd crane-down window (24 h extra/week) and alert the planner to grow flat backlog", isCorrect: true },
        { text: "Engage a contractor to clear the flat work backlog", isCorrect: false },
        { text: "Defer the flat work and re-allocate the flat crew to crane-down work", isCorrect: false },
        { text: "Cancel the aged crane-down WOs (>4 weeks) immediately", isCorrect: false },
      ],
    },
    {
      competencyName: "Scheduling",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which formula correctly defines Schedule Compliance?",
      whyCorrect:
        "Schedule Compliance = (Jobs completed as scheduled) / (Jobs scheduled) × 100. 'Completed as scheduled' means started AND finished within the scheduled window.",
      whyOthersWrong: [
        "Craft-hours worked on scheduled jobs / total craft-hours worked is the formula for Schedule Adherence, not Schedule Compliance.",
        "WOs created / WOs closed this week measures WO throughput, not schedule compliance.",
        "Planned craft-hours / total craft-hours worked is the % Planned Work (a Planning KPI, not a Scheduling KPI).",
      ],
      explanation:
        "SC and SA are distinct: SC measures whether scheduled jobs finished in their window; SA measures whether craft-hours went to scheduled vs. emergent work.",
      options: [
        { text: "(Jobs completed as scheduled) / (Jobs scheduled) × 100", isCorrect: true },
        { text: "(Craft-hours worked on scheduled jobs) / (Total craft-hours worked) × 100", isCorrect: false },
        { text: "(WOs created this week) / (WOs closed this week) × 100", isCorrect: false },
        { text: "(Planned craft-hours) / (Total craft-hours worked) × 100", isCorrect: false },
      ],
    },
    {
      competencyName: "Scheduling",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: Schedule Compliance and Schedule Adherence measure the same thing and only one need be tracked.",
      whyCorrect:
        "False. They measure different things. SC = jobs completed as scheduled / jobs scheduled (a count of WOs). SA = craft-hours on scheduled jobs / total craft-hours worked (a ratio of hours). A plant can have 90% SA but 50% SC — the craft worked scheduled hours but on different jobs than the schedule said.",
      whyOthersWrong: [
        "True — both are required precisely because they answer different questions; tracking only one hides a class of schedule breakage.",
      ],
      explanation:
        "SC is a count-based WO metric; SA is an hour-based craft metric. Both are required to understand whether the schedule is a contract.",
      options: [
        { text: "False", isCorrect: true },
        { text: "True", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Work Execution
// ---------------------------------------------------------------------------

const LESSON_WORK_EXECUTION: RefLesson = {
  competencyName: "Work Execution",
  slug: "wm-work-execution",
  title: "Work Execution, Closeout & Wrench-Time",
  titleAr: "تنفيذ العمل والإغلاق وزمن المفتاح",
  order: 3,
  durationMin: 26,
  references: WM_REFERENCE_TITLES,
  conceptIntroduction: `Work execution is where the planned and scheduled job is actually performed by the craft. The CMRP BOK frames execution not as "just doing the work" but as a measurement opportunity: wrench time, value-added time, and the closeout data that feeds reliability analytics. A world-class plant captures the actuals (labor-hours, parts, failure code, findings) on every WO and uses them to close the planning and scheduling feedback loops. Wrench-time — the percentage of paid craft time spent in direct value-added work — is the diagnostic metric for execution discipline.`,
  example: `A shift is 8 hours (480 minutes). Of those, the maintenance technician spends: 30 min in the daily scheduling meeting + 25 min on permit acquisition + 45 min retrieving parts + 30 min retrieving tools + 270 min on direct wrench work + 60 min waiting for crane + 20 min on breaks. Direct wrench time = 270/480 = 56.3%. World-class is ≥55%. The non-value-added breakdown (permit, parts, tools, waiting, breaks) is the improvement target.`,
  keyFormulas: `Wrench Time = Direct value-added work time [min] / Total paid time [min] × 100 (target ≥40%; world-class ≥55%)
Value-Added Ratio = Value-added work / Total craft-hours × 100
WO Closeout Rate = (WOs closed within 24 h of completion) / (Total WOs completed) × 100 (target ≥95%)
Failure-Code Capture Rate = (WOs with valid failure code at closeout) / (Total corrective WOs closed) × 100 (target ≥95%)`,
  exercise: `You shadow a technician for an 8-hour shift and record: 35 min meeting, 30 min permit, 20 min parts retrieval, 15 min tool retrieval, 240 min direct wrench work, 90 min waiting for Operations to release the asset, 50 min on breaks. Compute wrench time and identify the two largest non-value-added buckets.`,
  sections: {
    learning_objectives: `- Define wrench time and distinguish it from the broader "value-added ratio."
- Perform a wrench-time study using a structured observation form (5–15 min sample interval).
- Classify craft activity into value-added, non-value-added-but-necessary, and non-value-added waste.
- Close out a WO correctly: actuals, parts consumed, failure code, findings, post-job QC.
- Explain why failure-code capture is the upstream lever for reliability analytics (MTBF, bad-actor, RCA).
- Recognize the supervisor's role in execution and the daily execution meeting cadence.`,
    prerequisites: `- Lessons on Planning and Scheduling (Lessons 1 and 2): the craft only executes planned, scheduled WOs.
- CMMS navigation: WO status transitions (Released → Assigned → In-Progress → Complete → Closed), failure-code entry, actuals entry.
- Plant safety: LOTO, permits, JSA, PPE — applied at execution per the planner's job package.
- Basic time-and-motion observation technique.`,
    introduction: `Execution is the third control point in the work-management cycle. The craft performs the planned, scheduled job; the supervisor directs the craft in real time; and the WO is closed with actuals and failure codes. The CMRP BOK treats execution as a measurement opportunity — not as "just doing the work." Two metrics define the discipline: **wrench time** (the % of paid craft minutes spent on direct value-added work) and **WO closeout quality** (the % of completed WOs with valid actuals, parts, failure code, and findings within 24 h).

Palmer's research (1999 onwards) showed that typical plants have 25–35% wrench time; world-class plants reach 55–65%. The improvement path is rarely "work harder" — it is almost always "remove the non-value-added waiting, searching, and re-doing that the craft currently performs." The 30 percentage-point gap (35% → 65%) is therefore a process problem, not a worker-effort problem.

ISO 55001:2014 treats work execution as the operationalization of the asset-management plan; ISO 55002:2018 emphasizes that execution must capture the data needed to confirm asset-performance objectives. The CMRP BOK lists Work Execution as the third WM competency — the bridge between the schedule and the analytics that drive reliability improvement.`,
    terminology: `- **Wrench Time**: the % of paid craft minutes spent in direct value-added work (target ≥40%; world-class ≥55%).
- **Value-Added Ratio**: value-added work / total craft-hours × 100 — broader than wrench time; includes indirect value (planning the next job, training, cleaning).
- **Value-Added (VA)**: work that directly advances the WO (wrench turning, alignment, welding, testing).
- **Non-Value-Added but Necessary (NVAN)**: permits, LOTO verification, parts retrieval, breaks, training.
- **Non-Value-Added Waste (NVAW)**: waiting for crane, waiting for Operations, searching for tools, re-doing work, traveling to/from the storeroom.
- **WO closeout**: the act of completing a WO with actuals (labor + parts), failure code, findings, and post-job QC. Target ≥95% closed within 24 h.
- **Failure Code**: a structured tag from a controlled taxonomy (e.g., FC-104 = Bearing — lubrication/contamination) attached at WO closeout.
- **Finding**: a free-text (or structured) observation captured at closeout (e.g., "shaft journal fretting 0.08 mm depth — recommend send to shop for regrind").
- **Daily execution meeting**: the 15-min stand-up where the supervisor reviews yesterday's completion and assigns today's WOs to the crew.`,
    detailed_explanation: `Execution has two faces. The first is the work itself — the craft performing the planned, scheduled job safely, correctly, and within estimate. The second is the measurement of execution — the structured observation (wrench-time study) that diagnoses where the craft's paid minutes actually go. Both faces are required.

**The wrench-time study** is a structured observation. A trained observer (often a planner or a reliability engineer) shadows a craft for a shift and samples activity at a 5–15 min interval. Each sample is classified into one of three buckets: VA (wrench turning, alignment, welding, testing), NVAN (permits, LOTO verify, parts retrieval, breaks, training), or NVAW (waiting for crane, waiting for Operations, searching, re-doing, traveling). The percentage of samples classified VA is the wrench-time estimate. The Pareto of NVAW samples is the improvement target.

Typical results: a plant with 25–35% wrench time has 40–50% of paid minutes in NVAW. The biggest NVAW buckets are usually (i) waiting for the asset to be released by Operations, (ii) waiting for permits / LOTO, (iii) searching for tools/parts not on the planner's BOM, and (iv) traveling to/from the storeroom. Each bucket has a known fix: (i) tighter scheduling meetings with Operations, (ii) permits applied at planning time, (iii) BOM cleanup and kitting, (iv) pre-staged kits and a satellite crib.

**WO closeout quality** is the second lever. Every closed WO must capture: (a) actual labor-hours by skill, (b) parts consumed (with bin-issue transactions), (c) a valid failure code from the controlled taxonomy, (d) findings (free-text or structured), and (e) post-job QC results. The target is ≥95% closed within 24 h of completion. The closeout drives the planning feedback loop (estimate vs. actual), the reliability analytics (MTBF by failure code), and the bad-actor analysis (top-10 failure code by frequency and cost).

**Failure-code discipline** is the most common breakdown. A WO closed with "general corrective" or no code wastes the analytical value of the WO. The taxonomy must be (i) controlled (a maintained list, not free text), (ii) at the right granularity (5–15 codes per equipment class — too few hides signal, too many scatters it), and (iii) enforced (the CMMS rejects closeout without a valid code). Plants with disciplined failure-code capture can compute MTBF by failure mode within 90 days; plants without it cannot compute MTBF at all.

The supervisor's role is execution-time direction: assigning the day's WOs to the crew, breaking the schedule when emergent work arrives, and signing off on the closeout. The supervisor is the scheduler's customer and the planner's feedback source. World-class plants separate the supervisor from the planner and from the scheduler — the three roles are distinct.`,
    core_principles: `- Execution is a measurement opportunity, not just "doing the work."
- Wrench time is a process problem, not a worker-effort problem — the gap to world-class is removed by fixing NVAW, not by working harder.
- WO closeout quality is the upstream lever for reliability analytics.
- Failure-code discipline must be controlled, right-granularity, and enforced.
- The supervisor directs the craft in real time; the planner and scheduler do not.
- Three roles separated: planner, scheduler, supervisor.`,
    components: `- **Daily execution meeting**: 15-min stand-up; supervisor reviews yesterday's completion and assigns today's WOs.
- **Wrench-time study**: structured observation form, 5–15 min sample interval, VA/NVAN/NVAW classification.
- **WO closeout workflow**: actuals + parts + failure code + findings + QC.
- **Failure-code taxonomy**: controlled, right-granularity (5–15 codes per equipment class).
- **Findings capture**: free-text or structured observations driving RCA.
- **Daily/weekly execution KPI dashboard**: wrench time, closeout rate, failure-code capture rate, schedule compliance (feedback from Scheduling).`,
    process: `1. **Receive the daily schedule** from the scheduler in the morning stand-up.
2. **Assign WOs** to the crew by skill mix; confirm permits and LOTO with Operations.
3. **Pre-stage parts and tools** via the storeroom kit/pull for the day's WOs.
4. **Execute the WO** per the planner's procedure; capture labor time on the WO.
5. **If emergent work arrives**, the supervisor breaks the schedule — defer the lowest-priority scheduled WO, log the break reason, dispatch the crew to the emergent work.
6. **Perform post-job QC** per the acceptance criteria; record the result (alignment TIR, vibration, hydrotest).
7. **Close out the WO**: enter actuals, consume parts (bin-issue), select the failure code, write the finding, set WO status = Closed.
8. **Within 24 h of completion** — closeout target ≥95%.
9. **Pareto the failure codes** monthly — top-10 by frequency and cost drive RCA and bad-actor analysis.
10. **Perform a wrench-time study** quarterly (or per improvement project) on each crew — diagnose NVAW and target the biggest bucket.`,
    formula_calculation: `- **Wrench Time**:
  WT = Direct value-added work time [min] / Total paid time [min] × 100
  Variables: VA time [min] = sum of sample intervals classified VA; total paid time [min] = shift length × number of techs observed. Units: [%]. Target ≥40%; world-class ≥55%; best-in-class ≥65%.
- **Value-Added Ratio**:
  VAR = Value-added work [h] / Total craft-hours worked [h] × 100
  Broader than WT; includes indirect VA (planning next job, training, cleaning). Target ≥60%.
- **WO Closeout Rate**:
  WOCR = (WOs closed within 24 h of completion) / (Total WOs completed) × 100
  Target ≥95%. Below 70% the planning feedback loop and reliability analytics degrade.
- **Failure-Code Capture Rate**:
  FCCR = (Corrective WOs closed with a valid failure code) / (Total corrective WOs closed) × 100
  Target ≥95%. Excludes PMs (PMs have no failure code by design).
- **NVAW Pareto**: list of NVAW buckets (waiting Operations, waiting permits, parts search, tool search, traveling, re-doing) sorted descending by total minutes — the top 2 buckets are the improvement targets.`,
    worked_example: `**Problem.** A reliability engineer shadows a mechanical technician for an 8-hour (480-min) shift at a Power plant. The activity log (15-min samples, 32 samples total):

| Activity | Min | Class |
|---|---|---|
| Daily execution meeting | 30 | NVAN |
| Permit acquisition + LOTO | 25 | NVAN |
| Parts retrieval (storeroom) | 45 | NVAW |
| Tool retrieval (scaffold, crane booking) | 30 | NVAW |
| Direct wrench work (bearing R&R, alignment, run-in) | 270 | VA |
| Waiting for Operations to release asset | 60 | NVAW |
| Breaks | 20 | NVAN |
| **Total** | **480** | |

Compute (a) wrench time, (b) value-added ratio, (c) NVAW %, (d) identify the two largest improvement targets.

**Step 1 — Wrench time.**
  WT = 270 / 480 × 100 = **56.25%.**

**Step 2 — Value-Added Ratio** (broader; here = WT since no indirect VA was logged):
  VAR = 270 / 480 × 100 = **56.25%.**

**Step 3 — NVAW %.**
  NVAW = (45 + 30 + 60) / 480 × 100 = 135 / 480 × 100 = **28.13%.**
  NVAN = (30 + 25 + 20) / 480 × 100 = 75 / 480 × 100 = **15.63%.**

**Step 4 — NVAW Pareto (descending).**
  1. Waiting for Operations = 60 min (12.5% of shift).
  2. Parts retrieval = 45 min (9.4%).
  3. Tool retrieval = 30 min (6.3%).

**Step 5 — Improvement targets.**
  (i) **Waiting for Operations** — fix: tighter daily scheduling meeting; Operations commits windows 24 h ahead; if Operations misses the window, the schedule-break reason is "Operations-window broken" and is logged.
  (ii) **Parts retrieval** — fix: BOM cleanup and kitting; planner pre-stages the day's kit at the satellite crib; storeroom delivers the kit to the job site at 7:00 AM.

**Step 6 — Projected wrench time after fixes.**
  If parts-retrieval drops from 45 to 10 min (kit delivery) and waiting for Operations drops from 60 to 15 min (tighter scheduling meeting), NVAW drops from 135 to 55 min ⇒ WT = (270 + 35 + 5) / 480 = 310/480 = 64.6% (best-in-class).

**Result.** Current WT = 56.3% (above world-class floor of 55% — but with significant NVAW); after fixing the two largest NVAW buckets, projected WT ≈ 64.6% (best-in-class). The 8.4 percentage-point lift is achievable by process changes, not by working harder.`,
    industrial_example: `**Power — main-steam-valve actuator overhaul.** A 24-inch main-steam valve actuator overhaul is 80 craft-hours across 3 days. The wrench-time study on this job typically shows 35–45% WT — heavy NVAW from crane scheduling, scaffolding, and waiting on Operations to release the steam line. The fix is outage-style coordination (crane booked at T-72 h, scaffold at T-48 h, Operations release at T-0), which lifts WT to 55–65%.

**Chemical — rotating-equipment shop crew.** A shop crew (no field travel) typically shows 60–70% WT — minimal NVAW because parts and tools are at the bench, no permits required. This is the world-class benchmark for shop crews.

**Container Terminal — RTG crane crew.** An RTG crew that travels between cranes typically shows 35–45% WT due to travel time and waiting for crane-down. The fix is a rolling-maintenance schedule (one crane down per day by rotation) that converts travel-and-wait to a fixed-window pattern, lifting WT to 50–55%.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** A mid-sized Chemical plant performed a 4-week wrench-time study across all 6 maintenance crews (24 techs). Baseline WT = 31% (composite). The NVAW Pareto was dominated by: (1) parts retrieval from the central storeroom (28% of NVAW), (2) waiting for Operations to release the asset (22%), (3) permit acquisition at execution time (16%), (4) re-doing work because the procedure was guessed at (12%). The plant invested in: (a) 4 satellite cribs at the 4 main process units, (b) a tighter daily scheduling meeting with Operations committing windows 24 h ahead, (c) JSA applied at planning time (permits pre-requested), (d) a standard-job library clean-up so the procedure was always attached. After 6 months, WT rose to 47%. The remaining NVAW Pareto was bimodal — waiting for Operations (now 35% of NVAW) and travel between units (24%). The next investment was a kitting program (storeroom delivers the day's kit to the job site at 7 AM), projected to lift WT to 55%. The case shows that wrench-time improvement is a process-re-engineering program, not a worker-discipline program.`,
    visual_explanation: `- **Wrench-time pie chart**: VA (56%) / NVAN (16%) / NVAW (28%) — the lift target is to convert NVAW to VA, not to compress NVAN.
- **NVAW Pareto bar chart**: descending bars for the 6 NVAW buckets; the top 2 are the improvement targets.
- **Before-and-after wrench-time charts**: side-by-side pies showing the NVAW→VA conversion after the fixes.
- **Daily execution workflow**: morning stand-up → permit/LOTO → pre-staged kit → execute → post-job QC → closeout (within 24 h).`,
    simulation_opportunity: `A wrench-time-simulation game: the learner is the supervisor of a 4-tech crew with a daily schedule of 5 WOs (labor = 32 h) and 480 paid minutes/tech. The simulator injects disturbances (parts stockout, permit delay, Operations-late-release, crane-unavailable, illness). The learner makes trade-offs (defer WO, dispatch to emergent, send tech to storeroom, request overtime). Score: WT %, closeout rate, schedule compliance. A 2nd tier makes the learner the planner or scheduler for the next day with the closeout data from the prior shift.`,
    common_mistakes: `- **Treating wrench time as a worker-effort KPI**: it is a process KPI; low WT means the system is making the craft wait, not that the craft is lazy.
- **Closing WOs without a failure code**: "general corrective" or blank — destroys reliability analytics; MTBF by failure mode cannot be computed.
- **Closeout >24 h**: by the time the tech returns to the WO, the actuals are forgotten; the data quality degrades sharply.
- **Free-text failure codes**: a free-text field scatters the signal; the taxonomy must be controlled.
- **No wrench-time study ever performed**: the NVAW Pareto is invisible; improvement is impossible without a baseline.
- **Capturing actuals only when over-estimate**: under-estimate actuals are often skipped to hide estimate error; the feedback loop is broken.
- **The supervisor also planning**: if the supervisor does the planning, neither job is done well, and the daily execution meeting is skipped.
- **NVAW "fixed" by adding craft**: doubling the crew does not lift WT — it just produces more NVAW per minute of paid time.`,
    limitations: `- Wrench time is sample-based; a single shift's sample has wide confidence intervals. A reliable WT estimate requires ≥5 shifts sampled per crew.
- WT does not measure correctness — a fast (high WT) bad repair is worse than a slow good one.
- The Pareto of NVAW is plant-specific; the "biggest buckets" vary (storage-driven plants vs. permit-driven plants vs. travel-driven plants).
- Wrench-time improvement is a 6–18 month program; quick wins are rare and should be suspect.`,
    comparison: `- **Wrench Time vs. Value-Added Ratio**: WT is direct VA only; VAR includes indirect VA (training, planning, cleaning). WT is the diagnostic; VAR is the broader productivity metric.
- **Wrench Time vs. Schedule Adherence**: SA measures whether craft hours went to scheduled work; WT measures whether the craft's time was value-added. A high-SA / low-WT plant is doing the right jobs inefficiently.
- **VA vs. NVAN vs. NVAW**: VA advances the WO; NVAN is necessary but not value-adding (permits, breaks); NVAW is pure waste (waiting, searching, re-doing). Improvement targets NVAW first.
- **Shop crew vs. Field crew WT**: shop crews typically 60–70% WT (no travel, no permits); field crews typically 35–55% WT.`,
    practical_application: `- **Quarterly**: perform a wrench-time study on each crew (≥5 shifts sampled per crew) — diagnose the NVAW Pareto.
- **Daily**: the supervisor closes out the WO within 24 h with actuals, parts, failure code, and findings.
- **Weekly**: review the WO-closeout rate and failure-code capture rate; surface crews below target.
- **Monthly**: Pareto the failure codes (top-10 by frequency and cost); feed to reliability engineering for RCA and bad-actor analysis.
- **Continuous**: convert the top-2 NVAW buckets via targeted fixes (kitting, satellite cribs, tighter scheduling, permits-at-planning).`,
    decision_scenario: `You are the maintenance manager at a Power plant. Wrench time = 32% (composite across 4 crews). The NVAW Pareto: (1) waiting for Operations to release asset = 31% of NVAW, (2) parts retrieval from central storeroom = 24%, (3) permit acquisition = 18%, (4) re-doing work (no procedure attached) = 12%, (5) travel between units = 10%, (6) waiting for crane = 5%. You can fund ONE project. Rank the projects by projected WT lift:

  (A) Kitting + 4 satellite cribs ($280k): fixes parts retrieval (24% of NVAW → ~5%); projected WT lift 5–7 pp.
  (B) Daily scheduling meeting upgrade + Operations commitment windows ($40k): fixes waiting for Operations (31% → ~12%); projected WT lift 7–9 pp.
  (C) Planner-trained JSA at planning time ($80k): fixes permit acquisition (18% → ~8%); projected WT lift 3–4 pp.
  (D) Standard-job library build ($120k): fixes re-doing work (12% → ~5%); projected WT lift 2–3 pp.

Decision: **(B) first** — lowest cost, highest projected lift, and it unblocks (A) by tightening the schedule the kitting program relies on. Sequence: (B) → (D) → (A) → (C). The combined lift is projected ~20 pp, taking WT from 32% to ~52% (world-class floor).`,
    practice_questions: `- Compute wrench time for a shift with 280 min VA out of 480 min paid. *(Answer: 58.3%.)*
- A WO closed without a failure code. What analytics are lost? *(Answer: MTBF by failure mode; bad-actor analysis by failure code; RCA trigger.)*
- A 480-min shift has 60 min waiting for Operations, 45 min parts retrieval, 30 min tool retrieval, 30 min meeting, 25 min permit. Compute NVAW and NVAN. *(Answer: NVAW = 135 min = 28.1%; NVAN = 55 min = 11.5%.)*
- A wrench-time study shows WT = 33%. World-class floor = 55%. What is the improvement gap in percentage points? *(Answer: 22 pp.)*
- Why is a free-text failure-code field worse than a controlled taxonomy? *(Answer: scatters the signal — MTBF by mode cannot be computed.)*`,
    certification_questions: `The CMRP exam tests Work Execution as the third WM competency. SMRP-aligned prompts:

(a) Compute wrench time from a sample log; identify the largest NVAW bucket.

(b) Identify the WO closeout elements required for the planning and reliability feedback loops.

(c) Distinguish wrench time from value-added ratio and from schedule adherence.

(d) Rank improvement projects by projected WT lift given a plant's NVAW Pareto.

The questions in this lesson's question bank are aligned to these Work Execution competencies.`,
    summary: `Work execution is where the planned, scheduled job is performed and measured. Wrench Time (≥40%, world-class ≥55%) is the diagnostic; the NVAW Pareto is the improvement target. WO closeout quality (≥95% within 24 h, with actuals + parts + failure code + findings) is the upstream lever for reliability analytics. Failure-code discipline — controlled, right-granularity, enforced — makes MTBF and bad-actor analysis possible. The supervisor directs the craft in real time; the planner and scheduler do not. Wrench-time improvement is a 6–18 month process-re-engineering program, not a worker-discipline program.`,
    key_takeaways: `- Wrench Time = VA minutes / paid minutes × 100 (target ≥40%; world-class ≥55%).
- The NVAW Pareto identifies the top-2 improvement targets (often parts retrieval + waiting for Operations).
- WO closeout within 24 h with actuals + parts + failure code + findings drives both the planning feedback loop and reliability analytics.
- Failure-code taxonomy must be controlled (no free text), right-granularity (5–15 codes per equipment class), and enforced.
- Wrench-time lift is a process fix (kitting, satellite cribs, tighter scheduling, permits-at-planning), not a worker-effort fix.
- Supervisor (execution), planner (planning), scheduler (scheduling) are three distinct roles.`,
    references: `- SMRP. *CMRP Body of Knowledge — Work Management pillar: Work Execution.*
- SMRP. *CMRP Exam Outline.*
- ISO 55001:2014, Cl. 7.2 (operationalization of the asset-management plan).
- ISO 55002:2018, *Guidelines for the application of ISO 55001*, execution data capture.
- Mobley, R. K. (2008). *Maintenance Engineering Handbook* (7th ed.). McGraw-Hill. §II.8 (Work measurement), §III (Wrench-time analysis).
- Campbell, J. D. & Jardine, A. K. S. (2001). *Maintenance Strategy*. Productivity Press. Ch. 8.
- Palmer, R. (2012). *Maintenance Planning and Scheduling Handbook* (2nd ed.). Elsevier. Ch. 15–17 (Wrench time, execution measurement).
- O'Hanlon, T. (2006). *Uptime*. Industrial Press.`,
  },
  knowledgeObject: {
    title: "Work execution — wrench time & WO closeout",
    domain: "Work Management",
    competency: "Work Execution",
    topic: "Execution & closeout",
    concept: "Wrench time",
    body: {
      definitions: [
        "Wrench Time: % of paid craft minutes in direct value-added work (target ≥40%; world-class ≥55%).",
        "Value-Added (VA): wrench turning, alignment, welding, testing — advances the WO.",
        "Non-Value-Added but Necessary (NVAN): permits, LOTO verify, parts retrieval, breaks, training.",
        "Non-Value-Added Waste (NVAW): waiting for crane/Operations, searching, re-doing, traveling.",
        "Value-Added Ratio (VAR): VA hours / total craft-hours × 100 (broader; target ≥60%).",
        "WO closeout: complete a WO with actuals, parts, failure code, findings, QC (target ≥95% within 24 h).",
        "Failure Code: structured tag from a controlled taxonomy (e.g., FC-104 = Bearing — lubrication/contamination).",
        "Finding: observation captured at closeout, drives RCA.",
      ],
      principles: [
        "Execution is a measurement opportunity, not just 'doing the work.'",
        "Wrench time is a process KPI; low WT means the system is making the craft wait, not that the craft is lazy.",
        "WO closeout quality is the upstream lever for reliability analytics.",
        "Failure-code taxonomy: controlled, right-granularity (5–15 per equipment class), enforced.",
        "Supervisor directs craft in real time; planner and scheduler do not.",
        "Three roles separated: planner, scheduler, supervisor.",
      ],
      components: [
        "Daily execution meeting (15-min stand-up).",
        "Wrench-time study: structured observation, 5–15 min interval, VA/NVAN/NVAW classification.",
        "WO closeout workflow: actuals + parts + failure code + findings + QC.",
        "Controlled failure-code taxonomy.",
        "Findings capture (free-text or structured) driving RCA.",
        "Execution KPI dashboard: WT, closeout rate, FCCR, schedule compliance.",
      ],
      mechanism: [
        "Daily schedule → supervisor assigns → permits/LOTO → pre-staged kit → execute → post-job QC → closeout (within 24 h) → monthly failure-code Pareto → RCA + bad-actor analysis.",
      ],
      process: [
        "1. Receive daily schedule in morning stand-up.",
        "2. Assign WOs by skill mix; confirm permits and LOTO with Operations.",
        "3. Pre-stage parts and tools (storeroom kit/pull).",
        "4. Execute per planner's procedure; capture labor time.",
        "5. If emergent work: defer lowest-priority scheduled WO, log break reason, dispatch.",
        "6. Perform post-job QC per acceptance criteria.",
        "7. Close out WO: actuals, parts, failure code, findings, status = Closed.",
        "8. Within 24 h of completion (≥95% target).",
        "9. Monthly failure-code Pareto (top-10 by frequency and cost) → RCA + bad-actor analysis.",
        "10. Quarterly wrench-time study per crew (≥5 shifts sampled) → diagnose NVAW Pareto.",
      ],
      formulas: [
        "Wrench Time = VA time [min] / Total paid time [min] × 100. Target ≥40%; world-class ≥55%.",
        "Value-Added Ratio = VA work [h] / Total craft-hours [h] × 100. Target ≥60%.",
        "WO Closeout Rate = WOs closed within 24 h / Total WOs completed × 100. Target ≥95%.",
        "Failure-Code Capture Rate = Corrective WOs closed with valid FC / Total corrective WOs closed × 100. Target ≥95%.",
        "NVAW Pareto: list of NVAW buckets sorted descending by total minutes.",
      ],
      metrics: [
        "Wrench Time (≥40% target; ≥55% world-class).",
        "Value-Added Ratio (≥60%).",
        "WO Closeout Rate within 24 h (≥95%).",
        "Failure-Code Capture Rate (≥95%).",
        "NVAW Pareto (top-2 buckets = improvement targets).",
        "Schedule Compliance (feedback from Scheduling, ≥85%).",
      ],
      examples: [
        "Power plant 8-h shift (480 min): VA = 270, NVAW = 135 (waiting Ops 60, parts 45, tools 30), NVAN = 75. WT = 56.25%.",
        "After fixes (kit delivery + tighter scheduling): parts 45→10, waiting Ops 60→15. NVAW 135→55. WT 56.25%→64.6%.",
        "Chemical shop crew (no field travel): WT 60–70% (world-class).",
        "Container Terminal RTG crew (travel between cranes): WT 35–45% — fix by rolling-maintenance schedule.",
      ],
      industrial_examples: [
        "Power — main-steam-valve actuator overhaul (80 craft-hours, 3 days): WT 35–45% baseline; outage coordination lifts to 55–65%.",
        "Chemical — rotating-equipment shop crew: 60–70% WT (world-class for shop crews).",
        "Container Terminal — RTG crew with rolling-maintenance schedule: 35–45%→50–55% WT.",
        "Chemical plant — composite 4-week study: WT 31%→47% over 6 months (satellite cribs + tighter scheduling + permits-at-planning + standard-job library).",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Chemical plant, 6 crews, 24 techs, 4-week WT study. Baseline WT 31%. NVAW Pareto: parts retrieval 28%, waiting Operations 22%, permit acquisition 16%, re-doing work 12%. Invested: satellite cribs + tighter scheduling meeting + permits-at-planning + standard-job library. After 6 months: WT 47%. Remaining NVAW bimodal: waiting Operations 35%, travel 24%. Next investment: kitting program → projected WT 55%.",
      ],
      common_errors: [
        "Treating wrench time as a worker-effort KPI (it is a process KPI).",
        "Closing WOs without a failure code ('general corrective' or blank).",
        "Closeout >24 h (actuals forgotten; data quality degrades).",
        "Free-text failure codes (scatters signal; MTBF by mode uncomputable).",
        "No wrench-time study ever performed (NVAW Pareto invisible).",
        "Capturing actuals only when over-estimate (feedback loop broken).",
        "Supervisor also planning (neither job done well; daily meeting skipped).",
        "NVAW 'fixed' by adding craft (more NVAW per minute).",
      ],
      limitations: [
        "WT is sample-based; ≥5 shifts/crew for a reliable estimate.",
        "WT does not measure correctness — fast bad repair worse than slow good one.",
        "NVAW Pareto is plant-specific (storage-driven vs. permit-driven vs. travel-driven).",
        "Wrench-time improvement is a 6–18 month program; quick wins are suspect.",
      ],
      best_practices: [
        "Perform a quarterly wrench-time study per crew (≥5 shifts sampled).",
        "Close WOs within 24 h with actuals + parts + failure code + findings + QC.",
        "Use a controlled failure-code taxonomy (5–15 codes per equipment class).",
        "Enforce closeout rejection if failure code is missing.",
        "Pareto failure codes monthly → top-10 → RCA + bad-actor analysis.",
        "Convert top-2 NVAW buckets via kitting, satellite cribs, tighter scheduling, permits-at-planning.",
        "Separate the supervisor role from planner and scheduler.",
      ],
      related_concepts: [
        "Planning (the job package executor uses).",
        "Scheduling (the daily schedule the supervisor runs).",
        "CMMS — WO closeout workflow and failure-code taxonomy.",
        "Measurements & Reporting — failure-code Pareto and MTBF by mode.",
        "Equipment Reliability — bad-actor analysis.",
      ],
      prerequisites: [
        "Planning lesson (Lesson 1).",
        "Scheduling lesson (Lesson 2).",
        "CMMS navigation: WO status transitions, failure-code entry, actuals entry.",
        "Plant safety: LOTO, permits, JSA, PPE.",
        "Basic time-and-motion observation technique.",
      ],
      references: [
        "SMRP CMRP BOK — WM pillar: Work Execution.",
        "SMRP CMRP Exam Outline.",
        "ISO 55001:2014 Cl. 7.2.",
        "ISO 55002:2018 execution data capture.",
        "Mobley (2008), §II.8 (Work measurement), §III (Wrench-time analysis).",
        "Campbell & Jardine (2001), Ch. 8.",
        "Palmer (2012), Ch. 15–17.",
        "O'Hanlon (2006), Uptime.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Work Execution",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Power",
      stem: "A Power-plant shift is 480 min. The technician logs: 270 min direct wrench work, 60 min waiting for Operations, 45 min parts retrieval, 30 min tool retrieval, 30 min meeting, 25 min permit, 20 min breaks. What is the wrench time?",
      whyCorrect:
        "Wrench Time = VA / Total paid = 270 / 480 × 100 = 56.25%. The 270 min of direct wrench work is the only value-added activity in the log.",
      whyOthersWrong: [
        "44.0% is wrong — it counts VA = 270 minus the meeting and break (210) divided by 480 = 43.75%, but the meeting and breaks are NVAN, not subtracted from VA.",
        "31.3% counts only the time spent at the asset excluding parts/tool retrieval — but parts retrieval is NVAW (not subtracted from VA); the VA bucket is 270, period.",
        "64.6% is the projected WT AFTER improvements (parts-retrieval and waiting-for-Ops reduced), not the current value.",
      ],
      explanation:
        "WT = VA / paid time × 100. Only direct value-added work counts as VA. NVAN (meeting, permit, breaks) and NVAW (waiting, parts, tools) are excluded from the numerator.",
      options: [
        { text: "56.25%", isCorrect: true },
        { text: "44.0%", isCorrect: false },
        { text: "31.3%", isCorrect: false },
        { text: "64.6%", isCorrect: false },
      ],
    },
    {
      competencyName: "Work Execution",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Analyze",
      cognitiveLevel: "DecisionMaking",
      skillType: "Conceptual",
      scenario: "Power",
      stem: "Wrench time is 32%. The NVAW Pareto top-2 are: waiting for Operations (31%) and parts retrieval (24%). You can fund ONE project. Rank by projected WT lift.",
      whyCorrect:
        "(B) Daily scheduling meeting upgrade + Operations commitment windows — lowest cost ($40k), highest projected WT lift (7–9 pp), and it unblocks the kitting program by tightening the schedule it relies on. Projected WT lift ~7–9 pp.",
      whyOthersWrong: [
        "(A) Kitting + satellite cribs is the next-best lever (5–7 pp) but costs more ($280k) and depends on the tighter schedule from (B) to function — sequence after (B).",
        "(C) JSA at planning time is valuable but lower WT lift (3–4 pp) than fixing waiting-for-Operations.",
        "(D) Standard-job library build (2–3 pp) is the smallest WT lift — valuable but not the top priority.",
      ],
      explanation:
        "Project ranking by projected WT lift: (B) > (A) > (C) > (D). The combined lift is ~20 pp, taking WT from 32% to ~52% (world-class floor).",
      options: [
        { text: "(B) Daily scheduling meeting + Operations commitment windows ($40k, 7–9 pp)", isCorrect: true },
        { text: "(A) Kitting + 4 satellite cribs ($280k, 5–7 pp)", isCorrect: false },
        { text: "(C) JSA applied at planning time ($80k, 3–4 pp)", isCorrect: false },
        { text: "(D) Standard-job library build ($120k, 2–3 pp)", isCorrect: false },
      ],
    },
    {
      competencyName: "Work Execution",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "Which of the following best defines the difference between Non-Value-Added but Necessary (NVAN) and Non-Value-Added Waste (NVAW)?",
      whyCorrect:
        "NVAN is necessary work that does not directly advance the WO (permits, LOTO verify, breaks, training); NVAW is pure waste that can be eliminated by process change (waiting for crane, searching, re-doing, traveling). Improvement targets NVAW first because it is the only bucket that can be eliminated, not just compressed.",
      whyOthersWrong: [
        "NVAN is the bigger bucket than NVAW — incorrect; either can be larger depending on the plant; the distinction is whether the activity can be eliminated, not its size.",
        "NVAN should be eliminated first — incorrect; NVAN by definition cannot be eliminated (permits and LOTO are required), only compressed. NVAW is the elimination target.",
        "NVAW includes permits and LOTO — incorrect; permits and LOTO are NVAN (necessary), not NVAW (waste).",
      ],
      explanation:
        "Improvement targets NVAW because it is pure waste — eliminated by kitting, tighter scheduling, satellite cribs. NVAN is compressed but not eliminated (permits/LOTO are required).",
      options: [
        { text: "NVAN cannot be eliminated (permits, LOTO, breaks are required); NVAW can be eliminated by process change (waiting, searching, re-doing, traveling).", isCorrect: true },
        { text: "NVAN is the larger bucket and should be eliminated first; NVAW is smaller.", isCorrect: false },
        { text: "NVAN should be eliminated before NVAW because it does not advance the WO.", isCorrect: false },
        { text: "NVAW includes permits and LOTO; NVAN includes waiting and re-doing.", isCorrect: false },
      ],
    },
    {
      competencyName: "Work Execution",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which WO closeout element is REQUIRED on every corrective WO for reliability analytics to be possible?",
      whyCorrect:
        "A valid failure code from the controlled taxonomy. Without it, MTBF by failure mode and bad-actor Pareto by failure code cannot be computed — the WO is analytically dead.",
      whyOthersWrong: [
        "The operator's name is administrative; it does not feed reliability analytics.",
        "The next-PM-due date is a scheduling concern, not a closeout analytical input.",
        "The Storeroom-issue timestamp feeds inventory analytics, not failure analytics.",
      ],
      explanation:
        "Failure-code discipline is the upstream lever for reliability analytics. Plants with ≥95% failure-code capture can compute MTBF by mode within 90 days; plants without cannot compute MTBF at all.",
      options: [
        { text: "A valid failure code from the controlled taxonomy", isCorrect: true },
        { text: "The operator's name who reported the issue", isCorrect: false },
        { text: "The next-PM-due date for the asset", isCorrect: false },
        { text: "The storeroom-issue timestamp for parts", isCorrect: false },
      ],
    },
    {
      competencyName: "Work Execution",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: Adding a 2nd technician to a crew is an effective way to lift wrench time, because more craft means more value-added minutes per shift.",
      whyCorrect:
        "False. Adding craft does not lift WT — it produces more NVAW per minute of paid time. WT is a process KPI; low WT means the system is making the craft wait, not that the crew is understaffed. The fix is to remove NVAW (kitting, tighter scheduling, satellite cribs), not to add headcount.",
      whyOthersWrong: [
        "True — adding headcount without fixing the process produces 2 crafts doing the same waiting; WT actually drops because the second craft also waits on the same crane/permit/Operations release.",
      ],
      explanation:
        "Wrench-time lift is a process fix, not a headcount fix. The math: if NVAW is 30% of paid time, doubling the crew doubles the NVAW minutes — WT is unchanged.",
      options: [
        { text: "False", isCorrect: true },
        { text: "True", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 4 — CMMS
// ---------------------------------------------------------------------------

const LESSON_CMMS: RefLesson = {
  competencyName: "CMMS",
  slug: "wm-cmms",
  title: "CMMS — Data Model, WO Lifecycle & Reporting",
  titleAr: "نظام إدارة الصيانة المحوسب — نموذج البيانات ودورة حياة أمر العمل",
  order: 4,
  durationMin: 28,
  references: WM_REFERENCE_TITLES,
  conceptIntroduction: `A Computerized Maintenance Management System (CMMS) is the database of record for the maintenance function: it models the asset hierarchy, the work-order lifecycle, the parts inventory, the labor roster, and the failure-code taxonomy. The CMMS is the single source of truth that the planner, scheduler, supervisor, reliability engineer, and storeroom all operate against. Data integrity — clean asset hierarchy, populated BOMs, controlled failure codes, complete WO closeout — is the upstream lever for every reliability metric. ISO 55001:2014 treats the CMMS as part of the asset-management-system information infrastructure.`,
  example: `A Container Terminal models an RTG crane as: Terminal → Berth 1 → RTG-07 (equipment) → Hoist Assembly (sub-assembly) → Main Hoist Gearbox (component). The component carries the BOM (SKF 22220 bearing ×2, pinion gear set, oil seal kit). A WO is raised against RTG-07 → assigned to Main Hoist Gearbox → closed with failure code FC-301 (Gear — tooth wear). MTBF for the gearbox = total operating hours / number of FC-301 events; e.g., 8,760 h / 5 events = 1,752 h.`,
  keyFormulas: `Asset hierarchy depth = 5–7 levels (Plant → Area → Unit → Equipment → Sub-assembly → Component → Part)
WO lifecycle states = Created → Approved → Planned → Scheduled → Released → Assigned → In-Progress → Complete → Closed
MTBF = Total operating hours / Number of failures (events)
MTTR = Total repair time / Number of failures
WO Status Count = Σ WOs by status (any state transition is a status timestamp)
Failure-Code Coverage = WOs closed with valid FC / Total corrective WOs closed × 100`,
  exercise: `You are the CMMS administrator at a Power plant. Asset "Boiler Feed Pump P-101" has had 5 bearing failures in 8,760 operating hours. Compute MTBF. Then design the asset hierarchy from Plant down to the failed bearing component, and list the WO lifecycle states you would track.`,
  sections: {
    learning_objectives: `- Model an asset hierarchy from plant to component, applying the 5–7 level standard.
- Describe the work-order lifecycle: Created → Approved → Planned → Scheduled → Released → Assigned → In-Progress → Complete → Closed.
- Explain why the CMMS is the single source of truth and how data integrity (BOMs, failure codes, hierarchy) enables reliability analytics.
- Configure a controlled failure-code taxonomy at the right granularity (5–15 codes per equipment class).
- Build a standard CMMS report set: WO-status, backlog, MTBF by failure mode, PM compliance, schedule compliance.
- Recognize the CMMS administrator's role (data steward) and the relationship to ISO 55001 information requirements.`,
    prerequisites: `- The maintenance work-management cycle (Lessons 1–3: planning, scheduling, execution).
- Database concepts: parent–child relationships, foreign keys, referential integrity.
- Basic SQL or CMMS query-builder literacy.
- Plant asset terminology: equipment, sub-assembly, component, BOM, spares.`,
    introduction: `The CMMS is the operational database of the maintenance function. Where the ERP (SAP, Oracle, Maximo) owns the financial and procurement transactions, the CMMS owns the maintenance transactions: asset hierarchy, work-order lifecycle, parts inventory, labor time, failure codes, and the maintenance history that drives reliability analytics. Modern CMMS products include IBM Maximo, SAP PM, Infor EAM, Fiix, eMaint, and Dynamics 365 Field Service — the data model is largely standardized across them.

The CMRP BOK lists CMMS as the fourth WM competency because every other competency depends on it. The planner cannot plan without BOMs; the scheduler cannot level capacity without WO labor estimates; the supervisor cannot close out without the failure-code taxonomy; the reliability engineer cannot compute MTBF without failure events captured at the asset-component-failure-mode level. Data integrity is the upstream lever — a clean hierarchy, populated BOMs, controlled failure codes, and disciplined closeout make every downstream metric credible.

ISO 55001:2014 Clause 7.5 (Documented Information) and Clause 9.1 (Monitoring) require the asset-management system to maintain and use information about asset performance. The CMMS is the technical implementation of that requirement; ISO 55002:2018 §A.4.2 explicitly mentions maintenance management information systems as part of the asset-management-system infrastructure.`,
    terminology: `- **CMMS**: Computerized Maintenance Management System — the database of record for the maintenance function.
- **Asset Hierarchy**: the parent–child tree from Plant → Area → Unit → Equipment → Sub-assembly → Component (5–7 levels).
- **Equipment (Functional Location)**: the asset that performs a function (e.g., "Pump P-101").
- **Sub-assembly / Component**: a replaceable child of an equipment (e.g., "DE Bearing Housing" → "DE Bearing").
- **Bill of Materials (BOM)**: the structured parts list attached to an asset; enables fast planning and reservation.
- **WO Lifecycle**: the status transitions a work order moves through, from Created to Closed.
- **Failure Code**: a controlled taxonomy tag (e.g., FC-301 = Gear — tooth wear) attached at WO closeout.
- **Standard Job / Task Template**: a reusable WO template with scope, labor, parts, procedure pre-populated.
- **PM Schedule**: a recurring calendar- or runtime-triggered WO template (PM due-list).
- **CMMS Administrator / Data Steward**: the role that maintains hierarchy, BOMs, failure-code taxonomy, and reports.`,
    detailed_explanation: `The CMMS data model has four core entities. **(1) Asset hierarchy**: a parent–child tree where the top level is the Plant (or Site), and each lower level is a more granular asset — Area (e.g., "North Process Unit"), Unit (e.g., "Crude Distillation"), Equipment (e.g., "Pump P-101"), Sub-assembly (e.g., "Bearing Housing"), Component (e.g., "Bearing SKF 6308"). The hierarchy is the spine; every transaction (WO, failure, PM, measurement) attaches to one node. ISO 14224 (Collection and exchange of reliability and maintenance data for equipment) recommends 5–7 levels; CMRP practice converges on the same.

**(2) Work order lifecycle**: a WO is a digital record that moves through status states. The standard states are Created (operator or PM due-list or CBM alert raises it) → Approved (maintenance supervisor authorizes) → Planned (planner has produced the job package) → Scheduled (scheduler assigns dates and crew) → Released (WO is in the execution window) → Assigned (a specific crew is named) → In-Progress (work has started) → Complete (work finished, awaiting closeout data) → Closed (actuals, parts, failure code, findings, QC all entered). Each transition is a timestamp; the cycle-time from Created to Closed is the WO cycle KPI.

**(3) Failure-code taxonomy**: a controlled list of failure modes per equipment class. The right granularity is 5–15 codes per class — too few (one "general failure" code) hides the signal; too many (50 codes) scatters it. Each code has a name, a description, and an equipment-class scope. Examples: FC-101 Bearing — lubrication/contamination; FC-102 Bearing — overload/fatigue; FC-201 Seal — mechanical damage; FC-301 Gear — tooth wear; FC-401 Impeller — cavitation. The CMMS enforces selection at WO closeout.

**(4) Standard reports**: a configured CMMS exposes a standard report set that the maintenance function runs daily/weekly/monthly: WO-status report (count by status); backlog report (hours by priority and aging); MTBF by failure mode; MTTR by equipment class; PM compliance (% PMs done on time); schedule compliance (% WOs completed in window); wrench-time study export; failure-code Pareto (top-10 by frequency and cost); bad-actor list (top-10 by maintenance cost and downtime). These reports are the raw material for the Measurements & Reporting competency.

**Data integrity** is the upstream lever. A clean asset hierarchy with populated BOMs at the component level makes planning fast (the planner explodes the BOM in 5 min vs. 30 min to chase the parts list). A controlled failure-code taxonomy enforced at closeout makes MTBF by failure mode computable. A disciplined WO closeout within 24 h makes the planning feedback loop credible. Without these, every downstream KPI is fiction. The CMMS administrator is the data steward — the role that maintains the taxonomy, adds new assets correctly, retires obsolete entries, and audits the data for accuracy.`,
    core_principles: `- The CMMS is the single source of truth for the maintenance function.
- Data integrity (hierarchy, BOMs, failure codes, closeout) is the upstream lever for every reliability metric.
- The asset hierarchy depth is 5–7 levels (Plant → Area → Unit → Equipment → Sub-assembly → Component).
- The WO lifecycle has standard states; each transition is a timestamp enabling cycle-time KPIs.
- Failure-code taxonomy: controlled, right-granularity (5–15 codes per equipment class), enforced.
- Reports are configured, not ad-hoc — the same report set runs daily/weekly/monthly.
- The CMMS administrator is the data steward — not a system administrator in the IT sense.`,
    components: `- **Asset hierarchy**: parent–child tree (5–7 levels).
- **Equipment / Functional location**: the asset that performs a function.
- **Sub-assembly / Component**: replaceable child of an equipment.
- **Bill of Materials (BOM)**: parts list per asset/component.
- **WO lifecycle**: standard status transitions (Created → ... → Closed).
- **Failure-code taxonomy**: controlled list per equipment class.
- **Standard job / task template**: reusable WO template.
- **PM schedule**: recurring calendar/runtime trigger.
- **Reports**: standard configured report set (daily/weekly/monthly).
- **CMMS administrator / data steward**: maintains taxonomy, hierarchy, BOMs.`,
    process: `1. **Hierarchy build**: engineering + CMMS admin model the asset hierarchy from Plant to Component (5–7 levels).
2. **BOM populate**: equipment BOMs built from OEM manuals and as-built drawings; verified against storeroom catalog.
3. **Failure-code taxonomy**: controlled list per equipment class (5–15 codes); published; enforced at closeout.
4. **WO lifecycle**: standard status transitions; each transition a timestamp; cycle-time KPI tracked.
5. **Closeout discipline**: actuals, parts, failure code, findings, QC within 24 h.
6. **Standard job library**: recurring tasks templated; estimate accuracy feedback loop closes.
7. **PM schedule**: calendar/runtime triggers; PM compliance tracked.
8. **Reports**: configured daily/weekly/monthly report set; dashboard for maintenance manager.
9. **Data audit**: CMMS admin audits the data quarterly (orphaned assets, missing BOMs, free-text failure codes); remediates.`,
    formula_calculation: `- **Asset hierarchy depth**:
  Depth = 5–7 levels (Plant → Area → Unit → Equipment → Sub-assembly → Component). ISO 14224 and SMRP practice converge.
- **WO cycle time**:
  WO Cycle = Closed-timestamp − Created-timestamp
  Variables: [time]; includes planning, scheduling, execution, closeout phases. Target ≤7 days for routine corrective; ≤24 h for PMs.
- **MTBF**:
  MTBF = Total operating hours / Number of failures
  Variables: operating hours [h] from runtime meter or production hours; # failures [events] = WOs closed with a failure code in the period. Units: [h/failure]. Assumption: repairable system, constant failure rate (exponential) — for non-constant, use Weibull.
- **MTTR**:
  MTTR = Total repair time / Number of failures
  Variables: repair time [h] from WO actuals; # failures [events]. Units: [h/failure].
- **Availability (intrinsic)**:
  A = MTBF / (MTBF + MTTR)
  Variables: MTBF, MTTR [h]. Units: [%] or [0..1]. Assumption: includes only corrective downtime; planned downtime is excluded.
- **PM Compliance**:
  PM Compliance = (PMs completed on time) / (PMs scheduled) × 100
  "On time" = within ±10% of the due date. Target ≥90%.
- **Failure-Code Coverage**:
  FCC = WOs closed with valid FC / Total corrective WOs closed × 100. Target ≥95%.`,
    worked_example: `**Problem.** A Container Terminal RTG crane (RTG-07) main hoist gearbox has had 5 bearing-related failures in 8,760 operating hours. The 5 WOs each recorded a labor actual of 4.0, 5.5, 3.5, 6.0, and 4.5 hours. Compute (a) MTBF, (b) MTTR, (c) intrinsic availability of the gearbox, (d) describe the asset hierarchy from Terminal to the failed bearing component, and (e) list the WO lifecycle states tracked.

**Step 1 — MTBF.**
  Operating hours = 8,760 h. Failures = 5.
  MTBF = 8,760 / 5 = **1,752 h.**

**Step 2 — MTTR.**
  Total repair time = 4.0 + 5.5 + 3.5 + 6.0 + 4.5 = 23.5 h.
  MTTR = 23.5 / 5 = **4.7 h.**

**Step 3 — Intrinsic availability.**
  A = MTBF / (MTBF + MTTR) = 1,752 / (1,752 + 4.7) = 1,752 / 1,756.7 = 0.99733 = **99.73%.**

**Step 4 — Asset hierarchy (5 levels).**
  1. Terminal (Container Terminal Boston)
  2. Berth 1
  3. RTG-07 (equipment — rubber-tired gantry crane)
  4. Hoist Assembly (sub-assembly)
  5. Main Hoist Gearbox (component)
  The gearbox carries the BOM: SKF 22220 spherical roller bearing ×2 (DE + NDE), pinion gear set, oil seal kit, gear oil ISO VG 220 (18 L). The failure code on the 5 WOs is FC-101 (Bearing — lubrication/contamination).

**Step 5 — WO lifecycle states (9 standard).**
  Created → Approved → Planned → Scheduled → Released → Assigned → In-Progress → Complete → Closed.
  Each transition is a timestamp; the Closed timestamp minus the Created timestamp is the WO cycle time.

**Result.** RTG-07 main hoist gearbox: MTBF = 1,752 h, MTTR = 4.7 h, intrinsic availability = 99.73%. The 5 failures clustered on FC-101 (Bearing — lubrication/contamination) suggest a lubrication practice problem; reliability engineering should trigger an RCA on the lubrication route and the breather/vent design.`,
    industrial_example: `**Container Terminal — RTG crane fleet.** The canonical CMMS deployment at a terminal models each crane as an equipment, with hoist/trolley/gantry sub-assemblies and component-level BOMs. Failure-code taxonomy: 12 codes (Bearing-Lub, Bearing-Fatigue, Seal-Mech, Gear-Wear, Brake-Wear, Motor-Wind, Motor-Bear, Drive-Inverter, WireRope-Wear, Structure-Crack, Hyd-Leak, Control-PLC). Monthly reports: MTBF by failure mode, bad-actor top-10, PM compliance, schedule compliance.

**Oil & Gas — refinery process unit.** A crude distillation unit has ~1,800 equipment records in the hierarchy. The CMMS drives the turnaround planning (every 4 years, ~12,000 WOs). The failure-code taxonomy covers pumps, heat exchangers, valves, compressors, fired heaters, vessels — each class 10–15 codes. Reports include turnaround backlog aging, MTBF by failure mode per equipment class, and a 12-month rolling bad-actor list.

**Power — generating unit.** A 600-MW coal unit has ~3,500 equipment records. The CMMS models boiler, turbine, generator, ESP, FGD as top-level sub-units; failure codes per equipment class. PM schedule includes runtime-triggered WOs (turbine overspeed test, generator stator winding resistance) and calendar-triggered WOs (boiler tube cleaning, FGD limestone feed inspection).

**Manufacturing — paint line.** A 12-cell paint line has ~600 equipment records. The CMMS drives weekly cell-down scheduling; the standard job library covers ~80% of recurring tasks (gun rebuild, atomizer clean, belt tension, conveyor lube); failure codes for gun-clog, atomizer-fail, belt-wear, conveyor-misalign.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** A mid-sized Chemical plant inherited a CMMS with 14,000 equipment records, only 32% of which had a populated BOM. The failure-code taxonomy was a single free-text field with 1,800 distinct entries (effectively no taxonomy). After 9 months of remediation: (i) hierarchy cleanup retired 2,100 orphaned records; (ii) BOM population reached 78% for the top-50 bad-actor equipment classes (covering 65% of total WO labor); (iii) a controlled failure-code taxonomy of 14 codes per equipment class was published and enforced at closeout; (iv) the WO closeout rate within 24 h rose from 41% to 89%. As a result, MTBF by failure mode became computable for the first time; the bad-actor top-10 (previously a guess) became data-driven; and the planner's standard-job library grew from 40 templates to 220 (driving the planning ratio from 3.2:1 to 7.5:1). The case shows that data integrity is the upstream lever — KPIs became credible only after the CMMS data became credible.`,
    visual_explanation: `- **Asset hierarchy tree**: indented tree from Terminal → Berth → RTG-07 → Hoist → Gearbox → Bearing. Each node clickable to its BOM, history, and PM schedule.
- **WO lifecycle flowchart**: 9 boxes left-to-right (Created → ... → Closed), with timestamps on each transition.
- **Failure-code Pareto**: descending bars of failure-code counts for an equipment class; the top-3 codes drive RCA.
- **CMMS dashboard**: 4 panels — WO-status counts, backlog hours by aging, MTBF by failure mode, schedule compliance %.`,
    simulation_opportunity: `A CMMS configuration sim: the learner is given a CSV of 200 raw equipment records (some malformed, some duplicated, some orphaned) and must build a clean 5-level hierarchy, populate BOMs from a parts catalog, and assign failure codes from a controlled taxonomy. The simulator scores: (a) hierarchy depth and referential integrity, (b) BOM coverage %, (c) failure-code coverage at closeout, (d) MTBF reportability (a derived metric: can MTBF be computed for the top-10 assets?). A second tier injects scope changes (new asset, retired asset, re-naming) that test the audit discipline.`,
    common_mistakes: `- **Flat hierarchy**: equipment records without parent–child relationships — failure events cannot be aggregated by unit; MTBF by area is impossible.
- **Single free-text failure-code field**: 1,800 distinct entries — the signal scatters; MTBF by mode is impossible.
- **BOM populated only at equipment level**: planner must chase parts at the component level; planning ratio collapses.
- **WO closeout >24 h or skipped**: the planning feedback loop breaks; estimate accuracy degrades.
- **No CMMS administrator**: the taxonomy drifts; orphaned records accumulate; reports become unreliable.
- **Customizing the CMMS to bypass closeout validation**: the data-integrity controls are weakened; the CMMS becomes a ticket-printer.
- **Asset hierarchy deeper than 7 levels**: granularity without benefit; the planner's navigation slows.
- **No PM compliance report**: the PM schedule drifts; failures that PMs were meant to prevent still occur.`,
    limitations: `- A CMMS does not perform RCA — it stores the data that enables RCA; if the data is bad, RCA is impossible.
- MTBF/MTTR from CMMS data assume the failure-code taxonomy is controlled and enforced; free-text codes produce noise.
- The CMMS does not integrate real-time condition monitoring by default; CBM alerts must be ingested via an interface (often OPC-UA or a CMMS-vendor connector).
- A clean CMMS does not guarantee a good maintenance function — the planning, scheduling, and execution disciplines still have to operate.`,
    comparison: `- **CMMS vs. EAM (Enterprise Asset Management)**: EAM is the broader category that includes CMMS + financial/procurement + lifecycle cost; modern CMMS products often market themselves as EAM.
- **CMMS vs. ERP-PM**: SAP PM and Oracle EAM are ERP modules with PM functionality; a dedicated CMMS (Maximo, Fiix, eMaint) is often preferred for depth of maintenance function but trades integration with the ERP.
- **CMMS vs. SCADA/Historian**: SCADA controls and the historian stores process-tag data; the CMMS stores maintenance transactions. Integration (CBM alert → WO) is via interface.
- **CMMS administrator vs. IT system administrator**: the CMMS admin is a data steward (domain role), not an IT infrastructure role.`,
    practical_application: `- **Daily**: WO-status report, backlog aging, schedule compliance, emergent-WO log.
- **Weekly**: MTBF/MTTR by equipment class, PM compliance, failure-code Pareto, planner's standard-job-library usage.
- **Monthly**: bad-actor top-10 (by maintenance cost and downtime), reliability trend, KPI dashboard for management review.
- **Outage / turnaround**: scope the turnaround WO list against the CMMS; pre-build the long-lead parts; publish the CPM.
- **Quarterly**: data-integrity audit (orphaned assets, missing BOMs, free-text failure codes); remediation plan.`,
    decision_scenario: `You are the new maintenance manager at a Chemical plant. The CMMS has 14,000 equipment records; 32% have a populated BOM; the failure-code field is free-text with 1,800 distinct values; the WO closeout rate is 41%. Your first 90-day priorities: (A) build the controlled failure-code taxonomy and enforce closeout, (B) populate BOMs for the top-50 bad-actor equipment classes, (C) clean the asset hierarchy (retire orphans, fix parent–child), (D) build a standard report set. Rank by sequencing priority:

  Sequence: (C) → (A) → (B) → (D). (C) hierarchy cleanup is the foundation (orphaned records pollute every report); (A) failure-code taxonomy + closeout enforcement is the next gate (without it, MTBF is impossible); (B) BOM population accelerates planning once closeout is credible; (D) reports are the capstone — they are useless without (C), (A), (B). 90-day target: hierarchy clean (≤2% orphans), failure-code coverage ≥80% at closeout, BOM coverage ≥70% for top-50, daily WO-status + weekly MTBF + monthly bad-actor reports running.`,
    practice_questions: `- List the 9 WO lifecycle states from Created to Closed. *(Answer: Created → Approved → Planned → Scheduled → Released → Assigned → In-Progress → Complete → Closed.)*
- Compute MTBF for 4 failures in 4,380 operating hours. *(Answer: 1,095 h.)*
- Compute MTTR for repair times 3.5 + 4.0 + 5.0 h over 3 failures. *(Answer: 4.17 h.)*
- Compute intrinsic availability for MTBF = 1,752 h and MTTR = 4.7 h. *(Answer: 99.73%.)*
- Name 5 elements of a controlled failure-code taxonomy per equipment class. *(Answer: code, name, description, equipment-class scope, action/corrective mapping.)*`,
    certification_questions: `The CMRP exam tests CMMS as the fourth WM competency. SMRP-aligned prompts:

(a) Identify the correct asset-hierarchy depth for a given plant (5–7 levels per ISO 14224).

(b) Compute MTBF and MTTR from CMMS failure data; compute intrinsic availability.

(c) Identify the failure-code-taxonomy granularity problem (too few = signal hidden; too many = signal scattered) and recommend 5–15 codes per equipment class.

(d) Sequence CMMS data-remediation priorities (hierarchy → failure-code taxonomy → BOM → reports).

The questions in this lesson's question bank are aligned to these CMMS competencies.`,
    summary: `The CMMS is the single source of truth for the maintenance function. The asset hierarchy (5–7 levels), the WO lifecycle (9 standard states with timestamps), the failure-code taxonomy (controlled, 5–15 codes per equipment class), and the BOM (parts per asset/component) are the four core data entities. Data integrity — clean hierarchy, populated BOMs, controlled failure codes, disciplined closeout — is the upstream lever for every reliability metric. The CMMS administrator is the data steward. ISO 55001:2014 Cl. 7.5/9.1 treats the CMMS as part of the asset-management-system information infrastructure.`,
    key_takeaways: `- Asset hierarchy: 5–7 levels (Plant → Area → Unit → Equipment → Sub-assembly → Component).
- WO lifecycle: 9 standard states (Created → Approved → Planned → Scheduled → Released → Assigned → In-Progress → Complete → Closed).
- Failure-code taxonomy: controlled, 5–15 codes per equipment class, enforced at closeout.
- MTBF = operating hours / failures; MTTR = repair time / failures; A = MTBF/(MTBF+MTTR).
- Data integrity (hierarchy + BOM + failure code + closeout) is the upstream lever.
- The CMMS administrator is a data steward, not an IT administrator.
- Reports are configured (daily/weekly/monthly), not ad-hoc.`,
    references: `- SMRP. *CMRP Body of Knowledge — Work Management pillar: CMMS.*
- SMRP. *CMRP Exam Outline.*
- ISO 55001:2014, Cl. 7.5 (Documented Information), Cl. 9.1 (Monitoring).
- ISO 55002:2018, §A.4.2 (Maintenance management information systems).
- ISO 14224:2016, *Collection and exchange of reliability and maintenance data for equipment* (hierarchy depth, failure-code taxonomy reference).
- Mobley, R. K. (2008). *Maintenance Engineering Handbook* (7th ed.). McGraw-Hill. §IV (CMMS).
- Campbell, J. D. & Jardine, A. K. S. (2001). *Maintenance Strategy*. Productivity Press. Ch. 6.
- O'Hanlon, T. (2006). *Uptime*. Industrial Press.`,
  },
  knowledgeObject: {
    title: "CMMS — asset hierarchy, WO lifecycle & data integrity",
    domain: "Work Management",
    competency: "CMMS",
    topic: "Computerized Maintenance Management System",
    concept: "CMMS data model",
    body: {
      definitions: [
        "CMMS: Computerized Maintenance Management System — the database of record for the maintenance function.",
        "Asset Hierarchy: parent–child tree from Plant to Component (5–7 levels).",
        "Equipment (Functional Location): asset that performs a function (e.g., Pump P-101).",
        "Sub-assembly / Component: replaceable child of an equipment.",
        "Bill of Materials (BOM): structured parts list attached to an asset/component.",
        "WO Lifecycle: standard status transitions from Created to Closed (9 states).",
        "Failure Code: controlled taxonomy tag (e.g., FC-101 Bearing — lubrication/contamination).",
        "Standard Job / Task Template: reusable WO template.",
        "PM Schedule: recurring calendar- or runtime-triggered WO template.",
        "CMMS Administrator / Data Steward: maintains hierarchy, BOMs, taxonomy, reports.",
      ],
      principles: [
        "The CMMS is the single source of truth for the maintenance function.",
        "Data integrity (hierarchy + BOM + failure codes + closeout) is the upstream lever for every reliability metric.",
        "Asset hierarchy depth: 5–7 levels (ISO 14224).",
        "WO lifecycle: 9 standard states, each transition a timestamp.",
        "Failure-code taxonomy: controlled, right-granularity (5–15 per equipment class), enforced.",
        "Reports are configured (daily/weekly/monthly), not ad-hoc.",
        "The CMMS administrator is a data steward (domain role), not an IT administrator.",
      ],
      components: [
        "Asset hierarchy (5–7 levels).",
        "Equipment / Functional location.",
        "Sub-assembly / Component.",
        "Bill of Materials (BOM).",
        "WO lifecycle (9 standard states).",
        "Failure-code taxonomy (controlled).",
        "Standard job / task template.",
        "PM schedule (calendar/runtime).",
        "Configured reports (daily/weekly/monthly).",
        "CMMS administrator / data steward.",
      ],
      mechanism: [
        "Hierarchy build → BOM populate → failure-code taxonomy → WO lifecycle → closeout discipline → standard-job library → PM schedule → reports → quarterly data audit.",
      ],
      process: [
        "1. Engineering + CMMS admin model the asset hierarchy (Plant → Component, 5–7 levels).",
        "2. Equipment BOMs built from OEM manuals + as-built drawings; verified vs. storeroom catalog.",
        "3. Failure-code taxonomy (5–15 codes per equipment class) published; enforced at closeout.",
        "4. WO lifecycle: standard status transitions; each transition a timestamp.",
        "5. Closeout discipline: actuals + parts + failure code + findings + QC within 24 h.",
        "6. Standard-job library: recurring tasks templated; estimate accuracy feedback loop.",
        "7. PM schedule: calendar/runtime triggers; PM compliance tracked.",
        "8. Reports: daily WO-status, weekly MTBF, monthly bad-actor etc.",
        "9. Quarterly data audit (orphaned assets, missing BOMs, free-text failure codes); remediation.",
      ],
      formulas: [
        "Asset Hierarchy Depth = 5–7 levels (Plant → Area → Unit → Equipment → Sub-assembly → Component).",
        "WO Cycle Time = Closed-timestamp − Created-timestamp (target ≤7 days routine; ≤24 h PM).",
        "MTBF = Total operating hours / Number of failures [h/failure].",
        "MTTR = Total repair time / Number of failures [h/failure].",
        "Availability (intrinsic) = MTBF / (MTBF + MTTR) [0..1].",
        "PM Compliance = PMs completed on time / PMs scheduled × 100 (target ≥90%).",
        "Failure-Code Coverage = WOs closed with valid FC / Total corrective WOs closed × 100 (target ≥95%).",
      ],
      metrics: [
        "MTBF by failure mode (h/failure).",
        "MTTR by equipment class (h/failure).",
        "Intrinsic availability (%).",
        "PM compliance (≥90%).",
        "Schedule compliance (≥85%).",
        "WO closeout rate within 24 h (≥95%).",
        "Failure-code coverage (≥95%).",
        "BOM coverage (% of equipment with populated BOM).",
        "Hierarchy orphan rate (target ≤2%).",
      ],
      examples: [
        "Container Terminal RTG-07 main hoist gearbox: 5 failures in 8,760 h ⇒ MTBF = 1,752 h; MTTR = 4.7 h (5 WOs @ 23.5 h total); intrinsic A = 99.73%.",
        "Chemical plant CMMS remediation: 14k records → 32% BOM coverage → 78% coverage for top-50 bad-actors; free-text FC → controlled 14 codes per class; closeout 41%→89%; planning ratio 3.2:1→7.5:1.",
        "Oil & Gas refinery crude distillation unit: ~1,800 equipment records; turnaround every 4 years, ~12,000 WOs; 10–15 failure codes per equipment class.",
        "Power 600-MW coal unit: ~3,500 equipment records; runtime-triggered + calendar-triggered PMs.",
      ],
      industrial_examples: [
        "Container Terminal — RTG crane fleet; 12 controlled failure codes; monthly reports: MTBF by mode, bad-actor top-10, PM compliance, schedule compliance.",
        "Oil & Gas — crude distillation unit (1,800 records); turnaround planning every 4 years (12,000 WOs); 12-month rolling bad-actor list.",
        "Power — 600-MW coal unit (3,500 records); runtime + calendar PMs.",
        "Manufacturing — 12-cell paint line (600 records); standard-job library covers 80% of recurring tasks.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Chemical plant, 14k equipment records, 32% BOM coverage, 1,800 free-text failure codes, 41% closeout. 9-month remediation: hierarchy cleanup (2,100 orphans retired), BOM to 78% for top-50 (covering 65% of total WO labor), 14 controlled codes per equipment class enforced at closeout, closeout 41%→89%. MTBF by mode became computable; bad-actor top-10 became data-driven; planner standard-job library 40→220 templates; planning ratio 3.2:1→7.5:1.",
      ],
      common_errors: [
        "Flat hierarchy (no parent–child) — MTBF by area impossible.",
        "Single free-text failure-code field — signal scatters; MTBF by mode impossible.",
        "BOM populated only at equipment level — planner chases parts at component; planning ratio collapses.",
        "WO closeout >24 h or skipped — feedback loop breaks; estimate accuracy degrades.",
        "No CMMS administrator — taxonomy drifts; orphans accumulate; reports unreliable.",
        "Customizing the CMMS to bypass closeout validation — data integrity weakens.",
        "Asset hierarchy deeper than 7 levels — planner navigation slows.",
        "No PM compliance report — PM schedule drifts; preventable failures still occur.",
      ],
      limitations: [
        "A CMMS does not perform RCA — it stores the data that enables RCA; bad data ⇒ impossible RCA.",
        "MTBF/MTTR from CMMS data assume controlled, enforced failure-code taxonomy.",
        "CMMS does not ingest real-time CBM by default; CBM alert → WO requires an interface.",
        "A clean CMMS does not guarantee a good maintenance function — planning, scheduling, execution disciplines must still operate.",
      ],
      best_practices: [
        "Build a 5–7 level hierarchy; do not exceed depth 7.",
        "Populate BOMs at the component level for top-50 bad-actor equipment classes.",
        "Use a controlled failure-code taxonomy (5–15 codes per equipment class); enforce at closeout.",
        "Close WOs within 24 h with actuals + parts + failure code + findings + QC.",
        "Build a standard report set (daily WO-status, weekly MTBF, monthly bad-actor).",
        "Appoint a CMMS administrator (data steward) with audit authority.",
        "Quarterly data-integrity audit (orphans, BOM coverage, free-text FC, closeout %).",
        "Do not customize the CMMS to bypass closeout validation.",
      ],
      related_concepts: [
        "Planning (consumes BOMs, standard-job library).",
        "Scheduling (consumes WO labor estimates, backlog query).",
        "Work Execution (WO closeout workflow).",
        "MRO Materials Management (BOM-driven storeroom reservations).",
        "Measurements & Reporting (CMMS reports drive KPIs).",
        "ISO 55001:2014 Cl. 7.5 / 9.1 (Documented Information / Monitoring).",
        "ISO 14224:2016 (Reliability data exchange).",
      ],
      prerequisites: [
        "Work-management cycle (Lessons 1–3).",
        "Database concepts: parent–child, foreign keys, referential integrity.",
        "Basic SQL or CMMS query-builder literacy.",
        "Plant asset terminology: equipment, sub-assembly, component, BOM, spares.",
      ],
      references: [
        "SMRP CMRP BOK — WM pillar: CMMS.",
        "SMRP CMRP Exam Outline.",
        "ISO 55001:2014 Cl. 7.5, 9.1.",
        "ISO 55002:2018 §A.4.2.",
        "ISO 14224:2016 (Reliability data exchange).",
        "Mobley (2008), §IV (CMMS).",
        "Campbell & Jardine (2001), Ch. 6.",
        "O'Hanlon (2006), Uptime.",
      ],
    },
  },
  questions: [
    {
      competencyName: "CMMS",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Container Terminal",
      stem: "An RTG-07 main hoist gearbox has had 5 failures in 8,760 operating hours. The 5 WOs recorded labor actuals of 4.0, 5.5, 3.5, 6.0, and 4.5 hours. Compute MTBF, MTTR, and intrinsic availability.",
      whyCorrect:
        "MTBF = 8,760 / 5 = 1,752 h. MTTR = (4.0 + 5.5 + 3.5 + 6.0 + 4.5) / 5 = 23.5 / 5 = 4.7 h. Intrinsic A = MTBF / (MTBF + MTTR) = 1,752 / (1,752 + 4.7) = 1,752 / 1,756.7 ≈ 0.9973 = 99.73%.",
      whyOthersWrong: [
        "MTBF = 1,000 h, MTTR = 4.7 h, A = 99.5% — the MTBF is wrong; 8,760/5 = 1,752, not 1,000 (1,000 would require 8,760/8.76 failures or some other arithmetic).",
        "MTBF = 1,752 h, MTTR = 23.5 h, A = 98.7% — the MTTR is the total repair time, not the mean; mean = 23.5/5 = 4.7 h, not 23.5 h. Availability calc would also be off.",
        "MTBF = 1,752 h, MTTR = 4.7 h, A = 95.0% — the availability calc is wrong; 1,752/(1,752+4.7) = 0.9973 = 99.73%, not 95%.",
      ],
      explanation:
        "MTBF = total operating hours / # failures. MTTR = total repair time / # failures. A = MTBF/(MTBF+MTTR) (excludes planned downtime).",
      options: [
        { text: "MTBF = 1,752 h, MTTR = 4.7 h, A = 99.73%", isCorrect: true },
        { text: "MTBF = 1,000 h, MTTR = 4.7 h, A = 99.5%", isCorrect: false },
        { text: "MTBF = 1,752 h, MTTR = 23.5 h, A = 98.7%", isCorrect: false },
        { text: "MTBF = 1,752 h, MTTR = 4.7 h, A = 95.0%", isCorrect: false },
      ],
    },
    {
      competencyName: "CMMS",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which of the following is the recommended asset-hierarchy depth per ISO 14224 and SMRP practice?",
      whyCorrect:
        "5–7 levels (Plant → Area → Unit → Equipment → Sub-assembly → Component). ISO 14224 (Reliability data exchange) and SMRP practice converge on this depth; deeper adds navigation cost without analytical value.",
      whyOthersWrong: [
        "2–3 levels: too flat — failure events cannot be aggregated by unit; MTBF by area is impossible.",
        "10–12 levels: too deep — granularity without benefit; the planner's navigation slows and the BOM lookup fragments.",
        "1 level (all equipment at the top): no hierarchy at all — every report must filter by free-text equipment name.",
      ],
      explanation:
        "ISO 14224 and SMRP converge on 5–7 levels: Plant → Area → Unit → Equipment → Sub-assembly → Component. Fewer levels lose analytical signal; more levels add navigation cost without analytical value.",
      options: [
        { text: "5–7 levels (Plant → Area → Unit → Equipment → Sub-assembly → Component)", isCorrect: true },
        { text: "2–3 levels (Plant → Equipment → Component)", isCorrect: false },
        { text: "10–12 levels for maximum granularity", isCorrect: false },
        { text: "1 level (all equipment at the top, no parent–child)", isCorrect: false },
      ],
    },
    {
      competencyName: "CMMS",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "A plant has a single free-text failure-code field with 1,800 distinct entries. What is the PRIMARY problem this creates?",
      whyCorrect:
        "MTBF by failure mode cannot be computed — the signal scatters across 1,800 free-text values; aggregation into a Pareto is impossible. The fix is a controlled taxonomy of 5–15 codes per equipment class, enforced at closeout.",
      whyOthersWrong: [
        "The CMMS runs slowly — performance is a side-effect, not the primary problem; the analytical signal is lost regardless of query speed.",
        "Planners cannot find templates — templating is a separate issue; the free-text failure-code field does not affect the standard-job library directly.",
        "Operators cannot read the codes — operator readability is a minor concern; the primary issue is analytical aggregation.",
      ],
      explanation:
        "Free-text failure codes scatter the signal — MTBF by mode, bad-actor Pareto, and RCA triggers all become impossible. Controlled taxonomy (5–15 codes per equipment class) enforced at closeout restores the analytical value of every WO.",
      options: [
        { text: "MTBF by failure mode cannot be computed; the signal scatters across 1,800 free-text values", isCorrect: true },
        { text: "The CMMS runs slowly because the field index is too large", isCorrect: false },
        { text: "Planners cannot find standard-job templates", isCorrect: false },
        { text: "Operators cannot read the failure codes", isCorrect: false },
      ],
    },
    {
      competencyName: "CMMS",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "DecisionMaking",
      skillType: "Conceptual",
      scenario: "Chemical",
      stem: "A Chemical plant CMMS has 14,000 equipment records, 32% BOM coverage, free-text failure codes (1,800 distinct), 41% closeout rate. Rank the 90-day remediation sequence.",
      whyCorrect:
        "(C) Hierarchy cleanup (foundation; orphaned records pollute every report) → (A) Failure-code taxonomy + closeout enforcement (next gate; without it, MTBF is impossible) → (B) BOM population (accelerates planning once closeout is credible) → (D) Standard report set (capstone; useless without C, A, B).",
      whyOthersWrong: [
        "(A) first: the failure-code taxonomy is critical, but applying it to a polluted hierarchy (with orphans) defeats the purpose — clean the hierarchy first.",
        "(B) first: BOM population is high-value but slow; running it before closeout is credible wastes effort (the BOM data has nothing to feed).",
        "(D) first: reports are the capstone; building them on bad data displays bad data — sequence them last.",
      ],
      explanation:
        "Sequencing: hierarchy → taxonomy+closeout → BOM → reports. Each layer enables the next; building them out of order produces rework.",
      options: [
        { text: "(C) Hierarchy cleanup → (A) Failure-code taxonomy + closeout → (B) BOM population → (D) Reports", isCorrect: true },
        { text: "(A) Failure-code taxonomy + closeout → (B) BOM → (C) Hierarchy → (D) Reports", isCorrect: false },
        { text: "(B) BOM population → (A) Failure-code taxonomy → (D) Reports → (C) Hierarchy", isCorrect: false },
        { text: "(D) Reports → (A) Failure-code taxonomy → (B) BOM → (C) Hierarchy", isCorrect: false },
      ],
    },
    {
      competencyName: "CMMS",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: The CMMS administrator is primarily an IT infrastructure role responsible for database backups and server uptime.",
      whyCorrect:
        "False. The CMMS administrator is a data-steward (domain) role responsible for the asset hierarchy, BOMs, failure-code taxonomy, and reports — the data quality of the maintenance function. Backups and server uptime are IT infrastructure concerns handled by IT operations, not the CMMS administrator.",
      whyOthersWrong: [
        "True — confusing the CMMS administrator (domain/data steward) with the IT system administrator (infrastructure) is a common mistake; they are distinct roles with distinct skills and reporting lines.",
      ],
      explanation:
        "The CMMS administrator owns the data model, taxonomy, and reports — a maintenance-domain role. IT infrastructure (DB, server, backups) is owned by IT operations.",
      options: [
        { text: "False", isCorrect: true },
        { text: "True", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 5 — MRO Materials Management
// ---------------------------------------------------------------------------

const LESSON_MRO: RefLesson = {
  competencyName: "MRO Materials Management",
  slug: "wm-mro-materials",
  title: "MRO Materials — Spares, Storeroom & Inventory Strategy",
  titleAr: "إدارة مواد الصيانة — قطع الغيار والمخزن واستراتيجية الجرد",
  order: 5,
  durationMin: 30,
  references: WM_REFERENCE_TITLES,
  conceptIntroduction: `MRO (Maintenance, Repair & Operations) materials management covers spare parts, the storeroom, and the inventory strategy that ensures the right part is available at the right time, at the right cost. The MRO function balances two failure modes: stockout (a part is missing → maintenance waits → downtime) and overstock (capital is tied up in obsolete parts → carrying cost). The classical tools are ABC analysis, Min/Max, Reorder Point (ROP), Economic Order Quantity (EOQ), safety stock, and critical-spares insurance. The storeroom is the planner's supplier; kitting converts the storeroom into a delivery service.`,
  example: `A bearing has annual demand of 60 units, ordering cost $50/order, holding cost $1.50/unit/year. EOQ = √(2·D·S/H) = √(2·60·50/1.50) = √(4000) ≈ 63 units per order. With a 30-day lead time and demand 60/365 ≈ 0.164 units/day, lead-time demand = 4.93 units. With safety stock of 3 units (e.g., for 95% service with σ_LT = 1.65), ROP = 4.93 + 3 ≈ 8 units.`,
  keyFormulas: `EOQ = √(2·D·S/H) — D demand/year, S ordering cost, H holding cost/unit/year
ROP = (D/days × LT_days) + SS — Reorder Point
Safety Stock (normal-approx, 95%) = z · σ_LT — z = 1.65 (one-sided 95%)
Carrying Cost % = (Annual holding cost) / (Average inventory value) × 100 (target 18–25%)
Inventory Turns = Annual COGS / Average inventory value (target 4–8 turns/year)
Stockout Rate = (Stockout events) / (Total part-issue transactions) × 100 (target ≤2%)`,
  exercise: `You are the storeroom manager at a Power plant. A critical pump seal (part no. SL-2240) has annual demand 24 units, ordering cost $80, unit cost $1,200, carrying cost 22%/year. Compute EOQ, the average inventory value, and the inventory turns.`,
  sections: {
    learning_objectives: `- Apply ABC analysis to stratify spares by value and criticality (A: top 20% of SKUs, 80% of value; B: next 30%; C: bottom 50%).
- Compute Economic Order Quantity (EOQ) given demand, ordering cost, and holding cost.
- Compute Reorder Point (ROP) from lead-time demand and safety stock; size safety stock from service level.
- Distinguish stock (managed by min/max/ROP) from critical spares (insurance — bought once, held for catastrophic-failure insurance).
- Operate a kitting program (storeroom delivers day-of kit to the job site at 7 AM).
- Measure MRO performance: carrying cost %, inventory turns, stockout rate, fill rate, slow-mover / obsolete.`,
    prerequisites: `- The maintenance work-management cycle (Lessons 1–4: planning, scheduling, execution, CMMS).
- Basic inventory arithmetic (cycle stock vs. safety stock, lead-time demand).
- Normal-distribution service level (z-score for one-sided 95% = 1.65).
- Cost-of-capital concept (carrying cost = capital + storage + obsolescence + insurance).`,
    introduction: `MRO materials management is the fifth control point in the work-management cycle. The storeroom is the planner's supplier: when the planner explodes the BOM, the part must be available (or kitted for delivery to the job site). Stockouts cause maintenance waits, schedule breakage, and downtime; overstock ties up capital in parts that may never be used and may become obsolete. The MRO function balances these failure modes with a portfolio of inventory strategies: Min/Max for routine C-items, ROP/EOQ for B-items, critical-spares insurance for catastrophic-failure A-items, vendor-managed inventory (VMI) for high-velocity consumables, and kitting for planned WO execution.

The CMRP BOK lists MRO Materials Management as the fifth WM competency because every other competency depends on parts availability — a planner cannot release a WO with non-stock parts (they hold), a scheduler cannot schedule a job without parts confirmation (the schedule breaks), and a supervisor cannot execute without the kit at the job site (wrench time collapses). The storeroom is upstream of every KPI in the work-management pillar.

ISO 55001:2014 Clause 8.1 (Operational planning) treats spare parts as part of the asset-management-system operational controls; ISO 55002:2018 §A.6.3 mentions spare parts and inventory strategy as part of the asset-management-system infrastructure.`,
    terminology: `- **MRO**: Maintenance, Repair & Operations — the spares, consumables, and tools held for maintenance execution.
- **Storeroom**: the warehouse where MRO inventory is held, issued, and received.
- **ABC analysis**: Pareto stratification — A: top 20% of SKUs by value (80% of $); B: next 30%; C: bottom 50%.
- **Min/Max**: a simple inventory policy — when on-hand reaches Min, order up to Max.
- **Reorder Point (ROP)**: the on-hand level at which a replenishment order is placed; = lead-time demand + safety stock.
- **Economic Order Quantity (EOQ)**: the order quantity that minimizes total ordering + holding cost; = √(2DS/H).
- **Safety Stock (SS)**: extra inventory to absorb demand variability during lead time; sized by service level.
- **Critical Spare**: an insurance spare — bought once, held for catastrophic-failure insurance (e.g., a 5-MW compressor rotor).
- **Kitting**: the storeroom pre-assembles all parts for a WO into a kit, delivered to the job site.
- **Vendor-Managed Inventory (VMI)**: the vendor owns the inventory until issued (consumables, e.g., bearings, lubricants).
- **Carrying Cost**: capital + storage + obsolescence + insurance — typically 18–25% of average inventory value per year.`,
    detailed_explanation: `MRO inventory has three economic levers: ordering cost (S — the cost to place and receive one replenishment order, typically $25–$100/order), holding cost (H — the cost to hold one unit for one year, = unit cost × carrying cost %, typically 18–25%), and stockout cost (lost production + emergency expediting, often an order of magnitude higher than the unit cost). The classical EOQ model minimizes total ordering + holding cost (assuming constant demand and fixed lead time); the safety-stock model absorbs demand variability during lead time.

**EOQ derivation**: Total annual cost TC = (D/Q)·S + (Q/2)·H. Differentiate w.r.t. Q and set to zero: dTC/dQ = −DS/Q² + H/2 = 0 ⇒ Q² = 2DS/H ⇒ Q* = √(2DS/H). The EOQ is the order size that minimizes the sum of ordering and holding costs. Example: D = 60 bearings/yr, S = $50/order, H = $1.50/unit/yr ⇒ EOQ = √(2·60·50/1.50) = √4,000 ≈ 63 units per order, with ~60/63 ≈ 1 order per year.

**Reorder Point**: ROP = lead-time demand + safety stock. Lead-time demand = (D/365)·LT_days. With D = 60/yr and LT = 30 days, lead-time demand = (60/365)·30 ≈ 4.93 units. Safety stock for a 95% service level (one-sided normal, z = 1.65) and a lead-time-demand standard deviation σ_LT = 1.65 units ⇒ SS = z·σ_LT = 1.65·1.65 ≈ 2.72, rounded to 3. ROP = 4.93 + 3 ≈ 8 units. When on-hand drops to 8, place an order for the EOQ (63 units).

**ABC analysis**: stratify SKUs by annual $ usage. A items (top 20% of SKUs, ~80% of $) get the tightest management — ROP/EOQ, vendor negotiations, possibly VMI. B items (next 30%, ~15% of $) get Min/Max with quarterly review. C items (bottom 50%, ~5% of $) get Min/Max or even no-control (e.g., bulk bin, two-bin system). The ABC distribution is the Pareto principle applied to inventory; the rationale is to focus management effort where the money is.

**Critical spares** are a different beast. A 5-MW compressor rotor ($250k, lead time 8–12 weeks) is not held because the EOQ model says so — it's held because a failure would cost $4M in lost production and the rotor is the long-lead bottleneck. Critical spares are insurance; their carrying cost is the premium paid to avoid catastrophic downtime. The selection is driven by criticality analysis (asset is critical AND failure would cause long downtime AND the spare has long lead time). The decision rule: hold the spare if (probability of failure in the lead time) × (downtime cost per day) × (lead time) > the carrying cost of holding the spare.

**Kitting** is the storeroom's contribution to wrench time. The planner's BOM lists the parts; the storeroom pre-assembles them into a kit (a labeled tote or a sealed bag) the day before the WO; the kit is delivered to the job site at 7 AM. The craft never travels to the storeroom; the WO starts at 8 AM with all parts on hand. Kitting is the #1 fix for the "parts retrieval" NVAW bucket in the wrench-time Pareto.

**Vendor-Managed Inventory (VMI)** is for high-velocity consumables (bearings, lubricants, fasteners, gaskets). The vendor owns the inventory in the storeroom until the moment of issue; the plant pays on issue, not on receipt. VMI transfers carrying cost to the vendor (in exchange for a sole-source commitment and a small price premium), eliminates stockouts (the vendor manages replenishment), and reduces the storeroom's administrative burden.`,
    core_principles: `- The storeroom is the planner's supplier; parts availability gates every downstream KPI.
- Balance stockout cost (lost production + expediting) against carrying cost (capital + storage + obsolescence).
- EOQ minimizes ordering + holding cost; ROP triggers replenishment; safety stock absorbs lead-time variability.
- ABC stratifies SKUs so management effort follows the money (A tight, B standard, C loose).
- Critical spares are insurance — held for catastrophic-failure protection, not for the EOQ model.
- Kitting eliminates the "parts retrieval" NVAW bucket — the storeroom delivers, the craft does not travel.
- VMI transfers carrying cost to the vendor for high-velocity consumables.`,
    components: `- **ABC stratification**: Pareto of SKUs by annual $ usage (A 20%/80%, B 30%/15%, C 50%/5%).
- **Min/Max policy**: for B and C items.
- **ROP/EOQ policy**: for A and high-velocity B items.
- **Safety stock**: sized by service level (z-score) and lead-time-demand σ.
- **Critical-spares insurance**: for catastrophic-failure, long-lead items.
- **Kitting program**: pre-assembled day-of-job kits delivered to job site.
- **VMI program**: vendor-managed consumables.
- **Storeroom operations**: receipt, put-away, issue, return, cycle counting.
- **MRO reporting**: carrying cost %, inventory turns, stockout rate, fill rate, slow-mover/obsolete.`,
    process: `1. **ABC stratify** the SKU master by annual $ usage.
2. **For A items**: compute EOQ and ROP; negotiate vendor terms; consider VMI.
3. **For B items**: set Min/Max with quarterly review.
4. **For C items**: Min/Max or two-bin; minimal management.
5. **Critical-spares selection**: criticality analysis + lead-time analysis + downtime cost → hold-or-not decision.
6. **Kitting program**: planner sends the day-of-job kit list to storeroom 24 h ahead; storeroom pre-assembles; delivery at 7 AM.
7. **Cycle counting**: count A items weekly, B monthly, C quarterly — keeps CMMS inventory accurate.
8. **Reporting**: monthly carrying cost %, turns, stockout rate, slow-mover Pareto.`,
    formula_calculation: `- **Economic Order Quantity**:
  EOQ = √(2·D·S/H)
  Variables: D = annual demand [units/yr]; S = ordering cost [$/order]; H = holding cost [$/unit/yr] = unit cost × carrying cost %. Units: [units/order]. Assumption: constant demand, fixed lead time, no stockouts allowed (the safety stock absorbs variability).
- **Reorder Point**:
  ROP = (D/365 × LT_days) + SS
  Variables: D [units/yr]; LT_days [days]; SS [units]. Units: [units]. When on-hand drops to ROP, place an order for the EOQ.
- **Safety Stock (normal approx, one-sided 95%)**:
  SS = z · σ_LT
  Variables: z = standard normal quantile for service level (1.65 for 95%, 2.33 for 99%); σ_LT = standard deviation of lead-time demand [units]. Units: [units].
- **Carrying Cost %**:
  CC% = (Annual holding cost) / (Average inventory value) × 100
  Components: capital (WACC or opportunity cost), storage (rent/insurance), obsolescence, shrinkage. Target 18–25%.
- **Inventory Turns**:
  Turns = Annual COGS / Average inventory value
  Target 4–8 turns/year for MRO (lower than finished-goods because MRO is insurance).
- **Stockout Rate**:
  SO% = (Stockout events) / (Total part-issue transactions) × 100
  Target ≤2%; the stockout cost = lost production + emergency expediting (often 10× unit cost).
- **Critical-spare decision rule**:
  Hold if: P(failure in LT) × Downtime $/day × LT > Carrying cost of the spare
  Where P(failure in LT) = failure rate × LT (for exponential failure model).`,
    worked_example: `**Problem.** A Power plant storeroom manages a mechanical seal (part SL-2240). Annual demand D = 60 units. Ordering cost S = $50/order. Unit cost C = $180. Carrying cost % = 22%/yr. Lead time LT = 30 days. Lead-time-demand σ_LT = 1.65 units. Target service level = 95% (one-sided). Compute (a) EOQ, (b) safety stock, (c) ROP, (d) average inventory value, (e) inventory turns, (f) the order policy.

**Step 1 — Holding cost per unit per year.**
  H = C × CC% = $180 × 0.22 = **$39.60/unit/yr.**

**Step 2 — EOQ.**
  EOQ = √(2·D·S/H) = √(2·60·50/39.60) = √(6000/39.60) = √151.52 ≈ **12.31 units/order.**
  (Practically round to 12 units per order.)

**Step 3 — Safety stock for 95% service.**
  z = 1.65 (one-sided 95%).
  SS = z · σ_LT = 1.65 × 1.65 = **2.72 units → round to 3.**

**Step 4 — Lead-time demand.**
  LTD = (D/365) × LT = (60/365) × 30 = 0.1644 × 30 = **4.93 units.**

**Step 5 — Reorder Point.**
  ROP = LTD + SS = 4.93 + 3 = **7.93 → round to 8 units.**

**Step 6 — Average inventory value.**
  Average inventory = Q/2 + SS = 12/2 + 3 = 6 + 3 = 9 units.
  Average inventory value = 9 × $180 = **$1,620.**

**Step 7 — Inventory turns.**
  Annual COGS = D × C = 60 × $180 = $10,800.
  Turns = COGS / Avg inventory value = 10,800 / 1,620 = **6.67 turns/year.** (In target band of 4–8.)

**Step 8 — Order policy.**
  When on-hand drops to 8 units, place an order for 12 units at $50/order. Receive in 30 days. Annual ordering cost = (D/EOQ)·S = (60/12)·50 = 5·50 = $250. Annual holding cost = (Q/2)·H = 6·$39.60 = $237.60. Total = $487.60 — minimum for the EOQ model.

**Result.** Order policy: order 12 units when on-hand reaches 8. Average inventory value $1,620; turns 6.67/yr; service level 95%; total ordering+holding cost $487.60/yr. The part is well-managed — within target bands on every KPI.`,
    industrial_example: `**Power — mechanical seal.** The example above is the canonical Power-plant pump-seal scenario: a $180 mechanical seal with steady annual demand, well-suited to the classical EOQ/ROP model.

**Oil & Gas — compressor rotor (critical spare).** A 5-MW centrifugal compressor rotor: $250k unit cost, 8–12 week lead time. Failure would cause $4M in lost production (3-week outage). Decision rule: P(failure in LT = 0.25 yr) = failure rate × LT = 1/MTBF × LT. If MTBF = 5 yr, P(failure in 0.25 yr) = 0.05. Expected downtime cost if not held = 0.05 × $4M = $200k. Carrying cost of holding = $250k × 22% = $55k/yr. Hold the spare — the expected downtime cost ($200k) exceeds the carrying cost ($55k). This is the canonical critical-spare insurance decision.

**Container Terminal — RTG wire rope.** A 32-mm hoist wire rope: $8k, 4-week lead time, demand ~6/yr per terminal. EOQ = √(2·6·50/1760) = √0.34 ≈ 1 per order (effectively buy-on-demand). Min/Max: Min = 1, Max = 3. Critical-spare threshold: a stockout would stop an RTG for 4 weeks; hold 2 as safety stock.

**Manufacturing — paint-cell bearings.** A 6204-2RS bearing: $14, 1-week lead time, demand 240/yr across the paint line. EOQ = √(2·240·25/3.08) = √3,896 ≈ 62 per order. VMI candidate — let the bearing vendor own the storeroom inventory; pay on issue.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** A Chemical plant storeroom managed 12,400 SKUs. Pre-remediation: 38% stockout rate on critical parts, 2.1 inventory turns, $5.2M average inventory value, 31% slow-mover/obsolete. The storeroom manager ran an ABC stratification: A items (top 20% = 2,480 SKUs, 78% of $), B items (30% = 3,720 SKUs, 16% of $), C items (50% = 6,200 SKUs, 6% of $). For A items: EOQ/ROP applied; VMI negotiated for the top-50 consumables (bearings, lubricants, gaskets). For B: Min/Max with quarterly review. For C: Min/Max with annual review. Critical-spares analysis: 28 insurance items identified (compressor rotors, turbine bolts, large-bore valves) — 4 added, 2 de-scoped (lower criticality than thought). Kitting program: 80% of planned WOs kitted. After 12 months: stockout rate 38%→4%, turns 2.1→5.4, average inventory value $5.2M→$3.4M, slow-mover 31%→12%. The case shows the lever: stratification + critical-spare rigor + kitting lifts every MRO KPI simultaneously.`,
    visual_explanation: `- **ABC Pareto chart**: SKUs on x-axis sorted by $ usage; cumulative % on y-axis. The 80/20 line identifies the A items.
- **EOQ cost curve**: total cost (TC) as a U-curve; minimum at Q* = √(2DS/H). The two components — ordering cost (decreasing in Q) and holding cost (increasing in Q) — cross at the EOQ.
- **Inventory sawtooth**: inventory level over time; drops linearly from Q to ROP, jumps back to Q on receipt.
- **Critical-spare decision tree**: is the asset critical? is the lead time long? is the failure probability non-trivial? If all yes, hold the spare.`,
    simulation_opportunity: `An MRO sim presents the learner with 100 SKUs (demand, unit cost, lead time) and asks them to: (a) ABC stratify, (b) compute EOQ/ROP for A items, (c) decide Min/Max for B/C, (d) identify critical spares, (e) operate the storeroom for 6 simulated months (place orders, receive, issue, count). Score: stockout rate, turns, carrying cost %, slow-mover %. Disturbances: a long-lead stockout, a sudden demand spike, an obsolete write-off.`,
    common_mistakes: `- **One inventory policy for all SKUs**: applying EOQ/ROP to C items over-manages them; applying Min/Max to A items under-manages them.
- **No ABC stratification ever**: management effort is spread evenly; the A items (where the money is) get the same attention as the C items.
- **Safety stock sized by gut**: 1 week "feels right" — the z-score service-level model is replaced by guesswork; stockouts occur or capital is wasted.
- **No critical-spares analysis**: insurance items are held because "we always have" or skipped because "it's never failed" — neither is data-driven.
- **No kitting program**: the "parts retrieval" NVAW bucket dominates the wrench-time Pareto; the storeroom is a passive warehouse, not a delivery service.
- **No cycle counting**: CMMS inventory drifts from physical reality; the planner reserves a part that isn't there; the schedule breaks.
- **Obsolete inventory not written off**: 10-year-old parts sit in the storeroom "in case"; carrying cost accumulates; the inventory turns metric collapses.
- **VMI skipped because "we lose control"**: VMI is a sole-source commitment, not a loss of control — the vendor manages replenishment against agreed min/max.`,
    limitations: `- The EOQ model assumes constant demand and fixed lead time — for lumpy demand, the order-quantity formula must be replaced by a periodic-review (R, s, S) model.
- Safety stock by normal approximation under-estimates for skewed demand distributions; a Poisson or bootstrap model is more accurate for slow-movers.
- Critical-spare decision is sensitive to the failure-rate estimate; under-estimating MTBF inflates the spare inventory, over-estimating creates stockouts.
- Kitting requires a planner with a clean BOM; a BOM with missing parts breaks the kit on the day of execution.
- VMI transfers carrying cost but creates sole-source risk; the vendor must be reliable.`,
    comparison: `- **EOQ vs. Min/Max**: EOQ minimizes ordering + holding cost for stable-demand A items; Min/Max is a simpler policy for B/C items where the analytical effort of EOQ does not pay back.
- **EOQ vs. JIT (Just-in-Time)**: JIT (zero inventory, daily delivery) is the limit of EOQ as S → 0; practical only for high-velocity, short-lead, reliable-supplier consumables.
- **Critical spare vs. stock spare**: stock spares serve the EOQ/ROP model; critical spares are insurance — different decision rules.
- **Storeroom as warehouse vs. storeroom as delivery service**: the warehouse holds inventory (passive); the delivery service kits and delivers (active). Kitting converts the warehouse into the delivery service.`,
    practical_application: `- **Monthly**: ABC re-stratify (annual, with monthly refresh of new SKUs); carrying cost %, inventory turns, stockout rate, slow-mover Pareto.
- **Weekly**: cycle-count A items; review stockouts of the prior week; review VMI replenishment.
- **Daily**: kitting program — pull kits for tomorrow's WOs; deliver at 7 AM; receive against open POs.
- **Outage / turnaround**: pre-build the long-lead parts (8+ weeks); book specialty spares (crane, scaffolding, OEM field-service rep); reserve in the CMMS.
- **Quarterly**: critical-spares review — add new critical assets, de-scope lower-criticality items.`,
    decision_scenario: `You are the storeroom manager at a Chemical plant. 12,400 SKUs, 38% stockout rate on critical parts, 2.1 turns, $5.2M average inventory, 31% slow-mover. You can fund ONE project this year:
  (A) ABC stratification + EOQ/ROP for A items + Min/Max for B/C (~$80k analytical + system config).
  (B) Critical-spares analysis and decision framework (~$40k consultant + criticality workshop).
  (C) Kitting program (~$120k for kitting space + a kitting coordinator).
  (D) VMI for top-50 consumables (~$0 capex, but a sole-source commitment).
Decision: (A) first — the stratification is the foundation; without it, (B), (C), (D) are un-targeted. Sequence: (A) → (B) → (D) → (C). Projected 12-month lift: stockout 38%→4%, turns 2.1→5.4, average inventory $5.2M→$3.4M, slow-mover 31%→12%.`,
    practice_questions: `- Compute EOQ for D = 100, S = $40, H = $2.00. *(Answer: √(2·100·40/2.00) = √4000 = 63.25 → 63.)*
- Compute ROP for D = 60/yr, LT = 20 days, SS = 4. *(Answer: (60/365)·20 + 4 = 3.29 + 4 = 7.29 → 7.)*
- Compute safety stock for 95% service with σ_LT = 2.0. *(Answer: 1.65 × 2.0 = 3.3 → 4.)*
- Average inventory = Q/2 + SS = 12/2 + 4 = 10 units. If unit cost = $200, what's the average inventory value? *(Answer: $2,000.)*
- Annual COGS = $10,000; average inventory value = $2,000. Compute turns. *(Answer: 5 turns/year.)*
- Which is a critical spare: a $14 bearing with 1-week lead time, or a $250k compressor rotor with 12-week lead time and 5-yr MTBF? *(Answer: the rotor — catastrophic downtime vs. insurance carrying cost.)*`,
    certification_questions: `The CMRP exam tests MRO Materials Management as the fifth WM competency. SMRP-aligned prompts:

(a) Compute EOQ from demand, ordering cost, and holding cost.

(b) Compute ROP from lead-time demand and safety stock; size safety stock by service level.

(c) Identify the ABC stratification rule (20/80, 30/15, 50/5) and the policy per class.

(d) Apply the critical-spare decision rule (P(failure in LT) × downtime cost vs. carrying cost).

The questions in this lesson's question bank are aligned to these MRO competencies.`,
    summary: `MRO materials management balances stockout cost against carrying cost. EOQ minimizes ordering + holding cost for A items; ROP triggers replenishment; safety stock absorbs lead-time variability; ABC stratifies SKUs so management effort follows the money; critical spares are insurance against catastrophic downtime; kitting converts the storeroom from a passive warehouse to a delivery service that lifts wrench time. The storeroom is upstream of every work-management KPI; a credible MRO function is the entry gate to a credible planning and scheduling function.`,
    key_takeaways: `- EOQ = √(2DS/H); ROP = (D/365 × LT_days) + SS; SS = z·σ_LT (z=1.65 for 95% service).
- ABC: A items 20%/80%, B 30%/15%, C 50%/5% — stratify policy accordingly.
- Critical spares are insurance — held for catastrophic-failure protection, not for EOQ.
- Kitting eliminates the "parts retrieval" NVAW bucket — the storeroom delivers, the craft does not travel.
- Carrying cost target 18–25%; turns target 4–8/year; stockout rate ≤2%.
- VMI transfers carrying cost to the vendor for high-velocity consumables.
- The storeroom is the planner's supplier; parts availability gates every downstream KPI.`,
    references: `- SMRP. *CMRP Body of Knowledge — Work Management pillar: MRO Materials Management.*
- SMRP. *CMRP Exam Outline.*
- ISO 55001:2014, Cl. 8.1 (Operational planning).
- ISO 55002:2018, §A.6.3 (Spare parts & inventory strategy).
- Mobley, R. K. (2008). *Maintenance Engineering Handbook* (7th ed.). McGraw-Hill. §VII (MRO & inventory control).
- Campbell, J. D. & Jardine, A. K. S. (2001). *Maintenance Strategy*. Productivity Press. Ch. 9.
- Palmer, R. (2012). *Maintenance Planning and Scheduling Handbook* (2nd ed.). Elsevier. Ch. 18 (Storeroom & kitting).
- O'Hanlon, T. (2006). *Uptime*. Industrial Press.`,
  },
  knowledgeObject: {
    title: "MRO materials — EOQ/ROP, ABC, critical spares, kitting",
    domain: "Work Management",
    competency: "MRO Materials Management",
    topic: "MRO inventory strategy",
    concept: "Inventory policy",
    body: {
      definitions: [
        "MRO: Maintenance, Repair & Operations — spares, consumables, tools held for maintenance execution.",
        "Storeroom: warehouse where MRO inventory is held, issued, received.",
        "ABC analysis: Pareto stratification — A 20%/80%, B 30%/15%, C 50%/5%.",
        "Min/Max: simple policy — at Min, order up to Max.",
        "ROP: Reorder Point = lead-time demand + safety stock.",
        "EOQ: Economic Order Quantity = √(2DS/H).",
        "Safety Stock (SS): extra inventory to absorb lead-time demand variability; sized by service level.",
        "Critical Spare: insurance spare for catastrophic-failure, long-lead items.",
        "Kitting: storeroom pre-assembles day-of-job kit; delivers to job site at 7 AM.",
        "VMI: Vendor-Managed Inventory — vendor owns inventory until issue.",
        "Carrying Cost: capital + storage + obsolescence + insurance (target 18–25%).",
      ],
      principles: [
        "The storeroom is the planner's supplier; parts availability gates every downstream KPI.",
        "Balance stockout cost (lost production + expediting) against carrying cost (capital + storage + obsolescence).",
        "EOQ minimizes ordering + holding cost; ROP triggers replenishment; safety stock absorbs lead-time variability.",
        "ABC stratifies SKUs so management effort follows the money.",
        "Critical spares are insurance — held for catastrophic-failure protection.",
        "Kitting eliminates the parts-retrieval NVAW bucket.",
        "VMI transfers carrying cost to the vendor for high-velocity consumables.",
      ],
      components: [
        "ABC stratification (Pareto by annual $ usage).",
        "Min/Max policy for B/C items.",
        "ROP/EOQ policy for A items.",
        "Safety stock sized by service level (z-score).",
        "Critical-spares insurance for catastrophic-failure items.",
        "Kitting program (day-of-job kit, 7 AM delivery).",
        "VMI program for high-velocity consumables.",
        "Storeroom operations (receipt, put-away, issue, return, cycle counting).",
        "MRO reporting (carrying cost %, turns, stockout rate, slow-mover).",
      ],
      mechanism: [
        "ABC stratify → EOQ/ROP for A, Min/Max for B/C → critical-spares analysis → kitting program → cycle counting → monthly reporting.",
      ],
      process: [
        "1. ABC stratify SKU master by annual $ usage.",
        "2. A items: compute EOQ and ROP; negotiate vendor terms; consider VMI.",
        "3. B items: set Min/Max with quarterly review.",
        "4. C items: Min/Max or two-bin; minimal management.",
        "5. Critical-spares selection: criticality + lead-time + downtime cost → hold-or-not.",
        "6. Kitting: planner sends kit list 24 h ahead; storeroom pre-assembles; 7 AM delivery.",
        "7. Cycle counting: A weekly, B monthly, C quarterly.",
        "8. Monthly reporting: carrying cost %, turns, stockout rate, slow-mover Pareto.",
      ],
      formulas: [
        "EOQ = √(2·D·S/H) — D demand/yr, S ordering cost, H holding cost/unit/yr = unit cost × CC%.",
        "ROP = (D/365 × LT_days) + SS.",
        "Safety Stock (95%) = z · σ_LT, z = 1.65.",
        "Carrying Cost % = Annual holding cost / Average inventory value × 100 (target 18–25%).",
        "Inventory Turns = Annual COGS / Average inventory value (target 4–8).",
        "Stockout Rate = Stockout events / Total part-issue transactions × 100 (target ≤2%).",
        "Critical-spare decision: hold if P(failure in LT) × Downtime $/day × LT > Carrying cost of spare.",
      ],
      metrics: [
        "Carrying cost % (18–25% target).",
        "Inventory turns (4–8/year target).",
        "Stockout rate (≤2% target).",
        "Fill rate (≥98% target).",
        "Slow-mover / obsolete % (≤15% target).",
        "Average inventory value ($).",
        "Kitting coverage (% of planned WOs kitted; ≥80% target).",
      ],
      examples: [
        "Power mechanical seal: D=60, S=$50, H=$39.60, LT=30 d, σ_LT=1.65, SL=95%. EOQ ≈ 12 units; SS ≈ 3; ROP ≈ 8; avg inventory value $1,620; turns 6.67/yr.",
        "Oil & Gas compressor rotor: $250k, 12-week LT, $4M downtime cost, MTBF 5 yr. P(fail in LT) = 0.05; expected downtime $200k > carrying cost $55k/yr → hold.",
        "Container Terminal RTG wire rope: $8k, 4-week LT, demand 6/yr; EOQ≈1 (buy-on-demand); Min=1, Max=3; safety stock = 2.",
        "Manufacturing paint-cell bearing: $14, 1-week LT, demand 240/yr; EOQ≈62; VMI candidate.",
      ],
      industrial_examples: [
        "Power — mechanical seal ($180, 22% CC, 30-day LT, 60/yr demand): classic EOQ/ROP application.",
        "Oil & Gas — 5-MW compressor rotor ($250k, 12-week LT, $4M downtime, 5-yr MTBF): critical-spare insurance decision (hold).",
        "Container Terminal — RTG wire rope ($8k, 4-week LT, 6/yr): Min/Max with safety stock.",
        "Manufacturing — paint-cell bearing ($14, 1-week LT, 240/yr): EOQ + VMI candidate.",
        "Chemical plant — 12,400 SKUs; pre-remediation 38% stockout, 2.1 turns, $5.2M avg, 31% slow-mover. After 12 months: 4% stockout, 5.4 turns, $3.4M avg, 12% slow-mover.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Chemical plant storeroom, 12,400 SKUs, 38% stockout, 2.1 turns, $5.2M avg, 31% slow-mover. ABC: A 2,480 (78% $), B 3,720 (16% $), C 6,200 (6% $). Applied: EOQ/ROP for A; Min/Max quarterly for B; Min/Max annual for C; critical-spares analysis (28 insurance items, 4 added, 2 de-scoped); kitting program (80% of planned WOs kitted); VMI for top-50 consumables. After 12 months: stockout 38%→4%, turns 2.1→5.4, avg $5.2M→$3.4M, slow-mover 31%→12%.",
      ],
      common_errors: [
        "One inventory policy for all SKUs (over-manages C, under-manages A).",
        "No ABC stratification (effort spread evenly; A items neglected).",
        "Safety stock sized by gut, not z-score service level.",
        "No critical-spares analysis (insurance held by habit or skipped by recency).",
        "No kitting program (parts retrieval dominates the NVAW Pareto).",
        "No cycle counting (CMMS inventory drifts; reservations break).",
        "Obsolete inventory not written off (carrying cost accumulates; turns collapse).",
        "VMI skipped because 'we lose control' (VMI is a sole-source commitment, not a loss of control).",
      ],
      limitations: [
        "EOQ assumes constant demand and fixed lead time; lumpy demand requires periodic-review (R, s, S).",
        "Safety stock by normal approximation under-estimates for skewed demand distributions.",
        "Critical-spare decision is sensitive to failure-rate estimate (MTBF).",
        "Kitting requires a clean BOM; missing parts break the kit on execution day.",
        "VMI transfers carrying cost but creates sole-source risk.",
      ],
      best_practices: [
        "ABC stratify annually; refresh new SKUs monthly.",
        "Apply EOQ/ROP for A items; Min/Max for B; Min/Max or two-bin for C.",
        "Size safety stock by service level (z = 1.65 for 95%, 2.33 for 99%).",
        "Run critical-spares analysis with criticality + lead-time + downtime-cost decision rule.",
        "Operate a kitting program — pre-assemble 24 h ahead; deliver at 7 AM.",
        "Cycle-count weekly (A), monthly (B), quarterly (C).",
        "Write off obsolete inventory quarterly.",
        "Negotiate VMI for high-velocity consumables.",
      ],
      related_concepts: [
        "Planning (BOM explosion, parts reservation).",
        "Scheduling (parts confirmation gates the schedule).",
        "Work Execution (kit delivered to job site lifts wrench time).",
        "CMMS (BOM data, reservations, bin-issue transactions).",
        "ISO 55001:2014 Cl. 8.1 (Operational planning).",
        "ISO 55002:2018 §A.6.3 (Spare parts & inventory strategy).",
      ],
      prerequisites: [
        "Work-management cycle (Lessons 1–4).",
        "Basic inventory arithmetic (cycle stock, safety stock, lead-time demand).",
        "Normal-distribution service level (z-score for 95% = 1.65).",
        "Cost-of-capital concept (carrying cost = capital + storage + obsolescence + insurance).",
      ],
      references: [
        "SMRP CMRP BOK — WM pillar: MRO Materials Management.",
        "SMRP CMRP Exam Outline.",
        "ISO 55001:2014 Cl. 8.1.",
        "ISO 55002:2018 §A.6.3.",
        "Mobley (2008), §VII (MRO & inventory control).",
        "Campbell & Jardine (2001), Ch. 9.",
        "Palmer (2012), Ch. 18 (Storeroom & kitting).",
        "O'Hanlon (2006), Uptime.",
      ],
    },
  },
  questions: [
    {
      competencyName: "MRO Materials Management",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Power",
      stem: "A Power-plant mechanical seal has annual demand D = 60 units, ordering cost S = $50/order, and holding cost H = $1.50/unit/year. Compute the Economic Order Quantity (EOQ).",
      whyCorrect:
        "EOQ = √(2·D·S/H) = √(2·60·50/1.50) = √(6000/1.50) = √4000 ≈ 63.25 → 63 units per order. The order size minimizes total annual ordering + holding cost.",
      whyOthersWrong: [
        "32 units is wrong — that would be √(2·60·50/6.0), i.e., with H=$6 (not $1.50).",
        "120 units is wrong — that would be √(2·60·50/0.375), with H=$0.375 (not $1.50).",
        "10 units is wrong — that would be √(2·60·50/24), with H=$24 (not $1.50).",
      ],
      explanation:
        "EOQ = √(2DS/H) is derived by minimizing TC = (D/Q)S + (Q/2)H. With D=60, S=$50, H=$1.50, Q* = √4000 ≈ 63 units.",
      options: [
        { text: "63 units per order", isCorrect: true },
        { text: "32 units per order", isCorrect: false },
        { text: "120 units per order", isCorrect: false },
        { text: "10 units per order", isCorrect: false },
      ],
    },
    {
      competencyName: "MRO Materials Management",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Power",
      stem: "Compute the Reorder Point (ROP) for D = 60 units/yr, LT = 30 days, and safety stock SS = 3 units.",
      whyCorrect:
        "ROP = (D/365 × LT_days) + SS = (60/365 × 30) + 3 = 0.1644 × 30 + 3 = 4.93 + 3 ≈ 7.93 → round to 8 units. When on-hand drops to 8, place an order.",
      whyOthersWrong: [
        "4.93 units is the lead-time demand only (without safety stock) — the ROP must include the safety-stock buffer.",
        "3 units is the safety stock only — the ROP must include lead-time demand.",
        "30 units equals the lead time in days, which is dimensionally wrong — ROP is in units of inventory, not days.",
      ],
      explanation:
        "ROP = lead-time demand + safety stock. Lead-time demand = (D/365) × LT_days. Safety stock absorbs lead-time variability.",
      options: [
        { text: "8 units", isCorrect: true },
        { text: "4.93 units", isCorrect: false },
        { text: "3 units", isCorrect: false },
        { text: "30 units", isCorrect: false },
      ],
    },
    {
      competencyName: "MRO Materials Management",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which is the correct ABC stratification rule applied to MRO inventory?",
      whyCorrect:
        "A: top 20% of SKUs accounting for ~80% of $ usage; B: next 30% of SKUs accounting for ~15% of $; C: bottom 50% of SKUs accounting for ~5% of $. This is the Pareto principle applied to inventory; management effort follows the money.",
      whyOthersWrong: [
        "A: 50% of SKUs / 80% of $ — inverted; would over-classify most SKUs as A and dilute management effort.",
        "A: 10% / 50%; B: 20% / 30%; C: 70% / 20% — uses different cut-offs than the standard Pareto.",
        "A: 30% / 30%; B: 30% / 30%; C: 40% / 40% — equal split, which defeats the Pareto stratification purpose.",
      ],
      explanation:
        "ABC stratification by annual $ usage: A (top 20% / 80% of $) gets tight EOQ/ROP management; B (30% / 15%) gets Min/Max quarterly; C (50% / 5%) gets Min/Max or two-bin.",
      options: [
        { text: "A: 20%/80%, B: 30%/15%, C: 50%/5%", isCorrect: true },
        { text: "A: 50%/80%, B: 30%/15%, C: 20%/5%", isCorrect: false },
        { text: "A: 10%/50%, B: 20%/30%, C: 70%/20%", isCorrect: false },
        { text: "A: 30%/30%, B: 30%/30%, C: 40%/40%", isCorrect: false },
      ],
    },
    {
      competencyName: "MRO Materials Management",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "DecisionMaking",
      skillType: "Conceptual",
      scenario: "Oil & Gas",
      stem: "A 5-MW compressor rotor costs $250k, has a 12-week lead time, and a 5-year MTBF. A failure would cause $4M in lost production (3-week outage). Carrying cost is 22%/yr. Apply the critical-spare decision rule.",
      whyCorrect:
        "Hold the spare. P(failure in LT = 0.23 yr) ≈ 1/MTBF × LT = 1/5 × 0.23 = 0.046. Expected downtime cost if not held = 0.046 × $4M = $184k. Carrying cost of holding = $250k × 22% = $55k/yr. Expected downtime ($184k) > carrying cost ($55k) ⇒ hold the spare.",
      whyOthersWrong: [
        "Do not hold the spare — the carrying cost ($55k) is real and certain, but the expected downtime cost ($184k) is far larger; insurance logic says hold.",
        "Hold only if MTBF < 1 yr — wrong threshold; the rule is expected downtime cost vs. carrying cost, not MTBF alone.",
        "Hold only if lead time < 4 weeks — wrong threshold; the rule is the cost comparison, not the lead time alone.",
      ],
      explanation:
        "Critical-spare rule: hold if P(failure in LT) × downtime $/day × LT > carrying cost of the spare. The rotor's expected downtime cost ($184k) exceeds its carrying cost ($55k) — insurance logic says hold.",
      options: [
        { text: "Hold the spare — expected downtime cost ($184k) > carrying cost ($55k)", isCorrect: true },
        { text: "Do not hold — the carrying cost ($55k) is real and certain", isCorrect: false },
        { text: "Hold only if MTBF < 1 year", isCorrect: false },
        { text: "Hold only if lead time < 4 weeks", isCorrect: false },
      ],
    },
    {
      competencyName: "MRO Materials Management",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: The EOQ formula is the correct inventory policy for every SKU in a storeroom, regardless of demand pattern or value.",
      whyCorrect:
        "False. EOQ is appropriate for stable-demand A items (top 20% of SKUs by $). For B items (30%/15%), Min/Max with quarterly review is sufficient. For C items (50%/5%), Min/Max or two-bin is appropriate — applying EOQ to C items over-manages them. For critical spares (insurance items), EOQ is the wrong model entirely; the decision is catastrophic-failure insurance vs. carrying cost.",
      whyOthersWrong: [
        "True — applying EOQ to all SKUs wastes analytical effort on low-value C items and under-applies the insurance model to critical spares; ABC stratification exists precisely because different policies fit different strata.",
      ],
      explanation:
        "EOQ is the A-item policy; Min/Max is the B/C policy; insurance-logic is the critical-spare policy. One size does not fit all SKUs.",
      options: [
        { text: "False", isCorrect: true },
        { text: "True", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 6 — Measurements & Reporting
// ---------------------------------------------------------------------------

const LESSON_MEASUREMENTS: RefLesson = {
  competencyName: "Measurements & Reporting",
  slug: "wm-measurements-reporting",
  title: "Maintenance & Reliability KPIs — OEE, MTBF, Backlog",
  titleAr: "مؤشرات الأداء في الصيانة والموثوقية — الكفاءة الكلية ومتوسط الزمن",
  order: 6,
  durationMin: 30,
  references: WM_REFERENCE_TITLES,
  conceptIntroduction: `Measurements & Reporting is the capstone of the work-management cycle: the KPIs that tell the maintenance function whether it is getting better or worse. The CMRP BOK groups the KPIs into four families: (1) Reliability — MTBF, MTTR, availability, failure-rate trend; (2) Maintenance execution — wrench time, schedule compliance, PM compliance, backlog; (3) Asset performance — OEE (Availability × Performance × Quality), asset utilization; (4) Cost — maintenance cost as % of replacement asset value (RAV), cost per unit produced. The reporting cadence is daily/weekly/monthly, with a quarterly reliability review and an annual asset-management review aligned to ISO 55001.`,
  example: `A Packaging line runs 8 h × 5 days = 40 h scheduled. Availability = 87% (3.48 h downtime); Performance = 92% (speed loss); Quality = 99% (reject rate 1%). OEE = 0.87 × 0.92 × 0.99 = 0.7928 = 79.3%. World-class OEE is ≥85%. The line is performing well but has a 7 pp gap to world-class, driven primarily by availability (downtime).`,
  keyFormulas: `OEE = Availability × Performance × Quality (target ≥85%; world-class ≥85%)
Availability = Run time / Planned production time (target ≥90%)
Performance = (Ideal cycle time × Total count) / Run time (target ≥95%)
Quality = Good count / Total count (target ≥99%)
MTBF = Operating hours / # failures; MTTR = Repair time / # failures
PM Compliance = (PMs completed on time) / (PMs scheduled) × 100 (target ≥90%)
Schedule Compliance = (Jobs completed as scheduled) / (Jobs scheduled) × 100 (target ≥85%)
Maintenance Cost %RAV = (Annual maintenance cost) / (Replacement Asset Value) × 100 (target 2–5%)`,
  exercise: `You are the reliability engineer at a Container Terminal. Last month: 4 RTG cranes × 720 scheduled hours = 2,880 h. Downtime = 288 h (availability 90%). Speed loss = 144 h (performance 94.4%). Reject rate negligible. Compute OEE. Then recommend the highest-impact improvement lever.`,
  sections: {
    learning_objectives: `- Compute and interpret OEE (Availability × Performance × Quality) and its three components.
- Compute MTBF, MTTR, and intrinsic availability from CMMS failure data.
- Compute and interpret PM Compliance, Schedule Compliance, Backlog Weeks, Wrench Time, and Planned-vs-Actual.
- Compute Maintenance Cost as % of Replacement Asset Value (RAV) and Cost per Unit Produced.
- Build a daily/weekly/monthly/quarterly/annual reporting cadence aligned to ISO 55001.
- Recognize the leading vs. lagging indicator distinction and balance the KPI portfolio.`,
    prerequisites: `- The full work-management cycle (Lessons 1–5: planning, scheduling, execution, CMMS, MRO).
- Basic probability/statistics (mean time between failures, normal distribution).
- Financial basics (replacement asset value, cost-of-capital).
- OEE components: Availability, Performance, Quality.`,
    introduction: `Measurements & Reporting is the sixth and final control point in the work-management cycle. It is the capstone because every other competency — planning, scheduling, execution, CMMS, MRO — is what produces the numbers; reporting is what closes the loop and tells the function whether the upstream disciplines are working. Without measurement, the cycle cannot improve; without reporting, the measurement cannot drive action.

The CMRP BOK groups the KPIs into four families. **Reliability KPIs** (MTBF, MTTR, availability, failure-rate trend) measure the asset's behavior over time. **Maintenance execution KPIs** (wrench time, schedule compliance, PM compliance, backlog) measure the maintenance function's process discipline. **Asset performance KPIs** (OEE, asset utilization) measure the production-system's ability to convert inputs to outputs. **Cost KPIs** (maintenance cost as % of RAV, cost per unit produced) measure the economic efficiency of the maintenance function.

ISO 55001:2014 Clause 9.1 (Monitoring, measurement, analysis and evaluation) requires the asset-management system to measure and report asset performance, asset-management performance, and asset-management-system effectiveness. ISO 55002:2018 §A.9 gives guidance on KPI selection, cadence, and the leading-vs-lagging distinction. The CMRP BOK's Measurements & Reporting competency is the operational implementation of ISO 55001's Clause 9.1.`,
    terminology: `- **OEE (Overall Equipment Effectiveness)**: Availability × Performance × Quality. Target ≥85% (world-class); typical 40–60%.
- **Availability**: run time / planned production time. Includes downtime (planned + unplanned).
- **Performance**: (ideal cycle time × total count) / run time. Includes speed loss and minor stops.
- **Quality**: good count / total count. Includes rejects and rework.
- **MTBF**: mean time between failures = operating hours / # failures.
- **MTTR**: mean time to repair = repair time / # failures.
- **Intrinsic Availability**: MTBF / (MTBF + MTTR) — excludes planned downtime.
- **PM Compliance**: PMs completed on time / PMs scheduled × 100. Target ≥90%.
- **Schedule Compliance**: jobs completed as scheduled / jobs scheduled × 100. Target ≥85%.
- **Backlog Weeks**: total backlog craft-hours / weekly available craft-hours. Target 2–4.
- **Wrench Time**: VA minutes / paid minutes × 100. Target ≥40%; world-class ≥55%.
- **Planned-vs-Actual**: estimate vs. actual labor-hours per WO; estimate accuracy target ±15%.
- **Maintenance Cost %RAV**: annual maintenance cost / replacement asset value × 100. Target 2–5%.
- **Leading vs. Lagging**: leading (PM compliance, backlog weeks, schedule compliance) predict future performance; lagging (MTBF, OEE, cost) report past performance.`,
    detailed_explanation: `**OEE decomposition** is the most powerful diagnostic in the KPI portfolio. The multiplication A × P × Q exposes the bottleneck: if Availability is 70% and P, Q are 95%, the lever is downtime (maintenance + setup); if Performance is 70% and A, Q are 90%, the lever is speed loss (worn equipment, operator skill, micro-stops). World-class OEE is ≥85%; the typical manufacturing plant runs 40–60%, and the gap is almost entirely in the A component (downtime).

**Reliability KPIs** quantify the asset's failure behavior. MTBF = operating hours / # failures; MTTR = repair time / # failures; intrinsic availability = MTBF/(MTBF+MTTR). These require disciplined WO closeout with failure codes (per Lesson 4) and operating-hours capture (runtime meter or production hours). MTBF by failure mode (not just MTBF overall) is the analytical input to RCA and bad-actor analysis. A rising MTBF trend is the lagging indicator that the reliability program is working.

**Maintenance execution KPIs** measure the process discipline of the maintenance function. Wrench time (≥40%, world-class ≥55%) diagnoses the NVAW Pareto. Schedule compliance (≥85%) diagnoses whether the schedule is a contract. PM compliance (≥90%) diagnoses whether PMs are running on schedule. Backlog weeks (2–4) diagnoses whether planning is keeping up with execution. Planned-vs-actual (estimate accuracy ±15%) diagnoses whether the planning function is calibrated. These four KPIs together describe the health of the work-management cycle.

**Cost KPIs** close the loop on economics. Maintenance cost as % of Replacement Asset Value (RAV) is the SMRP-canonical benchmark: target 2–5% (manufacturing), 3–8% (oil & gas), 5–10% (utilities). A plant at 8% of RAV is over-spending; a plant at 1% is under-maintaining and probably deferring. Cost per unit produced (e.g., $0.012 maintenance cost per kWh generated) is the operational efficiency metric — useful when the asset is in a production-line context.

**Leading vs. lagging** is the framing principle. Leading indicators (PM compliance, backlog weeks, schedule compliance, % planned work) are predictors — they tell you what next quarter's lagging indicators will look like. Lagging indicators (MTBF, OEE, cost) are outcomes — they tell you what already happened. A balanced KPI portfolio has both: leading to forecast and act, lagging to confirm and report. A common mistake is to report only lagging indicators and then be surprised when reliability degrades quarter-over-quarter.

**Reporting cadence** aligns to the work-management cycle. **Daily** (15-min stand-up): yesterday's completion, today's schedule, emergent work. **Weekly** (45-min scheduling meeting): MTBF/MTTR by class, PM compliance, schedule compliance, backlog aging. **Monthly** (60-min review): bad-actor top-10, OEE trend, cost-vs-budget, KPI dashboard. **Quarterly** (90-min reliability review): MTBF trend by mode, RCA results, asset-criticality re-validation, planning-ratio and wrench-time studies. **Annual** (half-day asset-management review aligned to ISO 55001): asset-management plan effectiveness, KPI portfolio review, next-year strategy.`,
    core_principles: `- The KPI portfolio has four families: Reliability, Maintenance execution, Asset performance (OEE), Cost.
- OEE = A × P × Q exposes the bottleneck (downtime vs. speed loss vs. quality).
- MTBF by failure mode (not overall) is the analytical input to RCA.
- Leading indicators forecast; lagging indicators report — the portfolio must have both.
- Reporting cadence (daily/weekly/monthly/quarterly/annual) aligns to the work-management cycle.
- ISO 55001 Clause 9.1 is the framework; the KPIs are the operational implementation.
- A KPI without a target and a cadence is just a number — both are required.`,
    components: `- **OEE panel**: Availability, Performance, Quality, OEE; trend lines.
- **Reliability panel**: MTBF by failure mode, MTTR by equipment class, intrinsic availability, failure-rate trend.
- **Execution panel**: wrench time, schedule compliance, PM compliance, backlog weeks, planned-vs-actual.
- **Cost panel**: maintenance cost %RAV, cost per unit produced, cost-vs-budget.
- **Bad-actor list**: top-10 by maintenance cost and downtime, with failure-mode Pareto.
- **KPI dashboard** (daily/weekly/monthly): summary for the maintenance manager.
- **Quarterly reliability review**: trend analysis, RCA results, asset-criticality re-validation.
- **Annual asset-management review** (ISO 55001 Cl. 9.3): plan effectiveness, KPI portfolio review.`,
    process: `1. **Define KPI portfolio**: 4 families (Reliability, Execution, Asset Performance, Cost); 12–15 KPIs total.
2. **Set targets**: per KPI, a world-class target and a plant-specific interim target.
3. **Set cadence**: daily, weekly, monthly, quarterly, annual.
4. **Configure CMMS reports**: WO-status, MTBF, PM compliance, schedule compliance, cost.
5. **Daily**: stand-up dashboard review (yesterday's completion, today's schedule, emergent work).
6. **Weekly**: 45-min scheduling meeting (reliability + execution KPIs).
7. **Monthly**: 60-min management review (all 4 families + bad-actor top-10).
8. **Quarterly**: 90-min reliability review (trend analysis, RCA, asset-criticality re-validation).
9. **Annual**: half-day asset-management review (ISO 55001 Cl. 9.3) — KPI portfolio + next-year strategy.`,
    formula_calculation: `- **OEE**:
  OEE = Availability × Performance × Quality
  Variables: A = run time / planned production time [0..1]; P = (ideal cycle time × total count) / run time [0..1]; Q = good count / total count [0..1]. Units: [0..1] or [%]. Target ≥85% (world-class).
- **Availability**:
  A = (Planned production time − Downtime) / Planned production time
  Variables: planned production time [h]; downtime [h] (planned + unplanned). Target ≥90%.
- **Performance**:
  P = (Ideal cycle time × Total count) / Run time
  Variables: ideal cycle time [s/unit]; total count [units]; run time [h]. Includes speed loss and minor stops. Target ≥95%.
- **Quality**:
  Q = Good count / Total count
  Variables: good count [units]; total count [units]. Includes rejects and rework. Target ≥99%.
- **MTBF**:
  MTBF = Operating hours / Number of failures
  Variables: operating hours [h] (runtime meter or production hours); # failures [events] (WOs closed with failure code). Units: [h/failure].
- **MTTR**:
  MTTR = Total repair time / Number of failures
  Variables: repair time [h] (WO actuals); # failures [events]. Units: [h/failure].
- **Intrinsic Availability**:
  A_int = MTBF / (MTBF + MTTR)
  Excludes planned downtime. Units: [0..1].
- **PM Compliance**:
  PMC = PMs completed on time / PMs scheduled × 100
  "On time" = within ±10% of due date. Target ≥90%.
- **Schedule Compliance**:
  SC = Jobs completed as scheduled / Jobs scheduled × 100. Target ≥85%.
- **Backlog Weeks**:
  BW = Total backlog craft-hours / Weekly available craft-hours. Target 2–4.
- **Wrench Time**:
  WT = VA minutes / Paid minutes × 100. Target ≥40%; world-class ≥55%.
- **Planned-vs-Actual (estimate accuracy)**:
  EA = 1 − |Actual − Estimated| / Estimated. Target ≥0.85 (within ±15%).
- **Maintenance Cost %RAV**:
  MC%RAV = Annual maintenance cost / Replacement Asset Value × 100
  Target 2–5% (manufacturing); 3–8% (oil & gas); 5–10% (utilities).
- **Cost per Unit Produced**:
  CPU = Total maintenance cost / Total units produced. Units [$/unit].`,
    worked_example: `**Problem.** A Packaging line runs 8 h/shift × 5 days = 40 h/week scheduled. Last week: planned downtime (lunch + breaks + changeover) = 4.0 h; unplanned downtime (jams + 1 bearing failure) = 1.0 h. The line produced 18,000 units at ideal cycle time 6 s/unit. Good count = 17,820 (reject rate 1%). Compute (a) Availability, (b) Performance, (c) Quality, (d) OEE, and identify the improvement lever.

**Step 1 — Planned production time.**
  40 h − 4 h planned downtime = 36 h of planned production time.

**Step 2 — Availability.**
  Run time = 36 h − 1 h unplanned downtime = 35 h.
  A = Run time / Planned production time = 35 / 36 = 0.9722 = **97.22%.**

**Step 3 — Performance.**
  Ideal run time = Ideal cycle time × Total count = 6 s/unit × 18,000 units = 108,000 s = 30.0 h.
  P = Ideal run time / Run time = 30 / 35 = 0.8571 = **85.71%.**

**Step 4 — Quality.**
  Q = Good count / Total count = 17,820 / 18,000 = 0.9900 = **99.00%.**

**Step 5 — OEE.**
  OEE = A × P × Q = 0.9722 × 0.8571 × 0.9900 = 0.8240 = **82.40%.**

**Step 6 — Bottleneck analysis.**
  A = 97.22% (above 90% target — good).
  P = 85.71% (below 95% target — gap 9.3 pp).
  Q = 99.00% (at 99% target — good).
  The bottleneck is **Performance** (speed loss). The 9.3 pp gap to target comes from: micro-stops (jams cleared but not classified as downtime), sub-ideal speed (line set to 6.5 s/unit instead of 6 s), and minor idling between carton changes.

**Step 7 — Lever.**
  If P lifts from 85.71% to 95% (closing the gap): OEE rises from 82.40% to 0.9722 × 0.95 × 0.99 = 0.9144 = 91.44% (world-class). The lever is a speed-loss investigation: review the jam-clear classification, set the line to design speed (6 s/unit), and eliminate carton-change idling with a pre-loaded magazine.

**Result.** OEE = 82.40%; bottleneck = Performance (P = 85.71%); lever = speed-loss investigation projected to lift OEE to 91.44% (world-class).`,
    industrial_example: `**Manufacturing — packaging line.** The example above is the canonical packaging-line OEE problem: high Availability and Quality, low Performance, OEE 82.4%. The lever is speed-loss investigation, not downtime reduction.

**Oil & Gas — refinery process unit.** A crude distillation unit's OEE is typically 92–95% (continuous process; low downtime, high quality, low speed loss). The KPI portfolio focuses on Availability (turnaround every 4 years) and MTBF by equipment class. Maintenance cost %RAV is 3.5%.

**Power — 600-MW coal unit.** Capacity factor 80–85% (availability + planned outages); heat rate as the Performance proxy; emissions (SO2, NOx, particulates) as the Quality proxy. Maintenance cost %RAV ~5%. MTBF by equipment class drives the bad-actor top-10.

**Container Terminal — RTG crane fleet.** Crane availability = (scheduled hours − downtime) / scheduled hours. Performance = (moves / hour) / (design moves / hour). Quality = (good moves / total moves). OEE per crane ~75–85%; the lever is usually the Performance component (operator skill + crane-by-crane speed).

**Chemical — batch reactor.** Batch OEE = (good batches × batch size) / (planned production time × ideal batch rate). Bottleneck often Quality (off-spec batch → rework or waste); lever is process-control improvement.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** A mid-sized Chemical plant built a 12-KPI dashboard aligned to ISO 55001 Cl. 9.1, covering all 4 families. Before the dashboard: monthly reports were ad-hoc, no leading indicators, MTBF trend not computed. After 6 months: (i) the daily stand-up reviewed execution KPIs (wrench time, schedule compliance, backlog) and led to a kitting program; (ii) the weekly scheduling meeting reviewed reliability KPIs (MTBF by mode, failure-code Pareto) and triggered 3 RCAs on the top-3 bad actors; (iii) the monthly management review reviewed OEE (lifted from 62% to 78% via the speed-loss lever identified in the morning stand-up); (iv) the quarterly reliability review re-validated asset criticality (de-scoped 12 lower-criticality assets, added 4 from new process units); (v) the annual ISO 55001 review re-balanced the KPI portfolio (added 2 leading indicators — PM compliance and planned-work % — that forecast the next quarter's MTBF). The case shows that a structured reporting cadence aligned to ISO 55001 drives the work-management cycle to improve — KPIs are not just reporting, they are the steering wheel.`,
    visual_explanation: `- **OEE decomposition bar**: 3 bars side-by-side (A 97%, P 86%, Q 99%); the shortest bar identifies the bottleneck.
- **MTBF trend line**: monthly MTBF over 12 months; upward trend is the lagging confirmation of the reliability program.
- **Bad-actor Pareto**: top-10 assets by maintenance cost or downtime; the top-3 drive RCA.
- **Leading vs. lagging quadrant**: leading KPIs on the left (PM compliance, schedule compliance, backlog weeks, planned-work %); lagging KPIs on the right (MTBF, OEE, cost).
- **Reporting cadence timeline**: daily/weekly/monthly/quarterly/annual as concentric circles, with the KPIs reviewed at each.`,
    simulation_opportunity: `A KPI-portfolio sim: the learner is the maintenance manager and is given 12 months of WO + production data. They must: (a) compute the 12 KPIs from raw data, (b) identify the bottleneck (A, P, or Q), (c) recommend the lever (downtime reduction, speed-loss investigation, or quality improvement), (d) design the reporting cadence (daily/weekly/monthly/quarterly/annual), (e) balance leading vs. lagging indicators. Score: KPI accuracy, lever correctness, cadence completeness, leading/lagging balance.`,
    common_mistakes: `- **Reporting only lagging indicators**: the function is surprised when MTBF degrades; the leading indicators (PM compliance, backlog weeks) forecast it.
- **OEE without decomposition**: reporting the product A × P × Q without the three components hides the bottleneck.
- **MTBF overall, not by failure mode**: an aggregate MTBF hides the bad-actor failure mode that drives 80% of the events.
- **No bad-actor Pareto**: every asset gets equal attention; the top-3 bad actors (which drive 80% of cost) get no special RCA.
- **KPIs without targets**: a KPI without a target (world-class + interim) is just a number.
- **KPIs without cadence**: a KPI reported monthly that needed daily intervention is too slow to act on.
- **Cost KPI in isolation**: a low maintenance cost %RAV may be under-maintenance, not efficiency.
- **Confusing intrinsic availability with OEE Availability**: intrinsic A = MTBF/(MTBF+MTTR) excludes planned downtime; OEE Availability includes it. Mixing them produces incoherent OEE calculations.`,
    limitations: `- OEE multiplication hides the worst component — the geometric mean understates the bottleneck. Always report A, P, Q alongside the product.
- MTBF assumes constant failure rate (exponential) — for wear-out failures (Weibull β>1), MTBF is misleading; use the Weibull parameters.
- Cost %RAV depends on the RAV estimate; an outdated RAV (e.g., 10-year-old replacement cost) makes the KPI meaningless.
- Leading indicators predict but do not confirm — a high PM compliance may not lift MTBF if the PM tasks are wrong (a separate analysis).
- KPIs cannot replace judgment — a deteriorating MTBF with high PM compliance may indicate wrong PM tasks, not bad execution.`,
    comparison: `- **Lagging vs. leading**: lagging (MTBF, OEE, cost) reports the past; leading (PM compliance, schedule compliance, backlog, planned-work %) predicts the future. Portfolio needs both.
- **OEE Availability vs. intrinsic availability**: OEE Availability includes planned downtime; intrinsic A = MTBF/(MTBF+MTTR) excludes it. Different purposes (production view vs. reliability view).
- **MTBF vs. failure rate**: failure rate λ = 1/MTBF (constant failure model). MTBF is intuitive; λ is mathematical (used in RBD and FTA).
- **Cost %RAV vs. cost per unit**: %RAV is a capital-relative KPI; CPU is a production-relative KPI. Both are required for full cost understanding.`,
    practical_application: `- **Daily**: stand-up dashboard (yesterday's completion, today's schedule, emergent work).
- **Weekly**: scheduling meeting (MTBF by class, PM compliance, schedule compliance, backlog).
- **Monthly**: management review (all 4 families + bad-actor top-10).
- **Quarterly**: reliability review (trend analysis, RCA results, asset-criticality re-validation).
- **Annual**: ISO 55001 asset-management review (KPI portfolio, next-year strategy).
- **Continuous**: re-baseline targets when world-class is reached; add leading indicators when leading-lagging balance is off.`,
    decision_scenario: `You are the maintenance manager at a Chemical plant. OEE = 62% (composite). Decomposition: A = 92%, P = 70%, Q = 96%. The bad-actor top-3 are: (1) Reactor R-201 agitator (12 failures in 6 months, $480k maintenance cost), (2) Cooling-tower pump P-CT04 (8 seal failures, $310k), (3) Dryer D-101 (6 thermal-fluid leaks, $220k). You can fund ONE lever: (A) downtime reduction (target A 92%→97%), (B) speed-loss investigation (target P 70%→90%), (C) quality improvement (target Q 96%→99%), (D) RCA on the top-3 bad actors.

Decision: **(B) speed-loss investigation** — the P component is the bottleneck (70% vs. 95% target; gap 25 pp). The lever on A (5 pp) and Q (3 pp) is smaller. Sequence: (B) → (D) → (A) → (C). After (B) lifts P to 90%, OEE = 0.92 × 0.90 × 0.96 = 0.795 = 79.5% (lift 17.5 pp). Then (D) on the top-3 bad actors lifts MTBF and reduces unplanned downtime (A rises); projected OEE post-(B)+(D) ≈ 88% (world-class floor).`,
    practice_questions: `- Compute OEE for A = 87%, P = 92%, Q = 99%. *(Answer: 0.87 × 0.92 × 0.99 = 0.7928 = 79.28%.)*
- Compute MTBF for 5 failures in 8,760 operating hours. *(Answer: 1,752 h.)*
- Compute intrinsic availability for MTBF = 1,752 h, MTTR = 4.7 h. *(Answer: 99.73%.)*
- 24 of 30 scheduled PMs completed on time. Compute PM compliance. *(Answer: 80% — below the 90% target.)*
- Annual maintenance cost = $2.4M; RAV = $48M. Compute cost %RAV. *(Answer: 5.0% — at the upper edge of the manufacturing target band.)*
- A line has A = 92%, P = 70%, Q = 96%. Identify the bottleneck. *(Answer: Performance — 25 pp gap to 95% target.)*`,
    certification_questions: `The CMRP exam tests Measurements & Reporting as the sixth WM competency. SMRP-aligned prompts:

(a) Compute OEE from A, P, Q; identify the bottleneck.

(b) Compute MTBF and MTTR from CMMS failure data; compute intrinsic availability.

(c) Distinguish leading from lagging indicators; balance the KPI portfolio.

(d) Compute maintenance cost %RAV and recommend an action (over- vs. under-maintaining).

The questions in this lesson's question bank are aligned to these Measurements & Reporting competencies.`,
    summary: `Measurements & Reporting is the capstone of the work-management cycle. The four KPI families (Reliability, Maintenance execution, Asset performance, Cost) cover the function's behavior. OEE = A × P × Q exposes the bottleneck; MTBF by failure mode drives RCA; PM compliance, schedule compliance, backlog weeks, and wrench time diagnose the process discipline; cost %RAV benchmarks the economic efficiency. The reporting cadence (daily/weekly/monthly/quarterly/annual) aligns to ISO 55001 Clause 9.1. Leading indicators forecast; lagging indicators report — the portfolio must have both. A KPI without a target and a cadence is just a number.`,
    key_takeaways: `- OEE = Availability × Performance × Quality (target ≥85%; world-class ≥85%).
- MTBF = operating hours / failures; MTTR = repair time / failures; A_int = MTBF/(MTBF+MTTR).
- PM Compliance ≥90%; Schedule Compliance ≥85%; Backlog Weeks 2–4; Wrench Time ≥40%; Planned-vs-Actual ±15%.
- Maintenance Cost %RAV target 2–5% (manufacturing); 3–8% (oil & gas); 5–10% (utilities).
- Leading (PM compliance, backlog, schedule compliance) forecasts; lagging (MTBF, OEE, cost) reports — portfolio needs both.
- Reporting cadence: daily stand-up, weekly scheduling, monthly management, quarterly reliability, annual ISO 55001 review.
- KPIs need targets AND cadence to drive action.`,
    references: `- SMRP. *CMRP Body of Knowledge — Work Management pillar: Measurements & Reporting.*
- SMRP. *CMRP Exam Outline.*
- ISO 55001:2014, Cl. 9.1 (Monitoring, measurement, analysis and evaluation), Cl. 9.3 (Management review).
- ISO 55002:2018, §A.9 (KPI selection, cadence, leading vs. lagging).
- Mobley, R. K. (2008). *Maintenance Engineering Handbook* (7th ed.). McGraw-Hill. §III (Wrench-time analysis), §VI (Performance metrics).
- Campbell, J. D. & Jardine, A. K. S. (2001). *Maintenance Strategy*. Productivity Press. Ch. 10.
- Palmer, R. (2012). *Maintenance Planning and Scheduling Handbook* (2nd ed.). Elsevier. Ch. 19 (KPIs).
- O'Hanlon, T. (2006). *Uptime*. Industrial Press.`,
  },
  knowledgeObject: {
    title: "Maintenance & reliability KPIs — OEE, MTBF, backlog",
    domain: "Work Management",
    competency: "Measurements & Reporting",
    topic: "Maintenance & reliability KPIs",
    concept: "KPI portfolio",
    body: {
      definitions: [
        "OEE: Overall Equipment Effectiveness = Availability × Performance × Quality. Target ≥85%.",
        "Availability: run time / planned production time. Target ≥90%.",
        "Performance: (ideal cycle time × total count) / run time. Target ≥95%.",
        "Quality: good count / total count. Target ≥99%.",
        "MTBF: operating hours / # failures. [h/failure].",
        "MTTR: total repair time / # failures. [h/failure].",
        "Intrinsic Availability: MTBF / (MTBF + MTTR) (excludes planned downtime).",
        "PM Compliance: PMs on time / PMs scheduled × 100. Target ≥90%.",
        "Schedule Compliance: jobs completed as scheduled / jobs scheduled × 100. Target ≥85%.",
        "Backlog Weeks: total backlog / weekly capacity. Target 2–4.",
        "Wrench Time: VA minutes / paid minutes × 100. Target ≥40%; world-class ≥55%.",
        "Maintenance Cost %RAV: annual maintenance cost / replacement asset value × 100. Target 2–5% (manufacturing).",
        "Leading vs. Lagging: leading forecasts (PM compliance, backlog); lagging reports (MTBF, OEE, cost).",
      ],
      principles: [
        "Four KPI families: Reliability, Maintenance execution, Asset performance (OEE), Cost.",
        "OEE = A × P × Q exposes the bottleneck (downtime vs. speed loss vs. quality).",
        "MTBF by failure mode (not overall) is the analytical input to RCA.",
        "Leading indicators forecast; lagging indicators report — portfolio needs both.",
        "Reporting cadence: daily/weekly/monthly/quarterly/annual aligned to ISO 55001 Cl. 9.1.",
        "KPIs need targets AND cadence to drive action.",
        "ISO 55001 Cl. 9.1 is the framework; the KPIs are the operational implementation.",
      ],
      components: [
        "OEE panel (A, P, Q, OEE; trend lines).",
        "Reliability panel (MTBF by mode, MTTR by class, intrinsic A, failure-rate trend).",
        "Execution panel (wrench time, schedule compliance, PM compliance, backlog weeks, planned-vs-actual).",
        "Cost panel (cost %RAV, cost per unit, cost-vs-budget).",
        "Bad-actor list (top-10 by cost and downtime; failure-mode Pareto).",
        "KPI dashboard (daily/weekly/monthly).",
        "Quarterly reliability review.",
        "Annual ISO 55001 asset-management review (Cl. 9.3).",
      ],
      mechanism: [
        "Define KPI portfolio → set targets → set cadence → configure CMMS reports → daily stand-up → weekly scheduling → monthly management → quarterly reliability → annual ISO 55001 review.",
      ],
      process: [
        "1. Define KPI portfolio: 4 families, 12–15 KPIs total.",
        "2. Set targets per KPI (world-class + plant-specific interim).",
        "3. Set cadence (daily/weekly/monthly/quarterly/annual).",
        "4. Configure CMMS reports (WO-status, MTBF, PM compliance, schedule compliance, cost).",
        "5. Daily stand-up dashboard (yesterday's completion, today's schedule, emergent).",
        "6. Weekly scheduling meeting (reliability + execution KPIs).",
        "7. Monthly management review (all 4 families + bad-actor top-10).",
        "8. Quarterly reliability review (trend, RCA, asset-criticality re-validation).",
        "9. Annual ISO 55001 review (KPI portfolio + next-year strategy).",
      ],
      formulas: [
        "OEE = Availability × Performance × Quality (target ≥85%).",
        "Availability = (Planned production time − Downtime) / Planned production time (target ≥90%).",
        "Performance = (Ideal cycle time × Total count) / Run time (target ≥95%).",
        "Quality = Good count / Total count (target ≥99%).",
        "MTBF = Operating hours / # failures [h/failure].",
        "MTTR = Total repair time / # failures [h/failure].",
        "Intrinsic Availability = MTBF / (MTBF + MTTR).",
        "PM Compliance = PMs on time / PMs scheduled × 100 (target ≥90%).",
        "Schedule Compliance = Jobs completed as scheduled / Jobs scheduled × 100 (target ≥85%).",
        "Backlog Weeks = Total backlog / Weekly capacity (target 2–4).",
        "Wrench Time = VA minutes / Paid minutes × 100 (target ≥40%).",
        "Planned-vs-Actual = 1 − |Actual − Estimated| / Estimated (target ≥0.85).",
        "Maintenance Cost %RAV = Annual maintenance cost / RAV × 100 (target 2–5% manufacturing).",
        "Cost per Unit = Total maintenance cost / Total units produced [$/unit].",
      ],
      metrics: [
        "OEE (≥85% world-class).",
        "Availability (≥90%), Performance (≥95%), Quality (≥99%).",
        "MTBF by failure mode, MTTR by class, intrinsic availability.",
        "PM compliance (≥90%), schedule compliance (≥85%), backlog weeks (2–4), wrench time (≥40%).",
        "Planned-vs-actual estimate accuracy (±15%).",
        "Maintenance cost %RAV (2–5% manufacturing).",
        "Cost per unit produced.",
        "Bad-actor top-10 by cost and downtime.",
      ],
      examples: [
        "Packaging line: 40 h/week scheduled; planned downtime 4 h, unplanned 1 h, 18,000 units at 6 s/unit, 17,820 good. A = 35/36 = 97.22%; P = 30/35 = 85.71%; Q = 17,820/18,000 = 99%; OEE = 0.9722 × 0.8571 × 0.99 = 82.40%. Bottleneck = Performance (P 85.71%, gap 9.3 pp).",
        "RTG-07 gearbox: 5 failures in 8,760 h ⇒ MTBF = 1,752 h; MTTR = 4.7 h; intrinsic A = 99.73%.",
        "Power plant: 24 of 30 PMs on time ⇒ PM compliance = 80% (below 90% target).",
        "Chemical plant: $2.4M maintenance cost / $48M RAV ⇒ 5.0% cost %RAV (upper edge of manufacturing target).",
      ],
      industrial_examples: [
        "Manufacturing — packaging line OEE 82.4%, bottleneck P (speed loss).",
        "Oil & Gas — refinery CDU OEE 92–95%; cost %RAV 3.5%; MTBF by class drives bad-actor top-10.",
        "Power — 600-MW coal unit; capacity factor 80–85%; cost %RAV ~5%; heat rate as Performance proxy.",
        "Container Terminal — RTG crane OEE 75–85%; bottleneck usually Performance (operator skill + speed).",
        "Chemical — batch reactor OEE; bottleneck often Quality (off-spec batch); lever is process-control improvement.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Chemical plant 12-KPI dashboard aligned to ISO 55001 Cl. 9.1. Pre-dashboard: ad-hoc reports, no leading indicators, MTBF trend not computed. 6 months: daily stand-up reviewed execution KPIs → kitting program; weekly scheduling reviewed MTBF by mode → 3 RCAs; monthly review reviewed OEE (lifted 62%→78% via speed-loss lever); quarterly reliability re-validated criticality (de-scoped 12, added 4); annual ISO 55001 review added 2 leading indicators (PM compliance, planned-work %) to forecast next-quarter MTBF. KPIs are the steering wheel, not just the report card.",
      ],
      common_errors: [
        "Reporting only lagging indicators (surprised when MTBF degrades).",
        "OEE without decomposition (A, P, Q hidden).",
        "MTBF overall, not by failure mode (bad-actor mode hidden).",
        "No bad-actor Pareto (top-3 get no RCA).",
        "KPIs without targets (just numbers).",
        "KPIs without cadence (too slow to act).",
        "Cost KPI in isolation (low %RAV may be under-maintenance).",
        "Confusing intrinsic availability with OEE Availability (excludes vs. includes planned downtime).",
      ],
      limitations: [
        "OEE multiplication hides the worst component (geometric mean understates bottleneck).",
        "MTBF assumes constant failure rate; wear-out (Weibull β>1) requires Weibull params.",
        "Cost %RAV depends on RAV estimate; outdated RAV makes KPI meaningless.",
        "Leading indicators predict but do not confirm — high PM compliance may not lift MTBF if PM tasks are wrong.",
        "KPIs cannot replace judgment — deteriorating MTBF with high PM compliance may indicate wrong PM tasks.",
      ],
      best_practices: [
        "Decompose OEE into A, P, Q — report all three alongside the product.",
        "Compute MTBF by failure mode, not overall.",
        "Run a bad-actor Pareto (top-10 by cost and downtime).",
        "Set world-class + plant-specific interim targets per KPI.",
        "Set daily/weekly/monthly/quarterly/annual cadence per KPI.",
        "Balance leading (PM compliance, backlog, schedule compliance) and lagging (MTBF, OEE, cost).",
        "Re-baseline targets when world-class is reached.",
        "Re-validate asset criticality quarterly.",
      ],
      related_concepts: [
        "Planning (planning ratio, planned-work %).",
        "Scheduling (schedule compliance, backlog weeks).",
        "Work Execution (wrench time, closeout rate, failure-code capture).",
        "CMMS (WO status, MTBF/MTTR computation, failure-code Pareto).",
        "MRO Materials Management (stockout rate, turns, carrying cost %).",
        "ISO 55001:2014 Cl. 9.1 (Monitoring, measurement, analysis, evaluation), Cl. 9.3 (Management review).",
      ],
      prerequisites: [
        "Full work-management cycle (Lessons 1–5).",
        "Basic probability/statistics (mean time between failures, normal distribution).",
        "Financial basics (RAV, cost-of-capital).",
        "OEE components: Availability, Performance, Quality.",
      ],
      references: [
        "SMRP CMRP BOK — WM pillar: Measurements & Reporting.",
        "SMRP CMRP Exam Outline.",
        "ISO 55001:2014 Cl. 9.1, 9.3.",
        "ISO 55002:2018 §A.9.",
        "Mobley (2008), §III, §VI.",
        "Campbell & Jardine (2001), Ch. 10.",
        "Palmer (2012), Ch. 19.",
        "O'Hanlon (2006), Uptime.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Measurements & Reporting",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Manufacturing",
      stem: "A Packaging line has Availability = 87%, Performance = 92%, Quality = 99%. Compute the Overall Equipment Effectiveness (OEE).",
      whyCorrect:
        "OEE = A × P × Q = 0.87 × 0.92 × 0.99 = 0.7928 = 79.28%. World-class OEE is ≥85%; this line has a 5.7 pp gap to world-class, driven primarily by Availability (87% vs. 90% target).",
      whyOthersWrong: [
        "82.4% is wrong — that would be 0.9722 × 0.8571 × 0.99 (the worked-example numbers, not the question's numbers).",
        "78.0% is wrong — that would be 0.87 × 0.92 × 0.97 (with Q = 97%, not 99%).",
        "85.0% is the world-class target, not the computed value for these inputs.",
      ],
      explanation:
        "OEE = Availability × Performance × Quality. The geometric mean exposes the bottleneck; report A, P, Q alongside the product.",
      options: [
        { text: "79.28%", isCorrect: true },
        { text: "82.40%", isCorrect: false },
        { text: "78.00%", isCorrect: false },
        { text: "85.00%", isCorrect: false },
      ],
    },
    {
      competencyName: "Measurements & Reporting",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Analyze",
      cognitiveLevel: "DecisionMaking",
      skillType: "Conceptual",
      scenario: "Chemical",
      stem: "A Chemical plant OEE = 62% with decomposition A = 92%, P = 70%, Q = 96%. The bad-actor top-3 are: agitator R-201, cooling-tower pump P-CT04, dryer D-101. Rank the improvement levers.",
      whyCorrect:
        "(B) Speed-loss investigation first — Performance is the bottleneck (70% vs. 95% target; gap 25 pp). Lever on A (5 pp) and Q (3 pp) is much smaller. Sequence: (B) → (D) RCA on top-3 → (A) downtime → (C) quality. After (B) lifts P to 90%, OEE = 0.92 × 0.90 × 0.96 = 79.5% (lift 17.5 pp).",
      whyOthersWrong: [
        "(A) Downtime reduction first — A is already 92% (above the 90% target); the lever on A is small (5 pp) compared to P (25 pp).",
        "(C) Quality improvement first — Q is already 96% (close to the 99% target); the lever on Q is small (3 pp).",
        "(D) RCA on top-3 bad actors first — RCA is high-value but the OEE decomposition identifies P as the bottleneck; sequence (B) first to lift OEE, then (D) on the bad actors.",
      ],
      explanation:
        "OEE decomposition identifies the bottleneck. P at 70% is the worst component (largest gap to target); closing the P gap lifts OEE the most.",
      options: [
        { text: "(B) Speed-loss investigation (P 70%→90%) → (D) RCA on top-3 → (A) → (C)", isCorrect: true },
        { text: "(A) Downtime reduction (A 92%→97%) → (B) → (D) → (C)", isCorrect: false },
        { text: "(C) Quality improvement (Q 96%→99%) → (B) → (D) → (A)", isCorrect: false },
        { text: "(D) RCA on top-3 bad actors → (B) → (A) → (C)", isCorrect: false },
      ],
    },
    {
      competencyName: "Measurements & Reporting",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Power",
      stem: "A Power plant's annual maintenance cost is $2.4M; the Replacement Asset Value (RAV) is $48M. Compute the maintenance cost as % of RAV and interpret.",
      whyCorrect:
        "MC%RAV = ($2.4M / $48M) × 100 = 5.0%. For manufacturing the target band is 2–5%; for utilities it is 5–10%. This plant is at the upper edge of the manufacturing band — investigate whether the cost is appropriate (right work being done) or excessive (deferred work, over-maintaining, or bad-actor cost).",
      whyOthersWrong: [
        "2.0% would require $0.96M cost (not $2.4M); that would be comfortably in the manufacturing target band.",
        "50% inverts the ratio — that would be RAV/maintenance cost, dimensionally wrong.",
        "0.05% is the decimal value, not the percentage — 0.05 × 100 = 5.0%.",
      ],
      explanation:
        "MC%RAV = (annual maintenance cost / RAV) × 100. The SMRP benchmark: manufacturing 2–5%, oil & gas 3–8%, utilities 5–10%. The interpretation depends on the industry and on whether the cost is producing reliability (right work) or not.",
      options: [
        { text: "5.0% — at the upper edge of the manufacturing band; investigate whether right work or over-maintaining", isCorrect: true },
        { text: "2.0% — comfortably in the manufacturing target band", isCorrect: false },
        { text: "50.0% — severely over-spending; immediate action", isCorrect: false },
        { text: "0.05% — well below the target band; under-maintaining", isCorrect: false },
      ],
    },
    {
      competencyName: "Measurements & Reporting",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "Which of the following is a LEADING indicator (predicts future performance) rather than a lagging indicator (reports past performance)?",
      whyCorrect:
        "PM Compliance is a leading indicator — it predicts whether next quarter's MTBF will rise or fall (high PM compliance ⇒ preventive tasks are running on schedule ⇒ MTBF likely to rise). The other three (MTBF, OEE, maintenance cost) are lagging indicators that report what already happened.",
      whyOthersWrong: [
        "MTBF is a lagging indicator — it reports the failure behavior of the asset over a past period; it does not forecast future behavior.",
        "OEE is a lagging indicator — it reports the production-system's past effectiveness.",
        "Maintenance cost is a lagging indicator — it reports past spending; it does not forecast whether the spending will produce reliability.",
      ],
      explanation:
        "Leading indicators (PM compliance, backlog weeks, schedule compliance, planned-work %) forecast future lagging indicators (MTBF, OEE, cost). A balanced KPI portfolio has both.",
      options: [
        { text: "PM Compliance (PMs completed on time / PMs scheduled)", isCorrect: true },
        { text: "MTBF (operating hours / # failures)", isCorrect: false },
        { text: "OEE (Availability × Performance × Quality)", isCorrect: false },
        { text: "Maintenance Cost %RAV", isCorrect: false },
      ],
    },
    {
      competencyName: "Measurements & Reporting",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: Intrinsic availability (MTBF / (MTBF + MTTR)) and OEE Availability are interchangeable terms — both include planned downtime.",
      whyCorrect:
        "False. Intrinsic availability = MTBF/(MTBF+MTTR) EXCLUDES planned downtime (it is a reliability-engineering view of the asset). OEE Availability = (planned production time − downtime) / planned production time INCLUDES planned downtime (it is a production-system view). Mixing them produces incoherent OEE calculations.",
      whyOthersWrong: [
        "True — the two are deliberately different metrics for different purposes; intrinsic A is the reliability view (excludes planned), OEE A is the production view (includes planned).",
      ],
      explanation:
        "Intrinsic A excludes planned downtime (reliability view); OEE A includes planned downtime (production view). Both are correct for their purpose, but they are not interchangeable.",
      options: [
        { text: "False", isCorrect: true },
        { text: "True", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Public lesson array
// ---------------------------------------------------------------------------

export const CMRP_WM_LESSONS: RefLesson[] = [
  LESSON_PLANNING,
  LESSON_SCHEDULING,
  LESSON_WORK_EXECUTION,
  LESSON_CMMS,
  LESSON_MRO,
  LESSON_MEASUREMENTS,
];

// ---------------------------------------------------------------------------
// Loader — writes the dataset into the database (certification track)
// ---------------------------------------------------------------------------

/**
 * Upsert the CMRP Work Management reference dataset into the database.
 * Idempotent: safe to call repeatedly. Returns record counts written.
 *
 * Flow:
 *  1. Find CMRP certification by slug "cmrp"; find WM domain by code "WM";
 *     map the 6 WM competencies by NAME -> id (Planning, Scheduling, Work
 *     Execution, CMMS, MRO Materials Management, Measurements & Reporting).
 *  2. Upsert References globally (by title, no sectionId) -> a shared
 *     referenceIds array applied to every WM lesson, KO, and question.
 *  3. For each lesson:
 *     - db.lesson.findFirst({where:{competencyId, slug}}) then update or
 *       create with sectionId=null, certificationId, competencyId, slug,
 *       title, titleAr, order, durationMin, conceptIntroduction, example,
 *       keyFormulas, exercise, sections (JSON.stringify), referenceIds (JSON
 *       stringify shared), status="READY", confidence="HIGH",
 *       verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
 *  4. Upsert KnowledgeObject per lesson: findFirst({where:{lessonId}}) then
 *     create/update with certificationId, competencyId, lessonId, body JSON,
 *     referenceIds (JSON shared), status="READY", confidence="HIGH",
 *     verificationStatus="VERIFIED", version="1.0.0".
 *  5. For each lesson: db.question.deleteMany({where:{certificationId,
 *     competencyId}}) then create each enriched question with nested options,
 *     knowledgeObjectId link, whyCorrect, whyOthersWrong (JSON), referenceIds
 *     (JSON), status="READY", verificationStatus="VERIFIED", version="1.0.0".
 *  6. Return { lessons, kos, questions, references, competencies } counts.
 */
export async function loadReference() {
  // 1) Certification + WM domain + competency map
  const certification = await db.certification.findUnique({
    where: { slug: "cmrp" },
  });
  if (!certification) {
    throw new Error(
      'CMRP certification not found. Run the CMRP structure loader (src/lib/ref-content/cmrp.ts) first.'
    );
  }

  const wmDomain = await db.domain.findFirst({
    where: { certificationId: certification.id, code: "WM" },
  });
  if (!wmDomain) {
    throw new Error(
      'Work Management (WM) domain not found under CMRP. Run the CMRP structure loader first.'
    );
  }

  const wmCompetencies = await db.competency.findMany({
    where: { domainId: wmDomain.id },
  });
  const competencyIdByName: Record<string, string> = {};
  for (const c of wmCompetencies) {
    competencyIdByName[c.name] = c.id;
  }

  // Validate that all 6 expected WM competencies exist by name.
  const expectedCompetencyNames = CMRP_WM_LESSONS.map((l) => l.competencyName);
  const missing = expectedCompetencyNames.filter(
    (n) => !competencyIdByName[n]
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing WM competencies by name: ${missing.join(
        ", "
      )}. Ensure src/lib/ref-content/cmrp.ts has been loaded with the latest WM competency names.`
    );
  }

  // 2) References — global (no sectionId), upserted by title.
  const refIdsByTitle: Record<string, string> = {};
  for (const src of CMRP_WM_SOURCES) {
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
  const sharedReferenceIds = CMRP_WM_SOURCES.map((s) => refIdsByTitle[s.title]).filter(
    Boolean
  ) as string[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 3) Lessons, 4) KnowledgeObjects, 5) Questions
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of CMRP_WM_LESSONS) {
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

    // 3) Lesson — findFirst by (competencyId, slug) then update or create
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

    // 4) KnowledgeObject — findFirst by lessonId, then update or create.
    const ko = lesson.knowledgeObject;
    const koBodyJson = JSON.stringify(ko.body);
    const existingKO = await db.knowledgeObject.findFirst({
      where: { lessonId },
    });
    const koData = {
      certificationId: certification.id,
      domainId: wmDomain.id,
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

    // 5) Questions — delete existing for this competency (scoped), then
    //    create each enriched question with nested options.
    await db.question.deleteMany({
      where: { certificationId: certification.id, competencyId },
    });

    for (const q of lesson.questions) {
      await db.question.create({
        data: {
          certificationId: certification.id,
          domainId: wmDomain.id,
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
    domain: wmDomain.id,
    competencies: wmCompetencies.length,
    lessons: lessonsCount,
    kos: kosCount,
    questions: questionsCount,
    references: referencesCount,
  };
}




