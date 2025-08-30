"use client";

import React from "react";
import { 
  useAuthUser, 
  useAuthStatus, 
  useAuthActions, 
  useIsAuthenticated 
} from "@/stores/useAuthStoreOptimized";

/**
 * Demo component showcasing the optimized auth store usage
 * This demonstrates the performance benefits and clean API
 */
export function AuthStoreDemo() {
  // Selective subscriptions - only re-renders when relevant data changes
  const { user, profile, isProfileLoading } = useAuthUser();
  const { isLoading, isInitialized, error } = useAuthStatus();
  const { initialize, signOut } = useAuthActions();
  const isAuthenticated = useIsAuthenticated();

  React.useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  return (
    <div className="p-6 bg-gray-900 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">
        Auth Store Demo (Optimized)
      </h2>
      
      <div className="space-y-3 text-gray-300">
        <div>
          <strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
        </div>
        
        <div>
          <strong>Is Initialized:</strong> {isInitialized ? 'Yes' : 'No'}
        </div>
        
        <div>
          <strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}
        </div>
        
        <div>
          <strong>Is Profile Loading:</strong> {isProfileLoading ? 'Yes' : 'No'}
        </div>
        
        {user && (
          <div>
            <strong>User Email:</strong> {user.email}
          </div>
        )}
        
        {profile && (
          <div>
            <strong>Profile Username:</strong> {profile.username}
          </div>
        )}
        
        {error && (
          <div className="text-red-400">
            <strong>Error:</strong> {error.userMessage}
          </div>
        )}
        
        {isAuthenticated && (
          <button
            onClick={() => signOut()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Sign Out (Optimistic)
          </button>
        )}
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>
          <strong>Performance Benefits:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>useAuthUser: Only re-renders on user/profile changes</li>
          <li>useAuthStatus: Only re-renders on loading/error changes</li>
          <li>useAuthActions: Stable references, never re-renders</li>
          <li>useIsAuthenticated: Single boolean check</li>
          <li>Optimistic updates for instant UI feedback</li>
        </ul>
      </div>
    </div>
  );
}