const EcosystemSkeleton = () => {
  return (
    <div className="flex flex-col gap-6 pt-8">
      <div className="w-1/3 h-8 bg-slate-200 rounded-md bg-gradient-to-tr from-zinc-50 to-zinc-200 dark:from-zinc-800 dark:to-zinc-950 animate-pulse" />
      <div className="grid grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse bg-gradient-to-tr from-zinc-50 to-zinc-200 dark:from-zinc-800 dark:to-zinc-950 rounded-xl flex-col justify-start items-center inline-flex aspect-[2/3] overflow-hidden"
          >
            <div className="w-full relative bg-gradient-to-tl from-zinc-50 to-zinc-200 dark:from-zinc-800 dark:to-zinc-950 aspect-square" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default EcosystemSkeleton
