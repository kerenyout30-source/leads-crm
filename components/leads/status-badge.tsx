// components/leads/status-badge.tsx
import { Badge } from '@/components/ui/badge'
import { STATUS_MAP } from '@/lib/constants'
import type { Status } from '@/lib/types'
import { cn } from '@/lib/utils'

export function StatusBadge({ status }: { status: Status }) {
  const option = STATUS_MAP[status]
  return (
    <Badge className={cn('text-xs border-0', option?.color ?? 'bg-muted text-muted-foreground')}>
      {option?.label ?? status}
    </Badge>
  )
}
