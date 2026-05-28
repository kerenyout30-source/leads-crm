'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { forgotPassword } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(null)
    const result = await forgotPassword(formData)
    if (result?.error) setError(result.error)
    if (result?.success) setSuccess(result.success)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-col items-center gap-2">
          <Image
            src="/logo.png"
            alt="Cashflow"
            width={80}
            height={80}
            className="rounded-lg bg-white p-1.5"
          />
          <CardTitle className="text-center text-xl">איפוס סיסמה</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              הזיני את כתובת האימייל שלך ונשלח אלייך קישור לאיפוס הסיסמה.
            </p>
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input id="email" name="email" type="email" required placeholder="your@email.com" dir="ltr" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-500">{success}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'שולח...' : 'שלח קישור לאיפוס'}
            </Button>
            <div className="text-center">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
                חזרה להתחברות
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
