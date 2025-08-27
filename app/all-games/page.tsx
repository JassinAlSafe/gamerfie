import type { Metadata } from "next";
import { Suspense } from "react";
import AllGamesClient from "@/components/allgames/all-games-client";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "All Games - Complete Video Game Database | Game Vault",
  description:
    "Browse our complete collection of video games. Search, filter, and discover games by genre, platform, rating, and release year. The most comprehensive gaming database.",
  keywords: [
    "all games",
    "video game database",
    "complete game list",
    "browse games",
    "game search",
    "video game catalog",
    "PC games",
    "console games",
    "mobile games",
    "indie games",
    "AAA games",
    "game library",
    "gaming collection",
    "video game archive",
  ],
  openGraph: {
    title: "All Games - Complete Video Game Database",
    description:
      "Explore our comprehensive database of video games. Filter by platform, genre, and more to find your perfect game.",
    type: "website",
    url: "https://gamevault.app/all-games",
    siteName: "Game Vault",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Games - Game Vault",
    description:
      "Browse our complete video game database with advanced search and filtering.",
  },
  alternates: {
    canonical: "https://gamevault.app/all-games",
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