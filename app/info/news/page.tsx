import { InfoContent } from "@/components/layout/InfoContent";
import NewsList from "@/components/news/NewsList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recent News - Game Vault",
  description: "Stay up to date with the latest Game Vault updates, features, and announcements.",
};

export default function NewsPage() {
  return (
    <InfoContent
      title="Recent News"
      description="Stay updated with the latest Game Vault developments, new features, and community updates."
    >
      <NewsList 
        variant="list"
        limit={12}
        showFilters={true}
        showSearch={true}
        className="mb-16"
      />

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