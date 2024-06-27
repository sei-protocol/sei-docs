import { useConfig } from 'nextra-theme-docs'
import { useEffect, useState } from 'react'
import { groupBy } from 'underscore'
import { EcosystemSection, EcosystemSkeleton } from '.'
import {
  EcosystemResponse,
  getSeiEcosystemAppsData,
} from '../../data/ecosystemData'

// ;[
//   'Consumer Apps',
//   'Infrastructure',
//   'DeFi',
//   'Data & Analytics',
//   'Wallets',
//   'NFTs',
//   'Exchanges & On/Off Ramps',
//   'Other',
//   'AI',
// ]


const EcosystemMap = () => {
  const [apps, setApps] = useState<EcosystemResponse['data'] | null>(null)
  const [loading, setLoading] = useState(true)

  const config = useConfig()

  console.log(config)
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
  const filteredApps = apps.filter(
    (app) => app.fieldData.categorie !== undefined
  )

  // group apps by category
  const groupAppsByCategory = groupBy(
    filteredApps,
    (app) => app.fieldData.categorie
  )

  const categories = Object.keys(groupAppsByCategory)
  console.log(categories)
  const mappedCategories = categories.map((category) => {
    if (category === undefined) return
    return {
      label: category,
      // replace spaces with hyphens and remove special characters like & and / from the category name
      value: category
        .replace(/\s/g, '-')
        .replace(/[&/\s]/g, '')
        .toLowerCase()
        .replace(/-+/g, '-'),
    }
  })

  const appsByCategory = (category: string) =>
    apps.filter((app) => app.fieldData.categorie === category)

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-8 mt-8">
        {mappedCategories.map(({ label, value }) => {
          return (
            <div key={value} className="flex flex-col gap-4 ">
              {/* <h2 className="text-2xl font-semibold">{label}</h2> */}
              <h2 className="nx-font-semibold nx-tracking-tight nx-text-slate-900 dark:nx-text-slate-100 nx-mt-10 nx-border-b nx-pb-1 nx-text-3xl nx-border-neutral-200/70 contrast-more:nx-border-neutral-400 dark:nx-border-primary-100/10 contrast-more:dark:nx-border-neutral-400">
                {label}
                <a
                  href={`#${value}`}
                  id="overview"
                  className="subheading-anchor"
                  aria-label="Permalink for this section"
                ></a>
              </h2>
              <EcosystemSection apps={appsByCategory(label)} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default EcosystemMap
