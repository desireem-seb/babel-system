import { getFrameworks } from '@/lib/data'
import { GeneratorClient } from '@/components/generator/GeneratorClient'

export const dynamic = 'force-dynamic'

export default async function GeneratorPage() {
  const frameworks = await getFrameworks()
  return <GeneratorClient frameworks={frameworks} />
}
