// components/dashboard/recent-leads-table.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/leads/status-badge'
import type { Lead } from '@/lib/types'

export function RecentLeadsTable({ leads }: { leads: Lead[] }) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-sm">לידים אחרונים</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-b border-border">
              <th className="text-right pb-2 font-medium">שם</th>
              <th className="text-right pb-2 font-medium">מוסד</th>
              <th className="text-right pb-2 font-medium">סטטוס</th>
              <th className="text-right pb-2 font-medium">תאריך</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr key={lead.id} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-2 font-medium">{lead.name}</td>
                <td className="py-2 text-muted-foreground">{lead.organization ?? '—'}</td>
                <td className="py-2"><StatusBadge status={lead.status} /></td>
                <td className="py-2 text-muted-foreground text-xs">
                  {new Date(lead.created_at).toLocaleDateString('he-IL')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
