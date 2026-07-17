'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { getUriWithOrg } from '@services/config/config'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useSttJourney } from '@/hooks/useSttJourney'
import { getMyOnboarding } from '@services/onboarding/onboarding'
import { Leaf, Heart, Star, Sun, Moon, ChevronRight } from 'lucide-react'

interface LandingClassicProps {
  orgslug: string
}

const NAVY = '#1F3251'
const GOLD = '#E3A63B'
const MUTED = '#8B887D'
const BODY = '#5C5A52'

function getDaypart(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 18) return 'afternoon'
  return 'evening'
}

/* Decorative crescent moon + stars for the night-sky hero card */
function HeroMoon() {
  return (
    <svg
      width="150"
      height="120"
      viewBox="0 0 150 120"
      fill="none"
      className="absolute top-4 right-5 pointer-events-none"
      aria-hidden="true"
    >
      <path
        d="M116 18c-14.5 3.5-25 16.6-25 32 0 18.2 14.8 33 33 33 4.6 0 9-1 13-2.7C131.6 92.8 118.4 102 103 102 82 102 65 85 65 64s17-38 38-38c4.5 0 8.9.8 13 2z"
        fill="#F0C97B"
      />
      <circle cx="34" cy="14" r="1.6" fill="#F5EDD8" opacity="0.9" />
      <circle cx="70" cy="8" r="1.1" fill="#F5EDD8" opacity="0.7" />
      <circle cx="14" cy="46" r="1.2" fill="#F5EDD8" opacity="0.6" />
      <circle cx="52" cy="34" r="1" fill="#F5EDD8" opacity="0.8" />
      <circle cx="140" cy="10" r="1.4" fill="#F5EDD8" opacity="0.8" />
      <circle cx="128" cy="44" r="1" fill="#F5EDD8" opacity="0.5" />
      <path d="M45 18l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1 1-2.4z" fill="#F5EDD8" opacity="0.85" />
    </svg>
  )
}

/* Soft hills at the bottom of the hero card */
function HeroHills() {
  return (
    <svg
      viewBox="0 0 600 90"
      preserveAspectRatio="none"
      className="absolute bottom-0 left-0 w-full h-16 pointer-events-none opacity-40"
      aria-hidden="true"
    >
      <path d="M0 60C120 20 220 30 320 55c100 25 200 20 280-15v50H0V60z" fill="#2C4066" />
      <path d="M0 75c150-30 300-20 450 5 60 10 110 8 150 0v10H0V75z" fill="#16233D" />
    </svg>
  )
}

/* Circular progress ring, gold arc */
function ProgressRing({ percent }: { percent: number }) {
  const r = 52
  const c = 2 * Math.PI * r
  const filled = (percent / 100) * c
  return (
    <svg width="130" height="130" viewBox="0 0 130 130" aria-hidden="true">
      <circle cx="65" cy="65" r={r} fill="none" stroke="#F0EADA" strokeWidth="9" />
      <circle
        cx="65"
        cy="65"
        r={r}
        fill="none"
        stroke={GOLD}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${c - filled}`}
        transform="rotate(-125 65 65)"
      />
      <text
        x="65"
        y="72"
        textAnchor="middle"
        fontSize="26"
        fontWeight="600"
        fill={NAVY}
        fontFamily="var(--font-stt-serif), Georgia, serif"
      >
        {percent}%
      </text>
    </svg>
  )
}

function LandingClassic({ orgslug }: LandingClassicProps) {
  const session = useLHSession() as any
  const firstName =
    session?.data?.user?.first_name || session?.data?.user?.username || 'there'
  const accessToken = session?.data?.tokens?.access_token

  // First visit: send new members through the welcome quiz once
  useEffect(() => {
    if (!accessToken) return
    getMyOnboarding(accessToken)
      .then((res: any) => {
        if (res?.status === 200 && res?.data && !res.data.completed) {
          window.location.replace(getUriWithOrg(orgslug, '/welcome'))
        }
      })
      .catch(() => {})
  }, [accessToken])

  const daypart = getDaypart()
  const greeting =
    daypart === 'morning'
      ? 'Good morning'
      : daypart === 'afternoon'
      ? 'Good afternoon'
      : 'Good evening'
  const daypartLabel = daypart.charAt(0).toUpperCase() + daypart.slice(1)

  const journey = useSttJourney(orgslug)
  const next = journey.nextSession
  const allDone = journey.totalSessions > 0 && !next

  const continueHref = next ? next.href : getUriWithOrg(orgslug, '/courses')
  const heroKicker = allDone
    ? 'Path complete'
    : next && next.percent > 0
    ? 'Continue'
    : 'Start here'
  const heroLabel = allDone
    ? ''
    : next
    ? next.index === 0
      ? 'Your first step:'
      : `Session ${next.index}:`
    : ''
  const heroTitle = allDone
    ? 'You completed the path'
    : next?.course?.name || 'Your Sleep to Thrive path'
  const heroButton = allDone
    ? 'Revisit the course'
    : next && next.percent > 0
    ? 'Continue session'
    : journey.sessionsCompleted > 0
    ? 'Start next session'
    : 'Begin your journey'
  const heroPercent = next ? next.percent : allDone ? 100 : 0
  const heroCaption = allDone
    ? 'Every session complete. Rest well.'
    : heroPercent > 0
    ? `${heroPercent}% complete`
    : 'Not started yet'

  const stats = [
    {
      value: String(journey.dayStreak),
      label: 'Day streak',
      sub: journey.dayStreak > 0 ? 'Keep it going' : 'Complete a section to begin',
      icon: Leaf,
      circle: '#EAF0E6',
      color: '#8FA98F',
    },
    {
      value: String(journey.practicesCompleted),
      label: 'Sections completed',
      sub: journey.practicesCompleted > 0 ? 'Across your sessions' : 'Your journey starts here',
      icon: Heart,
      circle: '#F8E9E4',
      color: '#D89A8E',
    },
    {
      value: String(journey.badgesEarned),
      label: 'Badges earned',
      sub: journey.badgesEarned > 0 ? 'Keep growing' : 'First one is waiting',
      icon: Star,
      circle: '#F7EFDD',
      color: GOLD,
    },
  ]

  return (
    <div className="px-6 sm:px-10 py-8 sm:py-10 max-w-6xl mx-auto">
      {/* Top row: greeting + daypart pill */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1
            className="stt-serif text-3xl sm:text-4xl font-semibold flex items-center gap-3"
            style={{ color: NAVY }}
          >
            {greeting}, {firstName}
            {daypart === 'evening' ? (
              <Moon size={24} style={{ color: GOLD }} fill={GOLD} strokeWidth={0} />
            ) : (
              <Sun size={24} style={{ color: GOLD }} />
            )}
          </h1>
          <p className="mt-2 text-[15px]" style={{ color: MUTED }}>
            You&apos;re showing up for yourself. That&apos;s powerful.
          </p>
        </div>
        <div
          className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[13px] font-medium shrink-0 mt-1"
          style={{ backgroundColor: '#F7F2E7', border: '1px solid #EDE7DA', color: BODY }}
        >
          <Sun size={14} style={{ color: GOLD }} />
          {daypartLabel}
        </div>
      </div>

      {/* Hero + progress ring */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
        {/* Night-sky hero card */}
        <div
          className="relative overflow-hidden rounded-2xl p-7 sm:p-8"
          style={{ background: 'linear-gradient(150deg, #22355C 0%, #1A2A4A 100%)' }}
        >
          <HeroMoon />
          <HeroHills />
          <div className="relative" style={{ maxWidth: '70%' }}>
            <p
              className="text-[12px] font-semibold tracking-widest uppercase mb-3"
              style={{ color: '#C9D3E4' }}
            >
              {heroKicker}
            </p>
            {heroLabel && (
              <p className="stt-serif text-xl text-white/90 font-medium">{heroLabel}</p>
            )}
            <h2 className="stt-serif text-3xl sm:text-4xl font-semibold mb-6" style={{ color: '#FFFFFF' }}>
              {heroTitle}
            </h2>
            <div className="w-full max-w-xs h-1.5 rounded-full bg-white/15 mb-2">
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${heroPercent}%`, backgroundColor: GOLD }}
              />
            </div>
            <p className="text-[13px] text-white/70 mb-6">{heroCaption}</p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={continueHref}
                className="inline-flex items-center px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors"
                style={{ backgroundColor: GOLD, color: '#3B2F13' }}
              >
                {heroButton}
              </Link>
              <Link
                href={getUriWithOrg(orgslug, '/courses')}
                className="inline-flex items-center gap-1.5 text-[14px] font-medium text-white/85 hover:text-white transition-colors"
              >
                View all sessions <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Overall progress card */}
        <div
          className="rounded-2xl bg-white p-6 flex flex-col items-center text-center"
          style={{ border: '1px solid #EDE7DA', boxShadow: '0 1px 3px rgba(31,50,81,0.05)' }}
        >
          <ProgressRing percent={journey.overallPercent} />
          <p className="mt-3 text-[15px] font-semibold" style={{ color: NAVY }}>
            Overall progress
          </p>
          <p className="mt-1 text-[13px]" style={{ color: MUTED }}>
            {journey.sessionsCompleted} of {journey.totalSessions || 6} sessions complete
          </p>
          <Link
            href={getUriWithOrg(orgslug, '/progress')}
            className="mt-4 inline-flex items-center gap-1 text-[13.5px] font-medium transition-colors"
            style={{ color: BODY }}
          >
            View progress <ChevronRight size={15} />
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-5">
        {stats.map(({ value, label, sub, icon: Icon, circle, color }) => (
          <div
            key={label}
            className="rounded-2xl bg-white p-5 flex items-center gap-4"
            style={{ border: '1px solid #EDE7DA', boxShadow: '0 1px 3px rgba(31,50,81,0.05)' }}
          >
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: circle }}
            >
              <Icon size={20} style={{ color }} />
            </div>
            <div>
              <p className="stt-serif text-2xl font-semibold leading-none" style={{ color: NAVY }}>
                {value}
              </p>
              <p className="text-[13.5px] font-medium mt-1" style={{ color: BODY }}>
                {label}
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: MUTED }}>
                {sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LandingClassic
