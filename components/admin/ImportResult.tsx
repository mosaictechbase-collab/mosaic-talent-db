import type { ImportResult } from '@/lib/types'

interface Props {
  result: ImportResult
}

export default function ImportResultPanel({ result }: Props) {
  return (
    <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Import Complete</h3>
      </div>
      <div className="px-5 py-4">
        <div className="flex gap-8 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{result.inserted}</div>
            <div className="text-xs text-gray-500 mt-0.5">Inserted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{result.updated}</div>
            <div className="text-xs text-gray-500 mt-0.5">Updated</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">{result.skipped}</div>
            <div className="text-xs text-gray-500 mt-0.5">Skipped (dupes)</div>
          </div>
        </div>

        {result.errors.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium text-red-600 mb-1">Errors ({result.errors.length})</p>
            <ul className="text-xs text-red-500 space-y-0.5 max-h-32 overflow-y-auto">
              {result.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
