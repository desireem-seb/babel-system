import { getFrameworks } from '@/lib/data'
import { AppShell } from '@/components/layout/AppShell'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const frameworks = await getFrameworks()
  return <AppShell frameworks={frameworks}>{children}</AppShell>
}
