"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Gamepad2,
  Users,
  Star,
  Calendar,
  Loader2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { debounce } from "lodash";

import Image from "next/image";

interface GameResult {
  id: string;
  name: string;
  cover_url?: string;
  igdb_id?: number;
  similarity_score?: number;
  release_date?: string;
  rating?: number;
}

interface UserResult {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  similarity_score?: number;
}

interface SearchState {
  query: string;
  isOpen: boolean;
  isLoading: boolean;
  games: GameResult[];
  users: UserResult[];
  selectedIndex: number;
  searchType: "all" | "games" | "users";
}

export function EnhancedSearch() {
  const [state, setState] = useState<SearchState>({
    query: "",
    isOpen: false,
    isLoading: false,
    games: [],
    users: [],
    selectedIndex: -1,
    searchType: "all",
  });

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  // Debounced search function
  const debouncedSearch = useRef(
    debounce(async (query: string, searchType: "all" | "games" | "users") => {
      if (query.length < 2) {
        setState((prev) => ({
          ...prev,
          games: [],
          users: [],
          isLoading: false,
        }));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        const promises = [];

        // Search games if needed
        if (searchType === "all" || searchType === "games") {
          promises.push(
            supabase.rpc("search_games", {
              search_term: query,
              limit_count: 8,
            })
          );
        } else {
          promises.push(Promise.resolve({ data: [] }));
        }

        // Search users if needed
        if (searchType === "all" || searchType === "users") {
          promises.push(
            supabase.rpc("search_users", {
              search_term: query,
              limit_count: 5,
            })
          );
        } else {
          promises.push(Promise.resolve({ data: [] }));
        }

        const [gamesResult, usersResult] = await Promise.all(promises);

        setState((prev) => ({
          ...prev,
          games: gamesResult.data || [],
          users: usersResult.data || [],
          isLoading: false,
          selectedIndex: -1,
        }));
      } catch (error) {
        console.error("Search error:", error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    }, 300)
  ).current;

  // Trigger search when query or type changes
  useEffect(() => {
    if (state.query.trim()) {
      debouncedSearch(state.query, state.searchType);
    } else {
      setState((prev) => ({ ...prev, games: [], users: [], isLoading: false }));
    }
  }, [state.query, state.searchType, debouncedSearch]);

  const handleSelection = useCallback(() => {
    const totalGames = state.games.length;

    if (state.selectedIndex >= 0) {
      if (state.selectedIndex < totalGames) {
        // Game selected
        const game = state.games[state.selectedIndex];
        router.push(`/game/${game.id}`);
      } else {
        // User selected
        const user = state.users[state.selectedIndex - totalGames];
        router.push(`/profile/${user.id}`);
      }
      handleClose();
    }
  }, [state.games, state.selectedIndex, state.users, router]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!state.isOpen) return;

      const totalResults = state.games.length + state.users.length;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setState((prev) => ({
            ...prev,
            selectedIndex:
              prev.selectedIndex < totalResults - 1
                ? prev.selectedIndex + 1
                : prev.selectedIndex,
          }));
          break;
        case "ArrowUp":
          e.preventDefault();
          setState((prev) => ({
            ...prev,
            selectedIndex: prev.selectedIndex > 0 ? prev.selectedIndex - 1 : -1,
          }));
          break;
        case "Enter":
          e.preventDefault();
          handleSelection();
          break;
        case "Escape":
          e.preventDefault();
          handleClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    state.isOpen,
    state.selectedIndex,
    state.games,
    state.users,
    handleSelection,
  ]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setState((prev) => ({ ...prev, isOpen: false }));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setState((prev) => ({
      ...prev,
      query,
      isOpen: true,
      selectedIndex: -1,
    }));
  };

  const handleGameClick = (game: GameResult) => {
    router.push(`/game/${game.id}`);
    handleClose();
  };

  const handleUserClick = (user: UserResult) => {
    router.push(`/profile/${user.id}`);
    handleClose();
  };

  const handleClose = () => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
      selectedIndex: -1,
    }));
  };

  const clearSearch = () => {
    setState((prev) => ({
      ...prev,
      query: "",
      games: [],
      users: [],
      isOpen: false,
      selectedIndex: -1,
    }));
    inputRef.current?.focus();
  };

  const getTotalResults = () => state.games.length + state.users.length;

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search games, users..."
          value={state.query}
          onChange={handleInputChange}
          onFocus={() => setState((prev) => ({ ...prev, isOpen: true }))}
          className="pl-10 pr-20 bg-gray-900/50 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500"
        />

        {/* Search Type Toggle */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {state.query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              <X className="h-3 w-3" />
            </Button>
          )}

          <select
            value={state.searchType}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                searchType: e.target.value as "all" | "games" | "users",
              }))
            }
            className="bg-transparent text-xs text-gray-400 border-none outline-none"
          >
            <option value="all">All</option>
            <option value="games">Games</option>
            <option value="users">Users</option>
          </select>
        </div>
      </div>

      {/* Search Results */}
      {state.isOpen && (state.query.length >= 2 || state.isLoading) && (
        <Card className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 border-gray-700 backdrop-blur-sm z-50 max-h-96 overflow-hidden">
          <CardContent className="p-0">
            {state.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                <span className="ml-2 text-gray-400">Searching...</span>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {/* Games Section */}
                {state.games.length > 0 && (
                  <div>
                    <div className="px-4 py-2 border-b border-gray-700">
                      <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <Gamepad2 className="h-4 w-4" />
                        Games ({state.games.length})
                      </h3>
                    </div>
                    {state.games.map((game, index) => (
                      <div
                        key={game.id}
                        onClick={() => handleGameClick(game)}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                          state.selectedIndex === index
                            ? "bg-purple-600/20"
                            : "hover:bg-gray-800/50"
                        }`}
                      >
                        <div className="w-10 h-10 rounded bg-gray-800 overflow-hidden flex-shrink-0">
                          {game.cover_url ? (
                            <Image
                              src={game.cover_url}
                              alt={game.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Gamepad2 className="h-5 w-5" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">
                            {game.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {game.similarity_score && (
                              <Badge variant="secondary" className="text-xs">
                                {Math.round(game.similarity_score * 100)}% match
                              </Badge>
                            )}
                            {game.rating && (
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {game.rating.toFixed(1)}
                              </div>
                            )}
                            {game.release_date && (
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Calendar className="h-3 w-3" />
                                {new Date(game.release_date).getFullYear()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Users Section */}
                {state.users.length > 0 && (
                  <div>
                    <div className="px-4 py-2 border-b border-gray-700">
                      <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Users ({state.users.length})
                      </h3>
                    </div>
                    {state.users.map((user, index) => (
                      <div
                        key={user.id}
                        onClick={() => handleUserClick(user)}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                          state.selectedIndex === state.games.length + index
                            ? "bg-purple-600/20"
                            : "hover:bg-gray-800/50"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden flex-shrink-0">
                          {user.avatar_url ? (
                            <Image
                              src={user.avatar_url}
                              alt={user.username}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white">
                            {user.username}
                          </p>
                          {user.display_name &&
                            user.display_name !== user.username && (
                              <p className="text-sm text-gray-400">
                                {user.display_name}
                              </p>
                            )}
                          {user.bio && (
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {user.bio}
                            </p>
                          )}
                          {user.similarity_score && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {Math.round(user.similarity_score * 100)}% match
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {!state.isLoading &&
                  getTotalResults() === 0 &&
                  state.query.length >= 2 && (
                    <div className="px-4 py-8 text-center">
                      <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400">
                        No results found for "{state.query}"
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Try adjusting your search terms or search type
                      </p>
                    </div>
                  )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
