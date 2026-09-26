/**
 * Mechanical Engineering Equations - Batch 1
 * Thermodynamics, Fluid Mechanics
 * Total: 50 equations
 */

export const mechanicalBatch1 = [
  // ============================================
  // THERMODYNAMICS EQUATIONS (25 equations)
  // ============================================
  
  {
    equation_id: 'eq_thermo_ideal_gas',
    name: 'Ideal Gas Law',
    description: 'Calculate pressure, volume, or temperature of ideal gas',
    domain: 'mechanical',
    category_slug: 'thermodynamics',
    equation: 'P * V = n * R * T',
    equation_latex: 'P \\times V = n \\times R \\times T',
    difficulty_level: 'beginner',
    tags: ['thermodynamics', 'ideal-gas', 'pv'],
    inputs: [
      { name: 'n', symbol: 'n', description: 'Moles of Gas', unit: 'mol', default_value: 1, min_value: 0.001, input_order: 1 },
      { name: 'R', symbol: 'R', description: 'Gas Constant', unit: 'J/(mol·K)', default_value: 8.314, min_value: 0.001, input_order: 2 },
      { name: 'T', symbol: 'T', description: 'Temperature', unit: 'K', default_value: 300, min_value: 1, input_order: 3 },
      { name: 'V', symbol: 'V', description: 'Volume', unit: 'm³', default_value: 0.025, min_value: 0.001, input_order: 4 }
    ],
    outputs: [
      { name: 'P', symbol: 'P', description: 'Pressure', unit: 'Pa', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_thermo_boyle_law',
    name: 'Boyle\'s Law',
    description: 'Pressure-volume relationship at constant temperature',
    domain: 'mechanical',
    category_slug: 'thermodynamics',
    equation: 'P1 * V1 = P2 * V2',
    equation_latex: 'P_1 V_1 = P_2 V_2',
    difficulty_level: 'beginner',
    tags: ['thermodynamics', 'boyle', 'isothermal'],
    inputs: [
      { name: 'P1', symbol: 'P₁', description: 'Initial Pressure', unit: 'Pa', default_value: 101325, min_value: 1, input_order: 1 },
      { name: 'V1', symbol: 'V₁', description: 'Initial Volume', unit: 'm³', default_value: 0.01, min_value: 0.001, input_order: 2 },
      { name: 'V2', symbol: 'V₂', description: 'Final Volume', unit: 'm³', default_value: 0.02, min_value: 0.001, input_order: 3 }
    ],
    outputs: [
      { name: 'P2', symbol: 'P₂', description: 'Final Pressure', unit: 'Pa', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_thermo_charles_law',
    name: 'Charles\'s Law',
    description: 'Volume-temperature relationship at constant pressure',
    domain: 'mechanical',
    category_slug: 'thermodynamics',
    equation: 'V1 / T1 = V2 / T2',
    equation_latex: '\\frac{V_1}{T_1} = \\frac{V_2}{T_2}',
    difficulty_level: 'beginner',
    tags: ['thermodynamics', 'charles', 'isobaric'],
    inputs: [
      { name: 'V1', symbol: 'V₁', description: 'Initial Volume', unit: 'm³', default_value: 0.01, min_value: 0.001, input_order: 1 },
      { name: 'T1', symbol: 'T₁', description: 'Initial Temperature', unit: 'K', default_value: 273, min_value: 1, input_order: 2 },
      { name: 'T2', symbol: 'T₂', description: 'Final Temperature', unit: 'K', default_value: 373, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'V2', symbol: 'V₂', description: 'Final Volume', unit: 'm³', output_order: 1, precision: 6 }
    ]
  },
  {
    equation_id: 'eq_thermo_gay_lussac',
    name: 'Gay-Lussac\'s Law',
    description: 'Pressure-temperature relationship at constant volume',
    domain: 'mechanical',
    category_slug: 'thermodynamics',
    equation: 'P1 / T1 = P2 / T2',
    equation_latex: '\\frac{P_1}{T_1} = \\frac{P_2}{T_2}',
    difficulty_level: 'beginner',
    tags: ['thermodynamics', 'gay-lussac', 'isochoric'],
    inputs: [
      { name: 'P1', symbol: 'P₁', description: 'Initial Pressure', unit: 'Pa', default_value: 101325, min_value: 1, input_order: 1 },
      { name: 'T1', symbol: 'T₁', description: 'Initial Temperature', unit: 'K', default_value: 273, min_value: 1, input_order: 2 },
      { name: 'T2', symbol: 'T₂', description: 'Final Temperature', unit: 'K', default_value: 373, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'P2', symbol: 'P₂', description: 'Final Pressure', unit: 'Pa', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_thermo_first_law',
    name: 'First Law of Thermodynamics',
    description: 'Energy conservation in thermodynamic processes',
    domain: 'mechanical',
    category_slug: 'thermodynamics',
    equation: 'Q = delta_U + W',
    equation_latex: 'Q = \\Delta U + W',
    difficulty_level: 'intermediate',
    tags: ['thermodynamics', 'first-law', 'energy'],
    inputs: [
      { name: 'delta_U', symbol: 'ΔU', description: 'Change in Internal Energy', unit: 'J', default_value: 500, min_value: 0, input_order: 1 },
      { name: 'W', symbol: 'W', description: 'Work Done', unit: 'J', default_value: 300, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'Q', symbol: 'Q', description: 'Heat Added', unit: 'J', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_thermo_work_isothermal',
    name: 'Isothermal Work',
    description: 'Work done in isothermal process',
    domain: 'mechanical',
    category_slug: 'thermodynamics',
    equation: 'W = n * R * T * ln(V2 / V1)',
    equation_latex: 'W = nRT \\ln\\frac{V_2}{V_1}',
    difficulty_level: 'intermediate',
    tags: ['thermodynamics', 'work', 'isothermal'],
    inputs: [
      { name: 'n', symbol: 'n', description: 'Moles of Gas', unit: 'mol', default_value: 1, min_value: 0.001, input_order: 1 },
      { name: 'R', symbol: 'R', description: 'Gas Constant', unit: 'J/(mol·K)', default_value: 8.314, min_value: 0.001, input_order: 2 },
      { name: 'T', symbol: 'T', description: 'Temperature', unit: 'K', default_value: 300, min_value: 1, input_order: 3 },
      { name: 'V1', symbol: 'V₁', description: 'Initial Volume', unit: 'm³', default_value: 0.01, min_value: 0.001, input_order: 4 },
      { name: 'V2', symbol: 'V₂', description: 'Final Volume', unit: 'm³', default_value: 0.02, min_value: 0.001, input_order: 5 }
    ],
    outputs: [
      { name: 'W', symbol: 'W', description: 'Work Done', unit: 'J', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_thermo_work_isobaric',
    name: 'Isobaric Work',
    description: 'Work done at constant pressure',
    domain: 'mechanical',
    category_slug: 'thermodynamics',
    equation: 'W = P * (V2 - V1)',
    equation_latex: 'W = P \\times (V_2 - V_1)',
    difficulty_level: 'beginner',
    tags: ['thermodynamics', 'work', 'isobaric'],
    inputs: [
      { name: 'P', symbol: 'P', description: 'Pressure', unit: 'Pa', default_value: 101325, min_value: 1, input_order: 1 },
      { name: 'V1', symbol: 'V₁', description: 'Initial Volume', unit: 'm³', default_value: 0.01, min_value: 0.001, input_order: 2 },
      { name: 'V2', symbol: 'V₂', description: 'Final Volume', unit: 'm³', default_value: 0.02, min_value: 0.001, input_order: 3 }
    ],
    outputs: [
      { name: 'W', symbol: 'W', description: 'Work Done', unit: 'J', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_thermo_adiabatic',
    name: 'Adiabatic Process',
    description: 'Pressure-volume relationship in adiabatic process',
    domain: 'mechanical',
    category_slug: 'thermodynamics',
    equation: 'P1 * V1^gamma = P2 * V2^gamma',
    equation_latex: 'P_1 V_1^\\gamma = P_2 V_2^\\gamma',
    difficulty_level: 'intermediate',
    tags: ['thermodynamics', 'adiabatic', 'process'],
    inputs: [
      { name: 'P1', symbol: 'P₁', description: 'Initial Pressure', unit: 'Pa', default_value: 101325, min_value: 1, input_order: 1 },
      { name: 'V1', symbol: 'V₁', description: 'Initial Volume', unit: 'm³', default_value: 0.01, min_value: 0.001, input_order: 2 },
      { name: 'V2', symbol: 'V₂', description: 'Final Volume', unit: 'm³', default_value: 0.005, min_value: 0.001, input_order: 3 },
      { name: 'gamma', symbol: 'γ', description: 'Heat Capacity Ratio', unit: '', default_value: 1.4, min_value: 1, max_value: 2, input_order: 4 }
    ],
    outputs: [
      { name: 'P2', symbol: 'P₂', description: 'Final Pressure', unit: 'Pa', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_thermo_carnot_efficiency',
    name: 'Carnot Efficiency',
    description: 'Maximum theoretical efficiency of heat engine',
    domain: 'mechanical',
    category_slug: 'thermodynamics',
    equation: 'eta = 1 - (T_cold / T_hot)',
    equation_latex: '\\eta = 1 - \\frac{T_{cold}}{T_{hot}}',
    difficulty_level: 'intermediate',
    tags: ['thermodynamics', 'carnot', 'efficiency'],
    inputs: [
      { name: 'T_cold', symbol: 'T_c', description: 'Cold Reservoir Temperature', unit: 'K', default_value: 300, min_value: 1, input_order: 1 },
      { name: 'T_hot', symbol: 'T_h', description: 'Hot Reservoir Temperature', unit: 'K', default_value: 600, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'eta', symbol: 'η', description: 'Carnot Efficiency', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_thermo_cop_refrigerator',
    name: 'Refrigerator COP',
    description: 'Coefficient of performance for refrigerator',
    domain: 'mechanical',
    category_slug: 'thermodynamics',
    equation: 'COP = T_cold / (T_hot - T_cold)',
    equation_latex: 'COP = \\frac{T_{cold}}{T_{hot} - T_{cold}}',
    difficulty_level: 'intermediate',
    tags: ['thermodynamics', 'cop', 'refrigerator'],
    inputs: [
      { name: 'T_cold', symbol: 'T_c', description: 'Cold Space Temperature', unit: 'K', default_value: 263, min_value: 1, input_order: 1 },
      { name: 'T_hot', symbol: 'T_h', description: 'Hot Space Temperature', unit: 'K', default_value: 303, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'COP', symbol: 'COP', description: 'Coefficient of Performance', unit: '', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_thermo_cop_heatpump',
    name: 'Heat Pump COP',
    description: 'Coefficient of performance for heat pump',
    domain: 'mechanical',
    category_slug: 'thermodynamics',
    equation: 'COP_hp = T_hot / (T_hot - T_cold)',
    equation_latex: 'COP_{hp} = \\frac{T_{hot}}{T_{hot} - T_{cold}}',
    difficulty_level: 'intermediate',
    tags: ['thermodynamics', 'cop', 'heat-pump'],
    inputs: [
      { name: 'T_cold', symbol: 'T_c', description: 'Cold Source Temperature', unit: 'K', default_value: 273, min_value: 1, input_order: 1 },
      { name: 'T_hot', symbol: 'T_h', description: 'Hot Sink Temperature', unit: 'K', default_value: 303, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'COP_hp', symbol: 'COP_hp', description: 'Heat Pump COP', unit: '', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_thermo_entropy_change',
    name: 'Entropy Change',
    description: 'Calculate entropy change for reversible process',
    domain: 'mechanical',
    category_slug: 'thermodynamics',
    equation: 'delta_S = Q_rev / T',
    equation_latex: '\\Delta S = \\frac{Q_{rev}}{T}',
    difficulty_level: 'intermediate',
    tags: ['thermodynamics', 'entropy', 'reversible'],
    inputs: [
      { name: 'Q_rev', symbol: 'Q_rev', description: 'Reversible Heat Transfer', unit: 'J', default_value: 1000, min_value: 0, input_order: 1 },
      { name: 'T', symbol: 'T', description: 'Temperature', unit: 'K', default_value: 300, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'delta_S', symbol: 'ΔS', description: 'Entropy Change', unit: 'J/K', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_thermo_internal_energy',
    name: 'Internal Energy Change',
    description: 'Change in internal energy for ideal gas',
    domain: 'mechanical',
    category_slug: 'thermodynamics',
    equation: 'delta_U = n * Cv * delta_T',
    equation_latex: '\\Delta U = n \\times C_v \\times \\Delta T',
    difficulty_level: 'intermediate',
    tags: ['thermodynamics', 'internal-energy', 'ideal-gas'],
    inputs: [
      { name: 'n', symbol: 'n', description: 'Moles of Gas', unit: 'mol', default_value: 1, min_value: 0.001, input_order: 1 },
      { name: 'Cv', symbol: 'C_v', description: 'Molar Heat Capacity at Constant Volume', unit: 'J/(mol·K)', default_value: 20.8, min_value: 0.1, input_order: 2 },
      { name: 'delta_T', symbol: 'ΔT', description: 'Temperature Change', unit: 'K', default_value: 100, min_value: 0, input_order: 3 }
    ],
    outputs: [
      { name: 'delta_U', symbol: 'ΔU', description: 'Internal Energy Change', unit: 'J', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_thermo_enthalpy',
    name: 'Enthalpy Change',
    description: 'Change in enthalpy for ideal gas',
    domain: 'mechanical',
    category_slug: 'thermodynamics',
    equation: 'delta_H = n * Cp * delta_T',
    equation_latex: '\\Delta H = n \\times C_p \\times \\Delta T',
    difficulty_level: 'intermediate',
    tags: ['thermodynamics', 'enthalpy', 'ideal-gas'],
    inputs: [
      { name: 'n', symbol: 'n', description: 'Moles of Gas', unit: 'mol', default_value: 1, min_value: 0.001, input_order: 1 },
      { name: 'Cp', symbol: 'C_p', description: 'Molar Heat Capacity at Constant Pressure', unit: 'J/(mol·K)', default_value: 29.1, min_value: 0.1, input_order: 2 },
      { name: 'delta_T', symbol: 'ΔT', description: 'Temperature Change', unit: 'K', default_value: 100, min_value: 0, input_order: 3 }
    ],
    outputs: [
      { name: 'delta_H', symbol: 'ΔH', description: 'Enthalpy Change', unit: 'J', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_thermo_heat_rate',
    name: 'Heat Transfer Rate',
    description: 'Calculate heat transfer rate',
    domain: 'mechanical',
    category_slug: 'thermodynamics',
    equation: 'Q_dot = m_dot * Cp * delta_T',
    equation_latex: '\\dot{Q} = \\dot{m} \\times C_p \\times \\Delta T',
    difficulty_level: 'intermediate',
    tags: ['thermodynamics', 'heat', 'rate'],
    inputs: [
      { name: 'm_dot', symbol: 'ṁ', description: 'Mass Flow Rate', unit: 'kg/s', default_value: 1, min_value: 0.001, input_order: 1 },
      { name: 'Cp', symbol: 'C_p', description: 'Specific Heat Capacity', unit: 'J/(kg·K)', default_value: 4186, min_value: 1, input_order: 2 },
      { name: 'delta_T', symbol: 'ΔT', description: 'Temperature Change', unit: 'K', default_value: 20, min_value: 0, input_order: 3 }
    ],
    outputs: [
      { name: 'Q_dot', symbol: 'Q̇', description: 'Heat Transfer Rate', unit: 'W', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_thermo_rankine_efficiency',
    name: 'Rankine Cycle Efficiency',
    description: 'Thermal efficiency of Rankine cycle',
    domain: 'mechanical',
    category_slug: 'thermodynamics',
    equation: 'eta = (W_turbine - W_pump) / Q_in',
    equation_latex: '\\eta = \\frac{W_{turbine} - W_{pump}}{Q_{in}}',
    difficulty_level: 'advanced',
    tags: ['thermodynamics', 'rankine', 'efficiency'],
    inputs: [
      { name: 'W_turbine', symbol: 'W_t', description: 'Turbine Work', unit: 'kJ/kg', default_value: 1000, min_value: 0, input_order: 1 },
      { name: 'W_pump', symbol: 'W_p', description: 'Pump Work', unit: 'kJ/kg', default_value: 10, min_value: 0, input_order: 2 },
      { name: 'Q_in', symbol: 'Q_in', description: 'Heat Input', unit: 'kJ/kg', default_value: 2500, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'eta', symbol: 'η', description: 'Thermal Efficiency', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_thermo_otto_efficiency',
    name: 'Otto Cycle Efficiency',
    description: 'Thermal efficiency of Otto cycle',
    domain: 'mechanical',
    category_slug: 'thermodynamics',
    equation: 'eta = 1 - (1 / r^(gamma-1))',
    equation_latex: '\\eta = 1 - \\frac{1}{r^{\\gamma-1}}',
    difficulty_level: 'intermediate',
    tags: ['thermodynamics', 'otto', 'efficiency'],
    inputs: [
      { name: 'r', symbol: 'r', description: 'Compression Ratio', unit: '', default_value: 8, min_value: 1, input_order: 1 },
      { name: 'gamma', symbol: 'γ', description: 'Heat Capacity Ratio', unit: '', default_value: 1.4, min_value: 1, max_value: 2, input_order: 2 }
    ],
    outputs: [
      { name: 'eta', symbol: 'η', description: 'Thermal Efficiency', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_thermo_diesel_efficiency',
    name: 'Diesel Cycle Efficiency',
    description: 'Thermal efficiency of Diesel cycle',
    domain: 'mechanical',
    category_slug: 'thermodynamics',
    equation: 'eta = 1 - (1 / (r^(gamma-1))) * ((rc^gamma - 1) / (gamma * (rc - 1)))',
    equation_latex: '\\eta = 1 - \\frac{1}{r^{\\gamma-1}} \\times \\frac{r_c^\\gamma - 1}{\\gamma(r_c - 1)}',
    difficulty_level: 'advanced',
    tags: ['thermodynamics', 'diesel', 'efficiency'],
    inputs: [
      { name: 'r', symbol: 'r', description: 'Compression Ratio', unit: '', default_value: 18, min_value: 1, input_order: 1 },
      { name: 'rc', symbol: 'rc', description: 'Cutoff Ratio', unit: '', default_value: 2.5, min_value: 1, input_order: 2 },
      { name: 'gamma', symbol: 'γ', description: 'Heat Capacity Ratio', unit: '', default_value: 1.4, min_value: 1, max_value: 2, input_order: 3 }
    ],
    outputs: [
      { name: 'eta', symbol: 'η', description: 'Thermal Efficiency', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_thermo_steam_quality',
    name: 'Steam Quality',
    description: 'Calculate steam quality (dryness fraction)',
    domain: 'mechanical',
    category_slug: 'thermodynamics',
    equation: 'x = (h - h_f) / h_fg',
    equation_latex: 'x = \\frac{h - h_f}{h_{fg}}',
    difficulty_level: 'intermediate',
    tags: ['thermodynamics', 'steam', 'quality'],
    inputs: [
      { name: 'h', symbol: 'h', description: 'Specific Enthalpy', unit: 'kJ/kg', default_value: 2500, min_value: 0, input_order: 1 },
      { name: 'h_f', symbol: 'h_f', description: 'Saturated Liquid Enthalpy', unit: 'kJ/kg', default_value: 762, min_value: 0, input_order: 2 },
      { name: 'h_fg', symbol: 'h_fg', description: 'Latent Heat of Vaporization', unit: 'kJ/kg', default_value: 2015, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'x', symbol: 'x', description: 'Steam Quality', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_thermo_specific_volume',
    name: 'Specific Volume of Mixture',
    description: 'Calculate specific volume of steam mixture',
    domain: 'mechanical',
    category_slug: 'thermodynamics',
    equation: 'v = v_f + x * (v_g - v_f)',
    equation_latex: 'v = v_f + x(v_g - v_f)',
    difficulty_level: 'intermediate',
    tags: ['thermodynamics', 'steam', 'specific-volume'],
    inputs: [
      { name: 'v_f', symbol: 'v_f', description: 'Saturated Liquid Specific Volume', unit: 'm³/kg', default_value: 0.001, min_value: 0, input_order: 1 },
      { name: 'v_g', symbol: 'v_g', description: 'Saturated Vapor Specific Volume', unit: 'm³/kg', default_value: 0.194, min_value: 0, input_order: 2 },
      { name: 'x', symbol: 'x', description: 'Steam Quality', unit: '', default_value: 0.9, min_value: 0, max_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'v', symbol: 'v', description: 'Specific Volume', unit: 'm³/kg', output_order: 1, precision: 6 }
    ]
  },
  {
    equation_id: 'eq_thermo_mass_flow',
    name: 'Mass Flow Rate',
    description: 'Calculate mass flow rate through area',
    domain: 'mechanical',
    category_slug: 'thermodynamics',
    equation: 'm_dot = rho * A * v',
    equation_latex: '\\dot{m} = \\rho \\times A \\times v',
    difficulty_level: 'beginner',
    tags: ['thermodynamics', 'mass-flow', 'continuity'],
    inputs: [
      { name: 'rho', symbol: 'ρ', description: 'Density', unit: 'kg/m³', default_value: 1.2, min_value: 0.001, input_order: 1 },
      { name: 'A', symbol: 'A', description: 'Cross-Sectional Area', unit: 'm²', default_value: 0.01, min_value: 0.0001, input_order: 2 },
      { name: 'v', symbol: 'v', description: 'Velocity', unit: 'm/s', default_value: 10, min_value: 0, input_order: 3 }
    ],
    outputs: [
      { name: 'm_dot', symbol: 'ṁ', description: 'Mass Flow Rate', unit: 'kg/s', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_thermo_energy_equation',
    name: 'Steady Flow Energy Equation',
    description: 'Energy balance for steady flow system',
    domain: 'mechanical',
    category_slug: 'thermodynamics',
    equation: 'Q - W = m_dot * ((h2 - h1) + (v2^2 - v1^2)/2 + g*(z2 - z1))',
    equation_latex: 'Q - W = \\dot{m}\\left[(h_2 - h_1) + \\frac{v_2^2 - v_1^2}{2} + g(z_2 - z_1)\\right]',
    difficulty_level: 'advanced',
    tags: ['thermodynamics', 'sfee', 'energy'],
    inputs: [
      { name: 'm_dot', symbol: 'ṁ', description: 'Mass Flow Rate', unit: 'kg/s', default_value: 1, min_value: 0.001, input_order: 1 },
      { name: 'h1', symbol: 'h₁', description: 'Inlet Enthalpy', unit: 'J/kg', default_value: 100000, min_value: 0, input_order: 2 },
      { name: 'h2', symbol: 'h₂', description: 'Outlet Enthalpy', unit: 'J/kg', default_value: 200000, min_value: 0, input_order: 3 },
      { name: 'v1', symbol: 'v₁', description: 'Inlet Velocity', unit: 'm/s', default_value: 10, min_value: 0, input_order: 4 },
      { name: 'v2', symbol: 'v₂', description: 'Outlet Velocity', unit: 'm/s', default_value: 50, min_value: 0, input_order: 5 },
      { name: 'z1', symbol: 'z₁', description: 'Inlet Elevation', unit: 'm', default_value: 0, min_value: 0, input_order: 6 },
      { name: 'z2', symbol: 'z₂', description: 'Outlet Elevation', unit: 'm', default_value: 10, min_value: 0, input_order: 7 },
      { name: 'W', symbol: 'W', description: 'Work Output', unit: 'W', default_value: 50000, min_value: 0, input_order: 8 }
    ],
    outputs: [
      { name: 'Q', symbol: 'Q', description: 'Heat Transfer', unit: 'W', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_thermo_polytropic',
    name: 'Polytropic Process',
    description: 'Pressure-volume relationship in polytropic process',
    domain: 'mechanical',
    category_slug: 'thermodynamics',
    equation: 'P1 * V1^n = P2 * V2^n',
    equation_latex: 'P_1 V_1^n = P_2 V_2^n',
    difficulty_level: 'intermediate',
    tags: ['thermodynamics', 'polytropic', 'process'],
    inputs: [
      { name: 'P1', symbol: 'P₁', description: 'Initial Pressure', unit: 'Pa', default_value: 101325, min_value: 1, input_order: 1 },
      { name: 'V1', symbol: 'V₁', description: 'Initial Volume', unit: 'm³', default_value: 0.01, min_value: 0.001, input_order: 2 },
      { name: 'V2', symbol: 'V₂', description: 'Final Volume', unit: 'm³', default_value: 0.005, min_value: 0.001, input_order: 3 },
      { name: 'n', symbol: 'n', description: 'Polytropic Index', unit: '', default_value: 1.3, min_value: 0, input_order: 4 }
    ],
    outputs: [
      { name: 'P2', symbol: 'P₂', description: 'Final Pressure', unit: 'Pa', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_thermo_compressibility',
    name: 'Compressibility Factor',
    description: 'Calculate compressibility factor for real gas',
    domain: 'mechanical',
    category_slug: 'thermodynamics',
    equation: 'Z = (P * V) / (n * R * T)',
    equation_latex: 'Z = \\frac{PV}{nRT}',
    difficulty_level: 'intermediate',
    tags: ['thermodynamics', 'compressibility', 'real-gas'],
    inputs: [
      { name: 'P', symbol: 'P', description: 'Pressure', unit: 'Pa', default_value: 10000000, min_value: 1, input_order: 1 },
      { name: 'V', symbol: 'V', description: 'Volume', unit: 'm³', default_value: 0.001, min_value: 0.0001, input_order: 2 },
      { name: 'n', symbol: 'n', description: 'Moles of Gas', unit: 'mol', default_value: 50, min_value: 0.001, input_order: 3 },
      { name: 'R', symbol: 'R', description: 'Gas Constant', unit: 'J/(mol·K)', default_value: 8.314, min_value: 0.001, input_order: 4 },
      { name: 'T', symbol: 'T', description: 'Temperature', unit: 'K', default_value: 300, min_value: 1, input_order: 5 }
    ],
    outputs: [
      { name: 'Z', symbol: 'Z', description: 'Compressibility Factor', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_thermo_humidity_ratio',
    name: 'Humidity Ratio',
    description: 'Calculate humidity ratio of moist air',
    domain: 'mechanical',
    category_slug: 'thermodynamics',
    equation: 'omega = 0.622 * (Pv / (P - Pv))',
    equation_latex: '\\omega = 0.622 \\times \\frac{P_v}{P - P_v}',
    difficulty_level: 'intermediate',
    tags: ['thermodynamics', 'humidity', 'psychrometrics'],
    inputs: [
      { name: 'Pv', symbol: 'P_v', description: 'Vapor Pressure', unit: 'Pa', default_value: 2000, min_value: 0, input_order: 1 },
      { name: 'P', symbol: 'P', description: 'Total Pressure', unit: 'Pa', default_value: 101325, min_value: 1000, input_order: 2 }
    ],
    outputs: [
      { name: 'omega', symbol: 'ω', description: 'Humidity Ratio', unit: 'kg_v/kg_a', output_order: 1, precision: 5 }
    ]
  },

  // ============================================
  // FLUID MECHANICS EQUATIONS (25 equations)
  // ============================================
  
  {
    equation_id: 'eq_fluid_continuity',
    name: 'Continuity Equation',
    description: 'Mass conservation in fluid flow',
    domain: 'mechanical',
    category_slug: 'fluid-mechanics',
    equation: 'A1 * v1 = A2 * v2',
    equation_latex: 'A_1 v_1 = A_2 v_2',
    difficulty_level: 'beginner',
    tags: ['fluid', 'continuity', 'flow'],
    inputs: [
      { name: 'A1', symbol: 'A₁', description: 'Inlet Area', unit: 'm²', default_value: 0.01, min_value: 0.0001, input_order: 1 },
      { name: 'v1', symbol: 'v₁', description: 'Inlet Velocity', unit: 'm/s', default_value: 5, min_value: 0, input_order: 2 },
      { name: 'A2', symbol: 'A₂', description: 'Outlet Area', unit: 'm²', default_value: 0.005, min_value: 0.0001, input_order: 3 }
    ],
    outputs: [
      { name: 'v2', symbol: 'v₂', description: 'Outlet Velocity', unit: 'm/s', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_fluid_bernoulli',
    name: 'Bernoulli\'s Equation',
    description: 'Energy conservation in fluid flow',
    domain: 'mechanical',
    category_slug: 'fluid-mechanics',
    equation: 'P1 + 0.5*rho*v1^2 + rho*g*h1 = P2 + 0.5*rho*v2^2 + rho*g*h2',
    equation_latex: 'P_1 + \\frac{1}{2}\\rho v_1^2 + \\rho g h_1 = P_2 + \\frac{1}{2}\\rho v_2^2 + \\rho g h_2',
    difficulty_level: 'intermediate',
    tags: ['fluid', 'bernoulli', 'energy'],
    inputs: [
      { name: 'P1', symbol: 'P₁', description: 'Inlet Pressure', unit: 'Pa', default_value: 200000, min_value: 0, input_order: 1 },
      { name: 'rho', symbol: 'ρ', description: 'Density', unit: 'kg/m³', default_value: 1000, min_value: 0.1, input_order: 2 },
      { name: 'v1', symbol: 'v₁', description: 'Inlet Velocity', unit: 'm/s', default_value: 2, min_value: 0, input_order: 3 },
      { name: 'h1', symbol: 'h₁', description: 'Inlet Elevation', unit: 'm', default_value: 10, min_value: 0, input_order: 4 },
      { name: 'v2', symbol: 'v₂', description: 'Outlet Velocity', unit: 'm/s', default_value: 5, min_value: 0, input_order: 5 },
      { name: 'h2', symbol: 'h₂', description: 'Outlet Elevation', unit: 'm', default_value: 0, min_value: 0, input_order: 6 },
      { name: 'g', symbol: 'g', description: 'Gravity', unit: 'm/s²', default_value: 9.81, min_value: 0.1, input_order: 7 }
    ],
    outputs: [
      { name: 'P2', symbol: 'P₂', description: 'Outlet Pressure', unit: 'Pa', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_fluid_reynolds',
    name: 'Reynolds Number',
    description: 'Determine flow regime (laminar/turbulent)',
    domain: 'mechanical',
    category_slug: 'fluid-mechanics',
    equation: 'Re = (rho * v * D) / mu',
    equation_latex: 'Re = \\frac{\\rho v D}{\\mu}',
    difficulty_level: 'intermediate',
    tags: ['fluid', 'reynolds', 'flow-regime'],
    inputs: [
      { name: 'rho', symbol: 'ρ', description: 'Fluid Density', unit: 'kg/m³', default_value: 1000, min_value: 0.1, input_order: 1 },
      { name: 'v', symbol: 'v', description: 'Flow Velocity', unit: 'm/s', default_value: 2, min_value: 0, input_order: 2 },
      { name: 'D', symbol: 'D', description: 'Pipe Diameter', unit: 'm', default_value: 0.1, min_value: 0.001, input_order: 3 },
      { name: 'mu', symbol: 'μ', description: 'Dynamic Viscosity', unit: 'Pa·s', default_value: 0.001, min_value: 0.00001, input_order: 4 }
    ],
    outputs: [
      { name: 'Re', symbol: 'Re', description: 'Reynolds Number', unit: '', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_fluid_darcy_weisbach',
    name: 'Darcy-Weisbach Equation',
    description: 'Pressure loss due to friction in pipes',
    domain: 'mechanical',
    category_slug: 'fluid-mechanics',
    equation: 'dP = f * (L/D) * (rho * v^2 / 2)',
    equation_latex: '\\Delta P = f \\times \\frac{L}{D} \\times \\frac{\\rho v^2}{2}',
    difficulty_level: 'intermediate',
    tags: ['fluid', 'pressure-loss', 'friction'],
    inputs: [
      { name: 'f', symbol: 'f', description: 'Friction Factor', unit: '', default_value: 0.02, min_value: 0.001, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Pipe Length', unit: 'm', default_value: 100, min_value: 0.1, input_order: 2 },
      { name: 'D', symbol: 'D', description: 'Pipe Diameter', unit: 'm', default_value: 0.1, min_value: 0.001, input_order: 3 },
      { name: 'rho', symbol: 'ρ', description: 'Fluid Density', unit: 'kg/m³', default_value: 1000, min_value: 0.1, input_order: 4 },
      { name: 'v', symbol: 'v', description: 'Flow Velocity', unit: 'm/s', default_value: 2, min_value: 0, input_order: 5 }
    ],
    outputs: [
      { name: 'dP', symbol: 'ΔP', description: 'Pressure Loss', unit: 'Pa', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_fluid_head_loss',
    name: 'Head Loss (Darcy-Weisbach)',
    description: 'Head loss due to friction',
    domain: 'mechanical',
    category_slug: 'fluid-mechanics',
    equation: 'h_f = f * (L/D) * (v^2 / (2*g))',
    equation_latex: 'h_f = f \\times \\frac{L}{D} \\times \\frac{v^2}{2g}',
    difficulty_level: 'intermediate',
    tags: ['fluid', 'head-loss', 'friction'],
    inputs: [
      { name: 'f', symbol: 'f', description: 'Friction Factor', unit: '', default_value: 0.02, min_value: 0.001, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Pipe Length', unit: 'm', default_value: 100, min_value: 0.1, input_order: 2 },
      { name: 'D', symbol: 'D', description: 'Pipe Diameter', unit: 'm', default_value: 0.1, min_value: 0.001, input_order: 3 },
      { name: 'v', symbol: 'v', description: 'Flow Velocity', unit: 'm/s', default_value: 2, min_value: 0, input_order: 4 },
      { name: 'g', symbol: 'g', description: 'Gravity', unit: 'm/s²', default_value: 9.81, min_value: 0.1, input_order: 5 }
    ],
    outputs: [
      { name: 'h_f', symbol: 'h_f', description: 'Head Loss', unit: 'm', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_fluid_hazen_williams',
    name: 'Hazen-Williams Equation',
    description: 'Empirical formula for water flow in pipes',
    domain: 'mechanical',
    category_slug: 'fluid-mechanics',
    equation: 'v = 0.849 * C * (D/4)^0.63 * (h_f/L)^0.54',
    equation_latex: 'v = 0.849 C \\left(\\frac{D}{4}\\right)^{0.63} \\left(\\frac{h_f}{L}\\right)^{0.54}',
    difficulty_level: 'intermediate',
    tags: ['fluid', 'hazen-williams', 'water'],
    inputs: [
      { name: 'C', symbol: 'C', description: 'Hazen-Williams Coefficient', unit: '', default_value: 120, min_value: 40, input_order: 1 },
      { name: 'D', symbol: 'D', description: 'Pipe Diameter', unit: 'm', default_value: 0.15, min_value: 0.01, input_order: 2 },
      { name: 'h_f', symbol: 'h_f', description: 'Head Loss', unit: 'm', default_value: 5, min_value: 0.01, input_order: 3 },
      { name: 'L', symbol: 'L', description: 'Pipe Length', unit: 'm', default_value: 100, min_value: 1, input_order: 4 }
    ],
    outputs: [
      { name: 'v', symbol: 'v', description: 'Flow Velocity', unit: 'm/s', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_fluid_manning',
    name: 'Manning\'s Equation',
    description: 'Open channel flow velocity',
    domain: 'mechanical',
    category_slug: 'fluid-mechanics',
    equation: 'v = (1/n) * R^(2/3) * S^(1/2)',
    equation_latex: 'v = \\frac{1}{n} R^{2/3} S^{1/2}',
    difficulty_level: 'intermediate',
    tags: ['fluid', 'manning', 'open-channel'],
    inputs: [
      { name: 'n', symbol: 'n', description: 'Manning\'s Roughness Coefficient', unit: '', default_value: 0.013, min_value: 0.001, input_order: 1 },
      { name: 'R', symbol: 'R', description: 'Hydraulic Radius', unit: 'm', default_value: 0.5, min_value: 0.01, input_order: 2 },
      { name: 'S', symbol: 'S', description: 'Channel Slope', unit: 'm/m', default_value: 0.001, min_value: 0.0001, input_order: 3 }
    ],
    outputs: [
      { name: 'v', symbol: 'v', description: 'Flow Velocity', unit: 'm/s', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_fluid_hydraulic_radius',
    name: 'Hydraulic Radius',
    description: 'Calculate hydraulic radius for open channel',
    domain: 'mechanical',
    category_slug: 'fluid-mechanics',
    equation: 'R = A / P',
    equation_latex: 'R = \\frac{A}{P}',
    difficulty_level: 'beginner',
    tags: ['fluid', 'hydraulic-radius', 'channel'],
    inputs: [
      { name: 'A', symbol: 'A', description: 'Cross-Sectional Area', unit: 'm²', default_value: 2, min_value: 0.001, input_order: 1 },
      { name: 'P', symbol: 'P', description: 'Wetted Perimeter', unit: 'm', default_value: 4, min_value: 0.01, input_order: 2 }
    ],
    outputs: [
      { name: 'R', symbol: 'R', description: 'Hydraulic Radius', unit: 'm', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_fluid_orifice',
    name: 'Orifice Flow',
    description: 'Flow through an orifice',
    domain: 'mechanical',
    category_slug: 'fluid-mechanics',
    equation: 'Q = Cd * A * sqrt(2 * g * h)',
    equation_latex: 'Q = C_d A \\sqrt{2gh}',
    difficulty_level: 'intermediate',
    tags: ['fluid', 'orifice', 'flow'],
    inputs: [
      { name: 'Cd', symbol: 'C_d', description: 'Discharge Coefficient', unit: '', default_value: 0.62, min_value: 0.1, max_value: 1, input_order: 1 },
      { name: 'A', symbol: 'A', description: 'Orifice Area', unit: 'm²', default_value: 0.01, min_value: 0.0001, input_order: 2 },
      { name: 'g', symbol: 'g', description: 'Gravity', unit: 'm/s²', default_value: 9.81, min_value: 0.1, input_order: 3 },
      { name: 'h', symbol: 'h', description: 'Head', unit: 'm', default_value: 5, min_value: 0.01, input_order: 4 }
    ],
    outputs: [
      { name: 'Q', symbol: 'Q', description: 'Flow Rate', unit: 'm³/s', output_order: 1, precision: 5 }
    ]
  },
  {
    equation_id: 'eq_fluid_venturi',
    name: 'Venturi Meter Flow',
    description: 'Flow measurement using venturi meter',
    domain: 'mechanical',
    category_slug: 'fluid-mechanics',
    equation: 'Q = Cd * A2 * sqrt((2 * (P1 - P2)) / (rho * (1 - (A2/A1)^2)))',
    equation_latex: 'Q = C_d A_2 \\sqrt{\\frac{2(P_1 - P_2)}{\\rho(1 - (A_2/A_1)^2)}}',
    difficulty_level: 'advanced',
    tags: ['fluid', 'venturi', 'flow-measurement'],
    inputs: [
      { name: 'Cd', symbol: 'C_d', description: 'Discharge Coefficient', unit: '', default_value: 0.98, min_value: 0.1, max_value: 1, input_order: 1 },
      { name: 'A1', symbol: 'A₁', description: 'Inlet Area', unit: 'm²', default_value: 0.02, min_value: 0.0001, input_order: 2 },
      { name: 'A2', symbol: 'A₂', description: 'Throat Area', unit: 'm²', default_value: 0.01, min_value: 0.0001, input_order: 3 },
      { name: 'P1', symbol: 'P₁', description: 'Inlet Pressure', unit: 'Pa', default_value: 200000, min_value: 1000, input_order: 4 },
      { name: 'P2', symbol: 'P₂', description: 'Throat Pressure', unit: 'Pa', default_value: 150000, min_value: 1000, input_order: 5 },
      { name: 'rho', symbol: 'ρ', description: 'Fluid Density', unit: 'kg/m³', default_value: 1000, min_value: 0.1, input_order: 6 }
    ],
    outputs: [
      { name: 'Q', symbol: 'Q', description: 'Flow Rate', unit: 'm³/s', output_order: 1, precision: 5 }
    ]
  },
  {
    equation_id: 'eq_fluid_pump_power',
    name: 'Pump Power',
    description: 'Power required by pump',
    domain: 'mechanical',
    category_slug: 'fluid-mechanics',
    equation: 'P = (rho * g * Q * H) / eta',
    equation_latex: 'P = \\frac{\\rho g Q H}{\\eta}',
    difficulty_level: 'intermediate',
    tags: ['fluid', 'pump', 'power'],
    inputs: [
      { name: 'rho', symbol: 'ρ', description: 'Fluid Density', unit: 'kg/m³', default_value: 1000, min_value: 0.1, input_order: 1 },
      { name: 'g', symbol: 'g', description: 'Gravity', unit: 'm/s²', default_value: 9.81, min_value: 0.1, input_order: 2 },
      { name: 'Q', symbol: 'Q', description: 'Flow Rate', unit: 'm³/s', default_value: 0.05, min_value: 0.0001, input_order: 3 },
      { name: 'H', symbol: 'H', description: 'Head', unit: 'm', default_value: 30, min_value: 0.1, input_order: 4 },
      { name: 'eta', symbol: 'η', description: 'Pump Efficiency', unit: '', default_value: 0.75, min_value: 0.1, max_value: 1, input_order: 5 }
    ],
    outputs: [
      { name: 'P', symbol: 'P', description: 'Pump Power', unit: 'W', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_fluid_pump_head',
    name: 'Pump Head',
    description: 'Total dynamic head of pump',
    domain: 'mechanical',
    category_slug: 'fluid-mechanics',
    equation: 'H = H_static + H_friction + H_velocity',
    equation_latex: 'H = H_{static} + H_{friction} + H_{velocity}',
    difficulty_level: 'intermediate',
    tags: ['fluid', 'pump', 'head'],
    inputs: [
      { name: 'H_static', symbol: 'H_s', description: 'Static Head', unit: 'm', default_value: 20, min_value: 0, input_order: 1 },
      { name: 'H_friction', symbol: 'H_f', description: 'Friction Head', unit: 'm', default_value: 5, min_value: 0, input_order: 2 },
      { name: 'H_velocity', symbol: 'H_v', description: 'Velocity Head', unit: 'm', default_value: 1, min_value: 0, input_order: 3 }
    ],
    outputs: [
      { name: 'H', symbol: 'H', description: 'Total Head', unit: 'm', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_fluid_npsH',
    name: 'NPSH Available',
    description: 'Net positive suction head available',
    domain: 'mechanical',
    category_slug: 'fluid-mechanics',
    equation: 'NPSHa = (P_suction - P_vapor) / (rho * g) - h_loss',
    equation_latex: 'NPSH_a = \\frac{P_{suction} - P_{vapor}}{\\rho g} - h_{loss}',
    difficulty_level: 'advanced',
    tags: ['fluid', 'pump', 'npsh'],
    inputs: [
      { name: 'P_suction', symbol: 'P_s', description: 'Suction Pressure', unit: 'Pa', default_value: 101325, min_value: 1000, input_order: 1 },
      { name: 'P_vapor', symbol: 'P_v', description: 'Vapor Pressure', unit: 'Pa', default_value: 2339, min_value: 0, input_order: 2 },
      { name: 'rho', symbol: 'ρ', description: 'Fluid Density', unit: 'kg/m³', default_value: 1000, min_value: 0.1, input_order: 3 },
      { name: 'g', symbol: 'g', description: 'Gravity', unit: 'm/s²', default_value: 9.81, min_value: 0.1, input_order: 4 },
      { name: 'h_loss', symbol: 'h_loss', description: 'Head Loss in Suction', unit: 'm', default_value: 1, min_value: 0, input_order: 5 }
    ],
    outputs: [
      { name: 'NPSHa', symbol: 'NPSH_a', description: 'NPSH Available', unit: 'm', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_fluid_specific_speed',
    name: 'Pump Specific Speed',
    description: 'Dimensionless specific speed for pump selection',
    domain: 'mechanical',
    category_slug: 'fluid-mechanics',
    equation: 'Ns = (N * sqrt(Q)) / H^0.75',
    equation_latex: 'N_s = \\frac{N \\sqrt{Q}}{H^{0.75}}',
    difficulty_level: 'advanced',
    tags: ['fluid', 'pump', 'specific-speed'],
    inputs: [
      { name: 'N', symbol: 'N', description: 'Pump Speed', unit: 'rpm', default_value: 1450, min_value: 100, input_order: 1 },
      { name: 'Q', symbol: 'Q', description: 'Flow Rate', unit: 'm³/s', default_value: 0.05, min_value: 0.001, input_order: 2 },
      { name: 'H', symbol: 'H', description: 'Head', unit: 'm', default_value: 30, min_value: 0.1, input_order: 3 }
    ],
    outputs: [
      { name: 'Ns', symbol: 'N_s', description: 'Specific Speed', unit: '', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_fluid_affinity_law_flow',
    name: 'Affinity Law - Flow',
    description: 'Flow-speed relationship for pumps',
    domain: 'mechanical',
    category_slug: 'fluid-mechanics',
    equation: 'Q2 = Q1 * (N2 / N1)',
    equation_latex: 'Q_2 = Q_1 \\times \\frac{N_2}{N_1}',
    difficulty_level: 'intermediate',
    tags: ['fluid', 'pump', 'affinity'],
    inputs: [
      { name: 'Q1', symbol: 'Q₁', description: 'Original Flow', unit: 'm³/s', default_value: 0.05, min_value: 0.001, input_order: 1 },
      { name: 'N1', symbol: 'N₁', description: 'Original Speed', unit: 'rpm', default_value: 1450, min_value: 100, input_order: 2 },
      { name: 'N2', symbol: 'N₂', description: 'New Speed', unit: 'rpm', default_value: 1750, min_value: 100, input_order: 3 }
    ],
    outputs: [
      { name: 'Q2', symbol: 'Q₂', description: 'New Flow', unit: 'm³/s', output_order: 1, precision: 5 }
    ]
  },
  {
    equation_id: 'eq_fluid_affinity_law_head',
    name: 'Affinity Law - Head',
    description: 'Head-speed relationship for pumps',
    domain: 'mechanical',
    category_slug: 'fluid-mechanics',
    equation: 'H2 = H1 * (N2 / N1)^2',
    equation_latex: 'H_2 = H_1 \\times \\left(\\frac{N_2}{N_1}\\right)^2',
    difficulty_level: 'intermediate',
    tags: ['fluid', 'pump', 'affinity'],
    inputs: [
      { name: 'H1', symbol: 'H₁', description: 'Original Head', unit: 'm', default_value: 30, min_value: 0.1, input_order: 1 },
      { name: 'N1', symbol: 'N₁', description: 'Original Speed', unit: 'rpm', default_value: 1450, min_value: 100, input_order: 2 },
      { name: 'N2', symbol: 'N₂', description: 'New Speed', unit: 'rpm', default_value: 1750, min_value: 100, input_order: 3 }
    ],
    outputs: [
      { name: 'H2', symbol: 'H₂', description: 'New Head', unit: 'm', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_fluid_affinity_law_power',
    name: 'Affinity Law - Power',
    description: 'Power-speed relationship for pumps',
    domain: 'mechanical',
    category_slug: 'fluid-mechanics',
    equation: 'P2 = P1 * (N2 / N1)^3',
    equation_latex: 'P_2 = P_1 \\times \\left(\\frac{N_2}{N_1}\\right)^3',
    difficulty_level: 'intermediate',
    tags: ['fluid', 'pump', 'affinity'],
    inputs: [
      { name: 'P1', symbol: 'P₁', description: 'Original Power', unit: 'kW', default_value: 20, min_value: 0.1, input_order: 1 },
      { name: 'N1', symbol: 'N₁', description: 'Original Speed', unit: 'rpm', default_value: 1450, min_value: 100, input_order: 2 },
      { name: 'N2', symbol: 'N₂', description: 'New Speed', unit: 'rpm', default_value: 1750, min_value: 100, input_order: 3 }
    ],
    outputs: [
      { name: 'P2', symbol: 'P₂', description: 'New Power', unit: 'kW', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_fluid_minor_loss',
    name: 'Minor Loss',
    description: 'Head loss through fittings and valves',
    domain: 'mechanical',
    category_slug: 'fluid-mechanics',
    equation: 'h_m = K * (v^2 / (2*g))',
    equation_latex: 'h_m = K \\times \\frac{v^2}{2g}',
    difficulty_level: 'intermediate',
    tags: ['fluid', 'minor-loss', 'fittings'],
    inputs: [
      { name: 'K', symbol: 'K', description: 'Loss Coefficient', unit: '', default_value: 0.5, min_value: 0, input_order: 1 },
      { name: 'v', symbol: 'v', description: 'Flow Velocity', unit: 'm/s', default_value: 2, min_value: 0, input_order: 2 },
      { name: 'g', symbol: 'g', description: 'Gravity', unit: 'm/s²', default_value: 9.81, min_value: 0.1, input_order: 3 }
    ],
    outputs: [
      { name: 'h_m', symbol: 'h_m', description: 'Minor Head Loss', unit: 'm', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_fluid_friction_factor_laminar',
    name: 'Friction Factor (Laminar)',
    description: 'Darcy friction factor for laminar flow',
    domain: 'mechanical',
    category_slug: 'fluid-mechanics',
    equation: 'f = 64 / Re',
    equation_latex: 'f = \\frac{64}{Re}',
    difficulty_level: 'beginner',
    tags: ['fluid', 'friction', 'laminar'],
    inputs: [
      { name: 'Re', symbol: 'Re', description: 'Reynolds Number', unit: '', default_value: 1500, min_value: 1, input_order: 1 }
    ],
    outputs: [
      { name: 'f', symbol: 'f', description: 'Friction Factor', unit: '', output_order: 1, precision: 5 }
    ]
  },
  {
    equation_id: 'eq_fluid_velocity_head',
    name: 'Velocity Head',
    description: 'Kinetic energy head of flowing fluid',
    domain: 'mechanical',
    category_slug: 'fluid-mechanics',
    equation: 'H_v = v^2 / (2*g)',
    equation_latex: 'H_v = \\frac{v^2}{2g}',
    difficulty_level: 'beginner',
    tags: ['fluid', 'velocity-head', 'kinetic'],
    inputs: [
      { name: 'v', symbol: 'v', description: 'Flow Velocity', unit: 'm/s', default_value: 3, min_value: 0, input_order: 1 },
      { name: 'g', symbol: 'g', description: 'Gravity', unit: 'm/s²', default_value: 9.81, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'H_v', symbol: 'H_v', description: 'Velocity Head', unit: 'm', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_fluid_pressure_head',
    name: 'Pressure Head',
    description: 'Convert pressure to head',
    domain: 'mechanical',
    category_slug: 'fluid-mechanics',
    equation: 'H_p = P / (rho * g)',
    equation_latex: 'H_p = \\frac{P}{\\rho g}',
    difficulty_level: 'beginner',
    tags: ['fluid', 'pressure-head', 'conversion'],
    inputs: [
      { name: 'P', symbol: 'P', description: 'Pressure', unit: 'Pa', default_value: 100000, min_value: 0, input_order: 1 },
      { name: 'rho', symbol: 'ρ', description: 'Fluid Density', unit: 'kg/m³', default_value: 1000, min_value: 0.1, input_order: 2 },
      { name: 'g', symbol: 'g', description: 'Gravity', unit: 'm/s²', default_value: 9.81, min_value: 0.1, input_order: 3 }
    ],
    outputs: [
      { name: 'H_p', symbol: 'H_p', description: 'Pressure Head', unit: 'm', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_fluid_weir_rectangular',
    name: 'Rectangular Weir Flow',
    description: 'Flow over rectangular weir',
    domain: 'mechanical',
    category_slug: 'fluid-mechanics',
    equation: 'Q = 0.66 * Cd * L * sqrt(2*g) * H^1.5',
    equation_latex: 'Q = 0.66 C_d L \\sqrt{2g} H^{1.5}',
    difficulty_level: 'intermediate',
    tags: ['fluid', 'weir', 'flow'],
    inputs: [
      { name: 'Cd', symbol: 'C_d', description: 'Discharge Coefficient', unit: '', default_value: 0.62, min_value: 0.1, max_value: 1, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Weir Length', unit: 'm', default_value: 2, min_value: 0.1, input_order: 2 },
      { name: 'g', symbol: 'g', description: 'Gravity', unit: 'm/s²', default_value: 9.81, min_value: 0.1, input_order: 3 },
      { name: 'H', symbol: 'H', description: 'Head Over Weir', unit: 'm', default_value: 0.3, min_value: 0.01, input_order: 4 }
    ],
    outputs: [
      { name: 'Q', symbol: 'Q', description: 'Flow Rate', unit: 'm³/s', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_fluid_stokes_law',
    name: 'Stokes\' Law',
    description: 'Terminal velocity of sphere in fluid',
    domain: 'mechanical',
    category_slug: 'fluid-mechanics',
    equation: 'v = (2 * g * (rho_p - rho_f) * r^2) / (9 * mu)',
    equation_latex: 'v = \\frac{2g(\\rho_p - \\rho_f)r^2}{9\\mu}',
    difficulty_level: 'intermediate',
    tags: ['fluid', 'stokes', 'settling'],
    inputs: [
      { name: 'g', symbol: 'g', description: 'Gravity', unit: 'm/s²', default_value: 9.81, min_value: 0.1, input_order: 1 },
      { name: 'rho_p', symbol: 'ρ_p', description: 'Particle Density', unit: 'kg/m³', default_value: 2500, min_value: 0.1, input_order: 2 },
      { name: 'rho_f', symbol: 'ρ_f', description: 'Fluid Density', unit: 'kg/m³', default_value: 1000, min_value: 0.1, input_order: 3 },
      { name: 'r', symbol: 'r', description: 'Particle Radius', unit: 'm', default_value: 0.001, min_value: 0.00001, input_order: 4 },
      { name: 'mu', symbol: 'μ', description: 'Dynamic Viscosity', unit: 'Pa·s', default_value: 0.001, min_value: 0.00001, input_order: 5 }
    ],
    outputs: [
      { name: 'v', symbol: 'v', description: 'Terminal Velocity', unit: 'm/s', output_order: 1, precision: 6 }
    ]
  },
  {
    equation_id: 'eq_fluid_pipe_diameter',
    name: 'Pipe Diameter from Flow',
    description: 'Calculate required pipe diameter',
    domain: 'mechanical',
    category_slug: 'fluid-mechanics',
    equation: 'D = sqrt((4 * Q) / (PI * v))',
    equation_latex: 'D = \\sqrt{\\frac{4Q}{\\pi v}}',
    difficulty_level: 'intermediate',
    tags: ['fluid', 'pipe', 'diameter'],
    inputs: [
      { name: 'Q', symbol: 'Q', description: 'Flow Rate', unit: 'm³/s', default_value: 0.05, min_value: 0.0001, input_order: 1 },
      { name: 'v', symbol: 'v', description: 'Desired Velocity', unit: 'm/s', default_value: 2, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'D', symbol: 'D', description: 'Pipe Diameter', unit: 'm', output_order: 1, precision: 4 }
    ]
  }
];

export default mechanicalBatch1;
