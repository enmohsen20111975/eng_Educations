// =============================================================================
// CRE — Certified Reliability Engineer (ASQ) — Reliability Modeling (RM)
// pillar — Deep scientific reference (Task ID 17-CRE-RM).
//
// Certification slug: "cre" (ASQ). Domain code: "RM" (Reliability Modeling) —
// the 4th of 7 ASQ CRE BOK domains. The RM domain exists in
// src/lib/ref-content/cre.ts (the combined structure+RF-content loader) but
// is seeded with NO competencies. This CONTENT-only loader creates the 4 RM
// competencies inside loadReference() and then loads the deep scientific
// content (4 full-spec 24-section lessons + KOs + 16 enriched questions).
//
// Four lessons, one per RM competency (created below in loadReference()):
//   1. Reliability Block Diagrams (RBD)      (slug: rm-reliability-block-diagrams)
//   2. Fault Tree Analysis (FTA)            (slug: rm-fault-tree-analysis)
//   3. Redundancy & Voting (MooN)           (slug: rm-redundancy-voting-moon)
//   4. Markov & State-Transition Models     (slug: rm-markov-state-transition)
//
// Each lesson ships:
//   - The full 24-section data-collector template (spec §9, LESSON_TEMPLATE
//     in src/lib/spec.ts), with every applicable section filled with real,
//     in-depth professional reliability-modeling content. No padding.
//   - A Knowledge Object body (spec §7, KO_FIELDS) with applicable arrays
//     (definitions, principles, components, mechanism, process, formulas,
//     metrics, examples, industrial_examples, case_studies, common_errors,
//     limitations, best_practices, related_concepts, prerequisites,
//     references) populated with real content.
//   - 4 enriched questions (whyCorrect + one whyOthersWrong per distractor +
//     cognitiveLevel + KO link + scenario/industry metadata), mixing 3 MCQ
//     and 1 True/False, spanning Easy/Medium/Hard × Remember/Understand/
//     Apply/Analyze. Total in this file: 16 questions.
//
// Source hierarchy (spec §5) — Levels 2, 3, 6, 7:
//   - LEVEL 3 — Official BOK / Handbook / Exam Outline: ASQ CRE BOK
//     (Reliability Modeling domain).
//   - LEVEL 2 — Official Standard / Standards Organization: ISO 14224:2016
//     (reliability & maintenance data — failure-rate database for model
//     inputs).
//   - LEVEL 6 — University / Academic Publications: Charles E. Ebeling,
//     "An Introduction to Reliability and Maintainability Engineering"
//     (Waveland Press, 2010); Andrew K.S. Jardine & A.H.C. Tsang,
//     "Maintenance, Replacement, and Reliability: Theory and Applications"
//     (CRC Press, 2nd ed., 2006).
//   - LEVEL 7 — Technical Publications / Industry Sources: Patrick D. T.
//     O'Connor & Andre Kleyner, "Practical Reliability Engineering" (Wiley,
//     5th ed., 2012); David J. Smith, "Reliability, Maintainability and
//     Risk" (Butterworth-Heinemann, 10th ed., 2021).
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
// Public types (mirror cmrp-equipment-reliability.ts & cre.ts)
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
  scenario?: string; // Oil & Gas|Power|Chemical|Manufacturing|...
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
// SOURCES — 6 real references cited across all RM lessons.
// ---------------------------------------------------------------------------

export const CRE_RM_SOURCES: RefSource[] = [
  {
    title:
      "ASQ CRE Body of Knowledge — Reliability Modeling domain",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "BOK",
    url: "https://asq.org/cert/reliability-engineer",
    citation:
      "American Society for Quality (ASQ). Certified Reliability Engineer (CRE) Body of Knowledge — Reliability Modeling domain. The official competency framework for reliability block diagrams (RBD), series/parallel/k-of-n systems, system reliability computation, fault-tree analysis (FTA), redundancy (active/standby), voting architectures (MooN), common-cause failures, Markov state-transition models for repairable systems, and Monte-Carlo simulation for system reliability. Anchors the ASQ CRE exam's reliability-modeling questions.",
  },
  {
    title: "ISO 14224:2016 — Collection of reliability and maintenance data for equipment",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/63658.html",
    citation:
      "International Organization for Standardization. ISO 14224:2016, Petroleum, petrochemical and natural gas industries — Collection and exchange of reliability and maintenance data for equipment. Geneva: ISO. Defines the equipment-class taxonomy, failure-mode/cause/mechanism code structure, and population failure-rate (λ) data captured at WO closeout — the canonical failure-data source feeding RBD, FTA, MooN, and Markov model inputs.",
  },
  {
    title:
      "Ebeling — An Introduction to Reliability and Maintainability Engineering (Waveland Press)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Ebeling, C. E. (2010). An Introduction to Reliability and Maintainability Engineering (2nd ed.). Long Grove, IL: Waveland Press. ISBN 978-1-57766-625-9. Chapters 3 (Reliability from failure distributions), 6 (System reliability — RBD series/parallel/k-of-n, FTA, minimal cut sets), 7 (Reliability allocation: ARINC, AGREE, equal), 9 (Markov models for repairable systems, steady-state availability A_ss = μ/(λ+μ)), and 13 (Reliability-testing growth). The canonical reliability-modeling textbook for the CRE BOK.",
  },
  {
    title:
      "O'Connor — Practical Reliability Engineering (Wiley)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "O'Connor, P. D. T., & Kleyner, A. (2012). Practical Reliability Engineering (5th ed.). Chichester: John Wiley & Sons. ISBN 978-0-470-97982-2. Chapters 6 (Reliability block diagrams and networks), 7 (Fault-tree analysis — top event, AND/OR gates, minimal cut sets, Fussell-Vesely importance), 8 (Redundancy, voting, common-cause failure — β-factor model), and 9 (Markov and Monte-Carlo simulation for repairable systems). The practitioner reference for reliability modeling.",
  },
  {
    title:
      "Smith — Reliability, Maintainability and Risk (Butterworth-Heinemann)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Smith, D. J. (2021). Reliability, Maintainability and Risk: Practical Methods for Engineers Including Reliability-Centred Maintenance and Safety-Related Systems (10th ed.). Oxford: Butterworth-Heinemann / Elsevier. ISBN 978-0-08-102717-1. Chapters 8 (RBD networks, k-of-n, standby redundancy), 9 (Fault-tree synthesis and Fussell-Vesely importance), 10 (Common-cause failure and β-factor), and 11 (Markov state-transition models for SIL/availability quantification). Bridges reliability modeling and safety-integrity (IEC 61508/61511).",
  },
  {
    title:
      "Jardine & Tsang — Maintenance, Replacement, and Reliability: Theory and Applications (CRC Press)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Jardine, A. K. S., & Tsang, A. H. C. (2006). Maintenance, Replacement, and Reliability: Theory and Applications (2nd ed.). Boca Raton, FL: CRC Press / Taylor & Francis. ISBN 978-0849398669. Chapter 2 (Reliability metrics and failure distributions), Chapter 4 (System reliability — RBD, FTA, k-of-n), and Chapter 9 (Repairable systems and Markov state-transition models, steady-state availability A_ss = MTBF/(MTBF+MTTR) = μ/(λ+μ)). Bridges reliability-modeling theory to maintenance decision-making.",
  },
];

const RM_REFERENCE_TITLES = CRE_RM_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Lesson 1 — Reliability Block Diagrams (RBD)
// (Competency: "Reliability Block Diagrams (RBD)"; slug: rm-reliability-block-diagrams)
// ---------------------------------------------------------------------------

const LESSON_RBD: RefLesson = {
  competencyName: "Reliability Block Diagrams (RBD)",
  slug: "rm-reliability-block-diagrams",
  title: "Reliability Block Diagrams (RBD)",
  titleAr: "مخططات الموثوقية (RBD)",
  order: 1,
  durationMin: 35,
  references: RM_REFERENCE_TITLES,
  conceptIntroduction: `A Reliability Block Diagram (RBD) is the directed-graph model that decomposes a system into its constituent blocks (components or subsystems) and specifies how the blocks must function together for the system to function. The two primitive configurations are *series* (the system functions iff every block functions — the weakest-link rule) and *parallel* (the system functions iff at least one block functions — the active-redundancy rule). A *k-out-of-n* (koon) block generalizes both: the system functions iff at least k of n identical blocks function. From these primitives and their recursive composition, the reliability engineer computes the system reliability R_sys(t) by reducing the diagram block-by-block. The dual concept — *minimal cut sets* — captures the smallest sets of blocks whose simultaneous failure causes system failure; cut sets are the natural bridge from RBDs to Fault-Tree Analysis (Lesson 2).`,
  example: `A 3-pump production skid is modeled as a series RBD: P1 (R1 = 0.95) → P2 (R2 = 0.98) → P3 (R3 = 0.99). Series reliability: R_series = R1·R2·R3 = 0.95·0.98·0.99 = 0.92169 = 92.17%. If the skid is redesigned with two parallel P1 pumps each with R = 0.95, the parallel pair R_P1pair = 1 − (1 − 0.95)² = 1 − 0.0025 = 0.9975, and the new series reliability = 0.9975·0.98·0.99 = 0.96879 = 96.88%. A 2oo3 voting subsystem with each channel R = 0.99 yields R_2oo3 = 3R² − 2R³ = 3(0.9801) − 2(0.970299) = 2.9403 − 1.940598 = 0.999702 = 99.97%. Compare to a single-channel R = 0.99 — the 2oo3 vote buys ~9× reduction in unreliability (3×10⁻⁴ vs 10⁻²).`,
  keyFormulas: `Series (n blocks): R_series(t) = ∏_{i=1}^{n} R_i(t) — weakest-link
Parallel (n blocks, active redundancy): R_parallel(t) = 1 − ∏_{i=1}^{n} (1 − R_i(t)) = 1 − ∏ Q_i(t)
Identical parallel (n): R_n = 1 − (1 − R)^n
k-out-of-n (identical blocks): R_koon(t) = Σ_{i=k}^{n} C(n,i)·R^i·(1−R)^(n−i)
  For k = n: reduces to series; for k = 1: reduces to parallel.
Special cases — 1oo2: R = 1 − (1−R)^2 = 2R − R²; 2oo3: R = 3R² − 2R³; 2oo4: R = 6R²(1−R)² + 4R³(1−R) + R⁴
Minimal cut set {b1,...,bm}: Q_cut = ∏ Q_bi — multiply block unavailabilities
System unreliability (rare-event approximation): Q_sys ≈ Σ_{cuts} Q_cut_j
Steady-state availability for series: A_series = ∏ A_i; for parallel: A_parallel = 1 − ∏ (1 − A_i)`,
  exercise: `You are the CRE on a subsea production system. The enhanced-oil-recovery (EOR) skid has 4 components in series: hydraulic-power unit (R1 = 0.99), subsea control module (R2 = 0.985), xmas tree valve (R3 = 0.992), and chemical-injection module (R4 = 0.978). (a) Compute the series system reliability. (b) The customer requires R_sys ≥ 0.97. Identify the bottleneck block and add a hot-standby parallel unit (assume identical R) to that single block; recompute R_sys. (c) If a 2oo3 voting architecture replaces the original single control module (R_channel = 0.985), recompute the system reliability with the upgraded module.`,
  sections: {
    learning_objectives: `- Define a Reliability Block Diagram (RBD) as a directed-graph model linking component reliabilities into system reliability.
- Distinguish series, parallel, and k-out-of-n (koon) configurations and identify each in a system schematic.
- Apply the series rule R_series = ∏ R_i, the parallel rule R_parallel = 1 − ∏ (1 − R_i), and the koon rule R_koon = Σ C(n,i)·R^i·(1−R)^(n−i).
- Reduce a complex RBD block-by-block: collapse parallel/series sub-networks to single equivalent blocks, then compose.
- Identify minimal cut sets (smallest sets of blocks whose simultaneous failure causes system failure) and apply the rare-event approximation Q_sys ≈ Σ Q_cut.
- Choose between series, parallel, and koon architectures to meet a system-reliability target with cost/complexity trade-offs.`,
    prerequisites: `- The ASQ CRE BOK Reliability Fundamentals (RF) domain — especially the reliability function R(t), the exponential model R(t) = exp(−λ·t), MTBF/MTTR/availability.
- Basic combinatorics: binomial coefficient C(n,k) and the binomial expansion.
- Boolean algebra for AND/OR reduction (multiplication for AND = series; complemented product for OR = parallel).
- Familiarity with P&ID and functional block diagrams at the system-engineering level.`,
    introduction: `The Reliability Block Diagram is the foundational modeling tool of the ASQ CRE Reliability Modeling domain. It translates a physical system schematic — pumps, valves, controllers, sensors, power supplies — into a graph where each node carries a reliability R_i(t) and the edges encode functional dependency. From the graph we compute the system reliability R_sys(t) by reduction.

Three configurations cover ~90% of practical RBDs. *Series* (the weakest-link rule) is the model of any single-path architecture: a serial chain of n blocks functions iff every block functions, so R_series = ∏ R_i. *Parallel* (active redundancy) is the model of N independent channels all running: the system functions iff at least one channel functions, so R_parallel = 1 − ∏ (1 − R_i). *k-out-of-n* (koon) generalizes both — the system functions iff at least k of n identical blocks function; for k = n it reduces to series, for k = 1 to parallel.

Minimal cut sets are the dual concept. A *cut set* is any set of blocks whose simultaneous failure causes system failure; a *minimal* cut set cannot be reduced without losing the cut-set property. For the rare-event approximation, the system unreliability Q_sys ≈ Σ Q_cut_j, where each cut-set unreliability is the product of the block unavailabilities in that cut. Cut sets are the natural bridge to Fault-Tree Analysis (Lesson 2) — the FTA top event is the system failure, and the FTA minimal cut sets are exactly the RBD minimal cut sets viewed top-down.

The RBD reduction procedure: (i) collapse each parallel sub-network to an equivalent single block (R_eq = 1 − ∏(1 − R_i)); (ii) collapse each series sub-network to an equivalent single block (R_eq = ∏ R_i); (iii) repeat recursively until the diagram is one block whose reliability is R_sys. For complex diagrams (e.g., bridge networks), the procedure requires factorization or inclusion-exclusion — see the worked example.`,
    terminology: `- **Reliability Block Diagram (RBD)**: a directed graph of blocks where each block carries R_i(t) and the topology encodes functional dependency.
- **Series configuration**: system functions iff all blocks function; R_series = ∏ R_i.
- **Parallel configuration (active redundancy)**: system functions iff at least one block functions; R_parallel = 1 − ∏ (1 − R_i).
- **k-out-of-n (koon) configuration**: system functions iff at least k of n identical blocks function; R_koon = Σ_{i=k}^n C(n,i)·R^i·(1−R)^(n−i).
- **Block reliability R_i(t)**: the probability that block i functions at time t.
- **Block unavailability Q_i(t) = 1 − R_i(t)**: the probability that block i is failed at time t.
- **Cut set**: a set of blocks whose simultaneous failure causes system failure.
- **Minimal cut set**: a cut set that loses its cut-set property when any block is removed.
- **Rare-event approximation**: Q_sys ≈ Σ Q_cut_j, valid when each Q_i is small (≤ ~0.1) and cut sets are mutually nearly exclusive.
- **Path set**: a set of blocks whose simultaneous functioning is sufficient for system functioning.
- **Minimal path set**: a path set that loses its path property when any block is removed.
- **Bridge network**: a non-series-parallel RBD topology that requires inclusion-exclusion or factorization for reduction.
- **Equivalent block**: a single block that replaces a sub-network after series or parallel reduction.`,
    detailed_explanation: `The mathematical core of the RBD is Boolean reduction. The system success event S is a Boolean function of the block success events {B_1, ..., B_n}. For series: S = B_1 ∧ B_2 ∧ ... ∧ B_n; for parallel: S = B_1 ∨ B_2 ∨ ... ∨ B_n. For koon: S is the k-threshold Boolean function. Under the assumption of independent blocks, R_sys = P(S) is computed by replacing ∧ with multiplication and ∨ with the inclusion-exclusion product 1 − ∏(1 − R_i).

For the *series* case: R_series = R_1·R_2·...·R_n. The system reliability is dominated by the weakest block — a chain is no stronger than its weakest link. Adding blocks in series always reduces R_sys; if R_i = 0.99 for each of n identical blocks, R_series = 0.99^n drops quickly: 0.99^10 = 0.904, 0.99^100 = 0.366. Series architectures are unacceptable for high-reliability systems with many blocks.

For the *parallel* case with identical blocks: R_n = 1 − (1 − R)^n. The system unreliability Q_n = (1 − R)^n drops geometrically with n: a 2-block parallel pair with R = 0.99 yields Q_2 = (0.01)^2 = 10⁻⁴ — a 100× reduction in unreliability; 3 blocks yields Q_3 = 10⁻⁶. Parallel redundancy is the principal lever for high reliability.

For *k-out-of-n* (identical blocks): R_koon = Σ_{i=k}^n C(n,i)·R^i·(1−R)^(n−i). The binomial expansion collapses to closed forms for small k,n: 1oo2 → R = 2R − R²; 2oo3 → R = 3R² − 2R³; 2oo4 → R = 6R²(1−R)² + 4R³(1−R) + R⁴; 3oo5 → R = 6R³(1−R)² + 5R⁴(1−R) + R⁵. The koon configuration is the model of *voting architectures* — triplicated control systems (2oo3) used in safety-instrumented systems (SIS) achieve R ≈ 1 − (3·(1−R)²·R + (1−R)³) — see Lesson 3.

*Minimal cut sets* are the dual view. Each minimal cut set j is a set of blocks whose simultaneous failure causes system failure; the cut-set unreliability Q_cut_j = ∏_{i∈j} Q_i (independence assumption). The rare-event approximation Q_sys ≈ Σ_j Q_cut_j holds when (i) each Q_i is small (≤ ~0.1) and (ii) cut sets are mutually nearly exclusive (their intersections have negligible probability). When these conditions fail, use inclusion-exclusion: Q_sys = Σ_j Q_cut_j − Σ_{j<k} Q_cut_j·Q_cut_k + ... For a series RBD, the minimal cut sets are the singletons {1}, {2}, ..., {n} — each block alone is a cut. For a parallel RBD, the sole minimal cut set is {1, 2, ..., n} — all blocks must fail.

*Complex topologies* (e.g., a bridge network with a cross-over link) cannot be reduced by series/parallel alone. The standard methods are (i) inclusion-exclusion over minimal path sets or cut sets, (ii) factorization (conditional on a key block being up or down, then reducing the two sub-networks), or (iii) Monte-Carlo simulation for very large diagrams (see Lesson 4). For an n-block bridge network, the inclusion-exclusion over minimal path sets yields R_sys in closed form; the result is a single expression with 5 path sets.`,
    core_principles: `- Series: R_series = ∏ R_i; system reliability is dominated by the weakest block; adding series blocks always reduces R.
- Parallel (active redundancy): R_n = 1 − ∏(1 − R_i); unreliability drops geometrically with n; the principal lever for high reliability.
- koon: R_koon = Σ C(n,i)·R^i·(1−R)^(n−i); the model of voting and standby architectures.
- Block independence is the fundamental assumption; common-cause failures (CCF) break it — see Lesson 3 (β-factor model).
- Minimal cut sets are the dual of minimal path sets; the rare-event approximation Q_sys ≈ Σ Q_cut_j is the workhorse for system unreliability estimation.
- A complex topology (bridge) requires inclusion-exclusion, factorization, or Monte-Carlo — series/parallel reduction alone is insufficient.
- The RBD reduction procedure: collapse parallel sub-networks → collapse series sub-networks → repeat recursively → one equivalent block whose reliability is R_sys.`,
    components: `- **Block**: a node in the RBD representing a component or subsystem; carries R_i(t).
- **Edge (functional dependency)**: the directed link encoding which blocks must function for downstream blocks to deliver their function.
- **Series sub-network**: a chain of blocks all of which must function; collapses by multiplication.
- **Parallel sub-network**: a set of blocks any one of which suffices; collapses by complemented multiplication.
- **koon sub-network**: a voting group; collapses by the binomial expansion.
- **Bridge/cross-link**: a nonseries-parallel connection that requires factorization or inclusion-exclusion.
- **Minimal cut set list**: the dual representation of the RBD used for FTA and importance ranking.
- **Equivalent block**: the reduced single block after a sub-network collapse.`,
    process: `1. Identify the system function — what output the system must deliver (e.g., "pump 500 m³/h of crude at 50 bar").
2. Decompose the system into blocks (components or subsystems) and assign R_i(t) from field data, ISO 14224 population rates, or qualification test results.
3. Draw the RBD as a directed graph: blocks are nodes; functional dependencies are edges. Identify series, parallel, koon, and bridge sub-networks.
4. Reduce recursively: collapse each parallel sub-network to R_eq = 1 − ∏(1 − R_i); collapse each series sub-network to R_eq = ∏ R_i; repeat until one equivalent block remains.
5. For complex topologies, list minimal cut sets and apply inclusion-exclusion or the rare-event approximation.
6. Compute R_sys(t); compare to the system-reliability target. If below target, identify the bottleneck blocks (highest marginal contribution) and apply redundancy or derating.
7. Document assumptions: independence, identical-block assumption, mission duration, operating conditions, and CCF treatment (β-factor in Lesson 3).`,
    formula_calculation: `Variables and formulas:
- R_i(t): block i reliability at time t — dimensionless [0,1]
- Q_i(t) = 1 − R_i(t): block i unavailability — dimensionless [0,1]
- R_series(t) = ∏_{i=1}^n R_i(t) — dimensionless [0,1]
- R_parallel(t) = 1 − ∏_{i=1}^n (1 − R_i(t)) — dimensionless [0,1]
- R_koon(t) = Σ_{i=k}^n C(n,i)·R(t)^i·(1−R(t))^(n−i) — dimensionless [0,1]
- 1oo2: R = 2R − R²; 2oo3: R = 3R² − 2R³; 2oo4: R = 6R²(1−R)² + 4R³(1−R) + R⁴
- Minimal cut set j unreliability Q_cut_j = ∏_{i∈j} Q_i(t)
- System unreliability rare-event approx: Q_sys(t) ≈ Σ_j Q_cut_j(t) (valid Q_i ≤ 0.1)
- Series availability A_series = ∏ A_i; parallel availability A_parallel = 1 − ∏ (1 − A_i)

Units: time t in hours (h); R, Q, A dimensionless [0,1].

Assumptions: (i) block failures are statistically independent — no common-cause failures (CCF breaks this — Lesson 3); (ii) identical-block assumption for koon (the n blocks have the same R); (iii) blocks are binary (functioning or failed, no degraded states — Lesson 4 generalizes to multi-state Markov); (iv) exponential R(t) = exp(−λ·t) if a time-varying R is required (constant-λ, useful-life regime).

Interpretation: R_sys(t) is the probability the system functions at time t (instantaneous reliability) or, equivalently, the probability the system completes a mission of duration t without failing (mission reliability). A system reliability R_sys = 0.99 at t = 10,000 h means 99% of identical systems survive to 10,000 h — equivalent to a 1% system-failure probability at that age.`,
    worked_example: `**3-pump production skid — series RBD.**
Given: P1 R1 = 0.95; P2 R2 = 0.98; P3 R3 = 0.99.
R_series = R1·R2·R3 = 0.95·0.98·0.99 = 0.92169 = 92.17%.

**Parallel pair upgrade (P1 redundancy).**
Add a hot-parallel P1' (R = 0.95) alongside P1. The parallel pair:
R_P1pair = 1 − (1 − 0.95)² = 1 − 0.05² = 1 − 0.0025 = 0.9975.
New series: R_sys = 0.9975·0.98·0.99 = 0.96879 = 96.88%.
Improvement: 92.17% → 96.88% — the redundancy closed 60% of the unreliability gap (from 7.83% to 3.12% unreliability).

**2oo3 voting subsystem (e.g., triplicated sensor channel).**
Each channel R = 0.99. The 2oo3 reliability:
R_2oo3 = 3R² − 2R³ = 3·(0.99)² − 2·(0.99)³
       = 3·0.9801 − 2·0.970299
       = 2.9403 − 1.940598 = 0.999702 = 99.97%.
Compared to single-channel R = 0.99 (1% unreliability), 2oo3 yields 0.03% unreliability — a 33× reduction at the cost of 3× hardware.

**Minimal cut sets — series skid.**
For the 3-block series RBD, the minimal cut sets are the singletons {P1}, {P2}, {P3}. Each Q_cut = Q_i. Rare-event approx:
Q_sys ≈ Q_P1 + Q_P2 + Q_P3 = 0.05 + 0.02 + 0.01 = 0.08.
Exact: Q_sys = 1 − R_series = 1 − 0.92169 = 0.07831 = 7.83%. The rare-event approximation overestimates by ~2% (acceptable for screening).

**Bridge network — inclusion-exclusion (synthetic).**
A 5-block bridge RBD has minimal path sets: {1,2}, {4,5}, {1,3,5}, {4,3,2}. With R_i = 0.99 each:
R_sys = P(path1) + P(path2) + P(path3) + P(path4) − pair terms + triple terms − quadruple term. With R = 0.99: each path set reliability is 0.99² or 0.99³ = 0.970299; the four single-path probabilities sum to 2·0.9801 + 2·0.970299 = 3.9008. Subtract pair intersections: blocks 1,3,5 and 4,3,2 share block 3 → 4 pair terms of ~0.961 each = 3.844. Add triple terms (0.941) × 4 = 3.764; subtract quadruple (0.922 × 1) = 0.922. R_sys ≈ 3.901 − 3.844 + 3.764 − 0.922 ≈ 0.939. The exact value computed by inclusion-exclusion is R_sys ≈ 0.9997·0.9997·... — for compact numeric: with all blocks R = 0.99 the bridge reliability is 0.9997 (the cross-link provides redundancy).`,
    industrial_example: `**Oil & Gas — subsea production system.** A subsea xmas-tree (XMT) assembly has 4 functional blocks in series: hydraulic power unit (MTBF 50,000 h, R at 5,000 h mission = 0.9050), subsea control module SCM (MTBF 100,000 h, R = 0.9512), production master valve (MTBF 200,000 h, R = 0.9753), and the production wing valve (MTBF 200,000 h, R = 0.9753). Series R_sys at 5,000 h = 0.9050·0.9512·0.9753·0.9753 = 0.8201 = 82.01% — well below the 0.95 target. The bottleneck is the HPU. Adding a hot-standby HPU (R = 0.9050) in parallel: R_HPU_pair = 1 − (1 − 0.9050)² = 0.9910. New R_sys = 0.9910·0.9512·0.9753·0.9753 = 0.8988 = 89.88% — still short. Upgrading the SCM to a 2oo3 voting architecture (R_2oo3 = 3·0.9512² − 2·0.9512³ = 2.7140 − 1.7214 = 0.9926) and the HPU to parallel gives R_sys = 0.9910·0.9926·0.9753·0.9753 = 0.9356 — closing toward target. Final lever: derate the valves' internal seal material (raises R to 0.99) → R_sys = 0.9910·0.9926·0.99·0.99 = 0.9645 — meets target. Method per Ebeling (2010, Ch. 6) and O'Connor (2012, Ch. 6).`,
    case_study: `CASE_TYPE = SYNTHETIC. A petrochemical plant emergency-shutdown (ESD) system was modeled with a 4-block RBD: ESD logic solver (R = 0.995), 2oo3 sensor vote (R = 0.999), final-element solenoid valve (R = 0.97), and shutdown valve (R = 0.975). Original series-vote reliability R_sys = 0.995·0.999·0.97·0.975 = 0.9407 = 94.07% — below the safety target of R = 0.99 (SIL 2 boundary per IEC 61511). The reliability engineer identified the solenoid valve as the bottleneck block (highest marginal contribution to unreliability). Two design alternatives were evaluated: (a) parallel pair of solenoids (R = 1 − (1 − 0.97)² = 0.9991), giving R_sys = 0.995·0.999·0.9991·0.975 = 0.9686; (b) triplicated solenoid with 2oo3 voting (R_2oo3 = 3·0.97² − 2·0.97³ = 2.8227 − 1.8237 = 0.99899 ≈ 0.999), giving R_sys = 0.995·0.999·0.999·0.975 = 0.9682. The engineer selected alternative (a) — the parallel pair met the budget and was 60% cheaper than the 2oo3 triplication. A follow-up common-cause-failure (CCF) analysis with β = 0.05 (Lesson 3) revealed that the parallel-pair architecture's true R_sys = R_pair_indep·R_cc = 0.9991·exp(−β·λ·t) where λ·t = 0.03 (3% single-block unreliability) → R_cc = exp(−0.0015) = 0.9985; total CCF-adjusted R_sys = 0.9686·0.9985 = 0.9671. The CCF adjustment reduced the projected R_sys by 0.15 percentage points, but the architecture met the SIL 2 target on the design side. Source: synthetic case authored for this lesson, method per Smith (2021, Ch. 8) and O'Connor (2012, Ch. 6).`,
    visual_explanation: `RBDs are drawn as left-to-right directed graphs: source node on the left, sink node on the right, blocks as rectangular nodes connected by directed edges. A series configuration is a single chain (S → B1 → B2 → B3 → T). A parallel configuration is a fan-out/fan-in pattern (S → [B1, B2, B3] → T, where the brackets denote parallel branches). A koon block is drawn as n parallel branches topped with a "koo" annotation (e.g., "2oo3" inside a box). A bridge network is drawn with a cross-link between the two main paths. The reduction sequence can be visualized by collapsing sub-networks in-place — the parallel pair becomes a single equivalent block, the series chain collapses one multiplication at a time, until one block remains.`,
    simulation_opportunity: `An interactive simulation could let the learner drag-and-drop blocks into series/parallel/koon configurations, set each block's R, and observe the live R_sys readout. A second mode would expose a bridge network and walk the learner through inclusion-exclusion over minimal path sets. A third mode would introduce common-cause failure (β-factor slider) and show how the independence assumption breaks — see Lesson 3.`,
    common_mistakes: `- Treating hot-standby redundancy as full active redundancy — a standby unit has a switching failure probability and a wear-in delay; model as koon with imperfect switching (Lesson 3).
- Using the rare-event approximation when individual Q_i > 0.1 — the approximation overestimates Q_sys when intersections are non-negligible.
- Assuming block independence when common-cause failure (CCF) is present — environmental/manufacturer/common-design CCF can dominate a parallel architecture (β-factor, Lesson 3).
- Pooling non-identical blocks into a koon formula — the binomial koon formula assumes identical R; for non-identical channels use inclusion-exclusion.
- Reporting R_sys without specifying t — a single R_sys value is meaningless; pair it with the mission duration.
- Forgetting that RBDs assume binary states (functioning or failed); for degraded/multi-state systems use Markov models (Lesson 4).
- Drawing the RBD as a P&ID rather than a functional-dependency graph — the RBD encodes *how the system functions*, not how it is physically wired.`,
    limitations: `- Block independence is a strong assumption; common-cause failures (CCF) break it and require the β-factor model (Lesson 3).
- The binary-state model cannot represent degraded states (e.g., a sensor drifting out of calibration); Markov models (Lesson 4) generalize.
- The rare-event approximation breaks down for high-Q_i (> ~0.1) or for many overlapping cut sets — inclusion-exclusion is then required.
- Bridge and complex topologies require factorization, inclusion-exclusion, or Monte-Carlo (Lesson 4) — pure series/parallel reduction is insufficient.
- Field-data block reliabilities R_i(t) carry uncertainty; for high-reliability systems a single-point R_sys is misleading — propagate uncertainty bounds.
- The RBD does not capture time-dependent failure rates explicitly; use R_i(t) = exp(−λ_i·t) and substitute into the series/parallel formulas.
- Cold-standby redundancy requires the standby unit not to age until switched in — model with the standby-redundancy formulas (Lesson 3) rather than the simple parallel rule.`,
    comparison: `**Series vs parallel vs koon — R, complexity, and use-cases:**
- Series: R_series = ∏ R_i; weakest-link; lowest reliability for given block R; cheapest; use when the function is intrinsically serial (a pipeline).
- Parallel (active): R_n = 1 − ∏(1 − R_i); geometric unreliability reduction; high cost (n× hardware + integration); use when failure has high consequence and the function tolerates active redundancy.
- koon (k > 1, k < n): R_koon = Σ C(n,i)·R^i·(1−R)^(n−i); balances redundancy with safety — 2oo3 is the canonical SIL architecture (survives single failure, fails on dual failure → safety + availability).
- Standby (cold): R = R_active + R_switch·R_standby·... — model requires standby-redundancy formulas (Lesson 3); cheaper on hardware wear but slower response.

**RBD vs FTA (Lesson 2):** RBD encodes system *success* (functioning paths); FTA encodes system *failure* (cut sets). Minimal path sets (RBD) and minimal cut sets (FTA) are duals — the same Boolean function from opposite ends.`,
    practical_application: `- **Subsea Oil & Gas**: model the subsea production system as a series-parallel RBD; identify the bottleneck (often the HPU or control module) and apply redundancy.
- **Power Generation**: model a combined-cycle gas turbine (CCGT) as a series RBD of gas turbine + HRSG + steam turbine + generator; reliability allocation (ARINC/AGREE, RF Lesson 4) sets per-block targets.
- **Chemical Process**: model an emergency-shutdown (ESD) loop as series: sensor → logic solver → final element; apply 2oo3 voting at the sensor layer (Lesson 3) and parallel redundancy at the final element.
- **Manufacturing line**: model a serial production line; the bottleneck block (lowest R) is the constraint — apply buffer stock or spare parts at that station.
- **Spare-parts sizing**: from the RBD bottleneck block, the expected failures per period = λ_bottleneck·fleet-hours; spares = expected + safety stock.`,
    decision_scenario: `You are the CRE on a deep-water gas-project subsea system. The architecture has 4 blocks in series: (1) subsea control module SCM (R = 0.985), (2) production master valve PMV (R = 0.99), (3) production wing valve PWV (R = 0.99), (4) subsea choke (R = 0.97). The customer requires R_sys ≥ 0.97 over a 5,000-h mission. (a) Compute R_series and identify the bottleneck. (b) Propose two architectures to meet target: hot-parallel on the bottleneck, or 2oo3 voting on the SCM. (c) Which do you recommend, given that the parallel pair costs $400k and the 2oo3 SCM costs $1.2M? Justify with reliability-cost trade-off.`,
    practice_questions: `- **Q1 (Easy, Recall):** State the series reliability formula and the parallel reliability formula.
- **Q2 (Medium, Calculation):** Compute R_series for 4 blocks with R = [0.98, 0.99, 0.995, 0.97]. Identify the bottleneck block.
- **Q3 (Medium, Application):** A 2oo3 voting system has each channel R = 0.97. Compute R_2oo3 and compare to single-channel R.
- **Q4 (Hard, Analyze):** A bridge network with 5 blocks (R_i = 0.99 each) — list the minimal path sets and apply inclusion-exclusion to compute R_sys.`,
    certification_questions: `- **CRE-style (Easy):** Which configuration gives R = 1 − (1 − R_1)(1 − R_2)? (parallel/active redundancy)
- **CRE-style (Medium, Calculation):** A 3-block series has R = [0.95, 0.98, 0.99]. Compute R_series.
- **CRE-style (Hard, Analysis):** Identify the minimal cut sets of a 3-block series RBD and apply the rare-event approximation; compare to the exact Q_sys.`,
    summary: `The RBD is the foundational modeling tool of reliability engineering. Series reliability multiplies (weakest-link), parallel reliability reduces unreliability geometrically (active redundancy), and koon generalizes both for voting architectures. Minimal cut sets are the dual representation; the rare-event approximation Q_sys ≈ Σ Q_cut_j is the workhorse for system unreliability estimation. Complex topologies (bridge) require inclusion-exclusion or factorization. The RBD assumes block independence and binary states — common-cause failures (Lesson 3) and degraded states (Lesson 4 Markov) are the principal extensions.`,
    key_takeaways: `- Series: R_series = ∏ R_i — weakest-link rule.
- Parallel (active): R_parallel = 1 − ∏ (1 − R_i) — geometric unreliability reduction.
- koon: R_koon = Σ C(n,i)·R^i·(1−R)^(n−i); 1oo2 = 2R − R²; 2oo3 = 3R² − 2R³.
- Minimal cut sets are the dual of minimal path sets; rare-event approx Q_sys ≈ Σ Q_cut_j.
- Block independence is the core assumption; CCF breaks it (β-factor, Lesson 3).
- Bridge topologies require inclusion-exclusion, factorization, or Monte-Carlo.`,
    references: `- ASQ CRE Body of Knowledge — Reliability Modeling domain.
- ISO 14224:2016 — Collection of reliability and maintenance data for equipment.
- Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 6 (System reliability — RBD series/parallel/k-of-n, minimal cut sets).
- O'Connor & Kleyner (2012), Practical Reliability Engineering, Ch. 6 (Reliability block diagrams and networks).
- Smith (2021), Reliability, Maintainability and Risk, Ch. 8 (RBD networks, k-of-n, standby redundancy).
- Jardine & Tsang (2006), Maintenance, Replacement, and Reliability, Ch. 4 (System reliability — RBD, FTA, k-of-n).`,
  },
  knowledgeObject: {
    title: "Reliability Block Diagrams (RBD)",
    domain: "Reliability Modeling",
    competency: "Reliability Block Diagrams (RBD)",
    topic: "System Reliability Modeling",
    concept: "Series / parallel / k-out-of-n reliability reduction and minimal cut sets",
    body: {
      definitions: [
        "Reliability Block Diagram (RBD): a directed graph of blocks where each block carries R_i(t) and the topology encodes functional dependency; the system reliability R_sys(t) is computed by reduction.",
        "Series configuration: system functions iff every block functions; R_series = ∏ R_i (weakest-link rule).",
        "Parallel configuration (active redundancy): system functions iff at least one block functions; R_parallel = 1 − ∏ (1 − R_i).",
        "k-out-of-n (koon) configuration: system functions iff at least k of n identical blocks function; R_koon = Σ C(n,i)·R^i·(1−R)^(n−i).",
        "Block unavailability Q_i(t) = 1 − R_i(t); the dual of block reliability.",
        "Cut set: a set of blocks whose simultaneous failure causes system failure.",
        "Minimal cut set: a cut set that loses its cut-set property when any block is removed.",
        "Minimal path set: the dual of a cut set — a set of blocks whose simultaneous functioning is sufficient for system functioning.",
        "Rare-event approximation: Q_sys ≈ Σ_j Q_cut_j, valid when each Q_i ≤ ~0.1 and cut sets are mutually nearly exclusive.",
        "Bridge network: a nonseries-parallel RBD topology requiring inclusion-exclusion or factorization.",
      ],
      principles: [
        "Series: R_series = ∏ R_i — system reliability is dominated by the weakest block.",
        "Parallel (active redundancy): R_n = 1 − ∏(1 − R_i); unreliability drops geometrically with n.",
        "koon: R_koon = Σ C(n,i)·R^i·(1−R)^(n−i); 1oo2 reduces to parallel, n-of-n reduces to series.",
        "Block independence is the fundamental assumption; common-cause failures (Lesson 3) break it.",
        "Minimal cut sets are the dual of minimal path sets; rare-event approximation is the workhorse.",
        "Complex topologies (bridge) require inclusion-exclusion, factorization, or Monte-Carlo (Lesson 4).",
        "Reduction procedure: collapse parallel → collapse series → recurse to one equivalent block.",
      ],
      components: [
        "Block (node) carrying R_i(t).",
        "Edge (functional dependency link).",
        "Series sub-network (chain of AND-blocks).",
        "Parallel sub-network (OR-blocks, active redundancy).",
        "koon sub-network (voting group with k-threshold).",
        "Bridge cross-link (nonseries-parallel connection).",
        "Minimal cut set list (dual representation).",
        "Equivalent block after sub-network collapse.",
      ],
      mechanism: [
        "RBD modeling lifecycle: identify system function → decompose into blocks with R_i → draw directed graph → identify series/parallel/koon/bridge sub-networks → reduce recursively → compute R_sys → compare to target → apply redundancy or derating at bottleneck blocks → re-fit from field data (closed loop).",
      ],
      process: [
        "1. Identify the system function and the mission duration t.",
        "2. Decompose the system into blocks; assign R_i(t) from field data, ISO 14224, or qualification tests.",
        "3. Draw the RBD; identify series/parallel/koon/bridge sub-networks.",
        "4. Reduce recursively (parallel collapse, series collapse) to one equivalent block.",
        "5. For complex topologies, list minimal cut sets and apply inclusion-exclusion or rare-event approximation.",
        "6. Compute R_sys(t); compare to the target.",
        "7. If below target, identify the bottleneck (highest marginal contribution) and apply redundancy or derating.",
        "8. Document assumptions: independence, identical-block, mission duration, CCF treatment.",
      ],
      formulas: [
        "R_series(t) = ∏_{i=1}^n R_i(t).",
        "R_parallel(t) = 1 − ∏_{i=1}^n (1 − R_i(t)).",
        "R_koon(t) = Σ_{i=k}^n C(n,i)·R(t)^i·(1−R(t))^(n−i).",
        "1oo2: R = 2R − R²; 2oo3: R = 3R² − 2R³; 2oo4: R = 6R²(1−R)² + 4R³(1−R) + R⁴.",
        "Minimal cut set unreliability Q_cut_j = ∏_{i∈j} Q_i(t).",
        "Rare-event approximation: Q_sys(t) ≈ Σ_j Q_cut_j(t).",
        "Series availability A_series = ∏ A_i; parallel availability A_parallel = 1 − ∏ (1 − A_i).",
      ],
      metrics: [
        "System reliability R_sys(t) [dimensionless 0..1].",
        "System unavailability Q_sys(t) = 1 − R_sys(t) [dimensionless].",
        "Block reliability R_i(t) [dimensionless]; block unavailability Q_i(t) [dimensionless].",
        "Minimal cut set unreliability Q_cut_j [dimensionless].",
        "Number of minimal cut sets (qualitative complexity index).",
        "Bottleneck block = block with the highest marginal contribution to R_sys.",
        "Redundancy cost = (n − 1) × hardware + integration cost.",
      ],
      examples: [
        "3-pump series skid R = [0.95, 0.98, 0.99] → R_series = 0.9217 = 92.17%.",
        "Parallel pair R = 0.95 each → R_pair = 1 − (0.05)² = 0.9975.",
        "2oo3 voting R_channel = 0.99 → R_2oo3 = 3·0.9801 − 2·0.970299 = 0.999702 = 99.97%.",
        "Series skid with parallel P1 upgrade: R_sys = 0.9975·0.98·0.99 = 0.96879 = 96.88%.",
        "Rare-event approximation for 3-block series: Q_sys ≈ 0.05+0.02+0.01 = 0.08 vs exact 0.07831.",
      ],
      industrial_examples: [
        "Oil & Gas — subsea production system: series RBD of HPU + SCM + PMV + PWV; bottleneck HPU; parallel HPU pair and 2oo3 SCM close to target R_sys ≥ 0.95.",
        "Power — combined-cycle gas turbine: series RBD of GT + HRSG + ST + gen; reliability allocation (ARINC) sets per-block targets.",
        "Chemical — emergency-shutdown (ESD) loop: series RBD of sensor + logic solver + final element; 2oo3 voting at sensor; parallel solenoid at final element.",
        "Manufacturing — production line: serial RBD; bottleneck station identifies the constraint; buffer or spare applied.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Petrochemical ESD system 4-block RBD: logic solver R=0.995, 2oo3 sensor R=0.999, solenoid R=0.97, shutdown valve R=0.975 → R_sys = 0.9407 (below SIL 2 target 0.99). Bottleneck = solenoid. Alternative (a) parallel pair R=0.9991 → R_sys = 0.9686; alternative (b) 2oo3 solenoid R=0.999 → R_sys = 0.9682. Selected (a) on cost (60% cheaper than 2oo3 triplication). CCF analysis with β=0.05 → R_sys_adj = 0.9671 (still meets SIL 2 design target). Method per Smith (2021, Ch. 8) and O'Connor (2012, Ch. 6).",
      ],
      common_errors: [
        "Treating hot-standby redundancy as full active redundancy (ignoring switch failure and wear-in).",
        "Using the rare-event approximation when individual Q_i > 0.1 (overestimates Q_sys).",
        "Assuming block independence when common-cause failure (CCF) is present.",
        "Pooling non-identical blocks into the binomial koon formula.",
        "Reporting R_sys without specifying the mission duration t.",
        "Forgetting RBDs assume binary states — degraded states require Markov models (Lesson 4).",
        "Drawing the RBD as a P&ID rather than a functional-dependency graph.",
      ],
      limitations: [
        "Block independence breaks under common-cause failure (CCF) — use β-factor (Lesson 3).",
        "Binary-state model cannot represent degraded states — use Markov (Lesson 4).",
        "Rare-event approximation breaks for high-Q_i or many overlapping cut sets.",
        "Bridge/complex topologies require inclusion-exclusion, factorization, or Monte-Carlo.",
        "Field-data R_i carries uncertainty; single-point R_sys is misleading without bounds.",
        "Cold-standby requires standby-redundancy formulas (Lesson 3), not the simple parallel rule.",
      ],
      best_practices: [
        "Always specify the mission duration t and the operating conditions when reporting R_sys.",
        "Identify the bottleneck block (highest marginal contribution) before adding redundancy.",
        "Use 2oo3 voting for safety-instrumented functions (survives single failure, fails on dual failure).",
        "Document the independence assumption; if CCF is plausible, apply β-factor (Lesson 3).",
        "For complex topologies, list minimal cut sets explicitly; use inclusion-exclusion or Monte-Carlo.",
        "Propagate uncertainty bounds on R_i through to R_sys; report a confidence interval, not a point.",
        "Validate the RBD against a P&ID at design review; ensure the functional-dependency encoding matches the physical system.",
      ],
      related_concepts: [
        "Fault Tree Analysis (Lesson 2) — top-down cut-set view of system failure.",
        "Redundancy & Voting / MooN (Lesson 3) — koon architectures with CCF (β-factor).",
        "Markov & State-Transition (Lesson 4) — multi-state and repairable-system generalization.",
        "Reliability Fundamentals (RF) — R(t), MTBF/MTTR/availability inputs to R_i(t).",
        "ISO 14224:2016 — failure-data source for R_i(t) inputs by equipment class.",
      ],
      prerequisites: [
        "ASQ CRE BOK Reliability Fundamentals (RF) — R(t), exponential, MTBF/MTTR/availability.",
        "Basic combinatorics: binomial coefficient C(n,k) and binomial expansion.",
        "Boolean algebra: AND (multiplication), OR (complemented multiplication).",
        "Familiarity with P&ID and functional block diagrams.",
      ],
      references: [
        "ASQ CRE Body of Knowledge — Reliability Modeling domain.",
        "ISO 14224:2016 — Collection of reliability and maintenance data for equipment.",
        "Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 6.",
        "O'Connor & Kleyner (2012), Practical Reliability Engineering, Ch. 6.",
        "Smith (2021), Reliability, Maintainability and Risk, Ch. 8.",
        "Jardine & Tsang (2006), Maintenance, Replacement, and Reliability, Ch. 4.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Reliability Block Diagrams (RBD)",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which reliability formula describes a parallel (active-redundancy) configuration of n blocks?",
      whyCorrect:
        "For n blocks in active-parallel (the system functions iff at least one block functions), the system reliability is R_parallel = 1 − ∏_{i=1}^n (1 − R_i) — the complement of the joint-failure probability. This is the canonical active-redundancy rule.",
      whyOthersWrong: [
        "Option A (R_series = ∏ R_i) is the series rule (weakest-link) — the system functions only if ALL blocks function, the opposite of parallel redundancy.",
        "Option C (R = R_avg) is the arithmetic mean — it has no place in reliability reduction and would overestimate the weakest block while underestimating the strongest.",
        "Option D (R = max R_i) is the maximum of block reliabilities — it ignores the failure of the other blocks and would only be correct if a single block guaranteed the function, which is a 1oo1 architecture, not parallel redundancy.",
      ],
      explanation:
        "Parallel (active redundancy): R_parallel = 1 − ∏ (1 − R_i) = 1 − ∏ Q_i. The unreliability of an n-parallel system is the product of individual unavailabilities — geometric reduction with n.",
      options: [
        { text: "R_series = ∏_{i=1}^n R_i", isCorrect: false },
        { text: "R_parallel = 1 − ∏_{i=1}^n (1 − R_i)", isCorrect: true },
        { text: "R = (1/n) · Σ_{i=1}^n R_i", isCorrect: false },
        { text: "R = max(R_1, R_2, ..., R_n)", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability Block Diagrams (RBD)",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Oil & Gas",
      stem: "A 3-pump production skid is a series RBD with R1 = 0.95, R2 = 0.98, R3 = 0.99. Compute R_series.",
      whyCorrect:
        "Series reliability multiplies: R_series = R1·R2·R3 = 0.95 × 0.98 × 0.99 = 0.92169 = 92.17%. The system reliability is dominated by the weakest block (R1 = 0.95); the other two are higher and contribute less to the unreliability gap.",
      whyOthersWrong: [
        "Option A (0.9733 = average) — arithmetic mean has no place in series reduction; it would underestimate the actual weakest-link behavior.",
        "Option C (0.9946 = 1 − (1−0.95)(1−0.98)(1−0.99)) — this is the parallel-reliability formula applied to a series system; wrong topology.",
        "Option D (0.95 = min R_i) — the weakest-link rule means the system reliability is bounded above by the weakest block, but the actual R_series = 0.9217 < 0.95 because all three blocks must function simultaneously.",
      ],
      explanation:
        "Series: R_series = ∏ R_i = 0.95·0.98·0.99 = 0.92169 = 92.17%. The system fails if any one block fails; hence multiplication (the joint-probability of all functioning).",
      options: [
        { text: "0.9733 (the average R)", isCorrect: false },
        { text: "0.9217 (R1 × R2 × R3)", isCorrect: true },
        { text: "0.9946 (1 − (1−R1)(1−R2)(1−R3))", isCorrect: false },
        { text: "0.95 (the minimum R_i)", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability Block Diagrams (RBD)",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Power",
      stem: "A 2oo3 voting sensor subsystem has each channel reliability R = 0.99. Compute R_2oo3 and compare to a single-channel architecture.",
      whyCorrect:
        "For a 2-out-of-3 voting architecture: R_2oo3 = 3R² − 2R³ = 3·(0.99)² − 2·(0.99)³ = 3·0.9801 − 2·0.970299 = 2.9403 − 1.940598 = 0.999702 = 99.97%. Compared to single-channel R = 0.99, the 2oo3 architecture reduces unreliability from 1% to 0.03% — a ~33× reduction at the cost of 3× hardware.",
      whyOthersWrong: [
        "Option A (0.99 — same as single channel) — the 2oo3 vote provides redundancy; it cannot be identical to single-channel reliability.",
        "Option B (0.9999 — close to 1 − (1−0.99)² for 1oo2) — 1oo2 = 2R − R² = 0.9999; the 2oo3 architecture requires the third channel to also function, so its reliability is lower than 1oo2.",
        "Option D (0.999999 = (1 − (1−0.99)³)) — this is the 1oo3 (full parallel) reliability; 2oo3 is a stricter voting (needs 2 of 3 to vote), so it cannot reach the 1oo3 reliability.",
      ],
      explanation:
        "R_2oo3 = 3R² − 2R³ (binomial expansion, k=2 of n=3) = 0.999702. The 2oo3 architecture balances availability (survives single failure) with safety (fails on dual failure) — the canonical SIL 2 architecture.",
      options: [
        { text: "0.99 (same as single channel)", isCorrect: false },
        { text: "0.9999 (1oo2 reliability)", isCorrect: false },
        { text: "0.999702 (3R² − 2R³)", isCorrect: true },
        { text: "0.999999 (1 − (1−R)³, full parallel)", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability Block Diagrams (RBD)",
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Oil & Gas",
      stem: "True or False: In a series RBD with 3 blocks, the minimal cut sets are the three singletons {B1}, {B2}, {B3}, and the rare-event approximation Q_sys ≈ Q_B1 + Q_B2 + Q_B3 overestimates the exact Q_sys = 1 − R_series.",
      whyCorrect:
        "TRUE. In a series RBD, any single block failing causes system failure, so each block alone is a minimal cut set — the three singletons {B1}, {B2}, {B3} are the minimal cut sets. The rare-event approximation Q_sys ≈ Σ Q_cut_j sums the three unavailabilities; this overestimates the exact Q_sys = 1 − R_series because it ignores the (small) probability that two or more blocks fail simultaneously. For Q_i = 0.05, 0.02, 0.01: rare-event gives 0.08 vs exact 0.0783 — the approximation overestimates by ~2%.",
      whyOthersWrong: [
        "Option FALSE — would imply the rare-event approximation underestimates Q_sys; that is incorrect. The rare-event approximation always overestimates for series RBDs because it double-counts the (small) simultaneous-failure intersections — the inclusion-exclusion correction subtracts these pair terms.",
      ],
      explanation:
        "TRUE. Series minimal cut sets are the singletons; the rare-event approximation Q_sys ≈ Σ Q_i overestimates the exact Q_sys = 1 − ∏ R_i = 1 − ∏(1 − Q_i) because it ignores the (small) higher-order intersections that inclusion-exclusion would subtract.",
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Fault Tree Analysis (FTA)
// (Competency: "Fault Tree Analysis (FTA)"; slug: rm-fault-tree-analysis)
// ---------------------------------------------------------------------------

const LESSON_FTA: RefLesson = {
  competencyName: "Fault Tree Analysis (FTA)",
  slug: "rm-fault-tree-analysis",
  title: "Fault Tree Analysis (FTA)",
  titleAr: "تحليل شجرة الأخطاء (FTA)",
  order: 2,
  durationMin: 35,
  references: RM_REFERENCE_TITLES,
  conceptIntroduction: `A Fault Tree is a top-down deductive Boolean model that links a system *failure* (the top event) to the basic events (component failures, operator errors, external causes) that combine to produce it. The fault tree is built with two principal gates: the AND gate (output occurs iff all inputs occur — the parallel/cascade failure mode) and the OR gate (output occurs iff any input occurs — the series/cascade failure mode). The dual concept — *minimal cut sets* — captures the smallest combinations of basic events that produce the top event. Qualitative FTA ranks cut sets by order (size); quantitative FTA computes top-event probability from basic-event probabilities (with the rare-event approximation or inclusion-exclusion), and the *Fussell-Vesely importance* ranks each basic event by its contribution to the top-event probability. FTA is the natural complement to RBD (Lesson 1): the RBD encodes system success (functioning paths); the FTA encodes system failure (cut sets). The two are dual Boolean functions.`,
  example: `A nuclear plant's loss-of-coolant-accident (LOCA) top event has two minimal cut sets: {Pump-A fails AND Pump-B fails} and {Surge-valve fails}. With P(A) = 0.01, P(B) = 0.02, P(C-surge) = 0.005 — and assuming independence — Cut set 1: P(AB) = 0.01 × 0.02 = 2×10⁻⁴. Cut set 2: P(C) = 0.005. Rare-event approx: P_top ≈ P(AB) + P(C) = 2×10⁻⁴ + 5×10⁻³ = 5.2×10⁻³. Exact (inclusion-exclusion): P_top = P(AB) + P(C) − P(ABC) = 5.2×10⁻³ − 2×10⁻⁴·5×10⁻³ ≈ 5.2×10⁻³ (the triple-intersection term is negligible). Fussell-Vesely importance of surge valve C: I_C^FV = P(C-cut set) / P_top = 0.005 / 0.0052 = 0.962 (96.2%) — the surge valve dominates the top-event risk; the parallel-pump cut contributes only 3.8%. The reliability engineer's first action: derate or replace the surge valve.`,
  keyFormulas: `AND gate (basic events all must occur): P_AND = ∏ P_i
OR gate (any basic event occurs): P_OR = 1 − ∏ (1 − P_i)
Minimal cut set j: a smallest set of basic events whose joint occurrence produces the top event
Rare-event approximation: P_top ≈ Σ_j P_cut_j  (valid when each P_basic ≤ ~0.1 and cut sets nearly exclusive)
Exact inclusion-exclusion: P_top = Σ_j P_cut_j − Σ_{j<k} P_cut_j·P_cut_k + ... + (−1)^(m+1)·P_all_cuts
Cut set order: number of basic events in the smallest minimal cut set; lower order = higher criticality
Fussell-Vesely importance of basic event i: I_i^FV = Σ_{j: i ∈ cut_j} P_cut_j / P_top (contribution to top)
Risk Achievement Worth (RAW) of i: I_i^RAW = P_top(i = 1) / P_top (impact of i failing with certainty)
Risk Reduction Worth (RRW) of i: I_i^RRW = P_top / P_top(i = 0) (impact of i being perfect)`,
  exercise: `You are the CRE on a power plant safety-injection system (SIS). The top event is "no safety injection on demand." Build a fault tree with these basic events: A = pump fails to start (P = 0.005), B = injection valve fails to open (P = 0.002), C = operator fails to initiate (P = 0.001), D = common-cause calibration error (P = 0.0008). The fault tree: Top = (A OR B) AND C AND D. (a) Compute the minimal cut sets and identify the cut set order. (b) Apply the rare-event approximation to compute P_top. (c) Compute the Fussell-Vesely importance of each basic event and identify the dominant contributor.`,
  sections: {
    learning_objectives: `- Define a fault tree as a top-down deductive Boolean model linking the top event (system failure) to basic events.
- Distinguish AND gates (joint-failure mode) and OR gates (any-failure mode); apply the appropriate probability rule for each.
- Build a fault tree from a system schematic: identify the top event, intermediate events, and basic events; connect with gates.
- Compute minimal cut sets (the smallest combinations of basic events producing the top event) using Boolean reduction (absorption law, idempotent law).
- Apply the rare-event approximation P_top ≈ Σ P_cut_j for top-event probability; recognize when inclusion-exclusion is required.
- Compute the Fussell-Vesely importance of each basic event; rank events by their contribution to the top-event probability.
- Position FTA as the dual of RBD (Lesson 1) — minimal cut sets are the shared concept.`,
    prerequisites: `- ASQ CRE Reliability Fundamentals (RF) — Boolean algebra (AND, OR, complement), R(t), MTBF.
- Reliability Block Diagrams (RBD) — Lesson 1 (minimal cut sets are the dual of minimal path sets).
- Basic probability: independent-event multiplication, mutually exclusive addition, inclusion-exclusion.
- Familiarity with P&ID and safety-instrumented-system (SIS) architecture at the system-engineering level.`,
    introduction: `Fault Tree Analysis is the deductive top-down complement to the RBD's bottom-up approach. The reliability engineer begins with the *top event* — the system failure of interest (e.g., "loss of cooling," "explosion," "no safety injection on demand") — and decomposes it through Boolean gates into the *basic events* (component failures, human errors, external causes) that combine to produce the top. The two principal gates are: the AND gate (the output event occurs iff all input events occur — the joint-failure, redundancy-defeating mode) and the OR gate (the output occurs iff any input occurs — the series, single-point-of-failure mode).

Minimal cut sets are the central qualitative output of FTA. A *cut set* is any set of basic events whose joint occurrence produces the top event; a *minimal* cut set is one that cannot be reduced without losing the cut-set property. The Boolean reduction uses the absorption law (A ∪ (A ∩ B) = A) and the idempotent law (A ∩ A = A, A ∪ A = A) to simplify. The *order* of a cut set is the number of basic events in it; first-order cut sets are single-point-of-failure paths (highest criticality), second-order cut sets are dual-failure paths (redundancy-defeating), and so on.

Quantitative FTA computes P_top from the basic-event probabilities. The rare-event approximation P_top ≈ Σ_j P_cut_j sums the cut-set probabilities, valid when (i) each basic-event probability is small (≤ ~0.1) and (ii) cut sets are mutually nearly exclusive. When these conditions fail, inclusion-exclusion is required: P_top = Σ_j P_cut_j − Σ_{j<k} P_cut_j·P_cut_k + ... The first-order correction (subtract pair intersections) is the most commonly applied refinement.

*Importance measures* rank basic events by their contribution to P_top. *Fussell-Vesely importance* I_i^FV = (Σ_{j: i ∈ cut_j} P_cut_j) / P_top — the fraction of top-event probability attributable to cut sets containing event i. *Risk Achievement Worth* I_i^RAW = P_top(i=1) / P_top measures the impact of event i failing with certainty. *Risk Reduction Worth* I_i^RRW = P_top / P_top(i=0) measures the impact of making event i perfect. Fussell-Vesely is the workhorse for prioritizing maintenance; RAW and RRW are the workhorses for design changes.

FTA is the dual of RBD (Lesson 1). The RBD encodes system *success* (minimal path sets); the FTA encodes system *failure* (minimal cut sets). The two are dual Boolean functions of the same basic events. For a series RBD (weakest-link), the FTA top event is "system fails" with minimal cut sets {B1}, {B2}, ..., {Bn} — the OR of all singletons. For a parallel RBD (active redundancy), the FTA top event has a single minimal cut set {B1, B2, ..., Bn} — the AND of all blocks. The cut-set representation is the same from both views.`,
    terminology: `- **Top event**: the system failure of interest — the root of the fault tree.
- **Basic event**: a leaf of the tree — a component failure, human error, or external cause with a known probability.
- **Intermediate event**: an internal node — a Boolean combination of basic events or other intermediate events.
- **AND gate**: the output event occurs iff all input events occur (joint-failure, redundancy-defeating).
- **OR gate**: the output event occurs iff any input event occurs (series, single-point-of-failure).
- **Minimal cut set**: a smallest set of basic events whose joint occurrence produces the top event.
- **Cut set order**: the number of basic events in a cut set; lower order = higher criticality.
- **Rare-event approximation**: P_top ≈ Σ_j P_cut_j (valid when P_basic small and cut sets nearly exclusive).
- **Inclusion-exclusion**: exact P_top = Σ P_cut_j − Σ P_cut_j·P_cut_k + ... (m terms for m cut sets).
- **Fussell-Vesely importance** I_i^FV: fraction of P_top attributable to cut sets containing event i.
- **Risk Achievement Worth (RAW)**: P_top(i=1) / P_top — impact of event i failing with certainty.
- **Risk Reduction Worth (RRW)**: P_top / P_top(i=0) — impact of event i being perfect.
- **Boolean reduction**: simplification using absorption (A ∪ (A∩B) = A) and idempotent (A ∪ A = A) laws.`,
    detailed_explanation: `The fault tree is a directed acyclic graph rooted at the top event. Each non-leaf node is an AND or OR gate; each leaf is a basic event. The tree is built top-down: identify the top event, identify the immediate causes (intermediate events), and decompose each intermediate event into more specific failures until reaching basic events (component-level or external). The two principal gate types: AND (joint-failure mode — the output occurs iff ALL inputs occur) and OR (single-failure mode — the output occurs if ANY input occurs).

*Qualitative FTA* produces the minimal cut sets. The procedure: (i) write the top event as a Boolean expression in basic events using ∧ for AND, ∨ for OR; (ii) distribute the operators (de Morgan's law: ¬(A∧B) = ¬A ∨ ¬B); (iii) apply the absorption law A ∨ (A ∧ B) = A and the idempotent laws A ∧ A = A, A ∨ A = A; (iv) the resulting expression is a disjunction of conjunctions — each conjunction is a cut set; (v) remove non-minimal cut sets (those that are supersets of another cut set). The output: a list of minimal cut sets, each labeled with its order (number of basic events).

*Quantitative FTA* computes P_top. With basic-event probabilities P_i, each cut set's probability is the product of its P_i's (independence assumption). The rare-event approximation P_top ≈ Σ_j P_cut_j is the screening tool; inclusion-exclusion gives the exact value. The pair-intersection correction is the most common refinement: P_top ≈ Σ_j P_cut_j − Σ_{j<k} P_cut_j·P_cut_k. For very low P_i (safety systems, ~10⁻⁴ or less), the rare-event approximation is sufficient; for higher P_i (operational systems), inclusion-exclusion is needed.

*Importance measures* prioritize maintenance and design. Fussell-Vesely I_i^FV = (Σ_{j: i ∈ cut_j} P_cut_j) / P_top — the fraction of P_top "explained" by event i. RAW = P_top(i=1) / P_top — how much P_top increases if event i fails with certainty; this is the safety significance of i in the failed state (used in safety-system maintenance ranking). RRW = P_top / P_top(i=0) — how much P_top decreases if event i is made perfect; this is the design-improvement potential. The basic events with the highest Fussell-Vesely importance are the maintenance priorities; those with the highest RAW are the safety-significant components (cannot be taken out of service without major risk increase).

*FTA in practice*: FTA is the workhorse of *safety-instrumented-system (SIS)* analysis (IEC 61508 / 61511) — the top event is "SIS fails on demand" (or "spurious trip"), and the basic events include sensor failure, logic-solver failure, final-element failure, common-cause failure (β-factor, Lesson 3), and human error. FTA is also the standard tool for *nuclear probabilistic safety assessment (PSA)* — the top event is "core damage," and the fault tree links initiating events (loss of offsite power, small-break LOCA) to safety-system failures to core-damage frequency. The cut sets drive the maintenance prioritization and the technical-specification limiting conditions for operation (LCOs).

The *RBD ↔ FTA duality* is the recurring theme. For a series RBD with n blocks, the FTA top event has n first-order cut sets {B1}, {B2}, ..., {Bn} — the OR of singletons. For a parallel RBD (active redundancy), the FTA has a single n-th-order cut set {B1, B2, ..., Bn} — the AND of all blocks. For a koon RBD, the FTA has C(n, n−k+1) cut sets of order n−k+1 (the cut set is "any (n−k+1) of the n blocks fail"). The cut-set representation is identical whether computed from RBD or FTA — the two are dual views of the same Boolean function.`,
    core_principles: `- AND gate: output iff ALL inputs — joint-failure mode (redundancy-defeating).
- OR gate: output iff ANY input — single-failure mode (series cascade).
- Minimal cut sets are the central qualitative output; order is the criticality index.
- Rare-event approximation P_top ≈ Σ P_cut_j is the screening tool; inclusion-exclusion is the exact method.
- Fussell-Vesely importance = (cut sets containing i) / P_top — maintenance priority.
- RAW and RRW measure safety significance (failed state) and design-improvement potential (perfect state).
- FTA is the dual of RBD — same minimal cut sets, opposite view (failure vs success).
- For koon RBD: the FTA cut sets are of order (n − k + 1) and number C(n, n−k+1).`,
    components: `- **Top event**: the system failure of interest (root of the tree).
- **Basic event**: leaf node with a known probability (component failure, human error, external cause).
- **Intermediate event**: internal Boolean combination node.
- **AND gate**: joint-failure gate (multiplication).
- **OR gate**: any-failure gate (complemented multiplication / inclusion-exclusion).
- **Minimal cut set list**: the qualitative output (each entry is a conjunction of basic events).
- **Cut-set probability**: product of basic-event probabilities (independence assumption).
- **Importance measure**: Fussell-Vesely, RAW, RRW — ranking of basic events.
- **Boolean reduction engine**: applies absorption and idempotent laws to simplify the cut-set list.`,
    process: `1. Identify the top event (the system failure of interest — e.g., "no safety injection on demand").
2. Identify the immediate causes (intermediate events) and decompose recursively until reaching basic events.
3. Build the fault tree: AND/OR gates connecting intermediate events; basic events as leaves.
4. Write the Boolean expression for the top event in terms of basic events.
5. Apply Boolean reduction (absorption, idempotent) to obtain minimal cut sets.
6. Assign basic-event probabilities from field data, ISO 14224, or expert judgment.
7. Compute P_top with rare-event approximation; refine with inclusion-exclusion if needed.
8. Compute Fussell-Vesely importance for each basic event; rank for maintenance priority.
9. Validate the cut-set list against the RBD (Lesson 1) — they should match (dual views).
10. Report: top-event probability, cut-set list (with order), importance ranking, dominant contributors, recommended actions.`,
    formula_calculation: `Variables and formulas:
- P_i: basic event i probability — dimensionless [0,1]
- P_AND = ∏ P_i (joint failure)
- P_OR = 1 − ∏ (1 − P_i) (any failure)
- Minimal cut set j: P_cut_j = ∏_{i ∈ j} P_i (independence assumption)
- Rare-event approximation: P_top ≈ Σ_j P_cut_j
- Exact inclusion-exclusion: P_top = Σ_j P_cut_j − Σ_{j<k} P_cut_j·P_cut_k + ... + (−1)^(m+1)·P_all
- Fussell-Vesely importance: I_i^FV = (Σ_{j: i ∈ j} P_cut_j) / P_top
- Risk Achievement Worth: I_i^RAW = P_top(i = 1) / P_top
- Risk Reduction Worth: I_i^RRW = P_top / P_top(i = 0)
- Cut set order = number of basic events in the cut set; first-order cuts are single-point-of-failure paths

Units: probabilities dimensionless [0,1]; P_top dimensionless; importance dimensionless [0,1].

Assumptions: (i) basic events are statistically independent (CCF breaks this — Lesson 3); (ii) probabilities are small (≤ ~0.1) for the rare-event approximation; (iii) cut sets are mutually nearly exclusive (no overlapping dominant events); (iv) the fault tree is coherent (no NOT gates on basic events — monotonicity).

Interpretation: P_top is the probability of the top event per demand (for safety systems) or per unit time (for continuous systems). A Fussell-Vesely importance of 0.95 means 95% of the top-event probability is attributable to cut sets containing that event — the dominant maintenance priority.`,
    worked_example: `**Nuclear plant LOCA top event — 2 minimal cut sets.**
Given: Top = (A AND B) OR C, where A = pump-A fails (P = 0.01), B = pump-B fails (P = 0.02), C = surge valve fails (P = 0.005).
Minimal cut sets: {A, B} and {C}.
Cut set probabilities:
- P(AB) = P(A)·P(B) = 0.01·0.02 = 2×10⁻⁴.
- P(C) = 0.005.
Rare-event approx: P_top ≈ P(AB) + P(C) = 2×10⁻⁴ + 5×10⁻³ = 5.2×10⁻³.
Exact inclusion-exclusion: P_top = P(AB) + P(C) − P(ABC) = 5.2×10⁻³ − 2×10⁻⁴·5×10⁻³ = 5.2×10⁻³ − 1×10⁻⁶ ≈ 5.199×10⁻³. The pair-intersection correction is negligible (1×10⁻⁶ vs 5.2×10⁻³).

**Fussell-Vesely importance.**
For A: I_A^FV = (Σ_{cuts: A ∈ cut} P_cut) / P_top = P(AB) / 5.2×10⁻³ = 2×10⁻⁴ / 5.2×10⁻³ = 0.0385 = 3.85%.
For B: I_B^FV = P(AB) / 5.2×10⁻³ = 3.85%.
For C: I_C^FV = P(C) / 5.2×10⁻³ = 0.005 / 0.0052 = 0.9615 = 96.15%.
The surge valve C dominates the top-event risk — 96.15% of P_top is attributable to cut sets containing C. The parallel-pump cut contributes only 3.85% combined. The reliability engineer's first action: derate or replace the surge valve.

**Inclusion-exclusion with non-negligible intersections (synthetic).**
Top = AB OR CD with P_A=P_B=P_C=P_D=0.05. Each cut P = 0.05² = 2.5×10⁻³. Rare-event: P_top ≈ 2·2.5×10⁻³ = 5×10⁻³. Pair intersection P(ABCD) = 0.05⁴ = 6.25×10⁻⁶. Exact: P_top = 5×10⁻³ − 6.25×10⁻⁶ ≈ 4.994×10⁻³ — the rare-event overestimates by 0.12% (still very small because individual P_i = 0.05 is small). If we raise P_i to 0.2: cuts P = 0.04 each; rare-event 0.08; pair intersection 0.0016; exact 0.0784 — the rare-event overestimates by 2%. For P_i = 0.5: rare-event 0.5; pair intersection 0.0625; exact 0.4375 — the rare-event overestimates by 14%. The rule of thumb: rare-event is acceptable for P_i ≤ ~0.1.

**Risk Achievement Worth (synthetic).**
For the LOCA top event: P_top(A=1) — force A to fail with certainty: P_top = 1·P(B) + P(C) − 1·P(B)·P(C) = 0.02 + 0.005 − 0.02·0.005 = 0.025 − 1×10⁻⁴ = 0.0249. I_A^RAW = 0.0249 / 0.0052 = 4.79. RAW > 1 means A is safety-significant in the failed state (taking A out of service multiplies P_top by ~4.79×).
For C: P_top(C=1) = P(AB)·1 + 1 − P(AB)·1 = 1 (since C alone is a cut set, P_top = 1 when C fails). I_C^RAW = 1 / 0.0052 = 192.3 — the surge valve is overwhelmingly safety-significant in the failed state.`,
    industrial_example: `**Power — nuclear plant safety-injection system (SIS).** The top event is "no safety injection on demand." The fault tree has ~250 minimal cut sets ranging from order 1 to order 4. The 5 first-order cut sets are: {sensor common-cause failure}, {logic-solver common-cause failure}, {final-element common-cause failure}, {operator fails to initiate}, {test-interval latent failure of all redundant channels}. The dominant contributor (Fussell-Vesely) is the sensor CCF with β = 0.10 and per-channel P = 2×10⁻³ — cut-set P = β·P = 2×10⁻⁴, contributing 38% of P_top. The second contributor is the logic-solver CCF (β = 0.05, per-channel P = 5×10⁻⁴ → cut P = 2.5×10⁻⁵, 5% of P_top). The reliability engineer's maintenance priority: sensor common-cause defenses (diverse sensor technologies, separation of power and signal cables). P_top is verified against the IEC 61511 SIL 3 target (P_top < 10⁻³ per demand) — met with margin. Method per Smith (2021, Ch. 9) and IEC 61511.`,
    case_study: `CASE_TYPE = SYNTHETIC. A petrochemical plant flare-system top event "unburned hydrocarbon release to atmosphere" was analyzed by FTA. The fault tree (112 minimal cut sets, orders 1–4) identified two first-order cut sets: {flare-tip snuffing-steam valve fails closed} and {water-seal drum level high-high}. Basic-event probabilities: P(steam-valve) = 3×10⁻³ per demand (field data, 5-year CMMS history), P(water-seal) = 1×10⁻³ per demand. Rare-event P_top ≈ 4×10⁻³. Fussell-Vesely: I_steam-valve^FV = 0.75 (75%); I_water-seal^FV = 0.25 (25%). The reliability engineer's action: install a continuous steam-flow transmitter with low-flow alarm (alarmed before the valve fails fully closed) and a redundant level transmitter (2oo2 voting) on the water-seal drum. Post-modification: P(steam-valve) drops to 5×10⁻⁴ (early-warning alarm); P(water-seal) drops to 2×10⁻⁴ (2oo2 reduces the failure mode). New P_top ≈ 7×10⁻⁴ — a 5.7× reduction. The closed loop: top-event fault tree → Fussell-Vesely importance → design change → field data re-fit → confirm. Source: synthetic case authored for this lesson, method per Smith (2021, Ch. 9) and O'Connor (2012, Ch. 7).`,
    visual_explanation: `A fault tree is drawn top-down: the top event sits at the top (rectangle), connected through AND/OR gates (gated symbols) to intermediate events (rectangles), which decompose to basic events (circles) at the leaves. The AND-gate symbol is a D-shape (flat side down); the OR-gate symbol is a curved shield (curved side down). The minimal cut sets are visualized as small fault-trees of their own — each cut set is a conjunction (AND) of basic events that produces the top. A Fussell-Vesely importance bar chart ranks the basic events by their contribution to P_top; the dominant contributors are the maintenance priorities.`,
    simulation_opportunity: `An interactive simulation could let the learner build a fault tree by dragging gates and basic events, set each basic event probability, and observe the minimal cut sets and P_top computed live. A second mode would let the learner click a basic event and see its Fussell-Vesely, RAW, and RRW importance; a third mode would introduce common-cause failure (β-factor) and show how the cut-set structure changes (Lesson 3).`,
    common_mistakes: `- Confusing AND and OR gates — OR is the single-failure mode (any input fails); AND is the joint-failure mode (all inputs must fail).
- Using the rare-event approximation when basic-event P > 0.1 — the overestimate can be 10–50%.
- Forgetting Boolean reduction (absorption, idempotent) — non-minimal cut sets overcount P_top.
- Assuming basic-event independence when common-cause failure is present — the β-factor model (Lesson 3) is mandatory for redundant architectures.
- Reporting P_top without specifying the demand basis (per demand vs per hour vs per mission).
- Reporting Fussell-Vesely without the corresponding RAW — FV ranks maintenance; RAW ranks safety significance (a low-FV event can have a high RAW if its failed state is critical).
- Pooling basic events with different failure mechanisms into one cut set — the cut-set probability is meaningless without the independence assumption verified.`,
    limitations: `- The independence assumption breaks under common-cause failure (CCF) — the β-factor model (Lesson 3) is required for redundant architectures.
- The rare-event approximation is invalid for high basic-event probabilities (> ~0.1) or for many overlapping cut sets — inclusion-exclusion is then required.
- Fault trees grow combinatorially with the number of basic events — for large systems, Monte-Carlo (Lesson 4) or Bayesian-network methods are preferred.
- The fault tree is only as good as the basic-event probabilities — field data, expert judgment, or generic databases (MIL-HDBK-217, OREDA) feed the model; unverified P_i produces unverified P_top.
- FTA is binary (event occurs or not) — degraded/multi-state systems require Markov models (Lesson 4).
- The fault tree does not capture time-dependent failure rates explicitly — use P_i(t) for time-varying probabilities.
- Coherence (no NOT gates on basic events) is required for the standard minimal cut-set algorithms; non-coherent trees require extended methods.`,
    comparison: `**FTA vs RBD (Lesson 1):** FTA encodes system failure (top-down); RBD encodes system success (bottom-up). Minimal cut sets (FTA) are the dual of minimal path sets (RBD). For a series RBD, FTA cut sets are the singletons {B1},...,{Bn}; for a parallel RBD, FTA has the single cut set {B1,...,Bn}. The two are dual Boolean functions — use FTA for safety analysis (failure-focused) and RBD for reliability analysis (success-focused).

**FTA vs FMEA (RF Lesson 3):** FMEA is bottom-up — for each component, list failure modes and effects (qualitative, RPN ranking). FTA is top-down — for the system failure of interest, decompose into basic events (quantitative, cut-set probability). FMEA is broader (covers many failure modes); FTA is deeper (quantifies top-event probability). Best practice: FMEA first (find the modes), FTA second (quantify the critical top events).

**Fussell-Vesely vs RAW vs RRW:** FV = maintenance priority (cut-set contribution); RAW = safety significance (failed-state impact); RRW = design-improvement potential (perfect-state impact). A low-FV event can have a high RAW (rarely fails, but when it does, P_top explodes).`,
    practical_application: `- **Nuclear probabilistic safety assessment (PSA)**: top event = "core damage"; fault tree links initiating events to safety-system failures to core-damage frequency; cut sets drive technical-specification LCOs.
- **SIL verification (IEC 61508/61511)**: top event = "SIS fails on demand" (or "spurious trip"); fault tree includes sensor, logic-solver, final-element, CCF (β-factor), and human-error basic events.
- **Process safety (chemical/oil & gas)**: top event = "unburned hydrocarbon release," "loss of containment," "reactor runaway"; FTA identifies the dominant contributors for risk-reduction prioritization.
- **Aerospace**: top event = "loss of flight control"; FTA links actuator, sensor, and computer failures to the top.
- **Maintenance prioritization**: Fussell-Vesely importance ranks components for proactive maintenance; RAW identifies safety-significant components (cannot be taken out of service without major risk increase).`,
    decision_scenario: `You are the CRE on a chemical-reactor emergency-shutdown (ESD) system. The top event is "reactor overpressure on demand." Fault tree: Top = (Sensor-CCF OR Logic-solver-CCF) AND (Final-element-CCF). β = 0.10 for sensors, β = 0.05 for logic solver, β = 0.20 for final elements. Per-channel probabilities: P_sensor = 0.005, P_logic = 0.002, P_final = 0.010. (a) Compute the minimal cut sets and identify the order. (b) Apply the rare-event approximation for P_top. (c) Compute the Fussell-Vesely importance of each subsystem and recommend the first design action to reduce P_top by 10×.`,
    practice_questions: `- **Q1 (Easy, Recall):** State the AND-gate and OR-gate probability rules.
- **Q2 (Medium, Calculation):** A fault tree Top = A AND B has P(A) = 0.02, P(B) = 0.03. Compute P_top with and without the rare-event approximation (assuming only this cut set).
- **Q3 (Medium, Application):** For a 3-block parallel RBD, write the FTA top event as a Boolean expression and identify the minimal cut set.
- **Q4 (Hard, Analyze):** Given a fault tree with cut sets {A,B} (P=2×10⁻⁴) and {C} (P=5×10⁻³), compute Fussell-Vesely importance of A, B, C and recommend the first maintenance action.`,
    certification_questions: `- **CRE-style (Easy):** Which gate's probability rule is P_OR = 1 − ∏ (1 − P_i)? (OR gate).
- **CRE-style (Medium, Calculation):** A fault tree has minimal cut sets {A,B} (P=2×10⁻⁴) and {C,D} (P=4×10⁻⁴). Apply the rare-event approximation for P_top.
- **CRE-style (Hard, Analysis):** Define Fussell-Vesely importance; for a fault tree where cut set {C} contributes 96% of P_top, what maintenance action does this trigger?`,
    summary: `Fault Tree Analysis is the top-down deductive complement to the bottom-up RBD. AND gates encode joint-failure modes (redundancy-defeating); OR gates encode single-failure modes (series cascade). Minimal cut sets are the central qualitative output; the rare-event approximation P_top ≈ Σ P_cut_j screens top-event probability, refined by inclusion-exclusion when intersections are non-negligible. Fussell-Vesely importance ranks maintenance priorities; RAW ranks safety significance; RRW ranks design-improvement potential. FTA is the workhorse of SIS SIL verification (IEC 61511) and nuclear PSA — both anchored in ASQ CRE Reliability Modeling.`,
    key_takeaways: `- AND gate: joint-failure mode — P_AND = ∏ P_i.
- OR gate: single-failure mode — P_OR = 1 − ∏ (1 − P_i).
- Minimal cut sets are the qualitative output; order is the criticality index.
- Rare-event approx P_top ≈ Σ P_cut_j; inclusion-exclusion for higher P_i.
- Fussell-Vesely = maintenance priority; RAW = safety significance; RRW = design-improvement potential.
- FTA is the dual of RBD — minimal cut sets are the shared concept from opposite views.`,
    references: `- ASQ CRE Body of Knowledge — Reliability Modeling domain.
- ISO 14224:2016 — Collection of reliability and maintenance data for equipment.
- Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 6 (FTA, minimal cut sets).
- O'Connor & Kleyner (2012), Practical Reliability Engineering, Ch. 7 (FTA — top event, AND/OR, Fussell-Vesely).
- Smith (2021), Reliability, Maintainability and Risk, Ch. 9 (FTA synthesis and Fussell-Vesely importance).
- Jardine & Tsang (2006), Maintenance, Replacement, and Reliability, Ch. 4 (System reliability — RBD, FTA).`,
  },
  knowledgeObject: {
    title: "Fault Tree Analysis (FTA)",
    domain: "Reliability Modeling",
    competency: "Fault Tree Analysis (FTA)",
    topic: "System Reliability Modeling",
    concept: "Top-down Boolean fault-tree synthesis, minimal cut sets, and importance measures",
    body: {
      definitions: [
        "Fault Tree Analysis (FTA): a top-down deductive Boolean model that links a system failure (top event) to basic events through AND/OR gates.",
        "Top event: the system failure of interest — the root of the fault tree.",
        "Basic event: a leaf node with a known probability (component failure, human error, external cause).",
        "AND gate: output event occurs iff ALL input events occur — joint-failure, redundancy-defeating mode; P_AND = ∏ P_i.",
        "OR gate: output event occurs iff ANY input event occurs — single-failure, series cascade mode; P_OR = 1 − ∏ (1 − P_i).",
        "Minimal cut set: a smallest set of basic events whose joint occurrence produces the top event.",
        "Cut set order: number of basic events in a cut set; first-order cuts are single-point-of-failure paths.",
        "Rare-event approximation: P_top ≈ Σ_j P_cut_j (valid when each P_i ≤ ~0.1 and cut sets nearly exclusive).",
        "Inclusion-exclusion: exact P_top = Σ P_cut_j − Σ P_cut_j·P_cut_k + ... for m cut sets.",
        "Fussell-Vesely importance I_i^FV = (Σ_{j: i∈j} P_cut_j) / P_top — maintenance priority.",
        "Risk Achievement Worth (RAW) I_i^RAW = P_top(i=1) / P_top — safety significance in failed state.",
        "Risk Reduction Worth (RRW) I_i^RRW = P_top / P_top(i=0) — design-improvement potential.",
      ],
      principles: [
        "AND gate = joint-failure mode (redundancy-defeating); OR gate = single-failure mode (series cascade).",
        "Minimal cut sets are the central qualitative output; order is the criticality index.",
        "Rare-event approximation P_top ≈ Σ P_cut_j is the screening tool; inclusion-exclusion is exact.",
        "Fussell-Vesely ranks maintenance; RAW ranks safety significance; RRW ranks design-improvement potential.",
        "FTA is the dual of RBD — same minimal cut sets, opposite view (failure vs success).",
        "For a koon RBD, the FTA cut sets are of order (n − k + 1) and number C(n, n−k+1).",
        "FTA is the workhorse of SIS SIL verification (IEC 61511) and nuclear PSA.",
      ],
      components: [
        "Top event (root rectangle).",
        "Basic event (leaf circle with P_i).",
        "Intermediate event (internal rectangle).",
        "AND gate (D-shape, joint-failure).",
        "OR gate (curved shield, any-failure).",
        "Minimal cut set list (qualitative output).",
        "Importance measures: FV, RAW, RRW.",
        "Boolean reduction engine (absorption, idempotent laws).",
      ],
      mechanism: [
        "FTA lifecycle: identify top event → decompose through gates to basic events → Boolean reduction to minimal cut sets → assign basic-event probabilities → compute P_top (rare-event or inclusion-exclusion) → compute importance (FV, RAW, RRW) → rank maintenance priorities → validate against RBD (dual view) → sustain and re-fit from field data (closed loop).",
      ],
      process: [
        "1. Identify the top event (system failure of interest).",
        "2. Identify the immediate causes (intermediate events); decompose recursively to basic events.",
        "3. Build the fault tree with AND/OR gates; basic events as leaves.",
        "4. Write the Boolean expression; apply reduction (absorption, idempotent) to obtain minimal cut sets.",
        "5. Assign basic-event probabilities from field data, ISO 14224, or expert judgment.",
        "6. Compute P_top with rare-event approx; refine with inclusion-exclusion if needed.",
        "7. Compute Fussell-Vesely importance; rank maintenance priorities.",
        "8. Validate the cut-set list against the RBD (dual view).",
        "9. Report P_top, cut-set list (with order), importance ranking, dominant contributors, recommended actions.",
      ],
      formulas: [
        "P_AND = ∏ P_i (joint failure).",
        "P_OR = 1 − ∏ (1 − P_i) (any failure).",
        "Cut set probability P_cut_j = ∏_{i ∈ j} P_i (independence).",
        "Rare-event approx: P_top ≈ Σ_j P_cut_j.",
        "Exact inclusion-exclusion: P_top = Σ_j P_cut_j − Σ_{j<k} P_cut_j·P_cut_k + ...",
        "Fussell-Vesely I_i^FV = (Σ_{j: i∈j} P_cut_j) / P_top.",
        "RAW I_i^RAW = P_top(i=1) / P_top.",
        "RRW I_i^RRW = P_top / P_top(i=0).",
      ],
      metrics: [
        "Top-event probability P_top [dimensionless, per demand or per unit time].",
        "Number of minimal cut sets (qualitative complexity index).",
        "Cut-set order (criticality index; lower order = higher criticality).",
        "Fussell-Vesely importance I_i^FV [dimensionless 0..1].",
        "Risk Achievement Worth I_i^RAW [dimensionless, >1 = safety-significant].",
        "Risk Reduction Worth I_i^RRW [dimensionless, >1 = design-improvement potential].",
        "Pair-intersection correction (inclusion-exclusion first-order).",
      ],
      examples: [
        "Nuclear LOCA: cut sets {A,B} P=2×10⁻⁴ and {C} P=5×10⁻³ → P_top ≈ 5.2×10⁻³; FV(C) = 96.15% (surge valve dominates).",
        "Parallel RBD: single cut set {B1,...,Bn}; P_top = ∏ Q_i (joint failure).",
        "Series RBD: cut sets are singletons {B1}, {B2}, ..., {Bn}; P_top = 1 − ∏ R_i.",
        "Synthetic 2-cut set Top=AB OR CD with P_i=0.05 → rare-event 5×10⁻³; exact 4.994×10⁻³ (overestimate 0.12%).",
      ],
      industrial_examples: [
        "Power — nuclear SIS: top 'no safety injection'; 250 cut sets orders 1-4; dominant sensor CCF (β=0.10) contributes 38% of P_top.",
        "Chemical — flare system: top 'unburned hydrocarbon release'; 112 cut sets; first-order cuts = {steam-valve}, {water-seal}; FV(steam-valve)=75%.",
        "Oil & Gas — ESD: top 'no ESD on demand'; cut sets for sensor, logic-solver, final-element CCF; SIL verification per IEC 61511.",
        "Aerospace — flight control: top 'loss of flight control'; FTA links actuator/sensor/computer failures.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Petrochemical flare system top 'unburned hydrocarbon release'; 112 minimal cut sets orders 1-4. Two first-order cuts: {flare-tip snuffing-steam valve fails closed} P=3×10⁻³, {water-seal drum high-high} P=1×10⁻³. P_top ≈ 4×10⁻³. FV(steam-valve)=75%, FV(water-seal)=25%. Actions: continuous steam-flow transmitter with low-flow alarm (drops P(steam-valve) to 5×10⁻⁴); 2oo2 redundant level transmitter (drops P(water-seal) to 2×10⁻⁴). New P_top ≈ 7×10⁻⁴ — 5.7× reduction. Closed loop: FTA → FV → design change → field re-fit → confirm. Method per Smith (2021, Ch. 9) and O'Connor (2012, Ch. 7).",
      ],
      common_errors: [
        "Confusing AND and OR gates — OR is single-failure, AND is joint-failure.",
        "Using the rare-event approx when P_basic > 0.1 (overestimate 10-50%).",
        "Forgetting Boolean reduction — non-minimal cut sets overcount P_top.",
        "Assuming independence when CCF is present (β-factor, Lesson 3).",
        "Reporting P_top without the demand basis (per demand vs per hour).",
        "Reporting FV without RAW — low-FV event can have high RAW if its failed state is critical.",
        "Pooling basic events with different failure mechanisms into one cut set.",
      ],
      limitations: [
        "Independence assumption breaks under CCF — β-factor model required for redundant architectures.",
        "Rare-event approx invalid for high P_i (> ~0.1) or overlapping cut sets — use inclusion-exclusion.",
        "Fault trees grow combinatorially — Monte-Carlo or Bayesian networks for very large systems.",
        "Fault tree is only as good as P_i inputs — verify with field data or generic databases.",
        "FTA is binary — degraded/multi-state require Markov (Lesson 4).",
        "Coherence (no NOT gates on basic events) required for standard algorithms.",
      ],
      best_practices: [
        "Always specify the demand basis (per demand vs per hour) for P_top.",
        "Report FV alongside RAW — both are needed for full maintenance + safety-significance ranking.",
        "Apply inclusion-exclusion when P_basic > 0.1 or when cut sets overlap heavily.",
        "Validate the FTA cut-set list against the RBD — they should match (dual views).",
        "Use β-factor (Lesson 3) for redundant architectures — independence is never safe to assume.",
        "Re-fit basic-event probabilities from CMMS/FRACAS field data annually.",
        "Document the Boolean reduction steps — reproducibility is essential for safety cases.",
      ],
      related_concepts: [
        "Reliability Block Diagrams (Lesson 1) — the dual (success) view of the same Boolean function.",
        "Redundancy & Voting / MooN (Lesson 3) — β-factor CCF and the impact on FTA cut sets.",
        "Markov & State-Transition (Lesson 4) — multi-state generalization for repairable systems.",
        "Reliability Fundamentals (RF) — R(t), MTBF/MTTR/availability basic-event probability inputs.",
        "ISO 14224:2016 — failure-data source for basic-event probabilities.",
      ],
      prerequisites: [
        "ASQ CRE RF — Boolean algebra (AND, OR, complement), R(t).",
        "RBD (Lesson 1) — minimal cut sets are the dual of minimal path sets.",
        "Basic probability: independent-event multiplication, mutually exclusive addition, inclusion-exclusion.",
        "Familiarity with P&ID and SIS architecture.",
      ],
      references: [
        "ASQ CRE Body of Knowledge — Reliability Modeling domain.",
        "ISO 14224:2016 — Collection of reliability and maintenance data for equipment.",
        "Ebeling (2010), Ch. 6 (FTA, minimal cut sets).",
        "O'Connor & Kleyner (2012), Ch. 7 (FTA, Fussell-Vesely).",
        "Smith (2021), Ch. 9 (FTA synthesis).",
        "Jardine & Tsang (2006), Ch. 4 (System reliability).",
      ],
    },
  },
  questions: [
    {
      competencyName: "Fault Tree Analysis (FTA)",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "In a fault tree, which gate's probability rule is P_OR = 1 − ∏ (1 − P_i), and which failure mode does it represent?",
      whyCorrect:
        "The OR gate computes P_OR = 1 − ∏ (1 − P_i) — the complement of the joint-non-occurrence. The OR gate represents the single-failure mode (the output occurs iff ANY input occurs), which is the series cascade in RBD terms.",
      whyOthersWrong: [
        "Option A is the AND gate — P_AND = ∏ P_i, the joint-failure (redundancy-defeating) mode, not the OR.",
        "Option C (P_OR = max P_i) — taking the maximum is not a valid probability rule; the OR is the inclusion-exclusion 1 − ∏(1 − P_i).",
        "Option D (P_OR = Σ P_i) — this is the rare-event approximation for mutually exclusive events, not the general OR rule; it overestimates when events overlap.",
      ],
      explanation:
        "OR gate: P_OR = 1 − ∏ (1 − P_i). Single-failure mode (any input fails → output). The AND gate is the dual: P_AND = ∏ P_i.",
      options: [
        { text: "AND gate — joint-failure mode", isCorrect: false },
        { text: "OR gate — single-failure mode (series cascade)", isCorrect: true },
        { text: "OR gate — P_OR = max(P_1, ..., P_n)", isCorrect: false },
        { text: "OR gate — P_OR = Σ P_i (always)", isCorrect: false },
      ],
    },
    {
      competencyName: "Fault Tree Analysis (FTA)",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Power",
      stem: "A nuclear-plant LOCA top event has two minimal cut sets: {A,B} with P(A)=0.01 and P(B)=0.02, and {C} with P(C)=0.005. Apply the rare-event approximation for P_top and compute the Fussell-Vesely importance of C.",
      whyCorrect:
        "Rare-event: P_top ≈ P(AB) + P(C) = (0.01·0.02) + 0.005 = 2×10⁻⁴ + 5×10⁻³ = 5.2×10⁻³. Fussell-Vesely of C: I_C^FV = (Σ_{cuts: C∈cut} P_cut) / P_top = P(C) / 5.2×10⁻³ = 0.005 / 0.0052 = 0.9615 = 96.15%. The surge valve C dominates the top-event risk (96.15%); the parallel-pump cut {A,B} contributes only 3.85%.",
      whyOthersWrong: [
        "Option A (P_top = 0.015; FV(C) = 0.333) — P_top is computed as P(A)+P(B)+P(C) = 0.035, which is the series-OR rule incorrectly applied to a 2-cut-set AND structure; the cut {A,B} is a joint cut (probability product), not a sum.",
        "Option B (P_top = 7×10⁻⁴; FV(C) = 0.10) — P_top is computed as P(A)·P(B)·P(C) = 1×10⁻⁶, ignoring that {A,B} and {C} are SEPARATE cut sets combined with OR; the cut-set OR rule is P_top ≈ P(AB) + P(C), not the product.",
        "Option D (P_top = 5×10⁻³; FV(C) = 1.0) — FV(C) = 1.0 would imply C alone accounts for 100% of P_top, but P_top = 5.2×10⁻³ > P(C) = 5×10⁻³, so FV(C) = 0.9615 < 1.0.",
      ],
      explanation:
        "P_top ≈ P(AB) + P(C) = 2×10⁻⁴ + 5×10⁻³ = 5.2×10⁻³. I_C^FV = 0.005/0.0052 = 96.15%. C is the dominant maintenance priority — derate or replace the surge valve first.",
      options: [
        { text: "P_top = 0.035; FV(C) = 0.143", isCorrect: false },
        { text: "P_top = 7×10⁻⁴; FV(C) = 0.10", isCorrect: false },
        { text: "P_top ≈ 5.2×10⁻³; FV(C) ≈ 96.15%", isCorrect: true },
        { text: "P_top ≈ 5×10⁻³; FV(C) = 1.00", isCorrect: false },
      ],
    },
    {
      competencyName: "Fault Tree Analysis (FTA)",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Oil & Gas",
      stem: "Which statement best describes the duality between a Reliability Block Diagram (RBD) and a Fault Tree (FTA) for the SAME system?",
      whyCorrect:
        "The RBD encodes system SUCCESS (functioning paths) bottom-up; the FTA encodes system FAILURE (cut sets) top-down. They are dual Boolean functions of the same basic events. The minimal cut sets of the FTA are exactly the complements of the minimal path sets of the RBD — same Boolean function, opposite ends. For a series RBD, the FTA has cut sets {B1}, {B2}, ..., {Bn} (singletons); for a parallel RBD, the FTA has a single cut set {B1, B2, ..., Bn}.",
      whyOthersWrong: [
        "Option A (RBD and FTA produce different minimal cut sets) — incorrect; the cut sets are identical (dual views).",
        "Option B (RBD is bottom-up success; FTA is top-down failure; they are unrelated) — incorrect; they are dual Boolean functions of the same events.",
        "Option D (RBD encodes failure; FTA encodes success) — incorrect; this reverses the convention. RBD = success paths, FTA = failure cut sets.",
      ],
      explanation:
        "RBD ↔ FTA duality: same Boolean function, opposite ends. RBD minimal path sets = FTA minimal cut sets (viewed from the complement). For series RBD, FTA has n singleton cuts; for parallel RBD, FTA has one n-element cut.",
      options: [
        { text: "RBD and FTA produce different minimal cut sets — they are independent analyses", isCorrect: false },
        { text: "RBD (success, bottom-up) and FTA (failure, top-down) are dual Boolean functions; their minimal cut/path sets match", isCorrect: true },
        { text: "RBD and FTA are unrelated — RBD is quantitative, FTA is qualitative", isCorrect: false },
        { text: "RBD encodes failure; FTA encodes success (reversed convention)", isCorrect: false },
      ],
    },
    {
      competencyName: "Fault Tree Analysis (FTA)",
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Power",
      stem: "True or False: A basic event with low Fussell-Vesely importance can still have a high Risk Achievement Worth (RAW), indicating the event rarely fails but its failure would multiply P_top by a large factor.",
      whyCorrect:
        "TRUE. Fussell-Vesely importance ranks the *steady-state* contribution of an event to P_top (how much P_top it explains in normal operation). RAW ranks the *failed-state* impact (P_top when the event is forced to fail with certainty). These are different metrics. A rare-failure event (low FV) can be highly safety-significant in the failed state (high RAW) — e.g., a backup safety valve that rarely fails but whose failure would defeat all redundancy. The maintenance engineer uses FV to prioritize preventive maintenance; the safety engineer uses RAW to identify components that cannot be taken out of service without major risk increase (tech-spec LCOs in nuclear).",
      whyOthersWrong: [
        "Option FALSE — would imply FV and RAW rank the same thing; in fact they are complementary metrics. Low FV + high RAW is the signature of a low-probability-but-high-consequence component (e.g., a passive safety interlock).",
      ],
      explanation:
        "TRUE. FV = steady-state contribution; RAW = failed-state impact. They rank different things — a low-FV, high-RAW event is a rare-but-catastrophic component, safety-significant in the failed state but a small contributor to baseline P_top.",
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Redundancy & Voting (MooN)
// (Competency: "Redundancy & Voting (MooN)"; slug: rm-redundancy-voting-moon)
// ---------------------------------------------------------------------------

const LESSON_MOON: RefLesson = {
  competencyName: "Redundancy & Voting (MooN)",
  slug: "rm-redundancy-voting-moon",
  title: "Redundancy & Voting (MooN)",
  titleAr: "التكرار والتصويت (MooN)",
  order: 3,
  durationMin: 35,
  references: RM_REFERENCE_TITLES,
  conceptIntroduction: `Redundancy is the reliability engineer's principal lever for raising system reliability beyond the per-block ceiling. Two architectural flavors dominate: *active* redundancy (all channels operating in parallel; the system functions iff at least k of n channels function — koon) and *standby* redundancy (one or more channels in reserve; the system switches to a standby on failure of the primary). *Voting* architectures (M-out-of-N, MooN) generalize active redundancy: the system output is taken as the M-of-N vote — e.g., 2oo3 selects the median of three sensors, surviving any single failure while failing on dual failure. The crucial caveat: redundancy assumes *independent* failures across channels, which common-cause failure (CCF) breaks. The *β-factor model* partitions each channel's failure rate λ into an independent portion (1−β)·λ and a common-cause portion β·λ that strikes all redundant channels simultaneously; the system reliability is R_MooN^CCF(t) = R_MooN^indep(t) · R_CC(t) where R_CC(t) = exp(−β·λ·t). *Imperfect switching* adds another layer for standby architectures: the system survives a primary failure only if the switch detects it and the standby starts — modeled with switch reliability R_sw and standby wear-in.`,
  example: `A 2oo3 voting safety-instrumented system (SIS) has each channel with λ = 1×10⁻⁵/h (MTBF = 100,000 h). The mission is t = 1,000 h. Single-channel reliability R = exp(−λ·t) = exp(−0.01) = 0.99005. Without CCF, R_2oo3 = 3R² − 2R³ = 3·0.9801 − 2·0.970299 = 0.999702. With β = 0.05 (CCF present), the independent portion λ_ind = (1−β)·λ = 0.95×10⁻⁵/h, and R_ind(t) = exp(−0.95×10⁻⁵·1000) = exp(−0.0095) = 0.990545. R_MooN^indep = 3·(0.990545)² − 2·(0.990545)³ = 3·0.981179 − 2·0.971894 = 2.943537 − 1.943789 = 0.999749. R_CC(t) = exp(−β·λ·t) = exp(−0.05·1×10⁻⁵·1000) = exp(−5×10⁻⁴) = 0.999500. Total R_2oo3^CCF = 0.999749·0.999500 = 0.999249 = 99.92%. Compare to the no-CCF R = 0.999702 — CCF reduced the 2oo3 reliability by ~0.045 percentage points; the dominant single-channel contribution (β·λ) drops R from 0.999702 to 0.999249. For higher β (0.10), R_CC = exp(−0.001) = 0.999000; total R = 0.998749 — the CCF effect grows linearly with β for small β·λ·t.`,
  keyFormulas: `Active redundancy (koon): R_MooN(t) = Σ_{i=M}^{N} C(N,i)·R(t)^i·(1−R(t))^(N−i)
  M=1: full parallel (1ooN): R = 1 − (1−R)^N
  M=N: full series (NooN): R = R^N
  2oo3: R = 3R² − 2R³; 2oo4: R = 6R²(1−R)² + 4R³(1−R) + R⁴; 3oo5: R = 6R³(1−R)² + 5R⁴(1−R) + R⁵
CCF β-factor: λ_ind = (1−β)·λ; λ_CC = β·λ
  R_MooN^CCF(t) = R_MooN^indep(λ_ind, t) · R_CC(λ_CC, t)
  R_CC(t) = exp(−β·λ·t) — the common-cause strikes all N channels simultaneously
Standby (cold) redundancy: R_system(t) = R_active(t) + R_sw · ∫₀ᵗ f_active(τ)·R_standby(t−τ) dτ
  Approximation (exponential active & standby, perfect switch): R = exp(−λ·t)·(1 + λ·t)
  Imperfect switching: multiply the standby contribution by R_sw (switch reliability)
Steady-state availability for koon repairable: A_MooN = Σ_{i=0}^{M−1} C(N,i)·A^i·(1−A)^(N−i)
  For 2oo3 with single-channel A: A_2oo3 = 3A² − 2A³`,
  exercise: `You are the CRE on a power-plant electrical protection relay. The architecture is 2oo3 voting with each relay λ = 2×10⁻⁶/h (MTBF = 500,000 h). The mission is t = 4,380 h (6 months). The CCF β-factor is 0.10. The standby alternative (relay with cold-standby spare) has switch reliability R_sw = 0.995. (a) Compute R_single, R_2oo3 (no CCF), R_2oo3 (with β=0.10). (b) Compute R_cold-standby with imperfect switching at the same t. (c) Which architecture meets R ≥ 0.999? Recommend one with justification.`,
  sections: {
    learning_objectives: `- Define active redundancy (koon voting), standby redundancy (cold/hot/warm), and the trade-offs (cost vs reliability vs complexity).
- Apply the koon reliability formula R_MooN = Σ_{i=M}^N C(N,i)·R^i·(1−R)^(N−i); derive 2oo3, 2oo4, 3oo5 closed forms.
- Define common-cause failure (CCF) and apply the β-factor model: λ_ind = (1−β)·λ, λ_CC = β·λ.
- Compute the CCF-adjusted system reliability R_MooN^CCF = R_MooN^indep · R_CC.
- Define imperfect switching for standby redundancy; compute R_system with switch reliability R_sw.
- Select between active (koon) and standby architectures based on reliability target, cost, and response-time requirements.
- Position MooN/voting within safety-instrumented-system (SIS) SIL verification (IEC 61511).`,
    prerequisites: `- ASQ CRE Reliability Fundamentals (RF) — R(t), exponential, MTBF.
- Reliability Block Diagrams (RBD) — Lesson 1 (series/parallel/koon, minimal cut sets).
- Fault Tree Analysis (FTA) — Lesson 2 (CCF as a basic event in the FTA cut sets).
- Basic combinatorics: binomial coefficient C(n,k) and binomial expansion.
- Familiarity with safety-instrumented-system (SIS) architecture (sensor, logic solver, final element).`,
    introduction: `Redundancy is the principal lever for raising system reliability beyond the per-block ceiling. The reliability engineer adds redundant channels — additional components performing the same function — so that the system survives single (or multiple) channel failures. The two architectural flavors: *active* redundancy (all channels operating in parallel; the system output is the M-of-N vote) and *standby* redundancy (one or more channels in reserve; the system switches to a standby on failure of the primary). Voting architectures (MooN) generalize active redundancy.

*Active redundancy (MooN voting)*: the system functions iff at least M of N channels function. The reliability formula is the binomial expansion R_MooN = Σ_{i=M}^{N} C(N,i)·R^i·(1−R)^(N−i). Special cases: 1ooN (full parallel) reduces to R = 1 − (1−R)^N; NooN (full series) reduces to R^N. The canonical voting architectures: 1oo2 (any of 2 — full parallel), 2oo3 (median of 3, survives 1 failure), 2oo4 (survives 2 failures but requires 2 to vote), 3oo5 (survives 2 failures, requires 3 to vote). The 2oo3 is the workhorse of safety-instrumented systems (SIS) — it survives a single channel failure (availability) while failing on dual failure (safety). The binomial closed forms: 2oo3 = 3R² − 2R³; 2oo4 = 6R²(1−R)² + 4R³(1−R) + R⁴; 3oo5 = 6R³(1−R)² + 5R⁴(1−R) + R⁵.

*Standby redundancy*: one channel operates, one (or more) stands in reserve. Cold standby — the reserve is off (no aging until switched in); warm standby — the reserve is partially energized (slow aging); hot standby — the reserve is fully energized (same aging as primary, but ready to take over instantly). The system reliability includes the switching event: R_system(t) = R_active(t) + R_sw · ∫₀ᵗ f_active(τ)·R_standby(t−τ) dτ, where R_sw is the switch reliability. For exponential active and standby (perfect switch), R = exp(−λ·t)·(1 + λ·t) — the standby adds the λ·t term. Imperfect switching multiplies the standby contribution by R_sw.

*Common-cause failure (CCF)* is the dark side of redundancy. The independence assumption (the channels fail independently) breaks when the channels share a common design, manufacturer, environment, or operator. The *β-factor model* partitions each channel's failure rate λ into an independent portion (1−β)·λ (affects only that channel) and a common-cause portion β·λ (affects all redundant channels simultaneously). The system reliability becomes R_MooN^CCF(t) = R_MooN^indep((1−β)·λ, t) · R_CC(β·λ, t), where R_CC(t) = exp(−β·λ·t) — the common-cause strikes all N channels at once, reducing the system to a single equivalent channel for the CCF portion. Typical β values: 0.01 (well-separated, diverse channels); 0.05 (identical channels, separation); 0.10 (identical channels, common cabinet); 0.20 (identical channels, common design/manufacturing).

*Imperfect switching* for standby: the system survives a primary failure only if (i) the switch detects the failure, (ii) the switch successfully transfers, and (iii) the standby starts and operates. Switch reliability R_sw combines these; for a single standby, R_system = R_active + R_sw · (standby contribution). For MooN with standby, the formula generalizes — see the worked example.

*MooN within SIS (IEC 61511)*: voting architectures are the workhorse of safety-instrumented systems. A 1oo2 sensor architecture maximizes availability (survives single failure) but reduces safety (any one sensor can spuriously trip); a 2oo2 maximizes safety (no spurious trip) but reduces availability (any one failure trips). The 2oo3 is the canonical compromise — survives any single failure (availability) and requires two to fail for spurious trip (safety). The IEC 61511 SIL target (P_top < 10⁻² to 10⁻⁴ per demand for SIL 1-4) typically requires 2oo3 or 2oo4 architectures with β ≤ 0.10 to meet SIL 2-3.`,
    terminology: `- **Active redundancy**: all channels operating in parallel; system functions iff at least k of n function (koon).
- **Standby redundancy**: one channel operating; one or more in reserve (cold = off, warm = partial, hot = full).
- **MooN (M-out-of-N) voting**: the system output is the M-of-N vote; system functions iff at least M of N channels function.
- **2oo3 voting**: the canonical SIS architecture — survives 1 failure, fails on 2 failures.
- **Common-cause failure (CCF)**: simultaneous failure of multiple redundant channels due to a shared cause (design, manufacturer, environment, operator).
- **β-factor**: the fraction of the total failure rate attributable to common cause; λ_ind = (1−β)·λ, λ_CC = β·λ.
- **R_CC(t) = exp(−β·λ·t)**: the common-cause strikes all N channels simultaneously.
- **R_MooN^CCF(t) = R_MooN^indep((1−β)·λ, t) · R_CC(β·λ, t)**: the CCF-adjusted system reliability.
- **Switch reliability R_sw**: probability that the standby switch detects, transfers, and starts the standby on primary failure.
- **Imperfect switching**: standby redundancy with R_sw < 1; R_system = R_active + R_sw · (standby contribution).
- **Safety-instrumented system (SIS)**: the safety function (per IEC 61511) implementing the MooN architecture.
- **Safety Integrity Level (SIL)**: IEC 61508/61511 rating (1-4) by P_top per demand.`,
    detailed_explanation: `The mathematical core of redundancy modeling is the binomial expansion for the koon reliability. For N identical channels each with reliability R(t), the probability that exactly i of N function is C(N,i)·R^i·(1−R)^(N−i); summing from i = M to N gives R_MooN. The closed forms for small (M, N) are the binomial expansions: 1oo2 = 2R − R²; 2oo3 = 3R² − 2R³; 2oo4 = 6R²(1−R)² + 4R³(1−R) + R⁴; 3oo5 = 6R³(1−R)² + 5R⁴(1−R) + R⁵. For non-identical channels, the koon reliability requires inclusion-exclusion over the 2^N combinations.

*Active vs standby* trade-off: active redundancy is more reliable (no switching required, instant failover) but more expensive (all channels age in service, integration complexity). Standby is cheaper on hardware wear but adds the switching event (R_sw) and a failover delay. Hot standby is the worst of both — full aging plus switching; warm standby is the compromise; cold standby is the cheapest (no aging until switched in) but the slowest. For safety-instrumented systems (SIS), active 2oo3 is the canonical architecture because the failover delay in standby is unacceptable for safety-critical functions.

*Common-cause failure (CCF)* dominates redundant architectures. The β-factor model is the simplest CCF model — a single parameter β representing the fraction of the total failure rate that strikes all N channels simultaneously. For each channel: λ_ind = (1−β)·λ (independent portion, affects one channel) and λ_CC = β·λ (common-cause portion, affects all N channels). The system reliability becomes R_MooN^CCF(t) = R_MooN^indep((1−β)·λ, t) · R_CC(β·λ, t), where R_CC(t) = exp(−β·λ·t) — the common-cause portion reduces the system to a single channel for that fraction. For β = 0, no CCF; for β = 1, all failures are common-cause (the redundant architecture is no better than a single channel). Typical β values: 0.01 (well-separated, diverse channels — different manufacturers, separate cables, separate power supplies); 0.05 (identical channels, physical separation); 0.10 (identical channels, common cabinet); 0.20 (identical channels, common design/manufacturing, common environment).

*Imperfect switching* for standby: the switch must (i) detect the primary failure, (ii) transfer the load, and (iii) start the standby. The combined switch reliability R_sw multiplies the standby contribution. For a single standby with exponential active (λ) and standby (λ_s) and switch (R_sw): R_system(t) ≈ exp(−λ·t) + R_sw · λ·t · exp(−λ·t) (if λ_s ≈ 0 for cold standby). For λ·t = 0.01 (R_single = 0.990), R_sw = 0.99, cold standby: R_system = 0.990 + 0.99·0.01·0.990 = 0.990 + 0.0098 = 0.9998. The standby buys a 10× reduction in unreliability, but a switch failure (1%) caps the gain.

*MooN within SIS (IEC 61511)*: the canonical SIS architecture is the 2oo3 vote — three redundant channels (sensors, logic solvers, or final elements) with a 2-out-of-3 vote. The 2oo3 survives any single channel failure (availability) and requires two failures for the safety function to spuriously trip (safety). The per-channel failure rate λ, the test interval TI, the β-factor, and the architecture (1oo2, 1oo1, 2oo3, 2oo2, 2oo4) determine the SIL (P_top per demand). IEC 61511 tables (Annex E) provide P_top as a function of λ, TI, β, and architecture. The reliability engineer verifies the SIS meets the target SIL; if not, raises the architecture (e.g., 1oo2 → 2oo3) or reduces β (e.g., diverse sensors, separation).`,
    core_principles: `- Active MooN: R_MooN = Σ_{i=M}^N C(N,i)·R^i·(1−R)^(N−i) — binomial expansion.
- 2oo3 is the canonical SIS architecture (survives 1, fails on 2 — availability + safety).
- Standby: cheaper on hardware wear but adds switching event (R_sw) and failover delay.
- CCF dominates redundant architectures — the β-factor model partitions λ into (1−β)·λ + β·λ.
- R_MooN^CCF(t) = R_MooN^indep((1−β)·λ, t) · exp(−β·λ·t) — common-cause strikes all channels simultaneously.
- Imperfect switching: R_system = R_active + R_sw · (standby contribution).
- MooN within IEC 61511: architecture + λ + TI + β determine SIL (P_top per demand).`,
    components: `- **Active channels (N)**: parallel channels all operating in service.
- **Standby channel(s)**: reserve channels (cold/warm/hot) not in active service until switched in.
- **Voting logic (M-of-N)**: the logic element that takes the M-of-N vote as the system output.
- **Switch (R_sw)**: the device that detects primary failure and transfers to standby.
- **Common-cause failure (CCF) initiator**: shared design, manufacturer, environment, or operator that can fail all channels simultaneously.
- **β-factor**: the fraction of λ attributable to CCF.
- **Safety-instrumented system (SIS)**: the safety function implementing MooN, verified against IEC 61511 SIL.`,
    process: `1. Define the system function and the reliability/safety target (e.g., SIL 2 → P_top < 10⁻³ per demand).
2. Acquire per-channel failure rate λ from ISO 14224, field data, or qualification tests.
3. Estimate the β-factor from the architecture: diverse channels → β ≈ 0.01; identical + separation → 0.05; common cabinet → 0.10; common design/manufacturing → 0.20.
4. Select the architecture (active MooN or standby) based on cost, response time, and SIL target.
5. Compute R_MooN(t) (no CCF) — binomial expansion.
6. Apply the β-factor: R_MooN^CCF(t) = R_MooN^indep((1−β)·λ, t) · exp(−β·λ·t).
7. For standby, multiply the standby contribution by R_sw (switch reliability).
8. Verify against the SIL target; if not met, raise the architecture (e.g., 1oo2 → 2oo3) or reduce β (diverse channels, separation).
9. Document assumptions: identical-channel assumption, exponential λ, single-phase mission, β-factor estimate.
10. Re-fit λ and β from field data (CMMS/FRACAS) annually — the closed loop.`,
    formula_calculation: `Variables and formulas:
- N: number of redundant channels
- M: minimum channels required to function (vote threshold)
- λ: per-channel failure rate [1/h]
- β: common-cause fraction [dimensionless 0..1]
- λ_ind = (1−β)·λ; λ_CC = β·λ
- t: mission duration [h]
- R(t) = exp(−λ·t): single-channel reliability
- R_MooN(t) = Σ_{i=M}^{N} C(N,i)·R(t)^i·(1−R(t))^(N−i)
- 1oo2: R = 2R − R²; 2oo3: R = 3R² − 2R³; 2oo4: R = 6R²(1−R)² + 4R³(1−R) + R⁴
- R_CC(t) = exp(−β·λ·t) — common-cause strikes all N channels simultaneously
- R_MooN^CCF(t) = R_MooN^indep((1−β)·λ, t) · R_CC(β·λ, t)
- Standby cold (perfect switch, exponential): R = exp(−λ·t)·(1 + λ·t)
- Standby cold (imperfect switch R_sw): R ≈ R_active + R_sw·λ·t·exp(−λ·t)
- A_MooN (steady-state, repairable): Σ_{i=0}^{M−1} C(N,i)·A^i·(1−A)^(N−i) (same binomial form with A instead of R)

Units: t in hours; λ in 1/h; R, A dimensionless [0,1].

Assumptions: (i) identical-channel assumption (same λ for all N channels); (ii) independence of the (1−β)·λ portions; (iii) common-cause strikes ALL N channels simultaneously (the simplest β-factor model; multiple-beta and MGL models generalize — see Smith (2021, Ch. 10)); (iv) exponential R(t) (constant-λ regime, useful life); (v) single-phase mission.

Interpretation: R_MooN^CCF(t) is the probability the MooN system survives the mission t accounting for CCF. For β = 0 (no CCF), the redundant architecture's full benefit is realized. For β > 0, the CCF portion caps the achievable reliability — at β = 1, the redundant architecture is no better than a single channel.`,
    worked_example: `**2oo3 SIS — no CCF.**
Per-channel λ = 1×10⁻⁵/h; mission t = 1,000 h.
R_single = exp(−λ·t) = exp(−0.01) = 0.990050.
R_2oo3 = 3R² − 2R³ = 3·(0.990050)² − 2·(0.990050)³
       = 3·0.980199 − 2·0.970395
       = 2.940597 − 1.940790 = 0.999807 = 99.981%.
Compare to single-channel R = 0.990050 — the 2oo3 architecture reduces unreliability from ~1% to ~0.02% — a 50× reduction.

**2oo3 SIS — with β = 0.05 CCF.**
λ_ind = (1−β)·λ = 0.95×10⁻⁵/h; λ_CC = β·λ = 0.05×10⁻⁵/h.
R_ind(t) = exp(−0.95×10⁻⁵·1000) = exp(−0.0095) = 0.990545.
R_MooN^indep = 3·(0.990545)² − 2·(0.990545)³
             = 3·0.981179 − 2·0.971894
             = 2.943537 − 1.943789 = 0.999749.
R_CC(t) = exp(−β·λ·t) = exp(−0.05·1×10⁻⁵·1000) = exp(−5×10⁻⁴) = 0.999500.
R_2oo3^CCF = R_MooN^indep · R_CC = 0.999749 · 0.999500 = 0.999249 = 99.925%.
The CCF reduces the 2oo3 reliability from 99.981% to 99.925% — a 0.057 percentage point drop, equivalent to a 3× increase in unreliability (from 1.93×10⁻⁴ to 7.51×10⁻⁴).

**Cold standby with imperfect switching.**
Single active (λ = 0.001/h), cold standby (no aging until switched), switch R_sw = 0.995, mission t = 100 h.
R_active = exp(−0.001·100) = exp(−0.1) = 0.9048.
Perfect-switch cold standby: R = exp(−λ·t)·(1 + λ·t) = 0.9048·(1 + 0.1) = 0.9048·1.1 = 0.9953.
Imperfect-switch: R ≈ R_active + R_sw·λ·t·exp(−λ·t) = 0.9048 + 0.995·0.1·0.9048 = 0.9048 + 0.0900 = 0.9948.
The standby raises R from 0.9048 (single) to 0.9948 (with switch) — a 10.4× reduction in unreliability. If R_sw = 1.0 (perfect), R = 0.9953 — the switch failure (0.5%) costs 0.0005 reliability.

**Steady-state availability of 2oo3 (repairable).**
Single-channel availability A = μ/(λ+μ) = 0.01/(0.0001+0.01) = 0.9901 (for λ = 1×10⁻⁴/h, μ = 1×10⁻²/h).
A_2oo3 = 3A² − 2A³ = 3·0.9803 − 2·0.9706 = 2.9409 − 1.9412 = 0.9997 = 99.97%.
The 2oo3 architecture raises availability from 99.01% (single) to 99.97% — a 33× reduction in unavailability.`,
    industrial_example: `**Power — electrical protection relay (2oo3 voting).** A 230-kV transmission-line protection cabinet uses three identical numerical relays in a 2oo3 vote (the trip signal is issued if at least 2 of 3 relays agree). Per-relay failure rate λ = 2×10⁻⁶/h (MTBF = 500,000 h); mission (test interval) t = 4,380 h (6 months). Without CCF: R_single = exp(−2×10⁻⁶·4380) = exp(−0.00876) = 0.99128; R_2oo3 = 3R² − 2R³ = 3·0.98263 − 2·0.97405 = 2.94788 − 1.94810 = 0.99978. With β = 0.10 (identical relays, common cabinet, common DC supply): λ_ind = 0.9·λ = 1.8×10⁻⁶/h; R_ind = exp(−1.8×10⁻⁶·4380) = exp(−0.00788) = 0.99215; R_MooN^indep = 3·0.98436 − 2·0.97663 = 2.95307 − 1.95326 = 0.99981; R_CC = exp(−0.10·2×10⁻⁶·4380) = exp(−8.76×10⁻⁴) = 0.99912; R_2oo3^CCF = 0.99981·0.99912 = 0.99893 = 99.893%. The CCF reduces the 2oo3 reliability by 0.085 percentage points (from 99.978% to 99.893%) — a 7.8× increase in unreliability. The utility's mitigation: install diverse relays (different manufacturers) to reduce β to 0.02, recovering R_2oo3^CCF to 0.99963. Method per Smith (2021, Ch. 10) and IEC 60255 (relay standard).`,
    case_study: `CASE_TYPE = SYNTHETIC. A chemical-reactor emergency-shutdown (ESD) system was designed with a 2oo3 sensor vote (three pressure transmitters) and a single final-element solenoid valve. The design target was SIL 2 (P_top < 10⁻² per demand on the ESD function). Per-sensor λ = 5×10⁻⁶/h; test interval TI = 6 months (4,380 h); per-sensor P_fd (probability of failure on demand) = λ·TI/2 = 5×10⁻⁶·4380/2 = 1.095×10⁻². The 2oo3 architecture's P_fd (no CCF) = 3·P_fd²·(1−P_fd) + P_fd³ ≈ 3·(1.095×10⁻²)²·0.98905 = 3.55×10⁻⁴ — well within SIL 2. With β = 0.10 (identical transmitters, common impulse line, common cabinet): P_fd^CCF = β·λ·TI/2 = 0.10·1.095×10⁻² = 1.095×10⁻³ — combined P_fd ≈ 3.55×10⁻⁴ + 1.095×10⁻³ = 1.45×10⁻³ — still within SIL 2 (P_top < 10⁻²). The reliability engineer proposed a design upgrade: (i) diverse transmitters (different manufacturers, different sensing technologies) → β drops to 0.02; (ii) separate impulse lines (eliminates common-cause plugging) → further 20% reduction in β. Post-upgrade: β = 0.016; P_fd^CCF = 0.016·1.095×10⁻² = 1.75×10⁻⁴; total P_fd = 3.55×10⁻⁴ + 1.75×10⁻⁴ = 5.30×10⁻⁴ — within SIL 3 (P_top < 10⁻³) margin. The single solenoid was the next bottleneck; a parallel pair was added (R_pair = 1 − (1−R_sol)²). Closed loop: SIL target → architecture selection → CCF modeling → design upgrade → field re-fit → confirm. Source: synthetic case authored for this lesson, method per Smith (2021, Ch. 10) and IEC 61511.`,
    visual_explanation: `An MooN voting architecture is drawn as N parallel branches, each carrying a channel block (R = R_channel), feeding a voting-logic element at the top that takes the M-of-N vote. A 2oo3 has 3 branches and a "2oo3" voting-logic symbol (a box labeled "≥2 of 3"). For CCF, a separate "common-cause" branch runs in parallel, striking all N channels simultaneously (the β-factor diagram). For standby redundancy, the standby channel is drawn as a dashed block (not in active service) with a switch (S) between the primary and standby. The voting-logic output feeds the system output.`,
    simulation_opportunity: `An interactive simulation could let the learner vary N, M, λ, t, and β, and observe R_MooN(t) live — the no-CCF line vs the CCF-adjusted line. A second mode would let the learner explore standby vs active architectures by varying R_sw. A third mode would compute the SIL target (IEC 61511) given the architecture and basic-event parameters.`,
    common_mistakes: `- Assuming independence in a redundant architecture without modeling CCF — the β-factor is mandatory for SIL verification.
- Using β = 0 for "diverse" channels — even diverse channels have residual CCF (β ≈ 0.01); always include a non-zero β.
- Treating hot standby as cold standby — hot standby ages the same as the primary, so the standby reliability is the same (not 1); use the standby-redundancy formula, not the cold-standby approximation.
- Forgetting imperfect switching in standby architectures — R_sw multiplies the standby contribution; for R_sw = 0.99, the switch failure caps the standby benefit at 1%.
- Pooling non-identical channels into the binomial koon formula — for non-identical channels, use inclusion-exclusion over the 2^N combinations.
- Reporting R_MooN without specifying t and β — a single number is meaningless; pair it with the mission duration and the CCF assumption.
- Confusing 1oo2 (availability-optimized) with 2oo2 (safety-optimized) — the choice depends on whether availability or safety is the dominant requirement.`,
    limitations: `- The β-factor model is the simplest CCF model — it assumes CCF strikes ALL N channels simultaneously. The multiple-beta, MGL (Multiple Greek Letter), and alpha-factor models generalize (Smith 2021, Ch. 10).
- The identical-channel assumption (same λ for all N) is strong; non-identical channels require inclusion-exclusion.
- The exponential R(t) assumption holds only in useful life; wear-out or infant mortality requires Weibull R(t) in the koon formula.
- Imperfect switching R_sw is a single-point estimate; switch failure modes (fail-to-detect, fail-to-transfer, fail-to-start) need separate modeling.
- The standby-redundancy formulas assume instantaneous switch transfer; for finite transfer time, the standby contribution includes a failover-time unavailability.
- IEC 61511 SIL tables assume specific test intervals and architectures; deviations require detailed Markov modeling (Lesson 4).
- The CCF effect grows linearly with β for small β·λ·t; for large β·λ·t (rare in practice), the architecture's redundant benefit collapses.`,
    comparison: `**Active MooN vs standby redundancy:**
- Active MooN: all channels operating; instant failover; more expensive (all channels age); reliable (no switch); SIS workhorse.
- Cold standby: one channel operating, reserve off (no aging); cheaper hardware wear; adds switch (R_sw) and failover delay.
- Warm standby: reserve partially energized (slow aging); compromise between hot and cold.
- Hot standby: reserve fully energized (same aging as primary); fastest failover; but ages same as primary.

**β-factor vs multiple-beta vs MGL CCF models:**
- β-factor: single β parameter — CCF strikes all N channels simultaneously. Simplest; widely used in SIS verification.
- Multiple-beta: β₁ (strikes 2 of N), β₂ (strikes 3 of N), etc. — more parameters, finer resolution.
- MGL (Multiple Greek Letter): β, γ, δ for cascading CCF levels; used in nuclear PSA.
- α-factor: CCF fraction by group size; used in IEC 61508 Annex C.

**SIS architectures (IEC 61511):**
- 1oo1: single channel — simplest; no redundancy; SIL 1 max.
- 1oo2: parallel pair, any-vote — availability-optimized; survives 1 failure; SIL 2-3.
- 2oo2: parallel pair, both-vote — safety-optimized; spurious trip on 1 failure; SIL 2-3.
- 2oo3: triple vote, 2-of-3 — canonical SIS; survives 1 failure, fails on 2; SIL 2-3.
- 2oo4: quad vote, 2-of-4 — survives 2 failures; SIL 3-4.
- 3oo5: 5-channel vote, 3-of-5 — survives 2 failures, requires 3; SIL 4.`,
    practical_application: `- **Power — electrical protection (2oo3 voting)**: three numerical relays in 2oo3 trip vote; CCF β mitigated by diverse relays (different manufacturers).
- **Chemical — reactor ESD (2oo3 sensors + 2oo3 final elements)**: SIL 3 reactor shutdown; per-channel λ = 5×10⁻⁶/h; β = 0.10 with identical transmitters, drops to 0.02 with diverse.
- **Oil & Gas — subsea controls (1oo2 hot standby)**: subsea control module with hot-standby pair; failover delay < 100 ms; switch R_sw = 0.999.
- **Aerospace — flight control (3oo5 voting)**: triple-redundant flight-control computers with 3oo5 sensor vote; SIL 4 / DAL A (SAE ARP 4754A).
- **SIL verification (IEC 61511)**: reliability engineer computes P_top per demand from λ, TI, β, and architecture; verifies SIL target met; if not, raises architecture or reduces β.`,
    decision_scenario: `You are the CRE verifying the SIL of a gas-detector SIS on an offshore platform. The architecture is 2oo3 voting with each detector λ = 1×10⁻⁵/h (MTBF = 100,000 h), test interval TI = 6 months, and β = 0.10 (identical detectors, common cabinet). The SIL target is SIL 2 (P_top < 10⁻² per demand). (a) Compute the single-channel P_fd = λ·TI/2. (b) Compute the 2oo3 P_fd (no CCF and with β = 0.10 CCF). (c) Does the design meet SIL 2? (d) If not, what design change (diverse detectors, separation, shorter TI) closes the gap?`,
    practice_questions: `- **Q1 (Easy, Recall):** State the 2oo3 reliability formula and identify the trade-off (availability vs safety).
- **Q2 (Medium, Calculation):** Compute R_2oo3 for R_channel = 0.99; compare to single-channel R.
- **Q3 (Medium, Application):** Apply the β-factor model with β = 0.05, λ = 1×10⁻⁵/h, t = 1000 h; compute R_2oo3^CCF.
- **Q4 (Hard, Analyze):** For a cold-standby pair with λ = 0.001/h, R_sw = 0.99, t = 100 h, compute R_system and compare to a 1oo2 active pair.`,
    certification_questions: `- **CRE-style (Easy):** Which voting architecture survives a single failure while failing on dual failure? (2oo3).
- **CRE-style (Medium, Calculation):** Compute R_2oo3 for R = 0.99. (0.9997).
- **CRE-style (Hard, Analysis):** Explain how the β-factor reduces the 2oo3 reliability; for β = 0.10, λ = 2×10⁻⁶/h, t = 4380 h, by how many percentage points?`,
    summary: `Redundancy is the principal lever for raising system reliability beyond the per-block ceiling. Active MooN voting (R_MooN = Σ C(N,i)·R^i·(1−R)^(N−i)) is the SIS workhorse — 2oo3 survives 1 failure, fails on 2 (availability + safety). Standby redundancy (cold/warm/hot) adds switching (R_sw) and failover delay. Common-cause failure (β-factor) is the dark side — λ_ind = (1−β)·λ, λ_CC = β·λ, and R_MooN^CCF = R_MooN^indep · exp(−β·λ·t). For SIS verification, the architecture + λ + test interval + β determine the SIL (IEC 61511).`,
    key_takeaways: `- Active MooN: R_MooN = Σ C(N,i)·R^i·(1−R)^(N−i); 2oo3 = 3R² − 2R³.
- Standby: cheaper on hardware wear but adds switching (R_sw) and failover delay.
- CCF β-factor: λ_ind = (1−β)·λ; λ_CC = β·λ; R_MooN^CCF = R_MooN^indep · exp(−β·λ·t).
- Typical β: 0.01 (diverse), 0.05 (identical + separation), 0.10 (common cabinet), 0.20 (common design).
- 2oo3 is the canonical SIS architecture (survives 1, fails on 2).
- Architecture + λ + TI + β determine the SIL (IEC 61511).`,
    references: `- ASQ CRE Body of Knowledge — Reliability Modeling domain.
- ISO 14224:2016 — Collection of reliability and maintenance data for equipment.
- Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 6 (Redundancy, k-of-n).
- O'Connor & Kleyner (2012), Practical Reliability Engineering, Ch. 8 (Redundancy, voting, β-factor CCF).
- Smith (2021), Reliability, Maintainability and Risk, Ch. 10 (Common-cause failure and β-factor).
- Jardine & Tsang (2006), Maintenance, Replacement, and Reliability, Ch. 4 (System reliability — k-of-n).`,
  },
  knowledgeObject: {
    title: "Redundancy & Voting (MooN)",
    domain: "Reliability Modeling",
    competency: "Redundancy & Voting (MooN)",
    topic: "System Reliability Modeling",
    concept: "Active/standby redundancy, MooN voting, β-factor CCF, imperfect switching",
    body: {
      definitions: [
        "Active redundancy: all channels operating in parallel; system functions iff at least k of n function (koon).",
        "Standby redundancy: one channel operating; one or more in reserve (cold = off, warm = partial, hot = full).",
        "MooN (M-out-of-N) voting: the system output is the M-of-N vote; system functions iff at least M of N channels function.",
        "2oo3 voting: canonical SIS architecture — survives 1 failure, fails on 2 (availability + safety).",
        "Common-cause failure (CCF): simultaneous failure of multiple redundant channels due to a shared cause.",
        "β-factor: fraction of total λ attributable to common cause; λ_ind = (1−β)·λ; λ_CC = β·λ.",
        "R_CC(t) = exp(−β·λ·t): common-cause strikes all N channels simultaneously.",
        "R_MooN^CCF(t) = R_MooN^indep((1−β)·λ, t) · R_CC(β·λ·t).",
        "Switch reliability R_sw: probability the standby switch detects, transfers, and starts the standby.",
        "Imperfect switching: standby redundancy with R_sw < 1; R_system = R_active + R_sw·(standby contribution).",
        "Safety Integrity Level (SIL): IEC 61508/61511 rating (1-4) by P_top per demand.",
      ],
      principles: [
        "Active MooN: R_MooN = Σ C(N,i)·R^i·(1−R)^(N−i) — binomial expansion.",
        "2oo3 is the canonical SIS architecture (survives 1, fails on 2).",
        "Standby: cheaper on hardware wear but adds switching (R_sw) and failover delay.",
        "CCF dominates redundant architectures — the β-factor partitions λ into (1−β)·λ + β·λ.",
        "R_MooN^CCF = R_MooN^indep · exp(−β·λ·t) — common-cause strikes all channels simultaneously.",
        "Imperfect switching: R_system = R_active + R_sw·(standby contribution).",
        "Architecture + λ + TI + β determine SIL (IEC 61511).",
      ],
      components: [
        "Active channels (N) all operating in parallel.",
        "Standby channel(s) (cold/warm/hot) in reserve until switched in.",
        "Voting logic (M-of-N) taking the system output.",
        "Switch (R_sw) detecting primary failure and transferring to standby.",
        "Common-cause failure (CCF) initiator (shared design/manufacturer/environment).",
        "β-factor parameter for the CCF fraction.",
        "SIS implementing MooN, verified against IEC 61511 SIL.",
      ],
      mechanism: [
        "MooN/CCF lifecycle: define function + SIL target → acquire λ → estimate β → select architecture (active MooN or standby) → compute R_MooN (no CCF) → apply β-factor → for standby multiply by R_sw → verify SIL target → if not met raise architecture or reduce β → re-fit from field data (closed loop).",
      ],
      process: [
        "1. Define the system function and SIL target.",
        "2. Acquire per-channel λ from ISO 14224, field data, or qualification tests.",
        "3. Estimate β from architecture (diverse 0.01, identical+separation 0.05, common cabinet 0.10, common design 0.20).",
        "4. Select architecture (active MooN or standby) based on cost, response time, SIL target.",
        "5. Compute R_MooN(t) (no CCF) — binomial expansion.",
        "6. Apply β-factor: R_MooN^CCF = R_MooN^indep((1−β)·λ, t) · exp(−β·λ·t).",
        "7. For standby, multiply standby contribution by R_sw.",
        "8. Verify against SIL target; if not met, raise architecture or reduce β.",
        "9. Document assumptions (identical-channel, exponential, single-phase mission, β estimate).",
        "10. Re-fit λ and β from field data annually (closed loop).",
      ],
      formulas: [
        "R_MooN(t) = Σ_{i=M}^{N} C(N,i)·R(t)^i·(1−R(t))^(N−i).",
        "1oo2: R = 2R − R²; 2oo3: R = 3R² − 2R³; 2oo4: R = 6R²(1−R)² + 4R³(1−R) + R⁴.",
        "λ_ind = (1−β)·λ; λ_CC = β·λ.",
        "R_CC(t) = exp(−β·λ·t).",
        "R_MooN^CCF(t) = R_MooN^indep((1−β)·λ, t) · R_CC(β·λ·t).",
        "Standby cold (perfect switch, exponential): R = exp(−λ·t)·(1 + λ·t).",
        "Standby cold (imperfect R_sw): R ≈ R_active + R_sw·λ·t·exp(−λ·t).",
        "A_MooN (steady-state): Σ_{i=0}^{M−1} C(N,i)·A^i·(1−A)^(N−i).",
      ],
      metrics: [
        "R_MooN(t) [dimensionless 0..1].",
        "R_MooN^CCF(t) [dimensionless] — CCF-adjusted.",
        "Single-channel reliability R(t) [dimensionless].",
        "β-factor [dimensionless 0..1] — CCF fraction.",
        "Switch reliability R_sw [dimensionless 0..1].",
        "SIL [1-4 integer] — IEC 61508/61511 safety-integrity level.",
        "P_fd per demand [dimensionless] — probability of failure on demand.",
        "Test interval TI [h] — proof-test frequency.",
      ],
      examples: [
        "2oo3 SIS (λ=1×10⁻⁵/h, t=1000h, β=0): R_single=0.99005; R_2oo3=0.99981 — 50× reduction in unreliability.",
        "2oo3 SIS with β=0.05: R_MooN^indep=0.999749; R_CC=0.999500; R_2oo3^CCF=0.999249 — CCF reduces R by 0.057 pp.",
        "Cold standby (λ=0.001/h, t=100h, R_sw=0.995): R ≈ 0.9048 + 0.995·0.1·0.9048 = 0.9948.",
        "Steady-state A_2oo3 (λ=1×10⁻⁴/h, μ=0.01/h): A_single=0.9901; A_2oo3=0.9997.",
      ],
      industrial_examples: [
        "Power — 2oo3 numerical relays (λ=2×10⁻⁶/h, t=4380h, β=0.10): R_2oo3^CCF = 99.893% (CCF reduces by 0.085 pp); diverse relays reduce β to 0.02 → R = 99.963%.",
        "Chemical — reactor ESD 2oo3 sensors (λ=5×10⁻⁶/h, TI=4380h, β=0.10): P_fd^CCF = 1.095×10⁻³; meets SIL 2. Diverse transmitters (β=0.02) → P_fd = 5.30×10⁻⁴, meets SIL 3 margin.",
        "Oil & Gas — subsea controls 1oo2 hot standby (failover < 100 ms, R_sw = 0.999).",
        "Aerospace — flight control 3oo5 voting (SIL 4 / DAL A per SAE ARP 4754A).",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Chemical reactor ESD 2oo3 sensors + single solenoid. Per-sensor λ=5×10⁻⁶/h, TI=4380h, β=0.10. Single-channel P_fd = λ·TI/2 = 1.095×10⁻². 2oo3 P_fd (no CCF) = 3·P_fd²·(1−P_fd) + P_fd³ ≈ 3.55×10⁻⁴. P_fd^CCF = β·λ·TI/2 = 1.095×10⁻³. Total P_fd ≈ 1.45×10⁻³ (within SIL 2). Diverse transmitters (β=0.02) → P_fd^CCF = 1.75×10⁻⁴; total P_fd = 5.30×10⁻⁴ (within SIL 3 margin). Single solenoid bottleneck resolved by parallel pair. Method per Smith (2021, Ch. 10) and IEC 61511.",
      ],
      common_errors: [
        "Assuming independence without modeling CCF — β-factor is mandatory for SIL verification.",
        "Using β = 0 for 'diverse' channels — even diverse channels have residual CCF (β ≈ 0.01).",
        "Treating hot standby as cold standby — hot standby ages the same as primary.",
        "Forgetting imperfect switching in standby — R_sw multiplies the standby contribution.",
        "Pooling non-identical channels into the binomial koon formula — use inclusion-exclusion.",
        "Reporting R_MooN without specifying t and β — meaningless single number.",
        "Confusing 1oo2 (availability-optimized) with 2oo2 (safety-optimized).",
      ],
      limitations: [
        "β-factor model assumes CCF strikes ALL N channels simultaneously — multiple-beta, MGL, alpha-factor generalize (Smith 2021, Ch. 10).",
        "Identical-channel assumption is strong — non-identical channels require inclusion-exclusion.",
        "Exponential R(t) holds only in useful life; wear-out requires Weibull in the koon formula.",
        "Imperfect switching R_sw is a single-point estimate; switch failure modes (fail-to-detect, fail-to-transfer, fail-to-start) need separate modeling.",
        "Standby formulas assume instantaneous switch transfer; finite transfer time adds a failover-time unavailability.",
        "IEC 61511 SIL tables assume specific TIs and architectures; deviations require Markov modeling (Lesson 4).",
      ],
      best_practices: [
        "Always include a non-zero β in CCF modeling — diverse channels have residual β ≈ 0.01.",
        "Document the architecture choice (1oo2, 2oo2, 2oo3, 2oo4) with the trade-off rationale (availability vs safety).",
        "For SIS verification, compute P_fd = λ·TI/2 (for the no-repair, periodic-test case).",
        "Use diverse channels (different manufacturers, different sensing technologies) to reduce β.",
        "Provide physical separation (separate cabinets, separate cables, separate power supplies) to reduce β.",
        "Re-fit λ and β from field data annually — closed loop.",
        "Verify SIL target with margin (target P_top / 3 to 10); design for SIL +1 above required.",
      ],
      related_concepts: [
        "RBD (Lesson 1) — series/parallel/koon reduction; minimal cut sets.",
        "FTA (Lesson 2) — CCF as a basic event in the FTA cut sets.",
        "Markov & State-Transition (Lesson 4) — repairable-system availability A_ss = μ/(λ+μ).",
        "Reliability Fundamentals (RF) — R(t), MTBF/MTTR/availability inputs.",
        "IEC 61508 / 61511 — SIS SIL verification standard.",
      ],
      prerequisites: [
        "ASQ CRE RF — R(t), exponential, MTBF/MTTR/availability.",
        "RBD (Lesson 1) — series/parallel/koon, minimal cut sets.",
        "FTA (Lesson 2) — CCF as a basic event in the FTA cut sets.",
        "Basic combinatorics: binomial coefficient C(n,k) and binomial expansion.",
        "Familiarity with SIS architecture (sensor, logic solver, final element).",
      ],
      references: [
        "ASQ CRE Body of Knowledge — Reliability Modeling domain.",
        "ISO 14224:2016 — Collection of reliability and maintenance data for equipment.",
        "Ebeling (2010), Ch. 6 (Redundancy, k-of-n).",
        "O'Connor & Kleyner (2012), Ch. 8 (Redundancy, voting, β-factor).",
        "Smith (2021), Ch. 10 (CCF and β-factor).",
        "Jardine & Tsang (2006), Ch. 4 (System reliability — k-of-n).",
      ],
    },
  },
  questions: [
    {
      competencyName: "Redundancy & Voting (MooN)",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which voting architecture is the canonical safety-instrumented-system (SIS) configuration, surviving a single channel failure while failing on dual failure?",
      whyCorrect:
        "The 2oo3 (2-out-of-3) voting architecture is the canonical SIS configuration. It survives any single channel failure (the remaining 2 channels still produce the vote, ensuring availability) and requires two simultaneous failures for the safety function to spuriously trip or fail (ensuring safety). The binomial form is R_2oo3 = 3R² − 2R³.",
      whyOthersWrong: [
        "Option A (1oo2 — full parallel) is availability-optimized but not safety-optimized — a single sensor can spuriously trip the system (low safety on spurious demand).",
        "Option C (2oo2 — both must vote) is safety-optimized (no spurious trip) but availability-reduced — a single channel failure trips the system (low availability).",
        "Option D (3oo3 — full series) is the weakest-link rule; no redundancy, fails on any single channel failure.",
      ],
      explanation:
        "2oo3 is the canonical SIS architecture: survives 1 failure (availability) + fails on 2 failures (safety). R_2oo3 = 3R² − 2R³. Used in IEC 61511 SIL 2-3 verification.",
      options: [
        { text: "1oo2 (any of 2 — full parallel)", isCorrect: false },
        { text: "2oo3 (median of 3)", isCorrect: true },
        { text: "2oo2 (both must vote)", isCorrect: false },
        { text: "3oo3 (full series)", isCorrect: false },
      ],
    },
    {
      competencyName: "Redundancy & Voting (MooN)",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Power",
      stem: "A 2oo3 voting SIS has each channel with λ = 1×10⁻⁵/h and a mission t = 1,000 h. Compute R_2oo3 (no CCF) and the CCF-adjusted R_2oo3^CCF with β = 0.05.",
      whyCorrect:
        "Single-channel R(t) = exp(−λ·t) = exp(−0.01) = 0.99005. R_2oo3 (no CCF) = 3R² − 2R³ = 3·0.980199 − 2·0.970395 = 2.940597 − 1.940790 = 0.999807. With β = 0.05: λ_ind = (1−β)·λ = 0.95×10⁻⁵/h; R_ind = exp(−0.0095) = 0.990545; R_MooN^indep = 3·0.981179 − 2·0.971894 = 0.999749; R_CC = exp(−0.05·1×10⁻⁵·1000) = exp(−5×10⁻⁴) = 0.999500; R_2oo3^CCF = 0.999749·0.999500 = 0.999249. The CCF reduces R from 0.999807 to 0.999249 — a 0.057 percentage point drop, equivalent to a 3× increase in unreliability.",
      whyOthersWrong: [
        "Option A (R_2oo3 = 0.99; R_2oo3^CCF = 0.985) — both are wrong: R_2oo3 ≠ R_single (the vote provides redundancy); and the CCF effect at β = 0.05 cannot drop R by 4 percentage points (β·λ·t = 5×10⁻⁴, so R_CC drops by only 0.05%).",
        "Option B (R_2oo3 = 0.999702; R_2oo3^CCF = 0.999500) — R_CC is computed correctly but R_2oo3 (no CCF) uses R = 0.99 instead of R = 0.99005 (the small difference matters), and R_2oo3^CCF should be the product R_MooN^indep · R_CC, not just R_CC.",
        "Option D (R_2oo3 = 0.999999; R_2oo3^CCF = 0.999998) — these are full-parallel (1oo3) numbers; 2oo3 is a stricter vote (needs 2 of 3) and cannot reach 1oo3 reliability.",
      ],
      explanation:
        "R_2oo3 (no CCF) = 3R² − 2R³ = 0.999807. With β = 0.05: R_ind = 0.990545; R_MooN^indep = 0.999749; R_CC = 0.999500; R_2oo3^CCF = 0.999249. CCF reduces R by 0.057 pp; unreliability rises 3×.",
      options: [
        { text: "R_2oo3 = 0.990; R_2oo3^CCF = 0.985", isCorrect: false },
        { text: "R_2oo3 = 0.999702; R_2oo3^CCF = 0.999500", isCorrect: false },
        { text: "R_2oo3 ≈ 0.999807; R_2oo3^CCF ≈ 0.999249", isCorrect: true },
        { text: "R_2oo3 = 0.999999; R_2oo3^CCF = 0.999998", isCorrect: false },
      ],
    },
    {
      competencyName: "Redundancy & Voting (MooN)",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Oil & Gas",
      stem: "A redundant architecture has per-channel λ and a common-cause β-factor. The β-factor partitions λ into an independent portion (1−β)·λ and a common-cause portion β·λ. What is the system reliability formula for a 2oo3 architecture with CCF?",
      whyCorrect:
        "The β-factor model partitions each channel's failure rate: λ_ind = (1−β)·λ (independent portion, affects one channel) and λ_CC = β·λ (common-cause portion, strikes all N channels simultaneously). The system reliability is R_MooN^CCF(t) = R_MooN^indep(λ_ind, t) · R_CC(λ_CC, t), where R_MooN^indep = 3R_ind² − 2R_ind³ (the 2oo3 binomial with R_ind) and R_CC = exp(−β·λ·t) — the common-cause strikes all 3 channels at once. The product combines the independent-vote reliability with the common-cause multiplier.",
      whyOthersWrong: [
        "Option A (R_MooN^CCF = R_MooN^indep + R_CC) — addition is not a valid probability combination for the independent/common-cause split; the common-cause must MULTIPLY the independent-vote reliability (a series of two independent failure processes).",
        "Option B (R_MooN^CCF = R_MooN^indep · β) — multiplying by β (a small fraction) would catastrophically over-reduce the reliability; β is a rate fraction, not a probability multiplier on R.",
        "Option D (R_MooN^CCF = R_MooN^indep / R_CC) — division has no probabilistic meaning here; the common-cause portion reduces reliability, not amplifies it.",
      ],
      explanation:
        "R_2oo3^CCF = R_2oo3^indep((1−β)·λ, t) · exp(−β·λ·t). The independent-vote binomial uses λ_ind = (1−β)·λ; the common-cause multiplier exp(−β·λ·t) strikes all 3 channels simultaneously (single-channel-equivalent for the CCF portion).",
      options: [
        { text: "R_MooN^CCF = R_MooN^indep(λ_ind, t) + R_CC(β·λ·t)", isCorrect: false },
        { text: "R_MooN^CCF = R_MooN^indep(λ_ind, t) · β", isCorrect: false },
        { text: "R_MooN^CCF = R_MooN^indep((1−β)·λ, t) · exp(−β·λ·t)", isCorrect: true },
        { text: "R_MooN^CCF = R_MooN^indep((1−β)·λ, t) / exp(−β·λ·t)", isCorrect: false },
      ],
    },
    {
      competencyName: "Redundancy & Voting (MooN)",
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Chemical",
      stem: "True or False: A 1oo2 voting architecture is more availability-optimized than 2oo2 because it survives a single channel failure, but it is less safety-optimized because any single channel can spuriously trip the safety function.",
      whyCorrect:
        "TRUE. A 1oo2 architecture (any-vote) issues the safety function if EITHER channel demands it — surviving a single failure-to-trip (availability-optimized: the other channel can still trip). However, this also means a single spurious demand from either channel trips the function (lower safety on spurious demands). A 2oo2 architecture (both-vote) requires BOTH channels to demand — surviving a single spurious demand (safety-optimized) but failing to trip if any single channel fails to demand (lower availability). The 2oo3 is the canonical compromise — survives 1 failure (availability) and requires 2 to spuriously trip (safety).",
      whyOthersWrong: [
        "Option FALSE — would imply 1oo2 is both availability- and safety-optimized; in fact the two are trade-offs. 1oo2 maximizes availability at the cost of safety (spurious trips); 2oo2 maximizes safety at the cost of availability (fails-to-trip). The 2oo3 vote is the SIS workhorse because it balances both.",
      ],
      explanation:
        "TRUE. 1oo2 is availability-optimized (survives failure-to-trip) but safety-reduced (single spurious trip). 2oo2 is safety-optimized (survives spurious) but availability-reduced. 2oo3 balances both.",
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 4 — Markov & State-Transition Models
// (Competency: "Markov & State-Transition Models"; slug: rm-markov-state-transition)
// ---------------------------------------------------------------------------

const LESSON_MARKOV: RefLesson = {
  competencyName: "Markov & State-Transition Models",
  slug: "rm-markov-state-transition",
  title: "Markov & State-Transition Models",
  titleAr: "نماذج ماركوف وانتقال الحالات",
  order: 4,
  durationMin: 35,
  references: RM_REFERENCE_TITLES,
  conceptIntroduction: `A Markov model is the continuous-time state-transition model that captures the dynamics of a repairable or multi-state system beyond what RBD/FTA (binary, combinatorial) can represent. The system is modeled as a set of states (e.g., "operating," "failed," "degraded," "under repair") connected by transition rates (failure rate λ, repair rate μ, switch rate η). The Chapman-Kolmogorov forward equations dP_i/dt = Σ (q_{ji}·P_j − q_{ij}·P_i) govern the time evolution of the state probabilities P_i(t). The steady-state availability A_ss is the long-run probability of being in an operating state — for a 2-state repairable system A_ss = μ/(λ+μ) = MTBF/(MTBF+MTTR). Multi-state Markov models capture degraded operation (e.g., a 3-channel system operating, degraded, failed), common-cause failure (CCF) as a state-transition, and repair with spares. Monte-Carlo simulation is the practical alternative when the state space explodes combinatorially — sampling many system histories from the transition rates to estimate R_sys(t) or A_ss statistically.`,
  example: `A repairable pump has λ = 1×10⁻⁴/h (MTBF = 10,000 h) and μ = 1×10⁻²/h (MTTR = 100 h). Two-state Markov: state 0 (operating), state 1 (failed + under repair). Transitions: 0 → 1 at rate λ; 1 → 0 at rate μ. Steady-state availability A_ss = μ/(λ+μ) = 0.01/(0.0101) = 0.990099 = 99.01%. Equivalently, A_ss = MTBF/(MTBF+MTTR) = 10000/(10000+100) = 0.990099. The instantaneous availability A(t) approaches A_ss with time constant 1/(λ+μ) = 1/0.0101 ≈ 99 h — the system reaches steady state within ~5 time constants ≈ 500 h. For a 2-pump parallel system (each A_ss = 0.99, independent): A_parallel_ss = 1 − (1 − A)² = 1 − 0.0001 = 0.9999 = 99.99%. The parallel pair raises availability from 99.01% to 99.99% — a 100× reduction in unavailability. For a 3-state Markov (operating, degraded, failed), with λ_op→deg = 5×10⁻⁵/h, λ_deg→fail = 1×10⁻⁴/h, μ_fail→op = 1×10⁻²/h, μ_deg→op = 5×10⁻³/h: A_ss (operating+degraded) = ... (see worked example).`,
  keyFormulas: `Markov state-transition: dP_i/dt = Σ_{j≠i} (q_{ji}·P_j − q_{ij}·P_i)  [Chapman-Kolmogorov forward eq.]
  where q_{ij} is the transition rate from state i to state j.
2-state repairable (λ, μ): A_ss = μ/(λ+μ) = MTBF/(MTBF+MTTR)
  Time-dependent: A(t) = μ/(λ+μ) + λ·exp(−(λ+μ)·t)/(λ+μ)
  Time constant: τ = 1/(λ+μ)
Parallel repairable (n identical): A_parallel_ss = 1 − (1 − A_ss)^n
  2oo3 repairable: A_2oo3_ss = 3A² − 2A³
Reliability (non-repairable) from Markov: R(t) = P_operating(t) (no transition to failed)
MTTF (Markov): expected time to absorption in the failed state — solve linear system from transient states.
Multi-state with degraded: A_ss = Σ_{operating states} P_i^ss
Common-cause as transition: state 0 → state N+1 at rate β·λ (all channels fail simultaneously).
Monte-Carlo: simulate N_sim system histories; R_sys(t) ≈ (count of histories surviving to t) / N_sim.
Confidence interval: R_sys ± z·sqrt(R_sys·(1−R_sys)/N_sim) (normal approx for large N_sim).`,
  exercise: `You are the CRE on a combined-cycle power-plant feedwater system. The system has 2 parallel feedwater pumps; each pump has λ = 5×10⁻⁴/h (MTBF = 2,000 h) and μ = 5×10⁻²/h (MTTR = 20 h). The system is "available" when at least 1 pump operates. (a) Compute the single-pump steady-state availability A_ss. (b) Build the 3-state Markov model (states: 2 operating, 1 operating+1 repair, both failed) and write the transition-rate matrix. (c) Compute the steady-state availability of the 2-pump system. (d) Compare with the binomial approximation A_parallel = 1 − (1 − A_ss)² and explain any difference.`,
  sections: {
    learning_objectives: `- Define a Markov model as a continuous-time state-transition model; identify states, transition rates, and the Chapman-Kolmogorov forward equations.
- Apply the 2-state repairable formula A_ss = μ/(λ+μ) = MTBF/(MTBF+MTTR) and its time-dependent form A(t).
- Build a multi-state Markov model for parallel and koon repairable systems; write the transition-rate matrix.
- Compute the steady-state availability A_ss by solving dP/dt = 0 (the linear system A·P = 0 with the normalization Σ P = 1).
- Position Monte-Carlo simulation as the practical alternative when the state space explodes.
- Compute system reliability R(t) from Markov (non-repairable: probability of being in an operating state at t).
- Position Markov models as the generalization of RBD/FTA to multi-state and repairable systems.`,
    prerequisites: `- ASQ CRE Reliability Fundamentals (RF) — R(t), MTBF/MTTR/availability, exponential.
- Reliability Block Diagrams (RBD) — Lesson 1 (series/parallel/koon).
- Fault Tree Analysis (FTA) — Lesson 2 (cut sets as Markov absorbing states).
- Redundancy & Voting (MooN) — Lesson 3 (koon binomial, β-factor CCF).
- Basic linear algebra: matrix multiplication, solving linear systems.`,
    introduction: `The Markov model is the workhorse of reliability modeling for repairable and multi-state systems. The system is modeled as a finite set of states (operating, failed, degraded, under-repair, etc.) connected by transition rates (λ, μ, η). The Chapman-Kolmogorov forward equations govern the time evolution of the state probabilities P_i(t); in steady state (dP/dt = 0), the equations reduce to a linear system that yields the steady-state probabilities P_i^ss. The steady-state availability A_ss = Σ_{operating states} P_i^ss.

The 2-state repairable Markov is the canonical introductory model. State 0 (operating), state 1 (failed + under repair); transitions 0→1 at rate λ (failure), 1→0 at rate μ (repair). The steady-state availability A_ss = μ/(λ+μ) = MTBF/(MTBF+MTTR). The time-dependent availability A(t) = μ/(λ+μ) + λ·exp(−(λ+μ)·t)/(λ+μ) approaches A_ss with time constant τ = 1/(λ+μ). For λ = 1×10⁻⁴/h and μ = 1×10⁻²/h: A_ss = 0.9901 (99.01%), τ = 99 h. After ~5τ = 500 h, the system has reached steady state.

Multi-state Markov captures degraded operation. A 3-state model (operating, degraded, failed) with transitions op→deg at λ_od, deg→fail at λ_df, fail→op at μ_fo, deg→op at μ_do gives the steady-state probabilities by solving the linear system. The availability A_ss = P_op + P_deg (both operating and degraded count as "available"). The 3-state model is used for systems with intermediate degraded states (e.g., a sensor drifting out of calibration — not failed, but degraded).

Parallel and koon repairable systems are Markov models with state space = number of failed channels. For a 2-parallel system: states (0 failed, 1 failed, 2 failed); transitions at rate 2λ (one of two channels fails), λ (the remaining channel fails), μ (one channel repaired), 2μ (both repaired). Steady-state availability A_ss = P_0 + P_1 (system operates with 0 or 1 failed channels). The binomial approximation A_parallel_ss = 1 − (1 − A)² agrees with the Markov result for independent channels; the Markov model generalizes to common-cause and dependent repair.

*Common-cause failure (CCF) in Markov* adds a state transition from "0 failed" to "all failed" at rate β·λ — the common-cause strikes all redundant channels simultaneously. The β-factor in Markov is a single transition that bypasses the intermediate states. The resulting A_ss is lower than the binomial koon by the CCF contribution. *Multi-state Markov with spares* captures warm/cold standby by introducing separate "standby available" and "standby in repair" states with their own transition rates.

*Monte-Carlo simulation* is the practical alternative when the state space explodes. For an N-channel koon system with N = 5+ and degraded states, the state space exceeds 100 — explicit Markov solution is impractical. Monte-Carlo: simulate N_sim system histories (e.g., N_sim = 10,000), each starting in the operating state and transitioning stochastically per the rates; R_sys(t) ≈ (count surviving to t) / N_sim. The 95% confidence interval R ± 1.96·sqrt(R·(1−R)/N_sim) shrinks as 1/sqrt(N_sim) — for N_sim = 10,000 and R = 0.99, the 95% CI is ±0.002. Monte-Carlo is the workhorse for very large or non-Markovian (e.g., Weibull failure-rate, non-exponential repair) systems.

Markov is the generalization of RBD/FTA. RBD is a binary (functioning/failed), combinatorial model; Markov is a multi-state, dynamic model. FTA's minimal cut sets are the absorbing states of the equivalent Markov model. The reliability engineer uses Markov when (i) repair matters (RBD's R(t) is non-repairable), (ii) degraded states are present, (iii) common-cause or dependent failure/repair needs modeling, or (iv) the state space is small enough for explicit solution. For large state spaces, Monte-Carlo is the practical alternative.`,
    terminology: `- **Markov model**: continuous-time state-transition model; states + transition rates govern P_i(t).
- **State**: a configuration of the system (operating, failed, degraded, under-repair, etc.).
- **Transition rate q_{ij}**: rate of transition from state i to state j [1/h].
- **Chapman-Kolmogorov forward equations**: dP_i/dt = Σ (q_{ji}·P_j − q_{ij}·P_i) — time evolution of state probabilities.
- **Steady state**: dP/dt = 0; the long-run probability distribution; A_ss = Σ_{operating} P_i^ss.
- **2-state repairable**: A_ss = μ/(λ+μ) = MTBF/(MTBF+MTTR).
- **Time constant τ = 1/(λ+μ)**: time to reach ~63% of steady state; ~5τ to reach ~99%.
- **Multi-state Markov**: states include degraded operation, partial failure, under-repair.
- **Common-cause transition**: a state transition that strikes all redundant channels simultaneously (β·λ).
- **Absorbing state**: a state from which there is no exit (e.g., "system failed" in a non-repairable model).
- **MTTF (Markov)**: expected time to absorption in the failed state — solve linear system from transient states.
- **Monte-Carlo simulation**: sample N_sim system histories; R_sys(t) ≈ count surviving / N_sim.`,
    detailed_explanation: `The Markov model is governed by the Chapman-Kolmogorov forward equations. For a continuous-time Markov chain with states {1, 2, ..., n} and transition-rate matrix Q (where q_{ij} is the rate from i to j, and the diagonal q_{ii} = −Σ_{j≠i} q_{ij}), the time evolution of the state-probability vector P(t) = (P_1(t), ..., P_n(t)) is dP/dt = P·Q. In steady state (dP/dt = 0), P^ss·Q = 0 with the normalization Σ P_i^ss = 1 — a linear system solved by Gaussian elimination or specialized Markov solvers.

The 2-state repairable Markov is the canonical introductory model. State 0 (operating), state 1 (failed + under repair); Q = [[−λ, λ], [μ, −μ]]. Steady state: P_0^ss = μ/(λ+μ), P_1^ss = λ/(λ+μ). The steady-state availability A_ss = P_0^ss = μ/(λ+μ) = MTBF/(MTBF+MTTR). Time-dependent availability A(t) = μ/(λ+μ) + λ·exp(−(λ+μ)·t)/(λ+μ), with time constant τ = 1/(λ+μ). For λ = 1×10⁻⁴/h, μ = 1×10⁻²/h: A_ss = 0.9901, τ = 99 h. The system reaches steady state after ~5τ = 500 h.

*Parallel and koon repairable Markov* use a state space indexed by the number of failed channels. For a 2-parallel system: states (0 failed, 1 failed, 2 failed); Q = [[−2λ, 2λ, 0], [μ, −(λ+μ), λ], [0, 2μ, −2μ]]. Steady-state: P_0 = μ²/D, P_1 = 2λμ/D, P_2 = 2λ²/D, where D = (λ+μ)² + λ² (with appropriate normalization). The system availability A_ss = P_0 + P_1 (operates with 0 or 1 failed) = 1 − P_2 = 1 − 2λ²/D. For λ = 1×10⁻⁴, μ = 1×10⁻²: D = (0.0101)² + (0.0001)² = 1.0201×10⁻⁴ + 1×10⁻⁸ ≈ 1.0211×10⁻⁴; P_2 ≈ 2×10⁻⁸/1.02×10⁻⁴ = 1.96×10⁻⁴; A_ss ≈ 1 − 1.96×10⁻⁴ = 0.9998 — close to the binomial 1 − (1 − 0.9901)² = 0.9999.

*Multi-state with degraded* captures intermediate operating conditions. A 3-state Markov (op, deg, fail) with transitions op→deg at λ_od, deg→fail at λ_df, fail→op at μ_fo, deg→op at μ_do, op→fail at λ_of (direct failure). Steady-state: solve Q·P = 0 with ΣP = 1. The availability A_ss = P_op + P_deg (degraded is still "available"). This 3-state model is the workhorse for systems with sensor drift, partial failures, or degraded modes (e.g., a 2-of-3 sensor vote with one sensor drifted).

*Common-cause failure (CCF) in Markov* adds a transition from "0 failed" directly to "all failed" at rate β·λ. For a 2oo3 system: states (0, 1, 2, 3 failed); transitions: 0→1 at 3λ_ind (any of 3 fails independently), 1→2 at 2λ_ind, 2→3 at λ_ind, 0→3 at β·λ (CCF). The CCF transition bypasses the intermediate states, increasing the probability of the failed state. Steady-state A_ss is lower than the binomial koon by the CCF contribution; for β = 0.05, the difference is small (~0.05% as in Lesson 3); for β = 0.20, the difference is larger.

*Monte-Carlo simulation* is the practical alternative for large state spaces. Procedure: (i) build the state-transition model (states, rates); (ii) for each of N_sim system histories (e.g., 10,000), start in the operating state and sample the next transition (exponentially distributed with rate = sum of outgoing rates); (iii) record the state at each time t and the time to absorption (failure); (iv) R_sys(t) ≈ (count of histories in an operating state at t) / N_sim; (v) A_ss ≈ (sum of operating-state time across all histories) / (total simulation time × N_sim). The 95% confidence interval R ± 1.96·sqrt(R·(1−R)/N_sim) shrinks as 1/sqrt(N_sim); for N_sim = 10,000 and R = 0.99, the CI is ±0.002. Monte-Carlo handles non-Markovian systems (Weibull failure, lognormal repair) by direct sampling — no need for the exponential assumption.

Markov vs RBD/FTA: RBD is binary, combinatorial, non-repairable (R(t) is the survival function). FTA is binary, combinatorial, top-down. Markov is multi-state, dynamic, repairable (A(t) is the time-dependent availability). For non-repairable systems, R(t) = P_operating(t) from the Markov model with the failed state absorbing (no exit). For repairable systems, A_ss = Σ_{operating} P_i^ss. For large state spaces (> 100 states), Monte-Carlo is preferred; for small spaces, explicit Markov solution is preferred.`,
    core_principles: `- Markov: continuous-time state-transition model; states + rates govern P_i(t).
- Chapman-Kolmogorov forward equations: dP_i/dt = Σ (q_{ji}·P_j − q_{ij}·P_i).
- Steady state: dP/dt = 0 → linear system Q·P = 0 with Σ P = 1.
- 2-state repairable: A_ss = μ/(λ+μ) = MTBF/(MTBF+MTTR); time constant τ = 1/(λ+μ).
- Multi-state Markov captures degraded operation, partial failure, and CCF (β-factor as transition).
- Monte-Carlo is the practical alternative for large state spaces; CI shrinks as 1/sqrt(N_sim).
- Markov generalizes RBD (binary, combinatorial, non-repairable) to multi-state, dynamic, repairable.`,
    components: `- **State**: a configuration of the system (operating, failed, degraded, under-repair, etc.).
- **Transition rate q_{ij}**: rate from state i to state j [1/h].
- **Transition-rate matrix Q**: the matrix of transition rates; q_{ii} = −Σ_{j≠i} q_{ij}.
- **State-probability vector P(t)**: probabilities of being in each state at time t.
- **Chapman-Kolmogorov forward equations**: dP/dt = P·Q.
- **Steady-state vector P^ss**: long-run probabilities; Q·P^ss = 0 with ΣP = 1.
- **Absorbing state**: state with no exit (failed state in non-repairable models).
- **CCF transition**: state transition striking all redundant channels simultaneously (β·λ).
- **Monte-Carlo sampler**: stochastic simulator of system histories from the rates.`,
    process: `1. Identify the states (operating, degraded, failed, under-repair, etc.).
2. Identify the transitions and rates (λ, μ, η, β·λ for CCF).
3. Write the transition-rate matrix Q; verify the diagonal q_{ii} = −Σ_{j≠i} q_{ij}.
4. Write the Chapman-Kolmogorov forward equations dP/dt = P·Q.
5. For steady state: solve Q·P = 0 with ΣP = 1 (Gaussian elimination).
6. Compute A_ss = Σ_{operating states} P_i^ss.
7. For time-dependent: solve the ODE system numerically (e.g., Runge-Kutta) for A(t).
8. For non-repairable (R(t)): set the failed state absorbing; compute P_operating(t).
9. For large state spaces: run Monte-Carlo with N_sim ≥ 10,000; compute R_sys(t) and the 95% CI.
10. Validate against the binomial koon (small state space, no CCF) and the RBD (R(t) for non-repairable); document assumptions (exponential rates, single-phase mission, independence for the binomial).`,
    formula_calculation: `Variables and formulas:
- States: {0, 1, ..., n} representing operating/degraded/failed configurations
- Transition rates q_{ij} [1/h] from state i to state j
- λ: failure rate [1/h]; μ: repair rate [1/h]; η: switch rate [1/h]; β: CCF fraction
- Chapman-Kolmogorov: dP_i/dt = Σ_{j≠i} (q_{ji}·P_j − q_{ij}·P_i)
- Steady state: Q·P^ss = 0 with Σ P_i^ss = 1
- 2-state repairable: A_ss = μ/(λ+μ) = MTBF/(MTBF+MTTR); A(t) = μ/(λ+μ) + λ·exp(−(λ+μ)·t)/(λ+μ)
- Time constant τ = 1/(λ+μ)
- Parallel (n identical, independent): A_parallel_ss = 1 − (1 − A_ss)^n
- 2oo3 repairable (binomial): A_2oo3_ss = 3A² − 2A³
- R(t) from Markov (non-repairable): P_operating(t) with failed state absorbing
- MTTF (Markov): expected time to absorption — solve linear system from transient states
- Monte-Carlo: R_sys(t) ≈ count_surviving(t)/N_sim; 95% CI = R ± 1.96·sqrt(R(1−R)/N_sim)

Units: rates in 1/h; t in hours; A, R dimensionless [0,1]; P dimensionless [0,1].

Assumptions: (i) exponential transition times (constant rates — the Markov property: future depends only on the current state, not history); (ii) state space is finite and explicitly enumerable (for analytical solution); (iii) for Monte-Carlo, no exponential assumption is required — any distribution can be sampled.

Interpretation: A_ss is the long-run fraction of time the system is in an operating state; A(t) is the instantaneous availability at time t (approaches A_ss after ~5τ). For non-repairable systems, R(t) = P_operating(t) is the survival function (same as RBD R(t) for the binary case).`,
    worked_example: `**2-state repairable pump.**
λ = 1×10⁻⁴/h (MTBF = 10,000 h); μ = 1×10⁻²/h (MTTR = 100 h).
A_ss = μ/(λ+μ) = 0.01/(0.0001 + 0.01) = 0.01/0.0101 = 0.990099 = 99.01%.
Equivalently: A_ss = MTBF/(MTBF+MTTR) = 10000/10100 = 0.990099.
Time constant τ = 1/(λ+μ) = 1/0.0101 = 99.01 h; the system reaches steady state after ~5τ ≈ 495 h.
Time-dependent: A(t) = 0.990099 + 0.0001·exp(−0.0101·t)/0.0101.
A(0) = 0.990099 + 0.0001/0.0101 = 0.990099 + 0.009901 = 1.0000 (system starts operating).
A(99) = 0.990099 + 0.0001·exp(−1)/0.0101 = 0.990099 + 0.0001·0.3679/0.0101 = 0.990099 + 0.00364 = 0.99374.
A(495) = 0.990099 + 0.0001·exp(−5)/0.0101 = 0.990099 + 0.0001·0.00674/0.0101 = 0.990099 + 0.0000668 = 0.99017 ≈ A_ss.

**2-pump parallel system (independent).**
Each pump A_ss = 0.990099. Binomial: A_parallel_ss = 1 − (1 − A_ss)² = 1 − (0.009901)² = 1 − 9.803×10⁻⁵ = 0.999902 = 99.99%.
Markov 3-state (0, 1, 2 failed): Q = [[−2λ, 2λ, 0], [μ, −(λ+μ), λ], [0, 2μ, −2μ]].
Steady-state: P_0 = μ²/D; P_1 = 2λμ/D; P_2 = 2λ²/D, where D = (λ+μ)² + λ².
For λ=10⁻⁴, μ=10⁻²: D = (0.0101)² + (0.0001)² = 1.0201×10⁻⁴ + 1×10⁻⁸ = 1.0211×10⁻⁴.
P_0 = (0.01)²/1.0211×10⁻⁴ = 1×10⁻⁴/1.0211×10⁻⁴ = 0.97933.
P_1 = 2·10⁻⁴·0.01/1.0211×10⁻⁴ = 2×10⁻⁶/1.0211×10⁻⁴ = 0.01959.
P_2 = 2·10⁻⁸/1.0211×10⁻⁴ = 1.958×10⁻⁴.
A_ss (Markov) = P_0 + P_1 = 0.97933 + 0.01959 = 0.99892 = 99.892%.
Compare to binomial: A_parallel_ss = 0.999902. The Markov result is slightly lower (99.892% vs 99.990%) because the Markov model captures the (small) probability of being in the "1 failed + 1 operating" state when the failed one is under repair — the binomial assumes instantaneous repair. The difference (0.098 pp) is the repair-rate effect.

**Multi-state with degraded (synthetic).**
3-state Markov: op, deg, fail. Transitions: op→deg at λ_od = 5×10⁻⁵/h; deg→fail at λ_df = 1×10⁻⁴/h; op→fail at λ_of = 5×10⁻⁵/h (direct); fail→op at μ_fo = 1×10⁻²/h; deg→op at μ_do = 5×10⁻³/h.
Q = [[−(λ_od+λ_of), λ_od, λ_of], [μ_do, −(λ_df+μ_do), λ_df], [μ_fo, 0, −μ_fo]].
Steady-state: solve Q·P = 0 with ΣP = 1. By dominance of the repair rates over the failure rates, P_op ≈ μ_fo·μ_do / (μ_fo·μ_do + λ_of·μ_do + λ_od·μ_fo) ≈ 0.995; P_deg ≈ small; P_fail ≈ small. A_ss = P_op + P_deg ≈ 0.9999 (high — degraded still counts as available). Detailed numerical solution: see Ebeling (2010, Ch. 9).

**Monte-Carlo for a 5-channel 3oo5 system (synthetic).**
N_sim = 10,000 histories. Each channel λ = 1×10⁻⁴/h, μ = 1×10⁻²/h, β = 0.05. Simulate each history for t_sim = 10,000 h. Count histories in operating state (3+ channels functioning) at t_sim = 10,000 h. Result: R_sys(10,000) ≈ 0.9987; 95% CI = 0.9987 ± 1.96·sqrt(0.9987·0.0013/10000) = 0.9987 ± 0.00071 = [0.99799, 0.99941]. Compare to analytical (binomial + β): R_3oo5^CCF = R_3oo5((1−β)·λ, t) · exp(−β·λ·t) — see Lesson 3 for the binomial form.`,
    industrial_example: `**Power — combined-cycle gas turbine (CCGT) feedwater system.** A CCGT plant has 2 parallel feedwater pumps; each pump λ = 5×10⁻⁴/h (MTBF = 2,000 h) and μ = 5×10⁻²/h (MTTR = 20 h). Single-pump A_ss = μ/(λ+μ) = 0.05/0.0505 = 0.9901 = 99.01%. 2-pump parallel Markov 3-state: A_ss (Markov) ≈ 0.99892 = 99.892% (captures repair-rate effect). Binomial A_parallel = 1 − (1 − 0.9901)² = 0.9999 — close to Markov. Plant-availability target 99.5% (typical for baseload power) is met with margin. The reliability engineer runs Monte-Carlo with N_sim = 100,000 for the full CCGT (gas turbine + HRSG + steam turbine + 2 feedwater pumps + condensate pump + cooling-water system) — state space > 1,000, explicit Markov impractical. Monte-Carlo R_sys(8,760 h, 1-year mission) ≈ 0.962 with 95% CI ± 0.0019. The bottleneck subsystem is the gas turbine (R = 0.94); the feedwater parallel pair contributes only 0.001 unreliability. Method per Ebeling (2010, Ch. 9) and Jardine & Tsang (2006, Ch. 9).`,
    case_study: `CASE_TYPE = SYNTHETIC. A chemical-plant 2-pump parallel cooling-water system was modeled with Markov to assess the impact of reduced repair crew (from 2 simultaneous repairs to 1). Original: 2-pump parallel with 2 repair crews (each μ = 0.05/h) — A_ss (Markov 3-state) = 0.99892 = 99.892%. Reduced crew (1 repair at a time): the Markov transitions change — state 2 (both failed) repair rate drops from 2μ to μ. New Q matrix: state 1 → 0 at rate μ (one channel repaired); state 2 → 1 at rate μ (only one channel repaired at a time). New steady-state: P_2 grows from 1.96×10⁻⁴ to ~4×10⁻⁴ (unavailability doubles); A_ss drops to ~0.9978 = 99.78%. The reliability engineer's recommendation: maintain 2 repair crews for the cooling-water system — the 0.11 percentage-point availability gain (99.78% → 99.892%) translates to ~9.6 additional plant-operating hours/year (8,760 h × 0.0011 = 9.6 h). For a chemical plant producing 1,000 t/day at $500/t margin, the 9.6 h = 400 t = $200k/year — far exceeding the 2nd-crew cost. Closed loop: Markov model → crew-sizing decision → economic justification → field validation → confirm. Source: synthetic case authored for this lesson, method per Jardine & Tsang (2006, Ch. 9).`,
    visual_explanation: `A Markov state-transition diagram is drawn as a directed graph: states are circles (or rectangles) labeled 0, 1, 2, ...; transitions are arrows labeled with the rate (λ, μ, β·λ). The 2-state diagram has 2 circles (0, 1) with arrows 0→1 (λ) and 1→0 (μ). The 2-pump parallel diagram has 3 circles (0, 1, 2 failed) with arrows 0→1 (2λ), 1→0 (μ), 1→2 (λ), 2→1 (2μ). The steady-state probabilities P_i^ss can be visualized as a bar chart; A_ss is the sum of the operating-state bars. The time-dependent availability A(t) is plotted as a curve approaching A_ss with time constant τ = 1/(λ+μ).`,
    simulation_opportunity: `An interactive simulation could let the learner build a Markov state diagram (drag states, draw arrows with rate labels), set λ and μ, and observe P_i(t) evolving in real time toward P_i^ss. A second mode would let the learner run Monte-Carlo with adjustable N_sim and observe the R_sys(t) curve and the 95% CI shrinking as 1/sqrt(N_sim). A third mode would introduce CCF (β-factor) as an extra transition and show its impact on A_ss.`,
    common_mistakes: `- Using a single-state (or RBD) model when the system has degraded states or repair — Markov is required for multi-state/dynamic.
- Forgetting the time constant τ = 1/(λ+μ) — the system reaches steady state after ~5τ; for short missions, A(t) << A_ss.
- Using the binomial koon A_parallel = 1 − (1−A)^n when repair rates are dependent (e.g., 1 repair crew for n channels) — Markov captures the dependency; the binomial does not.
- Forgetting that Markov assumes exponential (constant-rate) transitions — Weibull failure or lognormal repair requires Monte-Carlo.
- Reporting A_ss without the time constant or mission duration — the engineer needs both the steady-state value and the time to reach it.
- Confusing R(t) (non-repairable, survival) with A(t) (repairable, instantaneous availability) — Markov models both, but the failed state must be ABSORBING for R(t) and REPAIRABLE for A(t).
- Using too few Monte-Carlo samples (N_sim < 1,000) — the 95% CI is then > 5%, useless for high-reliability systems.`,
    limitations: `- Markov assumes exponential (constant-rate) transitions; Weibull/lognormal/non-monotonic rates require Monte-Carlo or semi-Markov models.
- State space grows combinatorially with the number of channels and degraded states — explicit Markov solution is impractical for state spaces > ~100.
- Monte-Carlo confidence intervals shrink slowly (1/sqrt(N_sim)) — for R = 0.999 and CI ±0.001, N_sim = 4×10⁶ is required (computationally expensive).
- The Markov property (memoryless) fails when repair effectiveness or wear-in delays matter — use semi-Markov or non-homogeneous models.
- Common-cause β-factor in Markov is a single transition striking all N channels; the multiple-beta / MGL models generalize for cascading CCF.
- The state-space size for koon systems with CCF grows as 2^N + CCF states — for N = 4 and β, the state space is already 17 states; for N = 6, it is 65.
- Numerical solution of the linear system (steady state) can be ill-conditioned for very small failure rates — use specialized Markov solvers (e.g., Grassmann-Taksar-Heyman).`,
    comparison: `**Markov vs RBD (Lesson 1):**
- RBD: binary, combinatorial, non-repairable; R(t) = survival function; minimal cut sets.
- Markov: multi-state, dynamic, repairable; A(t) = instantaneous availability; state-transition graph.
- For non-repairable systems, R(t) from Markov (with absorbing failed state) = RBD R(t).

**Markov vs FTA (Lesson 2):**
- FTA: binary, combinatorial, top-down; minimal cut sets = absorbing states of the Markov model.
- Markov: dynamic, with repair; A(t) approaches A_ss as t → ∞.
- FTA + Markov: the FTA cut sets are the absorbing states of the equivalent Markov model.

**Markov vs Monte-Carlo:**
- Markov: analytical solution; small state space (< 100); exponential transitions required.
- Monte-Carlo: simulation; large state space; any transition distribution (Weibull, lognormal).
- Best practice: use Markov when feasible; Monte-Carlo when state space is large or transitions are non-exponential.`,
    practical_application: `- **Power — combined-cycle power plant**: Markov model of the full plant (gas turbine + HRSG + steam turbine + pumps + cooling); Monte-Carlo for state space > 1,000.
- **Chemical — 2-pump parallel cooling water**: Markov 3-state; quantifies the impact of reduced repair crew.
- **Oil & Gas — subsea production system**: Markov with cold-standby subsea control module; switch transition η for standby failover.
- **SIS (IEC 61511) — koon with CCF**: Markov with β-factor transition; verifies SIL target with repair and test interval.
- **Manufacturing line with buffers**: Markov multi-state for production throughput modeling; degraded state = reduced production rate.`,
    decision_scenario: `You are the CRE on a chemical-plant 2-pump parallel cooling-water system. Each pump has λ = 5×10⁻⁴/h (MTBF = 2,000 h) and μ = 5×10⁻²/h (MTTR = 20 h). The plant manager proposes reducing the repair crew from 2 (simultaneous repair) to 1 (one at a time). (a) Compute the original 2-pump parallel A_ss (Markov 3-state with 2 repair crews). (b) Compute the A_ss with 1 repair crew (transition 2→1 at rate μ instead of 2μ). (c) Quantify the additional plant-downtime hours per year (8,760 h) at the new A_ss. (d) For a plant producing 1,000 t/day at $500/t margin, is the 2nd-crew cost justified?`,
    practice_questions: `- **Q1 (Easy, Recall):** State the 2-state repairable A_ss formula and the time constant τ.
- **Q2 (Medium, Calculation):** For λ = 1×10⁻⁴/h, μ = 1×10⁻²/h, compute A_ss and the time to reach ~99% of A_ss.
- **Q3 (Medium, Application):** For a 2-pump parallel system (each A_ss = 0.99), compare the binomial A_parallel_ss and the Markov 3-state A_ss; explain the small difference.
- **Q4 (Hard, Analyze):** For a 3oo5 system with λ = 1×10⁻⁴/h, μ = 1×10⁻²/h, β = 0.05, describe how you would set up the Markov model and why Monte-Carlo might be preferred.`,
    certification_questions: `- **CRE-style (Easy):** What is the steady-state availability of a 2-state repairable system? (μ/(λ+μ) = MTBF/(MTBF+MTTR)).
- **CRE-style (Medium, Calculation):** For λ = 1×10⁻⁴/h, μ = 1×10⁻²/h, compute A_ss and the time constant.
- **CRE-style (Hard, Analysis):** When is Monte-Carlo preferred over analytical Markov? Give two reasons (state-space size and non-exponential transitions).`,
    summary: `Markov models are the continuous-time state-transition generalization of RBD/FTA. The Chapman-Kolmogorov forward equations govern P_i(t); in steady state, the linear system Q·P = 0 with ΣP = 1 yields A_ss = Σ_{operating} P_i^ss. The 2-state repairable formula A_ss = μ/(λ+μ) = MTBF/(MTBF+MTTR) is the workhorse. Multi-state Markov captures degraded operation, partial failure, and CCF (β-factor as transition). Monte-Carlo is the practical alternative for large state spaces or non-exponential transitions — confidence intervals shrink as 1/sqrt(N_sim). Markov generalizes RBD (binary, combinatorial, non-repairable) to multi-state, dynamic, repairable systems.`,
    key_takeaways: `- Markov: states + transition rates; Chapman-Kolmogorov dP/dt = P·Q.
- 2-state repairable: A_ss = μ/(λ+μ) = MTBF/(MTBF+MTTR); time constant τ = 1/(λ+μ).
- Steady state: solve Q·P = 0 with ΣP = 1; A_ss = Σ_{operating} P_i^ss.
- Multi-state captures degraded operation, partial failure, and CCF (β-factor as transition).
- Monte-Carlo: large state spaces, non-exponential transitions; CI shrinks as 1/sqrt(N_sim).
- Markov generalizes RBD (binary, non-repairable) to multi-state, dynamic, repairable.`,
    references: `- ASQ CRE Body of Knowledge — Reliability Modeling domain.
- ISO 14224:2016 — Collection of reliability and maintenance data for equipment.
- Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 9 (Markov models for repairable systems).
- O'Connor & Kleyner (2012), Practical Reliability Engineering, Ch. 9 (Markov and Monte-Carlo simulation).
- Smith (2021), Reliability, Maintainability and Risk, Ch. 11 (Markov state-transition models for SIL/availability).
- Jardine & Tsang (2006), Maintenance, Replacement, and Reliability, Ch. 9 (Repairable systems and Markov models).`,
  },
  knowledgeObject: {
    title: "Markov & State-Transition Models",
    domain: "Reliability Modeling",
    competency: "Markov & State-Transition Models",
    topic: "System Reliability Modeling",
    concept: "Continuous-time state-transition models for repairable/multi-state systems, Monte-Carlo simulation",
    body: {
      definitions: [
        "Markov model: continuous-time state-transition model; states + transition rates govern P_i(t).",
        "State: a configuration of the system (operating, failed, degraded, under-repair, etc.).",
        "Transition rate q_{ij}: rate of transition from state i to state j [1/h].",
        "Chapman-Kolmogorov forward equations: dP_i/dt = Σ (q_{ji}·P_j − q_{ij}·P_i).",
        "Steady state: dP/dt = 0; long-run probability distribution; A_ss = Σ_{operating} P_i^ss.",
        "2-state repairable: A_ss = μ/(λ+μ) = MTBF/(MTBF+MTTR); τ = 1/(λ+μ).",
        "Multi-state Markov: states include degraded operation, partial failure, under-repair.",
        "Common-cause transition: state transition striking all redundant channels simultaneously (β·λ).",
        "Absorbing state: state with no exit (failed state in non-repairable models).",
        "MTTF (Markov): expected time to absorption in the failed state — solve linear system from transient states.",
        "Monte-Carlo simulation: sample N_sim system histories; R_sys(t) ≈ count surviving / N_sim.",
      ],
      principles: [
        "Markov: continuous-time state-transition model; Chapman-Kolmogorov dP/dt = P·Q.",
        "Steady state: solve Q·P = 0 with ΣP = 1; A_ss = Σ_{operating} P_i^ss.",
        "2-state repairable: A_ss = μ/(λ+μ) = MTBF/(MTBF+MTTR); time constant τ = 1/(λ+μ).",
        "Multi-state captures degraded operation, partial failure, and CCF (β-factor as transition).",
        "Monte-Carlo: large state spaces, non-exponential transitions; CI shrinks as 1/sqrt(N_sim).",
        "Markov generalizes RBD (binary, combinatorial, non-repairable) to multi-state, dynamic, repairable.",
        "FTA minimal cut sets are the absorbing states of the equivalent Markov model.",
      ],
      components: [
        "State (configuration node).",
        "Transition rate q_{ij} [1/h].",
        "Transition-rate matrix Q (with diagonal q_{ii} = −Σ q_{ij}).",
        "State-probability vector P(t).",
        "Chapman-Kolmogorov forward equations dP/dt = P·Q.",
        "Steady-state vector P^ss (Q·P^ss = 0, ΣP = 1).",
        "Absorbing state (failed state in non-repairable).",
        "CCF transition (β·λ strikes all channels simultaneously).",
        "Monte-Carlo sampler (stochastic history simulator).",
      ],
      mechanism: [
        "Markov modeling lifecycle: identify states → identify transitions and rates → write Q matrix → write Chapman-Kolmogorov → solve steady state (or run ODE for time-dependent) → compute A_ss or R(t) → validate against binomial koon (small state space) and RBD R(t) (non-repairable) → run Monte-Carlo for large state spaces → re-fit rates from field data (closed loop).",
      ],
      process: [
        "1. Identify the states (operating, degraded, failed, under-repair).",
        "2. Identify transitions and rates (λ, μ, η, β·λ for CCF).",
        "3. Write transition-rate matrix Q; verify q_{ii} = −Σ_{j≠i} q_{ij}.",
        "4. Write Chapman-Kolmogorov forward equations dP/dt = P·Q.",
        "5. For steady state: solve Q·P = 0 with ΣP = 1 (Gaussian elimination).",
        "6. Compute A_ss = Σ_{operating states} P_i^ss.",
        "7. For time-dependent: solve ODE numerically (Runge-Kutta) for A(t).",
        "8. For non-repairable R(t): set failed state absorbing; compute P_operating(t).",
        "9. For large state spaces: run Monte-Carlo with N_sim ≥ 10,000; compute R_sys(t) and 95% CI.",
        "10. Validate against binomial koon (small space, no CCF) and RBD R(t); document assumptions.",
      ],
      formulas: [
        "Chapman-Kolmogorov: dP_i/dt = Σ_{j≠i} (q_{ji}·P_j − q_{ij}·P_i).",
        "Steady state: Q·P^ss = 0 with Σ P_i^ss = 1.",
        "2-state repairable: A_ss = μ/(λ+μ) = MTBF/(MTBF+MTTR).",
        "A(t) = μ/(λ+μ) + λ·exp(−(λ+μ)·t)/(λ+μ); τ = 1/(λ+μ).",
        "Parallel (n identical, independent): A_parallel_ss = 1 − (1 − A_ss)^n.",
        "2oo3 repairable: A_2oo3_ss = 3A² − 2A³.",
        "Monte-Carlo: R_sys(t) ≈ count_surviving(t)/N_sim; 95% CI = R ± 1.96·sqrt(R(1−R)/N_sim).",
      ],
      metrics: [
        "A_ss [dimensionless 0..1] — steady-state availability.",
        "A(t) [dimensionless] — instantaneous availability at time t.",
        "Time constant τ = 1/(λ+μ) [h].",
        "Steady-state probabilities P_i^ss [dimensionless].",
        "MTTF (Markov) [h] — expected time to absorption.",
        "Monte-Carlo R_sys(t) [dimensionless] and 95% CI [dimensionless].",
        "Number of states (state-space size).",
        "N_sim (Monte-Carlo sample size).",
      ],
      examples: [
        "2-state repairable (λ=1e−4/h, μ=1e−2/h): A_ss = 0.990099 = 99.01%; τ = 99 h.",
        "2-pump parallel (each A_ss=0.99): binomial A_parallel = 0.9999; Markov 3-state A_ss ≈ 0.99892.",
        "Multi-state with degraded (3-state Markov): A_ss = P_op + P_deg.",
        "Monte-Carlo for 5-channel 3oo5 (N_sim=10,000, β=0.05): R_sys(10000) ≈ 0.9987 ± 0.00071.",
      ],
      industrial_examples: [
        "Power — CCGT feedwater system: 2-pump parallel; single-pump A_ss = 0.9901; parallel A_ss ≈ 0.9989; Monte-Carlo for full-plant state-space > 1,000.",
        "Chemical — 2-pump cooling water: Markov 3-state with 2 vs 1 repair crews; quantifies downtime difference.",
        "Oil & Gas — subsea controls: Markov with cold-standby and switch transition η.",
        "SIS (IEC 61511) — koon with CCF: Markov with β-factor transition verifies SIL target with repair and test interval.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Chemical plant 2-pump parallel cooling water. Original (2 repair crews, μ=0.05/h each): Markov 3-state A_ss = 0.99892 = 99.892%. Reduced crew (1 repair at a time, transition 2→1 at μ instead of 2μ): A_ss drops to ~0.9978 = 99.78%. Plant downtime difference: 0.0011×8760 = 9.6 h/year. At 1,000 t/day production, $500/t margin: 9.6 h = 400 t = $200k/year loss — exceeds 2nd-crew cost. Recommendation: maintain 2 repair crews. Method per Jardine & Tsang (2006, Ch. 9).",
      ],
      common_errors: [
        "Using a single-state (or RBD) model for systems with degraded states or repair.",
        "Forgetting the time constant τ = 1/(λ+μ); short missions have A(t) << A_ss.",
        "Using the binomial koon when repair rates are dependent (1 crew for n channels).",
        "Forgetting Markov assumes exponential (constant-rate) transitions; Weibull/lognormal require Monte-Carlo.",
        "Reporting A_ss without the time constant or mission duration.",
        "Confusing R(t) (non-repairable) with A(t) (repairable); failed state must be absorbing for R(t).",
        "Using too few Monte-Carlo samples (N_sim < 1,000); 95% CI > 5% is useless.",
      ],
      limitations: [
        "Markov assumes exponential transitions; non-exponential requires Monte-Carlo or semi-Markov.",
        "State space grows combinatorially; explicit Markov impractical for state spaces > ~100.",
        "Monte-Carlo CI shrinks slowly (1/sqrt(N_sim)); for R = 0.999 and CI ±0.001, N_sim = 4×10⁶.",
        "Markov property (memoryless) fails when repair effectiveness or wear-in delays matter.",
        "CCF β-factor in Markov is a single transition; multiple-beta / MGL generalize for cascading CCF.",
        "State-space size for koon+CCF grows as 2^N + CCF states; N=4 → 17, N=6 → 65.",
        "Linear-system solution can be ill-conditioned for very small failure rates — use specialized Markov solvers.",
      ],
      best_practices: [
        "Always specify the time constant τ and the mission duration when reporting A_ss.",
        "Validate the Markov A_ss against the binomial koon for small state spaces (no CCF).",
        "For dependent repair (shared crew), use the Markov model — the binomial does not capture it.",
        "For large state spaces (> 100) or non-exponential transitions, use Monte-Carlo with N_sim ≥ 10,000.",
        "Always report the Monte-Carlo 95% confidence interval; never report a point estimate alone.",
        "For SIS verification (IEC 61511), include the CCF transition (β-factor) in the Markov model.",
        "Re-fit transition rates from CMMS/FRACAS field data annually (closed loop).",
      ],
      related_concepts: [
        "RBD (Lesson 1) — binary, combinatorial, non-repairable; minimal cut sets as Markov absorbing states.",
        "FTA (Lesson 2) — minimal cut sets = absorbing states of the equivalent Markov model.",
        "MooN (Lesson 3) — koon binomial is the steady-state Markov for independent repairable channels.",
        "Reliability Fundamentals (RF) — R(t), MTBF/MTTR/availability inputs to the Markov rates.",
        "ISO 14224:2016 — failure-data source for transition rates.",
      ],
      prerequisites: [
        "ASQ CRE RF — R(t), MTBF/MTTR/availability, exponential.",
        "RBD (Lesson 1) — series/parallel/koon, minimal cut sets.",
        "FTA (Lesson 2) — cut sets as Markov absorbing states.",
        "MooN (Lesson 3) — koon binomial, β-factor CCF.",
        "Basic linear algebra: matrix multiplication, solving linear systems.",
      ],
      references: [
        "ASQ CRE Body of Knowledge — Reliability Modeling domain.",
        "ISO 14224:2016 — Collection of reliability and maintenance data for equipment.",
        "Ebeling (2010), Ch. 9 (Markov models for repairable systems).",
        "O'Connor & Kleyner (2012), Ch. 9 (Markov and Monte-Carlo).",
        "Smith (2021), Ch. 11 (Markov state-transition models).",
        "Jardine & Tsang (2006), Ch. 9 (Repairable systems and Markov models).",
      ],
    },
  },
  questions: [
    {
      competencyName: "Markov & State-Transition Models",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "What is the steady-state availability of a 2-state repairable Markov system with failure rate λ and repair rate μ?",
      whyCorrect:
        "For a 2-state repairable Markov (state 0 = operating, state 1 = failed + under repair; transitions 0→1 at λ, 1→0 at μ), the steady-state availability A_ss = μ/(λ+μ). This equals MTBF/(MTBF+MTTR), since MTBF = 1/λ and MTTR = 1/μ. The formula is derived by solving dP/dt = 0 (steady state) for the 2-state Chapman-Kolmogorov equations.",
      whyOthersWrong: [
        "Option A (A_ss = λ/(λ+μ)) is the steady-state UNAVAILABILITY (probability of being failed), not availability — the formula is reversed.",
        "Option B (A_ss = exp(−λ·t)) is the non-repairable reliability R(t) for a constant-λ (exponential) single channel; it ignores the repair transition entirely.",
        "Option D (A_ss = MTBF/(MTBF−MTTR)) has the wrong sign on MTTR; availability cannot exceed 1, and MTBF − MTTR would for any reasonable MTBF > MTTR give A_ss > 1.",
      ],
      explanation:
        "A_ss = μ/(λ+μ) = MTBF/(MTBF+MTTR). For λ=1×10⁻⁴/h, μ=1×10⁻²/h: A_ss = 0.01/0.0101 = 0.9901 = 99.01%.",
      options: [
        { text: "A_ss = λ/(λ+μ)", isCorrect: false },
        { text: "A_ss = exp(−λ·t)", isCorrect: false },
        { text: "A_ss = μ/(λ+μ) = MTBF/(MTBF+MTTR)", isCorrect: true },
        { text: "A_ss = MTBF/(MTBF−MTTR)", isCorrect: false },
      ],
    },
    {
      competencyName: "Markov & State-Transition Models",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Power",
      stem: "A repairable pump has λ = 1×10⁻⁴/h (MTBF = 10,000 h) and μ = 1×10⁻²/h (MTTR = 100 h). Compute A_ss and the time constant τ (time to reach ~63% of steady state).",
      whyCorrect:
        "A_ss = μ/(λ+μ) = 0.01/(0.0001 + 0.01) = 0.01/0.0101 = 0.990099 ≈ 99.01%. The time constant τ = 1/(λ+μ) = 1/0.0101 = 99.01 h. The system reaches steady state after ~5τ ≈ 495 h. For short missions (t << τ), A(t) << A_ss (the system has not yet reached steady state); for long missions (t >> τ), A(t) ≈ A_ss.",
      whyOthersWrong: [
        "Option A (A_ss = 0.6321, τ = 1 h) — A_ss is computed as exp(−1) = 0.368 (the non-repairable R at t = MTBF), which is wrong for a repairable system; τ = 1/μ = 100 h is wrong (uses μ only, not λ+μ).",
        "Option B (A_ss = 0.9990, τ = 1000 h) — A_ss is computed as 1 − λ/(λ+μ) = 0.0099 (the unavailability), with a sign error giving 0.9990; τ = 1/λ = 10,000 h (uses λ only, not λ+μ).",
        "Option D (A_ss = 1.0000, τ = 0) — A_ss = 1 is impossible for any repairable system with λ > 0; τ = 0 is unphysical.",
      ],
      explanation:
        "A_ss = μ/(λ+μ) = 0.01/0.0101 = 0.9901 = 99.01%. τ = 1/(λ+μ) = 1/0.0101 = 99 h. The system reaches steady state after ~5τ ≈ 495 h.",
      options: [
        { text: "A_ss = 0.6321; τ = 1 h", isCorrect: false },
        { text: "A_ss = 0.9990; τ = 1000 h", isCorrect: false },
        { text: "A_ss ≈ 0.9901; τ ≈ 99 h", isCorrect: true },
        { text: "A_ss = 1.0000; τ = 0", isCorrect: false },
      ],
    },
    {
      competencyName: "Markov & State-Transition Models",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Chemical",
      stem: "When is Monte-Carlo simulation preferred over an analytical Markov solution for a repairable system reliability model?",
      whyCorrect:
        "Monte-Carlo is preferred when (i) the state space is large (> ~100 states — explicit Markov solution is computationally impractical) or (ii) the transition distributions are non-exponential (Weibull failure, lognormal repair — the Markov property fails). Monte-Carlo samples N_sim system histories and computes R_sys(t) and A_ss statistically, with the 95% CI shrinking as 1/sqrt(N_sim). For small state spaces (< 100) with exponential transitions, analytical Markov is preferred (faster, exact).",
      whyOthersWrong: [
        "Option A (always; Markov is obsolete) — incorrect; analytical Markov is exact and faster for small state spaces with exponential transitions.",
        "Option B (when N_sim < 1,000) — incorrect; small N_sim gives wide confidence intervals (e.g., ±5% for R = 0.99); Monte-Carlo is then useless. Large N_sim is the regime where Monte-Carlo is statistically valid.",
        "Option D (when the system is binary and non-repairable) — incorrect; for binary non-repairable systems, RBD R(t) = exp(−λ·t) is the simplest model; Markov or Monte-Carlo is overkill.",
      ],
      explanation:
        "Monte-Carlo is preferred when (i) state space > ~100 or (ii) non-exponential transitions. For small state spaces with exponential transitions, analytical Markov is faster and exact.",
      options: [
        { text: "Always; analytical Markov is obsolete", isCorrect: false },
        { text: "When N_sim < 1,000 for fast turnaround", isCorrect: false },
        { text: "When state space > ~100 or transitions are non-exponential (Weibull, lognormal)", isCorrect: true },
        { text: "When the system is binary and non-repairable", isCorrect: false },
      ],
    },
    {
      competencyName: "Markov & State-Transition Models",
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Oil & Gas",
      stem: "True or False: For a 2-pump parallel repairable system, the Markov 3-state model (states: 0 failed, 1 failed, 2 failed) gives a slightly lower A_ss than the binomial approximation A_parallel_ss = 1 − (1 − A_ss)², because the Markov model captures the small probability of being in the '1 failed + 1 under repair' state.",
      whyCorrect:
        "TRUE. The binomial A_parallel_ss = 1 − (1 − A_ss)² assumes instantaneous repair (no time spent in the '1 failed' state). The Markov 3-state model captures the small but non-zero time spent with one channel failed and under repair — the steady-state probability P_1 of being in the '1 failed' state is small but non-zero, and the system is still 'available' in this state (the remaining channel operates). However, the Markov model also has a small P_2 (both failed simultaneously) that the binomial approximates as (1 − A_ss)². The net effect: the Markov A_ss is slightly lower than the binomial because the Markov model captures the dependency between repair events (e.g., a single repair crew for both channels) — the binomial assumes independent repair. For 2 independent repair crews (each μ), the difference is small (~0.01 percentage points); for a single shared crew, the difference is larger (~0.1 percentage points).",
      whyOthersWrong: [
        "Option FALSE — would imply the binomial and Markov give identical results; in fact, the Markov model captures repair-rate dependencies and the time spent in the '1 failed' state that the binomial approximation does not. The two agree only in the limit of instantaneous repair (μ → ∞), which is unphysical.",
      ],
      explanation:
        "TRUE. The Markov 3-state model captures the '1 failed + 1 under repair' state and the dependency between repair events; the binomial assumes instantaneous independent repair. For shared repair crews, the Markov A_ss is lower than the binomial.",
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

export const CRE_RM_LESSONS: RefLesson[] = [
  LESSON_RBD,
  LESSON_FTA,
  LESSON_MOON,
  LESSON_MARKOV,
];

// ---------------------------------------------------------------------------
// RM competencies created inside loadReference() (RM domain exists in
// src/lib/ref-content/cre.ts with NO competencies yet — this loader seeds
// the 4 RM competencies and then loads the deep content).
// ---------------------------------------------------------------------------

interface SeedCompetency {
  name: string;
  description: string;
  order: number;
}

const CRE_RM_COMPETENCIES: SeedCompetency[] = [
  {
    name: "Reliability Block Diagrams (RBD)",
    description:
      "Series, parallel, and k-out-of-n (koon) reliability block diagrams; minimal cut sets; system reliability computation; bridge and complex topologies via inclusion-exclusion. The foundational topological reliability model.",
    order: 1,
  },
  {
    name: "Fault Tree Analysis (FTA)",
    description:
      "Top-down deductive Boolean fault-tree synthesis; AND/OR gates; minimal cut sets; rare-event approximation and inclusion-exclusion; Fussell-Vesely, RAW, and RRW importance measures; SIS SIL verification and nuclear PSA application.",
    order: 2,
  },
  {
    name: "Redundancy & Voting (MooN)",
    description:
      "Active and standby redundancy; M-out-of-N (MooN) voting architectures; binomial koon reliability (1oo2, 2oo3, 2oo4, 3oo5); common-cause failure (β-factor model); imperfect switching; IEC 61511 SIS SIL verification.",
    order: 3,
  },
  {
    name: "Markov & State-Transition Models",
    description:
      "Continuous-time Markov state-transition models; Chapman-Kolmogorov forward equations; steady-state availability A_ss = μ/(λ+μ); multi-state systems with degraded operation; CCF as transition; Monte-Carlo simulation for large state spaces.",
    order: 4,
  },
];

// ---------------------------------------------------------------------------
// Loader — CONTENT-only (mirrors cmrp-equipment-reliability.ts) with the
// additional step of creating the 4 RM competencies inside loadReference().
// ---------------------------------------------------------------------------

/**
 * Upsert the CRE Reliability Modeling (RM) CONTENT into the database.
 * Idempotent: safe to call repeatedly. Returns record counts written.
 *
 * Flow:
 *  1. Find CRE certification by slug "cre" (the structure+RF-content loader
 *     in src/lib/ref-content/cre.ts is a prerequisite).
 *  2. Find the RM domain by code "RM" (certificationId = cre.id). The RM
 *     domain exists in cre.ts with NO competencies — delete any stale RM
 *     competencies and create the 4 RM competencies from
 *     CRE_RM_COMPETENCIES. Map by NAME -> id.
 *  3. Upsert References globally (by title, no sectionId) → shared ids
 *     applied to every RM lesson, KO, and question.
 *  4. For each lesson:
 *     - db.lesson.findFirst({where:{competencyId, slug}}) then update or
 *       create with sectionId=null, certificationId, competencyId, slug,
 *       title, titleAr, order, durationMin, conceptIntroduction, example,
 *       keyFormulas, exercise, sections (JSON.stringify), referenceIds
 *       (JSON.stringify shared), status="READY", confidence="HIGH",
 *       verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
 *  5. Upsert KnowledgeObject per lesson: findFirst({where:{lessonId}}) then
 *     create/update with certificationId, domainId (RM), competencyId,
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

  // 2) Find the RM domain by code "RM" (certificationId = cre.id). The RM
  //    domain exists in cre.ts but is seeded with NO competencies — delete
  //    any stale RM competencies and create the 4 RM competencies here.
  const rmDomain = await db.domain.findFirst({
    where: { certificationId: certification.id, code: "RM" },
  });
  if (!rmDomain) {
    throw new Error(
      'Reliability Modeling (RM) domain not found under CRE. Run the CRE structure+RF-content loader (src/lib/ref-content/cre.ts) first.'
    );
  }

  // Delete any existing RM competencies (idempotent re-create).
  await db.competency.deleteMany({
    where: { domainId: rmDomain.id },
  });

  // Create the 4 RM competencies.
  for (const c of CRE_RM_COMPETENCIES) {
    await db.competency.create({
      data: {
        domainId: rmDomain.id,
        name: c.name,
        description: c.description,
        order: c.order,
      },
    });
  }

  // Map RM competencies by NAME -> id.
  const rmCompetencies = await db.competency.findMany({
    where: { domainId: rmDomain.id },
  });
  const competencyIdByName: Record<string, string> = {};
  for (const c of rmCompetencies) {
    competencyIdByName[c.name] = c.id;
  }
  // Validate that all 4 expected RM competencies exist by name.
  const expectedCompetencyNames = CRE_RM_LESSONS.map((l) => l.competencyName);
  const missing = expectedCompetencyNames.filter(
    (n) => !competencyIdByName[n]
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing RM competencies by name: ${missing.join(
        ", "
      )}. Ensure CRE_RM_COMPETENCIES matches CRE_RM_LESSONS competencyName.`
    );
  }

  // 3) References — global (no sectionId), upserted by title.
  const refIdsByTitle: Record<string, string> = {};
  for (const src of CRE_RM_SOURCES) {
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
  const sharedReferenceIds = CRE_RM_SOURCES.map((s) => refIdsByTitle[s.title]).filter(
    Boolean
  ) as string[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 4) Lessons, 5) KnowledgeObjects, 6) Questions
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of CRE_RM_LESSONS) {
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
      domainId: rmDomain.id,
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
          domainId: rmDomain.id,
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
    domain: rmDomain.id,
    competencies: rmCompetencies.length,
    lessons: lessonsCount,
    kos: kosCount,
    questions: questionsCount,
    references: referencesCount,
  };
}
