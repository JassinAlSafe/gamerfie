import React from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { UserPlus, UserMinus, Clock } from "lucide-react";
import { FriendCardProps } from "../../types/friend";
import { useSession } from "@supabase/auth-helpers-react";

export function FriendCard({
  friend,
  onStatusUpdate,
  onRemove,
}: FriendCardProps) {
  const session = useSession();
  const currentUserId = session?.user?.id;

  // Check if the current user is the sender of the friend request
  const isSender = friend.sender_id === currentUserId;
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
        </div>
      </div>
      <div className="flex items-center gap-2">
        {friend.status === "pending" &&
          (isSender ? (
            // Show "Sent" status for requests we've sent
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Sent</span>
            </div>
          ) : (
            // Show accept/decline buttons for requests we've received
            <>
              <Button
                onClick={() => onStatusUpdate(friend.id, "accepted")}
                variant="default"
                size="sm"
                className="bg-green-500/10 hover:bg-green-500/20 text-green-400"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Accept
              </Button>
              <Button
                onClick={() => onStatusUpdate(friend.id, "declined")}
                variant="destructive"
                size="sm"
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400"
              >
                Decline
              </Button>
            </>
          ))}
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
