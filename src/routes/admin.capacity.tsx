import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { updateMainHallCapacity } from '@/server/registrations.functions'
import { getCurrentAdmin } from '@/server/admin-auth.functions'
import { getMainHallCapacity } from '@/server/registrations.functions'
import { useState } from 'react'

export const Route = createFileRoute('/admin/capacity')({
  component: AdminCapacityPage,
  loader: async () => {
    const admin = await getCurrentAdmin()
    if (!admin) throw redirect({ to: '/admin/login' })
    const capacity = await getMainHallCapacity()
    return { capacity }
  },
})

function AdminCapacityPage() {
  const { capacity } = Route.useLoaderData()
  const [value, setValue] = useState(capacity)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    await updateMainHallCapacity({ data: { capacity: value } })
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="min-h-screen bg-fg-cream">
      <div className="border-b border-fg-gold/20 bg-fg-cream px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <p className="font-serif text-lg">
            <span className="font-semibold text-fg-ink">FAITHFUL</span>{' '}
            <span className="font-semibold text-fg-gold">GOD</span>
          </p>
          <Link to="/admin" className="text-xs font-semibold uppercase tracking-wide text-fg-maroon hover:underline">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-md px-5 py-14">
        <div className="rounded-2xl border-t-4 border-fg-maroon bg-white p-8 shadow-xl">
          <h1 className="font-serif text-xl font-bold text-fg-maroon">Event Capacity Settings</h1>
          <p className="mt-1 text-sm text-fg-ink/60">
            Controls how many registrations receive a Main Hall pass before switching to
            overflow seating.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-fg-ink/70">
                Main Hall Capacity
              </span>
              <input
                type="number"
                min={0}
                required
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="input mt-1.5"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full bg-fg-maroon py-3 text-sm font-semibold uppercase tracking-wider text-fg-cream hover:bg-fg-maroon-dark disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Capacity'}
            </button>
          </form>

          {saved && <p className="mt-4 text-sm font-medium text-green-700">Capacity updated.</p>}
        </div>
      </div>
    </div>
  )
}
