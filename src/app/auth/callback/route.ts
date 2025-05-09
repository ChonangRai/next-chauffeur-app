import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/user/signin?error=auth_failed`)
  }

  const supabase = createRouteHandlerClient<Database>({ cookies })

  try {
    // 1. Exchange code for session
    const { data: { session }, error: authError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (authError || !session?.user) {
      throw new Error('Failed to authenticate user')
    }

    // 2. Check if user exists in your custom table
    const { data: existingUser, error: lookupError } = await supabase
      .from('users')
      .select('id')
      .eq('id', session.user.id)
      .maybeSingle()

    if (lookupError) {
      console.error('Lookup error:', lookupError)
      throw new Error('Failed to check user existence')
    }

    // 3. Insert user if they don't exist
    if (!existingUser) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: session.user.id,
          email: session.user.email,
          first_name: session.user.user_metadata?.given_name || '',
          last_name: session.user.user_metadata?.family_name || '',
          role: 'customer',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Insert error:', insertError)
        throw new Error('Failed to create user profile')
      }
    }

    return NextResponse.redirect(`${requestUrl.origin}/user/dashboard`)

  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(`${requestUrl.origin}/user/signin?error=user_creation_failed`)
  }
}