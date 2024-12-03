import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GamesTab } from "@/components/games-tab";
import { ReviewsTab } from "@/components/reviews-tab";
import { Library, Activity, Heart, Users, ScrollText, GamepadIcon } from 'lucide-react';
import { Game } from "@/types/game";

interface ProfileTabsProps {
  onGamesUpdate: (games: Game[]) => void;
}

export function ProfileTabs({ onGamesUpdate }: ProfileTabsProps) {
  return (
    <Tabs defaultValue="games" className="w-full">
      <TabsList className="grid grid-cols-6 md:w-fit">
        <TabsTrigger value="games">
          <GamepadIcon className="h-4 w-4 mr-2" />
          Games
        </TabsTrigger>
        <TabsTrigger value="activity">
          <Activity className="h-4 w-4 mr-2" />
          Activity
        </TabsTrigger>
        <TabsTrigger value="reviews">
          <ScrollText className="h-4 w-4 mr-2" />
          Reviews
        </TabsTrigger>
        <TabsTrigger value="lists">
          <Library className="h-4 w-4 mr-2" />
          Lists
        </TabsTrigger>
        <TabsTrigger value="friends">
          <Users className="h-4 w-4 mr-2" />
          Friends
        </TabsTrigger>
        <TabsTrigger value="likes">
          <Heart className="h-4 w-4 mr-2" />
          Likes
        </TabsTrigger>
      </TabsList>
      <TabsContent value="games">
        <GamesTab onGamesUpdate={onGamesUpdate} />
      </TabsContent>
      <TabsContent value="reviews">
        <ReviewsTab />
      </TabsContent>
      {/* Add other TabsContent components for remaining tabs */}
    </Tabs>
  );
}


}