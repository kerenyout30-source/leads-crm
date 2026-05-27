import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { Navbar } from '@/components/navbar'
import { createClient } from '@/lib/supabase/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'מערכת ניהול לידים',
  description: 'Lead management CRM',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="he" dir="rtl" className="dark">
      <body className={`${inter.className} bg-background text-foreground`}>
        {user && <Navbar userEmail={user.email ?? ''} />}
        <main className="mx-auto max-w-7xl px-4 py-6">
          {children}
        </main>
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
