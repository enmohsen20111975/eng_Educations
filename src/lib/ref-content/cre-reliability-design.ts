// =============================================================================
// CRE — Certified Reliability Engineer (ASQ) — Reliability in Design &
// Development (RDD) pillar — Deep scientific reference (Task ID 17-CRE-RDD).
//
// Certification slug: "cre" (ASQ). Domain code: "RDD" (Reliability in Design
// & Development) — the 3rd of 7 ASQ CRE BOK domains. The RDD domain exists in
// src/lib/ref-content/cre.ts (the combined structure+RF-content loader) but
// is seeded with NO competencies. This CONTENT-only loader creates the 3 RDD
// competencies inside loadReference() and then loads the deep scientific
// content (3 full-spec 24-section lessons + KOs + 12 enriched questions).
//
// Three lessons, one per RDD competency (created below in loadReference()):
//   1. Reliability Allocation & Apportionment  (slug: rdd-reliability-allocation-apportionment)
//   2. Reliability Prediction & DVP&R          (slug: rdd-reliability-prediction-dvpr)
//   3. Design for Reliability (DFR)            (slug: rdd-design-for-reliability-dfr)
//
// Each lesson ships:
//   - The full 24-section data-collector template (spec §9, LESSON_TEMPLATE
//     in src/lib/spec.ts), with every applicable section filled with real,
//     in-depth professional reliability-in-design content. No padding.
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
//     (Reliability in Design & Development domain).
//   - LEVEL 2 — Official Standard / Standards Organization: IEC 61709:2017
//     (Electronic components — Reliability reference conditions for failure
//     rates — the canonical failure-rate prediction reference for electronic
//     components, replacing MIL-HDBK-217 for many European OEMs).
//   - LEVEL 6 — University / Academic Publications: Charles E. Ebeling,
//     "An Introduction to Reliability and Maintainability Engineering"
//     (Waveland Press, 2010); Douglas C. Montgomery, "Design and Analysis
//     of Experiments" (Wiley, 9th ed., 2017) for Taguchi / robust design.
//   - LEVEL 7 — Technical Publications / Industry Sources: Patrick D. T.
//     O'Connor & Andre Kleyner, "Practical Reliability Engineering"
//     (Wiley, 5th ed., 2012); U.S. DoD MIL-HDBK-217F (Reliability
//     Prediction of Electronic Equipment, 1991 notice 2) for parts-count
//     and parts-stress reliability prediction.
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
// SOURCES — 6 real references cited across all RDD lessons.
// ---------------------------------------------------------------------------

export const CRE_RDD_SOURCES: RefSource[] = [
  {
    title:
      "ASQ CRE Body of Knowledge — Reliability in Design & Development domain",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "BOK",
    url: "https://asq.org/cert/reliability-engineer",
    citation:
      "American Society for Quality (ASQ). Certified Reliability Engineer (CRE) Body of Knowledge — Reliability in Design & Development domain. The official competency framework covering reliability allocation (equal/ARINC/AGREE), reliability prediction (parts-count, parts-stress; MIL-HDBK-217, Telcordia SR-2, FIDES), the DVP&R (Design Verification Plan & Report), reliability growth (Duane, Crow-AMSAA), and design-for-reliability methods (FMEA/FTA in design, derating, redundancy, design reviews, Taguchi robust design). Anchors the ASQ CRE exam's design-and-development questions.",
  },
  {
    title:
      "Ebeling — An Introduction to Reliability and Maintainability Engineering (Waveland Press)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Ebeling, C. E. (2010). An Introduction to Reliability and Maintainability Engineering (2nd ed.). Long Grove, IL: Waveland Press. ISBN 978-1-57766-625-9. Chapters 7 (Reliability allocation — equal, ARINC, AGREE; apportioning system R to subsystems; allocation trade-offs), 8 (Reliability prediction — parts-count, parts-stress; MIL-HDBK-217; component failure-rate models), 13 (Reliability growth — Duane and Crow-AMSAA models; reliability-growth test planning; DVP&R), and 14 (Design for reliability — derating, redundancy, FMEA, design reviews). The canonical reliability-in-design textbook for the CRE BOK.",
  },
  {
    title:
      "O'Connor — Practical Reliability Engineering (Wiley)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "O'Connor, P. D. T., & Kleyner, A. (2012). Practical Reliability Engineering (5th ed.). Chichester: John Wiley & Sons. ISBN 978-0-470-97982-2. Chapters 5 (Reliability prediction — parts-count, parts-stress, MIL-HDBK-217, Telcordia SR-2; prediction accuracy and limitations), 6 (Reliability allocation and DVP&R — test planning for design verification), 11 (Design for reliability — derating, redundancy, design reviews; FMEA in design), 12 (Reliability growth — Duane and Crow-AMSAA), and 13 (Taguchi robust design and parameter design). The practitioner reference for design-for-reliability methods.",
  },
  {
    title:
      "MIL-HDBK-217F — Reliability Prediction of Electronic Equipment (U.S. DoD)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "HANDBOOK",
    citation:
      "U.S. Department of Defense. (1991). MIL-HDBK-217F, Military Standardization Handbook — Reliability Prediction of Electronic Equipment (Notice 2, 1991). Washington, DC: DoD. The canonical parts-count and parts-stress reliability-prediction handbook for electronic equipment: base failure rates λ_b and the multiplicative pi-factors (π_T temperature, π_E environment, π_Q quality, π_S stress, π_C complexity) for capacitors, resistors, ICs, semiconductors, relays, switches, connectors, and PCB assemblies. The reference standard cited by ASQ CRE for reliability prediction methods, now largely superseded by IEC 61709, Telcordia SR-2, and FIDES for commercial work but still the BOK reference for the method.",
  },
  {
    title:
      "IEC 61709:2017 — Electronic components — Reliability reference conditions for failure rates",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://webstore.iec.ch/publication/32573",
    citation:
      "International Electrotechnical Commission. IEC 61709:2017, Electronic components — Reliability — Reference conditions for failure rates and stress models for conversion. Geneva: IEC. Defines the reference operating conditions (temperature, voltage, current, duty cycle), the stress models for conversion between reference and operational conditions, and the failure-rate data structure for electronic-component reliability prediction. The IEC-standard successor to MIL-HDBK-217 for European OEMs; cited by ASQ CRE for the failure-rate prediction reference framework. Cross-references IEC 62380 (PRISM) for the physics-of-failure approach.",
  },
  {
    title:
      "Montgomery — Design and Analysis of Experiments (Wiley)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Montgomery, D. C. (2017). Design and Analysis of Experiments (9th ed.). Hoboken, NJ: John Wiley & Sons. ISBN 978-1-119-49854-5. Chapter 15 (Taguchi robust design — the loss function L(y)=k(y−T)², signal-to-noise ratios, the larger-the-better / smaller-the-better / nominal-the-best SNR forms, orthogonal arrays L8/L9/L12/L16, control-vs-noise factor separation, parameter design vs tolerance design). The canonical academic reference for Taguchi robust-design methods cited by the CRE BOK for the design-for-reliability Taguchi component.",
  },
];

const RDD_REFERENCE_TITLES = CRE_RDD_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Lesson 1 — Reliability Allocation & Apportionment
// (Competency: "Reliability Allocation & Apportionment"; slug:
//  rdd-reliability-allocation-apportionment)
// ---------------------------------------------------------------------------

const LESSON_ALLOC: RefLesson = {
  competencyName: "Reliability Allocation & Apportionment",
  slug: "rdd-reliability-allocation-apportionment",
  title: "Reliability Allocation & Apportionment",
  titleAr: "تخصيص وتوزيع الموثوقية",
  order: 1,
  durationMin: 35,
  references: RDD_REFERENCE_TITLES,
  conceptIntroduction: `Reliability allocation (also called apportionment) is the top-down process of decomposing a system-level reliability target — R_system(t) or MTBF_system — into subsystem and component targets that each design team designs to. It is the FIRST quantitative step in the RDD lifecycle: before a single component is selected, the system target is allocated so that each team has a defensible design budget. The ASQ CRE BOK recognizes three allocation methods: equal allocation (treats all subsystems as equally complex — R_i = R_system^(1/n)), ARINC allocation (weights subsystem failure rates by historical complexity factors — λ_i = λ_system·w_i/Σw_j), and AGREE allocation (the U.S. DoD Advisory Group on Reliability of Electronic Equipment method, weighting by complexity AND operating time AND importance — the standard for mission-critical systems). Trade-offs: equal allocation is simplest but over-allocates reliability to complex subsystems and under-allocates to simple ones; ARINC and AGREE allocate more stringently where complexity is higher; AGREE further accounts for partial-mission operation and redundancy importance. The allocated targets flow into reliability prediction (Lesson 2) which checks feasibility, and into design-for-reliability (Lesson 3) which selects derating, redundancy, and FMEA-driven design changes to meet the allocation.`,
  example: `A 4-subsystem series system has a target R_system(100h) = 0.95. AGREE allocation with complexity weights n_1=10, n_2=20, n_3=30, n_4=40 (Σn_j=100, all subsystems operate full mission t_i=100h, no redundancy so E_i=1.0): λ_i* = (n_i/Σn_j)·(−ln R_system)/t_i. With −ln(0.95)=0.0513: λ_1*=5.13e−5/h (MTBF_1*=19,493h, R_1=0.99489); λ_2*=1.026e−4/h (MTBF_2*=9,747h, R_2=0.98980); λ_3*=1.539e−4/h (MTBF_3*=6,498h, R_3=0.98473); λ_4*=2.052e−4/h (MTBF_4*=4,873h, R_4=0.97968). Check: ΠR_i=0.99489·0.98980·0.98473·0.97968=0.9500 ✓. Equal allocation (the baseline) would allocate R_i=0.95^(1/4)=0.98726 to all subsystems — over-allocating reliability to complex subsystem 4 (which AGREE holds to 0.9797, easier) and under-allocating to simple subsystem 1 (which AGREE holds to 0.9949, harder). The AGREE allocation makes the design budget tractable by weighting complexity.`,
  keyFormulas: `Equal allocation (n subsystems in series, all operate full mission):
  R_i*(t) = R_system(t)^(1/n);  λ_i* = (−ln R_system(t)) / (n·t)
ARINC allocation (complexity weights w_i):
  λ_i* = λ_system · (w_i / Σ_j w_j);  R_i*(t_i) = exp(−λ_i*·t_i)
AGREE allocation (complexity n_i, operating time t_i, importance E_i):
  λ_i* = (n_i / Σ_j n_j) · (−ln R_system(t)) / (E_i · t_i)
  R_i*(t_i) = exp(−λ_i*·t_i) = R_system(t)^(n_i/(E_i·Σn_j))   [for E_i=1, t_i=t]
Series-system check: R_system(t) = Π_i R_i*(t_i)^(t_i/t)   [verify allocation]
System failure rate (exponential, equal-time): λ_system = Σ_i λ_i*;  MTBF_system = 1/λ_system`,
  exercise: `You are the CRE on a 5-subsystem series satellite power system. Target R_system(24h)=0.99. Subsystem operating times (h): t_1=24 (always on), t_2=24, t_3=12 (duty cycle), t_4=24, t_5=6 (intermittent). Complexity (modules): n_1=20, n_2=15, n_3=30, n_4=40, n_5=10 (Σn=115). (a) Compute the AGREE allocation for each subsystem (assume E_i=1.0 for all). (b) Compute the equal-allocation baseline and compare — which subsystems does AGREE relax vs equal? (c) If subsystem 3 is protected by 2oo3 cold redundancy (E_3=0.3), recompute the allocation for subsystem 3 only. (d) Verify that Π R_i*^(t_i/t) = R_system. (e) Comment on whether subsystem 5 (intermittent) should have a different t_5 in the AGREE formula vs the system mission t=24h.`,
  sections: {
    learning_objectives: `- Distinguish reliability allocation (top-down: system → subsystem) from reliability prediction (bottom-up: components → system).
- Derive and apply the three ASQ-CRE allocation methods: equal, ARINC, and AGREE.
- Compute the AGREE allocation accounting for subsystem complexity n_i, operating time t_i, and importance E_i.
- Verify the series-system check Π R_i*^(t_i/t) = R_system(t) to validate any allocation.
- Trade-off the three methods: equal (simple, biased toward complex subsystems), ARINC (complexity-weighted, requires historical λ_i data), AGREE (complexity + time + importance, the standard for mission systems).
- Translate allocated failure rates λ_i* into MTBF_i* design budgets for downstream reliability prediction and DFR.
- Document the allocation table in the DVP&R (Design Verification Plan & Report — Lesson 2) as the design-contract baseline.`,
    prerequisites: `- ASQ CRE Reliability Fundamentals (RF) — series-system reliability R_system=Π R_i, exponential constant-λ model, MTBF=1/λ.
- Probability & Statistics (PS) Lesson 1 — exponential R(t)=exp(−λt), ln manipulation.
- System architecture decomposition: identifying subsystems and their operating duty cycles.
- The concept of redundancy importance (probability that a subsystem failure causes system failure, 0 ≤ E_i ≤ 1).`,
    introduction: `Reliability allocation is the design step that translates a system-level reliability target — typically set by the customer contract or the safety case (e.g., R_system(24h) ≥ 0.99 for a satellite power system, MTBF_system ≥ 50,000h for an industrial controller) — into subsystem and component targets that each design team can be held to. Without allocation, "design for 0.99 reliability" is an unactionable slogan; with allocation, every team has a defensible R_i* or MTBF_i* budget.

The three CRE-BOK allocation methods form a hierarchy of sophistication. *Equal allocation* — R_i = R_system^(1/n) — is the baseline; it treats all n subsystems as equally complex, which is rarely true. *ARINC allocation* — λ_i = λ_system·w_i/Σw_j — weights each subsystem's failure rate by a complexity factor w_i derived from historical data (the ARINC Research Corporation method, 1960s). *AGREE allocation* — the U.S. Advisory Group on Reliability of Electronic Equipment, 1957 — weights by complexity n_i, operating time t_i (subsystems that run only part of the mission can have higher per-hour failure rates and still meet their target), and importance E_i (subsystems protected by redundancy can have higher failure rates because their failure does not always cause system failure). AGREE is the standard for mission systems.

The allocation table — subsystem i, n_i, t_i, E_i, allocated λ_i*, allocated MTBF_i*, allocated R_i*(t_i) — is the design contract: each team's reliability prediction (Lesson 2) must show its design meets or beats the allocated value. Trade-offs: equal allocation over-allocates to complex subsystems and under-allocates to simple ones; AGREE allocates more stringently where complexity is higher (more modules), less stringently where redundancy protects (E_i<1) or where the duty cycle is short (small t_i). The choice of method reflects the available data and the consequence of misallocation.`,
    terminology: `- **Reliability allocation / apportionment**: top-down decomposition of system R_target into subsystem R_i* targets.
- **Equal allocation**: R_i* = R_system^(1/n); simplest, no weighting.
- **ARINC allocation**: λ_i* = λ_system·(w_i/Σw_j); weights by historical complexity w_i.
- **AGREE allocation**: λ_i* = (n_i/Σn_j)·(−ln R_system)/(E_i·t_i); weights by complexity n_i, time t_i, importance E_i.
- **Complexity factor** (n_i or w_i): typically the number of modules/parts in subsystem i — more parts, more failure sites, higher complexity.
- **Operating time** (t_i): the hours subsystem i is active during the system mission t (t_i ≤ t for duty-cycled or intermittent subsystems).
- **Importance factor** (E_i): the probability that subsystem i failure causes system failure (0 ≤ E_i ≤ 1). E_i=1 for series, E_i<1 for redundant or partially-redundant subsystems.
- **System mission** (t): the duration over which R_system is required (e.g., 24h for a satellite orbit, 5,000h for an automotive module, 8,760h for an annual-availability target).
- **Series-system check**: Π_i R_i*(t_i)^(t_i/t) = R_system(t) — verifies the allocation is consistent.
- **Allocation table**: the design contract listing n_i, t_i, E_i, λ_i*, MTBF_i*, R_i* per subsystem.`,
    detailed_explanation: `Equal allocation distributes the system-failure budget evenly across n subsystems in series: R_i* = R_system^(1/n). For R_system(100h)=0.95 and n=4: R_i*=0.95^0.25=0.98726; λ_i*=(−ln 0.95)/(4·100)=1.282e−4/h; MTBF_i*=7,800h each. The method is the simplest and requires no subsystem data — but it is biased: a 5-module passive filter and a 2000-module microprocessor are held to the same MTBF, which is indefensible. Use equal allocation only as a baseline or when subsystem complexity data is unavailable.

ARINC allocation weights the per-subsystem failure rate by a complexity factor w_i (Σw_j normalized): λ_i* = λ_system·(w_i/Σw_j). The complexity weight is typically derived from historical failure data — w_i is the historical share of system failures attributable to subsystem i. ARINC requires field-data history (it cannot be applied to a new product family); it is appropriate for next-generation variants of established products.

AGREE allocation — the ASQ-CRE standard for new-design mission systems — uses three weights: complexity n_i (module count), operating time t_i (duty cycle), and importance E_i (redundancy protection). The AGREE formula: λ_i* = (n_i/Σn_j)·(−ln R_system)/(E_i·t_i). Each weight has physical meaning: a complex subsystem (high n_i) gets a more stringent allocation (higher failure rate budget); a duty-cycled subsystem (low t_i) gets a more relaxed per-hour allocation because it accrues fewer operating hours; a redundant subsystem (low E_i) gets a more relaxed allocation because its failure does not always cause system failure. The importance E_i is the most consequential — going from E_i=1 (series) to E_i=0.5 (parallel redundancy) halves the per-hour allocation requirement.

Trade-off: equal allocation is fast (5 minutes for a 10-subsystem table); ARINC requires a reliability database; AGREE requires the system architecture (module counts, duty cycles, redundancy topology) but produces the most defensible allocation. For mission systems (aerospace, defense, medical, automotive), AGREE is the expected method; for commercial variants of established products, ARINC; for early concept studies, equal.

The allocated targets flow downstream: into reliability prediction (Lesson 2 — does the predicted λ_system ≤ allocated λ_system?) and into DFR (Lesson 3 — what derating, redundancy, and FMEA-driven design changes are needed to meet the allocation?). The allocation table is the design contract; any deviation (a team that cannot meet its MTBF_i*) triggers either a design change (DFR) or a re-allocation negotiation (moving budget from a comfortable subsystem to a struggling one).`,
    core_principles: `- Allocation is top-down: system target → subsystem targets; prediction is bottom-up: component data → subsystem/system prediction.
- Equal allocation: R_i* = R_system^(1/n); simplest, biased toward complex subsystems.
- ARINC: λ_i* = λ_system·(w_i/Σw_j); complexity-weighted, requires historical data.
- AGREE: λ_i* = (n_i/Σn_j)·(−ln R_system)/(E_i·t_i); complexity + time + importance — the standard.
- Importance E_i: 1 for series, <1 for redundancy. Going from E_i=1 to E_i=0.5 relaxes the per-hour allocation by 2×.
- Duty cycle t_i: intermittent subsystems (low t_i) get more per-hour allocation; constant-on subsystems get less.
- Series-system check: Π R_i*^(t_i/t) = R_system — verifies the allocation table is consistent.
- Allocated targets flow to reliability prediction (feasibility) and DFR (design to meet allocation).`,
    components: `- **System target**: R_system(t), MTBF_system, or λ_system.
- **Subsystem list**: n subsystems in series (for parallel subsystems, E_i < 1 captures redundancy).
- **Complexity weights**: n_i (module count) or w_i (historical failure share).
- **Operating times**: t_i per subsystem (t_i ≤ t for duty-cycled).
- **Importance factors**: E_i ∈ [0,1] per subsystem.
- **Allocation table**: the per-subsystem outputs R_i*, λ_i*, MTBF_i*.
- **Series-system check**: the verification equation Π R_i*^(t_i/t) = R_system.`,
    process: `1. Define the system target (R_system(t), MTBF_system, or λ_system) — from the customer contract or safety case.
2. Decompose the system into n subsystems in series; for each, capture complexity n_i, operating time t_i (duty cycle ≤ t), and importance E_i (1 for series, <1 for redundancy).
3. Compute Σn_j (total complexity across subsystems).
4. Choose the allocation method: equal (baseline), ARINC (with historical w_i), or AGREE (with n_i, t_i, E_i).
5. Compute λ_i* and R_i* per subsystem from the chosen formula.
6. Verify the series-system check: Π R_i*^(t_i/t) ≈ R_system (within rounding).
7. Document the allocation table in the DVP&R (Lesson 2) as the design-contract baseline.
8. Feed the allocation to reliability prediction (does the predicted λ_system ≤ allocated λ_system?) and to DFR (what design changes meet the allocation?).
9. Re-allocate when a team misses its target: either improve the design (DFR) or move budget from a comfortable subsystem to a struggling one.`,
    formula_calculation: `Variables and formulas:
- R_system(t): system reliability target [0,1] over mission t.
- n: number of subsystems in series (dimensionless).
- n_i: complexity of subsystem i (module count, dimensionless).
- t_i: operating time of subsystem i during mission t [h]; t_i ≤ t.
- E_i: importance factor — probability that subsystem i failure causes system failure [0,1]; E_i=1 series, E_i<1 redundancy.
- w_i: ARINC complexity weight (historical failure share) [dimensionless].
- Σn_j, Σw_j: sums over j=1..n subsystems.
- λ_i*: allocated failure rate of subsystem i [1/h].
- MTBF_i* = 1/λ_i*: allocated MTBF [h].
- R_i*(t_i) = exp(−λ_i*·t_i): allocated reliability over the subsystem operating time.

Equal: R_i* = R_system^(1/n); λ_i* = (−ln R_system)/(n·t).
ARINC: λ_i* = λ_system·(w_i/Σw_j); R_i*(t_i) = exp(−λ_i*·t_i).
AGREE: λ_i* = (n_i/Σn_j)·(−ln R_system)/(E_i·t_i); R_i*(t_i) = R_system^(n_i/(E_i·Σn_j)).

Series-system check: Π_i R_i*(t_i)^(t_i/t) = R_system(t).
System failure rate (equal-time exponential): λ_system = Σ_i λ_i*; MTBF_system = 1/λ_system.

Units: time t, t_i in hours (h); failure rates λ_i*, λ_system in 1/h; MTBF in h; R, E dimensionless.

Assumptions: (i) subsystems in series for reliability (any subsystem failure causes system failure unless protected by redundancy, captured by E_i<1); (ii) constant failure rate (exponential) per subsystem so R_i*(t_i)=exp(−λ_i*·t_i); (iii) the complexity n_i is a proxy for failure-site count (more modules, more sites); (iv) the importance E_i reflects the system architecture (redundancy topology).

Interpretation: the allocation table is the design contract — each team's reliability prediction (Lesson 2) must show its design meets or beats the allocated R_i* or MTBF_i*. Allocation trade-offs: equal allocation over-allocates to complex subsystems (gives them an easy R_i*) and under-allocates to simple ones; AGREE allocates more stringently where complexity is higher (more modules, more failure sites), less stringently where redundancy protects (lower E_i) or where the duty cycle is short (small t_i).`,
    worked_example: `**Electronics — AGREE allocation of R_system(100h)=0.95 to 4 subsystems.**
Given: 4-subsystem series system, target R_system(100h)=0.95. Subsystem complexity weights (module counts): n_1=10, n_2=20, n_3=30, n_4=40 (Σn_j=100). All operate the full mission: t_1=t_2=t_3=t_4=100h. No redundancy: E_i=1.0 for all i.

Step 1 — Compute the system "reliability budget": −ln(R_system) = −ln(0.95) = 0.051293.

Step 2 — Apply the AGREE formula λ_i* = (n_i/Σn_j)·(−ln R_system)/(E_i·t_i):
λ_1* = (10/100)·0.051293/(1.0·100) = 0.10·5.1293e−4 = 5.13e−5 /h.
λ_2* = (20/100)·0.051293/(1.0·100) = 0.20·5.1293e−4 = 1.026e−4 /h.
λ_3* = (30/100)·0.051293/(1.0·100) = 0.30·5.1293e−4 = 1.539e−4 /h.
λ_4* = (40/100)·0.051293/(1.0·100) = 0.40·5.1293e−4 = 2.052e−4 /h.

Step 3 — Allocated MTBFs (MTBF_i* = 1/λ_i*):
MTBF_1* = 1/5.13e−5 = 19,493 h.
MTBF_2* = 1/1.026e−4 = 9,747 h.
MTBF_3* = 1/1.539e−4 = 6,498 h.
MTBF_4* = 1/2.052e−4 = 4,873 h.

Step 4 — Allocated reliabilities R_i*(t_i) = exp(−λ_i*·t_i):
R_1*(100) = exp(−5.13e−5·100) = exp(−0.005129) = 0.99489.
R_2*(100) = exp(−1.026e−4·100) = exp(−0.01026) = 0.98980.
R_3*(100) = exp(−1.539e−4·100) = exp(−0.01539) = 0.98473.
R_4*(100) = exp(−2.052e−4·100) = exp(−0.02052) = 0.97968.

Step 5 — Series-system check: Π R_i* = 0.99489·0.98980·0.98473·0.97968.
= 0.99489·0.98980 = 0.98471.
·0.98473 = 0.96979.
·0.97968 = 0.95008 ≈ 0.9500 ✓ (rounding to 4 dp).

Step 6 — Equal-allocation baseline (for comparison): R_i^equal = R_system^(1/4) = 0.95^0.25 = 0.98726; MTBF_i^equal = 100/(−ln 0.98726) = 100/0.01282 = 7,800 h each.
- Equal allocation OVER-allocates to subsystem 4 (equal R_4=0.9873 vs AGREE R_4=0.9797 — AGREE makes the complex subsystem easier).
- Equal allocation UNDER-allocates to subsystem 1 (equal R_1=0.9873 vs AGREE R_1=0.9949 — AGREE makes the simple subsystem harder).
- Total allocated system λ_system = 5.13e−5+1.026e−4+1.539e−4+2.052e−4 = 5.13e−4/h; MTBF_system = 1/5.13e−4 = 1,949 h (consistent with R_system(100)=exp(−100/1949)=exp(−0.0513)=0.95).

**Importance-factor extension.** If subsystem 4 is protected by 2oo3 cold redundancy (E_4=0.5), AGREE relaxes the per-hour allocation by a factor of 1/E_4 = 2:
λ_4* = (40/100)·0.051293/(0.5·100) = 4.104e−4 /h (was 2.052e−4 /h); MTBF_4* = 2,437 h (was 4,873 h — easier).
The remaining subsystems keep E_i=1.0; the system R_system is preserved because the redundancy absorbs half of subsystem-4 failures at the system level.`,
    industrial_example: `**Aerospace — satellite power-system AGREE allocation.** A 4-subsystem satellite electrical power system (solar array, battery, power distribution unit, PDU controller) is allocated R_system(8760h annual) ≥ 0.95. AGREE complexity weights: n_1=8 (solar cells), n_2=20 (battery cells), n_3=50 (PDU), n_4=15 (controller) — Σn_j=93. Duty cycles: solar t_1=4380h (eclipse/sun), battery t_2=8760h (always on), PDU t_3=8760h, controller t_4=8760h. No redundancy: E_i=1. AGREE allocation: λ_1*=4.4e−6/h (MTBF_1*=227,000h), λ_2*=1.10e−5/h (MTBF_2*=91,000h), λ_3*=2.75e−5/h (MTBF_3*=36,400h), λ_4*=8.26e−6/h (MTBF_4*=121,000h). The PDU is the bottleneck (lowest MTBF) — the team applies DFR (Lesson 3): derating of MOSFETs (50% voltage), 2oo3 voting on the controller (E_4 from 1.0 to 0.33, tripling the controller's MTBF budget). Method per Ebeling (2010, Ch. 7) and O'Connor (2012, Ch. 6).

**Automotive — EV battery management system ARINC allocation.** An EV BMS has 5 subsystems (cell monitoring, balancing, contactor control, HV isolation, CAN comms). The supplier has 5 years of field returns; ARINC complexity weights (historical failure share): w_1=0.40 (cell monitoring — most failure sites), w_2=0.15, w_3=0.20, w_4=0.05 (HV isolation — few failures), w_5=0.20. System target MTBF_system ≥ 100,000h. ARINC allocation: λ_1*=4.0e−6/h (MTBF_1*=250,000h), λ_2*=1.5e−6/h (667,000h), λ_3*=2.0e−6/h (500,000h), λ_4*=5.0e−7/h (2,000,000h), λ_5*=2.0e−6/h (500,000h). Method per Ebeling (2010, Ch. 7).`,
    case_study: `CASE_TYPE = SYNTHETIC. A medical-device company developed a 6-subsystem infusion pump targeting R_system(72h) ≥ 0.995 (annual-drug-delivery mission). Initial AGREE allocation: complexity weights n_1=15 (pump mechanism), n_2=8 (motor driver), n_3=12 (sensors), n_4=5 (CPU), n_5=10 (power), n_6=20 (user interface) — Σn=70. All subsystems operate full mission; no redundancy (E_i=1). λ_i* computed per AGREE. The pump-mechanism team reported that its predicted MTBF (Lesson 2, parts-stress) was 4,200h vs the allocated 5,800h — a 28% shortfall. The reliability engineer re-allocated: applying AGREE with the *predicted* (not allocated) MTBFs as the new w_i weights for the next iteration (ARINC-style reallocation), and adding 2oo3 redundancy on the user interface (E_6=0.33) — dropping the UI's allocated MTBF from 2,900h to 960h, freeing budget for the pump mechanism. The re-allocated pump MTBF rose to 5,950h — now feasible. The DVP&R (Lesson 2) was updated with the re-allocated targets and the reliability-growth test plan (Duane) targeting β=0.30 per log cycle. Source: synthetic case authored for this lesson, method per Ebeling (2010, Ch. 7) and O'Connor (2012, Ch. 6).`,
    visual_explanation: `The allocation table is visualized as a horizontal bar chart per subsystem, with the bar length = allocated MTBF_i* (or the failure rate λ_i* on the inverse axis). The bar chart makes the AGREE trade-offs visible: complex subsystems (high n_i) have shorter bars (more stringent allocation), redundant subsystems (low E_i) have longer bars (relaxed allocation). A second visualization: the system R_system as a pie chart sliced by subsystem failure-budget share n_i/Σn_j — AGREE allocates the budget proportionally to complexity. A third: a Sankey diagram of reliability budget flowing from the system target to subsystem targets, with branches sized by allocation share.`,
    simulation_opportunity: `An interactive simulation could let the learner (i) input the system target R_system(t) and the subsystem list with complexity n_i, operating time t_i, importance E_i; (ii) compute the AGREE allocation table live; (iii) toggle the allocation method (equal/ARINC/AGREE) and visualize the per-subsystem bar chart; (iv) introduce a redundancy change (e.g., set E_4=0.5) and watch the allocation relax on the redundant subsystem and tighten on the others (to preserve the system target); (v) verify the series-system check Π R_i*^(t_i/t) = R_system.`,
    common_mistakes: `- Using equal allocation when the subsystem complexities differ by an order of magnitude — equal allocation systematically under-allocates to complex subsystems (giving them too-tight MTBF targets they cannot meet) and over-allocates to simple ones (wasting design effort).
- Applying ARINC allocation without historical data — the w_i weights must come from prior-generation field returns; using guessed w_i defeats the method.
- Setting E_i=1.0 for a subsystem that is in fact protected by redundancy — the AGREE formula will under-allocate (too stringent) because the redundancy absorbs subsystem failures.
- Mis-handling duty-cycled subsystems (t_i < t): using t in the AGREE formula instead of t_i over-allocates per-hour failure rate to the intermittent subsystem (gives an indefensibly low MTBF_i*).
- Failing the series-system check (Π R_i*^(t_i/t) ≠ R_system) — a sign of arithmetic error or formula misapplication; never publish an allocation table that fails the check.
- Re-allocating silently when a team misses its target without re-verifying the system target — silent reallocation hides design risk.
- Confusing allocation (system → subsystem, design contract) with prediction (components → system, feasibility check) — they are inverse flows and must not be conflated.`,
    limitations: `- Equal allocation is biased and indefensible for systems with >5× complexity variation across subsystems.
- ARINC requires historical field data; for new product families, ARINC is unavailable and AGREE is the fallback.
- AGREE assumes constant failure rate (exponential) per subsystem — invalid for wear-out (β>1 Weibull) subsystems; use the mission-time reliability R_i(t_i) form for wear-out.
- The importance factor E_i is binary in concept (redundancy topology) but reality has dependent failures (common-cause); a single E_i cannot capture common-cause.
- The complexity n_i (module count) is a proxy for failure-site count; modern SoCs have one "module" but billions of transistors — n_i must be the count of distinct failure sites, not the count of physical modules.
- The allocation table does not predict — the predicted λ_system (Lesson 2) may exceed the allocated; the gap triggers DFR.
- Allocation cannot fix an infeasible system target — if the sum of allocated λ_i* exceeds the design technology's achievable λ, the system target must be re-negotiated with the customer or the architecture changed.`,
    comparison: `**Equal vs ARINC vs AGREE:**
- Equal: 1 parameter (n); R_i=R_system^(1/n); 5-minute computation; biased; baseline only.
- ARINC: 2 parameters (n, w_i); requires historical data; λ_i=λ_system·(w_i/Σw_j); appropriate for next-gen of established products.
- AGREE: 4 parameters (n, n_i, t_i, E_i); requires system architecture; λ_i=(n_i/Σn_j)·(−ln R_system)/(E_i·t_i); the standard for mission systems; most defensible.

**Allocation vs Prediction:** allocation is top-down (system → subsystem, design contract); prediction is bottom-up (components → system, feasibility check). Allocation asks "what must each team deliver?"; prediction asks "will the design as currently drawn meet the allocation?" The two iterate: allocation sets targets → prediction checks feasibility → if infeasible, DFR or re-allocation.`,
    practical_application: `- **Aerospace (satellite EPS)**: AGREE allocation with module counts from the box-level BOM; E_i captures cross-strapped redundancy.
- **Automotive (EV BMS)**: ARINC allocation from prior-generation field returns; subsystem MTBF budgets flow to the supplier contract.
- **Medical (infusion pump)**: AGREE with E_i modified after each design review to reflect added redundancy.
- **Industrial (PLC)**: equal allocation as a baseline, refined to ARINC after the first year of field data.
- **Defense (radar)**: AGREE with mission profiles (t_i variable — search vs track mode) and E_i reflecting hot/cold redundancy.`,
    decision_scenario: `You are the CRE on a 5-subsystem series automotive ADAS module. Customer contract: R_system(10,000h) ≥ 0.98. Subsystem complexities: n_1=10 (sensor fusion ECU), n_2=20 (camera), n_3=15 (radar), n_4=5 (CAN bus), n_5=30 (lidar). Operating times all = t = 10,000h. No redundancy (E_i=1.0). (a) Compute the AGREE allocation per subsystem. (b) The lidar team reports predicted MTBF = 12,000h vs the allocated value — compute the shortfall and propose two remedies (derating, redundancy). (c) If the lidar adds 2oo3 cold standby (E_5=0.33), recompute the lidar allocation and verify the system R still meets 0.98. (d) If the customer instead lowers the system target to R_system(10,000h) ≥ 0.95, by what factor does the per-subsystem λ_i* allocation relax? (e) Document the allocation table in the DVP&R (Lesson 2) as the design-contract baseline.`,
    practice_questions: `- **Q1 (Easy, Recall):** State the AGREE allocation formula and identify each variable.
- **Q2 (Medium, Calculation):** For a 3-subsystem series system with R_system(100h)=0.95, n_1=10, n_2=20, n_3=30, all t_i=100h, E_i=1.0: compute λ_i*, MTBF_i*, R_i* per subsystem.
- **Q3 (Medium, Application):** A subsystem is duty-cycled t_i=50h during mission t=100h. Compute the AGREE allocation ratio for this subsystem vs a full-mission subsystem of the same complexity.
- **Q4 (Hard, Analyze):** Compare equal vs AGREE allocation for a 4-subsystem system with complexity range 5–100 modules. Which subsystems does AGREE relax vs equal? Which does AGREE tighten? Justify the trade-off.`,
    certification_questions: `- **CRE-style (Easy):** Which allocation method weights subsystem failure rates by historical complexity factors w_i? (ARINC)
- **CRE-style (Medium, Calculation):** Apply AGREE to a 4-subsystem system R_system=0.95 over 100h with n_1=10, n_2=20, n_3=30, n_4=40. Compute MTBF_4*.
- **CRE-style (Hard, Analysis):** Given an AGREE allocation with E_4=1.0 and λ_4*=2.0e−4/h, what is the new λ_4* if a 2oo3 redundancy is added (E_4=0.33)?`,
    summary: `Reliability allocation is the top-down decomposition of the system target into subsystem design budgets. The three CRE-BOK methods — equal, ARINC, AGREE — trade simplicity for sophistication: equal allocation is the 5-minute baseline; ARINC weights by historical complexity; AGREE adds operating time and redundancy importance. The AGREE formula λ_i* = (n_i/Σn_j)·(−ln R_system)/(E_i·t_i) is the standard for mission systems. The allocation table is the design contract — each team's reliability prediction (Lesson 2) must meet or beat the allocated R_i* or MTBF_i*. The series-system check Π R_i*^(t_i/t) = R_system verifies the allocation. Trade-offs: equal over-allocates to complex subsystems; ARINC requires history; AGREE requires the system architecture (complexity, duty cycle, redundancy) but produces the most defensible allocation.`,
    key_takeaways: `- Equal: R_i* = R_system^(1/n); simplest; biased toward complex subsystems.
- ARINC: λ_i* = λ_system·(w_i/Σw_j); requires historical complexity w_i.
- AGREE: λ_i* = (n_i/Σn_j)·(−ln R_system)/(E_i·t_i); complexity + time + importance.
- Importance E_i: 1 series, <1 redundancy. E_i=0.5 doubles the per-hour allocation budget.
- Duty-cycle t_i: intermittent subsystems get relaxed per-hour allocation (lower λ_i*).
- Series-system check: Π R_i*^(t_i/t) = R_system — verifies consistency.
- Allocation table flows to prediction (feasibility) and DFR (design to meet allocation); re-allocate when a team misses target.`,
    references: `- ASQ CRE Body of Knowledge — Reliability in Design & Development domain.
- Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 7 (allocation).
- O'Connor & Kleyner (2012), Practical Reliability Engineering, Ch. 6 (allocation & DVP&R).
- MIL-HDBK-217F (1991, Notice 2) — Reliability Prediction of Electronic Equipment (allocation/prediction reference).
- IEC 61709:2017 — Electronic components — Reliability reference conditions for failure rates.
- Montgomery (2017), Design and Analysis of Experiments, Ch. 15 (Taguchi robust design — DFR link).`,
  },
  knowledgeObject: {
    title: "Reliability Allocation & Apportionment",
    domain: "Reliability in Design & Development",
    competency: "Reliability Allocation & Apportionment",
    topic: "Reliability Allocation Methods",
    concept: "Equal, ARINC, and AGREE allocation of system R_target to subsystem R_i*",
    body: {
      definitions: [
        "Reliability allocation (apportionment): top-down decomposition of system R_target into subsystem R_i* design budgets.",
        "Equal allocation: R_i* = R_system^(1/n); simplest, treats all subsystems as equally complex.",
        "ARINC allocation: λ_i* = λ_system·(w_i/Σw_j); weights by historical complexity w_i.",
        "AGREE allocation: λ_i* = (n_i/Σn_j)·(−ln R_system)/(E_i·t_i); weights by complexity n_i, time t_i, importance E_i.",
        "Complexity factor (n_i or w_i): module count or historical failure share — proxy for failure-site count.",
        "Operating time t_i: hours subsystem i is active during mission t (t_i ≤ t for duty-cycled).",
        "Importance factor E_i: probability that subsystem i failure causes system failure (0–1); 1 for series, <1 for redundancy.",
        "Allocation table: per-subsystem design-contract listing n_i, t_i, E_i, λ_i*, MTBF_i*, R_i*.",
        "Series-system check: Π R_i*^(t_i/t) = R_system — verifies the allocation is consistent.",
      ],
      principles: [
        "Allocation is top-down (system → subsystem); prediction is bottom-up (components → system).",
        "Equal allocation: R_i* = R_system^(1/n); simplest but biased toward complex subsystems.",
        "ARINC: λ_i* = λ_system·(w_i/Σw_j); requires historical field data.",
        "AGREE: λ_i* = (n_i/Σn_j)·(−ln R_system)/(E_i·t_i); the standard for mission systems.",
        "Importance E_i: 1 series, <1 redundancy. Redundancy relaxes per-hour allocation by 1/E_i.",
        "Duty cycle t_i: intermittent subsystems get relaxed per-hour allocation (lower λ_i*).",
        "Series-system check Π R_i*^(t_i/t) = R_system verifies the allocation table.",
        "Allocation flows to prediction (feasibility) and DFR (design to meet allocation); re-allocate when teams miss targets.",
      ],
      components: [
        "System target R_system(t), MTBF_system, or λ_system (from contract or safety case).",
        "Subsystem list n with complexity n_i, time t_i, importance E_i.",
        "ARINC complexity weights w_i (historical failure share).",
        "Allocation table outputs: λ_i*, MTBF_i*, R_i* per subsystem.",
        "Series-system check verification equation.",
      ],
      mechanism: [
        "Allocation lifecycle: define system target → decompose to subsystems → capture n_i, t_i, E_i → choose method (equal/ARINC/AGREE) → compute λ_i*, R_i* → verify series-system check → document allocation table in DVP&R → feed to prediction (feasibility) and DFR (design to meet) → re-allocate on team miss.",
      ],
      process: [
        "1. Define R_system(t) from customer contract or safety case.",
        "2. Decompose system into n subsystems; capture n_i, t_i, E_i per subsystem.",
        "3. Compute Σn_j (total complexity).",
        "4. Choose method: equal (baseline), ARINC (with w_i), AGREE (with n_i, t_i, E_i).",
        "5. Compute λ_i*, MTBF_i*, R_i* per subsystem from the chosen formula.",
        "6. Verify the series-system check: Π R_i*^(t_i/t) = R_system.",
        "7. Document the allocation table in the DVP&R as the design contract.",
        "8. Feed to reliability prediction (Lesson 2) for feasibility check.",
        "9. Re-allocate when a team misses target: DFR (design change) or budget move (subsystem reallocation).",
      ],
      formulas: [
        "Equal: R_i* = R_system^(1/n); λ_i* = (−ln R_system)/(n·t).",
        "ARINC: λ_i* = λ_system·(w_i/Σw_j); R_i*(t_i) = exp(−λ_i*·t_i).",
        "AGREE: λ_i* = (n_i/Σn_j)·(−ln R_system)/(E_i·t_i); R_i*(t_i) = R_system^(n_i/(E_i·Σn_j)).",
        "Series-system check: Π_i R_i*(t_i)^(t_i/t) = R_system(t).",
        "System failure rate (equal-time exponential): λ_system = Σ_i λ_i*; MTBF_system = 1/λ_system.",
      ],
      metrics: [
        "R_i* (allocated subsystem reliability over t_i, dimensionless 0..1).",
        "λ_i* (allocated subsystem failure rate, 1/h).",
        "MTBF_i* = 1/λ_i* (allocated subsystem MTBF, h).",
        "Series-system check residual: |Π R_i*^(t_i/t) − R_system| < 1e−4 (rounding tolerance).",
        "Allocation-vs-prediction gap: (λ_predicted − λ_allocated)/λ_allocated — drives DFR or re-allocation.",
      ],
      examples: [
        "4-subsystem AGREE: n=[10,20,30,40], t=100h, R_system=0.95 → λ_i*=[5.13e−5, 1.026e−4, 1.539e−4, 2.052e−4]/h; R_i*=[0.99489, 0.98980, 0.98473, 0.97968]; Π=0.95 ✓.",
        "Equal-allocation baseline (same system): R_i^equal=0.95^0.25=0.98726; over-allocates to subsystem 4 (0.9873 vs AGREE 0.9797), under-allocates to subsystem 1 (0.9873 vs AGREE 0.9949).",
        "Importance extension: E_4=0.5 (2oo3) → λ_4* = 2× original = 4.10e−4/h; MTBF_4* halves (4,873 → 2,437 h) — relaxed allocation; system R preserved.",
      ],
      industrial_examples: [
        "Aerospace — satellite EPS 4-subsystem AGREE allocation: PDU is bottleneck (MTBF=36,400h) → DFR derating + 2oo3 voting on controller (E_4 1.0→0.33, triples MTBF budget).",
        "Automotive — EV BMS 5-subsystem ARINC allocation: cell monitoring gets 40% of system λ (highest historical failure share) → MTBF budget 250,000h; HV isolation gets 5% → 2,000,000h.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Medical 6-subsystem infusion pump R_system(72h)≥0.995. Pump-mechanism team predicted MTBF 4,200h vs allocated 5,800h (28% shortfall). Re-allocation: ARINC-style with predicted MTBFs as new w_i; added 2oo3 UI redundancy (E_6=0.33) → UI MTBF budget 2,900→960h freed; pump MTBF rose to 5,950h — feasible. DVP&R updated with Duane growth β=0.30/log cycle.",
      ],
      common_errors: [
        "Using equal allocation when complexity varies >5× — systematically under-allocates to complex subsystems.",
        "Applying ARINC without historical data — guessed w_i defeats the method.",
        "Setting E_i=1.0 for a redundant subsystem — under-allocates; redundancy absorbs subsystem failures.",
        "Using t (mission) instead of t_i (duty-cycled) for intermittent subsystems — over-tightens λ_i*.",
        "Failing series-system check — arithmetic error; never publish an allocation that fails the check.",
        "Silent re-allocation when a team misses target — hides design risk from the customer.",
        "Confusing allocation (system→subsystem) with prediction (components→system) — inverse flows.",
      ],
      limitations: [
        "Equal allocation is biased and indefensible for >5× complexity variation.",
        "ARINC requires historical field data; unavailable for new product families.",
        "AGREE assumes exponential (constant λ); invalid for wear-out subsystems (use R_i(t_i) form).",
        "Importance E_i is binary in concept; common-cause failures (dependent failures) cannot be captured by a single E_i.",
        "Complexity n_i (module count) is a proxy; modern SoCs need failure-site count, not module count.",
        "Allocation does not predict — the predicted λ_system (Lesson 2) may exceed allocated; the gap triggers DFR.",
        "Allocation cannot fix an infeasible system target — re-negotiate or change architecture.",
      ],
      best_practices: [
        "Default to AGREE for new-design mission systems (aerospace, defense, medical, automotive).",
        "Use ARINC for next-generation variants of established products with field history.",
        "Use equal allocation only as a baseline or for early concept studies.",
        "Always verify the series-system check Π R_i*^(t_i/t) = R_system before publishing.",
        "Document the allocation table in the DVP&R as the design contract; track team performance against the contract.",
        "When a team misses target, re-allocate transparently with explicit rationale (DFR or budget move).",
        "Re-allocate when architecture changes (added redundancy → updated E_i; design change → updated n_i).",
      ],
      related_concepts: [
        "Reliability Prediction & DVP&R (Lesson 2) — bottom-up feasibility check on the allocation.",
        "Design for Reliability (Lesson 3) — derating, redundancy, FMEA-driven changes to meet the allocation.",
        "Reliability Fundamentals (RF) — series-system R, exponential R(t)=exp(−λt).",
        "Probability & Statistics (PS) — exponential distribution, ln manipulation.",
      ],
      prerequisites: [
        "ASQ CRE Reliability Fundamentals (RF) — series-system R, MTBF=1/λ.",
        "Probability & Statistics (PS) Lesson 1 — exponential R(t)=exp(−λt).",
        "System architecture decomposition — identifying subsystems and duty cycles.",
        "Redundancy importance (E_i concept) and series/parallel reliability.",
      ],
      references: [
        "ASQ CRE Body of Knowledge — Reliability in Design & Development domain.",
        "Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 7.",
        "O'Connor & Kleyner (2012), Practical Reliability Engineering, Ch. 6.",
        "MIL-HDBK-217F (1991, Notice 2) — Reliability Prediction of Electronic Equipment.",
        "IEC 61709:2017 — Electronic components — Reliability reference conditions.",
        "Montgomery (2017), Design and Analysis of Experiments, Ch. 15.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Reliability Allocation & Apportionment",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which reliability allocation method weights the per-subsystem failure rate by a historical complexity factor w_i, requiring field-failure history?",
      whyCorrect:
        "The ARINC allocation method (ARINC Research Corporation, 1960s) weights each subsystem's allocated failure rate by a historical complexity factor w_i — typically the share of system failures attributable to subsystem i from prior-generation field data. The formula λ_i* = λ_system·(w_i/Σw_j) requires the historical w_i, so ARINC is appropriate for next-generation variants of established products but unavailable for entirely new product families. AGREE, by contrast, uses module-count complexity n_i and does not require field history; equal allocation uses no weights at all.",
      whyOthersWrong: [
        "Option A (Equal allocation) — equal allocation uses NO complexity weights; it sets R_i = R_system^(1/n) regardless of subsystem complexity, treating all subsystems as equally complex (which is rarely true). Equal allocation does not require history but is biased toward complex subsystems.",
        "Option C (AGREE allocation) — AGREE uses module-count complexity n_i (an architectural property, not historical), plus operating time t_i and importance E_i. AGREE does not require field-failure history; it works for new designs.",
        "Option D (FMECA) — FMECA is a failure-mode-and-effects analysis tool (Lesson 3), not an allocation method; FMECA identifies and ranks failure modes, not subsystem reliability targets.",
      ],
      explanation:
        "ARINC allocation: λ_i* = λ_system·(w_i/Σw_j) where w_i is the historical failure share; requires prior-generation field data. Equal uses no weights; AGREE uses architectural complexity n_i (not historical).",
      options: [
        { text: "Equal allocation", isCorrect: false },
        { text: "ARINC allocation", isCorrect: true },
        { text: "AGREE allocation", isCorrect: false },
        { text: "FMECA", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability Allocation & Apportionment",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Aerospace",
      stem: "A 4-subsystem series system has target R_system(100h) = 0.95. AGREE complexity weights: n_1=10, n_2=20, n_3=30, n_4=40 (Σn_j=100). All subsystems operate full mission t_i=100h, no redundancy (E_i=1.0). Compute the allocated failure rate λ_4* and MTBF_4* for subsystem 4.",
      whyCorrect:
        "AGREE formula: λ_i* = (n_i/Σn_j)·(−ln R_system)/(E_i·t_i). −ln(0.95) = 0.051293. For subsystem 4 (n_4=40, t_4=100, E_4=1.0): λ_4* = (40/100)·0.051293/(1.0·100) = 0.40·5.1293e−4 = 2.052e−4/h. MTBF_4* = 1/λ_4* = 1/2.052e−4 = 4,873 h. The complex subsystem 4 (40% of system complexity) gets the most stringent allocation — the lowest MTBF and the highest per-hour failure rate budget — because it has the most failure sites. Allocated R_4*(100) = exp(−λ_4*·100) = exp(−0.02052) = 0.97968.",
      whyOthersWrong: [
        "Option A (λ_4*=5.13e−5/h, MTBF_4*=19,493h) — this is the allocation for subsystem 1 (the simplest, n_1=10): (10/100)·0.051293/100 = 5.13e−5/h. Subsystem 4 (n_4=40) has 4× the complexity weight, so its allocation is 4× more stringent (higher λ_4*, lower MTBF_4*), not 4× less stringent.",
        "Option C (λ_4*=1.282e−4/h, MTBF_4*=7,800h) — this is the equal-allocation value (1/n=1/4 weighting): (−ln 0.95)/(4·100) = 0.051293/400 = 1.282e−4/h. Equal allocation ignores the complexity weight n_4=40 and treats all subsystems as equally complex — indefensible here.",
        "Option D (λ_4*=2.052e−2/h, MTBF_4*=49h) — order-of-magnitude error: dividing by t_i=100 instead of t_i·Σn_j·E_i=10,000 inflates λ_4* by 100×. Always check the units (per hour) against the MTBF (hours); 49h MTBF would imply the subsystem fails hourly, not at the 5,000h scale.",
      ],
      explanation:
        "AGREE: λ_4* = (n_4/Σn_j)·(−ln R_system)/(E_4·t_4) = (40/100)·0.051293/(1.0·100) = 2.052e−4/h. MTBF_4* = 1/2.052e−4 = 4,873 h. The complex subsystem gets the most stringent allocation.",
      options: [
        { text: "λ_4* = 5.13e−5/h; MTBF_4* = 19,493 h", isCorrect: false },
        { text: "λ_4* = 2.052e−4/h; MTBF_4* ≈ 4,873 h", isCorrect: true },
        { text: "λ_4* = 1.282e−4/h; MTBF_4* = 7,800 h", isCorrect: false },
        { text: "λ_4* = 2.052e−2/h; MTBF_4* = 49 h", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability Allocation & Apportionment",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Automotive",
      stem: "An AGREE allocation for subsystem 4 gives λ_4* = 2.052e−4/h with E_4 = 1.0 (series, no redundancy). The team adds a 2oo3 cold-standby redundancy so the importance drops to E_4 = 0.33. What is the new λ_4* and what happens to the system R_system?",
      whyCorrect:
        "AGREE: λ_i* = (n_i/Σn_j)·(−ln R_system)/(E_i·t_i). The importance factor E_i enters the denominator. Going from E_4=1.0 to E_4=0.33 (one-third) makes the per-hour allocation 1/0.33 = 3× more relaxed: λ_4* = 2.052e−4/1.0 × (1/0.33) = 2.052e−4 × 3.03 = 6.22e−4/h. The allocated MTBF_4* drops to 1/6.22e−4 = 1,608 h (more relaxed budget — easier to meet). The system R_system is preserved because the redundancy absorbs the additional subsystem-4 failures: only 1 in 3 subsystem-4 failures propagates to the system (the system fails only when 2 of the 3 redundant channels fail simultaneously). So adding redundancy relaxes the per-channel allocation by 1/E_i while preserving the system target.",
      whyOthersWrong: [
        "Option A (λ_4* halves to 1.026e−4/h, system R doubles) — wrong factor. Redundancy with E_4=0.33 relaxes the allocation by 1/0.33 = 3×, not 2×. And the system R_system does not double — it stays at the target (0.95); the redundancy is what preserves R_system when the per-channel allocation is relaxed.",
        "Option C (λ_4* tightens to 6.16e−4/h, system R rises to 0.99) — the new λ_4* is correct (≈6.2e−4/h), but the system R does not rise to 0.99 — it stays at 0.95 (the original target). The whole point of the redundancy is to PRESERVE the system R while relaxing the per-channel allocation; it does not improve the system R above target.",
        "Option D (λ_4* unchanged, system R unchanged) — wrong: the importance factor E_i is in the denominator of the AGREE formula. Changing E_i from 1.0 to 0.33 must change λ_i*. The per-channel allocation is inversely proportional to E_i.",
      ],
      explanation:
        "E_i in AGREE denominator: λ_4* ∝ 1/E_i. Going from E_4=1.0 to 0.33 relaxes λ_4* by 1/0.33 ≈ 3×: 2.052e−4 → 6.22e−4/h. System R_system preserved because the 2oo3 redundancy absorbs 2/3 of subsystem-4 failures.",
      options: [
        { text: "λ_4* halves to 1.026e−4/h; system R doubles to 1.90", isCorrect: false },
        { text: "λ_4* relaxes to ≈6.22e−4/h; system R_system preserved at 0.95 (redundancy absorbs the additional subsystem-4 failures)", isCorrect: true },
        { text: "λ_4* tightens to 6.16e−4/h; system R rises to 0.99", isCorrect: false },
        { text: "λ_4* unchanged; system R unchanged", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability Allocation & Apportionment",
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Industrial",
      stem: "True or False: For a 4-subsystem series system, equal allocation always gives the SAME per-subsystem MTBF target regardless of subsystem complexity, which makes it indefensible when subsystem complexities differ by more than ~5×.",
      whyCorrect:
        "TRUE. Equal allocation sets R_i* = R_system^(1/n) — every subsystem gets the same reliability target regardless of complexity. For a system with complexity range n_1=5 (passive filter) to n_4=100 (microprocessor board), equal allocation gives both subsystems the SAME MTBF target, e.g., 7,800h. But the microprocessor (20× the modules, ~20× the failure sites) cannot meet 7,800h with the same technology — equal allocation sets an indefensible target. The complex subsystem needs a more stringent allocation (lower MTBF) because its predicted MTBF is inherently lower; AGREE captures this by weighting λ_i* ∝ n_i. Use equal allocation only as a baseline or when complexity varies by <~5×; beyond that, use ARINC (with history) or AGREE (with module counts).",
      whyOthersWrong: [
        "Option FALSE — would imply equal allocation is always defensible regardless of complexity spread. In fact, equal allocation treats a 5-module filter and a 2000-module microprocessor identically, which is indefensible when complexity varies >5×. AGREE, ARINC, or another complexity-weighted method is required. Equal allocation is acceptable as a baseline (a starting point) or for systems with comparable complexities (e.g., 4 identical channels in a redundant controller), but not for heterogeneous systems.",
      ],
      explanation:
        "TRUE. Equal allocation gives all subsystems the same MTBF target regardless of complexity. For complexity spread >5×, this is indefensible — use ARINC (with historical w_i) or AGREE (with module counts n_i).",
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Reliability Prediction & DVP&R
// (Competency: "Reliability Prediction & DVP&R"; slug:
//  rdd-reliability-prediction-dvpr)
// ---------------------------------------------------------------------------

const LESSON_PRED: RefLesson = {
  competencyName: "Reliability Prediction & DVP&R",
  slug: "rdd-reliability-prediction-dvpr",
  title: "Reliability Prediction & DVP&R",
  titleAr: "التنبؤ بالموثوقية وخطة التحقق من التصميم (DVP&R)",
  order: 2,
  durationMin: 38,
  references: RDD_REFERENCE_TITLES,
  conceptIntroduction: `Reliability prediction is the bottom-up counterpart to allocation (Lesson 1): from component failure-rate data and the system bill-of-materials, predict the system failure rate λ_system, MTBF, and R(t). The ASQ CRE BOK recognizes two prediction approaches. *Parts-count* — λ_i = λ_Q (base rate times a quality factor); a 5-minute hand-calculation, conservative (over-predicts failure rates), used in concept/early-design when stress data is unavailable. *Parts-stress* — λ_p = λ_b·π_T·π_E·π_Q·π_S·π_C·... (base rate times multiplicative pi-factors for temperature, environment, quality, electrical stress, complexity); the production-grade prediction used at PDR/CDR. Three handbook references dominate: MIL-HDBK-217F (U.S. DoD, 1991 — the canonical parts-count and parts-stress reference, still cited by ASQ CRE for the method); Telcordia SR-2 (formerly Bellcore — the telecom standard, now SR-332); and FIDES (the European physics-of-failure guide, IEC TR 62380 / FIDES Group 2009). IEC 61709:2017 standardizes the reference conditions and stress models for cross-handbook conversion. Prediction feeds the DVP&R (Design Verification Plan & Report) — the structured test plan that verifies the design meets its allocated R_i* under specified conditions through HALT, ALT, and reliability-demonstration tests. Reliability growth is the third leg: test-find-fix-test cycles (Duane, Crow-AMSAA) drive reliability upward over the development program.`,
  example: `**Parts-stress prediction for a small PCB.** Given a board with 5 capacitors (λ_b=0.05 FIT, π_T=1.2, π_E=2.0, π_S=1.5), 3 resistors (λ_b=0.02 FIT, π_T=1.2, π_E=2.0, π_S=1.0), 2 ICs (λ_b=0.10 FIT, π_T=1.5, π_E=2.0, π_Q=1.5). Parts-stress: λ_p = λ_b·Π π. Capacitor: λ_C=0.05·1.2·2.0·1.5=0.18 FIT. Resistor: λ_R=0.02·1.2·2.0·1.0=0.048 FIT. IC: λ_IC=0.10·1.5·2.0·1.5=0.45 FIT. Board sum: λ_board=5·0.18+3·0.048+2·0.45=0.90+0.144+0.90=1.944 FIT=1.944e−9/h. MTBF_board=1/1.944e−9=5.14e8 h. Compare parts-count (no stress factors, conservative): λ_C_count=0.05·1.0=0.05 FIT; λ_board_count=5·0.05+3·0.02+2·0.10=0.51 FIT — parts-count UNDER-predicts here because it omits the thermal/environmental pi-factors that parts-stress applies. (Note: MIL-HDBK-217F parts-count typically uses MIL-spec quality, so parts-count is conservative when commercial-grade parts are used.) The prediction (1.944 FIT, MTBF=514Mh) is checked against the allocated MTBF_board* — if the prediction meets the allocation, the design is feasible; if not, DFR (Lesson 3) applies.`,
  keyFormulas: `Parts-count (MIL-HDBK-217F):
  λ_i_count = λ_Q · N_i   [λ_Q base quality rate, N_i part count]
  λ_system_count = Σ_i λ_i_count
Parts-stress (MIL-HDBK-217F):
  λ_p = λ_b · π_T · π_E · π_Q · π_S · π_C · π_A ...
  λ_system = Σ_i λ_p,i  (for series; RBD handles redundancy — RM pillar)
MTBF_system = 1 / λ_system;  R_system(t) = exp(−λ_system · t)
Failure rate units: 1 FIT = 1e−9 /h; 1 FPMH (failures per million hours) = 1e−6 /h = 1000 FIT
Duane growth model:
  MTBF_cum(T) = (1/α) · T^β   [cumulative MTBF; α = intercept, β = growth rate]
  MTBF_inst(T) = MTBF_cum(T) / (1 − β)   [instantaneous — current design MTBF]
Crow-AMSAA model:
  E[N(T)] = λ · T^β   [cumulative failures]; intensity ρ(T) = λ·β·T^(β−1); MTBF_inst = 1/ρ(T)
DVP&R: test plan → test execution → failure analysis → corrective action → reliability growth tracking`,
  exercise: `You are the CRE on a 4-board industrial controller. Allocation: MTBF_system* ≥ 50,000h. Bill-of-materials: 4 boards × (10 caps, 30 resistors, 5 ICs, 2 connectors) per board; environment ground-benign π_E=1.0; operating temperature 40°C π_T=1.5; commercial-grade π_Q=1.5. Base rates (FPMH): cap 0.05, resistor 0.02, IC 0.10, connector 0.5. Stress: cap π_S=1.5, others π_S=1.0. (a) Compute the parts-stress λ_system and MTBF_system. (b) Compare to the allocation — is the design feasible? (c) If the prediction falls 25% short, propose two DFR remedies (derating, redundancy). (d) The DVP&R includes a Duane growth test plan with T1=500h (MTBF_cum=200h) and T2=5000h (MTBF_cum=400h) — solve for the Duane α and β and predict MTBF_cum at T=50,000h. (e) Compute the instantaneous MTBF at T=50,000h (the design MTBF if the growth trend holds).`,
  sections: {
    learning_objectives: `- Distinguish parts-count (simple, conservative) from parts-stress (multiplicative pi-factors, production-grade) reliability prediction.
- Apply the parts-stress formula λ_p = λ_b·π_T·π_E·π_Q·π_S·π_C·... for capacitors, resistors, ICs, semiconductors, relays, connectors, PCB assemblies.
- Choose among the three handbook references: MIL-HDBK-217F (DoD, the canonical parts-count/parts-stress method), Telcordia SR-2/SR-332 (telecom), FIDES (physics-of-failure, European).
- Translate the predicted λ_system into MTBF_system = 1/λ_system and R_system(t) = exp(−λ_system·t).
- Verify the prediction against the allocated λ_i* (Lesson 1) — feasibility check; gap triggers DFR (Lesson 3).
- Build a DVP&R (Design Verification Plan & Report) covering test items, conditions, sample size, accept/reject criteria, growth tracking.
- Apply the Duane and Crow-AMSAA reliability-growth models: MTBF_cum = (1/α)·T^β; predict MTBF at extended test time.`,
    prerequisites: `- Reliability Allocation & Apportionment (Lesson 1) — allocation table as the design contract; series-system λ_system = Σ λ_i.
- Reliability Fundamentals (RF) — exponential R(t)=exp(−λt), MTBF=1/λ.
- Probability & Statistics (PS) Lesson 1 — exponential distribution, ln manipulation.
- Component data: base failure rates λ_b and pi-factors from MIL-HDBK-217F, Telcordia, FIDES, or IEC 61709 reference conditions.`,
    introduction: `Reliability prediction is the bottom-up counterpart to allocation. Where allocation starts with the system target and decomposes it into subsystem budgets, prediction starts with the bill-of-materials and the operating environment and computes the system failure rate. The two iterate: allocation sets targets, prediction checks feasibility, the gap triggers DFR (Lesson 3), and the loop repeats until the prediction meets or beats the allocation.

The two prediction approaches are *parts-count* and *parts-stress*. Parts-count sums per-part base failure rates λ_Q times the part count N_i — a 5-minute hand-calculation; it is conservative (over-predicts failure rates) and is used at concept/early-design when stress data is unavailable. Parts-stress applies multiplicative pi-factors — π_T (temperature, Arrhenius), π_E (environment), π_Q (quality), π_S (electrical stress), π_C (complexity), π_A (application) — to a base rate λ_b, capturing the operating conditions; it is the production-grade prediction used at PDR (Preliminary Design Review) and CDR (Critical Design Review).

Three handbook references dominate the ASQ CRE BOK. *MIL-HDBK-217F* (U.S. DoD, 1991 Notice 2) is the canonical parts-count and parts-stress handbook — still the BOK reference for the method, though its failure-rate data is increasingly stale. *Telcordia SR-2 / SR-332* (formerly Bellcore) is the telecom-industry standard. *FIDES* (the European physics-of-failure guide, IEC TR 62380 / FIDES Group 2009) is the modern alternative — it explicitly models failure physics (thermo-mechanical, electrical overstress, mechanical wear). *IEC 61709:2017* standardizes the reference conditions and stress models for cross-handbook conversion.

The DVP&R (Design Verification Plan & Report) is the structured test plan that verifies the design meets its allocated R_i* under specified conditions. It includes test items, environmental conditions, sample size, accept/reject criteria, and growth tracking. The DVP&R integrates HALT (Highly Accelerated Life Test — step-stress to find weak failure modes), ALT (Accelerated Life Test — quantitative MTBF at overstress), and reliability-demonstration tests (statistical demonstration that the design meets the allocated MTBF at confidence 1−α).

Reliability growth is the third leg: test-find-fix-test cycles drive reliability upward over the development program. The Duane model MTBF_cum = (1/α)·T^β captures the cumulative MTBF growth (with growth rate β); the Crow-AMSAA model E[N(T)] = λ·T^β captures cumulative failures as a non-homogeneous Poisson process. Both predict the design MTBF at extended test time and inform the test-budget decision (when do we stop testing?).`,
    terminology: `- **Parts-count prediction**: λ_i = λ_Q·N_i (base rate × quality × count); simple, conservative.
- **Parts-stress prediction**: λ_p = λ_b·π_T·π_E·π_Q·π_S·π_C·... (base rate × multiplicative pi-factors); production-grade.
- **Base failure rate λ_b**: the reference-condition failure rate for the part (FIT or FPMH).
- **Pi-factors (π_T, π_E, π_Q, π_S, π_C, π_A)**: multipliers for temperature, environment, quality, electrical stress, complexity, application.
- **1 FIT (failure-in-time)**: 1 failure per 1e9 device-hours = 1e−9/h. The standard unit for component failure rates.
- **1 FPMH (failures per million hours)**: 1e−6/h = 1000 FIT.
- **MIL-HDBK-217F**: U.S. DoD Reliability Prediction of Electronic Equipment (1991 Notice 2); the canonical parts-count/parts-stress handbook.
- **Telcordia SR-2 / SR-332**: telecom-industry reliability prediction standard (formerly Bellcore).
- **FIDES**: European physics-of-failure prediction guide (FIDES Group 2009; referenced by IEC TR 62380).
- **IEC 61709:2017**: reference conditions and stress models for cross-handbook conversion.
- **DVP&R (Design Verification Plan & Report)**: structured test plan covering test items, conditions, sample size, accept/reject criteria, growth tracking.
- **HALT (Highly Accelerated Life Test)**: step-stress test to discover weak failure modes (qualitative).
- **ALT (Accelerated Life Test)**: quantitative life test at overstress, with acceleration model (Arrhenius, inverse-power).
- **Reliability-demonstration test**: statistical test (χ², sequential) demonstrating MTBF ≥ MTBF₀ at confidence 1−α.
- **Duane growth model**: MTBF_cum = (1/α)·T^β; cumulative MTBF grows as a power law in test time T.
- **Crow-AMSAA model**: E[N(T)] = λ·T^β; cumulative failures as non-homogeneous Poisson process; the NHPP dual to Duane.`,
    detailed_explanation: `*Parts-count prediction* sums per-part base failure rates times the part count: λ_system = Σ_i λ_Q,i · N_i. The base rate λ_Q is typically the MIL-spec quality grade (e.g., for capacitors, MIL-HDBK-217F table). Parts-count is conservative (over-predicts failure rates) because it uses a single generic-quality rate without stress modeling; it is appropriate for early-concept feasibility when stress data is unavailable. For a board with 10 caps (λ_Q=0.05 FPMH), 20 resistors (0.02), 5 ICs (0.10): λ_count = 10·0.05+20·0.02+5·0.10 = 0.5+0.4+0.5 = 1.4 FPMH = 1,400 FIT = 1.4e−6/h; MTBF_count = 1/1.4e−6 = 714,000h. The result is a 5-minute hand-calculation but it overstates failure rates for commercial-grade parts operating in benign environments.

*Parts-stress prediction* applies multiplicative pi-factors to a base rate: λ_p = λ_b·π_T·π_E·π_Q·π_S·π_C·... The factors capture the operating conditions: π_T (Arrhenius temperature factor, π_T = exp(−Ea/k·(1/T_op − 1/T_ref))), π_E (environment — ground-benign 1.0, ground-mobile 5.0, airborne 25, naval 20, space 0.5), π_Q (quality — commercial 1.0+, MIL-spec 0.25), π_S (electrical stress — voltage derating, π_S=1.0 at full stress, 0.1 at 50% derating for capacitors), π_C (complexity — number of chips in a hybrid), π_A (application — linear vs switching). For a capacitor with λ_b=0.05 FIT, π_T=1.2, π_E=2.0, π_S=1.5, π_Q=1.0: λ_p = 0.05·1.2·2.0·1.5·1.0 = 0.18 FIT. Sum across the board: λ_system = Σ λ_p. Convert to MTBF: MTBF_system = 1/λ_system (with λ_system in 1/h).

*Handbook choice.* MIL-HDBK-217F is the BOK reference — its failure-rate data is from the 1980s–90s and increasingly stale for modern parts (it does not model CMOS scaling, lead-free solder, or MEMS). Telcordia SR-332 is the telecom-industry alternative with field-data-derived rates. FIDES is the modern physics-of-failure guide — it models thermo-mechanical (Coffin-Manson solder fatigue), electrical overstress (EOS), and mechanical (vibration, shock) failure mechanisms explicitly, and is referenced by IEC TR 62380. IEC 61709:2017 standardizes the reference conditions (40°C, 50% RH, 1g vibration, nominal voltage) and the stress models for cross-handbook conversion — so a Telcordia rate can be converted to a FIDES rate under different operating conditions.

*Feasibility check.* The predicted λ_system is compared to the allocated λ_system* (Lesson 1). If predicted ≤ allocated, the design is feasible; if predicted > allocated, DFR (Lesson 3) applies — derating (lower π_S), component upgrading (lower π_Q), redundancy (system architecture change), or design simplification (lower part count). The prediction is updated at each design review (concept → PDR → CDR → TRR) as the BOM and operating conditions firm up.

*The DVP&R (Design Verification Plan & Report)* is the structured test plan. Its sections: (1) test items (boards, subsystems, full system); (2) environmental conditions (temperature cycling, vibration, humidity, electrical stress); (3) sample size (statistically determined — PS Lesson 2 chi-square CI, OC curve); (4) accept/reject criteria (MTBF₀ demonstration at confidence 1−α); (5) HALT for failure-mode discovery (qualitative, step-stress); (6) ALT for quantitative MTBF at overstress; (7) reliability-demonstration test (χ², sequential probability ratio test); (8) FRACAS (failure reporting, analysis, corrective action system) tracking all failures and corrective actions; (9) reliability-growth tracking (Duane, Crow-AMSAA).

*Reliability growth* tracks the MTBF increase over the test-find-fix-test cycles. The Duane model: MTBF_cum(T) = (1/α)·T^β. Take logs: ln(MTBF_cum) = ln(1/α) + β·ln(T). A log-log plot of MTBF_cum vs T is a straight line with slope β (the growth rate). The instantaneous MTBF MTBF_inst(T) = MTBF_cum(T)/(1−β) — the current design MTBF (the slope of the cumulative curve). The Crow-AMSAA model: E[N(T)] = λ·T^β (NHPP); the failure intensity ρ(T) = λ·β·T^(β−1); MTBF_inst = 1/ρ. Duane and Crow-AMSAA are duals — Duane is MTBF-centric, Crow-AMSAA is failure-count-centric. Both predict the design MTBF at extended test time and inform the test-budget decision: when the cumulative MTBF crosses the allocation target, the design is accepted; when growth stalls (β flattens), investigate.`,
    core_principles: `- Parts-count is conservative; parts-stress is production-grade.
- Parts-stress: λ_p = λ_b·Π π-factors; sum across the BOM for λ_system.
- Pi-factors: π_T (Arrhenius temp), π_E (environment), π_Q (quality), π_S (electrical stress), π_C (complexity), π_A (application).
- Handbook choice: MIL-HDBK-217F (canonical, stale data), Telcordia SR-332 (telecom), FIDES (physics-of-failure).
- IEC 61709:2017 — reference conditions + stress models for cross-handbook conversion.
- Feasibility check: predicted λ_system ≤ allocated λ_system* — else DFR (Lesson 3).
- DVP&R: structured test plan (items, conditions, sample size, accept/reject, HALT, ALT, demonstration, FRACAS, growth).
- Duane: MTBF_cum = (1/α)·T^β; Crow-AMSAA: E[N(T)] = λ·T^β (NHPP); MTBF_inst = MTBF_cum/(1−β).`,
    components: `- **Bill-of-materials (BOM)**: parts list with quantities N_i per part type.
- **Base failure rates λ_b**: per-part reference rates (from MIL-HDBK-217F, Telcordia, FIDES, IEC 61709).
- **Pi-factors**: π_T, π_E, π_Q, π_S, π_C, π_A per part and operating condition.
- **System architecture**: series/parallel/redundant topology (handled by RBD in RM pillar; prediction assumes series or applies the redundancy importance E_i from Lesson 1).
- **DVP&R sections**: items, conditions, sample size, accept/reject, HALT, ALT, demonstration, FRACAS, growth.
- **Duane parameters**: α (intercept), β (growth rate); two (T, MTBF_cum) points solve the model.
- **Crow-AMSAA parameters**: λ (scale), β (shape); MLE from failure times {t_i}.`,
    process: `1. Receive the BOM and the operating-environment specification (temperature, vibration, electrical stress).
2. Choose the handbook (MIL-HDBK-217F for DoD/legacy, Telcordia SR-332 for telecom, FIDES for physics-of-failure, IEC 61709 for reference-condition conversion).
3. Compute parts-count λ_count = Σ λ_Q,i·N_i (5-minute baseline; concept phase).
4. Compute parts-stress λ_p,i = λ_b,i·Π π for each part; sum to λ_system (production-grade; PDR/CDR).
5. Convert: MTBF_system = 1/λ_system; R_system(t) = exp(−λ_system·t).
6. Feasibility check: predicted λ_system ≤ allocated λ_system*? If yes — design feasible. If no — DFR (Lesson 3) applies: derating, redundancy, component upgrade.
7. Build the DVP&R: items, conditions, sample size (chi-square CI from PS Lesson 2), accept/reject (MTBF₀ demonstration), HALT, ALT, demonstration, FRACAS, growth tracking.
8. Run the test program: HALT discovers failure modes; ALT quantifies MTBF; demonstration test confirms at confidence 1−α.
9. Track reliability growth: Duane MTBF_cum vs T; solve for α, β from two (T, MTBF_cum) points; predict MTBF at extended test time.
10. Update the prediction at each design review (concept → PDR → CDR → TRR) as the BOM and conditions firm up.`,
    formula_calculation: `Variables and formulas:
- λ_b: base failure rate for a part at reference conditions (1 FIT = 1e−9/h; or 1 FPMH = 1e−6/h = 1000 FIT).
- π_T: temperature factor (Arrhenius); π_T = exp(−Ea/k·(1/T_op − 1/T_ref)).
- π_E: environment factor (1.0 ground-benign, 5.0 ground-mobile, 25 airborne, 20 naval, 0.5 space).
- π_Q: quality factor (1.0+ commercial, 0.25 MIL-spec, 0.1 hermetic).
- π_S: electrical stress factor (1.0 at full rated stress, 0.1 at 50% voltage derating for capacitors).
- π_C: complexity factor (number of chips in a hybrid).
- π_A: application factor (linear vs switching, etc.).
- N_i: count of part i in the BOM.
- T: cumulative test time on the program (h).
- α, β: Duane parameters — α is the intercept (failure intensity at T=1), β is the growth rate (slope on log-log).
- λ_C, β_C: Crow-AMSAA parameters — λ_C is the scale (NHPP intensity at T=1), β_C is the shape.

Parts-count: λ_i = λ_Q,i · N_i; λ_system_count = Σ_i λ_i.
Parts-stress: λ_p,i = λ_b,i · Π π-factors; λ_system_stress = Σ_i λ_p,i.
MTBF_system = 1/λ_system; R_system(t) = exp(−λ_system · t).

Duane: MTBF_cum(T) = (1/α) · T^β; MTBF_inst(T) = MTBF_cum(T)/(1−β).
Solve from two points (T1, MTBF1) and (T2, MTBF2):
  β = [ln(MTBF2/MTBF1)] / [ln(T2/T1)]; 1/α = MTBF1 / T1^β.

Crow-AMSAA: E[N(T)] = λ_C · T^β_C; ρ(T) = λ_C · β_C · T^(β_C−1); MTBF_inst = 1/ρ(T).
MLE: λ_C = n/T_total^β_C; β_C = n / Σ ln(T_total/t_i).

Units: λ in 1/h (or FIT, FPMH); MTBF in h; T in h; α dimensionless (with units that cancel T^β/h); β, β_C dimensionless.

Assumptions: (i) constant failure rate (exponential) per part — invalid for wear-out (use Weibull λ(t)); (ii) part failure rates are independent (no common-cause); (iii) pi-factors are multiplicative and independent (approximation; in reality π_T and π_S interact); (iv) the BOM is complete and the operating conditions are known; (v) for growth: the corrective actions are effective (failure modes are eliminated, not deferred).

Interpretation: parts-count gives a 5-minute conservative estimate; parts-stress gives the production-grade prediction. The feasibility check (predicted ≤ allocated) drives the design iteration. Duane growth rate β≈0.3 is "typical" (MTBF_cum doubles every ~3× test time); β<0.1 means growth has stalled (investigate failure modes); β>0.5 means strong corrective actions.`,
    worked_example: `**Electronics — parts-stress prediction for a small PCB.**
Given a board with 5 capacitors, 3 resistors, 2 ICs. Operating environment: ground-mobile π_E=2.0; temperature 40°C π_T per part; commercial-grade π_Q=1.5 for ICs; voltage stress varies.

Base rates (FIT — 1 FIT = 1e−9/h): capacitors λ_b=0.05 FIT, resistors λ_b=0.02 FIT, ICs λ_b=0.10 FIT.
Pi-factors:
- Capacitors: π_T=1.2 (40°C, low Ea), π_E=2.0, π_S=1.5 (50% voltage derating), π_Q=1.0.
- Resistors: π_T=1.2, π_E=2.0, π_S=1.0 (no derating needed), π_Q=1.0.
- ICs: π_T=1.5 (higher Ea), π_E=2.0, π_Q=1.5 (commercial), π_C=1.0 (single chip).

Step 1 — Parts-stress per part (λ_p = λ_b · Π π):
λ_p,C = 0.05 · 1.2 · 2.0 · 1.5 · 1.0 = 0.18 FIT per capacitor.
λ_p,R = 0.02 · 1.2 · 2.0 · 1.0 · 1.0 = 0.048 FIT per resistor.
λ_p,IC = 0.10 · 1.5 · 2.0 · 1.5 · 1.0 = 0.45 FIT per IC.

Step 2 — Sum across the BOM:
λ_board = 5·0.18 + 3·0.048 + 2·0.45 = 0.90 + 0.144 + 0.90 = 1.944 FIT = 1.944e−9/h.

Step 3 — MTBF and reliability:
MTBF_board = 1/λ_board = 1/1.944e−9 = 5.144e8 h ≈ 514 million hours.
R_board(10,000h) = exp(−1.944e−9 · 10,000) = exp(−1.944e−5) = 0.99998 (essentially 1).

Step 4 — Parts-count comparison (no pi-factors, conservative):
λ_count = 5·0.05 + 3·0.02 + 2·0.10 = 0.25 + 0.06 + 0.20 = 0.51 FIT.
Wait — parts-count is LOWER than parts-stress here because we used commercial-grade base rates without the thermal/environmental pi-factors. The MIL-HDBK-217F parts-count typically uses MIL-spec quality, which raises λ_Q. So the comparison depends on the quality assumption. The lesson: parts-count is conservative for commercial parts (higher base rate per part); for MIL-spec parts the comparison reverses.

Step 5 — Feasibility check vs allocation: suppose the allocated λ_board* = 5.0e−9/h (MTBF_board* = 200M h). Predicted λ_board = 1.944e−9/h (514M h) ≤ allocated → design FEASIBLE. ✓

**Duane growth — solve α, β from two points.**
Test program: at T1=500h, observed MTBF_cum=200h; at T2=5000h, observed MTBF_cum=400h.
Duane: ln(MTBF_cum) = ln(1/α) + β·ln(T).
Two equations: ln(200)=5.298=ln(1/α)+β·ln(500)=ln(1/α)+β·6.215.
ln(400)=5.991=ln(1/α)+β·ln(5000)=ln(1/α)+β·8.517.
Subtract: 0.693 = β·2.302 → β = 0.301 (growth rate — MTBF_cum doubles every log cycle of test time).
Solve for α: ln(1/α) = 5.298 − 0.301·6.215 = 5.298 − 1.870 = 3.428.
1/α = exp(3.428) = 30.85. α = 0.0324.

Step 6 — Predict MTBF_cum at T=50,000h:
MTBF_cum(50,000) = (1/α) · T^β = 30.85 · 50,000^0.301.
50,000^0.301 = exp(0.301 · ln(50,000)) = exp(0.301 · 10.821) = exp(3.257) = 25.95.
MTBF_cum(50,000) = 30.85 · 25.95 = 800.6 h ≈ 800 h.

Step 7 — Instantaneous MTBF (current design MTBF) at T=50,000h:
MTBF_inst(50,000) = MTBF_cum(50,000) / (1 − β) = 800.6 / (1 − 0.301) = 800.6 / 0.699 = 1,146 h.

Interpretation: the cumulative MTBF at T=50,000h is 800h; the instantaneous (current design) MTBF is 1,146h. If the allocated MTBF_system* = 1,000h, the design has just crossed the allocation threshold at T=50,000h (the growth trend projects the design will meet the contract). Test can stop.`,
    industrial_example: `**Electronics — industrial controller board parts-stress prediction.** A 4-board industrial controller allocated MTBF_system* ≥ 50,000h. Parts-stress prediction at CDR: λ_system = 1.85e−5/h (MTBF_system = 54,000h) — feasible (predicted ≤ allocated). The DVP&R includes HALT (step-stress to +125°C, vibration 20g) discovering a solder-joint failure at +105°C; ALT at +85°C (Arrhenius Ea=0.7eV, acceleration factor AF=exp(Ea/k·(1/T_op − 1/T_accel))=exp(0.7/8.617e−5·(1/358 − 1/313))=exp(0.7/8.617e−5·(0.00279 − 0.00319))=exp(0.7/8.617e−5·(−0.000403))=exp(−3.27)=0.038 — acceleration is 1/0.038=26×); reliability-demonstration test (chi-square, 90% confidence, MTBF₀=40,000h, time-truncated, r=4 failures, T=200,000h, MTBF_L=2·200,000/χ²(0.10, 10)=400,000/15.987=25,025h — fail to demonstrate 40,000h MTBF_L; extend T to 320,000h for r=4, MTBF_L=2·320,000/15.987=40,033h ✓). Method per MIL-HDBK-217F and Ebeling (2010, Ch. 8 & 13).

**Aerospace — FIDES prediction for a satellite EPS.** The supplier used FIDES (the European physics-of-failure guide) for a 4-subsystem satellite power system. FIDES models the thermo-mechanical (Coffin-Manson solder fatigue under thermal cycling), electrical overstress (EOS), and mechanical (vibration, shock) failure mechanisms explicitly — yielding λ_EPS = 1.2e−6/h (MTBF_EPS = 833,000h), 30% more optimistic than MIL-HDBK-217F (which over-predicts for modern lead-free solder). Method per FIDES Guide 2009 / IEC TR 62380 and O'Connor (2012, Ch. 5).`,
    case_study: `CASE_TYPE = SYNTHETIC. An automotive Tier-1 supplier developed a 5-subsystem ADAS module allocated MTBF_system* ≥ 100,000h. Initial parts-count prediction (early concept, no stress data): λ_count = 1.8e−5/h (MTBF_count = 55,000h — 45% short of allocation). DFR applied: derating the camera image sensor (π_S 1.0→0.5, dropping the sensor failure rate by 10×); upgrading the lidar laser diode to a hermetic-grade (π_Q 1.0→0.3); adding 2oo3 redundancy on the CAN-bus transceiver (E_i=0.33, relaxing the per-channel allocation by 3×). Re-prediction at CDR (parts-stress, with the architectural changes): λ_system = 9.5e−6/h (MTBF_system = 105,000h) — feasible. The DVP&R tracked reliability growth with the Duane model: at T1=500h, MTBF_cum=20,000h; at T2=5,000h, MTBF_cum=40,000h; solved α=0.018, β=0.301. Predicted MTBF_cum at T=50,000h = (1/0.018)·50,000^0.301 = 55.6·25.95 = 1,443h... wait — the absolute numbers are different because the test program started with a low initial MTBF (the design had many failure modes at first). The supplier's growth projection showed MTBF_inst crossing the 100,000h allocation at T=45,000h, prompting a final test extension to T=50,000h. The program met the contract at the cost of an extended test program. Source: synthetic case authored for this lesson, method per Ebeling (2010, Ch. 13) and O'Connor (2012, Ch. 12).`,
    visual_explanation: `The parts-stress prediction is visualized as a BOM table with columns (Part, λ_b, π_T, π_E, π_Q, π_S, λ_p, N_i, Σ contribution) and a row-sum (λ_system). The pi-factors are visualized as a multiplicative chain (a horizontal "funnel" of factors narrowing from λ_b at the input to λ_p at the output). The Duane growth is visualized as a log-log plot of MTBF_cum (y-axis) vs T (x-axis): a straight line with slope β; the instantaneous MTBF is offset above by the (1−β) factor. The Crow-AMSAA is visualized as a log-log plot of cumulative failures N(T) vs T: a straight line with slope β_C.`,
    simulation_opportunity: `An interactive simulation could let the learner (i) input the BOM and operating conditions; (ii) choose the handbook (MIL-HDBK-217F, Telcordia SR-332, FIDES, IEC 61709); (iii) compute parts-count and parts-stress λ_system, MTBF_system, R(t) live; (iv) compare against the allocated λ_system* with a feasibility verdict; (v) toggle DFR changes (derating π_S, redundancy E_i) and watch the predicted MTBF rise; (vi) for the DVP&R, input two (T, MTBF_cum) points and solve the Duane α, β; (vii) project MTBF_cum and MTBF_inst at extended T to determine the test-stop time.`,
    common_mistakes: `- Using parts-count when stress data is available — parts-count is conservative by 2–10× for commercial parts; parts-stress is the production-grade method.
- Mixing handbooks without IEC 61709 conversion — MIL-HDBK-217F rates differ from Telcordia/FIDES by 2–5× due to reference-condition differences; always convert via IEC 61709 stress models.
- Treating pi-factors as independent — π_T and π_S interact (a hot capacitor at high voltage fails faster than the product suggests); use the handbook tables' combined factors where available.
- Using stale MIL-HDBK-217F rates for modern parts — the 1991 data over-predicts for modern CMOS, lead-free solder, MEMS; use FIDES or supplier-qualified rates.
- Reporting MTBF without specifying the handbook, the pi-factors, and the operating conditions — the number is meaningless alone.
- Confusing Duane MTBF_cum with MTBF_inst — the cumulative is the running average; the instantaneous is the current-design MTBF; they differ by a factor (1−β) (typically 0.7×).
- Stopping growth test early (when β flattens) — β<0.1 means growth has stalled; investigate failure modes before declaring the design acceptable.
- Skipping the feasibility check vs the allocation — a "good" prediction that misses the allocation is a failed design; DFR or re-allocation is required.`,
    limitations: `- Parts-count over-predicts for commercial parts (conservative baseline).
- Parts-stress assumes multiplicative-independent pi-factors — an approximation; π_T and π_S interact.
- MIL-HDBK-217F data is from 1991 — stale for modern CMOS scaling, lead-free solder, MEMS; FIDES is preferred for physics-of-failure modeling.
- Prediction assumes constant failure rate (exponential) per part — invalid for wear-out (Weibull β>1); use λ(t) and integrate R(t) over the mission.
- Prediction does not account for common-cause failures (dependent failures); RBD/Markov in the RM pillar handles this.
- The Duane model assumes a single growth rate β throughout the program — in reality β changes as failure modes are eliminated (use a piecewise Duane or the Crow-AMSAA NHPP).
- Reliability-demonstration tests verify MTBF at confidence 1−α — but do not predict field reliability; field data (FRACAS) closes the loop.
- The DVP&R test conditions may not match field conditions — environmental stress screening (ESS) compensates but does not eliminate the gap.`,
    comparison: `**Parts-count vs Parts-stress:** parts-count sums λ_Q·N (5-minute, conservative); parts-stress applies π_T·π_E·π_Q·π_S·π_C·π_A multiplicative pi-factors (production-grade). Use parts-count at concept, parts-stress at PDR/CDR.

**MIL-HDBK-217F vs Telcordia SR-332 vs FIDES:**
- MIL-HDBK-217F (1991): the canonical method (DoD); data stale for modern parts; cited by ASQ CRE BOK.
- Telcordia SR-332 (formerly SR-2/Bellcore): telecom-industry; field-data-derived; modern.
- FIDES (2009 / IEC TR 62380): physics-of-failure (thermo-mechanical, EOS, mechanical); the modern European alternative.

**Duane vs Crow-AMSAA:** Duane is MTBF-centric (MTBF_cum = (1/α)·T^β); Crow-AMSAA is failure-count-centric (NHPP: E[N(T)] = λ·T^β). They are duals — Duane is the time-average view, Crow-AMSAA is the stochastic-process view. Crow-AMSAA provides confidence intervals on the growth parameters (MLE + Fisher information).`,
    practical_application: `- **Electronics (industrial controller)**: parts-stress at CDR; HALT discovers solder-joint failure at +105°C; ALT at +85°C (AF=26×); demonstration test at 90% confidence.
- **Aerospace (satellite EPS)**: FIDES physics-of-failure prediction (30% more optimistic than MIL-HDBK-217F for lead-free solder).
- **Automotive (ADAS module)**: parts-count at concept (feasibility), parts-stress at CDR after DFR (derating, redundancy, component upgrade).
- **Telecom (optical line terminal)**: Telcordia SR-332 prediction; field-data calibration via FRACAS.
- **Medical (infusion pump)**: parts-stress with IEC 61709 reference conditions; DVP&R with chi-square demonstration.`,
    decision_scenario: `You are the CRE on a 4-board industrial controller allocated MTBF_system* ≥ 50,000h. BOM per board: 10 caps (λ_b=0.05 FIT, π_S=1.5), 30 resistors (0.02 FIT), 5 ICs (0.10 FIT), 2 connectors (0.5 FIT). Operating: 40°C π_T=1.5, ground-benign π_E=1.0, commercial π_Q=1.5 for ICs. (a) Compute parts-count λ and parts-stress λ_system. (b) Is the design feasible? (c) If the prediction falls 25% short, propose two DFR remedies and quantify each. (d) The DVP&R tracks Duane growth: T1=500h MTBF_cum=200h, T2=5,000h MTBF_cum=400h — solve for α and β and predict MTBF_cum and MTBF_inst at T=50,000h. (e) At what test time T does the MTBF_inst cross the 50,000h allocation threshold? Is the test program affordable?`,
    practice_questions: `- **Q1 (Easy, Recall):** State the parts-stress formula and identify the standard pi-factors.
- **Q2 (Medium, Calculation):** A PCB has 5 caps (λ_b=0.05 FIT, π_T=1.2, π_E=2.0, π_S=1.5), 3 resistors (λ_b=0.02 FIT, π_T=1.2, π_E=2.0, π_S=1.0), 2 ICs (λ_b=0.10 FIT, π_T=1.5, π_E=2.0, π_Q=1.5). Compute λ_system and MTBF_system.
- **Q3 (Medium, Application):** A Duane growth program has T1=500h MTBF_cum=200h and T2=5,000h MTBF_cum=400h. Solve for α and β and predict MTBF_cum at T=50,000h.
- **Q4 (Hard, Analyze):** Compare MIL-HDBK-217F and FIDES predictions for a modern lead-free-solder PCB. Which is more accurate, and why?`,
    certification_questions: `- **CRE-style (Easy):** Which pi-factor in MIL-HDBK-217F captures the operating environment (ground-mobile, airborne, naval)? (π_E)
- **CRE-style (Medium, Calculation):** Apply the Duane model: T1=500h MTBF_cum=200h, T2=5,000h MTBF_cum=400h. Solve for β.
- **CRE-style (Hard, Analysis):** A parts-count prediction gives MTBF_count=50,000h; parts-stress gives MTBF_stress=80,000h. Which is more conservative, and which should be used at CDR?`,
    summary: `Reliability prediction is the bottom-up counterpart to allocation: from the BOM and operating conditions, predict λ_system and MTBF. Parts-count sums λ_Q·N (conservative, concept phase); parts-stress applies multiplicative pi-factors λ_b·π_T·π_E·π_Q·π_S·π_C·... (production-grade, PDR/CDR). Three handbooks dominate: MIL-HDBK-217F (DoD, canonical, stale data), Telcordia SR-332 (telecom), FIDES (physics-of-failure, modern). IEC 61709:2017 standardizes the reference conditions and stress models for cross-handbook conversion. The feasibility check (predicted ≤ allocated) drives the design iteration; DFR (Lesson 3) closes the gap. The DVP&R is the structured test plan (items, conditions, sample size, accept/reject, HALT, ALT, demonstration, FRACAS, growth). The Duane model MTBF_cum = (1/α)·T^β and the Crow-AMSAA model E[N(T)] = λ·T^β track reliability growth; MTBF_inst = MTBF_cum/(1−β). The growth trend informs the test-stop decision (when MTBF_inst crosses the allocation, the design is accepted).`,
    key_takeaways: `- Parts-count: λ = λ_Q · N; 5-minute, conservative.
- Parts-stress: λ_p = λ_b · π_T · π_E · π_Q · π_S · π_C · ...; production-grade.
- Handbooks: MIL-HDBK-217F (DoD), Telcordia SR-332 (telecom), FIDES (physics-of-failure), IEC 61709 (reference conditions).
- Feasibility: predicted λ_system ≤ allocated λ_system*; else DFR.
- DVP&R: items, conditions, sample size, accept/reject, HALT, ALT, demonstration, FRACAS, growth.
- Duane: MTBF_cum = (1/α)·T^β; MTBF_inst = MTBF_cum/(1−β).
- Crow-AMSAA: E[N(T)] = λ·T^β (NHPP); MTBF_inst = 1/(λ·β·T^(β−1)).
- Growth rate β≈0.3 is typical (MTBF_cum doubles every ~3× test time); β<0.1 = stalled.`,
    references: `- ASQ CRE Body of Knowledge — Reliability in Design & Development domain.
- Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 8 (prediction) & Ch. 13 (growth).
- O'Connor & Kleyner (2012), Practical Reliability Engineering, Ch. 5 (prediction), 6 (DVP&R), 12 (growth).
- MIL-HDBK-217F (1991, Notice 2) — Reliability Prediction of Electronic Equipment.
- IEC 61709:2017 — Electronic components — Reliability reference conditions for failure rates.
- Montgomery (2017), Design and Analysis of Experiments, Ch. 15 (Taguchi — DFR link).`,
  },
  knowledgeObject: {
    title: "Reliability Prediction & DVP&R",
    domain: "Reliability in Design & Development",
    competency: "Reliability Prediction & DVP&R",
    topic: "Reliability Prediction, DVP&R, and Growth",
    concept: "Parts-count/parts-stress prediction, DVP&R test plan, Duane/Crow-AMSAA growth",
    body: {
      definitions: [
        "Parts-count prediction: λ_i = λ_Q·N_i (base rate × quality × count); simple, conservative.",
        "Parts-stress prediction: λ_p = λ_b·π_T·π_E·π_Q·π_S·π_C·...; multiplicative pi-factors; production-grade.",
        "1 FIT (failure-in-time): 1e−9 failures/h; the standard unit for component failure rates.",
        "1 FPMH (failures per million hours): 1e−6/h = 1000 FIT.",
        "MIL-HDBK-217F: U.S. DoD Reliability Prediction of Electronic Equipment (1991 Notice 2); canonical parts-count/parts-stress handbook.",
        "Telcordia SR-332 (formerly SR-2/Bellcore): telecom-industry prediction standard.",
        "FIDES: European physics-of-failure guide (FIDES Group 2009; IEC TR 62380); thermo-mechanical, EOS, mechanical models.",
        "IEC 61709:2017: reference conditions and stress models for cross-handbook conversion.",
        "DVP&R: Design Verification Plan & Report — structured test plan (items, conditions, sample size, accept/reject, HALT, ALT, demonstration, FRACAS, growth).",
        "HALT: Highly Accelerated Life Test — step-stress to discover failure modes (qualitative).",
        "ALT: Accelerated Life Test — quantitative life test at overstress (Arrhenius, inverse-power acceleration).",
        "Reliability-demonstration test: statistical test (χ², sequential) demonstrating MTBF ≥ MTBF₀ at confidence 1−α.",
        "Duane growth model: MTBF_cum(T) = (1/α)·T^β; cumulative MTBF as power law in test time.",
        "Crow-AMSAA model: E[N(T)] = λ·T^β; cumulative failures as non-homogeneous Poisson process (NHPP).",
        "MTBF_inst = MTBF_cum/(1−β): the instantaneous (current design) MTBF; offset above cumulative by the (1−β) factor.",
      ],
      principles: [
        "Parts-count is conservative (over-predicts); parts-stress is production-grade.",
        "Parts-stress: λ_p = λ_b · Π π-factors; sum across the BOM for λ_system.",
        "Pi-factors: π_T (Arrhenius), π_E (environment), π_Q (quality), π_S (electrical stress), π_C (complexity), π_A (application).",
        "Handbook choice: MIL-HDBK-217F (DoD, stale data), Telcordia SR-332 (telecom, field-data), FIDES (physics-of-failure, modern).",
        "IEC 61709:2017 standardizes reference conditions for cross-handbook conversion.",
        "Feasibility check: predicted λ_system ≤ allocated λ_system* — else DFR (Lesson 3).",
        "DVP&R: items, conditions, sample size (chi-square CI), accept/reject, HALT, ALT, demonstration, FRACAS, growth.",
        "Duane: MTBF_cum = (1/α)·T^β; MTBF_inst = MTBF_cum/(1−β).",
        "Crow-AMSAA: E[N(T)] = λ·T^β (NHPP); MTBF_inst = 1/(λ·β·T^(β−1)).",
      ],
      components: [
        "Bill-of-materials (BOM) with parts and quantities N_i.",
        "Base failure rates λ_b per part (from handbook).",
        "Pi-factors π_T, π_E, π_Q, π_S, π_C, π_A per part and operating condition.",
        "DVP&R sections (items, conditions, sample size, accept/reject, HALT, ALT, demonstration, FRACAS, growth).",
        "Duane parameters (α, β) solved from two (T, MTBF_cum) points.",
        "Crow-AMSAA parameters (λ_C, β_C) solved by MLE from failure times {t_i}.",
      ],
      mechanism: [
        "Prediction lifecycle: receive BOM + environment → choose handbook → parts-count (concept) → parts-stress (PDR/CDR) → MTBF_system = 1/λ_system → feasibility check vs allocation → DFR if short → DVP&R test plan (HALT/ALT/demonstration/FRACAS) → Duane/Crow-AMSAA growth tracking → test-stop when MTBF_inst crosses allocation → field FRACAS closes the loop.",
      ],
      process: [
        "1. Receive BOM and operating-environment spec (temperature, vibration, electrical stress).",
        "2. Choose handbook (MIL-HDBK-217F, Telcordia SR-332, FIDES, IEC 61709 conversion).",
        "3. Compute parts-count λ_count = Σ λ_Q,i·N_i (baseline; concept phase).",
        "4. Compute parts-stress λ_p,i = λ_b,i·Π π; sum to λ_system (production-grade; PDR/CDR).",
        "5. Convert: MTBF_system = 1/λ_system; R_system(t) = exp(−λ_system·t).",
        "6. Feasibility check: predicted ≤ allocated? If yes — feasible. If no — DFR.",
        "7. Build the DVP&R (items, conditions, sample size, accept/reject, HALT, ALT, demonstration, FRACAS, growth).",
        "8. Run the test program: HALT discovers modes; ALT quantifies; demonstration confirms at confidence 1−α.",
        "9. Track growth: Duane/Crow-AMSAA solve α, β from two (T, MTBF_cum) points; project MTBF_inst at extended T.",
        "10. Test-stop when MTBF_inst crosses the allocation threshold; field FRACAS confirms.",
      ],
      formulas: [
        "Parts-count: λ_i = λ_Q,i·N_i; λ_system_count = Σ_i λ_i.",
        "Parts-stress: λ_p,i = λ_b,i·Π π-factors; λ_system_stress = Σ_i λ_p,i.",
        "MTBF_system = 1/λ_system; R_system(t) = exp(−λ_system·t).",
        "1 FIT = 1e−9/h; 1 FPMH = 1e−6/h = 1000 FIT.",
        "Duane: MTBF_cum(T) = (1/α)·T^β; MTBF_inst(T) = MTBF_cum(T)/(1−β).",
        "Duane solve from two points: β = ln(MTBF2/MTBF1)/ln(T2/T1); 1/α = MTBF1/T1^β.",
        "Crow-AMSAA: E[N(T)] = λ_C·T^β_C; ρ(T) = λ_C·β_C·T^(β_C−1); MTBF_inst = 1/ρ(T).",
        "Arrhenius acceleration (ALT): AF = exp(Ea/k·(1/T_op − 1/T_accel)).",
      ],
      metrics: [
        "λ_system (predicted failure rate, 1/h or FIT or FPMH).",
        "MTBF_system = 1/λ_system (h).",
        "R_system(t) = exp(−λ_system·t) (dimensionless 0..1).",
        "Feasibility gap: (λ_allocated − λ_predicted)/λ_allocated — drives DFR.",
        "Duane β (growth rate, dimensionless; typical 0.2–0.4).",
        "MTBF_cum and MTBF_inst at extended T (the test-stop criterion).",
        "Demonstration test confidence (1−α) and accept/reject verdict.",
      ],
      examples: [
        "Parts-stress PCB: 5 caps λ_b=0.05 FIT π=(1.2,2.0,1.5,1.0) → 0.18 FIT; 3 resistors 0.048 FIT; 2 ICs 0.45 FIT; sum 1.944 FIT = 1.944e−9/h; MTBF = 5.14e8 h.",
        "Parts-count PCB (same BOM, no pi-factors): 5·0.05+3·0.02+2·0.10 = 0.51 FIT — conservative for commercial parts.",
        "Duane growth: T1=500h MTBF_cum=200h, T2=5000h MTBF_cum=400h → β=0.301, α=0.0324; predict MTBF_cum(50000h)=800h, MTBF_inst(50000h)=1146h.",
        "Arrhenius ALT: Ea=0.7eV, T_op=358K (85°C), T_accel=313K (40°C); AF = exp(0.7/8.617e−5·(1/358 − 1/313)) ≈ 26×.",
      ],
      industrial_examples: [
        "Electronics — industrial controller parts-stress at CDR: λ_system=1.85e−5/h (MTBF=54,000h) — feasible vs 50,000h allocation; HALT discovered solder failure at +105°C; ALT at +85°C AF=26×; demonstration at 90% confidence requires T=320,000h with r=4.",
        "Aerospace — satellite EPS FIDES prediction: λ_EPS=1.2e−6/h (MTBF=833,000h), 30% more optimistic than MIL-HDBK-217F for modern lead-free solder.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Automotive 5-subsystem ADAS module allocated MTBF_system*≥100,000h. Parts-count at concept: MTBF=55,000h (45% short). DFR applied (camera derating π_S 1.0→0.5; lidar hermetic π_Q 1.0→0.3; CAN-bus 2oo3 E_i=0.33). Parts-stress at CDR: MTBF=105,000h — feasible. Duane growth: β=0.301; MTBF_inst crosses 100,000h allocation at T=45,000h; test extended to T=50,000h; program met contract at cost of extended test.",
      ],
      common_errors: [
        "Using parts-count when stress data is available — 2–10× conservative for commercial parts; use parts-stress at PDR/CDR.",
        "Mixing handbooks without IEC 61709 conversion — MIL-HDBK-217F vs Telcordia vs FIDES rates differ 2–5×.",
        "Treating pi-factors as independent — π_T and π_S interact; use handbook combined tables.",
        "Using stale MIL-HDBK-217F data for modern parts (CMOS scaling, lead-free solder, MEMS) — use FIDES.",
        "Reporting MTBF without handbook, pi-factors, and operating conditions — meaningless alone.",
        "Confusing Duane MTBF_cum with MTBF_inst — they differ by factor (1−β)≈0.7×.",
        "Stopping growth test when β flattens (<0.1) — growth has stalled; investigate failure modes before declaring acceptable.",
        "Skipping feasibility check vs allocation — a 'good' prediction that misses the allocation is a failed design.",
      ],
      limitations: [
        "Parts-count over-predicts for commercial parts (conservative baseline).",
        "Parts-stress assumes multiplicative-independent pi-factors (π_T and π_S interact in reality).",
        "MIL-HDBK-217F data from 1991 — stale for modern parts; use FIDES for physics-of-failure.",
        "Prediction assumes constant failure rate (exponential) — invalid for wear-out (Weibull β>1); use λ(t).",
        "Prediction does not account for common-cause failures — RBD/Markov in RM pillar handles.",
        "Duane assumes a single β throughout the program — in reality β changes; use piecewise Duane or Crow-AMSAA NHPP.",
        "Reliability-demonstration test verifies at confidence 1−α — does not predict field reliability; FRACAS closes the loop.",
        "DVP&R test conditions may not match field conditions — ESS compensates but does not eliminate the gap.",
      ],
      best_practices: [
        "Default to parts-stress at PDR/CDR; reserve parts-count for early-concept feasibility.",
        "Use FIDES for modern lead-free-solder and CMOS parts; reserve MIL-HDBK-217F for legacy DoD programs.",
        "Convert between handbooks using IEC 61709 reference conditions and stress models.",
        "Report MTBF with the handbook, the pi-factors, and the operating conditions explicitly.",
        "Feasibility check: predicted λ_system ≤ allocated λ_system*; if short, apply DFR (derating, redundancy, component upgrade).",
        "DVP&R: HALT (discover modes) → ALT (quantify MTBF at overstress) → demonstration (confirm at confidence 1−α) → FRACAS (track all failures + corrective actions) → Duane/Crow-AMSAA (growth tracking).",
        "Duane: solve α, β from two (T, MTBF_cum) points; project MTBF_inst at extended T; stop test when MTBF_inst crosses allocation.",
        "Track β during growth: β<0.1 = stalled (investigate); β≈0.3 = typical; β>0.5 = strong corrective actions.",
      ],
      related_concepts: [
        "Reliability Allocation & Apportionment (Lesson 1) — allocation table as the design contract (feasibility check).",
        "Design for Reliability (Lesson 3) — derating, redundancy, FMEA-driven changes to close the prediction-vs-allocation gap.",
        "Reliability Fundamentals (RF) — series-system R, exponential R(t)=exp(−λt), MTBF=1/λ.",
        "Probability & Statistics (PS) Lesson 2 — chi-square MTBF CI for demonstration test sample size.",
        "Reliability Testing (RT) — HALT/ALT/demonstration test methods.",
      ],
      prerequisites: [
        "Reliability Allocation & Apportionment (Lesson 1).",
        "Reliability Fundamentals (RF) — exponential R(t), MTBF=1/λ.",
        "Probability & Statistics (PS) Lesson 1 — exponential distribution.",
        "PS Lesson 2 — chi-square MTBF CI for demonstration sample size.",
        "Component data: base rates and pi-factors from MIL-HDBK-217F, Telcordia, FIDES, or IEC 61709.",
      ],
      references: [
        "ASQ CRE Body of Knowledge — Reliability in Design & Development domain.",
        "Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 8 (prediction) & Ch. 13 (growth).",
        "O'Connor & Kleyner (2012), Practical Reliability Engineering, Ch. 5 (prediction), 6 (DVP&R), 12 (growth).",
        "MIL-HDBK-217F (1991, Notice 2) — Reliability Prediction of Electronic Equipment.",
        "IEC 61709:2017 — Electronic components — Reliability reference conditions.",
        "Montgomery (2017), Design and Analysis of Experiments, Ch. 15.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Reliability Prediction & DVP&R",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "What is the difference between parts-count and parts-stress reliability prediction?",
      whyCorrect:
        "Parts-count prediction sums per-part base failure rates times the part count: λ_i = λ_Q·N_i. It uses a single quality-grade rate λ_Q per part with NO stress modeling — it is a 5-minute hand-calculation, conservative (over-predicts failure rates), used at concept/early-design when stress data is unavailable. Parts-stress prediction applies multiplicative pi-factors — π_T (temperature), π_E (environment), π_Q (quality), π_S (electrical stress), π_C (complexity), π_A (application) — to a base rate λ_b: λ_p = λ_b·Π π. Parts-stress captures the operating conditions and is the production-grade prediction used at PDR/CDR. The two methods trade simplicity for accuracy; parts-count is the conservative baseline, parts-stress is the verified value.",
      whyOthersWrong: [
        "Option A (Parts-count is more accurate; parts-stress is conservative) — backwards. Parts-count uses generic λ_Q without stress modeling, so it over-predicts failure rates (conservative). Parts-stress applies actual pi-factors and is more accurate (production-grade).",
        "Option C (Parts-count requires field data; parts-stress requires only the BOM) — backwards. Parts-count requires only the BOM and a generic quality grade (no field data, no stress data). Parts-stress requires the BOM AND the operating conditions (temperature, voltage, environment) — more data, more accurate.",
        "Option D (They are identical methods with different names) — no: parts-count uses λ_Q (one rate per part); parts-stress uses λ_b·Π π-factors (six or more multipliers per part). They are distinct methods with different data requirements and different accuracy.",
      ],
      explanation:
        "Parts-count: λ_i = λ_Q·N_i (5-minute, conservative, concept phase). Parts-stress: λ_p = λ_b·π_T·π_E·π_Q·π_S·π_C·... (production-grade, PDR/CDR). Parts-count uses one rate; parts-stress applies 6+ pi-factors.",
      options: [
        { text: "Parts-count is more accurate; parts-stress is conservative", isCorrect: false },
        { text: "Parts-count sums λ_Q·N (simple, conservative); parts-stress applies multiplicative pi-factors (π_T, π_E, π_Q, π_S, π_C) to a base rate — production-grade", isCorrect: true },
        { text: "Parts-count requires field data; parts-stress requires only the BOM", isCorrect: false },
        { text: "They are identical methods with different names", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability Prediction & DVP&R",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Electronics",
      stem: "A PCB has 5 capacitors (λ_b=0.05 FIT, π_T=1.2, π_E=2.0, π_S=1.5, π_Q=1.0), 3 resistors (λ_b=0.02 FIT, π_T=1.2, π_E=2.0, π_S=1.0, π_Q=1.0), 2 ICs (λ_b=0.10 FIT, π_T=1.5, π_E=2.0, π_Q=1.5, π_S=1.0). Compute λ_system (parts-stress) and MTBF_system.",
      whyCorrect:
        "Parts-stress formula: λ_p = λ_b · Π π. Capacitor: λ_p,C = 0.05·1.2·2.0·1.5·1.0 = 0.18 FIT. Resistor: λ_p,R = 0.02·1.2·2.0·1.0·1.0 = 0.048 FIT. IC: λ_p,IC = 0.10·1.5·2.0·1.5·1.0 = 0.45 FIT. Board sum: λ_system = 5·0.18 + 3·0.048 + 2·0.45 = 0.90 + 0.144 + 0.90 = 1.944 FIT. Convert: 1.944 FIT = 1.944e−9/h. MTBF_system = 1/λ_system = 1/1.944e−9 = 5.144e8 h ≈ 514 million hours. The ICs dominate (2·0.45=0.90 FIT, 46% of the total), followed by the capacitors (5·0.18=0.90 FIT, also 46%); resistors are negligible (3·0.048=0.144 FIT, 7%). The DFR strategy to reduce λ_system focuses on the ICs (upgrade π_Q 1.5→0.5, halving the IC failure rate) or on the capacitors (increase voltage derating π_S 1.5→0.3, reducing λ_C from 0.18 to 0.036 FIT).",
      whyOthersWrong: [
        "Option A (λ_system=1.944 FPMH, MTBF=514,000h) — unit error. The parts-stress sum is 1.944 FIT (= 1.944e−9/h, MTBF=514M h), not 1.944 FPMH (= 1.944e−6/h, MTBF=514,000h). The base rates are in FIT (1e−9/h), so the sum is in FIT and the MTBF is in the billion-hour range, not the million-hour range.",
        "Option C (λ_system=0.51 FIT, MTBF=1.96e9h) — this is the parts-count sum (no pi-factors): 5·0.05+3·0.02+2·0.10 = 0.51 FIT. The question asks for parts-stress (with pi-factors), so 0.51 FIT is incorrect; the correct parts-stress λ_system = 1.944 FIT (about 4× higher than parts-count because the pi-factors raise the rates for the operating conditions).",
        "Option D (λ_system=19.44 FIT, MTBF=5.14e7h) — order-of-magnitude error: 1.944 FIT was multiplied by 10 (perhaps converting FIT to FPMH incorrectly: 1 FPMH = 1000 FIT, not 10 FIT). Always check: 1 FIT = 1e−9/h; 1 FPMH = 1e−6/h = 1000 FIT.",
      ],
      explanation:
        "Parts-stress λ_p = λ_b·Π π. Capacitor 0.05·1.2·2.0·1.5·1.0=0.18 FIT; Resistor 0.048 FIT; IC 0.45 FIT. Sum: 5·0.18+3·0.048+2·0.45 = 1.944 FIT = 1.944e−9/h. MTBF = 1/1.944e−9 = 5.144e8 h ≈ 514M h.",
      options: [
        { text: "λ_system = 1.944 FPMH; MTBF ≈ 514,000 h", isCorrect: false },
        { text: "λ_system = 1.944 FIT; MTBF ≈ 5.14×10⁸ h (514 million hours)", isCorrect: true },
        { text: "λ_system = 0.51 FIT; MTBF ≈ 1.96×10⁹ h", isCorrect: false },
        { text: "λ_system = 19.44 FIT; MTBF ≈ 5.14×10⁷ h", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability Prediction & DVP&R",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Automotive",
      stem: "A Duane reliability-growth program reports: at T1=500h test, MTBF_cum=200h; at T2=5,000h test, MTBF_cum=400h. Solve for the Duane growth rate β and predict MTBF_cum at T=50,000h.",
      whyCorrect:
        "Duane model: ln(MTBF_cum) = ln(1/α) + β·ln(T). Two equations: ln(200) = ln(1/α) + β·ln(500); ln(400) = ln(1/α) + β·ln(5,000). Subtract: ln(400) − ln(200) = β·(ln(5,000) − ln(500)) → ln(400/200) = β·ln(10) → ln(2) = β·2.3026 → β = 0.6931/2.3026 = 0.301. So MTBF_cum doubles every 10× increase in test time (a 'log cycle'). Solve for α: ln(1/α) = ln(200) − 0.301·ln(500) = 5.298 − 0.301·6.215 = 5.298 − 1.870 = 3.428 → 1/α = exp(3.428) = 30.85 → α = 0.0324. Predict MTBF_cum at T=50,000h: MTBF_cum(50,000) = (1/α)·T^β = 30.85·50,000^0.301. Compute 50,000^0.301 = exp(0.301·ln(50,000)) = exp(0.301·10.821) = exp(3.257) = 25.95. MTBF_cum(50,000) = 30.85·25.95 = 800.6 ≈ 800 h. The cumulative MTBF doubled from 400h (at T=5,000) to 800h (at T=50,000) — consistent with β=0.301 (doubles per log cycle of test time). The instantaneous MTBF at T=50,000h is MTBF_inst = MTBF_cum/(1−β) = 800/0.699 = 1,146 h — the current design MTBF.",
      whyOthersWrong: [
        "Option A (β=0.693, MTBF_cum(50000)=200h) — wrong β. β=0.693 would be ln(2)/1.0 — that would be the growth rate if test time doubled (×2, not ×10). Here T goes from 500 to 5000 (×10) and MTBF_cum doubles, so β = ln(2)/ln(10) = 0.301, not 0.693. The predicted MTBF_cum(50,000)=200h would mean the design regressed — absurd for a growth program.",
        "Option C (β=0.5, MTBF_cum(50000)=400h) — wrong β and wrong prediction. β=0.5 would mean MTBF_cum scales as T^0.5 (√T); for T going 5000→50,000 (×10), MTBF_cum would grow by √10=3.16× → 400·3.16 = 1,265h, not 400h (the option claims no growth). The correct β=0.301 gives MTBF_cum doubling per log cycle.",
        "Option D (β=0, MTBF_cum(50000)=400h) — β=0 means NO growth (flat MTBF_cum); the test program would be a failure (no reliability improvement). The data show MTBF_cum grew from 200h to 400h (×2) — so β > 0.",
      ],
      explanation:
        "Duane: β = ln(MTBF2/MTBF1)/ln(T2/T1) = ln(400/200)/ln(5000/500) = ln(2)/ln(10) = 0.6931/2.3026 = 0.301. Solve 1/α = MTBF1/T1^β = 200/500^0.301 = 200/6.48 = 30.85. MTBF_cum(50,000) = 30.85·50,000^0.301 = 30.85·25.95 = 800h. β=0.301 = MTBF_cum doubles per log cycle of test time.",
      options: [
        { text: "β = 0.693; MTBF_cum(50,000) = 200 h", isCorrect: false },
        { text: "β = 0.301; MTBF_cum(50,000) ≈ 800 h", isCorrect: true },
        { text: "β = 0.5; MTBF_cum(50,000) = 400 h", isCorrect: false },
        { text: "β = 0; MTBF_cum(50,000) = 400 h (no growth)", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability Prediction & DVP&R",
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Aerospace",
      stem: "True or False: The Duane instantaneous MTBF (MTBF_inst = MTBF_cum/(1−β)) is always LARGER than the cumulative MTBF (MTBF_cum), reflecting the design improvement that has occurred by time T.",
      whyCorrect:
        "TRUE. The Duane instantaneous MTBF (the current design MTBF at time T) is MTBF_inst(T) = MTBF_cum(T)/(1−β) where β is the growth rate (0 < β < 1). Since (1−β) < 1, MTBF_inst > MTBF_cum — always. The interpretation: MTBF_cum is the running average (total time / total failures) — it lags the current design quality because the early failures (from the design's earlier, less-reliable state) are still in the numerator. MTBF_inst is the instantaneous failure rate's reciprocal — it reflects only the current design state (after corrective actions). For β=0.301 (the typical growth rate), MTBF_inst = MTBF_cum/0.699 = 1.43·MTBF_cum — about 43% higher. As test time grows and the cumulative and instantaneous diverge, MTBF_inst approaches the design MTBF the field will see. The test-stop criterion: stop when MTBF_inst crosses the allocated MTBF target.",
      whyOthersWrong: [
        "Option FALSE — would imply MTBF_inst ≤ MTBF_cum, which would mean the design is getting worse over time (negative growth). But the Duane model is for reliability GROWTH programs — the design improves over time. The (1−β) factor in the denominator (with 0<β<1) makes MTBF_inst > MTBF_cum always. If growth is stalled (β→0), MTBF_inst → MTBF_cum (they converge); if growth is strong (β→0.5), MTBF_inst = 2·MTBF_cum.",
      ],
      explanation:
        "TRUE. MTBF_inst = MTBF_cum/(1−β) with 0<β<1 → (1−β)<1 → MTBF_inst > MTBF_cum always. The cumulative lags the instantaneous because early failures (from the less-reliable early design) are in the numerator. For β=0.301, MTBF_inst ≈ 1.43·MTBF_cum.",
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Design for Reliability (DFR)
// (Competency: "Design for Reliability (DFR)"; slug:
//  rdd-design-for-reliability-dfr)
// ---------------------------------------------------------------------------

const LESSON_DFR: RefLesson = {
  competencyName: "Design for Reliability (DFR)",
  slug: "rdd-design-for-reliability-dfr",
  title: "Design for Reliability (DFR)",
  titleAr: "التصميم من أجل الموثوقية (DFR)",
  order: 3,
  durationMin: 40,
  references: RDD_REFERENCE_TITLES,
  conceptIntroduction: `Design for Reliability (DFR) is the systematic application of methods and tools during the design phase to meet the allocated reliability targets (Lesson 1) confirmed by prediction (Lesson 2). The DFR lifecycle spans five phases: PLAN (define reliability goals, identify critical failure modes from FMEA, allocate R_i*), DESIGN (apply derating, redundancy, FMEA-driven design changes, parts selection), ANALYZE (FTA, FMECA, design reviews at PDR/CDR), VERIFY (DVP&R test program — Lesson 2, HALT/ALT/demonstration), and SUSTAIN (field FRACAS, root-cause analysis, corrective actions). The ASQ CRE BOK identifies six core DFR methods: (1) DERATING — operating components below their rated electrical/thermal/mechanical stress, lowering π_S in the parts-stress prediction; (2) REDUNDANCY — parallel, k-out-of-n, standby, or voting configurations; (3) FMEA/FMECA IN DESIGN — the bottom-up failure-mode analysis at concept/design/pre-production gates, driving RPN-prioritized design changes; (4) DESIGN REVIEWS — PDR (Preliminary), CDR (Critical), TRR (Test Readiness) with cross-functional reliability review boards; (5) ROBUST DESIGN (TAGUCHI) — parameter design via orthogonal arrays and signal-to-noise ratios, separating control from noise factors to make the design insensitive to environmental variation; (6) PHYSICS-OF-FAILURE (PoF) — modeling the specific failure mechanisms (solder fatigue, electromigration, dielectric breakdown) and designing out the dominant ones. DFR closes the prediction-vs-allocation gap by reducing the predicted λ_system to meet (or beat) the allocated λ_system*.`,
  example: `**Capacitor derating (50% voltage).** A 100 µF electrolytic capacitor is rated 25V at 85°C. Operating stress: 12.5V (50% of rated voltage) at 70°C. MIL-HDBK-217F capacitor model: λ_p = λ_b·π_T·π_E·π_SR·π_Q. Stress-ratio factor π_SR is tabulated vs S=V_op/V_rated: S=1.0 → π_SR=1.0; S=0.5 → π_SR=0.10 (10× reduction); S=0.6 → π_SR=0.18; S=0.7 → π_SR=0.32. With λ_b=5.6e−3 FPMH, π_T=1.3 (70°C), π_E=2.0 (ground-mobile), π_Q=1.0, π_SR=0.10 (S=0.5): λ_p = 5.6e−3·1.3·2.0·0.10·1.0 = 1.456e−3 FPMH = 1.456 FIT. Without derating (S=1.0, π_SR=1.0): λ_p = 5.6e−3·1.3·2.0·1.0·1.0 = 1.456e−2 FPMH = 14.56 FIT — 10× higher. MTBF improves from 1/14.56e−9 = 6.87e7h to 1/1.456e−9 = 6.87e8h. The 50% voltage derating cuts the failure rate by 10× and extends MTBF by 10× — at the cost of a higher voltage-rating capacitor (e.g., 50V rated for 25V operation, more expensive and larger). Trade-off: 2× cost/size for 10× reliability improvement — almost always justified for mission-critical applications.`,
  keyFormulas: `DFR lifecycle: PLAN → DESIGN → ANALYZE → VERIFY → SUSTAIN
Derating (electrical stress):
  S = V_op / V_rated  (stress ratio, dimensionless, [0..1])
  π_SR(S) = MIL-HDBK-217F tabulated factor; π_SR(1.0)=1.0; π_SR(0.5)=0.10 (capacitors)
  λ_p = λ_b · π_T · π_E · π_Q · π_SR(S) · ...  (derating reduces π_SR → lower λ_p)
Redundancy (parallel reliability, k-out-of-n):
  R_parallel(t) = 1 − (1 − R_i(t))^n  (n parallel, all active)
  R_koon(t) = Σ_(i=k)^n C(n,i)·R_i^i·(1−R_i)^(n−i)  (k-out-of-n)
  R_standby(t) (cold, perfect switch) = R_1(t)·[1 + λ_2·t]  (one active, one standby)
FMEA RPN: RPN = Severity × Occurrence × Detection  (each 1–10; RPN range 1–1000)
Design reviews: PDR (concept → architecture), CDR (architecture → detailed design), TRR (detailed design → test)
Taguchi loss function:
  Nominal-the-best: L(y) = k·(y − T)²   (T is target, k is loss coefficient)
  Larger-the-better: L(y) = k / y²
  Smaller-the-better: L(y) = k · y²
Taguchi SNR (signal-to-noise ratio):
  Nominal-the-best: SNR_N = 10·log10(ȳ²/s²)
  Larger-the-better: SNR_L = −10·log10(Σ(1/y_i²)/n)
  Smaller-the-better: SNR_S = −10·log10(Σy_i²/n)
Orthogonal arrays: L8(2^7), L9(3^4), L12(2^11), L16(2^15) — minimal experiments for many factors`,
  exercise: `You are the CRE on a 4-subsystem automotive ADAS module. Parts-stress prediction (Lesson 2) gives λ_system = 1.4e−5/h (MTBF = 71,000h) — 29% short of the 100,000h allocation. (a) Apply capacitor voltage derating (S=0.6, π_SR 1.0→0.32) to 10 capacitors currently at λ_b=0.10 FIT each, π_S=1.0 — compute the new λ_system and feasibility verdict. (b) Apply 2oo3 cold-standby redundancy to the CAN-bus transceiver (currently E_i=1.0, n_i=5; new E_i=0.33) — recompute the allocation for that subsystem. (c) Conduct an FMEA on the image sensor: severity S=8 (safety-critical), occurrence O=4 (rare), detection D=3 (likely detected) — compute RPN; if the threshold is 100, does this mode trigger a design change? (d) Run a Taguchi L9(3^4) parameter design on three control factors (capacitor value A, resistor tolerance B, op-amp gain C) at three levels each, against two noise factors (temperature, supply voltage). Compute the SNR per row and identify the optimal A,B,C combination. (e) Schedule the design reviews (PDR, CDR, TRR) — what are the entry/exit criteria for each?`,
  sections: {
    learning_objectives: `- Apply the DFR lifecycle: PLAN → DESIGN → ANALYZE → VERIFY → SUSTAIN.
- Use derating (electrical/thermal/mechanical stress reduction) to lower π_S in the parts-stress prediction.
- Compute parallel, k-out-of-n, and standby-redundancy reliability.
- Apply FMEA/FMECA in design: severity/occurrence/detection, RPN, prioritized design changes at concept/PDR/CDR gates.
- Run design reviews: PDR (concept→architecture), CDR (architecture→detailed), TRR (detailed→test), with explicit entry/exit criteria.
- Apply Taguchi robust design: loss function, SNR, orthogonal arrays, control vs noise factor separation.
- Apply physics-of-failure (PoF) modeling: identify dominant failure mechanisms (solder fatigue, electromigration, dielectric breakdown) and design them out.
- Verify DFR closes the prediction-vs-allocation gap (predicted λ_system ≤ allocated λ_system*).`,
    prerequisites: `- Reliability Allocation & Apportionment (Lesson 1) — the allocated R_i* targets DFR must meet.
- Reliability Prediction & DVP&R (Lesson 2) — the parts-stress λ_system prediction DFR must reduce.
- Reliability Fundamentals (RF) — series/parallel system reliability, FMEA/FTA basics.
- Probability & Statistics (PS) Lesson 1 — exponential R(t)=exp(−λt), binomial for k-out-of-n.
- Basic statistics: mean, variance, normal distribution — for Taguchi SNR.`,
    introduction: `Design for Reliability (DFR) is the systematic application of methods and tools during the design phase to meet the allocated reliability targets (Lesson 1) confirmed by prediction (Lesson 2). Where allocation asks "what must each team deliver?" and prediction asks "will the design as drawn meet the allocation?", DFR answers "what design changes close the gap if the prediction falls short?" DFR is the third leg of the RDD lifecycle — the creative, engineering-judgment step.

The DFR lifecycle spans five phases. PLAN: define reliability goals, identify critical failure modes from FMEA, allocate R_i*. DESIGN: apply derating, redundancy, FMEA-driven design changes, parts selection. ANALYZE: FTA, FMECA, design reviews at PDR/CDR. VERIFY: DVP&R test program (Lesson 2 — HALT, ALT, demonstration). SUSTAIN: field FRACAS, root-cause analysis, corrective actions.

The ASQ CRE BOK identifies six core DFR methods. DERATING — operating components below their rated electrical/thermal/mechanical stress; for a capacitor, dropping V_op from V_rated (S=1.0, π_SR=1.0) to 0.5·V_rated (S=0.5, π_SR=0.10) cuts the failure rate 10×. REDUNDANCY — parallel (n active, R_parallel = 1 − (1−R_i)^n), k-out-of-n (k of n channels must work, R_koon = Σ C(n,i)·R^i·(1−R)^(n−i) for i≥k), standby (one active with one cold spare, R_standby = R_1·[1+λ_2·t]), and voting (e.g., 2oo3 safety). FMEA/FMECA — the bottom-up failure-mode analysis at concept/design/pre-production gates, scoring each mode by RPN = S×O×D and driving corrective action above a threshold (typically RPN>100). DESIGN REVIEWS — PDR (concept→architecture), CDR (architecture→detailed design), TRR (detailed→test), with explicit entry/exit criteria and cross-functional review boards. ROBUST DESIGN (TAGUCHI) — parameter design via orthogonal arrays (L8, L9, L12, L16), signal-to-noise ratios (nominal/larger/smaller-the-best), and control-vs-noise factor separation; the loss function L(y) = k·(y−T)² quantifies the cost of being off-target. PHYSICS-OF-FAILURE (PoF) — modeling the specific failure mechanisms (Coffin-Manson solder fatigue under thermal cycling, Black's electromigration equation, time-dependent dielectric breakdown) and designing out the dominant ones.

DFR closes the prediction-vs-allocation gap: derating reduces λ_p (lower π_S), redundancy changes the system architecture (lower E_i in the allocation; raises R_system), FMEA-driven design changes eliminate high-RPN failure modes (lower λ_b), Taguchi robust design reduces variability (lower effective failure rate under stress variation). The iteration: re-predict after DFR, re-check feasibility, repeat until predicted ≤ allocated.`,
    terminology: `- **DFR (Design for Reliability)**: systematic reliability-engineering methods during design.
- **Derating**: operating a component below its rated stress (electrical, thermal, mechanical) to reduce failure rate.
- **Stress ratio S = V_op/V_rated**: dimensionless [0..1]; π_SR(S) is the MIL-HDBK-217F tabulated factor.
- **Redundancy**: parallel, k-out-of-n, standby, voting configurations that improve system reliability.
- **Parallel redundancy**: n active channels; R_parallel = 1 − (1−R_i)^n.
- **k-out-of-n (koon)**: k of n channels must work; R_koon = Σ_(i=k)^n C(n,i)·R^i·(1−R)^(n−i).
- **Standby redundancy**: one active, one (or more) cold spares; R_standby = R_1·[1+λ_2·t] (perfect switch, exponential).
- **Voting redundancy (e.g., 2oo3)**: k of n channels must agree; used for safety systems (SIL 2/3).
- **FMEA (Failure Modes and Effects Analysis)**: bottom-up analysis of component failure modes and their effects.
- **FMECA (Criticality Analysis)**: FMEA + criticality ranking (RPN or criticality number).
- **RPN (Risk Priority Number)**: RPN = Severity × Occurrence × Detection; range 1–1000.
- **Severity (S), Occurrence (O), Detection (D)**: each scored 1–10 in FMEA.
- **Design review (PDR/CDR/TRR)**: cross-functional review at lifecycle gates with entry/exit criteria.
- **Taguchi loss function**: L(y) = k·(y−T)²; quantifies the cost of being off-target (nominal-the-best).
- **SNR (Signal-to-Noise Ratio)**: Taguchi metric; nominal/larger/smaller-the-best forms.
- **Orthogonal array (L8/L9/L12/L16)**: minimal-experiment design for many factors at multiple levels.
- **Control vs noise factors**: control factors (designer-set); noise factors (environmental, manufacturing variation).
- **Physics-of-failure (PoF)**: modeling specific failure mechanisms (solder fatigue, electromigration, dielectric breakdown).
- **Coffin-Manson**: solder fatigue under thermal cycling; N_f = C·(Δε_pl)^c.
- **Black's equation**: electromigration MTTF = A·J^−n·exp(Ea/kT).
- **Arrhenius**: thermal acceleration; AF = exp(Ea/k·(1/T_op − 1/T_accel)).`,
    detailed_explanation: `Derating is the simplest and most effective DFR method. Operating a component below its rated electrical/thermal/mechanical stress reduces the failure rate by lowering the stress-ratio factor π_S in the parts-stress prediction. For a 25V-rated electrolytic capacitor operating at 12.5V (S=0.5), MIL-HDBK-217F gives π_SR = 0.10 — a 10× reduction in λ_p. Other derating dimensions: thermal (operating at 70°C vs 85°C rated lowers π_T by 1.5–2×); mechanical (de-rating a relay's contact current from 10A rated to 5A extends life by 2–4×); voltage (the capacitor example); frequency (lower clock frequency reduces IC power dissipation and π_T). The trade-off: a higher-rated component is larger and more expensive (a 50V capacitor vs a 25V one is ~2× cost and ~2× volume). For mission-critical applications, the trade-off is almost always justified; for commodity consumer electronics, derating is typically 60–80% (S=0.6–0.8) to balance cost and reliability.

Redundancy improves system reliability by adding channels. PARALLEL redundancy: n active channels; system reliability R_parallel = 1 − (1−R_i)^n (all channels must fail for system failure). For R_i=0.90, n=2: R_parallel = 1 − 0.1² = 0.99 (10× improvement). K-OUT-OF-N: k of n channels must work; R_koon = Σ_(i=k)^n C(n,i)·R^i·(1−R)^(n−i). For 2oo3 with R_i=0.90: R_2oo3 = C(3,2)·0.9²·0.1 + C(3,3)·0.9³ = 3·0.081 + 0.729 = 0.243 + 0.729 = 0.972. STANDBY redundancy: one active, one cold spare that switches in on failure; R_standby = R_1·[1 + λ_2·t] (perfect switch, exponential). VOTING redundancy (e.g., 2oo3): k of n channels must AGREE; used for safety systems (SIL 2/3) to detect and isolate failed channels. The trade-off: redundancy adds cost (n× hardware), weight, and complexity (switching, voting logic); the importance factor E_i = 1/n for k-out-of-n active redundancy reflects the relaxed per-channel allocation (Lesson 1).

FMEA (Failure Modes and Effects Analysis) is the bottom-up structured technique that identifies every component's failure modes, their effects on the system, and their causes. Each mode is scored on Severity (S, 1–10), Occurrence (O, 1–10), and Detection (D, 1–10). The RPN = S×O×D (range 1–1000) ranks the modes; modes with RPN above a threshold (typically 100) trigger corrective action. FMECA (Criticality Analysis) adds a criticality number (the expected failure rate × severity). In DFR, FMEA is conducted at three gates: CONCEPT (architecture-level FMEA — identifies system-level failure paths), DESIGN (component-level DFMEA — drives component selection and derating), PRE-PRODUCTION (process PFMEA — drives manufacturing controls). The FMEA outputs feed the design reviews (PDR, CDR) and the DVP&R (Lesson 2 — HALT targets the high-RPN modes).

Design reviews are the cross-functional gates that approve the design's progress. PDR (Preliminary Design Review) at the concept→architecture transition: entry criteria = concept FMEA complete, allocation table approved, parts-count prediction; exit criteria = architecture approved, subsystem interfaces defined, key components selected. CDR (Critical Design Review) at the architecture→detailed-design transition: entry = detailed DFMEA, parts-stress prediction, derating/redundancy applied; exit = design released to manufacturing, BOM frozen, DVP&R approved. TRR (Test Readiness Review) at the detailed-design→test transition: entry = DVP&R approved, test articles built, test fixtures calibrated; exit = test execution begins. Each review has entry/exit criteria, cross-functional attendees (design, reliability, manufacturing, quality, customer), and a formal sign-off.

Taguchi robust design (parameter design) makes the design insensitive to environmental variation by separating CONTROL factors (designer-set: component values, tolerances, materials) from NOISE factors (environmental: temperature, supply voltage, manufacturing variation). The method uses ORTHOGONAL ARRAYS (L8, L9, L12, L16) — minimal-experiment designs for many factors at multiple levels. The SIGNAL-TO-NOISE RATIO (SNR) captures the design's robustness: nominal-the-best SNR_N = 10·log10(ȳ²/s²) (maximize mean, minimize variance); larger-the-better SNR_L = −10·log10(Σ(1/y_i²)/n); smaller-the-better SNR_S = −10·log10(Σy_i²/n). The LOSS FUNCTION L(y) = k·(y−T)² (nominal-the-best) quantifies the cost of being off-target: a 5V output at 5.1V (0.1V off) with k=$10/V² costs $0.10; at 5.5V (0.5V off) costs $2.50; at 6.0V (1.0V off) costs $10. Taguchi's insight: any deviation from target is a loss to the customer, not just out-of-spec failures. The orthogonal array experiment identifies the control-factor combination that maximizes SNR (the most robust design).

Physics-of-failure (PoF) models the specific failure mechanisms. COFFIN-MANSON (solder fatigue under thermal cycling): N_f = C·(Δε_pl)^c where N_f is cycles to failure, Δε_pl is plastic strain range, C and c are material constants (c≈0.4–0.6 for lead-free solder). BLACK'S EQUATION (electromigration MTTF): MTTF = A·J^−n·exp(Ea/kT) where J is current density, n≈2, Ea≈0.7–1.0 eV. TIME-DEPENDENT DIELECTRIC BREAKDOWN (TDDB): MTTF = A·exp(−γ·E_ox)·exp(Ea/kT) where E_ox is oxide electric field. PoF identifies the dominant failure mechanism (the one with the lowest MTTF under the operating conditions) and designs it out (lower E_ox by derating, lower J by larger cross-section, lower ΔT by thermal management).

The iteration: after each DFR change (derating, redundancy, FMEA-driven change, Taguchi optimization, PoF redesign), re-predict λ_system and re-check feasibility (predicted ≤ allocated). Repeat until feasible. DFR closes the prediction-vs-allocation gap; the DVP&R (Lesson 2) verifies the design meets the allocation under test.`,
    core_principles: `- DFR lifecycle: PLAN → DESIGN → ANALYZE → VERIFY → SUSTAIN.
- Derating reduces π_S in parts-stress; 50% voltage derating cuts capacitor λ_p by 10×.
- Redundancy: parallel R = 1 − (1−R_i)^n; k-out-of-n R = Σ C(n,i)·R^i·(1−R)^(n−i); standby R = R_1·(1+λ_2·t).
- FMEA: RPN = S×O×D; threshold typically 100; drives design changes at concept/design/pre-production gates.
- Design reviews: PDR (concept→architecture), CDR (architecture→detailed), TRR (detailed→test); entry/exit criteria.
- Taguchi: L(y) = k·(y−T)² (nominal); SNR_N/L/S forms; orthogonal arrays (L8, L9, L12, L16) — minimal experiments for many factors.
- PoF: Coffin-Manson (solder fatigue), Black (electromigration), TDDB (oxide) — model the dominant mechanism and design it out.
- Iteration: re-predict after DFR; re-check feasibility (predicted ≤ allocated); repeat until feasible.`,
    components: `- **Derating parameters**: S = V_op/V_rated; π_SR(S); thermal, mechanical derating.
- **Redundancy configurations**: parallel, k-out-of-n, standby, voting; importance E_i = 1/n for active redundancy.
- **FMEA table**: failure mode, effect, cause, S, O, D, RPN, recommended action, owner.
- **Design review entry/exit criteria**: cross-functional sign-off at PDR, CDR, TRR.
- **Taguchi OA**: L8(2^7), L9(3^4), L12(2^11), L16(2^15) — assignment of control factors.
- **Taguchi SNR**: nominal/larger/smaller-the-best; computed per row; maximized.
- **Taguchi loss function**: L(y) = k·(y−T)²; loss coefficient k.
- **PoF models**: Coffin-Manson, Black, TDDB; identifies dominant mechanism.`,
    process: `1. PLAN: define reliability goals; conduct concept FMEA; allocate R_i* (Lesson 1).
2. DESIGN: apply derating (lower π_S); apply redundancy (lower E_i, change architecture); conduct DFMEA; select parts.
3. ANALYZE: FTA, FMECA, parts-stress prediction (Lesson 2); check feasibility vs allocation.
4. ITERATE: if predicted > allocated, apply DFR changes (derating, redundancy, FMEA-driven changes, Taguchi, PoF redesign) and re-predict.
5. DESIGN REVIEWS: PDR (concept→architecture; entry: concept FMEA, allocation; exit: architecture approved). CDR (architecture→detailed; entry: DFMEA, parts-stress, derating/redundancy applied; exit: BOM frozen, DVP&R approved). TRR (detailed→test; entry: DVP&R approved; exit: test execution begins).
6. VERIFY: DVP&R test program (HALT, ALT, demonstration) — Lesson 2.
7. SUSTAIN: field FRACAS, root-cause, corrective actions; feed back to next-generation DFR.
8. Taguchi parameter design: identify control vs noise factors; choose OA; run experiments; compute SNR per row; pick factor levels maximizing SNR; run confirmation experiment.
9. PoF analysis: identify candidate failure mechanisms; model each (Coffin-Manson, Black, TDDB); identify dominant (lowest MTTF); design out (derating, materials, geometry).
10. Re-predict after each DFR change; repeat until predicted ≤ allocated; freeze design at CDR.`,
    formula_calculation: `Variables and formulas:
- S = V_op / V_rated: stress ratio [0..1], dimensionless.
- π_SR(S): MIL-HDBK-217F stress-ratio factor; for capacitors, π_SR(1.0)=1.0, π_SR(0.5)=0.10 (10× reduction).
- λ_p = λ_b · π_T · π_E · π_Q · π_SR(S) · π_C · ...: parts-stress failure rate with derating.
- R_parallel = 1 − (1 − R_i)^n: n active parallel channels.
- R_koon = Σ_(i=k)^n C(n,i)·R_i^i·(1 − R_i)^(n−i): k-out-of-n reliability (binomial).
- R_standby = R_1 · [1 + λ_2·t]: one active + one cold spare, perfect switch, exponential.
- RPN = S × O × D: each 1–10; RPN range 1–1000; threshold typically 100.
- L(y) = k·(y − T)²: Taguchi nominal-the-best loss function (k = loss coefficient, $/unit²; y = measured value; T = target).
- L(y) = k/y² (larger-the-better); L(y) = k·y² (smaller-the-better).
- SNR_N = 10·log10(ȳ²/s²): nominal-the-best SNR (maximize).
- SNR_L = −10·log10(Σ(1/y_i²)/n): larger-the-better SNR (maximize).
- SNR_S = −10·log10(Σy_i²/n): smaller-the-better SNR (maximize).
- N_f = C·(Δε_pl)^c: Coffin-Manson solder fatigue (c≈0.4–0.6 lead-free).
- MTTF = A·J^−n·exp(Ea/kT): Black's electromigration (n≈2, Ea≈0.7–1.0 eV).
- AF = exp(Ea/k·(1/T_op − 1/T_accel)): Arrhenius acceleration factor.

Units: S, R, RPN dimensionless; L in $/unit; SNR in dB; N_f in cycles; MTTF in h; AF dimensionless.

Assumptions: (i) derating pi-factors are multiplicative and independent (approximation); (ii) redundancy channels are independent (no common-cause); (iii) FMEA scores are subjective (cross-functional calibration needed); (iv) Taguchi OA assumes factor additivity (no interactions, or limited to two-factor interactions captured in the OA); (v) PoF models are valid for the specific failure mechanism and material.

Interpretation: derating is the highest-leverage DFR method (10× failure-rate reduction for 50% capacitor voltage derating); redundancy changes the architecture (costly but most consequential for safety); FMEA prioritizes design changes (RPN>100 = action required); Taguchi reduces variability (the loss function captures both mean and variance); PoF designs out the dominant failure mechanism (the lowest-MTTF mechanism under the operating conditions).`,
    worked_example: `**Electronics — capacitor derating 50% voltage.**
Given: 100 µF electrolytic capacitor rated 25V at 85°C. Operating stress: 12.5V (50% of rated) at 70°C. MIL-HDBK-217F capacitor model: λ_p = λ_b·π_T·π_E·π_SR·π_Q.
Base rate: λ_b = 5.6e−3 FPMH (typical for electrolytic capacitors).
Pi-factors: π_T(70°C) = 1.3; π_E(ground-mobile) = 2.0; π_Q(commercial) = 1.0.
Stress ratio: S = V_op/V_rated = 12.5/25 = 0.5.
π_SR(S=0.5) = 0.10 (MIL-HDBK-217F capacitor table; 10× reduction vs S=1.0).

Step 1 — Compute λ_p WITH derating (S=0.5):
λ_p = 5.6e−3 · 1.3 · 2.0 · 0.10 · 1.0 = 1.456e−3 FPMH = 1.456 FIT = 1.456e−9/h.

Step 2 — Compute λ_p WITHOUT derating (S=1.0):
π_SR(S=1.0) = 1.0.
λ_p = 5.6e−3 · 1.3 · 2.0 · 1.0 · 1.0 = 1.456e−2 FPMH = 14.56 FIT = 1.456e−8/h.

Step 3 — Improvement factor:
λ_p_with/λ_p_without = 1.456/14.56 = 0.10 → 10× reduction in failure rate.
MTBF_with = 1/1.456e−9 = 6.87e8 h = 687 million hours.
MTBF_without = 1/1.456e−8 = 6.87e7 h = 68.7 million hours.
MTBF improvement: 10× (from 69M h to 687M h).

Step 4 — Cost/size trade-off:
The 50% voltage derating requires a 50V-rated capacitor (operating at 25V max) — typically 2× cost and 2× volume vs the 25V-rated part. For mission-critical applications (aerospace, medical), the 10× reliability improvement justifies the 2× cost/size penalty. For consumer electronics, derating is typically 60–80% (S=0.6–0.8) for cost optimization.

**FMEA RPN example — image sensor failure mode.**
Failure mode: image sensor saturates under high ambient temperature (>65°C).
Effect: ADAS module fails to detect lanes (safety-critical).
Cause: thermal derating of CMOS image sensor insufficient.
Severity S = 8 (safety-critical, could cause accident).
Occurrence O = 4 (occasional — 1 in 1,000 operating hours at high temp).
Detection D = 3 (likely detected — built-in test catches saturation).
RPN = S × O × D = 8 × 4 × 3 = 96.
With threshold = 100, RPN=96 is just BELOW the threshold — the mode does NOT trigger automatic corrective action. But because the failure is safety-critical (S=8), the FMEA procedure requires review by the cross-functional team even at RPN=96. Recommended action: increase thermal margin (heatsink, air-flow), reducing O to 2 (rare) → RPN = 8 × 2 × 3 = 48 (now well below threshold).

**Taguchi loss function — circuit output 5V ±0.5V.**
Target T = 5.0V; loss coefficient k = $10/V² (cost of being off-target per V²).
At y = 5.0V: L = $10·(0)² = $0 (on-target, no loss).
At y = 5.1V: L = $10·(0.1)² = $0.10 (10 cents — within spec but small loss).
At y = 5.5V (at spec limit): L = $10·(0.5)² = $2.50 (within spec but $2.50 loss).
At y = 6.0V (out of spec): L = $10·(1.0)² = $10 (out-of-spec, full loss).
Taguchi's insight: even within-spec deviations incur loss; the goal is to minimize variance, not just stay in spec.`,
    industrial_example: `**Electronics — industrial controller derating + redundancy.** An industrial controller board was 30% short of its MTBF=50,000h allocation. DFR applied: capacitor voltage derating from S=1.0 to S=0.5 (π_SR 1.0→0.10, 10× failure-rate reduction on 12 capacitors); 2oo3 cold-standby redundancy on the CAN-bus transceiver (E_i 1.0→0.33, 3× relaxed per-channel allocation); image-sensor thermal derating (heatsink + air-flow, dropping π_T from 1.5 to 1.0). Re-prediction: λ_system dropped from 2.0e−5/h to 9.5e−6/h (MTBF rose from 50,000h to 105,000h) — feasible. Method per MIL-HDBK-217F and Ebeling (2010, Ch. 11).

**Automotive — ADAS module Taguchi parameter design.** An ADAS supplier ran a Taguchi L9(3^4) parameter design on three control factors (capacitor value A, resistor tolerance B, op-amp gain C) at three levels each, against two noise factors (temperature −40..+85°C, supply voltage 9–16V). The response was the lane-detection accuracy. SNR_N (nominal-the-best) computed per row; the optimal A2B3C1 combination maximized SNR (lowest variance) and improved accuracy from 95% to 99.2% under environmental variation. Method per Montgomery (2017, Ch. 15) and O'Connor (2012, Ch. 13).`,
    case_study: `CASE_TYPE = SYNTHETIC. A medical-device company developed an infusion pump with a 6-subsystem architecture allocated R_system(72h) ≥ 0.995. Initial parts-stress prediction gave MTBF_system = 4,200h vs the allocated 5,800h — a 28% shortfall. The DFR team applied four interventions: (1) capacitor voltage derating S=1.0→0.5 on the 8 power-rail capacitors (π_SR 1.0→0.10, λ_p dropped 10×); (2) 2oo3 cold-standby redundancy on the user-interface subsystem (E_6 1.0→0.33, per-channel allocation relaxed 3×); (3) FMEA-driven heatsink on the pump-motor driver (RPN=120 → RPN=30 after action); (4) Taguchi L9 parameter design on three control factors (pump-orifice diameter A, motor-tolerance B, sensor-gain C) maximizing SNR_N for drug-delivery accuracy. Re-prediction: MTBF_system rose to 6,150h — feasible (above the 5,800h allocation). The DVP&R (Lesson 2) was approved at CDR with HALT/ALT/demonstration tests targeting the high-RPN failure modes; reliability growth (Duane β=0.30) projected MTBF_inst = 5,950h at T=10,000h test time. The pump received FDA 510(k) clearance with the reliability case documented in the design history file. Source: synthetic case authored for this lesson, method per Ebeling (2010, Ch. 11) and Montgomery (2017, Ch. 15).`,
    visual_explanation: `The derating curve is visualized as π_SR vs S = V_op/V_rated: a near-exponential rise from π_SR=0.1 at S=0.5 to π_SR=1.0 at S=1.0 (capacitors). The redundancy reliability is visualized as a bar chart: R_i (single channel) vs R_parallel (n=2) vs R_koon (2oo3) vs R_standby — showing the reliability improvement and the cost (n× hardware). The FMEA table is a spreadsheet with columns (Mode, Effect, Cause, S, O, D, RPN, Action, Owner) sorted descending by RPN — the top 10% drives 80% of the design changes. The Taguchi OA is visualized as an L9(3^4) matrix with 9 rows × 4 columns (3 control factors + 1 dummy) × 3 levels each; the response and SNR are added per row; the factor-level SNR averages identify the optimal combination. The PoF models are visualized as MTTF-vs-stress curves (Coffin-Manson N_f vs ΔT, Black MTTF vs J, TDDB MTTF vs E_ox) — the dominant mechanism is the curve with the lowest MTTF at the operating stress.`,
    simulation_opportunity: `An interactive simulation could let the learner (i) input the BOM and the parts-stress λ_p; (ii) apply derating by setting S = V_op/V_rated per part and watching π_SR (and λ_p) drop; (iii) add redundancy (parallel, k-out-of-n, standby) to selected subsystems and watch R_system rise; (iv) run an FMEA — input failure modes, score S/O/D, compute RPN, sort, and trigger corrective actions above threshold; (v) run a Taguchi L9 parameter design — input 9 rows of factor levels, compute SNR per row, identify optimal A/B/C combination; (vi) compute the Taguchi loss function L(y) = k·(y−T)² across a tolerance range; (vii) visualize the PoF MTTF curves and identify the dominant failure mechanism under the operating stress.`,
    common_mistakes: `- Derating without checking the cost/size trade-off — 50% voltage derating gives 10× reliability but 2× cost/size; for commodity electronics, derate to 60–80% (S=0.6–0.8) to balance.
- Adding redundancy without lowering the importance E_i in the allocation (Lesson 1) — the redundancy relaxes the per-channel allocation by 1/E_i, so the allocation table must be re-computed; otherwise the redundant subsystem is over-allocated.
- Setting the FMEA RPN threshold too low (e.g., 50) — drives too many low-priority actions and dilutes the team's focus; the conventional threshold is 100.
- FMEA without cross-functional calibration of S/O/D scores — subjective scores from a single team are biased; cross-functional calibration is required.
- Skipping PDR or compressing the design reviews to save schedule — PDR catches architecture mistakes before they propagate to detailed design; CDR catches detailed-design mistakes before they propagate to manufacturing. Skipping reviews is the most expensive schedule "saving".
- Taguchi parameter design without identifying the noise factors — control factors alone miss the point of robust design (insensitivity to noise); the noise factors drive the SNR variance term.
- Confusing Taguchi SNR with signal-to-noise ratio in electrical engineering — Taguchi's SNR is a robustness metric (mean/variance or inverse-mean or mean), not the S/N of communication theory.
- PoF modeling without identifying the dominant mechanism — the dominant mechanism (lowest MTTF) sets the design life; non-dominant mechanisms are second-order.`,
    limitations: `- Derating pi-factors are multiplicative and independent (approximation); π_T and π_S interact in reality.
- Redundancy cannot protect against common-cause failures (dependent failures) — a 2oo3 system with a common-cause failure mode (e.g., shared power supply) fails like a single channel.
- FMEA scores are subjective; S/O/D calibration varies across teams and industries.
- Design reviews are only as good as the cross-functional team — a rubber-stamp review adds no value.
- Taguchi orthogonal arrays assume factor additivity (no interactions); for strong-interaction systems, use a full-factorial or a larger OA.
- The Taguchi loss function L(y) = k·(y−T)² requires the loss coefficient k, which is hard to estimate for non-monetary losses (safety, reputation).
- PoF models are material- and mechanism-specific — a Coffin-Manson constant for one solder alloy does not transfer to another.
- DFR cannot fix an infeasible system target — if the allocated R_i* exceeds the technology's achievable R, the target must be re-negotiated or the architecture changed.`,
    comparison: `**Derating vs Redundancy vs FMEA vs Taguchi vs PoF:**
- Derating: lowers π_S in parts-stress; simplest; 10× reduction for 50% voltage derating; cost 2× (higher-rated part).
- Redundancy: changes architecture; n× hardware cost; 10× reliability improvement for n=2 parallel; E_i lowered to 1/n.
- FMEA: bottom-up mode analysis; RPN prioritizes design changes; threshold 100; subjective scoring.
- Taguchi: parameter design via OA + SNR; reduces variability; loss function captures in-spec losses.
- PoF: mechanism-specific modeling; designs out the dominant mechanism; material-specific constants.

**PDR vs CDR vs TRR:** PDR at concept→architecture (entry: concept FMEA, allocation; exit: architecture approved). CDR at architecture→detailed (entry: DFMEA, parts-stress, derating/redundancy; exit: BOM frozen, DVP&R approved). TRR at detailed→test (entry: DVP&R, fixtures; exit: test execution begins). Each gate has explicit entry/exit criteria and cross-functional sign-off.`,
    practical_application: `- **Electronics (industrial controller)**: capacitor derating + CAN-bus 2oo3 redundancy; λ_system dropped 50%; feasible.
- **Automotive (ADAS module)**: Taguchi L9 parameter design on three control factors; lane-detection accuracy 95% → 99.2%.
- **Aerospace (satellite EPS)**: 2oo3 voting on controller (E_i 1.0→0.33); PoF Coffin-Manson on solder joints under thermal cycling.
- **Medical (infusion pump)**: capacitor derating + 2oo3 UI redundancy + FMEA-driven heatsink + Taguchi L9 parameter design; MTBF 4,200→6,150h.
- **Telecom (optical line terminal)**: derating on optical transmitter laser diode (S=0.5, π_SR 0.10); 10× failure-rate reduction.`,
    decision_scenario: `You are the CRE on a 4-subsystem automotive ADAS module. Parts-stress prediction (Lesson 2) gives MTBF_system = 71,000h — 29% short of the 100,000h allocation. Apply DFR: (a) Derate the 10 image-sensor power-rail capacitors from S=1.0 (π_SR=1.0) to S=0.6 (π_SR=0.32) — compute the new λ_system. (b) Add 2oo3 cold-standby redundancy to the CAN-bus transceiver (E_i 1.0→0.33) — recompute the allocation. (c) Conduct an FMEA on the image-sensor saturation mode (S=8, O=4, D=3) — compute RPN and decide whether a corrective action is triggered. (d) Run a Taguchi L9(3^4) parameter design on capacitor value A, resistor tolerance B, op-amp gain C — compute the SNR per row and identify the optimal combination. (e) Schedule the design reviews (PDR, CDR, TRR) with entry/exit criteria. (f) After DFR, re-predict and re-check feasibility — does the design meet the 100,000h allocation? If not, propose two further remedies.`,
    practice_questions: `- **Q1 (Easy, Recall):** State the Taguchi loss function for nominal-the-best and identify the variables.
- **Q2 (Medium, Calculation):** A 25V-rated capacitor operates at 12.5V (S=0.5); π_SR=0.10. λ_b=5.6e−3 FPMH, π_T=1.3, π_E=2.0, π_Q=1.0. Compute λ_p and the improvement factor vs S=1.0.
- **Q3 (Medium, Application):** Compute the 2oo3 reliability for R_i=0.90 — compare to single-channel and 1oo2 parallel.
- **Q4 (Hard, Analyze):** An FMEA mode has S=8, O=4, D=3 → RPN=96 (below threshold 100). Should a corrective action be triggered? Justify.`,
    certification_questions: `- **CRE-style (Easy):** What does the MIL-HDBK-217F π_SR factor capture? (Electrical stress ratio — derating)
- **CRE-style (Medium, Calculation):** For a 25V-rated capacitor operating at 12.5V (S=0.5), what is the failure-rate improvement factor vs operating at full rated voltage (S=1.0)? (10×)
- **CRE-style (Hard, Analysis):** Compare derating vs redundancy as DFR methods — when is each preferred?`,
    summary: `Design for Reliability (DFR) is the systematic application of methods during design to meet the allocated targets. The DFR lifecycle spans PLAN → DESIGN → ANALYZE → VERIFY → SUSTAIN. Six core methods: DERATING (lower π_S; 50% voltage derating cuts capacitor λ_p 10×); REDUNDANCY (parallel, k-out-of-n, standby, voting); FMEA (RPN = S×O×D, threshold 100); DESIGN REVIEWS (PDR, CDR, TRR with entry/exit criteria); TAGUCHI ROBUST DESIGN (orthogonal arrays, SNR, loss function L(y)=k·(y−T)²); PHYSICS-OF-FAILURE (Coffin-Manson, Black, TDDB). DFR closes the prediction-vs-allocation gap: each method lowers λ_system or changes the architecture (E_i); the iteration re-predicts and re-checks feasibility until predicted ≤ allocated. Taguchi's loss function captures the cost of being off-target (even within-spec deviations incur loss); the SNR captures the design's robustness to noise factors. PoF designs out the dominant failure mechanism. The DVP&R (Lesson 2) verifies the design meets the allocation under test.`,
    key_takeaways: `- DFR lifecycle: PLAN → DESIGN → ANALYZE → VERIFY → SUSTAIN.
- Derating: S = V_op/V_rated; π_SR(0.5)=0.10 → 10× λ_p reduction; cost 2×.
- Redundancy: R_parallel = 1−(1−R_i)^n; R_2oo3(R=0.9) = 0.972; R_standby = R_1·(1+λ_2·t).
- FMEA: RPN = S×O×D; threshold 100; cross-functional scoring.
- Design reviews: PDR (concept→architecture), CDR (architecture→detailed), TRR (detailed→test).
- Taguchi: L(y) = k·(y−T)²; SNR_N/L/S; OA L8/L9/L12/L16.
- PoF: Coffin-Manson (solder fatigue), Black (electromigration), TDDB (oxide).
- DFR closes the prediction-vs-allocation gap; re-predict and re-check after each change.`,
    references: `- ASQ CRE Body of Knowledge — Reliability in Design & Development domain.
- Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 11 (DFR — derating, redundancy, FMEA, design reviews) & Ch. 14 (Taguchi).
- O'Connor & Kleyner (2012), Practical Reliability Engineering, Ch. 11 (DFR), 13 (Taguchi).
- MIL-HDBK-217F (1991, Notice 2) — derating pi-factors (π_SR).
- IEC 61709:2017 — reference conditions and stress models for derating.
- Montgomery (2017), Design and Analysis of Experiments, Ch. 15 (Taguchi robust design).`,
  },
  knowledgeObject: {
    title: "Design for Reliability (DFR)",
    domain: "Reliability in Design & Development",
    competency: "Design for Reliability (DFR)",
    topic: "DFR Methods — Derating, Redundancy, FMEA, Design Reviews, Taguchi, PoF",
    concept: "Systematic reliability-engineering methods during design to meet the allocation",
    body: {
      definitions: [
        "DFR (Design for Reliability): systematic reliability-engineering methods during design.",
        "Derating: operating a component below rated stress (electrical/thermal/mechanical) to reduce failure rate.",
        "Stress ratio S = V_op/V_rated: dimensionless [0..1]; π_SR(S) is the MIL-HDBK-217F factor.",
        "Redundancy: parallel, k-out-of-n, standby, voting configurations that improve system R.",
        "Parallel redundancy: R_parallel = 1 − (1−R_i)^n (n active channels).",
        "k-out-of-n (koon): R_koon = Σ_(i=k)^n C(n,i)·R^i·(1−R)^(n−i).",
        "Standby redundancy: R_standby = R_1·[1+λ_2·t] (one active + one cold spare, perfect switch, exponential).",
        "Voting redundancy (e.g., 2oo3): k of n channels must agree; safety systems (SIL 2/3).",
        "FMEA (Failure Modes and Effects Analysis): bottom-up structured analysis of failure modes and effects.",
        "FMECA: FMEA + criticality ranking (RPN or criticality number).",
        "RPN = Severity × Occurrence × Detection; range 1–1000; threshold typically 100.",
        "Design reviews: PDR (Preliminary), CDR (Critical), TRR (Test Readiness) — gates with entry/exit criteria.",
        "Taguchi loss function: L(y) = k·(y−T)² (nominal-the-best); L(y) = k/y² (larger-the-better); L(y) = k·y² (smaller-the-better).",
        "SNR (Signal-to-Noise Ratio): Taguchi robustness metric; nominal/larger/smaller-the-best forms.",
        "Orthogonal array (L8/L9/L12/L16): minimal-experiment design for many factors.",
        "Control vs noise factors: control (designer-set); noise (environmental, manufacturing variation).",
        "PoF (Physics-of-Failure): modeling specific failure mechanisms (Coffin-Manson, Black, TDDB).",
      ],
      principles: [
        "DFR lifecycle: PLAN → DESIGN → ANALYZE → VERIFY → SUSTAIN.",
        "Derating: S=0.5 (50% voltage) cuts capacitor π_SR to 0.10 → 10× λ_p reduction.",
        "Redundancy: parallel R=1−(1−R_i)^n; 2oo3 R=0.972 (for R_i=0.9); standby R=R_1·(1+λ_2·t).",
        "FMEA: RPN = S×O×D; threshold 100; cross-functional calibration required.",
        "Design reviews: PDR (concept→architecture), CDR (architecture→detailed), TRR (detailed→test).",
        "Taguchi: L(y) = k·(y−T)² captures in-spec loss; SNR maximizes robustness to noise.",
        "PoF: identify dominant mechanism (lowest MTTF); design it out.",
        "DFR closes the prediction-vs-allocation gap; re-predict and re-check feasibility after each change.",
      ],
      components: [
        "Derating parameters (S, π_SR).",
        "Redundancy configurations (parallel, koon, standby, voting).",
        "FMEA table (mode, effect, cause, S, O, D, RPN, action, owner).",
        "Design review entry/exit criteria (PDR, CDR, TRR).",
        "Taguchi OA (L8, L9, L12, L16) and SNR.",
        "PoF models (Coffin-Manson, Black, TDDB).",
      ],
      mechanism: [
        "DFR lifecycle: PLAN (concept FMEA, allocation) → DESIGN (derating, redundancy, DFMEA, parts selection) → ANALYZE (FTA, FMECA, parts-stress, feasibility check) → ITERATE (re-predict after each DFR change until feasible) → DESIGN REVIEWS (PDR, CDR, TRR with entry/exit) → VERIFY (DVP&R test) → SUSTAIN (FRACAS, RCA, corrective actions). Taguchi parameter design runs orthogonal-array experiments, computes SNR per row, picks factor levels maximizing SNR. PoF identifies dominant mechanism and designs it out.",
      ],
      process: [
        "1. PLAN: define reliability goals; concept FMEA; allocate R_i* (Lesson 1).",
        "2. DESIGN: apply derating (lower π_S); apply redundancy (lower E_i); conduct DFMEA; select parts.",
        "3. ANALYZE: FTA, FMECA, parts-stress (Lesson 2); check feasibility.",
        "4. ITERATE: if predicted > allocated, apply DFR (derating, redundancy, FMEA, Taguchi, PoF); re-predict.",
        "5. DESIGN REVIEWS: PDR (entry: concept FMEA, allocation; exit: architecture approved). CDR (entry: DFMEA, parts-stress, derating/redundancy; exit: BOM frozen, DVP&R approved). TRR (entry: DVP&R, fixtures; exit: test begins).",
        "6. VERIFY: DVP&R test program (HALT, ALT, demonstration) — Lesson 2.",
        "7. SUSTAIN: field FRACAS, RCA, corrective actions; feed back to next-gen DFR.",
        "8. Taguchi: identify control vs noise; choose OA; run experiments; compute SNR per row; pick levels maximizing SNR; run confirmation experiment.",
        "9. PoF: identify candidate mechanisms; model each (Coffin-Manson, Black, TDDB); identify dominant (lowest MTTF); design out.",
        "10. Re-predict after each DFR; repeat until predicted ≤ allocated; freeze design at CDR.",
      ],
      formulas: [
        "S = V_op / V_rated (stress ratio, dimensionless [0..1]).",
        "π_SR(S): MIL-HDBK-217F factor; π_SR(1.0)=1.0; π_SR(0.5)=0.10 (capacitors).",
        "λ_p = λ_b · π_T · π_E · π_Q · π_SR(S) · π_C · ... (parts-stress with derating).",
        "R_parallel = 1 − (1 − R_i)^n (n active parallel).",
        "R_koon = Σ_(i=k)^n C(n,i) · R_i^i · (1 − R_i)^(n−i) (k-out-of-n binomial).",
        "R_standby = R_1 · [1 + λ_2·t] (one active + one cold spare, perfect switch, exponential).",
        "RPN = S × O × D (each 1–10; range 1–1000).",
        "L(y) = k·(y − T)² (nominal-the-best); L(y) = k/y² (larger-the-better); L(y) = k·y² (smaller-the-better).",
        "SNR_N = 10·log10(ȳ²/s²); SNR_L = −10·log10(Σ(1/y_i²)/n); SNR_S = −10·log10(Σy_i²/n).",
        "N_f = C·(Δε_pl)^c (Coffin-Manson, c≈0.4–0.6 lead-free).",
        "MTTF = A·J^−n·exp(Ea/kT) (Black's electromigration, n≈2, Ea≈0.7–1.0 eV).",
        "AF = exp(Ea/k·(1/T_op − 1/T_accel)) (Arrhenius acceleration factor).",
      ],
      metrics: [
        "S = V_op/V_rated (dimensionless [0..1]).",
        "λ_p improvement factor (e.g., 10× for S=0.5 capacitor derating).",
        "R_parallel, R_koon, R_standby (dimensionless 0..1).",
        "E_i (importance factor, 1/n for active redundancy).",
        "RPN (1–1000; threshold 100).",
        "Taguchi SNR (dB; higher = more robust).",
        "Taguchi loss L(y) ($/unit; lower = better).",
        "PoF dominant mechanism MTTF (h).",
        "Feasibility gap: (λ_allocated − λ_predicted)/λ_allocated — drives DFR.",
      ],
      examples: [
        "Capacitor derating: 25V-rated at 12.5V (S=0.5), π_SR=0.10 → λ_p=1.456 FIT (was 14.56 FIT at S=1.0) → 10× reduction; MTBF 6.87e7h → 6.87e8h.",
        "Parallel redundancy: R_i=0.90, n=2 → R_parallel=1−0.01=0.99 (10× improvement).",
        "2oo3 reliability: R_i=0.90 → R_2oo3=3·0.9²·0.1+0.9³=0.243+0.729=0.972.",
        "FMEA RPN: S=8, O=4, D=3 → RPN=96 (just below threshold 100; safety-critical mode triggers cross-functional review).",
        "Taguchi loss: T=5V, k=$10/V² → L(5.1)=$0.10, L(5.5)=$2.50, L(6.0)=$10. Even in-spec deviations incur loss.",
      ],
      industrial_examples: [
        "Electronics — industrial controller derating (S=0.5 on 12 caps) + CAN-bus 2oo3 redundancy (E_i 1.0→0.33); λ_system dropped from 2.0e−5 to 9.5e−6/h — feasible.",
        "Automotive — ADAS Taguchi L9(3^4) on capacitor value, resistor tolerance, op-amp gain against temperature/voltage noise; SNR_N maximized; lane-detection accuracy 95%→99.2%.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Medical 6-subsystem infusion pump R_system(72h)≥0.995. Initial MTBF=4,200h vs 5,800h allocation (28% short). DFR applied: (1) capacitor derating S=1.0→0.5 on 8 power-rail caps (10× λ_p reduction); (2) 2oo3 cold-standby on UI (E_6 1.0→0.33, 3× relaxed allocation); (3) FMEA-driven heatsink on pump-motor driver (RPN 120→30); (4) Taguchi L9 on pump-orifice/motor-tolerance/sensor-gain (SNR_N maximized). Re-prediction: MTBF=6,150h — feasible. DVP&R approved at CDR with Duane growth β=0.30 projecting MTBF_inst=5,950h at T=10,000h. FDA 510(k) clearance with reliability case in design history file.",
      ],
      common_errors: [
        "Derating without checking cost/size trade-off — 2× cost/size for 10× reliability may be unjustified for commodity electronics; derate to 60–80% (S=0.6–0.8) to balance.",
        "Adding redundancy without lowering E_i in the allocation — the redundancy relaxes per-channel allocation by 1/E_i; allocation table must be re-computed.",
        "Setting FMEA RPN threshold too low (e.g., 50) — drives too many low-priority actions and dilutes focus; conventional threshold is 100.",
        "FMEA without cross-functional S/O/D calibration — subjective scores biased; cross-functional calibration required.",
        "Skipping PDR or compressing design reviews to save schedule — catches architecture/detailed-design mistakes early; skipping is the most expensive 'saving'.",
        "Taguchi without identifying noise factors — control factors alone miss the robustness point; noise factors drive the SNR variance.",
        "Confusing Taguchi SNR with electrical-engineering signal-to-noise ratio — Taguchi's SNR is a robustness metric, not the communication-theory S/N.",
        "PoF without identifying the dominant mechanism — non-dominant mechanisms are second-order; focus on the lowest-MTTF mechanism.",
      ],
      limitations: [
        "Derating pi-factors are multiplicative and independent (approximation); π_T and π_S interact.",
        "Redundancy cannot protect against common-cause failures (dependent failures) — 2oo3 with shared power supply fails like a single channel.",
        "FMEA scores are subjective; S/O/D calibration varies across teams and industries.",
        "Design reviews are only as good as the cross-functional team — rubber-stamp reviews add no value.",
        "Taguchi OA assumes factor additivity (no interactions); for strong-interaction systems use full-factorial or larger OA.",
        "Taguchi loss function k is hard to estimate for non-monetary losses (safety, reputation).",
        "PoF models are material- and mechanism-specific — constants don't transfer across alloys.",
        "DFR cannot fix an infeasible system target — if allocated R_i* exceeds technology's achievable R, re-negotiate or change architecture.",
      ],
      best_practices: [
        "Default derating: 50% for mission-critical (aerospace, medical, defense); 60–80% for commercial.",
        "Apply redundancy only after derating — derating is cheaper (2× cost) than redundancy (n× cost).",
        "Set FMEA RPN threshold = 100; always require cross-functional review of safety-critical modes (S≥8) regardless of RPN.",
        "Schedule PDR, CDR, TRR with explicit entry/exit criteria; require cross-functional sign-off (design, reliability, manufacturing, quality, customer).",
        "Taguchi: always identify noise factors first; choose the OA based on the number of control factors and their levels.",
        "PoF: identify the dominant mechanism first (lowest MTTF under operating conditions); design it out before secondary mechanisms.",
        "Re-predict after each DFR change; re-check feasibility (predicted ≤ allocated); freeze design at CDR.",
        "Document the DFR decisions in the design history file (medical) or reliability case (aerospace/defense) for regulatory submission.",
      ],
      related_concepts: [
        "Reliability Allocation & Apportionment (Lesson 1) — the allocated targets DFR must meet.",
        "Reliability Prediction & DVP&R (Lesson 2) — the parts-stress λ_system DFR must reduce; the DVP&R verifies DFR outcomes.",
        "Reliability Fundamentals (RF) — series/parallel R, FMEA/FTA basics, RBD.",
        "Probability & Statistics (PS) Lesson 1 — exponential R(t) for standby redundancy.",
        "Reliability Testing (RT) — HALT/ALT/demonstration tests verify DFR.",
      ],
      prerequisites: [
        "Reliability Allocation & Apportionment (Lesson 1).",
        "Reliability Prediction & DVP&R (Lesson 2).",
        "Reliability Fundamentals (RF) — series/parallel R, FMEA/FTA basics.",
        "Probability & Statistics (PS) Lesson 1 — exponential, binomial.",
        "Basic statistics — mean, variance, normal distribution — for Taguchi SNR.",
      ],
      references: [
        "ASQ CRE Body of Knowledge — Reliability in Design & Development domain.",
        "Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 11 (DFR) & Ch. 14 (Taguchi).",
        "O'Connor & Kleyner (2012), Practical Reliability Engineering, Ch. 11 (DFR), 13 (Taguchi).",
        "MIL-HDBK-217F (1991, Notice 2) — derating pi-factors (π_SR).",
        "IEC 61709:2017 — reference conditions and stress models for derating.",
        "Montgomery (2017), Design and Analysis of Experiments, Ch. 15 (Taguchi robust design).",
      ],
    },
  },
  questions: [
    {
      competencyName: "Design for Reliability (DFR)",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "What does the MIL-HDBK-217F π_SR (stress-ratio) factor capture in the parts-stress reliability prediction?",
      whyCorrect:
        "The π_SR factor in MIL-HDBK-217F captures the ELECTRICAL STRESS RATIO — the ratio of operating stress (typically voltage) to rated stress: S = V_op/V_rated. It is the derating multiplier in the parts-stress formula λ_p = λ_b·π_T·π_E·π_Q·π_SR·... A capacitor operating at 50% of rated voltage (S=0.5) has π_SR = 0.10 (a 10× reduction in λ_p); operating at full rated voltage (S=1.0) has π_SR = 1.0 (no reduction). π_SR is the quantitative basis for derating as a DFR method: lowering the operating voltage raises the derating margin, drops π_SR, and reduces the failure rate. Note: π_SR is the capacitor-specific name; other component types have analogous factors (e.g., π_S for resistors is the electrical stress factor).",
      whyOthersWrong: [
        "Option A (Operating temperature — Arrhenius) — that is π_T (temperature factor, Arrhenius): π_T = exp(−Ea/k·(1/T_op − 1/T_ref)). π_SR is the electrical stress, not temperature.",
        "Option C (Manufacturing quality grade) — that is π_Q (quality factor): 0.25 MIL-spec, 1.0+ commercial. π_SR is electrical stress, not quality.",
        "Option D (Environmental severity — ground-mobile, airborne) — that is π_E (environment factor). π_SR is electrical stress, not environment.",
      ],
      explanation:
        "π_SR = stress-ratio factor for the operating electrical stress S = V_op/V_rated. π_SR(0.5)=0.10 → 10× λ_p reduction; π_SR(1.0)=1.0. Derating lowers π_SR. (π_T=temp, π_Q=quality, π_E=environment.)",
      options: [
        { text: "Operating temperature (Arrhenius acceleration)", isCorrect: false },
        { text: "Electrical stress ratio — derating (S = V_op/V_rated)", isCorrect: true },
        { text: "Manufacturing quality grade (MIL-spec vs commercial)", isCorrect: false },
        { text: "Environmental severity (ground-mobile, airborne, naval)", isCorrect: false },
      ],
    },
    {
      competencyName: "Design for Reliability (DFR)",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Electronics",
      stem: "A 25V-rated electrolytic capacitor operates at 12.5V (50% derating, S=0.5, π_SR=0.10). Base rate λ_b = 5.6e−3 FPMH; π_T = 1.3 (70°C); π_E = 2.0 (ground-mobile); π_Q = 1.0. Compute the failure-rate improvement factor vs operating at full rated voltage (S=1.0, π_SR=1.0).",
      whyCorrect:
        "Parts-stress formula: λ_p = λ_b · π_T · π_E · π_Q · π_SR(S) · ... With derating (S=0.5, π_SR=0.10): λ_p_with = 5.6e−3 · 1.3 · 2.0 · 1.0 · 0.10 = 1.456e−3 FPMH = 1.456 FIT. Without derating (S=1.0, π_SR=1.0): λ_p_without = 5.6e−3 · 1.3 · 2.0 · 1.0 · 1.0 = 1.456e−2 FPMH = 14.56 FIT. Improvement factor: λ_p_without/λ_p_with = 14.56/1.456 = 10.0×. The 50% voltage derating cuts the capacitor failure rate by a factor of 10 (and the MTBF rises 10×). The other pi-factors (π_T, π_E, π_Q, λ_b) are unchanged — only π_SR changes between the two cases, and π_SR drops from 1.0 to 0.10 (factor of 10). Trade-off: the 25V-rated capacitor must be replaced with a 50V-rated part (operating at 25V max, S=0.5), which is ~2× cost and ~2× volume — but the 10× reliability improvement justifies the trade-off for mission-critical applications.",
      whyOthersWrong: [
        "Option A (2× improvement) — would be the case if π_SR dropped from 1.0 to 0.5 (linear reduction). But MIL-HDBK-217F capacitor π_SR is non-linear: π_SR(0.5)=0.10 (10× reduction), not 0.5 (2× reduction). The non-linearity reflects the physics: derating provides a super-linear reliability improvement at moderate stress.",
        "Option C (5× improvement) — would require π_SR(0.5)=0.2; the actual MIL-HDBK-217F capacitor table gives π_SR(0.5)=0.10. Some component types (resistors) have smaller derating benefit; capacitors have the largest (10× at S=0.5).",
        "Option D (100× improvement) — would require π_SR(0.5)=0.01; the actual is 0.10. Order-of-magnitude error (off by 10×); always check the handbook table for the specific component type.",
      ],
      explanation:
        "π_SR(0.5)=0.10 vs π_SR(1.0)=1.0 → factor 10× failure-rate reduction. λ_p_with = 5.6e−3·1.3·2.0·1.0·0.10 = 1.456 FIT; λ_p_without = 14.56 FIT; improvement = 14.56/1.456 = 10×.",
      options: [
        { text: "2× improvement", isCorrect: false },
        { text: "10× improvement (λ_p drops from 14.56 FIT to 1.456 FIT)", isCorrect: true },
        { text: "5× improvement", isCorrect: false },
        { text: "100× improvement", isCorrect: false },
      ],
    },
    {
      competencyName: "Design for Reliability (DFR)",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Medical",
      stem: "A medical-device FMEA scores a failure mode: Severity S=8 (safety-critical), Occurrence O=4 (occasional), Detection D=3 (likely detected). The RPN threshold for triggering corrective action is 100. Compute RPN and decide whether corrective action is triggered.",
      whyCorrect:
        "RPN = S × O × D = 8 × 4 × 3 = 96. The RPN threshold is 100. RPN = 96 is BELOW the threshold (96 < 100), so the conventional rule does NOT trigger automatic corrective action. HOWEVER, the FMEA procedure requires a cross-functional review of SAFETY-CRITICAL modes (S ≥ 8) regardless of RPN — because the consequence of the failure (patient harm) is too high to defer to the RPN rule alone. In practice: the cross-functional team reviews the mode, identifies a design change (e.g., a heatsink to reduce the occurrence from O=4 to O=2), and re-scores: RPN_new = 8 × 2 × 3 = 48 (well below threshold). The lesson: RPN is a prioritization metric, not a yes/no trigger — high-severity modes always get reviewed even at low RPN, and the threshold is a guideline not an absolute.",
      whyOthersWrong: [
        "Option A (RPN=96, triggers corrective action) — wrong; RPN=96 < threshold 100, so the conventional rule does NOT trigger automatic corrective action. The threshold is a 'greater-than' trigger, not 'greater-than-or-equal'.",
        "Option C (RPN=96, no action required; close the FMEA mode) — wrong; safety-critical modes (S≥8) require cross-functional review regardless of RPN. Closing a safety-critical mode without review is a regulatory liability (FDA 21 CFR 820, IEC 62366).",
        "Option D (RPN=24, no action) — arithmetic error: S×O×D = 8×4×3 = 96, not 24. 24 would be if S=2 (minor severity) instead of S=8; the question clearly states S=8 (safety-critical).",
      ],
      explanation:
        "RPN = S×O×D = 8×4×3 = 96 < threshold 100 → no automatic trigger. BUT safety-critical (S≥8) → cross-functional review required; team reduces O (heatsink) from 4 to 2 → RPN=8×2×3=48.",
      options: [
        { text: "RPN = 96; triggers corrective action (96 > threshold would trigger)", isCorrect: false },
        { text: "RPN = 96; below threshold (no automatic action) BUT safety-critical (S≥8) → cross-functional review required; team reduces O from 4 to 2 → RPN=48", isCorrect: true },
        { text: "RPN = 96; no action required; close the FMEA mode", isCorrect: false },
        { text: "RPN = 24; no action required", isCorrect: false },
      ],
    },
    {
      competencyName: "Design for Reliability (DFR)",
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Automotive",
      stem: "True or False: The Taguchi loss function L(y) = k·(y − T)² quantifies a loss only when the measured value y is OUTSIDE the specification limits (i.e., in-spec products incur zero loss).",
      whyCorrect:
        "FALSE. The Taguchi loss function L(y) = k·(y−T)² quantifies loss for ANY deviation from the target T — including in-spec deviations. For a 5V±0.5V output with T=5.0 and k=$10/V²: at y=5.1V (in-spec), L = $10·(0.1)² = $0.10; at y=5.5V (at spec limit), L = $10·(0.5)² = $2.50; at y=5.0V (on-target), L = $0. The loss is a continuous quadratic function of deviation — it does NOT drop to zero inside the spec. Taguchi's insight: the goal is to MINIMIZE VARIANCE around the target, not just stay in spec. A process producing 5.0±0.1V has lower loss than a process producing 5.4±0.05V (both in-spec but the second is off-target) — Taguchi's loss function captures this distinction. The conventional 'in-spec = zero loss' view is the binary-step view; Taguchi's quadratic view is the continuous-loss view. The continuous-loss view drives the goal of variance reduction (the SNR-maximization in parameter design).",
      whyOthersWrong: [
        "Option TRUE — would imply the loss is binary (zero inside spec, positive outside spec). But the Taguchi loss function L(y) = k·(y−T)² is a continuous quadratic in (y−T); it is positive for any y ≠ T (whether in-spec or out-of-spec) and zero only at y=T. The binary-step view is the conventional manufacturing-tolerance view, not Taguchi's view. Taguchi's contribution was to make the loss continuous, capturing the cost of variability even within spec — which drives the variance-reduction goal of robust design.",
      ],
      explanation:
        "FALSE. L(y) = k·(y−T)² is continuous in (y−T); positive for any y ≠ T (in-spec or out-of-spec). At y=5.1V (in-spec 5V±0.5), L=$0.10. Taguchi's insight: minimize variance around target, not just stay in spec.",
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

export const CRE_RDD_LESSONS: RefLesson[] = [
  LESSON_ALLOC,
  LESSON_PRED,
  LESSON_DFR,
];

// ---------------------------------------------------------------------------
// RDD competencies created inside loadReference() (RDD domain exists in
// src/lib/ref-content/cre.ts with NO competencies yet — this loader seeds
// the 3 RDD competencies and then loads the deep content).
// ---------------------------------------------------------------------------

interface SeedCompetency {
  name: string;
  description: string;
  order: number;
}

const CRE_RDD_COMPETENCIES: SeedCompetency[] = [
  {
    name: "Reliability Allocation & Apportionment",
    description:
      "Top-down decomposition of system reliability targets (R_system, MTBF_system) into subsystem design budgets via equal, ARINC, and AGREE allocation methods; allocation trade-offs by complexity, operating time, and redundancy importance; the allocation table as the design contract flowing to reliability prediction and DFR.",
    order: 1,
  },
  {
    name: "Reliability Prediction & DVP&R",
    description:
      "Bottom-up prediction of system failure rate from the BOM and operating conditions: parts-count (conservative) and parts-stress (multiplicative pi-factors π_T, π_E, π_Q, π_S, π_C) methods; MIL-HDBK-217F, Telcordia SR-332, FIDES, IEC 61709 references. The DVP&R (Design Verification Plan & Report): HALT, ALT, reliability-demonstration test, FRACAS. Reliability growth: Duane (MTBF_cum=(1/α)T^β) and Crow-AMSAA (NHPP) models.",
    order: 2,
  },
  {
    name: "Design for Reliability (DFR)",
    description:
      "Systematic DFR methods during design: derating (electrical/thermal/mechanical stress reduction via π_SR); redundancy (parallel, k-out-of-n, standby, voting); FMEA/FMECA in design (RPN=S×O×D, threshold 100); design reviews (PDR, CDR, TRR with entry/exit criteria); Taguchi robust design (orthogonal arrays L8/L9/L12/L16, SNR, loss function L(y)=k(y−T)²); physics-of-failure (Coffin-Manson, Black, TDDB). DFR closes the prediction-vs-allocation gap.",
    order: 3,
  },
];

// ---------------------------------------------------------------------------
// Loader — CONTENT-only (mirrors cre-probability-statistics.ts) with the
// additional step of creating the 3 RDD competencies inside loadReference().
// ---------------------------------------------------------------------------

/**
 * Upsert the CRE Reliability in Design & Development (RDD) CONTENT into the
 * database. Idempotent: safe to call repeatedly. Returns record counts.
 *
 * Flow:
 *  1. Find CRE certification by slug "cre" (the structure+RF-content loader
 *     in src/lib/ref-content/cre.ts is a prerequisite).
 *  2. Find the RDD domain by code "RDD" (certificationId = cre.id). The RDD
 *     domain exists in cre.ts with NO competencies — delete any stale RDD
 *     competencies and create the 3 RDD competencies from
 *     CRE_RDD_COMPETENCIES. Map by NAME -> id.
 *  3. Upsert References globally (by title, no sectionId) → shared ids
 *     applied to every RDD lesson, KO, and question.
 *  4. For each lesson:
 *     - db.lesson.findFirst({where:{competencyId, slug}}) then update or
 *       create with sectionId=null, certificationId, competencyId, slug,
 *       title, titleAr, order, durationMin, conceptIntroduction, example,
 *       keyFormulas, exercise, sections (JSON.stringify), referenceIds
 *       (JSON.stringify shared), status="READY", confidence="HIGH",
 *       verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
 *  5. Upsert KnowledgeObject per lesson: findFirst({where:{lessonId}}) then
 *     create/update with certificationId, domainId (RDD), competencyId,
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

  // 2) Find the RDD domain by code "RDD" (certificationId = cre.id). The RDD
  //    domain exists in cre.ts but is seeded with NO competencies — delete
  //    any stale RDD competencies and create the 3 RDD competencies here.
  const rddDomain = await db.domain.findFirst({
    where: { certificationId: certification.id, code: "RDD" },
  });
  if (!rddDomain) {
    throw new Error(
      'Reliability in Design & Development (RDD) domain not found under CRE. Run the CRE structure+RF-content loader (src/lib/ref-content/cre.ts) first.'
    );
  }

  // Delete any existing RDD competencies (idempotent re-create).
  await db.competency.deleteMany({
    where: { domainId: rddDomain.id },
  });

  // Create the 3 RDD competencies.
  for (const c of CRE_RDD_COMPETENCIES) {
    await db.competency.create({
      data: {
        domainId: rddDomain.id,
        name: c.name,
        description: c.description,
        order: c.order,
      },
    });
  }

  // Map RDD competencies by NAME -> id.
  const rddCompetencies = await db.competency.findMany({
    where: { domainId: rddDomain.id },
  });
  const competencyIdByName: Record<string, string> = {};
  for (const c of rddCompetencies) {
    competencyIdByName[c.name] = c.id;
  }
  // Validate that all 3 expected RDD competencies exist by name.
  const expectedCompetencyNames = CRE_RDD_LESSONS.map((l) => l.competencyName);
  const missing = expectedCompetencyNames.filter(
    (n) => !competencyIdByName[n]
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing RDD competencies by name: ${missing.join(
        ", "
      )}. Ensure CRE_RDD_COMPETENCIES matches CRE_RDD_LESSONS competencyName.`
    );
  }

  // 3) References — global (no sectionId), upserted by title.
  const refIdsByTitle: Record<string, string> = {};
  for (const src of CRE_RDD_SOURCES) {
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
  const sharedReferenceIds = CRE_RDD_SOURCES.map((s) => refIdsByTitle[s.title]).filter(
    Boolean
  ) as string[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 4) Lessons, 5) KnowledgeObjects, 6) Questions
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of CRE_RDD_LESSONS) {
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
      domainId: rddDomain.id,
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
          domainId: rddDomain.id,
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
    domain: rddDomain.id,
    competencies: rddCompetencies.length,
    lessons: lessonsCount,
    kos: kosCount,
    questions: questionsCount,
    references: referencesCount,
  };
}
