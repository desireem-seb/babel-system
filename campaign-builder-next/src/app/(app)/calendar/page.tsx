import { getFrameworks, getCampaign } from '@/lib/data'
import { CalendarClient } from '@/components/calendar/CalendarClient'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const frameworks = await getFrameworks()
  const defaultProduct = frameworks[0]?.id
  const campaign = defaultProduct ? await getCampaign(defaultProduct) : null

  return <CalendarClient frameworks={frameworks} initialCampaign={campaign} />
}
