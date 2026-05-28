'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

function mapAuthError(code: string | undefined, message: string): string {
  switch (code) {
    case 'invalid_credentials':
      return 'אימייל או סיסמה שגויים. אם זה משתמש חדש, וודאי שהוא אושר ב-Supabase (email_confirmed_at)'
    case 'email_not_confirmed':
      return 'האימייל לא אושר - היכנסי ל-Supabase Dashboard ואשרי את המשתמש ידנית'
    case 'user_not_found':
      return 'המשתמש לא נמצא במערכת'
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'נשלחו יותר מדי בקשות. נסי שוב בעוד מספר דקות'
    case 'weak_password':
      return 'הסיסמה חלשה מדי - השתמשי לפחות ב-6 תווים'
    case 'same_password':
      return 'הסיסמה החדשה חייבת להיות שונה מהסיסמה הנוכחית'
    default:
      return `שגיאה: ${message || code || 'לא ידועה'}`
  }
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: formData.get('password') as string,
  })

  if (error) {
    console.error('[Auth] signIn failed:', { email, code: error.code, message: error.message, status: error.status })
    return { error: mapAuthError(error.code, error.message) }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function forgotPassword(formData: FormData) {
  const email = formData.get('email') as string
  if (!email) return { error: 'יש להזין כתובת אימייל' }

  const supabase = await createClient()
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = headersList.get('x-forwarded-proto') ?? 'http'
  const origin = `${protocol}://${host}`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: mapAuthError(error.code, error.message) }
  }

  return { success: 'נשלח אימייל עם קישור לאיפוס הסיסמה. בדקי גם בתיקיית הספאם.' }
}

export async function resetPassword(formData: FormData) {
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (!password || password.length < 6) {
    return { error: 'הסיסמה חייבת להיות באורך 6 תווים לפחות' }
  }
  if (password !== confirm) {
    return { error: 'הסיסמאות אינן תואמות' }
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'תוקף הקישור פג. בקשי קישור חדש לאיפוס סיסמה.' }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: mapAuthError(error.code, error.message) }
  }

  await supabase.auth.signOut()
  redirect('/login?reset=success')
}
