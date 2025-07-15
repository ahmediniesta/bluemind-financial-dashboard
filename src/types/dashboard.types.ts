/**
 * BlueMind Dashboard Types
 * Core dashboard metrics and UI component interfaces
 */

import React from 'react';
import { EmployeeMetric, OpportunityMetric, UnmatchedEmployee } from './employee.types';

export interface FinancialMetrics {
  // Core metrics (verify these calculations)
  utilizationRate: number; // (billableHours / totalPayrollHours) * 100 (EXCLUDING HR)
  profitMargin: number; // ((revenue - totalPayrollCost) / revenue) * 100
  profitMarginVsBillableStaff: number; // ((revenue - billableStaffCost) / revenue) * 100
  revenuePerBillableHour: number; // totalRevenue / totalBillableHours
  nonBillableCost: number; // nonBillableHours * (billableStaffCost / billableStaffHours)
  
  // Financial figures
  totalRevenue: number;
  totalPayrollCost: number;
  billableStaffCost: number;
  hrCost: number;
  grossProfit: number;
  netProfit: number;
  
  // Expected Q2 2025 results (validate against these)
  expectedRevenue: number; // 723471.65
  expectedUtilizationRate: number; // 92.5
  expectedNonBillableCost: number; // 19097 - EXCLUDES HR
  expectedProfitMargin: number; // 47.6 - vs billable staff only
}

export interface UtilizationMetrics {
  utilizationRate: number;
  billableHours: number;
  totalPayrollHours: number; // Excluding HR
  nonBillableHours: number;
  hrHours: number;
  benchmark: number; // 90%
  performanceVsBenchmark: number;
  costOfNonBillableTime: number;
}

export interface DashboardData {
  financialMetrics: FinancialMetrics;
  utilizationMetrics: UtilizationMetrics;
  employeeMetrics: EmployeeMetric[];
  unmatchedEmployees: UnmatchedEmployee[];
  topOpportunities: OpportunityMetric[];
  lastUpdated: Date;
  dataQuality: DataQualityMetrics;
}

export interface DataQualityMetrics {
  billingDataQuality: number; // 0-100
  payrollDataQuality: number; // 0-100
  employeeMatchingRate: number; // 0-100
  overallScore: number; // 0-100
  issues: DataQualityIssue[];
}

export interface DataQualityIssue {
  type: 'error' | 'warning' | 'info';
  category: 'billing' | 'payroll' | 'matching' | 'calculation';
  message: string;
  count: number;
  impact: 'high' | 'medium' | 'low';
}

export interface MetricCardProps {
  title: string;
  value: number;
  subtitle?: string;
  format: 'currency' | 'percentage' | 'number' | 'hours';
  trend?: 'up' | 'down' | 'neutral';
  benchmark?: number;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

export interface ChartDataPoint {
  category: string;
  value: number;
  benchmark?: number;
  color?: string;
}

export interface FinancialChartData {
  revenue: number;
  billableStaffCost: number;
  hrCost: number;
  profit: number;
  benchmark?: number;
}

export interface UtilizationChartData {
  billableHours: number;
  nonBillableHours: number;
  hrHours: number;
  benchmark: number;
}

export interface EmployeePerformanceData {
  name: string;
  utilizationRate: number;
  revenue: number;
  potentialRevenue: number;
  tier: string;
}

export interface DashboardTab {
  id: 'overview' | 'utilization' | 'employees';
  label: string;
  icon: string;
  component: React.ComponentType;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface ErrorState {
  hasError: boolean;
  error?: Error;
  message?: string;
  recovery?: () => void;
}

export interface DashboardState {
  activeTab: 'overview' | 'utilization' | 'employees';
  loading: LoadingState;
  error: ErrorState;
  data: DashboardData | null;
  filters: DashboardFilters;
}

export interface DashboardFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  departments?: string[];
  employeeTypes?: ('billable' | 'hr' | 'all')[];
  performanceTiers?: string[];
} 