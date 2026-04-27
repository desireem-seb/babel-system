import { getFrameworks } from '@/lib/data'
import { FrameworkClient } from '@/components/framework/FrameworkClient'

export const dynamic = 'force-dynamic'

export default async function FrameworkPage() {
  const frameworks = await getFrameworks()
  return <FrameworkClient frameworks={frameworks} />
}
