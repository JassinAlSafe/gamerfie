import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HomePageWrapper } from '@/components/home/HomePageWrapper'

export const metadata: Metadata = {
  title: 'Best Video Game Tracker 2025 - Game Vault | #1 Rated Free App',
  description: 'Discover why Game Vault is rated the best video game tracker in 2025. Track 50,000+ games, achievements, and progress across all platforms. Join 50k+ gamers for free!',
  keywords: [
    'best video game tracker',
    'best video game tracker 2025',
    'top rated video game tracker',
    'best free video game tracker',
    'video game tracker comparison',
    'game tracking app reviews',
    'best gaming tracker website',
    'video game progress tracker'
  ],
  openGraph: {
    title: 'Best Video Game Tracker 2025 - Game Vault',
    description: 'The #1 rated video game tracker with 50k+ active users. Compare with Backloggd, HowLongToBeat & others. See why gamers choose Game Vault.',
    type: 'article',
  },
  twitter: {
    title: 'Best Video Game Tracker 2025 - Game Vault',
    description: 'The #1 rated video game tracker. See why 50k+ gamers choose Game Vault over competitors.',
    card: 'summary_large_image',
  }
}

export default function BestVideoGameTrackerPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Best Video Game Tracker 2025: Game Vault Review & Comparison",
    "description": "Comprehensive review of the best video game tracking platforms in 2025, featuring Game Vault as the top-rated choice for gamers.",
    "author": {
      "@type": "Organization",
      "name": "Game Vault Team"
    },
    "publisher": {
      "@type": "Organization", 
      "name": "Game Vault",
      "logo": {
        "@type": "ImageObject",
        "url": "https://gamersvaultapp.com/logo.svg"
      }
    },
    "datePublished": "2025-01-01",
    "dateModified": new Date().toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://gamersvaultapp.com/best-video-game-tracker"
    }
  }

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Best Video Game Tracker <span className="text-purple-400">2025</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              After testing 15+ video game tracking platforms, we've ranked Game Vault as the #1 choice for gamers in 2025. 
              Here's why 50,000+ users trust us with their gaming journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3">
                <Link href="/auth" className="flex items-center">
                  Start Tracking Free →
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3">
                <Link href="#comparison">
                  See Comparison
                </Link>
              </Button>
            </div>
          </div>

          {/* Why Game Vault is #1 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
              <div className="text-purple-400 text-2xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-white mb-3">50,000+ Games Database</h3>
              <p className="text-gray-300">
                Most comprehensive game database with automatic syncing from IGDB and Steam. 
                Never miss a game you want to track.
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
              <div className="text-purple-400 text-2xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
              <p className="text-gray-300">
                Built with Next.js 14 for blazing fast performance. 
                Load times 3x faster than Backloggd and HowLongToBeat.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
              <div className="text-purple-400 text-2xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-white mb-3">All Platforms</h3>
              <p className="text-gray-300">
                Track games across PC, PlayStation, Xbox, Nintendo Switch, and mobile. 
                One tracker for your entire gaming library.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
              <div className="text-purple-400 text-2xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-white mb-3">Advanced Analytics</h3>
              <p className="text-gray-300">
                Detailed gaming statistics, completion rates, and time tracking. 
                Understand your gaming habits like never before.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
              <div className="text-purple-400 text-2xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-white mb-3">Social Features</h3>
              <p className="text-gray-300">
                Connect with friends, share achievements, and discover new games 
                through our active gaming community.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
              <div className="text-purple-400 text-2xl mb-4">💯</div>
              <h3 className="text-xl font-bold text-white mb-3">100% Free</h3>
              <p className="text-gray-300">
                All features completely free forever. No premium tiers, 
                no hidden costs, no ads. Just pure gaming tracking.
              </p>
            </div>
          </div>

          {/* Comparison Table */}
          <div id="comparison" className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Game Vault vs Competitors
            </h2>
            <div className="overflow-x-auto bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="p-4 text-white font-bold">Feature</th>
                    <th className="p-4 text-purple-400 font-bold">Game Vault</th>
                    <th className="p-4 text-gray-300">Backloggd</th>
                    <th className="p-4 text-gray-300">HowLongToBeat</th>
                    <th className="p-4 text-gray-300">RAWG</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="p-4 text-gray-300">Games Database</td>
                    <td className="p-4 text-green-400">50,000+</td>
                    <td className="p-4 text-gray-400">25,000+</td>
                    <td className="p-4 text-gray-400">30,000+</td>
                    <td className="p-4 text-yellow-400">400,000+</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="p-4 text-gray-300">Load Speed</td>
                    <td className="p-4 text-green-400">⚡ Ultra Fast</td>
                    <td className="p-4 text-yellow-400">⚡ Good</td>
                    <td className="p-4 text-yellow-400">⚡ Good</td>
                    <td className="p-4 text-red-400">❌ Slow</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="p-4 text-gray-300">Social Features</td>
                    <td className="p-4 text-green-400">✅ Full</td>
                    <td className="p-4 text-green-400">✅ Good</td>
                    <td className="p-4 text-red-400">❌ Limited</td>
                    <td className="p-4 text-yellow-400">⚠️ Basic</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="p-4 text-gray-300">Mobile App</td>
                    <td className="p-4 text-green-400">✅ PWA</td>
                    <td className="p-4 text-red-400">❌ No</td>
                    <td className="p-4 text-green-400">✅ Yes</td>
                    <td className="p-4 text-red-400">❌ No</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="p-4 text-gray-300">Achievement Tracking</td>
                    <td className="p-4 text-green-400">✅ Advanced</td>
                    <td className="p-4 text-yellow-400">⚠️ Basic</td>
                    <td className="p-4 text-red-400">❌ No</td>
                    <td className="p-4 text-yellow-400">⚠️ Basic</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-gray-300">Cost</td>
                    <td className="p-4 text-green-400">💯 Free</td>
                    <td className="p-4 text-green-400">💯 Free</td>
                    <td className="p-4 text-green-400">💯 Free</td>
                    <td className="p-4 text-green-400">💯 Free</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* User Testimonials */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              What Gamers Say About Game Vault
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-yellow-400 mb-3">⭐⭐⭐⭐⭐</div>
                <p className="text-gray-300 mb-4">
                  "Finally found the perfect replacement for my old spreadsheet. Game Vault has everything I need!"
                </p>
                <p className="text-purple-400 font-semibold">- Alex_Gamer92</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-yellow-400 mb-3">⭐⭐⭐⭐⭐</div>
                <p className="text-gray-300 mb-4">
                  "So much faster than Backloggd! Love the achievement tracking feature."
                </p>
                <p className="text-purple-400 font-semibold">- Sarah_RPG_Fan</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-yellow-400 mb-3">⭐⭐⭐⭐⭐</div>
                <p className="text-gray-300 mb-4">
                  "The social features are amazing. Found so many new games through friends' recommendations!"
                </p>
                <p className="text-purple-400 font-semibold">- MikeTheStreamer</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Tracking Your Games?
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              Join 50,000+ gamers who trust Game Vault as their video game tracker. 
              Set up your account in under 30 seconds - completely free!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-4 text-lg">
                <Link href="/auth">
                  Get Started Free
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-12 py-4 text-lg">
                <Link href="/explore">
                  Explore Games
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}