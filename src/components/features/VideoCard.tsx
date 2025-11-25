import { Link } from 'react-router-dom';
import { Video } from '@/types';
import { Eye, ThumbsUp } from 'lucide-react';

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  return (
    <Link to={`/watch/${video.id}`} className="group">
      <div className="video-card-hover rounded-xl overflow-hidden">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-muted overflow-hidden">
          {video.thumbnail_url ? (
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <span className="text-4xl gradient-text font-bold">
                {video.title[0]}
              </span>
            </div>
          )}
          {video.is_live && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-destructive text-white text-xs font-bold rounded">
              LIVE
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {video.title}
          </h3>

          {video.channel && (
            <p className="text-xs text-muted-foreground">
              {video.channel.channel_name}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{formatCount(video.view_count)}</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" />
              <span>{formatCount(video.like_count)}</span>
            </div>
            <span>{formatDate(video.published_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
