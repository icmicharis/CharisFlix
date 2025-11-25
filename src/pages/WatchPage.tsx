import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ThumbsUp, Eye, Share2 } from 'lucide-react';
import { CommentSection } from '@/components/features/CommentSection';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { videoService } from '@/services/videoService';
import { channelService } from '@/services/channelService';
import { Video } from '@/types';
import { toast } from 'sonner';

export function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(0);
  const [localSubCount, setLocalSubCount] = useState(0);

  const { data: video, isLoading } = useQuery({
    queryKey: ['video', id],
    queryFn: async () => {
      if (!id) throw new Error('No video ID');
      const data = await videoService.getVideoById(id);
      if (!data) throw new Error('Video not found');
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (video) {
      setLocalLikeCount(video.like_count);
      if (video.channel) {
        setLocalSubCount(video.channel.subscriber_count);
      }
    }
  }, [video]);

  useEffect(() => {
    if (video && user) {
      const checkLikeStatus = async () => {
        const liked = await videoService.isLiked(user.id, video.id);
        setIsLiked(liked);
      };

      const checkSubscription = async () => {
        if (video.channel) {
          const subscribed = await channelService.isSubscribed(
            user.id,
            video.channel.id
          );
          setIsSubscribed(subscribed);
        }
      };

      checkLikeStatus();
      checkSubscription();
    }
  }, [video, user]);

  useEffect(() => {
    if (video && id) {
      videoService.incrementViewCount(id, user?.id);
    }
  }, [id, video, user]);

  const handleLike = async () => {
    if (!user || !video) {
      toast.error('Please sign in to like videos');
      return;
    }

    try {
      if (isLiked) {
        await videoService.unlikeVideo(user.id, video.id);
        setIsLiked(false);
        setLocalLikeCount((prev) => prev - 1);
      } else {
        await videoService.likeVideo(user.id, video.id);
        setIsLiked(true);
        setLocalLikeCount((prev) => prev + 1);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSubscribe = async () => {
    if (!user || !video?.channel) {
      toast.error('Please sign in to subscribe');
      return;
    }

    try {
      if (isSubscribed) {
        await channelService.unsubscribe(user.id, video.channel.id);
        setIsSubscribed(false);
        setLocalSubCount((prev) => prev - 1);
        toast.success('Unsubscribed');
      } else {
        await channelService.subscribe(user.id, video.channel.id);
        setIsSubscribed(true);
        setLocalSubCount((prev) => prev + 1);
        toast.success('Subscribed!');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Skeleton className="aspect-video w-full rounded-xl mb-6" />
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Video not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Section */}
        <div className="lg:col-span-2">
          {/* Video Player */}
          <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4">
            <video
              src={video.video_url}
              controls
              className="w-full h-full"
              autoPlay
            />
          </div>

          {/* Video Info */}
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">{video.title}</h1>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  <span>{video.view_count.toLocaleString()} views</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(video.published_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={isLiked ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleLike}
                  className="gap-2"
                >
                  <ThumbsUp
                    className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`}
                  />
                  <span>{localLikeCount.toLocaleString()}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* Channel Info */}
            {video.channel && (
              <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <Link
                    to={`/channel/${video.channel.channel_handle}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {video.channel.channel_name[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {video.channel.channel_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {localSubCount.toLocaleString()} subscribers
                      </p>
                    </div>
                  </Link>

                  {user?.id !== video.channel.user_id && (
                    <Button
                      variant={isSubscribed ? 'outline' : 'default'}
                      onClick={handleSubscribe}
                      className={!isSubscribed ? 'btn-glow' : ''}
                    >
                      {isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </Button>
                  )}
                </div>

                {video.description && (
                  <p className="mt-4 text-sm text-muted-foreground whitespace-pre-wrap">
                    {video.description}
                  </p>
                )}
              </div>
            )}

            {/* Comments Section */}
            <div className="mt-8">
              <CommentSection videoId={video.id} />
            </div>
          </div>
        </div>

        {/* Sidebar - Related Videos */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Related Videos</h2>
          <p className="text-sm text-muted-foreground">
            More videos coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
