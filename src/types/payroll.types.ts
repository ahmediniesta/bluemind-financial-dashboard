/**
 * BlueMind Payroll Data Types
 * Based on PayrollSummary 2.xlsx structure
 */

export interface PayrollRecord {
  'Pay Frequency': string;
  Department: string;
  'Check Date': string; // KEY: Filter by check date range
  Name: string; // KEY: Use for employee matching
  Hours: number; // KEY: Sum for total payroll hours
  'Total Paid': number;
  'Tax Withheld': number;
  Deductions: number;
  'Net Pay': number;
  'Payment Details/Check No': string;
  'Employer Liability': number;
  'Total Expenses': number; // KEY: Sum for payroll costs
}

export interface ProcessedPayrollData {
  records: PayrollRecord[];
  totalRecords: number;
  totalPayrollCost: number;
  totalPayrollHours: number;
  billableStaffCost: number;
  billableStaffHours: number;
  hrCost: number;
  hrHours: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  uniqueEmployees: string[];
  errors: PayrollDataError[];
}

export interface PayrollDataError {
  row: number;
  field: string;
  value: string;
  error: string;
  severity: 'warning' | 'error';
}

export interface PayrollValidationResult {
  isValid: boolean;
  errors: PayrollDataError[];
  warnings: PayrollDataError[];
  validRecords: PayrollRecord[];
  invalidRecords: number;
}

export interface EmployeePayrollSummary {
  employeeName: string;
  totalHours: number;
  totalPaid: number;
  totalExpenses: number;
  averageHourlyRate: number;
  payPeriods: number;
  isHRStaff: boolean;
  isBillable: boolean;
}

export interface PayrollPeriodSummary {
  checkDate: string;
  totalEmployees: number;
  totalHours: number;
  totalCost: number;
  billableEmployees: number;
  billableHours: number;
  billableCost: number;
  hrEmployees: number;
  hrHours: number;
  hrCost: number;
} 