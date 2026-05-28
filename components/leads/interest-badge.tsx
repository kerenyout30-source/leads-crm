// components/leads/interest-badge.tsx
import { Badge } from '@/components/ui/badge'
import { INTEREST_LEVEL_MAP } from '@/lib/constants'
import type { InterestLevel } from '@/lib/types'
import { cn } from '@/lib/utils'

export function InterestBadge({ level }: { level: InterestLevel | null }) {
  if (!level) return null
  const option = INTEREST_LEVEL_MAP[level]
  return (
    <Badge className={cn('text-xs border-0', option?.color ?? 'bg-muted text-muted-foreground')}>
      {option?.label ?? level}
    </Badge>
  )
}
