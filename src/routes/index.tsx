import { Link, createFileRoute } from '@tanstack/react-router'
import { InitialsAvatar } from '@/components/InitialsAvatar'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const ministers = [
  { initials: 'BBO', name: 'BBO' },
  { initials: 'TO', name: 'Tobi Olorunsola' },
  { initials: 'SA', name: 'Soji Adeleke' },
  { initials: 'TS', name: 'Toluwani Sing' },
]

function HomePage() {
  return (
    <div className="min-h-screen bg-fg-cream text-fg-ink">
      <Header />
      <HeroSection />
      <InfoStrip />
      <ConcertInfo />
      <FeaturedMinisters />
      <EnquiryBanner />
      <Footer />
    </div>
  )
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Watermark background evoking the OAU amphitheatre */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(120deg, var(--fg-ink) 0px, var(--fg-ink) 2px, transparent 2px, transparent 26px)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-10 hidden select-none font-serif text-[13rem] font-bold text-fg-ink/[0.04] md:block"
      >
        OAU
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fg-gold">
            Coming to OAU Campus!
          </p>
          <h1 className="mt-4 font-serif text-6xl font-bold leading-[0.95] text-fg-ink sm:text-7xl">
            FAITHFUL
            <br />
            <span className="text-fg-ink">GOD</span>
          </h1>
          <p className="font-script mt-4 text-2xl text-fg-maroon">
            &hellip;a gratitude atmosphere
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link
              to="/register"
              className="rounded-full bg-fg-maroon px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-fg-cream shadow-lg shadow-fg-maroon/20 transition hover:bg-fg-maroon-dark"
            >
              Register Now
            </Link>
            <Link
              to="/retrieve"
              className="text-sm font-semibold uppercase tracking-wide text-fg-ink underline decoration-fg-gold decoration-2 underline-offset-4 hover:text-fg-maroon"
            >
              Already Registered? Retrieve Pass
            </Link>
          </div>

          <p className="mt-10 text-xs uppercase tracking-[0.3em] text-fg-ink/50">
            Obafemi Awolowo University
          </p>
        </div>

        {/* Staggered polaroid minister cards */}
        <div className="relative mx-auto grid h-[420px] w-full max-w-md grid-cols-2 gap-6 sm:h-[460px]">
          {ministers.map((m, i) => (
            <div
              key={m.name}
              className="rounded-md bg-white p-3 pb-5 shadow-xl"
              style={{
                transform: `rotate(${[-6, 4, -3, 6][i]}deg) translateY(${[0, 28, 40, 8][i]}px)`,
              }}
            >
              <InitialsAvatar
                initials={m.initials}
                className="aspect-square w-full text-4xl"
              />
              <p className="mt-3 text-center text-[10px] font-semibold uppercase tracking-widest text-fg-gold">
                Minister
              </p>
              <p className="text-center font-serif text-sm font-semibold text-fg-maroon">
                {m.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function InfoStrip() {
  return (
    <section className="bg-fg-maroon-dark py-6 text-fg-cream">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-5 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="text-xs uppercase tracking-widest text-fg-gold">Date &amp; Time</p>
          <p className="font-serif text-lg">12 PM &middot; July 17th, 2026</p>
          <p className="text-sm text-fg-cream/70">
            Host: Pst (Dr.) &amp; Dcns. Idowu Olowoyo
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-fg-gold">Venue</p>
          <p className="font-serif text-lg">Amphitheatre, OAU</p>
          <p className="text-sm text-fg-cream/70">Ile-Ife, Nigeria</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-fg-gold">Enquiries</p>
          <p className="text-sm text-fg-cream/70">0803 000 0000</p>
          <p className="text-sm text-fg-cream/70">0806 000 0000</p>
        </div>
      </div>
    </section>
  )
}

function ConcertInfo() {
  const cards = [
    {
      icon: VenueIcon,
      title: 'Venue',
      body: 'Amphitheatre, Obafemi Awolowo University, Ile-Ife, Nigeria.',
    },
    {
      icon: ClockIcon,
      title: 'Date & Time',
      body: '12 PM, Friday July 17th, 2026. Gates open early — seating is limited.',
    },
    {
      icon: HostIcon,
      title: 'Hosts',
      body: 'Pst (Dr.) & Dcns. Idowu Olowoyo, welcoming ministers and guests.',
    },
  ]

  return (
    <section className="mx-auto max-w-7xl px-5 py-20">
      <div className="text-center">
        <h2 className="font-serif text-3xl font-bold text-fg-maroon sm:text-4xl">
          Concert Info
        </h2>
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="h-px w-12 bg-fg-gold" />
          <span className="h-1.5 w-1.5 rounded-full bg-fg-gold" />
          <span className="h-px w-12 bg-fg-gold" />
        </div>
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.title} className="rounded-2xl border border-fg-gold/20 bg-white/60 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-fg-maroon/10 text-fg-maroon">
              <c.icon />
            </div>
            <h3 className="mt-5 font-serif text-xl font-semibold text-fg-maroon">{c.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-fg-ink/70">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function FeaturedMinisters() {
  return (
    <section className="bg-white/50 py-20">
      <div className="mx-auto max-w-7xl px-5">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-fg-maroon sm:text-4xl">
            Featured Ministers
          </h2>
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-fg-gold" />
            <span className="h-1.5 w-1.5 rounded-full bg-fg-gold" />
            <span className="h-px w-12 bg-fg-gold" />
          </div>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {ministers.map((m) => (
            <div key={m.name} className="text-center">
              <InitialsAvatar initials={m.initials} className="mx-auto aspect-square w-40 text-3xl shadow-md" />
              <p className="mt-4 font-serif text-lg font-semibold text-fg-maroon">{m.name}</p>
              <p className="text-xs font-semibold uppercase tracking-widest text-fg-gold">
                Guest Minister
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function EnquiryBanner() {
  return (
    <section className="bg-fg-maroon py-16 text-center text-fg-cream">
      <h2 className="font-serif text-2xl font-bold sm:text-3xl">For More Enquiries</h2>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <a
          href="tel:+2348030000000"
          className="rounded-full border-2 border-dashed border-fg-gold px-8 py-3 text-sm font-semibold tracking-wide"
        >
          0803 000 0000
        </a>
        <a
          href="tel:+2348060000000"
          className="rounded-full border-2 border-dashed border-fg-gold px-8 py-3 text-sm font-semibold tracking-wide"
        >
          0806 000 0000
        </a>
      </div>
    </section>
  )
}

function VenueIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  )
}
function HostIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
    </svg>
  )
}
