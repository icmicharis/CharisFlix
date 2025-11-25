import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pin } from 'lucide-react';
import { Channel } from '@/types';
import { channelService } from '@/services/channelService';

const PINNED_CHANNEL_HANDLE = 'icmi_charis';

export function PinnedChannel() {
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    const loadChannel = async () => {
      try {
        const data = await channelService.getChannelByHandle(
          PINNED_CHANNEL_HANDLE
        );
        setChannel(data);
      } catch (error) {
        console.error('Failed to load pinned channel:', error);
      }
    };

    loadChannel();
  }, []);

  if (!channel) return null;

  return (
    <Link to={`/channel/${channel.channel_handle}`}>
      <div className="glass rounded-xl p-4 border border-primary/30 card-hover">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-lg font-bold text-white">
                {channel.channel_name[0]}
              </span>
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <Pin className="w-3 h-3 text-white" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-sm line-clamp-1">
              {channel.channel_name}
            </h3>
            <p className="text-xs text-muted-foreground">
              @{channel.channel_handle}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {channel.subscriber_count.toLocaleString()} subscribers
            </p>
          </div>
        </div>

        {channel.description && (
          <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
            {channel.description}
          </p>
        )}
      </div>
    </Link>
  );
}
