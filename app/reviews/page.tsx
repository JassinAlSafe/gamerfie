import { Metadata } from "next";
import { ReviewsPageClient } from "./ReviewsPageClient";
import { ReviewErrorBoundary } from "@/components/reviews/ReviewErrorBoundary";
import { siteMetadata } from "@/app/config/metadata";
import { createClient } from "@/utils/supabase/server";
import { GameReview } from "@/hooks/Reviews/use-all-reviews";
import { Suspense } from "react";
import { StaticReviewsLoading } from "@/components/reviews/StaticReviewsLoading";

// Generate metadata with real stats
export async function generateMetadata(): Promise<Metadata> {
  try {
    const supabase = await createClient();

    // Get review count for metadata
    const { count: totalReviews } = await supabase
      .from("journal_entries")
      .select("*", { count: "exact", head: true })
      .eq("type", "review")
      .eq("is_public", true);

    const reviewCount = totalReviews || 0;

    return {
      title: `Game Reviews (${reviewCount}) - Community Reviews & Ratings | Game Vault`,
      description: `Discover ${reviewCount} honest game reviews and ratings from the Game Vault community. Read detailed reviews, see player ratings, and find your next favorite game.`,
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
        "user reviews",
      ],
      authors: siteMetadata.authors,
      openGraph: {
        title: `Game Reviews (${reviewCount}) - Community Reviews & Ratings | Game Vault`,
        description: `Discover ${reviewCount} honest game reviews and ratings from the Game Vault community. Read detailed reviews, see player ratings, and find your next favorite game.`,
        type: "website",
        url: "https://gamersvaultapp.com/reviews",
        siteName: "Game Vault",
        images: [
          {
            url: "/og-reviews.png",
            width: 1200,
            height: 630,
            alt: "Game Reviews - Game Vault",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `Game Reviews (${reviewCount}) - Community Reviews & Ratings | Game Vault`,
        description: `Discover ${reviewCount} honest game reviews and ratings from the Game Vault community.`,
        images: ["/twitter-reviews.png"],
      },
      alternates: {
        canonical: "https://gamersvaultapp.com/reviews",
      },
      other: {
        "article:section": "Gaming Reviews",
        "article:tag": "game reviews, video games, ratings, community",
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);

    // Fallback metadata
    return {
      title: "Game Reviews - Community Reviews & Ratings | Game Vault",
      description:
        "Discover honest game reviews and ratings from the Game Vault community. Read detailed reviews, see player ratings, and find your next favorite game.",
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
        "user reviews",
      ],
      authors: siteMetadata.authors,
      openGraph: {
        title: "Game Reviews - Community Reviews & Ratings | Game Vault",
        description:
          "Discover honest game reviews and ratings from the Game Vault community. Read detailed reviews, see player ratings, and find your next favorite game.",
        type: "website",
        url: "https://gamersvaultapp.com/reviews",
        siteName: "Game Vault",
        images: [
          {
            url: "/og-reviews.png",
            width: 1200,
            height: 630,
            alt: "Game Reviews - Game Vault",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Game Reviews - Community Reviews & Ratings | Game Vault",
        description:
          "Discover honest game reviews and ratings from the Game Vault community.",
        images: ["/twitter-reviews.png"],
      },
      alternates: {
        canonical: "https://gamersvaultapp.com/reviews",
      },
      other: {
        "article:section": "Gaming Reviews",
        "article:tag": "game reviews, video games, ratings, community",
      },
    };
  }
}

// Fast server-side data fetching with caching
async function getInitialReviewsData() {
  try {
    const supabase = await createClient();

    // Use a more aggressive approach - fetch only essential data for instant load
    const { data: reviewsData, error } = await supabase
      .from("journal_entries")
      .select(
        `
        id,
        game_id,
        user_id,
        rating,
        content,
        created_at,
        user:profiles!user_id(id, username, avatar_url)
      `
      )
      .eq("type", "review")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .range(0, 4) // Only 5 reviews for instant SSR load
      .limit(5);

    if (error) {
      console.error("Server-side reviews fetch error:", error);
      return null;
    }

    if (!reviewsData || reviewsData.length === 0) {
      return [];
    }

    // Minimal transformation for fastest possible load
    const transformedReviews = reviewsData.map((review: any) => ({
      ...review,
      review_text: review.content,
      user: Array.isArray(review.user) ? review.user[0] : review.user,
      game_details: undefined, // Completely skip game details on server
    })) as GameReview[];

    return transformedReviews;
  } catch (error) {
    console.error("Server-side reviews fetch error:", error);
    return [];
  }
}

// Add revalidation for better caching
export const revalidate = 300; // Revalidate every 5 minutes

export default async function ReviewsPage() {
  return (
    <ReviewErrorBoundary>
      <Suspense fallback={<StaticReviewsLoading />}>
        <ReviewsServerComponent />
      </Suspense>
    </ReviewErrorBoundary>
  );
}

// Separate server component for better performance
async function ReviewsServerComponent() {
  const initialReviews = await getInitialReviewsData();
  
  return <ReviewsPageClient initialReviews={initialReviews} />;
}
