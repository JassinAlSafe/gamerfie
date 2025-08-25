import { Metadata } from "next";
import { ForumPageClient } from "./ForumPageClient";
// import { createClient } from "@/utils/supabase/server";
import { ForumCategory, ForumStats } from "@/types/forum";
import { Suspense } from "react";
import { ForumSkeleton } from "@/components/forum/ForumSkeleton";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Forum - Gaming Community Discussions | Game Vault",
  description: "Join the Game Vault community forum. Discuss games, share tips, get help, and connect with fellow gamers in our vibrant gaming community.",
  keywords: [
    "gaming forum",
    "game discussion",
    "gaming community",
    "game help",
    "gaming tips",
    "video game forum",
    "gamer community",
    "game chat",
    "gaming advice",
    "game reviews discussion",
  ],
  openGraph: {
    title: "Forum - Gaming Community Discussions | Game Vault",
    description: "Join the Game Vault community forum. Discuss games, share tips, get help, and connect with fellow gamers.",
    type: "website",
    url: "https://gamersvaultapp.com/forum",
    siteName: "Game Vault",
    images: [
      {
        url: "/og-forum.png",
        width: 1200,
        height: 630,
        alt: "Forum - Game Vault",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Forum - Gaming Community Discussions | Game Vault",
    description: "Join the Game Vault community forum. Discuss games, share tips, get help, and connect with fellow gamers.",
    images: ["/twitter-forum.png"],
  },
  alternates: {
    canonical: "https://gamersvaultapp.com/forum",
  },
};

async function getForumData() {
  try {
    // const supabase = await createClient();

    // Mock data for initial implementation
    const categories: ForumCategory[] = [
      {
        id: "general",
        name: "General Discussion",
        description: "Talk about anything gaming related",
        icon: "💬",
        color: "blue",
        threads_count: 45,
        posts_count: 312,
        last_post_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "game-reviews",
        name: "Game Reviews & Recommendations",
        description: "Share your thoughts on games you've played",
        icon: "⭐",
        color: "yellow",
        threads_count: 28,
        posts_count: 156,
        last_post_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "help-support",
        name: "Help & Support",
        description: "Get help with games, technical issues, and more",
        icon: "🆘",
        color: "red",
        threads_count: 12,
        posts_count: 67,
        last_post_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "showcases",
        name: "Screenshots & Showcases",
        description: "Show off your gaming achievements and screenshots",
        icon: "📸",
        color: "purple",
        threads_count: 34,
        posts_count: 89,
        last_post_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const stats: ForumStats = {
      total_threads: 119,
      total_posts: 624,
      total_users: 89,
      active_users_today: 23,
    };

    return { categories, stats };
  } catch (error) {
    console.error("Error fetching forum data:", error);
    return { categories: [], stats: { total_threads: 0, total_posts: 0, total_users: 0, active_users_today: 0 } };
  }
}

function ForumLoading() {
  return <ForumSkeleton />;
}

export default async function ForumPage() {
  return (
    <Suspense fallback={<ForumLoading />}>
      <ForumServerComponent />
    </Suspense>
  );
}

async function ForumServerComponent() {
  const { categories, stats } = await getForumData();

  return <ForumPageClient initialCategories={categories} initialStats={stats} />;
}