import { createClient } from '@/lib/supabase/server'

function getAllowedEmails(): string[] {
  const raw = process.env.ADMIN_ALLOWED_EMAILS ?? ''
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export class AdminAuthError extends Error {
  constructor(
    message: string,
    public readonly code: 'UNAUTHENTICATED' | 'UNAUTHORIZED'
  ) {
    super(message)
    this.name = 'AdminAuthError'
  }
}

/**
 * Call at the top of every admin server action.
 * Throws AdminAuthError if the session is missing or the email is not allowed.
 * Returns the authenticated user email on success.
 */
export async function requireAdmin(): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new AdminAuthError('Not authenticated', 'UNAUTHENTICATED')
  }

  const email = user.email?.toLowerCase() ?? ''
  const allowed = getAllowedEmails()

  if (!allowed.includes(email)) {
    throw new AdminAuthError(
      `${email} is not an allowed admin`,
      'UNAUTHORIZED'
    )
  }

  return email
}
