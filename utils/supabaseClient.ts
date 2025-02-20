import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient({
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  cookieOptions: {
    name: 'sb-auth',
    sameSite: 'lax',
    domain: undefined,
    secure: true,
    path: '/'
  }
})

