'use client';
import { use, useState, useEffect } from 'react'
import '@styles/globals.css'
import '@styles/pmhnp-theme.css'
import { SessionGate, useLHSession } from '@components/Contexts/LHSessionContext'
import { OrgJoinBannerProvider } from '@components/Objects/Banners/OrgJoinBanner'
import { PodcastPlayerProvider } from '@components/Contexts/PodcastPlayerContext'
import dynamic from 'next/dynamic'
const PodcastPlayer = dynamic(() => import('@components/Objects/Podcasts/PodcastPlayer'), { ssr: false })
import Link from 'next/link'
import { PageViewTracker } from '@components/Analytics/PageViewTracker'
import { usePathname } from 'next/navigation'
import { getUriWithOrg } from '@services/config/config'
import { getMyOnboarding } from '@services/onboarding/onboarding'
import { signOut } from '@components/Contexts/AuthContext'
import { Fraunces } from 'next/font/google'
import {
  Home,
  LayoutGrid,
  Waypoints,
  Award,
  MessagesSquare,
  Settings,
  LogOut,
  Menu,
  X,
  BrainCircuit,
} from 'lucide-react'
import { PLUM, PLUM_DEEP, PURPLE, PERI, LILAC, TAGLINE } from './_pmhnp/theme'
// import TutorDock from './_pmhnp/TutorDock' // gated off until real-LLM tutor ships
import AdminButton from './_pmhnp/AdminButton'
import { PmhnpCoursesProvider } from './_pmhnp/CoursesContext'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-pmhnp-head',
  display: 'swap',
})

/* PMHNP mark: a brain-lattice glyph on a plum disc, purple->periwinkle */
function PmhnpLogo({ size = 40 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl shrink-0"
      style={{ width: size, height: size, background: `linear-gradient(140deg, ${PURPLE}, ${PERI})` }}
      aria-hidden="true"
    >
      <BrainCircuit size={size * 0.55} color="#fff" strokeWidth={1.7} />
    </div>
  )
}

function PmhnpSidebar({ orgslug }: { orgslug: string }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // `soon` items render as a disabled entry with a "Soon" pill and are not
  // navigable. AI Tutor is gated off until the graded, real-LLM tutor ships.
  const NAV_ITEMS: { label: string; path: string; icon: any; soon?: boolean }[] = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Course Catalog', icon: LayoutGrid, path: '/courses' },
    { label: 'My Learning', icon: Waypoints, path: '/journey' },
    { label: 'Community', icon: MessagesSquare, path: '/community' },
    { label: 'Progress & Certificate', icon: Award, path: '/progress' },
  ]

  const isActive = (navPath: string) => {
    const full = getUriWithOrg(orgslug, navPath)
    if (navPath === '/') return pathname === full || pathname === full + '/'
    if (navPath === '/journey') {
      return (
        pathname?.startsWith(full) ||
        pathname?.startsWith(getUriWithOrg(orgslug, '/module/')) ||
        pathname?.startsWith(getUriWithOrg(orgslug, '/course/')) ||
        false
      )
    }
    return pathname?.startsWith(full) || false
  }

  const navList = (
    <ul className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.path)
        const Icon = item.icon

        if (item.soon) {
          return (
            <li key={item.path}>
              <div
                aria-disabled="true"
                title="Coming soon"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium cursor-not-allowed select-none"
                style={{ color: 'rgba(246,243,251,0.4)' }}
              >
                <Icon size={18} strokeWidth={1.8} style={{ color: 'rgba(246,243,251,0.35)' }} />
                <span>{item.label}</span>
                <span
                  className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                  style={{ backgroundColor: 'rgba(124,159,214,0.22)', color: PERI }}
                >
                  Soon
                </span>
              </div>
            </li>
          )
        }

        return (
          <li key={item.path}>
            <Link
              href={getUriWithOrg(orgslug, item.path)}
              onClick={() => setMobileOpen(false)}
              className={
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] transition-all ' +
                (active ? 'font-semibold' : 'font-medium')
              }
              style={{
                backgroundColor: active ? 'rgba(124,159,214,0.18)' : undefined,
                color: active ? '#ffffff' : 'rgba(246,243,251,0.72)',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} style={{ color: active ? PERI : 'rgba(246,243,251,0.6)' }} />
              <span>{item.label}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )

  const bottomBlock = (
    <div className="px-4 pb-5 space-y-3">
      <div
        className="rounded-2xl px-3.5 py-3"
        style={{ backgroundColor: PLUM_DEEP, border: '1px solid rgba(124,159,214,0.24)' }}
      >
        <p className="pmhnp-serif text-[12.5px] leading-snug font-medium italic" style={{ color: '#efe9fb' }}>
          {TAGLINE}
        </p>
      </div>
      <div className="space-y-1">
        <Link
          href={getUriWithOrg(orgslug, '/account')}
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13.5px] font-medium transition-colors"
          style={{ color: 'rgba(246,243,251,0.6)' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Settings size={17} strokeWidth={1.8} />
          <span>Account</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13.5px] font-medium transition-colors"
          style={{ color: 'rgba(246,243,251,0.6)' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <LogOut size={17} strokeWidth={1.8} />
          <span>Log out</span>
        </button>
      </div>
    </div>
  )

  const logoBlock = (
    <Link href={getUriWithOrg(orgslug, '/')} onClick={() => setMobileOpen(false)}>
      <div className="flex items-center gap-3 px-5 pt-6 pb-5">
        <PmhnpLogo />
        <span
          className="pmhnp-serif text-[15px] leading-tight font-semibold tracking-wide"
          style={{ color: '#efe9fb' }}
        >
          PMHNP
          <br />
          Mastery Academy
        </span>
      </div>
    </Link>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div
        className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 md:hidden"
        style={{ zIndex: 60, backgroundColor: PLUM, borderBottom: '1px solid rgba(124,159,214,0.24)' }}
      >
        <Link href={getUriWithOrg(orgslug, '/')} className="flex items-center gap-2">
          <PmhnpLogo size={30} />
          <span className="pmhnp-serif text-[14px] font-semibold" style={{ color: '#efe9fb' }}>
            PMHNP Mastery Academy
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2"
          style={{ color: '#efe9fb' }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex md:flex-col fixed left-0 top-0 bottom-0 w-[236px]"
        style={{ zIndex: 50, backgroundColor: PLUM, borderRight: '1px solid rgba(124,159,214,0.18)' }}
      >
        {logoBlock}
        <nav className="flex-1 px-4 py-2 overflow-y-auto">{navList}</nav>
        {bottomBlock}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 md:hidden"
            style={{ zIndex: 70 }}
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="fixed left-0 top-0 bottom-0 w-[260px] md:hidden shadow-xl flex flex-col"
            style={{ zIndex: 80, backgroundColor: PLUM }}
          >
            {logoBlock}
            <nav className="flex-1 px-4 py-2 overflow-y-auto">{navList}</nav>
            {bottomBlock}
          </aside>
        </>
      )}
    </>
  )
}

/* Everything in this shell is learner-only: anonymous visitors go straight
   to the login screen instead of browsing course content. */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const session = useLHSession() as any
  const status = session?.status

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.replace('/login')
    }
  }, [status])

  if (status !== 'authenticated') {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: LILAC }}
      >
        <div
          className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: `${PURPLE} transparent ${PURPLE} ${PURPLE}` }}
          aria-label="Loading"
        />
      </div>
    )
  }

  return <>{children}</>
}

/* On first login, route members who have not finished (or skipped) the
   welcome quiz to /welcome. Cheap: one call per session, short-circuited by a
   sessionStorage flag once we know they are past onboarding. */
function OnboardingGate({ children, orgslug }: { children: React.ReactNode; orgslug: string }) {
  const session = useLHSession() as any
  const pathname = usePathname()
  const accessToken = session?.data?.tokens?.access_token
  const onWelcome = !!pathname && pathname.endsWith('/welcome')

  useEffect(() => {
    if (!accessToken || onWelcome) return
    try {
      if (sessionStorage.getItem('pmhnp_onboarded') === '1') return
    } catch {}
    let cancelled = false
    getMyOnboarding(accessToken)
      .then((res: any) => {
        if (cancelled || res?.status !== 200 || !res?.data) return
        const d = res.data
        if (!d.completed && !d.skipped) {
          window.location.href = getUriWithOrg(orgslug, '/welcome')
        } else {
          try { sessionStorage.setItem('pmhnp_onboarded', '1') } catch {}
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [accessToken, onWelcome, orgslug])

  return <>{children}</>
}

function LayoutContent({ children, orgslug }: { children: React.ReactNode; orgslug: string }) {
  return (
    <div
      className={`pmhnp-app ${fraunces.variable} flex flex-col min-h-screen`}
      style={{ backgroundColor: LILAC }}
    >
      <PageViewTracker />
      <AdminButton />
      <PmhnpSidebar orgslug={orgslug} />
      <div className="md:ml-[236px] flex-1 flex flex-col">
        <div className="h-14 md:hidden" />
        <div className="flex-1 relative" style={{ zIndex: 'var(--z-content)' }}>
          {children}
        </div>
      </div>
      {/* AI Tutor gated off until the real-LLM tutor ships (currently placeholder). */}
      {/* <TutorDock orgslug={orgslug} /> */}
    </div>
  )
}

export default function RootLayout(
  props: {
    children: React.ReactNode
    params: Promise<any>
  }
) {
  const params = use(props.params);

  const {
    children
  } = props;

  return (
    <>
      <SessionGate>
      <RequireAuth>
      <OrgJoinBannerProvider>
        <PodcastPlayerProvider>
          <PmhnpCoursesProvider>
            <LayoutContent orgslug={params?.orgslug}>
              <OnboardingGate orgslug={params?.orgslug}>
                {children}
              </OnboardingGate>
            </LayoutContent>
          </PmhnpCoursesProvider>
          <PodcastPlayer />
        </PodcastPlayerProvider>
      </OrgJoinBannerProvider>
      </RequireAuth>
      </SessionGate>
    </>
  )
}
