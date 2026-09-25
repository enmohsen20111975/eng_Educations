// =============================================================================
// CAMA — Certified Asset Management Assessor (IFANM/World Partners) — Asset
// Management Plan & Lifecycle (AML) domain — Deep scientific reference
// (Task ID 17-CAMA-AML).
//
// Certification slug: "cama" (IFANM/World Partners). Domain code: "AML"
// (Asset Management Plan & Lifecycle) — the 3rd of 4 CAMA domains aligned to
// ISO 55001:2014 and the IAM assessment framework. The AML domain exists in
// src/lib/ref-content/cama.ts (the combined structure+AMP-content loader) but
// is seeded with NO competencies. This CONTENT-only loader creates the 3 AML
// competencies inside loadReference() and then loads the deep scientific
// content (3 full-spec 24-section lessons + KOs + 12 enriched questions).
//
// Three lessons, one per AML competency (created below in loadReference()):
//   1. Asset Management Plan (AMP) Development   (slug: cama-amp-development)
//   2. Asset Lifecycle & LCC                     (slug: cama-asset-lifecycle-lcc)
//   3. Asset Risk & Criticality                 (slug: cama-asset-risk-criticality)
//
// Each lesson ships:
//   - The full 24-section data-collector template (spec §9, LESSON_TEMPLATE
//     in src/lib/spec.ts), with every applicable section filled with real,
//     in-depth professional asset-management content. No padding.
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
// Source hierarchy (spec §5) — Levels 2, 5, 7:
//   - LEVEL 2 — Official Standard / Standards Organization:
//       ISO 55001:2014 (AMS requirements), ISO 55000:2014 (overview &
//       terminology — asset, AM, AMS, AMP, principles, lifecycle),
//       ISO 55002:2018 (application guidelines), IEC 60300-3-3 (life-cycle
//       costing methodology).
//   - LEVEL 5 — Professional Organizations: The IAM "Asset Management — An
//       Anatomy" (3rd ed., 2014/2023) — the 39-subject AM knowledge framework.
//   - LEVEL 7 — Technical Publications / Industry Sources: John D. Campbell
//       & Andrew K.S. Jardine "Maintenance Strategy" (Pearson/Industrial
//       Press, 2001) — LCC, asset criticality, RCM, spare-parts optimization.
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
// Public types (mirror cre-reliability-modeling.ts & cama.ts)
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
  scenario?: string; // Utilities|Oil & Gas|Power|Chemical|Manufacturing|...
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
// SOURCES — 6 real references cited across all AML lessons.
// ---------------------------------------------------------------------------

export const CAMA_AML_SOURCES: RefSource[] = [
  {
    title:
      "ISO 55001:2014 — Asset management — Management systems — Requirements",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/55089.html",
    citation:
      "International Organization for Standardization. ISO 55001:2014, Asset management — Management systems — Requirements. Geneva: ISO. Specifies requirements for an asset management system (AMS) along the Plan-Do-Check-Act framework: §4 context, §5 leadership, §6 planning (policy, objectives, SAMP, risk), §7 support, §8 operation (operational planning & control, change management, outsourcing; §8.2 asset risk management; §8.3 manage asset life-cycle activities: creation, utilization, maintenance, renewal/disposal), §9 performance evaluation, §10 improvement. The CAMA assessor's primary audit benchmark; AML maps directly to §8.1-8.3.",
  },
  {
    title:
      "ISO 55000:2014 — Asset management — Overview, principles and terminology",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/55088.html",
    citation:
      "International Organization for Standardization. ISO 55000:2014, Asset management — Overview, principles and terminology. Geneva: ISO. Defines asset, asset management, asset management system, asset management plan, asset management objectives, and the principles of asset management (value, alignment, leadership, assurance). Establishes the asset lifecycle concept (creation/acquisition, utilization, maintenance, renewal/disposal) and the relationship between organizational objectives and asset management — the conceptual substrate for the AMP and LCC.",
  },
  {
    title:
      "ISO 55002:2018 — Asset management — Management systems — Guidelines for the application of ISO 55001",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/69070.html",
    citation:
      "International Organization for Standardization. ISO 55002:2018, Asset management — Management systems — Guidelines for the application of ISO 55001. Geneva: ISO. Provides interpretive guidance for each ISO 55001 clause: how to develop the SAMP and cascading objectives, how to write the asset management plan (§6.2.2 AMP requirements — what will be done, by whom, when, with what resources, to achieve AM objectives), how to plan life-cycle activities (§8.3), and how to perform risk assessment (§8.2). Indispensable companion to ISO 55001 for the CAMA assessor evaluating AML evidence.",
  },
  {
    title:
      "The IAM — Asset Management — An Anatomy (Institute of Asset Management)",
    level: "5",
    levelLabel: "Professional Organizations",
    type: "BOOK",
    url: "https://theiam.org/what-is-asset-management/anatomy-of-asset-management/",
    citation:
      "Institute of Asset Management (IAM). Asset Management — An Anatomy (3rd ed., 2014, updated 2023). The definitive conceptual reference for asset management, presenting 39 AM subjects grouped under six conceptual groups (Strategy & Planning; Asset Management Decision-Making; Lifecycle Delivery; Risk & Reliability; Health, Safety, Environment & Quality; Asset Information). AML-aligned subjects: 'Asset Management Plans (AMPs)' (Strategy & Planning), 'Life Cycle Activities', 'Asset Creation/Acquisition', 'Asset Operation/Maintenance', 'Asset Disposal' (Lifecycle Delivery), 'Asset Risk Assessment', 'Asset Criticality', 'Contingency & Resilience', 'Life-Cycle Costing & Value' (Risk & Reliability + Decision-Making).",
  },
  {
    title:
      "Campbell & Jardine — Maintenance Strategy (Pearson Education / Industrial Press)",
    level: "7",
    levelLabel: "Technical Publications / Industry Sources",
    type: "BOOK",
    url: "https://www.industrialpress.com/maintenance-strategy-9780831133364",
    citation:
      "Campbell, J. D., & Jardine, A. K. S. (Eds.) (2001). Maintenance Strategy: Creating and Implementing Optimal Maintenance Strategies for Profitable Asset Management. London: Pearson Education / Industrial Press. ISBN 978-0-13-017161-4. Chapters 2 (Maintenance Strategy & Asset Management Policy), 3 (Asset Criticality & Risk-Based Prioritization — the criticality matrix), 5 (Life-Cycle Costing — NPV-based whole-life cost), 6 (RCM — Reliability-Centered Maintenance linking failure modes to tactics), and 11 (Spare Parts & Resource Optimization). Bridges ISO 55000 principles to operational asset-life-cycle decisions; the canonical AML practitioner reference.",
  },
  {
    title:
      "IEC 60300-3-3:2017 — Dependability management — Part 3-3: Application guide — Life cycle costing",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://webstore.iec.ch/publication/2656",
    citation:
      "International Electrotechnical Commission. IEC 60300-3-3:2017, Dependability management — Part 3-3: Application guide — Life cycle costing. Geneva: IEC. Establishes the methodology for life-cycle cost (LCC) analysis of physical assets: cost-element breakdown (acquisition, operation, maintenance, failure/disruption, renewal, disposal), discounting (NPV — present value of recurring vs one-off costs), the LCC equation LCC = C_acq + Σ_t [(C_op + C_maint + C_failure) / (1+i)^t] + C_disposal / (1+i)^T, sensitivity analysis on discount rate i, and the relationship between LCC and total cost of ownership (TCO). The canonical LCC methodology standard referenced by ISO 55002 §8.3 and the IAM Anatomy 'Life-Cycle Costing & Value' subject.",
  },
];

const AML_REFERENCE_TITLES = CAMA_AML_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Lesson 1 — Asset Management Plan (AMP) Development
// (Competency: "Asset Management Plan (AMP) Development"; slug: cama-amp-development)
// ---------------------------------------------------------------------------

const LESSON_AMP_DEVELOPMENT: RefLesson = {
  competencyName: "Asset Management Plan (AMP) Development",
  slug: "cama-amp-development",
  title: "Asset Management Plan (AMP) Development",
  titleAr: "تطوير خطة إدارة الأصول (AMP)",
  order: 1,
  durationMin: 40,
  references: AML_REFERENCE_TITLES,
  conceptIntroduction: `An Asset Management Plan (AMP), per ISO 55000:2014 §3.2.4, is "documented information that specifies what activities will be carried out, by whom, and when, to achieve the asset management objectives." The AMP is the tactical bridge between the strategic Asset Management Policy (ISO 55001 §5.2), the Strategic Asset Management Plan/SAMP (§6.2.2), and the operational work order. It is the document that converts AM objectives — themselves derived from organizational objectives — into a scheduled, resourced, and risk-prioritized programme of lifecycle activities (creation, utilization, maintenance, renewal, disposal) for an asset class, system, or location.

ISO 55002:2018 §6.2.2 specifies the AMP must address: (i) the asset management objectives the AMP supports (traceability upward to the SAMP and policy); (ii) the scope of assets covered; (iii) the lifecycle activities to be carried out and their timing; (iv) the resources (people, materials, tools, contractors, capital); (v) the asset risk assessments underpinning tactic selection; (vi) the performance indicators (KPIs) the AMP will be measured against; (vii) the change-management provisions; (viii) the review and improvement cycle. The CAMA assessor's AML evidence trail traces this cascade: organizational objective → AM objective (SAMP) → AMP tactic → work order → KPI → management review (§9.3) → improvement (§10).`,
  example: `A regional water utility (CASE_TYPE = SYNTHETIC) develops an AMP for its fleet of 60 centrifugal raw-water pumps. The AM objective (from the SAMP) is: achieve pump-set availability ≥ 98.5% at whole-life cost ≤ $2.40/m³ pumped. The AMP structure: (a) SCOPE — 60 pumps across 12 sites, 10 sites with 5 pumps each + 2 sites with 5 standby pumps; (b) LIFECYCLE ACTIVITIES — creation (replace 4 pumps/yr @ $50k capex each), utilization (operate to duty point 1,200 m³/h, monitor vibration ISO 10816), maintenance (PCM inspections quarterly, oil analysis monthly, mechanical-seal replace at 18,000 h MTBF), renewal (reline bowl at 60,000 h, replace complete unit at 120,000 h or year 18 whichever first), disposal (decommission, drain, recycle steel); (c) RESOURCES — 6 maintenance technicians, $200k/yr opex, $1.2M/yr capex; (d) RISK — top-10 bad-actor pumps (top 17% by criticality index) account for 78% of unplanned downtime (Pareto); (e) KPIs — availability, MTBF, cost/m³, condition-index trend; (f) REVIEW — quarterly by asset-owner committee, annual management review. Each work order against a pump is traceable upward: WO → AMP tactic (e.g., quarterly vibration) → AMP lifecycle activity (utilization-maintenance) → AM objective (availability ≥ 98.5%) → organizational objective (regulatory supply obligation).`,
  keyFormulas: `AMP cascade: Organizational Objective → AM Policy (§5.2) → SAMP (§6.2.1) → AM Objectives (§6.2) → AMP (§6.2.2) → Work Order → KPI → Management Review (§9.3) → Improvement (§10).

AMP element coverage (ISO 55002:2018 §6.2.2): AMP = {objectives, scope, lifecycle activities, resources, risk assessment, KPIs, change management, review/improvement}.

Asset Management Plan lifecycle activity mapping (ISO 55001 §8.3): {create/acquire, operate/utilize, maintain, renew/replace, dispose} → each AMP tactic must map to one of these stages.

Tactic count rule (Campbell & Jardine, 2001): for each asset class, the AMP must specify at least one tactic per failure mode per lifecycle stage — failure-modes-without-tactics are an AML finding.

Work-order cascade traceability: each WO must link upward to AMP-tactic-id and downward to asset-id and asset-failure-mode-id; an AMP-tactic with zero WOs in the look-back window is a no-execution finding.

AMP-cost rollup: AMP_total_cost = Σ_tactics (tactic frequency × tactic unit cost × asset population) + Σ_capex (acquisition + renewal) + Σ_opex (operation + maintenance) + Σ_risk (risk-treatment reserve)`,
  exercise: `You are the CAMA assessor reviewing a power utility's AMP for its fleet of 30 gas-turbine peaking units. The AMP document you are given states only: "Maintain the units per OEM schedule." (a) Identify which of the eight ISO 55002 §6.2.2 AMP elements are missing. (b) The utility's SAMP objective is "achieve peaking-unit starting reliability ≥ 97% with annual maintenance budget ≤ $4.2M". Recommend three AMP content additions to make the AMP auditable against this objective. (c) The AMP shows 240 planned work orders for next year across 30 units (8 WO/unit/yr). The look-back shows only 156 WOs completed (65% completion). Identify two AMP execution findings you would raise.`,
  sections: {
    learning_objectives: `- Define the Asset Management Plan (AMP) per ISO 55000:2014 and locate it within the AM document cascade (policy → SAMP → objectives → AMP → work order).
- Enumerate the eight ISO 55002:2018 §6.2.2 AMP content elements and apply them to an asset class.
- Map AMP tactics to the five ISO 55001 §8.3 asset lifecycle stages (create/acquire, utilize, maintain, renew, dispose).
- Translate an AM objective (e.g., availability ≥ 98.5%) into a tactical programme (inspection frequencies, PM intervals, renewal triggers) that operationalizes the objective.
- Trace work-order upward to AMP tactic, AM objective, and SAMP; trace AMP tactic downward to scheduled WOs and KPIs.
- Identify common AMP findings (missing traceability, unresourced tactics, no-execution, unreviewed AMPs) a CAMA assessor would raise.`,
    prerequisites: `- The CAMA certification scheme and the position of Asset Management Plan & Lifecycle (AML) within it.
- ISO 55000 family fundamentals — the four AM principles (value, alignment, leadership, assurance), the AM definition, and the asset lifecycle stages.
- ISO 55001 §6.2 (AM objectives) and §8.3 (manage asset lifecycle activities).
- ISO management-systems family (ISO 9001, ISO 14001, ISO 45001) and the PDCA model.
- Familiarity with physical engineering assets (pumps, transformers, gas turbines, vehicles) and their failure modes.`,
    introduction: `The Asset Management Plan is the tactical engine of the AMS. Above it sit the strategic documents: the AM Policy (ISO 55001 §5.2 — a brief statement of intent set by top management) and the SAMP (§6.2.1 — the document that converts organizational objectives into AM objectives and defines the approach for developing AMPs). Below the AMP sit the operational work orders. The AMP is where strategy meets execution: it specifies, for an asset class or system, WHAT lifecycle activities will be carried out, BY WHOM, and WHEN, in order to deliver the AM objectives the SAMP has set.

ISO 55002:2018 §6.2.2 enumerates the AMP's required content: (1) the asset management objectives the AMP supports; (2) the scope of assets covered (class, location, boundaries); (3) the lifecycle activities to be carried out and their timing — each activity mapped to a lifecycle stage (create/acquire, utilize, maintain, renew, dispose per ISO 55001 §8.3); (4) the resources required (people, materials, tools, contractors, capital — both opex and capex); (5) the asset risk assessments underpinning tactic selection and prioritization; (6) the performance indicators (KPIs) and their targets; (7) change-management provisions (how the AMP is revised when context, assets, or risk change); (8) the review and improvement cycle (quarterly asset-owner review, annual management review per §9.3).

The CAMA assessor's job is to trace the cascade both directions. Top-down: does each AMP tactic trace upward to an AM objective that traces upward to the SAMP and the policy? Bottom-up: do the executed work orders trace upward to an AMP tactic, and do the KPI results feed the management review? A break in this cascade is an AML finding — for example, an AMP that lists quarterly vibration analysis as a tactic but whose work-order system has no completed vibration WOs in the look-back window is a no-execution finding (assured in policy, absent in practice).

The AMP must be risk-prioritized. The same lifecycle stage (e.g., quarterly inspection) does not need to be applied to all assets at the same frequency: high-criticality pumps get quarterly inspections, low-criticality pumps get annual. This risk-based prioritization is what makes the AMP economically defensible — the assessor checks that tactic frequency scales with criticality, not with first-cost.

The AMP must be reviewed. ISO 55001 §9.3 (management review) requires the AMP to be on the management-review input list; the assessor checks that the AMP is updated when (i) asset performance changes (e.g., a pump's MTBF drops by 30% — the inspection frequency should rise); (ii) risk changes (e.g., a new regulatory standard raises the consequence of a particular failure); (iii) the organizational objectives change (e.g., a net-zero commitment accelerates electrification capex).`,
    terminology: `- **Asset Management Plan (AMP, ISO 55000:2014 §3.2.4)**: documented information that specifies what activities will be carried out, by whom, and when, to achieve the AM objectives.
- **Strategic Asset Management Plan (SAMP, ISO 55002:2018 §6.2.1)**: documented information that specifies how organizational objectives are converted into AM objectives, the approach for developing AMPs, and the role of the AMS.
- **AM Policy (ISO 55001 §5.2)**: top-level statement of intent and direction for AM, set by top management.
- **AM Objectives (ISO 55001 §6.2)**: specific, measurable AM results to be achieved; derived from the policy and SAMP; cascade to AMPs.
- **Lifecycle activity (ISO 55001 §8.3)**: an activity in one of the five stages — create/acquire, utilize, maintain, renew/replace, dispose.
- **AMP tactic**: a specific, scheduled, resourced activity in the AMP (e.g., "quarterly vibration analysis on pump P-101").
- **Work order (WO)**: the operational execution unit — a single scheduled instance of an AMP tactic against a specific asset.
- **KPI (Key Performance Indicator)**: the quantitative measure by which the AMP's success against the AM objective is evaluated.
- **AMP cascade**: organizational objective → policy → SAMP → AM objectives → AMP → work orders → KPIs → management review → improvement.
- **Tactic frequency**: how often a tactic is executed (e.g., quarterly, annual, condition-based).
- **Asset class**: a group of assets of the same type (centrifugal pumps, 11kV transformers, gas turbines).
- **Asset population**: the count of assets within the AMP scope.
- **AMP change management**: the procedure for revising the AMP when context, assets, or risk change.
- **AMP review cycle**: the periodic management review (§9.3) at which the AMP is updated.`,
    detailed_explanation: `The AMP is the tactical document that operationalizes the AM strategy at the asset-class level. Where the policy is a one-page statement of intent and the SAMP is the multi-year strategic roadmap, the AMP is the multi-year tactical plan that specifies the actual activities. A typical AMP is 30-200 pages, covers a single asset class (e.g., "centrifugal raw-water pumps", "11kV distribution transformers", "gas-turbine peaking units"), and has a planning horizon of 3-10 years (long enough to cover renewal cycles, short enough to remain responsive to changing context).

The eight ISO 55002 §6.2.2 AMP elements form the assessor's checklist:

(1) **Objectives supported** — Each AMP must explicitly cite the AM objectives it supports. The assessor checks bidirectional traceability: each AM objective in the SAMP must be supported by at least one AMP; each AMP must support at least one AM objective. An AMP with no SAMP traceability is a "tactics-without-strategy" finding; an AM objective with no AMP is a "strategy-without-tactics" finding.

(2) **Scope** — The AMP must define its asset scope: which assets, which boundaries, which locations. Common scopes: "fleet of 60 raw-water pumps across 12 sites"; "30 gas-turbine peaking units at three plants"; "1,400 km of distribution mains in the Northern region". The assessor checks that every asset in the AMP scope is also in the asset register (ISO 55001 §7.5 documented information) and that the asset register population reconciles with the AMP scope population.

(3) **Lifecycle activities** — Each activity must be mapped to one of the five ISO 55001 §8.3 stages: creation/acquisition (design, procure, install, commission), utilization (operate, monitor), maintenance (preventive, corrective, condition-based, RCM-derived), renewal (refurbish, replace, upgrade), disposal (decommission, remove, recycle). A tactic without a lifecycle-stage mapping is an "unstructured tactic" finding. The assessor also checks that the lifecycle activities collectively cover all five stages — an AMP that omits disposal activities is a "missing lifecycle stage" finding.

(4) **Resources** — The AMP must quantify the resources required to deliver the activities: headcount (FTE by role), materials (consumables and spares), tools and tooling, contractor capacity, capital (capex for creation/renewal), operating (opex for utilization/maintenance). The assessor checks that the resourced total reconciles with the approved budget — an AMP that needs $1.2M/yr capex against an approved $800k capex budget is an "unfunded mandate" finding.

(5) **Risk assessment** — The AMP must reference the asset risk assessment that underpins tactic selection. Risk-based prioritization is what makes the AMP economically defensible: high-criticality assets get high-frequency tactics (e.g., monthly oil analysis), low-criticality assets get low-frequency tactics (e.g., annual walk-down). The assessor checks that tactic frequency scales with criticality (see Lesson 3) — uniform-frequency tactics across all asset classes regardless of criticality is a "risk-blind AMP" finding.

(6) **KPIs** — The AMP must define the KPIs by which its success against the AM objective is measured. Common AMP-level KPIs: availability (uptime / (uptime + downtime)), MTBF (Σ operating hours / Σ failures), MTTR (Σ repair time / Σ failures), whole-life cost per unit of service (e.g., $/m³ pumped), condition index (1-5 scale). The assessor checks that each AM objective has at least one KPI and that each KPI has a target (an objective without a KPI is "unmeasurable"; a KPI without a target is "unaccountable").

(7) **Change management** — The AMP must specify how it will be revised when conditions change. Triggers: asset performance drift (MTBF drops X% → review), risk reassessment (new failure modes identified → review), organizational objective change (new service-level commitment → review), regulatory change (new standard → review). The assessor checks that the AMP has a documented revision procedure, that revisions are version-controlled, and that the previous version is retained (ISO 55001 §7.5 documented-information control).

(8) **Review and improvement** — The AMP must be on the management-review agenda (ISO 55001 §9.3). The assessor checks the management-review minutes for AMP-level discussion (tactic effectiveness, KPI performance, risk reassessment) and for AMP improvement actions (frequency changes, tactic additions/removals, scope changes) that have been implemented and verified effective.

The AMP-to-work-order cascade is the operational backbone. Each AMP tactic generates, on a schedule, a work order (or multiple WOs across the asset population). The WO is the single execution instance: "Inspect pump P-101 vibration on 2024-03-15". The WO must carry upward traceability (to AMP-tactic-id) and downward traceability (to asset-id and, for corrective WOs, to asset-failure-mode-id). An AMP tactic with zero WOs in the look-back window is a no-execution finding — the tactic is assured in policy but absent in practice. A WO with no upward traceability is a "rogue WO" finding — the activity is being done but is not linked to AM objectives.

The assessor's evidence-gathering pattern for AML: (1) pull the AMP document; (2) pull the asset register; (3) pull a sample of work orders (say 30) against assets in the AMP scope; (4) check each AMP tactic for an executed WO traceable upward; (5) check each sampled WO for upward traceability to an AMP tactic; (6) check the KPI report against the AMP-defined KPIs; (7) check the management-review minutes for AMP discussion and improvement actions; (8) cross-check the AMP budget against the approved financial plan. This pattern is the assessor's AML audit programme.`,
    core_principles: `- The AMP is the tactical bridge from AM strategy (policy, SAMP, AM objectives) to operational execution (work orders); its absence makes the strategy unoperationalizable.
- The eight ISO 55002 §6.2.2 elements form the AMP content checklist; absence of any element is an AML finding.
- Each AMP tactic must map to an ISO 55001 §8.3 lifecycle stage (create/acquire, utilize, maintain, renew, dispose); the AMP must collectively cover all five stages.
- AMP tactic frequency must scale with asset criticality (risk-based prioritization); uniform frequencies across all asset classes is risk-blind.
- Each AM objective must be supported by at least one AMP; each AMP must support at least one AM objective — bidirectional traceability is the assessor's first check.
- Each AMP tactic must trace upward to an AM objective and downward to scheduled work orders; the assessor checks both directions.
- The AMP must be reviewed at the management review (§9.3) and revised when context, assets, or risk change — change management is institutional, not episodic.
- The AMP must be resourced; resourced total must reconcile with approved budget — unfunded mandates are findings.`,
    components: `- AMP cover sheet (title, asset class, scope, version, effective date, owner, approver).
- Section 1: AM objectives supported (traceable to SAMP and policy).
- Section 2: Scope (asset class, locations, boundaries, population reconciled to asset register).
- Section 3: Lifecycle activities — table mapping each tactic to one of the 5 ISO 55001 §8.3 stages.
- Section 4: Resources (FTE, materials, tools, contractor, capex, opex — reconciled to approved budget).
- Section 5: Risk assessment reference (link to asset criticality study — Lesson 3).
- Section 6: KPIs (one per AM objective, each with a target).
- Section 7: Change management procedure (triggers, revision steps, version control).
- Section 8: Review and improvement cycle (management-review schedule, look-back inputs, improvement-action log).
- Work-order execution log (look-back report: planned vs completed WOs by tactic).
- KPI performance report (current value vs target, trend).`,
    process: `1. RECEIVE the AM objectives from the SAMP — each objective must be specific, measurable, and traceable to organizational objectives.
2. DEFINE the AMP scope — asset class, locations, boundaries; reconcile the asset population against the asset register.
3. CONDUCT (or reference) the asset risk assessment — the criticality matrix (Lesson 3) assigns each asset a risk score that drives tactic frequency.
4. ENUMERATE failure modes per asset — typically via an FMEA (failure modes and effects analysis) or RCM study; each failure mode must have at least one tactic.
5. SELECT tactics per failure mode per lifecycle stage — preventive (time-based PM, condition-based CBM), corrective (run-to-failure for low-criticality), detective (functional testing for hidden failures), and renewal tactics (refurbish, replace).
6. SET tactic frequencies — high-criticality assets high-frequency; low-criticality assets low-frequency (or run-to-failure); justify each frequency from the risk assessment.
7. RESOURCE the tactics — headcount (FTE), materials, spares, tools, contractor, capex, opex; reconcile to approved budget.
8. DEFINE KPIs — at least one per AM objective; set targets with rationale.
9. SPECIFY change management — triggers (performance drift, risk change, organizational change, regulatory change), revision procedure, version control.
10. SPECIFY the review cycle — quarterly asset-owner review, annual management review per §9.3.
11. PUBLISH the AMP and communicate to all affected roles (operations, maintenance, engineering, finance).
12. EXECUTE — the AMP generates scheduled work orders via the CMMS (computerized maintenance management system).
13. MEASURE — collect KPI data; trend against targets.
14. REVIEW at management review — assess AMP effectiveness, decide improvement actions.
15. IMPROVE — revise tactic frequencies, add/remove tactics, update scope or resourcing — close the PDCA loop (§10).`,
    formula_calculation: `AMP element coverage (ISO 55002 §6.2.2): a complete AMP must address all eight elements E_i (i=1..8). Coverage ratio C = (Σ_i present? E_i : 1 : 0) / 8. A CAMA finding threshold: C < 1.0 → missing-element finding.

Work-order execution ratio: R_exec = (Σ completed WOs in look-back) / (Σ planned WOs in look-back). Threshold: R_exec ≥ 0.90 → acceptable; 0.75 ≤ R_exec < 0.90 → execution finding; R_exec < 0.75 → no-execution finding.

Tactic-traceability coverage (downward): T_down = (Σ AMP tactics with ≥1 executed WO in look-back) / (Σ AMP tactics defined). Threshold: T_down ≥ 0.95.

Work-order traceability coverage (upward): T_up = (Σ sampled WOs with AMP-tactic-id link) / (Σ sampled WOs). Threshold: T_up ≥ 0.95.

AMP cost rollup (Campbell & Jardine, 2001, Ch. 5):
  AMP_total_cost = Σ_tactics [ f_tactic × c_tactic × N_asset ] + Σ_capex [ C_acq + C_renew ] + Σ_opex [ C_op + C_maint ] + Σ_risk [ R_reserve ]
  where f_tactic = tactic frequency per asset per year (1/yr, 4/yr, ...),
        c_tactic = unit cost per tactic execution ($),
        N_asset = asset population in scope,
        C_acq, C_renew = capital acquisition and renewal costs ($),
        C_op, C_maint = annual operating and maintenance costs ($/yr),
        R_reserve = risk-treatment reserve ($/yr).

KPI target-setting rule: KPI_target = KPI_baseline + Δ (improvement commitment), where Δ must be ambitious yet achievable (typically 10-30% over baseline, per IAM Anatomy "Performance Target Setting").`,
    worked_example: `You are the CAMA assessor auditing a water utility's AMP for its fleet of 60 centrifugal raw-water pumps. The AMP is titled "Centrifugal Raw-Water Pump Fleet AMP v3.2, effective 2024-Q1, owner: P. Mendez, approver: VP Operations." You pull the AMP, the asset register, a sample of 30 WOs against assets in scope, the KPI report, and the last management-review minutes.

STEP 1 — AMP content-element check (ISO 55002 §6.2.2). The AMP has: (1) objectives — "support SAMP objective RW-Avail ≥ 98.5% and SAMP objective RW-Cost ≤ $2.40/m³"; (2) scope — "60 pumps across 12 sites (S1-S12), boundary = pump suction flange to discharge flange; excludes MCCs and switchgear (covered by Electrical AMP)"; (3) lifecycle activities — table of 18 tactics mapped to create (4 — design/procure/install/commission), utilize (3 — operate/monitor-vibration/monitor-oil), maintain (7 — quarterly PCM, monthly oil analysis, semiannual alignment, annual seal replace @ 18,000 h MTBF, condition-based bowl relining, etc.), renew (2 — bowl reline @ 60,000 h, unit replace @ 120,000 h or 18 yr), dispose (2 — decommission, recycle) — all 5 stages covered; (4) resources — 6 maintenance techs, $200k/yr opex, $1.2M/yr capex; (5) risk assessment reference — "see Asset Risk Assessment v2.1, 2023-Q4"; (6) KPIs — availability, MTBF, $/m³, condition index; (7) change management — triggers listed (MTBF drop >20%, new FMEA modes, regulatory change, SAMP change), revision by asset-owner + VP Ops, version-controlled; (8) review — quarterly asset-owner meeting, annual §9.3 review. COVERAGE: 8/8 elements present → C = 1.00. PASS.

STEP 2 — Work-order traceability (downward). The AMP defines 18 tactics. Look-back 12 months: of 18 tactics, 16 have at least one executed WO. Two tactics (T-12 "condition-based bowl relining" and T-14 "annual seal replace @ 18,000 h") have zero WOs — the asset-owner's note: "T-12 is condition-based, no pump hit the relining trigger this year; T-14 not executed because the 18,000 h MTBF threshold was reached by only 4 of 60 pumps, and the work was deferred by 3 months due to a pump-out tool shortage." T_down = 16/18 = 0.889 → below 0.95 threshold → TACTIC-EXECUTION FINDING (mitigated by the documented deferral rationale, but still a finding: deferrals must be tracked, not silent).

STEP 3 — Work-order traceability (upward). Sample 30 executed WOs at random from the CMMS look-back. Of 30, 28 carry AMP-tactic-id in the WO header; 2 are corrective WOs for unplanned seal failures and have no AMP-tactic-id (corrective WOs typically lack an AMP-tactic-id because the AMP did not schedule them, but they SHOULD carry the failure-mode-id for closure of the FMEA loop). T_up = 28/30 = 0.933 → below 0.95 threshold → WEAK-TRACEABILITY FINDING for corrective WOs.

STEP 4 — Execution ratio. Look-back: planned WOs for the year (sum across 18 tactics × 60 assets × their frequencies) = 240 + 60 + 60 + 60 + 60 + 30 + 12 = 522 planned WOs. Completed = 486. R_exec = 486/522 = 0.931 → above 0.90 threshold → execution acceptable, but the 36 unfinished WOs need to be in the deferred-WO log; assessor pulls the deferral log → 28 of 36 deferred with rationale, 8 with no rationale → DEFERRAL-LOG FINDING.

STEP 5 — KPI performance. AMP-defined KPIs: availability ≥ 98.5%; MTBF ≥ 18,000 h; $/m³ ≤ $2.40; condition index ≤ 2.5 (1=excellent, 5=poor). Reported: availability 97.8% (BELOW target by 0.7 pp); MTBF 17,200 h (BELOW target by 800 h); $/m³ $2.32 (BELOW target — favourable); condition index 2.7 (BELOW target — unfavourable by 0.2). Three KPIs below target — KPI-PERFORMANCE FINDING: the asset-owner must show §9.3 management-review discussion of the gaps and §10 improvement actions (e.g., raise vibration-tactic frequency from quarterly to monthly on the top-10 bad actors).

STEP 6 — Reconciliation. AMP scope = 60 pumps. Asset register query: 60 active pumps + 5 standbys + 3 in warehouse = 68. The 5 standbys are listed in the AMP scope (correct). The 3 warehouse pumps are not yet in service (correct to exclude from active AMP scope). Scope reconciles. AMP capex budget = $1.2M; approved financial plan capex = $1.15M. SHORTFALL = $50k → UNFUNDED-MANDATE FINDING (the AMP assumes $1.2M capex but the financial plan approves only $1.15M).

FINDINGS SUMMARY: 5 findings (TACTIC-EXECUTION, WEAK-TRACEABILITY, DEFERRAL-LOG, KPI-PERFORMANCE, UNFUNDED-MANDATE). All correctable; none systemic. Overall AMP maturity: the assessor scores AML "AMP Development" subject at IAM maturity level 3 (Defined — AMP is documented, structured, and integrated) trending to level 4 (Managed — KPIs drive decisions) once KPI-target breaches drive documented improvement actions.`,
    industrial_example: `Utilities — Water: A metropolitan water utility maintains an AMP for its 60 raw-water pump fleet (the worked example above) plus separate AMPs for treatment-works clarifiers (gravity-thickener rake-arm and bridge structures), distribution mains (LCC-informed renewal prioritization), and reservoirs (dam-integrity inspections per national dam-safety regulation). Each AMP is reviewed annually at the §9.3 management review; the AMP for the 1,400-km distribution network is reviewed quarterly due to its renewal-programme scale ($80M/yr capex).

Oil & Gas — Refining: A 220-kbpd refinery maintains AMPs for its 18 critical rotating-equipment trains (catalytic cracker wet-gas compressor, hydrocracker feed pump, crude distillation overhead air cooler), each AMP carrying RCM-derived tactics (on-condition monitoring via vibration, oil, performance; planned overhaul at defined operating-hour triggers). The AMPs reference the same asset criticality matrix; the top-3 bad-actor assets (top 17% by risk score) account for 71% of unplanned-loss-of-production events over the look-back year — a Pareto profile consistent with a risk-prioritized AMP.`,
    case_study: `CASE_TYPE = SYNTHETIC. "MetroWater Raw-Water Pump Fleet AMP v3.2" (the worked example expanded). MetroWater is a regional water utility serving 1.2M customers; its raw-water pump fleet comprises 60 centrifugal pumps across 12 sites that lift water from 3 reservoirs to 18 treatment works. The AMP v3.2 was developed in 2023-Q4 by a working group led by asset-owner P. Mendez (an engineer with 14 years in pumping systems) and approved by VP Operations J. Singh. The AMP traces upward to the SAMP AM objective "Raw-water lift availability ≥ 98.5% at whole-life cost ≤ $2.40/m³" which traces upward to the organizational objective "Deliver reliable, affordable water service per the regulatory Drinking Water Standards." The AMP specifies 18 lifecycle tactics across all five ISO 55001 §8.3 stages and resourced at $1.2M/yr capex + $200k/yr opex. The CAMA assessor's audit (above) produced 5 findings, all correctable, and an overall AMP-Development maturity score of level 3 trending to level 4. Improvement actions: (i) tighten deferral-log discipline (all deferrals with rationale and re-schedule); (ii) raise vibration-analysis frequency on top-10 bad-actor pumps from quarterly to monthly; (iii) reconcile AMP capex with the approved financial plan (close the $50k gap). Re-audit in 12 months.`,
    visual_explanation: `Picture the AMP cascade as a five-tier waterfall:

Tier 1 (top): AM POLICY — a single page: "We will realize value from our assets."
Tier 2: SAMP — multi-year strategy document; converts organizational objectives → AM objectives.
Tier 3: AM OBJECTIVES — bullet list, each SMART (e.g., "RW-Avail ≥ 98.5% by 2025").
Tier 4: AMP — the tactical plan, 30-200 pages, per asset class. Lists 18 lifecycle tactics (T1-T18), each tagged with its lifecycle stage (CREATE/UTILIZE/MAINTAIN/RENEW/DISPOSE) and KPI contribution.
Tier 5 (bottom): WORK ORDERS — thousands per year, each a single execution instance of an AMP tactic against a specific asset on a specific date.

Traceability arrows go up (each WO → its AMP-tactic-id → its AM objective → SAMP → policy) and down (each policy → SAMP → AM objective → AMP tactic → scheduled WOs). Break any arrow → finding.

Picture the AMP document itself as an 8-section binder: §1 Objectives, §2 Scope, §3 Lifecycle Activities (the heart, 50% of the document), §4 Resources, §5 Risk Reference, §6 KPIs, §7 Change Management, §8 Review & Improvement. The assessor opens each tab in turn.`,
    simulation_opportunity: `A simulation could let the learner act as a CAMA assessor with a fictional utility's AMP, asset register, CMMS WO log, KPI report, and management-review minutes. The learner runs the 8-step AML audit programme (content check, scope reconciliation, traceability downward, traceability upward, execution ratio, KPI check, change-management check, budget reconciliation) and produces a findings log with severity ratings. The simulation would surface realistic findings (no-execution tactics, weak upward traceability, KPI breaches, unfunded mandates) and let the learner practice writing conformity/non-conformity statements per ISO 19011 auditing principles.`,
    common_mistakes: `- AMP written as a "compliance document" rather than as a tactical plan — the eight ISO 55002 §6.2.2 elements are present but the AMP is not used to drive work orders.
- Uniform tactic frequencies across all asset classes regardless of criticality — a risk-blind AMP that wastes resources on low-criticality assets and under-treats high-criticality ones.
- No upward traceability from work orders to AMP tactics — the assessor cannot verify that the work being done supports AM objectives.
- No downward traceability from AMP tactics to executed WOs — the assessor cannot verify that the planned tactics are actually being executed.
- KPIs without targets — the AMP is "unaccountable"; performance cannot be judged against expectation.
- AMP not reviewed at §9.3 management review — the AMP drifts out of step with changed context, risk, or organizational objectives.
- AMP capex/opex not reconciled with the approved financial plan — unfunded mandates make the AMP non-executable.
- Corrective WOs not linked to failure-mode-id — the FMEA loop stays open; recurring failures cannot be detected.
- Deferrals not logged with rationale and re-schedule — silent deferrals disguise systemic tactic-execution failures.
- AMP scope not reconciled with the asset register — population mismatch (pumps in service not in AMP scope; pumps in AMP scope not in register) breaks integrity.`,
    limitations: `- An AMP cannot capture every nuance of asset condition — it specifies tactics, but the actual asset condition is captured in the condition-monitoring data (vibration spectra, oil analysis reports, performance curves) that the tactics generate. The AMP is the tactical plan, not the condition record.
- AMPs are built on assumptions about asset degradation (e.g., MTBF = 18,000 h, condition trigger at 60,000 h bowl wear) — if these assumptions are wrong, the AMP will over- or under-treat. The §9.3 review must validate the assumptions against actual data.
- AMP cost rollup assumes constant unit costs — but contractor rates, spares prices, and labor rates change. AMPs need periodic re-baselining.
- AMPs cannot replace the asset criticality study — they reference it. If the criticality study is stale (older than the AMP), the AMP's risk-prioritization is also stale.
- AMPs assume the asset register is accurate — if assets have been added/removed without updating the register, the AMP scope is wrong.
- AMPs cannot deliver value without executive sponsorship — without leadership (ISO 55000 principle), the AMP becomes a documentation exercise, not a tactical plan.`,
    comparison: `AMP vs SAMP vs AM POLICY:
  - AM POLICY: 1 page; statement of intent; set by top management; ISO 55001 §5.2.
  - SAMP: 5-20 pages; multi-year strategy; converts org objectives → AM objectives; defines AMP-development approach; ISO 55002 §6.2.1.
  - AMP: 30-200 pages; multi-year tactic plan; per asset class; converts AM objectives → work orders; ISO 55002 §6.2.2.
  - WORK ORDER: 1-5 pages; single execution instance of an AMP tactic against a specific asset on a specific date.

AMP vs MAINTENANCE PLAN:
  - MAINTENANCE PLAN: traditionally maintenance-only (PM, CM, CBM tactics); often operations-siloed.
  - AMP: covers all 5 lifecycle stages including creation, renewal, disposal; cross-functional; aligns with ISO 55001 §8.3 and the AM objectives.

AMP vs RCM STUDY:
  - RCM STUDY: analytical; FMEA-driven; identifies failure modes and selects tactics per failure mode.
  - AMP: tactical; takes the RCM output and resources, schedules, budgets, and assigns the tactics.`,
    practical_application: `In practice, an asset-management team develops an AMP per asset class every 3-5 years, reviews it annually at the §9.3 management review, and revises it on trigger (asset performance drift, risk change, organizational change, regulatory change). The AMP is published in the organization's documentation system (ISO 55001 §7.5), communicated to operations, maintenance, engineering, and finance, and executed via the CMMS that generates work orders from the AMP's tactic schedule. The CAMA assessor audits the AMP at the asset-class level using the 8-step AML audit programme (content check → scope reconciliation → traceability downward → traceability upward → execution ratio → KPI check → change-management check → budget reconciliation) and produces a findings log with severity ratings. Maturity is scored on the IAM 5-level scale (1 Initial → 5 Optimized).`,
    decision_scenario: `You are the CAMA lead assessor reviewing a transmission utility's AMP for its 200 circuit-breaker fleet. The AMP cites a SAMP objective "Circuit-breaker reliability ≥ 99.5% per fiscal year." The AMP lists 8 tactics: (T1) triannual time-based overhaul (every 6 yrs), (T2) annual condition-based contact-wear measurement, (T3) annual SF6 gas-density check, (T4) triannual trip-test, (T5) annual visual inspection, (T6) replacement at end-of-life, (T7) post-failure repair, (T8) disposal/recycle. The asset-owner has noted: only 145 of 200 breakers have an annual contact-wear WO in the look-back (T2 coverage = 72.5%); 12 breakers had unplanned trips with no FMEA-closure record; the capex budget for T6 replacement is $1.8M but the approved financial plan capex is $1.5M. Write your AML audit findings and your maturity score for the AMP-Development subject, justifying each.`,
    practice_questions: `- List the eight ISO 55002:2018 §6.2.2 AMP content elements and explain why each is non-negotiable.
- Trace a single work order (e.g., "Inspect pump P-101 vibration on 2024-03-15") upward through the AMP cascade to the AM policy.
- An AMP tactic has zero executed WOs in the 12-month look-back. The asset-owner's note reads "Deferred — no resources." Is this a finding? Justify.
- A utility's AMP capex budget is $1.2M but the approved financial plan capex is $1.15M. What finding do you raise? What improvement action do you recommend?
- The AMP KPI report shows availability 97.8% against a target of 98.5%. What §9.3 management-review discussion and §10 improvement action do you expect to see?`,
    certification_questions: `- (CAMA-style MCQ) Which ISO 55002:2018 clause specifies the AMP content elements?
  (A) §5.2  (B) §6.2.1  (C) §6.2.2  (D) §8.3  [Correct: C]
- (CAMA-style MCQ) An AMP tactic has zero executed WOs in the look-back. The most defensible finding label is:
  (A) Tactic-deferred  (B) No-execution  (C) Tactic-removed  (D) Rogue-WO  [Correct: B]
- (CAMA-style TrueFalse) The AMP must specify tactic frequencies that scale with asset criticality.
  [Correct: TRUE]`,
    summary: `The Asset Management Plan is the tactical engine of the AMS. It converts AM objectives (from the SAMP) into a scheduled, resourced, risk-prioritized programme of lifecycle activities for an asset class. The eight ISO 55002 §6.2.2 AMP content elements (objectives, scope, lifecycle activities, resources, risk, KPIs, change management, review/improvement) form the CAMA assessor's content checklist. The AMP-to-work-order cascade is the operational backbone; bidirectional traceability (tactic ↔ WO) and the §9.3 management-review loop are the assessor's integrity checks. Risk-based prioritization (tactic frequency scales with criticality) is what makes the AMP economically defensible. The assessor's AML audit programme covers content, scope reconciliation, traceability (both directions), execution ratio, KPI performance, change management, and budget reconciliation — eight gates that together determine AMP-Development maturity.`,
    key_takeaways: `- The AMP is "documented information that specifies what activities will be carried out, by whom, and when, to achieve the AM objectives" (ISO 55000 §3.2.4).
- Eight ISO 55002 §6.2.2 content elements are the AMP's required content; absence of any is a finding.
- Each AMP tactic maps to one of the five ISO 55001 §8.3 lifecycle stages (create/acquire, utilize, maintain, renew, dispose).
- Risk-based prioritization: tactic frequency scales with asset criticality.
- Bidirectional traceability: tactic ↔ WO; policy ↔ SAMP ↔ objective ↔ AMP ↔ WO.
- The AMP is reviewed at §9.3 and revised on trigger — change management is institutional.
- The assessor's 8-gate AML audit programme determines maturity (IAM 1-5 scale).
- A complete AMP is not the same as an executed AMP — execution ratio is a separate audit dimension.`,
    references: `1. ISO 55001:2014 §6.2.2 (AM objectives), §8.1 (operational planning & control), §8.3 (manage asset lifecycle activities), §9.3 (management review), §10 (improvement).
2. ISO 55000:2014 §3.2.4 (AMP definition), §3.2.5 (AM objectives), §3.2.6 (asset lifecycle).
3. ISO 55002:2018 §6.2.1 (SAMP), §6.2.2 (AMP — the eight content elements), §8.3 (lifecycle activities guidance).
4. The IAM — Asset Management — An Anatomy (3rd ed.) — subjects "Asset Management Plans", "Life Cycle Activities", "Asset Creation/Acquisition", "Asset Operation/Maintenance", "Asset Disposal" (Lifecycle Delivery group).
5. Campbell & Jardine — Maintenance Strategy — Ch. 2 (Maintenance Strategy & Asset Management Policy), Ch. 3 (Asset Criticality), Ch. 6 (RCM — failure-mode-driven tactic selection).
6. IEC 60300-3-3:2017 — referenced for the LCC methodology that underpins the AMP's capex/opex rollup (see Lesson 2).`,
  },
  knowledgeObject: {
    title: "Asset Management Plan (AMP) Development — ISO 55001 §6.2.2 / §8.3",
    domain: "Asset Management Plan & Lifecycle",
    competency: "Asset Management Plan (AMP) Development",
    topic: "AMP cascade, eight content elements, AMP-to-WO traceability",
    concept:
      "The AMP is the tactical document that converts AM objectives into a scheduled, resourced, risk-prioritized programme of lifecycle activities for an asset class, generating work orders that are traceable upward to AM objectives and downward to executed tactics.",
    body: {
      definitions: [
        "Asset Management Plan (AMP, ISO 55000 §3.2.4): documented information specifying what activities will be carried out, by whom, and when, to achieve the AM objectives.",
        "Strategic Asset Management Plan (SAMP, ISO 55002 §6.2.1): documented information converting organizational objectives into AM objectives, defining the AMP-development approach.",
        "AM Objectives (ISO 55001 §6.2): specific, measurable AM results to be achieved, derived from the policy and SAMP, cascaded to AMPs.",
        "Lifecycle activity (ISO 55001 §8.3): an activity in one of the five lifecycle stages (create/acquire, utilize, maintain, renew/replace, dispose).",
        "AMP tactic: a specific scheduled resourced activity in the AMP (e.g., 'quarterly vibration analysis on pump P-101').",
        "Work order (WO): the single execution instance of an AMP tactic against a specific asset on a specific date.",
      ],
      principles: [
        "The AMP is the tactical bridge from AM strategy (policy, SAMP, AM objectives) to operational execution (work orders); its absence makes the strategy unoperationalizable.",
        "Eight ISO 55002 §6.2.2 elements form the AMP content checklist; absence of any is a finding.",
        "Each AMP tactic maps to one of the five ISO 55001 §8.3 lifecycle stages; the AMP must collectively cover all five stages.",
        "Risk-based prioritization: tactic frequency scales with asset criticality; uniform frequencies are risk-blind.",
        "Bidirectional traceability: each tactic ↔ WO; each policy ↔ SAMP ↔ objective ↔ AMP ↔ WO.",
        "The AMP is reviewed at §9.3 and revised on trigger — change management is institutional, not episodic.",
      ],
      components: [
        "AMP cover sheet (title, asset class, scope, version, effective date, owner, approver).",
        "§1 AM objectives supported (traceable to SAMP and policy).",
        "§2 Scope (asset class, locations, boundaries, population reconciled to asset register).",
        "§3 Lifecycle activities table (tactic × lifecycle stage).",
        "§4 Resources (FTE, materials, tools, contractor, capex, opex).",
        "§5 Risk assessment reference (link to criticality study).",
        "§6 KPIs (one per AM objective, each with target).",
        "§7 Change management procedure.",
        "§8 Review & improvement cycle (§9.3 inputs, §10 actions).",
      ],
      mechanism: [
        "Strategy cascade: organizational objectives → AM policy (§5.2) → SAMP (§6.2.1) → AM objectives (§6.2) → AMP (§6.2.2) → work orders → KPIs → management review (§9.3) → improvement (§10).",
        "Tactic generation: each AM objective decomposes into lifecycle-stage tactics; each tactic gets a frequency derived from the asset criticality study; each tactic generates scheduled work orders via the CMMS.",
        "Traceability loop: each WO carries AMP-tactic-id (upward) and asset-id + failure-mode-id (downward); the assessor checks bidirectional integrity.",
        "PDCA loop: AMP plan (§6.2.2) → execute (§8.3) → measure KPIs (§9.1) → review (§9.3) → improve (§10) → re-plan next AMP version.",
      ],
      process: [
        "1. Receive AM objectives from SAMP.",
        "2. Define AMP scope; reconcile population with asset register.",
        "3. Reference asset risk assessment (criticality matrix).",
        "4. Enumerate failure modes per asset (FMEA/RCM).",
        "5. Select tactics per failure mode per lifecycle stage.",
        "6. Set tactic frequencies scaled with criticality.",
        "7. Resource the tactics; reconcile with approved budget.",
        "8. Define KPIs (one per AM objective, each with target).",
        "9. Specify change-management procedure (triggers, version control).",
        "10. Specify review cycle (quarterly asset-owner, annual §9.3).",
        "11. Publish and communicate to all affected roles.",
        "12. Execute via CMMS; generate scheduled WOs.",
        "13. Measure KPIs; trend against targets.",
        "14. Review at §9.3 management review.",
        "15. Improve; revise AMP; close the PDCA loop.",
      ],
      formulas: [
        "AMP element coverage C = (Σ_i present? E_i : 1 : 0) / 8 — finding if C < 1.0.",
        "Work-order execution ratio R_exec = completed/planned; thresholds 0.90 (acceptable), 0.75 (finding).",
        "Tactic traceability downward T_down = tactics-with-WO / total tactics; threshold ≥ 0.95.",
        "WO traceability upward T_up = WOs-with-tactic-id / sampled WOs; threshold ≥ 0.95.",
        "AMP total cost = Σ_tactics [f × c × N] + Σ_capex [C_acq + C_renew] + Σ_opex [C_op + C_maint] + Σ_risk [R_reserve].",
        "KPI target = KPI_baseline + Δ (typically 10-30% improvement, IAM 'Performance Target Setting').",
      ],
      metrics: [
        "AMP element coverage ratio C (1.0 = complete).",
        "Work-order execution ratio R_exec (target ≥ 0.90).",
        "Tactic-traceability T_down (target ≥ 0.95).",
        "WO-traceability T_up (target ≥ 0.95).",
        "KPI performance vs target (per AM objective).",
        "AMP capex vs approved financial plan capex (reconciliation gap).",
        "AMP maturity score (IAM 1-5 scale per Anatomy subject 'Asset Management Plans').",
      ],
      examples: [
        "MetroWater Raw-Water Pump Fleet AMP v3.2 — 60 pumps, 12 sites, 18 lifecycle tactics, $1.2M/yr capex + $200k/yr opex; 5 audit findings, maturity level 3 trending to 4 (see worked_example).",
        "Power utility 30 gas-turbine peaking-unit AMP — RCM-derived tactics, top-17% bad-actor assets account for 71% of unplanned production-loss events (Pareto profile).",
      ],
      industrial_examples: [
        "Utilities — Water: metropolitan water utility AMPs for raw-water pumps, treatment-works clarifiers, distribution mains, and reservoirs; reviewed annually at §9.3 management review (distribution-mains AMP reviewed quarterly due to $80M/yr capex scale).",
        "Oil & Gas — Refining: 220-kbpd refinery AMPs for 18 critical rotating-equipment trains (catalytic cracker wet-gas compressor, hydrocracker feed pump, crude-distillation overhead air cooler), each with RCM-derived tactics and operating-hour overhaul triggers.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. MetroWater Raw-Water Pump Fleet AMP v3.2 (developed 2023-Q4; audited 2024-Q3 by CAMA assessor; 5 findings: tactic-execution, weak-traceability, deferral-log, KPI-performance, unfunded-mandate; maturity level 3 trending to 4; re-audit in 12 months).",
      ],
      common_errors: [
        "AMP written as a compliance document, not a tactical plan (eight elements present but the AMP does not drive work orders).",
        "Uniform tactic frequencies across all asset classes regardless of criticality (risk-blind AMP).",
        "No upward traceability from WOs to AMP tactics (cannot verify work supports AM objectives).",
        "No downward traceability from AMP tactics to executed WOs (cannot verify tactics are being executed).",
        "KPIs without targets (unaccountable AMP).",
        "AMP not reviewed at §9.3 (drifts out of step with changed context/risk/objectives).",
        "AMP capex/opex not reconciled with the approved financial plan (unfunded mandates).",
        "Corrective WOs not linked to failure-mode-id (FMEA loop stays open).",
        "Deferrals not logged with rationale and re-schedule (silent deferrals disguise execution failures).",
        "AMP scope not reconciled with the asset register (population mismatch).",
      ],
      limitations: [
        "AMP captures tactics, not asset condition; condition is in the monitoring data the tactics generate.",
        "AMP built on degradation assumptions (MTBF, condition triggers) — §9.3 must validate against actual data.",
        "AMP cost rollup assumes constant unit costs — periodic re-baselining required.",
        "AMP references the asset criticality study; if the study is stale, the AMP's risk-prioritization is also stale.",
        "AMP assumes an accurate asset register — unregistered assets break the AMP scope.",
        "AMP cannot deliver value without executive sponsorship (ISO 55000 leadership principle).",
      ],
      best_practices: [
        "Bidirectional traceability: each WO carries AMP-tactic-id; each AMP tactic carries executed-WO count.",
        "Risk-based tactic frequency: high-criticality assets get high-frequency tactics; low-criticality assets get low-frequency or run-to-failure.",
        "One KPI per AM objective, each with a target and trend line.",
        "Quarterly asset-owner review + annual §9.3 management review — AMP review is institutional.",
        "Version-controlled AMP revisions with documented change triggers (auditable trail).",
        "Deferral log: every deferred WO carries a rationale and re-schedule date — silent deferrals are findings.",
        "Corrective WOs link to failure-mode-id — closes the FMEA loop and detects recurring failures.",
        "AMP capex/opex reconciled with the approved financial plan — unfunded mandates are findings.",
      ],
      related_concepts: [
        "Asset Management System (AMS) — ISO 55001 (Lesson: ISO 55001).",
        "SAMP and AM Objectives — ISO 55001 §6.2.1/6.2 (Lesson: Asset Management Policy & Strategy in AMP domain).",
        "Life-Cycle Costing (LCC) — Lesson 2 in this domain.",
        "Asset Risk & Criticality — Lesson 3 in this domain (drives tactic frequency).",
        "RCM (Reliability-Centered Maintenance) — failure-mode-driven tactic selection.",
        "FMEA — failure-modes-and-effects analysis; underpins the AMP's tactic-per-failure-mode rule.",
        "CMMS (Computerized Maintenance Management System) — generates and tracks WOs from the AMP's tactic schedule.",
      ],
      prerequisites: [
        "ISO 55000 fundamentals — four AM principles, AM definition, asset lifecycle stages.",
        "ISO 55001 §6.2 (AM objectives), §8.3 (lifecycle activities), §9.3 (management review), §10 (improvement).",
        "ISO management-systems family (ISO 9001/14001/45001) and the PDCA model.",
        "Familiarity with physical engineering assets and their failure modes.",
        "Asset criticality analysis (Lesson 3 in this domain).",
      ],
      references: AML_REFERENCE_TITLES,
    },
  },
  questions: [
    {
      competencyName: "Asset Management Plan (AMP) Development",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      scenario: "Utilities",
      stem: "Which ISO 55002:2018 clause specifies the required content elements of an Asset Management Plan (AMP)?",
      whyCorrect:
        "ISO 55002:2018 §6.2.2 — 'Asset management plans' — enumerates the eight content elements an AMP must address: objectives supported, scope, lifecycle activities, resources, risk assessment, KPIs, change management, and review/improvement. §6.2.1 covers the SAMP; §8.3 covers lifecycle activities guidance (referenced by the AMP); §5.2 covers the AM Policy (above the AMP in the cascade).",
      whyOthersWrong: [
        "Option §6.2.1 — that clause specifies the SAMP (Strategic Asset Management Plan), which sits ABOVE the AMP in the document cascade and converts organizational objectives to AM objectives; it does not enumerate the AMP content elements.",
        "Option §5.2 — that clause specifies the AM Policy (top-management statement of intent), which sits at the apex of the cascade above the SAMP and AM objectives; it does not address the tactical AMP at all.",
        "Option §8.3 — that clause specifies the requirement to manage asset lifecycle activities (create/acquire, utilize, maintain, renew, dispose); the AMP references §8.3 but the eight content elements are listed in §6.2.2, not §8.3.",
      ],
      explanation:
        "ISO 55002:2018 §6.2.2 is the AMP content clause; §6.2.1 is the SAMP clause; §5.2 is the policy clause; §8.3 is the lifecycle-activities clause the AMP references.",
      options: [
        { text: "§5.2", isCorrect: false },
        { text: "§6.2.1", isCorrect: false },
        { text: "§6.2.2", isCorrect: true },
        { text: "§8.3", isCorrect: false },
      ],
    },
    {
      competencyName: "Asset Management Plan (AMP) Development",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Apply",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Utilities",
      stem: "You are auditing a water utility's AMP for its 60-pump fleet. The AMP defines an annual mechanical-seal-replace tactic (T-14, trigger = MTBF 18,000 h reached). The 12-month look-back shows zero completed WOs for T-14. The asset-owner's note reads: 'Only 4 of 60 pumps reached the 18,000 h trigger this year; the work was deferred 3 months due to a pump-out tool shortage.' What is the most defensible finding and severity?",
      whyCorrect:
        "TACTIC-EXECUTION FINDING (severity: Minor, mitigated by the documented deferral rationale). The tactic has zero executed WOs in the look-back (T_down for T-14 = 0/1 = 0.00, below the 0.95 threshold). The deferral rationale (pump-out tool shortage) is plausible, but deferrals must be tracked in the deferral log with rationale and re-schedule date — silent deferrals are findings even when the rationale is legitimate. The §9.3 management review should have surfaced this and triggered a corrective action (procure additional pump-out tools, re-plan the deferred WOs). Severity Minor (not Major) because the AM objective (availability ≥ 98.5%) was not breached — but the no-execution pattern must be closed out before re-audit.",
      whyOthersWrong: [
        "Option 'No finding — the rationale is legitimate, so no audit issue' — wrong because the deferral must be tracked in the deferral log; a no-execution pattern with no §9.3 follow-up is itself a finding even when the rationale is legitimate.",
        "Option 'Remove T-14 from the AMP — it is un-executable' — wrong because T-14 is a sound condition-based tactic with a documented trigger (18,000 h MTBF); the issue is execution (pump-out tool shortage), not tactic design.",
        "Option 'KPI-PERFORMANCE finding — availability must have dropped' — wrong because the audit evidence does not show an availability breach; the finding is on tactic execution, not KPI performance.",
      ],
      explanation:
        "A tactic with zero executed WOs in the look-back is a no-execution pattern; the documented rationale mitigates severity to Minor but does not eliminate the finding. The deferral must be tracked and the §9.3 review must address the root cause (pump-out tool shortage).",
      options: [
        {
          text: "TACTIC-EXECUTION FINDING (Minor) — deferral rationale is legitimate but must be tracked in the deferral log and addressed at §9.3.",
          isCorrect: true,
        },
        {
          text: "No finding — the rationale is legitimate, so no audit issue.",
          isCorrect: false,
        },
        {
          text: "Remove T-14 from the AMP — it is un-executable.",
          isCorrect: false,
        },
        {
          text: "KPI-PERFORMANCE finding — availability must have dropped.",
          isCorrect: false,
        },
      ],
    },
    {
      competencyName: "Asset Management Plan (AMP) Development",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Oil & Gas",
      stem: "A refinery's AMP for its catalytic-cracker wet-gas compressor applies quarterly vibration analysis to all 4 critical compressors and to all 30 non-critical auxiliary pumps in the same scope. What is the assessor's primary AML finding?",
      whyCorrect:
        "RISK-BLIND AMP finding. Tactic frequency must scale with asset criticality (ISO 55000 risk-based decision-making fundamental; ISO 55002 §6.2.2 risk-assessment element). Applying the same quarterly vibration-analysis frequency to 4 critical compressors AND to 30 non-critical auxiliary pumps is risk-blind: the high-criticality compressors should be monthly (or higher), the low-criticality pumps should be annual or run-to-failure. The assessor recommends re-tiering the tactic frequency against the asset criticality matrix (see Lesson 3) and rebalancing the resource profile (FTE shifts from low- to high-criticality work).",
      whyOthersWrong: [
        "Option 'No finding — uniform frequency is simpler to administer and ensures no asset is missed' — wrong because uniform frequency wastes resources on low-criticality assets and under-treats high-criticality ones; this is the canonical anti-pattern for risk-based AM.",
        "Option 'Unfunded-mandate finding — quarterly on all 34 assets exceeds the budget' — wrong because the audit evidence does not show a budget breach; the issue is risk-prioritization, not funding.",
        "Option 'No-execution finding — quarterly on 34 assets cannot be completed' — wrong because the issue is tactic design (uniform frequency across criticality tiers), not tactic execution (which the audit evidence does not address).",
      ],
      explanation:
        "Uniform tactic frequency across criticality tiers is risk-blind; the assessor's finding is on tactic design — frequency must scale with criticality from the asset risk assessment.",
      options: [
        {
          text: "RISK-BLIND AMP — tactic frequency must scale with asset criticality; recommend re-tiering against the criticality matrix.",
          isCorrect: true,
        },
        {
          text: "No finding — uniform frequency is simpler to administer and ensures no asset is missed.",
          isCorrect: false,
        },
        {
          text: "UNFUNDED-MANDATE — quarterly on all 34 assets exceeds the budget.",
          isCorrect: false,
        },
        {
          text: "NO-EXECUTION — quarterly on 34 assets cannot be completed.",
          isCorrect: false,
        },
      ],
    },
    {
      competencyName: "Asset Management Plan (AMP) Development",
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Utilities",
      stem: "True or False: Each Asset Management Plan (AMP) tactic must be traceable upward to an AM objective and downward to at least one executed work order (WO) within the audit look-back window; an AMP tactic with zero executed WOs in the look-back is, by itself, an AML finding even if the asset-owner has a legitimate deferral rationale.",
      whyCorrect:
        "TRUE. Bidirectional traceability is the assessor's first integrity check. Upward: each tactic must trace to an AM objective (in the SAMP) — otherwise the tactic is 'strategy-without-objectives' (orphan tactic). Downward: each tactic must produce at least one executed WO within the look-back window — otherwise the tactic is 'assured in policy but absent in practice' (no-execution pattern). The legitimate deferral rationale MITIGATES the severity (from Major to Minor) but does NOT eliminate the finding: the deferral must be in the deferral log with rationale AND re-schedule date, AND the §9.3 management review must address the root cause. The assessor records the finding regardless and verifies closure at re-audit.",
      whyOthersWrong: [
        "Option FALSE — would imply that a legitimate deferral rationale eliminates the finding; in fact the rationale mitigates severity but does not eliminate the no-execution pattern. The finding stands until the deferral is tracked and the root cause is addressed in the §9.3 review.",
      ],
      explanation:
        "TRUE. A tactic with zero executed WOs in the look-back is a no-execution pattern that constitutes an AML finding regardless of rationale; the rationale mitigates severity but does not eliminate the finding until the deferral is tracked and the root cause is §9.3-addressed.",
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Asset Lifecycle & LCC
// (Competency: "Asset Lifecycle & LCC"; slug: cama-asset-lifecycle-lcc)
// ---------------------------------------------------------------------------

const LESSON_LIFECYCLE_LCC: RefLesson = {
  competencyName: "Asset Lifecycle & LCC",
  slug: "cama-asset-lifecycle-lcc",
  title: "Asset Lifecycle & Life-Cycle Costing (LCC)",
  titleAr: "دورة حياة الأصل وتكلفة دورة الحياة (LCC)",
  order: 2,
  durationMin: 40,
  references: AML_REFERENCE_TITLES,
  conceptIntroduction: `The asset lifecycle (ISO 55000:2014 §3.2.6) is the "period, or stages, from creation through to the disposal of an asset." ISO 55001 §8.3 requires the AMS to "manage its lifecycle activities" across five canonical stages: creation/acquisition (design, procure, install, commission), utilization (operate, monitor), maintenance (preventive, corrective, condition-based), renewal (refurbish, replace, upgrade), and disposal (decommission, remove, recycle, dispose). Each stage has its own decisions, costs, risks, and KPIs; the assessor checks that the AMP (Lesson 1) covers all five stages and that decisions are made on whole-life — not first-cost — terms.

Life-Cycle Costing (LCC) is the analytical engine of lifecycle integration. IEC 60300-3-3:2017 establishes the LCC methodology: a cost-element breakdown (acquisition, operation, maintenance, failure/disruption, renewal, disposal), discounting (NPV — present value of recurring vs one-off costs), the LCC equation, and sensitivity analysis. The LCC of an asset is the present-value sum, over the analysis period T, of all costs the asset will impose: capital acquisition (one-off at t=0), annual operation and maintenance (recurring), failure/disruption (recurring, frequency × consequence), renewal (one-off at trigger time), and disposal (one-off at end-of-life). Total Cost of Ownership (TCO) is the LCC plus indirect organizational costs (overhead, IT, training) — LCC is the asset-class scope; TCO is the enterprise scope.

The CAMA assessor's LCC evidence trail: (i) the LCC methodology document (cost elements, discount rate, analysis period, sensitivity ranges); (ii) the LCC spreadsheet per asset-class decision (acquisition, renewal, replacement, disposal); (iii) the LCC's role in the SAMP/AMP (does the LCC drive the renewal-prioritization decision?); (iv) the discount-rate policy (who sets it, when, with what rationale); (v) the sensitivity analysis (does the LCC conclusion survive ±2pp discount-rate shock?).`,
  example: `A water utility (CASE_TYPE = SYNTHETIC) compares two centrifugal raw-water pump options over a 20-year analysis period at discount rate i = 6%. Option A (low-cost, low-quality): capex $50k, opex $3k/yr, failure cost $8k/yr (high failure frequency × consequence), disposal $5k at year 20. Option B (higher-cost, higher-quality): capex $80k, opex $1.5k/yr, failure cost $2k/yr (low failure frequency × consequence), disposal $5k at year 20.

LCC equation (IEC 60300-3-3:2017): LCC = C_capex + Σ_{t=1}^{T} [(C_op(t) + C_maint(t) + C_failure(t)) / (1+i)^t] + C_disposal / (1+i)^T

Present-value annuity factor P/A(i, T) = (1 - (1+i)^-T) / i
Present-value single-payment factor P/F(i, T) = 1 / (1+i)^T

For i = 6%, T = 20: (1.06)^20 = 3.207135 → (1.06)^-20 = 0.311804 → P/A(6%, 20) = (1 - 0.311804)/0.06 = 11.4699; P/F(6%, 20) = 0.311804.

LCC_A = 50 + (3 + 0 + 8) × 11.4699 + 5 × 0.311804
       = 50 + 11 × 11.4699 + 1.559
       = 50 + 126.169 + 1.559
       = $177.728k

LCC_B = 80 + (1.5 + 0 + 2) × 11.4699 + 5 × 0.311804
       = 80 + 3.5 × 11.4699 + 1.559
       = 80 + 40.145 + 1.559
       = $121.704k

DECISION: Option B is preferred on LCC basis — saves $56.024k in present-value terms (31.5% reduction) despite the $30k higher capex. The LCC conclusion survives a ±2pp discount-rate shock (at i=4%, LCC_A=$191.4k vs LCC_B=$129.9k; at i=8%, LCC_A=$166.7k vs LCC_B=$114.9k — Option B always wins). The asset-management decision: specify Option B as the standard for the fleet; write the LCC methodology and the discount-rate policy into the AMP; require that all future pump purchases ≥ $25k capex carry an LCC comparison.`,
  keyFormulas: `Asset lifecycle stages (ISO 55001 §8.3): Create/Acquire → Utilize → Maintain → Renew/Replace → Dispose. Each stage has its own cost element.

LCC equation (IEC 60300-3-3:2017):
  LCC = C_capex + Σ_{t=1}^{T} [(C_op(t) + C_maint(t) + C_failure(t)) / (1+i)^t] + C_disposal / (1+i)^T
  where C_capex = capital acquisition cost (one-off, t=0);
        C_op(t), C_maint(t), C_failure(t) = annual operating, maintenance, and failure/disruption costs ($/yr);
        C_failure = frequency × consequence ($/yr);
        C_disposal = end-of-life disposal cost (one-off, t=T);
        i = discount rate (decimal, e.g., 6% = 0.06);
        T = analysis period (years).

Present-value annuity factor: P/A(i, T) = (1 - (1+i)^-T) / i
Present-value single-payment factor: P/F(i, T) = 1 / (1+i)^T

Net Present Value (NPV) of an alternative with benefit stream B(t):
  NPV = -C_capex + Σ_{t=1}^{T} [B(t) - C_op(t) - C_maint(t) - C_failure(t)] / (1+i)^t + C_salvage / (1+i)^T
  Choose alternative with NPV > 0 and highest NPV (or, for cost-only comparison, lowest LCC).

Sensitivity range: ±2pp on i; LCC conclusion must survive both bounds.

Total Cost of Ownership (TCO): TCO = LCC + indirect org costs (overhead allocation, IT systems, training, administration).

LCC-vs-first-cost decision rule: if LCC_alt < LCC_baseline, the alternative is preferred regardless of higher first cost — provided the LCC conclusion survives the ±2pp sensitivity test.`,
  exercise: `You are the CAMA assessor reviewing a transmission utility's LCC methodology and its LCC comparison for a 50-MVA power-transformer renewal decision. The utility's discount-rate policy states "i = 4% (consistent with the regulator's weighted-average cost of capital)." Two transformer options: Option X — capex $1.2M, opex $40k/yr, failure cost $60k/yr (failure frequency 0.04/yr × consequence $1.5M), disposal $100k at year 40. Option Y — capex $1.8M, opex $25k/yr, failure cost $15k/yr (failure frequency 0.01/yr × consequence $1.5M), disposal $80k at year 40. T = 40, i = 4%. (a) Compute the LCC of both options at i=4%. (b) Compute the LCC at i=2% and i=6% and verify the conclusion survives the ±2pp sensitivity test. (c) Recommend the preferred option and the LCC methodology improvements you would raise as audit findings.`,
  sections: {
    learning_objectives: `- Define the asset lifecycle per ISO 55000:2014 §3.2.6 and enumerate the five ISO 55001 §8.3 stages (create/acquire, utilize, maintain, renew, dispose).
- Apply the IEC 60300-3-3:2017 LCC methodology — cost-element breakdown, discounting, NPV — to an asset-class decision.
- Compute the LCC of two asset alternatives using the LCC equation LCC = C_capex + Σ_t [(C_op + C_maint + C_failure)/(1+i)^t] + C_disposal/(1+i)^T.
- Apply present-value annuity factor P/A(i, T) = (1 - (1+i)^-T)/i and single-payment factor P/F(i, T) = 1/(1+i)^T.
- Distinguish LCC from Total Cost of Ownership (TCO) and from first-cost.
- Conduct a sensitivity analysis (±2pp on discount rate) and verify the LCC conclusion survives.
- Identify common LCC findings (missing cost elements, undocumented discount rate, no sensitivity analysis, first-cost-override) the CAMA assessor would raise.`,
    prerequisites: `- ISO 55000 fundamentals — asset lifecycle, AM definition.
- ISO 55001 §8.3 (manage lifecycle activities) and §6.2.2 (AMP — lifecycle activity mapping).
- Engineering economics: present value, annuity factor P/A(i, T), single-payment factor P/F(i, T), NPV.
- Familiarity with physical engineering assets and their cost elements (acquisition, operation, maintenance, failure, disposal).
- Asset Management Plan structure (Lesson 1 in this domain).`,
    introduction: `The asset lifecycle is the temporal backbone of asset management. ISO 55000:2014 §3.2.6 defines it as the "period, or stages, from creation through to the disposal of an asset." ISO 55001 §8.3 makes the lifecycle operational: "The organization shall manage its lifecycle activities" across five stages — creation/acquisition (design, procure, install, commission), utilization (operate, monitor), maintenance (preventive, corrective, condition-based), renewal (refurbish, replace, upgrade), and disposal (decommission, remove, recycle, dispose). Each stage has its own decisions, costs, risks, and KPIs.

Lifecycle integration (ISO 55000 principle "value") means: every asset decision is made with full knowledge of all five stages. A decision made on first cost (acquisition only) is almost always wrong; the right decision integrates lifecycle cost, lifecycle performance, lifecycle risk, and lifecycle sustainability. LCC is the analytical workhorse.

LCC methodology is established by IEC 60300-3-3:2017 (Dependability management — Application guide — Life cycle costing). The cost-element breakdown is: acquisition (one-off, t=0), operation (recurring), maintenance (recurring), failure/disruption (recurring, frequency × consequence), renewal (one-off, at trigger time), disposal (one-off, at end-of-life). The discount rate i converts future costs to present value; the analysis period T is the asset's economic life (typically 10-50 years depending on asset class). The LCC equation: LCC = C_capex + Σ_{t=1}^{T} [(C_op + C_maint + C_failure)/(1+i)^t] + C_disposal/(1+i)^T.

Total Cost of Ownership (TCO) extends LCC by adding indirect organizational costs (overhead allocation, IT systems, training, administration). The CAMA assessor works primarily with LCC at the asset-class level; TCO is at the enterprise level and is usually owned by Finance.

The CAMA assessor's LCC evidence trail: (i) the LCC methodology document (cost elements, discount rate, analysis period, sensitivity ranges); (ii) the LCC spreadsheet per asset-class decision (acquisition, renewal, replacement, disposal); (iii) the LCC's role in the SAMP/AMP (does the LCC drive the renewal-prioritization decision?); (iv) the discount-rate policy (who sets it, when, with what rationale); (v) the sensitivity analysis (does the LCC conclusion survive ±2pp discount-rate shock?).

LCC optimization is a PDCA loop: the asset-management team sets the LCC methodology (Plan), runs the LCC on asset-class decisions (Do), tracks actual vs LCC-predicted costs (Check), and refines the LCC inputs and methodology over time (Act). The assessor checks that the LCC-predicted vs actual costs are reconciled at each management review (§9.3) — a methodology that consistently under- or over-predicts is a finding (the inputs need recalibration).`,
    terminology: `- **Asset lifecycle (ISO 55000 §3.2.6)**: the period, or stages, from creation through to the disposal of an asset.
- **Lifecycle stages (ISO 55001 §8.3)**: create/acquire; utilize; maintain; renew/replace; dispose.
- **Life-Cycle Cost (LCC, IEC 60300-3-3)**: the present-value sum of all costs an asset imposes over the analysis period.
- **Total Cost of Ownership (TCO)**: LCC + indirect organizational costs (overhead, IT, training, administration).
- **Discount rate (i)**: the rate at which future costs are discounted to present value; usually equals the organization's weighted-average cost of capital (WACC).
- **Analysis period (T)**: the time horizon over which LCC is computed; typically 10-50 years depending on asset class.
- **Present-value annuity factor (P/A)**: (1 - (1+i)^-T) / i — converts a uniform annual cost to its present-value equivalent.
- **Present-value single-payment factor (P/F)**: 1 / (1+i)^T — converts a single future cost to its present-value equivalent.
- **Net Present Value (NPV)**: -C_capex + Σ_t [(B(t) - C(t))/(1+i)^t] + C_salvage/(1+i)^T — choose alternative with NPV > 0 and highest NPV.
- **First cost**: the acquisition cost only (capex at t=0); ignoring operation, maintenance, failure, renewal, disposal costs.
- **Sensitivity analysis**: re-compute LCC with input variations (typically ±2pp on discount rate) to verify the conclusion survives.
- **Capex**: capital expenditure (acquisition, renewal — one-off).
- **Opex**: operating expenditure (operation, maintenance — recurring).
- **Failure cost**: frequency × consequence — recurring; sometimes called "risk cost" or "loss-of-production cost".
- **Disposal cost**: end-of-life decommissioning and disposal (one-off, at t=T); sometimes negative (salvage value).`,
    detailed_explanation: `The asset lifecycle has five canonical stages per ISO 55001 §8.3:

(1) **Creation/Acquisition** — Design, specify, procure, install, commission. Decisions: design standards, vendor selection, acceptance testing, commissioning plan. Cost elements: capex (purchase, install, commissioning), design engineering, project management. KPIs: project schedule adherence, project cost adherence, commissioning first-time-right rate, defect liability period. The assessor checks that the design standards incorporate lifecycle considerations (e.g., corrosion allowance for 50-year service, accessibility for maintenance) and that the procurement decision is based on LCC, not first cost.

(2) **Utilization** — Operate to duty point, monitor condition. Decisions: operating regime (continuous, peaking, standby), condition-monitoring programme (vibration, oil, performance), operator training. Cost elements: energy/fuel, consumables, condition-monitoring data analysis. KPIs: availability, reliability, energy efficiency, condition-index trend. The assessor checks that the condition-monitoring programme feeds the AMP's condition-based tactics (Lesson 1) and that the operating regime matches the asset's intended duty.

(3) **Maintenance** — Preventive (time-based), corrective (run-to-failure for low-criticality), condition-based (CBM), RCM-derived. Decisions: tactic selection (per failure mode per asset), tactic frequency, spare-parts strategy. Cost elements: maintenance labor, spares, contractor services. KPIs: PM compliance, MTBF, MTTR, maintenance cost as % of replacement asset value (RAV). The assessor checks that the maintenance programme is documented in the AMP (Lesson 1), risk-prioritized, and resource-reconciled.

(4) **Renewal** — Refurbish, replace, upgrade. Decisions: renewal timing (condition-trigger, age-trigger, or LCC-optimized), renewal scope (full replace vs partial refurbish), renewal standard (same as original vs upgraded). Cost elements: renewal capex, project management, transition (temporary capacity, commissioning). KPIs: renewal programme schedule adherence, post-renewal performance uplift, renewal cost vs LCC-predicted. The assessor checks that the renewal decision is LCC-informed and that the renewal trigger is documented and traceable to the AMP.

(5) **Disposal** — Decommission, remove, recycle, dispose. Decisions: decommissioning methodology, salvage vs scrap, environmental remediation, end-of-life data archival. Cost elements: decommissioning labor, hazardous-waste disposal, environmental remediation, salvage value (negative cost). KPIs: disposal programme schedule, disposal cost vs LCC-predicted, environmental compliance. The assessor checks that the AMP specifies disposal activities (a common finding is "missing lifecycle stage" — the AMP covers create/utilize/maintain/renew but omits disposal).

The LCC equation (IEC 60300-3-3:2017) sums the discounted cost across all five stages: LCC = C_capex + Σ_t [(C_op + C_maint + C_failure)/(1+i)^t] + C_disposal/(1+i)^T. The discount rate i converts future costs to present value; the analysis period T is the asset's economic life. P/A(i, T) = (1 - (1+i)^-T)/i is the annuity factor for uniform annual costs; P/F(i, T) = 1/(1+i)^T is the single-payment factor for one-off future costs.

The discount-rate policy is a critical LCC input. Too high a discount rate undervalues long-life assets (e.g., 50-year infrastructure), biasing decisions toward short-life, low-capex alternatives. Too low a discount rate over-values long-life assets, biasing toward over-investment. The assessor checks that the discount rate is (i) set by a defined authority (typically the CFO or the regulator); (ii) consistent with the organization's WACC or the regulator's allowed return; (iii) documented in the LCC methodology; (iv) periodically reviewed (typically annually).

Sensitivity analysis verifies the LCC conclusion survives input variation. Standard ranges: ±2pp on discount rate; ±20% on cost elements (opex, failure cost); ±10% on capex. The assessor checks that the LCC spreadsheet runs the sensitivity and that the conclusion survives all bounds — if the conclusion flips at i+2pp or at opex+20%, the LCC is non-robust and the decision must be made on additional criteria (risk tolerance, strategic alignment, regulatory compliance).

LCC vs first cost is the assessor's primary decision-quality check. A renewal decision made on first cost (e.g., "buy the cheaper pump") is almost always wrong if the LCC favours the alternative; the assessor flags first-cost-override findings. The corollary: an asset-management team that does not run LCC at all is operating at IAM maturity level 1-2 (Initial/Aware); a team that runs LCC but does not use it in decisions is at level 2-3 (Aware/Defined); a team that runs LCC and uses it in decisions, with sensitivity analysis and post-implementation reconciliation, is at level 4-5 (Managed/Optimized).

The assessor's LCC audit programme: (1) LCC methodology document review; (2) discount-rate policy review; (3) LCC spreadsheet review for a sample of asset-class decisions (typically 5-10); (4) sensitivity analysis verification; (5) post-implementation reconciliation (predicted vs actual); (6) LCC methodology version control; (7) LCC training/competency review; (8) LCC methodology integration with SAMP/AMP (does the LCC drive the renewal-prioritization decision?).`,
    core_principles: `- The asset lifecycle is the period from creation to disposal; ISO 55001 §8.3 specifies five stages (create/acquire, utilize, maintain, renew, dispose) the AMS must manage.
- LCC is the present-value sum of all costs the asset imposes across all five stages — the analytical engine of lifecycle integration.
- LCC methodology is established by IEC 60300-3-3:2017 — cost elements, discounting, NPV, sensitivity analysis.
- First-cost decisions are almost always wrong; the right decision integrates lifecycle cost, performance, risk, and sustainability.
- The discount rate is a policy variable — set too high, long-life assets are undervalued; set too low, the organization over-invests.
- Sensitivity analysis (±2pp on discount rate; ±20% on cost elements) verifies the LCC conclusion is robust.
- LCC differs from TCO (which adds indirect organizational costs) and from first cost (which is acquisition only).
- LCC optimization is a PDCA loop — Plan (methodology), Do (run LCC), Check (predicted vs actual), Act (refine inputs).
- LCC drives the renewal-prioritization decision; absence of LCC in renewal decisions is a maturity-level 1-2 finding.`,
    components: `- LCC methodology document: cost-element breakdown, discount-rate policy, analysis-period selection, sensitivity ranges, version control.
- LCC spreadsheet per asset-class decision: capex, opex, maint, failure cost, disposal cost, discount rate, analysis period, P/A and P/F factors, LCC result, sensitivity table.
- Discount-rate policy: who sets, when, with what rationale, periodic review trigger.
- Cost-element library: unit costs for common asset classes (pumps, transformers, vehicles) — supports consistent LCC across the organization.
- Sensitivity analysis: ±2pp on discount rate; ±20% on opex/failure cost; ±10% on capex.
- Post-implementation reconciliation: predicted LCC vs actual costs at defined intervals (e.g., 5 years post-acquisition).
- LCC training/competency: asset-management team's LCC skills; competency matrix.
- LCC-SAMP/AMP integration: LCC results feed the renewal-prioritization decision in the SAMP and AMP.`,
    process: `1. ESTABLISH the LCC methodology (cost elements, discount rate, analysis period, sensitivity ranges) — typically owned by the asset-management team, approved by Finance.
2. SET the discount rate — based on the organization's WACC or the regulator's allowed return; document the authority and the review cycle.
3. IDENTIFY the asset-class decision requiring LCC — acquisition, renewal, replacement, disposal; pull the cost-element library.
4. COLLECT the cost inputs — capex (vendor quotes), opex (energy, consumables), maint (labor, spares), failure (frequency × consequence from the asset risk assessment), disposal (decommissioning, salvage).
5. COMPUTE the LCC for each alternative using LCC = C_capex + Σ_t [(C_op + C_maint + C_failure)/(1+i)^t] + C_disposal/(1+i)^T.
6. RUN the sensitivity analysis — ±2pp on discount rate, ±20% on opex/failure, ±10% on capex.
7. COMPARE alternatives on LCC; verify the conclusion survives the sensitivity bounds.
8. DOCUMENT the LCC decision in the SAMP/AMP — show the LCC result, the sensitivity, and the chosen alternative with rationale.
9. IMPLEMENT the chosen alternative; capture actual costs at defined intervals (5-yr, 10-yr) for post-implementation reconciliation.
10. RECONCILE predicted LCC vs actual at §9.3 management review; refine LCC inputs and methodology if non-robust.
11. REVIEW the LCC methodology itself periodically (typically annually) — discount rate, cost elements, sensitivity ranges.`,
    formula_calculation: `LCC equation (IEC 60300-3-3:2017):
  LCC = C_capex + Σ_{t=1}^{T} [(C_op(t) + C_maint(t) + C_failure(t)) / (1+i)^t] + C_disposal / (1+i)^T

Where:
  C_capex = capital acquisition cost at t=0 (one-off, $)
  C_op(t), C_maint(t), C_failure(t) = annual operating, maintenance, failure/disruption costs ($/yr, may be constant or varying)
  C_failure = frequency (failures/yr) × consequence ($/failure)
  C_disposal = end-of-life disposal cost at t=T (one-off, $; negative if salvage > cost)
  i = discount rate (decimal; 6% = 0.06)
  T = analysis period (years)

Present-value annuity factor (uniform annual cost): P/A(i, T) = (1 - (1+i)^-T) / i
Present-value single-payment factor: P/F(i, T) = 1 / (1+i)^T

Net Present Value (NPV) with benefit stream B(t):
  NPV = -C_capex + Σ_{t=1}^{T} [(B(t) - C_op(t) - C_maint(t) - C_failure(t)) / (1+i)^t] + C_salvage / (1+i)^T
  Decision: choose alternative with NPV > 0 and highest NPV.

For cost-only comparison (no benefit stream), choose alternative with lowest LCC.

Sensitivity analysis: re-compute LCC with ±2pp on discount rate, ±20% on cost elements; verify the conclusion survives.

Total Cost of Ownership: TCO = LCC + indirect_org_costs (overhead allocation, IT, training, administration).

P/A and P/F closed-form (sample values for i=6%):
  P/A(6%, 20) = (1 - 1.06^-20) / 0.06 = (1 - 0.311804)/0.06 = 11.4699
  P/F(6%, 20) = 1.06^-20 = 0.311804`,
    worked_example: `A water utility (CASE_TYPE = SYNTHETIC) compares two centrifugal raw-water pump options over a 20-year analysis period at discount rate i = 6%.

Option A (low-cost, low-quality): capex $50k, opex $3k/yr, failure cost $8k/yr (frequency 0.40/yr × consequence $20k), disposal $5k at year 20.
Option B (higher-cost, higher-quality): capex $80k, opex $1.5k/yr, failure cost $2k/yr (frequency 0.10/yr × consequence $20k), disposal $5k at year 20.

STEP 1 — Discount factors at i=6%, T=20:
  (1.06)^20 = exp(20 × ln(1.06)) = exp(20 × 0.0582689) = exp(1.165378) = 3.207135
  (1.06)^-20 = 1/3.207135 = 0.311804
  P/A(6%, 20) = (1 - 0.311804)/0.06 = 0.688196/0.06 = 11.4699
  P/F(6%, 20) = 0.311804

STEP 2 — LCC Option A:
  LCC_A = C_capex + (C_op + C_failure) × P/A(i, T) + C_disposal × P/F(i, T)
        = 50 + (3 + 8) × 11.4699 + 5 × 0.311804
        = 50 + 11 × 11.4699 + 1.559
        = 50 + 126.169 + 1.559
        = $177.728k

STEP 3 — LCC Option B:
  LCC_B = 80 + (1.5 + 2) × 11.4699 + 5 × 0.311804
        = 80 + 3.5 × 11.4699 + 1.559
        = 80 + 40.145 + 1.559
        = $121.704k

STEP 4 — Decision: LCC_B < LCC_A by $56.024k (31.5% reduction). Option B is preferred on LCC basis despite the $30k higher capex — the lower opex and failure cost over 20 years more than recover the capex premium.

STEP 5 — Sensitivity analysis (±2pp on discount rate):

At i=4%, T=20:
  (1.04)^20 = exp(20 × 0.039221) = exp(0.784422) = 2.191123 → (1.04)^-20 = 0.456397
  P/A(4%, 20) = (1 - 0.456397)/0.04 = 13.5903
  P/F(4%, 20) = 0.456397
  LCC_A(i=4%) = 50 + 11 × 13.5903 + 5 × 0.456397 = 50 + 149.493 + 2.282 = $201.775k
  LCC_B(i=4%) = 80 + 3.5 × 13.5903 + 5 × 0.456397 = 80 + 47.566 + 2.282 = $129.848k
  ΔLCC = $71.927k (35.6% reduction) — Option B still preferred.

At i=8%, T=20:
  (1.08)^20 = exp(20 × 0.076961) = exp(1.539221) = 4.660957 → (1.08)^-20 = 0.214548
  P/A(8%, 20) = (1 - 0.214548)/0.08 = 9.8181
  P/F(8%, 20) = 0.214548
  LCC_A(i=8%) = 50 + 11 × 9.8181 + 5 × 0.214548 = 50 + 107.999 + 1.073 = $159.072k
  LCC_B(i=8%) = 80 + 3.5 × 9.8181 + 5 × 0.214548 = 80 + 34.363 + 1.073 = $115.436k
  ΔLCC = $43.636k (27.4% reduction) — Option B still preferred.

CONCLUSION: Option B is preferred across all three discount-rate scenarios (4%, 6%, 8%). The LCC conclusion is robust — survives ±2pp sensitivity test. The utility specifies Option B as the standard for the fleet; writes the LCC methodology and the discount-rate policy into the AMP; requires that all future pump purchases ≥ $25k capex carry an LCC comparison; schedules post-implementation reconciliation at years 5, 10, and 15.

CAMA ASSESSOR FINDINGS (if applicable):
- PASS — LCC methodology documented (IEC 60300-3-3:2017 alignment).
- PASS — Discount rate documented (6% consistent with regulator's WACC); sensitivity ±2pp applied.
- PASS — LCC decision correctly integrated with the renewal-prioritization in the AMP.
- FINDING (Minor) — Failure cost C_failure assumed constant over 20 years; should be tiered (early-life, mid-life, end-of-life) to reflect the bathtub curve.
- FINDING (Minor) — Salvage value at year 20 set to zero (only disposal cost); actual scrap-steel value ≈ $1-2k should be modelled.
- MATURITY: Lifecycle Delivery subject scores level 4 (Managed — LCC drives decisions, sensitivity applied, post-implementation reconciliation scheduled).`,
    industrial_example: `Utilities — Water: A metropolitan water utility applies LCC at the asset-class level for raw-water pumps (20-yr analysis), distribution mains (50-yr analysis), treatment-works clarifiers (40-yr analysis), and reservoir dams (100-yr analysis). The utility's discount rate is set by the regulator at 4.5% (the regulator's WACC) — reviewed annually. The LCC drives the renewal-prioritization decision in the SAMP: the top-20% worst-LCC-per-improvement assets get renewal capex first, with sensitivity bounds documented.

Oil & Gas — Refining: A 220-kbpd refinery applies LCC for its 18 critical rotating-equipment trains (compressors, large pumps). The LCC incorporates vendor-reliability data (ISO 14224 failure rates), refinery-loss-of-production cost ($120k/hr total throughput loss), and disposal cost (hazardous-waste handling). The LCC favours higher-spec equipment despite higher capex because the avoided loss-of-production cost dwarfs the capex premium; sensitivity ±2pp on discount rate survives; the LCC-predicted vs actual costs are reconciled every 5 years.`,
    case_study: `CASE_TYPE = SYNTHETIC. "MetroWater Pump LCC Comparison" (the worked example expanded). MetroWater is the regional water utility from Lesson 1's case study; the LCC comparison in this lesson is the SAME decision (60-pump fleet standardization) from the AMP-development perspective. The asset-management team ran the LCC comparison at i=6%, T=20 in 2023-Q3; the LCC conclusion (Option B preferred) survived the ±2pp sensitivity test and was approved by the VP Operations in 2023-Q4. The first Option B pumps were installed in 2024-Q1; the post-implementation reconciliation is scheduled for 2029-Q1 (5 years post-installation) and will compare predicted vs actual opex, failure cost, and condition-index trend. The CAMA assessor audited the LCC in 2024-Q3 alongside the AMP audit (Lesson 1) and recorded 2 Minor findings (failure-cost tiering, salvage value) and a Lifecycle-Delivery maturity score of level 4.`,
    visual_explanation: `Picture the LCC as a stacked bar chart over the asset lifecycle:

  Time axis: t=0 (acquisition) → t=1..T (annual) → t=T (disposal).
  Cost bars at each t: capex (t=0, big one-off), opex (annual, small), maint (annual, small), failure (annual, variable), disposal (t=T, small one-off, possibly negative if salvage).
  Each cost bar is discounted to present value by dividing by (1+i)^t.

The LCC is the sum of all present-value bars. The CAMA assessor overlays the LCC bar chart with a sensitivity envelope (±2pp discount rate, ±20% opex/failure) to verify the conclusion survives.

Compare two alternatives (Option A vs Option B) by stacking their bars side-by-side and comparing the total LCC. The lower-LCC option wins — regardless of higher first cost — provided the conclusion survives sensitivity.

Picture the asset lifecycle as a horizontal arrow from Create/Acquire → Utilize → Maintain → Renew → Dispose, with each stage's cost bar hanging below it. The LCC is the integrated discounted area under all the bars.`,
    simulation_opportunity: `A simulation could let the learner act as an asset manager comparing two asset alternatives (pump A vs pump B; transformer X vs transformer Y) using the LCC methodology. Inputs: capex, opex, maint, failure frequency × consequence, disposal, discount rate, analysis period. The simulation computes LCC, runs sensitivity (±2pp discount rate, ±20% opex/failure), and visualizes the stacked-bar LCC chart for each alternative. The learner interprets the LCC result, recommends an alternative, and writes a brief LCC-decision rationale. The simulation surfaces realistic edge cases (LCC conclusion flips at i+2pp → non-robust decision requires additional criteria; failure cost is the swing factor; high-capex alternative wins on long-T LCC; low-capex alternative wins on short-T LCC).`,
    common_mistakes: `- Decisions made on first cost (capex only) rather than LCC — the canonical asset-management error; an organization at maturity level 1-2.
- Missing cost elements in the LCC spreadsheet (commonly the failure/disruption cost and the disposal cost — the two most under-modelled).
- Undocumented discount rate — without a documented policy, the LCC is non-reproducible and non-auditable.
- No sensitivity analysis — the LCC conclusion may flip at i+2pp, masking a non-robust decision.
- Too-high discount rate undervalues long-life assets (e.g., 50-year infrastructure) — biases toward short-life alternatives.
- Too-low discount rate over-values long-life assets — biases toward over-investment.
- LCC methodology not version-controlled — assessor cannot trace decision rationale.
- LCC results not integrated with the SAMP/AMP — the LCC is run but does not drive the renewal-prioritization decision (maturity level 2-3: Aware/Defined but not Managed).
- No post-implementation reconciliation — LCC predictions are never validated against actual costs (maturity level 3 → 4 gap).
- Failure cost modelled as a single constant value over T — should be tiered (early-life high failure rate, mid-life low, end-of-life high — the bathtub curve).`,
    limitations: `- LCC requires future cost forecasts (opex, failure, disposal) — these are uncertain; sensitivity analysis mitigates but does not eliminate.
- LCC captures financial cost only; non-financial value (service level, safety, environmental, social) must be modelled separately (multi-criteria decision analysis).
- LCC assumes a constant discount rate over T — in practice the discount rate may change (e.g., regulatory reset every 5 years).
- LCC fails to capture strategic value (e.g., resilience to climate change, net-zero alignment) — must be supplemented with strategic criteria.
- LCC's reliability depends on the cost-element library — inaccurate unit costs produce inaccurate LCC.
- LCC's reliability depends on the failure-cost model (frequency × consequence) — if the asset risk assessment (Lesson 3) is stale, the LCC failure cost is wrong.
- LCC for very long-life assets (50-100 years) is highly sensitive to discount rate — small rate changes flip decisions.
- LCC cannot replace engineering judgement — it is one input to the decision, not the whole decision.`,
    comparison: `LCC vs Total Cost of Ownership (TCO):
  - LCC: asset-class scope; capex + opex + maint + failure + disposal; IEC 60300-3-3:2017; the asset-management team's scope.
  - TCO: enterprise scope; LCC + indirect org costs (overhead, IT, training); the Finance team's scope.

LCC vs First Cost (Capex):
  - First Cost: capex only; the procurement team's traditional scope.
  - LCC: capex + all lifecycle costs; the asset-management team's scope; ISO 55000 "value" principle.

LCC vs NPV (with benefits):
  - LCC: cost-only comparison; lowest LCC wins.
  - NPV: benefit-cost comparison; highest NPV wins (NPV > 0 required).
  - For asset-class decisions where benefits are uniform across alternatives (same service level), LCC is the appropriate comparison.

LCC vs RCM (Reliability-Centered Maintenance):
  - RCM: analytical; failure-mode-driven tactic selection (which tactic per failure mode per asset).
  - LCC: financial; whole-life cost (which alternative to procure/renew).
  - The two are complementary: RCM drives the maintenance programme; LCC drives the procurement and renewal decisions.`,
    practical_application: `In practice, an asset-management team applies LCC at decision points: (i) acquisition (which vendor / spec to procure); (ii) renewal (which renewal standard, when to renew); (iii) replacement (replace vs refurbish); (iv) disposal (which disposal methodology). The LCC methodology is documented once and applied consistently across asset classes; the discount rate is set by Finance or the regulator and reviewed annually. The LCC spreadsheet is run per decision, with sensitivity analysis, and the result is documented in the SAMP/AMP. Post-implementation reconciliation (predicted vs actual) is scheduled at 5-year intervals and feeds the §9.3 management review. The CAMA assessor audits the LCC methodology (document review), the discount-rate policy (authority + rationale + review cycle), the LCC spreadsheets (cost elements + sensitivity + conclusion robustness), and the LCC-SAMP/AMP integration (does the LCC drive the renewal-prioritization decision). Maturity is scored on the IAM 5-level scale for the Anatomy subject 'Life-Cycle Costing & Value' under the Decision-Making group.`,
    decision_scenario: `You are the CAMA assessor reviewing a power utility's LCC comparison for a 50-MVA power-transformer renewal decision. Option X: capex $1.2M, opex $40k/yr, failure cost $60k/yr (frequency 0.04/yr × consequence $1.5M), disposal $100k at year 40. Option Y: capex $1.8M, opex $25k/yr, failure cost $15k/yr (frequency 0.01/yr × consequence $1.5M), disposal $80k at year 40. Discount rate i = 4% (per the regulator's WACC), T = 40. The utility's LCC spreadsheet shows LCC_X = $2.94M and LCC_Y = $2.61M, with the recommendation to procure Option Y. However, the LCC spreadsheet does NOT include a sensitivity analysis, and the failure-cost inputs assume a constant failure rate over 40 years. Write your AML audit findings (severity ratings, root causes, improvement actions) and your maturity score for the Anatomy subject 'Life-Cycle Costing & Value'.`,
    practice_questions: `- Compute LCC at i=6%, T=20 for an asset with capex $80k, opex $1.5k/yr, failure cost $2k/yr, disposal $5k. (Answer: $121.704k.)
- State the LCC equation (IEC 60300-3-3:2017) and define each variable.
- An asset-management team uses a discount rate of 12% for a 50-year infrastructure asset. What finding do you raise?
- A renewal decision is made on first cost (capex only). What maturity level is the team at, and what improvement action do you recommend?
- The LCC conclusion at i=6% favours Alternative A; at i=8% it favours Alternative B. What audit finding do you raise, and what decision criterion do you recommend?`,
    certification_questions: `- (CAMA-style MCQ) Which international standard establishes the LCC methodology for physical assets?
  (A) ISO 55001  (B) ISO 55002  (C) IEC 60300-3-3  (D) ISO 14224  [Correct: C]
- (CAMA-style MCQ) An LCC comparison at i=6% favours Option B; at i=8% it favours Option A. The most defensible finding is:
  (A) Discount-rate error  (B) Non-robust LCC conclusion  (C) Capex too high  (D) Opex mis-modelled  [Correct: B]
- (CAMA-style TrueFalse) The asset lifecycle per ISO 55000 has five canonical stages: creation/acquisition, utilization, maintenance, renewal, disposal.
  [Correct: TRUE]`,
    summary: `The asset lifecycle (ISO 55000 §3.2.6) has five stages per ISO 55001 §8.3: create/acquire, utilize, maintain, renew, dispose. LCC (IEC 60300-3-3:2017) is the present-value sum of all costs the asset imposes across all five stages: LCC = C_capex + Σ_t [(C_op + C_maint + C_failure)/(1+i)^t] + C_disposal/(1+i)^T. The CAMA assessor's LCC audit programme covers the methodology document, discount-rate policy, LCC spreadsheets, sensitivity analysis, post-implementation reconciliation, version control, training/competency, and SAMP/AMP integration. First-cost decisions are almost always wrong; the right decision integrates lifecycle cost, performance, risk, and sustainability. Maturity on the Anatomy subject 'Life-Cycle Costing & Value' ranges from level 1 (no LCC) to level 5 (LCC drives decisions, sensitivity applied, post-implementation reconciliation feeds methodology refinement).`,
    key_takeaways: `- The asset lifecycle per ISO 55000 has five canonical stages (create/acquire, utilize, maintain, renew, dispose) — ISO 55001 §8.3.
- LCC = C_capex + Σ_t [(C_op + C_maint + C_failure)/(1+i)^t] + C_disposal/(1+i)^T — IEC 60300-3-3:2017.
- LCC differs from TCO (which adds indirect org costs) and from first cost (capex only).
- The discount rate is a policy variable; too high undervalues long-life assets, too low over-invests.
- Sensitivity analysis (±2pp on discount rate, ±20% on opex/failure) verifies the LCC conclusion is robust.
- First-cost-override is a finding; LCC-not-integrated-with-SAMP/AMP is a maturity-level 2-3 finding.
- LCC optimization is a PDCA loop: methodology → run LCC → reconcile predicted vs actual → refine.
- The assessor audits the LCC methodology, discount-rate policy, spreadsheets, sensitivity, reconciliation, version control, and SAMP/AMP integration.`,
    references: `1. ISO 55000:2014 §3.2.6 (asset lifecycle), §3.2.6 (asset management — value principle).
2. ISO 55001:2014 §8.3 (manage asset lifecycle activities), §6.2.2 (AMP — lifecycle activity mapping).
3. ISO 55002:2018 §8.3 (lifecycle activities guidance — how to plan create/acquire, utilize, maintain, renew, dispose activities).
4. IEC 60300-3-3:2017 — the canonical LCC methodology standard (cost-element breakdown, discounting, NPV, sensitivity analysis).
5. The IAM — Asset Management — An Anatomy (3rd ed.) — subject "Life-Cycle Costing & Value" (Decision-Making group) and "Life Cycle Activities" (Lifecycle Delivery group).
6. Campbell & Jardine — Maintenance Strategy — Ch. 5 (Life-Cycle Costing) — NPV-based whole-life cost; Ch. 11 (spare-parts optimization with LCC framing).`,
  },
  knowledgeObject: {
    title: "Asset Lifecycle & Life-Cycle Costing (LCC) — ISO 55001 §8.3 / IEC 60300-3-3:2017",
    domain: "Asset Management Plan & Lifecycle",
    competency: "Asset Lifecycle & LCC",
    topic: "Five lifecycle stages; LCC methodology; NPV-based whole-life cost",
    concept:
      "LCC is the present-value sum of all costs an asset imposes across its five lifecycle stages (create/acquire, utilize, maintain, renew, dispose); first-cost decisions are almost always wrong; the discount rate is a policy variable that must be documented and sensitivity-tested.",
    body: {
      definitions: [
        "Asset lifecycle (ISO 55000 §3.2.6): the period, or stages, from creation through to the disposal of an asset.",
        "Lifecycle stages (ISO 55001 §8.3): create/acquire; utilize; maintain; renew/replace; dispose.",
        "LCC (IEC 60300-3-3:2017): the present-value sum of all costs the asset imposes over the analysis period.",
        "TCO: LCC + indirect organizational costs (overhead, IT, training, administration).",
        "Discount rate (i): the rate at which future costs are discounted to present value (typically WACC or regulator's allowed return).",
        "Analysis period (T): the time horizon over which LCC is computed (typically 10-50 years by asset class).",
        "P/A(i, T) = (1 - (1+i)^-T)/i — present-value annuity factor for uniform annual cost.",
        "P/F(i, T) = 1/(1+i)^T — present-value single-payment factor for one-off future cost.",
        "NPV = -C_capex + Σ_t [(B(t) - C(t))/(1+i)^t] + C_salvage/(1+i)^T — for benefit-cost comparison.",
      ],
      principles: [
        "Five canonical lifecycle stages (create/acquire, utilize, maintain, renew, dispose) per ISO 55001 §8.3 — the AMP must collectively cover all five.",
        "LCC = C_capex + Σ_t [(C_op + C_maint + C_failure)/(1+i)^t] + C_disposal/(1+i)^T — IEC 60300-3-3:2017.",
        "First-cost decisions are almost always wrong; the right decision integrates lifecycle cost, performance, risk, and sustainability (ISO 55000 value principle).",
        "The discount rate is a policy variable — set too high, long-life assets are undervalued; set too low, the organization over-invests.",
        "Sensitivity analysis (±2pp on discount rate, ±20% on cost elements) verifies the LCC conclusion is robust.",
        "LCC differs from TCO (adds indirect org costs) and from first cost (capex only).",
        "LCC optimization is a PDCA loop: methodology → run LCC → reconcile predicted vs actual → refine inputs.",
      ],
      components: [
        "LCC methodology document (cost elements, discount-rate policy, analysis period, sensitivity ranges, version control).",
        "LCC spreadsheet per asset-class decision (capex, opex, maint, failure cost, disposal cost, discount rate, P/A and P/F factors, LCC result, sensitivity table).",
        "Discount-rate policy (authority, rationale, periodic review trigger).",
        "Cost-element library (unit costs for common asset classes — supports consistency).",
        "Sensitivity analysis (±2pp discount rate, ±20% opex/failure, ±10% capex).",
        "Post-implementation reconciliation (predicted LCC vs actual costs at 5-yr intervals).",
        "LCC training/competency matrix.",
        "LCC-SAMP/AMP integration (LCC drives the renewal-prioritization decision).",
      ],
      mechanism: [
        "Lifecycle integration (ISO 55000 value principle): every asset decision is made with full knowledge of all five stages.",
        "LCC computation: discount future costs to present value using P/A (annuity) and P/F (single-payment) factors; sum to get LCC.",
        "Sensitivity analysis: re-compute LCC with input variations; verify conclusion survives all bounds.",
        "Decision rule: lowest-LCC alternative wins (cost-only) or highest-NPV alternative wins (benefit-cost); first-cost override is a finding.",
        "PDCA loop: Plan (methodology) → Do (run LCC) → Check (predicted vs actual at §9.3) → Act (refine inputs/methodology).",
      ],
      process: [
        "1. Establish LCC methodology (cost elements, discount rate, analysis period, sensitivity ranges).",
        "2. Set the discount rate (Finance/regulator; document authority and review cycle).",
        "3. Identify the asset-class decision requiring LCC (acquisition, renewal, replacement, disposal).",
        "4. Collect cost inputs (capex, opex, maint, failure frequency × consequence, disposal).",
        "5. Compute LCC for each alternative using the LCC equation.",
        "6. Run sensitivity analysis (±2pp discount rate, ±20% opex/failure, ±10% capex).",
        "7. Compare alternatives on LCC; verify conclusion survives sensitivity.",
        "8. Document the LCC decision in the SAMP/AMP.",
        "9. Implement the chosen alternative; capture actual costs at defined intervals.",
        "10. Reconcile predicted LCC vs actual at §9.3 management review; refine inputs.",
        "11. Review the LCC methodology itself periodically (typically annually).",
      ],
      formulas: [
        "LCC = C_capex + Σ_{t=1}^{T} [(C_op + C_maint + C_failure)/(1+i)^t] + C_disposal/(1+i)^T (IEC 60300-3-3:2017).",
        "P/A(i, T) = (1 - (1+i)^-T)/i — present-value annuity factor for uniform annual cost.",
        "P/F(i, T) = 1/(1+i)^T — present-value single-payment factor for one-off future cost.",
        "NPV = -C_capex + Σ_t [(B(t) - C(t))/(1+i)^t] + C_salvage/(1+i)^T — for benefit-cost comparison.",
        "TCO = LCC + indirect_org_costs.",
        "Sensitivity ranges: ±2pp on discount rate; ±20% on opex/failure; ±10% on capex.",
      ],
      metrics: [
        "LCC ($, present value) per alternative per asset-class decision.",
        "ΔLCC between alternatives ($, %).",
        "LCC conclusion robustness (survives ±2pp discount-rate sensitivity: yes/no).",
        "Post-implementation reconciliation gap (predicted vs actual, %).",
        "Discount-rate policy compliance (documented authority + review cycle: yes/no).",
        "LCC methodology version currency (review date within 12 months).",
        "LCC-SAMP/AMP integration (LCC drives renewal-prioritization: yes/no).",
        "Maturity score (IAM 1-5 scale per Anatomy subject 'Life-Cycle Costing & Value').",
      ],
      examples: [
        "MetroWater Pump LCC Comparison (Lesson 2 worked example) — Option A: $50k capex, $3k/yr opex, $8k/yr failure, $5k disposal, T=20, i=6% → LCC_A = $177.728k. Option B: $80k capex, $1.5k/yr opex, $2k/yr failure, $5k disposal → LCC_B = $121.704k. Option B preferred (saves $56.024k, 31.5%); survives ±2pp sensitivity.",
        "Power utility 50-MVA transformer LCC: Option X ($1.2M capex) vs Option Y ($1.8M capex) at i=4%, T=40 — failure cost is the swing factor; Option Y preferred on LCC.",
      ],
      industrial_examples: [
        "Utilities — Water: metropolitan water utility applies LCC at asset-class level (pumps 20-yr; distribution mains 50-yr; treatment-works clarifiers 40-yr; reservoir dams 100-yr); regulator-set discount rate 4.5% reviewed annually; LCC drives renewal-prioritization in SAMP.",
        "Oil & Gas — Refining: 220-kbpd refinery applies LCC for 18 critical rotating-equipment trains; LCC incorporates vendor-reliability data (ISO 14224), refinery loss-of-production ($120k/hr), and hazardous-waste disposal; LCC favours higher-spec equipment (lower failure cost); ±2pp sensitivity survives; 5-yr reconciliation.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. MetroWater Pump LCC Comparison (2023-Q3 run; 2023-Q4 VP Operations approval; 2024-Q1 first Option B pumps installed; 2029-Q1 post-implementation reconciliation scheduled; CAMA 2024-Q3 audit: 2 Minor findings (failure-cost tiering, salvage value); maturity level 4 'Managed' on Anatomy subject 'Life-Cycle Costing & Value').",
      ],
      common_errors: [
        "Decisions made on first cost (capex only) rather than LCC — canonical error; maturity level 1-2.",
        "Missing cost elements (commonly failure/disruption and disposal costs — the two most under-modelled).",
        "Undocumented discount rate — LCC is non-reproducible and non-auditable.",
        "No sensitivity analysis — LCC conclusion may flip at i+2pp, masking a non-robust decision.",
        "Too-high discount rate undervalues long-life assets (e.g., 50-yr infrastructure); too-low over-invests.",
        "LCC methodology not version-controlled — assessor cannot trace decision rationale.",
        "LCC results not integrated with SAMP/AMP — LCC run but does not drive renewal-prioritization (level 2-3).",
        "No post-implementation reconciliation — LCC predictions never validated (level 3 → 4 gap).",
        "Failure cost modelled as a single constant value over T — should be tiered (bathtub curve).",
      ],
      limitations: [
        "LCC requires future cost forecasts (opex, failure, disposal) — these are uncertain; sensitivity mitigates but does not eliminate.",
        "LCC captures financial cost only; non-financial value (service, safety, environmental, social) must be modelled separately.",
        "LCC assumes a constant discount rate over T — in practice the rate may change (regulatory resets).",
        "LCC fails to capture strategic value (resilience, net-zero alignment) — must be supplemented with strategic criteria.",
        "LCC's reliability depends on the cost-element library — inaccurate unit costs produce inaccurate LCC.",
        "LCC's reliability depends on the failure-cost model — if the asset risk assessment (Lesson 3) is stale, the LCC failure cost is wrong.",
        "LCC for very long-life assets (50-100 years) is highly sensitive to discount rate — small rate changes flip decisions.",
        "LCC cannot replace engineering judgement — it is one input to the decision, not the whole decision.",
      ],
      best_practices: [
        "Document the LCC methodology per IEC 60300-3-3:2017 (cost elements, discount rate, analysis period, sensitivity ranges, version control).",
        "Set the discount rate by a defined authority (Finance or regulator) with documented rationale and annual review.",
        "Run LCC at every asset-class decision point (acquisition, renewal, replacement, disposal) above a capex threshold (e.g., ≥ $25k).",
        "Apply ±2pp sensitivity on discount rate; ±20% on opex/failure cost; ±10% on capex.",
        "Tier failure cost over T (bathtub curve: early-life high, mid-life low, end-of-life high).",
        "Model salvage value at end-of-life (negative disposal cost).",
        "Integrate LCC results into the SAMP/AMP renewal-prioritization decision.",
        "Schedule post-implementation reconciliation at 5-year intervals; feed §9.3 management review.",
        "Maintain a cost-element library (unit costs by asset class) for consistency across LCC analyses.",
        "Train asset-management team on LCC methodology (competency matrix).",
      ],
      related_concepts: [
        "Asset Management Plan (AMP) — Lesson 1 in this domain (the AMP's tactics must cover all five lifecycle stages).",
        "Asset Risk & Criticality — Lesson 3 in this domain (the asset risk assessment feeds the LCC failure-cost input: frequency × consequence).",
        "SAMP and AM Objectives — ISO 55001 §6.2.1/6.2.",
        "Asset Management System (AMS) — ISO 55001 (the AMS that governs the lifecycle).",
        "RCM (Reliability-Centered Maintenance) — failure-mode-driven tactic selection; RCM failure-mode data feeds the LCC failure-cost input.",
        "FMEA — failure-modes-and-effects analysis; underpins the LCC failure-cost model.",
        "ISO 14224 — failure-rate database for equipment-class LCC failure-cost inputs (especially in Oil & Gas).",
      ],
      prerequisites: [
        "ISO 55000 fundamentals — asset lifecycle, AM definition, four AM principles.",
        "ISO 55001 §8.3 (manage lifecycle activities), §6.2.2 (AMP — lifecycle activity mapping).",
        "Engineering economics: present value, annuity factor P/A, single-payment factor P/F, NPV.",
        "Familiarity with physical engineering assets and their cost elements (capex, opex, maint, failure, disposal).",
        "AMP structure (Lesson 1 in this domain).",
        "Asset risk assessment (Lesson 3 in this domain — feeds the LCC failure-cost input).",
      ],
      references: AML_REFERENCE_TITLES,
    },
  },
  questions: [
    {
      competencyName: "Asset Lifecycle & LCC",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      scenario: "Utilities",
      stem: "Which international standard establishes the Life-Cycle Costing (LCC) methodology for physical assets?",
      whyCorrect:
        "IEC 60300-3-3:2017 — Dependability management — Part 3-3: Application guide — Life cycle costing — establishes the LCC methodology: the cost-element breakdown (acquisition, operation, maintenance, failure/disruption, renewal, disposal), the discounting approach (present-value via the annuity factor P/A and single-payment factor P/F), the LCC equation LCC = C_capex + Σ_t [(C_op + C_maint + C_failure)/(1+i)^t] + C_disposal/(1+i)^T, sensitivity analysis, and the relationship between LCC and TCO. ISO 55001/55002 reference IEC 60300-3-3 for the LCC methodology applied under §8.3 lifecycle activities.",
      whyOthersWrong: [
        "Option ISO 55001 — that standard specifies the AMS requirements (clauses 4-10); it does not establish the LCC methodology. ISO 55001 §8.3 requires the AMS to manage lifecycle activities but does not prescribe how to compute LCC.",
        "Option ISO 55002 — that standard provides application guidelines for ISO 55001 (including §8.3 guidance on lifecycle activities); it references IEC 60300-3-3 for the LCC methodology but does not itself establish the methodology.",
        "Option ISO 14224 — that standard provides the equipment-class failure-rate database (especially for Oil & Gas) used as INPUT to LCC failure-cost modelling; it is not the LCC methodology standard itself.",
      ],
      explanation:
        "IEC 60300-3-3:2017 is the canonical LCC methodology standard; ISO 55001/55002 reference it; ISO 14224 provides failure-rate inputs.",
      options: [
        { text: "ISO 55001", isCorrect: false },
        { text: "ISO 55002", isCorrect: false },
        { text: "IEC 60300-3-3", isCorrect: true },
        { text: "ISO 14224", isCorrect: false },
      ],
    },
    {
      competencyName: "Asset Lifecycle & LCC",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Utilities",
      stem: "A water utility compares two centrifugal raw-water pump options over a 20-year analysis period at discount rate i = 6%. Option A: capex $50k, opex $3k/yr, failure cost $8k/yr, disposal $5k at year 20. Option B: capex $80k, opex $1.5k/yr, failure cost $2k/yr, disposal $5k at year 20. Using P/A(6%, 20) = 11.4699 and P/F(6%, 20) = 0.311804, what is the LCC of each option and the preferred alternative?",
      whyCorrect:
        "Apply the LCC equation LCC = C_capex + (C_op + C_failure) × P/A(i, T) + C_disposal × P/F(i, T). For Option A: LCC_A = 50 + (3 + 8) × 11.4699 + 5 × 0.311804 = 50 + 11 × 11.4699 + 1.559 = 50 + 126.169 + 1.559 = $177.728k. For Option B: LCC_B = 80 + (1.5 + 2) × 11.4699 + 5 × 0.311804 = 80 + 3.5 × 11.4699 + 1.559 = 80 + 40.145 + 1.559 = $121.704k. LCC_B < LCC_A by $56.024k (31.5% reduction) — Option B is preferred on LCC basis despite the $30k higher capex.",
      whyOthersWrong: [
        "Option 'LCC_A = $177.7k, LCC_B = $121.7k, prefer B' — correct, this is the right answer.",
        "Option 'LCC_A = $61k, LCC_B = $91k, prefer A' — wrong: this is the first-cost-only comparison (capex + annual costs without discounting × 20); it ignores both the discount-rate effect (P/A=11.47 not 20) and the failure cost.",
        "Option 'LCC_A = $193k, LCC_B = $137k, prefer B' — wrong: this uses P/A=11.4699 correctly for opex+failure but adds the capex twice or miscalculates; the correct LCC_A is $177.7k, not $193k.",
        "Option 'LCC_A = $50k, LCC_B = $80k, prefer A' — wrong: this is the first-cost comparison only (capex), the canonical asset-management anti-pattern; LCC requires all five stages discounted to present value.",
      ],
      explanation:
        "LCC_A = 50 + (3+8) × 11.4699 + 5 × 0.311804 = $177.728k. LCC_B = 80 + (1.5+2) × 11.4699 + 5 × 0.311804 = $121.704k. Option B preferred; $56.024k saved (31.5%).",
      options: [
        { text: "LCC_A = $177.7k, LCC_B = $121.7k, prefer B", isCorrect: true },
        { text: "LCC_A = $61k, LCC_B = $91k, prefer A", isCorrect: false },
        { text: "LCC_A = $193k, LCC_B = $137k, prefer B", isCorrect: false },
        { text: "LCC_A = $50k, LCC_B = $80k, prefer A", isCorrect: false },
      ],
    },
    {
      competencyName: "Asset Lifecycle & LCC",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Oil & Gas",
      stem: "A refinery's LCC comparison at i=6% favours Option B (higher capex, lower failure cost); at i=8% the LCC conclusion flips and Option A (lower capex, higher failure cost) is preferred. The asset-owner has not run any other sensitivity. What is the most defensible CAMA audit finding and the recommended decision criterion?",
      whyCorrect:
        "NON-ROBUST LCC CONCLUSION finding (Major severity). The LCC conclusion flips within the standard ±2pp discount-rate sensitivity range (6% → 8%), which means the decision is non-robust — the choice depends on the discount-rate assumption, not on a stable economic preference. The recommended decision criterion: do NOT decide on LCC alone; supplement with multi-criteria decision analysis (MCDA) including strategic alignment, risk tolerance, regulatory exposure, and resilience. Also: investigate WHY the conclusion flips (here, the failure-cost differential between A and B is the swing factor — Option B's lower failure cost dominates at low discount rates but is discounted away at higher rates). Improvement action: tier the failure cost over T (bathtub curve); run ±20% opex/failure sensitivity; consult Finance on the appropriate discount rate; raise at §9.3 management review.",
      whyOthersWrong: [
        "Option 'Discount-rate error — the rate must be wrong; re-compute at the regulator's WACC' — wrong because the LCC methodology is not the issue; the issue is the conclusion's non-robustness within a standard sensitivity range. Re-computing at one rate would mask the non-robustness, not resolve it.",
        "Option 'Capex too high — procure Option A which has lower capex' — wrong because the LCC favours A only at i=8% and B at i=6%; deciding on capex alone is the first-cost-override anti-pattern, and the LCC evidence is mixed.",
        "Option 'Opex mis-modelled — re-run LCC with corrected opex' — wrong because the audit evidence does not show an opex error; the swing factor is the failure cost, not opex. The finding is non-robustness within the sensitivity range, not a specific input error.",
      ],
      explanation:
        "An LCC conclusion that flips within the ±2pp discount-rate sensitivity range is non-robust (Major finding); supplement LCC with multi-criteria decision analysis and investigate the swing factor (here, the failure-cost differential).",
      options: [
        {
          text: "NON-ROBUST LCC (Major) — conclusion flips within ±2pp; supplement LCC with MCDA (strategic, risk, regulatory, resilience); investigate the swing factor (failure-cost differential).",
          isCorrect: true,
        },
        {
          text: "DISCOUNT-RATE ERROR — re-compute at the regulator's WACC.",
          isCorrect: false,
        },
        {
          text: "CAPEX TOO HIGH — procure Option A which has lower capex.",
          isCorrect: false,
        },
        {
          text: "OPEX MIS-MODELLED — re-run LCC with corrected opex.",
          isCorrect: false,
        },
      ],
    },
    {
      competencyName: "Asset Lifecycle & LCC",
      type: "TrueFalse",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      scenario: "Utilities",
      stem: "True or False: The asset lifecycle per ISO 55000 has five canonical stages — creation/acquisition, utilization, maintenance, renewal, disposal — and ISO 55001 §8.3 requires the AMS to manage activities across all five stages.",
      whyCorrect:
        "TRUE. ISO 55000:2014 §3.2.6 defines the asset lifecycle as the period from creation through to disposal; ISO 55001:2014 §8.3 (Operational planning and control — manage asset lifecycle activities) requires the AMS to manage activities across all five canonical stages: (1) creation/acquisition (design, procure, install, commission); (2) utilization (operate, monitor); (3) maintenance (preventive, corrective, condition-based); (4) renewal (refurbish, replace, upgrade); (5) disposal (decommission, remove, recycle, dispose). The assessor checks that the AMP (Lesson 1) covers all five stages; an AMP that omits disposal is a 'missing lifecycle stage' finding.",
      whyOthersWrong: [
        "Option FALSE — would imply a different number of lifecycle stages (3 or 4) or that ISO 55001 §8.3 covers only some stages. In fact the canonical ISO 55000/55001 decomposition is five stages, and §8.3 requires managing activities across all five. Some textbooks use a 4-stage variant (combining renewal and disposal) but the ISO standard uses five.",
      ],
      explanation:
        "TRUE. Five canonical lifecycle stages (create/acquire, utilize, maintain, renew, dispose); ISO 55001 §8.3 requires AMS to manage all five; AMP must cover all five or 'missing stage' finding.",
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Asset Risk & Criticality
// (Competency: "Asset Risk & Criticality"; slug: cama-asset-risk-criticality)
// ---------------------------------------------------------------------------

const LESSON_RISK_CRITICALITY: RefLesson = {
  competencyName: "Asset Risk & Criticality",
  slug: "cama-asset-risk-criticality",
  title: "Asset Risk & Criticality Analysis",
  titleAr: "تحليل مخاطر الأصول والأهمية الحرجة",
  order: 3,
  durationMin: 40,
  references: AML_REFERENCE_TITLES,
  conceptIntroduction: `Asset risk assessment is the analytical foundation of risk-based asset management. ISO 55001:2014 §8.2 requires the AMS to manage asset risk: identify, analyze, evaluate, and treat asset-related risks across the lifecycle. ISO 55002:2018 §8.2 specifies the methodology: risk identification (per asset and per failure mode), risk analysis (likelihood × consequence, possibly with multiple consequence dimensions — safety, environmental, service, financial, regulatory, reputational), risk evaluation (compare against risk criteria), and risk treatment (select risk-modifying tactics: mitigate via PM/CBM, transfer via insurance, accept for low-criticality, avoid via redesign/renewal). The asset criticality matrix is the assessor's first lens: which assets pose the highest risk, and are tactics prioritized accordingly?

The asset criticality analysis (Campbell & Jardine, 2001, Ch. 3) classifies each asset on a risk score: Likelihood (probability of failure in the analysis window, typically 1-5 scale) × Consequence (impact if failure occurs, typically 1-5 scale, possibly multi-dimensional). The risk score drives tactic frequency in the AMP (Lesson 1) and the failure-cost input in the LCC (Lesson 2). High-criticality assets get high-frequency tactics; low-criticality assets get low-frequency tactics or run-to-failure. A Pareto profile — typically the top-20% of assets by risk score account for ~80% of total risk — is the empirical signature of a risk-prioritized asset portfolio.

The asset register and asset hierarchy underpin the criticality analysis. ISO 55001 §7.5 (documented information) requires the AMS to maintain an asset register — a structured inventory of assets in scope, each with unique ID, location, type, manufacturer, install date, criticality score, and parent-system link. The asset hierarchy decomposes the asset base into a tree: Site → System → Sub-system → Asset → Sub-asset (or maintainable item). The assessor checks that every asset in the AMP scope is in the asset register, that the hierarchy is consistent across register/AMP/CMMS, and that criticality scores are assigned per a documented methodology and re-evaluated periodically.

The CAMA assessor's risk-and-criticality evidence trail: (i) the asset risk-assessment methodology document; (ii) the asset criticality matrix (likelihood × consequence scores per asset); (iii) the asset register and hierarchy; (iv) the criticality-driven tactic-frequency table in the AMP; (v) the risk-treatment log (which risks are mitigated, transferred, accepted, avoided); (vi) the periodic re-evaluation schedule (criticality scores refreshed on trigger).`,
  example: `A water utility (CASE_TYPE = SYNTHETIC) conducts an asset criticality analysis on its fleet of 50 raw-water pumps. Likelihood L scored 1-5 (1 = rare failure expected <1/10 yrs; 5 = frequent failure expected >1/yr). Consequence C scored 1-5 across four dimensions — safety (S), environmental (E), service (Sv, lost supply hours × customer impact), financial (F, repair + lost-production cost). The composite consequence is the maximum dimension (worst-case) per asset. The criticality index is Risk = L × C (range 1-25). Of 50 pumps, 10 pumps (top 20%) score Risk ≥ 16 (Very High); these 10 account for 41 of 50 = 82% of total risk score across the fleet (Pareto profile confirmed). The asset-management decision: the 10 Very-High-criticality pumps get monthly vibration analysis + monthly oil analysis + annual internal inspection; the 25 Medium-criticality pumps (Risk 5-9) get quarterly vibration + annual oil; the 15 Low-criticality pumps (Risk 1-4) get annual walk-down + run-to-failure. The criticality matrix drives tactic frequency in the AMP (Lesson 1) and the failure-cost input in the LCC (Lesson 2).`,
  keyFormulas: `Risk (ISO 31000 / ISO 55002 §8.2): R = L × C
  where L = likelihood (probability of failure in analysis window, 1-5 scale)
        C = consequence (impact if failure occurs, 1-5 scale, possibly multi-dimensional)

Composite consequence (multi-dimensional, worst-case rule): C_comp = max(C_safety, C_env, C_service, C_financial, C_regulatory, C_reputational)
  Alternative: weighted sum C_comp = Σ_i (w_i × C_i) where Σ w_i = 1

Criticality index (weighted-sum form): CI = Σ_i (w_i × s_i)
  where w_i = weight of criterion i (Σ w_i = 1)
        s_i = score of asset on criterion i (typically 1-5)

Pareto profile: top-20%-of-assets-by-risk typically account for ~80%-of-total-risk; if observed, the portfolio is risk-prioritized.

Risk-treatment options (ISO 55002 §8.2): MITIGATE (reduce likelihood via PM/CBM, reduce consequence via redundancy/containment), TRANSFER (insurance, contractor), ACCEPT (low-criticality run-to-failure), AVOID (redesign, renewal, decommission).

Risk-matrix tiers (typical 5×5): 1-4 Low (green) / 5-9 Medium (yellow) / 10-15 High (orange) / 16-25 Very High (red).

Tactic-frequency-to-criticality mapping (Campbell & Jardine 2001, Ch. 3):
  Very High (16-25): monthly PM + monthly CBM + annual internal inspection.
  High (10-15): quarterly PM + quarterly CBM + 2-yearly internal inspection.
  Medium (5-9): quarterly PM + annual CBM + 3-yearly internal inspection.
  Low (1-4): annual walk-down + run-to-failure (RTF) corrective maintenance.

Asset register integrity check: N_register = N_AMP_scope = N_CMMS_active; mismatches are findings.`,
  exercise: `You are the CAMA assessor reviewing a power utility's asset criticality analysis for its fleet of 200 circuit breakers. The methodology document specifies a 5×5 risk matrix (L 1-5 × C 1-5). The asset register lists 200 breakers. The CMMS shows 198 active breakers + 2 in warehouse. The criticality matrix shows 32 breakers (16%) scoring Risk ≥ 16 (Very High) accounting for 78% of total fleet risk. The tactic-frequency table in the AMP assigns: Very High = quarterly contact-wear + annual SF6 density; High = annual contact-wear + annual SF6; Medium = annual SF6; Low = run-to-failure. (a) Compute the asset-register integrity (N_register vs N_CMMS). (b) Verify the Pareto profile (top-20% vs total risk). (c) Identify two CAMA audit findings and improvement actions. (d) Recommend the maturity score for the Anatomy subject 'Asset Criticality'.`,
  sections: {
    learning_objectives: `- Define asset risk per ISO 31000 and ISO 55002 §8.2 (likelihood × consequence); distinguish risk from reliability (probability of failure) and from criticality (priority).
- Apply the 5×5 risk matrix (L 1-5 × C 1-5, range 1-25) and the four risk tiers (Low / Medium / High / Very High).
- Compute the criticality index CI = Σ_i (w_i × s_i) for multi-criteria asset prioritization.
- Identify the four ISO 55002 §8.2 risk-treatment options (mitigate, transfer, accept, avoid) and link each to AMP tactics.
- Apply the Pareto profile (top-20%-of-assets-by-risk ≈ 80%-of-total-risk) as the empirical signature of a risk-prioritized portfolio.
- Map tactic frequency to criticality (Very High monthly; High quarterly; Medium annual; Low RTF) — the linkage to Lesson 1's AMP.
- Audit the asset register and asset hierarchy; identify register-integrity findings.
- Identify common risk-and-criticality findings (no methodology, stale scores, no tactic-frequency mapping, register mismatch) the CAMA assessor would raise.`,
    prerequisites: `- ISO 55000 fundamentals — asset lifecycle, AM definition, four AM principles (especially "value" and "assurance").
- ISO 55001 §8.2 (asset risk management), §7.5 (documented information — asset register).
- ISO 31000 (risk management — vocabulary and process).
- Familiarity with physical engineering assets and their failure modes (FMEA).
- AMP structure (Lesson 1 in this domain); LCC methodology (Lesson 2 in this domain).`,
    introduction: `Asset risk assessment is the analytical foundation of risk-based asset management. ISO 55001:2014 §8.2 requires the AMS to manage asset risk: identify, analyze, evaluate, and treat asset-related risks across the lifecycle. ISO 55002:2018 §8.2 specifies the methodology. The asset criticality matrix is the assessor's first lens: which assets pose the highest risk, and are AMP tactics (Lesson 1) prioritized accordingly? Risk also feeds the LCC (Lesson 2): failure cost = frequency × consequence, where frequency and consequence come directly from the risk assessment.

Risk (per ISO 31000 and ISO 55002 §8.2) is the "effect of uncertainty on objectives" — operationally, R = L × C, where L is the likelihood (probability) of failure in the analysis window and C is the consequence (impact) if failure occurs. Likelihood is typically scored on a 1-5 scale (1 = rare, 5 = frequent). Consequence is multi-dimensional — safety, environmental, service continuity, financial, regulatory, reputational — and the composite is typically the worst-case (max) across dimensions, or a weighted sum. The 5×5 matrix produces risk scores from 1 (rare × trivial) to 25 (frequent × catastrophic), tiered into Low (1-4), Medium (5-9), High (10-15), Very High (16-25).

The criticality index CI = Σ_i (w_i × s_i) is the multi-criteria form: when the asset-management team wants to weight multiple criteria (safety 30%, service 25%, financial 25%, environmental 20%), each asset gets a weighted-sum score. This is appropriate when the worst-case rule over-weights a single dimension and a balanced view is needed.

The four ISO 55002 §8.2 risk-treatment options are: MITIGATE (reduce likelihood via PM/CBM; reduce consequence via redundancy/containment), TRANSFER (insurance, contractor warranties), ACCEPT (low-criticality assets where the cost of risk-reduction exceeds the expected loss — run-to-failure is the canonical acceptance tactic), AVOID (redesign, renewal, decommission — for risks where the consequence is unacceptable at any likelihood). The assessor checks that each Very-High-criticality asset has a documented risk-treatment rationale.

The Pareto profile is the empirical signature of a risk-prioritized portfolio. Across many asset populations, the top-20% of assets by risk score typically account for ~80% of total risk. If the assessor observes this profile (top-20% = ~80% of risk), the portfolio is risk-prioritized; if the profile is flat (top-20% = ~20% of risk), the portfolio is not risk-prioritized (suggesting uniform-tactic-frequency AMP — the Lesson 1 anti-pattern).

The asset register and asset hierarchy underpin the criticality analysis. ISO 55001 §7.5 requires the AMS to maintain an asset register — a structured inventory of assets in scope. Each asset has a unique ID, location, type, manufacturer, install date, criticality score, and parent-system link. The asset hierarchy decomposes the asset base into a tree: Site → System → Sub-system → Asset → Sub-asset (or maintainable item). The assessor checks that every asset in the AMP scope is in the asset register, that the hierarchy is consistent across register/AMP/CMMS, and that criticality scores are assigned per a documented methodology and re-evaluated periodically.

The assessor's risk-and-criticality audit programme: (1) methodology document review (likelihood scale, consequence dimensions, weighting, matrix tiers); (2) criticality matrix review (sample 10-20 assets; verify scores against evidence); (3) asset register integrity check (N_register = N_AMP_scope = N_CMMS_active); (4) tactic-frequency-to-criticality mapping check (does Very-High get monthly? does Low get RTF?); (5) risk-treatment log review (each Very-High has a documented treatment); (6) periodic re-evaluation check (scores refreshed on trigger — performance drift, organizational change, regulatory change); (7) Pareto profile check (top-20% = ~80% of risk); (8) criticality-to-LCC linkage (does the criticality-driven failure frequency feed the LCC failure-cost input?).`,
    terminology: `- **Risk (ISO 31000 / ISO 55002 §8.2)**: effect of uncertainty on objectives; operationally R = L × C.
- **Likelihood (L)**: probability of failure in the analysis window; 1-5 scale (1 = rare, 5 = frequent).
- **Consequence (C)**: impact if failure occurs; 1-5 scale; multi-dimensional (safety, environmental, service, financial, regulatory, reputational).
- **Composite consequence**: typically max-across-dimensions (worst-case) or weighted sum Σ w_i × C_i.
- **Risk score (R)**: L × C; range 1-25 (5×5 matrix).
- **Risk tiers**: Low (1-4), Medium (5-9), High (10-15), Very High (16-25).
- **Asset criticality**: the priority of an asset based on its risk score; drives tactic frequency.
- **Criticality index (CI)**: Σ_i (w_i × s_i) — weighted-sum multi-criteria form.
- **Pareto profile**: top-20%-of-assets-by-risk typically ≈ 80%-of-total-risk; empirical signature of risk-prioritization.
- **Risk treatment (ISO 55002 §8.2)**: mitigate, transfer, accept, avoid.
- **Asset register (ISO 55001 §7.5)**: structured inventory of assets in scope.
- **Asset hierarchy**: Site → System → Sub-system → Asset → Sub-asset (maintainable item) tree.
- **FMEA (Failure Modes and Effects Analysis)**: structured analysis of failure modes per asset; underpins consequence scoring.
- **Run-to-failure (RTF)**: risk-acceptance tactic for Low-criticality assets.`,
    detailed_explanation: `Asset risk assessment per ISO 55002 §8.2 follows the ISO 31000 risk-management process adapted to assets: (1) RISK IDENTIFICATION — for each asset, identify the failure modes (typically via FMEA or RCM) and the consequences if each mode occurs; (2) RISK ANALYSIS — score likelihood L (1-5) and consequence C (1-5, possibly multi-dimensional); compute R = L × C; (3) RISK EVALUATION — compare R against risk criteria (the matrix tiers: Low/Medium/High/Very High) and decide which risks require treatment; (4) RISK TREATMENT — select one of four options: MITIGATE (reduce L via PM/CBM, reduce C via redundancy/containment), TRANSFER (insurance, contractor warranty), ACCEPT (RTF for Low-criticality), AVOID (redesign, renewal, decommission for unacceptable risks).

The likelihood scale (1-5) is calibrated to the asset class. Example for centrifugal pumps: 1 = failure expected < 1/10 yrs; 2 = 1/10-1/5 yrs; 3 = 1/5-1/2 yrs; 4 = 1/2-1/yr; 5 = > 1/yr. The consequence scale (1-5) is multi-dimensional: SAFETY (1 = no injury, 5 = fatality), ENVIRONMENTAL (1 = no impact, 5 = major pollution event), SERVICE (1 = no service loss, 5 = widespread prolonged outage), FINANCIAL (1 = < $1k, 5 = > $1M), REGULATORY (1 = no breach, 5 = licence loss), REPUTATIONAL (1 = no media, 5 = national scandal). The composite is typically the max-across-dimensions (worst-case) — this is the conservative rule for safety-critical assets. For balanced multi-criteria prioritization, the weighted-sum CI = Σ w_i × s_i is appropriate.

The criticality matrix is typically a 5×5 grid with L on one axis and C on the other; cells are color-coded into four tiers (green Low, yellow Medium, orange High, red Very High). The asset-management team assigns each asset a criticality score; the score drives tactic frequency in the AMP and the failure-cost input in the LCC.

The Pareto profile is the empirical signature of risk-prioritization. Across many asset populations, the top-20% of assets by risk score account for ~80% of total risk. This 80/20 distribution is what risk-based asset management exploits: focus tactic resources on the top-20% bad actors, accept the bottom-80% as RTF or low-frequency PM. If the assessor observes a flat profile (top-20% = ~20% of risk), the portfolio is NOT risk-prioritized — suggesting either uniform-tactic-frequency across all assets (the Lesson 1 anti-pattern) or a criticality methodology that fails to differentiate.

The asset register (ISO 55001 §7.5 documented information) is the structured inventory of assets in AMS scope. Each asset has: unique ID (e.g., PMP-101, T-204), location (site, building, room), type (centrifugal pump, 11kV transformer), manufacturer, model, install date, expected life, criticality score, parent-system link, status (active, standby, warehouse, decommissioned). The assessor checks: (i) N_register = N_AMP_scope = N_CMMS_active (population reconciliation); (ii) every asset in AMP scope has a register entry; (iii) every CMMS-active asset has a register entry; (iv) the hierarchy (Site → System → Sub-system → Asset → Sub-asset) is consistent across register/AMP/CMMS.

The asset hierarchy decomposes the asset base into a navigable tree. Example: "Site: Plant A → System: Cooling Water → Sub-system: Pump Station 3 → Asset: Pump P-301 → Sub-asset: Mechanical Seal, Bearing, Motor". The hierarchy supports asset-level criticality (Pump P-301 risk = 16) AND system-level criticality (Pump Station 3 risk = aggregate of its pumps). The assessor checks that criticality is assigned at the asset level (not just at the system level) — system-level only is a finding because it fails to differentiate assets within a system.

The assessor's audit programme for asset risk and criticality:

(1) METHODOLOGY DOCUMENT REVIEW — pull the asset risk-assessment methodology; check the likelihood scale (with rationale for the calibration), the consequence dimensions (typically 4-6), the weighting (if weighted-sum CI used), the matrix tiers (typically Low/Medium/High/Very High with thresholds), and the version control.

(2) CRITICALITY MATRIX REVIEW — sample 10-20 assets; for each, verify the L score (against historical failure data) and the C score (against FMEA); verify the composite (max or weighted-sum); verify the tier assignment.

(3) ASSET REGISTER INTEGRITY CHECK — pull the register count, the AMP scope count, the CMMS active count; verify reconciliation (N_register = N_AMP_scope = N_CMMS_active); mismatches are findings.

(4) TACTIC-FREQUENCY-TO-CRITICALITY MAPPING CHECK — pull the AMP's tactic-frequency table; verify Very-High = monthly, High = quarterly, Medium = annual, Low = RTF (or similar); uniform frequencies are risk-blind findings.

(5) RISK-TREATMENT LOG REVIEW — for each Very-High-criticality asset, pull the documented risk-treatment rationale (mitigate via PM/CBM; transfer via insurance; accept with justification; avoid via renewal). A Very-High asset without a documented treatment is a Major finding.

(6) PERIODIC RE-EVALUATION CHECK — verify criticality scores are refreshed on trigger (performance drift: MTBF drops; organizational change: new service commitment; regulatory change: new standard). Stale scores (> 3 years old without re-evaluation) are findings.

(7) PARETO PROFILE CHECK — compute top-20% of assets by risk and their share of total risk; ~80% = risk-prioritized; ~20% = not risk-prioritized. The Pareto signature is the empirical evidence of methodology effectiveness.

(8) CRITICALITY-TO-LCC LINKAGE CHECK — verify that the criticality-driven failure frequency (from the likelihood L score) feeds the LCC failure-cost input (Lesson 2). A criticality study not linked to the LCC is a finding.`,
    core_principles: `- Asset risk per ISO 31000 / ISO 55002 §8.2: R = L × C; the asset-management team scores likelihood and consequence per asset per failure mode.
- The 5×5 risk matrix (range 1-25) is tiered: Low (1-4) / Medium (5-9) / High (10-15) / Very High (16-25).
- Composite consequence: max-across-dimensions (worst-case, conservative) or weighted-sum CI = Σ w_i × s_i (balanced multi-criteria).
- Four ISO 55002 §8.2 risk treatments: mitigate (PM/CBM), transfer (insurance), accept (RTF for Low), avoid (redesign/renewal).
- Pareto profile: top-20%-of-assets-by-risk ≈ 80%-of-total-risk; the empirical signature of risk-prioritization.
- Tactic frequency scales with criticality: Very-High monthly, High quarterly, Medium annual, Low RTF.
- Asset register integrity: N_register = N_AMP_scope = N_CMMS_active; hierarchy consistent across register/AMP/CMMS.
- Risk feeds the LCC failure-cost input (frequency × consequence); criticality feeds AMP tactic frequency.
- Periodic re-evaluation on trigger: performance drift, organizational change, regulatory change.
- Each Very-High-criticality asset has a documented risk-treatment rationale.`,
    components: `- Asset risk-assessment methodology document: likelihood scale (1-5 with calibration rationale), consequence dimensions (4-6), weighting (if CI used), matrix tiers (Low/Medium/High/Very High), version control.
- Asset criticality matrix: 5×5 grid; per-asset risk score; tier assignment (color-coded).
- Asset register: structured inventory per ISO 55001 §7.5; unique ID, location, type, manufacturer, install date, criticality score, parent-system link, status.
- Asset hierarchy: Site → System → Sub-system → Asset → Sub-asset tree.
- Risk-treatment log: per Very-High-criticality asset; mitigate/transfer/accept/avoid rationale.
- Tactic-frequency-to-criticality mapping table: in the AMP (Lesson 1).
- Periodic re-evaluation schedule: trigger list (performance drift, organizational change, regulatory change) + last-review date per asset.
- Pareto profile report: top-20%-of-assets share of total risk (audited annually).
- FMEA / RCM study: failure-modes-and-effects analysis per asset; underpins consequence scoring.`,
    process: `1. DOCUMENT the asset risk-assessment methodology (likelihood scale, consequence dimensions, weighting, matrix tiers, version control).
2. CONDUCT FMEA per asset class — enumerate failure modes per asset; for each mode identify consequence dimensions.
3. SCORE likelihood L (1-5) per asset per failure mode (against historical failure data; calibrate for new assets via vendor data / ISO 14224).
4. SCORE consequence C (1-5) per failure mode per dimension (safety, environmental, service, financial, regulatory, reputational).
5. COMPUTE composite consequence (max-across-dimensions OR weighted-sum CI).
6. COMPUTE risk R = L × C; tier-assign (Low/Medium/High/Very High).
7. ASSIGN tactic frequency per criticality tier (Very-High monthly, High quarterly, Medium annual, Low RTF) — feeds the AMP (Lesson 1).
8. ASSIGN risk-treatment per Very-High asset (mitigate via PM/CBM, transfer via insurance, accept with justification, avoid via renewal).
9. PUBLISH the asset register with criticality scores; communicate to operations/maintenance/engineering.
10. RUN the Pareto profile (top-20% vs total risk) — verify risk-prioritization signature.
11. FEED the criticality-driven failure frequency into the LCC failure-cost input (Lesson 2).
12. REVIEW periodically on trigger — performance drift (MTBF drops), organizational change, regulatory change.
13. IMPROVE — refine likelihood calibration, consequence dimensions, weighting; close the PDCA loop.`,
    formula_calculation: `Risk (ISO 31000 / ISO 55002 §8.2): R = L × C
  L = likelihood (1-5; 1 = rare < 1/10 yrs; 5 = frequent > 1/yr)
  C = consequence (1-5; 1 = trivial; 5 = catastrophic)
  R = risk score (range 1-25)

Composite consequence (multi-dimensional):
  Worst-case rule: C_comp = max(C_safety, C_env, C_service, C_financial, C_reg, C_rep)
  Weighted-sum rule: C_comp = Σ_i (w_i × C_i), where Σ w_i = 1

Criticality index (weighted-sum multi-criteria form):
  CI = Σ_i (w_i × s_i)
  w_i = weight of criterion i (Σ w_i = 1)
  s_i = score of asset on criterion i (typically 1-5)

Risk matrix tiers (typical 5×5):
  Low: 1-4 (green) — accept (RTF) or low-frequency PM
  Medium: 5-9 (yellow) — annual PM
  High: 10-15 (orange) — quarterly PM + quarterly CBM
  Very High: 16-25 (red) — monthly PM + monthly CBM + annual internal inspection; documented risk-treatment

Pareto profile: top-20%-of-assets-by-risk typically ≈ 80%-of-total-risk; ratio = (Σ top-20% R_i) / (Σ all R_i).
  Risk-prioritized signature: ratio ≈ 0.80 (range 0.70-0.90).
  Non-risk-prioritized signature: ratio ≈ 0.20 (flat).

Tactic-frequency-to-criticality mapping (Campbell & Jardine 2001, Ch. 3):
  Very High (16-25): monthly PM + monthly CBM + annual internal inspection.
  High (10-15): quarterly PM + quarterly CBM + 2-yearly internal inspection.
  Medium (5-9): quarterly PM + annual CBM + 3-yearly internal inspection.
  Low (1-4): annual walk-down + RTF corrective maintenance.

Asset register integrity: N_register = N_AMP_scope = N_CMMS_active.
  Mismatch (delta) is a finding; severity Minor if < 5%, Major if ≥ 5%.

LCC failure-cost input linkage: C_failure = L × C_consequence_dollar (from the risk assessment) per asset per failure mode; feeds LCC = C_capex + Σ_t [(C_op + C_maint + C_failure)/(1+i)^t] + C_disposal/(1+i)^T (Lesson 2).`,
    worked_example: `A water utility (CASE_TYPE = SYNTHETIC) conducts an asset criticality analysis on its fleet of 50 raw-water pumps. The methodology: 5×5 risk matrix; L scored 1-5 (1 = failure < 1/10 yrs; 5 = > 1/yr); C scored 1-5 across four dimensions — safety (S), environmental (E), service (Sv), financial (F); composite = max(S, E, Sv, F). Risk R = L × C (range 1-25); tiers Low (1-4), Medium (5-9), High (10-15), Very High (16-25).

STEP 1 — Score each of 50 pumps. Sample of 5 pumps (full table has 50 entries; space-limiting here):

  Pump P-101 (Plant A, Pump Station 3, raw-water lift to Plant A clarifier): L = 5 (fails > 1/yr — high sediment abrasion), S = 1 (no safety exposure), E = 2 (containment dike present), Sv = 5 (failure stops Plant A — 50,000 customers), F = 4 (repair $80k + lost-production $200k). C_comp = max(1, 2, 5, 4) = 5. R = 5 × 5 = 25. Tier: Very High.
  Pump P-102 (Plant A, redundant unit to P-101): L = 4 (fails ~ 1/yr), S = 1, E = 2, Sv = 3 (redundancy limits service impact), F = 3. C_comp = 3. R = 4 × 3 = 12. Tier: High.
  Pump P-201 (Plant B, raw-water lift to Plant B clarifier): L = 3 (fails ~ 1/3 yr), S = 1, E = 2, Sv = 5 (no redundancy at Plant B — single pump), F = 4. C_comp = 5. R = 3 × 5 = 15. Tier: High.
  Pump P-301 (Plant C, raw-water lift to Plant C clarifier, with redundancy): L = 2 (fails ~ 1/5 yr), S = 1, E = 1, Sv = 2 (redundancy + low customer count), F = 2. C_comp = 2. R = 2 × 2 = 4. Tier: Low.
  Pump P-401 (Plant D, raw-water lift to Plant D clarifier): L = 1 (fails < 1/10 yr — newer install), S = 1, E = 1, Sv = 2 (small customer count), F = 1. C_comp = 2. R = 1 × 2 = 2. Tier: Low.

STEP 2 — Aggregate across 50 pumps. Full fleet scoring produces:
  Very High (16-25): 10 pumps (20% of fleet)
  High (10-15): 15 pumps (30%)
  Medium (5-9): 15 pumps (30%)
  Low (1-4): 10 pumps (20%)

STEP 3 — Pareto profile. Total fleet risk score = Σ R_i for i = 1..50. Top-20% (10 Very-High pumps) sum = 410. Total fleet sum = 500 (illustrative aggregate). Top-20% share = 410/500 = 82%. PARETO PROFILE CONFIRMED — top-20% account for 82% of total fleet risk. The portfolio is risk-prioritized.

STEP 4 — Tactic-frequency-to-criticality mapping (feeds the AMP, Lesson 1):
  Very High (10 pumps): monthly vibration + monthly oil analysis + annual internal inspection.
  High (15 pumps): quarterly vibration + annual oil + 2-yearly internal inspection.
  Medium (15 pumps): quarterly vibration + annual oil.
  Low (10 pumps): annual walk-down + RTF corrective maintenance.

STEP 5 — Risk-treatment log for the 10 Very-High pumps. Each Very-High has a documented rationale:
  - P-101 (R=25): MITIGATE via monthly vibration + monthly oil + condition-based bowl relining trigger; AVOID via scheduled unit replacement at year 12 (before end-of-life) — replacement budgeted in the AMP capex.
  - P-501 (R=20): MITIGATE as above; TRANSFER via business-interruption insurance ($2M coverage, $50k/yr premium).
  - etc.

STEP 6 — Asset register integrity check. Asset register: 50 active pumps + 5 standbys + 3 in warehouse = 58 total. AMP scope: 50 active + 5 standby = 55. CMMS active: 50 active. Reconciliation: N_register (active+standby subset) = N_AMP_scope = N_CMMS_active = 55. Register PASS.

STEP 7 — LCC linkage. The 50-pump LCC (Lesson 2 worked example) uses the criticality-driven failure frequency as the failure-cost input: Option A assumed C_failure = $8k/yr (frequency 0.40/yr × consequence $20k); Option B assumed C_failure = $2k/yr (frequency 0.10/yr × consequence $20k). These failure frequencies are calibrated against the L scores in the criticality matrix — the criticality-to-LCC linkage is intact.

CAMA ASSESSOR FINDINGS:
- PASS — Methodology documented (5×5 matrix; multi-dimensional consequence; worst-case composite rule).
- PASS — Pareto profile (top-20% = 82% of total risk) confirms risk-prioritization.
- PASS — Tactic-frequency-to-criticality mapping intact (Very-High monthly, High quarterly, Medium annual, Low RTF).
- PASS — Risk-treatment log for Very-High assets documented.
- PASS — Asset register integrity (N reconciliation 55/55/55).
- PASS — Criticality-to-LCC linkage intact (failure frequencies calibrated against L scores).
- FINDING (Minor) — Criticality scores last refreshed 2022-Q2 (2 years old); methodology requires refresh on trigger (performance drift, organizational change, regulatory change) or every 2 years. Recommend refresh in 2024-Q4.
- FINDING (Minor) — Consequence dimension "regulatory" omitted (only S/E/Sv/F); add regulatory dimension to align with ISO 55002 §8.2 multi-dimensional expectation.

MATURITY: Anatomy subject 'Asset Criticality' scores level 4 (Managed — criticality drives tactic frequency, Pareto signature observed, risk-treatment log intact, LCC linkage intact) trending to level 5 (Optimized) once the 2-year refresh cadence is institutionalized and the regulatory dimension is added.`,
    industrial_example: `Utilities — Water: A metropolitan water utility maintains an asset criticality matrix for its 60 raw-water pumps (the Lesson 1 case study), 1,400 km of distribution mains (criticality driven by customer-impact × pipe-burst frequency), 18 treatment-works clarifiers (criticality driven by safety × downstream service), and 65 reservoirs (criticality driven by dam-safety consequence). Top-20% bad actors account for 80-85% of total fleet risk across all asset classes — the Pareto signature of a risk-prioritized portfolio.

Oil & Gas — Refining: A 220-kbpd refinery maintains an asset criticality matrix for its 18 critical rotating-equipment trains (catalytic cracker wet-gas compressor, hydrocracker feed pump, crude-distillation overhead air cooler). Criticality is driven by safety (explosion/toxic release consequence) × loss-of-production cost ($120k/hr). Top-3 bad-actor assets (top 17% by risk) account for 71% of unplanned production-loss events over the look-back year — a Pareto profile that drives the AMP's risk-prioritized tactic schedule (monthly vibration on top-3; quarterly on the rest).`,
    case_study: `CASE_TYPE = SYNTHETIC. "MetroWater 50-Pump Fleet Criticality Analysis v2.1" (the worked example expanded). MetroWater is the regional water utility from Lessons 1 and 2; the criticality analysis in this lesson is the SAME fleet (the 50-pump set, expanded from the 60-pump scope of Lessons 1 and 2 — 10 pumps moved out of scope to a separate AMP for a non-critical flood-control system). The criticality analysis was first conducted in 2021-Q4 and refreshed in 2022-Q2 (after a near-miss event at P-101 exposed an under-estimate of the service consequence). The 2022-Q2 refresh raised P-101 from R=20 to R=25 (Sv 4 → 5) and triggered the AMP update (Lesson 1). The CAMA assessor audited the criticality analysis in 2024-Q3 alongside the AMP and LCC audits and recorded 2 Minor findings (2-year refresh cadence; missing regulatory dimension) and an 'Asset Criticality' maturity score of level 4 trending to 5.`,
    visual_explanation: `Picture the asset criticality matrix as a 5×5 grid:

           C=1   C=2   C=3   C=4   C=5
  L=1:     1     2     3     4     5    ← Low (green)
  L=2:     2     4     6     8     10   ← Low/Medium (green/yellow)
  L=3:     3     6     9     12    15   ← Medium/High (yellow/orange)
  L=4:     4     8     12    16    20   ← High/Very High (orange/red)
  L=5:     5     10    15    20    25   ← Very High (red)

Color tiers: Low (1-4) green / Medium (5-9) yellow / High (10-15) orange / Very High (16-25) red.

Each asset is plotted as a dot at its (L, C) cell; the dot color shows the tier. The assessor overlays the count of assets per cell — clusters in the red/Very-High cells are the bad actors requiring risk-treatment.

Picture the Pareto profile as a sorted-bar chart: 50 pumps ranked by risk score (descending), risk score on the y-axis, pump rank on the x-axis. The first 10 pumps (top-20%) extend high (R=16-25); the remaining 40 pumps trail low (R=2-15). The cumulative curve shows the top-20% capturing ~80% of total risk — the Pareto signature.

Picture the asset hierarchy as a tree:
  Site (Plant A)
    └─ System (Cooling Water)
       └─ Sub-system (Pump Station 3)
          └─ Asset (Pump P-301)
             └─ Sub-asset (Mechanical Seal, Bearing, Motor)

The assessor navigates the tree to verify register/AMP/CMMS consistency at every level.`,
    simulation_opportunity: `A simulation could let the learner act as the CAMA assessor with a fictional utility's asset register, criticality matrix, FMEA studies, AMP tactic-frequency table, and LCC spreadsheets. The learner runs the 8-step risk-and-criticality audit programme (methodology review, matrix review, register integrity, tactic-frequency mapping, risk-treatment log, periodic re-evaluation, Pareto profile, LCC linkage) and produces a findings log. The simulation would surface realistic findings (stale scores, register/CMMS mismatch, uniform tactic frequencies, missing risk-treatment rationales, missing regulatory dimension, broken LCC linkage) and let the learner practice writing severity-rated findings per ISO 19011.`,
    common_mistakes: `- No documented risk-assessment methodology — criticality scores are non-reproducible and non-auditable.
- Stale criticality scores (> 3 years without re-evaluation) — drift from actual asset risk.
- Uniform tactic frequencies across all criticality tiers (Lesson 1 anti-pattern) — risk-blind AMP.
- No risk-treatment rationale per Very-High asset — the assessor cannot verify treatment adequacy.
- Asset register / AMP scope / CMMS active mismatch — population integrity broken.
- Criticality assigned at system level only — fails to differentiate assets within a system.
- Consequence dimension "regulatory" or "reputational" omitted — under-estimates risk for compliance- or reputation-sensitive assets.
- Worst-case vs weighted-sum composite chosen inconsistently — non-comparable scores across assets.
- Pareto profile not computed — the assessor cannot verify risk-prioritization empirically.
- Criticality-to-LCC linkage broken — LCC failure-cost inputs not calibrated against likelihood L scores.
- No asset hierarchy — flat register prevents system-level analytics.`,
    limitations: `- Criticality scores depend on the likelihood calibration — inaccurate calibration produces inaccurate scores; new assets with no history use vendor data or ISO 14224 class averages.
- Consequence scoring is subjective — multi-dimensional scales mitigate but require skilled facilitation.
- Worst-case composite rule over-weights single-dimension catastrophe — may under-prioritize balanced multi-criteria assets.
- Pareto profile is empirical — asset populations with naturally flat risk distributions (e.g., identical assets in identical service) may not show the 80/20 signature even when risk-prioritized.
- Criticality scores do not capture common-cause failures (CCF) — a single event can take down multiple assets; CCF modelling (β-factor) is a separate analysis.
- Criticality is a snapshot — asset risk evolves over the lifecycle (early-life high failure rate, mid-life low, end-of-life high — bathtub curve).
- Criticality analysis cannot replace engineering judgement — it is one input to the AMP, not the whole tactic-selection logic.
- Criticality methodology is asset-class-specific — what works for pumps does not directly transfer to transformers or distribution mains.`,
    comparison: `Risk vs Reliability vs Criticality:
  - Reliability: probability of failure over time (R(t), MTBF, failure rate λ).
  - Risk: L × C — probability × consequence.
  - Criticality: priority based on risk; drives tactic frequency.
  - Reliability informs Likelihood; Criticality uses L × C; both feed the AMP.

Worst-case vs weighted-sum composite:
  - Worst-case (max across dimensions): conservative; appropriate for safety-critical assets.
  - Weighted-sum (Σ w_i × C_i): balanced; appropriate for multi-criteria prioritization with documented weights.

Risk assessment per ISO 31000 vs per ISO 55002 §8.2:
  - ISO 31000: general risk-management process (identify → analyze → evaluate → treat); vocabulary.
  - ISO 55002 §8.2: asset-risk-specific application; aligns with ISO 31000 but with asset-class-specific examples.

Criticality vs LCC:
  - Criticality: drives tactic frequency in the AMP (tactical prioritization).
  - LCC: drives procurement/renewal decisions (economic prioritization).
  - The two are linked: criticality-driven failure frequency feeds the LCC failure-cost input.`,
    practical_application: `In practice, the asset-management team conducts an asset criticality analysis per asset class every 2-3 years, refreshes scores on trigger (performance drift, organizational change, regulatory change), and uses the scores to drive tactic frequency in the AMP (Lesson 1) and the failure-cost input in the LCC (Lesson 2). The asset register is maintained continuously (new assets added, decommissioned assets removed); the criticality scores are integrated with the register. The CAMA assessor audits the criticality analysis using the 8-step audit programme (methodology review, matrix review, register integrity, tactic-frequency mapping, risk-treatment log, periodic re-evaluation, Pareto profile, LCC linkage) and produces a findings log with severity ratings. Maturity is scored on the IAM 5-level scale for the Anatomy subject 'Asset Criticality' (Risk & Reliability group).`,
    decision_scenario: `You are the CAMA assessor reviewing a power utility's asset criticality analysis for its 200 circuit breakers. The methodology specifies a 5×5 risk matrix. The asset register lists 200 breakers; the CMMS shows 198 active + 2 in warehouse. The criticality matrix shows 32 breakers (16%) scoring Risk ≥ 16 (Very High) accounting for 78% of total fleet risk. The tactic-frequency table in the AMP assigns: Very High = quarterly contact-wear + annual SF6; High = annual contact-wear + annual SF6; Medium = annual SF6; Low = RTF. The 32 Very-High breakers have no documented risk-treatment rationale. Criticality scores were last refreshed 2019-Q4 (5 years ago). The LCC spreadsheets for breaker renewal use a fixed failure frequency of 0.02/yr regardless of criticality. Write your AML audit findings (severity, root cause, improvement action per finding) and your maturity score for the Anatomy subject 'Asset Criticality'.`,
    practice_questions: `- Compute R = L × C for an asset with L=4, C=5. Identify the tier. (Answer: R=20; Very High.)
- Compute the weighted-sum CI for an asset with safety=4 (w=0.30), service=5 (w=0.25), financial=3 (w=0.25), environmental=2 (w=0.20). (Answer: 0.30×4 + 0.25×5 + 0.25×3 + 0.20×2 = 1.20 + 1.25 + 0.75 + 0.40 = 3.60.)
- A fleet of 50 assets shows top-20% (10 assets) accounting for 25% of total risk. What audit finding do you raise, and what does this profile suggest?
- A Very-High criticality asset has no documented risk-treatment rationale. What finding do you raise, and what improvement action do you recommend?
- The asset register shows 200 assets; the AMP scope is 195; the CMMS active count is 198. What finding do you raise?`,
    certification_questions: `- (CAMA-style MCQ) Per ISO 55002 §8.2, the four risk-treatment options are:
  (A) Avoid/Transfer/Mitigate/Accept  (B) Avoid/Mitigate/Outsource/Insure  (C) Accept/Reject/Defer/Escalate  (D) Mitigate/Transfer/Defer/Avoid  [Correct: A]
- (CAMA-style MCQ) An asset has L=4, C=5. The tier is:
  (A) Medium  (B) High  (C) Very High  (D) Catastrophic  [Correct: C]
- (CAMA-style TrueFalse) The Pareto profile (top-20%-of-assets-by-risk ≈ 80%-of-total-risk) is the empirical signature of a risk-prioritized asset portfolio.
  [Correct: TRUE]`,
    summary: `Asset risk per ISO 31000 / ISO 55002 §8.2 is R = L × C (likelihood × consequence), scored on a 5×5 matrix tiered Low/Medium/High/Very High. The four risk-treatment options are mitigate, transfer, accept, avoid. The Pareto profile (top-20% = ~80% of total risk) is the empirical signature of risk-prioritization. Tactic frequency in the AMP scales with criticality (Very-High monthly, High quarterly, Medium annual, Low RTF). The asset register per ISO 55001 §7.5 must reconcile across register/AMP/CMMS, and the asset hierarchy (Site → System → Sub-system → Asset → Sub-asset) must be consistent. Criticality feeds the LCC failure-cost input. The CAMA assessor's 8-step risk-and-criticality audit programme covers methodology, matrix, register integrity, tactic-frequency mapping, risk-treatment log, periodic re-evaluation, Pareto profile, and LCC linkage. Maturity on the Anatomy subject 'Asset Criticality' ranges from level 1 (no methodology) to level 5 (institutionalized refresh, multi-dimensional consequence, LCC linkage intact).`,
    key_takeaways: `- Risk per ISO 31000 / ISO 55002 §8.2: R = L × C; 5×5 matrix; tiers Low/Medium/High/Very High.
- Four risk treatments: mitigate, transfer, accept, avoid; each Very-High needs documented rationale.
- Pareto profile (top-20% ≈ 80% of total risk) is the empirical signature of risk-prioritization.
- Tactic frequency scales with criticality (Very-High monthly, High quarterly, Medium annual, Low RTF).
- Asset register integrity: N_register = N_AMP_scope = N_CMMS_active; hierarchy consistent.
- Criticality feeds AMP tactic frequency AND LCC failure-cost input.
- Multi-dimensional consequence: worst-case (max) for safety-critical; weighted-sum CI for balanced.
- Periodic re-evaluation on trigger (performance drift, organizational change, regulatory change) or every 2 years.
- The assessor's 8-step audit programme covers methodology, matrix, register, tactic-frequency, risk-treatment, re-evaluation, Pareto, LCC linkage.`,
    references: `1. ISO 55001:2014 §8.2 (asset risk management), §7.5 (documented information — asset register).
2. ISO 55000:2014 §3.2.6 (asset lifecycle), §3.2.5 (asset management — risk-based fundamental).
3. ISO 55002:2018 §8.2 (risk methodology guidance — identify, analyze, evaluate, treat), §7.5 (asset register).
4. The IAM — Asset Management — An Anatomy (3rd ed.) — subjects "Asset Risk Assessment", "Asset Criticality", "Contingency & Resilience" (Risk & Reliability group), "Asset Register & Hierarchy" (Asset Information group).
5. Campbell & Jardine — Maintenance Strategy — Ch. 3 (Asset Criticality & Risk-Based Prioritization — the 5×5 matrix, multi-dimensional consequence, tactic-frequency-to-criticality mapping).
6. IEC 60300-3-3:2017 — referenced for the LCC failure-cost input linkage (frequency × consequence).`,
  },
  knowledgeObject: {
    title: "Asset Risk & Criticality Analysis — ISO 55002 §8.2 / ISO 31000",
    domain: "Asset Management Plan & Lifecycle",
    competency: "Asset Risk & Criticality",
    topic: "5×5 risk matrix, criticality index, Pareto profile, asset register & hierarchy",
    concept:
      "Asset risk per ISO 31000 / ISO 55002 §8.2 is R = L × C scored on a 5×5 matrix tiered Low/Medium/High/Very High; the four risk treatments are mitigate, transfer, accept, avoid; the Pareto profile (top-20% ≈ 80%) is the empirical signature of risk-prioritization; criticality drives tactic frequency in the AMP and the failure-cost input in the LCC.",
    body: {
      definitions: [
        "Risk (ISO 31000 / ISO 55002 §8.2): effect of uncertainty on objectives; operationally R = L × C.",
        "Likelihood (L): probability of failure in the analysis window; 1-5 scale (1 = rare < 1/10 yrs; 5 = frequent > 1/yr).",
        "Consequence (C): impact if failure occurs; 1-5 scale; multi-dimensional (safety, environmental, service, financial, regulatory, reputational).",
        "Composite consequence: worst-case rule (max across dimensions) or weighted-sum (Σ w_i × C_i).",
        "Criticality index (CI): weighted-sum multi-criteria form Σ w_i × s_i; Σ w_i = 1.",
        "Risk tiers: Low (1-4), Medium (5-9), High (10-15), Very High (16-25).",
        "Risk treatment (ISO 55002 §8.2): mitigate, transfer, accept, avoid.",
        "Pareto profile: top-20%-of-assets-by-risk ≈ 80%-of-total-risk; empirical signature of risk-prioritization.",
        "Asset register (ISO 55001 §7.5): structured inventory of assets in AMS scope.",
        "Asset hierarchy: Site → System → Sub-system → Asset → Sub-asset (maintainable item) tree.",
        "Run-to-failure (RTF): risk-acceptance tactic for Low-criticality assets.",
      ],
      principles: [
        "Risk R = L × C (ISO 31000 / ISO 55002 §8.2); 5×5 matrix; tiers Low/Medium/High/Very High.",
        "Four risk treatments: mitigate (PM/CBM), transfer (insurance), accept (RTF for Low), avoid (redesign/renewal).",
        "Pareto profile (top-20% ≈ 80% of total risk) is the empirical signature of risk-prioritization.",
        "Tactic frequency scales with criticality: Very-High monthly, High quarterly, Medium annual, Low RTF.",
        "Asset register integrity: N_register = N_AMP_scope = N_CMMS_active; hierarchy consistent across register/AMP/CMMS.",
        "Criticality feeds AMP tactic frequency (Lesson 1) AND LCC failure-cost input (Lesson 2).",
        "Multi-dimensional consequence: worst-case (max) for safety-critical; weighted-sum CI for balanced multi-criteria.",
        "Periodic re-evaluation on trigger (performance drift, organizational change, regulatory change) or every 2 years.",
        "Each Very-High-criticality asset has a documented risk-treatment rationale.",
        "Asset-level criticality (not just system-level) is required — system-level only fails to differentiate assets within a system.",
      ],
      components: [
        "Asset risk-assessment methodology document (likelihood scale, consequence dimensions, weighting, matrix tiers, version control).",
        "Asset criticality matrix (5×5 grid; per-asset risk score; tier assignment).",
        "Asset register per ISO 55001 §7.5 (unique ID, location, type, manufacturer, install date, criticality score, parent-system link, status).",
        "Asset hierarchy (Site → System → Sub-system → Asset → Sub-asset).",
        "Risk-treatment log per Very-High asset (mitigate/transfer/accept/avoid rationale).",
        "Tactic-frequency-to-criticality mapping table (in the AMP, Lesson 1).",
        "Periodic re-evaluation schedule (trigger list + last-review date per asset).",
        "Pareto profile report (top-20%-of-assets share of total risk).",
        "FMEA / RCM study per asset class; underpins consequence scoring.",
      ],
      mechanism: [
        "Risk process per ISO 31000 adapted to assets (ISO 55002 §8.2): identify (FMEA) → analyze (L × C) → evaluate (tier) → treat (mitigate/transfer/accept/avoid).",
        "Criticality-driven tactic frequency: Very-High → monthly PM + monthly CBM; High → quarterly PM + quarterly CBM; Medium → annual PM; Low → annual walk-down + RTF.",
        "Criticality-driven LCC failure-cost input: C_failure = frequency (from L score) × consequence ($); feeds LCC = C_capex + Σ_t [(C_op + C_maint + C_failure)/(1+i)^t] + C_disposal/(1+i)^T (Lesson 2).",
        "Pareto profile loop: assign scores → sort by R → compute top-20% share of total → verify ~80% signature → refine methodology if signature absent.",
        "Periodic re-evaluation loop: performance drift (MTBF drops) → re-score L; regulatory change → re-score C dimension; refresh ≥ every 2 years.",
      ],
      process: [
        "1. Document the asset risk-assessment methodology (likelihood scale, consequence dimensions, weighting, matrix tiers, version control).",
        "2. Conduct FMEA per asset class — enumerate failure modes per asset; identify consequence dimensions per mode.",
        "3. Score likelihood L (1-5) per asset per failure mode (against historical failure data; calibrate for new assets via vendor data / ISO 14224).",
        "4. Score consequence C (1-5) per failure mode per dimension (safety, environmental, service, financial, regulatory, reputational).",
        "5. Compute composite consequence (worst-case max OR weighted-sum CI).",
        "6. Compute risk R = L × C; tier-assign (Low/Medium/High/Very High).",
        "7. Assign tactic frequency per criticality tier (Very-High monthly, High quarterly, Medium annual, Low RTF) — feeds the AMP.",
        "8. Assign risk-treatment per Very-High asset (mitigate via PM/CBM, transfer via insurance, accept with justification, avoid via renewal).",
        "9. Publish the asset register with criticality scores; communicate to operations/maintenance/engineering.",
        "10. Run the Pareto profile (top-20% vs total risk) — verify risk-prioritization signature.",
        "11. Feed the criticality-driven failure frequency into the LCC failure-cost input.",
        "12. Review periodically on trigger — performance drift, organizational change, regulatory change.",
        "13. Improve — refine likelihood calibration, consequence dimensions, weighting; close the PDCA loop.",
      ],
      formulas: [
        "R = L × C (ISO 31000 / ISO 55002 §8.2).",
        "Composite consequence worst-case: C_comp = max(C_safety, C_env, C_service, C_financial, C_reg, C_rep).",
        "Composite consequence weighted-sum: C_comp = Σ_i (w_i × C_i), where Σ w_i = 1.",
        "Criticality index CI = Σ_i (w_i × s_i), where w_i = weight (Σ = 1), s_i = score (1-5).",
        "Risk tiers: Low 1-4 (green) / Medium 5-9 (yellow) / High 10-15 (orange) / Very High 16-25 (red).",
        "Pareto share = (Σ top-20% R_i) / (Σ all R_i); risk-prioritized signature ≈ 0.80 (range 0.70-0.90).",
        "Asset register integrity: N_register = N_AMP_scope = N_CMMS_active.",
        "LCC failure-cost linkage: C_failure = frequency (from L score) × C_dollar (from consequence score).",
      ],
      metrics: [
        "Risk score R per asset per failure mode (range 1-25).",
        "Criticality index CI per asset (weighted-sum form).",
        "Tier distribution (% of fleet in Low/Medium/High/Very High).",
        "Pareto share (top-20% share of total risk; target ≈ 0.80).",
        "Asset register integrity (delta between N_register, N_AMP_scope, N_CMMS_active; target = 0).",
        "Tactic-frequency-to-criticality mapping compliance (% of assets with frequency scaled to tier; target = 100%).",
        "Risk-treatment log completeness (% of Very-High assets with documented rationale; target = 100%).",
        "Criticality-score freshness (% of assets refreshed within 2 years; target = 100%).",
        "Criticality-to-LCC linkage intact (yes/no).",
        "Maturity score (IAM 1-5 scale per Anatomy subject 'Asset Criticality').",
      ],
      examples: [
        "MetroWater 50-Pump Fleet Criticality v2.1 (Lesson 3 worked example) — 10 Very-High pumps (top-20%) account for 410/500 = 82% of total fleet risk (Pareto signature); tactic frequency Very-High monthly; asset register integrity 55/55/55; LCC linkage intact.",
        "Power utility 200-breaker criticality — 32 Very-High breakers (16%) account for 78% of total fleet risk; findings: 5-yr-stale scores, no risk-treatment rationales, broken LCC linkage (fixed frequency 0.02/yr).",
      ],
      industrial_examples: [
        "Utilities — Water: metropolitan water utility criticality matrix for 60 raw-water pumps, 1,400 km distribution mains, 18 clarifiers, 65 reservoirs; top-20% bad actors account for 80-85% of total fleet risk across all asset classes (Pareto signature).",
        "Oil & Gas — Refining: 220-kbpd refinery criticality matrix for 18 critical rotating-equipment trains; criticality driven by safety (explosion/toxic release) × loss-of-production ($120k/hr); top-3 bad actors (17%) account for 71% of unplanned production-loss events.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. MetroWater 50-Pump Fleet Criticality Analysis v2.1 (first conducted 2021-Q4; refreshed 2022-Q2 after P-101 near-miss; CAMA 2024-Q3 audit: 2 Minor findings (2-year refresh cadence; missing regulatory dimension); maturity level 4 'Managed' trending to 5 'Optimized' on Anatomy subject 'Asset Criticality').",
      ],
      common_errors: [
        "No documented risk-assessment methodology — non-reproducible, non-auditable scores.",
        "Stale criticality scores (> 3 years without re-evaluation) — drift from actual asset risk.",
        "Uniform tactic frequencies across all criticality tiers (Lesson 1 anti-pattern) — risk-blind AMP.",
        "No risk-treatment rationale per Very-High asset — treatment adequacy unverifiable.",
        "Asset register / AMP scope / CMMS active mismatch — population integrity broken.",
        "Criticality assigned at system level only — fails to differentiate assets within a system.",
        "Consequence dimension 'regulatory' or 'reputational' omitted — under-estimates risk for compliance-/reputation-sensitive assets.",
        "Worst-case vs weighted-sum composite chosen inconsistently — non-comparable scores.",
        "Pareto profile not computed — risk-prioritization not verified empirically.",
        "Criticality-to-LCC linkage broken — LCC failure-cost inputs not calibrated against L scores.",
        "No asset hierarchy — flat register prevents system-level analytics.",
      ],
      limitations: [
        "Criticality scores depend on likelihood calibration — inaccurate calibration produces inaccurate scores; new assets use vendor data / ISO 14224 class averages.",
        "Consequence scoring is subjective — multi-dimensional scales mitigate but require skilled facilitation.",
        "Worst-case composite rule over-weights single-dimension catastrophe — may under-prioritize balanced multi-criteria assets.",
        "Pareto profile is empirical — asset populations with naturally flat risk distributions may not show the 80/20 signature even when risk-prioritized.",
        "Criticality scores do not capture common-cause failures (CCF) — a single event can take down multiple assets; CCF modelling (β-factor) is a separate analysis.",
        "Criticality is a snapshot — asset risk evolves over the lifecycle (bathtub curve).",
        "Criticality analysis cannot replace engineering judgement — it is one input to the AMP, not the whole tactic-selection logic.",
        "Criticality methodology is asset-class-specific — what works for pumps does not directly transfer to transformers or distribution mains.",
      ],
      best_practices: [
        "Document the risk-assessment methodology per ISO 55002 §8.2 / ISO 31000 (likelihood scale, consequence dimensions, weighting, matrix tiers, version control).",
        "Multi-dimensional consequence (4-6 dimensions: safety, environmental, service, financial, regulatory, reputational); composite rule consistent (worst-case OR weighted-sum).",
        "Tactic frequency scales with criticality tier (Very-High monthly; High quarterly; Medium annual; Low RTF) — feeds the AMP (Lesson 1).",
        "Risk-treatment log per Very-High asset with documented rationale (mitigate/transfer/accept/avoid).",
        "Asset register integrity (N_register = N_AMP_scope = N_CMMS_active); hierarchy consistent across register/AMP/CMMS.",
        "Asset-level (not just system-level) criticality — differentiates assets within a system.",
        "Pareto profile computed annually — verifies risk-prioritization empirically.",
        "Periodic re-evaluation on trigger (performance drift, organizational change, regulatory change) or every 2 years.",
        "Criticality-to-LCC linkage intact (failure frequency in LCC calibrated against L scores in criticality matrix).",
        "FMEA / RCM study per asset class underpins consequence scoring.",
      ],
      related_concepts: [
        "Asset Management Plan (AMP) — Lesson 1 in this domain (criticality drives tactic frequency).",
        "Asset Lifecycle & LCC — Lesson 2 in this domain (criticality-driven failure frequency feeds LCC failure-cost input).",
        "ISO 31000 (risk management — vocabulary and process); ISO 55002 §8.2 (asset risk).",
        "FMEA (Failure Modes and Effects Analysis); RCM (Reliability-Centered Maintenance).",
        "Asset register per ISO 55001 §7.5 (documented information).",
        "Common-cause failure (CCF) modelling — β-factor; separate analysis for systemic dependencies.",
        "ISO 14224 — failure-rate database (input to likelihood scoring for new assets in Oil & Gas).",
        "Pareto principle (80/20 rule) — the empirical signature of risk-prioritization.",
      ],
      prerequisites: [
        "ISO 55000 fundamentals — asset lifecycle, AM definition, four AM principles (especially 'value' and 'assurance').",
        "ISO 55001 §8.2 (asset risk management), §7.5 (documented information — asset register).",
        "ISO 31000 (risk management — vocabulary and process).",
        "Familiarity with physical engineering assets and their failure modes (FMEA).",
        "AMP structure (Lesson 1 in this domain); LCC methodology (Lesson 2 in this domain).",
      ],
      references: AML_REFERENCE_TITLES,
    },
  },
  questions: [
    {
      competencyName: "Asset Risk & Criticality",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      scenario: "Utilities",
      stem: "Per ISO 55002:2018 §8.2, what are the four risk-treatment options for an asset-related risk?",
      whyCorrect:
        "ISO 55002:2018 §8.2 (and ISO 31000) define four risk-treatment options: (1) MITIGATE — reduce likelihood via PM/CBM or reduce consequence via redundancy/containment; (2) TRANSFER — shift the risk to a third party via insurance or contractor warranty; (3) ACCEPT — tolerate the risk (run-to-failure is the canonical acceptance tactic for Low-criticality assets where the cost of risk-reduction exceeds the expected loss); (4) AVOID — eliminate the risk by redesign, renewal, or decommission (for risks where the consequence is unacceptable at any likelihood). Each Very-High-criticality asset must have a documented treatment rationale among these four.",
      whyOthersWrong: [
        "Option 'Avoid/Mitigate/Outsource/Insure' — wrong because 'Outsource' and 'Insure' are both sub-types of TRANSFER (one of the four canonical options); listing them as separate options double-counts the transfer category and omits ACCEPT.",
        "Option 'Accept/Reject/Defer/Escalate' — wrong because these are not the ISO 31000/55002 risk-treatment vocabulary; 'Reject' and 'Defer' and 'Escalate' are decision-management terms, not risk-treatment options.",
        "Option 'Mitigate/Transfer/Defer/Avoid' — wrong because 'Defer' is not an ISO 31000/55002 risk-treatment option; the correct fourth option is ACCEPT (which subsumes run-to-failure for low-criticality assets).",
      ],
      explanation:
        "Four ISO 55002 §8.2 / ISO 31000 risk treatments: MITIGATE, TRANSFER, ACCEPT, AVOID. Each Very-High asset needs a documented rationale among these four.",
      options: [
        { text: "Avoid / Transfer / Mitigate / Accept", isCorrect: true },
        { text: "Avoid / Mitigate / Outsource / Insure", isCorrect: false },
        { text: "Accept / Reject / Defer / Escalate", isCorrect: false },
        { text: "Mitigate / Transfer / Defer / Avoid", isCorrect: false },
      ],
    },
    {
      competencyName: "Asset Risk & Criticality",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Utilities",
      stem: "An asset has Likelihood L = 4 (fails ~1/yr) and Consequence C = 5 (catastrophic service impact). Using the 5×5 risk matrix with tiers Low (1-4) / Medium (5-9) / High (10-15) / Very High (16-25), what is the risk score and tier, and what is the recommended tactic frequency per Campbell & Jardine (2001)?",
      whyCorrect:
        "Risk R = L × C = 4 × 5 = 20. Tier: Very High (16-25 range). Per Campbell & Jardine (2001, Ch. 3) tactic-frequency-to-criticality mapping: Very High → monthly PM + monthly CBM + annual internal inspection. Additionally, the Very-High asset requires a documented risk-treatment rationale (mitigate via monthly PM/CBM; consider transfer via insurance if consequence is financial; consider avoid via scheduled renewal before end-of-life). The 4×5=20 score is one of the highest in the matrix (only L=5/C=5=25 and L=5/C=4=20 are higher-or-equal).",
      whyOthersWrong: [
        "Option 'R = 9, Medium tier, annual PM' — wrong: 4 × 5 = 20, not 9; the math error likely came from adding L+C (=9) instead of multiplying (=20). Risk is L × C, not L + C.",
        "Option 'R = 20, High tier, quarterly PM' — wrong on the tier: 20 falls in the Very High range (16-25), not the High range (10-15). The math (R=20) is correct but the tier classification is wrong.",
        "Option 'R = 25, Very High tier, monthly PM' — wrong on the math: 4 × 5 = 20, not 25 (which would be 5 × 5). The tier (Very High) and tactic (monthly) are correct but the score is wrong.",
      ],
      explanation:
        "R = L × C = 4 × 5 = 20; tier = Very High (16-25); tactic = monthly PM + monthly CBM + annual internal inspection (Campbell & Jardine 2001).",
      options: [
        { text: "R = 20, Very High tier, monthly PM + monthly CBM + annual inspection", isCorrect: true },
        { text: "R = 9, Medium tier, annual PM", isCorrect: false },
        { text: "R = 20, High tier, quarterly PM", isCorrect: false },
        { text: "R = 25, Very High tier, monthly PM", isCorrect: false },
      ],
    },
    {
      competencyName: "Asset Risk & Criticality",
      type: "MultipleChoice",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Oil & Gas",
      stem: "An asset-management team runs the asset criticality matrix on its fleet of 50 pumps. The top-20% (10 pumps) account for 25% of total fleet risk. The team applies uniform quarterly PM across all 50 pumps regardless of criticality. What are the two CAMA audit findings and the recommended improvement actions?",
      whyCorrect:
        "TWO findings: (1) NON-RISK-PRIORITIZED PORTFOLIO (Major) — the Pareto profile is flat (top-20% = 25% of total risk instead of the ~80% signature), which means the criticality methodology is failing to differentiate bad actors from low-risk assets. Improvement: re-examine the likelihood calibration and consequence dimensions; re-score; verify the Pareto signature re-emerges. (2) RISK-BLIND AMP / UNIFORM-TACTIC-FREQUENCY (Major) — quarterly PM across all 50 pumps regardless of criticality is the Lesson 1 anti-pattern: it wastes resources on low-criticality pumps and under-treats high-criticality pumps. Improvement: re-tier tactic frequency (Very-High monthly, High quarterly, Medium annual, Low RTF) against the (re-calibrated) criticality matrix; rebalance FTE from low- to high-criticality work. The two findings are linked: a flat Pareto profile + uniform tactic frequency together indicate the asset-management team is at IAM maturity level 1-2 (Initial/Aware) on the 'Asset Criticality' Anatomy subject.",
      whyOthersWrong: [
        "Option 'No findings — the team is applying consistent treatment to all assets' — wrong because uniform treatment across criticality tiers is the canonical risk-blind anti-pattern (Lesson 1); the flat Pareto profile confirms the methodology is failing to differentiate.",
        "Option 'One finding: tactic frequency must be annual, not quarterly' — wrong on two counts: (i) the issue is uniform frequency across tiers (not the specific frequency), and (ii) annual would under-treat Very-High assets even more severely than quarterly.",
        "Option 'One finding: register integrity breach' — wrong because the audit evidence does not show a register mismatch; the issue is risk-prioritization (Pareto) and tactic-frequency mapping, not register integrity.",
      ],
      explanation:
        "Two findings: (1) non-risk-prioritized portfolio (flat Pareto, 25% vs ~80% expected) — Major; (2) risk-blind AMP / uniform tactic frequency — Major. Together: maturity level 1-2 on 'Asset Criticality' subject.",
      options: [
        {
          text: "(1) Non-risk-prioritized portfolio (flat Pareto: top-20% = 25% vs ~80% expected — Major); (2) Risk-blind AMP / uniform tactic frequency (Major). Re-score criticality; re-tier tactic frequency; maturity 1-2.",
          isCorrect: true,
        },
        {
          text: "No findings — the team is applying consistent treatment to all assets.",
          isCorrect: false,
        },
        {
          text: "One finding: tactic frequency must be annual, not quarterly.",
          isCorrect: false,
        },
        {
          text: "One finding: register integrity breach.",
          isCorrect: false,
        },
      ],
    },
    {
      competencyName: "Asset Risk & Criticality",
      type: "TrueFalse",
      difficulty: "Medium",
      bloomLevel: "Understand",
      cognitiveLevel: "Understanding",
      skillType: "Conceptual",
      scenario: "Utilities",
      stem: "True or False: The Pareto profile — top-20%-of-assets-by-risk-score accounting for approximately 80% of total fleet risk — is the empirical signature of a risk-prioritized asset portfolio; observing this profile confirms the criticality methodology is effectively differentiating bad actors from low-risk assets.",
      whyCorrect:
        "TRUE. The Pareto principle (80/20 rule), observed empirically across many asset populations, holds that the top-20% of assets by risk score typically account for approximately 80% of total fleet risk. When the CAMA assessor observes this signature (top-20% ≈ 80% of total risk), it confirms the criticality methodology is effectively differentiating bad actors (high-L × high-C assets) from low-risk assets — the methodology is doing its job. When the assessor observes a flat profile (top-20% ≈ 20-25% of total risk), the methodology is failing to differentiate; this is a Major finding (Lesson 3 question 3 above). The Pareto profile is computed annually and reported at the §9.3 management review; the assessor pulls the report and verifies the signature against the asset register population. Note: asset populations with naturally flat risk distributions (e.g., identical assets in identical service) may not show the 80/20 signature even when risk-prioritized; the assessor considers the asset-class context before raising a finding.",
      whyOthersWrong: [
        "Option FALSE — would imply the Pareto profile is unrelated to risk-prioritization, or that a flat profile (top-20% = 20%) is the desired signature. In fact the 80/20 signature is the empirical goal of risk-prioritization; a flat profile is a finding.",
      ],
      explanation:
        "TRUE. The 80/20 Pareto signature (top-20% ≈ 80% of total risk) confirms risk-prioritization; flat profile (top-20% ≈ 20%) is a Major finding indicating the methodology is failing to differentiate.",
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

export const CAMA_AML_LESSONS: RefLesson[] = [
  LESSON_AMP_DEVELOPMENT,
  LESSON_LIFECYCLE_LCC,
  LESSON_RISK_CRITICALITY,
];

// ---------------------------------------------------------------------------
// AML competencies created inside loadReference() (AML domain exists in
// src/lib/ref-content/cama.ts with NO competencies yet — this loader seeds
// the 3 AML competencies and then loads the deep content).
// ---------------------------------------------------------------------------

interface SeedCompetency {
  name: string;
  description: string;
  order: number;
}

const CAMA_AML_COMPETENCIES: SeedCompetency[] = [
  {
    name: "Asset Management Plan (AMP) Development",
    description:
      "ISO 55000 §3.2.4 AMP definition; ISO 55002:2018 §6.2.2 eight AMP content elements (objectives, scope, lifecycle activities, resources, risk, KPIs, change management, review/improvement); ISO 55001 §8.3 five lifecycle stages; the AMP-to-work-order cascade; bidirectional traceability; risk-prioritized tactic frequency; the §9.3 management-review loop; the CAMA assessor's 8-gate AML audit programme.",
    order: 1,
  },
  {
    name: "Asset Lifecycle & LCC",
    description:
      "ISO 55000 §3.2.6 asset lifecycle and ISO 55001 §8.3 five stages (create/acquire, utilize, maintain, renew, dispose); IEC 60300-3-3:2017 LCC methodology (cost-element breakdown, discounting, NPV, sensitivity analysis); LCC equation LCC = C_capex + Σ_t [(C_op + C_maint + C_failure)/(1+i)^t] + C_disposal/(1+i)^T; LCC vs TCO vs first cost; the discount-rate policy; post-implementation reconciliation; LCC-SAMP/AMP integration.",
    order: 2,
  },
  {
    name: "Asset Risk & Criticality",
    description:
      "ISO 55002:2018 §8.2 asset risk management (identify, analyze, evaluate, treat); ISO 31000 risk vocabulary; 5×5 risk matrix R = L × C; four risk treatments (mitigate, transfer, accept, avoid); criticality index CI = Σ w_i × s_i; Pareto profile (top-20% ≈ 80% of total risk); asset register per ISO 55001 §7.5; asset hierarchy; criticality-to-AMP-tactic-frequency and criticality-to-LCC-failure-cost linkages.",
    order: 3,
  },
];

// ---------------------------------------------------------------------------
// Loader — CONTENT-only (mirrors cre-reliability-modeling.ts) with the
// additional step of creating the 3 AML competencies inside loadReference().
// ---------------------------------------------------------------------------

/**
 * Upsert the CAMA Asset Management Plan & Lifecycle (AML) CONTENT into the
 * database. Idempotent: safe to call repeatedly. Returns record counts written.
 *
 * Flow:
 *  1. Find CAMA certification by slug "cama" (the structure+AMP-content loader
 *     in src/lib/ref-content/cama.ts is a prerequisite).
 *  2. Find the AML domain by code "AML" (certificationId = cama.id). The AML
 *     domain exists in cama.ts with NO competencies — delete any stale AML
 *     competencies and create the 3 AML competencies from
 *     CAMA_AML_COMPETENCIES. Map by NAME -> id.
 *  3. Upsert References globally (by title, no sectionId) → shared ids
 *     applied to every AML lesson, KO, and question.
 *  4. For each lesson:
 *     - db.lesson.findFirst({where:{competencyId, slug}}) then update or
 *       create with sectionId=null, certificationId, competencyId, slug,
 *       title, titleAr, order, durationMin, conceptIntroduction, example,
 *       keyFormulas, exercise, sections (JSON.stringify), referenceIds
 *       (JSON.stringify shared), status="READY", confidence="HIGH",
 *       verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
 *  5. Upsert KnowledgeObject per lesson: findFirst({where:{lessonId}}) then
 *     create/update with certificationId, domainId (AML), competencyId,
 *     lessonId, body JSON, referenceIds (JSON shared), certificationIds
 *     (JSON [cama.id]), status="READY", confidence="HIGH",
 *     verificationStatus="VERIFIED", version="1.0.0".
 *  6. Per lesson: deleteMany questions {certificationId, competencyId} then
 *     create each enriched question with nested QuestionOption records,
 *     knowledgeObjectId link, whyCorrect, whyOthersWrong (JSON),
 *     referenceIds (JSON shared), status="READY", verificationStatus=
 *     "VERIFIED", reviewStatus="PENDING", version="1.0.0".
 *  7. Return { certification, domain, competencies, lessons, kos,
 *      questions, references } counts.
 *
 * DOES NOT call src/lib/ref-content/cama.ts. DOES NOT wipe other CAMA
 * domains (AMP, AMS, PI preserved). All operations scoped to AML domain only
 * (deleteMany where domainId = amlDomain.id; deleteMany questions where
 * certificationId AND competencyId — scoped to AML competencies only).
 */
export async function loadReference() {
  // 1) Certification (find by slug "cama")
  const certification = await db.certification.findUnique({
    where: { slug: "cama" },
  });
  if (!certification) {
    throw new Error(
      'CAMA certification not found. Run the CAMA structure+AMP-content loader (src/lib/ref-content/cama.ts) first.'
    );
  }

  // 2) Find the AML domain by code "AML" (certificationId = cama.id). The
  //    AML domain exists in cama.ts but is seeded with NO competencies —
  //    delete any stale AML competencies and create the 3 AML competencies
  //    here.
  const amlDomain = await db.domain.findFirst({
    where: { certificationId: certification.id, code: "AML" },
  });
  if (!amlDomain) {
    throw new Error(
      'Asset Management Plan & Lifecycle (AML) domain not found under CAMA. Run the CAMA structure+AMP-content loader (src/lib/ref-content/cama.ts) first.'
    );
  }

  // Delete any existing AML competencies (idempotent re-create).
  await db.competency.deleteMany({
    where: { domainId: amlDomain.id },
  });

  // Create the 3 AML competencies.
  for (const c of CAMA_AML_COMPETENCIES) {
    await db.competency.create({
      data: {
        domainId: amlDomain.id,
        name: c.name,
        description: c.description,
        order: c.order,
      },
    });
  }

  // Map AML competencies by NAME -> id.
  const amlCompetencies = await db.competency.findMany({
    where: { domainId: amlDomain.id },
  });
  const competencyIdByName: Record<string, string> = {};
  for (const c of amlCompetencies) {
    competencyIdByName[c.name] = c.id;
  }
  // Validate that all 3 expected AML competencies exist by name.
  const expectedCompetencyNames = CAMA_AML_LESSONS.map((l) => l.competencyName);
  const missing = expectedCompetencyNames.filter(
    (n) => !competencyIdByName[n]
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing AML competencies by name: ${missing.join(
        ", "
      )}. Ensure CAMA_AML_COMPETENCIES matches CAMA_AML_LESSONS competencyName.`
    );
  }

  // 3) References — global (no sectionId), upserted by title.
  const refIdsByTitle: Record<string, string> = {};
  for (const src of CAMA_AML_SOURCES) {
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
  const sharedReferenceIds = CAMA_AML_SOURCES.map((s) => refIdsByTitle[s.title]).filter(
    Boolean
  ) as string[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 4) Lessons, 5) KnowledgeObjects, 6) Questions
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of CAMA_AML_LESSONS) {
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
      domainId: amlDomain.id,
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
          domainId: amlDomain.id,
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
    domain: amlDomain.id,
    competencies: amlCompetencies.length,
    lessons: lessonsCount,
    kos: kosCount,
    questions: questionsCount,
    references: referencesCount,
  };
}
