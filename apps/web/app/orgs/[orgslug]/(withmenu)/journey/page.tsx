'use client'
import React, { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { getUriWithOrg } from '@services/config/config'
import { getAllProgress, ProgressSummary, AllProgressResponse } from '@services/progress/progress'
import { ArrowRight, Check, Lock, Waypoints, Award } from 'lucide-react'
import {
  SERIF, PLUM, PURPLE, MAGENTA, GOLD, LILAC, CARD_BORDER, INK, MUTED,
  CATALOG, courseBySlug, TILE,
} from '../_pmhnp/theme'

export default function JourneyPage(props: { params: Promise<{ orgslug: string }> }) {
  const params = use(props.params)
  const orgslug = params.orgslug
  const session = useLHSession() as any
  const accessToken = session?.data?.tokens?.access_token
  const [all, setAll] = useState<AllProgressResponse | null>(null)

  useEffect(() => {
    if (!accessToken) return
    getAllProgress(accessToken).then((res: any) => {
      if (res?.status === 200 && res?.data) setAll(res.data)
    }).catch(() => {})
  }, [accessToken])

  const byCourse = new Map((all?.courses ?? []).map((s) => [s.course_slug, s]))

  return (
    <div className="min-h-[calc(100vh-56px)]" style={{ backgroundColor: LILAC }}>
      <div className="max-w-3xl mx-auto px-6 sm:px-10 py-10">
        <p className="text-sm font-medium inline-flex items-center gap-1.5" style={{ color: PURPLE }}>
          <Waypoints size={15} /> My Learning
        </p>
        <h1 className="pmhnp-serif mt-1 text-3xl sm:text-4xl leading-tight font-semibold" style={{ ...SERIF, color: PLUM }}>
          Your path through the Academy
        </h1>
        <p className="mt-3 text-base max-w-2xl" style={{ color: INK }}>
          Three courses, each a sequence of modules. Pass a module&rsquo;s knowledge check and the next
          one unlocks. Your CE contact hours accrue as you go.
        </p>

        <div className="mt-9 space-y-7">
          {CATALOG.map((cat) => {
            const course = courseBySlug(cat.slug)!
            const s: ProgressSummary | undefined = byCourse.get(cat.slug)
            const unlocked = s?.unlocked_modules ?? [1]
            const passedIdx = new Set<number>() // derived from percent; per-module detail lives on the course map
            const passedCount = s?.passed_count ?? 0
            const tile = TILE[cat.color]
            return (
              <div key={cat.slug}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 font-bold text-[12px]"
                      style={{ backgroundColor: tile.bg, color: tile.fg, ...SERIF }}>
                      {cat.code === 'E.D.I.T.' ? 'EDIT' : cat.code}
                    </div>
                    <div>
                      <Link href={getUriWithOrg(orgslug, `/course/${cat.slug}`)} className="pmhnp-serif text-[15px] font-semibold" style={{ ...SERIF, color: PLUM }}>
                        {course.title}
                      </Link>
                      <p className="text-[12px]" style={{ color: MUTED }}>
                        {passedCount} of {course.total_modules} modules passed
                        {s ? ` · ${s.ce_earned}/${s.ce_total} CE hrs` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-[13px] font-semibold shrink-0" style={{ color: tile.fg }}>{s?.percent_complete ?? 0}%</span>
                </div>

                {/* module rail */}
                <div className="flex flex-wrap gap-2">
                  {course.modules.map((m) => {
                    const isUnlocked = unlocked.includes(m.index)
                    const isPassed = passedCount >= m.index // best-effort from PTR summary
                    const st = isPassed ? 'passed' : isUnlocked ? 'current' : 'locked'
                    const content = (
                      <div className="flex items-center gap-1.5 rounded-full pl-1.5 pr-3 py-1 text-[12px] font-medium"
                        style={{
                          backgroundColor: st === 'locked' ? '#efeaf6' : st === 'passed' ? TILE.green.bg : tile.bg,
                          color: st === 'locked' ? MUTED : st === 'passed' ? TILE.green.fg : tile.fg,
                          border: `1px solid ${CARD_BORDER}`,
                        }}>
                        <span className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
                          style={{ backgroundColor: st === 'locked' ? '#e0d7f0' : st === 'passed' ? TILE.green.fg : tile.fg, color: st === 'locked' ? MUTED : '#fff' }}>
                          {st === 'passed' ? <Check size={11} strokeWidth={3} /> : st === 'locked' ? <Lock size={10} /> : m.index}
                        </span>
                        M{m.index}
                      </div>
                    )
                    return isUnlocked ? (
                      <Link key={m.slug} href={getUriWithOrg(orgslug, `/module/${cat.slug}/${m.index}`)}>{content}</Link>
                    ) : (
                      <div key={m.slug} aria-disabled="true" className="cursor-not-allowed">{content}</div>
                    )
                  })}
                </div>

                <Link href={getUriWithOrg(orgslug, `/course/${cat.slug}`)}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: PURPLE }}>
                  Open course map <ArrowRight size={14} />
                </Link>
              </div>
            )
          })}
        </div>

        <div className="mt-10 rounded-2xl px-6 py-5 flex items-center gap-4" style={{ backgroundColor: '#fff', border: `1px solid ${CARD_BORDER}` }}>
          <div className="flex items-center justify-center w-11 h-11 rounded-full shrink-0" style={{ backgroundColor: TILE.gold.bg }}>
            <Award size={20} style={{ color: TILE.gold.fg }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: PLUM }}>Total CE contact hours</p>
            <p className="text-[13px]" style={{ color: MUTED }}>{all?.ce_earned_total ?? 0} of {all?.ce_available_total ?? 33} hours earned across all courses</p>
          </div>
          <Link href={getUriWithOrg(orgslug, '/progress')} className="text-sm font-medium inline-flex items-center gap-1 shrink-0" style={{ color: PURPLE }}>
            Progress <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
