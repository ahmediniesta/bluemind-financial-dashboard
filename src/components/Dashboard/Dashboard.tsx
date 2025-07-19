import React, { useState } from 'react';
import { BarChart3, Users, AlertCircle, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import { useFileReader } from '../../hooks/useFileReader';
import { useDataProcessor } from '../../hooks/useDataProcessor';
import FinancialOverview from './FinancialOverview';
import EmployeeAnalysis from './EmployeeAnalysis';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorBoundary from '../UI/ErrorBoundary';
import { getDateRangeSummary } from '../../constants/dateRanges';

type DashboardTab = 'overview' | 'employees';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  
  // Load and process data
  const { billingData, payrollData, isLoading, error, progress, retry } = useFileReader();
  const { 
    dashboardData, 
    financialMetrics, 
    utilizationMetrics, 
    employeeMetrics,
    topOpportunities,
    unmatchedEmployees,
    dataQuality
  } = useDataProcessor(billingData, payrollData);

  const tabs = [
    {
      id: 'overview' as const,
      label: 'Financial Overview',
      icon: BarChart3,
      description: 'Revenue, costs, and profit analysis',
    },
    {
      id: 'employees' as const,
      label: 'Employee Analysis',
      icon: Users,
      description: 'Individual performance and utilization insights',
    },
  ];

  const dateRanges = getDateRangeSummary();



  // Loading state
  if (isLoading) {
    return (
      <div className="dashboard-container">
        <LoadingSpinner 
          message="Processing BlueMind financial data..." 
          progress={progress}
          size="lg"
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dashboard-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-danger-100 rounded-full">
                <AlertCircle className="h-8 w-8 text-danger-600" />
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Data Loading Error
            </h2>
            
            <p className="text-gray-600 mb-6">
              {error}
            </p>

            <button
              onClick={retry}
              className="btn btn-primary flex items-center justify-center mx-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <ErrorBoundary>
      <div className="dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                BlueMind Financial Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Q2 2025 Performance Analysis • Last updated: {dashboardData?.lastUpdated.toLocaleString()}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Data quality indicator */}
              {dataQuality && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Data Quality:</span>
                  <span className={clsx(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    dataQuality.overallScore >= 90 ? 'bg-success-100 text-success-800' :
                    dataQuality.overallScore >= 70 ? 'bg-warning-100 text-warning-800' :
                    'bg-danger-100 text-danger-800'
                  )}>
                    {dataQuality.overallScore}%
                  </span>
                </div>
              )}
              
              {/* Date ranges */}
              <div className="text-sm text-gray-500">
                <div>Billing: {dateRanges.billing.range}</div>
                <div>Payroll: {dateRanges.payroll.range}</div>
              </div>
            </div>
          </div>


          {/* Tab Navigation */}
          <nav className="mt-6">
            <div className="tab-list">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      'tab-button flex items-center',
                      isActive ? 'tab-button-active' : 'tab-button-inactive'
                    )}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">{tab.label}</div>
                      <div className="text-xs opacity-75">{tab.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="dashboard-main">
          {activeTab === 'overview' && financialMetrics && (
            <FinancialOverview 
              financialMetrics={financialMetrics}
              utilizationMetrics={utilizationMetrics}
              dataQuality={dataQuality}
              topOpportunities={topOpportunities}
            />
          )}
          
          {activeTab === 'employees' && (
            <EmployeeAnalysis 
              employeeMetrics={employeeMetrics}
              topOpportunities={topOpportunities}
              unmatchedEmployees={unmatchedEmployees}
              dataQuality={dataQuality}
              utilizationMetrics={utilizationMetrics}
            />
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard; 