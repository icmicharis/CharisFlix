import { User } from '@supabase/supabase-js';
import { AuthUser } from '@/types';

export function mapSupabaseUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email!,
    username: user.user_metadata?.username || user.email!.split('@')[0],
    avatar: user.user_metadata?.avatar_url,
  };
}
