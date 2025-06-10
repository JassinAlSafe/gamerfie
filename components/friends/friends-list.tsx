"use client";

import React from "react";
import { useEffect } from "react";
import { useFriendsStore } from "../../stores/useFriendsStore";
import { Button } from "../ui/button";
import { toast } from "react-hot-toast";
import { FriendStatus } from "../../types/friend";
import { FriendCard } from "./friend-card";

export function FriendsList() {
  const {
    friends,
    isLoading,
    error,
    filter,
    setFilter,
    fetchFriends,
    removeFriend,
    updateFriendStatus,
  } = useFriendsStore();

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  const handleStatusUpdate = async (friendId: string, status: FriendStatus) => {
    try {
      await updateFriendStatus(friendId, status);
      toast.success("Friend status updated");
    } catch (error) {
      console.error("Failed to update friend status:", error);
      toast.error("Failed to update friend status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Friends</h2>
        <div className="flex gap-2">
          {(["all", "pending", "accepted"] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {friends.map((friend) => (
          <FriendCard
            key={friend.id}
            friend={friend}
            onStatusUpdate={handleStatusUpdate}
            onRemove={removeFriend}
          />
        ))}
      </div>
    </div>
  );
}
