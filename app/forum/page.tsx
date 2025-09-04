import { Metadata } from "next";
import { ForumPageClient } from "./ForumPageClient";
import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";
import { ForumSkeleton } from "@/components/forum/ForumSkeleton";
import { unstable_cache } from "next/cache";

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

async function getForumDataInternal() {
  try {
    const supabase = await createClient();

    // Fetch categories with stats from the database
    const { data: categories, error: categoriesError } = await supabase
      .from('forum_categories_with_stats')
      .select('*')
      .order('name');

    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError);
      return { categories: [], stats: { total_threads: 0, total_posts: 0, total_users: 0, active_users_today: 0 } };
    }

    console.log("✅ Categories fetched successfully:", categories?.length || 0);

    // Fetch forum stats
    const { data: stats, error: statsError } = await supabase
      .rpc('get_forum_stats');

    if (statsError) {
      console.error("Error fetching forum stats:", statsError);
      // Return categories with fallback stats
      return { 
        categories: categories || [], 
        stats: { total_threads: 0, total_posts: 0, total_users: 0, active_users_today: 0 } 
      };
    }

    console.log("✅ Forum stats fetched:", stats);
    console.log("🎯 Final result - categories:", categories?.length, "threads:", stats?.total_threads);

    return { categories: categories || [], stats: stats || { total_threads: 0, total_posts: 0, total_users: 0, active_users_today: 0 } };
  } catch (error) {
    console.error("Error fetching forum data:", error);
    return { categories: [], stats: { total_threads: 0, total_posts: 0, total_users: 0, active_users_today: 0 } };
  }
}

// Temporarily disable cache for debugging
const getForumData = getForumDataInternal;

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