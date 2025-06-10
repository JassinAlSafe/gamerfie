"use client";

import React from "react";
import { useState } from "react";
import { useFriendsStore } from "../../stores/useFriendsStore";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Search, UserPlus } from "lucide-react";
import { toast } from "react-hot-toast";
import { useDebounce } from "../../hooks/Settings/useDebounce";

export function FriendSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { addFriend } = useFriendsStore();
  const debouncedSearch = useDebounce(searchUsers, 300);

  async function searchUsers(query: string | undefined) {
    console.log("Search query:", query, typeof query);

    if (!query || typeof query !== "string") {
      console.log("Invalid query, clearing results");
      setResults([]);
      return;
    }

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      console.log("Empty query after trim, clearing results");
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      console.log("Fetching results for:", trimmedQuery);
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(trimmedQuery)}`
      );
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      console.log("Search results:", data);
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search users");
    } finally {
      setIsSearching(false);
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log("Search input value:", value);
    setQuery(value);
    debouncedSearch(value);
  };

  const handleAddFriend = async (userId: string) => {
    try {
      await addFriend({ friendId: userId });
      toast.success("Friend request sent!");
      setResults(results.filter((user) => user.id !== userId));
    } catch (_error) {
      toast.error("Failed to send friend request");
    }
  };

  return (
    <div className="space-y-4 bg-gray-900/50 rounded-xl p-4 backdrop-blur-sm border border-white/5">
      <div>
        <h2 className="text-xl font-bold mb-4">Find Friends</h2>
        <div className="relative">
          <Input
            type="search"
            placeholder="Search users by username..."
            value={query}
            onChange={handleSearch}
            className="pl-10 bg-gray-800/50 border-gray-700 focus:border-purple-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {isSearching ? (
        <div className="flex items-center justify-center py-8">
          <div className="loading loading-spinner loading-md text-purple-500" />
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {results.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-medium">
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-white">{user.username}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleAddFriend(user.id)}
                className="ml-4 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Friend
              </Button>
            </div>
          ))}
        </div>
      ) : query && !isSearching ? (
        <div className="text-center py-8 text-gray-400">
          No users found matching "{query}"
        </div>
      ) : null}
    </div>
  );
}
