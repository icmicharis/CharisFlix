import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Video as VideoIcon, Camera, Upload as UploadIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { VideoCard } from '@/components/features/VideoCard';
import { useAuth } from '@/hooks/useAuth';
import { channelService } from '@/services/channelService';
import { videoService } from '@/services/videoService';
import { toast } from 'sonner';

export function ChannelPage() {
  const { handle } = useParams<{ handle?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [localSubCount, setLocalSubCount] = useState(0);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const channelHandle = handle || user?.username.toLowerCase().replace(/\s+/g, '_');

  const { data: channel, isLoading: channelLoading } = useQuery({
    queryKey: ['channel', channelHandle],
    queryFn: async () => {
      if (!channelHandle) throw new Error('No channel handle');
      const data = await channelService.getChannelByHandle(channelHandle);
      
      if (!data && !handle && user) {
        return await channelService.createChannel(
          user.id,
          `${user.username}'s Channel`,
          channelHandle
        );
      }
      
      return data;
    },
    enabled: !!channelHandle,
  });

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ['channel-videos', channel?.id],
    queryFn: () => videoService.getVideosByChannelId(channel!.id),
    enabled: !!channel,
  });

  useEffect(() => {
    if (channel) {
      setLocalSubCount(channel.subscriber_count);
    }
  }, [channel]);

  useEffect(() => {
    if (channel && user && user.id !== channel.user_id) {
      const checkSubscription = async () => {
        const subscribed = await channelService.isSubscribed(user.id, channel.id);
        setIsSubscribed(subscribed);
      };
      checkSubscription();
    }
  }, [channel, user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !channel || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const avatarUrl = await channelService.uploadAvatar(file, user.id);
      await channelService.updateAvatar(channel.id, avatarUrl);
      toast.success('Profile picture updated!');
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user || !channel) {
      toast.error('Please sign in to subscribe');
      return;
    }

    try {
      if (isSubscribed) {
        await channelService.unsubscribe(user.id, channel.id);
        setIsSubscribed(false);
        setLocalSubCount((prev) => prev - 1);
        toast.success('Unsubscribed');
      } else {
        await channelService.subscribe(user.id, channel.id);
        setIsSubscribed(true);
        setLocalSubCount((prev) => prev + 1);
        toast.success('Subscribed!');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (channelLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Skeleton className="h-48 w-full rounded-xl mb-6" />
        <Skeleton className="h-8 w-64 mb-4" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">Channel not found</p>
        {!handle && (
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        )}
      </div>
    );
  }

  const isOwnChannel = user?.id === channel.user_id;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Channel Header */}
      <div className="glass rounded-xl p-6 mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              {channel.avatar_url ? (
                <img
                  src={channel.avatar_url}
                  alt={channel.channel_name}
                  className="w-20 h-20 rounded-full object-cover shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold text-white">
                    {channel.channel_name[0]}
                  </span>
                </div>
              )}
              {isOwnChannel && (
                <>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {uploadingAvatar ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{channel.channel_name}</h1>
              <p className="text-sm text-muted-foreground">
                @{channel.channel_handle}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>{localSubCount.toLocaleString()} subscribers</span>
                <span>{channel.video_count} videos</span>
              </div>
            </div>
          </div>

          {!isOwnChannel && user && (
            <Button
              variant={isSubscribed ? 'outline' : 'default'}
              onClick={handleSubscribe}
              className={!isSubscribed ? 'btn-glow' : ''}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </Button>
          )}

          {isOwnChannel && (
            <Button onClick={() => navigate('/upload')} className="btn-glow">
              <VideoIcon className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
          )}
        </div>

        {channel.description && (
          <p className="mt-4 text-muted-foreground">{channel.description}</p>
        )}
      </div>

      {/* Videos */}
      <div>
        <h2 className="text-xl font-bold mb-4">Videos</h2>

        {videosLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
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
          <div className="text-center py-16 glass rounded-xl">
            <VideoIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              {isOwnChannel
                ? 'You haven\'t uploaded any videos yet'
                : 'This channel has no videos yet'}
            </p>
            {isOwnChannel && (
              <Button onClick={() => navigate('/upload')} className="btn-glow">
                Upload Your First Video
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
