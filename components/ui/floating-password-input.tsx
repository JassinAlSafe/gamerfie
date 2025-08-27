"use client";

import React, { forwardRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingPasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  touched?: boolean;
}

const FloatingPasswordInput = forwardRef<HTMLInputElement, FloatingPasswordInputProps>(
  ({ className, label, error, touched, value, onFocus, onBlur, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
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
          type={showPassword ? "text" : "password"}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "h-12 pt-6 pb-2 pr-12 bg-muted/50 border-muted-foreground/20",
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
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-muted/50 rounded-md transition-colors duration-200"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors duration-200" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors duration-200" />
          )}
        </button>
      </div>
    );
  }
);

FloatingPasswordInput.displayName = "FloatingPasswordInput";

export { FloatingPasswordInput };