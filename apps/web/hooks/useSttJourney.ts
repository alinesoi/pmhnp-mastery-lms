'use client'

import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useOrg } from '@components/Contexts/OrgContext'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useCourses } from '@/hooks/queries/useCourses'
import { useTrail } from '@/hooks/queries/useTrail'
import { getCourseMetadata } from '@services/courses/courses'
import { queryKeys } from '@/lib/query/keys'
import { getUriWithOrg } from '@services/config/config'

/* Canonical Sleep to Thrive path order. Course names in the backend are
   matched by keyword so renames in the dashboard don't break the ordering. */
export const SESSION_PATH: { title: string; keywords: string[] }[] = [
  { title: 'Welcome', keywords: ['welcome', 'introduction', 'intro'] },
  { title: 'Reset Your Rhythm', keywords: ['rhythm', 'reset'] },
  { title: 'Calm Your System', keywords: ['calm your system', 'calm'] },
  { title: 'Understand Your Sleep', keywords: ['understand'] },
  { title: 'Cultivate Sleep Skills', keywords: ['cultivate', 'skills'] },
  { title: 'Sleep for the Frontline', keywords: ['frontline'] },
]

export type SttSession = {
  index: number
  course: any
  href: string
  totalActivities: number
  completedActivities: number
  percent: number
  isStarted: boolean
  isComplete: boolean
}

export type SttBadgeState = {
  id: string
  earned: boolean
}

export function useSttJourney(orgslug: string) {
  const org = useOrg() as any
  const session = useLHSession() as any
  const accessToken = session?.data?.tokens?.access_token as string | undefined
  const { data: coursesData, isLoading: coursesLoading } = useCourses(orgslug)
  const { data: trailData, isLoading: trailLoading } = useTrail(org?.id)

  const orderedCourses = useMemo(() => {
    const list = Array.isArray(coursesData) ? coursesData : []
    const used = new Set<string>()
    const ordered: (any | null)[] = SESSION_PATH.map((entry) => {
      const match = list.find((c: any) => {
        if (!c?.course_uuid || used.has(c.course_uuid)) return false
        const name = String(c?.name || '').toLowerCase()
        return entry.keywords.some((k) => name.includes(k))
      })
      if (match) used.add(match.course_uuid)
      return match || null
    })
    return ordered
  }, [coursesData])

  const metaQueries = useQueries({
    queries: orderedCourses.map((course) => {
      const cleanUuid = course?.course_uuid
        ? String(course.course_uuid).replace('course_', '')
        : ''
      return {
        queryKey: queryKeys.courses.meta(cleanUuid),
        queryFn: () => getCourseMetadata(cleanUuid, {}, accessToken, { slim: true }),
        enabled: !!cleanUuid && !!accessToken,
        staleTime: 300_000,
        refetchOnWindowFocus: false,
      }
    }),
  })

  return useMemo(() => {
    const runs: any[] = Array.isArray(trailData?.runs) ? trailData.runs : []

    const findRun = (course: any) => {
      if (!course?.course_uuid) return null
      const clean = String(course.course_uuid).replace('course_', '')
      return (
        runs.find(
          (r: any) => String(r.course?.course_uuid || '').replace('course_', '') === clean
        ) || null
      )
    }

    const sessions: SttSession[] = orderedCourses
      .map((course, index) => {
        if (!course) return null
        const cleanUuid = String(course.course_uuid).replace('course_', '')
        const run = findRun(course)
        const meta: any = metaQueries[index]?.data
        const metaTotal = Array.isArray(meta?.chapters)
          ? meta.chapters.reduce(
              (sum: number, ch: any) => sum + (ch.activities?.length || 0),
              0
            )
          : 0
        const totalActivities = metaTotal || run?.course_total_steps || 0
        const completedActivities = Array.isArray(run?.steps)
          ? run.steps.filter((s: any) => s.complete).length
          : 0
        const percent =
          totalActivities > 0
            ? Math.min(100, Math.round((completedActivities / totalActivities) * 100))
            : 0
        return {
          index,
          course,
          href: getUriWithOrg(orgslug, `/course/${cleanUuid}`),
          totalActivities,
          completedActivities,
          percent,
          isStarted: !!run,
          isComplete: totalActivities > 0 && completedActivities >= totalActivities,
        }
      })
      .filter(Boolean) as SttSession[]

    const totalSessions = sessions.length
    const sessionsCompleted = sessions.filter((s) => s.isComplete).length
    const totalActivities = sessions.reduce((sum, s) => sum + s.totalActivities, 0)
    const completedActivities = sessions.reduce((sum, s) => sum + s.completedActivities, 0)
    const overallPercent =
      totalActivities > 0
        ? Math.min(100, Math.round((completedActivities / totalActivities) * 100))
        : 0
    const nextSession = sessions.find((s) => !s.isComplete) || null

    // Practice history derived from completed trail steps. Backend timestamps
    // are UTC but carry no zone marker, so append Z before parsing; otherwise
    // they'd be read as local time and shift streaks/morning stats by the
    // viewer's UTC offset. Day boundaries then use the viewer's local time.
    const completedSteps: Date[] = []
    runs.forEach((r: any) => {
      ;(r.steps || []).forEach((s: any) => {
        if (!s.complete) return
        const raw = String(s.update_date || s.creation_date || '')
        const iso = raw.replace(' ', 'T')
        const d = new Date(/[Zz]$|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`)
        if (!isNaN(d.getTime())) completedSteps.push(d)
      })
    })

    const dayKey = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`
    const practiceDaySet = new Set(completedSteps.map(dayKey))
    const practiceDays = practiceDaySet.size
    const morningPractices = completedSteps.filter((d) => d.getHours() < 12).length

    let dayStreak = 0
    if (practiceDays > 0) {
      const cursor = new Date()
      // A streak survives if the most recent practice was today or yesterday.
      if (!practiceDaySet.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
      while (practiceDaySet.has(dayKey(cursor))) {
        dayStreak += 1
        cursor.setDate(cursor.getDate() - 1)
      }
    }

    const practicesCompleted = completedActivities

    const badges: SttBadgeState[] = [
      { id: 'new-journey', earned: sessionsCompleted >= 1 },
      { id: 'seven-night-rhythm', earned: dayStreak >= 7 },
      { id: 'early-bird', earned: morningPractices >= 1 },
      { id: 'deep-rest', earned: practiceDays >= 10 },
      { id: 'self-care', earned: false }, // live check-ins launch later
    ]
    const badgesEarned = badges.filter((b) => b.earned).length

    return {
      isLoading: coursesLoading || trailLoading,
      sessions,
      totalSessions,
      sessionsCompleted,
      overallPercent,
      nextSession,
      practicesCompleted,
      practiceDays,
      dayStreak,
      morningPractices,
      badges,
      badgesEarned,
    }
  }, [orderedCourses, metaQueries, trailData, orgslug, coursesLoading, trailLoading])
}
