/**
 * BlueMind Business Rules and Constants
 * CRITICAL - DO NOT DEVIATE FROM THESE VALUES
 */

// EXACT date ranges - verify these in your calculations
export const Q2_BILLING_START = new Date(2025, 2, 31); // March 31, 2025 (month is 0-indexed)
export const Q2_BILLING_END = new Date(2025, 5, 29); // June 29, 2025

// Payroll check dates: employees get paid ~2 weeks after the work period
// Check date 4/18/2025 → work period ~March 31 - April 6, 2025  
// Check date 7/11/2025 → work period ~June 23 - June 29, 2025
export const Q2_PAYROLL_CHECK_START = new Date(2025, 3, 18); // April 18, 2025
export const Q2_PAYROLL_CHECK_END = new Date(2025, 6, 11); // July 11, 2025

// EXACT employee name mappings - implement precisely
// PAYROLL NAME → BILLING NAME
export const EMPLOYEE_NAME_MAPPING: Record<string, string> = {
  'Francis, Keeaira': 'Francis, Keearia',
  'Gallegos Labrado, Maritza': 'Labrado, Maritza Gallegos',
  'Gallegos Labrado, Marit': 'Labrado, Maritza Gallegos', // User reported this variation
  'Wilcox, Breann R': 'Wilcox, BreAnn',
  'Clegg, Charmisha M': 'Clegg, Charmisha', // User reported this needs mapping
  'Hammound, Tarek': 'Hammoud, Ricky', // User clarified: payroll → billing
  'Mihai, Bryan': 'Mihai, Brian', // Payroll Bryan → Billing Brian
  // DeStevens variations - all same person
  'Destevens, Kaileigh': 'DeStevens, Kaileigh', // Payroll → canonical billing name
  'deStevens, Kaileigh': 'DeStevens, Kaileigh',  // lowercase billing → canonical billing name
  // NEW MAPPINGS IDENTIFIED FROM DATA ANALYSIS
  'El Aroud, Mariam': 'ElAroud, Mariam',
  'Alkhalidi, Zahraa J': 'Alkhalidi, Zahraa',
  'Aqrabawi, Zakia D': 'Aqrabawi, Zakia',
  'Mazloum, Mohamdali': 'Mazloum, Moe',
  'Smith, Anaily A': 'Smith, Anaily',
};

// HR staff to exclude from billable calculations
export const HR_STAFF = [
  'Seifeddine, Malak',
  'Hammoud, Ricky',
  'Elmoghrabi, Mariam',
  'Mazloum, Moe',
  'Karnib, Malik',
  'Clegg, Charmisha',  // Training and quit
  'Hancox, Maria C'    // Training and quit
];

// Employee role classification and hourly rates
export const EMPLOYEE_ROLES = {
  TECH: {
    hourlyRate: 19,
    serviceCodes: [97153], // Techs only provide code 97153
    name: 'Technician'
  },
  BCBA: {
    hourlyRate: 55,
    serviceCodes: [97155, 97156, 97151], // BCBAs provide these codes
    salaryThreshold: 32, // 32+ billable hours = salary
    name: 'BCBA'
  }
} as const;

// Industry benchmarks for comparison
export const UTILIZATION_BENCHMARK = 90; // 90% utilization for Technicians
export const PROFIT_MARGIN_BENCHMARK = 35; // 35% overall company profit margin

// Expected Q2 2025 results for validation (AMOUNTS-BASED APPROACH)
export const EXPECTED_RESULTS = {
  REVENUE: 773034.41, // From actual billing data
  UTILIZATION_RATE: 85.7, // Hours-based metric for employee analysis
  TOTAL_PAYROLL_COST: 456070.37, // Actual total staff cost from payroll data
  PROFIT_MARGIN: 40.9, // (Revenue - Total Staff Cost) / Revenue * 100
  GROSS_PROFIT: 316964.04, // Revenue - Total Staff Cost (773034.41 - 456070.37)
} as const;

// Performance tier thresholds for Technicians (utilization-based)
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