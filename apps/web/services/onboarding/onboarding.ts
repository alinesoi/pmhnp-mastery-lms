import { getAPIUrl } from '@services/config/config'
import {
  RequestBodyWithAuthHeader,
  getResponseMetadata,
} from '@services/utils/ts/requests'

export type OnboardingAnswers = Record<string, string>

export type OnboardingStatus = {
  completed: boolean
  skipped: boolean
  answers: OnboardingAnswers
  completed_at?: string
}

export type OnboardingRow = {
  user_id: number
  username: string
  email: string
  first_name: string
  last_name: string
  answers: OnboardingAnswers
  skipped: boolean
  completed_at: string
}

export async function getMyOnboarding(access_token: string) {
  const result = await fetch(
    `${getAPIUrl()}onboarding`,
    RequestBodyWithAuthHeader('GET', null, null, access_token)
  )
  return getResponseMetadata(result)
}

export async function saveOnboarding(
  answers: OnboardingAnswers,
  skipped: boolean,
  access_token: string
) {
  const result = await fetch(
    `${getAPIUrl()}onboarding`,
    RequestBodyWithAuthHeader('PUT', { answers, skipped }, null, access_token)
  )
  return getResponseMetadata(result)
}

export async function getAllOnboarding(access_token: string) {
  const result = await fetch(
    `${getAPIUrl()}onboarding/all`,
    RequestBodyWithAuthHeader('GET', null, null, access_token)
  )
  return getResponseMetadata(result)
}
