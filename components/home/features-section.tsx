"use client";

import { HoverEffect } from "@/components/ui/card-hover-effect";
import Link from "next/link";
import { Feature } from "@/types/home";
import { ICON_MAP } from "@/lib/constants";
import { AnimatedFeaturesContent } from "./animated-features";

interface FeaturesSectionProps {
  features: Feature[];
}

export function FeaturesSection({ features }: FeaturesSectionProps) {
  return (
    <section className="py-32 bg-gray-950 px-4">
      <div className="max-w-6xl mx-auto">
        <AnimatedFeaturesContent>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-16">
            Everything You Need
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </AnimatedFeaturesContent>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = ICON_MAP[feature.icon];
  return (
    <HoverEffect>
      <Link href={feature.link} className="block h-full p-6">
        <div className="flex flex-col items-center text-center">
          <Icon className={`h-12 w-12 ${feature.iconColor}`} />
          <h3 className="mt-4 text-xl font-semibold text-white">
            {feature.title}
          </h3>
          <p className="mt-2 text-gray-400">{feature.description}</p>
        </div>
      </Link>
    </HoverEffect>
  );
}
