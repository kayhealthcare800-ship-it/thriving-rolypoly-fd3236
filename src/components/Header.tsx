import { Link } from '@tanstack/react-router'

export function Header() {
  return (
    <header className="relative z-20 bg-fg-cream/95 backdrop-blur border-b border-fg-gold/20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full font-serif text-lg font-bold text-fg-cream"
            style={{ background: 'radial-gradient(circle at 30% 30%, #e4c98a, #a97f34)' }}
          >
            M
          </span>
          <span className="font-serif text-xl tracking-wide">
            <span className="text-fg-ink font-semibold">FAITHFUL</span>{' '}
            <span className="text-fg-gold font-semibold">GOD</span>
          </span>
        </Link>

        <span className="hidden items-center gap-2 rounded-full border border-fg-gold/50 bg-fg-cream px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-fg-maroon sm:inline-flex">
          <span className="h-2 w-2 rounded-full bg-green-600" />
          Registration Open
        </span>
      </div>
    </header>
  )
}
