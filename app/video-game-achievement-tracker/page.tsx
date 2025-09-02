import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Video Game Achievement Tracker - Track All Your Gaming Achievements | Game Vault',
  description: 'The ultimate video game achievement tracker. Track trophies, achievements, and progress across PlayStation, Xbox, Steam, and more. Join 50k+ achievement hunters!',
  keywords: [
    'video game achievement tracker',
    'achievement tracker app',
    'trophy tracker',
    'gaming achievement hunter',
    'steam achievement tracker',
    'playstation trophy tracker',
    'xbox achievement tracker',
    'achievement hunting tracker',
    'gaming trophy tracker',
    'achievement progress tracker'
  ],
  openGraph: {
    title: 'Video Game Achievement Tracker - Game Vault',
    description: 'Track all your gaming achievements in one place. PlayStation trophies, Xbox achievements, Steam badges - unified achievement tracking for serious gamers.',
    type: 'website',
  },
  twitter: {
    title: 'Video Game Achievement Tracker - Game Vault', 
    description: 'The best achievement tracking app for gamers. Track trophies & achievements across all platforms.',
    card: 'summary_large_image',
  }
}

export default function AchievementTrackerPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Game Vault Achievement Tracker",
    "description": "Comprehensive video game achievement tracking across all gaming platforms",
    "applicationCategory": "GameApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "PlayStation Trophy Tracking",
      "Xbox Achievement Tracking", 
      "Steam Achievement Tracking",
      "Multi-Platform Progress Sync",
      "Achievement Completion Analytics",
      "Rare Achievement Discovery"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "3247"
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-black">
        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 rounded-full px-4 py-2 mb-6">
              <span className="text-2xl">🏆</span>
              <span className="text-amber-300 font-semibold">#1 Achievement Tracker</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Video Game <span className="text-amber-400">Achievement Tracker</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Track every trophy, achievement, and badge across all gaming platforms. 
              From PlayStation Platinums to Xbox Completions - never miss an achievement again!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3">
                <Link href="/auth" className="flex items-center">
                  Start Tracking Achievements →
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3 border-amber-400 text-amber-400">
                <Link href="#features">
                  See Features
                </Link>
              </Button>
            </div>
          </div>

          {/* Platform Support */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Track Achievements Across All Platforms
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-blue-600/20 rounded-lg p-6 text-center backdrop-blur-sm border border-blue-500/30">
                <div className="text-4xl mb-3">🎮</div>
                <h3 className="text-white font-bold mb-2">PlayStation</h3>
                <p className="text-gray-300 text-sm">Trophies, Platinums & Progress</p>
              </div>
              
              <div className="bg-green-600/20 rounded-lg p-6 text-center backdrop-blur-sm border border-green-500/30">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="text-white font-bold mb-2">Xbox</h3>
                <p className="text-gray-300 text-sm">Gamerscore & Achievements</p>
              </div>
              
              <div className="bg-purple-600/20 rounded-lg p-6 text-center backdrop-blur-sm border border-purple-500/30">
                <div className="text-4xl mb-3">💨</div>
                <h3 className="text-white font-bold mb-2">Steam</h3>
                <p className="text-gray-300 text-sm">Steam Achievements & Badges</p>
              </div>
              
              <div className="bg-red-600/20 rounded-lg p-6 text-center backdrop-blur-sm border border-red-500/30">
                <div className="text-4xl mb-3">🎲</div>
                <h3 className="text-white font-bold mb-2">All Platforms</h3>
                <p className="text-gray-300 text-sm">Nintendo, Mobile & More</p>
              </div>
            </div>
          </div>

          {/* Achievement Tracker Features */}
          <div id="features" className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Powerful Achievement Tracking Features
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-amber-400 text-2xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-white mb-3">Smart Progress Tracking</h3>
                <p className="text-gray-300">
                  Automatically track achievement progress with detailed completion percentages and milestone alerts.
                </p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-amber-400 text-2xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-white mb-3">Rare Achievement Hunter</h3>
                <p className="text-gray-300">
                  Discover ultra-rare achievements and trophies. See completion rates and find the most challenging unlocks.
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-amber-400 text-2xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-white mb-3">Achievement Analytics</h3>
                <p className="text-gray-300">
                  Detailed stats on your achievement hunting: completion rates, favorite genres, and hunting streaks.
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-amber-400 text-2xl mb-4">🔔</div>
                <h3 className="text-xl font-bold text-white mb-3">Achievement Notifications</h3>
                <p className="text-gray-300">
                  Get notified when friends unlock achievements or when you're close to completing challenging trophies.
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-amber-400 text-2xl mb-4">🎮</div>
                <h3 className="text-xl font-bold text-white mb-3">Game Completion Goals</h3>
                <p className="text-gray-300">
                  Set completion goals, track 100% achievements, and plan your achievement hunting journey.
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-amber-400 text-2xl mb-4">👥</div>
                <h3 className="text-xl font-bold text-white mb-3">Achievement Leaderboards</h3>
                <p className="text-gray-300">
                  Compete with friends on achievement leaderboards. See who's the ultimate achievement hunter.
                </p>
              </div>
            </div>
          </div>

          {/* Achievement Statistics */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Achievement Tracking By The Numbers
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-400 mb-2">2.3M+</div>
                <p className="text-gray-300">Achievements Tracked</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-400 mb-2">50K+</div>
                <p className="text-gray-300">Achievement Hunters</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-400 mb-2">15K+</div>
                <p className="text-gray-300">Platinum Trophies</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-400 mb-2">98%</div>
                <p className="text-gray-300">User Satisfaction</p>
              </div>
            </div>
          </div>

          {/* Popular Achievement Categories */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Popular Achievement Categories
            </h2>
            <div className="flex flex-wrap gap-3 justify-center">
              <Badge variant="secondary" className="text-lg py-2 px-4 bg-amber-500/20 text-amber-300">
                Platinum Trophies
              </Badge>
              <Badge variant="secondary" className="text-lg py-2 px-4 bg-blue-500/20 text-blue-300">
                100% Completion
              </Badge>
              <Badge variant="secondary" className="text-lg py-2 px-4 bg-green-500/20 text-green-300">
                Rare Achievements
              </Badge>
              <Badge variant="secondary" className="text-lg py-2 px-4 bg-purple-500/20 text-purple-300">
                Speedrun Records
              </Badge>
              <Badge variant="secondary" className="text-lg py-2 px-4 bg-red-500/20 text-red-300">
                Challenge Completions
              </Badge>
              <Badge variant="secondary" className="text-lg py-2 px-4 bg-yellow-500/20 text-yellow-300">
                Collectibles Found
              </Badge>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              What Achievement Hunters Say
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-amber-400 mb-3">🏆⭐⭐⭐⭐⭐</div>
                <p className="text-gray-300 mb-4">
                  "Finally, a tracker that understands achievement hunters! The progress tracking is incredible."
                </p>
                <p className="text-amber-400 font-semibold">- TrophyHunter_Pro</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-amber-400 mb-3">🎯⭐⭐⭐⭐⭐</div>
                <p className="text-gray-300 mb-4">
                  "Love how it shows rare achievement percentages. Helped me find achievements I never knew existed!"
                </p>
                <p className="text-amber-400 font-semibold">- AchievementAddict</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-amber-400 mb-3">🎮⭐⭐⭐⭐⭐</div>
                <p className="text-gray-300 mb-4">
                  "Multi-platform support is amazing. All my PlayStation and Xbox achievements in one place!"
                </p>
                <p className="text-amber-400 font-semibold">- ConsoleGamer23</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Start Your Achievement Hunting Journey
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              Join 50,000+ achievement hunters using the most comprehensive achievement tracker. 
              Track every trophy, unlock, and milestone - completely free!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-12 py-4 text-lg">
                <Link href="/auth">
                  Start Tracking Free 🏆
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-12 py-4 text-lg border-amber-400 text-amber-400">
                <Link href="/popular-games">
                  Browse Popular Games
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}