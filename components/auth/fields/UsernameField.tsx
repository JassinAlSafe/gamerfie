"use client";

import { useEffect, useState } from 'react';
import { FloatingInput } from '@/components/ui/floating-input';
import { Loader2, Check, UserCheck } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface UsernameFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
}

export function UsernameField({ 
  value, 
  onChange, 
  onBlur, 
  error, 
  touched, 
  disabled 
}: UsernameFieldProps) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  
  const debouncedUsername = useDebounce(value, 600);

  // Username availability check - debounced and efficient
  useEffect(() => {
    if (debouncedUsername && debouncedUsername.length >= 3 && !error) {
      setIsChecking(true);
      
      // Simulate API call - replace with actual endpoint
      setTimeout(() => {
        const unavailable = ['admin', 'user', 'test', 'demo', 'root', 'support'];
        const available = !unavailable.includes(debouncedUsername.toLowerCase());
        setIsAvailable(available);
        setIsChecking(false);
      }, 500);
    } else {
      setIsAvailable(null);
      setIsChecking(false);
    }
  }, [debouncedUsername, error]);

  // Status indicator - clear visual feedback
  const renderStatusIcon = () => {
    if (isChecking) {
      return <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-blue-500" />;
    }

    if (!error && isAvailable === true) {
      return (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-in zoom-in-50 duration-200">
          <Check className="h-4 w-4 text-green-500" />
        </div>
      );
    }

    if (!error && isAvailable === false) {
      return (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-in zoom-in-50 duration-200">
          <UserCheck className="h-4 w-4 text-red-500" />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="grid gap-2">
      <div className="relative">
        <FloatingInput
          id="username"
          name="username"
          label="Username"
          type="text"
          autoCapitalize="none"
          autoComplete="username"
          autoCorrect="off"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          error={error}
          touched={touched}
          className="input-custom"
          required
        />
        {renderStatusIcon()}
      </div>
      
      {error && touched && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      
      {/* Availability feedback */}
      {!error && isAvailable === false && (
        <p className="text-xs text-red-600 dark:text-red-400 animate-in slide-in-from-top-2 duration-200">
          Username is already taken
        </p>
      )}
      
      {!error && isAvailable === true && (
        <p className="text-xs text-green-600 dark:text-green-400 animate-in slide-in-from-top-2 duration-200">
          Username is available! ✨
        </p>
      )}
    </div>
  );
}