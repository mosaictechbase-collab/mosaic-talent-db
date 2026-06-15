import Anthropic from '@anthropic-ai/sdk'
import { ruleBasedNormalize, type RawProfileRow, type NormalizedFields } from './ruleBasedNormalizer'

const BATCH_SIZE = 50
const MAX_CONCURRENT = 5 // max parallel Anthropic calls

interface EnrichInput extends RawProfileRow {
  _index: number
}

async function callAnthropic(rows: EnrichInput[]): Promise<NormalizedFields[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey?.trim()) throw new Error('ANTHROPIC_API_KEY not set — using rule-based fallback')

  const client = new Anthropic({ apiKey })

  const prompt = rows
    .map(
      (r, i) =>
        `${i}: skills="${r.skills ?? ''}" organizations="${r.organizations ?? ''}" roles="${r.roles ?? ''}" interests="${r.interests ?? ''}"`
    )
    .join('\n')

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    system: `You are a data normalizer for a talent network at Northeastern University.
Given raw profile fields, return a JSON array where each element has:
{ "skills": string[], "organizations": string[], "roles": string[], "interests": string[] }

Rules:
- Standardize capitalization (React not react, Node.js not nodejs)
- Expand abbreviations (ML→Machine Learning, UX→UX Research, VC→Venture Capital)
- Normalize org names (Generate→Generate Northeastern, IDEA stays IDEA)
- Split comma/slash/semicolon separated values into arrays
- Remove duplicates
- Do NOT invent values not implied by the input
- Return exactly ${rows.length} objects in the same order as input
- Return ONLY valid JSON array, no explanation`,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('No JSON array in AI response')

  const parsed = JSON.parse(jsonMatch[0]) as NormalizedFields[]
  if (!Array.isArray(parsed) || parsed.length !== rows.length) {
    throw new Error('AI response length mismatch')
  }
  return parsed
}

async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const results: T[] = new Array(tasks.length)
  let index = 0

  async function worker() {
    while (index < tasks.length) {
      const i = index++
      results[i] = await tasks[i]()
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker))
  return results
}

export async function enrichProfiles(rows: RawProfileRow[]): Promise<NormalizedFields[]> {
  const results: NormalizedFields[] = new Array(rows.length)

  // Build one task per batch
  const tasks = []
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const start = i
    const batch = rows.slice(start, start + BATCH_SIZE).map((r, j) => ({ ...r, _index: start + j }))

    tasks.push(async () => {
      try {
        const enriched = await callAnthropic(batch)
        enriched.forEach((fields, j) => {
          results[start + j] = fields
        })
      } catch (err) {
        console.warn(`AI enrichment failed for batch at row ${start}, using rule-based fallback:`, err)
        batch.forEach((row, j) => {
          results[start + j] = ruleBasedNormalize(row)
        })
      }
    })
  }

  // Run batches concurrently, capped at MAX_CONCURRENT
  await runWithConcurrency(tasks, MAX_CONCURRENT)

  return results
}
