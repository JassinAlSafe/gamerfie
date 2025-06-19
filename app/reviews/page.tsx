import { Metadata } from "next";
import { ReviewsPageClient } from "./ReviewsPageClient";
import { siteMetadata } from "@/app/config/metadata";

export const metadata: Metadata = {
  title: "Game Reviews - Community Reviews & Ratings | Game Vault",
  description: "Discover honest game reviews and ratings from the Game Vault community. Read detailed reviews, see player ratings, and find your next favorite game.",
  keywords: [
    "game reviews",
    "video game reviews",
    "gaming reviews",
    "game ratings",
    "player reviews",
    "community reviews",
    "game recommendations",
    "honest game reviews",
    "video game ratings",
    "gaming community",
    "game discovery",
    "best games",
    "game opinions",
    "gaming feedback",
    "user reviews"
  ],
  authors: siteMetadata.authors,
  openGraph: {
    title: "Game Reviews - Community Reviews & Ratings | Game Vault",
    description: "Discover honest game reviews and ratings from the Game Vault community. Read detailed reviews, see player ratings, and find your next favorite game.",
    type: "website",
    url: "https://gamersvaultapp.com/reviews",
    siteName: "Game Vault",
    images: [
      {
        url: "/og-reviews.png",
        width: 1200,
        height: 630,
        alt: "Game Reviews - Game Vault"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Game Reviews - Community Reviews & Ratings | Game Vault",
    description: "Discover honest game reviews and ratings from the Game Vault community.",
    images: ["/twitter-reviews.png"]
  },
  alternates: {
    canonical: "https://gamersvaultapp.com/reviews"
  },
  other: {
    "article:section": "Gaming Reviews",
    "article:tag": "game reviews, video games, ratings, community"
  }
};

export default function ReviewsPage() {
  return <ReviewsPageClient />;
}