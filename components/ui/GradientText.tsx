
import { ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
}

export const GradientText = ({ children, className = '' }: GradientTextProps) => (
  <span className={`bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 ${className}`}>
    {children}
  </span>
);