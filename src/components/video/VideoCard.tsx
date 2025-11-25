import { Link } from 'react-router-dom';
import { Video, Channel } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge, CheckCircle2, Crown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface VideoCardProps {
  video: Video & { channel?: Channel };
}

export default function VideoCard({ video }: VideoCardProps) {
  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVerificationBadge = () => {
    if (!video.channel) return null;

    if (video.channel.verification_badge === 'golden') {
      return (
        <Crown className="w-4 h-4 text-yellow-400 fill-yellow-400" title="Golden Verified" />
      );
    }

    if (video.channel.verification_badge === 'purple') {
      return (
        <CheckCircle2 className="w-4 h-4 text-purple-500 fill-purple-500" title="Verified" />
      );
    }

    return null;
  };

  return (
    <div className="group video-card">
      <Link to={`/watch/${video.id}`}>
        <div className="relative aspect-video rounded-xl overflow-hidden bg-muted mb-3">
          <img
            src={video.thumbnail_url || 'https://via.placeholder.com/320x180?text=No+Thumbnail'}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {video.duration && (
            <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/80 text-xs font-semibold text-white">
              {formatDuration(video.duration)}
            </div>
          )}
        </div>
      </Link>

      <div className="flex gap-3">
        {video.channel && (
          <Link to={`/channel/${video.channel.handle}`}>
            <Avatar className="w-10 h-10 shrink-0">
              <AvatarImage src={video.channel.avatar_url || undefined} />
              <AvatarFallback>
                {video.channel.channel_name[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
        )}

        <div className="flex-1 min-w-0">
          <Link to={`/watch/${video.id}`}>
            <h3 className="font-semibold line-clamp-2 text-sm mb-1 group-hover:text-primary transition-colors">
              {video.title}
            </h3>
          </Link>

          {video.channel && (
            <Link
              to={`/channel/${video.channel.handle}`}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="line-clamp-1">{video.channel.channel_name}</span>
              {getVerificationBadge()}
            </Link>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span>{formatViews(video.views)} views</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
