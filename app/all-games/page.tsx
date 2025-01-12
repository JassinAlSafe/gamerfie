import { Suspense } from "react";
import AllGamesClient from "../../components/games/all-games-client";
import { Loader2 } from "lucide-react";

export default function AllGamesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      }
    >
      <AllGamesClient />
    </Suspense>
  );
}
