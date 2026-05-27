import { createClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/dashboard/stats-card'
import { StatusPieChart } from '@/components/dashboard/status-pie-chart'
import { RecentLeadsTable } from '@/components/dashboard/recent-leads-table'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: total },
    { data: leads },
    { data: recentLeads },
  ] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('status'),
    supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(5),
  ])

  // Count new leads this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const { count: thisMonth } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth.toISOString())

  // Count by status for pie chart
  const statusCounts: Record<string, number> = {}
  leads?.forEach(l => {
    statusCounts[l.status] = (statusCounts[l.status] ?? 0) + 1
  })
  const pieData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }))

  const inProgress = statusCounts['in_progress'] ?? 0
  const closed = statusCounts['closed'] ?? 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">דאשבורד</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title='סה"כ לידים' value={total ?? 0} />
        <StatsCard title="חדשים החודש" value={thisMonth ?? 0} valueClassName="text-sky-400" />
        <StatsCard title="בטיפול" value={inProgress} valueClassName="text-orange-400" />
        <StatsCard title="נסגרו עסקאות" value={closed} valueClassName="text-green-400" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatusPieChart data={pieData} />
        <RecentLeadsTable leads={recentLeads ?? []} />
      </div>
    </div>
  )
}
