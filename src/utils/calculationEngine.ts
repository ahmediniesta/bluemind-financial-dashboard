/**
 * BlueMind Calculation Engine
 * CRITICAL: All calculations must match exact business requirements
 */

import { BillingRecord, ProcessedBillingData } from '../types/billing.types';
import { PayrollRecord, ProcessedPayrollData } from '../types/payroll.types';
import { EmployeeMetric, OpportunityMetric } from '../types/employee.types';
import { FinancialMetrics, UtilizationMetrics } from '../types/dashboard.types';
import { isHRStaff, applyExactMapping } from '../constants/employeeMapping';
import { EXPECTED_RESULTS, UTILIZATION_BENCHMARK, PERFORMANCE_THRESHOLDS, EMPLOYEE_NAME_MAPPING } from '../constants/businessRules';
import { parseFlexibleDate } from '../constants/dateRanges';
import { sumBy } from 'lodash';

export class CalculationEngine {
  /**
   * Calculate comprehensive financial metrics
   * CRITICAL: These calculations must match expected values exactly
   */
  calculateFinancialMetrics(
    billingData: ProcessedBillingData,
    payrollData: ProcessedPayrollData
  ): FinancialMetrics {
    console.log('🔢 CalculationEngine: Starting financial calculations...');
    console.log('📊 Payroll records count:', payrollData.records.length);
    console.log('📊 Sample payroll record:', payrollData.records[0]);
    console.log('📊 Total payroll cost from data:', payrollData.totalPayrollCost);
    
    // Debug billing data too
    console.log('📊 Billing records count:', billingData.records.length);
    console.log('📊 Total billing hours:', billingData.totalBillableHours);
    console.log('📊 Total revenue:', billingData.totalRevenue);
    
    // Separate HR and billable staff
    const { billableRecords, hrRecords } = this.separatePayrollByType(payrollData.records);
    
    console.log('💼 Billable staff records:', billableRecords.length);
    console.log('🏢 HR records:', hrRecords.length);
    console.log('💰 Sample billable record Total Expenses:', billableRecords[0] ? billableRecords[0]['Total Expenses'] : 'N/A');
    
    // Core financial calculations
    const totalRevenue = billingData.totalRevenue;
    const aggregatePayrollCost = payrollData.totalPayrollCost;
    const billableStaffCost = sumBy(billableRecords, 'Total Expenses');
    const hrCost = sumBy(hrRecords, 'Total Expenses');
    
    console.log('💰 Calculated billable staff cost:', billableStaffCost);
    console.log('💰 Calculated HR cost:', hrCost);
    
    // Profit calculations
    const grossProfit = totalRevenue - aggregatePayrollCost;
    const netProfit = totalRevenue - billableStaffCost; // Excluding HR from profit calculation
    
    // Margin calculations
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const profitMarginVsBillableStaff = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    
    // Utilization calculations
    const billableHours = billingData.totalBillableHours;
    const billableStaffHours = sumBy(billableRecords, 'Hours');
    const utilizationRate = billableStaffHours > 0 ? (billableHours / billableStaffHours) * 100 : 0;
    
    // Revenue per hour
    const revenuePerBillableHour = billableHours > 0 ? totalRevenue / billableHours : 0;
    
    // NEW PER-EMPLOYEE CALCULATION (CORRECT METHOD)
    const { totalNonBillableHours } = this.calculateNonBillableHoursByEmployee(billingData, payrollData);
    
    // Calculate aggregate totals for utilization rate
    const totalBillableHours = this.calculateTotalBillableHours(billingData);
    const totalPayrollHours = this.calculateTotalPayrollHours(payrollData);
    
    // Calculate Non-Billable Cost using per-employee non-billable hours
    const billableStaffPayrollCost = this.calculateTotalPayrollCost(payrollData);
    const averageHourlyRate = totalPayrollHours > 0 ? billableStaffPayrollCost / totalPayrollHours : 0;
    const nonBillableCost = totalNonBillableHours * averageHourlyRate;
    
    // Calculate Utilization Rate
    const calculatedUtilizationRate = totalPayrollHours > 0 ? (totalBillableHours / totalPayrollHours) * 100 : 0;
    
    console.log('🧮 FINAL CALCULATION RESULTS (Per-Employee Method):');
    console.log('• Total Billable Hours:', totalBillableHours);
    console.log('• Total Payroll Hours (Billable Staff):', totalPayrollHours);
    console.log('• Non-Billable Hours (Per Employee Sum):', totalNonBillableHours.toFixed(2));
    console.log('• Average Hourly Rate: $', averageHourlyRate.toFixed(2));
    console.log('• Non-Billable Cost: $', nonBillableCost.toFixed(2));
    console.log('• Calculated Utilization Rate:', calculatedUtilizationRate.toFixed(1) + '%');

    return {
      utilizationRate,
      profitMargin,
      profitMarginVsBillableStaff,
      revenuePerBillableHour,
      nonBillableCost,
      totalRevenue,
      totalPayrollCost: aggregatePayrollCost,
      billableStaffCost,
      hrCost,
      grossProfit,
      netProfit,
      expectedRevenue: EXPECTED_RESULTS.REVENUE,
      expectedUtilizationRate: EXPECTED_RESULTS.UTILIZATION_RATE,
      expectedNonBillableCost: EXPECTED_RESULTS.NON_BILLABLE_COST,
      expectedProfitMargin: EXPECTED_RESULTS.PROFIT_MARGIN,
    };
  }

  /**
   * Calculate utilization metrics with benchmarking
   */
  calculateUtilizationMetrics(
    billingData: ProcessedBillingData,
    payrollData: ProcessedPayrollData
  ): UtilizationMetrics {
    const { billableRecords, hrRecords } = this.separatePayrollByType(payrollData.records);
    
    const billableHours = billingData.totalBillableHours;
    const totalPayrollHours = sumBy(billableRecords, 'Hours'); // EXCLUDING HR
    const hrHours = sumBy(hrRecords, 'Hours');
    const nonBillableHours = totalPayrollHours - billableHours;
    
    const utilizationRate = totalPayrollHours > 0 ? (billableHours / totalPayrollHours) * 100 : 0;
    const performanceVsBenchmark = utilizationRate - UTILIZATION_BENCHMARK;
    
    // Cost of non-billable time
    const billableStaffCost = sumBy(billableRecords, 'Total Expenses');
    const averageHourlyRate = totalPayrollHours > 0 ? billableStaffCost / totalPayrollHours : 0;
    const costOfNonBillableTime = nonBillableHours * averageHourlyRate;

    return {
      utilizationRate,
      billableHours,
      totalPayrollHours,
      nonBillableHours,
      hrHours,
      benchmark: UTILIZATION_BENCHMARK,
      performanceVsBenchmark,
      costOfNonBillableTime,
    };
  }

  /**
   * Analyze individual employee performance
   */
  analyzeEmployeePerformance(
    billingData: ProcessedBillingData,
    payrollData: ProcessedPayrollData
  ): EmployeeMetric[] {
    const employeeMetrics: EmployeeMetric[] = [];
    
    // Group billing records by employee (billing names are canonical)
    const billingByEmployee = this.groupBillingByEmployee(billingData.records);
    
    // Group payroll records by employee (map payroll names to billing names)
    const payrollByEmployee = this.groupPayrollByEmployee(payrollData.records);
    
    // Get all unique employees from both systems
    const allEmployees = new Set([
      ...Object.keys(billingByEmployee),
      ...Object.keys(payrollByEmployee),
    ]);

    allEmployees.forEach(employeeName => {
      const billingRecords = billingByEmployee[employeeName] || [];
      const payrollRecords = payrollByEmployee[employeeName] || [];
      
      // Calculate employee metrics
      const billableHours = sumBy(billingRecords, 'Hours');
      const revenue = sumBy(billingRecords, 'Price');
      const payrollHours = sumBy(payrollRecords, 'Hours');
      const payrollCost = sumBy(payrollRecords, 'Total Expenses');
      
      const nonBillableHours = Math.max(0, payrollHours - billableHours);
      const utilizationRate = payrollHours > 0 ? (billableHours / payrollHours) * 100 : 0;
      const revenuePerHour = billableHours > 0 ? revenue / billableHours : 0;
      
      // Determine performance tier
      const performanceTier = this.getPerformanceTier(utilizationRate);
      
      // Calculate potential revenue if utilization was at benchmark
      const potentialAdditionalHours = Math.max(0, (payrollHours * UTILIZATION_BENCHMARK / 100) - billableHours);
      const potentialRevenue = revenue + (potentialAdditionalHours * revenuePerHour);
      
      // Check if employee is matched between systems
      const isMatched = billingRecords.length > 0 && payrollRecords.length > 0;
      
      // Determine original names for tracking
      const billingName = employeeName; // employeeName is already the billing name
      const payrollName = this.findOriginalPayrollName(employeeName, payrollData.records) || employeeName;

      employeeMetrics.push({
        name: employeeName,
        payrollName,
        billingName: billingName || employeeName,
        utilizationRate,
        billableHours,
        payrollHours,
        nonBillableHours,
        revenue,
        payrollCost,
        revenuePerHour,
        isMatched,
        performanceTier,
        potentialRevenue,
        isHRStaff: isHRStaff(employeeName),
        department: payrollRecords[0]?.Department,
      });
    });

    return employeeMetrics.sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Identify top improvement opportunities
   */
  identifyImprovementOpportunities(employeeMetrics: EmployeeMetric[]): OpportunityMetric[] {
    const opportunities: OpportunityMetric[] = [];
    
    // Filter to billable staff with room for improvement
    const billableEmployees = employeeMetrics.filter(
      emp => !emp.isHRStaff && emp.payrollHours > 0 && emp.utilizationRate < UTILIZATION_BENCHMARK
    );

    billableEmployees.forEach(employee => {
      const targetUtilization = UTILIZATION_BENCHMARK;
      const currentUtilization = employee.utilizationRate;
      
      if (currentUtilization < targetUtilization) {
        const potentialAdditionalHours = 
          (employee.payrollHours * targetUtilization / 100) - employee.billableHours;
        
        const potentialAdditionalRevenue = potentialAdditionalHours * employee.revenuePerHour;
        
        const priority = this.determinePriority(
          currentUtilization,
          potentialAdditionalRevenue,
          employee.payrollHours
        );
        
        const actionItems = this.generateActionItems(employee);

        opportunities.push({
          employeeName: employee.name,
          currentUtilization,
          targetUtilization,
          potentialAdditionalHours,
          potentialAdditionalRevenue,
          priority,
          actionItems,
        });
      }
    });

    // Sort by potential revenue impact
    return opportunities.sort((a, b) => b.potentialAdditionalRevenue - a.potentialAdditionalRevenue);
  }

  /**
   * Separate payroll records into billable staff and HR
   */
  private separatePayrollByType(payrollRecords: PayrollRecord[]): {
    billableRecords: PayrollRecord[];
    hrRecords: PayrollRecord[];
  } {
    const billableRecords: PayrollRecord[] = [];
    const hrRecords: PayrollRecord[] = [];

    payrollRecords.forEach(record => {
      if (isHRStaff(record.Name)) {
        hrRecords.push(record);
      } else {
        billableRecords.push(record);
      }
    });

    return { billableRecords, hrRecords };
  }

  /**
   * Group billing records by employee (no mapping needed - billing names are canonical)
   */
  private groupBillingByEmployee(billingRecords: BillingRecord[]): Record<string, BillingRecord[]> {
    const grouped: Record<string, BillingRecord[]> = {};

    billingRecords.forEach(record => {
      const billingName = record['Tech Name'];
      if (!grouped[billingName]) {
        grouped[billingName] = [];
      }
      grouped[billingName].push(record);
    });

    return grouped;
  }

  /**
   * Group payroll records by employee with name mapping applied (payroll → billing names)
   */
  private groupPayrollByEmployee(payrollRecords: PayrollRecord[]): Record<string, PayrollRecord[]> {
    const grouped: Record<string, PayrollRecord[]> = {};

    payrollRecords.forEach(record => {
      const originalName = record.Name;
      const billingName = applyExactMapping(originalName); // Map payroll name to billing name
      
      // Log name mappings for debugging
      if (originalName !== billingName) {
        console.log(`🔄 Name mapping: "${originalName}" → "${billingName}"`);
      }
      
      if (!grouped[billingName]) {
        grouped[billingName] = [];
      }
      grouped[billingName].push(record);
    });

    console.log('👥 Payroll employees grouped by billing names:', Object.keys(grouped).length);
    return grouped;
  }

  /**
   * Find original payroll name for an employee
   */
  private findOriginalPayrollName(billingName: string, payrollRecords: PayrollRecord[]): string | null {
    for (const record of payrollRecords) {
      if (applyExactMapping(record.Name) === billingName) {
        return record.Name;
      }
    }
    return null;
  }

  /**
   * Determine performance tier based on utilization rate
   */
  private getPerformanceTier(utilizationRate: number): 'excellent' | 'good' | 'needs-improvement' | 'critical' {
    if (utilizationRate >= PERFORMANCE_THRESHOLDS.EXCELLENT) return 'excellent';
    if (utilizationRate >= PERFORMANCE_THRESHOLDS.GOOD) return 'good';
    if (utilizationRate >= PERFORMANCE_THRESHOLDS.NEEDS_IMPROVEMENT) return 'needs-improvement';
    return 'critical';
  }

  /**
   * Determine priority level for improvement opportunities
   */
  private determinePriority(
    currentUtilization: number,
    potentialRevenue: number,
    payrollHours: number
  ): 'high' | 'medium' | 'low' {
    // High priority: Low utilization + high revenue potential + significant hours
    if (currentUtilization < 50 && potentialRevenue > 10000 && payrollHours > 100) {
      return 'high';
    }
    
    // Medium priority: Moderate utilization issues or good revenue potential
    if (currentUtilization < 70 || potentialRevenue > 5000) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Generate specific action items for employee improvement
   */
  private generateActionItems(employee: EmployeeMetric): string[] {
    const actions: string[] = [];
    
    if (employee.utilizationRate < 50) {
      actions.push('URGENT: Review employee workload and availability');
      actions.push('Consider additional training or skill development');
    }
    
    if (employee.utilizationRate < 80) {
      actions.push('Increase client case assignments');
      actions.push('Review scheduling efficiency');
    }
    
    if (employee.nonBillableHours > 20) {
      actions.push('Optimize administrative time allocation');
      actions.push('Review non-billable activity breakdown');
    }
    
    if (employee.revenuePerHour < 50) {
      actions.push('Focus on higher-value service offerings');
      actions.push('Review billing rate optimization');
    }
    
    if (actions.length === 0) {
      actions.push('Monitor performance and maintain current trajectory');
    }
    
    return actions;
  }

  /**
   * Validate calculations against expected results
   */
  validateCalculations(financialMetrics: FinancialMetrics): {
    isValid: boolean;
    discrepancies: Array<{ metric: string; expected: number; actual: number; difference: number }>;
  } {
    const discrepancies = [];
    
    // Revenue validation
    const revenueDiff = Math.abs(financialMetrics.totalRevenue - EXPECTED_RESULTS.REVENUE);
    if (revenueDiff > 100) {
      discrepancies.push({
        metric: 'Total Revenue',
        expected: EXPECTED_RESULTS.REVENUE,
        actual: financialMetrics.totalRevenue,
        difference: revenueDiff,
      });
    }
    
    // Utilization rate validation
    const utilizationDiff = Math.abs(financialMetrics.utilizationRate - EXPECTED_RESULTS.UTILIZATION_RATE);
    if (utilizationDiff > 0.5) {
      discrepancies.push({
        metric: 'Utilization Rate',
        expected: EXPECTED_RESULTS.UTILIZATION_RATE,
        actual: financialMetrics.utilizationRate,
        difference: utilizationDiff,
      });
    }
    
    // Non-billable cost validation
    const nonBillableDiff = Math.abs(financialMetrics.nonBillableCost - EXPECTED_RESULTS.NON_BILLABLE_COST);
    if (nonBillableDiff > 100) {
      discrepancies.push({
        metric: 'Non-billable Cost',
        expected: EXPECTED_RESULTS.NON_BILLABLE_COST,
        actual: financialMetrics.nonBillableCost,
        difference: nonBillableDiff,
      });
    }
    
    // Profit margin validation
    const profitMarginDiff = Math.abs(financialMetrics.profitMarginVsBillableStaff - EXPECTED_RESULTS.PROFIT_MARGIN);
    if (profitMarginDiff > 1) {
      discrepancies.push({
        metric: 'Profit Margin (vs Billable Staff)',
        expected: EXPECTED_RESULTS.PROFIT_MARGIN,
        actual: financialMetrics.profitMarginVsBillableStaff,
        difference: profitMarginDiff,
      });
    }
    
    return {
      isValid: discrepancies.length === 0,
      discrepancies,
    };
  }

  /**
   * STEP 1: Calculate Total Billable Hours (from billing data)
   */
  private calculateTotalBillableHours(billingData: ProcessedBillingData): number {
    // Filter billing data for Q2 2025 date range (March 31 - June 27, 2025)
    const q2BillingRecords = billingData.records.filter(record => {
      const sessionDate = parseFlexibleDate(record['Session Date']);
      if (!sessionDate) return false;
      return sessionDate >= new Date('2025-03-31') && 
             sessionDate <= new Date('2025-06-27');
    });
    
    // Sum all Hours from billing records
    const totalBillableHours = q2BillingRecords.reduce((sum, record) => {
      const hours = record.Hours || 0;
      return sum + hours;
    }, 0);
    
    console.log('📊 STEP 1: Billable Hours Calculation:');
    console.log('• Q2 Billing Records:', q2BillingRecords.length);
    console.log('• Total Billable Hours:', totalBillableHours);
    
    return totalBillableHours;
  }

  /**
   * STEP 2: Calculate Total Payroll Hours (EXCLUDING HR)
   */
  private calculateTotalPayrollHours(payrollData: ProcessedPayrollData): number {
    // Filter payroll data for Q2 check date range (April 18 - July 11, 2025)
    const q2PayrollRecords = payrollData.records.filter(record => {
      const checkDate = parseFlexibleDate(record['Check Date']);
      if (!checkDate) return false;
      return checkDate >= new Date('2025-04-18') && 
             checkDate <= new Date('2025-07-11');
    });
    
    // CRITICAL: Exclude HR staff from payroll hours
    const billableStaffPayroll = q2PayrollRecords.filter(record => {
      return !isHRStaff(record.Name); // Use the isHRStaff function
    });
    
    // Sum all Hours from payroll records (billable staff only)
    const totalPayrollHours = billableStaffPayroll.reduce((sum, record) => {
      const hours = record.Hours || 0;
      return sum + hours;
    }, 0);
    
    console.log('📊 STEP 2: Payroll Hours Calculation:');
    console.log('• Q2 Payroll Records (All):', q2PayrollRecords.length);
    console.log('• Q2 Payroll Records (Billable Staff):', billableStaffPayroll.length);
    console.log('• Total Payroll Hours (Billable Staff):', totalPayrollHours);
    
    // Log HR exclusion for verification
    const hrRecords = q2PayrollRecords.filter(r => isHRStaff(r.Name));
    const hrHours = hrRecords.reduce((sum, r) => sum + (r.Hours || 0), 0);
    console.log('• HR Hours (Excluded):', hrHours);
    
    return totalPayrollHours;
  }

  /**
   * STEP 3: Calculate Total Payroll Cost (EXCLUDING HR)
   */
  private calculateTotalPayrollCost(payrollData: ProcessedPayrollData): number {
    // Same filtering as payroll hours
    const q2PayrollRecords = payrollData.records.filter(record => {
      const checkDate = parseFlexibleDate(record['Check Date']);
      if (!checkDate) return false;
      return checkDate >= new Date('2025-04-18') && 
             checkDate <= new Date('2025-07-11');
    });
    
    // CRITICAL: Exclude HR staff from payroll cost calculation
    const billableStaffPayroll = q2PayrollRecords.filter(record => {
      return !isHRStaff(record.Name);
    });
    
    const totalPayrollCostBillable = billableStaffPayroll.reduce((sum, record) => {
      const cost = record['Total Expenses'] || 0;
      return sum + cost;
    }, 0);
    
    console.log('📊 STEP 3: Payroll Cost Calculation:');
    console.log('• Total Payroll Cost (Billable Staff): $', totalPayrollCostBillable.toFixed(2));
    
    return totalPayrollCostBillable;
  }

  /**
   * CRITICAL: Calculate Non-Billable Hours Per Employee (CORRECT METHOD)
   * For each employee: payroll hours - billable hours = non-billable hours
   * Then sum all individual non-billable hours
   */
  private calculateNonBillableHoursByEmployee(
    billingData: ProcessedBillingData, 
    payrollData: ProcessedPayrollData
  ): { totalNonBillableHours: number; employeeBreakdown: Array<{
    payrollName: string;
    billingName: string;
    payrollHours: number;
    billableHours: number;
    nonBillableHours: number;
  }> } {
    console.log('\n🧮 CALCULATING NON-BILLABLE HOURS PER EMPLOYEE:');
    
    // STEP 1: Get Q2 payroll records (excluding HR)
    const q2PayrollRecords = payrollData.records.filter(record => {
      const checkDate = parseFlexibleDate(record['Check Date']);
      if (!checkDate) return false;
      
      const isInQ2 = checkDate >= new Date('2025-04-18') && 
                     checkDate <= new Date('2025-07-11');
      const isNotHR = !isHRStaff(record.Name);
      
      return isInQ2 && isNotHR;
    });

    // STEP 2: Get Q2 billing records  
    const q2BillingRecords = billingData.records.filter(record => {
      const sessionDate = parseFlexibleDate(record['Session Date']);
      if (!sessionDate) return false;
      
      return sessionDate >= new Date('2025-03-31') && 
             sessionDate <= new Date('2025-06-27');
    });

    console.log('• Q2 Payroll Records (Billable Staff):', q2PayrollRecords.length);
    console.log('• Q2 Billing Records:', q2BillingRecords.length);

    // STEP 3: Group payroll by employee name
    const payrollByEmployee = new Map<string, number>();
    q2PayrollRecords.forEach(record => {
      const name = record.Name;
      const hours = record.Hours || 0;
      payrollByEmployee.set(name, (payrollByEmployee.get(name) || 0) + hours);
    });

    // STEP 4: Group billing by employee name (using name mapping)
    const billingByEmployee = new Map<string, number>();
    q2BillingRecords.forEach(record => {
      const techName = record['Tech Name'];
      if (!techName) return;
      
      const hours = record.Hours || 0;
      billingByEmployee.set(techName, (billingByEmployee.get(techName) || 0) + hours);
    });

    console.log('• Unique Payroll Employees:', payrollByEmployee.size);
    console.log('• Unique Billing Employees:', billingByEmployee.size);

    // STEP 5: Calculate non-billable hours per employee
    const employeeBreakdown: Array<{
      payrollName: string;
      billingName: string;
      payrollHours: number;
      billableHours: number;
      nonBillableHours: number;
    }> = [];
    let totalNonBillableHours = 0;

    payrollByEmployee.forEach((payrollHours, payrollName) => {
      // Map payroll name to billing name
      const billingName = EMPLOYEE_NAME_MAPPING[payrollName] || payrollName;
      
      // Get billable hours for this employee
      const billableHours = billingByEmployee.get(billingName) || 0;
      
      // Calculate non-billable hours for this employee
      const nonBillableHours = Math.max(0, payrollHours - billableHours);
      
      totalNonBillableHours += nonBillableHours;
      
      employeeBreakdown.push({
        payrollName,
        billingName,
        payrollHours,
        billableHours,
        nonBillableHours
      });

      // Log employees with significant non-billable hours
      if (nonBillableHours > 10) {
        console.log(`• ${payrollName}: ${payrollHours}h payroll - ${billableHours}h billable = ${nonBillableHours}h non-billable`);
      }
    });

    // Sort by non-billable hours (highest first)
    employeeBreakdown.sort((a, b) => b.nonBillableHours - a.nonBillableHours);

    console.log(`\n📊 TOTAL NON-BILLABLE HOURS (Per Employee Method): ${totalNonBillableHours.toFixed(2)}`);
    console.log(`📊 Top 5 employees with most non-billable hours:`);
    employeeBreakdown.slice(0, 5).forEach((emp, i) => {
      console.log(`   ${i+1}. ${emp.payrollName}: ${emp.nonBillableHours.toFixed(1)}h non-billable`);
    });

    return { totalNonBillableHours, employeeBreakdown };
  }
}

// Export singleton instance
export const calculationEngine = new CalculationEngine(); 