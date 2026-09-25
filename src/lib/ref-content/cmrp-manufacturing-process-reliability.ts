/**
 * CMRP — Manufacturing Process Reliability (MPR) pillar — Deep scientific reference.
 * Task ID: 14-MPR — Engineer's Educations Knowledge-Driven Platform.
 *
 * Certification slug: "cmrp" (Certified Maintenance & Reliability Professional).
 * Domain code: "MPR" (Manufacturing Process Reliability) — one of the 5 official
 * SMRP CMRP pillars. The MPR pillar concerns designing, commissioning, and
 * sustaining reliable manufacturing processes — i.e., process reliability &
 * maintainability engineering across the asset lifecycle.
 *
 * Four lessons, one per MPR competency (as seeded in src/lib/ref-content/cmrp.ts):
 *   1. Process Design                 (slug: mpr-process-design)
 *   2. Installation & Commissioning   (slug: mpr-installation-commissioning)
 *   3. Reliability & Maintainability   (slug: mpr-reliability-maintainability)
 *   4. Maintenance Technologies        (slug: mpr-maintenance-technologies)
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
 *   - 5 enriched questions (whyCorrect + one whyOthersWrong per distractor +
 *     cognitiveLevel + KO link + scenario/industry metadata), mixing MCQ and
 *     a few True/False, spanning Easy/Medium/Hard × Remember/Understand/Apply/
 *     Analyze. Total in this file: 20 questions.
 *
 * Source hierarchy (spec §5) — Levels 2, 3, 6, 7:
 *   - LEVEL 3 — Official BOK / Handbook / Exam Outline: SMRP CMRP BOK (MPR),
 *     SMRP CMRP exam outline.
 *   - LEVEL 2 — Official Standard / Standards Organization: ISO 55000:2014.
 *   - LEVEL 7 — Technical Publications / Industry Sources: Mobley
 *     (Maintenance Engineering Handbook), Campbell & Jardine (Maintenance
 *     Strategy).
 *   - LEVEL 6 — University / Academic Publications: Ebeling (An Introduction
 *     to Reliability and Maintainability Engineering), Jardine & Tsang
 *     (Maintenance, Replacement, and Reliability: Theory and Applications).
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
 *   2. Find the MPR domain by code "MPR"; map its 4 competencies by NAME -> id.
 *   3. Upsert References globally (by title, no sectionId) -> shared
 *      referenceIds array applied to every MPR lesson / KO / question.
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
// Public types (mirrors cmrp-work-management.ts)
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
// Sources (Levels 2, 3, 6, 7 — real, widely-known references)
// ---------------------------------------------------------------------------

export const CMRP_MPR_SOURCES: RefSource[] = [
  {
    title:
      "SMRP CMRP Body of Knowledge — Manufacturing Process Reliability pillar",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "BOK",
    url: "https://www.smrp.org/certification/cmrp-exam",
    citation:
      "Society for Maintenance & Reliability Professionals (SMRP). CMRP Body of Knowledge — Manufacturing Process Reliability (MPR) pillar: Process Design, Installation & Commissioning, Reliability & Maintainability, and Maintenance Technologies. The official competency framework assessed by the CMRP exam — the design-stage and process-stage reliability engineering content that distinguishes MPR from the Equipment Reliability pillar.",
  },
  {
    title: "SMRP CMRP Exam Outline",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "EXAM_OUTLINE",
    url: "https://www.smrp.org/certification",
    citation:
      "SMRP. Certified Maintenance & Reliability Professional (CMRP) Exam Outline — published content domain weights, question count, time limit, and passing-score guidance. Cross-references the five-pillar BOK and details the MPR competencies tested at design, commissioning, and process-sustaining stages.",
  },
  {
    title: "ISO 55000:2014 — Asset management — Overview, principles and terminology",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/55088.html",
    citation:
      "International Organization for Standardization. ISO 55000:2014, Asset management — Overview, principles and terminology. Geneva: ISO. Defines asset, asset management, asset management system, and the value-of-asset-management principles that frame the MPR pillar — particularly the lifecycle stages (acquisition / commissioning / use / disposal) over which process reliability is engineered.",
  },
  {
    title: "Mobley — Maintenance Engineering Handbook (McGraw-Hill)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "HANDBOOK",
    citation:
      "Mobley, R. K. (2008). Maintenance Engineering Handbook (7th ed.). McGraw-Hill. ISBN 978-0-07-154358-1. Section I (Engineering maintenance management), Section III (Reliability engineering — incl. Weibull, bathtub curve, RAM), Section VI (Predictive maintenance technologies — vibration, oil, IR, ultrasonic), Section IX (Commissioning & installation). The widely-cited technical reference for MPR-stage reliability engineering.",
  },
  {
    title: "Campbell & Jardine — Maintenance Strategy (Productivity Press)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Campbell, J. D. & Jardine, A. K. S. (2001). Maintenance Strategy: A World Class Approach to Asset Management. Productivity Press / CRC. ISBN 978-0-415-36922-8. Develops the link between maintenance strategy, asset criticality, and the design-for-reliability and commissioning stages of the asset lifecycle, including the Proactive Maintenance lifecycle model that anchors the MPR pillar.",
  },
  {
    title:
      "Ebeling — An Introduction to Reliability and Maintainability Engineering (Waveland)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Ebeling, C. E. (2010). An Introduction to Reliability and Maintainability Engineering (2nd ed.). Waveland Press / McGraw-Hill. ISBN 978-1-57766-625-9. The university-level reliability text: reliability, availability, maintainability theory, system reliability models (series, parallel, k-of-n, standby), failure distributions (Weibull, exponential, lognormal), reliability allocation, design-for-reliability, and reliability growth testing — the quantitative backbone of the MPR pillar.",
  },
  {
    title:
      "Jardine & Tsang — Maintenance, Replacement, and Reliability: Theory and Applications (CRC)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Jardine, A. K. S. & Tsang, A. H. C. (2017). Maintenance, Replacement, and Reliability: Theory and Applications (2nd ed.). CRC / Taylor & Francis. ISBN 978-1-4665-7282-1. The decision-science reference for M&R: replacement/inspection optimization, RCM decision logic, condition-based maintenance modeling, and the P-F interval formalism that underpins Maintenance Technologies selection — applied mathematics for the MPR competencies.",
  },
];

// Shared reference list — every MPR lesson cites the same set of MPR sources.
const MPR_REFERENCE_TITLES = CMRP_MPR_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Lesson 1 — Process Design
// ---------------------------------------------------------------------------

const LESSON_PROCESS_DESIGN: RefLesson = {
  competencyName: "Process Design",
  slug: "mpr-process-design",
  title: "Designing Processes for Inherent Reliability & Maintainability",
  titleAr: "تصميم العمليات للموثوقية والقابلية للصيانة الكامنة",
  order: 1,
  durationMin: 32,
  references: MPR_REFERENCE_TITLES,
  conceptIntroduction: `Process Design, the first MPR competency, is the engineering discipline that determines process reliability before the asset is ever built. The thesis is that reliability is an attribute that is "designed-in" not "maintained-in": a process designed with low-failure-rate equipment, redundancy for the dominant failure modes, accessible maintenance envelopes, and a P-F (Potential to Functional failure) interval long enough to be inspected, will outperform any reactive maintenance program no matter how disciplined. The CMRP Body of Knowledge places Process Design first in the MPR pillar because the choices made at the design stage (sizing, materials, configuration, redundancy, instrumentation, access) define the ceiling of reliability the operating plant can ever reach. ISO 55000:2014 frames this as the asset-lifecycle "acquisition" stage, where asset-management value is largely determined — typically 60–80% of life-cycle cost is locked in by design decisions.`,
  example: `Design a chemical-plant reactor-feed section: 3 parallel centrifugal pumps (2 duty + 1 standby) feeding a fixed-bed reactor. Each pump MTBF = 8,000 h (Weibull shape β = 1.4 — wear-out mode). Without redundancy, single-pump availability = MTBF/(MTBF+MTTR) = 8,000/(8,000+24) = 0.997. With 2-out-of-3 standby redundancy and identical failure/repair rates, the system availability rises to ≈0.9995 (Ebeling §6.7). The design choice costs +$45 k for the third pump skid but pays back via avoided lost-production events at $11 k/hour.`,
  keyFormulas: `Reliability function (exponential): R(t) = e^(-λt),  λ = 1/MTBF
MTBF of a series system (n components): MTBF_series = 1 / Σ(1/MTBF_i)
Availability (single block): A = MTBF / (MTBF + MTTR)
Availability of n series blocks: A_series = Π A_i
Availability of 2 identical active parallel blocks: A_parallel = 1 - (1-A)^2
P-F interval: t_PF = t_FunctionalFailure - t_PotentialFailure
Optimal inspection interval: t_insp ≈ t_PF / 2 (Moubray rule of thumb)`,
  exercise: `A new process has 4 series stages with MTBFs of 12,000 / 18,000 / 9,000 / 15,000 h. (a) Compute the system MTBF. (b) If MTTR per stage averages 36 h, what is the steady-state availability? (c) Identify the dominant stage (lowest contributor) and propose two design alternatives that would raise system MTBF by ≥50%.`,
  sections: {
    learning_objectives: `- Define "inherent reliability" and distinguish it from "operational reliability" and "achieved reliability" (Ebeling §1.3).
- Apply a RAM (Reliability/Availability/Maintainability) analysis at the design stage to predict steady-state process availability and to justify design choices against a target availability.
- Construct a Reliability Block Diagram (RBD) for a multi-stage process and compute series/parallel/standby availability with the correct formulas.
- Define the P-F interval (Moubray / Jardine & Tsang) and use it to set inspection frequency for condition-driven failure modes (the basis of condition-based maintenance).
- Apply Life-Cycle Costing (LCC) at design: translate reliability numbers into NPV of avoided lost-production, repair, and standby-capacity cost.
- Identify the design choices (sizing margin, materials of construction, redundancy, instrumentation, maintenance access, P-F extension) that move the inherent-reliability ceiling of a process.`,
    prerequisites: `- Engineering statistics: the exponential, Weibull, and lognormal distributions; the relationship λ = 1/MTBF for the exponential case.
- CMMS / asset-hierarchy concepts: system, asset, component; functional location; criticality.
- FMEA / FMECA (failure modes, effects, and criticality analysis) at a basic level — used at design to enumerate the failure modes RAM must address.
- Reading of P&ID and process flow diagrams (PFD) so the learner can construct an RBD from a PFD.
- ISO 55000 asset-management terminology (asset, asset lifecycle, asset-management plan) — the framework within which Process Design sits.`,
    introduction: `Process Design, in the MPR pillar, is the design-stage engineering of process reliability, maintainability, and the P-F interval. The competency covers four interlocking sub-disciplines. First, **inherent reliability** — the reliability that exists in the asset before any maintenance is performed, set by component selection, materials, sizing margin, and configuration (Mobley §3, Ebeling §1.3). Inherent reliability is the ceiling: maintenance can preserve it but cannot raise it. Second, **RAM analysis at design** — the construction of a Reliability Block Diagram and the calculation of steady-state availability for the proposed process, used to verify that the design meets an availability target (e.g., ≥ 0.95) before commitment of capital. Third, **the P-F interval** — the time between the point at which a failure can first be detected (Potential failure, P) and the point at which the asset is functionally failed (F); this interval sets the maximum inspection frequency that can intercept the failure mode and is the technical basis of condition-based maintenance. Fourth, **design-for-maintainability** — geometric access, lifting provisions, isolation, standardization, and ergonomic envelopes that determine MTTR and therefore availability.

ISO 55000:2014 frames Process Design as the asset-lifecycle "acquisition" stage. The standard emphasizes that the value generated by asset management is largely determined during acquisition — typically 60–80% of life-cycle cost is committed at design. The MPR competency thus precedes the Work-Management pillar: the W-M cycle (planning, scheduling, execution, CMMS) operates a process whose reliability characteristics have already been fixed. The CMRP exam tests this competency because maintenance and reliability engineers are the customer of the design engineer: if the design fails to meet reliability or maintainability requirements, no amount of maintenance discipline will recover the gap.

The discipline is upstream of RCM (Reliability-Centered Maintenance) and of Condition-Based Maintenance. RCM analyses failure modes against their consequences and selects a default strategy (RTF, on-condition, scheduled restoration, scheduled discard, one-off redesign); but RCM operates on a designed asset. Process Design, by contrast, can eliminate a failure mode altogether — for instance by selecting a mechanical seal with a redundant set of faces, by upgrading the material of construction, or by sizing a pump with 1.2× the required head margin so that wear does not move the operating point into the cavitation regime. The mechanical analogy: RCM is preventive medicine; Process Design is genetic engineering.`,
    terminology: `- **Inherent Reliability**: the reliability of an asset in the absence of maintenance, set by its design and construction. Synonymous with "design reliability" (Ebeling §1.3).
- **Operational (Achieved) Reliability**: the reliability realized in service, reflecting maintenance effectiveness, operating envelope, and environment. Operational ≥ Inherent is impossible; Operational ≤ Inherent is the normal case where maintenance is imperfect.
- **RAM**: Reliability, Availability, Maintainability — the three-axis analysis applied to a process design (Ebeling Ch. 6, Mobley §3).
- **Reliability Block Diagram (RBD)**: a logic diagram (series, parallel, k-of-n, standby) that represents the functional dependencies of a system; each block has an associated failure rate and repair rate.
- **Availability (steady-state)**: the long-run probability that the asset is in an operating state; A = MTBF / (MTBF + MTTR).
- **P-F Interval**: the time between the point at which a failure is first detectable (Potential failure, P) and the point at which the asset's function is lost (Functional failure, F). Moubray's concept, formalized in Jardine & Tsang.
- **Bathtub Curve**: the time-varying hazard function h(t) — early "infant mortality" (decreasing), useful life (approximately constant for electronics, slowly rising for mechanical), wear-out (steeply rising). Modeled by the Weibull distribution with shape β < 1, = 1, > 1 respectively.
- **MTBF** (Mean Time Between Failures): repairable-system reliability parameter; MTBF = 1 / λ for the exponential case.
- **MTTR** (Mean Time To Repair): the mean repair time including access, isolation, fault-finding, parts retrieval, replacement, and return-to-service.
- **Life-Cycle Cost (LCC)**: the NPV of all costs of an asset from acquisition to disposal — capital + operating + maintenance + lost-production + disposal. Process Design optimizes LCC, not first cost.
- **Maintainability**: the probability that a failed asset is restored to operating condition within a specified time, given a stated maintenance resource (Ebeling §7).
- **Failure mode**: the physical manner in which an asset fails (e.g., bearing-inner-race spalling, seal-face blistering, impeller cavitation-erosion).`,
    detailed_explanation: `**Inherent vs Operational Reliability.** A pump has an inherent MTBF set by the bearing selection (L10 life), seal selection, hydraulic design (NPSH-margin, BEP location), and material of construction. The operational MTBF realized in service is lower than the inherent MTBF because lubrication may be missed, the operating point may sit off-BEP, the seal flush may be misconfigured, and the alignment may drift. The reliability engineer's first task is to quantify the gap: the ratio of operational to inherent MTBF is a measure of how much maintenance discipline is recovering the design. A plant with operational MTBF = 0.55 × inherent MTBF has substantial headroom that maintenance can recover; one at 0.95 × inherent MTBF is near the design ceiling and must redesign to improve. Closing the gap by maintenance alone has a hard ceiling at the inherent MTBF — beyond that, redesign is required (Mobley §3).

**RAM analysis at design.** A RAM study takes the PFD, builds the RBD, assigns failure-rate and repair-rate data to each block (from sources like OREDA, IEEE 493, or vendor FAT data), and computes: (a) steady-state availability, (b) reliability over a target mission (e.g., R(8,760 h) for a one-year run length), (c) system MTBF, (d) the dominant contributor — the block whose failure rate contributes most to system unavailability. The dominant contributor is the design lever: a RAM study that shows the cooling-water heat exchanger fouling is 65% of system unavailability motivates a design choice (a back-washable exchanger, a side-stream filter, or upgraded metallurgy). Ebeling's textbook develops the mathematics for series, active-parallel, k-of-n, and standby redundancy; the engineer selects the configuration that meets the availability target at minimum LCC. A common error is to design for the steady-state availability alone and ignore the mission reliability: a process with A = 0.95 has only R(8,760 h) ≈ 0.0003 for the corresponding exponential λ — i.e., the steady-state is reached via many failures per year. For a process that must run campaign length (e.g., a biotech fermenter that cannot be restarted mid-campaign), the mission reliability is the controlling metric.

**P-F interval and design.** The P-F interval is the time between the first detectable symptom (the Potential failure) and the Functional failure. For a rolling-element bearing, P is the moment a vibration spectrum first shows a defect frequency at the outer-race ball-pass frequency; F is the moment the bearing seizes or the vibration drives a trip. The P-F interval depends on the failure mode and the operating conditions, but is typically 1–6 months for medium-speed bearings (Moubray). The engineering significance is two-fold. First, the maximum inspection interval that can intercept the failure is P-F/2 — at P-F/2 the probability of detecting the symptom before F is high; at P-F, half the failures will be missed. Second, the P-F interval is itself a design variable: a bearing selected with L10 life 5× the design life has a longer P-F interval than one selected at L10 = 1.0× design life; a mechanical seal with a flush plan API 53A (dual pressurized) extends the P-F interval of seal degradation by buffering the seal environment. Process Design thus optimizes P-F/2 against inspection cost: longer P-F ⇒ cheaper inspection regime ⇒ lower maintenance cost.

**Design-for-maintainability.** The Maintainability axis of RAM is governed at design by geometric and procedural choices: (a) access — can a 2-kg bearing be removed without removing the motor? (b) lifting — are lifting eyebolts or hoist trolleys provided? (c) isolation — are block-and-bleed valves fitted so the asset can be LOTO'd without emptying the line? (d) standardization — are bearings, seals, and gaskets of a common type across the plant to reduce spares and skill-mix burden? (e) ergonomics — can the work be done without working-at-height, in confined space, or in thermal stress? Maintainability is the M in RAM; an asset with high inherent reliability but poor maintainability will still have low availability because MTTR is high. The classic trap is over-reliance on reliability margin: the designer who specifies L10 = 3× design life and ignores maintainability will see the realized availability lower than the calculated, because when failure does occur, the access penalty dominates MTTR.`,
    core_principles: `- **Reliability is designed-in, not maintained-in.** Inherent reliability is the ceiling; maintenance preserves it but does not raise it. Redesign is the only path beyond the inherent-reliability ceiling (Mobley §3).
- **Design for the dominant failure mode.** Identify (via FMEA) the failure mode with the highest criticality (RPN) and design it out — by material, sizing, redundancy, or environment — before designing the rest.
- **Optimize Life-Cycle Cost, not first cost.** LCC = capital + operating + maintenance + lost-production + disposal, all NPV-discounted. A $45 k redundancy that avoids $11 k/h of downtime pays back if the avoided downtime NPV exceeds the capital.
- **Set inspection frequency by the P-F interval.** The maximum useful inspection interval is t_PF / 2 (Moubray's rule). A longer P-F (achieved by design) buys a cheaper inspection regime.
- **RAM analysis is the language of process design trade-offs.** It converts design choices (redundancy, material, sizing, access) into a single availability number that can be compared to a target.
- **Maintainability is part of RAM.** An asset with low MTTR (achieved by access, isolation, standardization, ergonomics) has higher availability than the same asset with high MTTR — even with identical MTBF.`,
    components: `- **Reliability Block Diagram (RBD)**: the topology of the process — series, parallel, k-of-n, standby. Each block carries a failure rate λ and repair rate μ.
- **Failure-mode data sources**: OREDA (Offshore Reliability Data), IEEE 493 (industrial power systems), vendor FAT data, plant historical CMMS data.
- **RAM model / simulator**: a Monte Carlo simulator (e.g., Maros, Optagon, RAM Commander) that propagates distributions through the RBD and produces availability, reliability, and criticality outputs.
- **FMEA / FMECA matrix**: the structured list of failure modes, effects, causes, controls, and RPN — the input that tells the design which failure modes to eliminate.
- **P-F curve**: the time-vs-condition curve plotting the asset from new → potential failure (P) → functional failure (F); defines the on-condition inspection window.
- **Life-Cycle Cost (LCC) model**: the spreadsheet or model that sums capital + O&M + lost-production + disposal in NPV.
- **Maintainability checklist**: a designer's checklist (access, lifting, isolation, standardization, ergonomics, spares commonality) applied at the P&ID and 3D-model stage.
- **Design-review gate**: the formal stage-gate at which RAM, FMEA, LCC, and maintainability are signed off before procurement.`,
    process: `1. **Define the function, duty, and environment** of the process (operating window, fluid properties, ambient conditions, operating envelope).
2. **Build the PFD and the candidate RBD** (series, parallel, standby options).
3. **Run a design-stage FMEA / FMECA**: enumerate failure modes, effects, causes, severity, occurrence, detection, RPN. Identify the top-5 critical failure modes.
4. **Assign failure-rate and repair-rate data** to each RBD block (OREDA / IEEE 493 / vendor / plant history).
5. **Compute system availability, MTBF, and mission reliability** for each candidate configuration.
6. **Compute the dominant contributor** for each configuration (the block whose unavailability drives system unavailability).
7. **Design-out the dominant contributor** where possible (upgrade material, add redundancy, change the configuration, specify a longer-P-F component).
8. **Apply the maintainability checklist** (access, lifting, isolation, standardization, ergonomics).
9. **Set inspection intervals for residual on-condition failure modes** at t_PF / 2.
10. **Build the LCC** for each candidate; select the candidate with the lowest LCC meeting the availability target.
11. **Document the inherent-reliability basis** (MTBF, MTTR, A) for handover to operations and to the W-M pillar (this is the RAM "as-designed" baseline).`,
    formula_calculation: `- **Reliability function (exponential failure distribution)**:
  R(t) = e^(-λt) = e^(-t/MTBF)
  Variables: λ [failures/h], MTBF [h], t [h]. Assumption: failure rate is constant in time (useful-life region of the bathtub). Interpretation: probability of surviving to time t.
- **MTBF of a series system** (n independent components):
  MTBF_series = 1 / Σ(1/MTBF_i)   [equivalently λ_series = Σ λ_i]
  Variables: MTBF_i [h]. Assumption: exponential failure distribution per block, statistical independence. Interpretation: the system fails when any block fails.
- **Steady-state availability (single block)**:
  A = MTBF / (MTBF + MTTR)
  Variables: MTBF [h], MTTR [h]. Assumption: one operating state, one repair state, Markov steady state. Interpretation: long-run probability the asset is up.
- **Availability of n series blocks**:
  A_series = Π A_i
  Variables: A_i ∈ [0,1]. Interpretation: redundancy-free; the weakest block dominates.
- **Availability of 2 identical active-parallel blocks (1oo2)**:
  A_parallel = 1 − (1 − A)^2
  Variables: A per block. Interpretation: system fails only if both blocks fail simultaneously; common for duty/standby pairs where both run.
- **P-F interval (definition)**:
  t_PF = t_F − t_P
  Variables: t_P [h] = time of first-detectable symptom; t_F [h] = time of functional failure. Interpretation: the window within which an inspection can intercept the failure.
- **Inspection frequency rule (Moubray)**:
  t_insp ≤ t_PF / 2
  Variables: t_insp [h]. Interpretation: at t_PF / 2 the probability of intercepting the failure before functional loss is high; at t_PF half of failures are missed.
- **LCC (Life-Cycle Cost, NPV)**:
  LCC = C_cap + Σ_t [ (C_OM,t + C_M,t + C_L,t) / (1+r)^t ] + C_disposal / (1+r)^N
  Variables: C_cap [$ capital], C_OM [$ operating], C_M [$ maintenance], C_L [$ lost-production], C_disposal [$], r [discount rate], t = year, N = asset life [years]. Interpretation: choose the design that minimizes LCC at the required availability target.`,
    worked_example: `**Problem.** A chemical plant is designing a reactor-feed section with three centrifugal pumps in series — a feed pump, a booster, and a high-pressure injection pump — feeding a fixed-bed reactor. The vendor data and the plant experience give the following per-pump parameters:

  | Stage | MTBF (h) | MTTR (h) |
  |-------|----------|-----------|
  | 1 Feed pump        | 8,000  | 24 |
  | 2 Booster pump     | 12,000 | 36 |
  | 3 HP injection pump| 10,000 | 30 |

The design target is steady-state availability ≥ 0.980. Compute (a) the system MTBF, (b) the system availability, (c) the dominant contributor, and (d) the residual on-condition inspection interval for the feed-pump bearing failure mode whose P-F interval is 4 months (≈ 2,880 h).

**Step 1 — System MTBF (series).** λ_i = 1/MTBF_i; λ_series = Σ λ_i.
  λ_1 = 1/8,000  = 0.0001250 /h
  λ_2 = 1/12,000 = 0.0000833 /h
  λ_3 = 1/10,000 = 0.0001000 /h
  λ_series = 0.0003083 /h
  **MTBF_series = 1 / 0.0003083 ≈ 3,244 h.**

**Step 2 — Per-block availability.**
  A_1 = 8,000  / (8,000  + 24) = 0.99701
  A_2 = 12,000 / (12,000 + 36) = 0.99701
  A_3 = 10,000 / (10,000 + 30) = 0.99701
  (Interesting — with MTBF/MTTR ≈ same ratio, A_i is identical at the 4-decimal level.)

**Step 3 — System availability (series).**
  A_series = A_1 × A_2 × A_3 = 0.99701^3 ≈ 0.99106
  **A_series ≈ 0.9911 (99.11%).** This meets the 0.980 target with margin.

**Step 4 — Dominant contributor.** The block with the largest λ (or equivalently the smallest MTBF) is the dominant contributor — here the Feed pump (λ_1 = 0.0001250 /h, 40.5% of λ_series). Design alternatives: (a) upgrade the feed pump's bearing to a higher L10 design raising MTBF to 16,000 h; (b) add a standby feed pump (active-parallel 1oo2).
  - (a) λ_1_new = 1/16,000 = 0.0000625; λ_series_new = 0.0002458; **MTBF_new ≈ 4,069 h (+25%)**. Availability barely moves (A_i rises from 0.9970 to 0.9985) but mission reliability improves materially: R(8,760 h) rises from e^(-8,760/3,244)=0.067 to e^(-8,760/4,069)=0.117 — still low (a redesign is required for one-year campaign reliability).
  - (b) With a standby feed pump (1oo2 active-parallel, identical): A_1_parallel = 1 − (1 − 0.99701)^2 = 1 − (0.00299)^2 = 1 − 8.94×10^-6 = 0.99999106. **A_series_new = 0.99999106 × 0.99701 × 0.99701 ≈ 0.9940** — availability up to 99.40%, a 0.30-point gain. The capital cost is +$45 k for the skid; the LCC pays back if the avoided lost-production NPV over asset life exceeds $45 k — at $11 k/h of downtime and 4 events avoided per year × 8 h × 20 years at 8% discount, NPV avoided ≈ $145 k, comfortably justifying the capital.

**Step 5 — Inspection interval for the feed-pump bearing failure.** The P-F interval for the bearing failure mode (vibration symptom at the ball-pass frequency → functional seizure) is t_PF = 2,880 h. The Moubray rule sets t_insp ≤ t_PF / 2 = **1,440 h ≈ 2 months**. The plant should set a vibration route at 1,440 h max; a 30-day route (≈ 720 h) is conservative and would catch > 75% of failures before F. The design lever: a bearing upgrade raising t_PF to 5,760 h would justify a 90-day route (2,880 h inspection interval) — half the inspection labor for the same reliability.

**Result.** The as-designed series system has MTBF ≈ 3,244 h and A ≈ 99.11%, meeting the 0.980 target. The dominant contributor is the feed pump; the active-parallel standby redesign raises A to 99.40% with a +$45 k LCC-positive capital. The bearing-failure P-F interval justifies a 30-day vibration route (≤ 1,440 h, conservative). Document this RAM basis for handover to operations and to the W-M planning function.`,
    industrial_example: `**Chemical — reactor-feed pump section.** The worked example above is the canonical chemical-plant scenario: a series of centrifugal pumps feeding a high-pressure reactor, with a standby redundancy decision to be made on LCC. The chemical-specific design levers are materials of construction (Hastelloy vs 316L for chloride service), seal flush plans (API 53A dual pressurized for hazardous service), and the use of magnetic-coupled pumps for zero-leak service — all choices that move the inherent-reliability ceiling.

**Oil & Gas — subsea booster to FPSO.** A subsea gas-b injection system has 2x100% subsea pumps (active-parallel) feeding a single 12-mile pipeline to an FPSO. Each pump MTBF = 6,000 h, MTTR = 600 h (intervention is a rig-mobilization — 25 days). Single-pump A = 6,000/(6,000+600) = 0.909. Active-parallel A = 1 − (1−0.909)^2 = 0.9917. Pipeline is single-line (no redundancy) with A = 0.999. **System A = 0.9917 × 0.999 ≈ 0.9907** (target ≥ 0.97). The MTTR of 600 h dominates the unavailability; design-for-maintainability (intervention-friendly pulling tabs, ROV-friendly connections, on-deck spares) is the lever that moves the LCC.

**Power — combined-cycle HRSG feedwater.** A 3×50% feedwater-pump configuration (any 2 of 3 in service meets full load). Each pump MTBF = 18,000 h, MTTR = 48 h. The 2-of-3 (k-of-n) model yields A_system ≈ 0.9998 (Ebeling §6.6). The 3×50% design (vs 2×100% + standby) trades higher capital for materially higher availability and zero transition risk on loss of one pump — the standard choice for utility-scale power where lost-production is contractually penalized.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** A 1,200-MW combined-cycle power plant is being designed for a 25-year asset life. The availability target is ≥ 95% (contractual capacity factor). A design-stage RAM study is commissioned before Final Investment Decision (FID). The RBD has 4 gas turbines (each 2×100% synch condenser + 1×100% lube-oil skid), 4 HRSGs with 3×33% feedwater pumps each, and 1 steam turbine with 2×100% condensate-extraction pumps.

The first RAM iteration produces A = 0.928 — below the 0.95 target. The dominant contributors are (a) the gas-turbine lube-oil skid (single point of failure per GT; MTBF = 12,000 h, MTTR = 36 h), and (b) the steam-turbine condensate pump (no redundancy). The design team runs two alternatives: (A1) upgrade the lube-oil skid to 2×100% active-parallel (cost +$1.2 M × 4 = $4.8 M); (A2) add a standby condensate pump (+$2.8 M).

The LCC model at 8% discount over 25 years: lost-production cost = $4,200/MWh (contractual liquidated damages). (A1) reduces GT unavailability by 65% — raises plant A by 2.6 points; (A2) raises plant A by 1.1 points. Combined (A1+A2) raises plant A to 0.964 (above the 0.95 target). NPV of avoided lost-production over 25 years = $287 M; capital = $7.6 M. The LCC decision: proceed with (A1+A2).

Additionally, the design-stage FMEA flags the condenser-tube fouling failure mode with P-F interval = 6 months; the design specifies a back-washable tube bundle and an inspection interval of 3 months (t_PF/2). The plant's W-M pillar receives an inherent-reliability baseline (A_inherent = 0.964, MTBF_system = 5,200 h, MTTR_system = 194 h) for handover — the ceiling against which operational reliability will be measured.`,
    visual_explanation: `- **RBD diagram (series)**: three rectangles in a row (Feed | Booster | HP), connected by lines, the failure of any one breaks the chain.
- **RBD diagram (1oo2 parallel)**: two rectangles side by side, joined at a common input and common output — system survives if at least one survives.
- **Bathtub curve**: x-axis = time, y-axis = hazard h(t); three regions: infant mortality (β < 1, decreasing), useful life (β = 1, flat), wear-out (β > 1, increasing).
- **P-F curve**: x-axis = time, y-axis = condition (e.g., vibration velocity); the curve rises slowly from "new", steepens at the "P" point (first-detectable symptom), and reaches the failure threshold at "F". The vertical P-F bar shows the inspection window.
- **LCC waterfall**: stacked bars of capital + O&M + maintenance + lost-production + disposal, NPV-discounted, for each design alternative; the lowest-bar alternative is selected.`,
    simulation_opportunity: `A RAM simulator (Monte Carlo over the RBD): the learner is given a PFD and a target availability; the simulator exposes per-block MTBF, MTTR, redundancy options, and a capital-cost slider. The learner iterates the configuration until the target is met, then runs a 25-year Monte Carlo to read the realized availability distribution. A second tier adds LCC: the learner picks the configuration that meets A_target at minimum LCC. A third tier adds mission reliability — a "1-year campaign" target R(8,760 h) that forces redesign of the dominant contributor.`,
    common_mistakes: `- **Confusing inherent vs operational reliability**: the engineer reports operational MTBF as the asset's "MTBF" without normalizing to inherent — the gap (operational / inherent) is invisible, so the headroom for maintenance improvement is unknown.
- **Ignoring the dominant contributor**: the team adds redundancy everywhere except the dominant block, then is puzzled that system availability barely moves.
- **Designing for steady-state availability, ignoring mission reliability**: a campaign process (biotech, batch chemical) has R(t_campaign) as the controlling metric — a high-A design can still have near-zero one-year survival.
- **Setting inspection intervals by tradition, not by P-F**: the plant sets "vibration route every 90 days" because that is the historic practice — for a bearing with P-F = 60 days, this misses half the failures before functional loss.
- **Treating maintainability as an afterthought**: the designer optimizes for first cost and reliability, then realizes at commissioning that the bearing cannot be replaced without removing the motor — MTTR explodes and availability collapses.
- **Using first cost instead of LCC**: the procurement decision goes to the low-bid pump; the LCC of lost-production over 25 years is 100× the capital difference.
- **Assuming exponential failure distribution everywhere**: the bathtub's wear-out region is not exponential (β > 1); using λ = 1/MTBF for a wear-out failure mode understates early-life reliability and overstates late-life reliability.`,
    limitations: `- Inherent reliability is bounded by physics: there is no design that makes a centrifugal pump bearing last forever; the lever is a longer L10 life, not infinite life.
- RAM analysis is only as good as the failure-rate data: OREDA is offshore-skewed; vendor FAT data is optimistic; plant history may be too short to stabilize.
- The P-F interval is failure-mode-specific and operating-condition-dependent; a single number for "the pump's P-F" is an oversimplification.
- Maintainability checklists are qualitative; the conversion of access geometry to MTTR reduction is engineering judgment, not formula.
- LCC depends on the discount rate and the lost-production unit cost — both contested inputs; the LCC decision can flip with r = 8% vs 12%.
- Design-stage FMEA cannot enumerate every failure mode; surprise failure modes discovered in service are the residual risk of any RAM model.`,
    comparison: `- **Process Design vs RCM**: Process Design sets the inherent-reliability ceiling at design; RCM selects the operating-maintenance strategy for the as-designed asset. RCM operates on the as-built; Process Design operates on the as-drawn.
- **Process Design vs Condition-Based Maintenance (CBM)**: Process Design extends the P-F interval (longer window for CBM to operate); CBM exploits the P-F interval as designed. A longer P-F lowers the cost of CBM.
- **RAM vs FMEA**: FMEA asks "what can fail and how badly?"; RAM asks "given the failure rates, what is the system availability?" Both are required; FMEA provides the failure modes to design-out, RAM quantifies the redesign payoff.
- **Inherent reliability vs Achieved reliability**: inherent is the ceiling (set at design); achieved is the realized value in service. The ratio achieved/inherent is the maintenance-effectiveness metric.`,
    practical_application: `- **At the design stage**: build the PFD, FMEA, RBD; run the RAM simulator; pick the configuration that meets A_target at minimum LCC; document the inherent-reliability baseline for handover.
- **At the procurement stage**: translate the RAM basis into a specification with MTBF and MTTR acceptance values, L10 life for bearings, seal-life target, and a FAT reliability demonstration test.
- **At handover to operations**: pass the RAM basis (A_inherent, MTBF_system, MTTR_system, dominant contributors, P-F intervals per failure mode) as a formal deliverable; the W-M pillar's KPIs (MTBF_achieved, MTTR_achieved) are measured against this baseline.
- **In service**: when operational reliability approaches inherent reliability (gap → 0), the plant has exhausted the maintenance lever; redesign is the only path to higher reliability. The reliability engineer's annual report must show the gap-trend.`,
    decision_scenario: `You are the reliability engineer at a chemical plant. The plant is designing a new reactor-feed section (3 series pumps, target A ≥ 0.98). The RAM study returns A = 0.9911 (above target). The lead engineer proposes two design alternatives: (A) upgrade the feed-pump bearing to raise MTBF from 8,000 to 16,000 h (capital +$15 k); (B) add a standby feed pump (1oo2 active-parallel, capital +$45 k). Lost-production is $11 k/h; expected avoided failures = 4/year × 8 h/event; asset life 20 years; discount rate 8%.

Compute the LCC of each:
  - (A) Raises MTBF_series from 3,244 to 4,069 h (+25%) but A barely moves (0.9911 → 0.9916). NPV of avoided lost-production = 25% × 4 events × 8 h × $11 k × 20-yr annuity factor @8% = $11,600/yr × 9.818 = $114 k. **NPV avoided = $114 k vs $15 k capital — payback < 1 year.**
  - (B) Raises A to 0.9940 (+0.29 pts). Avoided downtime ≈ 0.0029 × 8,760 h × $11 k = $279 k/yr × 9.818 = **$2,740 k NPV vs $45 k capital — payback < 1 quarter.**

Decision: do BOTH — they are not mutually exclusive and both have payback under a year. (B) is the higher-impact lever; (A) extends the P-F interval (longer bearing L10) and reduces CBM inspection cost. Sequence: (B) first (availability), (A) second (P-F / CBM cost). If forced to choose one, choose (B) — availability is the controlling metric and the LCC differential is decisive.`,
    practice_questions: `- Define inherent reliability and distinguish it from operational reliability.
- Compute the MTBF of a 3-stage series process with per-stage MTBFs 8,000 / 12,000 / 10,000 h. *(Answer: ≈ 3,244 h.)*
- A failure mode has a P-F interval of 4 months. What is the maximum useful inspection interval? *(Answer: 2 months.)*
- A 1oo2 active-parallel redundancy of two identical blocks each with A = 0.95 yields what system availability? *(Answer: 1 − 0.05² = 0.9975.)*
- State why designing for steady-state availability is insufficient for a campaign process.
- List the four components of the LCC formula and explain why first cost is the smallest of them.`,
    certification_questions: `The CMRP exam tests Process Design as the first MPR competency. SMRP-aligned sample prompts:
(a) Define inherent vs operational reliability and identify which is the ceiling.
(b) Compute the MTBF of an n-block series system given per-block MTBFs.
(c) Apply the P-F/2 rule to set inspection interval for an on-condition failure mode.
(d) Identify the dominant contributor of an RBD from per-block unavailability.
The questions in this lesson's question bank are aligned to these Process Design competencies.`,
    summary: `Process Design is the design-stage engineering of inherent reliability, RAM, the P-F interval, and maintainability. It sets the ceiling that operations and maintenance can never exceed. The discipline's tools — RBD, FMEA, RAM simulator, P-F/2 rule, LCC — convert design choices (redundancy, material, sizing, access) into a single availability number that can be compared to a target. The CMRP exam tests the engineer's fluency in moving from a process-flow diagram to a quantified RAM, identifying the dominant contributor, and selecting the design alternative that minimizes LCC. The output of Process Design — the inherent-reliability baseline — is the handover to the Work-Management pillar: every operational KPI is measured against this design-stage baseline.`,
    key_takeaways: `- Reliability is designed-in: inherent reliability is the ceiling, maintenance preserves it, redesign is the only path beyond it.
- MTBF of a series system = 1 / Σ(1/MTBF_i); the dominant contributor is the block with the largest λ (smallest MTBF).
- Availability of 1oo2 active-parallel = 1 − (1−A)²; redundancy pays back when NPV of avoided lost-production exceeds the capital.
- Inspection interval ≤ P-F/2 (Moubray rule); a longer P-F (achieved by design) buys a cheaper inspection regime.
- LCC = capital + O&M + maintenance + lost-production + disposal, NPV-discounted; first cost is typically the smallest term.
- Document the inherent-reliability baseline (A_inherent, MTBF_system, MTTR_system, P-F per failure mode) for handover to operations.`,
    references: `- SMRP. *CMRP Body of Knowledge — Manufacturing Process Reliability pillar: Process Design.*
- SMRP. *CMRP Exam Outline.*
- ISO 55000:2014, *Asset management — Overview, principles and terminology* — asset-lifecycle acquisition stage.
- Mobley, R. K. (2008). *Maintenance Engineering Handbook* (7th ed.). McGraw-Hill. §3 (Reliability Engineering), §6 (Predictive Maintenance).
- Campbell, J. D. & Jardine, A. K. S. (2001). *Maintenance Strategy*. Productivity Press. Ch. 2-3 (Proactive Maintenance lifecycle).
- Ebeling, C. E. (2010). *An Introduction to Reliability and Maintainability Engineering* (2nd ed.). Waveland. Ch. 1 (inherent vs achieved reliability), Ch. 6 (system reliability), Ch. 7 (maintainability).
- Jardine, A. K. S. & Tsang, A. H. C. (2017). *Maintenance, Replacement, and Reliability: Theory and Applications* (2nd ed.). CRC. Ch. 2 (P-F interval & on-condition maintenance).`,
  },
  knowledgeObject: {
    title: "Process Design — inherent reliability, RAM, and P-F interval",
    domain: "Manufacturing Process Reliability",
    competency: "Process Design",
    topic: "Design-for-reliability",
    concept: "Inherent reliability & P-F interval",
    body: {
      definitions: [
        "Inherent reliability: the reliability of an asset in the absence of maintenance, set by design and construction (Ebeling §1.3).",
        "Operational (achieved) reliability: the reliability realized in service, reflecting maintenance effectiveness, operating envelope, and environment.",
        "RAM: Reliability / Availability / Maintainability — the three-axis analysis applied at design.",
        "Reliability Block Diagram (RBD): the logic topology (series, parallel, k-of-n, standby) of a process.",
        "Availability (steady-state): A = MTBF / (MTBF + MTTR) — long-run probability the asset is up.",
        "P-F interval: time between first-detectable symptom (P) and functional failure (F); sets the on-condition inspection window (Moubray / Jardine & Tsang).",
        "Bathtub curve: time-varying hazard — infant mortality (β < 1), useful life (β = 1), wear-out (β > 1).",
        "Life-Cycle Cost (LCC): NPV of capital + O&M + maintenance + lost-production + disposal.",
        "Maintainability: probability of restoration to operating condition within a specified time given stated resources (Ebeling §7).",
      ],
      principles: [
        "Reliability is designed-in, not maintained-in: inherent reliability is the ceiling (Mobley §3).",
        "Design for the dominant failure mode (highest RPN) first.",
        "Optimize LCC, not first cost — 60–80% of LCC is committed at the acquisition stage (ISO 55000).",
        "Inspection frequency ≤ P-F/2 (Moubray's rule); longer P-F ⇒ cheaper inspection regime.",
        "RAM is the language of process-design trade-offs (series/parallel/standby configurations).",
        "Maintainability is part of RAM: MTTR is governed by access, lifting, isolation, standardization, ergonomics.",
      ],
      components: [
        "Reliability Block Diagram (RBD) with λ and μ per block.",
        "Failure-rate data: OREDA, IEEE 493, vendor FAT data, plant CMMS history.",
        "RAM simulator (Monte Carlo over the RBD).",
        "FMEA / FMECA matrix — input that tells design which modes to eliminate.",
        "P-F curve per failure mode.",
        "LCC spreadsheet / model.",
        "Maintainability checklist (access, lifting, isolation, standardization, ergonomics, spares).",
        "Design-review gate (sign-off of RAM, FMEA, LCC, maintainability before procurement).",
      ],
      mechanism: [
        "PFD → FMEA → RBD with λ,μ per block → RAM simulator → A_series/parallel → dominant contributor → design-out → LCC → inherent-reliability baseline → handover to operations.",
      ],
      process: [
        "1. Define function, duty, environment of the process.",
        "2. Build the PFD and candidate RBD configurations.",
        "3. Run a design-stage FMEA / FMECA; identify top critical failure modes.",
        "4. Assign λ and μ to each block (OREDA / IEEE / vendor / history).",
        "5. Compute A_series, A_parallel, MTBF_series, mission R(t).",
        "6. Compute the dominant contributor per configuration.",
        "7. Design-out the dominant contributor where possible (material, sizing, redundancy, configuration).",
        "8. Apply the maintainability checklist at the P&ID and 3D-model stage.",
        "9. Set inspection intervals for residual on-condition modes at t_PF/2.",
        "10. Build the LCC for each candidate; select minimum-LCC meeting A_target.",
        "11. Document the inherent-reliability basis for handover to operations.",
      ],
      formulas: [
        "R(t) = e^(-λt) = e^(-t/MTBF) (exponential useful-life region).",
        "MTBF_series = 1 / Σ(1/MTBF_i); λ_series = Σ λ_i.",
        "A = MTBF / (MTBF + MTTR) (single block, Markov steady-state).",
        "A_series = Π A_i.",
        "A_parallel (1oo2 identical) = 1 − (1 − A)^2.",
        "t_PF = t_F − t_P (P-F interval definition).",
        "t_insp ≤ t_PF / 2 (Moubray rule).",
        "LCC = C_cap + Σ_t (C_OM + C_M + C_L)/(1+r)^t + C_disposal/(1+r)^N.",
      ],
      metrics: [
        "Inherent MTBF (design-stage target).",
        "Operational MTBF (realized in service).",
        "Gap ratio operational/inherent (≥ 0.8 = mature maintenance program).",
        "System availability A (steady-state).",
        "Mission reliability R(t_campaign).",
        "Dominant contributor's share of λ_series (%).",
        "P-F interval per critical failure mode.",
        "LCC NPV per design alternative.",
      ],
      examples: [
        "3-stage series chemical-feed pumps (MTBF 8,000 / 12,000 / 10,000 h): MTBF_series ≈ 3,244 h; A ≈ 0.9911.",
        "Subsea 2x100% gas-injection pumps (MTBF 6,000, MTTR 600 h): single A = 0.909; parallel A = 0.9917.",
        "Power plant 3×50% feedwater pumps (2-of-3 service): k-of-n A ≈ 0.9998.",
      ],
      industrial_examples: [
        "Chemical — reactor-feed pump section: materials (Hastelloy vs 316L), seal flush plans (API 53A), magnetic-coupled pumps for zero-leak service.",
        "Oil & Gas — subsea booster to FPSO: 2x100% pumps, single-line pipeline, MTTR = 600 h rig-mobilization; design-for-maintainability is the lever.",
        "Power — 3×50% combined-cycle HRSG feedwater: trades higher capital for materially higher availability and zero transition risk.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. 1,200-MW combined-cycle, 25-year asset life, A_target ≥ 0.95. First RAM iteration A = 0.928 (below target). Dominant contributors: GT lube-oil skid (single-point), steam-turbine condensate pump (no redundancy). Redesign (A1: 2×100% lube-oil skids; A2: standby condensate pump) raises A to 0.964 at +$7.6 M capital; NPV avoided lost-production = $287 M over 25 years; payback < 1 year.",
      ],
      common_errors: [
        "Confusing inherent vs operational reliability (gap invisible; headroom unknown).",
        "Ignoring the dominant contributor (redundancy everywhere except the dominant block — A barely moves).",
        "Designing for A_steady-state alone, ignoring R(t_campaign) for batch/campaign processes.",
        "Setting inspection intervals by tradition, not by P-F/2 — misses failures before functional loss.",
        "Treating maintainability as an afterthought (MTTR explodes; A collapses).",
        "Using first cost instead of LCC (lost-production NPV is 100× the capital delta).",
        "Assuming exponential failure everywhere (wear-out is β > 1; λ = 1/MTBF understates early-life, overstates late-life).",
      ],
      limitations: [
        "Inherent reliability is bounded by physics; the lever is longer L10, not infinite life.",
        "RAM is only as good as the failure-rate data (OREDA offshore-skewed; vendor FAT optimistic; plant history short).",
        "P-F interval is failure-mode-specific and operating-condition-dependent — single-number per asset is an oversimplification.",
        "Maintainability checklists are qualitative; the geometry-to-MTTR conversion is engineering judgment.",
        "LCC depends on r and C_L unit cost — both contested inputs.",
        "Design-stage FMEA cannot enumerate every failure mode; surprise modes are residual risk.",
      ],
      best_practices: [
        "Quantify the gap: report operational MTBF normalized to inherent MTBF.",
        "Compute the dominant contributor and design it out first.",
        "Run Monte Carlo over the RBD to read the realized-availability distribution, not just the point estimate.",
        "Apply the maintainability checklist at the P&ID and 3D-model stage, not at commissioning.",
        "Set on-condition inspection intervals at t_PF/2 and revisit annually with field data.",
        "Optimize LCC, not first cost; the procurement spec carries MTBF/MTTR acceptance values.",
        "Hand over the inherent-reliability baseline as a formal deliverable to operations and the W-M pillar.",
      ],
      related_concepts: [
        "Installation & Commissioning (next MPR competency — verifies the design).",
        "Reliability & Maintainability (the quantitative core of RAM).",
        "Maintenance Technologies (operates the P-F interval in service).",
        "Equipment Reliability (ER pillar — failure analysis at equipment level).",
        "Work Management (WM pillar — measures operational reliability vs the inherent baseline).",
        "ISO 55000 acquisition stage (asset lifecycle).",
      ],
      prerequisites: [
        "Engineering statistics: exponential, Weibull, lognormal distributions.",
        "FMEA / FMECA at a basic level.",
        "Reading P&ID and process flow diagrams.",
        "ISO 55000 asset-management terminology (asset, lifecycle, asset-management plan).",
      ],
      references: [
        "SMRP CMRP BOK — MPR pillar: Process Design.",
        "SMRP CMRP Exam Outline.",
        "ISO 55000:2014 — asset-lifecycle acquisition stage.",
        "Mobley (2008), Maintenance Engineering Handbook, §3, §6.",
        "Campbell & Jardine (2001), Maintenance Strategy, Ch. 2-3.",
        "Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 1, 6, 7.",
        "Jardine & Tsang (2017), Maintenance, Replacement, and Reliability, Ch. 2 (P-F interval).",
      ],
    },
  },
  questions: [
    {
      competencyName: "Process Design",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which statement correctly distinguishes inherent reliability from operational reliability?",
      whyCorrect:
        "Inherent reliability is the ceiling set by design and construction; operational reliability is the realized value in service, which is ≤ inherent because maintenance is imperfect (Ebeling §1.3, Mobley §3).",
      whyOthersWrong: [
        "Operational reliability is always greater than inherent reliability — impossible, since maintenance cannot raise the design ceiling.",
        "Inherent reliability is measured in service while operational is computed at design — reversed; inherent is the design value, operational is measured.",
        "The two terms are synonymous and interchangeable — they are distinct; the gap between them quantifies maintenance effectiveness.",
      ],
      explanation:
        "Inherent reliability = design ceiling; operational reliability = achieved in service. Operational ≤ inherent; the ratio operational/inherent measures how much maintenance is recovering the design.",
      options: [
        {
          text: "Inherent reliability is the ceiling set at design; operational reliability is the realized value in service and is ≤ inherent.",
          isCorrect: true,
        },
        { text: "Operational reliability is always greater than inherent reliability", isCorrect: false },
        { text: "Inherent reliability is measured in service; operational is computed at design", isCorrect: false },
        { text: "The two terms are synonymous and interchangeable", isCorrect: false },
      ],
    },
    {
      competencyName: "Process Design",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Chemical",
      stem: "A 3-stage series process has per-stage MTBFs of 8,000 / 12,000 / 10,000 h. What is the system MTBF?",
      whyCorrect:
        "For a series system, λ_series = Σ λ_i = 1/8000 + 1/12000 + 1/10000 = 0.0001250 + 0.0000833 + 0.0001000 = 0.0003083 /h. MTBF_series = 1/λ_series ≈ 3,244 h.",
      whyOthersWrong: [
        "10,000 h — this is the average of the three, not the harmonic-style sum; series reliability is not arithmetic-mean.",
        "30,000 h — this is the sum of the three MTBFs, which over-estimates because series systems are weaker, not stronger, than their weakest link.",
        "8,000 h — this is the smallest (weakest link); for exponential failure, the system MTBF is below the smallest MTBF, not equal to it.",
      ],
      explanation:
        "Series reliability: λ_series = Σ λ_i, so MTBF_series = 1/Σ(1/MTBF_i). The system is weaker than its weakest link because failures from all blocks add up.",
      options: [
        { text: "≈ 3,244 h", isCorrect: true },
        { text: "10,000 h", isCorrect: false },
        { text: "30,000 h", isCorrect: false },
        { text: "8,000 h", isCorrect: false },
      ],
    },
    {
      competencyName: "Process Design",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Manufacturing",
      stem: "A bearing-failure mode has a P-F interval of 4 months. Per the Moubray rule, what is the maximum useful inspection interval that will reliably intercept the failure before functional loss?",
      whyCorrect:
        "Moubray's rule sets t_insp ≤ t_PF/2 = 4/2 = 2 months. At t_PF/2 the probability of detecting the symptom before functional failure is high; at t_PF (4 months) half the failures are missed.",
      whyOthersWrong: [
        "4 months — at t_PF, half of failures are missed before functional loss; this is the upper bound, not a reliable inspection interval.",
        "6 months — exceeds t_PF; failures will reach functional loss before the next inspection.",
        "1 month — conservative and safe, but not the maximum useful; the maximum useful is t_PF/2.",
      ],
      explanation:
        "t_PF/2 is the maximum inspection interval that keeps probability of intercept high; longer intervals progressively miss failures before F.",
      options: [
        { text: "2 months (t_PF / 2)", isCorrect: true },
        { text: "4 months (= t_PF)", isCorrect: false },
        { text: "6 months (> t_PF)", isCorrect: false },
        { text: "1 month (t_PF / 4)", isCorrect: false },
      ],
    },
    {
      competencyName: "Process Design",
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Oil & Gas",
      stem: "For a campaign process that must survive a one-year run without restart (e.g., a biotech fermenter), designing to a steady-state availability target of A = 0.95 is sufficient to assure one-year mission reliability.",
      whyCorrect:
        "FALSE. A high steady-state availability (A = 0.95) does not imply one-year mission reliability. With exponential failures, R(8,760 h) for the corresponding λ = 1 − A ≈ 0.05 implies R(8,760 h) = e^(-8,760 × (1-A)/A) ≈ e^(-461) ≈ 0. Even simpler: A = 0.95 with MTBF ≈ 1 year implies R(8,760) ≈ e^(-1) ≈ 0.37 — far below mission-assurance. Campaign processes must be designed against R(t_campaign), not A.",
      whyOthersWrong: [
        "TRUE — this is the trap; A = 0.95 looks like high reliability but is a steady-state average achieved via many failures per year, not a one-year survival guarantee.",
      ],
      explanation:
        "Steady-state availability and mission reliability are different metrics. A high A can co-exist with very low R(t_campaign) when failures are frequent and short. Campaign processes must design against mission reliability.",
      options: [
        { text: "False — A = 0.95 does not imply R(8,760 h) ≥ 0.95; the two metrics are independent", isCorrect: true },
        { text: "True — A = 0.95 implies R(8,760 h) ≥ 0.95", isCorrect: false },
      ],
    },
    {
      competencyName: "Process Design",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "DecisionMaking",
      skillType: "Conceptual",
      scenario: "Power",
      stem: "A 1,200-MW combined-cycle plant RAM study returns A = 0.928 (target ≥ 0.95). The dominant contributor is the gas-turbine lube-oil skid (single point of failure, MTBF = 12,000 h, MTTR = 36 h). Which redesign alternative most directly addresses the dominant contributor at minimum capital?",
      whyCorrect:
        "Upgrading the lube-oil skid to 2×100% active-parallel removes the single point of failure at the dominant contributor — the lever with the highest payoff. Active-parallel A = 1 − (1−0.997)^2 ≈ 0.99999 vs 0.997 for single — raises plant A by ~2.6 points.",
      whyOthersWrong: [
        "Adding a standby to a non-dominant block (e.g., the condensate pump whose contribution is small) — moves A marginally because the dominant block is unchanged.",
        "Upgrading the materials of construction on a non-dominant component — long L10 life helps, but does not address the dominant contributor that drives system unavailability.",
        "Increasing the inspection frequency of the lube-oil skid from quarterly to monthly — useful but does not change the inherent reliability of the single skid; the failure still occurs.",
      ],
      explanation:
        "Per the dominant-contributor principle, the highest-payoff redesign is the one that removes the single point of failure at the dominant block. Non-dominant improvements move A marginally.",
      options: [
        { text: "Upgrade the lube-oil skid to 2×100% active-parallel, removing the single point of failure", isCorrect: true },
        { text: "Add a standby to a non-dominant block (e.g., condensate pump)", isCorrect: false },
        { text: "Upgrade materials of construction on a non-dominant component", isCorrect: false },
        { text: "Increase the inspection frequency of the lube-oil skid from quarterly to monthly", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Installation & Commissioning
// ---------------------------------------------------------------------------

const LESSON_INSTALLATION_COMMISSIONING: RefLesson = {
  competencyName: "Installation & Commissioning",
  slug: "mpr-installation-commissioning",
  title: "Asset Installation, Acceptance Testing & Commissioning for Reliability",
  titleAr: "تركيب الأصول واختبارات القبول والتشغيل التجريبي للموثوقية",
  order: 2,
  durationMin: 30,
  references: MPR_REFERENCE_TITLES,
  conceptIntroduction: `Installation & Commissioning (I&C) is the second MPR competency — the lifecycle stage at which the as-designed inherent reliability of a process is verified against the as-built reality, and at which residual defects that would otherwise limit operational reliability are removed before the asset enters service. The competency covers the activities from mechanical completion (the asset is physically installed per the drawings) through acceptance testing (Factory Acceptance Test, FAT, and Site Acceptance Test, SAT) through commissioning (the systematic verification that each subsystem performs to spec under process conditions) and into startup reliability — the period immediately after handover during which early-life failure modes (infant mortality) are revealed and removed. The CMRP Body of Knowledge treats I&C as a reliability competency because commissioning is the last opportunity to detect design and installation defects before they become operating failures. ISO 55000:2014 frames this as the transition between the acquisition and use stages of the asset lifecycle — the gate through which inherent reliability passes into operational reliability.`,
  example: `Commission a new 250-t/h centrifugal compressor in an Oil & Gas plant. Mechanical completion: skid leveled to ≤ 0.1 mm/m, anchor bolts torqued to 1,200 N·m, lube-oil flushed to NAS 8 cleanliness, driver alignment to ≤ 0.05 mm TIR. FAT (at vendor shop): 4-hour no-load run at 100% speed, vibration ≤ 1.8 mm/s RMS (API 611 limit), bearing temperature ≤ 80 °C. SAT (at site): full-load run on process gas for 24 h, vibration ≤ 3.5 mm/s RMS (ISO 10816 zone B), surge-control system demonstrated at 3 surge points, seal-gas system leak-tight. Startup reliability: 168-h reliability demonstration run after handover; the asset must accrue ≥ 168 h without unplanned trip to be accepted. The total commissioning program is 6 weeks; the SAT alone is 5 days plus 7 days of run-in.`,
  keyFormulas: `Availability (post-commissioning): A = MTBF / (MTBF + MTTR)
MTBF lower confidence bound (time-truncated test, r failures, time T): MTBF_L = 2T / χ²(α, 2r+2)
Reliability demonstration: r ≤ r_accept at T_acc ⇒ accept with confidence 1−α
Reliability growth (Duane): MTBF(t) = a·t^b, where a = initial MTBF, b = growth rate (typical 0.1–0.3)
Startup reliability index: I = (unplanned trips in first 168 h) / (intended run-hours) × 100 (target = 0)
Alignment tolerance (flexible-coupled): ≤ 0.05 mm TIR radial + axial
Vibration acceptance (API 611 / ISO 10816): zone A (new), B (long-term OK), C (improve), D (shut down)`,
  exercise: `You are the commissioning engineer at a Power plant. A new 25-MW steam turbine has passed its FAT but the SAT is approaching. (a) Specify the acceptance criteria for vibration, bearing temperature, overspeed trip, and 24-h run. (b) Compute the lower 60% confidence bound on MTBF if the first 500 h of operation show zero failures. (c) Specify the 168-h reliability demonstration run criterion for handover to operations.`,
  sections: {
    learning_objectives: `- Distinguish mechanical completion, FAT, SAT, commissioning, and startup reliability as discrete reliability gates.
- Specify acceptance criteria (vibration per ISO 10816 / API standards, alignment TIR, hydrotest, run-in duration, performance) for a commissioning program.
- Apply a reliability-acceptance-test (RAT) computation to derive the lower confidence bound on MTBF for a time-truncated test (Ebeling §13).
- Apply reliability-growth modeling (Duane / AMASS / Crow-AMSAA) to interpret early-life failure rate during the startup window.
- Specify the role of the commissioning database (test records, punch-list, snag-list, baseline vibration spectrum, baseline performance curve).
- Identify the handover gate criteria that close the I&C competency and transfer the asset to operations.`,
    prerequisites: `- Process Design (the previous MPR competency) — the inherent-reliability baseline (MTBF, MTTR, A_inherent, P-F intervals per failure mode) handed over from design.
- Reading of mechanical drawings (P&ID, isometric, general-arrangement, OEM installation drawings).
- Vibration analysis basics (ISO 10816 zones; spectrum vs. overall reading; accelerometer mounting).
- Hydrotest code (ASME B31.3 for process piping; ASME Section VIII for pressure vessels).
- Statistics for reliability testing (chi-square distribution, time-truncated vs failure-truncated tests).`,
    introduction: `Installation & Commissioning sits between Process Design and the operational reliability pillars (Equipment Reliability, Work Management). The competency is the gate through which the as-designed asset is verified as the as-built asset: the test program confirms that the inherent reliability predicted at design has been realized in the field, and the punch-list / snag-list captures residual defects that would otherwise emerge as infant-mortality failures in the first weeks of operation.

The discipline is structured into five discrete stages. **(1) Mechanical completion** — the asset is physically installed per the drawings: foundations, anchor bolts, leveling, alignment, piping, electrical, instrumentation. Mechanical completion is verified against an inspector's checklist; no process fluids are introduced. **(2) Factory Acceptance Test (FAT)** — at the vendor's shop, before shipment, the asset is run no-load (or load where possible) against a documented test procedure; the buyer's witness signs the FAT certificate. The FAT is the design-stage reliability demonstration: vibration, bearing temperature, performance, and control-system response are measured against the procurement spec. **(3) Site Acceptance Test (SAT)** — at the plant, after mechanical completion, the asset is run on process fluids under process conditions for a defined duration (typically 24–72 h). The SAT verifies that the asset survives transport and installation without distortion, that the field installation matches the design, and that the process environment (foundations, piping loads, electrical supply) is benign. **(4) Commissioning** — the systematic verification of every subsystem against its functional spec: instrumentation loops, interlocks, alarms, safety systems, sequential logic, permissives, and overrides. Commissioning is the integration test: each subsystem passes SAT, then they are combined to demonstrate process-level function. **(5) Startup reliability** — the period immediately after handover (typically 168 h to 30 days) during which early-life failures (infant mortality, installation defects, integration surprises) are revealed; the asset accrues run-hours against a reliability-demonstration criterion before operations "owns" it.

ISO 55000:2014 frames I&C as the transition gate between acquisition and use. The asset-management plan (AMP) should specify the handover deliverables: the as-built drawing set, the baseline vibration spectrum, the baseline performance curve, the punch-list closeout record, the spare-parts list, the operating procedures, and the training record. These are the operational baseline against which the W-M pillar will measure drift. The CMRP exam tests this competency because a poorly-commissioned asset will never meet its operational reliability target, no matter how good the design or the maintenance program — infant-mortality failures in the first 30 days will dominate the MTBF statistic and corrupt the reliability baseline.`,
    terminology: `- **Mechanical Completion (MC)**: the asset is physically installed per drawings — foundations, anchor bolts, leveling, alignment, piping, electrical, instrumentation — verified against an inspector's checklist; no process fluids.
- **FAT (Factory Acceptance Test)**: test at the vendor shop before shipment, run no-load or load, witnessed and signed by the buyer.
- **SAT (Site Acceptance Test)**: test at site after mechanical completion, on process fluids under process conditions, typically 24–72 h.
- **Commissioning**: systematic verification of every subsystem (instrumentation, interlocks, alarms, safety systems, sequential logic) against its functional spec; integration test.
- **Pre-commissioning / Cold commissioning**: activities between MC and hot commissioning — loop checks, instrument calibration, valve stroking, motor bump, relay testing.
- **Hot commissioning**: process-fluid introduction and run-in.
- **Startup reliability**: the first 168 h to 30 days after handover — the early-life window where infant mortality is revealed and removed.
- **Punch-list / Snag-list**: the open items list discovered during commissioning — defect, owner, due date, status.
- **Reliability Acceptance Test (RAT)**: a statistical test that demonstrates MTBF ≥ MTBF_target at confidence 1−α (Ebeling §13).
- **Reliability growth (Duane / AMASS / Crow-AMSAA)**: the model of how MTBF improves during a development / commissioning program as fixes are incorporated.
- **Baseline (vibration / performance)**: the as-commissioned reference spectrum or performance curve; subsequent operational drift is measured against this baseline.
- **Handover**: the formal transfer of the asset from the project / commissioning team to operations, gated by handover deliverables.`,
    detailed_explanation: `**Mechanical completion.** The mechanical-completion inspector verifies that the asset is installed per drawing and per code. The checklist items include: foundation grout (no cracks, full bearing); anchor bolts (torqued to spec, properly tensioned); leveling (≤ 0.1 mm/m typical for rotating equipment); piping (nozzle loads within OEM allowables — the most common MC defect is pipe strain from misaligned piping that distorts the casing and accelerates bearing failure); driver alignment (≤ 0.05 mm TIR for flexible couplings, ≤ 0.02 mm for rigid); electrical (motor megger, rotation check, terminal torque); instrumentation (calibration certificates current, loop checks signed, impulse lines sloped and not trapped); lubrication (oil specs verified, reservoir flushed to NAS 8); safety (LOTO provisions in place, guards fitted, reliefs set and tagged). A common trap is to perform MC and immediately release to commissioning: the punch-list discovered at MC must close before SAT — otherwise the SAT will be contaminated by installation defects that are not failure modes of the asset itself.

**FAT vs SAT.** The FAT is the design-stage reliability demonstration at the vendor's shop. The vendor's incentive is to pass the test — the test procedure must therefore be buyer-controlled: it specifies the run duration, the load profile, the instrumentation (vibration probes at the bearing housings, accelerometers in two orthogonal planes, key-phasor for spectrum), the acceptance bands (per API 611/613/617 for the equipment class, or ISO 10816 for general rotating machinery), and the data retention (time-waveform, spectrum, DC trends). The buyer's witness — typically a rotating-equipment engineer — signs the FAT certificate and authorizes shipment. The SAT is the field test: the asset is run on process fluids under process conditions. SAT is where transport damage, installation defects, and process-environment effects appear. A well-designed SAT replicates the FAT measurements (so a deviation between FAT and SAT isolates the transport/installation/environment effect) and adds the run-in duration (24–72 h continuous, with no unplanned trip permitted). The test report is the baseline against which operational reliability will be measured.

**Reliability Acceptance Test (RAT).** The RAT is a statistical demonstration that MTBF ≥ MTBF_target at a specified confidence (Ebeling §13). The two common forms: time-truncated (run for time T, observe r failures; accept if r ≤ r_accept) and failure-truncated (run until r failures occur at cumulative time T; accept if T ≥ T_accept). The lower confidence bound on MTBF for a time-truncated test with r failures observed at time T is MTBF_L = 2T / χ²(α, 2r+2) — the chi-square with 2r+2 degrees of freedom at the lower α point. A standard commissioning criterion: run for 168 h (one week), accept if zero failures; the lower 60% confidence bound on MTBF with r = 0, T = 168 h is MTBF_L = 2 × 168 / χ²(0.4, 2) = 336 / 1.832 ≈ 183 h — modest, but adequate to demonstrate that gross defects are absent. For higher confidence, extend the run: 1,000 h with r = 0 gives MTBF_L ≈ 1,086 h at 60% confidence. The RAT is the formal reliability gate between commissioning and operations.

**Reliability growth.** During commissioning, failures occur and are fixed — the asset's reliability grows. The Duane model (Ebeling §14) describes this growth: MTBF(t) = a · t^b, where a is the initial MTBF, b is the growth rate (typical 0.1–0.3 for well-managed programs, 0.05–0.10 for typical). A commissioning program with a = 100 h, b = 0.25, over 1,000 h reaches MTBF(1,000) = 100 × 1,000^0.25 ≈ 562 h — a 5.6× growth. The growth-curve slope (b) is the management metric: a program with b < 0.10 is not fixing root causes; one with b > 0.25 is in genuine reliability-growth mode. The Crow-AMSAA model extends Duane to a non-homogeneous Poisson process and is the modern standard for military and aerospace programs.

**Startup reliability.** The first 168 h to 30 days after handover is the early-life window where infant mortality (β < 1 in the Weibull sense) is revealed. A well-commissioned asset enters service with the infant-mortality failures removed; a poorly-commissioned asset enters service with them intact and dominates the operational MTBF statistic for months. The startup reliability index (unplanned trips in first 168 h / run-hours) is a single metric: target = 0 (no unplanned trips in the first week). The asset is not formally accepted by operations until the index = 0 for the demonstration period. The reliability engineer's role in this window is to root-cause every trip — not to reset and re-run, which only defers the failure into the operational period where it will recur.`,
    core_principles: `- **Commissioning is a reliability gate, not a mechanical formality.** The test program demonstrates that the as-built asset matches the as-designed inherent reliability.
- **FAT isolates design; SAT isolates transport + installation + environment.** Deviations between FAT and SAT measurements diagnose the source.
- **The reliability-acceptance test (RAT) is a statistical gate.** It quantifies the confidence with which MTBF ≥ MTBF_target has been demonstrated.
- **Reliability growth during commissioning is real and measurable.** The Duane/Crow-AMSAA slope (b) is the management metric.
- **The startup window is where infant mortality is removed.** A well-commissioned asset enters service with infant mortality burned off.
- **The as-commissioned baseline is the operational reference.** Vibration spectrum, performance curve, and acceptance bands handed to operations are the drift-measurement baseline.`,
    components: `- **Mechanical-completion checklist** (per equipment class): foundation, grout, anchor bolts, leveling, piping nozzle loads, alignment, electrical, instrumentation, lubrication, safety.
- **FAT procedure**: run duration, load profile, instrumentation, acceptance bands, data retention, witness sign-off.
- **SAT procedure**: FAT-equivalent measurements at site + run-in duration + process-condition verification.
- **Commissioning matrix**: subsystem × test × status — every interlock, alarm, permissive, and override is tested and signed.
- **Punch-list / snag-list**: defect, owner, due date, status — closed before handover.
- **Baseline records**: vibration spectrum, performance curve, alignment record, oil sample, motor current signature.
- **Reliability Acceptance Test (RAT)**: time-truncated or failure-truncated, with stated confidence (1−α).
- **Reliability-growth model** (Duane / Crow-AMSAA): MTBF(t) curve over the commissioning program.
- **Handover deliverable set**: as-built drawings, baseline records, O&M manuals, spares list, training record, warranty start date.`,
    process: `1. **Mechanical completion**: inspect against MC checklist; close all punch-list items; baseline instrumentation; sign MC certificate.
2. **Pre-commissioning (cold)**: loop checks, instrument calibration, valve stroking, motor bump (direction of rotation, uncoupled run), relay tests, interlock logic tests (de-energized).
3. **Hot commissioning**: introduce process fluids; bring to operating conditions in stages (warm-up ramps, pressure ramps, speed ramps).
4. **SAT run-in**: 24–72 h continuous at full load; record vibration, bearing temperature, performance, seal leakage, motor current.
5. **Subsystem integration tests**: permissives, interlocks, alarms, trip logic — verify each against its functional spec.
6. **Performance test**: ASME PTC (e.g., PTC 10 for compressors) to verify flow/head/efficiency meets spec.
7. **Reliability Acceptance Test (RAT)**: time-truncated run (e.g., 168 h) with acceptance criterion (r ≤ r_accept).
8. **Reliability-growth tracking**: plot MTBF(t) vs t; confirm the growth slope (b) meets target.
9. **Punch-list closeout**: every item closed before handover; residual items formally risk-assessed and accepted.
10. **Handover gate**: deliver the as-built pack, baseline records, O&M manuals, spares list, training record; operations signs acceptance.
11. **Startup reliability window**: 168 h to 30 days post-handover; root-cause every unplanned trip; asset is formally accepted by operations at the end of the window.`,
    formula_calculation: `- **MTBF lower confidence bound (time-truncated, r failures at time T)**:
  MTBF_L = 2T / χ²(α, 2r + 2)
  Variables: T [h] accumulated test time; r = number of failures; α = 1 − confidence (e.g., α = 0.4 for 60% confidence); χ²(α, 2r+2) = chi-square at the lower α point with 2r+2 degrees of freedom. Assumption: exponential failure distribution; failures are independent. Interpretation: with r failures at time T, the true MTBF is ≥ MTBF_L with confidence 1 − α.
- **Reliability-growth (Duane)**:
  MTBF(t) = a · t^b
  Variables: a [h] = MTBF at t = 1 (initial); b = growth slope (dimensionless; 0.1–0.3 typical); t [h] = cumulative test time. Interpretation: MTBF grows as t^b over the program; b is the management metric.
- **Crow-AMSAA (NHPP form)**:
  E[N(t)] = λ · t^β; cumulative failure intensity = λ · β · t^(β − 1)
  Variables: λ, β = NHPP parameters; β > 1 = deteriorating, β = 1 = constant, β < 1 = improving (reliability growth). Interpretation: estimate β from the failure-time series; β < 1 indicates growth.
- **Reliability demonstration (Binomial)**:
  Accept if (number of failures r) ≤ r_accept at (test time T) for the given (MTBF_target, α, β) plan.
  Variables: r_accept = max failures tolerated; T = test time; MTBF_target = required MTBF; α = producer's risk; β = consumer's risk. Interpretation: a documented plan in advance of the test.
- **Vibration acceptance (ISO 10816 zones)**:
  Zone A (new machine): ≤ V_A; Zone B (long-term OK): V_A..V_B; Zone C (improve): V_B..V_C; Zone D (shut down): > V_C.
  Variables: V = vibration velocity RMS [mm/s]; thresholds depend on machine class and rigid/flexible mount. Interpretation: SAT must finish in Zone A or B.
- **Alignment tolerance (flexible coupling)**:
  TIR (radial + axial) ≤ 0.05 mm (or per OEM)
  Variables: TIR = Total Indicator Reading [mm]. Interpretation: misalignment > tolerance causes 1× and 2× vibration components and accelerates bearing failure.`,
    worked_example: `**Problem.** A Power plant is commissioning a new 25-MW condensing steam turbine. The procurement spec requires MTBF ≥ 4,000 h. The FAT was witnessed at the vendor's shop (4-h no-load run, zero failures, vibration ≤ 1.8 mm/s RMS). The SAT is to be a 24-h full-load run on steam; the commissioning engineer must specify (a) SAT acceptance criteria, (b) the lower 60% confidence bound on MTBF if the SAT records zero failures over 24 h, (c) the 168-h reliability demonstration criterion for handover, and (d) the lower 60% confidence bound on MTBF if the 168-h run records zero failures.

**Step 1 — SAT acceptance criteria.**
  - Vibration: per ISO 10816 zone A/B for large steam turbines, ≤ 2.8 mm/s RMS at the bearing housings (DE and NDE, two orthogonal planes).
  - Bearing temperature: ≤ 85 °C at the journal bearings (≤ 95 °C at the thrust bearing); oil outlet temperature ≤ 75 °C.
  - Overspeed trip: mechanical bolt trip at 110% of rated speed (3,300 rpm for a 3,000-rpm turbine), demonstrated by actual overspeed test.
  - Performance: per ASME PTC 6 — steam flow, exhaust pressure, generator output within ±2% of contract.
  - 24-h continuous full-load run, zero unplanned trips.
  - Vibration spectrum trend (no rising component, e.g., 1× indicating misalignment drift).

**Step 2 — Lower 60% confidence bound on MTBF with r = 0, T = 24 h.**
  MTBF_L = 2T / χ²(α, 2r + 2) = 2 × 24 / χ²(0.40, 2) = 48 / 1.832 ≈ 26.2 h.
  This is a very low lower bound — 24 h of test time is statistically thin. It demonstrates "no gross defect," not "MTBF ≥ 4,000 h." Conclusion: the SAT alone does not statistically demonstrate the MTBF spec; it must be supplemented by the 168-h reliability demonstration run.

**Step 3 — 168-h reliability demonstration run.**
  Criterion: zero unplanned trips in 168 h (1 week) of continuous operation at the rated duty. If a trip occurs, the root cause is identified, fixed, and the 168-h clock restarts. The asset is not handed over to operations until 168 h clean.

**Step 4 — Lower 60% confidence bound on MTBF with r = 0, T = 168 h.**
  MTBF_L = 2 × 168 / χ²(0.40, 2) = 336 / 1.832 ≈ 183.4 h.
  This is a stronger demonstration than the SAT but still below the 4,000-h spec. To demonstrate MTBF ≥ 4,000 h at 60% confidence, the test time must satisfy: 2T / χ²(0.4, 2) ≥ 4,000 ⇒ T ≥ 4,000 × 1.832 / 2 ≈ 3,664 h (≈ 22 weeks). This is infeasible at commissioning; the practical approach is to use the 168-h demonstration as the gate for handover, then continue the demonstration in service with operational failure data, monitoring the lower confidence bound as it rises.

**Step 5 — Reliability growth interpretation.** During the 168-h run, suppose 3 failures occur (a vibration trip on day 2 from misalignment drift; a seal-gas pressure trip on day 4; a control-valve instability trip on day 6) — each fixed, root-caused, and the clock restarted. The cumulative test time is 168 + (re-run time after each fix) ≈ 250 h. The growth-slope b can be estimated: with failures at 24, 96, 144 h and a final clean 168-h run, the cumulative MTBF rises from 24 (first interval) to 96 (second) to 144 (third) to 312 h (final); the slope b ≈ 0.4 (a strong growth rate, indicating the fixes are addressing root causes). With b = 0.4 and a = 24 h, projected MTBF(1,000) = 24 × 1,000^0.4 ≈ 380 h, MTBF(10,000) = 24 × 10,000^0.4 ≈ 955 h. The asset will reach the 4,000-h spec after ~40,000 h of operation if the growth slope is maintained — a stretch but not implausible for a well-managed program.

**Result.** SAT acceptance: ISO 10816 zone A/B (≤ 2.8 mm/s RMS), bearing ≤ 85 °C, overspeed trip at 110%, PTC 6 performance within ±2%, 24-h run zero unplanned trips. SAT alone (24 h, r=0) gives MTBF_L ≈ 26 h at 60% confidence — insufficient. The 168-h reliability demonstration run is the handover gate; r=0 at T=168 h gives MTBF_L ≈ 183 h at 60% confidence — adequate to demonstrate absence of gross defects, not the 4,000-h MTBF spec. The full spec demonstration is deferred to in-service operation, with the lower confidence bound rising as operational data accrues. The growth slope (b ≈ 0.4 if failures are root-caused and fixed) indicates a strong reliability-growth program.`,
    industrial_example: `**Power — 25-MW steam turbine commissioning.** The worked example above is the canonical power-plant scenario: FAT at the vendor shop, SAT at site on steam, 168-h reliability demonstration run. The Power-specific reliability risks are steam-quality (silica deposits on blades causing vibration), condenser-vacuum stability (control challenges at low load), and the overspeed trip (a safety, not a reliability, gate but a regulatory must).

**Oil & Gas — 250-t/h centrifugal compressor commissioning.** A gas-plant compressor has a 6-week commissioning program: 2 weeks MC (lube-oil flush to NAS 8 is the long pole), 1 week pre-commissioning (loop checks, motor bump, surge-control logic), 5 days SAT (24-h full-load run on process gas, surge demonstrations at 3 points, seal-gas system leak-tight), 7 days reliability demonstration run (168 h clean). The commissioning database captures the baseline vibration spectrum (per ISO 10816 zone A), the baseline performance curve (per ASME PTC 10), and the seal-gas consumption baseline.

**Chemical — reactor-feed pump commissioning.** A centrifugal reactor-feed pump (3-stage, 180 °C, 40 barg) has a 3-week commissioning program: MC (alignment to ≤ 0.05 mm TIR, piping nozzle loads within API 686 allowables), pre-commissioning (loop checks, mechanical seal flush plan API 53A commissioning), SAT (warm-up ramp at 30 °C/h to 180 °C, 24-h full-load run), handover. The chemical-specific risk is thermal distortion: a pump commissioned cold and started hot without warm-up will distort the casing and accelerate seal failure — the warm-up ramp is the commissioning control.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** A chemical plant is commissioning a new reaction section (4 stirred-tank reactors in series, with a complex heat-removal jacket control system). The design MTBF per reactor is 6,000 h. The SAT passes per reactor, but the 168-h reliability demonstration run reveals 12 unplanned trips in the first week — far above the target of zero. The commissioning team's first reaction is to reset and re-run, but the reliability engineer intervenes: each trip must be root-caused before the clock restarts.

Root causes uncovered in the first week: (a) jacket-coolant control-valve stiction (8 trips — the valve was specified for on-off but operated in modulating mode); (b) reactor-level instrument drift (2 trips — the radar gauge was mis-calibrated at installation); (c) interlock logic error in the permissive (1 trip — the design intent was overridden during implementation); (d) pump-bearing infant mortality (1 trip — a manufacturing defect in the bearing cage). Each fix removes a distinct failure mode: (a) the control valve is replaced with a characterized trim; (b) the radar gauge is recalibrated; (c) the interlock logic is corrected and re-tested; (d) the bearing is replaced and the failed bearing sent to the OEM for analysis.

After the fixes, the 168-h run completes clean. The reliability-growth slope (b) is estimated at 0.35 — a strong growth rate. The lower 60% confidence bound on MTBF after the 168-h clean run is ≈ 183 h, but the operational data over the next 90 days accrues 2,160 h with 2 failures (one of which was a maintenance-induced failure during PM) — operational MTBF ≈ 1,080 h, with the lower 60% bound at ≈ 920 h, well within reliability-growth trajectory toward the 6,000-h design target. The case demonstrates that commissioning without root-cause of each trip would have deferred all four failure modes into operations, where they would have dominated the MTBF statistic for months and corrupted the reliability baseline.`,
    visual_explanation: `- **Commissioning program timeline**: Gantt bars for MC → Pre-commissioning → SAT → Reliability demonstration → Handover → Startup window. The handover gate is the gate between project and operations.
- **FAT vs SAT vibration comparison**: two overlaid spectra (FAT at vendor shop, SAT at site). A deviation isolates the transport/installation/environment effect.
- **Reliability growth curve**: x = cumulative test time, y = cumulative MTBF; the slope b is the growth rate.
- **ISO 10816 zones**: a horizontal bar divided into A | B | C | D, with the as-commissioned vibration velocity marked (must be in A or B).
- **Handover deliverable set**: a stacked diagram of as-built drawings | baseline records | O&M manuals | spares list | training record | warranty start.`,
    simulation_opportunity: `A commissioning simulator: the learner is given an asset, a commissioning program (MC, pre-commissioning, SAT, reliability demonstration), and a stream of failures during the 168-h run. The learner must decide for each failure: reset and re-run (cheap, defers the failure) or root-cause and fix (expensive, prevents recurrence). The simulator scores: (a) 168-h-clean time, (b) total program cost, (c) operational MTBF in the first 90 days post-handover. The lesson: the root-cause path dominates over the reset path on operational MTBF.`,
    common_mistakes: `- **Reset and re-run on a trip**: the failure is deferred into operations, where it recurs and corrupts the reliability baseline.
- **Confusing FAT with SAT**: a passing FAT does not exempt the asset from SAT — the transport + installation + environment effects appear at SAT.
- **Skipping the 168-h reliability demonstration**: the asset is handed over after the SAT (24-h run); the first 168 h of operation then reveal infant mortality, and operations "owns" the asset during the failure window.
- **Mechanical completion not closed before SAT**: installation defects contaminate the SAT, and the punch-list never closes.
- **No baseline vibration spectrum / performance curve**: operational drift has no reference; condition monitoring cannot detect incipient faults.
- **Accepting the asset on first clean run without root-cause**: the clean run may have been lucky — every prior trip must be root-caused.
- **Treating the punch-list as a paperwork exercise**: open items at handover become operational defects.`,
    limitations: `- Commissioning cannot demonstrate the full MTBF spec in a practical time (the 4,000-h example needs ~22 weeks of test for 60% confidence).
- Reliability-growth extrapolation is fragile — the slope b can break if a new failure mode appears.
- The 168-h clean run demonstrates absence of gross defects, not absence of slow failure modes.
- Baseline records are point-in-time — a baseline taken during commissioning can be off-design if the process was not yet at the operating envelope.
- The punch-list at handover always has residual items; the risk-acceptance decision is engineering judgment.
- Commissioning is weather- and schedule-constrained — a compressed program trades reliability demonstration for schedule.`,
    comparison: `- **FAT vs SAT**: FAT isolates the design and the vendor's build; SAT isolates transport + installation + environment. Both are required.
- **Commissioning vs Maintenance**: commissioning verifies that the asset meets its inherent-reliability baseline at handover; maintenance preserves that baseline in service. Commissioning happens once; maintenance is continuous.
- **Reliability demonstration vs Reliability growth**: demonstration answers "is MTBF ≥ X at confidence?"; growth answers "how is MTBF improving over the program?" Both apply during commissioning.
- **MC vs Pre-commissioning vs Hot commissioning**: MC = physically installed; pre-commissioning = subsystems tested cold; hot commissioning = process fluids and run-in. Each stage gates the next.`,
    practical_application: `- **At procurement**: the FAT procedure is a buyer-controlled document; the buyer's witness signs the FAT certificate; data retention (time-waveform, spectrum, DC trends) is specified.
- **At mechanical completion**: the MC checklist is signed off; the punch-list is opened; no SAT until the MC is closed.
- **At SAT**: full-load run on process fluids, 24–72 h; baseline vibration spectrum and performance curve captured.
- **At reliability demonstration**: 168-h clean run with zero unplanned trips; every trip root-caused.
- **At handover**: deliverable set signed by operations — as-built drawings, baseline records, O&M manuals, spares list, training record, warranty start date.
- **In the startup window**: 168 h to 30 days; root-cause every unplanned trip; operational MTBF accrues against the lower confidence bound, which rises as data accrues.`,
    decision_scenario: `You are the commissioning engineer. The SAT of a new 25-MW steam turbine has passed (vibration ≤ 2.8 mm/s RMS, 24-h full-load run clean). The project manager asks to hand over immediately to recover schedule. The reliability engineer objects: the 168-h reliability demonstration run has not been done, and one trip was reset during the SAT without root-cause. The project manager offers three options:

  (A) Hand over now; run the 168-h in service with operations owning the asset.
  (B) Run the 168-h in commissioning mode; reset any trip and continue.
  (C) Run the 168-h in commissioning mode; root-cause every trip; restart the clock after each fix.

Decision: (C). The 168-h clean run with root-cause is the reliability gate; (A) and (B) defer infant-mortality failures into operations, where they will dominate the MTBF statistic and corrupt the reliability baseline. The schedule cost of (C) is at most a few weeks; the operational cost of (A) or (B) is a corrupted baseline that takes months to recover. The reliability engineer's authority to hold the gate is the operational lever — without it, the project trades reliability for schedule at the worst point in the asset lifecycle.`,
    practice_questions: `- Distinguish FAT from SAT in one sentence each.
- Compute the lower 60% confidence bound on MTBF for r = 0 failures at T = 168 h. *(Answer: ≈ 183 h.)*
- State the Duane reliability-growth model and the typical range of the growth slope b.
- List the handover deliverable set.
- Give an example of a punch-list item that should NOT be deferred past handover.
- State why a "reset and re-run" decision on a commissioning trip is a reliability mistake.`,
    certification_questions: `The CMRP exam tests Installation & Commissioning as the second MPR competency. SMRP-aligned sample prompts:
(a) Distinguish FAT, SAT, commissioning, and startup reliability.
(b) Compute the lower confidence bound on MTBF for a time-truncated test (chi-square, 2r+2 degrees of freedom).
(c) Recognize the 168-h reliability-demonstration run as the handover gate.
(d) Identify that the reliability-growth slope (b) is the commissioning management metric.
The questions in this lesson's question bank are aligned to these I&C competencies.`,
    summary: `Installation & Commissioning is the gate through which inherent reliability passes into operational reliability. The five discrete stages — mechanical completion, FAT, SAT, commissioning, and startup reliability — verify that the as-built asset matches the as-designed inherent-reliability baseline. The statistical tools (RAT, MTBF lower confidence bound, Duane / Crow-AMSAA growth models) quantify the demonstration; the 168-h clean run is the handover gate; the as-commissioned baseline (vibration spectrum, performance curve) is the operational reference. The CMRP exam tests the engineer's fluency in designing the commissioning program, the statistical demonstration, and the reliability-growth interpretation. The output — the as-commissioned baseline and the handover deliverable set — is the operational reference against which the Equipment Reliability and Work Management pillars will measure drift.`,
    key_takeaways: `- Five discrete stages: mechanical completion, FAT, SAT, commissioning, startup reliability.
- FAT isolates design; SAT isolates transport + installation + environment; commissioning integrates subsystems.
- MTBF_L (lower confidence bound, time-truncated) = 2T / χ²(α, 2r+2) — the statistical demonstration gate.
- Duane growth: MTBF(t) = a · t^b; b = 0.1–0.3 typical; b < 0.1 indicates the program is not fixing root causes.
- 168-h clean run is the handover gate; root-cause every trip — reset and re-run defers failures into operations.
- As-commissioned baseline (vibration spectrum, performance curve) is the operational drift-measurement reference.`,
    references: `- SMRP. *CMRP Body of Knowledge — Manufacturing Process Reliability pillar: Installation & Commissioning.*
- SMRP. *CMRP Exam Outline.*
- ISO 55000:2014 — asset-lifecycle acquisition-to-use transition.
- Mobley, R. K. (2008). *Maintenance Engineering Handbook* (7th ed.). McGraw-Hill. §9 (Installation & Commissioning), §6 (Predictive Maintenance baseline).
- Campbell, J. D. & Jardine, A. K. S. (2001). *Maintenance Strategy*. Productivity Press. Ch. 5 (Proactive maintenance lifecycle).
- Ebeling, C. E. (2010). *An Introduction to Reliability and Maintainability Engineering* (2nd ed.). Waveland. Ch. 13 (Reliability testing), Ch. 14 (Reliability growth).
- Jardine, A. K. S. & Tsang, A. H. C. (2017). *Maintenance, Replacement, and Reliability* (2nd ed.). CRC. Ch. 4 (Inspection & replacement optimization).`,
  },
  knowledgeObject: {
    title: "Installation & Commissioning — FAT/SAT, RAT, and reliability growth",
    domain: "Manufacturing Process Reliability",
    competency: "Installation & Commissioning",
    topic: "Commissioning for reliability",
    concept: "Reliability gate at handover",
    body: {
      definitions: [
        "Mechanical completion: asset installed per drawings, verified against an inspector's checklist; no process fluids.",
        "FAT: Factory Acceptance Test at the vendor shop; design-stage reliability demonstration.",
        "SAT: Site Acceptance Test; full-load run on process fluids; isolates transport + installation + environment.",
        "Commissioning: systematic verification of every subsystem (instrumentation, interlocks, alarms, safety systems, sequential logic) against its functional spec.",
        "Startup reliability: 168 h to 30 days post-handover; infant-mortality window.",
        "Punch-list / snag-list: open defects with owner and due date, closed before handover.",
        "Reliability Acceptance Test (RAT): statistical test that demonstrates MTBF ≥ MTBF_target at confidence 1−α.",
        "Reliability growth (Duane / Crow-AMSAA): MTBF(t) = a · t^b — the model of MTBF improvement during a commissioning program.",
        "Baseline (vibration / performance): as-commissioned reference; operational drift is measured against this.",
      ],
      principles: [
        "Commissioning is a reliability gate, not a mechanical formality — the as-built must match the as-designed inherent reliability.",
        "FAT isolates design; SAT isolates transport + installation + environment; deviations diagnose the source.",
        "The RAT is a statistical gate — it quantifies the confidence with which MTBF ≥ MTBF_target has been demonstrated.",
        "Reliability growth is real and measurable — the Duane slope (b) is the management metric.",
        "The 168-h clean run is the handover gate; root-cause every trip; reset-and-rerun defers failures.",
        "The as-commissioned baseline is the operational drift-measurement reference.",
      ],
      components: [
        "Mechanical-completion checklist per equipment class.",
        "FAT procedure (run duration, load, instrumentation, acceptance bands, witness sign-off).",
        "SAT procedure (FAT-equivalent measurements at site + run-in duration + process-condition verification).",
        "Commissioning matrix (subsystem × test × status).",
        "Punch-list / snag-list with owner and due date.",
        "Baseline records (vibration spectrum, performance curve, alignment, oil sample, motor current).",
        "Reliability Acceptance Test (RAT) plan.",
        "Reliability-growth model (Duane / Crow-AMSAA).",
        "Handover deliverable set (as-built drawings, baselines, O&M manuals, spares, training, warranty).",
      ],
      mechanism: [
        "MC → pre-commissioning (cold) → hot commissioning → SAT run-in → subsystem integration tests → performance test → RAT (168-h) → reliability-growth tracking → punch-list closeout → handover gate → startup reliability window → formal acceptance by operations.",
      ],
      process: [
        "1. Mechanical completion: inspect against MC checklist; close punch-list; baseline instrumentation; sign MC certificate.",
        "2. Pre-commissioning (cold): loop checks, instrument calibration, valve stroking, motor bump, interlock logic tests (de-energized).",
        "3. Hot commissioning: introduce process fluids; bring to operating conditions in stages (warm-up, pressure, speed ramps).",
        "4. SAT run-in: 24–72 h continuous at full load; record vibration, bearing temperature, performance, seal leakage, motor current.",
        "5. Subsystem integration tests: permissives, interlocks, alarms, trip logic — verify each against its functional spec.",
        "6. Performance test (ASME PTC): verify flow/head/efficiency meets spec.",
        "7. RAT: time-truncated run (e.g., 168 h) with acceptance criterion (r ≤ r_accept).",
        "8. Reliability-growth tracking: plot MTBF(t); confirm growth slope (b).",
        "9. Punch-list closeout: every item closed before handover; residual items formally risk-assessed.",
        "10. Handover gate: deliver the as-built pack, baselines, O&M manuals, spares, training record; operations signs acceptance.",
        "11. Startup reliability window: 168 h to 30 days post-handover; root-cause every unplanned trip; formal acceptance at the end.",
      ],
      formulas: [
        "MTBF_L (time-truncated, r failures at time T) = 2T / χ²(α, 2r+2) — lower confidence bound on MTBF.",
        "Duane growth: MTBF(t) = a · t^b; b = 0.1–0.3 typical; b < 0.1 = not fixing root causes.",
        "Crow-AMSAA (NHPP): E[N(t)] = λ · t^β; β < 1 = improving (growth), β = 1 = constant, β > 1 = deteriorating.",
        "Reliability demonstration (Binomial): accept if r ≤ r_accept at time T for the (MTBF_target, α, β) plan.",
        "ISO 10816 zones: A (new), B (long-term OK), C (improve), D (shut down); SAT must finish in A or B.",
        "Alignment tolerance (flexible coupling): TIR ≤ 0.05 mm (or per OEM).",
      ],
      metrics: [
        "168-h clean run (zero unplanned trips) — handover gate.",
        "MTBF_L at stated confidence (60% typical at commissioning).",
        "Reliability-growth slope (b) — Duane model.",
        "Punch-list open items at handover (target = 0 or risk-assessed).",
        "Vibration velocity RMS at SAT (per ISO 10816 zone A/B).",
        "Alignment TIR (per OEM).",
        "Startup reliability index (unplanned trips in first 168 h / run-hours × 100; target = 0).",
      ],
      examples: [
        "25-MW steam turbine commissioning (Power): 24-h SAT, 168-h RAT; r=0 at T=168 h ⇒ MTBF_L ≈ 183 h at 60% confidence.",
        "250-t/h centrifugal compressor (Oil & Gas): 6-week program; MC + pre-commissioning + 24-h SAT + 168-h RAT; baseline vibration spectrum per ISO 10816 zone A.",
        "Reactor-feed pump (Chemical): 3-week program; thermal warm-up ramp at 30 °C/h to 180 °C prevents casing distortion; SAT 24-h full-load run.",
      ],
      industrial_examples: [
        "Power — 25-MW steam turbine: silica deposits on blades, condenser-vacuum stability, overspeed trip gate.",
        "Oil & Gas — 250-t/h centrifugal compressor: lube-oil flush to NAS 8 (long pole), surge-control demonstration, seal-gas system leak-tight.",
        "Chemical — reactor-feed pump (180 °C, 40 barg): API 53A dual-pressurized seal flush commissioning; warm-up ramp at 30 °C/h to prevent thermal distortion.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Chemical reaction section (4 CSTRs in series). 168-h run revealed 12 unplanned trips. Root causes: (a) jacket control-valve stiction (8 trips), (b) reactor-level radar gauge mis-calibration (2), (c) interlock logic error (1), (d) bearing infant mortality (1). Each fix removed a distinct mode. Post-fix 168-h clean. Growth slope b ≈ 0.35. Operational MTBF ≈ 1,080 h over 90 days, lower 60% bound ≈ 920 h — on growth trajectory toward 6,000-h design target.",
      ],
      common_errors: [
        "Reset and re-run on a trip — defers failure into operations, corrupts baseline.",
        "Confusing FAT with SAT — transport/installation/environment effects missed.",
        "Skipping the 168-h reliability demonstration — first 168 h of operation reveal infant mortality under operations' ownership.",
        "Mechanical completion not closed before SAT — installation defects contaminate the SAT.",
        "No baseline vibration spectrum / performance curve — operational drift has no reference.",
        "Accepting on first clean run without root-cause of prior trips — lucky run, not a fixed asset.",
        "Treating the punch-list as paperwork — open items at handover become operational defects.",
      ],
      limitations: [
        "Commissioning cannot demonstrate the full MTBF spec in a practical time (4,000-h MTBF needs ~22 weeks for 60% confidence).",
        "Reliability-growth extrapolation is fragile — new failure modes can break the slope.",
        "168-h clean run demonstrates absence of gross defects, not absence of slow failure modes.",
        "Baselines are point-in-time — off-design commissioning conditions distort them.",
        "Punch-list always has residual items at handover; risk-acceptance is judgment.",
        "Commissioning is weather- and schedule-constrained — a compressed program trades reliability for schedule.",
      ],
      best_practices: [
        "Buyer-controlled FAT procedure with witness sign-off and data retention.",
        "Close MC punch-list before SAT — never contaminate the SAT.",
        "Capture baseline vibration spectrum and performance curve at SAT — the operational drift-measurement reference.",
        "Run the 168-h reliability-demonstration run as the handover gate; root-cause every trip.",
        "Track Duane growth slope (b); b < 0.1 = investigate; b > 0.25 = strong growth.",
        "Hand over the deliverable set formally; operations signs acceptance.",
        "Root-cause every trip in the startup window; do not reset-and-rerun.",
      ],
      related_concepts: [
        "Process Design (previous MPR competency — provides the inherent-reliability baseline).",
        "Reliability & Maintainability (the quantitative core — RAT and growth models).",
        "Equipment Reliability (ER pillar — failure analysis of equipment in service).",
        "Condition Monitoring & Diagnostics (uses the as-commissioned vibration baseline).",
        "ISO 55000 acquisition-to-use transition (asset lifecycle).",
        "ASME PTC performance test codes; ISO 10816 vibration zones; API 610/611/613/617/686.",
      ],
      prerequisites: [
        "Process Design (inherent-reliability baseline handover).",
        "Mechanical-drawing reading (P&ID, isometric, GA, OEM drawings).",
        "Vibration analysis basics (ISO 10816 zones; spectrum vs overall; accelerometer mounting).",
        "Hydrotest codes (ASME B31.3 piping; Section VIII vessels).",
        "Statistics for reliability testing (chi-square, time-truncated vs failure-truncated).",
      ],
      references: [
        "SMRP CMRP BOK — MPR pillar: Installation & Commissioning.",
        "SMRP CMRP Exam Outline.",
        "ISO 55000:2014 — acquisition-to-use transition.",
        "Mobley (2008), Maintenance Engineering Handbook, §9, §6.",
        "Campbell & Jardine (2001), Maintenance Strategy, Ch. 5.",
        "Ebeling (2010), Reliability and Maintainability Engineering, Ch. 13, 14.",
        "Jardine & Tsang (2017), Maintenance, Replacement, and Reliability, Ch. 4.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Installation & Commissioning",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which statement correctly distinguishes a Factory Acceptance Test (FAT) from a Site Acceptance Test (SAT)?",
      whyCorrect:
        "The FAT is run at the vendor's shop before shipment and isolates design / build defects; the SAT is run at the plant site after installation and isolates transport, installation, and process-environment effects (Mobley §9).",
      whyOthersWrong: [
        "The SAT is run at the vendor's shop before shipment — reversed; SAT is at site.",
        "FAT and SAT are synonymous — they are not; they run at different stages and isolate different failure-source categories.",
        "The FAT is on process fluids and the SAT is no-load — reversed; FAT is typically no-load or shop-load, SAT is on process fluids under process conditions.",
      ],
      explanation:
        "FAT isolates design and the vendor's build quality at the shop; SAT isolates transport, installation, and process-environment at site. Both are required and they complement each other.",
      options: [
        {
          text: "FAT runs at the vendor shop and isolates design/build defects; SAT runs at site and isolates transport/installation/environment effects",
          isCorrect: true,
        },
        { text: "The SAT is run at the vendor's shop before shipment", isCorrect: false },
        { text: "FAT and SAT are synonymous", isCorrect: false },
        { text: "The FAT is on process fluids and the SAT is no-load", isCorrect: false },
      ],
    },
    {
      competencyName: "Installation & Commissioning",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Power",
      stem: "A 25-MW steam turbine commissioning program runs a 168-hour reliability demonstration with zero failures. Using the time-truncated chi-square formula at 60% confidence (α = 0.4, χ²(0.4, 2) ≈ 1.832), what is the lower 60% confidence bound on MTBF?",
      whyCorrect:
        "MTBF_L = 2T / χ²(α, 2r+2) = 2 × 168 / χ²(0.4, 2) = 336 / 1.832 ≈ 183.4 h. The 168-h run with zero failures demonstrates (at 60% confidence) that MTBF is at least ~183 h — adequate for absence of gross defects but far below the typical 4,000-h MTBF spec.",
      whyOthersWrong: [
        "4,000 h — the spec value, but the test does not statistically demonstrate this; the lower bound from 168 h with r=0 is far lower.",
        "168 h — this is the test time, not the lower confidence bound; the chi-square factor (≈ 1.832) means the bound is roughly T × 1.09, not equal to T.",
        "336 h — this is 2T, ignoring the chi-square divisor; the correct denominator is χ²(0.4, 2) ≈ 1.832.",
      ],
      explanation:
        "MTBF_L = 2T / χ²(α, 2r+2). For r = 0, T = 168 h, α = 0.4 (60% confidence), the lower bound is ≈ 183 h. To demonstrate MTBF ≥ 4,000 h at 60% confidence requires T ≈ 22 weeks — infeasible at commissioning, so the full spec demonstration is deferred to in-service operation.",
      options: [
        { text: "≈ 183 h", isCorrect: true },
        { text: "4,000 h", isCorrect: false },
        { text: "168 h", isCorrect: false },
        { text: "336 h", isCorrect: false },
      ],
    },
    {
      competencyName: "Installation & Commissioning",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Oil & Gas",
      stem: "During the 168-h reliability demonstration run of a new compressor, an unplanned trip occurs on day 3. Which commissioning decision is consistent with reliability engineering best practice?",
      whyCorrect:
        "Root-cause the trip, fix the underlying defect, and restart the 168-h clock from zero. Reset-and-rerun defers the failure into operations; continuing the clock hides the failure; handing over with a known defect transfers the problem to operations.",
      whyOthersWrong: [
        "Reset and re-run, continuing the 168-h clock — defers the failure into operations where it will recur.",
        "Hand over to operations now and let them deal with the trip — the asset is not formally accepted by operations until 168 h clean.",
        "Reduce the demonstration duration to 96 h so the trip falls outside the window — the demonstration is no longer statistically meaningful.",
      ],
      explanation:
        "The 168-h clean run is the handover gate; every trip must be root-caused before the clock restarts. Reset-and-rerun is the most common commissioning mistake — it corrupts the operational reliability baseline.",
      options: [
        {
          text: "Root-cause the trip, fix the underlying defect, and restart the 168-h clock",
          isCorrect: true,
        },
        { text: "Reset and re-run, continuing the 168-h clock", isCorrect: false },
        { text: "Hand over to operations now and let them deal with the trip", isCorrect: false },
        { text: "Reduce the demonstration duration to 96 h so the trip falls outside the window", isCorrect: false },
      ],
    },
    {
      competencyName: "Installation & Commissioning",
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Chemical",
      stem: "A Duane reliability-growth slope of b = 0.05 during a commissioning program indicates a well-managed program in which root causes are being fixed.",
      whyCorrect:
        "FALSE. A Duane slope of b = 0.05 is far below the typical 0.1–0.3 range for well-managed programs; it indicates that fixes are not addressing root causes (symptomatic fixes only). The growth slope b is the management metric — a low b means the program is reset-and-rerunning rather than root-causing.",
      whyOthersWrong: [
        "TRUE — the trap; b = 0.05 is non-zero so it looks like growth, but it is well below the typical 0.1–0.3 range for a well-managed program and indicates symptomatic fixing.",
      ],
      explanation:
        "Duane slope b = 0.1–0.3 typical; b > 0.25 = strong growth; b < 0.1 = the program is not fixing root causes. b = 0.05 is a red flag, not an endorsement.",
      options: [
        { text: "False — b = 0.05 is well below the 0.1–0.3 typical range; it indicates root causes are not being fixed", isCorrect: true },
        { text: "True — a non-zero b indicates root-cause fixing", isCorrect: false },
      ],
    },
    {
      competencyName: "Installation & Commissioning",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "DecisionMaking",
      skillType: "Conceptual",
      scenario: "Power",
      stem: "A steam turbine SAT has passed (vibration ≤ 2.8 mm/s RMS, 24-h full-load run clean). The project manager asks to hand over immediately to recover schedule; the 168-h reliability demonstration has not been done. What is the reliability engineering best-practice response?",
      whyCorrect:
        "Hold the handover gate until the 168-h reliability demonstration run completes clean. The 168-h run is the gate that distinguishes commissioning-mode failures (root-caused and fixed) from operations-mode failures (deferred and corrupting the MTBF baseline).",
      whyOthersWrong: [
        "Hand over now and run the 168-h in service — operations then owns the asset during the failure window, and the baseline is corrupted.",
        "Skip the 168-h and rely on the SAT's 24-h run — the 24-h run gives MTBF_L ≈ 26 h, statistically thin; it does not demonstrate the absence of slow failure modes.",
        "Run the 168-h but reset-and-rerun any trip without root-cause — defers failures into operations, the most common commissioning mistake.",
      ],
      explanation:
        "The 168-h clean run is the handover gate; the schedule cost of holding it is at most a few weeks; the operational cost of skipping it is a corrupted baseline that takes months to recover.",
      options: [
        { text: "Hold the handover gate until the 168-h reliability demonstration run completes clean", isCorrect: true },
        { text: "Hand over now and run the 168-h in service with operations owning the asset", isCorrect: false },
        { text: "Skip the 168-h and rely on the SAT's 24-h run", isCorrect: false },
        { text: "Run the 168-h but reset-and-rerun any trip without root-cause", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Reliability & Maintainability
// ---------------------------------------------------------------------------

const LESSON_RELIABILITY_MAINTAINABILITY: RefLesson = {
  competencyName: "Reliability & Maintainability",
  slug: "mpr-reliability-maintainability",
  title: "Process RAM Engineering — RBDs, Availability Modeling & Redundancy",
  titleAr: "هندسة الموثوقية والقابلية للصيانة للعملية — مخططات الكتل، نمذجة التوافر والتكرار",
  order: 3,
  durationMin: 34,
  references: MPR_REFERENCE_TITLES,
  conceptIntroduction: `Reliability & Maintainability (R&M) is the third MPR competency — the quantitative engineering of process-level availability. Where Process Design applies RAM at the design stage to size and configure the asset, R&M is the standing competency that maintains, refines, and uses the RAM model throughout the asset lifecycle: re-running the model as failure data accrues, applying it to redundancy decisions, spares provisioning, maintenance-resource sizing, and asset-life extension. The competency covers Reliability Block Diagrams (series, parallel, k-of-n, standby), availability modeling (steady-state, mission, interval), and redundancy strategies (active, standby, voting, cascading). The CMRP Body of Knowledge treats R&M as the quantitative core of the MPR pillar — the engineer's fluency in moving from an RBD to a quantified availability, and in choosing the redundancy strategy that meets the availability target at minimum LCC, is the testable output. Ebeling's textbook develops the mathematics; Jardine & Tsang apply it to maintenance decisions.`,
  example: `Model a chemical-plant reactor-feed section with: 2 parallel feed pumps in 1oo2 active-parallel (each MTBF = 8,000 h, MTTR = 24 h), in series with a heat exchanger (MTBF = 30,000 h, MTTR = 48 h) and a control valve (MTBF = 25,000 h, MTTR = 12 h). Single-pump A = 8,000/8,024 = 0.99701. Parallel A = 1 − (1 − 0.99701)² = 1 − (0.00299)² = 0.99999106. Series with HX (A = 0.99840) and CV (A = 0.99952): A_total = 0.99999106 × 0.99840 × 0.99952 ≈ 0.99792 ≈ 99.79%. The model identifies the heat exchanger as the dominant contributor (largest single-block unavailability) — the design lever for the next iteration.`,
  keyFormulas: `Availability (single block): A = MTBF / (MTBF + MTTR) = μ / (λ + μ)
Series availability: A_series = Π A_i;  λ_series = Σ λ_i;  MTBF_series = 1 / Σ(1/MTBF_i)
Active-parallel (2 identical, 1oo2): A_parallel = 1 − (1−A)²
Active-parallel (n identical, koo-n): A_koon = Σ [C(n,j)·A^j·(1−A)^(n−j)] for j=k..n
Standby (1oo2, perfect switching, no standby failures): A_standby = (2λμ + μ²) / (2λ² + 2λμ + μ²)
Unavailability: U = 1 − A; series U ≈ Σ U_i (small-U approximation)
Reliability (exponential, parallel 1oo2): R_parallel(t) = 1 − (1 − e^(−λt))²
MTBF of 2-block active parallel (identical, exponential): MTBF_parallel = (3/(2λ)) = (3/2)·MTBF_single`,
  exercise: `You are the reliability engineer at a Power plant. A subsystem has 4 parallel feedwater pumps in a 3-of-4 (3oo4) configuration; each pump has MTBF = 18,000 h, MTTR = 48 h. (a) Compute the steady-state availability of the 3oo4 subsystem. (b) Compute the equivalent availability if the configuration is changed to 2oo4. (c) Identify the LCC trade-off (more redundancy = more capital but lower lost-production) for a 25-year asset life at 8% discount.`,
  sections: {
    learning_objectives: `- Construct an RBD for a multi-stage process (series, active-parallel, k-of-n, standby) from a PFD.
- Compute steady-state availability, mission reliability, and interval availability for the RBD.
- Distinguish active, standby, voting, and cascading redundancy strategies; choose the strategy that meets A_target at minimum LCC.
- Compute the unavailability of each block and identify the dominant contributor — the design lever.
- Apply the small-U approximation (U_series ≈ Σ U_i) for first-cut estimates and identify when it breaks down.
- Translate the RAM model into a spares-provisioning and maintenance-resource-sizing decision.`,
    prerequisites: `- Process Design (MPR competency 1) — the inherent-reliability baseline and RBD concepts.
- Installation & Commissioning (MPR competency 2) — the as-commissioned baseline data.
- Probability and statistics: the exponential and Weibull distributions; the Markov steady-state concept.
- Combinatorics for k-of-n calculations: C(n,k) = n! / (k! (n−k)!).
- Familiarity with the CMMS asset hierarchy (functional location → equipment → component) so the RBD mirrors the asset structure.`,
    introduction: `Reliability & Maintainability engineering is the quantitative core of the MPR pillar. Where Process Design uses RAM once at the design stage, R&M is the standing competency that owns the model throughout the asset lifecycle: the RBD is updated as failure data accrues, the availability target is revisited as the operating context changes (new feedstock, new production rate, new environmental constraints), and the redundancy strategy is reconsidered at every life-extension decision point.

The discipline rests on three formal tools. **(1) The Reliability Block Diagram** — the topology of the process. Series blocks (the system fails if any block fails), active-parallel blocks (the system survives if at least k of n blocks survive — k-of-n redundancy), standby blocks (a redundant block is held in reserve and switched in on failure of the primary), and voting blocks (a 2oo3 sensor subsystem requires at least 2 of 3 sensors to agree for the trip). The RBD is the engineer's mental model of the process; without it, availability numbers are not defensible. **(2) Availability modeling** — the steady-state (long-run probability the asset is up), mission (probability of surviving a specific mission time t), and interval (expected fraction of an interval the asset is up). The three metrics answer different questions: steady-state for production planning, mission for campaign operations, interval for SLA reporting. **(3) Redundancy strategies** — the choice between active (all blocks running; instantaneous failover), standby (redundant blocks held in reserve; switching required), voting (a 2oo3 logic for safety systems), and cascading (multi-level redundancy for high-consequence systems). Each strategy has a different MTBF, MTTR, capital cost, and complexity; the choice is governed by the availability target and the LCC.

ISO 55000:2014 frames R&M as the analytical engine under the asset-management plan: the AMP specifies availability targets; the R&M competency quantifies the design choices that meet them. The CMRP exam tests this competency because every maintenance and reliability engineer must be fluent in moving from an RBD to a quantified availability, in identifying the dominant contributor, and in choosing the redundancy strategy that meets the target at minimum LCC. Ebeling's textbook develops the mathematics (series, parallel, k-of-n, standby, voting); Jardine & Tsang apply it to maintenance decisions (spares provisioning, inspection optimization, replacement optimization).`,
    terminology: `- **Reliability Block Diagram (RBD)**: the logic topology (series, parallel, k-of-n, standby, voting) of a process.
- **Series blocks**: the system fails if any one block fails; A_series = Π A_i; λ_series = Σ λ_i.
- **Active-parallel blocks**: all redundant blocks are running; the system survives if at least k of n survive (k-of-n redundancy).
- **Standby redundancy**: a redundant block is held in reserve and switched in on failure of the primary; switching may be perfect or imperfect.
- **Voting blocks**: a 2oo3 sensor subsystem requires at least 2 of 3 sensors to agree; used in safety systems to suppress spurious trips.
- **Availability (steady-state)**: A = MTBF / (MTBF + MTTR) = μ / (λ + μ); long-run probability the asset is up.
- **Mission reliability**: R(t) = probability of surviving to time t; for series exponential, R_series(t) = e^(−λ_series · t).
- **Interval availability**: expected fraction of [0,T] the asset is up; for steady-state Markov, equal to A.
- **Unavailability**: U = 1 − A; for series with small U, U_series ≈ Σ U_i.
- **Dominant contributor**: the block whose U_i is largest; the design lever for the next iteration.
- **k-of-n redundancy**: the system survives if at least k of n identical blocks survive.
- **Standby switching**: perfect (no failure to switch) or imperfect (the switch or the standby can fail to take over).
- **Common-cause failure (CCF)**: a single event that defeats multiple redundant blocks simultaneously (e.g., a common power supply, a common environmental insult); modeled with a β-factor (the fraction of failures that are common-cause).`,
    detailed_explanation: `**Series availability.** For n blocks in series, the system is up only when all blocks are up. With statistical independence, A_series = Π A_i. With exponential failure distributions, λ_series = Σ λ_i, so MTBF_series = 1 / Σ(1/MTBF_i). The dominant contributor is the block with the smallest MTBF (the largest λ). The small-U approximation (U_series ≈ Σ U_i when each U_i is small) is a useful first-cut: a series of three blocks each with A = 0.999 has U ≈ 0.003 (A ≈ 0.997), as does the exact product 0.999³ = 0.997003 — they agree to four decimals. The approximation breaks down when U is not small (a block with A = 0.95 makes the small-U approximation error of order 0.5%).

**Active-parallel availability (k-of-n).** For n identical blocks in active-parallel with at-least-k-required, the system survives if at least k blocks survive. The probability is the binomial sum: A_koon = Σ over j=k to n of [C(n,j) · A^j · (1−A)^(n−j)]. For 1oo2 (k=1, n=2): A = 1 − (1−A)². For 2oo3 (k=2, n=3): A = 3A² − 2A³. For 3oo4: A = 4A³ − 3A⁴. The 2oo3 voting configuration is the standard safety-instrumented-system (SIS) architecture: it requires 2 of 3 sensors to agree for a trip, which suppresses both dangerous failures (a single failed sensor cannot prevent a needed trip) and spurious trips (a single failed sensor cannot initiate a false trip). The 2oo3 voting is a fundamental reliability / safety trade-off: it raises both reliability (against spurious trip) and safety (against dangerous failure).

**Standby redundancy.** A standby block is held in reserve and switched in on failure of the primary. The mathematics is more complex because the standby may or may not fail while in reserve, and the switching may be perfect or imperfect. For 1oo2 standby with perfect switching, no standby failures, identical blocks: A_standby = (2λμ + μ²) / (2λ² + 2λμ + μ²). With A = μ/(λ+μ) and ρ = λ/μ = MTTR/MTBF, this becomes A_standby = (1 + 2ρ) / (1 + 2ρ + 2ρ²). For ρ small (high availability), A_standby ≈ 1 − 2ρ²/2 = 1 − ρ² — twice as good as active-parallel 1oo2 (1 − ρ² vs 1 − 2ρ + ρ² ≈ 1 − 2ρ). In practice, the standby advantage is offset by switching failure and by standby failure-while-in-reserve (the standby can seize from corrosion, lubrication dry-out, bearing brinelling). The active-parallel configuration is the more common choice for high-availability processes.

**Common-cause failure (CCF).** A single event can defeat multiple redundant blocks simultaneously: a common power supply fails, a common environmental insult (fire, flood, dust) disables both blocks, a common firmware bug crashes both controllers. The β-factor model: the total failure rate is split into an independent portion (1−β)λ and a common-cause portion βλ; the independent portion is subject to redundancy, the common-cause portion is not. For 1oo2 active-parallel with β = 0.1 (10% of failures are common-cause), the effective system failure rate is λ_system = (1−β)²λ²/(2μ) + βλ ≈ βλ for small λ — the common-cause term dominates. A redundancy design that ignores CCF over-estimates availability by orders of magnitude; the β-factor is the design parameter that brings the model back to reality.

**Reliability vs Availability.** Reliability R(t) is a probability — the asset survives to time t. Availability A is a long-run fraction — the asset is up. A high-A system can have low R(t) (many short failures); a high-R(t) system has high A. Mission-critical systems (a satellite, a campaign chemical process) optimize R(t_campaign); production-continuous systems (a refinery, a power plant) optimize A. The two metrics must be computed separately; the engineer's first question is which one is the controlling metric for the asset under analysis.

**The dominant-contributor principle.** For a series RBD, the block with the largest U_i (= 1 − A_i) contributes most to system unavailability; the design lever is to reduce that block's U. For a parallel RBD, the system is robust against individual block failures but vulnerable to common-cause — the design lever is to reduce CCF (separate power supplies, separate environmental zones, diverse-vendor controllers). The R&M engineer's recurring task is to recompute the dominant contributor as failure data accrues and to redesign the dominant block before it dominates system unavailability.`,
    core_principles: `- **The RBD is the engineer's mental model.** Without it, availability numbers are not defensible.
- **Series: weakest link dominates; parallel: common-cause dominates.** Different redundancy strategies have different failure modes.
- **The dominant contributor is the design lever.** Reduce U of the dominant block first.
- **Reliability and Availability answer different questions.** Mission-critical → R(t); production-continuous → A. Compute the right one.
- **Redundancy is not free.** Each parallel block adds capital, complexity, and common-cause risk; the LCC must justify it.
- **CCF must be modeled.** A redundancy design without a β-factor over-estimates availability by orders of magnitude.`,
    components: `- **RBD topology**: series, active-parallel (k-of-n), standby, voting, nested (mixed series-parallel).
- **Per-block failure rate λ and repair rate μ**: from OREDA, IEEE 493, vendor data, plant CMMS history.
- **Availability formulas**: A = μ/(λ+μ); A_series = Π A_i; A_koon = binomial sum; A_standby = (2λμ+μ²)/(2λ²+2λμ+μ²).
- **Reliability formulas**: R(t) = e^(-λt); R_series(t) = e^(-λ_series·t); R_parallel(t) = 1 − (1 − e^(-λt))^n.
- **β-factor model**: total λ split into (1−β)λ independent and βλ common-cause.
- **RAM simulator**: Monte Carlo propagation of distributions through the RBD; outputs A distribution, R(t), criticality.
- **LCC model**: capital + O&M + maintenance + lost-production + disposal, NPV-discounted.`,
    process: `1. **Build the RBD** from the PFD: identify the function (what the system must do), the blocks (component-level entities with λ and μ), and the topology (series, parallel, k-of-n, standby, voting).
2. **Assign failure-rate and repair-rate data** to each block (OREDA / IEEE 493 / vendor / plant history).
3. **Compute single-block availability** A_i = MTBF_i / (MTBF_i + MTTR_i).
4. **Compute the system availability** for the topology:
   - Series: A_series = Π A_i.
   - Active-parallel (koo-n): A_koon = Σ_{j=k}^n C(n,j) · A^j · (1−A)^(n−j).
   - Standby (1oo2, perfect switching): A_standby = (2λμ + μ²) / (2λ² + 2λμ + μ²).
5. **Compute the dominant contributor**: per-block unavailability U_i = 1 − A_i; the largest U_i is the design lever.
6. **Add the β-factor**: model common-cause; the system availability is re-computed with the common-cause term added.
7. **Compute the mission reliability** R(t) if the asset is mission-critical (campaign processes, batch operations).
8. **Run Monte Carlo** for the availability distribution and for sensitivity analysis (which λ matters most?).
9. **Compute the LCC** for each candidate redundancy strategy; select the minimum-LCC meeting A_target.
10. **Update the model** annually as failure data accrues; the RBD is a living document, not a one-time artifact.`,
    formula_calculation: `- **Availability (single block, Markov steady-state)**:
  A = MTBF / (MTBF + MTTR) = μ / (λ + μ)
  Variables: MTBF [h] = 1/λ; MTTR [h] = 1/μ; λ [failures/h]; μ [repairs/h]. Assumption: exponential failure & repair; one operating state, one repair state. Interpretation: long-run probability the asset is up.
- **Series availability**:
  A_series = Π A_i;  λ_series = Σ λ_i;  MTBF_series = 1 / Σ(1/MTBF_i)
  Variables: A_i per block; λ_i per block. Assumption: statistical independence. Interpretation: system fails when any block fails.
- **Active-parallel 1oo2 (identical blocks)**:
  A_parallel = 1 − (1 − A)²
  Variables: A per block. Assumption: both blocks running; independent failures. Interpretation: system fails only if both blocks fail simultaneously.
- **Active-parallel koo-n (identical blocks)**:
  A_koon = Σ_{j=k}^{n} C(n,j) · A^j · (1−A)^(n−j)
  Variables: k (minimum required), n (total blocks), A per block, C(n,j) = n! / (j! (n−j)!). Interpretation: system survives if at least k of n survive.
- **Standby 1oo2 (perfect switching, no standby failures)**:
  A_standby = (2λμ + μ²) / (2λ² + 2λμ + μ²)
  Variables: λ [failures/h], μ [repairs/h]. Assumption: perfect switching, no failures in reserve. Interpretation: redundancy gain over single block; ≈ 1 − ρ² for ρ = λ/μ small.
- **Unavailability**:
  U = 1 − A;  U_series ≈ Σ U_i (small-U approximation)
  Variables: U_i per block. Interpretation: first-cut estimate; breaks down when U_i is not small (< 0.99).
- **Common-cause failure (β-factor)**:
  λ_independent = (1 − β)λ;  λ_CCF = βλ;  λ_system ≈ βλ + (1−β)²λ² / (2μ) (for 1oo2 active-parallel)
  Variables: β = fraction of failures that are common-cause (typical 0.05–0.15). Interpretation: CCF dominates system failure rate when β is non-trivial.
- **Mission reliability (series, exponential)**:
  R_series(t) = e^(−λ_series · t) = e^(−t / MTBF_series)
  Variables: t [h] mission time. Interpretation: probability of surviving to time t without any failure.
- **MTBF of 2-block active-parallel (identical, exponential)**:
  MTBF_parallel = 3 / (2λ) = (3/2) · MTBF_single
  Variables: λ = 1/MTBF_single. Interpretation: redundancy does NOT double MTBF — for identical exponential blocks, MTBF_parallel = 1.5 × single, not 2×.`,
    worked_example: `**Problem.** A chemical-plant reactor-feed section has the following RBD:
  - Two parallel feed pumps (1oo2 active-parallel, identical): each MTBF = 8,000 h, MTTR = 24 h.
  - In series with a heat exchanger: MTBF = 30,000 h, MTTR = 48 h.
  - In series with a control valve: MTBF = 25,000 h, MTTR = 12 h.

Compute (a) the steady-state availability of the 1oo2 parallel pump subsystem, (b) the steady-state availability of the series combination, (c) the dominant contributor, and (d) the system availability if a common-cause failure β = 0.10 is added to the pump subsystem.

**Step 1 — Single-block availability per pump.**
  A_pump = MTBF / (MTBF + MTTR) = 8,000 / (8,000 + 24) = 8,000 / 8,024 = 0.99701.
  λ_pump = 1/8,000 = 0.0001250 /h.  μ_pump = 1/24 = 0.0417 /h.  ρ = λ/μ = 0.0030.

**Step 2 — 1oo2 active-parallel availability (pump subsystem).**
  A_parallel = 1 − (1 − A_pump)² = 1 − (1 − 0.99701)² = 1 − (0.00299)² = 1 − 8.94×10^−6 = 0.99999106.
  **Pump subsystem A ≈ 0.99999106 (≈ 99.9991%).**
  Note: MTBF_parallel = 3/(2λ) = 3/(2 × 0.0001250) = 12,000 h — only 1.5× single, not 2× (Ebeling §6.4).

**Step 3 — Single-block availability of the heat exchanger and the control valve.**
  A_HX = 30,000 / (30,000 + 48) = 30,000 / 30,048 = 0.99840.
  A_CV = 25,000 / (25,000 + 12) = 25,000 / 25,012 = 0.99952.

**Step 4 — Series availability (pump subsystem + HX + CV).**
  A_total = A_parallel × A_HX × A_CV = 0.99999106 × 0.99840 × 0.99952
        = 0.99999106 × 0.99840 = 0.99839131  (round to 5 decimal)
        × 0.99952 = 0.99791319
  **A_total ≈ 0.99791 (≈ 99.791%).**

**Step 5 — Dominant contributor.** Per-block unavailabilities:
  U_pump_subsystem = 1 − 0.99999106 = 8.94×10^−6.
  U_HX = 1 − 0.99840 = 1.60×10^−3.
  U_CV = 1 − 0.99952 = 4.80×10^−4.
  **U_HX (1.60×10^−3) is the dominant contributor** — 77% of U_total (1.60+0.48+0.009 ≈ 2.09×10^−3, U_HX/U_total ≈ 0.766).
  Design lever: reduce the heat-exchanger failure rate (back-washable bundle, side-stream filter, upgraded metallurgy) or reduce its MTTR (quick-closure heads, isolation valves, spare bundle on the shelf).

**Step 6 — Common-cause failure (β = 0.10) added to the pump subsystem.** With β = 0.10, 10% of pump failures are common-cause (defeat both pumps simultaneously — common power supply, common environmental insult).
  λ_CCF = β · λ_pump = 0.10 × 0.0001250 = 1.25×10^−5 /h.
  A_CCF = MTBF_CCF / (MTBF_CCF + MTTR_CCF) where MTBF_CCF = 1/λ_CCF = 80,000 h, MTTR_CCF = 24 h (assuming the repair is the same).
  A_CCF = 80,000 / (80,000 + 24) = 0.99970.
  New pump subsystem availability (in series with the common-cause "block"):
  A_pump_subsystem_with_CCF = A_parallel × A_CCF = 0.99999106 × 0.99970 = 0.99969133.
  **New A_total = 0.99969133 × 0.99840 × 0.99952 ≈ 0.997614 (≈ 99.761%).**
  The CCF term reduces system availability from 99.791% to 99.761% — a 0.03-point drop; the HX remains the dominant contributor (U_HX/U_total ≈ 0.76 now).

**Step 7 — Mission reliability (if the asset must survive a 1-year campaign = 8,760 h).**
  Without redundancy: λ_series (HX + CV alone, ignoring pump subsystem CCF) ≈ 1/30,000 + 1/25,000 + 1.25×10^−5 = 3.33×10^−5 + 4.00×10^−5 + 1.25×10^−5 = 8.58×10^−5 /h.
  R(8,760) = e^(−8,760 × 8.58×10^−5) = e^(−0.7516) ≈ 0.4717 (47%).
  **Mission reliability ≈ 47%** — the asset will fail during a 1-year campaign with probability 53%. If the process is campaign-critical, redesign is required (e.g., add a parallel HX).

**Result.** The 1oo2 active-parallel pump subsystem gives A ≈ 0.999991; the series combination with HX and CV gives **A_total ≈ 99.79%**. The dominant contributor is the **heat exchanger** (U_HX = 1.60×10^−3, 77% of U_total). Adding β = 0.10 CCF to the pump subsystem reduces A_total to **99.76%** (the CCF term is non-negligible but does not displace the HX as the dominant contributor). Mission reliability over a 1-year campaign is **≈ 47%** — campaign redesign (parallel HX) is required if the process is mission-critical. The design lever is the heat exchanger (reduce U_HX); the CCF lever is to separate power supplies and environmental zones between the two pumps.`,
    industrial_example: `**Chemical — reactor-feed section.** The worked example above is the canonical chemical-plant scenario: 1oo2 parallel pumps in series with a heat exchanger and a control valve. The chemical-specific design lever is the heat exchanger — a back-washable bundle (e.g., plate-and-frame with clean-in-place) or a side-stream filter on the cooling-water side reduces U_HX materially.

**Oil & Gas — subsea gas-injection.** A subsea 2x100% gas-injection pump with a single-line pipeline. Each pump MTBF = 6,000 h, MTTR = 600 h. Single-pump A = 6,000/6,600 = 0.909. Parallel A = 1 − (1 − 0.909)² = 1 − 0.0083 = 0.9917. Pipeline A = 0.999 (single line, no redundancy). System A = 0.9917 × 0.999 ≈ 0.9907. The MTTR of 600 h (rig-mobilization) dominates U; the design-for-maintainability lever (intervention-friendly pulling tabs, ROV-friendly connections) is the LCC-positive choice.

**Power — 3×50% feedwater.** A 3×50% feedwater-pump configuration (any 2 of 3 in service meets full load = 2oo3). Each pump MTBF = 18,000 h, MTTR = 48 h, A = 0.99734. A_2oo3 = 3A² − 2A³ = 3 × 0.99734² − 2 × 0.99734³ = 2.99204 − 1.98411 = 1.00793... (error — let's recompute: 3A²(1−2A/3) — better: A_2oo3 = 3·0.99734² − 2·0.99734³ = 3 × 0.994687 − 2 × 0.992057 = 2.98406 − 1.98411 = 0.99995). **A_2oo3 ≈ 0.99995** — the 3×50% design trades +1 pump capital for materially higher availability and zero transition risk on loss of one pump.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** A 1,000-MW combined-cycle power plant is in its 5th year of operation. The original RAM model (from the design stage) had the gas-turbine lube-oil skid at A = 0.9990 (single skid per GT, 4 GTs total). After 5 years, the operational MTBF is 8,200 h (vs the design MTBF of 12,000 h — a gap of 32%). The reliability engineer re-runs the RAM model with the operational data and finds the lube-oil skid's A has dropped to 0.9970 (vs 0.9990 design) — the dominant contributor to plant unavailability.

Two redesign alternatives: (A) 2×100% active-parallel lube-oil skids (capital $1.2 M × 4 = $4.8 M); (B) 2×100% with diverse-vendor controllers (β = 0.05 vs 0.15 for same-vendor) at +$0.5 M premium ($5.3 M total).

Re-run the RAM:
  - (A) with β = 0.15: A_skid_subsystem = (1 − (1−0.9970)²) × (1 − 0.15 × 0.0001220) ≈ 0.99999 × 0.99998 ≈ 0.99997.
  - (B) with β = 0.05: A_skid_subsystem = (1 − (1−0.9970)²) × (1 − 0.05 × 0.0001220) ≈ 0.99999 × 0.999994 ≈ 0.99998.

The two alternatives give nearly identical availability; (A) is cheaper; but (B) reduces CCF exposure — for high-consequence assets (the GT is $40 M), the $0.5 M diverse-vendor premium is justified. The case demonstrates that the β-factor is the lever that distinguishes a credible redundancy design from an over-optimistic one. Operations selects (B); the LCC pays back the $5.3 M via avoided lost-production over 3 years (one GT trip = $0.4 M in lost production; 4 avoided trips/year × 3 years × $0.4 M = $4.8 M, plus the lower CCF probability avoids the catastrophic common-cause event whose insurance value is much larger).`,
    visual_explanation: `- **RBD diagram (1oo2 active-parallel + series)**: two rectangles (Pump A | Pump B) side by side, joined at common input/output → series with HX → series with CV. The pump block is internally a 1oo2 parallel.
- **k-of-n binomial curve**: x = per-block A, y = system A; curves for 1oo2, 2oo3, 3oo4 — the 2oo3 curve is the SIS sweet spot.
- **β-factor impact on parallel availability**: a curve showing system availability vs β for 1oo2 — the curve is steep at β > 0.10.
- **Dominant-contributor Pareto**: per-block U in descending order; the leftmost bar is the design lever.
- **Mission reliability vs steady-state availability**: two curves over time; the A line is flat at 0.998, the R(t) line decays exponentially — the campaign-mission trade-off.`,
    simulation_opportunity: `A RAM simulator: the learner is given an RBD (series + 1oo2 parallel + HX + CV) and sliders for per-block MTBF, MTTR, β-factor, and configuration (1oo2, 2oo3, 3oo4). The simulator computes A_total, R(8,760 h), U_per_block, dominant contributor. A second tier adds LCC: the learner picks the configuration that meets A_target at minimum LCC. A third tier adds Monte Carlo: the simulator draws per-block lifetimes and repairs 10,000 times and reports the realized availability distribution.`,
    common_mistakes: `- **Assuming redundancy doubles MTBF**: for identical exponential blocks, MTBF_parallel = 1.5 × MTBF_single, not 2× (Ebeling §6.4).
- **Ignoring the β-factor**: a redundancy design without a CCF model over-estimates availability by orders of magnitude.
- **Confusing reliability with availability**: a high-A system can have low R(t) (many short failures); mission-critical systems optimize R(t).
- **Optimizing availability without considering LCC**: redundancy is not free; each parallel block adds capital, complexity, and CCF.
- **Mis-identifying the dominant contributor**: adding redundancy to non-dominant blocks moves A marginally.
- **Using the small-U approximation when U is not small**: breaks down below A = 0.99 per block.
- **Treating the RBD as a one-time artifact**: the model must be updated as failure data accrues.`,
    limitations: `- The Markov steady-state assumption (constant λ, μ) breaks for wear-out (β > 1 in Weibull) — the model over-estimates late-life availability.
- The β-factor is hard to estimate from data; values 0.05–0.15 are typical but plant-specific.
- Standby switching is rarely perfect; the model assumption (perfect switching, no standby failures) over-estimates the standby advantage.
- Mission reliability is computed per-block in series; for parallel configurations, the joint distribution is harder.
- Monte Carlo simulator outputs are distribution-dependent; rare-event tail behavior is fragile.
- LCC depends on the contested inputs (r, C_L); the redundancy decision can flip with r = 8% vs 12%.`,
    comparison: `- **Series vs Parallel**: series — weakest link dominates, no redundancy, lowest capital. Parallel — common-cause dominates, redundancy gain, higher capital + complexity.
- **Active vs Standby**: active — all blocks running, instantaneous failover, simple. Standby — reserve block held cold, switching required, switching failure risk.
- **k-of-n vs 1oo1**: k-of-n buys availability at the cost of n − k redundant blocks; 1oo1 has no redundancy gain.
- **Voting (2oo3) vs Active-parallel (1oo3)**: voting suppresses both spurious trips and dangerous failures; active-parallel 1oo3 maximizes availability but is unsafe against a dangerous sensor failure. The choice is safety-system-specific.
- **Reliability (R(t)) vs Availability (A)**: R(t) — survival probability to time t; A — long-run fraction up. Mission-critical → R(t); production-continuous → A.`,
    practical_application: `- **At design**: build the RBD, compute A_total, identify the dominant contributor, design it out.
- **Annually in service**: re-run the RAM with operational failure data; compare A_operational to A_inherent; investigate the gap.
- **At life-extension decisions**: re-run the RAM with the projected MTBF/MTTR for the extended life; decide whether the redundancy strategy needs to change.
- **At spares provisioning**: use the dominant-contributor analysis to set spares-stock policy (more spares for dominant blocks, ROP based on MTTR and lead-time).
- **At maintenance-resource sizing**: use the MTTR distribution to size the maintenance crew (skill mix, headcount).
- **At the safety-system design**: use the 2oo3 voting configuration to balance reliability against safety; document the SIL (Safety Integrity Level) justification.`,
    decision_scenario: `You are the reliability engineer at a Power plant. The 3×50% feedwater-pump configuration has A = 0.99995. A new regulatory requirement sets the boiler-feedwater reliability target at A ≥ 0.99999. Two alternatives:

  (A) Add a 4th pump (4×50%, 2oo4 configuration): capital +$2.8 M; A_2oo4 = 4A²(1 + A² − A) ≈ 0.99999 (with the small gain over 3×50%).
  (B) Upgrade the heat exchanger (parallel HX, 1oo2): capital +$3.5 M; reduces U_HX from 1.6×10^−3 to 1×10^−6; A_total rises to ≈ 0.99996.

The RAM re-run shows (B) actually fails the 0.99999 target (the HX is not the dominant contributor any more after the pump upgrade — the new dominant contributor is the deaerator at U = 4×10^−5). (A) meets the 0.99999 target. Decision: (A). The lesson: the dominant-contributor analysis is iterative — after each redesign, the next-dominant contributor emerges. A redesign that targets the wrong block wastes capital without meeting the target.`,
    practice_questions: `- Compute the availability of a 2oo3 voting configuration with per-sensor A = 0.999. *(Answer: 3 × 0.999² − 2 × 0.999³ = 2.994003 − 1.994010 ≈ 0.999993.)*
- State the small-U approximation and its limit of validity. *(Answer: U_series ≈ Σ U_i; valid when each U_i < 0.01.)*
- For identical exponential blocks, what is MTBF_parallel (1oo2) in units of MTBF_single? *(Answer: 1.5 × MTBF_single, not 2×.)*
- Give one example each of an active-parallel, standby, and voting redundancy configuration in a process plant.
- State the β-factor model and explain why it dominates 1oo2 system failure rate when β is non-trivial.
- Distinguish mission reliability R(t) from steady-state availability A; give an example asset for which each is the controlling metric.`,
    certification_questions: `The CMRP exam tests Reliability & Maintainability as the third MPR competency. SMRP-aligned sample prompts:
(a) Compute A_total for an RBD with series + 1oo2 parallel + series blocks.
(b) Compute the 2oo3 voting availability (3A² − 2A³).
(c) Recognize that MTBF_parallel (identical exponential, 1oo2) = 1.5 × MTBF_single, not 2×.
(d) Recognize that the β-factor (CCF) dominates 1oo2 system failure rate when β is non-trivial.
The questions in this lesson's question bank are aligned to these R&M competencies.`,
    summary: `Reliability & Maintainability engineering is the quantitative core of the MPR pillar. The RBD, the availability formulas (series, parallel, k-of-n, standby), the β-factor model of common-cause failure, and the LCC decision are the engineer's tools. The recurring task is to re-run the RAM model with operational data, identify the dominant contributor, and redesign the dominant block before it dominates system unavailability. The CMRP exam tests the engineer's fluency in computing availability for mixed series/parallel RBDs, recognizing the limits of redundancy (1.5× not 2× MTBF, CCF dominating with non-trivial β), and choosing the redundancy strategy that meets the target at minimum LCC. The output — the RAM model and the dominant-contributor Pareto — is the recurring deliverable that feeds spares provisioning, maintenance-resource sizing, and life-extension decisions.`,
    key_takeaways: `- A_series = Π A_i; λ_series = Σ λ_i; MTBF_series = 1/Σ(1/MTBF_i).
- A_1oo2 = 1 − (1−A)²; A_2oo3 = 3A² − 2A³; A_koon = Σ C(n,j)·A^j·(1−A)^(n−j).
- MTBF_parallel (1oo2 identical, exponential) = 1.5 × MTBF_single, NOT 2×.
- CCF (β-factor) dominates 1oo2 system failure rate when β is non-trivial (typical 0.05–0.15).
- The dominant contributor is the design lever; redesign the largest-U block first.
- Reliability (R(t)) ≠ Availability (A); mission-critical optimizes R(t), production-continuous optimizes A.`,
    references: `- SMRP. *CMRP Body of Knowledge — Manufacturing Process Reliability pillar: Reliability & Maintainability.*
- SMRP. *CMRP Exam Outline.*
- ISO 55000:2014 — asset-management plan (availability targets).
- Mobley, R. K. (2008). *Maintenance Engineering Handbook* (7th ed.). McGraw-Hill. §3 (Reliability Engineering).
- Campbell, J. D. & Jardine, A. K. S. (2001). *Maintenance Strategy*. Productivity Press. Ch. 4 (RAM and asset criticality).
- Ebeling, C. E. (2010). *An Introduction to Reliability and Maintainability Engineering* (2nd ed.). Waveland. Ch. 2 (system reliability), Ch. 6 (redundancy), Ch. 7 (common-cause), Ch. 8 (maintainability).
- Jardine, A. K. S. & Tsang, A. H. C. (2017). *Maintenance, Replacement, and Reliability* (2nd ed.). CRC. Ch. 5 (spares provisioning), Ch. 6 (inspection optimization).`,
  },
  knowledgeObject: {
    title: "Reliability & Maintainability — RBDs, availability modeling, redundancy",
    domain: "Manufacturing Process Reliability",
    competency: "Reliability & Maintainability",
    topic: "RAM engineering",
    concept: "Process availability modeling",
    body: {
      definitions: [
        "RBD: logic topology of a process (series, active-parallel, k-of-n, standby, voting).",
        "Series: A_series = Π A_i; λ_series = Σ λ_i; MTBF_series = 1/Σ(1/MTBF_i).",
        "Active-parallel koo-n: A_koon = Σ_{j=k}^n C(n,j)·A^j·(1−A)^(n−j).",
        "Standby 1oo2 (perfect switching, no reserve failures): A = (2λμ + μ²)/(2λ² + 2λμ + μ²).",
        "Voting 2oo3: requires 2 of 3 sensors to agree for the trip; suppresses both spurious trips and dangerous failures.",
        "Availability (steady-state): A = MTBF/(MTBF + MTTR) = μ/(λ + μ).",
        "Unavailability: U = 1 − A; small-U approximation: U_series ≈ Σ U_i.",
        "Mission reliability: R(t) = e^(−λt); R_series(t) = e^(−λ_series · t).",
        "Common-cause failure (CCF): single event defeats multiple redundant blocks; β-factor model: β fraction common-cause.",
        "Dominant contributor: block with largest U_i; the design lever.",
      ],
      principles: [
        "The RBD is the engineer's mental model; without it, availability is not defensible.",
        "Series: weakest link dominates; parallel: common-cause dominates.",
        "The dominant contributor is the design lever — reduce U of the largest-U block first.",
        "Reliability (R(t)) ≠ Availability (A); mission-critical → R(t), production-continuous → A.",
        "Redundancy is not free: capital + complexity + CCF; LCC must justify it.",
        "CCF must be modeled (β-factor); without it, availability is over-estimated by orders of magnitude.",
      ],
      components: [
        "RBD topology (series, active-parallel, k-of-n, standby, voting, nested mixed).",
        "Per-block λ and μ from OREDA / IEEE 493 / vendor / plant CMMS.",
        "Availability formulas (series, parallel, k-of-n, standby).",
        "Reliability formulas (exponential, parallel 1 − (1 − e^−λt)^n).",
        "β-factor CCF model.",
        "RAM simulator (Monte Carlo over RBD).",
        "LCC model.",
      ],
      mechanism: [
        "PFD → RBD with λ,μ per block → A_single = μ/(λ+μ) → A_topology (series/parallel/standby) → β-factor added → R(t_campaign) → dominant contributor → redesign → LCC → annual update with operational data.",
      ],
      process: [
        "1. Build the RBD from the PFD.",
        "2. Assign λ, μ per block.",
        "3. Compute single-block A_i = MTBF/(MTBF+MTTR).",
        "4. Compute topology availability (series/parallel/k-of-n/standby).",
        "5. Compute the dominant contributor (largest U_i).",
        "6. Add the β-factor (common-cause).",
        "7. Compute mission reliability R(t) if mission-critical.",
        "8. Run Monte Carlo for sensitivity.",
        "9. Compute LCC for each candidate redundancy strategy; select minimum-LCC meeting A_target.",
        "10. Update annually with operational failure data.",
      ],
      formulas: [
        "A = MTBF/(MTBF + MTTR) = μ/(λ+μ).",
        "A_series = Π A_i; λ_series = Σ λ_i; MTBF_series = 1/Σ(1/MTBF_i).",
        "A_1oo2 = 1 − (1−A)².",
        "A_koon = Σ_{j=k}^n C(n,j)·A^j·(1−A)^(n−j).",
        "A_standby (1oo2 perfect) = (2λμ + μ²)/(2λ² + 2λμ + μ²).",
        "U = 1 − A; U_series ≈ Σ U_i (small-U).",
        "β-factor: λ_indep = (1−β)λ; λ_CCF = βλ; λ_sys ≈ βλ + (1−β)²λ²/(2μ) for 1oo2.",
        "R_series(t) = e^(−λ_series·t).",
        "MTBF_parallel (1oo2 identical exp) = 3/(2λ) = 1.5 × MTBF_single.",
      ],
      metrics: [
        "System availability A_total (steady-state).",
        "Mission reliability R(t_campaign).",
        "Dominant contributor's share of U_total (%).",
        "β-factor (typical 0.05–0.15).",
        "MTBF_parallel / MTBF_single (should be ≤ 1.5 for 1oo2 identical, exponential).",
        "LCC NPV per redundancy strategy.",
      ],
      examples: [
        "Chemical reactor-feed: 1oo2 parallel pumps (A=0.9970) in series with HX (A=0.9984) and CV (A=0.9995); A_total ≈ 0.99791.",
        "Subsea 2x100% gas injection: pump A=0.909, parallel A=0.9917, pipeline A=0.999; A_total ≈ 0.9907.",
        "Power 3×50% feedwater (2oo3): per-pump A=0.99734; A_2oo3 = 3A² − 2A³ ≈ 0.99995.",
      ],
      industrial_examples: [
        "Chemical — 1oo2 parallel pumps + HX + CV: dominant contributor is HX; design lever is back-washable bundle / side-stream filter.",
        "Oil & Gas — subsea 2x100% + single pipeline: MTTR=600 h dominates U; design-for-maintainability lever.",
        "Power — 3×50% feedwater (2oo3): trades +1 pump capital for materially higher A and zero transition risk.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. 1,000-MW combined-cycle, year 5. Operational MTBF = 8,200 h vs design 12,000 h (32% gap). GT lube-oil skid A dropped from 0.9990 to 0.9970 (now dominant contributor). Alternatives: (A) 2×100% same-vendor (β=0.15) at $4.8 M; (B) 2×100% diverse-vendor (β=0.05) at $5.3 M. RAM re-run shows nearly identical availability, but (B) reduces CCF exposure; selected (B) for high-consequence asset ($40 M GT). Pays back via avoided lost-production over 3 years + reduced catastrophic-event insurance value.",
      ],
      common_errors: [
        "Assuming redundancy doubles MTBF (1.5× not 2× for identical exponential).",
        "Ignoring the β-factor (CCF) — over-estimates availability by orders of magnitude.",
        "Confusing reliability with availability (mission-critical optimized wrong).",
        "Optimizing availability without LCC (redundancy not free).",
        "Mis-identifying the dominant contributor (redundancy added to non-dominant block — A barely moves).",
        "Using small-U approximation when U is not small (below A=0.99 per block).",
        "Treating the RBD as a one-time artifact (not updated with operational data).",
      ],
      limitations: [
        "Markov steady-state breaks for wear-out (β > 1 Weibull) — over-estimates late-life A.",
        "β-factor hard to estimate from data; 0.05–0.15 typical but plant-specific.",
        "Standby switching rarely perfect — model over-estimates the standby advantage.",
        "Mission reliability for parallel configurations requires joint distributions.",
        "Monte Carlo tail behavior is fragile for rare-event analysis.",
        "LCC redundancy decision can flip with r = 8% vs 12%.",
      ],
      best_practices: [
        "Always model the β-factor — never publish a redundancy availability without CCF.",
        "Re-run the RAM annually with operational data; investigate the operational/inherent gap.",
        "Target the dominant contributor first — Pareto the per-block U.",
        "Compute R(t_campaign) for mission-critical assets; do not rely on A alone.",
        "Document the SIL justification for safety-system voting configurations.",
        "Use Monte Carlo for sensitivity, not just point estimates.",
        "Treat the RBD as a living document, not a one-time artifact.",
      ],
      related_concepts: [
        "Process Design (uses RAM at design — feeds R&M baseline).",
        "Installation & Commissioning (verifies the baseline at handover).",
        "Maintenance Technologies (operates the P-F interval in service).",
        "Equipment Reliability (equipment-level failure analysis — feeds per-block λ, μ).",
        "Work Management (measures operational A against the inherent baseline).",
        "Safety Instrumented Systems (SIS) — 2oo3 voting, SIL calculation.",
      ],
      prerequisites: [
        "Process Design & Installation & Commissioning (MPR 1, 2).",
        "Probability & statistics: exponential, Weibull, Markov steady-state.",
        "Combinatorics for k-of-n (C(n,k) = n!/(k! (n−k)!)).",
        "CMMS asset hierarchy (functional location → equipment → component).",
      ],
      references: [
        "SMRP CMRP BOK — MPR pillar: Reliability & Maintainability.",
        "SMRP CMRP Exam Outline.",
        "ISO 55000:2014 — asset-management plan (availability targets).",
        "Mobley (2008), Maintenance Engineering Handbook, §3.",
        "Campbell & Jardine (2001), Maintenance Strategy, Ch. 4.",
        "Ebeling (2010), Reliability and Maintainability Engineering, Ch. 2, 6, 7, 8.",
        "Jardine & Tsang (2017), Maintenance, Replacement, and Reliability, Ch. 5, 6.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Reliability & Maintainability",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Chemical",
      stem: "Two identical centrifugal pumps operate in a 1oo2 active-parallel configuration. Each pump has MTBF = 8,000 h and MTTR = 24 h. What is the steady-state availability of the 1oo2 subsystem?",
      whyCorrect:
        "Single-pump A = MTBF/(MTBF+MTTR) = 8,000/(8,000+24) = 0.99701. For 1oo2 active-parallel: A = 1 − (1 − A)² = 1 − (1 − 0.99701)² = 1 − (0.00299)² = 1 − 8.94×10⁻⁶ ≈ 0.99999106.",
      whyOthersWrong: [
        "0.99701 — this is the single-pump availability, not the 1oo2 subsystem; the parallel redundancy gain is missing.",
        "0.99403 — this is the product of two single-pump availabilities (A×A), which is the wrong formula for parallel — that's the series formula.",
        "1.0 — the parallel availability is very high but not exactly 1; the correct value is 0.99999106, demonstrating that both pumps would have to fail simultaneously to take the system down.",
      ],
      explanation:
        "1oo2 active-parallel: A = 1 − (1 − A_single)². The redundancy gain is huge (single A=0.997 → parallel A≈0.99999) but the gain is on the independent failure mode; common-cause failure (CCF) must be added separately.",
      options: [
        { text: "≈ 0.99999106", isCorrect: true },
        { text: "0.99701", isCorrect: false },
        { text: "0.99403", isCorrect: false },
        { text: "1.0 (exactly)", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability & Maintainability",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "For two identical blocks with exponential failure distribution (MTBF_single = 1/λ) operating in 1oo2 active-parallel, what is the system MTBF in units of MTBF_single?",
      whyCorrect:
        "MTBF_parallel (1oo2 identical, exponential) = 3/(2λ) = (3/2) × MTBF_single = 1.5 × MTBF_single. Redundancy does NOT double MTBF for identical exponential blocks — the standard result is 1.5× (Ebeling §6.4).",
      whyOthersWrong: [
        "2 × MTBF_single — the common misconception; for identical exponential blocks, the redundancy gain is 1.5×, not 2×.",
        "1 × MTBF_single — this would mean no redundancy gain at all, which is incorrect.",
        "0.5 × MTBF_single — this is the inverse; would mean redundancy worsens MTBF, which is wrong.",
      ],
      explanation:
        "For two identical exponential blocks in active-parallel, MTBF_system = 3/(2λ) = 1.5 × MTBF_single. The 2× misconception arises from naive arithmetic; the actual gain is 1.5× for the steady-state of identical exponentials.",
      options: [
        { text: "1.5 × MTBF_single", isCorrect: true },
        { text: "2 × MTBF_single", isCorrect: false },
        { text: "1 × MTBF_single", isCorrect: false },
        { text: "0.5 × MTBF_single", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability & Maintainability",
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Oil & Gas",
      stem: "Adding identical redundant blocks in active-parallel always doubles the system MTBF per redundant block added.",
      whyCorrect:
        "FALSE. For two identical exponential blocks in active-parallel, MTBF_system = 1.5 × MTBF_single (not 2×). The redundancy gain is sub-linear because both blocks accumulate exposure time simultaneously. Common-cause failure further reduces the gain when β is non-trivial.",
      whyOthersWrong: [
        "TRUE — the common misconception; the gain is 1.5× for the first redundant block, less for subsequent blocks, and reduced further by CCF.",
      ],
      explanation:
        "Identical exponential 1oo2 active-parallel MTBF = 1.5 × MTBF_single (Ebeling §6.4). The '2×' intuition is wrong; redundancy gain is sub-linear in the number of blocks.",
      options: [
        { text: "False — for identical exponential blocks, 1oo2 active-parallel MTBF = 1.5 × MTBF_single, not 2×", isCorrect: true },
        { text: "True — each redundant block doubles the system MTBF", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability & Maintainability",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Power",
      stem: "A 3-of-4 (3oo4) feedwater-pump subsystem has four identical pumps each with MTBF = 18,000 h and MTTR = 48 h. Compute the steady-state availability of the 3oo4 subsystem.",
      whyCorrect:
        "Per-pump A = 18,000/(18,000+48) = 0.997337. For 3oo4: A = Σ_{j=3}^4 C(4,j)·A^j·(1−A)^(4−j) = C(4,3)·A^3·(1−A) + C(4,4)·A^4 = 4·0.997337^3·0.002663 + 0.997337^4 = 4·0.992024·0.002663 + 0.989384 ≈ 0.010566 + 0.989384 ≈ 0.99995.",
      whyOthersWrong: [
        "0.997337 — this is the single-pump availability, not the 3oo4 system; the redundancy gain is missing.",
        "0.989384 — this is only the A^4 term (all 4 up); the 3-up-1-down term (4·A^3·(1−A)) is missing.",
        "0.998933 — this is A_2oo3 (=3A² − 2A³), the wrong configuration; 3oo4 is different.",
      ],
      explanation:
        "A_3oo4 = 4·A³·(1−A) + A⁴ — the binomial sum for j=3 to 4. With A = 0.997337, the result is ≈ 0.99995 — the 3×50% configuration is a high-availability choice.",
      options: [
        { text: "≈ 0.99995", isCorrect: true },
        { text: "0.997337", isCorrect: false },
        { text: "0.989384", isCorrect: false },
        { text: "0.998933", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability & Maintainability",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "DecisionMaking",
      skillType: "Conceptual",
      scenario: "Oil & Gas",
      stem: "A subsea gas-injection system has 2x100% pumps (single MTBF = 6,000 h, MTTR = 600 h) feeding a single 12-mile pipeline. The 1oo2 pump subsystem availability computes to 0.9917; the pipeline availability is 0.999. The system availability is therefore 0.9907. Which design lever most directly raises system availability at minimum cost?",
      whyCorrect:
        "The dominant contributor is the pump MTTR (600 h rig-mobilization), not the pipeline or the redundancy configuration. Design-for-maintainability (intervention-friendly pulling tabs, ROV-friendly connections, on-deck spares, intervention-contract pre-staged) is the lever that raises system availability at minimum cost — reducing MTTR from 600 to 200 h raises single-pump A from 0.909 to 0.968 and parallel A from 0.9917 to 0.9989, raising system A from 0.9907 to 0.9979.",
      whyOthersWrong: [
        "Add a third pump (3x100%) — adds capital and complexity; the dominant contributor is MTTR, not failure rate, so adding pumps moves A only marginally.",
        "Replace the single pipeline with a parallel pipeline — adds enormous capital; the pipeline A=0.999 is already high; the lever is MTTR not pipeline redundancy.",
        "Increase the pump inspection frequency to reduce λ — λ is already known; reducing MTTR (the dominant lever) is the better trade.",
      ],
      explanation:
        "The dominant contributor is identified by per-block unavailability: U_pump_subsystem = 1 − 0.9917 = 0.0083, U_pipeline = 0.001. The pump subsystem dominates (89% of U_total), and within it the MTTR of 600 h dominates the single-pump A. Design-for-maintainability is the lever.",
      options: [
        { text: "Design-for-maintainability — reduce MTTR via intervention-friendly features and pre-staged spares", isCorrect: true },
        { text: "Add a third pump (3x100%) to raise redundancy", isCorrect: false },
        { text: "Replace the single pipeline with a parallel pipeline", isCorrect: false },
        { text: "Increase pump inspection frequency to reduce λ", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 4 — Maintenance Technologies
// ---------------------------------------------------------------------------

const LESSON_MAINTENANCE_TECHNOLOGIES: RefLesson = {
  competencyName: "Maintenance Technologies",
  slug: "mpr-maintenance-technologies",
  title: "Selecting & Applying Maintenance Technologies Across a Process",
  titleAr: "اختيار وتطبيق تقنيات الصيانة عبر العملية",
  order: 4,
  durationMin: 30,
  references: MPR_REFERENCE_TITLES,
  conceptIntroduction: `Maintenance Technologies is the fourth MPR competency — the selection, deployment, and integration of condition-based maintenance (CBM) technologies across a process. The competency covers the four canonical PdM technologies (vibration analysis, oil analysis, infrared thermography, airborne ultrasonic) plus motor-current signature analysis (MCSA), acoustic emission, performance trending, and the integration of these technologies with the CMMS, the planning function, and the reliability-engineering analytics. The CMRP Body of Knowledge treats Maintenance Technologies as the operating-arm of the P-F interval: each technology is selected because it detects a specific failure mode early enough (in the P-F window) for the planning function to intercept before functional failure. The selection is governed by a technology-fit matrix (failure mode × technology × detection capability) and is justified by ROI (cost of technology vs NPV of avoided failures). Mobley's handbook (§6) is the canonical technology reference; Jardine & Tsang develop the inspection-optimization mathematics.`,
  example: `For a centrifugal pump in a chemical plant, build the PdM technology matrix:
  - Bearing wear (lubrication, contamination, fatigue) → vibration analysis (defect frequencies at BPFO, BPFI, BSF, FTF — 1–20 kHz) + oil analysis (ferrous debris count, particle quantifier index, viscosity, water content).
  - Seal degradation (flush plan blockage, face blistering) → ultrasonic leak detection (40 kHz airborne) + infrared thermography (seal-flush temperature differential).
  - Impeller cavitation → vibration (cavitation band 1–5 kHz, broadband) + acoustic emission.
  - Driver (motor) bearing → MCSA (motor current signature at the bearing-defect sideband frequencies).
  - Performance drift (head/flow) → performance trending (digital twin or process data historian).
Investment: $24 k for the vibration route (sensor + analyzer + software), $11 k for the oil-analysis lab capacity, $9 k for the IR camera, $5 k for the ultrasonic gun = $49 k total. Avoided failures: 6/year × $14 k average avoided lost-production + repair = $84 k/year. Payback ≈ 7 months.`,
  keyFormulas: `Vibration defect frequencies:
  BPFO (outer race) = Nb/2 · (1 − bd·cos(β)/pd) · RPM/60
  BPFI (inner race) = Nb/2 · (1 + bd·cos(β)/pd) · RPM/60
  BSF (ball spin) = pd/(2·bd) · (1 − (bd·cos(β)/pd)²) · RPM/60
  FTF (cage) = 0.5 · (1 − bd·cos(β)/pd) · RPM/60
ISO 10816 vibration severity zones: A (new) | B (long-term OK) | C (improve) | D (shut down)
P-F interval / inspection interval: t_insp ≤ t_PF / 2 (Moubray)
ROI of a PdM technology: ROI = (NPV avoided failures − PdM cost) / PdM cost × 100
LCC of a PdM program: LCC_PdM = C_capital + C_training + C_labor + C_software − NPV avoided lost-production
Weibull shape parameter β: β < 1 (infant mortality), β = 1 (useful life), β > 1 (wear-out)`,
  exercise: `You are the reliability engineer at a Power plant. Build the PdM technology matrix for the boiler-feed-pump (BFP) train: driver (3,600 RPM induction motor), coupling (gear), pump (5-stage barrel-casing), and bearings (DE and NDE rolling-element). Identify the dominant failure modes per component, the PdM technology that detects each, the P-F interval, and the inspection interval. Compute the ROI of the PdM program (cost $49 k; avoided failures 6/year × $14 k).`,
  sections: {
    learning_objectives: `- List the four canonical PdM technologies (vibration, oil, IR, ultrasonic) plus MCSA, acoustic emission, performance trending.
- For each failure mode of a process asset, select the appropriate PdM technology and justify the selection by detection capability.
- Apply the P-F interval to set the inspection frequency for each technology route.
- Compute the ROI of a PdM program (NPV avoided failures vs PdM cost).
- Integrate PdM technologies with the CMMS (routes, alarm thresholds, work-order generation) and the planning function.
- Distinguish PdM (predictive, condition-based) from PM (preventive, time-based) and from RTF (run-to-failure).`,
    prerequisites: `- Process Design (MPR 1) — P-F interval, RBD, failure-mode analysis.
- Installation & Commissioning (MPR 2) — baseline vibration spectrum, baseline performance curve.
- Reliability & Maintainability (MPR 3) — availability modeling, dominant-contributor analysis.
- Vibration analysis basics (ISO 10816 zones; FFT spectrum; defect frequencies BPFO/BPFI/BSF/FTF).
- Tribology and oil-analysis basics (viscosity, particle count, ferrous debris, water content).
- Weibull distribution basics (shape β, characteristic life η).`,
    introduction: `Maintenance Technologies is the operating-arm of the P-F interval. Each technology is selected because it detects a specific failure mode early enough for the planning function to intercept before functional failure. The competency is integration-heavy: a technology deployed without integration to the CMMS (route scheduling, alarm thresholds, work-order generation) and to the planning function (work-order planning from a PdM alert) is a research exercise, not a maintenance program.

The discipline is structured around four concepts. **(1) The technology-fit matrix** — a 2-D matrix of failure mode × technology, with each cell scored by detection capability (excellent / good / poor / not applicable). The matrix is the engineer's first-cut selection tool. **(2) The P-F interval per failure mode** — sets the maximum inspection interval for the technology that detects that mode. A technology that detects at the P-point (early in the P-F window) buys time for planning; one that detects at the F-point (functional failure) is too late. **(3) The ROI justification** — the cost of the PdM program (capital + labor + training + software) versus the NPV of avoided failures (lost-production + repair cost); a positive ROI is the gate for deployment. **(4) The integration with CMMS and planning** — routes scheduled, alarm thresholds set, work-order auto-generation on alarm, closed-loop feedback from PdM alert to planned WO to actual failure code. Without this integration, the technology finds defects that the planning function never acts on.

ISO 55000:2014 frames Maintenance Technologies as the operating-arm of the asset-management plan's condition-monitoring strategy. The CMRP exam tests this competency because the four canonical technologies (vibration, oil, IR, ultrasonic) cover ~80% of plant failure modes — the engineer must be fluent in each technology's detection capability, the failure modes it addresses, the inspection frequency it justifies, and the integration architecture. Mobley's handbook (§6) is the canonical reference; Jardine & Tsang develop the inspection-optimization mathematics (the optimal inspection interval that minimizes total expected cost = inspection cost + failure cost).`,
    terminology: `- **Predictive Maintenance (PdM) / Condition-Based Maintenance (CBM)**: maintenance triggered by the condition of the asset, as measured by a PdM technology.
- **Preventive Maintenance (PM)**: time-based or usage-based maintenance (e.g., lubricate every 30 days, replace every 10,000 h).
- **Run-to-Failure (RTF)**: maintenance only after functional failure; appropriate for non-critical assets where the cost of prevention exceeds the cost of failure.
- **Vibration analysis**: the analysis of the time-waveform and FFT spectrum of a rotating asset's vibration velocity, acceleration, or displacement; detects bearing defects, imbalance, misalignment, looseness, resonance.
- **Oil analysis**: the analysis of in-service lubricant for viscosity, particle count, ferrous debris, water content, additive depletion; detects wear, contamination, lubricant degradation.
- **Infrared thermography (IR)**: imaging of surface temperature; detects electrical hot-spots (loose connections, overloaded breakers), bearing overheating, insulation degradation, refractory damage.
- **Airborne ultrasonic**: detection of high-frequency (40 kHz) airborne or structure-borne sound; detects compressed-air/gas/steam leaks, bearing friction (early lubrication loss), partial discharge in switchgear.
- **Motor-Current Signature Analysis (MCSA)**: FFT of the motor supply current; detects rotor-bar faults, bearing-wear sidebands, load oscillations.
- **Acoustic emission (AE)**: detection of transient elastic waves from crack growth, cavitation, leaks; used for pressure-vessel and storage-tank inspection.
- **Performance trending**: tracking of process data (flow, head, efficiency, current draw) over time; detects fouling, wear, drift.
- **P-F interval**: the time between first-detectable symptom (P) and functional failure (F); sets the maximum useful inspection interval (t_PF/2).
- **Technology-fit matrix**: failure mode × technology, scored by detection capability.`,
    detailed_explanation: `**Vibration analysis.** The most widely-deployed PdM technology for rotating equipment. An accelerometer mounted on the bearing housing measures the time-waveform of vibration; the FFT (Fast Fourier Transform) decomposes the waveform into its frequency components, each component being a mechanical signature. The defect frequencies of a rolling-element bearing are predicted by the bearing geometry (BPFO, BPFI, BSF, FTF — see formulas). The presence of energy at the BPFO frequency, with sidebands, is the signature of an outer-race spall; at the BPFI, an inner-race defect; at the BSF, a ball defect; at the FTF, a cage defect. Imbalance shows at 1× running speed; misalignment at 2×; looseness at multiple harmonics; resonance at a natural frequency excited by a forcing function. The technology detects bearing, gear, coupling, and rotor failure modes — typically 50–70% of rotating-equipment failures. The P-F interval for a bearing-failure mode is typically 1–6 months from the first detectable defect frequency to functional seizure. The inspection interval: monthly to quarterly vibration routes (route-based, walk-around) plus permanently-installed continuous-monitoring systems for critical machines.

**Oil analysis.** The most widely-deployed PdM technology for lubricated components. A sample of in-service lubricant is analyzed for: viscosity (the lubricant's most basic property — a 15% drop indicates dilution, a 15% rise indicates oxidation); particle count (ISO 4406 cleanliness code — the count of particles >4, >6, >14 µm per mL); ferrous debris (PQ index — the magnetic mass of ferrous wear particles); water content (Karl Fischer — water is the dominant lubricant contaminant); additive elements (ICP spectroscopy — Ba, B, Ca, Mg, P, Zn for additive depletion); wear metals (Fe, Cr, Ni, Cu, Pb, Sn, Al — for component-specific wear). The technology detects wear, contamination, and lubricant degradation — typically 20–30% of rotating-equipment failures beyond what vibration catches (lubrication loss, contamination ingress, oil-degradation-driven wear). The P-F interval for a lubrication-loss failure mode is typically 2–8 weeks from the first ferrous-debris rise to functional failure. The inspection interval: monthly oil sampling for critical equipment; quarterly for non-critical.

**Infrared thermography.** Imaging of surface temperature. The technology detects: electrical hot-spots (loose connections, overloaded breakers, imbalanced phases — typically 5–10°C above ambient in the early stage, 30+°C in the late stage); bearing overheating (friction from lubrication loss or pre-load); insulation degradation (motor winding shorted turns); refractory damage (furnace and boiler hot-spots indicating refractory failure); steam-trap failure (a failed-open trap is hot at the outlet; a failed-closed trap is cold). The technology is unique in detecting failure modes that no other PdM technology catches: electrical hot-spots, refractory damage. The P-F interval for an electrical-hot-spot failure mode is typically 2–12 weeks from the first 5°C rise to insulation failure. The inspection interval: monthly for switchgear; quarterly for motors and bearings; annual surveys for refractory.

**Airborne ultrasonic.** Detection of high-frequency (40 kHz) sound above the human hearing range. The technology detects: compressed-air and gas leaks (the hiss of a leak is broadband ultrasonic); steam-trap failure (a passing trap has a continuous ultrasonic signature; a healthy trap has an intermittent discharge); bearing friction (early lubrication loss generates ultrasonic emission before vibration rises); partial discharge in switchgear (corona, arcing). The technology is unique in detecting gas leaks and partial discharge — failure modes that no other PdM technology catches. The P-F interval for a gas-leak failure mode is typically immediate (the leak is functional failure already), but for bearing-friction it is 2–6 weeks before vibration rises. The inspection interval: monthly for compressed-air surveys; quarterly for steam traps; route-based for switchgear.

**Technology-fit matrix.** For a centrifugal pump:
  | Failure mode            | Vibration | Oil  | IR   | Ultrasonic | MCSA |
  |--------------------------|-----------|------|------|------------|------|
  | Bearing outer-race spall | Excellent | Good | Good | Good       | Good |
  | Bearing inner-race defect| Excellent | Good | Poor | Fair       | Good |
  | Lubrication loss         | Fair      | Excellent | Excellent | Excellent | Fair |
  | Contamination ingress    | Fair      | Excellent | Fair | Fair       | Fair |
  | Seal face blistering     | Fair      | Fair | Good | Excellent  | Fair |
  | Impeller cavitation      | Excellent | Fair | Fair | Good       | Good |
  | Coupling misalignment    | Excellent | Poor | Fair | Fair       | Good |
  | Driver rotor-bar fault   | Poor      | N/A  | Fair | N/A        | Excellent |
  | Driver winding short     | N/A       | N/A  | Excellent | N/A    | Good |

The matrix is the engineer's first-cut selection tool: each failure mode has a primary and a secondary technology. Vibration is the primary for 4 modes; oil for 2; IR for 1; ultrasonic for 1; MCSA for 1. The secondary adds redundancy and confirms the primary alarm. The matrix is built per asset class (pump, motor, compressor, gear, fan) and re-used across the plant.

**ROI justification.** The PdM program is justified by the avoided-failure NPV. Each technology has a capital + labor + training + software cost; the avoided failures are valued at the lost-production + repair cost that would have occurred without the PdM detection. The standard ROI calculation: ROI = (NPV avoided failures − PdM cost) / PdM cost × 100. A positive ROI is the gate for deployment. The standard example (above) gives ROI ≈ 70% with payback ≈ 7 months. The ROI is sensitive to: (a) the failure rate (more failures = higher avoided-NPV), (b) the lost-production cost (higher C_L = higher avoided-NPV), (c) the PdM detection effectiveness (detection at the P-point vs the F-point — earlier detection = more planning time = less lost-production), and (d) the integration with CMMS and planning (a PdM alert that generates a planned WO is worth 5–10× one that sits in an unattended report).

**Integration with CMMS and planning.** The PdM technology generates a condition alert; the alert must be triaged (true positive vs false positive); the true positive must generate a planned WO in the CMMS; the WO is planned by the planner (per the WM pillar — scope, BOM, labor, tools, safety, procedure, standard); the WO is scheduled and executed; the actual failure code is fed back to the PdM database (closing the loop on the alarm threshold). Without this integration, the technology detects defects that the planning function never acts on — the technology's value is not realized. The integration is the work that converts a PdM investment into avoided lost-production.`,
    core_principles: `- **PdM operates the P-F interval.** Each technology is selected because it detects a specific failure mode in the P-F window.
- **The technology-fit matrix is the selection tool.** Failure mode × technology, scored by detection capability.
- **ROI is the deployment gate.** A positive ROI (NPV avoided failures > PdM cost) justifies the technology.
- **Integration with CMMS and planning realizes the value.** Without integration, PdM detects defects that the planning function never acts on.
- **PdM ≠ PM ≠ RTF.** PdM is condition-based; PM is time-based; RTF is failure-based. Each has its scope of application.
- **Detection at P > detection at F.** Earlier detection = more planning time = less lost-production = higher ROI.`,
    components: `- **Vibration analyzer** (route-based walk-around or continuous-monitoring): accelerometer, data collector, FFT software, route scheduler.
- **Oil-analysis lab** (in-house or third-party): sample bottles, sample port kit, lab equipment (viscometer, particle counter, PQ meter, Karl Fischer, ICP spectroscopy).
- **Infrared camera** (radiometric, calibrated): IR imager, reporting software, trend database.
- **Ultrasonic gun** (airborne, 40 kHz): ultrasonic detector, headset or display, leak-rate estimator.
- **MCSA / Electrical signature analyzer**: current-clamp, FFT software, motor-specific defect library.
- **Performance trending**: process-data historian (PI, Aspen IP21), digital twin, or asset-performance-management (APM) platform.
- **CMMS integration**: route scheduler, alarm thresholds, work-order auto-generation rules, closed-loop feedback from WO closeout to PdM alarm threshold.`,
    process: `1. **Identify the asset criticality and failure modes** (from the FMEA / RCM analysis — failure mode × criticality).
2. **Build the technology-fit matrix** for each asset class (pump, motor, compressor, gear, fan).
3. **Select the primary and secondary PdM technologies** for each failure mode (highest detection capability).
4. **Set the inspection interval** per technology route from the P-F interval (t_insp ≤ t_PF/2).
5. **Justify the deployment** by ROI (capital + labor + training + software vs NPV avoided failures).
6. **Procure and install** the technology (sensor + analyzer + software + integration).
7. **Baseline the asset** (as-commissioned vibration spectrum, oil sample, IR image, ultrasonic reading) — the reference for drift measurement.
8. **Schedule the routes** in the CMMS (route-based, walk-around) or configure the continuous-monitoring alarms.
9. **Triage alerts** (true positive vs false positive) — by the reliability engineer.
10. **Generate planned WOs** from true-positive alerts, planned by the planner per the WM pillar.
11. **Close the feedback loop**: actual failure code from WO closeout updates the PdM alarm threshold; the alarm threshold is recalibrated annually as failure data accrues.
12. **Annual review**: revisit the technology-fit matrix and the ROI; adjust routes and thresholds as failure data accrues.`,
    formula_calculation: `- **Bearing defect frequencies** (rolling-element bearing):
  BPFO (outer race) = (Nb/2) · (1 − bd·cos(β)/pd) · (RPM/60)
  BPFI (inner race) = (Nb/2) · (1 + bd·cos(β)/pd) · (RPM/60)
  BSF (ball spin)    = (pd/(2·bd)) · (1 − (bd·cos(β)/pd)²) · (RPM/60)
  FTF (cage)         = (1/2) · (1 − bd·cos(β)/pd) · (RPM/60)
  Variables: Nb = number of balls; bd = ball diameter [mm]; pd = pitch diameter [mm]; β = contact angle [deg]; RPM = rotational speed [rev/min]. Units: output frequency in [Hz]. Assumption: rigid geometry, no slip. Interpretation: peaks in the FFT spectrum at these frequencies indicate the corresponding bearing defect.
- **ISO 10816 vibration severity zones**:
  Zone A (new):       ≤ V_A    (e.g., ≤ 1.4 mm/s RMS for Class II)
  Zone B (long-term): V_A..V_B (e.g., 1.4..2.8 mm/s)
  Zone C (improve):   V_B..V_C (e.g., 2.8..4.5 mm/s)
  Zone D (shut down): > V_C    (e.g., > 4.5 mm/s)
  Variables: V = vibration velocity RMS [mm/s]; thresholds depend on machine class (Class I–IV) and mounting (rigid/flexible). Interpretation: SAT must finish in Zone A or B; Zone C triggers a planned WO; Zone D triggers immediate shutdown.
- **P-F interval / inspection interval** (Moubray):
  t_insp ≤ t_PF / 2
  Variables: t_insp [h] inspection interval; t_PF [h] P-F interval per failure mode. Interpretation: at t_PF/2, probability of intercepting the failure before functional loss is high.
- **ROI of a PdM technology**:
  ROI = (NPV avoided failures − PdM cost) / PdM cost × 100
  Variables: NPV avoided failures [$] = Σ_t (avoided failures_t × (C_L + C_M)) / (1+r)^t; PdM cost [$] = C_capital + C_training + C_labor + C_software. Interpretation: positive ROI = deployment justified.
- **LCC of a PdM program**:
  LCC_PdM = C_capital + Σ_t (C_training,t + C_labor,t + C_software,t − NPV_avoided,t) / (1+r)^t
  Variables: as above; LCC_PdM is negative (i.e., positive avoided-NPV) when the program pays back.
- **Weibull shape parameter β**:
  β < 1: infant mortality (decreasing hazard)
  β = 1: useful life (constant hazard, exponential)
  β > 1: wear-out (increasing hazard)
  Variables: β from the Weibull fit of failure data. Interpretation: PdM is most cost-effective for wear-out failure modes (β > 1) where the P-F interval is well-defined; less cost-effective for infant mortality (β < 1) where the P-F is short.`,
    worked_example: `**Problem.** A chemical plant is building a PdM program for its centrifugal-pump fleet (40 pumps, average MTBF = 12,000 h, average repair + lost-production cost = $14 k per failure). Build the PdM technology matrix, set the inspection intervals, compute the program cost, and justify the program by ROI.

**Step 1 — Failure-mode analysis (FMEA summary).** For a centrifugal pump in chemical service, the top failure modes are:
  - Bearing outer-race spall (35% of failures, P-F = 4 months).
  - Lubrication loss / oil degradation (20%, P-F = 6 weeks).
  - Seal face blistering / flush blockage (15%, P-F = 3 months).
  - Impeller cavitation (10%, P-F = 8 weeks).
  - Coupling misalignment (10%, P-F = 6 months).
  - Contamination ingress (5%, P-F = 4 weeks).
  - Other (5%).

**Step 2 — Technology-fit matrix** (per failure mode, primary + secondary):
  | Failure mode            | Primary    | Secondary   |
  |--------------------------|------------|-------------|
  | Bearing outer-race spall | Vibration  | Oil         |
  | Lubrication loss         | Oil        | IR          |
  | Seal face blistering     | Ultrasonic | IR          |
  | Impeller cavitation      | Vibration  | Ultrasonic  |
  | Coupling misalignment    | Vibration  | MCSA        |
  | Contamination ingress    | Oil        | Vibration   |

**Step 3 — Inspection intervals** (t_insp ≤ t_PF/2):
  - Vibration route: covers bearing (P-F=4mo), cavitation (P-F=8wk), misalignment (P-F=6mo). Min P-F = 8wk ⇒ t_insp ≤ 4wk. **Set monthly (4-wk) vibration routes** for the critical 40 pumps (a walk-around route with a portable analyzer; 1 vibration tech × 8 h/day × 5 days = 40 pump-routes per week; one tech covers the fleet easily).
  - Oil sampling: covers bearing (secondary), lubrication (primary), contamination (primary). Min P-F = 4wk ⇒ t_insp ≤ 2wk. **Set monthly oil sampling** (more frequent than the strict P-F/2 because the oil-analysis lab turnaround is ~7 days).
  - IR thermography: covers electrical hot-spots on the motor, bearing overheating, seal-flush temperature. P-F (electrical) = 2–12 wk. **Set monthly IR routes** for the motor switchgear; quarterly for the pump bearings and seal-flush.
  - Ultrasonic: covers seal leaks, bearing friction (early). P-F (seal) = 3mo. **Set quarterly ultrasonic routes** for the seals and compressed-air surveys.

**Step 4 — Program cost.**
  - Vibration: 1 route analyzer (@ $18 k) + 1 accelerometer (@ $2 k) + software (@ $4 k) + 1 vibration tech @ $85 k/year (loaded) = $109 k capital + labor.
  - Oil analysis: in-house lab capacity (viscometer @ $8 k, particle counter @ $9 k, PQ meter @ $4 k, Karl Fischer @ $15 k, ICP @ $40 k = $76 k capital) + 1 lubricant analyst @ $70 k/year = $146 k. (Alternative: third-party lab at $25/sample × 40 pumps × 12/year = $12 k/year, no capital.)
  - IR: 1 radiometric IR camera (@ $9 k) + 1 thermographer part-time @ $40 k/year = $49 k.
  - Ultrasonic: 1 ultrasonic gun (@ $5 k) + part-time tech @ $15 k/year = $20 k.
  - **Total capital = $109 k (with in-house lab) or $33 k (with third-party lab). Annual labor = $210 k (in-house) or $134 k (third-party lab).**

**Step 5 — Avoided failures (NPV).** Without PdM, the 40-pump fleet fails at 40 × 8,760 / 12,000 = 29.2 failures/year × $14 k = $409 k/year in repair + lost-production cost. With PdM, the reliability engineer estimates 60% of failures can be intercepted (P-F detected and a planned WO issued) — the planned WO reduces the cost per event from $14 k (unplanned, breakdown) to $4 k (planned, scheduled, no lost-production). Avoided cost = 29.2 × 60% × ($14 k − $4 k) = 17.5 × $10 k = $175 k/year. **NPV avoided over 5 years at 8% = $175 k × 3.993 = $699 k.**

**Step 6 — ROI.**
  With in-house lab: total 5-year PdM cost = $109 k capital + $210 k × 5 = $1,159 k. ROI = ($699 k avoided − $1,159 k) / $1,159 k × 100 = −39.7% (negative — in-house lab is over-capitalized for 40 pumps).
  With third-party lab: total 5-year PdM cost = $33 k capital + $134 k × 5 + $12 k × 5 (lab fees) = $793 k. ROI = ($699 k − $793 k) / $793 k × 100 = −11.9% (still negative).
  Re-examine: the avoided cost includes only the differential (unplanned → planned). The full benefit also includes reduced failure rate (PdM detects lubrication loss before the bearing seizes, raising MTBF from 12,000 to ~16,000 h): new failure rate = 40 × 8,760 / 16,000 = 21.9 failures/year; new avoided = 21.9 × 60% × ($14 k − $4 k) = $131 k/year PLUS the MTBF rise reduces total failures = 21.9 × 0.4 × $14 k = $122.6 k/year avoided (the no-PdM failure rate × 40% not intercepted × avoided because of MTBF rise). Total NPV avoided ≈ ($131 k + $122.6 k) × 3.993 = $1,013 k. **ROI = ($1,013 k − $793 k) / $793 k × 100 ≈ 27.7%** — positive; deployment justified. Payback ≈ 3.5 years.

**Step 7 — Integration with CMMS and planning.** Configure the vibration route in the CMMS (route ID, asset list, measurement points, baseline spectrum). Set alarm thresholds (per ISO 10816 zones A/B/C/D) and alert thresholds (band alarms — energy in a specific frequency band exceeding a baseline-derived threshold). Configure the work-order auto-generation rule: any Zone-C alert generates a planned WO; the planner plans it (per the WM pillar) within the P-F window. After WO closeout, the actual failure code feeds back to the vibration database, recalibrating the alarm threshold for the next similar event. This integration is what converts a $33 k capital investment into $1,013 k of avoided lost-production over 5 years.

**Result.** PdM program for 40 centrifugal pumps: vibration (monthly), oil (monthly, third-party lab), IR (monthly motor / quarterly pump), ultrasonic (quarterly seal). Total 5-year cost = $793 k. NPV avoided = $1,013 k. ROI ≈ 27.7%, payback ≈ 3.5 years. The dominant lever is the MTBF rise (PdM intercepts lubrication loss and bearing wear before the asset seizes), not just the planned-vs-unplanned cost differential. The CMMS integration (alarm thresholds, WO auto-generation, closed-loop feedback) is what realizes the ROI.`,
    industrial_example: `**Chemical — centrifugal-pump fleet.** The worked example above is the canonical chemical-plant scenario. The chemical-specific technology choices include: API 610 vibration probe locations (DE and NDE bearing housings); API 614 lube-oil sampling ports (upstream of the filter, downstream of the pump); IR surveys on the motor terminal box (electrical hot-spots in corrosive atmospheres); ultrasonic for seal-failure detection in volatile organic service (where visible-leak detection is too late).

**Oil & Gas — centrifugal gas-compressor train.** A 5-MW gas-compressor train (driver + gearbox + compressor) uses continuous-monitoring vibration (permanently-installed accelerometers + proximity probes on the journal bearings), monthly oil sampling (sampling ports on the gearbox and compressor bearings), IR surveys on the lube-oil cooler and the motor windings, ultrasonic for gas-leak detection at the seal gas system. The PdM capital is ~$120 k (continuous-monitoring system); the avoided failures ($0.8 M per avoided compressor trip) justify a 2-month payback.

**Power — boiler-feed-pump train.** A BFP train (motor + coupling + 5-stage barrel-casing pump) uses monthly vibration routes (accelerometer on the motor DE/NDE, the coupling guard, the pump DE/NDE), monthly oil sampling (synthetic ISO VG 32 lubricant, critical for high-speed / high-temperature service), IR surveys on the motor terminal box and the coupling guard (for misalignment-induced heating), ultrasonic for the steam-trap fleet upstream of the BFP. The BFP is the second-highest-criticality asset in a power plant (after the GT/ST); the PdM program is justified at any reasonable ROI.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** A 200-pump chemical plant has a PdM program consisting of a quarterly vibration route (one vibration tech, 200 pumps × 4/year = 800 measurements, 0.5 h each = 400 h/year = 0.2 FTE) and an annual oil sample (200 samples × $25 = $5 k/year). The program costs ~$35 k/year (labor + analyzer depreciation + oil lab fees). The plant MTBF is 8,500 h; avoided failures are estimated at 12/year × $14 k = $168 k/year. ROI = (168 − 35) / 35 × 100 = 380% — looks excellent.

But: the W-M pillar audit reveals that of the 12 PdM alerts raised last year, only 4 were converted to planned WOs; the other 8 sat in the vibration tech's spreadsheet and the failures occurred as unplanned breakdowns. The actual avoided failures are 4 × $14 k = $56 k/year. The true ROI = (56 − 35) / 35 × 100 = 60% — still positive but materially lower than the headline.

The plant reliability engineer implements the CMMS integration: vibration alerts auto-generate planned WOs; the planner plans them within the P-F window; the closed-loop feedback from WO closeout updates the alarm thresholds. After one year, the alert-to-WO conversion rises from 33% to 92%; the avoided failures rise to 11 × $14 k = $154 k; the true ROI = (154 − 35) / 35 × 100 = 340% — closer to the headline. The case demonstrates that PdM ROI is gated by CMMS integration, not by the technology alone. The technology investment is wasted without the work-management investment.`,
    visual_explanation: `- **Technology-fit matrix**: a heatmap of failure mode (rows) × technology (columns), with color-coded detection capability (green = excellent, yellow = good, orange = fair, red = N/A).
- **P-F curve with technology markers**: the time-condition curve with markers showing where each PdM technology first detects the symptom — vibration at the bearing-defect-frequency onset, oil at the ferrous-debris rise, ultrasonic at the bearing-friction onset.
- **ROI waterfall**: capital + labor + training + software vs NPV avoided failures; the gap is the program value.
- **PdM-to-WO workflow**: alert → triage → planned WO → scheduler → execution → closeout feedback → alarm threshold recalibration.
- **ISO 10816 zones**: horizontal bar A | B | C | D with the as-commissioned and current vibration velocity marked.`,
    simulation_opportunity: `A PdM-deployment simulator: the learner is given a 40-pump fleet, the failure modes, the technology-fit matrix, the per-technology cost, and the failure-rate / lost-production data. The learner iterates the route configuration (which technology, which pumps, what frequency) to maximize ROI. A second tier injects CMMS-integration quality (alert-to-WO conversion rate from 33% to 92%) and shows how the integration is the dominant lever. A third tier adds an asset-health-management (APM) platform that auto-routes and auto-triages, raising conversion further.`,
    common_mistakes: `- **Deploying PdM without CMMS integration**: the technology finds defects that the planning function never acts on; the ROI is not realized.
- **Setting inspection intervals by tradition, not by P-F/2**: the route frequency is inherited from the previous plant and never re-justified against the P-F interval.
- **Treating all PdM technologies as interchangeable**: vibration does not detect gas leaks; ultrasonic does not detect bearing outer-race spalls at the early stage; each technology has its detection niche.
- **No baseline (as-commissioned) spectrum**: drift has no reference; the alarm thresholds are absolute (ISO 10816) and miss the asset-specific early-stage defects.
- **No closed-loop feedback**: actual failure codes from WO closeout do not update the alarm thresholds; the thresholds drift away from the asset's true behavior.
- **Over-capitalizing the in-house lab for a small fleet**: the in-house oil-analysis lab is over-capitalized below ~200 critical assets; a third-party lab is cheaper.
- **Confusing PdM with PM**: PM (time-based) and PdM (condition-based) are different; deploying PdM where PM was the right strategy, or vice versa, wastes both.`,
    limitations: `- PdM does not intercept infant-mortality (β < 1) failure modes — the P-F interval is too short.
- PdM does not intercept common-cause failures (a single event defeats both the asset and the PdM technology).
- The P-F interval is failure-mode-specific; a single per-asset "P-F" is an oversimplification.
- The ROI calculation is sensitive to the failure-rate estimate, the lost-production cost, and the integration quality — three contested inputs.
- The technology-fit matrix is generic; each plant has unique failure modes that require a custom matrix.
- Continuous-monitoring systems generate false-positive alerts that erode operator trust if not triaged promptly.`,
    comparison: `- **PdM vs PM**: PdM is condition-based (alarm-triggered); PM is time-based (calendar-triggered). PdM is more cost-effective for high-criticality assets with well-defined P-F intervals; PM is more cost-effective for low-criticality assets with wear-out-only failure modes.
- **PdM vs RTF**: RTF is appropriate for non-critical assets where the cost of prevention exceeds the cost of failure (e.g., a $200 light bulb).
- **Vibration vs Oil**: vibration is the primary for bearing-defect failure modes; oil is the primary for lubrication-loss and contamination failure modes. They are complementary, not interchangeable.
- **IR vs Ultrasonic**: IR is unique for electrical hot-spots and refractory damage; ultrasonic is unique for gas leaks and partial discharge. They address different failure-mode classes.
- **Route-based vs Continuous-monitoring**: route-based (walk-around, monthly) is cost-effective for general fleets; continuous-monitoring is justified for high-criticality assets where the P-F interval is short and the lost-production cost is high.`,
    practical_application: `- **At PdM program design**: build the technology-fit matrix per asset class; set inspection intervals by P-F/2; justify the program by ROI; deploy the capital and labor.
- **At CMMS integration**: configure routes in the CMMS; set alarm thresholds (per ISO 10816); configure WO auto-generation on alarm.
- **At route execution**: the vibration tech / lubricant analyst / thermographer walks the route, uploads the data, and triages alerts.
- **At planning integration**: true-positive alerts generate planned WOs; the planner plans them within the P-F window (per the WM pillar).
- **At closeout feedback**: the actual failure code from WO closeout updates the alarm threshold in the PdM database.
- **At annual review**: revisit the technology-fit matrix, the ROI, and the alarm thresholds; adjust routes and integration quality.`,
    decision_scenario: `You are the reliability engineer at a Power plant. The BFP train has a PdM program of monthly vibration + monthly oil + quarterly IR. The CFO challenges the $35 k/year program cost. The CIO offers to fund an asset-performance-management (APM) platform ($80 k capital + $15 k/year software) that auto-triages alerts and auto-generates WOs; the APM platform is projected to raise the alert-to-WO conversion from 33% to 92% and reduce the labor cost from $25 k to $10 k/year. Compute the trade-off.

  - Without APM: 5-year PdM cost = $35 k × 5 = $175 k; avoided failures at 33% conversion = $56 k/year × 5 = $280 k; ROI = (280 − 175) / 175 × 100 = 60%.
  - With APM: 5-year PdM cost = $80 k capital + $10 k × 5 labor + $15 k × 5 software = $205 k; avoided failures at 92% conversion = $154 k/year × 5 = $770 k; ROI = (770 − 205) / 205 × 100 = 275%.

Decision: fund the APM platform. The integration quality is the dominant lever — the APM platform pays back the $80 k capital in < 1 year via the conversion rise. The case demonstrates that the technology-investment (APM) and the work-management investment (CMMS integration, planning) are joint levers; either alone underperforms.`,
    practice_questions: `- List the four canonical PdM technologies and one failure mode each is the primary detector for.
- Compute BPFO for an 8-ball bearing with Nb=8, bd=12.7 mm, pd=77.2 mm, β=0°, at 3,600 RPM. *(Answer: BPFO = (8/2)·(1 − 12.7·1/77.2)·(3600/60) = 4·0.8354·60 = 200.5 Hz.)*
- A failure mode has P-F = 4 months. What is the maximum useful inspection interval? *(Answer: 2 months.)*
- Compute the ROI of a $35 k PdM program with NPV avoided failures = $280 k. *(Answer: (280 − 35)/35 × 100 = 700%.)*
- State why a PdM program without CMMS integration underperforms its headline ROI.
- Distinguish PdM from PM and RTF, with one example each.`,
    certification_questions: `The CMRP exam tests Maintenance Technologies as the fourth MPR competency. SMRP-aligned sample prompts:
(a) Select the appropriate PdM technology for a given failure mode (technology-fit matrix).
(b) Apply the P-F/2 rule to set inspection interval per technology route.
(c) Compute ROI of a PdM program (capital + labor + training + software vs NPV avoided failures).
(d) Recognize that CMMS integration (alert → planned WO → closeout feedback) is the dominant lever on PdM ROI.
The questions in this lesson's question bank are aligned to these Maintenance Technologies competencies.`,
    summary: `Maintenance Technologies is the operating-arm of the P-F interval. The four canonical technologies (vibration, oil, IR, ultrasonic) plus MCSA and performance trending cover ~80% of plant failure modes; each is selected per the technology-fit matrix, deployed at an inspection interval justified by P-F/2, and justified by ROI. The CMMS integration — alarm thresholds, WO auto-generation, closed-loop feedback — is the dominant lever that converts a PdM investment into avoided lost-production. The CMRP exam tests the engineer's fluency in selecting the right technology for a failure mode, setting the inspection interval from the P-F interval, computing the ROI, and integrating the technology with the CMMS and the planning function. The output — the technology-fit matrix, the routes, the alarm thresholds, and the closed-loop feedback — is the recurring deliverable of the MPR pillar's operating arm.`,
    key_takeaways: `- The four canonical PdM technologies: vibration, oil, IR, ultrasonic. Each addresses a specific failure-mode class.
- The technology-fit matrix (failure mode × technology) is the selection tool.
- Inspection interval ≤ P-F/2 (Moubray rule); each route frequency is justified by the shortest P-F it covers.
- ROI = (NPV avoided failures − PdM cost) / PdM cost × 100; positive ROI is the deployment gate.
- CMMS integration (alarm → planned WO → closeout feedback) is the dominant lever on PdM ROI.
- PdM ≠ PM ≠ RTF; PdM is condition-based, PM is time-based, RTF is failure-based.`,
    references: `- SMRP. *CMRP Body of Knowledge — Manufacturing Process Reliability pillar: Maintenance Technologies.*
- SMRP. *CMRP Exam Outline.*
- ISO 55000:2014 — condition-monitoring strategy within the asset-management plan.
- Mobley, R. K. (2008). *Maintenance Engineering Handbook* (7th ed.). McGraw-Hill. §6 (Predictive Maintenance Technologies — vibration, oil, IR, ultrasonic), §3 (reliability engineering).
- Campbell, J. D. & Jardine, A. K. S. (2001). *Maintenance Strategy*. Productivity Press. Ch. 6 (PdM / CBM strategy).
- Ebeling, C. E. (2010). *An Introduction to Reliability and Maintainability Engineering* (2nd ed.). Waveland. Ch. 4 (inspection optimization).
- Jardine, A. K. S. & Tsang, A. H. C. (2017). *Maintenance, Replacement, and Reliability* (2nd ed.). CRC. Ch. 4 (inspection & replacement optimization — the mathematics of P-F/2).`,
  },
  knowledgeObject: {
    title: "Maintenance Technologies — PdM selection, fit matrix, ROI",
    domain: "Manufacturing Process Reliability",
    competency: "Maintenance Technologies",
    topic: "PdM / CBM deployment",
    concept: "Technology-fit matrix and P-F-driven inspection",
    body: {
      definitions: [
        "PdM / CBM: maintenance triggered by the condition of the asset, as measured by a PdM technology.",
        "PM: preventive, time-based maintenance (calendar or usage-triggered).",
        "RTF: run-to-failure; appropriate for non-critical assets where prevention cost > failure cost.",
        "Vibration analysis: FFT spectrum of bearing-housing vibration; detects bearing defects, imbalance, misalignment, looseness, resonance.",
        "Oil analysis: in-service lubricant analysis for viscosity, particle count, ferrous debris, water content, additives, wear metals.",
        "Infrared thermography: imaging of surface temperature; detects electrical hot-spots, bearing overheating, insulation degradation, refractory damage.",
        "Airborne ultrasonic: 40 kHz sound detection; detects compressed-air/gas/steam leaks, bearing friction (early), partial discharge.",
        "MCSA: motor current signature analysis; detects rotor-bar faults, bearing-wear sidebands.",
        "Acoustic emission: transient elastic-wave detection; crack growth, cavitation, leaks.",
        "Performance trending: tracking flow/head/efficiency/current draw; detects fouling, wear, drift.",
        "P-F interval: time from first-detectable symptom (P) to functional failure (F); sets max inspection interval (t_PF/2).",
        "Technology-fit matrix: failure mode × technology, scored by detection capability.",
      ],
      principles: [
        "PdM operates the P-F interval — each technology detects a specific failure mode in the P-F window.",
        "The technology-fit matrix is the selection tool (failure mode × technology).",
        "ROI (NPV avoided failures vs PdM cost) is the deployment gate.",
        "CMMS integration (alarm → planned WO → closeout feedback) realizes the value.",
        "PdM ≠ PM ≠ RTF; each has its scope of application (criticality × P-F clarity).",
        "Detection at P > detection at F (earlier detection = more planning time = less lost-production = higher ROI).",
      ],
      components: [
        "Vibration analyzer (route-based or continuous).",
        "Oil-analysis lab (in-house or third-party).",
        "Infrared camera (radiometric, calibrated).",
        "Ultrasonic gun (airborne 40 kHz).",
        "MCSA / electrical-signature analyzer.",
        "Performance-trending platform (historian / digital twin / APM).",
        "CMMS integration (routes, alarms, WO auto-generation, closed-loop feedback).",
      ],
      mechanism: [
        "FMEA → technology-fit matrix → primary+secondary PdM technologies per failure mode → inspection interval ≤ P-F/2 → ROI justification → deployment → CMMS route + alarm thresholds → alert triage → planned WO (per WM) → closeout feedback → alarm recalibration → annual review.",
      ],
      process: [
        "1. Identify asset criticality and failure modes (from FMEA / RCM).",
        "2. Build the technology-fit matrix per asset class.",
        "3. Select primary + secondary PdM technologies per failure mode.",
        "4. Set inspection interval ≤ P-F/2 per route.",
        "5. Justify deployment by ROI (capital + labor + training + software vs NPV avoided failures).",
        "6. Procure and install (sensor + analyzer + software + integration).",
        "7. Baseline the asset (as-commissioned spectrum / sample / image / reading).",
        "8. Schedule routes in the CMMS; configure continuous-monitoring alarms.",
        "9. Triage alerts (true vs false positive).",
        "10. Generate planned WOs from true-positive alerts; plan within the P-F window.",
        "11. Close the feedback loop: actual failure code updates the PdM alarm threshold.",
        "12. Annual review: revisit the technology-fit matrix, the ROI, and the alarm thresholds.",
      ],
      formulas: [
        "BPFO = (Nb/2)·(1 − bd·cos(β)/pd)·(RPM/60).",
        "BPFI = (Nb/2)·(1 + bd·cos(β)/pd)·(RPM/60).",
        "BSF = (pd/(2·bd))·(1 − (bd·cos(β)/pd)²)·(RPM/60).",
        "FTF = (1/2)·(1 − bd·cos(β)/pd)·(RPM/60).",
        "ISO 10816 zones: A (new), B (long-term OK), C (improve), D (shut down).",
        "t_insp ≤ t_PF / 2 (Moubray rule).",
        "ROI = (NPV avoided failures − PdM cost) / PdM cost × 100.",
        "LCC_PdM = C_capital + Σ (C_training + C_labor + C_software − NPV_avoided) / (1+r)^t.",
        "Weibull β: <1 infant mortality, =1 useful life, >1 wear-out.",
      ],
      metrics: [
        "PdM ROI (NPV avoided failures / PdM cost).",
        "Alert-to-WO conversion rate (% of true-positive alerts converted to planned WOs).",
        "Avoided failures per year (PdM-detected, planned).",
        "MTBF rise from PdM (PdM intercepts failures → MTBF rises).",
        "Inspection coverage (% of fleet on each PdM route).",
        "Alarm-threshold accuracy (true-positive vs false-positive rate).",
        "PdM-program labor cost per route measurement.",
      ],
      examples: [
        "Chemical 40-pump fleet: vibration (monthly), oil (monthly, third-party lab), IR (monthly motor / quarterly pump), ultrasonic (quarterly seal); $793 k 5-yr cost; $1,013 k NPV avoided; ROI ≈ 27.7%.",
        "Oil & Gas 5-MW gas compressor: continuous-monitoring vibration + monthly oil + IR + ultrasonic; ~$120 k capital; 2-month payback.",
        "Power BFP train: monthly vibration + monthly oil (ISO VG 32 synthetic) + IR motor terminal box + ultrasonic for steam-trap fleet upstream.",
      ],
      industrial_examples: [
        "Chemical — pump fleet: API 610 probe locations; API 614 sampling ports; IR on motor terminal box in corrosive atmospheres; ultrasonic for VOC seal leaks.",
        "Oil & Gas — gas-compressor train: continuous-monitoring vibration (proximity probes on journal bearings); ultrasonic for seal-gas system leaks.",
        "Power — BFP train: monthly vibration + monthly oil + IR motor terminal box + ultrasonic for upstream steam-trap fleet.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. 200-pump chemical plant. PdM program: quarterly vibration + annual oil, $35 k/year cost, headline ROI 380%. WM audit revealed 33% alert-to-WO conversion; true ROI 60%. After CMMS integration (alert auto-generates planned WO; planner plans within P-F window; closed-loop feedback recalibrates alarm thresholds), conversion rose to 92%; avoided failures rose from $56 k/year to $154 k/year; true ROI rose to 340%. The case demonstrates that PdM ROI is gated by CMMS integration, not by the technology alone.",
      ],
      common_errors: [
        "Deploying PdM without CMMS integration (defects found but not acted on).",
        "Setting inspection intervals by tradition, not by P-F/2.",
        "Treating all PdM technologies as interchangeable (vibration ≠ oil ≠ IR ≠ ultrasonic).",
        "No as-commissioned baseline spectrum (drift has no reference).",
        "No closed-loop feedback (alarm thresholds drift away from asset behavior).",
        "Over-capitalizing the in-house lab for a small fleet.",
        "Confusing PdM with PM (deploying PdM where PM was right, or vice versa).",
      ],
      limitations: [
        "PdM does not intercept infant-mortality (β < 1) failure modes (P-F too short).",
        "PdM does not intercept common-cause failures.",
        "P-F interval is failure-mode-specific (single per-asset value is an oversimplification).",
        "ROI is sensitive to failure-rate estimate, lost-production cost, integration quality.",
        "Technology-fit matrix is generic; plant-specific failure modes need a custom matrix.",
        "Continuous-monitoring false-positive alerts erode operator trust if not triaged promptly.",
      ],
      best_practices: [
        "Build the technology-fit matrix per asset class (pump, motor, compressor, gear, fan).",
        "Set inspection intervals by P-F/2 per route (justify the shortest P-F the route covers).",
        "Baseline each asset at commissioning (as-commissioned spectrum / sample / image / reading)..",
        "Integrate PdM with CMMS (alarm → planned WO → closeout feedback → alarm recalibration).",
        "Triage alerts within 24 hours (true vs false positive) to maintain operator trust.",
        "Use third-party oil-analysis lab below ~200 critical assets; in-house lab above.",
        "Annual review of technology-fit matrix, ROI, and alarm thresholds as failure data accrues.",
      ],
      related_concepts: [
        "Process Design (MPR 1 — P-F interval definition).",
        "Installation & Commissioning (MPR 2 — as-commissioned baseline).",
        "Reliability & Maintainability (MPR 3 — dominant-contributor analysis for PdM prioritization).",
        "Equipment Reliability (ER pillar — Condition Monitoring & Diagnostics competency).",
        "Work Management (WM pillar — Planning competency, converts PdM alerts to planned WOs).",
        "ISO 13379 / 17359 (condition monitoring and diagnostics of machines).",
      ],
      prerequisites: [
        "Process Design & Installation & Commissioning (MPR 1, 2 — P-F, baselines).",
        "Reliability & Maintainability (MPR 3 — dominant-contributor analysis).",
        "Vibration analysis basics (ISO 10816 zones; FFT spectrum; defect frequencies).",
        "Tribology and oil-analysis basics (viscosity, particle count, ferrous debris).",
        "Weibull distribution basics (shape β, characteristic life η).",
      ],
      references: [
        "SMRP CMRP BOK — MPR pillar: Maintenance Technologies.",
        "SMRP CMRP Exam Outline.",
        "ISO 55000:2014 — condition-monitoring strategy within the AMP.",
        "Mobley (2008), Maintenance Engineering Handbook, §6, §3.",
        "Campbell & Jardine (2001), Maintenance Strategy, Ch. 6.",
        "Ebeling (2010), Reliability and Maintainability Engineering, Ch. 4.",
        "Jardine & Tsang (2017), Maintenance, Replacement, and Reliability, Ch. 4.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Maintenance Technologies",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which PdM technology is the PRIMARY detector for a rolling-element bearing outer-race spall in a centrifugal pump?",
      whyCorrect:
        "Vibration analysis is the primary detector for bearing outer-race spalling — the defect generates energy at the BPFO (ball-pass frequency outer race) in the FFT spectrum, detectable months before functional seizure. Oil analysis is a useful secondary (ferrous debris rises), but vibration is the primary.",
      whyOthersWrong: [
        "Oil analysis is the secondary detector (ferrous debris rises once wear particles are shed); vibration detects the defect earlier via BPFO.",
        "Infrared thermography detects bearing overheating (a late-stage symptom) but not the early-stage outer-race spall — vibration catches it 1–6 months earlier.",
        "Ultrasonic detects bearing friction (lubrication loss) but is less specific than vibration for an outer-race spall; vibration at BPFO is the canonical primary.",
      ],
      explanation:
        "Vibration analysis detects bearing-defect frequencies (BPFO/BPFI/BSF/FTF) at the early stage of the P-F interval; oil is secondary (ferrous debris after particles shed); IR detects the late-stage overheating. Vibration is the primary for bearing outer-race spalling.",
      options: [
        { text: "Vibration analysis (BPFO defect frequency)", isCorrect: true },
        { text: "Oil analysis (ferrous debris count)", isCorrect: false },
        { text: "Infrared thermography (bearing overheating)", isCorrect: false },
        { text: "Ultrasonic (bearing friction)", isCorrect: false },
      ],
    },
    {
      competencyName: "Maintenance Technologies",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Manufacturing",
      stem: "A failure mode has a P-F interval of 4 months. Per the Moubray rule, what is the maximum useful PdM inspection interval that will reliably intercept the failure before functional loss?",
      whyCorrect:
        "t_insp ≤ t_PF / 2 = 4 / 2 = 2 months. At t_PF/2 the probability of detecting the symptom before functional failure is high; at t_PF (4 months) half of failures are missed.",
      whyOthersWrong: [
        "4 months (= t_PF) — half of failures are missed before functional loss.",
        "6 months (> t_PF) — failures will reach functional loss before the next inspection.",
        "1 month (t_PF/4) — conservative and safe but not the maximum useful; the maximum useful is t_PF/2.",
      ],
      explanation:
        "Moubray's rule: t_insp ≤ t_PF/2. At t_PF/2, the inspection cadence is dense enough to catch the symptom before functional failure with high probability. Longer intervals progressively miss failures before F.",
      options: [
        { text: "2 months (t_PF / 2)", isCorrect: true },
        { text: "4 months (= t_PF)", isCorrect: false },
        { text: "6 months (> t_PF)", isCorrect: false },
        { text: "1 month (t_PF / 4)", isCorrect: false },
      ],
    },
    {
      competencyName: "Maintenance Technologies",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Procedural",
      scenario: "Chemical",
      stem: "A chemical plant operates a 40-pump fleet with a PdM program: monthly vibration, monthly oil (third-party lab), quarterly IR, quarterly ultrasonic. The 5-year PdM cost is $793 k; the NPV of avoided failures is $1,013 k. What is the program ROI?",
      whyCorrect:
        "ROI = (NPV avoided failures − PdM cost) / PdM cost × 100 = ($1,013 k − $793 k) / $793 k × 100 = $220 k / $793 k × 100 ≈ 27.7%. Positive ROI justifies the program.",
      whyOthersWrong: [
        "127.7% — adds (not subtracts) the PdM cost to the avoided NPV; ROI is (avoided − cost)/cost, not (avoided + cost)/cost.",
        "380% — overstates; uses the headline ROI (which assumes 100% alert-to-WO conversion) instead of the realized ROI (27.7%).",
        "−21.7% — inverts the subtraction, computing (cost − avoided)/cost = ($793 k − $1,013 k)/$793 k; the right structure but wrong sign convention.",
      ],
      explanation:
        "ROI = (NPV avoided − PdM cost) / PdM cost × 100. With NPV avoided = $1,013 k and PdM cost = $793 k, ROI ≈ 27.7%. The integration with CMMS and planning is what realizes this ROI; without it, the headline figure drops to single digits.",
      options: [
        { text: "≈ 27.7%", isCorrect: true },
        { text: "127.7%", isCorrect: false },
        { text: "380%", isCorrect: false },
        { text: "−21.7%", isCorrect: false },
      ],
    },
    {
      competencyName: "Maintenance Technologies",
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Oil & Gas",
      stem: "Vibration analysis is the best PdM technology for detecting low-rate lubricant degradation in a centrifugal pump (i.e., the slow loss of viscosity or additive depletion before any mechanical symptom appears).",
      whyCorrect:
        "FALSE. Oil analysis is the primary detector for lubricant degradation (viscosity drop, additive depletion, water content) — these are chemical signatures, not mechanical. Vibration detects the consequence (bearing wear once lubrication is lost) but only after the damage has begun. Oil analysis is the early-stage detector for lubrication loss.",
      whyOthersWrong: [
        "TRUE — the trap; vibration detects the bearing wear that follows lubrication loss, but the lubrication loss itself (the early P-F symptom) is a chemical change detected by oil analysis, not a mechanical change detected by vibration.",
      ],
      explanation:
        "Lubricant degradation (viscosity, additives, water) is a chemical property measured by oil analysis. Vibration detects the mechanical consequence (bearing wear after lubrication loss); oil catches it earlier. Each technology has its detection niche — vibration for bearing defects, oil for lubricant condition.",
      options: [
        { text: "False — oil analysis is the primary detector for lubricant degradation; vibration detects the downstream bearing wear", isCorrect: true },
        { text: "True — vibration is the primary detector for lubrication degradation", isCorrect: false },
      ],
    },
    {
      competencyName: "Maintenance Technologies",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "DecisionMaking",
      skillType: "Conceptual",
      scenario: "Power",
      stem: "A 200-pump chemical plant PdM program reports a headline ROI of 380% but a realized ROI of only 60%. The WM-pillar audit reveals that only 33% of PdM alerts are converted to planned work orders. Which investment most directly closes the realized-headline gap?",
      whyCorrect:
        "CMMS integration that auto-generates planned WOs from PdM alerts and feeds closeout failure codes back to the alarm thresholds is the dominant lever — it raises the alert-to-WO conversion from 33% to 92% and lifts the realized ROI from 60% to ~340%. The technology investment is wasted without the work-management investment.",
      whyOthersWrong: [
        "Buy more PdM technologies (e.g., add acoustic emission) — the bottleneck is the alert-to-WO conversion, not the technology coverage; adding technologies without integration just produces more unattended alerts.",
        "Increase the inspection frequency (from quarterly to monthly) — denser alerts without integration just produces more unattended alerts.",
        "Replace the third-party oil-analysis lab with an in-house lab — adds capital; the bottleneck is integration, not lab capacity.",
      ],
      explanation:
        "The case demonstrates that PdM ROI is gated by CMMS integration. The realized-headline gap is the alert-to-WO conversion rate. The investment that most directly closes the gap is the CMMS integration that auto-generates planned WOs and closes the feedback loop — the joint lever of MPR (technology) and WM (work management).",
      options: [
        { text: "CMMS integration that auto-generates planned WOs from alerts and feeds closeout failure codes back to alarm thresholds", isCorrect: true },
        { text: "Buy more PdM technologies (e.g., add acoustic emission)", isCorrect: false },
        { text: "Increase the inspection frequency from quarterly to monthly", isCorrect: false },
        { text: "Replace the third-party oil-analysis lab with an in-house lab", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Public lesson export
// ---------------------------------------------------------------------------

export const CMRP_MPR_LESSONS: RefLesson[] = [
  LESSON_PROCESS_DESIGN,
  LESSON_INSTALLATION_COMMISSIONING,
  LESSON_RELIABILITY_MAINTAINABILITY,
  LESSON_MAINTENANCE_TECHNOLOGIES,
];

// ---------------------------------------------------------------------------
// Loader — writes the dataset into the database (certification track)
// ---------------------------------------------------------------------------

/**
 * Upsert the CMRP Manufacturing Process Reliability (MPR) reference dataset
 * into the database. Idempotent: safe to call repeatedly. Returns record
 * counts written.
 *
 * Flow:
 *  1. Find CMRP certification by slug "cmrp"; find MPR domain by code "MPR";
 *     map the 4 MPR competencies by NAME -> id (Process Design, Installation
 *     & Commissioning, Reliability & Maintainability, Maintenance
 *     Technologies).
 *  2. Upsert References globally (by title, no sectionId) -> a shared
 *     referenceIds array applied to every MPR lesson, KO, and question.
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
  // 1) Certification + MPR domain + competency map
  const certification = await db.certification.findUnique({
    where: { slug: "cmrp" },
  });
  if (!certification) {
    throw new Error(
      'CMRP certification not found. Run the CMRP structure loader (src/lib/ref-content/cmrp.ts) first.'
    );
  }

  const mprDomain = await db.domain.findFirst({
    where: { certificationId: certification.id, code: "MPR" },
  });
  if (!mprDomain) {
    throw new Error(
      'Manufacturing Process Reliability (MPR) domain not found under CMRP. Run the CMRP structure loader first.'
    );
  }

  const mprCompetencies = await db.competency.findMany({
    where: { domainId: mprDomain.id },
  });
  const competencyIdByName: Record<string, string> = {};
  for (const c of mprCompetencies) {
    competencyIdByName[c.name] = c.id;
  }

  // Validate that all 4 expected MPR competencies exist by name.
  const expectedCompetencyNames = CMRP_MPR_LESSONS.map((l) => l.competencyName);
  const missing = expectedCompetencyNames.filter(
    (n) => !competencyIdByName[n]
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing MPR competencies by name: ${missing.join(
        ", "
      )}. Ensure src/lib/ref-content/cmrp.ts has been loaded with the latest MPR competency names (Process Design, Installation & Commissioning, Reliability & Maintainability, Maintenance Technologies).`
    );
  }

  // 2) References — global (no sectionId), upserted by title.
  const refIdsByTitle: Record<string, string> = {};
  for (const src of CMRP_MPR_SOURCES) {
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
  const sharedReferenceIds = CMRP_MPR_SOURCES.map(
    (s) => refIdsByTitle[s.title]
  ).filter(Boolean) as string[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 3) Lessons, 4) KnowledgeObjects, 5) Questions
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of CMRP_MPR_LESSONS) {
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
      domainId: mprDomain.id,
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
          domainId: mprDomain.id,
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
    domain: mprDomain.id,
    competencies: mprCompetencies.length,
    lessons: lessonsCount,
    kos: kosCount,
    questions: questionsCount,
    references: referencesCount,
  };
}
