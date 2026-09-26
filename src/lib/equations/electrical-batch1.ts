/**
 * Electrical Engineering Equations - Batch 1
 * Cable Sizing, Voltage Drop, Power Calculations
 * Total: 50 equations
 */

export const electricalBatch1 = [
  // ============================================
  // CABLE SIZING EQUATIONS (15 equations)
  // ============================================
  
  {
    equation_id: 'eq_cable_ampacity_basic',
    name: 'Cable Ampacity (Basic)',
    description: 'Calculate the current carrying capacity of a cable with derating factors',
    domain: 'electrical',
    category_slug: 'cable-sizing',
    equation: 'I = I_base * k_temp * k_group * k_install',
    equation_latex: 'I = I_{base} \\times k_{temp} \\times k_{group} \\times k_{install}',
    difficulty_level: 'intermediate',
    tags: ['cable', 'ampacity', 'current', 'derating'],
    inputs: [
      { name: 'I_base', symbol: 'I_base', description: 'Base Current Rating', unit: 'A', default_value: 100, min_value: 1, input_order: 1 },
      { name: 'k_temp', symbol: 'k_temp', description: 'Temperature Correction Factor', unit: '', default_value: 0.9, min_value: 0.1, max_value: 1.5, input_order: 2 },
      { name: 'k_group', symbol: 'k_group', description: 'Grouping Factor', unit: '', default_value: 0.8, min_value: 0.1, max_value: 1, input_order: 3 },
      { name: 'k_install', symbol: 'k_install', description: 'Installation Method Factor', unit: '', default_value: 0.9, min_value: 0.1, max_value: 1, input_order: 4 }
    ],
    outputs: [
      { name: 'I', symbol: 'I', description: 'Derated Current Capacity', unit: 'A', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_cable_cross_section',
    name: 'Cable Cross-Section Area',
    description: 'Calculate required cable cross-sectional area based on current',
    domain: 'electrical',
    category_slug: 'cable-sizing',
    equation: 'A = (I * L * 2) / (k * VD_allowable)',
    equation_latex: 'A = \\frac{I \\times L \\times 2}{k \\times VD_{allowable}}',
    difficulty_level: 'intermediate',
    tags: ['cable', 'cross-section', 'area', 'sizing'],
    inputs: [
      { name: 'I', symbol: 'I', description: 'Current', unit: 'A', default_value: 100, min_value: 1, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Cable Length', unit: 'm', default_value: 50, min_value: 1, input_order: 2 },
      { name: 'k', symbol: 'k', description: 'Conductivity Constant', unit: 'm/Ω·mm²', default_value: 56, min_value: 1, input_order: 3 },
      { name: 'VD_allowable', symbol: 'VD_allowable', description: 'Allowable Voltage Drop', unit: 'V', default_value: 11.5, min_value: 0.1, input_order: 4 }
    ],
    outputs: [
      { name: 'A', symbol: 'A', description: 'Cross-Section Area', unit: 'mm²', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_cable_resistance',
    name: 'Cable DC Resistance',
    description: 'Calculate DC resistance of a cable',
    domain: 'electrical',
    category_slug: 'cable-sizing',
    equation: 'R_dc = (rho * L) / A',
    equation_latex: 'R_{dc} = \\frac{\\rho \\times L}{A}',
    difficulty_level: 'beginner',
    tags: ['cable', 'resistance', 'dc'],
    inputs: [
      { name: 'rho', symbol: 'ρ', description: 'Resistivity', unit: 'Ω·mm²/m', default_value: 0.0172, min_value: 0.001, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Cable Length', unit: 'm', default_value: 100, min_value: 1, input_order: 2 },
      { name: 'A', symbol: 'A', description: 'Cross-Section Area', unit: 'mm²', default_value: 16, min_value: 0.5, input_order: 3 }
    ],
    outputs: [
      { name: 'R_dc', symbol: 'R_dc', description: 'DC Resistance', unit: 'Ω', output_order: 1, precision: 6 }
    ]
  },
  {
    equation_id: 'eq_cable_ac_resistance',
    name: 'Cable AC Resistance',
    description: 'Calculate AC resistance considering skin and proximity effects',
    domain: 'electrical',
    category_slug: 'cable-sizing',
    equation: 'R_ac = R_dc * (1 + y_s + y_p)',
    equation_latex: 'R_{ac} = R_{dc} \\times (1 + y_s + y_p)',
    difficulty_level: 'advanced',
    tags: ['cable', 'resistance', 'ac', 'skin-effect'],
    inputs: [
      { name: 'R_dc', symbol: 'R_dc', description: 'DC Resistance', unit: 'Ω', default_value: 0.1, min_value: 0.001, input_order: 1 },
      { name: 'y_s', symbol: 'y_s', description: 'Skin Effect Factor', unit: '', default_value: 0.05, min_value: 0, input_order: 2 },
      { name: 'y_p', symbol: 'y_p', description: 'Proximity Effect Factor', unit: '', default_value: 0.03, min_value: 0, input_order: 3 }
    ],
    outputs: [
      { name: 'R_ac', symbol: 'R_ac', description: 'AC Resistance', unit: 'Ω', output_order: 1, precision: 6 }
    ]
  },
  {
    equation_id: 'eq_cable_impedance',
    name: 'Cable Impedance',
    description: 'Calculate cable impedance from resistance and reactance',
    domain: 'electrical',
    category_slug: 'cable-sizing',
    equation: 'Z = sqrt(R^2 + X^2)',
    equation_latex: 'Z = \\sqrt{R^2 + X^2}',
    difficulty_level: 'intermediate',
    tags: ['cable', 'impedance', 'resistance', 'reactance'],
    inputs: [
      { name: 'R', symbol: 'R', description: 'Resistance', unit: 'Ω', default_value: 0.1, min_value: 0, input_order: 1 },
      { name: 'X', symbol: 'X', description: 'Reactance', unit: 'Ω', default_value: 0.08, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'Z', symbol: 'Z', description: 'Impedance', unit: 'Ω', output_order: 1, precision: 6 }
    ]
  },
  {
    equation_id: 'eq_cable_inductance',
    name: 'Cable Inductance (Single Core)',
    description: 'Calculate inductance of single core cable',
    domain: 'electrical',
    category_slug: 'cable-sizing',
    equation: 'L = (0.2 * ln(2 * s / d)) / 1000',
    equation_latex: 'L = \\frac{0.2 \\times \\ln(2s/d)}{1000}',
    difficulty_level: 'advanced',
    tags: ['cable', 'inductance', 'single-core'],
    inputs: [
      { name: 's', symbol: 's', description: 'Spacing Between Centers', unit: 'mm', default_value: 50, min_value: 1, input_order: 1 },
      { name: 'd', symbol: 'd', description: 'Conductor Diameter', unit: 'mm', default_value: 10, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'L', symbol: 'L', description: 'Inductance per km', unit: 'mH/km', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_cable_capacitance',
    name: 'Cable Capacitance',
    description: 'Calculate capacitance of single core cable',
    domain: 'electrical',
    category_slug: 'cable-sizing',
    equation: 'C = (2 * PI * epsilon * epsilon_0) / ln(D / d)',
    equation_latex: 'C = \\frac{2\\pi \\varepsilon \\varepsilon_0}{\\ln(D/d)}',
    difficulty_level: 'advanced',
    tags: ['cable', 'capacitance'],
    inputs: [
      { name: 'epsilon', symbol: 'ε', description: 'Relative Permittivity', unit: '', default_value: 4, min_value: 1, input_order: 1 },
      { name: 'D', symbol: 'D', description: 'Insulation Outer Diameter', unit: 'mm', default_value: 30, min_value: 1, input_order: 2 },
      { name: 'd', symbol: 'd', description: 'Conductor Diameter', unit: 'mm', default_value: 10, min_value: 0.1, input_order: 3 }
    ],
    outputs: [
      { name: 'C', symbol: 'C', description: 'Capacitance per km', unit: 'μF/km', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_cable_reactance',
    name: 'Cable Reactance',
    description: 'Calculate cable reactance at given frequency',
    domain: 'electrical',
    category_slug: 'cable-sizing',
    equation: 'X = 2 * PI * f * L',
    equation_latex: 'X = 2\\pi f L',
    difficulty_level: 'intermediate',
    tags: ['cable', 'reactance', 'frequency'],
    inputs: [
      { name: 'f', symbol: 'f', description: 'Frequency', unit: 'Hz', default_value: 50, min_value: 1, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Inductance', unit: 'H', default_value: 0.0004, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'X', symbol: 'X', description: 'Reactance', unit: 'Ω', output_order: 1, precision: 6 }
    ]
  },
  {
    equation_id: 'eq_cable_current_density',
    name: 'Current Density',
    description: 'Calculate current density in a conductor',
    domain: 'electrical',
    category_slug: 'cable-sizing',
    equation: 'J = I / A',
    equation_latex: 'J = \\frac{I}{A}',
    difficulty_level: 'beginner',
    tags: ['cable', 'current-density', 'ampacity'],
    inputs: [
      { name: 'I', symbol: 'I', description: 'Current', unit: 'A', default_value: 100, min_value: 0.1, input_order: 1 },
      { name: 'A', symbol: 'A', description: 'Cross-Section Area', unit: 'mm²', default_value: 16, min_value: 0.5, input_order: 2 }
    ],
    outputs: [
      { name: 'J', symbol: 'J', description: 'Current Density', unit: 'A/mm²', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_cable_temp_derating',
    name: 'Temperature Derating Factor',
    description: 'Calculate temperature correction factor for cable ampacity',
    domain: 'electrical',
    category_slug: 'cable-sizing',
    equation: 'k_temp = sqrt((T_max - T_amb) / (T_max - T_ref))',
    equation_latex: 'k_{temp} = \\sqrt{\\frac{T_{max} - T_{amb}}{T_{max} - T_{ref}}}',
    difficulty_level: 'intermediate',
    tags: ['cable', 'temperature', 'derating'],
    inputs: [
      { name: 'T_max', symbol: 'T_max', description: 'Maximum Conductor Temperature', unit: '°C', default_value: 90, min_value: 30, input_order: 1 },
      { name: 'T_amb', symbol: 'T_amb', description: 'Ambient Temperature', unit: '°C', default_value: 40, min_value: 10, input_order: 2 },
      { name: 'T_ref', symbol: 'T_ref', description: 'Reference Temperature', unit: '°C', default_value: 30, min_value: 10, input_order: 3 }
    ],
    outputs: [
      { name: 'k_temp', symbol: 'k_temp', description: 'Temperature Derating Factor', unit: '', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_cable_grouping_factor',
    name: 'Grouping Derating Factor',
    description: 'Calculate derating factor for grouped cables',
    domain: 'electrical',
    category_slug: 'cable-sizing',
    equation: 'k_group = 1 / sqrt(n)',
    equation_latex: 'k_{group} = \\frac{1}{\\sqrt{n}}',
    difficulty_level: 'beginner',
    tags: ['cable', 'grouping', 'derating'],
    inputs: [
      { name: 'n', symbol: 'n', description: 'Number of Circuits', unit: '', default_value: 4, min_value: 1, max_value: 20, input_order: 1 }
    ],
    outputs: [
      { name: 'k_group', symbol: 'k_group', description: 'Grouping Factor', unit: '', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_cable_short_circuit',
    name: 'Cable Short Circuit Current',
    description: 'Calculate adiabatic short circuit current rating',
    domain: 'electrical',
    category_slug: 'cable-sizing',
    equation: 'I_sc = (K * A) / sqrt(t)',
    equation_latex: 'I_{sc} = \\frac{K \\times A}{\\sqrt{t}}',
    difficulty_level: 'advanced',
    tags: ['cable', 'short-circuit', 'fault'],
    inputs: [
      { name: 'K', symbol: 'K', description: 'Material Constant', unit: 'A·s½/mm²', default_value: 143, min_value: 1, input_order: 1 },
      { name: 'A', symbol: 'A', description: 'Cross-Section Area', unit: 'mm²', default_value: 16, min_value: 0.5, input_order: 2 },
      { name: 't', symbol: 't', description: 'Duration', unit: 's', default_value: 1, min_value: 0.1, input_order: 3 }
    ],
    outputs: [
      { name: 'I_sc', symbol: 'I_sc', description: 'Short Circuit Current', unit: 'A', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_cable_min_size',
    name: 'Minimum Cable Size for Short Circuit',
    description: 'Calculate minimum cable size based on short circuit current',
    domain: 'electrical',
    category_slug: 'cable-sizing',
    equation: 'A_min = (I_sc * sqrt(t)) / K',
    equation_latex: 'A_{min} = \\frac{I_{sc} \\times \\sqrt{t}}{K}',
    difficulty_level: 'advanced',
    tags: ['cable', 'short-circuit', 'minimum-size'],
    inputs: [
      { name: 'I_sc', symbol: 'I_sc', description: 'Short Circuit Current', unit: 'A', default_value: 10000, min_value: 100, input_order: 1 },
      { name: 't', symbol: 't', description: 'Duration', unit: 's', default_value: 1, min_value: 0.1, input_order: 2 },
      { name: 'K', symbol: 'K', description: 'Material Constant', unit: 'A·s½/mm²', default_value: 143, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'A_min', symbol: 'A_min', description: 'Minimum Cross-Section Area', unit: 'mm²', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_cable_thermal_resistance',
    name: 'Cable Thermal Resistance',
    description: 'Calculate thermal resistance of cable insulation',
    domain: 'electrical',
    category_slug: 'cable-sizing',
    equation: 'T_thermal = (rho_th / (2 * PI)) * ln(D / d)',
    equation_latex: 'T_{thermal} = \\frac{\\rho_{th}}{2\\pi} \\times \\ln\\frac{D}{d}',
    difficulty_level: 'advanced',
    tags: ['cable', 'thermal', 'resistance'],
    inputs: [
      { name: 'rho_th', symbol: 'ρ_th', description: 'Thermal Resistivity', unit: 'K·m/W', default_value: 3.5, min_value: 0.1, input_order: 1 },
      { name: 'D', symbol: 'D', description: 'Outer Diameter', unit: 'mm', default_value: 30, min_value: 1, input_order: 2 },
      { name: 'd', symbol: 'd', description: 'Conductor Diameter', unit: 'mm', default_value: 10, min_value: 0.1, input_order: 3 }
    ],
    outputs: [
      { name: 'T_thermal', symbol: 'T_thermal', description: 'Thermal Resistance', unit: 'K·m/W', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_cable_power_loss',
    name: 'Cable Power Loss',
    description: 'Calculate power loss in cable due to current flow',
    domain: 'electrical',
    category_slug: 'cable-sizing',
    equation: 'P_loss = 3 * I^2 * R * L / 1000',
    equation_latex: 'P_{loss} = \\frac{3 \\times I^2 \\times R \\times L}{1000}',
    difficulty_level: 'intermediate',
    tags: ['cable', 'power-loss', 'efficiency'],
    inputs: [
      { name: 'I', symbol: 'I', description: 'Current per Phase', unit: 'A', default_value: 100, min_value: 1, input_order: 1 },
      { name: 'R', symbol: 'R', description: 'Resistance per km', unit: 'Ω/km', default_value: 0.5, min_value: 0.001, input_order: 2 },
      { name: 'L', symbol: 'L', description: 'Cable Length', unit: 'm', default_value: 100, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'P_loss', symbol: 'P_loss', description: 'Total Power Loss', unit: 'W', output_order: 1, precision: 2 }
    ]
  },

  // ============================================
  // VOLTAGE DROP EQUATIONS (15 equations)
  // ============================================
  
  {
    equation_id: 'eq_vd_dc',
    name: 'Voltage Drop (DC)',
    description: 'Calculate voltage drop in DC circuits',
    domain: 'electrical',
    category_slug: 'voltage-drop',
    equation: 'VD = (2 * I * R * L) / 1000',
    equation_latex: 'V_D = \\frac{2 \\times I \\times R \\times L}{1000}',
    difficulty_level: 'beginner',
    tags: ['voltage', 'drop', 'dc'],
    inputs: [
      { name: 'I', symbol: 'I', description: 'Current', unit: 'A', default_value: 50, min_value: 0.1, input_order: 1 },
      { name: 'R', symbol: 'R', description: 'Resistance per km', unit: 'Ω/km', default_value: 1.15, min_value: 0.001, input_order: 2 },
      { name: 'L', symbol: 'L', description: 'Cable Length', unit: 'm', default_value: 100, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'VD', symbol: 'V_D', description: 'Voltage Drop', unit: 'V', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_vd_single_phase',
    name: 'Voltage Drop (Single Phase AC)',
    description: 'Calculate voltage drop for single phase AC circuits',
    domain: 'electrical',
    category_slug: 'voltage-drop',
    equation: 'VD = (2 * I * L * (R * PF + X * sin(acos(PF)))) / 1000',
    equation_latex: 'V_D = \\frac{2 \\times I \\times L \\times (R \\cos\\phi + X \\sin\\phi)}{1000}',
    difficulty_level: 'intermediate',
    tags: ['voltage', 'drop', 'single-phase', 'ac'],
    inputs: [
      { name: 'I', symbol: 'I', description: 'Current', unit: 'A', default_value: 50, min_value: 0.1, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Cable Length', unit: 'm', default_value: 100, min_value: 1, input_order: 2 },
      { name: 'R', symbol: 'R', description: 'Resistance per km', unit: 'Ω/km', default_value: 1.15, min_value: 0.001, input_order: 3 },
      { name: 'X', symbol: 'X', description: 'Reactance per km', unit: 'Ω/km', default_value: 0.1, min_value: 0, input_order: 4 },
      { name: 'PF', symbol: 'cos φ', description: 'Power Factor', unit: '', default_value: 0.85, min_value: 0, max_value: 1, input_order: 5 }
    ],
    outputs: [
      { name: 'VD', symbol: 'V_D', description: 'Voltage Drop', unit: 'V', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_vd_three_phase',
    name: 'Voltage Drop (Three Phase AC)',
    description: 'Calculate voltage drop for three phase AC circuits',
    domain: 'electrical',
    category_slug: 'voltage-drop',
    equation: 'VD = (sqrt(3) * I * L * (R * PF + X * sin(acos(PF)))) / 1000',
    equation_latex: 'V_D = \\frac{\\sqrt{3} \\times I \\times L \\times (R \\cos\\phi + X \\sin\\phi)}{1000}',
    difficulty_level: 'intermediate',
    tags: ['voltage', 'drop', 'three-phase', 'ac'],
    inputs: [
      { name: 'I', symbol: 'I', description: 'Current', unit: 'A', default_value: 50, min_value: 0.1, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Cable Length', unit: 'm', default_value: 100, min_value: 1, input_order: 2 },
      { name: 'R', symbol: 'R', description: 'Resistance per km', unit: 'Ω/km', default_value: 1.15, min_value: 0.001, input_order: 3 },
      { name: 'X', symbol: 'X', description: 'Reactance per km', unit: 'Ω/km', default_value: 0.1, min_value: 0, input_order: 4 },
      { name: 'PF', symbol: 'cos φ', description: 'Power Factor', unit: '', default_value: 0.85, min_value: 0, max_value: 1, input_order: 5 }
    ],
    outputs: [
      { name: 'VD', symbol: 'V_D', description: 'Voltage Drop', unit: 'V', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_vd_percent',
    name: 'Voltage Drop Percentage',
    description: 'Calculate voltage drop as percentage of nominal voltage',
    domain: 'electrical',
    category_slug: 'voltage-drop',
    equation: 'VD_percent = (VD / V_nominal) * 100',
    equation_latex: 'V_D\\% = \\frac{V_D}{V_{nominal}} \\times 100',
    difficulty_level: 'beginner',
    tags: ['voltage', 'drop', 'percentage'],
    inputs: [
      { name: 'VD', symbol: 'V_D', description: 'Voltage Drop', unit: 'V', default_value: 10, min_value: 0, input_order: 1 },
      { name: 'V_nominal', symbol: 'V_nominal', description: 'Nominal Voltage', unit: 'V', default_value: 400, min_value: 100, input_order: 2 }
    ],
    outputs: [
      { name: 'VD_percent', symbol: 'V_D%', description: 'Voltage Drop Percentage', unit: '%', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_vd_max_length',
    name: 'Maximum Cable Length for Voltage Drop',
    description: 'Calculate maximum cable length for allowable voltage drop',
    domain: 'electrical',
    category_slug: 'voltage-drop',
    equation: 'L_max = (VD_allowable * 1000) / (sqrt(3) * I * Z)',
    equation_latex: 'L_{max} = \\frac{V_D_{allowable} \\times 1000}{\\sqrt{3} \\times I \\times Z}',
    difficulty_level: 'intermediate',
    tags: ['voltage', 'drop', 'maximum-length'],
    inputs: [
      { name: 'VD_allowable', symbol: 'VD_allowable', description: 'Allowable Voltage Drop', unit: 'V', default_value: 12, min_value: 0.1, input_order: 1 },
      { name: 'I', symbol: 'I', description: 'Current', unit: 'A', default_value: 50, min_value: 0.1, input_order: 2 },
      { name: 'Z', symbol: 'Z', description: 'Impedance per km', unit: 'Ω/km', default_value: 1.2, min_value: 0.001, input_order: 3 }
    ],
    outputs: [
      { name: 'L_max', symbol: 'L_max', description: 'Maximum Cable Length', unit: 'm', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_vd_resistive_only',
    name: 'Voltage Drop (Resistive Load)',
    description: 'Simplified voltage drop for resistive loads (PF=1)',
    domain: 'electrical',
    category_slug: 'voltage-drop',
    equation: 'VD = (sqrt(3) * I * R * L) / 1000',
    equation_latex: 'V_D = \\frac{\\sqrt{3} \\times I \\times R \\times L}{1000}',
    difficulty_level: 'beginner',
    tags: ['voltage', 'drop', 'resistive'],
    inputs: [
      { name: 'I', symbol: 'I', description: 'Current', unit: 'A', default_value: 50, min_value: 0.1, input_order: 1 },
      { name: 'R', symbol: 'R', description: 'Resistance per km', unit: 'Ω/km', default_value: 1.15, min_value: 0.001, input_order: 2 },
      { name: 'L', symbol: 'L', description: 'Cable Length', unit: 'm', default_value: 100, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'VD', symbol: 'V_D', description: 'Voltage Drop', unit: 'V', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_vd_approximate',
    name: 'Voltage Drop (Approximate)',
    description: 'Approximate voltage drop calculation',
    domain: 'electrical',
    category_slug: 'voltage-drop',
    equation: 'VD_percent = (P * L) / (K * V^2)',
    equation_latex: 'V_D\\% = \\frac{P \\times L}{K \\times V^2}',
    difficulty_level: 'beginner',
    tags: ['voltage', 'drop', 'approximate'],
    inputs: [
      { name: 'P', symbol: 'P', description: 'Power', unit: 'W', default_value: 50000, min_value: 100, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Cable Length', unit: 'm', default_value: 100, min_value: 1, input_order: 2 },
      { name: 'K', symbol: 'K', description: 'Cable Constant', unit: '', default_value: 50, min_value: 1, input_order: 3 },
      { name: 'V', symbol: 'V', description: 'Voltage', unit: 'V', default_value: 400, min_value: 100, input_order: 4 }
    ],
    outputs: [
      { name: 'VD_percent', symbol: 'V_D%', description: 'Voltage Drop Percentage', unit: '%', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_vd_receiving_end',
    name: 'Receiving End Voltage',
    description: 'Calculate receiving end voltage after drop',
    domain: 'electrical',
    category_slug: 'voltage-drop',
    equation: 'V_r = V_s - VD',
    equation_latex: 'V_r = V_s - V_D',
    difficulty_level: 'beginner',
    tags: ['voltage', 'drop', 'receiving-end'],
    inputs: [
      { name: 'V_s', symbol: 'V_s', description: 'Sending End Voltage', unit: 'V', default_value: 400, min_value: 100, input_order: 1 },
      { name: 'VD', symbol: 'V_D', description: 'Voltage Drop', unit: 'V', default_value: 10, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'V_r', symbol: 'V_r', description: 'Receiving End Voltage', unit: 'V', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_vd_impedance_method',
    name: 'Voltage Drop (Impedance Method)',
    description: 'Calculate voltage drop using cable impedance',
    domain: 'electrical',
    category_slug: 'voltage-drop',
    equation: 'VD = sqrt(3) * I * Z * L / 1000',
    equation_latex: 'V_D = \\frac{\\sqrt{3} \\times I \\times Z \\times L}{1000}',
    difficulty_level: 'intermediate',
    tags: ['voltage', 'drop', 'impedance'],
    inputs: [
      { name: 'I', symbol: 'I', description: 'Current', unit: 'A', default_value: 100, min_value: 0.1, input_order: 1 },
      { name: 'Z', symbol: 'Z', description: 'Impedance per km', unit: 'Ω/km', default_value: 0.5, min_value: 0.001, input_order: 2 },
      { name: 'L', symbol: 'L', description: 'Cable Length', unit: 'm', default_value: 150, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'VD', symbol: 'V_D', description: 'Voltage Drop', unit: 'V', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_vd_from_power',
    name: 'Voltage Drop from Power',
    description: 'Calculate voltage drop from power and cable parameters',
    domain: 'electrical',
    category_slug: 'voltage-drop',
    equation: 'VD = (P * L * R) / (V^2 * PF) * 1000',
    equation_latex: 'V_D = \\frac{P \\times L \\times R}{V^2 \\times \\cos\\phi} \\times 1000',
    difficulty_level: 'intermediate',
    tags: ['voltage', 'drop', 'power'],
    inputs: [
      { name: 'P', symbol: 'P', description: 'Active Power', unit: 'W', default_value: 50000, min_value: 100, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Cable Length', unit: 'm', default_value: 100, min_value: 1, input_order: 2 },
      { name: 'R', symbol: 'R', description: 'Resistance per km', unit: 'Ω/km', default_value: 0.5, min_value: 0.001, input_order: 3 },
      { name: 'V', symbol: 'V', description: 'Voltage', unit: 'V', default_value: 400, min_value: 100, input_order: 4 },
      { name: 'PF', symbol: 'cos φ', description: 'Power Factor', unit: '', default_value: 0.85, min_value: 0.1, max_value: 1, input_order: 5 }
    ],
    outputs: [
      { name: 'VD', symbol: 'V_D', description: 'Voltage Drop', unit: 'V', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_vd_line_to_neutral',
    name: 'Voltage Drop (Line to Neutral)',
    description: 'Calculate line to neutral voltage drop',
    domain: 'electrical',
    category_slug: 'voltage-drop',
    equation: 'VD_ln = (I * Z * L) / 1000',
    equation_latex: 'V_D{ln} = \\frac{I \\times Z \\times L}{1000}',
    difficulty_level: 'beginner',
    tags: ['voltage', 'drop', 'line-to-neutral'],
    inputs: [
      { name: 'I', symbol: 'I', description: 'Current', unit: 'A', default_value: 50, min_value: 0.1, input_order: 1 },
      { name: 'Z', symbol: 'Z', description: 'Impedance per km', unit: 'Ω/km', default_value: 0.5, min_value: 0.001, input_order: 2 },
      { name: 'L', symbol: 'L', description: 'Cable Length', unit: 'm', default_value: 100, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'VD_ln', symbol: 'V_D{ln}', description: 'Line to Neutral Voltage Drop', unit: 'V', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_vd_regulation',
    name: 'Voltage Regulation',
    description: 'Calculate voltage regulation percentage',
    domain: 'electrical',
    category_slug: 'voltage-drop',
    equation: 'VR = ((V_s - V_r) / V_r) * 100',
    equation_latex: 'VR = \\frac{V_s - V_r}{V_r} \\times 100',
    difficulty_level: 'intermediate',
    tags: ['voltage', 'drop', 'regulation'],
    inputs: [
      { name: 'V_s', symbol: 'V_s', description: 'Sending End Voltage', unit: 'V', default_value: 400, min_value: 100, input_order: 1 },
      { name: 'V_r', symbol: 'V_r', description: 'Receiving End Voltage', unit: 'V', default_value: 390, min_value: 100, input_order: 2 }
    ],
    outputs: [
      { name: 'VR', symbol: 'VR', description: 'Voltage Regulation', unit: '%', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_vd_circular_mil',
    name: 'Voltage Drop (Circular Mil Method)',
    description: 'Calculate voltage drop using circular mils',
    domain: 'electrical',
    category_slug: 'voltage-drop',
    equation: 'VD = (K * I * L) / CM',
    equation_latex: 'V_D = \\frac{K \\times I \\times L}{CM}',
    difficulty_level: 'intermediate',
    tags: ['voltage', 'drop', 'circular-mil'],
    inputs: [
      { name: 'K', symbol: 'K', description: 'Specific Resistance Constant', unit: '', default_value: 12, min_value: 1, input_order: 1 },
      { name: 'I', symbol: 'I', description: 'Current', unit: 'A', default_value: 50, min_value: 0.1, input_order: 2 },
      { name: 'L', symbol: 'L', description: 'Cable Length', unit: 'ft', default_value: 300, min_value: 1, input_order: 3 },
      { name: 'CM', symbol: 'CM', description: 'Circular Mils', unit: 'cmil', default_value: 25000, min_value: 1000, input_order: 4 }
    ],
    outputs: [
      { name: 'VD', symbol: 'V_D', description: 'Voltage Drop', unit: 'V', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_vd_feeder',
    name: 'Feeder Voltage Drop',
    description: 'Calculate voltage drop for feeder with distributed loads',
    domain: 'electrical',
    category_slug: 'voltage-drop',
    equation: 'VD = (I * L * Z * K_d) / 1000',
    equation_latex: 'V_D = \\frac{I \\times L \\times Z \\times K_d}{1000}',
    difficulty_level: 'intermediate',
    tags: ['voltage', 'drop', 'feeder', 'distributed'],
    inputs: [
      { name: 'I', symbol: 'I', description: 'Total Current', unit: 'A', default_value: 200, min_value: 1, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Feeder Length', unit: 'm', default_value: 200, min_value: 1, input_order: 2 },
      { name: 'Z', symbol: 'Z', description: 'Impedance per km', unit: 'Ω/km', default_value: 0.3, min_value: 0.001, input_order: 3 },
      { name: 'K_d', symbol: 'K_d', description: 'Distribution Factor', unit: '', default_value: 0.5, min_value: 0.1, max_value: 1, input_order: 4 }
    ],
    outputs: [
      { name: 'VD', symbol: 'V_D', description: 'Voltage Drop', unit: 'V', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_vd_motor_starting',
    name: 'Voltage Drop During Motor Starting',
    description: 'Calculate voltage drop during motor starting',
    domain: 'electrical',
    category_slug: 'voltage-drop',
    equation: 'VD_start = (I_start * L * Z) / (sqrt(3) * 1000)',
    equation_latex: 'V_D{start} = \\frac{I_{start} \\times L \\times Z}{\\sqrt{3} \\times 1000}',
    difficulty_level: 'advanced',
    tags: ['voltage', 'drop', 'motor', 'starting'],
    inputs: [
      { name: 'I_start', symbol: 'I_start', description: 'Starting Current', unit: 'A', default_value: 500, min_value: 10, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Cable Length', unit: 'm', default_value: 100, min_value: 1, input_order: 2 },
      { name: 'Z', symbol: 'Z', description: 'Impedance per km', unit: 'Ω/km', default_value: 0.5, min_value: 0.001, input_order: 3 }
    ],
    outputs: [
      { name: 'VD_start', symbol: 'V_D{start}', description: 'Starting Voltage Drop', unit: 'V', output_order: 1, precision: 2 }
    ]
  },

  // ============================================
  // POWER CALCULATIONS (20 equations)
  // ============================================
  
  {
    equation_id: 'eq_power_dc',
    name: 'DC Power',
    description: 'Calculate power in DC circuits',
    domain: 'electrical',
    category_slug: 'power-calcs',
    equation: 'P = V * I',
    equation_latex: 'P = V \\times I',
    difficulty_level: 'beginner',
    tags: ['power', 'dc'],
    inputs: [
      { name: 'V', symbol: 'V', description: 'Voltage', unit: 'V', default_value: 24, min_value: 0, input_order: 1 },
      { name: 'I', symbol: 'I', description: 'Current', unit: 'A', default_value: 10, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'P', symbol: 'P', description: 'Power', unit: 'W', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_power_dc_resistance',
    name: 'DC Power (from Resistance)',
    description: 'Calculate DC power using resistance',
    domain: 'electrical',
    category_slug: 'power-calcs',
    equation: 'P = I^2 * R',
    equation_latex: 'P = I^2 \\times R',
    difficulty_level: 'beginner',
    tags: ['power', 'dc', 'resistance'],
    inputs: [
      { name: 'I', symbol: 'I', description: 'Current', unit: 'A', default_value: 10, min_value: 0, input_order: 1 },
      { name: 'R', symbol: 'R', description: 'Resistance', unit: 'Ω', default_value: 2.4, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'P', symbol: 'P', description: 'Power', unit: 'W', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_power_dc_voltage',
    name: 'DC Power (from Voltage)',
    description: 'Calculate DC power using voltage and resistance',
    domain: 'electrical',
    category_slug: 'power-calcs',
    equation: 'P = V^2 / R',
    equation_latex: 'P = \\frac{V^2}{R}',
    difficulty_level: 'beginner',
    tags: ['power', 'dc', 'voltage'],
    inputs: [
      { name: 'V', symbol: 'V', description: 'Voltage', unit: 'V', default_value: 24, min_value: 0, input_order: 1 },
      { name: 'R', symbol: 'R', description: 'Resistance', unit: 'Ω', default_value: 2.4, min_value: 0.001, input_order: 2 }
    ],
    outputs: [
      { name: 'P', symbol: 'P', description: 'Power', unit: 'W', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_power_single_phase',
    name: 'Single Phase Active Power',
    description: 'Calculate active power in single phase AC circuits',
    domain: 'electrical',
    category_slug: 'power-calcs',
    equation: 'P = V * I * PF',
    equation_latex: 'P = V \\times I \\times \\cos\\phi',
    difficulty_level: 'beginner',
    tags: ['power', 'single-phase', 'ac', 'active'],
    inputs: [
      { name: 'V', symbol: 'V', description: 'Voltage', unit: 'V', default_value: 230, min_value: 0, input_order: 1 },
      { name: 'I', symbol: 'I', description: 'Current', unit: 'A', default_value: 20, min_value: 0, input_order: 2 },
      { name: 'PF', symbol: 'cos φ', description: 'Power Factor', unit: '', default_value: 0.85, min_value: 0, max_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'P', symbol: 'P', description: 'Active Power', unit: 'W', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_power_three_phase',
    name: 'Three Phase Active Power',
    description: 'Calculate active power in three phase circuits',
    domain: 'electrical',
    category_slug: 'power-calcs',
    equation: 'P = sqrt(3) * V * I * PF',
    equation_latex: 'P = \\sqrt{3} \\times V \\times I \\times \\cos\\phi',
    difficulty_level: 'intermediate',
    tags: ['power', 'three-phase', 'ac', 'active'],
    inputs: [
      { name: 'V', symbol: 'V', description: 'Line Voltage', unit: 'V', default_value: 400, min_value: 0, input_order: 1 },
      { name: 'I', symbol: 'I', description: 'Line Current', unit: 'A', default_value: 100, min_value: 0, input_order: 2 },
      { name: 'PF', symbol: 'cos φ', description: 'Power Factor', unit: '', default_value: 0.85, min_value: 0, max_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'P', symbol: 'P', description: 'Active Power', unit: 'W', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_apparent_power_single',
    name: 'Single Phase Apparent Power',
    description: 'Calculate apparent power in single phase circuits',
    domain: 'electrical',
    category_slug: 'power-calcs',
    equation: 'S = V * I',
    equation_latex: 'S = V \\times I',
    difficulty_level: 'beginner',
    tags: ['power', 'single-phase', 'apparent', 'kva'],
    inputs: [
      { name: 'V', symbol: 'V', description: 'Voltage', unit: 'V', default_value: 230, min_value: 0, input_order: 1 },
      { name: 'I', symbol: 'I', description: 'Current', unit: 'A', default_value: 50, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'S', symbol: 'S', description: 'Apparent Power', unit: 'VA', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_apparent_power_three',
    name: 'Three Phase Apparent Power',
    description: 'Calculate apparent power in three phase circuits',
    domain: 'electrical',
    category_slug: 'power-calcs',
    equation: 'S = sqrt(3) * V * I',
    equation_latex: 'S = \\sqrt{3} \\times V \\times I',
    difficulty_level: 'intermediate',
    tags: ['power', 'three-phase', 'apparent', 'kva'],
    inputs: [
      { name: 'V', symbol: 'V', description: 'Line Voltage', unit: 'V', default_value: 400, min_value: 0, input_order: 1 },
      { name: 'I', symbol: 'I', description: 'Line Current', unit: 'A', default_value: 100, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'S', symbol: 'S', description: 'Apparent Power', unit: 'VA', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_reactive_power_single',
    name: 'Single Phase Reactive Power',
    description: 'Calculate reactive power in single phase circuits',
    domain: 'electrical',
    category_slug: 'power-calcs',
    equation: 'Q = V * I * sin(acos(PF))',
    equation_latex: 'Q = V \\times I \\times \\sin\\phi',
    difficulty_level: 'intermediate',
    tags: ['power', 'single-phase', 'reactive', 'kvar'],
    inputs: [
      { name: 'V', symbol: 'V', description: 'Voltage', unit: 'V', default_value: 230, min_value: 0, input_order: 1 },
      { name: 'I', symbol: 'I', description: 'Current', unit: 'A', default_value: 50, min_value: 0, input_order: 2 },
      { name: 'PF', symbol: 'cos φ', description: 'Power Factor', unit: '', default_value: 0.85, min_value: 0, max_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'Q', symbol: 'Q', description: 'Reactive Power', unit: 'var', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_reactive_power_three',
    name: 'Three Phase Reactive Power',
    description: 'Calculate reactive power in three phase circuits',
    domain: 'electrical',
    category_slug: 'power-calcs',
    equation: 'Q = sqrt(3) * V * I * sin(acos(PF))',
    equation_latex: 'Q = \\sqrt{3} \\times V \\times I \\times \\sin\\phi',
    difficulty_level: 'intermediate',
    tags: ['power', 'three-phase', 'reactive', 'kvar'],
    inputs: [
      { name: 'V', symbol: 'V', description: 'Line Voltage', unit: 'V', default_value: 400, min_value: 0, input_order: 1 },
      { name: 'I', symbol: 'I', description: 'Line Current', unit: 'A', default_value: 100, min_value: 0, input_order: 2 },
      { name: 'PF', symbol: 'cos φ', description: 'Power Factor', unit: '', default_value: 0.85, min_value: 0, max_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'Q', symbol: 'Q', description: 'Reactive Power', unit: 'var', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_power_triangle',
    name: 'Power Triangle Relationship',
    description: 'Calculate apparent power from active and reactive power',
    domain: 'electrical',
    category_slug: 'power-calcs',
    equation: 'S = sqrt(P^2 + Q^2)',
    equation_latex: 'S = \\sqrt{P^2 + Q^2}',
    difficulty_level: 'intermediate',
    tags: ['power', 'triangle', 'apparent'],
    inputs: [
      { name: 'P', symbol: 'P', description: 'Active Power', unit: 'W', default_value: 50000, min_value: 0, input_order: 1 },
      { name: 'Q', symbol: 'Q', description: 'Reactive Power', unit: 'var', default_value: 30000, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'S', symbol: 'S', description: 'Apparent Power', unit: 'VA', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_power_factor',
    name: 'Power Factor',
    description: 'Calculate power factor from active and apparent power',
    domain: 'electrical',
    category_slug: 'power-calcs',
    equation: 'PF = P / S',
    equation_latex: '\\cos\\phi = \\frac{P}{S}',
    difficulty_level: 'beginner',
    tags: ['power', 'factor', 'pf'],
    inputs: [
      { name: 'P', symbol: 'P', description: 'Active Power', unit: 'W', default_value: 50000, min_value: 0, input_order: 1 },
      { name: 'S', symbol: 'S', description: 'Apparent Power', unit: 'VA', default_value: 60000, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'PF', symbol: 'cos φ', description: 'Power Factor', unit: '', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_power_from_current',
    name: 'Power from Current (Three Phase)',
    description: 'Calculate three phase power from current and impedance',
    domain: 'electrical',
    category_slug: 'power-calcs',
    equation: 'P = 3 * I^2 * R',
    equation_latex: 'P = 3 \\times I^2 \\times R',
    difficulty_level: 'intermediate',
    tags: ['power', 'three-phase', 'current'],
    inputs: [
      { name: 'I', symbol: 'I', description: 'Phase Current', unit: 'A', default_value: 100, min_value: 0, input_order: 1 },
      { name: 'R', symbol: 'R', description: 'Phase Resistance', unit: 'Ω', default_value: 0.5, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'P', symbol: 'P', description: 'Total Power', unit: 'W', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_current_from_power',
    name: 'Current from Power (Three Phase)',
    description: 'Calculate current from three phase power',
    domain: 'electrical',
    category_slug: 'power-calcs',
    equation: 'I = P / (sqrt(3) * V * PF)',
    equation_latex: 'I = \\frac{P}{\\sqrt{3} \\times V \\times \\cos\\phi}',
    difficulty_level: 'intermediate',
    tags: ['current', 'three-phase', 'power'],
    inputs: [
      { name: 'P', symbol: 'P', description: 'Active Power', unit: 'W', default_value: 50000, min_value: 0, input_order: 1 },
      { name: 'V', symbol: 'V', description: 'Line Voltage', unit: 'V', default_value: 400, min_value: 100, input_order: 2 },
      { name: 'PF', symbol: 'cos φ', description: 'Power Factor', unit: '', default_value: 0.85, min_value: 0.1, max_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'I', symbol: 'I', description: 'Line Current', unit: 'A', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_energy_consumption',
    name: 'Energy Consumption',
    description: 'Calculate energy consumption over time',
    domain: 'electrical',
    category_slug: 'power-calcs',
    equation: 'E = P * t',
    equation_latex: 'E = P \\times t',
    difficulty_level: 'beginner',
    tags: ['energy', 'consumption', 'kwh'],
    inputs: [
      { name: 'P', symbol: 'P', description: 'Power', unit: 'kW', default_value: 10, min_value: 0, input_order: 1 },
      { name: 't', symbol: 't', description: 'Time', unit: 'h', default_value: 8, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'E', symbol: 'E', description: 'Energy', unit: 'kWh', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_power_cost',
    name: 'Power Cost Calculation',
    description: 'Calculate cost of energy consumption',
    domain: 'electrical',
    category_slug: 'power-calcs',
    equation: 'Cost = E * rate',
    equation_latex: 'Cost = E \\times rate',
    difficulty_level: 'beginner',
    tags: ['power', 'cost', 'energy'],
    inputs: [
      { name: 'E', symbol: 'E', description: 'Energy', unit: 'kWh', default_value: 100, min_value: 0, input_order: 1 },
      { name: 'rate', symbol: 'rate', description: 'Electricity Rate', unit: '$/kWh', default_value: 0.12, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'Cost', symbol: 'Cost', description: 'Total Cost', unit: '$', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_demand_factor',
    name: 'Demand Factor',
    description: 'Calculate demand factor for load analysis',
    domain: 'electrical',
    category_slug: 'power-calcs',
    equation: 'DF = P_max / P_connected',
    equation_latex: 'DF = \\frac{P_{max}}{P_{connected}}',
    difficulty_level: 'intermediate',
    tags: ['demand', 'factor', 'load'],
    inputs: [
      { name: 'P_max', symbol: 'P_max', description: 'Maximum Demand', unit: 'kW', default_value: 80, min_value: 0, input_order: 1 },
      { name: 'P_connected', symbol: 'P_connected', description: 'Connected Load', unit: 'kW', default_value: 150, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'DF', symbol: 'DF', description: 'Demand Factor', unit: '', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_load_factor',
    name: 'Load Factor',
    description: 'Calculate load factor for system efficiency',
    domain: 'electrical',
    category_slug: 'power-calcs',
    equation: 'LF = E_avg / P_max',
    equation_latex: 'LF = \\frac{E_{avg}}{P_{max}}',
    difficulty_level: 'intermediate',
    tags: ['load', 'factor', 'efficiency'],
    inputs: [
      { name: 'E_avg', symbol: 'E_avg', description: 'Average Load', unit: 'kW', default_value: 60, min_value: 0, input_order: 1 },
      { name: 'P_max', symbol: 'P_max', description: 'Peak Load', unit: 'kW', default_value: 100, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'LF', symbol: 'LF', description: 'Load Factor', unit: '', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_diversity_factor',
    name: 'Diversity Factor',
    description: 'Calculate diversity factor for multiple loads',
    domain: 'electrical',
    category_slug: 'power-calcs',
    equation: 'DivF = sum_individual_max / system_max',
    equation_latex: 'DivF = \\frac{\\sum P_{individual}}{P_{system}}',
    difficulty_level: 'intermediate',
    tags: ['diversity', 'factor', 'loads'],
    inputs: [
      { name: 'sum_individual_max', symbol: 'ΣP_ind', description: 'Sum of Individual Maximum Demands', unit: 'kW', default_value: 200, min_value: 0, input_order: 1 },
      { name: 'system_max', symbol: 'P_sys', description: 'System Maximum Demand', unit: 'kW', default_value: 150, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'DivF', symbol: 'DivF', description: 'Diversity Factor', unit: '', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_utilization_factor',
    name: 'Utilization Factor',
    description: 'Calculate utilization factor of equipment',
    domain: 'electrical',
    category_slug: 'power-calcs',
    equation: 'UF = P_used / P_rated',
    equation_latex: 'UF = \\frac{P_{used}}{P_{rated}}',
    difficulty_level: 'intermediate',
    tags: ['utilization', 'factor', 'capacity'],
    inputs: [
      { name: 'P_used', symbol: 'P_used', description: 'Power Used', unit: 'kW', default_value: 80, min_value: 0, input_order: 1 },
      { name: 'P_rated', symbol: 'P_rated', description: 'Rated Capacity', unit: 'kW', default_value: 100, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'UF', symbol: 'UF', description: 'Utilization Factor', unit: '', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_power_efficiency',
    name: 'Power Efficiency',
    description: 'Calculate efficiency of power conversion',
    domain: 'electrical',
    category_slug: 'power-calcs',
    equation: 'eta = (P_out / P_in) * 100',
    equation_latex: '\\eta = \\frac{P_{out}}{P_{in}} \\times 100',
    difficulty_level: 'beginner',
    tags: ['efficiency', 'power', 'conversion'],
    inputs: [
      { name: 'P_out', symbol: 'P_out', description: 'Output Power', unit: 'W', default_value: 900, min_value: 0, input_order: 1 },
      { name: 'P_in', symbol: 'P_in', description: 'Input Power', unit: 'W', default_value: 1000, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'eta', symbol: 'η', description: 'Efficiency', unit: '%', output_order: 1, precision: 2 }
    ]
  }
];

export default electricalBatch1;
