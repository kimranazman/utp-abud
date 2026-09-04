import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { ensureAuthenticated, withAuth } from '@/utils/authHelpers';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  created_at: string;
  edited_at?: string;
  sender?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface Conversation {
  id: string;
  title?: string;
  is_group: boolean;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  participants?: {
    user_id: string;
    profiles?: {
      full_name: string;
      avatar_url?: string;
    };
  }[];
  latest_message?: Message | null;
}

// Map to track in-flight conversation creation operations
const conversationCreationLocks = new Map<string, Promise<string | null>>();

export const useChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Track notification permission (don't auto-request)
  useEffect(() => {
    if ('Notification' in window && user) {
      setNotificationPermission(Notification.permission);
    }
  }, [user]);

  // Function to show browser notification
  const showNotification = useCallback(async (title: string, options?: NotificationOptions, conversationId?: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          icon: '/abud/favicon.png',
          badge: '/abud/favicon-32x32.png',
          ...options
        });

        // Add click handler to navigate to conversation
        if (conversationId) {
          notification.onclick = () => {
            window.focus();
            // Navigate to the conversation
            window.location.href = `/abud/chat?c=${conversationId}`;
            notification.close();
          };
        }

        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);

        return notification;
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }
  }, []);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    // Ensure we have a valid session
    const session = await ensureAuthenticated();
    if (!session) {
      console.error('Cannot fetch conversations: No valid session');
      toast({
        title: "Please Log In",
        description: "You need to be logged in to view conversations",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      // First get conversations with participants
      const { data: conversationsData, error: convError } = await supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants(user_id)
        `)
        .order('last_message_at', { ascending: false });

      if (convError) {
        console.error('Error fetching conversations:', convError);

        // Check if it's an auth/permission error
        if (convError.code === '403' || convError.message?.includes('403')) {
          toast({
            title: "Permission Error",
            description: "Unable to load conversations. Please try signing out and back in.",
            variant: "destructive",
          });
          // Try to refresh the session
          await supabase.auth.refreshSession();
        }
        throw convError;
      }

      // Then fetch participant profiles and latest messages separately
      const conversationsWithDetails = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          // Get participant profiles
          const participantIds = conv.participants?.map(p => p.user_id) || [];
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, full_name, avatar_url')
            .in('user_id', participantIds);

          // Get latest message
          const { data: latestMessages } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);

          const latestMessage = latestMessages?.[0] || null;

          return {
            ...conv,
            participants: conv.participants?.map(p => ({
              user_id: p.user_id,
              profiles: profiles?.find(profile => profile.user_id === p.user_id)
            })) || [],
            latest_message: latestMessage || null
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Failed to Load Conversations",
        description: "Unable to load your conversations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user) return;

    // Ensure we have a valid session
    const session = await ensureAuthenticated();
    if (!session) {
      console.error('Cannot fetch messages: No valid session');
      toast({
        title: "Please Log In",
        description: "You need to be logged in to view messages",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get messages
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);

        // Check if it's an auth/permission error
        if (error.code === '403' || error.message?.includes('403')) {
          toast({
            title: "Permission Error",
            description: "Unable to load messages. Please try signing out and back in.",
            variant: "destructive",
          });
          // Try to refresh the session
          await supabase.auth.refreshSession();
        }
        throw error;
      }

      // Get sender profiles separately
      const senderIds = [...new Set(messagesData?.map(m => m.sender_id) || [])];
      const { data: senderProfiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', senderIds);

      // Combine messages with sender info
      const messagesWithSenders = messagesData?.map(message => ({
        ...message,
        sender: senderProfiles?.find(profile => profile.user_id === message.sender_id)
      })) || [];

      setMessages(messagesWithSenders);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Failed to Load Messages",
        description: "Unable to load messages. Please try again.",
        variant: "destructive",
      });
    }
  }, [user]);

  // Helper function to find existing conversation
  const findExistingConversation = useCallback(async (currentUserId: string, participantId: string) => {
    const { data: existingConversation, error: checkError } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversations(*)
      `)
      .eq('user_id', currentUserId);

    if (checkError) {
      console.error('Error checking existing conversations:', checkError);
      throw checkError;
    }

    // Find conversation that includes both users
    for (const participant of existingConversation || []) {
      const { data: otherParticipants, error: participantError } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', participant.conversation_id);

      if (participantError) throw participantError;

      const userIds = otherParticipants.map(p => p.user_id);
      if (userIds.includes(participantId) && userIds.length === 2) {
        return participant.conversation_id;
      }
    }

    return null;
  }, []);

  // Create or get existing conversation with lock mechanism
  const getOrCreateConversation = useCallback(async (participantId: string, retryCount = 0): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Please Log In",
        description: "You need to be logged in to start a conversation",
        variant: "destructive",
      });
      return null;
    }

    // Create a lock key based on sorted user IDs to ensure consistency
    const lockKey = [user.id, participantId].sort().join('-');

    // Check if there's already an operation in progress for this pair
    const existingOperation = conversationCreationLocks.get(lockKey);
    if (existingOperation) {
      console.log('Waiting for existing conversation creation to complete...');
      return existingOperation;
    }

    // Create the operation promise
    const operation = (async () => {
      try {
        // First, verify the session is valid
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.error('Session verification failed:', sessionError);

          // Try to refresh the session
          const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();

          if (refreshError || !newSession) {
            console.error('Session refresh failed:', refreshError);
            toast({
              title: "Authentication Error",
              description: "Please sign in again to continue",
              variant: "destructive",
            });
            return null;
          }
        }

        // Check if conversation already exists
        const existingConvId = await findExistingConversation(user.id, participantId);
        if (existingConvId) {
          console.log('Found existing conversation:', existingConvId);
          return existingConvId;
        }

        // Use atomic function to create conversation with participants
        console.log('Creating new conversation atomically for users:', user.id, participantId);

        const { data: conversationData, error: createError } = await supabase
          .rpc('create_conversation_atomic', {
            p_participant_id: participantId,
            p_is_group: false
          });

        if (createError) {
          console.error('Error creating conversation:', createError);

          // Check if it's an auth error
          if (createError.code === '403' || createError.message?.includes('RLS') || createError.message?.includes('policy')) {
            toast({
              title: "Permission Denied",
              description: "Unable to create conversation. Please try signing out and signing back in.",
              variant: "destructive",
            });

            // Try to refresh session one more time
            await supabase.auth.refreshSession();
          }

          // Check if it's a duplicate key error (shouldn't happen with atomic function but just in case)
          if (createError.code === '23505') {
            console.log('Duplicate key error detected, attempting to find existing conversation...');

            // Try to find the existing conversation (it was likely created concurrently)
            const existingConvId = await findExistingConversation(user.id, participantId);

            if (existingConvId) {
              console.log('Found existing conversation after duplicate error:', existingConvId);
              return existingConvId;
            }

            // If still not found and we haven't exceeded retries, try the whole operation again
            if (retryCount < 3) {
              console.log(`Retrying conversation creation (attempt ${retryCount + 1}/3)...`);
              // Wait with exponential backoff
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 100));

              // Remove the lock and retry
              conversationCreationLocks.delete(lockKey);
              return getOrCreateConversation(participantId, retryCount + 1);
            }
          }

          throw createError;
        }

        console.log('Conversation created successfully with ID:', conversationData);
        return conversationData;

      } catch (error: any) {
        console.error('Error in getOrCreateConversation:', error);

        // Provide more specific error messages based on the error type
        let errorMessage = "Failed to start conversation";

        if (error?.code === '23505') {
          errorMessage = "Conversation is being created, please try again.";
        } else if (error?.code === '403' || error?.message?.includes('403')) {
          errorMessage = "Permission denied. Please sign out and sign back in.";
        } else if (error?.message?.includes('auth')) {
          errorMessage = "Authentication error. Please sign in again.";
        } else if (error?.message) {
          errorMessage = error.message;
        }

        toast({
          title: "Failed to Start Conversation",
          description: errorMessage,
          variant: "destructive",
        });
        return null;
      } finally {
        // Always clean up the lock after operation completes
        conversationCreationLocks.delete(lockKey);
      }
    })();

    // Store the operation promise in the lock map
    conversationCreationLocks.set(lockKey, operation);

    return operation;
  }, [user, findExistingConversation]);

  // Send message
  const sendMessage = useCallback(async (content: string, conversationId?: string) => {
    if (!user) {
      toast({
        title: "Please Log In",
        description: "You need to be logged in to send messages",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) return;

    const targetConversationId = conversationId || activeConversationId;
    if (!targetConversationId) return;

    // Ensure we have a valid session before sending
    const session = await ensureAuthenticated();
    if (!session) {
      console.error('Cannot send message: No valid session');
      toast({
        title: "Please Log In",
        description: "Your session has expired. Please log in to send messages.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Sending message:', { content, conversationId: targetConversationId, senderId: user.id });

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: targetConversationId,
          sender_id: user.id,
          content: content.trim(),
          message_type: 'text'
        })
        .select()
        .single();

      if (error) throw error;
      
      console.log('Message sent successfully:', data);

      // Update last read timestamp
      await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', targetConversationId)
        .eq('user_id', user.id);

      // Manually refresh messages to ensure UI is updated
      await fetchMessages(targetConversationId);
      
      // Also refresh conversations to update the latest message preview
      await fetchConversations();

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to Send Message",
        description: "Unable to send your message. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, activeConversationId, fetchMessages]);

  // Edit message
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!user) {
      toast({
        title: "Please Log In",
        description: "You need to be logged in to edit messages",
        variant: "destructive",
      });
      return;
    }

    if (!newContent.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({
          content: newContent.trim(),
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', user.id); // Ensure user can only edit their own messages

      if (error) throw error;

      // Refresh messages to show the edit
      if (activeConversationId) {
        await fetchMessages(activeConversationId);
      }

      toast({
        title: "Success",
        description: "Message updated successfully",
      });

    } catch (error) {
      console.error('Error editing message:', error);
      toast({
        title: "Failed to Edit Message",
        description: "Unable to edit your message. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, activeConversationId, fetchMessages]);

  // Mark conversation as read when viewing
  const markConversationAsRead = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      console.log('Marked conversation as read:', conversationId);
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      // Don't show a toast for this - it's a non-critical background operation
    }
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Ensure we have a valid session before setting up subscriptions
    const setupSubscriptions = async () => {
      const session = await ensureAuthenticated();
      if (!session) {
        console.error('Cannot setup real-time subscriptions: No valid session');
        return;
      }

      console.log('Setting up real-time subscriptions for user:', user.id);

      // Subscribe to new messages with explicit auth
      const messagesChannel = supabase
        .channel('messages', {
          params: {
            user_id: user.id
          }
        })
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          async (payload) => {
            console.log('New message received via real-time:', payload);
            const newMessage = payload.new as Message;

            // Only add if it's for the active conversation
            if (newMessage.conversation_id === activeConversationId) {
              setMessages(prev => [...prev, newMessage]);
            }

            // Show browser notification if message is from another user
            if (newMessage.sender_id !== user.id) {
              // Get sender info
              const { data: senderProfile } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('user_id', newMessage.sender_id)
                .single();

              const senderName = senderProfile?.full_name || 'Someone';
              const messagePreview = newMessage.content.length > 50
                ? newMessage.content.substring(0, 50) + '...'
                : newMessage.content;

              // Show notification if not viewing the conversation
              if (newMessage.conversation_id !== activeConversationId) {
                showNotification(
                  `${senderName} sent you a message`,
                  {
                    body: messagePreview,
                    tag: newMessage.conversation_id,
                    requireInteraction: false,
                  },
                  newMessage.conversation_id
                );
              }
            }

            // Always refresh conversations to update latest message previews
            fetchConversations();
          }
        )
        .subscribe((status) => {
          console.log('Messages channel subscription status:', status);
        });

      // Subscribe to conversation updates with explicit auth
      const conversationsChannel = supabase
        .channel('conversations', {
          params: {
            user_id: user.id
          }
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversations',
          },
          (payload) => {
            console.log('Conversation update received:', payload);
            fetchConversations();
          }
        )
        .subscribe((status) => {
          console.log('Conversations channel subscription status:', status);
        });

      // Store channels for cleanup
      return { messagesChannel, conversationsChannel };
    };

    // Setup subscriptions and handle cleanup
    let channels: { messagesChannel?: any; conversationsChannel?: any } = {};

    setupSubscriptions().then(result => {
      if (result) {
        channels = result;
      }
    });

    return () => {
      console.log('Cleaning up real-time subscriptions');
      if (channels.messagesChannel) {
        supabase.removeChannel(channels.messagesChannel);
      }
      if (channels.conversationsChannel) {
        supabase.removeChannel(channels.conversationsChannel);
      }
    };
  }, [user, activeConversationId, fetchConversations]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
      // Mark conversation as read when viewing it
      markConversationAsRead(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId, fetchMessages, markConversationAsRead]);

  return {
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    getOrCreateConversation,
    sendMessage,
    editMessage,
    loading,
    fetchConversations,
    notificationPermission,
  };
};