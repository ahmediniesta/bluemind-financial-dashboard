/**
 * Enterprise-grade data validation system
 * Provides schema validation, data integrity checks, and security validations
 */

import { 
  DataValidationError
} from './errors';

// Base validator interface
export interface Validator<T> {
  validate(value: T): ValidationResult;
  name: string;
  description: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

// Schema definition for complex validation
export interface ValidationSchema {
  fields: Record<string, FieldValidator>;
  rules?: BusinessRule[];
  options?: ValidationOptions;
}

export interface FieldValidator {
  required?: boolean;
  type: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'array' | 'object';
  validators?: Validator<any>[];
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  transform?: (value: any) => any;
  sanitize?: (value: any) => any;
}

export interface BusinessRule {
  name: string;
  description: string;
  validator: (data: any) => boolean;
  errorMessage: string;
}

export interface ValidationOptions {
  allowUnknownFields?: boolean;
  stripUnknownFields?: boolean;
  abortEarly?: boolean;
  context?: Record<string, any>;
}

// Core validation engine
export class ValidationEngine {
  private static instance: ValidationEngine;
  private validators: Map<string, Validator<any>> = new Map();
  private schemas: Map<string, ValidationSchema> = new Map();

  static getInstance(): ValidationEngine {
    if (!ValidationEngine.instance) {
      ValidationEngine.instance = new ValidationEngine();
    }
    return ValidationEngine.instance;
  }

  // Register custom validators
  registerValidator<T>(validator: Validator<T>): void {
    this.validators.set(validator.name, validator);
  }

  // Register validation schemas
  registerSchema(name: string, schema: ValidationSchema): void {
    this.schemas.set(name, schema);
  }

  // Validate data against schema
  validateSchema(schemaName: string, data: any): ValidationResult {
    const schema = this.schemas.get(schemaName);
    if (!schema) {
      throw new DataValidationError(
        `Schema '${schemaName}' not found`,
        'Invalid validation schema requested',
        { schemaName }
      );
    }

    return this.validate(data, schema);
  }

  // Validate data against provided schema
  validate(data: any, schema: ValidationSchema): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const { fields, rules = [], options = {} } = schema;

    // Validate each field
    for (const [fieldName, fieldValidator] of Object.entries(fields)) {
      const fieldResult = this.validateField(fieldName, data[fieldName], fieldValidator, data);
      errors.push(...fieldResult.errors);
      warnings.push(...fieldResult.warnings);

      if (options.abortEarly && fieldResult.errors.length > 0) {
        break;
      }
    }

    // Check for unknown fields
    if (!options.allowUnknownFields) {
      const unknownFields = Object.keys(data).filter(key => !fields[key]);
      unknownFields.forEach(field => {
        if (options.stripUnknownFields) {
          delete data[field];
        } else {
          warnings.push({
            field,
            message: `Unknown field '${field}' found`,
            code: 'UNKNOWN_FIELD',
            value: data[field]
          });
        }
      });
    }

    // Apply business rules
    rules.forEach(rule => {
      try {
        if (!rule.validator(data)) {
          errors.push({
            field: 'businessRule',
            message: rule.errorMessage,
            code: rule.name,
            value: data
          });
        }
      } catch (error) {
        errors.push({
          field: 'businessRule',
          message: `Business rule '${rule.name}' failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: 'BUSINESS_RULE_ERROR',
          value: data
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Validate individual field
  private validateField(
    fieldName: string,
    value: any,
    fieldValidator: FieldValidator,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _context: any
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check required fields
    if (fieldValidator.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field: fieldName,
        message: `Field '${fieldName}' is required`,
        code: 'REQUIRED_FIELD',
        value
      });
      return { isValid: false, errors, warnings };
    }

    // Skip validation for optional empty fields
    if (!fieldValidator.required && (value === undefined || value === null || value === '')) {
      return { isValid: true, errors, warnings };
    }

    // Apply transformation
    if (fieldValidator.transform) {
      value = fieldValidator.transform(value);
    }

    // Type validation
    const typeValidation = this.validateType(fieldName, value, fieldValidator.type);
    errors.push(...typeValidation.errors);
    warnings.push(...typeValidation.warnings);

    // Range validation
    if (fieldValidator.min !== undefined || fieldValidator.max !== undefined) {
      const rangeValidation = this.validateRange(fieldName, value, fieldValidator.min, fieldValidator.max);
      errors.push(...rangeValidation.errors);
    }

    // Pattern validation
    if (fieldValidator.pattern && typeof value === 'string') {
      if (!fieldValidator.pattern.test(value)) {
        errors.push({
          field: fieldName,
          message: `Field '${fieldName}' does not match required pattern`,
          code: 'PATTERN_MISMATCH',
          value
        });
      }
    }

    // Enum validation
    if (fieldValidator.enum && !fieldValidator.enum.includes(value)) {
      errors.push({
        field: fieldName,
        message: `Field '${fieldName}' must be one of: ${fieldValidator.enum.join(', ')}`,
        code: 'ENUM_VIOLATION',
        value
      });
    }

    // Custom validators
    if (fieldValidator.validators) {
      fieldValidator.validators.forEach(validator => {
        const result = validator.validate(value);
        errors.push(...result.errors);
        warnings.push(...result.warnings);
      });
    }

    // Apply sanitization
    if (fieldValidator.sanitize) {
      value = fieldValidator.sanitize(value);
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  // Type validation
  private validateType(fieldName: string, value: any, expectedType: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    switch (expectedType) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push({
            field: fieldName,
            message: `Field '${fieldName}' must be a string`,
            code: 'TYPE_MISMATCH',
            value
          });
        }
        break;

      case 'number':
        if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
          errors.push({
            field: fieldName,
            message: `Field '${fieldName}' must be a valid number`,
            code: 'TYPE_MISMATCH',
            value
          });
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push({
            field: fieldName,
            message: `Field '${fieldName}' must be a boolean`,
            code: 'TYPE_MISMATCH',
            value
          });
        }
        break;

      case 'date': {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          errors.push({
            field: fieldName,
            message: `Field '${fieldName}' must be a valid date`,
            code: 'TYPE_MISMATCH',
            value
          });
        }
        break;
      }

      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof value !== 'string' || !emailRegex.test(value)) {
          errors.push({
            field: fieldName,
            message: `Field '${fieldName}' must be a valid email address`,
            code: 'TYPE_MISMATCH',
            value
          });
        }
        break;
      }

      case 'array':
        if (!Array.isArray(value)) {
          errors.push({
            field: fieldName,
            message: `Field '${fieldName}' must be an array`,
            code: 'TYPE_MISMATCH',
            value
          });
        }
        break;

      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          errors.push({
            field: fieldName,
            message: `Field '${fieldName}' must be an object`,
            code: 'TYPE_MISMATCH',
            value
          });
        }
        break;

      default:
        warnings.push({
          field: fieldName,
          message: `Unknown type '${expectedType}' for field '${fieldName}'`,
          code: 'UNKNOWN_TYPE',
          value
        });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  // Range validation
  private validateRange(fieldName: string, value: any, min?: number, max?: number): ValidationResult {
    const errors: ValidationError[] = [];

    if (typeof value === 'number') {
      if (min !== undefined && value < min) {
        errors.push({
          field: fieldName,
          message: `Field '${fieldName}' must be at least ${min}`,
          code: 'MIN_VALUE',
          value
        });
      }
      if (max !== undefined && value > max) {
        errors.push({
          field: fieldName,
          message: `Field '${fieldName}' must be at most ${max}`,
          code: 'MAX_VALUE',
          value
        });
      }
    } else if (typeof value === 'string') {
      if (min !== undefined && value.length < min) {
        errors.push({
          field: fieldName,
          message: `Field '${fieldName}' must be at least ${min} characters`,
          code: 'MIN_LENGTH',
          value
        });
      }
      if (max !== undefined && value.length > max) {
        errors.push({
          field: fieldName,
          message: `Field '${fieldName}' must be at most ${max} characters`,
          code: 'MAX_LENGTH',
          value
        });
      }
    } else if (Array.isArray(value)) {
      if (min !== undefined && value.length < min) {
        errors.push({
          field: fieldName,
          message: `Field '${fieldName}' must have at least ${min} items`,
          code: 'MIN_ITEMS',
          value
        });
      }
      if (max !== undefined && value.length > max) {
        errors.push({
          field: fieldName,
          message: `Field '${fieldName}' must have at most ${max} items`,
          code: 'MAX_ITEMS',
          value
        });
      }
    }

    return { isValid: errors.length === 0, errors, warnings: [] };
  }
}

// Built-in validators
export const commonValidators = {
  // Financial validators
  currency: {
    name: 'currency',
    description: 'Validates currency amounts',
    validate: (value: number): ValidationResult => {
      const errors: ValidationError[] = [];
      
      if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
        errors.push({
          field: 'currency',
          message: 'Must be a valid number',
          code: 'INVALID_CURRENCY',
          value
        });
      } else if (value < 0) {
        errors.push({
          field: 'currency',
          message: 'Currency amount cannot be negative',
          code: 'NEGATIVE_CURRENCY',
          value
        });
      } else if (value > 1000000) {
        errors.push({
          field: 'currency',
          message: 'Currency amount seems unusually high',
          code: 'HIGH_CURRENCY',
          value
        });
      }
      
      return { isValid: errors.length === 0, errors, warnings: [] };
    }
  },

  // Hours validator
  hours: {
    name: 'hours',
    description: 'Validates work hours',
    validate: (value: number): ValidationResult => {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];
      
      if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
        errors.push({
          field: 'hours',
          message: 'Must be a valid number',
          code: 'INVALID_HOURS',
          value
        });
      } else if (value < 0) {
        errors.push({
          field: 'hours',
          message: 'Hours cannot be negative',
          code: 'NEGATIVE_HOURS',
          value
        });
      } else if (value > 24) {
        errors.push({
          field: 'hours',
          message: 'Hours cannot exceed 24 per day',
          code: 'EXCESSIVE_HOURS',
          value
        });
      } else if (value > 12) {
        warnings.push({
          field: 'hours',
          message: 'Hours seem high for a single session',
          code: 'HIGH_HOURS',
          value
        });
      }
      
      return { isValid: errors.length === 0, errors, warnings };
    }
  },

  // Employee name validator
  employeeName: {
    name: 'employeeName',
    description: 'Validates employee names',
    validate: (value: string): ValidationResult => {
      const errors: ValidationError[] = [];
      
      if (typeof value !== 'string' || value.trim().length === 0) {
        errors.push({
          field: 'employeeName',
          message: 'Employee name is required',
          code: 'INVALID_NAME',
          value
        });
      } else if (value.length < 2) {
        errors.push({
          field: 'employeeName',
          message: 'Employee name must be at least 2 characters',
          code: 'NAME_TOO_SHORT',
          value
        });
      } else if (value.length > 50) {
        errors.push({
          field: 'employeeName',
          message: 'Employee name must be less than 50 characters',
          code: 'NAME_TOO_LONG',
          value
        });
      } else if (!/^[a-zA-Z\s,.-]+$/.test(value)) {
        errors.push({
          field: 'employeeName',
          message: 'Employee name contains invalid characters',
          code: 'INVALID_NAME_CHARS',
          value
        });
      }
      
      return { isValid: errors.length === 0, errors, warnings: [] };
    }
  },

  // Date range validator
  dateRange: {
    name: 'dateRange',
    description: 'Validates date ranges',
    validate: (value: { start: Date; end: Date }): ValidationResult => {
      const errors: ValidationError[] = [];
      
      if (!value.start || !value.end) {
        errors.push({
          field: 'dateRange',
          message: 'Both start and end dates are required',
          code: 'MISSING_DATE',
          value
        });
      } else if (value.start > value.end) {
        errors.push({
          field: 'dateRange',
          message: 'Start date must be before end date',
          code: 'INVALID_DATE_ORDER',
          value
        });
      } else if (value.end.getTime() - value.start.getTime() > 365 * 24 * 60 * 60 * 1000) {
        errors.push({
          field: 'dateRange',
          message: 'Date range cannot exceed 365 days',
          code: 'RANGE_TOO_LONG',
          value
        });
      }
      
      return { isValid: errors.length === 0, errors, warnings: [] };
    }
  }
};

// Data integrity validators
export const dataIntegrityValidators = {
  // Cross-reference validation
  crossReference: (
    primaryData: any[],
    referenceData: any[],
    primaryKey: string,
    referenceKey: string
  ): ValidationResult => {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    const referenceKeys = new Set(referenceData.map(item => item[referenceKey]));
    
    primaryData.forEach((item, index) => {
      const key = item[primaryKey];
      if (key && !referenceKeys.has(key)) {
        warnings.push({
          field: `${primaryKey}[${index}]`,
          message: `Reference not found: ${key}`,
          code: 'REFERENCE_NOT_FOUND',
          value: key
        });
      }
    });
    
    return { isValid: errors.length === 0, errors, warnings };
  },

  // Duplicate detection
  duplicateDetection: (
    data: any[],
    keyFields: string[]
  ): ValidationResult => {
    const errors: ValidationError[] = [];
    const seen = new Set();
    
    data.forEach((item, index) => {
      const key = keyFields.map(field => item[field]).join('|');
      if (seen.has(key)) {
        errors.push({
          field: `duplicate[${index}]`,
          message: `Duplicate record found`,
          code: 'DUPLICATE_RECORD',
          value: item
        });
      } else {
        seen.add(key);
      }
    });
    
    return { isValid: errors.length === 0, errors, warnings: [] };
  },

  // Data completeness check
  completenessCheck: (
    data: any[],
    requiredFields: string[]
  ): ValidationResult => {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    requiredFields.forEach(field => {
      const missingCount = data.filter(item => 
        item[field] === undefined || item[field] === null || item[field] === ''
      ).length;
      
      if (missingCount > 0) {
        const percentage = (missingCount / data.length) * 100;
        
        if (percentage > 50) {
          errors.push({
            field,
            message: `Field '${field}' is missing in ${percentage.toFixed(1)}% of records`,
            code: 'HIGH_MISSING_DATA',
            value: percentage
          });
        } else if (percentage > 10) {
          warnings.push({
            field,
            message: `Field '${field}' is missing in ${percentage.toFixed(1)}% of records`,
            code: 'MODERATE_MISSING_DATA',
            value: percentage
          });
        }
      }
    });
    
    return { isValid: errors.length === 0, errors, warnings };
  }
};

// Security validators
export const securityValidators = {
  // SQL injection prevention
  sqlInjection: {
    name: 'sqlInjection',
    description: 'Prevents SQL injection attacks',
    validate: (value: string): ValidationResult => {
      const errors: ValidationError[] = [];
      
      const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
        /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
        /('|(\\')|(;)|(--)|(\|)|(\*)|(%)|(<)|(>)|(\?)|(\[)|(\])|(\{)|(\})|(\$)|(\+)|(\^))/g
      ];
      
      sqlPatterns.forEach(pattern => {
        if (pattern.test(value)) {
          errors.push({
            field: 'sqlInjection',
            message: 'Input contains potentially malicious SQL patterns',
            code: 'SQL_INJECTION_DETECTED',
            value
          });
        }
      });
      
      return { isValid: errors.length === 0, errors, warnings: [] };
    }
  },

  // XSS prevention
  xss: {
    name: 'xss',
    description: 'Prevents cross-site scripting attacks',
    validate: (value: string): ValidationResult => {
      const errors: ValidationError[] = [];
      
      const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /javascript:/gi,
        /onload\s*=/gi,
        /onerror\s*=/gi,
        /onclick\s*=/gi,
        /onmouseover\s*=/gi
      ];
      
      xssPatterns.forEach(pattern => {
        if (pattern.test(value)) {
          errors.push({
            field: 'xss',
            message: 'Input contains potentially malicious scripts',
            code: 'XSS_DETECTED',
            value
          });
        }
      });
      
      return { isValid: errors.length === 0, errors, warnings: [] };
    }
  },

  // Path traversal prevention
  pathTraversal: {
    name: 'pathTraversal',
    description: 'Prevents path traversal attacks',
    validate: (value: string): ValidationResult => {
      const errors: ValidationError[] = [];
      
      const pathPatterns = [
        /\.\./g,
        /\.\//g,
        /~/g,
        /\\\\/g
      ];
      
      pathPatterns.forEach(pattern => {
        if (pattern.test(value)) {
          errors.push({
            field: 'pathTraversal',
            message: 'Input contains potentially malicious path patterns',
            code: 'PATH_TRAVERSAL_DETECTED',
            value
          });
        }
      });
      
      return { isValid: errors.length === 0, errors, warnings: [] };
    }
  }
};

// Initialize validation engine with common validators
export const validationEngine = ValidationEngine.getInstance();

// Register common validators with proper typing
Object.values(commonValidators).forEach(validator => {
  validationEngine.registerValidator(validator as any);
});

Object.values(securityValidators).forEach(validator => {
  validationEngine.registerValidator(validator as any);
});

// Export utility functions
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const validateAndSanitize = (value: any, validators: Validator<any>[]): { 
  value: any; 
  result: ValidationResult; 
} => {
  let sanitizedValue = value;
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationWarning[] = [];
  
  validators.forEach(validator => {
    const result = validator.validate(sanitizedValue);
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  });
  
  // Apply sanitization if it's a string
  if (typeof sanitizedValue === 'string') {
    sanitizedValue = sanitizeInput(sanitizedValue);
  }
  
  return {
    value: sanitizedValue,
    result: {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    }
  };
};