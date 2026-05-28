import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { Navbar } from '@/components/navbar'
import { ThemeProvider } from '@/components/theme-provider'
import { createClient } from '@/lib/supabase/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cashflow - מערכת ניהול לידים',
  description: 'Cashflow - מערכת ניהול לידים מקצועית',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {user && <Navbar userEmail={user.email ?? ''} />}
          <main className="mx-auto max-w-7xl px-4 py-6">
            {children}
          </main>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
