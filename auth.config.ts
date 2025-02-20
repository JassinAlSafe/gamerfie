import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import { supabase } from './utils/supabaseClient'

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/home')
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false
      }
      return true
    },
    async session({ session, token }) {
      // Sync NextAuth session with Supabase
      if (token.sub && session.user) {
        const { data } = await supabase
          .from('users')
          .select('id, email, metadata')
          .eq('id', token.sub)
          .single()

        session.user.id = token.sub
        session.supabaseAccessToken = token.supabaseAccessToken
        session.user.metadata = data?.metadata || {}
      }
      return session
    },
    async jwt({ token, account, trigger, session }) {
      if (account?.provider === 'google' && account.id_token) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: account.id_token,
        })

        if (data?.session) {
          token.supabaseAccessToken = data.session.access_token
          token.supabaseRefreshToken = data.session.refresh_token
          token.sub = data.session.user.id
          token.exp = data.session.expires_at
        }
      }

      // Handle session refresh
      if (trigger === 'update' && session?.supabaseAccessToken) {
        token.supabaseAccessToken = session.supabaseAccessToken
        token.supabaseRefreshToken = session.supabaseRefreshToken
      }

      return token
    }
  },
} satisfies NextAuthConfig
