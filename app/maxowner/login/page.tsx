'use client'

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/maxowner/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    setLoading(false)
    if (res.ok) {
      const from = params.get('from') ?? '/maxowner/pricing'
      router.push(from)
    } else {
      setError('Incorrect password.')
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0d] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-luxury-gold text-2xl font-serif tracking-widest">MAX OWNER</span>
          <p className="text-gray-500 text-sm mt-1">Property management</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1a1a18] rounded-xl p-8 border border-white/10 space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full px-4 py-3 bg-[#0f0f0d] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-luxury-gold transition-colors"
              placeholder="Enter owner password"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-luxury-gold text-white font-semibold rounded-lg disabled:opacity-40 hover:bg-luxury-gold/90 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
