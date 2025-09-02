"use client";

import { useState, useCallback } from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileNav } from "@/components/profile/profile-nav";
import { ProfileCardModal } from "@/components/profile/ProfileCardModal";
import { useProfile } from "@/hooks/Profile/use-profile";
import { useFriendsPage } from "@/hooks/Profile/use-friends-page";
import { useFriendsHandlers } from "@/hooks/friends-page-handlers";
import { useFriendRequests } from "@/hooks/use-friend-requests";
import { FriendsSearchAndFilter } from "@/components/friends/FriendsSearchAndFilter";
import { FriendsList } from "@/components/friends/FriendsList";
import { FriendRequestsSections } from "@/components/friends/FriendRequestsSections";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function ProfileFriendsPage() {
  
  // Profile modal state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Profile data hook
  const {
    profile,
    isLoading: profileLoading,
    error: profileError,
    gameStats,
  } = useProfile();

  // Friends page logic hook  
  const {
    isSessionLoading,
    searchQuery,
    setSearchQuery,
    friendsFilter,
    setFriendsFilter,
    isRefreshing,
    acceptedFriends,
    filteredFriends,
    friendStats,
    searchResults,
    isSearching,
    searchError,
    searchUsers,
    clearSearch,
    handleRefresh,
    sendFriendRequest,
    acceptFriendRequest,
    clearFilters,
  } = useFriendsPage();

  // Friend requests hook
  const {
    sentRequests,
    receivedRequests,
    isLoading: requestsLoading,
    fetchFriendRequests,
    cancelSentRequest,
    acceptReceivedRequest,
    declineReceivedRequest,
  } = useFriendRequests(profile?.id);

  // New working handlers (replaces the old TODO functions)
  const { handleFollowUser, handleUnfollowUser, handleMessageUser, handleShareProfile } = useFriendsHandlers({
    currentUserId: profile?.id
  });

  // Profile modal handlers
  const handleOpenProfile = useCallback((userId: string) => {
    setSelectedUserId(userId);
    setProfileModalOpen(true);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setProfileModalOpen(false);
    setSelectedUserId(null);
  }, []);

  // Loading state
  if (profileLoading || isSessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState />
      </div>
    );
  }

  // Error state
  if (profileError || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorState error={profileError?.message || "Profile not found"} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 h-[280px] sm:h-[300px] bg-gradient-to-b from-purple-900/50 via-gray-900/50 to-gray-950" />

        {/* Profile Header */}
        <div className="relative">
          <ProfileHeader
            profile={profile}
            stats={
              gameStats
                ? {
                    ...gameStats,
                    totalGames: gameStats.total_played,
                    totalPlaytime: 0,
                    recentlyPlayed: [],
                    mostPlayed: [],
                  }
                : {
                    total_played: 0,
                    played_this_year: 0,
                    backlog: 0,
                    totalGames: 0,
                    totalPlaytime: 0,
                    recentlyPlayed: [],
                    mostPlayed: [],
                  }
            }
            onProfileUpdate={() => {}}
          />
        </div>
      </div>

      {/* Profile Navigation */}
      <div className="bg-gray-950/20 backdrop-blur-sm">
        <ProfileNav />
      </div>

      {/* Profile Content */}
      <div className="flex-grow bg-gradient-to-b from-gray-950 to-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6 px-2 sm:px-0">
            <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
              Friends
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column - Search & Friends List */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Enhanced Search & Filter Section */}
              <FriendsSearchAndFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                friendsFilter={friendsFilter}
                onFilterChange={setFriendsFilter}
                friendStats={friendStats}
                isRefreshing={isRefreshing}
                onRefresh={handleRefresh}
                searchResults={searchResults}
                isSearching={isSearching}
                searchError={searchError}
                searchUsers={searchUsers}
                clearSearch={clearSearch}
                onSendFriendRequest={sendFriendRequest}
                onAcceptFriendRequest={acceptFriendRequest}
                currentUserId={profile.id}
              />

              {/* Friends List */}
              <FriendsList
                friends={acceptedFriends}
                filteredFriends={filteredFriends}
                searchQuery={searchQuery}
                friendsFilter={friendsFilter}
                onClearFilters={clearFilters}
                onProfileClick={handleOpenProfile}
              />
            </div>

            {/* Right Column - Sidebar (Your Favorite Quick Actions + Friend Requests!) */}
            <div className="space-y-4 sm:space-y-6">
              {/* Quick Actions Card */}
              <Card
                className="glass-effect border-gray-700/30 bg-gray-900/20 backdrop-blur-xl hover:border-gray-600/40 transition-all duration-300 group animate-fade-in-up"
                style={{ animationDelay: "0.3s" }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white tracking-tight">
                          Quick Actions
                        </h3>
                        <p className="text-sm text-gray-400">
                          Manage your network
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-center p-4 border border-gray-700/30 rounded-lg bg-gray-800/20">
                      <Users className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                      <h4 className="text-white font-medium mb-2">
                        Invite Friends
                      </h4>
                      <p className="text-sm text-gray-400 mb-4">
                        Share your gaming journey with friends
                      </p>
                      <Button
                        onClick={() => handleOpenProfile(profile.id)}
                        variant="outline"
                        size="sm"
                        className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                      >
                        Share Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Friend Requests Section */}
              <div
                className="animate-fade-in-up"
                style={{ animationDelay: "0.5s" }}
              >
                <FriendRequestsSections
                  sentRequests={sentRequests}
                  receivedRequests={receivedRequests}
                  isLoading={requestsLoading}
                  onRefresh={fetchFriendRequests}
                  onAcceptRequest={acceptReceivedRequest}
                  onDeclineRequest={declineReceivedRequest}
                  onCancelRequest={cancelSentRequest}
                  onMessage={handleMessageUser}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Card Modal */}
      <ProfileCardModal
        isOpen={profileModalOpen}
        userId={selectedUserId || ""}
        onClose={handleCloseProfile}
        onFollow={handleFollowUser}
        onUnfollow={handleUnfollowUser}
        onMessage={handleMessageUser}
        onShare={handleShareProfile}
        currentUserId={profile?.id}
      />
    </div>
  );
}