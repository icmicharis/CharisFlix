export interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

export interface Channel {
  id: string;
  user_id: string;
  channel_name: string;
  channel_handle: string;
  description?: string;
  avatar_url?: string;
  banner_url?: string;
  subscriber_count: number;
  video_count: number;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  channel_id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: number;
  view_count: number;
  like_count: number;
  comment_count: number;
  category?: string;
  tags?: string[];
  is_live: boolean;
  published_at: string;
  created_at: string;
  channel?: Channel;
}

export interface Comment {
  id: string;
  video_id: string;
  user_id: string;
  content: string;
  like_count: number;
  created_at: string;
  updated_at: string;
  user?: AuthUser;
}

export interface Subscription {
  id: string;
  subscriber_id: string;
  channel_id: string;
  created_at: string;
}
