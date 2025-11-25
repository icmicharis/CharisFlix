import { supabase } from '@/lib/supabase';
import { Channel } from '@/types';

class ChannelService {
  async getChannelByUserId(userId: string): Promise<Channel | null> {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async getChannelByHandle(handle: string): Promise<Channel | null> {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('channel_handle', handle)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async createChannel(
    userId: string,
    channelName: string,
    channelHandle: string,
    description?: string
  ): Promise<Channel> {
    const { data, error } = await supabase
      .from('channels')
      .insert({
        user_id: userId,
        channel_name: channelName,
        channel_handle: channelHandle,
        description,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateChannel(
    channelId: string,
    updates: Partial<Channel>
  ): Promise<Channel> {
    const { data, error } = await supabase
      .from('channels')
      .update(updates)
      .eq('id', channelId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async isSubscribed(userId: string, channelId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('subscriber_id', userId)
      .eq('channel_id', channelId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }

  async subscribe(userId: string, channelId: string) {
    const { error } = await supabase.from('subscriptions').insert({
      subscriber_id: userId,
      channel_id: channelId,
    });

    if (error) throw error;

    await supabase.rpc('increment', {
      table_name: 'channels',
      row_id: channelId,
      column_name: 'subscriber_count',
    });
  }

  async unsubscribe(userId: string, channelId: string) {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('subscriber_id', userId)
      .eq('channel_id', channelId);

    if (error) throw error;

    await supabase.rpc('decrement', {
      table_name: 'channels',
      row_id: channelId,
      column_name: 'subscriber_count',
    });
  }

  async uploadAvatar(file: File, userId: string): Promise<string> {
    const fileName = `${userId}/${Date.now()}_avatar.${file.name.split('.').pop()}`;
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(data.path);

    return publicUrl;
  }

  async updateAvatar(channelId: string, avatarUrl: string): Promise<void> {
    const { error } = await supabase
      .from('channels')
      .update({ avatar_url: avatarUrl })
      .eq('id', channelId);

    if (error) throw error;
  }
}

export const channelService = new ChannelService();
