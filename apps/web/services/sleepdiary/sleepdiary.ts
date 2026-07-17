import { getAPIUrl } from '@services/config/config'
import {
  RequestBodyWithAuthHeader,
  getResponseMetadata,
} from '@services/utils/ts/requests'

export type SleepDiaryEntry = {
  id?: number
  entry_date: string
  bedtime?: string | null
  waketime?: string | null
  quality?: number | null
  note?: string | null
}

export async function getSleepDiaryEntries(days: number, access_token: string) {
  const result = await fetch(
    `${getAPIUrl()}sleepdiary?days=${days}`,
    RequestBodyWithAuthHeader('GET', null, null, access_token)
  )
  return getResponseMetadata(result)
}

export async function upsertSleepDiaryEntry(
  entry: SleepDiaryEntry,
  access_token: string
) {
  const result = await fetch(
    `${getAPIUrl()}sleepdiary`,
    RequestBodyWithAuthHeader('PUT', entry, null, access_token)
  )
  return getResponseMetadata(result)
}

export async function deleteSleepDiaryEntry(
  entry_date: string,
  access_token: string
) {
  const result = await fetch(
    `${getAPIUrl()}sleepdiary/${entry_date}`,
    RequestBodyWithAuthHeader('DELETE', null, null, access_token)
  )
  return getResponseMetadata(result)
}
