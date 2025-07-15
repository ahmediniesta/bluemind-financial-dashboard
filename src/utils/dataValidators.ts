/**
 * BlueMind Data Validation Utilities
 * Comprehensive validation for data integrity and quality
 */

import { BillingRecord, BillingValidationResult } from '../types/billing.types';
import { PayrollRecord, PayrollValidationResult } from '../types/payroll.types';
import { DataQualityMetrics, DataQualityIssue } from '../types/dashboard.types';
import { parseFlexibleDate, isValidBillingDate, isValidPayrollDate } from '../constants/dateRanges';
import { isHRStaff } from '../constants/employeeMapping';
import { DATA_QUALITY_THRESHOLDS } from '../constants/businessRules';

export class DataValidator {
  /**
   * Validate billing data records
   */
  validateBillingData(records: BillingRecord[]): BillingValidationResult {
    const errors: Array<{ row: number; field: string; value: string; error: string; severity: 'warning' | 'error' }> = [];
    const warnings: Array<{ row: number; field: string; value: string; error: string; severity: 'warning' | 'error' }> = [];
    const validRecords: BillingRecord[] = [];
    let invalidRecords = 0;

    records.forEach((record, index) => {
      const rowNumber = index + 1;
      let isValid = true;

      // Validate required fields
      if (!record['Tech Name'] || record['Tech Name'].trim() === '') {
        errors.push({
          row: rowNumber,
          field: 'Tech Name',
          value: record['Tech Name'] || '',
          error: 'Tech Name is required',
          severity: 'error',
        });
        isValid = false;
      }

      if (!record['Session Date']) {
        errors.push({
          row: rowNumber,
          field: 'Session Date',
          value: record['Session Date'] || '',
          error: 'Session Date is required',
          severity: 'error',
        });
        isValid = false;
      } else {
        // Validate date format and range
        const sessionDate = parseFlexibleDate(record['Session Date']);
        if (!sessionDate) {
          errors.push({
            row: rowNumber,
            field: 'Session Date',
            value: record['Session Date'],
            error: 'Invalid date format',
            severity: 'error',
          });
          isValid = false;
        } else if (!isValidBillingDate(sessionDate)) {
          warnings.push({
            row: rowNumber,
            field: 'Session Date',
            value: record['Session Date'],
            error: 'Date outside Q2 2025 billing period',
            severity: 'warning',
          });
        }
      }

      // Validate numeric fields
      if (typeof record.Hours !== 'number' || record.Hours < 0) {
        errors.push({
          row: rowNumber,
          field: 'Hours',
          value: String(record.Hours),
          error: 'Hours must be a positive number',
          severity: 'error',
        });
        isValid = false;
      } else if (record.Hours > 24) {
        warnings.push({
          row: rowNumber,
          field: 'Hours',
          value: String(record.Hours),
          error: 'Hours exceed 24 in a single day',
          severity: 'warning',
        });
      }

      if (typeof record.Price !== 'number' || record.Price < 0) {
        errors.push({
          row: rowNumber,
          field: 'Price',
          value: String(record.Price),
          error: 'Price must be a positive number',
          severity: 'error',
        });
        isValid = false;
      }

      if (typeof record.Rate !== 'number' || record.Rate < 0) {
        warnings.push({
          row: rowNumber,
          field: 'Rate',
          value: String(record.Rate),
          error: 'Rate should be a positive number',
          severity: 'warning',
        });
      }

      // Business logic validations
      if (record.Hours > 0 && record.Price > 0) {
        const calculatedRate = record.Price / record.Hours;
        const recordedRate = record.Rate;
        
        if (recordedRate > 0 && Math.abs(calculatedRate - recordedRate) > 1) {
          warnings.push({
            row: rowNumber,
            field: 'Rate',
            value: `Calculated: ${calculatedRate.toFixed(2)}, Recorded: ${recordedRate}`,
            error: 'Rate mismatch between calculated and recorded values',
            severity: 'warning',
          });
        }
      }

      if (isValid) {
        validRecords.push(record);
      } else {
        invalidRecords++;
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      validRecords,
      invalidRecords,
    };
  }

  /**
   * Validate payroll data records
   */
  validatePayrollData(records: PayrollRecord[]): PayrollValidationResult {
    const errors: Array<{ row: number; field: string; value: string; error: string; severity: 'warning' | 'error' }> = [];
    const warnings: Array<{ row: number; field: string; value: string; error: string; severity: 'warning' | 'error' }> = [];
    const validRecords: PayrollRecord[] = [];
    let invalidRecords = 0;

    records.forEach((record, index) => {
      const rowNumber = index + 1;
      let isValid = true;

      // Validate required fields
      if (!record.Name || record.Name.trim() === '') {
        errors.push({
          row: rowNumber,
          field: 'Name',
          value: record.Name || '',
          error: 'Employee name is required',
          severity: 'error',
        });
        isValid = false;
      }

      if (!record['Check Date']) {
        errors.push({
          row: rowNumber,
          field: 'Check Date',
          value: record['Check Date'] || '',
          error: 'Check Date is required',
          severity: 'error',
        });
        isValid = false;
      } else {
        // Validate date format and range
        const checkDate = parseFlexibleDate(record['Check Date']);
        if (!checkDate) {
          errors.push({
            row: rowNumber,
            field: 'Check Date',
            value: record['Check Date'],
            error: 'Invalid date format',
            severity: 'error',
          });
          isValid = false;
        } else if (!isValidPayrollDate(checkDate)) {
          warnings.push({
            row: rowNumber,
            field: 'Check Date',
            value: record['Check Date'],
            error: 'Date outside Q2 2025 payroll period',
            severity: 'warning',
          });
        }
      }

      // Validate numeric fields
      if (typeof record.Hours !== 'number' || record.Hours < 0) {
        errors.push({
          row: rowNumber,
          field: 'Hours',
          value: String(record.Hours),
          error: 'Hours must be a positive number',
          severity: 'error',
        });
        isValid = false;
      } else if (record.Hours > 80) {
        warnings.push({
          row: rowNumber,
          field: 'Hours',
          value: String(record.Hours),
          error: 'Hours exceed 80 in a pay period',
          severity: 'warning',
        });
      }

      if (typeof record['Total Expenses'] !== 'number' || record['Total Expenses'] < 0) {
        errors.push({
          row: rowNumber,
          field: 'Total Expenses',
          value: String(record['Total Expenses']),
          error: 'Total Expenses must be a positive number',
          severity: 'error',
        });
        isValid = false;
      }

      // Business logic validations
      const totalPaid = record['Total Paid'] || 0;
      const taxWithheld = record['Tax Withheld'] || 0;
      const deductions = record.Deductions || 0;
      const netPay = record['Net Pay'] || 0;
      
      const calculatedNetPay = totalPaid - taxWithheld - deductions;
      if (Math.abs(calculatedNetPay - netPay) > 0.01) {
        warnings.push({
          row: rowNumber,
          field: 'Net Pay',
          value: `Calculated: ${calculatedNetPay.toFixed(2)}, Recorded: ${netPay.toFixed(2)}`,
          error: 'Net pay calculation mismatch',
          severity: 'warning',
        });
      }

      // Check for void payments
      const paymentDetails = record['Payment Details/Check No'] || '';
      if (paymentDetails.toLowerCase().includes('void')) {
        warnings.push({
          row: rowNumber,
          field: 'Payment Details/Check No',
          value: paymentDetails,
          error: 'Void payment detected',
          severity: 'warning',
        });
      }

      if (isValid) {
        validRecords.push(record);
      } else {
        invalidRecords++;
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      validRecords,
      invalidRecords,
    };
  }

  /**
   * Calculate overall data quality metrics
   */
  calculateDataQuality(
    billingValidation: BillingValidationResult,
    payrollValidation: PayrollValidationResult,
    employeeMatchingRate: number
  ): DataQualityMetrics {
    const issues: DataQualityIssue[] = [];

    // Billing data quality
    const billingTotal = billingValidation.validRecords.length + billingValidation.invalidRecords;
    const billingQuality = billingTotal > 0 ? (billingValidation.validRecords.length / billingTotal) * 100 : 0;

    // Payroll data quality
    const payrollTotal = payrollValidation.validRecords.length + payrollValidation.invalidRecords;
    const payrollQuality = payrollTotal > 0 ? (payrollValidation.validRecords.length / payrollTotal) * 100 : 0;

    // Add issues from validation results
    if (billingValidation.errors.length > 0) {
      issues.push({
        type: 'error',
        category: 'billing',
        message: 'Billing data contains validation errors',
        count: billingValidation.errors.length,
        impact: 'high',
      });
    }

    if (billingValidation.warnings.length > 0) {
      issues.push({
        type: 'warning',
        category: 'billing',
        message: 'Billing data contains validation warnings',
        count: billingValidation.warnings.length,
        impact: 'medium',
      });
    }

    if (payrollValidation.errors.length > 0) {
      issues.push({
        type: 'error',
        category: 'payroll',
        message: 'Payroll data contains validation errors',
        count: payrollValidation.errors.length,
        impact: 'high',
      });
    }

    if (payrollValidation.warnings.length > 0) {
      issues.push({
        type: 'warning',
        category: 'payroll',
        message: 'Payroll data contains validation warnings',
        count: payrollValidation.warnings.length,
        impact: 'medium',
      });
    }

    if (employeeMatchingRate < 90) {
      issues.push({
        type: 'warning',
        category: 'matching',
        message: 'Low employee matching rate between systems',
        count: 1,
        impact: employeeMatchingRate < 70 ? 'high' : 'medium',
      });
    }

    // Calculate overall score
    const overallScore = (billingQuality + payrollQuality + employeeMatchingRate) / 3;

    return {
      billingDataQuality: Math.round(billingQuality),
      payrollDataQuality: Math.round(payrollQuality),
      employeeMatchingRate: Math.round(employeeMatchingRate),
      overallScore: Math.round(overallScore),
      issues,
    };
  }

  /**
   * Validate employee data consistency
   */
  validateEmployeeConsistency(
    billingEmployees: string[],
    payrollEmployees: string[]
  ): {
    duplicateBilling: string[];
    duplicatePayroll: string[];
    suspiciousNames: string[];
    hrStaffInBilling: string[];
  } {
    // Check for duplicates
    const billingCounts = this.countOccurrences(billingEmployees);
    const payrollCounts = this.countOccurrences(payrollEmployees);
    
    const duplicateBilling = Object.keys(billingCounts).filter(name => billingCounts[name] > 1);
    const duplicatePayroll = Object.keys(payrollCounts).filter(name => payrollCounts[name] > 1);

    // Check for suspicious names (too short, contains numbers, etc.)
    const suspiciousNames = [...billingEmployees, ...payrollEmployees].filter(name => {
      return name.length < 3 || /\d/.test(name) || !/[a-zA-Z]/.test(name);
    });

    // Check for HR staff appearing in billing data
    const hrStaffInBilling = billingEmployees.filter(name => isHRStaff(name));

    return {
      duplicateBilling: [...new Set(duplicateBilling)],
      duplicatePayroll: [...new Set(duplicatePayroll)],
      suspiciousNames: [...new Set(suspiciousNames)],
      hrStaffInBilling: [...new Set(hrStaffInBilling)],
    };
  }

  /**
   * Validate financial calculations for reasonableness
   */
  validateFinancialMetrics(metrics: {
    totalRevenue: number;
    totalPayrollCost: number;
    utilizationRate: number;
    profitMargin: number;
  }): {
    isReasonable: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];

    // Revenue reasonableness checks
    if (metrics.totalRevenue <= 0) {
      warnings.push('Total revenue is zero or negative');
    } else if (metrics.totalRevenue > 10000000) {
      warnings.push('Total revenue seems unusually high');
    }

    // Payroll cost reasonableness
    if (metrics.totalPayrollCost <= 0) {
      warnings.push('Total payroll cost is zero or negative');
    } else if (metrics.totalPayrollCost > metrics.totalRevenue * 2) {
      warnings.push('Payroll costs exceed twice the revenue');
    }

    // Utilization rate reasonableness
    if (metrics.utilizationRate < 0 || metrics.utilizationRate > 100) {
      warnings.push('Utilization rate is outside valid range (0-100%)');
    } else if (metrics.utilizationRate > 95) {
      warnings.push('Utilization rate seems unusually high (>95%)');
    } else if (metrics.utilizationRate < 20) {
      warnings.push('Utilization rate seems unusually low (<20%)');
    }

    // Profit margin reasonableness
    if (metrics.profitMargin < -100 || metrics.profitMargin > 100) {
      warnings.push('Profit margin is outside reasonable range');
    } else if (metrics.profitMargin < 0) {
      warnings.push('Negative profit margin indicates losses');
    } else if (metrics.profitMargin > 80) {
      warnings.push('Profit margin seems unusually high (>80%)');
    }

    return {
      isReasonable: warnings.length === 0,
      warnings,
    };
  }

  /**
   * Count occurrences of items in array
   */
  private countOccurrences<T>(array: T[]): Record<string, number> {
    const counts: Record<string, number> = {};
    array.forEach(item => {
      const key = String(item);
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }

  /**
   * Get data quality grade based on score
   */
  getDataQualityGrade(score: number): {
    grade: string;
    color: string;
    description: string;
  } {
    if (score >= DATA_QUALITY_THRESHOLDS.EXCELLENT) {
      return {
        grade: 'A+',
        color: 'success',
        description: 'Excellent data quality',
      };
    } else if (score >= DATA_QUALITY_THRESHOLDS.GOOD) {
      return {
        grade: 'A',
        color: 'success',
        description: 'Good data quality',
      };
    } else if (score >= DATA_QUALITY_THRESHOLDS.FAIR) {
      return {
        grade: 'B',
        color: 'warning',
        description: 'Fair data quality - some issues present',
      };
    } else {
      return {
        grade: 'C',
        color: 'danger',
        description: 'Poor data quality - significant issues',
      };
    }
  }
}

// Export singleton instance
export const dataValidator = new DataValidator(); 