/**
 * Mathematics Equations - Batch 1
 * Algebra, Calculus, Statistics, Geometry, Trigonometry
 * Total: 50 equations
 */

export const mathematicsBatch1 = [
  // ============================================
  // ALGEBRA EQUATIONS (10 equations)
  // ============================================
  
  {
    equation_id: 'eq_math_quadratic_roots',
    name: 'Quadratic Formula',
    description: 'Solutions to quadratic equation',
    domain: 'mathematics',
    category_slug: 'algebra',
    equation: 'x = (-b + sqrt(b^2 - 4*a*c)) / (2*a)',
    equation_latex: 'x = \\frac{-b + \\sqrt{b^2 - 4ac}}{2a}',
    difficulty_level: 'beginner',
    tags: ['algebra', 'quadratic', 'roots'],
    inputs: [
      { name: 'a', symbol: 'a', description: 'Coefficient of x²', unit: '', default_value: 1, input_order: 1 },
      { name: 'b', symbol: 'b', description: 'Coefficient of x', unit: '', default_value: -5, input_order: 2 },
      { name: 'c', symbol: 'c', description: 'Constant Term', unit: '', default_value: 6, input_order: 3 }
    ],
    outputs: [
      { name: 'x', symbol: 'x', description: 'First Root', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_math_discriminant',
    name: 'Discriminant',
    description: 'Determinant of quadratic root nature',
    domain: 'mathematics',
    category_slug: 'algebra',
    equation: 'D = b^2 - 4*a*c',
    equation_latex: 'D = b^2 - 4ac',
    difficulty_level: 'beginner',
    tags: ['algebra', 'quadratic', 'discriminant'],
    inputs: [
      { name: 'a', symbol: 'a', description: 'Coefficient of x²', unit: '', default_value: 1, input_order: 1 },
      { name: 'b', symbol: 'b', description: 'Coefficient of x', unit: '', default_value: -5, input_order: 2 },
      { name: 'c', symbol: 'c', description: 'Constant Term', unit: '', default_value: 6, input_order: 3 }
    ],
    outputs: [
      { name: 'D', symbol: 'D', description: 'Discriminant', unit: '', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_math_logarithm',
    name: 'Logarithm',
    description: 'Natural logarithm',
    domain: 'mathematics',
    category_slug: 'algebra',
    equation: 'y = ln(x)',
    equation_latex: 'y = \\ln(x)',
    difficulty_level: 'beginner',
    tags: ['algebra', 'logarithm', 'natural'],
    inputs: [
      { name: 'x', symbol: 'x', description: 'Input Value', unit: '', default_value: 10, min_value: 0.001, input_order: 1 }
    ],
    outputs: [
      { name: 'y', symbol: 'y', description: 'Natural Logarithm', unit: '', output_order: 1, precision: 6 }
    ]
  },
  {
    equation_id: 'eq_math_exponential',
    name: 'Exponential Function',
    description: 'Euler\'s number raised to power',
    domain: 'mathematics',
    category_slug: 'algebra',
    equation: 'y = exp(x)',
    equation_latex: 'y = e^x',
    difficulty_level: 'beginner',
    tags: ['algebra', 'exponential', 'euler'],
    inputs: [
      { name: 'x', symbol: 'x', description: 'Exponent', unit: '', default_value: 2, input_order: 1 }
    ],
    outputs: [
      { name: 'y', symbol: 'y', description: 'Exponential Value', unit: '', output_order: 1, precision: 6 }
    ]
  },
  {
    equation_id: 'eq_math_power',
    name: 'Power Function',
    description: 'Base raised to exponent',
    domain: 'mathematics',
    category_slug: 'algebra',
    equation: 'y = x^n',
    equation_latex: 'y = x^n',
    difficulty_level: 'beginner',
    tags: ['algebra', 'power', 'exponent'],
    inputs: [
      { name: 'x', symbol: 'x', description: 'Base', unit: '', default_value: 2, input_order: 1 },
      { name: 'n', symbol: 'n', description: 'Exponent', unit: '', default_value: 3, input_order: 2 }
    ],
    outputs: [
      { name: 'y', symbol: 'y', description: 'Result', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_math_nth_root',
    name: 'Nth Root',
    description: 'Nth root of a number',
    domain: 'mathematics',
    category_slug: 'algebra',
    equation: 'y = x^(1/n)',
    equation_latex: 'y = \\sqrt[n]{x}',
    difficulty_level: 'beginner',
    tags: ['algebra', 'root', 'radical'],
    inputs: [
      { name: 'x', symbol: 'x', description: 'Radicand', unit: '', default_value: 27, min_value: 0, input_order: 1 },
      { name: 'n', symbol: 'n', description: 'Root Index', unit: '', default_value: 3, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'y', symbol: 'y', description: 'Nth Root', unit: '', output_order: 1, precision: 6 }
    ]
  },
  {
    equation_id: 'eq_math_factorial',
    name: 'Factorial',
    description: 'Product of all positive integers up to n',
    domain: 'mathematics',
    category_slug: 'algebra',
    equation: 'n! = n * (n-1) * (n-2) * ... * 1',
    equation_latex: 'n! = n \\times (n-1) \\times (n-2) \\times \\cdots \\times 1',
    difficulty_level: 'beginner',
    tags: ['algebra', 'factorial', 'combinatorics'],
    inputs: [
      { name: 'n', symbol: 'n', description: 'Integer', unit: '', default_value: 5, min_value: 0, max_value: 170, input_order: 1 }
    ],
    outputs: [
      { name: 'factorial', symbol: 'n!', description: 'Factorial', unit: '', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_math_permutation',
    name: 'Permutation',
    description: 'Number of ways to arrange r items from n',
    domain: 'mathematics',
    category_slug: 'algebra',
    equation: 'P(n,r) = n! / (n-r)!',
    equation_latex: 'P(n,r) = \\frac{n!}{(n-r)!}',
    difficulty_level: 'intermediate',
    tags: ['algebra', 'permutation', 'combinatorics'],
    inputs: [
      { name: 'n', symbol: 'n', description: 'Total Items', unit: '', default_value: 10, min_value: 0, input_order: 1 },
      { name: 'r', symbol: 'r', description: 'Items to Arrange', unit: '', default_value: 3, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'P', symbol: 'P(n,r)', description: 'Number of Permutations', unit: '', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_math_combination',
    name: 'Combination',
    description: 'Number of ways to choose r items from n',
    domain: 'mathematics',
    category_slug: 'algebra',
    equation: 'C(n,r) = n! / (r! * (n-r)!)',
    equation_latex: 'C(n,r) = \\frac{n!}{r!(n-r)!}',
    difficulty_level: 'intermediate',
    tags: ['algebra', 'combination', 'combinatorics'],
    inputs: [
      { name: 'n', symbol: 'n', description: 'Total Items', unit: '', default_value: 10, min_value: 0, input_order: 1 },
      { name: 'r', symbol: 'r', description: 'Items to Choose', unit: '', default_value: 3, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'C', symbol: 'C(n,r)', description: 'Number of Combinations', unit: '', output_order: 1, precision: 0 }
    ]
  },
  {
    equation_id: 'eq_math_binomial_theorem',
    name: 'Binomial Coefficient',
    description: 'Coefficient in binomial expansion',
    domain: 'mathematics',
    category_slug: 'algebra',
    equation: 'C(n,k) = n! / (k! * (n-k)!)',
    equation_latex: '\\binom{n}{k} = \\frac{n!}{k!(n-k)!}',
    difficulty_level: 'intermediate',
    tags: ['algebra', 'binomial', 'coefficient'],
    inputs: [
      { name: 'n', symbol: 'n', description: 'Power', unit: '', default_value: 5, min_value: 0, input_order: 1 },
      { name: 'k', symbol: 'k', description: 'Term Index', unit: '', default_value: 2, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'C', symbol: 'C(n,k)', description: 'Binomial Coefficient', unit: '', output_order: 1, precision: 0 }
    ]
  },

  // ============================================
  // CALCULUS EQUATIONS (10 equations)
  // ============================================
  
  {
    equation_id: 'eq_math_derivative_power',
    name: 'Power Rule Derivative',
    description: 'Derivative of x^n',
    domain: 'mathematics',
    category_slug: 'calculus',
    equation: 'dy/dx = n * x^(n-1)',
    equation_latex: '\\frac{dy}{dx} = nx^{n-1}',
    difficulty_level: 'beginner',
    tags: ['calculus', 'derivative', 'power-rule'],
    inputs: [
      { name: 'x', symbol: 'x', description: 'Value of x', unit: '', default_value: 3, input_order: 1 },
      { name: 'n', symbol: 'n', description: 'Power', unit: '', default_value: 4, input_order: 2 }
    ],
    outputs: [
      { name: 'dy_dx', symbol: 'dy/dx', description: 'Derivative', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_math_derivative_exponential',
    name: 'Exponential Derivative',
    description: 'Derivative of e^(ax)',
    domain: 'mathematics',
    category_slug: 'calculus',
    equation: 'dy/dx = a * exp(a*x)',
    equation_latex: '\\frac{dy}{dx} = ae^{ax}',
    difficulty_level: 'intermediate',
    tags: ['calculus', 'derivative', 'exponential'],
    inputs: [
      { name: 'a', symbol: 'a', description: 'Coefficient', unit: '', default_value: 2, input_order: 1 },
      { name: 'x', symbol: 'x', description: 'Value of x', unit: '', default_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'dy_dx', symbol: 'dy/dx', description: 'Derivative', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_math_derivative_logarithm',
    name: 'Logarithmic Derivative',
    description: 'Derivative of ln(x)',
    domain: 'mathematics',
    category_slug: 'calculus',
    equation: 'dy/dx = 1/x',
    equation_latex: '\\frac{dy}{dx} = \\frac{1}{x}',
    difficulty_level: 'beginner',
    tags: ['calculus', 'derivative', 'logarithm'],
    inputs: [
      { name: 'x', symbol: 'x', description: 'Value of x', unit: '', default_value: 5, min_value: 0.001, input_order: 1 }
    ],
    outputs: [
      { name: 'dy_dx', symbol: 'dy/dx', description: 'Derivative', unit: '', output_order: 1, precision: 6 }
    ]
  },
  {
    equation_id: 'eq_math_integral_power',
    name: 'Power Rule Integral',
    description: 'Integral of x^n',
    domain: 'mathematics',
    category_slug: 'calculus',
    equation: 'integral = x^(n+1) / (n+1)',
    equation_latex: '\\int x^n dx = \\frac{x^{n+1}}{n+1}',
    difficulty_level: 'beginner',
    tags: ['calculus', 'integral', 'power-rule'],
    inputs: [
      { name: 'x', symbol: 'x', description: 'Upper Limit', unit: '', default_value: 5, input_order: 1 },
      { name: 'n', symbol: 'n', description: 'Power', unit: '', default_value: 2, input_order: 2 }
    ],
    outputs: [
      { name: 'integral', symbol: '∫xⁿdx', description: 'Integral from 0 to x', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_math_integral_exponential',
    name: 'Exponential Integral',
    description: 'Integral of e^(ax)',
    domain: 'mathematics',
    category_slug: 'calculus',
    equation: 'integral = (exp(a*x) - 1) / a',
    equation_latex: '\\int e^{ax} dx = \\frac{e^{ax} - 1}{a}',
    difficulty_level: 'intermediate',
    tags: ['calculus', 'integral', 'exponential'],
    inputs: [
      { name: 'a', symbol: 'a', description: 'Coefficient', unit: '', default_value: 2, input_order: 1 },
      { name: 'x', symbol: 'x', description: 'Upper Limit', unit: '', default_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'integral', symbol: '∫eᵃˣdx', description: 'Integral from 0 to x', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_math_taylor_series',
    name: 'Taylor Series Expansion',
    description: 'Taylor series approximation',
    domain: 'mathematics',
    category_slug: 'calculus',
    equation: 'f(x) ≈ f(a) + f\'(a)*(x-a) + f\'\'(a)*(x-a)^2/2!',
    equation_latex: 'f(x) \\approx f(a) + f\'(a)(x-a) + \\frac{f\'\'(a)}{2!}(x-a)^2',
    difficulty_level: 'advanced',
    tags: ['calculus', 'taylor', 'series'],
    inputs: [
      { name: 'f_a', symbol: 'f(a)', description: 'Function Value at a', unit: '', default_value: 1, input_order: 1 },
      { name: 'f_prime_a', symbol: 'f\'(a)', description: 'First Derivative at a', unit: '', default_value: 0, input_order: 2 },
      { name: 'f_double_prime_a', symbol: 'f\'\'(a)', description: 'Second Derivative at a', unit: '', default_value: -1, input_order: 3 },
      { name: 'x', symbol: 'x', description: 'Point to Evaluate', unit: '', default_value: 0.1, input_order: 4 },
      { name: 'a', symbol: 'a', description: 'Expansion Point', unit: '', default_value: 0, input_order: 5 }
    ],
    outputs: [
      { name: 'f_x', symbol: 'f(x)', description: 'Approximated Value', unit: '', output_order: 1, precision: 6 }
    ]
  },
  {
    equation_id: 'eq_math_partial_derivative',
    name: 'Partial Derivative',
    description: 'Rate of change with respect to one variable',
    domain: 'mathematics',
    category_slug: 'calculus',
    equation: 'df/dx = n * x^(n-1) * y^m',
    equation_latex: '\\frac{\\partial f}{\\partial x} = nx^{n-1}y^m',
    difficulty_level: 'intermediate',
    tags: ['calculus', 'partial-derivative', 'multivariable'],
    inputs: [
      { name: 'x', symbol: 'x', description: 'Value of x', unit: '', default_value: 2, input_order: 1 },
      { name: 'y', symbol: 'y', description: 'Value of y', unit: '', default_value: 3, input_order: 2 },
      { name: 'n', symbol: 'n', description: 'Power of x', unit: '', default_value: 2, input_order: 3 },
      { name: 'm', symbol: 'm', description: 'Power of y', unit: '', default_value: 3, input_order: 4 }
    ],
    outputs: [
      { name: 'df_dx', symbol: '∂f/∂x', description: 'Partial Derivative', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_math_gradient',
    name: 'Gradient',
    description: 'Vector of partial derivatives',
    domain: 'mathematics',
    category_slug: 'calculus',
    equation: '|grad f| = sqrt((df/dx)^2 + (df/dy)^2)',
    equation_latex: '|\\nabla f| = \\sqrt{\\left(\\frac{\\partial f}{\\partial x}\\right)^2 + \\left(\\frac{\\partial f}{\\partial y}\\right)^2}',
    difficulty_level: 'intermediate',
    tags: ['calculus', 'gradient', 'vector'],
    inputs: [
      { name: 'df_dx', symbol: '∂f/∂x', description: 'Partial Derivative x', unit: '', default_value: 3, input_order: 1 },
      { name: 'df_dy', symbol: '∂f/∂y', description: 'Partial Derivative y', unit: '', default_value: 4, input_order: 2 }
    ],
    outputs: [
      { name: 'gradient_magnitude', symbol: '|∇f|', description: 'Gradient Magnitude', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_math_arc_length',
    name: 'Arc Length',
    description: 'Length of curve from a to b',
    domain: 'mathematics',
    category_slug: 'calculus',
    equation: 'L = integral(sqrt(1 + (dy/dx)^2)) * dx',
    equation_latex: 'L = \\int_a^b \\sqrt{1 + \\left(\\frac{dy}{dx}\\right)^2} dx',
    difficulty_level: 'advanced',
    tags: ['calculus', 'arc-length', 'integral'],
    inputs: [
      { name: 'a', symbol: 'a', description: 'Start Point', unit: '', default_value: 0, input_order: 1 },
      { name: 'b', symbol: 'b', description: 'End Point', unit: '', default_value: 1, input_order: 2 },
      { name: 'dy_dx_avg', symbol: 'dy/dx_avg', description: 'Average Derivative', unit: '', default_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'L', symbol: 'L', description: 'Approximate Arc Length', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_math_surface_area_revolution',
    name: 'Surface Area of Revolution',
    description: 'Surface area from rotating curve',
    domain: 'mathematics',
    category_slug: 'calculus',
    equation: 'S = 2 * PI * integral(y * sqrt(1 + (dy/dx)^2)) * dx',
    equation_latex: 'S = 2\\pi \\int_a^b y\\sqrt{1 + \\left(\\frac{dy}{dx}\\right)^2} dx',
    difficulty_level: 'advanced',
    tags: ['calculus', 'surface-area', 'revolution'],
    inputs: [
      { name: 'y_avg', symbol: 'y_avg', description: 'Average y Value', unit: '', default_value: 2, input_order: 1 },
      { name: 'dy_dx_avg', symbol: 'dy/dx_avg', description: 'Average Derivative', unit: '', default_value: 0.5, input_order: 2 },
      { name: 'a', symbol: 'a', description: 'Start Point', unit: '', default_value: 0, input_order: 3 },
      { name: 'b', symbol: 'b', description: 'End Point', unit: '', default_value: 2, input_order: 4 }
    ],
    outputs: [
      { name: 'S', symbol: 'S', description: 'Approximate Surface Area', unit: '', output_order: 1, precision: 4 }
    ]
  },

  // ============================================
  // STATISTICS EQUATIONS (15 equations)
  // ============================================
  
  {
    equation_id: 'eq_stats_mean',
    name: 'Arithmetic Mean',
    description: 'Average of data set',
    domain: 'mathematics',
    category_slug: 'statistics',
    equation: 'mean = sum(x_i) / n',
    equation_latex: '\\bar{x} = \\frac{\\sum x_i}{n}',
    difficulty_level: 'beginner',
    tags: ['statistics', 'mean', 'average'],
    inputs: [
      { name: 'sum_x', symbol: 'Σx', description: 'Sum of Values', unit: '', default_value: 500, input_order: 1 },
      { name: 'n', symbol: 'n', description: 'Number of Values', unit: '', default_value: 10, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'mean', symbol: 'x̄', description: 'Mean', unit: '', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_stats_variance',
    name: 'Variance',
    description: 'Measure of data spread',
    domain: 'mathematics',
    category_slug: 'statistics',
    equation: 'variance = sum((x_i - mean)^2) / (n-1)',
    equation_latex: 's^2 = \\frac{\\sum(x_i - \\bar{x})^2}{n-1}',
    difficulty_level: 'intermediate',
    tags: ['statistics', 'variance', 'spread'],
    inputs: [
      { name: 'sum_sq_diff', symbol: 'Σ(x-x̄)²', description: 'Sum of Squared Differences', unit: '', default_value: 400, input_order: 1 },
      { name: 'n', symbol: 'n', description: 'Number of Values', unit: '', default_value: 10, min_value: 2, input_order: 2 }
    ],
    outputs: [
      { name: 'variance', symbol: 's²', description: 'Sample Variance', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_stats_standard_deviation',
    name: 'Standard Deviation',
    description: 'Square root of variance',
    domain: 'mathematics',
    category_slug: 'statistics',
    equation: 'std_dev = sqrt(variance)',
    equation_latex: 's = \\sqrt{s^2}',
    difficulty_level: 'beginner',
    tags: ['statistics', 'std-dev', 'spread'],
    inputs: [
      { name: 'variance', symbol: 's²', description: 'Variance', unit: '', default_value: 44.4, min_value: 0, input_order: 1 }
    ],
    outputs: [
      { name: 'std_dev', symbol: 's', description: 'Standard Deviation', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_stats_coefficient_variation',
    name: 'Coefficient of Variation',
    description: 'Relative measure of dispersion',
    domain: 'mathematics',
    category_slug: 'statistics',
    equation: 'CV = (std_dev / mean) * 100',
    equation_latex: 'CV = \\frac{s}{\\bar{x}} \\times 100',
    difficulty_level: 'intermediate',
    tags: ['statistics', 'cv', 'dispersion'],
    inputs: [
      { name: 'std_dev', symbol: 's', description: 'Standard Deviation', unit: '', default_value: 6.66, min_value: 0, input_order: 1 },
      { name: 'mean', symbol: 'x̄', description: 'Mean', unit: '', default_value: 50, min_value: 0.001, input_order: 2 }
    ],
    outputs: [
      { name: 'CV', symbol: 'CV', description: 'Coefficient of Variation', unit: '%', output_order: 1, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_stats_median_position',
    name: 'Median Position',
    description: 'Position of median in sorted data',
    domain: 'mathematics',
    category_slug: 'statistics',
    equation: 'position = (n + 1) / 2',
    equation_latex: 'position = \\frac{n+1}{2}',
    difficulty_level: 'beginner',
    tags: ['statistics', 'median', 'position'],
    inputs: [
      { name: 'n', symbol: 'n', description: 'Number of Values', unit: '', default_value: 10, min_value: 1, input_order: 1 }
    ],
    outputs: [
      { name: 'position', symbol: 'position', description: 'Median Position', unit: '', output_order: 1, precision: 1 }
    ]
  },
  {
    equation_id: 'eq_stats_correlation',
    name: 'Correlation Coefficient',
    description: 'Pearson correlation coefficient',
    domain: 'mathematics',
    category_slug: 'statistics',
    equation: 'r = sum((x - x_mean)*(y - y_mean)) / sqrt(sum((x-x_mean)^2) * sum((y-y_mean)^2))',
    equation_latex: 'r = \\frac{\\sum(x-\\bar{x})(y-\\bar{y})}{\\sqrt{\\sum(x-\\bar{x})^2 \\sum(y-\\bar{y})^2}}',
    difficulty_level: 'intermediate',
    tags: ['statistics', 'correlation', 'pearson'],
    inputs: [
      { name: 'sum_xy_dev', symbol: 'Σ(x-x̄)(y-ȳ)', description: 'Sum of Cross Deviations', unit: '', default_value: 450, input_order: 1 },
      { name: 'sum_x_sq_dev', symbol: 'Σ(x-x̄)²', description: 'Sum of X Deviations Squared', unit: '', default_value: 400, min_value: 0.001, input_order: 2 },
      { name: 'sum_y_sq_dev', symbol: 'Σ(y-ȳ)²', description: 'Sum of Y Deviations Squared', unit: '', default_value: 625, min_value: 0.001, input_order: 3 }
    ],
    outputs: [
      { name: 'r', symbol: 'r', description: 'Correlation Coefficient', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_stats_regression_slope',
    name: 'Linear Regression Slope',
    description: 'Slope of best fit line',
    domain: 'mathematics',
    category_slug: 'statistics',
    equation: 'm = (n*sum(x*y) - sum(x)*sum(y)) / (n*sum(x^2) - (sum(x))^2)',
    equation_latex: 'm = \\frac{n\\sum xy - \\sum x \\sum y}{n\\sum x^2 - (\\sum x)^2}',
    difficulty_level: 'intermediate',
    tags: ['statistics', 'regression', 'slope'],
    inputs: [
      { name: 'n', symbol: 'n', description: 'Number of Points', unit: '', default_value: 10, min_value: 2, input_order: 1 },
      { name: 'sum_xy', symbol: 'Σxy', description: 'Sum of xy', unit: '', default_value: 2800, input_order: 2 },
      { name: 'sum_x', symbol: 'Σx', description: 'Sum of x', unit: '', default_value: 50, input_order: 3 },
      { name: 'sum_y', symbol: 'Σy', description: 'Sum of y', unit: '', default_value: 500, input_order: 4 },
      { name: 'sum_x_sq', symbol: 'Σx²', description: 'Sum of x²', unit: '', default_value: 300, input_order: 5 }
    ],
    outputs: [
      { name: 'm', symbol: 'm', description: 'Slope', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_stats_regression_intercept',
    name: 'Linear Regression Intercept',
    description: 'Y-intercept of best fit line',
    domain: 'mathematics',
    category_slug: 'statistics',
    equation: 'b = (sum_y - m * sum_x) / n',
    equation_latex: 'b = \\frac{\\sum y - m \\sum x}{n}',
    difficulty_level: 'intermediate',
    tags: ['statistics', 'regression', 'intercept'],
    inputs: [
      { name: 'sum_y', symbol: 'Σy', description: 'Sum of y', unit: '', default_value: 500, input_order: 1 },
      { name: 'm', symbol: 'm', description: 'Slope', unit: '', default_value: 2, input_order: 2 },
      { name: 'sum_x', symbol: 'Σx', description: 'Sum of x', unit: '', default_value: 50, input_order: 3 },
      { name: 'n', symbol: 'n', description: 'Number of Points', unit: '', default_value: 10, min_value: 1, input_order: 4 }
    ],
    outputs: [
      { name: 'b', symbol: 'b', description: 'Y-Intercept', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_stats_normal_pdf',
    name: 'Normal Distribution PDF',
    description: 'Probability density function',
    domain: 'mathematics',
    category_slug: 'statistics',
    equation: 'f(x) = (1 / (sigma * sqrt(2*PI))) * exp(-(x-mu)^2 / (2*sigma^2))',
    equation_latex: 'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}',
    difficulty_level: 'intermediate',
    tags: ['statistics', 'normal', 'pdf'],
    inputs: [
      { name: 'x', symbol: 'x', description: 'Value', unit: '', default_value: 55, input_order: 1 },
      { name: 'mu', symbol: 'μ', description: 'Mean', unit: '', default_value: 50, input_order: 2 },
      { name: 'sigma', symbol: 'σ', description: 'Standard Deviation', unit: '', default_value: 10, min_value: 0.001, input_order: 3 }
    ],
    outputs: [
      { name: 'f_x', symbol: 'f(x)', description: 'Probability Density', unit: '', output_order: 1, precision: 6 }
    ]
  },
  {
    equation_id: 'eq_stats_z_score',
    name: 'Z-Score',
    description: 'Standard score',
    domain: 'mathematics',
    category_slug: 'statistics',
    equation: 'z = (x - mu) / sigma',
    equation_latex: 'z = \\frac{x - \\mu}{\\sigma}',
    difficulty_level: 'beginner',
    tags: ['statistics', 'z-score', 'standard'],
    inputs: [
      { name: 'x', symbol: 'x', description: 'Value', unit: '', default_value: 75, input_order: 1 },
      { name: 'mu', symbol: 'μ', description: 'Mean', unit: '', default_value: 50, input_order: 2 },
      { name: 'sigma', symbol: 'σ', description: 'Standard Deviation', unit: '', default_value: 10, min_value: 0.001, input_order: 3 }
    ],
    outputs: [
      { name: 'z', symbol: 'z', description: 'Z-Score', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_stats_standard_error',
    name: 'Standard Error',
    description: 'Standard error of the mean',
    domain: 'mathematics',
    category_slug: 'statistics',
    equation: 'SE = sigma / sqrt(n)',
    equation_latex: 'SE = \\frac{\\sigma}{\\sqrt{n}}',
    difficulty_level: 'intermediate',
    tags: ['statistics', 'standard-error', 'sampling'],
    inputs: [
      { name: 'sigma', symbol: 'σ', description: 'Standard Deviation', unit: '', default_value: 10, min_value: 0.001, input_order: 1 },
      { name: 'n', symbol: 'n', description: 'Sample Size', unit: '', default_value: 100, min_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'SE', symbol: 'SE', description: 'Standard Error', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_stats_confidence_interval',
    name: 'Confidence Interval',
    description: '95% confidence interval for mean',
    domain: 'mathematics',
    category_slug: 'statistics',
    equation: 'CI = mean +/- 1.96 * (sigma / sqrt(n))',
    equation_latex: 'CI = \\bar{x} \\pm 1.96 \\frac{\\sigma}{\\sqrt{n}}',
    difficulty_level: 'intermediate',
    tags: ['statistics', 'confidence-interval', 'estimation'],
    inputs: [
      { name: 'mean', symbol: 'x̄', description: 'Sample Mean', unit: '', default_value: 50, input_order: 1 },
      { name: 'sigma', symbol: 'σ', description: 'Standard Deviation', unit: '', default_value: 10, min_value: 0.001, input_order: 2 },
      { name: 'n', symbol: 'n', description: 'Sample Size', unit: '', default_value: 100, min_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'CI_lower', symbol: 'CI_lower', description: 'Lower Bound', unit: '', output_order: 1, precision: 2 },
      { name: 'CI_upper', symbol: 'CI_upper', description: 'Upper Bound', unit: '', output_order: 2, precision: 2 }
    ]
  },
  {
    equation_id: 'eq_stats_probability_union',
    name: 'Probability of Union',
    description: 'P(A or B)',
    domain: 'mathematics',
    category_slug: 'statistics',
    equation: 'P_A_union_B = P_A + P_B - P_A_intersect_B',
    equation_latex: 'P(A \\cup B) = P(A) + P(B) - P(A \\cap B)',
    difficulty_level: 'beginner',
    tags: ['statistics', 'probability', 'union'],
    inputs: [
      { name: 'P_A', symbol: 'P(A)', description: 'Probability of A', unit: '', default_value: 0.5, min_value: 0, max_value: 1, input_order: 1 },
      { name: 'P_B', symbol: 'P(B)', description: 'Probability of B', unit: '', default_value: 0.4, min_value: 0, max_value: 1, input_order: 2 },
      { name: 'P_A_intersect_B', symbol: 'P(A∩B)', description: 'Probability of A and B', unit: '', default_value: 0.2, min_value: 0, max_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'P_A_union_B', symbol: 'P(A∪B)', description: 'Probability of A or B', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_stats_conditional_probability',
    name: 'Conditional Probability',
    description: 'P(A|B) - Probability of A given B',
    domain: 'mathematics',
    category_slug: 'statistics',
    equation: 'P_A_given_B = P_A_intersect_B / P_B',
    equation_latex: 'P(A|B) = \\frac{P(A \\cap B)}{P(B)}',
    difficulty_level: 'intermediate',
    tags: ['statistics', 'probability', 'conditional'],
    inputs: [
      { name: 'P_A_intersect_B', symbol: 'P(A∩B)', description: 'Probability of A and B', unit: '', default_value: 0.2, min_value: 0, max_value: 1, input_order: 1 },
      { name: 'P_B', symbol: 'P(B)', description: 'Probability of B', unit: '', default_value: 0.4, min_value: 0.001, max_value: 1, input_order: 2 }
    ],
    outputs: [
      { name: 'P_A_given_B', symbol: 'P(A|B)', description: 'Conditional Probability', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_stats_bayes_theorem',
    name: 'Bayes\' Theorem',
    description: 'P(A|B) using Bayes\' theorem',
    domain: 'mathematics',
    category_slug: 'statistics',
    equation: 'P_A_given_B = (P_B_given_A * P_A) / P_B',
    equation_latex: 'P(A|B) = \\frac{P(B|A) P(A)}{P(B)}',
    difficulty_level: 'advanced',
    tags: ['statistics', 'bayes', 'probability'],
    inputs: [
      { name: 'P_B_given_A', symbol: 'P(B|A)', description: 'Probability of B given A', unit: '', default_value: 0.9, min_value: 0, max_value: 1, input_order: 1 },
      { name: 'P_A', symbol: 'P(A)', description: 'Prior Probability of A', unit: '', default_value: 0.1, min_value: 0, max_value: 1, input_order: 2 },
      { name: 'P_B', symbol: 'P(B)', description: 'Probability of B', unit: '', default_value: 0.2, min_value: 0.001, max_value: 1, input_order: 3 }
    ],
    outputs: [
      { name: 'P_A_given_B', symbol: 'P(A|B)', description: 'Posterior Probability', unit: '', output_order: 1, precision: 4 }
    ]
  },

  // ============================================
  // GEOMETRY EQUATIONS (10 equations)
  // ============================================
  
  {
    equation_id: 'eq_geo_circle_area',
    name: 'Circle Area',
    description: 'Area of a circle',
    domain: 'mathematics',
    category_slug: 'geometry',
    equation: 'A = PI * r^2',
    equation_latex: 'A = \\pi r^2',
    difficulty_level: 'beginner',
    tags: ['geometry', 'circle', 'area'],
    inputs: [
      { name: 'r', symbol: 'r', description: 'Radius', unit: 'm', default_value: 5, min_value: 0, input_order: 1 }
    ],
    outputs: [
      { name: 'A', symbol: 'A', description: 'Area', unit: 'm²', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_geo_circle_circumference',
    name: 'Circle Circumference',
    description: 'Perimeter of a circle',
    domain: 'mathematics',
    category_slug: 'geometry',
    equation: 'C = 2 * PI * r',
    equation_latex: 'C = 2\\pi r',
    difficulty_level: 'beginner',
    tags: ['geometry', 'circle', 'circumference'],
    inputs: [
      { name: 'r', symbol: 'r', description: 'Radius', unit: 'm', default_value: 5, min_value: 0, input_order: 1 }
    ],
    outputs: [
      { name: 'C', symbol: 'C', description: 'Circumference', unit: 'm', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_geo_sphere_volume',
    name: 'Sphere Volume',
    description: 'Volume of a sphere',
    domain: 'mathematics',
    category_slug: 'geometry',
    equation: 'V = (4/3) * PI * r^3',
    equation_latex: 'V = \\frac{4}{3}\\pi r^3',
    difficulty_level: 'beginner',
    tags: ['geometry', 'sphere', 'volume'],
    inputs: [
      { name: 'r', symbol: 'r', description: 'Radius', unit: 'm', default_value: 3, min_value: 0, input_order: 1 }
    ],
    outputs: [
      { name: 'V', symbol: 'V', description: 'Volume', unit: 'm³', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_geo_sphere_surface',
    name: 'Sphere Surface Area',
    description: 'Surface area of a sphere',
    domain: 'mathematics',
    category_slug: 'geometry',
    equation: 'A = 4 * PI * r^2',
    equation_latex: 'A = 4\\pi r^2',
    difficulty_level: 'beginner',
    tags: ['geometry', 'sphere', 'surface'],
    inputs: [
      { name: 'r', symbol: 'r', description: 'Radius', unit: 'm', default_value: 3, min_value: 0, input_order: 1 }
    ],
    outputs: [
      { name: 'A', symbol: 'A', description: 'Surface Area', unit: 'm²', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_geo_cylinder_volume',
    name: 'Cylinder Volume',
    description: 'Volume of a cylinder',
    domain: 'mathematics',
    category_slug: 'geometry',
    equation: 'V = PI * r^2 * h',
    equation_latex: 'V = \\pi r^2 h',
    difficulty_level: 'beginner',
    tags: ['geometry', 'cylinder', 'volume'],
    inputs: [
      { name: 'r', symbol: 'r', description: 'Radius', unit: 'm', default_value: 2, min_value: 0, input_order: 1 },
      { name: 'h', symbol: 'h', description: 'Height', unit: 'm', default_value: 5, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'V', symbol: 'V', description: 'Volume', unit: 'm³', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_geo_cone_volume',
    name: 'Cone Volume',
    description: 'Volume of a cone',
    domain: 'mathematics',
    category_slug: 'geometry',
    equation: 'V = (1/3) * PI * r^2 * h',
    equation_latex: 'V = \\frac{1}{3}\\pi r^2 h',
    difficulty_level: 'beginner',
    tags: ['geometry', 'cone', 'volume'],
    inputs: [
      { name: 'r', symbol: 'r', description: 'Radius', unit: 'm', default_value: 3, min_value: 0, input_order: 1 },
      { name: 'h', symbol: 'h', description: 'Height', unit: 'm', default_value: 5, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'V', symbol: 'V', description: 'Volume', unit: 'm³', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_geo_pyramid_volume',
    name: 'Pyramid Volume',
    description: 'Volume of a pyramid',
    domain: 'mathematics',
    category_slug: 'geometry',
    equation: 'V = (1/3) * A_base * h',
    equation_latex: 'V = \\frac{1}{3}A_{base} h',
    difficulty_level: 'beginner',
    tags: ['geometry', 'pyramid', 'volume'],
    inputs: [
      { name: 'A_base', symbol: 'A_base', description: 'Base Area', unit: 'm²', default_value: 20, min_value: 0, input_order: 1 },
      { name: 'h', symbol: 'h', description: 'Height', unit: 'm', default_value: 6, min_value: 0, input_order: 2 }
    ],
    outputs: [
      { name: 'V', symbol: 'V', description: 'Volume', unit: 'm³', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_geo_distance_2d',
    name: 'Distance Between Two Points (2D)',
    description: 'Euclidean distance in 2D',
    domain: 'mathematics',
    category_slug: 'geometry',
    equation: 'd = sqrt((x2-x1)^2 + (y2-y1)^2)',
    equation_latex: 'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}',
    difficulty_level: 'beginner',
    tags: ['geometry', 'distance', '2d'],
    inputs: [
      { name: 'x1', symbol: 'x₁', description: 'X Coordinate 1', unit: '', default_value: 1, input_order: 1 },
      { name: 'y1', symbol: 'y₁', description: 'Y Coordinate 1', unit: '', default_value: 2, input_order: 2 },
      { name: 'x2', symbol: 'x₂', description: 'X Coordinate 2', unit: '', default_value: 4, input_order: 3 },
      { name: 'y2', symbol: 'y₂', description: 'Y Coordinate 2', unit: '', default_value: 6, input_order: 4 }
    ],
    outputs: [
      { name: 'd', symbol: 'd', description: 'Distance', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_geo_distance_3d',
    name: 'Distance Between Two Points (3D)',
    description: 'Euclidean distance in 3D',
    domain: 'mathematics',
    category_slug: 'geometry',
    equation: 'd = sqrt((x2-x1)^2 + (y2-y1)^2 + (z2-z1)^2)',
    equation_latex: 'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2 + (z_2-z_1)^2}',
    difficulty_level: 'intermediate',
    tags: ['geometry', 'distance', '3d'],
    inputs: [
      { name: 'x1', symbol: 'x₁', description: 'X Coordinate 1', unit: '', default_value: 1, input_order: 1 },
      { name: 'y1', symbol: 'y₁', description: 'Y Coordinate 1', unit: '', default_value: 2, input_order: 2 },
      { name: 'z1', symbol: 'z₁', description: 'Z Coordinate 1', unit: '', default_value: 3, input_order: 3 },
      { name: 'x2', symbol: 'x₂', description: 'X Coordinate 2', unit: '', default_value: 4, input_order: 4 },
      { name: 'y2', symbol: 'y₂', description: 'Y Coordinate 2', unit: '', default_value: 6, input_order: 5 },
      { name: 'z2', symbol: 'z₂', description: 'Z Coordinate 2', unit: '', default_value: 8, input_order: 6 }
    ],
    outputs: [
      { name: 'd', symbol: 'd', description: 'Distance', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_geo_midpoint',
    name: 'Midpoint',
    description: 'Midpoint between two points',
    domain: 'mathematics',
    category_slug: 'geometry',
    equation: 'mid = ((x1+x2)/2, (y1+y2)/2)',
    equation_latex: 'M = \\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)',
    difficulty_level: 'beginner',
    tags: ['geometry', 'midpoint', 'coordinates'],
    inputs: [
      { name: 'x1', symbol: 'x₁', description: 'X Coordinate 1', unit: '', default_value: 2, input_order: 1 },
      { name: 'y1', symbol: 'y₁', description: 'Y Coordinate 1', unit: '', default_value: 4, input_order: 2 },
      { name: 'x2', symbol: 'x₂', description: 'X Coordinate 2', unit: '', default_value: 6, input_order: 3 },
      { name: 'y2', symbol: 'y₂', description: 'Y Coordinate 2', unit: '', default_value: 8, input_order: 4 }
    ],
    outputs: [
      { name: 'mid_x', symbol: 'M_x', description: 'Midpoint X', unit: '', output_order: 1, precision: 2 },
      { name: 'mid_y', symbol: 'M_y', description: 'Midpoint Y', unit: '', output_order: 2, precision: 2 }
    ]
  },

  // ============================================
  // TRIGONOMETRY EQUATIONS (5 equations)
  // ============================================
  
  {
    equation_id: 'eq_trig_pythagorean',
    name: 'Pythagorean Identity',
    description: 'Fundamental trigonometric identity',
    domain: 'mathematics',
    category_slug: 'trigonometry',
    equation: 'sin^2(theta) + cos^2(theta) = 1',
    equation_latex: '\\sin^2\\theta + \\cos^2\\theta = 1',
    difficulty_level: 'beginner',
    tags: ['trigonometry', 'identity', 'pythagorean'],
    inputs: [
      { name: 'theta', symbol: 'θ', description: 'Angle', unit: 'rad', default_value: 0.785, input_order: 1 }
    ],
    outputs: [
      { name: 'sin_theta', symbol: 'sin(θ)', description: 'Sine', unit: '', output_order: 1, precision: 4 },
      { name: 'cos_theta', symbol: 'cos(θ)', description: 'Cosine', unit: '', output_order: 2, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_trig_law_of_sines',
    name: 'Law of Sines',
    description: 'Relationship between sides and angles',
    domain: 'mathematics',
    category_slug: 'trigonometry',
    equation: 'a/sin(A) = b/sin(B) = c/sin(C)',
    equation_latex: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}',
    difficulty_level: 'intermediate',
    tags: ['trigonometry', 'law-of-sines', 'triangle'],
    inputs: [
      { name: 'a', symbol: 'a', description: 'Side a', unit: '', default_value: 10, min_value: 0.001, input_order: 1 },
      { name: 'A', symbol: 'A', description: 'Angle A', unit: 'rad', default_value: 0.524, min_value: 0.001, input_order: 2 },
      { name: 'B', symbol: 'B', description: 'Angle B', unit: 'rad', default_value: 0.785, min_value: 0.001, input_order: 3 }
    ],
    outputs: [
      { name: 'b', symbol: 'b', description: 'Side b', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_trig_law_of_cosines',
    name: 'Law of Cosines',
    description: 'Relationship for any triangle',
    domain: 'mathematics',
    category_slug: 'trigonometry',
    equation: 'c^2 = a^2 + b^2 - 2*a*b*cos(C)',
    equation_latex: 'c^2 = a^2 + b^2 - 2ab\\cos C',
    difficulty_level: 'intermediate',
    tags: ['trigonometry', 'law-of-cosines', 'triangle'],
    inputs: [
      { name: 'a', symbol: 'a', description: 'Side a', unit: '', default_value: 5, min_value: 0.001, input_order: 1 },
      { name: 'b', symbol: 'b', description: 'Side b', unit: '', default_value: 7, min_value: 0.001, input_order: 2 },
      { name: 'C', symbol: 'C', description: 'Angle C', unit: 'rad', default_value: 0.785, min_value: 0, input_order: 3 }
    ],
    outputs: [
      { name: 'c', symbol: 'c', description: 'Side c', unit: '', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_trig_area_triangle',
    name: 'Triangle Area (SAS)',
    description: 'Area using two sides and included angle',
    domain: 'mathematics',
    category_slug: 'trigonometry',
    equation: 'A = (1/2) * a * b * sin(C)',
    equation_latex: 'A = \\frac{1}{2}ab\\sin C',
    difficulty_level: 'intermediate',
    tags: ['trigonometry', 'area', 'triangle'],
    inputs: [
      { name: 'a', symbol: 'a', description: 'Side a', unit: 'm', default_value: 5, min_value: 0, input_order: 1 },
      { name: 'b', symbol: 'b', description: 'Side b', unit: 'm', default_value: 7, min_value: 0, input_order: 2 },
      { name: 'C', symbol: 'C', description: 'Included Angle', unit: 'rad', default_value: 0.785, min_value: 0, input_order: 3 }
    ],
    outputs: [
      { name: 'A', symbol: 'A', description: 'Area', unit: 'm²', output_order: 1, precision: 4 }
    ]
  },
  {
    equation_id: 'eq_trig_double_angle',
    name: 'Double Angle Formula',
    description: 'Sine of double angle',
    domain: 'mathematics',
    category_slug: 'trigonometry',
    equation: 'sin(2*theta) = 2 * sin(theta) * cos(theta)',
    equation_latex: '\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta',
    difficulty_level: 'intermediate',
    tags: ['trigonometry', 'double-angle', 'identity'],
    inputs: [
      { name: 'theta', symbol: 'θ', description: 'Angle', unit: 'rad', default_value: 0.524, input_order: 1 }
    ],
    outputs: [
      { name: 'sin_2theta', symbol: 'sin(2θ)', description: 'Sine of Double Angle', unit: '', output_order: 1, precision: 6 }
    ]
  }
];

export default mathematicsBatch1;
