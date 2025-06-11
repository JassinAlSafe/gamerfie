"use client";

import { SparklesCore } from "@/components/ui/sparkles";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { ClientOnly } from "@/components/ui/client-only";
import { HeroSection } from "./sections/HeroSection";
import { GameShowcase } from "./sections/GameShowcase";
import { TestimonialsSection } from "./sections/TestimonialsSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { FinalSection } from "./sections/FinalSection";
import homeData from "@/app/data/home.json";
import { HomePageData } from "@/types/home";

export function UnauthenticatedHome() {
  const typedHomeData = homeData as HomePageData;
  
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
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
        <TracingBeam className="px-6">
          <div className="max-w-7xl mx-auto">
            <HeroSection stats={typedHomeData.stats} />
            <GameShowcase />
            <TestimonialsSection />
            <FeaturesSection features={typedHomeData.features} />
            <FinalSection />
          </div>
        </TracingBeam>
      </div>
    </div>
  );
}
