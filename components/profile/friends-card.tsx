import React from "react";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { Friend } from "@/types/friend";

interface FriendsCardProps {
  friends: Friend[];
  pendingCount: number;
  onViewAll: () => void;
}

export function FriendsCard({
  friends,
  pendingCount,
  onViewAll,
}: FriendsCardProps) {
  return (
    <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Friends</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewAll}
          className="text-purple-400 hover:text-purple-300"
        >
          View All
        </Button>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          <span className="text-white font-medium">{friends.length}</span>
        </div>
        {pendingCount > 0 && (
          <div className="text-sm text-yellow-400">
            {pendingCount} pending request
            {pendingCount !== 1 ? "s" : ""}
          </div>
        )}
      </div>
      <div className="space-y-3">
        {friends.slice(0, 3).map((friend) => (
          <div
            key={friend.id}
            className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50"
          >
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              {friend.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-white">
                {friend.username}
              </p>
            </div>
          </div>
        ))}
        {friends.length === 0 && (
          <p className="text-gray-400 text-sm">No friends yet</p>
        )}
      </div>
    </div>
  );
}
