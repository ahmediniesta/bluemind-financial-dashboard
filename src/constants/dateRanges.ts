/**
 * BlueMind Date Range Utilities
 * Functions for validating and filtering date ranges
 */

import { format, parseISO, isValid } from 'date-fns';
import { Q2_BILLING_START, Q2_BILLING_END, Q2_PAYROLL_CHECK_START, Q2_PAYROLL_CHECK_END } from './businessRules';

export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INTERNAL: 'yyyy-MM-dd',
  BILLING: 'M/d/yyyy', // Common CSV format
  PAYROLL: 'MM/dd/yyyy', // Common Excel format
} as const;

export const Q2_DATE_RANGES = {
  BILLING: {
    start: Q2_BILLING_START,
    end: Q2_BILLING_END,
    label: 'Q2 Billing Period',
    description: 'March 31, 2025 - June 27, 2025',
  },
  PAYROLL: {
    start: Q2_PAYROLL_CHECK_START,
    end: Q2_PAYROLL_CHECK_END,
    label: 'Q2 Payroll Period',
    description: 'April 18, 2025 - July 11, 2025',
  },
} as const;

/**
 * Check if a billing session date falls within Q2 2025 range
 * March 31, 2025 - June 27, 2025
 */
export const isValidBillingDate = (sessionDate: string | Date): boolean => {
  try {
    const date = typeof sessionDate === 'string' ? parseFlexibleDate(sessionDate) : sessionDate;
    if (!date || !isValid(date)) return false;
    
    // Ensure we're comparing dates properly (start of day)
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const startOnly = new Date(Q2_BILLING_START.getFullYear(), Q2_BILLING_START.getMonth(), Q2_BILLING_START.getDate());
    const endOnly = new Date(Q2_BILLING_END.getFullYear(), Q2_BILLING_END.getMonth(), Q2_BILLING_END.getDate());
    
    return dateOnly >= startOnly && dateOnly <= endOnly;
  } catch {
    return false;
  }
};

/**
 * Check if a payroll check date falls within Q2 2025 range
 * April 18, 2025 - July 11, 2025
 */
export const isValidPayrollDate = (checkDate: string | Date): boolean => {
  try {
    const date = typeof checkDate === 'string' ? parseFlexibleDate(checkDate) : checkDate;
    if (!date || !isValid(date)) return false;
    
    // Ensure we're comparing dates properly (start of day)
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const startOnly = new Date(Q2_PAYROLL_CHECK_START.getFullYear(), Q2_PAYROLL_CHECK_START.getMonth(), Q2_PAYROLL_CHECK_START.getDate());
    const endOnly = new Date(Q2_PAYROLL_CHECK_END.getFullYear(), Q2_PAYROLL_CHECK_END.getMonth(), Q2_PAYROLL_CHECK_END.getDate());
    
    return dateOnly >= startOnly && dateOnly <= endOnly;
  } catch {
    return false;
  }
};

/**
 * Parse various date string formats commonly found in CSV/Excel files
 */
export const parseFlexibleDate = (dateString: string): Date | null => {
  if (!dateString || typeof dateString !== 'string') return null;
  
  // Clean the date string and remove payroll suffixes like "- Prior", "- Void", etc.
  const cleanDate = dateString.trim().replace(/\s*-\s*(Prior|Void|[A-Za-z\s]+).*$/, '');
  
  // Handle MM/dd/yyyy or M/d/yyyy (most common in CSV/Excel)
  const slashPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const slashMatch = cleanDate.match(slashPattern);
  if (slashMatch) {
    const [, month, day, year] = slashMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (isValid(date)) return date;
  }
  
  // Handle yyyy-MM-dd format
  const isoPattern = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
  const isoMatch = cleanDate.match(isoPattern);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (isValid(date)) return date;
  }
  
  // Handle Excel date serial numbers (days since 1900-01-01)
  const serialNumber = parseFloat(cleanDate);
  if (!isNaN(serialNumber) && serialNumber > 25000 && serialNumber < 60000) {
    // Convert Excel serial date to JavaScript Date
    const excelDate = new Date((serialNumber - 25569) * 86400 * 1000);
    if (isValid(excelDate)) return excelDate;
  }
  
  // Try parseISO for ISO formats
  try {
    const isoParse = parseISO(cleanDate);
    if (isValid(isoParse)) return isoParse;
  } catch {
    // Continue to other methods
  }
  
  // Try direct Date parsing as last resort
  const directParse = new Date(cleanDate);
  if (isValid(directParse) && directParse.getFullYear() > 2020 && directParse.getFullYear() < 2030) {
    return directParse;
  }
  
  return null;
};

/**
 * Format date for display in the dashboard
 */
export const formatDisplayDate = (date: Date): string => {
  return format(date, DATE_FORMATS.DISPLAY);
};

/**
 * Get date range summary for dashboard display
 */
export const getDateRangeSummary = () => {
  return {
    billing: {
      start: formatDisplayDate(Q2_BILLING_START),
      end: formatDisplayDate(Q2_BILLING_END),
      range: `${formatDisplayDate(Q2_BILLING_START)} - ${formatDisplayDate(Q2_BILLING_END)}`,
    },
    payroll: {
      start: formatDisplayDate(Q2_PAYROLL_CHECK_START),
      end: formatDisplayDate(Q2_PAYROLL_CHECK_END),
      range: `${formatDisplayDate(Q2_PAYROLL_CHECK_START)} - ${formatDisplayDate(Q2_PAYROLL_CHECK_END)}`,
    },
  };
}; 