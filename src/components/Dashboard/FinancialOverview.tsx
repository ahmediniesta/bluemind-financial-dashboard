import React from 'react';
import { DollarSign, Calculator, Target } from 'lucide-react';
import { FinancialMetrics, UtilizationMetrics, DataQualityMetrics } from '../../types/dashboard.types';
import MetricCard from './MetricCard';
import StatusIndicator from '../UI/StatusIndicator';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { EXPECTED_RESULTS, PROFIT_MARGIN_BENCHMARK } from '../../constants/businessRules';

interface FinancialOverviewProps {
  financialMetrics: FinancialMetrics;
  utilizationMetrics: UtilizationMetrics | null;
  dataQuality: DataQualityMetrics | null;
}

const FinancialOverview: React.FC<FinancialOverviewProps> = ({
  financialMetrics,
  utilizationMetrics,
  dataQuality,
}) => {
  // Calculate performance vs expected values
  const revenueVariance = ((financialMetrics.totalRevenue - EXPECTED_RESULTS.REVENUE) / EXPECTED_RESULTS.REVENUE) * 100;
  const profitMarginVariance = financialMetrics.profitMarginVsBillableStaff - EXPECTED_RESULTS.PROFIT_MARGIN;

  return (
    <div className="space-y-6">
      {/* Key Financial Metrics */}
      <div className="dashboard-grid">
        <MetricCard
          title="Total Revenue"
          value={financialMetrics.totalRevenue}
          format="currency"
          subtitle="Q2 2025 billing revenue"
          benchmark={EXPECTED_RESULTS.REVENUE}
          trend={revenueVariance > 5 ? 'up' : revenueVariance < -5 ? 'down' : 'neutral'}
        />

        <MetricCard
          title="Billable Staff Cost"
          value={financialMetrics.billableStaffCost}
          format="currency"
          subtitle="Excluding HR expenses"
        />

        <MetricCard
          title="Profit Margin"
          value={financialMetrics.profitMarginVsBillableStaff}
          format="percentage"
          subtitle="vs Billable Staff Only"
          benchmark={EXPECTED_RESULTS.PROFIT_MARGIN}
          trend={profitMarginVariance > 2 ? 'up' : profitMarginVariance < -2 ? 'down' : 'neutral'}
        />

        <MetricCard
          title="Revenue per Hour"
          value={financialMetrics.revenuePerBillableHour}
          format="currency"
          subtitle="Billable hour efficiency"
        />
      </div>

      {/* Financial Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Costs Chart Placeholder */}
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Revenue vs Costs</h3>
            <p className="chart-subtitle">Q2 2025 Financial Breakdown</p>
          </div>
          
          <div className="space-y-4">
            {/* Revenue bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Total Revenue</span>
                <span className="font-semibold text-success-600">
                  {formatCurrency(financialMetrics.totalRevenue)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-success-500 h-4 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Billable Staff Cost bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Billable Staff Cost</span>
                <span className="font-semibold text-primary-600">
                  {formatCurrency(financialMetrics.billableStaffCost)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-primary-500 h-4 rounded-full" 
                  style={{ 
                    width: `${(financialMetrics.billableStaffCost / financialMetrics.totalRevenue) * 100}%` 
                  }} 
                />
              </div>
            </div>

            {/* HR Cost bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">HR Cost</span>
                <span className="font-semibold text-warning-600">
                  {formatCurrency(financialMetrics.hrCost)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-warning-500 h-4 rounded-full" 
                  style={{ 
                    width: `${(financialMetrics.hrCost / financialMetrics.totalRevenue) * 100}%` 
                  }} 
                />
              </div>
            </div>

            {/* Profit bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Net Profit (vs Billable)</span>
                <span className="font-semibold text-success-600">
                  {formatCurrency(financialMetrics.netProfit)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-success h-4 rounded-full" 
                  style={{ 
                    width: `${(financialMetrics.netProfit / financialMetrics.totalRevenue) * 100}%` 
                  }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Performance vs Benchmarks */}
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Performance vs Benchmarks</h3>
            <p className="chart-subtitle">Expected vs Actual Results</p>
          </div>

          <div className="space-y-6">
            {/* Revenue Performance */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Revenue Target</h4>
                <p className="text-sm text-gray-500">Expected: {formatCurrency(EXPECTED_RESULTS.REVENUE)}</p>
              </div>
              <div className="text-right">
                <div className="font-semibold text-lg">
                  {formatCurrency(financialMetrics.totalRevenue)}
                </div>
                <StatusIndicator
                  type="performance"
                  status={Math.abs(revenueVariance) < 2 ? 'excellent' : Math.abs(revenueVariance) < 5 ? 'good' : 'needs-improvement'}
                  label={`${revenueVariance > 0 ? '+' : ''}${revenueVariance.toFixed(1)}%`}
                  size="sm"
                />
              </div>
            </div>

            {/* Profit Margin Performance */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Profit Margin Target</h4>
                <p className="text-sm text-gray-500">Expected: {formatPercentage(EXPECTED_RESULTS.PROFIT_MARGIN)}</p>
              </div>
              <div className="text-right">
                <div className="font-semibold text-lg">
                  {formatPercentage(financialMetrics.profitMarginVsBillableStaff)}
                </div>
                <StatusIndicator
                  type="performance"
                  status={profitMarginVariance > 2 ? 'excellent' : profitMarginVariance > -2 ? 'good' : 'needs-improvement'}
                  label={`${profitMarginVariance > 0 ? '+' : ''}${profitMarginVariance.toFixed(1)}%`}
                  size="sm"
                />
              </div>
            </div>

            {/* Utilization Performance */}
            {utilizationMetrics && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Utilization Target</h4>
                  <p className="text-sm text-gray-500">Expected: {formatPercentage(EXPECTED_RESULTS.UTILIZATION_RATE)}</p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg">
                    {formatPercentage(utilizationMetrics.utilizationRate)}
                  </div>
                  <StatusIndicator
                    type="performance"
                    status={utilizationMetrics.utilizationRate >= 90 ? 'excellent' : utilizationMetrics.utilizationRate >= 80 ? 'good' : 'needs-improvement'}
                    label={`${utilizationMetrics.performanceVsBenchmark > 0 ? '+' : ''}${utilizationMetrics.performanceVsBenchmark.toFixed(1)}%`}
                    size="sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-success text-white rounded-lg p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 opacity-80" />
            <div className="ml-3">
              <div className="text-sm font-medium opacity-90">Gross Profit</div>
              <div className="text-2xl font-bold">
                {formatCurrency(financialMetrics.grossProfit)}
              </div>
              <div className="text-sm opacity-80">
                {formatPercentage(financialMetrics.profitMargin)} margin
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-primary text-white rounded-lg p-6">
          <div className="flex items-center">
            <Calculator className="h-8 w-8 opacity-80" />
            <div className="ml-3">
              <div className="text-sm font-medium opacity-90">Non-billable Cost</div>
              <div className="text-2xl font-bold">
                {formatCurrency(financialMetrics.nonBillableCost)}
              </div>
              <div className="text-sm opacity-80">
                Excluding HR staff
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-warning text-white rounded-lg p-6">
          <div className="flex items-center">
            <Target className="h-8 w-8 opacity-80" />
            <div className="ml-3">
              <div className="text-sm font-medium opacity-90">vs Industry</div>
              <div className="text-2xl font-bold">
                {formatPercentage(financialMetrics.profitMarginVsBillableStaff - PROFIT_MARGIN_BENCHMARK)}
              </div>
              <div className="text-sm opacity-80">
                Above {formatPercentage(PROFIT_MARGIN_BENCHMARK)} benchmark
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Quality Notice */}
      {dataQuality && dataQuality.overallScore < 90 && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex">
            <Target className="h-5 w-5 text-warning-500 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-warning-800">
                Data Quality Notice
              </h3>
              <p className="text-sm text-warning-700 mt-1">
                Overall data quality score is {dataQuality.overallScore}%. 
                Some metrics may be affected by data quality issues.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialOverview; 