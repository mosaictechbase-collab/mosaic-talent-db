'use server'

import { createServiceClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types'

export interface ConnectProfile extends Profile {
  current_project: string | null
}

export async function findProfileByEmail(email: string): Promise<ConnectProfile | null> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, email, graduation_year, organizations, roles, skills, interests, location, bio, current_project, linkedin_url, website_url, is_active, import_batch_id, created_at, updated_at, college, major')
    .eq('email', email.toLowerCase().trim())
    .eq('is_active', true)
    .single()
  return data ?? null
}

export async function getTopMatches(profileId: string): Promise<ConnectProfile[]> {
  const supabase = createServiceClient()

  // Get the user's profile first
  const { data: me } = await supabase
    .from('profiles')
    .select('skills, interests, organizations')
    .eq('id', profileId)
    .single()

  if (!me) return []

  // Fetch candidates that share at least one skill or interest (exclude self)
  const { data: candidates } = await supabase
    .from('profiles')
    .select('id, full_name, email, graduation_year, organizations, roles, skills, interests, location, bio, current_project, linkedin_url, website_url, is_active, import_batch_id, created_at, updated_at, college, major')
    .eq('is_active', true)
    .neq('id', profileId)
    .limit(200)

  if (!candidates || candidates.length === 0) return []

  const mySkills = new Set(me.skills ?? [])
  const myInterests = new Set(me.interests ?? [])
  const myOrgs = new Set(me.organizations ?? [])

  // Score each candidate
  const scored = candidates.map((c) => {
    let score = 0
    for (const s of c.skills ?? []) if (mySkills.has(s)) score += 3
    for (const i of c.interests ?? []) if (myInterests.has(i)) score += 2
    for (const o of c.organizations ?? []) if (myOrgs.has(o)) score += 1
    return { profile: c as ConnectProfile, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.profile)
}

export async function submitEditRequest(
  profileId: string,
  email: string,
  message: string
): Promise<{ error?: string }> {
  const supabase = createServiceClient()
  const { error } = await supabase.from('edit_requests').insert({
    profile_id: profileId,
    email: email.toLowerCase().trim(),
    message: message.trim(),
    status: 'pending',
  })
  return error ? { error: error.message } : {}
}
