import { Metadata } from "next";
import { notFound } from "next/navigation";
import NewsDetail from "@/components/news/NewsDetail";
import { createClient } from "@/utils/supabase/server";
import { NewsPost } from "@/types/news";

interface PageProps {
  params: {
    slug: string;
  };
}

async function getPostBySlug(slug: string): Promise<NewsPost | null> {
  try {
    const supabase = await createClient();
    
    const { data: post, error } = await supabase
      .from('news_posts')
      .select(`
        id,
        title,
        slug,
        excerpt,
        content,
        featured_image,
        category,
        status,
        badge,
        published_at,
        created_at,
        updated_at,
        author_id,
        comments_enabled
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !post) {
      return null;
    }

    return post as NewsPost;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'News Post Not Found - Gamerfie',
      description: 'The requested news post could not be found.',
    };
  }
  
  return {
    title: `${post.title} - Gamerfie News`,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      type: 'article',
      publishedTime: post.published_at || post.created_at,
      modifiedTime: post.updated_at,
      images: post.featured_image ? [{ url: post.featured_image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.title,
      images: post.featured_image ? [post.featured_image] : [],
    },
  };
}

export default async function NewsPostPage({ params }: PageProps) {
  const post = await getPostBySlug(params.slug);
  
  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <NewsDetail post={post} />
      </div>
    </div>
  );
}