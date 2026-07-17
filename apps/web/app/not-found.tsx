import Link from 'next/link'

const PLUM = '#2a1e4a'
const PURPLE = '#5b3d8c'
const PERI = '#7c9fd6'
const LILAC = '#f6f3fb'

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: LILAC }}
    >
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{ width: 72, height: 72, background: `linear-gradient(140deg, ${PURPLE}, ${PERI})` }}
        aria-hidden="true"
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
          <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
        </svg>
      </div>
      <h1
        className="mt-8 text-4xl sm:text-5xl font-semibold"
        style={{ color: PLUM, fontFamily: "'Fraunces', 'Georgia', serif" }}
      >
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed" style={{ color: '#6b6280' }}>
        We couldn&apos;t find the page you were looking for. Let&apos;s get you back to the
        PMHNP Mastery Academy.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-xl px-6 py-3 text-[15px] font-semibold transition-opacity hover:opacity-90"
        style={{ backgroundColor: PURPLE, color: '#FFFFFF' }}
      >
        Back to home
      </Link>
    </div>
  )
}
