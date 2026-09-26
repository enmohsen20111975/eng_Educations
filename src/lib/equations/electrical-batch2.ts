/**
 * Electrical Engineering Equations - Batch 2
 * Power Factor, Short Circuit, Transformer
 * Total: 50 equations
 */

export const electricalBatch2 = [
  // ============================================
  // POWER FACTOR EQUATIONS (12 equations)
  // ============================================
  
  {
    equation_id: 'eq_pf_from_powers',
    name: 'Power Factor from Powers',
    description: 'Calculate power factor from active and apparent power',
    domain: 'electrical',
    category_slug: 'power-factor',
    equation: 'PF = P / S',
    equation_latex: '\\cos\\phi = \\frac{P}{S}',
    difficulty_level: 'beginner',
    tags: ['power', 'factor', 'active', 'apparent'],
    inputs: [
      { name: 'P', symbol: 'P', description: 'Active Power', unit: 'W', default_value: 85000, min_value: 0, input_order: 1 },
      { name: 'S', symbol: 'S', description: 'Apparent Power', unit: 'VA', default_value: 100000, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'PF', symbol: 'cos φ', description: 'Power Factor', unit: '', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_pf_from_angle',
    name: 'Power Factor from Phase Angle',
    description: 'Calculate power factor from phase angle',
    domain: 'electrical',
    category_slug: 'power-factor',
    equation: 'PF = cos(phi)',
    equation_latex: '\\cos\\phi = \\cos(\\phi)',
    difficulty_level: 'beginner',
    tags: ['power', 'factor', 'phase', 'angle'],
    inputs: [
      { name: 'phi', symbol: 'φ', description: 'Phase Angle', unit: 'degrees', default_value: 30, min_value: 0, max_value: 90, input_order: 1 }
    ],
    outputs: [
      { name: 'PF', symbol: 'cos φ', description: 'Power Factor', unit: '', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_pf_correction_kvar',
    name: 'Power Factor Correction kVAR',
    description: 'Calculate required capacitor kVAR for power factor correction',
    domain: 'electrical',
    category_slug: 'power-factor',
    equation: 'Qc = P * (tan(acos(PF_initial)) - tan(acos(PF_target)))',
    equation_latex: 'Q_c = P \\times (\\tan\\phi_1 - \\tan\\phi_2)',
    difficulty_level: 'advanced',
    tags: ['power', 'factor', 'correction', 'capacitor'],
    inputs: [
      { name: 'P', symbol: 'P', description: 'Active Power', unit: 'kW', default_value: 100, min_value: 0, input_order: 1 },
      { name: 'PF_initial', symbol: 'cos φ₁', description: 'Initial Power Factor', unit: '', default_value: 0.75, min_value: 0.1, max_value: 1, input_order: 2 },
      { name: 'PF_target', symbol: 'cos φ₂', description: 'Target Power Factor', unit: '', default_value: 0.95, min_value: 0.1, max_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'Qc', symbol: 'Q_c', description: 'Required Capacitor Rating', unit: 'kvar', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_pf_correction_capacitance',
    name: 'Power Factor Correction Capacitance',
    description: 'Calculate capacitance value for PF correction',
    domain: 'electrical',
    category_slug: 'power-factor',
    equation: 'C = (Qc * 1000) / (2 * PI * f * V^2)',
    equation_latex: 'C = \\frac{Q_c \\times 1000}{2\\pi f V^2}',
    difficulty_level: 'advanced',
    tags: ['power', 'factor', 'correction', 'capacitance'],
    inputs: [
      { name: 'Qc', symbol: 'Q_c', description: 'Capacitor Rating', unit: 'kvar', default_value: 50, min_value: 0, input_order: 1 },
      { name: 'f', symbol: 'f', description: 'Frequency', unit: 'Hz', default_value: 50, min_value: 1, input_order: 2 },
      { name: 'V', symbol: 'V', description: 'Voltage', unit: 'V', default_value: 400, min_value: 100, input_order: 3 }
    ],
    outputs: [
      { name: 'C', symbol: 'C', description: 'Capacitance', unit: 'μF', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_pf_capacitor_current',
    name: 'Capacitor Current',
    description: 'Calculate current drawn by capacitor',
    domain: 'electrical',
    category_slug: 'power-factor',
    equation: 'I_c = (Qc * 1000) / (sqrt(3) * V)',
    equation_latex: 'I_c = \\frac{Q_c \\times 1000}{\\sqrt{3} \\times V}',
    difficulty_level: 'intermediate',
    tags: ['power', 'factor', 'capacitor', 'current'],
    inputs: [
      { name: 'Qc', symbol: 'Q_c', description: 'Capacitor Rating', unit: 'kvar', default_value: 50, min_value: 0, input_order: 1 },
      { name: 'V', symbol: 'V', description: 'Line Voltage', unit: 'V', default_value: 400, min_value: 100, input_order: 2 }
    ],
    outputs: [
      { name: 'I_c', symbol: 'I_c', description: 'Capacitor Current', unit: 'A', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_pf_improvement_reduction',
    name: 'Current Reduction from PF Improvement',
    description: 'Calculate current reduction after PF correction',
    domain: 'electrical',
    category_slug: 'power-factor',
    equation: 'I_reduction = I_initial - I_improved',
    equation_latex: '\\Delta I = I_1 - I_2',
    difficulty_level: 'intermediate',
    tags: ['power', 'factor', 'current', 'reduction'],
    inputs: [
      { name: 'I_initial', symbol: 'I₁', description: 'Initial Current', unit: 'A', default_value: 200, min_value: 0, input_order: 1 },
      { name: 'I_improved', symbol: 'I₂', description: 'Current After Correction', unit: 'A', default_value: 160, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'I_reduction', symbol: 'ΔI', description: 'Current Reduction', unit: 'A', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_pf_reactive_power_needed',
    name: 'Reactive Power Needed',
    description: 'Calculate reactive power to achieve target PF',
    domain: 'electrical',
    category_slug: 'power-factor',
    equation: 'Q_needed = P * tan(acos(PF_target))',
    equation_latex: 'Q_{needed} = P \\times \\tan(\\phi_{target})',
    difficulty_level: 'intermediate',
    tags: ['power', 'factor', 'reactive'],
    inputs: [
      { name: 'P', symbol: 'P', description: 'Active Power', unit: 'kW', default_value: 100, min_value: 0, input_order: 1 },
      { name: 'PF_target', symbol: 'cos φ_target', description: 'Target Power Factor', unit: '', default_value: 0.95, min_value: 0.1, max_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'Q_needed', symbol: 'Q_needed', description: 'Reactive Power Needed', unit: 'kvar', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_pf_new_apparent_power',
    name: 'New Apparent Power After Correction',
    description: 'Calculate new apparent power after PF correction',
    domain: 'electrical',
    category_slug: 'power-factor',
    equation: 'S_new = P / PF_target',
    equation_latex: 'S_{new} = \\frac{P}{\\cos\\phi_{target}}',
    difficulty_level: 'intermediate',
    tags: ['power', 'factor', 'apparent'],
    inputs: [
      { name: 'P', symbol: 'P', description: 'Active Power', unit: 'kW', default_value: 100, min_value: 0, input_order: 1 },
      { name: 'PF_target', symbol: 'cos φ_target', description: 'Target Power Factor', unit: '', default_value: 0.95, min_value: 0.1, max_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'S_new', symbol: 'S_new', description: 'New Apparent Power', unit: 'kVA', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_pf_savings',
    name: 'Power Factor Correction Savings',
    description: 'Calculate savings from reduced losses',
    domain: 'electrical',
    category_slug: 'power-factor',
    equation: 'Savings = (P_loss_initial - P_loss_corrected) * hours * rate',
    equation_latex: 'Savings = (P_{loss1} - P_{loss2}) \\times t \\times rate',
    difficulty_level: 'intermediate',
    tags: ['power', 'factor', 'savings', 'losses'],
    inputs: [
      { name: 'P_loss_initial', symbol: 'P_loss1', description: 'Initial Losses', unit: 'kW', default_value: 10, min_value: 0, input_order: 1 },
      { name: 'P_loss_corrected', symbol: 'P_loss2', description: 'Losses After Correction', unit: 'kW', default_value: 6, min_value: 0, input_order: 2 },
      { name: 'hours', symbol: 't', description: 'Operating Hours per Year', unit: 'h', default_value: 4000, min_value: 0, input_order: 3 },
      { name: 'rate', symbol: 'rate', description: 'Electricity Rate', unit: '$/kWh', default_value: 0.12, min_value: 0, input_order: 4 }
    ],
    outputs: [
      { name: 'Savings', symbol: 'Savings', description: 'Annual Savings', unit: '$', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_pf_tan_phi',
    name: 'Reactive to Active Power Ratio',
    description: 'Calculate tan(phi) from power factor',
    domain: 'electrical',
    category_slug: 'power-factor',
    equation: 'tan_phi = tan(acos(PF))',
    equation_latex: '\\tan\\phi = \\tan(\\cos^{-1}(PF))',
    difficulty_level: 'intermediate',
    tags: ['power', 'factor', 'reactive', 'ratio'],
    inputs: [
      { name: 'PF', symbol: 'cos φ', description: 'Power Factor', unit: '', default_value: 0.8, min_value: 0.1, max_value: 1, input_order: 1 }
    ],
    outputs: [
      { name: 'tan_phi', symbol: 'tan φ', description: 'Reactive/Active Ratio', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_pf_capacitor_kvar_per_kw',
    name: 'kVAR per kW for PF Correction',
    description: 'Calculate required kVAR per kW of load',
    domain: 'electrical',
    category_slug: 'power-factor',
    equation: 'kvar_per_kw = tan(acos(PF_initial)) - tan(acos(PF_target))',
    equation_latex: '\\frac{kvar}{kW} = \\tan\\phi_1 - \\tan\\phi_2',
    difficulty_level: 'intermediate',
    tags: ['power', 'factor', 'correction', 'kvar'],
    inputs: [
      { name: 'PF_initial', symbol: 'cos φ₁', description: 'Initial Power Factor', unit: '', default_value: 0.7, min_value: 0.1, max_value: 1, input_order: 1 },
      { name: 'PF_target', symbol: 'cos φ₂', description: 'Target Power Factor', unit: '', default_value: 0.95, min_value: 0.1, max_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'kvar_per_kw', symbol: 'kvar/kW', description: 'kVAR per kW Required', unit: 'kvar/kW', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_pf_resonance_frequency',
    name: 'Resonance Frequency with Capacitor',
    description: 'Calculate resonance frequency when capacitor is added',
    domain: 'electrical',
    category_slug: 'power-factor',
    equation: 'f_r = 1 / (2 * PI * sqrt(L * C))',
    equation_latex: 'f_r = \\frac{1}{2\\pi\\sqrt{LC}}',
    difficulty_level: 'advanced',
    tags: ['power', 'factor', 'resonance', 'harmonic'],
    inputs: [
      { name: 'L', symbol: 'L', description: 'System Inductance', unit: 'H', default_value: 0.01, min_value: 0.0001, input_order: 1 },
      { name: 'C', symbol: 'C', description: 'Capacitance', unit: 'F', default_value: 0.0001, min_value: 0.000001, input_order: 2 }
    ],
    outputs: [
      { name: 'f_r', symbol: 'f_r', description: 'Resonance Frequency', unit: 'Hz', output_order: 1, precision: 1 }
    ]
  },

  // ============================================
  // SHORT CIRCUIT EQUATIONS (15 equations)
  // ============================================
  
  {
    equation_id: 'eq_scc_transformer_mva',
    name: 'Transformer Short Circuit MVA',
    description: 'Calculate short circuit MVA at transformer secondary',
    domain: 'electrical',
    category_slug: 'short-circuit',
    equation: 'SCC_MVA = (S_transformer * 100) / Z_percent',
    equation_latex: 'SCC_{MVA} = \\frac{S \\times 100}{Z\\%}',
    difficulty_level: 'intermediate',
    tags: ['short', 'circuit', 'transformer', 'mva'],
    inputs: [
      { name: 'S_transformer', symbol: 'S', description: 'Transformer Rating', unit: 'MVA', default_value: 1, min_value: 0.01, input_order: 1 },
      { name: 'Z_percent', symbol: 'Z%', description: 'Impedance Percentage', unit: '%', default_value: 5, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'SCC_MVA', symbol: 'SCC_MVA', description: 'Short Circuit MVA', unit: 'MVA', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_scc_transformer_current',
    name: 'Transformer Short Circuit Current',
    description: 'Calculate short circuit current from transformer',
    domain: 'electrical',
    category_slug: 'short-circuit',
    equation: 'Isc = (S_transformer * 1000000) / (sqrt(3) * V * (Z_percent/100))',
    equation_latex: 'I_{sc} = \\frac{S \\times 10^6}{\\sqrt{3} \\times V \\times Z\\%}',
    difficulty_level: 'advanced',
    tags: ['short', 'circuit', 'transformer', 'current'],
    inputs: [
      { name: 'S_transformer', symbol: 'S', description: 'Transformer Rating', unit: 'MVA', default_value: 1, min_value: 0.01, input_order: 1 },
      { name: 'V', symbol: 'V', description: 'Secondary Voltage', unit: 'V', default_value: 400, min_value: 100, input_order: 2 },
      { name: 'Z_percent', symbol: 'Z%', description: 'Impedance Percentage', unit: '%', default_value: 5, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'Isc', symbol: 'I_sc', description: 'Short Circuit Current', unit: 'A', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_scc_per_unit',
    name: 'Short Circuit Current (Per Unit)',
    description: 'Calculate short circuit current in per unit',
    domain: 'electrical',
    category_slug: 'short-circuit',
    equation: 'Isc_pu = 1 / Z_pu',
    equation_latex: 'I_{sc(pu)} = \\frac{1}{Z_{pu}}',
    difficulty_level: 'intermediate',
    tags: ['short', 'circuit', 'per-unit'],
    inputs: [
      { name: 'Z_pu', symbol: 'Z_pu', description: 'Per Unit Impedance', unit: 'pu', default_value: 0.05, min_value: 0.01, input_order: 1 }
    ],
    outputs: [
      { name: 'Isc_pu', symbol: 'I_sc(pu)', description: 'Short Circuit Current (pu)', unit: 'pu', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_scc_peak_current',
    name: 'Peak Short Circuit Current',
    description: 'Calculate peak (asymmetrical) short circuit current',
    domain: 'electrical',
    category_slug: 'short-circuit',
    equation: 'Ipeak = Isc * kappa * sqrt(2)',
    equation_latex: 'I_{peak} = I_{sc} \\times \\kappa \\times \\sqrt{2}',
    difficulty_level: 'advanced',
    tags: ['short', 'circuit', 'peak', 'asymmetrical'],
    inputs: [
      { name: 'Isc', symbol: 'I_sc', description: 'Symmetrical Short Circuit Current', unit: 'A', default_value: 25000, min_value: 100, input_order: 1 },
      { name: 'kappa', symbol: 'κ', description: 'Peak Factor', unit: '', default_value: 1.8, min_value: 1, max_value: 2, input_order: 2 }
    ],
    outputs: [
      { name: 'Ipeak', symbol: 'I_peak', description: 'Peak Short Circuit Current', unit: 'A', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_scc_breaking_current',
    name: 'Breaking Current',
    description: 'Calculate breaking current at contact separation',
    domain: 'electrical',
    category_slug: 'short-circuit',
    equation: 'Ib = Isc * DC_decay',
    equation_latex: 'I_b = I_{sc} \\times DC_{decay}',
    difficulty_level: 'advanced',
    tags: ['short', 'circuit', 'breaking', 'dc'],
    inputs: [
      { name: 'Isc', symbol: 'I_sc', description: 'Initial Short Circuit Current', unit: 'A', default_value: 25000, min_value: 100, input_order: 1 },
      { name: 'DC_decay', symbol: 'DC_decay', description: 'DC Component Decay Factor', unit: '', default_value: 0.9, min_value: 0.5, max_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'Ib', symbol: 'I_b', description: 'Breaking Current', unit: 'A', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_scc_xr_ratio',
    name: 'X/R Ratio',
    description: 'Calculate X/R ratio for fault analysis',
    domain: 'electrical',
    category_slug: 'short-circuit',
    equation: 'XR_ratio = X / R',
    equation_latex: '\\frac{X}{R} = \\frac{X}{R}',
    difficulty_level: 'intermediate',
    tags: ['short', 'circuit', 'x-r-ratio'],
    inputs: [
      { name: 'X', symbol: 'X', description: 'Reactance', unit: 'Ω', default_value: 0.5, min_value: 0.001, input_order: 1 },
      { name: 'R', symbol: 'R', description: 'Resistance', unit: 'Ω', default_value: 0.1, min_value: 0.001, input_order: 2 }
    ],
    outputs: [
      { name: 'XR_ratio', symbol: 'X/R', description: 'X/R Ratio', unit: '', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_scc_source_impedance',
    name: 'Source Impedance',
    description: 'Calculate source impedance from short circuit MVA',
    domain: 'electrical',
    category_slug: 'short-circuit',
    equation: 'Z_source = V^2 / SCC_MVA',
    equation_latex: 'Z_{source} = \\frac{V^2}{SCC_{MVA}}',
    difficulty_level: 'advanced',
    tags: ['short', 'circuit', 'source', 'impedance'],
    inputs: [
      { name: 'V', symbol: 'V', description: 'System Voltage', unit: 'kV', default_value: 11, min_value: 0.1, input_order: 1 },
      { name: 'SCC_MVA', symbol: 'SCC_MVA', description: 'Short Circuit MVA', unit: 'MVA', default_value: 500, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'Z_source', symbol: 'Z_source', description: 'Source Impedance', unit: 'Ω', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_scc_cable_contribution',
    name: 'Cable Contribution to Fault',
    description: 'Calculate cable contribution to short circuit current',
    domain: 'electrical',
    category_slug: 'short-circuit',
    equation: 'Isc_cable = V / (sqrt(3) * Z_cable)',
    equation_latex: 'I_{sc(cable)} = \\frac{V}{\\sqrt{3} \\times Z_{cable}}',
    difficulty_level: 'advanced',
    tags: ['short', 'circuit', 'cable', 'contribution'],
    inputs: [
      { name: 'V', symbol: 'V', description: 'System Voltage', unit: 'V', default_value: 400, min_value: 100, input_order: 1 },
      { name: 'Z_cable', symbol: 'Z_cable', description: 'Cable Impedance', unit: 'Ω', default_value: 0.05, min_value: 0.001, input_order: 2 }
    ],
    outputs: [
      { name: 'Isc_cable', symbol: 'I_sc(cable)', description: 'Cable Fault Contribution', unit: 'A', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_scc_motor_contribution',
    name: 'Motor Contribution to Fault',
    description: 'Calculate motor contribution to short circuit current',
    domain: 'electrical',
    category_slug: 'short-circuit',
    equation: 'Isc_motor = K * I_flc',
    equation_latex: 'I_{sc(motor)} = K \\times I_{flc}',
    difficulty_level: 'advanced',
    tags: ['short', 'circuit', 'motor', 'contribution'],
    inputs: [
      { name: 'K', symbol: 'K', description: 'Motor Contribution Factor', unit: '', default_value: 5, min_value: 3, max_value: 8, input_order: 1 },
      { name: 'I_flc', symbol: 'I_flc', description: 'Full Load Current', unit: 'A', default_value: 100, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'Isc_motor', symbol: 'I_sc(motor)', description: 'Motor Fault Contribution', unit: 'A', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_scc_total_current',
    name: 'Total Short Circuit Current',
    description: 'Calculate total short circuit current from all sources',
    domain: 'electrical',
    category_slug: 'short-circuit',
    equation: 'Isc_total = Isc_source + Isc_motor + Isc_gen',
    equation_latex: 'I_{sc(total)} = I_{sc(source)} + I_{sc(motor)} + I_{sc(gen)}',
    difficulty_level: 'advanced',
    tags: ['short', 'circuit', 'total', 'sources'],
    inputs: [
      { name: 'Isc_source', symbol: 'I_sc(source)', description: 'Source Contribution', unit: 'A', default_value: 20000, min_value: 0, input_order: 1 },
      { name: 'Isc_motor', symbol: 'I_sc(motor)', description: 'Motor Contribution', unit: 'A', default_value: 5000, min_value: 0, input_order: 2 },
      { name: 'Isc_gen', symbol: 'I_sc(gen)', description: 'Generator Contribution', unit: 'A', default_value: 3000, min_value: 0, input_order: 3 }
    ],
    outputs: [
      { name: 'Isc_total', symbol: 'I_sc(total)', description: 'Total Short Circuit Current', unit: 'A', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_scc_impedance_per_unit',
    name: 'Impedance in Per Unit',
    description: 'Convert impedance to per unit value',
    domain: 'electrical',
    category_slug: 'short-circuit',
    equation: 'Z_pu = (Z_actual * S_base) / V^2',
    equation_latex: 'Z_{pu} = \\frac{Z_{actual} \\times S_{base}}{V^2}',
    difficulty_level: 'intermediate',
    tags: ['short', 'circuit', 'per-unit', 'impedance'],
    inputs: [
      { name: 'Z_actual', symbol: 'Z', description: 'Actual Impedance', unit: 'Ω', default_value: 0.5, min_value: 0.001, input_order: 1 },
      { name: 'S_base', symbol: 'S_base', description: 'Base MVA', unit: 'MVA', default_value: 100, min_value: 1, input_order: 2 },
      { name: 'V', symbol: 'V', description: 'Base Voltage', unit: 'kV', default_value: 11, min_value: 0.1, input_order: 3 }
    ],
    outputs: [
      { name: 'Z_pu', symbol: 'Z_pu', description: 'Per Unit Impedance', unit: 'pu', output_order: 1, precision: 5 }
    ]
  },
  {
    equation_id: 'eq_scc_fault_level',
    name: 'Fault Level at Point',
    description: 'Calculate fault level at a specific point',
    domain: 'electrical',
    category_slug: 'short-circuit',
    equation: 'FL = sqrt(3) * V * Isc / 1000000',
    equation_latex: 'FL = \\frac{\\sqrt{3} \\times V \\times I_{sc}}{10^6}',
    difficulty_level: 'intermediate',
    tags: ['short', 'circuit', 'fault', 'level'],
    inputs: [
      { name: 'V', symbol: 'V', description: 'System Voltage', unit: 'V', default_value: 400, min_value: 100, input_order: 1 },
      { name: 'Isc', symbol: 'I_sc', description: 'Short Circuit Current', unit: 'A', default_value: 25000, min_value: 100, input_order: 2 }
    ],
    outputs: [
      { name: 'FL', symbol: 'FL', description: 'Fault Level', unit: 'MVA', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_scc_earth_fault',
    name: 'Earth Fault Current',
    description: 'Calculate single line to ground fault current',
    domain: 'electrical',
    category_slug: 'short-circuit',
    equation: 'If_earth = (3 * V) / (Z1 + Z2 + Z0 + 3 * Zn)',
    equation_latex: 'I_f = \\frac{3V}{Z_1 + Z_2 + Z_0 + 3Z_n}',
    difficulty_level: 'advanced',
    tags: ['short', 'circuit', 'earth', 'fault'],
    inputs: [
      { name: 'V', symbol: 'V', description: 'Phase Voltage', unit: 'V', default_value: 230, min_value: 100, input_order: 1 },
      { name: 'Z1', symbol: 'Z₁', description: 'Positive Sequence Impedance', unit: 'Ω', default_value: 0.1, min_value: 0.001, input_order: 2 },
      { name: 'Z2', symbol: 'Z₂', description: 'Negative Sequence Impedance', unit: 'Ω', default_value: 0.1, min_value: 0.001, input_order: 3 },
      { name: 'Z0', symbol: 'Z₀', description: 'Zero Sequence Impedance', unit: 'Ω', default_value: 0.2, min_value: 0.001, input_order: 4 },
      { name: 'Zn', symbol: 'Z_n', description: 'Neutral Impedance', unit: 'Ω', default_value: 0.05, min_value: 0, input_order: 5 }
    ],
    outputs: [
      { name: 'If_earth', symbol: 'I_f', description: 'Earth Fault Current', unit: 'A', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_scc_breaking_capacity',
    name: 'Required Breaking Capacity',
    description: 'Calculate required breaker breaking capacity',
    domain: 'electrical',
    category_slug: 'short-circuit',
    equation: 'BC = sqrt(3) * V * Isc / 1000',
    equation_latex: 'BC = \\frac{\\sqrt{3} \\times V \\times I_{sc}}{1000}',
    difficulty_level: 'intermediate',
    tags: ['short', 'circuit', 'breaker', 'capacity'],
    inputs: [
      { name: 'V', symbol: 'V', description: 'Rated Voltage', unit: 'V', default_value: 400, min_value: 100, input_order: 1 },
      { name: 'Isc', symbol: 'I_sc', description: 'Short Circuit Current', unit: 'A', default_value: 25000, min_value: 100, input_order: 2 }
    ],
    outputs: [
      { name: 'BC', symbol: 'BC', description: 'Breaking Capacity', unit: 'kA', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_scc_make_capacity',
    name: 'Required Making Capacity',
    description: 'Calculate required breaker making capacity',
    domain: 'electrical',
    category_slug: 'short-circuit',
    equation: 'MC = BC * 2.55',
    equation_latex: 'MC = BC \\times 2.55',
    difficulty_level: 'intermediate',
    tags: ['short', 'circuit', 'breaker', 'making'],
    inputs: [
      { name: 'BC', symbol: 'BC', description: 'Breaking Capacity', unit: 'kA', default_value: 25, min_value: 1, input_order: 1 }
    ],
    outputs: [
      { name: 'MC', symbol: 'MC', description: 'Making Capacity', unit: 'kA', output_order: 1, precision: 2 }
    ]
  },

  // ============================================
  // TRANSFORMER EQUATIONS (23 equations)
  // ============================================
  
  {
    equation_id: 'eq_transformer_turns_ratio',
    name: 'Transformer Turns Ratio',
    description: 'Calculate transformer turns ratio from voltages',
    domain: 'electrical',
    category_slug: 'transformer',
    equation: 'a = V_primary / V_secondary',
    equation_latex: 'a = \\frac{V_1}{V_2}',
    difficulty_level: 'beginner',
    tags: ['transformer', 'turns', 'ratio'],
    inputs: [
      { name: 'V_primary', symbol: 'V₁', description: 'Primary Voltage', unit: 'V', default_value: 11000, min_value: 100, input_order: 1 },
      { name: 'V_secondary', symbol: 'V₂', description: 'Secondary Voltage', unit: 'V', default_value: 400, min_value: 100, input_order: 2 }
    ],
    outputs: [
      { name: 'a', symbol: 'a', description: 'Turns Ratio', unit: '', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_transformer_current_ratio',
    name: 'Transformer Current Ratio',
    description: 'Calculate current ratio from turns ratio',
    domain: 'electrical',
    category_slug: 'transformer',
    equation: 'I_secondary = I_primary * a',
    equation_latex: 'I_2 = I_1 \\times a',
    difficulty_level: 'beginner',
    tags: ['transformer', 'current', 'ratio'],
    inputs: [
      { name: 'I_primary', symbol: 'I₁', description: 'Primary Current', unit: 'A', default_value: 50, min_value: 0.1, input_order: 1 },
      { name: 'a', symbol: 'a', description: 'Turns Ratio', unit: '', default_value: 27.5, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'I_secondary', symbol: 'I₂', description: 'Secondary Current', unit: 'A', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_transformer_full_load_current',
    name: 'Transformer Full Load Current',
    description: 'Calculate full load current from transformer rating',
    domain: 'electrical',
    category_slug: 'transformer',
    equation: 'I_fl = (S * 1000) / (sqrt(3) * V)',
    equation_latex: 'I_{fl} = \\frac{S \\times 1000}{\\sqrt{3} \\times V}',
    difficulty_level: 'intermediate',
    tags: ['transformer', 'current', 'full-load'],
    inputs: [
      { name: 'S', symbol: 'S', description: 'Transformer Rating', unit: 'kVA', default_value: 1000, min_value: 1, input_order: 1 },
      { name: 'V', symbol: 'V', description: 'Line Voltage', unit: 'V', default_value: 400, min_value: 100, input_order: 2 }
    ],
    outputs: [
      { name: 'I_fl', symbol: 'I_fl', description: 'Full Load Current', unit: 'A', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_transformer_efficiency',
    name: 'Transformer Efficiency',
    description: 'Calculate transformer efficiency',
    domain: 'electrical',
    category_slug: 'transformer',
    equation: 'eta = (P_out / (P_out + P_cu + P_fe)) * 100',
    equation_latex: '\\eta = \\frac{P_{out}}{P_{out} + P_{cu} + P_{fe}} \\times 100',
    difficulty_level: 'intermediate',
    tags: ['transformer', 'efficiency', 'losses'],
    inputs: [
      { name: 'P_out', symbol: 'P_out', description: 'Output Power', unit: 'W', default_value: 95000, min_value: 0, input_order: 1 },
      { name: 'P_cu', symbol: 'P_cu', description: 'Copper Losses', unit: 'W', default_value: 2000, min_value: 0, input_order: 2 },
      { name: 'P_fe', symbol: 'P_fe', description: 'Core/Iron Losses', unit: 'W', default_value: 1000, min_value: 0, input_order: 3 }
    ],
    outputs: [
      { name: 'eta', symbol: 'η', description: 'Efficiency', unit: '%', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_transformer_all_day_efficiency',
    name: 'Transformer All-Day Efficiency',
    description: 'Calculate all-day efficiency of transformer',
    domain: 'electrical',
    category_slug: 'transformer',
    equation: 'eta_all_day = (E_out / (E_out + E_losses)) * 100',
    equation_latex: '\\eta_{all-day} = \\frac{E_{out}}{E_{out} + E_{losses}} \\times 100',
    difficulty_level: 'advanced',
    tags: ['transformer', 'efficiency', 'all-day'],
    inputs: [
      { name: 'E_out', symbol: 'E_out', description: 'Energy Output per Day', unit: 'kWh', default_value: 2000, min_value: 0, input_order: 1 },
      { name: 'E_losses', symbol: 'E_losses', description: 'Energy Losses per Day', unit: 'kWh', default_value: 50, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'eta_all_day', symbol: 'η_all-day', description: 'All-Day Efficiency', unit: '%', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_transformer_copper_loss',
    name: 'Transformer Copper Loss',
    description: 'Calculate copper loss at given load',
    domain: 'electrical',
    category_slug: 'transformer',
    equation: 'P_cu = P_cu_full * (load_ratio)^2',
    equation_latex: 'P_{cu} = P_{cu(full)} \\times \\left(\\frac{load}{full}\\right)^2',
    difficulty_level: 'intermediate',
    tags: ['transformer', 'copper', 'loss'],
    inputs: [
      { name: 'P_cu_full', symbol: 'P_cu(full)', description: 'Full Load Copper Loss', unit: 'W', default_value: 5000, min_value: 0, input_order: 1 },
      { name: 'load_ratio', symbol: 'load%', description: 'Load Ratio', unit: '', default_value: 0.8, min_value: 0, max_value: 2, input_order: 2 }
    ],
    outputs: [
      { name: 'P_cu', symbol: 'P_cu', description: 'Copper Loss at Load', unit: 'W', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_transformer_regulation',
    name: 'Transformer Voltage Regulation',
    description: 'Calculate voltage regulation of transformer',
    domain: 'electrical',
    category_slug: 'transformer',
    equation: 'VR = ((V_no_load - V_full_load) / V_no_load) * 100',
    equation_latex: 'VR = \\frac{V_{nl} - V_{fl}}{V_{nl}} \\times 100',
    difficulty_level: 'intermediate',
    tags: ['transformer', 'regulation', 'voltage'],
    inputs: [
      { name: 'V_no_load', symbol: 'V_nl', description: 'No-Load Voltage', unit: 'V', default_value: 420, min_value: 100, input_order: 1 },
      { name: 'V_full_load', symbol: 'V_fl', description: 'Full-Load Voltage', unit: 'V', default_value: 400, min_value: 100, input_order: 2 }
    ],
    outputs: [
      { name: 'VR', symbol: 'VR', description: 'Voltage Regulation', unit: '%', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_transformer_impedance_voltage',
    name: 'Transformer Impedance Voltage',
    description: 'Calculate impedance voltage from test data',
    domain: 'electrical',
    category_slug: 'transformer',
    equation: 'Z_percent = (V_sc / V_rated) * 100',
    equation_latex: 'Z\\% = \\frac{V_{sc}}{V_{rated}} \\times 100',
    difficulty_level: 'intermediate',
    tags: ['transformer', 'impedance', 'voltage'],
    inputs: [
      { name: 'V_sc', symbol: 'V_sc', description: 'Short Circuit Test Voltage', unit: 'V', default_value: 550, min_value: 1, input_order: 1 },
      { name: 'V_rated', symbol: 'V_rated', description: 'Rated Voltage', unit: 'V', default_value: 11000, min_value: 100, input_order: 2 }
    ],
    outputs: [
      { name: 'Z_percent', symbol: 'Z%', description: 'Impedance Percentage', unit: '%', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_transformer_sizing',
    name: 'Transformer Sizing',
    description: 'Calculate required transformer capacity',
    domain: 'electrical',
    category_slug: 'transformer',
    equation: 'S_transformer = P_total / (PF * diversity)',
    equation_latex: 'S = \\frac{P_{total}}{PF \\times diversity}',
    difficulty_level: 'intermediate',
    tags: ['transformer', 'sizing', 'capacity'],
    inputs: [
      { name: 'P_total', symbol: 'P_total', description: 'Total Connected Load', unit: 'kW', default_value: 500, min_value: 1, input_order: 1 },
      { name: 'PF', symbol: 'PF', description: 'Power Factor', unit: '', default_value: 0.85, min_value: 0.1, max_value: 1, input_order: 2 },
      { name: 'diversity', symbol: 'diversity', description: 'Diversity Factor', unit: '', default_value: 0.7, min_value: 0.1, max_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'S_transformer', symbol: 'S', description: 'Transformer Rating', unit: 'kVA', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_transformer_loading',
    name: 'Transformer Loading Percentage',
    description: 'Calculate transformer loading percentage',
    domain: 'electrical',
    category_slug: 'transformer',
    equation: 'loading = (S_load / S_rated) * 100',
    equation_latex: 'loading = \\frac{S_{load}}{S_{rated}} \\times 100',
    difficulty_level: 'beginner',
    tags: ['transformer', 'loading', 'percentage'],
    inputs: [
      { name: 'S_load', symbol: 'S_load', description: 'Load kVA', unit: 'kVA', default_value: 800, min_value: 0, input_order: 1 },
      { name: 'S_rated', symbol: 'S_rated', description: 'Rated kVA', unit: 'kVA', default_value: 1000, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'loading', symbol: 'loading', description: 'Loading Percentage', unit: '%', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_transformer_parallel_operation',
    name: 'Parallel Transformer Load Sharing',
    description: 'Calculate load sharing between parallel transformers',
    domain: 'electrical',
    category_slug: 'transformer',
    equation: 'S1 = S_total * (S1_rated / Z1) / ((S1_rated / Z1) + (S2_rated / Z2))',
    equation_latex: 'S_1 = S_{total} \\times \\frac{S_1/Z_1}{S_1/Z_1 + S_2/Z_2}',
    difficulty_level: 'advanced',
    tags: ['transformer', 'parallel', 'load-sharing'],
    inputs: [
      { name: 'S_total', symbol: 'S_total', description: 'Total Load', unit: 'kVA', default_value: 1500, min_value: 0, input_order: 1 },
      { name: 'S1_rated', symbol: 'S₁', description: 'Transformer 1 Rating', unit: 'kVA', default_value: 1000, min_value: 1, input_order: 2 },
      { name: 'Z1', symbol: 'Z₁', description: 'Transformer 1 Impedance', unit: '%', default_value: 5, min_value: 1, input_order: 3 },
      { name: 'S2_rated', symbol: 'S₂', description: 'Transformer 2 Rating', unit: 'kVA', default_value: 750, min_value: 1, input_order: 4 },
      { name: 'Z2', symbol: 'Z₂', description: 'Transformer 2 Impedance', unit: '%', default_value: 5, min_value: 1, input_order: 5 }
    ],
    outputs: [
      { name: 'S1', symbol: 'S₁', description: 'Load on Transformer 1', unit: 'kVA', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_transformer_max_efficiency_load',
    name: 'Load for Maximum Efficiency',
    description: 'Calculate load at which transformer has maximum efficiency',
    domain: 'electrical',
    category_slug: 'transformer',
    equation: 'load_max_eff = sqrt(P_fe / P_cu_full)',
    equation_latex: 'load_{max\\eta} = \\sqrt{\\frac{P_{fe}}{P_{cu(full)}}}',
    difficulty_level: 'advanced',
    tags: ['transformer', 'efficiency', 'maximum'],
    inputs: [
      { name: 'P_fe', symbol: 'P_fe', description: 'Core/Iron Losses', unit: 'W', default_value: 1000, min_value: 0, input_order: 1 },
      { name: 'P_cu_full', symbol: 'P_cu(full)', description: 'Full Load Copper Loss', unit: 'W', default_value: 4000, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'load_max_eff', symbol: 'load_maxη', description: 'Load for Max Efficiency (pu)', unit: 'pu', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_transformer_overload_capacity',
    name: 'Transformer Overload Capacity',
    description: 'Calculate allowable overload based on temperature',
    domain: 'electrical',
    category_slug: 'transformer',
    equation: 'S_overload = S_rated * (1 + (T_max - T_rated) / 100)',
    equation_latex: 'S_{overload} = S_{rated} \\times \\left(1 + \\frac{T_{max} - T_{rated}}{100}\\right)',
    difficulty_level: 'advanced',
    tags: ['transformer', 'overload', 'temperature'],
    inputs: [
      { name: 'S_rated', symbol: 'S_rated', description: 'Rated Capacity', unit: 'kVA', default_value: 1000, min_value: 1, input_order: 1 },
      { name: 'T_max', symbol: 'T_max', description: 'Maximum Temperature', unit: '°C', default_value: 105, min_value: 65, input_order: 2 },
      { name: 'T_rated', symbol: 'T_rated', description: 'Rated Temperature Rise', unit: '°C', default_value: 65, min_value: 55, input_order: 3 }
    ],
    outputs: [
      { name: 'S_overload', symbol: 'S_overload', description: 'Overload Capacity', unit: 'kVA', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_transformer_inrush_current',
    name: 'Transformer Inrush Current',
    description: 'Estimate transformer inrush current',
    domain: 'electrical',
    category_slug: 'transformer',
    equation: 'I_inrush = K * I_fl',
    equation_latex: 'I_{inrush} = K \\times I_{fl}',
    difficulty_level: 'intermediate',
    tags: ['transformer', 'inrush', 'current'],
    inputs: [
      { name: 'K', symbol: 'K', description: 'Inrush Factor', unit: '', default_value: 12, min_value: 5, max_value: 25, input_order: 1 },
      { name: 'I_fl', symbol: 'I_fl', description: 'Full Load Current', unit: 'A', default_value: 100, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'I_inrush', symbol: 'I_inrush', description: 'Inrush Current', unit: 'A', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_transformer_equivalent_resistance',
    name: 'Transformer Equivalent Resistance',
    description: 'Calculate equivalent resistance referred to primary',
    domain: 'electrical',
    category_slug: 'transformer',
    equation: 'R_eq = R_primary + R_secondary * a^2',
    equation_latex: 'R_{eq} = R_1 + R_2 \\times a^2',
    difficulty_level: 'advanced',
    tags: ['transformer', 'resistance', 'equivalent'],
    inputs: [
      { name: 'R_primary', symbol: 'R₁', description: 'Primary Resistance', unit: 'Ω', default_value: 2, min_value: 0.001, input_order: 1 },
      { name: 'R_secondary', symbol: 'R₂', description: 'Secondary Resistance', unit: 'Ω', default_value: 0.002, min_value: 0.0001, input_order: 2 },
      { name: 'a', symbol: 'a', description: 'Turns Ratio', unit: '', default_value: 27.5, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'R_eq', symbol: 'R_eq', description: 'Equivalent Resistance', unit: 'Ω', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_transformer_equivalent_reactance',
    name: 'Transformer Equivalent Reactance',
    description: 'Calculate equivalent reactance referred to primary',
    domain: 'electrical',
    category_slug: 'transformer',
    equation: 'X_eq = X_primary + X_secondary * a^2',
    equation_latex: 'X_{eq} = X_1 + X_2 \\times a^2',
    difficulty_level: 'advanced',
    tags: ['transformer', 'reactance', 'equivalent'],
    inputs: [
      { name: 'X_primary', symbol: 'X₁', description: 'Primary Reactance', unit: 'Ω', default_value: 5, min_value: 0.001, input_order: 1 },
      { name: 'X_secondary', symbol: 'X₂', description: 'Secondary Reactance', unit: 'Ω', default_value: 0.005, min_value: 0.0001, input_order: 2 },
      { name: 'a', symbol: 'a', description: 'Turns Ratio', unit: '', default_value: 27.5, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'X_eq', symbol: 'X_eq', description: 'Equivalent Reactance', unit: 'Ω', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_transformer_equivalent_impedance',
    name: 'Transformer Equivalent Impedance',
    description: 'Calculate equivalent impedance from R and X',
    domain: 'electrical',
    category_slug: 'transformer',
    equation: 'Z_eq = sqrt(R_eq^2 + X_eq^2)',
    equation_latex: 'Z_{eq} = \\sqrt{R_{eq}^2 + X_{eq}^2}',
    difficulty_level: 'intermediate',
    tags: ['transformer', 'impedance', 'equivalent'],
    inputs: [
      { name: 'R_eq', symbol: 'R_eq', description: 'Equivalent Resistance', unit: 'Ω', default_value: 3.5, min_value: 0.001, input_order: 1 },
      { name: 'X_eq', symbol: 'X_eq', description: 'Equivalent Reactance', unit: 'Ω', default_value: 8.8, min_value: 0.001, input_order: 2 }
    ],
    outputs: [
      { name: 'Z_eq', symbol: 'Z_eq', description: 'Equivalent Impedance', unit: 'Ω', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_transformer_no_load_current',
    name: 'Transformer No-Load Current',
    description: 'Calculate no-load current components',
    domain: 'electrical',
    category_slug: 'transformer',
    equation: 'I0 = sqrt(I_m^2 + I_w^2)',
    equation_latex: 'I_0 = \\sqrt{I_m^2 + I_w^2}',
    difficulty_level: 'intermediate',
    tags: ['transformer', 'no-load', 'current'],
    inputs: [
      { name: 'I_m', symbol: 'I_m', description: 'Magnetizing Current', unit: 'A', default_value: 2, min_value: 0, input_order: 1 },
      { name: 'I_w', symbol: 'I_w', description: 'Core Loss Current', unit: 'A', default_value: 0.5, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'I0', symbol: 'I₀', description: 'No-Load Current', unit: 'A', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_transformer_power_factor_noload',
    name: 'No-Load Power Factor',
    description: 'Calculate power factor at no-load',
    domain: 'electrical',
    category_slug: 'transformer',
    equation: 'PF_noload = I_w / I0',
    equation_latex: '\\cos\\phi_0 = \\frac{I_w}{I_0}',
    difficulty_level: 'intermediate',
    tags: ['transformer', 'power-factor', 'no-load'],
    inputs: [
      { name: 'I_w', symbol: 'I_w', description: 'Core Loss Current', unit: 'A', default_value: 0.5, min_value: 0, input_order: 1 },
      { name: 'I0', symbol: 'I₀', description: 'No-Load Current', unit: 'A', default_value: 2.06, min_value: 0.001, input_order: 2 }
    ],
    outputs: [
      { name: 'PF_noload', symbol: 'cos φ₀', description: 'No-Load Power Factor', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_transformer_kva_rating',
    name: 'Transformer kVA from Dimensions',
    description: 'Estimate transformer kVA from core dimensions',
    domain: 'electrical',
    category_slug: 'transformer',
    equation: 'S = K * A_core * B_max * f * J * A_winding',
    equation_latex: 'S = K \\times A_c \\times B_{max} \\times f \\times J \\times A_w',
    difficulty_level: 'advanced',
    tags: ['transformer', 'sizing', 'design'],
    inputs: [
      { name: 'K', symbol: 'K', description: 'Design Constant', unit: '', default_value: 0.9, min_value: 0.5, input_order: 1 },
      { name: 'A_core', symbol: 'A_c', description: 'Core Cross-Section', unit: 'cm²', default_value: 200, min_value: 10, input_order: 2 },
      { name: 'B_max', symbol: 'B_max', description: 'Maximum Flux Density', unit: 'T', default_value: 1.5, min_value: 0.5, input_order: 3 },
      { name: 'f', symbol: 'f', description: 'Frequency', unit: 'Hz', default_value: 50, min_value: 1, input_order: 4 },
      { name: 'J', symbol: 'J', description: 'Current Density', unit: 'A/mm²', default_value: 2.5, min_value: 0.5, input_order: 5 },
      { name: 'A_winding', symbol: 'A_w', description: 'Window Area', unit: 'cm²', default_value: 400, min_value: 10, input_order: 6 }
    ],
    outputs: [
      { name: 'S', symbol: 'S', description: 'Transformer Rating', unit: 'kVA', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_transformer_flux_density',
    name: 'Transformer Flux Density',
    description: 'Calculate flux density in transformer core',
    domain: 'electrical',
    category_slug: 'transformer',
    equation: 'B = V / (4.44 * f * N * A_core)',
    equation_latex: 'B = \\frac{V}{4.44 \\times f \\times N \\times A_c}',
    difficulty_level: 'advanced',
    tags: ['transformer', 'flux', 'density'],
    inputs: [
      { name: 'V', symbol: 'V', description: 'Voltage', unit: 'V', default_value: 400, min_value: 100, input_order: 1 },
      { name: 'f', symbol: 'f', description: 'Frequency', unit: 'Hz', default_value: 50, min_value: 1, input_order: 2 },
      { name: 'N', symbol: 'N', description: 'Number of Turns', unit: '', default_value: 100, min_value: 1, input_order: 3 },
      { name: 'A_core', symbol: 'A_c', description: 'Core Area', unit: 'm²', default_value: 0.02, min_value: 0.001, input_order: 4 }
    ],
    outputs: [
      { name: 'B', symbol: 'B', description: 'Flux Density', unit: 'T', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_transformer_loss_ratio',
    name: 'Transformer Loss Ratio',
    description: 'Calculate ratio of copper to iron losses',
    domain: 'electrical',
    category_slug: 'transformer',
    equation: 'loss_ratio = P_cu_full / P_fe',
    equation_latex: 'ratio = \\frac{P_{cu(full)}}{P_{fe}}',
    difficulty_level: 'intermediate',
    tags: ['transformer', 'losses', 'ratio'],
    inputs: [
      { name: 'P_cu_full', symbol: 'P_cu(full)', description: 'Full Load Copper Loss', unit: 'W', default_value: 4000, min_value: 0, input_order: 1 },
      { name: 'P_fe', symbol: 'P_fe', description: 'Core/Iron Loss', unit: 'W', default_value: 1000, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'loss_ratio', symbol: 'ratio', description: 'Loss Ratio', unit: '', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_transformer_total_loss',
    name: 'Transformer Total Losses',
    description: 'Calculate total losses at given load',
    domain: 'electrical',
    category_slug: 'transformer',
    equation: 'P_total = P_fe + P_cu_full * load_ratio^2',
    equation_latex: 'P_{total} = P_{fe} + P_{cu(full)} \\times load^2',
    difficulty_level: 'intermediate',
    tags: ['transformer', 'losses', 'total'],
    inputs: [
      { name: 'P_fe', symbol: 'P_fe', description: 'Core/Iron Loss', unit: 'W', default_value: 1000, min_value: 0, input_order: 1 },
      { name: 'P_cu_full', symbol: 'P_cu(full)', description: 'Full Load Copper Loss', unit: 'W', default_value: 4000, min_value: 0, input_order: 2 },
      { name: 'load_ratio', symbol: 'load', description: 'Load Ratio', unit: 'pu', default_value: 0.8, min_value: 0, max_value: 2, input_order: 3 }
    ],
    outputs: [
      { name: 'P_total', symbol: 'P_total', description: 'Total Losses', unit: 'W', output_order: 1, precision: 1 }
    ]
  }
];

export default electricalBatch2;
