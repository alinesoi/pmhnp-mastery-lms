'use client'
import React, { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { getUriWithOrg } from '@services/config/config'
import { getMyOnboarding, saveOnboarding } from '@services/onboarding/onboarding'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeft, ArrowRight, Check, PlayCircle, Sprout, Stethoscope, Building2, GraduationCap,
  Brain, Pill, ShieldCheck, ClipboardList, BrainCircuit,
} from 'lucide-react'
import {
  SERIF, PLUM, PLUM_DEEP, PURPLE, PERI, MAGENTA, LILAC, CARD_BORDER, INK, MUTED, TILE, TAGLINE,
} from '../_pmhnp/theme'

type Option = { label: string; icon: LucideIcon; tile: { bg: string; fg: string }; value: string }
type Question = { key: string; title: string; subtitle: string; options: Option[] }

// Intro quiz: gauges background + goals to frame the experience. No scoring, no
// clinical assumptions — meets the learner where they are.
const QUESTIONS: Question[] = [
  {
    key: 'role',
    title: 'Where are you in your PMHNP journey?',
    subtitle: 'There are no wrong answers. This just helps us frame things.',
    options: [
      { label: 'PMHNP student', icon: Sprout, tile: TILE.green, value: 'student' },
      { label: 'New graduate / early career', icon: Stethoscope, tile: TILE.peri, value: 'new-grad' },
      { label: 'Practicing PMHNP', icon: Building2, tile: TILE.purple, value: 'practicing' },
      { label: 'Preceptor / educator', icon: GraduationCap, tile: TILE.gold, value: 'educator' },
    ],
  },
  {
    key: 'goal',
    title: 'What do you most want from the Academy?',
    subtitle: 'We will point you at the right blueprint first.',
    options: [
      { label: 'Sharpen diagnostic accuracy', icon: Brain, tile: TILE.purple, value: 'diagnosis' },
      { label: 'Prescribe with more confidence', icon: Pill, tile: TILE.peri, value: 'treatment' },
      { label: 'Deprescribe / reduce polypharmacy safely', icon: ShieldCheck, tile: TILE.magenta, value: 'deprescribe' },
      { label: 'Earn CE contact hours and certificates', icon: ClipboardList, tile: TILE.gold, value: 'ce' },
    ],
  },
]

export default function WelcomePage(props: { params: Promise<{ orgslug: string }> }) {
  const params = use(props.params)
  const orgslug = params.orgslug
  const router = useRouter()
  const session = useLHSession() as any
  const accessToken = session?.data?.tokens?.access_token
  const firstName: string = session?.data?.user?.first_name || ''

  const [started, setStarted] = useState(false)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const markOnboarded = () => { try { sessionStorage.setItem('pmhnp_onboarded', '1') } catch {} }

  useEffect(() => {
    if (!accessToken) return
    getMyOnboarding(accessToken).then((res: any) => {
      if (res?.status === 200 && (res?.data?.completed || res?.data?.skipped)) {
        markOnboarded()
        router.replace(getUriWithOrg(orgslug, '/'))
      }
    })
  }, [accessToken])

  const goHome = () => { window.location.href = getUriWithOrg(orgslug, '/') }

  const handleSkip = async () => {
    if (saving) return
    setSaving(true)
    if (accessToken) await saveOnboarding({}, true, accessToken)
    markOnboarded()
    goHome()
  }

  // Video-first path: watching the welcome video and pressing Continue completes
  // onboarding; the quiz is an optional extra, not a gate.
  const handleContinue = async () => {
    if (saving) return
    setSaving(true)
    if (accessToken) await saveOnboarding(answers, false, accessToken)
    markOnboarded()
    goHome()
  }

  const handlePick = async (q: Question, opt: Option) => {
    if (saving) return
    const nextAnswers = { ...answers, [q.key]: opt.value }
    setAnswers(nextAnswers)
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      setSaving(true)
      if (accessToken) await saveOnboarding(nextAnswers, false, accessToken)
      markOnboarded()
      setSaving(false)
      setStep(QUESTIONS.length)
    }
  }

  const isReveal = step >= QUESTIONS.length
  const showIntro = !isReveal && !started
  const q = QUESTIONS[Math.min(step, QUESTIONS.length - 1)]

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col" style={{ backgroundColor: LILAC }}>
      <div className="w-full max-w-xl mx-auto px-6 pt-10 pb-14 flex-1 flex flex-col">
        {showIntro && (
          <div className="flex-1 flex flex-col justify-center py-6">
            <div className="flex items-center justify-between mb-6">
              <span className="flex items-center gap-2">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl" style={{ background: `linear-gradient(140deg, ${PURPLE}, ${PERI})` }}>
                  <BrainCircuit size={18} color="#fff" />
                </span>
                <span className="text-sm font-semibold" style={{ color: PLUM }}>PMHNP Mastery Academy</span>
              </span>
              <button type="button" onClick={handleSkip} className="text-xs underline underline-offset-2 hover:opacity-70" style={{ color: MUTED }}>
                Skip for now
              </button>
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] mb-3" style={{ color: PURPLE }}>
              Welcome
            </p>
            <h1 className="pmhnp-serif text-3xl sm:text-[38px] font-semibold leading-tight" style={{ ...SERIF, color: PLUM }}>
              Welcome{firstName ? `, ${firstName}` : ''}.
            </h1>
            <p className="pmhnp-serif mt-2 text-lg italic" style={{ ...SERIF, color: MAGENTA }}>{TAGLINE}</p>
            <p className="mt-3 text-[15px] leading-relaxed max-w-lg" style={{ color: INK }}>
              Press play and let LuAnn walk you through the Academy — the CLARITY diagnostic method, the
              Treatment Accuracy Blueprint, and the E.D.I.T. deprescribing protocol.
            </p>

            {/* Welcome video: primary onboarding step, narrated in LuAnn's cloned voice. */}
            <div className="mt-6 rounded-2xl overflow-hidden relative flex flex-col items-center justify-center"
              style={{ background: `linear-gradient(150deg, ${PLUM_DEEP}, ${PURPLE})`, border: `1px solid ${CARD_BORDER}`, aspectRatio: '16 / 9' }}>
              <button type="button" aria-label="Play welcome video"
                className="flex items-center justify-center w-16 h-16 rounded-full transition-transform hover:scale-105"
                style={{ backgroundColor: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.35)' }}>
                <PlayCircle size={44} style={{ color: '#ffffff' }} />
              </button>
              <p className="mt-3 text-sm font-medium" style={{ color: '#efe9fb' }}>Your welcome video</p>
              <p className="text-[12px]" style={{ color: 'rgba(239,233,251,0.7)' }}>In production: LuAnn&rsquo;s welcome and Academy overview</p>
            </div>

            <div className="mt-7">
              <button type="button" onClick={handleContinue} disabled={saving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
                style={{ backgroundColor: PURPLE }}>
                Enter the Academy <ArrowRight size={16} />
              </button>
              <p className="mt-3 text-xs" style={{ color: MUTED }}>
                Prefer to tell us about yourself first?{' '}
                <button type="button" onClick={() => setStarted(true)} className="underline underline-offset-2 hover:opacity-70" style={{ color: PURPLE }}>
                  Answer a couple of quick questions
                </button>
              </p>
            </div>
          </div>
        )}

        {!isReveal && started && (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium tracking-wide" style={{ color: MUTED }}>Step {step + 1} of {QUESTIONS.length}</p>
              <button type="button" onClick={handleSkip} className="text-xs underline underline-offset-2 hover:opacity-70" style={{ color: MUTED }}>Skip for now</button>
            </div>
            <div className="w-full h-1.5 rounded-full mb-7" style={{ backgroundColor: '#ece7f5' }}>
              <div className="h-1.5 rounded-full transition-all duration-300" style={{ backgroundColor: PURPLE, width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
            </div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-2" style={{ color: PURPLE }}>Getting to know you</p>
            <h1 className="pmhnp-serif text-2xl sm:text-3xl font-semibold leading-snug" style={{ ...SERIF, color: PLUM }}>{q.title}</h1>
            <p className="mt-2 text-sm" style={{ color: INK }}>{q.subtitle}</p>

            <div className="mt-7 space-y-3">
              {q.options.map((opt) => {
                const selected = answers[q.key] === opt.value
                const Icon = opt.icon
                return (
                  <button key={opt.value} type="button" onClick={() => handlePick(q, opt)}
                    className="w-full flex items-center gap-4 text-left rounded-2xl px-4 py-3.5 bg-white transition-all hover:shadow-sm"
                    style={{ border: `1.5px solid ${selected ? PURPLE : CARD_BORDER}`, color: PLUM }}>
                    <span className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0" style={{ backgroundColor: opt.tile.bg }}>
                      <Icon size={20} style={{ color: opt.tile.fg }} strokeWidth={1.8} />
                    </span>
                    <span className="flex-1 text-sm font-medium">{opt.label}</span>
                    <span className="flex items-center justify-center w-5 h-5 rounded-full shrink-0" style={{ border: `1.5px solid ${selected ? PURPLE : CARD_BORDER}`, backgroundColor: selected ? PURPLE : 'transparent' }}>
                      {selected && <Check size={12} className="text-white" />}
                    </span>
                  </button>
                )
              })}
            </div>

            {step > 0 && (
              <button type="button" onClick={() => setStep(step - 1)} className="mt-8 inline-flex items-center gap-1.5 text-sm hover:opacity-70 self-start" style={{ color: MUTED }}>
                <ArrowLeft size={15} /> Back
              </button>
            )}
          </>
        )}

        {isReveal && (
          <div className="flex-1 flex flex-col justify-center pt-2">
            <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl mb-5" style={{ background: `linear-gradient(140deg, ${PURPLE}, ${PERI})` }}>
              <BrainCircuit size={30} color="#fff" />
            </div>
            <h1 className="pmhnp-serif text-3xl sm:text-[38px] font-semibold leading-tight text-center" style={{ ...SERIF, color: PLUM }}>
              You&rsquo;re all set{firstName ? `, ${firstName}` : ''}.
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-center max-w-md mx-auto" style={{ color: INK }}>
              Start with the Diagnostic Accuracy Blueprint and the CLARITY method. Pass each module&rsquo;s
              knowledge check to unlock the next and earn your CE contact hours.
            </p>
            <div className="mt-8 flex flex-col items-center">
              <button type="button" onClick={goHome}
                className="w-full max-w-md rounded-full py-3.5 text-sm font-semibold text-white transition-colors inline-flex items-center justify-center gap-2"
                style={{ backgroundColor: PURPLE }}>
                Enter the Academy <ArrowRight size={16} />
              </button>
              <p className="mt-3 text-xs" style={{ color: MUTED }}>Evidence-tier, in-scope. Your clinical judgement stays yours.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
