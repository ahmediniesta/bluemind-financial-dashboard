/**
 * BlueMind Employee Mapping Utilities
 * Algorithms for matching employee names between billing and payroll systems
 */

import { EMPLOYEE_NAME_MAPPING, HR_STAFF } from './businessRules';

export interface EmployeeMappingResult {
  exactMatch?: string;
  fuzzyMatches: FuzzyMatch[];
  confidence: number;
  shouldAutoMatch: boolean;
}

export interface FuzzyMatch {
  name: string;
  confidence: number;
  reason: string;
}

/**
 * Apply exact employee name mappings from business rules
 */
export const applyExactMapping = (name: string): string => {
  return EMPLOYEE_NAME_MAPPING[name] || name;
};

/**
 * Check if an employee is HR staff (should be excluded from utilization calculations)
 */
export const isHRStaff = (name: string): boolean => {
  const normalizedName = normalizeName(name);
  return HR_STAFF.some(hrName => normalizeName(hrName) === normalizedName);
};

/**
 * Normalize employee names for comparison
 */
export const normalizeName = (name: string): string => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s,]/g, '') // Remove special characters except comma
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/,\s*/g, ', '); // Normalize comma spacing
};

/**
 * Calculate Levenshtein distance between two strings
 */
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // insertion
        matrix[j - 1][i] + 1, // deletion
        matrix[j - 1][i - 1] + substitutionCost // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

/**
 * Calculate similarity score between two names (0-100)
 */
export const calculateNameSimilarity = (name1: string, name2: string): number => {
  if (!name1 || !name2) return 0;
  
  const norm1 = normalizeName(name1);
  const norm2 = normalizeName(name2);
  
  if (norm1 === norm2) return 100;
  
  const maxLength = Math.max(norm1.length, norm2.length);
  if (maxLength === 0) return 0;
  
  const distance = levenshteinDistance(norm1, norm2);
  return Math.round((1 - distance / maxLength) * 100);
};

/**
 * Extract first and last names from a full name
 */
const extractNameParts = (fullName: string): { first: string; last: string; middle?: string } => {
  const normalized = normalizeName(fullName);
  
  // Handle "Last, First" format
  if (normalized.includes(',')) {
    const [last, rest] = normalized.split(',').map(s => s.trim());
    const nameParts = rest.split(' ').filter(Boolean);
    return {
      first: nameParts[0] || '',
      last: last || '',
      middle: nameParts.slice(1).join(' ') || undefined,
    };
  }
  
  // Handle "First Last" or "First Middle Last" format
  const nameParts = normalized.split(' ').filter(Boolean);
  if (nameParts.length === 1) {
    return { first: nameParts[0], last: '' };
  } else if (nameParts.length === 2) {
    return { first: nameParts[0], last: nameParts[1] };
  } else {
    return {
      first: nameParts[0],
      last: nameParts[nameParts.length - 1],
      middle: nameParts.slice(1, -1).join(' '),
    };
  }
};

/**
 * Advanced fuzzy matching with multiple algorithms
 */
export const findEmployeeMatches = (
  targetName: string,
  candidateNames: string[],
  threshold: number = 70
): EmployeeMappingResult => {
  // First, check for exact mapping
  const exactMatch = applyExactMapping(targetName);
  if (exactMatch !== targetName) {
    return {
      exactMatch,
      fuzzyMatches: [],
      confidence: 100,
      shouldAutoMatch: true,
    };
  }
  
  const targetParts = extractNameParts(targetName);
  const fuzzyMatches: FuzzyMatch[] = [];
  
  candidateNames.forEach(candidateName => {
    const candidateParts = extractNameParts(candidateName);
    
    // Calculate various similarity scores
    const fullNameSimilarity = calculateNameSimilarity(targetName, candidateName);
    const lastNameSimilarity = calculateNameSimilarity(targetParts.last, candidateParts.last);
    const firstNameSimilarity = calculateNameSimilarity(targetParts.first, candidateParts.first);
    
    // Check for exact last name match
    const exactLastMatch = normalizeName(targetParts.last) === normalizeName(candidateParts.last);
    
    // Check for first name initial match
    const firstInitialMatch = targetParts.first[0]?.toLowerCase() === candidateParts.first[0]?.toLowerCase();
    
    // Calculate composite confidence score
    let confidence = 0;
    let reason = '';
    
    if (exactLastMatch && firstInitialMatch) {
      confidence = Math.max(85, (lastNameSimilarity + firstNameSimilarity) / 2);
      reason = 'Exact last name + first initial match';
    } else if (exactLastMatch) {
      confidence = Math.max(75, lastNameSimilarity);
      reason = 'Exact last name match';
    } else if (fullNameSimilarity >= 90) {
      confidence = fullNameSimilarity;
      reason = 'High full name similarity';
    } else if (lastNameSimilarity >= 80 && firstNameSimilarity >= 60) {
      confidence = (lastNameSimilarity * 0.7 + firstNameSimilarity * 0.3);
      reason = 'Strong last name + partial first name match';
    } else {
      confidence = fullNameSimilarity;
      reason = 'General name similarity';
    }
    
    if (confidence >= threshold) {
      fuzzyMatches.push({
        name: candidateName,
        confidence: Math.round(confidence),
        reason,
      });
    }
  });
  
  // Sort by confidence
  fuzzyMatches.sort((a, b) => b.confidence - a.confidence);
  
  const topMatch = fuzzyMatches[0];
  const overallConfidence = topMatch?.confidence || 0;
  
  return {
    fuzzyMatches,
    confidence: overallConfidence,
    shouldAutoMatch: overallConfidence >= 95 && fuzzyMatches.length === 1,
  };
};

/**
 * Get all unique employee names from both systems
 */
export const getAllUniqueEmployees = (billingNames: string[], payrollNames: string[]): string[] => {
  const allNames = new Set<string>();
  
  billingNames.forEach(name => {
    const mapped = applyExactMapping(name);
    allNames.add(mapped);
  });
  
  payrollNames.forEach(name => {
    allNames.add(name);
  });
  
  return Array.from(allNames).sort();
};

/**
 * Validate employee matching results
 */
export const validateEmployeeMatching = (
  billingNames: string[],
  payrollNames: string[]
): {
  totalBillingEmployees: number;
  totalPayrollEmployees: number;
  matchedEmployees: number;
  unmatchedBilling: string[];
  unmatchedPayroll: string[];
  matchingRate: number;
} => {
  const matchedBilling = new Set<string>();
  const matchedPayroll = new Set<string>();
  
  billingNames.forEach(billingName => {
    const mapped = applyExactMapping(billingName);
    if (payrollNames.includes(mapped)) {
      matchedBilling.add(billingName);
      matchedPayroll.add(mapped);
    } else {
      // Try fuzzy matching
      const result = findEmployeeMatches(mapped, payrollNames, 85);
      if (result.shouldAutoMatch && result.fuzzyMatches.length > 0) {
        matchedBilling.add(billingName);
        matchedPayroll.add(result.fuzzyMatches[0].name);
      }
    }
  });
  
  const unmatchedBilling = billingNames.filter(name => !matchedBilling.has(name));
  const unmatchedPayroll = payrollNames.filter(name => !matchedPayroll.has(name));
  
  const totalMatched = matchedBilling.size;
  const totalUnique = new Set([...billingNames, ...payrollNames]).size;
  const matchingRate = totalUnique > 0 ? (totalMatched / totalUnique) * 100 : 0;
  
  return {
    totalBillingEmployees: billingNames.length,
    totalPayrollEmployees: payrollNames.length,
    matchedEmployees: totalMatched,
    unmatchedBilling,
    unmatchedPayroll,
    matchingRate: Math.round(matchingRate),
  };
}; 