import { ExternalLinkIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { groupBy } from 'underscore'
import {
  EcosystemResponse,
  getSeiEcosystemAppsData,
} from '../../data/ecosystemData'

const EcosystemMap = () => {
  const [apps, setApps] = useState<EcosystemResponse['data'] | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
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

  if (!apps || loading)
    return (
      <div className="flex flex-col gap-6 mt-8 border-t pt-8">
        <div className="w-1/3 h-8 bg-slate-200 rounded-md bg-gradient-to-tr from-slate-50 to-slate-200 animate-pulse" />
        <div className="grid grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((c, index) => (
            <div
              key={index}
              className="animate-pulse bg-gradient-to-tr from-slate-50 to-slate-200 rounded-xl flex-col justify-start items-center inline-flex aspect-[2/3] overflow-hidden"
            >
              <div className="w-full relative bg-gradient-to-tl from-slate-50 to-slate-200 aspect-square" />
            </div>
          ))}
        </div>
      </div>
    )
  const groupAppsByCategory = groupBy(apps, (app) =>
    app.fieldData.categorie === undefined ? 'Others' : app.fieldData.categorie
  )
  const categories = Object.keys(groupAppsByCategory)

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-8 mt-8">
        {categories.map((category) => {
          return (
            <div
              key={category}
              className="flex flex-col gap-4 border-t dark:border-gray-700 border-gray-200 pt-8"
            >
              <h2 className="text-2xl font-semibold">{category}</h2>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {groupAppsByCategory[category].map((app, index) => {
                  const logo = app.fieldData.logo
                  return (
                    <a
                      href={`${app.fieldData.link}?utm_source=sei-docs`}
                      key={index}
                      target="_blank"
                      className="flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:opacity-80 transition-all relative group"
                    >
                      <div className="bg-black text-white p-2 absolute rounded-md -right-8 -top-8  group-hover:top-1 group-hover:right-1 transition-all">
                        <ExternalLinkIcon className="h-4 w-4" />
                      </div>
                      {logo && (
                        <div className="flex flex-col">
                          <img
                            src={logo.url}
                            alt={logo.name}
                            className="h-full w-full aspect-square"
                          />
                          <div className="truncate bg-gray-100 dark:bg-gray-800 p-4 font-semibold">
                            {app.fieldData.name}
                          </div>
                        </div>
                      )}
                    </a>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default EcosystemMap
