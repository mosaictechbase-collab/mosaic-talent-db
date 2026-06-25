'use client'

import { useState } from 'react'
import type { Profile } from '@/lib/types'
import { orgChipClasses } from '@/lib/orgs'

export default function ProfileCard({ profile }: { profile: Profile }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="h-full min-h-[260px]" style={{ perspective: '1000px' }}>
      <div
        className="relative h-full transition-transform duration-500"
        style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* ── Front ── */}
        <div
          className="absolute inset-0 bg-white border border-gray-200 rounded-xl p-5 flex flex-col"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Avatar + name */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-blue-600 font-semibold text-sm">
                {profile.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">{profile.full_name}</h3>
              {profile.graduation_year && (
                <span className="text-xs text-gray-400">Class of {profile.graduation_year}</span>
              )}
            </div>
          </div>

          {/* Orgs */}
          {profile.organizations.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {profile.organizations.slice(0, 3).map((org) => (
                <span key={org} className={`text-xs font-medium px-2 py-0.5 rounded-full ${orgChipClasses(org)}`}>{org}</span>
              ))}
            </div>
          )}

          {/* Location */}
          {profile.location && (
            <div className="flex items-center gap-0.5 text-xs text-gray-400 mb-2">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {profile.location}
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{profile.bio}</p>
          )}

          {/* Skills */}
          {profile.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {profile.skills.slice(0, 3).map((skill) => (
                <span key={skill} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">{skill}</span>
              ))}
              {profile.skills.length > 3 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">+{profile.skills.length - 3}</span>
              )}
            </div>
          )}

          {/* Currently working on */}
          {profile.current_project && (
            <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs font-medium text-blue-600 mb-0.5">Currently working on</p>
              <p className="text-xs text-gray-700 line-clamp-2">{profile.current_project}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
            {profile.interests.length > 0 ? (
              <p className="text-xs text-gray-400 truncate pr-2">{profile.interests.slice(0, 2).join(', ')}</p>
            ) : <span />}
            <button
              onClick={() => setFlipped(true)}
              className="shrink-0 flex items-center gap-1 bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              Contact
            </button>
          </div>
        </div>

        {/* ── Back ── */}
        <div
          className="absolute inset-0 bg-white border border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center text-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
            <span className="text-blue-600 font-bold text-lg">{profile.full_name.charAt(0).toUpperCase()}</span>
          </div>
          <p className="font-semibold text-gray-900 text-sm mb-1">{profile.full_name}</p>
          {profile.email ? (
            <>
              <p className="text-xs text-gray-400 mb-3">Reach out at</p>
              <a
                href={`mailto:${profile.email}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 break-all"
              >
                {profile.email}
              </a>
            </>
          ) : (
            <p className="text-xs text-gray-400">No email on file</p>
          )}
          <button
            onClick={() => setFlipped(false)}
            className="mt-6 text-xs text-gray-400 hover:text-gray-600 underline"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  )
}
