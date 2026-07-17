'use client'
import React, { use, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { getUriWithOrg } from '@services/config/config'
import { getMyProgress, saveModuleProgress } from '@services/progress/progress'
import {
  ArrowLeft, ArrowRight, Lock, PlayCircle, ClipboardCheck, Check, Info, Sparkles,
  FileText, FileVideo, Presentation, AudioLines, Bot,
} from 'lucide-react'
import {
  SERIF, PLUM, PURPLE, PERI, MAGENTA, GOLD, LILAC, CARD_BORDER, INK, MUTED,
  courseBySlug, moduleByIndex, catalogBySlug, aiKindMeta, TILE, PASS_MARK,
} from '../../../_pmhnp/theme'

export default function ModulePage(props: { params: Promise<{ orgslug: string; courseslug: string; index: string }> }) {
  const params = use(props.params)
  const orgslug = params.orgslug
  const courseslug = params.courseslug
  const index = parseInt(params.index, 10)
  const course = courseBySlug(courseslug)
  const mod = moduleByIndex(courseslug, index)
  const catalog = catalogBySlug(courseslug)

  const session = useLHSession() as any
  const accessToken = session?.data?.tokens?.access_token

  const [unlocked, setUnlocked] = useState<number[] | null>(null)
  const [step, setStep] = useState(0)
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

  const totalScreens = mod?.chapters.length ?? 0
  const onCheck = step >= totalScreens
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

  const chap = mod.chapters[Math.min(step, totalScreens - 1)]
  const progressPct = Math.round(((Math.min(step, totalScreens)) / (totalScreens + 1)) * 100)
  const ai = chap?.ai ? aiKindMeta(chap.ai.kind) : null

  const submitCheck = async () => {
    if (submitting || !accessToken) return
    setSubmitting(true)
    // Placeholder scoring: the real interactive quiz is in production. Submitting
    // records a passing score so sequential unlock works end to end.
    const res: any = await saveModuleProgress(courseslug, index, mod.slug, 100, true, accessToken)
    setSubmitting(false)
    if (res?.status === 200) setPassed(true)
  }

  const nextIndex = index + 1
  const hasNext = nextIndex <= course.total_modules

  return (
    <div className="min-h-[calc(100vh-56px)]" style={{ backgroundColor: LILAC }}>
      <div className="max-w-3xl mx-auto px-6 sm:px-10 py-8">
        <div className="flex items-center justify-between gap-3">
          <Link href={getUriWithOrg(orgslug, `/course/${courseslug}`)} className="inline-flex items-center gap-1.5 text-sm" style={{ color: MUTED }}>
            <ArrowLeft size={15} /> {catalog?.code}
          </Link>
          <span className="text-[12px] font-medium" style={{ color: MUTED }}>Module {mod.index} of {course.total_modules}</span>
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide" style={{ color: PURPLE }}>{mod.tag || `Module ${mod.index}`}</p>
        <h1 className="pmhnp-serif mt-1 text-2xl sm:text-3xl leading-tight font-semibold" style={{ ...SERIF, color: PLUM }}>{mod.title}</h1>

        {/* progress bar */}
        <div className="mt-5 w-full h-1.5 rounded-full" style={{ backgroundColor: '#ece7f5' }}>
          <div className="h-1.5 rounded-full transition-all duration-300" style={{ backgroundColor: tile.fg, width: `${onCheck ? 100 : progressPct}%` }} />
        </div>
        <p className="mt-2 text-[12px]" style={{ color: MUTED }}>
          {onCheck ? 'Knowledge check' : `Lesson ${step + 1} of ${totalScreens}`}
        </p>

        {/* LESSON VIEW */}
        {!onCheck && chap && (
          <div className="mt-5 bg-white shadow-sm px-6 py-6" style={{ border: `1px solid ${CARD_BORDER}`, borderRadius: 18 }}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ backgroundColor: TILE.gold.bg, color: TILE.gold.fg }}>
                In production
              </span>
              {ai && (
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ backgroundColor: TILE[ai.color].bg, color: TILE[ai.color].fg }}>
                  <Bot size={12} /> {ai.label}
                </span>
              )}
              <span className="text-[12px]" style={{ color: MUTED }}>Lesson {chap.num}</span>
            </div>
            <h2 className="pmhnp-serif mt-3 text-xl font-semibold" style={{ ...SERIF, color: PLUM }}>{chap.title}</h2>

            {/* slide / video slot (LuAnn: slides format, narration is her verbatim script in her cloned voice) */}
            <div className="mt-4 rounded-2xl flex flex-col items-center justify-center py-10"
              style={{ background: `linear-gradient(150deg,${tile.bg},#ffffff)`, border: `1px dashed ${CARD_BORDER}` }}>
              <PlayCircle size={40} style={{ color: tile.fg }} />
              <p className="mt-2 text-sm font-medium" style={{ color: PLUM }}>Slide + narrated video slot</p>
              <p className="text-[12px] text-center px-4" style={{ color: MUTED }}>
                In production: {chap.visual || 'slide deck'} — narrated verbatim in LuAnn&rsquo;s cloned voice.
              </p>
            </div>

            <div className="mt-5 rounded-xl px-4 py-3.5" style={{ backgroundColor: '#f3eefb' }}>
              <p className="text-[11px] font-semibold uppercase tracking-wide inline-flex items-center gap-1.5" style={{ color: PURPLE }}>
                <Info size={13} /> What this lesson teaches
              </p>
              <p className="mt-1.5 text-sm leading-relaxed" style={{ color: INK }}>{chap.purpose}</p>
            </div>

            {chap.interaction && (
              <div className="mt-3 rounded-xl px-4 py-3.5" style={{ backgroundColor: '#faf6fc', border: `1px solid ${CARD_BORDER}` }}>
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: MAGENTA }}>Interaction this lesson needs</p>
                <p className="mt-1.5 text-sm leading-relaxed" style={{ color: INK }}>{chap.interaction}</p>
              </div>
            )}

            {ai && (
              <div className="mt-3 rounded-xl px-4 py-3.5" style={{ backgroundColor: TILE[ai.color].bg }}>
                <p className="text-[11px] font-semibold uppercase tracking-wide inline-flex items-center gap-1.5" style={{ color: TILE[ai.color].fg }}>
                  <Bot size={13} /> {ai.label}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed" style={{ color: INK }}>{chap.ai!.desc}</p>
              </div>
            )}

            {/* Exportable asset slots (LuAnn Rule 2: every module stays exportable) */}
            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: MUTED }}>Downloadable assets (in production)</p>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Video', icon: FileVideo },
                  { label: 'Slide deck', icon: Presentation },
                  { label: 'Script', icon: FileText },
                  { label: 'Audio', icon: AudioLines },
                ].map((a) => {
                  const Icon = a.icon
                  return (
                    <div key={a.label} className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ border: `1px solid ${CARD_BORDER}`, backgroundColor: '#faf8fd' }}>
                      <Icon size={15} style={{ color: PURPLE }} />
                      <span className="text-[12px] font-medium" style={{ color: INK }}>{a.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* KNOWLEDGE CHECK VIEW */}
        {onCheck && (
          <div className="mt-5 bg-white shadow-sm px-6 py-6" style={{ border: `1px solid ${CARD_BORDER}`, borderRadius: 18 }}>
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
              In production: interactive quiz
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
              <p className="mt-4 text-[12px]" style={{ color: MUTED }}>
                Note: scoring is a placeholder. Submitting records a passing score so sequential unlock is
                demonstrable end to end. The real quiz grades these questions.
              </p>
            )}
          </div>
        )}

        {/* NAV CONTROLS */}
        {!passed && (
          <div className="mt-6 flex items-center justify-between">
            <button type="button" disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium disabled:opacity-40"
              style={{ border: `1px solid ${CARD_BORDER}`, color: PLUM, backgroundColor: '#ffffff' }}>
              <ArrowLeft size={15} /> Back
            </button>
            {!onCheck ? (
              <button type="button" onClick={() => setStep((s) => Math.min(totalScreens, s + 1))}
                className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: PURPLE }}>
                {step === totalScreens - 1 ? 'Go to knowledge check' : 'Next lesson'} <ArrowRight size={15} />
              </button>
            ) : (
              <button type="button" onClick={submitCheck} disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: TILE.green.fg }}>
                {submitting ? 'Submitting...' : 'Submit knowledge check'} <Check size={15} strokeWidth={3} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
