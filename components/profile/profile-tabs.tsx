"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GamesTab } from "./games-tab";
import { ReviewsTab } from "../reviews-tab";

interface ProfileTabsProps {
  userId: string;
  className?: string;
}

export function ProfileTabs({ userId, className }: ProfileTabsProps) {
  return (
    <Tabs defaultValue="games" className={className}>
      <TabsList>
        <TabsTrigger value="games">Games</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>
      <TabsContent value="games">
        <GamesTab userId={userId} />
      </TabsContent>
      <TabsContent value="reviews">
        <ReviewsTab userId={userId} />
      </TabsContent>
    </Tabs>
  );
}
