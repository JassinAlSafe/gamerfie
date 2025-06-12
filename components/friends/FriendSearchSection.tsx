"use client";

import { useState, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, X, UserPlus, Users, Clock, Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Friend, FriendStatus } from "@/types/friend";

interface FriendSearchSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Friend[];
  isSearching: boolean;
  onSearch: (query: string) => void;
  onSendFriendRequest: (friendId: string) => Promise<void>;
  getFriendshipStatus: (user: Friend) => { status: FriendStatus; isSender: boolean } | null;
}

export const FriendSearchSection = memo(function FriendSearchSection({
  searchQuery,
  setSearchQuery,
  searchResults,
  isSearching,
  onSearch,
  onSendFriendRequest,
  getFriendshipStatus,
}: FriendSearchSectionProps) {
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    onSearch(query);
  }, [setSearchQuery, onSearch]);

  const handleSendFriendRequest = useCallback(async (friendId: string) => {
    setPendingRequests(prev => new Set(prev).add(friendId));
    try {
      await onSendFriendRequest(friendId);
    } finally {
      setPendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(friendId);
        return newSet;
      });
    }
  }, [onSendFriendRequest]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    onSearch("");
  }, [setSearchQuery, onSearch]);

  const renderActionButton = useCallback((user: Friend) => {
    const isPending = pendingRequests.has(user.id);
    const friendshipState = getFriendshipStatus(user);

    if (isPending) {
      return (
        <Button
          size="sm"
          variant="outline"
          disabled
          className="bg-muted/20 border-muted/30 text-muted-foreground cursor-not-allowed"
        >
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Sending...
        </Button>
      );
    }

    if (!friendshipState) {
      return (
        <Button
          size="sm"
          variant="outline"
          className="bg-card/30 border-border/30 hover:bg-purple-500/20 hover:border-purple-500/30 hover:text-purple-400 transition-all"
          onClick={() => handleSendFriendRequest(user.id)}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Friend
        </Button>
      );
    }

    switch (friendshipState.status) {
      case "pending":
        return friendshipState.isSender ? (
          <Button
            size="sm"
            variant="outline"
            className="bg-muted/20 border-muted/30 text-muted-foreground cursor-not-allowed"
            disabled
          >
            <Clock className="w-4 h-4 mr-2" />
            Request Sent
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30 text-purple-400"
            onClick={() => handleSendFriendRequest(user.id)}
          >
            <Check className="w-4 h-4 mr-2" />
            Accept Request
          </Button>
        );

      case "accepted":
        return (
          <Button
            size="sm"
            variant="outline"
            className="bg-green-500/20 border-green-500/30 text-green-400 cursor-not-allowed"
            disabled
          >
            <Users className="w-4 h-4 mr-2" />
            Friends
          </Button>
        );

      case "declined":
        return (
          <Button
            size="sm"
            variant="outline"
            className="bg-card/30 border-border/30 hover:bg-purple-500/20 hover:border-purple-500/30 hover:text-purple-400 transition-all"
            onClick={() => handleSendFriendRequest(user.id)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Friend
          </Button>
        );

      default:
        return null;
    }
  }, [pendingRequests, getFriendshipStatus, handleSendFriendRequest]);

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20">
          <Search className="h-5 w-5 text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Find Friends</h2>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search users by username..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-10 h-12 bg-card/50 border-border/30 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all rounded-xl"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {isSearching && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Card className="p-4 bg-card/80 border-border/30 backdrop-blur-sm rounded-xl">
            <div className="space-y-3">
              {searchResults.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground font-medium">
                    Found {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}
                  </p>
                  {searchResults.map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between p-3 hover:bg-muted/20 rounded-lg transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="ring-2 ring-border/20 group-hover:ring-purple-500/30 transition-all">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                            {user.username?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground group-hover:text-purple-400 transition-colors">
                            {user.username}
                          </p>
                          {user.display_name && (
                            <p className="text-sm text-muted-foreground">
                              {user.display_name}
                            </p>
                          )}
                        </div>
                      </div>
                      {renderActionButton(user)}
                    </motion.div>
                  ))}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">
                    No users found for &ldquo;{searchQuery}&rdquo;
                  </p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Try searching with a different username
                  </p>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
});