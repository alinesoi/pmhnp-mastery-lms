'use client'
import React from 'react'
import { Space_Grotesk } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-soa-head' })

interface AuthLayoutProps {
  org: any
  welcomeText?: string
  children: React.ReactNode
}

function DropLogo({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <circle cx="22" cy="22" r="22" fill="#2e9bd6" opacity="0.15" />
      <path
        d="M22 9c4.6 5.3 7.5 9.2 7.5 12.9A7.5 7.5 0 0 1 22 29.4a7.5 7.5 0 0 1-7.5-7.5C14.5 18.2 17.4 14.3 22 9z"
        fill="#2e9bd6"
      />
      <circle cx="19.2" cy="21.2" r="2" fill="#dcf1f8" />
    </svg>
  )
}

/* Soft rising bubbles instead of a night sky */
function Bubbles() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 600 800"
      fill="none"
    >
      {[
        [80, 90, 1.6], [180, 60, 1.1], [300, 120, 1.4], [430, 80, 1.0],
        [520, 160, 1.5], [120, 220, 1.0], [380, 240, 1.2], [500, 320, 1.0],
        [70, 380, 1.3], [250, 340, 1.0], [440, 440, 1.4], [150, 520, 1.1],
        [330, 560, 1.0], [530, 600, 1.2], [90, 660, 1.4], [270, 700, 1.0],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#2e9bd6" opacity={0.45} />
      ))}
    </svg>
  )
}

export default function AuthLayout({ org: _org, welcomeText: _welcomeText, children }: AuthLayoutProps) {
  return (
    <div className={`${spaceGrotesk.variable} flex flex-col lg:grid lg:grid-cols-[1fr_600px] min-h-screen`}>
      {/* Mobile header */}
      <div
        className="lg:hidden flex items-center gap-3 px-6 py-5"
        style={{ background: 'linear-gradient(150deg, #12385c 0%, #062033 100%)' }}
      >
        <DropLogo size={30} />
        <span className="soa-auth-head text-[17px] font-semibold" style={{ color: '#eef6fc' }}>
          SmartOps Academy
        </span>
      </div>

      {/* Left panel: deep navy branding */}
      <div
        className="hidden lg:flex relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #12385c 0%, #062033 100%)' }}
      >
        <Bubbles />
        <div className="relative flex items-center gap-3">
          <DropLogo size={36} />
          <span className="soa-auth-head text-[19px] font-semibold" style={{ color: '#eef6fc' }}>
            SmartOps Academy
          </span>
        </div>
        <div className="relative max-w-md">
          <h2 className="soa-auth-head text-4xl font-semibold leading-snug" style={{ color: '#eef6fc' }}>
            Follow the drop,
            <br />
            source to tap.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed" style={{ color: '#a9c6dd' }}>
            Water Treatment Level 1 (Identify). Learn to recognize and name every asset in the
            system, and know when to notice and report a concern.
          </p>
        </div>
        <div className="relative">
          <svg width="220" height="70" viewBox="0 0 220 70" fill="none" aria-hidden="true">
            <path d="M0 52c36-18 76-22 112-10 38-14 74-10 108 6v22H0V52z" fill="#2e9bd6" opacity="0.28" />
            <path d="M0 62c44-14 90-14 132-2 32-8 60-6 88 4v6H0v-8z" fill="#2e9bd6" opacity="0.4" />
          </svg>
        </div>
      </div>

      {/* Right panel: form */}
      <div className="flex flex-col relative flex-1 lg:h-full overflow-auto" style={{ backgroundColor: '#eef6fc' }}>
        <style>{`.soa-auth-head { font-family: var(--font-soa-head), 'Space Grotesk', 'Inter', system-ui, sans-serif; }`}</style>
        {children}
      </div>
    </div>
  )
}
