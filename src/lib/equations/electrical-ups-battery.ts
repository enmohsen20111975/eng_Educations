/**
 * UPS and Battery Backup Power Equations for EngiSuite
 * Domain: Electrical Engineering
 * Category: Power Calculations
 */

export const upsBatteryEquations = [
  // Battery Capacity Calculation
  {
    equation_id: 'eq_battery_capacity_ah',
    name: 'Battery Capacity (Amp-Hours)',
    description: 'Calculate required battery capacity in Amp-Hours for backup time',
    domain: 'electrical',
    category_slug: 'power-calcs',
    equation: 'Ah = (P * t * SF) / (V_dc * eta)',
    equation_latex: 'Ah = \\frac{P \\times t \\times SF}{V_{dc} \\times \\eta}',
    difficulty_level: 'intermediate',
    tags: ['battery', 'ups', 'backup power', 'energy storage'],
    inputs: [
      {
        name: 'load_power',
        symbol: 'P',
        description: 'Total load power demand',
        unit: 'W',
        data_type: 'float',
        required: true,
        default_value: 5000,
        min_value: 100,
        max_value: 1000000,
        input_order: 1,
        placeholder: 'e.g. 5000',
        help_text: 'Total power consumption of connected loads'
      },
      {
        name: 'backup_time',
        symbol: 't',
        description: 'Required backup duration',
        unit: 'hours',
        data_type: 'float',
        required: true,
        default_value: 2,
        min_value: 0.25,
        max_value: 24,
        input_order: 2,
        placeholder: 'e.g. 2',
        help_text: 'How long the backup system should support the load'
      },
      {
        name: 'safety_factor',
        symbol: 'SF',
        description: 'Safety/design factor',
        unit: '',
        data_type: 'float',
        required: true,
        default_value: 1.25,
        min_value: 1.0,
        max_value: 2.0,
        input_order: 3,
        placeholder: 'e.g. 1.25',
        help_text: 'Safety margin (typically 1.2-1.5) to account for battery aging and temperature'
      },
      {
        name: 'dc_voltage',
        symbol: 'V_dc',
        description: 'DC system voltage',
        unit: 'V',
        data_type: 'float',
        required: true,
        default_value: 48,
        min_value: 12,
        max_value: 600,
        input_order: 4,
        placeholder: 'e.g. 48',
        help_text: 'Battery bank DC voltage (common: 12V, 24V, 48V, 110V, 220V)'
      },
      {
        name: 'efficiency',
        symbol: 'eta',
        description: 'Inverter/UPS efficiency',
        unit: '',
        data_type: 'float',
        required: true,
        default_value: 0.90,
        min_value: 0.70,
        max_value: 0.98,
        input_order: 5,
        placeholder: 'e.g. 0.90',
        help_text: 'Typical UPS efficiency: 0.85-0.95'
      }
    ],
    outputs: [
      {
        name: 'battery_capacity',
        symbol: 'Ah',
        description: 'Required battery capacity',
        unit: 'Ah',
        data_type: 'float',
        output_order: 1,
        precision: 1
      }
    ]
  },

  // Energy Storage Calculation
  {
    equation_id: 'eq_battery_energy_wh',
    name: 'Battery Energy Storage (Watt-Hours)',
    description: 'Calculate total energy storage capacity in Watt-Hours',
    domain: 'electrical',
    category_slug: 'power-calcs',
    equation: 'E_wh = V_dc * Ah',
    equation_latex: 'E_{Wh} = V_{dc} \\times Ah',
    difficulty_level: 'beginner',
    tags: ['battery', 'energy storage'],
    inputs: [
      {
        name: 'dc_voltage',
        symbol: 'V_dc',
        description: 'Battery voltage',
        unit: 'V',
        data_type: 'float',
        required: true,
        default_value: 48,
        min_value: 12,
        max_value: 600,
        input_order: 1,
        placeholder: 'e.g. 48',
        help_text: 'Nominal battery voltage'
      },
      {
        name: 'capacity_ah',
        symbol: 'Ah',
        description: 'Battery capacity',
        unit: 'Ah',
        data_type: 'float',
        required: true,
        default_value: 100,
        min_value: 1,
        max_value: 10000,
        input_order: 2,
        placeholder: 'e.g. 100',
        help_text: 'Battery capacity in Amp-Hours'
      }
    ],
    outputs: [
      {
        name: 'energy_storage',
        symbol: 'E_Wh',
        description: 'Total energy storage',
        unit: 'Wh',
        data_type: 'float',
        output_order: 1,
        precision: 1
      }
    ]
  },

  // UPS Runtime Calculation
  {
    equation_id: 'eq_ups_runtime',
    name: 'UPS Runtime Calculation',
    description: 'Calculate actual runtime based on battery capacity and load',
    domain: 'electrical',
    category_slug: 'power-calcs',
    equation: 't_runtime = (V_dc * Ah * eta) / P',
    equation_latex: 't_{runtime} = \\frac{V_{dc} \\times Ah \\times \\eta}{P}',
    difficulty_level: 'beginner',
    tags: ['ups', 'runtime', 'backup power'],
    inputs: [
      {
        name: 'dc_voltage',
        symbol: 'V_dc',
        description: 'Battery voltage',
        unit: 'V',
        data_type: 'float',
        required: true,
        default_value: 48,
        min_value: 12,
        max_value: 600,
        input_order: 1,
        placeholder: 'e.g. 48',
        help_text: 'Battery bank voltage'
      },
      {
        name: 'capacity_ah',
        symbol: 'Ah',
        description: 'Available battery capacity',
        unit: 'Ah',
        data_type: 'float',
        required: true,
        default_value: 100,
        min_value: 1,
        max_value: 10000,
        input_order: 2,
        placeholder: 'e.g. 100',
        help_text: 'Battery capacity in Amp-Hours'
      },
      {
        name: 'efficiency',
        symbol: 'eta',
        description: 'System efficiency',
        unit: '',
        data_type: 'float',
        required: true,
        default_value: 0.90,
        min_value: 0.70,
        max_value: 0.98,
        input_order: 3,
        placeholder: 'e.g. 0.90',
        help_text: 'UPS/inverter efficiency'
      },
      {
        name: 'load_power',
        symbol: 'P',
        description: 'Connected load power',
        unit: 'W',
        data_type: 'float',
        required: true,
        default_value: 2000,
        min_value: 10,
        max_value: 1000000,
        input_order: 4,
        placeholder: 'e.g. 2000',
        help_text: 'Total power drawn by connected loads'
      }
    ],
    outputs: [
      {
        name: 'runtime',
        symbol: 't_runtime',
        description: 'Backup runtime',
        unit: 'hours',
        data_type: 'float',
        output_order: 1,
        precision: 2
      }
    ]
  },

  // Number of Batteries Required
  {
    equation_id: 'eq_battery_count',
    name: 'Number of Batteries Required',
    description: 'Calculate number of batteries needed for desired capacity and voltage',
    domain: 'electrical',
    category_slug: 'power-calcs',
    equation: 'N_batteries = (V_system / V_battery) * (Ah_required / Ah_battery)',
    equation_latex: 'N_{batteries} = \\frac{V_{system}}{V_{battery}} \\times \\frac{Ah_{required}}{Ah_{battery}}',
    difficulty_level: 'intermediate',
    tags: ['battery', 'sizing', 'design'],
    inputs: [
      {
        name: 'system_voltage',
        symbol: 'V_system',
        description: 'Required system voltage',
        unit: 'V',
        data_type: 'float',
        required: true,
        default_value: 48,
        min_value: 12,
        max_value: 600,
        input_order: 1,
        placeholder: 'e.g. 48',
        help_text: 'Target DC system voltage'
      },
      {
        name: 'battery_voltage',
        symbol: 'V_battery',
        description: 'Individual battery voltage',
        unit: 'V',
        data_type: 'float',
        required: true,
        default_value: 12,
        min_value: 2,
        max_value: 48,
        input_order: 2,
        placeholder: 'e.g. 12',
        help_text: 'Voltage of each battery unit (common: 12V)'
      },
      {
        name: 'required_capacity',
        symbol: 'Ah_required',
        description: 'Required total capacity',
        unit: 'Ah',
        data_type: 'float',
        required: true,
        default_value: 200,
        min_value: 1,
        max_value: 10000,
        input_order: 3,
        placeholder: 'e.g. 200',
        help_text: 'Total Ah capacity needed'
      },
      {
        name: 'battery_capacity',
        symbol: 'Ah_battery',
        description: 'Individual battery capacity',
        unit: 'Ah',
        data_type: 'float',
        required: true,
        default_value: 100,
        min_value: 1,
        max_value: 1000,
        input_order: 4,
        placeholder: 'e.g. 100',
        help_text: 'Capacity of each battery unit'
      }
    ],
    outputs: [
      {
        name: 'number_of_batteries',
        symbol: 'N_batteries',
        description: 'Total batteries needed',
        unit: '',
        data_type: 'float',
        output_order: 1,
        precision: 0
      }
    ]
  },

  // UPS Load Percentage
  {
    equation_id: 'eq_ups_load_percentage',
    name: 'UPS Load Utilization',
    description: 'Calculate UPS load as percentage of rated capacity',
    domain: 'electrical',
    category_slug: 'power-calcs',
    equation: 'Load_pct = (P_load / P_ups_rated) * 100',
    equation_latex: 'Load_{\\%} = \\frac{P_{load}}{P_{UPS}} \\times 100',
    difficulty_level: 'beginner',
    tags: ['ups', 'load', 'capacity'],
    inputs: [
      {
        name: 'load_power',
        symbol: 'P_load',
        description: 'Connected load power',
        unit: 'kVA',
        data_type: 'float',
        required: true,
        default_value: 30,
        min_value: 0.1,
        max_value: 10000,
        input_order: 1,
        placeholder: 'e.g. 30',
        help_text: 'Total connected load'
      },
      {
        name: 'ups_rated_power',
        symbol: 'P_ups',
        description: 'UPS rated capacity',
        unit: 'kVA',
        data_type: 'float',
        required: true,
        default_value: 40,
        min_value: 1,
        max_value: 10000,
        input_order: 2,
        placeholder: 'e.g. 40',
        help_text: 'UPS nameplate rating'
      }
    ],
    outputs: [
      {
        name: 'load_percentage',
        symbol: 'Load_%',
        description: 'Load utilization',
        unit: '%',
        data_type: 'float',
        output_order: 1,
        precision: 1
      }
    ]
  }
];
