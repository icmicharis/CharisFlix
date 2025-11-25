import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Video, Channel } from '@/types';
import VideoCard from '@/components/video/VideoCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos', 'home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*, channel:channels(*)')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(24);

      if (error) throw error;
      return data as (Video & { channel: Channel })[];
    },
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Home</h1>
        <p className="text-muted-foreground">
          Discover the latest videos from creators around the world
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video rounded-xl" />
                <div className="flex gap-3">
                  <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              </div>
            ))
          : videos?.map((video) => <VideoCard key={video.id} video={video} />)}
      </div>

      {!isLoading && videos?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No videos yet. Be the first to upload!</p>
        </div>
      )}
    </div>
  );
}
