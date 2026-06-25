'use client'

import { useState } from 'react'
import type { Profile } from '@/lib/types'
import { orgChipClasses, ORG_COLORS } from '@/lib/orgs'

const AVATAR_GRADIENTS = [
  'from-blue-400 to-indigo-500',
  'from-purple-400 to-pink-500',
  'from-teal-400 to-cyan-500',
  'from-orange-400 to-rose-500',
  'from-green-400 to-emerald-500',
  'from-violet-400 to-purple-500',
]

function avatarGradient(name: string) {
  const i = name.charCodeAt(0) % AVATAR_GRADIENTS.length
  return AVATAR_GRADIENTS[i]
}

function accentColor(orgs: string[]) {
  const first = orgs[0]
  if (!first) return 'bg-gray-200'
  const c = ORG_COLORS[first]
  return c ? c.bg : 'bg-gray-200'
}

export default function ProfileCard({ profile }: { profile: Profile }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div style={{ perspective: '1000px' }}>
      <div
        className="relative transition-transform duration-500"
        style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* ── Front ── */}
        <div
          className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Colored accent bar from primary org */}
          <div className={`h-1 w-full ${accentColor(profile.organizations)}`} />

          <div className="p-5 flex flex-col flex-1">
            {/* Avatar + name */}
            <div className="flex items-center gap-3.5 mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${avatarGradient(profile.full_name)} flex items-center justify-center shrink-0 shadow-sm`}>
                <span className="text-white font-bold text-base">{profile.full_name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 text-[15px] leading-tight truncate">{profile.full_name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  {profile.graduation_year && (
                    <span className="text-xs text-gray-400">Class of {profile.graduation_year}</span>
                  )}
                  {profile.college && profile.graduation_year && (
                    <span className="text-gray-300 text-xs">·</span>
                  )}
                  {profile.college && (
                    <span className="text-xs text-gray-400">{profile.college}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Orgs — hero element */}
            {profile.organizations.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {profile.organizations.slice(0, 3).map((org) => (
                  <span key={org} className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${orgChipClasses(org)}`}>{org}</span>
                ))}
              </div>
            )}

            {/* Skills */}
            {profile.skills.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-300 mb-1.5">Skills</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {profile.skills.slice(0, 5).join(' · ')}
                  {profile.skills.length > 5 && <span className="text-gray-300"> +{profile.skills.length - 5} more</span>}
                </p>
              </div>
            )}

            {/* Interests */}
            {profile.interests.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-300 mb-1.5">Interests</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {profile.interests.slice(0, 4).join(' · ')}
                  {profile.interests.length > 4 && <span className="text-gray-300"> +{profile.interests.length - 4} more</span>}
                </p>
              </div>
            )}

            {/* Currently working on */}
            {profile.current_project && (
              <div className="mb-4 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-300 mb-1">Building</p>
                <p className="text-xs text-gray-600 line-clamp-2">{profile.current_project}</p>
              </div>
            )}

            {/* Contact button */}
            <div className="mt-auto">
              <button
                onClick={() => setFlipped(true)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-xl transition-colors tracking-wide"
              >
                Contact
              </button>
            </div>
          </div>
        </div>

        {/* ── Back ── */}
        <div
          className="absolute inset-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center p-6"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${avatarGradient(profile.full_name)} flex items-center justify-center mb-4 shadow-sm`}>
            <span className="text-white font-bold text-xl">{profile.full_name.charAt(0).toUpperCase()}</span>
          </div>
          <p className="font-bold text-gray-900 text-base mb-1">{profile.full_name}</p>
          {profile.organizations.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center mb-4">
              {profile.organizations.slice(0, 2).map((org) => (
                <span key={org} className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${orgChipClasses(org)}`}>{org}</span>
              ))}
            </div>
          )}
          {profile.email ? (
            <>
              <p className="text-xs text-gray-400 mb-2">Reach out at</p>
              <a href={`mailto:${profile.email}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700 break-all">
                {profile.email}
              </a>
            </>
          ) : (
            <p className="text-xs text-gray-400">No email on file</p>
          )}
          <button onClick={() => setFlipped(false)} className="mt-6 text-xs text-gray-300 hover:text-gray-500 transition-colors">
            ← Back
          </button>
        </div>
      </div>
    </div>
  )
}
