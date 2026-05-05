'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'

interface Block {
  date: string
  reason: string
}

export default function BlocksPage() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [newDate, setNewDate] = useState('')
  const [newReason, setNewReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const todayStr = new Date().toISOString().split('T')[0]

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/maxowner/manual-blocks')
    setBlocks(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const addBlock = async () => {
    if (!newDate) return
    if (blocks.some((b) => b.date === newDate)) {
      setError('That date is already blocked.')
      return
    }
    setSaving(true)
    setError('')
    await fetch('/api/maxowner/manual-blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: newDate, reason: newReason }),
    })
    setNewDate('')
    setNewReason('')
    setSaving(false)
    load()
  }

  const removeBlock = async (date: string) => {
    await fetch('/api/maxowner/manual-blocks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    })
    load()
  }

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-serif text-luxury-gold mb-1">Blocked Dates</h1>
      <p className="text-gray-400 text-sm mb-8">
        These stack on top of OTA iCal blocks. You can also block nights from the{' '}
        <Link href="/maxowner/pricing" className="text-luxury-gold hover:underline">Pricing</Link> calendar when editing selected dates.
      </p>

      {/* Add form */}
      <div className="bg-[#1a1a18] rounded-xl border border-white/10 p-6 mb-8">
        <h2 className="text-base font-semibold mb-4 text-gray-200">Add blocked date</h2>
        <div className="flex flex-wrap gap-3">
          <input
            type="date"
            value={newDate}
            min={todayStr}
            onChange={(e) => { setNewDate(e.target.value); setError('') }}
            className="px-3 py-2.5 bg-[#0f0f0d] border border-white/10 rounded-lg text-white focus:outline-none focus:border-luxury-gold transition-colors text-sm"
          />
          <input
            type="text"
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            placeholder="Reason (optional)"
            className="flex-1 min-w-[180px] px-3 py-2.5 bg-[#0f0f0d] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-luxury-gold transition-colors text-sm"
          />
          <button
            onClick={addBlock}
            disabled={saving || !newDate}
            className="px-5 py-2.5 bg-luxury-gold text-white text-sm font-semibold rounded-lg disabled:opacity-40 hover:bg-luxury-gold/90 transition-colors"
          >
            {saving ? 'Adding…' : 'Add'}
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      {/* Blocks list */}
      <div className="bg-[#1a1a18] rounded-xl border border-white/10 p-6">
        <h2 className="text-base font-semibold mb-4 text-gray-200">
          Manual blocks{' '}
          <span className="text-gray-500 font-normal text-sm">({blocks.length})</span>
        </h2>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : blocks.length === 0 ? (
          <p className="text-gray-500 text-sm">No manual blocks set.</p>
        ) : (
          <div className="space-y-2">
            {blocks.map((b) => (
              <div key={b.date} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <span className="text-gray-200 text-sm font-medium">{b.date}</span>
                  {b.reason && (
                    <span className="text-gray-500 text-sm ml-3">— {b.reason}</span>
                  )}
                </div>
                <button
                  onClick={() => removeBlock(b.date)}
                  className="text-gray-600 hover:text-red-400 text-sm transition-colors px-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
