import { getAPIUrl } from '@services/config/config'
import {
  RequestBodyWithAuthHeader,
  getResponseMetadata,
} from '@services/utils/ts/requests'

export type TutorReply = {
  reply: string
  redirected: boolean
  evidence_tier: boolean
  placeholder: boolean
}

export async function askTutor(message: string, access_token: string) {
  const result = await fetch(
    `${getAPIUrl()}tutor`,
    RequestBodyWithAuthHeader('POST', { message }, null, access_token)
  )
  return getResponseMetadata(result)
}
