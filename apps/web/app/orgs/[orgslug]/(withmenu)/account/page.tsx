import { redirect } from 'next/navigation'
import { getUriWithOrg } from '@services/config/config'

const AccountPage = async (props: { params: Promise<{ orgslug: string }> }) => {
  const params = await props.params
  redirect(getUriWithOrg(params.orgslug, '/account/general'))
}

export default AccountPage
