'use client'

import { useEffect, useRef, useState } from 'react'
import { trackClick } from '@/lib/analytics'

type Role = 'user' | 'assistant'
type ChatMessage = { id: string; role: Role; content: string; time: string }

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

function BotAvatar({ size = 28 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center text-white font-serif font-bold flex-shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: 'linear-gradient(135deg, #D4AF37, #8B7355)',
      }}
    >
      M
    </div>
  )
}

export default function GuestChatWidget() {
  const [open, setOpen] = useState(false)
  const [panelVisible, setPanelVisible] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      role: 'assistant',
      content:
        "Hi! I'm MAX, your virtual concierge. Ask me anything about the property — amenities, house rules, nearby attractions, and more.",
      time: getTime(),
    },
  ])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const [hasSent, setHasSent] = useState(false)

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

  const clearChat = () => {
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

    const userMsg: ChatMessage = { id: uid(), role: 'user', content: trimmed, time: getTime() }
    const next = [...messages, userMsg]
    setMessages(next)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })) }),
      })

      if (!res.ok) {
        const ra = res.headers.get('retry-after')
        const body = await res.json().catch(() => null)
        throw new Error(
          res.status === 429
            ? `Too many requests. Please wait ${ra ?? 'a moment'}.`
            : body?.error || 'Something went wrong.'
        )
      }

      const data = (await res.json()) as { reply?: string }
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'assistant',
          content: (data.reply || '').trim() || "Sorry, I couldn't generate a response.",
          time: getTime(),
        },
      ])
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
      <div className="fixed bottom-5 right-5 z-[90] flex flex-col items-end gap-3">
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
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-serif font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37, #8B7355)',
                    fontSize: '15px',
                  }}
                >
                  M
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
              {messages.map((m) => (
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
                      {m.content}
                    </div>
                    <span className="text-xs text-white/45 px-1">{m.time}</span>
                  </div>
                </div>
              ))}

              {isSending && (
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
          <span
            className={`material-icons text-white relative z-10 transition-transform duration-300 ${
              open ? 'rotate-0' : 'rotate-0'
            }`}
            style={{ fontSize: '24px' }}
          >
            {open ? 'close' : 'chat'}
          </span>
        </button>
      </div>
    </>
  )
}
