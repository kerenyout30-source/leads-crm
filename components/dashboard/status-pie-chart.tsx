'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { STATUS_OPTIONS } from '@/lib/constants'

const STATUS_COLORS: Record<string, string> = {
  new:          '#38bdf8',
  in_progress:  '#fb923c',
  details_sent: '#a78bfa',
  closed:       '#4ade80',
  not_relevant: '#94a3b8',
}

type PieData = { status: string; count: number }

export function StatusPieChart({ data }: { data: PieData[] }) {
  const chartData = data.map(d => ({
    name: STATUS_OPTIONS.find(s => s.value === d.status)?.label ?? d.status,
    value: d.count,
    color: STATUS_COLORS[d.status] ?? '#64748b',
  }))

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-sm">התפלגות לפי סטטוס</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 6 }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend
              formatter={(value) => <span style={{ color: '#e2e8f0', fontSize: 12 }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
