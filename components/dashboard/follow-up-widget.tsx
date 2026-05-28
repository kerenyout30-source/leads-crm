// components/dashboard/follow-up-widget.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ASSIGNED_REP_MAP } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { AlarmClock } from 'lucide-react'
import type { Lead } from '@/lib/types'

function daysFromToday(dateStr: string) {
  const date = new Date(dateStr)
  date.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function FollowUpWidget({ leads }: { leads: Lead[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlarmClock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          Follow Up השבוע
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leads.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            אין Follow Up השבוע 🎉
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="text-right pb-2 font-medium">שם</th>
                <th className="text-right pb-2 font-medium">מוסד</th>
                <th className="text-right pb-2 font-medium">נציג</th>
                <th className="text-right pb-2 font-medium">תאריך</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => {
                const days = lead.follow_up_date ? daysFromToday(lead.follow_up_date) : 0
                const overdue = days < 0
                const today = days === 0
                return (
                  <tr key={lead.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 font-medium">{lead.name}</td>
                    <td className="py-2 text-muted-foreground">{lead.organization ?? '—'}</td>
                    <td className="py-2 text-muted-foreground text-xs">
                      {lead.assigned_rep ? ASSIGNED_REP_MAP[lead.assigned_rep]?.label ?? lead.assigned_rep : '—'}
                    </td>
                    <td className="py-2 text-xs">
                      <span className={cn(
                        'text-muted-foreground',
                        overdue && 'text-red-600 dark:text-red-400 font-medium',
                        today && 'text-amber-600 dark:text-amber-400 font-medium'
                      )}>
                        {lead.follow_up_date ? new Date(lead.follow_up_date).toLocaleDateString('he-IL') : '—'}
                      </span>
                      {overdue && (
                        <Badge className="mr-2 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-0 text-[10px]">חורג</Badge>
                      )}
                      {today && (
                        <Badge className="mr-2 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-0 text-[10px]">היום</Badge>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  )
}
