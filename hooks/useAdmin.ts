"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuthUser, useAuthStatus } from '@/stores/useAuthStoreOptimized';

interface AdminState {
  user: any | null;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAdmin = (): AdminState => {
  const { user } = useAuthUser();
  const { isInitialized } = useAuthStatus();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // If no user, clear admin status immediately
    if (!user) {
      setIsAdmin(false);
      setIsCheckingAdmin(false);
      return;
    }

    // Check if user is admin
    const checkAdminStatus = async () => {
      setIsCheckingAdmin(true);
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching admin profile:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(profile?.role === 'admin');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user, supabase]); // Re-check when user changes

  // Return state that matches the expected interface
  return {
    user,
    isAdmin: !!user && isAdmin, // Only admin if user exists AND has admin role
    isLoading: !isInitialized || isCheckingAdmin,
    isAuthenticated: !!user
  };
};