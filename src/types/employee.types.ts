/**
 * BlueMind Employee Analysis Types
 * For employee matching and performance analysis
 */

export interface EmployeeMetric {
  name: string;
  payrollName: string;
  billingName: string;
  utilizationRate: number;
  billableHours: number;
  payrollHours: number;
  nonBillableHours: number;
  revenue: number;
  payrollCost: number;
  revenuePerHour: number;
  profitMargin: number; // (revenue - cost) / revenue * 100 - for BCBAs
  isMatched: boolean;
  performanceTier: 'excellent' | 'good' | 'needs-improvement' | 'critical';
  potentialRevenue: number;
  isHRStaff: boolean;
  role: 'TECH' | 'BCBA'; // NEW: Role classification based on service codes
  department?: string;
}

export interface UnmatchedEmployee {
  name: string;
  source: 'billing' | 'payroll';
  suggestedMatches: string[];
  confidence: number;
  reason: string;
}

export interface OpportunityMetric {
  employeeName: string;
  currentUtilization: number;
  targetUtilization: number;
  potentialAdditionalHours: number;
  potentialAdditionalRevenue: number;
  priority: 'high' | 'medium' | 'low';
  actionItems: string[];
}

export interface EmployeeMatchingResult {
  matched: EmployeeMetric[];
  unmatched: UnmatchedEmployee[];
  suggestions: EmployeeMatchingSuggestion[];
  confidence: number;
}

export interface EmployeeMatchingSuggestion {
  billingName: string;
  payrollName: string;
  confidence: number;
  reason: string;
  shouldAutoMatch: boolean;
}

export interface PerformanceTierSummary {
  tier: 'excellent' | 'good' | 'needs-improvement' | 'critical';
  count: number;
  employees: string[];
  averageUtilization: number;
  totalRevenue: number;
  description: string;
}

export interface EmployeeAnalysisResult {
  totalEmployees: number;
  matchedEmployees: number;
  unmatchedEmployees: number;
  averageUtilization: number;
  performanceTiers: PerformanceTierSummary[];
  topPerformers: EmployeeMetric[];
  improvementOpportunities: OpportunityMetric[];
  criticalCases: EmployeeMetric[];
} 