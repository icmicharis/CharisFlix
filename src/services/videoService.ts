import { supabase } from '@/lib/supabase';
import { Video } from '@/types';

class VideoService {
  async getAllVideos(limit = 20): Promise<Video[]> {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        channel:channels(*)
      `)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getVideoById(id: string): Promise<Video | null> {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        channel:channels(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async getVideosByChannelId(channelId: string): Promise<Video[]> {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        channel:channels(*)
      `)
      .eq('channel_id', channelId)
      .order('published_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async searchVideos(query: string): Promise<Video[]> {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        channel:channels(*)
      `)
      .ilike('title', `%${query}%`)
      .order('published_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createVideo(video: {
    channel_id: string;
    title: string;
    description?: string;
    video_url: string;
    thumbnail_url?: string;
    category?: string;
    tags?: string[];
    is_live?: boolean;
  }): Promise<Video> {
    const { data, error } = await supabase
      .from('videos')
      .insert(video)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async incrementViewCount(videoId: string, userId?: string) {
    await supabase.from('views').insert({
      video_id: videoId,
      user_id: userId,
    });

    const { error } = await supabase
      .from('videos')
      .update({ view_count: supabase.raw('view_count + 1') })
      .eq('id', videoId);

    if (error) console.error('Failed to increment view count:', error);
  }

  async isLiked(userId: string, videoId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('video_id', videoId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }

  async likeVideo(userId: string, videoId: string) {
    const { error } = await supabase.from('likes').insert({
      user_id: userId,
      video_id: videoId,
    });

    if (error) throw error;

    await supabase
      .from('videos')
      .update({ like_count: supabase.raw('like_count + 1') })
      .eq('id', videoId);
  }

  async unlikeVideo(userId: string, videoId: string) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('video_id', videoId);

    if (error) throw error;

    await supabase
      .from('videos')
      .update({ like_count: supabase.raw('like_count - 1') })
      .eq('id', videoId);
  }

  async uploadVideo(file: File, path: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from('videos').getPublicUrl(data.path);

    return publicUrl;
  }

  async uploadThumbnail(file: File, path: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from('thumbnails')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from('thumbnails').getPublicUrl(data.path);

    return publicUrl;
  }
}

export const videoService = new VideoService();
