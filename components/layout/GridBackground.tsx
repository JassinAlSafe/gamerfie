
import { ReactNode } from 'react';

interface GridBackgroundProps {
  children: ReactNode;
}

export const GridBackground = ({ children }: GridBackgroundProps) => (
  <div className="min-h-screen w-full bg-black bg-grid-white/[0.2] relative">
    <div className="absolute pointer-events-none inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
    <div className="relative z-10 container mx-auto px-4 py-16">
      {children}
    </div>
  </div>
);