import { Metadata } from "next";
import GameListsClient from "@/components/lists/GameListsClient";

export const metadata: Metadata = {
  title: "My Game Lists | Gamerfie",
  description: "Create and manage your game lists",
};

export default function ListsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <GameListsClient />
    </div>
  );
}
