'use client'
import React, { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { getUriWithOrg } from '@services/config/config'
import { getMyProgress, ProgressResponse } from '@services/progress/progress'
import { ArrowLeft, ArrowRight, Lock, Check, Award, BadgeCheck, BrainCircuit, Sparkles } from 'lucide-react'
import {
  SERIF, PLUM, PLUM_DEEP, PURPLE, PERI, MAGENTA, GOLD, LILAC, CARD_BORDER, INK, MUTED,
  courseBySlug, catalogBySlug, CLARITY, TILE,
} from '../../_pmhnp/theme'

type NodeState = 'passed' | 'current' | 'locked'

export default function CoursePage(props: { params: Promise<{ orgslug: string; courseslug: string }> }) {
  const params = use(props.params)
  const orgslug = params.orgslug
  const courseslug = params.courseslug
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
  const isDAB = courseslug === 'diagnostic-accuracy-blueprint'

  const stateOf = (index: number): NodeState => {
    if (passedIdx.has(index)) return 'passed'
    if (unlocked.includes(index)) return 'current'
    return 'locked'
  }

  return (
    <div className="min-h-[calc(100vh-56px)]" style={{ backgroundColor: LILAC }}>
      <div className="max-w-3xl mx-auto px-6 sm:px-10 py-10">
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

        {/* CLARITY spine — the signature DAB course map */}
        {isDAB && (
          <div className="mt-7 rounded-2xl px-6 py-6 relative overflow-hidden" style={{ backgroundColor: PLUM }}>
            <div className="flex items-center gap-2 text-xs font-medium tracking-wide uppercase" style={{ color: PERI }}>
              <BrainCircuit size={15} /> The CLARITY Method
            </div>
            <p className="pmhnp-serif mt-2 text-lg leading-relaxed font-semibold" style={{ ...SERIF, color: '#efe9fb' }}>
              Seven steps from context to documentation — the spine of every diagnostic assessment.
            </p>
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {CLARITY.map((n) => (
                <div key={n.letter} className="rounded-xl px-3 py-3" style={{ backgroundColor: PLUM_DEEP, border: '1px solid rgba(124,159,214,0.24)' }}>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg text-[13px] font-bold text-white"
                      style={{ background: `linear-gradient(140deg, ${PURPLE}, ${PERI})`, ...SERIF }}>
                      {n.letter}
                    </span>
                    <span className="pmhnp-serif text-[13.5px] font-semibold" style={{ ...SERIF, color: '#efe9fb' }}>{n.word}</span>
                  </div>
                  <p className="mt-1.5 text-[11px]" style={{ color: 'rgba(239,233,251,0.65)' }}>{n.sub}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11.5px] inline-flex items-center gap-1.5" style={{ color: 'rgba(239,233,251,0.6)' }}>
              <Sparkles size={11} /> In production: each CLARITY step maps to the modules below with case walk-throughs and a differential builder.
            </p>
          </div>
        )}

        {/* Module list with sequential unlock */}
        <h2 className="pmhnp-serif mt-9 text-lg font-semibold" style={{ ...SERIF, color: PLUM }}>Modules</h2>
        <div className="mt-4 relative">
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
                  <div className="flex-1 bg-white shadow-sm px-5 py-4" style={{ border: `1px solid ${CARD_BORDER}`, borderRadius: 16 }}>
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
                      {m.chapters.length} lessons · 70% knowledge check
                    </p>
                    {clickable && (
                      <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: PURPLE }}>
                        {st === 'passed' ? 'Review module' : 'Start module'} <ArrowRight size={14} />
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
