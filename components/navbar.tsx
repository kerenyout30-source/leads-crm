'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/',       label: 'דאשבורד' },
  { href: '/leads',  label: 'לידים'   },
]

export function Navbar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()

  return (
    <nav className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Cashflow"
            width={36}
            height={36}
            className="rounded-md bg-white p-0.5"
            priority
          />
          <span className="font-bold text-foreground hidden sm:inline">Cashflow</span>
        </Link>

        <div className="flex gap-6">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm transition-colors hover:text-foreground',
                pathname === link.href
                  ? 'text-foreground border-b-2 border-primary pb-0.5'
                  : 'text-muted-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ModeToggle />
          <span className="text-xs text-muted-foreground hidden sm:block">{userEmail}</span>
          <form action={signOut}>
            <Button variant="ghost" size="sm" type="submit">יציאה</Button>
          </form>
        </div>
      </div>
    </nav>
  )
}
