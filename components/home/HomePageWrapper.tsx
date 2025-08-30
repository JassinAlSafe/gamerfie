"use client";

import React, { useEffect, useRef, useState } from "react";
import { AuthenticatedHome } from "./authenticated-home";
import { UnauthenticatedHome } from "./unauthenticated-home";
import { useAuthUser, useAuthStatus } from "@/stores/useAuthStoreOptimized";
import { HeaderSkeleton } from "../ui/header/header-skeleton";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

interface HomePageWrapperProps {
  serverUser?: User | null;
}

/**
 * Client-side wrapper that overrides server-side authentication decision
 * This ensures proper sync between client-side logout and page content
 */
export function HomePageWrapper({ serverUser }: HomePageWrapperProps) {
  const { user } = useAuthUser();
  const { isInitialized } = useAuthStatus();
  const router = useRouter();
  const prevUserRef = useRef<User | null>(serverUser);
  
  // Track if we detected a potential logout scenario
  const [potentialLogout, setPotentialLogout] = useState(false);

  // Detect potential logout scenarios
  useEffect(() => {
    // If we have serverUser but localStorage indicates we might have logged out
    if (serverUser && typeof window !== 'undefined') {
      const hasLoggedOut = localStorage.getItem('logged-out') === 'true' || 
                          !localStorage.getItem('supabase.auth.token');
      if (hasLoggedOut) {
        console.log('🚨 Potential logout detected - serverUser exists but client indicates logout');
        setPotentialLogout(true);
      }
    }
  }, [serverUser]);

  // Handle logout detection and force page refresh  
  useEffect(() => {
    if (isInitialized) {
      const hadUser = prevUserRef.current !== null;
      const hasUser = user !== null;
      
      // If user was logged in but now is logged out, refresh the page
      // This ensures server-side rendering reflects the logout
      if (hadUser && !hasUser) {
        console.log('Logout detected, refreshing page to sync server state');
        if (typeof window !== 'undefined') {
          localStorage.setItem('logged-out', 'true');
        }
        router.refresh();
      }
      
      prevUserRef.current = user;
      
      // Clear logout flag if we successfully have a user
      if (hasUser && potentialLogout) {
        setPotentialLogout(false);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('logged-out');
        }
      }
    }
  }, [user, isInitialized, router, potentialLogout]);

  // Show loading while initializing (AuthInitializer handles initialization)
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
        <div className="container mx-auto px-4 py-8">
          <HeaderSkeleton />
          <div className="mt-8 space-y-6">
            <div className="h-32 bg-gray-800 rounded-lg animate-pulse" />
            <div className="h-48 bg-gray-800 rounded-lg animate-pulse" />
            <div className="h-64 bg-gray-800 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // CRITICAL FIX: Enhanced client/server state synchronization with logout detection
  // 1. If potential logout detected, ignore serverUser and show loading until client initializes
  // 2. If client initialized, ALWAYS trust client state 
  // 3. If client not initialized and no logout detected, use serverUser
  // 4. Otherwise, show unauthenticated
  let effectiveUser: User | null = null;
  
  if (potentialLogout && !isInitialized) {
    // Potential logout detected - don't trust serverUser, wait for client initialization
    effectiveUser = null;
  } else if (isInitialized) {
    // Client is initialized - trust client state completely
    effectiveUser = user;
  } else if (serverUser && !potentialLogout) {
    // Client not initialized, no logout detected - use serverUser
    effectiveUser = serverUser;
  } else {
    // Default to unauthenticated
    effectiveUser = null;
  }

  // DEBUG: Log the decision-making process
  console.log('🏠 HomePageWrapper decision:', {
    isInitialized,
    hasClientUser: !!user,
    hasServerUser: !!serverUser,
    potentialLogout,
    hasEffectiveUser: !!effectiveUser,
    willShowAuthenticated: !!effectiveUser,
    decision: potentialLogout && !isInitialized ? 'WAITING_FOR_CLIENT' : 
             isInitialized ? 'USING_CLIENT_STATE' : 
             serverUser && !potentialLogout ? 'USING_SERVER_STATE' : 'UNAUTHENTICATED'
  });

  if (effectiveUser) {
    console.log('🏠 Showing AuthenticatedHome');
    return <AuthenticatedHome user={effectiveUser} />;
  }

  console.log('🏠 Showing UnauthenticatedHome');
  return <UnauthenticatedHome />;
}