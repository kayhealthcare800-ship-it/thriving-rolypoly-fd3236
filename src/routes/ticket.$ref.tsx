import { useEffect, useRef, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import QRCode from 'qrcode'
import { toPng } from 'html-to-image'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { getRegistrationByRef } from '@/server/registrations.functions'

export const Route = createFileRoute('/ticket/$ref')({
  component: TicketPage,
  loader: async ({ params }) => {
    const registration = await getRegistrationByRef({ data: { ref: params.ref } })
    return { registration }
  },
})

function TicketPage() {
  const { registration } = Route.useLoaderData()
  const { ref } = Route.useParams()
  const cardRef = useRef<HTMLDivElement>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!registration) return
    const verifyUrl = `${window.location.origin}/ticket/${registration.ticketRef}`
    QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 220,
      color: { dark: '#4a3b1e', light: '#faf6ec' },
    }).then(setQrDataUrl)
  }, [registration])

  async function handleDownload() {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 })
      const link = document.createElement('a')
      link.download = `faithful-god-ticket-${ref}.png`
      link.href = dataUrl
      link.click()
    } finally {
      setDownloading(false)
    }
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-fg-cream">
        <Header />
        <div className="mx-auto max-w-lg px-5 py-24 text-center">
          <h1 className="font-serif text-2xl font-bold text-fg-maroon">Ticket Not Found</h1>
          <p className="mt-2 text-sm text-fg-ink/60">
            We couldn&apos;t find a registration for reference &ldquo;{ref}&rdquo;.
          </p>
          <Link
            to="/register"
            className="mt-6 inline-block rounded-full bg-fg-maroon px-6 py-3 text-sm font-semibold uppercase tracking-wide text-fg-cream"
          >
            Register Now
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const seatingLabel = registration.seating === 'hall_pass' ? 'Main Hall Pass' : 'Overflow Seating'

  return (
    <div className="min-h-screen bg-fg-cream">
      <Header />

      <div className="mx-auto max-w-xl px-5 py-14">
        <div className="mb-6 flex items-center justify-between rounded-xl border border-green-600/30 bg-green-50 px-5 py-3 text-sm text-green-800">
          <span>Registration confirmed &mdash; your seating pass is ready.</span>
        </div>

        <div
          ref={cardRef}
          className="overflow-hidden rounded-3xl bg-gradient-to-br from-fg-maroon to-fg-maroon-dark p-8 text-fg-cream shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-fg-gold/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-fg-gold-soft">
              Verified Pass
            </span>
            <span className="text-[10px] uppercase tracking-widest text-fg-cream/60">Event Pass</span>
          </div>

          <h1 className="mt-5 font-serif text-3xl font-bold">Faithful God</h1>
          <p className="text-sm text-fg-cream/70">Gratitude Concert 2026</p>

          <div className="mt-6 flex items-center gap-4">
            <img
              src={`/api/selfie/${registration.ticketRef}`}
              alt={`${registration.fullName} selfie`}
              className="h-20 w-20 rounded-full object-cover ring-2 ring-fg-gold"
            />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-fg-cream/50">Attendee</p>
              <p className="font-serif text-lg font-semibold">{registration.fullName}</p>
              <p className="text-xs text-fg-cream/60">Ref: {registration.ticketRef}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl bg-white/5 p-4">
            <div className="text-xs">
              <p className="uppercase tracking-widest text-fg-cream/50">Seating</p>
              <p className="mt-1 font-semibold">{seatingLabel}</p>
            </div>
            {qrDataUrl && (
              <img src={qrDataUrl} alt="Ticket QR code" className="h-20 w-20 rounded-lg bg-fg-cream p-1" />
            )}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-fg-cream/20 pt-4 text-[11px] text-fg-cream/60">
            <span>Amphitheatre, OAU &middot; Ile-Ife</span>
            <span>12 PM, Jul 17, 2026</span>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="mt-6 w-full rounded-full bg-fg-maroon py-3.5 text-sm font-semibold uppercase tracking-wider text-fg-cream transition hover:bg-fg-maroon-dark disabled:opacity-50"
        >
          {downloading ? 'Preparing…' : 'Download Ticket'}
        </button>

        <p className="mt-6 text-center text-xs text-fg-ink/50">
          Keep this pass safe. Present the QR code at the gate for check-in.
        </p>
      </div>

      <Footer />
    </div>
  )
}
