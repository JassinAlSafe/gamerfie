"use client";

import { SparklesCore } from "@/components/ui/sparkles";

export function BackgroundEffects() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <SparklesCore
        background="transparent"
        minSize={0.6}
        maxSize={1.4}
        particleDensity={100}
        className="w-full h-full"
        particleColor="#FFFFFF"
      />
    </div>
  );
}
