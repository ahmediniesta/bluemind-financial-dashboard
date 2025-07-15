/**
 * Date Debugging Utilities
 * Helps validate and debug date processing for Q2 2025 data
 */

import { parseFlexibleDate, isValidBillingDate, isValidPayrollDate } from '../constants/dateRanges';
import { Q2_BILLING_START, Q2_BILLING_END, Q2_PAYROLL_CHECK_START, Q2_PAYROLL_CHECK_END } from '../constants/businessRules';

export const debugDateRanges = () => {
  // eslint-disable-next-line no-console
  console.log('=== BlueMind Q2 2025 Date Ranges ===');
  // eslint-disable-next-line no-console
  console.log('Billing Period:', {
    start: Q2_BILLING_START.toLocaleDateString(),
    end: Q2_BILLING_END.toLocaleDateString(),
    startISO: Q2_BILLING_START.toISOString(),
    endISO: Q2_BILLING_END.toISOString(),
  });
  // eslint-disable-next-line no-console
  console.log('Payroll Period:', {
    start: Q2_PAYROLL_CHECK_START.toLocaleDateString(),
    end: Q2_PAYROLL_CHECK_END.toLocaleDateString(),
    startISO: Q2_PAYROLL_CHECK_START.toISOString(),
    endISO: Q2_PAYROLL_CHECK_END.toISOString(),
  });
};

export const testDateParsing = (dateString: string, type: 'billing' | 'payroll') => {
  const parsed = parseFlexibleDate(dateString);
  const isValid = type === 'billing' ? 
    parsed ? isValidBillingDate(parsed) : false :
    parsed ? isValidPayrollDate(parsed) : false;
  
  // eslint-disable-next-line no-console
  console.log(`Date Test [${type}]:`, {
    original: dateString,
    parsed: parsed?.toLocaleDateString(),
    parsedISO: parsed?.toISOString(),
    isValid,
    type,
  });
  
  return { parsed, isValid };
};

export const validateSampleDates = () => {
  // eslint-disable-next-line no-console
  console.log('=== Sample Date Validations ===');
  
  // Test billing dates
  testDateParsing('3/31/2025', 'billing'); // Start date
  testDateParsing('6/27/2025', 'billing'); // End date
  testDateParsing('5/15/2025', 'billing'); // Middle date
  testDateParsing('3/30/2025', 'billing'); // Before start
  testDateParsing('6/28/2025', 'billing'); // After end
  
  // Test payroll dates
  testDateParsing('4/18/2025', 'payroll'); // Start date
  testDateParsing('7/11/2025', 'payroll'); // End date
  testDateParsing('6/1/2025', 'payroll'); // Middle date
  testDateParsing('4/17/2025', 'payroll'); // Before start
  testDateParsing('7/12/2025', 'payroll'); // After end
};

// Export for console debugging
if (typeof window !== 'undefined') {
  (window as any).bluemindDebug = {
    debugDateRanges,
    testDateParsing,
    validateSampleDates,
    parseFlexibleDate,
    isValidBillingDate,
    isValidPayrollDate,
  };
} 