import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  console.log('[Auth Callback] hit', { hasCode: !!code, next, fullUrl: request.url })

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      console.log('[Auth Callback] code exchanged successfully, redirecting to:', next)
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('[Auth Callback] exchangeCodeForSession failed:', error)
  } else {
    console.warn('[Auth Callback] no code in URL - likely Supabase redirect URL not whitelisted in Dashboard')
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
