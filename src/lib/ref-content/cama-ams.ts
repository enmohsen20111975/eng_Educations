// =============================================================================
// CAMA — Certified Asset Management Assessor (IFANM/World Partners) — Asset
// Management System (AMS) pillar — Deep scientific reference (Task 17-CAMA-AMS).
//
// Certification slug: "cama" (IFANM/World Partners, "Maintenance & Reliability"
// group). Domain code: "AMS" (Asset Management System, ISO 55001) — the 2nd of
// 4 CAMA BOK domains (AMP, AMS, AML, PI). The AMS domain exists in
// src/lib/ref-content/cama.ts (combined structure+AMP-content loader) with NO
// competencies. This CONTENT-only loader creates the 3 AMS competencies inside
// loadReference() and then loads the deep scientific content (3 full-spec
// 24-section lessons + KOs + 12 enriched questions).
//
// Three lessons, one per AMS competency (created below in loadReference()):
//   1. Context of the Organization (ISO 55001 §4)  (slug: ams-context-of-the-organization)
//   2. Leadership & Support (§5, §7)                (slug: ams-leadership-support)
//   3. Operation & Performance Evaluation (§8, §9) (slug: ams-operation-performance-evaluation)
//
// Each lesson ships:
//   - The full 24-section data-collector template (spec §9, LESSON_TEMPLATE in
//     src/lib/spec.ts), with every applicable section filled with real,
//     in-depth ISO 55001 / IAM content. No padding.
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
// Source hierarchy (spec §5) — Levels 2, 5:
//   - LEVEL 2 — Official Standard / Standards Organization: ISO 55000:2014,
//     ISO 55001:2014, ISO 55002:2018, ISO 19011:2018 (auditing).
//   - LEVEL 5 — Professional Organizations: The IAM (Institute of Asset
//     Management) "Asset Management — An Anatomy"; The IAM "Asset Management
//     Maturity Model".
//
// Originality (spec §16): all worked examples, decision scenarios, case
// studies, and questions are authored for this platform; textbook and
// standard material is summarized and cited, not reproduced. Case studies are
// SYNTHETIC and explicitly marked `CASE_TYPE = SYNTHETIC` inside the lesson
// text.
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
// SOURCES — 6 real references cited across all AMS lessons.
// ---------------------------------------------------------------------------

export const CAMA_AMS_SOURCES: RefSource[] = [
  {
    title: "ISO 55001:2014 — Asset management — Management systems — Requirements",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/55089.html",
    citation:
      "International Organization for Standardization. ISO 55001:2014, Asset management — Management systems — Requirements. Geneva: ISO. Specifies the requirements for an asset management system (AMS) along the Plan-Do-Check-Act framework: §4 context of the organization (understanding the organization and its context, needs of interested parties, scope of the AMS, AMS processes), §5 leadership (leadership & commitment, policy, roles/responsibilities/authorities), §6 planning, §7 support (resources, competence, awareness, communication, documented information), §8 operation (operational planning & control, management of change, outsourcing), §9 performance evaluation (monitoring/measurement/analysis, internal audit, management review), §10 improvement. The standard CAMA assessors assess conformance against.",
  },
  {
    title: "ISO 55000:2014 — Asset management — Overview, principles and terminology",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/55088.html",
    citation:
      "International Organization for Standardization. ISO 55000:2014, Asset management — Overview, principles and terminology. Geneva: ISO. Defines asset, asset management, asset management system, asset management plan, the four principles (value, alignment, leadership, assurance), and the asset lifecycle. Establishes the terminology that underpins every clause of ISO 55001 and is the canonical glossary for CAMA assessors when interpreting §4 context and §5.2 policy.",
  },
  {
    title: "ISO 55002:2018 — Asset management — Management systems — Guidelines for the application of ISO 55001",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/69070.html",
    citation:
      "International Organization for Standardization. ISO 55002:2018, Asset management — Management systems — Guidelines for the application of ISO 55001. Geneva: ISO. Provides interpretive guidance for each ISO 55001 clause: how to define AMS scope (§4.3), how to write the asset management policy (§5.2), how to determine the needs of interested parties (§4.2), how to control documented information (§7.5), how to plan operational controls and management of change (§8.1/§8.2), and how to perform internal audit (§9.2) and management review (§9.3). Indispensable companion to ISO 55001 for the CAMA assessor.",
  },
  {
    title: "The IAM — Asset Management — An Anatomy (Institute of Asset Management)",
    level: "5",
    levelLabel: "Professional Organizations",
    type: "BOOK",
    url: "https://theiam.org/what-is-asset-management/anatomy-of-asset-management/",
    citation:
      "Institute of Asset Management (IAM). Asset Management — An Anatomy (3rd ed., 2014, updated 2023). The definitive conceptual reference for asset management, presenting 39 AM subjects grouped under six conceptual groups (Strategy & Planning; Asset Management Decision-Making; Lifecycle Delivery; Risk & Reliability; Health, Safety, Environment & Quality; Asset Information). Provides the AM knowledge framework that complements ISO 55000's principles and underpins the IAM competency scheme and CAMA assessor training. The Anatomy's 'Strategy & Planning' and 'Health, Safety, Environment & Quality' groups map directly to ISO 55001 §4 (context) and §7 (support).",
  },
  {
    title: "The IAM — Asset Management Maturity Model (Institute of Asset Management)",
    level: "5",
    levelLabel: "Professional Organizations",
    type: "BOOK",
    url: "https://theiam.org/what-is-asset-management/maturity/",
    citation:
      "Institute of Asset Management (IAM). Asset Management Maturity Assessment Framework / Maturity Model. A structured five-level maturity scale (1 Initial/Ad-hoc → 2 Aware → 3 Defined → 4 Managed → 5 Optimized) applied to the 39 AM Anatomy subjects. The CAMA assessor uses the maturity model to score evidence during assessment and to identify improvement opportunities; the model is also the backbone of the IAM self-assessment tool. The maturity score per subject combines evidence strength, integration, and outcome.",
  },
  {
    title: "ISO 19011:2018 — Guidelines for auditing management systems",
    level: "2",
    levelLabel: "Official Standard / Standards Organization",
    type: "STANDARD",
    url: "https://www.iso.org/standard/70017.html",
    citation:
      "International Organization for Standardization. ISO 19011:2018, Guidelines for auditing management systems. Geneva: ISO. Provides the canonical auditing framework: audit principles (integrity, fair presentation, due professional care, confidentiality, independence, evidence-based approach), managing an audit programme (audit programme objectives, scope, criteria, competence of auditors, evaluation of auditors), and conducting an audit (audit plan, opening meeting, evidence collection, audit findings, closing meeting, audit report, follow-up). The standard an ISO 55001 §9.2 internal audit programme is required to conform to (the AMS assessor evaluates audit-programme conformance against ISO 19011).",
  },
];

const AMS_REFERENCE_TITLES = CAMA_AMS_SOURCES.map((s) => s.title);

// ---------------------------------------------------------------------------
// Lesson 1 — Context of the Organization (ISO 55001 §4)
// (Competency: "Context of the Organization (ISO 55001 §4)";
//  slug: ams-context-of-the-organization)
// ---------------------------------------------------------------------------

const LESSON_CONTEXT: RefLesson = {
  competencyName: "Context of the Organization (ISO 55001 §4)",
  slug: "ams-context-of-the-organization",
  title: "Context of the Organization (ISO 55001 §4)",
  titleAr: "سياق المنظمة (ISO 55001 §4)",
  order: 1,
  durationMin: 35,
  references: AMS_REFERENCE_TITLES,
  conceptIntroduction: `ISO 55001 §4 is the foundation clause of the Asset Management System (AMS): before an organization writes policy, sets objectives, or builds lifecycle plans, it must understand itself and its context. §4.1 requires the organization to determine external and internal issues that affect its ability to achieve the intended outcomes of its AMS — issues that come from political, economic, social, technological, legal, and environmental (PESTLE) domains and from internal capability, culture, asset portfolio, and financial position. §4.2 then requires identifying the interested parties (stakeholders) whose needs and expectations are relevant to the AMS — regulators, customers, shareholders, employees, suppliers, communities, and insurers — and translating those needs into requirements the AMS must satisfy. §4.3 sets the scope of the AMS: which assets, asset systems, asset classes, functions, geographic boundaries, and organizational units are inside the AMS and which are outside (with explicit exclusions). §4.4 requires the AMS processes to be determined: the PDCA processes the organization uses to apply the requirements of ISO 55001 — the policy (§5.2), the SAMP, AMPs, risk assessment, operational controls, audits, and management review — and how those processes interact. A CAMA assessor scores §4 maturity by examining the documented context analysis, the stakeholder matrix, the scope statement, and the process map.`,
  example: `A regional transmission utility performs a §4.1 context analysis: external issues include the regulator's price-control (5-year revenue cap), the UK Net-Zero 2050 statutory target, the National Grid ESO's transmission expansion plan, the rise of distributed renewables (intermittency stresses assets), IEC 61850 substation automation, and the EA's environmental permitting regime. Internal issues include a £2.3bn asset portfolio (mostly 132/33 kV transformers, cables, OHL), a 23% workforce eligible for retirement in 5 years (succession risk), a SAP-based asset register of limited fidelity, and a culture of "fix-on-failure" that contradicts the asset-management policy. PESTLE+stakeholder matrix reveals that regulator (Ofgem) and Net-Zero target are the highest-impact drivers → scope statement explicitly includes Net-Zero-aligned asset renewal and excludes generation assets (out of licence).`,
  keyFormulas: `Maturity score per subject (IAM Maturity Model):
  M_subject = w_e · S_evidence + w_i · S_integration + w_o · S_outcome
where S_evidence, S_integration, S_outcome ∈ {1..5} (levels), weights w_e=0.4, w_i=0.3, w_o=0.3 (default).
Overall maturity M_org = (1/N) · Σ_{j=1}^{N} M_subject_j  (mean across N subjects).
Stakeholder influence-impact matrix score (high/medium/low) → priority.

Example: SAMP subject with S_evidence=4, S_integration=3, S_outcome=3 →
  M_SAMP = 0.4·4 + 0.3·3 + 0.3·3 = 1.6 + 0.9 + 0.9 = 3.4 (Level 3 Defined, near Level 4).`,
  exercise: `You are the CAMA assessor reviewing a container terminal's AMS. (a) List the four ISO 55001 §4 sub-clauses and the evidence you would request for each. (b) The terminal's scope statement says "the AMS covers all cranes, yard equipment, and IT/OT systems at Port X." Identify what is missing from the scope statement per ISO 55002:2018 §4.3 guidance. (c) The terminal scores M_evidence = 3, M_integration = 4, M_outcome = 2 on the "stakeholder engagement" subject. Compute the maturity score (default weights) and recommend one improvement action to move M_outcome from 2 to 3.`,
  sections: {
    learning_objectives: `- Determine external and internal issues affecting the AMS per ISO 55001 §4.1 using a PESTLE framework and a capability/culture audit.
- Identify interested parties and their relevant needs/expectations per §4.2; construct a stakeholder influence-impact matrix.
- Define the AMS scope per §4.3 — boundaries, asset systems included/excluded, organizational units, geographic limits, functions.
- Determine the AMS processes per §4.4 and map their interactions (PDCA loop, SAMP→AMP→operational controls→audit→review).
- Connect §4 to §5.2 policy — the policy must respond to context issues, parties' needs, and the scope statement.
- Apply the IAM Maturity Model to score the "context" and "stakeholders" subjects and identify improvement actions.`,
    prerequisites: `- The CAMA Asset Management Principles (AMP) domain — especially the four ISO 55000 principles (value, alignment, leadership, assurance) and the asset lifecycle.
- Familiarity with management-system standards (ISO 9001 QMS, ISO 14001 EMS, ISO 45001 OHSMS) and the common ISO Annex SL high-level structure (HLS).
- Stakeholder analysis fundamentals (power-interest grid, influence-impact matrix).
- PESTLE analysis technique for external environmental scanning.`,
    introduction: `ISO 55001 §4 is the contextual foundation clause. Without a documented context analysis, the AMS is a paperwork exercise — the policy, objectives, and asset plans are abstracted from the real organizational situation and lose their ability to drive value. The CAMA assessor therefore begins every assessment by examining §4 evidence: the context analysis (§4.1), the stakeholder list and requirements (§4.2), the scope statement (§4.3), and the process map (§4.4). Where §4 maturity is low, every later clause — leadership, planning, support, operation, performance evaluation — inherits the weakness: a scope statement that omits the regulator's Net-Zero obligation will produce a SAMP that does not address Net-Zero; a stakeholder list that omits the insurer will produce a risk assessment that ignores HSB/property insurance requirements.

The four §4 sub-clauses are interconnected: §4.1 (context) identifies the issues; §4.2 (parties) identifies who cares about each issue and what they require; §4.3 (scope) translates issues+parties into the AMS boundary; §4.4 (processes) operationalizes the boundary into PDCA processes. The §5.2 asset-management policy then states the organization's response to the §4 picture — its intent and direction. ISO 55002:2018 provides interpretive guidance on each sub-clause: how to structure the context analysis, how to use a stakeholder matrix, how to write a scope statement that survives audit, how to draw a process map. The IAM Anatomy's "Strategy & Planning" group and the IAM Maturity Model give the assessor the subject-level scoring rubric.`,
    terminology: `- **External issues (§4.1)**: factors arising from the political, economic, social, technological, legal, and environmental context — PESTLE factors — that affect the AMS outcomes.
- **Internal issues (§4.1)**: factors arising from the organization's capability, culture, asset portfolio, financial position, governance, and information systems.
- **Interested party (§4.2)**: stakeholder whose needs and expectations are relevant to the AMS — regulator, customer, shareholder, employee, supplier, community, insurer, lender.
- **Need/expectation (§4.2)**: a requirement (statutory, contractual, or voluntary) an interested party has that the AMS must address.
- **Scope of the AMS (§4.3)**: the boundary — assets, asset systems, functions, geographic and organizational limits — within which the AMS applies; exclusions are explicit and justified.
- **AMS processes (§4.4)**: the PDCA processes the organization uses to apply ISO 55001 requirements — policy, SAMP, AMPs, risk, operational controls, audit, review — and their interactions.
- **PESTLE analysis**: Political, Economic, Social, Technological, Legal, Environmental scan for external issues.
- **Influence-impact matrix**: stakeholder analysis tool plotting influence (power to act on the org) vs impact (effect on the org) — yields four priority quadrants.
- **Asset management policy (§5.2)**: top management's statement of intent and direction for AM, set in response to §4 context and re-affirmed at management review (§9.3).
- **PDCA**: Plan-Do-Check-Act cycle that ISO 55001 follows; §4-6 = Plan, §7-8 = Do, §9 = Check, §10 = Act.
- **IAM Anatomy subject (Strategy & Planning group)**: 39 subjects in 6 groups; "Stakeholder management" and "Asset management strategy" are §4-aligned.`,
    detailed_explanation: `ISO 55001 §4.1 demands a *determined* context — not a guess. The assessor looks for documented evidence: a PESTLE scan with dated entries, a SWOT or capability audit of the organization, and a review cycle (the context analysis is a living document, re-visited at least annually and after major events — regulator decision, M&A, climate event, technology shift). ISO 55002:2018 §A.4.1 suggests considering the organization's purpose, vision, mission, values, strategic direction, complexity, size, locations, and the assets' nature (physical, informational, intangible). The maturity bar for §4.1 rises from Level 1 (no documented analysis) → Level 2 (ad-hoc PESTLE done once) → Level 3 (documented and reviewed annually) → Level 4 (cross-functional, evidence-based, integrated with risk register) → Level 5 (continuously refreshed, scenario-modelled, drives SAMP re-planning).

§4.2 requires *relevant* interested parties to be identified and their needs *translated into AMS requirements*. A bare "list of stakeholders" is insufficient — the assessor demands a stakeholder matrix that pairs each party with a specific need (e.g., "Regulator (Ofgem) — RIIO-T price control compliance — Asset-Health-Index reporting quarterly") and shows traceability to AMS requirements (objectives, KPIs, AMP controls). The influence-impact matrix classifies each party into Manage Closely / Keep Satisfied / Keep Informed / Monitor — prioritizing engagement.

§4.3 scope is the AMS boundary. ISO 55002:2018 §A.4.3 guidance requires the scope to specify (a) the assets/asset systems included (and excluded, with justification), (b) the functions included, (c) the organizational units included, (d) the geographic boundaries, (e) the activities included (e.g., capital delivery, operations, maintenance, disposal). A scope statement like "all assets" fails maturity Level 2 — the assessor rejects it.

§4.4 requires AMS processes to be determined and their interactions defined. The standard process map shows the PDCA loop: policy (§5.2) → SAMP (§6.2) → AMPs → risk (§6.3) → operational controls (§8.1) → monitoring (§9.1) → audit (§9.2) → review (§9.3) → improvement (§10). A flow diagram with hand-offs between functions documents §4.4 conformance. The assessor samples one process end-to-end to verify the map matches reality.

§5.2 policy responds to §4: it must be appropriate to the organization's purpose (§4.1), provide a framework for objectives (which derive from §4.2 party needs), commit to requirements (statutory from §4.1 legal/§4.2 parties), and commit to continual improvement (§10 PDCA).`,
    core_principles: `- Context is foundational: §4 anchors every later clause; weak context produces a weak AMS.
- External and internal issues are equally weighted — neither may be omitted.
- Interested parties are only those *relevant* to the AMS — not a generic stakeholder list.
- Scope is a boundary with explicit exclusions; "all assets" fails conformance.
- AMS processes are PDCA-structured and interact across functional silos.
- The asset-management policy (§5.2) is the organizational response to §4.
- Context is a living document: re-visited annually and after material events.
- Maturity rises when context analysis drives SAMP re-planning and improvement actions.`,
    components: `- PESTLE scan (external issues register, dated entries).
- Capability & culture audit (internal issues register).
- Stakeholder matrix (party → need → AMS requirement traceability).
- Influence-impact matrix (engagement priority).
- Scope statement (assets, functions, units, geography, exclusions with justification).
- Process map (PDCA flow with hand-offs between functions).
- Asset-management policy statement (§5.2).
- Context review log (annual review, event-triggered review).
- SAMP (cross-references context issues and party needs).
- Maturity self-assessment scorecard (per IAM Anatomy subject).`,
    process: `1. Convene a cross-functional context workshop (operations, engineering, finance, HSE, legal, IT, HR, executive); appoint a facilitator.
2. Run the PESTLE scan: capture political, economic, social, technological, legal, environmental factors with date, source, owner, and impact rating.
3. Run the internal capability audit: asset portfolio, workforce, financial position, culture, information systems, governance — capture strengths and weaknesses.
4. Identify interested parties; for each, document the need/expectation (statutory, contractual, voluntary) and trace it to an AMS requirement (objective, KPI, AMP control).
5. Plot the influence-impact matrix; classify parties into Manage Closely / Keep Satisfied / Keep Informed / Monitor.
6. Draft the scope statement: assets/asset systems included, functions, units, geography, and explicit exclusions with justification.
7. Map the AMS processes (PDCA): policy → SAMP → AMPs → risk → operational controls → monitoring → audit → review → improvement. Mark hand-offs and process owners.
8. Submit the policy (§5.2) to top management for approval; communicate the policy and scope to interested parties.
9. Schedule annual context review and event-triggered review (regulator decision, M&A, climate event); feed outcomes into SAMP re-planning (§6) and management review (§9.3).`,
    formula_calculation: `Variables and formulas — IAM Maturity score per subject:
  M_subject = w_e · S_evidence + w_i · S_integration + w_o · S_outcome
  where S_evidence, S_integration, S_outcome ∈ {1..5} (level scale),
        default weights w_e=0.4, w_i=0.3, w_o=0.3.
  Overall maturity M_org = (1/N) · Σ_{j=1}^{N} M_subject_j (mean across N subjects).

Stakeholder engagement-priority score (influence-impact, each axis 1..5):
  Priority = Influence · Impact
  → ≥16 = Manage Closely; 9..15 = Keep Satisfied; 4..8 = Keep Informed; 1..3 = Monitor.

Context-issue risk rating (likelihood L ∈ 1..5, impact I ∈ 1..5):
  R_context = L · I → ≥16 priority issue; feeds risk register per §6.3.

Worked numbers: Stakeholder "Regulator (Ofgem)" — Influence=5, Impact=5 → Priority=25 → Manage Closely. Issue "Net-Zero 2050 statutory target" — L=5, I=5 → R=25 → priority issue. SAMP subject maturity: S_evidence=4, S_integration=3, S_outcome=3 → M_SAMP = 0.4·4 + 0.3·3 + 0.3·3 = 1.6+0.9+0.9 = 3.4 → Level 3 (Defined), trending to Level 4 (Managed).`,
    worked_example: `CASE_TYPE = SYNTHETIC. Regional transmission utility "Acme T2" (UK, 132/33 kV, £2.3bn RAB). CAMA assessor reviews §4 evidence.

§4.1 Context — PESTLE extracts (external): Political = UK Net-Zero 2050 statutory target, BEIS energy strategy; Economic = Ofgem RIIO-T2 price control (5-year revenue cap, TOTEX & ODI incentives); Social = public acceptance of overhead lines, community benefit scheme; Technological = IEC 61850 substation automation, HVDC, asset digital twins; Legal = Electricity Act 1989, EA environmental permits; Environmental = Climate Change Act 2008, biodiversity net gain. Internal: workforce 23% retirement-eligible by year 5; SAP-based asset register (limited fidelity); culture "fix-on-failure"; £450m capex headroom. The PESTLE register is dated, sourced, and cross-references the SAMP.

§4.2 Interested parties & matrix — top-12 parties with needs: Ofgem (RIIO-T2 compliance, AHI reporting quarterly), customers (interruption reductions, CI/LLS incentives), shareholders (6.4% regulated return), employees (CPD, succession), suppliers (UK content, on-time payment), communities (visual amenity, biodiversity), insurer (HSB boiler & machinery survey, HAZOP), lender (covenant compliance), government (security of supply), EA (environmental permit), HSE (health & safety), National Grid ESO (system operator interface). Influence-impact matrix: Ofgem (5·5=25, Manage Closely), customers (4·5=20, Manage Closely), insurer (4·4=16, Manage Closely), community (3·4=12, Keep Satisfied), lender (5·2=10, Keep Satisfied). Each need traces to an AMS requirement (objective/KPI/AMP control) in the SAMP.

§4.3 Scope statement (excerpt): "The AMS applies to Acme T2's licensed transmission activities at nominal voltages ≥33 kV in licensed Area X — assets including 132/33 kV transformers, switchgear, cables, overhead lines, substations, protection and control, SCADA/OT — and the functions of asset planning, capital delivery, operations, maintenance, renewal, and disposal. Excluded: generation assets (out of licence), distribution assets (<33 kV, licensed to DNO), customer-side installations (LV connections). Exclusions justified by regulatory boundary."

§4.4 Process map: PDCA flow on one page — policy (§5.2) → SAMP (§6.2) → AMPs → asset risk register (§6.3) → operational controls & work management (§8.1) → monitoring & KPIs (§9.1) → internal audit (§9.2) → management review (§9.3) → improvement actions (§10). Each process owner named (e.g., SAMP owner = Head of Asset Strategy). Hand-offs identified (Asset Strategy → Capital Delivery at SAMP-to-AMP transition; Operations → Maintenance at work-execution hand-off).

§5.2 Policy excerpt: "Acme T2 will manage its asset portfolio to deliver value to customers, shareholders, employees, and communities, by aligning asset decisions to organizational objectives and Net-Zero statutory target, by leading through visible commitment, and by assuring stakeholders through risk-based, lifecycle-integrated, continually-improving asset management." Maps to the four ISO 55000 principles explicitly.`,
    industrial_example: `Utilities — National Grid Electricity Transmission (UK). NGET published its Net-Zero-aligned AMS scope statement in the RIIO-T2 business plan: AMS scope includes the licensed transmission network at 400/275/132 kV and explicitly excludes DNO assets and customer connections; the context analysis identifies Ofgem as the dominant interested party with the RIIO-T2 price control as the dominant external issue; the policy statement commits to "value, alignment, leadership, assurance" and to Net-Zero 2050. NGET's stakeholder engagement plan ("Building the Grid of Tomorrow") operationalizes §4.2 with Ofgem, BEIS, ESO, communities, and the supply chain. CAMA assessors scoring NGET's §4 maturity typically place the "Stakeholder engagement" subject at Level 4 (Managed) — documented matrix, traceability to SAMP, annual review — and the "Asset management strategy" subject at Level 4, with the maturity target Level 5 (Optimized) driven by digital-twin integration.

Oil & Gas — Shell Asset Management System. Shell applies a group-wide AMS that scopes "all physical assets in Upstream, Integrated Gas, and Downstream operations" with site-level AMPs. The context analysis identifies IEA Net-Zero, EU ETS, and investor ESG pressure as dominant external issues; interested parties include investors (TCFD-aligned climate disclosure), regulators (HSE, EPA), and host governments. The §5.2 policy ("Achieve value through safe, reliable, sustainable asset operations") is communicated to every site. CAMA assessors score Shell's §4 maturity at Level 4 across all relevant subjects, with continuous-improvement evidence at the management-review cycle.`,
    case_study: `CASE_TYPE = SYNTHETIC. Mid-sized municipal water utility "WaterCo" (UK, 1.2M connections, 8,000 km mains, 12 WTWs, 1,200 pumping stations). CAMA assessor's §4 findings:

Maturity scores: "Stakeholder engagement" = M_evidence 3, M_integration 2, M_outcome 2 → M = 0.4·3 + 0.3·2 + 0.3·2 = 1.2+0.6+0.6 = 2.4 → Level 2 (Aware). "Asset management strategy" = 3, 2, 2 → 2.4 → Level 2. "Context" subject = 2, 2, 2 → 2.0 → Level 2.

Gaps found: (a) The PESTLE scan is dated 2018 and has not been reviewed since Ofwat's PR19 determination — stale. (b) The stakeholder list omits the insurer (FM Global) and the lender (a consortium of pension funds) — both have property-damage and covenant requirements that the AMP does not address. (c) The scope statement says "all water assets" with no exclusions and no geographic/functional boundary — fails §4.3 conformance. (d) No process map exists; the SAMP references "AMS processes" abstractly. (e) The policy is three sentences and does not commit to continual improvement (omits §5.2c requirement).

Assessor's recommendations: (1) Refresh the PESTLE scan and institute an annual review cycle (Level 2 → 3). (2) Add insurer and lender to stakeholder matrix; trace their requirements to AMP controls (Level 2 → 3). (3) Rewrite scope statement with explicit exclusions (e.g., customer-side pipework, third-party treatment works) and geographic boundary. (4) Draw the process map (PDCA flow) and name process owners. (5) Rewrite the policy to commit explicitly to continual improvement and to the four ISO 55000 principles (Level 2 → 3). Target: reach Level 3 across §4 subjects in 12 months.`,
    visual_explanation: `NOT_APPLICABLE`,
    simulation_opportunity: `Build a stakeholder-engagement simulator: the learner is presented with a utility context (PESTLE inputs, list of 12 candidate parties) and must (a) select the *relevant* parties per §4.2, (b) plot each on an influence-impact grid, (c) write the scope statement with explicit exclusions, and (d) score the maturity per subject. The simulator computes the maturity score per IAM Maturity Model and shows the gap to Level 3. Used in CAMA assessor training.`,
    common_mistakes: `- Treating §4 as a one-off box-tick: a 2018 PESTLE not reviewed since fails Level 2.
- Listing "all stakeholders" without traceability to AMS requirements — fails §4.2 conformance.
- Writing "all assets" in the scope statement without exclusions or boundaries — fails §4.3.
- Producing a policy statement that omits commitment to continual improvement (§5.2c) — fails conformance.
- No process map; "AMS processes" referenced abstractly — fails §4.4.
- Omitting the insurer, lender, or community from the stakeholder matrix — high-impact blind spot.
- Treating context and risk as separate exercises — the §4 context-issue register must feed the §6.3 risk register.
- Drawing the process map without process owners or hand-offs — fails conformance.`,
    limitations: `- PESTLE is retrospective — does not predict disruptive events (e.g., grid cyber-attack); complement with scenario analysis.
- Stakeholder needs are dynamic; an annual review cycle may miss mid-year shifts (regulator decisions, M&A).
- The scope statement is a snapshot; mergers and acquisitions invalidate it — re-issue on transaction.
- Maturity scoring is subjective; assessor calibration is required for repeatability.
- The policy is a statement of intent — without §5.1 leadership it does not change behaviour.
- §4 evidence is documentation-heavy; documentation is necessary but not sufficient — verify behaviour in §8/§9.`,
    comparison: `ISO 55001 §4 vs ISO 9001:2015 §4 (QMS context): both require external/internal issues and interested parties (Annex SL HLS common text). Differences: ISO 55001 §4.3 scope is *asset* scope (which assets, asset systems, functions, locations) — far more granular than QMS scope (which products/services). ISO 55001 §4.4 processes are *asset-lifecycle* PDCA processes (planning → capital delivery → operation → maintenance → renewal → disposal) — QMS §4.4 processes are *product-realization* PDCA processes (design → production → delivery). ISO 55001 adds the explicit link to the §5.2 AM policy and to the SAMP (§6.2) — QMS does not have a strategic plan equivalent.

ISO 55001 §4 vs ISO 14001:2016 §4 (EMS context): EMS §4.1 explicitly includes *environmental* issues (climate, emissions, water, biodiversity) — a strict subset of ISO 55001's PESTLE environmental dimension. ISO 55001 §4 is broader (covers all asset-management outcomes, not just environmental). An integrated AMS+EMS+QMS shares §4 evidence but layers different scopes.`,
    practical_application: `In a CAMA assessment, the §4 evidence review is the *first* day of fieldwork: the assessor reads the context analysis, the stakeholder matrix, the scope statement, the process map, and the policy. The maturity score sets the tone for the rest of the assessment: a Level 2 §4 score signals the assessor to deep-sample §5-§9, because weak context propagates. The assessor requests: (a) the dated PESTLE register and the last review date, (b) the stakeholder matrix with need-to-AMS-requirement traceability, (c) the scope statement with exclusions, (d) the process map with owners and hand-offs, (e) the policy statement cross-referenced to the four ISO 55000 principles, (f) the management-review minutes where §4 outcomes were considered. Traceability is verified end-to-end: a single §4.2 stakeholder need (e.g., Ofgem AHI reporting) is followed through the SAMP, the AMP, the operational control, the KPI, and the management-review input. Any break in traceability is a finding.`,
    decision_scenario: `You are the CAMA lead assessor for a regional airport's AMS recertification. In the open meeting, the AMS owner says: "We did our context analysis three years ago when we certified. Nothing has changed." Do you accept this position?

Decision: No. ISO 55001 §4.1 requires *continual* determination of context issues — a three-year-old analysis is stale. Specifically: (a) COVID-19 passenger collapse and recovery reshaped the airport's commercial portfolio (external issue). (b) CAA's CAP 1900 runway safety regulation and the EU's UPDATED Air Traffic Management regulation changed legal issues. (c) The airport's master-plan expansion (new runway, third terminal) changed internal capability and asset portfolio. (d) Net-Zero 2050 aviation commitments and SAF mandates reshaped environmental issues.

Action: raise a nonconformity against §4.1 (no documented review), require a refreshed PESTLE within 90 days, and re-scope the AMS to include the master-plan expansion. This is a major nonconformity because context propagates — every later clause inherits the staleness. Document per ISO 19011:2018 audit-finding protocol.`,
    practice_questions: `1. List the four ISO 55001 §4 sub-clauses and give one piece of evidence an assessor would request for each.
2. Name the four cells of the influence-impact matrix and one party likely to fall in each for a regional utility.
3. Write a one-sentence scope statement for a hospital's AMS that satisfies §4.3 (explicit exclusions, boundary).
4. Compute the IAM maturity score for a subject with S_evidence=2, S_integration=3, S_outcome=2 (default weights) and identify the level.`,
    certification_questions: `1. (CAMA, Recall) Under ISO 55001 §4.3, the scope of the AMS MUST: (a) be agreed with the regulator; (b) be available as documented information, with explicit exclusions and justification; (c) cover only safety-critical assets; (d) be signed by the asset manager. [Answer: (b).]
2. (CAMA, Apply) An organization's policy says "We will manage our assets to deliver value." Which ISO 55001 §5.2 requirement is most likely unmet? (a) appropriate to org purpose; (b) framework for objectives; (c) commitment to continual improvement; (d) commitment to requirements. [Answer: (c).]
3. (CAMA, Analyze) An assessor finds a 2018 PESTLE scan with no review since. The strongest finding is: (a) §4.1 nonconformity — no documented review cycle; (b) §4.2 nonconformity — parties list too short; (c) §4.4 nonconformity — process map missing; (d) §5.2 nonconformity — policy stale. [Answer: (a).]`,
    summary: `ISO 55001 §4 anchors the AMS in reality: the organization must *determine* external/internal issues (§4.1), *identify* relevant interested parties and their needs (§4.2), *define* the AMS scope with explicit exclusions (§4.3), and *determine* AMS processes and their interactions (§4.4). The §5.2 asset-management policy is the organizational response to this context picture — committing to value, alignment, leadership, assurance, statutory requirements, and continual improvement. The CAMA assessor scores §4 against the IAM Maturity Model: Level 2 (Aware) for a one-off PESTLE, Level 3 (Defined) for a documented and reviewed context with traceable stakeholder needs, Level 4 (Managed) for an integrated analysis that drives the SAMP and risk register, Level 5 (Optimized) for continuous scenario-based context refresh. Weak §4 propagates: a stale PESTLE produces a stale SAMP, a missing stakeholder produces an AMP gap, an undefined scope produces audit ambiguity. Context is a living document.`,
    key_takeaways: `- §4.1 requires both external (PESTLE) and internal (capability/culture) issues — neither may be omitted.
- §4.2 requires traceability: party → need → AMS requirement (objective, KPI, AMP control).
- §4.3 scope must specify assets, asset systems, functions, units, geography — with explicit exclusions and justification.
- §4.4 requires a process map (PDCA) with process owners and hand-offs.
- §5.2 policy responds to §4: appropriate to purpose, framework for objectives, commitment to requirements & continual improvement.
- Context is a living document — annual review minimum, event-triggered for major changes.
- Maturity rises when context drives SAMP re-planning, risk-register integration, and management-review inputs.`,
    references: `- ISO 55001:2014, Asset management — Management systems — Requirements, §4 (Context), §5.2 (Policy).
- ISO 55000:2014, Asset management — Overview, principles and terminology (definitions of asset, asset management, AMS, AM plan).
- ISO 55002:2018, Asset management — Guidelines for the application of ISO 55001, §A.4 (Context guidance).
- The IAM, "Asset Management — An Anatomy" (Strategy & Planning and AM Decision-Making groups).
- The IAM, "Asset Management Maturity Model" (subject-level scoring).
- ISO 19011:2018, Guidelines for auditing management systems (audit-programme and audit-finding protocol).`,
  },
  knowledgeObject: {
    title: "Context of the Organization (ISO 55001 §4)",
    domain: "Asset Management System (ISO 55001)",
    competency: "Context of the Organization (ISO 55001 §4)",
    topic: "AMS Context, Stakeholders, Scope & Policy",
    concept: "ISO 55001 §4 context analysis (PESTLE + internal), interested parties matrix, AMS scope with exclusions, AMS process map (PDCA), and the §5.2 asset-management policy",
    body: {
      definitions: [
        "External issues (§4.1): political, economic, social, technological, legal, environmental (PESTLE) factors outside the organization that affect the AMS outcomes.",
        "Internal issues (§4.1): capability, culture, asset portfolio, financial position, governance, information systems inside the organization that affect the AMS outcomes.",
        "Interested party (§4.2): stakeholder whose needs and expectations are relevant to the AMS; e.g., regulator, customer, shareholder, employee, supplier, community, insurer, lender.",
        "Scope of the AMS (§4.3): the boundary — assets, asset systems, functions, organizational units, geographic limits — within which the AMS applies, with explicit exclusions and justification.",
        "AMS processes (§4.4): the PDCA processes the organization uses to apply ISO 55001 requirements — policy, SAMP, AMPs, risk, operational controls, audit, review — and their interactions.",
        "Asset-management policy (§5.2): top management's statement of intent and direction for AM, set in response to §4 context, providing a framework for objectives and committing to requirements and continual improvement.",
        "PESTLE analysis: external environmental scan covering Political, Economic, Social, Technological, Legal, Environmental factors.",
        "Influence-impact matrix: stakeholder-prioritization tool plotting influence (power to act on the org) vs impact (effect on the org) into four quadrants — Manage Closely / Keep Satisfied / Keep Informed / Monitor.",
        "Strategic Asset Management Plan (SAMP): documented information specifying how organizational objectives are converted into AM objectives, the approach for developing AMPs, and the role of the AMS.",
        "PDCA: Plan-Do-Check-Act cycle — Plan (§4-6), Do (§7-8), Check (§9), Act (§10).",
      ],
      principles: [
        "Context is foundational: §4 anchors every later clause; weak context produces a weak AMS.",
        "External and internal issues are equally weighted; neither may be omitted.",
        "Interested parties are only those *relevant* to the AMS — not a generic stakeholder list.",
        "Scope is a boundary with explicit exclusions; 'all assets' fails conformance.",
        "AMS processes are PDCA-structured and interact across functional silos; hand-offs must be defined.",
        "The asset-management policy (§5.2) is the organizational response to §4 — it must commit to requirements and continual improvement.",
        "Context is a living document — annual review minimum, event-triggered re-issue on regulator decision or M&A.",
        "Maturity rises when context analysis drives SAMP re-planning and risk-register integration (§6.3).",
      ],
      components: [
        "PESTLE register (dated, sourced, owned entries).",
        "Internal capability & culture audit register.",
        "Stakeholder matrix (party → need → AMS requirement traceability).",
        "Influence-impact matrix (engagement priority).",
        "Scope statement (assets, functions, units, geography, exclusions with justification).",
        "AMS process map (PDCA flow with owners and hand-offs).",
        "Asset-management policy statement (§5.2).",
        "Context review log (annual and event-triggered).",
        "SAMP (cross-references context issues and party needs).",
        "Maturity self-assessment scorecard (per IAM Anatomy subject).",
      ],
      mechanism: [
        "§4 lifecycle: convene cross-functional workshop → PESTLE scan → internal capability audit → stakeholder matrix → influence-impact grid → scope statement → process map → policy approval → communication to parties → annual review → feed SAMP re-planning and management review (§9.3). Each step produces documented evidence the assessor samples end-to-end for traceability.",
      ],
      process: [
        "1. Convene cross-functional context workshop (operations, engineering, finance, HSE, legal, IT, HR, executive); appoint facilitator.",
        "2. Run PESTLE scan: capture political, economic, social, technological, legal, environmental factors with date, source, owner, impact rating.",
        "3. Run internal capability audit: asset portfolio, workforce, financial position, culture, information systems, governance — strengths and weaknesses.",
        "4. Identify interested parties; document need/expectation (statutory, contractual, voluntary); trace each need to an AMS requirement (objective/KPI/AMP control).",
        "5. Plot influence-impact matrix; classify parties into Manage Closely / Keep Satisfied / Keep Informed / Monitor.",
        "6. Draft scope statement: assets/asset systems included, functions, units, geography, explicit exclusions with justification.",
        "7. Map AMS processes (PDCA): policy → SAMP → AMPs → risk → operational controls → monitoring → audit → review → improvement. Name owners and hand-offs.",
        "8. Submit policy (§5.2) to top management for approval; communicate policy and scope to interested parties.",
        "9. Schedule annual review and event-triggered review; feed outcomes into SAMP re-planning (§6) and management review (§9.3).",
      ],
      formulas: [
        "IAM Maturity per subject: M_subject = w_e·S_evidence + w_i·S_integration + w_o·S_outcome; S ∈ {1..5}; default weights 0.4/0.3/0.3.",
        "Overall maturity M_org = (1/N)·Σ M_subject_j (mean across N subjects).",
        "Stakeholder engagement priority = Influence · Impact (each 1..5): ≥16 Manage Closely; 9..15 Keep Satisfied; 4..8 Keep Informed; 1..3 Monitor.",
        "Context-issue risk rating R = L · I (likelihood × impact, each 1..5): ≥16 priority issue feeding §6.3 risk register.",
      ],
      metrics: [
        "Maturity score per §4 subject (Context, Stakeholder engagement, AM strategy) [1..5].",
        "Number of interested parties identified and traceable to AMS requirements [count].",
        "Scope statement completeness score (assets, functions, units, geography, exclusions) [0..5].",
        "Process-map coverage: % of AMS processes with named owner and documented hand-off [0..100%].",
        "Policy conformance to §5.2 requirements (appropriate to purpose, framework, commitment to requirements, commitment to continual improvement) [4-tuple of Y/N].",
        "Annual review cycle adherence (date of last review, planned next review).",
        "Context-issue register coverage of PESTLE dimensions (6/6).",
      ],
      examples: [
        "Utility PESTLE: regulator (Ofgem) + Net-Zero 2050 + RIIO-T2 price control = top external issues.",
        "Stakeholder matrix: Ofgem (Influence=5, Impact=5) → Manage Closely; community (3, 4) → Keep Satisfied.",
        "Scope statement (transmission utility): '≥33 kV assets in licensed Area X; excludes generation and DNO assets'.",
        "Process map: policy → SAMP → AMPs → risk register → operational controls → monitoring → audit → review → improvement.",
        "Policy excerpt: 'value to customers, shareholders, employees, communities; align to Net-Zero; lead through commitment; assure stakeholders through risk-based lifecycle-integrated AM.'",
        "Maturity: S_evidence=4, S_integration=3, S_outcome=3 → M = 0.4·4+0.3·3+0.3·3 = 3.4 → Level 3 trending to Level 4.",
      ],
      industrial_examples: [
        "Utilities — National Grid Electricity Transmission (UK): Net-Zero-aligned AMS scope in RIIO-T2 business plan; Ofgem as dominant party; policy commits to four ISO 55000 principles and Net-Zero 2050.",
        "Oil & Gas — Shell group-wide AMS: scope covers Upstream/Integrated Gas/Downstream physical assets; IEA Net-Zero, EU ETS, investor ESG pressure as top external issues; policy 'safe, reliable, sustainable asset operations'.",
        "Water — UK water utility: Ofwat PR19 as dominant economic issue; environment agency permit as dominant legal issue; scope includes WTWs, WwTWs, mains, pumping stations; excludes customer-side connections.",
        "Container terminal — port AMS scope: STS cranes, RTG/RMG yard cranes, IT/OT systems; excludes shipping line assets; context includes IMO 2050 sulphur cap, terminal cyber-regulation, supply-chain volatility.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Municipal water utility 'WaterCo' (UK, 1.2M connections). CAMA assessor §4 findings: maturity Level 2 across 'Context' (M=2.0), 'Stakeholder engagement' (M=2.4), 'AM strategy' (M=2.4). Gaps: 2018 PESTLE not reviewed since Ofwat PR19; insurer (FM Global) and lender (pension-fund consortium) omitted from stakeholder matrix; scope statement 'all water assets' fails §4.3; no process map; policy omits commitment to continual improvement (§5.2c). Recommendations: refresh PESTLE annually; add insurer/lender with need-to-AMP-control traceability; rewrite scope with explicit exclusions (customer-side pipework, third-party treatment works); draw process map with owners; rewrite policy with all four §5.2 commitments. Target Level 3 in 12 months.",
      ],
      common_errors: [
        "Treating §4 as a one-off box-tick — a 3-year-old PESTLE not reviewed fails Level 2.",
        "Listing 'all stakeholders' without traceability to AMS requirements — fails §4.2.",
        "Writing 'all assets' in the scope statement without exclusions or boundaries — fails §4.3.",
        "Producing a policy statement that omits commitment to continual improvement (§5.2c) — fails §5.2.",
        "No process map; 'AMS processes' referenced abstractly — fails §4.4.",
        "Omitting the insurer, lender, or community from the stakeholder matrix — high-impact blind spot.",
        "Treating context and risk as separate exercises — §4 issues must feed the §6.3 risk register.",
        "Drawing the process map without process owners or hand-offs — fails conformance.",
      ],
      limitations: [
        "PESTLE is retrospective — does not predict disruptive events (cyber-attack, pandemic); complement with scenario analysis.",
        "Stakeholder needs are dynamic; an annual review cycle may miss mid-year shifts.",
        "The scope statement is a snapshot; M&A and structural reorganizations invalidate it — re-issue on transaction.",
        "Maturity scoring is subjective; assessor calibration is required for repeatability.",
        "The policy is a statement of intent — without §5.1 leadership it does not change behaviour.",
        "§4 evidence is documentation-heavy — verify behaviour in §8/§9; documentation alone is not sufficient.",
      ],
      best_practices: [
        "Run the context analysis cross-functionally (operations + finance + HSE + legal + HR + IT + executive).",
        "Date every PESTLE entry, source it, name an owner, rate impact (1..5).",
        "Trace every stakeholder need to a specific AMS requirement (objective, KPI, AMP control) and verify at management review.",
        "Write the scope statement with explicit exclusions and justification (regulatory boundary, asset-class boundary).",
        "Draw the process map on one page; name every process owner and every hand-off.",
        "Refresh context annually and on material events (regulator decision, M&A, climate event, technology shift).",
        "Cross-reference context issues to the SAMP (§6.2) and to the risk register (§6.3).",
        "Use the IAM Maturity Model to score each §4 subject and target the next level with documented improvement actions.",
      ],
      related_concepts: [
        "Asset Management Principles (AMP) — the four ISO 55000 principles (value, alignment, leadership, assurance) underpin §4.",
        "Leadership & Support (Lesson 2) — §5.1 leadership & commitment, §5.2 policy, §5.3 roles, §7 support.",
        "Operation & Performance Evaluation (Lesson 3) — §8 operation, §9 performance evaluation; §4 feeds §9.3 management review.",
        "SAMP (§6.2) — the documented information that converts §4 context into AM objectives.",
        "Asset Management Plan (AMP) — the lifecycle plan that operationalizes the AMS scope per asset system.",
        "IAM Anatomy 'Strategy & Planning' group — the conceptual reference for §4 subjects.",
      ],
      prerequisites: [
        "CAMA Asset Management Principles (AMP) — the four ISO 55000 principles and the asset lifecycle.",
        "Familiarity with ISO Annex SL high-level structure (HLS) — common to ISO 9001/14001/45001/55001.",
        "Stakeholder analysis fundamentals (power-interest grid, influence-impact matrix).",
        "PESTLE analysis technique for external environmental scanning.",
      ],
      references: [
        "ISO 55001:2014, Asset management — Management systems — Requirements, §4 (Context), §5.2 (Policy).",
        "ISO 55000:2014, Asset management — Overview, principles and terminology.",
        "ISO 55002:2018, Asset management — Guidelines for the application of ISO 55001, §A.4 (Context guidance).",
        "The IAM, Asset Management — An Anatomy (Strategy & Planning group).",
        "The IAM, Asset Management Maturity Model.",
        "ISO 19011:2018, Guidelines for auditing management systems.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Context of the Organization (ISO 55001 §4)",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Under ISO 55001 §4.3, what MUST the scope of the Asset Management System include?",
      whyCorrect:
        "ISO 55001 §4.3 requires the organization to determine the boundaries and applicability of the AMS to establish its scope, and the scope MUST be available as documented information. ISO 55002:2018 §A.4.3 further guides that the scope should specify the assets/asset systems included, the functions, the organizational units, the geographic boundaries, and any exclusions with justification. 'Available as documented information with explicit exclusions and justification' captures both the §4.3 requirement and the ISO 55002 guidance.",
      whyOthersWrong: [
        "Option A ('agreed with the regulator') — ISO 55001 does not require regulator approval of the scope; the regulator may impose requirements the scope must address, but the scope is the organization's determination.",
        "Option C ('cover only safety-critical assets') — the scope may include all asset classes relevant to the AM objectives; restricting it to safety-critical only is a nonconformity if the org's asset portfolio is broader.",
        "Option D ('be signed by the asset manager') — ISO 55001 does not prescribe the signer; the policy (§5.2) is set by top management, and the scope is determined by the organization.",
      ],
      explanation:
        "§4.3 requires documented scope with explicit exclusions and justification. ISO 55002:2018 §A.4.3 guides the content (assets, functions, units, geography, exclusions). 'All assets' without exclusions fails conformance.",
      options: [
        { text: "Be agreed with the regulator before publication", isCorrect: false },
        {
          text: "Be available as documented information, with explicit exclusions and justification",
          isCorrect: true,
        },
        { text: "Cover only safety-critical assets", isCorrect: false },
        { text: "Be signed by the asset manager", isCorrect: false },
      ],
    },
    {
      competencyName: "Context of the Organization (ISO 55001 §4)",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Utilities",
      stem: "An organization scores the IAM Maturity 'Stakeholder engagement' subject with S_evidence=4, S_integration=3, S_outcome=3 (default weights w_e=0.4, w_i=0.3, w_o=0.3). What is the maturity score M and the IAM level?",
      whyCorrect:
        "M_subject = w_e·S_evidence + w_i·S_integration + w_o·S_outcome = 0.4·4 + 0.3·3 + 0.3·3 = 1.6 + 0.9 + 0.9 = 3.4. The IAM Maturity Model has 5 levels (1 Initial/Ad-hoc, 2 Aware, 3 Defined, 4 Managed, 5 Optimized); a score of 3.4 sits at Level 3 (Defined), trending toward Level 4 (Managed) once integration and outcome scores rise to 4.",
      whyOthersWrong: [
        "Option A (M=2.4, Level 2) — would arise from S_evidence=3, S_integration=2, S_outcome=2; that is not the input set given in the stem.",
        "Option B (M=4.0, Level 4) — would require all three scores to be 4 (0.4·4+0.3·4+0.3·4 = 4.0); the integration and outcome scores are 3, not 4.",
        "Option D (M=10.0) — sums the raw scores 4+3+3=10 without applying the weights; the IAM maturity score is always a weighted average on the 1..5 level scale.",
      ],
      explanation:
        "M = 0.4·4 + 0.3·3 + 0.3·3 = 1.6 + 0.9 + 0.9 = 3.4 → Level 3 Defined, trending to Level 4 Managed. Improvement actions target S_integration and S_outcome (currently 3).",
      options: [
        { text: "M = 2.4 — Level 2 (Aware)", isCorrect: false },
        { text: "M = 3.4 — Level 3 (Defined)", isCorrect: true },
        { text: "M = 4.0 — Level 4 (Managed)", isCorrect: false },
        { text: "M = 10.0 — out of the 1..5 scale", isCorrect: false },
      ],
    },
    {
      competencyName: "Context of the Organization (ISO 55001 §4)",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Procedural",
      scenario: "Oil & Gas",
      stem: "An Oil & Gas operator's policy statement says: 'We will manage our assets to deliver value to our shareholders.' Which ISO 55001 §5.2 requirement is the policy MOST clearly missing?",
      whyCorrect:
        "ISO 55001 §5.2 requires the AM policy to (a) be appropriate to the organization's purpose, (b) provide a framework for AM objectives, (c) include a commitment to satisfy applicable requirements, and (d) include a commitment to continual improvement. A policy focused only on 'deliver value to shareholders' most clearly omits the commitment to continual improvement (§5.2d) and is also weak on the framework for objectives (§5.2b) and on satisfying applicable requirements (§5.2c, e.g., HSE regulations, environmental permits). The clearest single omission flagged by an assessor is the continual-improvement commitment.",
      whyOthersWrong: [
        "Option A (appropriate to org purpose) — the policy is at least appropriate to a shareholder-value-driven operator; this requirement is technically met.",
        "Option B (framework for objectives) — the policy is silent on objectives but the omission of continual improvement is more glaring; an assessor would flag both but rank continual improvement as the clearest single gap.",
        "Option D (available as documented information) — the policy is documented (we have the text); §7.5 documented-information control is met for the policy statement.",
      ],
      explanation:
        "A shareholder-only policy omits the commitment to continual improvement (§5.2d). A conforming policy addresses all four §5.2 requirements: purpose, framework, requirements, continual improvement — invoking the four ISO 55000 principles.",
      options: [
        { text: "Be appropriate to the organization's purpose (§5.2a)", isCorrect: false },
        { text: "Provide a framework for AM objectives (§5.2b)", isCorrect: false },
        { text: "Include a commitment to continual improvement (§5.2d)", isCorrect: true },
        {
          text: "Be available as documented information (§7.5)",
          isCorrect: false,
        },
      ],
    },
    {
      competencyName: "Context of the Organization (ISO 55001 §4)",
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Utilities",
      stem: "True or False: ISO 55001 §4.2 requires the organization to determine the needs and expectations of ALL interested parties that have any contact with the organization, and to translate every such need into an AMS requirement.",
      whyCorrect:
        "FALSE. ISO 55001 §4.2 requires the organization to determine the needs and expectations of *relevant* interested parties — not *all* parties with any contact. The standard explicitly limits the obligation to parties whose needs are *relevant to the AMS* (i.e., parties whose requirements affect the organization's ability to achieve the intended outcomes of the AMS). A utility has thousands of incidental contacts (vendors of office supplies, local businesses, transient visitors) whose needs are not AMS-relevant and need not be in the stakeholder matrix. The assessor checks *relevance* and *traceability* for the parties actually listed — not exhaustiveness.",
      whyOthersWrong: [
        "Option TRUE — would impose an impossible burden: the org would have to enumerate every transient contact. The standard's 'relevant interested parties' phrasing (§4.2 a-b) is a deliberate scoping device; ISO 55002:2018 §A.4.2 reinforces this with guidance on determining *relevance*.",
      ],
      explanation:
        "FALSE. §4.2 covers *relevant* interested parties only — those whose needs affect AMS outcomes. Incidental contacts (office-supply vendors, transient visitors) are out of scope. The assessor checks relevance and need-to-requirement traceability.",
      options: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 2 — Leadership & Support (§5, §7)
// (Competency: "Leadership & Support (§5, §7)"; slug: ams-leadership-support)
// ---------------------------------------------------------------------------

const LESSON_LEADERSHIP_SUPPORT: RefLesson = {
  competencyName: "Leadership & Support (§5, §7)",
  slug: "ams-leadership-support",
  title: "Leadership & Support (ISO 55001 §5, §7)",
  titleAr: "القيادة والدعم (ISO 55001 §5, §7)",
  order: 2,
  durationMin: 35,
  references: AMS_REFERENCE_TITLES,
  conceptIntroduction: `ISO 55001 §5 (Leadership) and §7 (Support) operationalize the AMS. §5.1 requires top management to demonstrate leadership and commitment — not merely sign the policy but actively integrate AM requirements into business processes, ensure resources, communicate the importance of AM, and drive continual-improvement culture. §5.2 (already introduced in Lesson 1) sets the policy. §5.3 assigns organizational roles, responsibilities, and authorities for the AMS — naming who does what, with explicit accountability for asset-management outcomes. §7 (Support) provides the resources, competence, awareness, communication, and documented information the AMS needs to function. §7.2 requires the organization to determine the necessary competence of persons doing AM work, ensure they acquired it (training, recruitment, mentoring), and retain documented information as evidence. §7.3 requires awareness — persons doing work under the AMS must be aware of the policy, their contribution, the implications of nonconformity. §7.4 requires communication — what, when, with whom, how. §7.5 requires documented information — the AMS documentation hierarchy (policy, SAMP, AMPs, procedures, records), controlled, retained, version-managed. The CAMA assessor scores §5 and §7 maturity by examining top-management engagement (board minutes, executive KPIs), role descriptions (RACI), training records, awareness surveys, communication plans, and the document hierarchy.`,
  example: `A regional transmission utility's §5.1 evidence: the CEO chairs the quarterly AM Steering Committee; the Asset Strategy Director reports to the Board on AHI, capex-vs-plan, and Net-Zero progress; the executive remuneration of the COO and Asset Strategy Director includes a 10% weight on AM outcomes (capex delivery, AHI ≥3.5, Net-Zero milestone). §5.3 RACI: SAMP owner = Head of Asset Strategy (A); AMP owners = Asset System Engineers (R); work-execution = Operations Managers (R); audit = Head of Internal Audit (R), AM Steering Committee (A); management review = CEO (A), Asset Strategy Director (R). §7.2 competence: Asset Engineers require IAM Certificate in Asset Management or equivalent, plus 5 years' experience; records of training, recruitment, and CPD retained in the L&D system. §7.5 documented information hierarchy: AM Policy (§5.2) → AM Strategy & SAMP → AMPs (per asset system) → AM Procedures (work management, MOC, outsourcing) → AM Records (work orders, audit reports, management-review minutes).`,
  keyFormulas: `Competency gap percentage (per role-family):
  Gap% = (N_required − N_met) / N_required × 100
where N_required = number of persons requiring a defined competency;
      N_met = number with verified competency (training+experience records).

Documented information completeness (per AMS document class):
  Completeness% = N_documented / N_expected × 100

Awareness coverage (per workforce segment):
  Awareness% = N_aware / N_total × 100
where N_aware = persons aware of policy+role+implications (verified by survey).

Example: 50 Asset Engineers required to hold IAM Cert; 38 verified → Gap = (50−38)/50 = 24%. Awareness survey of 1,200 operational staff: 960 aware → Awareness% = 80%. Documented information: 15 AMPs expected per asset system, 12 documented → 80%.`,
  exercise: `You are the CAMA assessor reviewing a chemical plant's §5/§7 evidence. (a) List three ways you would verify §5.1 leadership & commitment beyond the policy being signed. (b) The plant has 80 maintenance technicians requiring an IVT (Independent Verification Technician) certificate; records show 56 with current IVT. Compute the competency gap %. (c) The plant's documented information hierarchy shows the policy, the SAMP, and 8 AMPs — but no AM procedures. Identify the conformance gap and the corrective action.`,
  sections: {
    learning_objectives: `- State ISO 55001 §5.1 leadership & commitment requirements and identify 4+ ways to evidence them.
- Apply §5.2 policy requirements (appropriate to purpose, framework for objectives, commitment to requirements, commitment to continual improvement).
- Determine §5.3 organizational roles, responsibilities, and authorities; construct a RACI for the AMS.
- Apply §7.2 competence (determine, ensure, retain evidence) and compute competency gap %.
- Apply §7.3 awareness (policy, contribution, implications of nonconformity) and §7.4 communication (what, when, whom, how).
- Apply §7.5 documented information (create, update, control); construct the documentation hierarchy (policy → SAMP → AMPs → procedures → records).
- Connect §5/§7 to §9.2 audit and §9.3 management review (leadership is the subject of management review; competence/awareness are audit subjects).`,
    prerequisites: `- The CAMA Context of the Organization (Lesson 1) — §4 context analysis, scope, process map.
- The CAMA Asset Management Principles (AMP) — ISO 55000 principles, especially leadership and assurance.
- RACI / responsibility-assignment matrix fundamentals.
- Document-control fundamentals (versioning, change control, retention, access).`,
    introduction: `ISO 55001 §5 (Leadership) is the clause that separates a paperwork AMS from a value-delivering AMS. Without §5.1 leadership & commitment, the policy is a poster, the SAMP is a binder, the AMPs are not funded, and the audit is a checklist. The CAMA assessor therefore begins §5 evaluation by sampling top-management engagement: board minutes referencing AM outcomes, executive remuneration tied to AM KPIs, capital-portfolio review chaired by the CEO, and visible AM communication. Where leadership is absent, the assessor raises a §5.1 nonconformity — the most consequential nonconformity because everything else inherits the weakness.

§5.3 roles, responsibilities, and authorities are the organizational skeleton: who is accountable for the SAMP, for the AMPs, for asset risk, for operational controls, for audit, for management review. The assessor checks the RACI: every AMS process must have a named accountable owner (A) and a named responsible executor (R). Anonymous ownership is a nonconformity.

§7 (Support) provides the resources, competence, awareness, communication, and documented information the AMS needs to function. §7.2 competence is the most quantifiable: the organization determines the necessary competence of persons doing AM work, ensures they acquired it (training, recruitment, mentoring, certification), evaluates effectiveness, and retains documented information as evidence. The assessor samples one role-family (e.g., Asset Engineers, Maintenance Supervisors) end-to-end: job description → competency matrix → training records → evaluation of effectiveness → evidence retained. The competency-gap % is a quantified KPI.

§7.3 awareness is the soft clause: persons doing work under the AMS must be aware of the policy, their contribution, and the implications of nonconformity. The assessor samples workforce awareness via interviews and surveys — an operations technician who cannot state the policy or their contribution to AM objectives flags a §7.3 nonconformity.

§7.4 communication requires a communication plan: what is communicated (policy, objectives, performance), when (frequency), with whom (which parties — internal and external), and how (channel). The assessor checks the plan and samples a communication (e.g., quarterly AM performance report to Ofgem, monthly AM dashboard to the Board).

§7.5 documented information is the AMS's nervous system. The organization must control documented information required by ISO 55001 and determined by the organization as necessary for AMS effectiveness. Control means: identification, format, review and approval, distribution, access and retrieval, storage and preservation, change control, versioning, retention, disposition. The assessor samples the documentation hierarchy: policy (§5.2) → SAMP (§6.2) → AMPs → AM procedures (operational planning, MOC, outsourcing) → AM records (work orders, audit reports, management-review minutes).`,
    terminology: `- **Leadership & commitment (§5.1)**: top management's demonstrated active engagement — establishing the AMS, integrating AM into business processes, ensuring resources, communicating importance, driving continual improvement, supporting other roles.
- **AM policy (§5.2)**: top management's statement of intent and direction — appropriate to purpose, framework for objectives, commitment to requirements, commitment to continual improvement.
- **Organizational roles, responsibilities, authorities (§5.3)**: assigned and communicated — who is accountable (A) and who is responsible (R) for each AMS process.
- **RACI matrix**: Responsible (does the work) / Accountable (signs off, ultimately answerable) / Consulted (input) / Informed (kept in the loop).
- **Competence (§7.2)**: the demonstrated ability to apply knowledge and skills to achieve intended results — determined, ensured (training/recruitment), evaluated for effectiveness, evidence retained.
- **Awareness (§7.3)**: persons doing work under the AMS aware of the policy, their contribution to AM objectives, and the implications of nonconformity.
- **Communication (§7.4)**: what, when, with whom, how — internal and external; documented in a communication plan.
- **Documented information (§7.5)**: information required to be controlled and maintained by the organization — includes policies, plans, procedures, and records; managed by lifecycle (create, update, control, retain, dispose).
- **Document hierarchy**: policy (§5.2) → SAMP (§6.2) → AMPs (asset-system level) → AM procedures (operational planning, MOC, outsourcing) → AM records (work orders, audit reports, management-review minutes).
- **CPD**: Continuing Professional Development; the IAM Certificate in Asset Management is the canonical external credential for asset-management practitioners.`,
    detailed_explanation: `ISO 55001 §5.1 is qualitative but the assessor can evidence it. The IAM Anatomy's "Health, Safety, Environment & Quality" group and "Asset Management Decision-Making" group provide the subject-level scoring rubric for leadership: Level 2 (Aware) = top management has signed the policy; Level 3 (Defined) = top management chairs the AM Steering Committee, sets AM KPIs; Level 4 (Managed) = executive remuneration tied to AM outcomes, AM integrated into business planning, capital-portfolio review chaired by CEO; Level 5 (Optimized) = leadership drives continual-improvement culture, AM is in the corporate-strategy narrative.

§5.2 policy (introduced in Lesson 1) is conformance-checked: the assessor confirms the policy statement meets all four §5.2 requirements (a-d). A policy that says only "we will manage our assets to deliver value" fails §5.2d (commitment to continual improvement) — a common nonconformity.

§5.3 roles: the assessor samples the RACI for the AMS processes defined in §4.4. Every process (SAMP, AMPs, risk, operational controls, audit, review) must have a named accountable owner (A) and a named responsible executor (R). Anonymous ownership — "the maintenance team" — is a nonconformity. The assessor verifies the role descriptions match the people in the roles (job description → person → training records → competency matrix).

§7.2 competence: the assessor samples one role-family end-to-end. Required competencies are derived from the SAMP and AMPs (e.g., Asset Engineer requires Asset Risk Assessment, LCC, Reliability-Centred Maintenance, Asset Health Index, ISO 55001 familiarity). The competency matrix lists required vs current competency by person; training records evidence how gaps were closed; effectiveness evaluation confirms competency is applied (e.g., the Asset Engineer's LCC outputs feed the SAMP renewal programme). The competency-gap % is a quantified KPI: Gap% = (N_required − N_met)/N_required × 100. A gap above 20% is a nonconformity.

§7.3 awareness: the assessor interviews 5-10 operational staff across the asset portfolio. Each should be able to state the AM policy (in their own words, not verbatim), their contribution to AM objectives (e.g., "I inspect the transformer monthly — that feeds the AHI"), and the implications of nonconformity (e.g., "if I miss an inspection, the AHI degrades and the renewal programme is mis-prioritized"). A staff member who cannot answer flags a §7.3 nonconformity; the assessor samples deeper to estimate the awareness % across the workforce.

§7.4 communication: the assessor checks the communication plan (a one-page table: what, when, whom, how, owner) and samples one internal and one external communication. Internal: the monthly AM dashboard to the Board (KPIs, capex-vs-plan, AHI distribution, top-10 risks). External: the quarterly AHI report to the regulator (per the RIIO-T2 licence condition). The assessor verifies the communication was actually sent, received, and considered.

§7.5 documented information: the assessor samples the documentation hierarchy and the document-control system. The policy (§5.2), SAMP (§6.2), AMPs, AM procedures (work management, MOC, outsourcing), and AM records (work orders, audit reports, management-review minutes) are the canonical AMS documents. Each must be controlled: identification (unique ID), format (template), review and approval (named approver), distribution (who gets it), access and retrieval (where stored), storage and preservation (records retention), change control (version history), retention and disposition (how long kept, how destroyed).`,
    core_principles: `- Leadership is the most consequential clause — a §5.1 nonconformity propagates to every later clause.
- The policy (§5.2) is a statement of intent — leadership & commitment (§5.1) is the behaviour that delivers it.
- Roles, responsibilities, authorities (§5.3) must be named, not anonymous; every AMS process has an accountable (A) owner.
- Competence (§7.2) is quantified: required vs current → gap% KPI.
- Awareness (§7.3) is verified by interview and survey, not by documentation.
- Communication (§7.4) is documented (what/when/whom/how plan) and sampled.
- Documented information (§7.5) is controlled through its lifecycle (create → update → control → retain → dispose).
- The document hierarchy is layered: policy → SAMP → AMPs → procedures → records.`,
    components: `- AM Steering Committee terms of reference (top-management engagement, §5.1).
- Executive remuneration tied to AM outcomes (§5.1 evidence).
- AM policy statement (§5.2 — four requirements met).
- RACI matrix for AMS processes (§5.3 — named A and R owners).
- Competency matrix per role-family (§7.2 — required vs current competency, gap%).
- Training records, recruitment records, CPD records (§7.2 evidence).
- Awareness survey results (§7.3 — policy+contribution+implications).
- Communication plan (§7.4 — what/when/whom/how, owner).
- Document hierarchy (policy, SAMP, AMPs, procedures, records).
- Document-control system (ID, format, review, approval, distribution, access, storage, change, retention, disposition).`,
    process: `1. Confirm §5.1 leadership engagement: board minutes referencing AM, executive KPIs, AM Steering Committee ToR, capital-portfolio review chaired by CEO, AM communication.
2. Review §5.2 policy: confirm four requirements met (purpose, framework, requirements, continual improvement); confirm policy is communicated (links to §7.4).
3. Sample §5.3 RACI: pull one AMS process (e.g., SAMP development); verify named A and named R; cross-check job description → person → training records.
4. Sample §7.2 competence for one role-family (e.g., Asset Engineers): job description → competency matrix → training records → effectiveness evaluation → retained evidence; compute gap%.
5. Sample §7.3 awareness: interview 5-10 operational staff; confirm policy, contribution, implications; estimate awareness %.
6. Sample §7.4 communication: review plan; sample one internal (Board dashboard) and one external (regulator AHI report); verify sent/received/considered.
7. Sample §7.5 documented information: pull the document hierarchy; verify document control (ID, version, approval, distribution, retention) for policy, SAMP, AMPs, procedures, records.
8. Feed §5/§7 findings into §9.2 internal audit and §9.3 management review; close nonconformities with corrective action (§10.2).`,
    formula_calculation: `Competency gap percentage (per role-family):
  Gap% = (N_required − N_met) / N_required × 100
where N_required = number of persons requiring a defined competency;
      N_met = number with verified competency (training+experience records).

Awareness coverage (per workforce segment):
  Awareness% = N_aware / N_total × 100
where N_aware = persons able to state policy+contribution+implications (surveyed).

Documented information completeness per AMS document class:
  Completeness% = N_documented / N_expected × 100

Leadership engagement index (subjective, 0..5):
  L_index = 0.5·S_steering_committee + 0.3·S_exec_remuneration + 0.2·S_communication

Worked numbers: 50 Asset Engineers required; 38 verified with IAM Cert + 5 years experience → Gap% = (50−38)/50 = 24% (above the 20% threshold → nonconformity). Awareness survey 1,200 operational staff, 960 aware → Awareness% = 80% (target 90%). Documented information: 15 AMPs expected, 12 documented → 80% complete (nonconformity for missing AMPs).`,
    worked_example: `CASE_TYPE = SYNTHETIC. Regional transmission utility "Acme T2" — §5/§7 evidence.

§5.1 Leadership & commitment — evidence reviewed: (a) Board minutes (last 4 quarters) show "AM Steering Committee" as a standing agenda item, chaired by the CEO; (b) Asset Strategy Director's remuneration: 80% base + 10% AM KPIs (AHI ≥3.5, capex-vs-plan ≤±5%, Net-Zero milestone on time) + 10% HSE; (c) quarterly all-hands AM briefing by COO; (d) capital-portfolio review chaired by CEO monthly; (e) AM integrated into the corporate strategy narrative ("Net-Zero through asset renewal"). Maturity: Level 4 (Managed). No §5.1 nonconformity.

§5.2 Policy — conforms (Lesson 1 verified): appropriate to purpose, framework for objectives (SMART KPIs derive), commitment to requirements (Ofgem, HSE, EA), commitment to continual improvement (PDCA loop with §9.3 review).

§5.3 RACI (excerpt):
| Process                          | R (responsible)         | A (accountable)    |
| SAMP development & annual update | Asset Strategy Director  | CEO                |
| AMP development per asset system | Asset System Engineer    | Asset Strategy Dir |
| Asset risk register & assessment | Asset Risk Manager       | Asset Strategy Dir |
| Operational planning & control  | Operations Manager       | COO               |
| Internal audit programme         | Head of Internal Audit   | Audit Committee    |
| Management review (§9.3)         | Asset Strategy Director  | CEO                |
| Corrective action (§10.2)        | Process owner            | Process A-owner    |
No anonymous ownership.

§7.2 Competence — Asset Engineer role-family: 50 engineers required; IAM Certificate + 5 yrs + ISO 55001 familiarity. Records: 38 with IAM Cert + 5 yrs; 7 with IAM Cert + <5 yrs; 5 without IAM Cert (recruited from adjacent discipline). Gap% = (50−38)/50 = 24% — nonconformity. Effectiveness evaluation: 8 of 38 LCC outputs sampled, 6 of 8 fed the SAMP renewal programme → effectiveness 75% (good). Corrective action: 5 engineers enrolled in IAM Cert programme; 7 engineers paired with senior mentors for accelerated experience; target Gap% ≤ 5% in 12 months.

§7.3 Awareness — survey of 1,200 operational staff: 960 (80%) able to state policy, contribution, implications (interview sample 20 staff, 16/20 = 80% aware); 240 (20%) unaware of policy or contribution. Nonconformity: awareness % below the 90% target. Corrective action: tool-box talks monthly, AM induction for new joiners, supervisor briefing pack.

§7.4 Communication — plan reviewed:
| What                  | When    | Whom                    | How                       | Owner              |
| AM policy             | annual  | all staff + Ofgem       | intranet + RIIO-T2 plan   | AM Comms           |
| AM performance (KPIs) | monthly | Board                   | dashboard                 | Asset Strategy Dir |
| AHI report            | quarterly | Ofgem                | data submission           | Asset Strategy Dir |
| Audit results         | annual  | Audit Committee         | report                    | Head of Audit      |
Plan sampled: monthly Board dashboard sent and minuted; quarterly AHI report submitted to Ofgem on schedule. §7.4 conforms.

§7.5 Documented information hierarchy:
Level 1: AM Policy (§5.2) — 1 document.
Level 2: SAMP (§6.2) — 1 document.
Level 3: AMPs — 15 expected (one per asset system), 12 documented, 3 missing (cables, OHL, protection). Nonconformity.
Level 4: AM Procedures — work management, MOC, outsourcing, asset risk assessment, asset health index. 5 procedures documented and controlled.
Level 5: AM Records — work orders, audit reports, management-review minutes. Retained in SAP and SharePoint per records-retention schedule.
Document control: unique IDs (AM-POL-001, AM-SAMP-001, AM-AMP-{asset system code}, AM-PROC-{procedure code}), version-controlled, named approvers, retention 7 years. §7.5 conforms for existing documents; AMP gap to be closed in 6 months.`,
    industrial_example: `Utilities — National Grid Electricity Transmission (UK). NGET's §5.1 evidence includes the "Operating Model" published in the RIIO-T2 business plan: CEO chairs the Asset Management Committee; executive remuneration includes regulatory and Net-Zero milestones; AM is integrated into the corporate strategy "Building the Grid of Tomorrow." §7.2 competence: NGET runs an internal Asset Management Academy; Asset Engineers are required to attain the IAM Certificate in Asset Management within 24 months of role assignment. §7.5 documented information: the "Asset Management System Manual" (top-level AMS document) sits above the SAMP, AMPs, procedures, and records; all controlled in a SharePoint-based DMS with versioning, approval workflows, and 7-year retention. CAMA assessors typically score NGET's §5/§7 maturity at Level 4 across leadership, competence, and documented information subjects.

Oil & Gas — Shell. Shell's group-wide AMS requires Asset Managers at every operating site to hold the IAM Certificate or equivalent; the AMS Manual is a controlled group document, with site-level AMPs derived from the SAMP; §7.4 communication includes the annual sustainability report (TCFD-aligned) to investors. Shell's executive remuneration includes safety, environmental, and asset-reliability KPIs. Maturity: Level 4 across §5/§7 subjects.`,
    case_study: `CASE_TYPE = SYNTHETIC. Chemical plant "ChemCo" (UK, batch chemicals, 4 production units, 800 staff). CAMA assessor §5/§7 findings:

§5.1 Leadership: the plant manager has signed the AM policy (Level 2) but does not chair an AM Steering Committee; AM KPIs are not in the plant manager's remuneration; capital-portfolio review is delegated to the engineering manager. Maturity: Level 2 (Aware). Nonconformity.

§5.3 RACI: the SAMP is owned by the "Engineering Manager" (named), but AMPs are owned by "the engineering team" (anonymous); MOC has no accountable owner. Nonconformity for AMP and MOC.

§7.2 Competence — IVT (Independent Verification Technician) role: 80 technicians required, 56 verified → Gap% = (80−56)/80 = 30% (above 20% → nonconformity). Effectiveness evaluation: not performed (no L&D evaluation cycle).

§7.3 Awareness: interviews of 10 operational staff — 4 able to state policy+contribution+implications → Awareness% = 40% (target 90%). Major nonconformity.

§7.4 Communication: no communication plan; AM dashboard produced ad-hoc. Nonconformity.

§7.5 Documented information: hierarchy shows policy + SAMP + 8 AMPs (10 expected) + 3 AM procedures (work management, MOC, outsourcing — documented) — but AM records (work orders, audit reports) are not retained per a retention schedule. Nonconformity on records retention.

Recommendations: (1) Plant manager to chair AM Steering Committee quarterly; AM KPIs in plant-manager remuneration (Level 2→3 in 12 months). (2) Name AMP and MOC accountable owners. (3) IVT gap closure: 24 technicians enrolled in IVT programme; target Gap% ≤ 5% in 12 months. (4) Awareness programme: tool-box talks monthly, AM induction for all new joiners, supervisor briefing pack; target awareness% ≥90% in 6 months. (5) Communication plan documented. (6) Records-retention schedule implemented. Target Level 3 across §5/§7 subjects in 12 months.`,
    visual_explanation: `NOT_APPLICABLE`,
    simulation_opportunity: `Build a §7.2 competency-gap simulator: the learner inputs a role-family (e.g., Asset Engineer), the required competency (IAM Cert + 5 yrs + ISO 55001), the headcount required (N), and the number verified (N_met). The simulator computes Gap%, classifies conformance (≥20% = nonconformity), and proposes closure options (training, recruitment, mentoring, redeployment). Used in CAMA assessor training.`,
    common_mistakes: `- Treating §5.1 leadership as "the policy is signed" — top-management *behaviour* is required, not a signature.
- Anonymous ownership in the RACI ("the maintenance team") — fails §5.3 conformance.
- Computing competency gap% on training alone — effectiveness evaluation is required (§7.2d).
- Verifying §7.3 awareness by documentation only — interviews and surveys are required.
- Producing a communication plan but not sampling actual communications — fails §7.4 conformance.
- Documented information without version control — fails §7.5.
- Missing AMPs in the document hierarchy — common gap; each asset system requires an AMP.
- Retaining records without a retention schedule — fails §7.5 (records must be controlled through disposition).
- Treating the AMS Manual as the SAMP — they are different (AMS Manual = system description; SAMP = strategic plan).`,
    limitations: `- Leadership & commitment is qualitative; assessor subjectivity requires calibration.
- Competence gap% measures *attained* competency, not *applied* competency; effectiveness evaluation is required to bridge.
- Awareness % from survey/interview is sample-based; sampling error is non-trivial.
- Documented information control depends on the document-management system (DMS); weak DMS = weak §7.5.
- Roles & responsibilities change with reorganizations; the RACI must be refreshed.
- Competence requirements evolve with technology (digital twins, IEC 61850) — the matrix must be reviewed.`,
    comparison: `ISO 55001 §5/§7 vs ISO 9001:2015 §5/§7 (QMS): the structure is identical (Annex SL HLS); the difference is *content*. ISO 55001 §5.1 leadership requires integration of AM requirements into business processes — QMS §5.1 requires the same for *quality*. ISO 55001 §7.2 competence targets *asset-management* competencies (IAM Cert, LCC, reliability, risk) — QMS targets *quality* competencies (ISO 9001 lead-auditor, SPC, FMEA). ISO 55001 §7.5 documented information has a richer hierarchy (SAMP, AMPs) reflecting the strategic-asset layer absent from QMS.

ISO 55001 §5/§7 vs ISO 14001:2016 §5/§7 (EMS): EMS §7.2 competence is specific to *environmental* competencies (EIA, environmental regulations, EMS auditing). EMS §7.5 documented information is lighter (environmental policy, aspects/impacts register, operational controls). ISO 55001's hierarchy is deeper because the asset lifecycle has more stages.`,
    practical_application: `In a CAMA assessment, §5/§7 evidence review spans days 2-3 of fieldwork. The assessor opens with §5.1 leadership: reads the last 12 months of board minutes, the executive remuneration scheme, the AM Steering Committee ToR, and samples a quarterly all-hands AM briefing. Then §5.3 RACI: pulls the SAMP/AMP/MOC/audit owners, cross-checks job descriptions. Then §7.2 competence: samples one role-family (Asset Engineer, Maintenance Supervisor, or IVT) end-to-end. Then §7.3 awareness: interviews 5-10 operational staff across the asset portfolio. Then §7.4 communication: reviews the plan and samples one internal + one external communication. Then §7.5 documented information: pulls the document hierarchy and samples document control on policy, SAMP, AMPs, procedures, records. Findings are graded minor/major per ISO 19011:2018 audit-finding protocol. Corrective actions feed §10.2 and are verified at the next surveillance audit.`,
    decision_scenario: `You are the CAMA lead assessor for a chemical plant's AMS recertification. During the §5.1 review, the plant manager states: "I sign the policy and I delegate AM to the engineering manager — that's leadership." Do you accept this position?

Decision: No. ISO 55001 §5.1 requires top management to demonstrate leadership and commitment by *active engagement*, not by delegation. Specifically: (a) §5.1c requires top management to ensure the AM policy and AM objectives are established and compatible with strategic direction — delegation does not absolve top management of accountability. (b) §5.1d requires top management to ensure integration of AM requirements into business processes — typically evidenced by top management chairing the AM Steering Committee, including AM KPIs in executive remuneration, and chairing capital-portfolio review. (c) §5.1f requires top management to communicate the importance of effective AM — typically evidenced by all-hands briefings. Delegation to the engineering manager, while operationally sensible, does not meet §5.1 if the plant manager does not also demonstrate personal engagement.

Action: raise a §5.1 nonconformity (major); require the plant manager to chair the AM Steering Committee quarterly, include AM KPIs in the plant-manager remuneration, and deliver at least one all-hands AM briefing within 90 days. Document per ISO 19011:2018 audit-finding protocol; verify at the next surveillance audit.`,
    practice_questions: `1. List four ways the CAMA assessor evidences §5.1 leadership & commitment.
2. Compute the competency gap % for a role-family where 60 persons are required and 48 are verified; classify conformance (threshold 20%).
3. Construct a one-row RACI for the SAMP development process, naming R and A.
4. List the five levels of the documented information hierarchy (policy → records).`,
    certification_questions: `1. (CAMA, Recall) ISO 55001 §7.2 requires the organization to do all of the following EXCEPT: (a) determine necessary competence; (b) ensure persons acquired competence; (c) evaluate the effectiveness of training; (d) require external certification for every AM role. [Answer: (d).]
2. (CAMA, Apply) An Asset Engineer role requires the IAM Cert; 50 engineers required, 38 verified. The competency gap % is: (a) 12%; (b) 24%; (c) 38%; (d) 50%. [Answer: (b).]
3. (CAMA, Analyze) A CAMA assessor finds the AM policy signed by the plant manager but no AM Steering Committee, no AM KPIs in remuneration, no all-hands briefing. The strongest finding is: (a) §5.2 nonconformity; (b) §5.1 nonconformity; (c) §5.3 nonconformity; (d) §7.3 nonconformity. [Answer: (b).]`,
    summary: `ISO 55001 §5 (Leadership) and §7 (Support) operationalize the AMS. §5.1 leadership & commitment is qualitative but evidencible — top management must actively engage (chair the AM Steering Committee, include AM KPIs in remuneration, integrate AM into business processes, communicate importance). §5.2 policy must meet four requirements. §5.3 roles, responsibilities, authorities must be named in a RACI — no anonymous ownership. §7.2 competence is quantified (gap% KPI) and requires effectiveness evaluation. §7.3 awareness is verified by interview/survey (policy+contribution+implications). §7.4 communication is documented (what/when/whom/how plan) and sampled. §7.5 documented information is controlled through its lifecycle (create → update → control → retain → dispose) and structured in a hierarchy (policy → SAMP → AMPs → procedures → records). The CAMA assessor samples §5/§7 end-to-end across 2-3 days of fieldwork, grades findings per ISO 19011:2018, and feeds corrective actions to §10.2.`,
    key_takeaways: `- §5.1 leadership & commitment is qualitative but evidencible — delegation does not absolve top management.
- §5.2 policy must meet all four requirements (purpose, framework, requirements, continual improvement).
- §5.3 RACI must name an accountable (A) and responsible (R) for every AMS process — no anonymous ownership.
- §7.2 competency gap% = (N_required − N_met)/N_required; effectiveness evaluation is required.
- §7.3 awareness is verified by interview/survey — not by documentation alone.
- §7.4 communication plan: what, when, whom, how, owner; sampled for actual communication.
- §7.5 document hierarchy: policy → SAMP → AMPs → procedures → records; controlled through lifecycle.
- §5/§7 maturity Level 4 requires leadership integration + executive KPIs + closed-loop competence.`,
    references: `- ISO 55001:2014, Asset management — Management systems — Requirements, §5 (Leadership), §7 (Support).
- ISO 55000:2014, Asset management — Overview, principles and terminology (definitions of AM, AMS, AM Plan).
- ISO 55002:2018, Asset management — Guidelines for the application of ISO 55001, §A.5 (Leadership), §A.7 (Support).
- The IAM, "Asset Management — An Anatomy" (AM Decision-Making; HSEQ groups).
- The IAM, "Asset Management Maturity Model" (subject-level scoring).
- ISO 19011:2018, Guidelines for auditing management systems (audit-programme and audit-finding protocol).`,
  },
  knowledgeObject: {
    title: "Leadership & Support (ISO 55001 §5, §7)",
    domain: "Asset Management System (ISO 55001)",
    competency: "Leadership & Support (§5, §7)",
    topic: "AMS Leadership, Competence, Awareness, Communication & Documented Information",
    concept: "ISO 55001 §5 leadership & commitment, policy, roles/responsibilities/authorities; §7 support — resources, competence, awareness, communication, documented information",
    body: {
      definitions: [
        "Leadership & commitment (§5.1): top management's demonstrated active engagement — establishing the AMS, integrating AM into business processes, ensuring resources, communicating importance, driving continual improvement, supporting other roles.",
        "AM policy (§5.2): top management's statement of intent and direction — appropriate to purpose, framework for objectives, commitment to requirements, commitment to continual improvement.",
        "Organizational roles, responsibilities, authorities (§5.3): assigned and communicated — who is accountable (A) and who is responsible (R) for each AMS process.",
        "RACI matrix: Responsible (does the work) / Accountable (signs off) / Consulted (input) / Informed (kept in the loop).",
        "Competence (§7.2): demonstrated ability to apply knowledge and skills — determined, ensured (training/recruitment), evaluated for effectiveness, evidence retained.",
        "Awareness (§7.3): persons doing work under the AMS aware of the policy, their contribution to AM objectives, and the implications of nonconformity.",
        "Communication (§7.4): what, when, with whom, how — internal and external; documented in a plan.",
        "Documented information (§7.5): information required to be controlled and maintained — policies, plans, procedures, records; managed by lifecycle (create, update, control, retain, dispose).",
        "Document hierarchy: policy (§5.2) → SAMP (§6.2) → AMPs (asset-system level) → AM procedures (operational planning, MOC, outsourcing) → AM records (work orders, audit reports, management-review minutes).",
        "IAM Certificate in Asset Management: canonical external credential for asset-management practitioners.",
      ],
      principles: [
        "Leadership is the most consequential clause — a §5.1 nonconformity propagates to every later clause.",
        "The policy (§5.2) is a statement of intent — leadership & commitment (§5.1) is the behaviour that delivers it.",
        "Roles, responsibilities, authorities (§5.3) must be named, not anonymous; every AMS process has an accountable (A) owner.",
        "Competence (§7.2) is quantified: required vs current → gap% KPI; effectiveness evaluation required.",
        "Awareness (§7.3) is verified by interview and survey, not by documentation.",
        "Communication (§7.4) is documented (what/when/whom/how plan) and sampled for actual transmission.",
        "Documented information (§7.5) is controlled through its lifecycle (create → update → control → retain → dispose).",
        "The document hierarchy is layered: policy → SAMP → AMPs → procedures → records.",
      ],
      components: [
        "AM Steering Committee terms of reference (§5.1 evidence).",
        "Executive remuneration tied to AM outcomes (§5.1 evidence).",
        "AM policy statement (§5.2 — four requirements met).",
        "RACI matrix for AMS processes (§5.3 — named A and R owners).",
        "Competency matrix per role-family (§7.2 — required vs current, gap%).",
        "Training records, recruitment records, CPD records (§7.2 evidence).",
        "Awareness survey results (§7.3 — policy+contribution+implications).",
        "Communication plan (§7.4 — what/when/whom/how, owner).",
        "Document hierarchy (policy, SAMP, AMPs, procedures, records).",
        "Document-control system (ID, format, review, approval, distribution, access, storage, change, retention, disposition).",
      ],
      mechanism: [
        "§5/§7 lifecycle: top management establishes AM Steering Committee → sets policy (§5.2) → assigns RACI (§5.3) → determines competency needs per role (§7.2) → ensures competency (training/recruitment) → builds awareness programme (§7.3) → builds communication plan (§7.4) → builds documentation hierarchy (§7.5) → audits §5/§7 (§9.2) → reviews at management review (§9.3) → corrects nonconformities (§10.2) → re-plans. Each step produces documented and behavioural evidence the assessor samples end-to-end.",
      ],
      process: [
        "1. Confirm §5.1 leadership engagement: board minutes, executive KPIs, AM Steering Committee ToR, capital-portfolio review chaired by CEO, AM communication.",
        "2. Review §5.2 policy: confirm four requirements met (purpose, framework, requirements, continual improvement); confirm policy communicated.",
        "3. Sample §5.3 RACI: pull one AMS process (e.g., SAMP development); verify named A and named R; cross-check job description → person → training records.",
        "4. Sample §7.2 competence for one role-family: job description → competency matrix → training records → effectiveness evaluation → retained evidence; compute gap%.",
        "5. Sample §7.3 awareness: interview 5-10 operational staff; confirm policy, contribution, implications; estimate awareness %.",
        "6. Sample §7.4 communication: review plan; sample one internal (Board dashboard) and one external (regulator AHI report); verify sent/received/considered.",
        "7. Sample §7.5 documented information: pull document hierarchy; verify document control (ID, version, approval, distribution, retention) for policy, SAMP, AMPs, procedures, records.",
        "8. Feed §5/§7 findings into §9.2 internal audit and §9.3 management review; close nonconformities with corrective action (§10.2).",
      ],
      formulas: [
        "Competency gap %: Gap% = (N_required − N_met)/N_required × 100.",
        "Awareness coverage: Awareness% = N_aware/N_total × 100.",
        "Documented information completeness per class: Completeness% = N_documented/N_expected × 100.",
        "Leadership engagement index (0..5): L = 0.5·S_steering_committee + 0.3·S_exec_remuneration + 0.2·S_communication.",
      ],
      metrics: [
        "Competency gap % per role-family (target ≤ 20%).",
        "Awareness % per workforce segment (target ≥ 90%).",
        "Documented information completeness per AMS document class (target 100%).",
        "Leadership engagement index L (0..5; Level 4 = 4.0+).",
        "Communication plan coverage (what/when/whom/how/owner) [5-tuple of Y/N].",
        "RACI coverage: % of AMS processes with named A and R [target 100%].",
        "Document-control audit findings count per DMS sample.",
      ],
      examples: [
        "§5.1 evidence: CEO chairs AM Steering Committee; exec remuneration includes 10% AM KPI weight.",
        "§5.3 RACI: SAMP owner = Head of Asset Strategy (A); AMP owners = Asset System Engineers (R); audit = Head of Internal Audit (R), AM Steering Committee (A).",
        "§7.2 Asset Engineer: 50 required, 38 verified → Gap% = 24% (nonconformity above 20% threshold).",
        "§7.3 awareness: 1,200 operational staff surveyed, 960 aware → Awareness% = 80% (below 90% target).",
        "§7.4 communication: monthly Board dashboard, quarterly AHI report to Ofgem, annual AM policy communication.",
        "§7.5 document hierarchy: AM-POL-001 (policy), AM-SAMP-001, AM-AMP-{asset system}, AM-PROC-{procedure code}; version-controlled, 7-year retention.",
      ],
      industrial_examples: [
        "Utilities — National Grid Electricity Transmission (UK): CEO chairs Asset Management Committee; AM KPIs in exec remuneration; internal Asset Management Academy; IAM Cert required within 24 months of role assignment; AMS Manual as top-level controlled document.",
        "Oil & Gas — Shell: group-wide AMS; site Asset Managers required to hold IAM Cert or equivalent; AMS Manual as controlled group document; site-level AMPs derived from SAMP; TCFD-aligned annual sustainability report as external §7.4 communication.",
        "Container terminal — port operator: AM Steering Committee chaired by the COO; AM KPIs in operations-director remuneration; crane-driver competency matrix (STS, RTG, RMG); monthly AM dashboard to the Board.",
        "Water — UK water utility: Asset Strategy Director reports to the Board on AHI, leakage, mains renewal; Asset Engineers require IAM Cert + 5 yrs; quarterly AHI report to Ofwat per RIIO framework; AMS Manual sits above SAMP, AMPs, procedures.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Chemical plant 'ChemCo' (UK, batch chemicals, 800 staff). CAMA assessor §5/§7 findings: §5.1 Level 2 (Aware) — plant manager signs policy but does not chair AM Steering Committee; AM KPIs not in plant-manager remuneration. §5.3 RACI: AMPs owned anonymously by 'the engineering team' — nonconformity. §7.2 IVT role: 80 required, 56 verified → Gap% = 30%; effectiveness evaluation not performed. §7.3 awareness: 4/10 staff able to state policy+contribution+implications → 40% (target 90%) — major nonconformity. §7.4 no communication plan. §7.5 records retention schedule missing. Recommendations: plant manager chairs AM Steering Committee; AM KPIs in plant-manager remuneration; name AMP and MOC accountable owners; IVT gap closure (24 enrolled); awareness programme (tool-box talks, AM induction); communication plan; records-retention schedule. Target Level 3 in 12 months.",
      ],
      common_errors: [
        "Treating §5.1 leadership as 'the policy is signed' — top-management behaviour is required, not a signature.",
        "Anonymous ownership in the RACI ('the maintenance team') — fails §5.3 conformance.",
        "Computing competency gap% on training alone — effectiveness evaluation is required (§7.2d).",
        "Verifying §7.3 awareness by documentation only — interviews and surveys are required.",
        "Producing a communication plan but not sampling actual communications — fails §7.4 conformance.",
        "Documented information without version control — fails §7.5.",
        "Missing AMPs in the document hierarchy — common gap; each asset system requires an AMP.",
        "Retaining records without a retention schedule — fails §7.5 (records must be controlled through disposition).",
        "Treating the AMS Manual as the SAMP — they are different (AMS Manual = system description; SAMP = strategic plan).",
      ],
      limitations: [
        "Leadership & commitment is qualitative; assessor subjectivity requires calibration.",
        "Competence gap% measures attained competency, not applied competency; effectiveness evaluation bridges.",
        "Awareness % from survey/interview is sample-based; sampling error is non-trivial.",
        "Documented information control depends on the DMS; weak DMS = weak §7.5.",
        "Roles & responsibilities change with reorganizations; the RACI must be refreshed.",
        "Competence requirements evolve with technology (digital twins, IEC 61850) — the matrix must be reviewed.",
      ],
      best_practices: [
        "Evidence §5.1 with multiple sources: board minutes, executive remuneration scheme, AM Steering Committee ToR, capital-portfolio review minutes, all-hands briefing records.",
        "Name an accountable (A) and a responsible (R) owner for every AMS process in the RACI; cross-check job descriptions and training records.",
        "Compute competency gap% per role-family; close gaps with documented training, recruitment, or mentoring plans; evaluate effectiveness (sample LCC/AHI/RCM outputs feed SAMP).",
        "Verify §7.3 awareness by interview (5-10 staff across the asset portfolio); estimate awareness% and target ≥90%.",
        "Document the §7.4 communication plan (what/when/whom/how/owner); sample one internal and one external communication per audit cycle.",
        "Build the §7.5 document hierarchy with unique IDs, named approvers, version control, and 7-year retention; ensure every asset system has an AMP.",
        "Feed §5/§7 findings into §9.2 audit and §9.3 management review; close nonconformities with §10.2 corrective action verified at next surveillance.",
      ],
      related_concepts: [
        "Context of the Organization (Lesson 1) — §4 anchors the AMS that §5/§7 operationalize.",
        "Operation & Performance Evaluation (Lesson 3) — §8 operation, §9 performance evaluation; §5/§7 evidence is audited under §9.2.",
        "Strategic Asset Management Plan (SAMP) (§6.2) — the documented information that operationalizes §5.2 policy.",
        "Asset Management Plan (AMP) — the lifecycle plan that operationalizes the AMS scope per asset system (§7.5 Level 3).",
        "IAM Certificate in Asset Management — canonical external credential referenced in §7.2 competence.",
      ],
      prerequisites: [
        "CAMA Context of the Organization (Lesson 1) — §4 context, scope, process map.",
        "CAMA Asset Management Principles (AMP) — ISO 55000 principles (leadership, assurance).",
        "RACI / responsibility-assignment matrix fundamentals.",
        "Document-control fundamentals (versioning, change control, retention, access).",
      ],
      references: [
        "ISO 55001:2014, Asset management — Management systems — Requirements, §5 (Leadership), §7 (Support).",
        "ISO 55000:2014, Asset management — Overview, principles and terminology.",
        "ISO 55002:2018, Asset management — Guidelines for the application of ISO 55001, §A.5, §A.7.",
        "The IAM, Asset Management — An Anatomy (AM Decision-Making; HSEQ groups).",
        "The IAM, Asset Management Maturity Model.",
        "ISO 19011:2018, Guidelines for auditing management systems.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Leadership & Support (§5, §7)",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Under ISO 55001 §7.2, the organization must do all of the following EXCEPT:",
      whyCorrect:
        "ISO 55001 §7.2 requires the organization to (a) determine the necessary competence of persons doing work under the AMS that affects its performance, (b) ensure these persons are competent on the basis of education, training, or experience, (c) where applicable, take actions to acquire needed competence and evaluate the effectiveness of these actions, and (d) retain appropriate documented information as evidence of competence. The standard does NOT require *external certification* for every AM role — the organization may use any combination of education, training, experience, and (where the organization determines it appropriate) external certification. Requiring external certification for every role would be an over-interpretation.",
      whyOthersWrong: [
        "Option A (determine necessary competence) — this is §7.2a; required.",
        "Option B (ensure persons acquired competence via training/recruitment) — this is §7.2b-c; required.",
        "Option C (evaluate the effectiveness of actions taken) — this is §7.2c (effectiveness evaluation); required.",
      ],
      explanation:
        "§7.2 does not require external certification for every AM role; the organization chooses the basis (education, training, experience, and optionally external certification). The IAM Cert is a best practice, not an ISO 55001 requirement.",
      options: [
        { text: "Determine the necessary competence of persons doing AM work", isCorrect: false },
        { text: "Ensure persons acquired competence (training, recruitment, experience)", isCorrect: false },
        { text: "Evaluate the effectiveness of actions taken to acquire competence", isCorrect: false },
        { text: "Require external certification (e.g., IAM Cert) for every AM role", isCorrect: true },
      ],
    },
    {
      competencyName: "Leadership & Support (§5, §7)",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Oil & Gas",
      stem: "An Oil & Gas operator requires 80 maintenance technicians to hold the IVT (Independent Verification Technician) certificate. Records show 56 with current IVT. What is the competency gap % and the conformance classification (threshold 20%)?",
      whyCorrect:
        "Gap% = (N_required − N_met) / N_required × 100 = (80 − 56) / 80 × 100 = 24 / 80 × 100 = 30%. The CAMA conformance threshold is 20%: gap > 20% = nonconformity. At 30%, this is a §7.2 nonconformity requiring corrective action (enrol the 24 technicians without current IVT in the certification programme).",
      whyOthersWrong: [
        "Option A (12% — conformant) — would be (80−56)/80 if the org mistakenly divided by N_met, not N_required; arithmetically wrong.",
        "Option B (24% — nonconformity) — would arise from computing (80−56) = 24 as a percentage of 100 (raw count, not as a fraction of the required pool).",
        "Option D (56% — conformant) — confuses N_met with the gap% (the 56 verified is the absolute count, not a percentage); arithmetically wrong.",
      ],
      explanation:
        "Gap% = (80 − 56) / 80 × 100 = 30%. Above the 20% threshold = nonconformity. Corrective action: enrol 24 technicians in IVT programme; target Gap% ≤ 5% in 12 months; evaluate effectiveness by sampling IVT outputs feed the work-management system.",
      options: [
        { text: "12% — conformant", isCorrect: false },
        { text: "24% — nonconformity", isCorrect: false },
        { text: "30% — nonconformity", isCorrect: true },
        { text: "56% — conformant", isCorrect: false },
      ],
    },
    {
      competencyName: "Leadership & Support (§5, §7)",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Procedural",
      scenario: "Utilities",
      stem: "A utility's SAMP development process is owned by 'the Asset Management team' with no individual named as accountable. Under ISO 55001 §5.3, what is the correct assessment?",
      whyCorrect:
        "ISO 55001 §5.3 requires organizational roles, responsibilities, and authorities to be assigned and communicated — meaning every AMS process must have a named accountable (A) owner, not an anonymous team. 'The Asset Management team' is anonymous ownership and fails §5.3 conformance. The assessor must raise a §5.3 nonconformity and require the assignment of a named individual (e.g., 'Asset Strategy Director') as accountable (A) for the SAMP, with named responsible (R) executors.",
      whyOthersWrong: [
        "Option A (conforms — team ownership is acceptable) — §5.3 requires named individual accountability; team ownership is nonconforming.",
        "Option B (conforms — only the SAMP requires an accountable owner, and 'team' is acceptable for SAMP) — §5.3 applies to *every* AMS process, SAMP included; team ownership is nonconforming.",
        "Option D (only §7.5 documented information applies — SAMP is a document) — SAMP is a strategic plan requiring process ownership under §5.3, not merely a controlled document under §7.5.",
      ],
      explanation:
        "§5.3 requires named accountable (A) and responsible (R) owners for every AMS process. Anonymous team ownership fails conformance. Corrective action: name an individual (e.g., Asset Strategy Director) as A for the SAMP.",
      options: [
        { text: "Conforms — team ownership is acceptable under §5.3", isCorrect: false },
        { text: "Conforms — only the SAMP requires an accountable owner, and 'team' suffices", isCorrect: false },
        { text: "Nonconformity — §5.3 requires named individual accountability", isCorrect: true },
        { text: "Nonconformity — but only §7.5 documented information applies", isCorrect: false },
      ],
    },
    {
      competencyName: "Leadership & Support (§5, §7)",
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Utilities",
      stem: "True or False: ISO 55001 §5.1 leadership & commitment can be fully satisfied by top management signing the AM policy and delegating AM execution to the engineering manager.",
      whyCorrect:
        "FALSE. ISO 55001 §5.1 requires top management to demonstrate leadership and commitment with respect to the AMS by *active engagement*, not by signature-and-delegation. Specifically, §5.1 requires top management to: (a) ensure the AM policy and AM objectives are established and compatible with strategic direction; (b) ensure the AMS is integrated into the organization's business processes; (c) ensure the resources needed for the AMS are available; (d) communicate the importance of effective AM; (e) ensure the AMS achieves its intended outcomes; (f) engage, direct, and support persons to contribute to AMS effectiveness; (g) promote continual improvement; (h) support other relevant management roles. Delegation to the engineering manager, while operationally sensible, does not satisfy §5.1 if top management does not also demonstrate personal engagement (e.g., chairing the AM Steering Committee, including AM KPIs in executive remuneration, chairing capital-portfolio review, delivering all-hands AM briefings).",
      whyOthersWrong: [
        "Option TRUE — would reduce §5.1 to a signature. The standard's 'demonstrate leadership and commitment' phrasing (§5.1) is a deliberate behavioural requirement, not a procedural one; ISO 55002:2018 §A.5.1 reinforces this with guidance on the specific behaviours expected.",
      ],
      explanation:
        "FALSE. §5.1 requires active engagement (chairing the AM Steering Committee, AM KPIs in remuneration, integration into business processes, communication). Signature-and-delegation is nonconforming.",
      options: [
        { text: "TRUE", isCorrect: false },
        { text: "FALSE", isCorrect: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lesson 3 — Operation & Performance Evaluation (§8, §9)
// (Competency: "Operation & Performance Evaluation (§8, §9)";
//  slug: ams-operation-performance-evaluation)
// ---------------------------------------------------------------------------

const LESSON_OPERATION_PERFORMANCE: RefLesson = {
  competencyName: "Operation & Performance Evaluation (§8, §9)",
  slug: "ams-operation-performance-evaluation",
  title: "Operation & Performance Evaluation (ISO 55001 §8, §9)",
  titleAr: "التشغيل وتقييم الأداء (ISO 55001 §8, §9)",
  order: 3,
  durationMin: 35,
  references: AMS_REFERENCE_TITLES,
  conceptIntroduction: `ISO 55001 §8 (Operation) and §9 (Performance Evaluation) close the AMS PDCA loop: §8 is "Do" (the operational execution of the AMS — planning, control, change management, outsourcing) and §9 is "Check" (monitoring, measurement, analysis, internal audit, management review). §8.1 requires the organization to plan, implement, and control the processes needed to meet AM requirements — operational planning and control of the asset-management activities that the SAMP and AMPs define. §8.2 requires management of change (MOC) — the controlled modification of assets, asset systems, processes, or the AMS itself, with risk assessment and authorization before implementation. §8.3 requires control of outsourced AM processes — the organization is accountable for outsourced AM activities and must ensure external providers conform to AMS requirements. §9.1 requires monitoring, measurement, analysis, and evaluation of AM performance — the KPIs, AHI, reliability, and risk indicators that tell the organization whether it is achieving AM objectives. §9.2 requires internal audit — a periodic, independent, evidence-based assessment of AMS conformance to ISO 55001 and to the organization's own AMS, conducted by competent auditors per ISO 19011:2018. §9.3 requires management review — top management's periodic review of the AMS's suitability, adequacy, and effectiveness, with inputs (audit results, KPIs, MOC, opportunities) and outputs (improvement actions, resource needs, policy/SAMP changes). The CAMA assessor scores §8/§9 maturity by sampling operational controls, the MOC register, the outsourced-provider list, the KPI dashboard, the internal audit programme and reports, and the management-review minutes.`,
  example: `A regional transmission utility's §8.1 operational planning: the SAMP sets annual capex (£450M), reliability targets (SAIDI ≤ 35 min, SAIFI ≤ 0.08), and Net-Zero milestones (decarbonize 8 grid assets by 2028). AMPs per asset system (132/33 kV transformers, cables, OHL, switchgear, protection, SCADA) translate SAMP targets into work programmes (renewal, refurbishment, maintenance, inspection) with budgets and KPIs. §8.2 MOC register: 142 MOCs in the last 12 months — asset-design changes (e.g., transformer specification change from mineral oil to ester fluid for Net-Zero), process changes (e.g., move from time-based to condition-based maintenance on 132 kV transformers), organizational changes (e.g., consolidation of three regional maintenance teams into one). Each MOC has risk assessment, authorization (Asset Strategy Director), implementation plan, and post-implementation review. §8.3 outsourcing: 3 outsourced providers (asset-condition surveys, tree-cutting, protection-relay testing) with contracts specifying AMS requirements (HSE, AHI methodology, data exchange). §9.1 KPI dashboard: SAIDI, SAIFI, AHI distribution, capex-vs-plan, top-10 asset risks, leakage (for water), Net-Zero milestone progress. §9.2 internal audit programme: 12 audits per year covering all ISO 55001 clauses over a 3-year cycle; auditors IAM-Cert + ISO 19011-trained. §9.3 management review: annual review chaired by CEO, with 8 mandatory inputs (audit results, KPIs, MOC, parties' feedback, M&S issues, resource adequacy, improvement actions, previous review outputs) and 4 outputs (improvement opportunities, resource needs, policy/SAMP changes, organizational-implications).`,
  keyFormulas: `Audit finding count classification (per ISO 19011:2018):
  N_total = N_major + N_minor + N_observation + N_OFI
where N_major = nonconformity requiring immediate corrective action (systemic or high-risk);
      N_minor = nonconformity not systemic or low-risk;
      N_observation = documented issue not yet a nonconformity;
      N_OFI = opportunity-for-improvement.

Audit-programme coverage:
  Coverage% = N_processes_audited / N_processes_in_scope × 100
(over a 3-year cycle, target 100%).

Performance KPI dashboard:
  KPI_conformance = N_KPIs_achieved / N_KPIs_total × 100
where N_KPIs_total = KPIs in the SAMP/AMP cascade (SAIDI, SAIFI, AHI, capex-vs-plan, leakage, Net-Zero milestones).

Management review input coverage (mandatory 8 inputs per §9.3):
  Input_coverage = N_inputs_provided / 8 × 100 (target 100%).

Example: Internal audit programme covers 36 AMS processes over 3 years (12/year); audit findings year-1 = 4 major + 12 minor + 8 observations + 5 OFIs = N_total = 29. Coverage = 36/36 = 100%. KPI conformance: 18/20 KPIs achieved = 90% (target 95%). Management review inputs: 7/8 provided = 87.5% (nonconformity).`,
  exercise: `You are the CAMA assessor reviewing a container terminal's §8/§9 evidence. (a) The terminal's internal audit programme covers 24 AMS processes over 3 years; findings last year were 3 major + 9 minor + 6 observations + 4 OFIs. Compute N_total and the audit-programme coverage. (b) The terminal's KPI dashboard shows 16/20 KPIs achieved; classify conformance (target 95%). (c) The terminal's management review minutes show 6 of 8 mandatory §9.3 inputs presented. Identify the conformance gap and the corrective action.`,
  sections: {
    learning_objectives: `- Apply ISO 55001 §8.1 operational planning & control — translate SAMP/AMP targets into work programmes with budgets and KPIs.
- Apply §8.2 management of change (MOC) — register, risk assessment, authorization, implementation, post-implementation review.
- Apply §8.3 outsourcing control — contracts specifying AMS requirements, monitoring of external providers.
- Apply §9.1 monitoring, measurement, analysis, evaluation — KPI dashboard (SAIDI, SAIFI, AHI, capex-vs-plan, Net-Zero, leakage).
- Apply §9.2 internal audit per ISO 19011:2018 — programme, plan, evidence, findings, report, follow-up.
- Apply §9.3 management review — 8 inputs (audit, KPI, MOC, parties, M&S, resources, improvement, previous review) and 4 outputs (improvement opportunities, resource needs, policy/SAMP changes, organizational implications).
- Connect §8/§9 to §10 improvement — findings and inputs feed corrective action and continual improvement.`,
    prerequisites: `- The CAMA Context of the Organization (Lesson 1) — §4 scope, processes.
- The CAMA Leadership & Support (Lesson 2) — §5 leadership, §7 documented information, competence.
- ISO 19011:2018 auditing principles (audit principles, programme management, conduct).
- KPI design fundamentals (SMART, leading vs lagging, hierarchical cascade from SAMP to AMP to KPI).`,
    introduction: `ISO 55001 §8 and §9 close the AMS PDCA loop: §8 is "Do" — the operational execution of the asset-management activities the SAMP and AMPs define; §9 is "Check" — the monitoring, measurement, analysis, audit, and review that tell the organization whether it is achieving AM objectives and where to improve.

§8.1 operational planning & control requires the organization to plan, implement, and control the processes needed to meet AM requirements. Operationally, this means the SAMP (§6.2) sets annual targets (capex, reliability, Net-Zero milestones) and the AMPs per asset system translate those targets into work programmes (renewal, refurbishment, maintenance, inspection) with budgets, schedules, and KPIs. The CAMA assessor samples one asset system end-to-end: SAMP target → AMP work programme → work order → operational control → KPI → SAMP feedback loop.

§8.2 management of change (MOC) requires the organization to manage changes to assets, asset systems, processes, or the AMS itself in a controlled manner — risk assessment, authorization, implementation plan, post-implementation review. The assessor samples the MOC register and traces one MOC end-to-end (e.g., transformer oil change from mineral to ester for Net-Zero).

§8.3 outsourcing requires the organization to ensure outsourced AM processes are controlled. The assessor samples the outsourced-provider list and traces one contract end-to-end (e.g., asset-condition surveys — contract specifies AHI methodology, HSE, data exchange, KPIs).

§9.1 monitoring, measurement, analysis, evaluation requires the organization to evaluate AM performance and the AMS effectiveness. The KPI dashboard is the canonical artifact: SAIDI (System Average Interruption Duration Index), SAIFI (System Average Interruption Frequency Index), AHI (Asset Health Index) distribution, capex-vs-plan, top-10 asset risks, leakage (for water), Net-Zero milestones. The assessor samples the dashboard and verifies KPIs cascade from SAMP to AMP to operational control.

§9.2 internal audit requires the organization to conduct periodic, independent, evidence-based audits per ISO 19011:2018 — audit principles (integrity, fair presentation, due professional care, confidentiality, independence, evidence-based), audit programme (objectives, scope, criteria, competence, evaluation of auditors), audit conduct (plan, opening meeting, evidence collection, findings, closing meeting, report, follow-up). The assessor samples the audit programme (3-year coverage of all ISO 55001 clauses), one audit report (findings: major, minor, observation, OFI), and the follow-up of corrective actions.

§9.3 management review requires top management to conduct a periodic review of the AMS's suitability, adequacy, and effectiveness, with 8 mandatory inputs (audit results, KPIs, MOC, parties' feedback, M&S issues, resource adequacy, improvement actions, previous review outputs) and 4 outputs (improvement opportunities, resource needs, policy/SAMP changes, organizational implications). The assessor samples the last review minutes and verifies all 8 inputs were presented and all 4 outputs recorded with owners and dates.`,
    terminology: `- **Operational planning & control (§8.1)**: the planning, implementation, and control of AM processes that operationalize SAMP/AMP targets.
- **Management of change / MOC (§8.2)**: the controlled modification of assets, asset systems, processes, or the AMS itself — risk assessment, authorization, implementation, post-implementation review.
- **Outsourcing (§8.3)**: control of AM processes performed by external providers; the organization remains accountable for AMS conformance of outsourced work.
- **Monitoring (§9.1)**: determining the status of a system, a process, or an activity (continuous, real-time).
- **Measurement (§9.1)**: determining a value (quantitative, periodic).
- **Analysis (§9.1)**: examining data to identify patterns, trends, root causes.
- **Evaluation (§9.1)**: judging performance against criteria (objectives, targets, baselines).
- **Internal audit (§9.2)**: systematic, independent, documented process for obtaining audit evidence and evaluating it objectively to determine the extent to which audit criteria are fulfilled.
- **Audit findings (ISO 19011:2018)**: results of the evaluation of collected audit evidence against audit criteria — major nonconformity, minor nonconformity, observation, opportunity-for-improvement (OFI).
- **Management review (§9.3)**: top management's periodic review of AMS suitability, adequacy, effectiveness — 8 inputs, 4 outputs.
- **SAIDI**: System Average Interruption Duration Index — average outage duration per customer per year (utility KPI).
- **SAIFI**: System Average Interruption Frequency Index — average number of interruptions per customer per year.
- **AHI**: Asset Health Index — composite 1..5 score of asset condition per asset class.`,
    detailed_explanation: `ISO 55001 §8.1 operational planning & control: the assessor verifies the SAMP → AMP → work-programme → operational-control → KPI → SAMP feedback loop. A common gap is the broken feedback loop — KPIs are reported but do not feed back into SAMP re-planning. The assessor traces one KPI (e.g., SAIDI) end-to-end and verifies the loop closes.

§8.2 MOC: the MOC register lists every proposed change with risk assessment, authorization, implementation plan, and post-implementation review. A common gap is incomplete MOCs (e.g., informal changes implemented without risk assessment). The assessor samples 5 MOCs from the register and traces one end-to-end. The MOC must include: description of change, asset(s)/process(es) affected, risk assessment (likelihood × consequence, including safety, environmental, reliability, financial, regulatory), authorization (named approver), implementation plan (resources, schedule, communication), post-implementation review (KPIs verified, lessons learned).

§8.3 outsourcing: the assessor samples the outsourced-provider list and traces one contract end-to-end. The contract must specify AMS requirements (HSE, AHI methodology, data exchange, KPIs, change control), and the organization must monitor the provider's conformance. A common gap is contracts that specify commercial terms without AMS requirements — fails §8.3.

§9.1 monitoring/measurement/analysis/evaluation: the KPI dashboard is the canonical artifact. The assessor samples the dashboard and verifies: (a) KPIs cascade from SAMP to AMP to operational control; (b) leading and lagging KPIs are balanced (lagging = SAIDI, SAIFI; leading = AHI distribution, capex-vs-plan); (c) targets are SMART (Specific, Measurable, Achievable, Relevant, Time-bound); (d) the dashboard is reviewed at the AM Steering Committee monthly and at management review annually.

§9.2 internal audit: the assessor samples the audit programme (3-year coverage of all ISO 55001 clauses), one audit report (findings classified as major, minor, observation, OFI per ISO 19011:2018), and the follow-up of corrective actions. Auditors must be competent (ISO 19011:2018 — IAM Cert + ISO 19011 training) and independent (not auditing their own work). The audit programme must be risk-based — high-risk processes audited more frequently.

§9.3 management review: the assessor samples the last review minutes and verifies all 8 mandatory inputs (§9.3.1): (a) status of actions from previous management reviews; (b) changes in external and internal issues relevant to the AMS (from §4.1 context); (c) information on AM performance (KPIs, AHI, reliability — from §9.1); (d) asset-management effectiveness; (e) audit results (from §9.2); (f) interested parties' feedback (from §4.2); (g) MOC issues (from §8.2); (h) resource adequacy. The 4 mandatory outputs (§9.3.2) are: (i) improvement opportunities; (ii) AM policy or AM objectives changes; (iii) resource needs; (iv) AMS changes (organizational implications). The assessor verifies outputs have owners and dates and feed §10 improvement.`,
    core_principles: `- §8/§9 close the PDCA loop: §8 = Do, §9 = Check.
- §8.1 operational planning must close the feedback loop: SAMP → AMP → work → KPI → SAMP.
- §8.2 MOC requires risk assessment, authorization, implementation, and post-implementation review — informal change fails conformance.
- §8.3 outsourcing does not transfer accountability — the organization remains accountable for AMS conformance of outsourced work.
- §9.1 KPI dashboard must cascade from SAMP to AMP to operational control, with leading and lagging KPIs balanced.
- §9.2 internal audit is per ISO 19011:2018 — principles (integrity, independence, evidence-based), programme (risk-based), conduct (plan, opening, evidence, findings, closing, report, follow-up).
- §9.3 management review has 8 mandatory inputs and 4 mandatory outputs — all must be present and traceable.
- §8/§9 findings feed §10 improvement — the loop is not closed until corrective actions are implemented and verified.`,
    components: `- SAMP work-programme cascade (§8.1) — annual capex, reliability, Net-Zero targets → AMP work programmes → work orders → operational controls → KPIs.
- MOC register (§8.2) — change description, assets/processes affected, risk assessment, authorization, implementation, post-implementation review.
- Outsourcing contracts (§8.3) — commercial + AMS requirements (HSE, AHI, data exchange, KPIs, change control).
- Outsourced-provider monitoring (§8.3) — KPI review, HSE review, periodic contract review.
- KPI dashboard (§9.1) — SAIDI, SAIFI, AHI distribution, capex-vs-plan, top-10 risks, Net-Zero milestones, leakage.
- Internal audit programme (§9.2) — 3-year coverage of all ISO 55001 clauses, risk-based, auditor competence, ISO 19011:2018 conformance.
- Audit reports (§9.2) — findings classified major/minor/observation/OFI per ISO 19011.
- Management review minutes (§9.3) — 8 inputs, 4 outputs, owners and dates for each output.
- Corrective-action register (§10.2) — fed from audit findings and management review outputs.`,
    process: `1. Verify §8.1 operational planning: sample one asset system end-to-end (SAMP target → AMP work programme → work order → operational control → KPI → SAMP feedback).
2. Verify §8.2 MOC: sample 5 MOCs from the register; trace one end-to-end (risk assessment, authorization, implementation, post-implementation review).
3. Verify §8.3 outsourcing: sample one outsourced provider; trace contract (AMS requirements) and monitoring (KPI review, HSE review).
4. Verify §9.1 KPI dashboard: cascade from SAMP to AMP to operational control; leading + lagging balance; SMART targets; AM Steering Committee monthly review.
5. Verify §9.2 internal audit programme: 3-year coverage of all ISO 55001 clauses; risk-based; auditor competence (IAM Cert + ISO 19011); independence (not auditing own work); sample one audit report (findings classified per ISO 19011).
6. Verify §9.2 audit follow-up: corrective-action register shows closed-loop (action taken, verified, signed off).
7. Verify §9.3 management review: last review minutes show all 8 inputs presented and all 4 outputs recorded with owners and dates; outputs feed §10 improvement.
8. Verify §8/§9 findings feed §10.2 corrective action and §10.1 continual improvement; verify effectiveness of corrective actions (closed-loop verification at next surveillance audit).`,
    formula_calculation: `Audit finding count classification (per ISO 19011:2018):
  N_total = N_major + N_minor + N_observation + N_OFI
where N_major = nonconformity requiring immediate corrective action (systemic or high-risk);
      N_minor = nonconformity not systemic or low-risk;
      N_observation = documented issue not yet a nonconformity;
      N_OFI = opportunity-for-improvement.

Audit-programme coverage:
  Coverage% = N_processes_audited / N_processes_in_scope × 100 (over 3-year cycle, target 100%).

Performance KPI conformance:
  KPI_conformance = N_KPIs_achieved / N_KPIs_total × 100

Management review input coverage (mandatory 8 inputs per §9.3.1):
  Input_coverage = N_inputs_provided / 8 × 100 (target 100%).

Management review output coverage (mandatory 4 outputs per §9.3.2):
  Output_coverage = N_outputs_recorded / 4 × 100 (target 100%).

Worked numbers: Internal audit programme covers 36 AMS processes over 3 years (12/year); year-1 findings = 4 major + 12 minor + 8 observations + 5 OFIs → N_total = 29. Coverage = 36/36 = 100% (conformant). KPI conformance: 18/20 KPIs achieved = 90% (below 95% target — minor nonconformity). Management review inputs: 7/8 provided = 87.5% (major nonconformity). Outputs: 4/4 recorded = 100% (conformant).`,
    worked_example: `CASE_TYPE = SYNTHETIC. Regional transmission utility "Acme T2" — §8/§9 evidence.

§8.1 Operational planning & control — sampled asset system: 132/33 kV transformers. SAMP target: AHI ≥3.5 across the population by 2028; capex £450M total; 8 Net-Zero-aligned renewals. AMP (132/33 kV transformers) work programme: 12 renewals (esters), 40 refurbishments (oil treatment), 200 condition-based inspections (DGA). Budget: £85M. KPIs: AHI distribution (target median ≥3.5), capex-vs-plan (target ±5%), renewal schedule on time. Feedback loop: monthly KPI dashboard → AM Steering Committee → quarterly SAMP re-planning — verified closed.

§8.2 MOC register — sampled 5 MOCs: (1) transformer oil change from mineral to ester (Net-Zero, ester-fluid biodegradability); (2) 132 kV transformer specification change (corrosive-sulphur test added); (3) maintenance strategy change for 132 kV transformers from time-based to condition-based (DGA + IEC 60156 + IEC 60296); (4) consolidation of three regional maintenance teams into one; (5) protection-relay firmware upgrade. MOC 1 traced end-to-end: risk assessment (likelihood 2 × consequence 2 = 4 low; safety/environmental/reliability/financial/regulatory considered); authorization (Asset Strategy Director); implementation plan (8 transformers, 24 months, £3.2M, communication to Ofgem); post-implementation review (ester-fluid DGA results vs mineral baseline, KPI: ester population AHI = 3.8 vs mineral 3.4 — Net-Zero benefit confirmed). §8.2 conforms.

§8.3 Outsourcing — sampled provider: "AcmeSurveys Ltd" (asset-condition surveys). Contract: commercial terms + AMS requirements (AHI methodology = EA Tech "AHI for Transformers" + UKPN "Cable AHI"; HSE per HSG47; data exchange via API; KPI: survey accuracy ≥95%, on-time delivery ≥98%, HSE RIF=0). Monitoring: monthly KPI review, quarterly HSE review, annual contract review. §8.3 conforms.

§9.1 KPI dashboard (excerpt):
| KPI                    | Target    | Actual    | Conformant? |
| SAIDI (min/cust/yr)    | ≤ 35      | 32        | Yes         |
| SAIFI (interr/cust/yr) | ≤ 0.08    | 0.07      | Yes         |
| AHI median (transformer)| ≥ 3.5    | 3.6       | Yes         |
| AHI median (cable)     | ≥ 3.0     | 2.9       | No (minor)  |
| Capex vs plan          | ±5%       | +7%       | No (minor)  |
| Net-Zero renewals      | 8 by 2028 | 2 to date | On track    |
| Top-10 risk closure    | 80%       | 75%       | No (minor)  |
| HSE RIF (per 100k hr)  | ≤ 0.5     | 0.3       | Yes         |
20 KPIs total, 18 achieved = 90% conformance (below 95% target — minor nonconformity). Dashboard reviewed monthly at AM Steering Committee; cascaded to AMPs; verified.

§9.2 Internal audit programme — 3-year cycle, 36 AMS processes (12/year). Auditors: 4 IAM-Cert + ISO 19011-trained; independence assured (auditors do not audit their own work). Year-1 audit report (sampled: §7.2 competence audit):
- Major findings: 4 (no effectiveness evaluation for LCC training; no L&D evaluation cycle; no records-retention schedule for AM records; missing 3 AMPs in the document hierarchy).
- Minor findings: 12 (e.g., 24% competency gap on Asset Engineers; awareness % at 80%; missing 2 AMP-level procedures; communication plan incomplete on "how" column).
- Observations: 8 (e.g., dated PESTLE register from Lesson 1; missing insurer/lender in stakeholder matrix).
- OFIs: 5 (e.g., move from time-based to condition-based maintenance on 132 kV transformers).
N_total = 4 + 12 + 8 + 5 = 29. Follow-up: corrective-action register shows 4 majors closed within 90 days; 12 minors closed within 6 months; observations and OFIs tracked.
§9.2 conforms (programme + conduct + follow-up).

§9.3 Management review — last review (Q4) chaired by CEO. Inputs presented:
(a) Status of previous review actions: yes (4 of 5 closed, 1 overdue).
(b) Changes in external/internal issues: yes (Net-Zero statutory target reaffirmed; Ofgem RIIO-ET3 decision reviewed).
(c) AM performance (KPI dashboard): yes.
(d) AM effectiveness: yes (SAMP targets met 18/20).
(e) Audit results: yes (29 findings, 4 majors closed).
(f) Interested parties' feedback: yes (Ofgem feedback on AHI reporting; community feedback on visual amenity).
(g) MOC issues: yes (ester-fluid MOC presented, Net-Zero benefit confirmed).
(h) Resource adequacy: PARTIAL — capital resources confirmed, but workforce planning (23% retirement-eligible) not presented in detail.
Input coverage = 7/8 = 87.5% — major nonconformity (resource adequacy partial).

Outputs recorded:
(i) Improvement opportunities: 5 OFIs prioritized for §10.1.
(ii) AM policy/objectives changes: SAMP refresh approved (add IEC 61850 substation automation scope).
(iii) Resource needs: £450M capex reaffirmed; workforce succession plan to be developed.
(iv) AMS changes: AMS Manual to be revised; AMPs for cables, OHL, protection to be developed (close the Lesson 2 gap).
Output coverage = 4/4 = 100% (conformant). Outputs have owners and dates.
§9.3 conforms on outputs; nonconformity on inputs (resource adequacy partial). Corrective action: full workforce-planning input at next review.`,
    industrial_example: `Utilities — National Grid Electricity Transmission (UK). NGET's §8.1 operational planning is documented in the RIIO-T2 business plan (annual capex ~£1.5bn, reliability targets, Net-Zero milestones). §8.2 MOC register is public for material MOCs (e.g., SF6 alternatives for switchgear, ester-fluid for transformers). §8.3 outsourcing: NGET outsources asset-condition surveys, tree-cutting, and protection-relay testing. §9.1 KPI dashboard: NGET publishes network performance reports quarterly (SAIDI, SAIFI, CI, LLS). §9.2 internal audit: NGET's internal audit function reports to the Audit Committee; AMS audits per ISO 19011:2018. §9.3 management review: the Asset Management Committee reviews the AMS quarterly. CAMA assessors typically score NGET's §8/§9 maturity at Level 4 (Managed) — with documented improvement cycle, KPI cascade, and closed-loop audit follow-up.

Oil & Gas — Shell. Shell's group-wide AMS executes operational planning per asset (well, platform, refinery, terminal); §8.2 MOC is integrated into the engineering authority process (technical authority sign-off); §8.3 outsourcing includes major maintenance contracts and inspection contracts (e.g., with ALTUS Inspection for Asset Performance Management). §9.1 KPI dashboard includes production availability, HSE TRIR, environmental emissions. §9.2 internal audit per ISO 19011:2018 (group audit function). §9.3 management review at the executive committee quarterly. Maturity Level 4 across §8/§9 subjects.`,
    case_study: `CASE_TYPE = SYNTHETIC. Container terminal "PortX" (3 STS cranes, 12 RTGs, 1,200 m berth). CAMA assessor §8/§9 findings:

§8.1 Operational planning: SAMP sets annual throughput target 1.2M TEU, equipment availability 95%, crane-cycle-time  2500/hr).

§8.2 MOC register: 38 MOCs in last 12 months — sampled 5 (STS crane rope change from steel to synthetic; spreader specification change; IT/OT firewall change; yard-layout change; maintenance strategy change from time-based to condition-based on RTGs). MOC 1 traced end-to-end: risk assessment (likelihood 3 × consequence 3 = 9 medium); authorization (Engineering Manager); implementation plan (3 cranes, 6 weeks, communication to shipping line); post-implementation review (rope-life KPI improved 18%, no safety events). §8.2 conforms.

§8.3 Outsourcing: 2 providers — crane-component overhaul (provider K), IT/OT managed services (provider M). Contract for provider K: commercial + AMS requirements (HSE, OEM specs, KPI availability). Contract for provider M: commercial terms only — no AMS requirements (HSE, cyber-security, change control). §8.3 nonconformity for provider M.

§9.1 KPI dashboard: 20 KPIs — 16 achieved = 80% conformance (below 95% — minor nonconformity). Missing KPIs include cyber-security incident rate, OT-patch latency.

§9.2 Internal audit programme: 24 AMS processes over 3 years (8/year). Year-1 findings: 3 major + 9 minor + 6 observations + 4 OFIs → N_total = 22. Coverage = 24/24 = 100% (conformant). Auditors: 2 IAM-Cert + ISO 19011-trained — competence conforms. Independence: one auditor audited the MOC process he was previously responsible for — nonconformity on independence.

§9.3 Management review: last review chaired by COO. Inputs presented: 6/8 (audit results, KPIs, MOC, parties' feedback, M&S issues, previous review actions) — missing (g) MOC issues (presented but only summary, not the detail), (h) resource adequacy (not presented). Input coverage = 6/8 = 75% — major nonconformity. Outputs recorded: 4/4 (improvement opportunities, resource needs, policy/SAMP changes, AMS changes) — conforms.

Recommendations: (1) Repair §8.3 provider-M contract — add HSE, cyber-security, change-control requirements; close within 90 days. (2) Close KPI gap — add cyber-security incident rate, OT-patch latency; target 95% conformance in 12 months. (3) Auditor independence — reassign MOC-process audit to a different auditor; institute conflict-of-interest register. (4) Management review inputs — full MOC detail at next review; full resource-adequacy input. Target Level 3 across §8/§9 subjects in 12 months.`,
    visual_explanation: `NOT_APPLICABLE`,
    simulation_opportunity: `Build an internal audit simulator: the learner is the lead auditor for the §9.2 internal audit. They are presented with a 3-year audit programme, a sample of audit evidence (interviews, documents, observations), and must (a) classify findings per ISO 19011:2018 (major/minor/observation/OFI), (b) write the audit report with traceable evidence, (c) propose corrective actions per §10.2, and (d) verify effectiveness at the next surveillance audit. The simulator scores the learner's classifications against an assessor's key. Used in CAMA assessor training.`,
    common_mistakes: `- Broken feedback loop: KPIs reported but not fed back to SAMP re-planning — fails §8.1 conformance.
- Informal MOC: changes implemented without risk assessment or authorization — fails §8.2.
- Outsourcing contracts specifying commercial terms only, no AMS requirements — fails §8.3.
- KPI dashboard with lagging KPIs only (no leading indicators) — fails §9.1 conformance.
- Auditors auditing their own work — fails ISO 19011:2018 independence principle.
- Audit findings not followed up — fails §9.2 conformance (closed-loop required).
- Management review with partial inputs (e.g., missing resource adequacy) — fails §9.3.1 conformance.
- Management review outputs without owners and dates — fails §9.3.2 conformance.
- Corrective actions implemented but not verified for effectiveness — fails §10.2 closed-loop.`,
    limitations: `- Operational planning is resource-intensive; small organizations may struggle to cascade SAMP to AMP to operational control.
- MOC risk assessment is subjective; assessor calibration is required.
- Outsourcing control depends on contract-law expertise; technical AMS requirements may be under-specified.
- KPI dashboards can become report-card exercises without action — the dashboard is only as good as the action it triggers.
- Internal audit competence is scarce — IAM Cert + ISO 19011-trained auditors are a small pool.
- Management review can become ceremonial — top-management engagement determines quality (links to §5.1).`,
    comparison: `ISO 55001 §8/§9 vs ISO 9001:2015 §8/§9 (QMS): structure is Annex SL HLS; content differs. ISO 55001 §8.1 operational planning is *asset-lifecycle* planning (renewal, refurbishment, maintenance, inspection, disposal); QMS §8.1 is *production* planning (design, production, delivery). ISO 55001 §8.2 MOC is *asset/process* change; QMS §8.2.4 is *product* change control. ISO 55001 §8.3 outsourcing is *AM process* outsourcing; QMS §8.4 is *product/process* outsourcing. §9 audit and management review are nearly identical (HLS common text); ISO 55001 §9.1 AM-performance KPIs are asset-class-specific (SAIDI, AHI, leakage); QMS §9.1 KPIs are product-quality (defect rate, customer satisfaction).

ISO 55001 §8/§9 vs ISO 14001:2016 §8/§9 (EMS): EMS §8.1 operational planning is *environmental-aspects* operational control (emissions, waste, water); ISO 55001 §8.1 is asset-lifecycle operational control. EMS §9.1 monitoring is *environmental* performance (emissions, water quality, waste); ISO 55001 §9.1 is asset performance. §9.2 audit and §9.3 management review are nearly identical (HLS common text). An integrated AMS+EMS+QMS shares §9 evidence but layers different KPIs and operational controls.`,
    practical_application: `In a CAMA assessment, §8/§9 evidence review spans days 3-4 of fieldwork. The assessor opens with §8.1: samples one asset system end-to-end (SAMP target → AMP work programme → work order → operational control → KPI → SAMP feedback). Then §8.2 MOC: samples the register, traces one MOC end-to-end. Then §8.3 outsourcing: samples one contract, verifies AMS requirements + monitoring. Then §9.1 KPI dashboard: verifies cascade, leading/lagging balance, SMART, AM Steering Committee monthly review. Then §9.2 internal audit: reviews programme (3-year coverage), samples one audit report (findings classified per ISO 19011:2018), follows up corrective actions. Then §9.3 management review: samples last review minutes, verifies all 8 inputs presented and all 4 outputs recorded with owners and dates. Findings are graded per ISO 19011:2018. The §8/§9 evaluation is the most evidence-heavy — the assessor samples 8-10 artifacts per clause and traces end-to-end traceability from SAMP → AMP → work → KPI → audit → review → improvement.`,
    decision_scenario: `You are the CAMA lead assessor reviewing a chemical plant's §9.2 internal audit programme. The plant has 2 auditors, both IAM-Cert + ISO 19011-trained. Auditor A previously held the Maintenance Manager role (now in a different department). Auditor B is the current Asset Risk Manager. The audit programme assigns Auditor A to audit the maintenance process and Auditor B to audit the asset-risk process. Do you accept these assignments?

Decision: No. ISO 19011:2018 auditing principle "independence" requires that auditors do not audit their own work. Auditor A previously held the Maintenance Manager role — auditing the maintenance process he was previously responsible for is a conflict-of-interest (even though he has moved departments, his previous decisions are in scope of the audit). Auditor B is currently the Asset Risk Manager — auditing the asset-risk process he is currently responsible for is a direct conflict-of-interest. Both assignments fail the independence principle.

Action: raise a §9.2 nonconformity (auditor independence). Require the plant to (a) reassign the maintenance-process audit to an independent auditor (external or from a non-conflicting function), (b) reassign the asset-risk-process audit to an independent auditor, and (c) institute a conflict-of-interest register that documents, for every audit assignment, the auditor's prior and current roles and the rationale for the assignment. Document per ISO 19011:2018 audit-finding protocol; verify at the next surveillance audit. This finding is also a §5.1 leadership nonconformity (top management has allowed an independence breach to persist).`,
    practice_questions: `1. List the four ISO 19011:2018 audit-finding classifications and one example of each.
2. Compute the audit-programme coverage for a 3-year cycle of 36 AMS processes, 12 audited per year.
3. List the 8 mandatory §9.3 management review inputs and the 4 mandatory outputs.
4. Describe the SAMP → AMP → work → KPI → SAMP feedback loop and why a broken loop fails §8.1 conformance.`,
    certification_questions: `1. (CAMA, Recall) ISO 55001 §8.3 requires the organization to ensure that outsourced AM processes are: (a) transferred to the provider with no further control; (b) controlled; (c) eliminated; (d) audited annually by the provider. [Answer: (b).]
2. (CAMA, Apply) An internal audit programme covers 36 AMS processes over 3 years (12/year). Year-1 findings: 4 major, 12 minor, 8 observations, 5 OFIs. N_total = ?: (a) 24; (b) 29; (c) 36; (d) 49. [Answer: (b).]
3. (CAMA, Analyze) An auditor audits the MOC process he was previously responsible for. The strongest finding is: (a) §8.2 nonconformity; (b) §9.2 nonconformity (independence); (c) §9.3 nonconformity; (d) §7.2 nonconformity (competence). [Answer: (b).]`,
    summary: `ISO 55001 §8 (Operation) and §9 (Performance Evaluation) close the AMS PDCA loop. §8.1 operational planning must close the feedback loop (SAMP → AMP → work → KPI → SAMP). §8.2 MOC requires risk assessment, authorization, implementation, and post-implementation review — informal change fails conformance. §8.3 outsourcing does not transfer accountability — the organization controls the provider's AMS conformance. §9.1 KPI dashboard cascades from SAMP to AMP to operational control, with leading and lagging KPIs balanced. §9.2 internal audit is per ISO 19011:2018 — programme (3-year coverage, risk-based), conduct (plan, opening, evidence, findings classified major/minor/observation/OFI, closing, report, follow-up), independence (auditors do not audit their own work). §9.3 management review has 8 mandatory inputs (audit results, KPIs, MOC, parties' feedback, M&S issues, resource adequacy, improvement actions, previous review outputs) and 4 mandatory outputs (improvement opportunities, resource needs, policy/SAMP changes, AMS changes) — all recorded with owners and dates. §8/§9 findings feed §10 improvement. The CAMA assessor samples 8-10 artifacts per clause and traces end-to-end traceability; findings are graded per ISO 19011:2018 audit-finding protocol.`,
    key_takeaways: `- §8/§9 close the PDCA loop: §8 = Do, §9 = Check.
- §8.1 operational planning must close the SAMP → AMP → work → KPI → SAMP feedback loop.
- §8.2 MOC requires risk assessment, authorization, implementation, post-implementation review.
- §8.3 outsourcing does not transfer accountability — the organization controls the provider's AMS conformance.
- §9.1 KPI dashboard cascades from SAMP to AMP to operational control; leading + lagging KPIs balanced.
- §9.2 internal audit is per ISO 19011:2018 — programme, conduct, independence, follow-up.
- §9.3 management review has 8 mandatory inputs and 4 mandatory outputs — all with owners and dates.
- §8/§9 findings feed §10 improvement — closed-loop verification at next surveillance audit.
- Audit-finding classification (major/minor/observation/OFI) per ISO 19011:2018 — the assessor applies consistently.`,
    references: `- ISO 55001:2014, Asset management — Management systems — Requirements, §8 (Operation), §9 (Performance Evaluation), §10 (Improvement).
- ISO 55000:2014, Asset management — Overview, principles and terminology (definitions of monitoring, measurement, analysis, evaluation).
- ISO 55002:2018, Asset management — Guidelines for the application of ISO 55001, §A.8 (Operation), §A.9 (Performance Evaluation).
- The IAM, "Asset Management — An Anatomy" (Lifecycle Delivery; Risk & Reliability; AM Information groups).
- The IAM, "Asset Management Maturity Model" (subject-level scoring for §8/§9 subjects).
- ISO 19011:2018, Guidelines for auditing management systems (audit principles, programme, conduct, findings).`,
  },
  knowledgeObject: {
    title: "Operation & Performance Evaluation (ISO 55001 §8, §9)",
    domain: "Asset Management System (ISO 55001)",
    competency: "Operation & Performance Evaluation (§8, §9)",
    topic: "AMS Operation, MOC, Outsourcing, KPIs, Internal Audit, Management Review",
    concept: "ISO 55001 §8 operational planning & control, MOC, outsourcing; §9 monitoring/measurement/analysis/evaluation, internal audit (per ISO 19011:2018), management review (8 inputs, 4 outputs)",
    body: {
      definitions: [
        "Operational planning & control (§8.1): the planning, implementation, and control of AM processes that operationalize SAMP/AMP targets.",
        "Management of change / MOC (§8.2): the controlled modification of assets, asset systems, processes, or the AMS itself — risk assessment, authorization, implementation, post-implementation review.",
        "Outsourcing (§8.3): control of AM processes performed by external providers; the organization remains accountable for AMS conformance of outsourced work.",
        "Monitoring (§9.1): determining the status of a system, process, or activity (continuous, real-time).",
        "Measurement (§9.1): determining a value (quantitative, periodic).",
        "Analysis (§9.1): examining data to identify patterns, trends, root causes.",
        "Evaluation (§9.1): judging performance against criteria (objectives, targets, baselines).",
        "Internal audit (§9.2): systematic, independent, documented process per ISO 19011:2018 for obtaining audit evidence and evaluating it objectively to determine the extent to which audit criteria are fulfilled.",
        "Audit findings (ISO 19011:2018): results of the evaluation of collected audit evidence against audit criteria — major nonconformity, minor nonconformity, observation, opportunity-for-improvement (OFI).",
        "Management review (§9.3): top management's periodic review of AMS suitability, adequacy, effectiveness — 8 mandatory inputs, 4 mandatory outputs.",
        "SAIDI: System Average Interruption Duration Index — average outage duration per customer per year (utility KPI).",
        "SAIFI: System Average Interruption Frequency Index — average number of interruptions per customer per year.",
        "AHI: Asset Health Index — composite 1..5 score of asset condition per asset class.",
      ],
      principles: [
        "§8/§9 close the PDCA loop: §8 = Do, §9 = Check.",
        "§8.1 operational planning must close the SAMP → AMP → work → KPI → SAMP feedback loop.",
        "§8.2 MOC requires risk assessment, authorization, implementation, post-implementation review.",
        "§8.3 outsourcing does not transfer accountability — the organization controls the provider's AMS conformance.",
        "§9.1 KPI dashboard cascades from SAMP to AMP to operational control; leading + lagging KPIs balanced.",
        "§9.2 internal audit is per ISO 19011:2018 — independence (no auditor audits own work), risk-based programme, closed-loop follow-up.",
        "§9.3 management review has 8 mandatory inputs and 4 mandatory outputs — all with owners and dates.",
        "§8/§9 findings feed §10 improvement — closed-loop verification at next surveillance audit.",
      ],
      components: [
        "SAMP work-programme cascade (§8.1) — annual capex, reliability, Net-Zero targets → AMP work programmes → work orders → operational controls → KPIs.",
        "MOC register (§8.2) — change description, assets/processes affected, risk assessment, authorization, implementation, post-implementation review.",
        "Outsourcing contracts (§8.3) — commercial + AMS requirements (HSE, AHI, data exchange, KPIs, change control).",
        "Outsourced-provider monitoring (§8.3) — KPI review, HSE review, periodic contract review.",
        "KPI dashboard (§9.1) — SAIDI, SAIFI, AHI distribution, capex-vs-plan, top-10 risks, Net-Zero milestones, leakage.",
        "Internal audit programme (§9.2) — 3-year coverage of all ISO 55001 clauses, risk-based, ISO 19011:2018 conformance.",
        "Audit reports (§9.2) — findings classified major/minor/observation/OFI per ISO 19011:2018.",
        "Management review minutes (§9.3) — 8 inputs, 4 outputs, owners and dates for each output.",
        "Corrective-action register (§10.2) — fed from audit findings and management review outputs.",
      ],
      mechanism: [
        "§8/§9 lifecycle: §8.1 operational planning cascade (SAMP → AMP → work → KPI → SAMP feedback) → §8.2 MOC register (change proposed, risk-assessed, authorized, implemented, post-reviewed) → §8.3 outsourcing contract (AMS requirements specified, monitored) → §9.1 KPI dashboard (monitored, analyzed, evaluated monthly at AM Steering Committee) → §9.2 internal audit programme (3-year cycle, risk-based, findings per ISO 19011:2018, follow-up closed-loop) → §9.3 management review (8 inputs, 4 outputs, owners and dates) → §10 improvement (corrective actions, continual improvement, closed-loop verification at next surveillance). Each step produces documented evidence the assessor samples end-to-end for traceability.",
      ],
      process: [
        "1. Verify §8.1 operational planning: sample one asset system end-to-end (SAMP target → AMP work programme → work order → operational control → KPI → SAMP feedback).",
        "2. Verify §8.2 MOC: sample 5 MOCs from the register; trace one end-to-end (risk assessment, authorization, implementation, post-implementation review).",
        "3. Verify §8.3 outsourcing: sample one outsourced provider; trace contract (AMS requirements) and monitoring (KPI review, HSE review).",
        "4. Verify §9.1 KPI dashboard: cascade from SAMP to AMP to operational control; leading + lagging balance; SMART targets; AM Steering Committee monthly review.",
        "5. Verify §9.2 internal audit programme: 3-year coverage; risk-based; auditor competence (IAM Cert + ISO 19011); independence (not auditing own work); sample one audit report (findings classified per ISO 19011:2018).",
        "6. Verify §9.2 audit follow-up: corrective-action register shows closed-loop (action taken, verified, signed off).",
        "7. Verify §9.3 management review: last review minutes show all 8 inputs presented and all 4 outputs recorded with owners and dates; outputs feed §10 improvement.",
        "8. Verify §8/§9 findings feed §10.2 corrective action and §10.1 continual improvement; verify effectiveness of corrective actions (closed-loop verification at next surveillance audit).",
      ],
      formulas: [
        "Audit finding count: N_total = N_major + N_minor + N_observation + N_OFI (per ISO 19011:2018).",
        "Audit-programme coverage: Coverage% = N_processes_audited / N_processes_in_scope × 100 (3-year cycle, target 100%).",
        "KPI conformance: KPI_conformance = N_KPIs_achieved / N_KPIs_total × 100 (target 95%).",
        "Management review input coverage: Input_coverage = N_inputs_provided / 8 × 100 (target 100%).",
        "Management review output coverage: Output_coverage = N_outputs_recorded / 4 × 100 (target 100%).",
      ],
      metrics: [
        "Audit finding count N_total and distribution (major/minor/observation/OFI).",
        "Audit-programme coverage % (3-year cycle, target 100%).",
        "KPI conformance % (target 95%).",
        "Management review input coverage % (target 100%).",
        "Management review output coverage % (target 100%).",
        "MOC register completeness (risk assessment, authorization, implementation, post-implementation review per MOC).",
        "Outsourcing contract AMS-requirements completeness (HSE, AHI, data exchange, KPIs, change control).",
        "Corrective-action closed-loop time (target: majors ≤90 days, minors ≤180 days).",
      ],
      examples: [
        "§8.1 SAMP→AMP→work→KPI loop: SAMP target AHI≥3.5 → AMP work programme 12 renewals + 40 refurbishments + 200 inspections → work order → operational control → KPI AHI median 3.6 → SAMP feedback closed.",
        "§8.2 MOC: transformer oil change mineral→ester (Net-Zero); risk assessment (2×2=4 low); authorization (Asset Strategy Director); implementation (8 transformers, 24 months, £3.2M); post-implementation review (ester AHI 3.8 vs mineral 3.4 — benefit confirmed).",
        "§8.3 outsourcing: asset-condition surveys contract — commercial + AMS requirements (AHI methodology, HSE per HSG47, data exchange via API, KPIs survey accuracy ≥95%, on-time ≥98%, HSE RIF=0).",
        "§9.1 KPI dashboard: SAIDI 32/35, SAIFI 0.07/0.08, AHI transformer 3.6/3.5, AHI cable 2.9/3.0, capex +7%/±5%, HSE RIF 0.3/0.5 — 18/20 KPIs achieved = 90% (below 95%).",
        "§9.2 audit programme: 36 processes over 3 years (12/year); year-1 findings 4 major + 12 minor + 8 observations + 5 OFIs = 29; coverage 100%; closed-loop follow-up.",
        "§9.3 management review: 7/8 inputs presented (resource adequacy partial) — 87.5% (nonconformity); 4/4 outputs recorded — 100% (conformant).",
      ],
      industrial_examples: [
        "Utilities — National Grid Electricity Transmission (UK): §8.1 documented in RIIO-T2 business plan; §8.2 MOC public for material changes (SF6 alternatives, ester-fluid); §8.3 outsourcing (asset-condition surveys, tree-cutting, protection-relay testing); §9.1 quarterly network performance reports (SAIDI, SAIFI, CI, LLS); §9.2 internal audit per ISO 19011:2018 reporting to Audit Committee; §9.3 Asset Management Committee quarterly review. Maturity Level 4.",
        "Oil & Gas — Shell: §8.1 operational planning per asset (well/platform/refinery/terminal); §8.2 MOC integrated into engineering authority (technical authority sign-off); §8.3 outsourcing includes major maintenance + inspection contracts (e.g., ALTUS Inspection); §9.1 KPIs production availability, HSE TRIR, environmental emissions; §9.2 group audit function per ISO 19011; §9.3 executive committee quarterly review. Maturity Level 4.",
        "Container terminal — port operator: §8.1 SAMP throughput/availability/cycle-time targets → AMP per asset class (STS, RTG, IT/OT); §8.2 MOC for crane-component changes; §8.3 outsourcing for crane overhaul and IT/OT managed services; §9.1 KPIs availability, cycle time, cyber-incident rate; §9.2 audit programme per ISO 19011; §9.3 COO-chaired review.",
        "Water — UK water utility: §8.1 SAMP leakage/interruption/WQP targets → AMP per asset class (mains, WTWs, pumping stations); §8.2 MOC for treatment-process changes; §8.3 outsourcing for mains-laying and leakage-detection contracts; §9.1 KPIs leakage (Ml/d), supply interruptions, water-quality compliance; §9.2 internal audit; §9.3 Board review.",
      ],
      case_studies: [
        "CASE_TYPE = SYNTHETIC. Container terminal 'PortX' (3 STS, 12 RTGs). CAMA assessor §8/§9 findings: §8.1 SAMP-to-AMP cascade conformant; §8.2 MOC 5 sampled, traced end-to-end conformant; §8.3 outsourcing: provider K contract conforms, provider M (IT/OT managed services) contract has commercial terms only — no AMS requirements (HSE, cyber-security, change control) — nonconformity; §9.1 KPI dashboard 16/20 achieved = 80% (below 95% — minor nonconformity); §9.2 audit programme 24 processes over 3 years (8/year), 22 findings (3 major + 9 minor + 6 observations + 4 OFIs), 100% coverage, but auditor independence breach — Auditor A audited the maintenance process he previously managed, Auditor B audited the asset-risk process he currently manages — §9.2 nonconformity (independence); §9.3 management review 6/8 inputs (MOC detail partial, resource adequacy missing) — major nonconformity; 4/4 outputs recorded — conformant. Recommendations: repair provider-M contract; close KPI gap (cyber-incident rate, OT-patch latency); auditor independence reassignment + conflict-of-interest register; full MOC detail + resource-adequacy input at next review. Target Level 3 across §8/§9 in 12 months.",
      ],
      common_errors: [
        "Broken feedback loop: KPIs reported but not fed back to SAMP re-planning — fails §8.1 conformance.",
        "Informal MOC: changes implemented without risk assessment or authorization — fails §8.2.",
        "Outsourcing contracts specifying commercial terms only, no AMS requirements — fails §8.3.",
        "KPI dashboard with lagging KPIs only (no leading indicators) — fails §9.1 conformance.",
        "Auditors auditing their own work — fails ISO 19011:2018 independence principle.",
        "Audit findings not followed up — fails §9.2 conformance (closed-loop required).",
        "Management review with partial inputs (e.g., missing resource adequacy) — fails §9.3.1 conformance.",
        "Management review outputs without owners and dates — fails §9.3.2 conformance.",
        "Corrective actions implemented but not verified for effectiveness — fails §10.2 closed-loop.",
      ],
      limitations: [
        "Operational planning is resource-intensive; small organizations may struggle to cascade SAMP to AMP to operational control.",
        "MOC risk assessment is subjective; assessor calibration is required.",
        "Outsourcing control depends on contract-law expertise; technical AMS requirements may be under-specified.",
        "KPI dashboards can become report-card exercises without action — the dashboard is only as good as the action it triggers.",
        "Internal audit competence is scarce — IAM Cert + ISO 19011-trained auditors are a small pool.",
        "Management review can become ceremonial — top-management engagement determines quality (links to §5.1).",
      ],
      best_practices: [
        "Close the §8.1 feedback loop: KPI dashboard reviewed monthly at AM Steering Committee → SAMP re-planning quarterly.",
        "Apply MOC for every change to assets, asset systems, processes, or the AMS; trace each MOC end-to-end.",
        "Specify AMS requirements (HSE, AHI, data exchange, KPIs, change control) in every outsourcing contract; monitor provider conformance.",
        "Build a KPI dashboard with leading + lagging KPIs cascading from SAMP to AMP to operational control; SMART targets.",
        "Build a 3-year internal audit programme covering all ISO 55001 clauses; risk-based; auditor competence (IAM Cert + ISO 19011); independence assured (no auditor audits own work).",
        "Close audit findings within target (majors ≤90 days, minors ≤180 days); verify effectiveness at next surveillance.",
        "Conduct management review with all 8 inputs presented in detail and all 4 outputs recorded with owners and dates; outputs feed §10 improvement.",
        "Verify §8/§9 effectiveness via the closed-loop improvement cycle (§10.1 continual improvement + §10.2 corrective action).",
      ],
      related_concepts: [
        "Context of the Organization (Lesson 1) — §4 context feeds §9.3 management review input (b).",
        "Leadership & Support (Lesson 2) — §5 leadership engagement determines §9.3 management review quality; §7 competence/awareness are §9.2 audit subjects.",
        "SAMP (§6.2) — the documented information that §8.1 operationalizes and §9.1 evaluates.",
        "ISO 19011:2018 — the auditing standard §9.2 internal audit must conform to.",
        "Asset Management Plan (AMP) — the lifecycle plan §8.1 operationalizes per asset system.",
        "IAM Anatomy 'Lifecycle Delivery', 'Risk & Reliability', 'AM Information' groups — conceptual references for §8/§9.",
      ],
      prerequisites: [
        "CAMA Context of the Organization (Lesson 1) — §4 scope, processes.",
        "CAMA Leadership & Support (Lesson 2) — §5 leadership, §7 documented information, competence.",
        "ISO 19011:2018 auditing principles (audit principles, programme management, conduct).",
        "KPI design fundamentals (SMART, leading vs lagging, hierarchical cascade).",
      ],
      references: [
        "ISO 55001:2014, Asset management — Management systems — Requirements, §8 (Operation), §9 (Performance Evaluation), §10 (Improvement).",
        "ISO 55000:2014, Asset management — Overview, principles and terminology.",
        "ISO 55002:2018, Asset management — Guidelines for the application of ISO 55001, §A.8, §A.9.",
        "The IAM, Asset Management — An Anatomy (Lifecycle Delivery; Risk & Reliability; AM Information groups).",
        "The IAM, Asset Management Maturity Model.",
        "ISO 19011:2018, Guidelines for auditing management systems.",
      ],
    },
  },
  questions: [
    {
      competencyName: "Operation & Performance Evaluation (§8, §9)",
      type: "MultipleChoice",
      difficulty: "Easy",
      bloomLevel: "Remember",
      cognitiveLevel: "Recall",
      skillType: "Definitional",
      stem: "Under ISO 55001 §8.3, the organization MUST ensure that outsourced AM processes are:",
      whyCorrect:
        "ISO 55001 §8.3 requires the organization to ensure that outsourced processes are *controlled*. The organization remains accountable for AMS conformance of outsourced work — control is exercised through the contract (specifying AMS requirements), the monitoring of the provider's conformance, and periodic contract review. The other options are incorrect: §8.3 does not allow transferring outsourced processes without control (option A); does not require elimination of outsourcing (option C); does not delegate auditing to the provider (option D — the organization audits or monitors the provider's conformance, not the other way around).",
      whyOthersWrong: [
        "Option A (transferred to the provider with no further control) — §8.3 explicitly requires control; transferring without control fails conformance.",
        "Option C (eliminated) — ISO 55001 does not prohibit outsourcing; it requires control. Many organizations legitimately outsource asset-condition surveys, tree-cutting, protection-relay testing.",
        "Option D (audited annually by the provider) — the organization remains accountable; the provider may self-audit but the organization independently verifies conformance.",
      ],
      explanation:
        "§8.3 requires the organization to control outsourced AM processes — through contract AMS-requirements, monitoring of provider conformance, and periodic contract review. Accountability is not transferred.",
      options: [
        { text: "Transferred to the provider with no further control", isCorrect: false },
        { text: "Controlled", isCorrect: true },
        { text: "Eliminated", isCorrect: false },
        { text: "Audited annually by the provider", isCorrect: false },
      ],
    },
    {
      competencyName: "Operation & Performance Evaluation (§8, §9)",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Calculation",
      skillType: "Numerical",
      scenario: "Utilities",
      stem: "A utility's internal audit programme covers 36 AMS processes over a 3-year cycle (12/year). Year-1 findings: 4 major + 12 minor + 8 observations + 5 OFIs. What is the total finding count N_total and the audit-programme coverage %?",
      whyCorrect:
        "N_total = N_major + N_minor + N_observation + N_OFI = 4 + 12 + 8 + 5 = 29. Coverage % = N_processes_audited / N_processes_in_scope × 100 = 12/36 × 100 = 33.3% per year, but over the 3-year cycle: 36/36 × 100 = 100% (the 3-year coverage target). The assessor reports both: per-year coverage (33.3%) and 3-year-cycle coverage (100%). The finding count is 29.",
      whyOthersWrong: [
        "Option A (N_total = 24, coverage = 75%) — would arise from summing only major + minor + observations (4+12+8=24) and computing 3-year coverage as 27/36=75% (incorrectly excluding OFIs and miscounting).",
        "Option B (N_total = 29, coverage = 75%) — finding count correct, but coverage % wrong (75% would require 27/36 — not matching the inputs).",
        "Option D (N_total = 36, coverage = 100%) — confusing the finding count with the number of AMS processes in scope (36).",
      ],
      explanation:
        "N_total = 4+12+8+5 = 29 (per ISO 19011:2018 classification). Coverage % = 12/36 = 33.3% per year; 36/36 = 100% over the 3-year cycle (conformant on coverage; findings to be closed per §10.2).",
      options: [
        { text: "N_total = 24, coverage = 75%", isCorrect: false },
        { text: "N_total = 29, coverage = 100% over 3 years", isCorrect: true },
        { text: "N_total = 29, coverage = 75%", isCorrect: false },
        { text: "N_total = 36, coverage = 100%", isCorrect: false },
      ],
    },
    {
      competencyName: "Operation & Performance Evaluation (§8, §9)",
      type: "MultipleChoice",
      difficulty: "Medium",
      bloomLevel: "Apply",
      cognitiveLevel: "Application",
      skillType: "Procedural",
      scenario: "Oil & Gas",
      stem: "An Oil & Gas operator's internal audit programme assigns an auditor to audit the MOC process he was previously responsible for (he has now moved to a different department). Under ISO 19011:2018, what is the correct assessment?",
      whyCorrect:
        "ISO 19011:2018 auditing principle 'independence' requires that auditors do not audit their own work — and that includes work they were previously responsible for, even if they have moved departments. The previous decisions are in scope of the audit; the auditor's prior role creates a conflict-of-interest that biases the audit (consciously or subconsciously). The correct assessment is a §9.2 nonconformity (auditor independence), requiring the assignment to be reassigned to an independent auditor and a conflict-of-interest register to be instituted.",
      whyOthersWrong: [
        "Option A (§8.2 nonconformity — MOC process) — the MOC process itself is not the issue; the issue is the auditor's independence.",
        "Option C (§9.3 nonconformity — management review) — management review is not the issue; the audit assignment is.",
        "Option D (§7.2 nonconformity — competence) — the auditor is competent (the issue is independence, not competence).",
      ],
      explanation:
        "ISO 19011:2018 independence principle: auditors do not audit their own work, including prior work. Reassign to an independent auditor; institute a conflict-of-interest register. §9.2 nonconformity.",
      options: [
        { text: "§8.2 nonconformity — MOC process is flawed", isCorrect: false },
        { text: "§9.2 nonconformity — auditor independence breached", isCorrect: true },
        { text: "§9.3 nonconformity — management review flawed", isCorrect: false },
        { text: "§7.2 nonconformity — auditor competence gap", isCorrect: false },
      ],
    },
    {
      competencyName: "Operation & Performance Evaluation (§8, §9)",
      type: "TrueFalse",
      difficulty: "Hard",
      bloomLevel: "Analyze",
      cognitiveLevel: "Analysis",
      skillType: "Conceptual",
      scenario: "Utilities",
      stem: "True or False: ISO 55001 §9.3 management review requires that all eight mandatory inputs be presented in detail and all four mandatory outputs be recorded with owners and dates, or the review fails conformance.",
      whyCorrect:
        "TRUE. ISO 55001 §9.3.1 specifies 8 mandatory management-review inputs (status of previous actions; changes in external/internal issues; AM performance; AM effectiveness; audit results; interested parties' feedback; MOC issues; resource adequacy) and §9.3.2 specifies 4 mandatory outputs (improvement opportunities; AM policy or AM objectives changes; resource needs; AMS changes — organizational implications). ISO 55002:2018 §A.9.3 reinforces that all 8 inputs must be presented (not summarized away) and all 4 outputs must be recorded with owners and dates. A review missing any input or any output fails §9.3 conformance — the assessor raises a nonconformity.",
      whyOthersWrong: [
        "Option FALSE — would imply that partial inputs or outputs are acceptable. ISO 55001 §9.3 is unambiguous: the inputs and outputs are mandatory, not optional. ISO 55002:2018 §A.9.3 reinforces this with interpretive guidance on the depth of each input.",
      ],
      explanation:
        "TRUE. §9.3.1 = 8 mandatory inputs; §9.3.2 = 4 mandatory outputs. All must be present in detail with owners and dates, or the review fails conformance.",
      options: [
        { text: "TRUE", isCorrect: true },
        { text: "FALSE", isCorrect: false },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Exports — assembled lesson array (mirror cre-reliability-modeling.ts)
// ---------------------------------------------------------------------------

export const CAMA_AMS_LESSONS: RefLesson[] = [
  LESSON_CONTEXT,
  LESSON_LEADERSHIP_SUPPORT,
  LESSON_OPERATION_PERFORMANCE,
];

// ---------------------------------------------------------------------------
// AMS competencies created inside loadReference() (AMS domain exists in
// src/lib/ref-content/cama.ts with NO competencies yet — this loader seeds
// the 3 AMS competencies and then loads the deep content).
// ---------------------------------------------------------------------------

interface SeedCompetency {
  name: string;
  description: string;
  order: number;
}

const CAMA_AMS_COMPETENCIES: SeedCompetency[] = [
  {
    name: "Context of the Organization (ISO 55001 §4)",
    description:
      "ISO 55001 §4 context of the organization — external/internal issues (PESTLE + capability/culture audit, §4.1), interested parties & their needs/expectations and traceability to AMS requirements (§4.2), scope of the AMS with explicit exclusions (§4.3), AMS processes and their interactions (§4.4), and the §5.2 asset-management policy. The foundational clause that anchors every later ISO 55001 requirement.",
    order: 1,
  },
  {
    name: "Leadership & Support (§5, §7)",
    description:
      "ISO 55001 §5 leadership & commitment (§5.1), policy (§5.2), roles/responsibilities/authorities (§5.3); §7 support — resources, competence (§7.2 with gap% KPI), awareness (§7.3), communication (§7.4), documented information (§7.5 with hierarchy policy → SAMP → AMPs → procedures → records). The clause that operationalizes the AMS through leadership behaviour and support infrastructure.",
    order: 2,
  },
  {
    name: "Operation & Performance Evaluation (§8, §9)",
    description:
      "ISO 55001 §8 operation — operational planning & control (§8.1), management of change (§8.2), outsourcing (§8.3); §9 performance evaluation — monitoring/measurement/analysis/evaluation (§9.1 KPI dashboard), internal audit (§9.2 per ISO 19011:2018 with major/minor/observation/OFI classification and independence), management review (§9.3 with 8 mandatory inputs and 4 mandatory outputs). The clause that closes the AMS PDCA loop and feeds §10 improvement.",
    order: 3,
  },
];

// ---------------------------------------------------------------------------
// Loader — CONTENT-only (mirrors cre-reliability-modeling.ts) with the
// additional step of creating the 3 AMS competencies inside loadReference().
// ---------------------------------------------------------------------------

/**
 * Upsert the CAMA Asset Management System (AMS) CONTENT into the database.
 * Idempotent: safe to call repeatedly. Returns record counts written.
 *
 * Flow:
 *  1. Find CAMA certification by slug "cama" (the structure+AMP-content loader
 *     in src/lib/ref-content/cama.ts is a prerequisite).
 *  2. Find the AMS domain by code "AMS" (certificationId = cama.id). The AMS
 *     domain exists in cama.ts with NO competencies — delete any stale AMS
 *     competencies and create the 3 AMS competencies from
 *     CAMA_AMS_COMPETENCIES. Map by NAME -> id.
 *  3. Upsert References globally (by title, no sectionId) → shared ids
 *     applied to every AMS lesson, KO, and question.
 *  4. For each lesson:
 *     - db.lesson.findFirst({where:{competencyId, slug}}) then update or
 *       create with sectionId=null, certificationId, competencyId, slug,
 *       title, titleAr, order, durationMin, conceptIntroduction, example,
 *       keyFormulas, exercise, sections (JSON.stringify), referenceIds
 *       (JSON.stringify shared), status="READY", confidence="HIGH",
 *       verificationStatus="VERIFIED", version="1.0.0", lastReviewedAt=now.
 *  5. Upsert KnowledgeObject per lesson: findFirst({where:{lessonId}}) then
 *       create/update with certificationId, domainId (AMS), competencyId,
 *       lessonId, body JSON, referenceIds (JSON shared), certificationIds
 *       (JSON [cama.id]), status="READY", confidence="HIGH",
 *       verificationStatus="VERIFIED", version="1.0.0".
 *  6. Per lesson: deleteMany questions {certificationId, competencyId} then
 *     create each enriched question with nested QuestionOption records,
 *     knowledgeObjectId link, whyCorrect, whyOthersWrong (JSON),
 *     referenceIds (JSON shared), status="READY", verificationStatus=
 *     "VERIFIED", reviewStatus="PENDING", version="1.0.0".
 *  7. Return { certification, domain, competencies, lessons, kos,
 *      questions, references } counts.
 *
 * NOTE: does NOT call src/lib/ref-content/cama.ts — that loader (structure +
 * AMP content) is a prerequisite and must have been run first.
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

  // 2) Find the AMS domain by code "AMS" (certificationId = cama.id). The
  //    AMS domain exists in cama.ts but is seeded with NO competencies —
  //    delete any stale AMS competencies and create the 3 AMS competencies.
  const amsDomain = await db.domain.findFirst({
    where: { certificationId: certification.id, code: "AMS" },
  });
  if (!amsDomain) {
    throw new Error(
      'Asset Management System (AMS) domain not found under CAMA. Run the CAMA structure+AMP-content loader (src/lib/ref-content/cama.ts) first.'
    );
  }

  // Delete any existing AMS competencies (idempotent re-create).
  await db.competency.deleteMany({
    where: { domainId: amsDomain.id },
  });

  // Create the 3 AMS competencies.
  for (const c of CAMA_AMS_COMPETENCIES) {
    await db.competency.create({
      data: {
        domainId: amsDomain.id,
        name: c.name,
        description: c.description,
        order: c.order,
      },
    });
  }

  // Map AMS competencies by NAME -> id.
  const amsCompetencies = await db.competency.findMany({
    where: { domainId: amsDomain.id },
  });
  const competencyIdByName: Record<string, string> = {};
  for (const c of amsCompetencies) {
    competencyIdByName[c.name] = c.id;
  }
  // Validate that all 3 expected AMS competencies exist by name.
  const expectedCompetencyNames = CAMA_AMS_LESSONS.map((l) => l.competencyName);
  const missing = expectedCompetencyNames.filter(
    (n) => !competencyIdByName[n]
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing AMS competencies by name: ${missing.join(
        ", "
      )}. Ensure CAMA_AMS_COMPETENCIES matches CAMA_AMS_LESSONS competencyName.`
    );
  }

  // 3) References — global (no sectionId), upserted by title.
  const refIdsByTitle: Record<string, string> = {};
  for (const src of CAMA_AMS_SOURCES) {
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
  const sharedReferenceIds = CAMA_AMS_SOURCES.map((s) => refIdsByTitle[s.title]).filter(
    Boolean
  ) as string[];
  const sharedReferenceIdsJson = JSON.stringify(sharedReferenceIds);
  const referencesCount = Object.keys(refIdsByTitle).length;

  // 4) Lessons, 5) KnowledgeObjects, 6) Questions
  let lessonsCount = 0;
  let kosCount = 0;
  let questionsCount = 0;

  for (const lesson of CAMA_AMS_LESSONS) {
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
      domainId: amsDomain.id,
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
          domainId: amsDomain.id,
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
    domain: amsDomain.id,
    competencies: amsCompetencies.length,
    lessons: lessonsCount,
    kos: kosCount,
    questions: questionsCount,
    references: referencesCount,
  };
}
