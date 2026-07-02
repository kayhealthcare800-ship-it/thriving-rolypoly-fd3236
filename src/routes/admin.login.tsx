import { useState } from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { adminLogin, checkAdminSetupAvailable } from '@/server/admin-auth.functions'

export const Route = createFileRoute('/admin/login')({
  component: AdminLoginPage,
  loader: async () => {
    const { available } = await checkAdminSetupAvailable()
    return { setupAvailable: available }
  },
})

function AdminLoginPage() {
  const { setupAvailable } = Route.useLoaderData()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await adminLogin({ data: { email, password } })
      navigate({ to: '/admin' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-fg-cream px-5">
      <div className="w-full max-w-sm rounded-2xl border-t-4 border-fg-maroon bg-white p-8 shadow-xl">
        <p className="text-center font-serif text-lg">
          <span className="font-semibold text-fg-ink">FAITHFUL</span>{' '}
          <span className="font-semibold text-fg-gold">GOD</span>
        </p>
        <h1 className="mt-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-fg-ink/50">
          Super Admin Console
        </h1>

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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-fg-maroon py-3 text-sm font-semibold uppercase tracking-wider text-fg-cream hover:bg-fg-maroon-dark disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

        {setupAvailable && (
          <p className="mt-6 text-center text-xs text-fg-ink/50">
            No admin exists yet.{' '}
            <Link to="/admin/setup" className="font-semibold text-fg-gold hover:text-fg-maroon">
              Create the first admin
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
