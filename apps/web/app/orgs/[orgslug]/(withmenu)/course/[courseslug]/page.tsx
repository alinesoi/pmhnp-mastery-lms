'use client'
import React, { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { getUriWithOrg } from '@services/config/config'
import { getMyProgress, ProgressResponse } from '@services/progress/progress'
import { ArrowLeft, ArrowRight, Lock, Check, Award, BadgeCheck } from 'lucide-react'
import {
  SERIF, PLUM, PURPLE, LILAC, INK, MUTED,
  catalogBySlug, TILE, CARD_STYLE,
} from '../../_pmhnp/theme'
import { useCourses } from '../../_pmhnp/CoursesContext'

type NodeState = 'passed' | 'current' | 'locked'

export default function CoursePage(props: { params: Promise<{ orgslug: string; courseslug: string }> }) {
  const params = use(props.params)
  const orgslug = params.orgslug
  const courseslug = params.courseslug
  const { courseBySlug } = useCourses()
  const course = courseBySlug(courseslug)
  const catalog = catalogBySlug(courseslug)

  const session = useLHSession() as any
  const accessToken = session?.data?.tokens?.access_token
  const [data, setData] = useState<ProgressResponse | null>(null)

  useEffect(() => {
    if (!accessToken || !course) return
    getMyProgress(accessToken, courseslug).then((res: any) => {
      if (res?.status === 200 && res?.data) setData(res.data)
    }).catch(() => {})
  }, [accessToken, courseslug, course])

  if (!course || !catalog) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center" style={{ backgroundColor: LILAC }}>
        <p style={{ color: MUTED }}>Course not found.</p>
      </div>
    )
  }

  const unlocked: number[] = data?.summary?.unlocked_modules ?? [1]
  const passedIdx = new Set((data?.modules ?? []).filter((m) => m.passed).map((m) => m.module_index))
  const tile = TILE[catalog.color]

  const stateOf = (index: number): NodeState => {
    if (passedIdx.has(index)) return 'passed'
    if (unlocked.includes(index)) return 'current'
    return 'locked'
  }

  return (
    <div className="min-h-[calc(100vh-56px)]" style={{ backgroundColor: LILAC }}>
      <div className="mx-auto px-6 sm:px-10 py-12" style={{ maxWidth: 780 }}>
        <Link href={getUriWithOrg(orgslug, '/courses')} className="inline-flex items-center gap-1.5 text-sm" style={{ color: MUTED }}>
          <ArrowLeft size={15} /> Course catalog
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide"
            style={{ backgroundColor: tile.bg, color: tile.fg }}>
            {catalog.badge}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide"
            style={{ backgroundColor: TILE.gold.bg, color: TILE.gold.fg }}>
            <BadgeCheck size={11} /> Accredited CE
          </span>
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
            style={{ backgroundColor: TILE.gold.bg, color: TILE.gold.fg }}>
            <Award size={11} /> {catalog.ce_total} CE hrs
          </span>
        </div>
        <h1 className="pmhnp-serif mt-2 text-3xl sm:text-4xl leading-tight font-semibold" style={{ ...SERIF, color: PLUM }}>
          {course.title}
        </h1>
        <p className="mt-3 text-base max-w-2xl leading-relaxed" style={{ color: INK }}>
          {catalog.blurb}
        </p>

        {/* Module list with sequential unlock */}
        <h2 className="pmhnp-serif mt-11 text-[22px] font-semibold" style={{ ...SERIF, color: PLUM }}>Modules</h2>
        <div className="mt-5 relative">
          <div className="absolute left-[23px] top-4 bottom-4 w-[3px] rounded-full"
            style={{ background: `linear-gradient(${tile.fg},#e0d7f0)` }} />
          <ol className="space-y-3">
            {course.modules.map((m) => {
              const st = stateOf(m.index)
              const clickable = st !== 'locked'
              const node = (
                <div className="relative flex items-start gap-4">
                  <div className="relative z-10 shrink-0">
                    <div
                      className={'flex items-center justify-center w-12 h-12 rounded-full ' + (st === 'current' ? 'pmhnp-pulse' : '')}
                      style={{ backgroundColor: st === 'locked' ? '#efeaf6' : st === 'passed' ? TILE.green.fg : tile.fg, border: `3px solid ${LILAC}` }}
                    >
                      {st === 'passed' ? (
                        <Check size={20} className="text-white" strokeWidth={3} />
                      ) : st === 'current' ? (
                        <span className="text-white text-[15px] font-bold" style={{ ...SERIF }}>{m.index}</span>
                      ) : (
                        <Lock size={16} style={{ color: '#a99cc4' }} />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 bg-white px-6 py-5" style={{ ...CARD_STYLE }}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: st === 'locked' ? MUTED : PURPLE }}>
                        {m.tag || `Module ${m.index}`}
                      </span>
                      {st === 'passed' && (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ backgroundColor: TILE.green.bg, color: TILE.green.fg }}>
                          <Check size={11} /> Passed
                        </span>
                      )}
                      {st === 'current' && (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ backgroundColor: tile.bg, color: tile.fg }}>
                          Available
                        </span>
                      )}
                      {st === 'locked' && (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ backgroundColor: '#efeaf6', color: MUTED }}>
                          <Lock size={11} /> Locked
                        </span>
                      )}
                    </div>
                    <p className="pmhnp-serif mt-1 text-base font-semibold" style={{ ...SERIF, color: st === 'locked' ? '#8a7fa6' : PLUM }}>
                      {m.title}
                    </p>
                    <p className="mt-0.5 text-[13px]" style={{ color: MUTED }}>
                      {m.chapters.length} lessons
                    </p>
                    {st === 'current' && (
                      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold rounded-xl px-4 py-2.5"
                        style={{ background: PURPLE, color: '#fff', boxShadow: '0 6px 16px rgba(91,61,140,0.24)' }}>
                        Start module <ArrowRight size={14} />
                      </span>
                    )}
                    {st === 'passed' && (
                      <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: PURPLE }}>
                        Review module <ArrowRight size={14} />
                      </span>
                    )}
                    {st === 'locked' && (
                      <p className="mt-2 text-[12px]" style={{ color: MUTED }}>Pass module {m.index - 1} to unlock.</p>
                    )}
                  </div>
                </div>
              )
              return (
                <li key={m.slug}>
                  {clickable ? (
                    <Link href={getUriWithOrg(orgslug, `/module/${courseslug}/${m.index}`)} className="block group">{node}</Link>
                  ) : (
                    <div aria-disabled="true" className="cursor-not-allowed">{node}</div>
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </div>
  )
}
