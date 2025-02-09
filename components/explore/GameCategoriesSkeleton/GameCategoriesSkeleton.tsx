// Loading skeleton for the hero section
function HeroSkeleton() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[50vh] text-center animate-pulse">
      <div className="max-w-4xl mx-auto mb-8">
        <div className="h-20 bg-gray-800/50 rounded-lg mb-6 w-3/4 mx-auto" />
        <div className="h-6 bg-gray-800/50 rounded w-2/3 mx-auto mb-12" />
        <div className="relative max-w-2xl mx-auto">
          <div className="h-16 bg-gray-800/50 rounded-full mb-6" />
          <div className="flex justify-center gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-32 bg-gray-800/50 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton for game categories
function GameCategoriesSkeleton() {
  return (
    <div className="space-y-24">
      {[1, 2, 3].map((section) => (
        <div key={section} className="space-y-6">
          <div className="h-8 bg-gray-800/50 rounded w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-lg bg-gray-800/50" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export { HeroSkeleton, GameCategoriesSkeleton };
