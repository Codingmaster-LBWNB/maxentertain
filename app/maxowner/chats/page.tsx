'use client'

import { useEffect, useRef, useState } from 'react'

interface Lead {
  name?: string | null
  email: string
  reason: 'booking' | 'unanswered'
  checkIn?: string | null
  checkOut?: string | null
  capturedAt?: string
}

interface ConversationSummary {
  _id: string
  sessionId: string
  startedAt: string
  lastMessageAt: string
  messageCount: number
  firstUserMessage: string
  ipAddress?: string
  intents?: string[]
  escalated?: boolean
  lead?: Lead | null
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ConversationDetail {
  _id: string
  sessionId: string
  startedAt: string
  lastMessageAt: string
  messages: ChatMessage[]
  ipAddress?: string
  intents?: string[]
  escalated?: boolean
  escalatedQuestions?: string[]
  lead?: Lead | null
}

type Filter = 'all' | 'booking' | 'escalated' | 'leads'
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'booking', label: '🔥 Booking intent' },
  { id: 'escalated', label: '⚠️ Escalated' },
  { id: 'leads', label: '✉️ Leads' },
]

function Badges({ intents, escalated, lead }: { intents?: string[]; escalated?: boolean; lead?: Lead | null }) {
  const badges: string[] = []
  if (intents?.includes('booking_intent')) badges.push('🔥')
  if (escalated) badges.push('⚠️')
  if (lead) badges.push('✉️')
  if (!badges.length) return null
  return <span className="flex-shrink-0 text-[11px]">{badges.join(' ')}</span>
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return (
    d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
  )
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatsPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ConversationDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const threadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/maxowner/chats?page=${page}&filter=${filter}`)
      .then((r) => r.json())
      .then((data) => {
        setConversations(data.conversations ?? [])
        setTotal(data.total ?? 0)
      })
      .finally(() => setLoading(false))
  }, [page, filter])

  useEffect(() => {
    if (selected && threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight
    }
  }, [selected])

  const selectConversation = async (id: string) => {
    if (selected?._id === id) return
    setLoadingDetail(true)
    const res = await fetch(`/api/maxowner/chats/${id}`)
    const data = await res.json()
    setSelected(data.conversation ?? null)
    setLoadingDetail(false)
  }

  const pages = Math.ceil(total / 30)

  return (
    <div className="flex h-full min-h-0">

      {/* ── Left pane: conversation list ── */}
      <div className="w-80 flex-shrink-0 border-r border-white/10 flex flex-col min-h-0">
        <div className="px-5 py-4 border-b border-white/10 flex-shrink-0">
          <h1 className="text-white font-semibold text-sm tracking-wide">Chat Conversations</h1>
          <p className="text-gray-500 text-xs mt-0.5">{total} {filter === 'all' ? 'total stored' : 'match filter'}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setFilter(f.id)
                  setPage(1)
                }}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                  filter === f.id
                    ? 'border-luxury-gold bg-luxury-gold/15 text-luxury-gold'
                    : 'border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-5 text-gray-500 text-xs">Loading…</div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center p-6">
              <span className="text-3xl mb-2">💬</span>
              <p className="text-gray-500 text-xs">No conversations yet.</p>
              <p className="text-gray-600 text-xs mt-1">They will appear here once guests start chatting.</p>
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c._id}
                onClick={() => selectConversation(c._id)}
                className={`w-full text-left px-4 py-3.5 border-b border-white/5 transition-colors ${
                  selected?._id === c._id
                    ? 'bg-luxury-gold/10 border-l-2 border-l-luxury-gold'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] text-gray-400 leading-none">
                    {formatDateTime(c.startedAt)}
                  </span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Badges intents={c.intents} escalated={c.escalated} lead={c.lead} />
                    <span className="text-[11px] bg-white/10 text-gray-300 rounded-full px-2 py-0.5">
                      {c.messageCount}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-200 leading-snug line-clamp-2">
                  {c.firstUserMessage || '(empty)'}
                </p>
                {c.ipAddress && (
                  <p className="text-[10px] text-gray-600 mt-1">{c.ipAddress}</p>
                )}
              </button>
            ))
          )}
        </div>

        {pages > 1 && (
          <div className="p-3 border-t border-white/10 flex items-center justify-between flex-shrink-0">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              ← Prev
            </button>
            <span className="text-xs text-gray-500">{page} / {pages}</span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="px-3 py-1.5 text-xs text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ── Right pane: thread ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {loadingDetail ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-xs">
            Loading conversation…
          </div>
        ) : selected ? (
          <>
            {/* Thread header */}
            <div className="px-6 py-4 border-b border-white/10 flex-shrink-0">
              <p className="text-white text-sm font-medium">
                {formatDateTime(selected.startedAt)}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                {selected.messages.length} messages
                {' · '}session <span className="font-mono">{selected.sessionId.slice(0, 8)}…</span>
                {selected.ipAddress ? ` · IP ${selected.ipAddress}` : ''}
              </p>

              {selected.lead && (
                <div className="mt-3 rounded-lg border border-luxury-gold/30 bg-luxury-gold/10 px-3 py-2 text-xs">
                  <span className="text-luxury-gold font-semibold">
                    {selected.lead.reason === 'booking' ? '✉️ Booking lead' : '⚠️ Wants owner reply'}
                  </span>
                  <span className="text-gray-200 ml-2">
                    {selected.lead.name ? `${selected.lead.name} · ` : ''}
                    <a href={`mailto:${selected.lead.email}`} className="text-luxury-gold underline">{selected.lead.email}</a>
                    {selected.lead.checkIn ? ` · ${selected.lead.checkIn} → ${selected.lead.checkOut}` : ''}
                  </span>
                </div>
              )}

              {(selected.escalatedQuestions?.length ?? 0) > 0 && (
                <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs">
                  <p className="text-amber-300 font-semibold mb-1">Couldn&apos;t answer:</p>
                  <ul className="text-gray-200 space-y-0.5 list-disc list-inside">
                    {selected.escalatedQuestions!.map((q, i) => <li key={i}>{q}</li>)}
                  </ul>
                </div>
              )}

              {(selected.intents?.length ?? 0) > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selected.intents!.map((intent) => (
                    <span key={intent} className="text-[10px] uppercase tracking-wide bg-white/10 text-gray-300 rounded px-2 py-0.5">
                      {intent.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Messages thread */}
            <div ref={threadRef} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
              {selected.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col max-w-[72%] gap-1 ${
                    msg.role === 'user' ? 'self-start items-start' : 'self-end items-end'
                  }`}
                >
                  <div
                    className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'rounded-2xl rounded-tl-sm bg-white/10 border border-white/10 text-gray-100'
                        : 'rounded-2xl rounded-tr-sm bg-luxury-gold/15 border border-luxury-gold/20 text-white'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[11px] text-gray-600 px-1">
                    {msg.role === 'user' ? 'Guest' : 'MAX AI'} · {formatTime(msg.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <span className="text-5xl mb-4">💬</span>
            <p className="text-gray-400 text-sm font-medium">Select a conversation</p>
            <p className="text-gray-600 text-xs mt-1 max-w-xs">
              Guest messages appear on the left, MAX AI replies on the right
            </p>
          </div>
        )}
      </div>

    </div>
  )
}
