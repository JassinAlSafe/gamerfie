import { AboutSection } from "@/components/about/AboutSection";
import { InfoContent } from "@/components/layout/InfoContent";
import { aboutContent } from "@/config/aboutContent";
import { platformStats } from "@/config/stats";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Game Vault - The Ultimate Gaming Community Platform",
  description:
    "Discover Game Vault, the revolutionary platform where gamers unite, track achievements, and celebrate their gaming journey. Join thousands of gamers worldwide.",
  keywords: [
    "gaming platform",
    "game tracking", 
    "gaming community",
    "achievements",
    "game reviews",
  ],
  openGraph: {
    title: "About Game Vault - The Ultimate Gaming Community Platform",
    description:
      "Join the future of gaming communities with Game Vault. Track games, connect with friends, and celebrate every achievement.",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <InfoContent
      title="About Game Vault"
      description="Your ultimate gaming companion for tracking progress, discovering new games, and connecting with fellow gamers worldwide."
    >
      {/* Main Content Sections */}
      <div className="space-y-16">
        {aboutContent.sections.map((section, index) => (
          <div key={`about-section-${index}`} className={`relative ${
            index % 2 === 1 ? 'bg-gray-900/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-800/50' : ''
          }`}>
            <AboutSection {...section} />
          </div>
        ))}
      </div>

      {/* Enhanced Stats */}
      <section className="relative py-16 mt-20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-blue-900/10 rounded-2xl"></div>
        <div className="relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">By the Numbers</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {platformStats.map((stat, index) => (
              <div key={index} className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6 text-center hover:border-purple-500/30 transition-all duration-300 hover:scale-105">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300" role="img" aria-label={stat.label}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA */}
      <section className="relative py-16 text-center overflow-hidden mt-16">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative">
          <div className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm font-medium mb-6">
            Join the Community
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Level Up Your
            <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Gaming Experience?
            </span>
          </h2>
          <p className="text-lg text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
            Join thousands of gamers who are already tracking their progress and discovering new adventures on Game Vault.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth"
              className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/25"
            >
              <span className="flex items-center justify-center">
                Get Started Free
                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </span>
            </Link>
            <Link
              href="/games"
              className="group px-8 py-4 bg-gray-800/80 hover:bg-gray-700/80 text-white font-semibold rounded-xl border border-gray-600 hover:border-gray-500 transition-all duration-300 hover:scale-105"
            >
              Explore Games
            </Link>
          </div>
        </div>
      </section>
    </InfoContent>
  );
}