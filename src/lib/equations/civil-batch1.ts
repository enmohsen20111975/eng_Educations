/**
 * Civil Engineering Equations - Batch 1
 * Structural Analysis, Concrete Design
 * Total: 50 equations
 */

export const civilBatch1 = [
  // ============================================
  // STRUCTURAL ANALYSIS EQUATIONS (25 equations)
  // ============================================
  
  {
    equation_id: 'eq_struct_beam_moment_simple',
    name: 'Simple Beam Moment (Center Load)',
    description: 'Maximum bending moment for simply supported beam with point load at center',
    domain: 'civil',
    category_slug: 'structural',
    equation: 'M_max = (P * L) / 4',
    equation_latex: 'M_{max} = \\frac{PL}{4}',
    difficulty_level: 'beginner',
    tags: ['structural', 'beam', 'moment', 'simple'],
    inputs: [
      { name: 'P', symbol: 'P', description: 'Point Load', unit: 'N', default_value: 10000, min_value: 0, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Beam Length', unit: 'm', default_value: 6, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'M_max', symbol: 'M_max', description: 'Maximum Bending Moment', unit: 'N·m', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_struct_beam_moment_udl',
    name: 'Simple Beam Moment (UDL)',
    description: 'Maximum bending moment for simply supported beam with uniformly distributed load',
    domain: 'civil',
    category_slug: 'structural',
    equation: 'M_max = (w * L^2) / 8',
    equation_latex: 'M_{max} = \\frac{wL^2}{8}',
    difficulty_level: 'beginner',
    tags: ['structural', 'beam', 'moment', 'udl'],
    inputs: [
      { name: 'w', symbol: 'w', description: 'Uniformly Distributed Load', unit: 'N/m', default_value: 5000, min_value: 0, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Beam Length', unit: 'm', default_value: 6, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'M_max', symbol: 'M_max', description: 'Maximum Bending Moment', unit: 'N·m', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_struct_beam_shear_udl',
    name: 'Simple Beam Shear (UDL)',
    description: 'Maximum shear force for simply supported beam with UDL',
    domain: 'civil',
    category_slug: 'structural',
    equation: 'V_max = (w * L) / 2',
    equation_latex: 'V_{max} = \\frac{wL}{2}',
    difficulty_level: 'beginner',
    tags: ['structural', 'beam', 'shear', 'udl'],
    inputs: [
      { name: 'w', symbol: 'w', description: 'Uniformly Distributed Load', unit: 'N/m', default_value: 5000, min_value: 0, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Beam Length', unit: 'm', default_value: 6, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'V_max', symbol: 'V_max', description: 'Maximum Shear Force', unit: 'N', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_struct_beam_deflection_udl',
    name: 'Beam Deflection (UDL)',
    description: 'Maximum deflection for simply supported beam with UDL',
    domain: 'civil',
    category_slug: 'structural',
    equation: 'delta_max = (5 * w * L^4) / (384 * E * I)',
    equation_latex: '\\delta_{max} = \\frac{5wL^4}{384EI}',
    difficulty_level: 'intermediate',
    tags: ['structural', 'beam', 'deflection', 'udl'],
    inputs: [
      { name: 'w', symbol: 'w', description: 'Uniformly Distributed Load', unit: 'N/m', default_value: 10000, min_value: 0, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Beam Length', unit: 'm', default_value: 6, min_value: 0.1, input_order: 2 },
      { name: 'E', symbol: 'E', description: 'Modulus of Elasticity', unit: 'Pa', default_value: 200e9, min_value: 1, input_order: 3 },
      { name: 'I', symbol: 'I', description: 'Moment of Inertia', unit: 'm⁴', default_value: 8.36e-5, min_value: 1e-10, input_order: 4 }
    ],
    outputs: [
      { name: 'delta_max', symbol: 'δ_max', description: 'Maximum Deflection', unit: 'm', output_order: 1, precision: 6 }
    ]
  },
  {
    equation_id: 'eq_struct_beam_deflection_point',
    name: 'Beam Deflection (Point Load)',
    description: 'Maximum deflection for simply supported beam with center point load',
    domain: 'civil',
    category_slug: 'structural',
    equation: 'delta_max = (P * L^3) / (48 * E * I)',
    equation_latex: '\\delta_{max} = \\frac{PL^3}{48EI}',
    difficulty_level: 'intermediate',
    tags: ['structural', 'beam', 'deflection', 'point-load'],
    inputs: [
      { name: 'P', symbol: 'P', description: 'Point Load', unit: 'N', default_value: 50000, min_value: 0, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Beam Length', unit: 'm', default_value: 6, min_value: 0.1, input_order: 2 },
      { name: 'E', symbol: 'E', description: 'Modulus of Elasticity', unit: 'Pa', default_value: 200e9, min_value: 1, input_order: 3 },
      { name: 'I', symbol: 'I', description: 'Moment of Inertia', unit: 'm⁴', default_value: 8.36e-5, min_value: 1e-10, input_order: 4 }
    ],
    outputs: [
      { name: 'delta_max', symbol: 'δ_max', description: 'Maximum Deflection', unit: 'm', output_order: 1, precision: 6 }
    ]
  },
  {
    equation_id: 'eq_struct_bending_stress',
    name: 'Bending Stress',
    description: 'Calculate bending stress in beam',
    domain: 'civil',
    category_slug: 'structural',
    equation: 'sigma = (M * y) / I',
    equation_latex: '\\sigma = \\frac{My}{I}',
    difficulty_level: 'intermediate',
    tags: ['structural', 'stress', 'bending'],
    inputs: [
      { name: 'M', symbol: 'M', description: 'Bending Moment', unit: 'N·m', default_value: 50000, min_value: 0, input_order: 1 },
      { name: 'y', symbol: 'y', description: 'Distance from Neutral Axis', unit: 'm', default_value: 0.15, min_value: 0.001, input_order: 2 },
      { name: 'I', symbol: 'I', description: 'Moment of Inertia', unit: 'm⁴', default_value: 8.36e-5, min_value: 1e-10, input_order: 3 }
    ],
    outputs: [
      { name: 'sigma', symbol: 'σ', description: 'Bending Stress', unit: 'Pa', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_struct_shear_stress',
    name: 'Shear Stress',
    description: 'Calculate shear stress in beam',
    domain: 'civil',
    category_slug: 'structural',
    equation: 'tau = (V * Q) / (I * b)',
    equation_latex: '\\tau = \\frac{VQ}{Ib}',
    difficulty_level: 'intermediate',
    tags: ['structural', 'stress', 'shear'],
    inputs: [
      { name: 'V', symbol: 'V', description: 'Shear Force', unit: 'N', default_value: 30000, min_value: 0, input_order: 1 },
      { name: 'Q', symbol: 'Q', description: 'First Moment of Area', unit: 'm³', default_value: 0.002, min_value: 0.0001, input_order: 2 },
      { name: 'I', symbol: 'I', description: 'Moment of Inertia', unit: 'm⁴', default_value: 8.36e-5, min_value: 1e-10, input_order: 3 },
      { name: 'b', symbol: 'b', description: 'Width at Section', unit: 'm', default_value: 0.2, min_value: 0.01, input_order: 4 }
    ],
    outputs: [
      { name: 'tau', symbol: 'τ', description: 'Shear Stress', unit: 'Pa', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_struct_moment_inertia_rect',
    name: 'Moment of Inertia (Rectangle)',
    description: 'Calculate moment of inertia for rectangular section',
    domain: 'civil',
    category_slug: 'structural',
    equation: 'I = (b * h^3) / 12',
    equation_latex: 'I = \\frac{bh^3}{12}',
    difficulty_level: 'beginner',
    tags: ['structural', 'inertia', 'rectangle'],
    inputs: [
      { name: 'b', symbol: 'b', description: 'Width', unit: 'm', default_value: 0.3, min_value: 0.01, input_order: 1 },
      { name: 'h', symbol: 'h', description: 'Height', unit: 'm', default_value: 0.5, min_value: 0.01, input_order: 2 }
    ],
    outputs: [
      { name: 'I', symbol: 'I', description: 'Moment of Inertia', unit: 'm⁴', output_order: 1, precision: 8 }
    ]
  },
  {
    equation_id: 'eq_struct_section_modulus',
    name: 'Section Modulus',
    description: 'Calculate section modulus for beam',
    domain: 'civil',
    category_slug: 'structural',
    equation: 'S = I / y_max',
    equation_latex: 'S = \\frac{I}{y_{max}}',
    difficulty_level: 'beginner',
    tags: ['structural', 'section-modulus', 'beam'],
    inputs: [
      { name: 'I', symbol: 'I', description: 'Moment of Inertia', unit: 'm⁴', default_value: 8.36e-5, min_value: 1e-10, input_order: 1 },
      { name: 'y_max', symbol: 'y_max', description: 'Maximum Distance from Neutral Axis', unit: 'm', default_value: 0.15, min_value: 0.001, input_order: 2 }
    ],
    outputs: [
      { name: 'S', symbol: 'S', description: 'Section Modulus', unit: 'm³', output_order: 1, precision: 8 }
    ]
  },
  {
    equation_id: 'eq_struct_radius_of_gyration',
    name: 'Radius of Gyration',
    description: 'Calculate radius of gyration',
    domain: 'civil',
    category_slug: 'structural',
    equation: 'r = sqrt(I / A)',
    equation_latex: 'r = \\sqrt{\\frac{I}{A}}',
    difficulty_level: 'intermediate',
    tags: ['structural', 'gyration', 'column'],
    inputs: [
      { name: 'I', symbol: 'I', description: 'Moment of Inertia', unit: 'm⁴', default_value: 8.36e-5, min_value: 1e-10, input_order: 1 },
      { name: 'A', symbol: 'A', description: 'Cross-Sectional Area', unit: 'm²', default_value: 0.03, min_value: 0.0001, input_order: 2 }
    ],
    outputs: [
      { name: 'r', symbol: 'r', description: 'Radius of Gyration', unit: 'm', output_order: 1, precision: 5 }
    ]
  },
  {
    equation_id: 'eq_struct_slenderness_ratio',
    name: 'Slenderness Ratio',
    description: 'Calculate slenderness ratio for column',
    domain: 'civil',
    category_slug: 'structural',
    equation: 'lambda = K * L / r',
    equation_latex: '\\lambda = \\frac{KL}{r}',
    difficulty_level: 'intermediate',
    tags: ['structural', 'slenderness', 'column'],
    inputs: [
      { name: 'K', symbol: 'K', description: 'Effective Length Factor', unit: '', default_value: 1, min_value: 0.5, max_value: 2, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Column Length', unit: 'm', default_value: 4, min_value: 0.1, input_order: 2 },
      { name: 'r', symbol: 'r', description: 'Radius of Gyration', unit: 'm', default_value: 0.05, min_value: 0.001, input_order: 3 }
    ],
    outputs: [
      { name: 'lambda', symbol: 'λ', description: 'Slenderness Ratio', unit: '', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_struct_euler_critical_load',
    name: 'Euler Critical Buckling Load',
    description: 'Critical buckling load for column',
    domain: 'civil',
    category_slug: 'structural',
    equation: 'P_cr = (PI^2 * E * I) / (K * L)^2',
    equation_latex: 'P_{cr} = \\frac{\\pi^2 EI}{(KL)^2}',
    difficulty_level: 'advanced',
    tags: ['structural', 'buckling', 'euler', 'column'],
    inputs: [
      { name: 'E', symbol: 'E', description: 'Modulus of Elasticity', unit: 'Pa', default_value: 200e9, min_value: 1, input_order: 1 },
      { name: 'I', symbol: 'I', description: 'Moment of Inertia', unit: 'm⁴', default_value: 8.36e-5, min_value: 1e-10, input_order: 2 },
      { name: 'K', symbol: 'K', description: 'Effective Length Factor', unit: '', default_value: 1, min_value: 0.5, max_value: 2, input_order: 3 },
      { name: 'L', symbol: 'L', description: 'Column Length', unit: 'm', default_value: 4, min_value: 0.1, input_order: 4 }
    ],
    outputs: [
      { name: 'P_cr', symbol: 'P_cr', description: 'Critical Buckling Load', unit: 'N', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_struct_critical_stress',
    name: 'Critical Buckling Stress',
    description: 'Critical stress for column buckling',
    domain: 'civil',
    category_slug: 'structural',
    equation: 'sigma_cr = (PI^2 * E) / lambda^2',
    equation_latex: '\\sigma_{cr} = \\frac{\\pi^2 E}{\\lambda^2}',
    difficulty_level: 'advanced',
    tags: ['structural', 'buckling', 'stress', 'column'],
    inputs: [
      { name: 'E', symbol: 'E', description: 'Modulus of Elasticity', unit: 'Pa', default_value: 200e9, min_value: 1, input_order: 1 },
      { name: 'lambda', symbol: 'λ', description: 'Slenderness Ratio', unit: '', default_value: 80, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'sigma_cr', symbol: 'σ_cr', description: 'Critical Buckling Stress', unit: 'Pa', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_struct_reaction_simple_beam',
    name: 'Simple Beam Reactions (UDL)',
    description: 'Calculate reactions for simply supported beam with UDL',
    domain: 'civil',
    category_slug: 'structural',
    equation: 'R = (w * L) / 2',
    equation_latex: 'R = \\frac{wL}{2}',
    difficulty_level: 'beginner',
    tags: ['structural', 'reaction', 'beam'],
    inputs: [
      { name: 'w', symbol: 'w', description: 'Uniformly Distributed Load', unit: 'N/m', default_value: 10000, min_value: 0, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Beam Length', unit: 'm', default_value: 6, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'R', symbol: 'R', description: 'Reaction Force', unit: 'N', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_struct_cantilever_moment',
    name: 'Cantilever Moment (Point Load)',
    description: 'Maximum moment for cantilever with point load at end',
    domain: 'civil',
    category_slug: 'structural',
    equation: 'M_max = P * L',
    equation_latex: 'M_{max} = PL',
    difficulty_level: 'beginner',
    tags: ['structural', 'cantilever', 'moment'],
    inputs: [
      { name: 'P', symbol: 'P', description: 'Point Load', unit: 'N', default_value: 10000, min_value: 0, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Cantilever Length', unit: 'm', default_value: 2, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'M_max', symbol: 'M_max', description: 'Maximum Moment', unit: 'N·m', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_struct_cantilever_deflection',
    name: 'Cantilever Deflection (Point Load)',
    description: 'Maximum deflection for cantilever with point load at end',
    domain: 'civil',
    category_slug: 'structural',
    equation: 'delta_max = (P * L^3) / (3 * E * I)',
    equation_latex: '\\delta_{max} = \\frac{PL^3}{3EI}',
    difficulty_level: 'intermediate',
    tags: ['structural', 'cantilever', 'deflection'],
    inputs: [
      { name: 'P', symbol: 'P', description: 'Point Load', unit: 'N', default_value: 10000, min_value: 0, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Cantilever Length', unit: 'm', default_value: 2, min_value: 0.1, input_order: 2 },
      { name: 'E', symbol: 'E', description: 'Modulus of Elasticity', unit: 'Pa', default_value: 200e9, min_value: 1, input_order: 3 },
      { name: 'I', symbol: 'I', description: 'Moment of Inertia', unit: 'm⁴', default_value: 8.36e-5, min_value: 1e-10, input_order: 4 }
    ],
    outputs: [
      { name: 'delta_max', symbol: 'δ_max', description: 'Maximum Deflection', unit: 'm', output_order: 1, precision: 6 }
    ]
  },
  {
    equation_id: 'eq_struct_fixed_beam_moment',
    name: 'Fixed Beam Moment (UDL)',
    description: 'Fixed-end moments for beam with UDL',
    domain: 'civil',
    category_slug: 'structural',
    equation: 'M_fixed = (w * L^2) / 12',
    equation_latex: 'M_{fixed} = \\frac{wL^2}{12}',
    difficulty_level: 'intermediate',
    tags: ['structural', 'fixed-beam', 'moment'],
    inputs: [
      { name: 'w', symbol: 'w', description: 'Uniformly Distributed Load', unit: 'N/m', default_value: 10000, min_value: 0, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Beam Length', unit: 'm', default_value: 6, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'M_fixed', symbol: 'M_fixed', description: 'Fixed-End Moment', unit: 'N·m', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_struct_continuous_beam_moment',
    name: 'Continuous Beam Moment',
    description: 'Negative moment at interior support of continuous beam',
    domain: 'civil',
    category_slug: 'structural',
    equation: 'M_neg = (w * L^2) / 10',
    equation_latex: 'M_{neg} = \\frac{wL^2}{10}',
    difficulty_level: 'intermediate',
    tags: ['structural', 'continuous', 'moment'],
    inputs: [
      { name: 'w', symbol: 'w', description: 'Uniformly Distributed Load', unit: 'N/m', default_value: 10000, min_value: 0, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Span Length', unit: 'm', default_value: 6, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'M_neg', symbol: 'M_neg', description: 'Negative Moment', unit: 'N·m', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_struct_axial_stress',
    name: 'Axial Stress',
    description: 'Stress in member under axial load',
    domain: 'civil',
    category_slug: 'structural',
    equation: 'sigma = P / A',
    equation_latex: '\\sigma = \\frac{P}{A}',
    difficulty_level: 'beginner',
    tags: ['structural', 'axial', 'stress'],
    inputs: [
      { name: 'P', symbol: 'P', description: 'Axial Load', unit: 'N', default_value: 100000, min_value: 0, input_order: 1 },
      { name: 'A', symbol: 'A', description: 'Cross-Sectional Area', unit: 'm²', default_value: 0.01, min_value: 0.0001, input_order: 2 }
    ],
    outputs: [
      { name: 'sigma', symbol: 'σ', description: 'Axial Stress', unit: 'Pa', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_struct_axial_deformation',
    name: 'Axial Deformation',
    description: 'Elongation or shortening of member',
    domain: 'civil',
    category_slug: 'structural',
    equation: 'delta = (P * L) / (A * E)',
    equation_latex: '\\delta = \\frac{PL}{AE}',
    difficulty_level: 'beginner',
    tags: ['structural', 'axial', 'deformation'],
    inputs: [
      { name: 'P', symbol: 'P', description: 'Axial Load', unit: 'N', default_value: 100000, min_value: 0, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Member Length', unit: 'm', default_value: 3, min_value: 0.1, input_order: 2 },
      { name: 'A', symbol: 'A', description: 'Cross-Sectional Area', unit: 'm²', default_value: 0.01, min_value: 0.0001, input_order: 3 },
      { name: 'E', symbol: 'E', description: 'Modulus of Elasticity', unit: 'Pa', default_value: 200e9, min_value: 1, input_order: 4 }
    ],
    outputs: [
      { name: 'delta', symbol: 'δ', description: 'Axial Deformation', unit: 'm', output_order: 1, precision: 6 }
    ]
  },
  {
    equation_id: 'eq_struct_torsional_stress',
    name: 'Torsional Stress',
    description: 'Shear stress due to torsion in circular shaft',
    domain: 'civil',
    category_slug: 'structural',
    equation: 'tau = (T * r) / J',
    equation_latex: '\\tau = \\frac{Tr}{J}',
    difficulty_level: 'intermediate',
    tags: ['structural', 'torsion', 'stress'],
    inputs: [
      { name: 'T', symbol: 'T', description: 'Torque', unit: 'N·m', default_value: 5000, min_value: 0, input_order: 1 },
      { name: 'r', symbol: 'r', description: 'Radius', unit: 'm', default_value: 0.05, min_value: 0.001, input_order: 2 },
      { name: 'J', symbol: 'J', description: 'Polar Moment of Inertia', unit: 'm⁴', default_value: 9.82e-7, min_value: 1e-12, input_order: 3 }
    ],
    outputs: [
      { name: 'tau', symbol: 'τ', description: 'Torsional Shear Stress', unit: 'Pa', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_struct_polar_moment',
    name: 'Polar Moment of Inertia',
    description: 'Polar moment of inertia for circular section',
    domain: 'civil',
    category_slug: 'structural',
    equation: 'J = (PI * d^4) / 32',
    equation_latex: 'J = \\frac{\\pi d^4}{32}',
    difficulty_level: 'beginner',
    tags: ['structural', 'polar', 'inertia'],
    inputs: [
      { name: 'd', symbol: 'd', description: 'Diameter', unit: 'm', default_value: 0.1, min_value: 0.01, input_order: 1 }
    ],
    outputs: [
      { name: 'J', symbol: 'J', description: 'Polar Moment of Inertia', unit: 'm⁴', output_order: 1, precision: 10 }
    ]
  },
  {
    equation_id: 'eq_struct_combined_stress',
    name: 'Combined Bending and Axial Stress',
    description: 'Total stress from combined loading',
    domain: 'civil',
    category_slug: 'structural',
    equation: 'sigma_total = (P / A) + (M * y) / I',
    equation_latex: '\\sigma_{total} = \\frac{P}{A} + \\frac{My}{I}',
    difficulty_level: 'intermediate',
    tags: ['structural', 'combined', 'stress'],
    inputs: [
      { name: 'P', symbol: 'P', description: 'Axial Load', unit: 'N', default_value: 50000, min_value: 0, input_order: 1 },
      { name: 'A', symbol: 'A', description: 'Cross-Sectional Area', unit: 'm²', default_value: 0.01, min_value: 0.0001, input_order: 2 },
      { name: 'M', symbol: 'M', description: 'Bending Moment', unit: 'N·m', default_value: 20000, min_value: 0, input_order: 3 },
      { name: 'y', symbol: 'y', description: 'Distance from Neutral Axis', unit: 'm', default_value: 0.15, min_value: 0.001, input_order: 4 },
      { name: 'I', symbol: 'I', description: 'Moment of Inertia', unit: 'm⁴', default_value: 8.36e-5, min_value: 1e-10, input_order: 5 }
    ],
    outputs: [
      { name: 'sigma_total', symbol: 'σ_total', description: 'Total Stress', unit: 'Pa', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_struct_principal_stress',
    name: 'Principal Stress',
    description: 'Maximum principal stress from biaxial stress state',
    domain: 'civil',
    category_slug: 'structural',
    equation: 'sigma_1 = (sigma_x + sigma_y) / 2 + sqrt(((sigma_x - sigma_y) / 2)^2 + tau_xy^2)',
    equation_latex: '\\sigma_1 = \\frac{\\sigma_x + \\sigma_y}{2} + \\sqrt{\\left(\\frac{\\sigma_x - \\sigma_y}{2}\\right)^2 + \\tau_{xy}^2}',
    difficulty_level: 'advanced',
    tags: ['structural', 'principal', 'stress'],
    inputs: [
      { name: 'sigma_x', symbol: 'σ_x', description: 'Stress in X Direction', unit: 'Pa', default_value: 100e6, min_value: 0, input_order: 1 },
      { name: 'sigma_y', symbol: 'σ_y', description: 'Stress in Y Direction', unit: 'Pa', default_value: 50e6, min_value: 0, input_order: 2 },
      { name: 'tau_xy', symbol: 'τ_xy', description: 'Shear Stress', unit: 'Pa', default_value: 30e6, min_value: 0, input_order: 3 }
    ],
    outputs: [
      { name: 'sigma_1', symbol: 'σ₁', description: 'Principal Stress', unit: 'Pa', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_struct_von_mises',
    name: 'Von Mises Stress',
    description: 'Equivalent stress for ductile materials',
    domain: 'civil',
    category_slug: 'structural',
    equation: 'sigma_vm = sqrt(sigma_x^2 - sigma_x * sigma_y + sigma_y^2 + 3 * tau_xy^2)',
    equation_latex: '\\sigma_{vm} = \\sqrt{\\sigma_x^2 - \\sigma_x\\sigma_y + \\sigma_y^2 + 3\\tau_{xy}^2}',
    difficulty_level: 'advanced',
    tags: ['structural', 'von-mises', 'stress'],
    inputs: [
      { name: 'sigma_x', symbol: 'σ_x', description: 'Stress in X Direction', unit: 'Pa', default_value: 100e6, min_value: 0, input_order: 1 },
      { name: 'sigma_y', symbol: 'σ_y', description: 'Stress in Y Direction', unit: 'Pa', default_value: 50e6, min_value: 0, input_order: 2 },
      { name: 'tau_xy', symbol: 'τ_xy', description: 'Shear Stress', unit: 'Pa', default_value: 30e6, min_value: 0, input_order: 3 }
    ],
    outputs: [
      { name: 'sigma_vm', symbol: 'σ_vm', description: 'Von Mises Stress', unit: 'Pa', output_order: 1, precision: 0 }
    ]
  },

  // ============================================
  // CONCRETE DESIGN EQUATIONS (25 equations)
  // ============================================
  
  {
    equation_id: 'eq_concrete_flexural_capacity',
    name: 'Flexural Capacity (Rectangular)',
    description: 'Moment capacity of reinforced concrete beam',
    domain: 'civil',
    category_slug: 'concrete',
    equation: 'Mn = As * fy * (d - a/2)',
    equation_latex: 'M_n = A_s f_y \\left(d - \\frac{a}{2}\\right)',
    difficulty_level: 'intermediate',
    tags: ['concrete', 'flexural', 'capacity'],
    inputs: [
      { name: 'As', symbol: 'A_s', description: 'Steel Area', unit: 'mm²', default_value: 1000, min_value: 1, input_order: 1 },
      { name: 'fy', symbol: 'f_y', description: 'Steel Yield Strength', unit: 'MPa', default_value: 420, min_value: 200, input_order: 2 },
      { name: 'd', symbol: 'd', description: 'Effective Depth', unit: 'mm', default_value: 500, min_value: 100, input_order: 3 },
      { name: 'a', symbol: 'a', description: 'Stress Block Depth', unit: 'mm', default_value: 100, min_value: 10, input_order: 4 }
    ],
    outputs: [
      { name: 'Mn', symbol: 'M_n', description: 'Nominal Moment Capacity', unit: 'kN·m', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_concrete_stress_block',
    name: 'Whitney Stress Block Depth',
    description: 'Depth of equivalent rectangular stress block',
    domain: 'civil',
    category_slug: 'concrete',
    equation: 'a = (As * fy) / (0.85 * fc * b)',
    equation_latex: 'a = \\frac{A_s f_y}{0.85 f_c b}',
    difficulty_level: 'intermediate',
    tags: ['concrete', 'stress-block', 'whitney'],
    inputs: [
      { name: 'As', symbol: 'A_s', description: 'Steel Area', unit: 'mm²', default_value: 1000, min_value: 1, input_order: 1 },
      { name: 'fy', symbol: 'f_y', description: 'Steel Yield Strength', unit: 'MPa', default_value: 420, min_value: 200, input_order: 2 },
      { name: 'fc', symbol: 'f_c', description: 'Concrete Compressive Strength', unit: 'MPa', default_value: 30, min_value: 15, input_order: 3 },
      { name: 'b', symbol: 'b', description: 'Beam Width', unit: 'mm', default_value: 300, min_value: 100, input_order: 4 }
    ],
    outputs: [
      { name: 'a', symbol: 'a', description: 'Stress Block Depth', unit: 'mm', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_concrete_shear_capacity',
    name: 'Concrete Shear Capacity',
    description: 'Shear capacity of concrete without reinforcement',
    domain: 'civil',
    category_slug: 'concrete',
    equation: 'Vc = 0.17 * sqrt(fc) * b * d',
    equation_latex: 'V_c = 0.17\\sqrt{f_c} \\times b \\times d',
    difficulty_level: 'intermediate',
    tags: ['concrete', 'shear', 'capacity'],
    inputs: [
      { name: 'fc', symbol: 'f_c', description: 'Concrete Compressive Strength', unit: 'MPa', default_value: 30, min_value: 15, input_order: 1 },
      { name: 'b', symbol: 'b', description: 'Beam Width', unit: 'mm', default_value: 300, min_value: 100, input_order: 2 },
      { name: 'd', symbol: 'd', description: 'Effective Depth', unit: 'mm', default_value: 500, min_value: 100, input_order: 3 }
    ],
    outputs: [
      { name: 'Vc', symbol: 'V_c', description: 'Concrete Shear Capacity', unit: 'kN', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_concrete_stirrup_spacing',
    name: 'Stirrup Spacing',
    description: 'Required spacing for shear reinforcement',
    domain: 'civil',
    category_slug: 'concrete',
    equation: 's = (Av * fy * d) / (Vu - phi * Vc)',
    equation_latex: 's = \\frac{A_v f_y d}{V_u - \\phi V_c}',
    difficulty_level: 'advanced',
    tags: ['concrete', 'stirrup', 'spacing'],
    inputs: [
      { name: 'Av', symbol: 'A_v', description: 'Stirrup Area', unit: 'mm²', default_value: 100, min_value: 10, input_order: 1 },
      { name: 'fy', symbol: 'f_y', description: 'Steel Yield Strength', unit: 'MPa', default_value: 420, min_value: 200, input_order: 2 },
      { name: 'd', symbol: 'd', description: 'Effective Depth', unit: 'mm', default_value: 500, min_value: 100, input_order: 3 },
      { name: 'Vu', symbol: 'V_u', description: 'Factored Shear', unit: 'kN', default_value: 200, min_value: 1, input_order: 4 },
      { name: 'Vc', symbol: 'V_c', description: 'Concrete Shear Capacity', unit: 'kN', default_value: 80, min_value: 1, input_order: 5 },
      { name: 'phi', symbol: 'φ', description: 'Strength Reduction Factor', unit: '', default_value: 0.75, min_value: 0.5, max_value: 1, input_order: 6 }
    ],
    outputs: [
      { name: 's', symbol: 's', description: 'Stirrup Spacing', unit: 'mm', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_concrete_balanced_reinforcement',
    name: 'Balanced Reinforcement Ratio',
    description: 'Reinforcement ratio for balanced condition',
    domain: 'civil',
    category_slug: 'concrete',
    equation: 'rho_b = (0.85 * beta1 * fc / fy) * (600 / (600 + fy))',
    equation_latex: '\\rho_b = \\frac{0.85\\beta_1 f_c}{f_y} \\times \\frac{600}{600 + f_y}',
    difficulty_level: 'advanced',
    tags: ['concrete', 'balanced', 'reinforcement'],
    inputs: [
      { name: 'beta1', symbol: 'β₁', description: 'Stress Block Factor', unit: '', default_value: 0.85, min_value: 0.65, max_value: 0.85, input_order: 1 },
      { name: 'fc', symbol: 'f_c', description: 'Concrete Strength', unit: 'MPa', default_value: 30, min_value: 15, input_order: 2 },
      { name: 'fy', symbol: 'f_y', description: 'Steel Yield Strength', unit: 'MPa', default_value: 420, min_value: 200, input_order: 3 }
    ],
    outputs: [
      { name: 'rho_b', symbol: 'ρ_b', description: 'Balanced Reinforcement Ratio', unit: '', output_order: 1, precision: 5 }
    ]
  },
  {
    equation_id: 'eq_concrete_reinforcement_ratio',
    name: 'Reinforcement Ratio',
    description: 'Actual reinforcement ratio',
    domain: 'civil',
    category_slug: 'concrete',
    equation: 'rho = As / (b * d)',
    equation_latex: '\\rho = \\frac{A_s}{bd}',
    difficulty_level: 'beginner',
    tags: ['concrete', 'reinforcement', 'ratio'],
    inputs: [
      { name: 'As', symbol: 'A_s', description: 'Steel Area', unit: 'mm²', default_value: 1000, min_value: 1, input_order: 1 },
      { name: 'b', symbol: 'b', description: 'Beam Width', unit: 'mm', default_value: 300, min_value: 100, input_order: 2 },
      { name: 'd', symbol: 'd', description: 'Effective Depth', unit: 'mm', default_value: 500, min_value: 100, input_order: 3 }
    ],
    outputs: [
      { name: 'rho', symbol: 'ρ', description: 'Reinforcement Ratio', unit: '', output_order: 1, precision: 5 }
    ]
  },
  {
    equation_id: 'eq_concrete_min_reinforcement',
    name: 'Minimum Reinforcement',
    description: 'Minimum flexural reinforcement',
    domain: 'civil',
    category_slug: 'concrete',
    equation: 'As_min = max(1.4 * b * d / fy, 0.25 * sqrt(fc) * b * d / fy)',
    equation_latex: 'A_{s,min} = \\max\\left(\\frac{1.4bd}{f_y}, \\frac{0.25\\sqrt{f_c}bd}{f_y}\\right)',
    difficulty_level: 'intermediate',
    tags: ['concrete', 'minimum', 'reinforcement'],
    inputs: [
      { name: 'b', symbol: 'b', description: 'Beam Width', unit: 'mm', default_value: 300, min_value: 100, input_order: 1 },
      { name: 'd', symbol: 'd', description: 'Effective Depth', unit: 'mm', default_value: 500, min_value: 100, input_order: 2 },
      { name: 'fc', symbol: 'f_c', description: 'Concrete Strength', unit: 'MPa', default_value: 30, min_value: 15, input_order: 3 },
      { name: 'fy', symbol: 'f_y', description: 'Steel Yield Strength', unit: 'MPa', default_value: 420, min_value: 200, input_order: 4 }
    ],
    outputs: [
      { name: 'As_min', symbol: 'A_s,min', description: 'Minimum Steel Area', unit: 'mm²', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_concrete_column_capacity',
    name: 'Column Capacity (Axial)',
    description: 'Axial capacity of short reinforced concrete column',
    domain: 'civil',
    category_slug: 'concrete',
    equation: 'Pn = 0.85 * fc * (Ag - As) + As * fy',
    equation_latex: 'P_n = 0.85f_c(A_g - A_s) + A_s f_y',
    difficulty_level: 'intermediate',
    tags: ['concrete', 'column', 'capacity'],
    inputs: [
      { name: 'fc', symbol: 'f_c', description: 'Concrete Strength', unit: 'MPa', default_value: 30, min_value: 15, input_order: 1 },
      { name: 'Ag', symbol: 'A_g', description: 'Gross Area', unit: 'mm²', default_value: 100000, min_value: 1000, input_order: 2 },
      { name: 'As', symbol: 'A_s', description: 'Steel Area', unit: 'mm²', default_value: 3000, min_value: 0, input_order: 3 },
      { name: 'fy', symbol: 'f_y', description: 'Steel Yield Strength', unit: 'MPa', default_value: 420, min_value: 200, input_order: 4 }
    ],
    outputs: [
      { name: 'Pn', symbol: 'P_n', description: 'Nominal Axial Capacity', unit: 'kN', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_concrete_development_length',
    name: 'Development Length',
    description: 'Required development length for reinforcing bar',
    domain: 'civil',
    category_slug: 'concrete',
    equation: 'ld = (fy * db) / (1.4 * sqrt(fc))',
    equation_latex: 'l_d = \\frac{f_y d_b}{1.4\\sqrt{f_c}}',
    difficulty_level: 'intermediate',
    tags: ['concrete', 'development', 'length'],
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
    equation_id: 'eq_concrete_modulus_elasticity',
    name: 'Modulus of Elasticity (Concrete)',
    description: 'Elastic modulus of concrete',
    domain: 'civil',
    category_slug: 'concrete',
    equation: 'Ec = 4700 * sqrt(fc)',
    equation_latex: 'E_c = 4700\\sqrt{f_c}',
    difficulty_level: 'beginner',
    tags: ['concrete', 'modulus', 'elasticity'],
    inputs: [
      { name: 'fc', symbol: 'f_c', description: 'Concrete Compressive Strength', unit: 'MPa', default_value: 30, min_value: 15, input_order: 1 }
    ],
    outputs: [
      { name: 'Ec', symbol: 'E_c', description: 'Modulus of Elasticity', unit: 'MPa', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_concrete_tensile_strength',
    name: 'Concrete Tensile Strength',
    description: 'Estimated tensile strength from compressive strength',
    domain: 'civil',
    category_slug: 'concrete',
    equation: 'ft = 0.62 * sqrt(fc)',
    equation_latex: 'f_t = 0.62\\sqrt{f_c}',
    difficulty_level: 'beginner',
    tags: ['concrete', 'tensile', 'strength'],
    inputs: [
      { name: 'fc', symbol: 'f_c', description: 'Compressive Strength', unit: 'MPa', default_value: 30, min_value: 15, input_order: 1 }
    ],
    outputs: [
      { name: 'ft', symbol: 'f_t', description: 'Tensile Strength', unit: 'MPa', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_concrete_cracking_moment',
    name: 'Cracking Moment',
    description: 'Moment at which concrete cracks',
    domain: 'civil',
    category_slug: 'concrete',
    equation: 'Mcr = (ft * Ig) / yt',
    equation_latex: 'M_{cr} = \\frac{f_t I_g}{y_t}',
    difficulty_level: 'intermediate',
    tags: ['concrete', 'cracking', 'moment'],
    inputs: [
      { name: 'ft', symbol: 'f_t', description: 'Tensile Strength', unit: 'MPa', default_value: 3.4, min_value: 0.1, input_order: 1 },
      { name: 'Ig', symbol: 'I_g', description: 'Gross Moment of Inertia', unit: 'mm⁴', default_value: 3.125e9, min_value: 1e6, input_order: 2 },
      { name: 'yt', symbol: 'y_t', description: 'Distance to Tension Fiber', unit: 'mm', default_value: 250, min_value: 10, input_order: 3 }
    ],
    outputs: [
      { name: 'Mcr', symbol: 'M_cr', description: 'Cracking Moment', unit: 'kN·m', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_concrete_slab_thickness',
    name: 'Minimum Slab Thickness',
    description: 'Minimum thickness for one-way slab',
    domain: 'civil',
    category_slug: 'concrete',
    equation: 'h_min = L / 20',
    equation_latex: 'h_{min} = \\frac{L}{20}',
    difficulty_level: 'beginner',
    tags: ['concrete', 'slab', 'thickness'],
    inputs: [
      { name: 'L', symbol: 'L', description: 'Span Length', unit: 'mm', default_value: 4000, min_value: 1000, input_order: 1 }
    ],
    outputs: [
      { name: 'h_min', symbol: 'h_min', description: 'Minimum Thickness', unit: 'mm', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_concrete_two_way_slab',
    name: 'Two-Way Slab Thickness',
    description: 'Minimum thickness for two-way slab',
    domain: 'civil',
    category_slug: 'concrete',
    equation: 'h_min = L_n / 30',
    equation_latex: 'h_{min} = \\frac{L_n}{30}',
    difficulty_level: 'beginner',
    tags: ['concrete', 'slab', 'two-way'],
    inputs: [
      { name: 'L_n', symbol: 'L_n', description: 'Clear Span', unit: 'mm', default_value: 6000, min_value: 1000, input_order: 1 }
    ],
    outputs: [
      { name: 'h_min', symbol: 'h_min', description: 'Minimum Thickness', unit: 'mm', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_concrete_punching_shear',
    name: 'Punching Shear Stress',
    description: 'Shear stress around column in flat slab',
    domain: 'civil',
    category_slug: 'concrete',
    equation: 'tau_v = V_u / (b_0 * d)',
    equation_latex: '\\tau_v = \\frac{V_u}{b_0 d}',
    difficulty_level: 'intermediate',
    tags: ['concrete', 'punching', 'shear'],
    inputs: [
      { name: 'V_u', symbol: 'V_u', description: 'Factored Shear', unit: 'kN', default_value: 200, min_value: 1, input_order: 1 },
      { name: 'b_0', symbol: 'b_0', description: 'Critical Perimeter', unit: 'mm', default_value: 2000, min_value: 100, input_order: 2 },
      { name: 'd', symbol: 'd', description: 'Effective Depth', unit: 'mm', default_value: 200, min_value: 50, input_order: 3 }
    ],
    outputs: [
      { name: 'tau_v', symbol: 'τ_v', description: 'Punching Shear Stress', unit: 'MPa', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_concrete_punching_capacity',
    name: 'Punching Shear Capacity',
    description: 'Concrete punching shear capacity',
    domain: 'civil',
    category_slug: 'concrete',
    equation: 'V_c = 0.33 * sqrt(fc) * b_0 * d',
    equation_latex: 'V_c = 0.33\\sqrt{f_c} \\times b_0 \\times d',
    difficulty_level: 'intermediate',
    tags: ['concrete', 'punching', 'capacity'],
    inputs: [
      { name: 'fc', symbol: 'f_c', description: 'Concrete Strength', unit: 'MPa', default_value: 30, min_value: 15, input_order: 1 },
      { name: 'b_0', symbol: 'b_0', description: 'Critical Perimeter', unit: 'mm', default_value: 2000, min_value: 100, input_order: 2 },
      { name: 'd', symbol: 'd', description: 'Effective Depth', unit: 'mm', default_value: 200, min_value: 50, input_order: 3 }
    ],
    outputs: [
      { name: 'V_c', symbol: 'V_c', description: 'Punching Shear Capacity', unit: 'kN', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_concrete_bearing_capacity',
    name: 'Bearing Capacity',
    description: 'Concrete bearing strength',
    domain: 'civil',
    category_slug: 'concrete',
    equation: 'B_n = 0.85 * fc * A_1',
    equation_latex: 'B_n = 0.85 f_c A_1',
    difficulty_level: 'intermediate',
    tags: ['concrete', 'bearing', 'capacity'],
    inputs: [
      { name: 'fc', symbol: 'f_c', description: 'Concrete Strength', unit: 'MPa', default_value: 30, min_value: 15, input_order: 1 },
      { name: 'A_1', symbol: 'A₁', description: 'Loaded Area', unit: 'mm²', default_value: 50000, min_value: 100, input_order: 2 }
    ],
    outputs: [
      { name: 'B_n', symbol: 'B_n', description: 'Bearing Capacity', unit: 'kN', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_concrete_anchor_pullout',
    name: 'Anchor Pullout Capacity',
    description: 'Concrete breakout capacity for anchor in tension',
    domain: 'civil',
    category_slug: 'concrete',
    equation: 'N_b = 10 * sqrt(fc) * h_ef^1.5',
    equation_latex: 'N_b = 10\\sqrt{f_c} h_{ef}^{1.5}',
    difficulty_level: 'advanced',
    tags: ['concrete', 'anchor', 'pullout'],
    inputs: [
      { name: 'fc', symbol: 'f_c', description: 'Concrete Strength', unit: 'MPa', default_value: 30, min_value: 15, input_order: 1 },
      { name: 'h_ef', symbol: 'h_ef', description: 'Effective Embedment', unit: 'mm', default_value: 150, min_value: 25, input_order: 2 }
    ],
    outputs: [
      { name: 'N_b', symbol: 'N_b', description: 'Breakout Capacity', unit: 'kN', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_concrete_deflection_immediate',
    name: 'Immediate Deflection',
    description: 'Immediate deflection of concrete beam',
    domain: 'civil',
    category_slug: 'concrete',
    equation: 'delta = (K * M * L^2) / (Ec * I_e)',
    equation_latex: '\\delta = \\frac{KM L^2}{E_c I_e}',
    difficulty_level: 'advanced',
    tags: ['concrete', 'deflection', 'immediate'],
    inputs: [
      { name: 'K', symbol: 'K', description: 'Deflection Coefficient', unit: '', default_value: 5, min_value: 1, input_order: 1 },
      { name: 'M', symbol: 'M', description: 'Moment', unit: 'N·mm', default_value: 100e6, min_value: 0, input_order: 2 },
      { name: 'L', symbol: 'L', description: 'Span Length', unit: 'mm', default_value: 6000, min_value: 1000, input_order: 3 },
      { name: 'Ec', symbol: 'E_c', description: 'Modulus of Elasticity', unit: 'MPa', default_value: 25000, min_value: 1000, input_order: 4 },
      { name: 'I_e', symbol: 'I_e', description: 'Effective Moment of Inertia', unit: 'mm⁴', default_value: 2e9, min_value: 1e6, input_order: 5 }
    ],
    outputs: [
      { name: 'delta', symbol: 'δ', description: 'Immediate Deflection', unit: 'mm', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_concrete_effective_inertia',
    name: 'Effective Moment of Inertia',
    description: 'Branson\'s effective moment of inertia',
    domain: 'civil',
    category_slug: 'concrete',
    equation: 'I_e = (M_cr / M_a)^3 * I_g + (1 - (M_cr / M_a)^3) * I_cr',
    equation_latex: 'I_e = \\left(\\frac{M_{cr}}{M_a}\\right)^3 I_g + \\left(1 - \\left(\\frac{M_{cr}}{M_a}\\right)^3\\right) I_{cr}',
    difficulty_level: 'advanced',
    tags: ['concrete', 'inertia', 'effective'],
    inputs: [
      { name: 'M_cr', symbol: 'M_cr', description: 'Cracking Moment', unit: 'kN·m', default_value: 30, min_value: 0.1, input_order: 1 },
      { name: 'M_a', symbol: 'M_a', description: 'Applied Moment', unit: 'kN·m', default_value: 50, min_value: 0.1, input_order: 2 },
      { name: 'I_g', symbol: 'I_g', description: 'Gross Moment of Inertia', unit: 'mm⁴', default_value: 3e9, min_value: 1e6, input_order: 3 },
      { name: 'I_cr', symbol: 'I_cr', description: 'Cracked Moment of Inertia', unit: 'mm⁴', default_value: 1e9, min_value: 1e5, input_order: 4 }
    ],
    outputs: [
      { name: 'I_e', symbol: 'I_e', description: 'Effective Moment of Inertia', unit: 'mm⁴', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_concrete_creep_coefficient',
    name: 'Creep Coefficient',
    description: 'Ultimate creep coefficient estimation',
    domain: 'civil',
    category_slug: 'concrete',
    equation: 'phi_u = 2.35 * K_h * K_s',
    equation_latex: '\\phi_u = 2.35 K_h K_s',
    difficulty_level: 'advanced',
    tags: ['concrete', 'creep', 'coefficient'],
    inputs: [
      { name: 'K_h', symbol: 'K_h', description: 'Humidity Factor', unit: '', default_value: 1.2, min_value: 0.5, max_value: 2, input_order: 1 },
      { name: 'K_s', symbol: 'K_s', description: 'Slump Factor', unit: '', default_value: 1.0, min_value: 0.5, max_value: 2, input_order: 2 }
    ],
    outputs: [
      { name: 'phi_u', symbol: 'φ_u', description: 'Ultimate Creep Coefficient', unit: '', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_concrete_shrinkage',
    name: 'Shrinkage Strain',
    description: 'Ultimate shrinkage strain',
    domain: 'civil',
    category_slug: 'concrete',
    equation: 'epsilon_sh = 0.0008 * K_s * K_h',
    equation_latex: '\\varepsilon_{sh} = 0.0008 K_s K_h',
    difficulty_level: 'intermediate',
    tags: ['concrete', 'shrinkage', 'strain'],
    inputs: [
      { name: 'K_s', symbol: 'K_s', description: 'Slump Factor', unit: '', default_value: 1.0, min_value: 0.5, max_value: 2, input_order: 1 },
      { name: 'K_h', symbol: 'K_h', description: 'Humidity Factor', unit: '', default_value: 1.2, min_value: 0.5, max_value: 2, input_order: 2 }
    ],
    outputs: [
      { name: 'epsilon_sh', symbol: 'ε_sh', description: 'Shrinkage Strain', unit: '', output_order: 1, precision: 6 }
    ]
  },
  {
    equation_id: 'eq_concrete_long_term_deflection',
    name: 'Long-Term Deflection',
    description: 'Additional deflection from creep and shrinkage',
    domain: 'civil',
    category_slug: 'concrete',
    equation: 'delta_lt = lambda * delta_i',
    equation_latex: '\\delta_{lt} = \\lambda \\times \\delta_i',
    difficulty_level: 'intermediate',
    tags: ['concrete', 'deflection', 'long-term'],
    inputs: [
      { name: 'lambda', symbol: 'λ', description: 'Time-Dependent Factor', unit: '', default_value: 2, min_value: 1, max_value: 4, input_order: 1 },
      { name: 'delta_i', symbol: 'δ_i', description: 'Immediate Deflection', unit: 'mm', default_value: 5, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'delta_lt', symbol: 'δ_lt', description: 'Long-Term Deflection', unit: 'mm', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_concrete_prestress_loss',
    name: 'Prestress Loss (Elastic)',
    description: 'Elastic shortening loss in prestressed concrete',
    domain: 'civil',
    category_slug: 'concrete',
    equation: 'delta_f_es = (E_s / E_c) * f_cir',
    equation_latex: '\\Delta f_{es} = \\frac{E_s}{E_c} \\times f_{cir}',
    difficulty_level: 'advanced',
    tags: ['concrete', 'prestress', 'loss'],
    inputs: [
      { name: 'E_s', symbol: 'E_s', description: 'Steel Modulus', unit: 'MPa', default_value: 200000, min_value: 100000, input_order: 1 },
      { name: 'E_c', symbol: 'E_c', description: 'Concrete Modulus', unit: 'MPa', default_value: 30000, min_value: 10000, input_order: 2 },
      { name: 'f_cir', symbol: 'f_cir', description: 'Concrete Stress at Centroid', unit: 'MPa', default_value: 15, min_value: 0, input_order: 3 }
    ],
    outputs: [
      { name: 'delta_f_es', symbol: 'Δf_es', description: 'Elastic Shortening Loss', unit: 'MPa', output_order: 1, precision: 1 }
    ]
  }
];

export default civilBatch1;
