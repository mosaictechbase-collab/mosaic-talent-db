import Papa from 'papaparse'
import * as XLSX from 'xlsx'

/**
 * Some CSV exports (e.g. Google Sheets) wrap every row in an extra layer of
 * double-quotes and escape inner quotes as "". Detect and unwrap that format
 * so PapaParse sees normal CSV.
 *
 * Input:  "name,email"\r\n"Alice,""alice@x.com"""\r\n
 * Output: name,email\r\nAlice,"alice@x.com"\r\n
 */
function unwrapIfNeeded(content: string): string {
  const lines = content.split(/\r?\n/).filter((l) => l.length > 0)
  // Check if every non-empty line starts and ends with a double-quote
  const allWrapped = lines.every((l) => l.startsWith('"') && l.endsWith('"'))
  if (!allWrapped) return content
  return lines
    .map((l) => l.slice(1, -1).replace(/""/g, '"'))
    .join('\n')
}

// Maps flexible header names to canonical field names
const HEADER_MAP: Record<string, keyof RawRow> = {
  name: 'full_name',
  'full name': 'full_name',
  fullname: 'full_name',
  'full_name': 'full_name',
  email: 'email',
  'email address': 'email',
  org: 'organizations',
  organization: 'organizations',
  organizations: 'organizations',
  'org name': 'organizations',
  skill: 'skills',
  skills: 'skills',
  role: 'roles',
  roles: 'roles',
  interest: 'interests',
  interests: 'interests',
  bio: 'bio',
  description: 'bio',
  location: 'location',
  city: 'location',
  linkedin: 'linkedin_url',
  'linkedin url': 'linkedin_url',
  'linkedin_url': 'linkedin_url',
  website: 'website_url',
  'website url': 'website_url',
  'website_url': 'website_url',
  major: 'major',
  college: 'college',
  'grad year': 'graduation_year',
  'graduation year': 'graduation_year',
  graduation_year: 'graduation_year',
  'class year': 'graduation_year',
  'class of': 'graduation_year',
  year: 'graduation_year',
}

export interface RawRow {
  full_name?: string
  email?: string
  organizations?: string
  skills?: string
  roles?: string
  interests?: string
  bio?: string
  location?: string
  linkedin_url?: string
  website_url?: string
  major?: string
  college?: string
  graduation_year?: string
}

function mapHeaders(row: Record<string, string>): RawRow {
  const result: RawRow = {}
  for (const [key, value] of Object.entries(row)) {
    const canonical = HEADER_MAP[key.toLowerCase().trim()]
    if (canonical && value) {
      result[canonical] = value.trim()
    }
  }
  return result
}

export function parseCSVHeaders(content: string): string[] {
  const normalized = unwrapIfNeeded(content)
  const { meta } = Papa.parse(normalized, { header: true, preview: 1 })
  return meta.fields ?? []
}

export function parseCSV(content: string): RawRow[] {
  const normalized = unwrapIfNeeded(content)
  const { data } = Papa.parse<Record<string, string>>(normalized, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })
  return data.map(mapHeaders).filter((r) => r.full_name)
}

export function parseExcel(buffer: ArrayBuffer): RawRow[] {
  const wb = XLSX.read(buffer, { type: 'array' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' })
  return rows.map(mapHeaders).filter((r) => r.full_name)
}

export function normalizeGradYear(raw?: string): number | null {
  if (!raw) return null
  const n = parseInt(raw.replace(/\D/g, ''), 10)
  if (isNaN(n) || n < 1950 || n > 2040) return null
  return n
}

// Dedup rows within the batch itself before hitting the DB
export function dedupWithinBatch(rows: RawRow[]): RawRow[] {
  const seenEmails = new Map<string, number>()
  const seenNames = new Map<string, number>()

  const result: RawRow[] = []

  for (const row of rows) {
    const email = row.email?.toLowerCase().trim()
    const nameKey = `${row.full_name?.toLowerCase().trim()}__${row.graduation_year ?? ''}`

    if (email) {
      if (seenEmails.has(email)) {
        // Keep last occurrence — overwrite
        result[seenEmails.get(email)!] = row
        continue
      }
      seenEmails.set(email, result.length)
    } else {
      if (seenNames.has(nameKey)) {
        result[seenNames.get(nameKey)!] = row
        continue
      }
      seenNames.set(nameKey, result.length)
    }

    result.push(row)
  }

  return result
}

export type ParsedFile = {
  rows: RawRow[]
  filename: string
}
