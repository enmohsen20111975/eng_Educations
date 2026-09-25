// =============================================================================
// CAMA — Certified Asset Management Assessor (IFANM/World Partners) — Combined
// structure + content loader for the Asset Management Principles (AMP) pillar
// (Task ID 16-CAMA).
//
// This single loader does BOTH:
//   (A) Certification STRUCTURE — the 4-domain CAMA Body of Knowledge aligned
//       to ISO 55001 clauses and the IAM assessment framework (Asset Management
//       Principles & Policy, Asset Management System (ISO 55001), Asset
//       Management Plan & Lifecycle, Performance & Improvement), three ISO
//       standard links (ISO 55000/55001/55002), v2024 version snapshot, and
//       CAMA learning path — mirroring src/lib/ref-content/cre.ts.
//   (B) DEEP scientific CONTENT for the Asset Management Principles (AMP)
//       domain — 3 full-spec (24-section) lessons, Knowledge Objects, and 12
//       enriched questions — mirroring src/lib/ref-content/cre.ts.
//
// NOTE on exam weights: the CAMA exam blueprint (per-domain % weights,
// question count, duration, passing score) is flagged
// verificationStatus = "REQUIRES_RESEARCH" pending the official IFANM/World
// Partners CAMA scheme documents. The 4-domain structure itself is the
// published CAMA framework aligned to ISO 55001:2014 clauses and the IAM
// (Institute of Asset Management) assessment framework.
//
// Source hierarchy (spec §5) — Levels 2, 5, 7:
//   - LEVEL 2 — Official Standard / Standards Organization: ISO 55000:2014,
//     ISO 55001:2014, ISO 55002:2018.
//   - LEVEL 5 — Professional Organizations: The IAM (Institute of Asset
//     Management) "Asset Management — An Anatomy"; The IAM "Asset Management
//     Maturity Model".
//   - LEVEL 7 — Technical Publications / Industry Sources: John D. Campbell
//     & Andrew K.S. Jardine "Maintenance Strategy" (Pearson Education /
//     Industrial Press, 2001).
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
// Public types (mirror cre.ts)
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
  scenario?: string; // Utilities|Oil & Gas|Power|...
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
// CAMA STRUCTURE — 4 domains aligned to ISO 55001 clauses + the IAM assessment
// framework. The AMP domain has 4 competencies (the focus of this loader's
// deep content); AMS, AML, and PI are structure-only here, mirroring the CRE
// pattern where non-focus domains are seeded as placeholders for follow-up
// agents.
//
// Exam weights are approximate/REQUIRES_RESEARCH: the official IFANM/World
// Partners CAMA scheme publishes per-domain % weights that are flagged for
// research until the scheme documents are loaded (spec §1: do not invent
// certification requirements). The 4-domain structure itself is the published
// CAMA framework aligned to ISO 55001:2014 and the IAM assessment framework.
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

const CAMA_DOMAINS: SeedDomain[] = [
  {
    code: "AMP",
    name: "Asset Management Principles & Policy",
    weight: 0,
    description:
      "ISO 55000 principles (value, alignment, leadership, assurance) and fundamentals; the asset management definition; asset lifecycle; ISO 55001 §5.1 leadership & commitment, §5.2 policy, §6.2 objectives; the Strategic Asset Management Plan (SAMP); alignment with organizational objectives.",
    competencies: [
      {
        name: "Asset Management Principles",
        description:
          "The four ISO 55000 principles (value, alignment, leadership, assurance) and the three lifecycle/risk/improvement fundamentals that operationalize them; the asset, asset management, asset management system, and asset management plan definitions; the asset lifecycle stages.",
        order: 1,
      },
      {
        name: "Asset Management Policy & Strategy",
        description:
          "ISO 55001 §5.2 policy requirements (appropriateness, framework for objectives, commitment to requirements, commitment to continual improvement); the Strategic Asset Management Plan (SAMP); alignment of asset management with organizational objectives.",
        order: 2,
      },
      {
        name: "Asset Management Objectives & SAMP",
        description:
          "ISO 55001 §6.2 asset management objectives; SMART criteria; the SAMP structure; cascading objectives from organizational strategy to asset-level plans; consistency with the AM policy and the AMS.",
        order: 3,
      },
      {
        name: "Leadership & Commitment",
        description:
          "ISO 55001 §5.1 leadership & commitment; top-management responsibility for the AMS, the AM policy, and the integration of AM requirements into business processes; the AM organizational culture.",
        order: 4,
      },
    ],
  },
  {
    code: "AMS",
    name: "Asset Management System (ISO 55001)",
    weight: 0,
    description:
      "ISO 55001:2014 management-system requirements: §4 context of the organization (understanding the organization and its context, needs of interested parties, scope of the AMS), §7 support (resources, competence, awareness, communication, documented information), §8 operation (operational planning and control, change management, outsourcing).",
    competencies: [],
  },
  {
    code: "AML",
    name: "Asset Management Plan & Lifecycle",
    weight: 0,
    description:
      "Asset management plan (AMP) development and structure; the asset lifecycle stages (creation/acquisition, utilization, maintenance, renewal/disposal); life-cycle costing (LCC); asset risk assessment; resilience and contingency.",
    competencies: [],
  },
  {
    code: "PI",
    name: "Performance & Improvement",
    weight: 0,
    description:
      "ISO 55001 §9 performance evaluation (monitoring, measurement, analysis, internal audit, management review) and §10 improvement (nonconformity, corrective action, continual improvement); the IAM maturity model; KPIs and the AM maturity self-assessment scorecard.",
    competencies: [],
  },
];

// ---------------------------------------------------------------------------
// SOURCES — 6 real references cited across all AMP lessons.
// ---------------------------------------------------------------------------

export const CAMA_SOURCES: RefSource[] = [
  {
    title:
      "ISO 55000:2014 — Asset management — Overview, principles and terminology",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/55088.html",
    citation:
      "International Organization for Standardization. ISO 55000:2014, Asset management — Overview, principles and terminology. Geneva: ISO. Defines asset, asset management, asset management system, asset management plan, and the principles of asset management (value, alignment, leadership, assurance). Establishes the asset lifecycle concept and the relationship between organizational objectives and asset management.",
  },
  {
    title:
      "ISO 55001:2014 — Asset management — Management systems — Requirements",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/55089.html",
    citation:
      "International Organization for Standardization. ISO 55001:2014, Asset management — Management systems — Requirements. Geneva: ISO. Specifies requirements for an asset management system (AMS) along the Plan-Do-Check-Act framework: §4 context, §5 leadership, §6 planning (policy, objectives, SAMP, risk), §7 support, §8 operation, §9 performance evaluation, §10 improvement. The standard CAMA assessors assess against.",
  },
  {
    title:
      "ISO 55002:2018 — Asset management — Management systems — Guidelines for the application of ISO 55001",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/69070.html",
    citation:
      "International Organization for Standardization. ISO 55002:2018, Asset management — Management systems — Guidelines for the application of ISO 55001. Geneva: ISO. Provides interpretive guidance for each ISO 55001 clause: how to define AMS scope, how to write the asset management policy, how to develop the SAMP and cascading objectives, how to plan lifecycle activities, and how to perform internal audit and management review. Indispensable companion to ISO 55001 for the CAMA assessor.",
  },
  {
    title:
      "The IAM — Asset Management — An Anatomy (Institute of Asset Management)",
    level: "5",
    levelLabel: "Professional Organizations",
    type: "BOOK",
    url: "https://theiam.org/what-is-asset-management/anatomy-of-asset-management/",
    citation:
      "Institute of Asset Management (IAM). Asset Management — An Anatomy (3rd ed., 2014, updated 2023). The definitive conceptual reference for asset management, presenting 39 AM subjects grouped under six conceptual groups (Strategy & Planning; Asset Management Decision-Making; Lifecycle Delivery; Risk & Reliability; Health, Safety, Environment & Quality; Asset Information). Provides the AM knowledge framework that complements ISO 55000's principles and underpins the IAM competency scheme and CAMA assessor training.",
  },
  {
    title:
      "The IAM — Asset Management Maturity Model (Institute of Asset Management)",
    level: "5",
    levelLabel: "Professional Organizations",
    type: "BOOK",
    url: "https://theiam.org/what-is-asset-management/maturity/",
    citation:
      "Institute of Asset Management (IAM). Asset Management Maturity Assessment Framework / Maturity Model. A structured five-level maturity scale (1 Initial/Ad-hoc → 2 Aware → 3 Defined → 4 Managed → 5 Optimized) applied to the 39 AM Anatomy subjects. The CAMA assessor uses the maturity model to score evidence during assessment and to identify improvement opportunities; the model is also the backbone of the IAM self-assessment tool.",
  },
  {
    title:
      "Campbell & Jardine — Maintenance Strategy (Pearson Education / Industrial Press)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    citation:
      "Campbell, J. D., & Jardine, A. K. S. (Eds.) (2001). Maintenance Strategy: Creating and Implementing Optimal Maintenance Strategies for Profitable Asset Management. London: Pearson Education / Industrial Press. ISBN 978-0-13-017161-4. The widely-cited practitioner reference linking asset management strategy to maintenance decision-making: life-cycle costing, asset criticality, RCM, spare-parts optimization, and the link between asset management policy, the SAMP, and operational maintenance plans. Operationalizes ISO 55000 principles in the industrial context CAMA candidates work in.",
  },
];

const AMP_REFERENCE_TITLES = CAMA_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Lesson 1 — Asset Management Principles
// (Competency: "Asset Management Principles"; slug: cama-asset-management-principles)
// ---------------------------------------------------------------------------

const LESSON_AM_PRINCIPLES: RefLesson = {
  competencyName: "Asset Management Principles",
  slug: "cama-asset-management-principles",
  title: "Asset Management Principles",
  titleAr: "مبادئ إدارة الأصول",
  order: 1,
  durationMin: 35,
  references: AMP_REFERENCE_TITLES,
  conceptIntroduction: `Asset management, per ISO 55000:2014, is the "coordinated activity of an organization to realize value from its assets." Realizing value is the heart of the discipline — every other clause of ISO 55001, and every concept in the CAMA BOK, flows from this definition. The asset itself is anything that has potential or actual value to the organization: physical (a pump, a transformer, a road), informational (a maintenance database), intangible (a license, a brand), or financial (working capital). The CAMA assessor works primarily with physical engineering assets but must apply the principles across all asset classes the AMS scope covers.

The four principles ISO 55000 names are: VALUE — assets exist to deliver value (present or future, financial or non-financial); ALIGNMENT — the asset management system aligns asset decisions with the organization's objectives; LEADERSHIP — top management's commitment drives integration and culture; ASSURANCE — the AM system gives stakeholders confidence that objectives will be achieved. These four principles are operationalized by three lifecycle/risk/improvement fundamentals: lifecycle integration (decisions span creation through disposal), risk-based decision-making (every asset decision weighs risk and opportunity), and continual improvement (the AMS is a PDCA loop, not a one-off certification). Together these form the seven-principle framework CAMA assessors apply.

The asset lifecycle has four canonical stages: creation/acquisition (design, procure, install), utilization (operate, maintain), renewal (refurbish, replace), and disposal (decommission, dispose). Life-cycle costing (LCC) sums the discounted cost across all four stages; an asset's optimal strategy is the one that minimizes LCC while meeting performance, risk, and sustainability targets. Maturity self-assessment, against the IAM five-level scale, lets the organization benchmark its AMS and target the next level.`,
  example: `A water utility owns 1,200 km of distribution mains. The 50-year horizon LCC of a 1 km segment of DN300 ductile-iron main is to be compared with a DN300 PVC alternative. Acquisition = €120,000 (DI) vs €95,000 (PVC). Annual maintenance (repair bursts, leaks) = €2,500 (DI, higher burst frequency) vs €1,400 (PVC). Annual operational energy (pumping friction equivalent) = €800 (DI) vs €650 (PVC). Renewal/disposal at year 50 = €40,000 (DI, salvage 30%) vs €30,000 (PVC, salvage 10%). Discount rate r = 5%. The 50-year Present-Value LCC: LCC_DI = 120,000 + (2,500 + 800)·P/A(5%, 50) + 40,000·P/F(5%, 50) where P/A = (1-(1+r)^-n)/r = (1-1.05^-50)/0.05 = 18.256; P/F = 1/(1+r)^n = 1/1.05^50 = 0.0872. LCC_DI = 120,000 + 3,300·18.256 + 40,000·0.0872 = 120,000 + 60,245 + 3,488 = €183,733. LCC_PVC = 95,000 + 2,050·18.256 + 30,000·0.0872 = 95,000 + 37,425 + 2,616 = €135,041. PVC saves €48,692 per km over 50 years (≈ 26% of the DI LCC). If the utility has 1,200 km of comparable mains up for renewal over 20 years, the LCC-informed policy could save ≈ €58 million in PV terms — and the policy must be written into the SAMP to govern the renewal programme.`,
  keyFormulas: `Asset management (ISO 55000): the coordinated activity of an organization to realize value from its assets.
Asset: anything that has potential or actual value to the organization.
Asset management system (AMS): set of interrelated elements to establish AM policy and objectives, and to achieve them.
Asset management plan (AMP): documented information that specifies what will be done, by whom, and when, to achieve the AM objectives.
Asset lifecycle stages: Creation/Acquisition → Utilization → Maintenance → Renewal/Disposal.

Life-cycle cost (LCC, present-value form):
  LCC = C_acq + Σ_t [ (C_op(t) + C_maint(t)) / (1+r)^t ] + C_renew/(1+r)^T + C_disp/(1+r)^T
  where C_acq = acquisition cost; C_op, C_maint = annual operational & maintenance costs;
        r = discount rate; T = analysis period; C_renew, C_disp = renewal & disposal costs.
Annuity present-value factor: P/A(r,n) = (1 - (1+r)^-n) / r
Single-payment present-value factor: P/F(r,n) = (1 / (1+r)^n)

IAM maturity scale (5 levels): 1 Initial/Ad-hoc → 2 Aware → 3 Defined → 4 Managed → 5 Optimized.
Maturity score (per Anatomy subject): M = (Σ evidence-weighted indicators × depth) / (n × max-depth).

PDCA loop (ISO 55001): Plan (§4-6: context, leadership, planning) → Do (§7-8: support, operation) → Check (§9: performance evaluation) → Act (§10: improvement).`,
  exercise: `You are the CAMA assessor reviewing a regional transmission utility's AMS. The utility has written a policy that states "we will manage our assets to deliver value to our customers, employees, and shareholders." (a) Identify which ISO 55000 principle(s) the policy statement explicitly invokes and which it omits. (b) The utility reports its LCC analysis for a 50-MVA transformer renewal: C_acq = €1.8M, annual C_op = €45k, annual C_maint = €80k, C_disp at year 40 = €200k, r = 4%. Compute the 40-year PV LCC. (c) The utility self-assesses at maturity level 2 on the SAMP subject but level 3 on the Lifecycle Delivery subject. As CAMA assessor, recommend three lines of enquiry (evidence to request) before scoring the SAMP maturity.`,
  sections: {
    learning_objectives: `- Define asset, asset management, asset management system, and asset management plan using ISO 55000:2014 terminology and identify the four required parts of the asset management definition (coordinated, organization, realize value, from its assets).
- State the four ISO 55000 principles (value, alignment, leadership, assurance) and explain how each constrains AMS design.
- Apply the three operationalizing fundamentals (lifecycle integration, risk-based decision-making, continual improvement) to asset decisions.
- Compute a discounted life-cycle cost (LCC) and use it to choose between alternative asset strategies.
- Apply the IAM five-level maturity scale to self-assess an AM subject (Strategy & Planning, Lifecycle Delivery, etc.).
- Connect the principles to the rest of ISO 55001 (policy in §5.2, objectives in §6.2, performance evaluation in §9, improvement in §10).`,
    prerequisites: `- The CAMA certification scheme and the position of Asset Management Principles & Policy within it.
- ISO management-systems family (ISO 9001 quality, ISO 14001 environment, ISO 45001 OH&S) and the PDCA model.
- Engineering economics basics: present value, annuity factor P/A(r,n), single-payment factor P/F(r,n).
- Familiarity with physical engineering assets (pumps, transformers, vehicles, infrastructure networks) and their life-cycle stages.`,
    introduction: `Asset management is the discipline of realizing value from assets. ISO 55000:2014 — the umbrella standard of the ISO 55000 family — defines it as the "coordinated activity of an organization to realize value from its assets." The definition is deliberately compact: four elements are non-negotiable. The activity must be COORDINATED (cross-functional, not siloed by department). It is performed by an ORGANIZATION (a single accountable legal entity with a context, not a loose consortium). Its purpose is to REALIZE VALUE (financial, but also service, safety, environmental, social). The VALUE comes FROM ITS ASSETS (which may be physical, informational, intangible, or financial, in scope).

This lesson is the foundation of the CAMA certification because every later domain — the Asset Management System (ISO 55001 §4-10), the Asset Management Plan & Lifecycle, Performance & Improvement — derives from these principles. A CAMA assessor who misjudges the principles will misjudge everything else: a utility that writes its policy around "maintain the asset" rather than "realize value" has already misframed its AMS, and no amount of clause-by-clause compliance will recover the value lost.

The four principles ISO 55000 names are: VALUE (assets exist to deliver value — present or future, financial or non-financial; asset decisions are value decisions); ALIGNMENT (the AM system aligns asset decisions with the organization's objectives — when the org's strategy changes, the AM strategy and AM plan must change); LEADERSHIP (top management's commitment drives integration, resources, and culture — without leadership, the AMS is a paperwork exercise); and ASSURANCE (the AM system gives stakeholders — regulators, customers, shareholders, employees — confidence that asset objectives will be achieved). These four principles are the assessor's first lens.

The four principles are operationalized by three fundamentals. Lifecycle integration: every asset decision is made with full knowledge of the creation, utilization, maintenance, renewal, and disposal stages — the assessor checks that "lowest first cost" thinking has not displaced "lowest LCC" thinking. Risk-based decision-making: every asset decision weighs risk (likelihood × consequence, across safety, environmental, service, financial, regulatory dimensions) against opportunity — the assessor checks that the SAMP, AMPs, and operational decisions are risk-prioritized. Continual improvement: the AMS is a PDCA loop — Plan (§4-6), Do (§7-8), Check (§9), Act (§10) — and the assessor checks that improvement is institutional, not episodic.

The asset lifecycle is the temporal backbone. Four stages: creation/acquisition (design, procure, install, commission), utilization (operate, maintain, monitor), renewal (refurbish, replace, upgrade), and disposal (decommission, remove, recycle, dispose). LCC sums the discounted cost across all four. The assessor verifies that the AM plan for each asset class integrates all four stages and that decisions are made on LCC, not on first cost.

The IAM maturity model is the assessor's scoring instrument. Five levels — 1 Initial/Ad-hoc → 2 Aware → 3 Defined → 4 Managed → 5 Optimized — applied across the 39 AM Anatomy subjects. The CAMA candidate must internalize the level definitions and the evidence each level requires; a level-3 SAMP looks qualitatively different from a level-2 SAMP (defined vs. aware), and the assessor's job is to distinguish the two from evidence, not from aspiration.`,
    terminology: `- **Asset (ISO 55000)**: anything that has potential or actual value to the organization.
- **Asset management (ISO 55000)**: the coordinated activity of an organization to realize value from its assets.
- **Asset management system (AMS, ISO 55000)**: set of interrelated elements to establish AM policy and AM objectives, and to achieve those objectives.
- **Asset management plan (AMP, ISO 55000)**: documented information that specifies what will be done, by whom, and when, to achieve the AM objectives.
- **Strategic Asset Management Plan (SAMP)**: documented information that specifies how the organizational objectives are to be converted into AM objectives, the approach for developing AMPs, and the role of the AMS in achieving AM objectives.
- **Value (ISO 55000 principle)**: assets exist to deliver value (present or future, financial or non-financial).
- **Alignment (ISO 55000 principle)**: the AM system aligns asset decisions with organizational objectives.
- **Leadership (ISO 55000 principle)**: top management's commitment drives AM integration and culture.
- **Assurance (ISO 55000 principle)**: the AMS gives stakeholders confidence that AM objectives will be achieved.
- **Lifecycle integration**: every asset decision is made across creation, utilization, maintenance, renewal, and disposal.
- **Risk-based decision-making**: every asset decision weighs risk (likelihood × consequence) against opportunity.
- **Continual improvement**: the AMS is a PDCA loop (Plan-Do-Check-Act), not a one-off.
- **Organizational objectives**: what the organization seeks to achieve through its assets.
- **Asset management policy (ISO 55001 §5.2)**: the top-level statement of intent and direction for AM, set by top management.
- **Asset management objectives (ISO 55001 §6.2)**: specific, measurable AM results to be achieved.
- **PDCA**: Plan-Do-Check-Act — the management-system cycle ISO 55001 follows.
- **IAM Anatomy**: the IAM's 39-subject conceptual reference for AM.
- **Maturity level**: 1 Initial → 2 Aware → 3 Defined → 4 Managed → 5 Optimized.`,
    detailed_explanation: `The ISO 55000 definition of asset management repays close reading. "Coordinated activity" — not a single function, but a cross-functional coordination across engineering, operations, maintenance, finance, IT, HR, and risk. "Organization" — a single accountable entity, with a context and interested parties (ISO 55001 §4.1-4.2). "Realize value" — not minimize cost; value is the broader construct, encompassing financial return, service level, safety, environmental performance, regulatory compliance, and stakeholder satisfaction. "From its assets" — assets are the substrate of value realization; the AMS exists to make asset decisions, not to manage the assets in isolation.

The four principles are interdependent. Value is the purpose; alignment connects the purpose to the organization; leadership drives the alignment into the organization's structures; assurance confirms that the alignment is being delivered. The CAMA assessor who checks one principle without the other three will get a distorted picture. A utility with strong leadership and policy statements (leadership + alignment) but weak monitoring (assurance) is at level-2 maturity, not level-4 — and the gap is a finding.

Lifecycle integration is the most operationally important fundamental. An asset decision made on first cost (acquisition only) is almost always wrong; the right decision integrates lifecycle cost, lifecycle performance, lifecycle risk, and lifecycle sustainability. LCC is the analytical workhorse. The discount rate r is a policy variable — set too high and long-life assets (50-year infrastructure) are undervalued; set too low and the organization over-invests. The assessor checks that the LCC methodology, the discount rate, and the analysis period are documented and consistently applied.

Risk-based decision-making underpins ISO 55001 §6.1 (actions to address risks and opportunities) and §8.2 (asset risk management). Risk is multi-dimensional — safety, environmental, service continuity, financial, regulatory, reputational. The assessor checks that the risk methodology is documented (ISO 55001 §7.5), applied at the strategic (SAMP), tactical (AMP), and operational (work-order) levels, and re-evaluated when conditions change.

Continual improvement is the AMS's heartbeat. ISO 55001 §10.2 (nonconformity and corrective action) and §10.3 (continual improvement) close the PDCA loop. The assessor looks for evidence that nonconformities are investigated (root cause, not symptom), corrective actions are taken and verified effective, and the maturity score rises over time — not because the assessment criteria were relaxed, but because the AMS improved.

The IAM maturity model gives the assessor a defensible scoring rubric. Level 1 Initial/Ad-hoc: activities are performed but unplanned, reactive, person-dependent. Level 2 Aware: the organization recognizes AM as a discipline; policies exist but practice is inconsistent. Level 3 Defined: AM processes are defined, documented, and integrated; the SAMP and AMPs exist and are used. Level 4 Managed: AM processes are measured, monitored, and adjusted; KPIs drive decisions; risks are managed. Level 5 Optimized: improvement is institutionalized; benchmarking and innovation drive capability; the AMS adapts proactively to changing context. The assessor scores each Anatomy subject independently — the SAMP at level 3 does not imply Lifecycle Delivery at level 3 — and the maturity profile, not a single number, is the finding.`,
    core_principles: `- Asset management is the coordinated activity of an organization to realize value from its assets (ISO 55000). Drop any of the four parts and the term becomes a slogan.
- The four ISO 55000 principles — Value, Alignment, Leadership, Assurance — are interdependent; the assessor scores all four, not just one.
- The three operationalizing fundamentals — lifecycle integration, risk-based decision-making, continual improvement — turn the four principles into practice.
- The asset lifecycle (creation → utilization → maintenance → renewal/disposal) is the temporal backbone of every asset decision; LCC is the analytical workhorse.
- The AMS is a PDCA loop; continual improvement (§10) is institutional, not episodic.
- The IAM five-level maturity scale (1 Initial → 5 Optimized) is the assessor's defensible scoring rubric, applied per Anatomy subject.
- Organizational objectives drive AM objectives; the SAMP is the bridge between the two.`,
    components: `- Asset register — the inventory of assets in scope (the assessor's first evidence request).
- Asset management policy (ISO 55001 §5.2) — the top-level statement of intent.
- Strategic Asset Management Plan (SAMP) — the bridge from organizational to AM objectives.
- Asset management plans (AMPs) — tactical plans per asset class or system.
- Asset management objectives (ISO 55001 §6.2) — SMART AM results to be achieved.
- Life-cycle cost (LCC) model — the discounted cost across all four lifecycle stages.
- Asset risk register — the multi-dimensional risk inventory.
- KPI dashboard (ISO 55001 §9.1) — monitoring and measurement of AM performance.
- Internal audit programme (ISO 55001 §9.2) — independent assurance of the AMS.
- Management review (ISO 55001 §9.3) — top-management review of AMS effectiveness.
- Maturity self-assessment — benchmark against the IAM 5-level scale.
- Documented information (ISO 55001 §7.5) — the policies, plans, procedures, and records.`,
    process: `1. Define the asset (anything with potential or actual value) and the asset management system scope (ISO 55001 §4.3).
2. Establish the AM policy (ISO 55001 §5.2) — aligned with organizational objectives, committed to continual improvement, framework for objectives.
3. Develop the SAMP — translate organizational objectives into AM objectives and approach for AMPs.
4. Set AM objectives (ISO 55001 §6.2) — SMART, consistent with the policy, monitored.
5. Develop AMPs (per asset class) — tactical plans for what, who, when.
6. Plan lifecycle activities (creation, utilization, maintenance, renewal, disposal) and integrate across stages.
7. Apply risk-based decision-making (ISO 55001 §6.1, §8.2) — multi-dimensional risk.
8. Operate the AMS (ISO 55001 §7-8: support, resources, competence, awareness, communication, operational control, change management, outsourcing).
9. Evaluate performance (ISO 55001 §9: monitoring, measurement, analysis, internal audit, management review).
10. Improve (ISO 55001 §10: nonconformity, corrective action, continual improvement) — close the PDCA loop.
11. Mature — self-assess against the IAM 5-level scale per Anatomy subject; set next-level targets.`,
    formula_calculation: `Variables and formulas:
- C_acq: acquisition (creation) cost [€]
- C_op(t): annual operational cost in year t [€/year]
- C_maint(t): annual maintenance cost in year t [€/year]
- C_renew: renewal cost at end of life [€]
- C_disp: disposal cost (or salvage, negative) at end of life [€]
- r: discount rate (real or nominal, must match cash-flow basis) [dimensionless]
- T: analysis period (years)
- LCC: life-cycle cost (present value) [€]

Core formulas:
- LCC = C_acq + Σ_{t=1..T} [ (C_op(t) + C_maint(t)) / (1+r)^t ] + (C_renew + C_disp) / (1+r)^T
- Annuity factor (constant annual cost): P/A(r, T) = (1 - (1+r)^-T) / r
- Single-payment factor: P/F(r, T) = 1 / (1+r)^T
- Equivalent annual cost (EAC): EAC = LCC / P/A(r, T)

IAM maturity score (per Anatomy subject, n indicators):
- M = ( Σ_{i=1..n} w_i × d_i ) / ( Σ_{i=1..n} w_i × d_max )
  where w_i = evidence weight (0..1), d_i = demonstrated depth (1..5), d_max = 5
- Resulting M maps to level: 0-0.2 → L1; 0.2-0.4 → L2; 0.4-0.6 → L3; 0.6-0.8 → L4; 0.8-1.0 → L5

Units: cost in currency (€/$/£); time in years; rates and factors dimensionless.

Assumptions: (i) cash flows are deterministic — replace with expected values for stochastic LCC; (ii) discount rate r is real when C_op/C_maint are real (inflation-adjusted); (iii) the analysis period T covers at least one full lifecycle; (iv) risk is treated qualitatively alongside LCC, not monetized into the LCC (a frequent simplification).`,
    worked_example: `A water utility (CASE_TYPE = SYNTHETIC) is preparing its SAMP and must commit a renewal policy for its 1,200 km of distribution mains. Two material options are considered: ductile-iron (DI) and PVC. Per-km cost data: C_acq_DI = €120,000; C_acq_PVC = €95,000. Annual maintenance (repair bursts + leaks): C_maint_DI = €2,500/km; C_maint_PVC = €1,400/km. Annual operational energy (pumping friction equivalent): C_op_DI = €800/km; C_op_PVC = €650/km. Renewal & disposal at year 50: C_renew_disp_DI = €40,000/km (30% salvage); C_renew_disp_PVC = €30,000/km (10% salvage). Discount rate r = 5%; analysis period T = 50 years.

Step 1 — Annuity factor P/A(5%, 50) = (1 - 1.05^-50)/0.05 = (1 - 0.0872)/0.05 = 0.9128/0.05 = 18.256.
Step 2 — Single-payment factor P/F(5%, 50) = 1/1.05^50 = 0.0872.
Step 3 — LCC_DI = 120,000 + (2,500 + 800)·18.256 + 40,000·0.0872 = 120,000 + 60,245 + 3,488 = €183,733/km.
Step 4 — LCC_PVC = 95,000 + (1,400 + 650)·18.256 + 30,000·0.0872 = 95,000 + 37,425 + 2,616 = €135,041/km.
Step 5 — Per-km saving: €183,733 − €135,041 = €48,692/km (≈ 26% of the DI LCC).
Step 6 — Equivalent annual cost (EAC): EAC_DI = 183,733/18.256 = €10,062/km/year. EAC_PVC = 135,041/18.256 = €7,397/km/year. PVC saves €2,665/km/year.
Step 7 — Portfolio PV saving over 20-year renewal programme (1,200 km): €48,692 × 1,200 = €58.4M in PV terms.

Assessor finding: the utility's SAMP renewal policy is LCC-informed (€58.4M PV saving committed to PVC for comparable mains). The assessor verifies: (i) the LCC methodology is documented and the discount rate is the corporate real discount rate (5%); (ii) burst-frequency data used for C_maint_DI vs C_maint_PVC is statistically defensible (not a one-year average); (iii) the renewal programme is risk-prioritized (mains on criticality A renewed first); (iv) the SAMP translates this LCC finding into an AM objective ("renew 1,200 km of comparable mains as PVC over 20 years, saving €58M PV"); (v) the AM objective is monitored (annual reporting of km renewed, PV saved, burst-rate reduction). Maturity score: SAMP at L3 (Defined) — not L4 because the methodology is not yet quantitatively benchmarked against peer utilities; not L2 because the LCC approach is documented and applied consistently. Recommended next level: define benchmarking and quantitative targets to reach L4.`,
    industrial_example: `Utilities — a regional transmission utility operates 4,800 km of high-voltage transmission lines and 320 substations. Its AM policy commits to "delivering value through safe, reliable, affordable electricity." The SAMP translates this into AM objectives: SAIDI ≤ 90 min/year, SAIFI ≤ 1.0 events/year, fleet health index ≥ 0.85, lifecycle cost reduction ≥ 5% over 5 years. The LCC model is applied to every renewal decision (transformer, breaker, line section) above €250k capital. The asset register holds 47,000 assets with health index and criticality scoring. Internal audit (ISO 55001 §9.2) covers all 39 IAM Anatomy subjects on a 3-year rolling programme. Maturity self-assessment (last cycle): 18 subjects at L3, 14 at L4, 5 at L2 (Asset Information, Demand Forecasting, Resilience, Stakeholder Engagement, Knowledge Management), 2 at L1 (Carbon Accounting, Asset-related Decision-Making for low-criticality assets). The assessor's findings focus on the L1/L2 subjects where the gap to L3 is widest, and on whether the L4 subjects are quantitatively benchmarked (level-4 evidence) versus just managed (level-3 evidence mislabelled as L4).`,
    case_study: `SYNTHETIC CASE — "Northern Water": a municipal water utility with 2,800 km of mains and 18 treatment works. The CEO commits to ISO 55001 certification within 24 months. The AM manager writes a 1-page policy ("Northern Water will manage its assets to deliver safe, reliable, affordable water service") and appoints a 2-person AM team. Six months in, the policy has not been communicated to operations staff; no SAMP exists; AMPs are the old maintenance plans rebadged; LCC is not applied; internal audit is outsourced to a generic ISO 9001 auditor with no AM competence; the maturity self-assessment scores every subject at L3 ("Defined") on the basis that the AM team "knows what to do."

The CAMA assessor's findings: (i) Leadership (ISO 55001 §5.1) — the CEO commitment is real but has not been operationalized through resourcing, communication, or organizational integration; finding against §5.1d (communication of the importance of effective AM). (ii) Policy (ISO 55001 §5.2) — the policy is appropriate but provides no framework for AM objectives (no link to organizational objectives) and commits to continual improvement in name only; finding against §5.2b. (iii) SAMP — absent; major nonconformity against §6.2.1 (SAMP required). (iv) AMPs — the rebadged maintenance plans do not specify how AM objectives are to be achieved, the role of the AMS, or the lifecycle activities; finding against §6.2.2. (v) Internal audit (§9.2) — the auditor lacks AM competence; finding against §9.2c (auditor competence). (vi) Maturity self-assessment — every subject at L3 is unsupported; the actual profile is mostly L1/L2 with two L3 subjects (Asset Register, Work-order Management). The recommended corrective action: a 12-month maturity-rising plan with priority on SAMP, AM objectives, and auditor competence, before ISO 55001 certification is sought.`,
    visual_explanation: `The asset lifecycle diagram visualizes the four canonical stages — Creation/Acquisition → Utilization → Maintenance → Renewal → Disposal — as a horizontal arrow with cost bars (C_acq, C_op, C_maint, C_renew, C_disp) plotted by stage, and an LCC accumulation curve rising across the stages. The discount factor (1+r)^-t is plotted on a secondary axis to show why late-stage costs (renewal, disposal) are heavily discounted at long analysis periods. The four ISO 55000 principles are shown as four pillars supporting the value bar at the top — Value (purpose), Alignment (connection to org objectives), Leadership (drive), Assurance (stakeholder confidence). The IAM maturity model is a 5-rung ladder (L1 Initial → L5 Optimized) plotted against the 39 Anatomy subjects as a heat-map.`,
    simulation_opportunity: `A Life-Cycle Cost decision simulator: input asset alternatives with their stage-wise costs, analysis period, and discount rate; compute the LCC, the EAC, and the per-km (or per-unit) saving; visualize the cost accumulation and the discounted cash-flow bars; toggle risk sensitivity (e.g., +50% C_maint for the higher-risk option) and see whether the LCC ranking flips. A second simulator: the Maturity Self-Assessment scorecard — for each of the 39 Anatomy subjects, score the evidence depth (1-5) and weight (0-1); compute the maturity score and the level; export the maturity profile and the gap-to-next-level targets.`,
    common_mistakes: `- Writing the AM policy as a marketing slogan ("we manage our assets well") rather than the four ISO 55001 §5.2 requirements (appropriate, framework for objectives, commitment to requirements, commitment to continual improvement).
- Confusing asset management with maintenance management — maintenance is one lifecycle activity; asset management spans the lifecycle and the value chain.
- Making renewal decisions on first cost (acquisition only), not on LCC — the assessor sees this when the asset register shows material choices that are cheap to buy but expensive to maintain.
- Setting AM objectives that are not SMART (no baseline, no target, no time-bound, no measurable) — ISO 55001 §6.2 requires consistency with the policy and monitoring.
- Scoring maturity from aspiration ("we know what to do") rather than from evidence — the IAM level-3 definition requires defined, documented, integrated processes, not a team's good intentions.
- Treating the SAMP as a one-off document rather than the bridge that translates changes in organizational strategy into changes in AM objectives.
- Treating risk as a single dimension (safety) when ISO 55001 §6.1 implies multi-dimensional risk (safety, environmental, service, financial, regulatory).
- Outsourcing internal audit to a generic ISO 9001 auditor with no AM competence — ISO 55001 §9.2c requires auditor competence in the AMS.`,
    limitations: `- The ISO 55000 four-principles framework is compact but does not, on its own, prescribe implementation; ISO 55002:2018 is needed for the operational interpretation.
- The IAM Anatomy's 39 subjects are a professional reference, not a standard; the boundaries between subjects are not always clean, and the same activity can score under two subjects.
- The IAM maturity model is a self-assessment instrument; it is not an audit standard and does not, by itself, certify maturity.
- LCC is deterministic in its basic form; in practice, costs are stochastic, the discount rate is a policy choice (and a subject of debate), and risk is hard to monetize. A single LCC number presented without sensitivity is misleading.
- The CAMA scheme assesses against ISO 55001 — it does not certify the asset management system itself (certification is done by accredited certification bodies under ISO/IEC 17021-1).
- The asset lifecycle stages are convenient abstractions; real assets have looping lifecycles (refurbishment, upgrade, redeployment) that don't fit the linear creation→disposal model cleanly.`,
    comparison: `Compared to ISO 9001 (quality management systems): ISO 55001 shares the same PDCA structure (§4-10) and the same management-systems DNA, but the "subject" is the asset and its lifecycle — ISO 9001 has no equivalent of the SAMP, the AMP, the asset risk register, or the lifecycle-cost analysis. Compared to PAS 55 (the predecessor of ISO 55001): ISO 55001 is the international successor, broader in scope (all asset classes, all sectors) and harmonized with the ISO management-systems family. Compared to the IAM Anatomy: the Anatomy is a conceptual reference and competence framework, not a requirements standard — ISO 55001 specifies what must be done, the Anatomy describes what good looks like. Compared to RCM (reliability-centered maintenance): RCM is a methodology within the maintenance stage of the lifecycle; asset management is the broader discipline that frames RCM's role. Compared to the SMRP CMRP: CMRP certifies maintenance & reliability professionals; CAMA certifies asset-management-system assessors — the focus is the AMS and its assessment, not the maintenance function.`,
    practical_application: `1. Define AMS scope (ISO 55001 §4.3) — what assets, what functions, what sites, what organizational units are in scope.
2. Write the AM policy (§5.2) using the four ISO 55000 principles and the four §5.2 requirements — the assessor will read this first.
3. Develop the SAMP (§6.2.1) — translate organizational objectives into AM objectives; document the approach for AMPs.
4. Set SMART AM objectives (§6.2) — measurable, time-bound, risk-prioritized.
5. Apply LCC to every capital decision above a policy threshold (e.g., €250k) — document methodology, discount rate, analysis period.
6. Build the asset register with criticality and health-index fields — the assessor's first evidence request.
7. Run the maturity self-assessment annually across the 39 Anatomy subjects; report the profile and gap-to-next-level targets.
8. Run internal audit on a 3-year rolling programme covering all 39 subjects; use AM-competent auditors (ISO 55001 §9.2c).
9. Hold management review (§9.3) annually; record decisions, actions, and follow-up.
10. Improve (§10) — close the PDCA loop with corrective action on nonconformities and continual improvement on the maturity profile.`,
    decision_scenario: `You are the CAMA assessor on Day 3 of a 5-day assessment of a regional gas-distribution utility. The AM manager shows you a maturity self-assessment that scores 36 of 39 Anatomy subjects at L4 ("Managed"). The L4 evidence required, per the IAM rubric, is documented, integrated, measured processes with quantitative KPIs driving decisions. You ask to see the SAMP — it is 8 pages, dated 18 months ago, lists 5 AM objectives without baselines or targets, and is silent on lifecycle activities. You ask to see the LCC methodology — there is none; capital decisions are made on first cost. You ask to see the asset risk register — it covers safety risk only, not service, environmental, financial, or regulatory. You ask to see the internal audit report — the last audit was 22 months ago, by a financial-audit firm, on the financial controls not the AMS. Decision: do you score the maturity profile as presented (36/39 at L4), or do you re-score based on the evidence you have? What nonconformities do you raise against ISO 55001? What improvement opportunities do you record? What is your assessor's recommendation on certification?`,
    practice_questions: `- Define "asset management" using the four ISO 55000 elements and explain why omitting any one element makes the term operationally meaningless.
- List the four ISO 55000 principles and identify, for each, one piece of evidence the CAMA assessor would expect to find in a level-3 (Defined) organization.
- Compute the 50-year PV LCC for an asset with C_acq = €500k, C_op = €30k/year, C_maint = €20k/year, C_disp = €50k, r = 4%.
- Self-assess the maturity (1-5) of your organization's SAMP against the IAM level definitions; list the evidence for each level above the score you assigned.
- Explain why making renewal decisions on first cost (not LCC) is inconsistent with the ISO 55000 Value principle.
- Distinguish the AM policy (§5.2), the SAMP, and the AMP — what is each, who sets each, and how do they cascade?`,
    certification_questions: `See the four enriched questions in the question bank for this lesson (3 MCQ + 1 TF). Topics: ISO 55000 four-part definition; LCC computation; IAM maturity level-3 evidence; risk-based decision-making scope.`,
    summary: `Asset management, per ISO 55000, is the coordinated activity of an organization to realize value from its assets. Four principles frame it: Value (purpose), Alignment (connection to organizational objectives), Leadership (top-management drive), Assurance (stakeholder confidence). Three fundamentals operationalize them: lifecycle integration, risk-based decision-making, continual improvement. The asset lifecycle (creation, utilization, maintenance, renewal, disposal) is the temporal backbone; LCC is its analytical workhorse. The IAM five-level maturity scale (1 Initial → 5 Optimized) is the assessor's defensible scoring rubric, applied per Anatomy subject. The CAMA assessor reads these principles first — every later finding flows from a correct reading of them.`,
    key_takeaways: `- Asset management = the coordinated activity of an organization to realize value from its assets (ISO 55000) — all four parts matter.
- Four principles: Value, Alignment, Leadership, Assurance — interdependent; the assessor scores all four.
- Three fundamentals: lifecycle integration, risk-based decision-making, continual improvement — turn principles into practice.
- LCC: discounted cost across creation → utilization → maintenance → renewal → disposal; the analytical workhorse for asset decisions.
- IAM maturity: 1 Initial → 5 Optimized; per Anatomy subject; the assessor's defensible scoring rubric.
- ISO 55001 §4-10 follows PDCA — Plan (context, leadership, planning), Do (support, operation), Check (performance evaluation), Act (improvement).
- The CAMA assessor's first question is always about principles — everything else flows from the answer.`,
    references: `- ISO 55000:2014 — Asset management — Overview, principles and terminology (clause 3 definitions; clause 4 fundamentals; clause 4.5 principles).
- ISO 55001:2014 — Asset management — Management systems — Requirements (§4 context; §5.1 leadership; §5.2 policy; §6.2 objectives & SAMP; §9 performance evaluation; §10 improvement).
- ISO 55002:2018 — Asset management — Guidelines for the application of ISO 55001 (clause-by-clause interpretive guidance).
- The IAM, Asset Management — An Anatomy (3rd ed.) — 39 AM subjects across 6 conceptual groups.
- The IAM, Asset Management Maturity Model — 5-level scale per Anatomy subject.
- Campbell & Jardine, Maintenance Strategy (2001) — links AM strategy, LCC, RCM, and maintenance decision-making.`,
  },
  knowledgeObject: {
    title: "Asset Management Principles — ISO 55000",
    domain: "Asset Management Principles & Policy",
    competency: "Asset Management Principles",
    topic: "ISO 55000 principles & lifecycle",
    concept: "asset-management-principles",
    body: {
      definitions: [
        "Asset (ISO 55000): anything that has potential or actual value to the organization.",
        "Asset management (ISO 55000): the coordinated activity of an organization to realize value from its assets.",
        "Asset management system (AMS, ISO 55000): set of interrelated elements to establish AM policy and AM objectives, and to achieve those objectives.",
        "Asset management plan (AMP, ISO 55000): documented information that specifies what will be done, by whom, and when, to achieve the AM objectives.",
        "Strategic Asset Management Plan (SAMP): documented information that specifies how organizational objectives are converted into AM objectives, the approach for developing AMPs, and the role of the AMS.",
        "Asset lifecycle: the stages an asset passes through — creation/acquisition, utilization, maintenance, renewal, disposal.",
        "Life-cycle cost (LCC): the discounted sum of all costs across the asset lifecycle.",
        "IAM maturity model: a 5-level scale (1 Initial → 5 Optimized) applied per AM Anatomy subject.",
      ],
      principles: [
        "VALUE — assets exist to deliver value (present or future, financial or non-financial).",
        "ALIGNMENT — the AM system aligns asset decisions with organizational objectives.",
        "LEADERSHIP — top management's commitment drives integration and culture.",
        "ASSURANCE — the AMS gives stakeholders confidence that AM objectives will be achieved.",
        "Lifecycle integration — every asset decision spans creation, utilization, maintenance, renewal, disposal.",
        "Risk-based decision-making — every asset decision weighs multi-dimensional risk against opportunity.",
        "Continual improvement — the AMS is a PDCA loop, not a one-off.",
      ],
      components: [
        "Asset register",
        "Asset management policy (ISO 55001 §5.2)",
        "Strategic Asset Management Plan (SAMP)",
        "Asset management plans (AMPs) per asset class",
        "Asset management objectives (ISO 55001 §6.2)",
        "Life-cycle cost (LCC) model",
        "Asset risk register (multi-dimensional)",
        "KPI dashboard (ISO 55001 §9.1)",
        "Internal audit programme (ISO 55001 §9.2)",
        "Management review (ISO 55001 §9.3)",
        "Maturity self-assessment scorecard",
        "Documented information (ISO 55001 §7.5)",
      ],
      mechanism:
        "Organizational objectives → AM policy (§5.2) → SAMP (§6.2.1) → AM objectives (§6.2) → AMPs (tactical) → lifecycle activities (creation, utilization, maintenance, renewal, disposal) → operational work orders. Performance (§9) measures the loop; improvement (§10) closes it. The four principles (value, alignment, leadership, assurance) shape each stage; the three fundamentals (lifecycle, risk, improvement) operationalize them.",
      process: [
        "Define AMS scope (ISO 55001 §4.3).",
        "Establish AM policy (§5.2) — 4 requirements: appropriate, framework for objectives, commitment to requirements, commitment to continual improvement.",
        "Develop SAMP — translate org objectives to AM objectives; approach for AMPs.",
        "Set SMART AM objectives (§6.2) — consistent with policy, monitored.",
        "Develop AMPs (per asset class).",
        "Plan lifecycle activities (creation, utilization, maintenance, renewal, disposal).",
        "Apply risk-based decision-making (§6.1, §8.2).",
        "Operate AMS (§7-8: support, operation).",
        "Evaluate performance (§9: monitoring, audit, review).",
        "Improve (§10: nonconformity, corrective action, continual improvement).",
        "Mature — self-assess against the IAM 5-level scale per Anatomy subject.",
      ],
      formulas: [
        "Asset management (definition): coordinated activity of an organization to realize value from its assets.",
        "LCC = C_acq + Σ_t [(C_op(t) + C_maint(t)) / (1+r)^t] + (C_renew + C_disp) / (1+r)^T",
        "P/A(r, T) = (1 - (1+r)^-T) / r  — annuity present-value factor",
        "P/F(r, T) = 1 / (1+r)^T  — single-payment present-value factor",
        "EAC = LCC / P/A(r, T)  — equivalent annual cost",
        "Maturity score M = (Σ w_i × d_i) / (Σ w_i × d_max); M=0.2/0.4/0.6/0.8 thresholds to L1/L2/L3/L4/L5",
      ],
      metrics: [
        "LCC (PV €) — life-cycle cost of an asset decision",
        "EAC (€/year) — equivalent annual cost",
        "Maturity level (1-5) per Anatomy subject",
        "Asset health index (0-1) — condition indicator",
        "Asset criticality (A-E) — consequence-of-failure ranking",
        "Nonconformities per audit cycle — AMS effectiveness indicator",
        "Improvement actions closed on time — PDCA-loop health",
      ],
      examples: [
        "Water utility: 50-year PV LCC comparison of DN300 ductile-iron vs PVC mains; PVC saves €48,692/km (≈26% of DI LCC).",
        "Transmission utility: 4-year EAC for a 50-MVA transformer renewal; LCC-informed choice between refurbish and replace.",
        "Municipal fleet: LCC of an electric vs diesel refuse-collection vehicle over 12 years; charging-infrastructure costs integrated into LCC.",
      ],
      industrial_examples: [
        "Utilities — a regional transmission utility with 4,800 km of lines, 320 substations; SAMP translates policy into SAIDI/SAIFI/health-index objectives; LCC applied to every renewal > €250k.",
        "Oil & Gas — a refinery applies the asset lifecycle to rotating equipment; LCC integrated with risk-based inspection (RBI) for pressure vessels; the SAMP governs the 5-year turnaround programme.",
      ],
      case_studies: [
        "SYNTHETIC — 'Northern Water' municipal utility: CEO commits to ISO 55001 in 24 months; the assessor finds leadership (§5.1) not operationalized, policy (§5.2) lacks a framework for objectives, SAMP absent (§6.2.1), AMPs are rebadged maintenance plans, internal audit lacks AM competence (§9.2c), maturity self-assessment inflated (L1/L2 mislabelled as L3).",
      ],
      common_errors: [
        "Writing the AM policy as a slogan, not meeting the four §5.2 requirements.",
        "Confusing asset management with maintenance management — maintenance is one lifecycle activity.",
        "Making renewal decisions on first cost, not LCC.",
        "Setting non-SMART AM objectives (no baseline, no target, no time-bound).",
        "Scoring maturity from aspiration ('we know what to do') rather than from evidence.",
        "Treating the SAMP as a one-off document, not the bridge from strategy to AM objectives.",
        "Treating risk as a single dimension (safety) when ISO 55001 §6.1 implies multi-dimensional risk.",
        "Outsourcing internal audit to a generic ISO 9001 auditor with no AM competence.",
      ],
      limitations: [
        "ISO 55000's four-principles framework is compact but does not prescribe implementation; ISO 55002:2018 is needed for the operational interpretation.",
        "The IAM Anatomy's 39 subjects are a professional reference, not a standard; subject boundaries are not always clean.",
        "The IAM maturity model is a self-assessment instrument; it is not an audit standard and does not certify maturity.",
        "LCC is deterministic in basic form; in practice, costs are stochastic, the discount rate is a policy choice, and risk is hard to monetize.",
        "CAMA assesses against ISO 55001 but does not certify the AMS itself (certification is done by accredited bodies under ISO/IEC 17021-1).",
        "The asset lifecycle stages are convenient abstractions; real assets have looping lifecycles (refurbishment, redeployment) that don't fit the linear model cleanly.",
      ],
      best_practices: [
        "Write the AM policy using the four ISO 55000 principles and the four §5.2 requirements — the assessor reads it first.",
        "Translate organizational objectives into AM objectives through the SAMP — keep the SAMP current, not a one-off.",
        "Apply LCC above a policy threshold (e.g., €250k) on every capital decision; document methodology, discount rate, analysis period.",
        "Build the asset register with criticality and health-index fields — the assessor's first evidence request.",
        "Run maturity self-assessment annually across the 39 Anatomy subjects; report the profile and gap-to-next-level targets.",
        "Run internal audit on a 3-year rolling programme covering all 39 subjects; use AM-competent auditors (§9.2c).",
        "Hold management review (§9.3) annually; record decisions, actions, follow-up.",
        "Close the PDCA loop with §10.2 corrective action and §10.3 continual improvement on the maturity profile.",
      ],
      related_concepts: [
        "ISO 55001 §5.2 asset management policy",
        "ISO 55001 §6.2 asset management objectives & SAMP",
        "IAM Anatomy (39 subjects, 6 conceptual groups)",
        "Life-cycle costing (LCC) and equivalent annual cost (EAC)",
        "IAM Asset Management Maturity Model (5 levels)",
        "ISO 9001 / ISO 14001 / ISO 45001 — management-systems family (PDCA)",
        "PAS 55 — predecessor to ISO 55001",
        "RCM, RBI, TPM — methodologies within the maintenance lifecycle stage",
      ],
      prerequisites: [
        "Familiarity with the ISO management-systems family (9001, 14001, 45001) and PDCA.",
        "Engineering economics: present value, annuity factor, discount rate.",
        "Familiarity with physical engineering assets and their lifecycle stages.",
        "Awareness of the CAMA certification scheme and the IFANM/World Partners framework.",
      ],
      references: [
        "ISO 55000:2014 — Asset management — Overview, principles and terminology",
        "ISO 55001:2014 — Asset management — Management systems — Requirements",
        "ISO 55002:2018 — Asset management — Guidelines for the application of ISO 55001",
        "The IAM — Asset Management — An Anatomy (3rd ed.)",
        "The IAM — Asset Management Maturity Model",
        "Campbell & Jardine — Maintenance Strategy (2001)",
      ],
    },
  },
  questions: [
    {
      competencyName: "Asset Management Principles",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      scenario: "Utilities",
      stem: "ISO 55000:2014 defines asset management as 'the coordinated activity of an organization to realize value from its assets.' Which one of the following best captures the four non-negotiable elements of this definition?",
      whyCorrect:
        "The four elements are: (i) coordinated (cross-functional, not siloed by department); (ii) activity (an ongoing process, not a one-off project); (iii) of an organization (a single accountable legal entity with context, not a loose consortium); (iv) to realize value from its assets (value being present or future, financial or non-financial). The CAMA assessor reads each of these elements when assessing the AM policy and SAMP, because a definition that drops any element becomes operationally meaningless — for example, an AMS run by a single department (not coordinated) or an AMS without a clear owner organization cannot deliver value from assets in the ISO 55000 sense.",
      whyOthersWrong: [
        "Option B (Plan, Do, Check, Act, Continual improvement, Risk-based, Lifecycle) confuses ISO 55000's principles with the PDCA cycle and the three operationalizing fundamentals — those are downstream of the definition, not the four definitional elements.",
        "Option C (Acquisition, Utilization, Renewal, Disposal) lists four of the asset lifecycle stages — that is the temporal backbone, not the four elements of the asset management definition.",
        "Option D (Policy, SAMP, AMP, AM objectives) lists the documents of the AM system — the policy, the SAMP, the AMPs, and the objectives are downstream artefacts, not the four elements of the definition.",
      ],
      explanation:
        "ISO 55000 asset management = coordinated activity of an organization to realize value from its assets. Four elements: coordinated, organization, realize value, from its assets. PDCA, lifecycle stages, and AM documents are downstream of the definition.",
      options: [
        {
          text: "Coordinated; activity; of an organization; to realize value from its assets",
          isCorrect: true,
        },
        {
          text: "Plan, Do, Check, Act; continual improvement; risk-based; lifecycle",
          isCorrect: false,
        },
        {
          text: "Acquisition; utilization; renewal; disposal",
          isCorrect: false,
        },
        {
          text: "Policy; SAMP; AMP; AM objectives",
          isCorrect: false,
        },
      ],
    },
    {
      competencyName: "Asset Management Principles",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Utilities",
      stem: "A water utility compares two material options for 1 km of DN300 distribution main over a 50-year analysis period: ductile-iron (C_acq = €120,000; annual C_op+C_maint = €3,300; C_renew+disp at year 50 = €40,000) and PVC (C_acq = €95,000; annual C_op+C_maint = €2,050; C_renew+disp at year 50 = €30,000). Discount rate r = 5%. P/A(5%, 50) = 18.256 and P/F(5%, 50) = 0.0872. What are the two PV LCCs and the per-km saving?",
      whyCorrect:
        "LCC_DI = 120,000 + 3,300·18.256 + 40,000·0.0872 = 120,000 + 60,245 + 3,488 = €183,733. LCC_PVC = 95,000 + 2,050·18.256 + 30,000·0.0872 = 95,000 + 37,425 + 2,616 = €135,041. Saving = 183,733 − 135,041 = €48,692 per km (≈26% of the DI LCC). The assessor uses this LCC-informed ranking to verify the SAMP renewal policy commits to the lower-LCC material, not to the lower-first-cost material.",
      whyOthersWrong: [
        "Option A (DI €183,733; PVC €135,041; saving €48,692) — the correct values per the LCC formula.",
        "Option B (DI €183,733; PVC €135,041; saving €5,692) has the right LCCs but the wrong saving (subtraction error).",
        "Option C (DI €120,000; PVC €95,000; saving €25,000) uses only first cost (acquisition), ignoring all operational, maintenance, renewal, and disposal costs — this is the first-cost mistake the LCC method exists to prevent.",
        "Option D (DI €60,245; PVC €37,425; saving €22,820) uses only the annuity term (the PV of operating + maintenance costs), ignoring acquisition and end-of-life costs.",
      ],
      explanation:
        "LCC = C_acq + (C_op+C_maint)·P/A(r,T) + (C_renew+C_disp)·P/F(r,T). With r=5%, T=50, P/A=18.256, P/F=0.0872: LCC_DI = €183,733; LCC_PVC = €135,041; saving = €48,692/km. First-cost-only decisions are inconsistent with the ISO 55000 Value principle.",
      options: [
        {
          text: "DI €183,733; PVC €135,041; saving €48,692",
          isCorrect: true,
        },
        {
          text: "DI €183,733; PVC €135,041; saving €5,692",
          isCorrect: false,
        },
        {
          text: "DI €120,000; PVC €95,000; saving €25,000",
          isCorrect: false,
        },
        {
          text: "DI €60,245; PVC €37,425; saving €22,820",
          isCorrect: false,
        },
      ],
    },
    {
      competencyName: "Asset Management Principles",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Utilities",
      stem: "As CAMA assessor you review a transmission utility's maturity self-assessment. The SAMP subject is scored at L3 ('Defined'). Which of the following sets of evidence is necessary and sufficient to support an L3 finding under the IAM maturity model?",
      whyCorrect:
        "The IAM level-3 ('Defined') definition requires: AM processes are defined, documented, and integrated; the SAMP and AMPs exist and are used; the SAMP translates organizational objectives into AM objectives and is current (under regular review); and roles, responsibilities, and authorities are assigned. An L3 SAMP does not yet need quantitative KPI benchmarking (that is L4) or institutionalized innovation (L5), but it does need documented processes, integrated use, and current content. The assessor verifies each piece of evidence; absence of any one drops the score to L2 ('Aware').",
      whyOthersWrong: [
        "Option A (the AM team 'knows what to do') is L1/L2 evidence — aspiration, not defined, documented, integrated processes. Scoring L3 on this basis is the most common maturity-inflation error the CAMA assessor uncovers.",
        "Option C (every Anatomy subject at L4, quantitative KPI benchmarking, institutionalized innovation) is L4/L5 evidence — not necessary for L3; over-claiming L4/L5 is also a maturity-inflation error and the assessor re-scores to L3 if the L4 quantitative evidence is missing.",
        "Option D (the SAMP exists as a document) is necessary but not sufficient — an L3 SAMP must also be defined (a documented process), integrated (used to drive AMPs and operational decisions), and current (under regular review), not merely exist on paper.",
      ],
      explanation:
        "IAM L3 ('Defined') = AM processes defined, documented, integrated; SAMP and AMPs exist and are used; SAMP translates org objectives into AM objectives and is current; roles & responsibilities assigned. L4 adds quantitative KPI benchmarking; L5 adds institutionalized innovation. L1/L2 are awareness-only, not documented-integrated processes.",
      options: [
        {
          text: "SAMP exists; documented process; integrated with AMPs; current under review; roles assigned",
          isCorrect: true,
        },
        {
          text: "AM team knows what to do; policy communicated; some AMPs drafted",
          isCorrect: false,
        },
        {
          text: "Quantitative KPI benchmarking on every Anatomy subject; institutionalized innovation programme",
          isCorrect: false,
        },
        {
          text: "The SAMP exists as a document",
          isCorrect: false,
        },
      ],
    },
    {
      competencyName: "Asset Management Principles",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: ISO 55000:2014 specifies that asset management is essentially equivalent to maintenance management — both disciplines exist to keep physical assets in good working order, and the principal difference is that asset management applies ISO 55001's formal documentation requirements on top.",
      whyCorrect:
        "False. Asset management and maintenance management are distinct disciplines. Maintenance management is one lifecycle activity (the 'maintenance' stage) within asset management — and within the broader asset lifecycle (creation, utilization, maintenance, renewal, disposal). Asset management spans the whole lifecycle, the whole value chain, and all asset classes (physical, informational, intangible, financial) in scope; its purpose is to realize value from assets, not merely to keep them working. Treating asset management as 'maintenance management plus ISO 55001 documentation' is one of the most common misframings the CAMA assessor uncovers — and it is the misframing that produces SAMPs written as maintenance plans rebadged, AM objectives that are MTBF targets, and AM policies that read as maintenance slogans.",
      whyOthersWrong: [
        "True — the candidate would conflate two distinct disciplines. Maintenance management is a sub-discipline within asset management, focused on the maintenance lifecycle stage. Asset management is the broader discipline that frames maintenance's role, integrates it with creation, utilization, renewal, and disposal, and links it to organizational objectives through the SAMP. ISO 55001's documentation requirements are not 'added on top of maintenance management' — they are the management-system requirements that make the broader asset management discipline auditable.",
      ],
      explanation:
        "False. Asset management ≠ maintenance management + ISO 55001 documentation. Maintenance is one lifecycle stage; asset management spans the lifecycle, the value chain, and all in-scope asset classes. The SAMP, AMPs, and AM policy exist to realize value from assets, not merely to keep them working.",
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Asset Management Policy & Strategy
// (Competency: "Asset Management Policy & Strategy"; slug: cama-policy-and-strategy)
// ---------------------------------------------------------------------------

const LESSON_AM_POLICY: RefLesson = {
  competencyName: "Asset Management Policy & Strategy",
  slug: "cama-policy-and-strategy",
  title: "Asset Management Policy & Strategy",
  titleAr: "سياسة واستراتيجية إدارة الأصول",
  order: 2,
  durationMin: 35,
  references: AMP_REFERENCE_TITLES,
  conceptIntroduction: `ISO 55001 §5.2 requires the asset management policy to (a) be appropriate to the purpose of the organization, (b) provide a framework for the AM objectives, (c) include a commitment to satisfy applicable requirements, and (d) include a commitment to continual improvement. These four requirements — appropriate, framework, commitment to requirements, commitment to continual improvement — are the CAMA assessor's first four checklist items. A policy that reads as a marketing slogan fails (a); a policy that lists no framework for objectives fails (b); a policy that omits regulatory, statutory, customer, and stakeholder requirements fails (c); a policy that names continual improvement without an institutionalized improvement mechanism fails (d).

The policy is set by top management (ISO 55001 §5.1) and is the apex of the AM document hierarchy. Below it sits the Strategic Asset Management Plan (SAMP) — the document that translates the organization's objectives into AM objectives, defines the approach for developing AMPs, and clarifies the role of the AMS in achieving AM objectives (ISO 55002:2018 §6.2.1). Below the SAMP sit the Asset Management Plans (AMPs) — tactical plans per asset class, system, or location. Below the AMPs sit the operational work orders. The cascade from organizational objectives → AM policy → SAMP → AM objectives → AMPs → work orders is the spine of the AMS; the assessor traces it top-down (objectives flowing to work) and bottom-up (work supporting objectives).

Alignment is the connecting principle. ISO 55001 §5.1c requires top management to "ensure the AM policy and AM objectives are established and compatible with the organization's strategic direction." When the organization's strategy changes — new service territory, new regulatory regime, new sustainability target, merger/acquisition — the AM policy, SAMP, and AM objectives must change with it. The assessor verifies the policy is current (dated, under review), aligned with current organizational objectives, and communicated. A policy that is 5 years old, undated, and uncommunicated is a §5.2 finding regardless of how well it reads.`,
  example: `A water utility (CASE_TYPE = SYNTHETIC) drafts its asset management policy aligned to ISO 55001 §5.2. Draft text: "Northern Water exists to deliver safe, reliable, affordable, and sustainable water services to the communities we serve. Our assets — 2,800 km of mains, 18 treatment works, 420 pump stations, 65 reservoirs — exist to deliver that value. We will manage our assets across their full lifecycle (creation, utilization, maintenance, renewal, disposal) to: (i) protect public health and safety; (ii) meet statutory and regulatory requirements including the Drinking Water Standards and our regulator's service-level conditions; (iii) deliver the service levels our customers and the regulator expect ( interruptions ≤ 240 min/year, water-quality compliance ≥ 99.5%); (iv) minimize the whole-life cost of asset ownership and operation; (v) reduce our environmental footprint (carbon, water, biodiversity); (vi) continually improve our asset management system, benchmarked against the IAM Anatomy and Maturity Model. This policy provides the framework for setting and reviewing asset management objectives. The Strategic Asset Management Plan translates this policy into AM objectives. Top management, supported by the AM team and all employees, is accountable for implementing this policy, which is communicated to all staff, contractors, and interested parties, and is reviewed at least annually."

CAMA assessor's four-point review: (a) Appropriate to the purpose — yes, the policy opens with the utility's purpose ("safe, reliable, affordable, sustainable water services") and grounds it in the asset base. (b) Framework for AM objectives — yes, the policy explicitly states "This policy provides the framework for setting and reviewing asset management objectives" and identifies the six value dimensions (health & safety, regulatory, service, cost, environmental, improvement) that frame objective-setting. (c) Commitment to applicable requirements — yes, the policy names the Drinking Water Standards, the regulator's service-level conditions, and statutory requirements. (d) Commitment to continual improvement — yes, the policy commits to continually improve the AMS, benchmarked against the IAM Anatomy and Maturity Model. Findings: policy compliant with ISO 55001 §5.2; the assessor next verifies the policy is communicated (§5.1c, §7.3) and current (§5.2 review).`,
  keyFormulas: `ISO 55001 §5.2 — four requirements for the asset management policy:
  (a) appropriate to the purpose of the organization;
  (b) provide a framework for the AM objectives;
  (c) include a commitment to satisfy applicable requirements;
  (d) include a commitment to continual improvement.

ISO 55001 §5.1 — top management leadership & commitment (selected):
  (a) ensure the AMS is established, implemented, maintained, and improved;
  (b) ensure the AM policy and AM objectives are established and compatible with the org's strategic direction;
  (c) ensure the integration of AM requirements into business processes;
  (d) ensure the resources needed for the AMS are available;
  (e) communicate the importance of effective AM and conformance to the AM policy;
  (f) ensure the AMS achieves its intended outcomes;
  (g) direct and support persons to contribute to the AMS;
  (h) promote continual improvement;
  (i) support other relevant management roles.

Document cascade (ISO 55001 + ISO 55002 §6.2):
  Organizational objectives → AM policy (§5.2) → SAMP (§6.2.1) → AM objectives (§6.2) → AMPs (tactical) → operational work orders.

ISO 55001 §7.5 documented information: the AM policy must be (a) documented, (b) approved by top management, (c) communicated, (d) available to interested parties as appropriate, (e) maintained and reviewed.

ISO 55001 §9.3 management review inputs include: status of actions from previous reviews, changes in external/internal issues, AM performance, fulfilment of AM objectives, nonconformities and corrective actions, audit results, improvement opportunities — and changes to the AM policy may result.`,
  exercise: `You are the CAMA assessor reviewing a regional gas-distribution utility's AM policy. The policy text is: "GasCo will manage its assets safely, reliably, and at lowest cost." (a) Identify which of the four ISO 55001 §5.2 requirements the policy fails to meet, and explain why. (b) Rewrite the policy in two paragraphs that meet all four §5.2 requirements. (c) The utility's CEO has been in post for 6 months; the policy was last reviewed 4 years ago under the previous CEO. Identify the ISO 55001 clauses at risk and the evidence you would request to verify the policy is current and aligned with the new CEO's strategic direction.`,
  sections: {
    learning_objectives: `- State the four ISO 55001 §5.2 requirements for the asset management policy and explain how the CAMA assessor verifies each.
- Distinguish the AM policy (§5.2), the SAMP (§6.2.1), the AM objectives (§6.2), and the AMPs (tactical), and trace the cascade from organizational objectives to operational work orders.
- Explain top management's leadership & commitment (§5.1) — the nine specific responsibilities — and identify what evidence the assessor expects for each.
- Identify what makes a policy 'appropriate to the purpose of the organization' (§5.2a) versus a marketing slogan.
- Apply ISO 55002:2018 §6.2.1 interpretive guidance to assess a draft SAMP.
- Detect the four most common policy failures (slogan, no framework, no commitment to requirements, no continual improvement mechanism) and recommend corrective action.`,
    prerequisites: `- Asset Management Principles lesson (the four ISO 55000 principles, the asset lifecycle, the AM definition).
- The CAMA 4-domain structure and the position of Asset Management Principles & Policy within it.
- ISO management-systems family (ISO 9001, 14001, 45001) — the policy/plan/objective cascade pattern.
- Strategic planning basics: organizational vision, mission, strategic objectives, KPI cascades.`,
    introduction: `ISO 55001 §5.2 specifies four requirements for the asset management policy: it must be (a) appropriate to the purpose of the organization, (b) provide a framework for the AM objectives, (c) include a commitment to satisfy applicable requirements, and (d) include a commitment to continual improvement. These four requirements are not optional; they are the assessor's first four checklist items when reading the policy. A policy that fails any one is a §5.2 finding.

The policy sits at the apex of the AM document hierarchy. Below it sits the Strategic Asset Management Plan (SAMP) — the document that translates organizational objectives into AM objectives and clarifies the approach for AMPs and the role of the AMS (ISO 55002 §6.2.1). Below the SAMP sit the Asset Management Plans (AMPs) — tactical plans per asset class, system, or location. Below the AMPs sit the operational work orders. This cascade — organizational objectives → AM policy → SAMP → AM objectives → AMPs → work orders — is the spine of the AMS. The assessor traces it top-down (do the AM objectives flow from the policy and the SAMP, and do the AMPs operationalize the AM objectives?) and bottom-up (do the operational work orders support the AMPs, and do the AMPs support the AM objectives?).

The policy is set by top management (ISO 55001 §5.1). Top management's leadership & commitment is operationalized through nine specific responsibilities: (a) ensure the AMS is established, implemented, maintained, improved; (b) ensure the AM policy and AM objectives are compatible with the strategic direction; (c) ensure AM requirements are integrated into business processes; (d) ensure resources are available; (e) communicate the importance of effective AM; (f) ensure the AMS achieves its intended outcomes; (g) direct and support persons to contribute; (h) promote continual improvement; (i) support other relevant management roles. The assessor verifies each with evidence — not assertion.

Alignment is the connecting principle. ISO 55001 §5.1b requires the AM policy and AM objectives to be "compatible with the organization's strategic direction." When the strategy changes, the policy, SAMP, and AM objectives must change with it. The assessor verifies the policy is current (dated, under review, signed by current top management), aligned with current organizational objectives, and communicated (§5.1e, §7.3 awareness). A policy that is 5 years old, undated, and uncommunicated is a §5.2 finding regardless of how well it reads.

The four most common policy failures the CAMA assessor uncovers: (1) SLOGAN — the policy reads as a marketing claim ("we manage our assets well") and fails the "appropriate to the purpose" requirement (§5.2a). (2) NO FRAMEWORK — the policy does not provide a framework for AM objectives (no link to organizational objectives, no value dimensions named) and fails §5.2b. (3) NO COMMITMENT TO REQUIREMENTS — the policy omits regulatory, statutory, customer, and stakeholder requirements, and fails §5.2c. (4) NO CONTINUAL IMPROVEMENT MECHANISM — the policy names continual improvement but the AMS has no institutionalized improvement mechanism (no §9.3 management review, no §10.2/10.3 process), and fails §5.2d. The CAMA assessor's corrective-action recommendation is to redraft the policy with the four §5.2 requirements explicit, and to institutionalize the §9.3 management review and the §10 improvement process to support the §5.2d commitment.`,
    terminology: `- **Asset management policy (ISO 55001 §5.2)**: the top-level statement of intent and direction for asset management, set by top management; must be (a) appropriate to the purpose of the organization, (b) provide a framework for AM objectives, (c) commit to satisfy applicable requirements, (d) commit to continual improvement.
- **Strategic Asset Management Plan (SAMP)**: documented information that specifies how organizational objectives are converted into AM objectives, the approach for developing AMPs, and the role of the AMS in achieving AM objectives (ISO 55002 §6.2.1).
- **Asset management objectives (ISO 55001 §6.2)**: specific, measurable AM results to be achieved; consistent with the policy; SMART.
- **Asset management plans (AMPs)**: tactical documented information specifying the activities, resources, and timescales to achieve the AM objectives (per asset class, system, or location).
- **Organizational objectives**: what the organization seeks to achieve through its assets; the apex of the cascade.
- **Top management**: the person or group who directs and controls the organization at the highest level (ISO 55001 §5.1 leadership).
- **Documented information (ISO 55001 §7.5)**: information that must be controlled and maintained by the organization (policies, plans, procedures, records).
- **Interested parties (ISO 55001 §4.2)**: stakeholders whose needs and expectations are relevant to the AMS (customers, regulators, shareholders, employees, communities).
- **Management review (ISO 55001 §9.3)**: top-management review of AMS effectiveness; the policy is a review input and may be a review output (changes).
- **Continual improvement (ISO 55001 §10.3)**: the recurring process of enhancing the AMS to achieve AM objectives and improve performance.`,
    detailed_explanation: `ISO 55001 §5.2's four requirements are not a checklist of nice-to-haves — they are the assessor's first four findings. (a) Appropriate to the purpose: the policy must ground itself in the organization's purpose. A water utility's policy must invoke public health, safe water, service reliability; a transmission utility's policy must invoke safe, reliable, affordable electricity; a refinery's policy must invoke process safety, throughput, environmental compliance. A policy that opens with "we manage our assets to deliver value" without naming the purpose-specific value is a slogan. (b) Framework for AM objectives: the policy must provide the framework — typically by naming the value dimensions (safety, regulatory compliance, service, cost, environment, improvement) that frame the AM objectives. Without this framework, the AM objectives set under §6.2 hang in mid-air. (c) Commitment to satisfy applicable requirements: the policy must commit to satisfying applicable statutory, regulatory, customer, and stakeholder requirements. Naming the specific requirements (e.g., the Drinking Water Standards, the regulator's service-level conditions, the safety regulations) is stronger than a generic commitment. (d) Commitment to continual improvement: the policy must commit to continually improve the AMS — and this commitment must be institutionalized through §9.3 management review, §10.2 corrective action, and §10.3 continual improvement, not merely named.

The cascade from organizational objectives to operational work orders is the spine of the AMS. The AM policy (§5.2) sits at the apex. The SAMP (§6.2.1) translates organizational objectives into AM objectives and clarifies the approach for AMPs and the role of the AMS. The AM objectives (§6.2) are the SMART results to be achieved. The AMPs are the tactical plans per asset class. The operational work orders are the daily activities. The assessor traces this cascade in both directions: top-down to verify that policy and SAMP flow to AMPs and work orders, bottom-up to verify that work orders support AMPs which support AM objectives which support the policy. A break anywhere in the cascade is a finding — most commonly, AM objectives that have no underlying AMP (the objective is asserted but not tacticalized), or AMPs that have no link to AM objectives (the AMP is a maintenance plan rebadged).

Top management's leadership & commitment (§5.1) is operationalized through nine specific responsibilities. The assessor does not accept assertion ("the CEO supports asset management"); each responsibility requires evidence. (a) The AMS is established, implemented, maintained, improved — evidence: the AM policy is signed, the SAMP is current, the internal audit programme is active, the management review has been held. (b) The AM policy and AM objectives are compatible with the strategic direction — evidence: the policy references the strategic plan; the AM objectives map to the strategic objectives; the CEO's strategy document is dated within the policy's review period. (c) AM requirements are integrated into business processes — evidence: AM is in the budget cycle, the capital-approval gate, the operational-planning process, the regulator-facing reports. (d) Resources are available — evidence: the AM team is staffed, the AM budget is committed, the asset register is maintained, the LCC tool is licensed. (e) Communication of the importance of effective AM — evidence: the policy is published, the awareness training is delivered, the CEO mentions AM in town halls. (f) The AMS achieves its intended outcomes — evidence: the AM objectives are met, the KPI dashboard is green, the audit findings are closed. (g) Direction and support for persons to contribute — evidence: roles and responsibilities are defined, the AM team has authority, the maintenance teams know their role in the AMS. (h) Promotion of continual improvement — evidence: §9.3 management review is held, §10.2 corrective action is effective, §10.3 continual improvement is institutional. (i) Support for other relevant management roles — evidence: the AM manager has access to the CFO, the operations director, the safety director; the AM team is cross-functional.

The SAMP is the most important single artefact the CAMA assessor reviews. ISO 55002 §6.2.1 specifies its content: how the organizational objectives are converted into AM objectives, the approach for developing AMPs, the role of the AMS in achieving AM objectives, the approach for managing asset risks (linked to §6.1), the approach for managing asset lifecycle activities (creation, utilization, maintenance, renewal, disposal), and the AM measures of success (linked to §9.1). The assessor verifies each element is present and current.

A break in alignment is the most common assessor finding. The most frequent pattern: the organization's strategy changed (e.g., a new sustainability commitment, a new service territory, a merger) but the AM policy, SAMP, and AM objectives were not updated. The assessor's evidence request: the current strategic plan, the date of the last AM policy review, the date of the last SAMP review, the traceability matrix that maps organizational objectives to AM objectives. Where the traceability is broken, the finding is against §5.1b (compatibility with the strategic direction), §5.2 (the policy is no longer appropriate to the purpose), and §6.2.1 (the SAMP no longer translates the current organizational objectives).`,
    core_principles: `- The AM policy must meet all four ISO 55001 §5.2 requirements: appropriate, framework, commitment to requirements, commitment to continual improvement.
- The policy is the apex of the AM document cascade: organizational objectives → policy → SAMP → AM objectives → AMPs → work orders.
- Top management's leadership & commitment (§5.1) is operationalized through nine specific responsibilities, each requiring evidence.
- Alignment is the connecting principle: when the organizational strategy changes, the policy, SAMP, and AM objectives must change with it.
- The SAMP (§6.2.1) is the most important single artefact — it translates organizational objectives into AM objectives and clarifies the approach for AMPs, risk, lifecycle, and measures of success.
- The four most common policy failures: slogan, no framework, no commitment to requirements, no continual improvement mechanism.
- The assessor traces the cascade top-down and bottom-up; a break anywhere is a finding.`,
    components: `- AM policy document (§5.2) — text meeting the four requirements, signed by top management, dated.
- SAMP (§6.2.1) — the bridge document, current and reviewed.
- AM objectives (§6.2) — SMART results, mapped to the policy framework.
- AMPs (per asset class) — tactical plans, linked to AM objectives.
- Operational work orders — daily activities, linked to AMPs.
- Strategic plan — the source of organizational objectives, dated, current.
- Traceability matrix — maps organizational objectives to AM objectives to AMPs.
- Communication record (§5.1e, §7.3) — policy publication, awareness training, town-hall mentions.
- Management review record (§9.3) — review inputs, outputs, decisions, follow-up.
- Improvement register (§10.2, §10.3) — nonconformities, corrective actions, continual improvement actions.
- Interested-party register (§4.2) — stakeholders and their needs/expectations.
- Documented information controls (§7.5) — version control, approval, availability, retention.`,
    process: `1. Establish the organizational objectives (strategic plan, dated, current).
2. Identify interested parties (§4.2) and their needs/expectations (regulatory, customer, shareholder, employee, community).
3. Identify the AMS scope (§4.3) — assets, functions, sites, organizational units.
4. Draft the AM policy with the four §5.2 requirements explicit (appropriate, framework, commitment to requirements, commitment to continual improvement).
5. Approve the policy with top management signature; date and version it.
6. Communicate the policy (§5.1e, §7.3) — publish, train, brief.
7. Develop the SAMP (§6.2.1) — translate organizational objectives into AM objectives; document approach for AMPs, risk, lifecycle, measures of success.
8. Set AM objectives (§6.2) — SMART, consistent with policy.
9. Develop AMPs (tactical) per asset class — linked to AM objectives.
10. Cascade to operational work orders — linked to AMPs.
11. Hold management review (§9.3) annually — policy is a review input and may be a review output (changes).
12. Improve (§10) — corrective action on nonconformities; continual improvement on the AM system.
13. Review the policy at least annually; update when the organizational strategy changes.`,
    formula_calculation: `ISO 55001 §5.2 policy requirements (4; all must be met):
  (a) appropriate to the purpose of the organization;
  (b) provide a framework for the AM objectives;
  (c) include a commitment to satisfy applicable requirements;
  (d) include a commitment to continual improvement.

ISO 55001 §5.1 top management leadership (9 responsibilities): (a)-(i) as listed above; the assessor scores each as evidence-met, evidence-partial, or evidence-missing.

Document cascade (depth):
  Level 0: Organizational objectives (strategy document)
  Level 1: AM policy (§5.2) — 1 document
  Level 2: SAMP (§6.2.1) — 1 document
  Level 3: AM objectives (§6.2) — typically 5-15 SMART objectives
  Level 4: AMPs (tactical) — typically 5-25 per asset class
  Level 5: Operational work orders — daily/weekly activities
  Cascade integrity = (Σ levels with bidirectional traceability) / 5

Policy freshness (§5.2 + §9.3):
  Policy age = today − last_review_date
  Acceptable: ≤ 12 months (under §9.3 annual review)
  Finding: > 24 months or unreviewed since change of top management.

Assessor's policy scoring rubric:
  Score 4: all four §5.2 requirements met; §5.1 nine responsibilities evidenced; policy <12 months old; traceability complete (top-down and bottom-up).
  Score 3: four §5.2 requirements met; nine §5.1 responsibilities mostly evidenced; policy <24 months old; minor traceability gaps.
  Score 2: one or more §5.2 requirements partially met; §5.1 evidence incomplete; policy >24 months old; major traceability gaps.
  Score 1: policy is a slogan; §5.1 evidence absent; no traceability.`,
    worked_example: `A water utility (CASE_TYPE = SYNTHETIC) drafts its asset management policy. Draft text:

"Northern Water exists to deliver safe, reliable, affordable, and sustainable water services to the communities we serve. Our assets — 2,800 km of mains, 18 treatment works, 420 pump stations, 65 reservoirs — exist to deliver that value. We will manage our assets across their full lifecycle (creation, utilization, maintenance, renewal, disposal) to: (i) protect public health and safety; (ii) meet statutory and regulatory requirements including the Drinking Water Standards and our regulator's service-level conditions; (iii) deliver the service levels our customers and the regulator expect (interruptions ≤ 240 min/year, water-quality compliance ≥ 99.5%); (iv) minimize the whole-life cost of asset ownership and operation; (v) reduce our environmental footprint (carbon, water, biodiversity); (vi) continually improve our asset management system, benchmarked against the IAM Anatomy and Maturity Model. This policy provides the framework for setting and reviewing asset management objectives. The Strategic Asset Management Plan translates this policy into AM objectives. Top management, supported by the AM team and all employees, is accountable for implementing this policy, which is communicated to all staff, contractors, and interested parties, and is reviewed at least annually at the management review (§9.3)."

CAMA assessor's four-point review against §5.2:

(a) Appropriate to the purpose — MET. The policy opens with the utility's purpose ("safe, reliable, affordable, sustainable water services to the communities we serve") and grounds it in the asset base. The purpose is organization-specific (not generic).

(b) Framework for AM objectives — MET. The policy explicitly states "This policy provides the framework for setting and reviewing asset management objectives" and names the six value dimensions (health & safety; regulatory; service; cost; environment; improvement) that frame objective-setting. The six dimensions translate directly into six families of AM objectives.

(c) Commitment to applicable requirements — MET. The policy names the Drinking Water Standards, the regulator's service-level conditions, statutory requirements, and the public-health mandate. The commitment is specific, not generic.

(d) Commitment to continual improvement — MET (procedurally). The policy commits to continually improve the AMS, benchmarked against the IAM Anatomy and Maturity Model, and institutionalizes the commitment through the §9.3 management review (annual). The assessor next verifies the §9.3 management review is actually held and the §10.3 continual-improvement process is functional.

§5.1 nine-responsibility evidence: (a) AMS established, implemented, maintained — yes, the SAMP and AMPs are documented; (b) compatibility with strategic direction — yes, the policy references the utility's purpose; (c) integration into business processes — yes, the policy names whole-life cost (LCC) which the assessor verifies is in the budget cycle; (d) resources — yes, the AM team and asset register are funded; (e) communication — yes, "communicated to all staff, contractors, and interested parties"; (f) AMS achieves outcomes — verified separately through §9.1 KPIs; (g) direction and support — yes, "top management, supported by the AM team and all employees, is accountable"; (h) continual improvement — yes; (i) support for other management roles — verified through interviews.

Assessor's finding: policy compliant with ISO 55001 §5.2; §5.1 nine responsibilities evidenced; next verification: §5.1e communication (was the policy actually published, briefed, trained?) and §9.3 management review (was the annual review actually held, with the policy as a review input and any changes as a review output?).`,
    industrial_example: `Oil & Gas — a refinery's AM policy reads: "RefineryCo exists to refine crude oil into marketable products safely, reliably, profitably, and sustainably. Our assets — 4,200 equipment items, 280 km of piping, 14 process units, 4 storage tank farms — exist to deliver that value. We will manage our assets across their full lifecycle to: (i) protect process-safety integrity and personal safety; (ii) meet statutory and regulatory requirements including the petroleum-refining regulations and our safety-case conditions; (iii) deliver the service levels our shareholders and customers expect (on-stream availability ≥ 94%, planned-turnaround schedule adherence ≥ 95%); (iv) minimize the whole-life cost of asset ownership; (v) reduce our environmental footprint (carbon, SOx/NOx, water); (vi) continually improve our AMS, benchmarked against the IAM Anatomy. This policy provides the framework for AM objectives. The SAMP translates this policy into AM objectives. Top management is accountable for implementation; the policy is communicated and reviewed at least annually." The assessor verifies the policy is integrated with the refinery's Process Safety Management (PSM) system, the turnaround programme, the RBI (risk-based inspection) programme, and the regulator-facing safety-case reports.`,
    case_study: `SYNTHETIC CASE — "GasCo": a regional gas-distribution utility. The AM policy is 4 years old, undated, three sentences long: "GasCo will manage its assets safely, reliably, and at lowest cost." The CEO has been in post 6 months. The SAMP does not exist. The AMPs are the old maintenance plans rebadged. The internal audit reports "minor nonconformities" against §5.2 because the policy is "well-known to staff" (asserted, not evidenced).

CAMA assessor's findings:

(1) §5.2(a) Appropriate to the purpose — finding. The policy does not state GasCo's purpose ("safe, reliable, affordable gas distribution"), does not ground itself in the asset base, and reads as a slogan. Corrective action: redraft with purpose, asset base, and the four §5.2 requirements explicit.

(2) §5.2(b) Framework for AM objectives — finding. The policy does not provide a framework for AM objectives; no value dimensions named; no link to organizational objectives. Corrective action: name the value dimensions (safety, regulatory, service, cost, environment, improvement) and commit to setting AM objectives within this framework.

(3) §5.2(c) Commitment to applicable requirements — finding. The policy does not name the statutory and regulatory requirements (gas-safety regulations, the regulator's service-level conditions, the safety-case conditions). Corrective action: name the specific requirements.

(4) §5.2(d) Commitment to continual improvement — finding. The policy names continual improvement but the AMS has no §9.3 management review (the last "policy review" was 4 years ago, undated) and no institutionalized §10.3 continual-improvement process. Corrective action: institute the §9.3 management review (annual) and the §10 improvement process, then update the policy to commit to it.

(5) §5.1(b) Compatibility with strategic direction — finding. The new CEO has been in post 6 months; the strategic direction has changed (new net-zero commitment, new regulator-imposed service-level targets); the policy was last reviewed 4 years ago and is silent on net-zero. Corrective action: review the policy at the next §9.3 management review (or sooner), align with the new strategic direction, and commit to net-zero targets.

(6) §5.1(e) Communication — finding. The policy is "well-known to staff" (auditor's assertion) but no evidence of publication, briefing, or awareness training was provided. Corrective action: publish the policy, brief all staff, deliver awareness training (§7.3), and retain evidence.

Recommended overall outcome: 6 major findings against §5.1 and §5.2; recommendation is to redraft the policy and institutionalize the §9.3/§10 mechanisms before ISO 55001 certification is sought.`,
    visual_explanation: `The AM document cascade is visualized as a five-tier pyramid: at the apex, the Organizational Objectives (strategy); below it, the AM Policy (§5.2); below that, the SAMP (§6.2.1); then the AM Objectives (§6.2) at level 3; the AMPs (tactical) at level 4; and the operational work orders at level 5. Two arrows run alongside the pyramid: top-down ("flow-down — do the AM objectives flow from the policy and SAMP, do the AMPs operationalize the AM objectives, do the work orders support the AMPs?") and bottom-up ("trace-up — do the work orders support the AMPs, do the AMPs support the AM objectives, do the AM objectives support the policy and the strategy?"). A break at any tier is flagged. A second visual: the §5.2 four-requirements scorecard (appropriate / framework / commitment to requirements / commitment to continual improvement) as four checkboxes against the policy text.`,
    simulation_opportunity: `A Policy Drafter simulator: input the organization's purpose, asset base, statutory and regulatory requirements, customer service levels, strategic direction, and continual-improvement mechanisms; generate a draft AM policy text that meets the four ISO 55001 §5.2 requirements; score the draft against the four requirements and the §5.1 nine-responsibility evidence. A second simulator: the Cascade Tracer — input the organizational objectives, the policy, the SAMP, the AM objectives, the AMPs, and a sample of work orders; the simulator traces the cascade top-down and bottom-up and flags breaks.`,
    common_mistakes: `- Writing the AM policy as a marketing slogan ("we manage our assets well") rather than the four §5.2 requirements — the most common §5.2 finding.
- Failing to provide a framework for AM objectives (§5.2b) — the policy names no value dimensions and the AM objectives hang in mid-air.
- Omitting regulatory, statutory, customer, and stakeholder requirements (§5.2c) — a generic commitment is insufficient; the specific requirements must be named.
- Naming continual improvement (§5.2d) without institutionalizing it (§9.3 management review and §10 improvement process) — the commitment is procedural, not actual.
- Letting the policy go stale — a 5-year-old policy under a new CEO and a changed strategic direction is a §5.2 and §5.1b finding.
- Confusing the policy with the SAMP — the policy is the apex statement; the SAMP is the translation of organizational objectives into AM objectives; they are different documents.
- Treating the AMPs as rebadged maintenance plans — AMPs must be linked to AM objectives (top-down and bottom-up), not merely renamed.
- Accepting assertion ("the CEO supports asset management") for §5.1 leadership evidence — each of the nine responsibilities requires specific evidence.
- Outsourcing policy drafting to a consultant without top-management engagement — the policy is the apex document and top management must own it (§5.1).`,
    limitations: `- ISO 55001 §5.2 specifies what the policy must contain but does not prescribe its length, structure, or style; the assessor applies professional judgement (ISO 55002 §5.2 provides guidance).
- The four §5.2 requirements are necessary but not sufficient — a policy that meets all four can still fail to drive behaviour if communication (§5.1e, §7.3) and integration (§5.1c) are weak.
- The §5.1 nine-responsibility list is exhaustive but the evidence for each is organization-specific; the assessor's evidence requests vary by sector.
- The SAMP (§6.2.1) content is specified by ISO 55002 interpretive guidance, not by ISO 55001 requirements; the SAMP's maturity varies widely between organizations.
- The cascade model assumes a single accountable organization; in joint ventures, regulated subsidiaries, and outsourced operations the cascade has organizational boundaries that complicate traceability.
- The assessor's findings against §5.2 and §5.1 are qualitative; the four-requirement and nine-responsibility rubrics are checklists, not numerical scores.`,
    comparison: `Compared to ISO 9001 §5.2 (quality policy): the structure is the same (a top-management apex statement providing a framework for objectives and committing to continual improvement) but the "subject" is the asset and its lifecycle, not product/service quality. The ISO 55001 policy explicitly grounds in the asset base and the value dimensions of asset ownership. Compared to ISO 14001 §5.2 (environmental policy): again the same structure, but ISO 55001 is broader — environment is one of the value dimensions, not the whole. Compared to PAS 55 §4.1.1 (the AM policy requirement under PAS 55): ISO 55001 §5.2 is the international successor; PAS 55's "published AM policy" is now §5.2 with the four explicit requirements. Compared to the SMRP CMRP "Business & Management" pillar: CMRP focuses on the business case for maintenance and reliability; CAMA's §5.2 is the formal AMS requirement for the AM policy, applicable across all asset classes and all sectors.`,
    practical_application: `1. Read the organization's strategic plan; identify the organizational objectives and the value dimensions the strategy commits to.
2. Draft the AM policy with the four §5.2 requirements explicit (appropriate, framework, commitment to requirements, commitment to continual improvement); ground it in the asset base and the purpose.
3. Approve the policy with top management signature; date and version it (§7.5 documented information).
4. Communicate the policy (§5.1e, §7.3) — publish, brief, train; retain evidence.
5. Develop the SAMP (§6.2.1) — translate organizational objectives into AM objectives; document approach for AMPs, risk, lifecycle, measures of success.
6. Set SMART AM objectives (§6.2) within the policy framework; map them to the organizational objectives (traceability matrix).
7. Develop AMPs (tactical) per asset class — linked to AM objectives.
8. Cascade to operational work orders — linked to AMPs.
9. Hold §9.3 management review annually — the policy is a review input; changes to the policy may be a review output (especially after a strategic-direction change).
10. Improve (§10) — corrective action on nonconformities; continual improvement on the AMS.
11. Review the policy at least annually and on any change of top management or strategic direction.`,
    decision_scenario: `You are the CAMA assessor on Day 1 of a 5-day assessment. You ask for the AM policy. The AM manager hands you a one-page document dated 4 years ago, signed by the previous CEO (now retired), that reads: "OurCompany will manage its assets safely, reliably, and at lowest cost." The new CEO has been in post 7 months and has announced a new strategic direction with three net-zero commitments and a new service-territory expansion. The SAMP is "in draft" (a 3-page skeleton). The AMPs are the old maintenance plans rebadged. Decision: do you proceed with the assessment, pause the assessment pending policy redraft, or proceed with provisional findings against §5.2 and §5.1? What evidence do you request on Day 1 to verify §5.1 leadership and §5.2 policy conformance? What are your top three findings and your recommended corrective actions?`,
    practice_questions: `- State the four ISO 55001 §5.2 requirements for the asset management policy.
- List the nine ISO 55001 §5.1 top-management leadership responsibilities and identify the evidence the assessor expects for each.
- Identify the four most common AM policy failures and explain how each maps to a §5.2 requirement.
- Distinguish the AM policy (§5.2) from the SAMP (§6.2.1) — what is each, who sets each, how do they cascade?
- Explain what makes a policy "appropriate to the purpose of the organization" (§5.2a) versus a slogan.
- Describe the assessor's traceability test (top-down and bottom-up) for the cascade from organizational objectives to operational work orders.`,
    certification_questions: `See the four enriched questions in the question bank for this lesson (3 MCQ + 1 TF). Topics: §5.2 four requirements; §5.1 leadership evidence; policy alignment after strategic-direction change; SAMP role in the cascade.`,
    summary: `ISO 55001 §5.2 specifies four requirements for the asset management policy: appropriate to the purpose, framework for AM objectives, commitment to applicable requirements, commitment to continual improvement. The policy sits at the apex of the AM document cascade — organizational objectives → policy → SAMP → AM objectives → AMPs → work orders — which the assessor traces top-down and bottom-up. Top management's leadership & commitment (§5.1) is operationalized through nine specific responsibilities, each requiring evidence. The SAMP (§6.2.1) is the bridge document that translates organizational objectives into AM objectives. The four most common policy failures are: slogan, no framework, no commitment to requirements, no continual improvement mechanism. The assessor reads the policy first; the rest of the assessment flows from a correct reading.`,
    key_takeaways: `- ISO 55001 §5.2 four requirements: appropriate, framework, commitment to requirements, commitment to continual improvement — the assessor's first four checklist items.
- Document cascade: org objectives → policy → SAMP → AM objectives → AMPs → work orders; trace top-down and bottom-up.
- §5.1 nine top-management leadership responsibilities; each requires evidence, not assertion.
- The SAMP (§6.2.1) is the most important single artefact; it translates org objectives into AM objectives.
- Alignment is the connecting principle: when the strategy changes, the policy, SAMP, and AM objectives must change with it.
- Four common policy failures: slogan, no framework, no commitment to requirements, no continual improvement mechanism.
- The policy must be current, dated, signed by current top management, and communicated (§5.1e, §7.3).`,
    references: `- ISO 55000:2014 — Asset management — Overview, principles and terminology (asset management definition; principles).
- ISO 55001:2014 — §5.1 leadership & commitment; §5.2 policy; §6.2.1 SAMP; §6.2 AM objectives; §7.3 awareness; §7.5 documented information; §9.3 management review; §10.2/10.3 improvement.
- ISO 55002:2018 — §5.1, §5.2, §6.2.1 interpretive guidance for policy, leadership, and SAMP.
- The IAM, Asset Management — An Anatomy — Strategy & Planning subjects; the policy and SAMP within the Anatomy.
- The IAM, Asset Management Maturity Model — maturity evidence for policy, SAMP, and AM objectives subjects.
- Campbell & Jardine, Maintenance Strategy (2001) — links AM strategy and policy to maintenance decision-making; LCC framework.`,
  },
  knowledgeObject: {
    title: "Asset Management Policy & Strategy — ISO 55001 §5.2",
    domain: "Asset Management Principles & Policy",
    competency: "Asset Management Policy & Strategy",
    topic: "AM policy, SAMP, organizational alignment",
    concept: "am-policy-and-strategy",
    body: {
      definitions: [
        "Asset management policy (ISO 55001 §5.2): the top-level statement of intent and direction for asset management, set by top management; must meet the four §5.2 requirements.",
        "Strategic Asset Management Plan (SAMP): documented information that specifies how organizational objectives are converted into AM objectives, the approach for developing AMPs, and the role of the AMS in achieving AM objectives (ISO 55002 §6.2.1).",
        "Asset management objectives (ISO 55001 §6.2): specific, measurable AM results to be achieved; consistent with the policy; SMART.",
        "Asset management plans (AMPs): tactical documented information per asset class, linked to AM objectives.",
        "Top management (ISO 55001 §5.1): the person or group directing and controlling the organization at the highest level; accountable for the AMS.",
        "Continual improvement (ISO 55001 §10.3): the recurring process of enhancing the AMS to achieve AM objectives.",
      ],
      principles: [
        "§5.2 four requirements: (a) appropriate to the purpose; (b) framework for AM objectives; (c) commitment to applicable requirements; (d) commitment to continual improvement.",
        "§5.1 nine top-management leadership responsibilities — each requires evidence, not assertion.",
        "Alignment: when the org strategy changes, the policy, SAMP, and AM objectives must change with it.",
        "Cascade integrity: organizational objectives → policy → SAMP → AM objectives → AMPs → work orders; trace top-down and bottom-up.",
        "The policy is the apex; the SAMP is the bridge; the AMPs are tactical; the work orders are operational.",
      ],
      components: [
        "AM policy document (§5.2) — text meeting the four requirements, signed, dated",
        "SAMP (§6.2.1) — current, reviewed, translating org objectives into AM objectives",
        "AM objectives (§6.2) — SMART, mapped to the policy framework",
        "AMPs (per asset class) — tactical, linked to AM objectives",
        "Strategic plan — source of organizational objectives, dated, current",
        "Traceability matrix — org objectives ↔ AM objectives ↔ AMPs",
        "Communication record (§5.1e, §7.3)",
        "Management review record (§9.3)",
        "Improvement register (§10.2, §10.3)",
        "Interested-party register (§4.2)",
      ],
      mechanism:
        "Strategic plan → AM policy (§5.2, top management) → SAMP (§6.2.1, translating org objectives into AM objectives) → AM objectives (§6.2, SMART) → AMPs (tactical) → operational work orders. The §9.3 management review (annual) takes policy + SAMP + AM objectives + AMPs + KPIs + audit findings as inputs and produces decisions/actions as outputs. The §10 improvement process (§10.2 corrective, §10.3 continual) closes the PDCA loop. The assessor traces the cascade top-down (does the policy flow to AMPs and work orders?) and bottom-up (do the work orders support the AMPs which support the AM objectives which support the policy and the strategy?).",
      process: [
        "Establish organizational objectives (strategic plan, dated).",
        "Identify interested parties (§4.2).",
        "Define AMS scope (§4.3).",
        "Draft the AM policy with the four §5.2 requirements.",
        "Approve the policy with top-management signature; date and version it.",
        "Communicate the policy (§5.1e, §7.3) — publish, brief, train.",
        "Develop the SAMP (§6.2.1) — translate org objectives into AM objectives; document approach for AMPs, risk, lifecycle, measures of success.",
        "Set SMART AM objectives (§6.2).",
        "Develop AMPs (tactical) per asset class — linked to AM objectives.",
        "Cascade to operational work orders.",
        "Hold §9.3 management review annually.",
        "Improve (§10) — corrective + continual.",
        "Review the policy at least annually and on any strategic-direction change.",
      ],
      formulas: [
        "§5.2 four requirements: appropriate + framework + commitment to requirements + commitment to continual improvement (all four must be met).",
        "§5.1 nine top-management leadership responsibilities (a-i); each scored evidence-met / evidence-partial / evidence-missing.",
        "Document cascade depth: 5 levels (org objectives → policy → SAMP → AM objectives → AMPs → work orders).",
        "Cascade integrity = (Σ levels with bidirectional traceability) / 5.",
        "Policy freshness: age = today − last_review_date; acceptable ≤ 12 months; finding > 24 months or unreviewed since change of top management.",
        "Assessor's policy scoring rubric: 4 (all met, full traceability, <12 months) / 3 (mostly met, <24 months) / 2 (partial, >24 months) / 1 (slogan, no traceability).",
      ],
      metrics: [
        "Policy age (months since last review)",
        "§5.1 nine-responsibility evidence score (0-9 met)",
        "§5.2 four-requirement conformance (0-4 met)",
        "Cascade integrity (0-5 levels with bidirectional traceability)",
        "AM objectives SMART-ness (% of AM objectives meeting all five SMART criteria)",
        "SAMP currency (months since last SAMP review)",
        "Management review annual cycle adherence (yes/no)",
      ],
      examples: [
        "Water utility draft AM policy aligned to §5.2; assessor verifies all four requirements met procedurally and evidenced.",
        "Refinery AM policy integrated with Process Safety Management and turnaround programme; verified through §5.1 integration evidence.",
        "Synthetic case 'GasCo' policy failures: slogan, no framework, no requirements, no continual improvement mechanism; six major findings raised.",
      ],
      industrial_examples: [
        "Oil & Gas — refinery AM policy with process-safety, on-stream-availability, environmental, and continual-improvement commitments; integrated with PSM, turnaround, RBI.",
        "Utilities — water utility AM policy with public-health, Drinking Water Standards, regulator service levels, whole-life-cost, environmental, continual-improvement commitments; integrated with the LCC renewal programme and the §9.3 management review.",
      ],
      case_studies: [
        "SYNTHETIC — 'GasCo' regional gas-distribution utility: 4-year-old slogan policy under new CEO with changed strategic direction; assessor raises 6 major findings against §5.2 and §5.1; corrective action: redraft policy, institutionalize §9.3 management review, align with new strategic direction, communicate (§5.1e, §7.3).",
      ],
      common_errors: [
        "Writing the AM policy as a slogan — the most common §5.2 finding.",
        "Failing to provide a framework for AM objectives (§5.2b).",
        "Omitting regulatory, statutory, customer, and stakeholder requirements (§5.2c).",
        "Naming continual improvement without institutionalizing §9.3 and §10.",
        "Letting the policy go stale — a 5-year-old policy under a new CEO is a §5.2 and §5.1b finding.",
        "Confusing the policy with the SAMP — they are different documents.",
        "Treating the AMPs as rebadged maintenance plans — they must be linked to AM objectives.",
        "Accepting assertion ('the CEO supports asset management') for §5.1 evidence.",
        "Outsourcing policy drafting to a consultant without top-management engagement.",
      ],
      limitations: [
        "§5.2 specifies what the policy must contain but not its length, structure, or style; ISO 55002 §5.2 provides guidance.",
        "Meeting all four §5.2 requirements does not guarantee behaviour change if §5.1e communication and §5.1c integration are weak.",
        "The §5.1 nine-responsibility list is exhaustive but evidence is organization-specific.",
        "The SAMP (§6.2.1) content is specified by ISO 55002 interpretive guidance, not by ISO 55001 requirements; maturity varies.",
        "Joint ventures, regulated subsidiaries, and outsourced operations complicate cascade traceability.",
        "Findings against §5.2 and §5.1 are qualitative; the rubrics are checklists, not numerical scores.",
      ],
      best_practices: [
        "Draft the AM policy with the four §5.2 requirements explicit and the asset base grounded in the purpose.",
        "Name the specific regulatory, statutory, customer, and stakeholder requirements (§5.2c).",
        "Institutionalize the §9.3 management review and the §10 improvement process to support the §5.2(d) commitment.",
        "Review the policy at least annually and on any strategic-direction change or change of top management.",
        "Build a traceability matrix (org objectives ↔ AM objectives ↔ AMPs) and verify top-down and bottom-up.",
        "Communicate the policy (§5.1e, §7.3) — publish, brief, train; retain evidence.",
        "Use AM-competent auditors (§9.2c) for the internal audit of the policy and SAMP.",
        "Hold the §9.3 management review with the policy as an input and changes as an output.",
      ],
      related_concepts: [
        "ISO 55001 §5.1 leadership & commitment",
        "ISO 55001 §6.2.1 SAMP",
        "ISO 55001 §6.2 AM objectives",
        "ISO 55001 §7.5 documented information",
        "ISO 55001 §9.3 management review",
        "ISO 55001 §10.2/10.3 improvement",
        "IAM Anatomy — Strategy & Planning subjects",
        "Strategic planning — vision, mission, objectives, KPI cascades",
      ],
      prerequisites: [
        "Asset Management Principles lesson (ISO 55000 principles, lifecycle, definition).",
        "ISO management-systems family (9001, 14001, 45001) policy/plan/objective cascade pattern.",
        "Strategic planning basics — vision, mission, strategic objectives.",
      ],
      references: [
        "ISO 55000:2014 — Asset management — Overview, principles and terminology",
        "ISO 55001:2014 — Asset management — Management systems — Requirements",
        "ISO 55002:2018 — Asset management — Guidelines for the application of ISO 55001",
        "The IAM — Asset Management — An Anatomy (3rd ed.)",
        "The IAM — Asset Management Maturity Model",
        "Campbell & Jardine — Maintenance Strategy (2001)",
      ],
    },
  },
  questions: [
    {
      competencyName: "Asset Management Policy & Strategy",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      scenario: "Utilities",
      stem: "ISO 55001 §5.2 specifies four requirements that the asset management policy must meet. Which one of the following lists all four requirements correctly?",
      whyCorrect:
        "The four §5.2 requirements are: (a) appropriate to the purpose of the organization; (b) provide a framework for the AM objectives; (c) include a commitment to satisfy applicable requirements; (d) include a commitment to continual improvement. The CAMA assessor checks each of these four against the policy text; failing any one is a §5.2 finding. A policy that reads as a slogan fails (a); a policy with no link to organizational objectives fails (b); a policy that omits regulatory, statutory, customer, and stakeholder requirements fails (c); a policy that names continual improvement without an institutionalized §9.3/§10 mechanism fails (d).",
      whyOthersWrong: [
        "Option B (Plan, Do, Check, Act, Continual improvement, Documented information) confuses the PDCA cycle and supporting requirements with the four §5.2 policy requirements.",
        "Option C (Value, Alignment, Leadership, Assurance) lists the four ISO 55000 principles — these are the principles that frame the policy, not the four §5.2 requirements the policy itself must meet.",
        "Option D (Policy, SAMP, AMP, AM objectives) lists the four AM documents in the cascade — these are downstream artefacts of the policy, not the four §5.2 requirements.",
      ],
      explanation:
        "§5.2 four requirements: (a) appropriate to the purpose of the organization; (b) provide a framework for the AM objectives; (c) commit to satisfy applicable requirements; (d) commit to continual improvement. PDCA, the ISO 55000 principles, and the AM document cascade are all related but distinct.",
      options: [
        {
          text: "Appropriate to the purpose; framework for AM objectives; commitment to satisfy applicable requirements; commitment to continual improvement",
          isCorrect: true,
        },
        {
          text: "Plan, Do, Check, Act; continual improvement; documented information",
          isCorrect: false,
        },
        {
          text: "Value, alignment, leadership, assurance",
          isCorrect: false,
        },
        {
          text: "Policy, SAMP, AMP, AM objectives",
          isCorrect: false,
        },
      ],
    },
    {
      competencyName: "Asset Management Policy & Strategy",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Procedural",
      scenario: "Oil & Gas",
      stem: "A refinery's AM policy reads: 'RefineryCo will manage its assets safely, reliably, and at lowest cost.' The CEO has been in post 7 months and has announced a new strategic direction with three net-zero commitments and a new regulator-imposed service-level target. The policy was last reviewed 4 years ago under the previous CEO. As CAMA assessor, which set of findings best characterizes the situation against ISO 55001?",
      whyCorrect:
        "The policy fails three of the four §5.2 requirements: (a) appropriate to the purpose — the policy is a slogan ('safely, reliably, at lowest cost') with no grounding in the refinery's purpose or asset base; (b) framework for AM objectives — no value dimensions named, no link to organizational objectives; (c) commitment to applicable requirements — no statutory, regulatory, customer, or stakeholder requirements named. The §5.2(d) commitment to continual improvement is named but not institutionalized (no §9.3 management review held in 4 years). The §5.1(b) compatibility with strategic direction is also failed — the new CEO's net-zero strategy and the new service-level target are not reflected in the policy. The corrective action: redraft the policy with the four §5.2 requirements explicit, align with the new strategic direction, and institutionalize the §9.3 management review.",
      whyOthersWrong: [
        "Option A (policy is compliant; only the SAMP needs updating) — wrong; the policy fails three of four §5.2 requirements and §5.1(b). The SAMP update alone would not close the §5.2 findings.",
        "Option C (policy compliant; the new CEO should re-sign the existing policy) — wrong; re-signing a slogan does not meet §5.2(a) (appropriate to the purpose) or §5.2(c) (commitment to applicable requirements) or §5.1(b) (compatibility with the new strategic direction).",
        "Option D (only §5.2(d) continual improvement is failed; the other three requirements are met) — wrong; the policy fails at least (a), (b), and (c) in addition to (d). The slogan text and the absence of any requirements/framework content are §5.2(a), (b), (c) findings, not just (d).",
      ],
      explanation:
        "A 4-year-old slogan policy under a new CEO with a changed strategic direction fails §5.2(a), (b), (c), and (d) (continual improvement named but not institutionalized) and §5.1(b) (compatibility with strategic direction). Corrective action: redraft with the four §5.2 requirements explicit, align with the new strategy, and institutionalize the §9.3 management review.",
      options: [
        {
          text: "§5.2(a)(b)(c) failed; §5.2(d) named but not institutionalized; §5.1(b) failed — redraft policy, align with new strategy, institute §9.3",
          isCorrect: true,
        },
        {
          text: "Policy compliant; only the SAMP needs updating",
          isCorrect: false,
        },
        {
          text: "Policy compliant; the new CEO should re-sign the existing policy",
          isCorrect: false,
        },
        {
          text: "Only §5.2(d) continual improvement is failed; the other three requirements are met",
          isCorrect: false,
        },
      ],
    },
    {
      competencyName: "Asset Management Policy & Strategy",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Utilities",
      stem: "Which one of the following correctly describes the role of the Strategic Asset Management Plan (SAMP) in the ISO 55001 document cascade?",
      whyCorrect:
        "The SAMP (ISO 55001 §6.2.1, ISO 55002 §6.2.1) is the bridge document that translates organizational objectives into AM objectives, documents the approach for developing AMPs, clarifies the role of the AMS in achieving AM objectives, and links the AM policy (apex) to the AM objectives (§6.2) and the AMPs (tactical). The cascade is: organizational objectives → AM policy (§5.2) → SAMP (§6.2.1) → AM objectives (§6.2) → AMPs (tactical) → operational work orders. The SAMP is not the policy itself (the policy is the apex statement); it is not the AMP (the AMP is tactical, per asset class); and it is not a one-off project plan. The SAMP is reviewed under §9.3 management review and updated when organizational objectives change.",
      whyOthersWrong: [
        "Option A (the SAMP is the apex policy document, signed by top management) — wrong; the AM policy (§5.2) is the apex; the SAMP sits below the policy and translates org objectives into AM objectives.",
        "Option C (the SAMP is the tactical plan per asset class, equivalent to an AMP) — wrong; the AMP is the tactical plan per asset class; the SAMP is the strategic-level bridge document. Conflating SAMP and AMP is a common assessor-found error.",
        "Option D (the SAMP is a one-off project plan for AMS implementation, not maintained after go-live) — wrong; the SAMP is a maintained, reviewed document under §9.3 management review; treating it as a one-off is one of the most common maturity-limiting errors.",
      ],
      explanation:
        "SAMP = the bridge document (ISO 55001 §6.2.1) translating organizational objectives into AM objectives, documenting the AMP-development approach, and clarifying the role of the AMS. Cascade: org objectives → policy (§5.2) → SAMP (§6.2.1) → AM objectives (§6.2) → AMPs → work orders. SAMP is maintained, not a one-off; it sits below the policy (apex) and above the AM objectives and AMPs.",
      options: [
        {
          text: "The SAMP translates organizational objectives into AM objectives, documents the AMP-development approach, and clarifies the role of the AMS — it is the bridge between the policy (apex) and the AM objectives/AMPs",
          isCorrect: true,
        },
        {
          text: "The SAMP is the apex policy document, signed by top management",
          isCorrect: false,
        },
        {
          text: "The SAMP is the tactical plan per asset class, equivalent to an AMP",
          isCorrect: false,
        },
        {
          text: "The SAMP is a one-off project plan for AMS implementation, not maintained after go-live",
          isCorrect: false,
        },
      ],
    },
    {
      competencyName: "Asset Management Policy & Strategy",
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: ISO 55001 §5.1 leadership & commitment requires top management to demonstrate nine specific responsibilities, and the CAMA assessor must verify each with evidence rather than accept assertion that 'the CEO supports asset management.'",
      whyCorrect:
        "True. ISO 55001 §5.1 lists nine specific top-management leadership & commitment responsibilities: (a) ensure the AMS is established, implemented, maintained, improved; (b) ensure the AM policy and AM objectives are compatible with the strategic direction; (c) ensure the integration of AM requirements into business processes; (d) ensure resources are available; (e) communicate the importance of effective AM; (f) ensure the AMS achieves its intended outcomes; (g) direct and support persons to contribute; (h) promote continual improvement; (i) support other relevant management roles. The CAMA assessor scores each as evidence-met, evidence-partial, or evidence-missing — assertion alone ('the CEO supports asset management') is insufficient and is one of the most common §5.1 findings the assessor raises.",
      whyOthersWrong: [
        "False — the candidate would misread §5.1 as a generic 'leadership commitment' rather than the nine specific, evidence-required responsibilities. The assessor's §5.1 evidence requests are specific: the AM policy is signed, the SAMP is current, the internal audit programme is active, the management review has been held, the AM budget is committed, the asset register is maintained, the policy is published and briefed, the KPIs are reported to top management, the AM manager has authority and access to the CFO. Each is evidence for one or more of the nine responsibilities.",
      ],
      explanation:
        "True. ISO 55001 §5.1 lists nine specific top-management leadership responsibilities (a-i); the CAMA assessor scores each with evidence, not assertion. Assertion that 'the CEO supports asset management' is insufficient and is a common §5.1 finding.",
      options: [
        { text: "True", isCorrect: true },
        { text: "False", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Asset Management Objectives & SAMP
// (Competency: "Asset Management Objectives & SAMP"; slug: cama-objectives-and-samp)
// ---------------------------------------------------------------------------

const LESSON_AM_OBJECTIVES: RefLesson = {
  competencyName: "Asset Management Objectives & SAMP",
  slug: "cama-objectives-and-samp",
  title: "Asset Management Objectives & SAMP",
  titleAr: "أهداف إدارة الأصول وخطة إدارة الأصول الاستراتيجية",
  order: 3,
  durationMin: 35,
  references: AMP_REFERENCE_TITLES,
  conceptIntroduction: `ISO 55001 §6.2 requires the organization to establish AM objectives that are (a) consistent with the AM policy, (b) measurable (achievable through the AM plan and the AMS), (c) take into account applicable requirements, and (d) monitored and communicated. The §6.2.1 SAMP is the document that specifies how organizational objectives are converted into AM objectives and how AMPs will be developed to achieve them. The §6.2.2 AMPs are the tactical documented information that operationalize the AM objectives per asset class. The cascade — organizational objectives → AM policy → SAMP → AM objectives → AMPs → work orders — is the spine of the AMS, and §6.2 is where the cascade becomes operational.

The SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound) are the practical lens the assessor applies. A non-SMART AM objective ("improve asset reliability") fails §6.2(b) "measurable." A SMART AM objective ("reduce fleet pump MTBF failures from 12.4 to 8.0 by FY25-Q4, with quarterly reporting and root-cause investigation of all high-criticality failures") meets §6.2(b) and links to the SAMP's approach for AMPs (§6.2.1) and the AMP's tactical activities (§6.2.2). SMART-ness is not a bureaucratic nicety — it is the difference between an objective that drives behaviour and one that hangs on a wall.

Cascading objectives is the operational core. The organizational objective ("reduce total cost of ownership by 5% over 5 years") cascades to the AM objective ("reduce LCC of fleet renewal by €8M PV over 5 years") which cascades to the AMP-level objective ("renew 120 pumps as PVC-lined equivalent by FY26, saving €1.4M PV per year") which cascades to the work-order-level objective ("replace pump P-3014 with PVC-lined equivalent, scheduled Q3-FY24, budget €45k"). The assessor traces this cascade top-down (does the work order support the AMP which supports the AM objective which supports the policy and the strategy?) and bottom-up (do the work orders add up to the AMP-level objective, do the AMPs add up to the AM objective, do the AM objectives add up to the organizational objective?). A break anywhere is a §6.2 finding.`,
  example: `A water utility's (CASE_TYPE = SYNTHETIC) organizational objective: "Reduce total cost of ownership of the distribution network by 5% in PV terms over 5 years (FY24-FY28), while maintaining SAIDI ≤ 240 min/year and water-quality compliance ≥ 99.5%." This cascades to:

AM objective 1 (SAMP-level, fleet renewal): "Renew 1,200 km of comparable distribution mains as PVC rather than ductile-iron over FY24-FY28, saving €48,692/km × 1,200 km = €58.4M PV vs. the DI baseline, with annual reporting of km renewed and PV saved." [SMART: Specific — renew 1,200 km as PVC; Measurable — €58.4M PV saved and km renewed reported annually; Achievable — the LCC analysis (see Asset Management Principles lesson) supports €58.4M PV; Relevant — links directly to the TCO-5% objective; Time-bound — FY24-FY28.]

AM objective 2 (SAMP-level, maintenance optimization): "Reduce reactive-maintenance work-order volume by 30% (from 4,800/year to 3,360/year) over FY24-FY28 through PM-optimization (RCM) on the top-100 criticality-A assets, with quarterly reporting and root-cause investigation of all repeat failures."

AM objective 3 (SAMP-level, asset health): "Raise the fleet health-index of distribution mains from 0.71 to 0.80 by FY28 through the renewal programme + condition-based rehabilitation of the next-200 km of degraded mains; report the health-index distribution annually."

AMP-level objective (distribution mains, FY24): "Renew 240 km of comparable mains as PVC (20% of the 5-year target); achieve a 0.5-point reduction in burst frequency on renewed mains; close the FY24 budget of €12.5M with cost variance ≤ 5%; report quarterly."

Work-order-level objective (sample): "Replace main segment M-2304 (River Road, DN300, 1.2 km) with PVC equivalent, scheduled Q3-FY24, budget €114k (€95k/km), reducing annual maintenance cost by €1,320 (€1,100/km) and annual operational energy cost by €180 (€150/km); contributes to AM objective 1 and the organizational TCO-5% objective."

Assessor's cascade trace: organizational objective (TCO -5% PV over 5 years) ← AM objective 1 (€58.4M PV saved via 1,200 km PVC renewal) + AM objective 2 (€X via maintenance optimization) + AM objective 3 (€Y via health-index rehabilitation). Bottom-up: AM objective 1 ← 5 annual AMP-level objectives (€12.5M FY24 + €12.5M FY25 + ... ) ← work orders (€114k × N). The cascade integrity is verified; SMART-ness is verified; the assessor's §6.2 finding is that the AM objectives meet §6.2(a)(b)(c)(d).`,
  keyFormulas: `ISO 55001 §6.2 — four requirements for AM objectives:
  (a) consistent with the AM policy;
  (b) measurable (to be achieved through the AM plan and the AMS);
  (c) take into account applicable requirements;
  (d) monitored and communicated.

ISO 55001 §6.2.1 SAMP — content (per ISO 55002 §6.2.1):
  - how organizational objectives are converted into AM objectives;
  - the approach for developing AMPs;
  - the role of the AMS in achieving AM objectives;
  - the approach for managing asset risks (linked to §6.1);
  - the approach for managing asset lifecycle activities;
  - the AM measures of success (linked to §9.1).

ISO 55001 §6.2.2 AMPs — content:
  - the activities, resources, and timescales to achieve the AM objectives;
  - per asset class, system, or location.

SMART criteria:
  - Specific — clear, unambiguous, well-defined.
  - Measurable — quantifiable, with baseline and target.
  - Achievable — feasible with available resources.
  - Relevant — links to organizational objectives.
  - Time-bound — has a deadline.

Cascade:
  Organizational objectives → AM policy (§5.2) → SAMP (§6.2.1) → AM objectives (§6.2) → AMPs (§6.2.2) → operational work orders.

Cascade integrity (per level):
  I_level = (objectives at level N that have a documented parent at level N-1 AND documented children at level N+1) / (total objectives at level N)

Cascade integrity (overall):
  I = (Σ_level I_level × w_level) / Σ w_level; target I ≥ 0.95.

Cascade quantitative additivity (bottom-up):
  Σ AM objectives ≈ organizational objective (within tolerance Δ);
  Σ AMP-level objectives ≈ AM objective (within tolerance Δ);
  Σ work-order-level objectives ≈ AMP-level objective (within tolerance Δ).`,
  exercise: `You are the CAMA assessor reviewing a regional transmission utility's AM objectives. The utility has set the following: "Improve fleet reliability." (a) Identify which §6.2 requirements this objective fails. (b) Rewrite the objective SMART, with a baseline, a target, a time-bound, and a reporting cadence. (c) The utility's organizational objective is "achieve top-quartile reliability among peer utilities by FY28." Construct a cascade: organizational objective → AM objective (SAMP-level) → AMP-level objective (transmission lines FY25) → work-order-level objective (sample line renewal). Quantify the cascade bottom-up and verify additivity within a 5% tolerance. (d) Identify the §9.1 KPIs the assessor would expect to see monitored and reported.`,
  sections: {
    learning_objectives: `- State the four ISO 55001 §6.2 requirements for AM objectives and explain how the assessor verifies each.
- Describe the SAMP content (§6.2.1, ISO 55002 §6.2.1) — six required elements.
- Apply the SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound) to AM objectives and rewrite non-SMART objectives.
- Construct a cascade of objectives from organizational strategy through AM objectives to AMPs to work orders; quantify bottom-up additivity.
- Compute cascade integrity (per-level and overall) and the bottom-up additivity tolerance.
- Detect the common §6.2 failures (non-SMART, no cascade, no monitoring, no SAMP) and recommend corrective action.`,
    prerequisites: `- Asset Management Principles lesson (ISO 55000 principles, lifecycle, LCC).
- Asset Management Policy & Strategy lesson (§5.2 four requirements, §5.1 leadership, document cascade apex).
- Strategic planning basics — vision, mission, objectives, KPI cascades.
- SMART criteria and KPI design fundamentals.`,
    introduction: `ISO 55001 §6.2 is where the AM system becomes operational. The clause requires the organization to establish AM objectives that are (a) consistent with the AM policy, (b) measurable, (c) take into account applicable requirements, and (d) monitored and communicated. The §6.2.1 SAMP is the document that translates organizational objectives into AM objectives and specifies the approach for AMPs, asset risk, lifecycle activities, and measures of success. The §6.2.2 AMPs are the tactical documented information per asset class that operationalize the AM objectives. The cascade from organizational strategy through the AM policy, SAMP, AM objectives, AMPs, and work orders is the spine of the AMS; §6.2 is where it becomes operational.

SMART is the practical lens. The five SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound) are not bureaucratic — they are the difference between an objective that drives behaviour and one that hangs on a wall. "Improve asset reliability" is not SMART (no baseline, no target, no time-bound, no measurement); it fails §6.2(b) "measurable." "Reduce fleet pump MTBF-failure rate from 12.4 to 8.0 per year by FY25-Q4, with quarterly reporting and RCA on all high-criticality failures" is SMART and meets §6.2(a)(b)(c)(d). The assessor rewrites non-SMART objectives during the assessment — not to coach the organization, but to demonstrate the §6.2 finding.

Cascading is the operational core. The organizational objective (TCO -5% PV over 5 years) cascades to the AM objective (renew 1,200 km of mains as PVC, saving €58.4M PV) which cascades to the AMP-level objective (renew 240 km in FY24, budget €12.5M) which cascades to the work-order-level objective (replace main M-2304 with PVC, budget €114k, Q3-FY24). The assessor traces this cascade top-down (does the work order support the AMP which supports the AM objective which supports the policy and the strategy?) and bottom-up (do the work orders add up to the AMP-level objective, do the AMPs add up to the AM objective, do the AM objectives add up to the organizational objective?). A break anywhere is a §6.2 finding.

The SAMP (§6.2.1) is the most important single AM document after the policy. ISO 55002 §6.2.1 specifies six content elements: how organizational objectives are converted into AM objectives; the approach for developing AMPs; the role of the AMS in achieving AM objectives; the approach for managing asset risks (linked to §6.1); the approach for managing asset lifecycle activities; the AM measures of success (linked to §9.1). The assessor verifies each element is present, current, and integrated with the rest of the AMS. The SAMP is not a one-off — it is maintained, reviewed under §9.3 management review, and updated when organizational objectives change.

The AMPs (§6.2.2) are the tactical operationalization of the AM objectives per asset class, system, or location. An AMP specifies the activities (what will be done), the resources (who and what), and the timescales (when). The assessor verifies that each AM objective has at least one supporting AMP, that the AMP's activities are linked to the AM objective, and that the AMP's resources and timescales are realistic and committed.

Monitoring and communication (§6.2(d)) close the loop. The assessor verifies that each AM objective has a documented monitoring cadence (monthly/quarterly/annual), a defined KPI (linked to §9.1), and a communication plan (to top management, to the AM team, to the operational teams, and to interested parties as appropriate). An objective that is set but not monitored fails §6.2(d) and, in practice, fails to drive behaviour.`,
    terminology: `- **Asset management objectives (ISO 55001 §6.2)**: specific, measurable AM results to be achieved; consistent with the policy; take applicable requirements into account; monitored and communicated.
- **Strategic Asset Management Plan (SAMP, ISO 55001 §6.2.1)**: documented information specifying how organizational objectives are converted into AM objectives, the approach for developing AMPs, the role of the AMS, the approach for asset risks, lifecycle activities, and measures of success.
- **Asset management plans (AMPs, ISO 55001 §6.2.2)**: tactical documented information specifying activities, resources, and timescales to achieve the AM objectives, per asset class.
- **SMART**: Specific, Measurable, Achievable, Relevant, Time-bound — the practical criteria for AM objective quality.
- **Cascade**: the chain organizational objectives → AM policy → SAMP → AM objectives → AMPs → work orders.
- **Cascade integrity**: the fraction of objectives at a level that have both a parent at the level above and children at the level below.
- **Bottom-up additivity**: Σ objectives at level N+1 ≈ objective at level N (within tolerance).
- **KPI (Key Performance Indicator, ISO 55001 §9.1)**: the measurable quantity by which an AM objective is monitored.
- **Monitoring cadence**: the frequency (monthly/quarterly/annual) at which an AM objective's KPI is reported.
- **Management review (ISO 55001 §9.3)**: top-management review; AM objectives' status is a review input; changes to AM objectives may be a review output.`,
    detailed_explanation: `ISO 55001 §6.2's four requirements are not optional. (a) Consistent with the AM policy: each AM objective must trace to a value dimension named in the policy (§5.2b framework). An objective that does not trace is a §6.2(a) finding. (b) Measurable: each AM objective must have a quantifiable KPI, a baseline, and a target. "Improve reliability" fails §6.2(b); "reduce fleet MTBF-failure rate from 12.4 to 8.0 by FY25-Q4" meets it. (c) Take applicable requirements into account: each AM objective must reflect the applicable statutory, regulatory, customer, and stakeholder requirements (linked to §4.2 interested parties). An AM objective that conflicts with a regulatory requirement is a §6.2(c) finding. (d) Monitored and communicated: each AM objective must have a documented monitoring cadence, a defined KPI, and a communication plan. An objective set but not monitored fails §6.2(d) and, in practice, fails to drive behaviour.

The SAMP (§6.2.1) is the most important single AM document after the policy. ISO 55002 §6.2.1 specifies six content elements: (i) how organizational objectives are converted into AM objectives — the traceability logic; (ii) the approach for developing AMPs — the methodology for going from AM objective to AMP; (iii) the role of the AMS in achieving AM objectives — how the AMS (§4-10) supports the AM objectives; (iv) the approach for managing asset risks (linked to §6.1) — the risk methodology and how it cascades; (v) the approach for managing asset lifecycle activities (creation, utilization, maintenance, renewal, disposal) — how the lifecycle is planned and integrated; (vi) the AM measures of success (linked to §9.1) — the KPIs by which AM objective achievement is monitored. The assessor verifies each element is present, current, and integrated with the rest of the AMS. A SAMP missing element (iv) (risk approach) is a §6.2.1 finding; a SAMP with element (iv) but no link to §6.1 is also a finding.

The AMPs (§6.2.2) are the tactical operationalization. An AMP per asset class (or system, or location) specifies the activities (what will be done), the resources (who and what), and the timescales (when). The assessor verifies: (i) each AM objective has at least one supporting AMP; (ii) the AMP's activities are linked to the AM objective (traceability); (iii) the AMP's resources are realistic and committed (§7.1 resources); (iv) the AMP's timescales are consistent with the AM objective's time-bound; (v) the AMP is reviewed and updated (§9.3 management review).

Cascading is the operational core. The cascade from organizational strategy through the AM policy, SAMP, AM objectives, AMPs, and work orders is the spine of the AMS. The assessor traces the cascade top-down (does the policy flow to the SAMP, the SAMP to the AM objectives, the AM objectives to the AMPs, the AMPs to the work orders?) and bottom-up (do the work orders add up to the AMP-level objective, do the AMPs add up to the AM objective, do the AM objectives add up to the organizational objective?). The cascade integrity I_level (per level) and the bottom-up additivity are the assessor's quantitative measures. A cascade integrity below 0.95 (95% of objectives at a level with both parent and children) is a §6.2 finding; a bottom-up additivity outside a 5% tolerance is a §6.2 finding.

The SMART criteria are the practical quality lens. Specific (clear, unambiguous, well-defined) — the assessor asks "could two people read this objective and know what to do?" Measurable (quantifiable, with baseline and target) — the assessor asks "what KPI is reported, and what is the baseline and target?" Achievable (feasible with available resources) — the assessor asks "is the budget committed, the team staffed, the tool licensed, the timeline realistic?" Relevant (links to organizational objectives) — the assessor asks "does this objective trace to a value dimension in the policy and to an organizational objective?" Time-bound (has a deadline) — the assessor asks "by when will this objective be achieved, and what is the reporting cadence?" An AM objective that fails any one SMART criterion is a §6.2(b) "measurable" finding.

Monitoring and communication close the loop. The §9.1 KPIs are the measurable quantities by which AM objectives are monitored. The assessor verifies: (i) each AM objective has a defined KPI; (ii) the KPI is reported on a documented cadence (monthly/quarterly/annual); (iii) the KPI is reported to top management (§5.1(f)); (iv) the KPI is communicated to the AM team and the operational teams (§7.3 awareness); (v) the KPI is reviewed at the §9.3 management review; (vi) when a KPI is off-target, a §10.2 corrective action is taken. The §6.2(d) "monitored and communicated" requirement is the bridge between §6.2 (planning) and §9 (performance evaluation).`,
    core_principles: `- AM objectives must meet all four §6.2 requirements: consistent with the policy, measurable, take applicable requirements into account, monitored and communicated.
- SMART (Specific, Measurable, Achievable, Relevant, Time-bound) is the practical quality lens; failing any one is a §6.2(b) finding.
- The SAMP (§6.2.1) is the most important single AM document after the policy; six required content elements.
- The AMPs (§6.2.2) are the tactical operationalization per asset class — activities, resources, timescales.
- The cascade organizational objectives → policy → SAMP → AM objectives → AMPs → work orders is the spine of the AMS.
- The assessor traces the cascade top-down and bottom-up; a break anywhere is a §6.2 finding.
- Cascade integrity I ≥ 0.95 and bottom-up additivity within 5% tolerance are the assessor's quantitative measures.
- Monitoring and communication (§6.2(d)) close the loop through §9.1 KPIs and §9.3 management review.`,
    components: `- Organizational objectives (strategic plan, dated, current).
- AM policy (§5.2) — the apex statement.
- SAMP (§6.2.1) — the bridge document with six content elements.
- AM objectives (§6.2) — SMART, mapped to the policy framework.
- AMPs (§6.2.2) — tactical, per asset class, with activities/resources/timescales.
- Operational work orders — daily/weekly activities.
- Traceability matrix — organizational objectives ↔ AM objectives ↔ AMPs ↔ work orders.
- KPI dashboard (§9.1) — monitoring and measurement.
- Monitoring cadence register — the frequency for each AM objective's KPI.
- Communication plan — to top management, AM team, operational teams, interested parties.
- Management review record (§9.3) — AM objectives' status as input; changes as output.
- Improvement register (§10.2, §10.3) — corrective actions when KPIs are off-target.`,
    process: `1. Establish the organizational objectives (strategic plan, dated).
2. Confirm the AM policy (§5.2) names the value dimensions (framework for AM objectives).
3. Develop the SAMP (§6.2.1) with all six content elements: traceability logic, AMP-development approach, role of the AMS, risk approach, lifecycle approach, measures of success.
4. Set AM objectives (§6.2) — SMART, consistent with the policy, applicable requirements taken into account.
5. Map each AM objective to a KPI (§9.1) with baseline, target, and monitoring cadence.
6. Develop AMPs (§6.2.2) per asset class — activities, resources, timescales — linked to AM objectives.
7. Cascade to operational work orders — linked to AMPs.
8. Build the traceability matrix (organizational objectives ↔ AM objectives ↔ AMPs ↔ work orders).
9. Verify cascade integrity I ≥ 0.95 and bottom-up additivity within 5% tolerance.
10. Communicate AM objectives and KPIs (§6.2(d), §7.3 awareness) to top management, AM team, operational teams.
11. Monitor KPIs on cadence; report to top management; review at §9.3.
12. Take §10.2 corrective action when KPIs are off-target; take §10.3 continual improvement when opportunities arise.`,
    formula_calculation: `Variables and formulas:
- N_obj(level): number of AM objectives at level N (org objectives, AM objectives, AMP-level, work-order-level).
- I_level: cascade integrity at level N = (objectives at N with documented parent at N-1 AND documented children at N+1) / (total at N).
- I: overall cascade integrity = (Σ_level I_level × w_level) / Σ w_level; target I ≥ 0.95.
- A_bottom-up: bottom-up additivity = Σ (children) at level N+1 / (parent at level N); target A in [0.95, 1.05] (within ±5% tolerance).
- SMART-ness score S = (Σ SMART criteria met) / 5; target S = 1.00 (all five); finding if S < 1.00.

§6.2 AM objective quality (4 requirements):
  (a) consistent with the policy — yes/no;
  (b) measurable — yes/no;
  (c) applicable requirements taken into account — yes/no;
  (d) monitored and communicated — yes/no.
  §6.2 finding if any requirement is "no".

SAMP content (6 elements, ISO 55002 §6.2.1):
  (i) org-to-AM-objective conversion; (ii) AMP-development approach; (iii) role of the AMS;
  (iv) asset risk approach (linked to §6.1); (v) lifecycle approach; (vi) measures of success (linked to §9.1).
  §6.2.1 finding if any element is absent or unlinked.

Example cascade (water utility, TCO -5% PV over 5 years):
  Org objective: TCO -5% PV over FY24-FY28 = €80M PV saving (baseline €1,600M).
  AM objective 1: €58.4M PV via 1,200 km PVC renewal (Specific, Measurable: €58.4M and km, Achievable: LCC supports, Relevant: links to TCO, Time-bound: FY24-FY28).
  AM objective 2: €15M PV via maintenance optimization (-30% reactive work orders).
  AM objective 3: €6.6M PV via health-index rehabilitation (+0.09 fleet HI).
  Sum: €58.4M + €15M + €6.6M = €80M PV ≈ org objective (within 0% tolerance).
  AMP-level (FY24): €12.5M via 240 km PVC renewal + €3.0M maintenance + €1.3M HI = €16.8M (FY24 share of 5-year €80M = €16M; within 5% tolerance).
  Work-order-level (sample): €114k for 1.2 km PVC main, contributing to AM objective 1.

Units: PV in currency (€); SMART criteria dimensionless (0..1); cascade integrity dimensionless (0..1).`,
    worked_example: `A water utility's (CASE_TYPE = SYNTHETIC) organizational objective: "Reduce total cost of ownership of the distribution network by 5% in PV terms over 5 years (FY24-FY28), while maintaining SAIDI ≤ 240 min/year and water-quality compliance ≥ 99.5%." Baseline 5-year PV TCO = €1,600M; 5% reduction target = €80M PV saving.

SAMP development (§6.2.1, ISO 55002 §6.2.1) — six elements:
(i) Org-to-AM-objective conversion: the €80M TCO target cascades to three AM objectives (renewal, maintenance optimization, health-index rehabilitation) plus a regulatory-hold AM objective (no SAIDI/water-quality degradation).
(ii) AMP-development approach: per asset class (mains, treatment works, pump stations, reservoirs), an AMP is developed with activities/resources/timescales aligned to the AM objectives.
(iii) Role of the AMS: §4 context sets the scope; §5 leadership commits resources; §6 planning sets the objectives and SAMP; §7 support provides resources/competence/awareness; §8 operation runs the AMPs; §9 performance evaluates KPIs; §10 improvement closes the loop.
(iv) Risk approach (linked to §6.1): a multi-dimensional risk register (safety, environmental, service, financial, regulatory) prioritizes the renewal programme — criticality-A mains renewed first.
(v) Lifecycle approach: creation (procurement specs), utilization (operations), maintenance (RCM-based PM), renewal (LCC-informed material choice), disposal (decommissioning and salvage) — all four stages integrated.
(vi) Measures of success (linked to §9.1): KPIs — TCO PV saved, km renewed, MTBF, SAIDI, water-quality compliance, fleet health-index, nonconformity count.

AM objectives (§6.2):
- AM-1: Renew 1,200 km of comparable mains as PVC over FY24-FY28, saving €58.4M PV (SMART; §6.2(a)(b)(c)(d) met).
- AM-2: Reduce reactive-maintenance work-order volume by 30% (4,800 → 3,360/year) via RCM on top-100 criticality-A assets; €15M PV saving.
- AM-3: Raise fleet health-index from 0.71 to 0.80 by FY28 via renewal + condition-based rehabilitation of next-200 km degraded mains; €6.6M PV saving.
- AM-4 (regulatory hold): Maintain SAIDI ≤ 240 min/year and water-quality compliance ≥ 99.5% throughout the renewal programme.

AMP-level (FY24, distribution mains):
- Renew 240 km as PVC (20% of 5-year target); €12.5M FY24 budget; quarterly reporting.
- Bottom-up additivity: AM-1 (€58.4M) = €12.5M (FY24) + €12.5M (FY25) + €12.5M (FY26) + €12.5M (FY27) + €8.4M (FY28) = €58.4M (within 0% tolerance).
- FY24 across AM-1 + AM-2 + AM-3 = €12.5M + €3.0M + €1.3M = €16.8M vs. €16M FY24 share of €80M 5-year target (within 5% tolerance).

Work-order-level (sample):
- Replace main segment M-2304 (River Road, DN300, 1.2 km) with PVC equivalent; scheduled Q3-FY24; budget €114k (€95k/km × 1.2); reduces annual maintenance by €1,320 (€1,100/km × 1.2) and annual operational energy by €180 (€150/km × 1.2).
- Bottom-up additivity: Σ work-order-level objectives (≈ 200 work orders, €114k average) ≈ €22.8M ≈ AMP-level €12.5M (within tolerance once criticality-A prioritization is applied — not every work order contributes to AM-1; some are AM-2/AM-3/regulatory-hold).

Assessor's §6.2 finding: all four §6.2 requirements met; SAMP (§6.2.1) contains all six content elements and links to §6.1 (risk), §9.1 (KPIs); AMPs (§6.2.2) linked to AM objectives; cascade integrity I ≈ 0.95; bottom-up additivity within 5% tolerance; SMART-ness S = 1.00 across all AM objectives; §9.1 KPIs defined and monitored on cadence. Recommended next level (L4): quantitative KPI benchmarking against peer utilities and integrated improvement-loop tracking of corrective actions on off-target KPIs.`,
    industrial_example: `Power — a regional transmission utility's organizational objective: "Achieve top-quartile reliability among peer utilities by FY28 (SAIDI ≤ 90 min/year, SAIFI ≤ 1.0 events/year) while reducing TCO by 5% PV over 5 years." The SAMP translates this into AM objectives: AM-1 (fleet health-index ≥ 0.85 by FY28 via 80 transformer renewals and 240 km line refurbishment, saving €45M PV); AM-2 (reduce unplanned outage minutes by 40% via RCM on criticality-A assets, saving €18M PV); AM-3 (raise vegetation-management compliance to 95% by FY26, saving €3M PV in storm-restoration costs); AM-4 (regulatory hold: NERC TPL-001-5 compliance throughout). AMP-level (FY25, transmission lines): refurbish 60 km of criticality-A line; budget €6.5M; quarterly reporting. Work-order-level: refurbish line L-447 (24 km), Q2-FY25, budget €2.6M. Cascade integrity verified ≥ 0.95; bottom-up additivity within 5% tolerance; SMART-ness S = 1.00. The assessor's §9.1 KPI verification: SAIDI, SAIFI, fleet health-index, vegetation-management compliance, unplanned outage minutes, renewal PV saved — each monitored monthly, reported to top management quarterly, reviewed at §9.3 annually.`,
    case_study: `SYNTHETIC CASE — "Eastern Power": a regional distribution utility. The organizational objective is "improve customer satisfaction." The AM objectives are: AM-1 "improve fleet reliability"; AM-2 "reduce maintenance cost"; AM-3 "modernize the fleet." None are SMART; none have baselines or targets; none are monitored; no SAMP exists; the AMPs are rebadged maintenance plans; the §9.1 KPI dashboard reports only MTBF and PM-compliance (no AM-objective KPIs); the §9.3 management review has not been held in 18 months.

CAMA assessor's findings:

(1) §6.2(a) Consistent with the policy — finding. The AM objectives do not trace to the policy framework (the policy is a slogan; the AM objectives are not consistent with a non-existent framework). Corrective action: redraft the policy (§5.2); then restate the AM objectives within the policy framework.

(2) §6.2(b) Measurable — finding. None of the AM objectives is SMART; none has a baseline or target. Corrective action: rewrite each AM objective SMART with a quantifiable KPI, a baseline, and a target.

(3) §6.2(c) Applicable requirements taken into account — finding. The AM objectives do not reflect the regulator's SAIDI/SAIFI conditions or the statutory safety regulations. Corrective action: add a regulatory-hold AM objective and ensure each AM objective respects the applicable requirements.

(4) §6.2(d) Monitored and communicated — finding. No §9.1 KPI dashboard reports the AM objectives (only MTBF and PM-compliance are reported). The §9.3 management review has not been held in 18 months. Corrective action: define a KPI per AM objective; report on cadence; institute the §9.3 management review.

(5) §6.2.1 SAMP — finding. No SAMP exists; the conversion of organizational objectives into AM objectives is undocumented; the AMP-development approach is undefined; the role of the AMS, the risk approach, the lifecycle approach, and the measures of success are all unspecified. Corrective action: develop a SAMP with all six ISO 55002 §6.2.1 content elements.

(6) §6.2.2 AMPs — finding. The AMPs are rebadged maintenance plans; they do not link to AM objectives; they have no SMART-level activities/resources/timescales. Corrective action: redraft AMPs per asset class, linked to AM objectives.

(7) Cascade integrity — finding. There is no cascade (org objective "improve customer satisfaction" → AM objective "improve fleet reliability" → AMP "old maintenance plan" → work order). Cascade integrity I ≈ 0. Corrective action: build the cascade after redrafting policy, SAMP, and AM objectives.

Recommended overall outcome: 7 major findings against §6.2 and §6.2.1; recommendation is to develop the SAMP and AM objectives within 6 months, institute the §9.1 KPI dashboard and §9.3 management review, and rework the AMPs before ISO 55001 certification is sought.`,
    visual_explanation: `The cascade is visualized as a five-tier waterfall: organizational objectives at the top (€80M PV TCO saving) flow down to AM objectives (€58.4M + €15M + €6.6M = €80M), then to AMP-level objectives (€12.5M + €3.0M + €1.3M = €16.8M for FY24), then to work-order-level objectives (€114k for M-2304 + ... ). Arrows run top-down (flow-down) and bottom-up (additivity check); the additivity tolerance (±5%) is shown as a band around each level's value. A second visual: the SMART scorecard (Specific, Measurable, Achievable, Relevant, Time-bound) as five checkboxes per AM objective; an objective with all five boxes checked meets §6.2(b). A third visual: the SAMP six-element diagram (traceability, AMP approach, role of AMS, risk approach, lifecycle approach, measures of success) as a hexagon with each element a vertex; missing elements are dimmed.`,
    simulation_opportunity: `A Cascade Builder simulator: input the organizational objective (e.g., TCO -5% PV over 5 years); the simulator generates three AM objectives (renewal, maintenance, health-index) with SMART-ness scoring; cascades to AMP-level objectives per asset class; cascades to work-order-level objectives with budget and schedule; verifies cascade integrity (I ≥ 0.95) and bottom-up additivity (within 5% tolerance). A second simulator: the SMART Rewriter — input a non-SMART objective ("improve reliability"); the simulator generates a SMART equivalent with quantifiable KPI, baseline, target, time-bound, and reporting cadence; scores the SMART-ness before and after.`,
    common_mistakes: `- Setting non-SMART AM objectives ("improve reliability") that fail §6.2(b) "measurable."
- Failing to map AM objectives to the policy framework (§5.2b) — they hang in mid-air.
- Not taking applicable requirements into account (§6.2c) — AM objectives that conflict with regulatory requirements.
- Setting AM objectives but not monitoring them (§6.2d) — no §9.1 KPI, no cadence, no §9.3 review.
- Omitting the SAMP (§6.2.1) — the bridge document is missing, the cascade is broken.
- Writing AMPs as rebadged maintenance plans — not linked to AM objectives.
- Breaking the cascade — work orders that do not support AMPs that do not support AM objectives.
- Setting unrealistic AM objectives — no committed budget, no staff, no tool, no timeline (fails SMART "Achievable").
- Setting AM objectives that are not time-bound — no deadline, no reporting cadence (fails SMART "Time-bound").
- Confusing AM objectives (§6.2) with KPIs (§9.1) — the objective is the result; the KPI is the measure.`,
    limitations: `- ISO 55001 §6.2 specifies the four requirements but does not prescribe how many AM objectives or what KPIs; the assessor applies judgement.
- The SAMP content (six elements) is specified by ISO 55002 interpretive guidance, not by ISO 55001 requirements; the SAMP's maturity varies widely between organizations.
- The SMART criteria are a practical lens, not a §6.2 requirement; an AM objective can be SMART and still fail §6.2(c) (applicable requirements not taken into account).
- Cascade integrity I ≥ 0.95 is an assessor rule-of-thumb, not an ISO 55001 requirement; the assessor may set a different threshold for a specific organization.
- The bottom-up additivity tolerance (±5%) assumes a deterministic cascade; in practice, work-order-level budgets and timelines vary, and a wider tolerance (±10%) may be justified.
- The SMART "Achievable" criterion is judgemental — what is "achievable" depends on resources, which depends on the §7.1 resource allocation, which the assessor may not be able to verify fully.
- The CAMA scheme does not prescribe KPI taxonomies; sector-specific KPI libraries (e.g., IEEE 1366 for power, IWA performance indicators for water) supplement ISO 55001 §9.1.`,
    comparison: `Compared to ISO 9001 §6.2 (quality objectives): same structure (consistent with policy, measurable, monitored, communicated) but the "subject" is the asset and its lifecycle, not product/service quality. Compared to ISO 14001 §6.2 (environmental objectives): same structure but ISO 55001 is broader — environment is one AM-objective family among many. Compared to PAS 55 §4.2.2 (AM objectives under PAS 55): ISO 55001 §6.2 is the international successor; PAS 55's "AM objectives" are now §6.2 with the four explicit requirements and the SAMP content specified by ISO 55002 §6.2.1. Compared to the SMRP CMRP "Business & Management" pillar's objective-setting: CMRP focuses on maintenance & reliability KPIs (OEE, MTBF, PM compliance); CAMA's §6.2 covers the broader AM objective cascade across all asset classes and all value dimensions. Compared to OKR/MBO frameworks (Objectives & Key Results / Management by Objectives): SMART and the cascade concept are shared, but ISO 55001 §6.2 grounds the objectives in the AM policy and the SAMP, not just in the strategic plan.`,
    practical_application: `1. Read the organizational objectives and the AM policy; confirm the policy names the value dimensions (§5.2b framework).
2. Develop the SAMP (§6.2.1) with all six content elements: traceability logic, AMP approach, role of the AMS, risk approach, lifecycle approach, measures of success.
3. Set AM objectives (§6.2) SMART, consistent with the policy, applicable requirements taken into account.
4. Map each AM objective to a §9.1 KPI with baseline, target, and monitoring cadence.
5. Develop AMPs (§6.2.2) per asset class — activities, resources, timescales — linked to AM objectives.
6. Cascade to operational work orders — linked to AMPs.
7. Build the traceability matrix (org objectives ↔ AM objectives ↔ AMPs ↔ work orders).
8. Verify cascade integrity I ≥ 0.95 and bottom-up additivity within 5% tolerance.
9. Communicate AM objectives and KPIs (§6.2(d), §7.3 awareness) to top management, AM team, operational teams.
10. Monitor KPIs on cadence; report to top management; review at §9.3 management review.
11. Take §10.2 corrective action when KPIs are off-target; take §10.3 continual improvement when opportunities arise.
12. Update AM objectives when organizational objectives change (reviewed under §9.3).`,
    decision_scenario: `You are the CAMA assessor on Day 2 of a 5-day assessment. The utility's three AM objectives are: "improve fleet reliability"; "reduce maintenance cost"; "modernize the fleet." No SAMP exists. The AMPs are rebadged maintenance plans. The §9.1 KPI dashboard reports only MTBF and PM-compliance. The §9.3 management review has not been held in 18 months. The organizational objective is "improve customer satisfaction." Decision: which §6.2 and §6.2.1 findings do you raise? What SMART rewrites of the three AM objectives do you propose (with quantifiable KPIs, baselines, targets, time-bounds, and reporting cadences)? What SAMP content elements do you require? What §9.1 KPI dashboard and §9.3 management review evidence do you request for Day 3? What is your recommendation on certification readiness?`,
    practice_questions: `- State the four ISO 55001 §6.2 requirements for AM objectives.
- List the six SAMP content elements (ISO 55002 §6.2.1).
- Apply the SMART criteria to a non-SMART AM objective ("improve reliability") and rewrite it.
- Construct a cascade from an organizational objective to AM objectives to AMP-level objectives to a sample work-order-level objective; quantify bottom-up additivity.
- Define cascade integrity I and the bottom-up additivity tolerance; what thresholds does the assessor apply?
- Distinguish AM objectives (§6.2) from KPIs (§9.1) — what is each, and how do they relate?`,
    certification_questions: `See the four enriched questions in the question bank for this lesson (3 MCQ + 1 TF). Topics: §6.2 four requirements; SMART rewrite of a non-SMART objective; SAMP six content elements; cascade integrity and bottom-up additivity.`,
    summary: `ISO 55001 §6.2 is where the AM system becomes operational. AM objectives must meet four requirements: consistent with the policy, measurable, take applicable requirements into account, monitored and communicated. The SAMP (§6.2.1) is the bridge document with six content elements (traceability logic, AMP approach, role of the AMS, risk approach, lifecycle approach, measures of success). The AMPs (§6.2.2) are the tactical operationalization per asset class. The cascade from organizational objectives through the policy, SAMP, AM objectives, AMPs, and work orders is the spine of the AMS; the assessor traces it top-down and bottom-up, applies cascade integrity I ≥ 0.95 and bottom-up additivity within ±5% tolerance, and uses SMART (Specific, Measurable, Achievable, Relevant, Time-bound) as the practical quality lens. The §6.2(d) "monitored and communicated" requirement is the bridge to §9 (performance evaluation) and §10 (improvement).`,
    key_takeaways: `- §6.2 four requirements: consistent with policy, measurable, applicable requirements, monitored and communicated.
- SMART (Specific, Measurable, Achievable, Relevant, Time-bound) is the practical quality lens.
- SAMP (§6.2.1) — six content elements; the bridge from org objectives to AM objectives; maintained, not one-off.
- AMPs (§6.2.2) — tactical, per asset class, with activities/resources/timescales, linked to AM objectives.
- Cascade: org objectives → policy → SAMP → AM objectives → AMPs → work orders; trace top-down and bottom-up.
- Cascade integrity I ≥ 0.95; bottom-up additivity within ±5% tolerance.
- §6.2(d) is the bridge to §9.1 KPIs and §9.3 management review.
- Common §6.2 failures: non-SMART objectives, no SAMP, rebadged AMPs, broken cascade, no monitoring.`,
    references: `- ISO 55000:2014 — Asset management — Overview, principles and terminology (definitions).
- ISO 55001:2014 — §6.2 AM objectives; §6.2.1 SAMP; §6.2.2 AMPs; §6.1 risk; §9.1 monitoring; §9.3 management review; §10.2/10.3 improvement.
- ISO 55002:2018 — §6.2.1 SAMP content (six elements); §6.2.2 AMP guidance.
- The IAM, Asset Management — An Anatomy — Strategy & Planning subjects (AM objectives, SAMP, AMPs within the Anatomy).
- The IAM, Asset Management Maturity Model — maturity evidence for AM objectives, SAMP, AMP subjects.
- Campbell & Jardine, Maintenance Strategy (2001) — links AM objectives to maintenance decision-making and LCC.`,
  },
  knowledgeObject: {
    title: "Asset Management Objectives & SAMP — ISO 55001 §6.2",
    domain: "Asset Management Principles & Policy",
    competency: "Asset Management Objectives & SAMP",
    topic: "AM objectives, SAMP, cascade, SMART",
    concept: "am-objectives-and-samp",
    body: {
      definitions: [
        "Asset management objectives (ISO 55001 §6.2): specific, measurable AM results to be achieved; consistent with the policy; take applicable requirements into account; monitored and communicated.",
        "Strategic Asset Management Plan (SAMP, §6.2.1): documented information specifying how organizational objectives are converted into AM objectives, the approach for developing AMPs, the role of the AMS, the asset risk approach, the lifecycle approach, and the measures of success.",
        "Asset management plans (AMPs, §6.2.2): tactical documented information per asset class with activities, resources, timescales linked to AM objectives.",
        "SMART: Specific, Measurable, Achievable, Relevant, Time-bound — the practical criteria for AM objective quality.",
        "Cascade: organizational objectives → policy → SAMP → AM objectives → AMPs → work orders.",
        "Cascade integrity I: the fraction of objectives at a level with both a parent at the level above and children at the level below.",
        "KPI (§9.1): the measurable quantity by which an AM objective is monitored.",
        "Monitoring cadence: the frequency at which an AM objective's KPI is reported.",
      ],
      principles: [
        "§6.2 four requirements: consistent with policy, measurable, applicable requirements, monitored and communicated.",
        "SMART (S, M, A, R, T) is the practical quality lens; failing any one is a §6.2(b) finding.",
        "SAMP (§6.2.1) — six content elements; the bridge from org objectives to AM objectives; maintained.",
        "AMPs (§6.2.2) — tactical, per asset class, with activities/resources/timescales.",
        "Cascade integrity I ≥ 0.95 and bottom-up additivity within ±5% tolerance — the assessor's quantitative measures.",
        "§6.2(d) monitored and communicated is the bridge to §9.1 KPIs and §9.3 management review.",
      ],
      components: [
        "Organizational objectives (strategic plan)",
        "AM policy (§5.2) — apex",
        "SAMP (§6.2.1) — bridge",
        "AM objectives (§6.2) — SMART, mapped to policy",
        "AMPs (§6.2.2) — tactical per asset class",
        "Operational work orders",
        "Traceability matrix",
        "KPI dashboard (§9.1)",
        "Monitoring cadence register",
        "Communication plan",
        "Management review record (§9.3)",
        "Improvement register (§10.2, §10.3)",
      ],
      mechanism:
        "Organizational objectives → AM policy (§5.2) → SAMP (§6.2.1) → AM objectives (§6.2) → AMPs (§6.2.2) → operational work orders. The assessor traces top-down (does the policy flow to AMPs and work orders?) and bottom-up (do the work orders add up to the AMP-level objective, do the AMPs add up to the AM objective, do the AM objectives add up to the organizational objective?). The §9.1 KPI dashboard monitors each AM objective on cadence; the §9.3 management review takes AM objectives' status as input and changes as output; the §10.2/10.3 improvement process closes the loop when KPIs are off-target.",
      process: [
        "Establish organizational objectives (strategic plan, dated).",
        "Confirm the AM policy names the value dimensions (§5.2b framework).",
        "Develop the SAMP (§6.2.1) with all six content elements.",
        "Set AM objectives (§6.2) SMART, consistent with policy, applicable requirements taken into account.",
        "Map each AM objective to a §9.1 KPI with baseline, target, monitoring cadence.",
        "Develop AMPs (§6.2.2) per asset class — linked to AM objectives.",
        "Cascade to operational work orders.",
        "Build the traceability matrix.",
        "Verify cascade integrity I ≥ 0.95 and bottom-up additivity within ±5%.",
        "Communicate AM objectives and KPIs (§6.2(d), §7.3).",
        "Monitor KPIs on cadence; report to top management; review at §9.3.",
        "Take §10.2 corrective action when off-target; §10.3 continual improvement when opportunities arise.",
      ],
      formulas: [
        "§6.2 four requirements: (a) consistent with policy + (b) measurable + (c) applicable requirements + (d) monitored and communicated (all four must be met).",
        "SMART-ness score S = (Σ SMART criteria met) / 5; target S = 1.00.",
        "SAMP content (6 elements): traceability + AMP approach + role of AMS + risk approach + lifecycle approach + measures of success (all six must be present).",
        "Cascade integrity I_level = (objectives at N with documented parent at N-1 AND documented children at N+1) / (total at N); overall I = weighted average; target I ≥ 0.95.",
        "Bottom-up additivity A = Σ children at N+1 / parent at N; target A ∈ [0.95, 1.05] (within ±5%).",
      ],
      metrics: [
        "AM objective SMART-ness score (0..1; target 1.00)",
        "Cascade integrity I (0..1; target ≥ 0.95)",
        "Bottom-up additivity A (target [0.95, 1.05])",
        "SAMP currency (months since last review)",
        "AM-objective count and ratio to org objectives",
        "AMP coverage (% of AM objectives with at least one supporting AMP)",
        "KPI coverage (% of AM objectives with a defined §9.1 KPI and cadence)",
        "§9.3 management review adherence (annual cycle, yes/no)",
        "Corrective-action closure rate on off-target KPIs (§10.2)",
      ],
      examples: [
        "Water utility cascade: TCO -5% PV over 5 years → AM-1 €58.4M (1,200 km PVC renewal) + AM-2 €15M (RCM) + AM-3 €6.6M (HI) = €80M ≈ org objective (within 0% tolerance).",
        "Transmission utility cascade: top-quartile reliability by FY28 → AM-1 €45M (transformer+line renewal) + AM-2 €18M (RCM) + AM-3 €3M (vegetation) = €66M ≈ 5% TCO target.",
        "Sample work-order-level: replace main M-2304 (1.2 km) with PVC, €114k, Q3-FY24, contributing to AM-1 and the TCO-5% objective.",
      ],
      industrial_examples: [
        "Utilities — water utility cascade from TCO-5% PV over 5 years to three SMART AM objectives (renewal, maintenance optimization, health-index rehabilitation) and a regulatory-hold AM objective (SAIDI, water-quality compliance).",
        "Power — transmission utility cascade from top-quartile reliability by FY28 (SAIDI ≤ 90 min, SAIFI ≤ 1.0) to AM objectives (renewal, RCM, vegetation) plus a NERC TPL-001-5 regulatory hold.",
      ],
      case_studies: [
        "SYNTHETIC — 'Eastern Power' regional distribution utility: three non-SMART AM objectives ('improve fleet reliability', 'reduce maintenance cost', 'modernize the fleet'), no SAMP, rebadged AMPs, KPI dashboard reporting only MTBF and PM-compliance, no §9.3 management review in 18 months; assessor raises 7 major findings against §6.2 and §6.2.1.",
      ],
      common_errors: [
        "Setting non-SMART AM objectives ('improve reliability') that fail §6.2(b).",
        "Failing to map AM objectives to the policy framework (§5.2b).",
        "Not taking applicable requirements into account (§6.2c).",
        "Setting AM objectives but not monitoring them (§6.2d) — no §9.1 KPI, no cadence, no §9.3 review.",
        "Omitting the SAMP (§6.2.1).",
        "Writing AMPs as rebadged maintenance plans — not linked to AM objectives.",
        "Breaking the cascade — work orders not supporting AMPs not supporting AM objectives.",
        "Setting unrealistic AM objectives (no budget, no staff, no tool, no timeline).",
        "Setting AM objectives that are not time-bound.",
        "Confusing AM objectives (§6.2) with KPIs (§9.1).",
      ],
      limitations: [
        "ISO 55001 §6.2 specifies the four requirements but not how many AM objectives or what KPIs; the assessor applies judgement.",
        "The SAMP content (six elements) is specified by ISO 55002 interpretive guidance, not by ISO 55001 requirements.",
        "SMART is a practical lens, not a §6.2 requirement; a SMART objective can still fail §6.2(c).",
        "Cascade integrity I ≥ 0.95 is an assessor rule-of-thumb, not an ISO 55001 requirement.",
        "The bottom-up additivity tolerance (±5%) is deterministic; wider tolerances may be justified in practice.",
        "The SMART 'Achievable' criterion is judgemental — depends on §7.1 resources the assessor may not fully verify.",
        "CAMA does not prescribe KPI taxonomies; sector-specific libraries (IEEE 1366, IWA performance indicators) supplement §9.1.",
      ],
      best_practices: [
        "Set AM objectives SMART, with quantifiable KPI, baseline, target, time-bound, and reporting cadence.",
        "Map each AM objective to a value dimension in the policy (§5.2b framework).",
        "Develop the SAMP with all six ISO 55002 §6.2.1 content elements, including the risk approach (linked to §6.1) and the lifecycle approach.",
        "Develop AMPs per asset class, with activities/resources/timescales linked to AM objectives.",
        "Build the traceability matrix (org objectives ↔ AM objectives ↔ AMPs ↔ work orders).",
        "Verify cascade integrity I ≥ 0.95 and bottom-up additivity within ±5% tolerance.",
        "Define a §9.1 KPI per AM objective; monitor on cadence; report to top management; review at §9.3.",
        "Take §10.2 corrective action on off-target KPIs; §10.3 continual improvement on opportunities.",
        "Update AM objectives when organizational objectives change (reviewed under §9.3).",
      ],
      related_concepts: [
        "ISO 55001 §5.2 policy (apex of the cascade)",
        "ISO 55001 §6.1 risk (linked to SAMP)",
        "ISO 55001 §6.2.1 SAMP (bridge document)",
        "ISO 55001 §6.2.2 AMPs (tactical)",
        "ISO 55001 §9.1 monitoring (KPIs)",
        "ISO 55001 §9.3 management review",
        "ISO 55001 §10.2/10.3 improvement",
        "SMART criteria / OKR / MBO frameworks",
      ],
      prerequisites: [
        "Asset Management Principles lesson (ISO 55000 principles, lifecycle, LCC).",
        "Asset Management Policy & Strategy lesson (§5.2 four requirements, §5.1 leadership, cascade apex).",
        "Strategic planning basics — vision, mission, objectives, KPI cascades.",
        "SMART criteria and KPI design fundamentals.",
      ],
      references: [
        "ISO 55000:2014 — Asset management — Overview, principles and terminology",
        "ISO 55001:2014 — Asset management — Management systems — Requirements",
        "ISO 55002:2018 — Asset management — Guidelines for the application of ISO 55001",
        "The IAM — Asset Management — An Anatomy (3rd ed.)",
        "The IAM — Asset Management Maturity Model",
        "Campbell & Jardine — Maintenance Strategy (2001)",
      ],
    },
  },
  questions: [
    {
      competencyName: "Asset Management Objectives & SAMP",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      scenario: "Utilities",
      stem: "ISO 55001 §6.2 specifies four requirements that asset management objectives must meet. Which one of the following lists all four requirements correctly?",
      whyCorrect:
        "The four §6.2 requirements are: (a) consistent with the AM policy; (b) measurable (achievable through the AM plan and the AMS); (c) take into account applicable requirements; (d) monitored and communicated. The CAMA assessor checks each of these four against every AM objective; failing any one is a §6.2 finding. An objective that does not trace to a policy value dimension fails (a); an objective with no baseline or target fails (b); an objective that conflicts with a regulatory requirement fails (c); an objective with no KPI, no monitoring cadence, and no communication plan fails (d).",
      whyOthersWrong: [
        "Option B (Specific, Measurable, Achievable, Relevant, Time-bound) lists the five SMART criteria — these are the practical quality lens, not the four §6.2 requirements. A SMART objective still must meet §6.2(a), (c), and (d); conversely, an objective that meets all four §6.2 requirements but is not SMART would still fail §6.2(b) in practice because non-SMART objectives are not measurable.",
        "Option C (Plan, Do, Check, Act) lists the PDCA cycle — the AMS structure, not the AM objective requirements.",
        "Option D (Policy, SAMP, AMP, KPI) lists four AM documents — these are the artefacts of the cascade, not the four §6.2 requirements for each AM objective.",
      ],
      explanation:
        "§6.2 four requirements: (a) consistent with the AM policy; (b) measurable; (c) take applicable requirements into account; (d) monitored and communicated. SMART, PDCA, and AM documents are related but distinct concepts.",
      options: [
        {
          text: "Consistent with the AM policy; measurable; take applicable requirements into account; monitored and communicated",
          isCorrect: true,
        },
        {
          text: "Specific, Measurable, Achievable, Relevant, Time-bound",
          isCorrect: false,
        },
        {
          text: "Plan, Do, Check, Act",
          isCorrect: false,
        },
        {
          text: "Policy, SAMP, AMP, KPI",
          isCorrect: false,
        },
      ],
    },
    {
      competencyName: "Asset Management Objectives & SAMP",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Conceptual",
      scenario: "Power",
      stem: "A regional transmission utility's organizational objective is 'achieve top-quartile reliability among peer utilities by FY28 (SAIDI ≤ 90 min/year, SAIFI ≤ 1.0 events/year) while reducing TCO by 5% PV over 5 years.' The AM objective reads: 'improve fleet reliability.' Which SMART rewrite best meets §6.2(b) and links to the organizational objective?",
      whyCorrect:
        "The SMART rewrite is: 'Raise the fleet health-index from 0.71 (FY24 baseline) to 0.85 by FY28-Q4 through 80 transformer renewals and 240 km of line refurbishment, saving €45M PV versus the FY24 baseline; report quarterly to top management; root-cause-investigate all criticality-A failures.' It is Specific (raise HI to 0.85 via 80 transformer renewals + 240 km line refurbishment), Measurable (HI 0.71 → 0.85; €45M PV saved; quarterly reporting; RCA on criticality-A failures), Achievable (the renewal programme is committed in the AMP), Relevant (links directly to the SAIDI/SAIFI top-quartile objective and the TCO-5% objective), and Time-bound (FY28-Q4; quarterly reporting). It traces to the policy value dimensions (reliability + cost) and the organizational objective.",
      whyOthersWrong: [
        "Option A ('Reduce MTBF by 10% in the next 12 months') — partially SMART (Specific, Measurable, Time-bound) but not Relevant to the SAIDI/SAIFI top-quartile objective (MTBF is a component-reliability KPI, not a system-reliability KPI like SAIDI/SAIFI) and not Achievable in 12 months for a transmission fleet.",
        "Option C ('Improve fleet reliability through better maintenance') — not SMART (no baseline, no target, no time-bound, no measurement) and fails §6.2(b) 'measurable.'",
        "Option D ('Achieve top-quartile reliability among peer utilities by FY28') — this is the organizational objective itself, restated as an AM objective. It is not Specific (no mechanism — how?), not Measurable at the AM level (no fleet-level KPI like health-index), and not Achievable through a single AM objective (the cascade requires multiple AM objectives — renewal, RCM, vegetation — each with their own SMART specifications).",
      ],
      explanation:
        "SMART rewrite: raise fleet HI from 0.71 (FY24) to 0.85 by FY28-Q4 via 80 transformer renewals + 240 km line refurbishment, saving €45M PV; quarterly reporting; RCA on criticality-A failures. Specific, Measurable, Achievable, Relevant (links to SAIDI/SAIFI + TCO), Time-bound (FY28-Q4, quarterly). Meets §6.2(b) and links to the org objective.",
      options: [
        {
          text: "Raise fleet health-index from 0.71 (FY24) to 0.85 by FY28-Q4 via 80 transformer renewals + 240 km line refurbishment, saving €45M PV; quarterly reporting; RCA on criticality-A failures",
          isCorrect: true,
        },
        {
          text: "Reduce MTBF by 10% in the next 12 months",
          isCorrect: false,
        },
        {
          text: "Improve fleet reliability through better maintenance",
          isCorrect: false,
        },
        {
          text: "Achieve top-quartile reliability among peer utilities by FY28",
          isCorrect: false,
        },
      ],
    },
    {
      competencyName: "Asset Management Objectives & SAMP",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Utilities",
      stem: "Per ISO 55002:2018 §6.2.1, the Strategic Asset Management Plan (SAMP) must contain six elements. Which one of the following lists all six SAMP content elements correctly?",
      whyCorrect:
        "The six SAMP content elements per ISO 55002:2018 §6.2.1 are: (i) how organizational objectives are converted into AM objectives (the traceability logic); (ii) the approach for developing AMPs; (iii) the role of the AMS in achieving AM objectives; (iv) the approach for managing asset risks (linked to ISO 55001 §6.1); (v) the approach for managing asset lifecycle activities (creation, utilization, maintenance, renewal, disposal); (vi) the AM measures of success (linked to ISO 55001 §9.1). The CAMA assessor verifies each element is present, current, and integrated with the rest of the AMS; a SAMP missing any one element is a §6.2.1 finding.",
      whyOthersWrong: [
        "Option A (Policy, SAMP, AMP, AM objectives, KPIs, work orders) lists six AM documents in the cascade — these are downstream artefacts of the SAMP, not the six content elements of the SAMP itself.",
        "Option B (Specific, Measurable, Achievable, Relevant, Time-bound, Monitored) lists the five SMART criteria plus 'Monitored' — these are quality criteria for AM objectives, not SAMP content elements.",
        "Option C (Plan, Do, Check, Act, Continual improvement, Documented information) lists PDCA plus two supporting concepts — these are management-system concepts, not SAMP content elements.",
      ],
      explanation:
        "Six SAMP content elements per ISO 55002 §6.2.1: (i) org-to-AM-objective conversion; (ii) AMP-development approach; (iii) role of the AMS; (iv) asset risk approach (linked to §6.1); (v) asset lifecycle approach; (vi) AM measures of success (linked to §9.1).",
      options: [
        {
          text: "Org-to-AM-objective conversion; AMP-development approach; role of the AMS; asset risk approach (§6.1); asset lifecycle approach; AM measures of success (§9.1)",
          isCorrect: true,
        },
        {
          text: "Policy, SAMP, AMP, AM objectives, KPIs, work orders",
          isCorrect: false,
        },
        {
          text: "Specific, Measurable, Achievable, Relevant, Time-bound, Monitored",
          isCorrect: false,
        },
        {
          text: "Plan, Do, Check, Act, Continual improvement, Documented information",
          isCorrect: false,
        },
      ],
    },
    {
      competencyName: "Asset Management Objectives & SAMP",
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      stem: "True or False: ISO 55001 §6.2 AM objectives are distinct from §9.1 KPIs — the AM objective is the result to be achieved (with a baseline and target), while the KPI is the measurable quantity by which that result is monitored. An AM objective that has no KPI fails §6.2(d) 'monitored and communicated.'",
      whyCorrect:
        "True. ISO 55001 §6.2 specifies the AM objective (the result to be achieved — e.g., 'raise fleet health-index from 0.71 to 0.85 by FY28-Q4'); ISO 55001 §9.1 specifies the KPI (the measurable quantity by which the AM objective is monitored — e.g., 'fleet health-index, reported quarterly'). The two are distinct: the AM objective is the destination; the KPI is the dashboard reading that tells you whether you are on track. §6.2(d) requires AM objectives to be 'monitored and communicated' — which means each AM objective must have at least one §9.1 KPI with a documented monitoring cadence, a defined reporting route to top management (§5.1(f)), and review at the §9.3 management review. An AM objective with no KPI fails §6.2(d) and, in practice, fails to drive behaviour.",
      whyOthersWrong: [
        "False — the candidate would conflate AM objectives (§6.2) and KPIs (§9.1). The AM objective is the result to be achieved (with baseline and target); the KPI is the measurable quantity by which the result is monitored. Conflating the two — for example, setting 'MTBF' as an AM objective rather than as a KPI for a SMART AM objective on fleet reliability — is a common assessor-found error that leaves the AM objective non-SMART and the cascade broken.",
      ],
      explanation:
        "True. AM objective (§6.2) = the result to be achieved (with baseline and target). KPI (§9.1) = the measurable quantity by which the AM objective is monitored. §6.2(d) requires monitoring and communication — each AM objective must have at least one §9.1 KPI with a documented cadence and reporting route. An AM objective with no KPI fails §6.2(d).",
      options: [
        { text: "True", isCorrect: true },
        { text: "False", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Public lesson array (3 lessons, one per AMP competency)
// ---------------------------------------------------------------------------

export const CAMA_AMP_LESSONS: RefLesson[] = [
  LESSON_AM_PRINCIPLES,
  LESSON_AM_POLICY,
  LESSON_AM_OBJECTIVES,
];

// ---------------------------------------------------------------------------
// Loader — combines STRUCTURE + CONTENT in one idempotent loadReference().
// Mirrors src/lib/ref-content/cre.ts exactly.
// ---------------------------------------------------------------------------

/**
 * Upsert the CAMA certification STRUCTURE + AMP CONTENT into the database.
 * Idempotent: safe to call repeatedly. Returns record counts written.
 *
 * Flow:
 *  (A) STRUCTURE
 *   1. Upsert Certification (slug "cama") + 4 CAMA BOK domains
 *      (delete+recreate competencies/domains for CAMA, like cre.ts). The AMP
 *      domain has 4 competencies (the focus of this loader's deep content);
 *      AMS, AML, and PI are structure-only here.
 *   2. Link three ISO standards (ISO 55000:2014, ISO 55001:2014, ISO
 *      55002:2018) via findFirst by slug → upsert CertificationStandard
 *      (mirrors cre.ts pattern for existing standards).
 *   3. Upsert CertificationVersion v2024 snapshot.
 *   4. Upsert LearningPath "cama-path".
 *  (B) CONTENT (AMP pillar)
 *   5. Upsert References globally (by title, no sectionId) → shared ids.
 *   6. For each AMP lesson: findFirst({competencyId, slug}) update/create
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

  // 1) Certification (upsert by slug "cama")
  const certification = await db.certification.upsert({
    where: { slug: "cama" },
    create: {
      slug: "cama",
      name: "CAMA",
      fullName: "Certified Asset Management Assessor",
      body: "IFANM/World Partners",
      currentVersion: "2024",
      bokReference: "ISO 55001:2014 — Asset Management — Management Systems — Requirements",
      examBlueprint: JSON.stringify({
        domains: 4,
        standards: ["iso-55000", "iso-55001", "iso-55002"],
        note: "Per-domain % weights flagged REQUIRES_RESEARCH pending official IFANM/World Partners CAMA scheme load. The 4-domain structure itself is the published CAMA framework aligned to ISO 55001:2014 and the IAM assessment framework.",
      }),
      effectiveDate: new Date("2024-01-01"),
      description:
        "The CAMA, administered by IFANM/World Partners, is the leading credential for asset-management-system assessors. It validates competency to assess against ISO 55001:2014 across four domains aligned to ISO 55001 clauses and the IAM (Institute of Asset Management) assessment framework: Asset Management Principles & Policy; Asset Management System (ISO 55001); Asset Management Plan & Lifecycle; and Performance & Improvement.",
      color: "emerald",
      icon: "Award",
      order: 5,
      group: "Maintenance & Reliability",
    },
    update: {
      name: "CAMA",
      fullName: "Certified Asset Management Assessor",
      body: "IFANM/World Partners",
      currentVersion: "2024",
      description:
        "The CAMA, administered by IFANM/World Partners, is the leading credential for asset-management-system assessors. It validates competency to assess against ISO 55001:2014 across four domains aligned to ISO 55001 clauses and the IAM (Institute of Asset Management) assessment framework: Asset Management Principles & Policy; Asset Management System (ISO 55001); Asset Management Plan & Lifecycle; and Performance & Improvement.",
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
  for (let i = 0; i < CAMA_DOMAINS.length; i++) {
    const d = CAMA_DOMAINS[i];
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

  // 3) Link ISO 55000:2014, ISO 55001:2014, ISO 55002:2018 standards to CAMA
  //    (findFirst by slug → upsert CertificationStandard; mirrors cre.ts).
  //    The ISO 55000/55001/55002 standards are created by
  //    src/lib/ref-content/cmrp.ts; if absent we create them here as a
  //    fallback (defensive).
  const CAMA_STANDARD_SLUGS = [
    "iso-55000",
    "iso-55001",
    "iso-55002",
  ];
  const CAMA_STANDARD_FALLBACKS: Record<
    string,
    { slug: string; name: string; organization: string; number: string; version: string; description: string }
  > = {
    "iso-55000": {
      slug: "iso-55000",
      name: "ISO 55000",
      organization: "ISO",
      number: "55000",
      version: "2014",
      description:
        "Asset management — Overview, principles and terminology. The umbrella standard for asset management.",
    },
    "iso-55001": {
      slug: "iso-55001",
      name: "ISO 55001",
      organization: "ISO",
      number: "55001",
      version: "2014",
      description:
        "Asset management — Management systems — Requirements. The requirements standard CAMA assessors assess against.",
    },
    "iso-55002": {
      slug: "iso-55002",
      name: "ISO 55002",
      organization: "ISO",
      number: "55002",
      version: "2018",
      description:
        "Asset management — Guidelines for the application of ISO 55001.",
    },
  };

  let standardsLinked = 0;
  for (const slug of CAMA_STANDARD_SLUGS) {
    let std = await db.standard.findUnique({ where: { slug } });
    if (!std) {
      std = await db.standard.create({ data: CAMA_STANDARD_FALLBACKS[slug] });
    }
    await db.certificationStandard.upsert({
      where: {
        certificationId_standardId: {
          certificationId: certification.id,
          standardId: std.id,
        },
      },
      create: { certificationId: certification.id, standardId: std.id },
      update: {},
    });
    standardsLinked++;
  }

  // 4) Certification version snapshot (v2024)
  const ampDomain = CAMA_DOMAINS.find((d) => d.code === "AMP")!;
  const ampSnapshot = {
    ampDomain,
    ampCompetencies: ampDomain.competencies,
    standards: CAMA_STANDARD_SLUGS,
    examBlueprintNote:
      "Per-domain % weights flagged REQUIRES_RESEARCH pending official IFANM/World Partners CAMA scheme load.",
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
        domains: CAMA_DOMAINS,
        standards: CAMA_STANDARD_SLUGS,
        ampSnapshot,
      }),
      changeLog:
        "Pilot structure: 4 CAMA BOK domains (AMP, AMS, AML, PI) seeded; AMP pillar deep content (3 full-spec lessons + KOs + 12 questions). 3 ISO standards linked (55000, 55001, 55002). Exam blueprint weights flagged REQUIRES_RESEARCH.",
    },
    update: {
      effectiveDate: new Date("2024-01-01"),
      bokSnapshot: JSON.stringify({
        domains: CAMA_DOMAINS,
        standards: CAMA_STANDARD_SLUGS,
        ampSnapshot,
      }),
    },
  });

  // 5) CAMA learning path
  const path = await db.learningPath.upsert({
    where: { slug: "cama-path" },
    create: {
      slug: "cama-path",
      name: "CAMA Certification Path",
      type: "Certification",
      certificationId: certification.id,
      description:
        "Structured path from Asset Management Principles through the four CAMA BOK domains (AMP, AMS, AML, PI) to certification-readiness as an ISO 55001 asset-management-system assessor.",
      order: 5,
    },
    update: { certificationId: certification.id },
  });

  // ---- (B) CONTENT (AMP pillar) ----

  // 6) Find the AMP domain and map its 4 competencies by NAME -> id
  const ampDomainRecord = await db.domain.findFirst({
    where: { certificationId: certification.id, code: "AMP" },
  });
  if (!ampDomainRecord) {
    throw new Error(
      "Asset Management Principles & Policy (AMP) domain not found under CAMA. Internal error — domains were just created."
    );
  }
  const ampCompetencies = await db.competency.findMany({
    where: { domainId: ampDomainRecord.id },
  });
  const competencyIdByName: Record<string, string> = {};
  for (const c of ampCompetencies) {
    competencyIdByName[c.name] = c.id;
  }
  const expectedCompetencyNames = CAMA_AMP_LESSONS.map((l) => l.competencyName);
  const missing = expectedCompetencyNames.filter((n) => !competencyIdByName[n]);
  if (missing.length > 0) {
    throw new Error(
      `Missing AMP competencies by name: ${missing.join(
        ", "
      )}. Ensure the CAMA structure (4 domains + AMP competencies) was seeded correctly.`
    );
  }

  // 7) References — global (no sectionId), upserted by title.
  const refIdsByTitle: Record<string, string> = {};
  for (const src of CAMA_SOURCES) {
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
  const sharedReferenceIds = CAMA_SOURCES.map((s) => refIdsByTitle[s.title]).filter(
    Boolean
  ) as string[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 8) Lessons, 9) KnowledgeObjects, 10) Questions
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of CAMA_AMP_LESSONS) {
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
      domainId: ampDomainRecord.id,
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
          domainId: ampDomainRecord.id,
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
    standards: standardsLinked,
    versions: 1,
    learningPath: path.id,
    lessons: lessonsCount,
    kos: kosCount,
    questions: questionsCount,
    references: referencesCount,
  };
}
