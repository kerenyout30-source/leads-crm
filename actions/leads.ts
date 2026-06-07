'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Lead } from '@/lib/types'

export async function createLead(data: Omit<Lead, 'id' | 'created_at' | 'user_id'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  console.log('[createLead] Creating lead:', data)
  const { data: lead, error } = await supabase
    .from('leads')
    .insert({ ...data, user_id: user.id })
    .select()
    .single()

  if (error) {
    console.error('[createLead] Supabase error:', error)
    throw new Error(`Supabase error: ${error.message}`)
  }

  // Log activity (don't fail if this errors - activities are secondary)
  try {
    await supabase.from('lead_activities').insert({
      lead_id: lead.id,
      user_id: user.id,
      type: 'lead_created',
      payload: {},
    })
  } catch (e) {
    console.error('Failed to log lead creation activity:', e)
  }

  try {
    console.log('[createLead] Revalidating paths...')
    revalidatePath('/leads')
    revalidatePath('/')
    console.log('[createLead] Paths revalidated successfully')
  } catch (e) {
    console.error('[createLead] revalidatePath error:', e)
    throw e
  }
  return lead
}

export async function updateLead(
  id: string,
  data: Partial<Omit<Lead, 'id' | 'created_at' | 'user_id'>>,
  changedFields: { field: string; old_value: string; new_value: string }[] = []
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Team-shared CRM: any authenticated user can update any lead.
  // RLS in Supabase enforces that only authenticated users can perform this action.
  console.log('[updateLead] Updating lead:', { id, data })
  const { error } = await supabase
    .from('leads')
    .update(data)
    .eq('id', id)

  if (error) {
    console.error('[updateLead] Supabase error:', error)
    throw new Error(`Supabase error: ${error.message}`)
  }

  // Log each changed field as an activity (don't fail if this errors)
  if (changedFields.length > 0) {
    try {
      await supabase.from('lead_activities').insert(
        changedFields.map(f => ({
          lead_id: id,
          user_id: user.id,
          type: f.field === 'status' ? 'status_change' : 'field_updated',
          payload: { field: f.field, old_value: f.old_value, new_value: f.new_value },
        }))
      )
    } catch (e) {
      console.error('Failed to log lead update activity:', e)
    }
  }

  try {
    console.log('[updateLead] Revalidating paths...')
    revalidatePath('/leads')
    revalidatePath('/')
    console.log('[updateLead] Paths revalidated successfully')
  } catch (e) {
    console.error('[updateLead] revalidatePath error:', e)
    throw e
  }
}

export async function deleteLead(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Team-shared CRM: any authenticated user can delete any lead.
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/leads')
  revalidatePath('/')
}

export async function updateLeadStatus(id: string, newStatus: string, oldStatus: string) {
  return updateLead(id, { status: newStatus as Lead['status'] }, [
    { field: 'status', old_value: oldStatus, new_value: newStatus },
  ])
}
