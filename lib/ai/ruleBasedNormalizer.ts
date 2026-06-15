// Known aliases normalized to canonical forms
const SKILL_ALIASES: Record<string, string> = {
  'react js': 'React',
  'reactjs': 'React',
  'react.js': 'React',
  'node js': 'Node.js',
  'nodejs': 'Node.js',
  'node.js': 'Node.js',
  'typescript': 'TypeScript',
  'javascript': 'JavaScript',
  'python': 'Python',
  'figma': 'Figma',
  'ux': 'UX Research',
  'ux research': 'UX Research',
  'ui': 'UI Design',
  'ui design': 'UI Design',
  'product design': 'Product Design',
  'ml': 'Machine Learning',
  'machine learning': 'Machine Learning',
  'ai': 'Artificial Intelligence',
  'data science': 'Data Science',
  'full stack': 'Full-Stack Development',
  'full-stack': 'Full-Stack Development',
  'fullstack': 'Full-Stack Development',
  'ios': 'iOS',
  'android': 'Android',
  'swift': 'Swift',
  'go': 'Go',
  'golang': 'Go',
  'rust': 'Rust',
  'sql': 'SQL',
  'postgres': 'PostgreSQL',
  'postgresql': 'PostgreSQL',
  'mysql': 'MySQL',
  'mongodb': 'MongoDB',
  'aws': 'AWS',
  'gcp': 'Google Cloud',
  'azure': 'Azure',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'brand strategy': 'Brand Strategy',
  'marketing': 'Marketing',
  'finance': 'Finance',
  'strategy': 'Strategy',
  'business development': 'Business Development',
  'content creation': 'Content Creation',
}

const ORG_ALIASES: Record<string, string> = {
  'generate': 'Generate Northeastern',
  'generate northeastern': 'Generate Northeastern',
  'idea': 'IDEA',
  'scout': 'Scout',
  'huskyvc': 'HuskyVC',
  'husky vc': 'HuskyVC',
  'social innovation': 'Social Innovation Program',
  'sip': 'Social Innovation Program',
  'forge': 'Forge',
  'oasis': 'OASIS',
  'epsilon nu tau': 'Epsilon Nu Tau',
  'ent': 'Epsilon Nu Tau',
  'nu entrepreneurs': 'NU Entrepreneurs',
  'nue': 'NU Entrepreneurs',
  'tamid': 'TAMID Group',
  'tamid group': 'TAMID Group',
}

function splitTokens(raw: string): string[] {
  return raw
    .split(/[,;/&|]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function toTitleCase(s: string): string {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
}

function normalizeToken(token: string, aliases: Record<string, string>): string {
  const key = token.toLowerCase().trim()
  return aliases[key] ?? toTitleCase(token)
}

function dedup(arr: string[]): string[] {
  return [...new Map(arr.map((v) => [v.toLowerCase(), v])).values()]
}

export interface RawProfileRow {
  skills?: string
  organizations?: string
  roles?: string
  interests?: string
}

export interface NormalizedFields {
  skills: string[]
  organizations: string[]
  roles: string[]
  interests: string[]
}

export function ruleBasedNormalize(row: RawProfileRow): NormalizedFields {
  const skills = dedup(
    splitTokens(row.skills ?? '').map((t) => normalizeToken(t, SKILL_ALIASES))
  )
  const organizations = dedup(
    splitTokens(row.organizations ?? '').map((t) => normalizeToken(t, ORG_ALIASES))
  )
  const roles = dedup(
    splitTokens(row.roles ?? '').map((t) => toTitleCase(t))
  )
  const interests = dedup(
    splitTokens(row.interests ?? '').map((t) => toTitleCase(t))
  )

  return { skills, organizations, roles, interests }
}
