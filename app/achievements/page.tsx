import Link from "next/link";
import { Trophy, Star, Crown, Shield, Medal, Zap, Target, Award, ArrowRight, Gamepad2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Achievements - Gamerfie",
  description:
    "Track your gaming achievements and unlock badges as you progress through your gaming journey. Coming soon to Gamerfie.",
  keywords: [
    "gaming achievements",
    "game badges", 
    "gaming progress",
    "gamer rewards",
    "achievement tracker",
  ],
  openGraph: {
    title: "Achievements - Gamerfie",
    description:
      "Unlock achievements, earn badges, and showcase your gaming accomplishments. Coming soon to Gamerfie.",
    type: "website",
  },
};

export default function AchievementsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-full">
              <Trophy className="w-16 h-16 text-purple-400" />
            </div>
          </div>
          
          <div className="inline-block px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-300 text-sm font-medium mb-6">
            🚀 Coming Soon
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Achievements
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-4xl mx-auto mb-8">
            Unlock achievements, earn badges, and showcase your gaming accomplishments across all your favorite games.
          </p>
          
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto"></div>
        </div>

        {/* Coming Soon Hero Section */}
        <section className="relative py-20 text-center overflow-hidden mb-20 rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-indigo-900/30 rounded-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
              Your Gaming Legacy
              <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mt-2">
                Awaits Recognition
              </span>
            </h2>
            
            <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              We're crafting a comprehensive achievement system that will track your gaming milestones, 
              celebrate your progress, and let you showcase your accomplishments to the community.
            </p>
          </div>
        </section>

        {/* Achievement Categories Grid */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Achievement Categories
            </h3>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Explore the different types of achievements you'll be able to unlock
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Gamepad2,
                title: "Game Progress",
                description: "Complete games, reach milestones, and master challenges",
                color: "from-blue-500 to-cyan-500",
                bgColor: "from-blue-500/20 to-cyan-500/20"
              },
              {
                icon: Star,
                title: "Collection Master",
                description: "Build your library, explore genres, and discover hidden gems",
                color: "from-purple-500 to-pink-500",
                bgColor: "from-purple-500/20 to-pink-500/20"
              },
              {
                icon: Award,
                title: "Community Star",
                description: "Write reviews, help friends, and engage with the community",
                color: "from-green-500 to-emerald-500",
                bgColor: "from-green-500/20 to-emerald-500/20"
              },
              {
                icon: Zap,
                title: "Streak Champion",
                description: "Maintain daily habits and consistent gaming patterns",
                color: "from-yellow-500 to-orange-500",
                bgColor: "from-yellow-500/20 to-orange-500/20"
              },
              {
                icon: Target,
                title: "Challenge Victor",
                description: "Conquer community challenges and competitive events",
                color: "from-red-500 to-rose-500",
                bgColor: "from-red-500/20 to-rose-500/20"
              },
              {
                icon: Crown,
                title: "Milestone Legend",
                description: "Reach extraordinary gaming accomplishments and records",
                color: "from-amber-500 to-yellow-500",
                bgColor: "from-amber-500/20 to-yellow-500/20"
              }
            ].map((category, index) => (
              <div
                key={index}
                className="group p-6 bg-gray-900/50 border border-gray-800/50 rounded-2xl hover:bg-gray-900/70 hover:border-gray-700/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${category.bgColor} border border-white/10 mb-4 group-hover:scale-110 transition-transform`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors">
                  {category.title}
                </h4>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  {category.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Badge Rarity System */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Badge Rarity System
            </h3>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Earn badges of different rarities based on your accomplishments
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Medal,
                name: "Common",
                description: "Everyday accomplishments and basic milestones",
                color: "text-gray-400",
                bgColor: "from-gray-600/20 to-gray-500/20",
                borderColor: "border-gray-500/30"
              },
              {
                icon: Shield,
                name: "Rare",
                description: "Notable achievements that show dedication",
                color: "text-blue-400",
                bgColor: "from-blue-600/20 to-blue-500/20",
                borderColor: "border-blue-500/30"
              },
              {
                icon: Star,
                name: "Epic",
                description: "Impressive feats that few players accomplish",
                color: "text-purple-400",
                bgColor: "from-purple-600/20 to-purple-500/20",
                borderColor: "border-purple-500/30"
              },
              {
                icon: Crown,
                name: "Legendary",
                description: "Extraordinary achievements of true gaming legends",
                color: "text-yellow-400",
                bgColor: "from-yellow-600/20 to-orange-500/20",
                borderColor: "border-yellow-500/30"
              }
            ].map((rarity, index) => (
              <div
                key={index}
                className={`group p-6 bg-gray-900/50 border ${rarity.borderColor} rounded-2xl hover:bg-gray-900/70 transition-all duration-300 text-center hover:transform hover:scale-105`}
              >
                <div className={`inline-flex p-4 rounded-full bg-gradient-to-br ${rarity.bgColor} mb-4 group-hover:scale-110 transition-transform`}>
                  <rarity.icon className={`w-8 h-8 ${rarity.color}`} />
                </div>
                <h4 className={`text-xl font-bold mb-3 ${rarity.color}`}>
                  {rarity.name}
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                  {rarity.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Planned Features */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Planned Features
            </h3>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              What to expect when the achievement system launches
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "Achievement Showcase",
                description: "Display your earned badges and trophies on your profile for all to see",
                icon: Trophy
              },
              {
                title: "Progress Tracking",
                description: "Monitor your advancement towards unlocking new achievements in real-time",
                icon: Target
              },
              {
                title: "Leaderboards",
                description: "Compete with friends and the community for the most achievements earned",
                icon: Crown
              },
              {
                title: "Smart Notifications",
                description: "Get notified when you're close to earning a new achievement",
                icon: Zap
              },
              {
                title: "Custom Goals",
                description: "Set personal gaming challenges and create your own achievement milestones",
                icon: Star
              },
              {
                title: "Exclusive Rewards",
                description: "Unlock special profile themes, titles, and perks with legendary achievements",
                icon: Award
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group flex items-start gap-4 p-6 bg-gray-900/30 border border-gray-800/30 rounded-2xl hover:bg-gray-900/50 hover:border-gray-700/50 transition-all duration-300"
              >
                <div className="flex-shrink-0 p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-16">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Start Your Journey?
            </h3>
            <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
              While we put the finishing touches on the achievement system, 
              start building your gaming legacy today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/all-games"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-200 hover:transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
              >
                <Gamepad2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Explore Games
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/profile"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gray-800/50 border border-gray-600/50 hover:bg-purple-900/30 hover:border-purple-500/50 text-gray-300 hover:text-white font-semibold rounded-xl transition-all duration-200 hover:transform hover:scale-105"
              >
                <Trophy className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                View Profile
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}