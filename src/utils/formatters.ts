/**
 * BlueMind Formatting Utilities
 * Consistent formatting for financial data display
 */

import { PRECISION } from '../constants/businessRules';

/**
 * Format currency values with proper locale and precision
 */
export const formatCurrency = (value: number, options?: {
  showCents?: boolean;
  compact?: boolean;
}): string => {
  const { showCents = true, compact = false } = options || {};
  
  if (compact && Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  
  if (compact && Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  
  const precision = showCents ? PRECISION.CURRENCY : 0;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);
};

/**
 * Format percentage values with proper precision
 */
export const formatPercentage = (value: number, options?: {
  precision?: number;
  showSign?: boolean;
}): string => {
  const { precision = PRECISION.PERCENTAGE, showSign = false } = options || {};
  
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(precision)}%`;
};

/**
 * Format hour values with proper precision
 */
export const formatHours = (value: number, options?: {
  showUnit?: boolean;
  compact?: boolean;
}): string => {
  const { showUnit = true, compact = false } = options || {};
  
  if (compact && value >= 1000) {
    return `${(value / 1000).toFixed(1)}K${showUnit ? ' hrs' : ''}`;
  }
  
  const formatted = value.toFixed(PRECISION.HOURS);
  return showUnit ? `${formatted} hrs` : formatted;
};

/**
 * Format general numbers with appropriate precision
 */
export const formatNumber = (value: number, options?: {
  precision?: number;
  compact?: boolean;
}): string => {
  const { precision = 0, compact = false } = options || {};
  
  if (compact) {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
  }
  
  return value.toFixed(precision);
};

/**
 * Format rates (per hour values)
 */
export const formatRate = (value: number): string => {
  return `${formatCurrency(value)}/hr`;
};

/**
 * Format large numbers with thousand separators
 */
export const formatLargeNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
};

/**
 * Format change/difference values with appropriate styling context
 */
export const formatChange = (value: number, type: 'currency' | 'percentage' | 'number'): {
  formatted: string;
  isPositive: boolean;
  isNegative: boolean;
  isNeutral: boolean;
} => {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;
  
  let formatted: string;
  
  switch (type) {
    case 'currency':
      formatted = formatCurrency(Math.abs(value));
      break;
    case 'percentage':
      formatted = formatPercentage(Math.abs(value));
      break;
    default:
      formatted = formatNumber(Math.abs(value));
  }
  
  const sign = isPositive ? '+' : isNegative ? '-' : '';
  
  return {
    formatted: `${sign}${formatted}`,
    isPositive,
    isNegative,
    isNeutral,
  };
};

/**
 * Format performance tier with appropriate styling
 */
export const formatPerformanceTier = (tier: 'excellent' | 'good' | 'needs-improvement' | 'critical'): {
  label: string;
  color: string;
  description: string;
} => {
  const tierMappings = {
    excellent: {
      label: 'Excellent',
      color: 'success',
      description: '≥90% utilization',
    },
    good: {
      label: 'Good',
      color: 'info',
      description: '80-89% utilization',
    },
    'needs-improvement': {
      label: 'Needs Improvement',
      color: 'warning',
      description: '50-79% utilization',
    },
    critical: {
      label: 'Critical',
      color: 'danger',
      description: '<50% utilization',
    },
  };
  
  return tierMappings[tier];
};

/**
 * Format priority level with appropriate styling
 */
export const formatPriority = (priority: 'high' | 'medium' | 'low'): {
  label: string;
  color: string;
  urgency: number;
} => {
  const priorityMappings = {
    high: {
      label: 'High Priority',
      color: 'danger',
      urgency: 3,
    },
    medium: {
      label: 'Medium Priority',
      color: 'warning',
      urgency: 2,
    },
    low: {
      label: 'Low Priority',
      color: 'info',
      urgency: 1,
    },
  };
  
  return priorityMappings[priority];
};

/**
 * Format utilization rate with benchmark comparison
 */
export const formatUtilizationWithBenchmark = (utilization: number, benchmark: number): {
  formatted: string;
  status: 'above' | 'below' | 'at';
  difference: string;
  color: string;
} => {
  const difference = utilization - benchmark;
  const status = difference > 0 ? 'above' : difference < 0 ? 'below' : 'at';
  
  let color: string;
  if (utilization >= 90) color = 'success';
  else if (utilization >= 80) color = 'warning';
  else if (utilization >= 50) color = 'info';
  else color = 'danger';
  
  return {
    formatted: formatPercentage(utilization),
    status,
    difference: formatPercentage(Math.abs(difference), { showSign: true }),
    color,
  };
};

/**
 * Format data quality score with appropriate indicators
 */
export const formatDataQuality = (score: number): {
  formatted: string;
  grade: string;
  color: string;
  description: string;
} => {
  let grade: string;
  let color: string;
  let description: string;
  
  if (score >= 95) {
    grade = 'A+';
    color = 'success';
    description = 'Excellent data quality';
  } else if (score >= 85) {
    grade = 'A';
    color = 'success';
    description = 'Good data quality';
  } else if (score >= 70) {
    grade = 'B';
    color = 'warning';
    description = 'Fair data quality';
  } else if (score >= 50) {
    grade = 'C';
    color = 'warning';
    description = 'Poor data quality';
  } else {
    grade = 'F';
    color = 'danger';
    description = 'Critical data quality issues';
  }
  
  return {
    formatted: formatPercentage(score),
    grade,
    color,
    description,
  };
};

/**
 * Format date range for display
 */
export const formatDateRange = (start: Date, end: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  
  const startFormatted = start.toLocaleDateString('en-US', options);
  const endFormatted = end.toLocaleDateString('en-US', options);
  
  return `${startFormatted} - ${endFormatted}`;
};

/**
 * Format tooltip content for charts
 */
export const formatTooltipValue = (
  value: number,
  name: string,
  type: 'currency' | 'percentage' | 'hours' | 'number'
): string => {
  let formatted: string;
  
  switch (type) {
    case 'currency':
      formatted = formatCurrency(value);
      break;
    case 'percentage':
      formatted = formatPercentage(value);
      break;
    case 'hours':
      formatted = formatHours(value);
      break;
    default:
      formatted = formatNumber(value, { precision: 2 });
  }
  
  return `${name}: ${formatted}`;
};

/**
 * Conditional formatting based on value and thresholds
 */
export const getConditionalFormatting = (
  value: number,
  thresholds: { good: number; warning: number },
  isHigherBetter: boolean = true
): {
  color: string;
  intensity: 'light' | 'medium' | 'strong';
} => {
  const { good, warning } = thresholds;
  
  let color: string;
  let intensity: 'light' | 'medium' | 'strong';
  
  if (isHigherBetter) {
    if (value >= good) {
      color = 'success';
      intensity = 'strong';
    } else if (value >= warning) {
      color = 'warning';
      intensity = 'medium';
    } else {
      color = 'danger';
      intensity = 'strong';
    }
  } else {
    if (value <= good) {
      color = 'success';
      intensity = 'strong';
    } else if (value <= warning) {
      color = 'warning';
      intensity = 'medium';
    } else {
      color = 'danger';
      intensity = 'strong';
    }
  }
  
  return { color, intensity };
}; 