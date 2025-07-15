/**
 * BlueMind Billing Data Types
 * Based on Master BlueMind Claims Data_Entry 3.csv structure
 */

export interface BillingRecord {
  County: string;
  Batch: number;
  Location: string;
  'Client Name': string;
  'Tech Name': string; // KEY: Use for employee matching
  'Edu ': string;
  Rate: number;
  'Session Date': string; // KEY: Filter by Q2 dates
  Code: number;
  'Start Time': string;
  'End Time': string;
  Duration: string;
  Hours: number; // KEY: Sum for billable hours
  Units: number;
  Price: number; // KEY: Sum for revenue
  'Insurance Type': string;
  Comment: string;
  Note: string;
  'Conflict Client': string;
  'Conflict Tech': number;
}

export interface ProcessedBillingData {
  records: BillingRecord[];
  totalRecords: number;
  totalRevenue: number;
  totalBillableHours: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  uniqueEmployees: string[];
  errors: BillingDataError[];
}

export interface BillingDataError {
  row: number;
  field: string;
  value: string;
  error: string;
  severity: 'warning' | 'error';
}

export interface BillingValidationResult {
  isValid: boolean;
  errors: BillingDataError[];
  warnings: BillingDataError[];
  validRecords: BillingRecord[];
  invalidRecords: number;
}

export interface EmployeeBillingSummary {
  employeeName: string;
  totalHours: number;
  totalRevenue: number;
  sessionCount: number;
  averageRate: number;
  revenuePerHour: number;
} 