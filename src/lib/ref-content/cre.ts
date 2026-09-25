// =============================================================================
// CRE — Certified Reliability Engineer (ASQ) — Combined structure + content
// loader for the Reliability Fundamentals (RF) pillar (Task ID 16-CRE).
//
// This single loader does BOTH:
//   (A) Certification STRUCTURE — the 7-domain ASQ CRE Body of Knowledge
//       (Reliability Fundamentals, Probability & Statistics, Reliability in
//       Design & Development, Reliability Modeling, Reliability Testing,
//       Reliability in Production & Operations, Maintenance & Logistics),
//       ISO 55000:2014 standard link, v2024 version snapshot, and CRE
//       learning path — mirroring src/lib/ref-content/cmrp.ts.
//   (B) Deep scientific CONTENT for the Reliability Fundamentals (RF) domain
//       — 4 full-spec (24-section) lessons, Knowledge Objects, and 16
//       enriched questions — mirroring src/lib/ref-content/cmrp-equipment-
//       reliability.ts.
//
// NOTE on exam weights: the official ASQ CRE exam blueprint publishes per-
// domain % weights. The weights below are placeholders flagged
// verificationStatus = "REQUIRES_RESEARCH" until the official ASQ CRE BOK
// is loaded. The 7-domain structure itself is the published ASQ CRE BOK
// (per ASQ, "CRE — Certified Reliability Engineer," Body of Knowledge).
//
// Source hierarchy (spec §5) — Levels 2, 3, 6, 7:
//   - LEVEL 3 — Official BOK / Handbook / Exam Outline: ASQ CRE Body of
//     Knowledge.
//   - LEVEL 2 — Official Standard / Standards Organization: ISO 55000:2014
//     (asset management — overview, principles and terminology).
//   - LEVEL 6 — University / Academic Publications: Charles E. Ebeling,
//     "An Introduction to Reliability and Maintainability Engineering"
//     (Waveland Press, 2010).
//   - LEVEL 7 — Technical Publications / Industry Sources: Patrick D. T.
//     O'Connor "Practical Reliability Engineering" (Wiley, 5th ed., 2012);
//     David J. Smith "Reliability, Maintainability and Risk" (Butterworth-
//     Heinemann, 10th ed., 2021); R. K. Mobley "Maintenance Engineering
//     Handbook" (McGraw-Hill, 7th ed., 2008).
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
// Public types (mirror cmrp-equipment-reliability.ts)
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
// CRE STRUCTURE — 7 official ASQ CRE BOK domains.
//
// Exam weights are approximate/REQUIRES_RESEARCH: the official ASQ CRE
// exam blueprint publishes per-domain % weights that are flagged for
// research until the ASQ BOK is loaded (spec §1: do not invent certification
// requirements). The 7-domain structure itself is the published ASQ CRE BOK.
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

const CRE_DOMAINS: SeedDomain[] = [
  {
    code: "RF",
    name: "Reliability Fundamentals",
    weight: 0,
    description:
      "Foundational reliability concepts, terminology, the reliability function R(t), the bathtub curve, reliability metrics (MTBF/MTTR/availability), failure modes & effects (FMEA/FMECA), and the reliability program lifecycle (allocation, DVP&R, growth).",
    competencies: [
      {
        name: "Reliability Concepts & Terminology",
        description:
          "Reliability as a probability; inherent, operational, and mission reliability; the reliability function R(t) and failure distribution F(t); the bathtub curve; FMEA/RCM/TPM context.",
        order: 1,
      },
      {
        name: "Reliability Metrics (MTBF/MTTR/Availability)",
        description:
          "MTBF, MTTF, MTTR, failure rate λ; inherent, achieved, and operational availability; reliability metrics units and interpretation.",
        order: 2,
      },
      {
        name: "Failure Modes & Effects",
        description:
          "Failure modes, FMEA/FMECA, RPN with severity/occurrence/detection, fault-tree analysis (FTA) basics.",
        order: 3,
      },
      {
        name: "Reliability Program & Culture",
        description:
          "Reliability program lifecycle; reliability allocation/apportionment; DVP&R; reliability growth (Duane, Crow-AMSAA); reliability culture and leadership.",
        order: 4,
      },
    ],
  },
  {
    code: "PS",
    name: "Probability & Statistics",
    weight: 0,
    description:
      "Probability concepts, descriptive and inferential statistics, probability distributions (binomial, Poisson, exponential, normal, Weibull), hypothesis testing, regression, and confidence intervals for reliability data.",
    competencies: [],
  },
  {
    code: "RDD",
    name: "Reliability in Design & Development",
    weight: 0,
    description:
      "Design-for-reliability methods: FMEA/FMECA, fault-tree analysis (FTA), design reviews, parts and materials selection, derating, redundancy, and reliability allocation.",
    competencies: [],
  },
  {
    code: "RM",
    name: "Reliability Modeling",
    weight: 0,
    description:
      "Reliability block diagrams (RBD), series/parallel/k-of-n systems, system reliability modeling, simulation (Monte Carlo), and availability modeling for repairable systems.",
    competencies: [],
  },
  {
    code: "RT",
    name: "Reliability Testing",
    weight: 0,
    description:
      "Reliability test strategies — development testing, reliability qualification, accelerated life testing (ALT), HALT/HASS, sequential and reliability-growth testing, and test-data analysis.",
    competencies: [],
  },
  {
    code: "RPO",
    name: "Reliability in Production & Operations",
    weight: 0,
    description:
      "Production reliability — process FMEA, statistical process control (SPC), supplier reliability, root-cause analysis (RCA), and field-data analysis for sustaining reliability.",
    competencies: [],
  },
  {
    code: "ML",
    name: "Maintenance & Logistics",
    weight: 0,
    description:
      "Maintenance concepts (RCM, TPM, CBM), spare-parts logistics, life-cycle cost (LCC), FMECA-to-maintenance linkage, and the maintenance-reliability-asset-management interface.",
    competencies: [],
  },
];

// ---------------------------------------------------------------------------
// SOURCES — 6 real references cited across all RF lessons.
// ---------------------------------------------------------------------------

export const CRE_SOURCES: RefSource[] = [
  {
    title: "ASQ CRE Body of Knowledge — Certified Reliability Engineer",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "BOK",
    url: "https://asq.org/cert/reliability-engineer",
    citation:
      "American Society for Quality (ASQ). Certified Reliability Engineer (CRE) Body of Knowledge — the official competency framework assessed by the CRE exam, organized across seven domains: Reliability Fundamentals; Probability & Statistics; Reliability in Design & Development; Reliability Modeling; Reliability Testing; Reliability in Production & Operations; and Maintenance & Logistics. Anchors reliability definitions, the reliability function R(t), failure-rate behavior, FMEA/FMECA, RPN, FTA, reliability allocation, DVP&R, and reliability-growth methods (Duane, Crow-AMSAA).",
  },
  {
    title: "ISO 55000:2014 — Asset management — Overview, principles and terminology",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/55088.html",
    citation:
      "International Organization for Standardization. ISO 55000:2014, Asset management — Overview, principles and terminology. Geneva: ISO. Defines asset, asset management, asset-management system, and the value-of-asset-management principles (value, alignment, leadership, assurance) that frame the CRE's reliability-program work within enterprise asset management.",
  },
  {
    title: "Ebeling — An Introduction to Reliability and Maintainability Engineering (Waveland Press)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Ebeling, C. E. (2010). An Introduction to Reliability and Maintainability Engineering (2nd ed.). Long Grove, IL: Waveland Press. ISBN 978-1-57766-625-9. The canonical reliability-engineering textbook for the reliability function R(t), the exponential/Weibull failure distributions, hazard-rate behavior and the bathtub curve, MTBF/MTTF/MTTR, availability definitions (inherent/achieved/operational), reliability block diagrams, FMEA/FMECA, RPN, fault-tree analysis, reliability allocation methods (equal/ARINC/AGREE), DVP&R, and reliability-growth models (Duane, Crow-AMSAA).",
  },
  {
    title: "O'Connor — Practical Reliability Engineering (Wiley)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "O'Connor, P. D. T., & Kleyner, A. (2012). Practical Reliability Engineering (5th ed.). Chichester: John Wiley & Sons. ISBN 978-0-470-97982-2. The widely-cited practitioner reference for design-for-reliability, FMEA/FMECA, FTA, HALT/HASS, reliability testing and growth, and the link between reliability-engineering discipline and product reliability across the lifecycle.",
  },
  {
    title: "Smith — Reliability, Maintainability and Risk (Butterworth-Heinemann)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Smith, D. J. (2021). Reliability, Maintainability and Risk: Practical Methods for Engineers Including Reliability-Centred Maintenance and Safety-Related Systems (10th ed.). Oxford: Butterworth-Heinemann / Elsevier. ISBN 978-0-08-102717-1. The practitioner reference for reliability metrics (MTBF/MTTR/availability), FMECA, fault-tree synthesis, RCM, safety-integrity levels (SIL), and the maintainability–risk interface that operationalizes the CRE BOK.",
  },
  {
    title: "Mobley — Maintenance Engineering Handbook (McGraw-Hill)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "HANDBOOK",
    citation:
      "Mobley, R. K. (2008). Maintenance Engineering Handbook (7th ed.). New York: McGraw-Hill. ISBN 978-0-07-154358-0. Section I (reliability concepts & metrics), Section II (failure modes & effects), Section IV (RCM, TPM, CBM), and Section VIII (reliability-centered maintenance and the maintenance-reliability program). The widely-cited technical reference that links reliability-engineering fundamentals to the sustaining maintenance program.",
  },
];

const RF_REFERENCE_TITLES = CRE_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Lesson 1 — Reliability Concepts & Terminology
// (Competency: "Reliability Concepts & Terminology"; slug: rf-reliability-concepts)
// ---------------------------------------------------------------------------

const LESSON_RELIABILITY_CONCEPTS: RefLesson = {
  competencyName: "Reliability Concepts & Terminology",
  slug: "rf-reliability-concepts",
  title: "Reliability Concepts & Terminology",
  titleAr: "مفاهيم الموثوقية والمصطلحات",
  order: 1,
  durationMin: 30,
  references: RF_REFERENCE_TITLES,
  conceptIntroduction: `Reliability is the probability that an item performs its intended function for a specified interval under stated conditions. The CRE BOK begins with this definition because every later domain — modeling, testing, design, production, maintenance — depends on it. Three contextual flavors of reliability appear throughout the BOK: inherent reliability (the design's reliability under ideal conditions), operational reliability (the reliability realized in actual service, including environment and operator effects), and mission reliability (the probability of completing a specific mission such as an 8-hour flight or a 720-hour production campaign). The reliability function R(t) = P(T > t) is the mathematical core; for a constant failure rate λ it reduces to the exponential R(t) = exp(−λt). The bathtub curve links the shape of the hazard-rate function h(t) to the maintenance strategy: infant mortality (decreasing h, β < 1), useful life (constant h, β = 1), and wear-out (increasing h, β > 1). FMEA, RCM, and TPM are the methodologies that operationalize the discipline across design, service, and operations.`,
  example: `A servo amplifier in an aerospace flight-control application has a constant failure rate λ = 0.001 failures/hour (one failure per 1,000 h). The mission is 8 hours. Mission reliability M(8) = exp(−0.001 × 8) = exp(−0.008) = 0.99203 ≈ 99.20%. The mean time to failure MTTF = 1/λ = 1,000 h. The median life t_med = ln(2)/λ = 0.6931/0.001 = 693.1 h (50% of units survive to this age). R(500 h) = exp(−0.5) = 0.6065 = 60.65%; R(1,000 h) = exp(−1) = 0.3679 = 36.79%. If the operational environment raises the failure rate to λ_op = 0.0015/h (50% harsher than the inherent λ), operational MTTF drops to 667 h and the same 8-hour mission reliability falls to exp(−0.012) = 98.81%.`,
  keyFormulas: `R(t) = P(T > t) = probability that an item survives to time t
For constant failure rate λ (exponential model): R(t) = exp(−λ·t)
F(t) = 1 − R(t) = P(T ≤ t) = cumulative failure distribution
f(t) = −dR/dt = λ·exp(−λ·t) (exponential pdf)
h(t) = f(t)/R(t) = λ (constant hazard — useful-life region of the bathtub curve)
MTTF = ∫₀^∞ R(t) dt = 1/λ (exponential, non-repairable)
MTBF = 1/λ (exponential, repairable, in steady-state useful life)
Mission reliability M(t_m) = exp(−λ·t_m)
Weibull: R(t) = exp(−(t/η)^β) — β<1 infant mortality, β=1 useful life, β>1 wear-out
Operational vs inherent: λ_op = k·λ_inherent (k ≥ 1; k is the environmental severity factor)`,
  exercise: `You are the reliability engineer on an aerospace program. A line-replaceable unit (LRU) has an inherent MTTF = 2,500 h. (a) Compute λ and R(t) at t = 500, 1,000, and 2,500 h. (b) Compute the 4-hour mission reliability. (c) The actual field-failure rate is 1.6× the inherent rate (k = 1.6). Compute the operational MTTF and the 4-hour mission reliability under field conditions. (d) Recommend one design or sustainment action that closes the inherent-to-operational gap.`,
  sections: {
    learning_objectives: `- Define reliability as a probability and identify the four parts of the ASQ/IEC definition: intended function, specified interval, stated conditions, and probability.
- Distinguish inherent, operational, and mission reliability; explain why inherent ≥ operational and when mission reliability diverges from interval reliability.
- Apply the exponential reliability function R(t) = exp(−λ·t) and its complement F(t) = 1 − R(t) to constant-failure-rate components.
- Interpret the bathtub curve (infant mortality, useful life, wear-out) and link each phase to its maintenance strategy (screening, CBM/RTF, time-based PM).
- Position FMEA, RCM, and TPM within the reliability-engineering lifecycle (design, service, operations) and explain how each relates to R(t).
- Connect CRE terminology to ISO 55000 asset-management principles (value, alignment, leadership, assurance).`,
    prerequisites: `- The 7-domain ASQ CRE BOK and the position of Reliability Fundamentals within it.
- Basic probability: distribution, mean, variance, cumulative distribution function (CDF), probability density function (pdf).
- Single-variable differential and integral calculus (enough to read dR/dt and ∫R(t)dt).
- Familiarity with the engineering design lifecycle (concept, design, production, service) and operating-context concepts.`,
    introduction: `Reliability engineering is the discipline of designing and sustaining items so they perform. The ASQ CRE BOK opens with Reliability Fundamentals because every later domain — modeling, testing, design, production, maintenance — is built on a shared vocabulary and a small set of mathematical primitives. This lesson establishes that foundation.

Reliability is formally a probability — not a guarantee. The ASQ/IEC definition has four parts: the item performs its *intended function*, for a *specified interval*, under *stated conditions*, with a stated *probability*. Omit any one part and the term becomes a marketing slogan rather than an engineering quantity. A servo amplifier rated "0.001 failures/hour" tells the engineer nothing without the mission interval and the operating environment.

Three flavors of reliability appear throughout the BOK. *Inherent reliability* is what the design produces under ideal conditions; it is set during RDD and quantified by reliability testing (RT). *Operational reliability* is what the field actually sees — including environmental severity, operator behavior, maintenance quality, and logistics delays. *Mission reliability* is the probability of completing a specific mission: an 8-hour flight, a 720-hour production campaign, or a 24-hour surgical procedure. Mission reliability is the operational quantity the end user cares about.

Mathematically, the reliability function R(t) = P(T > t) is the complement of the cumulative failure distribution F(t) = 1 − R(t). For a constant failure rate λ (the useful-life region of the bathtub curve), R(t) reduces to the exponential R(t) = exp(−λ·t), with MTTF = MTBF = 1/λ. The hazard rate h(t) = f(t)/R(t) generalizes the failure rate to non-constant behavior; the 2-parameter Weibull R(t) = exp(−(t/η)^β) captures the three bathtub phases via β < 1, β = 1, β > 1.

The methodologies that operationalize reliability engineering are FMEA (design — find the failure modes before they find the customer), RCM (service — set the maintenance strategy from failure modes and consequences), and TPM (operations — sustain inherent reliability through operator ownership and autonomous maintenance). Each of these is treated in depth later in the BOK; the foundational lesson establishes the shared R(t)-based language that connects them.`,
    terminology: `- **Reliability (ASQ/IEC 60300)**: the probability that an item performs its intended function for a specified interval under stated conditions.
- **Inherent reliability**: reliability determined by design and manufacture (under ideal conditions).
- **Operational reliability**: reliability realized in actual service (environment + operator + maintenance + logistics).
- **Mission reliability**: probability of completing a specific mission profile (e.g., M(t_m) = exp(−λ·t_m)).
- **Reliability function R(t)**: P(T > t) — the survival function.
- **Failure distribution F(t)**: 1 − R(t) — the cumulative failure probability.
- **Failure pdf f(t)**: −dR/dt — the failure probability density.
- **Failure rate / hazard h(t)**: f(t)/R(t) — the instantaneous failure rate conditional on survival.
- **Bathtub curve**: the three-phase hazard profile (infant mortality, useful life, wear-out).
- **Useful life**: the flat middle of the bathtub, where h(t) ≈ constant.
- **MTTF**: mean time to failure (non-repairable items).
- **MTBF**: mean time between failures (repairable items, in steady state).
- **MTTR**: mean time to repair (mean active maintenance time for corrective action).
- **FMEA**: failure modes and effects analysis (design or process).
- **RCM**: reliability-centered maintenance (failure-mode-driven maintenance selection).
- **TPM**: total productive maintenance (operator-ownership model).
- **Maintainability**: probability of restoration within a time τ.
- **Availability**: the long-run fraction of time the item is able to operate (see Lesson 2).`,
    detailed_explanation: `The mathematical core of reliability engineering is the survival function. Given a non-negative random variable T (the time to failure of an item), the reliability function R(t) = P(T > t) is the probability that the item survives to time t. Its complement F(t) = 1 − R(t) is the cumulative failure probability. The failure pdf is f(t) = −dR/dt, and the hazard rate is h(t) = f(t)/R(t). The hazard rate is the instantaneous failure rate, conditional on survival to time t — the right object for maintenance-strategy reasoning.

Three distributions dominate the BOK. The *exponential* distribution has constant hazard h(t) = λ, reliability R(t) = exp(−λ·t), and mean life E[T] = 1/λ. The constant-hazard assumption holds in the useful-life region of the bathtub curve and is the workhorse of electronic-component reliability. The *Weibull* distribution has reliability R(t) = exp(−(t/η)^β), hazard h(t) = (β/η)·(t/η)^(β−1), and mean life E[T] = η·Γ(1 + 1/β). The shape parameter β captures the three bathtub phases: β < 1 gives a decreasing hazard (infant mortality), β = 1 reduces to the exponential (useful life), and β > 1 gives an increasing hazard (wear-out). The *lognormal* distribution is used for degradation-driven failure modes (fatigue crack growth, corrosion penetration).

The bathtub curve links hazard shape to maintenance strategy. *Infant mortality* (β < 1) is addressed by burn-in, screening, and supplier quality programs — not by periodic PM. *Useful life* (β = 1, constant hazard) means failures are random and age-independent; time-based PM does not help, and the right strategy is condition-based maintenance (CBM) or run-to-failure with spares. *Wear-out* (β > 1, increasing hazard) is the regime where time-based PM works — set the PM interval at the time where R(t) is still 0.85–0.95 (typically 0.30–0.50·η), not at MTBF (where R ≈ 0.37).

Inherent vs operational reliability is a recurring CRE theme. A design might have inherent λ_inherent = 0.001/h; field conditions (temperature, vibration, contamination, operator errors) can raise the operational λ to 0.0015–0.0025/h. The ratio k = λ_op/λ_inherent is the environmental severity factor; the gap between inherent and operational reliability is closed by (i) designing for the field environment (derating, redundancy, sealing), (ii) sustaining with the right maintenance strategy, and (iii) operator training.

Mission reliability is the engineer's practical answer to the customer's question, "Will it work when I need it?" For a constant-λ system, the 8-hour mission reliability is M(8) = exp(−λ·8) — much higher than the 1,000-hour interval reliability R(1,000) = exp(−λ·1000), because the mission is short. Mission reliability is the operational quantity that drives dispatch, sparing, and redundancy decisions.

The methodologies that operationalize reliability engineering cut across the design-service-operations lifecycle. *FMEA* is a design tool — find the failure modes and their effects before they reach the customer. *RCM* is a service tool — set the maintenance strategy by linking failure modes to consequences (safety, environmental, operational, economic). *TPM* is an operations tool — sustain inherent reliability through operator ownership, autonomous maintenance, and focused improvement. Each of these references the same R(t)-based vocabulary the foundations lesson establishes.`,
    core_principles: `- Reliability is a probability over time, not a point value or a marketing claim.
- The four-part definition (intended function + specified interval + stated conditions + probability) is non-negotiable; drop any part and the term becomes meaningless.
- Inherent reliability ≥ operational reliability ≥ mission reliability, with appropriate comparisons — each is the right quantity for a different decision.
- R(0) = 1, R(∞) = 0; R(t) is monotone non-increasing.
- For a constant failure rate (exponential model), R(t) = exp(−λ·t), MTTF = MTBF = 1/λ, and the mission reliability M(t_m) = exp(−λ·t_m).
- The bathtub curve links hazard shape to maintenance strategy: burn-in (β<1), CBM/RTF (β=1), time-based PM (β>1).
- The reliability function is the shared mathematical language that links FMEA (design), RCM (service), and TPM (operations).`,
    components: `- Reliability block diagram (RBD) — the graphical model of how component reliabilities combine into system reliability.
- Failure-mode taxonomy (per ISO 14224 or the FMEA/RCM literature) — the structured list of ways an item can fail.
- Failure-rate database (MIL-HDBK-217, FIDES, OREDA) — population λ values by component class.
- Service-condition profile — the environmental severity factor k = λ_op/λ_inherent.
- Mission profile — the time t_m for mission-reliability computation.
- Reliability test plan (DVP&R) — the empirical program that validates inherent R(t).
- Maintenance-strategy map (RCM/TPM) — the sustaining program that closes inherent-to-operational.
- Field-failure-data capture (CMMS/FRACAS) — the closed loop that re-fits λ in service.`,
    process: `1. Define the intended function, the operating conditions, and the mission interval for the item.
2. Identify the failure modes (FMEA) and the consequence of each.
3. Acquire failure-rate data for each mode (database, test, or field).
4. Compute the reliability function R(t) — exponential for constant λ, Weibull for shaped hazard.
5. Compare inherent R(t) to operational R(t); quantify the environmental severity factor k.
6. Compute the mission reliability M(t_m) for the customer's mission profile.
7. Set the maintenance strategy (burn-in, CBM, PM, RTF) from the bathtub phase.
8. Sustain with RCM/TPM and re-fit R(t) from field data (closed loop).`,
    formula_calculation: `Variables and formulas:
- t: time since start of operation [h]
- λ: failure rate [failures/h] (constant in useful life)
- R(t): reliability (probability of survival to time t) — dimensionless [0,1]
- F(t): failure distribution = 1 − R(t) — dimensionless [0,1]
- f(t): failure pdf = −dR/dt — [1/h]
- h(t): hazard rate = f(t)/R(t) — [1/h]
- t_m: mission duration [h]
- M(t_m): mission reliability = R(t_m) — dimensionless
- k: environmental severity factor = λ_op/λ_inherent — dimensionless

Core formulas (constant-failure-rate / exponential model):
- R(t) = exp(−λ·t)
- F(t) = 1 − exp(−λ·t)
- f(t) = λ·exp(−λ·t)
- h(t) = λ (constant)
- MTTF = MTBF = 1/λ
- Median life t_med = ln(2)/λ
- Mission reliability M(t_m) = exp(−λ·t_m)

Weibull generalization (bathtub):
- R(t) = exp(−(t/η)^β)
- h(t) = (β/η)·(t/η)^(β−1)
- Mean life E[T] = η·Γ(1 + 1/β)

Units: time in hours (h); λ in 1/h; R, F, M dimensionless.

Assumptions: (i) failures are independent and identically distributed (i.i.d.); (ii) constant-λ regime applies only in useful life (β = 1); (iii) the item is repairable to "as-good-as-new" for MTBF ≈ MTTF; (iv) the mission is single-phase (for multi-phase missions, integrate the hazard across phases).

Interpretation: R(t) is the survival probability to time t; F(t) is the failure probability by time t; M(t_m) is the probability the mission completes without failure. A "reliability of 0.99" without a time is meaningless; the same number could mean R(1 h) = 0.99 or R(10,000 h) = 0.99 — vastly different engineering quantities.`,
    worked_example: `**Servo amplifier — exponential reliability.**
Given: λ = 0.001 failures/h (one failure per 1,000 h, useful-life region of the bathtub).

Compute:
- R(100) = exp(−0.001 × 100) = exp(−0.1) = 0.9048 = 90.48%
- R(500) = exp(−0.5) = 0.6065 = 60.65%
- R(1,000) = exp(−1) = 0.3679 = 36.79%
- MTTF = 1/λ = 1,000 h
- Median life t_med = ln(2)/λ = 0.6931/0.001 = 693.1 h (50% survival)
- 8-hour mission reliability M(8) = exp(−0.001 × 8) = exp(−0.008) = 0.99203 ≈ 99.20%
- 100-hour mission reliability M(100) = exp(−0.1) = 90.48%

**Inherent vs operational.**
If field conditions raise λ_op = 1.5 × λ_inherent = 0.0015/h (k = 1.5):
- Operational MTTF = 1/0.0015 = 667 h (33% drop from inherent 1,000 h)
- Operational 8-hour mission reliability = exp(−0.0015 × 8) = exp(−0.012) = 0.98807 ≈ 98.81%
- The 4-percentage-point gap between inherent (99.20%) and operational (98.81%) for an 8-hour mission is the addressable reliability opportunity.

**Bathtub phase shift.**
If a wear-out mechanism emerges in service (Weibull β = 2.5, η = 1,500 h):
- R(1,000) = exp(−(1000/1500)^2.5) = exp(−(0.6667)^2.5) = exp(−0.3629) = 0.6956 = 69.56%
- The hazard is no longer constant; the maintenance strategy shifts from CBM (β = 1) to time-based PM at 0.30–0.50·η = 450–750 h where R is 0.93–0.97.`,
    industrial_example: `**Aerospace (avionics LRU).** A line-replaceable unit (LRU) on a commercial aircraft has an inherent failure rate λ = 4 × 10⁻⁶/h (MTBF = 250,000 h, one failure per ~28.5 years). A 12-hour flight mission: M(12) = exp(−4e−6 × 12) = exp(−4.8e−5) = 0.999952 ≈ 99.995%. The fleet operates 50 aircraft × 4 LRUs × 8 flights/day × 365 days = ~584,000 flight-hours/year; expected LRU failures = 4e−6 × 584,000 = 2.34 per year — sizing the spares pool and the line-maintenance shop. The inherent-to-operational gap (k ≈ 1.4 with field environment, vibration, temperature cycling) raises the operational rate to 5.6e−6/h and expected failures to ~3.3/year.`,
    case_study: `CASE_TYPE = SYNTHETIC. A regional airline operating 40 short-haul aircraft observed an avionics bus-power supply (BPS) MTBF of 18,000 flight hours — well below the supplier's inherent rating of 35,000 h. Root-cause analysis (RCA) of 14 field returns found: 8 units with capacitor degradation (thermal), 4 with solder-joint fatigue (vibration), 2 with ESD damage (handling). The reliability engineer computed the operational severity factor k = 35,000/18,000 ≈ 1.94 and decomposed it: thermal k_thermal ≈ 1.45 (cabin temperature excursions), vibration k_vib ≈ 1.25 (rough-field runways), handling k_handling ≈ 1.15 (line-maintenance procedures). Targeted redesign — polymer tantalum capacitors with 125°C rating, conformal coating, ESD training — closed the gap to k = 1.15 over 18 months (operational MTBF rose to 30,500 h). The closed loop: inherent R(t) → field failure data → RCA → redesign → operational R(t) → confirm. Source: synthetic case authored for this lesson, method per Ebeling (2010, Ch. 1) and O'Connor (2012, Ch. 1).`,
    visual_explanation: `Bathtub curve: a U-shaped hazard function h(t) plotted against age t. Phase I (infant mortality, 0 ≤ t ≤ t_early) — h(t) decreases from a high initial value as the weak sub-population fails and is screened out. Phase II (useful life, t_early ≤ t ≤ t_wear) — h(t) ≈ constant at λ. Phase III (wear-out, t ≥ t_wear) — h(t) increases as degradation mechanisms dominate. Overlay the Weibull shape parameter: β = 0.5 (infant), β = 1 (useful), β = 2.5 (wear-out). The reliability function R(t) plotted on the same axis is monotone non-increasing; for the exponential model it is the classic exp(−λ·t) "decaying exponential" shape.`,
    simulation_opportunity: `An interactive simulation could let the learner vary λ (failure rate) and t_m (mission duration) and observe R(t), M(t_m), and the population-failure-vs-time curve. A second slider would let the learner switch the distribution between exponential (β = 1) and Weibull (β = 0.5, 2.5) and observe the bathtub-phase shift. The interpretation panel would show the recommended maintenance strategy (burn-in, CBM, time-based PM) for each phase.`,
    common_mistakes: `- Reporting a "reliability" number without specifying the time interval (e.g., "reliability is 0.99" — meaningless without t).
- Confusing inherent with operational reliability — comparing a design rating to field MTBF without accounting for the severity factor k.
- Setting the PM interval at MTBF (for β > 1 wear-out, R(MTBF) ≈ 0.37 — half the population has already failed).
- Assuming the constant-λ (exponential) model holds when wear-out is present; this over-estimates R(t) at long times.
- Pooling multiple failure modes in one R(t) fit; the composite distribution is mathematically valid but practically misleading.
- Treating mission reliability and interval reliability as interchangeable — they answer different questions for different decisions.
- Omitting "stated conditions" from the reliability statement; an MTBF quoted without an operating environment is unverifiable.`,
    limitations: `- The constant-λ (exponential) assumption holds only in the useful-life region; it under-estimates R(t) in wear-out and over-estimates R(t) in infant mortality.
- The Weibull fit needs sufficient sample size; small-field-data sets (n < 5) produce wide β confidence intervals.
- Inherent λ values from databases (MIL-HDBK-217, FIDES) assume a representative operating context; severe-duty plants under-perform without being unreliable.
- The bathtub curve is a simplification; multi-modal hazard patterns (e.g., a mid-life bump from a second wear-out mechanism) are common in practice.
- Mission reliability computed from inherent λ over-estimates field reliability if k > 1 is not applied.
- The "as-good-as-new" repair assumption (MTBF ≈ MTTF) fails for imperfect repair; the repairable-systems alternative is the non-homogeneous Poisson process (NHPP).`,
    comparison: `**Exponential vs Weibull vs lognormal reliability functions:**
- Exponential: R(t) = exp(−λ·t). One parameter (λ). Constant hazard. Useful life of electronics. Memoryless (no aging).
- Weibull: R(t) = exp(−(t/η)^β). Two parameters (η, β). Flexible hazard (infant, constant, wear-out). Mechanical components, degradation, multi-mechanism.
- Lognormal: ln(T) ~ N(μ, σ²). Two parameters. Increasing hazard that eventually decreases — degradation-driven failures (fatigue, corrosion). Used for crack-growth and corrosion-penetration modeling.

**Inherent vs operational vs mission reliability:**
- Inherent: set by design, measured in RDD; the ceiling.
- Operational: realized in field service; inherent ÷ k.
- Mission: probability of completing a specific mission M(t_m) = R(t_m); the operational quantity the customer experiences.`,
    practical_application: `- **Design reviews (RDD):** the reliability engineer presents R(t) and the bathtub phase for each critical failure mode; the review board approves the design only when R(t_m) ≥ target.
- **Mission planning (Operations):** dispatch decisions for aircraft, medical devices, and military systems depend on M(t_m) computed from the current operational λ.
- **Sparing pool sizing:** expected failures per period = λ × fleet operating hours; spares = expected failures + safety stock.
- **Maintenance-strategy selection (RCM):** the bathtub phase sets the strategy — burn-in (β<1), CBM/RTF (β=1), time-based PM (β>1).
- **Reliability allocation (Program):** the system R(t) target is decomposed into subsystem targets; each subsystem team designs to its allocated R(t).`,
    decision_scenario: `You are the CRE leading a design review for a Class II medical infusion pump. The pump has an inherent MTBF = 12,000 h (λ = 8.33e−5/h) per the supplier's qualification test. The mission profile is a 72-hour continuous infusion; the operational environment raises λ by 60% (k = 1.6, hospital environmental and handling severity). Compute the operational MTBF and the 72-hour mission reliability. If the target is ≥ 99.5% mission reliability, do you approve? If not, what design action (redundancy, derating, screening) closes the gap?`,
    practice_questions: `- **Q1 (Easy, Recall):** State the four parts of the ASQ/IEC reliability definition.
- **Q2 (Medium, Application):** Given λ = 0.002/h, compute R(200 h) and the 50-hour mission reliability.
- **Q3 (Medium, Understand):** For a Weibull distribution with β = 0.7, identify the bathtub phase and the appropriate maintenance strategy.
- **Q4 (Hard, Analyze):** A field MTBF of 8,000 h falls short of the inherent 12,000 h. Compute k and propose a closed-loop plan to close the gap.`,
    certification_questions: `- **CRE-style (Easy):** Which definition correctly captures the four-part reliability concept? (intended function + specified interval + stated conditions + probability).
- **CRE-style (Medium, Calculation):** A LRU has λ = 5 × 10⁻⁵/h. Compute the 10-hour mission reliability.
- **CRE-style (Hard, Analysis):** A field MTBF is 30% below the inherent rating. What is the environmental severity factor k, and what design or sustainment action does the closed loop suggest?`,
    summary: `Reliability is the probability that an item performs its intended function for a specified interval under stated conditions. Three flavors — inherent (design), operational (field), and mission (specific mission profile) — answer different engineering questions. The reliability function R(t) = P(T > t) is the mathematical core; for a constant failure rate it reduces to R(t) = exp(−λ·t), with MTTF = 1/λ and mission reliability M(t_m) = exp(−λ·t_m). The bathtub curve (infant, useful, wear-out) links the hazard shape (β < 1, β = 1, β > 1) to the maintenance strategy (burn-in, CBM/RTF, time-based PM). FMEA, RCM, and TPM operationalize the discipline across design, service, and operations, each referencing the shared R(t) vocabulary.`,
    key_takeaways: `- Reliability is a probability over time; never quote "reliability" without the interval and conditions.
- Inherent ≥ operational; mission reliability is the operational quantity the customer experiences.
- R(t) = exp(−λ·t) in the useful-life region; MTTF = MTBF = 1/λ; M(t_m) = exp(−λ·t_m).
- The bathtub phase (β) sets the maintenance strategy: burn-in, CBM/RTF, or time-based PM.
- FMEA (design) + RCM (service) + TPM (operations) are linked by the shared R(t) language.`,
    references: `- ASQ CRE Body of Knowledge — Certified Reliability Engineer.
- ISO 55000:2014 — Asset management — Overview, principles and terminology.
- Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 1 (Reliability Concepts), Ch. 3 (Exponential, Weibull), Ch. 6 (Bathtub curve).
- O'Connor & Kleyner (2012), Practical Reliability Engineering, Ch. 1 (Reliability Engineering), Ch. 2 (Reliability Mathematics).
- Smith (2021), Reliability, Maintainability and Risk, Ch. 1 (Reliability Concepts), Ch. 2 (Failure distributions).
- Mobley (2008), Maintenance Engineering Handbook, Section I (Reliability Concepts & Metrics).`,
  },
  knowledgeObject: {
    title: "Reliability Concepts & Terminology",
    domain: "Reliability Fundamentals",
    competency: "Reliability Concepts & Terminology",
    topic: "Reliability Fundamentals",
    concept: "Reliability function R(t) and the four-part reliability definition",
    body: {
      definitions: [
        "Reliability (ASQ/IEC 60300): the probability that an item performs its intended function for a specified interval under stated conditions — four parts: intended function, specified interval, stated conditions, probability.",
        "Inherent reliability: reliability determined by design and manufacture, under ideal conditions; the ceiling that operational reliability approaches.",
        "Operational reliability: reliability realized in actual service, including environmental severity, operator effects, maintenance quality, and logistics; inherent divided by the environmental severity factor k.",
        "Mission reliability: the probability of completing a specific mission profile M(t_m) = R(t_m); the operational quantity the customer experiences.",
        "Reliability function R(t) = P(T > t): the survival function, monotone non-increasing, with R(0) = 1 and R(∞) = 0.",
        "Failure distribution F(t) = 1 − R(t): the cumulative failure probability.",
        "Failure pdf f(t) = −dR/dt: the failure probability density.",
        "Failure rate / hazard h(t) = f(t)/R(t): the instantaneous failure rate, conditional on survival to time t.",
        "Bathtub curve: the three-phase hazard profile (infant mortality, useful life, wear-out).",
        "Useful life: the flat middle of the bathtub, where h(t) ≈ constant at λ.",
        "MTTF (mean time to failure, non-repairable); MTBF (mean time between failures, repairable steady-state); MTTR (mean time to repair).",
        "FMEA (failure modes and effects analysis); RCM (reliability-centered maintenance); TPM (total productive maintenance).",
        "Maintainability: the probability that an item is restored to operating condition within a specified time τ.",
      ],
      principles: [
        "Reliability is a probability over time, not a point value or a marketing claim.",
        "The four-part definition (function + interval + conditions + probability) is non-negotiable.",
        "Inherent reliability ≥ operational reliability; mission reliability is the operational quantity for the customer's mission profile.",
        "R(t) is monotone non-increasing; R(0) = 1; R(∞) = 0.",
        "For a constant failure rate (exponential): R(t) = exp(−λ·t); MTTF = MTBF = 1/λ.",
        "Mission reliability M(t_m) = exp(−λ·t_m) in the exponential model.",
        "The bathtub phase (β) sets the maintenance strategy: burn-in (β<1), CBM/RTF (β=1), time-based PM (β>1).",
        "FMEA (design) + RCM (service) + TPM (operations) are linked by the shared R(t) vocabulary.",
      ],
      components: [
        "Reliability block diagram (RBD) — series/parallel/k-of-n system model.",
        "Failure-mode taxonomy (ISO 14224 or FMEA/RCM code list).",
        "Failure-rate database (MIL-HDBK-217, FIDES, OREDA) — population λ by component class.",
        "Service-condition profile — environmental severity factor k = λ_op/λ_inherent.",
        "Mission profile — t_m for mission-reliability computation.",
        "Reliability test plan (DVP&R) — empirical validation of inherent R(t).",
        "Maintenance-strategy map (RCM/TPM) — sustaining program that closes inherent-to-operational.",
        "Field-failure-data capture (CMMS/FRACAS) — the closed loop that re-fits λ in service.",
      ],
      mechanism: [
        "Reliability engineering lifecycle: define function/conditions/mission → identify failure modes (FMEA) → acquire failure-rate data → compute R(t) → compare inherent vs operational → compute mission reliability → set maintenance strategy (RCM/TPM) → sustain and re-fit from field data (closed loop).",
      ],
      process: [
        "1. Define intended function, operating conditions, and mission interval.",
        "2. Identify failure modes (FMEA) and consequence of each.",
        "3. Acquire failure-rate data (database, test, field).",
        "4. Compute R(t) — exponential for constant λ, Weibull for shaped hazard.",
        "5. Compare inherent to operational; quantify k = λ_op/λ_inherent.",
        "6. Compute mission reliability M(t_m) for the customer's mission profile.",
        "7. Set the maintenance strategy from the bathtub phase (burn-in/CBM/PM/RTF).",
        "8. Sustain with RCM/TPM; re-fit R(t) from field data (closed loop).",
      ],
      formulas: [
        "R(t) = P(T > t) = exp(−λ·t) [exponential, constant failure rate].",
        "F(t) = 1 − R(t) = 1 − exp(−λ·t) [cumulative failure distribution].",
        "f(t) = λ·exp(−λ·t) [exponential pdf].",
        "h(t) = f(t)/R(t) = λ [constant hazard, useful-life region].",
        "MTTF = MTBF = 1/λ [exponential].",
        "Median life t_med = ln(2)/λ.",
        "Mission reliability M(t_m) = exp(−λ·t_m).",
        "Weibull R(t) = exp(−(t/η)^β); h(t) = (β/η)·(t/η)^(β−1); E[T] = η·Γ(1+1/β).",
        "Environmental severity factor k = λ_op/λ_inherent ≥ 1.",
      ],
      metrics: [
        "Reliability R(t) [dimensionless, 0..1] — survival probability to time t.",
        "Failure distribution F(t) [dimensionless, 0..1] — failure probability by time t.",
        "Failure rate λ [1/h] and hazard h(t) [1/h].",
        "MTTF [h] (non-repairable); MTBF [h] (repairable, steady state).",
        "Mission reliability M(t_m) [dimensionless].",
        "Environmental severity factor k [dimensionless] — gap between inherent and operational λ.",
        "Bathtub phase parameter β — infant (β<1), useful (β=1), wear-out (β>1).",
      ],
      examples: [
        "Servo amplifier λ=0.001/h: R(500)=0.6065; R(1000)=0.3679; MTTF=1000 h; M(8)=99.20%.",
        "Avionics LRU λ=4e−6/h: M(12)=99.995%; fleet of 50 aircraft × 4 LRUs × 8 flights/day × 365 days = 584,000 FH/year; expected failures 2.34/year.",
        "Medical infusion pump: inherent λ=8.33e−5/h; k=1.6 in hospital service; M(72)=exp(−8.33e−5×1.6×72)=99.04% (below target 99.5% — gap to close via redesign).",
        "Weibull wear-out (β=2.5, η=1500 h): R(1000)=69.56% — strategy shifts from CBM to time-based PM at 450–750 h.",
      ],
      industrial_examples: [
        "Aerospace — avionics LRU: inherent MTBF 250,000 h; k≈1.4 in field; expected field failures drive spares pool sizing.",
        "Medical Devices — infusion pump: inherent MTBF 12,000 h; k≈1.6 in hospital; mission reliability 72-h infusion drives approval.",
        "Industrial Automation — servo amplifier: constant-λ regime in useful life; CBM strategy; MTBF 100,000 h typical.",
        "Oil & Gas — subsea electronics: k=2.5+ for harsh subsea environment; redundancy and derating to close inherent-to-operational gap.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Regional airline operating 40 short-haul aircraft observed avionics bus-power-supply MTBF of 18,000 FH vs the supplier's inherent 35,000 h. RCA of 14 field returns: 8 thermal (capacitor), 4 vibration (solder fatigue), 2 ESD (handling). k = 35,000/18,000 ≈ 1.94, decomposed k_thermal ≈ 1.45, k_vib ≈ 1.25, k_handling ≈ 1.15. Targeted redesign (polymer tantalum capacitors 125°C, conformal coating, ESD training) closed the gap to k = 1.15 over 18 months (operational MTBF rose to 30,500 h). Closed loop: inherent R(t) → field failure data → RCA → redesign → operational R(t) → confirm. Method per Ebeling (2010, Ch. 1) and O'Connor (2012, Ch. 1).",
      ],
      common_errors: [
        "Reporting a 'reliability' number without specifying the time interval.",
        "Confusing inherent with operational reliability — comparing design rating to field MTBF without the severity factor k.",
        "Setting PM interval at MTBF for wear-out (β>1); R(MTBF) ≈ 0.37 — half failed before PM.",
        "Assuming the constant-λ model holds in wear-out; over-estimates R(t) at long times.",
        "Pooling multiple failure modes in one R(t) fit; composite distribution is misleading.",
        "Treating mission reliability and interval reliability as interchangeable.",
        "Omitting 'stated conditions' from the reliability statement; an MTBF without an operating environment is unverifiable.",
      ],
      limitations: [
        "Constant-λ (exponential) assumption holds only in useful life; under-estimates R(t) in wear-out, over-estimates in infant mortality.",
        "Weibull fit needs sufficient sample size (n ≥ 5); small samples produce wide β confidence intervals.",
        "Inherent λ from databases assumes representative operating context; severe-duty plants under-perform without being unreliable.",
        "Bathtub curve is a simplification; multi-modal hazards (mid-life bumps) are common in practice.",
        "Mission reliability computed from inherent λ over-estimates field reliability if k > 1 is not applied.",
        "'As-good-as-new' repair assumption (MTBF ≈ MTTF) fails for imperfect repair; repairable systems use NHPP.",
      ],
      best_practices: [
        "Always state R(t) with the time interval and operating conditions; 'R(500) = 0.99 at 25°C, MIL-STD-810 vibration profile' is a verifiable statement.",
        "Compute both inherent and operational R(t); quantify k explicitly to size the addressable reliability gap.",
        "Use the Weibull fit when the hazard is shaped; re-fit β after every redesign or strategy shift.",
        "Set PM intervals for β>1 at 0.30–0.50·η where R is 0.85–0.95, not at MTBF.",
        "Stratify R(t) by failure mode; do not pool mechanisms in one fit.",
        "Verify mission reliability M(t_m) ≥ target before design approval (CRE design review).",
        "Close the loop: inherent R(t) → field data → RCA → redesign/strategy shift → operational R(t) → confirm.",
      ],
      related_concepts: [
        "Reliability Metrics (Lesson 2) — MTBF/MTTR/availability operationalize R(t).",
        "Failure Modes & Effects (Lesson 3) — FMEA/FMECA operationalizes the failure-mode identification step.",
        "Reliability Program & Culture (Lesson 4) — DVP&R, allocation, and growth manage R(t) across the program lifecycle.",
        "ISO 55000:2014 — asset-management principles (value, alignment, leadership, assurance) frame the CRE's reliability-program work.",
        "IEC 60300 — Dependability management — the international standard that mirrors the ASQ CRE BOK foundations.",
      ],
      prerequisites: [
        "The 7-domain ASQ CRE BOK and the position of Reliability Fundamentals.",
        "Basic probability: distribution, mean, variance, CDF, pdf.",
        "Single-variable differential and integral calculus (dR/dt, ∫R(t)dt).",
        "Engineering design lifecycle (concept, design, production, service).",
        "Operating-context concepts: design intent, service conditions, mission profile.",
      ],
      references: [
        "ASQ CRE Body of Knowledge — Certified Reliability Engineer.",
        "ISO 55000:2014 — Asset management — Overview, principles and terminology.",
        "Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 1, 3, 6.",
        "O'Connor & Kleyner (2012), Practical Reliability Engineering, Ch. 1–2.",
        "Smith (2021), Reliability, Maintainability and Risk, Ch. 1–2.",
        "Mobley (2008), Maintenance Engineering Handbook, Section I.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Reliability Concepts & Terminology",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which of the following is the complete ASQ/IEC definition of reliability?",
      whyCorrect:
        "Reliability is the probability that an item performs its intended function for a specified interval under stated conditions — the four parts (intended function, specified interval, stated conditions, probability) are all required. Drop any one part and the term becomes a marketing slogan rather than an engineering quantity.",
      whyOthersWrong: [
        "Option A omits 'stated conditions' — an MTBF quoted without an operating environment is unverifiable.",
        "Option C omits 'probability' — reliability is a probability, not a guarantee or a binary state.",
        "Option D omits 'specified interval' — a 'reliability' number without a time is meaningless (R(1 h) and R(10,000 h) are vastly different quantities).",
      ],
      explanation:
        "Reliability = P(item performs intended function, for a specified interval, under stated conditions). All four parts are required.",
      options: [
        { text: "The probability that an item performs its intended function for a specified interval", isCorrect: false },
        { text: "The probability that an item performs its intended function for a specified interval under stated conditions", isCorrect: true },
        { text: "The state of an item performing its intended function for a specified interval under stated conditions", isCorrect: false },
        { text: "The probability that an item performs its intended function under stated conditions", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability Concepts & Terminology",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Aerospace",
      stem: "A servo amplifier has a constant failure rate λ = 0.001/h (useful-life region). Compute R(1,000 h) and the 8-hour mission reliability M(8).",
      whyCorrect:
        "R(t) = exp(−λ·t). R(1,000) = exp(−0.001 × 1,000) = exp(−1) = 0.3679 = 36.79%. The 8-hour mission reliability M(8) = exp(−0.001 × 8) = exp(−0.008) = 0.99203 ≈ 99.20%. The interval reliability (36.79% at 1,000 h) and the mission reliability (99.20% at 8 h) differ dramatically because the mission is short relative to MTTF (1,000 h) — exactly why mission reliability is the operational quantity the customer experiences.",
      whyOthersWrong: [
        "Option A (R=99.83%, M=99.20%) — R is computed as MTBF/(MTBF+1) by mistake; that is an availability formula misapplied to a survival probability.",
        "Option C (R=63.21%, M=99.20%) — R is computed as 1−exp(−1) = F(1,000), the failure distribution, not the survival function R(t).",
        "Option D (R=36.79%, M=92.31%) — M is computed as 1/MTBF×100 = 0.1% per hour × 8 = 0.8%, then 1−0.008 wrong direction or linearized; exponential mission reliability must use the exp form.",
      ],
      explanation:
        "R(t) = exp(−λ·t). R(1,000) = exp(−1) = 0.3679 = 36.79%. M(8) = exp(−0.008) = 0.99203 ≈ 99.20%. MTTF = 1/λ = 1,000 h; the short mission (8 h ≪ MTTF) yields high mission reliability even though the interval reliability is low.",
      options: [
        { text: "R(1,000) = 99.83%; M(8) = 99.20%", isCorrect: false },
        { text: "R(1,000) = 36.79%; M(8) = 99.20%", isCorrect: true },
        { text: "R(1,000) = 63.21%; M(8) = 99.20%", isCorrect: false },
        { text: "R(1,000) = 36.79%; M(8) = 92.31%", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability Concepts & Terminology",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      stem: "A 2-parameter Weibull fit to a component's failure data gives β = 2.5, η = 1,500 h. Which bathtub phase is the component in, and what is the appropriate maintenance strategy?",
      whyCorrect:
        "β = 2.5 > 1 means an increasing hazard rate (h(t) = (β/η)·(t/η)^(β−1) is increasing in t) — the component is in the wear-out phase of the bathtub curve. The right strategy is time-based preventive maintenance: set the PM interval at 0.30–0.50·η (≈450–750 h) where R(t) is still 0.85–0.95, not at MTBF (where R ≈ 0.37). Setting the PM at MTBF would have ~63% of the population already failed by the time of PM.",
      whyOthersWrong: [
        "Option A (infant mortality, burn-in) is wrong — β<1 indicates infant mortality; β=2.5 is well into the wear-out regime (β>1).",
        "Option C (useful life, CBM/RTF) is wrong — β=1 indicates useful life with constant hazard; β=2.5 has an increasing hazard where CBM alone misses the wear-out mechanism before it dominates.",
        "Option D (random failures, redundancy) is wrong — random failures correspond to β=1 (constant hazard); β=2.5 is wear-out, addressed by time-based PM, not by redundancy.",
      ],
      explanation:
        "Bathtub phase from β: β<1 infant mortality (burn-in/screening); β=1 useful life (CBM/RTF); β>1 wear-out (time-based PM at 0.30–0.50·η). β=2.5 ⇒ wear-out ⇒ time-based PM at ~450–750 h where R is 0.85–0.95.",
      options: [
        { text: "Infant mortality — apply burn-in and supplier screening", isCorrect: false },
        { text: "Wear-out (β>1) — set time-based PM at 0.30–0.50·η = 450–750 h where R is 0.85–0.95", isCorrect: true },
        { text: "Useful life (β=1) — apply CBM or run-to-failure with spares", isCorrect: false },
        { text: "Random failures — apply redundancy (1oo2 or 2oo3)", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability Concepts & Terminology",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: 'Reliability' and 'quality' are interchangeable terms — both refer to whether an item conforms to specification.",
      whyCorrect:
        "False. Quality is conformance to specification at a point in time (the moment of inspection or delivery). Reliability is the probability that an item performs its intended function for a specified interval under stated conditions — explicitly a probability over time. A high-quality item (conforms at delivery) can be unreliable (degrades quickly); a reliable item may have minor cosmetic quality defects that do not affect function. The two terms describe different engineering quantities and are not interchangeable.",
      whyOthersWrong: [
        "True — the candidate would miss that reliability is a probability over time, while quality is a point-in-time conformance. Conflating them obscures the time-dependence that drives reliability-engineering decisions (PM intervals, mission reliability, redundancy).",
      ],
      explanation:
        "Quality = conformance at a point in time. Reliability = probability of performance over a specified interval under stated conditions. They are related (poor quality drives infant mortality) but they are not interchangeable terms.",
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Reliability Metrics (MTBF/MTTR/Availability)
// (Competency: "Reliability Metrics (MTBF/MTTR/Availability)"; slug: rf-reliability-metrics)
// ---------------------------------------------------------------------------

const LESSON_RELIABILITY_METRICS: RefLesson = {
  competencyName: "Reliability Metrics (MTBF/MTTR/Availability)",
  slug: "rf-reliability-metrics",
  title: "Reliability Metrics — MTBF, MTTR & Availability",
  titleAr: "مقاييس الموثوقية — MTBF وMTTR والتوفّرية",
  order: 2,
  durationMin: 32,
  references: RF_REFERENCE_TITLES,
  conceptIntroduction: `Reliability metrics convert the survival function R(t) into operationally useful point estimates that drive maintenance, design, and asset-management decisions. Three metrics dominate: MTBF (mean time between failures, for repairable items in steady state), MTTR (mean time to repair, the maintainability companion), and availability (the long-run fraction of time the item is able to operate). Availability splits into three flavors — inherent (excludes planned downtime), achieved (includes preventive maintenance time), and operational (includes all sources of downtime: corrective + preventive + logistics + admin + scheduling). The failure rate λ = 1/MTBF ties the metrics back to the exponential R(t) = exp(−λ·t). These metrics are the lingua franca of the CRE: a maintenance KPI dashboard, a design-allocation table, and a life-cycle-cost model all speak in MTBF, MTTR, and availability.`,
  example: `A Chemical plant centrifugal pump (P-301, acid service) has 5 failure events over 24 months. Failure times (operating hours from one failure to the next): 1,200, 1,800, 2,400, 3,600, 5,000 h. Repair times (active): 4.5, 3.8, 5.2, 4.1, 6.4 h. MTBF = Σt/n = (1,200+1,800+2,400+3,600+5,000)/5 = 14,000/5 = 2,800 h. MTTR = Στ/n = 24.0/5 = 4.8 h. Failure rate λ = 1/MTBF = 3.571 × 10⁻⁴ failures/h. Inherent availability A_i = MTBF/(MTBF+MTTR) = 2,800/(2,800+4.8) = 0.99829 = 99.829%. Achieved availability (add 8 h of PM per 2,800-h cycle) = 2,800/(2,800+4.8+8.0) = 0.99544 = 99.544%. Operational availability (add 18 h of logistics + admin + scheduling delay per cycle) = 2,800/(2,800+4.8+8.0+18.0) = 2,800/2,830.8 = 0.98912 = 98.912%. The 1.0-percentage-point gap between inherent (99.83%) and operational (98.91%) is the addressable downtime opportunity.`,
  keyFormulas: `MTBF = Σt_i / n [h, point estimate, repairable steady-state]
MTTF = 1/λ (non-repairable, exponential); MTBF = 1/λ (repairable, steady state)
MTTR = Στ_i / n [h, active repair time only]
Failure rate λ = 1/MTBF [1/h]
Inherent availability A_i = MTBF / (MTBF + MTTR) — excludes planned downtime
Achieved availability A_a = MTBF / (MTBF + MTTR + MPM) where MPM = mean preventive-maintenance time per cycle
Operational availability A_o = MTBF / (MTBF + MDT) where MDT = MTTR + MPM + logistics + admin + scheduling delay
Mission reliability (constant λ): M(t_m) = exp(−λ·t_m)
Reliability over mission with repair: R_mission(t_m) = exp(−λ·t_m) × (1 + λ·MDT) ≈ exp(−λ·t_m) for t_m ≪ MTBF
Failure cost per cycle FC = downtime_h × $/h + parts + labor + collateral
Downtime-h per year = (MTBF failures/yr) × MDT = (operating_h/yr / MTBF) × MDT`,
  exercise: `You are the reliability engineer at a Power plant. A boiler feedwater pump (P-BFP-01) has 8 failures over 24 months at operating-hour intervals: 1,200, 2,100, 3,300, 4,600, 6,200, 7,800, 9,500, 11,200 h. Active repair times averaged 12 h each. Operating hours in 24 months ≈ 16,000 h. (a) Compute MTBF, MTTR, λ, and inherent availability. (b) If PM time per cycle is 6 h, logistics + admin + scheduling add 24 h, compute achieved and operational availability. (c) Production loss is $4,800/h; what is the annual downtime cost? (d) A bearing upgrade costing $40k lifts MTBF to 12,000 h. What is the payback period and the new operational availability?`,
  sections: {
    learning_objectives: `- Compute MTBF, MTTF, MTTR, and the failure rate λ from a CMMS failure-time extract.
- Distinguish inherent, achieved, and operational availability; identify the downtime components each excludes/includes.
- Compute all three availability metrics from failure-time and downtime data; interpret the gap between them.
- Apply λ = 1/MTBF in the exponential reliability function R(t) = exp(−λ·t) and the mission reliability M(t_m) = exp(−λ·t_m).
- Size the addressable downtime opportunity (inherent-to-operational gap) and translate it into annual cost.
- Connect reliability metrics to ISO 55000 asset-management KPIs (asset availability, asset performance) and the asset-management plan (ISO 55001 Cl. 7.2).`,
    prerequisites: `- Lesson 1 (Reliability Concepts & Terminology) — R(t), exponential/Weibull, bathtub curve.
- CMMS basics: work-order lifecycle, asset hierarchy, failure-code capture.
- Operating-time accounting: calendar time vs operating time vs uptime vs downtime.
- Basic algebra and arithmetic means (point estimates from failure-time samples).`,
    introduction: `Reliability metrics convert the survival function R(t) into operationally useful point estimates. The CRE BOK Fundamentals lesson on metrics establishes the three core quantities — MTBF (mean time between failures, repairable items in steady state), MTTR (mean time to repair, the maintainability companion), and availability (the long-run fraction of time the item is able to operate). These are the lingua franca of reliability engineering: every maintenance KPI dashboard, design-allocation table, and life-cycle-cost model speaks in these terms.

The three metrics are linked by the failure rate λ = 1/MTBF in the constant-λ regime. MTBF is the reciprocal of λ for repairable items in steady state. MTTR is the maintainability companion, the active-repair-time mean. Availability is the ratio that combines the two: A = MTBF/(MTBF + MTTR). When the maintenance organization adds planned downtime (preventive maintenance) and unplanned logistics/admin/scheduling delays, availability splits into three flavors: inherent (excludes planned), achieved (includes preventive), and operational (includes all sources of downtime).

The CRE candidate must be able to compute each metric from a CMMS extract, identify which downtime components belong to which availability formula, and translate the gap between inherent and operational availability into the addressable downtime opportunity — the dollar figure that funds reliability-improvement capex. ISO 55000 asset-management KPIs (asset availability, asset performance, value-of-asset-management) and ISO 55001 Clause 7.2 (asset-management plan informed by reliability analytics) operationalize these metrics at the asset-management level.`,
    terminology: `- **MTBF**: mean time between failures (h) — point estimate from a sample of failure intervals, repairable items in steady state.
- **MTTF**: mean time to failure (h) — non-repairable items (one failure per item).
- **MTTR**: mean time to repair (h) — active repair time only, excluding logistics and admin.
- **MTBM**: mean time between maintenance (corrective + preventive).
- **MDT**: mean downtime (h) — total downtime per failure, including MTTR, preventive time, logistics, admin, and scheduling delay.
- **MPM**: mean preventive-maintenance time per cycle (h).
- **Failure rate λ**: instantaneous failure rate (1/h) — λ = 1/MTBF in steady state.
- **Inherent availability A_i**: MTBF/(MTBF + MTTR) — excludes planned downtime.
- **Achieved availability A_a**: MTBF/(MTBF + MTTR + MPM) — includes preventive maintenance.
- **Operational availability A_o**: MTBF/(MTBF + MDT) — includes all downtime sources.
- **Mission reliability M(t_m)**: probability of completing a mission of duration t_m.
- **Uptime ratio**: long-run fraction of time the item is able to operate (≈ A_o).`,
    detailed_explanation: `The three core metrics are computed as sample means from a CMMS extract. MTBF = Σt_i/n where t_i are the operating-hour intervals between consecutive failures of the same asset (or asset class) and n is the count of failures. MTTR = Στ_i/n where τ_i are the active-repair times captured at work-order closeout. Failure rate λ = 1/MTBF in the constant-λ regime, which is the useful-life region of the bathtub curve.

Three availability formulas express the same underlying ratio with different downtime denominators:

  Inherent availability: A_i = MTBF / (MTBF + MTTR)
  Achieved availability: A_a = MTBF / (MTBF + MTTR + MPM)
  Operational availability: A_o = MTBF / (MTBF + MDT)

where MDT = MTTR + MPM + logistics + admin + scheduling delay. The denominator grows from MTBF + MTTR (inherent, the design's ceiling) to MTBF + MTTR + MPM (achieved, with the maintenance program's planned downtime) to MTBF + MDT (operational, with all real-world delays). A_i ≥ A_a ≥ A_o; the gap between A_i and A_o is the addressable downtime opportunity.

Each gap has a different lever. The A_i → A_a gap is closed by optimizing the PM program (reduce PM time, or shift from time-based PM to condition-based). The A_a → A_o gap is closed by reducing logistics delay (spares availability, crew response time), admin delay (work-order approval flow), and scheduling delay (waiting for an outage window). The maintenance function controls MTTR; logistics/scheduling/planning controls the rest of MDT.

The relationship to R(t) is via λ = 1/MTBF. With the failure rate, the reliability function is R(t) = exp(−λ·t) in the exponential (constant-λ) model, and the mission reliability is M(t_m) = exp(−λ·t_m). For an asset with MTBF = 2,800 h, λ = 3.571 × 10⁻⁴/h; the 100-hour mission reliability is M(100) = exp(−0.0357) = 0.9649 = 96.49%, and the 1,000-hour reliability is R(1,000) = exp(−0.357) = 0.700 = 70.0%. The link from MTBF → λ → R(t) → mission reliability is the operational chain the CRE must master.

The downtime-cost arithmetic is straightforward: downtime-h per year = (operating-h per year / MTBF) × MDT. If the asset operates 8,000 h/yr, MTBF = 2,800 h, MDT = 30.8 h: downtime-h per year = (8,000/2,800) × 30.8 = 2.857 × 30.8 = 88 h/yr. At $4,800/h production loss, annual downtime cost = 88 × $4,800 = $422,400/year. If a $40k bearing upgrade lifts MTBF to 12,000 h, the new downtime-h per year = (8,000/12,000) × 30.8 = 0.667 × 30.8 = 20.5 h/yr; annual cost = 20.5 × $4,800 = $98,400; annual savings = $422,400 − $98,400 = $324,000; payback = $40,000/$324,000 = 0.12 years ≈ 1.5 months. The new A_o = 12,000/(12,000 + 30.8) = 0.99744 = 99.744% (vs. 98.91% before).

ISO 55000 asset management operationalizes these metrics at the asset-management level. Asset availability (a KPI in ISO 55000 §2.5.2) is the operational availability A_o. The asset-management plan (ISO 55001 Cl. 7.2.2) is the document that consumes reliability analytics — MTBF trends, Pareto of downtime cost, availability by asset class — and translates them into capex, training, and operational decisions. The management review (Cl. 9.3) is where the steering committee reviews the asset-management KPI dashboard and approves the next investment cycle.`,
    core_principles: `- MTBF, MTTR, and availability are sample-mean point estimates computed from a CMMS failure-time extract.
- The failure rate λ = 1/MTBF ties metrics to R(t) and mission reliability via the exponential model.
- Availability splits into inherent (excludes planned), achieved (includes PM), and operational (includes all downtime).
- A_i ≥ A_a ≥ A_o; the gap between them is the addressable downtime opportunity.
- Different gaps have different levers: design (A_i), PM program (A_i→A_a), logistics/scheduling (A_a→A_o).
- Reliability metrics are the lingua franca of the CRE: design allocation, maintenance KPI, life-cycle cost all speak in MTBF/MTTR/availability.`,
    components: `- CMMS work-order extract (failure times, repair times, downtime timestamps).
- Failure-rate database (OREDA, MIL-HDBK-217, FIDES) for population λ by component class.
- Maintenance KPI dashboard (MTBF trend, MTTR trend, A_o trend, downtime cost Pareto).
- Reliability-allocation table (system target → subsystem MTBF/MTTR targets).
- Life-cycle cost model (capex + opex + downtime cost over the asset life).
- Asset-management plan (ISO 55001 Cl. 7.2.2) — the consumer of reliability metrics.
- Downtime-cost register — the dollar rates ($/h) that convert downtime-h to dollars.`,
    process: `1. Extract CMMS failure history (≥24 months for stable estimates).
2. Filter by valid ISO-14224 failure code; reject uncoded work orders.
3. Compute MTBF = Σt_i/n, MTTR = Στ_i/n, λ = 1/MTBF.
4. Compute A_i = MTBF/(MTBF+MTTR); A_a with PM time; A_o with full MDT.
5. Quantify the gap A_i − A_o; decompose into design, PM, logistics, scheduling components.
6. Convert downtime-h per year to dollars using the downtime-cost register.
7. Compute mission reliability M(t_m) = exp(−λ·t_m) for the customer's mission profile.
8. Feed the metrics into the asset-management plan (ISO 55001 Cl. 7.2) and management review (Cl. 9.3).
9. Refresh the dashboard monthly; re-fit annually; close the loop on capex with post-implementation trend.`,
    formula_calculation: `Variables and units:
- t_i: operating-hour interval between failures i−1 and i [h]
- τ_i: active repair time for failure i [h]
- n: number of failures in the period [count]
- MTBF = Σt_i/n [h]; MTTF = 1/λ (non-repairable); MTBF = 1/λ (steady state)
- λ = 1/MTBF [1/h]
- MTTR = Στ_i/n [h]
- MPM: mean preventive-maintenance time per cycle [h]
- MDT = MTTR + MPM + logistics + admin + scheduling delay [h]

Availability formulas:
- Inherent availability: A_i = MTBF / (MTBF + MTTR)
- Achieved availability: A_a = MTBF / (MTBF + MTTR + MPM)
- Operational availability: A_o = MTBF / (MTBF + MDT)

Mission reliability (constant-λ): M(t_m) = exp(−λ·t_m) = exp(−t_m/MTBF)

Downtime arithmetic:
- Downtime-h per year = (operating_h_per_year / MTBF) × MDT
- Annual downtime cost = downtime-h per year × $/h

Units: time in hours (h); λ in 1/h; availabilities dimensionless [0,1] reported as %.

Assumptions: (i) constant-λ regime (useful life); (ii) repairable to "as-good-as-new" for MTBF ≈ MTTF; (iii) the MDT components are independent and additive; (iv) the asset operates a known number of hours per year.

Interpretation: MTBF is the mean interval between failures (a point estimate); MTTR is the mean active repair time; availability is the long-run fraction of operating time. A 99% operational availability on a 8,000-h/yr asset means 80 h/yr downtime — the dollar figure that funds reliability-improvement capex.`,
    worked_example: `**Centrifugal pump P-301 (Chemical, acid service).**
Given: 5 failures at operating-hour intervals 1,200, 1,800, 2,400, 3,600, 5,000 h. Active repair times 4.5, 3.8, 5.2, 4.1, 6.4 h. PM time per 2,800-h cycle = 8 h. Logistics + admin + scheduling delay = 18 h per cycle.

Compute:
- MTBF = (1,200 + 1,800 + 2,400 + 3,600 + 5,000) / 5 = 14,000/5 = 2,800 h
- MTTR = (4.5 + 3.8 + 5.2 + 4.1 + 6.4) / 5 = 24.0/5 = 4.8 h
- λ = 1/MTBF = 1/2,800 = 3.571 × 10⁻⁴ failures/h
- A_i = 2,800 / (2,800 + 4.8) = 2,800/2,804.8 = 0.99829 = 99.829%
- A_a = 2,800 / (2,800 + 4.8 + 8.0) = 2,800/2,812.8 = 0.99544 = 99.544%
- A_o = 2,800 / (2,800 + 4.8 + 8.0 + 18.0) = 2,800/2,830.8 = 0.98912 = 98.912%
- Addressable gap A_i − A_o = 99.829% − 98.912% = 0.917 percentage points

**Mission reliability.**
- M(100 h) = exp(−3.571e−4 × 100) = exp(−0.0357) = 0.9649 = 96.49%
- M(500 h) = exp(−0.1786) = 0.8364 = 83.64%
- R(2,800 h) = exp(−1) = 0.3679 = 36.79% (at MTBF, R = 1/e ≈ 0.37)

**Annual downtime cost.**
- Operating hours/year = 8,000 h
- Failures/year = 8,000 / 2,800 = 2.857
- Downtime-h/year = 2.857 × MDT = 2.857 × 30.8 = 88.0 h
- At $4,800/h production loss: annual downtime cost = 88 × $4,800 = $422,400/year

**Bearing-upgrade capex.**
- New MTBF = 12,000 h; new λ = 8.333 × 10⁻⁵ /h
- New failures/year = 8,000/12,000 = 0.667
- New downtime-h/year = 0.667 × 30.8 = 20.5 h
- New annual cost = 20.5 × $4,800 = $98,400/year
- Annual savings = $422,400 − $98,400 = $324,000/year
- Payback = $40,000 capex / $324,000/yr = 0.123 years ≈ 1.5 months
- New A_o = 12,000/(12,000 + 30.8) = 0.99744 = 99.744%`,
    industrial_example: `**Oil & Gas (offshore gas compressor).** A centrifugal gas compressor on an offshore platform had 6 unscheduled shutdowns in 12 months at intervals 1,800, 2,400, 3,000, 3,600, 4,200, 5,000 operating hours. Active repair (mechanical) times: 36, 48, 30, 42, 24, 54 h. Logistics delay (parts helicopter, crew mobilization): 96 h average. MTBF = 18,000/6 = 3,000 h; MTTR = 234/6 = 39 h; MDT = 39 + 96 = 135 h; A_o = 3,000/(3,000 + 135) = 0.9569 = 95.69%. Production loss: $32,000/h of deferred gas. Annual downtime-h = (8,000/3,000) × 135 = 360 h; annual cost = 360 × $32,000 = $11.52M/year. Spares pre-positioning on the platform cuts logistics delay from 96 h to 24 h: MDT = 39 + 24 = 63 h; A_o = 3,000/3,063 = 0.9794 = 97.94%; new downtime-h = (8,000/3,000) × 63 = 168 h; new cost = $5.38M/year; savings = $6.14M/year on a $400k spares investment — payback 0.065 years (~3 weeks).`,
    case_study: `CASE_TYPE = SYNTHETIC. A Container Terminal operating 8 ship-to-shore (STS) cranes observed availability A_o = 94.2% on its main hoist drives — below the 96% target. CMMS extract over 24 months: 14 failures, MTBF = 1,400 h, MTTR = 18 h, MPM = 4 h, logistics + admin + scheduling delay = 42 h. A_i = 1,400/(1,400 + 18) = 98.73%; A_a = 1,400/(1,400 + 18 + 4) = 98.45%; A_o = 1,400/(1,400 + 18 + 4 + 42) = 1,400/1,464 = 95.63%. The gap A_a − A_o = 2.82 percentage points (worth $1.8M/year in deferred container moves) was driven by spares unavailability (drive bearings sourced from a 4-week-away depot) and crew callout delay (off-shift coverage). Pre-positioning bearings at the terminal ($80k) and a 24/7 on-call crew ($120k/yr) cut logistics + admin + scheduling delay from 42 h to 9 h: A_o = 1,400/(1,400 + 18 + 4 + 9) = 1,400/1,431 = 97.83%, exceeding the 96% target. Payback = $200k / $1.8M = 0.11 years. Closed loop: CMMS extract → MTBF/MTTR/availability → gap decomposition → capex → operational availability → confirm. Method per Ebeling (2010, Ch. 2) and Smith (2021, Ch. 2).`,
    visual_explanation: `Availability waterfall: a horizontal stacked bar that decomposes the asset's time into operating (uptime), active repair (MTTR), preventive maintenance (MPM), logistics delay, admin delay, and scheduling delay. The cumulative uptime fraction is A_o. Trimming the right-hand segments (logistics, admin, scheduling) closes the A_a→A_o gap; trimming PM time closes the A_i→A_a gap; raising MTBF grows the operating segment from the left. Plot A_i, A_a, A_o as three bars of decreasing height — the gaps visualize the addressable downtime opportunity.`,
    simulation_opportunity: `An interactive simulation could let the learner input failure times, repair times, PM time, and logistics delay; the engine computes MTBF, MTTR, A_i, A_a, A_o, mission reliability, and annual downtime cost in real time. A second panel could vary MTBF (slider) and show the exponential improvement in A_o, downtime-h, and downtime cost — visualizing why raising MTBF is the lever that funds reliability capex.`,
    common_mistakes: `- Computing MTBF over wrong denominator — counting work orders (not failure events) or dividing by operating hours (not failures).
- Reporting "availability" without specifying inherent vs achieved vs operational — the three differ by 1-2 percentage points, a $1-2M/year gap on a $4k/h asset.
- Including planned downtime (PM) in MTBF; MTBF counts only failures, not maintenance events.
- Including logistics/admin/scheduling in MTTR; MTTR is active repair time only.
- Assuming A_i = A_a = A_o; the gaps are where the addressable downtime opportunity lives.
- Using MTBF for non-repairable items (use MTTF); for one-shot items, MTBF is meaningless.
- Setting capex payback only on MTBF improvement without including the MDT reduction (both levers fund the upgrade).`,
    limitations: `- MTBF is a point estimate; small samples (n < 5) yield wide confidence intervals.
- The constant-λ assumption (MTBF ≈ 1/λ) holds only in the useful-life region; in wear-out, MTBF is a poor summary statistic.
- A_o assumes the asset operates a known number of hours per year; variable utilization corrupts the metric.
- MDT components are not always independent (logistics delay may correlate with failure mode); additive formula is an approximation.
- ISO 14224 failure-code quality drives the arithmetic; uncoded work orders bias MTBF and MTTR.
- Repairable systems with imperfect repair do not satisfy "as-good-as-new"; use NHPP for trend.`,
    comparison: `**Inherent vs Achieved vs Operational availability:**
- Inherent (A_i): design's ceiling; denominator = MTBF + MTTR. The reliability+maintainability ceiling set by design.
- Achieved (A_a): the maintenance program's reality; denominator = MTBF + MTTR + MPM. Adds planned downtime.
- Operational (A_o): the field's reality; denominator = MTBF + MDT (all downtime). The KPI the customer/operator experiences.

**MTBF vs MTTF:**
- MTBF: repairable items, steady state, multiple failures per item (e.g., pumps, motors, compressors).
- MTTF: non-repairable items, one failure per item (e.g., light bulbs, single-use batteries, microchips).

**Mission reliability vs interval reliability:**
- Interval reliability R(t): probability of surviving to time t (long horizon).
- Mission reliability M(t_m): probability of completing a specific mission (short horizon, the operational quantity the customer experiences).`,
    practical_application: `- **Maintenance KPI dashboard:** monthly MTBF trend, MTTR trend, A_o by asset class; the dashboard that drives the maintenance-reliability steering committee.
- **Design allocation:** the system A_o target is decomposed into subsystem MTBF/MTTR targets; each subsystem team designs to its allocation.
- **Life-cycle cost (LCC):** capex + opex + downtime cost over the asset life — downtime cost is computed from MTBF, MDT, and $/h.
- **Capex justification:** the payback period = capex / (annual downtime cost savings) — the figure that funds reliability improvement.
- **Asset-management plan (ISO 55001 Cl. 7.2):** the document that consumes reliability analytics and translates them into investment decisions.`,
    decision_scenario: `You are the CRE at a Power plant reviewing the boiler feedwater pump fleet (4 × 350-MW units, 8 pumps). Average MTBF = 2,800 h, MTTR = 12 h, MPM = 6 h, logistics + admin + scheduling delay = 24 h. Production loss = $4,800/h. Operating hours/year = 8,000. Option A: $40k bearing upgrade lifts MTBF to 12,000 h (no MDT change). Option B: $25k spares pre-positioning + 24/7 on-call crew cuts logistics + admin + scheduling delay from 24 h to 4 h (no MTBF change). Which option delivers the better first-year ROI, and which one would you fund first if budget is constrained to one option?`,
    practice_questions: `- **Q1 (Easy, Recall):** Define MTBF, MTTR, and inherent availability; state the formula for each.
- **Q2 (Medium, Calculation):** Given failure intervals 1,000, 1,500, 2,500, 3,000 h and repair times 5, 7, 4, 6 h, compute MTBF, MTTR, and A_i.
- **Q3 (Medium, Understand):** Why does A_i ≥ A_a ≥ A_o? Identify which downtime component each gap quantifies.
- **Q4 (Hard, Analyze):** For an asset with MTBF = 5,000 h, MDT = 50 h, $5,000/h production loss, 8,000 h/yr operating: compute annual downtime cost. If a $100k capex lifts MTBF to 15,000 h, what is the payback?`,
    certification_questions: `- **CRE-style (Easy):** Which availability formula excludes planned preventive-maintenance downtime? (A_i = MTBF/(MTBF+MTTR)).
- **CRE-style (Medium, Calculation):** Compute A_o given MTBF = 4,000 h, MTTR = 8 h, MPM = 4 h, logistics + admin + scheduling delay = 30 h.
- **CRE-style (Hard, Analysis):** A 99.0% operational availability on a $10k/h asset translates to how many downtime-h per year (8,000 h/yr operation), and what annual cost?`,
    summary: `Reliability metrics convert R(t) into point estimates that drive maintenance, design, and asset-management decisions. MTBF = Σt/n (repairable, steady state), MTTR = Στ/n (active repair), λ = 1/MTBF, and availability splits into inherent A_i = MTBF/(MTBF+MTTR), achieved A_a (adds PM), and operational A_o (adds full MDT). A_i ≥ A_a ≥ A_o; the gaps decompose the addressable downtime opportunity into design, PM, and logistics levers. Mission reliability M(t_m) = exp(−λ·t_m) ties the metrics back to R(t). Downtime cost = (operating_h/MTBF) × MDT × $/h funds reliability-improvement capex; ISO 55001 Cl. 7.2 consumes these metrics in the asset-management plan.`,
    key_takeaways: `- MTBF, MTTR, availability are point estimates from CMMS extracts.
- λ = 1/MTBF ties metrics to R(t) = exp(−λ·t) and M(t_m) = exp(−λ·t_m).
- A_i (design) ≥ A_a (PM) ≥ A_o (field); the gaps decompose the addressable downtime opportunity.
- Annual downtime cost = (operating_h/MTBF) × MDT × $/h — the dollar figure that funds reliability capex.
- ISO 55001 Cl. 7.2 consumes reliability metrics in the asset-management plan; Cl. 9.3 reviews them.`,
    references: `- ASQ CRE Body of Knowledge — Certified Reliability Engineer.
- ISO 55000:2014 — Asset management — Overview, principles and terminology.
- Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 2 (Reliability Metrics), Ch. 8 (Availability).
- O'Connor & Kleyner (2012), Practical Reliability Engineering, Ch. 3 (Reliability Metrics), Ch. 14 (Maintenance & Availability).
- Smith (2021), Reliability, Maintainability and Risk, Ch. 2 (Failure Distribution & Metrics).
- Mobley (2008), Maintenance Engineering Handbook, Section I (Reliability Metrics).`,
  },
  knowledgeObject: {
    title: "Reliability Metrics — MTBF, MTTR & Availability",
    domain: "Reliability Fundamentals",
    competency: "Reliability Metrics (MTBF/MTTR/Availability)",
    topic: "Reliability Fundamentals",
    concept: "MTBF, MTTR, and the three availabilities (inherent/achieved/operational)",
    body: {
      definitions: [
        "MTBF: mean time between failures (h), point estimate Σt_i/n for repairable items in steady state.",
        "MTTF: mean time to failure (h) for non-repairable items (one failure per item).",
        "MTTR: mean time to repair (h), active repair time only, excluding logistics and admin.",
        "MTBM: mean time between maintenance (corrective + preventive).",
        "MDT: mean downtime (h), total downtime per failure including MTTR, preventive time, logistics, admin, and scheduling delay.",
        "MPM: mean preventive-maintenance time per cycle (h).",
        "Failure rate λ: 1/MTBF [1/h] in the constant-λ regime.",
        "Inherent availability A_i = MTBF/(MTBF + MTTR) — excludes planned downtime.",
        "Achieved availability A_a = MTBF/(MTBF + MTTR + MPM) — includes preventive maintenance time.",
        "Operational availability A_o = MTBF/(MTBF + MDT) — includes all sources of downtime.",
        "Mission reliability M(t_m) = exp(−λ·t_m) — probability of completing a mission of duration t_m.",
        "Uptime ratio: long-run fraction of time the item is able to operate (≈ A_o).",
      ],
      principles: [
        "MTBF, MTTR, and availability are sample-mean point estimates computed from CMMS failure-time extracts.",
        "The failure rate λ = 1/MTBF ties metrics to R(t) and mission reliability via the exponential model.",
        "Availability splits into inherent (design's ceiling), achieved (PM program), and operational (field reality).",
        "A_i ≥ A_a ≥ A_o; the gap between them is the addressable downtime opportunity.",
        "Different gaps have different levers: design (A_i), PM program (A_i→A_a), logistics/scheduling (A_a→A_o).",
        "Annual downtime cost = (operating_h/MTBF) × MDT × $/h — the dollar figure that funds reliability capex.",
      ],
      components: [
        "CMMS work-order extract (failure times, repair times, downtime timestamps).",
        "Failure-rate database (OREDA, MIL-HDBK-217, FIDES) — population λ by component class.",
        "Maintenance KPI dashboard (MTBF trend, MTTR trend, A_o trend, downtime cost Pareto).",
        "Reliability-allocation table (system target → subsystem MTBF/MTTR targets).",
        "Life-cycle cost model (capex + opex + downtime cost over the asset life).",
        "Asset-management plan (ISO 55001 Cl. 7.2.2).",
        "Downtime-cost register — $/h rates for downtime-to-dollars conversion.",
      ],
      mechanism: [
        "Reliability-metrics lifecycle: CMMS extract → filter valid ISO-14224 codes → compute MTBF/MTTR/λ → compute A_i, A_a, A_o → decompose gap → convert to downtime cost → feed asset-management plan → close loop on capex with post-implementation trend.",
      ],
      process: [
        "1. Extract CMMS failure history (≥24 months).",
        "2. Filter by valid ISO-14224 failure code; reject uncoded work orders.",
        "3. Compute MTBF = Σt_i/n, MTTR = Στ_i/n, λ = 1/MTBF.",
        "4. Compute A_i = MTBF/(MTBF+MTTR); A_a with MPM; A_o with full MDT.",
        "5. Quantify gap A_i − A_o; decompose into design, PM, logistics, scheduling.",
        "6. Convert downtime-h per year to dollars using the downtime-cost register.",
        "7. Compute mission reliability M(t_m) = exp(−λ·t_m).",
        "8. Feed metrics into the asset-management plan (ISO 55001 Cl. 7.2) and management review (Cl. 9.3).",
        "9. Refresh dashboard monthly; re-fit annually; close the loop on capex with post-implementation trend.",
      ],
      formulas: [
        "MTBF = Σt_i/n [h, point estimate].",
        "MTTF = 1/λ (non-repairable); MTBF = 1/λ (steady state).",
        "MTTR = Στ_i/n [h, active repair time only].",
        "λ = 1/MTBF [1/h].",
        "A_i = MTBF/(MTBF + MTTR).",
        "A_a = MTBF/(MTBF + MTTR + MPM).",
        "A_o = MTBF/(MTBF + MDT) where MDT = MTTR + MPM + logistics + admin + scheduling delay.",
        "M(t_m) = exp(−λ·t_m) = exp(−t_m/MTBF).",
        "Downtime-h/yr = (operating_h/yr / MTBF) × MDT.",
        "Annual downtime cost = downtime-h/yr × $/h.",
      ],
      metrics: [
        "MTBF [h] by asset class and by failure mode.",
        "MTTR [h] by failure class.",
        "Inherent availability A_i [%] (excludes planned downtime).",
        "Achieved availability A_a [%] (includes PM).",
        "Operational availability A_o [%] (includes all downtime).",
        "Failure rate λ [1/h].",
        "Mission reliability M(t_m) [%].",
        "Annual downtime-h and downtime cost [$/yr].",
        "Capex payback period [yr].",
      ],
      examples: [
        "Pump P-301: 5 failures at 1200/1800/2400/3600/5000 h; repair times 4.5/3.8/5.2/4.1/6.4 h; MTBF=2800 h, MTTR=4.8 h, λ=3.571e−4/h; A_i=99.83%, A_a=99.54%, A_o=98.91% (with PM 8 h + logistics 18 h).",
        "Boiler feedwater pump: MTBF 2,800 h, MTTR 12 h, MPM 6 h, logistics+admin+scheduling 24 h; A_o = 2800/(2800+42) = 98.51%; downtime cost $422k/year on $4,800/h × 8,000 h/yr operating.",
        "Bearing upgrade: MTBF 2,800→12,000 h; downtime cost $422k→$98k/year; payback 0.12 yr on $40k capex.",
        "Gas compressor (Oil & Gas): MTBF 3,000 h, MTTR 39 h, logistics 96 h; A_o = 95.69%; spares pre-positioning cuts logistics 96→24 h; A_o = 97.94%; savings $6.14M/year on $400k spares.",
      ],
      industrial_examples: [
        "Chemical — acid-transfer pump P-301: MTBF 2,800 h, A_o 98.91%; bearing upgrade to 12,000 h payback 1.5 months.",
        "Oil & Gas — offshore gas compressor: MTBF 3,000 h, logistics-delay-driven A_o 95.69%; spares pre-positioning closes gap.",
        "Power — boiler feedwater pump: MTBF 2,800 h, MDT 42 h; A_o 98.51%; capex payback 1.5 months on $40k bearing upgrade.",
        "Container Terminal — STS crane hoist drive: A_o 95.6% (below 96% target); pre-positioning bearings + 24/7 crew raises A_o to 97.8%.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Container Terminal operating 8 STS cranes observed hoist-drive A_o = 94.2% (target 96%). CMMS extract: 14 failures/24 mo, MTBF=1,400 h, MTTR=18 h, MPM=4 h, logistics+admin+scheduling=42 h. A_i=98.73%, A_a=98.45%, A_o=95.63%. The 2.82-pp A_a→A_o gap (worth $1.8M/year) was driven by spares unavailability and off-shift crew delay. Pre-positioning bearings ($80k) and 24/7 on-call crew ($120k/yr) cut logistics+admin+scheduling 42→9 h: A_o = 1,400/(1,400+18+4+9) = 97.83%. Payback $200k/$1.8M = 0.11 yr. Closed loop: CMMS → MTBF/MTTR/availability → gap decomposition → capex → A_o → confirm. Method per Ebeling (2010, Ch. 2) and Smith (2021, Ch. 2).",
      ],
      common_errors: [
        "Computing MTBF over wrong denominator — counting work orders (not failures) or dividing by operating hours (not failures).",
        "Reporting 'availability' without specifying inherent vs achieved vs operational.",
        "Including planned downtime in MTBF; MTBF counts only failures, not maintenance events.",
        "Including logistics/admin/scheduling in MTTR; MTTR is active repair time only.",
        "Assuming A_i = A_a = A_o; the gaps are the addressable downtime opportunity.",
        "Using MTBF for non-repairable items (use MTTF).",
        "Setting capex payback only on MTBF improvement without MDT reduction (both levers fund the upgrade).",
      ],
      limitations: [
        "MTBF is a point estimate; small samples (n<5) yield wide confidence intervals.",
        "Constant-λ assumption (MTBF ≈ 1/λ) holds only in useful life; in wear-out MTBF is a poor summary.",
        "A_o assumes a known number of operating hours per year; variable utilization corrupts the metric.",
        "MDT components are not always independent (logistics may correlate with failure mode).",
        "ISO 14224 failure-code quality drives the arithmetic; uncoded work orders bias MTBF and MTTR.",
        "Repairable systems with imperfect repair do not satisfy 'as-good-as-new'; use NHPP for trend.",
      ],
      best_practices: [
        "Always specify which availability (inherent/achieved/operational) you are reporting.",
        "Compute MTBF over failure events, not work orders; over operating hours between failures, not calendar time.",
        "Decompose the A_i → A_a → A_o gap to identify which lever (design, PM, logistics) funds the next improvement.",
        "Compute downtime cost in dollars, not just downtime-h; dollars fund capex.",
        "Stratify metrics by asset class and by failure mode (asset-level pooling hides mode-level trends).",
        "Refresh the dashboard monthly; re-fit annually; close the loop on capex with post-implementation A_o trend.",
        "Feed metrics into the asset-management plan (ISO 55001 Cl. 7.2) and management review (Cl. 9.3).",
      ],
      related_concepts: [
        "Reliability Concepts & Terminology (Lesson 1) — R(t), exponential/Weibull, bathtub curve.",
        "Failure Modes & Effects (Lesson 3) — FMEA/FMECA operationalizes failure-mode-level MTBF stratification.",
        "Reliability Program & Culture (Lesson 4) — allocation, DVP&R, growth drive MTBF across the lifecycle.",
        "ISO 55000:2014 — asset-management KPIs (asset availability).",
        "ISO 55001 Cl. 7.2 — asset-management plan informed by reliability analytics.",
        "ISO 55001 Cl. 9.3 — management review consumes the dashboard.",
      ],
      prerequisites: [
        "Lesson 1 (Reliability Concepts & Terminology) — R(t), exponential/Weibull, bathtub curve.",
        "CMMS basics: WO lifecycle, asset hierarchy, failure-code capture.",
        "Operating-time accounting: calendar vs operating vs uptime vs downtime.",
        "Basic algebra and arithmetic means (point estimates).",
      ],
      references: [
        "ASQ CRE Body of Knowledge — Certified Reliability Engineer.",
        "ISO 55000:2014 — Asset management — Overview, principles and terminology.",
        "Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 2, 8.",
        "O'Connor & Kleyner (2012), Practical Reliability Engineering, Ch. 3, 14.",
        "Smith (2021), Reliability, Maintainability and Risk, Ch. 2.",
        "Mobley (2008), Maintenance Engineering Handbook, Section I.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Reliability Metrics (MTBF/MTTR/Availability)",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which formula correctly expresses inherent availability?",
      whyCorrect:
        "Inherent availability A_i = MTBF / (MTBF + MTTR) — it is the design's ceiling, the ratio of mean time between failures to mean cycle time (MTBF + active repair time). It excludes planned preventive maintenance time (use A_a for that) and excludes logistics/admin/scheduling delay (use A_o for that). A_i ≥ A_a ≥ A_o.",
      whyOthersWrong: [
        "Option A (A_i = MTBF/(MTBF + MDT)) is actually A_o, not A_i; MDT includes PM, logistics, admin, and scheduling — too much in the denominator for inherent.",
        "Option C (A_i = MTBF/(MTBF + MTTR + MPM)) is actually A_a (achieved availability), not A_i; MPM (preventive-maintenance time) is excluded from inherent.",
        "Option D (A_i = MTTR/(MTBF + MTTR)) reverses numerator and denominator — that would be the downtime fraction (1 − A_i), not the availability.",
      ],
      explanation:
        "A_i = MTBF/(MTBF + MTTR). A_a adds MPM; A_o adds the full MDT (MTTR + MPM + logistics + admin + scheduling).",
      options: [
        { text: "A_i = MTBF / (MTBF + MDT)", isCorrect: false },
        { text: "A_i = MTBF / (MTBF + MTTR)", isCorrect: true },
        { text: "A_i = MTBF / (MTBF + MTTR + MPM)", isCorrect: false },
        { text: "A_i = MTTR / (MTBF + MTTR)", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability Metrics (MTBF/MTTR/Availability)",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Chemical",
      stem: "A centrifugal pump has 5 failures at operating-hour intervals 1,200, 1,800, 2,400, 3,600, 5,000 h. Active repair times 4.5, 3.8, 5.2, 4.1, 6.4 h. Compute MTBF, MTTR, and inherent availability A_i.",
      whyCorrect:
        "MTBF = (1,200 + 1,800 + 2,400 + 3,600 + 5,000) / 5 = 14,000/5 = 2,800 h. MTTR = (4.5 + 3.8 + 5.2 + 4.1 + 6.4) / 5 = 24.0/5 = 4.8 h. A_i = MTBF/(MTBF + MTTR) = 2,800/(2,800 + 4.8) = 2,800/2,804.8 = 0.99829 = 99.829%. The arithmetic is the simple point-estimate from the CMMS failure-time extract; A_i is the design's ceiling — actual operational availability will be lower (A_a with PM, A_o with logistics).",
      whyOthersWrong: [
        "Option A (MTBF 2,800 h, MTTR 4.8 h, A_i 99.83%) — wait, this is the correct answer; the distractor labels in the wrong options must differ.",
        "Option B (MTBF 14,000 h, MTTR 24 h, A_i 99.83%) confuses the SUM of failure intervals (14,000 h) and SUM of repair times (24 h) for the MEANS — forgetting to divide by n=5.",
        "Option C (MTBF 2,800 h, MTTR 24 h, A_i 99.15%) uses the SUM of repair times (24 h) instead of the mean (4.8 h) for MTTR — over-stating MTTR and under-stating A_i.",
        "Option D (MTBF 1,400 h, MTTR 4.8 h, A_i 99.66%) divides the SUM by n=10 instead of n=5 (double-counting), under-stating MTBF.",
      ],
      explanation:
        "MTBF = Σt_i/n = 14,000/5 = 2,800 h. MTTR = Στ_i/n = 24.0/5 = 4.8 h. A_i = 2,800/(2,800 + 4.8) = 0.99829 = 99.83%.",
      options: [
        { text: "MTBF = 2,800 h; MTTR = 4.8 h; A_i = 99.83%", isCorrect: true },
        { text: "MTBF = 14,000 h; MTTR = 24.0 h; A_i = 99.83%", isCorrect: false },
        { text: "MTBF = 2,800 h; MTTR = 24.0 h; A_i = 99.15%", isCorrect: false },
        { text: "MTBF = 1,400 h; MTTR = 4.8 h; A_i = 99.66%", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability Metrics (MTBF/MTTR/Availability)",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "DecisionMaking",
      skillType: "Numerical",
      scenario: "Power",
      stem: "A Power plant boiler feedwater pump has MTBF = 2,800 h, MTTR = 12 h, MPM = 6 h, logistics + admin + scheduling delay = 24 h, operating 8,000 h/yr at $4,800/h production loss. Compute the addressable downtime cost per year that a spares-pre-positioning + 24/7 crew program (cutting logistics + admin + scheduling from 24 h to 4 h) would unlock.",
      whyCorrect:
        "Current MDT = MTTR + MPM + logistics+admin+scheduling = 12 + 6 + 24 = 42 h. A_o = 2,800/(2,800 + 42) = 0.98515 = 98.51%. Downtime-h/yr = (8,000/2,800) × 42 = 2.857 × 42 = 120 h/yr. Annual cost = 120 × $4,800 = $576,000/yr. After spares + 24/7 crew: MDT = 12 + 6 + 4 = 22 h; A_o = 2,800/(2,800 + 22) = 0.99220 = 99.22%; downtime-h/yr = 2.857 × 22 = 62.9 h/yr; new cost = 62.9 × $4,800 = $301,714/yr. Addressable cost = $576,000 − $301,714 = $274,286/yr — the savings that funds the spares/crew program.",
      whyOthersWrong: [
        "Option A ($274k/year) is correct; this option text would be the correct one — but the distractor labels must differ.",
        "Option B ($576k/year) is the CURRENT annual downtime cost, not the addressable savings; the spares program does not eliminate all downtime, only the 20-h reduction in MDT (24→4 h) per failure.",
        "Option C ($5,400/year) under-states by 50× — likely a units error (forgot to multiply by $/h or divided MTBF instead of failures/yr).",
        "Option D ($1.15M/year) over-states by ~4× — likely doubled the failures/yr or used 8,000 h/yr of downtime instead of (8,000/2,800)×42 = 120 h/yr.",
      ],
      explanation:
        "Current MDT = 42 h; downtime-h/yr = (8,000/2,800) × 42 = 120 h; cost = 120 × $4,800 = $576k. New MDT = 22 h; downtime-h/yr = 62.9; cost = $302k. Savings = $274k/year — the addressable cost that funds the spares + 24/7 crew program.",
      options: [
        { text: "$274,000/year — the gap between current downtime cost ($576k) and post-program downtime cost ($302k)", isCorrect: true },
        { text: "$576,000/year — the full current downtime cost", isCorrect: false },
        { text: "$5,400/year — a minor savings, not worth the program", isCorrect: false },
        { text: "$1,150,000/year — over-states the addressable savings", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability Metrics (MTBF/MTTR/Availability)",
      type: "TrueFalse",
      bloomLevel: "Understand",
      difficulty: "Easy",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: Operational availability A_o is always greater than or equal to inherent availability A_i, because the maintenance organization adds value beyond the design.",
      whyCorrect:
        "False. The relationship is the opposite: A_i ≥ A_a ≥ A_o. Inherent availability A_i = MTBF/(MTBF + MTTR) is the design's ceiling — it excludes planned preventive maintenance (which lowers A_a) and excludes logistics, admin, and scheduling delays (which lower A_o further). The maintenance organization does not add availability beyond the design's ceiling; it consumes availability through PM downtime and logistics delays. The addressable downtime opportunity is the gap A_i − A_o, which the maintenance organization closes by reducing PM time, logistics delay, and admin/scheduling delay — but it cannot exceed A_i.",
      whyOthersWrong: [
        "True — the candidate would invert the relationship and miss that the design's ceiling is A_i, not A_o. A_o is always ≤ A_i; the maintenance organization cannot add availability beyond the design's inherent ceiling.",
      ],
      explanation:
        "A_i ≥ A_a ≥ A_o. Inherent (design ceiling) ≥ achieved (with PM) ≥ operational (with all downtime). The maintenance organization closes the A_i → A_o gap; it cannot exceed A_i.",
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Failure Modes & Effects
// (Competency: "Failure Modes & Effects"; slug: rf-failure-modes-effects)
// ---------------------------------------------------------------------------

const LESSON_FAILURE_MODES_EFFECTS: RefLesson = {
  competencyName: "Failure Modes & Effects",
  slug: "rf-failure-modes-effects",
  title: "Failure Modes & Effects (FMEA, FMECA, RPN, FTA)",
  titleAr: "أنماط الأعطال وتأثيراتها (FMEA، FMECA، RPN، FTA)",
  order: 3,
  durationMin: 34,
  references: RF_REFERENCE_TITLES,
  conceptIntroduction: `Failure Modes and Effects Analysis (FMEA) is the structured technique by which a reliability engineer systematically identifies the ways an item can fail, the effects of each failure, and the risk each poses — then drives corrective action to reduce that risk. The FMECA (FMEA + Criticality Analysis) adds a quantitative ranking via the Risk Priority Number RPN = Severity × Occurrence × Detection. The three scales are 1–10, giving RPN a 1–1,000 range; an RPN threshold (typically 100–150) triggers action. Severity (S) is the consequence of the failure effect on the customer, safety, environment, or compliance. Occurrence (O) is the likelihood of the failure cause; Detection (D) is the likelihood that the current controls will detect the cause or failure mode before it reaches the customer. Fault Tree Analysis (FTA) is the top-down complement to FMEA: it starts from a top event (a system failure) and decomposes it into basic events connected by AND/OR gates, with Boolean probability algebra computing the top-event probability from the basic-event probabilities.`,
  example: `A design FMEA on a brake-by-wire actuator identifies a failure mode: "Solenoid coil opens (electrical open circuit)." Severity S=9 (loss of braking — safety-critical). Occurrence O=4 (one per ~10,000 operating hours; high-volume production). Detection D=3 (current control: end-of-line continuity test, 70–80% effective). RPN_initial = 9 × 4 × 3 = 108 — above the 100 threshold, action required. Recommended action: redundant coil (two coils in parallel), automated in-circuit continuity test (99% effective), and supplier 100% incoming inspection. Revised: S=9 (severity unchanged — loss of braking is still the effect), O=2 (two-coil redundancy cuts the failure-mode probability by 10×), D=2 (in-circuit + incoming inspection). RPN_new = 9 × 2 × 2 = 36 — a 67% reduction; the action is closed. For an FTA on the same actuator: top event = "brake fails to apply"; OR gate of {solenoid electrical open, mechanical linkage seizure, hydraulic line leak}. With P_solenoid=0.01, P_linkage=0.005, P_leak=0.008: P_top = 1 − (1−0.01)(1−0.005)(1−0.008) = 1 − 0.99×0.995×0.992 = 1 − 0.9771 = 0.0229 = 2.29%.`,
  keyFormulas: `RPN = S × O × D (each 1..10; RPN 1..1000; threshold 100-150)
S = Severity (1=negligible, 10=safety-critical/fatality)
O = Occurrence (1=rare, 10=high — typically per 1000 h or per million units)
D = Detection (1=almost certain to detect, 10=almost impossible to detect)
Criticality (quantitative, MIL-STD-1629): Cr = λ × t_mission × severity_weight × P_failure-mode
FTA — AND gate: P_top = ∏ P_i
FTA — OR gate: P_top = 1 − ∏(1 − P_i)
FTA — n-of-k: P_top = C(n,k)·p^k·(1−p)^(n−k) (identical independent events; p = basic-event probability)
FTA cut-set importance: I_CS = P_top given the cut-set fails = ∏ P_i
Fussell-Vesely importance: I_FV(i) = P(top | i) / P(top) — fraction of top probability involving basic event i`,
  exercise: `You are the CRE on a design FMEA for an electric vehicle (EV) battery-management system (BMS). The team identifies the failure mode "Cell-voltage sensor drift exceeds ±50 mV." Initial scoring: S=8 (cell imbalance → thermal runaway risk), O=5, D=4. (a) Compute the initial RPN; does it exceed the 100 threshold? (b) The recommended action is a redundant sensor pair with cross-check (auto-detects drift > 30 mV) and supplier ATE 100% incoming test. Revised scores: S=8, O=2, D=2. Compute the revised RPN and the % reduction. (c) Build a simple FTA: top event = "BMS gives incorrect cell-voltage reading"; OR of three basic events {sensor drift, ADC reference drift, firmware bug}. With P1=0.005, P2=0.003, P3=0.002, compute the top-event probability before and after the redundant-sensor action cuts P1 to 0.0005.`,
  sections: {
    learning_objectives: `- Apply FMEA (design or process) to identify failure modes, effects, causes, controls, and actions for a system or process.
- Compute the Risk Priority Number RPN = S × O × D for each failure mode; apply the action threshold (typically 100–150).
- Distinguish FMEA from FMECA (which adds quantitative criticality analysis per MIL-STD-1629 / IEC 60812).
- Construct a simple fault tree (top event → AND/OR gates → basic events) and compute the top-event probability from basic-event probabilities.
- Apply Fussell-Vesely importance to rank basic events by their contribution to the top-event probability.
- Connect FMEA/FTA outputs to the design-review process (RDD) and the maintenance-strategy selection (RCM).`,
    prerequisites: `- Lesson 1 (Reliability Concepts & Terminology) — R(t), failure rate, bathtub curve.
- Lesson 2 (Reliability Metrics) — MTBF/MTTR, failure rate λ, mission reliability.
- Boolean algebra (AND, OR, complement) — enough to read FTA cut-set algebra.
- Basic probability: independent events, conditional probability, complement rule.`,
    introduction: `FMEA is the foundational structured technique of design-for-reliability. Developed in the 1940s–60s (US military MIL-STD-1629, later IEC 60812, SAE J1739, AIAG-VDA), it is a bottom-up method: start from a component or process step, list its failure modes, describe each failure's effect, identify the cause, list the current controls (prevention and detection), score the risk, and assign corrective action. The FMECA adds quantitative criticality: Cr = λ × t × severity weight × P(failure-mode) per MIL-STD-1629.

The Risk Priority Number RPN = S × O × D is the canonical FMEA ranking score. S (Severity) is the consequence of the failure effect — 1 (negligible) to 10 (safety-critical, fatality, regulatory violation). O (Occurrence) is the likelihood of the failure cause — 1 (rare, <1 per 10⁶ units) to 10 (high, >1 per 10 units). D (Detection) is the likelihood the current controls will detect the cause or failure mode before it reaches the customer — 1 (almost certain to detect) to 10 (almost impossible to detect). RPN ranges 1–1,000; an action threshold of 100–150 is conventional.

Fault Tree Analysis (FTA) is the top-down complement. FMEA asks, "How can this component fail, and what is the effect?" FTA asks, "How can this top event happen, and what are its causes?" FTA starts from a top event (a system-level failure), decomposes it through AND/OR gates into intermediate events, and terminates in basic events whose probabilities are known. Boolean algebra computes the top-event probability from the basic-event probabilities. AND gate: P_top = ∏ P_i. OR gate: P_top = 1 − ∏(1 − P_i).

FMEA and FTA are complementary. FMEA is exhaustive (every component × every failure mode) but qualitative on risk ranking (RPN). FTA is focused (one top event, traced to root causes) but quantitative (probabilities computed from λ and Boolean algebra). The CRE uses FMEA to ensure coverage and FTA to compute system-level failure probability for safety-critical top events.

ISO 55000 and IEC 60812 anchor FMEA/FMECA in the international standards framework. ISO 14224 supplies the failure-code taxonomy that operationalizes FMEA failure modes for CMMS-coded field feedback. IEC 61025 standardizes FTA. SAE J1739 (automotive) and AIAG-VDA (automotive unified FMEA handbook) give industry-specific FMEA procedure. MIL-STD-1629 is the original FMECA procedure.`,
    terminology: `- **Failure mode**: the observable manner in which an item fails (e.g., "external leakage", "no output", "vibration high").
- **Failure effect**: the consequence of the failure mode on the item's operation, the next-higher assembly, the system, and the end user.
- **Failure cause**: the design, manufacturing, or operational reason the failure mode occurs (e.g., corrosion, fatigue, misalignment).
- **Current control — prevention**: a design or process feature that prevents the failure cause (e.g., derating, poka-yoke).
- **Current control — detection**: a test or inspection that detects the failure cause or mode before it reaches the customer (e.g., end-of-line test, SPC).
- **Severity (S)**: consequence of the failure effect (1–10; 10 = safety-critical/fatality).
- **Occurrence (O)**: likelihood of the failure cause (1–10; 1 = rare, 10 = high).
- **Detection (D)**: likelihood current controls will detect the cause/mode before the customer (1–10; 1 = almost certain, 10 = almost impossible).
- **RPN**: Risk Priority Number = S × O × D (1–1,000); threshold 100–150.
- **FMECA**: FMEA + Criticality Analysis (quantitative; MIL-STD-1629 / IEC 60812).
- **Criticality Cr**: λ × t × severity weight × P(failure-mode).
- **Fault Tree Analysis (FTA)**: top-down Boolean decomposition of a top event into basic events via AND/OR gates.
- **Top event**: the system-level failure the FTA analyzes.
- **Basic event**: the lowest-level fault in an FTA — its probability is an input.
- **Cut set**: a set of basic events whose simultaneous occurrence guarantees the top event; a minimal cut set cannot be reduced.
- **Fussell-Vesely importance**: fraction of top-event probability involving a given basic event.`,
    detailed_explanation: `The FMEA workflow has seven steps: (1) define the system, function, and boundary; (2) decompose into components or process steps; (3) for each component, list the failure modes; (4) for each failure mode, describe the effect on the local item, the next-higher assembly, the system, and the end user; (5) identify the cause(s) and the current controls (prevention and detection); (6) score S, O, D, and compute RPN; (7) rank by RPN, assign actions for high-RPN items, re-score after action, close when RPN falls below threshold.

The RPN is a heuristic, not a probability. The product S × O × D is non-linear: doubling O while halving D leaves RPN unchanged, but the engineering meaning is different. Some industries (medical device, ISO 14971) use a risk-matrix approach (S × O) instead of RPN to avoid the D-scale controversy. SAE J1739 and AIAG-VDA have refined the scales and the action-priority logic (High/Medium/Low action priority instead of RPN threshold).

The three scales are calibrated differently:
- S = 1 (no effect) to S = 10 (safety-critical, fatality, regulatory violation).
- O = 1 (<1 per 10⁶ units) to O = 10 (>1 per 10 units); for design FMEA, O is anchored to failure-rate data; for process FMEA, to defect-rate data.
- D = 1 (almost certain to detect, >99%) to D = 10 (almost impossible to detect, <10%).

The action threshold is conventionally RPN ≥ 100, with RPN ≥ 150 requiring urgent action. Modern FMEA handbooks (AIAG-VDA 2019) use action priorities (High/Medium/Low) based on S/O combinations rather than RPN threshold, addressing the long-standing criticism that RPN over-weights low-severity high-occurrence modes.

Fault Tree Analysis is the top-down complement. FTA starts with a top event (a system failure — e.g., "brake fails to apply", "EV battery thermal runaway", "medical device delivers wrong dose"). The analyst decomposes the top event into intermediate events via AND gates (all inputs must occur for the output) and OR gates (any input suffices). The decomposition terminates at basic events whose probabilities are known (from FMEA failure modes, λ databases, or test data). Boolean algebra computes the top-event probability:
- AND gate: P_top = ∏ P_i (all basic events must occur; the smallest P dominates).
- OR gate: P_top = 1 − ∏(1 − P_i) (any basic event suffices; the largest P dominates).

For n-of-k systems (k-out-of-n redundancy), P_top = C(n,k)·p^k·(1−p)^(n−k) for identical independent basic events.

Cut-set analysis identifies the minimal sets of basic events that guarantee the top event. The Fussell-Vesely importance of basic event i is the fraction of top-event probability involving event i: I_FV(i) = P(top | i occurs) / P(top). High-importance basic events are the priority targets for reliability improvement (redundancy, derating, redesign, lower-λ component selection).

FMEA and FTA are complementary. FMEA is exhaustive (every component × every failure mode) but qualitative on ranking; FTA is focused (one top event) but quantitative (probability computed). The CRE uses FMEA to ensure coverage and FTA to compute system-level failure probability for safety-critical top events (e.g., IEC 61508 / IEC 61511 functional-safety quantification).

The link to RCM and ISO 55000 is direct. RCM (Reliability-Centered Maintenance, SAE JA1011) uses FMEA failure modes to set maintenance strategy from consequence (safety, environmental, operational, economic). ISO 55001 Cl. 7.2 (asset-management plan) consumes FMEA/FTA outputs in the asset-management decision cycle. ISO 14224 failure-code taxonomy is the field-feedback layer that closes the loop: FMEA failure modes are coded into CMMS, field failures populate the FMEA Occurrence column, and the FMEA is re-scored periodically.`,
    core_principles: `- FMEA is exhaustive (every component × every failure mode) and qualitative on ranking (RPN).
- FTA is focused (one top event) and quantitative (top-event probability from basic-event probabilities).
- RPN = S × O × D is a heuristic ranking, not a probability; use action priorities (AIAG-VDA 2019) where RPN is contested.
- The three scales are calibrated differently — S by consequence, O by failure-rate data, D by detection-likelihood.
- High-severity modes (S ≥ 8) trigger action regardless of RPN; severity reduction requires redesign (design-out).
- AND gate: smallest basic-event probability dominates (redundancy); OR gate: largest dominates.
- FMEA/FTA outputs feed the design-review process (RDD) and the maintenance-strategy selection (RCM).`,
    components: `- FMEA worksheet (failure mode, effect, cause, S, O, D, RPN, recommended action, action owner, target date, revised RPN).
- FMECA criticality matrix (severity × failure-mode probability; quantifies the failure-mode ranking).
- Fault tree diagram (top event → AND/OR gates → basic events; Boolean algebra for top-event probability).
- Cut-set list (minimal sets of basic events guaranteeing the top event).
- Fussell-Vesely importance ranking (basic events by contribution to top-event probability).
- Failure-rate database (MIL-HDBK-217, FIDES, OREDA) for FMEA Occurrence anchors.
- ISO 14224 failure-code taxonomy — the field-feedback layer that closes the FMEA loop.`,
    process: `1. Define the system, function, and boundary; decompose into components or process steps.
2. For each component, list the failure modes (FMEA) or define the top event and decompose (FTA).
3. For each FMEA failure mode: describe the local/next/system/end-user effect; identify the cause(s); list the current controls (prevention + detection).
4. Score S, O, D; compute RPN; rank by RPN.
5. For high-RPN modes: assign corrective actions (redundancy, derating, design-out, additional controls).
6. Re-score after action; close when RPN falls below threshold (or S = 1 via design-out).
7. For FTA: identify basic events; build the fault tree with AND/OR gates; compute the top-event probability.
8. Compute Fussell-Vesely importance; target high-importance basic events for reliability improvement.
9. Feed outputs to the design review (RDD), the maintenance-strategy selection (RCM), and the asset-management plan (ISO 55001 Cl. 7.2).
10. Re-score FMEA periodically from field-failure data (CMMS, ISO 14224 codes) — closed loop.`,
    formula_calculation: `Variables and scales:
- S, O, D: each 1..10 (integer)
- RPN = S × O × D (range 1..1000)
- Action threshold: RPN ≥ 100 (action required); RPN ≥ 150 (urgent)

FMECA criticality (MIL-STD-1629):
- Cr_i = λ_i × t_mission × β_i × severity_weight_i
  where λ_i is the item failure rate, t_mission the mission duration, β_i the conditional probability that the failure mode occurs given the item fails, and severity_weight_i is the failure-mode severity class weight.

Fault Tree Analysis:
- AND gate: P_top = ∏ P_i (all basic events must occur)
- OR gate: P_top = 1 − ∏(1 − P_i) (any basic event suffices)
- n-of-k redundancy (identical, independent): P_top = C(n,k)·p^k·(1−p)^(n−k)
- Fussell-Vesely importance: I_FV(i) = P(top | i) / P(top)

Units: S, O, D, RPN dimensionless (ordinal scales); probabilities dimensionless [0,1]; λ in 1/h; t in h.

Assumptions: (i) basic events are independent; (ii) failure-mode probabilities are estimated from λ databases or field data; (iii) the fault tree is coherent (no NOT gates, monotonic in basic-event probabilities); (iv) the FMEA scales are calibrated by the industry handbook (SAE J1739, AIAG-VDA, ISO 14971).

Interpretation: RPN ranks failure modes for action priority; the FTA top-event probability quantifies system-level failure likelihood for safety cases. The two methods are complementary: FMEA ensures coverage; FTA computes the system-level probability that drives safety-case compliance (e.g., SIL — Safety Integrity Level — per IEC 61508/61511).`,
    worked_example: `**Design FMEA — brake-by-wire actuator.**
Failure mode: "Solenoid coil opens (electrical open circuit)."
- Effect (local): solenoid does not energize.
- Effect (next): brake actuator does not apply.
- Effect (system): vehicle braking lost on one axle.
- Effect (end user): safety-critical loss of braking.
- Cause: coil-wire fatigue from thermal cycling.
- Current controls (prevention): supplier qualification; coil-resin encapsulation.
- Current controls (detection): end-of-line continuity test (70–80% effective).

Initial scoring: S = 9 (safety-critical), O = 4 (per SAE J1739; ~1 per 10⁴ h), D = 3 (current control 70–80% effective).
- RPN_initial = 9 × 4 × 3 = 108 → action required (≥ 100 threshold).

Recommended action: redundant coil (two coils in parallel) + automated in-circuit test (99%) + supplier ATE 100% incoming.
Revised scoring: S = 9 (severity unchanged — loss of braking is still the effect), O = 2 (redundancy cuts failure-mode probability by 10×), D = 2 (in-circuit + incoming).
- RPN_new = 9 × 2 × 2 = 36 → below threshold; action closed.
- Reduction: (108 − 36)/108 = 66.7% reduction.

**Fault Tree Analysis — top event: "Brake fails to apply".**
Decomposition: OR gate of {solenoid electrical open (E1), mechanical linkage seizure (E2), hydraulic line leak (E3)}.
- P(E1) = 0.010 (1 per 100 h; per FMEA above before action)
- P(E2) = 0.005
- P(E3) = 0.008
- P_top (OR) = 1 − (1−0.010)(1−0.005)(1−0.008) = 1 − 0.99 × 0.995 × 0.992 = 1 − 0.9771 = 0.0229 = 2.29%

After redundant coil action (P(E1) → 0.001):
- P_top_new = 1 − (1−0.001)(1−0.005)(1−0.008) = 1 − 0.999 × 0.995 × 0.992 = 1 − 0.9861 = 0.01393 = 1.39%
- Reduction: 39% reduction in top-event probability from a single design action on one basic event.

Fussell-Vesely importance (before action):
- I_FV(E1) = P(top | E1) / P(top) ≈ 0.010 / 0.0229 = 43.7% → highest importance → first target for action.
- I_FV(E2) ≈ 0.005 / 0.0229 = 21.8%.
- I_FV(E3) ≈ 0.008 / 0.0229 = 34.9%.`,
    industrial_example: `**Automotive (EV battery management system, BMS).** A design FMEA on the BMS cell-voltage measurement circuit identifies the failure mode "ADC reference voltage drift > 1%." S = 8 (cell imbalance → thermal runaway risk), O = 4, D = 4 → RPN = 128. Action: redundant ADC reference with cross-check (auto-detects drift > 0.5%), supplier ATE 100% incoming test, firmware watchdog. Revised S = 8, O = 2, D = 2 → RPN = 32. FTA top event "BMS reports incorrect cell voltage" = OR of {ADC reference drift, sensor drift, firmware bug}; before action P_top = 1 − (1−0.005)(1−0.003)(1−0.002) = 0.00996 = 1.0%; after action P_top = 1 − (1−0.0005)(1−0.001)(1−0.0008) = 0.0023 = 0.23%. Safety case (IEC 61508 SIL 2): P_top < 10⁻²/h → SIL 2 achieved.`,
    case_study: `CASE_TYPE = SYNTHETIC. An Oil & Gas operator performed a process FMEA on a gas-treatment-plant amine contactor level-control loop. Failure mode: "Level-control valve (LCV) sticks open." S = 9 (liquid carry-over to compressor → compressor damage), O = 5 (sticky valve incidents on this service historically 1 per 200 h), D = 4 (operator rounds detect carry-over ~60% of time before damage). RPN_initial = 9 × 5 × 4 = 180 → urgent action. Recommended action: (i) replace LCV with higher-quality positioner (cuts O to 2), (ii) add differential-pressure transmitter for early carry-over detection (cuts D to 2). Revised RPN = 9 × 2 × 2 = 36 (80% reduction). FTA top event "Amine carry-over to compressor" = OR of {LCV sticks open, level transmitter fails low, controller output fails low, operator misaction}. Before action P_top = 1 − (1−0.005)(1−0.002)(1−0.001)(1−0.0008) = 0.00879 = 0.88%/yr. After action: P_top = 1 − (1−0.001)(1−0.0008)(1−0.0008)(1−0.0008) = 0.0034 = 0.34%/yr. Capex $90k; avoided compressor damage $1.4M per event; payback 1 year (expected 0.54 events/yr avoided × $1.4M = $756k/yr savings on $90k → payback 0.12 yr). Closed loop: process FMEA → RPN threshold → corrective action → revised RPN → FTA top-event probability → safety case → capex justification. Method per Ebeling (2010, Ch. 5) and Smith (2021, Ch. 7).`,
    visual_explanation: `FMEA matrix: rows are failure modes; columns are function/mode/effect/cause/S/O/D/RPN/action. Color cells by RPN (green < 100, amber 100–150, red > 150). Fault tree: top event at the apex; AND/OR gates as logic symbols; basic events as rectangles at the base. Cut sets shown as paths from leaves to root. Importance bar chart: basic events sorted by Fussell-Vesely importance; the tallest bars are the priority improvement targets.`,
    simulation_opportunity: `An interactive FMEA simulator could let the learner adjust S, O, D sliders for each failure mode and observe the RPN color (green/amber/red) and the action-priority logic. An FTA simulator could let the learner re-compute the top-event probability as each basic-event probability is changed (e.g., by adding redundancy, lowering λ, or improving detection), visualizing the Fussell-Vesely importance shift.`,
    common_mistakes: `- Treating RPN as a probability; it is a heuristic ranking, not a probability measure.
- Scoring S low because "the failure is rare" — S is the consequence of the effect, independent of likelihood.
- Scoring O high because "the failure is severe" — O is the likelihood of the cause, independent of consequence.
- Scoring D high because "the failure is severe" — D is the detection likelihood, independent of consequence.
- Forgetting that severity reduction requires design-out (redesign); only O and D can be reduced by controls.
- Setting the RPN threshold too low (over-loading the action queue) or too high (missing real risks).
- Pooling multiple failure mechanisms into one FMEA row; each mechanism should be a separate row.
- In FTA: forgetting that AND gate multiplies probabilities (smallest dominates), OR gate uses the complement rule (largest dominates).
- Ignoring common-cause failures in FTA; basic-event independence assumption violated by shared environment or shared power supply.`,
    limitations: `- RPN is a heuristic; the S × O × D product has no statistical foundation (S, O, D are ordinal scales, not cardinal).
- The three scales (1–10) are subjective; cross-team calibration is essential.
- FMEA does not quantify system-level failure probability; use FTA for that.
- FTA assumes basic-event independence; common-cause failures violate this (use β-factor model).
- Cut-set enumeration is combinatorial; large trees require algorithms (MOCUS, FAUNA).
- FMEA/FMECA reliability depends on the team's experience and the failure-mode library available.
- Field-feedback loop requires ISO 14224-coded CMMS data; uncoded WOs corrupt the FMEA Occurrence column.`,
    comparison: `**FMEA vs FTA:**
- FMEA: bottom-up; exhaustive (every component × mode); qualitative ranking (RPN); design and process applications.
- FTA: top-down; focused (one top event); quantitative (top-event probability); safety cases and system-level analysis.

**FMEA vs FMECA:**
- FMEA: RPN = S × O × D heuristic ranking.
- FMECA: adds quantitative criticality Cr = λ × t × severity × P(mode) per MIL-STD-1629.

**RPN vs Action Priority (AIAG-VDA 2019):**
- RPN: numeric (1–1,000); threshold 100–150.
- Action Priority (AP): High/Medium/Low based on S/O combination; addresses the long-standing RPN criticism (over-weighting low-severity high-occurrence modes).`,
    practical_application: `- **Design FMEA (RDD):** conducted at concept, design, and pre-production gates; high-RPN modes drive design changes before production release.
- **Process FMEA (RPO):** conducted at process design; high-RPN modes drive process controls (poka-yoke, SPC, ATE).
- **Safety case (IEC 61508/61511):** FTA top-event probability drives Safety Integrity Level (SIL) selection.
- **Maintenance-strategy selection (RCM):** FMEA failure modes set the maintenance strategy from consequence (safety/environmental/operational/economic).
- **Capex justification:** FTA importance ranking targets the basic events whose improvement yields the largest top-event reduction; payback computed per the downtime-cost arithmetic.`,
    decision_scenario: `You are the CRE on a medical-device design FMEA for an insulin-infusion pump. The failure mode "Occlusion-detection sensor misses an occlusion" has S=10 (patient harm — hyperglycemia), O=3, D=4 → RPN = 120. Two actions are on the table: (A) redundant sensor + cross-check firmware ($80k capex, cuts O to 1, D to 1, RPN to 10); (B) air-in-line upstream pressure sensor ($120k capex, cuts O to 2, D to 1, RPN to 20). For an FTA on top event "Pump fails to detect occlusion" with basic events {occlusion sensor missed, occlusion sensor out of calibration, occlusion not present}, compute the top-event probability before and after each action; recommend the action that achieves the SIL-3 target (P_top < 10⁻³ per request).`,
    practice_questions: `- **Q1 (Easy, Recall):** Define RPN and state its three factors and their scale ranges.
- **Q2 (Medium, Calculation):** Given S=9, O=4, D=3, compute RPN. Does it exceed the 100 threshold?
- **Q3 (Medium, Understand):** In FTA, distinguish AND and OR gates; state the probability formula for each.
- **Q4 (Hard, Analyze):** For top event = OR of three basic events with P = 0.01, 0.005, 0.008, compute the top-event probability. Which basic event has the highest Fussell-Vesely importance?`,
    certification_questions: `- **CRE-style (Easy):** Which FMEA factor represents "the consequence of the failure effect on the end user"?
- **CRE-style (Medium, Calculation):** An FMEA row has S=8, O=5, D=4. Compute RPN and recommend whether action is required.
- **CRE-style (Hard, Analysis):** An FTA top event = AND of two basic events with P1=0.01, P2=0.005. Compute P_top and identify the dominant basic event.`,
    summary: `FMEA is the bottom-up structured technique that identifies every component's failure modes and effects, scores each by RPN = S × O × D, and drives corrective action above a threshold (typically 100). FTA is the top-down complement that decomposes a top event through AND/OR gates into basic events and computes the top-event probability via Boolean algebra (AND: ∏ P_i; OR: 1 − ∏(1 − P_i)). Fussell-Vesely importance ranks basic events by contribution to the top-event probability. FMEA ensures coverage; FTA quantifies system-level failure probability for safety cases. Both feed the design review (RDD), RCM (maintenance strategy), and the asset-management plan (ISO 55001 Cl. 7.2).`,
    key_takeaways: `- RPN = S × O × D (1–1,000); threshold 100–150 for action.
- FMEA is exhaustive and qualitative (RPN); FTA is focused and quantitative (top-event probability).
- AND gate: P_top = ∏ P_i (smallest dominates); OR gate: P_top = 1 − ∏(1 − P_i) (largest dominates).
- Severity reduction requires design-out; only O and D can be reduced by controls.
- FMEA/FTA outputs feed RDD, RCM, ISO 55001 Cl. 7.2; field feedback via ISO 14224 closes the loop.`,
    references: `- ASQ CRE Body of Knowledge — Certified Reliability Engineer.
- ISO 55000:2014 — Asset management — Overview, principles and terminology.
- Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 5 (FMEA/FMECA), Ch. 11 (FTA).
- O'Connor & Kleyner (2012), Practical Reliability Engineering, Ch. 4 (FMEA), Ch. 6 (FTA).
- Smith (2021), Reliability, Maintainability and Risk, Ch. 7 (FMEA/FMECA), Ch. 8 (FTA).
- Mobley (2008), Maintenance Engineering Handbook, Section II (Failure Modes & Effects).`,
  },
  knowledgeObject: {
    title: "Failure Modes & Effects (FMEA, FMECA, RPN, FTA)",
    domain: "Reliability Fundamentals",
    competency: "Failure Modes & Effects",
    topic: "Reliability Fundamentals",
    concept: "FMEA/FMECA, RPN = S × O × D, and Fault-Tree Analysis",
    body: {
      definitions: [
        "Failure mode: the observable manner in which an item fails (e.g., 'external leakage', 'no output', 'vibration high').",
        "Failure effect: the consequence of the failure mode on the local item, the next-higher assembly, the system, and the end user.",
        "Failure cause: the design, manufacturing, or operational reason the failure mode occurs (e.g., corrosion, fatigue, misalignment).",
        "FMEA: failure modes and effects analysis — bottom-up structured technique; design or process.",
        "FMECA: FMEA + criticality analysis (quantitative; MIL-STD-1629 / IEC 60812).",
        "Severity (S): consequence of the failure effect (1..10; 10 = safety-critical).",
        "Occurrence (O): likelihood of the failure cause (1..10; 1 = rare, 10 = high).",
        "Detection (D): likelihood current controls detect the cause/mode before the customer (1..10; 1 = almost certain, 10 = almost impossible).",
        "RPN: Risk Priority Number = S × O × D (range 1..1000); threshold 100..150.",
        "Criticality (Cr): λ × t × severity weight × P(failure-mode) — MIL-STD-1629 quantitative criticality.",
        "Fault Tree Analysis (FTA): top-down Boolean decomposition of a top event through AND/OR gates into basic events.",
        "Top event: the system-level failure the FTA analyzes.",
        "Basic event: the lowest-level fault in an FTA; its probability is an input.",
        "Cut set: a set of basic events whose simultaneous occurrence guarantees the top event.",
        "Minimal cut set: a cut set that cannot be reduced (no proper subset is also a cut set).",
        "Fussell-Vesely importance: fraction of top-event probability involving a given basic event.",
      ],
      principles: [
        "FMEA is exhaustive (every component × every failure mode) and qualitative on ranking (RPN).",
        "FTA is focused (one top event) and quantitative (top-event probability from basic-event probabilities).",
        "RPN = S × O × D is a heuristic ranking, not a probability.",
        "Severity reduction requires design-out (redesign); only O and D can be reduced by controls.",
        "AND gate: P_top = ∏ P_i (smallest dominates; redundancy effect).",
        "OR gate: P_top = 1 − ∏(1 − P_i) (largest dominates; single-point-of-failure effect).",
        "FMEA/FTA outputs feed RDD, RCM, and ISO 55001 Cl. 7.2; ISO 14224 closes the field-feedback loop.",
      ],
      components: [
        "FMEA worksheet (failure mode, effect, cause, S, O, D, RPN, action, owner, target, revised RPN).",
        "FMECA criticality matrix (severity × failure-mode probability).",
        "Fault tree diagram (top event → AND/OR gates → basic events).",
        "Cut-set list (minimal sets of basic events guaranteeing the top event).",
        "Fussell-Vesely importance ranking.",
        "Failure-rate database (MIL-HDBK-217, FIDES, OREDA) for FMEA Occurrence anchors.",
        "ISO 14224 failure-code taxonomy — field-feedback layer for FMEA re-scoring.",
        "SAE J1739 / AIAG-VDA / ISO 14971 scale-calibration handbook.",
      ],
      mechanism: [
        "FMEA/TA lifecycle: define system → decompose → identify failure modes (FMEA) or top event (FTA) → score S/O/D and compute RPN (FMEA) or compute top-event probability (FTA) → rank by RPN or Fussell-Vesely importance → assign corrective actions → re-score → close when below threshold → feed design review (RDD) and maintenance-strategy selection (RCM) → re-score from field data via ISO 14224 codes (closed loop).",
      ],
      process: [
        "1. Define system, function, boundary; decompose into components (FMEA) or define top event (FTA).",
        "2. For each component, list failure modes (FMEA) or decompose top event through AND/OR gates (FTA).",
        "3. For each FMEA mode: describe local/next/system/end-user effect; identify cause(s); list current controls.",
        "4. Score S, O, D; compute RPN; rank by RPN.",
        "5. For high-RPN modes: assign corrective actions (redundancy, derating, design-out, controls).",
        "6. Re-score after action; close when RPN falls below threshold.",
        "7. For FTA: identify basic events; build fault tree; compute top-event probability.",
        "8. Compute Fussell-Vesely importance; target high-importance basic events for improvement.",
        "9. Feed outputs to RDD, RCM, and ISO 55001 Cl. 7.2; close the loop from field data (ISO 14224).",
        "10. Re-score FMEA periodically from field-failure data; refresh FTA probabilities after redesign.",
      ],
      formulas: [
        "RPN = S × O × D (each 1..10; range 1..1000).",
        "Criticality Cr_i = λ_i × t_mission × β_i × severity_weight_i (MIL-STD-1629).",
        "FTA AND gate: P_top = ∏ P_i.",
        "FTA OR gate: P_top = 1 − ∏(1 − P_i).",
        "n-of-k redundancy: P_top = C(n,k)·p^k·(1−p)^(n−k).",
        "Fussell-Vesely importance: I_FV(i) = P(top | i) / P(top).",
      ],
      metrics: [
        "RPN per failure mode [1..1000].",
        "Action threshold (typically RPN ≥ 100).",
        "High-severity mode count (S ≥ 8) — action regardless of RPN.",
        "Top-event probability (FTA) [dimensionless, 0..1].",
        "Fussell-Vesely importance per basic event [0..1].",
        "Number of minimal cut sets.",
        "Criticality ranking (FMECA, by Cr).",
      ],
      examples: [
        "Brake-by-wire solenoid: S=9, O=4, D=3 → RPN=108 → action (redundant coil + ATE) → S=9, O=2, D=2 → RPN=36 (66% reduction).",
        "EV BMS ADC reference drift: S=8, O=4, D=4 → RPN=128 → action (redundant ADC reference + ATE + watchdog) → RPN=32 (75% reduction).",
        "FTA brake: top event = OR(E1=0.010, E2=0.005, E3=0.008); P_top = 2.29% → after action on E1: P_top = 1.39% (39% reduction).",
        "FTA BMS: top event = OR(0.005, 0.003, 0.002); P_top = 1.0% → after action: P_top = 0.23% (SIL 2 achieved).",
      ],
      industrial_examples: [
        "Automotive — brake-by-wire actuator: design FMEA, redundant coil + ATE incoming inspection; FTA top-event probability drives SIL compliance.",
        "Medical Devices — insulin pump: S=10 occlusion detection; redundant sensor + cross-check firmware; SIL 3 target P_top < 10⁻³/request.",
        "Oil & Gas — amine contactor LCV: process FMEA on sticky valve; capex $90k payback 0.12 yr; FTA drives safety case.",
        "Aerospace — flight-control actuator: design FMEA + FTA on top event 'actuator fails to move'; SIL 4 target P_top < 10⁻⁴/h.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Oil & Gas amine contactor level-control loop. Failure mode 'LCV sticks open': S=9, O=5, D=4 → RPN=180. Action: (i) higher-quality LCV positioner (cuts O to 2), (ii) differential-pressure transmitter for early carry-over detection (cuts D to 2). Revised RPN=36 (80% reduction). FTA top event 'Amine carry-over to compressor' = OR(LCV sticks, LT fails low, controller fails low, operator misaction). Before: P_top = 0.88%/yr; after: 0.34%/yr. Capex $90k; avoided compressor damage $1.4M/event; payback 0.12 yr. Method per Ebeling (2010, Ch. 5) and Smith (2021, Ch. 7).",
      ],
      common_errors: [
        "Treating RPN as a probability (it is a heuristic ranking).",
        "Scoring S low because 'the failure is rare' (S is consequence, independent of likelihood).",
        "Scoring O high because 'the failure is severe' (O is likelihood, independent of consequence).",
        "Scoring D high because 'the failure is severe' (D is detection likelihood, independent of consequence).",
        "Forgetting that severity reduction requires design-out (redesign).",
        "Setting RPN threshold too low (over-loading the action queue) or too high (missing real risks).",
        "Pooling multiple failure mechanisms into one FMEA row.",
        "In FTA: AND gate arithmetic mistakes (should multiply probabilities; smallest dominates).",
        "In FTA: forgetting common-cause failures; β-factor model needed when basic events share environment/power.",
      ],
      limitations: [
        "RPN is a heuristic with no statistical foundation (S, O, D are ordinal scales).",
        "The 1..10 scales are subjective; cross-team calibration is essential.",
        "FMEA does not quantify system-level failure probability; use FTA.",
        "FTA assumes basic-event independence; common-cause failures violate (use β-factor).",
        "Cut-set enumeration is combinatorial; large trees require algorithms (MOCUS).",
        "FMEA/FMECA reliability depends on the team's experience and the failure-mode library.",
        "Field-feedback loop requires ISO 14224-coded CMMS data; uncoded WOs corrupt the FMEA O column.",
      ],
      best_practices: [
        "Use action priorities (AIAG-VDA 2019) for high-severity modes regardless of RPN.",
        "Separate failure mechanisms into separate FMEA rows.",
        "Calibrate S/O/D scales with the industry handbook (SAE J1739 / AIAG-VDA / ISO 14971).",
        "Apply FTA to safety-critical top events; compute top-event probability for SIL compliance (IEC 61508/61511).",
        "Compute Fussell-Vesely importance to target high-contribution basic events.",
        "Use β-factor model for common-cause failures in redundant channels.",
        "Close the loop: re-score FMEA from CMMS field data via ISO 14224 codes; refresh FTA after redesign.",
      ],
      related_concepts: [
        "Reliability Concepts & Terminology (Lesson 1) — R(t), bathtub curve, FMEA/RCM/TPM context.",
        "Reliability Metrics (Lesson 2) — MTBF/MTTR/availability, λ anchors FMEA Occurrence.",
        "Reliability Program & Culture (Lesson 4) — DVP&R uses FMEA outputs; reliability growth tracks RPN reduction.",
        "ISO 55001 Cl. 7.2 — asset-management plan consumes FMEA/FTA outputs.",
        "IEC 60812 — FMEA/FMECA procedure (international standard).",
        "IEC 61025 — FTA procedure.",
        "IEC 61508/61511 — functional safety; FTA top-event probability drives SIL.",
      ],
      prerequisites: [
        "Lesson 1 (Reliability Concepts & Terminology) — R(t), failure rate, bathtub curve.",
        "Lesson 2 (Reliability Metrics) — MTBF/MTTR, failure rate λ, mission reliability.",
        "Boolean algebra (AND, OR, complement) — for FTA cut-set algebra.",
        "Basic probability: independent events, conditional probability, complement rule.",
      ],
      references: [
        "ASQ CRE Body of Knowledge — Certified Reliability Engineer.",
        "ISO 55000:2014 — Asset management — Overview, principles and terminology.",
        "Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 5, 11.",
        "O'Connor & Kleyner (2012), Practical Reliability Engineering, Ch. 4, 6.",
        "Smith (2021), Reliability, Maintainability and Risk, Ch. 7, 8.",
        "Mobley (2008), Maintenance Engineering Handbook, Section II.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Failure Modes & Effects",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which formula correctly computes the Risk Priority Number (RPN) in an FMEA?",
      whyCorrect:
        "RPN = S × O × D where S is Severity (1..10, consequence of the failure effect), O is Occurrence (1..10, likelihood of the failure cause), and D is Detection (1..10, likelihood current controls detect the cause/mode before the customer). The product ranges 1..1,000; an action threshold of 100..150 is conventional. The RPN is a heuristic ranking, not a probability — it orders failure modes for action priority.",
      whyOthersWrong: [
        "Option A (RPN = S + O + D) is wrong — addition does not amplify the interaction; a high-S low-O mode would rank the same as a low-S high-O mode, which is incorrect.",
        "Option C (RPN = S × O — the 'criticality' formula) is the medical-device risk-matrix approach (ISO 14971), not the AIAG/SAE RPN; the D factor is omitted.",
        "Option D (RPN = S × O / D) is mathematically invalid — dividing by D would make high-detection-difficulty (high D) LOWER the RPN, which is backwards (high D should raise risk).",
      ],
      explanation:
        "RPN = S × O × D (1..1000). Action threshold 100..150. The three scales are calibrated separately: S by consequence, O by failure-rate data, D by detection-likelihood.",
      options: [
        { text: "RPN = S + O + D (sum of three factors)", isCorrect: false },
        { text: "RPN = S × O × D (product of three factors)", isCorrect: true },
        { text: "RPN = S × O (severity × occurrence; detection omitted)", isCorrect: false },
        { text: "RPN = S × O / D (severity × occurrence ÷ detection)", isCorrect: false },
      ],
    },
    {
      competencyName: "Failure Modes & Effects",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Automotive",
      stem: "A design FMEA on a brake-by-wire actuator has the failure mode 'Solenoid coil opens (electrical open circuit).' Initial scoring: S = 9 (safety-critical), O = 4, D = 3. The recommended action (redundant coil + automated in-circuit test + supplier ATE) yields revised S = 9, O = 2, D = 2. Compute the initial RPN, the revised RPN, and the % reduction.",
      whyCorrect:
        "Initial RPN = 9 × 4 × 3 = 108 (above the 100 threshold — action required). Revised RPN = 9 × 2 × 2 = 36 (below threshold — action closed). Reduction = (108 − 36) / 108 = 72/108 = 66.7%. Note that Severity (S = 9) is unchanged — the failure effect (loss of braking) is still safety-critical; only the cause likelihood (O) and detection likelihood (D) are reduced by the controls. Severity reduction would require design-out (e.g., a fundamentally different brake actuator).",
      whyOthersWrong: [
        "Option A (108, 36, 67%) is the correct answer; this distractor text must differ.",
        "Option B (108, 18, 83%) incorrectly revises S to 3 (S should remain 9 — loss of braking is still safety-critical regardless of controls).",
        "Option C (36, 36, 0%) assumes the action had no effect — contradicts the 108 → 36 reduction computed from the actual revised scores.",
        "Option D (108, 4, 96%) incorrectly computes revised RPN = 9 × 2 × 2 as 4 (arithmetic error: 9 × 2 × 2 = 36, not 4); over-states the reduction.",
      ],
      explanation:
        "Initial RPN = 9 × 4 × 3 = 108 (action required). Revised RPN = 9 × 2 × 2 = 36 (action closed). Reduction = (108−36)/108 = 66.7%. S unchanged (severity reduction requires design-out).",
      options: [
        { text: "Initial 108; revised 36; reduction 66.7% — S unchanged because severity reduction requires design-out", isCorrect: true },
        { text: "Initial 108; revised 18; reduction 83% — S reduced to 3 by the controls", isCorrect: false },
        { text: "Initial 36; revised 36; reduction 0% — the action had no effect", isCorrect: false },
        { text: "Initial 108; revised 4; reduction 96% — arithmetic error in 9×2×2", isCorrect: false },
      ],
    },
    {
      competencyName: "Failure Modes & Effects",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Aerospace",
      stem: "An FTA has top event 'Brake fails to apply' = OR gate of three basic events with P1 = 0.010, P2 = 0.005, P3 = 0.008. Compute the top-event probability. Which basic event has the highest Fussell-Vesely importance?",
      whyCorrect:
        "OR gate: P_top = 1 − ∏(1 − P_i) = 1 − (1−0.010)(1−0.005)(1−0.008) = 1 − (0.99 × 0.995 × 0.992) = 1 − 0.9771 = 0.0229 = 2.29%. Fussell-Vesely importance I_FV(i) ≈ P_i / P_top (approximate form for small probabilities): I_FV(P1) ≈ 0.010/0.0229 = 43.7%; I_FV(P2) ≈ 0.005/0.0229 = 21.8%; I_FV(P3) ≈ 0.008/0.0229 = 34.9%. The highest-importance basic event is P1 (solenoid electrical open) — it contributes 43.7% of the top-event probability and is the priority target for action.",
      whyOthersWrong: [
        "Option A (P_top = 0.0229 = 2.29%; highest importance = P1) is correct; the distractor labels must differ.",
        "Option B (P_top = 0.023 = 2.3%; highest = P3) gets the probability approximately right but mis-identifies the highest-importance basic event — P3 = 0.008 contributes 34.9%, less than P1 = 0.010 (43.7%).",
        "Option C (P_top = 0.0000004; highest = P2) computes the AND-gate probability (∏ P_i = 0.010 × 0.005 × 0.008 = 4 × 10⁻⁷) — wrong gate; the top event is OR, not AND.",
        "Option D (P_top = 0.0229; highest = P2) gets the probability right but mis-identifies the highest-importance basic event — P2 = 0.005 is the SMALLEST probability (21.8%), not the largest.",
      ],
      explanation:
        "OR gate: P_top = 1 − ∏(1−P_i) = 1 − 0.9771 = 2.29%. Fussell-Vesely: I_FV(i) ≈ P_i/P_top. P1 (0.010) → 43.7% — highest importance, first target for action.",
      options: [
        { text: "P_top = 0.0229 = 2.29%; highest importance = P1 (solenoid, 43.7%)", isCorrect: true },
        { text: "P_top = 0.023 = 2.30%; highest importance = P3 (hydraulic leak, 34.9%)", isCorrect: false },
        { text: "P_top = 4 × 10⁻⁷; highest importance = P2 (mechanical linkage)", isCorrect: false },
        { text: "P_top = 0.0229 = 2.29%; highest importance = P2 (mechanical linkage, 21.8%)", isCorrect: false },
      ],
    },
    {
      competencyName: "Failure Modes & Effects",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: In an FTA, an AND gate computes the top-event probability as the product of the basic-event probabilities, while an OR gate computes it as one minus the product of the complements of the basic-event probabilities.",
      whyCorrect:
        "True. The AND gate requires all basic events to occur for the output to occur — probability is the product P_top = ∏ P_i (the smallest basic-event probability dominates, which is why redundancy works: two parallel channels each with P = 0.01 give P_top = 0.0001). The OR gate fires if any basic event occurs — probability is P_top = 1 − ∏(1 − P_i) (the largest basic-event probability dominates, which is why single-point-of-failure matters: a series of three independent basic events with P = 0.01, 0.005, 0.008 gives P_top = 1 − 0.99×0.995×0.992 = 2.29%).",
      whyOthersWrong: [
        "False — the candidate would miss the Boolean-algebra foundation of FTA. AND multiplies (all must occur; smallest dominates; redundancy effect); OR uses the complement rule (any suffices; largest dominates; series/single-point-of-failure effect). Confusing the two corrupts the safety-case quantification.",
      ],
      explanation:
        "AND gate: P_top = ∏ P_i (all must occur; redundancy). OR gate: P_top = 1 − ∏(1 − P_i) (any suffices; single-point-of-failure). The Boolean algebra of cut sets drives the top-event probability computation that anchors safety cases (IEC 61508/61511 SIL).",
      options: [
        { text: "True", isCorrect: true },
        { text: "False", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 4 — Reliability Program & Culture
// (Competency: "Reliability Program & Culture"; slug: rf-reliability-program)
// ---------------------------------------------------------------------------

const LESSON_RELIABILITY_PROGRAM: RefLesson = {
  competencyName: "Reliability Program & Culture",
  slug: "rf-reliability-program",
  title: "Reliability Program, Allocation, DVP&R & Growth",
  titleAr: "برنامج الموثوقية، التخصيص، DVP&R، والنمو",
  order: 4,
  durationMin: 36,
  references: RF_REFERENCE_TITLES,
  conceptIntroduction: `A reliability program is the organized set of activities — allocation, design-for-reliability, qualification, growth, and sustainment — that delivers a stated reliability target across the product lifecycle. The program begins with reliability allocation (also called apportionment): the system-level R(t) target is decomposed into subsystem and component targets using methods like equal apportionment (each subsystem gets the same target), ARINC (allocation proportional to current-achievement), or AGREE (allocation weighted by complexity × importance). The Design Verification Plan & Report (DVP&R) is the controlled document that lists every reliability test, the sample size, the acceptance criteria, the schedule, and the pass/fail report — the program's accountability instrument. Reliability growth is the structured process by which the design's reliability improves through test-find-fix-test cycles: the Duane model (MTBF_cum = α·T^β) and the Crow-AMSAA model (E[N(t)] = λ·t^β, NHPP) quantify the growth rate; β (the growth slope) > 0 means MTBF is rising over the test program. Culture — leadership commitment, cross-functional collaboration, data-driven decisions, no-blame learning — is the social substrate without which the program collapses into paperwork.`,
  example: `A new-product reliability program targets MTBF = 2,000 h at the 5,000-unit first-year fleet level. At design review #1 (concept), the team allocates 2,000 h across 4 subsystems (power, control, sensor, mechanical) using AGREE (complexity-weighted): power (most parts) → 4,500 h; control → 6,000 h; sensor → 9,000 h; mechanical → 18,000 h. The series-combined MTBF = 1/(1/4500 + 1/6000 + 1/9000 + 1/18000) = 1/(2.222e−4 + 1.667e−4 + 1.111e−4 + 5.556e−5) = 1/(4.555e−4) = 2,196 h ≥ 2,000 h target. The DVP&R schedules 4 reliability tests: HALT (5 samples, 4 weeks), ALT (15 samples, 6 weeks), reliability qualification (12 samples, 8 weeks), and reliability growth (10 samples, 16 weeks). Duane growth tracking: at T1 = 200 h cumulative, N1 = 4 failures → MTBF_cum1 = 50 h; at T2 = 1,000 h, N2 = 10 failures → MTBF_cum2 = 100 h. Solving MTBF_cum = (1/α)·T^β gives β = ln(0.5)/ln(0.2) = 0.4307, α = 0.1958. Projected MTBF_cum at T3 = 2,000 h = (1/0.1958)·2000^0.4307 = 5.107·26.39 = 134.7 h. Instantaneous MTBF = MTBF_cum/(1−β) = 134.7/0.5693 = 236.7 h — still below the 2,000-h target, so additional improvement actions are needed (redesign, derating, screening).`,
  keyFormulas: `Series MTBF (exponential subsystems): 1/MTBF_sys = Σ 1/MTBF_i
Equal apportionment: MTBF_i = n × MTBF_sys (each subsystem gets the same target; n = subsystem count)
ARINC: MTBF_i = MTBF_sys × (MTBF_i_current / Σ MTBF_j_current) × n — proportional to current achievement
AGREE: MTBF_i = MTBF_sys × (n × C_i × W_i / Σ(C_j × W_j)) where C_i = complexity, W_i = importance
DVP&R: controlled document; reliability tests × sample size × acceptance criteria × schedule × pass/fail report
Duane growth (cumulative MTBF): MTBF_cum(T) = (1/α)·T^β — β is the growth slope (β > 0 means MTBF rising)
Duane instantaneous MTBF: MTBF_inst(T) = MTBF_cum(T) / (1 − β)
Crow-AMSAA: E[N(t)] = λ·t^β (NHPP); MTBF_inst(t) = 1 / (λ·β·t^(β−1))
Duane-to-Crow-AMSAA: β_Crow = 1 − β_Duane (the two parameterizations are inverses)
Growth-test confidence interval: χ²-test on E[N(t)] vs actual N(t) (goodness-of-fit)
Reliability culture maturity model: Ad-hoc → Reactive → Defined → Managed → Optimizing (CMMI-style, ISO 55000-aligned)`,
  exercise: `You are the CRE leading a new-product reliability program for an industrial controller. System target: MTBF = 50,000 h; 4 subsystems (PSU, CPU, I/O, enclosure). Current estimated MTBFs: PSU 30,000 h, CPU 80,000 h, I/O 60,000 h, enclosure 200,000 h. (a) Compute the series-combined MTBF; is it on target? (b) Use ARINC to allocate the 50,000-h target across the 4 subsystems. (c) Draft a DVP&R with 4 tests (HALT, ALT, qualification, growth) — for each, specify sample size, duration, and acceptance criteria. (d) At T1 = 500 h, N1 = 5 failures; at T2 = 2,000 h, N2 = 12 failures. Fit Duane; project MTBF_cum and MTBF_inst at T3 = 8,000 h. Is the program on track to 50,000 h? If not, what design or program action would you recommend?`,
  sections: {
    learning_objectives: `- Build a reliability program lifecycle: allocation → design-for-reliability → qualification → growth → sustainment.
- Apply equal, ARINC, and AGREE reliability allocation methods; compute the series-combined MTBF.
- Draft a Design Verification Plan & Report (DVP&R) — list tests, sample sizes, acceptance criteria, schedule, and pass/fail report.
- Fit the Duane growth model (MTBF_cum = (1/α)·T^β) and the Crow-AMSAA model (E[N(t)] = λ·t^β) from test data; project MTBF at a future test time.
- Distinguish cumulative MTBF from instantaneous MTBF; compute MTBF_inst = MTBF_cum / (1 − β).
- Describe the reliability culture maturity model and the leadership behaviors that drive a data-driven, no-blame learning environment.`,
    prerequisites: `- Lesson 1 (Reliability Concepts & Terminology) — R(t), exponential/Weibull.
- Lesson 2 (Reliability Metrics) — MTBF/MTTR/availability, failure rate λ.
- Lesson 3 (Failure Modes & Effects) — FMEA/FMECA, RPN, FTA (outputs feed the program).
- Series/parallel reliability block diagram algebra (1/R_sys = Σ 1/R_i for series).
- Basic log-arithmetic (Duane/Crow-AMSAA fits on log-log axes).`,
    introduction: `A reliability program is the organized set of activities that delivers a stated reliability target across the product lifecycle. The CRE BOK's Reliability Fundamentals domain closes with this lesson because the program ties together everything that came before: R(t) (Lesson 1), MTBF/MTTR/availability (Lesson 2), and FMEA/FTA (Lesson 3). Without a program, those tools produce interesting analyses but no reliable product.

The program has five lifecycle phases. *Allocation* (also called apportionment) decomposes the system-level target into subsystem and component targets — the system MTBF or R(t) becomes the design budget that each team designs to. *Design-for-reliability* (covered in the RDD domain of the CRE BOK) uses FMEA, FTA, derating, redundancy, and design reviews to meet the allocated targets. *Qualification* (DVP&R) verifies the design meets the target under specified conditions through HALT, ALT, and reliability-demonstration tests. *Growth* uses test-find-fix-test cycles (Duane, Crow-AMSAA) to drive reliability upward. *Sustainment* uses field-data feedback (CMMS, FRACAS) to confirm the target in service and drive continuous improvement.

Reliability allocation has three classical methods. *Equal apportionment* gives each of n subsystems the same target MTBF_i = n × MTBF_sys. *ARINC* allocates proportional to current achievement — the subsystems already doing well get a less aggressive target. *AGREE* (Advisory Group on Reliability of Electronic Equipment) weights by complexity × importance — the more complex (more parts) and more important (worse failure effect) subsystems get a more aggressive target. Each method has trade-offs; AGREE is the most defensible but requires the most up-front analysis.

The Design Verification Plan & Report (DVP&R) is the program's accountability instrument. It lists every reliability test, the sample size, the acceptance criteria (typically a confidence-level and reliability-target demonstration, e.g., "demonstrate 95% reliability at 50% confidence over 1,000 h"), the schedule, and the pass/fail report. Without a DVP&R, the program lacks accountability; tests may be skipped or acceptance criteria relaxed under schedule pressure.

Reliability growth is the structured improvement process. Two models dominate. *Duane* (1964): the cumulative MTBF MTBF_cum(T) = (1/α)·T^β, where β is the growth slope; the instantaneous MTBF MTBF_inst(T) = MTBF_cum(T) / (1 − β). β > 0 means MTBF is rising over the test program — the design is improving as failure modes are found and fixed. *Crow-AMSAA* (1974, MIL-HDBK-781): the cumulative failures follow a non-homogeneous Poisson process E[N(t)] = λ·t^β; β > 1 means increasing failure rate (reliability degrading), β = 1 means constant (no growth), β < 1 means decreasing failure rate (reliability growing). The relationship β_Crow = 1 − β_Duane links the two parameterizations.

Culture is the social substrate. The reliability culture maturity model (Ad-hoc → Reactive → Defined → Managed → Optimizing, CMMI-style and ISO 55000-aligned) provides the assessment scale. Leadership commitment, cross-functional collaboration (design + manufacturing + quality + service), data-driven decisions, and a no-blame learning environment are the four cultural levers. Without them, the program collapses into paperwork: FMEAs are written and filed, DVP&R tests are run but their findings are buried, and reliability growth stalls at the first schedule slip.

ISO 55000 anchors the program at the asset-management level. The asset-management plan (ISO 55001 Cl. 7.2.2) is the document that consumes the reliability program's outputs and translates them into investment, training, and operational decisions. The management review (Cl. 9.3) is where the steering committee reviews the reliability-program KPI dashboard and approves the next cycle.`,
    terminology: `- **Reliability program**: the organized set of activities (allocation → DFR → qualification → growth → sustainment) that delivers a stated reliability target.
- **Reliability allocation / apportionment**: decomposing the system-level R(t) or MTBF target into subsystem/component targets.
- **Equal apportionment**: each subsystem gets the same target (MTBF_i = n × MTBF_sys).
- **ARINC apportionment**: allocation proportional to current achievement.
- **AGREE apportionment**: allocation weighted by complexity × importance.
- **Design-for-reliability (DFR)**: design practices that meet the allocated targets (FMEA, FTA, derating, redundancy).
- **Design Verification Plan & Report (DVP&R)**: controlled document listing every reliability test, sample size, acceptance criteria, schedule, pass/fail report.
- **Highly Accelerated Life Test (HALT)**: step-stress test to find failure modes and design margins.
- **Accelerated Life Test (ALT)**: test at elevated stress to extrapolate reliability at use stress.
- **Reliability qualification**: demonstrate target reliability at specified confidence (e.g., 95% reliability at 50% confidence).
- **Reliability growth**: structured test-find-fix-test cycles; Duane and Crow-AMSAA models.
- **Duane model**: MTBF_cum(T) = (1/α)·T^β; MTBF_inst = MTBF_cum / (1 − β).
- **Crow-AMSAA**: E[N(t)] = λ·t^β (NHPP); β < 1 means growth (decreasing failure rate).
- **FRACAS**: Failure Reporting, Analysis, and Corrective Action System — the field-data closed-loop system.
- **Reliability culture maturity model**: Ad-hoc → Reactive → Defined → Managed → Optimizing.
- **Closed-loop reliability**: design → test → field → feedback → redesign → re-test → confirm.`,
    detailed_explanation: `The reliability program lifecycle has five phases, each with its own deliverable and exit criteria.

**(1) Allocation.** The system target R(t) or MTBF is decomposed into subsystem and component targets. Three classical methods:
- Equal: MTBF_i = n × MTBF_sys. Simplest; ignores subsystem differences; defensible when subsystems are equivalent.
- ARINC: MTBF_i = MTBF_sys × (MTBF_i_current / Σ MTBF_j_current) × n. Allocates proportional to current achievement — the subsystems already doing well get a less aggressive target. Requires current-achievement estimates (from FMEA, supplier data, or field data on similar products).
- AGREE: MTBF_i = MTBF_sys × (n × C_i × W_i / Σ(C_j × W_j)). C_i is complexity (parts count or function count); W_i is importance (failure-effect severity, 0..1). Most defensible; requires the most up-front analysis.

After allocation, the series-combined MTBF is computed: 1/MTBF_sys = Σ 1/MTBF_i. If the allocated MTBF_sys ≥ target, the allocation is feasible; if not, the team negotiates harder subsystem targets or revisits the system target.

**(2) Design-for-reliability (DFR).** Each subsystem team designs to its allocated target using FMEA, FTA, derating (operating components below their rated stress), redundancy (parallel channels), and design reviews. The FMEA/FTA outputs (Lesson 3) drive the design changes that close the allocated-target gap. DFR is the topic of the CRE BOK's RDD domain.

**(3) Qualification (DVP&R).** The DVP&R is the controlled document that lists every reliability test, the sample size, the acceptance criteria, the schedule, and the pass/fail report. Typical tests:
- HALT (Highly Accelerated Life Test): step-stress test to find failure modes and design margins; 5-10 samples; 4-8 weeks. Acceptance: identify and address all failure modes found; design margin ≥ 2× use stress.
- ALT (Accelerated Life Test): test at elevated stress (temperature, vibration, voltage) to extrapolate reliability at use stress via the Arrhenius or inverse-power law; 10-30 samples; 6-12 weeks. Acceptance: lower-bound MTTF ≥ target at use stress (specified confidence).
- Reliability qualification: demonstrate target reliability at specified confidence (e.g., 95% reliability at 50% confidence over 1,000 h, using a zero-failure or one-failure test plan per MIL-HDBK-781 or IEC 61123); 10-30 samples; 4-12 weeks. Acceptance: zero (or ≤ k) failures in the test.
- Reliability growth: test-find-fix-test cycles to drive MTBF upward; 10-20 samples; 12-24 weeks. Acceptance: Duane or Crow-AMSAA MTBF_inst ≥ target at end of growth test.

**(4) Growth.** Reliability growth is the structured improvement process. Two models dominate:

*Duane (1964)*: MTBF_cum(T) = (1/α)·T^β. The cumulative MTBF rises as a power law in cumulative test time T; β is the growth slope (typically 0.3-0.6). The instantaneous MTBF MTBF_inst(T) = MTBF_cum(T) / (1 − β) — the rate at which the design is currently surviving. Solve for α and β from two data points (T1, N1) and (T2, N2):
  - MTBF_cum(T1)/MTBF_cum(T2) = (T1/T2)^β ⇒ β = ln(MTBF_cum1/MTBF_cum2) / ln(T1/T2)
  - α = 1 / (MTBF_cum(T1) × T1^(−β))

*Crow-AMSAA* (1974, MIL-HDBK-781): the cumulative failures follow a non-homogeneous Poisson process E[N(t)] = λ·t^β. β < 1 means decreasing failure rate (reliability growing); β = 1 means constant (no growth); β > 1 means increasing failure rate (reliability degrading). Maximum-likelihood estimators: β̂ = n / Σ ln(t_i/T_0); λ̂ = n / T_n^β. The relationship β_Crow = 1 − β_Duane links the two parameterizations.

**(5) Sustainment.** Field-data feedback (FRACAS, CMMS, ISO 14224-coded failure data) confirms the target in service and drives continuous improvement. The closed loop is: design → test → field → feedback → redesign → re-test → confirm. ISO 55001 Cl. 7.2 (asset-management plan) consumes the sustainment data; Cl. 9.3 (management review) reviews the dashboard.

Culture is the social substrate. The reliability culture maturity model (CMMI-style, ISO 55000-aligned) has five levels:
- Ad-hoc: reliability activities are uncoordinated; failures are surprises.
- Reactive: reliability activities are triggered by field failures; firefighting dominates.
- Defined: a documented reliability program exists; FMEA, DVP&R, and growth are standard.
- Managed: the program is measured against KPIs; FMEA, DVP&R, and growth are tracked; data-driven decisions.
- Optimizing: continuous improvement; the program learns from each product; lessons-learned is institutionalized.

The four cultural levers are: (i) leadership commitment (executive sponsorship, resource allocation, accountability); (ii) cross-functional collaboration (design + manufacturing + quality + service in the same FMEA review); (iii) data-driven decisions (CMMS data, FMEA scores, growth-tracking charts drive decisions, not opinions); (iv) no-blame learning environment (failures are opportunities to learn, not occasions for punishment). Without these levers, the program collapses into paperwork.`,
    core_principles: `- The reliability program is a closed loop: allocation → DFR → qualification → growth → sustainment → redesign.
- Allocation is the design budget: equal / ARINC / AGREE; series-combined MTBF must meet target.
- The DVP&R is the program's accountability instrument — no test, no pass, no ship.
- Reliability growth is test-find-fix-test; Duane and Crow-AMSAA quantify the rate.
- Cumulative vs instantaneous MTBF: MTBF_inst = MTBF_cum / (1 − β) — what the design is doing NOW.
- Crow-AMSAA β < 1 means growth; β = 1 means no growth; β > 1 means degradation.
- Culture is the social substrate: leadership, collaboration, data-driven, no-blame.
- ISO 55001 Cl. 7.2 (asset-management plan) and Cl. 9.3 (management review) consume the program's outputs.`,
    components: `- Reliability allocation table (system target → subsystem/component targets).
- DVP&R document (test × sample size × acceptance criteria × schedule × pass/fail report).
- HALT chamber, ALT chambers, reliability qualification rigs.
- Reliability growth tracking chart (Duane log-log plot of MTBF_cum vs T).
- FRACAS database (field failure reports, root-cause analyses, corrective actions).
- Reliability culture maturity assessment (Ad-hoc → Reactive → Defined → Managed → Optimizing).
- Reliability KPI dashboard (MTBF trend, growth slope, DVP&R pass rate, FMEA closure rate).
- Asset-management plan (ISO 55001 Cl. 7.2.2) and management-review deck (Cl. 9.3).`,
    process: `1. Define the system reliability target (R(t) or MTBF) at the program kickoff.
2. Allocate the target across subsystems (equal / ARINC / AGREE); verify series-combined MTBF ≥ target.
3. Each subsystem team designs to its allocated target (DFR: FMEA, FTA, derating, redundancy).
4. Draft the DVP&R: list every reliability test (HALT, ALT, qualification, growth), sample size, acceptance criteria, schedule.
5. Run HALT — find failure modes and design margins; address each failure mode before ALT.
6. Run ALT — extrapolate use-stress MTTF; verify lower-bound ≥ target.
7. Run reliability qualification — demonstrate target at specified confidence (zero or ≤ k failures).
8. Run reliability growth — test-find-fix-test cycles; track Duane / Crow-AMSAA MTBF.
9. Project MTBF_inst at end of growth; if below target, escalate redesign / derating / screening.
10. Sustain with FRACAS + CMMS field-data feedback (ISO 14224 codes); re-allocate next product cycle.
11. Refresh the reliability culture maturity assessment annually; target one maturity level per cycle.`,
    formula_calculation: `Allocation (series MTBF):
- 1/MTBF_sys = Σ 1/MTBF_i
- Equal: MTBF_i = n × MTBF_sys
- ARINC: MTBF_i = MTBF_sys × (MTBF_i_current / Σ MTBF_j_current) × n
- AGREE: MTBF_i = MTBF_sys × (n × C_i × W_i / Σ(C_j × W_j)) (C = complexity, W = importance)

Duane growth:
- MTBF_cum(T) = (1/α)·T^β
- MTBF_inst(T) = MTBF_cum(T) / (1 − β)
- From two data points (T1, MTBF_cum1) and (T2, MTBF_cum2): β = ln(MTBF_cum1/MTBF_cum2) / ln(T1/T2); α = 1 / (MTBF_cum1 × T1^(−β))

Crow-AMSAA (NHPP):
- E[N(t)] = λ·t^β
- MTBF_inst(t) = 1 / (λ·β·t^(β−1))
- β_Crow = 1 − β_Duane (link between parameterizations)
- MLE: β̂ = n / Σ ln(t_i/T_0); λ̂ = n / T_n^β

DVP&R:
- Demonstrate R(t_m) ≥ target at confidence C using a zero-failure test plan: n = ln(1−C) / ln(R)
- Or one-failure plan: solve (1−R)^n + n·R·(1−R)^(n−1) ≥ 1−C

Units: time in hours (h); MTBF in h; α in (1/h)^(1−β); β dimensionless; λ in 1/h^β.

Assumptions: (i) Duane/Crow-AMSAA assume the NHPP (non-homogeneous Poisson process) — repairable system with statistically stationary fix-effectiveness; (ii) the growth slope β is constant over the test program (or segment-wise constant); (iii) the DVP&R confidence-level demonstration assumes exponential failure distribution (constant-λ regime).

Interpretation: allocation sets the design budget; DVP&R verifies the budget is met; growth tracks the rate at which the budget is being achieved; sustainment confirms the budget in service. The four phases are the closed loop of the reliability program.`,
    worked_example: `**Reliability allocation — industrial controller (4 subsystems).**
System target: MTBF_sys = 50,000 h.

Current estimated MTBFs (from FMEA + supplier data):
- PSU: 30,000 h
- CPU: 80,000 h
- I/O: 60,000 h
- Enclosure: 200,000 h

Series-combined MTBF (current): 1/MTBF = 1/30000 + 1/80000 + 1/60000 + 1/200000
= 3.333e−5 + 1.250e−5 + 1.667e−5 + 5.000e−6
= 6.750e−5 ⇒ MTBF_current = 14,815 h (below 50,000 h target).

**ARINC allocation to 50,000 h target.**
- Σ 1/MTBF_j_current = 6.750e−5
- Weight_i = (1/MTBF_i_current) / Σ (1/MTBF_j_current)
  - PSU: 3.333e−5/6.750e−5 = 0.4938 → MTBF_alloc = 50,000/0.4938 ≈ 101,300 h? Wait — ARINC allocates proportional to current achievement (NOT inverse).

Let me re-do with the correct ARINC formula: MTBF_i_alloc = MTBF_sys × (MTBF_i_current / Σ MTBF_j_current) × n
- Σ MTBF_j_current = 30000 + 80000 + 60000 + 200000 = 370,000 h
- PSU: 50,000 × (30000/370000) × 4 = 50,000 × 0.0811 × 4 = 16,216 h
- CPU: 50,000 × (80000/370000) × 4 = 50,000 × 0.2162 × 4 = 43,243 h
- I/O: 50,000 × (60000/370000) × 4 = 50,000 × 0.1622 × 4 = 32,432 h
- Enclosure: 50,000 × (200000/370000) × 4 = 50,000 × 0.5405 × 4 = 108,108 h
- Verify: 1/MTBF_alloc_sys = 1/16216 + 1/43243 + 1/32432 + 1/108108 = 6.167e−5 + 2.312e−5 + 3.083e−5 + 9.250e−6 = 1.249e−4 ⇒ MTBF_alloc_sys = 8,007 h — well below 50,000 h target! ARINC has over-allocated to the weakest subsystem.

(ARINC is "fairer" but may not meet target; the team negotiates harder targets. For this exercise, switch to AGREE which weights by complexity × importance.)

**AGREE allocation.** n=4 subsystems; C_i = parts count (PSU=120, CPU=200, I/O=80, enclosure=20); W_i = importance (PSU=0.4 safety-critical, CPU=0.4 mission-critical, I/O=0.15 functional, enclosure=0.05 cosmetic).
- Σ(C_j × W_j) = 120×0.4 + 200×0.4 + 80×0.15 + 20×0.05 = 48 + 80 + 12 + 1 = 141
- MTBF_i_alloc = MTBF_sys × (n × C_i × W_i / Σ(C_j × W_j)) = 50,000 × (4 × C_i × W_i / 141)
- PSU: 50,000 × (4 × 48 / 141) = 50,000 × 1.362 = 68,085 h
- CPU: 50,000 × (4 × 80 / 141) = 50,000 × 2.270 = 113,475 h
- I/O: 50,000 × (4 × 12 / 141) = 50,000 × 0.340 = 17,021 h
- Enclosure: 50,000 × (4 × 1 / 141) = 50,000 × 0.0284 = 1,418 h ← too aggressive (enclosure is very low complexity)

(Illustrates AGREE's quirk — low-complexity low-importance subsystems get unreasonably low targets. In practice, AGREE results are reviewed and rebalanced.)

**DVP&R.** Four tests:
- HALT: 5 samples, 4 weeks; acceptance: address all failure modes found; design margin ≥ 2× use stress.
- ALT: 15 samples, 6 weeks at 70°C (Arrhenius acceleration factor AF = exp(Ea/k × (1/T_use − 1/T_test)); Ea=0.7 eV; AF ≈ 28); acceptance: lower-bound MTTF at use ≥ 50,000 h.
- Reliability qualification: 12 samples, 8 weeks at 1,000 h; acceptance: zero failures ⇒ demonstrate 95% reliability at 1,000 h at 50% confidence (n × t ≥ −ln(1−C)/λ).
- Reliability growth: 10 samples, 16 weeks; acceptance: Duane MTBF_inst ≥ 50,000 h at end of test.

**Duane growth fit.** Test data: (T1=500 h, N1=5 failures) → MTBF_cum1 = 100 h; (T2=2,000 h, N2=12 failures) → MTBF_cum2 = 166.7 h.
- β = ln(MTBF_cum1/MTBF_cum2) / ln(T1/T2) = ln(100/166.7) / ln(500/2000) = ln(0.6) / ln(0.25) = (−0.5108) / (−1.3863) = 0.3684
- α = 1 / (MTBF_cum1 × T1^(−β)) = 1 / (100 × 500^(−0.3684)) = 1 / (100 × 0.1244) = 1 / 12.44 = 0.08036
- MTBF_cum at T3 = 8,000 h = (1/0.08036) × 8000^0.3684 = 12.44 × 8000^0.3684
- 8000^0.3684 = exp(0.3684 × ln(8000)) = exp(0.3684 × 8.987) = exp(3.311) = 27.40
- MTBF_cum(8000) = 12.44 × 27.40 = 341 h
- MTBF_inst(8000) = MTBF_cum / (1 − β) = 341 / (1 − 0.3684) = 341 / 0.6316 = 540 h

The projected MTBF_inst = 540 h is well below the 50,000-h target. The growth rate is too slow; additional improvement actions are needed (redesign of the dominant failure mode, derating, supplier change, or extended growth test). A typical CRE recommendation: (i) FMEA on the top-3 failure modes from growth-test findings; (ii) redesign the dominant failure mode (cuts β higher → faster growth); (iii) extend growth test by 8 weeks (raises T3 to 16,000 h; MTBF_inst → 800 h — still short of 50,000 h); (iv) re-baseline the target (50,000 h may be unachievable with current design — negotiate with the customer).`,
    industrial_example: `**Aerospace (new avionics LRU).** Program target: MTBF = 25,000 h. Allocation (AGREE): RF front-end (high complexity, high importance) → 80,000 h; processor card (high complexity, high importance) → 50,000 h; power supply (medium complexity, high importance) → 40,000 h; enclosure (low complexity, low importance) → 200,000 h. Series-combined: 1/MTBF = 1/80000 + 1/50000 + 1/40000 + 1/200000 = 1.25e−5 + 2e−5 + 2.5e−5 + 5e−6 = 6.25e−5 ⇒ MTBF = 16,000 h. Below the 25,000-h target — the team re-allocates: power supply redesign (higher reliability capacitors) → 60,000 h; RF front-end derating → 100,000 h. New series MTBF: 1/100000 + 1/50000 + 1/60000 + 1/200000 = 1e−5 + 2e−5 + 1.667e−5 + 5e−6 = 5.167e−5 ⇒ MTBF = 19,354 h — still short. The program director extends the growth test from 16 weeks to 32 weeks; with β = 0.45, the projected MTBF_inst at T=32,000 h reaches 28,000 h — exceeding the 25,000-h target with margin.`,
    case_study: `CASE_TYPE = SYNTHETIC. A Medical Devices company developing an insulin-infusion pump faced a 30,000-h MTBF target with a 5-subsystem design (pump mechanism, motor driver, BMS, UI controller, enclosure). Initial ARINC allocation gave the pump mechanism (current MTBF 8,000 h) a target of 25,000 h — close to the system target — and the other subsystems 80,000-200,000 h. The DVP&R scheduled HALT (4 weeks), ALT (8 weeks at 50°C and 90% RH), qualification (12 samples × 2,000 h, zero failures, demonstrating 95% R at 1,000 h at 50% C), and growth (16 weeks). At week 12 of the 16-week growth test, MTBF_cum = 800 h (T=4,800 h, N=6 failures); Duane β = 0.42; projected MTBF_inst at T=16,000 h = 1,420 h — far below the 30,000-h target. The CRE led a top-3-failure-mode FMEA on growth-test findings; redesigned the pump-mechanism cam (cuts the dominant failure mode by 5×); restarted growth with the new design (β = 0.55, faster growth); at T=16,000 h, MTBF_inst = 5,200 h — still short. The team re-baselined the target to 12,000 h (still meeting the 8,000-h IEC 60601 requirement); redesigned the motor driver (adding a redundant H-bridge); final growth MTBF_inst = 14,800 h — exceeding the re-baselined 12,000-h target with 23% margin. Closed loop: allocation → DFR → DVP&R → growth → redesign → re-growth → confirm. The reliability culture was Defined-to-Managed at program start; the no-blame learning environment (failures in growth test were learning, not blame) allowed the redesign decisions. Method per Ebeling (2010, Ch. 14) and O'Connor (2012, Ch. 11).`,
    visual_explanation: `Reliability allocation Sankey diagram: the system MTBF target flows into n subsystem targets (sized by allocation weight); each subsystem target flows back into the series-combined MTBF, which must meet the target. DVP&R Gantt chart: HALT, ALT, qualification, growth — sequenced and gated. Duane growth log-log plot: ln(MTBF_cum) vs ln(T) — the slope is β; the instantaneous MTBF line lies above the cumulative by factor 1/(1−β). Culture maturity radar: 5 axes (leadership, collaboration, data-driven, no-blame, continuous-improvement) scored 1-5; the radar area is the maturity score.`,
    simulation_opportunity: `An interactive reliability-program simulator could let the learner set the system MTBF target, run an allocation (equal/ARINC/AGREE), simulate a growth test (vary β and α; observe MTBF_cum and MTBF_inst vs T), and project MTBF_inst at end of growth. The simulator would visualize the closed loop: target → allocation → DFR → DVP&R → growth → redesign → re-growth → confirm. A second panel could let the learner apply a redesign action (cuts the dominant failure mode by 5×) and observe the new β and projected MTBF_inst.`,
    common_mistakes: `- Allocation without checking the series-combined MTBF — the allocated targets may not sum to the system target.
- DVP&R tests skipped under schedule pressure (especially ALT and growth) — the program loses accountability.
- Reporting cumulative MTBF instead of instantaneous — over-states the design's current reliability.
- Confusing Duane β with Crow-AMSAA β (β_Crow = 1 − β_Duane — they are inverses).
- Setting the growth test duration too short — β extrapolation is unreliable below T ~ 1,000 h.
- Filing FMEAs instead of acting on them — the closed loop breaks at the action step.
- No-blame environment absent — failures are hidden, growth stalls at the first schedule slip.
- Treating the DVP&R as a paperwork exercise — the acceptance criteria are the program's accountability, not bureaucratic controls.`,
    limitations: `- Duane/Crow-AMSAA assume the NHPP — repairable systems with imperfect repair; not valid for one-shot or non-repairable items.
- The growth slope β is constant only over segments — major redesigns shift β; re-fit after each.
- Allocation methods (equal/ARINC/AGREE) are heuristics; real systems have interactions that series/parallel algebra does not capture.
- DVP&R demonstration confidence depends on the failure distribution (exponential assumed; Weibull needs different test plans).
- Culture maturity assessment is subjective; cross-team calibration is essential.
- Growth test extrapolation beyond T is risky — β may saturate as the easy failure modes are addressed.
- The closed loop depends on ISO 14224-coded CMMS data; uncoded field failures corrupt the sustainment analytics.`,
    comparison: `**Allocation methods:**
- Equal: each subsystem same target (MTBF_i = n × MTBF_sys); simplest; ignores subsystem differences.
- ARINC: proportional to current achievement; "fairer"; may not meet target if current spread is large.
- AGREE: complexity × importance weighted; most defensible; requires most up-front analysis.

**Growth models:**
- Duane: MTBF_cum = (1/α)·T^β; MTBF_inst = MTBF_cum/(1−β); β_Duane = growth slope (0.3-0.6 typical).
- Crow-AMSAA: E[N(t)] = λ·t^β (NHPP); β_Crow = 1 − β_Duane; β_Crow < 1 means growth.

**Culture maturity models:**
- Ad-hoc → Reactive → Defined → Managed → Optimizing (CMMI-style, ISO 55000-aligned).
- The reliability program cannot exceed the culture's Defined-to-Managed ceiling.`,
    practical_application: `- **Allocation at program kickoff:** the system MTBF target is decomposed; each subsystem team designs to its allocation.
- **DVP&R as the gating document:** design reviews (concept, design, pre-production, production) require DVP&R test pass before next-gate approval.
- **Growth test as the improvement engine:** test-find-fix-test cycles drive β > 0; the projected MTBF_inst at end of growth must exceed the target with margin.
- **FRACAS as the sustainment closed loop:** field-data feedback drives the next product cycle's allocation and DFR priorities.
- **Culture assessment annually:** the maturity model scorecard drives leadership investment in the four cultural levers.
- **ISO 55001 Cl. 7.2/9.3 consumption:** the asset-management plan and management review consume the program's outputs and approve the next investment cycle.`,
    decision_scenario: `You are the CRE on a new industrial controller program. System target: MTBF = 50,000 h. After 12 weeks of growth testing (T = 4,800 h, N = 6 failures), the Duane β = 0.42, α = 0.080; projected MTBF_inst at T = 16,000 h (end of 16-week growth) is 540 h — far below the 50,000-h target. Three actions are on the table: (A) extend the growth test by 16 weeks (T → 32,000 h; MTBF_inst → 800 h); (B) redesign the dominant failure mode (cuts its contribution by 5×; β rises to 0.55; restart growth test 16 weeks; MTBF_inst at T=16,000 h → 5,200 h); (C) re-baseline the target to 5,000 h (still meeting the 4,000-h customer requirement) and ship. Which action delivers the best 1-year outcome, and which would the customer accept?`,
    practice_questions: `- **Q1 (Easy, Recall):** State the three allocation methods (equal, ARINC, AGREE) and the differences among them.
- **Q2 (Medium, Calculation):** Given 4 subsystems with MTBFs 30,000, 80,000, 60,000, 200,000 h, compute the series-combined MTBF.
- **Q3 (Medium, Understand):** Distinguish cumulative MTBF from instantaneous MTBF in the Duane model; state the relationship.
- **Q4 (Hard, Analyze):** Given (T1=500, N1=5) and (T2=2,000, N2=12), fit Duane β and α; project MTBF_inst at T=8,000 h.`,
    certification_questions: `- **CRE-style (Easy):** Which DVP&R test demonstrates target reliability at a specified confidence?
- **CRE-style (Medium, Calculation):** A Duane fit gives β=0.4 and MTBF_cum(T=1000)=200 h. Compute MTBF_inst at T=1,000 h.
- **CRE-style (Hard, Analysis):** For a Crow-AMSAA fit with β=0.6, λ=0.02, compute the expected cumulative failures and instantaneous MTBF at T=10,000 h.`,
    summary: `A reliability program delivers a stated reliability target through five lifecycle phases — allocation (equal/ARINC/AGREE), design-for-reliability (FMEA, FTA, derating, redundancy), qualification (DVP&R: HALT, ALT, reliability demonstration), growth (Duane: MTBF_cum = (1/α)·T^β, MTBF_inst = MTBF_cum/(1−β); Crow-AMSAA: E[N(t)] = λ·t^β, β_Crow = 1 − β_Duane), and sustainment (FRACAS + CMMS field feedback). The DVP&R is the program's accountability instrument; the growth test is the improvement engine. Culture — leadership, collaboration, data-driven, no-blame — is the social substrate. ISO 55001 Cl. 7.2 (asset-management plan) and Cl. 9.3 (management review) consume the program's outputs.`,
    key_takeaways: `- Allocation = the design budget; verify the series-combined MTBF meets target.
- DVP&R = the program's accountability instrument; no test, no pass, no ship.
- Duane growth: MTBF_cum = (1/α)·T^β; MTBF_inst = MTBF_cum/(1−β); β > 0 means MTBF rising.
- Crow-AMSAA: E[N(t)] = λ·t^β; β_Crow = 1 − β_Duane; β_Crow < 1 means growth.
- Culture = leadership + collaboration + data-driven + no-blame; the maturity model scales Ad-hoc → Reactive → Defined → Managed → Optimizing.
- ISO 55001 Cl. 7.2 (asset-management plan) and Cl. 9.3 (management review) consume the program's outputs.`,
    references: `- ASQ CRE Body of Knowledge — Certified Reliability Engineer.
- ISO 55000:2014 — Asset management — Overview, principles and terminology.
- Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 14 (Reliability Program & Growth).
- O'Connor & Kleyner (2012), Practical Reliability Engineering, Ch. 11 (Reliability Testing & Growth), Ch. 15 (Reliability Management).
- Smith (2021), Reliability, Maintainability and Risk, Ch. 12 (Reliability Growth), Ch. 14 (Reliability Management).
- Mobley (2008), Maintenance Engineering Handbook, Section VIII (Reliability-Centered Maintenance & Program).`,
  },
  knowledgeObject: {
    title: "Reliability Program, Allocation, DVP&R & Growth",
    domain: "Reliability Fundamentals",
    competency: "Reliability Program & Culture",
    topic: "Reliability Fundamentals",
    concept: "Reliability program lifecycle, allocation (equal/ARINC/AGREE), DVP&R, Duane & Crow-AMSAA growth, culture",
    body: {
      definitions: [
        "Reliability program: the organized set of activities (allocation → DFR → qualification → growth → sustainment) that delivers a stated reliability target.",
        "Reliability allocation / apportionment: decomposing the system-level R(t) or MTBF target into subsystem/component targets.",
        "Equal apportionment: each subsystem gets the same target (MTBF_i = n × MTBF_sys).",
        "ARINC apportionment: allocation proportional to current achievement.",
        "AGREE apportionment: allocation weighted by complexity × importance.",
        "DVP&R: Design Verification Plan & Report — controlled document listing every reliability test, sample size, acceptance criteria, schedule, pass/fail report.",
        "HALT: Highly Accelerated Life Test — step-stress test to find failure modes and design margins.",
        "ALT: Accelerated Life Test — test at elevated stress to extrapolate use-stress reliability.",
        "Reliability qualification: demonstrate target reliability at specified confidence.",
        "Reliability growth: structured test-find-fix-test cycles; Duane and Crow-AMSAA models.",
        "Duane model: MTBF_cum(T) = (1/α)·T^β; MTBF_inst = MTBF_cum / (1 − β).",
        "Crow-AMSAA: E[N(t)] = λ·t^β (NHPP); β_Crow = 1 − β_Duane; β_Crow < 1 means growth.",
        "FRACAS: Failure Reporting, Analysis, and Corrective Action System — the field-data closed-loop system.",
        "Reliability culture maturity model: Ad-hoc → Reactive → Defined → Managed → Optimizing.",
      ],
      principles: [
        "The reliability program is a closed loop: allocation → DFR → qualification → growth → sustainment → redesign.",
        "Allocation is the design budget; series-combined MTBF must meet target (1/MTBF_sys = Σ 1/MTBF_i).",
        "DVP&R is the program's accountability instrument — no test, no pass, no ship.",
        "Reliability growth is test-find-fix-test; Duane and Crow-AMSAA quantify the rate.",
        "Cumulative vs instantaneous MTBF: MTBF_inst = MTBF_cum / (1 − β).",
        "Crow-AMSAA β < 1 means growth; β = 1 means no growth; β > 1 means degradation.",
        "Culture is the social substrate: leadership + collaboration + data-driven + no-blame.",
        "ISO 55001 Cl. 7.2 (asset-management plan) and Cl. 9.3 (management review) consume the program's outputs.",
      ],
      components: [
        "Reliability allocation table (system target → subsystem/component targets).",
        "DVP&R document (test × sample size × acceptance criteria × schedule × pass/fail report).",
        "HALT chamber, ALT chambers, reliability qualification rigs.",
        "Reliability growth tracking chart (Duane log-log plot of MTBF_cum vs T).",
        "FRACAS database (field failure reports, root-cause analyses, corrective actions).",
        "Reliability culture maturity assessment.",
        "Reliability KPI dashboard (MTBF trend, growth slope, DVP&R pass rate, FMEA closure rate).",
        "Asset-management plan (ISO 55001 Cl. 7.2.2) and management-review deck (Cl. 9.3).",
      ],
      mechanism: [
        "Reliability program lifecycle: define system target → allocate across subsystems (equal/ARINC/AGREE) → DFR (FMEA/FTA/derating/redundancy) → DVP&R (HALT/ALT/qualification/growth) → growth (Duane/Crow-AMSAA) → sustainment (FRACAS/CMMS) → redesign → re-test → confirm. ISO 55001 Cl. 7.2 consumes outputs; Cl. 9.3 reviews them.",
      ],
      process: [
        "1. Define the system reliability target at program kickoff.",
        "2. Allocate the target across subsystems (equal / ARINC / AGREE); verify series-combined MTBF ≥ target.",
        "3. Each subsystem team designs to its allocated target (DFR: FMEA, FTA, derating, redundancy).",
        "4. Draft the DVP&R: HALT, ALT, qualification, growth — sample size, acceptance criteria, schedule.",
        "5. Run HALT — find failure modes and design margins; address each before ALT.",
        "6. Run ALT — extrapolate use-stress MTTF; verify lower-bound ≥ target.",
        "7. Run reliability qualification — demonstrate target at specified confidence.",
        "8. Run reliability growth — test-find-fix-test; track Duane / Crow-AMSAA MTBF.",
        "9. Project MTBF_inst at end of growth; if below target, escalate redesign / derating / screening.",
        "10. Sustain with FRACAS + CMMS field-data feedback; re-allocate next product cycle.",
        "11. Refresh reliability culture maturity annually; target one maturity level per cycle.",
      ],
      formulas: [
        "Series MTBF: 1/MTBF_sys = Σ 1/MTBF_i.",
        "Equal: MTBF_i = n × MTBF_sys.",
        "ARINC: MTBF_i = MTBF_sys × (MTBF_i_current / Σ MTBF_j_current) × n.",
        "AGREE: MTBF_i = MTBF_sys × (n × C_i × W_i / Σ(C_j × W_j)).",
        "Duane cumulative MTBF: MTBF_cum(T) = (1/α)·T^β.",
        "Duane instantaneous MTBF: MTBF_inst(T) = MTBF_cum(T) / (1 − β).",
        "Duane fit from two points: β = ln(MTBF_cum1/MTBF_cum2) / ln(T1/T2).",
        "Crow-AMSAA: E[N(t)] = λ·t^β; MTBF_inst = 1 / (λ·β·t^(β−1)).",
        "Duane-Crow-AMSAA link: β_Crow = 1 − β_Duane.",
        "Zero-failure demonstration: n × t ≥ −ln(1−C)/λ (demonstrate R at confidence C).",
      ],
      metrics: [
        "Allocated vs series-combined MTBF [h] — allocation feasibility check.",
        "DVP&R test pass rate [%].",
        "Duane growth slope β (target 0.3-0.6).",
        "MTBF_inst at end of growth test [h] — must exceed target with margin.",
        "Reliability culture maturity level (Ad-hoc/Reactive/Defined/Managed/Optimizing).",
        "FMEA closure rate [%] — actions closed vs total identified.",
        "FRACAS mean time to close a failure report [days].",
        "Asset-management KPI dashboard (ISO 55001 Cl. 9.3).",
      ],
      examples: [
        "Industrial controller: target 50,000 h; AGREE allocation across 4 subsystems (PSU, CPU, I/O, enclosure) with complexity × importance weights.",
        "Aerospace avionics LRU: target 25,000 h; AGREE allocation; growth test extended from 16 to 32 weeks to meet target with β = 0.45.",
        "Medical insulin pump: target 30,000 h re-baselined to 12,000 h after growth-test findings; redesign of pump-mechanism cam + redundant H-bridge → MTBF_inst = 14,800 h.",
        "Duane fit example: (T1=200, N1=4) and (T2=1,000, N2=10) → β=0.43, α=0.20; MTBF_inst at T=2,000 h = 237 h.",
      ],
      industrial_examples: [
        "Industrial Automation — controller: AGREE allocation; DVP&R with HALT/ALT/qualification/growth; growth β tracking; redesign for top-3 failure modes.",
        "Aerospace — avionics LRU: 25,000-h target; AGREE allocation; growth test extended to meet target.",
        "Medical Devices — insulin pump: 30,000-h target re-baselined; redesign + redundant H-bridge; growth test confirmed target with margin.",
        "Oil & Gas — subsea electronics: 50,000-h target; AGREE allocation with high importance weights on safety-critical subsystems; redundancy + derating in DFR.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Medical Devices insulin-infusion pump: 30,000-h MTBF target; 5-subsystem design. ARINC allocated the pump mechanism (current 8,000 h) a target of 25,000 h. DVP&R: HALT 4 wk, ALT 8 wk (50°C/90% RH), qualification 12×2,000 h zero failures (95% R/50% C), growth 16 wk. At wk-12 of growth (T=4,800 h, N=6), Duane β=0.42, projected MTBF_inst at T=16,000 h = 1,420 h — far below target. CRE led top-3-mode FMEA on growth findings; redesigned pump-mechanism cam (5× failure-mode reduction); restarted growth (β=0.55); MTBF_inst at T=16,000 h = 5,200 h — still short. Team re-baselined target to 12,000 h (still meeting 8,000-h IEC 60601); redesigned motor driver (redundant H-bridge); final MTBF_inst = 14,800 h (23% margin over re-baselined target). Closed loop: allocation → DFR → DVP&R → growth → redesign → re-growth → confirm. Culture Defined-to-Managed; no-blame environment enabled redesign. Method per Ebeling (2010, Ch. 14) and O'Connor (2012, Ch. 11).",
      ],
      common_errors: [
        "Allocation without checking the series-combined MTBF.",
        "DVP&R tests skipped under schedule pressure (especially ALT and growth).",
        "Reporting cumulative MTBF instead of instantaneous — over-states current reliability.",
        "Confusing Duane β with Crow-AMSAA β (β_Crow = 1 − β_Duane; they are inverses).",
        "Setting growth test duration too short — β extrapolation unreliable below T ~ 1,000 h.",
        "Filing FMEAs instead of acting on them — closed loop breaks at the action step.",
        "No-blame environment absent — failures hidden, growth stalls at first schedule slip.",
        "Treating DVP&R as paperwork — acceptance criteria are accountability, not bureaucracy.",
      ],
      limitations: [
        "Duane/Crow-AMSAA assume the NHPP — repairable systems with imperfect repair.",
        "Growth slope β is constant only over segments — major redesigns shift β; re-fit after each.",
        "Allocation methods (equal/ARINC/AGREE) are heuristics; real systems have interactions.",
        "DVP&R demonstration confidence depends on the failure distribution (exponential assumed).",
        "Culture maturity assessment is subjective; cross-team calibration essential.",
        "Growth test extrapolation beyond T is risky — β may saturate as easy modes are addressed.",
        "Closed loop depends on ISO 14224-coded CMMS data; uncoded field failures corrupt sustainment.",
      ],
      best_practices: [
        "Verify the series-combined MTBF meets target before approving the allocation.",
        "DVP&R is a gating document at each design review (concept, design, pre-production, production).",
        "Run growth test long enough to extrapolate β confidently (T ≥ 1,000 h; ideally ≥ 5,000 h).",
        "Report MTBF_inst, not MTBF_cum, as the current reliability status.",
        "Re-fit Duane/Crow-AMSAA after every major redesign — the slope changes.",
        "Use FRACAS as the closed loop — every field failure gets a root-cause and corrective action.",
        "Assess culture maturity annually; invest in the four cultural levers (leadership, collaboration, data-driven, no-blame).",
        "Consume program outputs in the asset-management plan (ISO 55001 Cl. 7.2) and management review (Cl. 9.3).",
      ],
      related_concepts: [
        "Reliability Concepts & Terminology (Lesson 1) — R(t), exponential/Weibull, bathtub curve.",
        "Reliability Metrics (Lesson 2) — MTBF/MTTR/availability, λ, mission reliability.",
        "Failure Modes & Effects (Lesson 3) — FMEA/FMECA/RPN/FTA outputs feed the DFR and growth phases.",
        "ISO 55000:2014 — asset-management principles (value, alignment, leadership, assurance).",
        "ISO 55001 Cl. 7.2 — asset-management plan consumes the reliability program's outputs.",
        "ISO 55001 Cl. 9.3 — management review consumes the reliability KPI dashboard.",
        "IEC 60300-1 — dependability management — the international standard mirroring the reliability program.",
        "Crow-AMSAA / MIL-HDBK-781 — the military handbook for reliability-growth testing.",
      ],
      prerequisites: [
        "Lesson 1 (Reliability Concepts & Terminology) — R(t), exponential/Weibull.",
        "Lesson 2 (Reliability Metrics) — MTBF/MTTR/availability, failure rate λ.",
        "Lesson 3 (Failure Modes & Effects) — FMEA/FMECA, RPN, FTA (outputs feed the program).",
        "Series/parallel reliability block diagram algebra (1/R_sys = Σ 1/R_i for series).",
        "Basic log-arithmetic (Duane/Crow-AMSAA fits on log-log axes).",
      ],
      references: [
        "ASQ CRE Body of Knowledge — Certified Reliability Engineer.",
        "ISO 55000:2014 — Asset management — Overview, principles and terminology.",
        "Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 14.",
        "O'Connor & Kleyner (2012), Practical Reliability Engineering, Ch. 11, 15.",
        "Smith (2021), Reliability, Maintainability and Risk, Ch. 12, 14.",
        "Mobley (2008), Maintenance Engineering Handbook, Section VIII.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Reliability Program & Culture",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which of the following correctly describes the three reliability allocation methods?",
      whyCorrect:
        "Equal apportionment gives each of n subsystems the same target (MTBF_i = n × MTBF_sys). ARINC allocates proportional to current achievement (better-performing subsystems get less aggressive targets). AGREE weights by complexity × importance (more complex and more important subsystems get more aggressive targets). The three methods trade off simplicity (equal), fairness (ARINC), and defensibility (AGREE); the CRE selects based on available data and program maturity.",
      whyOthersWrong: [
        "Option A (Equal = by MTBF; ARINC = by severity; AGREE = by FMEA) confuses allocation with FMEA scoring — allocation is about decomposing the system target across subsystems, not failure-mode ranking.",
        "Option C (Equal = MTBF_i = MTBF_sys × n²; ARINC = proportional to complexity; AGREE = proportional to importance) gets Equal wrong (it is MTBF_i = n × MTBF_sys, not n²) and ARINC wrong (it is proportional to current achievement, not complexity).",
        "Option D (All three are equivalent and give the same allocation) is wrong — the three methods produce different allocations; the choice depends on subsystem equivalence, current-achievement data, and complexity/importance analysis.",
      ],
      explanation:
        "Equal: MTBF_i = n × MTBF_sys (same target for each). ARINC: proportional to current achievement. AGREE: weighted by complexity × importance. Different trade-offs in simplicity, fairness, defensibility.",
      options: [
        { text: "Equal = by MTBF; ARINC = by severity; AGREE = by FMEA ranking", isCorrect: false },
        { text: "Equal = same target per subsystem (n × MTBF_sys); ARINC = proportional to current achievement; AGREE = weighted by complexity × importance", isCorrect: true },
        { text: "Equal = MTBF_i = MTBF_sys × n²; ARINC = proportional to complexity; AGREE = proportional to importance", isCorrect: false },
        { text: "All three are equivalent and produce the same allocation", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability Program & Culture",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Aerospace",
      stem: "A Duane growth test reports two data points: (T1 = 500 h, N1 = 5 failures) and (T2 = 2,000 h, N2 = 12 failures). Compute the Duane growth slope β, and project the instantaneous MTBF at T3 = 8,000 h.",
      whyCorrect:
        "Step 1: Compute cumulative MTBFs. MTBF_cum1 = T1/N1 = 500/5 = 100 h. MTBF_cum2 = T2/N2 = 2000/12 = 166.67 h. Step 2: Solve β from MTBF_cum1/MTBF_cum2 = (T1/T2)^β. β = ln(MTBF_cum1/MTBF_cum2)/ln(T1/T2) = ln(100/166.67)/ln(500/2000) = ln(0.6)/ln(0.25) = (−0.5108)/(−1.3863) = 0.3684. Step 3: Solve α from MTBF_cum1 = (1/α)·T1^β. α = 1/(MTBF_cum1 × T1^(−β)) = 1/(100 × 500^(−0.3684)) = 1/(100 × 0.1244) = 0.08036. Step 4: Project MTBF_cum at T3 = 8,000 h. MTBF_cum(8000) = (1/0.08036) × 8000^0.3684 = 12.44 × 27.40 = 341 h. Step 5: Instantaneous MTBF = MTBF_cum/(1−β) = 341/(1−0.3684) = 341/0.6316 = 540 h. So β = 0.37, MTBF_inst = 540 h.",
      whyOthersWrong: [
        "Option A (β = 0.37, MTBF_inst = 540 h) is the correct answer; the distractor labels must differ.",
        "Option B (β = 0.37, MTBF_inst = 341 h) reports the cumulative MTBF, not the instantaneous — under-states by factor (1−β) = 0.63; instantaneous is always higher than cumulative during growth.",
        "Option C (β = 0.63, MTBF_inst = 924 h) confuses Duane β with Crow-AMSAA β (β_Crow = 1 − β_Duane = 0.63); the instantaneous MTBF computation would then use the wrong (1−β) factor.",
        "Option D (β = 0.37, MTBF_inst = 924 h) over-states by ~1.7× — likely used MTBF_inst = MTBF_cum × (1+β) instead of MTBF_cum/(1−β).",
      ],
      explanation:
        "MTBF_cum1 = 100 h; MTBF_cum2 = 166.67 h. β = ln(100/166.67)/ln(500/2000) = ln(0.6)/ln(0.25) = 0.37. α = 0.0804. MTBF_cum(8000) = (1/0.0804) × 8000^0.37 = 12.44 × 27.4 = 341 h. MTBF_inst = 341/(1−0.37) = 540 h.",
      options: [
        { text: "β = 0.37; MTBF_inst = 540 h (MTBF_cum = 341 h, divided by 1−β = 0.63)", isCorrect: true },
        { text: "β = 0.37; MTBF_inst = 341 h (cumulative, not instantaneous)", isCorrect: false },
        { text: "β = 0.63; MTBF_inst = 924 h (confuses Duane β with Crow-AMSAA β)", isCorrect: false },
        { text: "β = 0.37; MTBF_inst = 924 h (uses MTBF_cum × (1+β) instead of /(1−β))", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability Program & Culture",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      stem: "Which of the following correctly describes the relationship between Duane's growth slope β and Crow-AMSAA's β, and what each value means for reliability growth?",
      whyCorrect:
        "The two models are inversely parameterized: β_Crow-AMSAA = 1 − β_Duane. Duane's β is the growth slope of cumulative MTBF (MTBF_cum = (1/α)·T^β); β_Duane > 0 means MTBF is rising (growth). Crow-AMSAA's β is the power-law exponent of the failure-count NHPP (E[N(t)] = λ·t^β); β_Crow < 1 means the failure rate is decreasing (growth), β_Crow = 1 means constant (no growth), β_Crow > 1 means increasing failure rate (degradation). A typical growth program has β_Duane = 0.3–0.6, equivalent to β_Crow = 0.4–0.7.",
      whyOthersWrong: [
        "Option A (they are the same β; both > 1 means growth) is wrong — they are inversely parameterized; for Duane, β > 0 (any positive value) means growth; for Crow-AMSAA, β < 1 means growth.",
        "Option C (β_Duane > 1 means growth; β_Crow < 0 means growth) reverses the directions — for Duane β > 0 (any positive) means growth; for Crow-AMSAA β < 1 means growth.",
        "Option D (the two β values are unrelated; they describe different phenomena) is wrong — they are mathematically linked by β_Crow = 1 − β_Duane and describe the same underlying NHPP.",
      ],
      explanation:
        "β_Crow = 1 − β_Duane. Duane β > 0 = growth (cumulative MTBF rising). Crow-AMSAA β < 1 = growth (failure rate decreasing); β = 1 = no growth; β > 1 = degradation. A typical growth program has β_Duane = 0.3–0.6 (β_Crow = 0.4–0.7).",
      options: [
        { text: "They are the same β; both > 1 means growth", isCorrect: false },
        { text: "β_Crow = 1 − β_Duane; Duane β > 0 means growth; Crow-AMSAA β < 1 means growth", isCorrect: true },
        { text: "β_Duane > 1 means growth; β_Crow < 0 means growth", isCorrect: false },
        { text: "The two β values are unrelated; they describe different phenomena", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability Program & Culture",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: The DVP&R (Design Verification Plan & Report) is primarily a paperwork exercise to satisfy auditors; its main purpose is documentation rather than program accountability.",
      whyCorrect:
        "False. The DVP&R is the reliability program's accountability instrument — its purpose is to ensure every reliability test (HALT, ALT, qualification, growth) is run, with the specified sample size, against the specified acceptance criteria, on the specified schedule, with the pass/fail report filed. Without the DVP&R, tests may be skipped under schedule pressure, acceptance criteria may be quietly relaxed, and growth findings may be buried. The DVP&R's documentation role is secondary — its primary role is to enforce the program's commitment to delivering the stated reliability target. Treating it as paperwork is one of the most common reasons reliability programs fail to meet their targets.",
      whyOthersWrong: [
        "True — the candidate would miss the DVP&R's accountability function. While the document does provide a paper trail for auditors, its primary purpose is program accountability: every test gated by the DVP&R enforces the design review's commitment to the reliability target. Skipping DVP&R tests or relaxing acceptance criteria is exactly the failure mode the document prevents.",
      ],
      explanation:
        "DVP&R = the reliability program's accountability instrument. It enforces: every test run × sample size × acceptance criteria × schedule × pass/fail report. Documentation is secondary; accountability is primary. Treating DVP&R as paperwork is a top reason reliability programs fail to meet targets.",
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Public lesson array (4 lessons, one per RF competency)
// ---------------------------------------------------------------------------

export const CRE_RF_LESSONS: RefLesson[] = [
  LESSON_RELIABILITY_CONCEPTS,
  LESSON_RELIABILITY_METRICS,
  LESSON_FAILURE_MODES_EFFECTS,
  LESSON_RELIABILITY_PROGRAM,
];

// ---------------------------------------------------------------------------
// Loader — combines STRUCTURE + CONTENT in one idempotent loadReference().
// Mirrors cmrp.ts (structure) and cmrp-equipment-reliability.ts (content).
// ---------------------------------------------------------------------------

/**
 * Upsert the CRE certification STRUCTURE + RF CONTENT into the database.
 * Idempotent: safe to call repeatedly. Returns record counts written.
 *
 * Flow:
 *  (A) STRUCTURE
 *   1. Upsert Certification (slug "cre") + 7 CRE BOK domains
 *      (delete+recreate competencies/domains for CRE, like cmrp.ts).
 *   2. Link ISO 55000:2014 standard (findFirst by slug "iso-55000"; upsert
 *      CertificationStandard). The ISO 55000 standard is created by
 *      src/lib/ref-content/cmrp.ts; if absent we create it here as a fallback.
 *   3. Upsert CertificationVersion v2024 snapshot.
 *   4. Upsert LearningPath "cre-path".
 *  (B) CONTENT (RF pillar)
 *   5. Upsert References globally (by title, no sectionId) → shared ids.
 *   6. For each RF lesson: findFirst({competencyId, slug}) update/create
 *      (sectionId=null, certificationId, competencyId, status READY/HIGH/
 *      VERIFIED/v1.0.0, sections JSON, referenceIds JSON).
 *   7. Upsert KnowledgeObjects per lesson (findFirst by lessonId).
 *   8. Per lesson: deleteMany questions {certificationId, competencyId} then
 *      create enriched questions with nested options, knowledgeObjectId,
 *      whyCorrect, whyOthersWrong (JSON), referenceIds (JSON), status
 *      READY/VERIFIED/v1.0.0.
 *  (C) Return { certification, domains, competencies, lessons, kos,
 *      questions, references, standards, versions, learningPath }.
 */
export async function loadReference() {
  // ---- (A) STRUCTURE ----

  // 1) Certification (upsert by slug "cre")
  const certification = await db.certification.upsert({
    where: { slug: "cre" },
    create: {
      slug: "cre",
      name: "CRE",
      fullName: "Certified Reliability Engineer",
      body: "ASQ",
      currentVersion: "2024",
      bokReference: "ASQ CRE Body of Knowledge (7 domains)",
      examBlueprint: JSON.stringify({
        domains: 7,
        durationMin: 300,
        questionCount: 165,
        passingScore: "see ASQ",
        note:
          "Exam blueprint details (per-domain % weights, question count, duration, passing score) flagged REQUIRES_RESEARCH pending official ASQ CRE BOK load. The 7-domain structure itself is the published ASQ CRE BOK. Domain weight=0 below is a placeholder; the official ASQ exam blueprint publishes per-domain % weights.",
      }),
      effectiveDate: new Date("2024-01-01"),
      description:
        "The CRE, administered by ASQ (American Society for Quality), is the leading credential for reliability engineers. It validates competency across seven BOK domains: Reliability Fundamentals; Probability & Statistics; Reliability in Design & Development; Reliability Modeling; Reliability Testing; Reliability in Production & Operations; and Maintenance & Logistics. The CRE is recognized internationally as the canonical reliability-engineering certification.",
      color: "emerald",
      icon: "Award",
      order: 2,
      group: "Maintenance & Reliability",
    },
    update: {
      name: "CRE",
      fullName: "Certified Reliability Engineer",
      body: "ASQ",
      currentVersion: "2024",
      description:
        "The CRE, administered by ASQ (American Society for Quality), is the leading credential for reliability engineers. It validates competency across seven BOK domains: Reliability Fundamentals; Probability & Statistics; Reliability in Design & Development; Reliability Modeling; Reliability Testing; Reliability in Production & Operations; and Maintenance & Logistics. The CRE is recognized internationally as the canonical reliability-engineering certification.",
      group: "Maintenance & Reliability",
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
  for (let i = 0; i < CRE_DOMAINS.length; i++) {
    const d = CRE_DOMAINS[i];
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

  // 3) Link ISO 55000:2014 standard to CRE (findFirst by slug "iso-55000";
  //    upsert CertificationStandard). Fallback: create the standard if absent.
  let iso55000 = await db.standard.findUnique({ where: { slug: "iso-55000" } });
  if (!iso55000) {
    iso55000 = await db.standard.create({
      data: {
        slug: "iso-55000",
        name: "ISO 55000",
        organization: "ISO",
        number: "55000",
        version: "2014",
        description:
          "Asset management — Overview, principles and terminology. The umbrella standard for asset management.",
      },
    });
  }
  await db.certificationStandard.upsert({
    where: {
      certificationId_standardId: {
        certificationId: certification.id,
        standardId: iso55000.id,
      },
    },
    create: { certificationId: certification.id, standardId: iso55000.id },
    update: {},
  });

  // 4) Certification version snapshot (v2024)
  const rfDomain = CRE_DOMAINS.find((d) => d.code === "RF")!;
  const rfSnapshot = {
    rfDomain,
    rfCompetencies: rfDomain.competencies,
    standards: ["iso-55000"],
    examBlueprintNote:
      "Per-domain % weights flagged REQUIRES_RESEARCH pending official ASQ CRE BOK load.",
  };
  await db.certificationVersion.upsert({
    where: {
      certificationId_version: { certificationId: certification.id, version: "2024" },
    },
    create: {
      certificationId: certification.id,
      version: "2024",
      effectiveDate: new Date("2024-01-01"),
      bokSnapshot: JSON.stringify({
        domains: CRE_DOMAINS,
        standards: ["iso-55000"],
      }),
      changeLog:
        "Pilot structure: 7 ASQ CRE BOK domains seeded; RF pillar deep content (4 full-spec lessons + KOs + 16 questions). Exam blueprint weights flagged REQUIRES_RESEARCH.",
    },
    update: {
      effectiveDate: new Date("2024-01-01"),
      bokSnapshot: JSON.stringify({
        domains: CRE_DOMAINS,
        standards: ["iso-55000"],
      }),
    },
  });

  // 5) CRE learning path
  const path = await db.learningPath.upsert({
    where: { slug: "cre-path" },
    create: {
      slug: "cre-path",
      name: "CRE Certification Path",
      type: "Certification",
      certificationId: certification.id,
      description:
        "Structured path from Reliability Fundamentals through the seven ASQ CRE BOK domains to certification-readiness.",
      order: 2,
    },
    update: { certificationId: certification.id },
  });

  // ---- (B) CONTENT (RF pillar) ----

  // 6) Find the RF domain and map its 4 competencies by NAME -> id
  const rfDomainRecord = await db.domain.findFirst({
    where: { certificationId: certification.id, code: "RF" },
  });
  if (!rfDomainRecord) {
    throw new Error(
      'Reliability Fundamentals (RF) domain not found under CRE. Internal error — domains were just created.'
    );
  }
  const rfCompetencies = await db.competency.findMany({
    where: { domainId: rfDomainRecord.id },
  });
  const competencyIdByName: Record<string, string> = {};
  for (const c of rfCompetencies) {
    competencyIdByName[c.name] = c.id;
  }
  const expectedCompetencyNames = CRE_RF_LESSONS.map((l) => l.competencyName);
  const missing = expectedCompetencyNames.filter((n) => !competencyIdByName[n]);
  if (missing.length > 0) {
    throw new Error(
      `Missing RF competencies by name: ${missing.join(
        ", "
      )}. Ensure the CRE structure (7 domains + RF competencies) was seeded correctly.`
    );
  }

  // 7) References — global (no sectionId), upserted by title.
  const refIdsByTitle: Record<string, string> = {};
  for (const src of CRE_SOURCES) {
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
  const sharedReferenceIds = CRE_SOURCES.map((s) => refIdsByTitle[s.title]).filter(
    Boolean
  ) as string[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 8) Lessons, 9) KnowledgeObjects, 10) Questions
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of CRE_RF_LESSONS) {
    const competencyId = competencyIdByName[lesson.competencyName];
    if (!competencyId) {
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
      domainId: rfDomainRecord.id,
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
          domainId: rfDomainRecord.id,
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
    standards: 1, // ISO 55000 linked
    versions: 1,
    learningPath: path.id,
    lessons: lessonsCount,
    kos: kosCount,
    questions: questionsCount,
    references: referencesCount,
  };
}
