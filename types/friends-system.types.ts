/**
 * Comprehensive type definitions for the friends system
 * This file provides centralized, well-typed interfaces for all friends-related functionality
 */

import type { Friend, FriendStatus, OnlineStatus } from './friend';

// Re-export core types from friend.ts for convenience
export type { Friend, FriendStatus, OnlineStatus };

// ============================================================================
// STATISTICS TYPES
// ============================================================================

export interface FriendStats {
  total: number;
  online: number;
  offline: number;
  recent: number;
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface FriendsSearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  friendsFilter: string;
  onFilterChange: (filter: string) => void;
  friendStats: FriendStats;
  isRefreshing: boolean;
  onRefresh: () => void;
  searchResults: Friend[];
  isSearching: boolean;
  searchError: string | null;
  searchUsers: (query: string) => void;
  clearSearch: () => void;
  onSendFriendRequest: (friendId: string, username: string) => Promise<void>;
  onAcceptFriendRequest: (friendId: string) => Promise<void>;
  currentUserId: string;
}

export interface FriendsListProps {
  friends: Friend[];
  filteredFriends: Friend[];
  searchQuery: string;
  friendsFilter: string;
  onClearFilters: () => void;
}

export interface UserSearchDropdownProps {
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

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

export interface UseFriendsPageReturn {
  // State
  isSessionLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  friendsFilter: string;
  setFriendsFilter: (filter: string) => void;
  isRefreshing: boolean;
  
  // Computed values
  acceptedFriends: Friend[];
  filteredFriends: Friend[];
  friendStats: FriendStats;
  
  // Search functionality
  searchResults: Friend[];
  isSearching: boolean;
  searchError: string | null;
  searchUsers: (query: string) => void;
  clearSearch: () => void;
  
  // Actions
  handleRefresh: () => Promise<void>;
  sendFriendRequest: (friendId: string, username: string) => Promise<void>;
  acceptFriendRequest: (friendId: string) => Promise<void>;
  clearFilters: () => void;
}

export interface UseUserSearchReturn {
  searchResults: Friend[];
  isSearching: boolean;
  searchError: string | null;
  searchUsers: (query: string, currentUserId?: string) => Promise<void>;
  clearSearch: () => void;
}

// ============================================================================
// UI HELPER TYPES
// ============================================================================

export interface FilterOption {
  value: string;
  label: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
}

export interface SearchResultItemProps {
  user: Friend;
  currentUserId: string;
  onSendFriendRequest: (friendId: string, username: string) => Promise<void>;
  onAcceptFriendRequest: (friendId: string) => Promise<void>;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface FriendRequestResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface FriendSearchResponse {
  users: Friend[];
  total: number;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface FriendsSystemError {
  code: 'SEARCH_FAILED' | 'REQUEST_FAILED' | 'ACCEPT_FAILED' | 'FETCH_FAILED' | 'SESSION_INVALID';
  message: string;
  details?: unknown;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type FriendFilterType = 'all' | 'online' | 'offline' | 'recent' | 'pending' | 'accepted';

export interface FriendshipActionPayload {
  friendId: string;
  username?: string;
  status?: FriendStatus;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export interface FriendValidation {
  isValidFriendId: (id: string) => boolean;
  isValidUsername: (username: string) => boolean;
  isValidStatus: (status: string) => status is FriendStatus;
  isValidOnlineStatus: (status: string) => status is OnlineStatus;
}

// ============================================================================
// COMPONENT STATE TYPES
// ============================================================================

export interface FriendsPageState {
  searchQuery: string;
  friendsFilter: FriendFilterType;
  isRefreshing: boolean;
  isSessionLoading: boolean;
}

export interface SearchDropdownState {
  isOpen: boolean;
  searchQuery: string;
  selectedIndex: number;
}

// ============================================================================
// PERFORMANCE OPTIMIZATION TYPES
// ============================================================================

export interface FriendsMemoizedData {
  acceptedFriends: Friend[];
  filteredFriends: Friend[];
  friendStats: FriendStats;
  searchResults: Friend[];
}

// ============================================================================
// ACCESSIBILITY TYPES
// ============================================================================

export interface FriendsA11yProps {
  'aria-label'?: string;
  'aria-expanded'?: boolean;
  'aria-haspopup'?: boolean;
  'role'?: string;
  'aria-autocomplete'?: 'list' | 'none' | 'inline' | 'both';
  'aria-selected'?: boolean;
}