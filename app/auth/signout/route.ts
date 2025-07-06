import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Check if user is signed in before attempting signout
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      // User is not signed in, but that's okay for logout
      return NextResponse.json({ success: true, message: 'Already signed out' })
    }
    
    // Sign out the user (this will clear server-side cookies)
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Server-side signout error:', error)
      return NextResponse.json(
        { success: false, error: error.message }, 
        { status: 500 }
      )
    }
    
    // Return success without redirect for API calls
    return NextResponse.json({ success: true, message: 'Signed out successfully' })
    
  } catch (error) {
    console.error('Signout route error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}