"use client";

import { Suspense, lazy } from "react";
import { SparklesCore } from "@/components/ui/sparkles";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { ClientOnly } from "@/components/ui/client-only";
import { HeroSection } from "./sections/HeroSection";
import homeData from "@/app/data/home.json";
import { HomePageData } from "@/types/home";

// Lazy load sections that appear later in the page for better initial load performance
const GameShowcase = lazy(() => import("./sections/GameShowcase").then(m => ({ default: m.GameShowcase })));
const TestimonialsSection = lazy(() => import("./sections/TestimonialsSection").then(m => ({ default: m.TestimonialsSection })));
const FeaturesSection = lazy(() => import("./sections/FeaturesSection").then(m => ({ default: m.FeaturesSection })));
const FinalSection = lazy(() => import("./sections/FinalSection").then(m => ({ default: m.FinalSection })));

export function UnauthenticatedHome() {
  const typedHomeData = homeData as HomePageData;
  
  return (
    <div className="relative min-h-full bg-black overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent)]" />
        <ClientOnly>
          <SparklesCore
            background="transparent"
            minSize={0.4}
            maxSize={1.4}
            particleDensity={50}
            className="w-full h-full"
            particleColor="#8B5CF6"
          />
        </ClientOnly>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <TracingBeam className="pt-20 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 lg:space-y-16">
            <Suspense fallback={<div className="h-[calc(100vh-64px)] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div></div>}>
              <HeroSection stats={typedHomeData.stats} />
            </Suspense>
            <Suspense fallback={<div className="h-64 bg-white/5 rounded-lg animate-pulse"></div>}>
              <GameShowcase />
            </Suspense>
            <Suspense fallback={<div className="h-48 bg-white/5 rounded-lg animate-pulse"></div>}>
              <TestimonialsSection />
            </Suspense>
            <Suspense fallback={<div className="h-96 bg-white/5 rounded-lg animate-pulse"></div>}>
              <FeaturesSection features={typedHomeData.features} />
            </Suspense>
            <Suspense fallback={<div className="h-32 bg-white/5 rounded-lg animate-pulse"></div>}>
              <FinalSection />
            </Suspense>
          </div>
        </TracingBeam>
      </div>
    </div>
  );
}
