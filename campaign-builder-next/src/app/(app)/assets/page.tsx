import { getFrameworks, getCampaign } from '@/lib/data'
import { AssetsClient } from '@/components/assets/AssetsClient'

export const dynamic = 'force-dynamic'

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>
}) {
  const { product } = await searchParams
  const frameworks = await getFrameworks()
  const defaultProduct = product ?? frameworks[0]?.id

  let campaign = null
  if (defaultProduct) {
    campaign = await getCampaign(defaultProduct)
  }

  return (
    <AssetsClient
      frameworks={frameworks}
      initialCampaign={campaign}
      initialProduct={defaultProduct}
    />
  )
}
