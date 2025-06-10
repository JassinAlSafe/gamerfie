"use client";

import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface MutualFriend {
  id: string;
  username: string;
  avatar_url?: string;
}

interface MutualFriendsProps {
  friendId: string;
  className?: string;
}

export function MutualFriends({ friendId, className }: MutualFriendsProps) {
  const [mutualFriends, setMutualFriends] = useState<MutualFriend[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchMutualFriends = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/friends/mutual?friend_id=${friendId}`
        );

        if (response.ok) {
          const data = await response.json();
          setMutualFriends(data.mutual_friends || []);
          setCount(data.count || 0);
        }
      } catch (error) {
        console.error("Error fetching mutual friends:", error);
      } finally {
        setLoading(false);
      }
    };

    if (friendId) {
      fetchMutualFriends();
    }
  }, [friendId]);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Users className="w-4 h-4 text-muted-foreground animate-pulse" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (count === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Users className="w-4 h-4 text-muted-foreground" />
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {mutualFriends.slice(0, 3).map((friend) => (
            <Avatar
              key={friend.id}
              className="w-6 h-6 border-2 border-background"
            >
              <AvatarImage src={friend.avatar_url} alt={friend.username} />
              <AvatarFallback className="text-xs">
                {friend.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <Badge variant="secondary" className="text-xs">
          {count === 1 ? "1 mutual friend" : `${count} mutual friends`}
        </Badge>
      </div>
    </div>
  );
}
