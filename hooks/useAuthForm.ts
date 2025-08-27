"use client";

import { useState, useCallback } from 'react';

// Form data interface - exactly what the form needs
interface AuthFormData {
  email: string;
  password: string;
  username: string;
  displayName: string;
  rememberMe: boolean;
}

// Field validation rules - simple and obvious
interface FieldValidators {
  email: (value: string) => string;
  password: (value: string, mode: 'signin' | 'signup') => string;
  username: (value: string) => string;
  displayName: (value: string) => string;
}

// The inevitable form state hook
export function useAuthForm(mode: 'signin' | 'signup') {
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    username: '',
    displayName: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AuthFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof AuthFormData, boolean>>>({});

  // Validation rules - obvious and predictable
  const validators: FieldValidators = {
    email: (value: string) => {
      if (!value) return 'Email is required';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Please enter a valid email';
      return '';
    },

    password: (value: string, mode: 'signin' | 'signup') => {
      if (!value) return 'Password is required';
      if (mode === 'signup' && value.length < 8) return 'Password must be at least 8 characters';
      return '';
    },

    username: (value: string) => {
      if (mode === 'signup' && !value) return 'Username is required';
      if (mode === 'signup' && value.length < 3) return 'Username must be at least 3 characters';
      return '';
    },

    displayName: (value: string) => {
      if (mode === 'signup' && !value) return 'Display name is required';
      return '';
    }
  };

  // Update field value - inevitable implementation
  const updateField = useCallback((field: keyof AuthFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Mark field as touched and validate
  const touchField = useCallback((field: keyof AuthFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (field in validators) {
      const value = formData[field] as string;
      const error = field === 'password' 
        ? validators[field](value, mode)
        : validators[field as keyof Omit<FieldValidators, 'password'>](value);
      
      setErrors(prev => ({ ...prev, [field]: error || undefined }));
    }
  }, [formData, mode]);

  // Validate all fields - simple and predictable
  const validateAll = useCallback(() => {
    const fieldsToValidate: (keyof AuthFormData)[] = mode === 'signup' 
      ? ['email', 'password', 'username', 'displayName']
      : ['email', 'password'];

    const newErrors: Partial<Record<keyof AuthFormData, string>> = {};
    let isValid = true;

    for (const field of fieldsToValidate) {
      if (field in validators) {
        const value = formData[field] as string;
        const error = field === 'password'
          ? validators[field](value, mode)
          : validators[field as keyof Omit<FieldValidators, 'password'>](value);
        
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    return { isValid, errors: newErrors };
  }, [formData, mode]);

  // Clear all errors - when auth error is fixed
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    touched,
    updateField,
    touchField,
    validateAll,
    clearErrors,
  };
}