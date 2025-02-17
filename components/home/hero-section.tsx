import { Stat } from "@/types/home";
import { AnimatedHeroContent, AnimatedCallToAction } from "./animated-hero";
import { StatsGrid } from "./stats-grid";

interface HeroSectionProps {
  stats: Stat[];
}

export function HeroSection({ stats }: HeroSectionProps) {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen py-32 px-4 space-y-12">
      <AnimatedHeroContent />
      <AnimatedCallToAction />
      <StatsGrid stats={stats} />
    </section>
  );
}
