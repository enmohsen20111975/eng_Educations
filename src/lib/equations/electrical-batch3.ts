/**
 * Electrical Engineering Equations - Batch 3
 * Motor, Lighting, Protection, Earthing
 * Total: 52 equations
 */

export const electricalBatch3 = [
  // ============================================
  // MOTOR EQUATIONS (15 equations)
  // ============================================
  
  {
    equation_id: 'eq_motor_power',
    name: 'Motor Output Power',
    description: 'Calculate motor output mechanical power',
    domain: 'electrical',
    category_slug: 'motor',
    equation: 'P_out = (T * N) / 9.549',
    equation_latex: 'P_{out} = \\frac{T \\times N}{9.549}',
    difficulty_level: 'intermediate',
    tags: ['motor', 'power', 'torque', 'speed'],
    inputs: [
      { name: 'T', symbol: 'T', description: 'Torque', unit: 'N·m', default_value: 100, min_value: 0, input_order: 1 },
      { name: 'N', symbol: 'N', description: 'Speed', unit: 'rpm', default_value: 1450, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'P_out', symbol: 'P_out', description: 'Output Power', unit: 'kW', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_motor_torque',
    name: 'Motor Torque',
    description: 'Calculate motor torque from power and speed',
    domain: 'electrical',
    category_slug: 'motor',
    equation: 'T = (P * 9.549) / N',
    equation_latex: 'T = \\frac{P \\times 9.549}{N}',
    difficulty_level: 'intermediate',
    tags: ['motor', 'torque', 'power'],
    inputs: [
      { name: 'P', symbol: 'P', description: 'Power', unit: 'kW', default_value: 15, min_value: 0, input_order: 1 },
      { name: 'N', symbol: 'N', description: 'Speed', unit: 'rpm', default_value: 1450, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'T', symbol: 'T', description: 'Torque', unit: 'N·m', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_motor_full_load_current',
    name: 'Motor Full Load Current',
    description: 'Calculate motor full load current from power',
    domain: 'electrical',
    category_slug: 'motor',
    equation: 'I_fl = (P * 1000) / (sqrt(3) * V * PF * eta)',
    equation_latex: 'I_{fl} = \\frac{P \\times 1000}{\\sqrt{3} \\times V \\times PF \\times \\eta}',
    difficulty_level: 'intermediate',
    tags: ['motor', 'current', 'full-load'],
    inputs: [
      { name: 'P', symbol: 'P', description: 'Motor Power', unit: 'kW', default_value: 15, min_value: 0.1, input_order: 1 },
      { name: 'V', symbol: 'V', description: 'Voltage', unit: 'V', default_value: 400, min_value: 100, input_order: 2 },
      { name: 'PF', symbol: 'PF', description: 'Power Factor', unit: '', default_value: 0.85, min_value: 0.1, max_value: 1, input_order: 3 },
      { name: 'eta', symbol: 'η', description: 'Efficiency', unit: '', default_value: 0.9, min_value: 0.1, max_value: 1, input_order: 4 }
    ],
    outputs: [
      { name: 'I_fl', symbol: 'I_fl', description: 'Full Load Current', unit: 'A', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_motor_starting_current_dol',
    name: 'DOL Starting Current',
    description: 'Calculate direct-on-line starting current',
    domain: 'electrical',
    category_slug: 'motor',
    equation: 'I_start = I_fl * K_start',
    equation_latex: 'I_{start} = I_{fl} \\times K_{start}',
    difficulty_level: 'intermediate',
    tags: ['motor', 'starting', 'dol', 'current'],
    inputs: [
      { name: 'I_fl', symbol: 'I_fl', description: 'Full Load Current', unit: 'A', default_value: 30, min_value: 0.1, input_order: 1 },
      { name: 'K_start', symbol: 'K_start', description: 'Starting Current Multiplier', unit: '', default_value: 7, min_value: 4, max_value: 10, input_order: 2 }
    ],
    outputs: [
      { name: 'I_start', symbol: 'I_start', description: 'Starting Current', unit: 'A', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_motor_starting_current_sdelta',
    name: 'Star-Delta Starting Current',
    description: 'Calculate star-delta starting current',
    domain: 'electrical',
    category_slug: 'motor',
    equation: 'I_start_sd = I_start_dol / 3',
    equation_latex: 'I_{start(sd)} = \\frac{I_{start(dol)}}{3}',
    difficulty_level: 'intermediate',
    tags: ['motor', 'starting', 'star-delta'],
    inputs: [
      { name: 'I_start_dol', symbol: 'I_start(dol)', description: 'DOL Starting Current', unit: 'A', default_value: 210, min_value: 1, input_order: 1 }
    ],
    outputs: [
      { name: 'I_start_sd', symbol: 'I_start(sd)', description: 'Star-Delta Starting Current', unit: 'A', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_motor_starting_torque_sdelta',
    name: 'Star-Delta Starting Torque',
    description: 'Calculate star-delta starting torque',
    domain: 'electrical',
    category_slug: 'motor',
    equation: 'T_start_sd = T_start_dol / 3',
    equation_latex: 'T_{start(sd)} = \\frac{T_{start(dol)}}{3}',
    difficulty_level: 'intermediate',
    tags: ['motor', 'starting', 'torque', 'star-delta'],
    inputs: [
      { name: 'T_start_dol', symbol: 'T_start(dol)', description: 'DOL Starting Torque', unit: 'N·m', default_value: 150, min_value: 1, input_order: 1 }
    ],
    outputs: [
      { name: 'T_start_sd', symbol: 'T_start(sd)', description: 'Star-Delta Starting Torque', unit: 'N·m', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_motor_slip',
    name: 'Motor Slip',
    description: 'Calculate motor slip percentage',
    domain: 'electrical',
    category_slug: 'motor',
    equation: 'slip = ((N_s - N) / N_s) * 100',
    equation_latex: 's = \\frac{N_s - N}{N_s} \\times 100',
    difficulty_level: 'beginner',
    tags: ['motor', 'slip', 'speed'],
    inputs: [
      { name: 'N_s', symbol: 'N_s', description: 'Synchronous Speed', unit: 'rpm', default_value: 1500, min_value: 1, input_order: 1 },
      { name: 'N', symbol: 'N', description: 'Actual Speed', unit: 'rpm', default_value: 1450, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'slip', symbol: 's', description: 'Slip', unit: '%', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_motor_synchronous_speed',
    name: 'Synchronous Speed',
    description: 'Calculate synchronous speed from frequency and poles',
    domain: 'electrical',
    category_slug: 'motor',
    equation: 'N_s = (120 * f) / P_poles',
    equation_latex: 'N_s = \\frac{120 \\times f}{p}',
    difficulty_level: 'beginner',
    tags: ['motor', 'synchronous', 'speed', 'poles'],
    inputs: [
      { name: 'f', symbol: 'f', description: 'Frequency', unit: 'Hz', default_value: 50, min_value: 1, input_order: 1 },
      { name: 'P_poles', symbol: 'p', description: 'Number of Poles', unit: '', default_value: 4, min_value: 2, input_order: 2 }
    ],
    outputs: [
      { name: 'N_s', symbol: 'N_s', description: 'Synchronous Speed', unit: 'rpm', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_motor_efficiency',
    name: 'Motor Efficiency',
    description: 'Calculate motor efficiency',
    domain: 'electrical',
    category_slug: 'motor',
    equation: 'eta = (P_out / P_in) * 100',
    equation_latex: '\\eta = \\frac{P_{out}}{P_{in}} \\times 100',
    difficulty_level: 'beginner',
    tags: ['motor', 'efficiency'],
    inputs: [
      { name: 'P_out', symbol: 'P_out', description: 'Output Power', unit: 'kW', default_value: 15, min_value: 0, input_order: 1 },
      { name: 'P_in', symbol: 'P_in', description: 'Input Power', unit: 'kW', default_value: 17, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'eta', symbol: 'η', description: 'Efficiency', unit: '%', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_motor_input_power',
    name: 'Motor Input Power',
    description: 'Calculate motor electrical input power',
    domain: 'electrical',
    category_slug: 'motor',
    equation: 'P_in = sqrt(3) * V * I * PF / 1000',
    equation_latex: 'P_{in} = \\frac{\\sqrt{3} \\times V \\times I \\times PF}{1000}',
    difficulty_level: 'intermediate',
    tags: ['motor', 'power', 'input'],
    inputs: [
      { name: 'V', symbol: 'V', description: 'Voltage', unit: 'V', default_value: 400, min_value: 100, input_order: 1 },
      { name: 'I', symbol: 'I', description: 'Current', unit: 'A', default_value: 30, min_value: 0.1, input_order: 2 },
      { name: 'PF', symbol: 'PF', description: 'Power Factor', unit: '', default_value: 0.85, min_value: 0.1, max_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'P_in', symbol: 'P_in', description: 'Input Power', unit: 'kW', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_motor_service_factor',
    name: 'Motor Service Factor Loading',
    description: 'Calculate allowable overload with service factor',
    domain: 'electrical',
    category_slug: 'motor',
    equation: 'P_max = P_rated * SF',
    equation_latex: 'P_{max} = P_{rated} \\times SF',
    difficulty_level: 'beginner',
    tags: ['motor', 'service-factor', 'overload'],
    inputs: [
      { name: 'P_rated', symbol: 'P_rated', description: 'Rated Power', unit: 'kW', default_value: 15, min_value: 0.1, input_order: 1 },
      { name: 'SF', symbol: 'SF', description: 'Service Factor', unit: '', default_value: 1.15, min_value: 1, max_value: 1.5, input_order: 2 }
    ],
    outputs: [
      { name: 'P_max', symbol: 'P_max', description: 'Maximum Allowable Power', unit: 'kW', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_motor_code_letter_kva',
    name: 'Motor Code Letter kVA/hp',
    description: 'Get locked rotor kVA per hp from code letter',
    domain: 'electrical',
    category_slug: 'motor',
    equation: 'kVA_hp = (I_start * V) / (sqrt(3) * HP * 1000)',
    equation_latex: '\\frac{kVA}{hp} = \\frac{I_{start} \\times V}{\\sqrt{3} \\times HP \\times 1000}',
    difficulty_level: 'advanced',
    tags: ['motor', 'code-letter', 'locked-rotor'],
    inputs: [
      { name: 'I_start', symbol: 'I_start', description: 'Locked Rotor Current', unit: 'A', default_value: 200, min_value: 1, input_order: 1 },
      { name: 'V', symbol: 'V', description: 'Voltage', unit: 'V', default_value: 400, min_value: 100, input_order: 2 },
      { name: 'HP', symbol: 'HP', description: 'Motor Horsepower', unit: 'hp', default_value: 20, min_value: 0.1, input_order: 3 }
    ],
    outputs: [
      { name: 'kVA_hp', symbol: 'kVA/hp', description: 'kVA per Horsepower', unit: 'kVA/hp', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_motor_thermal_time',
    name: 'Motor Thermal Time Constant',
    description: 'Estimate motor thermal time constant',
    domain: 'electrical',
    category_slug: 'motor',
    equation: 'tau_th = K_thermal * P_rated^0.5',
    equation_latex: '\\tau_{th} = K \\times P_{rated}^{0.5}',
    difficulty_level: 'advanced',
    tags: ['motor', 'thermal', 'time-constant'],
    inputs: [
      { name: 'K_thermal', symbol: 'K', description: 'Thermal Constant', unit: 's/kW^0.5', default_value: 30, min_value: 10, input_order: 1 },
      { name: 'P_rated', symbol: 'P_rated', description: 'Rated Power', unit: 'kW', default_value: 15, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'tau_th', symbol: 'τ_th', description: 'Thermal Time Constant', unit: 's', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_motor_speed_from_frequency',
    name: 'Motor Speed with VFD',
    description: 'Calculate motor speed with variable frequency',
    domain: 'electrical',
    category_slug: 'motor',
    equation: 'N = (120 * f * (1 - slip/100)) / P_poles',
    equation_latex: 'N = \\frac{120 \\times f \\times (1-s)}{p}',
    difficulty_level: 'intermediate',
    tags: ['motor', 'vfd', 'speed', 'frequency'],
    inputs: [
      { name: 'f', symbol: 'f', description: 'Frequency', unit: 'Hz', default_value: 50, min_value: 1, input_order: 1 },
      { name: 'slip', symbol: 's', description: 'Slip', unit: '%', default_value: 3, min_value: 0, max_value: 100, input_order: 2 },
      { name: 'P_poles', symbol: 'p', description: 'Number of Poles', unit: '', default_value: 4, min_value: 2, input_order: 3 }
    ],
    outputs: [
      { name: 'N', symbol: 'N', description: 'Motor Speed', unit: 'rpm', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_motor_power_factor_correction',
    name: 'Motor Power Factor Correction',
    description: 'Calculate capacitor for motor PF correction',
    domain: 'electrical',
    category_slug: 'motor',
    equation: 'Qc = P * (tan(acos(PF_initial)) - tan(acos(PF_target)))',
    equation_latex: 'Q_c = P \\times (\\tan\\phi_1 - \\tan\\phi_2)',
    difficulty_level: 'advanced',
    tags: ['motor', 'power-factor', 'capacitor'],
    inputs: [
      { name: 'P', symbol: 'P', description: 'Motor Power', unit: 'kW', default_value: 15, min_value: 0.1, input_order: 1 },
      { name: 'PF_initial', symbol: 'cos φ₁', description: 'Initial Power Factor', unit: '', default_value: 0.8, min_value: 0.1, max_value: 1, input_order: 2 },
      { name: 'PF_target', symbol: 'cos φ₂', description: 'Target Power Factor', unit: '', default_value: 0.95, min_value: 0.1, max_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'Qc', symbol: 'Q_c', description: 'Capacitor Rating', unit: 'kvar', output_order: 1, precision: 2 }
    ]
  },

  // ============================================
  // LIGHTING EQUATIONS (12 equations)
  // ============================================
  
  {
    equation_id: 'eq_light_lumen_method',
    name: 'Lumen Method',
    description: 'Calculate number of luminaires using lumen method',
    domain: 'electrical',
    category_slug: 'lighting',
    equation: 'N = (E * A) / (Phi * CU * MF)',
    equation_latex: 'N = \\frac{E \\times A}{\\Phi \\times CU \\times MF}',
    difficulty_level: 'intermediate',
    tags: ['lighting', 'lumen', 'luminaires'],
    inputs: [
      { name: 'E', symbol: 'E', description: 'Required Illuminance', unit: 'lux', default_value: 500, min_value: 1, input_order: 1 },
      { name: 'A', symbol: 'A', description: 'Area', unit: 'm²', default_value: 100, min_value: 1, input_order: 2 },
      { name: 'Phi', symbol: 'Φ', description: 'Luminous Flux per Luminaire', unit: 'lm', default_value: 5000, min_value: 100, input_order: 3 },
      { name: 'CU', symbol: 'CU', description: 'Coefficient of Utilization', unit: '', default_value: 0.7, min_value: 0.1, max_value: 1, input_order: 4 },
      { name: 'MF', symbol: 'MF', description: 'Maintenance Factor', unit: '', default_value: 0.8, min_value: 0.1, max_value: 1, input_order: 5 }
    ],
    outputs: [
      { name: 'N', symbol: 'N', description: 'Number of Luminaires', unit: '', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_light_illuminance',
    name: 'Illuminance from Point Source',
    description: 'Calculate illuminance from point light source',
    domain: 'electrical',
    category_slug: 'lighting',
    equation: 'E = (I * cos(theta)) / d^2',
    equation_latex: 'E = \\frac{I \\times \\cos\\theta}{d^2}',
    difficulty_level: 'intermediate',
    tags: ['lighting', 'illuminance', 'point-source'],
    inputs: [
      { name: 'I', symbol: 'I', description: 'Luminous Intensity', unit: 'cd', default_value: 1000, min_value: 1, input_order: 1 },
      { name: 'theta', symbol: 'θ', description: 'Angle from Normal', unit: 'degrees', default_value: 30, min_value: 0, max_value: 90, input_order: 2 },
      { name: 'd', symbol: 'd', description: 'Distance', unit: 'm', default_value: 3, min_value: 0.1, input_order: 3 }
    ],
    outputs: [
      { name: 'E', symbol: 'E', description: 'Illuminance', unit: 'lux', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_light_luminous_efficacy',
    name: 'Luminous Efficacy',
    description: 'Calculate luminous efficacy of light source',
    domain: 'electrical',
    category_slug: 'lighting',
    equation: 'efficacy = Phi / P',
    equation_latex: '\\eta = \\frac{\\Phi}{P}',
    difficulty_level: 'beginner',
    tags: ['lighting', 'efficacy', 'efficiency'],
    inputs: [
      { name: 'Phi', symbol: 'Φ', description: 'Luminous Flux', unit: 'lm', default_value: 1600, min_value: 1, input_order: 1 },
      { name: 'P', symbol: 'P', description: 'Power Consumption', unit: 'W', default_value: 20, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'efficacy', symbol: 'η', description: 'Luminous Efficacy', unit: 'lm/W', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_light_room_index',
    name: 'Room Index',
    description: 'Calculate room index for lighting design',
    domain: 'electrical',
    category_slug: 'lighting',
    equation: 'RI = (L * W) / (H * (L + W))',
    equation_latex: 'RI = \\frac{L \\times W}{H \\times (L + W)}',
    difficulty_level: 'intermediate',
    tags: ['lighting', 'room-index', 'design'],
    inputs: [
      { name: 'L', symbol: 'L', description: 'Room Length', unit: 'm', default_value: 10, min_value: 1, input_order: 1 },
      { name: 'W', symbol: 'W', description: 'Room Width', unit: 'm', default_value: 8, min_value: 1, input_order: 2 },
      { name: 'H', symbol: 'H', description: 'Mounting Height', unit: 'm', default_value: 2.5, min_value: 0.5, input_order: 3 }
    ],
    outputs: [
      { name: 'RI', symbol: 'RI', description: 'Room Index', unit: '', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_light_spacing_criterion',
    name: 'Spacing Criterion',
    description: 'Calculate maximum spacing between luminaires',
    domain: 'electrical',
    category_slug: 'lighting',
    equation: 'S_max = H * SC',
    equation_latex: 'S_{max} = H \\times SC',
    difficulty_level: 'intermediate',
    tags: ['lighting', 'spacing', 'layout'],
    inputs: [
      { name: 'H', symbol: 'H', description: 'Mounting Height', unit: 'm', default_value: 2.5, min_value: 0.5, input_order: 1 },
      { name: 'SC', symbol: 'SC', description: 'Spacing Criterion', unit: '', default_value: 1.2, min_value: 0.5, max_value: 2, input_order: 2 }
    ],
    outputs: [
      { name: 'S_max', symbol: 'S_max', description: 'Maximum Spacing', unit: 'm', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_light_power_density',
    name: 'Lighting Power Density',
    description: 'Calculate lighting power density',
    domain: 'electrical',
    category_slug: 'lighting',
    equation: 'LPD = P_total / A',
    equation_latex: 'LPD = \\frac{P_{total}}{A}',
    difficulty_level: 'beginner',
    tags: ['lighting', 'power-density', 'lpd'],
    inputs: [
      { name: 'P_total', symbol: 'P_total', description: 'Total Lighting Power', unit: 'W', default_value: 600, min_value: 1, input_order: 1 },
      { name: 'A', symbol: 'A', description: 'Area', unit: 'm²', default_value: 100, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'LPD', symbol: 'LPD', description: 'Lighting Power Density', unit: 'W/m²', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_light_uniformity',
    name: 'Lighting Uniformity',
    description: 'Calculate illuminance uniformity ratio',
    domain: 'electrical',
    category_slug: 'lighting',
    equation: 'U = E_min / E_avg',
    equation_latex: 'U = \\frac{E_{min}}{E_{avg}}',
    difficulty_level: 'beginner',
    tags: ['lighting', 'uniformity', 'ratio'],
    inputs: [
      { name: 'E_min', symbol: 'E_min', description: 'Minimum Illuminance', unit: 'lux', default_value: 400, min_value: 1, input_order: 1 },
      { name: 'E_avg', symbol: 'E_avg', description: 'Average Illuminance', unit: 'lux', default_value: 500, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'U', symbol: 'U', description: 'Uniformity Ratio', unit: '', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_light_cavity_ratio',
    name: 'Room Cavity Ratio',
    description: 'Calculate room cavity ratio',
    domain: 'electrical',
    category_slug: 'lighting',
    equation: 'RCR = (5 * H_cavity * (L + W)) / (L * W)',
    equation_latex: 'RCR = \\frac{5 \\times H_{cavity} \\times (L + W)}{L \\times W}',
    difficulty_level: 'intermediate',
    tags: ['lighting', 'cavity', 'ratio'],
    inputs: [
      { name: 'H_cavity', symbol: 'H_c', description: 'Cavity Height', unit: 'm', default_value: 2, min_value: 0.5, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Room Length', unit: 'm', default_value: 10, min_value: 1, input_order: 2 },
      { name: 'W', symbol: 'W', description: 'Room Width', unit: 'm', default_value: 8, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'RCR', symbol: 'RCR', description: 'Room Cavity Ratio', unit: '', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_light_inverse_square',
    name: 'Inverse Square Law',
    description: 'Calculate illuminance using inverse square law',
    domain: 'electrical',
    category_slug: 'lighting',
    equation: 'E = Phi / (4 * PI * d^2)',
    equation_latex: 'E = \\frac{\\Phi}{4\\pi d^2}',
    difficulty_level: 'beginner',
    tags: ['lighting', 'inverse-square', 'illuminance'],
    inputs: [
      { name: 'Phi', symbol: 'Φ', description: 'Luminous Flux', unit: 'lm', default_value: 1000, min_value: 1, input_order: 1 },
      { name: 'd', symbol: 'd', description: 'Distance', unit: 'm', default_value: 2, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'E', symbol: 'E', description: 'Illuminance', unit: 'lux', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_light_luminance',
    name: 'Luminance Calculation',
    description: 'Calculate luminance from illuminance',
    domain: 'electrical',
    category_slug: 'lighting',
    equation: 'L = (E * rho) / PI',
    equation_latex: 'L = \\frac{E \\times \\rho}{\\pi}',
    difficulty_level: 'intermediate',
    tags: ['lighting', 'luminance', 'reflectance'],
    inputs: [
      { name: 'E', symbol: 'E', description: 'Illuminance', unit: 'lux', default_value: 500, min_value: 1, input_order: 1 },
      { name: 'rho', symbol: 'ρ', description: 'Surface Reflectance', unit: '', default_value: 0.7, min_value: 0, max_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'L', symbol: 'L', description: 'Luminance', unit: 'cd/m²', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_light_daylight_factor',
    name: 'Daylight Factor',
    description: 'Calculate daylight factor',
    domain: 'electrical',
    category_slug: 'lighting',
    equation: 'DF = (E_indoor / E_outdoor) * 100',
    equation_latex: 'DF = \\frac{E_{indoor}}{E_{outdoor}} \\times 100',
    difficulty_level: 'intermediate',
    tags: ['lighting', 'daylight', 'factor'],
    inputs: [
      { name: 'E_indoor', symbol: 'E_in', description: 'Indoor Illuminance', unit: 'lux', default_value: 200, min_value: 1, input_order: 1 },
      { name: 'E_outdoor', symbol: 'E_out', description: 'Outdoor Illuminance', unit: 'lux', default_value: 10000, min_value: 100, input_order: 2 }
    ],
    outputs: [
      { name: 'DF', symbol: 'DF', description: 'Daylight Factor', unit: '%', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_light_total_flux',
    name: 'Total Luminous Flux Required',
    description: 'Calculate total luminous flux for space',
    domain: 'electrical',
    category_slug: 'lighting',
    equation: 'Phi_total = (E * A) / (CU * MF)',
    equation_latex: '\\Phi_{total} = \\frac{E \\times A}{CU \\times MF}',
    difficulty_level: 'intermediate',
    tags: ['lighting', 'flux', 'total'],
    inputs: [
      { name: 'E', symbol: 'E', description: 'Required Illuminance', unit: 'lux', default_value: 500, min_value: 1, input_order: 1 },
      { name: 'A', symbol: 'A', description: 'Area', unit: 'm²', default_value: 100, min_value: 1, input_order: 2 },
      { name: 'CU', symbol: 'CU', description: 'Coefficient of Utilization', unit: '', default_value: 0.7, min_value: 0.1, max_value: 1, input_order: 3 },
      { name: 'MF', symbol: 'MF', description: 'Maintenance Factor', unit: '', default_value: 0.8, min_value: 0.1, max_value: 1, input_order: 4 }
    ],
    outputs: [
      { name: 'Phi_total', symbol: 'Φ_total', description: 'Total Luminous Flux', unit: 'lm', output_order: 1, precision: 0 }
    ]
  },

  // ============================================
  // PROTECTION EQUATIONS (15 equations)
  // ============================================
  
  {
    equation_id: 'eq_protect_mcb_rating',
    name: 'MCB Rating Selection',
    description: 'Select MCB rating for circuit protection',
    domain: 'electrical',
    category_slug: 'protection',
    equation: 'MCB_rating = I_design * 1.25',
    equation_latex: 'I_{MCB} = I_{design} \\times 1.25',
    difficulty_level: 'beginner',
    tags: ['protection', 'mcb', 'rating'],
    inputs: [
      { name: 'I_design', symbol: 'I_design', description: 'Design Current', unit: 'A', default_value: 20, min_value: 0.1, input_order: 1 }
    ],
    outputs: [
      { name: 'MCB_rating', symbol: 'I_MCB', description: 'MCB Rating', unit: 'A', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_protect_mcb_breaking',
    name: 'MCB Breaking Capacity',
    description: 'Check MCB breaking capacity against fault current',
    domain: 'electrical',
    category_slug: 'protection',
    equation: 'margin = (Icu / Isc) * 100',
    equation_latex: 'margin = \\frac{I_{cu}}{I_{sc}} \\times 100',
    difficulty_level: 'intermediate',
    tags: ['protection', 'mcb', 'breaking-capacity'],
    inputs: [
      { name: 'Icu', symbol: 'I_cu', description: 'Breaking Capacity', unit: 'A', default_value: 10000, min_value: 100, input_order: 1 },
      { name: 'Isc', symbol: 'I_sc', description: 'Short Circuit Current', unit: 'A', default_value: 6000, min_value: 100, input_order: 2 }
    ],
    outputs: [
      { name: 'margin', symbol: 'margin', description: 'Safety Margin', unit: '%', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_protect_discrimination',
    name: 'Protection Discrimination Time',
    description: 'Calculate discrimination time between devices',
    domain: 'electrical',
    category_slug: 'protection',
    equation: 't_discrimination = t_upstream - t_downstream',
    equation_latex: 't_{disc} = t_{up} - t_{down}',
    difficulty_level: 'intermediate',
    tags: ['protection', 'discrimination', 'selectivity'],
    inputs: [
      { name: 't_upstream', symbol: 't_up', description: 'Upstream Device Time', unit: 'ms', default_value: 100, min_value: 0, input_order: 1 },
      { name: 't_downstream', symbol: 't_down', description: 'Downstream Device Time', unit: 'ms', default_value: 20, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 't_discrimination', symbol: 't_disc', description: 'Discrimination Time', unit: 'ms', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_protect_relay_pickup',
    name: 'Relay Pickup Current',
    description: 'Calculate relay pickup current setting',
    domain: 'electrical',
    category_slug: 'protection',
    equation: 'I_pickup = I_fl * K_security',
    equation_latex: 'I_{pickup} = I_{fl} \\times K_{security}',
    difficulty_level: 'intermediate',
    tags: ['protection', 'relay', 'pickup'],
    inputs: [
      { name: 'I_fl', symbol: 'I_fl', description: 'Full Load Current', unit: 'A', default_value: 100, min_value: 1, input_order: 1 },
      { name: 'K_security', symbol: 'K', description: 'Security Factor', unit: '', default_value: 1.2, min_value: 1, max_value: 2, input_order: 2 }
    ],
    outputs: [
      { name: 'I_pickup', symbol: 'I_pickup', description: 'Pickup Current', unit: 'A', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_protect_relay_time',
    name: 'Relay Operating Time (IDMT)',
    description: 'Calculate IDMT relay operating time',
    domain: 'electrical',
    category_slug: 'protection',
    equation: 't = (K * TMS) / ((I / I_pickup)^alpha - 1)',
    equation_latex: 't = \\frac{K \\times TMS}{(I/I_{pickup})^\\alpha - 1}',
    difficulty_level: 'advanced',
    tags: ['protection', 'relay', 'idmt', 'time'],
    inputs: [
      { name: 'K', symbol: 'K', description: 'Curve Constant', unit: '', default_value: 0.14, min_value: 0.01, input_order: 1 },
      { name: 'TMS', symbol: 'TMS', description: 'Time Multiplier Setting', unit: '', default_value: 0.5, min_value: 0.05, input_order: 2 },
      { name: 'I', symbol: 'I', description: 'Fault Current', unit: 'A', default_value: 1000, min_value: 1, input_order: 3 },
      { name: 'I_pickup', symbol: 'I_pickup', description: 'Pickup Current', unit: 'A', default_value: 100, min_value: 1, input_order: 4 },
      { name: 'alpha', symbol: 'α', description: 'Curve Exponent', unit: '', default_value: 0.02, min_value: 0.01, input_order: 5 }
    ],
    outputs: [
      { name: 't', symbol: 't', description: 'Operating Time', unit: 's', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_protect_thermal_overload',
    name: 'Thermal Overload Setting',
    description: 'Calculate thermal overload relay setting',
    domain: 'electrical',
    category_slug: 'protection',
    equation: 'I_thermal = I_fl * SF',
    equation_latex: 'I_{thermal} = I_{fl} \\times SF',
    difficulty_level: 'intermediate',
    tags: ['protection', 'thermal', 'overload'],
    inputs: [
      { name: 'I_fl', symbol: 'I_fl', description: 'Full Load Current', unit: 'A', default_value: 30, min_value: 0.1, input_order: 1 },
      { name: 'SF', symbol: 'SF', description: 'Service Factor', unit: '', default_value: 1.05, min_value: 1, max_value: 1.5, input_order: 2 }
    ],
    outputs: [
      { name: 'I_thermal', symbol: 'I_thermal', description: 'Thermal Setting', unit: 'A', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_protect_instantaneous_trip',
    name: 'Instantaneous Trip Setting',
    description: 'Calculate instantaneous trip setting',
    domain: 'electrical',
    category_slug: 'protection',
    equation: 'I_inst = I_start * K_margin',
    equation_latex: 'I_{inst} = I_{start} \\times K_{margin}',
    difficulty_level: 'intermediate',
    tags: ['protection', 'instantaneous', 'trip'],
    inputs: [
      { name: 'I_start', symbol: 'I_start', description: 'Starting Current', unit: 'A', default_value: 200, min_value: 1, input_order: 1 },
      { name: 'K_margin', symbol: 'K', description: 'Margin Factor', unit: '', default_value: 1.2, min_value: 1, max_value: 2, input_order: 2 }
    ],
    outputs: [
      { name: 'I_inst', symbol: 'I_inst', description: 'Instantaneous Setting', unit: 'A', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_protect_earth_fault_current',
    name: 'Earth Fault Protection Setting',
    description: 'Calculate earth fault relay setting',
    domain: 'electrical',
    category_slug: 'protection',
    equation: 'I_ef = I_unbalance * K_sensitivity',
    equation_latex: 'I_{ef} = I_{unbalance} \\times K_{sens}',
    difficulty_level: 'intermediate',
    tags: ['protection', 'earth-fault', 'relay'],
    inputs: [
      { name: 'I_unbalance', symbol: 'I_unbal', description: 'Maximum Unbalance Current', unit: 'A', default_value: 10, min_value: 0, input_order: 1 },
      { name: 'K_sensitivity', symbol: 'K_sens', description: 'Sensitivity Factor', unit: '', default_value: 2, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'I_ef', symbol: 'I_ef', description: 'Earth Fault Setting', unit: 'A', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_protect_fuse_rating',
    name: 'Fuse Rating Selection',
    description: 'Select fuse rating for circuit protection',
    domain: 'electrical',
    category_slug: 'protection',
    equation: 'I_fuse = I_load * K_factor',
    equation_latex: 'I_{fuse} = I_{load} \\times K',
    difficulty_level: 'beginner',
    tags: ['protection', 'fuse', 'rating'],
    inputs: [
      { name: 'I_load', symbol: 'I_load', description: 'Load Current', unit: 'A', default_value: 20, min_value: 0.1, input_order: 1 },
      { name: 'K_factor', symbol: 'K', description: 'Application Factor', unit: '', default_value: 1.25, min_value: 1, max_value: 2, input_order: 2 }
    ],
    outputs: [
      { name: 'I_fuse', symbol: 'I_fuse', description: 'Fuse Rating', unit: 'A', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_protect_fuse_prearc',
    name: 'Fuse Pre-Arcing Time',
    description: 'Estimate fuse pre-arcing time',
    domain: 'electrical',
    category_slug: 'protection',
    equation: 't_prearc = K_fuse / (I_fault^2)',
    equation_latex: 't_{prearc} = \\frac{K_{fuse}}{I_{fault}^2}',
    difficulty_level: 'advanced',
    tags: ['protection', 'fuse', 'pre-arcing'],
    inputs: [
      { name: 'K_fuse', symbol: 'K_fuse', description: 'Fuse Constant', unit: 'A²s', default_value: 10000, min_value: 100, input_order: 1 },
      { name: 'I_fault', symbol: 'I_fault', description: 'Fault Current', unit: 'A', default_value: 500, min_value: 10, input_order: 2 }
    ],
    outputs: [
      { name: 't_prearc', symbol: 't_prearc', description: 'Pre-Arcing Time', unit: 's', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_protect_ct_ratio',
    name: 'CT Ratio Selection',
    description: 'Select current transformer ratio',
    domain: 'electrical',
    category_slug: 'protection',
    equation: 'CT_ratio = I_primary / I_secondary',
    equation_latex: 'CT_{ratio} = \\frac{I_{primary}}{I_{secondary}}',
    difficulty_level: 'beginner',
    tags: ['protection', 'ct', 'ratio'],
    inputs: [
      { name: 'I_primary', symbol: 'I_pri', description: 'Primary Current', unit: 'A', default_value: 600, min_value: 1, input_order: 1 },
      { name: 'I_secondary', symbol: 'I_sec', description: 'Secondary Current', unit: 'A', default_value: 5, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'CT_ratio', symbol: 'CT_ratio', description: 'CT Ratio', unit: '', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_protect_ct_burden',
    name: 'CT Burden Calculation',
    description: 'Calculate CT burden in VA',
    domain: 'electrical',
    category_slug: 'protection',
    equation: 'burden = I_s^2 * Z_burden',
    equation_latex: 'Burden = I_s^2 \\times Z_b',
    difficulty_level: 'intermediate',
    tags: ['protection', 'ct', 'burden'],
    inputs: [
      { name: 'I_s', symbol: 'I_s', description: 'Secondary Current', unit: 'A', default_value: 5, min_value: 0.1, input_order: 1 },
      { name: 'Z_burden', symbol: 'Z_b', description: 'Burden Impedance', unit: 'Ω', default_value: 0.5, min_value: 0.01, input_order: 2 }
    ],
    outputs: [
      { name: 'burden', symbol: 'Burden', description: 'CT Burden', unit: 'VA', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_protect_knee_voltage',
    name: 'CT Knee Voltage',
    description: 'Calculate CT knee voltage for saturation check',
    domain: 'electrical',
    category_slug: 'protection',
    equation: 'V_knee = I_s * (R_ct + R_lead + R_burden)',
    equation_latex: 'V_k = I_s \\times (R_{ct} + R_{lead} + R_b)',
    difficulty_level: 'advanced',
    tags: ['protection', 'ct', 'saturation'],
    inputs: [
      { name: 'I_s', symbol: 'I_s', description: 'Secondary Fault Current', unit: 'A', default_value: 20, min_value: 0.1, input_order: 1 },
      { name: 'R_ct', symbol: 'R_ct', description: 'CT Resistance', unit: 'Ω', default_value: 0.1, min_value: 0.001, input_order: 2 },
      { name: 'R_lead', symbol: 'R_lead', description: 'Lead Resistance', unit: 'Ω', default_value: 0.2, min_value: 0.001, input_order: 3 },
      { name: 'R_burden', symbol: 'R_b', description: 'Burden Resistance', unit: 'Ω', default_value: 0.5, min_value: 0.01, input_order: 4 }
    ],
    outputs: [
      { name: 'V_knee', symbol: 'V_k', description: 'Knee Voltage', unit: 'V', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_protect_coordination_interval',
    name: 'Protection Coordination Interval',
    description: 'Calculate coordination time interval',
    domain: 'electrical',
    category_slug: 'protection',
    equation: 'CTI = t_upstream - t_downstream',
    equation_latex: 'CTI = t_{up} - t_{down}',
    difficulty_level: 'intermediate',
    tags: ['protection', 'coordination', 'cti'],
    inputs: [
      { name: 't_upstream', symbol: 't_up', description: 'Upstream Device Time', unit: 's', default_value: 0.5, min_value: 0.001, input_order: 1 },
      { name: 't_downstream', symbol: 't_down', description: 'Downstream Device Time', unit: 's', default_value: 0.3, min_value: 0.001, input_order: 2 }
    ],
    outputs: [
      { name: 'CTI', symbol: 'CTI', description: 'Coordination Time Interval', unit: 's', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_protect_sensitivity',
    name: 'Protection Sensitivity Check',
    description: 'Check protection sensitivity ratio',
    domain: 'electrical',
    category_slug: 'protection',
    equation: 'sensitivity = I_fault_min / I_pickup',
    equation_latex: 'S = \\frac{I_{fault(min)}}{I_{pickup}}',
    difficulty_level: 'intermediate',
    tags: ['protection', 'sensitivity', 'check'],
    inputs: [
      { name: 'I_fault_min', symbol: 'I_fault(min)', description: 'Minimum Fault Current', unit: 'A', default_value: 500, min_value: 1, input_order: 1 },
      { name: 'I_pickup', symbol: 'I_pickup', description: 'Pickup Current', unit: 'A', default_value: 100, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'sensitivity', symbol: 'S', description: 'Sensitivity Ratio', unit: '', output_order: 1, precision: 2 }
    ]
  },

  // ============================================
  // EARTHING EQUATIONS (10 equations)
  // ============================================
  
  {
    equation_id: 'eq_earth_resistance_rod',
    name: 'Earth Rod Resistance',
    description: 'Calculate resistance of single earth rod',
    domain: 'electrical',
    category_slug: 'earthing',
    equation: 'R = (rho / (2 * PI * L)) * ln(4 * L / d)',
    equation_latex: 'R = \\frac{\\rho}{2\\pi L} \\times \\ln\\frac{4L}{d}',
    difficulty_level: 'intermediate',
    tags: ['earthing', 'resistance', 'rod'],
    inputs: [
      { name: 'rho', symbol: 'ρ', description: 'Soil Resistivity', unit: 'Ω·m', default_value: 100, min_value: 1, input_order: 1 },
      { name: 'L', symbol: 'L', description: 'Rod Length', unit: 'm', default_value: 2.4, min_value: 0.5, input_order: 2 },
      { name: 'd', symbol: 'd', description: 'Rod Diameter', unit: 'm', default_value: 0.016, min_value: 0.01, input_order: 3 }
    ],
    outputs: [
      { name: 'R', symbol: 'R', description: 'Earth Resistance', unit: 'Ω', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_earth_resistance_plate',
    name: 'Earth Plate Resistance',
    description: 'Calculate resistance of earth plate',
    domain: 'electrical',
    category_slug: 'earthing',
    equation: 'R = rho / (4 * sqrt(A / PI))',
    equation_latex: 'R = \\frac{\\rho}{4 \\times \\sqrt{A/\\pi}}',
    difficulty_level: 'intermediate',
    tags: ['earthing', 'resistance', 'plate'],
    inputs: [
      { name: 'rho', symbol: 'ρ', description: 'Soil Resistivity', unit: 'Ω·m', default_value: 100, min_value: 1, input_order: 1 },
      { name: 'A', symbol: 'A', description: 'Plate Area', unit: 'm²', default_value: 1, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'R', symbol: 'R', description: 'Earth Resistance', unit: 'Ω', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_earth_multiple_rods',
    name: 'Multiple Rods Resistance',
    description: 'Calculate resistance of multiple earth rods in parallel',
    domain: 'electrical',
    category_slug: 'earthing',
    equation: 'R_total = R_single / (n * efficiency)',
    equation_latex: 'R_{total} = \\frac{R_{single}}{n \\times \\eta}',
    difficulty_level: 'intermediate',
    tags: ['earthing', 'resistance', 'multiple-rods'],
    inputs: [
      { name: 'R_single', symbol: 'R_single', description: 'Single Rod Resistance', unit: 'Ω', default_value: 30, min_value: 0.1, input_order: 1 },
      { name: 'n', symbol: 'n', description: 'Number of Rods', unit: '', default_value: 4, min_value: 1, input_order: 2 },
      { name: 'efficiency', symbol: 'η', description: 'Group Efficiency', unit: '', default_value: 0.8, min_value: 0.1, max_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'R_total', symbol: 'R_total', description: 'Total Resistance', unit: 'Ω', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_earth_grid_resistance',
    name: 'Earth Grid Resistance',
    description: 'Calculate resistance of earth grid',
    domain: 'electrical',
    category_slug: 'earthing',
    equation: 'R_grid = rho * (0.5 / sqrt(A) + 1 / L_total)',
    equation_latex: 'R_{grid} = \\rho \\times \\left(\\frac{0.5}{\\sqrt{A}} + \\frac{1}{L_{total}}\\right)',
    difficulty_level: 'advanced',
    tags: ['earthing', 'resistance', 'grid'],
    inputs: [
      { name: 'rho', symbol: 'ρ', description: 'Soil Resistivity', unit: 'Ω·m', default_value: 100, min_value: 1, input_order: 1 },
      { name: 'A', symbol: 'A', description: 'Grid Area', unit: 'm²', default_value: 100, min_value: 1, input_order: 2 },
      { name: 'L_total', symbol: 'L_total', description: 'Total Conductor Length', unit: 'm', default_value: 50, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'R_grid', symbol: 'R_grid', description: 'Grid Resistance', unit: 'Ω', output_order: 1, precision: 3 }
    ]
  },
  {
    equation_id: 'eq_earth_touch_voltage',
    name: 'Touch Voltage',
    description: 'Calculate allowable touch voltage',
    domain: 'electrical',
    category_slug: 'earthing',
    equation: 'U_touch = (R_body + R_feet) * I_body',
    equation_latex: 'U_{touch} = (R_{body} + R_{feet}) \\times I_{body}',
    difficulty_level: 'advanced',
    tags: ['earthing', 'touch-voltage', 'safety'],
    inputs: [
      { name: 'R_body', symbol: 'R_body', description: 'Body Resistance', unit: 'Ω', default_value: 1000, min_value: 500, input_order: 1 },
      { name: 'R_feet', symbol: 'R_feet', description: 'Feet-to-Earth Resistance', unit: 'Ω', default_value: 200, min_value: 0, input_order: 2 },
      { name: 'I_body', symbol: 'I_body', description: 'Body Current Limit', unit: 'A', default_value: 0.03, min_value: 0.001, input_order: 3 }
    ],
    outputs: [
      { name: 'U_touch', symbol: 'U_touch', description: 'Touch Voltage', unit: 'V', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_earth_step_voltage',
    name: 'Step Voltage',
    description: 'Calculate allowable step voltage',
    domain: 'electrical',
    category_slug: 'earthing',
    equation: 'U_step = (R_body + 2 * R_foot) * I_body',
    equation_latex: 'U_{step} = (R_{body} + 2R_{foot}) \\times I_{body}',
    difficulty_level: 'advanced',
    tags: ['earthing', 'step-voltage', 'safety'],
    inputs: [
      { name: 'R_body', symbol: 'R_body', description: 'Body Resistance', unit: 'Ω', default_value: 1000, min_value: 500, input_order: 1 },
      { name: 'R_foot', symbol: 'R_foot', description: 'Foot-to-Earth Resistance', unit: 'Ω', default_value: 100, min_value: 0, input_order: 2 },
      { name: 'I_body', symbol: 'I_body', description: 'Body Current Limit', unit: 'A', default_value: 0.03, min_value: 0.001, input_order: 3 }
    ],
    outputs: [
      { name: 'U_step', symbol: 'U_step', description: 'Step Voltage', unit: 'V', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_earth_fault_current',
    name: 'Earth Fault Current Distribution',
    description: 'Calculate current through earth electrode',
    domain: 'electrical',
    category_slug: 'earthing',
    equation: 'I_earth = I_fault * (R_parallel / R_earth)',
    equation_latex: 'I_{earth} = I_{fault} \\times \\frac{R_{parallel}}{R_{earth}}',
    difficulty_level: 'advanced',
    tags: ['earthing', 'fault-current', 'distribution'],
    inputs: [
      { name: 'I_fault', symbol: 'I_fault', description: 'Total Fault Current', unit: 'A', default_value: 1000, min_value: 1, input_order: 1 },
      { name: 'R_parallel', symbol: 'R_par', description: 'Parallel Path Resistance', unit: 'Ω', default_value: 1, min_value: 0.01, input_order: 2 },
      { name: 'R_earth', symbol: 'R_earth', description: 'Earth Electrode Resistance', unit: 'Ω', default_value: 10, min_value: 0.1, input_order: 3 }
    ],
    outputs: [
      { name: 'I_earth', symbol: 'I_earth', description: 'Current Through Earth', unit: 'A', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_earth_conductor_size',
    name: 'Earth Conductor Size',
    description: 'Calculate minimum earth conductor size',
    domain: 'electrical',
    category_slug: 'earthing',
    equation: 'A = (I_fault * sqrt(t)) / K',
    equation_latex: 'A = \\frac{I_{fault} \\times \\sqrt{t}}{K}',
    difficulty_level: 'intermediate',
    tags: ['earthing', 'conductor', 'size'],
    inputs: [
      { name: 'I_fault', symbol: 'I_fault', description: 'Fault Current', unit: 'A', default_value: 10000, min_value: 100, input_order: 1 },
      { name: 't', symbol: 't', description: 'Fault Duration', unit: 's', default_value: 1, min_value: 0.1, input_order: 2 },
      { name: 'K', symbol: 'K', description: 'Material Constant', unit: 'A·s½/mm²', default_value: 143, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'A', symbol: 'A', description: 'Conductor Area', unit: 'mm²', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_earth_soil_resistivity',
    name: 'Soil Resistivity (Wenner Method)',
    description: 'Calculate soil resistivity from Wenner test',
    domain: 'electrical',
    category_slug: 'earthing',
    equation: 'rho = 2 * PI * a * R',
    equation_latex: '\\rho = 2\\pi a R',
    difficulty_level: 'intermediate',
    tags: ['earthing', 'soil', 'resistivity', 'wenner'],
    inputs: [
      { name: 'a', symbol: 'a', description: 'Probe Spacing', unit: 'm', default_value: 3, min_value: 0.5, input_order: 1 },
      { name: 'R', symbol: 'R', description: 'Measured Resistance', unit: 'Ω', default_value: 10, min_value: 0.1, input_order: 2 }
    ],
    outputs: [
      { name: 'rho', symbol: 'ρ', description: 'Soil Resistivity', unit: 'Ω·m', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_earth_ground_potential_rise',
    name: 'Ground Potential Rise',
    description: 'Calculate ground potential rise during fault',
    domain: 'electrical',
    category_slug: 'earthing',
    equation: 'GPR = I_earth * R_earth',
    equation_latex: 'GPR = I_{earth} \\times R_{earth}',
    difficulty_level: 'intermediate',
    tags: ['earthing', 'gpr', 'potential', 'rise'],
    inputs: [
      { name: 'I_earth', symbol: 'I_earth', description: 'Earth Fault Current', unit: 'A', default_value: 1000, min_value: 1, input_order: 1 },
      { name: 'R_earth', symbol: 'R_earth', description: 'Earth Resistance', unit: 'Ω', default_value: 1, min_value: 0.01, input_order: 2 }
    ],
    outputs: [
      { name: 'GPR', symbol: 'GPR', description: 'Ground Potential Rise', unit: 'V', output_order: 1, precision: 1 }
    ]
  }
];

export default electricalBatch3;
