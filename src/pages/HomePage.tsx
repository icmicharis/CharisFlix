import { useQuery } from '@tanstack/react-query';
import { videoService } from '@/services/videoService';
import { VideoCard } from '@/components/features/VideoCard';
import { PinnedChannel } from '@/components/features/PinnedChannel';
import { Skeleton } from '@/components/ui/skeleton';

export function HomePage() {
  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: () => videoService.getAllVideos(24),
  });

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Pinned Channel */}
      <div className="mb-8">
        <PinnedChannel />
      </div>

      {/* Videos Grid */}
      <div>
        <h2 className="text-xl font-bold mb-4">Recommended Videos</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : videos && videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              No videos available yet. Be the first to upload!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
