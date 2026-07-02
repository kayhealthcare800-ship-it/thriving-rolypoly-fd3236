interface InitialsAvatarProps {
  initials: string
  className?: string
}

/**
 * Tasteful placeholder avatar for ministers/guests — a gold gradient circle
 * with initials. We intentionally never fabricate photos of real people.
 */
export function InitialsAvatar({ initials, className = '' }: InitialsAvatarProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-full font-serif font-bold text-fg-maroon-dark ${className}`}
      style={{
        background: 'linear-gradient(135deg, #e9cf8f 0%, #c9a24b 55%, #a97f34 100%)',
        boxShadow: 'inset 0 0 0 3px rgba(255,255,255,0.35)',
      }}
    >
      {initials}
    </div>
  )
}
