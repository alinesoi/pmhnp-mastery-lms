'use client'
import React, { Suspense, useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'
import { getPOSTHOG_KEY_VAL } from '@services/config/config'
import { useLHSession } from '@components/Contexts/LHSessionContext'

let initialized = false

function initPostHog(key: string) {
  if (initialized || typeof window === 'undefined') return
  initialized = true
  posthog.init(key, {
    // Same-origin reverse proxy (see next.config.js rewrites) so adblockers
    // don't strip ingestion. ui_host keeps "open in PostHog" links working.
    api_host: '/ingest',
    ui_host: 'https://us.posthog.com',
    persistence: 'localStorage+cookie',
    autocapture: true,
    capture_pageview: false, // fired manually by PostHogPageView (App Router)
    capture_pageleave: true,
    // Session replay ON with visible page content so support can debug real
    // sessions; inputs stay masked so passwords/typed PII never leak.
    disable_session_recording: false,
    session_recording: {
      maskAllInputs: true,
    },
  })
}

/**
 * Disables ALL PostHog capture (autocapture, pageviews, session replay) while
 * the user is in the super-admin area (/admin) — that's the platform owner's
 * internal dashboard and is intentionally untracked. Re-enables elsewhere.
 */
function PostHogAdminGuard() {
  const posthogClient = usePostHog()
  const pathname = usePathname()

  useEffect(() => {
    if (!posthogClient) return
    const isAdmin = pathname?.startsWith('/admin')
    if (isAdmin) {
      if (!posthogClient.has_opted_out_capturing()) posthogClient.opt_out_capturing()
    } else if (posthogClient.has_opted_out_capturing()) {
      posthogClient.opt_in_capturing()
    }
  }, [posthogClient, pathname])

  return null
}

/** Fires PostHog's native $pageview on every App Router navigation. */
function PostHogPageView() {
  const posthogClient = usePostHog()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!posthogClient || !pathname) return
    // Never emit pageviews for the super-admin area.
    if (pathname.startsWith('/admin')) return
    let url = window.origin + pathname
    const qs = searchParams?.toString()
    if (qs) url += `?${qs}`
    posthogClient.capture('$pageview', { $current_url: url })
  }, [posthogClient, pathname, searchParams])

  return null
}

/**
 * Identifies the user across ALL auth paths and resets on logout/expiry.
 * Watches the central session (AuthContext) so credentials, Google, SSO,
 * token-exchange, cross-tab logout and 401 expiry are all covered from one place.
 */
function PostHogIdentify() {
  const posthogClient = usePostHog()
  const session = useLHSession() as any
  const status = session?.status
  const user = session?.data?.user
  const identifiedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!posthogClient) return

    if (status === 'authenticated' && user?.user_uuid) {
      if (identifiedRef.current !== user.user_uuid) {
        identifiedRef.current = user.user_uuid
        posthogClient.identify(String(user.user_uuid), {
          email: user.email,
          username: user.username,
        })
      }
      return
    }

    if (status === 'unauthenticated' && identifiedRef.current) {
      identifiedRef.current = null
      posthogClient.reset()
    }
  }, [posthogClient, status, user?.user_uuid, user?.email, user?.username])

  return null
}

/**
 * Mounts PostHog when NEXT_PUBLIC_POSTHOG_KEY is set; otherwise renders children
 * untouched and never loads PostHog (true off-switch / opt-in).
 */
export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  const key = getPOSTHOG_KEY_VAL()
  // Trackers must not mount until posthog.init has run: React runs child
  // effects before parent effects, so an unguarded PostHogPageView would
  // capture $pageview on an uninitialized client and the event is dropped.
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (key) {
      initPostHog(key)
      setReady(true)
    }
  }, [key])

  if (!key) return <>{children}</>

  return (
    <PHProvider client={posthog}>
      {ready && (
        <>
          <PostHogAdminGuard />
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          <PostHogIdentify />
        </>
      )}
      {children}
    </PHProvider>
  )
}
