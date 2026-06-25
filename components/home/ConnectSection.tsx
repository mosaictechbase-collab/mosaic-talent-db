'use client'

import { useState } from 'react'
import { findProfileByEmail, getTopMatches, submitEditRequest, type ConnectProfile } from '@/app/connect/actions'
import { orgChipClasses } from '@/lib/orgs'

type Step = 'email' | 'confirm' | 'edit-request' | 'matches'

function MiniCard({ profile }: { profile: ConnectProfile }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <span className="text-blue-600 font-semibold text-sm">{profile.full_name.charAt(0)}</span>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{profile.full_name}</p>
          {profile.graduation_year && (
            <p className="text-xs text-gray-400">Class of {profile.graduation_year}</p>
          )}
        </div>
      </div>
      {profile.organizations.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {profile.organizations.slice(0, 2).map((org) => (
            <span key={org} className={`text-xs font-medium px-2 py-0.5 rounded-full ${orgChipClasses(org)}`}>{org}</span>
          ))}
        </div>
      )}
      {profile.bio && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{profile.bio}</p>
      )}
      {profile.skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {profile.skills.slice(0, 3).map((s) => (
            <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">{s}</span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ConnectSection() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [profile, setProfile] = useState<ConnectProfile | null>(null)
  const [matches, setMatches] = useState<ConnectProfile[]>([])
  const [editMessage, setEditMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editSent, setEditSent] = useState(false)

  async function handleFindProfile(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const found = await findProfileByEmail(email)
    setLoading(false)
    if (!found) {
      setError("We couldn't find a profile with that email. Make sure you're using your student email.")
      return
    }
    setProfile(found)
    setStep('confirm')
  }

  async function handleConfirm() {
    if (!profile) return
    setLoading(true)
    const top = await getTopMatches(profile.id)
    setMatches(top)
    setLoading(false)
    setStep('matches')
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setLoading(true)
    const result = await submitEditRequest(profile.id, email, editMessage)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setEditSent(true)
    }
  }

  function reset() {
    setStep('email')
    setEmail('')
    setProfile(null)
    setMatches([])
    setEditMessage('')
    setError(null)
    setEditSent(false)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-8 py-6 text-white text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="text-lg font-semibold">Connect with Our Mosaic Community</h2>
          </div>
          <p className="text-blue-100 text-sm">Enter your student email to find your profile and top matches</p>
        </div>

        <div className="px-8 py-6">

          {/* Step 1 — Email input */}
          {step === 'email' && (
            <>
              <form onSubmit={handleFindProfile} className="flex gap-3">
                <div className="flex-1 flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                  <div className="pl-4 pr-2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@northeastern.edu"
                    required
                    className="flex-1 py-3 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  {loading ? 'Searching…' : 'Find My Profile'}
                </button>
              </form>
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
              <p className="text-xs text-gray-400 text-center mt-4">
                We'll match you based on shared skills, interests, and organizations
              </p>
            </>
          )}

          {/* Step 2 — Confirm identity */}
          {step === 'confirm' && profile && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-4">Is this you?</p>
              <MiniCard profile={profile} />
              <div className="flex gap-3 mt-5">
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Finding matches…' : 'Yes, find my matches'}
                </button>
                <button
                  onClick={() => setStep('edit-request')}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Request edits
                </button>
              </div>
              <button onClick={reset} className="mt-3 w-full text-center text-xs text-gray-400 hover:text-gray-600">
                That's not me — try a different email
              </button>
            </div>
          )}

          {/* Step 3 — Edit request */}
          {step === 'edit-request' && profile && (
            <div>
              {editSent ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-medium text-gray-900 mb-1">Request sent!</p>
                  <p className="text-sm text-gray-500 mb-4">A Mosaic admin will review your request soon.</p>
                  <button onClick={handleConfirm} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Continue to see my matches →
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-700 mb-1">Request edits to your profile</p>
                  <p className="text-xs text-gray-400 mb-4">Tell us what needs to be updated and a Mosaic admin will make the changes.</p>
                  <form onSubmit={handleEditSubmit} className="space-y-3">
                    <textarea
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      placeholder="e.g. Please update my organization to Generate, add React to my skills, and fix my graduation year to 2026."
                      rows={4}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={loading || !editMessage.trim()}
                        className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {loading ? 'Sending…' : 'Submit Request'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep('confirm')}
                        className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        Back
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}

          {/* Step 4 — Top matches */}
          {step === 'matches' && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-4">
                Your top {matches.length > 0 ? matches.length : ''} match{matches.length !== 1 ? 'es' : ''} in the Mosaic community
              </p>
              {matches.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No close matches found yet — check back as more members join!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {matches.map((m) => <MiniCard key={m.id} profile={m} />)}
                </div>
              )}
              <button onClick={reset} className="mt-5 w-full text-center text-xs text-gray-400 hover:text-gray-600">
                Start over
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
