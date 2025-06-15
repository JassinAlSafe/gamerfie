import type { Metadata } from "next";
import { ExploreContent } from "@/components/explore/ExploreContent";

export const metadata: Metadata = {
  title: "Explore Games - Discover Your Next Gaming Adventure | Game Vault",
  description:
    "Discover trending games, popular titles, and hidden gems. Explore our vast gaming database with advanced filters and personalized recommendations for every type of gamer.",
  keywords: [
    "explore games",
    "discover games",
    "trending games",
    "popular video games",
    "game discovery",
    "gaming recommendations",
    "new games 2024",
    "best games to play",
    "indie games",
    "AAA games",
    "game finder",
    "gaming database",
  ],
  openGraph: {
    title: "Explore Games - Discover Your Next Gaming Adventure",
    description:
      "Find your next favorite game from our extensive database. Filter by genre, platform, rating and more.",
    type: "website",
    url: "https://gamevault.app/explore",
    siteName: "Game Vault",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Games - Game Vault",
    description: "Discover trending games and find your next gaming adventure.",
  },
  alternates: {
    canonical: "https://gamevault.app/explore",
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
