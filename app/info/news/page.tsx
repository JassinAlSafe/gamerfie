import { InfoContent } from "@/components/layout/InfoContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recent News - Game Vault",
  description: "Stay up to date with the latest Game Vault updates, features, and announcements.",
};

const newsItems = [
  {
    id: 1,
    title: "Game Vault 2.0 Launch",
    description: "We're excited to announce the launch of Game Vault 2.0 with a completely redesigned interface, improved performance, and new social features.",
    date: "December 15, 2024",
    category: "Product Update",
    badge: "Latest"
  },
  {
    id: 2,
    title: "New Achievement System",
    description: "Track your gaming milestones with our new achievement system. Earn badges for completing games, writing reviews, and connecting with friends.",
    date: "December 10, 2024",
    category: "Feature"
  },
  {
    id: 3,
    title: "Mobile App Coming Soon",
    description: "We're working on native mobile apps for iOS and Android. Sign up for beta testing to get early access.",
    date: "December 5, 2024",
    category: "Announcement"
  },
  {
    id: 4,
    title: "Community Challenges",
    description: "Join weekly gaming challenges with the community. Complete specific games or genres to earn exclusive rewards.",
    date: "November 28, 2024",
    category: "Feature"
  },
  {
    id: 5,
    title: "Enhanced Privacy Controls",
    description: "New privacy settings give you complete control over what information you share and with whom.",
    date: "November 20, 2024",
    category: "Security"
  }
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Product Update":
      return "from-purple-500 to-purple-400";
    case "Feature":
      return "from-blue-500 to-blue-400";
    case "Announcement":
      return "from-green-500 to-green-400";
    case "Security":
      return "from-orange-500 to-orange-400";
    default:
      return "from-gray-500 to-gray-400";
  }
};

export default function NewsPage() {
  return (
    <InfoContent
      title="Recent News"
      description="Stay updated with the latest Game Vault developments, new features, and community updates."
    >
      <div className="space-y-6">
        {newsItems.map((item) => (
          <article key={item.id} className="group bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 bg-gradient-to-r ${getCategoryColor(item.category)} text-white text-xs font-medium rounded-full`}>
                  {item.category}
                </span>
                {item.badge && (
                  <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-400 text-white text-xs font-medium rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <time className="text-sm text-gray-400">{item.date}</time>
            </div>
            
            <h2 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">
              {item.title}
            </h2>
            
            <p className="text-gray-300 leading-relaxed">
              {item.description}
            </p>
            
            <div className="mt-4 flex items-center text-purple-400 hover:text-purple-300 font-medium text-sm group-hover:translate-x-1 transition-all duration-300 cursor-pointer">
              Read more
              <span className="ml-1">→</span>
            </div>
          </article>
        ))}
      </div>

      {/* Newsletter Signup */}
      <div className="mt-16 p-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-2xl border border-gray-800/50 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">Stay in the Loop</h3>
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
          Don't miss out on important updates, new features, and community events. 
          Join our community to get the latest news delivered directly to you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <a
            href="/signup"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
          >
            Join Community
          </a>
          <a
            href="https://discord.gg/gamevault"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-gray-800/80 hover:bg-gray-700/80 text-white font-semibold rounded-lg border border-gray-600 hover:border-gray-500 transition-all duration-300 hover:scale-105"
          >
            Discord Updates
          </a>
        </div>
      </div>
    </InfoContent>
  );
}