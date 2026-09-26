/**
 * Mechanical Engineering Equations - Batch 2
 * Heat Transfer, HVAC
 * Total: 50 equations
 */

export const mechanicalBatch2 = [
  // ============================================
  // HEAT TRANSFER EQUATIONS (25 equations)
  // ============================================
  
  {
    equation_id: 'eq_heat_conduction',
    name: 'Fourier\'s Law of Conduction',
    description: 'Heat conduction through a material',
    domain: 'mechanical',
    category_slug: 'heat-transfer',
    equation: 'Q = -k * A * (dT/dx)',
    equation_latex: 'Q = -k A \\frac{dT}{dx}',
    difficulty_level: 'intermediate',
    tags: ['heat-transfer', 'conduction', 'fourier'],
    inputs: [
      { name: 'k', symbol: 'k', description: 'Thermal Conductivity', unit: 'W/(m·K)', default_value: 50, min_value: 0.01, input_order: 1 },
      { name: 'A', symbol: 'A', description: 'Cross-Sectional Area', unit: 'm²', default_value: 1, min_value: 0.001, input_order: 2 },
      { name: 'dT', symbol: 'ΔT', description: 'Temperature Difference', unit: 'K', default_value: 100, min_value: 0, input_order: 3 },
      { name: 'dx', symbol: 'Δx', description: 'Thickness', unit: 'm', default_value: 0.1, min_value: 0.001, input_order: 4 }
    ],
    outputs: [
      { name: 'Q', symbol: 'Q', description: 'Heat Transfer Rate', unit: 'W', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_heat_conduction_wall',
    name: 'Heat Transfer Through Wall',
    description: 'Steady-state conduction through plane wall',
    domain: 'mechanical',
    category_slug: 'heat-transfer',
    equation: 'Q = k * A * (T1 - T2) / L',
    equation_latex: 'Q = \\frac{kA(T_1 - T_2)}{L}',
    difficulty_level: 'intermediate',
    tags: ['heat-transfer', 'conduction', 'wall'],
    inputs: [
      { name: 'k', symbol: 'k', description: 'Thermal Conductivity', unit: 'W/(m·K)', default_value: 0.5, min_value: 0.01, input_order: 1 },
      { name: 'A', symbol: 'A', description: 'Wall Area', unit: 'm²', default_value: 10, min_value: 0.1, input_order: 2 },
      { name: 'T1', symbol: 'T₁', description: 'Hot Side Temperature', unit: '°C', default_value: 30, min_value: -50, input_order: 3 },
      { name: 'T2', symbol: 'T₂', description: 'Cold Side Temperature', unit: '°C', default_value: 20, min_value: -50, input_order: 4 },
      { name: 'L', symbol: 'L', description: 'Wall Thickness', unit: 'm', default_value: 0.2, min_value: 0.01, input_order: 5 }
    ],
    outputs: [
      { name: 'Q', symbol: 'Q', description: 'Heat Transfer Rate', unit: 'W', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_heat_conduction_cylinder',
    name: 'Heat Transfer Through Cylinder',
    description: 'Radial conduction through cylindrical wall',
    domain: 'mechanical',
    category_slug: 'heat-transfer',
    equation: 'Q = (2 * PI * k * L * (T1 - T2)) / ln(r2 / r1)',
    equation_latex: 'Q = \\frac{2\\pi k L (T_1 - T_2)}{\\ln(r_2/r_1)}',
    difficulty_level: 'advanced',
    tags: ['heat-transfer', 'conduction', 'cylinder'],
    inputs: [
      { name: 'k', symbol: 'k', description: 'Thermal Conductivity', unit: 'W/(m·K)', default_value: 50, min_value: 0.01, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Cylinder Length', unit: 'm', default_value: 1, min_value: 0.1, input_order: 2 },
      { name: 'T1', symbol: 'T₁', description: 'Inner Temperature', unit: '°C', default_value: 100, min_value: -50, input_order: 3 },
      { name: 'T2', symbol: 'T₂', description: 'Outer Temperature', unit: '°C', default_value: 30, min_value: -50, input_order: 4 },
      { name: 'r1', symbol: 'r₁', description: 'Inner Radius', unit: 'm', default_value: 0.05, min_value: 0.001, input_order: 5 },
      { name: 'r2', symbol: 'r₂', description: 'Outer Radius', unit: 'm', default_value: 0.06, min_value: 0.001, input_order: 6 }
    ],
    outputs: [
      { name: 'Q', symbol: 'Q', description: 'Heat Transfer Rate', unit: 'W', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_heat_convection',
    name: 'Newton\'s Law of Cooling',
    description: 'Convective heat transfer',
    domain: 'mechanical',
    category_slug: 'heat-transfer',
    equation: 'Q = h * A * (Ts - Tf)',
    equation_latex: 'Q = hA(T_s - T_f)',
    difficulty_level: 'beginner',
    tags: ['heat-transfer', 'convection', 'newton'],
    inputs: [
      { name: 'h', symbol: 'h', description: 'Heat Transfer Coefficient', unit: 'W/(m²·K)', default_value: 25, min_value: 1, input_order: 1 },
      { name: 'A', symbol: 'A', description: 'Surface Area', unit: 'm²', default_value: 10, min_value: 0.01, input_order: 2 },
      { name: 'Ts', symbol: 'T_s', description: 'Surface Temperature', unit: '°C', default_value: 80, min_value: -50, input_order: 3 },
      { name: 'Tf', symbol: 'T_f', description: 'Fluid Temperature', unit: '°C', default_value: 20, min_value: -50, input_order: 4 }
    ],
    outputs: [
      { name: 'Q', symbol: 'Q', description: 'Heat Transfer Rate', unit: 'W', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_heat_radiation',
    name: 'Stefan-Boltzmann Law',
    description: 'Radiative heat transfer',
    domain: 'mechanical',
    category_slug: 'heat-transfer',
    equation: 'Q = epsilon * sigma * A * (T1^4 - T2^4)',
    equation_latex: 'Q = \\varepsilon \\sigma A (T_1^4 - T_2^4)',
    difficulty_level: 'intermediate',
    tags: ['heat-transfer', 'radiation', 'stefan-boltzmann'],
    inputs: [
      { name: 'epsilon', symbol: 'ε', description: 'Emissivity', unit: '', default_value: 0.9, min_value: 0, max_value: 1, input_order: 1 },
      { name: 'sigma', symbol: 'σ', description: 'Stefan-Boltzmann Constant', unit: 'W/(m²·K⁴)', default_value: 5.67e-8, min_value: 1e-10, input_order: 2 },
      { name: 'A', symbol: 'A', description: 'Surface Area', unit: 'm²', default_value: 1, min_value: 0.01, input_order: 3 },
      { name: 'T1', symbol: 'T₁', description: 'Hot Surface Temperature', unit: 'K', default_value: 373, min_value: 1, input_order: 4 },
      { name: 'T2', symbol: 'T₂', description: 'Cold Surface Temperature', unit: 'K', default_value: 293, min_value: 1, input_order: 5 }
    ],
    outputs: [
      { name: 'Q', symbol: 'Q', description: 'Heat Transfer Rate', unit: 'W', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_heat_thermal_resistance',
    name: 'Thermal Resistance',
    description: 'Resistance to heat flow',
    domain: 'mechanical',
    category_slug: 'heat-transfer',
    equation: 'R_th = L / (k * A)',
    equation_latex: 'R_{th} = \\frac{L}{kA}',
    difficulty_level: 'beginner',
    tags: ['heat-transfer', 'resistance', 'conduction'],
    inputs: [
      { name: 'L', symbol: 'L', description: 'Material Thickness', unit: 'm', default_value: 0.1, min_value: 0.001, input_order: 1 },
      { name: 'k', symbol: 'k', description: 'Thermal Conductivity', unit: 'W/(m·K)', default_value: 0.5, min_value: 0.01, input_order: 2 },
      { name: 'A', symbol: 'A', description: 'Area', unit: 'm²', default_value: 1, min_value: 0.01, input_order: 3 }
    ],
    outputs: [
      { name: 'R_th', symbol: 'R_th', description: 'Thermal Resistance', unit: 'K/W', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_heat_overall_coefficient',
    name: 'Overall Heat Transfer Coefficient',
    description: 'Combined heat transfer coefficient',
    domain: 'mechanical',
    category_slug: 'heat-transfer',
    equation: 'U = 1 / (1/h1 + L/k + 1/h2)',
    equation_latex: 'U = \\frac{1}{\\frac{1}{h_1} + \\frac{L}{k} + \\frac{1}{h_2}}',
    difficulty_level: 'intermediate',
    tags: ['heat-transfer', 'overall', 'u-value'],
    inputs: [
      { name: 'h1', symbol: 'h₁', description: 'Inner Convection Coefficient', unit: 'W/(m²·K)', default_value: 50, min_value: 1, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Wall Thickness', unit: 'm', default_value: 0.1, min_value: 0.001, input_order: 2 },
      { name: 'k', symbol: 'k', description: 'Thermal Conductivity', unit: 'W/(m·K)', default_value: 0.5, min_value: 0.01, input_order: 3 },
      { name: 'h2', symbol: 'h₂', description: 'Outer Convection Coefficient', unit: 'W/(m²·K)', default_value: 25, min_value: 1, input_order: 4 }
    ],
    outputs: [
      { name: 'U', symbol: 'U', description: 'Overall Heat Transfer Coefficient', unit: 'W/(m²·K)', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_heat_exchanger_lmtd',
    name: 'LMTD Method',
    description: 'Log mean temperature difference for heat exchangers',
    domain: 'mechanical',
    category_slug: 'heat-transfer',
    equation: 'LMTD = (dT1 - dT2) / ln(dT1 / dT2)',
    equation_latex: 'LMTD = \\frac{\\Delta T_1 - \\Delta T_2}{\\ln(\\Delta T_1 / \\Delta T_2)}',
    difficulty_level: 'advanced',
    tags: ['heat-transfer', 'heat-exchanger', 'lmtd'],
    inputs: [
      { name: 'dT1', symbol: 'ΔT₁', description: 'Temperature Difference at End 1', unit: 'K', default_value: 50, min_value: 0.1, input_order: 1 },
      { name: 'dT2', symbol: 'ΔT₂', description: 'Temperature Difference at End 2', unit: 'K', default_value: 20, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'LMTD', symbol: 'LMTD', description: 'Log Mean Temperature Difference', unit: 'K', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_heat_exchanger_ntu',
    name: 'NTU Method',
    description: 'Number of transfer units for heat exchanger',
    domain: 'mechanical',
    category_slug: 'heat-transfer',
    equation: 'NTU = U * A / C_min',
    equation_latex: 'NTU = \\frac{UA}{C_{min}}',
    difficulty_level: 'advanced',
    tags: ['heat-transfer', 'heat-exchanger', 'ntu'],
    inputs: [
      { name: 'U', symbol: 'U', description: 'Overall Heat Transfer Coefficient', unit: 'W/(m²·K)', default_value: 500, min_value: 1, input_order: 1 },
      { name: 'A', symbol: 'A', description: 'Heat Transfer Area', unit: 'm²', default_value: 10, min_value: 0.1, input_order: 2 },
      { name: 'C_min', symbol: 'C_min', description: 'Minimum Heat Capacity Rate', unit: 'W/K', default_value: 2000, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'NTU', symbol: 'NTU', description: 'Number of Transfer Units', unit: '', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_heat_effectiveness',
    name: 'Heat Exchanger Effectiveness',
    description: 'Ratio of actual to maximum possible heat transfer',
    domain: 'mechanical',
    category_slug: 'heat-transfer',
    equation: 'epsilon = Q_actual / Q_max',
    equation_latex: '\\varepsilon = \\frac{Q_{actual}}{Q_{max}}',
    difficulty_level: 'intermediate',
    tags: ['heat-transfer', 'heat-exchanger', 'effectiveness'],
    inputs: [
      { name: 'Q_actual', symbol: 'Q_actual', description: 'Actual Heat Transfer', unit: 'W', default_value: 50000, min_value: 0, input_order: 1 },
      { name: 'Q_max', symbol: 'Q_max', description: 'Maximum Possible Heat Transfer', unit: 'W', default_value: 75000, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'epsilon', symbol: 'ε', description: 'Effectiveness', unit: '', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_heat_fins_efficiency',
    name: 'Fin Efficiency',
    description: 'Efficiency of heat transfer fin',
    domain: 'mechanical',
    category_slug: 'heat-transfer',
    equation: 'eta_fin = tanh(m * L) / (m * L)',
    equation_latex: '\\eta_{fin} = \\frac{\\tanh(mL)}{mL}',
    difficulty_level: 'advanced',
    tags: ['heat-transfer', 'fin', 'efficiency'],
    inputs: [
      { name: 'm', symbol: 'm', description: 'Fin Parameter', unit: '1/m', default_value: 50, min_value: 0.1, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Fin Length', unit: 'm', default_value: 0.05, min_value: 0.001, input_order: 2 }
    ],
    outputs: [
      { name: 'eta_fin', symbol: 'η_fin', description: 'Fin Efficiency', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_heat_fins_parameter',
    name: 'Fin Parameter',
    description: 'Parameter for fin calculations',
    domain: 'mechanical',
    category_slug: 'heat-transfer',
    equation: 'm = sqrt((h * P) / (k * A_c))',
    equation_latex: 'm = \\sqrt{\\frac{hP}{kA_c}}',
    difficulty_level: 'advanced',
    tags: ['heat-transfer', 'fin', 'parameter'],
    inputs: [
      { name: 'h', symbol: 'h', description: 'Heat Transfer Coefficient', unit: 'W/(m²·K)', default_value: 50, min_value: 1, input_order: 1 },
      { name: 'P', symbol: 'P', description: 'Perimeter', unit: 'm', default_value: 0.04, min_value: 0.001, input_order: 2 },
      { name: 'k', symbol: 'k', description: 'Thermal Conductivity', unit: 'W/(m·K)', default_value: 200, min_value: 1, input_order: 3 },
      { name: 'A_c', symbol: 'A_c', description: 'Cross-Sectional Area', unit: 'm²', default_value: 0.0001, min_value: 0.00001, input_order: 4 }
    ],
    outputs: [
      { name: 'm', symbol: 'm', description: 'Fin Parameter', unit: '1/m', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_heat_biot_number',
    name: 'Biot Number',
    description: 'Ratio of internal to external thermal resistance',
    domain: 'mechanical',
    category_slug: 'heat-transfer',
    equation: 'Bi = (h * L_c) / k',
    equation_latex: 'Bi = \\frac{hL_c}{k}',
    difficulty_level: 'intermediate',
    tags: ['heat-transfer', 'biot', 'dimensionless'],
    inputs: [
      { name: 'h', symbol: 'h', description: 'Heat Transfer Coefficient', unit: 'W/(m²·K)', default_value: 100, min_value: 1, input_order: 1 },
      { name: 'L_c', symbol: 'L_c', description: 'Characteristic Length', unit: 'm', default_value: 0.05, min_value: 0.001, input_order: 2 },
      { name: 'k', symbol: 'k', description: 'Thermal Conductivity', unit: 'W/(m·K)', default_value: 50, min_value: 0.1, input_order: 3 }
    ],
    outputs: [
      { name: 'Bi', symbol: 'Bi', description: 'Biot Number', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_heat_fourier_number',
    name: 'Fourier Number',
    description: 'Dimensionless time for transient conduction',
    domain: 'mechanical',
    category_slug: 'heat-transfer',
    equation: 'Fo = (alpha * t) / L_c^2',
    equation_latex: 'Fo = \\frac{\\alpha t}{L_c^2}',
    difficulty_level: 'intermediate',
    tags: ['heat-transfer', 'fourier', 'dimensionless'],
    inputs: [
      { name: 'alpha', symbol: 'α', description: 'Thermal Diffusivity', unit: 'm²/s', default_value: 1e-5, min_value: 1e-10, input_order: 1 },
      { name: 't', symbol: 't', description: 'Time', unit: 's', default_value: 60, min_value: 0.1, input_order: 2 },
      { name: 'L_c', symbol: 'L_c', description: 'Characteristic Length', unit: 'm', default_value: 0.05, min_value: 0.001, input_order: 3 }
    ],
    outputs: [
      { name: 'Fo', symbol: 'Fo', description: 'Fourier Number', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_heat_nusselt_number',
    name: 'Nusselt Number',
    description: 'Ratio of convective to conductive heat transfer',
    domain: 'mechanical',
    category_slug: 'heat-transfer',
    equation: 'Nu = (h * L) / k',
    equation_latex: 'Nu = \\frac{hL}{k}',
    difficulty_level: 'intermediate',
    tags: ['heat-transfer', 'nusselt', 'dimensionless'],
    inputs: [
      { name: 'h', symbol: 'h', description: 'Heat Transfer Coefficient', unit: 'W/(m²·K)', default_value: 100, min_value: 1, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Characteristic Length', unit: 'm', default_value: 0.1, min_value: 0.001, input_order: 2 },
      { name: 'k', symbol: 'k', description: 'Thermal Conductivity', unit: 'W/(m·K)', default_value: 0.6, min_value: 0.01, input_order: 3 }
    ],
    outputs: [
      { name: 'Nu', symbol: 'Nu', description: 'Nusselt Number', unit: '', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_heat_prandtl_number',
    name: 'Prandtl Number',
    description: 'Ratio of momentum to thermal diffusivity',
    domain: 'mechanical',
    category_slug: 'heat-transfer',
    equation: 'Pr = mu * Cp / k',
    equation_latex: 'Pr = \\frac{\\mu C_p}{k}',
    difficulty_level: 'intermediate',
    tags: ['heat-transfer', 'prandtl', 'dimensionless'],
    inputs: [
      { name: 'mu', symbol: 'μ', description: 'Dynamic Viscosity', unit: 'Pa·s', default_value: 0.001, min_value: 0.00001, input_order: 1 },
      { name: 'Cp', symbol: 'C_p', description: 'Specific Heat Capacity', unit: 'J/(kg·K)', default_value: 4186, min_value: 1, input_order: 2 },
      { name: 'k', symbol: 'k', description: 'Thermal Conductivity', unit: 'W/(m·K)', default_value: 0.6, min_value: 0.01, input_order: 3 }
    ],
    outputs: [
      { name: 'Pr', symbol: 'Pr', description: 'Prandtl Number', unit: '', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_heat_grashof_number',
    name: 'Grashof Number',
    description: 'Ratio of buoyancy to viscous forces',
    domain: 'mechanical',
    category_slug: 'heat-transfer',
    equation: 'Gr = (g * beta * dT * L^3) / nu^2',
    equation_latex: 'Gr = \\frac{g \\beta \\Delta T L^3}{\\nu^2}',
    difficulty_level: 'advanced',
    tags: ['heat-transfer', 'grashof', 'dimensionless'],
    inputs: [
      { name: 'g', symbol: 'g', description: 'Gravity', unit: 'm/s²', default_value: 9.81, min_value: 0.1, input_order: 1 },
      { name: 'beta', symbol: 'β', description: 'Thermal Expansion Coefficient', unit: '1/K', default_value: 0.0003, min_value: 0.00001, input_order: 2 },
      { name: 'dT', symbol: 'ΔT', description: 'Temperature Difference', unit: 'K', default_value: 50, min_value: 0.1, input_order: 3 },
      { name: 'L', symbol: 'L', description: 'Characteristic Length', unit: 'm', default_value: 0.5, min_value: 0.01, input_order: 4 },
      { name: 'nu', symbol: 'ν', description: 'Kinematic Viscosity', unit: 'm²/s', default_value: 1e-6, min_value: 1e-10, input_order: 5 }
    ],
    outputs: [
      { name: 'Gr', symbol: 'Gr', description: 'Grashof Number', unit: '', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_heat_rayleigh_number',
    name: 'Rayleigh Number',
    description: 'Product of Grashof and Prandtl numbers',
    domain: 'mechanical',
    category_slug: 'heat-transfer',
    equation: 'Ra = Gr * Pr',
    equation_latex: 'Ra = Gr \\times Pr',
    difficulty_level: 'intermediate',
    tags: ['heat-transfer', 'rayleigh', 'dimensionless'],
    inputs: [
      { name: 'Gr', symbol: 'Gr', description: 'Grashof Number', unit: '', default_value: 1e8, min_value: 1, input_order: 1 },
      { name: 'Pr', symbol: 'Pr', description: 'Prandtl Number', unit: '', default_value: 7, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'Ra', symbol: 'Ra', description: 'Rayleigh Number', unit: '', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_heat_thermal_diffusivity',
    name: 'Thermal Diffusivity',
    description: 'Rate of temperature change in material',
    domain: 'mechanical',
    category_slug: 'heat-transfer',
    equation: 'alpha = k / (rho * Cp)',
    equation_latex: '\\alpha = \\frac{k}{\\rho C_p}',
    difficulty_level: 'beginner',
    tags: ['heat-transfer', 'diffusivity', 'thermal'],
    inputs: [
      { name: 'k', symbol: 'k', description: 'Thermal Conductivity', unit: 'W/(m·K)', default_value: 50, min_value: 0.01, input_order: 1 },
      { name: 'rho', symbol: 'ρ', description: 'Density', unit: 'kg/m³', default_value: 7800, min_value: 1, input_order: 2 },
      { name: 'Cp', symbol: 'C_p', description: 'Specific Heat Capacity', unit: 'J/(kg·K)', default_value: 500, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'alpha', symbol: 'α', description: 'Thermal Diffusivity', unit: 'm²/s', output_order: 1, precision: 8 }
    ]
  },
  {
    equation_id: 'eq_heat_transient_lumped',
    name: 'Lumped Capacitance',
    description: 'Temperature history for small Biot number',
    domain: 'mechanical',
    category_slug: 'heat-transfer',
    equation: 'T = T_inf + (T0 - T_inf) * exp(-(h * A * t) / (rho * V * Cp))',
    equation_latex: 'T = T_\\infty + (T_0 - T_\\infty) e^{-\\frac{hAt}{\\rho V C_p}}',
    difficulty_level: 'advanced',
    tags: ['heat-transfer', 'transient', 'lumped'],
    inputs: [
      { name: 'T0', symbol: 'T₀', description: 'Initial Temperature', unit: '°C', default_value: 200, min_value: -273, input_order: 1 },
      { name: 'T_inf', symbol: 'T_∞', description: 'Ambient Temperature', unit: '°C', default_value: 25, min_value: -273, input_order: 2 },
      { name: 'h', symbol: 'h', description: 'Heat Transfer Coefficient', unit: 'W/(m²·K)', default_value: 50, min_value: 1, input_order: 3 },
      { name: 'A', symbol: 'A', description: 'Surface Area', unit: 'm²', default_value: 0.1, min_value: 0.001, input_order: 4 },
      { name: 't', symbol: 't', description: 'Time', unit: 's', default_value: 60, min_value: 0.1, input_order: 5 },
      { name: 'rho', symbol: 'ρ', description: 'Density', unit: 'kg/m³', default_value: 7800, min_value: 1, input_order: 6 },
      { name: 'V', symbol: 'V', description: 'Volume', unit: 'm³', default_value: 0.001, min_value: 0.00001, input_order: 7 },
      { name: 'Cp', symbol: 'C_p', description: 'Specific Heat Capacity', unit: 'J/(kg·K)', default_value: 500, min_value: 1, input_order: 8 }
    ],
    outputs: [
      { name: 'T', symbol: 'T', description: 'Temperature at Time t', unit: '°C', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_heat_time_constant',
    name: 'Thermal Time Constant',
    description: 'Time for temperature to change significantly',
    domain: 'mechanical',
    category_slug: 'heat-transfer',
    equation: 'tau = (rho * V * Cp) / (h * A)',
    equation_latex: '\\tau = \\frac{\\rho V C_p}{hA}',
    difficulty_level: 'intermediate',
    tags: ['heat-transfer', 'time-constant', 'transient'],
    inputs: [
      { name: 'rho', symbol: 'ρ', description: 'Density', unit: 'kg/m³', default_value: 7800, min_value: 1, input_order: 1 },
      { name: 'V', symbol: 'V', description: 'Volume', unit: 'm³', default_value: 0.001, min_value: 0.00001, input_order: 2 },
      { name: 'Cp', symbol: 'C_p', description: 'Specific Heat Capacity', unit: 'J/(kg·K)', default_value: 500, min_value: 1, input_order: 3 },
      { name: 'h', symbol: 'h', description: 'Heat Transfer Coefficient', unit: 'W/(m²·K)', default_value: 50, min_value: 1, input_order: 4 },
      { name: 'A', symbol: 'A', description: 'Surface Area', unit: 'm²', default_value: 0.1, min_value: 0.001, input_order: 5 }
    ],
    outputs: [
      { name: 'tau', symbol: 'τ', description: 'Time Constant', unit: 's', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_heat_r_value',
    name: 'R-Value (Thermal Resistance)',
    description: 'Thermal resistance of insulation',
    domain: 'mechanical',
    category_slug: 'heat-transfer',
    equation: 'R_value = L / k',
    equation_latex: 'R = \\frac{L}{k}',
    difficulty_level: 'beginner',
    tags: ['heat-transfer', 'insulation', 'r-value'],
    inputs: [
      { name: 'L', symbol: 'L', description: 'Insulation Thickness', unit: 'm', default_value: 0.1, min_value: 0.001, input_order: 1 },
      { name: 'k', symbol: 'k', description: 'Thermal Conductivity', unit: 'W/(m·K)', default_value: 0.04, min_value: 0.01, input_order: 2 }
    ],
    outputs: [
      { name: 'R_value', symbol: 'R', description: 'R-Value', unit: 'm²·K/W', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_heat_composite_wall',
    name: 'Composite Wall Heat Transfer',
    description: 'Heat transfer through multiple layers',
    domain: 'mechanical',
    category_slug: 'heat-transfer',
    equation: 'Q = A * (T1 - T2) / (L1/k1 + L2/k2 + L3/k3)',
    equation_latex: 'Q = \\frac{A(T_1 - T_2)}{\\frac{L_1}{k_1} + \\frac{L_2}{k_2} + \\frac{L_3}{k_3}}',
    difficulty_level: 'intermediate',
    tags: ['heat-transfer', 'composite', 'wall'],
    inputs: [
      { name: 'A', symbol: 'A', description: 'Wall Area', unit: 'm²', default_value: 10, min_value: 0.1, input_order: 1 },
      { name: 'T1', symbol: 'T₁', description: 'Hot Side Temperature', unit: '°C', default_value: 30, min_value: -50, input_order: 2 },
      { name: 'T2', symbol: 'T₂', description: 'Cold Side Temperature', unit: '°C', default_value: 20, min_value: -50, input_order: 3 },
      { name: 'L1', symbol: 'L₁', description: 'Layer 1 Thickness', unit: 'm', default_value: 0.1, min_value: 0.001, input_order: 4 },
      { name: 'k1', symbol: 'k₁', description: 'Layer 1 Conductivity', unit: 'W/(m·K)', default_value: 0.5, min_value: 0.01, input_order: 5 },
      { name: 'L2', symbol: 'L₂', description: 'Layer 2 Thickness', unit: 'm', default_value: 0.05, min_value: 0.001, input_order: 6 },
      { name: 'k2', symbol: 'k₂', description: 'Layer 2 Conductivity', unit: 'W/(m·K)', default_value: 0.04, min_value: 0.01, input_order: 7 },
      { name: 'L3', symbol: 'L₃', description: 'Layer 3 Thickness', unit: 'm', default_value: 0.1, min_value: 0.001, input_order: 8 },
      { name: 'k3', symbol: 'k₃', description: 'Layer 3 Conductivity', unit: 'W/(m·K)', default_value: 0.8, min_value: 0.01, input_order: 9 }
    ],
    outputs: [
      { name: 'Q', symbol: 'Q', description: 'Heat Transfer Rate', unit: 'W', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_heat Stanton_number',
    name: 'Stanton Number',
    description: 'Ratio of heat transferred to fluid capacity',
    domain: 'mechanical',
    category_slug: 'heat-transfer',
    equation: 'St = h / (rho * v * Cp)',
    equation_latex: 'St = \\frac{h}{\\rho v C_p}',
    difficulty_level: 'intermediate',
    tags: ['heat-transfer', 'stanton', 'dimensionless'],
    inputs: [
      { name: 'h', symbol: 'h', description: 'Heat Transfer Coefficient', unit: 'W/(m²·K)', default_value: 100, min_value: 1, input_order: 1 },
      { name: 'rho', symbol: 'ρ', description: 'Fluid Density', unit: 'kg/m³', default_value: 1.2, min_value: 0.1, input_order: 2 },
      { name: 'v', symbol: 'v', description: 'Flow Velocity', unit: 'm/s', default_value: 10, min_value: 0.1, input_order: 3 },
      { name: 'Cp', symbol: 'C_p', description: 'Specific Heat Capacity', unit: 'J/(kg·K)', default_value: 1005, min_value: 1, input_order: 4 }
    ],
    outputs: [
      { name: 'St', symbol: 'St', description: 'Stanton Number', unit: '', output_order: 1, precision: 5 }
    ]
  },
  {
    equation_id: 'eq_heat_view_factor',
    name: 'View Factor (Reciprocity)',
    description: 'Radiation view factor relationship',
    domain: 'mechanical',
    category_slug: 'heat-transfer',
    equation: 'A1 * F12 = A2 * F21',
    equation_latex: 'A_1 F_{12} = A_2 F_{21}',
    difficulty_level: 'intermediate',
    tags: ['heat-transfer', 'radiation', 'view-factor'],
    inputs: [
      { name: 'A1', symbol: 'A₁', description: 'Surface 1 Area', unit: 'm²', default_value: 10, min_value: 0.1, input_order: 1 },
      { name: 'F12', symbol: 'F₁₂', description: 'View Factor 1 to 2', unit: '', default_value: 0.5, min_value: 0, max_value: 1, input_order: 2 },
      { name: 'A2', symbol: 'A₂', description: 'Surface 2 Area', unit: 'm²', default_value: 5, min_value: 0.1, input_order: 3 }
    ],
    outputs: [
      { name: 'F21', symbol: 'F₂₁', description: 'View Factor 2 to 1', unit: '', output_order: 1, precision: 3 }
    ]
  },

  // ============================================
  // HVAC EQUATIONS (25 equations)
  // ============================================
  
  {
    equation_id: 'eq_hvac_sensible_heat',
    name: 'Sensible Heat Load',
    description: 'Heat load from temperature change',
    domain: 'mechanical',
    category_slug: 'hvac',
    equation: 'Q_s = 1.08 * CFM * delta_T',
    equation_latex: 'Q_s = 1.08 \\times CFM \\times \\Delta T',
    difficulty_level: 'beginner',
    tags: ['hvac', 'sensible', 'heat-load'],
    inputs: [
      { name: 'CFM', symbol: 'CFM', description: 'Air Flow Rate', unit: 'ft³/min', default_value: 1000, min_value: 1, input_order: 1 },
      { name: 'delta_T', symbol: 'ΔT', description: 'Temperature Difference', unit: '°F', default_value: 20, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'Q_s', symbol: 'Q_s', description: 'Sensible Heat', unit: 'BTU/h', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_hvac_latent_heat',
    name: 'Latent Heat Load',
    description: 'Heat load from humidity change',
    domain: 'mechanical',
    category_slug: 'hvac',
    equation: 'Q_l = 0.68 * CFM * delta_W',
    equation_latex: 'Q_l = 0.68 \\times CFM \\times \\Delta W',
    difficulty_level: 'beginner',
    tags: ['hvac', 'latent', 'heat-load'],
    inputs: [
      { name: 'CFM', symbol: 'CFM', description: 'Air Flow Rate', unit: 'ft³/min', default_value: 1000, min_value: 1, input_order: 1 },
      { name: 'delta_W', symbol: 'ΔW', description: 'Humidity Ratio Difference', unit: 'gr/lb', default_value: 30, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'Q_l', symbol: 'Q_l', description: 'Latent Heat', unit: 'BTU/h', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_hvac_total_heat',
    name: 'Total Heat Load',
    description: 'Combined sensible and latent heat',
    domain: 'mechanical',
    category_slug: 'hvac',
    equation: 'Q_t = Q_s + Q_l',
    equation_latex: 'Q_t = Q_s + Q_l',
    difficulty_level: 'beginner',
    tags: ['hvac', 'total', 'heat-load'],
    inputs: [
      { name: 'Q_s', symbol: 'Q_s', description: 'Sensible Heat', unit: 'BTU/h', default_value: 20000, min_value: 0, input_order: 1 },
      { name: 'Q_l', symbol: 'Q_l', description: 'Latent Heat', unit: 'BTU/h', default_value: 5000, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'Q_t', symbol: 'Q_t', description: 'Total Heat', unit: 'BTU/h', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_hvac_shr',
    name: 'Sensible Heat Ratio',
    description: 'Ratio of sensible to total heat',
    domain: 'mechanical',
    category_slug: 'hvac',
    equation: 'SHR = Q_s / Q_t',
    equation_latex: 'SHR = \\frac{Q_s}{Q_t}',
    difficulty_level: 'beginner',
    tags: ['hvac', 'shr', 'ratio'],
    inputs: [
      { name: 'Q_s', symbol: 'Q_s', description: 'Sensible Heat', unit: 'BTU/h', default_value: 20000, min_value: 0, input_order: 1 },
      { name: 'Q_t', symbol: 'Q_t', description: 'Total Heat', unit: 'BTU/h', default_value: 25000, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'SHR', symbol: 'SHR', description: 'Sensible Heat Ratio', unit: '', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_hvac_air_changes',
    name: 'Air Changes per Hour',
    description: 'Ventilation rate calculation',
    domain: 'mechanical',
    category_slug: 'hvac',
    equation: 'ACH = (CFM * 60) / V_room',
    equation_latex: 'ACH = \\frac{CFM \\times 60}{V_{room}}',
    difficulty_level: 'beginner',
    tags: ['hvac', 'ventilation', 'ach'],
    inputs: [
      { name: 'CFM', symbol: 'CFM', description: 'Air Flow Rate', unit: 'ft³/min', default_value: 500, min_value: 1, input_order: 1 },
      { name: 'V_room', symbol: 'V', description: 'Room Volume', unit: 'ft³', default_value: 3000, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'ACH', symbol: 'ACH', description: 'Air Changes per Hour', unit: '/h', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_hvac_duct_velocity',
    name: 'Duct Air Velocity',
    description: 'Air velocity in duct',
    domain: 'mechanical',
    category_slug: 'hvac',
    equation: 'v = CFM / (A * 144)',
    equation_latex: 'v = \\frac{CFM}{A \\times 144}',
    difficulty_level: 'beginner',
    tags: ['hvac', 'duct', 'velocity'],
    inputs: [
      { name: 'CFM', symbol: 'CFM', description: 'Air Flow Rate', unit: 'ft³/min', default_value: 1000, min_value: 1, input_order: 1 },
      { name: 'A', symbol: 'A', description: 'Duct Area', unit: 'ft²', default_value: 2, min_value: 0.01, input_order: 2 }
    ],
    outputs: [
      { name: 'v', symbol: 'v', description: 'Air Velocity', unit: 'ft/min', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_hvac_duct_friction',
    name: 'Duct Friction Loss',
    description: 'Pressure loss in ductwork',
    domain: 'mechanical',
    category_slug: 'hvac',
    equation: 'dP = 0.03 * (L / 100) * (v / 4005)^2',
    equation_latex: '\\Delta P = 0.03 \\times \\frac{L}{100} \\times \\left(\\frac{v}{4005}\\right)^2',
    difficulty_level: 'intermediate',
    tags: ['hvac', 'duct', 'friction'],
    inputs: [
      { name: 'L', symbol: 'L', description: 'Duct Length', unit: 'ft', default_value: 100, min_value: 1, input_order: 1 },
      { name: 'v', symbol: 'v', description: 'Air Velocity', unit: 'ft/min', default_value: 1000, min_value: 100, input_order: 2 }
    ],
    outputs: [
      { name: 'dP', symbol: 'ΔP', description: 'Pressure Loss', unit: 'in. w.g.', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_hvac_equivalent_duct',
    name: 'Equivalent Duct Diameter',
    description: 'Convert rectangular to equivalent round duct',
    domain: 'mechanical',
    category_slug: 'hvac',
    equation: 'D_eq = 1.3 * (a * b)^0.625 / (a + b)^0.25',
    equation_latex: 'D_{eq} = \\frac{1.3(ab)^{0.625}}{(a+b)^{0.25}}',
    difficulty_level: 'intermediate',
    tags: ['hvac', 'duct', 'equivalent'],
    inputs: [
      { name: 'a', symbol: 'a', description: 'Duct Width', unit: 'in', default_value: 20, min_value: 1, input_order: 1 },
      { name: 'b', symbol: 'b', description: 'Duct Height', unit: 'in', default_value: 12, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'D_eq', symbol: 'D_eq', description: 'Equivalent Diameter', unit: 'in', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_hvac_cooling_load_area',
    name: 'Cooling Load from Area',
    description: 'Estimate cooling load from floor area',
    domain: 'mechanical',
    category_slug: 'hvac',
    equation: 'Q_cool = A * CFM_per_sqft * 1.08 * delta_T',
    equation_latex: 'Q_{cool} = A \\times CFM_{sqft} \\times 1.08 \\times \\Delta T',
    difficulty_level: 'intermediate',
    tags: ['hvac', 'cooling', 'load'],
    inputs: [
      { name: 'A', symbol: 'A', description: 'Floor Area', unit: 'ft²', default_value: 1000, min_value: 10, input_order: 1 },
      { name: 'CFM_per_sqft', symbol: 'CFM/ft²', description: 'CFM per Square Foot', unit: 'CFM/ft²', default_value: 1, min_value: 0.1, input_order: 2 },
      { name: 'delta_T', symbol: 'ΔT', description: 'Temperature Difference', unit: '°F', default_value: 20, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'Q_cool', symbol: 'Q_cool', description: 'Cooling Load', unit: 'BTU/h', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_hvac_tons',
    name: 'Tons of Refrigeration',
    description: 'Convert BTU/h to tons',
    domain: 'mechanical',
    category_slug: 'hvac',
    equation: 'tons = Q_btu / 12000',
    equation_latex: 'tons = \\frac{Q_{btu}}{12000}',
    difficulty_level: 'beginner',
    tags: ['hvac', 'tons', 'refrigeration'],
    inputs: [
      { name: 'Q_btu', symbol: 'Q', description: 'Heat Load', unit: 'BTU/h', default_value: 36000, min_value: 1, input_order: 1 }
    ],
    outputs: [
      { name: 'tons', symbol: 'tons', description: 'Tons of Refrigeration', unit: 'tons', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_hvac_eer',
    name: 'Energy Efficiency Ratio',
    description: 'Cooling efficiency rating',
    domain: 'mechanical',
    category_slug: 'hvac',
    equation: 'EER = Q_cooling / P_input',
    equation_latex: 'EER = \\frac{Q_{cooling}}{P_{input}}',
    difficulty_level: 'beginner',
    tags: ['hvac', 'eer', 'efficiency'],
    inputs: [
      { name: 'Q_cooling', symbol: 'Q', description: 'Cooling Capacity', unit: 'BTU/h', default_value: 36000, min_value: 1, input_order: 1 },
      { name: 'P_input', symbol: 'P', description: 'Electrical Input', unit: 'W', default_value: 3500, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'EER', symbol: 'EER', description: 'Energy Efficiency Ratio', unit: 'BTU/W·h', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_hvac_cop',
    name: 'Coefficient of Performance',
    description: 'Cooling system efficiency',
    domain: 'mechanical',
    category_slug: 'hvac',
    equation: 'COP = Q_cooling / (P_input * 3.412)',
    equation_latex: 'COP = \\frac{Q_{cooling}}{P_{input} \\times 3.412}',
    difficulty_level: 'intermediate',
    tags: ['hvac', 'cop', 'efficiency'],
    inputs: [
      { name: 'Q_cooling', symbol: 'Q', description: 'Cooling Capacity', unit: 'BTU/h', default_value: 36000, min_value: 1, input_order: 1 },
      { name: 'P_input', symbol: 'P', description: 'Electrical Input', unit: 'W', default_value: 3500, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'COP', symbol: 'COP', description: 'Coefficient of Performance', unit: '', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_hvac_dew_point',
    name: 'Dew Point Temperature',
    description: 'Temperature at which condensation occurs',
    domain: 'mechanical',
    category_slug: 'hvac',
    equation: 'T_dp = T_db - ((100 - RH) / 5)',
    equation_latex: 'T_{dp} = T_{db} - \\frac{100 - RH}{5}',
    difficulty_level: 'intermediate',
    tags: ['hvac', 'dew-point', 'psychrometrics'],
    inputs: [
      { name: 'T_db', symbol: 'T_db', description: 'Dry Bulb Temperature', unit: '°C', default_value: 25, min_value: -50, input_order: 1 },
      { name: 'RH', symbol: 'RH', description: 'Relative Humidity', unit: '%', default_value: 60, min_value: 0, max_value: 100, input_order: 2 }
    ],
    outputs: [
      { name: 'T_dp', symbol: 'T_dp', description: 'Dew Point Temperature', unit: '°C', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_hvac_wet_bulb',
    name: 'Wet Bulb Depression',
    description: 'Difference between dry and wet bulb',
    domain: 'mechanical',
    category_slug: 'hvac',
    equation: 'WBD = T_db - T_wb',
    equation_latex: 'WBD = T_{db} - T_{wb}',
    difficulty_level: 'beginner',
    tags: ['hvac', 'wet-bulb', 'psychrometrics'],
    inputs: [
      { name: 'T_db', symbol: 'T_db', description: 'Dry Bulb Temperature', unit: '°C', default_value: 30, min_value: -50, input_order: 1 },
      { name: 'T_wb', symbol: 'T_wb', description: 'Wet Bulb Temperature', unit: '°C', default_value: 22, min_value: -50, input_order: 2 }
    ],
    outputs: [
      { name: 'WBD', symbol: 'WBD', description: 'Wet Bulb Depression', unit: '°C', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_hvac_relative_humidity',
    name: 'Relative Humidity',
    description: 'Calculate relative humidity',
    domain: 'mechanical',
    category_slug: 'hvac',
    equation: 'RH = (Pv / Ps) * 100',
    equation_latex: 'RH = \\frac{P_v}{P_s} \\times 100',
    difficulty_level: 'intermediate',
    tags: ['hvac', 'humidity', 'psychrometrics'],
    inputs: [
      { name: 'Pv', symbol: 'P_v', description: 'Vapor Pressure', unit: 'Pa', default_value: 1500, min_value: 0, input_order: 1 },
      { name: 'Ps', symbol: 'P_s', description: 'Saturation Pressure', unit: 'Pa', default_value: 2500, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'RH', symbol: 'RH', description: 'Relative Humidity', unit: '%', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_hvac_enthalpy_air',
    name: 'Air Enthalpy',
    description: 'Total heat content of moist air',
    domain: 'mechanical',
    category_slug: 'hvac',
    equation: 'h = 0.24 * T_db + W * (1061 + 0.444 * T_db)',
    equation_latex: 'h = 0.24 T_{db} + W(1061 + 0.444 T_{db})',
    difficulty_level: 'intermediate',
    tags: ['hvac', 'enthalpy', 'psychrometrics'],
    inputs: [
      { name: 'T_db', symbol: 'T_db', description: 'Dry Bulb Temperature', unit: '°F', default_value: 75, min_value: -50, input_order: 1 },
      { name: 'W', symbol: 'W', description: 'Humidity Ratio', unit: 'lb/lb', default_value: 0.01, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'h', symbol: 'h', description: 'Enthalpy', unit: 'BTU/lb', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_hvac_fan_law_flow',
    name: 'Fan Law - Flow',
    description: 'Flow-speed relationship for fans',
    domain: 'mechanical',
    category_slug: 'hvac',
    equation: 'CFM2 = CFM1 * (RPM2 / RPM1)',
    equation_latex: 'CFM_2 = CFM_1 \\times \\frac{RPM_2}{RPM_1}',
    difficulty_level: 'intermediate',
    tags: ['hvac', 'fan', 'affinity'],
    inputs: [
      { name: 'CFM1', symbol: 'CFM₁', description: 'Original Flow', unit: 'ft³/min', default_value: 1000, min_value: 1, input_order: 1 },
      { name: 'RPM1', symbol: 'RPM₁', description: 'Original Speed', unit: 'rpm', default_value: 1000, min_value: 100, input_order: 2 },
      { name: 'RPM2', symbol: 'RPM₂', description: 'New Speed', unit: 'rpm', default_value: 1200, min_value: 100, input_order: 3 }
    ],
    outputs: [
      { name: 'CFM2', symbol: 'CFM₂', description: 'New Flow', unit: 'ft³/min', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_hvac_fan_law_pressure',
    name: 'Fan Law - Pressure',
    description: 'Pressure-speed relationship for fans',
    domain: 'mechanical',
    category_slug: 'hvac',
    equation: 'SP2 = SP1 * (RPM2 / RPM1)^2',
    equation_latex: 'SP_2 = SP_1 \\times \\left(\\frac{RPM_2}{RPM_1}\\right)^2',
    difficulty_level: 'intermediate',
    tags: ['hvac', 'fan', 'affinity'],
    inputs: [
      { name: 'SP1', symbol: 'SP₁', description: 'Original Static Pressure', unit: 'in. w.g.', default_value: 1, min_value: 0.01, input_order: 1 },
      { name: 'RPM1', symbol: 'RPM₁', description: 'Original Speed', unit: 'rpm', default_value: 1000, min_value: 100, input_order: 2 },
      { name: 'RPM2', symbol: 'RPM₂', description: 'New Speed', unit: 'rpm', default_value: 1200, min_value: 100, input_order: 3 }
    ],
    outputs: [
      { name: 'SP2', symbol: 'SP₂', description: 'New Static Pressure', unit: 'in. w.g.', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_hvac_fan_law_power',
    name: 'Fan Law - Power',
    description: 'Power-speed relationship for fans',
    domain: 'mechanical',
    category_slug: 'hvac',
    equation: 'HP2 = HP1 * (RPM2 / RPM1)^3',
    equation_latex: 'HP_2 = HP_1 \\times \\left(\\frac{RPM_2}{RPM_1}\\right)^3',
    difficulty_level: 'intermediate',
    tags: ['hvac', 'fan', 'affinity'],
    inputs: [
      { name: 'HP1', symbol: 'HP₁', description: 'Original Power', unit: 'hp', default_value: 1, min_value: 0.01, input_order: 1 },
      { name: 'RPM1', symbol: 'RPM₁', description: 'Original Speed', unit: 'rpm', default_value: 1000, min_value: 100, input_order: 2 },
      { name: 'RPM2', symbol: 'RPM₂', description: 'New Speed', unit: 'rpm', default_value: 1200, min_value: 100, input_order: 3 }
    ],
    outputs: [
      { name: 'HP2', symbol: 'HP₂', description: 'New Power', unit: 'hp', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_hvac_fan_efficiency',
    name: 'Fan Efficiency',
    description: 'Total efficiency of fan system',
    domain: 'mechanical',
    category_slug: 'hvac',
    equation: 'eta = (CFM * SP) / (6356 * HP)',
    equation_latex: '\\eta = \\frac{CFM \\times SP}{6356 \\times HP}',
    difficulty_level: 'intermediate',
    tags: ['hvac', 'fan', 'efficiency'],
    inputs: [
      { name: 'CFM', symbol: 'CFM', description: 'Air Flow Rate', unit: 'ft³/min', default_value: 10000, min_value: 1, input_order: 1 },
      { name: 'SP', symbol: 'SP', description: 'Static Pressure', unit: 'in. w.g.', default_value: 2, min_value: 0.01, input_order: 2 },
      { name: 'HP', symbol: 'HP', description: 'Motor Power', unit: 'hp', default_value: 5, min_value: 0.01, input_order: 3 }
    ],
    outputs: [
      { name: 'eta', symbol: 'η', description: 'Fan Efficiency', unit: '', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_hvac_ventilation_rate',
    name: 'Ventilation Rate',
    description: 'Required outdoor air flow',
    domain: 'mechanical',
    category_slug: 'hvac',
    equation: 'V_ot = (Rp * Pz) + (Ra * Az)',
    equation_latex: 'V_{ot} = (R_p \\times P_z) + (R_a \\times A_z)',
    difficulty_level: 'intermediate',
    tags: ['hvac', 'ventilation', 'ashrae'],
    inputs: [
      { name: 'Rp', symbol: 'R_p', description: 'Rate per Person', unit: 'CFM/person', default_value: 5, min_value: 0, input_order: 1 },
      { name: 'Pz', symbol: 'P_z', description: 'Number of People', unit: '', default_value: 20, min_value: 0, input_order: 2 },
      { name: 'Ra', symbol: 'R_a', description: 'Rate per Area', unit: 'CFM/ft²', default_value: 0.06, min_value: 0, input_order: 3 },
      { name: 'Az', symbol: 'A_z', description: 'Floor Area', unit: 'ft²', default_value: 1000, min_value: 0, input_order: 4 }
    ],
    outputs: [
      { name: 'V_ot', symbol: 'V_ot', description: 'Ventilation Rate', unit: 'CFM', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_hvac_heat_gain_people',
    name: 'Heat Gain from Occupants',
    description: 'Sensible and latent heat from people',
    domain: 'mechanical',
    category_slug: 'hvac',
    equation: 'Q_people = N * (q_sensible + q_latent)',
    equation_latex: 'Q_{people} = N \\times (q_s + q_l)',
    difficulty_level: 'beginner',
    tags: ['hvac', 'heat-gain', 'occupants'],
    inputs: [
      { name: 'N', symbol: 'N', description: 'Number of People', unit: '', default_value: 20, min_value: 0, input_order: 1 },
      { name: 'q_sensible', symbol: 'q_s', description: 'Sensible Heat per Person', unit: 'BTU/h', default_value: 250, min_value: 0, input_order: 2 },
      { name: 'q_latent', symbol: 'q_l', description: 'Latent Heat per Person', unit: 'BTU/h', default_value: 200, min_value: 0, input_order: 3 }
    ],
    outputs: [
      { name: 'Q_people', symbol: 'Q', description: 'Total Heat Gain', unit: 'BTU/h', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_hvac_heat_gain_lights',
    name: 'Heat Gain from Lighting',
    description: 'Heat generated by lighting fixtures',
    domain: 'mechanical',
    category_slug: 'hvac',
    equation: 'Q_lights = W * 3.412 * CLF',
    equation_latex: 'Q_{lights} = W \\times 3.412 \\times CLF',
    difficulty_level: 'beginner',
    tags: ['hvac', 'heat-gain', 'lighting'],
    inputs: [
      { name: 'W', symbol: 'W', description: 'Lighting Power', unit: 'W', default_value: 2000, min_value: 0, input_order: 1 },
      { name: 'CLF', symbol: 'CLF', description: 'Cooling Load Factor', unit: '', default_value: 0.85, min_value: 0, max_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'Q_lights', symbol: 'Q', description: 'Heat Gain', unit: 'BTU/h', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_hvac_heat_gain_equipment',
    name: 'Heat Gain from Equipment',
    description: 'Heat generated by equipment',
    domain: 'mechanical',
    category_slug: 'hvac',
    equation: 'Q_equip = W * 3.412 * CLF',
    equation_latex: 'Q_{equip} = W \\times 3.412 \\times CLF',
    difficulty_level: 'beginner',
    tags: ['hvac', 'heat-gain', 'equipment'],
    inputs: [
      { name: 'W', symbol: 'W', description: 'Equipment Power', unit: 'W', default_value: 3000, min_value: 0, input_order: 1 },
      { name: 'CLF', symbol: 'CLF', description: 'Cooling Load Factor', unit: '', default_value: 0.5, min_value: 0, max_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'Q_equip', symbol: 'Q', description: 'Heat Gain', unit: 'BTU/h', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_hvac_supply_air_temp',
    name: 'Supply Air Temperature',
    description: 'Calculate required supply air temperature',
    domain: 'mechanical',
    category_slug: 'hvac',
    equation: 'T_supply = T_room - (Q_sensible / (1.08 * CFM))',
    equation_latex: 'T_{supply} = T_{room} - \\frac{Q_s}{1.08 \\times CFM}',
    difficulty_level: 'intermediate',
    tags: ['hvac', 'supply-air', 'temperature'],
    inputs: [
      { name: 'T_room', symbol: 'T_room', description: 'Room Temperature', unit: '°F', default_value: 75, min_value: 50, input_order: 1 },
      { name: 'Q_sensible', symbol: 'Q_s', description: 'Sensible Heat Load', unit: 'BTU/h', default_value: 24000, min_value: 0, input_order: 2 },
      { name: 'CFM', symbol: 'CFM', description: 'Air Flow Rate', unit: 'ft³/min', default_value: 1000, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'T_supply', symbol: 'T_supply', description: 'Supply Air Temperature', unit: '°F', output_order: 1, precision: 1 }
    ]
  }
];

export default mechanicalBatch2;
