import { createClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/dashboard/stats-card'
import { StatusPieChart } from '@/components/dashboard/status-pie-chart'
import { RecentLeadsTable } from '@/components/dashboard/recent-leads-table'
import { FollowUpWidget } from '@/components/dashboard/follow-up-widget'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Date windows
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString().slice(0, 10)

  const weekAhead = new Date(today)
  weekAhead.setDate(weekAhead.getDate() + 7)
  const weekAheadISO = weekAhead.toISOString().slice(0, 10)

  const [
    { count: total },
    { data: leads },
    { data: recentLeads },
    { count: thisMonth },
    { data: followUpLeads },
  ] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('status'),
    supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth.toISOString()),
    supabase
      .from('leads')
      .select('*')
      .not('follow_up_date', 'is', null)
      .lte('follow_up_date', weekAheadISO)
      .order('follow_up_date', { ascending: true }),
  ])

  // Count by status for pie chart
  const statusCounts: Record<string, number> = {}
  leads?.forEach(l => {
    statusCounts[l.status] = (statusCounts[l.status] ?? 0) + 1
  })
  const pieData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }))

  const inProgress = statusCounts['in_progress'] ?? 0
  const closed = statusCounts['closed'] ?? 0

  // Follow-up counts
  const followUpList = followUpLeads ?? []
  const followUpThisWeek = followUpList.length
  const overdue = followUpList.filter(l => l.follow_up_date && l.follow_up_date < todayISO).length

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">דאשבורד</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatsCard title='סה"כ לידים' value={total ?? 0} />
        <StatsCard title="חדשים החודש" value={thisMonth ?? 0} valueClassName="text-sky-600 dark:text-sky-400" />
        <StatsCard title="בטיפול" value={inProgress} valueClassName="text-orange-600 dark:text-orange-400" />
        <StatsCard title="נסגרו עסקאות" value={closed} valueClassName="text-green-600 dark:text-green-400" />
        <StatsCard
          title="Follow Up"
          value={followUpThisWeek}
          subtitle={overdue > 0 ? `${overdue} חורגים` : undefined}
          valueClassName={overdue > 0 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}
        />
      </div>

      <FollowUpWidget leads={followUpList} />

      <div className="grid grid-cols-3 gap-4">
        <StatusPieChart data={pieData} />
        <RecentLeadsTable leads={recentLeads ?? []} />
      </div>
    </div>
  )
}
