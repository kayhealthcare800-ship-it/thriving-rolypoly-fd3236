import { useMemo, useState } from 'react'
import { createFileRoute, redirect, Link, useRouter } from '@tanstack/react-router'
import { getCurrentAdmin } from '@/server/admin-auth.functions'
import {
  getAdminDashboardData,
  toggleCheckedIn,
  deleteRegistrations,
} from '@/server/registrations.functions'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
  loader: async () => {
    const admin = await getCurrentAdmin()
    if (!admin) throw redirect({ to: '/admin/login' })
    const data = await getAdminDashboardData()
    return { admin, data }
  },
})

type Registration = Awaited<ReturnType<typeof getAdminDashboardData>>['registrations'][number]

function AdminDashboard() {
  const { admin, data } = Route.useLoaderData()
  const router = useRouter()

  const [search, setSearch] = useState('')
  const [seatingFilter, setSeatingFilter] = useState<'all' | 'hall_pass' | 'overflow'>('all')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [viewing, setViewing] = useState<Registration | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return data.registrations.filter((r: Registration) => {
      const matchesSearch =
        !q ||
        r.fullName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.ticketRef.toLowerCase().includes(q)
      const matchesSeating = seatingFilter === 'all' || r.seating === seatingFilter
      return matchesSearch && matchesSeating
    })
  }, [data.registrations, search, seatingFilter])

  async function refresh() {
    await router.invalidate()
  }

  async function handleToggle(reg: Registration) {
    setBusyId(reg.id)
    try {
      await toggleCheckedIn({ data: { id: reg.id, checkedIn: !reg.checkedIn } })
      await refresh()
    } finally {
      setBusyId(null)
    }
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return
    if (!confirm(`Delete ${selected.size} registration(s)? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await deleteRegistrations({ data: { ids: Array.from(selected) } })
      setSelected(new Set())
      await refresh()
    } finally {
      setDeleting(false)
    }
  }

  function toggleSelected(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-fg-cream">
      <TopBar adminEmail={admin.email} />

      <div className="mx-auto max-w-7xl px-5 py-8">
        <StatsGrid stats={data.stats} capacity={data.capacity} />

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or ticket ref…"
              className="input sm:max-w-sm"
            />
            <select
              value={seatingFilter}
              onChange={(e) => setSeatingFilter(e.target.value as typeof seatingFilter)}
              className="input sm:max-w-xs"
            >
              <option value="all">All Seating Types</option>
              <option value="hall_pass">Hall Pass</option>
              <option value="overflow">Overflow</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/capacity"
              className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-fg-maroon hover:underline"
            >
              Capacity Settings
            </Link>
            {selected.size > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={deleting}
                className="whitespace-nowrap rounded-full bg-red-700 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-red-800 disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : `Delete Selected (${selected.size})`}
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-fg-gold/20 bg-white shadow-sm">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="bg-fg-ink text-fg-cream">
                <th className="w-10 px-4 py-3" />
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Ref</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Full Name</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Institution</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Seating</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Date Registered</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Attendance</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r: Registration, i: number) => (
                <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-fg-cream/60'}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={() => toggleSelected(r.id)}
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{r.ticketRef}</td>
                  <td className="px-4 py-3 font-medium">{r.fullName}</td>
                  <td className="px-4 py-3 text-fg-gold underline decoration-fg-gold/40">
                    {r.institution}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                        r.seating === 'hall_pass'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {r.seating === 'hall_pass' ? 'Hall Pass' : 'Overflow'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-fg-ink/60">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(r)}
                      disabled={busyId === r.id}
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition disabled:opacity-50 ${
                        r.checkedIn
                          ? 'border-green-700 bg-green-700 text-white'
                          : 'border-fg-maroon text-fg-maroon hover:bg-fg-maroon hover:text-white'
                      }`}
                    >
                      {r.checkedIn ? 'Present' : 'Mark Present'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setViewing(r)}
                      className="rounded-full border border-fg-ink/30 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-fg-ink hover:bg-fg-ink hover:text-white"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-fg-ink/50">
                    No registrations match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewing && <RegistrationModal registration={viewing} onClose={() => setViewing(null)} />}
    </div>
  )
}

function TopBar({ adminEmail }: { adminEmail: string }) {
  return (
    <div className="border-b border-fg-gold/20 bg-fg-cream px-6 py-4">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <p className="font-serif text-lg">
          <span className="font-semibold text-fg-ink">FAITHFUL</span>{' '}
          <span className="font-semibold text-fg-gold">GOD</span>
        </p>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fg-ink/50">
          Super Admin Console
        </p>
        <div className="flex items-center gap-4">
          <span className="text-xs text-fg-ink/60">{adminEmail}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-green-800">
            <span className="h-1.5 w-1.5 rounded-full bg-green-600" /> Live
          </span>
          <a
            href="/admin/logout"
            className="rounded-full border border-fg-maroon px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-fg-maroon hover:bg-fg-maroon hover:text-white"
          >
            Logout
          </a>
        </div>
      </div>
    </div>
  )
}

function StatsGrid({
  stats,
  capacity,
}: {
  stats: {
    total: number
    hallPassCount: number
    overflowCount: number
    checkedInCount: number
    hallFillPct: number
    checkinRatePct: number
  }
  capacity: number
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Registrations" value={stats.total} accent="from-fg-gold to-fg-gold-soft" />
      <StatCard
        label="Main Hall Seating"
        value={stats.hallPassCount}
        accent="from-green-500 to-green-300"
      >
        <ProgressBar pct={stats.hallFillPct} />
        <p className="mt-1 text-[11px] text-fg-ink/50">
          Capacity Limit: {capacity.toLocaleString()} &middot; {stats.hallFillPct}% filled
        </p>
      </StatCard>
      <StatCard label="Overflow Seating" value={stats.overflowCount} accent="from-amber-500 to-amber-300" />
      <StatCard
        label="Checked-in / Attended"
        value={stats.checkedInCount}
        accent="from-fg-maroon to-fg-gold"
      >
        <ProgressBar pct={stats.checkinRatePct} />
        <p className="mt-1 text-[11px] text-fg-ink/50">{stats.checkinRatePct}% check-in rate</p>
      </StatCard>
    </div>
  )
}

function StatCard({
  label,
  value,
  accent,
  children,
}: {
  label: string
  value: number
  accent: string
  children?: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
      <div className={`h-1.5 w-full bg-gradient-to-r ${accent}`} />
      <div className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-fg-ink/50">{label}</p>
        <p className="mt-1 font-serif text-3xl font-bold text-fg-ink">{value.toLocaleString()}</p>
        {children}
      </div>
    </div>
  )
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-fg-ink/10">
      <div
        className="h-full rounded-full bg-fg-maroon transition-all"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </div>
  )
}

function RegistrationModal({
  registration,
  onClose,
}: {
  registration: Registration
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <h2 className="font-serif text-lg font-bold text-fg-maroon">Registration Details</h2>
          <button onClick={onClose} className="text-fg-ink/50 hover:text-fg-ink" aria-label="Close">
            ✕
          </button>
        </div>

        <img
          src={`/api/selfie/${registration.selfieKey}`}
          alt={`${registration.fullName} selfie`}
          className="mx-auto mt-4 h-32 w-32 rounded-full object-cover ring-2 ring-fg-gold"
        />

        <dl className="mt-5 space-y-3 text-sm">
          <Row label="Full Name" value={registration.fullName} />
          <Row label="Email" value={registration.email} />
          <Row label="Phone" value={registration.phone} />
          <Row label="Institution" value={registration.institution} />
          <Row label="Ticket Ref" value={registration.ticketRef} />
          <Row label="Seating" value={registration.seating === 'hall_pass' ? 'Hall Pass' : 'Overflow'} />
          <Row
            label="Registered"
            value={registration.createdAt ? new Date(registration.createdAt).toLocaleString() : '—'}
          />
          <Row label="Checked In" value={registration.checkedIn ? 'Yes' : 'No'} />
        </dl>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-fg-ink/10 pb-2">
      <dt className="text-fg-ink/50">{label}</dt>
      <dd className="font-medium text-fg-ink">{value}</dd>
    </div>
  )
}
