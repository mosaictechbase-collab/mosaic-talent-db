'use server'

import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createServiceClient } from '@/lib/supabase/server'
import { parseCSV, parseExcel, parseCSVHeaders, dedupWithinBatch, normalizeGradYear } from '@/lib/import'
import { enrichProfiles } from '@/lib/ai/enrichProfiles'
import type { ImportResult } from '@/lib/types'

const INSERT_CHUNK = 500
const UPDATE_CHUNK = 100
const LOOKUP_CHUNK = 100 // safe URL length for .in() queries

type ProfileRow = {
  email: string | null
  full_name: string
  graduation_year: number | null
  college: string | null
  major: string | null
  location: string | null
  bio: string | null
  linkedin_url: string | null
  website_url: string | null
  skills: string[]
  organizations: string[]
  roles: string[]
  interests: string[]
  is_active: boolean
  import_batch_id: string | null
}

async function bulkInsert(
  supabase: ReturnType<typeof createServiceClient>,
  rows: ProfileRow[],
  errors: string[]
): Promise<number> {
  let count = 0
  for (let i = 0; i < rows.length; i += INSERT_CHUNK) {
    const chunk = rows.slice(i, i + INSERT_CHUNK)
    const { error } = await supabase.from('profiles').insert(chunk)
    if (error) errors.push(`Insert chunk ${i}–${i + chunk.length}: ${error.message}`)
    else count += chunk.length
  }
  return count
}

async function bulkUpdate(
  supabase: ReturnType<typeof createServiceClient>,
  rows: Array<ProfileRow & { id: string }>,
  errors: string[]
): Promise<number> {
  let count = 0
  // Updates must be individual — Supabase REST doesn't support bulk UPDATE with different values per row.
  // Run in parallel batches to limit round-trips.
  for (let i = 0; i < rows.length; i += UPDATE_CHUNK) {
    const chunk = rows.slice(i, i + UPDATE_CHUNK)
    const results = await Promise.all(
      chunk.map(({ id, ...rest }) =>
        supabase.from('profiles').update(rest).eq('id', id)
      )
    )
    for (const { error } of results) {
      if (error) errors.push(`Update error: ${error.message}`)
      else count++
    }
  }
  return count
}

export async function importProfiles(formData: FormData): Promise<ImportResult> {
  const t0 = Date.now()
  const adminEmail = await requireAdmin()

  const file = formData.get('file') as File | null
  if (!file) throw new Error('No file provided')

  const filename = file.name
  const isExcel = /\.(xlsx|xls)$/i.test(filename)

  // ── 1. Parse ──────────────────────────────────────────────────────────────
  const tParse = Date.now()
  let rawRows
  let detectedHeaders: string[] = []
  if (isExcel) {
    const buffer = await file.arrayBuffer()
    rawRows = parseExcel(buffer)
  } else {
    const text = await file.text()
    detectedHeaders = parseCSVHeaders(text)
    rawRows = parseCSV(text)
  }
  console.log(`[import] parse: ${Date.now() - tParse}ms, ${rawRows.length} rows`)

  if (rawRows.length === 0) {
    const hint = detectedHeaders.length
      ? `Headers found: [${detectedHeaders.join(', ')}]. Expected a "name" or "full_name" column.`
      : 'No headers detected. Check file format.'
    return { inserted: 0, updated: 0, skipped: 0, errors: [`File has no valid rows. ${hint}`], batchId: null }
  }

  // ── 2. Dedup within batch ─────────────────────────────────────────────────
  const tDedup = Date.now()
  const dedupedRows = dedupWithinBatch(rawRows)
  const skippedWithinBatch = rawRows.length - dedupedRows.length
  console.log(`[import] dedup: ${Date.now() - tDedup}ms, ${skippedWithinBatch} skipped`)

  // ── 3. AI enrichment (concurrent batches, rule-based fallback) ────────────
  const tAI = Date.now()
  const enriched = await enrichProfiles(dedupedRows)
  console.log(`[import] AI enrichment: ${Date.now() - tAI}ms`)

  // ── 4. Merge enriched fields ──────────────────────────────────────────────
  const profilesToUpsert = dedupedRows.map((row, i) => ({
    email: row.email?.toLowerCase().trim() || null,
    full_name: row.full_name!.trim(),
    graduation_year: normalizeGradYear(row.graduation_year),
    college: row.college?.trim() || null,
    major: row.major?.trim() || null,
    location: row.location?.trim() || null,
    bio: row.bio?.trim() || null,
    linkedin_url: row.linkedin_url?.trim() || null,
    website_url: row.website_url?.trim() || null,
    skills: enriched[i].skills,
    organizations: enriched[i].organizations,
    roles: enriched[i].roles,
    interests: enriched[i].interests,
    is_active: true,
    import_batch_id: null as string | null,
  }))

  const supabase = createServiceClient()
  const errors: string[] = []

  // Create batch record
  const { data: batch } = await supabase
    .from('import_batches')
    .insert({ filename, row_count: rawRows.length, imported_by: adminEmail })
    .select('id')
    .single()
  const batchId = batch?.id ?? null
  profilesToUpsert.forEach((r) => (r.import_batch_id = batchId))

  // ── 5. DB writes — bulk ───────────────────────────────────────────────────
  const tDB = Date.now()
  const withEmail = profilesToUpsert.filter((r) => r.email)
  const withoutEmail = profilesToUpsert.filter((r) => !r.email)

  let inserted = 0
  let updated = 0

  // Email rows: chunked SELECT to avoid URL length limits, then bulk insert/update
  if (withEmail.length > 0) {
    const emails = withEmail.map((r) => r.email!)
    const existingMap = new Map<string, string>()

    for (let i = 0; i < emails.length; i += LOOKUP_CHUNK) {
      const chunk = emails.slice(i, i + LOOKUP_CHUNK)
      const { data } = await supabase
        .from('profiles')
        .select('id, email')
        .in('email', chunk)
      for (const r of data ?? []) existingMap.set(r.email, r.id)
    }

    const toInsert = withEmail.filter((r) => !existingMap.has(r.email!))
    const toUpdate = withEmail
      .filter((r) => existingMap.has(r.email!))
      .map((r) => ({ ...r, id: existingMap.get(r.email!)! }))

    const [ins, upd] = await Promise.all([
      bulkInsert(supabase, toInsert, errors),
      bulkUpdate(supabase, toUpdate, errors),
    ])
    inserted += ins
    updated += upd
  }

  // No-email rows: chunked SELECT by name, then bulk insert/update
  if (withoutEmail.length > 0) {
    const existingMap = new Map<string, string>()
    const names = withoutEmail.map((r) => r.full_name.toLowerCase())

    for (let i = 0; i < names.length; i += LOOKUP_CHUNK) {
      const chunk = names.slice(i, i + LOOKUP_CHUNK)
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, graduation_year')
        .in('full_name', chunk)
        .is('email', null)
      for (const r of data ?? []) {
        existingMap.set(`${r.full_name.toLowerCase()}__${r.graduation_year ?? ''}`, r.id)
      }
    }

    const toInsert = withoutEmail.filter(
      (r) => !existingMap.has(`${r.full_name.toLowerCase()}__${r.graduation_year ?? ''}`)
    )
    const toUpdate = withoutEmail
      .filter((r) => existingMap.has(`${r.full_name.toLowerCase()}__${r.graduation_year ?? ''}`))
      .map((r) => ({
        ...r,
        id: existingMap.get(`${r.full_name.toLowerCase()}__${r.graduation_year ?? ''}`)!,
      }))

    const [ins, upd] = await Promise.all([
      bulkInsert(supabase, toInsert, errors),
      bulkUpdate(supabase, toUpdate, errors),
    ])
    inserted += ins
    updated += upd
  }

  console.log(`[import] DB writes: ${Date.now() - tDB}ms`)
  console.log(`[import] total: ${Date.now() - t0}ms | inserted=${inserted} updated=${updated} skipped=${skippedWithinBatch}`)

  // Update batch record
  if (batchId) {
    await supabase
      .from('import_batches')
      .update({ inserted_count: inserted, updated_count: updated, dupes_skipped: skippedWithinBatch })
      .eq('id', batchId)
  }

  return { inserted, updated, skipped: skippedWithinBatch, errors, batchId }
}

export interface ManualProfileInput {
  full_name: string
  email: string
  organizations: string
  roles: string
  skills: string
  interests: string
  graduation_year: string
  major: string
  location: string
  bio: string
  current_project: string
  linkedin_url: string
}

export async function addProfile(input: ManualProfileInput): Promise<{ error?: string }> {
  await requireAdmin()
  const supabase = createServiceClient()

  const split = (s: string) =>
    s.split(',').map((v) => v.trim()).filter(Boolean)

  const { error } = await supabase.from('profiles').insert({
    full_name: input.full_name.trim(),
    email: input.email.trim().toLowerCase() || null,
    organizations: split(input.organizations),
    roles: split(input.roles),
    skills: split(input.skills),
    interests: split(input.interests),
    graduation_year: normalizeGradYear(input.graduation_year),
    major: input.major.trim() || null,
    location: input.location.trim() || null,
    bio: input.bio.trim() || null,
    current_project: input.current_project.trim() || null,
    linkedin_url: input.linkedin_url.trim() || null,
    is_active: true,
  })

  return error ? { error: error.message } : {}
}

export async function updateProfile(id: string, input: ManualProfileInput): Promise<{ error?: string }> {
  await requireAdmin()
  const supabase = createServiceClient()

  const split = (s: string) =>
    s.split(',').map((v) => v.trim()).filter(Boolean)

  const { error } = await supabase.from('profiles').update({
    full_name: input.full_name.trim(),
    email: input.email.trim().toLowerCase() || null,
    organizations: split(input.organizations),
    roles: split(input.roles),
    skills: split(input.skills),
    interests: split(input.interests),
    graduation_year: normalizeGradYear(input.graduation_year),
    major: input.major.trim() || null,
    location: input.location.trim() || null,
    bio: input.bio.trim() || null,
    current_project: input.current_project.trim() || null,
    linkedin_url: input.linkedin_url.trim() || null,
  }).eq('id', id)

  return error ? { error: error.message } : {}
}

export async function deleteProfile(id: string): Promise<{ error?: string }> {
  await requireAdmin()
  const supabase = createServiceClient()
  const { error } = await supabase.from('profiles').delete().eq('id', id)
  return error ? { error: error.message } : {}
}

export async function listProfiles(page = 1, q = ''): Promise<{
  profiles: {
    id: string; full_name: string; email: string | null
    organizations: string[]; roles: string[]; skills: string[]; interests: string[]
    graduation_year: number | null; major: string | null; location: string | null
    bio: string | null; linkedin_url: string | null
  }[]
  total: number
}> {
  await requireAdmin()
  const supabase = createServiceClient()
  const pageSize = 50
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('profiles')
    .select('id, full_name, email, organizations, roles, skills, interests, graduation_year, major, location, bio, current_project, linkedin_url', { count: 'exact' })
    .order('full_name')
    .range(offset, offset + pageSize - 1)

  if (q.trim()) {
    query = query.ilike('full_name', `%${q.trim()}%`)
  }

  const { data, count } = await query
  return { profiles: data ?? [], total: count ?? 0 }
}
