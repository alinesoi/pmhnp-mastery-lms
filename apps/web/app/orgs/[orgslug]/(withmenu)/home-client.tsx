'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { getUriWithOrg } from '@services/config/config'
import { getAllProgress, ProgressSummary, AllProgressResponse } from '@services/progress/progress'
import { ArrowRight, Bot, Award, Waypoints, LayoutGrid, Sparkles } from 'lucide-react'
import {
  SERIF, PLUM, PLUM_DEEP, PURPLE, PERI, MAGENTA, GOLD, LILAC, CARD_BORDER, INK, MUTED,
  CATALOG, CATALOG as CAT, catalogBySlug, courseBySlug, moduleByIndex, TAGLINE, TILE,
} from './_pmhnp/theme'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

// CE Contact Hours ring (warm gold — the credible accreditation accent).
function ProgressRing({ percent, size = 96 }: { percent: number; size?: number }) {
  const stroke = 9
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const off = c - (Math.max(0, Math.min(100, percent)) / 100) * c
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#efe7d6" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={GOLD} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
        style={{ ...SERIF }} fontSize="19" fontWeight={700} fill={PLUM}>
        {Math.round(percent)}%
      </text>
    </svg>
  )
}

export default function HomeClient({ orgslug }: { orgslug: string }) {
  const session = useLHSession() as any
  const firstName: string = session?.data?.user?.first_name || ''
  const accessToken = session?.data?.tokens?.access_token
  const [all, setAll] = useState<AllProgressResponse | null>(null)

  useEffect(() => {
    if (!accessToken) return
    getAllProgress(accessToken).then((res: any) => {
      if (res?.status === 200 && res?.data) setAll(res.data)
    }).catch(() => {})
  }, [accessToken])

  const summaries: ProgressSummary[] = all?.courses ?? []
  const byCourse = new Map(summaries.map((s) => [s.course_slug, s]))
  const ceEarned = all?.ce_earned_total ?? 0
  const ceAvailable = all?.ce_available_total ?? CATALOG.reduce((a, c) => a + c.ce_total, 0)
  const cePercent = ceAvailable > 0 ? (ceEarned / ceAvailable) * 100 : 0

  // Next-up: the flagship DAB if unstarted, else the first course with a next module.
  const flagship = catalogBySlug('diagnostic-accuracy-blueprint')!
  const nextUpCourse =
    summaries.find((s) => s.next_module !== null && s.passed_count > 0) ||
    byCourse.get(flagship.slug) ||
    null
  const nextSlug = nextUpCourse?.course_slug || flagship.slug
  const nextIndex = nextUpCourse?.next_module ?? 1
  const nextMod = moduleByIndex(nextSlug, nextIndex) || courseBySlug(nextSlug)?.modules[0]
  const nextCatalog = catalogBySlug(nextSlug) || flagship
  const started = (nextUpCourse?.passed_count ?? 0) > 0
  const continueHref = getUriWithOrg(orgslug, `/module/${nextSlug}/${nextMod?.index ?? 1}`)

  return (
    <div className="min-h-[calc(100vh-56px)]" style={{ backgroundColor: LILAC }}>
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-10">
        {/* Greeting */}
        <p className="text-sm font-medium" style={{ color: PURPLE }}>
          {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="pmhnp-serif mt-1 text-3xl sm:text-4xl leading-tight font-semibold" style={{ ...SERIF, color: PLUM }}>
          {greeting()}{firstName ? `, ${firstName}` : ''}.
        </h1>
        <p className="pmhnp-serif mt-2 text-lg italic" style={{ ...SERIF, color: MAGENTA }}>
          {TAGLINE}
        </p>

        {/* Continue + CE ring */}
        <div className="mt-7 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">
          <Link href={continueHref}
            className="block bg-white shadow-sm transition-all hover:shadow-md"
            style={{ border: `1px solid ${CARD_BORDER}`, borderRadius: 18 }}>
            <div className="flex items-stretch">
              <div className="w-2 rounded-l-[18px]" style={{ backgroundColor: PURPLE }} />
              <div className="flex-1 px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: PURPLE }}>
                  {started ? 'Continue where you left off' : 'Start with the flagship'} &middot; {nextCatalog.code}
                </p>
                <p className="pmhnp-serif mt-1.5 text-lg font-semibold" style={{ ...SERIF, color: PLUM }}>
                  {nextMod?.title || 'Introduction'}
                </p>
                <p className="mt-1 text-sm" style={{ color: INK }}>
                  {nextMod?.chapters.length ?? 0} lessons, then a knowledge check to unlock the next module.
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: PURPLE }}>
                  {started ? 'Resume module' : 'Begin module'} <ArrowRight size={15} />
                </span>
              </div>
            </div>
          </Link>

          <div className="bg-white px-6 py-5 shadow-sm flex items-center gap-5"
            style={{ border: `1px solid ${CARD_BORDER}`, borderRadius: 18 }}>
            <ProgressRing percent={cePercent} />
            <div>
              <p className="text-sm font-semibold" style={{ color: PLUM }}>CE Contact Hours</p>
              <p className="mt-0.5 text-[13px]" style={{ color: MUTED }}>
                across all three courses
              </p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold"
                style={{ backgroundColor: TILE.gold.bg, color: TILE.gold.fg }}>
                <Award size={13} /> {ceEarned} / {ceAvailable} hrs
              </span>
            </div>
          </div>
        </div>

        {/* Your courses — next-up list (LuAnn's chosen home layout) */}
        <div className="mt-9 flex items-center justify-between">
          <h2 className="pmhnp-serif text-lg font-semibold" style={{ ...SERIF, color: PLUM }}>Your courses</h2>
          <Link href={getUriWithOrg(orgslug, '/courses')} className="text-sm font-medium inline-flex items-center gap-1" style={{ color: PURPLE }}>
            Course catalog <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {CAT.map((cat) => {
            const s = byCourse.get(cat.slug)
            const pct = s?.percent_complete ?? 0
            const tile = TILE[cat.color]
            return (
              <Link key={cat.slug} href={getUriWithOrg(orgslug, `/course/${cat.slug}`)}
                className="block bg-white shadow-sm transition-all hover:shadow-md px-5 py-4"
                style={{ border: `1px solid ${CARD_BORDER}`, borderRadius: 16 }}>
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-11 h-11 rounded-2xl shrink-0 font-bold text-[13px]"
                    style={{ backgroundColor: tile.bg, color: tile.fg, ...SERIF }}>
                    {cat.code === 'E.D.I.T.' ? 'EDIT' : cat.code}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="pmhnp-serif text-[15px] font-semibold truncate" style={{ ...SERIF, color: PLUM }}>
                      {courseBySlug(cat.slug)?.title}
                    </p>
                    <div className="mt-2 w-full h-1.5 rounded-full" style={{ backgroundColor: '#ece7f5' }}>
                      <div className="h-1.5 rounded-full" style={{ backgroundColor: tile.fg, width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="text-[13px] font-semibold shrink-0" style={{ color: MUTED }}>{pct}%</span>
                  <ArrowRight size={16} style={{ color: MUTED }} className="shrink-0" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Quick actions */}
        <div className="mt-9 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Course Catalog', hint: 'DAB, TAB, and the E.D.I.T. mini course', href: '/courses', icon: LayoutGrid },
            { label: 'AI Tutor', hint: 'Reason through CLARITY, Treatment Accuracy, E.D.I.T.', href: '/tutor', icon: Bot },
            { label: 'Progress & Certificate', hint: 'Training record and CE contact-hour tracker', href: '/progress', icon: Award },
          ].map((a) => {
            const Icon = a.icon
            return (
              <Link key={a.label} href={getUriWithOrg(orgslug, a.href)}
                className="bg-white p-5 shadow-sm transition-all hover:shadow-md flex items-start gap-3"
                style={{ border: `1px solid ${CARD_BORDER}`, borderRadius: 16 }}>
                <div className="flex items-center justify-center w-10 h-10 rounded-full shrink-0" style={{ backgroundColor: '#ece3f8' }}>
                  <Icon size={18} style={{ color: PURPLE }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: PLUM }}>{a.label}</p>
                  <p className="mt-0.5 text-[12.5px] leading-snug" style={{ color: MUTED }}>{a.hint}</p>
                </div>
              </Link>
            )
          })}
        </div>

        <p className="mt-8 text-xs inline-flex items-center gap-1.5" style={{ color: MUTED }}>
          <Sparkles size={12} style={{ color: MAGENTA }} />
          Evidence-tier, in-scope. Your clinical judgement stays yours.
        </p>
      </div>
    </div>
  )
}
