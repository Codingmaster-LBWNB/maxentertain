'use client'

import React from 'react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { trackClick } from '@/lib/analytics'

type Role = 'user' | 'assistant'
type ChatAction =
  | { type: 'book_cta'; checkIn: string; checkOut: string; totalAud: number }
  | { type: 'collect_contact'; reason: 'booking' | 'unanswered'; checkIn?: string; checkOut?: string; question?: string }
type ChatMessage = {
  id: string
  role: Role
  content: string
  time: string
  actions?: ChatAction[]
  suggestions?: string[]
  leadDone?: boolean
}

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}
function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const SUGGESTED = [
  'Check-in & check-out times?',
  'Is the pool heated?',
  'Pet friendly?',
  'Max guests allowed?',
  'Kids entertainment?',
  'House rules?',
  'Distance to the beach?',
]

const CHATBOT_ICON = encodeURI('/Airbnb picture/icons_files/chatbot.png')
const CHAT_STORAGE_KEY = 'max_chat_v2'
const SESSION_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

function loadSession(): { sessionId: string; messages: ChatMessage[] } | null {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { sessionId: string; messages: ChatMessage[]; expiresAt: number }
    if (!parsed.sessionId || !Array.isArray(parsed.messages) || Date.now() > parsed.expiresAt) {
      localStorage.removeItem(CHAT_STORAGE_KEY)
      return null
    }
    return { sessionId: parsed.sessionId, messages: parsed.messages }
  } catch {
    return null
  }
}

function saveSession(sessionId: string, msgs: ChatMessage[]) {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({
      sessionId,
      messages: msgs,
      expiresAt: Date.now() + SESSION_TTL_MS,
    }))
  } catch {}
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-0.5 py-0.5">
      {(['-0.3s', '-0.15s', '0s'] as const).map((delay, i) => (
        <span
          key={i}
          className="animate-bounce-dot"
          style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#D4AF37',
            animationDelay: delay,
          }}
        />
      ))}
    </div>
  )
}

/**
 * Split an assistant message into clean display text + follow-up suggestions.
 * Handles legacy/leaked metadata in either `<<META>>{...}<<END>>` or a
 * ```json {"suggestions":[...]}``` code fence, so raw metadata never shows in
 * the bubble and the questions render as clickable chips instead.
 */
function splitMeta(content: string): { text: string; suggestions: string[] } {
  let suggestions: string[] = []
  const metaMatch = content.match(/<<META>>([\s\S]*?)(?:<<END>>|$)/)
  const fenceMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?"suggestions"[\s\S]*?\})\s*```/)
  const jsonStr = metaMatch?.[1] ?? fenceMatch?.[1]
  if (jsonStr) {
    try {
      const p = JSON.parse(jsonStr.trim())
      if (Array.isArray(p?.suggestions)) {
        suggestions = p.suggestions
          .filter((s: unknown) => typeof s === 'string' && s.trim())
          .map((s: string) => s.trim())
          .slice(0, 3)
      }
    } catch { /* ignore malformed metadata */ }
  }
  const text = content
    .replace(/<<META>>[\s\S]*?(?:<<END>>|$)/g, '')
    .replace(/```(?:json)?\s*\{[\s\S]*?"suggestions"[\s\S]*?\}\s*```/g, '')
    .trim()
  return { text, suggestions }
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  )
}

function MarkdownMessage({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/)
  return (
    <div className="space-y-2 text-base leading-relaxed">
      {paragraphs.map((para, pi) => {
        const lines = para.split('\n').filter((l) => l.trim())
        const isBullet = lines.length > 0 && lines.every((l) => /^[-•*]\s/.test(l))
        const isNumbered = lines.length > 0 && lines.every((l) => /^\d+\.\s/.test(l))

        if (isBullet) {
          return (
            <ul key={pi} className="space-y-1">
              {lines.map((line, li) => (
                <li key={li} className="flex gap-2">
                  <span className="text-luxury-gold mt-0.5 flex-shrink-0 text-sm">•</span>
                  <span>{renderInline(line.replace(/^[-•*]\s+/, ''))}</span>
                </li>
              ))}
            </ul>
          )
        }

        if (isNumbered) {
          return (
            <ol key={pi} className="space-y-1">
              {lines.map((line, li) => {
                const m = line.match(/^(\d+)\.\s+(.*)/)
                return (
                  <li key={li} className="flex gap-2">
                    <span className="text-luxury-gold font-semibold flex-shrink-0 text-sm min-w-[18px]">{m?.[1] ?? li + 1}.</span>
                    <span>{renderInline(m?.[2] ?? line)}</span>
                  </li>
                )
              })}
            </ol>
          )
        }

        return (
          <p key={pi}>
            {lines.map((line, li) => (
              <React.Fragment key={li}>
                {li > 0 && <br />}
                {renderInline(line)}
              </React.Fragment>
            ))}
          </p>
        )
      })}
    </div>
  )
}

function ContactForm({
  reason,
  sessionId,
  checkIn,
  checkOut,
  question,
  onDone,
}: {
  reason: 'booking' | 'unanswered'
  sessionId: string | null
  checkIn?: string
  checkOut?: string
  question?: string
  onDone: () => void
}) {
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [err, setErr] = React.useState('')

  const submit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr('Please enter a valid email.')
      return
    }
    setBusy(true)
    setErr('')
    try {
      const res = await fetch('/api/chat/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reason, sessionId, name, email, checkIn, checkOut, question }),
      })
      if (!res.ok) throw new Error()
      onDone()
    } catch {
      setErr('Could not send. Please try again or email us directly.')
      setBusy(false)
    }
  }

  return (
    <div className="mt-2 w-full rounded-xl border border-luxury-gold/25 bg-luxury-gold/[0.06] p-3">
      <p className="text-sm text-white/80 mb-2">
        {reason === 'booking' ? 'Leave your details and Jason will help you book.' : "Leave your email and Jason will reply personally."}
      </p>
      <div className="flex flex-col gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-lg bg-white/95 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-luxury-gold"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Your email"
          className="w-full rounded-lg bg-white/95 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-luxury-gold"
        />
        {err && <p className="text-xs text-red-300">{err}</p>}
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="rounded-lg bg-luxury-gold px-3 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? 'Sending…' : reason === 'booking' ? 'Request booking help' : 'Send to Jason'}
        </button>
      </div>
    </div>
  )
}

function BotAvatar({ size = 28 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center flex-shrink-0 rounded-full overflow-hidden bg-white"
      style={{
        width: size,
        height: size,
        boxShadow: '0 0 0 1px rgba(212,175,55,0.35)',
      }}
    >
      <Image
        src={CHATBOT_ICON}
        alt="MAX Assistant"
        fill
        className="object-cover"
        sizes={`${size}px`}
      />
    </div>
  )
}

export default function GuestChatWidget() {
  const [open, setOpen] = useState(false)
  const [panelVisible, setPanelVisible] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'greeting',
      role: 'assistant',
      content:
        "Hi! I'm MAX, your virtual concierge. Ask me anything about the property — amenities, house rules, nearby attractions, and more.",
      time: '',
    },
  ])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const [hasSent, setHasSent] = useState(false)

  const sessionIdRef = useRef<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setPanelVisible(true), 10)
      return () => clearTimeout(t)
    } else {
      setPanelVisible(false)
    }
  }, [open])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 320)
  }, [open])

  useEffect(() => {
    if (open) scrollToBottom()
  }, [open, messages.length])

  // Restore session from localStorage on mount (client-only, avoids SSR mismatch)
  useEffect(() => {
    const saved = loadSession()
    if (saved && saved.messages.length > 0) {
      sessionIdRef.current = saved.sessionId
      setMessages(saved.messages)
      if (saved.messages.some((m) => m.role === 'user')) setHasSent(true)
    } else {
      // No saved session: fill in the greeting timestamp on the client
      setMessages((prev) => prev.map((m, i) => (i === 0 ? { ...m, time: getTime() } : m)))
    }
  }, [])

  // Persist the session on every message change (survives refresh, keeps same sessionId)
  useEffect(() => {
    if (!sessionIdRef.current) return
    if (messages.length <= 1) return
    saveSession(sessionIdRef.current, messages)
  }, [messages])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key === 'Tab') {
        const els = panelRef.current?.querySelectorAll<HTMLElement>(
          'button,textarea,a[href],[tabindex]:not([tabindex="-1"])'
        )
        if (!els?.length) return
        const first = els[0]
        const last = els[els.length - 1]
        const active = document.activeElement as HTMLElement
        if (e.shiftKey && active === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && active === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const markLeadDone = (messageId: string) => {
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, leadDone: true } : m)))
  }

  const clearChat = () => {
    try { localStorage.removeItem(CHAT_STORAGE_KEY) } catch {}
    sessionIdRef.current = null
    setMessages([
      { id: uid(), role: 'assistant', content: 'Chat cleared. How can I help you?', time: getTime() },
    ])
    setError('')
    setInput('')
    setHasSent(false)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isSending) return

    trackClick('Chat Message Sent')
    setIsSending(true)
    setError('')
    setInput('')
    setHasSent(true)

    if (!sessionIdRef.current) sessionIdRef.current = crypto.randomUUID()
    const sessionId = sessionIdRef.current

    const userMsg: ChatMessage = { id: uid(), role: 'user', content: trimmed, time: getTime() }
    const next = [...messages, userMsg]
    setMessages(next)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          sessionId,
        }),
      })

      if (!res.ok || !res.body) {
        const ra = res.headers.get('retry-after')
        const body = await res.json().catch(() => null)
        throw new Error(
          res.status === 429
            ? `Too many requests. Please wait ${ra ?? 'a moment'}.`
            : body?.error || 'Something went wrong.'
        )
      }

      const assistantId = uid()
      const baseTime = getTime()
      let accumulated = ''
      let actions: ChatAction[] = []
      let suggestions: string[] = []

      const renderAssistant = () =>
        setMessages([
          ...next,
          { id: assistantId, role: 'assistant', content: accumulated, time: baseTime, actions, suggestions },
        ])

      renderAssistant() // show empty bubble immediately

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split('\n\n')
        buffer = events.pop() ?? ''
        for (const evt of events) {
          const line = evt.split('\n').find((l) => l.startsWith('data: '))
          if (!line) continue
          const payload = line.slice(6)
          if (payload === '[DONE]') continue
          try {
            const data = JSON.parse(payload)
            if (data.type === 'text') {
              accumulated += data.delta
            } else if (data.type === 'meta') {
              actions = Array.isArray(data.actions) ? data.actions : []
              suggestions = Array.isArray(data.suggestions) ? data.suggestions : []
            }
            renderAssistant()
            scrollToBottom()
          } catch { /* ignore malformed event */ }
        }
      }

      const finalAssistant: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: accumulated.trim() || "Sorry, I couldn't generate a response.",
        time: baseTime,
        actions,
        suggestions,
      }
      const finalMessages = [...next, finalAssistant]
      setMessages(finalMessages)
      saveSession(sessionId, finalMessages)
    } catch (e: any) {
      setError(e?.message || 'Something went wrong.')
    } finally {
      setIsSending(false)
      setTimeout(() => {
        scrollToBottom()
        inputRef.current?.focus()
      }, 0)
    }
  }

  const MAX_CHARS = 500
  const remaining = MAX_CHARS - input.length

  return (
    <>
      <div className="fixed bottom-[72px] right-4 md:bottom-5 md:right-5 z-[90] flex flex-col items-end gap-3">
        {/* Panel */}
        {open && (
          <div
            ref={panelRef}
            style={{
              transform: panelVisible ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(18px)',
              opacity: panelVisible ? 1 : 0,
              transition:
                'transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease',
              transformOrigin: 'bottom right',
              background: 'linear-gradient(160deg, #1c1a14 0%, #0d0c09 100%)',
            }}
            className="w-[92vw] max-w-sm md:max-w-[400px] h-[72vh] md:h-[580px] flex flex-col rounded-2xl overflow-hidden border border-luxury-gold/20 shadow-2xl shadow-black/70"
            role="dialog"
            aria-modal="false"
            aria-label="MAX Assistant"
          >
            {/* Gold hairline */}
            <div
              className="h-px w-full flex-shrink-0"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, #D4AF37 40%, #D4AF37 60%, transparent 100%)',
              }}
            />

            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
              style={{
                background: 'rgba(255,255,255,0.025)',
                borderBottom: '1px solid rgba(212,175,55,0.1)',
              }}
            >
              {/* Avatar with pulse */}
              <div className="relative flex-shrink-0">
                <div
                  className="relative w-10 h-10 rounded-full overflow-hidden bg-white"
                  style={{
                    boxShadow: '0 0 0 1px rgba(212,175,55,0.4)',
                  }}
                >
                  <Image
                    src={CHATBOT_ICON}
                    alt="MAX Assistant"
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <span
                  className="absolute inset-0 rounded-full animate-ring-pulse"
                  style={{ border: '2px solid rgba(212,175,55,0.5)' }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-base font-semibold text-white/95 tracking-wide truncate">
                  MAX Assistant
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-white/65 truncate">
                    Online · Property concierge
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={clearChat}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
                  aria-label="Clear chat"
                  title="Clear chat"
                >
                  <span className="material-icons" style={{ fontSize: '16px' }}>
                    delete_outline
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
                  aria-label="Close chat"
                  title="Close"
                >
                  <span className="material-icons" style={{ fontSize: '18px' }}>
                    close
                  </span>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(212,175,55,0.15) transparent' }}
            >
              {messages.map((m) => {
                const parsed = m.role === 'assistant' ? splitMeta(m.content) : { text: m.content, suggestions: [] }
                const chips = (m.suggestions?.length ? m.suggestions : parsed.suggestions) ?? []
                return (
                <div
                  key={m.id}
                  className={`flex gap-2 animate-fade-in ${
                    m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {m.role === 'assistant' && <BotAvatar size={28} />}

                  <div
                    className={`flex flex-col gap-0.5 ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                    style={{ maxWidth: '82%' }}
                  >
                    <div
                      className={`px-3.5 py-2.5 text-base leading-relaxed rounded-2xl ${
                        m.role === 'user' ? 'text-white rounded-tr-sm' : 'text-white/90 rounded-tl-sm'
                      }`}
                      style={
                        m.role === 'user'
                          ? { background: 'linear-gradient(135deg, #D4AF37, #B8960C)' }
                          : {
                              background: 'rgba(255,255,255,0.07)',
                              border: '1px solid rgba(255,255,255,0.06)',
                            }
                      }
                    >
                      {m.role === 'assistant'
                        ? (parsed.text ? <MarkdownMessage text={parsed.text} /> : <TypingDots />)
                        : m.content}
                    </div>
                    {m.time && <span className="text-xs text-white/45 px-1">{m.time}</span>}

                    {/* Action buttons / lead capture */}
                    {m.role === 'assistant' && m.actions?.map((action, ai) => {
                      if (action.type === 'book_cta') {
                        const href = `/book?checkIn=${action.checkIn}&checkOut=${action.checkOut}`
                        return (
                          <a
                            key={ai}
                            href={href}
                            onClick={() => trackClick('Chat Book CTA')}
                            className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-luxury-gold px-3.5 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
                          >
                            <span className="material-icons" style={{ fontSize: '16px' }}>event_available</span>
                            Book {action.checkIn} → {action.checkOut} · ${action.totalAud.toLocaleString()}
                          </a>
                        )
                      }
                      if (action.type === 'collect_contact') {
                        return m.leadDone ? (
                          <div key={ai} className="mt-2 flex items-center gap-1.5 text-sm text-emerald-300">
                            <span className="material-icons" style={{ fontSize: '16px' }}>check_circle</span>
                            Sent — Jason will be in touch by email.
                          </div>
                        ) : (
                          <ContactForm
                            key={ai}
                            reason={action.reason}
                            sessionId={sessionIdRef.current}
                            checkIn={action.checkIn}
                            checkOut={action.checkOut}
                            question={action.question}
                            onDone={() => markLeadDone(m.id)}
                          />
                        )
                      }
                      return null
                    })}

                    {/* Follow-up suggestion chips (latest assistant message only) */}
                    {m.role === 'assistant' &&
                      !isSending &&
                      m.id === messages[messages.length - 1]?.id &&
                      chips.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {chips.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => send(s)}
                              className="text-sm px-3 py-1.5 rounded-full text-white/75 bg-white/7 border border-white/10 hover:text-luxury-gold hover:border-luxury-gold/40 hover:bg-luxury-gold/8 transition-all"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
                )
              })}

              {isSending && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-2 flex-row animate-fade-in">
                  <BotAvatar size={28} />
                  <div
                    className="px-3.5 py-3 rounded-2xl rounded-tl-sm"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <TypingDots />
                  </div>
                </div>
              )}

              {error && (
                <div
                  className="rounded-xl px-3.5 py-2.5 text-sm text-red-200"
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.18)',
                  }}
                >
                  {error}
                </div>
              )}
            </div>

            {/* Quick replies */}
            {!hasSent && (
              <div className="px-4 pb-3 flex-shrink-0">
                <p className="text-xs text-white/55 mb-2 uppercase tracking-wider">
                  Quick questions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED.slice(0, 4).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => send(q)}
                      className="text-sm px-3 py-2 rounded-full text-white/75 bg-white/7 border border-white/10 hover:text-luxury-gold hover:border-luxury-gold/40 hover:bg-luxury-gold/8 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
              className="px-4 pb-4 pt-3 flex-shrink-0"
              style={{ borderTop: '1px solid rgba(212,175,55,0.1)' }}
            >
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
                    placeholder="Ask me anything…"
                    rows={2}
                    className="w-full resize-none rounded-xl text-base text-white/90 placeholder-white/45 bg-white/7 border border-white/10 focus:border-luxury-gold/40 focus:bg-luxury-gold/[0.04] focus:outline-none transition-all px-3 py-2.5"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        send(input)
                      }
                    }}
                  />
                  {input.length > 0 && (
                    <span
                      className={`absolute bottom-2 right-2.5 text-[10px] transition-colors ${
                        remaining < 50 ? 'text-amber-400/70' : 'text-white/20'
                      }`}
                    >
                      {remaining}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSending || input.trim().length === 0}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-25 disabled:cursor-not-allowed flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37, #B8960C)',
                    boxShadow:
                      !isSending && input.trim().length > 0
                        ? '0 0 20px rgba(212,175,55,0.35)'
                        : 'none',
                  }}
                  aria-label="Send message"
                >
                  <span
                    className={`material-icons ${isSending ? 'animate-spin' : ''}`}
                    style={{ fontSize: '18px' }}
                  >
                    {isSending ? 'autorenew' : 'send'}
                  </span>
                </button>
              </div>

              <div className="mt-2 text-center">
                <span className="text-xs text-white/55">
                  For bookings →{' '}
                  <a
                    href="/inquiry"
                    className="text-luxury-gold/80 hover:text-luxury-gold transition-colors underline-offset-2 hover:underline"
                  >
                    Enquiry form
                  </a>
                </span>
              </div>
            </form>
          </div>
        )}

        {/* Floating trigger button */}
        <button
          type="button"
          onClick={() => { const next = !open; setOpen(next); if (next) trackClick('Chat Opened') }}
          aria-label={open ? 'Close MAX Assistant' : 'Chat with MAX'}
          className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-luxury-gold/20 transition-transform hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #D4AF37, #B8960C)' }}
        >
          {!open && (
            <span
              className="absolute inset-0 rounded-full animate-ring-pulse"
              style={{ background: 'rgba(212,175,55,0.35)' }}
            />
          )}
          {open ? (
            <span className="material-icons text-white relative z-10" style={{ fontSize: '24px' }}>
              close
            </span>
          ) : (
            <span className="relative z-10 w-11 h-11 rounded-full overflow-hidden bg-white">
              <Image
                src={CHATBOT_ICON}
                alt="Chat with MAX"
                fill
                className="object-cover"
                sizes="44px"
              />
            </span>
          )}
        </button>
      </div>
    </>
  )
}
