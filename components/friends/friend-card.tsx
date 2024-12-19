import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { UserPlus, UserMinus } from "lucide-react";
import { FriendCardProps } from "../../types/friend";

export function FriendCard({
  friend,
  onStatusUpdate,
  onRemove,
}: FriendCardProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500">
            {friend.username?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium text-white">{friend.username}</h3>
          {friend.display_name && (
            <p className="text-sm text-gray-400">{friend.display_name}</p>
          )}
          {friend.bio && (
            <p className="text-sm text-gray-400 mt-1 line-clamp-1">
              {friend.bio}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {friend.status === "pending" ? "Pending Request" : "Friend"}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        {friend.status === "pending" && (
          <>
            <Button
              onClick={() => onStatusUpdate(friend.id, "accepted")}
              size="sm"
              variant="secondary"
              className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Accept
            </Button>
            <Button
              onClick={() => onRemove(friend.id)}
              variant="destructive"
              size="sm"
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400"
            >
              <UserMinus className="w-4 h-4 mr-2" />
              Decline
            </Button>
          </>
        )}
        {friend.status === "accepted" && (
          <Button
            onClick={() => onRemove(friend.id)}
            variant="destructive"
            size="sm"
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400"
          >
            <UserMinus className="w-4 h-4 mr-2" />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
