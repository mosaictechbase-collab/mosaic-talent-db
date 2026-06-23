import { createClient, createServiceClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import type { SearchParams, SearchResult, FilterOptions, Profile } from '@/lib/types'

const PAGE_SIZE = 20

export async function searchProfiles(params: SearchParams): Promise<SearchResult> {
  const supabase = await createClient()
  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const pageSize = Math.min(100, parseInt(params.pageSize ?? String(PAGE_SIZE), 10))
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('profiles')
    .select(
      'id, full_name, email, graduation_year, organizations, roles, skills, interests, location, bio, current_project, linkedin_url, website_url, is_active',
      { count: 'exact' }
    )
    .eq('is_active', true)

  if (params.q?.trim()) {
    query = query.textSearch('search_vector', params.q.trim(), {
      type: 'websearch',
      config: 'english',
    })
  }

  if (params.org) query = query.contains('organizations', [params.org])
  if (params.role) query = query.contains('roles', [params.role])
  if (params.skill) query = query.contains('skills', [params.skill])
  if (params.interest) query = query.contains('interests', [params.interest])

  if (params.year) {
    const year = parseInt(params.year, 10)
    if (!isNaN(year)) query = query.eq('graduation_year', year)
  }

  query = query.order('full_name', { ascending: true }).range(offset, offset + pageSize - 1)

  const { data, count, error } = await query
  if (error) throw new Error(error.message)

  const total = count ?? 0
  return {
    profiles: (data ?? []) as Profile[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export const getProfileCount = unstable_cache(
  async (): Promise<number> => {
    const supabase = createServiceClient()
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    return count ?? 0
  },
  ['profile-count'],
  { revalidate: 300 } // refresh every 5 min
)

// Uses service role client (no cookies) so unstable_cache works correctly.
// Filter options change only when profiles are imported — 1 hour TTL is fine.
export const getFilterOptions = unstable_cache(
  async (): Promise<FilterOptions> => {
    const supabase = createServiceClient()

    const { data } = await supabase
      .from('profiles')
      .select('organizations, roles, skills, interests, graduation_year')
      .eq('is_active', true)

    const orgs = new Set<string>()
    const roles = new Set<string>()
    const skills = new Set<string>()
    const interests = new Set<string>()
    const years = new Set<number>()

    for (const row of data ?? []) {
      row.organizations?.forEach((v: string) => orgs.add(v))
      row.roles?.forEach((v: string) => roles.add(v))
      row.skills?.forEach((v: string) => skills.add(v))
      row.interests?.forEach((v: string) => interests.add(v))
      if (row.graduation_year) years.add(row.graduation_year)
    }

    return {
      organizations: [...orgs].sort(),
      roles: [...roles].sort(),
      skills: [...skills].sort(),
      interests: [...interests].sort(),
      graduationYears: [...years].sort((a, b) => b - a),
    }
  },
  ['filter-options'],
  { revalidate: 3600 }
)
