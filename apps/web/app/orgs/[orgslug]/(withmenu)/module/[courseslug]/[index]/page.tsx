'use client'
import React, { use, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { getUriWithOrg } from '@services/config/config'
import { getMyProgress, saveModuleProgress } from '@services/progress/progress'
import {
  ArrowLeft, ArrowRight, Lock, PlayCircle, ClipboardCheck, Check, Bot,
} from 'lucide-react'
import {
  SERIF, PLUM, PURPLE, GOLD, LILAC, CARD_BORDER, INK, MUTED,
  catalogBySlug, aiKindMeta, TILE, PASS_MARK,
} from '../../../_pmhnp/theme'
import { useCourses } from '../../../_pmhnp/CoursesContext'

export default function ModulePage(props: { params: Promise<{ orgslug: string; courseslug: string; index: string }> }) {
  const params = use(props.params)
  const orgslug = params.orgslug
  const courseslug = params.courseslug
  const index = parseInt(params.index, 10)
  const { courseBySlug, moduleByIndex } = useCourses()
  const course = courseBySlug(courseslug)
  const mod = moduleByIndex(courseslug, index)
  const catalog = catalogBySlug(courseslug)

  const session = useLHSession() as any
  const accessToken = session?.data?.tokens?.access_token

  const [unlocked, setUnlocked] = useState<number[] | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [passed, setPassed] = useState(false)

  useEffect(() => {
    if (!accessToken || !mod) return
    getMyProgress(accessToken, courseslug).then((res: any) => {
      if (res?.status === 200 && res?.data?.summary) {
        setUnlocked(res.data.summary.unlocked_modules)
        const row = (res.data.modules || []).find((r: any) => r.module_index === index)
        if (row?.passed) setPassed(true)
      }
    }).catch(() => setUnlocked([1]))
  }, [accessToken, courseslug, index, mod])

  const tile = catalog ? TILE[catalog.color] : TILE.purple

  const isLocked = useMemo(() => {
    if (unlocked === null) return false
    return !unlocked.includes(index)
  }, [unlocked, index])

  if (!course || !mod) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center" style={{ backgroundColor: LILAC }}>
        <p style={{ color: MUTED }}>Module not found.</p>
      </div>
    )
  }

  if (isLocked) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-6" style={{ backgroundColor: LILAC }}>
        <div className="bg-white shadow-sm px-8 py-10 max-w-md text-center" style={{ border: `1px solid ${CARD_BORDER}`, borderRadius: 18 }}>
          <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-full" style={{ backgroundColor: '#efeaf6' }}>
            <Lock size={24} style={{ color: '#a99cc4' }} />
          </div>
          <h1 className="pmhnp-serif mt-4 text-xl font-semibold" style={{ ...SERIF, color: PLUM }}>Module {index} is locked</h1>
          <p className="mt-2 text-sm" style={{ color: INK }}>
            Pass the knowledge check for module {index - 1} to unlock this one.
          </p>
          <Link href={getUriWithOrg(orgslug, `/course/${courseslug}`)}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: PURPLE }}>
            Back to course map <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    )
  }

  const submitCheck = async () => {
    if (submitting || !accessToken) return
    setSubmitting(true)
    // Placeholder scoring: the graded quiz is in production. Submitting records a
    // passing score so the sequential module unlock works end to end.
    const res: any = await saveModuleProgress(courseslug, index, mod.slug, 100, true, accessToken)
    setSubmitting(false)
    if (res?.status === 200) setPassed(true)
  }

  const nextIndex = index + 1
  const hasNext = nextIndex <= course.total_modules

  return (
    <div className="min-h-[calc(100vh-56px)]" style={{ backgroundColor: LILAC }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        {/* header */}
        <div className="flex items-center justify-between gap-3">
          <Link href={getUriWithOrg(orgslug, `/course/${courseslug}`)} className="inline-flex items-center gap-1.5 text-sm" style={{ color: MUTED }}>
            <ArrowLeft size={15} /> {catalog?.code}
          </Link>
          <span className="text-[12px] font-medium" style={{ color: MUTED }}>Module {mod.index} of {course.total_modules}</span>
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide" style={{ color: PURPLE }}>{mod.tag || `Module ${mod.index}`}</p>
        <h1 className="pmhnp-serif mt-1 text-2xl sm:text-3xl leading-tight font-semibold" style={{ ...SERIF, color: PLUM }}>{mod.title}</h1>

        {/* THE INTERACTIVE LESSON — the video IS the module: narration + in-video AI
            moments, hosted on app-video.nesoi.ai. Presented as the hero of the page. */}
        {mod.video ? (
          <div className="mt-5">
            <div
              className="relative w-full overflow-hidden shadow-md"
              style={{ border: `1px solid ${CARD_BORDER}`, borderRadius: 18, aspectRatio: '16 / 9', backgroundColor: '#1f1638' }}
            >
              <iframe
                src={mod.video}
                title={`${catalog?.code} · Module ${mod.index}: ${mod.title}`}
                className="absolute inset-0 w-full h-full"
                style={{ border: 0 }}
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; microphone; camera"
                allowFullScreen
              />
            </div>
            <p className="mt-2.5 text-[12px] inline-flex items-center gap-1.5" style={{ color: MUTED }}>
              <PlayCircle size={13} style={{ color: PURPLE }} /> Interactive lesson, narrated in LuAnn&rsquo;s voice with the AI moments built in. Watch it through, then take the knowledge check below.
            </p>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl flex flex-col items-center justify-center py-14"
            style={{ background: `linear-gradient(150deg,${tile.bg},#ffffff)`, border: `1px dashed ${CARD_BORDER}` }}>
            <PlayCircle size={40} style={{ color: tile.fg }} />
            <p className="mt-2 text-sm font-medium" style={{ color: PLUM }}>Interactive lesson coming soon</p>
          </div>
        )}

        {/* IN THIS LESSON — a read-only outline of the chapters inside the video */}
        {mod.chapters?.length > 0 && (
          <div className="mt-6 bg-white shadow-sm px-6 py-6" style={{ border: `1px solid ${CARD_BORDER}`, borderRadius: 18 }}>
            <h2 className="pmhnp-serif text-lg font-semibold" style={{ ...SERIF, color: PLUM }}>In this lesson</h2>
            <ol className="mt-4 space-y-3">
              {mod.chapters.map((c) => {
                const cai = c.ai ? aiKindMeta(c.ai.kind) : null
                return (
                  <li key={c.num} className="flex items-start gap-3">
                    <span className="mt-0.5 flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-semibold shrink-0" style={{ backgroundColor: tile.bg, color: tile.fg }}>{c.num}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium" style={{ color: INK }}>
                        {c.title}
                        {cai && (
                          <span className="ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold align-middle" style={{ backgroundColor: TILE[cai.color].bg, color: TILE[cai.color].fg }}>
                            <Bot size={10} /> {cai.label}
                          </span>
                        )}
                      </p>
                      {c.purpose && <p className="mt-0.5 text-[12.5px] leading-relaxed" style={{ color: MUTED }}>{c.purpose}</p>}
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        )}

        {/* KNOWLEDGE CHECK */}
        <div className="mt-6 bg-white shadow-sm px-6 py-6" style={{ border: `1px solid ${CARD_BORDER}`, borderRadius: 18 }}>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl" style={{ backgroundColor: tile.bg }}>
              <ClipboardCheck size={18} style={{ color: tile.fg }} />
            </span>
            <div>
              <h2 className="pmhnp-serif text-lg font-semibold" style={{ ...SERIF, color: PLUM }}>Knowledge check</h2>
              <p className="text-[12px]" style={{ color: MUTED }}>Score {PASS_MARK}% or higher to unlock the next module.</p>
            </div>
          </div>

          <span className="mt-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ backgroundColor: TILE.gold.bg, color: TILE.gold.fg }}>
            In production: graded quiz
          </span>

          <ol className="mt-4 space-y-3">
            {mod.knowledge_check.questions.map((q, i) => (
              <li key={i} className="rounded-xl px-4 py-3.5" style={{ backgroundColor: '#f3eefb' }}>
                <p className="text-sm leading-relaxed" style={{ color: INK }}>
                  <span className="font-semibold" style={{ color: PLUM }}>{i + 1}.</span> {q}
                </p>
              </li>
            ))}
          </ol>

          {passed ? (
            <div className="mt-5 rounded-xl px-4 py-4 flex items-start gap-3" style={{ backgroundColor: TILE.green.bg }}>
              <Check size={18} style={{ color: TILE.green.fg }} className="mt-0.5" strokeWidth={3} />
              <div>
                <p className="text-sm font-semibold" style={{ color: TILE.green.fg }}>Module passed</p>
                <p className="text-[13px]" style={{ color: INK }}>
                  {hasNext ? `Module ${nextIndex} is now unlocked.` : 'You have completed this course. Head to Progress for your certificate.'}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {hasNext && (
                    <Link href={getUriWithOrg(orgslug, `/module/${courseslug}/${nextIndex}`)}
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: PURPLE }}>
                      Next module <ArrowRight size={14} />
                    </Link>
                  )}
                  <Link href={getUriWithOrg(orgslug, `/course/${courseslug}`)}
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold" style={{ border: `1px solid ${CARD_BORDER}`, color: PLUM }}>
                    Back to course map
                  </Link>
                  {!hasNext && (
                    <Link href={getUriWithOrg(orgslug, '/progress')}
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: GOLD }}>
                      View certificate <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[12px] max-w-md" style={{ color: MUTED }}>
                Scoring is a placeholder for now. Submitting records a passing score so the sequential
                unlock is demonstrable end to end; the graded quiz replaces this.
              </p>
              <button type="button" onClick={submitCheck} disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: TILE.green.fg }}>
                {submitting ? 'Submitting...' : 'Submit knowledge check'} <Check size={15} strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
