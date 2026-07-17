'use client'
import React, { use, useEffect, useRef, useState } from 'react'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { askTutor } from '@services/tutor/tutor'
import { Send, Bot, Info, Sparkles, Stethoscope, Pill, ClipboardList } from 'lucide-react'
import {
  SERIF, PLUM, PURPLE, PERI, MAGENTA, LILAC, CARD_BORDER, INK, MUTED,
} from '../_pmhnp/theme'

type ChatMessage = { id: number; from: 'tutor' | 'user'; text: string; time: string; redirected?: boolean }

// Starter prompts, one per framework — keeps learners in-scope.
const MODES = [
  { key: 'clarity', label: 'How does CLARITY structure a diagnostic assessment?', icon: Stethoscope },
  { key: 'treatment', label: 'How does the Treatment Accuracy Blueprint tier the evidence?', icon: Pill },
  { key: 'edit', label: 'How does E.D.I.T. approach a safe taper?', icon: ClipboardList },
]

function TutorAvatar({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center rounded-full shrink-0" style={{ width: size, height: size, background: `linear-gradient(140deg, ${PURPLE}, ${PERI})` }}>
      <Bot size={size * 0.5} color="#fff" />
    </div>
  )
}

export default function TutorPage(props: { params: Promise<{ orgslug: string }> }) {
  use(props.params)
  const session = useLHSession() as any
  const accessToken = session?.data?.tokens?.access_token
  const firstName: string = session?.data?.user?.first_name || ''
  const nowTime = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 1,
      from: 'tutor',
      text: `Hi${firstName ? `, ${firstName}` : ''}. I'm your PMHNP Mastery tutor — think of me as a colleague a few steps ahead, here to reason through the frameworks with you.\n\nAsk me how CLARITY would structure an assessment, how the Treatment Accuracy Blueprint tiers the evidence, or how E.D.I.T. approaches a taper. I answer at evidence-tier and stay in-scope — the clinical judgement stays yours.`,
      time: nowTime(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const idRef = useRef(2)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, isTyping])

  const send = async (text: string) => {
    const t = text.trim()
    if (!t || isTyping) return
    setMessages((prev) => [...prev, { id: idRef.current++, from: 'user', text: t, time: nowTime() }])
    setInput('')
    setIsTyping(true)
    try {
      const res: any = await askTutor(t, accessToken)
      const reply = res?.data?.reply || 'The tutor is unavailable right now. Please try again.'
      const redirected = !!res?.data?.redirected
      setMessages((prev) => [...prev, { id: idRef.current++, from: 'tutor', text: reply, time: nowTime(), redirected }])
    } catch {
      setMessages((prev) => [...prev, { id: idRef.current++, from: 'tutor', text: 'The tutor is unavailable right now. Please try again.', time: nowTime() }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)]" style={{ backgroundColor: LILAC }}>
      <div className="max-w-4xl mx-auto px-6 sm:px-10 pt-6 pb-10 flex flex-col" style={{ minHeight: 'calc(100vh - 56px)' }}>
        <div className="flex items-center gap-3 pb-5" style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
          <TutorAvatar size={36} />
          <div>
            <p className="text-sm font-semibold" style={{ color: PLUM }}>PMHNP Mastery AI Tutor</p>
            <p className="flex items-center gap-1.5 text-xs" style={{ color: MUTED }}>
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: PERI }} />
              Evidence-tier · in-scope
            </p>
          </div>
        </div>

        <div className="pt-6 pb-2">
          <h1 className="pmhnp-serif text-2xl sm:text-3xl leading-tight font-semibold" style={{ ...SERIF, color: PLUM }}>
            Reason through the frameworks
          </h1>
          <p className="mt-2 text-sm" style={{ color: INK }}>Pick a starting point, or just type below.</p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {MODES.map(({ key, label, icon: Icon }) => (
              <button key={key} type="button" onClick={() => send(label)}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm transition-all hover:shadow-sm text-left"
                style={{ border: `1px solid ${CARD_BORDER}`, color: PLUM }}>
                <Icon size={16} style={{ color: PURPLE }} className="shrink-0" /> {label}
              </button>
            ))}
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 py-6 pr-1">
          {messages.map((m) =>
            m.from === 'tutor' ? (
              <div key={m.id} className="flex items-start gap-3 max-w-2xl">
                <TutorAvatar />
                <div>
                  <div className="rounded-2xl rounded-tl-md px-5 py-4 text-sm leading-relaxed whitespace-pre-line"
                    style={{
                      backgroundColor: m.redirected ? '#f8ecf3' : '#ffffff',
                      border: `1px solid ${m.redirected ? '#e6c3d7' : CARD_BORDER}`,
                      color: INK,
                    }}>
                    {m.redirected && (
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: MAGENTA }}>
                        <Info size={12} /> Out of course scope
                      </span>
                    )}
                    {m.text}
                  </div>
                  <p className="mt-1.5 ml-1 text-[11px]" style={{ color: MUTED }}>{m.time}</p>
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-md text-right">
                  <div className="inline-block text-left rounded-2xl rounded-tr-md px-5 py-3.5 text-sm leading-relaxed text-white" style={{ backgroundColor: PURPLE }}>
                    {m.text}
                  </div>
                  <p className="mt-1.5 mr-1 text-[11px]" style={{ color: MUTED }}>{m.time}</p>
                </div>
              </div>
            )
          )}
          {isTyping && (
            <div className="flex items-start gap-3">
              <TutorAvatar />
              <div className="rounded-2xl rounded-tl-md px-5 py-4" style={{ backgroundColor: '#ffffff', border: `1px solid ${CARD_BORDER}` }}>
                <span className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: MUTED, animationDelay: `${i * 200}ms` }} />
                  ))}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 shadow-sm" style={{ border: `1px solid ${CARD_BORDER}` }}>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send(input) }}
            placeholder="Ask how a framework would approach this..." className="flex-1 bg-transparent outline-none text-sm py-1.5"
            style={{ color: INK }} aria-label="Message the tutor" />
          <button type="button" onClick={() => send(input)} className="flex items-center justify-center w-10 h-10 rounded-full transition-colors"
            style={{ backgroundColor: PURPLE }} aria-label="Send message">
            <Send size={16} className="text-white -ml-0.5 mt-0.5" />
          </button>
        </div>
        <p className="mt-3 text-center text-[11px] inline-flex items-center justify-center gap-1.5 w-full" style={{ color: MUTED }}>
          <Sparkles size={12} style={{ color: MAGENTA }} /> Evidence-tier within CLARITY / Treatment Accuracy / E.D.I.T. Out-of-scope questions are redirected; never clinical advice beyond the course.
        </p>
      </div>
    </div>
  )
}
