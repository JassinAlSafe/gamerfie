import type { Metadata } from "next";
import { ExploreContent } from "@/components/explore/ExploreContent";

export const metadata: Metadata = {
  title: "Video Game Tracker - Explore & Track Games | Best Game Database 2025",
  description:
    "The best video game tracker for exploring and discovering games. Track your gaming progress across 50,000+ games from all platforms. Join the ultimate gaming community!",
  keywords: [
    "video game tracker",
    "best video game tracker",
    "explore games",
    "discover games", 
    "game tracking website",
    "gaming progress tracker",
    "video game database",
    "track video games",
    "gaming community platform",
    "game collection tracker",
    "trending games 2025",
    "popular video games",
    "game discovery platform",
    "gaming recommendations",
    "video game library",
  ],
  openGraph: {
    title: "Best Video Game Tracker - Explore & Track 50,000+ Games",
    description:
      "The #1 video game tracker platform. Explore, track, and manage your gaming library across all platforms. Join 50k+ gamers!",
    type: "website",
    url: "https://gamersvaultapp.com/explore",
    siteName: "Game Vault",
    locale: "en_US",
    images: [{
      url: "https://gamersvaultapp.com/og-explore-games.png",
      width: 1200,
      height: 630,
      alt: "Game Vault - Best Video Game Tracker Platform"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Video Game Tracker - Game Vault",
    description: "Explore & track 50,000+ games with the top-rated video game tracker. Free forever!",
    images: ["https://gamersvaultapp.com/twitter-explore-games.png"],
  },
  alternates: {
    canonical: "https://gamersvaultapp.com/explore",
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

export default function ExplorePage() {
  return <ExploreContent />;
}
