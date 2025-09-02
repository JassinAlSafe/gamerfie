import type { Metadata } from "next";
import { Suspense } from "react";
import AllGamesClient from "@/components/allgames/all-games-client";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Video Game Tracker - Browse & Track 50,000+ Games | Game Vault",
  description:
    "The ultimate video game tracker database with 50,000+ games. Track your gaming progress, achievements, and backlog across all platforms. Best free game tracker 2025!",
  keywords: [
    "video game tracker",
    "best video game tracker",
    "track video games",
    "gaming progress tracker",
    "video game database",
    "game tracking app",
    "all games tracker",
    "gaming backlog tracker",
    "video game collection manager",
    "game completion tracker",
    "achievement tracker",
    "gaming library manager",
    "track video game progress",
    "video game tracking website",
    "game tracker platform",
  ],
  openGraph: {
    title: "Video Game Tracker - Track 50,000+ Games | Game Vault",
    description:
      "The best video game tracker with 50,000+ games. Track your gaming progress, achievements, and backlog across all platforms. Free forever!",
    type: "website",
    url: "https://gamersvaultapp.com/all-games",
    siteName: "Game Vault",
    locale: "en_US",
    images: [{
      url: "https://gamersvaultapp.com/og-all-games-tracker.png", 
      width: 1200,
      height: 630,
      alt: "Game Vault - Best Video Game Tracker Database"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Video Game Tracker - Track All Games",
    description:
      "Track your gaming progress with 50,000+ games. The #1 free video game tracker platform.",
    images: ["https://gamersvaultapp.com/twitter-all-games-tracker.png"],
  },
  alternates: {
    canonical: "https://gamersvaultapp.com/all-games",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function AllGamesPage() {
  return (
    <div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        }
      >
        <AllGamesClient />
      </Suspense>
    </div>
  );
}