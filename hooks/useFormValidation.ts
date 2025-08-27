import { useCallback, useMemo } from 'react';

interface ValidationErrors {
  email?: string;
  password?: string;
  username?: string;
  displayName?: string;
}

interface ValidationOptions {
  mode: 'signin' | 'signup';
}

export const useFormValidation = ({ mode }: ValidationOptions) => {
  // Email validation with proper regex
  const validateEmail = useMemo(() => {
    return (email: string): string | undefined => {
      if (!email) return "Email is required";
      if (email.length > 254) return "Email is too long";
      
      // RFC 5322 compliant email regex (simplified but robust)
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      
      if (!emailRegex.test(email)) {
        return "Please enter a valid email address";
      }
      
      return undefined;
    };
  }, []);

  // Password validation with security requirements
  const validatePassword = useMemo(() => {
    return (password: string): string | undefined => {
      if (!password) return "Password is required";
      if (password.length < 8) return "Password must be at least 8 characters";
      if (password.length > 128) return "Password is too long (max 128 characters)";
      
      // Only require complexity for signup
      if (mode === 'signup') {
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        const complexityCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
        
        if (complexityCount < 3) {
          return "Password must contain at least 3 of: lowercase, uppercase, number, special character";
        }
      }
      
      return undefined;
    };
  }, [mode]);

  // Username validation for signup
  const validateUsername = useMemo(() => {
    return (username: string): string | undefined => {
      if (mode !== 'signup') return undefined;
      
      if (!username) return "Username is required";
      if (username.length < 3) return "Username must be at least 3 characters";
      if (username.length > 20) return "Username must be less than 20 characters";
      
      // Username can only contain letters, numbers, underscores, and hyphens
      const usernameRegex = /^[a-zA-Z0-9_-]+$/;
      if (!usernameRegex.test(username)) {
        return "Username can only contain letters, numbers, underscores, and hyphens";
      }
      
      // Can't start or end with special characters
      if (username.startsWith('_') || username.startsWith('-') || 
          username.endsWith('_') || username.endsWith('-')) {
        return "Username cannot start or end with underscores or hyphens";
      }
      
      return undefined;
    };
  }, [mode]);

  // Display name validation for signup
  const validateDisplayName = useMemo(() => {
    return (displayName: string): string | undefined => {
      if (mode !== 'signup') return undefined;
      
      if (displayName && displayName.length > 50) {
        return "Display name must be less than 50 characters";
      }
      
      return undefined;
    };
  }, [mode]);

  // Main validation function
  const validateField = useCallback((fieldName: string, value: string): string | undefined => {
    switch (fieldName) {
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      case 'username':
        return validateUsername(value);
      case 'displayName':
        return validateDisplayName(value);
      default:
        return undefined;
    }
  }, [validateEmail, validatePassword, validateUsername, validateDisplayName]);

  // Validate entire form
  const validateForm = useCallback((formData: Record<string, string>): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    Object.entries(formData).forEach(([fieldName, value]) => {
      const error = validateField(fieldName, value);
      if (error) {
        errors[fieldName as keyof ValidationErrors] = error;
      }
    });
    
    return errors;
  }, [validateField]);

  // Check if form is valid
  const isFormValid = useCallback((formData: Record<string, string>): boolean => {
    const errors = validateForm(formData);
    return Object.keys(errors).length === 0;
  }, [validateForm]);

  return {
    validateField,
    validateForm,
    isFormValid,
    validateEmail,
    validatePassword,
    validateUsername,
    validateDisplayName
  };
};