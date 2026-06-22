import type { Profile } from '@/lib/types'

interface Props {
  profile: Profile
}

export default function ProfileCard({ profile }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col h-full">
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

      {/* Org + location */}
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mb-2">
        {profile.organizations.slice(0, 2).map((org) => (
          <span key={org} className="text-xs font-medium text-blue-600">{org}</span>
        ))}
        {profile.location && (
          <span className="flex items-center gap-0.5 text-xs text-gray-400">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {profile.location}
          </span>
        )}
      </div>

      {/* Bio */}
      {profile.bio && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{profile.bio}</p>
      )}

      {/* Skills */}
      {profile.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {profile.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
              {skill}
            </span>
          ))}
          {profile.skills.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
              +{profile.skills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
        {profile.interests.length > 0 ? (
          <p className="text-xs text-gray-400 truncate pr-2">
            {profile.interests.slice(0, 2).join(', ')}
          </p>
        ) : <span />}
        {profile.linkedin_url && (
          <a
            href={profile.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1 bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact
          </a>
        )}
      </div>
    </div>
  )
}
