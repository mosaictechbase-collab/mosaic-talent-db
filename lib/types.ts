export interface Profile {
  id: string
  email: string | null
  full_name: string
  graduation_year: number | null
  college: string | null
  major: string | null
  location: string | null
  organizations: string[]
  roles: string[]
  skills: string[]
  interests: string[]
  linkedin_url: string | null
  website_url: string | null
  bio: string | null
  current_project: string | null
  is_active: boolean
  import_batch_id: string | null
  created_at: string
  updated_at: string
}

export interface ImportBatch {
  id: string
  filename: string | null
  imported_at: string
  row_count: number
  inserted_count: number
  updated_count: number
  dupes_skipped: number
  imported_by: string | null
}

export interface SearchParams {
  q?: string
  org?: string
  role?: string
  skill?: string
  interest?: string
  year?: string
  college?: string
  page?: string
  pageSize?: string
}

export interface SearchResult {
  profiles: Profile[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ImportResult {
  inserted: number
  updated: number
  skipped: number
  errors: string[]
  batchId: string | null
}

export interface FilterOptions {
  organizations: string[]
  roles: string[]
  skills: string[]
  interests: string[]
  graduationYears: number[]
  colleges: string[]
}
