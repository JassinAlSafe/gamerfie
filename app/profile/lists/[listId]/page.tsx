import { GameListDetails } from "@/components/GameList/GameListDetails";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Game List Details | Gamerfie",
  description: "View detailed game list information",
};

interface PageProps {
  params: Promise<{ listId: string }>;
}

export default async function ListDetailsPage({ params }: PageProps) {
  const { listId } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <GameListDetails listId={listId} />
    </div>
  );
}
