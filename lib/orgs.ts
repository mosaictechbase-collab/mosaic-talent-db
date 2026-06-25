export const CANONICAL_ORGS = [
  'Disrupt',
  'E-Club',
  'Evolve',
  'Forge',
  'Generate',
  'IDEA',
  'NUImpact',
  'NUMA',
  'rev',
  'Scout',
  'ViTAL',
  'WISE',
] as const

export type OrgName = (typeof CANONICAL_ORGS)[number]

// Tailwind classes per org — bg + text
export const ORG_COLORS: Record<string, { bg: string; text: string }> = {
  Disrupt:  { bg: 'bg-blue-100',    text: 'text-blue-700' },
  'E-Club': { bg: 'bg-yellow-100',  text: 'text-yellow-700' },
  Evolve:   { bg: 'bg-teal-100',    text: 'text-teal-700' },
  Forge:    { bg: 'bg-orange-100',  text: 'text-orange-500' },
  Generate: { bg: 'bg-blue-800',    text: 'text-white' },
  IDEA:     { bg: 'bg-orange-500',  text: 'text-white' },
  NUImpact: { bg: 'bg-red-100',     text: 'text-red-700' },
  NUMA:     { bg: 'bg-green-100',   text: 'text-green-700' },
  rev:      { bg: 'bg-gray-100',    text: 'text-gray-600' },
  Scout:    { bg: 'bg-purple-100',  text: 'text-purple-600' },
  ViTAL:    { bg: 'bg-indigo-100',  text: 'text-indigo-700' },
  WISE:     { bg: 'bg-purple-200',  text: 'text-purple-800' },
}

export function orgChipClasses(org: string): string {
  const c = ORG_COLORS[org]
  if (!c) return 'bg-gray-100 text-gray-600'
  return `${c.bg} ${c.text}`
}
