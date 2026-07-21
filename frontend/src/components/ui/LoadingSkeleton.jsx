const CardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
    <div className="aspect-[4/5] bg-gray-200/50 animate-pulse" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200/50 animate-pulse rounded-lg w-3/4" />
      <div className="h-3 bg-gray-200/50 animate-pulse rounded-lg w-1/2" />
      <div className="h-3 bg-gray-200/50 animate-pulse rounded-lg w-2/3" />
    </div>
  </div>
);

const TextSkeleton = () => (
  <div className="space-y-3">
    <div className="h-4 bg-gray-200/50 animate-pulse rounded-lg w-3/5" />
    <div className="h-4 bg-gray-200/50 animate-pulse rounded-lg w-4/5" />
    <div className="h-4 bg-gray-200/50 animate-pulse rounded-lg w-2/5" />
  </div>
);

const ImageSkeleton = () => (
  <div className="aspect-video bg-gray-200/50 animate-pulse rounded-2xl" />
);

const ListSkeleton = () => (
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 rounded-full bg-gray-200/50 animate-pulse shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200/50 animate-pulse rounded-lg w-3/5" />
      <div className="h-3 bg-gray-200/50 animate-pulse rounded-lg w-2/5" />
    </div>
  </div>
);

const variants = {
  card: CardSkeleton,
  text: TextSkeleton,
  image: ImageSkeleton,
  list: ListSkeleton,
};

const gridLayouts = {
  card: 'grid-cols-2 md:grid-cols-4 gap-6',
  text: 'grid-cols-1 gap-4',
  image: 'grid-cols-2 md:grid-cols-3 gap-6',
  list: 'grid-cols-1 gap-4',
};

const LoadingSkeleton = ({ variant = 'text', count = 1, className = '' }) => {
  const SkeletonComponent = variants[variant] || variants.text;
  const gridClass = gridLayouts[variant] || gridLayouts.text;

  if (count > 1) {
    return (
      <div className={`grid ${gridClass} ${className}`}>
        {Array.from({ length: count }, (_, i) => (
          <SkeletonComponent key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      <SkeletonComponent />
    </div>
  );
};

export default LoadingSkeleton;
