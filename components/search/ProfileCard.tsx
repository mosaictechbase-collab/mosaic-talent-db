import type { Profile } from '@/lib/types'

interface Props {
  profile: Profile
}

export default function ProfileCard({ profile }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-base">{profile.full_name}</h3>
            {profile.graduation_year && (
              <span className="text-xs text-gray-400">Class of {profile.graduation_year}</span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {profile.organizations.slice(0, 2).map((org) => (
              <span key={org} className="text-sm font-medium text-blue-600">{org}</span>
            ))}
            {profile.location && (
              <span className="flex items-center gap-1 text-sm text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {profile.location}
              </span>
            )}
          </div>

          {profile.bio && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{profile.bio}</p>
          )}

          {profile.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {profile.skills.slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
              {profile.skills.length > 5 && (
                <span className="px-2.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                  +{profile.skills.length - 5}
                </span>
              )}
            </div>
          )}

          {profile.interests.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              Interests: {profile.interests.slice(0, 4).join(', ')}
            </p>
          )}
        </div>

        {profile.linkedin_url && (
          <a
            href={profile.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1.5 bg-blue-600 text-white text-xs font-medium px-3.5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact
          </a>
        )}
      </div>
    </div>
  )
}
