import { getProfileCount } from '@/lib/search'
import HomeClient from '@/components/home/HomeClient'

export default async function HomePage() {
  const memberCount = await getProfileCount()
  return <HomeClient memberCount={memberCount} />
}
