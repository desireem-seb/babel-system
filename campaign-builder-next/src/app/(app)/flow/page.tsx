import { getFrameworks, getCampaign } from '@/lib/data'
import { FlowClient } from '@/components/flow/FlowClient'

export const dynamic = 'force-dynamic'

export default async function FlowPage() {
  const frameworks = await getFrameworks()
  const defaultProduct = frameworks[0]?.id
  const campaign = defaultProduct ? await getCampaign(defaultProduct) : null

  return <FlowClient frameworks={frameworks} initialCampaign={campaign} />
}
