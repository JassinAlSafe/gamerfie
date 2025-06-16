"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

interface AdminState {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAdmin = (): AdminState => {
  const [state, setState] = useState<AdminState>({
    user: null,
    isAdmin: false,
    isLoading: true,
    isAuthenticated: false,
  });

  const supabase = createClient();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setState({
            user: null,
            isAdmin: false,
            isLoading: false,
            isAuthenticated: false,
          });
          return;
        }

        // Check if user is admin
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        }

        setState({
          user: session.user,
          isAdmin: profile?.role === 'admin',
          isLoading: false,
          isAuthenticated: true,
        });
      } catch (error) {
        console.error('Error checking admin status:', error);
        setState({
          user: null,
          isAdmin: false,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    checkAdminStatus();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setState({
            user: null,
            isAdmin: false,
            isLoading: false,
            isAuthenticated: false,
          });
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          checkAdminStatus();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return state;
};