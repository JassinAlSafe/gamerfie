import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Friend } from "@/types/friend";

interface FriendsSectionProps {
  friends: Friend[];
}

export const FriendsSection: React.FC<FriendsSectionProps> = ({ friends }) => {
  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-400" />
          Friends
        </CardTitle>
        <Link
          href="/friends"
          className="text-sm text-blue-400 hover:underline"
        >
          View All
        </Link>
      </CardHeader>
      <CardContent>
        {friends.length > 0 ? (
          <div className="space-y-4">
            {friends.slice(0, 3).map((friend) => (
              <div
                key={friend.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden">
                  {friend.avatar_url ? (
                    <Image
                      src={friend.avatar_url}
                      alt={friend.username}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      {friend.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">
                    {friend.username}
                  </p>
                  <p className="text-sm text-gray-400">
                    {friend.online_status === "online" ? (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-green-400">Online</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                        <span>Offline</span>
                      </span>
                    )}
                  </p>
                </div>
                <Link
                  href={`/profile/${friend.id}`}
                  className="text-xs px-2 py-1 rounded bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 transition-colors"
                >
                  View
                </Link>
              </div>
            ))}
            {friends.length > 3 && (
              <div className="text-center pt-2">
                <Link
                  href="/friends"
                  className="text-sm text-blue-400 hover:underline"
                >
                  +{friends.length - 3} more friends
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-400 mb-3">No friends yet.</p>
            <Link href="/friends/find">
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-900/30 text-blue-400 border-blue-800 hover:bg-blue-900/50"
              >
                Find Friends
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};