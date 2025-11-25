export interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

export interface UserProfile {
  id: string;
  username: string | null;
  email: string;
}

export interface Channel {
  id: string;
  user_id: string;
  channel_name: string;
  handle: string;
  description: string | null;
  banner_url: string | null;
  avatar_url: string | null;
  subscriber_count: number;
  verification_badge: 'none' | 'purple' | 'golden';
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  channel_id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  category: string | null;
  duration: number | null;
  views: number;
  likes: number;
  status: 'published' | 'draft' | 'private';
  created_at: string;
  updated_at: string;
  channel?: Channel;
}

export interface Livestream {
  id: string;
  channel_id: string;
  title: string;
  description: string | null;
  stream_key: string;
  thumbnail_url: string | null;
  category: string | null;
  status: 'scheduled' | 'live' | 'ended';
  viewer_count: number;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  channel?: Channel;
}

export interface Subscription {
  id: string;
  subscriber_id: string;
  channel_id: string;
  subscribed_at: string;
}

export interface Like {
  id: string;
  user_id: string;
  video_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  video_id: string;
  content: string;
  likes: number;
  created_at: string;
  updated_at: string;
  user_profile?: UserProfile;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  visibility: 'public' | 'private' | 'unlisted';
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'new_video' | 'new_subscriber' | 'new_comment' | 'new_like' | 'livestream' | 'verification';
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

export interface VerificationPayment {
  id: string;
  user_id: string;
  channel_id: string;
  amount: number;
  currency: string;
  payment_reference: string;
  status: 'pending' | 'success' | 'failed';
  created_at: string;
  completed_at: string | null;
}

export type VideoCategory = 
  | 'Music'
  | 'Gaming'
  | 'Education'
  | 'Entertainment'
  | 'News'
  | 'Sports'
  | 'Technology'
  | 'Lifestyle'
  | 'Comedy'
  | 'Film & Animation'
  | 'Science & Technology'
  | 'Travel'
  | 'Howto & Style'
  | 'Other';
