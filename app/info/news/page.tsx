import { InfoContent } from "@/components/layout/InfoContent";
import NewsList from "@/components/news/NewsList";
import { NewsErrorBoundary } from "@/components/error/NewsErrorBoundary";
import { Suspense } from "react";
import { Newspaper, Bell, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Latest News - Gamerfie | Platform Updates & Announcements",
  description: "Stay up to date with the latest Gamerfie updates, new features, community events, and gaming industry news.",
  keywords: ["gaming news", "platform updates", "announcements", "features", "community"],
  openGraph: {
    title: "Latest News - Gamerfie",
    description: "Stay updated with the latest Gamerfie developments and gaming news",
    type: "website",
  },
};

function NewsLoadingSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-gray-700/50 rounded-lg"></div>
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-gray-700/50 rounded w-3/4"></div>
              <div className="h-4 bg-gray-700/30 rounded w-full"></div>
              <div className="h-4 bg-gray-700/30 rounded w-2/3"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-700/30 rounded w-16"></div>
                <div className="h-6 bg-gray-700/30 rounded w-20"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NewsPage() {
  return (
    <InfoContent
      title="Latest News & Updates"
      description="Stay updated with the latest Gamerfie developments, new features, community events, and gaming industry insights."
    >
      {/* News Features Banner */}
      <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Newspaper className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white">Platform Updates</h3>
          </div>
          <p className="text-gray-300 text-sm">New features, improvements, and bug fixes</p>
        </div>

        <div className="bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-green-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="font-semibold text-white">Community Events</h3>
          </div>
          <p className="text-gray-300 text-sm">Challenges, contests, and community highlights</p>
        </div>

        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Bell className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white">Announcements</h3>
          </div>
          <p className="text-gray-300 text-sm">Important updates and policy changes</p>
        </div>
      </div>

      {/* News Content */}
      <NewsErrorBoundary>
        <Suspense fallback={<NewsLoadingSkeleton />}>
          <div className="mb-16">
            <NewsList 
              variant="list"
              limit={12}
              showFilters={true}
              showSearch={true}
              className="mb-16"
            />
          </div>
        </Suspense>
      </NewsErrorBoundary>

      {/* Newsletter & Community Signup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16">
        {/* Newsletter Section */}
        <div className="p-8 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl border border-gray-800/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/20 rounded-full">
              <Bell className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">Stay Updated</h3>
          </div>
          <p className="text-gray-300 mb-6">
            Don't miss out on important updates, new features, and community events. 
            Get notified about the latest Gamerfie news.
          </p>
          <div className="flex flex-col gap-4">
            <a
              href="/auth?mode=signup"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
            >
              Join Platform
              <span className="ml-2">→</span>
            </a>
          </div>
        </div>

        {/* Community Section */}
        <div className="p-8 bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-2xl border border-gray-800/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-500/20 rounded-full">
              <Users className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">Join Community</h3>
          </div>
          <p className="text-gray-300 mb-6">
            Connect with fellow gamers, get real-time updates, and participate in 
            community discussions on our Discord server.
          </p>
          <div className="flex flex-col gap-4">
            <a
              href="https://discord.gg/gamerfie"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-800/80 hover:bg-gray-700/80 text-white font-semibold rounded-lg border border-gray-600 hover:border-gray-500 transition-all duration-300 hover:scale-105"
            >
              Discord Community
              <span className="ml-2">↗</span>
            </a>
          </div>
        </div>
      </div>

      {/* RSS/API Notice */}
      <div className="mt-12 p-6 bg-gray-800/30 border border-gray-700/50 rounded-xl text-center">
        <h4 className="text-lg font-semibold text-white mb-2">For Developers</h4>
        <p className="text-gray-300 text-sm">
          Looking to integrate Gamerfie news into your application? Check out our{" "}
          <a href="/api/news" className="text-purple-400 hover:text-purple-300 underline">
            News API
          </a>
          {" "}for programmatic access to our latest updates and announcements.
        </p>
      </div>
    </InfoContent>
  );
}