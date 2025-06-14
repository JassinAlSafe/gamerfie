import { AboutSection } from "@/components/about/AboutSection";
import { aboutContent } from "@/config/aboutContent";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About GameRFie - The Ultimate Gaming Community Platform",
  description:
    "Discover GameRFie, the revolutionary platform where gamers unite, track achievements, and celebrate their gaming journey. Join thousands of gamers worldwide.",
  keywords: [
    "gaming platform",
    "game tracking",
    "gaming community",
    "achievements",
    "game reviews",
  ],
  openGraph: {
    title: "About GameRFie - The Ultimate Gaming Community Platform",
    description:
      "Join the future of gaming communities with GameRFie. Track games, connect with friends, and celebrate every achievement.",
    type: "website",
  },
};

export default function About() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="text-center">
            <div className="mb-8">
              <span className="inline-block px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/30">
                🎮 Welcome to the Future of Gaming
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                About
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                GameRFie
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              The ultimate platform where gamers unite, achievements shine, and
              every gaming moment becomes part of your epic story.
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/auth"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
                aria-label="Join the GameRFie community"
              >
                Join the Community
              </Link>
              <Link
                href="/games"
                className="px-8 py-4 bg-gray-800/80 backdrop-blur-sm text-white font-semibold rounded-xl border border-gray-600 hover:bg-gray-700/80 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500/50"
                aria-label="Explore games on GameRFie"
              >
                Explore Games
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="relative z-10">
        {aboutContent.sections.map((section, index) => (
          <div
            key={`about-section-${index}`}
            className={`${
              index % 2 === 1 ? "bg-gray-900/30" : "bg-transparent"
            } border-t border-gray-800/50`}
          >
            <AboutSection {...section} />
          </div>
        ))}
      </div>

      {/* Final Call to Action */}
      <section className="relative z-10 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-t border-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Level Up?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of gamers who have already transformed their gaming
            experience with GameRFie.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth"
              className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/30 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
              aria-label="Get started with GameRFie for free"
            >
              Get Started Free
            </Link>
            <Link
              href="/contact"
              className="px-10 py-4 bg-transparent text-white font-bold rounded-xl border-2 border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/20"
              aria-label="Contact GameRFie team"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
