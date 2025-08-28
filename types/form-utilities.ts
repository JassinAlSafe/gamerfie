/**
 * Generic Form Utilities with Type Safety
 * Provides reusable, type-safe patterns for form handling
 */

// Generic form state structure
export interface FormState<T extends Record<string, any>> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Record<keyof T, boolean>;
  isValid: boolean;
  isDirty: boolean;
}

// Form validation result
export type ValidationResult<T> = {
  [K in keyof T]?: string;
};

// Form field validator function type
export type FieldValidator<T, K extends keyof T> = (
  value: T[K],
  allValues: T
) => string | undefined;

// Form validation rules
export type ValidationRules<T extends Record<string, any>> = {
  [K in keyof T]?: FieldValidator<T, K>[];
};

// Form submission result
export type FormSubmissionResult<TData = void> = 
  | { success: true; data: TData }
  | { success: false; error: string; fieldErrors?: Partial<Record<string, string>> };

// Generic form hook return type
export interface UseFormReturn<T extends Record<string, any>, TResult = void> {
  // State
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  
  // Actions
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setError: <K extends keyof T>(field: K, error: string | undefined) => void;
  setTouched: <K extends keyof T>(field: K, touched?: boolean) => void;
  validateField: <K extends keyof T>(field: K) => string | undefined;
  validateForm: () => boolean;
  handleSubmit: (onSubmit: (values: T) => Promise<FormSubmissionResult<TResult>>) => (e: React.FormEvent) => Promise<void>;
  reset: (newValues?: Partial<T>) => void;
  clearErrors: () => void;
}

// Common validation functions
export const validators = {
  required: <T>(message: string = 'This field is required'): FieldValidator<T, any> =>
    (value) => {
      if (value === null || value === undefined || value === '') {
        return message;
      }
      return undefined;
    },

  email: <T>(message: string = 'Please enter a valid email address'): FieldValidator<T, any> =>
    (value) => {
      if (!value) return undefined;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(String(value)) ? undefined : message;
    },

  minLength: <T>(min: number, message?: string): FieldValidator<T, any> =>
    (value) => {
      if (!value) return undefined;
      const str = String(value);
      return str.length >= min ? undefined : (message || `Must be at least ${min} characters`);
    },

  maxLength: <T>(max: number, message?: string): FieldValidator<T, any> =>
    (value) => {
      if (!value) return undefined;
      const str = String(value);
      return str.length <= max ? undefined : (message || `Must be no more than ${max} characters`);
    },

  pattern: <T>(regex: RegExp, message: string): FieldValidator<T, any> =>
    (value) => {
      if (!value) return undefined;
      return regex.test(String(value)) ? undefined : message;
    },

  custom: <T, K extends keyof T>(fn: (value: T[K], allValues: T) => boolean, message: string): FieldValidator<T, K> =>
    (value, allValues) => {
      return fn(value, allValues) ? undefined : message;
    }
};

// Type-safe form field props
export interface FormFieldProps<T, K extends keyof T> {
  name: K;
  value: T[K];
  error?: string;
  touched: boolean;
  onChange: (value: T[K]) => void;
  onBlur: () => void;
}

// Helper to create typed form field props
export function createFieldProps<T extends Record<string, any>, K extends keyof T>(
  form: UseFormReturn<T>,
  field: K
): FormFieldProps<T, K> {
  return {
    name: field,
    value: form.values[field],
    error: form.errors[field],
    touched: form.touched[field],
    onChange: (value: T[K]) => form.setValue(field, value),
    onBlur: () => form.setTouched(field, true)
  };
}

// Type-safe event handlers
export type InputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;
export type SelectChangeHandler = (value: string) => void;
export type CheckboxChangeHandler = (checked: boolean) => void;

// Helper to create input change handlers
export function createInputHandler<T extends Record<string, any>, K extends keyof T>(
  form: UseFormReturn<T>,
  field: K
): InputChangeHandler {
  return (e) => {
    const { type, checked, value } = e.target;
    form.setValue(field, (type === 'checkbox' ? checked : value) as T[K]);
  };
}

// Form validation state helper
export function getValidationState<T extends Record<string, any>>(
  values: T,
  rules: ValidationRules<T>
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } {
  const errors: Partial<Record<keyof T, string>> = {};
  let isValid = true;

  for (const field in rules) {
    const fieldRules = rules[field];
    if (!fieldRules) continue;

    for (const validator of fieldRules) {
      const error = validator(values[field], values);
      if (error) {
        errors[field] = error;
        isValid = false;
        break; // Stop at first error for this field
      }
    }
  }

  return { isValid, errors };
}