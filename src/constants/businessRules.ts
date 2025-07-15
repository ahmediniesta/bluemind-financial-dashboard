/**
 * BlueMind Business Rules and Constants
 * CRITICAL - DO NOT DEVIATE FROM THESE VALUES
 */

// EXACT date ranges - verify these in your calculations
export const Q2_BILLING_START = new Date('2025-03-31');
export const Q2_BILLING_END = new Date('2025-06-27'); // Back to original as per user spec

// Payroll check dates: employees get paid 2 weeks after the work period
// Check date 4/18/2025 → work period ~April 4-9, 2025
// Check date 7/11/2025 → work period ~June 27-July 2, 2025
export const Q2_PAYROLL_CHECK_START = new Date('2025-04-18');
export const Q2_PAYROLL_CHECK_END = new Date('2025-07-11');

// EXACT employee name mappings - implement precisely
// PAYROLL NAME → BILLING NAME
export const EMPLOYEE_NAME_MAPPING: Record<string, string> = {
  'Francis, Keeaira': 'Francis, Keearia',
  'Gallegos Labrado, Maritza': 'Labrado, Maritza Gallegos',
  'Gallegos Labrado, Marit': 'Labrado, Maritza Gallegos', // User reported this variation
  'Wilcox, Breann R': 'Wilcox, BreAnn',
  'Clegg, Charmisha M': 'Clegg, Charmisha', // User reported this needs mapping
  'Hammound, Tarek': 'Hammoud, Ricky', // User clarified: payroll → billing
};

// HR staff to exclude from billable calculations
export const HR_STAFF = ['Seifeddine, Malak'];

// Industry benchmarks for comparison
export const UTILIZATION_BENCHMARK = 90; // 90%
export const PROFIT_MARGIN_BENCHMARK = 35; // 35%

// Expected Q2 2025 results for validation
export const EXPECTED_RESULTS = {
  REVENUE: 723471.65,
  UTILIZATION_RATE: 92.5,
  NON_BILLABLE_COST: 19097, // EXCLUDES HR
  PROFIT_MARGIN: 47.6, // vs billable staff only
} as const;

// Performance tier thresholds
export const PERFORMANCE_THRESHOLDS = {
  EXCELLENT: 90, // >= 90% utilization
  GOOD: 80, // >= 80% utilization
  NEEDS_IMPROVEMENT: 50, // >= 50% utilization
  CRITICAL: 0, // < 50% utilization
} as const;

// File processing constants
export const FILE_PROCESSING = {
  PAYROLL_START_ROW: 8, // Start from row 8 in Excel file (data starts after headers at row 7)
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  SUPPORTED_EXTENSIONS: ['.csv', '.xlsx', '.xls'],
  ENCODING: 'utf-8',
} as const;

// Calculation precision
export const PRECISION = {
  CURRENCY: 2,
  PERCENTAGE: 1,
  HOURS: 2,
  RATES: 2,
} as const;

// Validation tolerances for testing
export const VALIDATION_TOLERANCES = {
  REVENUE: 100, // ±$100
  UTILIZATION_RATE: 0.5, // ±0.5%
  NON_BILLABLE_COST: 100, // ±$100
  PROFIT_MARGIN: 1, // ±1%
} as const;

// Chart colors and styling
export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#06b6d4',
  NEUTRAL: '#6b7280',
  REVENUE: '#22c55e',
  BILLABLE_COST: '#3b82f6',
  HR_COST: '#f97316',
  BENCHMARK: '#ef4444',
} as const;

// Performance indicators
export const getPerformanceColor = (utilization: number): string => {
  if (utilization >= PERFORMANCE_THRESHOLDS.EXCELLENT) return CHART_COLORS.SUCCESS;
  if (utilization >= PERFORMANCE_THRESHOLDS.GOOD) return CHART_COLORS.WARNING;
  if (utilization >= PERFORMANCE_THRESHOLDS.NEEDS_IMPROVEMENT) return CHART_COLORS.INFO;
  return CHART_COLORS.DANGER;
};

// Data quality thresholds
export const DATA_QUALITY_THRESHOLDS = {
  EXCELLENT: 95,
  GOOD: 85,
  FAIR: 70,
  POOR: 0,
} as const; 