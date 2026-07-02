export function Footer() {
  return (
    <footer className="border-t border-fg-gold/20 bg-fg-cream py-10 text-center">
      <p className="font-serif text-lg text-fg-ink">
        <span className="font-semibold">FAITHFUL</span>{' '}
        <span className="text-fg-gold font-semibold">GOD</span>
      </p>
      <p className="mt-2 text-sm text-fg-ink/70">
        Featuring BBO &middot; Tobi Olorunsola &middot; Soji Adeleke &middot; Toluwani Sing
      </p>
      <p className="mt-4 text-xs text-fg-ink/50">
        &copy; {new Date().getFullYear()} Faithful God Concert. All rights reserved.
      </p>
    </footer>
  )
}
