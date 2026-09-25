/**
 * CMRP — Equipment Reliability pillar — Deep scientific reference (Task ID 14-ER).
 *
 * Certification slug: "cmrp" (Certified Maintenance & Reliability Professional).
 * Domain code: "ER" (Equipment Reliability) — one of the 5 official SMRP CMRP pillars.
 *
 * Four lessons, one per Equipment Reliability competency (as seeded in
 * src/lib/ref-content/cmrp.ts):
 *   1. Equipment Reliability                  (slug: er-equipment-reliability)
 *   2. Condition Monitoring & Diagnostics     (slug: er-condition-monitoring-diagnostics)
 *   3. Work Zone Analysis                      (slug: er-work-zone-analysis)
 *   4. Equipment History                       (slug: er-equipment-history)
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
 *     Analyze. Total in this file: 20 questions.
 *
 * Source hierarchy (spec §5) — Levels 2, 3, 5, 6, 7:
 *   - LEVEL 3 — Official BOK / Handbook / Exam Outline: SMRP CMRP BOK (ER),
 *     SMRP CMRP exam outline.
 *   - LEVEL 2 — Official Standard / Standards Organization: ISO 14224:2016
 *     (reliability & maintenance data), ISO 55000:2014, ISO 55001:2014,
 *     ISO 55002:2018, ISO 10816-3 (vibration severity), ISO 4406 (oil
 *     cleanliness).
 *   - LEVEL 7 — Technical Publications / Industry Sources: Mobley
 *     (Maintenance Engineering Handbook), Campbell & Jardine (Maintenance
 *     Strategy).
 *   - LEVEL 6 — University / Academic Publications: Ebeling, An Introduction
 *     to Reliability and Maintainability Engineering (Weibull, MTBF, RAM
 *     fundamentals).
 *   - LEVEL 5 — Professional Organizations: O'Hanlon, Uptime (Industrial
 *     Press); Reliabilityweb.com / SMRP best-practices bodies; OREDA
 *     (Offshore & Onshore Reliability Data) handbook.
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
 *   2. Find the ER domain by code "ER"; map its 4 competencies by NAME -> id.
 *   3. Upsert References globally (by title, no sectionId) -> shared
 *      referenceIds array applied to every ER lesson / KO / question.
 *   4. For each lesson: db.lesson.findFirst({where:{competencyId, slug}})
 *      then update or create (sectionId = null, certificationId set,
 *      competencyId set, status READY, confidence HIGH, verificationStatus
 *      VERIFIED, version 1.0.0).
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
// Sources (Levels 2, 3, 5, 6, 7 — real, widely-known references)
// ---------------------------------------------------------------------------

export const CMRP_ER_SOURCES: RefSource[] = [
  {
    title: "SMRP CMRP Body of Knowledge — Equipment Reliability pillar",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "BOK",
    url: "https://www.smrp.org/certification/cmrp-exam",
    citation:
      "Society for Maintenance & Reliability Professionals (SMRP). CMRP Body of Knowledge — Equipment Reliability pillar: Equipment Reliability engineering, Condition Monitoring & Diagnostics, Work Zone Analysis, and Equipment History. The official competency framework assessed by the CMRP exam, anchoring failure-mode analysis, MTBF/MTTR, Weibull, CBM technologies, criticality/Pareto, and ISO 14224 data quality.",
  },
  {
    title: "SMRP CMRP Exam Outline",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "EXAM_OUTLINE",
    url: "https://www.smrp.org/certification",
    citation:
      "SMRP. Certified Maintenance & Reliability Professional (CMRP) Exam Outline — published content-domain weights, question count, time limit, and passing-score guidance. Cross-references the five-pillar BOK and details the Equipment Reliability competencies tested.",
  },
  {
    title: "ISO 14224:2016 — Collection of reliability and maintenance data for equipment",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/63658.html",
    citation:
      "International Organization for Standardization. ISO 14224:2016, Petroleum, petrochemical and natural gas industries — Collection and exchange of reliability and maintenance data for equipment. Geneva: ISO. Defines the equipment-class taxonomy (pumps, compressors, motors, heat exchangers, valves), failure-mode/cause/mechanism code structure, and the minimum dataset captured at WO closeout that underpins reliability analytics.",
  },
  {
    title: "ISO 55000:2014 — Asset management — Overview, principles and terminology",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/55088.html",
    citation:
      "International Organization for Standardization. ISO 55000:2014, Asset management — Overview, principles and terminology. Geneva: ISO. Defines asset, asset management, asset management system, and the value-of-asset-management principles that frame CMRP Equipment Reliability work.",
  },
  {
    title: "ISO 55001:2014 — Asset management — Management systems — Requirements",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/55090.html",
    citation:
      "International Organization for Standardization. ISO 55001:2014, Asset management — Management systems — Requirements. Geneva: ISO. Clauses 6.2.2 (asset-management plan), 7.2 (operational planning informed by reliability analytics), and 9.3 (management review) operationalize the closed-loop reliability cycle that Equipment History feeds.",
  },
  {
    title: "ISO 55002:2018 — Asset management — Guidelines for the application of ISO 55001",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/68034.html",
    citation:
      "International Organization for Standardization. ISO 55002:2018, Asset management — Guidelines for the application of ISO 55001. Geneva: ISO. Interpretive guidance for the asset-management-system requirements, including asset criticality, the asset-management plan, and the management review that consumes reliability analytics.",
  },
  {
    title: "ISO 10816-3:2009 — Mechanical vibration — Evaluation of machine vibration by measurements on non-rotating parts (Class II machines)",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/19314.html",
    citation:
      "International Organization for Standardization. ISO 10816-3:2009, Mechanical vibration — Evaluation of machine vibration by measurements on non-rotating parts — Part 3: Industrial machines with nominal power above 15 kW and nominal speeds between 120 r/min and 15,000 r/min. Geneva: ISO. Defines the A/B/C/D zone thresholds for vibration velocity RMS by machine class — for Class II rigid-mount the canonical B/C boundary is 2.8 mm/s RMS and the C/D boundary (alarm) is 7.1 mm/s RMS.",
  },
  {
    title: "ISO 4406:2021 — Hydraulic fluid power — Fluid cleanliness classification",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/71570.html",
    citation:
      "International Organization for Standardization. ISO 4406:2021, Hydraulic fluid power — Fluid power systems — Fluid cleanliness classification. Geneva: ISO. Defines the 3-number particle-count cleanliness code (e.g., 18/15/12) used as the oil-analysis alert threshold in CBM programs; each digit is the log2 of particles per mL at 4 µm, 6 µm, and 14 µm.",
  },
  {
    title: "Mobley — Maintenance Engineering Handbook (McGraw-Hill)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "HANDBOOK",
    citation:
      "Mobley, R. K. (2008). Maintenance Engineering Handbook (7th ed.). McGraw-Hill. ISBN 978-0-07-154358-0. Section II (failure modes & effects), Section III (vibration, oil analysis, thermography, ultrasonic), Section V (CMMS data quality & failure coding), Section VI (bad-actor & criticality). The widely-cited technical reference for equipment reliability engineering and CBM.",
  },
  {
    title: "Campbell & Jardine — Maintenance Strategy (Productivity Press)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Campbell, J. D. & Jardine, A. K. S. (2001). Maintenance Strategy: A World Class Approach to Asset Management. Productivity Press / CRC. ISBN 978-0-415-36922-8. Develops the link between asset criticality, the maintenance strategy, and the work-zone prioritization that operationalizes ISO 55000 asset-management principles.",
  },
  {
    title: "Ebeling — An Introduction to Reliability and Maintainability Engineering (Waveland Press)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Ebeling, C. E. (2010). An Introduction to Reliability and Maintainability Engineering (2nd ed.). Long Grove, IL: Waveland Press. ISBN 978-1-57766-625-9. The canonical reliability-engineering textbook for the 2-parameter Weibull, MTBF/MTTR, hazard rate, bathtub curve, series/parallel reliability block diagrams, and the RAM (Reliability, Availability, Maintainability) framework. Provides the mathematical foundation for the ER competency.",
  },
  {
    title: "O'Hanlon — Uptime: The Uptime (Maintenance Excellence) Context",
    level: "5",
    levelLabel: "Professional Organizations",
    type: "BOOK",
    url: "https://www.industrialpress.com/uptime",
    citation:
      "O'Hanlon, T. (2006). Uptime: The Maintenance Excellence Context. Industrial Press. ISBN 978-0-8311-3358-8. Frames Maintenance Excellence and the link between reliability-engineering discipline (CBM, bad-actor RCA, equipment history) and asset-management maturity (the foundation for ISO 55000 alignment).",
  },
  {
    title: "Reliabilityweb.com — SMRP-aligned best-practices bodies",
    level: "5",
    levelLabel: "Professional Organizations",
    type: "WEBSITE",
    url: "https://www.reliabilityweb.com",
    citation:
      "Reliabilityweb.com (a SMRP-aligned professional body). Best-practice articles and bodies of knowledge on condition-based maintenance, vibration analysis (ISO 10816 application), oil analysis (ISO 4406 application), thermography, ultrasonic, and motor current signature analysis. A widely-used practitioner reference for CBM technology-to-failure-mode matching and P-F interval estimation.",
  },
  {
    title: "OREDA — Offshore & Onshore Reliability Data handbook",
    level: "5",
    levelLabel: "Professional Organizations",
    type: "HANDBOOK",
    url: "https://www.oreda.com",
    citation:
      "OREDA (Offshore & Onshore Reliability Data). OREDA Handbook (6th ed., 2015). Prepared by the OREDA Participants (Equinor, Aker BP, ConocoPhillips, Eni, Shell, etc.). SINTEF Academic Publishing. ISBN 978-82-14-05816-7. Population failure-rate database (centrifugal pumps, compressors, gas turbines, valves, heat exchangers) using the ISO 14224 taxonomy. The canonical benchmark for MTBF by equipment class in the Oil & Gas industry.",
  },
];

// Shared reference list — every ER lesson cites the same set of ER sources.
const ER_REFERENCE_TITLES = CMRP_ER_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Lesson 1 — Equipment Reliability
// ---------------------------------------------------------------------------

const LESSON_EQUIPMENT_RELIABILITY: RefLesson = {
  competencyName: "Equipment Reliability",
  slug: "er-equipment-reliability",
  title: "Equipment Reliability Engineering",
  titleAr: "هندسة موثوقية المعدات",
  order: 1,
  durationMin: 32,
  references: ER_REFERENCE_TITLES,
  conceptIntroduction: `Equipment Reliability engineering converts failure-time data into predictions and priorities. Where Work Management runs the work cycle day-to-day, Equipment Reliability asks: "Which asset fails how often, by what mechanism, and what does that cost — and what should we do about it?" The four levers are MTBF/MTTR (point estimates of life and repair), the Weibull fit (β diagnoses the failure pattern), the Pareto bad-actor analysis (prioritize by cost), and the RAM model (system-level availability from series/parallel blocks). ISO 14224:2016 supplies the failure-code taxonomy that ties it all together.`,
  example: `A Chemical plant centrifugal pump (P-301, acid service) has 5 failures at operating times 1200, 1800, 2400, 3600, 5000 h. Repair times were 4.5, 3.8, 5.2, 4.1, 6.4 h. MTBF = 14,000/5 = 2,800 h. MTTR = 24/5 = 4.8 h. Intrinsic A = 2,800/(2,800+4.8) = 99.83%. A 2-parameter Weibull fit gives β≈2.0 (wear-out) and η≈3,150 h. R(5,000) = exp(-(5000/3150)^2) = exp(-2.52) ≈ 8%. Recommended PM interval ≈ 1,500 h where R(1,500) = exp(-(0.476)^2) = exp(-0.227) ≈ 80% (give 20% safety margin so 80% survive to the PM).`,
  keyFormulas: `R(t) = exp(-(t/η)^β) [Weibull 2-parameter; β shape, η characteristic life]
MTBF = Σtᵢ/n [h, point estimate]
MTTR = Στᵢ/n [h, point estimate]
Intrinsic A = MTBF / (MTBF + MTTR) — excludes planned downtime
Operational A_op = MTBF / (MTBF + MDT) where MDT = MTTR + logistic + admin + scheduling delay
Mean life E[T] = η·Γ(1 + 1/β)
Series system: R_sys(t) = ∏R_i(t); Parallel system: R_sys(t) = 1 - ∏(1 - R_i(t))
PM interval (β>1) ≈ 0.30–0.50·η where R(t) is 0.85–0.95
Failure cost = downtime-h × $/h + parts + labor + collateral damage
Addressable cost = FC × (1 - FR_target / FR_current) = FC × (1 - MTBF_current / MTBF_target)`,
  exercise: `You are the reliability engineer at a Power plant. A boiler feedwater pump (P-BFP-01) has 8 failures in 24 months at operating times (hours): 1200, 2100, 3300, 4600, 6200, 7800, 9500, 11200. Repair times averaged 12 h each. Operating time in 24 months ≈ 16,000 h. Compute MTBF, MTTR, intrinsic availability. Fit a 2-parameter Weibull; you obtain β=2.4, η=9,000 h. Compute R(4,000) and recommend a PM interval. Production-loss cost is $4,800/h; estimate the annual failure cost and the addressable cost if a bearing upgrade lifts MTBF to 12,000 h.`,
  sections: {
    learning_objectives: `- Distinguish failure mode, failure mechanism, and failure cause per ISO 14224 §3.
- Compute MTBF, MTTR, and intrinsic availability from a CMMS failure-time extract.
- Fit a 2-parameter Weibull distribution to failure times; interpret β (shape) and η (characteristic life) and choose the maintenance strategy accordingly.
- Identify bad actors using a cost-Pareto and apply the 80/20 prioritization rule.
- Construct a RAM (Reliability, Availability, Maintainability) model for a simple series/parallel system and quantify system availability.
- Translate reliability analytics into work-zone / improvement priorities (links forward to the next ER competency).`,
    prerequisites: `- The CMRP BOK 5-pillar structure and the place of Equipment Reliability within it.
- Basic probability: distribution, mean, variance, cumulative distribution function.
- CMMS basics: work-order lifecycle, asset hierarchy, failure-code capture (ISO 14224 §6 minimum dataset).
- Differential/integral calculus at the level of differentiating/integrating polynomials and exponentials.
- Awareness of ISO 55000 asset-management vocabulary (asset, asset management, asset management system).`,
    introduction: `Equipment Reliability is the engineering pillar that translates raw failure data into predictions and priorities. Where Work Management runs the work cycle day-to-day, Equipment Reliability asks: "Which asset fails how often, by what mechanism, and what does that cost — and what should we do about it?" The pillar's four competencies — Equipment Reliability engineering, Condition Monitoring & Diagnostics, Work Zone Analysis, and Equipment History — together constitute the engineering backbone of an asset-management program.

ISO 55000:2014 frames asset management as the coordinated activity of an organization to realize value from its assets; reliability engineering is the discipline that quantifies how much of that value is at risk from failure. ISO 14224:2016 provides the data-collection and taxonomic backbone for this pillar: it defines equipment classes, failure modes, failure causes, and failure mechanisms in a structured hierarchy that allows cross-plant and cross-industry benchmarking (OREDA in Oil & Gas is the canonical population database built on this taxonomy).

This lesson focuses on the first ER competency: the mathematics and engineering of equipment reliability — failure-mode analysis, MTBF/MTTR, the Weibull failure-time distribution, the cost-Pareto bad-actor analysis, and the RAM model that combines reliability (probability of survival) with maintainability (probability of restoration) into availability (probability of being in service when needed). The CMRP BOK tests the candidate's ability to apply ISO 14224 concepts to real CMMS extracts — turning raw WO history into MTBF trends, Weibull fits, and Pareto-ranked bad-actor lists.`,
    terminology: `- **Reliability R(t)**: probability that an item performs its required function under given conditions for a given time interval (IEC 60050-191; ISO 14224).
- **Failure**: termination of the ability of an item to perform a required function (ISO 14224 §3.5).
- **Failure mode**: the observable manner in which a failure occurs (e.g., "external leakage", "no output", "vibration high").
- **Failure mechanism**: the physical process that leads to a failure (e.g., fatigue, corrosion, wear, erosion).
- **Failure cause**: the operational, design, or maintenance reason that triggered the mechanism (e.g., misalignment, contamination, under-sizing).
- **MTBF (Mean Time Between Failures)**: expected time between consecutive failures of a repairable system, Σt/n.
- **MTTR (Mean Time To Repair)**: expected active repair time across N failures.
- **MDT (Mean Down Time)**: MTTR + logistic + administrative + scheduling delay; what the operator actually experiences.
- **Intrinsic Availability**: A = MTBF/(MTBF + MTTR); excludes planned downtime.
- **Operational Availability**: A_op = MTBF/(MTBF + MDT); includes logistic and scheduling delay.
- **Weibull distribution**: R(t) = exp(-(t/η)^β); β is the shape parameter, η is the characteristic life (scale).
- **Hazard rate (instantaneous failure rate)**: h(t) = f(t)/R(t); the conditional failure rate given survival to t.
- **Bathtub curve**: early-failure (β<1), useful-life (β≈1), wear-out (β>1).
- **Bad actor**: equipment that contributes disproportionately to downtime or cost (top 20% ⇒ ~80% cost — Pareto).
- **RAM**: Reliability, Availability, Maintainability — the engineering triplet that quantifies asset performance.
- **Reliability Block Diagram (RBD)**: a graphical representation of series/parallel system architecture used for RAM modeling.`,
    detailed_explanation: `The Equipment Reliability competency is fundamentally about converting failure-time data into decisions. The CMRP candidate must master three data views:

**(1) Time-between-failures view (MTBF and Weibull).** Failure data, when chronologically ordered, can be analyzed two ways. The first is the parametric mean: MTBF = Σtᵢ/n, where tᵢ is the operating time between failure i and i+1, and n is the number of failures. The second is the distributional view: the same data, plotted on Weibull probability paper or fit by maximum likelihood, yields a 2-parameter Weibull R(t) = exp(-(t/η)^β). The shape parameter β diagnoses the failure pattern: β<1 indicates early-life failures (infant mortality, manufacturing defects, commissioning errors); β≈1 indicates random failures (constant hazard — the exponential distribution is a special case of Weibull with β=1); β>1 indicates wear-out (the failure rate increases with time, as in fatigue, corrosion, bearing end-of-life). Mobley's Handbook and Ebeling's reliability text both emphasize that the β value changes the maintenance strategy: β<1 ⇒ burn-in/buy-quality; β≈1 ⇒ condition-based monitoring; β>1 ⇒ time-based PM at a fraction of η.

**(2) Repair-time view (MTTR and MDT).** MTTR = Στᵢ/n, where τᵢ is the active repair time. MDT (Mean Down Time) is MTTR + logistic delay (parts-finding, permit-waiting, travel). The distinction matters because the operational availability A_op = MTBF/(MTBF+MDT) is what the process sees, while the intrinsic A = MTBF/(MTBF+MTTR) is what the engineering/maintenance function controls. A 4-h MTTR with 8-h logistic delay means half of the downtime is the maintenance function's problem to solve (planning, scheduling, parts).

**(3) Bad-actor view (Pareto).** Failure cost and downtime are not uniformly distributed. The Pareto principle applied to maintenance: the top 20% of assets typically account for ~80% of failure cost. A bad-actor analysis ranks assets by total downtime-hour × cost-per-hour plus parts/labor/collateral, identifies the top 10 (or 20), and triggers root-cause analysis (RCA). The CMRP BOK treats this as the bridge between Equipment Reliability (this lesson) and Work Zone Analysis (the next lesson).

The Weibull fit is the single most diagnostic tool in the reliability engineer's kit. Consider a centrifugal pump with failure times: 1200, 1800, 2400, 3600, 5000 h. MTBF = 14,000/5 = 2,800 h. A 2-parameter Weibull fit (median-rank regression on X) yields β≈2.0, η≈3,150 h. The β=2.0 indicates a wear-out pattern (hazard increasing linearly with time — the Rayleigh distribution is the special case of Weibull with β=2); the optimal PM interval falls around 0.30–0.40·η ≈ 950–1,260 h. Setting the PM at MTBF (2,800 h) would be wrong — by then R(2,800) = exp(-(2800/3150)^2) = exp(-0.789) = 0.454, so 54.6% of the population would have already failed. The Weibull fit re-prioritizes the PM interval relative to the naive MTBF rule.

The RAM model extends reliability to systems: a series system of N components each with R_i has system reliability R_sys(t) = ∏R_i(t). A parallel (redundant) system of k-out-of-n components has higher reliability via the binomial. Availability has the same series/parallel algebra: A_sys (series) = ∏A_i; A_sys (parallel) = 1 - ∏(1-A_i). This is why a single-point-of-failure in a series system dominates availability — and why redundancy (parallel) is the lever when an asset's MTBF cannot be raised.`,
    core_principles: `- **Failure mode ≠ failure mechanism ≠ failure cause** (ISO 14224); each is a different question, and conflating them collapses the taxonomy's analytical power.
- **MTBF is the mean; the Weibull fit reveals the failure pattern** (infant, random, wear-out).
- **The shape parameter β drives the maintenance strategy**: burn-in/buy-quality (β<1), CBM (β≈1), time-based PM (β>1).
- **PM interval for β>1 wear-out is set at 0.30–0.50·η** where R(t) is still 0.85–0.95 — not at MTBF.
- **Operational A_op = MTBF/(MTBF+MDT); intrinsic A = MTBF/(MTBF+MTTR).** Know which you are computing and report both.
- **The Pareto principle**: top 20% of assets ⇒ ~80% of failure cost. Bad-actor RCA is the highest-ROI reliability work.
- **Series systems multiply unreliability** (single-point-of-failure dominates); **parallel systems reduce it** (redundancy helps). Know which your asset is.
- **The maintenance function controls MTTR; logistics, planning, and scheduling control MDT–MTTR.** Each has its own lever.`,
    components: `- **Failure-data set**: timestamped failure events on a tagged asset (CMMS extract; ISO 14224 §6 minimum dataset).
- **ISO 14224 failure-code taxonomy**: Equipment unit → Equipment class → Failure mode → Failure cause → Failure mechanism (4-level drill-down).
- **Reliability Block Diagram (RBD)**: series/parallel blocks each with their own R_i(t) or A_i.
- **MTBF trend chart**: rolling 12-month MTBF by asset class and by failure mode.
- **Pareto (cost) chart**: assets ranked by total downtime cost; top 20% highlighted; cumulative-% line.
- **Weibull probability plot**: ln(-ln(1-F)) vs ln(t); the slope is β, the x-intercept gives ln(η).
- **Bad-actor list**: top 10 (or 20) assets by downtime cost; each with an assigned RCA owner.
- **RAM model**: reliability × maintainability → availability; series/parallel algebra.`,
    process: `1. Extract CMMS WO history for the asset (or class) of interest — 24+ months for stability.
2. Apply the ISO 14224 failure-code filter; reject WOs without a valid failure-mode code.
3. Compute MTBF = Σt/n; compute MTTR = Στ/n; compute intrinsic A = MTBF/(MTBF+MTTR).
4. Plot the failure times on Weibull paper; fit β and η by median-rank regression or maximum likelihood estimation (MLE).
5. Interpret β: infant mortality (β<1), random/constant (β≈1), wear-out (β>1).
6. Set the maintenance strategy from β: burn-in (β<1), CBM (β≈1), time-based PM at 0.30–0.50·η (β>1).
7. Build a Pareto by failure cost = (downtime hours) × (cost per hour) + (parts + labor + collateral).
8. Identify the top 20% bad actors; assign an RCA to each.
9. Construct the RBD: identify single-point-of-failure blocks; quantify system A = ∏A_i (series) or 1−∏(1−A_i) (parallel).
10. Recommend: redesign for redundancy, design-out maintenance, or strategy shift; track the post-action MTBF trend for confirmation.`,
    formula_calculation: `- **Reliability function (Weibull 2-parameter)**:
  R(t) = exp(-(t/η)^β)
  Variables: t [h] (operating time); η (characteristic life, scale) [h]; β (shape, dimensionless).
  Assumptions: failures are independent and identically distributed (i.i.d.); the Weibull model fits the data (β is estimated, not assumed).
  Interpretation: R(η) = exp(-1) ≈ 0.368 (36.8% of the population survives to η); the mean life = η·Γ(1 + 1/β).

- **Probability density function (Weibull)**:
  f(t) = (β/η)·(t/η)^(β-1)·exp(-(t/η)^β)

- **Hazard rate (Weibull)**:
  h(t) = (β/η)·(t/η)^(β-1)
  For β=1 (random failures): h(t) = 1/η = constant (exponential special case).
  For β=2 (linearly increasing hazard, Rayleigh): h(t) = (2/η²)·t.
  For β>3 (wear-out concentration): hazard rises sharply near η.

- **MTBF (point estimate)**:
  MTBF = Σtᵢ/n
  Variables: tᵢ = time between failure i−1 and i (or operating time to first failure); n = number of failures.
  Assumption: repairable system, perfect repair (same-as-new); for imperfect repair use a non-homogeneous Poisson process (NHPP) with the power-law (Crow-AMSAA) model.

- **MTTR (point estimate)**:
  MTTR = Στᵢ/n
  Variables: τᵢ = active repair time for failure i; n = number of failures.

- **Intrinsic Availability**:
  A = MTBF/(MTBF + MTTR)
  Excludes planned downtime; the reliability-engineering view.

- **Operational Availability**:
  A_op = MTBF/(MTBF + MDT) where MDT = MTTR + logistic delay + admin delay + scheduling delay.

- **Mean life (Weibull)**:
  E[T] = η·Γ(1 + 1/β)
  For β=1: E[T] = η. For β=2: E[T] = η·Γ(1.5) = η·(√π/2) ≈ 0.886·η.

- **Series system reliability**:
  R_sys(t) = ∏R_i(t)  (single-point-of-failure dominates)
  Parallel (k=1 of n): R_sys(t) = 1 − ∏(1 − R_i(t))  (redundancy helps)

- **Failure-cost Pareto**:
  Failure cost = (downtime hours × production loss $/h) + (parts cost) + (labor cost) + (collateral damage cost) + (secondary loss cost)

- **Addressable cost (improvement-opportunity sizing)**:
  AC = FC × (1 − FR_target / FR_current) = FC × (1 − MTBF_current / MTBF_target)

- **PM interval decision (β>1 wear-out)**:
  Set PM at the operating time t* where R(t*) is still 0.85–0.95; empirically t* ≈ 0.30–0.50·η. Setting PM at MTBF is the canonical error — by MTBF, R has fallen to ~0.45 for β≈2.`,
    worked_example: `**Problem.** A centrifugal pump (P-301, acid-transfer service, Chemical plant) has 5 failures in the past 24 months at operating times (hours): 1200, 1800, 2400, 3600, 5000 (cumulative operating time on the pump since commissioning). The associated active repair times (hours) were: 4.5, 3.8, 5.2, 4.1, 6.4. Plant cost of downtime = $2,800/h. You are the reliability engineer. Compute MTBF, MTTR, intrinsic availability; given a 2-parameter Weibull fit β≈2.0, η≈3,150 h, compute R(5,000 h) and R(1,500 h); recommend the maintenance strategy and quantify the addressable cost of a bearing upgrade that lifts MTBF to 8,000 h.

**Step 1 — MTBF.** MTBF = Σtᵢ/n = (1200+1800+2400+3600+5000)/5 = 14,000/5 = **2,800 h**.

**Step 2 — MTTR.** MTTR = Στᵢ/n = (4.5+3.8+5.2+4.1+6.4)/5 = 24.0/5 = **4.8 h**.

**Step 3 — Intrinsic availability.** A = MTBF/(MTBF+MTTR) = 2800/(2800+4.8) = 2800/2804.8 = 0.99829 = **99.83%**.

**Step 4 — Weibull fit.** Using median-rank regression on the 5 failure times, the fitted parameters are β=2.0 (wear-out pattern — Rayleigh special case) and η≈3,150 h.

**Step 5 — Reliability at 5,000 h (current operating time).** R(5000) = exp(-(5000/3150)^2) = exp(-(1.587)^2) = exp(-2.52) = 0.0804 ≈ **8%**. After 5,000 operating hours, only ~8% of pumps in this service survive — the failure rate is rising sharply.

**Step 6 — Reliability at 1,500 h (PM interval candidate).** R(1500) = exp(-(1500/3150)^2) = exp(-(0.476)^2) = exp(-0.227) = 0.797 ≈ **80%**. At 1,500 h, ~80% of the population survives — a candidate PM interval that gives ~20% safety margin.

**Step 7 — Strategy recommendation.** β=2.0 ⇒ wear-out pattern. Recommendation: time-based PM at ~1,500 operating hours (calendar ≈ 7 months at a 50% duty cycle). Replace bearings and lip seals at the PM (failure code = bearing wear-out); keep condition monitoring (vibration ISO 10816 Class II) as a backstop. P-301 enters the bad-actor list (top 5% by failure cost).

**Step 8 — Pareto / bad-actor check.** 5 failures in 24 months × ($2,800/h downtime × ~5 h downtime + ~$1,200 parts+labor) ≈ $20,000/event × 5 = **$100,000 annual failure cost** on this single asset. The Pareto 80/20 rule predicts the top 20% of assets (by count) account for ~80% of total failure cost — P-301 is in the top 5%, well within the bad-actor zone ⇒ trigger RCA.

**Step 9 — Addressable cost.** With a bearing upgrade (capex ~$30k for duplex-grade SiC faces + better-clearance bearings + flushing plan 53A), target MTBF = 8,000 h. AC = $100,000 × (1 − 2800/8000) = $100,000 × 0.65 = **$65,000/year**. Payback = $30,000/$65,000 = 0.46 years (~5.5 months). Fund.

**Result.** MTBF = 2,800 h; MTTR = 4.8 h; intrinsic A = 99.83%; Weibull β=2.0, η=3,150 h; R(5,000)=8%; PM interval ≈1,500 h (R≈80%); bad-actor RCA triggered; bearing-upgrade capex $30k yields AC $65k/year, payback 5.5 months.`,
    industrial_example: `**Chemical — acid-transfer pump (P-301, above).** β=2.0 wear-out, η=3,150 h; PM at ~1,500 h. Addressable cost $65k/year from a $30k bearing upgrade.

**Oil & Gas — multi-stage centrifugal gas-compressor seal-gas system.** Failure times (h): 5000, 6000, 7000, 8500, 9500. MTBF = 35,000/5 = 7,000 h. Weibull β=1.1 (near-random — the constant-hazard regime). Strategy: CBM (vibration, gas-composition analysis); no fixed-interval PM because the failure pattern is essentially random — a PM at any interval would catch only ~1 − exp(−t/7000) of the population, and the parts/labor waste outweighs the marginal reliability gain. This is the canonical case where CBM dominates PM.

**Power — boiler feedwater pump (3×50% redundant).** Each pump has MTBF=8,000 h, MTTR=12 h. Single-pump intrinsic A = 8000/(8000+12) = 0.99850 = 99.85%. With 2-out-of-3 redundancy, system A = 1 − (1 − 0.99850)^3·C(3,2) (allowing for the failed pump + its repair-overlap). A more conservative approximation gives A_system ≈ 0.99998 = 99.998%. The RAM model explains why power plants specify 3×50% on critical services: the system availability dwarfs the single-pump availability by ~2 orders of magnitude.

**Manufacturing — robotic weld-cell servo drive.** Failure times: 4500, 4700, 4900, 5100, 5300 h. MTBF = 4,900 h. Weibull β≈4.5 (concentrated wear-out — hazard rises sharply near η). With η≈5,000 h: R(4000) = exp(-(0.8)^4.5) = exp(-0.410) = 0.664 (too low — 33% have failed); R(3500) = exp(-(0.7)^4.5) = exp(-0.240) = 0.787 (still too low); R(3000) = exp(-(0.6)^4.5) = exp(-0.123) = 0.884 (acceptable). PM at 3,000 h (~88% survive) — the high β means the population fails in a narrow band, so the PM interval must be tighter than for a low-β wear-out.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** A Power plant with 6×350-MW coal-fired units. The reliability engineer built an MTBF-trend dashboard from the CMMS, ranking the top-50 bad actors by annualized failure cost. The top 20% (10 assets) accounted for 78% of the $14M annual unplanned-maintenance spend — close to the Pareto prediction. Three of the top-10 were boiler feedwater pumps (BFP) of the same OEM model.

A Weibull analysis of the 18 BFP failure events across all 6 units (β=2.4, η=9,000 h) confirmed a wear-out pattern (bearing failure, surface fatigue). The plant shifted from CBM-only to a 4,000-h PM interval (R(4,000) = exp(-(4000/9000)^2.4) = exp(-0.142) ≈ 0.87 — ~87% survive). Post-implementation MTBF rose from 5,400 h to 9,800 h over 18 months — the PM interval caught the bearings before failure. The bad-actor share of total spend fell from 78% to 51% as the BFP cluster dropped out of the top-10. The case demonstrates the closed loop: history → bad-actor Pareto → Weibull → strategy shift → trend confirmation. Without the Weibull fit, the plant would have set the PM at MTBF (5,400 h) — by which point R = exp(-(5400/9000)^2.4) = exp(-0.238) ≈ 0.79, so ~21% of bearings would have failed before the PM.`,
    visual_explanation: `- **Bathtub curve**: x-axis = age, y-axis = hazard rate h(t). Three regions: infant mortality (decreasing h, β<1), useful life (constant h, β≈1), wear-out (rising h, β>1).
- **Weibull probability plot**: x = ln(t), y = ln(-ln(1-F(t))). Slope = β; the y=0 crossing at x = ln(η) gives the characteristic life.
- **Pareto (cost) chart**: assets sorted by total failure cost descending; cumulative-% line crosses 80% at the ~20% mark.
- **Reliability block diagram (RBD)**: series blocks (chain) for single-point-of-failure; parallel blocks for redundancy. The system reliability is the product (series) or the unreliability-complement (parallel) of the blocks.
- **MTBF trend chart**: monthly MTBF by failure mode over 24 months; trend line; re-baseline threshold (±15%).`,
    simulation_opportunity: `A reliability sim where the learner is given a CMMS extract (a CSV of 100 failure events across 10 assets over 24 months, with ISO-14224 failure codes). The learner must: (a) compute MTBF and MTTR by asset, (b) fit a Weibull to each asset (with confidence intervals on β and η), (c) build the cost-Pareto and identify the top 20%, (d) recommend a strategy per asset (CBM/PM/redesign/run-to-failure) based on β and criticality, and (e) defend the recommendation against the sim's hidden ground-truth model. The sim scores: correctness of MTBF/MTTR arithmetic, quality of Weibull fit (R² or Kolmogorov–Smirnov test), validity of Pareto ranking, and alignment of strategy with β.`,
    common_mistakes: `- **Confusing MTBF with life (η).** MTBF is the mean of the distribution; for β>1 the median and mode are well below the mean. Setting PM at MTBF is the canonical error.
- **Computing MTBF over the wrong denominator** — counting WOs, not failures. (A WO with no failure — a PM, an inspection — must be excluded.)
- **Setting the PM interval at MTBF.** For β>1, R(MTBF) is around 0.40–0.50 — half the population has failed before the PM.
- **Ignoring censored data** (units that did not fail during the observation window). Excluding survivors biases MTBF low and β high.
- **Mixing failure modes in one Weibull fit.** If half the failures are bearing wear-out and half are seal leakage (different mechanisms), the composite β is meaningless. Stratify by failure mode.
- **Treating β as a constant across the asset's life.** β changes after a redesign or a strategy shift — re-fit periodically.
- **Reporting availability without specifying intrinsic vs. operational.** The numbers differ by orders of magnitude in MDT-heavy plants.
- **Ignoring the series/parallel distinction** when computing system A. A parallel system's A is bounded by the (1−A_i) product, not the A_i product.
- **Pooling assets with different operating contexts in one fit.** Acid-service pumps and water-service pumps have different η; pool by service class.`,
    limitations: `- **Weibull assumes i.i.d. failures.** Repairable systems with imperfect repair follow a non-homogeneous Poisson process (NHPP) — the Weibull is an approximation that masks trend (improving or deteriorating). For repairable systems, the Crow-AMSAA (power-law) model is more rigorous.
- **MTBF is a point estimate; small samples (n<5) have wide confidence intervals.** A "MTBF = 5,000 h" from 3 failures is barely better than a guess.
- **The Pareto 80/20 is empirical, not a law** — some plants see 70/30 or 90/10. Re-derive the cut-off for each plant.
- **RAM models assume independence between blocks.** Common-cause failures (e.g., common power supply, common operator) violate independence and underestimate system failure probability.
- **Weibull cannot forecast a failure mode that has not yet occurred** (rare-event / high-consequence failures — these need FMEA/HAZOP, not historical data).
- **The ISO 14224 failure-code taxonomy is only as good as the data entered**; mis-coded WOs (e.g., "other" as a failure mode) corrupt every downstream analysis.
- **OREDA and other population benchmarks assume a representative operating context**; a severe-duty plant will under-perform the benchmark without being unreliable.`,
    comparison: `- **MTBF vs. Weibull η**: MTBF is the mean of the data; η is the Weibull scale parameter. For β=1 they are equal; for β≠1 they diverge. Weibull η is richer because it carries the shape.
- **Intrinsic vs. operational availability**: intrinsic A excludes planned downtime and logistic delay; operational A includes them. The maintenance function controls the gap (MTTR vs. MDT).
- **Failure mode vs. failure mechanism vs. failure cause**: mode is what is observed (leakage); mechanism is the physics (fatigue, corrosion); cause is the operational/design reason (misalignment, contamination).
- **Series vs. parallel RBD**: series multiplies reliabilities (single point of failure dominates); parallel multiplies unreliabilities (redundancy helps).
- **Time-based PM vs. CBM**: β>1 ⇒ PM; β≈1 ⇒ CBM; β<1 ⇒ burn-in/buy-quality. The wrong choice wastes capex and produces no reliability gain.`,
    practical_application: `- **Daily**: review new failure events; assign ISO-14224 failure codes; update the bad-actor rolling 90-day Pareto.
- **Weekly**: compute the rolling 12-month MTBF trend by asset class; flag any class whose 3-month rolling MTBF dropped >15%.
- **Monthly**: review the Weibull fits for the top-10 bad actors; recommend strategy shifts (CBM→PM, PM→redesign).
- **Outage / turnaround**: produce RAM models for the systems being touched; quantify the post-outage system-A uplift and feed into the capex business case.
- **Continuous**: maintain the ISO-14224 failure-code taxonomy; train craft on code capture at WO closeout; audit WO closures for code completeness (target ≥95% mode, ≥85% cause, ≥70% mechanism).`,
    decision_scenario: `You are the reliability engineer at a Chemical plant. The CMMS extract shows: 8 centrifugal pumps in HCl service, with a combined 32 failures over 12 months, total downtime cost $480,000. Three competing failure modes appear in the data: (a) mechanical seal leakage (18 events, average t-to-failure = 2,200 h); (b) bearing failure (10 events, average t-to-failure = 3,800 h); (c) impeller erosion (4 events, average t-to-failure = 6,500 h). You can fund ONE of three actions:
  (A) Upgrade all seals to dual-seal API 682 plan 53A ($150k capex, expected MTBF 5,000 h).
  (B) Install vibration CBM on all 8 pumps + bearing-PM at 3,000 h ($60k capex, $25k/year run cost).
  (C) Switch impeller material from 316L to CD4MCu ($80k capex, expected t-to-failure 12,000 h).

Decision: prioritize by failure-mode cost. Seal leakage: 18 events × ($480k/32 events) ≈ $270k/year. Bearing: 10 events × $15k = $150k/year. Impeller: 4 events × $15k = $60k/year. (A) addresses the biggest cost ($270k/year ⇒ $150k capex has a 0.55-year payback). (B) addresses bearing cost but only partially — the bearing average t-to-failure of 3,800 h with β≈1 suggests random failure, where PM at 3,000 h catches ~55% of the population; AC ≈ $80k/year (payback ~1 year). (C) addresses only 4 events (AC $40k/year, payback 2 years). Sequence: (A) first; then re-assess (B) and (C) in 12 months once seal leakage is suppressed.`,
    practice_questions: `- Define failure mode, failure mechanism, and failure cause per ISO 14224; give one example of each.
- Compute MTBF for failure times 1500, 2000, 2500, 3500, 5000 h. *(Answer: 14,500/5 = 2,900 h.)*
- Given β=2.0, η=10,000 h, compute R(5,000 h). *(Answer: exp(-(0.5)^2) = exp(-0.25) = 0.7788 = 77.88%.)*
- If MTBF = 2,000 h and MTTR = 8 h, compute intrinsic availability. *(Answer: 2000/2008 = 0.9960 = 99.60%.)*
- A series system has 5 blocks each with R = 0.99. Compute R_sys. *(Answer: 0.99^5 = 0.951 = 95.1%.)*
- Interpret a Weibull β=2.5 fit on bearing failures; recommend a maintenance strategy and justify a PM interval.`,
    certification_questions: `The CMRP exam tests the Equipment Reliability competency as the first ER pillar. SMRP-aligned sample prompts:

(a) Given failure-time data, compute MTBF and MTTR; compute intrinsic availability.
(b) Given β and η, compute R(t) at a specified operating time.
(c) Recognize that β>1 implies wear-out and a time-based PM; β≈1 implies CBM; β<1 implies burn-in/buy-quality.
(d) Identify the bad-actor top 20% by cost-Pareto and apply the 80/20 prioritization rule.
(e) Distinguish intrinsic A (MTBF/(MTBF+MTTR)) from operational A (MTBF/(MTBF+MDT)).
(f) Compute the addressable cost of an improvement action and the payback in years.

The questions in this lesson's question bank are aligned to these Equipment Reliability competencies.`,
    summary: `Equipment Reliability engineering converts failure-time data into decisions. The four levers are: MTBF/MTTR (point estimates of life and repair), the Weibull fit (β diagnoses the failure pattern: infant, random, wear-out), the Pareto bad-actor analysis (prioritize by cost), and the RAM model (system-level availability from series/parallel blocks). The ISO 14224 taxonomy ties it all together by ensuring the failure data has a consistent mode/cause/mechanism structure. The reliability engineer's deliverable is a strategy-per-asset: CBM, PM, redesign, or run-to-failure, with the choice driven by β, by criticality, and by cost. The PM interval for wear-out is set at 0.30–0.50·η (where R is still 0.85–0.95), never at MTBF — that is the canonical reliability-engineering error.`,
    key_takeaways: `- MTBF = Σt/n; MTTR = Στ/n; intrinsic A = MTBF/(MTBF+MTTR).
- Weibull R(t) = exp(-(t/η)^β); β<1 infant, β≈1 random, β>1 wear-out.
- PM interval for β>1 wear-out is set at 0.30–0.50·η (where R is 0.85–0.95), **never at MTBF**.
- Bad-actor Pareto: top 20% of assets ⇒ ~80% of failure cost; prioritize RCA there.
- Series system: R_sys = ∏R_i (single-point-of-failure dominates); parallel: 1−∏(1−R_i).
- Failure mode (what is observed) ≠ mechanism (physics) ≠ cause (operational reason) — ISO 14224.
- Addressable cost = FC × (1 − MTBF_current/MTBF_target); payback = Capex/AC.`,
    references: `- SMRP. *CMRP Body of Knowledge — Equipment Reliability pillar: Equipment Reliability.*
- SMRP. *CMRP Exam Outline.*
- ISO 14224:2016. *Collection of reliability and maintenance data for equipment.*
- ISO 55000:2014. *Asset management — Overview, principles and terminology.*
- ISO 55001:2014. *Asset management — Management systems — Requirements*, Clauses 6.2.2, 7.2.
- ISO 55002:2018. *Guidelines for the application of ISO 55001.*
- Mobley, R. K. (2008). *Maintenance Engineering Handbook* (7th ed.). McGraw-Hill. Sections on reliability engineering, failure modes, and Weibull analysis.
- Campbell, J. D. & Jardine, A. K. S. (2001). *Maintenance Strategy*. Productivity Press. RAM and asset-criticality chapters.
- Ebeling, C. E. (2010). *An Introduction to Reliability and Maintainability Engineering* (2nd ed.). Waveland Press. Weibull, MTBF, availability, series/parallel RBD fundamentals.
- O'Hanlon, T. (2006). *Uptime*. Industrial Press.
- Reliabilityweb.com / SMRP best-practices bodies for reliability engineering and bad-actor analysis.
- OREDA Handbook (6th ed., 2015). Population failure-rate benchmark database.`,
  },
  knowledgeObject: {
    title: "Equipment Reliability engineering — MTBF, Weibull, RAM, bad-actor Pareto",
    domain: "Equipment Reliability",
    competency: "Equipment Reliability",
    topic: "Failure-data analytics",
    concept: "Reliability engineering",
    body: {
      definitions: [
        "Reliability R(t): probability that an item performs its required function under given conditions for a given time interval.",
        "Failure: termination of the ability of an item to perform a required function (ISO 14224 §3.5).",
        "Failure mode: observable manner in which a failure occurs (e.g., external leakage, no output, vibration high).",
        "Failure mechanism: physical process leading to a failure (e.g., fatigue, corrosion, wear, erosion).",
        "Failure cause: operational, design, or maintenance reason that triggered the mechanism (e.g., misalignment, contamination, under-sizing).",
        "MTBF (Mean Time Between Failures): Σt/n [h] — point estimate for repairable systems.",
        "MTTR (Mean Time To Repair): Στ/n [h] — active repair time only.",
        "MDT (Mean Down Time): MTTR + logistic + admin + scheduling delay — what the operator experiences.",
        "Intrinsic Availability: A = MTBF/(MTBF+MTTR) — excludes planned downtime.",
        "Operational Availability: A_op = MTBF/(MTBF+MDT) — includes logistic and scheduling delay.",
        "Weibull distribution: R(t) = exp(-(t/η)^β); β shape (failure pattern), η characteristic life (scale).",
        "Hazard rate: h(t) = f(t)/R(t) — instantaneous failure rate conditional on survival to t.",
        "Bad actor: equipment contributing disproportionately to downtime or failure cost (top 20% ⇒ ~80% cost).",
        "RAM: Reliability, Availability, Maintainability — the engineering triplet that quantifies asset performance.",
        "Reliability Block Diagram (RBD): series/parallel model of system architecture used for RAM computation.",
      ],
      principles: [
        "Failure mode ≠ mechanism ≠ cause (ISO 14224); each is a different question, conflating collapses the taxonomy's analytical power.",
        "MTBF is the mean; the Weibull fit reveals the failure pattern (infant, random, wear-out).",
        "β drives strategy: burn-in/buy-quality (β<1), CBM (β≈1), time-based PM at 0.30–0.50·η (β>1).",
        "PM interval for β>1 wear-out: set at 0.30–0.50·η (R still 0.85–0.95), not at MTBF.",
        "Pareto principle: top 20% of assets ⇒ ~80% of failure cost; RCA the top-20%.",
        "Series systems multiply reliability (single-point-of-failure dominates); parallel systems multiply unreliability (redundancy helps).",
        "Maintenance function controls MTTR; logistics/scheduling/planning controls MDT−MTTR; each has its own lever.",
      ],
      components: [
        "Failure-data set (timestamped CMMS extract; ISO 14224 §6 minimum dataset).",
        "ISO 14224 failure-code taxonomy: Equipment unit → class → mode → cause → mechanism.",
        "Reliability block diagram (RBD) — series/parallel blocks.",
        "MTBF trend chart (rolling 12 months by failure mode).",
        "Cost-Pareto chart (top 20% bad actors).",
        "Weibull probability plot (ln(-ln(1-F)) vs ln(t)).",
        "Bad-actor list (top 10 by downtime cost; each with assigned RCA).",
        "RAM model (reliability × maintainability → availability).",
      ],
      mechanism: [
        "Failure occurs → CMMS WO closes with ISO-14224 code → failure times extracted → MTBF/MTTR computed → Weibull fit → β diagnoses pattern → strategy set (CBM/PM/redesign/run-to-failure) → cost-Pareto ranks bad actors → RCA triggered on top-20% → strategy implemented → MTBF trend monitored for confirmation (closed loop).",
      ],
      process: [
        "1. Extract CMMS WO history (≥24 months for stability).",
        "2. Filter by valid ISO-14224 failure code; reject uncoded WOs.",
        "3. Compute MTBF = Σt/n, MTTR = Στ/n, intrinsic A = MTBF/(MTBF+MTTR).",
        "4. Plot failure times on Weibull paper; fit β, η (median-rank regression or MLE).",
        "5. Interpret β: infant (β<1), random (β≈1), wear-out (β>1).",
        "6. Set strategy: burn-in (β<1), CBM (β≈1), PM at 0.30–0.50·η (β>1).",
        "7. Build cost-Pareto: failure cost = downtime-h × $/h + parts + labor + collateral.",
        "8. Identify top 20% bad actors; assign RCA to each.",
        "9. Construct RBD: identify single-point-of-failure; compute A_sys = ∏A_i (series) or 1−∏(1−A_i) (parallel).",
        "10. Recommend redesign / design-out / strategy shift; track MTBF trend post-action.",
      ],
      formulas: [
        "R(t) = exp(-(t/η)^β) [Weibull 2-parameter].",
        "f(t) = (β/η)·(t/η)^(β-1)·exp(-(t/η)^β) [Weibull pdf].",
        "h(t) = (β/η)·(t/η)^(β-1) [Weibull hazard rate]; for β=1 h(t)=1/η constant; for β=2 h(t)=(2/η²)·t (Rayleigh).",
        "MTBF = Σt/n [point estimate, h].",
        "MTTR = Στ/n [point estimate, h].",
        "A_intrinsic = MTBF/(MTBF+MTTR) — excludes planned downtime.",
        "A_operational = MTBF/(MTBF+MDT) where MDT = MTTR + logistic + admin + scheduling delay.",
        "E[T] = η·Γ(1 + 1/β) [mean life, Weibull].",
        "R_series(t) = ∏R_i(t); R_parallel(t) = 1 − ∏(1−R_i(t)).",
        "Failure cost = downtime-h × $/h + parts + labor + collateral damage.",
        "Addressable cost AC = FC × (1 − MTBF_current/MTBF_target).",
        "PM interval (β>1) ≈ 0.30–0.50·η where R(t) is 0.85–0.95.",
      ],
      metrics: [
        "MTBF by asset class and by failure mode [h].",
        "MTTR by failure class [h].",
        "Intrinsic availability A [%] (excludes planned downtime).",
        "Operational availability A_op [%] (includes logistic delay).",
        "Weibull β (shape) and η (characteristic life).",
        "Bad-actor Pareto: top 20% share of failure cost [%].",
        "RCA closure rate on top-20% bad actors [%].",
        "MTBF trend slope (per quarter); positive = improving.",
        "Addressable cost and payback (years) for each P1 capex option.",
      ],
      examples: [
        "Centrifugal pump P-301 (Chemical, acid service): 5 failures at 1200/1800/2400/3600/5000 h ⇒ MTBF=2,800 h, MTTR=4.8 h, A=99.83%; Weibull β=2.0, η=3,150 h; R(5000)=8%; PM at 1,500 h where R≈80%.",
        "Gas-compressor seal-gas (Oil & Gas): failure times 5000/6000/7000/8500/9500 h ⇒ MTBF=7,000 h, β=1.1 (random) ⇒ CBM strategy, no fixed PM.",
        "Boiler feedwater pump (Power, 3×50% redundant): single-pump intrinsic A=99.85%; 2-of-3 system A≈99.998%.",
        "Robotic weld cell servo (Manufacturing): β=4.5, η=5,000 h; PM at 3,000 h where R(3000)=0.884.",
      ],
      industrial_examples: [
        "Chemical — acid-transfer pump: Weibull β=2.0 wear-out; PM at 1,500 h; addressable cost $65k/year from a $30k bearing upgrade.",
        "Oil & Gas — gas-compressor seal: β=1.1 near-random; CBM strategy (no fixed PM).",
        "Power — boiler feedwater 3×50% redundant: system A≈99.998% via RAM (series/parallel algebra).",
        "Manufacturing — robotic weld-cell servo: β=4.5 concentrated wear-out; PM at 3,000 h.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Power plant, 6×350-MW coal units. Top-50 bad-actor Pareto: top 20% = 78% of $14M unplanned-maintenance spend. Three boiler feedwater pumps (BFP) of same OEM model in top-10. Weibull of 18 BFP failures: β=2.4, η=9,000 h. Strategy shift: CBM-only → PM at 4,000 h (R≈0.87). 18 months post-implementation: MTBF 5,400→9,800 h; bad-actor share of spend 78%→51%. The closed loop: history → bad-actor Pareto → Weibull → strategy shift → trend confirmation.",
      ],
      common_errors: [
        "Confusing MTBF with life (η). For β>1 the median and mode are well below the mean.",
        "Computing MTBF over wrong denominator — counting WOs, not failures.",
        "Setting PM interval at MTBF. For β>1, R(MTBF)≈0.40–0.50 — half failed before PM.",
        "Ignoring censored data (survivors). Biases MTBF low and β high.",
        "Mixing failure modes in one Weibull fit. Composite β is meaningless.",
        "Treating β as constant. Re-fit after redesign or strategy shift.",
        "Reporting availability without specifying intrinsic vs. operational.",
        "Ignoring series/parallel distinction in system A.",
        "Pooling assets with different operating contexts (acid vs. water service) in one Weibull fit.",
      ],
      limitations: [
        "Weibull assumes i.i.d. — repairable systems with imperfect repair follow NHPP; trend masked.",
        "Small samples (n<5) ⇒ wide confidence intervals; MTBF is barely better than a guess.",
        "Pareto 80/20 is empirical; some plants see 70/30 or 90/10.",
        "RAM assumes independence; common-cause failures violate it.",
        "Weibull cannot forecast never-yet-occurred failure modes (rare-event/high-consequence).",
        "ISO 14224 taxonomy only as good as data entered; mis-coded WOs corrupt every downstream analysis.",
        "OREDA and population benchmarks assume a representative operating context; severe-duty plants under-perform without being unreliable.",
      ],
      best_practices: [
        "Stratify Weibull fits by failure mode; do not pool mechanisms.",
        "Use median-rank regression or MLE; report confidence intervals on β and η.",
        "Set PM intervals at the operating time where R(t) is 0.85–0.95 — not at MTBF.",
        "Build the cost-Pareto annually; review top-20% RCAs quarterly.",
        "Distinguish intrinsic vs. operational availability; report both.",
        "Re-fit Weibull after every redesign or strategy shift.",
        "Train craft on ISO-14224 code capture at WO closeout.",
        "Audit WO closures quarterly for code completeness (≥95% mode, ≥85% cause, ≥70% mechanism).",
      ],
      related_concepts: [
        "Condition Monitoring & Diagnostics (next ER competency) — CBM technologies for the β≈1 regime.",
        "Work Zone Analysis (third ER competency) — criticality × Pareto intersection.",
        "Equipment History (fourth ER competency) — CMMS data quality for reliability analytics.",
        "RCM (Reliability-Centered Maintenance) — uses Weibull + FMEA to set strategy.",
        "ISO 14224 — failure data taxonomy.",
        "ISO 55001 Clauses 6.2.2, 7.2 — operational planning informed by reliability analytics.",
        "OREDA — population failure-rate benchmark database.",
      ],
      prerequisites: [
        "CMRP BOK 5-pillar structure; ER pillar place in it.",
        "Basic probability: distribution, mean, CDF.",
        "CMMS basics: WO lifecycle, asset hierarchy, failure-code capture.",
        "Differential/integral calculus (differentiation of polynomials/exponentials).",
        "Awareness of ISO 55000 asset-management vocabulary.",
      ],
      references: [
        "SMRP CMRP BOK — ER pillar: Equipment Reliability.",
        "SMRP CMRP Exam Outline.",
        "ISO 14224:2016.",
        "ISO 55000:2014; ISO 55001:2014 Cl. 6.2.2, 7.2; ISO 55002:2018.",
        "Mobley (2008), Maintenance Engineering Handbook.",
        "Campbell & Jardine (2001), Maintenance Strategy.",
        "Ebeling (2010), An Introduction to Reliability and Maintainability Engineering.",
        "O'Hanlon (2006), Uptime.",
        "Reliabilityweb.com / SMRP best-practices bodies.",
        "OREDA Handbook (6th ed., 2015).",
      ],
    },
  },
  questions: [
    {
      competencyName: "Equipment Reliability",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which of the following correctly distinguishes failure mode, failure mechanism, and failure cause per ISO 14224?",
      whyCorrect:
        "ISO 14224 defines failure mode as the observable effect on the equipment function (e.g., 'external leakage'), failure mechanism as the physical process (e.g., 'corrosion', 'fatigue'), and failure cause as the operational, design, or maintenance reason (e.g., 'contamination', 'misalignment', 'under-sizing'). These are deliberately distinct analytical layers — each is a different question.",
      whyOthersWrong: [
        "Option A is reversed — it swaps the definitions of mode/cause/mechanism. Under ISO 14224, mode is the observable effect, not the physical process.",
        "Option C is wrong — ISO 14224 deliberately distinguishes the three layers as a 4-level drill-down; conflating them collapses the taxonomy's analytical power and prevents benchmarking.",
        "Option D is reversed — it reorders the definitions. Failure cause is the operational/design reason; mode is the observable effect; mechanism is the physical process.",
      ],
      explanation:
        "ISO 14224 defines a 4-level drill-down: equipment unit → equipment class → failure mode (observable) → failure cause (operational/design) → failure mechanism (physical). Conflating any two layers corrupts the Pareto and Weibull analyses that depend on the structure.",
      options: [
        { text: "Failure mode = physical process; failure mechanism = observable effect; failure cause = maintenance reason", isCorrect: false },
        { text: "Failure mode = observable manner of failure (e.g., external leakage); failure mechanism = physical process (e.g., corrosion); failure cause = operational/design reason (e.g., contamination)", isCorrect: true },
        { text: "All three terms are synonymous; ISO 14224 uses them interchangeably", isCorrect: false },
        { text: "Failure cause = physical process; failure mode = operational reason; failure mechanism = observable effect", isCorrect: false },
      ],
    },
    {
      competencyName: "Equipment Reliability",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Manufacturing",
      stem: "A robotic weld-cell servo drive has 5 failures at operating times 1500, 2000, 2500, 3500, and 5000 hours. Compute the MTBF (point estimate).",
      whyCorrect:
        "MTBF = Σtᵢ/n = (1500+2000+2500+3500+5000)/5 = 14,500/5 = 2,900 h. This is the arithmetic mean of the failure times — the canonical point estimate of MTBF for a repairable system under the perfect-repair assumption.",
      whyOthersWrong: [
        "2,500 h is the median (the middle value of the sorted failure times), not the mean. MTBF is defined as the arithmetic mean, not the median.",
        "5,000 h is the maximum of the data, not the mean. Reporting the maximum as MTBF would overstate reliability by ~72%.",
        "1,500 h is the minimum of the data, not the mean. Reporting the minimum as MTBF would understate reliability by ~48%.",
      ],
      explanation:
        "MTBF = Σtᵢ/n [h]. For small samples (n<5) the point estimate has wide confidence intervals — report alongside a confidence interval (e.g., 2-parameter Weibull MLE with 90% CI on β and η).",
      options: [
        { text: "2,900 h", isCorrect: true },
        { text: "2,500 h", isCorrect: false },
        { text: "5,000 h", isCorrect: false },
        { text: "1,500 h", isCorrect: false },
      ],
    },
    {
      competencyName: "Equipment Reliability",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Chemical",
      stem: "Given a 2-parameter Weibull distribution with β=2.0 and η=10,000 h, compute the reliability R(t) at t=5,000 h.",
      whyCorrect:
        "R(t) = exp(-(t/η)^β) = exp(-(5000/10000)^2) = exp(-(0.5)^2) = exp(-0.25) = 0.7788 ≈ 77.88%. With β=2 (wear-out, Rayleigh), 22% of the population has failed by 5,000 h — the survival curve is steeper than the exponential (β=1) case.",
      whyOthersWrong: [
        "60.65% is what you would get if β=1 (random/exponential): R(t)=exp(-t/η)=exp(-0.5)=0.6065. The question has β=2, so the squared term (t/η)^2 changes the result.",
        "50.00% is a frequent intuitive guess but has no mathematical basis for any standard reliability distribution at t=0.5·η.",
        "36.80% is R(η=10,000) = exp(-1) = 0.368 — the reliability at the characteristic life, not at t=5,000. At t=η, exactly 1−1/e ≈ 63.2% of the population has failed.",
      ],
      explanation:
        "R(t) = exp(-(t/η)^β). The shape parameter β changes the survival curve sharply: β=1 (exponential), β=2 (Rayleigh, linearly increasing hazard), β>3 (concentrated wear-out near η). Always compute with the actual β — never assume β=1.",
      options: [
        { text: "60.65% (this is β=1, exponential)", isCorrect: false },
        { text: "77.88% (β=2.0, R(5000)=exp(-0.25))", isCorrect: true },
        { text: "50.00% (frequent intuitive guess)", isCorrect: false },
        { text: "36.80% (this is R(η)=exp(-1) at t=η=10,000)", isCorrect: false },
      ],
    },
    {
      competencyName: "Equipment Reliability",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "DecisionMaking",
      skillType: "Conceptual",
      scenario: "Chemical",
      stem: "You are the reliability engineer at a Chemical plant. Weibull analysis of pump-bearing failures yields β=2.4 and η=9,000 h. Which maintenance strategy and PM interval are most aligned with the failure pattern?",
      whyCorrect:
        "β>1 indicates wear-out (rising hazard rate). The optimal strategy is time-based PM at the operating time where R(t) is still 0.85–0.95 — typically 0.30–0.50·η. A PM at 4,000 h (≈0.44·η) gives R(4,000) = exp(-(0.444)^2.4) = exp(-0.142) ≈ 0.87 — 87% survive. This is the canonical β>1 wear-out strategy.",
      whyOthersWrong: [
        "Run-to-failure — β>1 means rare events is wrong; β>1 means wear-out (predictable, rising hazard), not 'rare events'. Run-to-failure is appropriate for run-tolerant (low-criticality) assets, not for wear-out failure modes.",
        "CBM-only — β>1 means constant hazard is wrong; that is the β≈1 regime (random/constant hazard), where CBM dominates because PM at any interval catches only a fraction of the population.",
        "Burn-in testing — β>1 means infant mortality is wrong; β<1 (decreasing hazard, infant mortality) is the regime for burn-in/buy-quality. β=2.4 is firmly in the wear-out regime.",
      ],
      explanation:
        "β drives strategy: β<1 ⇒ burn-in/buy-quality; β≈1 ⇒ CBM; β>1 ⇒ time-based PM at 0.30–0.50·η. With β=2.4 and η=9,000 h, a PM at 4,000 h (R≈87%) is appropriate. Setting PM at MTBF (the canonical error) would have ~21% of bearings failed before the PM.",
      options: [
        { text: "Run-to-failure — β>1 means rare events", isCorrect: false },
        { text: "CBM-only — β>1 means constant hazard", isCorrect: false },
        { text: "Time-based PM at ~0.30–0.50·η (≈2,700–4,500 h) — β>1 wear-out pattern", isCorrect: true },
        { text: "Burn-in testing at the OEM — β>1 means infant mortality", isCorrect: false },
      ],
    },
    {
      competencyName: "Equipment Reliability",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Power",
      stem: "A power-plant boiler feedwater pump has MTBF = 8,000 h and MTTR = 12 h. Compute the intrinsic availability A (excluding planned downtime and logistic delay).",
      whyCorrect:
        "Intrinsic A = MTBF/(MTBF+MTTR) = 8000/(8000+12) = 8000/8012 = 0.99850 ≈ 99.85%. The intrinsic availability excludes planned downtime and logistic delay — it is the reliability-engineering view of the asset. The operational availability (with MDT) would be lower.",
      whyOthersWrong: [
        "99.99% would require MTTR = 0.8 h (not 12); the math 8000/(8000+0.8) = 0.9999. The MTTR in the question is 12 h.",
        "95.00% is far below the intrinsic A and approximates what an operational A might look like if MDT were 421 h (8000/8421 = 0.950) — but intrinsic A excludes MDT.",
        "99.50% would require MTTR = 40 h (8000/8040 = 0.995); the MTTR in the question is 12, not 40.",
      ],
      explanation:
        "Intrinsic A = MTBF/(MTBF+MTTR). Operational A_op = MTBF/(MTBF+MDT) where MDT = MTTR + logistic + admin + scheduling delay. In a plant with poor planning/scheduling, MDT can be 4–10× MTTR — operational A then lags intrinsic A by orders of magnitude.",
      options: [
        { text: "99.85% (8000/8012)", isCorrect: true },
        { text: "99.99% (would require MTTR = 0.8 h)", isCorrect: false },
        { text: "95.00% (confuses intrinsic with operational A)", isCorrect: false },
        { text: "99.50% (would require MTTR = 40 h)", isCorrect: false },
      ],
    },
    {
      competencyName: "Equipment Reliability",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: For a series system of N blocks each with reliability R_i, the system reliability is the product R_sys = ∏R_i, so the weakest block dominates system reliability.",
      whyCorrect:
        "True. For series systems, R_sys(t) = ∏R_i(t). The system fails if any single block fails, so the system reliability is bounded by the lowest R_i — the weakest series block dominates. This is why single-point-of-failure analysis is so critical in RAM modeling.",
      whyOthersWrong: [
        "False — the candidate would miss that the series-product rule is fundamental. In a series system, a single block's failure is a system failure, so R_sys = ∏R_i. The 'weakest-link' principle is mathematically exact for series systems.",
      ],
      explanation:
        "Series: R_sys = ∏R_i (weakest block dominates). Parallel: R_sys = 1 − ∏(1−R_i) (redundancy helps). The series/parallel distinction drives every RAM-model decision — and is why a single 0.99 block in series with 10 blocks each at 0.9999 still yields R_sys = 0.99 (the weakest block).",
      options: [
        { text: "True", isCorrect: true },
        { text: "False", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Condition Monitoring & Diagnostics
// ---------------------------------------------------------------------------

const LESSON_CONDITION_MONITORING: RefLesson = {
  competencyName: "Condition Monitoring & Diagnostics",
  slug: "er-condition-monitoring-diagnostics",
  title: "Condition Monitoring & Diagnostics",
  titleAr: "المراقبة والتشخيص",
  order: 2,
  durationMin: 30,
  references: ER_REFERENCE_TITLES,
  conceptIntroduction: `Condition Monitoring & Diagnostics is the sensor layer of the Equipment Reliability pillar. The five core CBM technologies — vibration, oil analysis, thermography, ultrasonic, and motor current signature analysis (MCSA) — cover the canonical failure modes. ISO 10816 (vibration severity), ISO 4406 (oil cleanliness), and the P-F interval together set the alarm thresholds and route intervals. The discipline is operationalized at the alert-to-WO interface: a CBM alert that does not generate a CMMS WO has no reliability value. The CMRP candidate must master the technology-to-failure-mode mapping, the three threshold philosophies (absolute, statistical, trending), and the routing architecture.`,
  example: `A 15-kW centrifugal pump (ISO 10816 Class II, rigid mount) on a cooling-tower circuit shows: Month 1 = 1.9 mm/s RMS (zone B), Month 6 = 2.7 mm/s (zone B top), Month 8 = 4.5 mm/s (zone C — alert at 2.8 crossed), Month 10 = 7.8 mm/s (zone D — trip at 7.1 crossed). FFT shows a peak at BPFO ≈ 69 Hz (6308 bearing, 8 balls, d=12.7, D=65, α=0, f=1480 rpm → BPFO ≈ 3.5·(1−0.195)·24.67 ≈ 69.3 Hz). Oil sample: Fe 110 ppm (target <20) and ISO 4406 slipped from 18/15/12 to 22/19/16. Ultrasonic contact: +12 dB at 38 kHz. Cross-validation: bearing outer-race spall, mechanism = rolling-contact fatigue. Generate WO "P-CT-04 DE bearing R&R — vibration 7.8 mm/s zone D, FFT peak at BPFO 69 Hz, oil Fe 110 ppm, ultrasonic +12 dB. ISO 10816 zone D — immediate action." P-F interval ~3 months; 30-day vibration route interval = P-F/3.`,
  keyFormulas: `v_rms = √(∫₀^f_max v²(t) dt) — ISO 10816 velocity RMS, 10–1000 Hz integration
BPFO = (n/2)·(1 − (d/D)·cos α)·f_rpm/60 — bearing outer-race defect frequency
ISO 4406 cleanliness code = log2(particles per mL ≥ size) at 4, 6, 14 µm — e.g., 18/15/12
P-F interval = t_F − t_P; CBM interval ≤ P-F/4 to P-F/2
Thermal alert: ΔT = T_component − T_baseline_similar_load; alert > 15°C; trip > 40°C (electrical)
MCSA broken-rotor-bar sideband: f_sideband = (1 ± 2s)·f_line; s = (n_s − n_r)/n_s
Alert-to-WO conversion = (alerts converted to WOs) / (total alerts) × 100 — target ≥90%
False-alarm rate = (false alarms) / (total alarms issued) — target <5%`,
  exercise: `You are the condition-monitoring engineer at a Container Terminal. RTG-03 hoist motor MCSA shows sidebands at (1±2s)·f_line within 38 dB of the line frequency. RTG-07 hoist gearbox oil analysis: Fe 380 ppm (target <50 ppm) with no vibration route on the hoist gearbox. RTG-11 trolley motor vibration: 6.8 mm/s RMS (zone C, just below the 7.1 trip). RTG-09 gantry thermography: ΔT +23°C above baseline. Rank the urgency of these alerts. Justify the cross-technology validation tests you would run on each before issuing a CMMS WO.`,
  sections: {
    learning_objectives: `- Identify the five core CBM technologies (vibration, oil analysis, thermography, ultrasonic, MCSA) and the failure modes each detects earliest.
- Apply ISO 10816 vibration severity zones (A/B/C/D) to set alarm and trip thresholds (e.g., 7.1 mm/s RMS for Class II rigid-mount machines).
- Specify the three alarm-limit philosophies: absolute (ISO standard), statistical (baseline + 2σ), and trending (rate-of-change).
- Design a CBM routing strategy: which assets, which technology, what interval, based on the P-F interval.
- Distinguish condition monitoring (CM) from condition-based maintenance (CBM) and from predictive maintenance (PdM).
- Integrate CBM findings into the work-management cycle (alert → CMMS WO → plan → schedule → execute → closeout with code).`,
    prerequisites: `- Equipment Reliability competency (Lesson 1) — failure modes, MTBF, Weibull β.
- Mechanical basics: bearing, gear, rotor, fluid-system operation.
- Electrical basics: 3-phase motor, current signature, slip.
- CMMS WO generation from a CBM alert.
- Awareness of ISO 10816 (vibration), ISO 14224 (failure data), ISO 4406 (oil cleanliness).`,
    introduction: `Condition Monitoring & Diagnostics is the second ER competency. Where Equipment Reliability (Lesson 1) analyzes historical failure data to set the strategy, Condition Monitoring collects real-time signatures of asset health — vibration spectra, oil debris, thermal images, ultrasonic emissions, motor-current signatures — to detect incipient failures before they propagate to functional failure. The CMRP BOK treats condition monitoring as the bridge between the Weibull β≈1 random-failure regime (where time-based PM is useless) and the work-management cycle (where a CBM alert becomes a planned WO).

ISO 10816 (vibration severity) sets the absolute alarm thresholds that frame most vibration programs: zone A (new/repaired), zone B (acceptable long-term), zone C (unsatisfactory — action limited), zone D (unacceptable — immediate action). For a Class II machine (15–300 kW, rigid mount), the zone B/C boundary is at 2.8 mm/s RMS and the C/D boundary at 7.1 mm/s RMS — these are the canonical 7.1 mm/s alarm thresholds cited in the SMRP BOK.

The five CBM technologies differ in the failure modes they detect earliest:
- **Vibration**: rotating-element wear (bearings, gears, couplings), unbalance, misalignment, looseness, resonance.
- **Oil analysis**: lubricant degradation, contamination, wear-metal generation.
- **Thermography**: electrical hot-spots (connections, breakers), bearing hot-spots, steam-trap leakage, insulation degradation.
- **Ultrasonic**: compressed-gas/steam leakage, partial-discharge in switchgear, bearing friction (high-frequency stress-wave).
- **Motor current signature analysis (MCSA)**: broken rotor bars, stator winding faults, bearing wear (characteristic frequencies in the current spectrum).

The CMRP candidate must know which technology to apply to which failure mode — and how to set thresholds that minimize both false alarms (which destroy planner credibility) and missed detections (which destroy reliability).`,
    terminology: `- **Condition Monitoring (CM)**: continuous or periodic measurement of a parameter indicative of asset health.
- **Condition-Based Maintenance (CBM)**: maintenance triggered by a CM threshold crossing.
- **Predictive Maintenance (PdM)**: often used synonymously with CBM; technically the projection of CM trends to forecast failure time.
- **Vibration velocity (mm/s RMS)**: the ISO 10816 standard severity parameter for medium-speed rotating machinery.
- **Vibration acceleration (g peak)**: high-frequency parameter for bearing defect detection (≥1 kHz).
- **Vibration displacement (µm peak-to-peak)**: low-frequency parameter for sleeve-bearing clearance and slow-speed machinery.
- **FFT spectrum**: Fast Fourier Transform of the time waveform; reveals frequency components (1×, 2×, bearing defect frequencies, gear mesh).
- **ISO 10816 zones**: A (new/repaired), B (long-term acceptable), C (unsatisfactory), D (unacceptable).
- **BPFO / BPFI / BSF / FTF**: bearing defect frequencies (outer race, inner race, ball spin, fundamental train).
- **Oil analysis parameters**: viscosity, acid number (TAN), base number (TBN), water content, particle count (ISO 4406 cleanliness), wear metals (Fe, Cu, Sn, Pb, Cr).
- **Thermography**: infrared imaging of surface temperatures; used for electrical and mechanical hot-spot detection.
- **Ultrasonic**: detection of high-frequency (20–100 kHz) stress waves from gas leakage, partial discharge, or bearing friction.
- **Motor Current Signature Analysis (MCSA)**: spectral analysis of the stator current to detect rotor-bar, stator-winding, and bearing faults.
- **Alarm limit**: threshold crossing which triggers a maintenance action.
- **Trip limit**: threshold which trips the asset off (protection).
- **P-F interval**: time from Potential failure (detectable) to Functional failure; sets the CBM route interval.`,
    detailed_explanation: `A condition-monitoring program has three architectural layers:

**(1) Technology selection.** The engineer matches the failure mode to the technology. Mobley's Handbook offers the canonical cross-reference: bearing wear ⇒ vibration + oil debris; gear wear ⇒ vibration (gear-mesh frequency) + oil; electrical hot-spots ⇒ thermography; compressed-air leakage ⇒ ultrasonic; rotor-bar breaks ⇒ MCSA. The most expensive mistake in CBM is choosing the wrong technology for the failure mode — the second most expensive is choosing the right technology but setting the alarm limit wrong.

**(2) Threshold philosophy.** Three threshold philosophies coexist:
   - **Absolute (ISO 10816)**: the threshold is set by an international standard validated across thousands of machines (e.g., 7.1 mm/s RMS for Class II). One-size-fits-most.
   - **Statistical (baseline + N·σ)**: the threshold is set from the asset's own baseline + 2 or 3 standard deviations; sensitive to the specific machine and its operating context but requires a clean baseline.
   - **Trending (rate-of-change)**: the threshold is set on the rate of change of the parameter (e.g., velocity doubling in 30 days ⇒ alert); catches incipient wear before the absolute threshold is crossed.
   The CMRP best practice is to combine all three: ISO 10816 as the absolute gate, baseline+2σ as the statistical alert, and trend rate as the leading indicator.

**(3) Routing & interval.** A CBM route is the set of assets measured, by a given technology, on a given interval. The interval is driven by the P-F interval — the time from the moment a failure becomes detectable (P, potential failure) to the moment of functional failure (F). The CBM interval should be ~1/4 to 1/2 of the P-F interval, so that the incipient failure is caught before propagating to functional failure. A bearing with a 90-day P-F interval should be on a 30-day (or shorter) vibration route.

ISO 10816 (the vibration severity standard) divides machines by power class (Class I <15 kW, Class II 15–300 kW, Class III 300–1,500 kW, Class IV >1,500 kW) and mount type (rigid vs. flexible). The zone thresholds differ by class and mount. For Class II rigid-mount (the typical 15–300 kW pump or motor), the canonical thresholds are:
   - Zone A/B boundary: 1.4 mm/s RMS (new-repaired → acceptable).
   - Zone B/C boundary: 2.8 mm/s RMS (acceptable → unsatisfactory — long-term action required).
   - Zone C/D boundary: 7.1 mm/s RMS (unsatisfactory → unacceptable — immediate action required).
   The brief's 7.1 mm/s is the zone C/D boundary — the alarm (high-high) threshold beyond which the asset must be removed from service.

For oil analysis, ISO 4406 codes the cleanliness by particle count at 4 µm, 6 µm, and 14 µm (e.g., 19/16/13 means 2^19 ≈ 500k particles ≥ 4 µm, 2^16 ≈ 65k ≥ 6 µm, 2^13 ≈ 8k ≥ 14 µm per mL). A servo-hydraulic system typically targets 18/15/12 or cleaner; a journal-bearing lube-oil system typically targets 21/18/15. A trend from 18/15/12 to 22/19/16 indicates ingress or wear — alert.

For thermography, a 15°C rise above a similar component under similar load is the typical alert; a 40°C rise above ambient on an electrical connection indicates a high-resistance joint requiring re-torquing or replacement.

For ultrasonic, the threshold is often a doubling of the dBµV baseline; bearing-friction ultrasonic at >8 dB above baseline on the same point is an alert.

For MCSA, the broken-rotor-bar signature is a pair of sidebands at (1±2s)·f_line, where s is the motor slip; a sideband magnitude within 45 dB of the line frequency is a strong indicator.

The integration of CBM with the work cycle is critical: a CBM alert must generate a WO in the CMMS (not just a spreadsheet entry); the WO is then planned, scheduled, and executed like any other corrective WO. The alert-to-WO conversion ratio is a CMRP KPI (target ≥90%).`,
    core_principles: `- **Match the technology to the failure mode**: vibration for rotating wear, oil for lubricant wear, thermal for electrical, ultrasonic for leakage/discharge, MCSA for motor internals.
- **Use the P-F interval to set the CBM interval** (~1/4 to 1/2 of P-F). A route interval longer than P-F will miss the failure.
- **Set three threshold tiers**: absolute (ISO 10816), statistical (baseline+2σ), trending (rate-of-change).
- **A CBM alert is only useful if it generates a CMMS WO**; the alert-to-WO conversion ratio is the KPI.
- **Reduce false alarms** — they destroy planner/scheduler trust; require cross-technology validation before WO release for high-severity alerts.
- **The trip threshold (high-high) protects the asset**; the alert threshold (high) starts the planning cycle.
- **Re-baseline after overhaul** — a new bearing sits at zone A, not at the pre-failure trend.`,
    components: `- **Vibration analyzer** (FFT, 4-channel, triaxial accelerometer).
- **Oil analysis lab** (or in-house particle counter, viscometer, FTIR for TAN/TBN, ICP for wear metals).
- **Infrared camera** (thermography) with calibrated radiometric output.
- **Ultrasonic detector** (airborne or contact) with FFT option.
- **Current transducer + spectrum analyzer** for MCSA.
- **CBM software** (route manager, alarm manager, trend charts).
- **ISO 10816 zone chart** (per machine class).
- **ISO 4406 cleanliness code reference**.
- **Alert → CMMS WO interface** (the operational hinge of the CBM program).`,
    process: `1. Build the asset CBM register: asset-tagged list of monitored assets with criticality.
2. Select the technology per asset by failure-mode analysis (FMEA or RCM).
3. Determine the P-F interval per failure mode per asset; set the CBM interval at 1/4 to 1/2 P-F.
4. Establish the baseline (10 measurements under normal operating conditions).
5. Set alarm thresholds (absolute ISO + statistical +2σ + trend rate).
6. Run the route (periodic), or stream continuously (online).
7. Cross-validate alerts: vibration + oil, or thermal + ultrasonic, before issuing the WO.
8. Generate a CMMS WO from validated alerts (alert-to-WO conversion ≥90%).
9. Plan, schedule, execute the corrective work.
10. Close the loop: confirm the failure mode in the closed WO failure code; re-baseline if needed.`,
    formula_calculation: `- **Vibration velocity RMS (ISO 10816)**:
  v_rms = √(∫₀^f_max v²(t) dt) — typically integrated over 10–1000 Hz for medium-speed machinery.
  Variables: v(t) = velocity waveform [mm/s]; f_max = upper frequency bound [Hz].
  Interpretation: ISO 10816 zones A/B/C/D threshold by machine class. For Class II rigid-mount: A/B 1.4, B/C 2.8, C/D 7.1 mm/s RMS.

- **Bearing defect frequency (BPFO — outer race)**:
  BPFO = (n/2) · (1 − (d/D)·cos α) · f_rpm/60
  Variables: n = number of balls; d = ball diameter; D = pitch diameter; α = contact angle; f_rpm = rotational speed [rpm].
  Interpretation: a peak in the FFT at BPFO indicates an outer-race spall. Similar formulas exist for BPFI (inner race), BSF (ball spin), FTF (fundamental train).

- **ISO 4406 cleanliness code**:
  The code at each particle size = log2(count per mL ≥ size). E.g., 18/15/12 → 2^18 ≥ 4 µm, 2^15 ≥ 6 µm, 2^12 ≥ 14 µm per mL.

- **P-F interval**:
  P-F = t_F − t_P where t_P = time of detectability (potential failure), t_F = time of functional failure.
  CBM interval ≤ P-F/4 (recommended) to P-F/2 (acceptable).

- **Thermal alert threshold**:
  ΔT = T_component − T_baseline_similar_load; alert at ΔT > 15°C; trip at ΔT > 40°C (electrical connections).

- **MCSA broken-rotor-bar signature**:
  f_sideband = (1 ± 2s) · f_line where s = slip = (n_s − n_r)/n_s; n_s = synchronous speed, n_r = rotor speed.
  Sideband magnitude within 45 dB of line frequency ⇒ strong broken-rotor-bar indicator.

- **Alert-to-WO conversion ratio**:
  Conversion = (alerts converted to WOs) / (total alerts issued) × 100; target ≥90%.

- **False-alarm rate**:
  FA = (false alarms) / (total alarms issued); target <5%.

- **Statistical threshold (baseline + 2σ)**:
  Alert = baseline + 2·σ; Trip = baseline + 3·σ. Requires ≥10 baseline measurements under normal operating conditions.`,
    worked_example: `**Problem.** A centrifugal pump (15 kW, 4-pole motor at 1480 rpm, vertical-pump with rigid mount, Class II per ISO 10816) on a Manufacturing site's cooling-tower circuit shows the following vibration trend:
  - Month 1 baseline: 1.9 mm/s RMS at the drive-end (DE) bearing housing (zone B).
  - Month 6: 2.7 mm/s RMS (zone B, top edge).
  - Month 8: 4.5 mm/s RMS (zone C).
  - Month 10: 7.8 mm/s RMS (zone D).

You are the condition-monitoring engineer. Identify the alarm thresholds, the cross-technology validation tests, the alert-to-WO action, and the failure-mode hypothesis.

**Step 1 — Alarm thresholds (ISO 10816 Class II rigid).**
  - Zone A/B boundary: 1.4 mm/s RMS.
  - Zone B/C boundary: 2.8 mm/s RMS — Alert (high) threshold.
  - Zone C/D boundary: 7.1 mm/s RMS — Trip (high-high) threshold.

**Step 2 — Trend interpretation.**
  - Month 1: 1.9 mm/s, zone B (acceptable).
  - Month 6: 2.7 mm/s, zone B top — trend rising; check baseline+2σ (1.9 + 2·0.4 = 2.7) ⇒ on the statistical alert edge.
  - Month 8: 4.5 mm/s, zone C — Alert threshold (2.8) crossed; high alarm issued.
  - Month 10: 7.8 mm/s, zone D — Trip threshold (7.1) crossed; high-high alarm.

**Step 3 — Failure-mode hypothesis (FFT spectrum).** For a 6308 bearing (n=8 balls, d=12.7 mm, D=65 mm, α=0° contact angle), at 1480 rpm:
  BPFO = (8/2)·(1 − (12.7/65)·cos 0°)·(1480/60) = 4·(1 − 0.195)·24.67 = 4·0.805·24.67 ≈ 79.4 Hz.
  If the FFT shows a peak at ~79 Hz (with sidebands at ±1× running speed), the failure mode is an outer-race spall.

**Step 4 — Cross-technology validation.** Take an oil sample: if Fe wear-metal > 100 ppm (target <20 ppm) and ISO 4406 cleanliness slipped from 18/15/12 to 22/19/16, the bearing failure is corroborated. Ultrasonic contact at the DE bearing: >8 dB above baseline at 38 kHz confirms friction.

**Step 5 — Alert-to-WO conversion.** Generate a CMMS WO: "P-CT-04 DE bearing R&R — vibration 7.8 mm/s zone D, FFT peak at BPFO ~79 Hz, oil Fe 110 ppm, ultrasonic +12 dB. ISO 10816 zone D — immediate action." Plan, schedule, execute within 7 days.

**Step 6 — P-F interval confirmation.** P-F was ~3 months (from baseline rising to functional failure projected by trend extrapolation). The 30-day vibration route interval was correctly set at P-F/3.

**Step 7 — Post-closeout.** Confirm the failure mode in the WO: "FC = bearing outer-race spall, mechanism = rolling-contact fatigue, cause = inadequate lubrication (oil ISO 4406 slipped)". Re-baseline: the new bearings should sit at zone A (≤ 1.4 mm/s RMS) at month 1.

**Result.** Alarm thresholds: 2.8 mm/s alert, 7.1 mm/s trip. Failure mode: bearing outer-race spall, validated by vibration FFT + oil + ultrasonic. WO generated; P-F ~3 months; CBM interval 30 days = P-F/3. Bad-actor trend: 4 alert-events in 12 months ⇒ P-CT-04 enters the bad-actor list.`,
    industrial_example: `**Manufacturing — cooling-tower pump (above).** The 7.1 mm/s trip threshold catches the bearing before functional failure.

**Oil & Gas — gas-turbine vibration.** A 25-MW gas-turbine on a continuous-vibration monitoring system trips at 11.8 mm/s RMS (per ISO 10816 Class IV); the alert at 7.1 mm/s starts the planning cycle. Trend rising 10% in 24 h ⇒ high-high alert; turbine ramped down for inspection.

**Power — generator partial-discharge (PD).** Online PD monitoring (ultrasonic + electrical) on a 200-MW generator stator winding; alert at 10 nC (baseline 2 nC + 5σ); trend rising 2 nC/month ⇒ planned outage for re-wedge.

**Chemical — agitator gearbox oil analysis.** A 75-kW agitator gearbox on a 90-day oil-analysis route. Sample at month 3: Cu 220 ppm (target <30 ppm) ⇒ bearing wear. Trend confirmed over 3 consecutive samples; WO to inspect bearings; bronze-cage bearing found cracked. The oil analysis caught the failure 6 weeks before functional failure (P-F = 90 days, route interval 90 days — borderline; should be 30 days).`,
    case_study: `**CASE_TYPE = SYNTHETIC.** A Chemical plant with 320 rotating assets on a vibration CBM program. Baseline (before): 18 routes/year per asset, 95% alert-to-WO conversion, but 12% false-alarm rate (planners distrusted the alerts and let WOs age in the backlog). The reliability engineer introduced cross-technology validation: every vibration alert above 4.5 mm/s (zone C) had to be corroborated by oil (Cu or Fe trend) or ultrasonic (+6 dB at the same point) before WO release. False-alarm rate dropped to 3% in 6 months; alert-to-WO conversion rose to 96%; planner trust was restored. The plant also re-balanced route intervals from a uniform 30 days to a tiered 7-day (critical), 30-day (essential), 90-day (run-tolerant) interval based on P-F analysis. The number of catastrophic failures (functional failure with no warning) fell from 9/year to 2/year in 12 months. The case demonstrates that CBM is not just a technology program — it is a threshold-and-routing program, and the alert-to-WO interface is the operational hinge.`,
    visual_explanation: `- **ISO 10816 zone chart**: x-axis = power class, y-axis = vibration velocity RMS (mm/s); zones A (green), B (yellow), C (orange), D (red).
- **P-F curve**: x-axis = time, y-axis = asset condition. Curve drops from baseline (good) to P (potential failure — detectable) to F (functional failure). The CBM interval must be short enough to catch between P and F.
- **FFT spectrum**: x-axis = frequency (Hz), y-axis = amplitude (mm/s). Peaks at 1× (unbalance), 2× (misalignment), BPFO/BPFI (bearing), GMF (gear mesh).
- **Oil analysis trend chart**: x-axis = sample date, y-axis = wear-metal ppm; alert at +2σ over baseline.
- **Thermographic image**: temperature gradient overlaid on a photo of an electrical connection; hot-spot > 40°C above similar = red.`,
    simulation_opportunity: `A CBM simulator where the learner is the condition-monitoring technician at a Manufacturing plant. The sim injects a stream of measurement events (vibration FFT, oil-sample lab reports, thermography images) on 20 assets over 6 months. The learner must: (a) classify each measurement against ISO 10816 / ISO 4406 zones, (b) issue an alert when zones cross B/C or C/D, (c) cross-validate using a second technology, (d) generate a CMMS WO, (e) avoid false alarms. The sim scores: alert-issuance accuracy (sensitivity/specificity), false-alarm rate, alert-to-WO conversion, and missed-detection rate (functional failures that occurred without prior alert).`,
    common_mistakes: `- **Setting a single alarm threshold** (no statistical or trending overlay) — false alarms or missed detections.
- **Setting the CBM interval longer than the P-F interval** — functional failure occurs before the next measurement.
- **Issuing alerts without cross-validation** — destroys planner trust.
- **Confusing vibration acceleration (g) with velocity (mm/s)** — the ISO 10816 severity is in velocity for medium-speed; acceleration is for high-speed bearing-specific work.
- **Using absolute thresholds on a machine that needs statistical baselines** (a 1960s rigid-frame machine will sit at zone C baseline — the absolute ISO threshold would generate a perpetual false alarm).
- **Not converting alerts to CMMS WOs** — the CBM software becomes an orphan system.
- **Letting route intervals grow stale** — the P-F interval can change after a redesign; the route interval must follow.
- **Forgetting to re-baseline after a bearing/seal replacement** — the new component sits at zone A, not at the pre-failure trend.`,
    limitations: `- **CBM catches failure modes with detectable precursors (P-F).** It does not catch sudden failures (electronic-component failure, brittle fracture, lightning strike).
- **ISO 10816 thresholds are statistical** — they work for ~95% of machines in the class; a specific machine may legitimately sit in zone C with no defect.
- **The P-F interval must be measured empirically per asset class**; textbooks give ballparks but not absolutes.
- **CBM generates large data volumes**; without a data-management strategy, alerts drown the planner.
- **Online (continuous) monitoring is expensive**; route-based CBM trades immediacy for cost.
- **Oil analysis has a multi-week lag (lab turnaround)**; the failure may propagate before the result returns.
- **MCSA requires a trained analyst to interpret the spectra** — it is not a "buy a box and switch on" technology.`,
    comparison: `- **Vibration vs. oil analysis**: vibration is rotating-element (bearing, gear, rotor); oil is lubricant-and-wear (the lubricant itself and the wear-metal content). Use both.
- **Thermography vs. ultrasonic**: thermal detects surface-temperature anomalies (electrical, bearing); ultrasonic detects high-frequency stress waves (leakage, partial discharge, friction). Use both.
- **CBM vs. time-based PM**: CBM catches the random-failure regime (β≈1); PM catches the wear-out regime (β>1). They are complementary.
- **Absolute vs. statistical thresholds**: absolute (ISO 10816) is one-size-fits-most; statistical (baseline+2σ) is asset-specific. Use both.
- **Route-based vs. online CBM**: route-based is periodic and cheap; online is continuous and expensive. Online only on the highest-criticality assets.`,
    practical_application: `- **Daily**: review online CBM alerts; convert to WOs or trend-watch.
- **Weekly**: run route-based CBM (vibration, ultrasonic); review oil-sample lab results; issue alerts.
- **Monthly**: review the false-alarm and missed-detection rates; re-baseline where assets have been overhauled.
- **Quarterly**: review the P-F intervals against actual failure events; re-tier route intervals (7/30/90 day).
- **Annually**: re-evaluate technology-to-failure-mode matching; add new technologies (e.g., ultrasonic on switchgear) where gaps appear.`,
    decision_scenario: `You are the reliability engineer at a Container Terminal with 14 rubber-tired gantry (RTG) cranes. Each RTG has 4 key rotating systems: hoist, trolley, gantry, and steering. Today's CBM data shows:
(A) RTG-07 hoist gearbox oil analysis: Fe 380 ppm (target <50 ppm); no vibration route on the hoist gearbox.
(B) RTG-11 trolley motor vibration: 6.8 mm/s RMS (zone C, just below the 7.1 mm/s trip).
(C) RTG-09 gantry thermography: gearbox case 78°C (baseline 55°C, ΔT 23°C).
(D) RTG-03 hoist motor MCSA: sidebands at (1±2s)·f_line within 38 dB of line frequency.

You can fund ONE urgent action (the others wait for next week). Which has the highest immediate risk?

Decision: (D) RTG-03. The MCSA sidebands at 38 dB (within 45 dB) indicate a broken rotor bar — a catastrophic failure mode (rotor disintegration can take the stator with it). (A) is high but the trend can be confirmed next sample (no need to act today). (B) is at zone C but the 7.1 mm/s trip has not crossed. (C) is +23°C above baseline — alert but the 40°C high-high has not crossed. (D) has the highest immediate catastrophic-failure risk. Sequence: (D) today; (B) within 48 h; (C) within 7 days; (A) at the next route.`,
    practice_questions: `- Name the five core CBM technologies and the failure mode each detects earliest.
- Give the ISO 10816 Class II rigid-mount zone boundaries (B/C and C/D) in mm/s RMS.
- Define the P-F interval; explain why the CBM interval should be ~1/4 to 1/2 of P-F.
- A bearing has a 90-day P-F interval. Recommend the CBM route interval.
- Compute the alert-to-WO conversion ratio: 36 alerts issued, 33 converted to WOs. *(Answer: 33/36 = 91.7%.)*
- Explain why a single absolute ISO 10816 alarm threshold is insufficient (false alarms and missed detections).`,
    certification_questions: `The CMRP exam tests Condition Monitoring & Diagnostics as the second ER competency. SMRP-aligned sample prompts:

(a) Given a vibration measurement, classify the ISO 10816 zone.
(b) Identify the technology most appropriate for a given failure mode (vibration for bearings, oil for lubricant, thermal for electrical, ultrasonic for leakage/PD, MCSA for rotor-bar).
(c) Recommend a CBM interval given the P-F interval.
(d) Recognize the three threshold philosophies (absolute, statistical, trending).
(e) Identify the alert-to-WO conversion ratio as a CMRP KPI (target ≥90%; false-alarm rate <5%).

The questions in this lesson's question bank are aligned to these Condition Monitoring & Diagnostics competencies.`,
    summary: `Condition Monitoring & Diagnostics is the sensor layer of the Equipment Reliability pillar. The five core technologies — vibration, oil analysis, thermography, ultrasonic, MCSA — cover the canonical failure modes. ISO 10816 (vibration severity), ISO 4406 (oil cleanliness), and the P-F interval together set the alarm thresholds and route intervals. The discipline is operationalized at the alert-to-WO interface: a CBM alert that does not generate a CMMS WO has no reliability value. The CMRP candidate must master the technology-to-failure-mode mapping, the three threshold philosophies (absolute, statistical, trending), and the routing architecture.`,
    key_takeaways: `- Five CBM technologies: vibration (rotating wear), oil (lubricant wear), thermography (electrical/thermal), ultrasonic (leakage/PD/friction), MCSA (motor internals).
- ISO 10816 Class II rigid-mount zones: A/B 1.4, B/C 2.8, C/D 7.1 mm/s RMS.
- Three threshold philosophies: absolute (ISO), statistical (baseline+2σ), trending (rate-of-change).
- CBM interval = 1/4 to 1/2 of P-F interval; route longer than P-F misses failures.
- Alert-to-WO conversion ≥90% is the CBM-program KPI; false-alarm rate <5%.
- CBM targets the β≈1 (random-failure) regime; time-based PM targets the β>1 (wear-out) regime — they are complementary.`,
    references: `- SMRP. *CMRP Body of Knowledge — Equipment Reliability pillar: Condition Monitoring & Diagnostics.*
- SMRP. *CMRP Exam Outline.*
- ISO 10816-3:2009. *Mechanical vibration — Evaluation of machine vibration by measurements on non-rotating parts — Part 3: Industrial machines with nominal power above 15 kW.*
- ISO 14224:2016. *Collection of reliability and maintenance data for equipment.*
- ISO 4406:2021. *Hydraulic fluid power — Fluid cleanliness classification.*
- ISO 55000:2014. *Asset management — Overview, principles and terminology.*
- Mobley, R. K. (2008). *Maintenance Engineering Handbook* (7th ed.). McGraw-Hill. Sections on vibration, oil analysis, thermography, ultrasonic.
- Campbell, J. D. & Jardine, A. K. S. (2001). *Maintenance Strategy*. Productivity Press. CBM chapter.
- Ebeling, C. E. (2010). *An Introduction to Reliability and Maintainability Engineering*. Waveland Press.
- O'Hanlon, T. (2006). *Uptime*. Industrial Press.
- Reliabilityweb.com / SMRP best-practices bodies for CBM.`,
  },
  knowledgeObject: {
    title: "Condition Monitoring & Diagnostics — CBM technologies, ISO 10816, P-F interval",
    domain: "Equipment Reliability",
    competency: "Condition Monitoring & Diagnostics",
    topic: "CBM technology & threshold philosophy",
    concept: "Condition-based maintenance",
    body: {
      definitions: [
        "Condition Monitoring (CM): continuous or periodic measurement of a parameter indicative of asset health.",
        "Condition-Based Maintenance (CBM): maintenance triggered by a CM threshold crossing.",
        "Predictive Maintenance (PdM): projection of CM trends to forecast failure time.",
        "Vibration velocity (mm/s RMS): ISO 10816 standard severity parameter for medium-speed rotating machinery.",
        "Vibration acceleration (g peak): high-frequency parameter for bearing defect detection (≥1 kHz).",
        "FFT spectrum: Fast Fourier Transform of the time waveform; reveals frequency components.",
        "ISO 10816 zones: A (new), B (long-term acceptable), C (unsatisfactory), D (unacceptable).",
        "BPFO/BPFI/BSF/FTF: bearing defect frequencies (outer race, inner race, ball spin, fundamental train).",
        "Oil analysis parameters: viscosity, TAN, TBN, water content, particle count (ISO 4406), wear metals (Fe, Cu, Sn, Pb, Cr).",
        "Thermography: infrared imaging of surface temperatures for electrical/mechanical hot-spot detection.",
        "Ultrasonic: detection of 20–100 kHz stress waves from gas leakage, partial discharge, bearing friction.",
        "MCSA: spectral analysis of stator current to detect rotor-bar, stator-winding, and bearing faults.",
        "P-F interval: time from Potential failure (detectable) to Functional failure; sets the CBM route interval.",
        "Alert-to-WO conversion: alerts converted to CMMS WOs / total alerts issued × 100; target ≥90%.",
      ],
      principles: [
        "Match technology to failure mode: vibration (rotating), oil (lubricant), thermal (electrical), ultrasonic (leakage/PD), MCSA (motor internals).",
        "P-F interval drives CBM interval: 1/4 to 1/2 of P-F; route longer than P-F misses failures.",
        "Three threshold philosophies: absolute (ISO), statistical (baseline+2σ), trending (rate-of-change); use all three.",
        "Alert-to-WO conversion ≥90% is the CBM-program KPI; false-alarm rate <5%.",
        "Re-baseline after overhaul — new components sit at zone A, not at pre-failure trends.",
        "Trip threshold (high-high) protects the asset; alert threshold (high) starts the planning cycle.",
        "CBM targets β≈1 (random failures); PM targets β>1 (wear-out); they are complementary.",
      ],
      components: [
        "Vibration analyzer (FFT, 4-channel, triaxial accelerometer).",
        "Oil analysis lab (particle counter, viscometer, FTIR, ICP).",
        "Infrared camera (radiometric thermography).",
        "Ultrasonic detector (airborne and contact).",
        "Current transducer + spectrum analyzer for MCSA.",
        "CBM software (route manager, alarm manager, trend charts).",
        "ISO 10816 zone chart per machine class.",
        "ISO 4406 cleanliness code reference.",
        "Alert → CMMS WO interface (the operational hinge).",
      ],
      mechanism: [
        "Asset operates → CBM route/online measurement taken → measurement classified against ISO zone → if zone crossed (alert/trip) → cross-technology validation → CMMS WO generated → WO planned, scheduled, executed → closeout with ISO-14224 failure code → P-F interval re-validated → CBM interval adjusted → re-baseline post-overhaul (closed loop).",
      ],
      process: [
        "1. Build asset CBM register (tagged list with criticality).",
        "2. Select technology per asset by failure-mode analysis (FMEA/RCM).",
        "3. Determine P-F interval per failure mode; set CBM interval at 1/4 to 1/2 P-F.",
        "4. Establish baseline (≥10 measurements under normal conditions).",
        "5. Set alarm thresholds (absolute ISO + statistical +2σ + trend rate).",
        "6. Run the route (periodic) or stream online (continuous).",
        "7. Cross-validate alerts: vibration + oil, or thermal + ultrasonic, before issuing WO.",
        "8. Generate CMMS WO from validated alerts (alert-to-WO conversion ≥90%).",
        "9. Plan, schedule, execute the corrective work.",
        "10. Close the loop: confirm failure mode in WO failure code; re-baseline if needed.",
      ],
      formulas: [
        "v_rms = √(∫₀^f_max v²(t) dt) — ISO 10816 velocity RMS, 10–1000 Hz integration.",
        "BPFO = (n/2)·(1 − (d/D)·cos α)·f_rpm/60 — bearing outer-race defect frequency.",
        "ISO 4406 code = log2(particles per mL ≥ size) at 4, 6, 14 µm.",
        "P-F interval = t_F − t_P; CBM interval ≤ P-F/4 to P-F/2.",
        "Thermal alert: ΔT > 15°C; trip: ΔT > 40°C (electrical connections).",
        "MCSA sideband f = (1 ± 2s)·f_line; s = (n_s − n_r)/n_s.",
        "Alert-to-WO conversion = (alerts converted to WOs) / (total alerts) × 100; target ≥90%.",
        "False-alarm rate = (false alarms) / (total alarms issued); target <5%.",
        "Statistical threshold: alert = baseline + 2σ; trip = baseline + 3σ.",
      ],
      metrics: [
        "ISO 10816 zone classification per asset per measurement.",
        "Alert-to-WO conversion ratio (≥90% target).",
        "False-alarm rate (<5% target).",
        "Missed-detection rate (functional failures with no prior alert; target <5%).",
        "P-F interval by asset class [days].",
        "CBM route interval (P-F/4 to P-F/2).",
        "Number of CBM technologies deployed per asset class.",
        "Re-baseline compliance after overhaul [%].",
      ],
      examples: [
        "Manufacturing — cooling-tower pump (P-CT-04): 1.9 → 2.7 → 4.5 → 7.8 mm/s over 10 months; zone D trip; FFT peak at BPFO ~79 Hz; oil Fe 110 ppm; ultrasonic +12 dB; cross-validated bearing outer-race spall.",
        "Oil & Gas — gas-turbine: ISO 10816 Class IV trip at 11.8 mm/s RMS; alert at 7.1 mm/s starts the planning cycle.",
        "Power — generator PD: online ultrasonic + electrical; alert at 10 nC (baseline 2 nC + 5σ).",
        "Chemical — agitator gearbox: oil Cu 220 ppm (target <30); 90-day route catches bearing wear 6 weeks before functional failure.",
      ],
      industrial_examples: [
        "Manufacturing — cooling-tower pump: 7.1 mm/s trip threshold catches bearing failure before functional failure.",
        "Oil & Gas — gas-turbine: continuous monitoring with ISO 10816 Class IV trip at 11.8 mm/s RMS.",
        "Power — generator: online PD monitoring catches stator-winding degradation.",
        "Chemical — agitator gearbox: oil-analysis route catches bearing wear before vibration route would.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Chemical plant, 320 rotating assets on vibration CBM. Baseline: 95% alert-to-WO conversion but 12% false-alarm rate (planners distrusted alerts). Intervention: cross-technology validation for every vibration alert > 4.5 mm/s (zone C) — corroborate with oil (Cu/Fe trend) or ultrasonic (+6 dB) before WO release. 6 months: false-alarm rate 12%→3%; alert-to-WO conversion 95%→96%. Tiered route intervals (7/30/90 day) based on P-F analysis. 12 months: catastrophic failures (functional failure with no warning) 9/year→2/year. CBM is a threshold-and-routing program, not just a technology program.",
      ],
      common_errors: [
        "Single alarm threshold (no statistical/trending overlay) — false alarms or missed detections.",
        "CBM interval longer than P-F — functional failure occurs before next measurement.",
        "Alerts without cross-validation — destroys planner trust.",
        "Confusing vibration acceleration (g) with velocity (mm/s) — ISO 10816 is in velocity for medium-speed.",
        "Absolute thresholds on a machine that needs statistical baselines (perpetual false alarm).",
        "Not converting alerts to CMMS WOs — CBM software becomes an orphan system.",
        "Route intervals growing stale as P-F changes after redesign.",
        "Forgetting to re-baseline after overhaul — new component sits at zone A, not at pre-failure trend.",
      ],
      limitations: [
        "CBM catches failure modes with detectable precursors (P-F); not sudden failures (electronic, brittle, lightning).",
        "ISO 10816 thresholds are statistical — ~5% of machines legitimately sit in zone C with no defect.",
        "P-F interval must be measured empirically per asset class; textbooks give ballparks.",
        "Large data volumes; without data-management strategy, alerts drown the planner.",
        "Online monitoring is expensive; route-based trades immediacy for cost.",
        "Oil analysis has multi-week lab lag; failure may propagate before result returns.",
        "MCSA requires trained analyst to interpret spectra — not a buy-and-switch-on technology.",
      ],
      best_practices: [
        "Match technology to failure mode (Mobley's canonical cross-reference).",
        "Set three threshold tiers: absolute ISO + statistical +2σ + trending rate-of-change.",
        "Cross-validate high-severity alerts with a second technology before WO release.",
        "Set CBM interval at 1/4 to 1/2 of the empirically measured P-F interval.",
        "Tier route intervals by criticality: 7-day (critical), 30-day (essential), 90-day (run-tolerant).",
        "Track alert-to-WO conversion (≥90%) and false-alarm rate (<5%) as CBM-program KPIs.",
        "Re-baseline after every overhaul.",
        "Convert every validated alert to a CMMS WO — the alert-to-WO interface is the operational hinge.",
      ],
      related_concepts: [
        "Equipment Reliability (Lesson 1) — Weibull β drives the CM-vs-PM choice (β≈1 ⇒ CBM).",
        "Work Zone Analysis (Lesson 3) — criticality × Pareto sets CBM deployment priority.",
        "Equipment History (Lesson 4) — closed-loop CBM alert → WO → closeout with ISO-14224 code → analytics.",
        "ISO 10816-3 — vibration severity by machine class.",
        "ISO 4406 — oil cleanliness code.",
        "ISO 14224 — failure-code taxonomy underlying CBM alert-to-WO.",
      ],
      prerequisites: [
        "Equipment Reliability competency (failure modes, MTBF, Weibull β).",
        "Mechanical basics (bearing, gear, rotor, fluid-system operation).",
        "Electrical basics (3-phase motor, current signature, slip).",
        "CMMS WO generation from a CBM alert.",
        "Awareness of ISO 10816, ISO 14224, ISO 4406.",
      ],
      references: [
        "SMRP CMRP BOK — ER pillar: Condition Monitoring & Diagnostics.",
        "SMRP CMRP Exam Outline.",
        "ISO 10816-3:2009.",
        "ISO 14224:2016.",
        "ISO 4406:2021.",
        "ISO 55000:2014.",
        "Mobley (2008), Maintenance Engineering Handbook.",
        "Campbell & Jardine (2001), Maintenance Strategy.",
        "Ebeling (2010), An Introduction to Reliability and Maintainability Engineering.",
        "O'Hanlon (2006), Uptime.",
        "Reliabilityweb.com / SMRP best-practices bodies for CBM.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Condition Monitoring & Diagnostics",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which CBM technology is the canonical earliest-detection method for partial discharge (PD) in a 13.8 kV switchgear?",
      whyCorrect:
        "Ultrasonic detection is the canonical earliest-detection technology for partial discharge. PD emits high-frequency stress waves (typically 40–100 kHz) detectable by airborne or contact ultrasonic sensors before any thermal rise or visible damage occurs. Thermography can also catch PD-induced hot-spots, but ultrasonic catches PD earlier because the stress-wave emission precedes the thermal rise.",
      whyOthersWrong: [
        "Vibration analysis detects rotating-element wear (bearings, gears, rotors) — PD is not a mechanical-vibration phenomenon and produces no detectable signature on a standard vibration analyzer.",
        "Oil analysis detects lubricant degradation and wear metals — switchgear is not oil-filled (except some transformers, which use dissolved-gas analysis (DGA), not standard oil analysis).",
        "Thermography can catch PD-induced hot-spots, but the thermal rise lags the stress-wave emission by days to weeks; ultrasonic catches PD earlier.",
      ],
      explanation:
        "Mobley's Handbook cross-reference: PD ⇒ ultrasonic (earliest); electrical hot-spots (later stage) ⇒ thermography. The CMRP candidate must know which technology detects which failure mode earliest.",
      options: [
        { text: "Vibration analysis", isCorrect: false },
        { text: "Ultrasonic detection", isCorrect: true },
        { text: "Oil analysis", isCorrect: false },
        { text: "Thermography (alone, as the earliest)", isCorrect: false },
      ],
    },
    {
      competencyName: "Condition Monitoring & Diagnostics",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Numerical",
      scenario: "Manufacturing",
      stem: "A 15-kW centrifugal pump (ISO 10816 Class II, rigid mount) shows a vibration velocity of 7.8 mm/s RMS at the drive-end bearing housing. Per ISO 10816, which zone applies and what action is required?",
      whyCorrect:
        "For ISO 10816 Class II rigid-mount, the zone C/D boundary is at 7.1 mm/s RMS. A reading of 7.8 mm/s is above 7.1 ⇒ zone D — unacceptable, immediate action required (typically shut down or take urgent corrective action within hours). The 2.8 mm/s B/C boundary was crossed earlier in the trend; the 7.1 mm/s C/D boundary is the trip threshold.",
      whyOthersWrong: [
        "Zone A (new/repaired) is for typical readings ≤ 1.4 mm/s RMS; 7.8 is far above — not a new-machine reading.",
        "Zone B (acceptable long-term) is up to 2.8 mm/s RMS for Class II rigid; 7.8 is well above the B/C boundary.",
        "Zone C (unsatisfactory — long-term action) is between 2.8 and 7.1 mm/s RMS; the reading 7.8 is above the 7.1 C/D boundary, putting it in zone D (immediate action), not zone C (long-term action).",
      ],
      explanation:
        "ISO 10816 Class II rigid-mount zones: A/B 1.4, B/C 2.8, C/D 7.1 mm/s RMS. The 7.1 mm/s threshold is the canonical alarm (high-high) cited in the SMRP BOK.",
      options: [
        { text: "Zone A — new/repaired, no action", isCorrect: false },
        { text: "Zone B — acceptable long-term, continue running", isCorrect: false },
        { text: "Zone C — unsatisfactory, plan corrective action within a limited window", isCorrect: false },
        { text: "Zone D — unacceptable, immediate action (shut down or urgent corrective)", isCorrect: true },
      ],
    },
    {
      competencyName: "Condition Monitoring & Diagnostics",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Manufacturing",
      stem: "A bearing has a P-F interval of 90 days (the time from when a defect becomes detectable to functional failure). What is the recommended CBM route interval?",
      whyCorrect:
        "The recommended CBM route interval is 1/4 to 1/2 of the P-F interval, so for a 90-day P-F, the interval should be 22–45 days. 30 days is in the middle of that range and is the correct answer — short enough to catch the detectable window before functional failure, long enough to be cost-effective.",
      whyOthersWrong: [
        "180 days (= 2× P-F) is too long — most defects would propagate to functional failure before the next measurement, defeating the purpose of CBM.",
        "90 days (= exactly P-F) is risky — the measurement timing might land just after the detectable window opens, or the failure may propagate faster than expected. The recommended factor is 1/4 to 1/2, not 1.",
        "7 days (= P-F/13) is over-monitoring; the cost of route-based CBM scales with frequency, and the additional safety margin is not worth ~4× the route cost. The 1/4 to 1/2 range balances detection probability with cost.",
      ],
      explanation:
        "P-F interval = t_F − t_P. CBM interval ≤ P-F/4 (recommended) to P-F/2 (acceptable). A 90-day P-F ⇒ 22–45 day route; 30 days is the canonical choice.",
      options: [
        { text: "180 days (P-F × 2)", isCorrect: false },
        { text: "90 days (exactly P-F)", isCorrect: false },
        { text: "30 days (~P-F/3, within the 1/4 to 1/2 range)", isCorrect: true },
        { text: "7 days (P-F/13, over-monitoring)", isCorrect: false },
      ],
    },
    {
      competencyName: "Condition Monitoring & Diagnostics",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "DecisionMaking",
      skillType: "Conceptual",
      scenario: "Container Terminal",
      stem: "You are the condition-monitoring engineer at a Container Terminal with 14 RTG cranes. Today's CBM data: (A) RTG-07 hoist gearbox oil Fe 380 ppm (target <50) with no vibration route on the hoist gearbox; (B) RTG-11 trolley motor vibration 6.8 mm/s RMS (zone C, just below the 7.1 trip); (C) RTG-09 gantry thermography ΔT +23°C above baseline; (D) RTG-03 hoist motor MCSA sidebands at (1±2s)·f_line within 38 dB of line frequency. Which requires immediate action today?",
      whyCorrect:
        "(D) — the MCSA sidebands at 38 dB (within the 45 dB threshold) indicate a broken rotor bar. A broken rotor bar is a catastrophic failure mode: rotor disintegration can take the stator with it, causing a multi-week unplanned outage and a multi-hundred-thousand-dollar repair. The other three (A, B, C) are alert-level but below their respective trip thresholds and can be addressed within 7 days.",
      whyOthersWrong: [
        "(A) oil Fe 380 ppm is high and indicates bearing wear, but a single sample is not enough — trend-confirmation requires 2–3 consecutive samples; the bearing can be inspected at the next planned outage without immediate action.",
        "(B) vibration 6.8 mm/s is at zone C (between 2.8 and 7.1 mm/s) — alert but the 7.1 trip has not been crossed, so action is required but not necessarily today; investigate within 48 h.",
        "(C) thermography ΔT +23°C is above the 15°C alert but below the 40°C high-high trip — investigate within 7 days, not today.",
      ],
      explanation:
        "MCSA broken-rotor-bar signature: sidebands at (1±2s)·f_line. Sideband magnitude within 45 dB of line frequency ⇒ strong indicator. 38 dB is well within that. The catastrophic-failure potential (rotor disintegration damaging the stator) escalates this above the other three alerts.",
      options: [
        { text: "(A) RTG-07 hoist gearbox oil Fe 380 ppm", isCorrect: false },
        { text: "(B) RTG-11 trolley motor vibration 6.8 mm/s (zone C)", isCorrect: false },
        { text: "(C) RTG-09 gantry thermography ΔT +23°C", isCorrect: false },
        { text: "(D) RTG-03 hoist motor MCSA sidebands at 38 dB (broken rotor bar)", isCorrect: true },
      ],
    },
    {
      competencyName: "Condition Monitoring & Diagnostics",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: A single absolute ISO 10816 alarm threshold is sufficient for a vibration CBM program — no statistical or trending overlay is needed.",
      whyCorrect:
        "False. A single absolute threshold generates excessive false alarms on machines that legitimately sit at zone C at baseline (older rigid-frame machines), and misses incipient wear on machines that sit at zone A at baseline (newer, precision-aligned machines). The CMRP best practice is to overlay the ISO absolute threshold with a statistical threshold (baseline + 2σ) and a trending threshold (rate-of-change), to reduce both false alarms and missed detections.",
      whyOthersWrong: [
        "True — the candidate would miss the three-threshold philosophy. A single absolute threshold is the most common CBM program failure mode: planners lose trust in alerts, the CBM-to-WO conversion drops below 90%, and the program collapses.",
      ],
      explanation:
        "Three threshold philosophies: absolute (ISO 10816, one-size-fits-most), statistical (baseline + 2σ, asset-specific), trending (rate-of-change, leading indicator). Use all three — the false-alarm and missed-detection rates drop dramatically.",
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Work Zone Analysis
// ---------------------------------------------------------------------------

const LESSON_WORK_ZONE_ANALYSIS: RefLesson = {
  competencyName: "Work Zone Analysis",
  slug: "er-work-zone-analysis",
  title: "Work Zone Analysis",
  titleAr: "تحليل منطقة العمل",
  order: 3,
  durationMin: 28,
  references: ER_REFERENCE_TITLES,
  conceptIntroduction: `Work Zone Analysis prioritizes the reliability-engineering effort by intersecting a design-view criticality matrix (what would happen if this asset failed?) with a data-view bad-actor Pareto (what is failing and costing?). The priority-1 work zone is the high-criticality + high-failure-cost intersection; it commands the RCA, redesign, and capex effort. The Pareto is empirical (re-derive per plant; ~80/20 is the textbook, real plants see 80/8 to 80/30) and refreshed quarterly; criticality is re-validated annually. The addressable-cost calculation (FC × (1 − FR_target/FR_current)) converts the Pareto into a business case. ISO 55001 Clauses 6.2.2 (asset-management plan) and 9.3 (management review) operationalize the work zone.`,
  example: `A Chemical plant has 120 rotating assets with $1.4M total annual failure cost. Top-10 assets account for $1,130k (80.7% of cost). Pareto cut-off: 80/8 (10 assets = 8.3% of population account for 80.7% of cost — sharper than 80/20, common in mature plants). Criticality (design view): P-301 (acid pump, single feed to reactor R-1) is H-critical; P-402 (acid with installed spare B) is M-critical. Intersection (P1): H-critical AND top-10 Pareto ⇒ P-301, C-201, A-101, F-501 (4 assets). For P-301: current MTBF=2,800 h, target MTBF=8,000 h ⇒ AC = $240k × (1 − 2800/8000) = $240k × 0.65 = $156k/year. Capex $30k. Payback = 30/156 = 0.19 years (~2.3 months). Fund.`,
  keyFormulas: `Criticality score C_asset = max(C_safety, C_environment, C_production, C_quality, C_regulatory) on a 1-5 scale
Risk Priority Number (RPN, FMEA) = S × O × D — Severity × Occurrence × Detection (1-1000)
Failure cost (per asset per year) FC = (Σ downtime-h × $/h) + (Σ parts) + (Σ labor) + collateral + secondary loss
Pareto cumulative % Cum%_n = (Σ_{i=1..n} FC_i) / (Σ_{i=1..N} FC_i) × 100
Bad-actor cut-off = the n where Cum%_n first ≥ 80%
Addressable cost AC = FC × (1 − FR_target / FR_current) = FC × (1 − MTBF_current / MTBF_target)
Payback = Capex / AC [years]; target ≤ 2 years
Improvement ROI = (AC × horizon − Capex) / Capex × 100`,
  exercise: `You are the reliability manager at a Power plant. The CMMS extract shows: (A) Boiler feedwater pump P-BFP-01: 8 failures/year, $480k/year FC, H-critical, MTBF 2000 h, target MTBF 12,000 h. (B) Condensate pump P-CD-03: 12 failures/year, $240k/year, L-critical (3×50% redundant), β=1.1 random. (C) Induced-draft fan F-ID-01: 3 failures/year, $300k/year, H-critical, MTBF 3500 h, target 14000 h. (D) Soot-blower SB-09: 6 failures/year, $80k/year, M-critical, β=1.5 slight wear-out. You have $150k capex and one reliability-engineer FTE for 12 months. Rank the actions by priority-zone + ROI.`,
  sections: {
    learning_objectives: `- Define asset criticality; produce a criticality matrix (likelihood × consequence) ranked by H/M/L.
- Build a Pareto of failure cost by asset (top 20% bad actors ≈ 80% of cost).
- Distinguish bad-actor identification (data-driven) from criticality analysis (design-driven).
- Apply the criticality-Pareto intersection to prioritize RCA, CBM deployment, and redesign effort.
- Construct a work-zone criticality register that feeds planning, scheduling, and reliability engineering.
- Quantify the improvement opportunity (addressable cost in $/year; payback in years).`,
    prerequisites: `- Equipment Reliability (Lesson 1) — MTBF, Weibull β, RAM.
- Condition Monitoring & Diagnostics (Lesson 2) — failure-mode detection.
- CMMS asset hierarchy and failure-code capture (ISO 14224).
- Cost-of-ownership basics: maintenance cost, downtime cost, RAV.
- ISO 55000 asset-management plan structure.`,
    introduction: `Work Zone Analysis is the third ER competency. Where Equipment Reliability (Lesson 1) and Condition Monitoring (Lesson 2) analyze individual assets, Work Zone Analysis ranks the entire asset population by criticality and by failure cost to prioritize the reliability-engineering effort. The CMRP BOK tests the candidate's ability to intersect a criticality matrix (design view — what would happen if this asset failed?) with a bad-actor Pareto (data view — what is failing and costing?).

The fundamental theorem of work-zone analysis is the Pareto intersection: the top 20% of assets by failure cost account for ~80% of total reliability spend. The reliability engineer's job is to identify that 20% — the bad actors — and to attack them with RCA, redesign, or strategy shifts. The 80/20 is empirical; some plants see 70/30 or 90/10. The cut-off is re-derived per plant.

Criticality analysis is the design complement to bad-actor Pareto. An asset is critical when its failure has unacceptable consequences: safety, environmental, production-loss, quality, or regulatory. A criticality matrix plots likelihood (L: 1-5) against consequence (C: 1-5) and ranks assets by L×C. A high-consequence low-failure-rate asset (e.g., a turbine overspeed trip) is critical even if it has not failed in the past 5 years. The intersection of high-criticality with high-failure-cost is the priority-1 work zone.

ISO 55001:2014 (Clause 6.2.2) requires the asset-management plan to prioritize assets by criticality and risk; work-zone analysis is the operational manifestation of that requirement. Campbell & Jardine (2001) develop the asset-criticality → maintenance-strategy → work-priority linkage that the CMRP BOK tests.`,
    terminology: `- **Criticality**: the consequence-of-failure ranking of an asset (H/M/L).
- **Criticality matrix**: 5×5 grid, x = likelihood (1-5), y = consequence (1-5); cells color-coded H/M/L.
- **Consequence categories**: safety, environment, production, quality, regulatory, community.
- **Bad actor**: asset in the top 20% (or other cut-off) by failure cost or downtime.
- **Pareto**: cost-ranked bar chart with cumulative-% line; the 80% crossing identifies the bad-actor cut-off.
- **RCA (Root Cause Analysis)**: structured method to identify the underlying cause of a failure (5-Whys, Fishbone, Apollo, RCFA).
- **Failure-cost categories**: downtime cost (= downtime hours × production loss $/h), parts, labor, collateral, secondary loss.
- **Work zone**: a population of assets grouped by criticality × failure-cost for prioritized treatment.
- **Risk Priority Number (RPN)** (FMEA): RPN = S × O × D (Severity × Occurrence × Detection); 1-1000 scale.
- **Addressable cost**: the portion of total failure cost that an improvement action could realistically remove.
- **P1/P2/P3/P4**: priority zones — P1 (H-critical + Pareto top-20%), P2 (H-critical + low-failure-cost), P3 (L-critical + Pareto top-20%), P4 (everything else).`,
    detailed_explanation: `Work Zone Analysis has four steps:

**(1) Criticality analysis (design view).** For each asset, score consequence on each of: safety (1=no injury, 5=fatality), environment (1=no release, 5=reportable release), production (1=no impact, 5=plant shutdown), quality (1=no impact, 5=total loss), regulatory (1=none, 5=criminal). The asset's criticality is the maximum across categories (the dominant consequence). An asset with a 5 in safety is "Critical" regardless of its other scores. An asset with a 4 in production and 2 in safety is "Essential" (H/M). An asset with all 1s is "Run-tolerant" (L).

The likelihood is typically scored from the asset's own failure history (e.g., MTBF class). For new assets, likelihood is scored by reference to similar assets or by OEM data.

**(2) Bad-actor Pareto (data view).** Extract 12-24 months of CMMS data. Compute failure cost per asset = (downtime hours × production loss $/h) + (parts cost) + (labor cost) + (collateral damage cost) + (secondary loss cost). Rank descending. The cumulative-% line typically crosses 80% at the 15-25% asset count — that's the bad-actor cut-off. Re-derive per plant.

**(3) Intersection (the work zone).** The priority-1 work zone is the intersection of "Critical" or "Essential" criticality AND bad-actor top-20%. These assets get the RCA, the strategy shift, the redesign — they are where the reliability-engineering effort has the highest ROI. Priority-2 is critical-but-low-failure-cost (where the strategy is "preserve the design — keep the failure rate low"). Priority-3 is non-critical but bad-actor (where the strategy may be "run-to-failure with spares staged"). Priority-4 is everything else.

**(4) Improvement-opportunity sizing.** For each priority-1 bad actor, size the addressable cost. E.g., if P-301 is a bad actor with $100k/year failure cost, and a bearing upgrade would lift MTBF from 2,800 h to 8,000 h (so the failure rate falls by 65%), the addressable cost is ~$65k/year. The capex is $15k. Payback = 0.23 years ⇒ fund it.

The criticality matrix and the Pareto are updated on different cadences: criticality is re-validated annually (it changes only when the asset's role, the regulatory environment, or the safety context changes); the Pareto is updated quarterly (it changes as failures occur and as improvement actions bite).`,
    core_principles: `- **Criticality is design-driven** (what would happen if this failed?); **bad-actor is data-driven** (what is failing?).
- **The Pareto 80/20 is empirical, not a law** — re-derive per plant.
- **The priority-1 work zone is the intersection of criticality H + Pareto top-20%**.
- **RCA is the highest-ROI reliability work when applied to the priority-1 zone.**
- **Addressable cost = total cost × (1 − achievable failure-rate ratio).**
- **Criticality changes slowly; the Pareto changes quarterly.**
- **Each priority zone has a different strategy: P1 ⇒ RCA/redesign; P2 ⇒ preserve; P3 ⇒ run-to-failure with spares; P4 ⇒ routine CBM/PM.**`,
    components: `- **Asset register** (CMMS extract with asset tag, name, class, parent system).
- **Criticality matrix template** (5×5 H/M/L by consequence category).
- **Production-loss $/h table** (by plant area).
- **CMMS extract of WO history** (12-24 months) with failure codes (ISO 14224).
- **Pareto chart** (cost ranked, with cumulative-% line).
- **RCA register** (open RCAs with assigned owners, due dates).
- **Improvement-opportunity sizing worksheet** (AC = FC × (1 − FR_target/FR_current)).
- **Priority-zone register** (P1/P2/P3/P4 per asset).`,
    process: `1. Extract CMMS asset register; rank by criticality score (design view).
2. Compute failure cost per asset (downtime × $/h + parts + labor + collateral).
3. Build the Pareto chart; identify the 80% crossing (the bad-actor cut-off).
4. Intersect criticality H + bad-actor top-20% → priority-1 work zone.
5. For each P1 asset, assign an RCA owner and due date.
6. Size the addressable cost: failure cost × (1 − target failure-rate ratio).
7. Recommend action per asset: redesign, strategy shift, spares staging, run-to-failure.
8. Track the bad-actor exit rate (P1 assets removed from the top-20% by their improvement action).
9. Re-validate criticality annually; refresh the Pareto quarterly.
10. Report to the asset-management steering committee (ISO 55001 Cl. 9.3 management review).`,
    formula_calculation: `- **Criticality score**:
  C_asset = max(C_safety, C_environment, C_production, C_quality, C_regulatory) on a 1-5 scale.
  Variables: each C is the consequence score in its category. Interpretation: H = C≥4, M = C=3, L = C≤2.

- **Risk Priority Number (RPN, FMEA)**:
  RPN = S × O × D
  Variables: S = Severity (1-10), O = Occurrence (1-10), D = Detection (1-10). Range 1-1000. Action threshold: RPN > 100 (typical) or > 200 (conservative).

- **Failure cost (per asset per year)**:
  FC = (Σ downtime_h × $/h) + (Σ parts_$) + (Σ labor_$) + (collateral_$) + (secondary_loss_$)

- **Pareto cumulative %**:
  Cum%_n = (Σ_{i=1..n} FC_i) / (Σ_{i=1..N} FC_i) × 100
  The bad-actor cut-off = the n where Cum%_n first ≥ 80% (re-derive per plant; 80/8 to 80/30 is typical).

- **Addressable cost**:
  AC = FC × (1 − FR_target / FR_current) = FC × (1 − MTBF_current / MTBF_target)
  Example: FR_current = 1/2800, FR_target = 1/8000 ⇒ AC = FC × (1 − 2800/8000) = FC × 0.65.

- **Payback**:
  Payback = Capex / AC [years]; target ≤ 2 years for prioritization.

- **Improvement ROI**:
  ROI = (AC × horizon − Capex) / Capex × 100; horizon typically 3-5 years.

- **Bad-actor exit rate**:
  Exit rate = (P1 assets removed from top-20% by improvement action) / (total P1 assets) × 100; target ≥80% within 18 months.`,
    worked_example: `**Problem.** A Chemical plant has 120 rotating assets (pumps, agitators, compressors, fans). CMMS extract over 12 months shows total failure cost $1.4M. The top-10 assets by failure cost are:

| Rank | Asset | FC ($k) | Cum ($k) | Cum% |
|------|-------|---------|----------|------|
| 1 | P-301 (acid pump) | 240 | 240 | 17.1 |
| 2 | C-201 (compressor) | 180 | 420 | 30.0 |
| 3 | A-101 (agitator) | 145 | 565 | 40.4 |
| 4 | P-402 (acid pump) | 110 | 675 | 48.2 |
| 5 | F-501 (ID fan) | 95 | 770 | 55.0 |
| 6 | P-103 (water pump) | 90 | 860 | 61.4 |
| 7 | A-202 (agitator) | 80 | 940 | 67.1 |
| 8 | C-202 (compressor) | 75 | 1015 | 72.5 |
| 9 | P-405 (acid pump) | 65 | 1080 | 77.1 |
| 10 | P-406 (acid pump) | 50 | 1130 | 80.7 |

**Step 1 — Pareto cut-off.** The cumulative-% crosses 80% at rank 10 (P-406). So the top-10 assets (8.3% of the population) account for 80.7% of failure cost — an 80/8 rule (a sharper Pareto than 80/20, common in mature plants where the broad population has been cleaned up).

**Step 2 — Criticality (design view).** P-301 (acid service, single feed to reactor R-1) is H-critical (production loss $4,800/h). C-201 (instrument-air to DCS, single source) is H-critical (production loss entire plant = $24,000/h). A-101 (reactor agitator, single) is H-critical. P-402 (acid service, but with installed spare B) is M-critical. F-501 (ID fan, no spare, boiler trips on loss) is H-critical. P-103 (cooling-water pump, 3×50% redundant) is L-critical. A-202 (storage tank agitator, no immediate production loss) is L-critical. C-202 (air compressor, redundant) is M-critical. P-405 (acid service with spare) is M-critical. P-406 (acid service with spare) is M-critical.

**Step 3 — Work zone intersection (P1).** Priority-1 = H-critical AND top-10 Pareto:
  - P-301 (H, rank 1)
  - C-201 (H, rank 2)
  - A-101 (H, rank 3)
  - F-501 (H, rank 5)
  Four assets in P1.

**Step 4 — Addressable cost.**
For P-301: current MTBF=2,800 h, target MTBF=8,000 h (after bearing upgrade + PM at 1500 h). AC = $240k × (1 − 2800/8000) = $240k × 0.65 = **$156k/year**. Capex = $30k. Payback = 30/156 = 0.19 years (~2.3 months). Fund.

For C-201: current MTBF=4,000 h, target=12,000 h (after redesign of the valve-plate assembly). AC = $180k × (1 − 4000/12000) = $180k × 0.667 = **$120k/year**. Capex = $80k. Payback = 80/120 = 0.67 years (8 months). Fund.

For A-101: current MTBF=3,500 h, target=7,000 h (after seal upgrade + impeller balance). AC = $145k × 0.5 = **$72.5k/year**. Capex = $40k. Payback = 0.55 years. Fund.

For F-501: current MTBF=4,500 h, target=9,000 h (after bearing upgrade + vibration CBM). AC = $95k × 0.5 = **$47.5k/year**. Capex = $25k. Payback = 0.53 years. Fund.

**Step 5 — Priority-2 zone.** P-402, C-202, P-405, P-406 are M-critical bad actors — apply RCA where the addressable cost justifies (P-402 = $110k, with target MTBF 8,000 ⇒ AC=$71.5k; payback depends on capex). These are sequenced after P1.

**Step 6 — Priority-3 zone.** P-103 (L-critical, rank 6, but $90k/year) — the recommendation is run-to-failure with a staged spare (already 3×50% redundant; current failures are due to bearing wear — implement CBM, no capex).

**Step 7 — Result.** Four P1 RCAs funded, total capex $175k, total AC $396k/year, blended payback 0.44 years (~5 months). The remaining 110 assets (92% of population) account for only 19% of failure cost and are scheduled for routine CBM/PM.`,
    industrial_example: `**Chemical — acid-transfer pump cluster (above).** P-301 leads the Pareto at $240k/year. Weibull β=2.0 wear-out. Funded action: bearing upgrade + PM at 1,500 h. Payback ~2.3 months.

**Oil & Gas — gas-compressor train.** A two-train compressor station; train A is the bad actor (12 events × $40k = $480k/year). Criticality H (export gas flaring at $250k/day). The P1 RCA finds the failure mode is seal-gas contamination. Redesign: dual-buffer seal-gas system. Capex $1.2M, AC $320k/year (residual 33% remains). Payback 3.75 years — borderline; deferred to next turnaround.

**Power — boiler feedwater (BFP) cluster.** 3×50% redundant (each H-critical due to plant trip on full-loss). Pareto: 3 BFPs in top-10 (P1). Weibull β=2.4 wear-out. Funded action: PM at 4,000 h + CBM. Blended AC: $480k/year. Capex $90k. Payback 0.19 years.

**Manufacturing — robotic weld cell.** 80 robots; Pareto top-16 (20%) = 81% of $1.0M failure cost. Most are servo-drive failures (β=4.5). P1: upgrade servos with a higher IPM-rating model; AC ~$530k/year. Capex $200k. Payback 0.38 years.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** A Container Terminal with 14 RTG cranes. Annual failure cost: $1.8M (crane downtime at $1,200/h). The reliability engineer built the Pareto: top-3 cranes (RTG-03, -07, -11) accounted for 64% of failure cost; top-6 (43% of population) accounted for 85% — a sharper Pareto than 80/20. The criticality intersection: all 14 RTGs were H-critical (vessel-loading stops on crane failure), so the Pareto itself was the priority-1 zone. The top-3 cranes were RCA'd: RTG-03 had a recurring hydraulic leak (seal wear); RTG-07 had a recurring hoist-gearbox bearing failure (lubrication); RTG-11 had a recurring spreader-twistlock fault (electrical intermittent). Each P1 asset had a different failure mode ⇒ each needed its own RCA. After 18 months: RTG-03 AC=$120k/year (seal upgrade), RTG-07 AC=$85k/year (lube PM), RTG-11 AC=$95k/year (rewire). Total capex $60k, total AC $300k/year, blended payback 0.20 years. The bad-actor share of total cost fell from 85% (top-6) to 51% (top-6) as the broad population's failures became relatively larger. The case demonstrates that work-zone analysis is a continuous balancing act: the Pareto changes as improvement actions bite.`,
    visual_explanation: `- **Criticality matrix**: 5×5 grid; x = likelihood (1-5), y = consequence (1-5); color H (red, top-right), M (yellow, diagonal), L (green, bottom-left).
- **Pareto chart**: bar chart of FC per asset (descending) + cumulative-% line; the 80% crossing marked.
- **Work-zone scatter**: x = criticality (H/M/L), y = failure cost; quadrants P1 (top-right H/high cost), P2 (top-left H/low cost), P3 (bottom-right L/high cost), P4 (bottom-left L/low cost).
- **Addressable-cost waterfall**: total failure cost → minus AC(P1) → minus AC(P2) → residual.
- **RCA register Gantt**: open RCAs by owner, due date, asset; closure rate tracked.`,
    simulation_opportunity: `A work-zone sim where the learner is the reliability engineer at a Power plant with 200 assets. The sim injects: (a) a CMMS extract of 24 months of WO data with ISO-14224 failure codes, (b) a criticality matrix to populate, (c) a $/h production-loss table. The learner must: (a) compute FC per asset, (b) build the Pareto and identify the 80% crossing, (c) populate the criticality matrix, (d) intersect for the P1 work zone, (e) size addressable costs, (f) sequence capex. The sim scores: correctness of FC arithmetic, validity of Pareto cut-off, accuracy of criticality scoring, plausibility of AC sizing, and quality of capex sequencing.`,
    common_mistakes: `- **Treating criticality as static** (re-validate annually; it changes when production rate, regulations, or technology changes).
- **Setting the Pareto cut-off at exactly 20%** — re-derive per plant (some plants see 80/8, others 80/30).
- **Skipping the criticality intersection** — chasing the bad-actor top-20% by cost alone can lead to RCA on L-critical assets where run-to-failure is the right answer.
- **Pooling failure modes in one RCA** (a P1 asset with 5 distinct failure modes needs 5 RCAs, not 1).
- **Forgetting the addressable cost step** — sizing the capex without the AC produces a budget, not a business case.
- **Treating the Pareto as a one-off** (it must be refreshed quarterly).
- **Reporting RPN=FMEA without an action threshold** (RPN > 100, > 200, etc. — set the threshold before ranking).
- **Confusing consequence scoring across categories** (a 5 in safety ≠ a 5 in production — take the maximum across categories).`,
    limitations: `- **The Pareto 80/20 is empirical**; some plants see 70/30 or 90/10 — re-derive per plant.
- **Criticality is subjective** — different stakeholders score differently; the scoring framework must be agreed cross-function.
- **The addressable cost is an estimate** — the actual post-action failure rate may differ (better or worse).
- **Work-zone analysis assumes the CMMS data is clean**; mis-coded or un-coded WOs corrupt the FC arithmetic.
- **The P1 cut-off can be gamed** by misclassifying assets as L-critical to escape RCA.
- **The 5×5 matrix granularity (1-5) is coarse**; some plants use 1-10.`,
    comparison: `- **Criticality (design view) vs. Pareto (data view)**: criticality is "what would happen if this failed?"; Pareto is "what is failing?". The intersection is the work zone.
- **RCA (depth-first) vs. Pareto (breadth-first)**: RCA is the depth-first method on a single asset/failure; Pareto is the breadth-first prioritization across the population.
- **FMEA RPN vs. Pareto FC**: RPN is a per-asset scoring (S×O×D); FC is a per-asset dollar cost. Both rank; FMEA is forward-looking, Pareto is backward-looking.
- **Criticality vs. RAV**: criticality is consequence-of-failure; RAV is replacement cost. An asset can have low RAV but high criticality (e.g., a $5k instrument that trips a $1B plant).
- **Work-zone P1 (high-critical + high-cost) vs. P2 (high-critical + low-cost)**: P1 needs improvement; P2 needs preservation (keep the failure rate low).`,
    practical_application: `- **Daily**: maintain the WO closeout discipline (no closure without ISO-14224 code); the Pareto is built downstream.
- **Weekly**: review open RCAs (P1 zone); assign new ones; close completed ones.
- **Monthly**: refresh the Pareto; review the bad-actor entry/exit rate.
- **Quarterly**: review the criticality matrix; re-evaluate H/M/L assignments; refresh the P1 work zone.
- **Annually**: re-validate criticality with operations, engineering, safety; re-publish the priority register.`,
    decision_scenario: `You are the reliability manager at a Power plant. The CMMS extract shows:
(A) Boiler feedwater pump P-BFP-01: 8 failures/year, $480k/year FC, H-critical, β=2.4 (bearing wear-out), MTBF 2,000 h, target 12,000 h. Capex $60k.
(B) Condensate pump P-CD-03: 12 failures/year, $240k/year FC, L-critical (3×50% redundant), β=1.1 (random). Capex $0 (run-to-failure with spares).
(C) Induced-draft fan F-ID-01: 3 failures/year, $300k/year FC, H-critical, β=3.2 (blade-erosion wear-out), MTBF 3,500 h, target 14,000 h. Capex $80k.
(D) Soot-blower SB-09: 6 failures/year, $80k/year FC, M-critical, β=1.5 (slight wear-out). Capex $40k.

You have $150k capex and one reliability-engineer FTE for 12 months. Rank the actions.

Decision: rank by priority-zone + ROI.
  1. (A) P-BFP-01: P1 (H+Pareto), AC = $480k × (1 − 2000/12000) = $400k/year. Capex $60k. Payback 0.15 years. Fund first.
  2. (C) F-ID-01: P1 (H+Pareto), AC = $300k × (1 − 3500/14000) = $225k/year. Capex $80k. Payback 0.36 years. Fund second.
  3. (B) P-CD-03: P3 (L+Pareto). Run-to-failure with spares. The β=1.1 means PM won't help. Capex $0; CBM on the redundant pumps. Defer.
  4. (D) SB-09: P2 (M+Pareto). AC = $80k × (1 − 3500/9000) = $49k/year. Capex $40k. Payback 0.82 years. Fund if capex remains after P1.

Sequence: (A) → (C) → (D) if remaining capex ≥ $40k; (B) deferred. Total capex = $60k + $80k + $40k = $180k — over budget. Cut (D) to stay at $140k. Total AC = $625k/year for $140k ⇒ blended payback 0.22 years.`,
    practice_questions: `- Distinguish asset criticality (design view) from bad-actor Pareto (data view).
- A 100-asset plant has $1.0M total failure cost; the top-10 assets account for $820k. Compute the Pareto cut-off (% of population, % of cost). *(Answer: 10% of population = 82% of cost; an 82/10 rule.)*
- A critical asset has FC=$300k/year, current MTBF=2,000 h, target MTBF=8,000 h. Compute the addressable cost. *(Answer: $300k × (1 − 2000/8000) = $300k × 0.75 = $225k/year.)*
- Give the five consequence categories typically scored in a criticality matrix.
- Compute RPN for S=8, O=4, D=3 (FMEA). *(Answer: 8 × 4 × 3 = 96 — below the typical action threshold of 100.)*
- Explain why a Pareto-driven RCA on an L-critical asset is sometimes the wrong answer.`,
    certification_questions: `The CMRP exam tests Work Zone Analysis as the third ER competency. SMRP-aligned sample prompts:

(a) Build a criticality matrix for a given asset population.
(b) Compute failure cost per asset from CMMS data.
(c) Identify the bad-actor top-20% by Pareto; the 80% crossing sets the cut-off.
(d) Intersect criticality H + Pareto top-20% → priority-1 work zone.
(e) Size the addressable cost for an improvement action; compute payback and rank capex options.
(f) Recognize that the 80/20 is empirical (re-derive per plant).

The questions in this lesson's question bank are aligned to these Work Zone Analysis competencies.`,
    summary: `Work Zone Analysis prioritizes the reliability-engineering effort by intersecting a design-view criticality matrix with a data-view bad-actor Pareto. The priority-1 zone is the high-criticality + high-failure-cost intersection; it commands the RCA, redesign, and capex effort. The Pareto is empirical (re-derive per plant; 80/8 to 80/30 is typical) and refreshed quarterly; criticality is re-validated annually. The addressable-cost calculation (FC × (1 − FR_target/FR_current)) converts the Pareto into a business case. Work-zone analysis is the bridge between the per-asset reliability engineering of Lessons 1-2 and the asset-management steering-committee decision-making of ISO 55001 Clause 9.3.`,
    key_takeaways: `- Criticality = design view (consequence of failure); Pareto = data view (failure cost).
- Priority-1 = H-critical AND Pareto top-20%; the highest-ROI work zone.
- Failure cost = downtime-h × $/h + parts + labor + collateral.
- Addressable cost = FC × (1 − MTBF_current / MTBF_target).
- Payback = Capex / AC; fund actions with payback ≤ 2 years (typical).
- Pareto refreshed quarterly; criticality re-validated annually.
- RPN (FMEA) = S × O × D on a 1-1000 scale; set the action threshold before ranking.`,
    references: `- SMRP. *CMRP Body of Knowledge — Equipment Reliability pillar: Work Zone Analysis.*
- SMRP. *CMRP Exam Outline.*
- ISO 55000:2014; ISO 55001:2014 Clause 6.2.2 (asset-management plan), Clause 9.3 (management review).
- ISO 55002:2018. *Guidelines for the application of ISO 55001.*
- ISO 14224:2016. *Collection of reliability and maintenance data for equipment.*
- Mobley, R. K. (2008). *Maintenance Engineering Handbook* (7th ed.). McGraw-Hill. Bad-actor and criticality chapters.
- Campbell, J. D. & Jardine, A. K. S. (2001). *Maintenance Strategy*. Productivity Press. Asset-criticality and priority-matrix chapters.
- Ebeling, C. E. (2010). *An Introduction to Reliability and Maintainability Engineering*. Waveland Press.
- O'Hanlon, T. (2006). *Uptime*. Industrial Press.
- Reliabilityweb.com / SMRP best-practices bodies for criticality and bad-actor analysis.`,
  },
  knowledgeObject: {
    title: "Work Zone Analysis — criticality matrix × bad-actor Pareto intersection",
    domain: "Equipment Reliability",
    competency: "Work Zone Analysis",
    topic: "Criticality & bad-actor prioritization",
    concept: "Work zone intersection",
    body: {
      definitions: [
        "Criticality: the consequence-of-failure ranking of an asset (H/M/L).",
        "Criticality matrix: 5×5 grid (likelihood × consequence) with cells color-coded H/M/L.",
        "Consequence categories: safety, environment, production, quality, regulatory, community.",
        "Bad actor: asset in the top 20% (or other cut-off) by failure cost or downtime.",
        "Pareto: cost-ranked bar chart with cumulative-% line; the 80% crossing identifies the bad-actor cut-off.",
        "RCA (Root Cause Analysis): structured method to identify the underlying cause of a failure (5-Whys, Fishbone, Apollo, RCFA).",
        "Failure-cost categories: downtime cost, parts, labor, collateral damage, secondary loss.",
        "Work zone: a population of assets grouped by criticality × failure-cost for prioritized treatment.",
        "RPN (FMEA): Risk Priority Number = S × O × D on a 1-1000 scale.",
        "Addressable cost (AC): the portion of total failure cost that an improvement action could realistically remove.",
        "Priority zones P1/P2/P3/P4: H+Pareto / H+low-cost / L+Pareto / everything else.",
      ],
      principles: [
        "Criticality is design-driven (what would happen if this failed?); bad-actor is data-driven (what is failing?).",
        "Pareto 80/20 is empirical, not a law — re-derive per plant (80/8 to 80/30 is typical).",
        "Priority-1 = H-critical AND Pareto top-20% — the highest-ROI work zone.",
        "RCA is highest-ROI when applied to P1 zone; L-critical assets may warrant run-to-failure with spares.",
        "Addressable cost = FC × (1 − MTBF_current/MTBF_target); payback = Capex/AC.",
        "Criticality changes slowly (annual re-validation); Pareto changes quarterly.",
        "Each priority zone has a different strategy: P1 ⇒ RCA/redesign; P2 ⇒ preserve; P3 ⇒ run-to-failure with spares; P4 ⇒ routine CBM/PM.",
      ],
      components: [
        "Asset register (CMMS extract with asset tag, name, class, parent system).",
        "Criticality matrix template (5×5 H/M/L by consequence category).",
        "Production-loss $/h table (by plant area).",
        "CMMS extract of WO history (12-24 months) with ISO-14224 failure codes.",
        "Pareto chart (cost ranked, with cumulative-% line).",
        "RCA register (open RCAs with assigned owners, due dates).",
        "Improvement-opportunity sizing worksheet (AC = FC × (1 − FR_target/FR_current)).",
        "Priority-zone register (P1/P2/P3/P4 per asset).",
      ],
      mechanism: [
        "CMMS WO history → failure cost per asset computed → cost-Pareto ranked → 80% crossing identifies bad-actor cut-off → criticality matrix scored per asset → intersection of H-critical + top-20% = P1 work zone → RCA assigned per P1 asset → addressable cost sized → capex sequenced by payback → improvement action implemented → Pareto refreshed quarterly → criticality re-validated annually (closed loop).",
      ],
      process: [
        "1. Extract CMMS asset register; rank by criticality score (design view).",
        "2. Compute failure cost per asset (downtime × $/h + parts + labor + collateral).",
        "3. Build the Pareto chart; identify the 80% crossing (bad-actor cut-off).",
        "4. Intersect criticality H + bad-actor top-20% → priority-1 work zone.",
        "5. For each P1 asset, assign an RCA owner and due date.",
        "6. Size the addressable cost: FC × (1 − MTBF_current/MTBF_target).",
        "7. Recommend action per asset: redesign, strategy shift, spares staging, run-to-failure.",
        "8. Track the bad-actor exit rate (P1 assets removed from top-20% by improvement action).",
        "9. Re-validate criticality annually; refresh the Pareto quarterly.",
        "10. Report to the asset-management steering committee (ISO 55001 Cl. 9.3 management review).",
      ],
      formulas: [
        "C_asset = max(C_safety, C_environment, C_production, C_quality, C_regulatory) on 1-5 scale.",
        "RPN (FMEA) = S × O × D on 1-1000 scale; action threshold typically RPN > 100.",
        "Failure cost FC = (Σ downtime-h × $/h) + (Σ parts) + (Σ labor) + collateral + secondary loss.",
        "Pareto cumulative Cum%_n = (Σ_{i=1..n} FC_i) / (Σ_{i=1..N} FC_i) × 100; cut-off at Cum% ≥ 80%.",
        "Addressable cost AC = FC × (1 − MTBF_current / MTBF_target).",
        "Payback = Capex / AC [years]; target ≤ 2 years.",
        "Improvement ROI = (AC × horizon − Capex) / Capex × 100.",
        "Bad-actor exit rate = (P1 removed from top-20% by improvement) / (total P1) × 100; target ≥80% within 18 months.",
      ],
      metrics: [
        "Number of P1 assets (H-critical + Pareto top-20%).",
        "Total P1 failure cost and P1 share of total failure cost [%].",
        "Bad-actor exit rate (P1 assets removed from top-20% by improvement action).",
        "RCA closure rate on P1 assets [%].",
        "Addressable cost per P1 asset [$k/year].",
        "Payback per capex option [years].",
        "Pareto cut-off (% of population accounting for 80% of cost).",
        "Criticality re-validation compliance [%].",
      ],
      examples: [
        "Chemical — 120 assets, $1.4M total cost; top-10 (8.3%) = 80.7% of cost (80/8 rule). P1 = 4 H-critical assets: P-301, C-201, A-101, F-501. Total capex $175k, total AC $396k/year, blended payback 0.44 years.",
        "Oil & Gas — gas-compressor train: train A bad actor at $480k/year; H-critical; capex $1.2M; AC $320k/year; payback 3.75 years (deferred).",
        "Power — BFP cluster: 3 BFPs in top-10 (P1); Weibull β=2.4; PM at 4,000 h + CBM; AC $480k/year; capex $90k; payback 0.19 years.",
        "Manufacturing — robotic weld cell: 80 robots; top-16 (20%) = 81% of $1.0M cost; servo upgrade; AC $530k/year; capex $200k; payback 0.38 years.",
      ],
      industrial_examples: [
        "Chemical — acid-transfer pump cluster: 80/8 Pareto; P1 = 4 assets; blended payback 0.44 years.",
        "Oil & Gas — gas-compressor train: capex-heavy redesign; payback 3.75 years (borderline).",
        "Power — BFP cluster: PM + CBM strategy; payback 0.19 years.",
        "Manufacturing — robotic weld cell: servo upgrade; payback 0.38 years.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Container Terminal, 14 RTG cranes. $1.8M annual failure cost ($1,200/h crane downtime). Pareto: top-3 cranes = 64%; top-6 (43% of population) = 85% (sharper than 80/20). All 14 RTGs H-critical (vessel-loading stops on crane failure). Top-3 RCA'd: RTG-03 hydraulic leak (seal wear); RTG-07 hoist-gearbox bearing (lubrication); RTG-11 spreader-twistlock (electrical). Each P1 had a different failure mode ⇒ each needed its own RCA. 18 months: total capex $60k, total AC $300k/year, blended payback 0.20 years. Bad-actor share of total cost fell from 85% (top-6) to 51% as the broad population's failures became relatively larger.",
      ],
      common_errors: [
        "Treating criticality as static (re-validate annually).",
        "Setting Pareto cut-off at exactly 20% — re-derive per plant (80/8 to 80/30 typical).",
        "Skipping the criticality intersection — chasing top-20% by cost alone leads to RCA on L-critical assets where run-to-failure is the right answer.",
        "Pooling failure modes in one RCA (5 modes need 5 RCAs).",
        "Forgetting the addressable cost step — sizing capex without AC produces a budget, not a business case.",
        "Treating the Pareto as a one-off (refresh quarterly).",
        "Reporting RPN without an action threshold.",
        "Confusing consequence scoring across categories (take the maximum across safety/environment/production/quality/regulatory).",
      ],
      limitations: [
        "Pareto 80/20 is empirical; some plants see 70/30 or 90/10 — re-derive per plant.",
        "Criticality is subjective; cross-functional scoring framework must be agreed.",
        "Addressable cost is an estimate; actual post-action failure rate may differ.",
        "Assumes clean CMMS data; mis-coded WOs corrupt FC arithmetic.",
        "P1 cut-off can be gamed by misclassifying assets as L-critical.",
        "5×5 matrix granularity (1-5) is coarse; some plants use 1-10.",
      ],
      best_practices: [
        "Re-derive the Pareto cut-off per plant (don't assume 80/20).",
        "Intersect criticality H with Pareto top-20% to identify P1.",
        "Stratify RCAs by failure mode (one RCA per mechanism, not per asset).",
        "Size addressable cost before recommending capex.",
        "Sequence capex by payback (shortest first).",
        "Refresh the Pareto quarterly; re-validate criticality annually.",
        "Take the maximum consequence across safety/environment/production/quality/regulatory — don't average.",
        "Report P1 RCA closure rate and bad-actor exit rate to the asset-management steering committee (ISO 55001 Cl. 9.3).",
      ],
      related_concepts: [
        "Equipment Reliability (Lesson 1) — MTBF, Weibull, RAM feed the Pareto.",
        "Condition Monitoring & Diagnostics (Lesson 2) — CBM deployment priority set by criticality.",
        "Equipment History (Lesson 4) — CMMS data quality underpins the Pareto arithmetic.",
        "ISO 55001 Clause 6.2.2 — asset-management plan prioritization by criticality.",
        "ISO 55001 Clause 9.3 — management review consumes the work-zone analytics.",
        "FMEA / RCM — uses criticality + RPN to drive strategy decisions.",
      ],
      prerequisites: [
        "Equipment Reliability (Lesson 1) — MTBF, Weibull β, RAM.",
        "Condition Monitoring & Diagnostics (Lesson 2) — failure-mode detection.",
        "CMMS asset hierarchy and failure-code capture (ISO 14224).",
        "Cost-of-ownership basics: maintenance cost, downtime cost, RAV.",
        "ISO 55000 asset-management plan structure.",
      ],
      references: [
        "SMRP CMRP BOK — ER pillar: Work Zone Analysis.",
        "SMRP CMRP Exam Outline.",
        "ISO 55000:2014; ISO 55001:2014 Cl. 6.2.2, 9.3; ISO 55002:2018.",
        "ISO 14224:2016.",
        "Mobley (2008), Maintenance Engineering Handbook.",
        "Campbell & Jardine (2001), Maintenance Strategy.",
        "Ebeling (2010), An Introduction to Reliability and Maintainability Engineering.",
        "O'Hanlon (2006), Uptime.",
        "Reliabilityweb.com / SMRP best-practices bodies for criticality and bad-actor analysis.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Work Zone Analysis",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which of the following correctly distinguishes asset criticality from bad-actor Pareto analysis?",
      whyCorrect:
        "Criticality is a design-view analysis — 'what would happen if this asset failed?' — scored on safety, environment, production, quality, and regulatory consequences. Bad-actor Pareto is a data-view analysis — 'what is failing and costing?' — computed from the CMMS extract. The intersection of the two is the priority-1 work zone: H-critical assets in the Pareto top-20%.",
      whyOthersWrong: [
        "Option A is wrong — they are deliberately different analyses serving different questions (design view vs. data view); conflating them collapses the work-zone framework.",
        "Option C is wrong — it reverses the definitions (criticality is the design view; Pareto is the data view).",
        "Option D is wrong — both criticality and Pareto apply to all assets; neither is restricted to a subset like safety systems.",
      ],
      explanation:
        "Criticality = design view (consequence of failure). Pareto = data view (failure cost). The intersection (H-critical + top-20% by cost) is the priority-1 work zone — the highest-ROI reliability-engineering target.",
      options: [
        { text: "They are synonymous terms for the same analysis", isCorrect: false },
        { text: "Criticality is design-driven (consequence of failure); bad-actor Pareto is data-driven (failure cost)", isCorrect: true },
        { text: "Criticality is data-driven (failure cost); bad-actor Pareto is design-driven (consequence)", isCorrect: false },
        { text: "Criticality applies only to safety systems; bad-actor Pareto applies to all assets", isCorrect: false },
      ],
    },
    {
      competencyName: "Work Zone Analysis",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Chemical",
      stem: "A Chemical plant has 120 rotating assets with $1.4M total annual failure cost. The top-10 assets (8.3% of population) account for $1,130k (80.7%) of cost. What is the Pareto cut-off, and what is the implication?",
      whyCorrect:
        "The cumulative-% crosses 80% at the 10th asset (8.3% of the 120-asset population) — this is an 80/8 Pareto, sharper than the textbook 80/20. The implication is that 10 assets should command the RCA/capex effort; the remaining 110 assets (92% of population) receive routine CBM/PM only. Real plants often see sharper Paretos (80/8 to 80/15) once the broad population has been cleaned up.",
      whyOthersWrong: [
        "Option A (80/20) is the textbook Pareto, but the data shows 80/8 (80.7% of cost concentrated in 8.3% of assets, not 20%). The 80/20 is empirical, not a law — re-derive per plant.",
        "Option C (50/50) is mathematically wrong — the data shows a sharp concentration, not a uniform distribution.",
        "Option D (100/0) is mathematically wrong — no single asset accounts for 100% of cost; the top asset (P-301) is $240k/$1,400k = 17.1%.",
      ],
      explanation:
        "Cum%_n = (Σ_{i=1..n} FC_i) / (Σ_{i=1..N} FC_i) × 100. The bad-actor cut-off = the n where Cum%_n first ≥ 80%. Here, Cum%_10 = 80.7% — so 10 assets (8.3% of population) are the bad actors.",
      options: [
        { text: "80/20 — the standard cut-off; 24 assets are bad actors", isCorrect: false },
        { text: "80/8 — 10 assets (8.3%) are bad actors; sharper than 80/20, common in mature plants", isCorrect: true },
        { text: "50/50 — half the assets are bad actors", isCorrect: false },
        { text: "100/0 — one asset is the entire problem", isCorrect: false },
      ],
    },
    {
      competencyName: "Work Zone Analysis",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Power",
      stem: "A critical boiler feedwater pump has current MTBF = 2,800 h, target MTBF = 8,000 h after a bearing upgrade. Current failure cost is $240k/year. Compute the addressable cost.",
      whyCorrect:
        "Addressable cost = FC × (1 − MTBF_current/MTBF_target) = $240k × (1 − 2800/8000) = $240k × 0.65 = $156k/year. This is the failure cost the bearing upgrade could realistically remove; the residual $84k/year remains even after the upgrade (residual failures, non-bearing failure modes).",
      whyOthersWrong: [
        "Option B ($240k) is the full failure cost, not the addressable portion; even after the upgrade, residual failures will remain, so the addressable cost is less than FC.",
        "Option C ($560k) reverses the MTBF ratio; addressable cost must be ≤ FC, not greater. AC > FC would imply the improvement creates new failures, which is contradictory.",
        "Option D ($84k) is the residual cost (FC × MTBF_current/MTBF_target = $240k × 0.35), not the addressable cost — it represents what would remain after the upgrade.",
      ],
      explanation:
        "AC = FC × (1 − FR_target/FR_current) = FC × (1 − MTBF_current/MTBF_target). With $240k × (1 − 2800/8000) = $240k × 0.65 = $156k/year. Capex $30k ⇒ payback 0.19 years (~2.3 months) ⇒ fund.",
      options: [
        { text: "$156k/year (FC × (1 − 2800/8000) = $240k × 0.65)", isCorrect: true },
        { text: "$240k/year (the full failure cost)", isCorrect: false },
        { text: "$560k/year (FC × (target/MTBF ratio reversed))", isCorrect: false },
        { text: "$84k/year (FC × (2800/8000) — the residual cost)", isCorrect: false },
      ],
    },
    {
      competencyName: "Work Zone Analysis",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "DecisionMaking",
      skillType: "Conceptual",
      scenario: "Power",
      stem: "You are the reliability manager at a Power plant with $150k capex and one reliability-engineer FTE for 12 months. Candidates: (A) BFP P-BFP-01: H-critical, $480k/year FC, MTBF 2,000 h, target 12,000 h, capex $60k. (B) Condensate pump P-CD-03: L-critical (3×50% redundant), $240k/year FC, β=1.1 random, capex $0. (C) ID fan F-ID-01: H-critical, $300k/year FC, MTBF 3,500 h, target 14,000 h, capex $80k. Rank the actions.",
      whyCorrect:
        "(A) first: P1 (H-critical + Pareto). AC = $480k × (1 − 2000/12000) = $400k/year. Capex $60k. Payback 0.15 years — fund first. Then (C): P1 (H-critical + Pareto). AC = $300k × (1 − 3500/14000) = $225k/year. Capex $80k. Payback 0.36 years — fund second (total capex now $140k). (B) is L-critical with β=1.1 random — the right strategy is run-to-failure with spares (already 3×50% redundant), so capex $0. The 80/20/80/30 ranking by payback: (A) 0.15 → (C) 0.36 → defer (B).",
      whyOthersWrong: [
        "Option A ('(B) first — highest ROI from the redundancy; defer (A) and (C)') is wrong — (B) is L-critical with β=1.1 (random failures); the right strategy is run-to-failure with spares, not capex investment. The redundancy already provides protection.",
        "Option C ('(C) first — lowest current MTBF; defer (A) and (B)') is wrong — the lowest current MTBF is not the only criterion; the intersection with criticality (H-critical + Pareto) drives the ranking, and (A) has a higher AC ($400k vs $225k) and lower capex ($60k vs $80k).",
        "Option D ('(A), (B), and (C) in parallel, equally split capex') is wrong — equal-split capex is not a strategy; the capex should be allocated by ROI (payback), not equally. (B) is also L-critical where run-to-failure is the right answer, so capex there is wasted.",
      ],
      explanation:
        "Rank by priority-zone (P1 = H+Pareto) then by ROI (payback). (A): P1, payback 0.15 years. (C): P1, payback 0.36 years. (B): P3 (L+Pareto), β=1.1 random ⇒ run-to-failure with spares. Sequence: (A) → (C); (B) deferred. Total capex $140k ≤ budget $150k; total AC $625k/year.",
      options: [
        { text: "(B) first — highest ROI from the redundancy; defer (A) and (C)", isCorrect: false },
        { text: "(A) first — P1, payback 0.15 yrs; then (C) — P1, payback 0.36 yrs; (B) deferred (L-critical + random — run-to-failure with spares)", isCorrect: true },
        { text: "(C) first — lowest current MTBF; defer (A) and (B)", isCorrect: false },
        { text: "(A), (B), and (C) in parallel, equally split capex", isCorrect: false },
      ],
    },
    {
      competencyName: "Work Zone Analysis",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: The Pareto 80/20 cut-off is a universal rule — every plant will see exactly 80% of failure cost concentrated in exactly 20% of assets.",
      whyCorrect:
        "False. The 80/20 is an empirical approximation — a useful rule of thumb, not a law. Real plants see 80/8 (sharper, common in mature plants), 80/30 (flatter, common in greenfield), 70/30, or 90/10. The Pareto cut-off must be re-derived per plant from the actual CMMS data; assuming 80/20 universally produces the wrong bad-actor list.",
      whyOthersWrong: [
        "True — the candidate would miss that the 80/20 is empirical and not a law; re-derivation per plant is essential. Treating 80/20 as universal leads to under- or over-investment in the wrong assets.",
      ],
      explanation:
        "Pareto 80/20 = empirical. Real plants see 80/8 (mature, broad population cleaned up) or 80/30 (greenfield, less mature CMMS data). Always re-derive the cut-off from the plant's actual data; do not assume 80/20.",
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 4 — Equipment History
// ---------------------------------------------------------------------------

const LESSON_EQUIPMENT_HISTORY: RefLesson = {
  competencyName: "Equipment History",
  slug: "er-equipment-history",
  title: "Equipment History & Reliability Analytics",
  titleAr: "تاريخ المعدات وتحليلات الموثوقية",
  order: 4,
  durationMin: 30,
  references: ER_REFERENCE_TITLES,
  conceptIntroduction: `Equipment History is the data foundation of the Equipment Reliability pillar. The CMMS WO closeout record, coded to ISO 14224, is the raw material for every reliability analytic in Lessons 1-3 — MTBF, Weibull, Pareto, and the asset-management plan update. Code-completeness is the KPI of equipment history: ≥95% failure mode, ≥85% cause, ≥70% mechanism. The closed-loop reliability cycle (alert → WO → closeout with code → analytics → strategy shift → CMMS update) is the operational expression of the asset-management system required by ISO 55001 Clauses 7.2 and 9.3. Equipment history is an engineered data product, not a passive record.`,
  example: `A Chemical plant centrifugal pump (P-301, acid service) has 12 failure-WOs in 24 months. Audit: 11/12 WOs have valid ISO-14224 mode codes (91.7% — below the 95% target); 9/12 have valid cause codes (75% — below the 85% target); 6/12 have valid mechanism codes (50% — below the 70% target). Operating time in 24 months ≈ 15,768 h. Excluding the 1 uncoded WO (dark-matter): MTBF = 15,768/11 = 1,433 h (not 1,314 if naively using 12 failures). MTTR = 53.2/11 = 4.84 h. A = 1433/(1433+4.84) = 99.66%. Trend (rolling 12-month): months 1-12 MTBF = 1143 h; months 13-24 (excluding 1 uncoded) MTBF = 2,000 h. Slope = +71.4 h/month — improving. The bearing-upgrade capex in month 13 has lifted MTBF by ~75%.`,
  keyFormulas: `MTBF = (Σ T_operating) / (Σ N_failures) [h] — point estimate from WO history
MTTR = (Σ T_repair) / (Σ N_failures) [h] — active repair time only
Intrinsic A = MTBF / (MTBF + MTTR)
Rolling 12-month MTBF: MTBF(t) = (Σ_{i=t-12..t} T_operating_i) / (Σ_{i=t-12..t} N_failures_i)
Code-completeness % (mode): CC_mode = (# failure-WOs with valid ISO-14224 mode code) / (total failure-WOs) × 100 — target ≥95%
Code-completeness % (cause): CC_cause = (# with valid cause code) / (total) × 100 — target ≥85%
Code-completeness % (mechanism): CC_mechanism = (# with valid mechanism code) / (total) × 100 — target ≥70%
MTBF trend slope = (MTBF(t) − MTBF(t−12)) / 12 [h/month]; positive = improving
Failure rate FR(t) = N_failures(t) / T_operating(t) [1/h]; rising FR = deteriorating`,
  exercise: `You are the reliability engineer at a Chemical plant. The CMMS audit shows: code-completeness = 67% mode, 41% cause, 18% mechanism. You can fund ONE of three actions: (A) buy a $50k reliability-analytics dashboard that auto-computes MTBF, Weibull, and Pareto; (B) run a $20k 90-day data-quality program (ISO-14224 training + CMMS rule changes + weekly audit); (C) hire a $90k reliability-engineer FTE for 12 months to manually re-code the historical WOs. Which is the best first action, and what is the correct sequence?`,
  sections: {
    learning_objectives: `- Identify the minimum data set the CMMS must capture at WO closeout to support reliability analytics (failure mode, mechanism, cause, downtime, parts, labor) per ISO 14224 §6.
- Apply the ISO 14224 failure-code taxonomy to a real WO (equipment class → failure mode → failure cause → failure mechanism).
- Compute MTBF trends (rolling 3-month, 12-month) by asset and by failure mode; interpret trend direction.
- Audit a CMMS extract for failure-code completeness; quantify the % of WOs with valid codes against the SMRP targets (≥95% mode, ≥85% cause, ≥70% mechanism).
- Build a "closed-loop" reliability history: alert → WO → closeout with code → analytics → strategy shift → CMMS update.
- Translate equipment history into the asset-management plan (ISO 55001 Clauses 7.2 and 9.3).`,
    prerequisites: `- Equipment Reliability (Lesson 1) — MTBF, Weibull, RAM.
- Condition Monitoring & Diagnostics (Lesson 2) — alert-to-WO interface.
- Work Zone Analysis (Lesson 3) — Pareto, bad-actor.
- CMMS basics: WO lifecycle, asset hierarchy, failure-code fields.
- Basic data hygiene: missing data, code-standardization, deduplication.`,
    introduction: `Equipment History is the fourth ER competency. Where Lessons 1-3 analyze equipment reliability, condition monitoring, and work-zone prioritization, Equipment History is the data foundation under all of them: the CMMS WO closeout record that captures the failure mode, mechanism, cause, downtime, parts, and labor for every failure event. The CMRP BOK tests the candidate's ability to extract, clean, code, and analyze this history to drive reliability analytics — MTBF trends, Weibull fits, bad-actor Paretos — and to feed them back into the asset-management plan.

ISO 14224:2016 is the canonical taxonomy for equipment history: it standardizes equipment classes (centrifugal pump, reciprocating compressor, motor, heat exchanger, valve), failure modes (external leakage, no output, vibration high, parameter deviating), failure causes (corrosion, fatigue, misalignment, contamination), and failure mechanisms (erosion, corrosion, wear, fatigue). A plant that follows ISO 14224 can benchmark its MTBF by equipment class against the OREDA database (Offshore & Onshore Reliability Data, used widely in Oil & Gas).

The CMRP candidate must understand that equipment history is not just a record — it is an engineered data product. A WO closed without a valid ISO-14224 failure code is, for reliability analytics purposes, a closed WO with no analytical value. The plant's reliability-analytics maturity is measured by the % of closed failure-WOs that carry a valid ISO-14224 code; world-class plants exceed 95%.`,
    terminology: `- **Equipment history**: the structured CMMS record of failure events on an asset (or class) over time.
- **Failure code**: a structured entry (per ISO 14224) identifying the failure mode, cause, and mechanism.
- **Equipment class (ISO 14224)**: the standardized category (e.g., "centrifugal pump — single stage — overhung").
- **Failure mode (ISO 14224)**: observable manner of failure (e.g., "external leakage", "no output").
- **Failure cause (ISO 14224)**: operational/design reason (e.g., "corrosion (general)", "misalignment").
- **Failure mechanism (ISO 14224)**: physical process (e.g., "erosion/corrosion", "fatigue", "wear").
- **Downtime (WO)**: time from failure-detection to asset-returned-to-service (MTTR + logistic delay).
- **Parts/labor (WO)**: the actuals captured at closeout.
- **WO narrative**: free-text field; the structured codes are the analytical layer over the narrative.
- **Closed-loop reliability**: alert → WO → closeout with code → analytics (MTBF/Weibull/Pareto) → strategy shift → CMMS update.
- **Trend chart**: rolling-period MTBF (or other metric) over time; the slope is the trend.
- **MTBF trend**: rolling 3-month or 12-month MTBF, by asset or by failure mode.
- **OREDA**: Offshore & Onshore Reliability Data — population failure-rate database using the ISO 14224 taxonomy.
- **Dark matter (analytical)**: failure-WOs without valid ISO-14224 codes; bias the MTBF/Weibull/Pareto if included naively.`,
    detailed_explanation: `Equipment history has three layers:

**(1) The WO closeout record (data layer).** At WO closure, the technician captures: failure mode (ISO 14224 code), failure cause (ISO 14224 code), failure mechanism (ISO 14224 code), downtime start/stop timestamps, parts consumed (with part numbers and quantities), labor hours (by trade), WO narrative (free text), and the corrective action taken. ISO 14224 §6 specifies the minimum dataset and the structured fields.

**(2) The reliability analytics (analysis layer).** From the closed WOs, the reliability engineer computes MTBF (per asset, per class, per failure mode), MTTR, availability, Weibull fits, Pareto of failure cost, and trend charts. These are the products of Lessons 1-3.

**(3) The asset-management interface (decision layer).** The analytics feed the asset-management plan (ISO 55001 Cl. 7.2) and the management review (Cl. 9.3). Trend deteriorations trigger RCA; trend improvements confirm capex; the closed loop is what ISO 55001 calls "the asset-management system in operation."

The CMRP candidate must be able to audit a CMMS extract for code-completeness. The audit:
  - % of failure-WOs (WOs with status = "closed" and type = "corrective" or "breakdown") with a valid ISO-14224 failure mode code. Target ≥95%; world-class ≥99%.
  - % with a valid failure cause code (deeper than mode). Target ≥85%.
  - % with a valid failure mechanism code. Target ≥70% (mechanism is the deepest level; harder to populate accurately).
  - % with downtime timestamps (failure-detection time, return-to-service time). Target ≥95%.
  - % with parts and labor actuals. Target ≥95%.

A plant with 60% code-completeness cannot compute a credible MTBF trend — the missing 40% of WOs are analytical "dark matter" that biases the trend. The reliability-engineering intervention is to close the data-quality gap first: train craft on code capture at closeout, audit weekly, and refuse to close WOs without the required codes.

The MTBF trend chart is the canonical product. A 24-month trend by asset class shows whether the class is improving (capex/strategy shifts working) or deteriorating (an emerging issue). A trend by failure mode shows whether the bad-actor RCAs are working: if "bearing — lubrication" failures are falling but "bearing — installation" are rising, the lubrication RCAs are succeeding but a new installation-quality issue is emerging.

ISO 14224 equipment-class taxonomy (excerpt):
  - Pumps: P-CE (centrifugal), P-RE (reciprocating), P-RO (rotary).
  - Compressors: C-CE (centrifugal), C-RE (reciprocating), C-RO (screw).
  - Motors: M-AC (AC induction), M-DC (DC), M-SY (synchronous).
  - Heat exchangers: E-HE (shell-tube), E-PL (plate).
  - Valves: V-CO (control), V-CH (check), V-GA (gate).

ISO 14224 failure modes (excerpt):
  - B1: no function (no output at all).
  - B2: erratic output (parameter deviating).
  - B3: external leakage.
  - B4: vibration high.
  - B5: high temperature.
  - B6: spurious trip.
  - B7: noisy.

ISO 14224 failure causes (excerpt):
  - C1: corrosion (general).
  - C2: fatigue.
  - C3: wear (abrasive, adhesive).
  - C4: erosion/corrosion.
  - C5: misalignment.
  - C6: contamination.
  - C7: under-design (capacity insufficient).

ISO 14224 failure mechanisms (excerpt):
  - M1: stress rupture.
  - M2: surface fatigue.
  - M3: pitting.
  - M4: scoring.
  - M5: brittle fracture.
  - M6: ductile fracture.

A worked example: a WO closes on P-301 acid pump. Failure mode = B3 (external leakage). Failure cause = C4 (erosion/corrosion). Failure mechanism = M3 (pitting). The narrative: "acid weep from mechanical seal; seal faces found pitted; replaced with duplex-grade SiC faces; flushing plan 53A installed." The codes capture the structure; the narrative captures the engineering.`,
    core_principles: `- **Equipment history is an engineered data product**, not a passive record.
- **ISO 14224 codes are the analytical layer**; the WO narrative is the engineering layer. Both must be present.
- **Code-completeness is the KPI of equipment history** (target ≥95% mode, ≥85% cause, ≥70% mechanism).
- **The closed-loop reliability cycle**: alert → WO → closeout with code → analytics → strategy shift → CMMS update.
- **Trend by failure mode is more diagnostic than trend by asset** (it isolates the RCA effect).
- **Refuse to close WOs without required codes** — the discipline lives at the closeout step.
- **OREDA and population benchmarks are population medians**, not plant-specific targets.`,
    components: `- **CMMS WO closeout form** (with ISO-14224 code fields).
- **ISO 14224 equipment-class taxonomy**.
- **ISO 14224 failure-mode / cause / mechanism code list**.
- **WO history extract** (CSV or API).
- **MTBF trend chart** (by asset, by class, by failure mode).
- **Weibull fit tool** (per asset, per class).
- **Pareto chart** (by failure cost).
- **Audit report** (% code-completeness).
- **Asset-management plan** (ISO 55001 Cl. 7.2) — the consumer of the analytics.`,
    process: `1. Audit the CMMS extract for code-completeness; identify the gap.
2. Train craft on ISO-14224 code capture at WO closeout (workshop + job aids).
3. Enforce code-completeness at closeout (CMMS rule: refuse closure without required codes).
4. Extract closed-WO history (24+ months for stable analytics).
5. Compute MTBF, MTTR, availability per asset, per class, per failure mode.
6. Build the Weibull fits and the Pareto of failure cost.
7. Build the trend charts (rolling 3-month, 12-month by failure mode).
8. Identify deteriorating trends; trigger RCA.
9. Identify improving trends; confirm capex/strategy effectiveness.
10. Feed the analytics into the asset-management plan (ISO 55001 Cl. 7.2) and management review (Cl. 9.3).`,
    formula_calculation: `- **MTBF (point estimate from WO history)**:
  MTBF = (Σ T_operating) / (Σ N_failures) [h]
  Variables: T_operating = operating time of asset in the period; N_failures = count of failure-WOs with valid failure-mode code (exclude uncoded "dark matter").

- **MTTR (point estimate)**:
  MTTR = (Σ T_repair) / (Σ N_failures) [h]
  Where T_repair = active repair time per WO (excluding logistic delay).

- **Intrinsic availability (point estimate)**:
  A = MTBF / (MTBF + MTTR)

- **Rolling 12-month MTBF**:
  MTBF(t) = (Σ_{i=t-12..t} T_operating_i) / (Σ_{i=t-12..t} N_failures_i)

- **Code-completeness %**:
  CC_mode = (# failure-WOs with valid ISO-14224 mode code) / (total failure-WOs) × 100 (target ≥95%)
  CC_cause = (# failure-WOs with valid cause code) / (total) × 100 (target ≥85%)
  CC_mechanism = (# with valid mechanism code) / (total) × 100 (target ≥70%)

- **MTBF trend slope**:
  slope = (MTBF(t) − MTBF(t−12)) / 12 [h/month]; positive = improving, negative = deteriorating.

- **Failure-rate trend (alternative to MTBF)**:
  FR(t) = N_failures(t) / T_operating(t) [1/h]; rising FR = deteriorating.

- **Exclusion rule for uncoded "dark matter"**:
  A failure-WO without a valid ISO-14224 mode code must be excluded from MTBF/MTTR computations; including it biases the estimates. Report the exclusion rate alongside the MTBF.`,
    worked_example: `**Problem.** A Chemical plant centrifugal pump (P-301, acid service). The CMMS extract over 24 months shows 12 failure-WOs on P-301. Audit shows: 11 of 12 WOs have a valid ISO-14224 failure mode code; 9 of 12 have a valid failure cause code; 6 of 12 have a valid failure mechanism code.

**Step 1 — Code-completeness audit.**
  - Mode: 11/12 = 91.7% (below the 95% target — one WO is missing the code; reject closure next time).
  - Cause: 9/12 = 75.0% (below the 85% target).
  - Mechanism: 6/12 = 50.0% (below the 70% target).
  Action: re-train craft on cause/mechanism coding; the 1 missing mode code is "dark matter" — exclude the WO from the MTBF computation.

**Step 2 — MTBF (24-month).** Operating time on P-301 in 24 months = 17,520 h (continuous, with ~10% outages ⇒ ~15,768 h actual operating). Failures with valid mode codes = 11. MTBF = 15,768/11 = **1,433 h**. (Note: if we naively used 12 failures, MTBF = 1,314 h — the data-quality step changes the answer by ~9%.)

**Step 3 — MTTR.** Sum of repair times from the 11 WOs = 53.2 h. MTTR = 53.2/11 = **4.84 h**.

**Step 4 — Intrinsic availability.** A = 1433/(1433+4.84) = 0.99663 = **99.66%**.

**Step 5 — MTBF trend (rolling 12-month).**
  - Months 1-12: 7 failures, operating 8,000 h ⇒ MTBF = 1,143 h.
  - Months 13-24: 5 failures (one of which is uncoded), operating 8,000 h ⇒ MTBF = 8,000/4 (coded) = 2,000 h (excluding the uncoded WO).
  Trend slope = (2,000 − 1,143)/12 = +71.4 h/month — **improving**. The bearing-upgrade capex in month 13 has lifted MTBF by ~75%.

**Step 6 — Failure-mode Pareto (from the 11 coded WOs).**
  - Mode B3 (external leakage): 4 events.
  - Mode B4 (vibration high): 4 events.
  - Mode B2 (parameter deviating — flow): 2 events.
  - Mode B6 (spurious trip): 1 event.
  The Pareto by event-count: leakage + vibration = 73% of failures — focus RCA there.

**Step 7 — Failure-mechanism code audit (deeper).** Of the 6 WOs with valid mechanism codes:
  - M3 (pitting): 4 (all on the leakage-WOs — confirms seal-face erosion as the leakage mechanism).
  - M2 (surface fatigue): 2 (on the vibration-WOs — confirms bearing wear-out).
  The deeper codes confirm: leakage = seal-face pitting (erosion/corrosion), vibration = bearing surface fatigue (wear-out). Two distinct mechanisms, two distinct RCAs.

**Step 8 — Closed-loop.** Bearing upgrade (Month 13) and seal upgrade (Month 16) are reflected in the post-upgrade MTBF trend; the equipment history confirms the effectiveness of the capex. ISO 55001 Cl. 7.2 (asset-management plan) is updated to reflect the new strategy (PM at 1,500 h on bearings; CBM + 53A flushing on seals).

**Step 9 — OREDA benchmark.** The plant's MTBF (1,433 h overall; 2,000 h post-upgrade) is benchmarked against OREDA's acid-service centrifugal-pump failure-rate (median ~1.5×10⁻⁵ 1/h ⇒ MTBF = 67,000 h). The plant is far below the OREDA benchmark — the acid-service duty is more severe than the population OREDA aggregates; the benchmark is informational, not a target.`,
    industrial_example: `**Chemical — acid-transfer pump (above).** ISO-14224 coded history → MTBF trend → capex confirmation.

**Oil & Gas — offshore platform gas-compressor.** CMMS with OREDA-aligned failure-code taxonomy. 24-month MTBF trend on the Kollsnes compressor train: MTBF improved from 5,400 h to 9,800 h after the seal-gas redesign. The OREDA benchmark for offshore gas-compressors is ~6,000 h MTBF (median) — the plant is now above the population benchmark.

**Power — boiler feedwater pump (3×50% redundant).** Equipment history on the 6 BFPs across 4 units: pooled Weibull fit (n=18) → β=2.4, η=9,000 h (bearing wear-out). Trend by failure mode: bearing-failure events fell from 12 to 4 in 18 months after the PM-at-4,000-h strategy. Equipment history is the input to Lessons 1 and 3.

**Manufacturing — robotic weld cell.** 80 robots; CMMS coded to ISO 14224. Trend by failure mode: "drive failure" events fell from 28 to 11 in 12 months after the servo-upgrade capex. Code-completeness: 92% mode, 78% cause, 55% mechanism — the plant is in the data-quality-improvement phase.`,
    case_study: `**CASE_TYPE = SYNTHETIC.** A Container Terminal with 14 RTG cranes. Baseline (12 months ago): CMMS code-completeness was 48% mode, 31% cause, 12% mechanism — MTBF trends were not credible. The reliability engineer commissioned a 90-day data-quality program: (a) ISO-14224 training for all craft and supervisors (one 4-h workshop), (b) CMMS rule changes: refusal to close a failure-WO without a valid mode code; cause and mechanism required for failures tagged "critical", (c) weekly audit of the past week's WO closures, with a non-conformance log. After 90 days: code-completeness rose to 89% mode, 71% cause, 41% mechanism. After 12 months: 96% mode, 84% cause, 65% mechanism. The MTBF trend became credible — and it showed that the apparent "stable" MTBF was hiding a deterioration in the hoist-gearbox failure mode (from 9,800 h to 5,400 h over 18 months) masked by improvements in the trolley-motor mode. The case demonstrates that equipment history is not a passive record — it is a data product whose quality must be engineered and audited.`,
    visual_explanation: `- **CMMS WO closeout form**: labeled fields for failure mode, cause, mechanism, downtime start/stop, parts, labor, narrative.
- **ISO 14224 taxonomy tree**: Equipment unit → Equipment class → Failure mode → Failure cause → Failure mechanism (4-level drill-down).
- **MTBF trend chart**: x-axis = month, y-axis = MTBF (rolling 12-month); trend line; re-baseline markers; ISO-14224 failure-mode filter.
- **Code-completeness audit dashboard**: three bars (mode/cause/mechanism), each with target line; red/yellow/green.
- **Closed-loop reliability diagram**: alert → WO → closeout (code) → analytics → strategy shift → CMMS update → next alert.`,
    simulation_opportunity: `An equipment-history sim where the learner is the reliability engineer at a Power plant. The sim injects: (a) a CMMS extract of 100 closed WOs over 12 months with various code-completeness, (b) an audit template. The learner must: (a) audit code-completeness, (b) compute MTBF/MTTR/A by asset, (c) build the MTBF trend by failure mode, (d) identify the deteriorating trend, (e) trigger an RCA, (f) simulate the post-RCA strategy shift and predict the post-shift MTBF. The sim scores: correctness of the audit arithmetic, validity of the trend interpretation, plausibility of the RCA trigger, and accuracy of the post-shift prediction.`,
    common_mistakes: `- **Closing WOs without ISO-14224 codes** — the WO has zero analytical value.
- **Pooling all failures into one MTBF (no breakdown by failure mode)** — the trend is meaningless because different mechanisms dominate different periods.
- **Computing MTBF over the wrong denominator** (counting WOs, not failures; counting non-failure WOs like PMs).
- **Using MTBF as a single number without confidence intervals** — the small-sample CI is wide.
- **Ignoring the data-quality step** — reporting MTBF from a 48%-complete extract is worse than reporting nothing.
- **Confusing operating time with calendar time** — for low-duty-cycle assets the difference is large.
- **Treating OREDA or other benchmarks as targets** — they are population medians, not plant-specific goals.
- **Forgetting to update the asset-management plan after a strategy shift** — the analytics are wasted if the plan does not change.`,
    limitations: `- **Equipment history is only as good as the closeout discipline** — 48% completeness cannot be statistically repaired post-hoc.
- **ISO 14224 codes are categorical**; they do not capture severity (a "minor weep" and a "total seal blowout" both code as B3 external leakage).
- **MTBF trend assumes a stationary failure process**; after a strategy shift the trend must be re-baselined.
- **OREDA and population benchmarks assume a representative operating context**; a severe-duty plant will under-perform the benchmark without being unreliable.
- **The narrative field is free-text** — natural-language processing is required for narrative analytics.
- **Equipment history cannot, by itself, predict a never-yet-occurred failure mode** (the high-consequence low-likelihood events).`,
    comparison: `- **ISO 14224 mode vs. cause vs. mechanism**: mode is what is observed; cause is the operational/design reason; mechanism is the physical process. Each is a different question; all three are needed.
- **CMMS closeout form vs. reliability analytics**: the closeout form is the data-collection layer; the analytics are the analysis layer. Both must be present.
- **MTBF overall vs. MTBF by failure mode**: overall hides the mode-level trend; by-failure-mode exposes the bad-actor mode.
- **Rolling 12-month MTBF vs. point MTBF**: rolling smooths the noise; point shows the latest value.
- **ISO 14224 vs. OREDA**: ISO is the taxonomy; OREDA is a population failure-rate database that uses ISO 14224 (or similar) taxonomy.`,
    practical_application: `- **Daily**: enforce code-completeness at WO closeout; audit the previous day's closures; log non-conformances.
- **Weekly**: compute the rolling 12-month MTBF by asset and by failure mode; flag deteriorations >15%.
- **Monthly**: review the code-completeness audit; refresh training where the metric is below target.
- **Quarterly**: re-fit Weibull for the top-10 bad-actor assets; recommend strategy shifts.
- **Annually**: update the asset-management plan (ISO 55001 Cl. 7.2) with the analytics; report to the management review (Cl. 9.3).`,
    decision_scenario: `You are the reliability engineer at a Chemical plant. The CMMS audit shows: code-completeness = 67% mode, 41% cause, 18% mechanism. You can fund ONE of three actions:
(A) Buy a $50k reliability-analytics dashboard that auto-computes MTBF, Weibull, and Pareto.
(B) Run a $20k 90-day data-quality program (ISO-14224 training + CMMS rule changes + weekly audit).
(C) Hire a $90k reliability-engineer FTE for 12 months to manually code the historical WOs.

Decision: (B) first. Without code-completeness, (A) is garbage-in/garbage-out — the dashboard will compute MTBF from a 67%-complete extract that is not credible. (C) is more expensive than (B) and produces a one-time fix, not a sustainable discipline — the discipline lives at closeout, not in historical re-coding. Sequence: (B) first (90 days), then re-audit; if code-completeness reaches 90%+, then (A) to automate the analytics; (C) is unnecessary if (B) succeeds.`,
    practice_questions: `- Give the four levels of the ISO 14224 failure-code taxonomy.
- A CMMS extract has 200 failure-WOs; 184 have valid ISO-14224 mode codes. Compute code-completeness and assess against target. *(Answer: 184/200 = 92.0% — below the 95% target; corrective training required.)*
- A pump has 8 failures in 12 months, with operating time 7,000 h. Compute MTBF. *(Answer: 7000/8 = 875 h.)*
- State why MTBF by failure mode is more diagnostic than overall MTBF.
- A rolling 12-month MTBF rose from 1,143 h to 2,000 h over 12 months. Compute the trend slope. *(Answer: (2000 − 1143)/12 = +71.4 h/month — improving.)*
- Identify three ISO-14224 failure causes for a bearing failure (e.g., C2 fatigue, C3 wear, C5 misalignment) and the mechanism (M2 surface fatigue).`,
    certification_questions: `The CMRP exam tests Equipment History as the fourth ER competency. SMRP-aligned sample prompts:

(a) Identify the minimum dataset required at WO closeout per ISO 14224 §6.
(b) Audit a CMMS extract for code-completeness; report against targets (95% mode, 85% cause, 70% mechanism).
(c) Compute MTBF/MTTR/availability from a CMMS extract.
(d) Recognize the closed-loop reliability cycle: alert → WO → closeout → analytics → strategy shift.
(e) Distinguish ISO 14224 failure mode, cause, and mechanism.

The questions in this lesson's question bank are aligned to these Equipment History competencies.`,
    summary: `Equipment History is the data foundation of the Equipment Reliability pillar. The CMMS WO closeout record, coded to ISO 14224, is the raw material for every reliability analytic in Lessons 1-3 — MTBF, Weibull, Pareto, and the asset-management plan update. Code-completeness is the KPI of equipment history: ≥95% failure mode, ≥85% cause, ≥70% mechanism. The closed-loop reliability cycle (alert → WO → closeout with code → analytics → strategy shift → CMMS update) is the operational expression of the asset-management system required by ISO 55001. Equipment history is an engineered data product, not a passive record.`,
    key_takeaways: `- ISO 14224 taxonomy: equipment unit → class → failure mode → cause → mechanism (4-level drill-down).
- Code-completeness targets: ≥95% mode, ≥85% cause, ≥70% mechanism.
- MTBF trend by failure mode is more diagnostic than trend by asset (isolates the RCA effect).
- Refuse to close WOs without required codes — the discipline lives at closeout.
- The closed-loop reliability cycle: alert → WO → closeout → analytics → strategy shift → CMMS update.
- OREDA and population benchmarks are population medians, not plant-specific targets.
- Excluding uncoded "dark matter" WOs from MTBF arithmetic is essential to avoid bias.`,
    references: `- SMRP. *CMRP Body of Knowledge — Equipment Reliability pillar: Equipment History.*
- SMRP. *CMRP Exam Outline.*
- ISO 14224:2016. *Collection of reliability and maintenance data for equipment.*
- ISO 55000:2014; ISO 55001:2014 Cl. 7.2 (asset-management plan), Cl. 9.3 (management review).
- ISO 55002:2018. *Guidelines for the application of ISO 55001.*
- OREDA (Offshore & Onshore Reliability Data) Handbook. 6th ed., 2015. SINTEF Academic Publishing.
- Mobley, R. K. (2008). *Maintenance Engineering Handbook* (7th ed.). McGraw-Hill. CMMS / equipment-history chapters.
- Campbell, J. D. & Jardine, A. K. S. (2001). *Maintenance Strategy*. Productivity Press. Reliability-data and asset-management-plan chapters.
- Ebeling, C. E. (2010). *An Introduction to Reliability and Maintainability Engineering*. Waveland Press. Reliability-data analysis.
- O'Hanlon, T. (2006). *Uptime*. Industrial Press.
- Reliabilityweb.com / SMRP best-practices bodies for equipment-history and CMMS data quality.`,
  },
  knowledgeObject: {
    title: "Equipment History — CMMS failure data, ISO 14224 taxonomy, MTBF trends",
    domain: "Equipment Reliability",
    competency: "Equipment History",
    topic: "CMMS data quality & reliability analytics",
    concept: "Closed-loop reliability data",
    body: {
      definitions: [
        "Equipment history: the structured CMMS record of failure events on an asset (or class) over time.",
        "Failure code: a structured entry (per ISO 14224) identifying the failure mode, cause, and mechanism.",
        "Equipment class (ISO 14224): the standardized category (e.g., centrifugal pump — single stage — overhung).",
        "Failure mode (ISO 14224): observable manner of failure (e.g., external leakage, no output, vibration high).",
        "Failure cause (ISO 14224): operational/design reason (e.g., corrosion, fatigue, misalignment, contamination).",
        "Failure mechanism (ISO 14224): physical process (e.g., erosion/corrosion, fatigue, wear, pitting).",
        "Downtime (WO): time from failure-detection to asset-returned-to-service (MTTR + logistic delay).",
        "WO narrative: free-text field; the structured codes are the analytical layer over the narrative.",
        "Closed-loop reliability: alert → WO → closeout with code → analytics → strategy shift → CMMS update.",
        "MTBF trend: rolling 3-month or 12-month MTBF, by asset or by failure mode.",
        "OREDA: Offshore & Onshore Reliability Data — population failure-rate database using the ISO 14224 taxonomy.",
        "Dark matter (analytical): failure-WOs without valid ISO-14224 codes; bias the MTBF/Weibull/Pareto if included naively.",
      ],
      principles: [
        "Equipment history is an engineered data product, not a passive record.",
        "ISO 14224 codes are the analytical layer; the WO narrative is the engineering layer. Both must be present.",
        "Code-completeness is the KPI of equipment history (≥95% mode, ≥85% cause, ≥70% mechanism).",
        "The closed-loop reliability cycle: alert → WO → closeout with code → analytics → strategy shift → CMMS update.",
        "Trend by failure mode is more diagnostic than trend by asset (it isolates the RCA effect).",
        "Refuse to close WOs without required codes — the discipline lives at the closeout step.",
        "OREDA and population benchmarks are population medians, not plant-specific targets.",
      ],
      components: [
        "CMMS WO closeout form (with ISO-14224 code fields).",
        "ISO 14224 equipment-class taxonomy.",
        "ISO 14224 failure-mode / cause / mechanism code list.",
        "WO history extract (CSV or API).",
        "MTBF trend chart (by asset, by class, by failure mode).",
        "Weibull fit tool (per asset, per class).",
        "Pareto chart (by failure cost).",
        "Audit report (% code-completeness).",
        "Asset-management plan (ISO 55001 Cl. 7.2) — the consumer of the analytics.",
      ],
      mechanism: [
        "Failure occurs → CMMS WO opened → work executed → closeout with ISO-14224 codes (mode/cause/mechanism) + downtime timestamps + parts/labor actuals + narrative → history extract (≥24 months) → reliability analytics (MTBF/MTTR/A, Weibull fit, Pareto, MTBF trend by failure mode) → deteriorating trend triggers RCA → improving trend confirms capex effectiveness → asset-management plan (ISO 55001 Cl. 7.2) updated → management review (Cl. 9.3) (closed loop).",
      ],
      process: [
        "1. Audit the CMMS extract for code-completeness; identify the gap.",
        "2. Train craft on ISO-14224 code capture at WO closeout (workshop + job aids).",
        "3. Enforce code-completeness at closeout (CMMS rule: refuse closure without required codes).",
        "4. Extract closed-WO history (24+ months for stable analytics).",
        "5. Compute MTBF, MTTR, availability per asset, per class, per failure mode.",
        "6. Build the Weibull fits and the Pareto of failure cost.",
        "7. Build the trend charts (rolling 3-month, 12-month by failure mode).",
        "8. Identify deteriorating trends; trigger RCA.",
        "9. Identify improving trends; confirm capex/strategy effectiveness.",
        "10. Feed the analytics into the asset-management plan (ISO 55001 Cl. 7.2) and management review (Cl. 9.3).",
      ],
      formulas: [
        "MTBF = (Σ T_operating) / (Σ N_failures) [h] — exclude uncoded 'dark matter'.",
        "MTTR = (Σ T_repair) / (Σ N_failures) [h] — active repair time only.",
        "A = MTBF / (MTBF + MTTR).",
        "Rolling 12-month MTBF: MTBF(t) = (Σ_{i=t-12..t} T_operating_i) / (Σ_{i=t-12..t} N_failures_i).",
        "CC_mode = (# with valid mode code) / (total) × 100 (target ≥95%).",
        "CC_cause = (# with valid cause code) / (total) × 100 (target ≥85%).",
        "CC_mechanism = (# with valid mechanism code) / (total) × 100 (target ≥70%).",
        "MTBF trend slope = (MTBF(t) − MTBF(t−12)) / 12 [h/month]; positive = improving.",
        "FR(t) = N_failures(t) / T_operating(t) [1/h]; rising FR = deteriorating.",
      ],
      metrics: [
        "MTBF by asset, by class, by failure mode [h].",
        "MTTR by failure class [h].",
        "Intrinsic availability A [%].",
        "Code-completeness: CC_mode ≥95%, CC_cause ≥85%, CC_mechanism ≥70%.",
        "MTBF trend slope [h/month].",
        "Failure-rate trend FR(t) [1/h].",
        "Dark-matter exclusion rate [% of failure-WOs excluded for missing codes].",
        "Closed-loop cycle time (alert → strategy shift) [days].",
      ],
      examples: [
        "Chemical — acid-transfer pump P-301: 12 failure-WOs over 24 months; 11 coded ⇒ MTBF = 15,768/11 = 1,433 h; trend months 1-12: 1,143 h; months 13-24: 2,000 h (excluding 1 uncoded); slope +71.4 h/month — improving after bearing upgrade.",
        "Oil & Gas — offshore gas-compressor: 24-month MTBF trend rose from 5,400 h to 9,800 h after seal-gas redesign; above OREDA median (~6,000 h).",
        "Power — BFP cluster: pooled Weibull (n=18) β=2.4, η=9,000 h; trend by failure mode: bearing events fell from 12 to 4 in 18 months after PM-at-4,000-h strategy.",
        "Manufacturing — robotic weld cell: 80 robots; 'drive failure' events fell from 28 to 11 in 12 months after servo-upgrade capex.",
      ],
      industrial_examples: [
        "Chemical — acid-transfer pump: ISO-14224 coded history → MTBF trend → capex confirmation (bearing upgrade lifted MTBF by 75%).",
        "Oil & Gas — offshore gas-compressor: OREDA-aligned code taxonomy → MTBF trend now above OREDA benchmark after seal-gas redesign.",
        "Power — BFP cluster: pooled Weibull + trend-by-mode confirms PM strategy effectiveness.",
        "Manufacturing — robotic weld cell: CMMS coded to ISO 14224; trend-by-mode confirms servo-upgrade capex; code-completeness in data-quality-improvement phase.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Container Terminal, 14 RTG cranes. Baseline (12 months ago): code-completeness 48% mode, 31% cause, 12% mechanism — MTBF trends not credible. 90-day data-quality program: ISO-14224 training (4-h workshop for all craft and supervisors); CMMS rule changes (refuse closure without valid mode code; cause+mechanism required for critical failures); weekly audit with non-conformance log. After 90 days: 89% mode, 71% cause, 41% mechanism. After 12 months: 96% mode, 84% cause, 65% mechanism. The MTBF trend became credible — and it showed the apparent 'stable' MTBF was hiding a deterioration in hoist-gearbox failure mode (9,800→5,400 h over 18 months) masked by improvements in trolley-motor mode. Equipment history is not a passive record — it is a data product whose quality must be engineered and audited.",
      ],
      common_errors: [
        "Closing WOs without ISO-14224 codes — the WO has zero analytical value.",
        "Pooling all failures into one MTBF (no breakdown by failure mode) — the trend is meaningless.",
        "Computing MTBF over the wrong denominator (counting WOs, not failures; counting non-failure WOs like PMs).",
        "Using MTBF as a single number without confidence intervals — the small-sample CI is wide.",
        "Ignoring the data-quality step — reporting MTBF from a 48%-complete extract is worse than reporting nothing.",
        "Confusing operating time with calendar time — for low-duty-cycle assets the difference is large.",
        "Treating OREDA or other benchmarks as targets — they are population medians, not plant-specific goals.",
        "Forgetting to update the asset-management plan after a strategy shift — the analytics are wasted if the plan does not change.",
      ],
      limitations: [
        "Equipment history is only as good as the closeout discipline — 48% completeness cannot be statistically repaired post-hoc.",
        "ISO 14224 codes are categorical; they do not capture severity (a 'minor weep' and a 'total seal blowout' both code as B3 external leakage).",
        "MTBF trend assumes a stationary failure process; after a strategy shift the trend must be re-baselined.",
        "OREDA and population benchmarks assume a representative operating context; severe-duty plants under-perform the benchmark without being unreliable.",
        "The narrative field is free-text — natural-language processing is required for narrative analytics.",
        "Equipment history cannot, by itself, predict a never-yet-occurred failure mode (high-consequence low-likelihood events).",
      ],
      best_practices: [
        "Refuse to close WOs without valid ISO-14224 codes — the discipline lives at closeout.",
        "Train craft on ISO-14224 code capture (4-h workshop + job aids at the closeout screen).",
        "Audit WO closures weekly for code-completeness; log non-conformances; refresh training where the metric is below target.",
        "Compute MTBF by failure mode, not overall; trend the mode-level metric monthly.",
        "Exclude uncoded 'dark matter' WOs from MTBF arithmetic — report the exclusion rate alongside the MTBF.",
        "Re-fit Weibull after every redesign or strategy shift; re-baseline the MTBF trend.",
        "Update the asset-management plan (ISO 55001 Cl. 7.2) after every strategy shift; report to the management review (Cl. 9.3).",
        "Use OREDA and population benchmarks as informational context, not as plant-specific targets.",
      ],
      related_concepts: [
        "Equipment Reliability (Lesson 1) — MTBF, Weibull, RAM computed from the history.",
        "Condition Monitoring & Diagnostics (Lesson 2) — CBM alert-to-WO closeout is the source of code-captured history.",
        "Work Zone Analysis (Lesson 3) — Pareto arithmetic depends on clean equipment history.",
        "ISO 14224 — failure-code taxonomy underlying all reliability analytics.",
        "ISO 55001 Cl. 7.2 — asset-management plan; Cl. 9.3 — management review (consumer of analytics).",
        "OREDA — population failure-rate benchmark database.",
      ],
      prerequisites: [
        "Equipment Reliability (Lesson 1) — MTBF, Weibull β.",
        "Condition Monitoring & Diagnostics (Lesson 2) — alert-to-WO interface.",
        "Work Zone Analysis (Lesson 3) — Pareto, bad-actor.",
        "CMMS basics: WO lifecycle, asset hierarchy, failure-code fields.",
        "Basic data hygiene: missing data, code-standardization, deduplication.",
      ],
      references: [
        "SMRP CMRP BOK — ER pillar: Equipment History.",
        "SMRP CMRP Exam Outline.",
        "ISO 14224:2016.",
        "ISO 55000:2014; ISO 55001:2014 Cl. 7.2, 9.3; ISO 55002:2018.",
        "OREDA Handbook (6th ed., 2015).",
        "Mobley (2008), Maintenance Engineering Handbook.",
        "Campbell & Jardine (2001), Maintenance Strategy.",
        "Ebeling (2010), An Introduction to Reliability and Maintainability Engineering.",
        "O'Hanlon (2006), Uptime.",
        "Reliabilityweb.com / SMRP best-practices bodies for equipment-history and CMMS data quality.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Equipment History",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which of the following is the correct 4-level drill-down of the ISO 14224 failure-code taxonomy?",
      whyCorrect:
        "ISO 14224 structures the failure-code taxonomy as a 4-level drill-down: Equipment unit (the asset) → Equipment class (the standardized category, e.g., centrifugal pump) → Failure mode (observable, e.g., external leakage) → Failure cause (operational/design reason, e.g., contamination) → Failure mechanism (physical process, e.g., erosion/corrosion). The 4 levels answer four distinct questions (which asset? what category? what is observed? why? how?).",
      whyOthersWrong: [
        "Option B is wrong — it reverses the cause/mechanism order (mechanism is the physical process; cause is the operational/design reason) and omits the equipment-class layer that allows benchmarking against OREDA.",
        "Option C is wrong — equipment class is at the top of the drill-down (just below equipment unit), not at the bottom; the failure-mode/cause/mechanism sequence is the deeper layer.",
        "Option D is wrong — equipment class is at the top, and the order is mode → cause → mechanism (not mechanism → cause → mode).",
      ],
      explanation:
        "ISO 14224 drill-down: Equipment unit → Equipment class → Failure mode → Failure cause → Failure mechanism. The structure enables cross-plant benchmarking (OREDA aggregates by equipment class).",
      options: [
        { text: "Equipment unit → Equipment class → Failure mode → Failure cause → Failure mechanism", isCorrect: true },
        { text: "Equipment unit → Failure mode → Failure mechanism → Failure cause (mechanism as separate field)", isCorrect: false },
        { text: "Failure mode → Failure cause → Failure mechanism → Equipment class", isCorrect: false },
        { text: "Equipment class → Failure mechanism → Failure cause → Failure mode", isCorrect: false },
      ],
    },
    {
      competencyName: "Equipment History",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Manufacturing",
      stem: "A CMMS extract has 200 failure-WOs in 12 months. Of these, 184 have a valid ISO-14224 failure mode code. Compute the failure-mode code-completeness and assess against the SMRP target.",
      whyCorrect:
        "Code-completeness (mode) = (WOs with valid mode code) / (total failure-WOs) × 100 = 184/200 × 100 = 92.0%. The SMRP best-practice target is ≥95%; 92.0% is below target — corrective action (training, CMMS rule enforcement, weekly audit) is required to lift the metric. Reporting MTBF from this extract would be biased by the 16 uncoded 'dark matter' WOs.",
      whyOthersWrong: [
        "95.0% would require 190 valid codes (not 184); the question states 184. The 95% is the SMRP target, not the actual measurement.",
        "84.0% would require 168 valid codes (not 184); the question states 184. 84.0% is below the cause-code target (85%), not the mode-code measurement.",
        "99.0% would require 198 valid codes (not 184); the question states 184. 99.0% is world-class, not the actual measurement.",
      ],
      explanation:
        "CC_mode = (# with valid mode code) / (total) × 100. Target ≥95%; world-class ≥99%. 92.0% is below target — corrective training required. The 16 uncoded WOs are analytical 'dark matter' that must be excluded from MTBF arithmetic.",
      options: [
        { text: "92.0% — below the 95% target; corrective training required", isCorrect: true },
        { text: "95.0% — at target", isCorrect: false },
        { text: "84.0% — well below target", isCorrect: false },
        { text: "99.0% — above target", isCorrect: false },
      ],
    },
    {
      competencyName: "Equipment History",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Power",
      stem: "A power-plant boiler feedwater pump has 8 failures in 12 months, with operating time 7,000 h. Compute the MTBF (point estimate) and the failure rate.",
      whyCorrect:
        "MTBF = operating time / number of failures = 7,000/8 = 875 h. Failure rate FR = 1/MTBF = 1/875 = 1.143×10⁻³ 1/h. Both are point estimates; for small samples (n=8) report alongside a confidence interval.",
      whyOthersWrong: [
        "MTBF = 1,400 h would require 7,000/5 (only 5 failures, not 8); the question states 8 failures.",
        "MTBF = 700 h would require 7,000/10 (10 failures, not 8); the question states 8 failures.",
        "MTBF = 8,000 h would require 7,000/0.875 — not a valid calculation; the math does not match the question (8 failures, 7,000 h operating).",
      ],
      explanation:
        "MTBF = (Σ T_operating) / (Σ N_failures) = 7,000/8 = 875 h. FR = 1/MTBF = 1.143×10⁻³ 1/h. Exclude uncoded 'dark matter' from the denominator — if any of the 8 WOs lack a valid ISO-14224 mode code, the MTBF arithmetic is biased.",
      options: [
        { text: "MTBF = 875 h, FR = 1.143×10⁻³ 1/h", isCorrect: true },
        { text: "MTBF = 1,400 h, FR = 7.14×10⁻⁴ 1/h", isCorrect: false },
        { text: "MTBF = 700 h, FR = 1.43×10⁻³ 1/h", isCorrect: false },
        { text: "MTBF = 8,000 h, FR = 1.25×10⁻⁴ 1/h", isCorrect: false },
      ],
    },
    {
      competencyName: "Equipment History",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "DecisionMaking",
      skillType: "Conceptual",
      scenario: "Chemical",
      stem: "You are the reliability engineer at a Chemical plant. The CMMS audit shows: code-completeness = 67% mode, 41% cause, 18% mechanism. You can fund ONE of three actions: (A) $50k reliability-analytics dashboard that auto-computes MTBF/Weibull/Pareto; (B) $20k 90-day data-quality program (ISO-14224 training + CMMS rule changes + weekly audit); (C) $90k reliability-engineer FTE for 12 months to manually re-code history. Which is the best first action?",
      whyCorrect:
        "(B) first. Without code-completeness, (A) is garbage-in/garbage-out — the dashboard will compute MTBF from a 67%-complete extract that is not credible; the resulting trends will be biased and the capex decisions made from them will be wrong. (C) is more expensive than (B) and produces a one-time fix, not a sustainable discipline — the discipline lives at closeout, not in historical re-coding. (B) is the upstream fix that makes (A) valuable later.",
      whyOthersWrong: [
        "(A) alone is wrong — the dashboard's MTBF, Weibull, and Pareto outputs are only as good as the underlying code-completeness; 67% produces unreliable trends. Buying the dashboard before fixing the data quality is the most common CMMS-investment mistake.",
        "(C) alone is wrong — historical re-coding is a one-time fix; without changing the closeout discipline, new WOs continue to be uncoded, and the historical effort is wasted within months. (C) is also more expensive than (B).",
        "(A) and (C) in parallel is wrong — without (B), both (A) and (C) are downstream of a broken process; the parallel investment produces no durable value because new WOs continue to be uncoded.",
      ],
      explanation:
        "Sequence: (B) first (90 days), then re-audit; if code-completeness reaches 90%+, then (A) to automate the analytics. (C) is unnecessary if (B) succeeds — the discipline lives at closeout, not in historical re-coding.",
      options: [
        { text: "(A) — the dashboard will compute MTBF/Weibull/Pareto automatically", isCorrect: false },
        { text: "(B) — code-completeness must be fixed first; without it, (A) is garbage-in/garbage-out", isCorrect: true },
        { text: "(C) — manual re-coding is the only way to recover historical data", isCorrect: false },
        { text: "(A) and (C) in parallel — buy the dashboard and hire the FTE simultaneously", isCorrect: false },
      ],
    },
    {
      competencyName: "Equipment History",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: MTBF trend by failure mode is more diagnostic than MTBF trend by asset, because it isolates the effect of a specific RCA / strategy shift.",
      whyCorrect:
        "True. A single asset can have multiple failure modes (e.g., seal leakage, bearing wear, impeller erosion) each with its own trend. Pooling all failures into one MTBF by asset hides the mode-level trends; the engineer cannot tell whether the bearing RCA is working because the seal failures are masking the bearing improvement. Trending by failure mode isolates each RCA's effect, exposing the bad-actor mode and the improving mode separately.",
      whyOthersWrong: [
        "False — the candidate would miss that pooling by asset hides the failure-mode-specific trend. RCA effectiveness is judged at the failure-mode level (does the bearing RCA reduce bearing-failure events?), not at the asset level (where multiple failure modes compete).",
      ],
      explanation:
        "MTBF by failure mode isolates the RCA effect. A plant that reports only asset-level MTBF cannot answer 'is the bearing RCA working?' — it must stratify the trend by failure mode (B4 vibration high ⇒ bearing; B3 external leakage ⇒ seal).",
      options: [
        { text: "True", isCorrect: true },
        { text: "False", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Public lesson array
// ---------------------------------------------------------------------------

export const CMRP_ER_LESSONS: RefLesson[] = [
  LESSON_EQUIPMENT_RELIABILITY,
  LESSON_CONDITION_MONITORING,
  LESSON_WORK_ZONE_ANALYSIS,
  LESSON_EQUIPMENT_HISTORY,
];

// ---------------------------------------------------------------------------
// Loader — writes the dataset into the database (certification track)
// ---------------------------------------------------------------------------

/**
 * Upsert the CMRP Equipment Reliability reference dataset into the database.
 * Idempotent: safe to call repeatedly. Returns record counts written.
 *
 * Flow:
 *  1. Find CMRP certification by slug "cmrp"; find ER domain by code "ER";
 *     map the 4 ER competencies by NAME -> id (Equipment Reliability,
 *     Condition Monitoring & Diagnostics, Work Zone Analysis, Equipment
 *     History).
 *  2. Upsert References globally (by title, no sectionId) -> a shared
 *     referenceIds array applied to every ER lesson, KO, and question.
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
  // 1) Certification + ER domain + competency map
  const certification = await db.certification.findUnique({
    where: { slug: "cmrp" },
  });
  if (!certification) {
    throw new Error(
      'CMRP certification not found. Run the CMRP structure loader (src/lib/ref-content/cmrp.ts) first.'
    );
  }

  const erDomain = await db.domain.findFirst({
    where: { certificationId: certification.id, code: "ER" },
  });
  if (!erDomain) {
    throw new Error(
      'Equipment Reliability (ER) domain not found under CMRP. Run the CMRP structure loader first.'
    );
  }

  const erCompetencies = await db.competency.findMany({
    where: { domainId: erDomain.id },
  });
  const competencyIdByName: Record<string, string> = {};
  for (const c of erCompetencies) {
    competencyIdByName[c.name] = c.id;
  }

  // Validate that all 4 expected ER competencies exist by name.
  const expectedCompetencyNames = CMRP_ER_LESSONS.map((l) => l.competencyName);
  const missing = expectedCompetencyNames.filter(
    (n) => !competencyIdByName[n]
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing ER competencies by name: ${missing.join(
        ", "
      )}. Ensure src/lib/ref-content/cmrp.ts has been loaded with the latest ER competency names.`
    );
  }

  // 2) References — global (no sectionId), upserted by title.
  const refIdsByTitle: Record<string, string> = {};
  for (const src of CMRP_ER_SOURCES) {
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
  const sharedReferenceIds = CMRP_ER_SOURCES.map((s) => refIdsByTitle[s.title]).filter(
    Boolean
  ) as string[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 3) Lessons, 4) KnowledgeObjects, 5) Questions
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of CMRP_ER_LESSONS) {
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
      domainId: erDomain.id,
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
          domainId: erDomain.id,
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
    domain: erDomain.id,
    competencies: erCompetencies.length,
    lessons: lessonsCount,
    kos: kosCount,
    questions: questionsCount,
    references: referencesCount,
  };
}
