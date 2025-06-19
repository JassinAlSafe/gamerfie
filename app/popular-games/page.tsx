import { Metadata } from "next";
import PopularGamesClient from "./PopularGamesClient";
import { siteMetadata } from "@/app/config/metadata";

export const metadata: Metadata = {
  title: "Popular Video Games - Discover Trending Games | Game Vault",
  description: "Discover the most popular and trending video games. Browse by genre, platform, and rating. Track your gaming progress and connect with the community on Game Vault.",
  keywords: [
    "popular video games",
    "trending games",
    "best games",
    "top rated games",
    "game discovery",
    "video game tracker",
    "gaming community",
    "game reviews",
    "game ratings",
    "popular games 2024",
    "best video games",
    "game recommendations",
    "gaming platform",
    "track games"
  ],
  authors: siteMetadata.authors,
  openGraph: {
    title: "Popular Games - Game Vault",
    description: "Discover the most popular and trending video games. Browse, track, and review games on Game Vault.",
    type: "website",
    url: "https://gamersvaultapp.com/popular-games",
    siteName: "Game Vault",
    images: [
      {
        url: "/og-popular-games.png",
        width: 1200,
        height: 630,
        alt: "Popular Games - Game Vault"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Popular Games - Game Vault",
    description: "Discover the most popular and trending video games. Browse, track, and review games.",
    images: ["/twitter-popular-games.png"]
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
