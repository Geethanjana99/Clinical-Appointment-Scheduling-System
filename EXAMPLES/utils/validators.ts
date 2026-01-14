// src/utils/validators.ts

/**
 * Form validation utility functions
 */

/**
 * Validate email format
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { 
  isValid: boolean; 
  error?: string;
  strength?: 'weak' | 'medium' | 'strong';
} => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strengthScore = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (strengthScore >= 4) strength = 'strong';
  else if (strengthScore >= 3) strength = 'medium';
  
  if (strengthScore < 3) {
    return {
      isValid: false,
      error: 'Password must contain uppercase, lowercase, number, and special character',
      strength,
    };
  }
  
  return { isValid: true, strength };
};

/**
 * Validate phone number
 */
export const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length < 10) {
    return { isValid: false, error: 'Phone number must be at least 10 digits' };
  }
  
  if (digitsOnly.length > 15) {
    return { isValid: false, error: 'Phone number is too long' };
  }
  
  return { isValid: true };
};

/**
 * Validate name (first name, last name, etc.)
 */
export const validateName = (name: string, fieldName: string = 'Name'): { 
  isValid: boolean; 
  error?: string;
} => {
  if (!name || !name.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters long` };
  }
  
  if (name.trim().length > 100) {
    return { isValid: false, error: `${fieldName} must not exceed 100 characters` };
  }
  
  // Only allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, error: `${fieldName} contains invalid characters` };
  }
  
  return { isValid: true };
};

/**
 * Validate date of birth (must be in the past and within reasonable age range)
 */
export const validateDateOfBirth = (dob: string): { isValid: boolean; error?: string } => {
  if (!dob) {
    return { isValid: false, error: 'Date of birth is required' };
  }
  
  const birthDate = new Date(dob);
  const today = new Date();
  
  if (isNaN(birthDate.getTime())) {
    return { isValid: false, error: 'Please enter a valid date' };
  }
  
  if (birthDate >= today) {
    return { isValid: false, error: 'Date of birth must be in the past' };
  }
  
  // Calculate age
  const age = today.getFullYear() - birthDate.getFullYear();
  
  if (age < 0 || age > 150) {
    return { isValid: false, error: 'Please enter a valid date of birth' };
  }
  
  return { isValid: true };
};

/**
 * Validate file upload
 */
export const validateFile = (
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  } = {}
): { isValid: boolean; error?: string } => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
  } = options;
  
  if (!file) {
    return { isValid: false, error: 'File is required' };
  }
  
  if (file.size > maxSize) {
    const sizeMB = (maxSize / (1024 * 1024)).toFixed(0);
    return { isValid: false, error: `File size must not exceed ${sizeMB}MB` };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File type not supported' };
  }
  
  return { isValid: true };
};

/**
 * Validate required field
 */
export const validateRequired = (value: any, fieldName: string = 'Field'): { 
  isValid: boolean; 
  error?: string;
} => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  if (typeof value === 'string' && !value.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  return { isValid: true };
};

/**
 * Validate form (validates multiple fields at once)
 */
export const validateForm = (
  values: Record<string, any>,
  rules: Record<string, (value: any) => { isValid: boolean; error?: string }>
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  Object.keys(rules).forEach((field) => {
    const result = rules[field](values[field]);
    if (!result.isValid && result.error) {
      errors[field] = result.error;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
