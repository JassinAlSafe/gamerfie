import { GameListDetails } from "@/components/GameList/GameListDetails.improved";
import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Game List Details | Gamerfie",
  description: "View detailed game list information",
};

interface PageProps {
  params: Promise<{ listId: string }>;
}

// Generate static params for popular game lists to enable Full Route Cache
export async function generateStaticParams() {
  try {
    const supabase = await createClient();
    const { data: lists } = await supabase
      .from('journal_entries')
      .select('id')
      .eq('type', 'list')
      .eq('is_public', true)
      .order('updated_at', { ascending: false })
      .limit(20);
    
    return lists?.map((list) => ({
      listId: list.id.toString(),
    })) || [];
  } catch (error) {
    console.error('Error generating static params for game lists:', error);
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
