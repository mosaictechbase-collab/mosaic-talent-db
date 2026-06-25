'use client'

import { useState } from 'react'
import { addProfile, type ManualProfileInput } from '@/app/admin/actions'

const COLLEGES = ['COE', 'Khoury', 'DMSB', 'Bouve', 'COS', 'CSSH', 'CAMD', 'Mills', 'CPS']

const empty: ManualProfileInput = {
  full_name: '', email: '', college: '', organizations: '',
  skills: '', interests: '', graduation_year: '',
}

export default function ManualAddForm({ onAdded }: { onAdded: () => void }) {
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
    if (result.error) setError(result.error)
    else { setSuccess(true); setForm(empty); onAdded() }
    setLoading(false)
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">Profile added successfully.</div>}
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
          <input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Sarah Chen" required className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="sarah@northeastern.edu" className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
          <select value={form.college} onChange={e => set('college', e.target.value)} className={inputCls}>
            <option value="">Select college…</option>
            {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
          <input value={form.graduation_year} onChange={e => set('graduation_year', e.target.value)} placeholder="2026" className={inputCls} />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Organizations</label>
          <input value={form.organizations} onChange={e => set('organizations', e.target.value)} placeholder="Generate, Scout" className={inputCls} />
          <p className="text-xs text-gray-400 mt-0.5">Comma-separated</p>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
          <input value={form.skills} onChange={e => set('skills', e.target.value)} placeholder="Python, React, Figma" className={inputCls} />
          <p className="text-xs text-gray-400 mt-0.5">Comma-separated</p>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
          <input value={form.interests} onChange={e => set('interests', e.target.value)} placeholder="FinTech, Sustainability" className={inputCls} />
          <p className="text-xs text-gray-400 mt-0.5">Comma-separated</p>
        </div>
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
