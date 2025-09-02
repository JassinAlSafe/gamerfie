import { Metadata } from "next";
import PopularGamesClient from "./PopularGamesClient";
import { siteMetadata } from "@/app/config/metadata";

export const metadata: Metadata = {
  title: "Best Video Game Tracker - Popular Games 2025 | Track Gaming Progress",
  description: "Track the most popular video games of 2025 with the best video game tracker. Monitor your progress on trending games across all platforms. Join 50k+ gamers tracking their achievements!",
  keywords: [
    "best video game tracker",
    "video game tracker app",
    "track popular games",
    "popular video games tracker",
    "trending games tracker", 
    "video game progress tracker",
    "gaming achievement tracker",
    "track video game progress",
    "popular games 2025",
    "best games tracker",
    "video game tracking platform",
    "gaming community tracker",
    "track gaming achievements",
    "video game completion tracker",
    "gaming backlog tracker"
  ],
  authors: siteMetadata.authors,
  openGraph: {
    title: "Best Video Game Tracker - Track Popular Games 2025",
    description: "Track the most popular video games of 2025 with the #1 rated video game tracker. Monitor progress, achievements, and backlog across all platforms.",
    type: "website",
    url: "https://gamersvaultapp.com/popular-games",
    siteName: "Game Vault",
    images: [
      {
        url: "https://gamersvaultapp.com/og-popular-games-tracker.png",
        width: 1200,
        height: 630,
        alt: "Game Vault - Best Video Game Tracker for Popular Games"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Video Game Tracker - Popular Games 2025",
    description: "Track popular games with the top-rated video game tracker. Monitor your progress on trending titles!",
    images: ["https://gamersvaultapp.com/twitter-popular-games-tracker.png"]
  },
  alternates: {
    canonical: "https://gamersvaultapp.com/popular-games"
  },
  other: {
    "article:section": "Gaming",
    "article:tag": "popular games, video games, gaming"
  }
};

export default function PopularGamesPage() {
  return <PopularGamesClient />;
}
