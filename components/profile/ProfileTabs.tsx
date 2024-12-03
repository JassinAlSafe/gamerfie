
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GamesTab } from "@/components/games-tab";
import { ReviewsTab } from "@/components/reviews-tab";

export function ProfileTabs() {
  return (
    <Tabs defaultValue="games" className="space-y-6">
      <TabsList>
        <TabsTrigger value="games">Games</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>
      <TabsContent value="games">
        <GamesTab />
      </TabsContent>
      <TabsContent value="reviews">
        <ReviewsTab />
      </TabsContent>
    </Tabs>
  );
}