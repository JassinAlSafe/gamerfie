import { Metadata } from "next";
import { FriendsContent } from "@/components/friends/FriendsContent";
import { FriendsErrorBoundary } from "@/components/friends/FriendsErrorBoundary";

export const metadata: Metadata = {
  title: "Friends | Gamerfie",
  description: "Connect with fellow gamers and build your gaming community",
};

export default function FriendsPage() {
  return (
    <FriendsErrorBoundary>
      <div className="relative min-h-screen">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-background to-background pointer-events-none" />
        
        {/* Main content */}
        <div className="relative">
          <FriendsContent />
        </div>
      </div>
    </FriendsErrorBoundary>
  );
}