import React from 'react';
import { Clock, Users, DollarSign } from 'lucide-react';
import { UtilizationMetrics } from '../../types/dashboard.types';
import { EmployeeMetric } from '../../types/employee.types';

import { ProcessedPayrollData } from '../../types/payroll.types';
import MetricCard from './MetricCard';
import StatusIndicator from '../UI/StatusIndicator';
import { formatHours, formatCurrency, formatPercentage } from '../../utils/formatters';
import { UTILIZATION_BENCHMARK } from '../../constants/businessRules';

interface UtilizationAnalysisProps {
  utilizationMetrics: UtilizationMetrics;
  employeeMetrics: EmployeeMetric[];
  payrollData: ProcessedPayrollData | null;
}

const UtilizationAnalysis: React.FC<UtilizationAnalysisProps> = ({
  utilizationMetrics,
  employeeMetrics,
  payrollData,
}) => {
  // Filter billable employees only
  const billableEmployees = employeeMetrics.filter(emp => !emp.isHRStaff);
  
  // Calculate utilization distribution
  const utilizationDistribution = {
    excellent: billableEmployees.filter(emp => emp.utilizationRate >= 90).length,
    good: billableEmployees.filter(emp => emp.utilizationRate >= 80 && emp.utilizationRate < 90).length,
    needsImprovement: billableEmployees.filter(emp => emp.utilizationRate >= 50 && emp.utilizationRate < 80).length,
    critical: billableEmployees.filter(emp => emp.utilizationRate < 50).length,
  };

  const totalBillableEmployees = billableEmployees.length;

  return (
    <div className="space-y-6">
      {/* Key Utilization Metrics */}
      <div className="dashboard-grid">
        <MetricCard
          title="Utilization Rate"
          value={utilizationMetrics.utilizationRate}
          format="percentage"
          subtitle="Billable vs Total Hours"
          benchmark={UTILIZATION_BENCHMARK}
          trend={utilizationMetrics.utilizationRate > UTILIZATION_BENCHMARK ? 'up' : 'down'}
        />

        <MetricCard
          title="Billable Hours"
          value={utilizationMetrics.billableHours}
          format="hours"
          subtitle="Q2 2025 total"
        />

        <MetricCard
          title="Non-billable Hours"
          value={utilizationMetrics.nonBillableHours}
          format="hours"
          subtitle="Excluding HR staff"
        />

        <MetricCard
          title="Non-billable Cost"
          value={utilizationMetrics.costOfNonBillableTime}
          format="currency"
          subtitle="Lost revenue opportunity"
        />
      </div>

      {/* Utilization Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hours Distribution */}
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Hours Distribution</h3>
            <p className="chart-subtitle">Billable vs Non-billable Time</p>
          </div>

          <div className="space-y-4">
            {/* Total Hours */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900">
                {formatHours(utilizationMetrics.totalPayrollHours + utilizationMetrics.hrHours)}
              </div>
              <div className="text-sm text-gray-500">Total Hours (Including HR)</div>
            </div>

            {/* Billable Hours */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-success-700">Billable Hours</span>
                <span className="font-semibold">
                  {formatHours(utilizationMetrics.billableHours)} 
                  ({formatPercentage((utilizationMetrics.billableHours / utilizationMetrics.totalPayrollHours) * 100)})
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div 
                  className="bg-success-500 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ 
                    width: `${(utilizationMetrics.billableHours / utilizationMetrics.totalPayrollHours) * 100}%` 
                  }}
                >
                  Billable
                </div>
              </div>
            </div>

            {/* Non-billable Hours */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-warning-700">Non-billable Hours</span>
                <span className="font-semibold">
                  {formatHours(utilizationMetrics.nonBillableHours)} 
                  ({formatPercentage((utilizationMetrics.nonBillableHours / utilizationMetrics.totalPayrollHours) * 100)})
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div 
                  className="bg-warning-500 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ 
                    width: `${(utilizationMetrics.nonBillableHours / utilizationMetrics.totalPayrollHours) * 100}%` 
                  }}
                >
                  Non-billable
                </div>
              </div>
            </div>

            {/* HR Hours (shown separately) */}
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">HR Hours (Excluded)</span>
                <span className="font-semibold">
                  {formatHours(utilizationMetrics.hrHours)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-gray-400 h-4 rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Performance vs Benchmark */}
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Performance vs Benchmark</h3>
            <p className="chart-subtitle">{formatPercentage(UTILIZATION_BENCHMARK)} Industry Standard</p>
          </div>

          <div className="space-y-6">
            {/* Gauge representation */}
            <div className="relative">
              <div className="flex justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                    {/* Background circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="#e5e7eb"
                      strokeWidth="10"
                      fill="none"
                    />
                    {/* Benchmark circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="#f59e0b"
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={`${(UTILIZATION_BENCHMARK / 100) * 314} 314`}
                      opacity="0.3"
                    />
                    {/* Actual utilization circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke={utilizationMetrics.utilizationRate >= UTILIZATION_BENCHMARK ? "#22c55e" : "#ef4444"}
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={`${(utilizationMetrics.utilizationRate / 100) * 314} 314`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatPercentage(utilizationMetrics.utilizationRate)}
                      </div>
                      <div className="text-xs text-gray-500">Current</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance indicators */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">vs Benchmark</span>
                <StatusIndicator
                  type="performance"
                  status={utilizationMetrics.performanceVsBenchmark >= 0 ? 'excellent' : 'needs-improvement'}
                  label={`${utilizationMetrics.performanceVsBenchmark > 0 ? '+' : ''}${utilizationMetrics.performanceVsBenchmark.toFixed(1)}%`}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Cost Impact</span>
                <span className="font-semibold text-danger-600">
                  {formatCurrency(utilizationMetrics.costOfNonBillableTime)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Utilization Distribution */}
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">Employee Utilization Distribution</h3>
          <p className="chart-subtitle">{totalBillableEmployees} Billable Employees</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-success-50 rounded-lg">
            <div className="text-3xl font-bold text-success-600">
              {utilizationDistribution.excellent}
            </div>
            <div className="text-sm font-medium text-success-700">Excellent</div>
            <div className="text-xs text-success-600">≥90% utilization</div>
          </div>

          <div className="text-center p-4 bg-info-50 rounded-lg">
            <div className="text-3xl font-bold text-info-600">
              {utilizationDistribution.good}
            </div>
            <div className="text-sm font-medium text-info-700">Good</div>
            <div className="text-xs text-info-600">80-89% utilization</div>
          </div>

          <div className="text-center p-4 bg-warning-50 rounded-lg">
            <div className="text-3xl font-bold text-warning-600">
              {utilizationDistribution.needsImprovement}
            </div>
            <div className="text-sm font-medium text-warning-700">Needs Improvement</div>
            <div className="text-xs text-warning-600">50-79% utilization</div>
          </div>

          <div className="text-center p-4 bg-danger-50 rounded-lg">
            <div className="text-3xl font-bold text-danger-600">
              {utilizationDistribution.critical}
            </div>
            <div className="text-sm font-medium text-danger-700">Critical</div>
            <div className="text-xs text-danger-600">&lt;50% utilization</div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Clock className="h-6 w-6 text-primary-600" />
            <h3 className="ml-2 text-lg font-semibold text-gray-900">Time Efficiency</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Average utilization</span>
              <span className="font-semibold">{formatPercentage(utilizationMetrics.utilizationRate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hours per employee</span>
              <span className="font-semibold">
                {formatHours(utilizationMetrics.totalPayrollHours / totalBillableEmployees)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Potential improvement</span>
              <span className="font-semibold text-success-600">
                {formatHours((UTILIZATION_BENCHMARK / 100) * utilizationMetrics.totalPayrollHours - utilizationMetrics.billableHours)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <DollarSign className="h-6 w-6 text-success-600" />
            <h3 className="ml-2 text-lg font-semibold text-gray-900">Cost Analysis</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Non-billable cost</span>
              <span className="font-semibold text-danger-600">
                {formatCurrency(utilizationMetrics.costOfNonBillableTime)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">HR cost (excluded)</span>
              <span className="font-semibold text-gray-600">
                {formatCurrency((payrollData?.hrCost || 0))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Revenue opportunity</span>
              <span className="font-semibold text-success-600">
                {formatCurrency(utilizationMetrics.costOfNonBillableTime * 1.5)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* HR Staff Exclusion Notice */}
      <div className="bg-info-50 border border-info-200 rounded-lg p-4">
        <div className="flex">
          <Users className="h-5 w-5 text-info-500 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-info-800">
              HR Staff Exclusion Notice
            </h3>
            <p className="text-sm text-info-700 mt-1">
              HR staff ({formatHours(utilizationMetrics.hrHours)}) are excluded from utilization calculations 
              as they are not expected to be billable. This ensures accurate performance metrics for billable employees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UtilizationAnalysis; 