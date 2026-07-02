import { useState } from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { setupFirstAdmin, checkAdminSetupAvailable } from '@/server/admin-auth.functions'

export const Route = createFileRoute('/admin/setup')({
  component: AdminSetupPage,
  loader: async () => {
    const { available } = await checkAdminSetupAvailable()
    return { available }
  },
})

function AdminSetupPage() {
  const { available } = Route.useLoaderData()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!available) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fg-cream px-5 text-center">
        <div>
          <h1 className="font-serif text-2xl font-bold text-fg-maroon">Setup Unavailable</h1>
          <p className="mt-2 text-sm text-fg-ink/60">
            An admin account already exists. This one-time setup route is disabled.
          </p>
          <Link
            to="/admin/login"
            className="mt-6 inline-block rounded-full bg-fg-maroon px-6 py-3 text-sm font-semibold uppercase tracking-wide text-fg-cream"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await setupFirstAdmin({ data: { email, password } })
      navigate({ to: '/admin/login' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-fg-cream px-5">
      <div className="w-full max-w-sm rounded-2xl border-t-4 border-fg-maroon bg-white p-8 shadow-xl">
        <h1 className="text-center font-serif text-xl font-bold text-fg-maroon">
          Create First Admin
        </h1>
        <p className="mt-1 text-center text-xs text-fg-ink/50">
          This is only available while no admin account exists.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            required
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-fg-maroon py-3 text-sm font-semibold uppercase tracking-wider text-fg-cream hover:bg-fg-maroon-dark disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create Admin'}
          </button>
        </form>

        {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
      </div>
    </div>
  )
}
