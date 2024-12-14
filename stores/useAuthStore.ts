import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
  checkUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => {
      const supabase = createClientComponentClient()

      return {
        user: null,
        isLoading: true,
        setUser: (user) => set({ user }),
        setLoading: (loading) => set({ isLoading: loading }),
        
        signOut: async () => {
          try {
            await supabase.auth.signOut()
            set({ user: null })
          } catch (error) {
            console.error('Sign out error:', error)
          }
        },

        checkUser: async () => {
          try {
            const { data: { user }, error } = await supabase.auth.getUser()
            if (error) throw error
            set({ user, isLoading: false })
          } catch (error) {
            console.error('Auth error:', error)
            set({ user: null, isLoading: false })
          }
        }
      }
    },
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user })
    }
  )
) 