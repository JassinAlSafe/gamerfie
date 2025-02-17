import { BackgroundBeams } from "@/components/ui/background-beams";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturesSection } from "@/components/home/features-section";
import { BackgroundEffects } from "@/components/home/background-effects";
import homeData from "@/app/data/home.json";

export function UnauthenticatedHome() {
  return (
    <div className="min-h-[100dvh] bg-gray-950 relative font-sans">
      <BackgroundEffects />

      <main className="relative z-10">
        <HeroSection stats={homeData.stats} />
        <FeaturesSection features={homeData.features} />
      </main>

      <BackgroundBeams className="opacity-20 z-0" />
    </div>
  );
}
