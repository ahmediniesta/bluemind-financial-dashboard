import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, XCircle } from 'lucide-react';
import clsx from 'clsx';

interface StatusIndicatorProps {
  type: 'performance' | 'priority' | 'quality' | 'custom';
  status: string;
  label?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  type,
  status,
  label,
  showIcon = true,
  size = 'md',
  className,
}) => {
  const getStatusConfig = () => {
    switch (type) {
      case 'performance':
        return getPerformanceConfig(status);
      case 'priority':
        return getPriorityConfig(status);
      case 'quality':
        return getQualityConfig(status);
      default:
        return getCustomConfig(status);
    }
  };

  const getPerformanceConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent':
        return {
          color: 'success',
          icon: CheckCircle,
          bgClass: 'bg-success-100 text-success-800',
          iconClass: 'text-success-600',
        };
      case 'good':
        return {
          color: 'info',
          icon: CheckCircle,
          bgClass: 'bg-info-100 text-info-800',
          iconClass: 'text-info-600',
        };
      case 'needs-improvement':
        return {
          color: 'warning',
          icon: AlertTriangle,
          bgClass: 'bg-warning-100 text-warning-800',
          iconClass: 'text-warning-600',
        };
      case 'critical':
        return {
          color: 'danger',
          icon: XCircle,
          bgClass: 'bg-danger-100 text-danger-800',
          iconClass: 'text-danger-600',
        };
      default:
        return {
          color: 'neutral',
          icon: AlertCircle,
          bgClass: 'bg-gray-100 text-gray-800',
          iconClass: 'text-gray-600',
        };
    }
  };

  const getPriorityConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'high':
        return {
          color: 'danger',
          icon: AlertTriangle,
          bgClass: 'bg-danger-100 text-danger-800',
          iconClass: 'text-danger-600',
        };
      case 'medium':
        return {
          color: 'warning',
          icon: AlertCircle,
          bgClass: 'bg-warning-100 text-warning-800',
          iconClass: 'text-warning-600',
        };
      case 'low':
        return {
          color: 'info',
          icon: CheckCircle,
          bgClass: 'bg-info-100 text-info-800',
          iconClass: 'text-info-600',
        };
      default:
        return {
          color: 'neutral',
          icon: AlertCircle,
          bgClass: 'bg-gray-100 text-gray-800',
          iconClass: 'text-gray-600',
        };
    }
  };

  const getQualityConfig = (status: string) => {
    const grade = status.toLowerCase();
    if (grade.includes('a')) {
      return {
        color: 'success',
        icon: CheckCircle,
        bgClass: 'bg-success-100 text-success-800',
        iconClass: 'text-success-600',
      };
    } else if (grade.includes('b')) {
      return {
        color: 'warning',
        icon: AlertTriangle,
        bgClass: 'bg-warning-100 text-warning-800',
        iconClass: 'text-warning-600',
      };
    } else {
      return {
        color: 'danger',
        icon: XCircle,
        bgClass: 'bg-danger-100 text-danger-800',
        iconClass: 'text-danger-600',
      };
    }
  };

  const getCustomConfig = (_status: string) => {
    return {
      color: 'neutral',
      icon: AlertCircle,
      bgClass: 'bg-gray-100 text-gray-800',
      iconClass: 'text-gray-600',
    };
  };

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 'h-3 w-3',
    },
    md: {
      container: 'px-3 py-1 text-sm',
      icon: 'h-4 w-4',
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 'h-5 w-5',
    },
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium',
        config.bgClass,
        sizeClasses[size].container,
        className
      )}
    >
      {showIcon && (
        <Icon className={clsx('mr-1', sizeClasses[size].icon, config.iconClass)} />
      )}
      {label || status}
    </span>
  );
};

export default StatusIndicator; 