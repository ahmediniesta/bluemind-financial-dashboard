import React, { useState } from 'react';
import { DollarSign, Target, Download } from 'lucide-react';
import { FinancialMetrics, UtilizationMetrics, DataQualityMetrics } from '../../types/dashboard.types';
import { OpportunityMetric } from '../../types/employee.types';
import MetricCard from './MetricCard';
import StatusIndicator from '../UI/StatusIndicator';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { EXPECTED_RESULTS, PROFIT_MARGIN_BENCHMARK } from '../../constants/businessRules';
import { exportFinancialOverviewToPDF } from '../../utils/pdfExport';

interface FinancialOverviewProps {
  financialMetrics: FinancialMetrics;
  utilizationMetrics: UtilizationMetrics | null;
  dataQuality: DataQualityMetrics | null;
  topOpportunities: OpportunityMetric[];
}

const FinancialOverview: React.FC<FinancialOverviewProps> = ({
  financialMetrics,
  utilizationMetrics,
  dataQuality,
  topOpportunities,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  // Calculate potential earnings benchmark (current revenue + tech opportunities)
  const totalAdditionalOpportunity = topOpportunities.reduce((sum, opp) => sum + opp.potentialAdditionalRevenue, 0);
  const potentialTotalRevenue = financialMetrics.totalRevenue + totalAdditionalOpportunity;
  
  // Calculate performance vs potential earnings
  const revenueVariance = potentialTotalRevenue > 0 ? ((financialMetrics.totalRevenue - potentialTotalRevenue) / potentialTotalRevenue) * 100 : 0;
  const profitMarginVariance = financialMetrics.profitMargin - EXPECTED_RESULTS.PROFIT_MARGIN;

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      await exportFinancialOverviewToPDF();
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6" data-tab="financial-overview">
      {/* Export Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Financial Overview</h2>
          <p className="text-sm text-gray-600">Q2 2025 financial performance analysis</p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="btn btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
        </button>
      </div>

      {/* Key Financial Metrics */}
      <div className="dashboard-grid">
        <MetricCard
          title="Total Revenue"
          value={financialMetrics.totalRevenue}
          format="currency"
          subtitle="Q2 2025 billing revenue"
          benchmark={potentialTotalRevenue}
          trend={revenueVariance > 5 ? 'up' : revenueVariance < -5 ? 'down' : 'neutral'}
        />

        <MetricCard
          title="Total Staff Cost"
          value={financialMetrics.totalPayrollCost}
          format="currency"
          subtitle="Total payroll cost (Q2 2025)"
        />

        <MetricCard
          title="Gross Profit"
          value={financialMetrics.grossProfit}
          format="currency"
          subtitle="Revenue minus staff costs"
        />

        <MetricCard
          title="Profit Margin"
          value={financialMetrics.profitMargin}
          format="percentage"
          subtitle="Gross profit percentage"
          benchmark={EXPECTED_RESULTS.PROFIT_MARGIN}
          trend={profitMarginVariance > 2 ? 'up' : profitMarginVariance < -2 ? 'down' : 'neutral'}
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

            {/* Total Staff Cost bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Total Staff Cost</span>
                <span className="font-semibold text-primary-600">
                  {formatCurrency(financialMetrics.totalPayrollCost)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-primary-500 h-4 rounded-full" 
                  style={{ 
                    width: `${(financialMetrics.totalPayrollCost / financialMetrics.totalRevenue) * 100}%` 
                  }} 
                />
              </div>
            </div>

            {/* Gross Profit bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Gross Profit</span>
                <span className="font-semibold text-success-600">
                  {formatCurrency(financialMetrics.grossProfit)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-success-500 h-4 rounded-full" 
                  style={{ 
                    width: `${(financialMetrics.grossProfit / financialMetrics.totalRevenue) * 100}%` 
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
                <h4 className="font-medium text-gray-900">Revenue Potential</h4>
                <p className="text-sm text-gray-500">With full Tech utilization: {formatCurrency(potentialTotalRevenue)}</p>
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
                  {formatPercentage(financialMetrics.profitMargin)}
                </div>
                <StatusIndicator
                  type="performance"
                  status={profitMarginVariance > 2 ? 'excellent' : profitMarginVariance > -2 ? 'good' : 'needs-improvement'}
                  label={`${profitMarginVariance > 0 ? '+' : ''}${profitMarginVariance.toFixed(1)}%`}
                  size="sm"
                />
              </div>
            </div>

            {/* Average Employee Profit Margin Performance */}
            {utilizationMetrics && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Avg Employee Profit Margin</h4>
                  <p className="text-sm text-gray-500">Target: {formatPercentage(utilizationMetrics.benchmark)}</p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg">
                    {formatPercentage(utilizationMetrics.averageProfitMargin)}
                  </div>
                  <StatusIndicator
                    type="performance"
                    status={utilizationMetrics.averageProfitMargin >= 60 ? 'excellent' : utilizationMetrics.averageProfitMargin >= 40 ? 'good' : 'needs-improvement'}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="text-xs opacity-70">
                Revenue minus total staff cost
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
                {formatPercentage(financialMetrics.profitMargin - PROFIT_MARGIN_BENCHMARK)}
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