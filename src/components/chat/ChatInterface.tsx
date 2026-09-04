import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Send, Plus, MessageCircle, Edit2, Check, X, Smile, Search, Trash2, Building2, MapPin, GraduationCap, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useChat, type Conversation, type Message } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { formatDistanceToNow } from 'date-fns';
import { LinkPreview } from './LinkPreview';
import { StartChatDialog } from './StartChatDialog';
import { formatCourseName } from '@/lib/courseUtils';

interface ChatInterfaceProps {
  className?: string;
  initialConversationId?: string;
}

const ConversationList = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  loading
}: {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  loading: boolean;
}) => {
  const { user } = useAuth();
  const { conversationUnreadCounts } = useUnreadMessages();

  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-10 h-10 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No conversations yet</p>
        <p className="text-xs">Start messaging alumni to begin networking!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-1">
        {conversations.map((conversation) => {
          // Get the other participant for 1-on-1 conversations
          const otherParticipant = conversation.participants?.find(
            p => p.user_id !== user?.id
          );
          
          const displayName = conversation.is_group 
            ? conversation.title || 'Group Chat'
            : otherParticipant?.profiles?.full_name || 'Unknown User';

          const avatarUrl = conversation.is_group 
            ? null 
            : otherParticipant?.profiles?.avatar_url;

          const lastMessageTime = conversation.latest_message?.created_at 
            ? formatDistanceToNow(new Date(conversation.latest_message.created_at), { addSuffix: true })
            : '';

          const isActive = conversation.id === activeConversationId;
          const unreadCount = conversationUnreadCounts.get(conversation.id) || 0;
          const hasUnread = unreadCount > 0;

          return (
            <Button
              key={conversation.id}
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start h-auto p-3"
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex items-center space-x-3 w-full">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>
                      {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {hasUnread && (
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 border-2 border-white dark:border-gray-950 rounded-full" />
                  )}
                </div>
                
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm truncate">{displayName}</p>
                    {lastMessageTime && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {lastMessageTime}
                      </span>
                    )}
                  </div>
                  
                  {conversation.latest_message && (
                    <p className="text-xs text-muted-foreground truncate">
                      {conversation.latest_message.content}
                    </p>
                  )}
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </ScrollArea>
  );
};

const extractUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

const MessageBubble = ({ 
  message, 
  isOwn, 
  onEdit,
  onDelete 
}: { 
  message: Message; 
  isOwn: boolean;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleEdit = () => {
    if (onEdit && editContent.trim() !== message.content) {
      onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEdit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const urls = extractUrls(message.content);

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
        {!isOwn && (
          <p className="text-xs text-muted-foreground mb-1 px-3">
            {message.sender?.full_name || 'Unknown User'}
          </p>
        )}
        
        <div className={`rounded-lg px-3 py-2 relative ${
          isOwn 
            ? 'bg-primary text-primary-foreground ml-4' 
            : 'bg-muted mr-4'
        }`}>
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-sm bg-background text-foreground"
                autoFocus
              />
              <div className="flex justify-end space-x-1">
                <Button size="sm" variant="ghost" onClick={handleCancel} className="h-6 px-2">
                  <X className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={handleEdit} className="h-6 px-2">
                  <Check className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm">{message.content}</p>
              <div className="flex items-center justify-between mt-1">
                <p className={`text-xs ${
                  isOwn 
                    ? 'text-primary-foreground/70' 
                    : 'text-muted-foreground'
                }`}>
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  {message.edited_at && <span className="ml-1">(edited)</span>}
                </p>
                {isOwn && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                        className="h-4 w-4 p-0"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm('Delete this message?')) {
                            onDelete(message.id);
                          }
                        }}
                        className="h-4 w-4 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        {/* Link Previews */}
        {!isEditing && urls.length > 0 && (
          <div className="space-y-2">
            {urls.map((url, index) => (
              <LinkPreview key={`${message.id}-${index}`} url={url} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MessagesList = ({ 
  messages, 
  userId,
  onEditMessage,
  onDeleteMessage
}: { 
  messages: Message[]; 
  userId: string | undefined;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onDeleteMessage?: (messageId: string) => void;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
        <div>
          <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No messages yet</p>
          <p className="text-sm">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="space-y-1">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.sender_id === userId}
            onEdit={onEditMessage}
            onDelete={onDeleteMessage}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export const ChatInterface = ({ className, initialConversationId }: ChatInterfaceProps) => {
  const { user } = useAuth();
  const { 
    conversations, 
    messages, 
    activeConversationId, 
    setActiveConversationId, 
    getOrCreateConversation,
    sendMessage,
    editMessage,
    loading,
    fetchConversations
  } = useChat();
  
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [otherUserProfile, setOtherUserProfile] = useState<any>(null);
  const [otherUserBusiness, setOtherUserBusiness] = useState<any>(null);

  useEffect(() => {
    if (initialConversationId) {
      setActiveConversationId(initialConversationId);
    }
  }, [initialConversationId, setActiveConversationId]);

  // Fetch other user's profile and business info when conversation changes
  useEffect(() => {
    const fetchOtherUserInfo = async () => {
      if (!activeConversationId || !user) return;
      
      const conversation = conversations.find(c => c.id === activeConversationId);
      if (!conversation || conversation.is_group) {
        setOtherUserProfile(null);
        setOtherUserBusiness(null);
        return;
      }
      
      const otherParticipant = conversation.participants?.find(
        p => p.user_id !== user.id
      );
      
      if (!otherParticipant) return;
      
      // Fetch full profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', otherParticipant.user_id)
        .single();
      
      setOtherUserProfile(profileData);
      
      // Fetch current business
      const { data: businessData } = await supabase
        .from('user_businesses')
        .select('*')
        .eq('user_id', otherParticipant.user_id)
        .eq('current_business', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      setOtherUserBusiness(businessData);
    };
    
    fetchOtherUserInfo();
  }, [activeConversationId, conversations, user]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversationId) return;
    
    await sendMessage(newMessage);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user?.id);
      
      if (error) throw error;
      toast.success('Message deleted');
      
      // Refresh messages
      window.location.reload();
    } catch (error: any) {
      toast.error('Failed to delete message');
      console.error('Error deleting message:', error);
    }
  };

  // Filter messages based on search
  const filteredMessages = searchQuery 
    ? messages.filter(m => 
        m.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleStartChat = async (participantId: string) => {
    const conversationId = await getOrCreateConversation(participantId);
    if (conversationId) {
      // Refresh conversations to get updated participant info
      await fetchConversations();
      setActiveConversationId(conversationId);
    }
  };

  return (
    <div className={`flex h-[600px] ${className}`}>
      {/* Conversations List */}
      <Card className="w-80 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Messages</h2>
            <StartChatDialog onStartChat={handleStartChat} />
          </div>
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-8 h-8"
              value=""
              onChange={(e) => {}}
            />
          </div>
        </div>
        
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          loading={loading}
        />
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 ml-4 flex flex-col">
        {activeConversationId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* User Avatar - Clickable to profile */}
                  {otherUserProfile && (
                    <Link to={`/abud/profile/${otherUserProfile.user_id}`}>
                      <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
                        <AvatarImage src={otherUserProfile.avatar_url} />
                        <AvatarFallback>
                          {otherUserProfile.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                  )}
                  
                  <div>
                    <h3 className="font-medium">
                      {(() => {
                        const conversation = conversations.find(c => c.id === activeConversationId);
                        const otherParticipant = conversation?.participants?.find(
                          p => p.user_id !== user?.id
                        );
                        if (conversation?.is_group) {
                          return conversation.title || 'Group Chat';
                        }
                        // Make name clickable for non-group chats
                        return otherUserProfile ? (
                          <Link
                            to={`/abud/profile/${otherUserProfile.user_id}`}
                            className="hover:underline"
                          >
                            {otherParticipant?.profiles?.full_name || 'Unknown User'}
                          </Link>
                        ) : (
                          otherParticipant?.profiles?.full_name || 'Unknown User'
                        );
                      })()}
                    </h3>
                    
                    {/* User Info */}
                    {otherUserProfile && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {otherUserProfile.course && (
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {formatCourseName(otherUserProfile.course)}
                          </span>
                        )}
                        {otherUserProfile.graduation_year && (
                          <span>Class of {otherUserProfile.graduation_year}</span>
                        )}
                      </div>
                    )}
                    
                    {/* Business Info - Clickable */}
                    {otherUserBusiness && (
                      <div className="flex items-center gap-2 mt-1">
                        <Link to={`/abud/business/${otherUserBusiness.id}`}>
                          <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-secondary/80 transition-colors">
                            <Building2 className="h-3 w-3 mr-1" />
                            {otherUserBusiness.position} at {otherUserBusiness.business_name}
                          </Badge>
                        </Link>
                        {otherUserBusiness.location && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {otherUserBusiness.location}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSearch(!showSearch)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {otherUserProfile && (
                        <DropdownMenuItem
                          onClick={() => window.open(`/abud/profile/${otherUserProfile.user_id}`, '_blank')}
                        >
                          View Profile
                        </DropdownMenuItem>
                      )}
                      {otherUserBusiness && (
                        <DropdownMenuItem
                          onClick={() => window.open(`/abud/business/${otherUserBusiness.id}`, '_blank')}
                        >
                          View Business
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Search Bar */}
              {showSearch && (
                <div className="mt-3">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search messages..."
                      className="pl-8 h-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 px-2"
                        onClick={() => setSearchQuery('')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {searchQuery && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Found {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Messages */}
            <MessagesList 
              messages={filteredMessages} 
              userId={user?.id}
              onEditMessage={editMessage}
              onDeleteMessage={handleDeleteMessage}
            />

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Smile className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" side="top" align="end">
                    <EmojiPicker 
                      onEmojiClick={handleEmojiClick}
                      width={300}
                      height={400}
                    />
                  </PopoverContent>
                </Popover>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
            <div>
              <MessageCircle className="w-24 h-24 mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
              <p>Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};