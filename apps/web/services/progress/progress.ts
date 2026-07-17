import { getAPIUrl } from '@services/config/config'
import {
  RequestBodyWithAuthHeader,
  getResponseMetadata,
} from '@services/utils/ts/requests'

export type ModuleProgressRow = {
  module_index: number
  module_slug: string
  check_score: number
  passed: boolean
  completed: boolean
  completed_at?: string | null
}

export type ProgressSummary = {
  course_slug: string
  course_title: string
  total_modules: number
  pass_mark: number
  final_pass_mark: number
  passed_count: number
  unlocked_modules: number[]
  next_module: number | null
  ce_total: number
  ce_earned: number
  certificate_eligible: boolean
  percent_complete: number
}

export type ProgressResponse = {
  modules: ModuleProgressRow[]
  summary: ProgressSummary
}

export type AllProgressResponse = {
  courses: ProgressSummary[]
  ce_earned_total: number
  ce_available_total: number
}

export const DEFAULT_COURSE_SLUG = 'diagnostic-accuracy-blueprint'

export async function getMyProgress(
  access_token: string,
  courseSlug: string = DEFAULT_COURSE_SLUG
) {
  const result = await fetch(
    `${getAPIUrl()}progress?course_slug=${courseSlug}`,
    RequestBodyWithAuthHeader('GET', null, null, access_token)
  )
  return getResponseMetadata(result)
}

export async function getAllProgress(access_token: string) {
  const result = await fetch(
    `${getAPIUrl()}progress/all`,
    RequestBodyWithAuthHeader('GET', null, null, access_token)
  )
  return getResponseMetadata(result)
}

export async function saveModuleProgress(
  courseSlug: string,
  moduleIndex: number,
  moduleSlug: string,
  checkScore: number,
  completed: boolean,
  access_token: string
) {
  const result = await fetch(
    `${getAPIUrl()}progress`,
    RequestBodyWithAuthHeader(
      'PUT',
      {
        course_slug: courseSlug,
        module_index: moduleIndex,
        module_slug: moduleSlug,
        check_score: checkScore,
        completed,
      },
      null,
      access_token
    )
  )
  return getResponseMetadata(result)
}

export async function getCertificate(
  access_token: string,
  courseSlug: string = DEFAULT_COURSE_SLUG
) {
  const result = await fetch(
    `${getAPIUrl()}progress/certificate?course_slug=${courseSlug}`,
    RequestBodyWithAuthHeader('GET', null, null, access_token)
  )
  return getResponseMetadata(result)
}
