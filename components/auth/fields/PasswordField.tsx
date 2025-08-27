"use client";

import { FloatingPasswordInput } from '@/components/ui/floating-password-input';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  mode: 'signin' | 'signup';
  authError?: string | null;
}

// Password strength calculation - simple and clear
function getPasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
}

export function PasswordField({ 
  value, 
  onChange, 
  onBlur, 
  error, 
  touched, 
  disabled, 
  mode,
  authError 
}: PasswordFieldProps) {
  const strength = mode === 'signup' ? getPasswordStrength(value) : 0;

  // Password strength indicator - visual and intuitive
  const renderStrengthIndicator = () => {
    if (mode !== 'signup' || !value) return null;

    return (
      <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-2 w-full rounded-full transition-all duration-300',
                i < strength
                  ? strength <= 2
                    ? 'bg-red-500 shadow-sm'
                    : strength <= 3
                    ? 'bg-yellow-500 shadow-sm'
                    : 'bg-green-500 shadow-sm'
                  : 'bg-muted'
              )}
            />
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <p className={cn(
            'text-xs font-medium transition-colors duration-200',
            strength <= 2 && 'text-red-600 dark:text-red-400',
            strength === 3 && 'text-yellow-600 dark:text-yellow-400',
            strength >= 4 && 'text-green-600 dark:text-green-400'
          )}>
            {strength <= 2 && '🔴 Weak password'}
            {strength === 3 && '🟡 Good password'}
            {strength >= 4 && '🟢 Strong password'}
          </p>
          
          {strength >= 4 && (
            <div className="animate-in zoom-in-50 duration-200">
              <Check className="h-3 w-3 text-green-500" />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid gap-2">
      <FloatingPasswordInput
        id="password"
        name="password"
        label="Password"
        autoCapitalize="none"
        autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
        autoCorrect="off"
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        error={error || (authError ? 'Check your password' : '')}
        touched={touched}
        className={cn(
          'input-custom',
          authError && 'border-red-500 focus:border-red-500'
        )}
        required
      />
      
      {error && touched && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      
      {renderStrengthIndicator()}
    </div>
  );
}