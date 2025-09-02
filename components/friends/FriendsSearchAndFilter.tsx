"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Filter, 
  X, 
  Users2, 
  UserCheck, 
  UserX, 
  Clock, 
  RefreshCw 
} from "lucide-react";
import { UserSearchDropdown } from "./UserSearchDropdown";
import type { 
  FriendsSearchAndFilterProps, 
  FilterOption, 
  Friend 
} from "@/types/friends-system.types";

export const FriendsSearchAndFilter: React.FC<FriendsSearchAndFilterProps> = ({
  searchQuery,
  onSearchChange,
  friendsFilter,
  onFilterChange,
  friendStats,
  isRefreshing,
  onRefresh,
  searchResults,
  isSearching,
  searchError,
  searchUsers,
  clearSearch,
  onSendFriendRequest,
  onAcceptFriendRequest,
  currentUserId,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");

  const filterOptions: FilterOption[] = [
    { value: "all", label: "All Friends", count: friendStats.total, icon: Users2 },
    { value: "online", label: "Online", count: friendStats.online, icon: UserCheck },
    { value: "offline", label: "Offline", count: friendStats.offline, icon: UserX },
    { value: "recent", label: "Recent", count: friendStats.recent, icon: Clock },
  ];

  return (
    <Card className="glass-effect border-gray-700/30 bg-gray-900/20 backdrop-blur-xl hover:border-gray-600/40 transition-all duration-300 group animate-fade-in-up">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Search className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white tracking-tight">
                Find & Filter Friends
              </h3>
              <p className="text-sm text-gray-400">
                Search for new users or filter your existing friends
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="border-gray-700/50 hover:border-purple-500/50 hover:bg-purple-500/10"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Friends Filter Bar */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-10 bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="border-gray-700/50 hover:border-purple-500/50 hover:bg-purple-500/10 relative"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
              {friendsFilter !== "all" && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  1
                </Badge>
              )}
            </Button>
          </div>

          {/* Quick Friend Filters */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {filterOptions.map((filter) => {
              const IconComponent = filter.icon;
              return (
                <Button
                  key={filter.value}
                  variant={friendsFilter === filter.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onFilterChange(filter.value)}
                  className={`whitespace-nowrap ${
                    friendsFilter === filter.value
                      ? "bg-purple-500 hover:bg-purple-600 border-purple-500"
                      : "border-gray-700/50 hover:border-purple-500/50 hover:bg-purple-500/10"
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {filter.label}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {filter.count}
                  </Badge>
                </Button>
              );
            })}
          </div>

          {/* Active Filters Pills */}
          {(searchQuery || friendsFilter !== "all") && (
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => onSearchChange("")}
                    className="ml-1 hover:text-purple-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {friendsFilter !== "all" && (
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Status: {friendsFilter}
                  <button
                    onClick={() => onFilterChange("all")}
                    className="ml-1 hover:text-blue-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Add Friends Section */}
        <div className="border-t border-gray-700/30 pt-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Add New Friends</h4>
          <UserSearchDropdown
            searchQuery={userSearchQuery}
            onSearchChange={(query) => {
              setUserSearchQuery(query);
              if (query.trim()) {
                searchUsers(query);
              }
            }}
            searchResults={searchResults}
            isSearching={isSearching}
            searchError={searchError}
            onSendFriendRequest={onSendFriendRequest}
            onAcceptFriendRequest={onAcceptFriendRequest}
            currentUserId={currentUserId}
            onClearSearch={() => {
              setUserSearchQuery("");
              clearSearch();
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};