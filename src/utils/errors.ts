/**
 * Enterprise-grade error handling system
 * Custom error classes for different error types with proper error recovery
 */

// Base error class with enhanced functionality
export abstract class BaseError extends Error {
  public readonly timestamp: Date;
  public readonly errorCode: string;
  public readonly severity: 'low' | 'medium' | 'high' | 'critical';
  public readonly userMessage: string;
  public readonly technicalDetails: Record<string, unknown>;
  public readonly stackTrace: string;

  constructor(
    message: string,
    errorCode: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    userMessage: string,
    technicalDetails: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.errorCode = errorCode;
    this.severity = severity;
    this.userMessage = userMessage;
    this.technicalDetails = technicalDetails;
    this.stackTrace = this.stack || '';
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Convert to JSON for logging
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      errorCode: this.errorCode,
      severity: this.severity,
      userMessage: this.userMessage,
      technicalDetails: this.technicalDetails,
      timestamp: this.timestamp.toISOString(),
      stackTrace: this.stackTrace
    };
  }

  // Get user-friendly error message
  getUserMessage(): string {
    return this.userMessage;
  }

  // Get technical details for debugging
  getTechnicalDetails(): Record<string, unknown> {
    return this.technicalDetails;
  }
}

// File processing errors
export class FileProcessingError extends BaseError {
  constructor(
    message: string,
    userMessage: string,
    technicalDetails: Record<string, unknown> = {}
  ) {
    super(message, 'FILE_PROCESSING_ERROR', 'high', userMessage, technicalDetails);
  }
}

export class FileNotFoundError extends FileProcessingError {
  constructor(filePath: string, technicalDetails: Record<string, unknown> = {}) {
    super(
      `File not found: ${filePath}`,
      'The requested file could not be found. Please check the file path and try again.',
      { filePath, ...technicalDetails }
    );
  }
}

export class FileFormatError extends FileProcessingError {
  constructor(
    filePath: string,
    expectedFormat: string,
    actualFormat: string,
    technicalDetails: Record<string, unknown> = {}
  ) {
    super(
      `Invalid file format: expected ${expectedFormat}, got ${actualFormat}`,
      `The file format is not supported. Please upload a ${expectedFormat} file.`,
      { filePath, expectedFormat, actualFormat, ...technicalDetails }
    );
  }
}

export class FileCorruptionError extends FileProcessingError {
  constructor(
    filePath: string,
    reason: string,
    technicalDetails: Record<string, unknown> = {}
  ) {
    super(
      `File corruption detected: ${reason}`,
      'The file appears to be corrupted or damaged. Please try uploading a different file.',
      { filePath, reason, ...technicalDetails }
    );
  }
}

// Data validation errors
export class DataValidationError extends BaseError {
  constructor(
    message: string,
    userMessage: string,
    technicalDetails: Record<string, unknown> = {}
  ) {
    super(message, 'DATA_VALIDATION_ERROR', 'high', userMessage, technicalDetails);
  }
}

export class InvalidDataFormatError extends DataValidationError {
  constructor(
    field: string,
    expected: string,
    actual: string,
    rowNumber?: number,
    technicalDetails: Record<string, unknown> = {}
  ) {
    super(
      `Invalid data format for field '${field}': expected ${expected}, got ${actual}`,
      `Invalid data format detected. Please check the data format for field '${field}'.`,
      { field, expected, actual, rowNumber, ...technicalDetails }
    );
  }
}

export class MissingRequiredFieldError extends DataValidationError {
  constructor(
    field: string,
    rowNumber?: number,
    technicalDetails: Record<string, unknown> = {}
  ) {
    super(
      `Missing required field: ${field}`,
      `Required field '${field}' is missing. Please ensure all required fields are provided.`,
      { field, rowNumber, ...technicalDetails }
    );
  }
}

export class DataRangeError extends DataValidationError {
  constructor(
    field: string,
    value: unknown,
    min?: number,
    max?: number,
    technicalDetails: Record<string, unknown> = {}
  ) {
    super(
      `Value out of range for field '${field}': ${value}`,
      `The value for field '${field}' is outside the expected range. Please check the data.`,
      { field, value, min, max, ...technicalDetails }
    );
  }
}

// Calculation errors
export class CalculationError extends BaseError {
  constructor(
    message: string,
    userMessage: string,
    technicalDetails: Record<string, unknown> = {}
  ) {
    super(message, 'CALCULATION_ERROR', 'critical', userMessage, technicalDetails);
  }
}

export class MathematicalInconsistencyError extends CalculationError {
  constructor(
    calculationType: string,
    expected: number,
    actual: number,
    technicalDetails: Record<string, unknown> = {}
  ) {
    super(
      `Mathematical inconsistency in ${calculationType}: expected ${expected}, got ${actual}`,
      'A calculation error has been detected. Please review the input data and try again.',
      { calculationType, expected, actual, ...technicalDetails }
    );
  }
}

export class DivisionByZeroError extends CalculationError {
  constructor(
    context: string,
    technicalDetails: Record<string, unknown> = {}
  ) {
    super(
      `Division by zero in ${context}`,
      'Cannot perform calculation due to zero division. Please check the input data.',
      { context, ...technicalDetails }
    );
  }
}

// Network and external service errors
export class NetworkError extends BaseError {
  constructor(
    message: string,
    userMessage: string,
    technicalDetails: Record<string, unknown> = {}
  ) {
    super(message, 'NETWORK_ERROR', 'medium', userMessage, technicalDetails);
  }
}

export class TimeoutError extends NetworkError {
  constructor(
    operation: string,
    timeout: number,
    technicalDetails: Record<string, unknown> = {}
  ) {
    super(
      `Operation timed out: ${operation} (${timeout}ms)`,
      'The operation is taking longer than expected. Please try again.',
      { operation, timeout, ...technicalDetails }
    );
  }
}

export class ServiceUnavailableError extends NetworkError {
  constructor(
    service: string,
    technicalDetails: Record<string, unknown> = {}
  ) {
    super(
      `Service unavailable: ${service}`,
      'The service is temporarily unavailable. Please try again later.',
      { service, ...technicalDetails }
    );
  }
}

// Business logic errors
export class BusinessLogicError extends BaseError {
  constructor(
    message: string,
    userMessage: string,
    technicalDetails: Record<string, unknown> = {}
  ) {
    super(message, 'BUSINESS_LOGIC_ERROR', 'high', userMessage, technicalDetails);
  }
}

export class InvalidBusinessRuleError extends BusinessLogicError {
  constructor(
    rule: string,
    violation: string,
    technicalDetails: Record<string, unknown> = {}
  ) {
    super(
      `Business rule violation: ${rule} - ${violation}`,
      'The operation violates a business rule. Please review the data and try again.',
      { rule, violation, ...technicalDetails }
    );
  }
}

export class InsufficientDataError extends BusinessLogicError {
  constructor(
    requiredData: string,
    technicalDetails: Record<string, unknown> = {}
  ) {
    super(
      `Insufficient data: ${requiredData}`,
      'Insufficient data to perform the requested operation. Please provide more data.',
      { requiredData, ...technicalDetails }
    );
  }
}

// Configuration errors
export class ConfigurationError extends BaseError {
  constructor(
    message: string,
    userMessage: string,
    technicalDetails: Record<string, unknown> = {}
  ) {
    super(message, 'CONFIGURATION_ERROR', 'medium', userMessage, technicalDetails);
  }
}

export class MissingConfigurationError extends ConfigurationError {
  constructor(
    configKey: string,
    technicalDetails: Record<string, unknown> = {}
  ) {
    super(
      `Missing configuration: ${configKey}`,
      'A configuration error has occurred. Please contact support.',
      { configKey, ...technicalDetails }
    );
  }
}

// Error handler utility functions
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: BaseError[] = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Log error with context
  logError(error: BaseError, context?: Record<string, unknown>): void {
    const errorWithContext = {
      ...error.toJSON(),
      context: context || {}
    };

    this.errorLog.push(error);
    
    // In production, this would send to a logging service
    if (error.severity === 'critical' || error.severity === 'high') {
      console.error('🚨 Critical Error:', errorWithContext);
    } else {
      console.warn('⚠️ Warning:', errorWithContext);
    }
  }

  // Handle error with recovery strategy
  handleError(error: unknown, context?: Record<string, unknown>): BaseError {
    let processedError: BaseError;

    if (error instanceof BaseError) {
      processedError = error;
    } else if (error instanceof Error) {
      processedError = new DataValidationError(
        error.message,
        'An unexpected error occurred. Please try again.',
        { originalError: error.message, stack: error.stack }
      );
    } else {
      processedError = new DataValidationError(
        'Unknown error occurred',
        'An unexpected error occurred. Please try again.',
        { originalError: String(error) }
      );
    }

    this.logError(processedError, context);
    return processedError;
  }

  // Get error statistics
  getErrorStats(): {
    total: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    recent: BaseError[];
  } {
    const bySeverity: Record<string, number> = {};
    const byType: Record<string, number> = {};

    this.errorLog.forEach(error => {
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
      byType[error.name] = (byType[error.name] || 0) + 1;
    });

    return {
      total: this.errorLog.length,
      bySeverity,
      byType,
      recent: this.errorLog.slice(-10) // Last 10 errors
    };
  }

  // Clear error log
  clearErrorLog(): void {
    this.errorLog = [];
  }
}

// Error boundary component helper
export const createErrorBoundaryHandler = (
  fallbackComponent: React.ComponentType<{ error: BaseError; retry: () => void }>
) => {
  return (error: Error, errorInfo: { componentStack: string }) => {
    const errorHandler = ErrorHandler.getInstance();
    errorHandler.handleError(error, { componentStack: errorInfo.componentStack });
    
    return fallbackComponent;
  };
};

// Retry mechanism with exponential backoff
export class RetryMechanism {
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries) {
          throw lastError;
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }
}

// Circuit breaker pattern
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly failureThreshold: number = 5,
    private readonly timeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new ServiceUnavailableError('Circuit breaker is OPEN', {
          state: this.state,
          failureCount: this.failureCount
        });
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState(): { state: string; failureCount: number; lastFailureTime: number } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
    };
  }
}

// Graceful degradation helper
export const withGracefulDegradation = <T>(
  primaryOperation: () => Promise<T>,
  fallbackOperation: () => Promise<T> | T,
  fallbackMessage: string = 'Using fallback due to primary operation failure'
): Promise<T> => {
  return primaryOperation().catch(async (error) => {
    console.warn(fallbackMessage, error);
    return await fallbackOperation();
  });
};