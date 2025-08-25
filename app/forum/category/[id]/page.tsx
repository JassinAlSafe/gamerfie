import { Metadata } from "next/server";
import { CategoryPageClient } from "./CategoryPageClient";
// import { createClient } from "@/utils/supabase/server";
import { ForumCategory, ForumThread } from "@/types/forum";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categoryName = params.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return {
    title: `${categoryName} - Forum | Game Vault`,
    description: `Browse ${categoryName.toLowerCase()} discussions in the Game Vault community forum. Join conversations and share your thoughts.`,
    openGraph: {
      title: `${categoryName} - Forum | Game Vault`,
      description: `Browse ${categoryName.toLowerCase()} discussions in the Game Vault community forum.`,
      type: "website",
    },
  };
}

async function getCategoryData(categoryId: string) {
  try {
    // const supabase = await createClient();

    // Mock category data
    const categories = {
      "general": {
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
      "game-reviews": {
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
      "help-support": {
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
      "showcases": {
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
    };

    const category = categories[categoryId as keyof typeof categories] || null;

    // Mock threads data
    const threads: ForumThread[] = [
      {
        id: "thread-1",
        category_id: categoryId,
        title: "What's your favorite game of 2024?",
        content: "I'm curious to hear what games have stood out to you this year.",
        author_id: "user-1",
        author: {
          id: "user-1",
          username: "GameMaster2024",
          avatar_url: null,
        },
        is_pinned: false,
        is_locked: false,
        views_count: 156,
        replies_count: 23,
        likes_count: 45,
        last_post_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "thread-2",
        category_id: categoryId,
        title: "Looking for co-op game recommendations",
        content: "My friend and I are looking for good co-op games to play together.",
        author_id: "user-2",
        author: {
          id: "user-2",
          username: "CoopGamer",
          avatar_url: null,
        },
        is_pinned: true,
        is_locked: false,
        views_count: 89,
        replies_count: 15,
        likes_count: 22,
        last_post_at: new Date(Date.now() - 1800000).toISOString(),
        created_at: new Date(Date.now() - 7200000).toISOString(),
        updated_at: new Date(Date.now() - 1800000).toISOString(),
      },
    ];

    return { category, threads };
  } catch (error) {
    console.error("Error fetching category data:", error);
    return { category: null, threads: [] };
  }
}

function CategoryLoading() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-800 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-800 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-6">
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-700 rounded w-20"></div>
                  <div className="h-4 bg-gray-700 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  return (
    <Suspense fallback={<CategoryLoading />}>
      <CategoryServerComponent categoryId={params.id} />
    </Suspense>
  );
}

async function CategoryServerComponent({ categoryId }: { categoryId: string }) {
  const { category, threads } = await getCategoryData(categoryId);

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <p className="text-gray-400">The category you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return <CategoryPageClient category={category} initialThreads={threads} />;
}