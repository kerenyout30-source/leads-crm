import { createClient } from '@/lib/supabase/server'
import { LeadsClient } from '@/components/leads/leads-client'

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .neq('status', 'not_relevant')
    .order('created_at', { ascending: false })

  return <LeadsClient initialLeads={leads ?? []} />
}
