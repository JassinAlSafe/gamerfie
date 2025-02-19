import { create } from 'zustand'
import type { User as SupabaseUser, AuthResponse } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { persist } from 'zustand/middleware'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type User = SupabaseUser & {
  profile?: Profile | null
}

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  
  // Auth Actions
  setUser: (_user: User | null) => void
  setLoading: (_isLoading: boolean) => void
  setError: (_error: string | null) => void
  signIn: (_email: string, _password: string) => Promise<AuthResponse>
  signUp: (_email: string, _password: string, _username: string) => Promise<AuthResponse>
  signOut: () => Promise<void>
  resetPassword: (_email: string) => Promise<void>
  updatePassword: (_newPassword: string) => Promise<void>

  // Session Management
  checkUser: () => Promise<void>
  refreshSession: () => Promise<void>

  // Profile Management
  updateProfile: (_profile: Partial<Profile>) => Promise<void>
  uploadAvatar: (_file: File) => Promise<string>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      const supabase = createClientComponentClient<Database>()

      return {
        user: null,
        isLoading: true,
        error: null,

        // State setters
        setUser: (_user) => set({ user: _user }),
        setLoading: (_isLoading) => set({ isLoading: _isLoading }),
        setError: (_error) => set({ error: _error }),
        
        // Auth actions
        signIn: async (_email, _password) => {
          try {
            set({ isLoading: true, error: null })
            const response = await supabase.auth.signInWithPassword({
              email: _email,
              password: _password,
            })
            if (response.error) throw response.error
            
            // Fetch profile after successful sign in
            if (response.data.user) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', response.data.user.id)
                .single()

              set({ 
                user: { ...response.data.user, profile: profile || null },
                error: null 
              })
            }
            
            return response
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to sign in'
            set({ error: message })
            throw error
          } finally {
            set({ isLoading: false })
          }
        },

        signUp: async (_email, _password, _username) => {
          try {
            set({ isLoading: true, error: null })
            
            // Create auth user
            const response = await supabase.auth.signUp({
              email: _email,
              password: _password,
              options: {
                data: {
                  username: _username
                }
              }
            })
            if (response.error) throw response.error

            // Create profile if sign up successful
            if (response.data.user) {
              const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                  id: response.data.user.id,
                  username: _username,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })

              if (profileError) throw profileError

              set({ 
                user: { 
                  ...response.data.user, 
                  profile: {
                    id: response.data.user.id,
                    username: _username,
                    avatar_url: null,
                    full_name: null,
                    bio: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  }
                },
                error: null 
              })
            }

            return response
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to sign up'
            set({ error: message })
            throw error
          } finally {
            set({ isLoading: false })
          }
        },

        signOut: async () => {
          try {
            set({ isLoading: true, error: null })
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            set({ user: null })
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to sign out'
            set({ error: message })
            console.error('Sign out error:', error)
          } finally {
            set({ isLoading: false })
          }
        },

        resetPassword: async (_email) => {
          try {
            set({ isLoading: true, error: null })
            const { error } = await supabase.auth.resetPasswordForEmail(_email)
            if (error) throw error
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to reset password'
            set({ error: message })
            throw error
          } finally {
            set({ isLoading: false })
          }
        },

        updatePassword: async (_newPassword) => {
          try {
            set({ isLoading: true, error: null })
            const { error } = await supabase.auth.updateUser({
              password: _newPassword
            })
            if (error) throw error
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update password'
            set({ error: message })
            throw error
          } finally {
            set({ isLoading: false })
          }
        },

        // Session management
        checkUser: async () => {
          try {
            set({ isLoading: true, error: null })
            const { data: { user }, error } = await supabase.auth.getUser()
            if (error) throw error

            // Fetch user profile if we have a user
            if (user) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

              set({ 
                user: { ...user, profile: profile || null },
                error: null 
              })
            } else {
              set({ user: null, error: null })
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to check user'
            set({ error: message, user: null })
            console.error('Auth error:', error)
          } finally {
            set({ isLoading: false })
          }
        },

        refreshSession: async () => {
          try {
            set({ isLoading: true, error: null })
            const { data: { session }, error } = await supabase.auth.getSession()
            if (error) throw error
            
            if (session?.user) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()

              set({ 
                user: { ...session.user, profile: profile || null },
                error: null 
              })
            } else {
              set({ user: null, error: null })
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to refresh session'
            set({ error: message })
            throw error
          } finally {
            set({ isLoading: false })
          }
        },

        // Profile management
        updateProfile: async (_profile) => {
          try {
            const user = get().user
            if (!user) throw new Error('No user logged in')

            set({ isLoading: true, error: null })
            const { error } = await supabase
              .from('profiles')
              .update({
                ..._profile,
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id)

            if (error) throw error

            // Update local state
            if (!user.profile) throw new Error('No profile found')
            
            set({ 
              user: { 
                ...user, 
                profile: { 
                  ...user.profile,  // Base profile with all required fields
                  ..._profile,      // New partial updates
                  updated_at: new Date().toISOString() 
                } as Profile
              } 
            })
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update profile'
            set({ error: message })
            throw error
          } finally {
            set({ isLoading: false })
          }
        },

        uploadAvatar: async (_file) => {
          try {
            const user = get().user
            if (!user) throw new Error('No user logged in')

            set({ isLoading: true, error: null })
            
            const fileExt = _file.name.split('.').pop()
            const filePath = `${user.id}/avatar.${fileExt}`

            // Upload file
            const { error: uploadError } = await supabase.storage
              .from('avatars')
              .upload(filePath, _file, { upsert: true })

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(filePath)

            // Update profile with new avatar URL
            await get().updateProfile({ avatar_url: publicUrl })

            return publicUrl
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to upload avatar'
            set({ error: message })
            throw error
          } finally {
            set({ isLoading: false })
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