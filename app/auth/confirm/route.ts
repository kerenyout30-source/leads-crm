import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Handler for Supabase email confirmation links (token_hash based).
 * Used for password reset, email confirmation, magic link, etc.
 *
 * Configure Supabase email templates to point here:
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  console.log('[Auth Confirm] hit', { hasToken: !!token_hash, type, next })

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      console.log('[Auth Confirm] verifyOtp success, redirecting to:', next)
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('[Auth Confirm] verifyOtp failed:', error)
  } else {
    console.warn('[Auth Confirm] missing token_hash or type')
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
