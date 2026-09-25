// =============================================================================
// CRE — Certified Reliability Engineer (ASQ) — Reliability Testing (RT)
// pillar — Deep scientific reference (Task ID 17-CRE-RT).
//
// Certification slug: "cre" (ASQ). Domain code: "RT" (Reliability Testing) —
// the 5th of 7 ASQ CRE BOK domains. The RT domain exists in
// src/lib/ref-content/cre.ts (the combined structure+RF-content loader) but
// is seeded with NO competencies. This CONTENT-only loader creates the 4 RT
// competencies inside loadReference() and then loads the deep scientific
// content (4 full-spec 24-section lessons + KOs + 16 enriched questions).
//
// Four lessons, one per RT competency (created below in loadReference()):
//   1. Reliability Test Planning & DVP&R    (slug: rt-test-planning-dvpr)
//   2. Accelerated Life Testing (ALT)      (slug: rt-accelerated-life-testing)
//   3. HALT & HASS                          (slug: rt-halt-hass)
//   4. Reliability Demonstration & Success-Run (slug: rt-demonstration-success-run)
//
// Each lesson ships:
//   - The full 24-section data-collector template (spec §9, LESSON_TEMPLATE
//     in src/lib/spec.ts), with every applicable section filled with real,
//     in-depth professional reliability-testing content. No padding.
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
//     (Reliability Testing domain).
//   - LEVEL 2 — Official Standard / Standards Organization: ISO 14224:2016
//     (reliability & maintenance data — failure-rate database for test
//     acceleration inputs).
//   - LEVEL 6 — University / Academic Publications: Charles E. Ebeling,
//     "An Introduction to Reliability and Maintainability Engineering"
//     (Waveland Press, 2010).
//   - LEVEL 7 — Technical Publications / Industry Sources: Wayne Nelson,
//     "Accelerated Testing: Statistical Models, Test Plans, and Data
//     Analyses" (Wiley-Interscience, 2004); Patrick D. T. O'Connor & Andre
//     Kleyner, "Practical Reliability Engineering" (Wiley, 5th ed., 2012);
//     Harry W. McLean et al., "HALT and HASS: The New Quality and Reliability
//     Initiative" / Gregg K. Hobbs "Accelerated Reliability Engineering:
//     HALT and HASS" (Wiley, 2000).
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
  scenario?: string; // Electronics|Automotive|Aerospace|Oil & Gas|Power|...
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
// SOURCES — 6 real references cited across all RT lessons.
// ---------------------------------------------------------------------------

export const CRE_RT_SOURCES: RefSource[] = [
  {
    title:
      "ASQ CRE Body of Knowledge — Reliability Testing domain",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "BOK",
    url: "https://asq.org/cert/reliability-engineer",
    citation:
      "American Society for Quality (ASQ). Certified Reliability Engineer (CRE) Body of Knowledge — Reliability Testing domain. The official competency framework for design verification, plan & report (DVP&R), reliability qualification, sample-size selection, accelerated life testing (ALT), acceleration models (Arrhenius, Eyring, Coffin-Manson, inverse-power), HALT and HASS, reliability demonstration (success-run, χ² MTBF confidence intervals), and sequential testing. Anchors the ASQ CRE exam's reliability-testing questions.",
  },
  {
    title:
      "Nelson — Accelerated Testing: Statistical Models, Test Plans, and Data Analyses (Wiley-Interscience)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Nelson, W. (2004). Accelerated Testing: Statistical Models, Test Plans, and Data Analyses. Hoboken, NJ: John Wiley & Sons / Wiley-Interscience. ISBN 978-0-471-52775-3. The canonical reference for ALT: Chapters 1–2 (test plans and censoring), Chapter 3 (Arrhenius and inverse-power models for temperature/voltage acceleration, AF = exp[−Ea/k·(1/T_use − 1/T_acc)]), Chapter 4 (Eyring and generalized Eyring models), Chapter 5 (Coffin-Manson for low-cycle fatigue thermal cycling), Chapter 7 (maximum-likelihood fitting of accelerated life distributions), and Chapter 10 (step-stress and progressive-stress testing). The canonical ALT reference for the CRE BOK.",
  },
  {
    title:
      "Ebeling — An Introduction to Reliability and Maintainability Engineering (Waveland Press)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Ebeling, C. E. (2010). An Introduction to Reliability and Maintainability Engineering (2nd ed.). Long Grove, IL: Waveland Press. ISBN 978-1-57766-625-9. Chapters 11 (Reliability testing — test plans, OC curves, sample size, success-run and χ² MTBF confidence intervals), 12 (Reliability growth — Duane and Crow-AMSAA), and 13 (Accelerated life testing — Arrhenius, Eyring, Coffin-Manson, inverse-power models and AF computation). The canonical reliability-testing textbook for the CRE BOK.",
  },
  {
    title:
      "O'Connor — Practical Reliability Engineering (Wiley)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "O'Connor, P. D. T., & Kleyner, A. (2012). Practical Reliability Engineering (5th ed.). Chichester: John Wiley & Sons. ISBN 978-0-470-97982-2. Chapters 11 (Reliability testing — DVP&R, development testing, qualification, demonstration testing, success-run), 12 (Accelerated testing — Arrhenius, Eyring, Coffin-Manson, inverse-power; acceleration factor; step-stress), and 13 (HALT and HASS — step-stress to destruct limit, design margin, screening). The practitioner reference for reliability testing.",
  },
  {
    title:
      "Hobbs — Accelerated Reliability Engineering: HALT and HASS (Wiley)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Hobbs, G. K. (2000). Accelerated Reliability Engineering: HALT and HASS. Chichester: John Wiley & Sons. ISBN 978-0-471-97963-2. The foundational text on Highly Accelerated Life Test (HALT) and Highly Accelerated Stress Screen (HASS): step-stress in temperature, vibration, and combined environments; destruct limit, operating limit, and design margin; soft and hard failures; HASS profile development from HALT margins (typically 50% of destruct); production-audit HASS. The canonical HALT/HASS reference for the CRE BOK.",
  },
  {
    title: "ISO 14224:2016 — Collection of reliability and maintenance data for equipment",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/63658.html",
    citation:
      "International Organization for Standardization. ISO 14224:2016, Petroleum, petrochemical and natural gas industries — Collection and exchange of reliability and maintenance data for equipment. Geneva: ISO. Defines the equipment-class taxonomy, failure-mode/mechanism/cause code structure, and population failure-rate (λ) data captured at WO closeout — the canonical use-condition failure-data source that anchors ALT acceleration models and DVP&R test-condition selection for industrial equipment.",
  },
];

const RT_REFERENCE_TITLES = CRE_RT_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Lesson 1 — Reliability Test Planning & DVP&R
// (Competency: "Reliability Test Planning & DVP&R"; slug: rt-test-planning-dvpr)
// ---------------------------------------------------------------------------

const LESSON_DVPR: RefLesson = {
  competencyName: "Reliability Test Planning & DVP&R",
  slug: "rt-test-planning-dvpr",
  title: "Reliability Test Planning & DVP&R (Design Verification Plan & Report)",
  titleAr: "تخطيط اختبار الموثوقية و DVP&R",
  order: 1,
  durationMin: 35,
  references: RT_REFERENCE_TITLES,
  conceptIntroduction: `The Design Verification Plan & Report (DVP&R) is the master document that ties a product's reliability requirements to a structured test program, traces each requirement to a specific test method, and records the pass/fail outcome. The DVP&R is built in the design-development phase and updated through production release. It captures, for every requirement (functional, environmental, reliability, regulatory): the verification method (analysis, inspection, similarity, or test), the test conditions (stress levels, duty cycle, sample size), the acceptance criteria (R target, MTBF lower bound, zero-failure duration), and the responsible owner/date. The two principal test strategies are *qualification* (verify the design meets spec) and *reliability demonstration* (verify the design meets a quantified reliability target, with statistical confidence — Lesson 4). The DVP&R is the organizational backbone; ALT (Lesson 2), HALT (Lesson 3), and success-run (Lesson 4) are the test methods that populate it.`,
  example: `An automotive ECU must demonstrate MTBF ≥ 50,000 h at 90% confidence (zero-failure test). Sample size from the success-run formula n = −ln(1 − CL)/λ·t. With CL = 0.90 and target MTBF = 50,000 h (λ = 2×10⁻⁵/h), for a test duration of t_unit = 1,000 h per unit: required unit-hours T = −ln(1 − 0.90)/λ = −ln(0.10)/2×10⁻⁵ = 2.3026/2×10⁻⁵ = 115,130 h. Sample size n = T / t_unit = 115,130 / 1,000 = 116 units (round up). If the test duration is doubled to 2,000 h/unit, n drops to 58. A 1000-h test on 116 ECUs with zero field-returns-class failures at end-of-test demonstrates MTBF ≥ 50,000 h at 90% confidence — the canonical success-run (Lesson 4). The DVP&R row for this requirement cites SAE J1455 (vibration), ISO 16750-2 (electrical), and the in-house success-run procedure.`,
  keyFormulas: `Sample size (success-run, zero failures, exponential): T_required = −ln(1 − CL)/λ  [unit-hours]
  n = T_required / t_unit   (t_unit = test time per unit)
  Or equivalently: n = ln(1 − CL) / ln(R_target)   [binomial, single-shot]
Acceptance number (defects allowed): n·p = r acceptable failures → use χ²(MTBF CI)
OC curve: P(test passes | true MTBF = M) = 1 − F_χ²(2r+2, 2T/M)  (zero-failure at r=0 → exp(−T/M))
Test efficiency: AF = test stress / use stress × time (ALT acceleration factor — Lesson 2)
Confidence interval (MTBF, time-truncated, exponential): MTBF_L = 2T / χ²_α;2r+2  ;  MTBF_U = 2T / χ²_{1−α/2};2r
DVP&R structure: Requirement ID → Test method → Conditions → Sample → Acceptance → Owner → Status`,
  exercise: `You are the CRE on a new industrial controller. The customer spec requires: MTBF ≥ 100,000 h at 90% confidence (zero-failure demonstration); functional verification under −40 to +85 °C, 10–500 Hz random vibration 5 g_rms; and 24 V supply dips/transients per ISO 16750-2. (a) Compute the success-run sample size for a 2000-h-per-unit test. (b) Build the DVP&R row for the reliability demonstration requirement, listing the test method, conditions, sample, acceptance criterion, and trace to the customer spec. (c) Justify why you would not release on test "similarity" alone for the reliability row even though the chassis is reused from a prior product.`,
  sections: {
    learning_objectives: `- Define the Design Verification Plan & Report (DVP&R) and its role in tying reliability requirements to a structured test program.
- Distinguish *qualification* (design meets spec) from *reliability demonstration* (design meets quantified reliability target with statistical confidence).
- Apply the success-run sample-size formula n = ln(1 − CL)/ln(R) and the time-truncated exponential form T = −ln(1 − CL)/λ.
- Construct an Operating Characteristic (OC) curve to quantify producer's and consumer's risk.
- Trace each requirement to a verification method (analysis, inspection, similarity, test) and acceptance criterion.
- Identify when ALT (Lesson 2) or HALT (Lesson 3) is the appropriate test method for a given requirement.`,
    prerequisites: `- ASQ CRE BOK Reliability Fundamentals (RF) — R(t), the exponential model R(t) = exp(−λ·t), MTBF, failure-rate behavior.
- ASQ CRE BOK Probability & Statistics (PS) — binomial and Poisson distributions, confidence intervals, χ² distribution.
- ASQ CRE BOK Reliability in Design & Development (RDD) — requirements flow-down, FMEA, design reviews.
- Familiarity with industry test standards: ISO 16750 (road-vehicle electrical), MIL-STD-810 (environmental), IEC 60068 (environmental testing).`,
    introduction: `Reliability test planning is the bridge between the design's reliability requirements (from FMEA, RDD, system modeling) and the test evidence that justifies product release. The DVP&R is the master matrix: every requirement has a row; every row has a verification method, conditions, sample size, acceptance criterion, owner, and pass/fail status. The DVP&R is a living document — it begins in concept, populates during design verification, and closes at production release.

The two principal test strategies are *qualification* and *reliability demonstration*. Qualification tests verify the design meets the spec envelope (temperature, vibration, electrical transients, IP rating, EMC) — they are pass/fail, deterministic, and typically run to the spec limit. Reliability demonstration tests verify the design meets a quantified reliability target (MTBF, B10 life, R(t)) with statistical confidence — they require sample size selection (success-run, MTBF CI), they run for a fixed duration, and they accept a defined number of failures.

The DVP&R's verification methods follow the V-model hierarchy: (i) *analysis* (RBD/FTA, FEA, derating — used when physical testing is infeasible); (ii) *inspection* (visual, dimensional, build verification — confirms workmanship); (iii) *similarity* (qualify by inheritance from a previously-qualified sub-assembly — requires documented evidence of identical design and stress); (iv) *test* (the default for reliability demonstration — physical execution of the requirement). The CRE's role is to ensure the test methods are statistically valid (sample size, confidence, OC curve) and traceable to the spec.`,
    terminology: `- **Design Verification Plan & Report (DVP&R)**: the master test matrix tying each requirement to a verification method, conditions, sample, acceptance criterion, and status.
- **Qualification test**: pass/fail test verifying the design meets the spec envelope (e.g., temperature, vibration, electrical).
- **Reliability demonstration test**: statistical test verifying the design meets a quantified reliability target with confidence (success-run, MTBF CI).
- **Acceptance criterion**: the rule that defines a pass (e.g., zero failures in T hours; MTBF_L ≥ target).
- **Operating Characteristic (OC) curve**: P(test passes | true MTBF = M) — quantifies producer's risk (1 − α) and consumer's risk (β).
- **Producer's risk (α)**: probability of rejecting a good design (Type I error).
- **Consumer's risk (β)**: probability of accepting a bad design (Type II error).
- **Success-run (zero-failure test)**: a reliability demonstration with r = 0 acceptable failures.
- **Time-truncated test**: test stops at a fixed time T regardless of failures observed (vs failure-truncated, stops at the r-th failure).
- **Sample size (n)**: number of test units; derived from the OC curve (CL, target MTBF, acceptance number r).
- **Similarity**: qualification by inheritance from a previously-qualified sub-assembly.
- **Traceability matrix**: cross-reference from requirement → verification method → test report.`,
    detailed_explanation: `The DVP&R is built top-down from the requirements tree. Each requirement (functional, environmental, reliability, regulatory) is decomposed into verifiable sub-requirements; each sub-requirement gets a DVP&R row. The row's first decision is the *verification method*: analysis (feasible when physical testing is destructive, costly, or impossible — e.g., seismic FEA on a building), inspection (workmanship verification — e.g., conformal-coating coverage), similarity (qualification by inheritance — e.g., a previously-qualified power supply reused in a new enclosure with identical thermal/vibration stress), or test (the default — physical execution under specified conditions).

For *reliability demonstration* rows, the test method is success-run (zero-failure) or MTBF-CI (time-truncated with r acceptable failures). The sample-size selection is the central quantitative step. The binomial single-shot form: n = ln(1 − CL) / ln(R_target), where R_target is the required reliability at mission duration t and CL is the confidence level. For R_target = 0.95 at t and CL = 0.90: n = ln(0.10)/ln(0.95) = −2.3026/−0.0513 = 44.9 → 45 units. The time-truncated exponential form: T_required = −ln(1 − CL)/λ, then n = T_required / t_unit. For CL = 0.90 and MTBF_target = 50,000 h (λ = 2×10⁻⁵/h): T_required = 2.3026/2×10⁻⁵ = 115,130 unit-hours; n = 115,130 / 1,000 = 116 units.

The *Operating Characteristic (OC) curve* quantifies the test's discrimination. P(test passes | true MTBF = M) = P(r ≤ r_acc | M) summed over acceptable-failure counts; for zero-failure, P_pass = exp(−T/M). At M = M_target, P_pass = 1 − α (the producer's confidence of passing a good design). At M = M_LTPD (the lower-tier quality the consumer wants to reject), P_pass = β (the consumer's risk of accepting a bad design). The OC curve lets the customer and supplier negotiate α, β, M_target, M_LTPD before testing — the contract is on the OC curve, not the pass/fail outcome.

*Test-condition selection* defines the stress levels for qualification rows. The environmental matrix (temperature, humidity, vibration, shock, salt spray, IP rating, EMC) follows the product's mission profile (e.g., SAE J1455 truck profile, MIL-STD-810 ground-vehicle profile, IEC 60721-3 class 4C2 outdoor industrial). Duty-cycle construction (cyclic temperature, electrical load, vibration ON/OFF) must mirror the field profile; over-stress qualification (test to the spec limit, e.g., +85 °C storage) provides design margin. Reliability demonstration rows may use *accelerated conditions* (ALT — Lesson 2) when the use-condition MTBF target cannot be demonstrated in available calendar time — the acceleration factor (AF) compresses test time at the cost of model risk.

The *DVP&R report* closes the loop. Each row's "Status" field transitions from "Planned" → "In test" → "Pass/Fail" with the test report reference. Failures trigger root-cause (FRACAS) and design-change iteration; the row's status moves to "Re-test pending" until the redesign passes. The DVP&R is the audit artifact for design review (SRR, PDR, CDR) and for the customer's PPAP/FAI submission.`,
    core_principles: `- The DVP&R ties every requirement to a verification method, conditions, sample, and acceptance criterion — no orphan requirements, no orphan tests.
- Reliability demonstration requires statistical confidence — sample size is computed from CL and R_target (success-run) or MTBF target (χ² CI).
- The OC curve quantifies producer's risk (1 − α) and consumer's risk (β) — the test contract is on the OC curve, not the pass/fail.
- Time-truncated testing is the workhorse; the χ² MTBF CI (Lesson 4) gives the lower bound from observed failures.
- Accelerated testing (Lesson 2) compresses calendar time at the cost of an acceleration model — risk is in the model.
- Similarity is acceptable for reused sub-assemblies with documented identical stress; never for new designs.
- Test conditions must mirror the field mission profile (duty cycle, stress combination) — over-test gives false confidence; under-test gives field returns.`,
    components: `- **Requirement ID** (parent requirement trace).
- **Verification method** (analysis / inspection / similarity / test).
- **Test conditions** (stress levels, duty cycle, environmental matrix).
- **Sample size (n)** and **test duration (t_unit)** (the reliability row's quantitative core).
- **Acceptance criterion** (zero failures, MTBF_L ≥ target, B10 ≥ target).
- **OC curve** (the test's statistical discrimination contract).
- **Owner / date** (accountability for execution and reporting).
- **Status** (Planned → In test → Pass / Fail → Re-test pending).
- **Test report ID** (traceable evidence — closed-loop with FRACAS).`,
    process: `1. Decompose the requirements tree into verifiable sub-requirements; populate DVP&R rows.
2. For each row, choose the verification method (analysis / inspection / similarity / test) with justification.
3. For reliability rows: choose CL, R_target or MTBF target, acceptance number r; compute sample size n and test duration t_unit.
4. Construct the OC curve; negotiate α and β with the customer; lock the test contract.
5. Define test conditions (stress levels, duty cycle, environmental matrix) from the field mission profile.
6. Execute tests; record pass/fail and observed failures; upload test reports.
7. For failures: trigger FRACAS root-cause, design iteration, re-test — row status moves to "Re-test pending."
8. At production release, close the DVP&R — every row must show "Pass" with a test report ID. Fail rows block release.
9. Audit: design review (SRR/PDR/CDR) traces each requirement to a "Pass" DVP&R row — no orphan requirements.`,
    formula_calculation: `Variables and formulas:
- CL: confidence level — dimensionless (e.g., 0.90 = 90%).
- R_target: required reliability at mission duration t — dimensionless [0,1].
- λ: failure rate (exponential) — [1/h]; λ = 1/MTBF.
- T: total unit-hours of test — [h].
- t_unit: test time per unit — [h].
- n: sample size (number of units) — dimensionless.
- r: number of failures observed — dimensionless.
- χ²_{p;ν}: chi-squared distribution percentile p with ν degrees of freedom.

Formulas:
- Success-run (zero-failure, exponential): T_required = −ln(1 − CL)/λ  ; n = T_required / t_unit.
- Binomial single-shot: n = ln(1 − CL) / ln(R_target)  (round up).
- MTBF lower bound (time-truncated): MTBF_L = 2T / χ²_{α; 2r+2}  ; upper bound: MTBF_U = 2T / χ²_{1−α/2; 2r}.
- OC curve: P(test passes | MTBF = M) = Σ_{i=0}^{r_acc} P(i | M) = Σ_{i=0}^{r_acc} (MT)^i·exp(−M·T)/i! for exponential.
- Producer's risk: α = 1 − P_pass(M = M_target).
- Consumer's risk: β = P_pass(M = M_LTPD).
- Acceleration factor (Lesson 2): AF = t_use / t_acc — compresses test time at the cost of model risk.

Units: time in hours (h); n and r dimensionless; λ in [1/h]; CL, R dimensionless [0,1].

Assumptions: (i) constant failure rate λ (exponential regime — useful life, no wear-out); (ii) identical units from the same production population; (iii) test stresses representative of field stresses (or ALT acceleration model valid); (iv) failures are independent (no common-cause across units); (v) test time is sufficient for the OC curve discrimination.

Interpretation: a successful DVP&R row "demonstrated MTBF ≥ 50,000 h at 90% confidence (zero failures in 116,000 unit-hours)" means: with 90% statistical confidence, the true MTBF of the production population is at least 50,000 h. The statement is about the population, not the tested sample — the sample's observed MTBF is not the demonstrated MTBF.`,
    worked_example: `**Automotive ECU — MTBF ≥ 50,000 h at 90% confidence, zero-failure.**
Given: CL = 0.90; MTBF_target = 50,000 h → λ = 2×10⁻⁵/h; t_unit = 1,000 h per unit.
T_required = −ln(1 − 0.90) / λ = −ln(0.10) / 2×10⁻⁵ = 2.302585 / 2×10⁻⁵ = 115,129 h.
Sample size n = T_required / t_unit = 115,129 / 1,000 = 115.13 → 116 units (round up).
Test: 116 ECUs × 1,000 h = 116,000 unit-hours, zero failures at end-of-test → MTBF_L = 2·116,000/χ²_{0.10;2} = 232,000/4.605 = 50,380 h ≥ 50,000 h ✓.

**Producer's & consumer's risk (OC curve).**
With r_acc = 0 and T = 116,000 h: P_pass(M) = exp(−T/M) = exp(−116,000/M).
At M = M_target = 50,000 h: P_pass = exp(−2.32) = 0.098 → α = 1 − 0.098 = 0.902 (PRODUCER'S RISK IS HIGH if the design is exactly at target — the zero-failure test is biased against the producer at M = M_target).
At M = 10 × M_target = 500,000 h: P_pass = exp(−0.232) = 0.793 (producer has 79.3% chance of passing a design 10× better than target).
At M = M_target / 10 = 5,000 h: P_pass = exp(−23.2) ≈ 10⁻¹⁰ (consumer is well-protected against a design 10× worse than target).
Interpretation: the zero-failure test at CL = 90% strongly protects the consumer (β ≈ 0 against M_LTPD = M_target/10) but is hard on the producer at M = M_target. The standard practice is to test against a target M_target = 3× to 10× the consumer's M_LTPD so the producer's risk is acceptable (~80–90% pass rate on good designs).`,
    industrial_example: `**Automotive — ECU DVP&R.** A body-control module (BCM) DVP&R has 47 rows: 12 functional (lights, wipers, locks), 18 environmental (ISO 16750-2 electrical, ISO 16750-3 mechanical, ISO 16750-4 climatic, IP5K6 dust/water), 6 EMC (CISPR 25, ISO 11452 BCI/anechoic), 4 reliability (1,000-h thermal-cycle endurance, 2,000-h high-temperature storage at +85 °C, 96-h salt spray, 2,000-h power-cycle endurance), 7 regulatory (UN ECE R10, R118). The reliability rows use ALT conditions ( Lesson 2 Arrhenius at +85 °C with Ea = 0.7 eV → AF = 50 → 2,000-h ALT ≡ 100,000-h use for a 50,000-h MTBF target on 12 units; n×t = 12 × 2,000 = 24,000 unit-h × AF = 50 → 1,200,000 equivalent use hours, sufficient for the success-run). Method per O'Connor (2012, Ch. 11) and Ebeling (2010, Ch. 11).`,
    case_study: `CASE_TYPE = SYNTHETIC. An aerospace avionics LRU (line-replaceable unit) DVP&R had a reliability row "MTBF ≥ 25,000 h at 90% confidence, zero-failure." The test planner computed n = ln(1 − 0.90)/ln(1 − 1/25,000) ≈ ln(0.10)/ln(0.99996) = −2.3026/−4.0×10⁻⁵ = 57,565 unit-hours. With t_unit = 2,000 h, n = 29 units at $80k/unit = $2.3M test cost. The CRE re-evaluated: (a) extending t_unit to 4,000 h drops n to 15 units ($1.2M test cost); (b) using ALT at +70 °C with Arrhenius Ea = 0.65 eV (AF ≈ 25 — Lesson 2) compresses t_unit to 4,000/25 = 160 h of ALT, but the LRU has a silicon failure mechanism with Ea = 0.65 eV and a solder-joint mechanism with Ea = 0.4 eV — a single AF is invalid across both. The CRE chose path (a) — extended time at use condition, accepting the higher test cost as the only statistically defensible option. Path (b) was rejected: a multi-mechanism LRU requires mechanism-specific ALT with separate AFs and a combined reliability model (Nelson, Ch. 7) — out of scope for the program timeline.`,
    visual_explanation: `The DVP&R is rendered as a matrix with rows = requirements and columns = [Req ID, Description, Verification Method, Conditions, Sample, Acceptance, Owner, Status, Test Report]. The OC curve is plotted as P_pass vs MTBF (log x-axis): a sigmoid rising from β at M_LTPD to 1−α at M_target. The success-run sample-size nomogram plots n vs CL for R_target = 0.90, 0.95, 0.99, 0.999 — a straight line on log-log axes (n grows ~geometrically with required R).`,
    simulation_opportunity: `An interactive simulation could let the learner select CL (slider 80–99%), R_target (slider 0.90–0.999), and t_unit (slider 100–5,000 h), then display n, T_required, and the OC curve with α and β annotations. A second mode would let the learner trace a DVP&R requirement through analysis → inspection → similarity → test and observe which methods satisfy a reliability row (only test, with statistical sample, is valid).`,
    common_mistakes: `- Reporting the *observed* MTBF on the test sample as the *demonstrated* MTBF — the demonstrated MTBF is the *lower bound* MTBF_L = 2T/χ²_{α;2r+2}, not the sample mean.
- Using similarity for new designs or new stress envelopes — similarity requires documented identical design AND identical stress, both auditable.
- Choosing n without constructing the OC curve — the customer's β at M_LTPD is the contract; without it the test is unbounded.
- Under-specifying the duty cycle (e.g., "1,000 h at +70 °C" without specifying the temperature profile, electrical load, vibration) — field correlation fails.
- Confusing *qualification* (pass/fail to spec) with *reliability demonstration* (statistical evidence of MTBF) — both belong on the DVP&R but are different rows with different methods.
- Using ALT (Lesson 2) without an acceleration model — over-stress test without AF is not a reliability demonstration.
- Closing the DVP&R with open "Fail" rows — production release requires every row to show "Pass" with a test report ID.`,
    limitations: `- The exponential assumption (constant λ) is invalid in wear-out regimes — Weibull/LOGNOR test plans are required (Nelson, Ch. 7).
- The OC curve's discrimination is limited — small samples cannot separate M_target from 2×M_target (β at 2×M_target is high for n < 50).
- Similarity is invalid when the design OR the stress envelope changes; requires periodic re-validation.
- Test-to-pass is biased toward the producer; test-to-fail (HALT, Lesson 3) is needed for design margin discovery.
- Qualification tests to spec limit give no information on design margin (only pass/fail at the limit).
- The DVP&R is a one-shot snapshot — it does not capture the field-reliability feedback loop (CMMS/FRACAS — Production & Operations pillar).
- Multi-mechanism systems require mechanism-specific ALTs — a single AF across mechanisms is invalid.`,
    comparison: `**Qualification vs reliability demonstration:**
- Qualification: deterministic, pass/fail to spec; sample size = 1–3 (representative); acceptance = no failure at spec limit; output = "design meets spec."
- Reliability demonstration: statistical, sample size from OC curve; acceptance = MTBF_L ≥ target (or R ≥ target at CL); output = "design meets reliability target with CL confidence."

**Success-run vs MTBF CI (Lesson 4):**
- Success-run: r = 0 acceptable failures; n = ln(1−CL)/ln(R); time-truncated at T = −ln(1−CL)/λ.
- MTBF CI: r ≥ 0 failures acceptable; MTBF_L = 2T/χ²_{α;2r+2}; allows graceful degradation as failures occur.

**Test vs HALT (Lesson 3):**
- DVP&R test: verifies the design meets the spec or reliability target (positive evidence).
- HALT: discovers the design's destruct limit and operating margin (negative evidence — drives design improvement before release).`,
    practical_application: `- **Automotive — ECU DVP&R**: 47 rows tying each functional/environmental/reliability/regulatory requirement to a verification method and test report; production release requires every row "Pass."
- **Aerospace — avionics LRU**: DO-160 environmental qualification (lightning, HIRF, temperature, altitude) + RTCA/DO-178C software verification + reliability demonstration (success-run MTBF) on the DVP&R.
- **Industrial automation — PLC**: IEC 61131-2 environmental + EMC; DVP&R includes a 1,000-h burn-in + 2,000-h thermal-cycle ALT.
- **Medical devices — IEC 60601-1**: DVP&R includes biocompatibility (ISO 10993), EMC (IEC 60601-1-2), and reliability demonstration (CL ≥ 90%) on the device life-cycle row.`,
    decision_scenario: `You are the CRE on a new industrial controller. Customer spec: MTBF ≥ 100,000 h at 90% confidence (zero-failure), 2,000-h test per unit. (a) Compute n. (b) The program has budget for 50 units — what confidence does that buy at zero failures? (c) The customer accepts a 95% confidence at one acceptable failure — recompute n and discuss the OC curve trade-off.`,
    practice_questions: `- **Q1 (Easy, Recall):** State the success-run formula n = ln(1 − CL)/ln(R) and identify each variable.
- **Q2 (Medium, Calculation):** Compute n for CL = 0.90, MTBF_target = 50,000 h, t_unit = 1,000 h, zero-failure.
- **Q3 (Medium, Application):** Construct the OC curve at r_acc = 0, T = 116,000 h. Compute α at M = 50,000 h and β at M = 5,000 h.
- **Q4 (Hard, Analyze):** Explain why similarity is valid for a reused power supply but invalid for a new enclosure; specify the audit evidence required.`,
    certification_questions: `- **CRE-style (Easy):** Which formula gives the zero-failure success-run sample size for a target MTBF? (T = −ln(1 − CL)/λ; n = T/t_unit)
- **CRE-style (Medium, Calculation):** A 2,000-h test on 50 units yields zero failures. Compute MTBF_L at 90% confidence. (MTBF_L = 2·100,000/χ²_{0.10;2} = 200,000/4.605 = 43,430 h)
- **CRE-style (Hard, Analysis):** Compare producer's risk α for the zero-failure test at M = M_target vs M = 2·M_target; explain the bias and the standard practice to mitigate it.`,
    summary: `The DVP&R ties every reliability requirement to a verification method, conditions, sample size, and acceptance criterion. Reliability demonstration uses success-run (zero-failure) or MTBF CI (time-truncated) — sample size from n = ln(1 − CL)/ln(R) or T = −ln(1 − CL)/λ. The OC curve quantifies α and β; the test contract is on the curve, not the pass/fail. Qualification (deterministic, spec-limited) and reliability demonstration (statistical, MTBF-targeted) are distinct DVP&R rows. Similarity is valid only with documented identical design and stress. ALT (Lesson 2) and HALT (Lesson 3) are test methods that populate specific DVP&R rows.`,
    key_takeaways: `- The DVP&R is the master matrix tying requirements to verified test evidence — no orphan requirements, no orphan tests.
- Success-run: T = −ln(1 − CL)/λ; n = T/t_unit. Binomial single-shot: n = ln(1 − CL)/ln(R_target).
- The OC curve contract: α (producer) and β (consumer) at M_target and M_LTPD.
- Qualification ≠ reliability demonstration — different methods, different acceptance.
- Similarity requires identical design AND identical stress, both auditable.
- ALT compresses time at the cost of an acceleration model; HALT discovers design margin (Lessons 2, 3).
- The DVP&R closes at production release only when every row shows "Pass" with a test report ID.`,
    references: `- ASQ CRE Body of Knowledge — Reliability Testing domain.
- ISO 14224:2016 — Collection of reliability and maintenance data for equipment.
- Ebeling (2010), An Introduction to Reliability and Maintainability Engineering, Ch. 11 (Reliability testing — test plans, OC curves, success-run, MTBF CI).
- O'Connor & Kleyner (2012), Practical Reliability Engineering, Ch. 11 (Reliability testing — DVP&R, development testing, qualification, demonstration).
- Nelson (2004), Accelerated Testing, Ch. 1–2 (Test plans, censoring) and Ch. 10 (Step-stress testing).
- Hobbs (2000), Accelerated Reliability Engineering: HALT and HASS, Ch. 1 (Overview of accelerated test methods).`,
  },
  knowledgeObject: {
    title: "Reliability Test Planning & DVP&R",
    domain: "Reliability Testing",
    competency: "Reliability Test Planning & DVP&R",
    topic: "Reliability Test Strategy & Verification",
    concept: "DVP&R, success-run sample size, OC curve, qualification vs demonstration",
    body: {
      definitions: [
        "Design Verification Plan & Report (DVP&R): the master matrix tying each requirement to a verification method, conditions, sample, acceptance criterion, owner, and status.",
        "Qualification test: pass/fail test verifying the design meets the spec envelope (temperature, vibration, electrical).",
        "Reliability demonstration test: statistical test verifying the design meets a quantified reliability target (MTBF, B10, R) with confidence.",
        "Acceptance criterion: the rule defining a pass (e.g., zero failures in T hours; MTBF_L ≥ target).",
        "Operating Characteristic (OC) curve: P(test passes | true MTBF = M) — quantifies producer's risk (1−α) and consumer's risk (β).",
        "Producer's risk (α): probability of rejecting a good design (Type I).",
        "Consumer's risk (β): probability of accepting a bad design (Type II).",
        "Success-run (zero-failure test): a reliability demonstration with r = 0 acceptable failures.",
        "Time-truncated test: stops at a fixed time T regardless of failures (vs failure-truncated at the r-th failure).",
        "Similarity: qualification by inheritance from a previously-qualified sub-assembly — requires documented identical design AND stress.",
      ],
      principles: [
        "Every requirement traces to a verification method, conditions, sample, acceptance criterion — no orphan rows.",
        "Reliability demonstration requires statistical confidence — sample size from CL and R_target.",
        "The OC curve is the test contract — α at M_target, β at M_LTPD.",
        "Time-truncated testing with the χ² MTBF CI (Lesson 4) gives the demonstrated lower bound.",
        "ALT (Lesson 2) compresses time at the cost of an acceleration model.",
        "Similarity is acceptable for reused sub-assemblies with documented identical design AND stress.",
        "Test conditions must mirror the field mission profile; over-test gives false confidence, under-test gives field returns.",
      ],
      components: [
        "Requirement ID (parent requirement trace).",
        "Verification method (analysis / inspection / similarity / test).",
        "Test conditions (stress levels, duty cycle, environmental matrix).",
        "Sample size (n) and test duration (t_unit) — the reliability row's quantitative core.",
        "Acceptance criterion (zero failures, MTBF_L ≥ target, B10 ≥ target).",
        "OC curve (statistical discrimination contract).",
        "Owner / date (accountability).",
        "Status (Planned → In test → Pass / Fail → Re-test pending).",
        "Test report ID (traceable evidence — closed loop with FRACAS).",
      ],
      mechanism: [
        "DVP&R lifecycle: requirements decomposition → method selection → sample size → OC curve negotiation → test execution → pass/fail → FRACAS on failure → re-test → close at production release with every row 'Pass.'",
      ],
      process: [
        "1. Decompose the requirements tree into verifiable sub-requirements; populate DVP&R rows.",
        "2. Choose verification method (analysis / inspection / similarity / test) with justification.",
        "3. For reliability rows: choose CL, R_target or MTBF target, r_acc; compute n and t_unit.",
        "4. Construct the OC curve; negotiate α and β with the customer; lock the test contract.",
        "5. Define test conditions (stress levels, duty cycle, environmental matrix) from field mission profile.",
        "6. Execute tests; record pass/fail and observed failures; upload test reports.",
        "7. For failures: trigger FRACAS root-cause, design iteration, re-test.",
        "8. At production release, close the DVP&R — every row must show 'Pass' with a test report ID.",
        "9. Audit at design review (SRR/PDR/CDR) traces each requirement to a 'Pass' row.",
      ],
      formulas: [
        "Success-run (zero-failure, exponential): T_required = −ln(1 − CL)/λ  ; n = T_required/t_unit.",
        "Binomial single-shot: n = ln(1 − CL)/ln(R_target) (round up).",
        "MTBF lower bound (time-truncated): MTBF_L = 2T/χ²_{α;2r+2}; upper bound: MTBF_U = 2T/χ²_{1−α/2;2r}.",
        "OC curve: P(test passes | M) = Σ_{i=0}^{r_acc} (MT)^i·exp(−M·T)/i!  for exponential.",
        "Producer's risk: α = 1 − P_pass(M = M_target).",
        "Consumer's risk: β = P_pass(M = M_LTPD).",
        "Acceleration factor (Lesson 2): AF = t_use / t_acc.",
      ],
      metrics: [
        "Sample size n [dimensionless].",
        "Total unit-hours T [h].",
        "Confidence level CL [dimensionless 0..1].",
        "Producer's risk α and consumer's risk β [dimensionless].",
        "Demonstrated MTBF lower bound MTBF_L [h].",
        "Acceptance number r [dimensionless].",
        "DVP&R coverage (% requirements with 'Pass' status) [%].",
        "Test cost = n × unit cost + facility + labor [$].",
      ],
      examples: [
        "ECU success-run: CL = 0.90, MTBF = 50,000 h, t_unit = 1,000 h → n = 116 units, T = 116,000 unit-hours.",
        "Binomial single-shot: CL = 0.90, R_target = 0.95 → n = ln(0.10)/ln(0.95) = 45 units.",
        "MTBF_L from a 2,000-h × 50-unit zero-failure test = 2·100,000/χ²_{0.10;2} = 200,000/4.605 = 43,430 h.",
        "OC at r_acc = 0, T = 116,000 h: P_pass(50,000) = exp(−2.32) = 9.8% (α = 90.2%); P_pass(500,000) = exp(−0.232) = 79.3%.",
      ],
      industrial_examples: [
        "Automotive — ECU DVP&R: 47 rows; functional, environmental (ISO 16750), EMC (CISPR 25, ISO 11452), reliability (1,000-h thermal-cycle + 2,000-h +85 °C storage ALT with AF), regulatory (UN ECE R10).",
        "Aerospace — avionics LRU: DO-160 environmental + DO-178C software + reliability demonstration success-run on MTBF row.",
        "Industrial automation — PLC: IEC 61131-2 + EMC; 1,000-h burn-in + 2,000-h thermal-cycle ALT.",
        "Medical devices — IEC 60601-1: biocompatibility (ISO 10993), EMC (60601-1-2), reliability demonstration ≥ 90% CL.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Avionics LRU DVP&R reliability row 'MTBF ≥ 25,000 h at 90% CL, zero-failure' → n = 29 units at $80k = $2.3M test cost. CRE evaluated (a) extending t_unit to 4,000 h → n = 15 ($1.2M); (b) ALT at +70 °C with Ea = 0.65 eV (AF ≈ 25). Path (b) rejected: multi-mechanism LRU (silicon Ea = 0.65 eV, solder Ea = 0.4 eV) requires mechanism-specific ALT (Nelson Ch. 7), out of scope. Selected (a) extended time at use condition. Method per Ebeling (Ch. 11) and Nelson (Ch. 1–2).",
      ],
      common_errors: [
        "Reporting observed MTBF on the sample as the demonstrated MTBF; demonstrated is the lower bound MTBF_L.",
        "Using similarity for new designs or stress envelopes without audit evidence.",
        "Choosing n without the OC curve — β at M_LTPD is the contract.",
        "Under-specifying the duty cycle (temperature, electrical load, vibration profile).",
        "Confusing qualification (deterministic spec pass) with reliability demonstration (statistical MTBF evidence).",
        "Using ALT (Lesson 2) without a valid acceleration model — over-stress test ≠ reliability demonstration.",
        "Closing the DVP&R with open 'Fail' rows — production release requires all rows 'Pass.'",
      ],
      limitations: [
        "Exponential (constant-λ) assumption invalid in wear-out — Weibull/LOGNOR test plans required.",
        "Small samples cannot discriminate M_target from 2×M_target — β at 2×M_target is high for n < 50.",
        "Similarity invalid when design OR stress changes — requires re-validation.",
        "Test-to-pass gives no design-margin information — HALT (Lesson 3) needed for margin discovery.",
        "Qualification to spec limit gives no information beyond the limit — no margin.",
        "DVP&R is one-shot — does not capture the field-reliability feedback loop (CMMS/FRACAS).",
        "Multi-mechanism ALT requires mechanism-specific AFs — single AF across mechanisms is invalid.",
      ],
      best_practices: [
        "Always report the demonstrated MTBF as the lower bound MTBF_L = 2T/χ²_{α;2r+2}, not the sample mean.",
        "Construct the OC curve before locking the test plan; negotiate α, β with the customer.",
        "For zero-failure tests, set M_target = 3× to 10× the consumer's M_LTPD so producer's risk is acceptable.",
        "Document similarity audits: identical design (schematic/BOM), identical stress (thermal, vibration, electrical).",
        "Specify the duty cycle fully: temperature profile, electrical load, vibration PSD, dwell times.",
        "Use ALT (Lesson 2) only with a validated acceleration model (Arrhenius, Coffin-Manson, inverse-power).",
        "Trigger FRACAS on every test failure; iterate design; re-test until 'Pass' — never close with 'Fail' rows.",
      ],
      related_concepts: [
        "Accelerated Life Testing (ALT) — Lesson 2 (compresses test time via AF).",
        "HALT & HASS — Lesson 3 (design-margin discovery and screening).",
        "Reliability Demonstration & Success-Run — Lesson 4 (χ² MTBF CI, sequential testing).",
        "Reliability Fundamentals (RF) — R(t), exponential, MTBF inputs.",
        "Reliability in Design & Development (RDD) — FMEA/FMECA, requirements flow-down feeding DVP&R rows.",
      ],
      prerequisites: [
        "ASQ CRE BOK RF — R(t), exponential, MTBF, failure-rate behavior.",
        "ASQ CRE BOK PS — binomial, Poisson, χ² distribution, confidence intervals.",
        "ASQ CRE BOK RDD — requirements flow-down, FMEA, design reviews.",
        "Familiarity with ISO 16750, MIL-STD-810, IEC 60068 environmental test standards.",
      ],
      references: [
        "ASQ CRE Body of Knowledge — Reliability Testing domain.",
        "ISO 14224:2016 — Collection of reliability and maintenance data for equipment.",
        "Ebeling (2010), Ch. 11 (Reliability testing — test plans, OC curves, success-run).",
        "O'Connor & Kleyner (2012), Ch. 11 (Reliability testing — DVP&R, qualification, demonstration).",
        "Nelson (2004), Ch. 1–2 (Test plans, censoring) and Ch. 10 (Step-stress testing).",
        "Hobbs (2000), Ch. 1 (Overview of accelerated test methods).",
      ],
    },
  },
  questions: [
    {
      competencyName: "Reliability Test Planning & DVP&R",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which formula gives the success-run (zero-failure) sample size for an exponential distribution with target MTBF and confidence level CL, where t_unit is the per-unit test time?",
      whyCorrect:
        "The success-run formula derives from the exponential reliability R(t) = exp(−λ·t). For zero failures, the test passes iff the cumulative unit-hours T reaches −ln(1 − CL)/λ (i.e., the time at which the no-failure probability drops to 1 − CL). The required unit-hours T_required = −ln(1 − CL)/λ, and the sample size n = T_required/t_unit. The binomial single-shot equivalent is n = ln(1 − CL)/ln(R_target) for a single-shot pass at reliability R_target. Both formulas are the workhorse of CRE-style success-run sample-size selection.",
      whyOthersWrong: [
        "Option A (n = CL/λ) — incorrect: it omits the logarithm; CL/λ gives a unit-hour quantity, not a sample size, and ignores the geometric progression of zero-failure probability.",
        "Option C (n = λ·t_unit) — incorrect: this gives the expected number of failures per unit-test (a rate, not a sample size), with no CL in the formula at all.",
        "Option D (n = CL/t_unit) — incorrect: confidence level divided by test time is dimensionally wrong (CL is dimensionless; t_unit is in hours) and has no link to the failure rate λ or the target reliability.",
      ],
      explanation:
        "Success-run: T_required = −ln(1 − CL)/λ, then n = T_required/t_unit. For CL = 0.90, MTBF = 50,000 h (λ = 2×10⁻⁵), t_unit = 1,000 h: n = 116 units, T = 116,000 unit-hours.",
      options: [
        { text: "n = CL/λ × t_unit", isCorrect: false },
        { text: "T = −ln(1 − CL)/λ ; n = T/t_unit", isCorrect: true },
        { text: "n = λ × t_unit", isCorrect: false },
        { text: "n = CL/t_unit", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability Test Planning & DVP&R",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Automotive",
      stem: "An automotive ECU must demonstrate MTBF ≥ 50,000 h at 90% confidence (zero-failure, exponential). Each test unit runs 1,000 h. Compute the required sample size n.",
      whyCorrect:
        "Step 1: convert CL and MTBF to the required unit-hours. T_required = −ln(1 − CL)/λ = −ln(1 − 0.90)/(1/50,000) = −ln(0.10) × 50,000 = 2.302585 × 50,000 = 115,129 h. Step 2: divide by per-unit test time. n = T_required/t_unit = 115,129/1,000 = 115.13 → 116 units (round up — fractional units are not physical). Test execution: 116 ECUs × 1,000 h = 116,000 unit-hours, zero failures → MTBF_L = 2·116,000/χ²_{0.10;2} = 232,000/4.605 = 50,380 h ≥ 50,000 h ✓.",
      whyOthersWrong: [
        "Option A (n = 50 units) — incorrect: computes 50,000/1,000 = 50 (target MTBF / t_unit), omitting the −ln(1−CL)/λ structure; ignores confidence level entirely.",
        "Option B (n = 12 units) — incorrect: assumes ALT acceleration factor (AF = 50 at +85 °C with Ea = 0.7 eV — Lesson 2) without stating ALT; use-condition success-run is n = 116.",
        "Option D (n = 1000 units) — incorrect: inverts the ratio (t_unit/λ × CL) producing a meaningless large number with no CL logarithm.",
      ],
      explanation:
        "T_required = −ln(0.10)/2×10⁻⁵ = 2.3026/2×10⁻⁵ = 115,129 h; n = 115,129/1,000 = 116 units. 116,000 unit-hours zero-failure ⇒ MTBF_L = 50,380 h ≥ 50,000 h at 90% CL.",
      options: [
        { text: "n = 50 units (MTBF / t_unit)", isCorrect: false },
        { text: "n = 116 units (−ln(1−CL)/λ divided by t_unit)", isCorrect: true },
        { text: "n = 12 units (assuming ALT AF = 50)", isCorrect: false },
        { text: "n = 1000 units (t_unit / (λ·CL))", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability Test Planning & DVP&R",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Scenario",
      skillType: "Procedural",
      scenario: "Aerospace",
      stem: "On a DVP&R, a reliability row reads 'MTBF ≥ 25,000 h at 90% CL, zero-failure, t_unit = 2,000 h.' The program has budget for 50 units (n = 50). What confidence does the 50-unit, 2,000-h test buy at zero failures, and what is the appropriate CRE response?",
      whyCorrect:
        "Rearrange the success-run formula to solve for CL: T_required = n × t_unit = 50 × 2,000 = 100,000 unit-hours. T_required = −ln(1 − CL)/λ → 1 − CL = exp(−λ × T_required) = exp(−100,000/25,000) = exp(−4) = 0.0183 → CL = 1 − 0.0183 = 0.9817 = 98.17%. The 50-unit, 2,000-h test at zero failures demonstrates MTBF ≥ 25,000 h at ~98% confidence — exceeding the customer's 90% CL requirement. CRE response: accept the test plan; document the achieved CL on the DVP&R report. Alternatively, the program could reduce n to 29 units (T_required = −ln(0.10)·25,000 = 57,565 h; n = 57,565/2,000 = 29) and still meet the 90% CL spec.",
      whyOthersWrong: [
        "Option A (CL = 50%; reject the test as under-specified) — incorrect: arithmetic error (n/t_unit instead of using the logarithm); the achieved CL is ~98%, not 50%.",
        "Option B (CL = 90% exactly; accept as planned) — incorrect: this is the customer's spec floor; the 50-unit plan overshoots 90% CL to ~98% CL — the CRE should note the surplus and consider reducing n to save test cost.",
        "Option D (CL = 100% — 50 units × 2,000 h proves the design is failure-free) — incorrect: no finite test gives 100% confidence; the zero-failure test's CL asymptotes as T grows but never reaches 100%.",
      ],
      explanation:
        "T = 50 × 2,000 = 100,000 h; CL = 1 − exp(−T/MTBF) = 1 − exp(−4) = 0.9817 = 98.17%. The 50-unit plan overshoots the 90% CL spec — the CRE can accept or reduce n to 29 units.",
      options: [
        { text: "CL ≈ 50%; reject the plan and increase n", isCorrect: false },
        { text: "CL ≈ 98%; accept or reduce n to 29 units (meets 90% CL spec at lower cost)", isCorrect: true },
        { text: "CL = 90% exactly; accept as planned", isCorrect: false },
        { text: "CL = 100%; the design is proven failure-free", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability Test Planning & DVP&R",
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Automotive",
      stem: "True or False: For a zero-failure success-run test at confidence level CL against a target MTBF M_target, the producer's risk α (probability of rejecting a design whose true MTBF is exactly M_target) equals 1 − CL.",
      whyCorrect:
        "FALSE. The success-run plan is sized so that P_pass(M = M_target) = exp(−T/M_target) = exp(−(−ln(1 − CL))) = 1 − CL — i.e., for CL = 0.90 the test passes with only 10% probability when the design is exactly at target. The producer's risk is α = 1 − P_pass(M_target) = 1 − (1 − CL) = CL, NOT 1 − CL. So for CL = 0.90, α = 0.90 (90% chance of rejecting a design that is exactly at target — the well-known bias of zero-failure success-run against the producer). The 1 − CL value is the PASS probability at M_target, not the producer's risk. The standard practice is to set the test target M_target = 3× to 10× the consumer's M_LTPD so good designs have ≥ 80–90% pass rate (OC curve rising from β at M_LTPD to ~1 at 3–10×M_LTPD).",
      whyOthersWrong: [
        "TRUE — would imply α = 1 − CL at M_target (e.g., α = 10% for CL = 90%); in fact the success-run plan is sized so that P_pass(M_target) = 1 − CL, and the producer's risk α = 1 − P_pass = CL (e.g., α = 90% for CL = 90%). The 1 − CL value is the pass probability, not the producer's risk — the two quantities are complements.",
      ],
      explanation:
        "FALSE. P_pass(M_target) = 1 − CL (test passes with 1 − CL probability at target). Producer's risk α = 1 − P_pass(M_target) = CL (not 1 − CL). For CL = 0.90: P_pass(M_target) = 10%, α = 90% — zero-failure success-run is biased against the producer at M = M_target. Standard practice: M_target = 3× to 10× the consumer's M_LTPD so producer's pass rate ≥ 80–90%.",
      options: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Accelerated Life Testing (ALT)
// (Competency: "Accelerated Life Testing (ALT)"; slug: rt-accelerated-life-testing)
// ---------------------------------------------------------------------------

const LESSON_ALT: RefLesson = {
  competencyName: "Accelerated Life Testing (ALT)",
  slug: "rt-accelerated-life-testing",
  title: "Accelerated Life Testing (ALT) — Arrhenius, Eyring, Coffin-Manson, Inverse-Power",
  titleAr: "اختبار الحياة المعجل (ALT)",
  order: 2,
  durationMin: 35,
  references: RT_REFERENCE_TITLES,
  conceptIntroduction: `Accelerated Life Testing (ALT) compresses the calendar time required to demonstrate a reliability target by testing at stress levels higher than the use condition, then extrapolating back through an acceleration model. The Acceleration Factor (AF) is the ratio of equivalent use-condition time to test-condition time: AF = t_use / t_acc. ALT is appropriate when (i) the failure mechanism is well understood and dominated by a single stress (temperature, voltage, thermal-cycle, mechanical strain); (ii) the acceleration model is empirically validated for that mechanism; (iii) the test stress is below the mechanism-change threshold (no new failure mechanism introduced). The four canonical acceleration models are: Arrhenius (temperature, electronic-aging — Ea in eV, Boltzmann constant k); Eyring (generalized temperature with entropy prefactor); Coffin-Manson (low-cycle fatigue, thermal cycling — ΔT and exponent m); and Inverse-Power (voltage, mechanical stress — V or S with exponent n). The reliability engineer selects the model by failure mechanism, fits the parameters (Ea, m, n) from multi-stress ALT data, and computes AF to size the test plan.`,
  example: `A silicon CMOS device has a use-condition T_use = 55 °C (328 K) and is tested at T_acc = 125 °C (398 K). The activation energy for the gate-oxide wear-out mechanism is Ea = 0.7 eV. Arrhenius AF = exp[(Ea/k)·(1/T_use − 1/T_acc)] where k = 8.617×10⁻⁵ eV/K (Boltzmann constant). Compute the bracket: 1/328 − 1/398 = 0.003048 − 0.002513 = 0.000535 K⁻¹. Exponent: (0.7/8.617×10⁻⁵) × 0.000535 = 8126.7 × 0.000535 = 4.348. AF = exp(4.348) = 77.3×. So 1,000 h of ALT at 125 °C is equivalent to 77,300 h (8.8 years) at 55 °C use. A 2,000-h ALT × 12 units × AF = 77.3 = 1,855,000 equivalent use hours — sufficient to demonstrate MTBF ≥ 50,000 h at CL = 90% (Lesson 1, T_required = 115,000 unit-hours).`,
  keyFormulas: `Arrhenius (temperature, single-stress): AF = exp[(Ea/k)·(1/T_use − 1/T_acc)]
  Ea = activation energy [eV]; k = 8.617×10⁻⁵ eV/K; T in Kelvin.
  Typical Ea: silicon 0.6–0.7 eV; electrolytic capacitor 0.6 eV; solder joint 0.4–0.5 eV; insulation 1.0 eV.
Eyring (generalized temperature): AF = (T_use/T_acc)·exp[(Ea/k)·(1/T_use − 1/T_acc)]·exp[(C·ΔT)/k·T_use·T_acc]
  Simplified Eyring drops the temperature pre-factor and the entropy term — reduces to Arrhenius.
Coffin-Manson (low-cycle fatigue, thermal cycling): AF = (ΔT_acc / ΔT_use)^m
  ΔT = peak-to-peak temperature swing [K]; m = fatigue exponent.
  Typical m: solder 1.5–3.0 (SnPb ≈ 1.9, SAC ≈ 2.5–3.0); metal fatigue 2–4.
Inverse-Power (voltage, mechanical stress): AF = (V_acc / V_use)^n  or  AF = (S_acc / S_use)^n
  V = voltage [V]; S = mechanical stress [MPa]; n = power-law exponent.
  Typical n: capacitor dielectric 3–5; bearing wear 3; solder mechanical 4–6.
Generalized Eyring (multi-stress, T+V): AF = (T_use/T_acc)·exp[(Ea/k)·(1/T_use − 1/T_acc)]·(V_acc/V_use)^n·exp[(B·V)/(k·T_use·T_acc)]
AF definition: AF = t_use / t_acc; reliability equivalence: R_use(t_use) = R_acc(t_acc) for the same cumulative damage.`,
  exercise: `You are the CRE on a power-electronics module. The use condition is T_use = 45 °C, V_use = 24 V DC. The dominant failure mechanism is IGBT bond-wire fatigue (Coffin-Manson, m = 3) for thermal cycling and gate-oxide wear (Arrhenius, Ea = 0.65 eV) for steady-state temperature. (a) Compute the Arrhenius AF for an ALT at T_acc = 125 °C. (b) Compute the Coffin-Manson AF for a thermal-cycle ALT with ΔT_use = 25 K and ΔT_acc = 80 K. (c) Determine the ALT test duration needed to demonstrate 100,000-h use MTBF at 90% CL zero-failure. (d) Justify why the two AFs cannot be combined into a single multiplier.`,
  sections: {
    learning_objectives: `- Define Accelerated Life Testing (ALT) and the Acceleration Factor (AF = t_use/t_acc).
- Apply the Arrhenius model AF = exp[(Ea/k)·(1/T_use − 1/T_acc)] for temperature-driven mechanisms (silicon aging, insulation).
- Apply the Coffin-Manson model AF = (ΔT_acc/ΔT_use)^m for low-cycle thermal-cycle fatigue (solder joints).
- Apply the Inverse-Power model AF = (V_acc/V_use)^n for voltage/mechanical-stress-driven mechanisms (dielectric, bearing wear).
- Recognize the Eyring model as the generalized form of Arrhenius with a temperature pre-factor and entropy term.
- Identify the mechanism-change threshold above which ALT is invalid (new failure mechanism introduced).
- Size an ALT test plan from AF: required use-time / AF = test time at the accelerated condition.`,
    prerequisites: `- ASQ CRE BOK RF — R(t), exponential and Weibull, MTBF, failure mechanisms.
- ASQ CRE BOK PS — maximum-likelihood estimation, regression on transformed data, confidence intervals.
- ASQ CRE BOK RDD — FMEA/FMECA identifies the dominant failure mechanism (drives model choice).
- Familiarity with semiconductor physics (Boltzmann constant, activation energy, electron-volt) and basic thermal-cycle fatigue theory.`,
    introduction: `ALT is the workhorse of reliability testing when the use-condition MTBF target (10,000–1,000,000 h) cannot be demonstrated in available calendar time. The principle: test at stress S_acc > S_use (where S is temperature, voltage, mechanical stress, or thermal-cycle amplitude), measure the time-to-failure distribution at S_acc, and extrapolate back to S_use via an acceleration model. The Acceleration Factor AF = t_use/t_acc is the ratio of equivalent use-condition time to test-condition time; AF depends on the stress ratio (T_acc/T_use, V_acc/V_use) and mechanism-specific parameters (Ea, m, n).

The four canonical acceleration models, by failure mechanism:
- **Arrhenius** (temperature, single-stress): AF = exp[(Ea/k)·(1/T_use − 1/T_acc)]. Models reaction-rate-dominated aging — silicon gate-oxide wear (Ea = 0.6–0.7 eV), insulation degradation (Ea = 1.0 eV), electrolytic-capacitor electrolyte dry-out (Ea = 0.6 eV), battery calendar aging. The single parameter is the activation energy Ea in eV; the Boltzmann constant k = 8.617×10⁻⁵ eV/K.
- **Eyring** (generalized temperature): AF = (T_use/T_acc)·exp[(Ea/k)·(1/T_use − 1/T_acc)]·exp[entropy term]. Reduces to Arrhenius when the pre-factor and entropy terms are dropped. Used in semiconductor-aging literature for first-principles derivation.
- **Coffin-Manson** (low-cycle fatigue, thermal cycling): AF = (ΔT_acc/ΔT_use)^m. Models plastic-strain-dominated fatigue — solder-joint thermal-cycle failure (m = 1.9 SnPb, m = 2.5–3.0 SAC), metal fatigue (m = 2–4). The single parameter is the fatigue exponent m.
- **Inverse-Power** (voltage, mechanical stress): AF = (V_acc/V_use)^n or AF = (S_acc/S_use)^n. Models stress-driven mechanisms — capacitor dielectric breakdown (n = 3–5), bearing wear (n = 3), solder mechanical fatigue (n = 4–6).

The reliability engineer's responsibility: (i) identify the dominant failure mechanism from FMEA/FMECA; (ii) select the appropriate acceleration model; (iii) fit the model parameters (Ea, m, n) from multi-stress ALT data (typically 3+ stress levels, each with multiple units); (iv) validate the model by checking mechanism stability (failure-mode analysis at each stress level — same mechanism?); (v) compute AF and size the test plan (test time = use time / AF); (vi) document the model risk (extrapolation beyond the validated stress range).`,
    terminology: `- **Acceleration Factor (AF)**: ratio t_use/t_acc; the time-compression multiplier from accelerated to use condition.
- **Arrhenius model**: AF = exp[(Ea/k)·(1/T_use − 1/T_acc)]; temperature-driven reaction-rate aging.
- **Eyring model**: generalized Arrhenius with a (T_use/T_acc) pre-factor and an entropy term.
- **Coffin-Manson model**: AF = (ΔT_acc/ΔT_use)^m; low-cycle thermal-cycle fatigue.
- **Inverse-Power model**: AF = (V_acc/V_use)^n or (S_acc/S_use)^n; voltage or mechanical-stress aging.
- **Activation energy (Ea)**: Arrhenius parameter in eV; mechanism-specific (silicon 0.6–0.7 eV; insulation 1.0 eV).
- **Boltzmann constant (k)**: 8.617×10⁻⁵ eV/K (or 1.381×10⁻²³ J/K).
- **Fatigue exponent (m)**: Coffin-Manson parameter (SnPb solder 1.9; SAC solder 2.5–3.0).
- **Power-law exponent (n)**: Inverse-Power parameter (capacitor dielectric 3–5; bearing 3; solder mechanical 4–6).
- **Mechanism-change threshold**: stress level above which a NEW failure mechanism appears (invalidates ALT).
- **Use condition (S_use)**: field stress the product experiences in operation.
- **Accelerated condition (S_acc)**: elevated stress used in ALT.
- **Step-stress ALT**: progressive stress increase (constant rate or steps) to compress further — see Lesson 3 HALT for the extreme case.`,
    detailed_explanation: `The Arrhenius model is the most widely applied ALT model. Its physical basis is the reaction-rate theory: a degradation mechanism (oxidation, electromigration, dielectric breakdown) proceeds at a rate proportional to exp(−Ea/kT), where Ea is the mechanism's activation energy and kT is the thermal energy. Time-to-failure scales inversely with reaction rate: t ∝ 1/r ∝ exp(Ea/kT). The AF between two temperatures: AF = t_use/t_acc = exp(Ea/kT_acc) / exp(Ea/kT_use) = exp[(Ea/k)·(1/T_use − 1/T_acc)]. With Ea = 0.7 eV, T_use = 328 K (55 °C), T_acc = 398 K (125 °C): AF = exp[(0.7/8.617×10⁻⁵)·(1/328 − 1/398)] = exp[8126.7 × 0.000535] = exp(4.348) = 77.3×. So 1,000 h at 125 °C is equivalent to 77,300 h (8.8 years) at 55 °C — a 77× compression of calendar time.

The Coffin-Manson model is the workhorse for solder-joint thermal-cycle fatigue. Physical basis: low-cycle fatigue (plastic-strain-dominated) follows the Manson-Coffin relation N_f = C·(Δε_p)^c, where Δε_p is the plastic strain range and c ≈ −0.5 to −0.7. The plastic strain range is approximately proportional to the temperature swing ΔT (for the same package/PCB system), so N_f ∝ ΔT^m with m = −c ≈ 0.5 to 0.7. Wait — the canonical Coffin-Manson exponent for thermal-cycle solder fatigue is m ≈ 1.5–3.0, with the higher value reflecting elastic-plastic interaction in the solder. The AF: AF = N_f,use / N_f,acc = (ΔT_acc/ΔT_use)^m. With m = 2.5 (SAC solder), ΔT_use = 25 K (field thermal cycle), ΔT_acc = 80 K (test thermal cycle): AF = (80/25)^2.5 = 3.2^2.5 = 18.3×. So 1,000 thermal cycles at ΔT_acc = 80 K is equivalent to 18,300 cycles at ΔT_use = 25 K — typical of an IPC-TM-650 / IEC 60068-2-14 Nb thermal-cycle ALT.

The Inverse-Power model applies to voltage- and mechanical-stress-driven mechanisms. AF = (V_acc/V_use)^n or (S_acc/S_use)^n. For a capacitor tested at V_acc = 1.5 × rated V_use with n = 4 (dielectric): AF = (1.5)^4 = 5.06×. For bearing wear at S_acc = 2 × S_use with n = 3: AF = 2³ = 8×. The Inverse-Power model is the workhorse for capacitor endurance (IEC 60384-6), bearing life (ISO 281), and solder mechanical fatigue (IPC-9701).

The **mechanism-change threshold** is the single most important validity check. ALT is valid ONLY if the failure mechanism at S_acc is the SAME as at S_use. For example: a silicon device with Ea = 0.7 eV at T_use = 55 °C fails by gate-oxide wear-out (the modeled mechanism). At T_acc = 175 °C, the same device might fail by electromigration (a different mechanism with Ea = 0.9 eV — different physical process). Extrapolating the 175 °C ALT result to 55 °C use would then over-predict use life by ~10× — the model is invalid. The validation: SEM/EDX failure-mode analysis on a sample of failed units at EACH stress level — if the failure mode changes, the model is invalid above the threshold and ALT must be re-run at a lower S_acc.

ALT test-plan sizing: AF = t_use / t_acc → t_acc = t_use / AF. For a 50,000-h MTBF target (zero-failure, 90% CL → T_required = 115,000 unit-hours at use condition): with AF = 77 (Arrhenius, Ea = 0.7 eV, 55 °C → 125 °C), t_acc = 115,000/77 = 1,494 h. Sample size n = t_acc/t_unit. With t_unit = 200 h/unit (chamber-time-limited): n = 1,494/200 = 7.5 → 8 units. So 8 units × 200 h × AF = 77 = 123,200 equivalent use hours — sufficient for the demonstration.

The **multi-stress generalized Eyring** combines temperature and a second stress (voltage, humidity). AF = (T_use/T_acc)·exp[(Ea/k)·(1/T_use − 1/T_acc)]·(V_acc/V_use)^n·exp[(B·V)/(k·T_use·T_acc)]. This is the workhorse for capacitor humidity-temperature-voltage ALT (IEC 60384) and GaN/IGBT power-cycling ALT. Multi-mechanism systems (e.g., a power module with both bond-wire fatigue and gate-oxide wear) require separate mechanism-specific ALTs and a combined reliability model — a single AF across mechanisms is invalid (see Lesson 1 case study).`,
    core_principles: `- AF = t_use/t_acc — the time-compression multiplier from accelerated to use condition.
- Arrhenius (T, single-stress): AF = exp[(Ea/k)·(1/T_use − 1/T_acc)] — temperature-driven reaction-rate aging.
- Coffin-Manson (ΔT, low-cycle fatigue): AF = (ΔT_acc/ΔT_use)^m — solder-joint thermal-cycle fatigue.
- Inverse-Power (V or S): AF = (V_acc/V_use)^n or (S_acc/S_use)^n — stress-driven dielectric/bearing/solder mechanical.
- Eyring is the generalized Arrhenius; the simplified form drops the pre-factor and entropy term.
- ALT validity requires the SAME failure mechanism at S_acc and S_use — checked by failure-mode analysis (SEM/EDX).
- The mechanism-change threshold is the upper stress limit; above it, the model breaks and a new mechanism dominates.
- Multi-mechanism systems require mechanism-specific ALTs; a single AF across mechanisms is invalid.`,
    components: `- **Use condition (S_use)**: field stress the product experiences in operation.
- **Accelerated condition (S_acc)**: elevated stress in ALT.
- **Acceleration model**: Arrhenius / Eyring / Coffin-Manson / Inverse-Power / generalized Eyring.
- **Mechanism parameters**: Ea (Arrhenius), m (Coffin-Manson), n (Inverse-Power).
- **Boltzmann constant k = 8.617×10⁻⁵ eV/K** (Arrhenius/Eyring).
- **Acceleration Factor (AF)**: t_use/t_acc — the model output.
- **Multi-stress matrix**: 3+ stress levels × multiple units per level for parameter fitting.
- **Failure-mode analysis (SEM/EDX, cross-section, XRD)**: validates mechanism stability across stress levels.
- **Maximum-likelihood fit**: estimates Ea/m/n with confidence intervals from censored ALT data (Nelson Ch. 7).
- **Test-plan sizing**: t_acc = t_use / AF; n = t_acc / t_unit.`,
    process: `1. Identify the dominant failure mechanism from FMEA/FMECA (RDD pillar) — drives model choice.
2. Select the acceleration model: Arrhenius (T, reaction-rate), Coffin-Manson (ΔT, low-cycle fatigue), Inverse-Power (V or S, stress-driven).
3. Fit mechanism parameters (Ea, m, n) from multi-stress ALT (3+ stress levels, multiple units per level, MLE per Nelson Ch. 7) OR use published values (silicon Ea = 0.6–0.7 eV; SAC solder m = 2.5–3.0; capacitor dielectric n = 3–5).
4. Validate mechanism stability: failure-mode analysis on a sample of failed units at EACH stress level — same mechanism? If not, lower S_acc and re-run.
5. Compute AF for the chosen S_acc and the use condition S_use.
6. Size the test plan: t_acc = t_use / AF; n = t_acc / t_unit; ensure n × t_unit × AF ≥ T_required (success-run formula from Lesson 1).
7. Execute ALT; record failures by time and stress level.
8. Analyze: fit life distribution (Weibull or Lognormal) at each stress level; fit acceleration model; compute use-condition life and CI.
9. Document model risk: extrapolation beyond the validated stress range; mechanism-change threshold; multi-mechanism caveat.`,
    formula_calculation: `Variables and formulas:
- AF: acceleration factor — dimensionless; AF = t_use/t_acc.
- T: absolute temperature — Kelvin (K); T(K) = T(°C) + 273.15.
- ΔT: peak-to-peak thermal-cycle swing — K.
- V: voltage — Volts (V).
- S: mechanical stress — MPa.
- Ea: activation energy — electron-volts (eV); 1 eV = 1.602×10⁻¹⁹ J.
- k: Boltzmann constant — 8.617×10⁻⁵ eV/K (= 1.381×10⁻²³ J/K).
- m: Coffin-Manson fatigue exponent — dimensionless.
- n: Inverse-Power stress exponent — dimensionless.

Formulas:
- Arrhenius: AF = exp[(Ea/k)·(1/T_use − 1/T_acc)].
- Eyring: AF = (T_use/T_acc)·exp[(Ea/k)·(1/T_use − 1/T_acc)]·exp[(C·ΔT)/(k·T_use·T_acc)] — simplified to Arrhenius when pre-factor and entropy term dropped.
- Coffin-Manson: AF = (ΔT_acc/ΔT_use)^m.
- Inverse-Power: AF = (V_acc/V_use)^n or AF = (S_acc/S_use)^n.
- Generalized Eyring (multi-stress T+V): AF = (T_use/T_acc)·exp[(Ea/k)·(1/T_use − 1/T_acc)]·(V_acc/V_use)^n·exp[(B·V)/(k·T_use·T_acc)].
- Test-plan sizing: t_acc = t_use / AF; n = t_acc / t_unit.
- Use-condition reliability: R_use(t_use) = R_acc(t_acc) for the same cumulative damage (Miner's rule for fatigue).

Units: T in K; ΔT in K; V in V; S in MPa; Ea in eV; k in eV/K; t in h; AF, m, n, CL dimensionless.

Assumptions: (i) the failure mechanism is the same at S_acc and S_use (mechanism-stability validity check); (ii) the model is empirically validated in the stress range S_use → S_acc (no extrapolation beyond validated range); (iii) the stress is the dominant acceleration variable (other stresses at use level); (iv) failure-time distribution is constant-shape across stress levels (Weibull β constant — Nelson Ch. 7); (v) specimen-to-specimen variability is captured in the sample size and CI.

Interpretation: AF = 77 means 1 h at S_acc = 1/77 h at S_use (equivalent cumulative damage). The use-condition reliability target (MTBF, B10) is demonstrated when the AF-weighted unit-hours meet the success-run T_required from Lesson 1.`,
    worked_example: `**Silicon CMOS Arrhenius ALT — Ea = 0.7 eV.**
Given: T_use = 55 °C = 328.15 K; T_acc = 125 °C = 398.15 K; Ea = 0.7 eV; k = 8.617×10⁻⁵ eV/K.
Step 1 — temperature reciprocals: 1/T_use = 1/328.15 = 0.003047 K⁻¹; 1/T_acc = 1/398.15 = 0.002512 K⁻¹.
Step 2 — bracket: 1/T_use − 1/T_acc = 0.003047 − 0.002512 = 0.000535 K⁻¹.
Step 3 — exponent: (Ea/k) × bracket = (0.7/8.617×10⁻⁵) × 0.000535 = 8126.7 × 0.000535 = 4.348.
Step 4 — AF: exp(4.348) = 77.3× (e^4 = 54.6, e^0.348 = 1.416 → 54.6 × 1.416 = 77.3).
Step 5 — equivalent use time: 1,000 h at 125 °C ≡ 77,300 h (8.83 years) at 55 °C.

**Solder-joint Coffin-Manson ALT — SAC, m = 2.5.**
Given: ΔT_use = 25 K (field thermal cycle, e.g., consumer indoor); ΔT_acc = 80 K (IPC-TM-650 test cycle, −40 to +105 °C ΔT = 145? — let's use the swing from 25 K to 80 K). AF = (80/25)^2.5 = 3.2^2.5.
Step 1: ln(3.2) = 1.163; exponent = 2.5 × 1.163 = 2.9075; AF = exp(2.9075) = 18.3×.
Step 2 — equivalent field cycles: 1,000 test cycles ≡ 18,300 field cycles at ΔT_use = 25 K. At 1 cycle/day in the field, 18,300 cycles = 50.1 years (well beyond the 10-year design life — sufficient).

**ALT test-plan sizing — 50,000-h MTBF at 90% CL zero-failure.**
T_required (use) = 115,000 unit-hours (Lesson 1 success-run).
With Arrhenius AF = 77: t_acc (test time) = 115,000/77 = 1,494 h.
With t_unit = 200 h (chamber limited): n = 1,494/200 = 7.5 → 8 units.
Verify: 8 units × 200 h × 77 = 123,200 equivalent use hours ≥ 115,000 ✓.`,
    industrial_example: `**Electronics — automotive ECU ALT.** A body-control module has silicon aging (Arrhenius, Ea = 0.7 eV) and SAC solder-joint fatigue (Coffin-Manson, m = 2.5). The ALT program runs: (i) Arrhenius steady-state at T_acc = 85 °C for 2,000 h on 8 units (AF = 17.1 → 34,200 equivalent use hours per unit, 273,600 total — sufficient for 50,000-h MTBF at 90% CL); (ii) Coffin-Manson thermal-cycle at ΔT_acc = 80 K for 1,000 cycles on 8 units (AF = 18.3 → 18,300 equivalent field cycles per unit, 146,400 total — sufficient for 1 cycle/day × 10 years × 8 units = 29,200 cycle-target). Method per Nelson (Ch. 3, Ch. 5) and IPC-9701. Failure-mode validation: SEM cross-section on every failed unit confirms gate-oxide wear-out for Arrhenius, solder-joint crack propagation for Coffin-Manson — same mechanism across stress levels, model valid.`,
    case_study: `CASE_TYPE = SYNTHETIC. A power-electronics module had IGBT bond-wire fatigue (Coffin-Manson, m = 3.0) and gate-oxide wear (Arrhenius, Ea = 0.65 eV) as competing failure mechanisms. The ALT plan was: (a) Arrhenius steady-state at T_acc = 125 °C, AF = 60 → 1,000 h × 8 units × 60 = 480,000 equivalent use hours; (b) Coffin-Manson active-power-cycle ΔT_acc = 70 K (junction-to-case), AF = (70/25)^3 = 22.2 → 1,000 cycles × 8 units × 22.2 = 177,600 equivalent field cycles. The CRE's concern: the two ALTs target different mechanisms, so a single combined reliability R_use = R_Arrhenius × R_Coffin-Manson is required for the system MTBF. The combined MTBF = 1/(1/MTBF_Arrhenius + 1/MTBF_CoffinManson). With Arrhenius ALT demonstrating MTBF_Arr = 200,000 h and Coffin-Manson ALT demonstrating MTBF_CM = 150,000 h (in equivalent use-condition terms): MTBF_sys = 1/(1/200,000 + 1/150,000) = 1/(5×10⁻⁶ + 6.67×10⁻⁶) = 1/1.167×10⁻⁵ = 85,700 h — meets the 50,000-h target with margin. Source: synthetic case authored for this lesson, method per Nelson (Ch. 3, Ch. 5) and Ebeling (Ch. 13).`,
    visual_explanation: `Arrhenius plotted as ln(1/MTTF) vs 1/T gives a straight line of slope −Ea/k; extrapolating to 1/T_use gives the use-condition MTTF. Coffin-Manson plotted as ln(N_f) vs ln(ΔT) gives a straight line of slope −m; extrapolating to ΔT_use gives the use-condition cycles-to-failure. Inverse-Power plotted as ln(t_f) vs ln(V) gives a straight line of slope −n. The three straight-line fits on transformed axes are the visual diagnostics of a valid ALT model — non-linearity signals a mechanism change.`,
    simulation_opportunity: `An interactive simulation could let the learner select the failure mechanism (silicon → Arrhenius; solder → Coffin-Manson; capacitor → Inverse-Power), set Ea/m/n with sliders, set T_use and T_acc (or ΔT_use and ΔT_acc), and display AF and the equivalent use time. A second mode would let the learner observe the mechanism-change threshold by simulating failures at progressively higher S_acc and showing the failure-mode flip (e.g., from gate-oxide wear to electromigration at 175 °C).`,
    common_mistakes: `- Using Arrhenius for solder-joint fatigue — solder is Coffin-Manson (thermal cycling, m = 2.5–3.0), not Arrhenius steady-state.
- Using a single AF across multiple failure mechanisms — invalid; each mechanism requires its own ALT and AF, with a combined MTBF.
- Extrapolating the acceleration model beyond the validated stress range — the mechanism may change, over-predicting use life.
- Skipping failure-mode validation (SEM/EDX) at each stress level — a silent mechanism flip invalidates the model.
- Reporting the use-condition life without a confidence interval — MLE fits give wide CIs at the use condition (Nelson Ch. 7).
- Confusing thermal-cycle ΔT with steady-state T — Coffin-Manson is ΔT-driven; Arrhenius is T-driven; using the wrong variable invalidates AF.
- Reporting AF as a "safety factor" — AF is a time-compression multiplier, not a margin; the design margin is the ratio of demonstrated MTBF to target.`,
    limitations: `- ALT requires a validated acceleration model; without it, over-stress testing is not reliability demonstration.
- The mechanism-change threshold caps the maximum useful S_acc — pushing higher introduces a new mechanism.
- Multi-mechanism systems require mechanism-specific ALTs; combined reliability modeling adds statistical uncertainty.
- Small ALT samples (n < 5 per stress level) give wide CIs on Ea/m/n (Nelson Ch. 7 MLE).
- The exponential / Weibull assumption must hold at both S_use and S_acc; non-constant-shape invalidates the model.
- ALT extrapolation is statistical, not causal — the use-condition life estimate carries CI width.
- Step-stress and progressive-stress ALT (Lesson 3 HALT extreme) introduce cumulative-damage assumptions (Miner's rule for fatigue).`,
    comparison: `**Arrhenius vs Coffin-Manson vs Inverse-Power — by failure mechanism:**
- Arrhenius (T, reaction-rate): silicon aging (Ea = 0.6–0.7 eV), insulation (1.0 eV), electrolytic-cap (0.6 eV), battery calendar aging.
- Coffin-Manson (ΔT, low-cycle fatigue): solder-joint thermal cycling (m = 1.9 SnPb, 2.5–3.0 SAC), metal fatigue (2–4).
- Inverse-Power (V or S, stress-driven): capacitor dielectric (n = 3–5), bearing wear (3), solder mechanical (4–6).

**ALT vs HALT (Lesson 3):**
- ALT: tests at S_acc above S_use but below the mechanism-change threshold; extrapolates back via a model; quantifies use-condition MTBF with CI.
- HALT: step-stresses to the destruct limit; discovers the design margin and the soft-failure threshold; NOT a reliability-quantification method (no AF, no use-condition extrapolation).
- HASS: production screening derived from HALT margins; uses a fraction (typically 50%) of the destruct limit stress.`,
    practical_application: `- **Electronics — automotive ECU**: Arrhenius (silicon) + Coffin-Manson (solder) ALT on the DVP&R reliability row.
- **Aerospace — avionics LRU**: Arrhenius + thermal-cycle Coffin-Manson ALT per RTCA DO-160G (Annex A); multi-mechanism reliability model.
- **Industrial — power-electronics module**: Arrhenius (gate-oxide) + Coffin-Manson (bond-wire) + active-power-cycle ALT; combined MTBF.
- **Medical — implantable electronics**: Arrhenius ALT on encapsulation; Inverse-Power on battery voltage; combined reliability with CI.`,
    decision_scenario: `You are the CRE on a power-electronics module. Use condition T_use = 45 °C, V_use = 24 V. Mechanisms: IGBT bond-wire fatigue (Coffin-Manson, m = 3) and gate-oxide wear (Arrhenius, Ea = 0.65 eV). (a) Compute the Arrhenius AF for T_acc = 125 °C. (b) Compute the Coffin-Manson AF for ΔT_use = 25 K, ΔT_acc = 80 K. (c) Size the ALT for a 100,000-h MTBF at 90% CL zero-failure. (d) Explain why you cannot combine the two AFs into a single multiplier; describe the combined MTBF approach.`,
    practice_questions: `- **Q1 (Easy, Recall):** State the Arrhenius AF formula and identify each variable.
- **Q2 (Medium, Calculation):** Compute AF for T_use = 55 °C, T_acc = 125 °C, Ea = 0.7 eV, k = 8.617×10⁻⁵ eV/K. (77.3×)
- **Q3 (Medium, Application):** Compute the Coffin-Manson AF for ΔT_use = 25 K, ΔT_acc = 80 K, m = 2.5. (18.3×)
- **Q4 (Hard, Analyze):** Explain why a single AF across multiple failure mechanisms is invalid; describe the combined-reliability approach.`,
    certification_questions: `- **CRE-style (Easy):** Which acceleration model applies to silicon-gate-oxide wear-out? (Arrhenius)
- **CRE-style (Medium, Calculation):** Compute the Coffin-Manson AF for ΔT_acc = 80 K, ΔT_use = 25 K, m = 2.5. (18.3×)
- **CRE-style (Hard, Analysis):** Explain the mechanism-change threshold and the validation procedure; describe the consequence of skipping it.`,
    summary: `ALT compresses calendar time by testing at S_acc > S_use and extrapolating back via an acceleration model. Arrhenius (T, Ea) for reaction-rate mechanisms, Coffin-Manson (ΔT, m) for low-cycle fatigue, Inverse-Power (V or S, n) for stress-driven. The mechanism-change threshold caps the maximum useful S_acc; failure-mode validation (SEM/EDX) at each stress level is mandatory. Multi-mechanism systems require mechanism-specific ALTs and a combined reliability model — a single AF is invalid. ALT extrapolation gives use-condition MTBF with a CI, not a point estimate. HALT (Lesson 3) is the destruct-limit discovery counterpart.`,
    key_takeaways: `- AF = t_use / t_acc — the time-compression multiplier.
- Arrhenius: AF = exp[(Ea/k)·(1/T_use − 1/T_acc)] — temperature-driven (silicon Ea = 0.6–0.7 eV).
- Coffin-Manson: AF = (ΔT_acc/ΔT_use)^m — solder-joint thermal-cycle (m = 1.9 SnPb, 2.5–3.0 SAC).
- Inverse-Power: AF = (V_acc/V_use)^n — dielectric (n = 3–5), bearing (3).
- The mechanism-change threshold is the upper stress limit; failure-mode analysis validates the mechanism at each S_acc.
- Multi-mechanism → mechanism-specific ALTs + combined reliability model (R_use = product or MTBF_sys = harmonic sum).
- ALT extrapolation carries a CI — report the bound, not the point estimate.`,
    references: `- ASQ CRE Body of Knowledge — Reliability Testing domain.
- ISO 14224:2016 — Collection of reliability and maintenance data for equipment.
- Nelson (2004), Accelerated Testing, Ch. 3 (Arrhenius and inverse-power), Ch. 4 (Eyring), Ch. 5 (Coffin-Manson), Ch. 7 (MLE fitting).
- Ebeling (2010), Ch. 13 (Accelerated life testing — Arrhenius, Eyring, Coffin-Manson, inverse-power).
- O'Connor & Kleyner (2012), Ch. 12 (Accelerated testing — models and AF).
- Hobbs (2000), Ch. 1 (Overview of accelerated test methods — ALT vs HALT).`,
  },
  knowledgeObject: {
    title: "Accelerated Life Testing (ALT)",
    domain: "Reliability Testing",
    competency: "Accelerated Life Testing (ALT)",
    topic: "Acceleration Models & Test-Plan Sizing",
    concept: "Arrhenius, Eyring, Coffin-Manson, Inverse-Power; AF computation; mechanism-change threshold",
    body: {
      definitions: [
        "Accelerated Life Testing (ALT): testing at stress S_acc > S_use to compress calendar time, with extrapolation back to S_use via an acceleration model.",
        "Acceleration Factor (AF): ratio t_use/t_acc; the time-compression multiplier.",
        "Arrhenius model: AF = exp[(Ea/k)·(1/T_use − 1/T_acc)]; temperature-driven reaction-rate aging.",
        "Eyring model: generalized Arrhenius with (T_use/T_acc) pre-factor and entropy term.",
        "Coffin-Manson model: AF = (ΔT_acc/ΔT_use)^m; low-cycle thermal-cycle fatigue (solder joints).",
        "Inverse-Power model: AF = (V_acc/V_use)^n or (S_acc/S_use)^n; voltage or mechanical-stress aging.",
        "Activation energy (Ea): Arrhenius parameter in eV; mechanism-specific (silicon 0.6–0.7 eV, insulation 1.0 eV).",
        "Fatigue exponent (m): Coffin-Manson parameter (SnPb 1.9, SAC 2.5–3.0).",
        "Power-law exponent (n): Inverse-Power parameter (dielectric 3–5, bearing 3).",
        "Mechanism-change threshold: stress above which a new failure mechanism appears (invalidates ALT).",
      ],
      principles: [
        "AF = t_use/t_acc; the model output compresses test time.",
        "Arrhenius (T, Ea): reaction-rate-driven (silicon, insulation, electrolytic).",
        "Coffin-Manson (ΔT, m): low-cycle thermal-cycle fatigue (solder joints).",
        "Inverse-Power (V or S, n): stress-driven (dielectric, bearing, solder mechanical).",
        "Eyring is the generalized Arrhenius; simplified to Arrhenius when pre-factor and entropy dropped.",
        "ALT validity requires the SAME failure mechanism at S_acc and S_use — failure-mode analysis at each stress.",
        "Multi-mechanism systems require mechanism-specific ALTs and a combined reliability model.",
      ],
      components: [
        "Use condition (S_use) and accelerated condition (S_acc).",
        "Acceleration model (Arrhenius / Eyring / Coffin-Manson / Inverse-Power / generalized Eyring).",
        "Mechanism parameters: Ea (eV), m, n.",
        "Boltzmann constant k = 8.617×10⁻⁵ eV/K.",
        "Multi-stress matrix (3+ stress levels × multiple units per level).",
        "Failure-mode analysis (SEM/EDX, cross-section, XRD).",
        "Maximum-likelihood fit (Nelson Ch. 7) for parameter estimation with CI.",
        "Test-plan sizing: t_acc = t_use/AF; n = t_acc/t_unit.",
      ],
      mechanism: [
        "ALT lifecycle: identify dominant mechanism (FMEA) → select model → fit parameters (Ea/m/n) from multi-stress data → validate mechanism stability (failure-mode analysis at each S_acc) → compute AF → size test plan (t_acc = t_use/AF) → execute → analyze (Weibull/Lognormal per stress; model fit; use-condition life with CI) → document model risk.",
      ],
      process: [
        "1. Identify dominant failure mechanism from FMEA/FMECA (drives model choice).",
        "2. Select acceleration model: Arrhenius (T), Coffin-Manson (ΔT), Inverse-Power (V or S).",
        "3. Fit mechanism parameters (Ea, m, n) from multi-stress ALT or use published values.",
        "4. Validate mechanism stability: SEM/EDX failure-mode analysis at each stress level.",
        "5. Compute AF for the chosen S_acc vs S_use.",
        "6. Size the test plan: t_acc = t_use/AF; n = t_acc/t_unit; verify n × t_unit × AF ≥ T_required.",
        "7. Execute ALT; record failures by time and stress level.",
        "8. Analyze: fit life distribution at each stress level; fit acceleration model; compute use-condition life + CI.",
        "9. Document model risk: extrapolation range, mechanism-change threshold, multi-mechanism caveat.",
      ],
      formulas: [
        "Arrhenius: AF = exp[(Ea/k)·(1/T_use − 1/T_acc)].",
        "Eyring: AF = (T_use/T_acc)·exp[(Ea/k)·(1/T_use − 1/T_acc)]·exp[(C·ΔT)/(k·T_use·T_acc)].",
        "Coffin-Manson: AF = (ΔT_acc/ΔT_use)^m.",
        "Inverse-Power: AF = (V_acc/V_use)^n or (S_acc/S_use)^n.",
        "Generalized Eyring (T+V): AF = (T_use/T_acc)·exp[(Ea/k)·(1/T_use − 1/T_acc)]·(V_acc/V_use)^n·exp[(B·V)/(k·T_use·T_acc)].",
        "Test-plan sizing: t_acc = t_use/AF; n = t_acc/t_unit.",
        "Use-condition reliability: R_use(t_use) = R_acc(t_acc) for the same cumulative damage.",
      ],
      metrics: [
        "Acceleration Factor AF [dimensionless].",
        "Activation energy Ea [eV]; Boltzmann k [eV/K].",
        "Fatigue exponent m; power-law exponent n [dimensionless].",
        "Test time t_acc [h]; sample size n [dimensionless].",
        "Use-condition MTBF [h] with CI [h].",
        "Mechanism-change threshold [°C, V, MPa, K].",
        "AF-weighted equivalent use hours [h].",
      ],
      examples: [
        "Silicon Arrhenius: T_use = 55 °C (328 K), T_acc = 125 °C (398 K), Ea = 0.7 eV → AF = 77.3×.",
        "Solder Coffin-Manson: ΔT_use = 25 K, ΔT_acc = 80 K, m = 2.5 → AF = 18.3×.",
        "Capacitor Inverse-Power: V_acc = 1.5·V_use, n = 4 → AF = 5.06×.",
        "Bearing Inverse-Power: S_acc = 2·S_use, n = 3 → AF = 8×.",
        "Test-plan: 50,000-h MTBF at 90% CL zero-failure with AF = 77 → t_acc = 1,494 h, n = 8 units.",
      ],
      industrial_examples: [
        "Electronics — automotive ECU: Arrhenius (silicon, Ea = 0.7 eV) at 85 °C for 2,000 h × 8 units + Coffin-Manson (solder, m = 2.5) at ΔT = 80 K for 1,000 cycles × 8 units.",
        "Aerospace — avionics LRU: Arrhenius + thermal-cycle Coffin-Manson per RTCA DO-160G Annex A.",
        "Industrial — power-electronics module: Arrhenius (gate-oxide) + Coffin-Manson (bond-wire) + active-power-cycle ALT; combined MTBF.",
        "Medical — implantable electronics: Arrhenius on encapsulation + Inverse-Power on battery voltage; combined reliability with CI.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Power-electronics module with IGBT bond-wire (Coffin-Manson, m = 3) and gate-oxide (Arrhenius, Ea = 0.65 eV). ALT plan: Arrhenius at T_acc = 125 °C, AF = 60, 1,000 h × 8 units = 480,000 eq. use hours; Coffin-Manson at ΔT_acc = 70 K, AF = 22.2, 1,000 cycles × 8 units = 177,600 eq. cycles. Combined MTBF = 1/(1/200,000 + 1/150,000) = 85,700 h ≥ 50,000 target. Method per Nelson Ch. 3, 5 and Ebeling Ch. 13.",
      ],
      common_errors: [
        "Using Arrhenius for solder-joint fatigue (should be Coffin-Manson, ΔT-driven).",
        "Using a single AF across multiple failure mechanisms (invalid; mechanism-specific ALTs + combined MTBF).",
        "Extrapolating the model beyond the validated stress range (mechanism may change).",
        "Skipping failure-mode validation (SEM/EDX) at each stress level.",
        "Reporting use-condition life without a confidence interval.",
        "Confusing thermal-cycle ΔT with steady-state T (Coffin-Manson vs Arrhenius).",
        "Reporting AF as a 'safety factor' — it is a time-compression multiplier, not a design margin.",
      ],
      limitations: [
        "Requires a validated acceleration model; without it, over-stress test ≠ reliability demonstration.",
        "Mechanism-change threshold caps the maximum useful S_acc.",
        "Multi-mechanism → mechanism-specific ALTs + combined reliability modeling.",
        "Small ALT samples (n < 5 per stress level) give wide CIs on Ea/m/n.",
        "Exponential / Weibull constant-shape assumption must hold across stress levels.",
        "ALT extrapolation is statistical, not causal — the CI is the contract.",
        "Step-stress / progressive-stress ALT introduce cumulative-damage assumptions (Miner's rule).",
      ],
      best_practices: [
        "Always select the model by failure mechanism (Arrhenius = reaction-rate; Coffin-Manson = ΔT; Inverse-Power = V or S).",
        "Fit mechanism parameters from multi-stress ALT (3+ stress levels) or use published values with citation.",
        "Validate mechanism stability via SEM/EDX failure-mode analysis at each stress level — never skip.",
        "Report use-condition MTBF with a confidence interval, not a point estimate.",
        "For multi-mechanism systems, run mechanism-specific ALTs and compute a combined reliability model.",
        "Document the mechanism-change threshold; re-run ALT at lower S_acc if exceeded.",
        "Size the test plan with AF-weighted unit-hours ≥ T_required (success-run formula from Lesson 1).",
      ],
      related_concepts: [
        "Reliability Test Planning & DVP&R — Lesson 1 (test-plan sizing via AF).",
        "HALT & HASS — Lesson 3 (destr-limit discovery; HASS = 50% of destruct).",
        "Reliability Demonstration & Success-Run — Lesson 4 (success-run T_required that ALT feeds).",
        "Reliability Fundamentals (RF) — R(t), exponential, Weibull, MTBF inputs.",
        "ISO 14224:2016 — use-condition failure-rate source for ALT validation.",
      ],
      prerequisites: [
        "ASQ CRE BOK RF — R(t), exponential, Weibull, MTBF, failure mechanisms.",
        "ASQ CRE BOK PS — MLE, regression on transformed data, confidence intervals.",
        "ASQ CRE BOK RDD — FMEA/FMECA identifies the dominant failure mechanism.",
        "Semiconductor physics (Boltzmann, activation energy, eV) and basic thermal-cycle fatigue theory.",
      ],
      references: [
        "ASQ CRE Body of Knowledge — Reliability Testing domain.",
        "ISO 14224:2016 — Collection of reliability and maintenance data for equipment.",
        "Nelson (2004), Ch. 3 (Arrhenius), Ch. 4 (Eyring), Ch. 5 (Coffin-Manson), Ch. 7 (MLE fitting).",
        "Ebeling (2010), Ch. 13 (Accelerated life testing).",
        "O'Connor & Kleyner (2012), Ch. 12 (Accelerated testing — models and AF).",
        "Hobbs (2000), Ch. 1 (Overview — ALT vs HALT).",
      ],
    },
  },
  questions: [
    {
      competencyName: "Accelerated Life Testing (ALT)",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which acceleration model is appropriate for temperature-driven reaction-rate mechanisms such as silicon gate-oxide wear-out, and what is its formula?",
      whyCorrect:
        "The Arrhenius model AF = exp[(Ea/k)·(1/T_use − 1/T_acc)] is the canonical model for temperature-driven reaction-rate aging (silicon gate-oxide wear, insulation degradation, electrolytic-capacitor dry-out, battery calendar aging). The single mechanism parameter is the activation energy Ea in eV (silicon ~0.6–0.7 eV), and k = 8.617×10⁻⁵ eV/K is the Boltzmann constant. Temperatures T_use and T_acc must be in Kelvin (K) = °C + 273.15.",
      whyOthersWrong: [
        "Option A (Coffin-Manson AF = (ΔT_acc/ΔT_use)^m) — incorrect: Coffin-Manson models low-cycle thermal-CYCLE fatigue (solder joints), not steady-state reaction-rate aging; ΔT is a peak-to-peak swing, not absolute temperature.",
        "Option C (Inverse-Power AF = (V_acc/V_use)^n) — incorrect: Inverse-Power models voltage- or mechanical-stress-driven mechanisms (dielectric, bearing), not temperature-driven reaction-rate.",
        "Option D (Miner's rule Σ n_i/N_i = 1) — incorrect: Miner's rule is a cumulative-damage summation for fatigue, not an acceleration model; it does not give a stress-to-stress AF.",
      ],
      explanation:
        "Arrhenius: AF = exp[(Ea/k)·(1/T_use − 1/T_acc)] with Ea in eV, k = 8.617×10⁻⁵ eV/K, T in K. Models temperature-driven reaction-rate mechanisms (silicon, insulation, electrolytic, battery).",
      options: [
        { text: "Coffin-Manson: AF = (ΔT_acc/ΔT_use)^m", isCorrect: false },
        { text: "Arrhenius: AF = exp[(Ea/k)·(1/T_use − 1/T_acc)]", isCorrect: true },
        { text: "Inverse-Power: AF = (V_acc/V_use)^n", isCorrect: false },
        { text: "Miner's rule: Σ n_i/N_i = 1", isCorrect: false },
      ],
    },
    {
      competencyName: "Accelerated Life Testing (ALT)",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Electronics",
      stem: "A silicon CMOS device has use-condition T_use = 55 °C and accelerated T_acc = 125 °C. Activation energy Ea = 0.7 eV, Boltzmann k = 8.617×10⁻⁵ eV/K. Compute the Arrhenius AF and the equivalent use time for 1,000 h of ALT.",
      whyCorrect:
        "Step 1 — convert to Kelvin: T_use = 55 + 273.15 = 328.15 K; T_acc = 125 + 273.15 = 398.15 K. Step 2 — temperature reciprocals: 1/T_use = 0.003047 K⁻¹; 1/T_acc = 0.002512 K⁻¹. Step 3 — bracket: 1/T_use − 1/T_acc = 0.000535 K⁻¹. Step 4 — exponent: (Ea/k) × bracket = (0.7/8.617×10⁻⁵) × 0.000535 = 8126.7 × 0.000535 = 4.348. Step 5 — AF: exp(4.348) = 77.3×. Equivalent use time = 1,000 h × 77.3 = 77,300 h (8.83 years at 55 °C use condition).",
      whyOthersWrong: [
        "Option A (AF = 7.7, equivalent = 7,700 h) — incorrect: arithmetic slip; uses Ea = 0.07 eV (decimal error) or drops a factor of 10; the correct exponent is 4.348, giving AF = 77.3.",
        "Option B (AF = 2.3, equivalent = 2,300 h) — incorrect: uses Celsius directly in the formula (1/55 − 1/125 = 0.01016 instead of the Kelvin 0.000535) — Arrhenius requires absolute temperature in Kelvin.",
        "Option D (AF = 1.7, equivalent = 1,700 h) — incorrect: uses the temperature difference T_acc − T_use = 70 K linearly rather than the Arrhenius 1/T form; AF in Arrhenius is exponential, not linear.",
      ],
      explanation:
        "T_use = 328 K, T_acc = 398 K; AF = exp[(0.7/8.617×10⁻⁵)·(1/328 − 1/398)] = exp[8126.7 × 0.000535] = exp(4.348) = 77.3×. Equivalent use = 1,000 × 77.3 = 77,300 h (8.83 years).",
      options: [
        { text: "AF = 7.7; equivalent = 7,700 h (decimal slip on Ea)", isCorrect: false },
        { text: "AF = 77.3; equivalent = 77,300 h (~8.8 years)", isCorrect: true },
        { text: "AF = 2.3; equivalent = 2,300 h (Celsius used directly)", isCorrect: false },
        { text: "AF = 1.7; equivalent = 1,700 h (linear temperature difference)", isCorrect: false },
      ],
    },
    {
      competencyName: "Accelerated Life Testing (ALT)",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Automotive",
      stem: "A SAC solder joint thermal-cycle ALT uses ΔT_use = 25 K (field) and ΔT_acc = 80 K (test), with fatigue exponent m = 2.5. Compute the Coffin-Manson AF and the equivalent field cycles for 1,000 test cycles.",
      whyCorrect:
        "Coffin-Manson AF = (ΔT_acc/ΔT_use)^m = (80/25)^2.5 = 3.2^2.5. Compute on log scale: ln(3.2) = 1.163; exponent = 2.5 × 1.163 = 2.9075; AF = exp(2.9075) = 18.3×. Equivalent field cycles = 1,000 test cycles × 18.3 = 18,300 field cycles. At 1 field cycle per day, 18,300 cycles = 50.1 years — well beyond the 10-year design life; the ALT is sufficient.",
      whyOthersWrong: [
        "Option A (AF = 3.2, equivalent = 3,200 cycles) — incorrect: reports the ΔT ratio without applying the m = 2.5 exponent; the Coffin-Manson exponent is essential.",
        "Option B (AF = 5.0, equivalent = 5,000 cycles) — incorrect: uses m = 1 (linear) or arithmetic mean of ΔT; the SAC fatigue exponent is 2.5, not 1.",
        "Option D (AF = 80, equivalent = 80,000 cycles) — incorrect: uses ΔT_acc directly as the AF without the ΔT_use ratio and exponent — dimensional nonsense.",
      ],
      explanation:
        "Coffin-Manson AF = (80/25)^2.5 = 3.2^2.5 = exp(2.5 × ln(3.2)) = exp(2.5 × 1.163) = exp(2.9075) = 18.3×. 1,000 test cycles × 18.3 = 18,300 equivalent field cycles ≈ 50.1 years at 1 cycle/day.",
      options: [
        { text: "AF = 3.2; equivalent = 3,200 cycles (ΔT ratio only)", isCorrect: false },
        { text: "AF = 18.3; equivalent = 18,300 field cycles", isCorrect: true },
        { text: "AF = 5.0; equivalent = 5,000 cycles (m = 1)", isCorrect: false },
        { text: "AF = 80; equivalent = 80,000 cycles (ΔT_acc directly)", isCorrect: false },
      ],
    },
    {
      competencyName: "Accelerated Life Testing (ALT)",
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Aerospace",
      stem: "True or False: For a power-electronics module with two competing failure mechanisms — IGBT bond-wire fatigue (Coffin-Manson) and gate-oxide wear (Arrhenius) — a single combined acceleration factor AF_total = AF_Arrhenius × AF_CoffinManson can be used to size the ALT test plan.",
      whyCorrect:
        "FALSE. A single combined AF across multiple failure mechanisms is INVALID. The two mechanisms have different acceleration models (Arrhenius with Ea = 0.65 eV for temperature; Coffin-Manson with m = 3 for thermal cycling), different stress drivers (steady-state T vs ΔT), and different use-condition extrapolations. The correct approach: run mechanism-specific ALTs (one Arrhenius steady-state T ALT for gate-oxide wear; one Coffin-Manson active-power-cycle ΔT ALT for bond-wire fatigue), compute each mechanism's use-condition MTBF, then combine via the harmonic sum: 1/MTBF_sys = 1/MTBF_Arr + 1/MTBF_CM. The combined MTBF is what is compared to the target. Multiplying the AFs would conflate the mechanisms and over-predict use life (the harmonic sum is dominated by the shorter-life mechanism, the product of AFs is not).",
      whyOthersWrong: [
        "TRUE — would imply the two mechanisms' AFs compose multiplicatively; in fact, the two mechanisms are independent failure modes whose rates ADD (series-reliability rule: 1/MTBF_sys = Σ 1/MTBF_i), so the test plan must address each separately and combine at the MTBF level, not the AF level.",
      ],
      explanation:
        "FALSE. Multi-mechanism ALT requires mechanism-specific tests (Arrhenius for T, Coffin-Manson for ΔT) and combined reliability via the harmonic sum 1/MTBF_sys = 1/MTBF_Arr + 1/MTBF_CM. A single AF_total = AF_Arr × AF_CM is invalid and over-predicts use life.",
      options: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — HALT & HASS
// (Competency: "HALT & HASS"; slug: rt-halt-hass)
// ---------------------------------------------------------------------------

const LESSON_HALT_HASS: RefLesson = {
  competencyName: "HALT & HASS",
  slug: "rt-halt-hass",
  title: "HALT & HASS — Highly Accelerated Life Test & Stress Screen",
  titleAr: "HALT و HASS — اختبار الحياة المعجل بشدة وفحص الإجهاد",
  order: 3,
  durationMin: 35,
  references: RT_REFERENCE_TITLES,
  conceptIntroduction: `HALT (Highly Accelerated Life Test) and HASS (Highly Accelerated Stress Screen) are the workhats of design-margin discovery and production screening. HALT is a step-stress test that progressively increases stress (temperature, vibration, combined temperature-vibration, rapid thermal transitions, power cycling) until the device fails — the goal is to discover the destruct limit, operating limit, and design margin BEFORE release, then iterate the design until margins meet the target. HASS is a production screening test derived from HALT margins — typically run at 50% of the destruct limit stress to precipitate latent defects without consuming significant design life. HALT is NOT a reliability-quantification method (no AF, no use-condition extrapolation); it is a design-improvement method. HASS is NOT a qualification test; it is a 100% production screen to catch manufacturing defects that escape inspection. The two are complementary to ALT (Lesson 2): ALT quantifies use life with a model; HALT discovers the margin ceiling; HASS screens for the defect floor.`,
  example: `An industrial controller HALT starts at +20 °C and steps in +10 °C increments every 10 min, dwelling at each step. Soft failure (intermittent latch-up, recoverable on cool-down) at +110 °C; hard failure (permanent, no recovery) at +150 °C. The destruct limit is +150 °C. The use-condition spec limit is +70 °C. Design margin = (destruct − spec) / spec = (150 − 70)/70 = 1.14 = 114% margin above the spec. The HASS screen is set at 50% of destruct = +75 °C (just above the spec) and below the soft-failure threshold of +110 °C — the screen stresses the device beyond spec but does not consume significant design life (HASS screening must not consume more than ~1–2% of design life per unit tested). A separate vibration HALT steps 5 g_rms every 10 min; soft failure at 35 g_rms, hard failure at 55 g_rms; HASS screen at 25 g_rms (50% of destruct). Combined HASS profile: +75 °C with 25 g_rms vibration, 2 cycles of 4 h each.`,
  keyFormulas: `HALT step-stress schedule: stress(k) = S_0 + k·ΔS, dwell = T_dwell per step
Soft-failure threshold S_soft: stress at which the device malfunctions but recovers on stress removal
Hard-failure (destruct) threshold S_destruct: stress at which the device fails permanently
Operating margin: S_op = S_soft − S_use
Design margin (S_destruct): DM = (S_destruct − S_use)/S_use  [dimensionless ratio, often in %]
HASS screen stress: S_HASS = 0.5 × S_destruct  [50% of destruct, typical]
HASS design-life consumption: life_fraction = t_HASS/MTTF(S_HASS) ≪ 1 (typically ≤ 1–2%)
  Validation: run HASS 10× on a single unit; if the unit survives 10× HASS, the screen consumes ≤ 10% of design life at 1× HASS.
HALT-iterative design improvement: each failure triggers root-cause and redesign; re-HALT until margins meet target (typical target: DM ≥ 20% on T, ≥ 20% on vibration).`,
  exercise: `You are the CRE on a new medical-grade infusion pump. HALT reveals: temperature soft failure at +95 °C, hard failure at +130 °C; vibration soft failure at 30 g_rms, hard failure at 50 g_rms. Use condition: T_use_max = +40 °C, vibration_use_max = 5 g_rms (portable device in a moving vehicle). (a) Compute the temperature design margin and the vibration design margin. (b) Set the HASS screen stresses (50% of destruct) for T and vibration. (c) Specify the HASS design-life-consumption validation procedure (10× HASS on a single unit). (d) Justify whether HALT margins are sufficient for medical-device release or whether a design iteration is required.`,
  sections: {
    learning_objectives: `- Define HALT (design-margin discovery via step-stress to destruct) and HASS (production screen at 50% of destruct).
- Distinguish soft failures (recoverable) from hard failures (permanent — the destruct limit).
- Compute the operating margin, design margin, and HASS screen stress from HALT data.
- Specify the HASS design-life-consumption validation (10× HASS on a single unit).
- Position HALT as a design-improvement method (not reliability quantification) and HASS as a production screen (not qualification).
- Iterate the design via HALT root-cause → redesign → re-HALT until margins meet the target.
- Coordinate HALT/HASS with ALT (Lesson 2) and DVP&R (Lesson 1) — they address different questions.`,
    prerequisites: `- ASQ CRE BOK RF — failure mechanisms, R(t), MTBF, failure-rate behavior.
- ASQ CRE BOK RDD — FMEA/FMECA, design reviews, derating, parts selection.
- ASQ CRE BOK RT Lesson 1 (DVP&R) and Lesson 2 (ALT) — the complementary test methods.
- Familiarity with environmental test chambers (combined temperature-vibration, rapid thermal transitions) and basic mechanical-vibration theory (PSD, g_rms).`,
    introduction: `HALT and HASS are Gregg Hobbs's "accelerated reliability engineering" initiative — a step-change in design-margin discovery and production screening that became standard in electronics, automotive, aerospace, and medical devices in the 1990s–2000s. The two methods address different questions: HALT asks "where does the design break?" (design-margin discovery, before release); HASS asks "which production units have latent defects that escaped inspection?" (100% production screen).

HALT is a step-stress test. The device is subjected to progressively increasing stress (temperature, vibration, combined temperature-vibration, rapid thermal transitions, power cycling, voltage steps). At each step, the device is functionally monitored. The CRE watches for two distinct failure types: *soft failures* (the device malfunctions but recovers when stress is removed — the operating limit, or the upper stress at which the device still functions); *hard failures* (the device fails permanently and does not recover — the destruct limit). The design margin is the gap between the destruct limit and the use condition.

HALT is *not* a reliability-quantification method. There is no AF (Lesson 2), no use-condition extrapolation, no MTBF CI. The goal of HALT is to find the margin ceiling, root-cause every failure, iterate the design (better derating, redundant components, stronger materials, design changes), and re-HALT until the margins meet the target (typically ≥ 20% on temperature, ≥ 20% on vibration — well above the spec limit). HALT's value: it drives design improvement BEFORE release, when changes are cheap; it complements ALT (which quantifies use life) by discovering the margin ceiling.

HASS is a production screen derived from HALT margins. HASS runs at 50% of the destruct limit stress (the "HASS screen" stress), chosen so the screen is well above the spec limit (catches latent defects) but well below the destruct limit (does not consume significant design life). HASS is a 100% production screen — every unit goes through it before shipment. The screen is designed to precipitate latent manufacturing defects (cold solder joints, marginal wire bonds, weak die attachments, partial cracks) that escape visual and X-ray inspection.

HASS design-life-consumption validation: the screen must not consume more than ~1–2% of the design life per unit. The validation: run HASS 10× on a single unit; if the unit survives 10× HASS, the screen consumes ≤ 10% of design life at 1× HASS (the unit would survive ~10 screens before failing). If the unit fails before 10× HASS, the screen is too aggressive — lower the stress or shorten the duration.

The HALT/HASS/ALT/DVP&R relationship: DVP&R (Lesson 1) is the master matrix; ALT (Lesson 2) is the use-life quantification method; HALT is the margin discovery method; HASS is the production screen. A robust reliability program runs all four — the DVP&R ties them together with traceable rows.`,
    terminology: `- **HALT (Highly Accelerated Life Test)**: step-stress test to discover destruct limit and design margin; design-improvement method, not reliability quantification.
- **HASS (Highly Accelerated Stress Screen)**: 100% production screen at 50% of destruct limit; catches latent manufacturing defects.
- **Step-stress**: progressive stress increase (k·ΔS per step, T_dwell at each step).
- **Soft failure**: recoverable malfunction at stress; the device returns to function when stress is removed (the operating limit).
- **Hard failure (destruct limit)**: permanent failure with no recovery (the destruct limit).
- **Operating limit (S_soft)**: stress at which the device still functions but marginally (above soft-failure threshold).
- **Destruct limit (S_destruct)**: stress at which the device fails permanently.
- **Design margin**: (S_destruct − S_use)/S_use; the gap between destruct and use condition.
- **HASS screen stress**: 0.5 × S_destruct (typical) — above spec, below destruct.
- **HASS design-life consumption**: life_fraction = t_HASS/MTTF(S_HASS) ≤ 1–2%.
- **HASA (Highly Accelerated Stress Audit)**: sampled HASS (e.g., 5% of production) when 100% HASS is too slow.
- **Combined stress**: simultaneous temperature + vibration (HALT chamber with electrodynamic shaker) — discovers interaction failures.`,
    detailed_explanation: `The HALT step-stress protocol. The device is mounted in a combined environmental chamber (temperature + 6-DOF electrodynamic vibration). The protocol: (i) cold step-stress from +20 °C down in −10 °C steps, 10-min dwell at each step, functionally monitor — record soft and hard failure temperatures; (ii) hot step-stress from +20 °C up in +10 °C steps, 10-min dwell — record soft and hard; (iii) rapid thermal transitions (e.g., +20 °C → −40 °C → +20 °C in <5 min transition, 5 cycles); (iv) vibration step-stress from 5 g_rms up in 5 g_rms steps, 10-min dwell — record soft and hard; (v) combined temperature-vibration step-stress (the most demanding — discovers interaction failures like solder fatigue under simultaneous T and vibration). At each step, the device is electrically functionally monitored and the operator logs soft vs hard failures with root-cause hypothesis.

*Soft failures* are recoverable malfunctions — the device stops functioning at S_soft but recovers when stress is reduced. Examples: oscillator frequency drift outside spec at high T (recovers on cool-down); latch-up in a CMOS device at high T (recovers on power cycle); intermittent contact in a connector at high vibration (recovers when vibration stops). Soft failures identify the *operating limit* — the upper stress at which the device still functions. The design target is for S_soft to be comfortably above the spec limit (operating margin ≥ 20%).

*Hard failures* are permanent — the device fails at S_destruct and does not recover when stress is removed. Examples: solder-joint crack propagation (mechanical); gate-oxide rupture (electrical); wire-bond lift (mechanical); die-attach delamination (thermal-mechanical). Hard failures identify the *destruct limit* — the upper stress at which the device is permanently failed. The design margin DM = (S_destruct − S_use)/S_use; the target is DM ≥ 20–50% (Hobbs's recommendation) on temperature and vibration.

*Root-cause and redesign* is the heart of HALT. Every soft or hard failure triggers a failure analysis (FA): cross-section, SEM/EDX, X-ray, dye-and-pry for solder; curve-tracing for semiconductor; FEA of the local stress concentration. The root cause drives a design change: stronger derating (e.g., from 80% to 60% of rated voltage), a higher-grade component, a structural reinforcement, an improved cooling path, a redundant channel. The redesign is re-HALT tested; the cycle continues until margins meet the target. A typical HALT program runs 3–5 design iterations; each iteration takes 2–4 weeks (FA + design + re-test). The output: a design with margins comfortably above the spec, plus documented root causes for HALT-found failures (which inform HALT-ALT-derating-FMEA loops).

*HASS screen development* is the downstream activity. Once HALT has established the destruct limit and design margin, the HASS screen is set at ~50% of destruct stress. The screen must (i) precipitate latent manufacturing defects — the same defects that HALT drove the design margin against; (ii) NOT consume significant design life (≤ 1–2% per unit). The validation: run HASS 10× on a single unit; if the unit survives, the screen consumes ≤ 10% of design life at 1× HASS (the unit would survive ~10 screens before failing). If the unit fails before 10× HASS, the screen is too aggressive — lower the stress, shorten the duration, or reduce the number of cycles.

HASS profile example (from the lesson example): combined temperature-vibration at +75 °C with 25 g_rms vibration, 2 cycles of 4 h each (8 h total screen time). This is well above the spec limit (+70 °C and 5 g_rms) — so it catches latent defects — but well below the destruct limit (+150 °C and 55 g_rms) — so it does not consume significant design life. The 10× HASS validation: a single unit goes through 10× (8 h × 10 = 80 h at the screen stress); if the unit survives, the 1× HASS consumes ≤ 10% of design life.

*HASA (Highly Accelerated Stress Audit)* is the sampled version of HASS, used when 100% HASS is too slow or costly (e.g., high-volume consumer electronics, low-margin products). HASA samples 5–10% of production; if a failure is found in the audit, the lot is 100% HASSed. HASA trades some defect-escape risk for throughput; the decision depends on the defect-escape cost (warranty + brand damage) vs. the throughput cost.

The HALT/HASS philosophy is "test-to-fail" — the goal is to break the design BEFORE release (HALT) and to break defective units BEFORE shipment (HASS). This is the opposite of DVP&R test-to-pass (Lesson 1) and ALT reliability-quantification (Lesson 2); the four methods are complementary, addressing different questions on the same DVP&R.`,
    core_principles: `- HALT is design-margin discovery (test-to-fail); HASS is production screening (test-to-fail on defective units).
- HALT step-stresses to soft (operating) and hard (destruct) failure thresholds; the design margin = (S_destruct − S_use)/S_use.
- Soft failures are recoverable (operating limit); hard failures are permanent (destruct limit).
- HALT is NOT reliability quantification — no AF, no use-condition extrapolation.
- HASS runs at 50% of destruct; validates design-life consumption via 10× HASS on a single unit.
- Root-cause and redesign is the heart of HALT — iterate until margins meet target (≥ 20% on T and vibration).
- HALT/HASS/ALT/DVP&R are complementary: DVP&R ties them; ALT quantifies use life; HALT discovers margins; HASS screens production.`,
    components: `- **Combined environmental chamber**: temperature + 6-DOF electrodynamic vibration (the HALT chamber).
- **Step-stress protocol**: cold, hot, rapid thermal transitions, vibration, combined temperature-vibration.
- **Soft-failure detector**: functional monitoring (oscilloscope, curve tracer, ATE) during step-stress.
- **Hard-failure indicator**: permanent loss of function with no recovery.
- **Failure analysis tools**: cross-section, SEM/EDX, X-ray, dye-and-pry, FEA.
- **Design iteration loop**: root-cause → design change → re-HALT.
- **HASS chamber**: production-line combined temperature-vibration chamber (lower cost than HALT chamber).
- **HASS profile**: stress (50% of destruct), duration, cycles.
- **10× HASS validation**: design-life-consumption check on a single unit.`,
    process: `1. Mount the device in the combined chamber with functional monitoring in place.
2. Run cold step-stress (+20 °C down in −10 °C steps, 10-min dwell) — record soft and hard failure temperatures.
3. Run hot step-stress (+20 °C up in +10 °C steps, 10-min dwell) — record soft and hard failure temperatures.
4. Run rapid thermal transitions (+20 °C → −40 °C → +20 °C in <5 min, 5 cycles) — record failures.
5. Run vibration step-stress (5 g_rms up in 5 g_rms steps, 10-min dwell) — record soft and hard failure.
6. Run combined temperature-vibration step-stress (the most demanding — discovers interaction failures).
7. Compute operating margin (S_soft − S_use) and design margin (S_destruct − S_use)/S_use.
8. Root-cause every soft and hard failure (cross-section, SEM/EDX, X-ray, FEA).
9. Iterate design (derating, component upgrade, structural reinforcement, redundancy) → re-HALT.
10. Repeat until margins meet target (≥ 20% on T and vibration, Hobbs's recommendation).
11. Set HASS screen at 0.5 × S_destruct (typical).
12. Validate HASS design-life consumption: run 10× HASS on a single unit; if it survives, ship HASS as the production screen.`,
    formula_calculation: `Variables and formulas:
- S(k): stress at step k = S_0 + k·ΔS  [°C for T, g_rms for vibration, V for voltage, K for ΔT-cycle].
- ΔS: step increment  [°C, g_rms, V].
- T_dwell: dwell time per step  [min].
- S_soft: soft-failure stress  [°C, g_rms, V] — operating limit.
- S_destruct: hard-failure (destruct) stress  [°C, g_rms, V].
- S_use: use-condition maximum stress (spec limit)  [°C, g_rms, V].
- Operating margin OM = S_soft − S_use  [same units].
- Design margin DM = (S_destruct − S_use)/S_use  [dimensionless ratio, often %].
- S_HASS: HASS screen stress = 0.5 × S_destruct  [typical]  [°C, g_rms].
- HASS design-life consumption: life_fraction = t_HASS / MTTF(S_HASS) ≤ 1–2%.
- 10× HASS validation: if a unit survives 10× HASS, the 1× HASS consumes ≤ 10% of design life.

Units: T in °C (HALT) or K (Arrhenius ALT — Lesson 2); vibration in g_rms; voltage in V; time in h.

Assumptions: (i) HALT stress drivers are the same as the use-condition stress drivers (else the HALT margin does not correlate with field reliability); (ii) the destruct limit at HALT stress corresponds to the same failure mechanism as at use stress (else the margin is meaningless); (iii) HASS stress at 50% of destruct is below the soft-failure threshold (so the screen does not push the device past the operating limit); (iv) the 10× HASS validation honestly simulates production HASS exposure.

Interpretation: a HALT-revealed design margin of 100% on temperature (S_destruct = 2 × S_use) means the design survives stresses twice the spec limit — a strong margin. The corresponding HASS screen at S_HASS = S_destruct × 0.5 = S_use × 1.0 = exactly at the spec limit, which is too low for a HASS screen. Hobbs's recommendation: target HALT margin ≥ 50% so HASS at 0.5 × S_destruct = S_use × 1.5 — well above spec, catching defects.`,
    worked_example: `**Industrial controller HALT — temperature step-stress.**
Step schedule: +20 °C → +30 °C → ... → +150 °C, +10 °C/step, 10-min dwell.
Soft failure (intermittent latch-up, recovers on cool-down) at +110 °C.
Hard failure (permanent, no recovery) at +150 °C. Destruct limit = +150 °C.
Use spec limit = +70 °C. Design margin DM = (150 − 70)/70 = 80/70 = 1.14 = 114% (1.14× spec).
This is comfortably above Hobbs's 50% target — HALT margin is acceptable on T.

**Vibration HALT.**
Step schedule: 5 g_rms → 10 g_rms → ... → 55 g_rms, 5 g_rms/step, 10-min dwell.
Soft failure (intermittent connector contact) at 35 g_rms.
Hard failure (solder-joint crack propagation) at 55 g_rms. Destruct limit = 55 g_rms.
Use spec limit = 5 g_rms. Design margin DM = (55 − 5)/5 = 50/5 = 10.0 = 1000% (10× spec) — extremely high; HALT margin is excellent on vibration.

**HASS screen development.**
Temperature: S_HASS = 0.5 × S_destruct = 0.5 × 150 = +75 °C (just above the +70 °C spec).
Vibration: S_HASS = 0.5 × S_destruct = 0.5 × 55 = 27.5 g_rms (well above the 5 g_rms spec).
Check: S_HASS_T = +75 °C < S_soft_T = +110 °C ✓ (below operating limit — does not push the device past function).
Check: S_HASS_V = 27.5 g_rms < S_soft_V = 35 g_rms ✓ (below operating limit).
HASS profile: +75 °C with 27.5 g_rms, 2 cycles of 4 h each = 8 h total screen.

**10× HASS validation.**
Run HASS 10× on a single unit (80 h at the screen stress).
If the unit survives 80 h, the 1× HASS consumes ≤ 10% of design life (the unit would survive ~10 screens before failing).
If the unit fails before 80 h, lower S_HASS or shorten the duration and re-validate.`,
    industrial_example: `**Automotive — ECU HALT/HASS program.** A body-control module HALT revealed: temperature soft failure at +110 °C (oscillator drift), hard failure at +150 °C (solder-joint crack). Vibration soft failure at 35 g_rms (connector contact), hard failure at 55 g_rms (solder fatigue). Combined temperature-vibration step-stress revealed an interaction failure at +110 °C and 25 g_rms (solder fatigue accelerated by combined stress — not caught by single-stress HALT). The design margin on temperature (S_use = +70 °C) was 114% — sufficient. The combined-stress interaction failure triggered a redesign: the solder-joint pad geometry was enlarged (from 0.5 mm to 0.8 mm) and the PCB Tg was raised (from 130 °C to 170 °C) to reduce the combined-stress concentration. Re-HALT confirmed the redesign survived the original combined-stress step. HASS screen set at +75 °C with 25 g_rms, 2×4 h cycles. 10× HASS validation: 5 units survived 80 h each — HASS consumes ≤ 10% of design life; ship HASS as the production screen. Method per Hobbs (2000, Ch. 2–4) and O'Connor (2012, Ch. 13).`,
    case_study: `CASE_TYPE = SYNTHETIC. A medical-grade infusion pump HALT revealed: temperature soft failure at +95 °C (oscillator drift), hard failure at +130 °C (gate-oxide rupture on the MCU); vibration soft failure at 30 g_rms (battery connector contact), hard failure at 50 g_rms (PCB trace crack at the pump-motor mount). Use condition: T_use_max = +40 °C (patient environment per IEC 60601-1), vibration_use_max = 5 g_rms (portable device in a moving vehicle). Design margins: T_DM = (130 − 40)/40 = 225%; V_DM = (50 − 5)/5 = 900% — both well above the medical-device target of 50%. However, the soft-failure temperatures (+95 °C on T, 30 g_rms on vibration) were uncomfortably close to the typical medical-device cleaning/disinfection exposure (e.g., +85 °C autoclave; 10 g_rms transport vibration). The CRE's concern: the operating margin (S_soft − S_use) on T is only +55 °C — the device would malfunction in autoclave disinfection. Redesign: a higher-grade oscillator (TCXO) and a more rugged battery connector (snap-fit vs. friction). Re-HALT confirmed soft failure at +130 °C and 50 g_rms — operating margins now +90 °C and 45 g_rms — autoclave-safe. HASS screen set at +65 °C with 25 g_rms, 2×4 h cycles. 10× HASS validation passed. Source: synthetic case authored for this lesson, method per Hobbs (2000, Ch. 4) and IEC 60601-1.`,
    visual_explanation: `HALT step-stress plotted as stress (y-axis, °C or g_rms) vs time (x-axis, step count × dwell) — a staircase. Soft-failure marked with an open circle on the staircase; hard-failure marked with a filled X. The design margin is the gap between the hard-failure X and the use-condition line (horizontal dashed line). HASS screen is a horizontal band at 50% of destruct, with the HASS profile (cycles of temperature+vibration) sketched as a sawtooth within the band.`,
    simulation_opportunity: `An interactive simulation could let the learner set step-stress parameters (ΔS, T_dwell), run HALT on a virtual device, observe soft and hard failures, and compute the design margin. A second mode would let the learner set HASS screen stress (slider 30–70% of destruct) and run 10× HASS validation to check design-life consumption. A third mode would introduce a combined-stress interaction failure (the lesson's automotive case) and walk the learner through redesign iteration.`,
    common_mistakes: `- Confusing HALT with reliability quantification — HALT discovers margins, not use-condition MTBF (use ALT — Lesson 2).
- Setting HASS screen too close to the destruct limit (>70% of destruct) — consumes too much design life; the screen becomes a wear-out driver.
- Setting HASS screen below the spec limit — catches no defects; the screen is a no-op.
- Skipping the 10× HASS validation — the screen may be consuming 20–50% of design life silently.
- Reporting HALT design margin without root-causing every soft and hard failure — margins without root cause are anecdotes.
- Stopping HALT at the first hard failure — HALT should be iterative; root-cause and redesign until margins meet target.
- Single-stress HALT only — combined temperature-vibration reveals interaction failures that single-stress HALT misses (the automotive case).
- Using HALT to release a product without ALT — HALT shows margin; ALT shows use life; both are needed.`,
    limitations: `- HALT is not a reliability-quantification method — no AF, no use-condition MTBF CI.
- HALT margins do not directly correlate with field reliability without a failure-mechanism model.
- HASS screen at 50% of destruct may not catch every defect type — some defects precipitate only above 70% of destruct.
- The 10× HASS validation is a heuristic; it assumes design-life consumption is linear in HASS exposure (may not be true for fatigue mechanisms).
- Combined-stress HALT reveals only the interaction failures the combined profile excites; other interaction failures may exist.
- HALT chambers and combined temperature-vibration equipment are expensive ($200k–$1M); small programs may outsource.
- HASA (sampled HASS) trades defect-escape risk for throughput — not acceptable for safety-critical products.
- HALT root-cause and redesign is labor-intensive — FA turnaround of 2–4 weeks per iteration.`,
    comparison: `**HALT vs ALT (Lesson 2) vs HASS:**
- HALT: step-stress to destruct; discovers design margin; design-improvement method; no AF, no use-condition extrapolation.
- ALT: tested at S_acc above S_use but below mechanism-change; quantifies use-condition MTBF with CI; requires acceleration model.
- HASS: 100% production screen at 50% of destruct; catches latent manufacturing defects; not a qualification test.

**HALT vs DVP&R test-to-pass (Lesson 1):**
- DVP&R test-to-pass: verifies the design meets spec or reliability target — positive evidence for release.
- HALT test-to-fail: discovers the destruct limit and design margin — drives redesign before release.
- The two are complementary: DVP&R test-to-pass confirms the design meets the floor; HALT confirms the design has margin above the floor.

**HASS vs burn-in:**
- Burn-in: long-duration (24–168 h) stress at use condition; catches early-life failures; consumes calendar time.
- HASS: short-duration (4–8 h) stress at 50% of destruct; catches latent defects in much less time; requires HALT margins first.`,
    practical_application: `- **Electronics — automotive ECU**: HALT on temperature + vibration + combined; HASS at 50% of destruct; 10× HASS validation.
- **Aerospace — avionics LRU**: HALT per RTCA DO-160G; combined temperature-altitude-vibration; HASS screen at 50% of destruct; HASA sampled for high-volume SKUs.
- **Industrial — PLC and motor drives**: HALT for design margin; HASS for production; combined temperature-vibration-power-cycling.
- **Medical — infusion pumps, patient monitors**: HALT per IEC 60601-1; HASS for production; HASA for low-volume Class II devices.`,
    decision_scenario: `You are the CRE on a new portable medical infusion pump. HALT reveals: T soft failure at +95 °C, hard failure at +130 °C; vibration soft failure at 30 g_rms, hard failure at 50 g_rms. Use condition: T_use_max = +40 °C (patient environment), vibration_use_max = 5 g_rms (portable in moving vehicle). (a) Compute the T and vibration design margins. (b) The autoclave disinfection profile is +85 °C for 30 min — is the operating margin sufficient? (c) Set the HASS screen stresses. (d) Justify whether to release or to iterate the design.`,
    practice_questions: `- **Q1 (Easy, Recall):** Define HALT and HASS and state what each is designed to discover.
- **Q2 (Medium, Calculation):** Compute the temperature design margin for S_destruct = +150 °C, S_use = +70 °C. (114%)
- **Q3 (Medium, Application):** Set the HASS screen stress for S_destruct = +150 °C; check it is below S_soft = +110 °C. (+75 °C; yes, +75 < +110)
- **Q4 (Hard, Analyze):** Explain the 10× HASS validation and the design-life consumption threshold (≤ 10% at 1× HASS).`,
    certification_questions: `- **CRE-style (Easy):** Which test discovers the design margin (destruct limit)? (HALT)
- **CRE-style (Medium, Calculation):** Compute the HASS screen stress for S_destruct = 50 g_rms. (25 g_rms)
- **CRE-style (Hard, Analysis):** Explain the relationship between HALT, ALT, and HASS — what question does each answer?`,
    summary: `HALT is a step-stress test-to-fail method that discovers the design margin (destruct limit and operating limit); HASS is a 100% production screen at 50% of destruct that catches latent manufacturing defects. HALT is a design-improvement method (root-cause every failure, redesign, re-HALT until margins meet target ≥ 20–50%); HASS is validated by 10× HASS on a single unit (≤ 10% design-life consumption at 1× HASS). HALT/HASS are complementary to ALT (Lesson 2) and DVP&R test-to-pass (Lesson 1) — together they answer "where does the design break?" "how long will it last?" "does it meet the spec?" and "which production units have latent defects?"`,
    key_takeaways: `- HALT: step-stress to destruct; design-margin discovery; not a reliability-quantification method.
- HASS: 100% production screen at 50% of destruct; catches latent defects.
- Soft failures are recoverable (operating limit); hard failures are permanent (destruct limit).
- Design margin DM = (S_destruct − S_use)/S_use; target ≥ 20–50% (Hobbs).
- HASS validated by 10× HASS on a single unit (≤ 10% design-life consumption at 1× HASS).
- Root-cause and redesign is the heart of HALT — iterate until margins meet target.
- HALT/HASS/ALT/DVP&R are complementary — DVP&R ties them together.`,
    references: `- ASQ CRE Body of Knowledge — Reliability Testing domain.
- ISO 14224:2016 — Collection of reliability and maintenance data for equipment.
- Hobbs (2000), Accelerated Reliability Engineering: HALT and HASS, Ch. 2–4 (step-stress, destruct limit, HASS profile development).
- Nelson (2004), Ch. 10 (Step-stress and progressive-stress ALT — the ALT underpinning of HALT).
- Ebeling (2010), Ch. 13 (Accelerated life testing — context for HALT).
- O'Connor & Kleyner (2012), Ch. 13 (HALT and HASS — practitioner reference).`,
  },
  knowledgeObject: {
    title: "HALT & HASS",
    domain: "Reliability Testing",
    competency: "HALT & HASS",
    topic: "Step-Stress Margin Discovery & Production Screening",
    concept: "HALT step-stress to destruct; HASS 50% of destruct; design margin; 10× HASS validation",
    body: {
      definitions: [
        "HALT (Highly Accelerated Life Test): step-stress test to discover destruct limit and design margin; design-improvement method, not reliability quantification.",
        "HASS (Highly Accelerated Stress Screen): 100% production screen at 50% of destruct limit; catches latent manufacturing defects.",
        "Step-stress: progressive stress increase (k·ΔS per step, T_dwell at each step).",
        "Soft failure: recoverable malfunction at stress (the operating limit).",
        "Hard failure (destruct limit): permanent failure with no recovery (the destruct limit).",
        "Operating limit (S_soft): stress at which the device still functions but marginally.",
        "Destruct limit (S_destruct): stress at which the device fails permanently.",
        "Design margin: DM = (S_destruct − S_use)/S_use; the gap between destruct and use.",
        "HASS screen stress: S_HASS = 0.5 × S_destruct (typical).",
        "HASS design-life consumption: life_fraction = t_HASS/MTTF(S_HASS) ≤ 1–2%.",
        "HASA (Highly Accelerated Stress Audit): sampled HASS (5–10% of production).",
      ],
      principles: [
        "HALT discovers margins (test-to-fail); HASS screens production (test-to-fail on defects).",
        "Soft failures = operating limit; hard failures = destruct limit.",
        "Design margin DM = (S_destruct − S_use)/S_use; target ≥ 20–50% (Hobbs).",
        "HALT is NOT reliability quantification — no AF, no use-condition extrapolation.",
        "HASS at 50% of destruct; validated by 10× HASS on a single unit (≤ 10% design-life at 1× HASS).",
        "Root-cause and redesign is the heart of HALT — iterate until margins meet target.",
        "HALT/HASS/ALT/DVP&R are complementary — DVP&R ties them together.",
      ],
      components: [
        "Combined environmental chamber (temperature + 6-DOF vibration).",
        "Step-stress protocol (cold, hot, rapid thermal transitions, vibration, combined).",
        "Soft-failure detector (functional monitoring, oscilloscope, ATE).",
        "Hard-failure indicator (permanent loss of function, no recovery).",
        "Failure-analysis tools (cross-section, SEM/EDX, X-ray, dye-and-pry, FEA).",
        "Design iteration loop (root-cause → design change → re-HALT).",
        "HASS chamber (production-line, lower cost than HALT chamber).",
        "HASS profile (stress = 0.5 × S_destruct, duration, cycles).",
        "10× HASS validation (design-life-consumption check).",
      ],
      mechanism: [
        "HALT/HASS lifecycle: HALT step-stress → record soft and hard failures → compute operating and design margins → root-cause every failure → redesign (derating, component, structure, redundancy) → re-HALT until margins meet target → set HASS screen at 0.5 × S_destruct → 10× HASS validation on a single unit → ship HASS as production screen → HASA for high-volume sampled screening.",
      ],
      process: [
        "1. Mount device in combined chamber with functional monitoring.",
        "2. Cold step-stress (+20 °C down in −10 °C steps, 10-min dwell) — record soft/hard failure T.",
        "3. Hot step-stress (+20 °C up in +10 °C steps, 10-min dwell) — record soft/hard failure T.",
        "4. Rapid thermal transitions (+20 → −40 → +20 in <5 min, 5 cycles) — record failures.",
        "5. Vibration step-stress (5 g_rms up in 5 g_rms steps, 10-min dwell) — record soft/hard failure.",
        "6. Combined temperature-vibration step-stress — discover interaction failures.",
        "7. Compute operating margin OM = S_soft − S_use and design margin DM = (S_destruct − S_use)/S_use.",
        "8. Root-cause every soft and hard failure (FA).",
        "9. Iterate design → re-HALT until margins meet target (≥ 20% on T and vibration, Hobbs ≥ 50%).",
        "10. Set HASS screen at 0.5 × S_destruct.",
        "11. Validate HASS: 10× HASS on a single unit — if it survives, ship HASS.",
        "12. For high-volume products: HASA at 5–10% sampling; if a failure is found, 100% HASS the lot.",
      ],
      formulas: [
        "Step-stress: S(k) = S_0 + k·ΔS; T_dwell per step.",
        "Soft-failure threshold: S_soft [°C, g_rms, V].",
        "Hard-failure (destruct) threshold: S_destruct [°C, g_rms, V].",
        "Operating margin: OM = S_soft − S_use.",
        "Design margin: DM = (S_destruct − S_use)/S_use [dimensionless, often %].",
        "HASS screen stress: S_HASS = 0.5 × S_destruct (typical).",
        "HASS design-life consumption: life_fraction = t_HASS/MTTF(S_HASS) ≤ 1–2%.",
        "10× HASS validation: if unit survives 10× HASS, 1× HASS consumes ≤ 10% of design life.",
      ],
      metrics: [
        "Soft-failure threshold S_soft [°C, g_rms].",
        "Destruct limit S_destruct [°C, g_rms].",
        "Operating margin OM = S_soft − S_use [same units].",
        "Design margin DM = (S_destruct − S_use)/S_use [%].",
        "HASS screen stress S_HASS [°C, g_rms].",
        "HASS design-life consumption [%].",
        "Number of HALT design iterations [dimensionless].",
        "HASS throughput (units/hour) [h⁻¹].",
      ],
      examples: [
        "Industrial controller T HALT: soft +110 °C, hard +150 °C, S_use +70 °C → DM = 114%.",
        "Industrial controller V HALT: soft 35 g_rms, hard 55 g_rms, S_use 5 g_rms → DM = 1000%.",
        "HASS screen at 0.5 × destruct: T +75 °C, V 27.5 g_rms (both above spec, below soft-failure).",
        "10× HASS validation: 80 h at screen stress on a single unit — if it survives, ship HASS.",
      ],
      industrial_examples: [
        "Electronics — automotive ECU: HALT combined T+V discovers solder-joint interaction failure; redesign (enlarged pad, higher Tg PCB); re-HALT confirms; HASS at +75 °C/25 g_rms.",
        "Aerospace — avionics LRU: HALT per DO-160G combined T+altitude+V; HASS at 50% of destruct; HASA for high-volume SKUs.",
        "Industrial — PLC: HALT for design margin; HASS for production; combined T+V+power-cycling.",
        "Medical — infusion pump: HALT per IEC 60601-1; HASS for production; HASA for Class II low-volume devices.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Medical infusion pump HALT: T soft +95 °C, hard +130 °C; V soft 30 g_rms, hard 50 g_rms. Use +40 °C/5 g_rms. DM T = 225%, V = 900% — both above medical target 50%. But soft-failure T +95 °C was uncomfortably close to autoclave +85 °C (operating margin only +55 °C). Redesign: TCXO + snap-fit battery connector; re-HALT soft failure at +130 °C/50 g_rms → OM +90 °C/45 g_rms — autoclave-safe. HASS +65 °C/25 g_rms; 10× HASS passed. Method per Hobbs (Ch. 4) and IEC 60601-1.",
      ],
      common_errors: [
        "Confusing HALT with reliability quantification (use ALT for MTBF).",
        "Setting HASS at >70% of destruct — consumes too much design life.",
        "Setting HASS below spec limit — catches no defects.",
        "Skipping the 10× HASS validation.",
        "Reporting HALT margins without root-causing every failure.",
        "Stopping HALT at first hard failure — iterate until margins meet target.",
        "Single-stress HALT only — combined T+V reveals interaction failures.",
        "Using HALT to release without ALT — HALT shows margin, ALT shows use life.",
      ],
      limitations: [
        "HALT does not quantify use-condition MTBF (use ALT).",
        "HALT margins do not directly correlate with field reliability without a mechanism model.",
        "HASS at 50% of destruct may miss defects that precipitate only at >70% of destruct.",
        "10× HASS validation assumes linear design-life consumption (may not hold for fatigue).",
        "Combined-stress HALT reveals only the interaction failures the combined profile excites.",
        "HALT chambers and combined T+V equipment are expensive ($200k–$1M).",
        "HASA trades defect-escape risk for throughput — not for safety-critical products.",
        "HALT root-cause and redesign is labor-intensive (2–4 weeks per iteration).",
      ],
      best_practices: [
        "Run combined temperature-vibration HALT to catch interaction failures.",
        "Root-cause EVERY soft and hard failure — margins without FA are anecdotes.",
        "Iterate design → re-HALT until margins meet target (≥ 20% on T and V; Hobbs ≥ 50%).",
        "Set HASS at 0.5 × S_destruct — above spec, below soft-failure threshold.",
        "Validate HASS with 10× on a single unit; if it fails, lower S_HASS or shorten duration.",
        "Coordinate HALT/HASS with ALT and DVP&R — DVP&R ties them together.",
        "For high-volume products: HASA at 5–10% sampling; 100% HASS the lot if a failure is found.",
      ],
      related_concepts: [
        "Reliability Test Planning & DVP&R — Lesson 1 (test-to-pass; HALT is test-to-fail).",
        "Accelerated Life Testing (ALT) — Lesson 2 (use-condition MTBF quantification; HALT does not extrapolate).",
        "Reliability Demonstration & Success-Run — Lesson 4 (statistical demonstration on the DVP&R).",
        "Reliability Fundamentals (RF) — R(t), MTBF, failure mechanisms.",
        "Reliability in Design & Development (RDD) — FMEA/FMECA, derating, parts selection feed HALT root-cause.",
      ],
      prerequisites: [
        "ASQ CRE BOK RF — failure mechanisms, R(t), MTBF, failure-rate behavior.",
        "ASQ CRE BOK RDD — FMEA/FMECA, design reviews, derating.",
        "ASQ CRE BOK RT Lesson 1 (DVP&R) and Lesson 2 (ALT) — the complementary methods.",
        "Familiarity with combined environmental chambers and basic mechanical-vibration theory (PSD, g_rms).",
      ],
      references: [
        "ASQ CRE Body of Knowledge — Reliability Testing domain.",
        "ISO 14224:2016 — Collection of reliability and maintenance data for equipment.",
        "Hobbs (2000), Ch. 2–4 (step-stress, destruct limit, HASS profile).",
        "Nelson (2004), Ch. 10 (Step-stress and progressive-stress ALT).",
        "Ebeling (2010), Ch. 13 (Accelerated life testing — HALT context).",
        "O'Connor & Kleyner (2012), Ch. 13 (HALT and HASS — practitioner reference).",
      ],
    },
  },
  questions: [
    {
      competencyName: "HALT & HASS",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "What is the difference between HALT and HASS, and what is the typical HASS screen stress as a fraction of the destruct limit discovered in HALT?",
      whyCorrect:
        "HALT (Highly Accelerated Life Test) is a step-stress test-to-fail method that discovers the destruct limit and design margin BEFORE release; it is a design-improvement method (root-cause every failure, redesign, re-HALT). HASS (Highly Accelerated Stress Screen) is a 100% production screen run at 50% of the destruct limit stress, applied to every production unit to catch latent manufacturing defects. The 50% level is chosen so the screen is well above the spec limit (catches defects) but well below the destruct limit (does not consume significant design life). Hobbs's canonical recommendation is HASS at 0.5 × S_destruct, validated by 10× HASS on a single unit.",
      whyOthersWrong: [
        "Option A (HALT = production screen; HASS = design margin; HASS at 90% of destruct) — incorrect: HALT is design-margin discovery; HASS is the production screen; and 90% of destruct is too aggressive (consumes excessive design life).",
        "Option C (both are reliability-quantification methods at 100% of destruct) — incorrect: neither HALT nor HASS quantifies use-condition MTBF; HALT discovers margins, HASS screens production; both run BELOW 100% of destruct (HASS at 50%).",
        "Option D (HALT = burn-in at use condition; HASS = sampled audit at 50% of destruct) — incorrect: HALT is step-stress to destruct (not burn-in at use condition); HASS is 100% production screen (HASA is the sampled version).",
      ],
      explanation:
        "HALT = design-margin discovery via step-stress to destruct; HASS = 100% production screen at 50% of destruct. Hobbs's canonical HASS screen is 0.5 × S_destruct, validated by 10× HASS on a single unit.",
      options: [
        { text: "HALT = production screen; HASS = design margin; HASS at 90% of destruct", isCorrect: false },
        { text: "HALT = design margin; HASS = 100% production screen at 50% of destruct", isCorrect: true },
        { text: "Both are reliability-quantification methods at 100% of destruct", isCorrect: false },
        { text: "HALT = burn-in at use condition; HASS = sampled audit at 50% of destruct", isCorrect: false },
      ],
    },
    {
      competencyName: "HALT & HASS",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Electronics",
      stem: "An industrial controller HALT reveals temperature soft failure at +110 °C and hard failure (destruct limit) at +150 °C. The use-condition spec limit is +70 °C. Compute the design margin and the recommended HASS screen stress (50% of destruct).",
      whyCorrect:
        "Design margin DM = (S_destruct − S_use)/S_use = (150 − 70)/70 = 80/70 = 1.14 = 114% (1.14× the spec limit). This is comfortably above Hobbs's 50% target — the HALT margin is acceptable on temperature. HASS screen stress = 0.5 × S_destruct = 0.5 × 150 = +75 °C. Check: +75 °C is just above the +70 °C spec limit (catches defects) and below the +110 °C soft-failure threshold (does not push the device past the operating limit). The HASS screen is valid: it stresses the device beyond spec but does not consume significant design life.",
      whyOthersWrong: [
        "Option A (DM = 80%, HASS at +130 °C) — incorrect: DM = (S_destruct − S_use)/S_use = 80/70 = 114%, not 80% (80 is the absolute margin in °C, not the ratio); HASS at +130 °C is 87% of destruct — too aggressive (consumes excessive design life).",
        "Option B (DM = 14%, HASS at +35 °C) — incorrect: DM = 80/70 ≈ 1.14 → 114% (or 1.14×), not 14%; HASS at +35 °C is below the spec limit (+70 °C) — the screen would catch no defects.",
        "Option D (DM = 200%, HASS at +110 °C) — incorrect: DM = 114%, not 200% (which would require S_destruct = 210 °C); HASS at +110 °C is at the soft-failure threshold — the screen would push the device past the operating limit, invalidating the screen.",
      ],
      explanation:
        "DM = (150 − 70)/70 = 114% (1.14× spec); HASS = 0.5 × 150 = +75 °C. The +75 °C screen is above the +70 °C spec and below the +110 °C soft-failure — valid.",
      options: [
        { text: "DM = 80%; HASS at +130 °C (87% of destruct)", isCorrect: false },
        { text: "DM = 114%; HASS at +75 °C (50% of destruct)", isCorrect: true },
        { text: "DM = 14%; HASS at +35 °C (below spec)", isCorrect: false },
        { text: "DM = 200%; HASS at +110 °C (at soft failure)", isCorrect: false },
      ],
    },
    {
      competencyName: "HALT & HASS",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Medical",
      stem: "A medical-device HALT reveals temperature soft failure at +95 °C and hard failure at +130 °C. Use condition T_use_max = +40 °C (patient environment per IEC 60601-1). The autoclave disinfection profile is +85 °C for 30 min. What is the appropriate CRE interpretation and recommendation?",
      whyCorrect:
        "Compute the design margin: DM = (S_destruct − S_use)/S_use = (130 − 40)/40 = 90/40 = 2.25 = 225% — well above the medical-device target of 50%. So HALT margin is excellent. HOWEVER, the operating margin OM = S_soft − S_use_cleaning = +95 °C − +85 °C = +10 °C — only +10 °C above the autoclave temperature. The device would malfunction (intermittent latch-up, oscillator drift) during autoclave disinfection, even though its hard-failure margin is excellent. The CRE's recommendation: the design margin is acceptable, but the OPERATING margin against the autoclave profile is too low — iterate the design (TCXO oscillator, snap-fit battery connector) to raise S_soft to ≥ +130 °C, giving an autoclave-safe OM of +45 °C. Re-HALT, then release. The lesson: HALT must consider the operating margin against the FULL use profile (including cleaning, disinfection, transport) — not just the steady-state spec limit.",
      whyOthersWrong: [
        "Option A (Design margin 225% — release immediately; autoclave is below soft failure +95 °C, so safe) — incorrect: the autoclave at +85 °C is +10 °C below the soft-failure +95 °C — the device would malfunction in autoclave because the soft failure is RECOVERABLE malfunction, not safe operation. Soft failure means the device is OUT OF SPEC during autoclave.",
        "Option B (Design margin insufficient — iterate to raise S_destruct to ≥ 200 °C) — incorrect: the design margin (DM = 225%) is already excellent; the bottleneck is the OPERATING margin (OM = +10 °C above autoclave), not the destruct limit.",
        "Option D (HALT is not a medical-device test method; use ALT instead) — incorrect: HALT is widely used in medical devices per IEC 60601-1; the issue is the OPERATING margin, not the test method.",
      ],
      explanation:
        "DM = 225% (excellent); OM = +95 °C − +85 °C = +10 °C (insufficient — the device would malfunction in autoclave). Iterate the design (TCXO, snap-fit connector) to raise S_soft to ≥ +130 °C; re-HALT; release only when OM ≥ +45 °C against autoclave.",
      options: [
        { text: "DM = 225% — release; autoclave +85 °C is below soft +95 °C, so safe", isCorrect: false },
        { text: "DM insufficient — iterate to raise S_destruct to ≥ 200 °C", isCorrect: false },
        { text: "DM = 225% excellent but OM = +10 °C — iterate design to raise S_soft to ≥ +130 °C", isCorrect: true },
        { text: "HALT is not a medical-device method; use ALT instead", isCorrect: false },
      ],
    },
    {
      competencyName: "HALT & HASS",
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Electronics",
      stem: "True or False: HALT can be used to release a product to production without an accompanying ALT program, because HALT provides positive evidence of design margin above the use-condition spec limit.",
      whyCorrect:
        "FALSE. HALT provides evidence of design MARGIN (the destruct limit is above the use spec), but HALT does NOT quantify use-condition MTBF or provide a statistical demonstration of the reliability target. HALT answers 'where does the design break?' (destruct limit, design margin); ALT (Lesson 2) answers 'how long will the design last in the field?' (use-condition MTBF with CI). Release to production requires BOTH: HALT-confirmed design margin AND ALT-quantified use-condition MTBF (or a success-run demonstration per Lesson 1). HALT-only release is the canonical CRE mistake — the design may have excellent margin (destr well above spec) but still fail early in the field because the failure mechanism's use-condition rate is too high (e.g., a solder joint with m = 2.5 and a low-cycle fatigue mechanism that activates well below the destruct limit). The DVP&R (Lesson 1) ties HALT, ALT, and demonstration together — no single test method is sufficient for release.",
      whyOthersWrong: [
        "TRUE — would imply HALT alone is sufficient for release; in fact, HALT discovers margins but does not quantify use-condition MTBF. Release requires HALT + ALT (or success-run) on the DVP&R.",
      ],
      explanation:
        "FALSE. HALT discovers margins (destruct limit); ALT quantifies use-condition MTBF with CI. Release requires both on the DVP&R. HALT-only release is the canonical CRE mistake — the design may have great margin but still fail early in the field.",
      options: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 4 — Reliability Demonstration & Success-Run
// (Competency: "Reliability Demonstration & Success-Run"; slug: rt-demonstration-success-run)
// ---------------------------------------------------------------------------

const LESSON_DEMO: RefLesson = {
  competencyName: "Reliability Demonstration & Success-Run",
  slug: "rt-demonstration-success-run",
  title: "Reliability Demonstration & Success-Run — χ² MTBF CI, Zero-Failure, Sequential Testing",
  titleAr: "إثبات الموثوقية واختبار النجاح المتواصل",
  order: 4,
  durationMin: 35,
  references: RT_REFERENCE_TITLES,
  conceptIntroduction: `Reliability demonstration is the statistical procedure that converts observed test data (failures and unit-hours) into a statement of confidence about the population's true MTBF. The workhorses are: (i) the *success-run* (zero-failure test) — the test stops at T unit-hours with zero failures, demonstrating MTBF ≥ 2T/χ²_{α;2}; (ii) the *time-truncated χ² MTBF confidence interval* — generalizes the success-run to r > 0 observed failures with the lower bound MTBF_L = 2T/χ²_{α;2r+2} and the upper bound MTBF_U = 2T/χ²_{1−α/2;2r}; (iii) *sequential testing* (Wald's SPRT) — the test continues until the cumulative likelihood ratio crosses an accept or reject boundary, allowing earlier decisions on good or bad designs. The CRE's task: choose the demonstration method by the question (zero-failure qualification vs time-truncated with observed failures vs sequential for early decision), compute the sample size and test duration from the OC curve (Lesson 1), execute the test, and report the demonstrated MTBF_L with the confidence level.`,
  example: `A 2,000-h test on 50 units (T = 100,000 unit-hours) observes r = 1 failure at the 1,500-h mark (the failed unit is removed; the remaining 49 units run to 2,000 h). At CL = 90% (α = 0.10), the time-truncated MTBF lower bound: MTBF_L = 2T/χ²_{α; 2r+2} = 2·100,000/χ²_{0.10; 4}. The chi-squared value χ²_{0.10; 4} = 7.779. MTBF_L = 200,000/7.779 = 25,710 h. The upper bound: MTBF_U = 2T/χ²_{1−α/2; 2r} = 200,000/χ²_{0.95; 2} = 200,000/0.103 = 1,941,748 h (asymmetric, wide). The demonstrated MTBF at 90% CL is MTBF_L = 25,710 h — the test demonstrates (with 90% statistical confidence) that the population MTBF is at least 25,710 h. Compared to zero-failure success-run: with r = 0, MTBF_L = 2·100,000/χ²_{0.10; 2} = 200,000/4.605 = 43,430 h — almost 70% higher than the r = 1 case for the same T. The single observed failure cut the demonstrated MTBF by 41% — the penalty for imperfect test outcomes.`,
  keyFormulas: `Success-run (zero-failure, time-truncated, exponential): T_required = −ln(1 − CL)/λ  ; n = T_required/t_unit
  Demonstrated MTBF_L (r = 0): MTBF_L = 2T/χ²_{α;2}
Time-truncated MTBF CI (r ≥ 0, exponential):
  MTBF_L = 2T/χ²_{α; 2r+2}  ;  MTBF_U = 2T/χ²_{1−α/2; 2r}
  Note: degrees of freedom ν_L = 2r + 2 (r failures observed); ν_U = 2r.
Failure-truncated (test stops at r-th failure at time t_(r)):
  MTBF_L = 2t_(r)/χ²_{α; 2r}  ;  MTBF_U = 2t_(r)/χ²_{1−α/2; 2r}
  Total unit-hours T = Σ t_i for the r failed units + (n−r)·t_(r) for survivors.
Sequential Probability Ratio Test (Wald SPRT):
  Continue testing; at each cumulative unit-hour T_k, compute the log-likelihood ratio LR = Σ ln[f_1(t_i)/f_0(t_i)].
  Accept H_0 (MTBF ≥ M_0) if LR ≤ ln(β/(1−α)).
  Reject H_0 (MTBF < M_0) if LR ≥ ln((1−β)/α).
  Continue if ln(β/(1−α)) < LR < ln((1−β)/α).
  Boundaries are lines in the (failures, time) plane: t_accept = h_0 + s·r  ;  t_reject = h_1 + s·r.
Binomial single-shot: n = ln(1 − CL)/ln(R_target) (round up)`,
  exercise: `You are the CRE on a new industrial controller. The customer requires demonstrated MTBF ≥ 30,000 h at 90% CL. (a) Compute the success-run sample size for t_unit = 2,000 h. (b) During execution, the test observes 1 failure at the 4,000-h cumulative mark (50 units × 2,000 h = 100,000 unit-hours total). Compute the time-truncated MTBF_L at CL = 90% and the upper bound. (c) Compare to the zero-failure demonstrated MTBF_L for the same T. (d) Discuss the trade-off between time-truncated (stop at T regardless of failures) and sequential testing (stop at the SPRT boundary).`,
  sections: {
    learning_objectives: `- Define reliability demonstration as the conversion of observed test data into a confidence statement about the population's true MTBF.
- Apply the success-run (zero-failure) formula T_required = −ln(1 − CL)/λ and the demonstrated MTBF_L = 2T/χ²_{α;2}.
- Apply the time-truncated χ² MTBF CI: MTBF_L = 2T/χ²_{α;2r+2}; MTBF_U = 2T/χ²_{1−α/2;2r}.
- Apply the failure-truncated χ² CI for tests that stop at the r-th failure.
- Apply Wald's SPRT (sequential probability ratio test) for early-accept/reject decisions.
- Choose between success-run, time-truncated, and sequential by the demonstration question and the test execution reality.
- Compute sample size n from the OC curve (Lesson 1) and report demonstrated MTBF_L with CL.`,
    prerequisites: `- ASQ CRE BOK RF — R(t), exponential, MTBF, failure-rate behavior.
- ASQ CRE BOK PS — χ² distribution, confidence intervals, maximum-likelihood, sequential probability ratio testing.
- ASQ CRE BOK RT Lesson 1 (DVP&R and OC curve) — sample-size selection feeds demonstration.
- ASQ CRE BOK RT Lesson 2 (ALT) — AF-weighted unit-hours feed the success-run formula when ALT is used.`,
    introduction: `Reliability demonstration is the last step before product release. The design has been modeled (RF/RDD/RM), tested to spec (DVP&R qualification), tested for design margin (HALT — Lesson 3), and tested for use life (ALT — Lesson 2). Demonstration testing answers the question: "With what statistical confidence can we claim the production population meets the reliability target?"

The three demonstration methods:

*Success-run (zero-failure, time-truncated, exponential)*: the simplest and most common. The test runs for T unit-hours with zero failures. The demonstrated MTBF lower bound: MTBF_L = 2T/χ²_{α;2} (2 degrees of freedom because r = 0). For CL = 90% (α = 0.10) and T = 100,000 unit-hours: MTBF_L = 200,000/χ²_{0.10;2} = 200,000/4.605 = 43,430 h. The interpretation: with 90% statistical confidence, the population MTBF is at least 43,430 h. The success-run formula (Lesson 1): T_required = −ln(1 − CL)/λ; for CL = 0.90 and λ = 1/MTBF_target: T_required = −ln(0.10) × MTBF_target = 2.3026 × MTBF_target.

*Time-truncated χ² MTBF CI (r ≥ 0 failures)*: generalizes the success-run. The test runs for T unit-hours and observes r failures. The demonstrated MTBF_L = 2T/χ²_{α; 2r+2}; MTBF_U = 2T/χ²_{1−α/2; 2r}. The lower bound uses 2r+2 degrees of freedom (the "+2" reflects the uncertainty added by the observed failures); the upper bound uses 2r degrees of freedom. For r = 0, MTBF_L = 2T/χ²_{α;2} — exactly the success-run. The CI is asymmetric (MTBF_L closer to the point estimate than MTBF_U for small r).

*Sequential Probability Ratio Test (SPRT, Wald)*: the test continues unit-by-unit, and after each failure (or each cumulative unit-hour), the cumulative log-likelihood ratio LR is computed. The test stops when LR crosses the accept boundary (MTBF ≥ M_0 — accept H_0) or the reject boundary (MTBF < M_0 — reject H_0). The boundaries are lines in the (failures, time) plane. SPRT allows earlier decisions on clearly-good or clearly-bad designs; the expected test duration is shorter than the fixed-time test (saves ~30–50% on average), but the test duration is RANDOM (a borderline design may run longer than the fixed-time equivalent). SPRT is the workhorse for reliability qualification with high-volume, low-cost test units.

The CRE's choice: (i) success-run when zero failures are expected and the cost of failure is high (e.g., aerospace — fail-one-reject-all); (ii) time-truncated χ² when failures are expected and the test duration is calendar-limited; (iii) SPRT when the test duration saving matters (high-volume, low-cost units) and the customer accepts the random-duration contract. The DVP&R (Lesson 1) records the chosen method on the reliability row, with the OC curve α, β, M_target, M_LTPD.`,
    terminology: `- **Reliability demonstration**: converting observed test data (failures, unit-hours) into a confidence statement about the population's true MTBF.
- **Success-run (zero-failure test)**: time-truncated test with r = 0 acceptable failures; MTBF_L = 2T/χ²_{α;2}.
- **Time-truncated test**: test stops at fixed T regardless of failures observed.
- **Failure-truncated test**: test stops at the r-th failure (time t_(r) is the stopping time).
- **MTBF lower bound (MTBF_L)**: 2T/χ²_{α; 2r+2} for time-truncated; 2t_(r)/χ²_{α; 2r} for failure-truncated.
- **MTBF upper bound (MTBF_U)**: 2T/χ²_{1−α/2; 2r} for time-truncated; 2t_(r)/χ²_{1−α/2; 2r} for failure-truncated.
- **Degrees of freedom (ν)**: 2r (failure-truncated or upper bound); 2r+2 (lower bound for time-truncated).
- **χ² distribution**: chi-squared distribution; tabulated percentiles χ²_{p;ν}.
- **Sequential Probability Ratio Test (SPRT)**: Wald's sequential test with accept/reject boundaries in the (failures, time) plane.
- **Accept boundary (SPRT)**: t_accept = h_0 + s·r — accept H_0 (MTBF ≥ M_0).
- **Reject boundary (SPRT)**: t_reject = h_1 + s·r — reject H_0 (MTBF < M_0).
- **OC curve (operating characteristic)**: P(test passes | true MTBF = M); see Lesson 1.`,
    detailed_explanation: `The success-run is the canonical CRE-style demonstration. The principle: the test stops at T unit-hours with zero failures; the demonstrated MTBF_L is computed from the chi-squared distribution. The derivation: for an exponential R(t) = exp(−λt), the probability of zero failures in T unit-hours is P(0 | M) = exp(−T/M). The test plan sizes T such that P(0 | M_target) = 1 − CL (the test passes with 1 − CL probability when the design is exactly at target — i.e., producer's risk α = CL, see Lesson 1's True/False question). Solving: T = −ln(1 − CL) × M_target. Equivalently, the demonstrated MTBF_L at zero failures: MTBF_L = 2T/χ²_{α;2} (the chi-squared with 2 d.f. for r = 0). For CL = 90% (α = 0.10): T_required = 2.3026 × M_target; MTBF_L = 2T/4.605.

The *time-truncated χ² MTBF CI* generalizes the success-run to r > 0 observed failures. The test runs for T unit-hours and observes r failures; the failed units are replaced (or not, depending on the test design — but T counts total unit-hours of operation, including replacements). The MLE of MTBF is the point estimate: MTBF_hat = T/r. The lower-bound MTBF_L = 2T/χ²_{α; 2r+2}; the upper-bound MTBF_U = 2T/χ²_{1−α/2; 2r}. The asymmetry: for small r, MTBF_U is much larger than MTBF_L (the upper bound diverges as r → 0, since the test cannot rule out extremely high MTBF with few failures). The degrees of freedom: 2r+2 for the lower bound (the +2 reflects the added uncertainty from observed failures — the lower bound is more conservative when r > 0); 2r for the upper bound.

For the *failure-truncated* test, the test stops at the r-th failure (time t_(r) is the stopping time). Total unit-hours T = Σ t_i (failed) + (n−r)·t_(r) (survivors). MTBF_L = 2t_(r)/χ²_{α; 2r}; MTBF_U = 2t_(r)/χ²_{1−α/2; 2r}. Both bounds use 2r degrees of freedom (no +2 — the test stops exactly at the r-th failure, no uncertainty about whether more failures would have occurred).

*Sequential Probability Ratio Test (SPRT, Wald)*: the test continues unit-by-unit; after each failure (or each cumulative unit-hour milestone), the cumulative log-likelihood ratio LR = Σ ln[f_1(t_i)/f_0(t_i)] is computed, where f_0 is the pdf under H_0 (MTBF ≥ M_0) and f_1 is the pdf under H_1 (MTBF < M_1, the consumer's lower-tier MTBF). The test accepts H_0 (good design) when LR ≤ ln(β/(1−α)); rejects H_0 (bad design) when LR ≥ ln((1−β)/α); continues otherwise. For exponential failure times, the boundaries simplify to lines in the (r, T) plane: T_accept(r) = h_0 + s·r; T_reject(r) = h_1 + s·r, where h_0 = −ln(β/(1−α))/(1/M_1 − 1/M_0); h_1 = ln((1−β)/α)/(1/M_1 − 1/M_0); s = ln(M_0/M_1)/(1/M_1 − 1/M_0). The SPRT stops when (r, T) crosses either boundary. Expected test duration is ~30–50% shorter than the fixed-time equivalent for clearly-good or clearly-bad designs; for borderline designs, the SPRT may run longer.

*Choosing the method*:
- Success-run: when zero failures are expected, when the cost of failure is high (aerospace — fail-one-reject-all), and when the producer's risk at M_target is acceptable (α = CL — see Lesson 1 True/False).
- Time-truncated χ²: when failures are expected (r > 0), when the test duration is calendar-limited, and when the customer accepts the asymmetric CI (MTBF_L close to point, MTBF_U wide).
- Failure-truncated: when the test is allowed to run until the r-th failure (no calendar limit), and when the customer needs a tight CI on both bounds.
- SPRT: when test-duration savings matter (high-volume, low-cost units), and when the customer accepts the random-duration contract (the SPRT may stop early on clearly-good designs, or run longer on borderline designs).

*Reporting the demonstrated MTBF*: the canonical statement is "demonstrated MTBF ≥ MTBF_L at CL confidence." For example, "demonstrated MTBF ≥ 43,430 h at 90% confidence (zero failures in 100,000 unit-hours)." The CRE never reports the *observed* MTBF on the test sample as the *demonstrated* MTBF — the observed MTBF = T/r is a point estimate with wide CI; the demonstrated MTBF is the lower bound MTBF_L with the CL. The two are easily 2× apart for small r.

*ALT integration* (Lesson 2): when the use-condition MTBF target cannot be demonstrated in available calendar time, ALT with AF-weighted unit-hours feeds the success-run: T_use_equivalent = T_acc × AF; the demonstrated MTBF_L = 2 × T_use_equivalent / χ²_{α;2}. The model risk (Lesson 2) propagates into the CI — the demonstrated MTBF_L is conditional on the AF being valid.`,
    core_principles: `- Success-run: T_required = −ln(1 − CL)/λ; demonstrated MTBF_L = 2T/χ²_{α;2}.
- Time-truncated χ²: MTBF_L = 2T/χ²_{α; 2r+2}; MTBF_U = 2T/χ²_{1−α/2; 2r}.
- Failure-truncated: MTBF_L = 2t_(r)/χ²_{α; 2r}; MTBF_U = 2t_(r)/χ²_{1−α/2; 2r}.
- SPRT (Wald): accept H_0 when LR ≤ ln(β/(1−α)); reject when LR ≥ ln((1−β)/α); else continue.
- The demonstrated MTBF is the LOWER BOUND MTBF_L at CL — never the observed point estimate.
- ALT (Lesson 2) AF-weighted unit-hours feed the success-run: T_use_equivalent = T_acc × AF.
- The OC curve (Lesson 1) and the demonstration method are coupled: choose CL, α, β, M_target, M_LTPD before testing.`,
    components: `- **Test duration T** [h]: total unit-hours (cumulative across all units and replacements).
- **Number of failures r**: observed failures (zero for success-run; r ≥ 0 for time-truncated).
- **CL (confidence level)**: 1 − α; typically 90% or 95%.
- **χ² percentiles**: χ²_{α;ν} and χ²_{1−α/2;ν} for ν = 2r or 2r+2.
- **MTBF point estimate**: MTBF_hat = T/r (the MLE).
- **MTBF_L (lower bound)**: the demonstrated MTBF at CL confidence.
- **MTBF_U (upper bound)**: the upper bound of the CI.
- **SPRT boundaries**: t_accept = h_0 + s·r; t_reject = h_1 + s·r.
- **OC curve** (Lesson 1): α, β, M_target, M_LTPD define the demonstration contract.`,
    process: `1. Define the demonstration target (MTBF_target, CL) and the consumer's LTPD (M_LTPD, β).
2. Choose the method: success-run (zero-failure), time-truncated χ² (r ≥ 0), failure-truncated, or SPRT.
3. Construct the OC curve; compute sample size n and test duration T from the contract (α, β, M_target, M_LTPD).
4. Execute the test; record failures (with timestamps) and total unit-hours T.
5. Compute the demonstrated MTBF_L (and MTBF_U if r > 0):
   - Success-run (r = 0): MTBF_L = 2T/χ²_{α;2}.
   - Time-truncated (r ≥ 0): MTBF_L = 2T/χ²_{α; 2r+2}; MTBF_U = 2T/χ²_{1−α/2; 2r}.
   - Failure-truncated: MTBF_L = 2t_(r)/χ²_{α; 2r}; MTBF_U = 2t_(r)/χ²_{1−α/2; 2r}.
   - SPRT: report the boundary crossed (accept or reject) and the (r, T) at crossing.
6. Compare MTBF_L to the target; report "demonstrated MTBF ≥ MTBF_L at CL confidence."
7. Document on the DVP&R (Lesson 1) reliability row: method, n, T, r, CL, MTBF_L, status.`,
    formula_calculation: `Variables and formulas:
- T: total unit-hours of test [h].
- r: number of observed failures (dimensionless).
- t_(r): time of the r-th failure (failure-truncated) [h].
- CL = 1 − α: confidence level [dimensionless].
- χ²_{p;ν}: chi-squared distribution percentile p with ν degrees of freedom (tabulated; values: χ²_{0.10;2} = 4.605, χ²_{0.05;2} = 5.991, χ²_{0.10;4} = 7.779, χ²_{0.05;4} = 9.488, χ²_{0.95;2} = 0.103, χ²_{0.95;4} = 0.711).
- MTBF_hat = T/r: MLE point estimate of MTBF [h].
- MTBF_L (success-run, r = 0): MTBF_L = 2T/χ²_{α;2}  [h].
- MTBF_L (time-truncated, r ≥ 0): MTBF_L = 2T/χ²_{α; 2r+2}  [h].
- MTBF_U (time-truncated, r ≥ 0): MTBF_U = 2T/χ²_{1−α/2; 2r}  [h].
- MTBF_L (failure-truncated): MTBF_L = 2t_(r)/χ²_{α; 2r}  [h].
- MTBF_U (failure-truncated): MTBF_U = 2t_(r)/χ²_{1−α/2; 2r}  [h].
- T_required (success-run): T_required = −ln(1 − CL)/λ = −ln(1 − CL) × MTBF_target  [h].
- Binomial single-shot: n = ln(1 − CL)/ln(R_target)  [dimensionless].
- SPRT boundaries (exponential): T_accept(r) = h_0 + s·r; T_reject(r) = h_1 + s·r, where:
  s = ln(M_0/M_1)/(1/M_1 − 1/M_0); h_0 = −ln(β/(1−α))/(1/M_1 − 1/M_0); h_1 = ln((1−β)/α)/(1/M_1 − 1/M_0).

Units: T in h; r dimensionless; CL, α, β, R dimensionless [0,1]; MTBF in h; χ² percentile dimensionless.

Assumptions: (i) constant failure rate λ (exponential regime); (ii) identical units from the same production population; (iii) failures are independent; (iv) failed units are replaced (or T counts cumulative unit-hours including replacements); (v) the test stress is use-condition OR ALT acceleration model valid (Lesson 2) for AF-weighted T.

Interpretation: "demonstrated MTBF ≥ MTBF_L at CL confidence" means: with CL statistical confidence, the population MTBF is at least MTBF_L. The statement is about the population, not the tested sample. The CI is asymmetric — MTBF_L is closer to the point estimate than MTBF_U for small r.`,
    worked_example: `**Success-run demonstration (r = 0, CL = 90%).**
T = 100,000 unit-hours (e.g., 50 units × 2,000 h); r = 0.
MTBF_L = 2T/χ²_{α;2} = 2·100,000/χ²_{0.10;2} = 200,000/4.605 = 43,430 h.
Demonstrated: "MTBF ≥ 43,430 h at 90% confidence (zero failures in 100,000 unit-hours)."

**Time-truncated χ² (r = 1, CL = 90%).**
T = 100,000 unit-hours; r = 1 failure at t_1 = 1,500 h.
MTBF_L = 2T/χ²_{α; 2r+2} = 200,000/χ²_{0.10; 4} = 200,000/7.779 = 25,710 h.
MTBF_U = 2T/χ²_{1−α/2; 2r} = 200,000/χ²_{0.95; 2} = 200,000/0.103 = 1,941,748 h.
Point estimate MTBF_hat = T/r = 100,000/1 = 100,000 h (between MTBF_L and MTBF_U — the CI is very wide for r = 1).
The single observed failure cut the demonstrated MTBF_L from 43,430 h (r = 0) to 25,710 h (r = 1) — a 41% reduction in demonstrated MTBF.

**Zero-failure demonstration sizing.**
Target: MTBF ≥ 50,000 h at 90% CL, zero-failure, t_unit = 1,000 h.
T_required = −ln(1 − 0.90) × 50,000 = 2.3026 × 50,000 = 115,129 h.
n = T_required/t_unit = 115,129/1,000 = 116 units (Lesson 1).
Verify: MTBF_L = 2·115,000/χ²_{0.10;2} = 230,000/4.605 = 49,946 h ≈ 50,000 h ✓.

**SPRT (Wald) example.**
M_0 = 50,000 h (target); M_1 = 5,000 h (consumer's LTPD, β = 0.10); α = 0.10.
s = ln(M_0/M_1)/(1/M_1 − 1/M_0) = ln(10)/(1/5000 − 1/50000) = 2.303/(0.0002 − 0.00002) = 2.303/0.00018 = 12,794 h.
h_0 = −ln(β/(1−α))/(1/M_1 − 1/M_0) = −ln(0.10/0.90)/0.00018 = −ln(0.1111)/0.00018 = 2.197/0.00018 = 12,206 h.
h_1 = ln((1−β)/α)/(1/M_1 − 1/M_0) = ln(0.90/0.10)/0.00018 = ln(9)/0.00018 = 2.197/0.00018 = 12,206 h.
Boundaries: T_accept(r) = 12,206 + 12,794·r (slope ≈ 12,794 h per failure); T_reject(r) = −12,206 + 12,794·r (reject if cumulative T < boundary at r failures).
At r = 0: T_accept = 12,206 h (zero failures in 12,206 unit-hours → accept); T_reject = −12,206 (negative — never reject at r = 0).
At r = 1: T_accept = 25,000 h; T_reject = 588 h (reject if cumulative T < 588 h at the first failure).
At r = 2: T_accept = 37,794 h; T_reject = 13,382 h.
At r = 3: T_reject = 26,176 h; T_accept = 50,588 h.
The SPRT stops when (r, T) crosses either boundary — earlier decision than the fixed-time test.`,
    industrial_example: `**Aerospace — avionics LRU success-run.** A line-replaceable unit customer spec requires demonstrated MTBF ≥ 25,000 h at 90% CL zero-failure. With t_unit = 2,000 h: T_required = −ln(0.10) × 25,000 = 57,565 unit-hours; n = 57,565/2,000 = 29 units. Test execution: 29 LRUs × 2,000 h = 58,000 unit-hours, zero failures → MTBF_L = 2·58,000/χ²_{0.10;2} = 116,000/4.605 = 25,190 h ≥ 25,000 h ✓. The DVP&R row "Demonstrated MTBF ≥ 25,000 h at 90% CL" is closed with status "Pass," test report ID, and date. Method per Ebeling (2010, Ch. 11) and O'Connor (2012, Ch. 11).`,
    case_study: `CASE_TYPE = SYNTHETIC. An industrial controller customer required demonstrated MTBF ≥ 30,000 h at 90% CL. The CRE chose a time-truncated χ² test with T = 100,000 unit-hours (50 units × 2,000 h) and r_acc = 1 acceptable failure. Test execution: at t_1 = 4,000 h (cumulative unit-hours), one unit failed (root cause: a marginal tantalum capacitor — design change: substitute MLCC). The failed unit was replaced and the test continued. At T = 100,000 h with r = 1 total failure: MTBF_L = 2·100,000/χ²_{0.10;4} = 200,000/7.779 = 25,710 h — BELOW the 30,000 h target. The CRE's options: (a) re-test with the redesigned unit (n = 50, T = 100,000, zero failures → MTBF_L = 43,430 h ≥ 30,000 h ✓ — but 2,000 h of additional chamber time); (b) extend the test (n = 50, T = 200,000, r = 1 → MTBF_L = 400,000/7.779 = 51,420 h ✓ — but doubles test time); (c) accept the demonstrated MTBF_L = 25,710 h and renegotiate the target with the customer. The CRE chose (a) — re-test the redesigned unit, accepting 2,000 h of additional chamber time but providing the cleanest evidence for release. Method per Ebeling (2010, Ch. 11).`,
    visual_explanation: `The χ² MTBF CI plotted on a logarithmic MTBF axis: a bar from MTBF_L (left) to MTBF_U (right), with the MLE point estimate MTBF_hat = T/r marked. For r = 0, MTBF_U = ∞ (no upper bound — the test cannot rule out very high MTBF with zero failures). For r ≥ 1, the CI is finite but asymmetric — MTBF_L closer to MTBF_hat than MTBF_U. The SPRT plotted in the (failures r, unit-hours T) plane: two parallel boundary lines (T_accept above, T_reject below); the test path is a step function (steps up at each failure, ramps right with cumulative time); the test stops when the path crosses either line.`,
    simulation_opportunity: `An interactive simulation could let the learner select CL (slider 80–99%), r (slider 0–5 failures), T (slider 10,000–500,000 unit-hours), and display MTBF_L and MTBF_U. A second mode would let the learner run an SPRT simulation: select M_0, M_1, α, β, generate a synthetic test history (failures per Poisson process), and visualize the (r, T) path crossing the accept or reject boundary. A third mode would let the learner compare the demonstrated MTBF_L for the same T across r = 0, 1, 2, 3 — showing the dramatic penalty for observed failures.`,
    common_mistakes: `- Reporting the observed MTBF = T/r as the demonstrated MTBF — the demonstrated is the lower bound MTBF_L.
- Using MTBF_L = 2T/χ²_{α;2} for r ≥ 1 — wrong degrees of freedom; for r ≥ 1 use ν = 2r + 2.
- Confusing time-truncated (stop at T) with failure-truncated (stop at r-th failure) — different ν and different T.
- Choosing SPRT without the customer's agreement on the random-duration contract — borderline designs may run longer than the fixed-time equivalent.
- Reporting MTBF_L without the CL — the demonstrated MTBF is meaningless without the confidence level.
- Using ALT-weighted unit-hours (Lesson 2) without propagating the model risk into the CI.
- Closing the DVP&R row "Fail" without a redesign and re-test — production release requires "Pass."`,
    limitations: `- The exponential assumption (constant λ) is invalid in wear-out regimes — Weibull/LOGNOR test plans are required (Nelson, Ch. 7).
- For small r, the CI is wide — MTBF_U may be 100× MTBF_L for r = 1.
- The success-run is biased against the producer at M = M_target (α = CL — see Lesson 1 True/False).
- SPRT expected duration is shorter on average but random — a borderline design may run longer than the fixed-time equivalent.
- The χ² CI assumes failed units are replaced (T counts cumulative unit-hours); if replacements are not used, the analysis differs.
- Multi-mechanism systems (Lesson 2 case study) require mechanism-specific ALTs and combined MTBF — the single MTBF_L is a model-conditional bound.
- The demonstrated MTBF is conditional on the test stress being use-condition OR the ALT AF being valid.`,
    comparison: `**Success-run vs time-truncated χ² vs SPRT:**
- Success-run (r = 0): MTBF_L = 2T/χ²_{α;2}; simplest; biased against producer at M_target (α = CL).
- Time-truncated χ² (r ≥ 0): MTBF_L = 2T/χ²_{α; 2r+2}; allows observed failures; MTBF_U = 2T/χ²_{1−α/2; 2r}.
- Failure-truncated: MTBF_L = 2t_(r)/χ²_{α; 2r}; MTBF_U = 2t_(r)/χ²_{1−α/2; 2r}; tight CI but no calendar limit.
- SPRT (Wald): boundaries in (r, T) plane; earlier decision on clearly-good or clearly-bad designs; random duration.

**Demonstration vs HALT (Lesson 3) vs ALT (Lesson 2):**
- ALT quantifies use-condition MTBF with CI (model-based).
- HALT discovers design margin (test-to-fail; no MTBF).
- Demonstration converts observed test data into a confidence statement (statistics-based).
- All three populate DVP&R reliability rows; together they answer "how long, where break, with what confidence."`,
    practical_application: `- **Aerospace — avionics LRU success-run**: 29 units × 2,000 h, zero failures → MTBF_L = 25,190 h ≥ 25,000 target at 90% CL.
- **Industrial — PLC time-truncated χ²**: 50 units × 2,000 h, r = 1 failure → MTBF_L = 25,710 h; redesign + re-test for cleaner evidence.
- **Automotive — ECU SPRT**: high-volume production; SPRT saves 30–50% test duration on clearly-good designs; customer accepts random-duration contract.
- **Medical — implantable electronics failure-truncated**: tight CI on both MTBF_L and MTBF_U; ALT (Lesson 2) feeds the AF-weighted unit-hours.`,
    decision_scenario: `You are the CRE on a new industrial controller. Customer requires demonstrated MTBF ≥ 30,000 h at 90% CL. (a) Compute the success-run sample size for t_unit = 2,000 h. (b) During execution, the test observes 1 failure at 4,000 cumulative unit-hours (T = 100,000 total). Compute MTBF_L and decide whether to accept, re-test, or extend. (c) Compare to the SPRT for M_0 = 30,000 h, M_1 = 3,000 h, α = β = 0.10 — what are the boundaries, and where does the (r, T) = (1, 100,000) point lie?`,
    practice_questions: `- **Q1 (Easy, Recall):** State the success-run demonstrated MTBF_L formula and the degrees of freedom.
- **Q2 (Medium, Calculation):** Compute MTBF_L for T = 100,000 unit-hours, r = 0, CL = 90%. (43,430 h)
- **Q3 (Medium, Application):** Compute MTBF_L and MTBF_U for T = 100,000, r = 1, CL = 90%. (MTBF_L = 25,710 h; MTBF_U = 1,941,748 h)
- **Q4 (Hard, Analyze):** Explain the SPRT boundary concept and the trade-off vs fixed-time testing.`,
    certification_questions: `- **CRE-style (Easy):** Which formula gives the demonstrated MTBF_L for a zero-failure success-run? (MTBF_L = 2T/χ²_{α;2})
- **CRE-style (Medium, Calculation):** A 2,000-h test on 50 units yields 1 failure. Compute MTBF_L at 90% CL. (25,710 h)
- **CRE-style (Hard, Analysis):** Compare success-run, time-truncated χ², and SPRT — when would you choose each?`,
    summary: `Reliability demonstration converts observed test data (failures, unit-hours) into a confidence statement about the population MTBF. Success-run (r = 0): MTBF_L = 2T/χ²_{α;2}. Time-truncated χ² (r ≥ 0): MTBF_L = 2T/χ²_{α; 2r+2}, MTBF_U = 2T/χ²_{1−α/2; 2r}. Failure-truncated: MTBF_L = 2t_(r)/χ²_{α; 2r}. SPRT (Wald) gives earlier decisions on clearly-good or clearly-bad designs at the cost of random test duration. The demonstrated MTBF is the LOWER BOUND at CL confidence — never the observed point estimate. ALT (Lesson 2) AF-weighted unit-hours feed the success-run; HALT (Lesson 3) discovers margin but does not demonstrate MTBF. The DVP&R (Lesson 1) records the chosen method with the OC curve contract.`,
    key_takeaways: `- Success-run (r = 0): MTBF_L = 2T/χ²_{α;2}; T_required = −ln(1−CL)/λ.
- Time-truncated χ² (r ≥ 0): MTBF_L = 2T/χ²_{α; 2r+2}; MTBF_U = 2T/χ²_{1−α/2; 2r}.
- Failure-truncated: MTBF_L = 2t_(r)/χ²_{α; 2r}; MTBF_U = 2t_(r)/χ²_{1−α/2; 2r}.
- SPRT (Wald): boundaries in (r, T) plane; earlier decisions; random duration.
- The demonstrated MTBF is the LOWER BOUND MTBF_L at CL — never the observed T/r.
- ALT (Lesson 2) AF-weighted unit-hours feed the success-run; HALT (Lesson 3) discovers margin but not MTBF.
- The DVP&R (Lesson 1) records the method, OC curve (α, β, M_target, M_LTPD), and the demonstrated MTBF_L with CL.`,
    references: `- ASQ CRE Body of Knowledge — Reliability Testing domain.
- ISO 14224:2016 — Collection of reliability and maintenance data for equipment.
- Ebeling (2010), Ch. 11 (Reliability testing — test plans, OC curves, success-run, χ² MTBF CI).
- O'Connor & Kleyner (2012), Ch. 11 (Reliability testing — demonstration, success-run, sequential testing).
- Nelson (2004), Ch. 7 (MLE fitting with censored data; χ² MTBF CI for censored ALT data).
- Hobbs (2000), Ch. 1 (Overview — demonstration vs HALT/HASS vs ALT).`,
  },
  knowledgeObject: {
    title: "Reliability Demonstration & Success-Run",
    domain: "Reliability Testing",
    competency: "Reliability Demonstration & Success-Run",
    topic: "Statistical Demonstration of MTBF",
    concept: "Success-run, χ² MTBF CI, time-truncated, failure-truncated, SPRT",
    body: {
      definitions: [
        "Reliability demonstration: converting observed test data (failures, unit-hours) into a confidence statement about the population's true MTBF.",
        "Success-run (zero-failure test): time-truncated test with r = 0 acceptable failures; MTBF_L = 2T/χ²_{α;2}.",
        "Time-truncated test: stops at fixed T regardless of failures observed.",
        "Failure-truncated test: stops at the r-th failure (time t_(r)).",
        "MTBF lower bound (MTBF_L): 2T/χ²_{α; 2r+2} for time-truncated; 2t_(r)/χ²_{α; 2r} for failure-truncated.",
        "MTBF upper bound (MTBF_U): 2T/χ²_{1−α/2; 2r} for time-truncated; 2t_(r)/χ²_{1−α/2; 2r} for failure-truncated.",
        "Degrees of freedom (ν): 2r (failure-truncated or upper bound); 2r+2 (lower bound for time-truncated).",
        "χ² distribution: chi-squared; tabulated percentiles χ²_{p;ν}.",
        "Sequential Probability Ratio Test (SPRT): Wald's sequential test with accept/reject boundaries in the (r, T) plane.",
        "Accept boundary (SPRT): T_accept = h_0 + s·r — accept H_0 (MTBF ≥ M_0).",
        "Reject boundary (SPRT): T_reject = h_1 + s·r — reject H_0 (MTBF < M_0).",
      ],
      principles: [
        "Success-run: T_required = −ln(1−CL)/λ; demonstrated MTBF_L = 2T/χ²_{α;2}.",
        "Time-truncated χ²: MTBF_L = 2T/χ²_{α; 2r+2}; MTBF_U = 2T/χ²_{1−α/2; 2r}.",
        "Failure-truncated: MTBF_L = 2t_(r)/χ²_{α; 2r}; MTBF_U = 2t_(r)/χ²_{1−α/2; 2r}.",
        "SPRT (Wald): accept H_0 when LR ≤ ln(β/(1−α)); reject when LR ≥ ln((1−β)/α); else continue.",
        "Demonstrated MTBF = MTBF_L at CL — never the observed point estimate T/r.",
        "ALT (Lesson 2) AF-weighted unit-hours feed the success-run.",
        "The OC curve (Lesson 1) and the demonstration method are coupled.",
      ],
      components: [
        "Test duration T [h] (total unit-hours).",
        "Number of failures r.",
        "Confidence level CL = 1 − α.",
        "χ² percentiles χ²_{α;ν} and χ²_{1−α/2;ν} for ν = 2r or 2r+2.",
        "MTBF point estimate MTBF_hat = T/r.",
        "MTBF_L (lower bound) and MTBF_U (upper bound).",
        "SPRT boundaries T_accept = h_0 + s·r; T_reject = h_1 + s·r.",
        "OC curve (Lesson 1) — α, β, M_target, M_LTPD.",
      ],
      mechanism: [
        "Demonstration lifecycle: define target (MTBF, CL) + LTPD + β → choose method (success-run / time-truncated / failure-truncated / SPRT) → construct OC curve → compute n and T → execute → compute MTBF_L (and MTBF_U) → compare to target → close DVP&R row with method/n/T/r/CL/MTBF_L/Pass status.",
      ],
      process: [
        "1. Define the demonstration target (MTBF_target, CL) and consumer's LTPD (M_LTPD, β).",
        "2. Choose the method: success-run, time-truncated χ², failure-truncated, or SPRT.",
        "3. Construct the OC curve; compute n and T from the contract (α, β, M_target, M_LTPD).",
        "4. Execute the test; record failures (timestamps) and total unit-hours T.",
        "5. Compute MTBF_L (and MTBF_U if r > 0):",
        "   - Success-run (r = 0): MTBF_L = 2T/χ²_{α;2}.",
        "   - Time-truncated (r ≥ 0): MTBF_L = 2T/χ²_{α; 2r+2}; MTBF_U = 2T/χ²_{1−α/2; 2r}.",
        "   - Failure-truncated: MTBF_L = 2t_(r)/χ²_{α; 2r}; MTBF_U = 2t_(r)/χ²_{1−α/2; 2r}.",
        "   - SPRT: report the boundary crossed (accept/reject) and the (r, T) at crossing.",
        "6. Compare MTBF_L to the target; report 'demonstrated MTBF ≥ MTBF_L at CL confidence.'",
        "7. Document on the DVP&R row: method, n, T, r, CL, MTBF_L, status.",
      ],
      formulas: [
        "Success-run (r = 0): T_required = −ln(1−CL)/λ; MTBF_L = 2T/χ²_{α;2}.",
        "Time-truncated (r ≥ 0): MTBF_L = 2T/χ²_{α; 2r+2}; MTBF_U = 2T/χ²_{1−α/2; 2r}.",
        "Failure-truncated: MTBF_L = 2t_(r)/χ²_{α; 2r}; MTBF_U = 2t_(r)/χ²_{1−α/2; 2r}.",
        "Point estimate: MTBF_hat = T/r.",
        "Binomial single-shot: n = ln(1−CL)/ln(R_target).",
        "SPRT: T_accept = h_0 + s·r; T_reject = h_1 + s·r; s = ln(M_0/M_1)/(1/M_1 − 1/M_0);",
        "  h_0 = −ln(β/(1−α))/(1/M_1 − 1/M_0); h_1 = ln((1−β)/α)/(1/M_1 − 1/M_0).",
      ],
      metrics: [
        "Demonstrated MTBF_L [h] at CL [%].",
        "MTBF_U [h] (upper bound; ∞ for r = 0).",
        "Total unit-hours T [h].",
        "Number of failures r.",
        "CL, α, β [dimensionless].",
        "OC curve discrimination (α at M_target; β at M_LTPD).",
        "SPRT boundary slopes and intercepts.",
      ],
      examples: [
        "Success-run: T = 100,000 unit-hours, r = 0, CL = 90% → MTBF_L = 200,000/4.605 = 43,430 h.",
        "Time-truncated χ²: T = 100,000, r = 1, CL = 90% → MTBF_L = 200,000/7.779 = 25,710 h; MTBF_U = 200,000/0.103 = 1,941,748 h.",
        "Zero-failure sizing: MTBF ≥ 50,000 h at 90% CL → T_required = 115,129 unit-hours; n = 116 units at t_unit = 1,000 h.",
        "SPRT example: M_0 = 50,000 h, M_1 = 5,000 h, α = β = 0.10 → s = 12,794 h/failure; h_0 = h_1 = 12,206 h.",
      ],
      industrial_examples: [
        "Aerospace — avionics LRU success-run: 29 units × 2,000 h, zero failures → MTBF_L = 25,190 h ≥ 25,000 target at 90% CL.",
        "Industrial — PLC time-truncated χ²: 50 units × 2,000 h, r = 1 failure → MTBF_L = 25,710 h (below target); redesign + re-test.",
        "Automotive — ECU SPRT: high-volume production; SPRT saves 30–50% test duration on clearly-good designs.",
        "Medical — implantable failure-truncated: tight CI on both MTBF_L and MTBF_U; ALT feeds AF-weighted unit-hours.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Industrial controller required MTBF ≥ 30,000 h at 90% CL. Time-truncated χ²: T = 100,000 (50×2,000), r_acc = 1. At t_1 = 4,000 h one tantalum-cap failure (root cause; design change to MLCC). Final: r = 1, T = 100,000 → MTBF_L = 25,710 h BELOW target. CRE chose (a) re-test redesigned unit (zero failures → 43,430 h ✓) over (b) extending test or (c) renegotiating target. Method per Ebeling (Ch. 11).",
      ],
      common_errors: [
        "Reporting observed MTBF = T/r as the demonstrated MTBF (use the lower bound MTBF_L).",
        "Using ν = 2 for r ≥ 1 (use ν = 2r + 2 for the lower bound).",
        "Confusing time-truncated (stop at T) with failure-truncated (stop at r-th failure).",
        "Choosing SPRT without the customer's agreement on random-duration contract.",
        "Reporting MTBF_L without the CL.",
        "Using ALT-weighted T without propagating model risk into the CI.",
        "Closing the DVP&R row 'Fail' without redesign and re-test.",
      ],
      limitations: [
        "Exponential (constant-λ) assumption invalid in wear-out — Weibull/LOGNOR test plans required.",
        "For small r, the CI is wide (MTBF_U may be 100× MTBF_L for r = 1).",
        "Success-run is biased against the producer at M = M_target (α = CL).",
        "SPRT expected duration is shorter on average but random — borderline designs may run longer.",
        "χ² CI assumes failed units are replaced (T counts cumulative unit-hours).",
        "Multi-mechanism systems require mechanism-specific ALTs + combined MTBF (single MTBF_L is model-conditional).",
        "Demonstrated MTBF is conditional on the test stress being use-condition OR ALT AF valid.",
      ],
      best_practices: [
        "Always report the demonstrated MTBF as MTBF_L with CL — never the observed T/r point estimate.",
        "Use ν = 2r + 2 for the time-truncated lower bound; ν = 2r for the failure-truncated lower bound.",
        "Distinguish time-truncated (fixed T, any r) from failure-truncated (stop at r-th failure).",
        "Negotiate α, β, M_target, M_LTPD on the OC curve BEFORE the test (Lesson 1).",
        "Choose SPRT only with the customer's agreement on the random-duration contract.",
        "Use ALT (Lesson 2) AF-weighted T when calendar time is insufficient; propagate model risk into the CI.",
        "Close the DVP&R reliability row with method/n/T/r/CL/MTBF_L/Pass status; never close 'Fail.'",
      ],
      related_concepts: [
        "Reliability Test Planning & DVP&R — Lesson 1 (OC curve, sample size, qualification vs demonstration).",
        "Accelerated Life Testing (ALT) — Lesson 2 (AF-weighted unit-hours feed the success-run).",
        "HALT & HASS — Lesson 3 (design margin discovery; not a demonstration method).",
        "Reliability Fundamentals (RF) — R(t), exponential, MTBF, χ² distribution.",
        "Probability & Statistics (PS) — χ² distribution, MLE, SPRT.",
      ],
      prerequisites: [
        "ASQ CRE BOK RF — R(t), exponential, MTBF, failure-rate behavior.",
        "ASQ CRE BOK PS — χ² distribution, confidence intervals, MLE, SPRT.",
        "ASQ CRE BOK RT Lesson 1 (DVP&R and OC curve) — sample-size selection feeds demonstration.",
        "ASQ CRE BOK RT Lesson 2 (ALT) — AF-weighted unit-hours for time-compressed demonstration.",
      ],
      references: [
        "ASQ CRE Body of Knowledge — Reliability Testing domain.",
        "ISO 14224:2016 — Collection of reliability and maintenance data for equipment.",
        "Ebeling (2010), Ch. 11 (Reliability testing — test plans, OC curves, success-run, χ² MTBF CI).",
        "O'Connor & Kleyner (2012), Ch. 11 (Reliability testing — demonstration, success-run, sequential).",
        "Nelson (2004), Ch. 7 (MLE fitting with censored data; χ² MTBF CI for censored ALT).",
        "Hobbs (2000), Ch. 1 (Overview — demonstration vs HALT/HASS vs ALT).",
      ],
    },
  },
  questions: [
    {
      competencyName: "Reliability Demonstration & Success-Run",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "What is the formula for the demonstrated MTBF lower bound (MTBF_L) at confidence level CL for a zero-failure (success-run) time-truncated test of duration T unit-hours, assuming an exponential failure distribution?",
      whyCorrect:
        "For a zero-failure success-run (r = 0) time-truncated test, the demonstrated MTBF lower bound at CL = 1 − α is MTBF_L = 2T/χ²_{α; 2}. The chi-squared distribution with 2 degrees of freedom (ν = 2 because r = 0) gives the lower percentile χ²_{α; 2}. For CL = 90% (α = 0.10): χ²_{0.10; 2} = 4.605, so MTBF_L = 2T/4.605. This formula is the standard success-run demonstration: the test passes with zero failures in T unit-hours, demonstrating (with 1 − α confidence) that the population MTBF is at least 2T/χ²_{α; 2}.",
      whyOthersWrong: [
        "Option A (MTBF_L = T/r) — incorrect: this is the MLE point estimate of MTBF (for r ≥ 1), not a confidence bound. For r = 0 it is undefined (division by zero). Demonstrated MTBF is the lower bound, not the point estimate.",
        "Option C (MTBF_L = 2T/χ²_{α; 2r+2}) — incorrect for r = 0: this is the time-truncated formula for r ≥ 0 OBSERVED failures; for r = 0 it reduces to MTBF_L = 2T/χ²_{α; 2} which uses ν = 2, but the formula as written ν = 2r + 2 with r ≥ 1. The simplest form for the zero-failure case is MTBF_L = 2T/χ²_{α; 2}.",
        "Option D (MTBF_L = T · ln(1 − CL)) — incorrect: this formula has no statistical basis; the success-run formula uses the χ² distribution with ν = 2, not a logarithm of T.",
      ],
      explanation:
        "Success-run (r = 0): MTBF_L = 2T/χ²_{α; 2}. For CL = 90% (α = 0.10): χ²_{0.10; 2} = 4.605; MTBF_L = 2T/4.605. For T = 100,000 unit-hours: MTBF_L = 43,430 h at 90% confidence.",
      options: [
        { text: "MTBF_L = T/r (the MLE point estimate)", isCorrect: false },
        { text: "MTBF_L = 2T/χ²_{α; 2}", isCorrect: true },
        { text: "MTBF_L = 2T/χ²_{α; 2r + 2} (for r ≥ 1 failures)", isCorrect: false },
        { text: "MTBF_L = T · ln(1 − CL)", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability Demonstration & Success-Run",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Aerospace",
      stem: "A zero-failure success-run test on an avionics LRU runs T = 100,000 unit-hours (50 units × 2,000 h) with zero failures. Compute the demonstrated MTBF lower bound at 90% confidence. Given χ²_{0.10; 2} = 4.605.",
      whyCorrect:
        "Success-run (r = 0, time-truncated, exponential): MTBF_L = 2T/χ²_{α; 2} = 2·100,000/χ²_{0.10; 2} = 200,000/4.605 = 43,430.6 h. The test demonstrates (with 90% statistical confidence) that the population MTBF of the avionics LRU is at least 43,430 h. This is the canonical CRE success-run computation; the DVP&R reliability row would be closed with status 'Pass,' demonstrated MTBF ≥ 43,430 h at 90% CL, with the test report ID. If the customer's target was MTBF ≥ 25,000 h, the test overshoots by ~1.7× — the program could have used fewer units (n = 29 at t_unit = 2,000 h → T = 58,000 → MTBF_L = 25,190 h) and still met the spec.",
      whyOthersWrong: [
        "Option A (MTBF_L = 100,000 h = T) — incorrect: this is the MLE point estimate for r = 1 failure (T/r = 100,000), but the test observed ZERO failures, so the MLE is undefined; the demonstrated MTBF_L is the lower bound via the χ² distribution, not T.",
        "Option B (MTBF_L = 25,000 h) — incorrect: this is the customer's target; the demonstrated MTBF_L is 43,430 h, well above the target. The test overshoots the spec by ~1.7×.",
        "Option D (MTBF_L = 200,000 h = 2T) — incorrect: this would be the case if χ²_{α; 2} = 1, but the actual χ²_{0.10; 2} = 4.605 (a value greater than 1 because we are using the lower percentile of a right-skewed distribution). MTBF_L = 2T/4.605 = 43,430 h.",
      ],
      explanation:
        "MTBF_L = 2T/χ²_{α; 2} = 200,000/4.605 = 43,430 h at 90% CL. The test demonstrates MTBF ≥ 43,430 h with 90% statistical confidence — well above a typical 25,000 h avionics target.",
      options: [
        { text: "MTBF_L = 100,000 h (= T, the MLE for r = 1)", isCorrect: false },
        { text: "MTBF_L = 43,430 h (2T/χ²_{0.10; 2})", isCorrect: true },
        { text: "MTBF_L = 25,000 h (= customer's target)", isCorrect: false },
        { text: "MTBF_L = 200,000 h (= 2T)", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability Demonstration & Success-Run",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Industrial",
      stem: "A time-truncated test runs T = 100,000 unit-hours (50 units × 2,000 h) and observes r = 1 failure at the 1,500-h mark. Compute the demonstrated MTBF lower bound and upper bound at 90% confidence. Given χ²_{0.10; 4} = 7.779 and χ²_{0.95; 2} = 0.103.",
      whyCorrect:
        "Time-truncated (r ≥ 0) MTBF CI: MTBF_L = 2T/χ²_{α; 2r + 2} = 2·100,000/χ²_{0.10; 4} = 200,000/7.779 = 25,710 h. MTBF_U = 2T/χ²_{1 − α/2; 2r} = 200,000/χ²_{0.95; 2} = 200,000/0.103 = 1,941,748 h. The demonstrated MTBF at 90% CL is MTBF_L = 25,710 h (the lower bound); the upper bound is 1.94 million hours. The MLE point estimate MTBF_hat = T/r = 100,000 h sits between the two bounds (the CI is very wide and asymmetric for r = 1). Compared to the zero-failure success-run MTBF_L = 43,430 h for the same T (Lesson 4 Q2), the single observed failure cut the demonstrated MTBF_L by 41% — a substantial penalty for imperfect test outcomes.",
      whyOthersWrong: [
        "Option A (MTBF_L = 43,430 h, MTBF_U = ∞) — incorrect: this is the zero-failure success-run result; with r = 1 observed failure, the lower-bound degrees of freedom increase from 2 to 2r + 2 = 4, lowering MTBF_L to 25,710 h, and the upper bound becomes finite.",
        "Option B (MTBF_L = MTBF_U = 100,000 h) — incorrect: this would be a symmetric CI centered on the MLE point estimate; the χ² MTBF CI is asymmetric (especially for small r) and the lower bound is below the MLE while the upper bound is above.",
        "Option D (MTBF_L = 12,855 h, MTBF_U = 200,000 h) — incorrect: this would be obtained by using ν = 2r + 2 = 4 for BOTH bounds (wrong) and dividing by χ²_{0.10; 4} = 7.779 twice with factor of 2 error; the correct upper bound uses ν = 2r = 2 and the upper percentile χ²_{0.95; 2} = 0.103.",
      ],
      explanation:
        "MTBF_L = 2T/χ²_{0.10; 4} = 200,000/7.779 = 25,710 h. MTBF_U = 2T/χ²_{0.95; 2} = 200,000/0.103 = 1,941,748 h. The single failure cut MTBF_L by 41% vs the zero-failure case (43,430 h).",
      options: [
        { text: "MTBF_L = 43,430 h; MTBF_U = ∞ (zero-failure success-run)", isCorrect: false },
        { text: "MTBF_L = 25,710 h; MTBF_U = 1,941,748 h", isCorrect: true },
        { text: "MTBF_L = MTBF_U = 100,000 h (symmetric CI on MLE)", isCorrect: false },
        { text: "MTBF_L = 12,855 h; MTBF_U = 200,000 h (ν = 4 for both bounds)", isCorrect: false },
      ],
    },
    {
      competencyName: "Reliability Demonstration & Success-Run",
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Automotive",
      stem: "True or False: For a sequential probability ratio test (SPRT, Wald) on MTBF demonstration, the test stops as soon as the (cumulative failures r, cumulative unit-hours T) point crosses either the accept boundary or the reject boundary in the (r, T) plane — the test does not need to run to a fixed T.",
      whyCorrect:
        "TRUE. Wald's SPRT is a sequential test: after each failure (or each cumulative unit-hour milestone), the cumulative log-likelihood ratio LR = Σ ln[f_1(t_i)/f_0(t_i)] is computed and compared to two boundaries: the accept boundary (LR ≤ ln(β/(1−α)) — accept H_0: MTBF ≥ M_0) and the reject boundary (LR ≥ ln((1−β)/α) — reject H_0). For the exponential distribution, these boundaries simplify to lines in the (r, T) plane: T_accept(r) = h_0 + s·r and T_reject(r) = h_1 + s·r. The test stops at the FIRST crossing of either boundary — there is no fixed-duration contract. The advantage: on clearly-good or clearly-bad designs, the SPRT stops earlier than the fixed-time test (saves ~30–50% test duration on average). The trade-off: for borderline designs (true MTBF near M_0 or near M_1), the SPRT may run LONGER than the fixed-time equivalent — the customer must accept the random-duration contract. SPRT is the workhorse for high-volume, low-cost test units (e.g., automotive ECUs), where the test-duration savings dominate over the borderline-design risk.",
      whyOthersWrong: [
        "FALSE — would imply the SPRT must run to a fixed T like the success-run or time-truncated χ²; in fact, the SPRT's defining feature is its sequential stopping rule: the test stops as soon as (r, T) crosses either boundary, without a fixed-duration contract.",
      ],
      explanation:
        "TRUE. The SPRT (Wald) stops at the first crossing of either the accept or reject boundary in the (r, T) plane — no fixed T. Saves ~30–50% test duration on clearly-good or clearly-bad designs; may run longer on borderline designs. Customer must accept random-duration contract.",
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

export const CRE_RT_LESSONS: RefLesson[] = [
  LESSON_DVPR,
  LESSON_ALT,
  LESSON_HALT_HASS,
  LESSON_DEMO,
];

// ---------------------------------------------------------------------------
// RT competencies created inside loadReference() (RT domain exists in
// src/lib/ref-content/cre.ts with NO competencies yet — this loader seeds
// the 4 RT competencies and then loads the deep content).
// ---------------------------------------------------------------------------

interface SeedCompetency {
  name: string;
  description: string;
  order: number;
}

const CRE_RT_COMPETENCIES: SeedCompetency[] = [
  {
    name: "Reliability Test Planning & DVP&R",
    description:
      "Design Verification Plan & Report (DVP&R); qualification vs reliability demonstration; success-run sample size; OC curve; producer's and consumer's risk; test-condition selection from the field mission profile; traceability matrix.",
    order: 1,
  },
  {
    name: "Accelerated Life Testing (ALT)",
    description:
      "Acceleration Factor (AF) computation; Arrhenius, Eyring, Coffin-Manson, and Inverse-Power models; activation energy, fatigue exponent, power-law exponent; multi-stress generalized Eyring; mechanism-change threshold and failure-mode validation; ALT test-plan sizing.",
    order: 2,
  },
  {
    name: "HALT & HASS",
    description:
      "Highly Accelerated Life Test (HALT) step-stress to destruct limit; soft and hard failures; operating and design margins; Highly Accelerated Stress Screen (HASS) at 50% of destruct; 10× HASS design-life-consumption validation; HASA sampled screen; combined temperature-vibration interaction failures.",
    order: 3,
  },
  {
    name: "Reliability Demonstration & Success-Run",
    description:
      "Success-run (zero-failure) demonstration MTBF_L = 2T/χ²_{α;2}; time-truncated χ² MTBF CI; failure-truncated CI; Wald's Sequential Probability Ratio Test (SPRT) with accept/reject boundaries; ALT-weighted unit-hours feeding the success-run.",
    order: 4,
  },
];

// ---------------------------------------------------------------------------
// Loader — CONTENT-only (mirrors cre-reliability-modeling.ts) with the
// additional step of creating the 4 RT competencies inside loadReference().
// ---------------------------------------------------------------------------

/**
 * Upsert the CRE Reliability Testing (RT) CONTENT into the database.
 * Idempotent: safe to call repeatedly. Returns record counts written.
 *
 * Flow:
 *  1. Find CRE certification by slug "cre" (the structure+RF-content loader
 *     in src/lib/ref-content/cre.ts is a prerequisite).
 *  2. Find the RT domain by code "RT" (certificationId = cre.id). The RT
 *     domain exists in cre.ts with NO competencies — delete any stale RT
 *     competencies and create the 4 RT competencies from
 *     CRE_RT_COMPETENCIES. Map by NAME -> id.
 *  3. Upsert References globally (by title, no sectionId) → shared ids
 *     applied to every RT lesson, KO, and question.
 *  4. For each lesson:
 *     - db.lesson.findFirst({where:{competencyId, slug}}) then update or
 *       create with sectionId=null, certificationId, competencyId, slug,
 *       title, titleAr, order, durationMin, conceptIntroduction, example,
 *       keyFormulas, exercise, sections (JSON.stringify), referenceIds
 *       (JSON.stringify shared), status="READY", confidence="HIGH",
 *       verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
 *  5. Upsert KnowledgeObject per lesson: findFirst({where:{lessonId}}) then
 *     create/update with certificationId, domainId (RT), competencyId,
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

  // 2) Find the RT domain by code "RT" (certificationId = cre.id). The RT
  //    domain exists in cre.ts but is seeded with NO competencies — delete
  //    any stale RT competencies and create the 4 RT competencies here.
  const rtDomain = await db.domain.findFirst({
    where: { certificationId: certification.id, code: "RT" },
  });
  if (!rtDomain) {
    throw new Error(
      'Reliability Testing (RT) domain not found under CRE. Run the CRE structure+RF-content loader (src/lib/ref-content/cre.ts) first.'
    );
  }

  // Delete any existing RT competencies (idempotent re-create).
  await db.competency.deleteMany({
    where: { domainId: rtDomain.id },
  });

  // Create the 4 RT competencies.
  for (const c of CRE_RT_COMPETENCIES) {
    await db.competency.create({
      data: {
        domainId: rtDomain.id,
        name: c.name,
        description: c.description,
        order: c.order,
      },
    });
  }

  // Map RT competencies by NAME -> id.
  const rtCompetencies = await db.competency.findMany({
    where: { domainId: rtDomain.id },
  });
  const competencyIdByName: Record<string, string> = {};
  for (const c of rtCompetencies) {
    competencyIdByName[c.name] = c.id;
  }
  // Validate that all 4 expected RT competencies exist by name.
  const expectedCompetencyNames = CRE_RT_LESSONS.map((l) => l.competencyName);
  const missing = expectedCompetencyNames.filter(
    (n) => !competencyIdByName[n]
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing RT competencies by name: ${missing.join(
        ", "
      )}. Ensure CRE_RT_COMPETENCIES matches CRE_RT_LESSONS competencyName.`
    );
  }

  // 3) References — global (no sectionId), upserted by title.
  const refIdsByTitle: Record<string, string> = {};
  for (const src of CRE_RT_SOURCES) {
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
  const sharedReferenceIds = CRE_RT_SOURCES.map((s) => refIdsByTitle[s.title]).filter(
    Boolean
  ) as string[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 4) Lessons, 5) KnowledgeObjects, 6) Questions
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of CRE_RT_LESSONS) {
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
      domainId: rtDomain.id,
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
          domainId: rtDomain.id,
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
    domain: rtDomain.id,
    competencies: rtCompetencies.length,
    lessons: lessonsCount,
    kos: kosCount,
    questions: questionsCount,
    references: referencesCount,
  };
}
