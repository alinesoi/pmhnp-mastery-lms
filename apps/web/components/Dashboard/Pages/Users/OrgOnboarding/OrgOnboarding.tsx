'use client'
import React, { useEffect, useState } from 'react'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useOrg } from '@components/Contexts/OrgContext'
import { getAllOnboarding, OnboardingRow } from '@services/onboarding/onboarding'
import { getAPIUrl } from '@services/config/config'
import { RequestBodyWithAuthHeader } from '@services/utils/ts/requests'
import { ClipboardList } from 'lucide-react'

const COLUMNS: { key: string; label: string }[] = [
  { key: 'sleep_lately', label: 'Sleeping lately' },
  { key: 'challenge', label: 'Biggest challenge' },
  { key: 'fall_asleep_time', label: 'Time to fall asleep' },
  { key: 'usual_bedtime', label: 'Usual bedtime' },
  { key: 'goal', label: 'Goal' },
]

type DisplayRow = {
  user_id: number
  email: string
  username: string
  first_name: string
  last_name: string
  status: 'completed' | 'skipped' | 'not_started'
  completed_at: string
  answers: Record<string, string>
}

function OrgOnboarding() {
  const session = useLHSession() as any
  const org = useOrg() as any
  const accessToken = session?.data?.tokens?.access_token
  const [rows, setRows] = useState<DisplayRow[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!accessToken || !org?.id) return
    const load = async () => {
      try {
        const [onboardingRes, usersRes] = await Promise.all([
          getAllOnboarding(accessToken),
          // backend caps limit at 100
          fetch(
            `${getAPIUrl()}orgs/${org.id}/users?page=1&limit=100`,
            RequestBodyWithAuthHeader('GET', null, null, accessToken)
          ).then((r) => r.json()),
        ])
        if (onboardingRes?.status !== 200 || !Array.isArray(onboardingRes.data)) {
          setError(onboardingRes?.data?.detail || 'Could not load onboarding responses')
          return
        }
        const byUser: Record<number, OnboardingRow> = {}
        for (const r of onboardingRes.data as OnboardingRow[]) byUser[r.user_id] = r
        const members: any[] = Array.isArray(usersRes?.items)
          ? usersRes.items.map((it: any) => it.user)
          : []
        const merged: DisplayRow[] = members.map((u: any) => {
          const r = byUser[u.id]
          return {
            user_id: u.id,
            email: u.email,
            username: u.username,
            first_name: u.first_name,
            last_name: u.last_name,
            status: r ? (r.skipped ? 'skipped' : 'completed') : 'not_started',
            completed_at: r?.completed_at || '',
            answers: r?.answers || {},
          }
        })
        // Members the users endpoint may have missed but who answered anyway
        for (const r of onboardingRes.data as OnboardingRow[]) {
          if (!merged.some((m) => m.user_id === r.user_id)) {
            merged.push({
              user_id: r.user_id,
              email: r.email,
              username: r.username,
              first_name: r.first_name,
              last_name: r.last_name,
              status: r.skipped ? 'skipped' : 'completed',
              completed_at: r.completed_at || '',
              answers: r.answers || {},
            })
          }
        }
        const rank = { completed: 0, skipped: 1, not_started: 2 }
        merged.sort(
          (a, b) =>
            rank[a.status] - rank[b.status] ||
            (b.completed_at || '').localeCompare(a.completed_at || '')
        )
        setRows(merged)
      } catch {
        setError('Could not load onboarding responses')
      }
    }
    load()
  }, [accessToken, org?.id])

  const displayName = (r: DisplayRow) => {
    const full = [r.first_name, r.last_name].filter(Boolean).join(' ')
    return full || r.username || r.email
  }

  const formatDate = (iso: string) => {
    if (!iso) return ''
    try {
      return new Date(iso).toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return iso
    }
  }

  return (
    <div className="ml-4 mr-4 sm:ml-10 sm:mr-10 mb-10">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}
      {!error && rows === null && (
        <div className="text-sm text-gray-400 px-1 py-4">Loading responses...</div>
      )}
      {!error && rows !== null && rows.length === 0 && (
        <div className="flex flex-col items-center text-center py-16 text-gray-400">
          <ClipboardList size={32} className="mb-3" />
          <p className="text-sm font-medium">No members yet</p>
          <p className="text-xs mt-1">
            Answers appear here after members complete the welcome quiz.
          </p>
        </div>
      )}
      {!error && rows !== null && rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg nice-shadow bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3 font-semibold">Member</th>
                <th className="px-4 py-3 font-semibold">Completed</th>
                {COLUMNS.map((c) => (
                  <th key={c.key} className="px-4 py-3 font-semibold">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.user_id} className="align-top hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-gray-800">{displayName(r)}</div>
                    <div className="text-xs text-gray-400">{r.email}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {r.status === 'skipped' && (
                      <span className="inline-block rounded-full bg-gray-100 text-gray-500 text-xs px-2.5 py-1">
                        Skipped
                      </span>
                    )}
                    {r.status === 'not_started' && (
                      <span className="inline-block rounded-full bg-amber-50 text-amber-600 text-xs px-2.5 py-1">
                        Not started
                      </span>
                    )}
                    {r.status === 'completed' && (
                      <span className="text-gray-700">{formatDate(r.completed_at)}</span>
                    )}
                  </td>
                  {COLUMNS.map((c) => (
                    <td key={c.key} className="px-4 py-3 text-gray-700">
                      {r.answers?.[c.key] || <span className="text-gray-300">-</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default OrgOnboarding
