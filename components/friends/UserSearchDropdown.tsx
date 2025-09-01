"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Search, X, UserPlus, Clock, Check, Users, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import type { Friend, FriendStatus } from "@/types/friend";
import toast from "react-hot-toast";

interface UserSearchDropdownProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: Friend[];
  isSearching: boolean;
  searchError: string | null;
  onSendFriendRequest: (friendId: string, username: string) => Promise<void>;
  onAcceptFriendRequest: (friendId: string) => Promise<void>;
  currentUserId: string;
  onClearSearch: () => void;
}

interface SearchResultItemProps {
  user: Friend;
  currentUserId: string;
  onSendFriendRequest: (friendId: string, username: string) => Promise<void>;
  onAcceptFriendRequest: (friendId: string) => Promise<void>;
}

// Helper function to determine friendship status
function getFriendshipStatus(user: Friend, currentUserId: string): { status: FriendStatus; isSender: boolean } | null {
  if (!user.status) return null;
  
  return {
    status: user.status as FriendStatus,
    isSender: user.sender_id === currentUserId,
  };
}

// Search result item component
const SearchResultItem = React.memo(function SearchResultItem({ 
  user, 
  currentUserId, 
  onSendFriendRequest, 
  onAcceptFriendRequest,
}: SearchResultItemProps) {
  const friendshipState = getFriendshipStatus(user, currentUserId);

  const handleSendRequest = React.useCallback(async () => {
    const toastId = toast.loading("Sending friend request...");
    try {
      await onSendFriendRequest(user.id, user.username);
      toast.success(`Friend request sent to ${user.username}!`, { id: toastId });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send friend request",
        { id: toastId }
      );
    }
  }, [user.id, user.username, onSendFriendRequest]);

  const handleAcceptRequest = React.useCallback(async () => {
    const toastId = toast.loading("Accepting friend request...");
    try {
      await onAcceptFriendRequest(user.id);
      toast.dismiss(toastId);
    } catch {
      toast.error("Failed to accept friend request", { id: toastId });
    }
  }, [user.id, onAcceptFriendRequest]);

  const renderActionButton = () => {
    if (!friendshipState) {
      return (
        <Button
          size="sm"
          variant="outline"
          className="bg-gray-800/30 border-gray-700/30 hover:bg-purple-500/20 hover:border-purple-500/30 hover:text-purple-400 transition-all"
          onClick={handleSendRequest}
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
            className="bg-gray-800/30 border-gray-700/30 text-gray-400 cursor-not-allowed"
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
            onClick={handleAcceptRequest}
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
            className="bg-gray-800/30 border-gray-700/30 hover:bg-purple-500/20 hover:border-purple-500/30 hover:text-purple-400 transition-all"
            onClick={handleSendRequest}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Friend
          </Button>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-between p-3 hover:bg-gray-800/50 rounded-lg transition-all group"
    >
      <div className="flex items-center gap-3">
        <Avatar className="ring-2 ring-purple-500/20 w-10 h-10 group-hover:ring-purple-500/40 transition-all">
          <AvatarImage src={user.avatar_url} alt={user.username} />
          <AvatarFallback className="bg-gray-900 text-purple-400 font-medium">
            {user.username?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-white font-medium group-hover:text-purple-400 transition-colors">
          {user.username}
        </span>
      </div>
      {renderActionButton()}
    </motion.div>
  );
});

// Main UserSearchDropdown component
export function UserSearchDropdown({
  searchQuery,
  onSearchChange,
  searchResults,
  isSearching,
  searchError,
  onSendFriendRequest,
  onAcceptFriendRequest,
  currentUserId,
  onClearSearch,
}: UserSearchDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Close dropdown when search is cleared
  React.useEffect(() => {
    if (!searchQuery) {
      setIsOpen(false);
    }
  }, [searchQuery]);

  // Auto-open when user starts typing
  React.useEffect(() => {
    if (searchQuery.trim()) {
      setIsOpen(true);
    }
  }, [searchQuery]);

  const handleSearchChange = (value: string) => {
    onSearchChange(value);
  };

  const handleClearSearch = () => {
    onSearchChange("");
    onClearSearch();
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <Popover open={isOpen && !!searchQuery.trim()} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
            <Input
              type="text"
              placeholder="Search users by username..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-10 h-12 bg-gray-900/50 border-gray-800 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all rounded-xl text-base"
              onFocus={() => searchQuery.trim() && setIsOpen(true)}
              aria-label="Search for users to add as friends"
              aria-expanded={isOpen && !!searchQuery.trim()}
              aria-haspopup="listbox"
              role="combobox"
              aria-autocomplete="list"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0 bg-gray-900/95 border-gray-800 backdrop-blur-xl shadow-2xl border-2"
          align="start"
          sideOffset={8}
          onOpenAutoFocus={(event) => {
            // Prevent the popover from stealing focus from the input
            event.preventDefault();
          }}
          role="listbox"
          aria-label="Search results for users"
        >
          <Card className="border-0 bg-transparent">
            <div className="p-3">
              <div className="space-y-2">
                {isSearching ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center py-6"
                  >
                    <div className="flex items-center gap-2 text-purple-400">
                      <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Searching...</span>
                    </div>
                  </motion.div>
                ) : searchError ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-6 text-center"
                  >
                    <UserX className="w-8 h-8 text-red-400 mb-2" />
                    <p className="text-red-400 font-medium text-sm">Search Error</p>
                    <p className="text-gray-500 text-xs">{searchError}</p>
                  </motion.div>
                ) : searchResults.length > 0 ? (
                  searchResults
                    .filter(user => user.id !== currentUserId) // Double-check to exclude current user
                    .map((user) => (
                      <div role="option" key={user.id} aria-selected={false}>
                        <SearchResultItem
                          user={user}
                          currentUserId={currentUserId}
                          onSendFriendRequest={onSendFriendRequest}
                          onAcceptFriendRequest={onAcceptFriendRequest}
                        />
                      </div>
                    ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-8 text-center"
                  >
                    <UserX className="w-12 h-12 text-gray-500 mb-3" />
                    <p className="text-gray-400 font-medium">
                      No users found matching "{searchQuery}"
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Try searching with a different username
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}