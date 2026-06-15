'use client'

import { useState } from 'react'
import { addProfile, type ManualProfileInput } from '@/app/admin/actions'

const empty: ManualProfileInput = {
  full_name: '', email: '', organizations: '', roles: '',
  skills: '', interests: '', graduation_year: '', major: '',
  location: '', bio: '', linkedin_url: '',
}

interface Props {
  onAdded: () => void
}

export default function ManualAddForm({ onAdded }: Props) {
  const [form, setForm] = useState<ManualProfileInput>(empty)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function set(field: keyof ManualProfileInput, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name.trim()) return
    setLoading(true)
    setError(null)
    setSuccess(false)

    const result = await addProfile(form)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setForm(empty)
      onAdded()
    }
    setLoading(false)
  }

  const field = (
    label: string,
    key: keyof ManualProfileInput,
    placeholder: string,
    hint?: string,
    required = false
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type="text"
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          Profile added successfully.
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {field('Full Name', 'full_name', 'Sarah Chen', undefined, true)}
        {field('Email', 'email', 'sarah@example.com')}
        {field('Organizations', 'organizations', 'Generate, IDEA', 'Comma-separated')}
        {field('Roles', 'roles', 'Founder, Designer', 'Comma-separated')}
        {field('Skills', 'skills', 'React, Figma, Python', 'Comma-separated')}
        {field('Interests', 'interests', 'FinTech, Sustainability', 'Comma-separated')}
        {field('Graduation Year', 'graduation_year', '2026')}
        {field('Major', 'major', 'Computer Science')}
        {field('Location', 'location', 'Boston, MA')}
        {field('LinkedIn URL', 'linkedin_url', 'https://linkedin.com/in/...')}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
        <textarea
          value={form.bio}
          onChange={(e) => set('bio', e.target.value)}
          placeholder="Short description..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !form.full_name.trim()}
        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Adding…' : 'Add Profile'}
      </button>
    </form>
  )
}
