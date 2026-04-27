import { getFrameworks, getCampaign } from '@/lib/data'
import { JourneyClient } from '@/components/journey/JourneyClient'

export const dynamic = 'force-dynamic'

export default async function JourneyPage() {
  const frameworks = await getFrameworks()
  const defaultProduct = frameworks[0]?.id
  const campaign = defaultProduct ? await getCampaign(defaultProduct) : null

  return <JourneyClient frameworks={frameworks} initialCampaign={campaign} />
}
