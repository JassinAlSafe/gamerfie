import { Metadata } from "next";
import { ThreadPageClient } from "./ThreadPageClient";
import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

interface ThreadPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: ThreadPageProps): Promise<Metadata> {
  try {
    const supabase = await createClient();
    
    // Fetch thread for metadata
    const { data: thread } = await supabase
      .from('forum_threads_with_details')
      .select('title, content')
      .eq('id', params.id)
      .single();
    
    const title = thread?.title || 'Thread';
    const description = thread?.content?.substring(0, 160) || 'Forum discussion thread';
    
    return {
      title: `${title} - Forum | Game Vault`,
      description: description,
      openGraph: {
        title: `${title} - Forum | Game Vault`,
        description: description,
        type: "website",
      },
    };
  } catch {
    return {
      title: 'Thread - Forum | Game Vault',
      description: 'Forum discussion thread',
    };
  }
}

async function getThreadData(threadId: string) {
  try {
    const supabase = await createClient();

    // Fetch thread details
    const { data: thread, error: threadError } = await supabase
      .from('forum_threads_with_details')
      .select('*')
      .eq('id', threadId)
      .single();

    if (threadError || !thread) {
      console.error("Error fetching thread:", threadError);
      return { thread: null, posts: [] };
    }

    // Fetch posts for this thread
    const { data: posts, error: postsError } = await supabase
      .rpc('get_thread_posts', {
        p_thread_id: threadId,
        p_limit: 50,
        p_offset: 0
      });

    if (postsError) {
      console.error("Error fetching posts:", postsError);
      return { thread, posts: [] };
    }

    // Increment view count
    await supabase.rpc('increment_thread_views', { thread_uuid: threadId });

    return { thread, posts: posts || [] };
  } catch (error) {
    console.error("Error fetching thread data:", error);
    return { thread: null, posts: [] };
  }
}

function ThreadLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          {/* Back button skeleton */}
          <div className="h-8 w-16 bg-muted rounded mb-6"></div>
          
          {/* Thread header skeleton */}
          <div className="bg-card border-border rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-muted rounded-full"></div>
              <div className="flex-1">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </div>
            <div className="h-4 bg-muted rounded w-full mb-2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>

          {/* Posts skeleton */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border-border rounded-lg p-6 mb-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-1/4 mb-3"></div>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-4/5"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  return (
    <Suspense fallback={<ThreadLoading />}>
      <ThreadServerComponent threadId={params.id} />
    </Suspense>
  );
}

async function ThreadServerComponent({ threadId }: { threadId: string }) {
  const { thread, posts } = await getThreadData(threadId);

  if (!thread) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Thread Not Found</h1>
          <p className="text-muted-foreground">The thread you're looking for doesn't exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  return <ThreadPageClient thread={thread} initialPosts={posts} />;
}