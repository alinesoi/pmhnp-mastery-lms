import { getAPIUrl } from '@services/config/config'
import { RequestBodyWithAuthHeader } from '@services/utils/ts/requests'

export type HabitLog = {
  id?: number
  user_id?: number
  habit_key: string
  entry_date: string
  done: boolean
  note?: string | null
}

export async function listHabitLogs(days: number, access_token: string): Promise<HabitLog[]> {
  const res = await fetch(
    `${getAPIUrl()}habits?days=${days}`,
    RequestBodyWithAuthHeader('GET', null, null, access_token)
  )
  if (!res.ok) return []
  return res.json()
}

export async function upsertHabitLog(
  payload: { habit_key: string; entry_date: string; done: boolean; note?: string | null },
  access_token: string
): Promise<HabitLog | null> {
  const res = await fetch(
    `${getAPIUrl()}habits`,
    RequestBodyWithAuthHeader('PUT', payload, null, access_token)
  )
  if (!res.ok) return null
  return res.json()
}
