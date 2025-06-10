declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      metadata?: any;
    };
    supabaseAccessToken?: string;
    supabaseRefreshToken?: string;
  }
} 