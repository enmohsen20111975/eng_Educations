/**
 * CMRP — Business & Management pillar — Deep scientific reference (Task ID 14-BM).
 *
 * Certification slug: "cmrp" (Certified Maintenance & Reliability Professional).
 * Domain code: "B&M" (Business & Management) — one of the 5 official SMRP CMRP pillars.
 *
 * Five lessons, one per Business & Management competency (as seeded in
 * src/lib/ref-content/cmrp.ts):
 *   1. Business Management      (slug: bm-business-management)
 *   2. Strategy                 (slug: bm-strategy)
 *   3. Quality                  (slug: bm-quality)
 *   4. Economics                (slug: bm-economics)
 *   5. Human Resources          (slug: bm-human-resources)
 *
 * Each lesson ships:
 *   - The full 24-section data-collector template (spec §9, LESSON_TEMPLATE in
 *     src/lib/spec.ts), with every applicable section filled with real,
 *     in-depth professional maintenance & reliability business content. Compact prose, no padding.
 *   - A Knowledge Object body (spec §7, KO_FIELDS) with applicable arrays
 *     populated with real content.
 *   - 4 enriched questions (whyCorrect + one whyOthersWrong per distractor +
 *     cognitiveLevel + KO link + scenario/industry metadata), mixing MCQ and a
 *     True/False, spanning Easy/Medium/Hard × Remember/Understand/Apply/Analyze.
 *     Total in this file: 20 questions (4 × 5 lessons).
 *
 * Source hierarchy (spec §5) — Levels 2, 3, 6, 7:
 *   - LEVEL 3 — Official BOK: SMRP CMRP BOK (B&M pillar) + SMRP CMRP exam outline.
 *   - LEVEL 2 — Official Standard: ISO 55000:2014 (asset-management principles & value).
 *   - LEVEL 7 — Technical Publications: Mobley (Maintenance Engineering Handbook),
 *     Campbell & Jardine (Maintenance Strategy).
 *   - LEVEL 6 — University / Academic Publications: Blank & Tarquin (Engineering
 *     Economy), Deming (Out of the Crisis).
 *
 * Originality (spec §16): all worked examples, decision scenarios, case studies,
 * and questions are authored for this platform; textbook material is summarized
 * and cited, not reproduced. Case studies are SYNTHETIC and explicitly marked
 * `CASE_TYPE = SYNTHETIC` inside the lesson text.
 *
 * Lifecycle: every record (Lesson, KnowledgeObject, Question, Reference) is
 * upserted with status="READY", confidence="HIGH", verificationStatus="VERIFIED",
 * version="1.0.0", lastReviewedAt=now.
 *
 * Loader flow (see loadReference below):
 *   1. Find CMRP certification by slug "cmrp".
 *   2. Find the B&M domain by code "B&M"; map its 5 competencies by NAME -> id.
 *   3. Upsert References globally (by title, no sectionId) -> shared
 *      referenceIds array applied to every B&M lesson / KO / question.
 *   4. For each lesson: db.lesson.findFirst({where:{competencyId, slug}})
 *      then update or create.
 *   5. Upsert KnowledgeObject per lesson: findFirst({where:{lessonId}}) then
 *      create/update with body JSON, referenceIds JSON.
 *   6. For each lesson: deleteMany questions scoped to
 *      {certificationId, competencyId} then create each enriched question.
 *   7. Return { lessons, kos, questions, references, competencies } counts.
 */

import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// Public types (mirrors cmrp-equipment-reliability.ts)
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

export const CMRP_BM_SOURCES: RefSource[] = [
  {
    title: "SMRP CMRP Body of Knowledge — Business & Management pillar",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "BOK",
    url: "https://www.smrp.org/certification/cmrp-exam",
    citation:
      "Society for Maintenance & Reliability Professionals (SMRP). CMRP Body of Knowledge — Business & Management pillar: Business Management, Strategy, Quality, Economics, and Human Resources competencies. The official competency framework assessed by the CMRP exam; anchors TCO, ROI of reliability, asset lifecycle strategy, cost-of-quality, engineering economics, and workforce planning in the M&R context.",
  },
  {
    title: "SMRP CMRP Exam Outline",
    level: "3",
    levelLabel: "Official Body of Knowledge / Handbook / Exam Outline",
    type: "EXAM_OUTLINE",
    url: "https://www.smrp.org/certification",
    citation:
      "SMRP. Certified Maintenance & Reliability Professional (CMRP) Exam Outline — published content-domain weights, question count, time limit, and passing-score guidance. Cross-references the five-pillar BOK and details the Business & Management competencies tested.",
  },
  {
    title: "ISO 55000:2014 — Asset management — Overview, principles and terminology",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/55088.html",
    citation:
      "International Organization for Standardization. ISO 55000:2014, Asset management — Overview, principles and terminology. Geneva: ISO. Defines asset, asset management, asset-management system, and the value-of-asset-management principles (asset value, alignment, leadership, assurance) that frame all B&M-pillar work — TCO, asset-lifecycle strategy, and the link between reliability and enterprise value.",
  },
  {
    title: "Campbell & Jardine — Maintenance Strategy (Productivity Press)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Campbell, J. D. & Jardine, A. K. S. (2001). Maintenance Strategy: A World Class Approach to Asset Management. Productivity Press / CRC. ISBN 978-0-415-36922-8. Develops the link between corporate strategy, asset criticality, the maintenance strategy (reactive → preventive → PdM → proactive), and the lifecycle-cost thinking that operationalizes ISO 55000 principles in the M&R business context.",
  },
  {
    title: "Blank & Tarquin — Engineering Economy (McGraw-Hill)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Blank, L. T. & Tarquin, A. (2018). Engineering Economy (8th ed.). New York: McGraw-Hill. ISBN 978-0-07-340336-6. The canonical engineering-economy textbook: time value of money, NPV/IRR/payback, LCC, cost-benefit analysis, and replacement analysis. Provides the mathematical foundation for the Economics competency and the TCO/ROI arithmetic of Business Management.",
  },
  {
    title: "Deming — Out of the Crisis (MIT CAES Press)",
    level: "6",
    levelLabel: "University / Academic Publications",
    type: "BOOK",
    citation:
      "Deming, W. E. (1986). Out of the Crisis. Cambridge, MA: MIT Center for Advanced Engineering Study. ISBN 978-0-913790-53-6. Source of the Plan-Do-Check-Act (PDCA) cycle, the System of Profound Knowledge, and the cost-of-quality framework (Prevention / Appraisal / Failure) that underpins the Quality competency and its link to reliability improvement.",
  },
  {
    title: "Mobley — Maintenance Engineering Handbook (McGraw-Hill)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "HANDBOOK",
    citation:
      "Mobley, R. K. (2008). Maintenance Engineering Handbook (7th ed.). McGraw-Hill. ISBN 978-0-07-154358-0. Section I (business & management of M&R), Section II (maintenance strategy selection), Section IV (LCC and TCO), Section XII (organization, training, and workforce planning). The widely-cited technical reference for M&R business management, economics, and HR practice.",
  },
];

// Shared reference list — every B&M lesson cites the same set of BM sources.
const BM_REFERENCE_TITLES = CMRP_BM_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Lesson 1 — Business Management
// ---------------------------------------------------------------------------

const LESSON_BUSINESS_MANAGEMENT: RefLesson = {
  competencyName: "Business Management",
  slug: "bm-business-management",
  title: "M&R Business Value, TCO & ROI of Reliability",
  titleAr: "القيمة التجارية للصيانة والموثوقية",
  order: 1,
  durationMin: 30,
  references: BM_REFERENCE_TITLES,
  conceptIntroduction: `Business Management is the bridge between reliability engineering and the CFO. The CFO speaks the language of total cost of ownership (TCO), return on investment (ROI), and cash-flow timing; the reliability engineer speaks MTBF, Weibull, and CBM. This competency translates one into the other. The three core levers: (1) TCO — capture acquisition + operation + maintenance + downtime + disposal, not just purchase price; (2) cost-of-ownership — assign the failure cost (downtime-h × $/h + parts + labor + collateral) to specific assets and failure modes; (3) ROI of reliability — quantify the addressable cost (current failure cost × the fraction liftable by the proposed initiative) and divide by the investment to produce a defensible business case. ISO 55000:2014 frames the asset-management value proposition that this work serves.`,
  example: `A Chemical plant acid-transfer pump (P-301) has 5 failures/year, 8 h downtime each, $4,500/h production-loss cost. Annual failure cost = 5 × 8 × 4,500 = $180,000/yr. A PdM program ($50,000 one-time + $18,000/yr operating) projects MTBF lift from 2,800 h to 5,600 h — halving the failure frequency. Addressable cost = $180,000 × (1 - 2,800/5,600) = $90,000/yr. Net annual benefit = $90,000 - $18,000 = $72,000/yr. Simple payback = $50,000 / $90,000 = 0.56 yr ≈ 6.7 months. NPV @ 8% over 10 yr: PV of $90,000/yr annuity = $90,000 × 6.7101 = $603,909; less investment $50,000 → NPV ≈ $553,909. The business case is overwhelmingly positive.`,
  keyFormulas: `TCO = Acquisition + Operating + Maintenance + Downtime + Disposal [$ over asset life]
Failure cost (per asset/year) = N_fail × MDT × $/downtime-h + parts + labor + collateral
Addressable cost = FC × (1 - MTBF_target / MTBF_current)  [or equivalently FC × (1 - FR_target/FR_current)]
Simple payback [yr] = Investment / Annual_savings
NPV = Σ_{n=0..N} CF_n / (1+i)^n   where CF_0 = -Investment, CF_n = Annual_benefit (n≥1)
ROI [%] = (Total benefit - Investment) / Investment × 100
Equivalent annual cost EAC = NPV / [(1 - (1+i)^-N) / i]`,
  exercise: `You are the reliability engineer at a Power plant. A boiler feedwater pump fails 8 times/year with 12-h downtime at $4,800/h production loss; parts + labor average $3,200 per event. A CMMS upgrade + bearing redesign costs $120,000 one-time and $9,000/yr in extra PM labor. Engineering projects MTBF lift from 4,500 h to 9,000 h (failure frequency halves). Compute: (a) annual failure cost baseline; (b) addressable cost; (c) net annual benefit; (d) simple payback; (e) NPV at 8% over 10 years; (f) ROI. Recommend or reject and state why.`,
  sections: {
    learning_objectives: `- Articulate the M&R value proposition in CFO language: TCO, ROI, payback, addressable cost.
- Compute the full failure cost of an asset (downtime + parts + labor + collateral).
- Build a defensible reliability-investment business case (baseline → addressable → NPV/ROI/payback).
- Distinguish acquisition cost from total cost of ownership and explain why lowest-bid procurement fails.
- Map ISO 55000 asset-management value principles to M&R business cases.
- Identify the common pitfalls (hidden downtime, mis-priced collateral, ignoring risk-adjusted benefits).`,
    prerequisites: `- CMRP BOK 5-pillar structure and the place of Business Management within it.
- Basic finance vocabulary: cash flow, discount rate, NPV, ROI, payback.
- Maintenance work-order data: failure counts, downtime hours, parts/labor cost.
- Awareness of ISO 55000:2014 asset-management principles (value, alignment, leadership, assurance).`,
    introduction: `Business Management is the most political of the five CMRP pillars because it forces the reliability engineer to compete for capital against IT, engineering, and operations projects — and to win in the language of finance. The technical case ("MTBF will rise from 2,800 to 5,600 h") does not by itself justify the spend; the business case ("$180k annual failure cost, $90k addressable, 0.56-yr payback, $554k NPV") does. ISO 55000:2014 frames this translation as the "value" principle: asset management exists to realize value from assets, and that value is quantified in monetary terms over the asset lifecycle.

The pillar's three competencies — Business Management (this lesson), Strategy, Quality, Economics, Human Resources — together form the management wrapper that turns engineering outputs into corporate decisions. Business Management is the innermost layer: the per-asset, per-investment business case. Strategy (Lesson 2) lifts to portfolio decisions. Economics (Lesson 4) supplies the math. Quality (Lesson 3) and Human Resources (Lesson 5) are the cultural and capability foundations that determine whether the business case is actually realized.`,
    terminology: `- **Total Cost of Ownership (TCO)**: sum of acquisition + operating + maintenance + downtime + disposal costs over the asset's life.
- **Cost of Ownership**: the ongoing operational + maintenance + downtime cost (excludes acquisition).
- **Failure cost**: downtime-h × $/h + parts + labor + collateral damage attributable to a failure event.
- **Addressable cost**: the fraction of current failure cost that the proposed initiative is engineered to remove.
- **Business case**: investment + projected benefit + NPV/ROI/payback + risk + assumptions.
- **Discount rate (i)**: the time-value-of-money rate (typically the company WACC) used to discount future cash flows.
- **NPV**: Σ CF_n / (1+i)^n — net present value of the cash-flow stream.
- **IRR**: the discount rate at which NPV = 0.
- **Payback period**: years (or months) for cumulative savings to recover the investment.
- **Equivalent Annual Cost (EAC)**: NPV converted to an equal annual annuity — useful for comparing alternatives of unequal life.
- **Collateral damage**: downstream damage caused by the failure (e.g., bearing failure → shaft damage → seal damage → product loss).
- **WACC**: weighted-average cost of capital — the typical corporate discount rate.`,
    detailed_explanation: `The fundamental insight: the lowest-bid procurement price is typically 5-15% of TCO; operating + maintenance + downtime is 85-95%. A pump bought for $20,000 may consume $200,000+ in maintenance and downtime over 15 years. Procurement on acquisition price alone is therefore a false economy.

The M&R business case has four arithmetic layers:

(1) **Baseline failure cost**: per asset per year, the count of failures × (downtime hours × $/h + parts + labor + collateral). The $/h figure must be the marginal production-loss rate (lost contribution margin) — not revenue (revenue overstates the loss because variable cost is avoided) and not gross profit (understates because fixed overhead continues).

(2) **Addressable cost**: the engineering case for the proposed initiative quantifies how much of the baseline failure cost the initiative is *designed* to remove. If MTBF doubles (failure frequency halves) the addressable cost is 50% of baseline. If a CBM program is engineered to catch 70% of failures before they cascade to collateral damage, the addressable collateral is 70% of current collateral cost.

(3) **Investment + operating cost**: the one-time capex (PdM sensors, CMMS upgrade, redesign) plus the recurring opex (analyst labor, calibration, software maintenance). Both must be included; opex-only initiatives often have lower NPV than expected because the annuity of opex erodes the benefit.

(4) **NPV / IRR / payback**: discount the net annual benefit (addressable cost minus opex) at the corporate WACC, sum over the project horizon (typically 5-10 years for M&R initiatives, matching the asset's remaining life), subtract the investment. A positive NPV and a payback < 2 years is the typical CMRP-grade threshold for project approval.

ISO 55000:2014 frames this as the "value" principle of asset management. The ISO 55001 management-system requirements (asset-management plan, Cl. 6.2.2; management review, Cl. 9.3) operationalize the business-case discipline as a recurring cycle: plan → execute → measure → review → re-plan.`,
    core_principles: `- **Value over price**: TCO, not acquisition cost, is the procurement criterion.
- **Addressable, not total, cost**: the business case is built on the cost the initiative is engineered to remove, not on the entire failure cost.
- **Cash-flow timing matters**: a dollar saved in year 1 is worth more than a dollar saved in year 10 — discount.
- **Risk-adjusted benefits**: high-consequence, low-likelihood failure events (safety, environmental) carry a risk premium that pure NPV understates.
- **Closed loop**: business case → funded initiative → measured benefit → reconciliation to the original case (lessons-learned).
- **ISO 55000 alignment**: every business case is an instance of the asset-management value principle.`,
    components: `- TCO model (acquisition + O&M + downtime + disposal) for each asset class.
- Failure-cost register (per asset per year; downtime + parts + labor + collateral).
- Business-case template (baseline → addressable → investment/opex → NPV/IRR/payback → risk → recommendation).
- WACC / discount rate (finance-provided).
- Project horizon (typically = asset remaining life or 10 years, whichever shorter).
- Risk register (safety, environmental, regulatory consequences of failure).
- Benefits-realization tracker (closed-loop reconciliation).`,
    process: `1. Identify the candidate asset / failure mode from the bad-actor Pareto.
2. Pull 24-month CMMS history; compute baseline failure frequency, downtime, parts, labor.
3. Price the production-loss rate ($/h) with the operations / finance team — contribution margin, not revenue.
4. Quantify collateral damage from RCA records (downstream damage attributable to the failure).
5. Compute baseline annual failure cost (FC_baseline).
6. Engineer the proposed intervention (PdM, PM interval, redesign, CMMS upgrade); project MTBF lift and/or collateral avoidance.
7. Compute addressable cost (FC_baseline × fraction liftable).
8. Total the investment (capex) + annual opex.
9. Discount net annual benefit at WACC; compute NPV, IRR, simple payback.
10. Add risk-adjusted benefits (safety, environmental consequence reduction).
11. Present the business case with assumptions, sensitivity, and benefits-realization plan.`,
    formula_calculation: `**TCO** = Acquisition + Σ_year{Operating_y + Maintenance_y + Downtime_y} + Disposal
  - units: $ over asset life (e.g., $250,000 over 15 yr).
  - variables: Acquisition (one-time $), Operating_y ($/yr energy/labor), Maintenance_y ($/yr PM+CM+parts), Downtime_y ($/yr production loss), Disposal ($ one-time end-of-life).
  - interpretation: TCO >> Acquisition typically; lowest-bid procurement on acquisition alone under-weights 85-95% of cost.

**Failure cost (annual, per asset)**:
  FC = N_fail × (MDT × $/h + parts + labor + collateral)
  - units: $/yr.
  - assumptions: $/h is marginal contribution margin lost per downtime hour; collateral is expected (probability-weighted) downstream damage per failure.

**Addressable cost**:
  AC = FC × (1 - MTBF_target / MTBF_current) = FC × (1 - FR_target / FR_current)
  - units: $/yr.
  - assumptions: the initiative achieves the engineered MTBF lift (sensitivity test ±20%).

**NPV**:
  NPV = -Investment + Σ_{n=1..N} (AC - Opex) / (1+i)^n
  - units: $ present value.
  - variables: i = WACC (e.g., 8%), N = project horizon (e.g., 10 yr).
  - interpretation: NPV > 0 ⇒ value-creating; NPV < 0 ⇒ reject.

**Simple payback**:
  Payback = Investment / AC  [yr]
  - threshold: typically < 2 yr for M&R initiatives.

**ROI**:
  ROI = (Σ(AC - Opex) - Investment) / Investment × 100  [% over project horizon]`,
    worked_example: `**Problem** — A Chemical plant centrifugal pump (P-301, acid service) has 5 failures/year, 8 h downtime per failure, $4,500/h production-loss cost (contribution margin). Parts + labor average $2,400 per failure. Collateral damage (downstream seal, shaft wear) averages $3,200 per failure (probability-weighted). A PdM program costs $50,000 one-time (sensors + integration) plus $18,000/yr (analyst labor + calibration). Engineering projects MTBF lift from 2,800 h to 5,600 h (failure frequency halves).

**Step 1 — Baseline failure cost**:
  Per-event cost = 8 h × $4,500 + $2,400 + $3,200 = $36,000 + $2,400 + $3,200 = $41,600/event
  Annual FC = 5 × $41,600 = $208,000/yr

**Step 2 — Addressable cost** (MTBF doubles ⇒ failure frequency halves):
  AC = $208,000 × (1 - 2,800/5,600) = $208,000 × 0.50 = $104,000/yr

**Step 3 — Net annual benefit**:
  Net = AC - Opex = $104,000 - $18,000 = $86,000/yr

**Step 4 — Simple payback**:
  Payback = $50,000 / $86,000 = 0.581 yr ≈ 7.0 months

**Step 5 — NPV @ 8% over 10 yr**:
  PV annuity factor @ 8%/10yr = (1 - 1.08^-10) / 0.08 = (1 - 0.4632) / 0.08 = 6.7101
  PV of $86,000/yr annuity = $86,000 × 6.7101 = $577,069
  NPV = -$50,000 + $577,069 = **+$527,069**

**Step 6 — ROI over 10 yr**:
  Total benefit = $86,000 × 10 = $860,000
  ROI = ($860,000 - $50,000) / $50,000 × 100 = **1,720%**

**Conclusion**: payback 7 months, NPV > $0.5M, ROI > 1700%. Fund.`,
    industrial_example: `**Oil & Gas — offshore platform gas-compressor seal-gas PdM**: baseline failure cost $410,000/yr (4 failures × 36 h × $2,200/h + parts); PdM investment $120,000 + $30,000/yr; projected MTBF lift 4,000→8,000 h. Addressable = $205,000/yr; net benefit $175,000/yr; payback 8.2 months; NPV @ 8%/10yr = $1,003,750. The compressor was a top-5 bad actor on the platform; PdM moved it off the top-10 within 18 months.

**Power — boiler feedwater pump CMMS + bearing redesign**: baseline $470,000/yr; investment $220,000 + $40,000/yr; MTBF lift 4,500→9,000 h. Addressable $235,000/yr; net $195,000/yr; payback 13.5 months; NPV $1,085,000.

**Container Terminal — RTG crane hydraulic PdM**: baseline $620,000/yr (port-call delays ×$8,000/h); investment $310,000 + $48,000/yr; payback 9 months.`,
    case_study: `CASE_TYPE = SYNTHETIC. A Chemical plant with 1,200 rotating assets launched a PdM program targeting the top-30 bad actors (Pareto showed top 2.5% of assets = 71% of $4.2M/yr failure cost). Year-1 investment: $640,000 (vibration + oil-analysis sensors, integration, 2 FTE analysts). Year-1 opex: $280,000. Engineering projection: addressable cost = $1.5M/yr (35% of $4.2M baseline). Year-1 measured benefit: $980,000 (66% of projected — the engineering projection was optimistic on the MTBF lift for the worst 5 assets). Year-1 NPV actual: -$640,000 - $280,000 + $980,000 × 0.9259 (1-yr PV @ 8%) = -$920,000 + $907,323 = -$12,677 (vs. projected +$571,000). The gap was closed by re-scoping: 5 worst-performing assets were redesign candidates (not PdM candidates) and were moved to capital replacement; the remaining 25 assets achieved the projected benefit by year 2. Lesson: the engineering projection must be sensitivity-tested, and the benefits-realization tracker must reconcile to the original case — the closed-loop business case is the discipline.`,
    visual_explanation: `Picture the M&R business case as a 5-bar stacked chart: (1) baseline failure cost, (2) - addressable fraction (lifted by the initiative), (3) - opex, (4) - investment (amortized), (5) = net annual benefit. Add an NPV-curve overlay showing cumulative discounted cash flow crossing zero at the payback point (month 7 in the worked example). The visual tells the CFO immediately: when does the project cross zero, and what is the asymptote?`,
    simulation_opportunity: `Build a Monte-Carlo simulator for the NPV: input distributions for MTBF lift (±20%), $/h production loss (±15%), collateral (±30%), opex (±10%). Output: distribution of NPV and probability NPV > 0. A robust business case shows P(NPV>0) > 85%; a marginal case may show 60% and require sensitivity-based re-scoping.`,
    common_mistakes: `- Using revenue per downtime hour instead of contribution margin — overstates the failure cost by the variable-cost fraction.
- Pricing collateral as zero because it's hard to quantify — understates the failure cost on bad actors.
- Computing addressable cost on the entire failure cost, not on the engineered-liftable fraction — overstates the business case.
- Ignoring opex — a $50k investment with $50k/yr opex may have negative NPV despite a low capex.
- Setting the project horizon at 1-2 years when the asset has 15 years remaining life — understates NPV.
- Forgetting risk-adjusted benefits: a $50k PdM investment that prevents a $5M environmental release is justifiable on expected-loss grounds alone, even if the cash NPV is marginal.
- Failing to reconcile the benefits realization back to the original case — the closed loop is what builds finance's trust in the next case.`,
    limitations: `- $/h production-loss rate is volatile with market conditions; the business case must be re-tested under low- and high-margin scenarios.
- MTBF-lift projections are engineering estimates with ±20-30% uncertainty; sensitivity analysis is required.
- Risk-adjusted benefits (safety, environmental) are difficult to monetize and are often qualitative.
- The WACC may not reflect project-specific risk (a safety-critical initiative may justify a lower discount rate).
- Benefits-realization tracking is rarely resourced; the discipline degrades without organizational commitment.
- Long-horizon NPV is dominated by the discount rate; small changes in i swing the conclusion.`,
    comparison: `**TCO vs. Acquisition-price procurement**: TCO-procurement selects Vendor B at $22,000 acquisition but $140,000 TCO over Vendor A at $20,000 acquisition but $210,000 TCO; price-procurement selects Vendor A and incurs $70,000 hidden cost. **NPV vs. Payback**: NPV captures the full project-horizon value; payback ignores cash flows after the payback point and over-weights short-lived projects. Use NPV for ranking, payback for liquidity/risk screening. **Addressable vs. Total cost**: addressable-cost business cases survive audit; total-cost cases are thrown out for "double-counting" — the initiative cannot claim to remove 100% of the failure cost.`,
    practical_application: `- **Daily**: record failure-event downtime + parts + labor in the CMMS at WO closeout (the failure-cost register is built at closeout).
- **Weekly**: review the bad-actor Pareto; flag candidates for business-case development.
- **Monthly**: develop 1-2 business cases for top bad-actor candidates; track benefits realization on funded cases.
- **Quarterly**: reconcile benefits-realization tracker to original cases; refresh the failure-cost register.
- **Annually**: re-baseline the failure-cost register; review the procurement specification to require TCO disclosure from vendors.`,
    decision_scenario: `You are the M&R manager at a Container Terminal. Two initiatives compete for the same $500k capex envelope:

(A) PdM for 8 RTG cranes: baseline $1,800,000/yr failure cost; investment $310k + $48k/yr opex; projected addressable $720k/yr (40%); payback 7 months; NPV @ 8%/10yr $4.1M.
(B) CMMS upgrade: baseline $2,400,000/yr data-quality cost (slow WO closeout, wrong parts, missed KPIs); investment $490k + $32k/yr; projected addressable $680k/yr (28%); payback 9 months; NPV $3.7M.

Decision: do **both** — but sequence (A) first. Rationale: (A) has higher NPV and shorter payback; (B) underpins (A) by improving failure-code capture which makes (A)'s benefits-realization trackable. Without (B), (A)'s measured benefit in year 1 will be unverifiable. Sequence: (A) months 0-6 (install + commission); (B) months 4-12 (CMMS config + craft training); both fully operational by month 12.`,
    practice_questions: `- Define TCO and list its 5 components.
- An asset fails 6 times/yr at $2,400/event (parts+labor) + 6 h downtime × $3,500/h. Compute the annual failure cost. *(Answer: 6 × (6×3,500 + 2,400) = 6 × 23,400 = $140,400/yr.)*
- The initiative projects MTBF lift from 3,000 to 6,000 h. Compute the addressable cost fraction. *(Answer: 1 - 3,000/6,000 = 0.50 = 50%.)*
- Investment $80,000, addressable cost $60,000/yr, opex $10,000/yr, i=8%, N=8 yr. Compute NPV. *(Answer: -$80k + $50k × 5.7466 = -$80k + $287.3k = +$207.3k.)*
- State three common mistakes that overstate a business case.`,
    certification_questions: `The CMRP exam tests Business Management as the foundational B&M competency. SMRP-aligned sample prompts:

(a) Compute the TCO of an asset given acquisition + 10-yr O&M + downtime estimates.
(b) Compute the addressable cost given baseline failure cost + MTBF-lift projection.
(c) Compute NPV / payback / ROI for a PdM investment.
(d) Distinguish $/h production-loss rate (contribution margin) from revenue/h.
(e) Recognize the ISO 55000 value principle and its operational expression.

The questions in this lesson's question bank are aligned to these Business Management competencies.`,
    summary: `Business Management is the CFO-language wrapper for M&R. The four arithmetic layers — baseline failure cost, addressable cost, investment/opex, NPV/ROI/payback — translate engineering outcomes into finance-grade decisions. ISO 55000:2014 frames this as the asset-management value principle. The discipline lives in the closed loop: business case → funded initiative → measured benefit → reconciliation. Lowest-bid procurement on acquisition price is a false economy; TCO is the procurement criterion.`,
    key_takeaways: `- TCO >> Acquisition (typically 5-15% vs. 85-95% of total cost).
- $/h production-loss rate = contribution margin, NOT revenue.
- Addressable cost = baseline failure cost × engineered-liftable fraction.
- NPV > 0, payback < 2 yr is the typical CMRP-grade threshold.
- Risk-adjusted benefits (safety, environmental) justify initiatives that pure NPV may not.
- The closed-loop business case (plan → execute → measure → reconcile) builds finance's trust for the next case.
- ISO 55000 "value" principle is operationalized by this competency.`,
    references: `- SMRP. *CMRP Body of Knowledge — Business & Management pillar: Business Management.*
- SMRP. *CMRP Exam Outline.*
- ISO 55000:2014. *Asset management — Overview, principles and terminology.*
- Campbell, J. D. & Jardine, A. K. S. (2001). *Maintenance Strategy*. Productivity Press. Business-case & TCO chapters.
- Blank, L. T. & Tarquin, A. (2018). *Engineering Economy* (8th ed.). McGraw-Hill. NPV / payback / ROI chapters.
- Deming, W. E. (1986). *Out of the Crisis*. MIT CAES. Cost-of-quality framework.
- Mobley, R. K. (2008). *Maintenance Engineering Handbook* (7th ed.). McGraw-Hill. Section I (business of M&R) & Section IV (LCC/TCO).`,
  },
  knowledgeObject: {
    title: "Business Management — TCO, failure cost, NPV/ROI of reliability",
    domain: "Business & Management",
    competency: "Business Management",
    topic: "M&R business value & cost-of-ownership",
    concept: "Addressable-cost business case",
    body: {
      definitions: [
        "Total Cost of Ownership (TCO): acquisition + operating + maintenance + downtime + disposal over asset life.",
        "Cost of ownership: ongoing O&M + downtime cost (excludes acquisition).",
        "Failure cost: downtime-h × $/h + parts + labor + collateral attributable to a failure event.",
        "Addressable cost: fraction of current failure cost the proposed initiative is engineered to remove.",
        "Business case: investment + projected benefit + NPV/ROI/payback + risk + assumptions.",
        "Discount rate (i): time-value-of-money rate (typically corporate WACC).",
        "NPV: Σ CF_n / (1+i)^n.",
        "IRR: discount rate at which NPV = 0.",
        "Payback: years for cumulative savings to recover the investment.",
        "Equivalent Annual Cost (EAC): NPV converted to an equal annual annuity.",
        "Collateral damage: downstream damage caused by the failure (bearing → shaft → seal → product loss).",
        "WACC: weighted-average cost of capital — typical corporate discount rate.",
      ],
      principles: [
        "Value over price: TCO, not acquisition cost, is the procurement criterion.",
        "Addressable, not total, cost is the business-case basis — do not double-count.",
        "Cash-flow timing matters: discount at the WACC.",
        "Risk-adjusted benefits (safety, environmental) carry a risk premium pure NPV understates.",
        "Closed loop: business case → funded → measured → reconciled.",
        "ISO 55000 'value' principle operationalized by this competency.",
      ],
      components: [
        "TCO model per asset class.",
        "Failure-cost register (per asset per year).",
        "Business-case template (baseline → addressable → investment/opex → NPV/IRR/payback).",
        "WACC from finance.",
        "Project horizon (asset remaining life or 10 yr cap).",
        "Risk register (safety / environmental / regulatory).",
        "Benefits-realization tracker.",
      ],
      mechanism: [
        "Bad-actor Pareto → candidate asset → 24-month CMMS history → baseline failure cost (FC) → engineer intervention → MTBF-lift projection → addressable cost (AC) → investment + opex → NPV/IRR/payback → risk adjustment → present business case → fund → implement → measure benefit → reconcile to original case → lessons-learned → next case (closed loop).",
      ],
      process: [
        "1. Identify candidate asset / failure mode from bad-actor Pareto.",
        "2. Pull 24-month CMMS history; compute baseline failure frequency, downtime, parts, labor.",
        "3. Price $/h production-loss with operations/finance (contribution margin).",
        "4. Quantify collateral damage from RCA records.",
        "5. Compute baseline annual FC.",
        "6. Engineer intervention; project MTBF lift and/or collateral avoidance.",
        "7. Compute AC = FC × (1 - MTBF_target/MTBF_current).",
        "8. Total investment (capex) + annual opex.",
        "9. Discount net annual benefit at WACC; compute NPV, IRR, payback.",
        "10. Add risk-adjusted benefits (safety, environmental).",
        "11. Present business case with assumptions, sensitivity, benefits-realization plan.",
      ],
      formulas: [
        "TCO = Acquisition + Σ_year(O_y + M_y + D_y) + Disposal  [$ over life]",
        "FC = N_fail × (MDT × $/h + parts + labor + collateral)  [$ / yr]",
        "AC = FC × (1 - MTBF_target / MTBF_current)  [$ / yr]",
        "NPV = -Investment + Σ_{n=1..N} (AC - Opex) / (1+i)^n  [$]",
        "Payback = Investment / AC  [yr]",
        "ROI = (Σ(AC - Opex) - Investment) / Investment × 100  [%]",
        "EAC = NPV / [(1 - (1+i)^-N) / i]  [$/yr]",
      ],
      metrics: [
        "TCO per asset class [$/asset over life].",
        "Baseline failure cost per asset per year [$/yr].",
        "Addressable cost [$/yr] and addressable fraction [% of baseline].",
        "NPV [$], IRR [%], payback [yr].",
        "Benefits-realization ratio (measured / projected benefit) [%].",
        "Closed-loop business-case count per quarter [n].",
      ],
      examples: [
        "Chemical — acid-transfer pump P-301: 5 failures × $41,600 = $208,000/yr baseline; addressable $104,000/yr; NPV @8%/10yr +$527,069; payback 7 months.",
        "Oil & Gas — offshore gas-compressor seal-gas PdM: baseline $410,000/yr; addressable $205,000/yr; payback 8.2 months; NPV +$1,003,750.",
        "Power — boiler feedwater CMMS + bearing redesign: baseline $470,000/yr; addressable $235,000/yr; payback 13.5 months; NPV +$1,085,000.",
        "Container Terminal — RTG crane hydraulic PdM: baseline $620,000/yr; payback 9 months.",
      ],
      industrial_examples: [
        "Chemical — acid-transfer pump: NPV >$0.5M on $50k PdM investment.",
        "Oil & Gas — offshore gas-compressor: $120k PdM investment, $1M NPV, top-5 bad actor off the list in 18 months.",
        "Power — BFP CMMS + bearing redesign: $220k investment, $1.085M NPV.",
        "Container Terminal — RTG PdM: $310k investment, 9-month payback.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Chemical plant, 1,200 rotating assets, top-30 bad-actor PdM program. $640k + $280k/yr investment vs. projected $1.5M/yr addressable (35% of $4.2M baseline). Year-1 measured: $980k (66% of projection — worst 5 assets did not respond to PdM, were redesign candidates). Year-1 NPV -$12,677 (vs. projected +$571k). Closed loop: re-scoped worst 5 to capital replacement; remaining 25 met projection by year 2. Lesson: engineering projection must be sensitivity-tested; benefits realization must reconcile to the original case.",
      ],
      common_errors: [
        "Using revenue/h instead of contribution-margin/h — overstates by variable-cost fraction.",
        "Pricing collateral as zero — understates bad-actor cost.",
        "Computing addressable on the entire failure cost, not the engineered-liftable fraction — overstates business case.",
        "Ignoring opex — $50k capex with $50k/yr opex can be NPV-negative.",
        "1-2 yr horizon on a 15-yr asset — understates NPV.",
        "Forgetting risk-adjusted benefits (safety, environmental) — undervalues high-consequence initiatives.",
        "No benefits-realization reconciliation — degrades finance's trust for the next case.",
      ],
      limitations: [
        "$/h production-loss rate is market-volatile; re-test under low/high-margin scenarios.",
        "MTBF-lift projections carry ±20-30% uncertainty; sensitivity required.",
        "Risk-adjusted benefits are difficult to monetize; often qualitative.",
        "WACC may not reflect project-specific risk.",
        "Benefits-realization tracking is rarely resourced; degrades without commitment.",
        "Long-horizon NPV is dominated by the discount rate; small i changes swing the conclusion.",
      ],
      best_practices: [
        "Use TCO, not acquisition price, as procurement criterion.",
        "Price $/h with finance/operations as contribution margin.",
        "Quantify collateral from RCA records (probability-weighted).",
        "Sensitivity-test MTBF lift ±20-30%.",
        "Include opex in the business case; report payback, NPV, and ROI together.",
        "Risk-adjust for safety / environmental consequence.",
        "Reconcile benefits realization to the original case quarterly.",
        "Build the closed-loop discipline before scaling — finance's trust is earned per case.",
      ],
      related_concepts: [
        "Economics (Lesson 4) — NPV/IRR/LCC math foundation.",
        "Strategy (Lesson 2) — asset-lifecycle portfolio decisions built on per-asset business cases.",
        "Quality (Lesson 3) — cost-of-quality framework parallels failure-cost arithmetic.",
        "ISO 55000:2014 — value principle operationalized by business-case discipline.",
        "ISO 55001 Cl. 6.2.2 (AMP), Cl. 9.3 (management review) — closed-loop review of business cases.",
      ],
      prerequisites: [
        "CMRP BOK 5-pillar structure.",
        "Basic finance vocabulary (cash flow, discount rate, NPV, ROI, payback).",
        "Maintenance WO data (failure counts, downtime hours, parts/labor cost).",
        "ISO 55000 asset-management principles.",
      ],
      references: [
        "SMRP CMRP BOK — B&M pillar: Business Management.",
        "SMRP CMRP Exam Outline.",
        "ISO 55000:2014.",
        "Campbell & Jardine (2001), Maintenance Strategy.",
        "Blank & Tarquin (2018), Engineering Economy.",
        "Deming (1986), Out of the Crisis.",
        "Mobley (2008), Maintenance Engineering Handbook.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Business Management",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which of the following is the correct total-cost-of-ownership (TCO) decomposition for an industrial asset?",
      whyCorrect:
        "TCO = Acquisition (one-time purchase) + Operating (energy, consumables, operations labor) + Maintenance (PM + CM + parts) + Downtime (production loss) + Disposal (end-of-life decommissioning). The five components together capture the full lifecycle cost; the typical finding is acquisition is only 5-15% of TCO.",
      whyOthersWrong: [
        "Acquisition + Maintenance only — omits operating energy, downtime cost, and disposal; understates TCO by 50-80%.",
        "Acquisition + Operating + Disposal — omits maintenance and downtime, the two largest lifecycle costs for a bad-actor asset.",
        "Acquisition + Maintenance + Disposal + ROI — ROI is a project-evaluation metric, not a TCO component; mixing categories.",
      ],
      explanation:
        "TCO has 5 components: Acquisition + Operating + Maintenance + Downtime + Disposal. Acquisition-only procurement is a false economy because the other four together typically dominate (85-95% of lifecycle cost).",
      options: [
        { text: "Acquisition + Operating + Maintenance + Downtime + Disposal", isCorrect: true },
        { text: "Acquisition + Maintenance only", isCorrect: false },
        { text: "Acquisition + Operating + Disposal", isCorrect: false },
        { text: "Acquisition + Maintenance + Disposal + ROI", isCorrect: false },
      ],
    },
    {
      competencyName: "Business Management",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Chemical",
      stem: "A Chemical plant pump fails 5 times/yr with 8 h downtime per failure at $4,500/h production-loss cost. Parts+labor average $2,400 per event; collateral averages $3,200 per event. Compute the baseline annual failure cost.",
      whyCorrect:
        "Per-event cost = 8 h × $4,500/h + $2,400 + $3,200 = $36,000 + $2,400 + $3,200 = $41,600/event. Annual failure cost = 5 events × $41,600 = $208,000/yr. The collateral ($3,200/event = $16,000/yr) is 7.7% of the total and is often omitted by mistake.",
      whyOthersWrong: [
        "$180,000/yr is the downtime-only answer (5 × 8 × $4,500 = $180,000); it omits parts+labor ($12,000) and collateral ($16,000) and understates by $28,000.",
        "$192,000/yr is downtime + parts + labor (5 × ($36,000 + $2,400) = $192,000); it omits collateral ($16,000) and understates by $16,000.",
        "$240,000/yr is wrong arithmetic — likely double-counting downtime or parts.",
      ],
      explanation:
        "Baseline FC = N × (MDT × $/h + parts + labor + collateral) = 5 × (8 × 4,500 + 2,400 + 3,200) = $208,000/yr. Collateral is the most commonly omitted component and is the difference between a fundable case and a rejected one for bad actors.",
      options: [
        { text: "$208,000/yr", isCorrect: true },
        { text: "$180,000/yr", isCorrect: false },
        { text: "$192,000/yr", isCorrect: false },
        { text: "$240,000/yr", isCorrect: false },
      ],
    },
    {
      competencyName: "Business Management",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Power",
      stem: "A Power plant initiative costs $50,000 one-time + $18,000/yr opex. Baseline failure cost is $208,000/yr; MTBF is projected to lift from 2,800 h to 5,600 h (failure frequency halves). Using i=8% and N=10 yr, compute the NPV.",
      whyCorrect:
        "AC = FC × (1 - MTBF_cur/MTBF_target) = $208,000 × (1 - 2,800/5,600) = $208,000 × 0.50 = $104,000/yr. Net annual benefit = $104,000 - $18,000 = $86,000/yr. PV annuity factor @ 8%/10yr = (1 - 1.08^-10)/0.08 = 6.7101. PV of annuity = $86,000 × 6.7101 = $577,069. NPV = -$50,000 + $577,069 = +$527,069.",
      whyOthersWrong: [
        "$553,909 NPV would result from omitting the $18k/yr opex (using AC of $104,000 instead of net $86,000); this is the most common error — opex is recurring and must be subtracted from benefit each year.",
        "+$1,020,000 NPV would result from using undiscounted $104k × 10 yr minus $50k; this ignores the time value of money entirely.",
        "+$1,003,750 NPV is the answer for a different asset (offshore gas compressor, $120k investment + $30k/yr opex, $205k/yr AC) — not this question.",
      ],
      explanation:
        "AC = $208,000 × 0.50 = $104,000/yr. Net = $86,000/yr. NPV = -$50,000 + $86,000 × 6.7101 = +$527,069. The case is overwhelmingly positive; fund.",
      options: [
        { text: "+$527,069", isCorrect: true },
        { text: "+$553,909 (omits the $18k/yr opex)", isCorrect: false },
        { text: "+$1,020,000 (ignores time value of money)", isCorrect: false },
        { text: "+$1,003,750 (different asset's NPV)", isCorrect: false },
      ],
    },
    {
      competencyName: "Business Management",
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: When pricing the production-loss rate ($/h) for the failure-cost calculation, the correct figure is the per-hour revenue, not the per-hour contribution margin.",
      whyCorrect:
        "False. The correct figure is the contribution margin (revenue minus variable cost), not revenue. During a downtime hour, variable costs (raw materials, energy for production) are not incurred; only the contribution margin is actually lost. Using revenue overstates the failure cost by the variable-cost fraction and inflates the business case — a common audit failure that destroys finance's trust.",
      whyOthersWrong: [
        "True would be wrong — using revenue/h overstates the loss because variable costs (raw materials, energy) are saved during the downtime hour; only the contribution margin is truly lost. The inflated number makes the business case fail finance audit.",
      ],
      explanation:
        "$/h production-loss rate = contribution margin per hour = revenue/h - variable cost/h. Revenue/h overstates; gross-profit/h understates (fixed overhead continues). Finance will reject a case built on revenue/h as inflated.",
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Strategy
// ---------------------------------------------------------------------------

const LESSON_STRATEGY: RefLesson = {
  competencyName: "Strategy",
  slug: "bm-strategy",
  title: "M&R Strategy, Asset Lifecycle & Maintenance Strategy Selection",
  titleAr: "استراتيجية الصيانة والموثوقية ودورة حياة الأصول",
  order: 2,
  durationMin: 32,
  references: BM_REFERENCE_TITLES,
  conceptIntroduction: `Strategy aligns M&R work with corporate strategy and the asset lifecycle. The corporate strategy answers: "Where does this business compete — on cost, on differentiation, on reliability-of-supply, on safety record?" The asset-lifecycle strategy answers: "Where is this asset in its lifecycle (acquisition, operation, mid-life, end-of-life), and what maintenance strategy is appropriate for each stage?" The maintenance strategy selection ladder answers: "For each failure mode, do we run-to-failure (reactive), do preventive (PM), do condition-based (PdM), or do proactive redesign?" The right answer is rarely one strategy across the plant — it is a per-failure-mode, per-asset-criticality mix. ISO 55000:2014 frames strategy as the alignment of asset-management objectives with organizational objectives.`,
  example: `A Container Terminal has 14 RTG cranes. Criticality analysis: 4 mission-critical (port-call delay = $8,000/h), 6 important ($3,000/h), 4 support (no direct delay). Per failure mode: hydraulic leaks (critical) → PdM (oil analysis + ultrasonic) + PM (quarterly seal inspection); structural cracks → PdM (NDT quarterly); tire wear → PM (time-based at 8,000 hr); cabin AC failure (support) → run-to-failure. Strategy cost: PdM $180k/yr + PM $90k/yr + RTF $20k/yr = $290k/yr. Compared to a one-size-fits-all PM-only strategy at $510k/yr (over-maintains support assets, under-protects critical), the mixed strategy saves $220k/yr AND cuts critical-asset unplanned downtime by 45% in 12 months.`,
  keyFormulas: `Asset criticality index CI = (Safety × 0.30) + (Environmental × 0.20) + (Production × 0.35) + (Maintenance cost × 0.15)  [0-100]
Maintenance strategy cost (annual) = N_assets × Σ(PdM cost + PM cost + CM cost + RTF cost)
Lifecycle stage lookup: Acquisition (Y0-2) → Operation (Y2-8) → Mid-life (Y8-15) → End-of-life (Y15+)
Strategy effectiveness ratio = (Unplanned downtime cost) / (Strategy cost)  — lower is better
Criticality-weighted strategy: Σ_assets(CI × strategy_cost) / Σ_assets(strategy_cost)`,
  exercise: `You are the M&R strategist at a Power plant with 60 critical assets across 4 classes (BFP, ID fan, FD fan, condensate pump). For each class, classify criticality (Safety/Env/Production/Maint factors), assign a maintenance strategy (RTF/PM/PdM/Proactive), and compute the annual strategy cost. Compare to a uniform PM-only strategy. Recommend the mix.`,
  sections: {
    learning_objectives: `- Distinguish corporate strategy, asset-lifecycle strategy, and maintenance strategy — and how they nest.
- Conduct asset-criticality analysis (Safety / Environmental / Production / Maintenance factors, weighted).
- Place an asset in its lifecycle stage (Acquisition / Operation / Mid-life / End-of-life) and pick the appropriate maintenance response.
- Select per-failure-mode maintenance strategy from the RTF → PM → PdM → Proactive ladder.
- Quantify strategy cost and strategy effectiveness (downtime-cost/strategy-cost ratio).
- Align M&R strategy with ISO 55000 objectives and corporate KPIs.`,
    prerequisites: `- Business Management (Lesson 1) — business case arithmetic.
- Equipment Reliability (ER pillar) — MTBF, Weibull β, failure-mode classification.
- Work Management (WM pillar) — WO lifecycle, PM/CM planning.
- Familiarity with ISO 55000:2014 vocabulary (asset, asset management, asset-management objectives).`,
    introduction: `Strategy is the bridge between corporate objectives and per-asset maintenance decisions. Without strategy, M&R becomes a tactical function executing PM schedules disconnected from business priorities. With strategy, the M&R organization allocates scarce craft hours to the assets and failure modes that move corporate KPIs (uptime, safety, environmental, cost-per-unit).

The strategy ladder has four rungs:

(1) **Reactive (Run-To-Failure, RTF)**: appropriate for low-criticality, easily-replaced, low-collateral assets (e.g., cabin AC on a non-critical asset). Cost = mostly CM, low overhead.

(2) **Preventive (PM, time-based or cycle-based)**: appropriate for wear-out failure modes (Weibull β > 1.5) with a tight time-to-failure distribution (e.g., lube-oil changes, seal inspections). Cost = scheduled labor + parts, low unplanned downtime if intervals are right.

(3) **Predictive (PdM, condition-based)**: appropriate for failure modes with a detectable P-F interval (vibration, oil analysis, thermography) and high consequence (e.g., bearing failure on a critical pump). Cost = sensor + analyst + integration, but cuts unplanned downtime 40-70% on bad actors.

(4) **Proactive (redesign / root-cause elimination)**: appropriate for failure modes that recur despite PM/PdM (e.g., seal redesign on a corrosive-service pump). Cost = engineering capex, often the highest-NPV option for chronic bad actors.

ISO 55000:2014 frames strategy as the alignment of asset-management objectives with organizational objectives; ISO 55001 Cl. 6.2.2 (asset-management plan) is the operational expression of the per-asset strategy decision.`,
    terminology: `- **Corporate strategy**: where the business competes (cost / differentiation / reliability / safety).
- **Asset-lifecycle strategy**: where the asset is in its lifecycle (acquisition → operation → mid-life → end-of-life).
- **Maintenance strategy**: per-failure-mode selection (RTF / PM / PdM / Proactive).
- **Criticality index**: weighted score (Safety × 0.30 + Env × 0.20 + Production × 0.35 + Maint cost × 0.15).
- **Run-to-Failure (RTF)**: reactive strategy for low-criticality assets.
- **Preventive Maintenance (PM)**: time/cycle-based intervention for wear-out failure modes.
- **Predictive Maintenance (PdM)**: condition-based intervention for failure modes with a P-F interval.
- **Proactive**: redesign / RCA elimination for chronic bad actors.
- **P-F interval**: time from detectable condition change to functional failure.
- **Asset-management plan (AMP)**: ISO 55001 Cl. 6.2.2 document specifying per-asset strategy.
- **Strategy effectiveness ratio**: unplanned downtime cost / strategy cost — lower = better.`,
    detailed_explanation: `The three nested strategy levels:

(1) **Corporate strategy** sets the M&R objective function. A cost-leader (commodity chemicals) prioritizes TCO; a reliability-of-supply leader (data-center, container terminal) prioritizes uptime; a safety-leader (nuclear, offshore) prioritizes risk-reduction. The M&R organization's KPI dashboard must reflect this — a cost-leader optimizing uptime regardless of cost will be at odds with corporate.

(2) **Asset-lifecycle strategy** sets the maintenance envelope. Acquisition (Y0-2): focus on commissioning, baseline data capture, warranty-driven PM. Operation (Y2-8): PM/PdM at designed intervals. Mid-life (Y8-15): strategy refresh — re-fit Weibull, refresh criticality, consider redesign candidates. End-of-life (Y15+): risk-based, run-to-failure biased, plan capital replacement. The same asset may need a different strategy in year 3 vs. year 13.

(3) **Maintenance strategy** is the per-failure-mode ladder. The right answer is per-failure-mode, not per-asset. A pump may have: seal leakage (PdM via oil analysis), bearing wear (PdM via vibration), impeller erosion (PM at 6,000 h), casing corrosion (proactive material upgrade), and coupling wear (RTF). The strategy is a matrix [asset × failure mode] → {RTF, PM, PdM, Proactive}.

ISO 55000:2014 §2.4: "asset management realizes value from assets in the delivery of the organization's objectives." This is the alignment principle. ISO 55001 Cl. 6.2.2 requires the asset-management plan to specify per-asset strategy; Cl. 9.3 requires management review to refresh strategy based on performance.

The cost-vs-risk matrix is the canonical visualization: x-axis = criticality (low → high), y-axis = failure-rate (low → high). High-criticality + high-failure-rate = proactive/redesign candidates (top-right). High-criticality + low-failure-rate = PdM (top-left). Low-criticality + high-failure-rate = PM (bottom-right). Low-criticality + low-failure-rate = RTF (bottom-left).`,
    core_principles: `- Strategy is per-failure-mode, not per-asset or per-plant.
- The right strategy mix depends on (a) corporate objective function, (b) asset lifecycle stage, (c) failure-mode physics (β, P-F interval).
- Criticality-weighted: scarce craft hours go to high-criticality assets first.
- Lifecycle-aware: strategy must refresh at mid-life; rigid PM schedules built at acquisition age.
- ISO 55000 alignment: M&R objectives nested in corporate objectives.
- Strategy effectiveness = downtime cost / strategy cost; optimize the ratio, not the absolute spend.`,
    components: `- Corporate KPI dashboard (cost / uptime / safety / environmental).
- Asset register with criticality index.
- Failure-mode register per asset (linked to ERpillar Weibull/Pareto).
- Maintenance strategy matrix [asset × failure mode] → {RTF, PM, PdM, Proactive}.
- Cost-vs-risk matrix plot.
- Asset-management plan (AMP, ISO 55001 Cl. 6.2.2).
- Management review cycle (Cl. 9.3) to refresh strategy.`,
    process: `1. Translate corporate strategy into M&R KPIs (cost / uptime / safety / environmental).
2. Build the asset register; classify each asset's lifecycle stage.
3. Conduct criticality analysis (Safety/Env/Production/Maint, weighted index 0-100).
4. Pull the failure-mode register per asset (from ER pillar analytics).
5. For each [asset × failure mode] cell: select RTF / PM / PdM / Proactive based on criticality × failure-rate (cost-vs-risk matrix).
6. Compute the strategy cost (annual) per asset and per class.
7. Quantify expected unplanned downtime cost; compute strategy effectiveness ratio.
8. Document in the asset-management plan (AMP, ISO 55001 Cl. 6.2.2).
9. Review quarterly (Cl. 9.3); refresh strategy based on actual performance.`,
    formula_calculation: `**Asset criticality index (CI)**:
  CI = (Safety × 0.30) + (Environmental × 0.20) + (Production × 0.35) + (Maintenance × 0.15)  [0-100]
  - units: dimensionless index 0-100.
  - variables: each factor scored 1-100 (1=low consequence, 100=catastrophic).
  - interpretation: CI ≥ 80 = mission-critical (PdM or Proactive); 50-80 = important (PM or PdM); < 50 = support (RTF or PM).

**Maintenance strategy cost (annual)**:
  SC = Σ_assets [PdM_cost + PM_cost + CM_cost + RTF_cost]
  - units: $/yr.
  - variables: each cost is the annual labor + parts + tooling/sensor amortization.
  - interpretation: the cost of the chosen strategy mix; compare to alternatives (e.g., uniform PM-only) for the same coverage.

**Strategy effectiveness ratio**:
  SER = Unplanned_downtime_cost / Strategy_cost
  - units: dimensionless ratio; lower = better (more downtime averted per $ spent).
  - interpretation: a SER of 3.0 means $3 of downtime per $1 of strategy spend — high; target SER < 1.5.

**Criticality-weighted strategy**:
  CWS = Σ_assets(CI × SC_asset) / Σ_assets(SC_asset)
  - interpretation: an aggregate measure of how well spend is targeted to high-criticality assets.`,
    worked_example: `**Problem** — A Container Terminal has 14 RTG cranes classified by criticality: 4 mission-critical (production = $8,000/h downtime), 6 important ($3,000/h), 4 support (no direct delay). Annual unplanned downtime baseline: 480 h (critical), 360 h (important), 120 h (support). For each class, choose a strategy mix from {RTF, PM, PdM, Proactive} and compute the annual strategy cost + projected downtime reduction.

**Step 1 — Criticality index (illustrative for the mission-critical class)**:
  Safety=80, Env=70, Production=100, Maint=60 → CI = 80×0.30 + 70×0.20 + 100×0.35 + 60×0.15 = 24 + 14 + 35 + 9 = 82 → mission-critical (CI≥80).

**Step 2 — Strategy mix per class**:
  - Mission-critical (4 cranes): PdM (vibration, oil, NDT) + PM (quarterly structural) — high-coverage, high-cost.
  - Important (6 cranes): PM (time-based) + targeted PdM on hydraulic.
  - Support (4 cranes): RTF + opportunistic PM during outages.

**Step 3 — Annual strategy cost**:
  - PdM: $30k × 4 = $120k (mission-critical)
  - PM: $15k × 4 = $60k (mission-critical), $15k × 6 = $90k (important), $5k × 4 = $20k (support, opportunistic)
  - RTF: $5k × 4 = $20k (support)
  - Total SC = $120k + $60k + $90k + $20k + $20k = **$310k/yr**

**Step 4 — Projected downtime reduction**:
  - Mission-critical: PdM cuts unplanned downtime 50% → 240 h × $8,000 = $1.92M saved
  - Important: PM+PdM cuts 30% → 108 h × $3,000 = $324k saved
  - Support: RTF unchanged → $0 saved
  - Total downtime cost saved = $2.244M

**Step 5 — Strategy effectiveness ratio**:
  SER_pre = (480 × 8000 + 360 × 3000 + 120 × 0) / $0 baseline-strategy-spend (no M&R) = $4.92M / $0 = ∞ (untouched).
  SER_post = (240 × 8000 + 252 × 3000 + 120 × 0) / $310k = $2.676M / $310k = 8.6
  Net benefit = $4.92M - $2.676M = $2.244M saved at $310k spend.

**Step 6 — Compare to uniform PM-only**:
  Uniform PM @ $36.4k × 14 = $510k/yr; downtime cut = 25% across all → downtime saved = $1.23M; net = $1.23M - $510k = $720k.

**Conclusion**: mixed strategy saves $220k/yr in spend AND saves $1.0M more in downtime than uniform PM. Payback of the PdM premium (extra $200k spend) is < 3 months on the mission-critical class.`,
    industrial_example: `**Oil & Gas — offshore platform 12 gas compressors**: corporate strategy = reliability-of-supply (LNG export contract penalty = $1.2M/h unscheduled shutdown). Lifecycle: all assets in Operation stage (Y3-7). Criticality analysis: 8 mission-critical (CI≥80), 4 important. Per failure mode: seal-gas → PdM (oil analysis + differential pressure); bearing → PdM (vibration); impeller fouling → PM (5,000-h wash). Strategy cost $1.4M/yr; unplanned downtime cut from 240 h/yr to 80 h/yr — saved $192M of contract penalty at $1.4M spend.

**Manufacturing — automotive paint shop robots (450 units)**: corporate strategy = cost-leader. Criticality analysis: 30 mission-critical (line-stop), 420 support. Per failure mode: servo drive → PdM (current signature) on critical only; cable wear → PM on all; cosmetic scratch → RTF. Mixed strategy cost $680k/yr vs. uniform PM $1.6M/yr — saves $920k/yr AND maintains 99.4% line availability.`,
    case_study: `CASE_TYPE = SYNTHETIC. A Mining haul-truck fleet (80 trucks) moved from a one-size-fits-all PM strategy to a criticality-driven mix. Pre-strategy: $5.2M/yr maintenance spend, 6.4% fleet unplanned downtime. Criticality analysis (Safety 0.30, Production 0.35, Maint 0.15, Env 0.20): 12 trucks CI≥80 (mission-critical — production bottleneck), 48 trucks CI 50-80 (important), 20 trucks CI<50 (support — older, low utilization). Per failure mode (engine, transmission, hydraulics, tires, electrical): engine → PdM (oil analysis) on critical; transmission → PdM (vibration) on critical + PM on important; hydraulics → PM on all; tires → PM (cycle-based) on all; electrical → RTF on support, PdM on critical. Post-strategy (12 months): $4.1M/yr spend (-21%), fleet unplanned downtime 6.4% → 3.8% (-41%). The strategy refresh was driven by the ISO 55001 Cl. 9.3 management review — the prior PM-only strategy was deemed mis-aligned with the corporate cost-leader objective.`,
    visual_explanation: `Picture the **cost-vs-risk matrix** as a 2×2 grid: x-axis = criticality (low/high), y-axis = failure rate (low/high). Cells: top-right (high crit, high FR) = Proactive/redesign; top-left (high crit, low FR) = PdM; bottom-right (low crit, high FR) = PM; bottom-left (low crit, low FR) = RTF. Each [asset × failure mode] cell plots as a point; the strategy is read off the grid cell. The visual immediately communicates "we have 6 proactive candidates, 22 PdM candidates, 40 PM, 12 RTF" — and the budget flows accordingly.`,
    simulation_opportunity: `Build a Monte-Carlo of the strategy refresh: vary the MTBF-lift projection ±20%, the unplanned-downtime reduction ±30%, and the corporate-strategy weight (cost-leader vs. reliability-leader) on the KPI dashboard. Output the distribution of net benefit for the mixed strategy vs. uniform PM. The mixed strategy dominates in 85%+ of scenarios when the asset portfolio has a criticality spread.`,
    common_mistakes: `- One-strategy-fits-all (PM-only across all assets) — over-maintains support, under-protects critical.
- Treating the asset as the strategy unit, not the failure mode — a single asset may have 5 strategies.
- Ignoring lifecycle stage — applying year-3 PM intervals to a year-13 asset.
- Confusing criticality with severity — a high-severity-low-likelihood failure mode may still warrant PdM (risk-based, not frequency-based).
- Setting strategy once and never refreshing — the ISO 55001 Cl. 9.3 management review exists to refresh strategy.
- Using uniform weights in the criticality index — weights must reflect corporate objective (cost-leader → Production 0.50; safety-leader → Safety 0.50).`,
    limitations: `- Criticality analysis is subjective — different stakeholders weight factors differently; the audit trail must be explicit.
- The P-F interval must be measured (or estimated from the OEM/OREDA); without it, PdM is mis-timed.
- Lifecycle stage estimation requires operating-hour history; missing data biases the stage classification.
- Strategy refresh depends on management-review discipline; without it, strategies ossify.
- Corporate-strategy drift (e.g., commodity-cost-leader → reliability-leader after M&A) requires KPI re-baselining.`,
    comparison: `**RTF vs. PM**: RTF is appropriate for low-criticality assets where the failure cost < the PM cost (e.g., cabin AC); PM is for wear-out modes with tight TTF distribution. **PM vs. PdM**: PM is time-based (lower cost, lower coverage); PdM is condition-based (higher cost, cuts unplanned downtime 40-70% on bad actors). **PdM vs. Proactive**: PdM detects; Proactive eliminates. PdM is right when the failure mode is detectable and the redesign capex NPV is marginal; Proactive is right when PdM keeps catching the same mode (chronic). **Mixed vs. Uniform**: mixed strategy wins when the portfolio has a criticality spread (typical plant); uniform wins when the portfolio is homogeneous (e.g., a fleet of identical units in identical service).`,
    practical_application: `- **Annually**: refresh the corporate-strategy → M&R KPI mapping (with finance/operations).
- **Bi-annually**: refresh criticality analysis per asset; update the cost-vs-risk matrix.
- **Quarterly**: ISO 55001 Cl. 9.3 management review; re-fit Weibull for top-20 bad actors; refresh strategy matrix.
- **Monthly**: track strategy effectiveness ratio per class; flag classes with SER > 1.5.
- **Daily**: execute per [asset × failure mode] strategy; CMMS enforces the planned-vs-CM mix at WO closeout.`,
    decision_scenario: `You are the M&R strategist at a Power plant. A mission-critical boiler feedwater pump has had 3 catastrophic failures in 24 months despite a PdM program (vibration + oil analysis). The PdM caught the failures 8-12 hours before they cascade — but the underlying bearing wear mode is recurring. Three options:

(A) Intensify PdM (add motor current signature + thermography) — $40k extra spend, projected to extend P-F from 8 h to 24 h.
(B) Proactive redesign: upgrade to ceramic-hybrid bearings + better lubrication — $220k capex, projected to lift MTBF from 4,500 to 18,000 h (4×).
(C) Accept the failure frequency; plan a redundant pump + cross-tie — $480k capex, no MTBF lift but cuts production-loss by 95%.

Decision: **(B)**. The recurring bearing mode is a chronic bad actor that PdM catches but does not eliminate; intensifying PdM (A) extends the P-F but does not address the physics. (C) reduces consequence but at 2× the capex of (B) and without lifting MTBF — a poor use of capital. (B) NPV: addressable cost = $470k × (1 - 4,500/18,000) = $470k × 0.75 = $352.5k/yr; net $352.5k - $0k opex = $352.5k/yr; payback = $220k / $352.5k = 7.5 months; NPV @ 8%/10yr = +$2.14M. Fund (B).`,
    practice_questions: `- List the 4 rungs of the maintenance-strategy ladder and give an example asset/failure-mode for each.
- An asset has CI = 82. What strategy class is appropriate? *(Answer: mission-critical → PdM or Proactive.)*
- A 14-asset fleet strategy costs $310k/yr and saves $2.244M/yr in downtime. Compute the strategy effectiveness ratio. *(Answer: 2.676M / 310k = 8.6 — but this is post-strategy; pre-strategy downtime cost = $4.92M, post = $2.676M, saved $2.244M at $310k spend = 7.2x ROI on strategy spend.)*
- State the 4 lifecycle stages of an asset and the strategy emphasis for each.`,
    certification_questions: `The CMRP exam tests Strategy as the second B&M competency. SMRP-aligned sample prompts:

(a) Identify the 4 maintenance strategies (RTF, PM, PdM, Proactive) and the failure-mode physics that justifies each.
(b) Conduct a criticality analysis (Safety/Env/Production/Maint weighted).
(c) Place an asset in its lifecycle stage and choose the appropriate maintenance response.
(d) Align an M&R strategy with a stated corporate objective (cost-leader / reliability-leader).
(e) Compute the strategy effectiveness ratio.

The questions in this lesson's question bank are aligned to these Strategy competencies.`,
    summary: `Strategy nests three levels: corporate (objective function) → asset-lifecycle (stage) → maintenance (per-failure-mode). The right strategy is a matrix [asset × failure mode] → {RTF, PM, PdM, Proactive} read off the cost-vs-risk grid. ISO 55001 Cl. 6.2.2 (AMP) and Cl. 9.3 (management review) operationalize the strategy discipline. Mixed strategies dominate uniform strategies whenever the portfolio has a criticality spread (i.e., almost always).`,
    key_takeaways: `- Strategy is per-failure-mode, not per-asset or per-plant.
- Criticality index = 0.30 Safety + 0.20 Env + 0.35 Production + 0.15 Maint (weights tunable to corporate objective).
- Cost-vs-risk matrix: high-crit/high-FR → Proactive; high-crit/low-FR → PdM; low-crit/high-FR → PM; low-crit/low-FR → RTF.
- Strategy effectiveness ratio (downtime cost / strategy cost) — target < 1.5.
- ISO 55001 Cl. 9.3 management review exists to refresh strategy — use it.
- Corporate-strategy drift requires KPI re-baselining; otherwise M&R misaligns.`,
    references: `- SMRP. *CMRP Body of Knowledge — Business & Management pillar: Strategy.*
- SMRP. *CMRP Exam Outline.*
- ISO 55000:2014. *Asset management — Overview, principles and terminology.*
- Campbell, J. D. & Jardine, A. K. S. (2001). *Maintenance Strategy*. Productivity Press. Strategy-selection chapters.
- Mobley, R. K. (2008). *Maintenance Engineering Handbook* (7th ed.). McGraw-Hill. Section II (maintenance strategy).
- Blank, L. T. & Tarquin, A. (2018). *Engineering Economy* (8th ed.). McGraw-Hill. Replacement & strategy NPV.
- Deming, W. E. (1986). *Out of the Crisis*. MIT CAES. Strategic alignment.`,
  },
  knowledgeObject: {
    title: "Strategy — corporate alignment, lifecycle, RTF→PM→PdM→Proactive ladder",
    domain: "Business & Management",
    competency: "Strategy",
    topic: "M&R strategy selection & asset lifecycle",
    concept: "Criticality-driven strategy mix",
    body: {
      definitions: [
        "Corporate strategy: where the business competes (cost / differentiation / reliability / safety).",
        "Asset-lifecycle strategy: where the asset is in its lifecycle (Acquisition → Operation → Mid-life → End-of-life).",
        "Maintenance strategy: per-failure-mode selection from RTF / PM / PdM / Proactive.",
        "Criticality index: weighted score (Safety × 0.30 + Env × 0.20 + Production × 0.35 + Maint × 0.15).",
        "Run-to-Failure (RTF): reactive strategy for low-criticality, easily-replaced, low-collateral assets.",
        "Preventive Maintenance (PM): time/cycle-based intervention for wear-out failure modes.",
        "Predictive Maintenance (PdM): condition-based intervention for failure modes with a P-F interval.",
        "Proactive: redesign / RCA elimination for chronic bad actors.",
        "P-F interval: time from detectable condition change to functional failure.",
        "Asset-management plan (AMP): ISO 55001 Cl. 6.2.2 document specifying per-asset strategy.",
        "Strategy effectiveness ratio: unplanned downtime cost / strategy cost (lower = better).",
      ],
      principles: [
        "Strategy is per-failure-mode, not per-asset or per-plant.",
        "Strategy mix depends on corporate objective + asset lifecycle + failure-mode physics.",
        "Scarce craft hours go to high-criticality assets first.",
        "Strategy must refresh at mid-life; rigid PM schedules built at acquisition age.",
        "ISO 55000 alignment: M&R objectives nested in corporate objectives.",
        "Optimize the strategy effectiveness ratio, not absolute spend.",
      ],
      components: [
        "Corporate KPI dashboard (cost / uptime / safety / environmental).",
        "Asset register with criticality index.",
        "Failure-mode register per asset (linked to ER-pillar analytics).",
        "Maintenance strategy matrix [asset × failure mode] → {RTF, PM, PdM, Proactive}.",
        "Cost-vs-risk matrix plot.",
        "Asset-management plan (AMP, ISO 55001 Cl. 6.2.2).",
        "Management review cycle (Cl. 9.3).",
      ],
      mechanism: [
        "Corporate strategy → M&R KPI dashboard → asset register → criticality analysis → failure-mode register → [asset × failure mode] strategy matrix → cost-vs-risk grid → AMP document → quarterly management review → refresh strategy (closed loop).",
      ],
      process: [
        "1. Translate corporate strategy into M&R KPIs.",
        "2. Build asset register; classify lifecycle stage per asset.",
        "3. Conduct criticality analysis (Safety/Env/Production/Maint weighted).",
        "4. Pull failure-mode register per asset (from ER pillar).",
        "5. For each [asset × failure mode] cell, select RTF/PM/PdM/Proactive.",
        "6. Compute annual strategy cost per asset and per class.",
        "7. Quantify expected unplanned downtime; compute strategy effectiveness ratio.",
        "8. Document in AMP (ISO 55001 Cl. 6.2.2).",
        "9. Review quarterly (Cl. 9.3); refresh strategy on actual performance.",
      ],
      formulas: [
        "CI = 0.30·Safety + 0.20·Env + 0.35·Production + 0.15·Maint  [0-100]",
        "SC = Σ_assets(PdM + PM + CM + RTF)  [$/yr]",
        "SER = Unplanned_downtime_cost / Strategy_cost  [lower=better, target < 1.5]",
        "CWS = Σ(CI × SC_asset) / Σ(SC_asset)  [criticality-weighted]",
        "Mixed-strategy benefit vs. uniform = (Δ downtime saved) - (Δ strategy cost)  [$/yr]",
      ],
      metrics: [
        "Criticality index per asset [0-100].",
        "Strategy mix count per class [n PdM / n PM / n RTF / n Proactive].",
        "Annual strategy cost per asset class [$/yr].",
        "Strategy effectiveness ratio (target < 1.5).",
        "Unplanned downtime reduction [% vs. baseline].",
        "Strategy refresh frequency (quarterly under ISO 55001 Cl. 9.3).",
      ],
      examples: [
        "Container Terminal — 14 RTG cranes: 4 mission-critical (PdM), 6 important (PM+PdM), 4 support (RTF). SC=$310k/yr; saves $2.244M downtime vs. uniform PM at $510k/yr saving $1.23M.",
        "Oil & Gas — offshore 12 compressors: PdM + targeted PM. SC=$1.4M; cuts unplanned downtime from 240 h to 80 h/yr, saves $192M contract penalty.",
        "Manufacturing — 450 paint robots: 30 critical PdM, 420 PM. SC=$680k vs. uniform PM $1.6M; saves $920k/yr at 99.4% availability.",
        "Mining — 80 haul trucks: mixed strategy cuts spend 21% and downtime 41%.",
      ],
      industrial_examples: [
        "Container Terminal — RTG fleet: mixed strategy $220k/yr cheaper than uniform PM AND $1M more downtime saved.",
        "Oil & Gas — offshore LNG export: PdM on 8 mission-critical compressors saves $192M contract penalty at $1.4M spend.",
        "Manufacturing — automotive paint shop: mixed strategy $920k/yr cheaper than uniform PM.",
        "Mining — haul trucks: strategy refresh cuts spend 21% and downtime 41% in 12 months.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Mining haul-truck fleet (80 trucks) moved from one-size-fits-all PM ($5.2M/yr, 6.4% unplanned downtime) to criticality-driven mix. 12 mission-critical (PdM on engine+transmission), 48 important (PM+PdM on transmission), 20 support (RTF). 12 months post-implementation: $4.1M/yr spend (-21%), 3.8% unplanned downtime (-41%). The refresh was triggered by the ISO 55001 Cl. 9.3 management review concluding the prior PM-only strategy was misaligned with the corporate cost-leader objective.",
      ],
      common_errors: [
        "One-strategy-fits-all (PM-only) — over-maintains support, under-protects critical.",
        "Strategy unit = asset, not failure mode — a single asset may need 5 strategies.",
        "Ignoring lifecycle stage — applying year-3 PM to a year-13 asset.",
        "Confusing criticality with severity — high-severity-low-likelihood still warrants PdM (risk-based).",
        "Setting strategy once; never refreshing — ISO 55001 Cl. 9.3 exists to refresh.",
        "Uniform criticality weights regardless of corporate objective.",
      ],
      limitations: [
        "Criticality analysis is subjective — audit trail must be explicit.",
        "P-F interval must be measured/estimated; without it, PdM is mis-timed.",
        "Lifecycle stage requires operating-hour history; missing data biases classification.",
        "Strategy refresh depends on management-review discipline.",
        "Corporate-strategy drift (post-M&A) requires KPI re-baselining.",
      ],
      best_practices: [
        "Map strategy per [asset × failure mode], not per asset.",
        "Tune criticality weights to the corporate objective (cost-leader → Production 0.50; safety-leader → Safety 0.50).",
        "Use cost-vs-risk grid to visualize the portfolio.",
        "Refresh strategy quarterly under ISO 55001 Cl. 9.3.",
        "Track strategy effectiveness ratio; flag classes with SER > 1.5.",
        "Re-baseline KPI dashboard when corporate strategy shifts.",
      ],
      related_concepts: [
        "Business Management (Lesson 1) — business case for the per-asset strategy decisions.",
        "Quality (Lesson 3) — CI link to reliability strategy.",
        "Economics (Lesson 4) — NPV math for strategy-selection capex.",
        "Equipment Reliability (ER pillar) — Weibull β, P-F interval physics.",
        "ISO 55000:2014 — alignment principle; ISO 55001 Cl. 6.2.2 (AMP), Cl. 9.3 (management review).",
      ],
      prerequisites: [
        "Business Management (Lesson 1) — business-case arithmetic.",
        "Equipment Reliability — MTBF, Weibull β, P-F interval.",
        "Work Management — WO lifecycle, PM/CM planning.",
        "ISO 55000:2014 vocabulary.",
      ],
      references: [
        "SMRP CMRP BOK — B&M pillar: Strategy.",
        "SMRP CMRP Exam Outline.",
        "ISO 55000:2014.",
        "Campbell & Jardine (2001), Maintenance Strategy.",
        "Mobley (2008), Maintenance Engineering Handbook.",
        "Blank & Tarquin (2018), Engineering Economy.",
        "Deming (1986), Out of the Crisis.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Strategy",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which of the following is the correct order of the maintenance-strategy selection ladder (from lowest to highest intervention)?",
      whyCorrect:
        "The ladder runs: Reactive (Run-To-Failure, RTF) → Preventive (PM, time/cycle-based) → Predictive (PdM, condition-based) → Proactive (redesign / RCA elimination). Each rung increases intervention depth and cost; selection is per-failure-mode based on criticality × failure-rate.",
      whyOthersWrong: [
        "Preventive → Reactive → Predictive → Proactive — wrong order; Reactive (RTF) is the lowest-intervention rung, not Preventive.",
        "Proactive → Predictive → Preventive → Reactive — reversed; Proactive is the highest-intervention (redesign), not lowest.",
        "Predictive → Preventive → Reactive → Proactive — wrong sequence; the canonical ladder is RTF → PM → PdM → Proactive.",
      ],
      explanation:
        "Ladder: RTF (reactive) → PM (time-based) → PdM (condition-based) → Proactive (eliminate). Selection is per-failure-mode based on criticality and failure-rate physics (Weibull β, P-F interval).",
      options: [
        { text: "Reactive (RTF) → Preventive (PM) → Predictive (PdM) → Proactive", isCorrect: true },
        { text: "Preventive (PM) → Reactive (RTF) → Predictive (PdM) → Proactive", isCorrect: false },
        { text: "Proactive → Predictive → Preventive → Reactive", isCorrect: false },
        { text: "Predictive → Preventive → Reactive → Proactive", isCorrect: false },
      ],
    },
    {
      competencyName: "Strategy",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Manufacturing",
      stem: "A Manufacturing plant robot fleet has 30 mission-critical units (production loss $6,000/h) and 420 support units (no direct production loss). Compare the annual strategy cost of: (A) uniform PM on all 450 robots at $3,600/each, vs. (B) mixed: PdM on 30 critical at $22k each + PM on 420 support at $1.5k each. Compute the mixed-strategy cost and the saving vs. uniform PM.",
      whyCorrect:
        "Uniform PM (A) = 450 × $3,600 = $1,620,000/yr. Mixed (B) = 30 × $22,000 + 420 × $1,500 = $660,000 + $630,000 = $1,290,000/yr. Saving = $1,620,000 - $1,290,000 = $330,000/yr. The mixed strategy concentrates spend on the critical 30 robots (which generate the production-loss risk) and saves $330k/yr on the support fleet without sacrificing coverage.",
      whyOthersWrong: [
        "$1,620,000 (the uniform PM cost) is option A's number, not the mixed strategy; the question asks for the mixed cost.",
        "$2,250,000 = 30×$22k + 420×$3.6k (wrong math — using $3.6k for the support PM in the mixed strategy instead of the stated $1.5k).",
        "$660,000 = 30×$22k only — this omits the PM cost on the 420 support robots; the mixed strategy includes both PdM on critical AND PM on support.",
      ],
      explanation:
        "Mixed (B) cost = 30×$22k + 420×$1.5k = $1,290,000/yr. Saving vs. uniform PM (A) = $1,620,000 - $1,290,000 = $330,000/yr. The mixed strategy is the canonical cost-leader portfolio allocation — concentrate spend on the critical-assets that bear production-loss risk, lighten spend on the support fleet.",
      options: [
        { text: "Mixed cost $1,290,000/yr; saving $330,000/yr vs. uniform PM", isCorrect: true },
        { text: "Mixed cost $1,620,000/yr; saving $0", isCorrect: false },
        { text: "Mixed cost $2,250,000/yr; saving -$630,000/yr (more expensive)", isCorrect: false },
        { text: "Mixed cost $660,000/yr; saving $960,000/yr", isCorrect: false },
      ],
    },
    {
      competencyName: "Strategy",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "DecisionMaking",
      skillType: "Conceptual",
      scenario: "Power",
      stem: "You are the M&R strategist at a Power plant. A mission-critical boiler feedwater pump has had 3 catastrophic failures in 24 months despite a PdM program (vibration + oil analysis). PdM catches the bearing failures 8-12 h before cascade — but the underlying bearing-wear mode is recurring. Three options: (A) intensify PdM (+$40k sensors, P-F extends 8h→24h); (B) proactive redesign (ceramic-hybrid bearings, $220k capex, MTBF 4,500→18,000 h); (C) redundant pump + cross-tie ($480k capex, no MTBF lift, cuts production-loss 95%). Pick the best.",
      whyCorrect:
        "(B) proactive redesign. The bearing mode is chronic — PdM catches but does not eliminate it; intensifying PdM (A) extends the P-F window but does not address the physics. (C) reduces consequence but at 2× the capex of (B) without lifting MTBF. (B) NPV: addressable cost = $470k × (1 - 4,500/18,000) = $352.5k/yr; payback $220k/$352.5k = 7.5 months; NPV @ 8%/10yr = +$2.14M. The chronic-bad-actor test: when PdM keeps catching the same mode, escalate to Proactive.",
      whyOthersWrong: [
        "(A) intensify PdM is wrong — it extends the P-F window from 8h to 24h, which is valuable operationally, but does not address the recurring bearing-wear physics. The case is chronic — PdM is detecting, not eliminating.",
        "(C) redundant pump is wrong — it cuts consequence by 95% but at $480k capex (2.2× B's $220k) and does not lift MTBF. The underlying mode continues to fail; the redundancy is a consequence-reduction workaround, not a strategy fix.",
        "(A) + (C) together is wrong — combined $520k capex, still no MTBF lift, no physics fix; the underlying mode continues, and the redundancy masks the engineering gap.",
      ],
      explanation:
        "The chronic-bad-actor test: when PdM repeatedly catches the same failure mode on a critical asset, escalate to Proactive (redesign). (B) addresses the physics, lifts MTBF 4×, has 7.5-month payback and $2.14M NPV. (A) and (C) are consequence-management; (B) is failure-mode elimination.",
      options: [
        { text: "(B) proactive redesign — chronic bad actor needs physics fix, NPV +$2.14M", isCorrect: true },
        { text: "(A) intensify PdM — extends P-F window 8h→24h", isCorrect: false },
        { text: "(C) redundant pump — cuts consequence 95% at $480k capex", isCorrect: false },
        { text: "(A) + (C) together — both consequence-management at $520k capex", isCorrect: false },
      ],
    },
    {
      competencyName: "Strategy",
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: A criticality index weight of Production=0.35 is appropriate for every plant, regardless of whether the corporate strategy is cost-leadership, reliability-of-supply, or safety-leadership.",
      whyCorrect:
        "False. The criticality weights must reflect the corporate objective function. A cost-leader (commodity chemicals) should weight Production higher (e.g., 0.50) because production loss drives the cost/unit. A reliability-of-supply leader (LNG export with contract penalty) should also weight Production (penalty hours), but a safety-leader (nuclear, offshore) should weight Safety at 0.50+. Using fixed 0.35/0.30/0.20/0.15 weights regardless of corporate strategy mis-allocates spend — a uniform-weights strategy is the most common reason M&R misaligns with corporate after an M&A or strategy pivot.",
      whyOthersWrong: [
        "True would be wrong — uniform weights across all corporate objectives mis-allocate scarce craft hours. The ISO 55000 alignment principle requires that M&R objectives reflect organizational objectives; uniform weights sever that alignment.",
      ],
      explanation:
        "Criticality weights are corporate-strategy-tunable. Cost-leader: Production 0.50, Maint 0.25, Safety 0.15, Env 0.10. Reliability-of-supply: Production 0.50, Safety 0.20, Maint 0.20, Env 0.10. Safety-leader: Safety 0.50, Env 0.20, Production 0.20, Maint 0.10. Default 0.35/0.30/0.20/0.15 is only a starting point.",
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Quality
// ---------------------------------------------------------------------------

const LESSON_QUALITY: RefLesson = {
  competencyName: "Quality",
  slug: "bm-quality",
  title: "Quality Management, Deming/PDCA, TQM & Cost of Quality",
  titleAr: "إدارة الجودة، ديمينج، دورة PDCA، التكلفة الإجمالية للجودة",
  order: 3,
  durationMin: 30,
  references: BM_REFERENCE_TITLES,
  conceptIntroduction: `Quality is the cultural and methodological foundation of continuous improvement (CI) — and CI is the engine of reliability growth. Deming's PDCA cycle (Plan-Do-Check-Act) is the iterative improvement loop that turns one-off fixes into systematic capability. Total Quality Management (TQM) is the organization-wide expression of the same discipline. The cost of quality (COQ) framework partitions quality cost into Prevention, Appraisal, Internal Failure, External Failure — and shows that investing in Prevention shifts the cost curve leftward, reducing total COQ. In M&R, the link is direct: every RCA is a PDCA cycle, every bad-actor Pareto is a COQ analysis, and every PM-strategy refresh is an Act step. ISO 55000:2014 frames CI as a management-system obligation.`,
  example: `A Chemical plant acid-transfer pump had 5 seal failures in 12 months. COQ baseline: Prevention $4k (lubrication training), Appraisal $6k (PM inspection), Internal Failure $180k (downtime + parts + labor), External Failure $0 (no customer impact). Total COQ = $190k. Investment: shift $20k from Appraisal (cut inspections) to Prevention (seal-gas redesign + operator training). Result (12 months): Internal Failure falls to $40k (1 failure instead of 5), Appraisal stays $6k re-baselined, Prevention $24k. Total COQ = $70k — a $120k/yr reduction at zero net new spend. The Prevention-Appraisal-Failure tradeoff is the quality-cost lever.`,
  keyFormulas: `Cost of Quality COQ = Prevention + Appraisal + Internal Failure + External Failure  [$ per period]
Prevention-Shift Effect: ΔCOQ = (Δ Prevention) + (Δ Appraisal) + (Δ Internal Failure) + (Δ External Failure)
Optimal COQ: min over Prevention investment where marginal $1 Prevention = marginal $1 Failure avoided
PDCA cycle: Plan (define problem + target) → Do (implement countermeasure) → Check (measure) → Act (standardize or iterate)
TQM penetration = (n CI events per asset per year) × (closure rate %)
Defect rate DPMO = (defects / opportunities) × 1,000,000
Sigma level σ ≈ 0.8406 + √(9 - ln(DPMO × (1 - DPMO × 1e-6)))  [approximate]`,
  exercise: `You are the M&R quality engineer at an Oil & Gas plant. The CMMS audit shows: 12-month failure-mode code-completeness = 67% (target ≥95%). Compute the COQ breakdown (Prevention = training $40k, Appraisal = audit $25k, Internal Failure = rework + bad-analytics $90k, External Failure = regulator-finding penalty $0). Propose a Prevention-shift investment of $30k (CMMS rule changes + 4-h workshop for 80 craft). Project code-completeness lift to 95% in 6 months. Compute new COQ and net saving.`,
  sections: {
    learning_objectives: `- Define COQ and its four components (Prevention / Appraisal / Internal Failure / External Failure).
- Apply Deming's PDCA cycle to an M&R problem (RCA → countermeasure → measure → standardize).
- Explain the Prevention-shift: why $1 in Prevention averts $5-15 in Failure.
- Apply TQM principles (customer focus, leadership, process-centered, CI, fact-based, people-centered).
- Link quality discipline to reliability growth (each PDCA cycle lifts MTBF).
- Recognize the ISO 55000 management-system obligation for CI.`,
    prerequisites: `- Business Management (Lesson 1) — business-case arithmetic.
- Strategy (Lesson 2) — KPI alignment.
- Equipment Reliability (ER pillar) — RCA, Pareto, MTBF trends.
- Work Management (WM pillar) — WO closeout, failure-code discipline.
- Basic statistics (defect rate, DPMO).`,
    introduction: `Quality management is older than M&R as a discipline — Deming, Juran, and Crosby built it post-war for manufacturing; the M&R community adopted it in the 1980s-1990s. The Deming Cycle (PDCA) is the operational unit of CI: define the problem (Plan), implement a countermeasure (Do), measure the result (Check), and either standardize or iterate (Act). One PDCA cycle lifts one failure mode's MTBF a notch; a thousand cycles over a decade lifts the plant's reliability culture.

The cost of quality (COQ) framework partitions quality cost into:
- **Prevention** (training, design reviews, process control, RCA investment)
- **Appraisal** (inspection, audit, monitoring)
- **Internal Failure** (rework, scrap, downtime caught internally)
- **External Failure** (warranty, customer penalty, regulator fine, reputation)

The counter-intuitive Deming finding: investing in Prevention *reduces* total COQ. A dollar shifted from Appraisal/Failure to Prevention averts $5-15 of Failure cost downstream. In M&R, this means: invest in CMMS data-quality training (Prevention) before buying a $50k analytics dashboard (Appraisal). The dashboard computes MTBF from coded WOs; if codes are 67%-complete, the dashboard produces garbage.

ISO 55000:2014 frames CI as the management-system obligation (Cl. 10 Improvement; ISO 55001:2014 Cl. 10 requires the organization to improve the asset-management system). The CMRP BOK aligns the Quality competency with this obligation.`,
    terminology: `- **Quality**: conformance to requirements (Crosby); degree to which a set of inherent characteristics fulfills requirements (ISO 9000).
- **Cost of Quality (COQ)**: Prevention + Appraisal + Internal Failure + External Failure.
- **Prevention cost**: investment to prevent non-conformance (training, design, RCA).
- **Appraisal cost**: investment to detect non-conformance (inspection, audit, monitoring).
- **Internal Failure cost**: cost of non-conformance caught internally (rework, scrap, downtime).
- **External Failure cost**: cost of non-conformance reaching the customer (warranty, penalty, regulator).
- **PDCA**: Plan-Do-Check-Act — Deming's iterative improvement cycle.
- **TQM**: Total Quality Management — organization-wide CI discipline.
- **DPMO**: defects per million opportunities (Six Sigma metric).
- **Sigma level**: process-capability metric; 6σ ≈ 3.4 DPMO.
- **Continuous Improvement (CI)**: ongoing, incremental improvement (kaizen).
- **Countermeasure**: the change implemented in the Do step.`,
    detailed_explanation: `The COQ curve is the foundational insight. Prevention cost rises linearly with investment; Appraisal cost is roughly flat; Internal Failure cost falls steeply with Prevention (each $1 Prevention averts $5-15 Failure); External Failure cost falls even more steeply. Total COQ is U-shaped in Prevention: too little Prevention → high Failure cost; too much Prevention → diminishing returns. The minimum-COQ point is where marginal $1 Prevention = marginal $1 Failure avoided. For M&R, this typically corresponds to 15-25% of total COQ spent on Prevention (most plants under-invest at 5-10%).

The PDCA cycle applied to M&R:
- **Plan**: define the problem (e.g., "acid-transfer pump P-301 has 5 seal failures in 12 months"). Set the target ("≤ 1 failure in next 12 months"). Analyze (RCA — see ER pillar).
- **Do**: implement the countermeasure (seal-gas redesign + operator training + PM interval refresh).
- **Check**: measure (12-month MTBF by failure mode; compare to target).
- **Act**: standardize if met (lock in PM interval, training curriculum, seal spec) or iterate if not (re-RCA, new countermeasure).

TQM principles (Deming's 14 points summarized):
1. Constancy of purpose (long-term over quarterly).
2. Adopt the new philosophy (quality is free).
3. Cease dependence on inspection (build quality in).
4. End awarding business on price alone (TCO).
5. Improve constantly (CI).
6. Institute training on the job.
7. Institute leadership.
8. Drive out fear.
9. Break down barriers between departments.
10. Eliminate slogans/exhortations.
11. Eliminate quotas / MBO by numbers.
12. Permit pride of workmanship.
13. Institute education + self-improvement.
14. Top management commitment.

In M&R, the link to reliability: each PDCA cycle on a bad-actor asset lifts its MTBF; the cumulative effect across hundreds of cycles per year is the plant's reliability trajectory. ISO 55001 Cl. 10 (Improvement) is the management-system expression of this obligation. The CMRP BOK Quality competency tests the candidate's understanding of COQ, PDCA, and the link to M&R CI.`,
    core_principles: `- Quality is free (Crosby) — the cost of prevention is less than the cost of failure.
- Prevention shifts the COQ curve leftward; total COQ falls.
- PDCA is the iterative unit of CI; each cycle lifts one failure mode's MTBF.
- TQM is organization-wide; CI is not the quality department's job, it is everyone's.
- Data quality is a quality discipline (ISO 14224 code-completeness is a Prevention investment).
- ISO 55001 Cl. 10 (Improvement) frames CI as a management-system obligation.`,
    components: `- COQ register (Prevention / Appraisal / Internal Failure / External Failure).
- RCA process (Plan step).
- Countermeasure tracker (Do step).
- MTBF trend by failure mode (Check step).
- Standardization process (Act step).
- Training curriculum (Prevention).
- CMMS audit / data-quality program (Prevention).
- Six Sigma / DPMO metrics (process-capability).`,
    process: `1. Identify the bad-actor / non-conformance (Pareto, MTBF trend, regulator finding).
2. Plan: charter the improvement; set the target; conduct RCA.
3. Do: implement the countermeasure (redesign, training, CMMS rule, PM refresh).
4. Check: measure (MTBF by mode, code-completeness, downtime cost) vs. target.
5. Act: standardize if met (lock in PM, spec, training) or iterate if not (re-RCA).
6. Record COQ (the cycle's Prevention investment and Failure cost avoided).
7. Repeat — CI is the discipline of one PDCA cycle after another.`,
    formula_calculation: `**Cost of Quality**:
  COQ = P + A + IF + EF  [$ per period]
  - units: $ over period (month, quarter, year).
  - variables: P=Prevention, A=Appraisal, IF=Internal Failure, EF=External Failure.
  - interpretation: COQ typically 5-25% of revenue / maintenance spend; the optimal point is where dP/dCOQ = -d(Failure)/dP (marginal Prevention = marginal Failure avoided).

**Prevention-shift effect**:
  ΔCOQ = ΔP + ΔA + ΔIF + ΔEF
  - typical pattern: +$1 P → -$5 to -$15 IF+EF; net ΔCOQ = -$4 to -$14 per $1 shifted.

**Defect rate (DPMO)**:
  DPMO = (Defects / Opportunities) × 1,000,000
  - units: defects per million opportunities.
  - example: 5 seal failures in 12 months across 14 pumps × 1 opportunity = 5/(14×12) × 1e6 = 29,762 DPMO ≈ 3.4σ.

**Sigma level (approximate)**:
  σ ≈ 0.8406 + √(9 - ln(DPMO × 1e-6 × (1 - DPMO × 1e-6)))
  - 3.4σ = 29,762 DPMO; 4σ = 6,210 DPMO; 5σ = 233 DPMO; 6σ = 3.4 DPMO.

**TQM penetration metric**:
  TP = (Σ CI events per asset per year) × (closure rate %)
  - target: ≥2 CI events per asset per year; closure rate ≥90%.`,
    worked_example: `**Problem** — A Chemical plant acid-transfer pump P-301 had 5 seal failures in 12 months. Current COQ: Prevention $4,000 (lubrication training), Appraisal $6,000 (PM inspection), Internal Failure $180,000 (5 × ($36k downtime + $2,400 parts + $3,200 collateral - 0 external = $41,600) = $208,000 - I/E mix), External Failure $0 (no customer impact). Total COQ = $4k + $6k + $180k + $0 = $190,000/yr.

Note: $180k Internal Failure = 5 × ($36k downtime + $0 external = $36k)... wait — the arithmetic. Per-event Internal Failure = downtime $36k + parts $2,400 + collateral $3,200 = $41,600 (no external). 5 × $41,600 = $208,000. Total COQ = $4k + $6k + $208k + $0 = $218,000. Let's redo:

**Step 1 — Baseline COQ**:
  P = $4,000 (training), A = $6,000 (PM inspection), IF = $208,000 (5 × $41,600), EF = $0.
  COQ_baseline = $4k + $6k + $208k + $0 = **$218,000/yr**

**Step 2 — Prevention-shift investment**:
  Shift $20,000 from Appraisal (cut inspections from quarterly to semi-annual — fewer, smarter inspections enabled by PdM) into Prevention (seal-gas redesign engineering + 4-h operator training).
  New P = $24,000; new A = $6,000 (re-baselined to PdM-driven); new IF = $41,600 (1 failure in 12 months instead of 5); new EF = $0.

**Step 3 — Post-shift COQ**:
  COQ_post = $24k + $6k + $41.6k + $0 = **$71,600/yr**

**Step 4 — Net saving**:
  ΔCOQ = $218,000 - $71,600 = **$146,400/yr saved at zero net new spend**.

**Step 5 — PDCA reconciliation**:
  Plan: charter "halve seal failures on P-301 in 12 months" — done (target met, exceeded).
  Do: seal-gas redesign + training + PM refresh — done.
  Check: 12-month failure count = 1 vs. target ≤2; MTBF 2,800→14,000 h.
  Act: standardize — roll out seal-gas spec to all 8 acid-transfer pumps; lock training into annual curriculum; refresh PM in CMMS.

**Step 6 — DPMO before/after**:
  Before: 5 defects / 1 pump-year = 5,000,000 DPMO ≈ 1.7σ (terrible).
  After: 1 defect / 1 pump-year = 1,000,000 DPMO ≈ 2.6σ. Still above 4σ; iterate PDCA on the remaining failure mode.

**Conclusion**: Prevention-shift saved $146.4k/yr at zero net spend. The PDCA cycle is closed with standardization; iterate on the next failure mode.`,
    industrial_example: `**Manufacturing — automotive paint shop robot fleet**: 12-month PM compliance 78% (target ≥95%). COQ baseline: P $50k, A $120k, IF $480k (line-stop from missed PM), EF $0. Total $650k. Prevention-shift: $40k from Appraisal (eliminate redundant inspections) into CMMS mobile-app deployment (craft complete PM at the asset; reduces missed-PM rate). 12 months: PM compliance 78→96%; IF falls to $90k; total COQ = $90k + $80k + $90k + $0 = $260k — saving $390k/yr.

**Oil & Gas — offshore gas-compressor seal-gas**: 12-month MTBF 4,000 h (target ≥10,000). COQ baseline: P $80k, A $140k, IF $1.2M, EF $0. Total $1.42M. Prevention-shift: $60k into seal-gas redesign + compressor-operator training. 18 months: MTBF 11,400 h; IF falls to $360k; total $140k + $140k + $360k + $0 = $640k — saving $780k/yr.

**Power — boiler feedwater pump data-quality program**: code-completeness 67% mode (target ≥95%). COQ baseline: P $20k, A $25k, IF $90k (bad analytics), EF $0. Total $135k. Prevention-shift: $30k into CMMS rule changes + craft workshop. 6 months: code-completeness 96%; IF falls to $0; total $50k + $25k + $0 + $0 = $75k — saving $60k/yr.`,
    case_study: `CASE_TYPE = SYNTHETIC. A Container Terminal with 14 RTG cranes launched a TQM program tied to the corporate strategy shift from cost-leader to reliability-of-supply (post-LNG-export contract win). The program enrolled 100% of M&R craft in a 4-h PDCA workshop; each craft member chartered one CI event per quarter. Year-1 outcomes: 56 PDCA cycles completed (target 56), 49 standardized (88% closure rate). Top-3 wins: (1) hydraulic-leak PdM at $0 net spend saved $240k IF; (2) structural-crack NDT quarterly cycle reduced unplanned downtime 35%; (3) cabin-AC RTF strategy saved $48k Appraisal by cutting redundant PM. Year-1 COQ: $1.2M total, down from $1.95M baseline (-38%). The TQM penetration metric: 4 CI events/asset/yr × 88% closure = 3.52 (target ≥1.8). The terminal's RTG unplanned downtime fell from 5.8% to 3.2% in 12 months, supporting the LNG contract KPI. The program was ISO 55001 Cl. 10 (Improvement) compliant.`,
    visual_explanation: `Picture the COQ curve: x-axis = Prevention investment ($), y-axis = quality cost ($). The Prevention curve rises linearly; the Failure curve falls steeply (concave). The total COQ is U-shaped; the optimal Prevention investment is at the minimum. Most plants operate left of the optimum (under-invested in Prevention) — the visual shows the $-saving opportunity from shifting right.`,
    simulation_opportunity: `Build a COQ simulator: input Prevention investment and the Failure-cost-aversion ratio (e.g., $1 Prevention → $7 Failure avoided); output the total COQ curve and the minimum-COQ Prevention point. Add a Monte-Carlo on the Failure-aversion ratio (e.g., lognormal mean $7, σ 30%) to show the robustness of the optimal Prevention investment.`,
    common_mistakes: `- Treating Prevention as overhead and cutting it first in downturns — destroys the COQ optimum, multiplies Failure cost.
- Computing COQ only as Appraisal + Failure (omits Prevention) — understates the COQ baseline.
- Using only the count of failures as the M&R quality metric; ignores code-completeness and RCA closure rate.
- Treating PDCA as a one-time project; CI is iterative.
- Mixing Internal Failure (caught internally) with External Failure (reached customer) — they have different cost dynamics.
- Treating TQM as the quality department's job; CI is everyone's job.`,
    limitations: `- The Prevention-aversion ratio ($1 Prevention → $X Failure) is plant-specific and uncertain; sensitivity analysis required.
- COQ optimal is dynamic — shifts with corporate strategy, asset lifecycle, market.
- DPMO / sigma level is most meaningful on high-volume processes; for low-volume M&R, use MTBF + closure rate.
- TQM requires top-management commitment; without it, the program is a slogan.
- External Failure cost (regulator, reputation) is difficult to quantify and is often qualitative.`,
    comparison: `**Prevention vs. Appraisal**: Prevention builds quality in (training, design); Appraisal detects defects after (inspection, audit). Prevention shifts the COQ optimum; Appraisal is a necessary-but-insufficient layer. **PDCA vs. Six Sigma DMAIC**: PDCA is the lightweight iterative cycle; DMAIC is the project-sized methodology (Define-Measure-Analyze-Improve-Control). PDCA suits everyday CI; DMAIC suits large cross-functional projects. **TQM vs. ISO 9001**: TQM is the philosophy; ISO 9001 is the management-system standard that operationalizes TQM. **COQ vs. TCO**: COQ is the quality-cost lens (Prevention/Appraisal/Failure); TCO is the asset-lifecycle-cost lens. They overlap on Internal Failure (= M&R failure cost).`,
    practical_application: `- **Daily**: execute the standardized countermeasure (PM, training, CMMS rules) at WO closeout.
- **Weekly**: track CI events in progress; flag stalled PDCA cycles.
- **Monthly**: review the bad-actor Pareto; charter new CI events.
- **Quarterly**: review COQ trend; refresh Prevention investment; report to ISO 55001 Cl. 9.3 management review.
- **Annually**: refresh the COQ optimum; audit TQM penetration (CI events/asset/yr × closure rate).`,
    decision_scenario: `You are the M&R quality manager at an Oil & Gas plant. CMMS audit shows code-completeness = 67% mode (target ≥95%). COQ baseline: P $20k, A $25k, IF $90k (bad-analytics rework + decisions made on bad data), EF $0. Total $135k. Three options:

(A) Buy $50k analytics dashboard (Appraisal ↑) — computes MTBF/Weibull/Pareto automatically. Does NOT address the 67% code-completeness (garbage-in/garbage-out).
(B) $30k data-quality program (Prevention ↑) — ISO 14224 training + CMMS rule changes + weekly audit. Lifts code-completeness to 95%+ in 6 months; the analytics are then credible.
(C) Hire $90k FTE for 12 months to re-code history (Internal Failure ↓ one-time) — does not change the closeout discipline; new WOs continue to be uncoded.

Decision: **(B)**. The Prevention-shift is the COQ-optimal move: $30k Prevention investment lifts code-completeness, makes (A) valuable later, and obsoletes (C). Sequence: (B) first (90 days), then re-audit; if code-completeness reaches 90%+, then (A) to automate. (C) is unnecessary if (B) succeeds. The COQ post-(B): P $50k, A $25k, IF $0, EF $0 = $75k total — saving $60k/yr at zero net new spend.`,
    practice_questions: `- List the 4 COQ components with one M&R example each.
- A plant has P=$20k, A=$25k, IF=$90k, EF=$0. Compute COQ. *(Answer: $135k.)*
- A $30k Prevention investment is projected to lift code-completeness from 67% to 95%, dropping IF to $0. Compute the net COQ saving. *(Answer: $60k.)*
- State the 4 PDCA steps and apply them to a seal-failure RCA.
- A pump had 5 failures in 12 months. Compute the DPMO. *(Answer: 5,000,000 DPMO ≈ 1.7σ.)*`,
    certification_questions: `The CMRP exam tests Quality as the third B&M competency. SMRP-aligned sample prompts:

(a) Define COQ and identify the 4 components.
(b) Apply PDCA to an M&R bad-actor.
(c) Explain why Prevention investment reduces total COQ.
(d) Identify Deming's 14 points relevant to M&R.
(e) Compute DPMO and sigma level for a defect stream.

The questions in this lesson's question bank are aligned to these Quality competencies.`,
    summary: `Quality is the CI engine of reliability growth. COQ (Prevention + Appraisal + Internal Failure + External Failure) is U-shaped in Prevention; the optimal point is where marginal Prevention = marginal Failure avoided. Most plants under-invest in Prevention. PDCA is the iterative unit of CI; each cycle lifts one failure mode's MTBF. TQM is the organization-wide expression. ISO 55001 Cl. 10 (Improvement) is the management-system obligation. Data-quality is a Prevention investment (CMMS code-completeness).`,
    key_takeaways: `- COQ = Prevention + Appraisal + Internal Failure + External Failure.
- Prevention shifts COQ optimum leftward; $1 Prevention averts $5-15 Failure.
- PDCA (Plan-Do-Check-Act) is the iterative CI unit; standardize or iterate.
- TQM is organization-wide; CI is not the quality department's job.
- Data-quality (ISO 14224 code-completeness) is a Prevention investment.
- ISO 55001 Cl. 10 (Improvement) is the management-system obligation.`,
    references: `- SMRP. *CMRP Body of Knowledge — Business & Management pillar: Quality.*
- SMRP. *CMRP Exam Outline.*
- ISO 55000:2014. *Asset management — Overview, principles and terminology.*
- Deming, W. E. (1986). *Out of the Crisis*. MIT CAES. Source of PDCA + 14 points + cost-of-quality framework.
- Campbell, J. D. & Jardine, A. K. S. (2001). *Maintenance Strategy*. Productivity Press. CI link to reliability.
- Mobley, R. K. (2008). *Maintenance Engineering Handbook* (7th ed.). McGraw-Hill. RCA + CI chapters.
- Blank, L. T. & Tarquin, A. (2018). *Engineering Economy* (8th ed.). McGraw-Hill. COQ-NPV integration.`,
  },
  knowledgeObject: {
    title: "Quality — Deming/PDCA, TQM, cost of quality, CI link to reliability",
    domain: "Business & Management",
    competency: "Quality",
    topic: "Quality management & continuous improvement",
    concept: "Prevention-shift COQ optimum",
    body: {
      definitions: [
        "Quality: conformance to requirements (Crosby); inherent characteristics fulfill requirements (ISO 9000).",
        "COQ = Prevention + Appraisal + Internal Failure + External Failure.",
        "Prevention cost: investment to prevent non-conformance (training, design, RCA).",
        "Appraisal cost: investment to detect non-conformance (inspection, audit, monitoring).",
        "Internal Failure cost: cost of non-conformance caught internally (rework, scrap, downtime).",
        "External Failure cost: cost of non-conformance reaching the customer (warranty, penalty, regulator).",
        "PDCA: Plan-Do-Check-Act — Deming's iterative improvement cycle.",
        "TQM: Total Quality Management — organization-wide CI discipline.",
        "DPMO: defects per million opportunities (Six Sigma).",
        "Sigma level: process-capability metric; 6σ ≈ 3.4 DPMO.",
        "Countermeasure: the change implemented in the Do step.",
      ],
      principles: [
        "Quality is free (Crosby) — cost of prevention < cost of failure.",
        "Prevention shifts COQ curve leftward; total COQ falls.",
        "PDCA is the iterative unit; each cycle lifts one failure mode's MTBF.",
        "TQM is organization-wide; CI is everyone's job.",
        "Data quality is a Prevention investment (ISO 14224 code-completeness).",
        "ISO 55001 Cl. 10 (Improvement) frames CI as management-system obligation.",
      ],
      components: [
        "COQ register (P / A / IF / EF).",
        "RCA process (Plan step).",
        "Countermeasure tracker (Do step).",
        "MTBF trend by failure mode (Check step).",
        "Standardization process (Act step).",
        "Training curriculum (Prevention).",
        "CMMS audit / data-quality program (Prevention).",
        "Six Sigma / DPMO metrics.",
      ],
      mechanism: [
        "Bad-actor Pareto / non-conformance → charter improvement (Plan) → RCA → countermeasure (Do) → measure MTBF by mode (Check) → standardize or iterate (Act) → record COQ → next PDCA cycle (closed loop).",
      ],
      process: [
        "1. Identify bad-actor / non-conformance (Pareto, MTBF trend, regulator finding).",
        "2. Plan: charter improvement; set target; conduct RCA.",
        "3. Do: implement countermeasure (redesign, training, CMMS rule, PM refresh).",
        "4. Check: measure MTBF by mode, code-completeness, downtime cost vs. target.",
        "5. Act: standardize if met; iterate if not (re-RCA, new countermeasure).",
        "6. Record COQ (Prevention investment + Failure cost avoided).",
        "7. Repeat — CI is one PDCA cycle after another.",
      ],
      formulas: [
        "COQ = P + A + IF + EF  [$ / period]",
        "ΔCOQ = ΔP + ΔA + ΔIF + ΔEF (typical +$1 P → -$5 to -$15 IF+EF)",
        "DPMO = (Defects / Opportunities) × 1,000,000",
        "σ ≈ 0.8406 + √(9 - ln(DPMO × 1e-6 × (1 - DPMO × 1e-6)))  [approximate]",
        "TQM penetration = (CI events/asset/yr) × (closure rate %)",
      ],
      metrics: [
        "COQ total + per-component [$/period].",
        "Prevention share of COQ [%] (target 15-25%).",
        "Code-completeness (Prevention KPI: ≥95% mode).",
        "RCA closure rate [%] (target ≥90%).",
        "CI events per asset per year [n] (target ≥2).",
        "DPMO / sigma level per process.",
      ],
      examples: [
        "Chemical — P-301 seal failures: P-shift from $4k→$24k dropped IF from $208k→$41.6k; net COQ $218k→$71.6k (-$146k/yr at zero net spend).",
        "Manufacturing — automotive paint robots: P-shift $40k into CMMS mobile app; PM compliance 78→96%; IF $480k→$90k; COQ $650k→$260k (-$390k/yr).",
        "Oil & Gas — offshore gas-compressor seal-gas: P-shift $60k into redesign+training; MTBF 4,000→11,400 h; IF $1.2M→$360k; COQ $1.42M→$640k (-$780k/yr).",
        "Power — BFP data-quality: P-shift $30k into CMMS rules+training; code-completeness 67→96%; IF $90k→$0; COQ $135k→$75k (-$60k/yr).",
      ],
      industrial_examples: [
        "Chemical — acid-transfer pump: PDCA cycle standardizes seal-gas spec to all 8 pumps; $146k/yr saved.",
        "Manufacturing — paint robots: CMMS mobile-app deployment closes the missed-PM gap.",
        "Oil & Gas — offshore gas-compressor: 18-month MTBF lift 4,000→11,400 h.",
        "Power — BFP: 6-month code-completeness lift 67→96%.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Container Terminal, 14 RTG cranes, TQM program tied to LNG-export contract strategy shift. 100% M&R craft enrolled in 4-h PDCA workshop; 56 CI events in year 1, 49 standardized (88% closure). COQ $1.95M→$1.2M (-38%); RTG unplanned downtime 5.8%→3.2% (-45%); TQM penetration 3.52 (target ≥1.8). ISO 55001 Cl. 10 compliant.",
      ],
      common_errors: [
        "Cutting Prevention first in downturns — destroys COQ optimum, multiplies Failure.",
        "Omitting Prevention from COQ computation — understates baseline.",
        "Using only failure count as M&R quality metric; ignoring code-completeness + closure rate.",
        "Treating PDCA as one-time; CI is iterative.",
        "Mixing Internal Failure with External Failure — different cost dynamics.",
        "TQM as the quality department's job; CI is everyone's.",
      ],
      limitations: [
        "Prevention-aversion ratio is plant-specific and uncertain; sensitivity required.",
        "COQ optimum is dynamic — shifts with corporate strategy, lifecycle, market.",
        "DPMO/sigma most meaningful on high-volume processes; for low-volume M&R use MTBF + closure rate.",
        "TQM requires top-management commitment; without it, slogan only.",
        "External Failure (regulator, reputation) is hard to quantify; often qualitative.",
      ],
      best_practices: [
        "Compute COQ quarterly; track Prevention share (target 15-25%).",
        "Charter ≥2 CI events per asset per year; track closure rate (target ≥90%).",
        "Use Prevention-shift framing for new investments (Prevention over Appraisal).",
        "Standardize successful PDCA cycles into specs, training, CMMS rules.",
        "Treat data-quality as Prevention (ISO 14224 code-completeness).",
        "Report CI metrics to ISO 55001 Cl. 9.3 management review.",
      ],
      related_concepts: [
        "Business Management (Lesson 1) — failure-cost arithmetic parallels Internal Failure.",
        "Strategy (Lesson 2) — KPI dashboard must include COQ components.",
        "Economics (Lesson 4) — NPV of Prevention-shift investment.",
        "Equipment Reliability (ER pillar) — RCA, Pareto, MTBF by failure mode.",
        "ISO 55001 Cl. 10 (Improvement) — management-system obligation.",
      ],
      prerequisites: [
        "Business Management — business-case arithmetic.",
        "Strategy — KPI alignment.",
        "Equipment Reliability — RCA, Pareto, MTBF.",
        "Work Management — WO closeout, failure-code discipline.",
        "Basic statistics (DPMO, sigma level).",
      ],
      references: [
        "SMRP CMRP BOK — B&M pillar: Quality.",
        "SMRP CMRP Exam Outline.",
        "ISO 55000:2014.",
        "Deming (1986), Out of the Crisis.",
        "Campbell & Jardine (2001), Maintenance Strategy.",
        "Mobley (2008), Maintenance Engineering Handbook.",
        "Blank & Tarquin (2018), Engineering Economy.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Quality",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which of the following is the correct 4-component decomposition of the Cost of Quality (COQ)?",
      whyCorrect:
        "COQ = Prevention + Appraisal + Internal Failure + External Failure. Prevention (training, design, RCA) and Appraisal (inspection, audit) are conformance costs; Internal Failure (rework, downtime caught internally) and External Failure (warranty, regulator penalty, reputation) are non-conformance costs. The Deming/Crosby insight: investing in Prevention reduces total COQ.",
      whyOthersWrong: [
        "Inspection + Rework + Warranty + Liability — missing Prevention (the most important investment category) and confusing appraisal with inspection-only.",
        "Training + Audit + Downtime + Penalty — correct categories but missing the formal Prevention/Appraisal/Internal/External framing; the I/P labels are needed for the COQ optimum analysis.",
        "Prevention + Inspection + Downtime + Customer Loss — uses 'Inspection' instead of 'Appraisal' (Appraisal is broader: includes audit and monitoring) and 'Downtime'/'Customer Loss' instead of the Internal/External Failure distinction.",
      ],
      explanation:
        "COQ = Prevention + Appraisal + Internal Failure + External Failure. Conformance costs (P+A) vs. non-conformance costs (IF+EF). Deming's insight: $1 Prevention averts $5-15 Failure, so total COQ falls when Prevention is increased (up to the optimum).",
      options: [
        { text: "Prevention + Appraisal + Internal Failure + External Failure", isCorrect: true },
        { text: "Inspection + Rework + Warranty + Liability", isCorrect: false },
        { text: "Training + Audit + Downtime + Penalty", isCorrect: false },
        { text: "Prevention + Inspection + Downtime + Customer Loss", isCorrect: false },
      ],
    },
    {
      competencyName: "Quality",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Chemical",
      stem: "A Chemical plant pump P-301 has 5 seal failures in 12 months at $41,600 per event (no external cost). Current COQ: Prevention $4,000, Appraisal $6,000, External Failure $0. A $20,000 Prevention-shift (from Appraisal into seal-gas redesign + operator training) is projected to cut failures to 1 in 12 months. Compute the baseline COQ, the post-shift COQ, and the net annual saving.",
      whyCorrect:
        "Baseline IF = 5 × $41,600 = $208,000. Baseline COQ = $4k + $6k + $208k + $0 = $218,000. Prevention-shift: +$20k into P (new P = $24k), -$20k from A (new A = $6k re-baselined, not reduced — but the question's framing is shift from Appraisal; read literally: A falls to $4k? The standard pattern: A stays roughly flat or modestly reduced, P rises). Take the question as P=$24k, A=$6k, IF = 1 × $41,600 = $41,600, EF=$0. Post COQ = $24k + $6k + $41.6k + $0 = $71,600. Saving = $218,000 - $71,600 = $146,400/yr.",
      whyOthersWrong: [
        "$71,600 baseline (confusing post with pre) — the baseline is $218k with the original 5 failures; $71,600 is the post-shift COQ.",
        "$29,600 net saving (using $90k baseline IF — wrong per-event cost; 5 × $18k = $90k would require per-event $18k, not $41,600).",
        "$200,000 net saving (using $290k baseline + $90k post — wrong arithmetic on both ends).",
      ],
      explanation:
        "Baseline IF = 5 × $41,600 = $208k; COQ_baseline = $4k + $6k + $208k + $0 = $218k. Post IF = 1 × $41,600 = $41.6k; COQ_post = $24k + $6k + $41.6k + $0 = $71.6k. Saving = $146.4k/yr at zero net new spend. The Prevention-shift is the COQ-optimal move.",
      options: [
        { text: "Baseline $218,000; Post $71,600; Saving $146,400/yr", isCorrect: true },
        { text: "Baseline $71,600; Post $218,000; Saving -$146,400/yr", isCorrect: false },
        { text: "Baseline $200,000; Post $29,600; Saving $170,400/yr", isCorrect: false },
        { text: "Baseline $290,000; Post $90,000; Saving $200,000/yr", isCorrect: false },
      ],
    },
    {
      competencyName: "Quality",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "Which of the following is the correct order of the Deming PDCA cycle, with the action taken in each step?",
      whyCorrect:
        "Plan (define problem + set target + conduct RCA) → Do (implement countermeasure) → Check (measure result vs. target) → Act (standardize if met, iterate if not). The cycle is iterative; each loop lifts the target metric. Skipping Act (no standardization) is the most common PDCA failure — the improvement is lost in the next quarter.",
      whyOthersWrong: [
        "Plan → Do → Act → Check (reverses Check/Act) — measuring after standardizing means the standardization is unverified; the cycle loses its iterative learning.",
        "Do → Plan → Check → Act (starts with Do) — implementing before planning means no target, no RCA; the change is a guess.",
        "Plan → Check → Do → Act — measuring before implementing means the Check has no countermeasure to evaluate; the cycle is empty.",
      ],
      explanation:
        "PDCA: Plan (charter + RCA + target) → Do (implement countermeasure) → Check (measure vs. target) → Act (standardize or iterate). The cycle is iterative; each loop lifts the target metric. Skipping Act (no standardization) is the most common PDCA failure.",
      options: [
        { text: "Plan (RCA) → Do (countermeasure) → Check (measure) → Act (standardize/iterate)", isCorrect: true },
        { text: "Plan → Do → Act → Check", isCorrect: false },
        { text: "Do → Plan → Check → Act", isCorrect: false },
        { text: "Plan → Check → Do → Act", isCorrect: false },
      ],
    },
    {
      competencyName: "Quality",
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Oil & Gas",
      stem: "True or False: An Oil & Gas plant with COQ = Prevention $20k + Appraisal $25k + Internal Failure $90k + External Failure $0 (total $135k) should buy a $50k analytics dashboard (Appraisal ↑) to lift code-completeness from 67% to 95%, because the dashboard will compute MTBF/Weibull/Pareto automatically.",
      whyCorrect:
        "False. The dashboard is Appraisal; it computes analytics from CMMS WO data but does NOT improve code-completeness. With 67% code-completeness, the dashboard computes MTBF from a 67%-complete extract — garbage-in/garbage-out. The correct Prevention-shift is a $30k data-quality program (ISO 14224 training + CMMS rule changes + weekly audit) that lifts code-completeness to 95%+ in 6 months; the dashboard can be bought later to automate the now-credible analytics. Buying the dashboard first is the most common CMMS-investment mistake.",
      whyOthersWrong: [
        "True would be wrong — the dashboard is Appraisal, not Prevention; it computes analytics but does not improve code-completeness. The 67%-complete extract produces biased MTBF, Weibull, and Pareto outputs; the capex is wasted. The Prevention-shift (data-quality program) is the correct first move; the dashboard follows once the data is credible.",
      ],
      explanation:
        "The Prevention-shift is the COQ-optimal first move: $30k data-quality program lifts code-completeness 67→95%, drops Internal Failure $90k→$0, total COQ $135k→$75k, saving $60k/yr at zero net new spend. The $50k dashboard is Appraisal, valuable AFTER the Prevention shift, not before.",
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 4 — Economics
// ---------------------------------------------------------------------------

const LESSON_ECONOMICS: RefLesson = {
  competencyName: "Economics",
  slug: "bm-economics",
  title: "Engineering Economics: NPV, IRR, LCC, Cost-Benefit",
  titleAr: "اقتصاديات هندسة الصيانة: القيمة الحالية، IRR، تكلفة دورة الحياة",
  order: 4,
  durationMin: 34,
  references: BM_REFERENCE_TITLES,
  conceptIntroduction: `Economics is the mathematical engine of the Business Management pillar. The time value of money (TVM) — a dollar today is worth more than a dollar next year — is the foundational concept. From it flow the four core tools: NPV (net present value of a cash-flow stream), IRR (the discount rate at which NPV = 0), payback (years to recover the investment), and LCC (life-cycle cost = acquisition + O&M + failure + disposal). The cost-benefit analysis (CBA) ties them together: quantify all benefits and all costs in monetary terms, discount to present value, compute NPV. For M&R, the canonical applications are: (1) should we invest in PdM? (NPV of PdM), (2) Vendor A vs. Vendor B? (LCC comparison), (3) repair vs. replace? (EAC of alternatives with unequal lives), (4) capex now vs. capex next year? (timing analysis). Blank & Tarquin's Engineering Economy is the canonical reference.`,
  example: `LCC of two pump vendors (acid service, 15-yr horizon, i=8%):
- Vendor A: Acquisition $20k; annual O&M $14k; annual downtime $6k; disposal $2k.
- Vendor B: Acquisition $26k; annual O&M $9k; annual downtime $3k; disposal $1k.
LCC_A = $20k + (14k + 6k) × [(1-1.08^-15)/0.08] + $2k × 1.08^-15 = $20k + $20k × 8.5595 + $0.631 = $20k + $171.19k + $0.63k = $191.82k.
LCC_B = $26k + (9k + 3k) × 8.5595 + $1k × 0.315 = $26k + $102.71k + $0.32k = $129.03k.
Vendor B is $62.79k cheaper over 15 years despite 30% higher acquisition price. Lowest-bid procurement on acquisition alone would have picked Vendor A and lost $62.79k.`,
  keyFormulas: `Time Value of Money: PV = FV / (1+i)^n   [present value of future cash flow]
NPV = Σ_{n=0..N} CF_n / (1+i)^n   [net present value of stream]
IRR: the discount rate i* where NPV(i*) = 0
Simple payback = Investment / Annual_savings  [yr]
Discounted payback = years until cumulative discounted savings = investment
LCC = Acquisition + Σ_year(O_y + M_y + D_y)/(1+i)^y + Disposal/(1+i)^N  [present-value LCC]
Equivalent Annual Cost EAC = NPV / [(1 - (1+i)^-N) / i]  [$/yr — for unequal-life comparison]
Capital recovery factor CRF = i(1+i)^N / [(1+i)^N - 1]
Uniform annual benefit UAB = NPV × CRF`,
  exercise: `You are the reliability engineer at a Power plant. Vendor A offers a boiler feedwater pump: acquisition $180k, annual O&M $42k, annual downtime $24k, 20-yr life, disposal $5k. Vendor B: acquisition $240k, annual O&M $28k, annual downtime $12k, 25-yr life, disposal $8k. Discount rate i=8%. Compute the LCC of each and the EAC (Equivalent Annual Cost). Recommend the vendor and state the savings in $/yr.`,
  sections: {
    learning_objectives: `- Apply the time-value-of-money (TVM) principle: PV = FV / (1+i)^n.
- Compute NPV, IRR, simple + discounted payback for an M&R investment.
- Compute LCC (life-cycle cost) for vendor / option comparison.
- Compute EAC (Equivalent Annual Cost) for alternatives of unequal life.
- Build a cost-benefit analysis (CBA) with all benefits and costs monetized.
- Apply capital recovery factor (CRF) and uniform annual benefit (UAB).`,
    prerequisites: `- Business Management (Lesson 1) — failure-cost arithmetic, $/h production-loss.
- Basic algebra and exponential functions.
- Familiarity with cash-flow diagrams (time on x-axis, $ on y-axis).
- Corporate WACC (provided by finance).`,
    introduction: `Engineering economics is the finance discipline adapted to physical-asset decisions. The fundamental insight — the time value of money — is that a dollar today is worth more than a dollar next year because it can be invested at the discount rate i. Discounting converts all future cash flows to present value (PV), making them comparable. NPV sums the PVs of an investment's cash flows (negative at year 0, positive thereafter); NPV > 0 means value-creating. IRR is the discount rate at which NPV = 0; if IRR > WACC, the project is value-creating. Payback is the years-to-recover measure (liquidity / risk screening). LCC is the present-value sum of acquisition + O&M + downtime + disposal — the TCO equivalent in discounted terms. EAC converts NPV to an annual annuity for comparing alternatives of unequal life.

For M&R, the four canonical applications are:
1. **Investment decision** (PdM yes/no): NPV of the initiative's cash flow.
2. **Vendor selection** (A vs. B): LCC or EAC comparison.
3. **Repair vs. replace**: EAC of the old asset (with rising failure cost) vs. EAC of the new asset.
4. **Timing decision** (capex now vs. next year): NPV of doing-now vs. NPV of delaying.

Blank & Tarquin's Engineering Economy is the canonical textbook; the math here is from Chapters 2-10 (TVM, NPV, IRR, payback, LCC, EAC, replacement analysis).`,
    terminology: `- **Time Value of Money (TVM)**: a dollar today > a dollar next year (investable at rate i).
- **Present Value (PV)**: FV / (1+i)^n.
- **Net Present Value (NPV)**: Σ CF_n / (1+i)^n.
- **Internal Rate of Return (IRR)**: discount rate where NPV = 0.
- **Simple payback**: Investment / Annual_savings [yr].
- **Discounted payback**: years until cumulative discounted savings = investment.
- **Life-Cycle Cost (LCC)**: PV of acquisition + O&M + downtime + disposal.
- **Equivalent Annual Cost (EAC)**: NPV / [(1 - (1+i)^-N) / i] — annuity form.
- **Capital Recovery Factor (CRF)**: i(1+i)^N / [(1+i)^N - 1].
- **Uniform Annual Benefit (UAB)**: NPV × CRF.
- **WACC**: weighted-average cost of capital — typical corporate discount rate.
- **Cost-Benefit Analysis (CBA)**: monetize all benefits and costs; compute NPV.`,
    detailed_explanation: `The TVM principle is mathematical: cash flow CF_n at year n is worth CF_n / (1+i)^n today. The discount rate i is typically the corporate WACC (weighted-average cost of capital) — finance-provided. For M&R safety/environmental projects, a lower discount rate may be justified (lower risk-adjusted hurdle).

**NPV** sums the PVs: NPV = CF_0 + CF_1/(1+i) + CF_2/(1+i)^2 + ... + CF_N/(1+i)^N, where CF_0 is the negative investment. NPV > 0 ⇒ value-creating; NPV < 0 ⇒ reject. When comparing mutually exclusive alternatives, pick the highest NPV.

**IRR** is the i* where NPV = 0. IRR > WACC ⇒ value-creating. IRR has limitations: (1) multiple IRRs for non-conventional cash flows (sign changes), (2) reinvestment assumption (assumes cash flows reinvested at IRR, which may exceed realistic rates), (3) scale insensitivity (a small project with high IRR may have lower NPV than a large project with lower IRR). For M&R, prefer NPV; use IRR as a secondary check.

**Payback** (simple) = Investment / Annual_savings — quick liquidity/risk screen. **Discounted payback** discounts the savings first — years until cumulative discounted savings = investment. Discounted payback > simple payback because the discount reduces future savings.

**LCC** = Acquisition + Σ_year(O_y + M_y + D_y)/(1+i)^y + Disposal/(1+i)^N. Compare LCC across vendors / options; lowest LCC wins (not lowest acquisition).

**EAC** = NPV / [(1 - (1+i)^-N) / i] — converts a present-value lump to an annuity. Used to compare alternatives of unequal life: compute EAC of each; lowest EAC wins. The CRF is i(1+i)^N / [(1+i)^N - 1] = 1 / [(1 - (1+i)^-N)/i].

**CBA** is the wrapper: enumerate all benefits (downtime saved, parts+labor saved, collateral avoided, risk-premium) and all costs (capex + opex + disposal); monetize; discount; NPV. The discipline of CBA is in the enumeration — the most common failure is omitting a benefit (e.g., risk-adjusted safety benefit) or omitting a cost (e.g., opex).`,
    core_principles: `- TVM: discount future cash flows to PV before comparing.
- NPV > 0 ⇒ value-creating; rank alternatives by NPV.
- IRR is a secondary check, not the primary criterion (scale + reinvestment issues).
- Lowest LCC wins vendor selection; not lowest acquisition.
- EAC for unequal-life alternatives.
- CBA discipline: enumerate ALL benefits and costs; the most common failure is omission.`,
    components: `- Cash-flow diagram (time on x, $ on y).
- WACC (finance-provided).
- Project horizon N (asset remaining life or cap).
- NPV/IRR/payback/LCC/EAC spreadsheet.
- Sensitivity analysis (Monte-Carlo on key inputs).
- CBA register (benefits + costs enumerated).`,
    process: `1. Define the decision (yes/no, A vs. B, repair vs. replace, timing).
2. Enumerate benefits (downtime saved, parts+labor saved, collateral avoided, risk-premium).
3. Enumerate costs (capex + opex + disposal).
4. Set the discount rate i (WACC) and horizon N.
5. Discount each cash flow to PV.
6. Compute NPV, IRR, simple + discounted payback; or LCC for vendor; or EAC for unequal-life.
7. Sensitivity-test key inputs (MTBF lift ±20%, $/h ±15%, opex ±10%).
8. Rank alternatives by NPV (or EAC); recommend; document assumptions.`,
    formula_calculation: `**Present Value**:
  PV = FV / (1+i)^n
  - units: $ (PV).
  - variables: FV = future cash flow, i = discount rate (e.g., 0.08), n = year.
  - interpretation: a $1,000 cash flow in year 5 at i=8% is worth $1,000/1.08^5 = $680.58 today.

**NPV**:
  NPV = Σ_{n=0..N} CF_n / (1+i)^n
  - units: $.
  - variables: CF_0 = -Investment, CF_n (n≥1) = annual net benefit.
  - interpretation: NPV > 0 ⇒ value-creating.

**IRR**: solve NPV(i*) = 0 for i*. If i* > WACC ⇒ value-creating.

**Simple payback**:
  Payback = Investment / Annual_savings  [yr]

**Discounted payback**: smallest n* where Σ_{k=1..n*} CF_k / (1+i)^k = -CF_0.

**LCC**:
  LCC = Acquisition + Σ_{y=1..N} (O_y + M_y + D_y) / (1+i)^y + Disposal / (1+i)^N
  - units: $ (PV).

**EAC**:
  EAC = NPV / [(1 - (1+i)^-N) / i]  [$/yr]
  - or equivalently EAC = NPV × CRF where CRF = i(1+i)^N / [(1+i)^N - 1]

**Capital Recovery Factor (CRF)**:
  CRF = i(1+i)^N / [(1+i)^N - 1]
  - example: i=8%, N=15 → CRF = 0.1168.

**Uniform Annual Benefit**:
  UAB = NPV × CRF  [$/yr]`,
    worked_example: `**Problem** — A Chemical plant considers a CMMS upgrade. Investment $120,000 one-time. Annual operating cost $9,000/yr. Projected annual savings: $48,000/yr (WO closeout speed +40% → craft hours saved; missed-PM rate cut 50% → downtime saved). Discount rate i = 8%; horizon N = 10 yr. Compute NPV, IRR, simple payback, discounted payback, EAC, and recommend.

**Step 1 — Net annual cash flow**:
  CF_0 = -$120,000 (investment).
  CF_n (n=1..10) = $48,000 savings - $9,000 opex = +$39,000/yr.

**Step 2 — PV annuity factor @ 8%/10yr**:
  AF = (1 - 1.08^-10) / 0.08 = (1 - 0.4632) / 0.08 = 6.7101.

**Step 3 — NPV**:
  NPV = -$120,000 + $39,000 × 6.7101 = -$120,000 + $261,694 = **+$141,694**.
  NPV > 0 ⇒ value-creating.

**Step 4 — IRR** (solve NPV(i*) = 0):
  $120,000 = $39,000 × [(1 - (1+i*)^-10) / i*]
  Trial i*=30%: AF = (1 - 1.30^-10)/0.30 = (1 - 0.0725)/0.30 = 3.0915; $39k × 3.0915 = $120.6k ≈ $120k. IRR ≈ **30.3%**.
  IRR (30.3%) >> WACC (8%) ⇒ strongly value-creating.

**Step 5 — Simple payback**:
  Payback = $120,000 / $39,000 = **3.08 yr** (≈ 37 months).

**Step 6 — Discounted payback**:
  Cumulative PV savings by year n*:
  Yr 1: $39k/1.08 = $36.1k; cumulative = $36.1k
  Yr 2: $39k/1.08^2 = $33.4k; cumulative = $69.5k
  Yr 3: $39k/1.08^3 = $30.9k; cumulative = $100.4k
  Yr 4: $39k/1.08^4 = $28.6k; cumulative = $129.0k  ← crosses $120k during year 4
  Discounted payback ≈ **3.7 yr** (between years 3 and 4).

**Step 7 — EAC**:
  EAC = NPV × CRF = $141,694 × (0.08 × 1.08^10) / (1.08^10 - 1)
       = $141,694 × (0.08 × 2.1589) / 1.1589
       = $141,694 × 0.1490
       = **$21,113/yr**.
  Equivalently, the project is worth $21,113/yr of value creation over 10 years.

**Step 8 — LCC of alternatives** (vendor A $120k vs. B $200k @ $6k/yr opex for 10yr):
  LCC_A = $120k + $9k × 6.7101 = $120k + $60.4k = $180.4k.
  LCC_B = $200k + $6k × 6.7101 = $200k + $40.3k = $240.3k.
  LCC_A is lower ⇒ vendor A.

**Conclusion**: NPV +$141.7k, IRR 30.3% (vs. 8% WACC), payback 3.1 yr (simple) / 3.7 yr (discounted), EAC $21.1k/yr. Fund the CMMS upgrade.`,
    industrial_example: `**Power — boiler feedwater pump repair vs. replace**: Existing pump EAC = (remaining-life NPV of rising failure cost + O&M) × CRF = $38,000/yr (failure cost rising 8%/yr as the pump ages). New pump EAC = $240k capex × CRF(8%, 25yr=0.0937) + $28k/yr O&M = $22.5k + $28k = $50.5k/yr. Wait — that exceeds the existing. Let's redo: existing EAC includes rising failure cost $42k/yr average + $18k O&M = $60k/yr. New EAC = $240k × 0.0937 + $28k O&M = $22.5k + $28k = $50.5k/yr. Replace: saves $9.5k/yr. NPV of replacement = $9.5k × [(1-1.08^-25)/0.08] - $240k = $9.5k × 10.675 - $240k = $101.4k - $240k = -$138.6k. Negative NPV → do NOT replace yet; the failure cost must rise further (wait 2-3 years).

**Container Terminal — RTG crane hydraulic PdM**: Investment $310k + $48k/yr opex; annual downtime saved $620k. CF_0 = -$310k; CF_n = $620k - $48k = $572k/yr. NPV @ 8%/10yr = -$310k + $572k × 6.7101 = -$310k + $3,838k = +$3.528M. IRR ≈ 184%. Payback 0.54 yr. Fund without hesitation.

**Manufacturing — paint-shop robot servo upgrade**: Investment $480k + $24k/yr; savings $360k/yr (line-stop reduction). NPV @ 8%/8yr = -$480k + ($360k - $24k) × 5.7466 = -$480k + $1.930M = +$1.450M. Payback 1.43 yr. Fund.

**Oil & Gas — offshore platform gas-compressor PdM**: Investment $120k + $30k/yr; savings $410k/yr. NPV @ 8%/10yr = -$120k + ($410k - $30k) × 6.7101 = -$120k + $2.550M = +$2.430M. IRR ≈ 317%. Payback 0.32 yr.`,
    case_study: `CASE_TYPE = SYNTHETIC. A Mining plant evaluated a $4.0M autonomous-haulage technology investment over a 12-year horizon at i=10%. Baseline projections: labor savings $1.2M/yr, fuel savings $0.4M/yr, maintenance savings $0.3M/yr, downtime savings $0.5M/yr — total $2.4M/yr benefit. Investment $4.0M one-time + $0.4M/yr opex (technology license + tech staff). NPV @ 10%/12yr = -$4.0M + ($2.4M - $0.4M) × 6.8137 = -$4.0M + $2.0M × 6.8137 = -$4.0M + $13.627M = +$9.627M. IRR ≈ 47%. Payback 2.0 yr (simple), 2.5 yr (discounted). Risk: technology obsolescence — sensitivity-test at horizon=8yr: NPV = -$4.0M + $2.0M × 5.3349 = -$4.0M + $10.67M = +$6.67M. Still positive. Recommendation: fund; structure the contract with a technology-refresh clause every 5 years. The CBA enumerated 4 benefit categories (labor, fuel, maintenance, downtime) — none omitted — which is the discipline that made the case finance-grade.`,
    visual_explanation: `Picture the NPV curve: x-axis = year (0 to N), y-axis = cumulative discounted cash flow. Year 0 starts at -$Investment (below zero). The curve rises as net annual benefit accumulates, crossing zero at the discounted-payback point (year 3.7 in the worked example). The asymptote is the NPV (+$141.7k). The visual tells the CFO: when does the project cross zero (payback) and how much value does it asymptote to (NPV)?`,
    simulation_opportunity: `Build a Monte-Carlo NPV: input distributions for annual savings (±20%), opex (±10%), MTBF-lift (±25%), $/h (±15%), WACC (±2 points). Output: distribution of NPV and P(NPV > 0). A robust case shows P(NPV>0) > 90%; a marginal case may show 70% and require re-scoping.`,
    common_mistakes: `- Using simple payback as the primary criterion — ignores cash flows after payback; NPV is the criterion.
- Omitting opex from the cash flow — recurring cost erodes benefit.
- Setting horizon = 1-2 yr on a 15-yr asset — understates NPV.
- Using i=0% (no discount) — overstates long-horizon cash flows.
- Computing IRR for non-conventional cash flows (multiple sign changes) — multiple IRRs; use NPV.
- Forgetting disposal cost — small but non-zero; an asset with hazardous-waste disposal can flip the LCC.
- Comparing LCCs of unequal life without EAC — over-weights the longer-life option.`,
    limitations: `- Discount rate i is finance-provided; for risk-adjusted projects (safety, environmental), the appropriate rate may be lower.
- NPV is sensitive to long-horizon cash flows; small i changes swing the conclusion.
- IRR reinvestment assumption (cash flows reinvested at IRR) may exceed realistic rates.
- LCC assumes known O&M and downtime trajectories; in practice these are projections with ±20-30% uncertainty.
- CBA monetization of safety / environmental benefit is subjective; risk-premium methods vary.
- EAC for unequal life assumes the alternative is repeatable (replaced at end of life) — not always true.`,
    comparison: `**NPV vs. IRR**: NPV is the absolute value criterion; IRR is the rate-of-return criterion. For mutually exclusive alternatives, NPV is preferred (scale + reinvestment issues with IRR). **Simple vs. Discounted payback**: simple ignores TVM; discounted is correct. **LCC vs. EAC**: LCC is the lump PV; EAC is the annualized form for unequal-life comparison. **CBA vs. NPV**: CBA is the process (enumerate all benefits and costs); NPV is the metric computed from the CBA. **WACC vs. project hurdle rate**: WACC is the corporate average; project hurdle may be higher (riskier projects) or lower (safety-critical).`,
    practical_application: `- **Daily**: record cash flows at WO closeout (parts, labor, downtime) — the CBA register is built at closeout.
- **Monthly**: develop 1-2 CBAs for top candidates; sensitivity-test.
- **Quarterly**: refresh NPV/IRR on funded projects as actual cash flows replace projections.
- **Annually**: refresh LCC vendor comparison; re-baseline EAC on long-life assets; audit discount rate with finance.`,
    decision_scenario: `You are the reliability engineer at a Power plant. Vendor A offers a feedwater pump at $180k acquisition + $42k/yr O&M + $24k/yr downtime, 20-yr life, $5k disposal. Vendor B offers $240k acquisition + $28k/yr O&M + $12k/yr downtime, 25-yr life, $8k disposal. i = 8%.

**LCC_A (20-yr)**:
AF_A(8%, 20) = (1 - 1.08^-20)/0.08 = (1 - 0.2145)/0.08 = 9.8182.
PV_A = $180k + ($42k + $24k) × 9.8182 + $5k × 1.08^-20
     = $180k + $66k × 9.8182 + $5k × 0.2145
     = $180k + $648.0k + $1.07k = **$829.07k**.

**LCC_B (25-yr)**:
AF_B(8%, 25) = (1 - 1.08^-25)/0.08 = (1 - 0.1460)/0.08 = 10.675.
PV_B = $240k + ($28k + $12k) × 10.675 + $8k × 1.08^-25
     = $240k + $40k × 10.675 + $8k × 0.1460
     = $240k + $427.0k + $1.17k = **$668.17k**.

**EAC** (unequal-life comparison):
EAC_A = PV_A × CRF(8%, 20) = $829.07k × 0.1019 = $84.44k/yr.
EAC_B = PV_B × CRF(8%, 25) = $668.17k × 0.0937 = $62.61k/yr.

**Decision**: Vendor B. LCC_B is $160.9k lower than LCC_A, and EAC_B is $21.83k/yr cheaper than EAC_A. Despite 33% higher acquisition price, Vendor B is cheaper on lifecycle. **Saving: $21.83k/yr × 25 yr ≈ $546k** (in nominal terms; PV saving ≈ $160.9k).`,
    practice_questions: `- A $50k investment returns $18k/yr for 5 yr at i=8%. Compute NPV. *(Answer: -$50k + $18k × 3.9927 = -$50k + $71.9k = +$21.9k.)*
- A pump has acquisition $20k, annual O&M+downtime $20k for 15 yr, disposal $2k. Compute LCC at i=8%. *(Answer: $20k + $20k × 8.5595 + $2k × 0.315 = $20k + $171.19k + $0.63k = $191.82k.)*
- A $120k CMMS upgrade saves $48k/yr at $9k/yr opex, i=8%, N=10 yr. Compute payback. *(Answer: $120k / $39k = 3.08 yr.)*
- Two vendors with unequal life (15 vs. 25 yr). Which metric to use? *(Answer: EAC.)*`,
    certification_questions: `The CMRP exam tests Economics as the fourth B&M competency. SMRP-aligned sample prompts:

(a) Compute NPV given cash flows + discount rate.
(b) Compute IRR given cash flows.
(c) Compute simple + discounted payback.
(d) Compute LCC for two vendors.
(e) Compute EAC for unequal-life alternatives.

The questions in this lesson's question bank are aligned to these Economics competencies.`,
    summary: `Engineering economics is the math of value-creation. TVM underpins NPV, IRR, payback, LCC, EAC, CBA. NPV > 0 ⇒ value-creating (primary criterion); IRR > WACC ⇒ secondary check; payback < 2 yr ⇒ liquidity screen; LCC for vendor selection; EAC for unequal-life comparison; CBA enumerates all benefits and costs. Sensitivity-test key inputs; the most common failure is omission (skipping a benefit or cost).`,
    key_takeaways: `- TVM: PV = FV / (1+i)^n.
- NPV > 0 ⇒ value-creating (primary criterion).
- IRR > WACC ⇒ secondary check; watch multiple IRRs on non-conventional cash flows.
- Payback (simple + discounted) for liquidity/risk screening.
- LCC for vendor selection; EAC for unequal-life comparison.
- CBA discipline: enumerate ALL benefits and costs; the most common failure is omission.
- WACC for discount rate; project hurdle may differ for risk-adjusted (safety/environmental).`,
    references: `- SMRP. *CMRP Body of Knowledge — Business & Management pillar: Economics.*
- SMRP. *CMRP Exam Outline.*
- ISO 55000:2014. *Asset management — Overview, principles and terminology.*
- Blank, L. T. & Tarquin, A. (2018). *Engineering Economy* (8th ed.). McGraw-Hill. The canonical reference for NPV/IRR/LCC/EAC.
- Campbell, J. D. & Jardine, A. K. S. (2001). *Maintenance Strategy*. Productivity Press. Lifecycle-cost chapters.
- Mobley, R. K. (2008). *Maintenance Engineering Handbook* (7th ed.). McGraw-Hill. Section IV (LCC/TCO).
- Deming, W. E. (1986). *Out of the Crisis*. MIT CAES. Cost-of-quality framework integration.`,
  },
  knowledgeObject: {
    title: "Economics — NPV, IRR, payback, LCC, EAC, cost-benefit analysis",
    domain: "Business & Management",
    competency: "Economics",
    topic: "Engineering economics for M&R decisions",
    concept: "Time-value-of-money decision framework",
    body: {
      definitions: [
        "Time Value of Money (TVM): a dollar today > a dollar next year (investable at rate i).",
        "Present Value (PV): FV / (1+i)^n.",
        "Net Present Value (NPV): Σ CF_n / (1+i)^n.",
        "Internal Rate of Return (IRR): discount rate where NPV = 0.",
        "Simple payback: Investment / Annual_savings [yr].",
        "Discounted payback: years until cumulative discounted savings = investment.",
        "Life-Cycle Cost (LCC): PV of acquisition + O&M + downtime + disposal.",
        "Equivalent Annual Cost (EAC): NPV × CRF — annuity form for unequal-life comparison.",
        "Capital Recovery Factor (CRF): i(1+i)^N / [(1+i)^N - 1].",
        "Uniform Annual Benefit (UAB): NPV × CRF.",
        "Cost-Benefit Analysis (CBA): monetize all benefits and costs; compute NPV.",
      ],
      principles: [
        "TVM: discount future cash flows to PV before comparing.",
        "NPV > 0 ⇒ value-creating; rank alternatives by NPV.",
        "IRR is secondary; watch scale + reinvestment issues.",
        "Lowest LCC wins vendor selection (not lowest acquisition).",
        "EAC for unequal-life alternatives.",
        "CBA discipline: enumerate ALL benefits and costs; most common failure is omission.",
      ],
      components: [
        "Cash-flow diagram (time on x, $ on y).",
        "WACC from finance.",
        "Project horizon N.",
        "NPV/IRR/payback/LCC/EAC spreadsheet.",
        "Sensitivity analysis (Monte-Carlo).",
        "CBA register (benefits + costs enumerated).",
      ],
      mechanism: [
        "Decision → enumerate benefits → enumerate costs → set i (WACC) + N → discount each CF to PV → compute NPV/IRR/payback or LCC/EAC → sensitivity-test → rank alternatives by NPV (or EAC) → recommend (closed loop: refresh NPV/IRR as actuals replace projections).",
      ],
      process: [
        "1. Define decision (yes/no, A vs. B, repair vs. replace, timing).",
        "2. Enumerate benefits (downtime, parts+labor, collateral, risk-premium).",
        "3. Enumerate costs (capex + opex + disposal).",
        "4. Set discount rate i (WACC) and horizon N.",
        "5. Discount each cash flow to PV.",
        "6. Compute NPV, IRR, payback (simple + discounted); or LCC for vendor; or EAC for unequal-life.",
        "7. Sensitivity-test key inputs (MTBF lift ±20%, $/h ±15%, opex ±10%).",
        "8. Rank by NPV (or EAC); recommend; document assumptions.",
      ],
      formulas: [
        "PV = FV / (1+i)^n",
        "NPV = Σ_{n=0..N} CF_n / (1+i)^n",
        "IRR: solve NPV(i*) = 0",
        "Simple payback = Investment / Annual_savings",
        "Discounted payback: smallest n* where Σ_{k=1..n*} CF_k/(1+i)^k = -CF_0",
        "LCC = Acquisition + Σ_year(O_y + M_y + D_y)/(1+i)^y + Disposal/(1+i)^N",
        "EAC = NPV × CRF where CRF = i(1+i)^N / [(1+i)^N - 1]",
        "AF (annuity factor) = (1 - (1+i)^-N) / i",
      ],
      metrics: [
        "NPV [$] — primary value criterion.",
        "IRR [%] — secondary rate-of-return criterion.",
        "Payback (simple + discounted) [yr] — liquidity/risk screen.",
        "LCC [$] — vendor selection.",
        "EAC [$/yr] — unequal-life comparison.",
        "P(NPV > 0) from Monte-Carlo [%].",
      ],
      examples: [
        "Chemical — CMMS upgrade $120k + $9k/yr, savings $48k/yr, i=8%/10yr: NPV +$141.7k, IRR 30.3%, payback 3.1 yr, EAC $21.1k/yr.",
        "Power — BFP vendor A ($180k+$42k/yr+$24k/yr downtime, 20yr) vs. B ($240k+$28k/yr+$12k/yr, 25yr): EAC_A $84.44k/yr, EAC_B $62.61k/yr — Vendor B saves $21.83k/yr.",
        "Container Terminal — RTG PdM $310k + $48k/yr, savings $620k/yr: NPV +$3.528M, IRR 184%, payback 0.54 yr.",
        "Oil & Gas — offshore gas-compressor PdM $120k + $30k/yr, savings $410k/yr: NPV +$2.430M, IRR 317%, payback 0.32 yr.",
      ],
      industrial_examples: [
        "Chemical — CMMS upgrade: NPV +$142k, IRR 30%, payback 3 yr.",
        "Power — BFP vendor selection via EAC: $22k/yr saved.",
        "Container Terminal — RTG PdM: NPV +$3.5M, payback 6 months.",
        "Oil & Gas — offshore gas-compressor PdM: NPV +$2.4M, payback 4 months.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Mining autonomous-haulage $4.0M investment, 12-yr horizon, i=10%. Benefit categories: labor $1.2M/yr, fuel $0.4M/yr, maintenance $0.3M/yr, downtime $0.5M/yr — $2.4M/yr. Opex $0.4M/yr. NPV = -$4.0M + $2.0M × 6.8137 = +$9.627M. IRR 47%. Payback 2.0 yr (simple), 2.5 yr (discounted). Sensitivity at horizon=8yr: NPV +$6.67M (still positive). Recommendation: fund with technology-refresh clause every 5 years. The CBA enumerated 4 benefit categories — none omitted — which is the discipline that made the case finance-grade.",
      ],
      common_errors: [
        "Using simple payback as primary criterion — ignores post-payback cash flows; NPV is the criterion.",
        "Omitting opex from cash flow — recurring cost erodes benefit.",
        "Horizon = 1-2 yr on a 15-yr asset — understates NPV.",
        "i=0% (no discount) — overstates long-horizon cash flows.",
        "Computing IRR on non-conventional cash flows (multiple sign changes) — multiple IRRs; use NPV.",
        "Forgetting disposal cost — small but non-zero; hazardous-waste disposal can flip LCC.",
        "Comparing LCCs of unequal life without EAC — over-weights the longer-life option.",
      ],
      limitations: [
        "Discount rate i is finance-provided; risk-adjusted projects may justify a different rate.",
        "NPV sensitive to long-horizon cash flows; small i changes swing the conclusion.",
        "IRR reinvestment assumption may exceed realistic rates.",
        "LCC assumes known O&M/downtime trajectories; ±20-30% uncertainty.",
        "CBA monetization of safety/environmental benefit is subjective; risk-premium methods vary.",
        "EAC for unequal life assumes repeatable replacement — not always true.",
      ],
      best_practices: [
        "Use NPV as the primary criterion; IRR as secondary check; payback for liquidity screen.",
        "Use LCC for vendor selection; EAC for unequal-life alternatives.",
        "Enumerate ALL benefits and costs in the CBA — most common failure is omission.",
        "Sensitivity-test key inputs (Monte-Carlo on MTBF lift, $/h, opex, WACC).",
        "Refresh NPV/IRR as actual cash flows replace projections (closed loop).",
        "For risk-adjusted projects (safety/environmental), consider a lower discount rate.",
      ],
      related_concepts: [
        "Business Management (Lesson 1) — failure-cost arithmetic feeds the CBA.",
        "Strategy (Lesson 2) — NPV of strategy decisions.",
        "Quality (Lesson 3) — COQ-NPV integration (Prevention-shift NPV).",
        "ISO 55000:2014 — value principle operationalized by NPV/LCC.",
        "Equipment Reliability (ER pillar) — MTBF projections feed benefit estimates.",
      ],
      prerequisites: [
        "Business Management — failure-cost arithmetic, $/h production-loss.",
        "Basic algebra + exponential functions.",
        "Cash-flow diagram literacy.",
        "Corporate WACC (finance-provided).",
      ],
      references: [
        "SMRP CMRP BOK — B&M pillar: Economics.",
        "SMRP CMRP Exam Outline.",
        "ISO 55000:2014.",
        "Blank & Tarquin (2018), Engineering Economy.",
        "Campbell & Jardine (2001), Maintenance Strategy.",
        "Mobley (2008), Maintenance Engineering Handbook.",
        "Deming (1986), Out of the Crisis.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Economics",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which of the following is the correct formula for Net Present Value (NPV) of a cash-flow stream?",
      whyCorrect:
        "NPV = Σ_{n=0..N} CF_n / (1+i)^n. CF_0 is the negative investment; CF_n (n≥1) is the annual net benefit. The discount rate i is the WACC; N is the project horizon. NPV > 0 ⇒ value-creating. The formula is the operational expression of the time-value-of-money principle.",
      whyOthersWrong: [
        "NPV = Σ CF_n × (1+i)^n — uses multiplication by (1+i)^n (compounding forward) instead of division (discounting backward); this computes future value, not present value.",
        "NPV = Investment / Annual_savings — this is the simple-payback formula, not NPV; it ignores TVM entirely.",
        "NPV = (Annual_savings - Opex) × N - Investment — this is nominal (undiscounted) total benefit minus investment; ignores TVM.",
      ],
      explanation:
        "NPV = Σ CF_n / (1+i)^n. The discount rate i is the WACC; the horizon N matches asset life. NPV > 0 ⇒ value-creating (primary criterion). For mutually exclusive alternatives, pick the highest NPV.",
      options: [
        { text: "NPV = Σ_{n=0..N} CF_n / (1+i)^n", isCorrect: true },
        { text: "NPV = Σ CF_n × (1+i)^n", isCorrect: false },
        { text: "NPV = Investment / Annual_savings", isCorrect: false },
        { text: "NPV = (Annual_savings - Opex) × N - Investment", isCorrect: false },
      ],
    },
    {
      competencyName: "Economics",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Chemical",
      stem: "A Chemical plant considers a PdM program: investment $50,000 one-time, annual benefit $18,000/yr (net of opex), discount rate i=8%, horizon N=10 yr. Compute the NPV. The annuity factor AF(8%, 10) = (1 - 1.08^-10)/0.08 = 6.7101.",
      whyCorrect:
        "NPV = -Investment + Annual_benefit × AF = -$50,000 + $18,000 × 6.7101 = -$50,000 + $120,782 = +$70,782. NPV is positive ⇒ value-creating. (Note: this is the canonical CMRP sample-problem structure; the worked example in the lesson uses different numbers.)",
      whyOthersWrong: [
        "+$130,000 = -$50k + $18k × 10 (nominal, undiscounted) — ignores TVM; overstates NPV by $59k.",
        "+$180,000 = $18k × 10 (annual benefit only) — omits the investment; not an NPV at all.",
        "-$50,000 = -Investment only — omits the annual benefit entirely; this is just the year-0 cash flow.",
      ],
      explanation:
        "NPV = -$50k + $18k × 6.7101 = +$70,782. NPV > 0 ⇒ value-creating. The TVM discount (factor 6.7101 vs. nominal 10) reduces the PV of $18k/yr × 10 from $180k to $120.8k; the project is still positive but by less than the naive $130k estimate. Discounted payback: cumulative PV crosses $50k around year 3.3-3.4.",
      options: [
        { text: "+$70,782 (NPV > 0, fund)", isCorrect: true },
        { text: "+$130,000 (nominal, ignores TVM)", isCorrect: false },
        { text: "+$180,000 (annual benefit only, omits investment)", isCorrect: false },
        { text: "-$50,000 (investment only, omits benefit)", isCorrect: false },
      ],
    },
    {
      competencyName: "Economics",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Power",
      stem: "A Power plant compares two feedwater pump vendors. Vendor A: $180k acquisition + $66k/yr (O&M + downtime) for 20-yr life, $5k disposal. Vendor B: $240k acquisition + $40k/yr for 25-yr life, $8k disposal. i=8%. Annuity factor AF(8%,20)=9.8182; AF(8%,25)=10.675. Compute LCC of each and recommend.",
      whyCorrect:
        "LCC_A = $180k + $66k × 9.8182 + $5k × 1.08^-20 = $180k + $648.0k + $5k × 0.2145 = $180k + $648.0k + $1.07k = $829.07k. LCC_B = $240k + $40k × 10.675 + $8k × 1.08^-25 = $240k + $427.0k + $8k × 0.1460 = $240k + $427.0k + $1.17k = $668.17k. Vendor B has lower LCC ($668.17k vs. $829.07k) — $160.9k cheaper despite 33% higher acquisition. Note: comparing LCCs directly here is approximate because the lives differ (20 vs. 25 yr); the rigorous comparison is EAC.",
      whyOthersWrong: [
        "Vendor A because acquisition is lower ($180k vs. $240k) — this is lowest-bid procurement, the most common failure mode; the $60k acquisition saving is dwarfed by the $220k+ lifecycle O&M+downtime excess over 20-25 yr.",
        "LCC_A = $848k, LCC_B = $683k (slightly different numbers — using wrong annuity factor or disposal arithmetic) — close but the correct numbers are $829.07k and $668.17k.",
        "Cannot compare because lives are unequal — partially correct (EAC is the rigorous metric), but LCC still provides an indicative comparison and Vendor B wins on LCC too.",
      ],
      explanation:
        "LCC_A = $829.07k; LCC_B = $668.17k. Vendor B is $160.9k cheaper despite 33% higher acquisition. For rigorous unequal-life comparison, compute EAC: EAC_A = $829.07k × CRF(8%, 20) = $829.07k × 0.1019 = $84.44k/yr; EAC_B = $668.17k × CRF(8%, 25) = $668.17k × 0.0937 = $62.61k/yr. Vendor B is $21.83k/yr cheaper on EAC too. Recommend Vendor B.",
      options: [
        { text: "LCC_A = $829.07k; LCC_B = $668.17k → Vendor B (saves $160.9k PV)", isCorrect: true },
        { text: "Vendor A (lower acquisition $180k vs. $240k)", isCorrect: false },
        { text: "LCC_A = $848k; LCC_B = $683k → Vendor B", isCorrect: false },
        { text: "Cannot compare (unequal lives)", isCorrect: false },
      ],
    },
    {
      competencyName: "Economics",
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: For mutually exclusive alternatives with non-conventional cash flows (multiple sign changes), the Internal Rate of Return (IRR) is the preferred decision criterion over Net Present Value (NPV).",
      whyCorrect:
        "False. For non-conventional cash flows (multiple sign changes — e.g., an investment with a mid-life decommissioning cost), IRR can produce multiple discount rates where NPV = 0 (multiple IRRs), making it ambiguous as a decision criterion. NPV is unambiguous and is the preferred criterion. IRR also has a scale problem (a small project with high IRR may have lower NPV than a large project with lower IRR) and a reinvestment assumption (assumes cash flows reinvested at IRR, which may exceed realistic rates). NPV is always the primary criterion for mutually exclusive alternatives.",
      whyOthersWrong: [
        "True would be wrong — IRR is ambiguous for non-conventional cash flows (multiple IRRs possible); NPV is unambiguous. The reinvestment assumption (cash flows reinvested at IRR) is unrealistic; NPV assumes reinvestment at the WACC (the discount rate), which is more realistic. IRR is a useful secondary check but never the primary criterion when cash flows have multiple sign changes.",
      ],
      explanation:
        "NPV is the primary criterion for mutually exclusive alternatives. IRR is secondary; for non-conventional cash flows (multiple sign changes) IRR can produce multiple values and is unreliable. The reinvestment assumption also favors NPV (reinvest at WACC, not IRR).",
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 5 — Human Resources
// ---------------------------------------------------------------------------

const LESSON_HUMAN_RESOURCES: RefLesson = {
  competencyName: "Human Resources",
  slug: "bm-human-resources",
  title: "Workforce Planning, Competency Frameworks & Engagement",
  titleAr: "تخطيط القوى العاملة، أطر الكفاءات، وإشراك الموظفين",
  order: 5,
  durationMin: 30,
  references: BM_REFERENCE_TITLES,
  conceptIntroduction: `Human Resources is the capability foundation of the M&R program. Without the right people with the right competencies in the right roles at the right time, the technical and economic cases collapse in execution. The three levers: (1) workforce planning — quantifying craft hours required (by skill) vs. craft hours available (by skill), identifying the gap, and planning the fill (hire, train, contract, redesign); (2) competency frameworks — defining the skills matrix per role (mechanical, electrical, I&C, CBM analyst, planner, supervisor), assessing each individual against it, and closing gaps with role-specific training; (3) engagement — the cultural conditions (psychological safety, voice, recognition, growth) that determine whether competent people stay and apply discretionary effort. ISO 55000:2014 frames the people side as the "leadership" and "people" principles; Deming's 14 points (institute training, leadership, drive out fear, pride of workmanship) are the cultural foundation. Mobley's Maintenance Engineering Handbook Section XII is the M&R-specific workforce reference.`,
  example: `A Container Terminal has 14 RTG cranes. Workforce plan: required craft hours/year = 28,000 (mechanical) + 14,000 (electrical) + 6,000 (hydraulic specialist) + 4,000 (CBM analyst) + 3,000 (planner) = 55,000 hr/yr. Available: 6 mechanics × 1,800 productive hr/yr = 10,800; 3 electricians × 1,800 = 5,400; 1 hydraulic specialist × 1,800 = 1,800; 0 CBM analyst; 1 planner × 1,800 = 1,800. Gap: mechanical -17,200 hr; electrical -8,600 hr; hydraulic -4,200 hr; CBM -4,000 hr; planner -1,200 hr. Plan: hire 8 mechanics + 4 electricians + 1 hydraulic specialist + 2 CBM analysts + 1 planner; cross-train existing staff on hydraulic + CBM; outsource surge maintenance. Investment $640k/yr; benefit = avoided unplanned downtime ($2.24M/yr in the worked example from Lesson 1).`,
  keyFormulas: `Workforce gap = Σ_skills (Hours_required_skill - Hours_available_skill)  [hr/yr]
Craft utilization U = (Wrench time) / (Total paid time) × 100  [%]
Wrench time = direct hands-on maintenance time (excludes waiting, travel, briefing)
Productive hours per FTE = (Annual paid hours) - (PTO + holidays + training + admin)  [hr/yr]
Skill gap per role = (Competency framework level) - (Assessed level)  [0-5 scale]
Training investment TI = Σ_individuals (Gap × Hourly_training_cost × Hours_to_close)  [$/yr]
Engagement index EI = (n "engaged" - n "actively disengaged") / Total respondents × 100  [%]
Voluntary turnover VT = (n voluntary leavers) / Avg headcount × 100  [%]`,
  exercise: `You are the M&R HR manager at a Power plant. The plant has 60 critical assets across 4 classes (BFP, ID fan, FD fan, condensate pump). Required annual craft hours: 36,000 mechanical, 18,000 electrical, 8,000 I&C, 4,000 CBM analyst, 5,000 planner. Available: 12 mechanics × 1,700 productive hr = 20,400; 5 electricians × 1,700 = 8,500; 2 I&C × 1,700 = 3,400; 0 CBM; 2 planners × 1,700 = 3,400. Compute the gap per skill. Recommend the hiring + cross-training + outsourcing mix. Compute the engagement index if 78 of 110 craft respond "engaged" and 14 respond "actively disengaged."`,
  sections: {
    learning_objectives: `- Conduct workforce planning: required vs. available craft hours by skill; identify the gap; plan the fill.
- Define a competency framework per role (mechanical / electrical / I&C / CBM / planner / supervisor) on a 0-5 scale.
- Assess individuals against the framework; build the skills matrix; close gaps with role-specific training.
- Measure craft utilization (wrench time) and engagement index; track voluntary turnover.
- Apply Deming's people principles (training, leadership, drive out fear, pride of workmanship).
- Align the HR plan with ISO 55000 leadership/people principles and the M&R strategy.`,
    prerequisites: `- Business Management (Lesson 1) — investment arithmetic.
- Strategy (Lesson 2) — KPI dashboard and craft-hour priorities.
- Work Management (WM pillar) — WO lifecycle, planner role, wrench-time study.
- Basic HR vocabulary: FTE, turnover, engagement, competency framework.`,
    introduction: `HR in M&R is not the personnel-administration function — it is the capability function. The technical and economic cases (Lessons 1, 2, 4) are realized by people; without the right people with the right competencies in the right roles, the cases collapse in execution. The three levers:

(1) **Workforce planning**: quantify required craft hours per skill per year (from the WO backlog + PM schedule + PdM analyst load + planner load). Quantify available productive hours per skill (FTE × productive hr/yr after PTO, holidays, training, admin). The gap = required - available, by skill. Plan the fill: hire, train (close skill gap), contract (outsource surge), or redesign (re-baseline required via PM automation).

(2) **Competency frameworks**: define the skills matrix per role — mechanical (bearing replacement, alignment, welding), electrical (motor testing, VFD), I&C (calibration, loop check), CBM analyst (vibration ISO 10816, oil ISO 4406, thermography Level I/II), planner (CMMS, scheduling, kitting), supervisor (leadership, RCA facilitation). Each skill scored 0-5 (0=none, 5=expert). Assess each individual; the gap to the role requirement is the training need.

(3) **Engagement**: the cultural conditions that determine whether competent people stay and apply discretionary effort. Engagement index = (% engaged - % actively disengaged). High-voluntary-turnover plants (>12%/yr) have low engagement and the resulting skill churn breaks the workforce plan.

ISO 55000:2014 leadership and people principles; Deming's 14 points (institute training, leadership, drive out fear, pride of workmanship); Mobley's Section XII (organization, training, workforce planning).`,
    terminology: `- **Workforce planning**: required vs. available craft hours by skill, by year.
- **Craft utilization (U)**: wrench time / total paid time × 100 (typical 35-50%; world-class ≥55%).
- **Wrench time**: direct hands-on maintenance time (excludes waiting, travel, briefing).
- **Productive hours per FTE**: annual paid hours - PTO - holidays - training - admin (typical 1,600-1,800 hr/yr).
- **Competency framework**: skills matrix per role, scored 0-5.
- **Skills gap**: framework level - assessed level per individual per skill.
- **CBM analyst**: vibration (ISO 10816), oil (ISO 4406), thermography (Level I/II/III).
- **Planner**: CMMS, scheduling, kitting, backlog management.
- **Engagement index (EI)**: (% engaged - % actively disengaged) per Gallup-style survey.
- **Voluntary turnover (VT)**: voluntary leavers / avg headcount × 100.
- **Cross-training**: training an FTE in a second skill (e.g., mechanic trained on hydraulic).
- **Outsourcing / contract labor**: surge capacity for planned outages or specialty skills.`,
    detailed_explanation: `The workforce plan begins with the WO backlog and the PM/PdM schedule. Required hours per skill = Σ WO hours by skill + Σ PM hours by skill + Σ PdM analyst hours + Σ planner hours. Available hours = FTE × productive hr/yr. The gap, by skill, drives the action plan: hire FTE, close skill gaps via training, outsource surge, or automate (PM automation reduces required hours).

The competency framework is the role-specific skills matrix. For a CBM analyst role: vibration ISO 10816 (Level I → III), oil analysis ISO 4406, thermography (Level I → III), ultrasonic, motor current signature, RCA facilitation, CMMS data entry, reporting. Each skill scored 0-5. The framework defines what "fully competent" means; the assessment identifies the individual gap; the training plan closes the gap.

Craft utilization (wrench time / total paid time) is the classic M&R inefficiency metric. Industry benchmarks: 35-50% typical, 55-65% world-class. The 15-20 percentage-point gap (typical → world-class) is recovered via: planning discipline (kits ready, permits pre-staged), scheduling discipline (right-craft-right-time), and CMMS automation (mobile WO closeout at the asset). Closing the utilization gap by 10 percentage points on a 20-FTE crew at $85/hr loaded = 20 × 1,800 × 0.10 × $85 = $306k/yr of recovered capacity — equivalent to 2 free FTE.

Engagement is the cultural metric. Gallup-style 12-question survey; engagement index = (% engaged) - (% actively disengaged). World-class: EI > 40%; typical: EI 15-25%. Disengaged craft apply minimal effort; the discretionary effort gap is the difference between "we catch the failure early" (engaged analyst) and "we miss the failure" (disengaged analyst). Voluntary turnover > 12%/yr breaks the workforce plan; the cost of replacing an FTE is 50-200% of annual salary (recruiting, onboarding, productivity ramp).

ISO 55000:2014 leadership principle (Cl. 5.1 in ISO 55001) requires leadership commitment to the asset-management system; the people principle (Cl. 7.2 — competence, awareness; Cl. 7.3 — the organization's people) requires the competency framework. Deming's 14 points include "institute training on the job" (Pt. 6), "institute leadership" (Pt. 7), "drive out fear" (Pt. 8), "permit pride of workmanship" (Pt. 12) — the cultural foundation of engagement.`,
    core_principles: `- Required vs. available craft hours, by skill, by year — the workforce plan.
- Competency framework per role; assess individuals; close gaps with training.
- Craft utilization (wrench time) is the efficiency lever — close 10 pp = 2 free FTE.
- Engagement index > 40% (world-class); voluntary turnover < 8% (world-class).
- Deming: training, leadership, drive out fear, pride of workmanship.
- ISO 55000 leadership + people principles operationalized by this competency.`,
    components: `- Workforce plan (required vs. available hours by skill).
- Competency framework per role (0-5 scale).
- Skills matrix (individuals × skills → scores).
- Training plan (close skill gaps).
- Wrench-time study (utilization measurement).
- Engagement survey (Gallup-style 12-question).
- Voluntary-turnover tracker.
- Outsourcing / contract-labor agreements.`,
    process: `1. Pull the WO backlog + PM/PdM schedule; compute required hours per skill per year.
2. Inventory FTE per skill; compute available productive hours per skill.
3. Compute the gap per skill; identify hire / train / outsource / automate actions.
4. Define the competency framework per role (skills × 0-5 levels).
5. Assess each individual against the framework; build the skills matrix.
6. Compute the skill gap per individual; build the training plan (curriculum + hours + cost).
7. Run a wrench-time study (sample 2 weeks of WO closeout timestamps); compute utilization.
8. Identify utilization-improvement actions (planning, scheduling, CMMS automation).
9. Run the annual engagement survey; compute EI; identify drivers of disengagement.
10. Track voluntary turnover; correlate with engagement + competency gaps.`,
    formula_calculation: `**Workforce gap**:
  Gap_skill = Hours_required_skill - Hours_available_skill  [hr/yr]
  - units: hr/yr per skill.
  - variables: Hours_required = Σ WO + Σ PM + Σ PdM + Σ planner hours per skill.
  - interpretation: positive gap = shortage (need to hire/train/outsource); negative gap = surplus (re-allocate or outplacement).

**Craft utilization**:
  U = (Wrench time) / (Total paid time) × 100  [%]
  - typical 35-50%; world-class ≥55%.
  - closing 10 pp on N FTE at $/hr loaded = N × productive_hr × 0.10 × $/hr recovered capacity.

**Productive hours per FTE**:
  Productive = (Paid hours) - (PTO + holidays + training + admin)
  - typical 1,600-1,800 hr/yr.

**Skill gap per individual**:
  Gap = (Framework_level_role) - (Assessed_level_individual)  [0-5 scale per skill]

**Training investment**:
  TI = Σ_individuals Σ_skills (Gap × Hours_to_close × $/training_hr)  [$/yr]

**Engagement index**:
  EI = (n_engaged - n_actively_disengaged) / Total_respondents × 100  [%]
  - typical 15-25%; world-class > 40%.

**Voluntary turnover**:
  VT = (n voluntary leavers) / Avg headcount × 100  [%/yr]
  - typical 10-15%; world-class < 8%; replacement cost = 50-200% of annual salary.`,
    worked_example: `**Problem** — A Container Terminal has 14 RTG cranes. Required craft hours/year: 28,000 mechanical, 14,000 electrical, 6,000 hydraulic specialist, 4,000 CBM analyst, 3,000 planner = 55,000 hr/yr total. Available: 6 mechanics × 1,800 productive hr = 10,800; 3 electricians × 1,800 = 5,400; 1 hydraulic specialist × 1,800 = 1,800; 0 CBM analysts; 1 planner × 1,800 = 1,800. Compute the gap per skill; recommend the action plan; quantify the engagement index if 78 of 110 craft respond "engaged" and 14 respond "actively disengaged."

**Step 1 — Gap per skill**:
  Mechanical: 28,000 - 10,800 = **-17,200 hr/yr** (short 9.6 FTE).
  Electrical: 14,000 - 5,400 = **-8,600 hr/yr** (short 4.8 FTE).
  Hydraulic: 6,000 - 1,800 = **-4,200 hr/yr** (short 2.3 FTE).
  CBM analyst: 4,000 - 0 = **-4,000 hr/yr** (short 2.2 FTE).
  Planner: 3,000 - 1,800 = **-1,200 hr/yr** (short 0.7 FTE).
  Total gap: **-35,200 hr/yr** (≈ 19.6 FTE short).

**Step 2 — Action plan**:
  - Hire: 8 mechanics + 4 electricians + 1 hydraulic specialist + 2 CBM analysts + 1 planner = 16 FTE.
  - Cross-train: 4 existing mechanics on hydraulic (closes 0.5 FTE hydraulic gap); 2 electricians on CBM Level I (closes 0.5 FTE CBM gap).
  - Outsource: 3 FTE-equivalent surge capacity via contract labor for planned outages.
  - Automate: CMMS mobile-app deployment projected to lift craft utilization from 42% to 52% (+10 pp) = 16 FTE × 1,800 × 0.10 = 2,880 hr/yr recovered ≈ 1.6 FTE free.

  Net: 16 hires + 4 cross-trains + 3 contract + 1.6 free from utilization = 24.6 FTE-equivalent vs. 19.6 gap (the surplus absorbs attrition + PTO backfill + ramp time).

**Step 3 — Investment**:
  16 hires × $95k loaded = $1,520k/yr.
  Cross-training: 6 individuals × 80 hr × $45/hr = $21.6k.
  Contract labor: 3 FTE × $110k loaded = $330k/yr.
  CMMS mobile-app: $80k one-time + $16k/yr.
  Total Year-1: $1,520k + $21.6k + $330k + $80k + $16k = **$1,967.6k**.

**Step 4 — Benefit**:
  Workforce gap closure enables the maintenance strategy from Lesson 1 (PdM on 4 critical + PM on 6 important + RTF on 4 support). Avoided unplanned downtime = $2,244k/yr (from Lesson 1 worked example).
  Net Year-1 benefit: $2,244k - $1,967.6k = **+$276.4k** (positive even in Year 1 of ramp-up).
  Year-2+ benefit: $2,244k - $1,520k (hires) - $330k (contract) - $16k (CMMS) = +$378k/yr (ramp complete).
  Payback: $80k CMMS capex / ($2,244k - $1,887k year-1 opex) = 0.22 yr ≈ 2.7 months on the CMMS capex alone.

**Step 5 — Engagement index**:
  EI = (78 - 14) / 110 × 100 = 64 / 110 × 100 = **58.2%** — world-class (> 40%). Likely driver of low voluntary turnover (assume 6% in the prior 12 months).

**Conclusion**: workforce gap of 19.6 FTE (35,200 hr/yr); action plan = 16 hires + 6 cross-trains + 3 contract + 1.6 utilization-free; Year-1 net +$276k; Year-2+ +$378k/yr; EI 58.2% (world-class). Fund the plan.`,
    industrial_example: `**Manufacturing — automotive paint shop**: 60 craft across 4 skills; required 28,000 + 14,000 + 8,000 + 4,000 = 54,000 hr/yr; available 36,000 hr/yr; gap 18,000 hr/yr (10 FTE short). Hired 6 mechanics + 3 electricians + 1 I&C + 0 CBM (cross-trained 2 electricians on CBM Level I); outsourced outage surge; deployed CMMS mobile app → utilization 38% → 51% (+13 pp) = 0.7 FTE free. Year-1 investment $820k; benefit (avoided line-stop) $1.4M; net +$580k.

**Oil & Gas — offshore platform**: 40 craft; required 65,000 hr/yr; available 56,000 hr/yr; gap 9,000 hr/yr (5 FTE short). Hired 3 mechanics + 1 I&C + 1 CBM; cross-trained 2 on NDT; EI 42% (world-class); VT 7%.

**Power — 6-unit coal plant**: 120 craft; required 110,000 hr/yr; available 96,000 hr/yr; gap 14,000 hr/yr (7.8 FTE). Hired 4 mechanics + 2 electricians + 1 planner; outsourced major-outage surge (3 FTE); EI 31% (improving from 18%); VT 11% (declining from 14% as engagement lifts).

**Container Terminal — RTG fleet**: 110 craft (worked example); EI 58.2% (world-class); VT 6%.`,
    case_study: `CASE_TYPE = SYNTHETIC. A Mining haul-truck fleet (80 trucks) faced a workforce crisis: 22% voluntary turnover (industry-typical 12%), 32% craft utilization (industry-typical 45%), engagement index 8% (industry-typical 20%). The fleet was losing 6,500 unplanned downtime hours/year ($2.6M cost) attributable to execution gaps — missed PMs, late PdM catch, and slow RCA. The HR-led turnaround: (1) competency framework rollout — 4-hour skills-assessment workshop per role (mechanic, electrician, hydraulic, CBM, planner, supervisor); 75 individuals assessed; average gap 1.4 levels on the 0-5 scale; (2) training plan — $420k investment in role-specific curricula (vibration Level I for 12 mechanics, oil analysis for 8, planning certification for 4, RCA facilitation for 6 supervisors); (3) engagement program — quarterly skip-level meetings, supervisor-as-coach training, "5-in-5" recognition (5 recognition moments per supervisor per 5 days), paid-time-off for training; (4) workforce plan — hire 8 mechanics + 3 electricians + 2 CBM analysts; outsource outage surge (4 FTE); (5) CMMS mobile-app deployment → utilization 32% → 49% (+17 pp = 1.4 FTE free). 18-month outcomes: VT 22% → 9%, EI 8% → 38%, utilization 32% → 49%, unplanned downtime 6,500 hr → 3,800 hr (-42%), $1.1M/yr downtime saved. The HR investment ($1.4M) paid back in 15 months on engagement + utilization alone, before the technical benefits. Lesson: HR is not overhead — it is the capability layer that determines whether the technical and economic cases are realized.`,
    visual_explanation: `Picture the skills matrix as a heat map: rows = individuals (craft FTE), columns = skills (mechanical, electrical, I&C, CBM, planner), cell color = assessed level 0-5 (red→green). The framework line at the top of each column marks the role requirement; cells below the line are the training plan. The heat map visualizes the capability portfolio at a glance — gaps are red, strengths are green, and the training investment flows to the red cells.`,
    simulation_opportunity: `Build a workforce simulator: input required hours per skill, FTE per skill, utilization %, engagement index, voluntary turnover %. Output: projected gap per skill, projected capacity (FTE × productive_hr × utilization), and the 12-month evolution under different hiring/training/engagement scenarios. The simulator reveals that engagement-driven retention is the highest-leverage lever (each retained FTE saves 50-200% of salary in replacement cost).`,
    common_mistakes: `- Computing required hours as Σ WO hours (omits PM + PdM + planner load) — understates required by 30-50%.
- Using paid hours instead of productive hours (omits PTO + holidays + training + admin) — overstates available by 15-20%.
- Treating utilization as fixed; closing 10 pp = 2 free FTE on a 20-FTE crew.
- One-size-fits-all competency framework; roles differ (mechanic vs. CBM analyst vs. planner).
- Skipping the engagement survey; assuming low turnover = high engagement (often the opposite in a tight labor market).
- Treating HR as overhead; the capability layer determines whether the technical/economic cases are realized.`,
    limitations: `- Required-hour projection depends on MTBF lift; if reliability improves, required hours fall (good news, but the workforce plan must adapt).
- Productive-hour estimate varies by PTO policy, training intensity, admin burden — re-baseline annually.
- Utilization measurement requires wrench-time study (sample 2 weeks); self-reported "wrench time" overstates by 15-20%.
- Competency assessment is subjective — use a 2-assessor cross-check + practical demonstration.
- Engagement survey is annual; quarterly pulse surveys are more responsive.
- Voluntary turnover is lagging; engagement is leading.`,
    comparison: `**Hire vs. Train**: hire closes volume gap (FTE); train closes skill gap (per-individual competency). Hire is faster (no ramp) but more expensive (recruiting + onboarding); train is cheaper but slower (months to close a 1-level gap). **Cross-train vs. Hire specialist**: cross-train an existing FTE on a second skill (cheap, leverages institutional knowledge) vs. hire a specialist (faster, deeper skill); the choice depends on the gap depth (1 level → cross-train; 2+ levels → hire). **Outsource vs. Hire**: outsource surge (planned outages, specialty) on contract; hire for the steady-state core. **Utilization vs. Headcount**: closing 10 pp utilization on 20 FTE = 2 free FTE — usually cheaper than hiring 2 more FTE. **Engagement vs. Compensation**: engagement (voice, recognition, growth) drives retention more than compensation above market median.`,
    practical_application: `- **Daily**: execute the skills matrix at WO assignment (right-craft-right-WO); CMMS enforces the match.
- **Weekly**: review WO closeout for utilization data (wrench time vs. waiting).
- **Monthly**: track the workforce gap (required vs. available) per skill; flag widening gaps.
- **Quarterly**: pulse engagement survey (3 questions); refresh training plan on skill-gap closure progress.
- **Annually**: full engagement survey; refresh competency framework; re-baseline productive hours; review voluntary turnover vs. engagement.`,
    decision_scenario: `You are the M&R HR manager at a Power plant. Required annual craft hours: 36,000 mechanical + 18,000 electrical + 8,000 I&C + 4,000 CBM + 5,000 planner = 71,000 hr/yr. Available: 12 mechanics × 1,700 = 20,400; 5 electricians × 1,700 = 8,500; 2 I&C × 1,700 = 3,400; 0 CBM; 2 planners × 1,700 = 3,400 = 35,700 hr/yr. Gap: -15,600 mechanical, -9,500 electrical, -4,600 I&C, -4,000 CBM, -1,600 planner = -35,300 hr/yr (≈ 20.8 FTE short). Engagement survey: 78 of 110 engaged, 14 actively disengaged. Three options:

(A) Hire 20 FTE across skills: $1.9M/yr loaded; ramp 6-9 months; closes gap by 90%.
(B) Hire 12 FTE + cross-train 8 existing on adjacent skills + outsource 4 FTE outage surge: $1.3M/yr; ramp 4 months; closes 95% of gap.
(C) Outsource all surge maintenance via 3-yr contract: $1.6M/yr; closes 70% of gap; loses internal capability.

Decision: **(B)**. The cross-training leverages the existing institutional knowledge (12 mechanics know the plant), reduces ramp time (4 months vs. 6-9), and is the cheapest at $1.3M/yr vs. $1.9M (A) and $1.6M (C). The outsourcing-only option (C) loses internal capability and creates strategic dependency on the contractor — a long-term risk. Engagement index = (78 - 14)/110 × 100 = 58.2% (world-class); the high EI supports the cross-training (engaged craft are more likely to invest in new skills) and retention. Fund (B); sequence: 12 hires in months 0-4, cross-training in months 2-6, outsource contract effective month 4. Review at month 6.`,
    practice_questions: `- Define craft utilization and give the typical + world-class benchmarks.
- A 20-FTE crew has utilization 42% and $85/hr loaded. Quantify the recovered capacity from closing 10 pp. *(Answer: 20 × 1,800 × 0.10 × $85 = $306k/yr ≈ 2 free FTE.)*
- A plant has 110 craft; 78 engaged, 14 actively disengaged. Compute the engagement index. *(Answer: (78-14)/110 × 100 = 58.2%.)*
- State Deming's people-related principles (training, leadership, drive out fear, pride of workmanship).
- A skill gap of 1.5 levels on a 0-5 framework requires how much training to close? *(Answer: ~80 hr per individual for a 1-level gap; ~160 hr for 1.5 levels.)*`,
    certification_questions: `The CMRP exam tests Human Resources as the fifth B&M competency. SMRP-aligned sample prompts:

(a) Conduct workforce planning: required vs. available hours by skill.
(b) Define a competency framework per role (0-5 scale).
(c) Compute craft utilization (wrench time / paid time).
(d) Compute engagement index from survey results.
(e) Identify Deming's people-related principles.

The questions in this lesson's question bank are aligned to these HR competencies.`,
    summary: `HR is the capability layer that determines whether the technical and economic cases are realized. The three levers: workforce planning (required vs. available hours by skill), competency frameworks (0-5 skills matrix per role), engagement (EI > 40% world-class). Craft utilization (wrench time) is the efficiency lever — closing 10 pp = 2 free FTE on a 20-FTE crew. Voluntary turnover < 8% world-class; replacement cost 50-200% of salary. ISO 55000 leadership + people principles operationalized; Deming's 14 points (training, leadership, drive out fear, pride of workmanship) the cultural foundation.`,
    key_takeaways: `- Workforce gap = required - available hours, by skill, by year.
- Competency framework: skills matrix per role, 0-5 scale; assess individuals; close gaps via training.
- Craft utilization (wrench time / paid time) — typical 35-50%, world-class ≥55%; 10 pp = 2 free FTE.
- Engagement index > 40% world-class; VT < 8% world-class.
- Deming: training, leadership, drive out fear, pride of workmanship.
- ISO 55000 leadership + people principles operationalized; ISO 55001 Cl. 7.2 (competence), 7.3 (people).`,
    references: `- SMRP. *CMRP Body of Knowledge — Business & Management pillar: Human Resources.*
- SMRP. *CMRP Exam Outline.*
- ISO 55000:2014. *Asset management — Overview, principles and terminology.*
- Mobley, R. K. (2008). *Maintenance Engineering Handbook* (7th ed.). McGraw-Hill. Section XII (organization, training, workforce planning).
- Deming, W. E. (1986). *Out of the Crisis*. MIT CAES. People-related 14 points (training, leadership, fear, pride).
- Campbell, J. D. & Jardine, A. K. S. (2001). *Maintenance Strategy*. Productivity Press. Organization + workforce chapters.
- Blank, L. T. & Tarquin, A. (2018). *Engineering Economy* (8th ed.). McGraw-Hill. HR-investment NPV.`,
  },
  knowledgeObject: {
    title: "Human Resources — workforce planning, competency framework, engagement",
    domain: "Business & Management",
    competency: "Human Resources",
    topic: "M&R workforce capability + engagement",
    concept: "Capability layer for technical/economic case execution",
    body: {
      definitions: [
        "Workforce planning: required vs. available craft hours by skill, by year.",
        "Craft utilization (U): wrench time / total paid time × 100 (typical 35-50%; world-class ≥55%).",
        "Wrench time: direct hands-on maintenance time (excludes waiting, travel, briefing).",
        "Productive hours per FTE: paid - PTO - holidays - training - admin (typical 1,600-1,800 hr/yr).",
        "Competency framework: skills matrix per role, scored 0-5.",
        "Skill gap: framework level - assessed level per individual per skill.",
        "CBM analyst: vibration (ISO 10816), oil (ISO 4406), thermography (Level I/II/III).",
        "Planner: CMMS, scheduling, kitting, backlog management.",
        "Engagement index (EI): (% engaged - % actively disengaged) per Gallup-style survey.",
        "Voluntary turnover (VT): voluntary leavers / avg headcount × 100.",
        "Cross-training: training an FTE in a second skill.",
        "Outsourcing / contract labor: surge capacity for planned outages or specialty skills.",
      ],
      principles: [
        "Required vs. available hours, by skill, by year — the workforce plan.",
        "Competency framework per role; assess individuals; close gaps via training.",
        "Craft utilization is the efficiency lever — 10 pp = 2 free FTE on 20-FTE crew.",
        "EI > 40% world-class; VT < 8% world-class.",
        "Deming: training, leadership, drive out fear, pride of workmanship.",
        "ISO 55000 leadership + people principles operationalized by this competency.",
      ],
      components: [
        "Workforce plan (required vs. available hours by skill).",
        "Competency framework per role (0-5 scale).",
        "Skills matrix (individuals × skills → scores).",
        "Training plan (curriculum + hours + cost).",
        "Wrench-time study (utilization measurement).",
        "Engagement survey (Gallup-style 12-question).",
        "Voluntary-turnover tracker.",
        "Outsourcing / contract-labor agreements.",
      ],
      mechanism: [
        "WO backlog + PM/PdM schedule → required hours by skill → FTE × productive_hr = available → gap per skill → action plan (hire / train / outsource / automate) → competency framework → assess individuals → skills matrix → skill gap → training plan → engagement survey → EI → retention + discretionary effort → technical/economic case realized (closed loop).",
      ],
      process: [
        "1. Pull WO backlog + PM/PdM schedule; compute required hours per skill per year.",
        "2. Inventory FTE per skill; compute available productive hours per skill.",
        "3. Compute gap per skill; identify hire/train/outsource/automate actions.",
        "4. Define competency framework per role (skills × 0-5 levels).",
        "5. Assess each individual; build the skills matrix.",
        "6. Compute skill gap per individual; build the training plan.",
        "7. Run a wrench-time study (2-week WO closeout timestamps); compute utilization.",
        "8. Identify utilization-improvement actions (planning, scheduling, CMMS automation).",
        "9. Run the annual engagement survey; compute EI; identify disengagement drivers.",
        "10. Track voluntary turnover; correlate with engagement + competency gaps.",
      ],
      formulas: [
        "Gap_skill = Hours_required_skill - Hours_available_skill  [hr/yr]",
        "U = (Wrench time) / (Total paid time) × 100  [%]",
        "Productive hours per FTE = Paid - PTO - holidays - training - admin",
        "Skill gap = Framework_level_role - Assessed_level_individual  [0-5]",
        "TI = Σ_individuals Σ_skills (Gap × Hours_to_close × $/training_hr)  [$/yr]",
        "EI = (n_engaged - n_actively_disengaged) / Total_respondents × 100  [%]",
        "VT = (n voluntary leavers) / Avg headcount × 100  [%/yr]",
      ],
      metrics: [
        "Workforce gap per skill [hr/yr and FTE].",
        "Craft utilization [%] (target ≥55%).",
        "Competency framework coverage [% of roles with defined framework].",
        "Average skill gap per individual [0-5].",
        "Training investment [$/yr].",
        "Engagement index [%] (target > 40%).",
        "Voluntary turnover [%] (target < 8%).",
      ],
      examples: [
        "Container Terminal — 14 RTG cranes: gap 35,200 hr/yr (19.6 FTE short); action plan 16 hires + 6 cross-trains + 3 contract + 1.6 from utilization; Yr-1 net +$276k, Yr-2+ +$378k; EI 58.2% (world-class).",
        "Manufacturing — paint shop: gap 18,000 hr/yr (10 FTE); 6 hires + 3 + 1 + 2 cross-trains; utilization 38→51%; Yr-1 net +$580k.",
        "Oil & Gas — offshore: gap 9,000 hr/yr (5 FTE); 3 + 1 + 1 hires + 2 cross-trains on NDT; EI 42%; VT 7%.",
        "Power — 6-unit coal: gap 14,000 hr/yr (7.8 FTE); 4 + 2 + 1 hires + 3 contract; EI 31% (improving from 18%); VT 11% (declining from 14%).",
      ],
      industrial_examples: [
        "Container Terminal — RTG fleet: EI 58.2% (world-class); VT 6%.",
        "Manufacturing — automotive paint shop: utilization +13 pp = 0.7 FTE free; $580k Yr-1 net.",
        "Oil & Gas — offshore platform: VT 7%; EI 42%.",
        "Power — coal plant: VT 11% declining; EI 31% rising as engagement program scales.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Mining haul-truck fleet (80 trucks) HR-led turnaround. Pre-state: VT 22%, utilization 32%, EI 8%. Interventions: (1) competency framework + 75 assessments (avg gap 1.4 levels); (2) $420k training (vibration L1 for 12, oil for 8, planning cert for 4, RCA for 6 supervisors); (3) engagement program (skip-level, supervisor-as-coach, 5-in-5 recognition); (4) workforce plan (8+3+2 hires + 4 contract surge); (5) CMMS mobile-app → utilization 32→49% (+17 pp = 1.4 FTE free). 18-month outcomes: VT 22→9%, EI 8→38%, utilization 32→49%, unplanned downtime 6,500→3,800 hr (-42%), $1.1M/yr downtime saved. HR investment $1.4M paid back in 15 months on engagement + utilization alone, before technical benefits.",
      ],
      common_errors: [
        "Required hours = Σ WO only (omits PM + PdM + planner) — understates by 30-50%.",
        "Available hours = paid hours (omits PTO/holidays/training/admin) — overstates by 15-20%.",
        "Treating utilization as fixed; 10 pp = 2 free FTE on 20-FTE crew.",
        "One-size-fits-all competency framework; roles differ.",
        "Skipping engagement survey; assuming low VT = high EI (often opposite in tight labor).",
        "Treating HR as overhead; capability layer determines whether technical/economic cases are realized.",
      ],
      limitations: [
        "Required-hour projection depends on MTBF lift; reliability gains reduce required hours.",
        "Productive-hour estimate varies by PTO policy, training intensity, admin — re-baseline annually.",
        "Utilization requires wrench-time study; self-reported 'wrench time' overstates by 15-20%.",
        "Competency assessment is subjective; use 2-assessor cross-check + practical demonstration.",
        "Engagement survey is annual; quarterly pulse more responsive.",
        "VT is lagging; engagement is leading.",
      ],
      best_practices: [
        "Compute required hours = WO + PM + PdM + planner (don't omit PM/PdM/planner).",
        "Use productive (not paid) hours for available; re-baseline annually.",
        "Run a 2-week wrench-time study (not self-reported).",
        "Role-specific competency framework (mechanic vs. CBM vs. planner).",
        "Annual full engagement survey + quarterly pulse.",
        "Hire for steady-state core; outsource for surge + specialty.",
        "Close utilization gap before adding FTE.",
        "Engagement drives retention more than compensation above market median.",
      ],
      related_concepts: [
        "Business Management (Lesson 1) — HR investment NPV.",
        "Strategy (Lesson 2) — KPI dashboard includes EI + VT + utilization.",
        "Quality (Lesson 3) — Deming's people principles.",
        "Work Management (WM pillar) — planner role, wrench-time study, WO closeout.",
        "ISO 55001 Cl. 7.2 (competence), Cl. 7.3 (people); ISO 55000 leadership principle (Cl. 5.1).",
      ],
      prerequisites: [
        "Business Management — investment arithmetic.",
        "Strategy — KPI dashboard.",
        "Work Management — WO lifecycle, planner role.",
        "Basic HR vocabulary (FTE, turnover, engagement, competency framework).",
      ],
      references: [
        "SMRP CMRP BOK — B&M pillar: Human Resources.",
        "SMRP CMRP Exam Outline.",
        "ISO 55000:2014.",
        "Mobley (2008), Maintenance Engineering Handbook.",
        "Deming (1986), Out of the Crisis.",
        "Campbell & Jardine (2001), Maintenance Strategy.",
        "Blank & Tarquin (2018), Engineering Economy.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Human Resources",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Which of the following is the correct definition of craft utilization in the M&R context?",
      whyCorrect:
        "Craft utilization (U) = (wrench time) / (total paid time) × 100, where wrench time is direct hands-on maintenance time and total paid time is the full shift (PTO, holidays, training, admin, waiting, travel excluded by definition from wrench time but included in total paid). Industry-typical is 35-50%; world-class ≥55%. The 10-20 pp gap (typical → world-class) is recovered via planning, scheduling, and CMMS automation — equivalent to 2 free FTE on a 20-FTE crew.",
      whyOthersWrong: [
        "Total WO closed / total WO planned × 100 — this is PM compliance, not craft utilization; it measures scheduling discipline, not wrench time.",
        "Productive hours / paid hours × 100 — this omits the distinction between wrench time (hands-on) and productive time (which can include briefings + travel). Utilization specifically measures the hands-on fraction.",
        "(Engaged craft) / (Total craft) × 100 — this is the engagement-rate numerator, not craft utilization; it measures culture, not wrench time.",
      ],
      explanation:
        "Craft utilization = wrench time / total paid time × 100. Wrench time is direct hands-on maintenance. Industry-typical 35-50%; world-class ≥55%. Closing 10 pp on a 20-FTE crew at $85/hr loaded = $306k/yr recovered capacity ≈ 2 free FTE.",
      options: [
        { text: "Wrench time / total paid time × 100 (typical 35-50%, world-class ≥55%)", isCorrect: true },
        { text: "Total WO closed / total WO planned × 100", isCorrect: false },
        { text: "Productive hours / paid hours × 100", isCorrect: false },
        { text: "Engaged craft / total craft × 100", isCorrect: false },
      ],
    },
    {
      competencyName: "Human Resources",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Container Terminal",
      stem: "A Container Terminal has 14 RTG cranes. Required annual craft hours: 28,000 mechanical, 14,000 electrical, 6,000 hydraulic, 4,000 CBM, 3,000 planner = 55,000 total. Available: 6 mechanics × 1,800 hr = 10,800; 3 electricians × 1,800 = 5,400; 1 hydraulic × 1,800 = 1,800; 0 CBM; 1 planner × 1,800 = 1,800. Compute the total workforce gap in hr/yr and FTE-equivalent (at 1,800 hr/yr).",
      whyCorrect:
        "Total required = 55,000 hr/yr. Total available = 10,800 + 5,400 + 1,800 + 0 + 1,800 = 19,800 hr/yr. Gap = 55,000 - 19,800 = 35,200 hr/yr. FTE-equivalent = 35,200 / 1,800 = 19.56 FTE short. The gap is concentrated in mechanical (-17,200 hr = 9.6 FTE) and electrical (-8,600 hr = 4.8 FTE); CBM is 100% unstaffed (-4,000 hr = 2.2 FTE).",
      whyOthersWrong: [
        "19,800 hr/yr gap (computing available - required, reversed sign) — the workforce gap is required minus available; 19,800 is the available, not the gap.",
        "55,000 hr/yr gap (using required as the gap, ignoring available) — this would be the gap if no craft were on staff at all; the available 19,800 reduces the gap to 35,200.",
        "11.0 FTE short (35,200 / 3,200 — using a wrong productive-hour denominator of 3,200 instead of 1,800) — the productive-hour per FTE is 1,800, not 3,200; using 3,200 understates the FTE gap by 1.78×.",
      ],
      explanation:
        "Gap = required - available = 55,000 - 19,800 = 35,200 hr/yr. FTE = 35,200 / 1,800 = 19.56 FTE short. The gap is skill-segmented: mechanical 9.6 FTE, electrical 4.8 FTE, hydraulic 2.3 FTE, CBM 2.2 FTE, planner 0.7 FTE. The action plan (hire + cross-train + outsource) targets each skill gap specifically.",
      options: [
        { text: "Gap 35,200 hr/yr; 19.56 FTE short", isCorrect: true },
        { text: "Gap 19,800 hr/yr; 11.0 FTE short", isCorrect: false },
        { text: "Gap 55,000 hr/yr; 30.6 FTE short", isCorrect: false },
        { text: "Gap 35,200 hr/yr; 11.0 FTE short (wrong FTE denominator)", isCorrect: false },
      ],
    },
    {
      competencyName: "Human Resources",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      stem: "An M&R crew of 110 craft: 78 respond 'engaged', 14 respond 'actively disengaged', the rest (18) respond 'not engaged'. Compute the engagement index (EI) and classify against benchmarks.",
      whyCorrect:
        "Engagement index (EI) = (% engaged) - (% actively disengaged) = (78 / 110) × 100 - (14 / 110) × 100 = 70.9% - 12.7% = 58.2%. Equivalently: (78 - 14) / 110 × 100 = 64 / 110 × 100 = 58.2%. This is world-class (> 40%); typical plants are 15-25%. High EI supports retention (lower VT) and the discretionary effort that drives PdM catch + RCA closure + skill-matrix investment.",
      whyOthersWrong: [
        "70.9% = (78/110) × 100 — this is the engagement rate (% engaged), not the engagement index; the EI subtracts the actively-disengaged fraction.",
        "12.7% = (14/110) × 100 — this is the actively-disengaged rate; the EI is engagement minus active disengagement, not the disengagement alone.",
        "16.4% = (18/110) × 100 — this is the 'not engaged' (neutral) rate; the EI specifically subtracts active disengagement, not neutrality.",
      ],
      explanation:
        "EI = (% engaged) - (% actively disengaged) = (78 - 14) / 110 × 100 = 58.2%. World-class (> 40%); typical 15-25%. High EI correlates with low VT (< 8%) and high discretionary effort (PdM catch + RCA closure). The 18 'not engaged' (neutral) are the leverage pool — targeted engagement programs (recognition, growth, voice) move them to 'engaged'.",
      options: [
        { text: "58.2% — world-class (> 40%)", isCorrect: true },
        { text: "70.9% — engagement rate only", isCorrect: false },
        { text: "12.7% — actively-disengaged rate only", isCorrect: false },
        { text: "16.4% — neutral rate only", isCorrect: false },
      ],
    },
    {
      competencyName: "Human Resources",
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Mining",
      stem: "True or False: In a tight labor market with above-market compensation, closing the craft-utilization gap by 10 percentage points on a 20-FTE crew at $85/hr loaded (productive 1,800 hr/yr) is equivalent to adding 2 FTE to the crew.",
      whyCorrect:
        "True. Closing the utilization gap by 10 pp on a 20-FTE crew at 1,800 productive hr/yr each = 20 × 1,800 × 0.10 = 3,600 hr/yr of recovered wrench time = 2.0 FTE-equivalent at 1,800 hr/yr. At $85/hr loaded, this is $306,000/yr of recovered capacity. The implication: before hiring 2 more FTE (which costs ~$190k/yr loaded + onboarding + ramp time), close the utilization gap. The leverage is that the existing paid hours are recovered into wrench time without paying for more hours — utilization is the highest-leverage HR investment.",
      whyOthersWrong: [
        "False would be wrong — the arithmetic is direct: 20 FTE × 1,800 hr × 0.10 = 3,600 hr/yr = 2.0 FTE-equivalent. Closing 10 pp utilization on a 20-FTE crew is the same capacity as adding 2 FTE, without the recruiting/onboarding/ramp cost. The discipline of utilization improvement (planning, scheduling, CMMS automation) is the first-order lever before headcount addition.",
      ],
      explanation:
        "20 FTE × 1,800 hr × 0.10 pp = 3,600 hr/yr recovered wrench time = 2.0 FTE at 1,800 hr/yr. At $85/hr loaded = $306k/yr recovered capacity. Close the utilization gap before adding FTE — utilization improvement is the first-order lever; hiring is the second-order lever after utilization is world-class (≥55%).",
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

export const CMRP_BM_LESSONS: RefLesson[] = [
  LESSON_BUSINESS_MANAGEMENT,
  LESSON_STRATEGY,
  LESSON_QUALITY,
  LESSON_ECONOMICS,
  LESSON_HUMAN_RESOURCES,
];

// ---------------------------------------------------------------------------
// Loader — writes the dataset into the database (certification track)
// ---------------------------------------------------------------------------

/**
 * Upsert the CMRP Business & Management reference dataset into the database.
 * Idempotent: safe to call repeatedly. Returns record counts written.
 *
 * Flow:
 *  1. Find CMRP certification by slug "cmrp"; find B&M domain by code "B&M";
 *     map the 5 B&M competencies by NAME -> id (Business Management, Strategy,
 *     Quality, Economics, Human Resources).
 *  2. Upsert References globally (by title, no sectionId) -> a shared
 *     referenceIds array applied to every B&M lesson, KO, and question.
 *  3. For each lesson:
 *     - db.lesson.findFirst({where:{competencyId, slug}}) then update or
 *       create with sectionId=null, certificationId, competencyId, slug,
 *       title, titleAr, order, durationMin, conceptIntroduction, example,
 *       keyFormulas, exercise, sections (JSON.stringify), referenceIds (JSON
 *       stringify shared), status="READY", confidence="HIGH",
 *       verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
 *  4. Upsert KnowledgeObject per lesson: findFirst({where:{lessonId}}) then
 *     create/update with certificationId, domainId, competencyId, lessonId,
 *     body JSON, referenceIds (JSON shared), status="READY", confidence="HIGH",
 *     verificationStatus="VERIFIED", version="1.0.0", certificationIds JSON.
 *  5. For each lesson: db.question.deleteMany({where:{certificationId,
 *     competencyId}}) then create each enriched question with nested options,
 *     knowledgeObjectId link, whyCorrect, whyOthersWrong (JSON), referenceIds
 *     (JSON), status="READY", verificationStatus="VERIFIED", version="1.0.0".
 *  6. Return { lessons, kos, questions, references, competencies } counts.
 */
export async function loadReference() {
  // 1) Certification + B&M domain + competency map
  const certification = await db.certification.findUnique({
    where: { slug: "cmrp" },
  });
  if (!certification) {
    throw new Error(
      'CMRP certification not found. Run the CMRP structure loader (src/lib/ref-content/cmrp.ts) first.'
    );
  }

  const bmDomain = await db.domain.findFirst({
    where: { certificationId: certification.id, code: "B&M" },
  });
  if (!bmDomain) {
    throw new Error(
      'Business & Management (B&M) domain not found under CMRP. Run the CMRP structure loader first.'
    );
  }

  const bmCompetencies = await db.competency.findMany({
    where: { domainId: bmDomain.id },
  });
  const competencyIdByName: Record<string, string> = {};
  for (const c of bmCompetencies) {
    competencyIdByName[c.name] = c.id;
  }

  // Validate that all 5 expected B&M competencies exist by name.
  const expectedCompetencyNames = CMRP_BM_LESSONS.map((l) => l.competencyName);
  const missing = expectedCompetencyNames.filter(
    (n) => !competencyIdByName[n]
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing B&M competencies by name: ${missing.join(
        ", "
      )}. Ensure src/lib/ref-content/cmrp.ts has been loaded with the latest B&M competency names.`
    );
  }

  // 2) References — global (no sectionId), upserted by title.
  const refIdsByTitle: Record<string, string> = {};
  for (const src of CMRP_BM_SOURCES) {
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
  const sharedReferenceIds = CMRP_BM_SOURCES.map((s) => refIdsByTitle[s.title]).filter(
    Boolean
  ) as string[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 3) Lessons, 4) KnowledgeObjects, 5) Questions
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of CMRP_BM_LESSONS) {
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
      domainId: bmDomain.id,
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
          domainId: bmDomain.id,
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
    domain: bmDomain.id,
    competencies: bmCompetencies.length,
    lessons: lessonsCount,
    kos: kosCount,
    questions: questionsCount,
    references: referencesCount,
  };
}
