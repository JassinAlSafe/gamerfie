import { GameListDetails } from "@/components/GameList/GameListDetails";
import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Game List Details | Gamerfie",
  description: "View detailed game list information",
};

interface PageProps {
  params: Promise<{ listId: string }>;
}

// Generate static params for popular playlists to enable Full Route Cache
export async function generateStaticParams() {
  try {
    const supabase = await createClient();
    const { data: playlists } = await supabase
      .from('playlists')
      .select('id')
      .eq('is_published', true)
      .order('likes_count', { ascending: false })
      .limit(20);
    
    return playlists?.map((playlist) => ({
      listId: playlist.id.toString(),
    })) || [];
  } catch (error) {
    console.error('Error generating static params for playlists:', error);
    return [];
  }
}

export default async function ListDetailsPage({ params }: PageProps) {
  const { listId } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <GameListDetails listId={listId} />
    </div>
  );
}
