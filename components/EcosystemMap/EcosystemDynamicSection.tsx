import { useEffect, useState } from 'react'
import { EcosystemSection, EcosystemSkeleton } from '.'
import {
  EcosystemResponse,
  getSeiEcosystemAppsData,
} from '../../data/ecosystemData'

const EcosystemDynamicSection = ({ category }: { category: string }) => {
  const [apps, setApps] = useState<EcosystemResponse['data'] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      await getSeiEcosystemAppsData()
        .then((data) => {
          setApps(data.data)
          setLoading(false)
        })
        .catch((error) => {
          console.error('Failed to fetch data:', error)
        })
        .finally(() => {
          setLoading(false)
        })
    }
    fetchData()
  }, [])

  if (!apps || loading) return <EcosystemSkeleton />

  // filter out apps that don't have a categorie
  const filteredApps = apps.filter((app) => app.fieldData.categorie !== undefined && app.fieldData['categorie-2'] !== undefined);

  const appsByCategory = (category: string) =>
    filteredApps.filter((app) => app.fieldData.categorie === category)
  return <EcosystemSection apps={appsByCategory(category)} />
}

export default EcosystemDynamicSection
