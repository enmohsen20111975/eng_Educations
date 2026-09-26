/**
 * Civil Engineering Equations - Batch 2
 * Steel Design, Foundation, Geotechnical, Hydraulics
 * Total: 50 equations
 */

export const civilBatch2 = [
  // ============================================
  // STEEL DESIGN EQUATIONS (15 equations)
  // ============================================
  
  {
    equation_id: 'eq_steel_flexural_capacity',
    name: 'Steel Beam Flexural Capacity',
    description: 'Plastic moment capacity of steel beam',
    domain: 'civil',
    category_slug: 'steel-design',
    equation: 'Mp = Fy * Z',
    equation_latex: 'M_p = F_y \\times Z',
    difficulty_level: 'intermediate',
    tags: ['steel', 'flexural', 'capacity'],
    inputs: [
      { name: 'Fy', symbol: 'F_y', description: 'Yield Strength', unit: 'MPa', default_value: 250, min_value: 100, input_order: 1 },
      { name: 'Z', symbol: 'Z', description: 'Plastic Section Modulus', unit: 'mm³', default_value: 500000, min_value: 1000, input_order: 2 }
    ],
    outputs: [
      { name: 'Mp', symbol: 'M_p', description: 'Plastic Moment Capacity', unit: 'kN·m', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_steel_shear_capacity',
    name: 'Steel Beam Shear Capacity',
    description: 'Shear capacity of steel beam',
    domain: 'civil',
    category_slug: 'steel-design',
    equation: 'Vn = 0.6 * Fy * Aw',
    equation_latex: 'V_n = 0.6 F_y A_w',
    difficulty_level: 'intermediate',
    tags: ['steel', 'shear', 'capacity'],
    inputs: [
      { name: 'Fy', symbol: 'F_y', description: 'Yield Strength', unit: 'MPa', default_value: 250, min_value: 100, input_order: 1 },
      { name: 'Aw', symbol: 'A_w', description: 'Web Area', unit: 'mm²', default_value: 3000, min_value: 100, input_order: 2 }
    ],
    outputs: [
      { name: 'Vn', symbol: 'V_n', description: 'Shear Capacity', unit: 'kN', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_steel_column_capacity',
    name: 'Steel Column Capacity',
    description: 'Compressive capacity of steel column',
    domain: 'civil',
    category_slug: 'steel-design',
    equation: 'Pn = Fcr * Ag',
    equation_latex: 'P_n = F_{cr} \\times A_g',
    difficulty_level: 'intermediate',
    tags: ['steel', 'column', 'capacity'],
    inputs: [
      { name: 'Fcr', symbol: 'F_cr', description: 'Critical Stress', unit: 'MPa', default_value: 200, min_value: 50, input_order: 1 },
      { name: 'Ag', symbol: 'A_g', description: 'Gross Area', unit: 'mm²', default_value: 10000, min_value: 100, input_order: 2 }
    ],
    outputs: [
      { name: 'Pn', symbol: 'P_n', description: 'Nominal Compressive Capacity', unit: 'kN', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_steel_critical_stress',
    name: 'Critical Stress (AISC)',
    description: 'Critical stress for column buckling',
    domain: 'civil',
    category_slug: 'steel-design',
    equation: 'Fcr = (PI^2 * E) / lambda_c^2',
    equation_latex: 'F_{cr} = \\frac{\\pi^2 E}{\\lambda_c^2}',
    difficulty_level: 'advanced',
    tags: ['steel', 'critical', 'buckling'],
    inputs: [
      { name: 'E', symbol: 'E', description: 'Modulus of Elasticity', unit: 'MPa', default_value: 200000, min_value: 100000, input_order: 1 },
      { name: 'lambda_c', symbol: 'λ_c', description: 'Slenderness Parameter', unit: '', default_value: 1.5, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'Fcr', symbol: 'F_cr', description: 'Critical Stress', unit: 'MPa', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_steel_lateral_torsional',
    name: 'Lateral Torsional Buckling',
    description: 'Moment capacity limited by LTB',
    domain: 'civil',
    category_slug: 'steel-design',
    equation: 'M_n = Cb * (PI^2 * E * Iy / L_b^2) * sqrt(Iw / Iy + (L_b^2 * G * J) / (PI^2 * E * Iy))',
    equation_latex: 'M_n = C_b \\frac{\\pi^2 E I_y}{L_b^2} \\sqrt{\\frac{I_w}{I_y} + \\frac{L_b^2 G J}{\\pi^2 E I_y}}',
    difficulty_level: 'advanced',
    tags: ['steel', 'ltb', 'buckling'],
    inputs: [
      { name: 'Cb', symbol: 'C_b', description: 'Moment Gradient Factor', unit: '', default_value: 1, min_value: 0.5, max_value: 3, input_order: 1 },
      { name: 'E', symbol: 'E', description: 'Modulus of Elasticity', unit: 'MPa', default_value: 200000, min_value: 100000, input_order: 2 },
      { name: 'Iy', symbol: 'I_y', description: 'Weak Axis Moment of Inertia', unit: 'mm⁴', default_value: 20e6, min_value: 1e6, input_order: 3 },
      { name: 'L_b', symbol: 'L_b', description: 'Unbraced Length', unit: 'mm', default_value: 4000, min_value: 500, input_order: 4 },
      { name: 'Iw', symbol: 'I_w', description: 'Warping Constant', unit: 'mm⁶', default_value: 1e12, min_value: 1e9, input_order: 5 },
      { name: 'G', symbol: 'G', description: 'Shear Modulus', unit: 'MPa', default_value: 77000, min_value: 50000, input_order: 6 },
      { name: 'J', symbol: 'J', description: 'Torsional Constant', unit: 'mm⁴', default_value: 500000, min_value: 1000, input_order: 7 }
    ],
    outputs: [
      { name: 'M_n', symbol: 'M_n', description: 'Nominal Moment Capacity', unit: 'kN·m', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_steel_connection_bolt_shear',
    name: 'Bolt Shear Capacity',
    description: 'Shear capacity of bolt',
    domain: 'civil',
    category_slug: 'steel-design',
    equation: 'Rn = 0.5 * Fu * Ab * n',
    equation_latex: 'R_n = 0.5 F_u A_b n',
    difficulty_level: 'intermediate',
    tags: ['steel', 'bolt', 'shear'],
    inputs: [
      { name: 'Fu', symbol: 'F_u', description: 'Ultimate Tensile Strength', unit: 'MPa', default_value: 400, min_value: 200, input_order: 1 },
      { name: 'Ab', symbol: 'A_b', description: 'Bolt Area', unit: 'mm²', default_value: 314, min_value: 10, input_order: 2 },
      { name: 'n', symbol: 'n', description: 'Number of Shear Planes', unit: '', default_value: 1, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'Rn', symbol: 'R_n', description: 'Bolt Shear Capacity', unit: 'kN', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_steel_connection_bolt_bearing',
    name: 'Bolt Bearing Capacity',
    description: 'Bearing capacity of connected plate',
    domain: 'civil',
    category_slug: 'steel-design',
    equation: 'Rn = 2.4 * Fu * d * t',
    equation_latex: 'R_n = 2.4 F_u d t',
    difficulty_level: 'intermediate',
    tags: ['steel', 'bolt', 'bearing'],
    inputs: [
      { name: 'Fu', symbol: 'F_u', description: 'Ultimate Tensile Strength', unit: 'MPa', default_value: 400, min_value: 200, input_order: 1 },
      { name: 'd', symbol: 'd', description: 'Bolt Diameter', unit: 'mm', default_value: 20, min_value: 5, input_order: 2 },
      { name: 't', symbol: 't', description: 'Plate Thickness', unit: 'mm', default_value: 10, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'Rn', symbol: 'R_n', description: 'Bearing Capacity', unit: 'kN', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_steel_weld_capacity',
    name: 'Fillet Weld Capacity',
    description: 'Capacity of fillet weld',
    domain: 'civil',
    category_slug: 'steel-design',
    equation: 'Rn = 0.6 * FEXX * 0.707 * w * L',
    equation_latex: 'R_n = 0.6 F_{EXX} \\times 0.707 w L',
    difficulty_level: 'intermediate',
    tags: ['steel', 'weld', 'capacity'],
    inputs: [
      { name: 'FEXX', symbol: 'F_EXX', description: 'Electrode Strength', unit: 'MPa', default_value: 490, min_value: 200, input_order: 1 },
      { name: 'w', symbol: 'w', description: 'Weld Size', unit: 'mm', default_value: 8, min_value: 2, input_order: 2 },
      { name: 'L', symbol: 'L', description: 'Weld Length', unit: 'mm', default_value: 100, min_value: 10, input_order: 3 }
    ],
    outputs: [
      { name: 'Rn', symbol: 'R_n', description: 'Weld Capacity', unit: 'kN', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_steel_tension_capacity',
    name: 'Tension Member Capacity',
    description: 'Tensile capacity of steel member',
    domain: 'civil',
    category_slug: 'steel-design',
    equation: 'Pn = min(Fy * Ag, Fu * Ae)',
    equation_latex: 'P_n = \\min(F_y A_g, F_u A_e)',
    difficulty_level: 'intermediate',
    tags: ['steel', 'tension', 'capacity'],
    inputs: [
      { name: 'Fy', symbol: 'F_y', description: 'Yield Strength', unit: 'MPa', default_value: 250, min_value: 100, input_order: 1 },
      { name: 'Ag', symbol: 'A_g', description: 'Gross Area', unit: 'mm²', default_value: 3000, min_value: 10, input_order: 2 },
      { name: 'Fu', symbol: 'F_u', description: 'Ultimate Strength', unit: 'MPa', default_value: 400, min_value: 200, input_order: 3 },
      { name: 'Ae', symbol: 'A_e', description: 'Effective Net Area', unit: 'mm²', default_value: 2500, min_value: 10, input_order: 4 }
    ],
    outputs: [
      { name: 'Pn', symbol: 'P_n', description: 'Tensile Capacity', unit: 'kN', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_steel_block_shear',
    name: 'Block Shear Capacity',
    description: 'Block shear rupture capacity',
    domain: 'civil',
    category_slug: 'steel-design',
    equation: 'Rn = 0.6 * Fu * Anv + Fu * Ant',
    equation_latex: 'R_n = 0.6 F_u A_{nv} + F_u A_{nt}',
    difficulty_level: 'advanced',
    tags: ['steel', 'block-shear', 'rupture'],
    inputs: [
      { name: 'Fu', symbol: 'F_u', description: 'Ultimate Strength', unit: 'MPa', default_value: 400, min_value: 200, input_order: 1 },
      { name: 'Anv', symbol: 'A_nv', description: 'Net Shear Area', unit: 'mm²', default_value: 2000, min_value: 10, input_order: 2 },
      { name: 'Ant', symbol: 'A_nt', description: 'Net Tension Area', unit: 'mm²', default_value: 500, min_value: 10, input_order: 3 }
    ],
    outputs: [
      { name: 'Rn', symbol: 'R_n', description: 'Block Shear Capacity', unit: 'kN', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_steel_flange_local_buckling',
    name: 'Flange Local Buckling',
    description: 'Compactness limit for flange',
    domain: 'civil',
    category_slug: 'steel-design',
    equation: 'lambda_p = 0.38 * sqrt(E / Fy)',
    equation_latex: '\\lambda_p = 0.38\\sqrt{\\frac{E}{F_y}}',
    difficulty_level: 'advanced',
    tags: ['steel', 'local-buckling', 'compactness'],
    inputs: [
      { name: 'E', symbol: 'E', description: 'Modulus of Elasticity', unit: 'MPa', default_value: 200000, min_value: 100000, input_order: 1 },
      { name: 'Fy', symbol: 'F_y', description: 'Yield Strength', unit: 'MPa', default_value: 250, min_value: 100, input_order: 2 }
    ],
    outputs: [
      { name: 'lambda_p', symbol: 'λ_p', description: 'Compact Limit', unit: '', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_steel_web_local_buckling',
    name: 'Web Local Buckling',
    description: 'Compactness limit for web',
    domain: 'civil',
    category_slug: 'steel-design',
    equation: 'lambda_p = 3.76 * sqrt(E / Fy)',
    equation_latex: '\\lambda_p = 3.76\\sqrt{\\frac{E}{F_y}}',
    difficulty_level: 'advanced',
    tags: ['steel', 'local-buckling', 'compactness'],
    inputs: [
      { name: 'E', symbol: 'E', description: 'Modulus of Elasticity', unit: 'MPa', default_value: 200000, min_value: 100000, input_order: 1 },
      { name: 'Fy', symbol: 'F_y', description: 'Yield Strength', unit: 'MPa', default_value: 250, min_value: 100, input_order: 2 }
    ],
    outputs: [
      { name: 'lambda_p', symbol: 'λ_p', description: 'Compact Limit', unit: '', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_steel_composite_beam',
    name: 'Composite Beam Capacity',
    description: 'Moment capacity of composite beam',
    domain: 'civil',
    category_slug: 'steel-design',
    equation: 'Mn = As * Fy * (d / 2 + a / 2)',
    equation_latex: 'M_n = A_s F_y \\left(\\frac{d}{2} + \\frac{a}{2}\\right)',
    difficulty_level: 'advanced',
    tags: ['steel', 'composite', 'beam'],
    inputs: [
      { name: 'As', symbol: 'A_s', description: 'Steel Area', unit: 'mm²', default_value: 5000, min_value: 100, input_order: 1 },
      { name: 'Fy', symbol: 'F_y', description: 'Steel Yield Strength', unit: 'MPa', default_value: 250, min_value: 100, input_order: 2 },
      { name: 'd', symbol: 'd', description: 'Steel Beam Depth', unit: 'mm', default_value: 400, min_value: 50, input_order: 3 },
      { name: 'a', symbol: 'a', description: 'Slab Stress Block Depth', unit: 'mm', default_value: 50, min_value: 10, input_order: 4 }
    ],
    outputs: [
      { name: 'Mn', symbol: 'M_n', description: 'Composite Moment Capacity', unit: 'kN·m', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_steel_stud_capacity',
    name: 'Shear Stud Capacity',
    description: 'Capacity of shear connector',
    domain: 'civil',
    category_slug: 'steel-design',
    equation: 'Qn = 0.5 * Asc * sqrt(fc * Ec)',
    equation_latex: 'Q_n = 0.5 A_{sc} \\sqrt{f_c E_c}',
    difficulty_level: 'advanced',
    tags: ['steel', 'stud', 'shear-connector'],
    inputs: [
      { name: 'Asc', symbol: 'A_sc', description: 'Stud Cross-Sectional Area', unit: 'mm²', default_value: 200, min_value: 10, input_order: 1 },
      { name: 'fc', symbol: 'f_c', description: 'Concrete Strength', unit: 'MPa', default_value: 30, min_value: 15, input_order: 2 },
      { name: 'Ec', symbol: 'E_c', description: 'Concrete Modulus', unit: 'MPa', default_value: 25000, min_value: 10000, input_order: 3 }
    ],
    outputs: [
      { name: 'Qn', symbol: 'Q_n', description: 'Stud Shear Capacity', unit: 'kN', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_steel_deflection_limit',
    name: 'Deflection Limit (L/360)',
    description: 'Allowable deflection for floor beams',
    domain: 'civil',
    category_slug: 'steel-design',
    equation: 'delta_allow = L / 360',
    equation_latex: '\\delta_{allow} = \\frac{L}{360}',
    difficulty_level: 'beginner',
    tags: ['steel', 'deflection', 'limit'],
    inputs: [
      { name: 'L', symbol: 'L', description: 'Span Length', unit: 'mm', default_value: 6000, min_value: 1000, input_order: 1 }
    ],
    outputs: [
      { name: 'delta_allow', symbol: 'δ_allow', description: 'Allowable Deflection', unit: 'mm', output_order: 1, precision: 1 }
    ]
  },

  // ============================================
  // FOUNDATION DESIGN EQUATIONS (15 equations)
  // ============================================
  
  {
    equation_id: 'eq_foundation_bearing_pressure',
    name: 'Bearing Pressure (Centric Load)',
    description: 'Uniform bearing pressure under footing',
    domain: 'civil',
    category_slug: 'foundation',
    equation: 'q = P / A',
    equation_latex: 'q = \\frac{P}{A}',
    difficulty_level: 'beginner',
    tags: ['foundation', 'bearing', 'pressure'],
    inputs: [
      { name: 'P', symbol: 'P', description: 'Column Load', unit: 'kN', default_value: 1000, min_value: 1, input_order: 1 },
      { name: 'A', symbol: 'A', description: 'Footing Area', unit: 'm²', default_value: 4, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'q', symbol: 'q', description: 'Bearing Pressure', unit: 'kPa', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_foundation_bearing_eccentric',
    name: 'Bearing Pressure (Eccentric Load)',
    description: 'Maximum bearing pressure with moment',
    domain: 'civil',
    category_slug: 'foundation',
    equation: 'q_max = (P / A) + (M * c) / I',
    equation_latex: 'q_{max} = \\frac{P}{A} + \\frac{Mc}{I}',
    difficulty_level: 'intermediate',
    tags: ['foundation', 'bearing', 'eccentric'],
    inputs: [
      { name: 'P', symbol: 'P', description: 'Column Load', unit: 'kN', default_value: 1000, min_value: 1, input_order: 1 },
      { name: 'A', symbol: 'A', description: 'Footing Area', unit: 'm²', default_value: 4, min_value: 0.1, input_order: 2 },
      { name: 'M', symbol: 'M', description: 'Moment', unit: 'kN·m', default_value: 200, min_value: 0, input_order: 3 },
      { name: 'c', symbol: 'c', description: 'Distance to Edge', unit: 'm', default_value: 1, min_value: 0.1, input_order: 4 },
      { name: 'I', symbol: 'I', description: 'Moment of Inertia', unit: 'm⁴', default_value: 1.33, min_value: 0.01, input_order: 5 }
    ],
    outputs: [
      { name: 'q_max', symbol: 'q_max', description: 'Maximum Bearing Pressure', unit: 'kPa', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_foundation_isolated_footing',
    name: 'Isolated Footing Size',
    description: 'Required footing area',
    domain: 'civil',
    category_slug: 'foundation',
    equation: 'A = P / q_allow',
    equation_latex: 'A = \\frac{P}{q_{allow}}',
    difficulty_level: 'beginner',
    tags: ['foundation', 'isolated', 'size'],
    inputs: [
      { name: 'P', symbol: 'P', description: 'Column Load', unit: 'kN', default_value: 1000, min_value: 1, input_order: 1 },
      { name: 'q_allow', symbol: 'q_allow', description: 'Allowable Bearing Capacity', unit: 'kPa', default_value: 200, min_value: 10, input_order: 2 }
    ],
    outputs: [
      { name: 'A', symbol: 'A', description: 'Required Footing Area', unit: 'm²', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_foundation_pile_capacity',
    name: 'Pile Capacity (Static)',
    description: 'Ultimate capacity of single pile',
    domain: 'civil',
    category_slug: 'foundation',
    equation: 'Qu = Qp + Qs',
    equation_latex: 'Q_u = Q_p + Q_s',
    difficulty_level: 'intermediate',
    tags: ['foundation', 'pile', 'capacity'],
    inputs: [
      { name: 'Qp', symbol: 'Q_p', description: 'End Bearing', unit: 'kN', default_value: 500, min_value: 0, input_order: 1 },
      { name: 'Qs', symbol: 'Q_s', description: 'Shaft Friction', unit: 'kN', default_value: 300, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'Qu', symbol: 'Q_u', description: 'Ultimate Pile Capacity', unit: 'kN', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_foundation_end_bearing',
    name: 'Pile End Bearing',
    description: 'End bearing capacity of pile',
    domain: 'civil',
    category_slug: 'foundation',
    equation: 'Qp = Ap * q_p',
    equation_latex: 'Q_p = A_p \\times q_p',
    difficulty_level: 'intermediate',
    tags: ['foundation', 'pile', 'end-bearing'],
    inputs: [
      { name: 'Ap', symbol: 'A_p', description: 'Pile Tip Area', unit: 'm²', default_value: 0.2, min_value: 0.01, input_order: 1 },
      { name: 'q_p', symbol: 'q_p', description: 'End Bearing Capacity', unit: 'kPa', default_value: 3000, min_value: 100, input_order: 2 }
    ],
    outputs: [
      { name: 'Qp', symbol: 'Q_p', description: 'End Bearing Capacity', unit: 'kN', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_foundation_shaft_friction',
    name: 'Pile Shaft Friction',
    description: 'Skin friction capacity of pile',
    domain: 'civil',
    category_slug: 'foundation',
    equation: 'Qs = PI * D * L * f_s',
    equation_latex: 'Q_s = \\pi D L f_s',
    difficulty_level: 'intermediate',
    tags: ['foundation', 'pile', 'friction'],
    inputs: [
      { name: 'D', symbol: 'D', description: 'Pile Diameter', unit: 'm', default_value: 0.5, min_value: 0.1, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Pile Length', unit: 'm', default_value: 15, min_value: 1, input_order: 2 },
      { name: 'f_s', symbol: 'f_s', description: 'Unit Skin Friction', unit: 'kPa', default_value: 30, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'Qs', symbol: 'Q_s', description: 'Shaft Friction Capacity', unit: 'kN', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_foundation_group_efficiency',
    name: 'Pile Group Efficiency',
    description: 'Efficiency factor for pile group',
    domain: 'civil',
    category_slug: 'foundation',
    equation: 'eta = (Q_group) / (n * Q_single)',
    equation_latex: '\\eta = \\frac{Q_{group}}{n \\times Q_{single}}',
    difficulty_level: 'advanced',
    tags: ['foundation', 'pile', 'group'],
    inputs: [
      { name: 'Q_group', symbol: 'Q_group', description: 'Group Capacity', unit: 'kN', default_value: 4000, min_value: 1, input_order: 1 },
      { name: 'n', symbol: 'n', description: 'Number of Piles', unit: '', default_value: 4, min_value: 1, input_order: 2 },
      { name: 'Q_single', symbol: 'Q_single', description: 'Single Pile Capacity', unit: 'kN', default_value: 1000, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'eta', symbol: 'η', description: 'Group Efficiency', unit: '', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_foundation_mat_thickness',
    name: 'Mat Foundation Thickness',
    description: 'Minimum thickness for mat foundation',
    domain: 'civil',
    category_slug: 'foundation',
    equation: 'h = (V_u * 1000) / (0.17 * sqrt(fc) * b)',
    equation_latex: 'h = \\frac{V_u \\times 1000}{0.17\\sqrt{f_c} \\times b}',
    difficulty_level: 'intermediate',
    tags: ['foundation', 'mat', 'thickness'],
    inputs: [
      { name: 'V_u', symbol: 'V_u', description: 'Factored Shear', unit: 'kN/m', default_value: 200, min_value: 1, input_order: 1 },
      { name: 'fc', symbol: 'f_c', description: 'Concrete Strength', unit: 'MPa', default_value: 30, min_value: 15, input_order: 2 },
      { name: 'b', symbol: 'b', description: 'Width per Meter', unit: 'mm', default_value: 1000, min_value: 100, input_order: 3 }
    ],
    outputs: [
      { name: 'h', symbol: 'h', description: 'Required Thickness', unit: 'mm', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_foundation_settlement_immediate',
    name: 'Immediate Settlement',
    description: 'Elastic settlement of foundation',
    domain: 'civil',
    category_slug: 'foundation',
    equation: 'S_i = (q * B * (1 - nu^2)) / E',
    equation_latex: 'S_i = \\frac{qB(1-\\nu^2)}{E}',
    difficulty_level: 'intermediate',
    tags: ['foundation', 'settlement', 'immediate'],
    inputs: [
      { name: 'q', symbol: 'q', description: 'Applied Pressure', unit: 'kPa', default_value: 200, min_value: 1, input_order: 1 },
      { name: 'B', symbol: 'B', description: 'Footing Width', unit: 'm', default_value: 2, min_value: 0.1, input_order: 2 },
      { name: 'nu', symbol: 'ν', description: 'Poisson\'s Ratio', unit: '', default_value: 0.3, min_value: 0, max_value: 0.5, input_order: 3 },
      { name: 'E', symbol: 'E', description: 'Soil Modulus', unit: 'kPa', default_value: 30000, min_value: 1000, input_order: 4 }
    ],
    outputs: [
      { name: 'S_i', symbol: 'S_i', description: 'Immediate Settlement', unit: 'mm', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_foundation_consolidation_settlement',
    name: 'Consolidation Settlement',
    description: 'Primary consolidation settlement',
    domain: 'civil',
    category_slug: 'foundation',
    equation: 'S_c = (Cc * H) / (1 + e_0) * log10((sigma_0 + delta_sigma) / sigma_0)',
    equation_latex: 'S_c = \\frac{C_c H}{1 + e_0} \\log_{10}\\left(\\frac{\\sigma_0 + \\Delta\\sigma}{\\sigma_0}\\right)',
    difficulty_level: 'advanced',
    tags: ['foundation', 'settlement', 'consolidation'],
    inputs: [
      { name: 'Cc', symbol: 'C_c', description: 'Compression Index', unit: '', default_value: 0.3, min_value: 0.01, input_order: 1 },
      { name: 'H', symbol: 'H', description: 'Layer Thickness', unit: 'm', default_value: 5, min_value: 0.1, input_order: 2 },
      { name: 'e_0', symbol: 'e_0', description: 'Initial Void Ratio', unit: '', default_value: 0.8, min_value: 0.3, input_order: 3 },
      { name: 'sigma_0', symbol: 'σ_0', description: 'Initial Effective Stress', unit: 'kPa', default_value: 100, min_value: 1, input_order: 4 },
      { name: 'delta_sigma', symbol: 'Δσ', description: 'Stress Increase', unit: 'kPa', default_value: 50, min_value: 1, input_order: 5 }
    ],
    outputs: [
      { name: 'S_c', symbol: 'S_c', description: 'Consolidation Settlement', unit: 'mm', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_foundation_one_way_shear',
    name: 'One-Way Shear Check',
    description: 'Shear check at distance d from column',
    domain: 'civil',
    category_slug: 'foundation',
    equation: 'V_u = q_u * (L/2 - a/2 - d) * B',
    equation_latex: 'V_u = q_u \\left(\\frac{L}{2} - \\frac{a}{2} - d\\right) B',
    difficulty_level: 'intermediate',
    tags: ['foundation', 'shear', 'one-way'],
    inputs: [
      { name: 'q_u', symbol: 'q_u', description: 'Factored Bearing Pressure', unit: 'kPa', default_value: 300, min_value: 1, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Footing Length', unit: 'm', default_value: 2.5, min_value: 0.1, input_order: 2 },
      { name: 'a', symbol: 'a', description: 'Column Width', unit: 'm', default_value: 0.4, min_value: 0.1, input_order: 3 },
      { name: 'd', symbol: 'd', description: 'Effective Depth', unit: 'm', default_value: 0.4, min_value: 0.1, input_order: 4 },
      { name: 'B', symbol: 'B', description: 'Footing Width', unit: 'm', default_value: 2.5, min_value: 0.1, input_order: 5 }
    ],
    outputs: [
      { name: 'V_u', symbol: 'V_u', description: 'Factored Shear Force', unit: 'kN', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_foundation_two_way_shear',
    name: 'Two-Way Shear Check',
    description: 'Punching shear at column interface',
    domain: 'civil',
    category_slug: 'foundation',
    equation: 'V_u = q_u * (B * L - (a + d) * (b + d))',
    equation_latex: 'V_u = q_u (BL - (a+d)(b+d))',
    difficulty_level: 'intermediate',
    tags: ['foundation', 'shear', 'two-way'],
    inputs: [
      { name: 'q_u', symbol: 'q_u', description: 'Factored Bearing Pressure', unit: 'kPa', default_value: 300, min_value: 1, input_order: 1 },
      { name: 'B', symbol: 'B', description: 'Footing Width', unit: 'm', default_value: 2.5, min_value: 0.1, input_order: 2 },
      { name: 'L', symbol: 'L', description: 'Footing Length', unit: 'm', default_value: 2.5, min_value: 0.1, input_order: 3 },
      { name: 'a', symbol: 'a', description: 'Column Width', unit: 'm', default_value: 0.4, min_value: 0.1, input_order: 4 },
      { name: 'b', symbol: 'b', description: 'Column Depth', unit: 'm', default_value: 0.4, min_value: 0.1, input_order: 5 },
      { name: 'd', symbol: 'd', description: 'Effective Depth', unit: 'm', default_value: 0.4, min_value: 0.1, input_order: 6 }
    ],
    outputs: [
      { name: 'V_u', symbol: 'V_u', description: 'Punching Shear Force', unit: 'kN', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_foundation_flexural_reinforcement',
    name: 'Footing Flexural Reinforcement',
    description: 'Required reinforcement for footing',
    domain: 'civil',
    category_slug: 'foundation',
    equation: 'As = M_u / (phi * fy * (d - a/2))',
    equation_latex: 'A_s = \\frac{M_u}{\\phi f_y (d - a/2)}',
    difficulty_level: 'intermediate',
    tags: ['foundation', 'reinforcement', 'flexural'],
    inputs: [
      { name: 'M_u', symbol: 'M_u', description: 'Factored Moment', unit: 'kN·m', default_value: 200, min_value: 1, input_order: 1 },
      { name: 'phi', symbol: 'φ', description: 'Strength Reduction Factor', unit: '', default_value: 0.9, min_value: 0.5, max_value: 1, input_order: 2 },
      { name: 'fy', symbol: 'f_y', description: 'Steel Yield Strength', unit: 'MPa', default_value: 420, min_value: 200, input_order: 3 },
      { name: 'd', symbol: 'd', description: 'Effective Depth', unit: 'mm', default_value: 400, min_value: 100, input_order: 4 },
      { name: 'a', symbol: 'a', description: 'Stress Block Depth', unit: 'mm', default_value: 50, min_value: 10, input_order: 5 }
    ],
    outputs: [
      { name: 'As', symbol: 'A_s', description: 'Required Steel Area', unit: 'mm²', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_foundation_dowel_length',
    name: 'Dowel Development Length',
    description: 'Development length for column dowels',
    domain: 'civil',
    category_slug: 'foundation',
    equation: 'ld = (fy * db) / (1.4 * sqrt(fc))',
    equation_latex: 'l_d = \\frac{f_y d_b}{1.4\\sqrt{f_c}}',
    difficulty_level: 'intermediate',
    tags: ['foundation', 'dowel', 'development'],
    inputs: [
      { name: 'fy', symbol: 'f_y', description: 'Steel Yield Strength', unit: 'MPa', default_value: 420, min_value: 200, input_order: 1 },
      { name: 'db', symbol: 'd_b', description: 'Bar Diameter', unit: 'mm', default_value: 20, min_value: 6, input_order: 2 },
      { name: 'fc', symbol: 'f_c', description: 'Concrete Strength', unit: 'MPa', default_value: 30, min_value: 15, input_order: 3 }
    ],
    outputs: [
      { name: 'ld', symbol: 'l_d', description: 'Development Length', unit: 'mm', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_foundation_uplift',
    name: 'Uplift Check',
    description: 'Check for foundation uplift',
    domain: 'civil',
    category_slug: 'foundation',
    equation: 'FS = W_footing / T',
    equation_latex: 'FS = \\frac{W_{footing}}{T}',
    difficulty_level: 'beginner',
    tags: ['foundation', 'uplift', 'safety'],
    inputs: [
      { name: 'W_footing', symbol: 'W', description: 'Footing Weight', unit: 'kN', default_value: 100, min_value: 1, input_order: 1 },
      { name: 'T', symbol: 'T', description: 'Uplift Force', unit: 'kN', default_value: 40, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'FS', symbol: 'FS', description: 'Factor of Safety', unit: '', output_order: 1, precision: 2 }
    ]
  },

  // ============================================
  // GEOTECHNICAL EQUATIONS (10 equations)
  // ============================================
  
  {
    equation_id: 'eq_geo_bearing_capacity',
    name: 'Terzaghi Bearing Capacity',
    description: 'Ultimate bearing capacity of shallow foundation',
    domain: 'civil',
    category_slug: 'geotechnical',
    equation: 'q_ult = c * Nc + q * Nq + 0.5 * gamma * B * Ngamma',
    equation_latex: 'q_{ult} = cN_c + qN_q + 0.5\\gamma B N_\\gamma',
    difficulty_level: 'advanced',
    tags: ['geotechnical', 'bearing-capacity', 'terzaghi'],
    inputs: [
      { name: 'c', symbol: 'c', description: 'Cohesion', unit: 'kPa', default_value: 20, min_value: 0, input_order: 1 },
      { name: 'Nc', symbol: 'N_c', description: 'Cohesion Factor', unit: '', default_value: 25, min_value: 1, input_order: 2 },
      { name: 'q', symbol: 'q', description: 'Surcharge', unit: 'kPa', default_value: 18, min_value: 0, input_order: 3 },
      { name: 'Nq', symbol: 'N_q', description: 'Surcharge Factor', unit: '', default_value: 12, min_value: 1, input_order: 4 },
      { name: 'gamma', symbol: 'γ', description: 'Unit Weight', unit: 'kN/m³', default_value: 18, min_value: 10, input_order: 5 },
      { name: 'B', symbol: 'B', description: 'Footing Width', unit: 'm', default_value: 2, min_value: 0.1, input_order: 6 },
      { name: 'Ngamma', symbol: 'N_γ', description: 'Width Factor', unit: '', default_value: 10, min_value: 0, input_order: 7 }
    ],
    outputs: [
      { name: 'q_ult', symbol: 'q_ult', description: 'Ultimate Bearing Capacity', unit: 'kPa', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_geo_earth_pressure_active',
    name: 'Active Earth Pressure (Rankine)',
    description: 'Active earth pressure coefficient',
    domain: 'civil',
    category_slug: 'geotechnical',
    equation: 'Ka = tan^2(45 - phi/2)',
    equation_latex: 'K_a = \\tan^2\\left(45 - \\frac{\\phi}{2}\\right)',
    difficulty_level: 'intermediate',
    tags: ['geotechnical', 'earth-pressure', 'rankine'],
    inputs: [
      { name: 'phi', symbol: 'φ', description: 'Friction Angle', unit: '°', default_value: 30, min_value: 0, max_value: 45, input_order: 1 }
    ],
    outputs: [
      { name: 'Ka', symbol: 'K_a', description: 'Active Earth Pressure Coefficient', unit: '', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_geo_earth_pressure_passive',
    name: 'Passive Earth Pressure (Rankine)',
    description: 'Passive earth pressure coefficient',
    domain: 'civil',
    category_slug: 'geotechnical',
    equation: 'Kp = tan^2(45 + phi/2)',
    equation_latex: 'K_p = \\tan^2\\left(45 + \\frac{\\phi}{2}\\right)',
    difficulty_level: 'intermediate',
    tags: ['geotechnical', 'earth-pressure', 'rankine'],
    inputs: [
      { name: 'phi', symbol: 'φ', description: 'Friction Angle', unit: '°', default_value: 30, min_value: 0, max_value: 45, input_order: 1 }
    ],
    outputs: [
      { name: 'Kp', symbol: 'K_p', description: 'Passive Earth Pressure Coefficient', unit: '', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_geo_lateral_pressure',
    name: 'Lateral Earth Pressure',
    description: 'Lateral pressure at depth',
    domain: 'civil',
    category_slug: 'geotechnical',
    equation: 'sigma_h = K * gamma * H',
    equation_latex: '\\sigma_h = K \\gamma H',
    difficulty_level: 'beginner',
    tags: ['geotechnical', 'lateral', 'pressure'],
    inputs: [
      { name: 'K', symbol: 'K', description: 'Earth Pressure Coefficient', unit: '', default_value: 0.33, min_value: 0.1, input_order: 1 },
      { name: 'gamma', symbol: 'γ', description: 'Soil Unit Weight', unit: 'kN/m³', default_value: 18, min_value: 10, input_order: 2 },
      { name: 'H', symbol: 'H', description: 'Depth', unit: 'm', default_value: 3, min_value: 0.1, input_order: 3 }
    ],
    outputs: [
      { name: 'sigma_h', symbol: 'σ_h', description: 'Lateral Pressure', unit: 'kPa', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_geo_slope_stability',
    name: 'Factor of Safety (Slope)',
    description: 'Slope stability factor of safety',
    domain: 'civil',
    category_slug: 'geotechnical',
    equation: 'FS = (c * L + W * cos(alpha) * tan(phi)) / (W * sin(alpha))',
    equation_latex: 'FS = \\frac{cL + W\\cos\\alpha\\tan\\phi}{W\\sin\\alpha}',
    difficulty_level: 'advanced',
    tags: ['geotechnical', 'slope', 'stability'],
    inputs: [
      { name: 'c', symbol: 'c', description: 'Cohesion', unit: 'kPa', default_value: 20, min_value: 0, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Failure Surface Length', unit: 'm', default_value: 10, min_value: 1, input_order: 2 },
      { name: 'W', symbol: 'W', description: 'Weight of Soil Mass', unit: 'kN/m', default_value: 100, min_value: 1, input_order: 3 },
      { name: 'alpha', symbol: 'α', description: 'Slope Angle', unit: '°', default_value: 30, min_value: 0, max_value: 90, input_order: 4 },
      { name: 'phi', symbol: 'φ', description: 'Friction Angle', unit: '°', default_value: 25, min_value: 0, input_order: 5 }
    ],
    outputs: [
      { name: 'FS', symbol: 'FS', description: 'Factor of Safety', unit: '', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_geo_void_ratio',
    name: 'Void Ratio',
    description: 'Ratio of void volume to solid volume',
    domain: 'civil',
    category_slug: 'geotechnical',
    equation: 'e = (V_v) / V_s',
    equation_latex: 'e = \\frac{V_v}{V_s}',
    difficulty_level: 'beginner',
    tags: ['geotechnical', 'void-ratio', 'soil'],
    inputs: [
      { name: 'V_v', symbol: 'V_v', description: 'Volume of Voids', unit: 'cm³', default_value: 50, min_value: 0, input_order: 1 },
      { name: 'V_s', symbol: 'V_s', description: 'Volume of Solids', unit: 'cm³', default_value: 100, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'e', symbol: 'e', description: 'Void Ratio', unit: '', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_geo_porosity',
    name: 'Porosity',
    description: 'Ratio of void volume to total volume',
    domain: 'civil',
    category_slug: 'geotechnical',
    equation: 'n = V_v / V_t',
    equation_latex: 'n = \\frac{V_v}{V_t}',
    difficulty_level: 'beginner',
    tags: ['geotechnical', 'porosity', 'soil'],
    inputs: [
      { name: 'V_v', symbol: 'V_v', description: 'Volume of Voids', unit: 'cm³', default_value: 50, min_value: 0, input_order: 1 },
      { name: 'V_t', symbol: 'V_t', description: 'Total Volume', unit: 'cm³', default_value: 150, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'n', symbol: 'n', description: 'Porosity', unit: '', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_geo_degree_saturation',
    name: 'Degree of Saturation',
    description: 'Percentage of voids filled with water',
    domain: 'civil',
    category_slug: 'geotechnical',
    equation: 'S = (V_w / V_v) * 100',
    equation_latex: 'S = \\frac{V_w}{V_v} \\times 100',
    difficulty_level: 'beginner',
    tags: ['geotechnical', 'saturation', 'soil'],
    inputs: [
      { name: 'V_w', symbol: 'V_w', description: 'Volume of Water', unit: 'cm³', default_value: 40, min_value: 0, input_order: 1 },
      { name: 'V_v', symbol: 'V_v', description: 'Volume of Voids', unit: 'cm³', default_value: 50, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'S', symbol: 'S', description: 'Degree of Saturation', unit: '%', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_geo_dry_unit_weight',
    name: 'Dry Unit Weight',
    description: 'Weight of solids per unit volume',
    domain: 'civil',
    category_slug: 'geotechnical',
    equation: 'gamma_d = gamma / (1 + w)',
    equation_latex: '\\gamma_d = \\frac{\\gamma}{1 + w}',
    difficulty_level: 'beginner',
    tags: ['geotechnical', 'unit-weight', 'soil'],
    inputs: [
      { name: 'gamma', symbol: 'γ', description: 'Bulk Unit Weight', unit: 'kN/m³', default_value: 18, min_value: 10, input_order: 1 },
      { name: 'w', symbol: 'w', description: 'Water Content', unit: '', default_value: 0.15, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'gamma_d', symbol: 'γ_d', description: 'Dry Unit Weight', unit: 'kN/m³', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_geo_shear_strength',
    name: 'Mohr-Coulomb Shear Strength',
    description: 'Shear strength of soil',
    domain: 'civil',
    category_slug: 'geotechnical',
    equation: 'tau_f = c + sigma_n * tan(phi)',
    equation_latex: '\\tau_f = c + \\sigma_n \\tan\\phi',
    difficulty_level: 'intermediate',
    tags: ['geotechnical', 'shear', 'mohr-coulomb'],
    inputs: [
      { name: 'c', symbol: 'c', description: 'Cohesion', unit: 'kPa', default_value: 20, min_value: 0, input_order: 1 },
      { name: 'sigma_n', symbol: 'σ_n', description: 'Normal Stress', unit: 'kPa', default_value: 100, min_value: 0, input_order: 2 },
      { name: 'phi', symbol: 'φ', description: 'Friction Angle', unit: '°', default_value: 30, min_value: 0, input_order: 3 }
    ],
    outputs: [
      { name: 'tau_f', symbol: 'τ_f', description: 'Shear Strength', unit: 'kPa', output_order: 1, precision: 1 }
    ]
  },

  // ============================================
  // HYDRAULICS EQUATIONS (10 equations)
  // ============================================
  
  {
    equation_id: 'eq_hydraulic_bernoulli',
    name: 'Bernoulli Equation',
    description: 'Energy equation for fluid flow',
    domain: 'civil',
    category_slug: 'hydraulics',
    equation: 'P1/rho/g + v1^2/2/g + z1 = P2/rho/g + v2^2/2/g + z2 + h_L',
    equation_latex: '\\frac{P_1}{\\rho g} + \\frac{v_1^2}{2g} + z_1 = \\frac{P_2}{\\rho g} + \\frac{v_2^2}{2g} + z_2 + h_L',
    difficulty_level: 'advanced',
    tags: ['hydraulics', 'bernoulli', 'energy'],
    inputs: [
      { name: 'P1', symbol: 'P₁', description: 'Pressure at Point 1', unit: 'Pa', default_value: 100000, min_value: 0, input_order: 1 },
      { name: 'rho', symbol: 'ρ', description: 'Fluid Density', unit: 'kg/m³', default_value: 1000, min_value: 1, input_order: 2 },
      { name: 'g', symbol: 'g', description: 'Gravity', unit: 'm/s²', default_value: 9.81, min_value: 1, input_order: 3 },
      { name: 'v1', symbol: 'v₁', description: 'Velocity at Point 1', unit: 'm/s', default_value: 2, min_value: 0, input_order: 4 },
      { name: 'z1', symbol: 'z₁', description: 'Elevation at Point 1', unit: 'm', default_value: 10, min_value: 0, input_order: 5 },
      { name: 'P2', symbol: 'P₂', description: 'Pressure at Point 2', unit: 'Pa', default_value: 50000, min_value: 0, input_order: 6 },
      { name: 'v2', symbol: 'v₂', description: 'Velocity at Point 2', unit: 'm/s', default_value: 4, min_value: 0, input_order: 7 },
      { name: 'z2', symbol: 'z₂', description: 'Elevation at Point 2', unit: 'm', default_value: 5, min_value: 0, input_order: 8 }
    ],
    outputs: [
      { name: 'h_L', symbol: 'h_L', description: 'Head Loss', unit: 'm', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_hydraulic_manning',
    name: 'Manning\'s Equation',
    description: 'Open channel flow velocity',
    domain: 'civil',
    category_slug: 'hydraulics',
    equation: 'v = (1/n) * R^(2/3) * S^(1/2)',
    equation_latex: 'v = \\frac{1}{n} R^{2/3} S^{1/2}',
    difficulty_level: 'intermediate',
    tags: ['hydraulics', 'manning', 'channel'],
    inputs: [
      { name: 'n', symbol: 'n', description: 'Manning\'s Roughness', unit: '', default_value: 0.013, min_value: 0.01, input_order: 1 },
      { name: 'R', symbol: 'R', description: 'Hydraulic Radius', unit: 'm', default_value: 0.5, min_value: 0.01, input_order: 2 },
      { name: 'S', symbol: 'S', description: 'Channel Slope', unit: 'm/m', default_value: 0.001, min_value: 0.0001, input_order: 3 }
    ],
    outputs: [
      { name: 'v', symbol: 'v', description: 'Flow Velocity', unit: 'm/s', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_hydraulic_hazen_williams',
    name: 'Hazen-Williams Equation',
    description: 'Flow velocity in pipes',
    domain: 'civil',
    category_slug: 'hydraulics',
    equation: 'v = 0.849 * C * R^(0.63) * S^(0.54)',
    equation_latex: 'v = 0.849 C R^{0.63} S^{0.54}',
    difficulty_level: 'intermediate',
    tags: ['hydraulics', 'hazen-williams', 'pipe'],
    inputs: [
      { name: 'C', symbol: 'C', description: 'Hazen-Williams Coefficient', unit: '', default_value: 100, min_value: 50, input_order: 1 },
      { name: 'R', symbol: 'R', description: 'Hydraulic Radius', unit: 'm', default_value: 0.15, min_value: 0.01, input_order: 2 },
      { name: 'S', symbol: 'S', description: 'Hydraulic Gradient', unit: 'm/m', default_value: 0.01, min_value: 0.0001, input_order: 3 }
    ],
    outputs: [
      { name: 'v', symbol: 'v', description: 'Flow Velocity', unit: 'm/s', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_hydraulic_head_loss',
    name: 'Darcy-Weisbach Head Loss',
    description: 'Head loss in pipe flow',
    domain: 'civil',
    category_slug: 'hydraulics',
    equation: 'h_f = f * (L/D) * (v^2 / (2*g))',
    equation_latex: 'h_f = f \\frac{L}{D} \\frac{v^2}{2g}',
    difficulty_level: 'intermediate',
    tags: ['hydraulics', 'head-loss', 'darcy'],
    inputs: [
      { name: 'f', symbol: 'f', description: 'Friction Factor', unit: '', default_value: 0.02, min_value: 0.001, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Pipe Length', unit: 'm', default_value: 100, min_value: 1, input_order: 2 },
      { name: 'D', symbol: 'D', description: 'Pipe Diameter', unit: 'm', default_value: 0.3, min_value: 0.01, input_order: 3 },
      { name: 'v', symbol: 'v', description: 'Flow Velocity', unit: 'm/s', default_value: 2, min_value: 0.1, input_order: 4 },
      { name: 'g', symbol: 'g', description: 'Gravity', unit: 'm/s²', default_value: 9.81, min_value: 1, input_order: 5 }
    ],
    outputs: [
      { name: 'h_f', symbol: 'h_f', description: 'Head Loss', unit: 'm', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_hydraulic_reynolds',
    name: 'Reynolds Number (Pipe)',
    description: 'Flow regime indicator',
    domain: 'civil',
    category_slug: 'hydraulics',
    equation: 'Re = (rho * v * D) / mu',
    equation_latex: 'Re = \\frac{\\rho v D}{\\mu}',
    difficulty_level: 'intermediate',
    tags: ['hydraulics', 'reynolds', 'flow'],
    inputs: [
      { name: 'rho', symbol: 'ρ', description: 'Fluid Density', unit: 'kg/m³', default_value: 1000, min_value: 1, input_order: 1 },
      { name: 'v', symbol: 'v', description: 'Flow Velocity', unit: 'm/s', default_value: 2, min_value: 0, input_order: 2 },
      { name: 'D', symbol: 'D', description: 'Pipe Diameter', unit: 'm', default_value: 0.3, min_value: 0.01, input_order: 3 },
      { name: 'mu', symbol: 'μ', description: 'Dynamic Viscosity', unit: 'Pa·s', default_value: 0.001, min_value: 0.0001, input_order: 4 }
    ],
    outputs: [
      { name: 'Re', symbol: 'Re', description: 'Reynolds Number', unit: '', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_hydraulic_flow_rate',
    name: 'Flow Rate (Continuity)',
    description: 'Volumetric flow rate',
    domain: 'civil',
    category_slug: 'hydraulics',
    equation: 'Q = A * v',
    equation_latex: 'Q = A \\times v',
    difficulty_level: 'beginner',
    tags: ['hydraulics', 'flow-rate', 'continuity'],
    inputs: [
      { name: 'A', symbol: 'A', description: 'Cross-Sectional Area', unit: 'm²', default_value: 0.07, min_value: 0.0001, input_order: 1 },
      { name: 'v', symbol: 'v', description: 'Flow Velocity', unit: 'm/s', default_value: 2, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'Q', symbol: 'Q', description: 'Flow Rate', unit: 'm³/s', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_hydraulic_hydraulic_radius',
    name: 'Hydraulic Radius',
    description: 'Ratio of area to wetted perimeter',
    domain: 'civil',
    category_slug: 'hydraulics',
    equation: 'R = A / P',
    equation_latex: 'R = \\frac{A}{P}',
    difficulty_level: 'beginner',
    tags: ['hydraulics', 'radius', 'channel'],
    inputs: [
      { name: 'A', symbol: 'A', description: 'Cross-Sectional Area', unit: 'm²', default_value: 0.5, min_value: 0.001, input_order: 1 },
      { name: 'P', symbol: 'P', description: 'Wetted Perimeter', unit: 'm', default_value: 1.5, min_value: 0.01, input_order: 2 }
    ],
    outputs: [
      { name: 'R', symbol: 'R', description: 'Hydraulic Radius', unit: 'm', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_hydraulic_orifice',
    name: 'Orifice Flow',
    description: 'Flow through orifice',
    domain: 'civil',
    category_slug: 'hydraulics',
    equation: 'Q = C_d * A * sqrt(2 * g * h)',
    equation_latex: 'Q = C_d A \\sqrt{2gh}',
    difficulty_level: 'intermediate',
    tags: ['hydraulics', 'orifice', 'flow'],
    inputs: [
      { name: 'C_d', symbol: 'C_d', description: 'Discharge Coefficient', unit: '', default_value: 0.62, min_value: 0.1, max_value: 1, input_order: 1 },
      { name: 'A', symbol: 'A', description: 'Orifice Area', unit: 'm²', default_value: 0.01, min_value: 0.0001, input_order: 2 },
      { name: 'g', symbol: 'g', description: 'Gravity', unit: 'm/s²', default_value: 9.81, min_value: 1, input_order: 3 },
      { name: 'h', symbol: 'h', description: 'Head', unit: 'm', default_value: 3, min_value: 0.01, input_order: 4 }
    ],
    outputs: [
      { name: 'Q', symbol: 'Q', description: 'Flow Rate', unit: 'm³/s', output_order: 1, precision: 5 }
    ]
  },
  {
    equation_id: 'eq_hydraulic_weir',
    name: 'Weir Flow (Rectangular)',
    description: 'Flow over rectangular weir',
    domain: 'civil',
    category_slug: 'hydraulics',
    equation: 'Q = C_d * L * h^(3/2) * sqrt(2*g)',
    equation_latex: 'Q = C_d L h^{3/2} \\sqrt{2g}',
    difficulty_level: 'intermediate',
    tags: ['hydraulics', 'weir', 'flow'],
    inputs: [
      { name: 'C_d', symbol: 'C_d', description: 'Discharge Coefficient', unit: '', default_value: 0.62, min_value: 0.1, max_value: 1, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Weir Length', unit: 'm', default_value: 2, min_value: 0.1, input_order: 2 },
      { name: 'h', symbol: 'h', description: 'Head over Weir', unit: 'm', default_value: 0.3, min_value: 0.01, input_order: 3 },
      { name: 'g', symbol: 'g', description: 'Gravity', unit: 'm/s²', default_value: 9.81, min_value: 1, input_order: 4 }
    ],
    outputs: [
      { name: 'Q', symbol: 'Q', description: 'Flow Rate', unit: 'm³/s', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_hydraulic_specific_energy',
    name: 'Specific Energy',
    description: 'Energy per unit weight of fluid',
    domain: 'civil',
    category_slug: 'hydraulics',
    equation: 'E = y + v^2 / (2*g)',
    equation_latex: 'E = y + \\frac{v^2}{2g}',
    difficulty_level: 'intermediate',
    tags: ['hydraulics', 'specific-energy', 'open-channel'],
    inputs: [
      { name: 'y', symbol: 'y', description: 'Flow Depth', unit: 'm', default_value: 1, min_value: 0.01, input_order: 1 },
      { name: 'v', symbol: 'v', description: 'Flow Velocity', unit: 'm/s', default_value: 2, min_value: 0, input_order: 2 },
      { name: 'g', symbol: 'g', description: 'Gravity', unit: 'm/s²', default_value: 9.81, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'E', symbol: 'E', description: 'Specific Energy', unit: 'm', output_order: 1, precision: 3 }
    ]
  }
];

export default civilBatch2;
