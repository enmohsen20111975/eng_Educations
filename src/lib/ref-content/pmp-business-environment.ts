// =============================================================================
// PMP — Project Management Professional (PMI) — Business Environment (BE) domain
// CONTENT-only deep scientific reference (Task ID 17-PMP-BE).
//
// Certification slug: "pmp" (PMI). Domain code: "BE" (Business Environment) —
// the 3rd of 3 PMI PMP ECO domains (People 42% / Process 50% / Business
// Environment 8%). The PMP certification + 3 domains EXIST (created by
// src/lib/ref-content/pmp.ts, which is the combined structure + PPL-content
// loader). The BE (Business Environment) domain exists with NO competencies —
// THIS loader creates them.
//
// This CONTENT-only loader mirrors src/lib/ref-content/pmp-process.ts:
//   1) find PMP cert by slug "pmp"; find BE domain by code "BE".
//   2) deleteMany existing BE competencies, then create 3 BE competencies.
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
// operates on BE only.
//
// Three lessons, one per BE competency (created below in loadReference()):
//   1. Strategic & Organizational Alignment   (slug: be-strategic-alignment)
//   2. Compliance, Regulations & Standards    (slug: be-compliance-standards)
//   3. Business Value & Benefits Realization  (slug: be-business-value-benefits)
//
// Each lesson ships:
//   - The full 24-section data-collector template (spec §9, LESSON_TEMPLATE
//     in src/lib/spec.ts), with every applicable section filled with real,
//     in-depth professional project-management content. No padding.
//   - A Knowledge Object body (spec §7, KO_FIELDS) with applicable arrays
//     populated with real content.
//   - 4 enriched questions (3 MCQ + 1 TrueFalse per lesson; 12 total)
//     with whyCorrect + one whyOthersWrong per distractor + cognitiveLevel
//     + KO link + scenario/industry metadata.
//
// Real sources (6 — do NOT invent):
//   1. PMI PMBOK® Guide 7th Edition (L3, BOK)
//   2. PMI Standard for Portfolio Management (4th ed., 2018) (L3, HANDBOOK)
//   3. PMI Business Analysis for Practitioners: A Practice Guide (L3, HANDBOOK)
//   4. Harold Kerzner, "Project Management: A Systems Approach to Planning,
//      Scheduling, and Controlling" (13th ed., Wiley, 2022) (L7, BOOK)
//   5. ISO 21500:2021 (L2, STANDARD) — cited as Reference only; NO Standard
//      row is created in the platform's Standard table (no iso-21500 row
//      exists; per task instruction, do NOT invent a standard).
//   6. Kaplan & Norton, "The Balanced Scorecard: Translating Strategy into
//      Action" (Harvard Business Review Press, 1996) (L6, BOOK).
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
// Public types (mirror pmp-process.ts & pmp.ts)
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
// SOURCES — 6 real references cited across all BE lessons.
// ---------------------------------------------------------------------------

export const PMP_BE_SOURCES: RefSource[] = [
  {
    title:
      "PMI — A Guide to the Project Management Body of Knowledge (PMBOK® Guide), 7th Edition",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "BOK",
    url: "https://www.pmi.org/standards/pmbok",
    citation:
      "Project Management Institute (PMI). (2021). A Guide to the Project Management Body of Knowledge (PMBOK® Guide) — 7th Edition. Newtown Square, PA: Project Management Institute. ISBN 978-1-62825-862-3. The 7th Edition reframes project management around 8 Performance Domains (Stakeholder, Team, Development Approach & Life Cycle, Planning, Project Work, Delivery, Measurement, Uncertainty) and 12 Principles. The Business Environment (BE) PMP ECO domain draws from the Delivery and Measurement performance domains and the Focus on Value, Navigate Complexity, and Tailor to Context principles — strategic alignment, benefits realization, and compliance are explicitly treated under these principles.",
  },
  {
    title:
      "PMI — The Standard for Portfolio Management (4th Edition, 2018)",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "HANDBOOK",
    url: "https://www.pmi.org/standards/portfolio-management",
    citation:
      "Project Management Institute (PMI). (2018). The Standard for Portfolio Management — 4th Edition. Newtown Square, PA: Project Management Institute. The official PMI standard for portfolio-management practice: portfolio strategic plan, portfolio objectives cascade, portfolio components (programs and projects), portfolio performance metrics, portfolio optimization (scoring models, weighted criteria, financial methods NPV/IRR/payback), portfolio governance (steering committee, stage-gate), portfolio risk, and the portfolio-to-strategy linkage that every project-selection decision must trace back to. Anchors the Strategic & Organizational Alignment lesson's project-selection and portfolio-alignment content.",
  },
  {
    title:
      "PMI — Business Analysis for Practitioners: A Practice Guide (2015)",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "HANDBOOK",
    url: "https://www.pmi.org/standards/business-analysis",
    citation:
      "Project Management Institute (PMI). (2015). Business Analysis for Practitioners: A Practice Guide. Newtown Square, PA: Project Management Institute. The official PMI practice guide for business analysis: business case development, benefits and value identification, stakeholder requirements elicitation, solution evaluation, and benefits-tracking practices. Provides the canonical framework for benefits management, benefits owners, and the business-value definition (financial / strategic / social) referenced in the BE Business Value & Benefits Realization lesson.",
  },
  {
    title:
      "Kerzner — Project Management: A Systems Approach to Planning, Scheduling, and Controlling (Wiley, 13th ed., 2022)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Kerzner, H. (2022). Project Management: A Systems Approach to Planning, Scheduling, and Controlling (13th ed.). Hoboken, NJ: John Wiley & Sons. ISBN 978-1-119-62011-2. The canonical technical reference for project-selection financial methods (NPV, IRR, payback, profitability index), the weighted-factor scoring model, benefits realization, total cost of ownership (TCO) and ROI analysis, and the role of the project manager as a strategic execution agent. Cited across all three BE lessons as the industry-standard textbook for business-environment engineering.",
  },
  {
    title:
      "ISO 21500:2021 — Project, programme and portfolio management — Guidance on project management",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/68569.html",
    citation:
      "International Organization for Standardization. ISO 21500:2021, Project, programme and portfolio management — Guidance on project management. Geneva: ISO. The international standard providing high-level guidance on project, programme, and portfolio management concepts, processes, and themes (governance, stakeholder, scope, schedule, resources, cost, risk, change, compliance). Cited as a Reference here; no Standard row is created in the platform's Standard table (the iso-21500 slug was not present at authoring time — per task instruction, do NOT invent a standard).",
  },
  {
    title:
      "Kaplan & Norton — The Balanced Scorecard: Translating Strategy into Action (HBR Press, 1996)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Kaplan, R. S., & Norton, D. P. (1996). The Balanced Scorecard: Translating Strategy into Action. Boston, MA: Harvard Business School Press. ISBN 978-0-87584-651-4. The seminal work on the balanced scorecard as a strategic management system: four perspectives (Financial, Customer, Internal Business Processes, Learning & Growth), the strategy map linking objectives across perspectives, and the cascade of scorecards from the enterprise to the business unit to the individual. Anchors the Strategic & Organizational Alignment lesson's balanced-scorecard and OKRs material.",
  },
];

const BE_REFERENCE_TITLES = PMP_BE_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// BE COMPETENCIES — created inside loadReference() (mirror PRC pattern).
// ---------------------------------------------------------------------------

const PMP_BE_COMPETENCIES = [
  {
    name: "Strategic & Organizational Alignment",
    description:
      "Organizational strategy, mission/vision, project selection financial methods (NPV, IRR, payback, profitability index), weighted-factor scoring model, portfolio alignment, stage-gate governance, OKRs, balanced scorecard (Kaplan & Norton 4 perspectives), strategy map cascade.",
    order: 1,
  },
  {
    name: "Compliance, Regulations & Standards",
    description:
      "Regulatory compliance, ISO/industry standards (ISO 9001 quality, ISO 14001 environmental, ISO 27001 information security, ISO 45001 occupational health & safety), ESG (environmental, social, governance), data privacy (GDPR), occupational health & safety management systems (ISO 45001:2018 clauses 4-10), environmental compliance, gap analysis, CAPA, internal audit (ISO 19011).",
    order: 2,
  },
  {
    name: "Business Value & Benefits Realization",
    description:
      "Business value (financial, strategic, social), benefits management lifecycle (identify, plan, track, realize, sustain), benefits realization plan, benefits owner accountability, value tracking (KPI dashboards), ROI, total cost of ownership (TCO), NPV value tracking, benefit-vs-cost baseline, post-implementation review.",
    order: 3,
  },
];

// ---------------------------------------------------------------------------
// Lesson 1 — Strategic & Organizational Alignment
// (Competency: "Strategic & Organizational Alignment"; slug: be-strategic-alignment)
// ---------------------------------------------------------------------------

const LESSON_BE_STRATEGIC: RefLesson = {
  competencyName: "Strategic & Organizational Alignment",
  slug: "be-strategic-alignment",
  title:
    "Strategic & Organizational Alignment — Project Selection (NPV/IRR/Payback), Portfolio Alignment, OKRs & Balanced Scorecard",
  titleAr:
    "التوافق الاستراتيجي والمؤسسي — اختيار المشاريع (NPV/IRR/فترة الاسترداد)، توافق المحفظة، OKRs وبطاقة الأداء المتوازنة",
  order: 1,
  durationMin: 34,
  references: BE_REFERENCE_TITLES,
  conceptIntroduction: `Strategic and organizational alignment is the engineering of a portfolio-selection model that converts organizational strategy into project investment. The PMI PMP Business Environment domain treats alignment as a quantifiable discipline — every project must trace to a strategic objective, pass a financial hurdle (NPV > 0, IRR > cost-of-capital, payback ≤ threshold), and win a weighted-scoring contest against alternatives. The PMI Standard for Portfolio Management (4th ed.) is the authoritative reference for the portfolio-strategic-plan → portfolio-objectives → component (project) cascade. This lesson equips the candidate to (1) read an organizational strategy (mission/vision/values/strategic objectives), (2) compute NPV, IRR, payback, and profitability index on candidate projects, (3) apply a weighted-factor scoring model with normalization, (4) cascade strategic objectives into OKRs and the balanced scorecard (Kaplan & Norton's four perspectives), and (5) make a defensible portfolio-selection recommendation under a budget cap.`,
  example: `Four candidate Construction projects ($M), i=10%, 5-yr horizon: Alpha I0=$2.0M, CFs($0.5/$0.6/$0.7/$0.8/$0.9M) → NPV=$581,626, payback=3.25y, IRR≈19.7%; Beta I0=$1.0M, CFs($0.2/$0.3/$0.4/$0.5/$0.5M) → NPV=$382,251, payback=3.20y, IRR≈22.0%; Gamma I0=$3.0M, CFs($1.0/$1.0/$1.0/$1.0/$0.5M) → NPV=$480,331, payback=3.00y, IRR≈19.5%; Delta I0=$0.5M, CFs($0.1/$0.15/$0.15/$0.2/$0.2M) → NPV=$88,360, payback=3.50y, IRR≈14.5%. Weighted scoring (Strategic Fit 30%, Financial Return 30%, Risk-Lower-Is-Better 20%, Technical Feasibility 20%) yields Beta=4.20, Alpha=4.10, Gamma=3.90, Delta=3.20. Under a $3.5M budget cap, the recommended portfolio is Alpha+Beta+Delta (combined NPV $1,052,237). (Full computation in worked_example.)`,
  keyFormulas: `NPV = Σ (CF_n / (1+i)^n) − I0   [USD; positive ⇒ accept at hurdle rate i]
IRR: the discount rate r* such that NPV(r*) = 0  [%; accept if IRR ≥ cost-of-capital]
Profitability Index (PI) = (NPV + I0) / I0 = PV(CFs) / I0  [unitless; accept if PI > 1]
Payback (years) = n + (cumulative deficit at end of year n) / (cash flow in year n+1)
Weighted Score = Σ (w_i · s_i)  where Σw_i = 1, s_i ∈ [1..5]
OKR attainment = (actual / target) × 100% per Key Result, averaged across KRs per Objective
Balanced Scorecard cascade: Enterprise Objective → Business-Unit Objective → Individual Objective (with metric + target).`,
  exercise: `You are the PMO portfolio analyst at a Construction firm with a $3.5M annual project budget. Four candidate projects (Alpha/Beta/Gamma/Delta) have cash flows as listed in the worked_example. (a) Compute NPV at i=10%, payback, and approximate IRR for each. (b) Construct a 4-criterion weighted-factor scoring model (Strategic Fit 30%, Financial Return 30%, Risk 20%, Technical Feasibility 20%) and score each project on a 1-5 scale; compute weighted scores and rank. (c) Apply the budget cap and recommend a portfolio (single project or combination). (d) Cascade the highest-NPV project's objective to one Objective + two Key Results, and place it within the Financial perspective of a balanced scorecard. (e) Discuss why Gamma (highest annual cash flow) is NOT the optimal single-project choice under the budget cap.`,
  sections: {
    learning_objectives: `- Define organizational strategy (mission, vision, values, strategic objectives) and the cascade to portfolio → program → project.
- Apply project-selection financial methods: NPV, IRR, profitability index, payback, discounted payback.
- Construct and apply a weighted-factor scoring model with criteria weights, normalized scores, and sensitivity analysis.
- Cascade strategic objectives into Objectives & Key Results (OKRs) and into the four perspectives of the Balanced Scorecard (Financial, Customer, Internal Processes, Learning & Growth).
- Make a portfolio-selection recommendation under a budget cap and justify with both financial (NPV, IRR) and non-financial (weighted score) evidence.
- Identify the conditions under which payback dominates NPV (capital-rationing, liquidity) and the conditions under which NPV dominates payback (long-horizon value creation).`,
    prerequisites: `- Time-value-of-money fundamentals (PV/FV, discount rate, annuity).
- Organizational mission/vision/values statement and current strategic plan.
- Cost-of-capital (WACC) for the organization or program hurdle rate.
- Candidate project list with initial investment (I0) and 5-year cash-flow projections.
- Internal risk register template and the criteria hierarchy from the portfolio steering committee.`,
    introduction: `Strategic and organizational alignment converts the abstract concept of strategy into the concrete decision of which projects to fund. The PMI Standard for Portfolio Management (4th ed.) treats the portfolio as the bridge between strategy and execution: a portfolio strategic plan articulates objectives; portfolio components (programs and projects) deliver the objectives; portfolio performance metrics confirm the linkage. A project that cannot trace its existence to a strategic objective is, by definition, a misallocation of organizational resources. The PMP Business Environment domain tests the candidate's ability to (1) read the organization's strategic plan, (2) score candidate projects on both financial and non-financial criteria, (3) construct and defend a selection recommendation, and (4) cascade selected objectives into operational management instruments — the balanced scorecard and OKRs — that survive the project's closure.`,
    terminology: `- Mission: why the organization exists.
- Vision: what the organization aspires to become.
- Values: the principles that constrain behavior.
- Strategic Objective: a specific, time-bound, measurable goal derived from the strategy.
- Portfolio: the set of programs, projects, and operations that together deliver the strategic objectives.
- Program: a group of related projects managed in a coordinated way to obtain benefits not available from managing them individually.
- Project: a temporary endeavor to create a unique product, service, or result.
- NPV (Net Present Value): the present-value sum of all project cash flows minus the initial investment; positive ⇒ accept.
- IRR (Internal Rate of Return): the discount rate at which NPV = 0; accept if IRR ≥ cost-of-capital.
- PI (Profitability Index): PV(future cash flows) / initial investment; accept if > 1.
- Payback Period: time (in years) to recover the initial investment from cumulative undiscounted cash flows.
- Hurdle Rate: the minimum acceptable IRR set by the organization (often = WACC + risk premium).
- Capital Rationing: a budget cap on total project investment that forces ranking and selection.
- Weighted-Factor Scoring Model: a multi-criteria decision matrix with criteria weights and per-project scores.
- OKR (Objective & Key Result): Objective = qualitative aspiration; Key Results = quantitative outcomes (3-5 per Objective).
- Balanced Scorecard (Kaplan & Norton): a strategic management system with 4 perspectives — Financial, Customer, Internal Business Processes, Learning & Growth — linked through a strategy map.
- Strategy Map: a cause-and-effect diagram linking objectives across the 4 BSC perspectives.
- Stage-Gate: a governance process where each phase ends in a gate (Go / Kill / Hold / Recycle) reviewed by a steering committee.`,
    detailed_explanation: `Strategic alignment begins at the top of the enterprise and cascades through three layers: the strategic plan (enterprise objectives), the portfolio (program and project selection that delivers those objectives), and the individual project (a chartered effort that contributes one or more benefits to the portfolio). The PMI Standard for Portfolio Management formalizes this as the Portfolio Strategic Plan, which sets the strategic alignment criteria (financial hurdle rate, strategic-fit weight, risk tolerance) that drive the portfolio's component-selection decision.

Project-selection methods fall into three families. (1) Financial methods — NPV, IRR, profitability index, payback, discounted payback — convert each candidate's forecast cash flows into a single number comparable across alternatives. NPV is the theoretically correct measure for value creation (it sums discounted future cash flows at the cost of capital); IRR is its percentage-return cousin and is preferred when the organization communicates in returns rather than absolute dollars; payback is a liquidity measure that ignores the time-value of money beyond the payback year and is used as a risk screen (a 5-year payback on a 3-year-horizon plan is fatal regardless of NPV). (2) Multi-criteria scoring — the weighted-factor scoring model — combines financial with strategic, risk, and feasibility criteria into a single weighted score; the model handles the case where NPV is silent (e.g., regulatory-mandate projects have no positive NPV but are mandatory). (3) Governance methods — stage-gate, portfolio steering committee — apply judgment to the financial and scoring outputs and make the funding decision.

The weighted-factor scoring model has six steps: (a) identify 3-7 criteria that reflect organizational strategy (financial return, strategic fit, risk, technical feasibility, market growth, regulatory mandate); (b) assign weights w_i that sum to 1 (typically via pairwise comparison or AHP); (c) score each candidate on each criterion s_i ∈ [1..5]; (d) compute weighted score = Σ(w_i · s_i); (e) conduct sensitivity analysis by perturbing weights ±10% and re-ranking; (f) document the recommendation and the assumptions. The model is not a substitute for judgment — it structures judgment so the trade-offs are explicit.

The balanced scorecard (Kaplan & Norton, 1996) extends strategy from a one-line financial objective to a four-perspective system: Financial (what must we deliver to shareholders?), Customer (what must we deliver to customers to achieve the financial objectives?), Internal Business Processes (what processes must we excel at?), and Learning & Growth (how will we sustain the capability to improve?). The strategy map is the cause-and-effect chain — typically flowing Learning & Growth → Internal Processes → Customer → Financial — that converts a financial target like "+$10M operating income" into a cascade of subordinate objectives ("Reduce order-to-cash from 14 days to 5 days", "Train 200 sales reps on consultative selling").

OKRs (Objectives & Key Results) operationalize the cascade at the team and individual level. An Objective is qualitative and inspirational ("Become the regional leader in sustainable construction"); the 3-5 Key Results per Objective are quantitative and time-bound ("Achieve 30% revenue from LEED-certified projects by Q4"). OKR attainment is computed as the average of (actual / target) across Key Results, capped at 100% to discourage sandbagging. OKRs are reviewed quarterly, with refresh cycles aligned to the portfolio's stage-gates.`,
    core_principles: `- Every project must trace its existence to a strategic objective. A project that cannot is, by definition, misallocated capital.
- NPV is the theoretically correct measure of value creation. Positive NPV at the cost-of-capital rate means the project creates value. IRR is its percentage-return cousin.
- Payback measures liquidity and risk (how long is capital at risk?). It ignores cash flows after the payback year and the time-value of money — it is a screen, not a decision.
- The weighted-factor scoring model handles multi-criteria decisions where NPV is silent (mandatory regulatory projects, strategic-fit projects with intangible benefits).
- Capital rationing forces ranking. When the budget cap binds, the selection is the portfolio that maximizes combined NPV (or weighted score) subject to the budget constraint — not the single project with the highest NPV.
- The Balanced Scorecard converts strategy into a 4-perspective management system; the strategy map links the perspectives through cause-and-effect.
- OKRs cascade objectives to individuals and teams; Key Results are quantitative, time-bound, and capped at 100% attainment to prevent sandbagging.
- Stage-gate governance ensures each phase ends in a defensible funding decision (Go / Kill / Hold / Recycle). Killing a project at Gate 2 is a successful decision, not a failure.`,
    components: `- Strategic plan (mission, vision, values, 3-5 strategic objectives, time horizon).
- Portfolio strategic plan (component-selection criteria, financial hurdle rate, risk tolerance).
- Candidate project list (initial investment, 5-year cash-flow forecast, risk profile, strategic-fit statement).
- Financial model (NPV, IRR, PI, payback per project at the hurdle rate).
- Weighted-factor scoring model (criteria, weights, scores, weighted total, sensitivity).
- Stage-gate governance (gate criteria, decision authority, kill criteria, hold-and-recycle criteria).
- Balanced Scorecard (4 perspectives with objectives, metrics, targets, initiatives).
- Strategy Map (cause-and-effect arrows across the 4 BSC perspectives).
- OKR tree (Objective → 3-5 Key Results per Objective; quarterly refresh).`,
    process: `1. Read the organizational strategy: extract mission, vision, values, strategic objectives, time horizon.
2. Articulate the portfolio strategic plan: confirm the financial hurdle rate (cost-of-capital + risk premium), the criteria weights, and the budget cap.
3. Gather candidate projects: initial investment (I0), 5-year cash-flow forecast, risk profile, strategic-fit statement from the sponsor.
4. Compute financial methods per candidate: NPV (at the hurdle rate), IRR, profitability index, payback.
5. Construct the weighted-factor scoring model: criteria (3-7), weights (Σw_i = 1), scores (1-5), weighted score, sensitivity.
6. Apply the budget cap: select the portfolio that maximizes combined NPV subject to the cap; verify against the weighted-score ranking.
7. Cascade selected projects to the Balanced Scorecard (assign objective → metric → target per perspective) and to OKRs (Objective + 3-5 Key Results).
8. Review at each stage gate: Go / Kill / Hold / Recycle per the gate criteria.`,
    formula_calculation: `NPV (Net Present Value):
  NPV = −I0 + Σ_{n=1}^{N} CF_n / (1+i)^n        [USD; i = discount rate = cost-of-capital hurdle rate]
  Accept rule: NPV > 0 ⇒ accept (the project creates value at the hurdle rate).

IRR (Internal Rate of Return):
  Solve NPV(r*) = 0  for r*.  [%, found by interpolation or Newton-Raphson iteration]
  Accept rule: IRR ≥ hurdle rate ⇒ accept.
  Interpolation: r* ≈ r_low + (NPV_low / (NPV_low − NPV_high)) × (r_high − r_low).

Profitability Index (PI):
  PI = (NPV + I0) / I0 = PV(future cash flows) / I0     [unitless]
  Accept rule: PI > 1 ⇒ accept; under capital rationing, rank by descending PI.

Payback (years):
  Payback = n + (cumulative deficit at end of year n) / (cash flow in year n+1)
  where n = last year with negative cumulative cash flow.
  Discounted payback: replace CF_n with CF_n / (1+i)^n in the cumulative sum.

Weighted-Factor Scoring Model:
  Score_j = Σ_i (w_i · s_{j,i})      where Σ_i w_i = 1, s_{j,i} ∈ [1..5]
  Sensitivity: perturb each w_i by ±10% and re-rank; flag any project whose rank changes.

OKR Attainment:
  Attainment_Objective = (1/m) Σ_{k=1}^{m} min(1, actual_k / target_k) × 100%    [m = # of Key Results]
  Cap at 100% per Key Result to prevent sandbagging (over-delivery on one KR does not offset under-delivery on another).

Balanced Scorecard cascade:
  Financial: Objective → Metric → Target (e.g., Operating income +$10M)
  Customer: Objective → Metric → Target (e.g., NPS ≥ 60; On-time delivery ≥ 95%)
  Internal Processes: Objective → Metric → Target (e.g., Order-to-cash cycle ≤ 5 days)
  Learning & Growth: Objective → Metric → Target (e.g., 200 reps trained on consultative selling by Q3)
  Strategy Map: arrows Learning&Growth → Internal → Customer → Financial (cause-and-effect chain).

Variables & Units:
  i = hurdle rate = WACC + project risk premium [% per year]
  N = analysis horizon (typically 5 years; match strategic-plan horizon)
  CF_n = net cash flow in year n [USD; inflow positive, outflow negative]
  I0 = initial investment [USD]
  w_i = weight of criterion i, Σw_i = 1
  s_{j,i} = score of project j on criterion i, ∈ [1..5] (5 = best)

Assumptions:
  - Cash flows are end-of-year (NPV convention).
  - Discount rate i reflects the project's risk (higher-risk project ⇒ higher i).
  - Inflation is either excluded (real cash flows / real discount rate) or included consistently (nominal cash flows / nominal discount rate) — not mixed.
  - Capital-rationing budget cap is for the current planning period only; future-period caps are unknown.

Interpretation:
  - NPV is the absolute dollar value created; IRR is the percentage return; payback is the time-at-risk.
  - A project can be NPV-positive AND payback-unacceptable (e.g., 5-year payback in a 3-year-horizon plan ⇒ reject on liquidity grounds despite positive NPV).
  - Under capital rationing, the optimal portfolio maximizes combined NPV subject to the budget cap — a 0/1 knapsack problem; ranking by NPV alone is incorrect because the cap is on investment, not on NPV.`,
    worked_example: `CASE_TYPE = SYNTHETIC. Setting: A Construction firm with a $3.5M annual project budget. Hurdle rate i = 10% (WACC 7% + construction-sector risk premium 3%). Four candidate projects, all 5-year horizons, end-of-year cash flows ($M):

  Alpha (new bridge) — I0=$2.0M; CFs $0.5/$0.6/$0.7/$0.8/$0.9M.
  Beta  (facility expansion) — I0=$1.0M; CFs $0.2/$0.3/$0.4/$0.5/$0.5M.
  Gamma (smart-city sensor network) — I0=$3.0M; CFs $1.0/$1.0/$1.0/$1.0/$0.5M.
  Delta (small refurbishment) — I0=$0.5M; CFs $0.1/$0.15/$0.15/$0.2/$0.2M.

Step 1 — NPV at i=10%:
  Alpha: NPV = −2.0 + 0.5/1.1 + 0.6/1.21 + 0.7/1.331 + 0.8/1.4641 + 0.9/1.61051
        = −2.0 + 0.454545 + 0.495868 + 0.525920 + 0.546411 + 0.558882
        = −2.0 + 2.581626 = +$581,626.
  Beta: NPV = −1.0 + 0.2/1.1 + 0.3/1.21 + 0.4/1.331 + 0.5/1.4641 + 0.5/1.61051
        = −1.0 + 0.181818 + 0.247934 + 0.300526 + 0.341507 + 0.310466
        = −1.0 + 1.382251 = +$382,251.
  Gamma: NPV = −3.0 + 1.0/1.1 + 1.0/1.21 + 1.0/1.331 + 1.0/1.4641 + 0.5/1.61051
         = −3.0 + 0.909091 + 0.826446 + 0.751315 + 0.683013 + 0.310466
         = −3.0 + 3.480331 = +$480,331.
  Delta: NPV = −0.5 + 0.1/1.1 + 0.15/1.21 + 0.15/1.331 + 0.2/1.4641 + 0.2/1.61051
         = −0.5 + 0.090909 + 0.123967 + 0.112697 + 0.136603 + 0.124184
         = −0.5 + 0.588360 = +$88,360.

Step 2 — Payback (years):
  Alpha: cumulative Y1=−1.5M, Y2=−0.9M, Y3=−0.2M, Y4=+0.6M → payback = 3 + 0.2/0.8 = 3.25 yrs.
  Beta:  cumulative Y1=−0.8M, Y2=−0.5M, Y3=−0.1M, Y4=+0.4M → payback = 3 + 0.1/0.5 = 3.20 yrs.
  Gamma: cumulative Y1=−2.0M, Y2=−1.0M, Y3=0.0 → payback = 3.00 yrs (exact).
  Delta: cumulative Y1=−0.4M, Y2=−0.25M, Y3=−0.10M, Y4=+0.10M → payback = 3 + 0.10/0.20 = 3.50 yrs.

Step 3 — IRR (interpolation between r_low=19% and r_high=20% for Alpha; r_low=20%, r_high=25% for Beta):
  Alpha NPV(19%) = +$35,365 (PV factors 1.19, 1.4161, 1.685159, 2.005339, 2.386354).
  Alpha NPV(20%) = −$14,121 (PV factors 1.2, 1.44, 1.728, 2.0736, 2.48832).
  IRR_Alpha ≈ 19 + (35,365 / (35,365 + 14,121)) × 1 ≈ 19.71%.
  Beta NPV(20%) = +$48,545K (calc above); Beta NPV(25%) = −$74,560K.
  IRR_Beta ≈ 20 + (48,545 / (48,545 + 74,560)) × 5 ≈ 21.96% ≈ 22.0%.
  Gamma IRR ≈ 19.5% (interpolated); Delta IRR ≈ 14.5% (interpolated).

Step 4 — Weighted-Factor Scoring Model:
  Criteria: Strategic Fit (w=0.30), Financial Return (w=0.30), Risk-lower-is-better (w=0.20), Technical Feasibility (w=0.20).
  Scores:
    Alpha: SF=5, FR=4, R=3, TF=4 → 0.30·5 + 0.30·4 + 0.20·3 + 0.20·4 = 1.5 + 1.2 + 0.6 + 0.8 = 4.10.
    Beta:  SF=3, FR=5, R=4, TF=5 → 0.30·3 + 0.30·5 + 0.20·4 + 0.20·5 = 0.9 + 1.5 + 0.8 + 1.0 = 4.20.
    Gamma: SF=5, FR=4, R=3, TF=3 → 1.5 + 1.2 + 0.6 + 0.6 = 3.90.
    Delta: SF=2, FR=2, R=5, TF=5 → 0.6 + 0.6 + 1.0 + 1.0 = 3.20.
  Ranking by weighted score: Beta (4.20) > Alpha (4.10) > Gamma (3.90) > Delta (3.20).

Step 5 — Portfolio selection under $3.5M budget cap:
  Possible combinations under cap: {Alpha+Beta+Delta}=$3.5M (NPV=$1,052,237); {Gamma+Beta}=$4.0M (exceeds cap); {Gamma+Alpha}=$5.0M (exceeds cap); {Gamma+Delta}=$3.5M (NPV=$568,691); {Alpha+Beta}=$3.0M (NPV=$963,877, $0.5M cap slack); {Beta+Delta}=$1.5M (NPV=$470,611).
  Best portfolio: {Alpha+Beta+Delta} = combined NPV $1,052,237.
  Why not Gamma? Gamma alone ($3.0M) leaves $0.5M unused; combined NPV would be $480,331 (Gamma) + best $0.5M use (Delta NPV $88,360) = $568,691 — well below the Alpha+Beta+Delta portfolio. NPV per dollar invested: Alpha=0.291, Beta=0.382, Gamma=0.160, Delta=0.177 — Gamma's NPV/invested-$ is lowest, even though its annual cash flow is highest.

Step 6 — Cascade to OKRs and Balanced Scorecard (recommended project = Alpha, highest NPV):
  BSC Financial perspective: Objective="Increase net operating cash from infrastructure services"; Metric=NPV at hurdle; Target=$581,626 over 5 yrs.
  BSC Customer perspective: Objective="Achieve highest regional bridge-reliability rating"; Metric=Annual bridge condition index (BCI); Target=BCI ≥ 85 (good) within 18 months of commissioning.
  BSC Internal Processes: Objective="Compress design-to-commissioning cycle for mid-span bridges"; Metric=Design-to-commissioning lead time; Target=22 months (industry avg 28).
  BSC Learning & Growth: Objective="Build specialty-capacity in cable-stayed design"; Metric=# of PEs trained; Target=8 PEs certified by Q4.
  OKR (Financial-anchored): Objective="Deliver the Alpha bridge project on-strategy and on-budget"; Key Results: (1) achieve Stage-Gate-4 approval with NPV ≥ $581,626 by Q2-Y0; (2) keep cumulative schedule variance SV ≤ 0 days at month-6 (SPI ≥ 1.00); (3) certify 8 PEs in cable-stayed design by Q4-Y0; (4) BCI ≥ 85 at month-18 post-commissioning.`,
    industrial_example: `Construction — Regional civil-infrastructure contractor with $3.5M annual project budget. The PMO applies the PMI Standard for Portfolio Management cascade (strategic plan → portfolio components → project charters). All four candidate projects (bridge / facility expansion / smart-city sensors / refurbishment) compete for the same $3.5M cap. The steering committee applies a 4-criterion weighted scoring model (Strategic Fit 30% / Financial Return 30% / Risk 20% / Technical Feasibility 20%) alongside the NPV/IRR/payback screen at i=10%. The recommended portfolio {Alpha+Beta+Delta} captures $1.05M in NPV against $3.5M invested (29.9% NPV-on-investment) and aligns to the enterprise strategy of "regional infrastructure leadership with diversified small-project risk hedging." The portfolio is reviewed at each stage gate; Beta (highest IRR) is fast-tracked to Gate 3 within 60 days of the funding decision.`,
    case_study: `CASE_TYPE = SYNTHETIC — "MetroBridge Construction": a mid-sized regional construction firm ($120M annual revenue, $3.5M annual project-investment budget) applying PMI Standard for Portfolio Management (4th ed.) cascade and Kaplan & Norton's balanced scorecard (1996). The firm's strategic plan sets three 5-year objectives: (1) lead the regional mid-span bridge market with 25% market share; (2) reduce design-to-commissioning cycle from 28 to 22 months; (3) build cable-stayed specialty capability. The PMO's 4-criterion weighted-factor scoring model (Strategic Fit 30% / Financial Return 30% / Risk 20% / Technical Feasibility 20%) is run quarterly on candidate projects. The four candidate projects compete under the $3.5M cap; the recommended portfolio {Alpha+Beta+Delta} captures $1.05M NPV (29.9% NPV-on-investment) and aligns to two of the three strategic objectives (market leadership via Alpha, cycle-time reduction via Beta). Delta is included for risk-hedging (small, fast-payback project) and to use the $0.5M budget remainder productively. Quarterly portfolio steering committee reviews; stage-gate governance with Go/Kill/Hold/Recycle; OKR cascade to project teams (one Objective + 3-5 Key Results per project); balanced scorecard reviewed monthly by executive committee.`,
    visual_explanation: `Cascade diagram (3-layer): Enterprise Strategy → Portfolio Strategic Plan → Project Charters. At the portfolio layer, a 2-axis scatter plot (NPV on x-axis, weighted score on y-axis; bubble size = investment $) places Alpha/Beta/Gamma/Delta in the upper-right quadrant (positive NPV, score ≥ 4.0) — the funding zone. The Balanced Scorecard is drawn as a 4-quadrant card (Financial top-left, Customer top-right, Internal Processes bottom-left, Learning & Growth bottom-right) with cause-and-effect arrows from Learning&Growth → Internal → Customer → Financial; each quadrant shows Objective / Metric / Target / Initiative. The OKR tree is rendered as a 1-many tree: Objective (root) → Key Results (children), with each Key Result labeled "actual / target" and color-coded by attainment (green ≥ 70%, amber 40-70%, red < 40%).`,
    simulation_opportunity: `Build an interactive portfolio-selection simulator: user enters 4 candidate projects (I0, 5-year CFs, criteria scores); system computes NPV at user-set hurdle rate, IRR (by interpolation between two bracketing rates), payback, weighted score (with user-set weights), and recommends the optimal portfolio under a user-set budget cap. Sensitivity slider: perturb each criterion weight by ±10% and show rank-stability. The simulator visualizes the 2-axis bubble chart (NPV vs weighted score, bubble size = investment) and updates live.`,
    common_mistakes: `- Ranking by NPV alone under capital rationing. NPV is an absolute measure ($); under a budget cap on investment ($), ranking by NPV alone is incorrect — you may pick a single high-NPV high-investment project that exhausts the budget and leaves a smaller project with better NPV-per-$ unfunded. Rank by NPV/investment (≈ PI) under rationing.
- Using IRR for mutually-exclusive projects of different scale. IRR is a percentage; a 50% IRR on a $1 investment is worth less than a 20% IRR on a $1M investment. Use NPV for mutually-exclusive selections.
- Confusing payback with NPV. A 2-year payback means capital is recovered in 2 years; it says nothing about value created. A project with 2-year payback and zero cash flows after year 2 has NPV = $0 — it created no value, only returned the principal.
- Omitting the cost-of-capital risk premium. Using the WACC for all projects under-discounts high-risk projects and over-discounts low-risk ones. Adjust the hurdle rate by project risk class.
- Scoring-model criteria that overlap (e.g., "Financial Return" and "Profitability"). Overlapping criteria double-count the same underlying dimension; merge them or split them cleanly.
- Setting OKR Key Results without targets (e.g., "Improve customer satisfaction"). A Key Result without a number is an Objective, not a Key Result. KR = quantitative, time-bound.
- Setting OKR targets that are too easy (sandbagging) or impossible (demotivating). The OKR convention targets 60-70% attainment — ambitious-but-achievable; cap attainment at 100% to prevent a single KR from offsetting others.
- Forgetting the strategy map's cause-and-effect. A Balanced Scorecard with 4 isolated perspectives (no arrows) is just a KPI dashboard; the value of the BSC is the cause-and-effect chain from Learning&Growth to Financial.`,
    limitations: `- NPV assumes the hurdle rate i correctly reflects project risk. Mis-specified risk premium → wrong accept/reject decision.
- IRR is unreliable for non-conventional cash flows (sign changes during the project life can produce multiple IRRs or no IRR). Use NPV or modified IRR (MIRR) in those cases.
- Payback ignores cash flows after the payback year and the time-value of money; useful only as a risk screen.
- Weighted-factor scoring model weights are subjective; AHP (analytic hierarchy process) is the canonical defense, but the weights still encode judgment.
- OKR cycle (typically quarterly) is shorter than project life cycles (often 12-24 months). Cascading OKRs across project phases requires deliberate phase-aware KR refresh.
- Balanced Scorecard requires sustained executive sponsorship; without it, the BSC degenerates into a periodic KPI report.`,
    comparison: `Comparison of project-selection methods:
  - NPV: dollar value created; the theoretically correct measure; best for ranking mutually-exclusive projects of any scale.
  - IRR: percentage return; intuitive; unreliable for non-conventional cash flows or mutually-exclusive projects of different scale.
  - Profitability Index (PI): NPV per dollar invested; the correct ranking metric under capital rationing.
  - Payback: time to recover investment; ignores time value and post-payback cash flows; used as a risk/liquidity screen.
  - Discounted Payback: payback using discounted cash flows; fixes the time-value flaw but still ignores post-payback cash flows.
  - Weighted-Factor Scoring Model: multi-criteria; handles intangible/strategic factors; subjective weights; combines with financial methods for the final decision.
OKR vs Balanced Scorecard:
  - OKR: tactical, quarterly, team/individual-level, 1 Objective + 3-5 quantitative KRs, 60-70% attainment target.
  - Balanced Scorecard: strategic, annual, enterprise/Business-Unit-level, 4 perspectives with cause-and-effect chain (strategy map).
  - Both instruments can coexist: BSC for enterprise strategy; OKR for execution-level cascade to project teams.`,
    practical_application: `In practice, the Construction PMO runs a quarterly portfolio review: (1) refresh the candidate list (new project charters submitted since last quarter); (2) recompute NPV/IRR/payback at the current hurdle rate (the rate moves with macroeconomic conditions); (3) re-score on the weighted-factor model (criteria weights can be re-set annually by the steering committee); (4) apply the budget cap and select the optimal portfolio; (5) document the decision in the portfolio register with a one-page decision rationale per selected project; (6) cascade selected objectives to OKRs (project-level) and to the BSC (enterprise-level); (7) review the previous quarter's portfolio performance (NPV actual vs forecast, attainment vs OKRs) and feed back into next-quarter scoring. The stage-gate governance ensures the firm can kill underperforming projects at any gate — a Kill decision is a successful governance outcome, not a failure.`,
    decision_scenario: `You are the PMO director. The CEO asks: "We have $3.5M to invest this year. Which projects do we fund?" Your response: (a) compute NPV/IRR/payback for each candidate at i=10%; (b) run the weighted-scoring model with the standard 4 criteria (Strategic Fit 30% / Financial Return 30% / Risk 20% / Technical Feasibility 20%); (c) recommend the portfolio {Alpha+Beta+Delta} = combined NPV $1.05M (29.9% NPV-on-investment), beating the Gamma+Delta portfolio ($568,691 NPV) by 85%; (d) defend against the CEO's challenge "Why not Gamma? It has the highest annual cash flow." Response: "Gamma's NPV-per-$-invested is 0.160, less than half of Beta's 0.382 or Alpha's 0.291. Selecting Gamma alone exhausts $3.0M of the $3.5M cap to deliver $480,331 NPV; the Alpha+Beta+Delta portfolio delivers $1.05M NPV on the same $3.5M cap — Gamma is not the optimal single-project choice under the budget cap." (e) Cascade Alpha to OKRs and BSC as in the worked_example.`,
    practice_questions: `1. A candidate project has I0=$1M, 5-year CFs $0.3M each, hurdle rate i=10%. Compute NPV (PV annuity factor at 10% for 5 years = 3.7908). Answer: NPV = −1 + 0.3 × 3.7908 = −1 + 1.137 = +$137K. Accept.
2. Two mutually-exclusive projects: P1 IRR=40%, NPV=$10K; P2 IRR=15%, NPV=$100K. Which to accept? Answer: P2 (NPV is the correct ranking metric for mutually-exclusive projects).
3. Under a $5M budget cap, projects ranked by PI: A (PI=2.5, I0=$2M); B (PI=2.0, I0=$2M); C (PI=1.5, I0=$3M). What is the optimal portfolio? Answer: A+B (combined I0=$4M ≤ $5M; combined NPV-on-investment = (2.5-1)·2 + (2.0-1)·2 = 3+2 = $5M of NPV) > A+C alone (exceeds cap).
4. An OKR has KRs: 80/100, 50/100, 100/100, 30/100. Compute OKR attainment. Answer: (min(1,0.8)+min(1,0.5)+min(1,1.0)+min(1,0.3))/4 = (0.8+0.5+1.0+0.3)/4 = 0.65 = 65%.
5. (PMP-style) Which Balanced Scorecard perspective is the "leading" indicator that all others ultimately drive? Answer: Financial (Kaplan & Norton cause-and-effect chain: Learning&Growth → Internal Processes → Customer → Financial).`,
    certification_questions: `1. (PMP-style) A project has positive NPV at the hurdle rate but a payback period longer than the strategic-plan horizon. The correct decision is:
   (a) Accept — NPV positive ⇒ value created.
   (b) Reject — payback beyond the planning horizon violates the capital-at-risk screen.
   (c) Accept with a contingency reserve equal to the payback horizon extension.
   (d) Defer to the next planning cycle.
   Answer: b. Payback is the risk/liquidity screen; NPV positive is necessary but not sufficient when capital-at-risk exceeds the planning horizon.
2. (PMP-style) A steering committee has set criteria weights (Strategic Fit 30% / Financial Return 30% / Risk 20% / Technical Feasibility 20%). Project A scores (5,4,3,4) and Project B scores (3,5,4,5). Compute weighted scores and select.
   Answer: A=4.10, B=4.20. Select B (higher weighted score) unless the budget cap forces a combination including A.
3. (PMP-style) Which of the following is NOT a Balanced Scorecard perspective?
   (a) Financial; (b) Customer; (c) Stakeholder Engagement; (d) Learning & Growth.
   Answer: c. The four BSC perspectives are Financial, Customer, Internal Business Processes, Learning & Growth. Stakeholder engagement is a project-management activity, not a BSC perspective.`,
    summary: `Strategic and organizational alignment is the engineering of a portfolio-selection model that converts organizational strategy into project investment. The candidate must: (1) read the organization's strategic plan (mission/vision/values/strategic objectives); (2) compute NPV/IRR/PI/payback on candidate projects at the hurdle rate; (3) construct a weighted-factor scoring model (criteria, weights, scores, weighted score, sensitivity); (4) apply the budget cap to select the optimal portfolio (combined NPV maxed under the constraint); (5) cascade selected projects to OKRs (Objective + 3-5 quantitative Key Results, attainment capped at 100%) and to the Balanced Scorecard (4 perspectives with cause-and-effect strategy map). NPV is the theoretically correct value measure; PI ranks under rationing; IRR is a percentage cousin (unreliable for mutually-exclusive or non-conventional cash flows); payback is a risk/liquidity screen, not a value measure. The Balanced Scorecard converts strategy to a 4-perspective management system; OKRs cascade strategy to teams; stage-gate governance ensures Go/Kill/Hold/Recycle decisions at each phase.`,
    key_takeaways: `- Every project must trace to a strategic objective — a project that cannot is misallocated capital.
- NPV (at the hurdle rate) is the theoretically correct value measure; PI ranks under capital rationing; IRR is a percentage cousin; payback is a risk/liquidity screen.
- The weighted-factor scoring model handles intangible/strategic factors that NPV cannot capture (regulatory mandates, strategic positioning).
- Under a budget cap, the optimal portfolio maximizes combined NPV subject to the cap — a 0/1 knapsack; ranking by NPV alone is incorrect.
- The Balanced Scorecard converts strategy to a 4-perspective management system (Financial, Customer, Internal Processes, Learning & Growth) with cause-and-effect strategy map.
- OKRs cascade strategy to teams: 1 Objective + 3-5 quantitative Key Results, capped at 100% attainment, refreshed quarterly.
- Stage-gate governance (Go/Kill/Hold/Recycle) is the discipline that ensures the portfolio adapts to new information; a Kill decision is a successful outcome.`,
    references: `- PMI. (2021). A Guide to the Project Management Body of Knowledge (PMBOK® Guide) — 7th Edition. Newtown Square, PA: PMI. (Focus on Value, Navigate Complexity, Tailor to Context principles; Delivery and Measurement performance domains.)
- PMI. (2018). The Standard for Portfolio Management — 4th Edition. Newtown Square, PA: PMI. (Portfolio strategic plan, component selection, scoring models, financial methods, stage-gate.)
- PMI. (2015). Business Analysis for Practitioners: A Practice Guide. Newtown Square, PA: PMI. (Business case, benefits identification, solution evaluation.)
- Kerzner, H. (2022). Project Management: A Systems Approach to Planning, Scheduling, and Controlling (13th ed.). Hoboken, NJ: Wiley. (NPV/IRR/payback/PI; weighted-factor scoring model; project-selection.)
- ISO 21500:2021. Project, programme and portfolio management — Guidance on project management. Geneva: ISO. (High-level guidance on portfolio-component cascade.)
- Kaplan, R. S., & Norton, D. P. (1996). The Balanced Scorecard: Translating Strategy into Action. Boston: HBR Press. (4 perspectives; strategy map; cascade.)`,
  },
  knowledgeObject: {
    title: "Strategic & Organizational Alignment — Knowledge Object",
    domain: "Business Environment",
    competency: "Strategic & Organizational Alignment",
    topic: "Project Selection, Portfolio Alignment, Balanced Scorecard, OKRs",
    concept: "Cascade from organizational strategy to project investment via financial and multi-criteria selection methods.",
    body: {
      definitions: [
        "Mission: why the organization exists.",
        "Vision: what the organization aspires to become.",
        "Strategic Objective: a specific, time-bound, measurable goal derived from the strategy.",
        "Portfolio: the set of programs, projects, and operations that together deliver the strategic objectives (PMI Standard for Portfolio Management, 4th ed.).",
        "Program: a group of related projects managed in a coordinated way to obtain benefits not available from managing them individually.",
        "NPV: Net Present Value = −I0 + Σ CF_n/(1+i)^n; positive ⇒ value created at the hurdle rate.",
        "IRR: Internal Rate of Return = the discount rate r* such that NPV(r*)=0; accept if IRR ≥ hurdle.",
        "PI (Profitability Index): PI = (NPV+I0)/I0 = PV(CFs)/I0; rank by descending PI under capital rationing.",
        "Payback: time to recover the initial investment from cumulative undiscounted cash flows.",
        "Hurdle Rate: the minimum acceptable IRR set by the organization (often = WACC + project risk premium).",
        "Capital Rationing: a budget cap on total project investment that forces ranking and selection.",
        "Weighted-Factor Scoring Model: Score_j = Σ w_i · s_{j,i}, Σ w_i = 1, s ∈ [1..5].",
        "OKR: Objective (qualitative, inspirational) + 3-5 Key Results (quantitative, time-bound); attainment capped at 100%.",
        "Balanced Scorecard: 4 perspectives — Financial, Customer, Internal Business Processes, Learning & Growth (Kaplan & Norton, 1996).",
        "Strategy Map: cause-and-effect diagram linking BSC objectives across the 4 perspectives.",
        "Stage-Gate: governance process; each phase ends in a gate (Go / Kill / Hold / Recycle).",
      ],
      principles: [
        "Every project must trace its existence to a strategic objective — a project that cannot is misallocated capital.",
        "NPV is the theoretically correct measure of value creation. IRR is its percentage-return cousin; payback is a risk/liquidity screen.",
        "Under capital rationing, the optimal portfolio maximizes combined NPV subject to the budget cap (0/1 knapsack) — rank by PI, not NPV.",
        "The weighted-factor scoring model handles intangible/strategic factors (regulatory mandates, market positioning) that NPV cannot capture.",
        "The Balanced Scorecard converts strategy into a 4-perspective management system; the strategy map links them by cause-and-effect.",
        "OKRs cascade strategy to teams; Key Results are quantitative and capped at 100% attainment to prevent sandbagging.",
        "Stage-gate governance is the discipline that ensures the portfolio adapts to new information; a Kill decision is a successful outcome.",
      ],
      components: [
        "Strategic plan (mission, vision, values, 3-5 strategic objectives, time horizon).",
        "Portfolio strategic plan (component-selection criteria, financial hurdle rate, risk tolerance).",
        "Candidate project list (I0, 5-year cash-flow forecast, risk profile, strategic-fit statement).",
        "Financial model (NPV, IRR, PI, payback per project at the hurdle rate).",
        "Weighted-factor scoring model (criteria, weights, scores, weighted total, sensitivity).",
        "Stage-gate governance (gate criteria, decision authority, kill/hold/recycle).",
        "Balanced Scorecard (4 perspectives with objectives, metrics, targets, initiatives).",
        "Strategy Map (cause-and-effect arrows across the 4 BSC perspectives).",
        "OKR tree (Objective → 3-5 Key Results per Objective; quarterly refresh).",
      ],
      mechanism: [
        "Strategy (mission/vision/values/strategic objectives) → portfolio strategic plan → portfolio components (programs/projects) → individual project charters → project execution → benefits delivery → strategic-objective attainment.",
        "Each cascade layer has a translation: strategy → portfolio objectives (strategic-alignment criteria); portfolio → project (financial hurdle + scoring + budget cap); project → execution (charter + baselines + OKRs).",
        "Feedback loop: actual benefits delivered → portfolio performance metrics → refresh of next cycle's strategic-alignment criteria and hurdle rate.",
      ],
      process: [
        "1. Read the organizational strategy: mission, vision, values, strategic objectives, time horizon.",
        "2. Articulate the portfolio strategic plan: hurdle rate, criteria weights, budget cap.",
        "3. Gather candidate projects: I0, 5-year cash-flow forecast, risk profile, strategic-fit statement.",
        "4. Compute financial methods per candidate: NPV, IRR, PI, payback.",
        "5. Construct weighted-factor scoring model: criteria, weights, scores, weighted total, sensitivity.",
        "6. Apply budget cap: select portfolio that maximizes combined NPV; verify against weighted-score ranking.",
        "7. Cascade to Balanced Scorecard (assign objective → metric → target per perspective) and OKRs (Objective + 3-5 KRs).",
        "8. Review at each stage gate: Go / Kill / Hold / Recycle per gate criteria.",
      ],
      formulas: [
        "NPV = −I0 + Σ_{n=1}^{N} CF_n / (1+i)^n  [USD; i = hurdle rate].",
        "IRR: solve NPV(r*) = 0; interpolate r* ≈ r_low + (NPV_low/(NPV_low−NPV_high)) × (r_high−r_low).",
        "PI = (NPV + I0)/I0 = PV(CFs)/I0. Rank by descending PI under capital rationing.",
        "Payback = n + (cumulative deficit at end of year n) / (cash flow in year n+1).",
        "Weighted Score_j = Σ_i w_i · s_{j,i}, Σ w_i = 1, s ∈ [1..5].",
        "OKR Attainment = (1/m) Σ_{k=1}^{m} min(1, actual_k/target_k) × 100%.",
      ],
      metrics: [
        "NPV ($), IRR (%), PI (unitless), payback (years) per project.",
        "Weighted score per project (1-5 scale).",
        "Portfolio combined NPV ($).",
        "NPV-on-investment ratio = combined NPV / combined I0.",
        "OKR attainment per Objective (capped at 100%).",
        "BSC target attainment per metric (actual / target × 100%).",
        "Stage-gate Go/Kill/Hold/Recycle decision count per quarter.",
      ],
      examples: [
        "Alpha NPV=$581,626, payback=3.25y, IRR≈19.7% (i=10%, 5-yr).",
        "Beta NPV=$382,251, payback=3.20y, IRR≈22.0% — highest IRR.",
        "Gamma NPV=$480,331, payback=3.00y, IRR≈19.5% — highest annual CF but lowest NPV/$ invested (0.160).",
        "Delta NPV=$88,360, payback=3.50y, IRR≈14.5% — risk-hedging + cap-remainder.",
        "Weighted scores: Beta=4.20, Alpha=4.10, Gamma=3.90, Delta=3.20.",
        "Recommended portfolio under $3.5M cap: {Alpha+Beta+Delta} = combined NPV $1,052,237 (29.9% NPV-on-investment).",
      ],
      industrial_examples: [
        "Construction: $3.5M annual budget; 4 candidate projects; weighted-factor scoring (SF 30% / FR 30% / R 20% / TF 20%); portfolio recommendation {Alpha+Beta+Delta} delivers 29.9% NPV-on-investment.",
        "IT: enterprise architecture roadmap; portfolio of 12 candidate projects ranked by PI under $20M annual cap; stage-gate at quarterly steering committee.",
        "Healthcare: hospital capital plan; OKR cascade from enterprise strategy ('patient-experience leader') to project teams (Objective + 3-5 KRs per project).",
      ],
      case_studies: [
        "SYNTHETIC — MetroBridge Construction: regional construction firm ($120M revenue, $3.5M project budget); PMI Standard for Portfolio Management cascade + Kaplan & Norton BSC. Three strategic objectives → 4 candidate projects → weighted-factor scoring → portfolio recommendation {Alpha+Beta+Delta} = $1.05M NPV. Quarterly portfolio steering committee; stage-gate governance; OKR cascade; BSC reviewed monthly.",
      ],
      common_errors: [
        "Ranking by NPV alone under capital rationing (should rank by PI).",
        "Using IRR for mutually-exclusive projects of different scale (use NPV).",
        "Confusing payback with NPV (payback ignores value creation beyond recovery).",
        "Omitting the project-risk premium in the hurdle rate.",
        "Scoring-model criteria that overlap (Financial Return + Profitability double-counts).",
        "OKR Key Results without quantitative targets (KR without a number is an Objective).",
        "OKR targets set too easy (sandbagging) or impossible (demotivating); aim for 60-70% attainment, cap at 100%.",
        "Balanced Scorecard without a strategy map (just a KPI dashboard, no cause-and-effect chain).",
      ],
      limitations: [
        "NPV depends on correctly-specified hurdle rate; mis-specified risk premium → wrong decision.",
        "IRR unreliable for non-conventional cash flows (multiple IRRs or none).",
        "Payback ignores time-value and post-payback cash flows.",
        "Weighted-factor scoring weights are subjective; AHP defends but encodes judgment.",
        "OKR quarterly cycle shorter than project life cycle (12-24 months); requires phase-aware KR refresh.",
        "Balanced Scorecard requires sustained executive sponsorship to remain a strategic management system, not a periodic KPI report.",
      ],
      best_practices: [
        "Apply NPV (theoretically correct) + PI (rationing) + weighted-factor scoring (intangibles) as complementary methods.",
        "Conduct sensitivity analysis on the weighted-factor scoring weights (±10% perturbation, re-rank).",
        "Set the hurdle rate = WACC + project-risk-class premium (capital-asset pricing model logic).",
        "Use 60-70% OKR attainment targets, cap at 100% per Key Result to prevent sandbagging.",
        "Cascade BSC objectives through the strategy map (Learning&Growth → Internal Processes → Customer → Financial).",
        "Apply stage-gate governance at every phase; train steering committee to value Kill as a successful decision.",
        "Refresh the portfolio quarterly; refresh the strategic plan annually; refresh OKRs quarterly.",
      ],
      related_concepts: [
        "Portfolio Management (PMI Standard for Portfolio Management, 4th ed.).",
        "Program Management (PMI Standard for Program Management, 4th ed.).",
        "Benefits Realization (BE Lesson 3).",
        "Compliance & Standards (BE Lesson 2).",
        "Project charter & business case (PRC domain).",
        "Risk management & risk-adjusted hurdle rate (PRC domain).",
        "PMI Talent Triangle® Business Acumen leg.",
      ],
      prerequisites: [
        "Time-value-of-money fundamentals (PV/FV, discount rate, annuity).",
        "Organizational mission/vision/values statement and current strategic plan.",
        "Cost-of-capital (WACC) for the organization or program hurdle rate.",
        "Candidate project list with initial investment (I0) and 5-year cash-flow projections.",
        "Internal risk register template and the criteria hierarchy from the portfolio steering committee.",
      ],
      references: [
        "PMI PMBOK® Guide 7th Edition (L3, BOK).",
        "PMI Standard for Portfolio Management 4th ed. (L3, HANDBOOK).",
        "PMI Business Analysis for Practitioners: A Practice Guide (L3, HANDBOOK).",
        "Kerzner — Project Management (13th ed., 2022) (L7, BOOK).",
        "ISO 21500:2021 (L2, STANDARD — Reference only).",
        "Kaplan & Norton — The Balanced Scorecard (1996) (L6, BOOK).",
      ],
    },
  },
  questions: [
    {
      competencyName: "Strategic & Organizational Alignment",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Construction",
      stem: `A Construction PMO evaluates 4 candidate projects under a $3.5M annual budget cap at i=10% (5-year horizon). Computed NPVs are Alpha=$581,626 (I0=$2.0M), Beta=$382,251 (I0=$1.0M), Gamma=$480,331 (I0=$3.0M), Delta=$88,360 (I0=$0.5M). What is the optimal portfolio recommendation under the budget cap?`,
      whyCorrect: `Optimal portfolio under capital rationing = the combination that maximizes combined NPV subject to the budget cap. Possible combinations: {Alpha+Beta+Delta} I0=$3.5M (exactly at cap), combined NPV = $581,626 + $382,251 + $88,360 = $1,052,237. {Gamma+Delta} I0=$3.5M, combined NPV = $480,331 + $88,360 = $568,691. {Alpha+Beta} I0=$3.0M, combined NPV = $963,877 but leaves $0.5M cap slack (Delta would fit). The {Alpha+Beta+Delta} portfolio wins on combined NPV ($1,052,237 vs $568,691) and uses the budget fully. Selection by NPV-per-$-invested (PI): Alpha=1.291, Beta=1.382, Gamma=1.160, Delta=1.177 — Beta has the best PI and is selected first; Alpha second; Delta third (uses the $0.5M remainder); Gamma is rejected because its PI is lowest and its I0 ($3.0M) would exhaust the cap, leaving no room for higher-PI projects.`,
      whyOthersWrong: [
        "{Gamma} alone — incorrect; Gamma has the highest annual cash flow but its NPV-per-$-invested (0.160) is the lowest of the four candidates, and selecting Gamma alone leaves $0.5M of the cap unused.",
        "{Alpha+Beta} — incorrect; although this is a high-NPV combo ($963,877), it leaves $0.5M of the cap unused; including Delta ($88,360 NPV) raises combined NPV to $1,052,237 with zero cap slack.",
        "{Gamma+Delta} — incorrect; this hits the cap exactly but combined NPV is only $568,691 — less than half of {Alpha+Beta+Delta}'s $1,052,237.",
      ],
      options: [
        { text: "{Alpha + Beta + Delta}, combined NPV $1,052,237, uses the full $3.5M cap, all 3 PI > 1", isCorrect: true },
        { text: "{Gamma}, highest annual cash flow", isCorrect: false },
        { text: "{Alpha + Beta}, highest 2-project combined NPV", isCorrect: false },
        { text: "{Gamma + Delta}, hits the cap exactly with Gamma's strong cash flow", isCorrect: false },
      ],
    },
    {
      competencyName: "Strategic & Organizational Alignment",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Construction",
      stem: `A weighted-factor scoring model uses 4 criteria (Strategic Fit 30%, Financial Return 30%, Risk 20%, Technical Feasibility 20%). Project A scores (SF=5, FR=4, R=3, TF=4); Project B scores (SF=3, FR=5, R=4, TF=5). What are the weighted scores and the ranking?`,
      whyCorrect: `Weighted Score = Σ w_i · s_i. Project A: 0.30·5 + 0.30·4 + 0.20·3 + 0.20·4 = 1.5 + 1.2 + 0.6 + 0.8 = 4.10. Project B: 0.30·3 + 0.30·5 + 0.20·4 + 0.20·5 = 0.9 + 1.5 + 0.8 + 1.0 = 4.20. Project B (4.20) > Project A (4.10) — B ranks higher despite A's superior Strategic Fit, because B dominates on Financial Return and Technical Feasibility which (combined weight 50%) outweigh A's Strategic Fit edge (weight 30%).`,
      whyOthersWrong: [
        "Project A ranks higher because it has the highest single-criterion score (Strategic Fit = 5) — incorrect; the weighted score is the correct ranking metric, not the single highest criterion score.",
        "The two projects tie because they each have two criterion scores of 5 — incorrect; the criteria are weighted differently (SF 30% vs TF 20%); the weighted totals are 4.10 vs 4.20.",
        "Project A ranks higher because Strategic Fit is the first criterion listed — incorrect; criteria order is not weight; weight is explicit (30% each for SF/FR, 20% each for R/TF).",
      ],
      options: [
        { text: "A=4.10, B=4.20; B ranks higher (B > A)", isCorrect: true },
        { text: "A ranks higher because Strategic Fit = 5 is the highest single-criterion score", isCorrect: false },
        { text: "Tie — both projects have two criterion scores of 5", isCorrect: false },
        { text: "A ranks higher because Strategic Fit is the first criterion listed", isCorrect: false },
      ],
    },
    {
      competencyName: "Strategic & Organizational Alignment",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "IT",
      stem: `Which of the following correctly describes the Balanced Scorecard (Kaplan & Norton, 1996)?`,
      whyCorrect: `The Balanced Scorecard is a strategic management system (Kaplan & Norton, 1996) with 4 perspectives — Financial, Customer, Internal Business Processes, Learning & Growth — linked through a strategy map (cause-and-effect chain). The cause-and-effect chain runs Learning & Growth → Internal Business Processes → Customer → Financial: capability improvements drive process improvements, which drive customer outcomes, which drive financial outcomes. The BSC is not a KPI dashboard (no strategy map → just a KPI report); it is a strategic management system.`,
      whyOthersWrong: [
        "A 4-perspective KPI dashboard without a strategy map — incorrect; without the strategy map (cause-and-effect chain), the 4 perspectives are isolated KPI reports, not a strategic management system.",
        "A customer-satisfaction measurement framework — incorrect; customer is one perspective, but the BSC has 4 perspectives and the customer perspective is downstream of Internal Processes.",
        "A financial-reporting framework that supplements GAAP — incorrect; the BSC complements financial reporting by adding non-financial perspectives (Customer, Internal, Learning & Growth) linked through cause-and-effect.",
      ],
      options: [
        { text: "A 4-perspective strategic management system (Financial, Customer, Internal Business Processes, Learning & Growth) linked by a strategy map", isCorrect: true },
        { text: "A 4-perspective KPI dashboard without a strategy map", isCorrect: false },
        { text: "A customer-satisfaction measurement framework", isCorrect: false },
        { text: "A financial-reporting framework that supplements GAAP", isCorrect: false },
      ],
    },
    {
      competencyName: "Strategic & Organizational Alignment",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Definitional",
      scenario: "Construction",
      stem: `True or False: When the budget cap binds, ranking candidate projects by NPV (highest first) and selecting until the cap is exhausted always produces the optimal portfolio.`,
      whyCorrect: `False. NPV is an absolute measure ($). Under a budget cap on investment ($), ranking by NPV alone can misallocate: a single high-NPV high-investment project may exhaust the cap and leave a smaller project with better NPV-per-$ unfunded. The correct ranking metric under capital rationing is the Profitability Index (PI = (NPV+I0)/I0 = PV(CFs)/I0) — the project with the highest NPV-per-$-invested is selected first. Under the budget cap, this is a 0/1 knapsack problem: rank by PI, select greedily, and verify the optimal combination. NPV alone is correct only when there is no budget cap (accept every project with NPV > 0).`,
      whyOthersWrong: [
        "If True: the candidate has confused NPV (absolute $ value) with PI ($ value per $ invested). NPV is the correct ranking metric for mutually-exclusive projects (pick the higher-NPV one), but under capital rationing with a binding budget cap, PI is the correct ranking metric.",
        "The knapsack formulation: maximize Σ NPV_j · x_j subject to Σ I0_j · x_j ≤ Cap and x_j ∈ {0,1} — solved by ranking on PI, not on NPV.",
      ],
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Compliance, Regulations & Standards
// (Competency: "Compliance, Regulations & Standards"; slug: be-compliance-standards)
// ---------------------------------------------------------------------------

const LESSON_BE_COMPLIANCE: RefLesson = {
  competencyName: "Compliance, Regulations & Standards",
  slug: "be-compliance-standards",
  title:
    "Compliance, Regulations & Standards — ISO 45001 Gap Analysis, ESG, GDPR Data Privacy, Environmental & OH&S Compliance",
  titleAr:
    "الامتثال واللوائح والمعايير — تحليل الفجوة ISO 45001، ESG، خصوصية بيانات GDPR، الامتثال البيئي والصحة والسلامة المهنية",
  order: 2,
  durationMin: 36,
  references: BE_REFERENCE_TITLES,
  conceptIntroduction: `Compliance, regulations, and standards are the externally-imposed guardrails within which projects must operate. The PMI PMP Business Environment domain treats compliance as a quantifiable, auditable discipline — the project manager must know the regulatory regime (industry + jurisdiction), apply the relevant ISO/industry standards, run a gap analysis, and remediate through CAPA (corrective and preventive action). This lesson equips the candidate to (1) identify the applicable regulatory regime and ISO/industry standards (ISO 9001 quality, ISO 14001 environmental, ISO 27001 information security, ISO 45001 occupational health & safety, GDPR for EU personal-data processing), (2) perform an ISO 45001:2018 gap analysis across clauses 4-10, (3) build a CAPA plan with prioritization and cost estimation, (4) address ESG (environmental, social, governance) disclosures, and (5) operate an internal audit program per ISO 19011.`,
  example: `A Construction firm (350 employees, 3 project sites) performs an internal audit against ISO 45001:2018 (OH&S MS). 26 sub-clauses (4.1 through 10.3) scored on a 1-5 scale. Average: 3.04/5 = 60.8% compliance. 8 clauses score ≤ 2 (major gaps): 4.2 (worker needs), 5.4 (worker consultation & participation), 6.3 (planning of changes), 7.5 (documented information), 8.3 (management of change), 9.3 (management review), 10.1 (incident/nonconformity RCA), 10.3 (worker consultation). Remediation cost: $185,000 (training $60K, EMS software $45K, consultant $50K, audits $30K). Target: ≥4.0 average (80% compliance) in 6 months for certification readiness. (Full computation in worked_example.)`,
  keyFormulas: `Compliance Score per clause: s_i ∈ [1..5] (5=fully compliant, 1=major gap)
Compliance % per audit: (Σ s_i) / (5 × N_clauses) × 100%
Gap Severity: major (score ≤2), minor (score=3), compliant (score ≥4)
CAPA Priority = Severity × Likelihood × Detectability (SLD risk-priority model)
Remediation cost (CAPA): Σ (training + capital + consultant + audit cost per CAPA)
ESG disclosure score (GRI/SASB standards): weighted sum of disclosed metrics / total applicable metrics × 100%
GDPR personal-data inventory: count of processing activities (Article 30 records) × data-class categories × cross-border transfer count`,
  exercise: `You are the PM of a Construction firm's OH&S improvement project (ISO 45001:2018 certification preparation). (a) Map the 7 ISO 45001 clauses (4-10) to a 26-sub-clause audit checklist. (b) Score each sub-clause on a 1-5 scale based on the firm's current state; compute average and identify major gaps. (c) Build a CAPA plan for each major gap with remediation cost estimate. (d) Compute the total remediation budget and the 6-month compliance target. (e) Identify which GDPR Article 30 records apply to the firm's worker personal-data processing if the firm wins a contract with an EU client. (f) Compute the ESG-disclosure completeness score (GRI standards) if 14 of 22 applicable metrics are disclosed.`,
  sections: {
    learning_objectives: `- Identify the applicable regulatory regime for a project (industry + jurisdiction + cross-border considerations).
- Map and apply the major ISO/industry standards: ISO 9001 (quality), ISO 14001 (environmental), ISO 27001 (information security), ISO 45001:2018 (OH&S), ISO 19011 (audit), ISO 21500:2021 (project management guidance).
- Perform a clause-by-clause gap analysis against an ISO standard (worked example on ISO 45001).
- Build a CAPA plan with severity/likelihood/detectability prioritization and cost estimation.
- Address ESG (environmental, social, governance) disclosure frameworks (GRI, SASB, TCFD).
- Apply GDPR for EU personal-data processing (Article 30 records of processing, lawful bases, cross-border transfers).
- Operate an internal-audit program per ISO 19011 (planning, execution, reporting, follow-up).`,
    prerequisites: `- Project scope and the industry in which it operates (Construction, IT, Healthcare, Manufacturing, etc.).
- Regulatory map of the jurisdiction(s) where work is performed.
- Applicable ISO/industry standards (typically identified during project initiation / scope statement).
- Internal audit team competency (ISO 19011 auditor qualifications).
- Process for management review and CAPA closure (organizational, not project-specific).`,
    introduction: `A project operates inside a regulatory and standards-based envelope set by its industry, jurisdiction, and the type of data it processes. The PMI PMP Business Environment domain tests the candidate's ability to (1) identify the applicable envelope, (2) assess the project's compliance posture (gap analysis), (3) build a CAPA plan that closes the gaps before they become audit findings or regulatory penalties, and (4) operate internal-audit and management-review processes that sustain compliance over the project life cycle. The PMBOK® Guide 7th Edition places compliance in the Tailor to Context principle; the PMI Standard for Portfolio Management treats regulatory compliance as a non-negotiable strategic-alignment criterion. ISO standards (ISO 9001, 14001, 27001, 45001) are the canonical compliance frameworks in their respective domains (quality, environment, information security, OH&S).`,
    terminology: `- Compliance: conforming to a law, regulation, standard, or contractual requirement.
- Regulation: a rule imposed by a government or regulatory body (e.g., GDPR, OSHA 29 CFR 1926 for US construction, EU Construction Products Regulation).
- Standard: a voluntary technical specification adopted by consensus (e.g., ISO 9001, ISO 14001, ISO 45001).
- ISO: International Organization for Standardization; develops voluntary international standards.
- ISO 9001:2015: Quality Management Systems (QMS) — requirements.
- ISO 14001:2016: Environmental Management Systems (EMS) — requirements with guidance for use.
- ISO 27001:2022: Information Security Management Systems (ISMS) — requirements.
- ISO 45001:2018: Occupational Health & Safety Management Systems (OH&S MS) — requirements with guidance for use; replaces OHSAS 18001.
- ISO 19011:2018: Guidelines for auditing management systems.
- GDPR (EU 2016/679): General Data Protection Regulation; governs EU personal-data processing (effective 25 May 2018).
- Article 30 (GDPR): Records of Processing Activities (RoPA) — mandatory register for controllers and processors.
- Lawful basis (GDPR Article 6): the 6 bases for lawful processing (consent, contract, legal obligation, vital interests, public task, legitimate interests).
- ESG: Environmental, Social, Governance — a disclosure framework for non-financial corporate performance.
- GRI (Global Reporting Initiative): the most-used sustainability/ESG reporting framework.
- SASB (Sustainability Accounting Standards Board): industry-specific sustainability disclosure standards (now part of ISSB).
- TCFD (Task Force on Climate-related Financial Disclosures): climate-related financial risk disclosure framework.
- CAPA: Corrective Action (fixes the existing nonconformity) + Preventive Action (prevents recurrence).
- Gap Analysis: structured comparison between current state and the standard's requirements, scored per clause.
- Internal Audit: systematic, independent, documented process for obtaining audit evidence and evaluating it objectively (ISO 19011).
- Management Review: formal senior-management review of the management system (ISO clause 9.3).
- Nonconformity: non-fulfillment of a requirement (ISO clause 10.1, 10.2).
- Stage 1 / Stage 2 Audit: certification audit phases — Stage 1 = documentation review; Stage 2 = compliance audit.
- Statement of Applicability (SoA, ISO 27001 Annex A): the list of controls included/excluded with justification.`,
    detailed_explanation: `ISO 45001:2018 (Occupational Health & Safety Management Systems) follows the ISO Annex SL High-Level Structure (HLS): 10 clauses that all ISO management-system standards share. The clauses relevant to gap analysis are 4 through 10: Clause 4 (Context of the organization: 4.1 understanding the org & its context; 4.2 needs & expectations of workers and other interested parties; 4.3 scope of the OH&S MS; 4.4 OH&S MS processes). Clause 5 (Leadership & worker participation: 5.1 leadership commitment; 5.2 OH&S policy; 5.3 organizational roles, responsibilities, authorities; 5.4 consultation & participation of workers). Clause 6 (Planning: 6.1 actions to address risks & opportunities; 6.2 OH&S objectives & planning to achieve them; 6.3 review of changes). Clause 7 (Support: 7.1 resources; 7.2 competence; 7.3 awareness; 7.4 communication; 7.5 documented information). Clause 8 (Operation: 8.1 operational planning & control; 8.2 emergency preparedness & response; 8.3 management of change; 8.4 procurement; 8.5 contractor & outsourcing). Clause 9 (Performance evaluation: 9.1 monitoring, measurement, analysis & evaluation; 9.2 internal audit; 9.3 management review). Clause 10 (Improvement: 10.1 incident, nonconformity & corrective action; 10.2 continual improvement; 10.3 worker consultation & participation in improvement).

A gap analysis scores each sub-clause on a 1-5 scale: 5=fully compliant (evidence available, processes embedded); 4=compliant with minor gaps; 3=partially compliant (process defined but not consistently applied); 2=limited compliance (ad-hoc, no documented evidence); 1=major gap (no evidence of compliance). The average compliance % = (Σ scores) / (5 × N_subclauses) × 100%. Sub-clauses scoring ≤2 are major gaps requiring CAPA.

CAPA prioritization uses the SLD risk-priority model: Severity (impact if non-compliance occurs) × Likelihood (probability of occurrence) × Detectability (1/ability to detect before audit). The risk-priority number (RPN = S × L × D, each 1-5, RPN range 1-125) sorts CAPA items from highest to lowest priority. For ISO 45001, severity is anchored in worker harm potential (lost-time injury, fatality); the priority order reflects the hierarchy of controls (eliminate → substitute → engineer → administer → PPE).

GDPR governs EU personal-data processing. The 6 lawful bases (Article 6) are consent, contract, legal obligation, vital interests, public task, and legitimate interests — at least one must apply for processing to be lawful. Article 30 requires controllers and processors to maintain a Records of Processing Activities (RoPA): purpose of processing, categories of data subjects and personal data, categories of recipients, cross-border transfers (with safeguards), retention periods, and a general description of security measures. Cross-border transfers outside the EEA require either an adequacy decision, Standard Contractual Clauses (SCCs), or Binding Corporate Rules (BCRs). Breach notification is mandatory within 72 hours of awareness (Article 33).

ESG disclosure frameworks include GRI (most widely used, multi-stakeholder), SASB (industry-specific, investor-oriented), and TCFD (climate-related financial risks). Disclosure completeness is the ratio of disclosed applicable metrics to total applicable metrics × 100%. ESG reporting is increasingly mandatory (EU CSRD, SEC climate rule, California SB 253/261) and material to project funding.

The internal audit process per ISO 19011 has 7 stages: (1) audit program (annual schedule, scope, criteria); (2) define audit objectives, scope, criteria; (3) select audit team (lead auditor + auditors with subject competence); (4) prepare audit plan and working papers (checklist, evidence templates); (5) conduct audit (opening meeting, evidence collection, closing meeting with findings); (6) audit report (findings, nonconformities, observations); (7) follow-up (verify CAPA effectiveness). Internal audit findings feed Clause 9.3 management review, which produces decisions and actions that feed Clause 10 improvement.`,
    core_principles: `- Compliance is non-negotiable. Regulatory non-compliance is a project killer — no scope, schedule, or cost argument overrides a statutory requirement.
- ISO standards follow the Annex SL HLS (10 clauses). All ISO management-system standards share clauses 4-10; the discipline-specific content is in the sub-clauses.
- Gap analysis is a scored, evidence-based comparison. An audit finding requires objective evidence (records, observations, interviews) — not opinion.
- CAPA: corrective action fixes the existing nonconformity; preventive action prevents recurrence. Both must be verified for effectiveness.
- The hierarchy of controls (eliminate → substitute → engineer → administer → PPE) is the priority order for OH&S risk reduction.
- GDPR requires a lawful basis for every personal-data processing activity; the Article 30 RoPA is the inventory; cross-border transfers require safeguards.
- ESG disclosure completeness is the ratio of disclosed applicable metrics to total applicable metrics × 100%.
- Internal audit is independent and documented (ISO 19011). Auditor competence, evidence collection, and follow-up are mandatory.
- Management review (Clause 9.3) is the formal senior-leadership review that connects audit findings to system improvement.`,
    components: `- Regulatory map (industry + jurisdiction + cross-border).
- Applicable ISO/industry standards list (ISO 9001, 14001, 27001, 45001, ISO 19011, ISO 21500).
- Audit checklist (per ISO standard: sub-clause → requirement → evidence → score → finding).
- Compliance score sheet (sub-clause × score × evidence × CAPA #).
- CAPA register (issue, root cause, corrective action, preventive action, owner, due date, cost, status).
- Internal audit program (annual schedule, scope, criteria, team, plan, report, follow-up).
- Management review minutes (inputs: audit results, CAPA status, KPIs, changes, incidents; outputs: decisions, actions).
- GDPR Article 30 RoPA register (processing activity, lawful basis, data categories, recipients, transfers, retention, security).
- ESG disclosure framework (GRI/SASB/TCFD) and metrics register.
- Statement of Applicability (SoA) for ISO 27001 (Annex A controls).`,
    process: `1. Identify the regulatory regime: industry + jurisdiction + cross-border considerations.
2. Select the applicable ISO/industry standards (e.g., ISO 45001 for OH&S, ISO 27001 for ISMS, GDPR for EU personal data).
3. Conduct a clause-by-clause gap analysis (score 1-5; capture evidence; identify major gaps ≤2).
4. Build the CAPA register: each major gap → root-cause analysis (5-Why or fishbone) → corrective action + preventive action → owner + due date + cost.
5. Prioritize CAPAs by SLD risk-priority number (Severity × Likelihood × Detectability).
6. Execute CAPAs (training, capital, consultant, software, process redesign).
7. Run an internal audit per ISO 19011 (program → plan → conduct → report → follow-up).
8. Hold management review (Clause 9.3) and decide on system improvements.
9. Apply for external certification audit (Stage 1 documentation review; Stage 2 compliance audit) if certification is the goal.`,
    formula_calculation: `ISO 45001:2018 clause structure (Annex SL HLS):
  Clauses 1-3 (scope, normative references, terms) — informational.
  Clauses 4-10 (mandatory requirements, auditable):
    4: Context of the organization (4.1, 4.2, 4.3, 4.4) — 4 sub-clauses
    5: Leadership & worker participation (5.1, 5.2, 5.3, 5.4) — 4 sub-clauses
    6: Planning (6.1, 6.2, 6.3) — 3 sub-clauses
    7: Support (7.1, 7.2, 7.3, 7.4, 7.5) — 5 sub-clauses
    8: Operation (8.1, 8.2, 8.3, 8.4, 8.5) — 5 sub-clauses
    9: Performance evaluation (9.1, 9.2, 9.3) — 3 sub-clauses
    10: Improvement (10.1, 10.2, 10.3) — 3 sub-clauses
  Total auditable sub-clauses: 4 + 4 + 3 + 5 + 5 + 3 + 3 = 26.

Gap-Analysis Score (per sub-clause i):
  s_i ∈ [1..5]:
    5 = fully compliant (evidence embedded, processes consistently applied).
    4 = compliant with minor gaps.
    3 = partially compliant (process defined but not consistently applied).
    2 = limited compliance (ad-hoc, no documented evidence).
    1 = major gap (no evidence of compliance).

Compliance % per audit:
  Compliance % = (Σ_{i=1}^{N} s_i) / (5 × N) × 100%       [N = number of sub-clauses; here N=26]

Gap Severity Classification:
  Major gap: s_i ≤ 2 (immediate CAPA).
  Minor gap: s_i = 3 (scheduled CAPA).
  Compliant: s_i ≥ 4 (monitor only).

CAPA Priority (SLD Risk-Priority Number):
  RPN = Severity × Likelihood × Detectability     [each 1..5; RPN range 1..125]
  Severity = impact of non-compliance (worker harm potential for OH&S; data-breach potential for ISMS).
  Likelihood = probability of occurrence.
  Detectability = (1 / ability to detect before audit). Use 5 = undetectable, 1 = easily detected.

Remediation Cost per CAPA:
  CAPA cost = training + capital + consultant + audit + opportunity cost of disruption
  Total remediation budget = Σ (CAPA cost)

GDPR Article 30 RoPA completeness:
  RoPA entries = processing activities × data categories × recipient categories × cross-border transfers
  Lawful bases covered: 6 per Article 6 (consent, contract, legal obligation, vital interests, public task, legitimate interests).

ESG Disclosure Completeness:
  ESG % = (disclosed applicable metrics) / (total applicable metrics) × 100%
  Frameworks: GRI (multi-stakeholder, ~100 metrics across G1-G3 series); SASB (industry-specific, ~13 metrics per industry); TCFD (governance, strategy, risk management, metrics & targets).

Variables & Units:
  s_i = score per sub-clause i ∈ [1..5]
  N = number of auditable sub-clauses (ISO 45001: 26; ISO 9001: 38; ISO 14001: 31; ISO 27001: 93 controls in Annex A + 10 main clauses)
  RPN = risk-priority number, dimensionless
  Cost = USD per CAPA item

Assumptions:
  - The auditor is competent per ISO 19011 (lead auditor + subject-matter expertise).
  - Evidence is captured through document review, observation, and worker interviews (triangulation).
  - Internal audit precedes the certification audit (Stage 1 + Stage 2 external audit).
  - ESG metrics are reported per the applicable framework (GRI/SASB/TCFD); if multiple frameworks apply, completeness is computed per framework.

Interpretation:
  - Compliance % ≥ 80% (avg score ≥ 4.0) is the threshold typically required for Stage 1 certification audit readiness.
  - Compliance % 60-80%: significant CAPA required before certification (6-month remediation typical).
  - Compliance % < 60%: major system overhaul required; certification timeline 12+ months.
  - RPN ≥ 60 (out of 125) flags urgent CAPA priority.
  - ESG completeness ≥ 80% (per framework) is the threshold for "investor-grade" disclosure.`,
    worked_example: `CASE_TYPE = SYNTHETIC. Setting: A Construction firm (350 employees, 3 active project sites, ISO 45001:2018 certification preparation).

Step 1 — Audit checklist (26 sub-clauses of ISO 45001:2018 clauses 4-10):
  4.1 Understanding org & context; 4.2 Needs/expectations of workers; 4.3 Scope of OH&S MS; 4.4 OH&S MS processes
  5.1 Leadership commitment; 5.2 OH&S policy; 5.3 Org roles, responsibilities, authorities; 5.4 Consultation & participation of workers
  6.1 Actions to address risks & opportunities; 6.2 OH&S objectives; 6.3 Review of changes
  7.1 Resources; 7.2 Competence; 7.3 Awareness; 7.4 Communication; 7.5 Documented information
  8.1 Operational planning & control; 8.2 Emergency preparedness & response; 8.3 Management of change; 8.4 Procurement (incl. contractors); 8.5 Outsourcing
  9.1 Monitoring, measurement, analysis & evaluation; 9.2 Internal audit; 9.3 Management review
  10.1 Incident, nonconformity & corrective action; 10.2 Continual improvement; 10.3 Worker consultation & participation in improvement

Step 2 — Score each sub-clause (1-5):
  4.1=3; 4.2=2 (major gap); 4.3=4; 4.4=3
  5.1=4; 5.2=5 (policy posted); 5.3=4; 5.4=2 (major gap; no worker rep committee)
  6.1=3; 6.2=3; 6.3=2 (major gap)
  7.1=4; 7.2=3; 7.3=3; 7.4=3; 7.5=2 (major gap; no controlled document register)
  8.1=4; 8.2=4; 8.3=2 (major gap); 8.4=3; 8.5=3
  9.1=3; 9.2=3; 9.3=2 (major gap; no formal review)
  10.1=3; 10.2=3; 10.3=2 (major gap)

Step 3 — Compute compliance:
  Σ scores = 3+2+4+3 + 4+5+4+2 + 3+3+2 + 4+3+3+3+2 + 4+4+2+3+3 + 3+3+2 + 3+3+2
          = (12) + (15) + (8) + (15) + (16) + (8) + (8) = 82.
  Compliance % = 82 / (5 × 26) × 100% = 82 / 130 × 100% = 63.08%.
  Average score = 82 / 26 = 3.15.

Step 4 — Major gaps (score ≤ 2):
  8 sub-clauses (out of 26): 4.2, 5.4, 6.3, 7.5, 8.3, 9.3, 10.1 (no wait — 10.1=3, minor; let's recount).
  Recount of major gaps (score = 2): 4.2, 5.4, 6.3, 7.5, 8.3, 9.3, 10.3 = 7 sub-clauses.
  Major-gap rate = 7 / 26 × 100% = 26.9%.
  Critical gaps (worker-consultation cluster): 5.4, 10.3, 4.2 — three sub-clauses all touching worker participation; root-cause cluster = "no formal worker-rep committee."

Step 5 — CAPA register (7 major gaps + 1 minor cluster):
  CAPA-01 (4.2, 5.4, 10.3 worker-consultation cluster): RPN = Severity 5 × Likelihood 4 × Detectability 4 = 80. Action: elect worker-rep committee (per trade + site), quarterly meetings, minutes. Cost: $35,000 (facilitation, 200 worker-hours @ $50/hr, governance setup).
  CAPA-02 (7.5 documented information): RPN = 4 × 4 × 3 = 48. Action: deploy EMS software (controlled document register, version control, training tracker). Cost: $45,000 software + $15,000 setup = $60,000.
  CAPA-03 (9.3 management review): RPN = 5 × 3 × 3 = 45. Action: schedule quarterly executive management review; standard agenda per ISO 9.3 inputs/outputs. Cost: $5,000 (facilitation, 40 hours @ $125/hr).
  CAPA-04 (6.3 planning of changes, 8.3 management of change): RPN = 4 × 3 × 3 = 36. Action: MOC procedure template, training. Cost: $15,000.
  CAPA-05 (minor gaps 7.2 competence + 10.1 RCA + 9.1 leading indicators): RPN ≤ 30 each. Action: training (PE/PM OH&S awareness), RCA 5-Why workshop, leading-indicator dashboard (near-miss reports/month, safety walks/week). Cost: $25,000.
  CAPA-06 (internal audit program per ISO 19011): RPN = 4 × 4 × 4 = 64. Action: train 2 internal auditors (ISO 19011 lead-auditor course), audit schedule (3 sites × 2 audits/yr), follow-up. Cost: $30,000 (training $10K + audit hours $20K).
  CAPA-07 (consultant support, certification audit fee): $30,000.
  Total remediation budget = $35K + $60K + $5K + $15K + $25K + $30K + $30K = $200,000.

Step 6 — 6-month target:
  After CAPA execution (months 1-4), re-audit (month 5), management review (month 6).
  Target: average score ≥ 4.0 (80% compliance), zero major gaps, all minor gaps CAPA-closed.
  Predicted post-CAPA score = current 3.15 + Δ, where Δ = (4.0 - 3.15) × 26 = 22.1 score-points uplift, achieved by raising 7 major-gap sub-clauses from 2 → 4 (+2 each = 14) and 9 minor-gap sub-clauses from 3 → 4 (+1 each = 9) = 23 uplift (slight buffer). Predicted average = (82 + 23) / 26 = 4.04 ⇒ 80.8% compliance ⇒ Stage 1 certification-ready.

Step 7 — GDPR Article 30 RoPA (if EU client is added):
  If the firm wins a contract with an EU client, the firm becomes a "processor" for worker personal data transferred to the client's project-management system. RoPA entries: (1) processing activity = worker roster + timesheet upload to client portal; (2) data categories = name, role, certifications, hours; (3) recipients = EU client's PMO; (4) cross-border transfer = EU client → US firm (intra-group) requires SCCs or BCRs; (5) retention = project + 7 years; (6) security = TLS 1.3 in transit, AES-256 at rest, MFA on admin access. Lawful basis = Article 6(1)(b) contract (necessary for performance of contract with the client). Breach notification: 72 hours to lead supervisory authority (per Article 33).

Step 8 — ESG disclosure completeness (GRI framework):
  Applicable GRI metrics for the firm's construction industry (GRI 203, 204, 303, 305, 306, 403, 413, 416): 22 applicable metrics.
  Current disclosure: 14 of 22 = 63.6% completeness.
  Target: ≥ 80% (18 of 22) within 12 months for investor-grade disclosure.
  Material gaps (4 of 8): GRI 305-1 (Scope 1 GHG emissions), GRI 305-2 (Scope 2), GRI 306-3 (waste generated), GRI 403-9 (work-related injuries — feeds ISO 45001 9.1 leading indicators).`,
    industrial_example: `Healthcare — A regional hospital system (3 hospitals, 4,200 employees) preparing for ISO 45001:2018 certification combined with HIPAA (US health-data privacy) and ESG disclosure. The OH&S scope covers needlestick prevention, ergonomic injury prevention for nurses, and infectious-disease preparedness. The gap analysis identifies 9 major gaps; the CAPA register is prioritized by SLD risk-priority (highest RPN = needlestick prevention at 5×4×4=80; lowest = ergonomic mats at 3×3×4=36). GDPR applies to EU patients seen at the international wing (Article 30 RoPA: 18 processing activities, 6 lawful bases). ESG disclosure (GRI 403 Occupational Health & Safety + GRI 416 Patient Health) feeds ISO 45001 leading indicators. 6-month target: 82% compliance (avg score 4.10), certification audit-ready at month 7.`,
    case_study: `CASE_TYPE = SYNTHETIC — "BuildRight Construction ISO 45001 Certification Program": a mid-size regional construction firm (350 employees, 3 sites) running an internal OH&S management-system improvement project to achieve ISO 45001:2018 certification. The PMO runs the gap analysis, CAPA register, internal audit (per ISO 19011), and management review (per ISO 45001 Clause 9.3). Gap analysis: 7 major gaps (26.9% major-gap rate), 63.08% overall compliance, avg score 3.15. The worker-consultation cluster (4.2, 5.4, 10.3 — three sub-clauses all touching worker participation) is identified as a single root-cause cluster (no formal worker-rep committee), addressed by CAPA-01 at RPN=80. Total 6-month remediation budget: $200,000. Post-CAPA target: 80.8% compliance (avg 4.04), Stage 1 certification-ready at month 6, Stage 2 audit at month 9. ESG disclosure (GRI) completeness rises from 63.6% to 81.8% as a by-product (4 of 8 missing GRI metrics get filled by the OH&S CAPA).`,
    visual_explanation: `ISO 45001:2018 clause-structure diagram (7 boxes, one per clause 4-10) with sub-clauses listed inside; color-coded by gap-analysis score (red = major gap ≤2; amber = minor gap 3; green = compliant ≥4). Worker-consultation cluster (4.2, 5.4, 10.3) highlighted as a single root-cause cluster. CAPA register rendered as a table (CAPA # | Sub-clause | Severity | Likelihood | Detectability | RPN | Action | Cost | Status). Compliance-% gauge (0-100%) with current 63% red and target 80% green. Article 30 RoPA rendered as a register table (Activity | Lawful basis | Data categories | Recipients | Transfer safeguard | Retention | Security). ESG completeness rendered as a stacked bar per framework (GRI, SASB, TCFD) with current vs target.`,
    simulation_opportunity: `Build an interactive ISO 45001 gap-analysis simulator: user scores 26 sub-clauses on a 1-5 scale, system computes compliance %, identifies major gaps, generates CAPA register with SLD RPN and cost estimate, simulates post-CAPA compliance trajectory over 6 months, and produces a Stage 1 certification-readiness verdict. Add ESG completeness calculator (GRI/SASB/TCFD) and GDPR Article 30 RoPA builder (processing activity + lawful basis + cross-border safeguard selector).`,
    common_mistakes: `- Confusing ISO 45001 with OHSAS 18001. ISO 45001:2018 replaced OHSAS 18001 in 2018; the migration deadline (March 2021) has passed. All OH&S certifications should be to ISO 45001:2018.
- Treating the management-system standard as a checklist without the strategy map / context (Clause 4.1 understanding the org & its context is the foundation; skipping it produces a paper-based system that won't survive Stage 2 audit).
- Missing the worker-consultation cluster. ISO 45001:2018 emphasizes worker consultation and participation (Clauses 5.4 and 10.3 specifically); this is a major shift from OHSAS 18001 and a frequent gap.
- Scoring gaps on a 1-3 or 1-10 scale instead of 1-5. The 1-5 scale is the convention in most ISO 19011 audit templates and supports the major-gap (≤2) vs minor-gap (3) vs compliant (≥4) classification.
- Building a CAPA register without severity/likelihood/detectability prioritization. Without RPN, CAPAs are executed in the order they're discovered — not in the order of risk.
- Forgetting the preventive action component of CAPA. Corrective action fixes the existing nonconformity; preventive action prevents recurrence. Both must be verified for effectiveness (not just done).
- Treating GDPR as a one-time compliance exercise. Article 30 RoPA must be maintained as a living register; new processing activities require new entries; cross-border transfer safeguards must be reviewed annually.
- Treating ESG disclosure as voluntary when it's mandatory (EU CSRD, SEC climate rule, California SB 253/261). Materiality assessment determines what's "material" — not optional.`,
    limitations: `- ISO standards are voluntary (unless regulated). Adoption is driven by market pressure (client requirements, supply-chain qualification) or by regulation.
- Gap-analysis scores are auditor-dependent; the same site can score differently across auditors. ISO 19011 auditor-competence requirements mitigate but do not eliminate this.
- CAPA cost estimates often underestimate the opportunity cost of operational disruption during training, MOC rollouts, and EMS-software cutover.
- GDPR adequacy decisions and SCCs evolve (Schrems II invalidated the Privacy Shield in 2020; the EU-US Data Privacy Framework replaced it in 2023). The transfer safeguard must be re-validated annually.
- ESG disclosure frameworks are consolidating (SASB + IRFS Foundation → ISSB; GRI remains independent but coordinated). Multiple frameworks create reporting burden and reconciliation risk.
- Management-review effectiveness depends on senior-leadership engagement; a perfunctory review meeting produces a paper trail without system improvement.`,
    comparison: `Comparison of ISO management-system standards (all share Annex SL HLS, clauses 1-10):
  - ISO 9001:2015 Quality Management Systems — focus on customer satisfaction, process approach, continual improvement.
  - ISO 14001:2016 Environmental Management Systems — focus on environmental aspects/impacts, life-cycle perspective.
  - ISO 27001:2022 Information Security Management Systems — focus on CIA triad (confidentiality, integrity, availability), Annex A controls (now 93 in the 2022 version).
  - ISO 45001:2018 OH&S MS — focus on worker harm prevention, hierarchy of controls, worker participation.
  - ISO 19011:2018 — guidelines for auditing management systems (audit process; not a certifiable standard itself).
  - ISO 21500:2021 — project, programme and portfolio management guidance (not certifiable; high-level guidance only).
GDPR vs HIPAA vs CCPA:
  - GDPR (EU 2016/679): applies to EU personal-data processing; 6 lawful bases; Article 30 RoPA; 72-hour breach notification; extraterritorial reach.
  - HIPAA (US 1996): applies to protected health information (PHI) by covered entities and business associates.
  - CCPA/CPRA (California): applies to California residents' personal information; consumer rights (access, delete, opt-out of sale).
ESG frameworks:
  - GRI: multi-stakeholder, ~100 metrics across G1-G3 series, most widely used.
  - SASB: industry-specific, ~13 metrics per industry, investor-oriented (now part of ISSB).
  - TCFD: climate-related financial risks (governance, strategy, risk management, metrics & targets).`,
    practical_application: `In practice, the project manager coordinates with the firm's compliance officer, internal-audit team, and (for certification) the external certification body. The PM applies the 7-stage internal-audit process (ISO 19011) on a 12-month cycle: program → plan → conduct → report → follow-up, with management review at the end of each cycle. CAPA items are tracked in a register with owner, due date, cost, and status; effectiveness verification closes the CAPA. For cross-border work (EU clients, EU workers), GDPR Article 30 RoPA is maintained as a living register with annual review of transfer safeguards. ESG disclosure completeness is tracked quarterly with a target ≥ 80% per framework. The certification audit (Stage 1 + Stage 2) is scheduled once internal compliance reaches ≥ 80%.`,
    decision_scenario: `You are the PM of an OH&S improvement project preparing for ISO 45001:2018 certification. The internal gap analysis returns 63.08% compliance with 7 major gaps. Your options: (a) Apply for the Stage 1 certification audit immediately and remediate findings; (b) Run a 6-month CAPA program to reach 80%+ compliance, then apply for Stage 1; (c) Postpone certification by 12 months and address gaps opportunistically. Response: (b). At 63.08% compliance, Stage 1 audit will identify systemic non-conformities and likely result in a Stage 1 deferral (the auditor requires evidence of system maturity before recommending Stage 2). Option (a) wastes the certification audit fee (~$30K) and signals to the certification body that the firm is unprepared. Option (c) defers the strategic value of certification (market access, client qualification, insurance premium reduction). The 6-month CAPA budget of $200K is justified by the strategic value of certification and by the by-product ESG completeness improvement (63.6% → 81.8%) which supports investor-grade disclosure.`,
    practice_questions: `1. ISO 45001:2018 has how many auditable sub-clauses (clauses 4-10)? Answer: 26 (4+4+3+5+5+3+3).
2. A gap analysis scores 26 sub-clauses with sum = 82. Compute the compliance %. Answer: 82 / 130 × 100% = 63.08%.
3. CAPA RPN = Severity × Likelihood × Detectability. For a worker-consultation gap with S=5, L=4, D=4, what is the RPN? Answer: 80 (high priority, schedule first).
4. What are the 6 GDPR lawful bases (Article 6)? Answer: consent, contract, legal obligation, vital interests, public task, legitimate interests.
5. (PMP-style) Which ISO standard governs Information Security Management Systems? Answer: ISO 27001:2022.`,
    certification_questions: `1. (PMP-style) An ISO 45001:2018 gap analysis returns 63% compliance with 7 major gaps (score ≤2). The certification audit is scheduled in 8 weeks. The best course of action is:
   (a) Apply for Stage 1 immediately and remediate findings post-audit.
   (b) Postpone Stage 1 by 6 months, run a CAPA program targeting 80%+ compliance, then schedule Stage 1.
   (c) Apply for Stage 2 only (skip Stage 1) and remediate findings in parallel.
   (d) Drop the certification effort as the system is too immature.
   Answer: b. Stage 1 at 63% compliance will identify systemic non-conformities; certification bodies typically defer Stage 2 until evidence of system maturity. A 6-month CAPA program reaches 80%+ and signals readiness to the certification body.
2. (PMP-style) A construction firm wins a contract with an EU client. Worker personal data will flow from the EU client's portal to the US firm. The firm's GDPR Article 30 RoPA must record:
   (a) Processing activity, lawful basis, data categories, recipients, cross-border safeguard, retention, security.
   (b) Only the processing activity and lawful basis.
   (c) Only the cross-border transfer safeguard.
   (d) Only the retention period.
   Answer: a. Article 30 requires the full register including purpose, data categories, recipient categories, cross-border transfers (with safeguards), retention, and security description.
3. (PMP-style) The "hierarchy of controls" in OH&S risk reduction (ISO 45001) is, in priority order:
   (a) Eliminate → Substitute → Engineer → Administer → PPE.
   (b) PPE → Administer → Engineer → Substitute → Eliminate.
   (c) Engineer → Eliminate → Substitute → Administer → PPE.
   (d) Administer → PPE → Engineer → Substitute → Eliminate.
   Answer: a. The hierarchy of controls eliminates the hazard first; PPE is the last resort.`,
    summary: `Compliance, regulations, and standards are externally-imposed guardrails within which projects must operate. The candidate must: (1) identify the applicable regulatory regime (industry + jurisdiction + cross-border); (2) apply the ISO/industry standards (ISO 9001, 14001, 27001, 45001:2018, 19011, ISO 21500:2021); (3) run a clause-by-clause gap analysis (scored 1-5; major gap ≤2); (4) build a CAPA register prioritized by SLD risk-priority number (Severity × Likelihood × Detectability); (5) address ESG disclosure (GRI/SASB/TCFD); (6) apply GDPR for EU personal-data (Article 30 RoPA, 6 lawful bases, 72-hour breach notification); (7) operate the internal audit program per ISO 19011 (7 stages: program → plan → conduct → report → follow-up); (8) hold management review per Clause 9.3. ISO 45001:2018 has 26 auditable sub-clauses (clauses 4-10); the threshold for Stage 1 certification readiness is typically 80%+ compliance (avg score ≥4.0).`,
    key_takeaways: `- Compliance is non-negotiable. Regulatory non-compliance kills projects; no scope/schedule/cost argument overrides it.
- ISO standards share the Annex SL HLS (10 clauses). Discipline-specific content is in the sub-clauses (ISO 45001: 26 auditable sub-clauses in clauses 4-10).
- Gap analysis is scored (1-5), evidence-based, and classifies gaps as major (≤2), minor (3), compliant (≥4).
- CAPA: corrective (fixes existing nonconformity) + preventive (prevents recurrence); both verified for effectiveness.
- CAPA prioritization: RPN = Severity × Likelihood × Detectability; execute highest-RPN first.
- Hierarchy of controls (OH&S): Eliminate → Substitute → Engineer → Administer → PPE. PPE is the last resort.
- GDPR: 6 lawful bases (Art. 6); Article 30 RoPA (living register); 72-hour breach notification (Art. 33); cross-border transfers require safeguards (adequacy, SCCs, BCRs).
- ESG disclosure frameworks: GRI (multi-stakeholder), SASB (industry-specific), TCFD (climate financial risk). Completeness ≥ 80% for investor-grade.
- Internal audit (ISO 19011): 7-stage process; auditor competence + independence mandatory; feeds Clause 9.3 management review.`,
    references: `- PMI. (2021). PMBOK® Guide 7th Edition. Newtown Square, PA: PMI. (Tailor to Context principle; Delivery and Measurement performance domains.)
- PMI. (2018). Standard for Portfolio Management 4th ed. Newtown Square, PA: PMI. (Compliance as non-negotiable strategic-alignment criterion.)
- PMI. (2015). Business Analysis for Practitioners: A Practice Guide. Newtown Square, PA: PMI. (Business case for compliance investment.)
- Kerzner, H. (2022). Project Management (13th ed.). Hoboken, NJ: Wiley. (Compliance in project planning; risk-register integration.)
- ISO 21500:2021. Project, programme and portfolio management — Guidance on project management. Geneva: ISO. (High-level guidance.)
- Kaplan, R. S., & Norton, D. P. (1996). The Balanced Scorecard. Boston: HBR Press. (Strategy map for compliance cascade.)
- (Standard cited only — no Standard row created: ISO 21500:2021; ISO 45001:2018 is the worked-example standard but the platform's Standard table does not contain it; per task instruction, do NOT invent a standard.)`,
  },
  knowledgeObject: {
    title: "Compliance, Regulations & Standards — Knowledge Object",
    domain: "Business Environment",
    competency: "Compliance, Regulations & Standards",
    topic: "ISO 45001 Gap Analysis, ESG, GDPR, OH&S Compliance",
    concept: "Compliance envelope (regulatory + standards + data-privacy + ESG) within which projects must operate.",
    body: {
      definitions: [
        "Compliance: conforming to a law, regulation, standard, or contractual requirement.",
        "Regulation: a rule imposed by a government or regulatory body (GDPR, OSHA 29 CFR 1926, EU CPR).",
        "Standard: a voluntary technical specification adopted by consensus (ISO 9001, 14001, 27001, 45001).",
        "ISO 45001:2018: Occupational Health & Safety Management Systems — requirements with guidance for use.",
        "ISO 19011:2018: Guidelines for auditing management systems.",
        "Annex SL HLS: the ISO High-Level Structure shared by all management-system standards (10 clauses).",
        "Gap Analysis: structured comparison between current state and the standard's requirements, scored per clause.",
        "CAPA: Corrective Action + Preventive Action; corrective fixes the nonconformity, preventive prevents recurrence.",
        "RPN (Risk-Priority Number): Severity × Likelihood × Detectability; each 1-5; range 1-125; ranks CAPAs.",
        "Hierarchy of Controls: Eliminate → Substitute → Engineer → Administer → PPE (PPE is the last resort).",
        "GDPR (EU 2016/679): governs EU personal-data processing; 6 lawful bases (Art. 6); Article 30 RoPA; 72-hour breach notification (Art. 33).",
        "Article 30 RoPA: Records of Processing Activities — mandatory GDPR register for controllers and processors.",
        "ESG: Environmental, Social, Governance — non-financial corporate disclosure.",
        "GRI: Global Reporting Initiative — multi-stakeholder ESG framework, ~100 metrics across G1-G3.",
        "SASB: Sustainability Accounting Standards Board — industry-specific ESG framework (now part of ISSB).",
        "TCFD: Task Force on Climate-related Financial Disclosures — climate-risk disclosure framework.",
        "Stage 1 / Stage 2 Certification Audit: Stage 1 = documentation review; Stage 2 = compliance audit.",
      ],
      principles: [
        "Compliance is non-negotiable — regulatory non-compliance kills projects; no scope/schedule/cost argument overrides it.",
        "ISO standards share Annex SL HLS (10 clauses); discipline-specific content is in the sub-clauses.",
        "Gap analysis is scored (1-5), evidence-based; major gap (≤2), minor gap (3), compliant (≥4).",
        "CAPA = corrective (fixes existing) + preventive (prevents recurrence); both verified for effectiveness.",
        "CAPA prioritization: RPN = Severity × Likelihood × Detectability; execute highest-RPN first.",
        "Hierarchy of controls (OH&S): Eliminate → Substitute → Engineer → Administer → PPE.",
        "GDPR requires a lawful basis for every personal-data processing activity; Article 30 RoPA is the inventory.",
        "ESG disclosure completeness = disclosed applicable metrics / total applicable metrics × 100%.",
        "Internal audit (ISO 19011) is independent and documented; auditor competence + follow-up mandatory.",
        "Management review (Clause 9.3) connects audit findings to system improvement.",
      ],
      components: [
        "Regulatory map (industry + jurisdiction + cross-border).",
        "Applicable ISO/industry standards list (ISO 9001, 14001, 27001, 45001, 19011, 21500).",
        "Audit checklist (per ISO standard: sub-clause → requirement → evidence → score → finding).",
        "Compliance score sheet (sub-clause × score × evidence × CAPA #).",
        "CAPA register (issue, root cause, corrective, preventive, owner, due date, cost, status).",
        "Internal audit program (annual schedule, scope, criteria, team, plan, report, follow-up).",
        "Management review minutes (inputs: audits, CAPA, KPIs, changes, incidents; outputs: decisions).",
        "GDPR Article 30 RoPA register (activity, lawful basis, data categories, recipients, transfers, retention, security).",
        "ESG disclosure framework (GRI/SASB/TCFD) and metrics register.",
        "Statement of Applicability (SoA) for ISO 27001 (Annex A controls).",
      ],
      mechanism: [
        "Regulatory regime → applicable ISO standards → clause-by-clause gap analysis → CAPA register → CAPA execution → internal audit (ISO 19011) → management review (ISO clause 9.3) → external certification audit (Stage 1 + Stage 2).",
        "CAPA closure requires effectiveness verification — not just action completion. Closure decision by the audit team / management review.",
        "GDPR Article 30 RoPA is maintained as a living register; new processing activities require new entries; cross-border safeguards reviewed annually.",
        "ESG disclosure feeds investor reporting and material risk reporting; completeness ≥ 80% for investor-grade.",
      ],
      process: [
        "1. Identify the regulatory regime (industry + jurisdiction + cross-border).",
        "2. Select the applicable ISO/industry standards (ISO 45001 for OH&S, ISO 27001 for ISMS, GDPR for EU personal data).",
        "3. Conduct clause-by-clause gap analysis (score 1-5; capture evidence; identify major gaps ≤2).",
        "4. Build the CAPA register: each major gap → root-cause analysis → corrective + preventive action → owner + due date + cost.",
        "5. Prioritize CAPAs by SLD risk-priority number (Severity × Likelihood × Detectability).",
        "6. Execute CAPAs (training, capital, consultant, software, process redesign).",
        "7. Run internal audit per ISO 19011 (program → plan → conduct → report → follow-up).",
        "8. Hold management review (Clause 9.3) and decide on system improvements.",
        "9. Apply for external certification audit (Stage 1 documentation review; Stage 2 compliance audit).",
      ],
      formulas: [
        "Compliance % = (Σ s_i) / (5 × N) × 100%  where s_i ∈ [1..5], N = # of sub-clauses.",
        "ISO 45001:2018 auditable sub-clauses = 4+4+3+5+5+3+3 = 26 (clauses 4-10).",
        "Gap severity: major (score ≤2), minor (score=3), compliant (score ≥4).",
        "CAPA RPN = Severity × Likelihood × Detectability; each 1-5; range 1-125; ≥60 = urgent.",
        "Remediation budget = Σ CAPA cost (training + capital + consultant + audit + disruption).",
        "GDPR lawful bases = 6 (Art. 6): consent, contract, legal obligation, vital interests, public task, legitimate interests.",
        "GDPR breach notification = 72 hours to lead supervisory authority (Art. 33).",
        "ESG completeness = (disclosed applicable metrics) / (total applicable metrics) × 100%; ≥ 80% = investor-grade.",
      ],
      metrics: [
        "Compliance % (current vs target).",
        "Average score per sub-clause (target ≥ 4.0).",
        "Major-gap count (target 0).",
        "CAPA closure rate (closed / opened per quarter; target ≥ 80%).",
        "RPN per CAPA (priority).",
        "Internal audit findings per cycle (target trending down).",
        "ESG disclosure completeness per framework (target ≥ 80%).",
        "GDPR RoPA entries count + cross-border safeguard coverage %.",
        "Stage 1 / Stage 2 certification audit pass rate.",
      ],
      examples: [
        "BuildRight Construction ISO 45001:2018 gap analysis: 26 sub-clauses; sum=82; compliance=63.08%; 7 major gaps (4.2, 5.4, 6.3, 7.5, 8.3, 9.3, 10.3).",
        "Worker-consultation cluster (4.2 + 5.4 + 10.3): root cause = no formal worker-rep committee; CAPA-01 RPN = 5×4×4 = 80.",
        "Total 6-month remediation budget = $200,000.",
        "Post-CAPA target: avg score 4.04 (80.8% compliance) ⇒ Stage 1 certification-ready.",
        "GDPR Article 30 RoPA for EU client: 18 processing activities, 6 lawful bases, 72-hour breach SLA.",
        "ESG completeness: 14 of 22 GRI metrics disclosed = 63.6%; post-CAPA target 81.8%.",
      ],
      industrial_examples: [
        "Healthcare: regional hospital system (3 hospitals, 4,200 employees) — ISO 45001 + HIPAA + ESG; 9 major gaps; needlestick prevention highest RPN (80).",
        "Construction: mid-size regional firm (350 employees, 3 sites) — ISO 45001 certification preparation; 7 major gaps; $200K remediation budget.",
        "IT: SaaS provider — ISO 27001 ISMS + GDPR; 93 Annex A controls; Statement of Applicability (SoA); cross-border SCCs for EU customers.",
      ],
      case_studies: [
        "SYNTHETIC — BuildRight Construction ISO 45001 Certification Program: 350 employees, 3 sites; gap analysis returns 63.08% compliance with 7 major gaps including worker-consultation cluster; 6-month CAPA budget $200K; post-CAPA target 80.8%; Stage 1 certification-ready at month 6.",
      ],
      common_errors: [
        "Confusing ISO 45001:2018 with OHSAS 18001 (the latter was withdrawn in 2018, migration deadline March 2021).",
        "Treating the standard as a checklist without Clause 4.1 context — produces a paper-based system.",
        "Missing the worker-consultation cluster (5.4, 10.3) — a major ISO 45001 shift from OHSAS 18001.",
        "Scoring gaps on a non-1-5 scale — prevents the major/minor/compliant classification.",
        "Building CAPA register without SLD RPN prioritization — CAPAs executed in discovery order, not risk order.",
        "Forgetting the preventive action component (only corrective action taken, no recurrence prevention).",
        "Treating GDPR as one-time — RoPA must be living; cross-border safeguards reviewed annually.",
        "Treating ESG as voluntary when it's mandatory (EU CSRD, SEC climate rule, California SB 253/261).",
      ],
      limitations: [
        "ISO standards are voluntary unless regulated; adoption driven by market pressure or regulation.",
        "Gap-analysis scores are auditor-dependent; same site can score differently across auditors.",
        "CAPA cost estimates often underestimate the opportunity cost of operational disruption.",
        "GDPR adequacy decisions and SCCs evolve (Schrems II 2020 invalidated Privacy Shield; EU-US DPF 2023 replaced it).",
        "ESG frameworks are consolidating (SASB + IFRS → ISSB); multiple frameworks create reporting burden.",
        "Management-review effectiveness depends on senior-leadership engagement; perfunctory review = paper trail only.",
      ],
      best_practices: [
        "Apply Annex SL HLS structure consistently across all ISO management-system standards.",
        "Score gaps on a 1-5 scale; classify major (≤2) / minor (3) / compliant (≥4).",
        "Prioritize CAPAs by SLD RPN; execute highest-RPN first.",
        "Verify CAPA effectiveness (not just completion) — closure decision by audit team or management review.",
        "Maintain GDPR Article 30 RoPA as a living register; review annually.",
        "Aim for ≥ 80% ESG disclosure completeness per framework for investor-grade reporting.",
        "Run internal audit per ISO 19011 7-stage process; train auditors to lead-auditor competence.",
        "Hold management review per ISO clause 9.3; document inputs (audits, CAPA, KPIs, changes, incidents) and outputs (decisions, actions).",
      ],
      related_concepts: [
        "Strategic & Organizational Alignment (BE Lesson 1).",
        "Business Value & Benefits Realization (BE Lesson 3).",
        "Project risk management (PRC domain) — risk register integration with CAPA.",
        "Project quality management (PRC domain) — ISO 9001 alignment.",
        "PMI Talent Triangle® Business Acumen leg.",
        "Stage-gate governance (BE Lesson 1) — compliance gates.",
      ],
      prerequisites: [
        "Project scope and industry context (Construction, IT, Healthcare, Manufacturing).",
        "Regulatory map of the jurisdiction(s) where work is performed.",
        "Applicable ISO/industry standards (typically identified at project initiation).",
        "Internal audit team competency (ISO 19011 lead-auditor qualifications).",
        "Process for management review and CAPA closure (organizational, not project-specific).",
      ],
      references: [
        "PMI PMBOK® Guide 7th Edition (L3, BOK).",
        "PMI Standard for Portfolio Management 4th ed. (L3, HANDBOOK).",
        "PMI Business Analysis for Practitioners: A Practice Guide (L3, HANDBOOK).",
        "Kerzner — Project Management (13th ed., 2022) (L7, BOOK).",
        "ISO 21500:2021 (L2, STANDARD — Reference only).",
        "Kaplan & Norton — The Balanced Scorecard (1996) (L6, BOOK).",
      ],
    },
  },
  questions: [
    {
      competencyName: "Compliance, Regulations & Standards",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Construction",
      stem: `A Construction firm's ISO 45001:2018 internal gap analysis scores 26 sub-clauses. The sum of scores is 82. What is the compliance %?`,
      whyCorrect: `Compliance % = (Σ scores) / (5 × N) × 100%, where N = 26 sub-clauses (clauses 4-10: 4+4+3+5+5+3+3 = 26). Here, Σ = 82, N = 26. Compliance % = 82 / (5 × 26) × 100% = 82 / 130 × 100% = 63.08%. Average score = 82 / 26 = 3.15 (between minor-gap "3" and compliant "4"; classification = needs significant CAPA before Stage 1 certification audit). The 80% certification-readiness threshold corresponds to Σ = 0.80 × 130 = 104, i.e., average score 4.0. The firm needs 104 − 82 = 22 score-point uplift to reach Stage 1 readiness.`,
      whyOthersWrong: [
        "82/26 = 3.15 = 315% — incorrect; the divisor is 5 × N (= 130), not N (= 26).",
        "82/130 = 0.63 ⇒ 0.63% — incorrect; the formula includes × 100% to convert fraction to percentage.",
        "82% — incorrect; the formula divides by the maximum possible score (5 × N = 130), not by 100 directly. 82% would only be correct if N = 16.4, which doesn't match the ISO 45001 structure.",
      ],
      options: [
        { text: "63.08% (82 / 130 × 100%); average score 3.15; needs 22-point uplift to reach 80%", isCorrect: true },
        { text: "315% (82 / 26)", isCorrect: false },
        { text: "0.63% (82 / 130 without ×100)", isCorrect: false },
        { text: "82% (raw sum, ignoring the 5×N denominator)", isCorrect: false },
      ],
    },
    {
      competencyName: "Compliance, Regulations & Standards",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Procedural",
      scenario: "Construction",
      stem: `An ISO 45001 gap analysis identifies a worker-consultation cluster (sub-clauses 4.2, 5.4, 10.3 all scoring 2) where the root cause is "no formal worker-rep committee." Which CAPA approach correctly addresses both the corrective and preventive actions?`,
      whyCorrect: `CAPA = Corrective Action (fixes existing nonconformity) + Preventive Action (prevents recurrence). Corrective action for the worker-consultation cluster: elect a worker-rep committee (per trade + per site), schedule quarterly meetings, capture minutes — this addresses the existing gap (no current consultation mechanism). Preventive action: embed the worker-rep committee in the OH&S MS procedure (documented process per Clause 7.5), include "consultation" in the management review agenda (Clause 9.3), train site supervisors on consultation requirements, and audit the committee's effectiveness in the next internal-audit cycle. Both must be verified for effectiveness — not just completed — and the closure decision rests with the audit team / management review.`,
      whyOthersWrong: [
        "Elect the worker-rep committee only (no preventive action) — incomplete; this is corrective only, doesn't prevent recurrence if the committee is later disbanded.",
        "Postpone CAPA until the next annual audit cycle — incorrect; the major gap (score 2 = RPN 80, urgent priority) must be remediated before Stage 1 certification audit, not deferred.",
        "Replace the worker-consultation requirement with a management-led safety committee — incorrect; ISO 45001:2018 explicitly requires worker consultation & participation (Clauses 5.4 and 10.3); a management-only committee does not meet the standard.",
      ],
      options: [
        { text: "Elect worker-rep committee (corrective) + embed in OH&S MS procedure + add to management review agenda + train supervisors + audit effectiveness (preventive); verify effectiveness before closure", isCorrect: true },
        { text: "Elect the worker-rep committee only; no preventive action needed", isCorrect: false },
        { text: "Postpone CAPA until next annual audit cycle; the gap is non-urgent", isCorrect: false },
        { text: "Replace with a management-led safety committee (no worker reps)", isCorrect: false },
      ],
    },
    {
      competencyName: "Compliance, Regulations & Standards",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Definitional",
      scenario: "IT",
      stem: `A SaaS provider with EU customers must comply with GDPR. Which of the following correctly describes the Article 30 Records of Processing Activities (RoPA) requirement?`,
      whyCorrect: `GDPR Article 30 requires controllers and processors (except small-scale) to maintain a Records of Processing Activities (RoPA) — a living register including: (1) purpose of processing; (2) categories of data subjects and personal data; (3) categories of recipients; (4) cross-border transfers (with safeguards — adequacy decision, Standard Contractual Clauses (SCCs), or Binding Corporate Rules (BCRs)); (5) retention periods; (6) a general description of technical and organizational security measures. RoPA is mandatory; failure to maintain it is an administrative fine up to €10M or 2% of global annual turnover (Article 83(4)). RoPA must be made available to the supervisory authority on request.`,
      whyOthersWrong: [
        "RoPA is optional for processors — incorrect; Article 30(2) explicitly requires processors (not just controllers) to maintain RoPA, with the processor-specific fields (categories of processing, transfers, safeguards, sub-processors).",
        "RoPA records only the lawful basis for each processing activity — incomplete; RoPA captures purpose, data categories, recipients, transfers, retention, and security — not just lawful basis.",
        "RoPA is required only for cross-border transfers — incorrect; RoPA covers all processing activities; cross-border transfers are one of the recorded fields but not the trigger for the register.",
      ],
      options: [
        { text: "RoPA is mandatory for controllers and processors; registers purpose, data categories, recipients, transfers (with safeguards), retention, security; failure = up to €10M / 2% turnover", isCorrect: true },
        { text: "RoPA is optional for processors", isCorrect: false },
        { text: "RoPA records only the lawful basis for each activity", isCorrect: false },
        { text: "RoPA is required only for cross-border transfers", isCorrect: false },
      ],
    },
    {
      competencyName: "Compliance, Regulations & Standards",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Definitional",
      scenario: "Healthcare",
      stem: `True or False: In the OH&S hierarchy of controls (ISO 45001:2018), Personal Protective Equipment (PPE) is the first line of defense and should be applied before considering elimination or substitution of the hazard.`,
      whyCorrect: `False. The hierarchy of controls (ISO 45001:2018, derived from NIOSH) is, in priority order: (1) Eliminate the hazard entirely; (2) Substitute with a less-hazardous alternative; (3) Engineering controls (machine guards, ventilation, isolation); (4) Administrative controls (procedures, training, scheduling, signs); (5) Personal Protective Equipment (PPE) — the last resort. PPE is the least-effective control because it relies on the worker to wear and use it correctly, and it does not eliminate the hazard. The hierarchy requires elimination first; PPE only when higher controls are not feasible. A construction site that issues hard hats as the primary control for falling objects has misapplied the hierarchy — the primary control should be engineering (toe-boards, debris nets) with PPE as the residual defense.`,
      whyOthersWrong: [
        "If True: the candidate has confused the priority order. The hierarchy of controls explicitly places PPE last (option 5 of 5); elimination and substitution are first. PPE is a residual defense, not a primary control.",
        "ISO 45001:2018 Clause 8.1.2 requires the organization to apply the hierarchy of controls in this priority order: eliminate → substitute → engineer → administer → PPE. Stage 2 auditors specifically check that the hierarchy is correctly applied in MOC (management of change) and risk-assessment records.",
      ],
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Business Value & Benefits Realization
// (Competency: "Business Value & Benefits Realization"; slug: be-business-value-benefits)
// ---------------------------------------------------------------------------

const LESSON_BE_VALUE: RefLesson = {
  competencyName: "Business Value & Benefits Realization",
  slug: "be-business-value-benefits",
  title:
    "Business Value & Benefits Realization — Benefits Management Lifecycle, Value Tracking, ROI & TCO Analysis",
  titleAr:
    "قيمة الأعمال وتحقيق الفوائد — دورة إدارة الفوائد، تتبع القيمة، تحليل العائد على الاستثمار (ROI) والتكلفة الإجمالية للملكية (TCO)",
  order: 3,
  durationMin: 38,
  references: BE_REFERENCE_TITLES,
  conceptIntroduction: `Business value and benefits realization is the engineering of a benefits-management lifecycle that connects a project's deliverable to the strategic outcome it was funded to produce. The PMI PMP Business Environment domain treats value as a measurable, traceable quantity — financial (revenue, cost savings, working capital release), strategic (market positioning, capability), or social (ESG, community impact). The PMI Business Analysis for Practitioners: A Practice Guide is the canonical reference for benefits identification, the benefits realization plan, and the post-implementation review. This lesson equips the candidate to (1) define business value across its three dimensions, (2) build a benefits-management lifecycle (identify → plan → track → realize → sustain), (3) compute ROI and TCO with discounting, (4) design a value-tracking dashboard with KPIs, and (5) assign benefits ownership to a named accountable role.`,
  example: `IT ERP replacement at a logistics firm (Services industry): initial investment $1.8M (software $800K + implementation $700K + training $200K + migration $100K); 5-year ongoing annual cost $450K (maintenance $120K + support staff $250K + infra $80K). Benefits (annual): labor savings ($300K→$700K), inventory carrying-cost reduction ($50K→$150K), stockout-loss recovery ($100K→$300K), one-time working-capital release $400K. 5-year NPV cost = $3.51M (TCO); 5-year NPV benefits = $3.80M; ROI (NPV-discounted) = 8.31%; simple undiscounted ROI = 25.93%; payback = 3.50 years. Benefits realization plan: Year 1 target $850K (actual $780K = 92%, behind on labor savings — HR adoption 78%); Year 2 target $1,150K with adoption recovery. (Full computation in worked_example.)`,
  keyFormulas: `ROI (Net) = (Total Gain − Total Cost) / Total Cost × 100%
NPV-Discounted ROI = (NPV of Benefits − NPV of Costs) / NPV of Costs × 100%
TCO (5-year NPV) = Initial Investment + Σ (Annual Cost_n / (1+i)^n) for n=1..N
Benefit Realization Rate = (Realized Benefit) / (Planned Benefit) × 100% per year
Cumulative Net Cash Flow (Year n) = Cumulative CF at Year n−1 + (Benefits_n − Costs_n)
Payback Period (Years) = n + (Cumulative Deficit at end of Year n) / (Net Cash Flow in Year n+1)
Value Tracking KPI = Σ (w_i · actual_i / target_i) × 100% (weighted KPI score; cap at 100%)`,
  exercise: `You are the benefits owner (CFO + COO joint accountability) of an ERP replacement at a logistics firm. (a) Compute 5-year TCO (NPV at i=10%). (b) Compute 5-year NPV of benefits. (c) Compute both ROI (NPV-discounted) and undiscounted ROI. (d) Compute payback period. (e) Build a benefits realization plan with annual targets, KPIs, and named owner accountability. (f) Identify Year 1 variance (target $850K, actual $780K) and propose a corrective action. (g) Compute the value-tracking KPI score for the project's 4 KPIs (Labor savings, Inventory cost, Stockout recovery, Working capital release) with weights (40%, 20%, 25%, 15%) and attainments (78%, 100%, 100%, 100%).`,
  sections: {
    learning_objectives: `- Define business value across three dimensions: financial, strategic, social.
- Build the benefits-management lifecycle: identify → plan → track → realize → sustain.
- Compute ROI (Net and NPV-discounted), TCO (5-year NPV), and payback for a project.
- Design a value-tracking dashboard with weighted KPIs, owners, and targets.
- Assign benefits ownership to a named accountable role (CFO + COO joint).
- Run a post-implementation review (PIR) to confirm benefits realization and capture lessons learned.
- Distinguish between project success (delivered on time/cost/scope) and project value (benefits realized post-project).`,
    prerequisites: `- Project business case with benefits identification (financial, strategic, social).
- Initial investment (I0) and 5-year cash-flow forecast (costs and benefits).
- Discount rate (cost-of-capital / hurdle rate).
- Benefits owner identified (named role, typically CFO + COO joint accountability).
- KPI dashboard infrastructure (reporting cadence, data sources).`,
    introduction: `A project's deliverable is not its value. The deliverable is what the project produces (a system, a bridge, a process); the value is what the organization gains from using the deliverable (revenue, cost savings, market positioning, social impact). The PMI PMP Business Environment domain tests the candidate's ability to (1) define business value in its three dimensions (financial, strategic, social), (2) build a benefits-management lifecycle that survives the project's closure, (3) compute ROI and TCO with discounting, (4) design a value-tracking dashboard with KPIs and named accountability, and (5) run a post-implementation review (PIR) that confirms benefits realization and feeds lessons learned back into the portfolio. The PMI Business Analysis for Practitioners: A Practice Guide is the canonical reference; the PMBOK® Guide 7th Edition's Focus on Value principle frames the entire discipline.`,
    terminology: `- Business Value: the net benefit (financial, strategic, social) an organization derives from a project or product.
- Financial Value: revenue increase, cost savings, working capital release, asset utilization improvement.
- Strategic Value: market positioning, brand, capability, regulatory positioning, partner ecosystem.
- Social Value: ESG outcomes, community impact, employee well-being, stakeholder trust.
- Benefits Management: the lifecycle of identifying, planning, tracking, realizing, and sustaining benefits.
- Benefit: an measurable improvement (financial or non-financial) the organization gains from a project outcome.
- Benefit Owner: the named accountable role for benefit realization (typically the business sponsor, CFO, or COO).
- Benefits Realization Plan: the document specifying each benefit, its owner, its target, its measurement, and its realization timeline.
- ROI (Return on Investment): (Total Gain − Total Cost) / Total Cost × 100%.
- NPV-Discounted ROI: (NPV of Benefits − NPV of Costs) / NPV of Costs × 100%.
- TCO (Total Cost of Ownership): the full lifecycle cost of acquiring, operating, maintaining, and disposing of an asset; computed as NPV over the analysis horizon.
- Payback Period: time (in years) for cumulative net cash flow to turn positive.
- Cumulative Net Cash Flow: running sum of (Benefits − Costs) year by year.
- KPI (Key Performance Indicator): a metric with a target that tracks benefit realization.
- Value-Tracking Dashboard: the visualization of KPIs with actual vs target, owner, and trend.
- Post-Implementation Review (PIR): the formal review, conducted 6-12 months after project closure, that confirms benefits realization and captures lessons learned.
- Benefit Sustainment: the practice of maintaining the benefit over the asset's lifecycle; addresses "benefit decay" (the tendency of benefits to erode without active management).
- Baseline Benefits: the benefits committed in the benefits realization plan; the denominator for the realization rate.
- Disbenefit: a measurable negative outcome (e.g., reduced employee satisfaction during transition) that must be netted against benefits.`,
    detailed_explanation: `Business value is a triad. Financial value is the quantifiable dollar impact: revenue increase (new product, market expansion), cost savings (process automation, supplier renegotiation), working capital release (faster order-to-cash, inventory reduction), and asset utilization improvement (equipment uptime, fleet utilization). Strategic value is the qualitative but real positioning gain: market leadership, brand equity, regulatory positioning (ISO certification, ESG rating), partner ecosystem strength, organizational capability (new skill, new process). Social value is the broader stakeholder impact: ESG outcomes (carbon reduction, water stewardship), community impact (jobs, infrastructure), employee well-being (safety, engagement), and stakeholder trust (governance, transparency). A well-formed business case quantifies all three where possible and acknowledges qualitative dimensions where quantification is not feasible.

The benefits-management lifecycle has five stages (PMI Business Analysis for Practitioners, 2015). (1) Identify — during project initiation, the business case identifies the benefits (one per benefit, each with a baseline, target, owner, measurement, and timeline). (2) Plan — the benefits realization plan documents each benefit's measurement system, reporting cadence, and risk of non-realization. (3) Track — during project execution and post-project, the benefits owner measures actual against target on the value-tracking dashboard. (4) Realize — at the benefit's planned realization date (often months or years post-project), the actual benefit is confirmed and recorded. (5) Sustain — over the asset's lifecycle, the benefits owner manages benefit decay (re-education, refresh, integration with new processes) to maintain the realized benefit.

ROI is computed in two forms. The simple (undiscounted) ROI = (Total Gain − Total Cost) / Total Cost × 100%; this is intuitive but ignores the time-value of money. The NPV-discounted ROI = (NPV of Benefits − NPV of Costs) / NPV of Costs × 100%; this is theoretically correct and consistent with the NPV-based project selection in BE Lesson 1. The two can diverge significantly when the cost is front-loaded (Year 0) and benefits are back-loaded (Years 3-5): the undiscounted ROI overstates returns because it treats a dollar in Year 5 as equivalent to a dollar in Year 0. TCO is the cost-side counterpart: TCO = Initial Investment + Σ (Annual Operating Cost / (1+i)^n) over the analysis horizon; it captures the full lifecycle cost of owning the asset (software + maintenance + support + infra + migration + disposal). TCO is the denominator in lifecycle ROI.

The value-tracking dashboard is the operational instrument of benefits realization. Each KPI has: a metric name, a target, an actual, an owner, a reporting cadence (typically monthly), and a trend. KPIs are weighted by importance to the strategic objective (Σ weights = 1); the weighted KPI score = Σ (w_i × min(1, actual_i / target_i)) × 100%, capped at 100% per KPI to prevent sandbagging. The dashboard is reviewed monthly by the steering committee; deviations > 10% trigger corrective actions (re-training, process re-engineering, escalation).

The post-implementation review (PIR) is conducted 6-12 months after project closure. Its purpose: (1) confirm benefits realization (actual vs planned, with variance analysis); (2) capture lessons learned (what worked, what didn't, what to repeat); (3) identify benefit-decay risks and the sustainment actions required; (4) feed the lessons into the portfolio steering committee's next-cycle scoring (a project that under-delivered on benefits lowers the sponsoring business unit's future-project scoring weight). The PIR is owned by the benefits owner (not the project manager — the PM's role ends at project closure).`,
    core_principles: `- The deliverable is not the value. The deliverable is what the project produces; the value is what the organization gains from using the deliverable.
- Business value is a triad: financial, strategic, social. A well-formed business case quantifies all three.
- Benefits management has a 5-stage lifecycle: identify → plan → track → realize → sustain. The lifecycle extends beyond project closure.
- The benefits owner is a named, accountable role (typically CFO + COO joint), not the project manager.
- ROI computed NPV-discounted is theoretically correct; undiscounted ROI overstates returns when costs are front-loaded and benefits back-loaded.
- TCO captures the full lifecycle cost of owning the asset (not just the acquisition cost).
- The value-tracking dashboard is the operational instrument; KPIs are weighted, capped at 100%, reviewed monthly.
- Benefits decay without sustainment; the 5th lifecycle stage (sustain) is non-optional.
- The post-implementation review (PIR) is conducted 6-12 months post-closure; owned by the benefits owner; feeds lessons into the portfolio's next-cycle scoring.
- Project success (delivered on time/cost/scope) ≠ project value (benefits realized). A project can be on-time/on-cost and still destroy value if the benefits don't materialize.`,
    components: `- Business case (benefits identified, baseline, target, owner, measurement, timeline, risk).
- Benefits realization plan (one row per benefit: owner, target, measurement, cadence, realization date).
- Value-tracking dashboard (KPIs with target, actual, owner, cadence, trend; weighted score).
- ROI computation (Net undiscounted + NPV-discounted).
- TCO computation (Initial + Σ NPV annual costs over horizon).
- Payback computation (years to cumulative positive cash flow).
- Benefits owner assignment (named role).
- Post-implementation review (PIR) template (variance analysis, lessons, sustainment actions).
- Portfolio steering committee feedback loop (PIR findings → next-cycle scoring).`,
    process: `1. Identify benefits during project initiation (business case): one benefit per row, each with baseline, target, owner, measurement, timeline, risk.
2. Plan the benefits realization: document the measurement system, reporting cadence, and risk of non-realization; assign benefits owner.
3. Build the value-tracking dashboard: KPIs (metric, target, owner, cadence, weight); weighted score capped at 100%.
4. Compute the financial baseline: ROI (Net + NPV-discounted), TCO (5-year NPV), payback period.
5. Track benefits during project execution: monthly dashboard review; deviations >10% trigger corrective action.
6. Realize benefits at planned realization dates: confirm actual vs planned; record variance.
7. Sustain benefits post-project: manage benefit decay (re-education, refresh, integration).
8. Conduct post-implementation review (PIR) 6-12 months post-closure: variance analysis, lessons, sustainment actions.
9. Feed PIR lessons into the portfolio steering committee's next-cycle scoring.`,
    formula_calculation: `ROI (Net, undiscounted):
  ROI = (Total Gain − Total Cost) / Total Cost × 100%    [%, over analysis horizon]
  Where Total Gain = Σ undiscounted benefits, Total Cost = Σ undiscounted costs.

NPV-Discounted ROI:
  ROI_NPV = (NPV(Benefits) − NPV(Costs)) / NPV(Costs) × 100%
  Where NPV(X) = Σ X_n / (1+i)^n for n=0..N (X_0 is Year 0 investment, typically negative).
  This is the theoretically correct ROI; consistent with NPV-based project selection.

TCO (Total Cost of Ownership, 5-year NPV):
  TCO = I0 + Σ_{n=1}^{N} (Annual_Cost_n / (1+i)^n)    [USD, NPV; i = discount rate]
  Includes acquisition (I0) + maintenance + support + infrastructure + migration + disposal (residual value subtracted if applicable).

Payback Period (Years):
  Payback = n + (Cumulative Deficit at end of Year n) / (Net Cash Flow in Year n+1)
  Where n = last year with negative cumulative net cash flow.
  Net Cash Flow_n = Benefits_n − Costs_n (undiscounted; use discounted for discounted payback).

Benefit Realization Rate:
  Realization Rate (Year k) = (Realized Benefit_k) / (Planned Benefit_k) × 100%
  Cumulative Realization Rate = Σ Realized / Σ Planned × 100%.

Value-Tracking KPI Score:
  KPI Score = Σ_{i=1}^{m} w_i · min(1, actual_i / target_i) × 100%   [%, m = # of KPIs]
  Σ w_i = 1; cap at 100% per KPI to prevent sandbagging.

Cumulative Net Cash Flow:
  Cumulative CF (Year n) = Cumulative CF (Year n−1) + (Benefits_n − Costs_n)

Variables & Units:
  i = discount rate (cost-of-capital) [%]
  N = analysis horizon (typically 5 years)
  I0 = initial investment [USD]
  Benefits_n = benefit (positive cash inflow) in year n [USD]
  Costs_n = ongoing annual cost (maintenance + support + infrastructure) [USD]
  Net CF_n = Benefits_n − Costs_n [USD]
  w_i = weight of KPI i, Σ w_i = 1
  actual_i, target_i = KPI actual and target [same units as the KPI]

Assumptions:
  - End-of-year cash flows (NPV convention).
  - Benefits and costs are nominal (inflation-adjusted) or real (deflated); not mixed.
  - The analysis horizon matches the asset's expected useful life (5 years for IT systems; 30+ for construction).
  - The benefits owner is a named role accountable through the sustainment stage (5+ years post-closure).
  - KPI weights reflect the strategic objective's priorities (e.g., 40% labor savings if "productivity" is the dominant theme).

Interpretation:
  - ROI > 0 means the project creates value (gain > cost).
  - NPV-discounted ROI < undiscounted ROI when costs are front-loaded and benefits back-loaded — the gap is the time-value of money.
  - TCO captures the full lifecycle cost; comparing TCO across alternatives (build vs buy vs SaaS) is the correct like-for-like cost comparison.
  - Payback = years to recover the investment; shorter is better (less time at risk).
  - KPI score ≥ 80% = "on-track" (typical threshold); 60-80% = "watch"; < 60% = "intervention required".
  - Realization rate > 100% per benefit is capped at 100% for KPI scoring (sandbagging prevention) but recorded as the raw value for variance analysis.`,
    worked_example: `CASE_TYPE = SYNTHETIC. Setting: A logistics firm (Services industry) replacing its ERP system. Initial investment I0 = $1.8M (software $800K + implementation $700K + training $200K + data migration $100K). Ongoing annual cost $450K (maintenance $120K + support staff $250K + infrastructure $80K). 5-year horizon. Discount rate i = 10%.

Annual Benefits:
  Labor savings (productivity): Y1 $300K, Y2 $500K, Y3-Y5 $700K each.
  Inventory carrying-cost reduction: Y1 $50K, Y2 $100K, Y3-Y5 $150K each.
  Stockout-loss recovery (revenue): Y1 $100K, Y2 $200K, Y3-Y5 $300K each.
  Working-capital release (one-time, Year 1 only): $400K (faster order-to-cash).

Total Annual Benefits:
  Y1 = 300 + 50 + 100 + 400 = $850K
  Y2 = 500 + 100 + 200 = $800K
  Y3 = 700 + 150 + 300 = $1,150K
  Y4 = $1,150K
  Y5 = $1,150K
  Total undiscounted benefits = 850 + 800 + 1,150 + 1,150 + 1,150 = $5,150K.

Step 1 — TCO (5-year NPV at i=10%):
  PV factor at 10%: Y0=1.0000, Y1=0.9091, Y2=0.8264, Y3=0.7513, Y4=0.6830, Y5=0.6209.
  Y0 (I0): $1,800K × 1.0000 = $1,800,000.
  Y1 ongoing: $450K × 0.9091 = $409,091.
  Y2: $450K × 0.8264 = $371,901.
  Y3: $450K × 0.7513 = $338,084.
  Y4: $450K × 0.6830 = $307,356.
  Y5: $450K × 0.6209 = $279,420.
  TCO (NPV) = 1,800,000 + 409,091 + 371,901 + 338,084 + 307,356 + 279,420 = $3,505,852 ≈ $3.51M.
  Annualized TCO = $3,505,852 / 3.7908 (annuity factor, 5 yrs, 10%) = $925,000/yr equivalent.

Step 2 — NPV of Benefits (5-year, i=10%):
  Y1: $850K × 0.9091 = $772,727.
  Y2: $800K × 0.8264 = $661,157.
  Y3: $1,150K × 0.7513 = $864,025.
  Y4: $1,150K × 0.6830 = $785,466.
  Y5: $1,150K × 0.6209 = $714,063.
  NPV(Benefits) = 772,727 + 661,157 + 864,025 + 785,466 + 714,063 = $3,797,438 ≈ $3.80M.

Step 3 — ROI (NPV-discounted):
  ROI_NPV = (NPV(Benefits) − NPV(Costs)) / NPV(Costs) × 100%
         = (3,797,438 − 3,505,852) / 3,505,852 × 100%
         = 291,586 / 3,505,852 × 100%
         = 8.31%.

Step 4 — ROI (Net undiscounted):
  Total undiscounted costs = $1,800K + 5 × $450K = $1,800K + $2,250K = $4,050K.
  Total undiscounted benefits = $5,150K.
  ROI_Net = (5,150 − 4,050) / 4,050 × 100% = 1,100 / 4,050 × 100% = 27.16%.

  Note: The undiscounted ROI (27.16%) is much higher than the NPV-discounted ROI (8.31%) because the front-loaded $1.8M Year-0 investment is treated as equivalent to the back-loaded Year-5 benefit dollars in the undiscounted calculation. The NPV-discounted ROI is the theoretically correct measure.

Step 5 — Payback Period (Years):
  Cumulative net cash flow (undiscounted):
    Y0: −$1,800K (initial investment).
    Y1: 850 − 450 = +$400K; cumulative = −$1,400K.
    Y2: 800 − 450 = +$350K; cumulative = −$1,050K.
    Y3: 1,150 − 450 = +$700K; cumulative = −$350K.
    Y4: 1,150 − 450 = +$700K; cumulative = +$350K.
  Payback = 3 + (350 / 700) = 3.50 years.

Step 6 — Value-Tracking KPI Score (Year 1, mid-year review):
  KPIs: Labor savings (weight 40%), Inventory cost reduction (20%), Stockout recovery (25%), Working-capital release (15%).
  Year 1 targets: $300K, $50K, $100K, $400K.
  Year 1 actuals (mid-year): $234K, $50K, $100K, $400K.
  Attainments: 78%, 100%, 100%, 100%.
  KPI Score = 0.40 × min(1, 0.78) + 0.20 × min(1, 1.0) + 0.25 × min(1, 1.0) + 0.15 × min(1, 1.0)
            = 0.40 × 0.78 + 0.20 × 1.0 + 0.25 × 1.0 + 0.15 × 1.0
            = 0.312 + 0.20 + 0.25 + 0.15
            = 0.912 = 91.2%.

  Year 1 Q4 final actual: labor savings $234K (78% — behind due to HR adoption at 78% vs target 100%); other 3 KPIs at 100%. Total benefit actual = 234 + 50 + 100 + 400 = $784K vs target $850K = 92.2% realization rate.
  Corrective action: HR adoption plan — dedicated HR super-user at each of 5 sites, daily standup adoption tracking, escalation to COO if adoption < 90% by Q3 of Year 2.

Step 7 — Benefits Realization Plan (one row per benefit):
  | Benefit | Owner | Target Y1 | Target Y2 | Realization Date | Measurement | Cadence |
  | Labor savings | CFO + COO | $300K | $500K | Quarterly | Payroll audit (HRIS) | Monthly |
  | Inventory carrying-cost reduction | COO | $50K | $100K | Quarterly | Warehouse report | Monthly |
  | Stockout-loss recovery | VP Sales | $100K | $200K | Quarterly | Sales recovery report | Monthly |
  | Working-capital release | CFO | $400K (one-time) | — | Y1 Q4 | Treasury cash-on-hand report | Quarterly |
  | Adoption rate (leading indicator) | HR Director | 100% | 100% | Monthly | Active-user % | Weekly |

Step 8 — Post-Implementation Review (PIR) at Month 12:
  - Project closure status: on-time (+5 days), on-cost (+$45K = 2.5% over), on-scope (all modules delivered). Project success = YES.
  - Year 1 benefits realization: $784K / $850K = 92.2% (target missed by 7.8%).
  - Root cause of variance: HR adoption 78% (target 100%) — labor savings are 78% of target as a direct consequence.
  - Corrective action: HR super-user rollout, daily adoption tracking, COO escalation trigger.
  - Project value verdict: PARTIAL VALUE realized; full value expected by Q2 of Year 2 with adoption recovery.
  - Lessons learned: (a) Under-estimated HR change-management effort; (b) Working-capital release on-target (treasury did not need ERP customization); (c) Inventory carrying-cost reduction requires supplier-portal integration (Q2 of Year 2 milestone).
  - Feedback to portfolio steering committee: future ERP projects at this firm should budget 2× the HR change-management effort and pre-stage supplier portals before go-live.`,
    industrial_example: `IT — A logistics firm (Services industry) replacing its ERP. Benefits owner: CFO (financial) + COO (operational) joint accountability. The 5-year TCO is $3.51M (NPV); the 5-year NPV of benefits is $3.80M; the NPV-discounted ROI is 8.31% (positive but modest — typical for IT infrastructure projects where much of the benefit is risk avoidance, not revenue). The undiscounted ROI is 27.16% (the inflated headline that the CFO rejects in favor of the NPV-discounted figure). Payback is 3.50 years. Year 1 actual = $784K (92.2% of $850K target) due to HR adoption shortfall (78% vs 100% target). Corrective action: HR super-user rollout with COO escalation. The PIR at Month 12 confirms partial value realization with full value expected by Year 2 Q2.`,
    case_study: `CASE_TYPE = SYNTHETIC — "LogiCo ERP Replacement": a mid-size logistics firm (Services industry, $80M annual revenue) replacing its legacy ERP. The PMO applies the PMI Business Analysis for Practitioners: A Practice Guide benefits-management lifecycle (identify → plan → track → realize → sustain). Benefits owner: CFO + COO joint. The 5-year TCO is $3.51M (NPV at i=10%); NPV of benefits is $3.80M; NPV-discounted ROI = 8.31%; undiscounted ROI = 27.16%; payback = 3.50 years. Year 1 benefits target $850K; actual $784K (92.2%); shortfall root-caused to HR adoption 78% (target 100%); corrective action = HR super-user rollout. PIR at Month 12: project success YES (on-time/cost/scope), project value PARTIAL (92.2% Y1 benefit realization); full value expected by Year 2 Q2. Lessons fed to portfolio steering committee: budget 2× HR change-management effort; pre-stage supplier portals before ERP go-live.`,
    visual_explanation: `Benefits realization chart: stacked bar by year (Labor savings / Inventory / Stockout / Working-capital release) for Years 0-5; cumulative net cash flow line crossing zero between Year 3 and Year 4 (payback = 3.50 years). Value-tracking dashboard: 4 KPIs in a card grid (Labor / Inventory / Stockout / Working-capital), each with target vs actual, attainment %, owner, trend arrow. KPI score gauge at 91.2% (mid-year Y1). NPV-discounted ROI vs undiscounted ROI comparison bar (8.31% vs 27.16%) — visually demonstrating the time-value-of-money gap. Benefits realization plan rendered as a Gantt (4 benefits × 5 years) with target vs actual markers and realization dates.`,
    simulation_opportunity: `Build an interactive benefits realization simulator: user enters I0, ongoing annual cost, 5-year benefit projections (4 benefit streams), discount rate, KPI weights; system computes TCO (NPV), NPV of benefits, NPV-discounted ROI, undiscounted ROI, payback, KPI score; lets user inject a Year-1 adoption shortfall (e.g., 78% vs 100%) and shows the corrective-action breakeven (how much Year-2 adoption is needed to recover to the original 5-year NPV). The simulator visualizes the cumulative-net-cash-flow line crossing zero (payback year) and the benefits-by-year stacked bars.`,
    common_mistakes: `- Treating the deliverable as the value. A delivered ERP system has zero value if no one uses it; the value comes from the post-go-live benefits stream.
- Using undiscounted ROI when costs are front-loaded and benefits back-loaded. The undiscounted ROI (27.16%) overstates returns by ignoring the time-value of money; use NPV-discounted ROI (8.31%) for decisions.
- Omitting the benefits owner. Without a named, accountable owner (CFO + COO joint), no one owns the post-project realization and benefits decay silently.
- Treating TCO as just the acquisition cost (I0). TCO includes maintenance + support + infrastructure + migration + disposal — typically 2-4× I0 over 5 years.
- Setting unrealistic benefit targets (sandbagging on one side, demotivating on the other). The 60-70% attainment convention balances stretch and realism; cap KPI attainment at 100%.
- Skipping the sustainment stage. Benefits decay without active management — Year 5 labor savings can drop to 50% of Year 3 if not actively sustained (re-training, refresh, integration).
- Confusing project success (on-time/cost/scope) with project value (benefits realized). A project can be on-time/cost/scope and still destroy value if the benefits don't materialize.
- Holding the PIR too early (Month 3 — benefits not yet realized) or too late (Month 24 — lessons lost). The 6-12 month PIR window captures the first realization cycle while memories are fresh.`,
    limitations: `- NPV-discounted ROI depends on the discount rate i; mis-specified risk premium → wrong decision (same as NPV in BE Lesson 1).
- TCO assumes the analysis horizon matches the asset's useful life; for IT systems (5 years) this is reasonable, but for infrastructure (30+ years) the horizon choice is contentious.
- Strategic value (market positioning, capability) is hard to quantify; the business case may understate it, leading to under-investment in strategically important projects.
- Social value (ESG, community) is hardest to quantify; firms increasingly monetize via carbon-pricing or social-return-on-investment (SROI) frameworks, but these are imperfect.
- Benefits realization can be influenced by exogenous factors (economy, competitor action) that the project did not cause; the PIR must isolate project-attributable benefit from exogenous.
- Benefit decay is hard to forecast; sustainment budgets are often under-funded because the benefits owner is no longer the same person who chartered the project.
- KPI weights are subjective; AHP or pairwise comparison defends but encodes judgment.`,
    comparison: `Comparison of ROI/TCO measures:
  - Net (undiscounted) ROI: intuitive; ignores time-value; overstates returns when costs are front-loaded and benefits back-loaded.
  - NPV-discounted ROI: theoretically correct; consistent with NPV-based project selection; the recommended measure.
  - Payback: time-to-recover; ignores value creation beyond payback; useful as a risk screen.
  - TCO: lifecycle cost (acquisition + operating + maintenance + disposal); the denominator in lifecycle ROI; the correct like-for-like cost comparison across alternatives (build vs buy vs SaaS).
Comparison of business value dimensions:
  - Financial: quantifiable dollar impact (revenue, cost savings, working capital, asset utilization). Easiest to measure.
  - Strategic: qualitative but real positioning gain (market leadership, brand, capability, regulatory positioning). Harder to quantify; often captured as "strategic fit" in weighted scoring (BE Lesson 1).
  - Social: ESG, community impact, employee well-being, stakeholder trust. Hardest to quantify; increasingly monetized via SROI.
Project success vs project value:
  - Project success = delivered on time / on cost / on scope. Owned by the project manager; ends at project closure.
  - Project value = benefits realized post-project. Owned by the benefits owner (CFO/COO); sustained over the asset lifecycle.
  - A project can be on-time/cost/scope (success = YES) and still destroy value (value = NO) if benefits don't materialize.`,
    practical_application: `In practice, the benefits owner (CFO + COO joint) operates the value-tracking dashboard monthly, with quarterly steering-committee review and an annual full PIR. The PMO supports the benefits owner with the dashboard infrastructure (data pipelines, KPI computation, reporting) but does not own the benefits. Year 1 of a project is typically the "realization ramp" — benefits grow as adoption matures; the dashboard tracks both the headline realization rate ($ benefits / $ planned) and the leading indicators (adoption rate, training completion, process compliance) that predict future realization. Deviations > 10% trigger corrective actions owned by the benefits owner (re-training, process re-engineering, escalation). At Month 12, the PIR confirms realized benefits, captures lessons, and feeds them into the portfolio steering committee's next-cycle scoring (a sponsoring business unit whose project under-delivered sees its future-project scoring weight adjusted). Sustainment budgets are pre-allocated at project approval (typically 5-10% of I0 per year of sustainment) to manage benefit decay.`,
    decision_scenario: `You are the CFO (benefits owner) of an ERP replacement. At Year 1 month-12 PIR: project delivered on-time/cost/scope (success = YES); Year 1 benefit realization = 92.2% ($784K vs $850K target); the shortfall is rooted in HR adoption 78% vs 100% target. Your options: (a) Declare project failure and write off the $1.8M investment; (b) Continue as-planned (Year 2 target $800K, no intervention); (c) Initiate corrective action — HR super-user rollout ($30K) + COO escalation trigger, re-baseline Year 2 target to $1,150K (post-adoption recovery); (d) Re-scope the project (drop unused modules). Response: (c). The project's NPV-discounted ROI is 8.31% — positive value, just slow to realize due to adoption lag. Option (a) writes off $1.8M for a $66K shortfall — disproportionate. Option (b) leaves $1.05M of NPV unrealized (the Year 2 ramp from $800K to $1,150K depends on adoption recovery). Option (c) is the cheapest path to full value: $30K of HR investment unlocks ~$300K of additional Year 2 labor savings, an ROI on the corrective action itself of (300-30)/30 = 900%. Option (d) is over-reaction — the modules aren't unused, just under-adopted.`,
    practice_questions: `1. A project has I0=$1.8M, 5-year undiscounted benefits $5.15M, undiscounted ongoing costs $2.25M (5 × $450K). Compute undiscounted ROI. Answer: (5.15 − (1.8 + 2.25)) / (1.8 + 2.25) × 100% = (5.15 − 4.05) / 4.05 × 100% = 27.16%.
2. Same project, NPV of benefits = $3.80M, NPV of costs (TCO) = $3.51M. Compute NPV-discounted ROI. Answer: (3.80 − 3.51) / 3.51 × 100% = 8.31%.
3. Cumulative net cash flow Y0=-$1.8M, Y1=-$1.4M, Y2=-$1.05M, Y3=-$0.35M, Y4=+$0.35M. Compute payback. Answer: 3 + (0.35/0.70) = 3.50 years.
4. KPI Score = 0.40×0.78 + 0.20×1.0 + 0.25×1.0 + 0.15×1.0 = 0.912 = 91.2%. (Mid-year review; on-track per ≥80% threshold.)
5. (PMP-style) True or False: A project delivered on time/cost/scope has, by definition, created business value. Answer: False — project success (delivery) ≠ project value (benefits realized).`,
    certification_questions: `1. (PMP-style) An ERP replacement project delivered on time, cost, and scope but Year 1 benefits were only 92% of target. The most accurate statement is:
   (a) Project failed — value not realized.
   (b) Project succeeded on delivery; value realization is partial and may recover with corrective action.
   (c) Project value is irrelevant — delivery is what matters.
   (d) The benefits owner should be replaced.
   Answer: b. Project success (delivery) and project value (benefits) are distinct; 92% realization is partial value with a corrective-action path to full value.
2. (PMP-style) Compute the NPV-discounted ROI given NPV(Benefits)=$3.80M and TCO=$3.51M. Answer: (3.80 − 3.51) / 3.51 × 100% = 8.31%.
3. (PMP-style) Which of the following is the canonical benefits-management lifecycle (per PMI Business Analysis for Practitioners: A Practice Guide)?
   (a) Identify → Plan → Track → Realize → Sustain.
   (b) Initiate → Plan → Execute → Monitor → Close.
   (c) Define → Measure → Analyze → Improve → Control.
   (d) Diagnose → Design → Deliver → Measure → Sustain.
   Answer: a. The 5-stage benefits lifecycle: identify (in the business case) → plan (realization plan) → track (dashboard) → realize (at planned dates) → sustain (manage decay).`,
    summary: `Business value and benefits realization is the engineering of a benefits-management lifecycle that connects a project's deliverable to the strategic outcome it was funded to produce. The candidate must: (1) define business value across three dimensions (financial, strategic, social); (2) build the 5-stage benefits lifecycle (identify → plan → track → realize → sustain); (3) compute NPV-discounted ROI and TCO with discounting; (4) build a value-tracking dashboard with weighted, 100%-capped KPIs; (5) assign benefits ownership to a named role (CFO + COO joint); (6) run a post-implementation review (PIR) at 6-12 months post-closure; (7) feed PIR lessons into the portfolio steering committee's next-cycle scoring. NPV-discounted ROI (theoretically correct) often differs materially from undiscounted ROI when costs are front-loaded and benefits back-loaded. TCO (lifecycle cost) is the correct denominator in lifecycle ROI and the correct like-for-like cost comparison across alternatives. Project success (delivery) ≠ project value (benefits realized).`,
    key_takeaways: `- The deliverable is not the value. The value comes from the post-project benefits stream.
- Business value is a triad: financial (revenue, cost savings, working capital, asset utilization), strategic (positioning, capability, brand), social (ESG, community, well-being, trust).
- Benefits management has a 5-stage lifecycle: identify → plan → track → realize → sustain. The lifecycle extends beyond project closure.
- The benefits owner is a named, accountable role (typically CFO + COO joint), not the project manager.
- NPV-discounted ROI is theoretically correct; undiscounted ROI overstates returns when costs are front-loaded and benefits back-loaded.
- TCO (NPV) captures the full lifecycle cost (acquisition + operating + maintenance + disposal); 2-4× the initial investment over 5 years.
- The value-tracking dashboard is the operational instrument; KPIs are weighted, capped at 100%, reviewed monthly; deviations >10% trigger corrective action.
- Benefits decay without sustainment; the 5th stage (sustain) is non-optional.
- The PIR at 6-12 months post-closure confirms benefits realization and feeds lessons into the portfolio's next-cycle scoring.
- Project success (on-time/cost/scope delivery) ≠ project value (benefits realized).`,
    references: `- PMI. (2021). PMBOK® Guide 7th Edition. Newtown Square, PA: PMI. (Focus on Value principle; Measurement performance domain.)
- PMI. (2018). Standard for Portfolio Management 4th ed. Newtown Square, PA: PMI. (Portfolio performance metrics; benefits management at portfolio level.)
- PMI. (2015). Business Analysis for Practitioners: A Practice Guide. Newtown Square, PA: PMI. (Benefits-management lifecycle; benefits realization plan; business value definition.)
- Kerzner, H. (2022). Project Management (13th ed.). Hoboken, NJ: Wiley. (ROI, TCO, benefits realization; PIR.)
- ISO 21500:2021. Project, programme and portfolio management — Guidance on project management. Geneva: ISO. (Benefits management at programme level.)
- Kaplan, R. S., & Norton, D. P. (1996). The Balanced Scorecard. Boston: HBR Press. (Strategy map cause-and-effect linking project to strategic outcome.)`,
  },
  knowledgeObject: {
    title: "Business Value & Benefits Realization — Knowledge Object",
    domain: "Business Environment",
    competency: "Business Value & Benefits Realization",
    topic: "Benefits Management Lifecycle, ROI, TCO, Value Tracking, PIR",
    concept: "Post-project benefits realization lifecycle that connects deliverable to strategic outcome.",
    body: {
      definitions: [
        "Business Value: the net benefit (financial, strategic, social) an organization derives from a project or product.",
        "Financial Value: revenue increase, cost savings, working capital release, asset utilization improvement.",
        "Strategic Value: market positioning, brand, capability, regulatory positioning, partner ecosystem.",
        "Social Value: ESG outcomes, community impact, employee well-being, stakeholder trust.",
        "Benefits Management: 5-stage lifecycle — identify → plan → track → realize → sustain (PMI Business Analysis for Practitioners).",
        "Benefit: a measurable improvement the organization gains from a project outcome.",
        "Benefits Owner: the named accountable role for benefit realization (typically CFO + COO joint).",
        "Benefits Realization Plan: document specifying each benefit, owner, target, measurement, timeline.",
        "ROI (Net, undiscounted): (Total Gain − Total Cost) / Total Cost × 100%.",
        "NPV-Discounted ROI: (NPV(Benefits) − NPV(Costs)) / NPV(Costs) × 100% — theoretically correct.",
        "TCO (Total Cost of Ownership): I0 + Σ Annual_Cost_n/(1+i)^n over the analysis horizon.",
        "Payback Period: years for cumulative net cash flow to turn positive.",
        "Cumulative Net Cash Flow: running sum of (Benefits − Costs) year by year.",
        "KPI: Key Performance Indicator with a target tracking benefit realization.",
        "Value-Tracking Dashboard: visualization of KPIs with actual vs target, owner, trend.",
        "Post-Implementation Review (PIR): formal review 6-12 months post-closure; owned by benefits owner.",
        "Benefit Sustainment: managing benefit decay over the asset's lifecycle.",
        "Disbenefit: a measurable negative outcome netted against benefits (e.g., transition-period employee satisfaction drop).",
      ],
      principles: [
        "The deliverable is not the value. The value comes from the post-project benefits stream.",
        "Business value is a triad: financial, strategic, social. Quantify all three where possible.",
        "Benefits management has a 5-stage lifecycle: identify → plan → track → realize → sustain. The lifecycle extends beyond project closure.",
        "The benefits owner is a named, accountable role (CFO + COO joint), not the project manager.",
        "NPV-discounted ROI is theoretically correct; undiscounted ROI overstates returns when costs are front-loaded and benefits back-loaded.",
        "TCO captures the full lifecycle cost (acquisition + operating + maintenance + disposal), typically 2-4× I0 over 5 years.",
        "The value-tracking dashboard is the operational instrument; KPIs are weighted, capped at 100%, reviewed monthly.",
        "Benefits decay without sustainment; the 5th stage (sustain) is non-optional.",
        "The PIR at 6-12 months post-closure confirms benefits realization and feeds lessons into the portfolio's next-cycle scoring.",
        "Project success (delivery) ≠ project value (benefits realized).",
      ],
      components: [
        "Business case (benefits identified, baseline, target, owner, measurement, timeline, risk).",
        "Benefits realization plan (one row per benefit: owner, target, measurement, cadence, realization date).",
        "Value-tracking dashboard (KPIs with target, actual, owner, cadence, weight, trend).",
        "ROI computation (Net undiscounted + NPV-discounted).",
        "TCO computation (I0 + Σ NPV annual costs over horizon).",
        "Payback computation (years to cumulative positive cash flow).",
        "Benefits owner assignment (named role, typically CFO + COO joint).",
        "Post-implementation review (PIR) template (variance analysis, lessons, sustainment actions).",
        "Portfolio steering committee feedback loop (PIR findings → next-cycle scoring).",
        "Sustainment budget (5-10% of I0 per year, pre-allocated at approval).",
      ],
      mechanism: [
        "Business case (identify) → benefits realization plan (plan) → value-tracking dashboard (track) → realized benefits confirmed at planned dates (realize) → sustainment budget manages decay (sustain) → PIR at 6-12 months confirms and feeds lessons → portfolio steering committee adjusts future-project scoring weights.",
        "The benefits owner is the through-line: at project approval, the CFO/COO is assigned; they own the lifecycle through sustainment, not just project execution.",
        "Cumulative net cash flow = running sum of (Benefits − Costs); crosses zero at the payback year.",
        "NPV-discounted ROI = (NPV(Benefits) − NPV(Costs)) / NPV(Costs); the theoretically correct return measure.",
        "TCO = I0 + Σ Annual_Cost_n/(1+i)^n; the correct like-for-like cost comparison across alternatives.",
      ],
      process: [
        "1. Identify benefits during project initiation (business case): one benefit per row, each with baseline, target, owner, measurement, timeline, risk.",
        "2. Plan benefits realization: document measurement system, reporting cadence, risk of non-realization; assign benefits owner.",
        "3. Build value-tracking dashboard: KPIs (metric, target, owner, cadence, weight); weighted score capped at 100%.",
        "4. Compute financial baseline: ROI (Net + NPV-discounted), TCO (5-year NPV), payback.",
        "5. Track benefits during project execution: monthly dashboard review; deviations >10% trigger corrective action.",
        "6. Realize benefits at planned realization dates: confirm actual vs planned; record variance.",
        "7. Sustain benefits post-project: manage benefit decay (re-education, refresh, integration).",
        "8. Conduct post-implementation review (PIR) 6-12 months post-closure: variance analysis, lessons, sustainment actions.",
        "9. Feed PIR lessons into the portfolio steering committee's next-cycle scoring.",
      ],
      formulas: [
        "ROI (Net, undiscounted) = (Total Gain − Total Cost) / Total Cost × 100%.",
        "ROI_NPV = (NPV(Benefits) − NPV(Costs)) / NPV(Costs) × 100% — theoretically correct.",
        "TCO (NPV) = I0 + Σ_{n=1}^{N} Annual_Cost_n / (1+i)^n.",
        "Payback = n + (Cumulative Deficit at end of Year n) / (Net CF in Year n+1).",
        "Realization Rate (Y_k) = (Realized Benefit_k) / (Planned Benefit_k) × 100%.",
        "KPI Score = Σ w_i · min(1, actual_i/target_i) × 100%, Σ w_i = 1, capped at 100% per KPI.",
        "Cumulative CF (Y_n) = Cumulative CF (Y_{n-1}) + (Benefits_n − Costs_n).",
      ],
      metrics: [
        "ROI (Net undiscounted, %).",
        "ROI (NPV-discounted, %) — recommended for decisions.",
        "TCO (5-year NPV, $).",
        "Payback (years).",
        "Realization rate per benefit per year (%).",
        "Cumulative realization rate (%).",
        "KPI score (weighted, capped at 100%).",
        "Adoption rate (leading indicator, %).",
        "Sustainment budget utilization (spent vs allocated).",
        "PIR findings feed-back count (per quarter).",
      ],
      examples: [
        "LogiCo ERP: I0=$1.8M, TCO(NPV)=$3.51M, NPV(Benefits)=$3.80M, NPV-ROI=8.31%, undiscounted ROI=27.16%, payback=3.50 yrs.",
        "Y1 benefit target $850K, actual $784K = 92.2% realization (HR adoption 78% vs 100% target).",
        "KPI Score (mid-year Y1) = 0.40×0.78 + 0.20×1.0 + 0.25×1.0 + 0.15×1.0 = 91.2%.",
        "Corrective action: HR super-user rollout $30K → +$300K Y2 labor savings → ROI on corrective = (300-30)/30 = 900%.",
        "Sustainment budget: 5-10% of I0 per year = $90K-$180K per year (pre-allocated at approval).",
      ],
      industrial_examples: [
        "IT (logistics): ERP replacement; 5-yr TCO $3.51M; NPV-discounted ROI 8.31%; Y1 realization 92.2%; HR-adoption corrective; PIR Month 12.",
        "Healthcare: EHR rollout; benefits include patient-satisfaction improvement (strategic value) + reduced length-of-stay (financial value) + reduced medication errors (social value); PIR at Month 9.",
        "Manufacturing: lean transformation; financial benefit = $4M/yr OEE improvement; strategic benefit = supplier-tier qualification; social benefit = workforce upskilling; 5-yr NPV-ROI 14.2%.",
      ],
      case_studies: [
        "SYNTHETIC — LogiCo ERP Replacement: mid-size logistics firm ($80M revenue) replacing legacy ERP; benefits owner CFO+COO joint; 5-yr TCO $3.51M (NPV); NPV-ROI 8.31%; Y1 realization 92.2% with HR-adoption corrective action ($30K → $300K Y2 recovery); PIR Month 12 confirms partial value with full value expected by Y2 Q2.",
      ],
      common_errors: [
        "Treating the deliverable as the value (delivered system has zero value if no one uses it).",
        "Using undiscounted ROI when costs front-loaded and benefits back-loaded (overstates returns).",
        "Omitting the benefits owner (no named accountability → silent benefit decay).",
        "Treating TCO as just I0 (TCO = I0 + operating + maintenance + disposal = 2-4× I0 over 5 yrs).",
        "Setting unrealistic benefit targets (sandbagging or demotivation); aim for 60-70% attainment, cap KPI at 100%.",
        "Skipping the sustainment stage (benefits decay without active management).",
        "Confusing project success (on-time/cost/scope) with project value (benefits realized).",
        "Holding the PIR too early (Month 3 — benefits not yet realized) or too late (Month 24 — lessons lost).",
      ],
      limitations: [
        "NPV-discounted ROI depends on discount rate i; mis-specified risk premium → wrong decision.",
        "TCO horizon should match asset useful life (5 yrs IT, 30+ yrs infrastructure).",
        "Strategic value (positioning, capability) is hard to quantify; business case may understate.",
        "Social value (ESG, community) is hardest to quantify; SROI frameworks are imperfect.",
        "Benefits realization can be influenced by exogenous factors (economy, competitor) — PIR must isolate project-attributable benefit.",
        "Benefit decay is hard to forecast; sustainment budgets often under-funded when benefits owner has rotated off.",
        "KPI weights are subjective; AHP defends but encodes judgment.",
      ],
      best_practices: [
        "Quantify financial + strategic + social value in the business case; acknowledge qualitative dimensions where quantification is infeasible.",
        "Use NPV-discounted ROI (theoretically correct) — not undiscounted ROI — for project-selection and benefits-realization decisions.",
        "Compute TCO (NPV) for like-for-like cost comparison across alternatives (build vs buy vs SaaS).",
        "Assign benefits owner at project approval (typically CFO + COO joint); maintain the same owner through sustainment.",
        "Set KPI weights per strategic objective; cap KPI attainment at 100% per KPI to prevent sandbagging.",
        "Pre-allocate sustainment budget (5-10% of I0 per year) at approval; protect from re-allocation.",
        "Hold PIR at Month 6-12 post-closure; capture lessons; feed into portfolio steering committee's next-cycle scoring.",
        "Distinguish project success (on-time/cost/scope) from project value (benefits realized); report both.",
      ],
      related_concepts: [
        "Strategic & Organizational Alignment (BE Lesson 1) — NPV/IRR project selection.",
        "Compliance, Regulations & Standards (BE Lesson 2) — compliance as a non-financial benefit/requirement.",
        "Portfolio management (BE Lesson 1) — benefits feed back into next-cycle scoring.",
        "Risk management (PRC domain) — risk-adjusted discount rate.",
        "PMI Talent Triangle® Business Acumen leg.",
        "Earned Value Management (PRC domain) — project-execution measurement, distinct from benefits realization.",
      ],
      prerequisites: [
        "Project business case with benefits identification (financial, strategic, social).",
        "Initial investment (I0) and 5-year cash-flow forecast (costs and benefits).",
        "Discount rate (cost-of-capital / hurdle rate).",
        "Benefits owner identified (named role, typically CFO + COO joint).",
        "KPI dashboard infrastructure (reporting cadence, data sources).",
      ],
      references: [
        "PMI PMBOK® Guide 7th Edition (L3, BOK).",
        "PMI Standard for Portfolio Management 4th ed. (L3, HANDBOOK).",
        "PMI Business Analysis for Practitioners: A Practice Guide (L3, HANDBOOK).",
        "Kerzner — Project Management (13th ed., 2022) (L7, BOOK).",
        "ISO 21500:2021 (L2, STANDARD — Reference only).",
        "Kaplan & Norton — The Balanced Scorecard (1996) (L6, BOOK).",
      ],
    },
  },
  questions: [
    {
      competencyName: "Business Value & Benefits Realization",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "IT",
      stem: `An ERP replacement has I0=$1.8M, 5-year ongoing annual cost $450K, and 5-year undiscounted benefits $5.15M. At i=10%, the NPV of benefits is $3.80M and the TCO (NPV) is $3.51M. Compute (a) the undiscounted (Net) ROI and (b) the NPV-discounted ROI. Which is theoretically correct and why?`,
      whyCorrect: `(a) Undiscounted (Net) ROI = (Total Gain − Total Cost) / Total Cost × 100%. Total undiscounted cost = I0 + 5 × annual = $1.8M + $2.25M = $4.05M. Total undiscounted benefit = $5.15M. Net ROI = (5.15 − 4.05) / 4.05 × 100% = 1.10 / 4.05 × 100% = 27.16%. (b) NPV-discounted ROI = (NPV(Benefits) − NPV(Costs)) / NPV(Costs) × 100% = (3.80 − 3.51) / 3.51 × 100% = 0.29 / 3.51 × 100% = 8.31%. The NPV-discounted ROI (8.31%) is theoretically correct because it accounts for the time-value of money — the front-loaded $1.8M Year-0 investment is treated as more costly than the back-loaded Year-5 benefit dollars (which the undiscounted ROI treats as equivalent). The undiscounted ROI (27.16%) overstates returns by ignoring the time-value gap, which is significant when costs are front-loaded and benefits are back-loaded. The NPV-discounted ROI is consistent with NPV-based project selection (BE Lesson 1).`,
      whyOthersWrong: [
        "Both ROI figures are equal because all cash flows occur within 5 years — incorrect; the time-value-of-money creates a material gap (27.16% vs 8.31%) when costs are front-loaded and benefits back-loaded.",
        "Undiscounted ROI is theoretically correct because it uses raw dollars — incorrect; raw dollars ignore the time-value of money; a Year-0 dollar is more costly than a Year-5 dollar because the Year-0 dollar could have been invested at the discount rate.",
        "NPV-discounted ROI is computed as NPV(Benefits) / I0 — incorrect; the formula is (NPV(Benefits) − NPV(Costs)) / NPV(Costs), where NPV(Costs) = TCO (full lifecycle cost, not just I0).",
      ],
      options: [
        { text: "(a) Net ROI = 27.16%; (b) NPV-ROI = 8.31%; NPV-discounted ROI is theoretically correct (time-value of money)", isCorrect: true },
        { text: "Both ROIs are equal (≈27.16%) because all cash flows are within 5 years", isCorrect: false },
        { text: "Undiscounted ROI is theoretically correct because it uses raw dollars", isCorrect: false },
        { text: "NPV-ROI = NPV(Benefits)/I0 = 3.80/1.8 = 211%", isCorrect: false },
      ],
    },
    {
      competencyName: "Business Value & Benefits Realization",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "IT",
      stem: `An ERP replacement's value-tracking dashboard has 4 KPIs: Labor savings (weight 40%), Inventory cost reduction (20%), Stockout recovery (25%), Working-capital release (15%). Mid-year Year-1 attainments: 78%, 100%, 100%, 100%. Compute the weighted KPI score (capped at 100% per KPI).`,
      whyCorrect: `KPI Score = Σ w_i · min(1, actual_i / target_i) × 100%. Labor savings: 0.40 × min(1, 0.78) = 0.40 × 0.78 = 0.312. Inventory cost: 0.20 × min(1, 1.0) = 0.20 × 1.0 = 0.20. Stockout recovery: 0.25 × min(1, 1.0) = 0.25 × 1.0 = 0.25. Working-capital release: 0.15 × min(1, 1.0) = 0.15 × 1.0 = 0.15. Sum = 0.312 + 0.20 + 0.25 + 0.15 = 0.912 = 91.2%. The cap at 100% per KPI prevents a single KPI from offsetting under-attainment on another (sandbagging prevention). The score of 91.2% is above the typical ≥ 80% on-track threshold but the Labor savings under-attainment (78%) is flagged for corrective action (HR super-user rollout).`,
      whyOthersWrong: [
        "78% (simple average of 4 attainments) — incorrect; the KPIs are weighted (40/20/25/15), not equal; simple average treats all KPIs as equally important which contradicts the strategic-objective weighting.",
        "100% (capped at 100% because at least one KPI hit 100%) — incorrect; the cap is per-KPI, not on the weighted sum; the weighted score correctly reflects the Labor savings under-attainment.",
        "78% × 0.40 + 100% × 0.60 = 31.2% + 60% = 91.2% — this gives the right number but with the wrong weights (40/60 not 40/20/25/15); coincidental match if all non-Labor KPIs are at 100%.",
      ],
      options: [
        { text: "91.2% = 0.40×0.78 + 0.20×1.0 + 0.25×1.0 + 0.15×1.0", isCorrect: true },
        { text: "78% (simple average of 4 attainments)", isCorrect: false },
        { text: "100% (capped because at least one KPI hit 100%)", isCorrect: false },
        { text: "94.5% = 0.40×0.78 + 0.60×1.0 (collapsed non-Labor KPIs)", isCorrect: false },
      ],
    },
    {
      competencyName: "Business Value & Benefits Realization",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Construction",
      stem: `Which of the following best describes the relationship between project success and project value?`,
      whyCorrect: `Project success = delivered on time / on cost / on scope (the iron triangle). Project value = benefits realized post-project (financial + strategic + social). The two are distinct: a project can be on-time/on-cost/on-scope (success = YES) and still destroy value (value = NO) if the benefits don't materialize post-closure (e.g., the delivered system isn't adopted, the constructed facility isn't used at projected capacity, the regulatory standard is met but doesn't unlock the planned market). Conversely, a project can be over-budget/over-schedule (success = PARTIAL) and still create substantial value if the benefits exceed the cost overrun. The PM owns project success (through closure); the benefits owner (CFO/COO) owns project value (through sustainment). Both must be reported.`,
      whyOthersWrong: [
        "Project success and project value are the same — both measured at closure — incorrect; value extends beyond closure into the benefits realization phase.",
        "Project success guarantees project value — incorrect; on-time/cost/scope delivery does not guarantee benefits realization (a delivered-but-unused system has zero value).",
        "Project value is irrelevant if project success is achieved — incorrect; the strategic objective of funding the project is value creation, not delivery; a successful-delivery-no-value project is misallocated capital.",
      ],
      options: [
        { text: "Distinct: success = on-time/cost/scope delivery (PM-owned, ends at closure); value = benefits realized post-project (benefits-owner, sustained). Both must be reported", isCorrect: true },
        { text: "Same — both measured at project closure", isCorrect: false },
        { text: "Project success guarantees project value", isCorrect: false },
        { text: "Project value is irrelevant if project success is achieved", isCorrect: false },
      ],
    },
    {
      competencyName: "Business Value & Benefits Realization",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Definitional",
      scenario: "IT",
      stem: `True or False: The post-implementation review (PIR) should be conducted immediately at project closure (within 2 weeks of delivery) to capture lessons while the project team is still intact.`,
      whyCorrect: `False. The PIR should be conducted 6-12 months after project closure, not immediately. The purpose of the PIR is to confirm benefits realization — and benefits, by definition, are post-project outcomes that take months to materialize (labor savings grow with adoption, inventory carrying cost reduction requires supplier-portal integration, working-capital release accrues over the order-to-cash cycle). A PIR at closure (Week 2) cannot confirm benefits realization because no benefits have yet been realized. The 6-12 month window captures the first realization cycle (Year 1) while lessons are still fresh enough to act on. Lessons learned (what worked, what didn't, what to repeat) are captured at the PIR and fed into the portfolio steering committee's next-cycle scoring. The PIR is owned by the benefits owner (CFO/COO), not the project manager — the PM's role ends at closure.`,
      whyOthersWrong: [
        "If True: the candidate has confused the project closure meeting (a deliverable-handover event, PM-led, at closure) with the post-implementation review (a benefits-realization-confirmation event, benefits-owner-led, 6-12 months post-closure). Both are distinct activities.",
        "The PIR at 6-12 months captures the first year of benefits realization; earlier (Month 3) — adoption still ramping, insufficient data; later (Month 24) — lessons lost, project team dispersed.",
      ],
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Aggregate the 3 BE lessons.
// ---------------------------------------------------------------------------

const PMP_BE_LESSONS: RefLesson[] = [
  LESSON_BE_STRATEGIC,
  LESSON_BE_COMPLIANCE,
  LESSON_BE_VALUE,
];

// ---------------------------------------------------------------------------
// Loader — CONTENT-only (mirrors pmp-process.ts) with the additional step
// of creating the 3 BE competencies inside loadReference().
// ---------------------------------------------------------------------------

/**
 * Upsert the PMP Business Environment (BE) CONTENT into the database.
 * Idempotent: safe to call repeatedly. Returns record counts written.
 *
 * Flow:
 *  1. Find PMP certification by slug "pmp" (created by src/lib/ref-content/pmp.ts).
 *  2. Find the BE domain by code "BE" (certificationId = pmp.id). The BE
 *     domain exists in pmp.ts with NO competencies — delete any stale BE
 *     competencies and create the 3 BE competencies from
 *     PMP_BE_COMPETENCIES. Map by NAME -> id.
 *  3. Upsert References globally (by title, no sectionId) → shared ids
 *     applied to every BE lesson, KO, and question.
 *  4. For each lesson:
 *     - db.lesson.findFirst({where:{competencyId, slug}}) then update or
 *       create with sectionId=null, certificationId, competencyId, slug,
 *       title, titleAr, order, durationMin, conceptIntroduction, example,
 *       keyFormulas, exercise, sections (JSON.stringify), referenceIds
 *       (JSON.stringify shared), status="READY", confidence="HIGH",
 *       verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
 *  5. Upsert KnowledgeObject per lesson: findFirst({where:{lessonId}}) then
 *     create/update with certificationId, domainId (BE), competencyId,
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
 * it operates on BE only.
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

  // 2) Find the BE domain by code "BE" (certificationId = pmp.id). The
  //    BE domain exists in pmp.ts but is seeded with NO competencies —
  //    delete any stale BE competencies and create the 3 BE competencies
  //    here.
  const beDomain = await db.domain.findFirst({
    where: { certificationId: certification.id, code: "BE" },
  });
  if (!beDomain) {
    throw new Error(
      'Business Environment (BE) domain not found under PMP. Run the PMP structure+PPL-content loader (src/lib/ref-content/pmp.ts) first.'
    );
  }

  // Delete any existing BE competencies (idempotent re-create).
  await db.competency.deleteMany({
    where: { domainId: beDomain.id },
  });

  // Create the 3 BE competencies.
  for (const c of PMP_BE_COMPETENCIES) {
    await db.competency.create({
      data: {
        domainId: beDomain.id,
        name: c.name,
        description: c.description,
        order: c.order,
      },
    });
  }

  // Map BE competencies by NAME -> id.
  const beCompetencies = await db.competency.findMany({
    where: { domainId: beDomain.id },
  });
  const competencyIdByName: Record<string, string> = {};
  for (const c of beCompetencies) {
    competencyIdByName[c.name] = c.id;
  }
  // Validate that all 3 expected BE competencies exist by name.
  const expectedCompetencyNames = PMP_BE_LESSONS.map((l) => l.competencyName);
  const missing = expectedCompetencyNames.filter(
    (n) => !competencyIdByName[n]
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing BE competencies by name: ${missing.join(
        ", "
      )}. Ensure PMP_BE_COMPETENCIES matches PMP_BE_LESSONS competencyName.`
    );
  }

  // 3) References — global (no sectionId), upserted by title.
  const refIdsByTitle: Record<string, string> = {};
  for (const src of PMP_BE_SOURCES) {
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
  const sharedReferenceIds = PMP_BE_SOURCES.map((s) => refIdsByTitle[s.title]).filter(
    Boolean
  ) as string[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 4) Lessons, 5) KnowledgeObjects, 6) Questions
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of PMP_BE_LESSONS) {
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
      domainId: beDomain.id,
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
          domainId: beDomain.id,
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
    domain: beDomain.id,
    competencies: beCompetencies.length,
    lessons: lessonsCount,
    kos: kosCount,
    questions: questionsCount,
    references: referencesCount,
  };
}
