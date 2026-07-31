'use client'
import React from 'react'
import { Fraunces } from 'next/font/google'

const fraunces = Fraunces({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-pmhnp-head' })

interface AuthLayoutProps {
  org: any
  welcomeText?: string
  children: React.ReactNode
}

function BrandMark({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="42" height="42" rx="12" fill="#5b3d8c" />
      <rect x="1" y="1" width="42" height="42" rx="12" fill="url(#pmhnpGrad)" opacity="0.9" />
      <path
        d="M22 11l2.4 6.1 6.6.4-5.1 4.2 1.7 6.4L22 24.9l-5.6 3.2 1.7-6.4-5.1-4.2 6.6-.4L22 11z"
        fill="#e7dff5"
      />
      <defs>
        <linearGradient id="pmhnpGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6d4aa6" />
          <stop offset="1" stopColor="#2a1e4a" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/* Soft ambient sparks in the brand palette */
function SoftSparks() {
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
        <circle key={i} cx={x} cy={y} r={r} fill={i % 3 === 0 ? '#b0568a' : '#7c9fd6'} opacity={0.4} />
      ))}
    </svg>
  )
}

export default function AuthLayout({ org: _org, welcomeText: _welcomeText, children }: AuthLayoutProps) {
  return (
    <div className={`${fraunces.variable} flex flex-col lg:grid lg:grid-cols-[1fr_600px] min-h-screen`}>
      {/* Mobile header */}
      <div
        className="lg:hidden flex items-center gap-3 px-6 py-5"
        style={{ background: 'linear-gradient(150deg, #2a1e4a 0%, #1f1638 100%)' }}
      >
        <BrandMark size={30} />
        <span className="pmhnp-auth-head text-[17px] font-semibold" style={{ color: '#f6f3fb' }}>
          PMHNP Mastery Academy
        </span>
      </div>

      {/* Left panel: deep plum branding */}
      <div
        className="hidden lg:flex relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #2a1e4a 0%, #1f1638 100%)' }}
      >
        <SoftSparks />
        <div className="relative flex items-center gap-3">
          <BrandMark size={36} />
          <span className="pmhnp-auth-head text-[19px] font-semibold" style={{ color: '#f6f3fb' }}>
            PMHNP Mastery Academy
          </span>
        </div>
        <div className="relative max-w-md">
          <h2 className="pmhnp-auth-head text-4xl font-semibold leading-snug" style={{ color: '#f6f3fb' }}>
            Think Critically.
            <br />
            Diagnose Confidently.
            <br />
            Prescribe with Purpose.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed" style={{ color: '#c9bce4' }}>
            Accreditation-ready continuing education for psychiatric nurse practitioners:
            diagnostic accuracy, treatment planning, and safe deprescribing.
          </p>
        </div>
        <div className="relative">
          <svg width="220" height="70" viewBox="0 0 220 70" fill="none" aria-hidden="true">
            <path d="M0 52c36-18 76-22 112-10 38-14 74-10 108 6v22H0V52z" fill="#7c9fd6" opacity="0.24" />
            <path d="M0 62c44-14 90-14 132-2 32-8 60-6 88 4v6H0v-8z" fill="#b0568a" opacity="0.32" />
          </svg>
        </div>
      </div>

      {/* Right panel: form */}
      <div className="flex flex-col relative flex-1 lg:h-full overflow-auto" style={{ backgroundColor: '#f6f3fb' }}>
        <style>{`.pmhnp-auth-head { font-family: var(--font-pmhnp-head), 'Fraunces', 'Georgia', serif; }`}</style>
        {children}
      </div>
    </div>
  )
}
