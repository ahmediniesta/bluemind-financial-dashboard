/**
 * CRITICAL: Financial Calculation Validation Tests
 * These tests validate the mathematical accuracy of all financial calculations
 * using controlled test datasets with manually verifiable results
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CalculationEngine } from '../../utils/calculationEngine';
import { ProcessedBillingData } from '../../types/billing.types';
import { ProcessedPayrollData } from '../../types/payroll.types';

describe('CalculationEngine - Financial Accuracy Tests', () => {
  let calculationEngine: CalculationEngine;

  beforeEach(() => {
    calculationEngine = new CalculationEngine();
  });

  describe('Small Dataset Test - Manually Verifiable', () => {
    /**
     * Test Dataset 1: Simple, manually calculable scenario
     * 
     * Employee: John Smith
     * Billing: 100 hours @ $50/hour = $5,000 revenue
     * Payroll: 120 hours @ $25/hour = $3,000 cost
     * Non-billable: 120 - 100 = 20 hours
     * Non-billable cost: 20 * $25 = $500
     * 
     * Expected Results:
     * - Total Revenue: $5,000
     * - Billable Staff Cost: $3,000
     * - Non-billable Cost: $500
     * - Utilization Rate: 100/120 = 83.33%
     * - Profit Margin: ($5,000 - $3,000 - $500) / $5,000 = 30%
     */
    it('should calculate correctly for single employee scenario', () => {
      const testBillingData: ProcessedBillingData = {
        records: [
          {
            'County': 'Test County',
            'Batch': 1,
            'Location': 'Test Location',
            'Client Name': 'Test Client',
            'Tech Name': 'Smith, John',
            'Edu ': 'BA',
            'Rate': 50,
            'Session Date': '2025-04-15',
            'Code': 123,
            'Start Time': '09:00',
            'End Time': '10:00',
            'Duration': '1:00',
            'Hours': 100,
            'Units': 100,
            'Price': 5000,
            'Insurance Type': 'Test Insurance',
            'Comment': '',
            'Note': '',
            'Conflict Client': '',
            'Conflict Tech': 0,
          }
        ],
        totalRecords: 1,
        totalRevenue: 5000,
        totalBillableHours: 100,
        dateRange: {
          start: new Date('2025-03-30'),
          end: new Date('2025-06-29')
        },
        uniqueEmployees: ['Smith, John'],
        errors: []
      };

      const testPayrollData: ProcessedPayrollData = {
        records: [
          {
            'Pay Frequency': 'Bi-weekly',
            'Department': 'Therapy',
            'Check Date': '2025-04-25',
            'Name': 'Smith, John',
            'Hours': 120,
            'Total Paid': 2400,
            'Tax Withheld': 480,
            'Deductions': 120,
            'Net Pay': 1800,
            'Payment Details/Check No': 'CHK001',
            'Employer Liability': 600,
            'Total Expenses': 3000,
          }
        ],
        totalRecords: 1,
        totalPayrollCost: 3000,
        totalPayrollHours: 120,
        billableStaffCost: 0,
        billableStaffHours: 0,
        hrCost: 0,
        hrHours: 0,
        dateRange: {
          start: new Date('2025-04-18'),
          end: new Date('2025-07-11')
        },
        uniqueEmployees: ['Smith, John'],
        errors: []
      };

      const results = calculationEngine.calculateFinancialMetrics(testBillingData, testPayrollData);

      // Verify core calculations
      expect(results.totalRevenue).toBe(5000);
      expect(results.billableStaffCost).toBe(3000);
      expect(results.nonBillableCost).toBe(500);
      expect(results.utilizationRate).toBeCloseTo(83.33, 1);
      expect(results.comprehensiveProfitMargin).toBeCloseTo(30, 1);
    });

    /**
     * Test Dataset 2: Multiple employees with different scenarios
     * 
     * Employee A: High utilization (95%)
     * Employee B: Low utilization (60%)
     * Employee C: HR staff (excluded from utilization)
     * 
     * This tests the per-employee calculation method
     */
    it('should calculate correctly for multiple employees with varying utilization', () => {
      const testBillingData: ProcessedBillingData = {
        records: [
          {
            'County': 'Test County',
            'Batch': 1,
            'Location': 'Test Location',
            'Client Name': 'Client A',
            'Tech Name': 'High, Utilization',
            'Edu ': 'MA',
            'Rate': 60,
            'Session Date': '2025-04-15',
            'Code': 123,
            'Start Time': '09:00',
            'End Time': '10:00',
            'Duration': '1:00',
            'Hours': 95, // 95% utilization
            'Units': 95,
            'Price': 5700,
            'Insurance Type': 'Test Insurance',
            'Comment': '',
            'Note': '',
            'Conflict Client': '',
            'Conflict Tech': 0,
          },
          {
            'County': 'Test County',
            'Batch': 2,
            'Location': 'Test Location',
            'Client Name': 'Client B',
            'Tech Name': 'Low, Utilization',
            'Edu ': 'BA',
            'Rate': 50,
            'Session Date': '2025-04-16',
            'Code': 124,
            'Start Time': '10:00',
            'End Time': '11:00',
            'Duration': '1:00',
            'Hours': 60, // 60% utilization
            'Units': 60,
            'Price': 3000,
            'Insurance Type': 'Test Insurance',
            'Comment': '',
            'Note': '',
            'Conflict Client': '',
            'Conflict Tech': 0,
          }
        ],
        totalRevenue: 8700,
        totalBillableHours: 155,
        totalRecords: 1,
        dateRange: {
          start: new Date('2025-03-30'),
          end: new Date('2025-06-29')
        },
        uniqueEmployees: ['Smith, John'],
        errors: []
      };

      const testPayrollData: ProcessedPayrollData = {
        records: [
          {
            'Pay Frequency': 'Bi-weekly',
            'Department': 'Therapy',
            'Check Date': '2025-04-25',
            'Name': 'High, Utilization',
            'Hours': 100,
            'Total Paid': 3000,
            'Tax Withheld': 600,
            'Deductions': 150,
            'Net Pay': 2250,
            'Payment Details/Check No': 'CHK002',
            'Employer Liability': 750,
            'Total Expenses': 3750,
          },
          {
            'Pay Frequency': 'Bi-weekly',
            'Department': 'Therapy',
            'Check Date': '2025-04-25',
            'Name': 'Low, Utilization',
            'Hours': 100,
            'Total Paid': 2500,
            'Tax Withheld': 500,
            'Deductions': 125,
            'Net Pay': 1875,
            'Payment Details/Check No': 'CHK003',
            'Employer Liability': 625,
            'Total Expenses': 3125,
          },
          {
            'Pay Frequency': 'Bi-weekly',
            'Department': 'HR',
            'Check Date': '2025-04-25',
            'Name': 'Seifeddine, Malak', // HR staff - should be excluded
            'Hours': 80,
            'Total Paid': 2400,
            'Tax Withheld': 480,
            'Deductions': 120,
            'Net Pay': 1800,
            'Payment Details/Check No': 'CHK004',
            'Employer Liability': 600,
            'Total Expenses': 3000,
          }
        ],
        totalRecords: 1,
        totalPayrollCost: 9875,
        totalPayrollHours: 280,
        billableStaffCost: 0,
        billableStaffHours: 0,
        hrCost: 0,
        hrHours: 0,
        dateRange: {
          start: new Date('2025-04-18'),
          end: new Date('2025-07-11')
        },
        uniqueEmployees: ['Smith, John'],
        errors: []
      };

      const results = calculationEngine.calculateFinancialMetrics(testBillingData, testPayrollData);

      // Verify revenue calculation
      expect(results.totalRevenue).toBe(8700);
      
      // Verify billable staff cost excludes HR
      expect(results.billableStaffCost).toBe(6875); // 3750 + 3125, excluding HR
      
      // Verify HR cost is tracked separately
      expect(results.hrCost).toBe(3000);
      
      // Verify utilization rate calculation (billable staff only)
      const expectedUtilization = (155 / 200) * 100; // 155 billable / 200 payroll hours (excluding HR)
      expect(results.utilizationRate).toBeCloseTo(expectedUtilization, 1);
      
      // Verify non-billable cost calculation
      // Employee A: 100 - 95 = 5 non-billable hours
      // Employee B: 100 - 60 = 40 non-billable hours
      // Total: 45 non-billable hours
      const avgHourlyRate = 6875 / 200; // $34.375/hour
      const expectedNonBillableCost = 45 * avgHourlyRate;
      expect(results.nonBillableCost).toBeCloseTo(expectedNonBillableCost, 0);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle zero hours correctly', () => {
      const testBillingData: ProcessedBillingData = {
        records: [],
        totalRevenue: 0,
        totalBillableHours: 0,
        totalRecords: 1,
        dateRange: {
          start: new Date('2025-03-30'),
          end: new Date('2025-06-29')
        },
        uniqueEmployees: ['Smith, John'],
        errors: []
      };

      const testPayrollData: ProcessedPayrollData = {
        records: [],
        totalRecords: 1,
        totalPayrollCost: 0,
        totalPayrollHours: 0,
        billableStaffCost: 0,
        billableStaffHours: 0,
        hrCost: 0,
        hrHours: 0,
        dateRange: {
          start: new Date('2025-04-18'),
          end: new Date('2025-07-11')
        },
        uniqueEmployees: ['Smith, John'],
        errors: []
      };

      const results = calculationEngine.calculateFinancialMetrics(testBillingData, testPayrollData);

      expect(results.totalRevenue).toBe(0);
      expect(results.billableStaffCost).toBe(0);
      expect(results.nonBillableCost).toBe(0);
      expect(results.utilizationRate).toBe(0);
      expect(results.profitMargin).toBe(0);
    });

    it('should handle employee with no billing records', () => {
      const testBillingData: ProcessedBillingData = {
        records: [],
        totalRevenue: 0,
        totalBillableHours: 0,
        totalRecords: 1,
        dateRange: {
          start: new Date('2025-03-30'),
          end: new Date('2025-06-29')
        },
        uniqueEmployees: ['Smith, John'],
        errors: []
      };

      const testPayrollData: ProcessedPayrollData = {
        records: [
          {
            'Pay Frequency': 'Bi-weekly',
            'Department': 'Therapy',
            'Check Date': '2025-04-25',
            'Name': 'No, Billing',
            'Hours': 40,
            'Total Paid': 1000,
            'Tax Withheld': 200,
            'Deductions': 50,
            'Net Pay': 750,
            'Payment Details/Check No': 'CHK005',
            'Employer Liability': 250,
            'Total Expenses': 1250,
          }
        ],
        totalRecords: 1,
        totalPayrollCost: 1250,
        totalPayrollHours: 40,
        billableStaffCost: 0,
        billableStaffHours: 0,
        hrCost: 0,
        hrHours: 0,
        dateRange: {
          start: new Date('2025-04-18'),
          end: new Date('2025-07-11')
        },
        uniqueEmployees: ['Smith, John'],
        errors: []
      };

      const results = calculationEngine.calculateFinancialMetrics(testBillingData, testPayrollData);

      expect(results.totalRevenue).toBe(0);
      expect(results.billableStaffCost).toBe(1250);
      expect(results.nonBillableCost).toBe(1250); // All payroll hours are non-billable
      expect(results.utilizationRate).toBe(0);
      expect(results.profitMargin).toBe(0); // When revenue is 0, profit margin is 0 (not negative)
    });

    it('should handle extremely high utilization (over 100%)', () => {
      // This could happen if billing hours exceed payroll hours due to data entry errors
      const testBillingData: ProcessedBillingData = {
        records: [
          {
            'County': 'Test County',
            'Batch': 1,
            'Location': 'Test Location',
            'Client Name': 'Test Client',
            'Tech Name': 'Over, Achiever',
            'Edu ': 'MA',
            'Rate': 50,
            'Session Date': '2025-04-15',
            'Code': 123,
            'Start Time': '09:00',
            'End Time': '10:00',
            'Duration': '1:00',
            'Hours': 120, // More than payroll hours
            'Units': 120,
            'Price': 6000,
            'Insurance Type': 'Test Insurance',
            'Comment': '',
            'Note': '',
            'Conflict Client': '',
            'Conflict Tech': 0,
          }
        ],
        totalRevenue: 6000,
        totalBillableHours: 120,
        totalRecords: 1,
        dateRange: {
          start: new Date('2025-03-30'),
          end: new Date('2025-06-29')
        },
        uniqueEmployees: ['Smith, John'],
        errors: []
      };

      const testPayrollData: ProcessedPayrollData = {
        records: [
          {
            'Pay Frequency': 'Bi-weekly',
            'Department': 'Therapy',
            'Check Date': '2025-04-25',
            'Name': 'Over, Achiever',
            'Hours': 100, // Less than billing hours
            'Total Paid': 2500,
            'Tax Withheld': 500,
            'Deductions': 125,
            'Net Pay': 1875,
            'Payment Details/Check No': 'CHK006',
            'Employer Liability': 625,
            'Total Expenses': 3125,
          }
        ],
        totalRecords: 1,
        totalPayrollCost: 3125,
        totalPayrollHours: 100,
        billableStaffCost: 0,
        billableStaffHours: 0,
        hrCost: 0,
        hrHours: 0,
        dateRange: {
          start: new Date('2025-04-18'),
          end: new Date('2025-07-11')
        },
        uniqueEmployees: ['Smith, John'],
        errors: []
      };

      const results = calculationEngine.calculateFinancialMetrics(testBillingData, testPayrollData);

      expect(results.totalRevenue).toBe(6000);
      expect(results.billableStaffCost).toBe(3125);
      expect(results.nonBillableCost).toBe(0); // No non-billable hours (capped at 0)
      expect(results.utilizationRate).toBe(120); // Over 100%
      expect(results.profitMargin).toBeGreaterThan(0);
    });
  });

  describe('Validation Against Business Rules', () => {
    it('should properly exclude HR staff from utilization calculations', () => {
      const testBillingData: ProcessedBillingData = {
        records: [
          {
            'County': 'Test County',
            'Batch': 1,
            'Location': 'Test Location',
            'Client Name': 'Test Client',
            'Tech Name': 'Regular, Employee',
            'Edu ': 'BA',
            'Rate': 50,
            'Session Date': '2025-04-15',
            'Code': 123,
            'Start Time': '09:00',
            'End Time': '10:00',
            'Duration': '1:00',
            'Hours': 80,
            'Units': 80,
            'Price': 4000,
            'Insurance Type': 'Test Insurance',
            'Comment': '',
            'Note': '',
            'Conflict Client': '',
            'Conflict Tech': 0,
          }
        ],
        totalRevenue: 4000,
        totalBillableHours: 80,
        totalRecords: 1,
        dateRange: {
          start: new Date('2025-03-30'),
          end: new Date('2025-06-29')
        },
        uniqueEmployees: ['Smith, John'],
        errors: []
      };

      const testPayrollData: ProcessedPayrollData = {
        records: [
          {
            'Pay Frequency': 'Bi-weekly',
            'Department': 'Therapy',
            'Check Date': '2025-04-25',
            'Name': 'Regular, Employee',
            'Hours': 100,
            'Total Paid': 2500,
            'Tax Withheld': 500,
            'Deductions': 125,
            'Net Pay': 1875,
            'Payment Details/Check No': 'CHK007',
            'Employer Liability': 625,
            'Total Expenses': 3125,
          },
          {
            'Pay Frequency': 'Bi-weekly',
            'Department': 'HR',
            'Check Date': '2025-04-25',
            'Name': 'Seifeddine, Malak', // HR staff
            'Hours': 80,
            'Total Paid': 2400,
            'Tax Withheld': 480,
            'Deductions': 120,
            'Net Pay': 1800,
            'Payment Details/Check No': 'CHK008',
            'Employer Liability': 600,
            'Total Expenses': 3000,
          }
        ],
        totalRecords: 1,
        totalPayrollCost: 6125,
        totalPayrollHours: 180,
        billableStaffCost: 0,
        billableStaffHours: 0,
        hrCost: 0,
        hrHours: 0,
        dateRange: {
          start: new Date('2025-04-18'),
          end: new Date('2025-07-11')
        },
        uniqueEmployees: ['Smith, John'],
        errors: []
      };

      const results = calculationEngine.calculateFinancialMetrics(testBillingData, testPayrollData);

      // Utilization should be calculated only for billable staff (80/100 = 80%)
      expect(results.utilizationRate).toBeCloseTo(80, 1);
      
      // Billable staff cost should exclude HR
      expect(results.billableStaffCost).toBe(3125);
      
      // HR cost should be tracked separately
      expect(results.hrCost).toBe(3000);
    });
  });

  describe('Mathematical Consistency Checks', () => {
    it('should maintain mathematical consistency across different calculation methods', () => {
      // Test that the same result is achieved through different calculation paths
      const testBillingData: ProcessedBillingData = {
        records: [
          {
            'County': 'Test County',
            'Batch': 1,
            'Location': 'Test Location',
            'Client Name': 'Test Client',
            'Tech Name': 'Consistent, Math',
            'Edu ': 'BA',
            'Rate': 50,
            'Session Date': '2025-04-15',
            'Code': 123,
            'Start Time': '09:00',
            'End Time': '10:00',
            'Duration': '1:00',
            'Hours': 90,
            'Units': 90,
            'Price': 4500,
            'Insurance Type': 'Test Insurance',
            'Comment': '',
            'Note': '',
            'Conflict Client': '',
            'Conflict Tech': 0,
          }
        ],
        totalRevenue: 4500,
        totalBillableHours: 90,
        totalRecords: 1,
        dateRange: {
          start: new Date('2025-03-30'),
          end: new Date('2025-06-29')
        },
        uniqueEmployees: ['Smith, John'],
        errors: []
      };

      const testPayrollData: ProcessedPayrollData = {
        records: [
          {
            'Pay Frequency': 'Bi-weekly',
            'Department': 'Therapy',
            'Check Date': '2025-04-25',
            'Name': 'Consistent, Math',
            'Hours': 100,
            'Total Paid': 2500,
            'Tax Withheld': 500,
            'Deductions': 125,
            'Net Pay': 1875,
            'Payment Details/Check No': 'CHK009',
            'Employer Liability': 625,
            'Total Expenses': 3125,
          }
        ],
        totalRecords: 1,
        totalPayrollCost: 3125,
        totalPayrollHours: 100,
        billableStaffCost: 0,
        billableStaffHours: 0,
        hrCost: 0,
        hrHours: 0,
        dateRange: {
          start: new Date('2025-04-18'),
          end: new Date('2025-07-11')
        },
        uniqueEmployees: ['Smith, John'],
        errors: []
      };

      const results = calculationEngine.calculateFinancialMetrics(testBillingData, testPayrollData);

      // Manual calculation verification
      const manualNonBillableHours = 100 - 90; // 10 hours
      const manualHourlyRate = 3125 / 100; // $31.25/hour
      const manualNonBillableCost = manualNonBillableHours * manualHourlyRate; // $312.50
      const manualUtilization = (90 / 100) * 100; // 90%
      const manualProfitMargin = ((4500 - 3125 - manualNonBillableCost) / 4500) * 100; // 26.39%

      expect(results.nonBillableCost).toBeCloseTo(manualNonBillableCost, 0);
      expect(results.utilizationRate).toBeCloseTo(manualUtilization, 1);
      expect(results.comprehensiveProfitMargin).toBeCloseTo(manualProfitMargin, 1);
      
      // Verify that total payroll cost uses the raw FileProcessor total (not the sum of components)
      // This is the correct approach as it includes all payroll records directly from the data
      expect(results.totalPayrollCost).toBe(3125); // Should match the testPayrollData.totalPayrollCost
    });
  });
});