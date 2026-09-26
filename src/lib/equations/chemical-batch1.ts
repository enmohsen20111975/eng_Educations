/**
 * Chemical Engineering Equations - Batch 1
 * Mass Balance, Heat Balance, Reaction Engineering, Separation, Fluid Flow
 * Total: 50 equations
 */

export const chemicalBatch1 = [
  // ============================================
  // MASS BALANCE EQUATIONS (10 equations)
  // ============================================
  
  {
    equation_id: 'eq_chem_mass_balance',
    name: 'General Mass Balance',
    description: 'Conservation of mass in a system',
    domain: 'chemical',
    category_slug: 'mass-balance',
    equation: 'dm/dt = m_in - m_out + m_gen - m_cons',
    equation_latex: '\\frac{dm}{dt} = \\dot{m}_{in} - \\dot{m}_{out} + \\dot{m}_{gen} - \\dot{m}_{cons}',
    difficulty_level: 'beginner',
    tags: ['mass-balance', 'conservation', 'steady-state'],
    inputs: [
      { name: 'm_in', symbol: 'ṁ_in', description: 'Mass Flow In', unit: 'kg/s', default_value: 10, min_value: 0, input_order: 1 },
      { name: 'm_out', symbol: 'ṁ_out', description: 'Mass Flow Out', unit: 'kg/s', default_value: 8, min_value: 0, input_order: 2 },
      { name: 'm_gen', symbol: 'ṁ_gen', description: 'Mass Generated', unit: 'kg/s', default_value: 0, min_value: 0, input_order: 3 },
      { name: 'm_cons', symbol: 'ṁ_cons', description: 'Mass Consumed', unit: 'kg/s', default_value: 0, min_value: 0, input_order: 4 }
    ],
    outputs: [
      { name: 'dm_dt', symbol: 'dm/dt', description: 'Rate of Mass Accumulation', unit: 'kg/s', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_chem_steady_state_mass',
    name: 'Steady-State Mass Balance',
    description: 'Mass balance at steady state',
    domain: 'chemical',
    category_slug: 'mass-balance',
    equation: 'm_in = m_out',
    equation_latex: '\\dot{m}_{in} = \\dot{m}_{out}',
    difficulty_level: 'beginner',
    tags: ['mass-balance', 'steady-state', 'simple'],
    inputs: [
      { name: 'm_in', symbol: 'ṁ_in', description: 'Mass Flow In', unit: 'kg/s', default_value: 10, min_value: 0, input_order: 1 }
    ],
    outputs: [
      { name: 'm_out', symbol: 'ṁ_out', description: 'Mass Flow Out', unit: 'kg/s', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_chem_component_balance',
    name: 'Component Mass Balance',
    description: 'Mass balance for individual component',
    domain: 'chemical',
    category_slug: 'mass-balance',
    equation: 'V * dC/dt = F_in * C_in - F_out * C_out + r * V',
    equation_latex: 'V\\frac{dC}{dt} = F_{in}C_{in} - F_{out}C_{out} + rV',
    difficulty_level: 'intermediate',
    tags: ['mass-balance', 'component', 'reactor'],
    inputs: [
      { name: 'V', symbol: 'V', description: 'Volume', unit: 'm³', default_value: 10, min_value: 0.1, input_order: 1 },
      { name: 'F_in', symbol: 'F_in', description: 'Inlet Flow Rate', unit: 'm³/s', default_value: 0.1, min_value: 0, input_order: 2 },
      { name: 'C_in', symbol: 'C_in', description: 'Inlet Concentration', unit: 'kg/m³', default_value: 50, min_value: 0, input_order: 3 },
      { name: 'F_out', symbol: 'F_out', description: 'Outlet Flow Rate', unit: 'm³/s', default_value: 0.1, min_value: 0, input_order: 4 },
      { name: 'C_out', symbol: 'C_out', description: 'Outlet Concentration', unit: 'kg/m³', default_value: 30, min_value: 0, input_order: 5 },
      { name: 'r', symbol: 'r', description: 'Reaction Rate', unit: 'kg/(m³·s)', default_value: 0.5, min_value: 0, input_order: 6 }
    ],
    outputs: [
      { name: 'dC_dt', symbol: 'dC/dt', description: 'Rate of Concentration Change', unit: 'kg/(m³·s)', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_chem_mole_fraction',
    name: 'Mole Fraction',
    description: 'Mole fraction of component in mixture',
    domain: 'chemical',
    category_slug: 'mass-balance',
    equation: 'x_i = n_i / n_total',
    equation_latex: 'x_i = \\frac{n_i}{n_{total}}',
    difficulty_level: 'beginner',
    tags: ['mass-balance', 'mole', 'fraction'],
    inputs: [
      { name: 'n_i', symbol: 'n_i', description: 'Moles of Component', unit: 'mol', default_value: 2, min_value: 0, input_order: 1 },
      { name: 'n_total', symbol: 'n_total', description: 'Total Moles', unit: 'mol', default_value: 10, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'x_i', symbol: 'x_i', description: 'Mole Fraction', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_chem_mass_fraction',
    name: 'Mass Fraction',
    description: 'Mass fraction of component in mixture',
    domain: 'chemical',
    category_slug: 'mass-balance',
    equation: 'w_i = m_i / m_total',
    equation_latex: 'w_i = \\frac{m_i}{m_{total}}',
    difficulty_level: 'beginner',
    tags: ['mass-balance', 'mass', 'fraction'],
    inputs: [
      { name: 'm_i', symbol: 'm_i', description: 'Mass of Component', unit: 'kg', default_value: 5, min_value: 0, input_order: 1 },
      { name: 'm_total', symbol: 'm_total', description: 'Total Mass', unit: 'kg', default_value: 20, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'w_i', symbol: 'w_i', description: 'Mass Fraction', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_chem_conversion',
    name: 'Conversion',
    description: 'Fraction of reactant converted',
    domain: 'chemical',
    category_slug: 'mass-balance',
    equation: 'X = (N_A0 - N_A) / N_A0',
    equation_latex: 'X = \\frac{N_{A0} - N_A}{N_{A0}}',
    difficulty_level: 'beginner',
    tags: ['mass-balance', 'conversion', 'reactor'],
    inputs: [
      { name: 'N_A0', symbol: 'N_A0', description: 'Initial Moles of A', unit: 'mol', default_value: 100, min_value: 0.1, input_order: 1 },
      { name: 'N_A', symbol: 'N_A', description: 'Final Moles of A', unit: 'mol', default_value: 20, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'X', symbol: 'X', description: 'Conversion', unit: '', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_chem_yield',
    name: 'Yield',
    description: 'Actual yield vs theoretical yield',
    domain: 'chemical',
    category_slug: 'mass-balance',
    equation: 'Y = m_actual / m_theoretical',
    equation_latex: 'Y = \\frac{m_{actual}}{m_{theoretical}}',
    difficulty_level: 'beginner',
    tags: ['mass-balance', 'yield', 'reaction'],
    inputs: [
      { name: 'm_actual', symbol: 'm_actual', description: 'Actual Mass Produced', unit: 'kg', default_value: 45, min_value: 0, input_order: 1 },
      { name: 'm_theoretical', symbol: 'm_theoretical', description: 'Theoretical Mass', unit: 'kg', default_value: 50, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'Y', symbol: 'Y', description: 'Yield', unit: '', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_chem_selectivity',
    name: 'Selectivity',
    description: 'Ratio of desired product to byproduct',
    domain: 'chemical',
    category_slug: 'mass-balance',
    equation: 'S = N_D / N_U',
    equation_latex: 'S = \\frac{N_D}{N_U}',
    difficulty_level: 'intermediate',
    tags: ['mass-balance', 'selectivity', 'reaction'],
    inputs: [
      { name: 'N_D', symbol: 'N_D', description: 'Moles of Desired Product', unit: 'mol', default_value: 80, min_value: 0, input_order: 1 },
      { name: 'N_U', symbol: 'N_U', description: 'Moles of Undesired Product', unit: 'mol', default_value: 20, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'S', symbol: 'S', description: 'Selectivity', unit: '', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_chem_stoichiometric_ratio',
    name: 'Stoichiometric Ratio',
    description: 'Molar ratio from stoichiometry',
    domain: 'chemical',
    category_slug: 'mass-balance',
    equation: 'n_B = n_A * (nu_B / nu_A)',
    equation_latex: 'n_B = n_A \\times \\frac{\\nu_B}{\\nu_A}',
    difficulty_level: 'beginner',
    tags: ['mass-balance', 'stoichiometry', 'ratio'],
    inputs: [
      { name: 'n_A', symbol: 'n_A', description: 'Moles of A', unit: 'mol', default_value: 10, min_value: 0, input_order: 1 },
      { name: 'nu_A', symbol: 'ν_A', description: 'Stoichiometric Coefficient A', unit: '', default_value: 2, min_value: 1, input_order: 2 },
      { name: 'nu_B', symbol: 'ν_B', description: 'Stoichiometric Coefficient B', unit: '', default_value: 1, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'n_B', symbol: 'n_B', description: 'Moles of B Required/Produced', unit: 'mol', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_chem_limiting_reactant',
    name: 'Limiting Reactant Excess',
    description: 'Percentage excess of reactant',
    domain: 'chemical',
    category_slug: 'mass-balance',
    equation: 'excess = ((n_supplied - n_required) / n_required) * 100',
    equation_latex: '\\% excess = \\frac{n_{supplied} - n_{required}}{n_{required}} \\times 100',
    difficulty_level: 'intermediate',
    tags: ['mass-balance', 'limiting', 'excess'],
    inputs: [
      { name: 'n_supplied', symbol: 'n_supplied', description: 'Moles Supplied', unit: 'mol', default_value: 15, min_value: 0, input_order: 1 },
      { name: 'n_required', symbol: 'n_required', description: 'Moles Required', unit: 'mol', default_value: 10, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'excess', symbol: '% excess', description: 'Percentage Excess', unit: '%', output_order: 1, precision: 1 }
    ]
  },

  // ============================================
  // ENERGY BALANCE EQUATIONS (10 equations)
  // ============================================
  
  {
    equation_id: 'eq_chem_energy_balance',
    name: 'General Energy Balance',
    description: 'First law of thermodynamics for open system',
    domain: 'chemical',
    category_slug: 'energy-balance',
    equation: 'dE/dt = Q - W + sum(m_i * H_i) - sum(m_o * H_o)',
    equation_latex: '\\frac{dE}{dt} = \\dot{Q} - \\dot{W} + \\sum \\dot{m}_i H_i - \\sum \\dot{m}_o H_o',
    difficulty_level: 'advanced',
    tags: ['energy-balance', 'thermodynamics', 'open-system'],
    inputs: [
      { name: 'Q', symbol: 'Q̇', description: 'Heat Transfer Rate', unit: 'W', default_value: 5000, input_order: 1 },
      { name: 'W', symbol: 'Ẇ', description: 'Work Rate', unit: 'W', default_value: 1000, input_order: 2 },
      { name: 'm_in_H_in', symbol: 'ΣṁᵢHᵢ', description: 'Sum of Inlet Enthalpy Flows', unit: 'W', default_value: 10000, input_order: 3 },
      { name: 'm_out_H_out', symbol: 'ΣṁₒHₒ', description: 'Sum of Outlet Enthalpy Flows', unit: 'W', default_value: 12000, input_order: 4 }
    ],
    outputs: [
      { name: 'dE_dt', symbol: 'dE/dt', description: 'Rate of Energy Change', unit: 'W', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_chem_sensible_heat',
    name: 'Sensible Heat',
    description: 'Heat required to change temperature',
    domain: 'chemical',
    category_slug: 'energy-balance',
    equation: 'Q = m * Cp * delta_T',
    equation_latex: 'Q = m C_p \\Delta T',
    difficulty_level: 'beginner',
    tags: ['energy-balance', 'sensible-heat', 'temperature'],
    inputs: [
      { name: 'm', symbol: 'm', description: 'Mass', unit: 'kg', default_value: 100, min_value: 0, input_order: 1 },
      { name: 'Cp', symbol: 'C_p', description: 'Specific Heat Capacity', unit: 'J/(kg·K)', default_value: 4186, min_value: 1, input_order: 2 },
      { name: 'delta_T', symbol: 'ΔT', description: 'Temperature Change', unit: 'K', default_value: 50, min_value: 0, input_order: 3 }
    ],
    outputs: [
      { name: 'Q', symbol: 'Q', description: 'Heat Required', unit: 'J', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_chem_latent_heat_vaporization',
    name: 'Latent Heat of Vaporization',
    description: 'Heat required for phase change',
    domain: 'chemical',
    category_slug: 'energy-balance',
    equation: 'Q = m * lambda_v',
    equation_latex: 'Q = m \\lambda_v',
    difficulty_level: 'beginner',
    tags: ['energy-balance', 'latent-heat', 'phase-change'],
    inputs: [
      { name: 'm', symbol: 'm', description: 'Mass', unit: 'kg', default_value: 10, min_value: 0, input_order: 1 },
      { name: 'lambda_v', symbol: 'λ_v', description: 'Latent Heat of Vaporization', unit: 'J/kg', default_value: 2260000, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'Q', symbol: 'Q', description: 'Heat Required', unit: 'J', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_chem_heat_reaction',
    name: 'Heat of Reaction',
    description: 'Enthalpy change for reaction',
    domain: 'chemical',
    category_slug: 'energy-balance',
    equation: 'delta_H_rxn = sum(nu_P * H_f_P) - sum(nu_R * H_f_R)',
    equation_latex: '\\Delta H_{rxn} = \\sum \\nu_P H_{f,P} - \\sum \\nu_R H_{f,R}',
    difficulty_level: 'intermediate',
    tags: ['energy-balance', 'heat-reaction', 'enthalpy'],
    inputs: [
      { name: 'H_f_products', symbol: 'ΣνₚH_f,P', description: 'Sum of Product Formation Enthalpies', unit: 'kJ/mol', default_value: -500, input_order: 1 },
      { name: 'H_f_reactants', symbol: 'ΣνᵣH_f,R', description: 'Sum of Reactant Formation Enthalpies', unit: 'kJ/mol', default_value: -200, input_order: 2 }
    ],
    outputs: [
      { name: 'delta_H_rxn', symbol: 'ΔH_rxn', description: 'Heat of Reaction', unit: 'kJ/mol', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_chem_adiabatic_temp',
    name: 'Adiabatic Flame Temperature',
    description: 'Maximum temperature in adiabatic reaction',
    domain: 'chemical',
    category_slug: 'energy-balance',
    equation: 'T_ad = T_0 + (-delta_H_rxn) / Cp_avg',
    equation_latex: 'T_{ad} = T_0 + \\frac{-\\Delta H_{rxn}}{C_{p,avg}}',
    difficulty_level: 'advanced',
    tags: ['energy-balance', 'adiabatic', 'flame-temperature'],
    inputs: [
      { name: 'T_0', symbol: 'T_0', description: 'Initial Temperature', unit: 'K', default_value: 298, min_value: 0, input_order: 1 },
      { name: 'delta_H_rxn', symbol: 'ΔH_rxn', description: 'Heat of Reaction', unit: 'kJ/mol', default_value: -800, input_order: 2 },
      { name: 'Cp_avg', symbol: 'C_p,avg', description: 'Average Heat Capacity', unit: 'kJ/(mol·K)', default_value: 0.05, min_value: 0.001, input_order: 3 }
    ],
    outputs: [
      { name: 'T_ad', symbol: 'T_ad', description: 'Adiabatic Temperature', unit: 'K', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_chem_heat_duty',
    name: 'Heat Exchanger Duty',
    description: 'Heat transfer in heat exchanger',
    domain: 'chemical',
    category_slug: 'energy-balance',
    equation: 'Q = m_hot * Cp_hot * (T_hot_in - T_hot_out)',
    equation_latex: 'Q = \\dot{m}_{hot} C_{p,hot} (T_{hot,in} - T_{hot,out})',
    difficulty_level: 'intermediate',
    tags: ['energy-balance', 'heat-exchanger', 'duty'],
    inputs: [
      { name: 'm_hot', symbol: 'ṁ_hot', description: 'Hot Stream Mass Flow', unit: 'kg/s', default_value: 5, min_value: 0, input_order: 1 },
      { name: 'Cp_hot', symbol: 'C_p,hot', description: 'Hot Stream Heat Capacity', unit: 'J/(kg·K)', default_value: 4000, min_value: 1, input_order: 2 },
      { name: 'T_hot_in', symbol: 'T_hot,in', description: 'Hot Inlet Temperature', unit: 'K', default_value: 373, min_value: 0, input_order: 3 },
      { name: 'T_hot_out', symbol: 'T_hot,out', description: 'Hot Outlet Temperature', unit: 'K', default_value: 323, min_value: 0, input_order: 4 }
    ],
    outputs: [
      { name: 'Q', symbol: 'Q', description: 'Heat Duty', unit: 'W', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_chem_enthalpy_change',
    name: 'Enthalpy Change',
    description: 'Change in enthalpy for process',
    domain: 'chemical',
    category_slug: 'energy-balance',
    equation: 'delta_H = H_final - H_initial',
    equation_latex: '\\Delta H = H_{final} - H_{initial}',
    difficulty_level: 'beginner',
    tags: ['energy-balance', 'enthalpy', 'change'],
    inputs: [
      { name: 'H_final', symbol: 'H_final', description: 'Final Enthalpy', unit: 'kJ', default_value: 500, input_order: 1 },
      { name: 'H_initial', symbol: 'H_initial', description: 'Initial Enthalpy', unit: 'kJ', default_value: 200, input_order: 2 }
    ],
    outputs: [
      { name: 'delta_H', symbol: 'ΔH', description: 'Enthalpy Change', unit: 'kJ', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_chem_work_isentropic',
    name: 'Isentropic Work',
    description: 'Work for isentropic compression/expansion',
    domain: 'chemical',
    category_slug: 'energy-balance',
    equation: 'W_s = (gamma / (gamma - 1)) * P1 * V1 * ((P2/P1)^((gamma-1)/gamma) - 1)',
    equation_latex: 'W_s = \\frac{\\gamma}{\\gamma-1} P_1 V_1 \\left[\\left(\\frac{P_2}{P_1}\\right)^{\\frac{\\gamma-1}{\\gamma}} - 1\\right]',
    difficulty_level: 'advanced',
    tags: ['energy-balance', 'isentropic', 'compression'],
    inputs: [
      { name: 'gamma', symbol: 'γ', description: 'Heat Capacity Ratio', unit: '', default_value: 1.4, min_value: 1, input_order: 1 },
      { name: 'P1', symbol: 'P₁', description: 'Initial Pressure', unit: 'Pa', default_value: 101325, min_value: 1, input_order: 2 },
      { name: 'V1', symbol: 'V₁', description: 'Initial Volume', unit: 'm³', default_value: 0.1, min_value: 0.001, input_order: 3 },
      { name: 'P2', symbol: 'P₂', description: 'Final Pressure', unit: 'Pa', default_value: 500000, min_value: 1, input_order: 4 }
    ],
    outputs: [
      { name: 'W_s', symbol: 'W_s', description: 'Isentropic Work', unit: 'J', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_chem_efficiency_thermal',
    name: 'Thermal Efficiency',
    description: 'Efficiency of heat engine',
    domain: 'chemical',
    category_slug: 'energy-balance',
    equation: 'eta = W_net / Q_in',
    equation_latex: '\\eta = \\frac{W_{net}}{Q_{in}}',
    difficulty_level: 'beginner',
    tags: ['energy-balance', 'efficiency', 'thermal'],
    inputs: [
      { name: 'W_net', symbol: 'W_net', description: 'Net Work Output', unit: 'J', default_value: 500, min_value: 0, input_order: 1 },
      { name: 'Q_in', symbol: 'Q_in', description: 'Heat Input', unit: 'J', default_value: 1000, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'eta', symbol: 'η', description: 'Thermal Efficiency', unit: '', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_chem_carnot_efficiency',
    name: 'Carnot Efficiency',
    description: 'Maximum theoretical efficiency',
    domain: 'chemical',
    category_slug: 'energy-balance',
    equation: 'eta_c = 1 - T_cold / T_hot',
    equation_latex: '\\eta_c = 1 - \\frac{T_{cold}}{T_{hot}}',
    difficulty_level: 'intermediate',
    tags: ['energy-balance', 'carnot', 'efficiency'],
    inputs: [
      { name: 'T_cold', symbol: 'T_cold', description: 'Cold Reservoir Temperature', unit: 'K', default_value: 300, min_value: 1, input_order: 1 },
      { name: 'T_hot', symbol: 'T_hot', description: 'Hot Reservoir Temperature', unit: 'K', default_value: 600, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'eta_c', symbol: 'η_c', description: 'Carnot Efficiency', unit: '', output_order: 1, precision: 3 }
    ]
  },

  // ============================================
  // REACTION ENGINEERING EQUATIONS (15 equations)
  // ============================================
  
  {
    equation_id: 'eq_chem_rate_zero_order',
    name: 'Zero Order Reaction Rate',
    description: 'Rate equation for zero order reaction',
    domain: 'chemical',
    category_slug: 'reaction-engineering',
    equation: 'r_A = k',
    equation_latex: 'r_A = k',
    difficulty_level: 'beginner',
    tags: ['reaction', 'kinetics', 'zero-order'],
    inputs: [
      { name: 'k', symbol: 'k', description: 'Rate Constant', unit: 'mol/(m³·s)', default_value: 0.5, min_value: 0, input_order: 1 }
    ],
    outputs: [
      { name: 'r_A', symbol: 'r_A', description: 'Reaction Rate', unit: 'mol/(m³·s)', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_chem_rate_first_order',
    name: 'First Order Reaction Rate',
    description: 'Rate equation for first order reaction',
    domain: 'chemical',
    category_slug: 'reaction-engineering',
    equation: 'r_A = k * C_A',
    equation_latex: 'r_A = k C_A',
    difficulty_level: 'beginner',
    tags: ['reaction', 'kinetics', 'first-order'],
    inputs: [
      { name: 'k', symbol: 'k', description: 'Rate Constant', unit: '1/s', default_value: 0.1, min_value: 0, input_order: 1 },
      { name: 'C_A', symbol: 'C_A', description: 'Concentration of A', unit: 'mol/m³', default_value: 50, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'r_A', symbol: 'r_A', description: 'Reaction Rate', unit: 'mol/(m³·s)', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_chem_rate_second_order',
    name: 'Second Order Reaction Rate',
    description: 'Rate equation for second order reaction',
    domain: 'chemical',
    category_slug: 'reaction-engineering',
    equation: 'r_A = k * C_A^2',
    equation_latex: 'r_A = k C_A^2',
    difficulty_level: 'beginner',
    tags: ['reaction', 'kinetics', 'second-order'],
    inputs: [
      { name: 'k', symbol: 'k', description: 'Rate Constant', unit: 'm³/(mol·s)', default_value: 0.01, min_value: 0, input_order: 1 },
      { name: 'C_A', symbol: 'C_A', description: 'Concentration of A', unit: 'mol/m³', default_value: 50, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'r_A', symbol: 'r_A', description: 'Reaction Rate', unit: 'mol/(m³·s)', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_chem_arrhenius',
    name: 'Arrhenius Equation',
    description: 'Temperature dependence of rate constant',
    domain: 'chemical',
    category_slug: 'reaction-engineering',
    equation: 'k = A * exp(-E_a / (R * T))',
    equation_latex: 'k = A e^{-\\frac{E_a}{RT}}',
    difficulty_level: 'intermediate',
    tags: ['reaction', 'arrhenius', 'kinetics'],
    inputs: [
      { name: 'A', symbol: 'A', description: 'Pre-exponential Factor', unit: '1/s', default_value: 1e10, min_value: 1, input_order: 1 },
      { name: 'E_a', symbol: 'E_a', description: 'Activation Energy', unit: 'J/mol', default_value: 75000, min_value: 1, input_order: 2 },
      { name: 'R', symbol: 'R', description: 'Gas Constant', unit: 'J/(mol·K)', default_value: 8.314, min_value: 1, input_order: 3 },
      { name: 'T', symbol: 'T', description: 'Temperature', unit: 'K', default_value: 400, min_value: 1, input_order: 4 }
    ],
    outputs: [
      { name: 'k', symbol: 'k', description: 'Rate Constant', unit: '1/s', output_order: 1, precision: 6 }
    ]
  },
  {
    equation_id: 'eq_chem_cstr_design',
    name: 'CSTR Design Equation',
    description: 'Volume for continuous stirred tank reactor',
    domain: 'chemical',
    category_slug: 'reaction-engineering',
    equation: 'V = F_A0 * X / (-r_A)',
    equation_latex: 'V = \\frac{F_{A0} X}{-r_A}',
    difficulty_level: 'intermediate',
    tags: ['reaction', 'cstr', 'reactor-design'],
    inputs: [
      { name: 'F_A0', symbol: 'F_A0', description: 'Inlet Molar Flow of A', unit: 'mol/s', default_value: 10, min_value: 0.001, input_order: 1 },
      { name: 'X', symbol: 'X', description: 'Conversion', unit: '', default_value: 0.8, min_value: 0, max_value: 1, input_order: 2 },
      { name: 'r_A', symbol: 'r_A', description: 'Reaction Rate', unit: 'mol/(m³·s)', default_value: 0.5, min_value: 0.001, input_order: 3 }
    ],
    outputs: [
      { name: 'V', symbol: 'V', description: 'Reactor Volume', unit: 'm³', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_chem_pfr_design',
    name: 'PFR Design Equation',
    description: 'Volume for plug flow reactor',
    domain: 'chemical',
    category_slug: 'reaction-engineering',
    equation: 'V = F_A0 * integral(dX / (-r_A))',
    equation_latex: 'V = F_{A0} \\int_0^X \\frac{dX}{-r_A}',
    difficulty_level: 'advanced',
    tags: ['reaction', 'pfr', 'reactor-design'],
    inputs: [
      { name: 'F_A0', symbol: 'F_A0', description: 'Inlet Molar Flow of A', unit: 'mol/s', default_value: 10, min_value: 0.001, input_order: 1 },
      { name: 'X', symbol: 'X', description: 'Conversion', unit: '', default_value: 0.8, min_value: 0, max_value: 1, input_order: 2 },
      { name: 'r_A_avg', symbol: 'r_A,avg', description: 'Average Reaction Rate', unit: 'mol/(m³·s)', default_value: 1, min_value: 0.001, input_order: 3 }
    ],
    outputs: [
      { name: 'V', symbol: 'V', description: 'Reactor Volume', unit: 'm³', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_chem_batch_reactor',
    name: 'Batch Reactor Time',
    description: 'Time required for batch reaction',
    domain: 'chemical',
    category_slug: 'reaction-engineering',
    equation: 't = N_A0 * integral(dX / (-r_A * V))',
    equation_latex: 't = N_{A0} \\int_0^X \\frac{dX}{-r_A V}',
    difficulty_level: 'intermediate',
    tags: ['reaction', 'batch', 'reactor-design'],
    inputs: [
      { name: 'N_A0', symbol: 'N_A0', description: 'Initial Moles of A', unit: 'mol', default_value: 100, min_value: 0.1, input_order: 1 },
      { name: 'X', symbol: 'X', description: 'Conversion', unit: '', default_value: 0.9, min_value: 0, max_value: 1, input_order: 2 },
      { name: 'r_A', symbol: 'r_A', description: 'Reaction Rate', unit: 'mol/(m³·s)', default_value: 0.1, min_value: 0.001, input_order: 3 },
      { name: 'V', symbol: 'V', description: 'Reactor Volume', unit: 'm³', default_value: 1, min_value: 0.01, input_order: 4 }
    ],
    outputs: [
      { name: 't', symbol: 't', description: 'Reaction Time', unit: 's', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_chem_half_life_first',
    name: 'Half-Life (First Order)',
    description: 'Half-life for first order reaction',
    domain: 'chemical',
    category_slug: 'reaction-engineering',
    equation: 't_half = ln(2) / k',
    equation_latex: 't_{1/2} = \\frac{\\ln(2)}{k}',
    difficulty_level: 'beginner',
    tags: ['reaction', 'half-life', 'first-order'],
    inputs: [
      { name: 'k', symbol: 'k', description: 'Rate Constant', unit: '1/s', default_value: 0.01, min_value: 0.0001, input_order: 1 }
    ],
    outputs: [
      { name: 't_half', symbol: 't_1/2', description: 'Half-Life', unit: 's', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_chem_half_life_second',
    name: 'Half-Life (Second Order)',
    description: 'Half-life for second order reaction',
    domain: 'chemical',
    category_slug: 'reaction-engineering',
    equation: 't_half = 1 / (k * C_A0)',
    equation_latex: 't_{1/2} = \\frac{1}{k C_{A0}}',
    difficulty_level: 'intermediate',
    tags: ['reaction', 'half-life', 'second-order'],
    inputs: [
      { name: 'k', symbol: 'k', description: 'Rate Constant', unit: 'm³/(mol·s)', default_value: 0.01, min_value: 0.0001, input_order: 1 },
      { name: 'C_A0', symbol: 'C_A0', description: 'Initial Concentration', unit: 'mol/m³', default_value: 50, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 't_half', symbol: 't_1/2', description: 'Half-Life', unit: 's', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_chem_space_time',
    name: 'Space Time',
    description: 'Residence time in reactor',
    domain: 'chemical',
    category_slug: 'reaction-engineering',
    equation: 'tau = V / v_0',
    equation_latex: '\\tau = \\frac{V}{v_0}',
    difficulty_level: 'beginner',
    tags: ['reaction', 'space-time', 'residence'],
    inputs: [
      { name: 'V', symbol: 'V', description: 'Reactor Volume', unit: 'm³', default_value: 10, min_value: 0.01, input_order: 1 },
      { name: 'v_0', symbol: 'v_0', description: 'Volumetric Flow Rate', unit: 'm³/s', default_value: 0.1, min_value: 0.001, input_order: 2 }
    ],
    outputs: [
      { name: 'tau', symbol: 'τ', description: 'Space Time', unit: 's', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_chem_space_velocity',
    name: 'Space Velocity',
    description: 'Inverse of space time',
    domain: 'chemical',
    category_slug: 'reaction-engineering',
    equation: 'SV = v_0 / V',
    equation_latex: 'SV = \\frac{v_0}{V}',
    difficulty_level: 'beginner',
    tags: ['reaction', 'space-velocity', 'flow'],
    inputs: [
      { name: 'v_0', symbol: 'v_0', description: 'Volumetric Flow Rate', unit: 'm³/s', default_value: 0.1, min_value: 0.001, input_order: 1 },
      { name: 'V', symbol: 'V', description: 'Reactor Volume', unit: 'm³', default_value: 10, min_value: 0.01, input_order: 2 }
    ],
    outputs: [
      { name: 'SV', symbol: 'SV', description: 'Space Velocity', unit: '1/s', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_chem_equilibrium_constant',
    name: 'Equilibrium Constant',
    description: 'K from Gibbs free energy',
    domain: 'chemical',
    category_slug: 'reaction-engineering',
    equation: 'K = exp(-delta_G / (R * T))',
    equation_latex: 'K = e^{-\\frac{\\Delta G}{RT}}',
    difficulty_level: 'intermediate',
    tags: ['reaction', 'equilibrium', 'gibbs'],
    inputs: [
      { name: 'delta_G', symbol: 'ΔG', description: 'Gibbs Free Energy Change', unit: 'J/mol', default_value: -50000, input_order: 1 },
      { name: 'R', symbol: 'R', description: 'Gas Constant', unit: 'J/(mol·K)', default_value: 8.314, min_value: 1, input_order: 2 },
      { name: 'T', symbol: 'T', description: 'Temperature', unit: 'K', default_value: 298, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'K', symbol: 'K', description: 'Equilibrium Constant', unit: '', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_chem_vant_hoff',
    name: 'Van\'t Hoff Equation',
    description: 'Temperature dependence of equilibrium constant',
    domain: 'chemical',
    category_slug: 'reaction-engineering',
    equation: 'ln(K2/K1) = (-delta_H/R) * (1/T2 - 1/T1)',
    equation_latex: '\\ln\\frac{K_2}{K_1} = \\frac{-\\Delta H}{R}\\left(\\frac{1}{T_2} - \\frac{1}{T_1}\\right)',
    difficulty_level: 'advanced',
    tags: ['reaction', 'equilibrium', 'vant-hoff'],
    inputs: [
      { name: 'K1', symbol: 'K₁', description: 'Equilibrium Constant at T1', unit: '', default_value: 10, min_value: 0.001, input_order: 1 },
      { name: 'delta_H', symbol: 'ΔH', description: 'Enthalpy Change', unit: 'J/mol', default_value: -50000, input_order: 2 },
      { name: 'R', symbol: 'R', description: 'Gas Constant', unit: 'J/(mol·K)', default_value: 8.314, min_value: 1, input_order: 3 },
      { name: 'T1', symbol: 'T₁', description: 'Temperature 1', unit: 'K', default_value: 298, min_value: 1, input_order: 4 },
      { name: 'T2', symbol: 'T₂', description: 'Temperature 2', unit: 'K', default_value: 350, min_value: 1, input_order: 5 }
    ],
    outputs: [
      { name: 'K2', symbol: 'K₂', description: 'Equilibrium Constant at T2', unit: '', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_chem_reactor_ratio',
    name: 'CSTR/PFR Volume Ratio',
    description: 'Ratio of CSTR to PFR volume for same conversion',
    domain: 'chemical',
    category_slug: 'reaction-engineering',
    equation: 'V_cstr / V_pfr = (X / -r_A_out) / integral(dX / -r_A)',
    equation_latex: '\\frac{V_{CSTR}}{V_{PFR}} = \\frac{X / -r_{A,out}}{\\int dX / -r_A}',
    difficulty_level: 'advanced',
    tags: ['reaction', 'cstr', 'pfr', 'comparison'],
    inputs: [
      { name: 'X', symbol: 'X', description: 'Conversion', unit: '', default_value: 0.8, min_value: 0, max_value: 1, input_order: 1 },
      { name: 'r_A_out', symbol: 'r_A,out', description: 'Outlet Reaction Rate', unit: 'mol/(m³·s)', default_value: 0.2, min_value: 0.001, input_order: 2 },
      { name: 'r_A_avg', symbol: 'r_A,avg', description: 'Average Reaction Rate', unit: 'mol/(m³·s)', default_value: 0.5, min_value: 0.001, input_order: 3 }
    ],
    outputs: [
      { name: 'ratio', symbol: 'V_CSTR/V_PFR', description: 'Volume Ratio', unit: '', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_chem_activation_energy',
    name: 'Activation Energy from Rates',
    description: 'Calculate activation energy from two rate constants',
    domain: 'chemical',
    category_slug: 'reaction-engineering',
    equation: 'E_a = R * (T1 * T2) / (T2 - T1) * ln(k2 / k1)',
    equation_latex: 'E_a = R \\frac{T_1 T_2}{T_2 - T_1} \\ln\\frac{k_2}{k_1}',
    difficulty_level: 'intermediate',
    tags: ['reaction', 'activation-energy', 'kinetics'],
    inputs: [
      { name: 'R', symbol: 'R', description: 'Gas Constant', unit: 'J/(mol·K)', default_value: 8.314, min_value: 1, input_order: 1 },
      { name: 'T1', symbol: 'T₁', description: 'Temperature 1', unit: 'K', default_value: 300, min_value: 1, input_order: 2 },
      { name: 'T2', symbol: 'T₂', description: 'Temperature 2', unit: 'K', default_value: 350, min_value: 1, input_order: 3 },
      { name: 'k1', symbol: 'k₁', description: 'Rate Constant at T1', unit: '1/s', default_value: 0.01, min_value: 0.0001, input_order: 4 },
      { name: 'k2', symbol: 'k₂', description: 'Rate Constant at T2', unit: '1/s', default_value: 0.1, min_value: 0.0001, input_order: 5 }
    ],
    outputs: [
      { name: 'E_a', symbol: 'E_a', description: 'Activation Energy', unit: 'J/mol', output_order: 1, precision: 0 }
    ]
  },

  // ============================================
  // SEPARATION PROCESSES EQUATIONS (10 equations)
  // ============================================
  
  {
    equation_id: 'eq_chem_distillation_mccabe',
    name: 'McCabe-Thiele Operating Line',
    description: 'Operating line for rectifying section',
    domain: 'chemical',
    category_slug: 'separation',
    equation: 'y = (R / (R + 1)) * x + x_D / (R + 1)',
    equation_latex: 'y = \\frac{R}{R+1}x + \\frac{x_D}{R+1}',
    difficulty_level: 'intermediate',
    tags: ['separation', 'distillation', 'mccabe-thiele'],
    inputs: [
      { name: 'R', symbol: 'R', description: 'Reflux Ratio', unit: '', default_value: 2, min_value: 0, input_order: 1 },
      { name: 'x', symbol: 'x', description: 'Liquid Mole Fraction', unit: '', default_value: 0.5, min_value: 0, max_value: 1, input_order: 2 },
      { name: 'x_D', symbol: 'x_D', description: 'Distillate Composition', unit: '', default_value: 0.95, min_value: 0, max_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'y', symbol: 'y', description: 'Vapor Mole Fraction', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_chem_min_reflux',
    name: 'Minimum Reflux Ratio',
    description: 'Minimum reflux for infinite stages',
    domain: 'chemical',
    category_slug: 'separation',
    equation: 'R_min = (x_D - y_q) / (y_q - x_q)',
    equation_latex: 'R_{min} = \\frac{x_D - y_q}{y_q - x_q}',
    difficulty_level: 'intermediate',
    tags: ['separation', 'distillation', 'reflux'],
    inputs: [
      { name: 'x_D', symbol: 'x_D', description: 'Distillate Composition', unit: '', default_value: 0.95, min_value: 0, max_value: 1, input_order: 1 },
      { name: 'y_q', symbol: 'y_q', description: 'Vapor at q-line', unit: '', default_value: 0.7, min_value: 0, max_value: 1, input_order: 2 },
      { name: 'x_q', symbol: 'x_q', description: 'Liquid at q-line', unit: '', default_value: 0.4, min_value: 0, max_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'R_min', symbol: 'R_min', description: 'Minimum Reflux Ratio', unit: '', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_chem_fenske',
    name: 'Fenske Equation',
    description: 'Minimum stages at total reflux',
    domain: 'chemical',
    category_slug: 'separation',
    equation: 'N_min = log((x_D * (1 - x_B)) / (x_B * (1 - x_D))) / log(alpha_avg)',
    equation_latex: 'N_{min} = \\frac{\\ln\\frac{x_D(1-x_B)}{x_B(1-x_D)}}{\\ln\\alpha_{avg}}',
    difficulty_level: 'intermediate',
    tags: ['separation', 'distillation', 'fenske'],
    inputs: [
      { name: 'x_D', symbol: 'x_D', description: 'Distillate Composition', unit: '', default_value: 0.95, min_value: 0.01, max_value: 0.99, input_order: 1 },
      { name: 'x_B', symbol: 'x_B', description: 'Bottoms Composition', unit: '', default_value: 0.05, min_value: 0.01, max_value: 0.99, input_order: 2 },
      { name: 'alpha_avg', symbol: 'α_avg', description: 'Average Relative Volatility', unit: '', default_value: 2.5, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'N_min', symbol: 'N_min', description: 'Minimum Number of Stages', unit: '', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_chem_absorption_factor',
    name: 'Absorption Factor',
    description: 'Ratio for absorption column design',
    domain: 'chemical',
    category_slug: 'separation',
    equation: 'A = L / (m * V)',
    equation_latex: 'A = \\frac{L}{mV}',
    difficulty_level: 'intermediate',
    tags: ['separation', 'absorption', 'column'],
    inputs: [
      { name: 'L', symbol: 'L', description: 'Liquid Flow Rate', unit: 'mol/s', default_value: 100, min_value: 0.1, input_order: 1 },
      { name: 'm', symbol: 'm', description: 'Equilibrium Constant', unit: '', default_value: 0.5, min_value: 0.01, input_order: 2 },
      { name: 'V', symbol: 'V', description: 'Vapor Flow Rate', unit: 'mol/s', default_value: 50, min_value: 0.1, input_order: 3 }
    ],
    outputs: [
      { name: 'A', symbol: 'A', description: 'Absorption Factor', unit: '', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_chem_stripping_factor',
    name: 'Stripping Factor',
    description: 'Ratio for stripping column design',
    domain: 'chemical',
    category_slug: 'separation',
    equation: 'S = m * V / L',
    equation_latex: 'S = \\frac{mV}{L}',
    difficulty_level: 'intermediate',
    tags: ['separation', 'stripping', 'column'],
    inputs: [
      { name: 'm', symbol: 'm', description: 'Equilibrium Constant', unit: '', default_value: 0.5, min_value: 0.01, input_order: 1 },
      { name: 'V', symbol: 'V', description: 'Vapor Flow Rate', unit: 'mol/s', default_value: 50, min_value: 0.1, input_order: 2 },
      { name: 'L', symbol: 'L', description: 'Liquid Flow Rate', unit: 'mol/s', default_value: 100, min_value: 0.1, input_order: 3 }
    ],
    outputs: [
      { name: 'S', symbol: 'S', description: 'Stripping Factor', unit: '', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_chem_htu',
    name: 'Height of Transfer Unit',
    description: 'HTU for packed column',
    domain: 'chemical',
    category_slug: 'separation',
    equation: 'HTU = G / (K_y * a)',
    equation_latex: 'HTU = \\frac{G}{K_y a}',
    difficulty_level: 'intermediate',
    tags: ['separation', 'packed-column', 'mass-transfer'],
    inputs: [
      { name: 'G', symbol: 'G', description: 'Gas Molar Velocity', unit: 'mol/(m²·s)', default_value: 10, min_value: 0.1, input_order: 1 },
      { name: 'K_y', symbol: 'K_y', description: 'Mass Transfer Coefficient', unit: 'mol/(m²·s)', default_value: 0.5, min_value: 0.001, input_order: 2 },
      { name: 'a', symbol: 'a', description: 'Interfacial Area', unit: 'm²/m³', default_value: 200, min_value: 10, input_order: 3 }
    ],
    outputs: [
      { name: 'HTU', symbol: 'HTU', description: 'Height of Transfer Unit', unit: 'm', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_chem_ntu',
    name: 'Number of Transfer Units',
    description: 'NTU for mass transfer',
    domain: 'chemical',
    category_slug: 'separation',
    equation: 'NTU = (y_in - y_out) / delta_y_lm',
    equation_latex: 'NTU = \\frac{y_{in} - y_{out}}{\\Delta y_{lm}}',
    difficulty_level: 'intermediate',
    tags: ['separation', 'ntu', 'mass-transfer'],
    inputs: [
      { name: 'y_in', symbol: 'y_in', description: 'Inlet Gas Composition', unit: '', default_value: 0.1, min_value: 0, input_order: 1 },
      { name: 'y_out', symbol: 'y_out', description: 'Outlet Gas Composition', unit: '', default_value: 0.01, min_value: 0, input_order: 2 },
      { name: 'delta_y_lm', symbol: 'Δy_lm', description: 'Log Mean Driving Force', unit: '', default_value: 0.03, min_value: 0.001, input_order: 3 }
    ],
    outputs: [
      { name: 'NTU', symbol: 'NTU', description: 'Number of Transfer Units', unit: '', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_chem_filtration_rate',
    name: 'Filtration Rate',
    description: 'Rate of filtration',
    domain: 'chemical',
    category_slug: 'separation',
    equation: 'dV/dt = (A * delta_P) / (mu * (r * w * V/A + R_m))',
    equation_latex: '\\frac{dV}{dt} = \\frac{A\\Delta P}{\\mu(r w V/A + R_m)}',
    difficulty_level: 'advanced',
    tags: ['separation', 'filtration', 'rate'],
    inputs: [
      { name: 'A', symbol: 'A', description: 'Filter Area', unit: 'm²', default_value: 10, min_value: 0.1, input_order: 1 },
      { name: 'delta_P', symbol: 'ΔP', description: 'Pressure Drop', unit: 'Pa', default_value: 100000, min_value: 1000, input_order: 2 },
      { name: 'mu', symbol: 'μ', description: 'Viscosity', unit: 'Pa·s', default_value: 0.001, min_value: 0.0001, input_order: 3 },
      { name: 'r', symbol: 'r', description: 'Specific Cake Resistance', unit: 'm/kg', default_value: 1e10, min_value: 1e6, input_order: 4 },
      { name: 'w', symbol: 'w', description: 'Cake Mass per Volume Filtrate', unit: 'kg/m³', default_value: 50, min_value: 1, input_order: 5 },
      { name: 'V', symbol: 'V', description: 'Filtrate Volume', unit: 'm³', default_value: 0.5, min_value: 0.01, input_order: 6 },
      { name: 'R_m', symbol: 'R_m', description: 'Medium Resistance', unit: '1/m', default_value: 1e9, min_value: 1e6, input_order: 7 }
    ],
    outputs: [
      { name: 'dV_dt', symbol: 'dV/dt', description: 'Filtration Rate', unit: 'm³/s', output_order: 1, precision: 6 }
    ]
  },
  {
    equation_id: 'eq_chem_cyclone_efficiency',
    name: 'Cyclone Efficiency',
    description: 'Collection efficiency of cyclone',
    domain: 'chemical',
    category_slug: 'separation',
    equation: 'eta = 1 - exp(-2 * (d_p / d_pc)^2)',
    equation_latex: '\\eta = 1 - e^{-2(d_p/d_{pc})^2}',
    difficulty_level: 'intermediate',
    tags: ['separation', 'cyclone', 'efficiency'],
    inputs: [
      { name: 'd_p', symbol: 'd_p', description: 'Particle Diameter', unit: 'μm', default_value: 10, min_value: 0.1, input_order: 1 },
      { name: 'd_pc', symbol: 'd_pc', description: 'Critical Particle Diameter', unit: 'μm', default_value: 5, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'eta', symbol: 'η', description: 'Collection Efficiency', unit: '', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_chem_settling_velocity',
    name: 'Stokes Settling Velocity',
    description: 'Terminal settling velocity for small particles',
    domain: 'chemical',
    category_slug: 'separation',
    equation: 'v_t = (g * d_p^2 * (rho_p - rho_f)) / (18 * mu)',
    equation_latex: 'v_t = \\frac{g d_p^2 (\\rho_p - \\rho_f)}{18\\mu}',
    difficulty_level: 'intermediate',
    tags: ['separation', 'settling', 'stokes'],
    inputs: [
      { name: 'g', symbol: 'g', description: 'Gravity', unit: 'm/s²', default_value: 9.81, min_value: 0.1, input_order: 1 },
      { name: 'd_p', symbol: 'd_p', description: 'Particle Diameter', unit: 'm', default_value: 0.0001, min_value: 0.000001, input_order: 2 },
      { name: 'rho_p', symbol: 'ρ_p', description: 'Particle Density', unit: 'kg/m³', default_value: 2500, min_value: 1, input_order: 3 },
      { name: 'rho_f', symbol: 'ρ_f', description: 'Fluid Density', unit: 'kg/m³', default_value: 1000, min_value: 1, input_order: 4 },
      { name: 'mu', symbol: 'μ', description: 'Fluid Viscosity', unit: 'Pa·s', default_value: 0.001, min_value: 0.0001, input_order: 5 }
    ],
    outputs: [
      { name: 'v_t', symbol: 'v_t', description: 'Settling Velocity', unit: 'm/s', output_order: 1, precision: 6 }
    ]
  },

  // ============================================
  // FLUID FLOW EQUATIONS (5 equations)
  // ============================================
  
  {
    equation_id: 'eq_chem_friction_factor',
    name: 'Fanning Friction Factor',
    description: 'Friction factor for laminar flow',
    domain: 'chemical',
    category_slug: 'fluid-flow',
    equation: 'f = 16 / Re',
    equation_latex: 'f = \\frac{16}{Re}',
    difficulty_level: 'beginner',
    tags: ['fluid-flow', 'friction', 'laminar'],
    inputs: [
      { name: 'Re', symbol: 'Re', description: 'Reynolds Number', unit: '', default_value: 1000, min_value: 1, input_order: 1 }
    ],
    outputs: [
      { name: 'f', symbol: 'f', description: 'Fanning Friction Factor', unit: '', output_order: 1, precision: 5 }
    ]
  },
  {
    equation_id: 'eq_chem_pressure_drop',
    name: 'Pressure Drop in Pipe',
    description: 'Pressure drop due to friction',
    domain: 'chemical',
    category_slug: 'fluid-flow',
    equation: 'delta_P = (2 * f * rho * v^2 * L) / D',
    equation_latex: '\\Delta P = \\frac{2f\\rho v^2 L}{D}',
    difficulty_level: 'intermediate',
    tags: ['fluid-flow', 'pressure-drop', 'pipe'],
    inputs: [
      { name: 'f', symbol: 'f', description: 'Friction Factor', unit: '', default_value: 0.005, min_value: 0.0001, input_order: 1 },
      { name: 'rho', symbol: 'ρ', description: 'Fluid Density', unit: 'kg/m³', default_value: 1000, min_value: 1, input_order: 2 },
      { name: 'v', symbol: 'v', description: 'Flow Velocity', unit: 'm/s', default_value: 2, min_value: 0.1, input_order: 3 },
      { name: 'L', symbol: 'L', description: 'Pipe Length', unit: 'm', default_value: 100, min_value: 1, input_order: 4 },
      { name: 'D', symbol: 'D', description: 'Pipe Diameter', unit: 'm', default_value: 0.1, min_value: 0.01, input_order: 5 }
    ],
    outputs: [
      { name: 'delta_P', symbol: 'ΔP', description: 'Pressure Drop', unit: 'Pa', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_chem_pump_power',
    name: 'Pump Power',
    description: 'Power required for pumping',
    domain: 'chemical',
    category_slug: 'fluid-flow',
    equation: 'P = (Q * delta_P) / eta',
    equation_latex: 'P = \\frac{Q \\Delta P}{\\eta}',
    difficulty_level: 'intermediate',
    tags: ['fluid-flow', 'pump', 'power'],
    inputs: [
      { name: 'Q', symbol: 'Q', description: 'Volumetric Flow Rate', unit: 'm³/s', default_value: 0.01, min_value: 0.0001, input_order: 1 },
      { name: 'delta_P', symbol: 'ΔP', description: 'Pressure Rise', unit: 'Pa', default_value: 500000, min_value: 1000, input_order: 2 },
      { name: 'eta', symbol: 'η', description: 'Pump Efficiency', unit: '', default_value: 0.7, min_value: 0.1, max_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'P', symbol: 'P', description: 'Pump Power', unit: 'W', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_chem_npsH',
    name: 'NPSH Available',
    description: 'Net positive suction head available',
    domain: 'chemical',
    category_slug: 'fluid-flow',
    equation: 'NPSHa = (P_suction - P_vapor) / (rho * g) + v^2 / (2 * g) + z',
    equation_latex: 'NPSH_a = \\frac{P_{suction} - P_{vapor}}{\\rho g} + \\frac{v^2}{2g} + z',
    difficulty_level: 'advanced',
    tags: ['fluid-flow', 'npsh', 'pump'],
    inputs: [
      { name: 'P_suction', symbol: 'P_suction', description: 'Suction Pressure', unit: 'Pa', default_value: 101325, min_value: 1000, input_order: 1 },
      { name: 'P_vapor', symbol: 'P_vapor', description: 'Vapor Pressure', unit: 'Pa', default_value: 3000, min_value: 0, input_order: 2 },
      { name: 'rho', symbol: 'ρ', description: 'Fluid Density', unit: 'kg/m³', default_value: 1000, min_value: 1, input_order: 3 },
      { name: 'g', symbol: 'g', description: 'Gravity', unit: 'm/s²', default_value: 9.81, min_value: 1, input_order: 4 },
      { name: 'v', symbol: 'v', description: 'Flow Velocity', unit: 'm/s', default_value: 2, min_value: 0, input_order: 5 },
      { name: 'z', symbol: 'z', description: 'Elevation Head', unit: 'm', default_value: 2, input_order: 6 }
    ],
    outputs: [
      { name: 'NPSHa', symbol: 'NPSH_a', description: 'NPSH Available', unit: 'm', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_chem_bernoulli_chemical',
    name: 'Bernoulli Equation (Process)',
    description: 'Energy balance for fluid flow',
    domain: 'chemical',
    category_slug: 'fluid-flow',
    equation: 'P1/rho + g*z1 + v1^2/2 = P2/rho + g*z2 + v2^2/2 + h_f',
    equation_latex: '\\frac{P_1}{\\rho} + gz_1 + \\frac{v_1^2}{2} = \\frac{P_2}{\\rho} + gz_2 + \\frac{v_2^2}{2} + h_f',
    difficulty_level: 'intermediate',
    tags: ['fluid-flow', 'bernoulli', 'energy'],
    inputs: [
      { name: 'P1', symbol: 'P₁', description: 'Pressure at Point 1', unit: 'Pa', default_value: 200000, min_value: 0, input_order: 1 },
      { name: 'rho', symbol: 'ρ', description: 'Fluid Density', unit: 'kg/m³', default_value: 1000, min_value: 1, input_order: 2 },
      { name: 'z1', symbol: 'z₁', description: 'Elevation at Point 1', unit: 'm', default_value: 10, min_value: 0, input_order: 3 },
      { name: 'v1', symbol: 'v₁', description: 'Velocity at Point 1', unit: 'm/s', default_value: 1, min_value: 0, input_order: 4 },
      { name: 'P2', symbol: 'P₂', description: 'Pressure at Point 2', unit: 'Pa', default_value: 100000, min_value: 0, input_order: 5 },
      { name: 'z2', symbol: 'z₂', description: 'Elevation at Point 2', unit: 'm', default_value: 0, min_value: 0, input_order: 6 },
      { name: 'v2', symbol: 'v₂', description: 'Velocity at Point 2', unit: 'm/s', default_value: 2, min_value: 0, input_order: 7 },
      { name: 'g', symbol: 'g', description: 'Gravity', unit: 'm/s²', default_value: 9.81, min_value: 1, input_order: 8 }
    ],
    outputs: [
      { name: 'h_f', symbol: 'h_f', description: 'Head Loss', unit: 'J/kg', output_order: 1, precision: 2 }
    ]
  }
];

export default chemicalBatch1;
