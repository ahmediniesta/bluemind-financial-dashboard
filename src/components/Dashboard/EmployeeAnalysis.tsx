import React, { useState, useMemo } from 'react';
import { Users, TrendingUp, AlertTriangle, Search, SortAsc, SortDesc, Filter } from 'lucide-react';
import { EmployeeMetric, OpportunityMetric, UnmatchedEmployee } from '../../types/employee.types';
import { DataQualityMetrics } from '../../types/dashboard.types';
import StatusIndicator from '../UI/StatusIndicator';
import { formatCurrency, formatPercentage, formatHours, formatPerformanceTier } from '../../utils/formatters';

interface EmployeeAnalysisProps {
  employeeMetrics: EmployeeMetric[];
  topOpportunities: OpportunityMetric[];
  unmatchedEmployees: UnmatchedEmployee[];
  dataQuality: DataQualityMetrics | null;
}

type SortField = 'name' | 'utilizationRate' | 'revenue' | 'payrollCost' | 'potentialRevenue';
type SortDirection = 'asc' | 'desc';
type PerformanceFilter = 'all' | 'excellent' | 'good' | 'needs-improvement' | 'critical';

const EmployeeAnalysis: React.FC<EmployeeAnalysisProps> = ({
  employeeMetrics,
  topOpportunities,
  unmatchedEmployees,
  dataQuality,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('revenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [performanceFilter, setPerformanceFilter] = useState<PerformanceFilter>('all');

  // Filter billable employees
  const billableEmployees = employeeMetrics.filter(emp => !emp.isHRStaff);
  const hrEmployees = employeeMetrics.filter(emp => emp.isHRStaff);

  // Apply filters and sorting
  const filteredAndSortedEmployees = useMemo(() => {
    let filtered = billableEmployees;

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
  }, [billableEmployees, searchTerm, sortField, sortDirection, performanceFilter]);

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

  // Performance summary
  const performanceSummary = {
    excellent: billableEmployees.filter(emp => emp.performanceTier === 'excellent').length,
    good: billableEmployees.filter(emp => emp.performanceTier === 'good').length,
    needsImprovement: billableEmployees.filter(emp => emp.performanceTier === 'needs-improvement').length,
    critical: billableEmployees.filter(emp => emp.performanceTier === 'critical').length,
  };

  const criticalCases = billableEmployees.filter(emp => emp.performanceTier === 'critical');

  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      <div className="dashboard-grid">
        <div className="metric-card">
          <div className="metric-card-header">
            <h3 className="metric-card-title">Total Employees</h3>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <div className="metric-card-value">{billableEmployees.length}</div>
          <p className="metric-card-subtitle">Billable staff only</p>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <h3 className="metric-card-title">High Performers</h3>
            <TrendingUp className="h-5 w-5 text-success-500" />
          </div>
          <div className="metric-card-value">{performanceSummary.excellent}</div>
          <p className="metric-card-subtitle">≥90% utilization</p>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <h3 className="metric-card-title">Needs Attention</h3>
            <AlertTriangle className="h-5 w-5 text-warning-500" />
          </div>
          <div className="metric-card-value">{performanceSummary.needsImprovement + performanceSummary.critical}</div>
          <p className="metric-card-subtitle">&lt;80% utilization</p>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <h3 className="metric-card-title">Matching Rate</h3>
            <Users className="h-5 w-5 text-info-500" />
          </div>
          <div className="metric-card-value">
            {formatPercentage(dataQuality?.employeeMatchingRate || 0)}
          </div>
          <p className="metric-card-subtitle">Billing-Payroll match</p>
        </div>
      </div>

      {/* Critical Cases Alert */}
      {criticalCases.length > 0 && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-danger-500 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-danger-800">
                Critical Performance Issues Detected
              </h3>
              <p className="text-sm text-danger-700 mt-1">
                {criticalCases.length} employee{criticalCases.length > 1 ? 's' : ''} with utilization below 50%: {' '}
                {criticalCases.map(emp => emp.name).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Improvement Opportunities */}
      {topOpportunities.length > 0 && (
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Top Improvement Opportunities</h3>
            <p className="chart-subtitle">Highest revenue potential</p>
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

      {/* Employee Table */}
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">Employee Performance Analysis</h3>
          <p className="chart-subtitle">Individual metrics and opportunities</p>
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
              <option value="excellent">Excellent (≥90%)</option>
              <option value="good">Good (80-89%)</option>
              <option value="needs-improvement">Needs Improvement (50-79%)</option>
              <option value="critical">Critical (&lt;50%)</option>
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
                    <span>Potential</span>
                    {getSortIcon('potentialRevenue')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="data-table-body">
              {filteredAndSortedEmployees.map((employee) => {
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
                            style={{ width: `${Math.min(100, employee.utilizationRate)}%` }}
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
                          {formatCurrency(employee.potentialRevenue)}
                        </div>
                        <div className="text-xs text-gray-500">
                          +{formatCurrency(employee.potentialRevenue - employee.revenue)}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAndSortedEmployees.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No employees match the current filters.
          </div>
        )}
      </div>

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