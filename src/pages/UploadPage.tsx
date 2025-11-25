import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, X, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { videoService } from '@/services/videoService';
import { channelService } from '@/services/channelService';
import { toast } from 'sonner';

export function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const loadChannel = async () => {
      if (!user) return;

      try {
        const channel = await channelService.getChannelByUserId(user.id);
        
        if (!channel) {
          const newChannel = await channelService.createChannel(
            user.id,
            `${user.username}'s Channel`,
            user.username.toLowerCase().replace(/\s+/g, '_')
          );
          setChannelId(newChannel.id);
        } else {
          setChannelId(channel.id);
        }
      } catch (error: any) {
        toast.error('Failed to load channel');
        console.error(error);
      }
    };

    loadChannel();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !channelId) {
      toast.error('Please sign in to upload videos');
      return;
    }

    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const videoPath = `${user.id}/${Date.now()}_${videoFile.name}`;
      setUploadProgress(30);

      const videoUrl = await videoService.uploadVideo(videoFile, videoPath);
      setUploadProgress(60);

      let thumbnailUrl: string | undefined;
      if (thumbnailFile) {
        const thumbnailPath = `${user.id}/${Date.now()}_${thumbnailFile.name}`;
        thumbnailUrl = await videoService.uploadThumbnail(
          thumbnailFile,
          thumbnailPath
        );
      }
      setUploadProgress(80);

      await videoService.createVideo({
        channel_id: channelId,
        title,
        description,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        category,
        is_live: isLive,
      });

      setUploadProgress(100);
      toast.success('Video uploaded successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload video');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">
          Please sign in to upload videos
        </p>
        <Button onClick={() => navigate('/auth')}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">Upload Video</CardTitle>
          <CardDescription>
            Share your content with the CharisFlix community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload Type */}
            <div className="flex items-center gap-4 p-4 glass rounded-lg">
              <button
                type="button"
                onClick={() => setIsLive(false)}
                className={`flex-1 p-3 rounded-lg transition-all ${
                  !isLive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <UploadIcon className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">Upload Video</span>
              </button>
              <button
                type="button"
                onClick={() => setIsLive(true)}
                className={`flex-1 p-3 rounded-lg transition-all ${
                  isLive
                    ? 'bg-destructive text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Radio className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">Go Live</span>
              </button>
            </div>

            {isLive && (
              <div className="p-4 glass rounded-lg border border-destructive/50">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-destructive">Live Streaming Setup:</strong><br />
                  Upload your live stream recording or use streaming software (OBS, Streamlabs) to broadcast.
                  Your video will be marked as LIVE.
                </p>
              </div>
            )}
            {/* Video File */}
            <div className="space-y-2">
              <Label>Video File *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                {videoFile ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{videoFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setVideoFile(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <UploadIcon className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      MP4, WebM or OGG (MAX. 500MB)
                    </p>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg"
                      onChange={(e) =>
                        setVideoFile(e.target.files?.[0] || null)
                      }
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Thumbnail */}
            <div className="space-y-2">
              <Label>Thumbnail (Optional)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                {thumbnailFile ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{thumbnailFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setThumbnailFile(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <UploadIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or WebP (MAX. 5MB)
                    </p>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) =>
                        setThumbnailFile(e.target.files?.[0] || null)
                      }
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell viewers about your video"
                rows={4}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Music, Gaming, Education"
              />
            </div>

            {loading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-sm text-center text-muted-foreground">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            <Button
              type="submit"
              className={`w-full ${isLive ? 'bg-destructive hover:bg-destructive/90' : 'btn-glow'}`}
              disabled={loading}
            >
              {loading ? 'Uploading...' : isLive ? 'Start Live Stream' : 'Upload Video'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
