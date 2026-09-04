import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UnreadMessages {
  unreadCount: number;
  hasUnread: boolean;
  conversationUnreadCounts: Map<string, number>;
}

export function useUnreadMessages(): UnreadMessages {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversationUnreadCounts, setConversationUnreadCounts] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setConversationUnreadCounts(new Map());
      return;
    }

    const fetchUnreadCounts = async () => {
      try {
        // Get all conversations for the user with their last read timestamp
        const { data: participations, error: participationsError } = await supabase
          .from('conversation_participants')
          .select('conversation_id, last_read_at')
          .eq('user_id', user.id);

        if (participationsError) {
          console.error('Error fetching participations:', participationsError);
          return;
        }

        if (!participations || participations.length === 0) {
          setUnreadCount(0);
          setConversationUnreadCounts(new Map());
          return;
        }

        // For each conversation, count unread messages
        const unreadMap = new Map<string, number>();
        let totalUnread = 0;

        for (const participation of participations) {
          const lastReadAt = participation.last_read_at || '1970-01-01T00:00:00Z';

          const { count, error: countError } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', participation.conversation_id)
            .gt('created_at', lastReadAt)
            .neq('sender_id', user.id);

          if (countError) {
            console.error('Error counting unread messages:', countError);
            continue;
          }

          const unreadInConversation = count || 0;
          if (unreadInConversation > 0) {
            unreadMap.set(participation.conversation_id, unreadInConversation);
            totalUnread += unreadInConversation;
          }
        }

        setConversationUnreadCounts(unreadMap);
        setUnreadCount(totalUnread);
      } catch (error) {
        console.error('Error in fetchUnreadCounts:', error);
      }
    };

    // Initial fetch
    fetchUnreadCounts();

    // Subscribe to new messages
    const messageChannel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          // Check if this message is in a conversation the user is part of
          const { data: participation } = await supabase
            .from('conversation_participants')
            .select('conversation_id, last_read_at')
            .eq('conversation_id', payload.new.conversation_id)
            .eq('user_id', user.id)
            .single();

          if (participation && payload.new.sender_id !== user.id) {
            // This is a new message in user's conversation from someone else
            fetchUnreadCounts();
          }
        }
      )
      .subscribe();

    // Subscribe to participant updates (when last_read_at changes)
    const participantChannel = supabase
      .channel('participant-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation_participants',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // User has read messages, refetch counts
          fetchUnreadCounts();
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(participantChannel);
    };
  }, [user]);

  return {
    unreadCount,
    hasUnread: unreadCount > 0,
    conversationUnreadCounts
  };
}