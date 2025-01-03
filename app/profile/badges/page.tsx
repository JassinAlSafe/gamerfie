import { Metadata } from "next";
import UserBadges from "@/components/profile/user-badges";

export const metadata: Metadata = {
  title: "My Badges",
  description: "View your earned badges and achievements",
};

export default function BadgesPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">My Badges</h1>
      </div>
      <UserBadges />
    </div>
  );
}
