"use client";

import React from "react";
import { useAuthUser, useAuthActions, useAuthStatus } from "@/stores/useAuthStoreOptimized";
import { Button } from "@/components/ui/button";
import { forceLogout } from "@/lib/auth-logout";

/**
 * Debug component to test logout functionality
 * Remove after testing is complete
 */
export function LogoutTest() {
  const { user } = useAuthUser();
  const { signOut } = useAuthActions();
  const { isLoading } = useAuthStatus();

  const handleLogout = async () => {
    try {
      console.log('Testing logout...');
      await signOut('local');
      console.log('Logout completed');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleForceLogout = () => {
    console.log('Force logout triggered');
    forceLogout();
  };

  if (!user) {
    return (
      <div className="p-4 bg-green-900/20 border border-green-500 rounded-lg">
        <h3 className="text-green-400 font-semibold">✅ User Not Authenticated</h3>
        <p className="text-green-300 text-sm">Logout test successful - no user detected</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-yellow-900/20 border border-yellow-500 rounded-lg">
      <h3 className="text-yellow-400 font-semibold">🧪 Logout Test Component</h3>
      <p className="text-yellow-300 text-sm mb-4">User: {user.email}</p>
      
      <div className="flex gap-2">
        <Button 
          onClick={handleLogout}
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700"
        >
          {isLoading ? 'Logging out...' : 'Test Logout'}
        </Button>
        
        <Button 
          onClick={handleForceLogout}
          variant="outline"
          className="border-red-500 text-red-400 hover:bg-red-900/20"
        >
          Force Logout
        </Button>
      </div>
    </div>
  );
}