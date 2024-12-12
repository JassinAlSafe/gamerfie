import React from "react";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 w-8 border-2',
  md: 'h-16 w-16 border-3',
  lg: 'h-32 w-32 border-4'
};

export default function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  return (
    <div 
      className={`animate-spin rounded-full border-t-purple-500 border-b-purple-500 border-transparent ${sizeClasses[size]}`}
      role="status"
      aria-label="Loading"
    />
  );
}
