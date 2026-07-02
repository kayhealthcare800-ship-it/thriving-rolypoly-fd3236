import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { retrieveByEmail } from '@/server/registrations.functions'

export const Route = createFileRoute('/retrieve')({
  component: RetrievePage,
})

function RetrievePage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'not-found'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    const result = await retrieveByEmail({ data: { email } })
    if (result) {
      navigate({ to: '/ticket/$ref', params: { ref: result.ticketRef } })
    } else {
      setStatus('not-found')
    }
  }

  return (
    <div className="min-h-screen bg-fg-cream">
      <Header />
      <div className="mx-auto max-w-md px-5 py-20">
        <div className="rounded-2xl border-t-4 border-fg-maroon bg-white p-8 shadow-xl">
          <h1 className="font-serif text-2xl font-bold text-fg-maroon">Retrieve Your Pass</h1>
          <p className="mt-1 text-sm text-fg-ink/60">
            Enter the email address you registered with to find your seating pass.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full rounded-full bg-fg-maroon py-3.5 text-sm font-semibold uppercase tracking-wider text-fg-cream transition hover:bg-fg-maroon-dark disabled:opacity-50"
            >
              {status === 'loading' ? 'Searching…' : 'Retrieve Pass'}
            </button>
          </form>

          {status === 'not-found' && (
            <p className="mt-4 text-sm font-medium text-red-600">
              No registration found for that email. Please double-check, or register below.
            </p>
          )}

          <a
            href="/register"
            className="mt-6 block text-center text-xs font-semibold uppercase tracking-wide text-fg-gold hover:text-fg-maroon"
          >
            Not registered yet? Register Now
          </a>
        </div>
      </div>
      <Footer />
    </div>
  )
}
