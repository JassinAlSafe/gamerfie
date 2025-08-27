"use client";

import React, { forwardRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  touched?: boolean;
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, error, touched, value, onFocus, onBlur, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    
    const hasValue = value !== undefined && value !== null && String(value).length > 0;
    const shouldFloatLabel = isFocused || hasValue;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          id={id}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "h-12 pt-6 pb-2 bg-muted/50 border-muted-foreground/20",
            error && touched && "border-destructive focus:border-destructive",
            className
          )}
          {...props}
        />
        <Label 
          htmlFor={id}
          className={cn(
            "absolute left-3 transition-all duration-200 pointer-events-none",
            shouldFloatLabel 
              ? "top-2 text-xs text-muted-foreground" 
              : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
          )}
        >
          {label}
        </Label>
      </div>
    );
  }
);

FloatingInput.displayName = "FloatingInput";

export { FloatingInput };