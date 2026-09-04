import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UseAvatarUrlResult {
  avatarUrl: string | null;
  thumbnailUrl: string | null;
  isLoading: boolean;
  refetch: () => void;
}

/**
 * Hook to get user's avatar URL with priority:
 * 1. Uploaded profile photo (avatar_url from profiles table)
 * 2. OAuth avatar (user_metadata.avatar_url)
 * 3. null (for fallback to initials)
 */
export function useAvatarUrl(): UseAvatarUrlResult {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAvatar = useCallback(async () => {
    if (!user) {
      setAvatarUrl(null);
      setThumbnailUrl(null);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch uploaded avatar from profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('avatar_url, avatar_thumbnail_url')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching avatar:', error);
      }

      // Priority: uploaded photo > OAuth photo > null
      if (profile?.avatar_url) {
        setAvatarUrl(profile.avatar_url);
        setThumbnailUrl(profile.avatar_thumbnail_url || profile.avatar_url);
      } else if (user.user_metadata?.avatar_url) {
        // Fall back to OAuth avatar
        setAvatarUrl(user.user_metadata.avatar_url);
        setThumbnailUrl(user.user_metadata.avatar_url);
      } else {
        setAvatarUrl(null);
        setThumbnailUrl(null);
      }
    } catch (error) {
      console.error('Error fetching avatar:', error);
      // Fall back to OAuth avatar on error
      setAvatarUrl(user.user_metadata?.avatar_url || null);
      setThumbnailUrl(user.user_metadata?.avatar_url || null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAvatar();
  }, [fetchAvatar]);

  // Subscribe to profile changes for real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('avatar-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Update avatar when profile changes
          const newProfile = payload.new as { avatar_url?: string; avatar_thumbnail_url?: string };
          if (newProfile.avatar_url) {
            setAvatarUrl(newProfile.avatar_url);
            setThumbnailUrl(newProfile.avatar_thumbnail_url || newProfile.avatar_url);
          } else {
            // Profile avatar was removed, fall back to OAuth
            setAvatarUrl(user.user_metadata?.avatar_url || null);
            setThumbnailUrl(user.user_metadata?.avatar_url || null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { avatarUrl, thumbnailUrl, isLoading, refetch: fetchAvatar };
}
