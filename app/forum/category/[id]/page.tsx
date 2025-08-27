import { Metadata } from "next";
import { CategoryPageClient } from "./CategoryPageClient";
import { createClient } from "@/utils/supabase/server";
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
    const supabase = await createClient();

    // Fetch category data from the database
    const { data: category, error: categoryError } = await supabase
      .from('forum_categories_with_stats')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (categoryError || !category) {
      console.error("Error fetching category:", categoryError);
      return { category: null, threads: [] };
    }

    // Fetch threads for this category
    const { data: threads, error: threadsError } = await supabase
      .rpc('get_category_threads', {
        p_category_id: categoryId,
        p_limit: 50,
        p_offset: 0
      });

    if (threadsError) {
      console.error("Error fetching threads:", threadsError);
      return { category, threads: [] };
    }

    return { category, threads: threads || [] };
  } catch (error) {
    console.error("Error fetching category data:", error);
    return { category: null, threads: [] };
  }
}

function CategoryLoading() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 pt-20 pb-8">
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