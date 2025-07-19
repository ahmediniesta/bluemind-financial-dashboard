/**
 * Enterprise-grade Error Boundary Component
 * Provides graceful error handling with recovery options and detailed error reporting
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, FileText, Mail } from 'lucide-react';
import { BaseError, ErrorHandler } from '../../utils/errors';

interface ErrorBoundaryState {
  hasError: boolean;
  error: BaseError | null;
  errorInfo: ErrorInfo | null;
  isRetrying: boolean;
  retryCount: number;
  showDetails: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: BaseError; retry: () => void }>;
  onError?: (error: BaseError, errorInfo: ErrorInfo) => void;
  enableRetry?: boolean;
  maxRetries?: number;
  showErrorDetails?: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private errorHandler: ErrorHandler;
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
      retryCount: 0,
      showDetails: false
    };
    this.errorHandler = ErrorHandler.getInstance();
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error: error instanceof BaseError ? error : null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const processedError = this.errorHandler.handleError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    });

    this.setState({
      error: processedError,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(processedError, errorInfo);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    
    if (this.state.retryCount >= maxRetries) {
      return;
    }

    this.setState({
      isRetrying: true,
      retryCount: this.state.retryCount + 1
    });

    // Add delay before retry to prevent rapid retries
    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRetrying: false
      });
    }, 1000);
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRefresh = () => {
    window.location.reload();
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  handleReportError = () => {
    const { error, errorInfo } = this.state;
    if (!error) return;

    const errorReport = {
      error: error.toJSON(),
      errorInfo,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    // In a real application, this would send to an error reporting service
    console.error('Error Report:', errorReport);
    
    // For now, copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        alert('Error report copied to clipboard. Please share this with support.');
      })
      .catch(() => {
        alert('Failed to copy error report. Please manually copy the console output.');
      });
  };

  render() {
    const { hasError, error, isRetrying, retryCount, showDetails } = this.state;
    const { children, fallback: CustomFallback, enableRetry = true, maxRetries = 3, showErrorDetails = true } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (CustomFallback) {
        return <CustomFallback error={error} retry={this.handleRetry} />;
      }

      // Default error boundary UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
            {/* Error Icon and Title */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Error Message */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 mb-4">
                {error.getUserMessage()}
              </p>
              
              {/* Error Severity Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                {error.severity.charAt(0).toUpperCase() + error.severity.slice(1)} Error
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              {enableRetry && retryCount < maxRetries && (
                <button
                  onClick={this.handleRetry}
                  disabled={isRetrying}
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className={`w-5 h-5 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                  {isRetrying ? 'Retrying...' : `Retry (${maxRetries - retryCount} left)`}
                </button>
              )}
              
              <button
                onClick={this.handleRefresh}
                className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Refresh Page
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Home className="w-5 h-5 mr-2" />
                Go Home
              </button>
            </div>

            {/* Retry Limit Reached */}
            {retryCount >= maxRetries && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-800 font-medium">
                    Maximum retry attempts reached. Please refresh the page or contact support.
                  </span>
                </div>
              </div>
            )}

            {/* Error Details Section */}
            {showErrorDetails && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Error Details</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={this.handleReportError}
                      className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Report Error
                    </button>
                    <button
                      onClick={this.toggleDetails}
                      className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      {showDetails ? 'Hide' : 'Show'} Details
                    </button>
                  </div>
                </div>

                {showDetails && (
                  <div className="space-y-4">
                    {/* Error Code and Timestamp */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Error Code
                        </label>
                        <div className="bg-gray-50 border rounded-lg p-3">
                          <code className="text-sm text-gray-800">{error.errorCode}</code>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Timestamp
                        </label>
                        <div className="bg-gray-50 border rounded-lg p-3">
                          <code className="text-sm text-gray-800">
                            {error.timestamp.toLocaleString()}
                          </code>
                        </div>
                      </div>
                    </div>

                    {/* Technical Details */}
                    {Object.keys(error.technicalDetails).length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Technical Details
                        </label>
                        <div className="bg-gray-50 border rounded-lg p-3">
                          <pre className="text-sm text-gray-800 overflow-x-auto">
                            {JSON.stringify(error.technicalDetails, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Stack Trace */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stack Trace
                      </label>
                      <div className="bg-gray-50 border rounded-lg p-3 max-h-60 overflow-y-auto">
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                          {error.stackTrace}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Help Text */}
            <div className="text-center text-sm text-gray-500 mt-8">
              If this problem persists, please contact our support team with the error details above.
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

// HOC for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Simple error fallback component
export const SimpleErrorFallback: React.FC<{ error: BaseError; retry: () => void }> = ({ error, retry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
    <div className="flex items-center">
      <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
      <div className="flex-1">
        <h3 className="text-sm font-medium text-red-800">
          {error.getUserMessage()}
        </h3>
        <p className="text-xs text-red-600 mt-1">
          Error Code: {error.errorCode}
        </p>
      </div>
      <button
        onClick={retry}
        className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

export default ErrorBoundary;