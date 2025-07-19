import React, { useState, useMemo } from 'react';
import { Users, TrendingUp, AlertTriangle, Search, SortAsc, SortDesc, Filter, Clock, Target, Download } from 'lucide-react';
import { EmployeeMetric, OpportunityMetric, UnmatchedEmployee } from '../../types/employee.types';
import { DataQualityMetrics, UtilizationMetrics } from '../../types/dashboard.types';
import StatusIndicator from '../UI/StatusIndicator';
import { formatCurrency, formatPercentage, formatHours, formatPerformanceTier } from '../../utils/formatters';
import { exportEmployeeAnalysisToPDF } from '../../utils/pdfExport';

interface EmployeeAnalysisProps {
  employeeMetrics: EmployeeMetric[];
  topOpportunities: OpportunityMetric[];
  unmatchedEmployees: UnmatchedEmployee[];
  dataQuality: DataQualityMetrics | null;
  utilizationMetrics: UtilizationMetrics | null;
}

type SortField = 'name' | 'profitMargin' | 'revenue' | 'payrollCost' | 'potentialRevenue' | 'utilizationRate';
type SortDirection = 'asc' | 'desc';
type PerformanceFilter = 'all' | 'excellent' | 'good' | 'needs-improvement' | 'critical';

const EmployeeAnalysis: React.FC<EmployeeAnalysisProps> = ({
  employeeMetrics,
  topOpportunities,
  unmatchedEmployees,
  utilizationMetrics,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('revenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [performanceFilter, setPerformanceFilter] = useState<PerformanceFilter>('all');
  const [isExporting, setIsExporting] = useState(false);

  // Separate employees by role and type
  const techEmployees = employeeMetrics.filter(emp => !emp.isHRStaff && emp.role === 'TECH');
  const bcbaEmployees = employeeMetrics.filter(emp => !emp.isHRStaff && emp.role === 'BCBA');
  const hrEmployees = employeeMetrics.filter(emp => emp.isHRStaff);
  const allBillableEmployees = [...techEmployees, ...bcbaEmployees];

  // Apply filters and sorting for Technicians
  const filteredAndSortedTechs = useMemo(() => {
    let filtered = techEmployees;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply performance filter
    if (performanceFilter !== 'all') {
      filtered = filtered.filter(emp => emp.performanceTier === performanceFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField] as number | string;
      let bValue = b[sortField] as number | string;

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [techEmployees, searchTerm, sortField, sortDirection, performanceFilter]);

  // Apply filters and sorting for BCBAs
  const filteredAndSortedBCBAs = useMemo(() => {
    let filtered = bcbaEmployees;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply performance filter
    if (performanceFilter !== 'all') {
      filtered = filtered.filter(emp => emp.performanceTier === performanceFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField] as number | string;
      let bValue = b[sortField] as number | string;

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [bcbaEmployees, searchTerm, sortField, sortDirection, performanceFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      await exportEmployeeAnalysisToPDF();
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Performance summary for all billable employees
  const performanceSummary = {
    excellent: allBillableEmployees.filter(emp => emp.performanceTier === 'excellent').length,
    good: allBillableEmployees.filter(emp => emp.performanceTier === 'good').length,
    needsImprovement: allBillableEmployees.filter(emp => emp.performanceTier === 'needs-improvement').length,
    critical: allBillableEmployees.filter(emp => emp.performanceTier === 'critical').length,
  };

  // Separate critical cases by role
  const criticalTechs = techEmployees.filter(emp => emp.performanceTier === 'critical');
  const criticalBCBAs = bcbaEmployees.filter(emp => emp.performanceTier === 'critical');

  // Calculate summary metrics for the sections
  const totalOpportunityRevenue = topOpportunities.reduce((sum, opp) => sum + opp.potentialAdditionalRevenue, 0);
  
  // Calculate Tech totals for summary row
  const techTotals = useMemo(() => {
    const totals = filteredAndSortedTechs.reduce(
      (acc, emp) => ({
        revenue: acc.revenue + emp.revenue,
        cost: acc.cost + emp.payrollCost,
        billableHours: acc.billableHours + emp.billableHours,
        payrollHours: acc.payrollHours + emp.payrollHours,
        additionalOpportunity: acc.additionalOpportunity + (emp.potentialRevenue - emp.revenue),
      }),
      { revenue: 0, cost: 0, billableHours: 0, payrollHours: 0, additionalOpportunity: 0 }
    );
    return totals;
  }, [filteredAndSortedTechs]);
  
  // Calculate BCBA totals for summary row
  const bcbaTotals = useMemo(() => {
    const totals = filteredAndSortedBCBAs.reduce(
      (acc, emp) => ({
        revenue: acc.revenue + emp.revenue,
        cost: acc.cost + emp.payrollCost,
        profit: acc.profit + (emp.revenue - emp.payrollCost),
      }),
      { revenue: 0, cost: 0, profit: 0 }
    );
    return totals;
  }, [filteredAndSortedBCBAs]);

  // Calculate Tech-specific utilization metrics
  const techUtilizationRate = techEmployees.length > 0 ? 
    techEmployees.reduce((sum, emp) => sum + emp.utilizationRate, 0) / techEmployees.length : 0;
  
  // Calculate BCBA-specific profit margin metrics
  const bcbaProfitMargin = bcbaEmployees.length > 0 ? 
    bcbaEmployees.reduce((sum, emp) => sum + emp.profitMargin, 0) / bcbaEmployees.length : 0;

  return (
    <div className="space-y-6" data-tab="employee-analysis">
      {/* Export Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Employee Analysis</h2>
          <p className="text-sm text-gray-600">Individual performance and utilization insights</p>
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

      {/* Performance Summary */}
      <div className="dashboard-grid">
        <div className="metric-card">
          <div className="metric-card-header">
            <h3 className="metric-card-title">Total Employees</h3>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <div className="metric-card-value">{allBillableEmployees.length}</div>
          <p className="metric-card-subtitle">Billable staff only</p>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <h3 className="metric-card-title">High Performers</h3>
            <TrendingUp className="h-5 w-5 text-success-500" />
          </div>
          <div className="metric-card-value">{performanceSummary.excellent}</div>
          <p className="metric-card-subtitle">≥90% util (Tech) / ≥40% margin (BCBA)</p>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <h3 className="metric-card-title">Needs Attention</h3>
            <AlertTriangle className="h-5 w-5 text-warning-500" />
          </div>
          <div className="metric-card-value">{performanceSummary.needsImprovement + performanceSummary.critical}</div>
          <p className="metric-card-subtitle">&lt;80% util (Tech) / &lt;30% margin (BCBA)</p>
        </div>

      </div>

      {/* Tech & BCBA Summary Metrics */}
      {utilizationMetrics && (
        <div className="dashboard-grid">
          <div className="metric-card">
            <div className="metric-card-header">
              <h3 className="metric-card-title">Tech Utilization</h3>
              <Target className="h-5 w-5 text-success-500" />
            </div>
            <div className="metric-card-value">{formatPercentage(utilizationMetrics.averageUtilizationRate || techUtilizationRate)}</div>
            <p className="metric-card-subtitle">
              Target: {formatPercentage(utilizationMetrics.benchmark)} • {techEmployees.length} Techs
            </p>
          </div>

          <div className="metric-card">
            <div className="metric-card-header">
              <h3 className="metric-card-title">BCBA Profit Margin</h3>
              <Target className="h-5 w-5 text-primary-500" />
            </div>
            <div className="metric-card-value">{formatPercentage(utilizationMetrics.averageProfitMargin || bcbaProfitMargin)}</div>
            <p className="metric-card-subtitle">
              Target: 60% • {bcbaEmployees.length} BCBAs
            </p>
          </div>

          <div className="metric-card">
            <div className="metric-card-header">
              <h3 className="metric-card-title">Improvement Potential</h3>
              <Target className="h-5 w-5 text-success-500" />
            </div>
            <div className="metric-card-value">{formatCurrency(totalOpportunityRevenue)}</div>
            <p className="metric-card-subtitle">From {topOpportunities.length} opportunities</p>
          </div>


          <div className="metric-card">
            <div className="metric-card-header">
              <h3 className="metric-card-title">Non-Billable Cost</h3>
              <Clock className="h-5 w-5 text-warning-500" />
            </div>
            <div className="metric-card-value">{formatCurrency(utilizationMetrics.costOfNonBillableTime)}</div>
            <p className="metric-card-subtitle">
              {formatHours(utilizationMetrics.nonBillableHours)} hrs opportunity cost
            </p>
          </div>
        </div>
      )}

      {/* Critical Cases Alert */}
      {(criticalTechs.length > 0 || criticalBCBAs.length > 0) && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-danger-500 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-danger-800">
                Critical Performance Issues Detected
              </h3>
              <div className="text-sm text-danger-700 mt-1 space-y-1">
                {criticalTechs.length > 0 && (
                  <p>
                    <strong>Technicians (&lt;50% utilization):</strong> {criticalTechs.map(emp => emp.name).join(', ')}
                  </p>
                )}
                {criticalBCBAs.length > 0 && (
                  <p>
                    <strong>BCBAs (&lt;20% profit margin):</strong> {criticalBCBAs.map(emp => emp.name).join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Improvement Opportunities - Technicians Only */}
      {topOpportunities.length > 0 && (
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Top Technician Improvement Opportunities</h3>
            <p className="chart-subtitle">Utilization-based revenue potential</p>
          </div>

          <div className="space-y-4">
            {topOpportunities.slice(0, 5).map((opportunity, index) => (
              <div key={opportunity.employeeName} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{opportunity.employeeName}</h4>
                    <p className="text-sm text-gray-500">
                      Current: {formatPercentage(opportunity.currentUtilization)} → 
                      Target: {formatPercentage(opportunity.targetUtilization)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-success-600">
                    {formatCurrency(opportunity.potentialAdditionalRevenue)}
                  </div>
                  <StatusIndicator
                    type="priority"
                    status={opportunity.priority}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technician Performance Table */}
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">Technician Performance Analysis</h3>
          <p className="chart-subtitle">Utilization-based metrics and opportunities</p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={performanceFilter}
              onChange={(e) => setPerformanceFilter(e.target.value as PerformanceFilter)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Performance</option>
              <option value="excellent">Excellent (≥90% util / ≥40% margin)</option>
              <option value="good">Good (80-89% util / 30-39% margin)</option>
              <option value="needs-improvement">Needs Improvement (50-79% util / 20-29% margin)</option>
              <option value="critical">Critical (&lt;50% util / &lt;20% margin)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead className="data-table-header">
              <tr>
                <th 
                  className="data-table-header-cell cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Employee</span>
                    {getSortIcon('name')}
                  </div>
                </th>
                <th 
                  className="data-table-header-cell cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('utilizationRate')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Utilization</span>
                    {getSortIcon('utilizationRate')}
                  </div>
                </th>
                <th 
                  className="data-table-header-cell cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('payrollCost')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Cost</span>
                    {getSortIcon('payrollCost')}
                  </div>
                </th>
                <th 
                  className="data-table-header-cell cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('revenue')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Revenue</span>
                    {getSortIcon('revenue')}
                  </div>
                </th>
                <th className="data-table-header-cell">Performance</th>
                <th 
                  className="data-table-header-cell cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('potentialRevenue')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Opportunity</span>
                    {getSortIcon('potentialRevenue')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="data-table-body">
              {filteredAndSortedTechs.map((employee) => {
                const tierInfo = formatPerformanceTier(employee.performanceTier);
                
                return (
                  <tr key={employee.name} className="data-table-row">
                    <td className="data-table-cell">
                      <div>
                        <div className="font-medium text-gray-900">{employee.name}</div>
                        {!employee.isMatched && (
                          <div className="text-xs text-warning-600">⚠ Partial match</div>
                        )}
                      </div>
                    </td>
                    <td className="data-table-cell">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{formatPercentage(employee.utilizationRate)}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              employee.utilizationRate >= 90 ? 'bg-success-500' :
                              employee.utilizationRate >= 80 ? 'bg-info-500' :
                              employee.utilizationRate >= 50 ? 'bg-warning-500' :
                              'bg-danger-500'
                            }`}
                            style={{ width: `${Math.max(0, Math.min(100, employee.utilizationRate))}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="data-table-cell">
                      <div>
                        <div className="font-medium">{formatCurrency(employee.payrollCost)}</div>
                        <div className="text-xs text-gray-500">
                          {formatHours(employee.payrollHours)} hrs
                        </div>
                      </div>
                    </td>
                    <td className="data-table-cell">
                      <div>
                        <div className="font-medium">{formatCurrency(employee.revenue)}</div>
                        <div className="text-xs text-gray-500">
                          {formatCurrency(employee.revenuePerHour)}/hr
                        </div>
                      </div>
                    </td>
                    <td className="data-table-cell">
                      <StatusIndicator
                        type="performance"
                        status={employee.performanceTier}
                        label={tierInfo.label}
                        size="sm"
                      />
                    </td>
                    <td className="data-table-cell">
                      <div>
                        <div className="font-medium text-success-600">
                          +{formatCurrency(employee.potentialRevenue - employee.revenue)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Potential revenue
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {/* Summary Row for Technicians */}
              <tr className="data-table-row bg-gray-100 font-bold border-t-2 border-gray-300">
                <td className="data-table-cell">
                  <div className="font-bold text-gray-900">TOTAL ({filteredAndSortedTechs.length} Technicians)</div>
                </td>
                <td className="data-table-cell">
                  <div className="font-bold">
                    {techTotals.payrollHours > 0 ? formatPercentage((techTotals.billableHours / techTotals.payrollHours) * 100) : '0.0%'}
                  </div>
                </td>
                <td className="data-table-cell">
                  <div className="font-bold">{formatCurrency(techTotals.cost)}</div>
                </td>
                <td className="data-table-cell">
                  <div className="font-bold">{formatCurrency(techTotals.revenue)}</div>
                </td>
                <td className="data-table-cell">
                  <div className="font-bold">-</div>
                </td>
                <td className="data-table-cell">
                  <div className="font-bold text-success-600">
                    +{formatCurrency(techTotals.additionalOpportunity)}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {filteredAndSortedTechs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No technicians match the current filters.
          </div>
        )}
      </div>

      {/* BCBA Performance Table */}
      {bcbaEmployees.length > 0 && (
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">BCBA Performance Analysis</h3>
            <p className="chart-subtitle">Revenue and cost-based metrics</p>
          </div>

          {/* BCBA Table */}
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead className="data-table-header">
                <tr>
                  <th className="data-table-header-cell">
                    <span>Employee</span>
                  </th>
                  <th className="data-table-header-cell">
                    <span>Profit Margin</span>
                  </th>
                  <th className="data-table-header-cell">
                    <span>Cost</span>
                  </th>
                  <th className="data-table-header-cell">
                    <span>Revenue</span>
                  </th>
                  <th className="data-table-header-cell">Performance</th>
                  <th className="data-table-header-cell">
                    <span>Profit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="data-table-body">
                {filteredAndSortedBCBAs.map((employee) => {
                  const tierInfo = formatPerformanceTier(employee.performanceTier);
                  
                  return (
                    <tr key={employee.name} className="data-table-row">
                      <td className="data-table-cell">
                        <div>
                          <div className="font-medium text-gray-900">{employee.name}</div>
                          <div className="text-xs text-primary-600">BCBA</div>
                          {!employee.isMatched && (
                            <div className="text-xs text-warning-600">⚠ Partial match</div>
                          )}
                        </div>
                      </td>
                      <td className="data-table-cell">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{formatPercentage(employee.profitMargin)}</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                employee.profitMargin >= 40 ? 'bg-success-500' :
                                employee.profitMargin >= 30 ? 'bg-info-500' :
                                employee.profitMargin >= 20 ? 'bg-warning-500' :
                                'bg-danger-500'
                              }`}
                              style={{ width: `${Math.max(0, Math.min(100, employee.profitMargin))}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="data-table-cell">
                        <div>
                          <div className="font-medium">{formatCurrency(employee.payrollCost)}</div>
                          <div className="text-xs text-gray-500">
                            {formatHours(employee.payrollHours)} hrs
                          </div>
                        </div>
                      </td>
                      <td className="data-table-cell">
                        <div>
                          <div className="font-medium">{formatCurrency(employee.revenue)}</div>
                          <div className="text-xs text-gray-500">
                            {formatCurrency(employee.revenuePerHour)}/hr
                          </div>
                        </div>
                      </td>
                      <td className="data-table-cell">
                        <StatusIndicator
                          type="performance"
                          status={employee.performanceTier}
                          label={tierInfo.label}
                          size="sm"
                        />
                      </td>
                      <td className="data-table-cell">
                        <div>
                          <div className={`font-medium ${
                            employee.revenue - employee.payrollCost >= 0 ? 'text-success-600' : 'text-danger-600'
                          }`}>
                            {formatCurrency(employee.revenue - employee.payrollCost)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatPercentage(employee.profitMargin)} margin
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {/* Summary Row for BCBAs */}
                <tr className="data-table-row bg-gray-100 font-bold border-t-2 border-gray-300">
                  <td className="data-table-cell">
                    <div className="font-bold text-gray-900">TOTAL ({filteredAndSortedBCBAs.length} BCBAs)</div>
                  </td>
                  <td className="data-table-cell">
                    <div className="font-bold">
                      {bcbaTotals.revenue > 0 ? formatPercentage(bcbaTotals.profit / bcbaTotals.revenue * 100) : '0.0%'}
                    </div>
                  </td>
                  <td className="data-table-cell">
                    <div className="font-bold">{formatCurrency(bcbaTotals.cost)}</div>
                  </td>
                  <td className="data-table-cell">
                    <div className="font-bold">{formatCurrency(bcbaTotals.revenue)}</div>
                  </td>
                  <td className="data-table-cell">
                    <div className="font-bold">-</div>
                  </td>
                  <td className="data-table-cell">
                    <div className={`font-bold ${
                      bcbaTotals.profit >= 0 ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {formatCurrency(bcbaTotals.profit)}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {filteredAndSortedBCBAs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No BCBAs match the current filters.
            </div>
          )}
        </div>
      )}

      {/* Unmatched Employees */}
      {unmatchedEmployees.length > 0 && (
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Unmatched Employees</h3>
            <p className="chart-subtitle">Employees found in only one system</p>
          </div>

          <div className="space-y-3">
            {unmatchedEmployees.map((employee, index) => (
              <div key={`${employee.source}-${employee.name}-${index}`} className="flex items-center justify-between p-3 bg-warning-50 border border-warning-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    employee.source === 'billing' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {employee.source === 'billing' ? 'Billing Only' : 'Payroll Only'}
                  </div>
                  <span className="font-medium">{employee.name}</span>
                </div>
                <div className="text-sm text-warning-700">
                  {employee.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HR Staff Section */}
      {hrEmployees.length > 0 && (
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">HR Staff (Excluded from Utilization)</h3>
            <p className="chart-subtitle">Non-billable administrative staff</p>
          </div>

          <div className="space-y-3">
            {hrEmployees.map((employee) => (
              <div key={employee.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                    HR Staff
                  </div>
                  <span className="font-medium">{employee.name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {formatHours(employee.payrollHours)} • {formatCurrency(employee.payrollCost)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAnalysis; 