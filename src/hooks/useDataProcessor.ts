import { useMemo } from 'react';
import { ProcessedBillingData } from '../types/billing.types';
import { ProcessedPayrollData } from '../types/payroll.types';
import { FinancialMetrics, UtilizationMetrics, DashboardData, DataQualityMetrics } from '../types/dashboard.types';
import { EmployeeMetric, OpportunityMetric, UnmatchedEmployee } from '../types/employee.types';
import { calculationEngine } from '../utils/calculationEngine';
import { dataValidator } from '../utils/dataValidators';
import { validateEmployeeMatching } from '../constants/employeeMapping';

interface UseDataProcessorReturn {
  dashboardData: DashboardData | null;
  financialMetrics: FinancialMetrics | null;
  utilizationMetrics: UtilizationMetrics | null;
  employeeMetrics: EmployeeMetric[];
  topOpportunities: OpportunityMetric[];
  unmatchedEmployees: UnmatchedEmployee[];
  dataQuality: DataQualityMetrics | null;
  isProcessing: boolean;
  validationResults: {
    isValid: boolean;
    discrepancies: Array<{ metric: string; expected: number; actual: number; difference: number }>;
  } | null;
}

export const useDataProcessor = (
  billingData: ProcessedBillingData | null,
  payrollData: ProcessedPayrollData | null
): UseDataProcessorReturn => {
  const processedData = useMemo(() => {
    if (!billingData || !payrollData) {
      return {
        dashboardData: null,
        financialMetrics: null,
        utilizationMetrics: null,
        employeeMetrics: [],
        topOpportunities: [],
        unmatchedEmployees: [],
        dataQuality: null,
        isProcessing: false,
        validationResults: null,
      };
    }

    try {
      // Calculate financial metrics
      const financialMetrics = calculationEngine.calculateFinancialMetrics(billingData, payrollData);
      
      // Calculate utilization metrics
      const utilizationMetrics = calculationEngine.calculateUtilizationMetrics(billingData, payrollData);
      
      // Analyze employee performance
      const employeeMetrics = calculationEngine.analyzeEmployeePerformance(billingData, payrollData);
      
      // Identify improvement opportunities
      const topOpportunities = calculationEngine.identifyImprovementOpportunities(employeeMetrics);
      
      // Validate employee matching
      const matchingValidation = validateEmployeeMatching(
        billingData.uniqueEmployees,
        payrollData.uniqueEmployees
      );

      // Create unmatched employees list
      const unmatchedEmployees: UnmatchedEmployee[] = [
        ...matchingValidation.unmatchedBilling.map(name => ({
          name,
          source: 'billing' as const,
          suggestedMatches: [],
          confidence: 0,
          reason: 'No matching payroll record found',
        })),
        ...matchingValidation.unmatchedPayroll.map(name => ({
          name,
          source: 'payroll' as const,
          suggestedMatches: [],
          confidence: 0,
          reason: 'No matching billing record found',
        })),
      ];

      // Validate billing and payroll data
      const billingValidation = dataValidator.validateBillingData(billingData.records);
      const payrollValidation = dataValidator.validatePayrollData(payrollData.records);
      
      // Calculate data quality metrics
      const dataQuality = dataValidator.calculateDataQuality(
        billingValidation,
        payrollValidation,
        matchingValidation.matchingRate
      );

      // Validate calculations against expected results
      const validationResults = calculationEngine.validateCalculations(financialMetrics);

      // Create comprehensive dashboard data
      const dashboardData: DashboardData = {
        financialMetrics,
        utilizationMetrics,
        employeeMetrics,
        unmatchedEmployees,
        topOpportunities,
        lastUpdated: new Date(),
        dataQuality,
      };

      return {
        dashboardData,
        financialMetrics,
        utilizationMetrics,
        employeeMetrics,
        topOpportunities,
        unmatchedEmployees,
        dataQuality,
        isProcessing: false,
        validationResults,
      };

    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error processing data:', error);
      
      return {
        dashboardData: null,
        financialMetrics: null,
        utilizationMetrics: null,
        employeeMetrics: [],
        topOpportunities: [],
        unmatchedEmployees: [],
        dataQuality: null,
        isProcessing: false,
        validationResults: null,
      };
    }
  }, [billingData, payrollData]);

  return processedData;
}; 