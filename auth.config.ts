import Google from "next-auth/providers/google"
import { supabase } from './utils/supabaseClient'

// Define the NextAuthConfig type locally since it's causing issues
interface NextAuthConfig {
  providers: any[];
  pages?: {
    signIn?: string;
  };
  callbacks?: {
    authorized?: (params: { auth: any; request: { nextUrl: URL } }) => boolean | Promise<boolean>;
    session?: (params: { session: any; token: any }) => Promise<any>;
    jwt?: (params: { token: any; account: any; trigger?: string; session?: any }) => Promise<any>;
  };
}

// Extend the Session type to include our custom properties
declare module "next-auth" {
  interface Session {
    supabaseAccessToken?: string;
    supabaseRefreshToken?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      metadata?: any;
    }
  }
}

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
        const { data } = await supabase.auth.signInWithIdToken({
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
