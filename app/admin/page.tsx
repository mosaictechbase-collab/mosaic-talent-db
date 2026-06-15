'use client'

import { useState } from 'react'
import UploadBox from '@/components/admin/UploadBox'
import ImportResultPanel from '@/components/admin/ImportResult'
import ManualAddForm from '@/components/admin/ManualAddForm'
import ProfileList from '@/components/admin/ProfileList'
import { importProfiles } from './actions'
import type { ImportResult } from '@/lib/types'

type Tab = 'upload' | 'add' | 'manage'

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  async function handleImport() {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await importProfiles(fd)
      setResult(res)
      setRefreshKey((k) => k + 1)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Import failed')
    } finally {
      setLoading(false)
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'upload', label: 'Upload CSV / Excel' },
    { id: 'add', label: 'Add Manually' },
    { id: 'manage', label: 'Manage Profiles' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Panel</h1>
      <p className="text-gray-500 text-sm mb-6">
        Manage the Mosaic Talent Network
      </p>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-8">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Upload tab */}
      {tab === 'upload' && (
        <div>
          <UploadBox
            onFile={(f) => { setFile(f); setResult(null); setError(null) }}
            disabled={loading}
          />

          {file && (
            <div className="mt-4 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                onClick={handleImport}
                disabled={loading}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Importing…' : 'Import'}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {result && <ImportResultPanel result={result} />}

          <div className="mt-10 border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="font-semibold text-gray-900">CSV File Format</h2>
            </div>
            <p className="text-sm text-gray-600 mb-3">Your CSV file should include the following columns:</p>
            <ul className="text-sm text-gray-600 space-y-1.5">
              {[
                ['name', 'Full name of the user'],
                ['email', 'Email address'],
                ['organization', 'Organization name (e.g., Generate, IDEA, Scout)'],
                ['skills', 'Comma-separated list of skills'],
                ['interests', 'Comma-separated list of interests'],
                ['location', 'Location (e.g., Boston, MA)'],
                ['bio', 'Short bio or description'],
                ['grad year', 'Graduation year (e.g., 2025)'],
                ['linkedin', 'LinkedIn profile URL'],
              ].map(([col, desc]) => (
                <li key={col}>
                  <span className="font-mono text-blue-700 text-xs bg-blue-50 px-1.5 py-0.5 rounded">{col}</span>
                  {' '}— {desc}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Add manually tab */}
      {tab === 'add' && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Add a profile manually</h2>
          <ManualAddForm onAdded={() => setRefreshKey((k) => k + 1)} />
        </div>
      )}

      {/* Manage tab */}
      {tab === 'manage' && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">All profiles</h2>
          <ProfileList refreshKey={refreshKey} />
        </div>
      )}
    </div>
  )
}
