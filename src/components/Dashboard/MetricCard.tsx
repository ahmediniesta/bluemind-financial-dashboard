import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { MetricCardProps } from '../../types/dashboard.types';
import { formatCurrency, formatPercentage, formatHours, formatNumber } from '../../utils/formatters';


const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  format,
  trend,
  benchmark,
  isLoading = false,
  error,
  className,
}) => {
  const formatValue = (val: number, fmt: string) => {
    switch (fmt) {
      case 'currency':
        return formatCurrency(val);
      case 'percentage':
        return formatPercentage(val);
      case 'hours':
        return formatHours(val);
      default:
        return formatNumber(val);
    }
  };

  const getTrendIcon = (trendType?: string) => {
    switch (trendType) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const getTrendColor = (trendType?: string) => {
    switch (trendType) {
      case 'up':
        return 'text-success-600';
      case 'down':
        return 'text-danger-600';
      default:
        return 'text-gray-400';
    }
  };

  const getBenchmarkComparison = () => {
    if (!benchmark) return null;

    const difference = value - benchmark;
    const isAbove = difference > 0;
    const isSignificant = Math.abs(difference) > (benchmark * 0.05); // 5% threshold

    if (!isSignificant) {
      return {
        status: 'at-benchmark',
        message: 'At benchmark',
        color: 'text-gray-600',
      };
    }

    return {
      status: isAbove ? 'above-benchmark' : 'below-benchmark',
      message: `${Math.abs(difference).toFixed(1)} ${isAbove ? 'above' : 'below'} benchmark`,
      color: isAbove ? 'text-success-600' : 'text-warning-600',
    };
  };

  const benchmarkComparison = getBenchmarkComparison();
  const TrendIcon = getTrendIcon(trend);

  if (error) {
    return (
      <div className={clsx('metric-card', className)}>
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-danger-500 mx-auto mb-2" />
            <p className="text-sm text-danger-600 font-medium">Error loading metric</p>
            <p className="text-xs text-gray-500 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={clsx('metric-card', className)}>
        <div className="animate-pulse">
          <div className="metric-card-header">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('metric-card', className)}>
      <div className="metric-card-header">
        <h3 className="metric-card-title">{title}</h3>
        {trend && (
          <TrendIcon className={clsx('h-4 w-4', getTrendColor(trend))} />
        )}
      </div>

      <div className="metric-card-value">
        {formatValue(value, format)}
      </div>

      {subtitle && (
        <p className="metric-card-subtitle">{subtitle}</p>
      )}

      {benchmark !== undefined && benchmarkComparison && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Benchmark: {formatValue(benchmark, format)}</span>
            <span className={benchmarkComparison.color}>
              {benchmarkComparison.message}
            </span>
          </div>
        </div>
      )}

      {/* Performance indicator bar */}
      {benchmark !== undefined && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={clsx(
                'h-2 rounded-full transition-all duration-500',
                value >= benchmark ? 'bg-success-500' : 'bg-warning-500'
              )}
              style={{
                width: `${Math.min(100, (value / benchmark) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricCard; 