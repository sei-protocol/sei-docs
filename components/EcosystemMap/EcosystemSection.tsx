import { ExternalLinkIcon } from 'lucide-react'

const EcosystemSection = ({ apps }: { apps: any[] }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      {apps.map((app, index) => {
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
  )
}

export default EcosystemSection
