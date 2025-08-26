import { Metadata } from "next";
import { ReviewsPageClient } from "./ReviewsPageClient";
import { ReviewErrorBoundary } from "@/components/reviews/ReviewErrorBoundary";
import { siteMetadata } from "@/app/config/metadata";
import { createClient } from "@/utils/supabase/server";
import { GameReview } from "@/hooks/Reviews/use-all-reviews";
import { Suspense } from "react";
import { StaticReviewsLoading } from "@/components/reviews/StaticReviewsLoading";

// Force dynamic rendering due to Supabase auth/cookies usage
export const dynamic = 'force-dynamic';

// Generate metadata with real stats
export async function generateMetadata(): Promise<Metadata> {
  try {
    // Use static count instead of dynamic database query to avoid build errors
    const reviewCount = 500; // Static fallback for build

    return {
      title: `Game Reviews (${reviewCount}+) - Community Reviews & Ratings | Game Vault`,
      description: `Discover ${reviewCount}+ honest game reviews and ratings from the Game Vault community. Read detailed reviews, see player ratings, and find your next favorite game.`,
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
        title: `Game Reviews (${reviewCount}+) - Community Reviews & Ratings | Game Vault`,
        description: `Discover ${reviewCount}+ honest game reviews and ratings from the Game Vault community. Read detailed reviews, see player ratings, and find your next favorite game.`,
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
        title: `Game Reviews (${reviewCount}+) - Community Reviews & Ratings | Game Vault`,
        description: `Discover ${reviewCount}+ honest game reviews and ratings from the Game Vault community.`,
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

    // Fetch initial community reviews for instant load (manual join)
    const { data: reviewsData, error } = await supabase
      .from("reviews")
      .select(
        `
        id,
        game_id,
        user_id,
        rating,
        review_text,
        playtime_at_review,
        is_recommended,
        helpfulness_score,
        created_at,
        updated_at
      `
      )
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

    // Manually fetch user data for the reviews
    const userIds = [...new Set(reviewsData.map((r) => r.user_id))];
    const { data: usersData } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", userIds);

    // Create a map for quick user lookup
    const usersMap = new Map();
    usersData?.forEach((user) => {
      usersMap.set(user.id, user);
    });

    // Minimal transformation for fastest possible load with user data
    const transformedReviews = reviewsData.map((review: any) => ({
      ...review,
      user: usersMap.get(review.user_id) || {
        id: review.user_id,
        username: "Unknown User",
        avatar_url: null,
      },
      game_details: undefined, // Completely skip game details on server
      likes_count: 0, // Will be fetched client-side
      bookmarks_count: 0,
      is_liked: false,
      is_bookmarked: false,
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
