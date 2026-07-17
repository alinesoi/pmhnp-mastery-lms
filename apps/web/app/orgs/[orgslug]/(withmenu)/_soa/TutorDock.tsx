'use client'
import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { getUriWithOrg } from '@services/config/config'
import { askTutor } from '@services/tutor/tutor'
import { Bot, Send, X, Droplet, AlertTriangle, Maximize2 } from 'lucide-react'
import { NAVY, BLUE, CYAN, GOLD, CARD_BORDER, BODY_TEXT, MUTED } from './theme'

type ChatMessage = { id: number; from: 'tutor' | 'user'; text: string; time: string; redirected?: boolean }

function TutorAvatar({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center rounded-full shrink-0" style={{ width: size, height: size, backgroundColor: NAVY }}>
      <Bot size={size * 0.5} style={{ color: CYAN }} />
    </div>
  )
}

/* Always-present, docked AI tutor (Perry: "yes always present"). Friendly avatar
   companion held to Level 1, and every answer ties back to the water journey so the
   learner sees where the current asset sits from source to tap. */
export default function TutorDock({ orgslug }: { orgslug: string }) {
  const pathname = usePathname()
  const session = useLHSession() as any
  const accessToken = session?.data?.tokens?.access_token
  const firstName: string = session?.data?.user?.first_name || ''

  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const idRef = useRef(2)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const nowTime = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 1,
      from: 'tutor',
      text: `Hi${firstName ? `, ${firstName}` : ''}, I am your SmartOps tutor for Water Treatment Level 1 (Identify). I am here the whole way, source to tap.\n\nAsk me what an asset is, what it is called, its basic purpose, or when to notice and report, and I will show you where it sits on the water journey.`,
      time: nowTime(),
    },
  ])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, isTyping, open])

  // Hide on the welcome/onboarding screen: the learner is just listening there.
  const onWelcome = !!pathname && pathname.endsWith('/welcome')
  if (onWelcome) return null

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
    <>
      {/* Floating launcher */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 flex items-center gap-2.5 rounded-full pl-2 pr-4 py-2 shadow-lg transition-transform hover:scale-[1.03]"
          style={{ zIndex: 90, backgroundColor: NAVY, border: '1px solid rgba(46,155,214,0.4)' }}
          aria-label="Open AI tutor"
        >
          <TutorAvatar size={34} />
          <span className="text-[13px] font-semibold" style={{ color: '#dcf1f8' }}>Ask the tutor</span>
        </button>
      )}

      {/* Docked chat panel */}
      {open && (
        <div
          className="fixed bottom-5 right-5 flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden"
          style={{ zIndex: 90, width: 'min(370px, calc(100vw - 24px))', height: 'min(560px, calc(100vh - 90px))', border: `1px solid ${CARD_BORDER}` }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3" style={{ backgroundColor: NAVY }}>
            <TutorAvatar size={34} />
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-semibold leading-tight" style={{ color: '#dcf1f8' }}>SmartOps Tutor</p>
              <p className="flex items-center gap-1.5 text-[11px]" style={{ color: 'rgba(220,241,248,0.7)' }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CYAN }} />
                Level 1 (Identify) · always here
              </p>
            </div>
            <Link href={getUriWithOrg(orgslug, '/tutor')} title="Open full tutor" className="p-1.5 rounded-lg transition-colors" style={{ color: 'rgba(220,241,248,0.75)' }}>
              <Maximize2 size={16} />
            </Link>
            <button type="button" onClick={() => setOpen(false)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'rgba(220,241,248,0.75)' }} aria-label="Close tutor">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 px-3.5 py-4" style={{ backgroundColor: '#f6fafd' }}>
            {messages.map((m) =>
              m.from === 'tutor' ? (
                <div key={m.id} className="flex items-start gap-2">
                  <TutorAvatar size={26} />
                  <div className="max-w-[85%]">
                    <div className="rounded-2xl rounded-tl-md px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-line"
                      style={{ backgroundColor: m.redirected ? '#fef6e7' : '#ffffff', border: `1px solid ${m.redirected ? '#f0dcae' : CARD_BORDER}`, color: BODY_TEXT }}>
                      {m.redirected && (
                        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: GOLD }}>
                          <AlertTriangle size={11} /> Out of Level 1 scope
                        </span>
                      )}
                      {m.text}
                    </div>
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-md px-3.5 py-2.5 text-[13px] leading-relaxed text-white" style={{ backgroundColor: BLUE }}>
                    {m.text}
                  </div>
                </div>
              )
            )}
            {isTyping && (
              <div className="flex items-start gap-2">
                <TutorAvatar size={26} />
                <div className="rounded-2xl rounded-tl-md px-4 py-3" style={{ backgroundColor: '#ffffff', border: `1px solid ${CARD_BORDER}` }}>
                  <span className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: MUTED, animationDelay: `${i * 200}ms` }} />
                    ))}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-3 py-2.5" style={{ borderTop: `1px solid ${CARD_BORDER}`, backgroundColor: '#ffffff' }}>
            <div className="flex items-center gap-2 rounded-full px-3.5 py-1.5" style={{ border: `1px solid ${CARD_BORDER}` }}>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') send(input) }}
                placeholder="Ask me to identify something..." className="flex-1 bg-transparent outline-none text-[13px] py-1"
                style={{ color: BODY_TEXT }} aria-label="Message the tutor" />
              <button type="button" onClick={() => send(input)} className="flex items-center justify-center w-8 h-8 rounded-full shrink-0" style={{ backgroundColor: BLUE }} aria-label="Send">
                <Send size={14} className="text-white -ml-0.5" />
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10.5px] inline-flex items-center justify-center gap-1 w-full" style={{ color: MUTED }}>
              <Droplet size={11} style={{ color: CYAN }} /> Held to Level 1, tied to the water journey.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
