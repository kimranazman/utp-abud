import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface StartChatButtonProps {
  targetUserId: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export const StartChatButton = ({
  targetUserId,
  variant = "outline",
  size = "sm",
  className,
  children
}: StartChatButtonProps) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getOrCreateConversation } = useChat();

  const handleStartChat = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is logged in first
    if (!user) {
      toast({
        title: "Please Log In",
        description: "You need to be logged in to send messages",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const conversationId = await getOrCreateConversation(targetUserId);

      if (conversationId) {
        navigate(`/abud/chat?c=${conversationId}`);
      }
      // If conversationId is null, getOrCreateConversation already showed the appropriate error
    } catch (error) {
      console.error('Error starting chat:', error);
      toast({
        title: "Failed to Start Conversation",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleStartChat}
      disabled={loading}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
      ) : children ? (
        children
      ) : (
        <>
          <MessageCircle className="h-4 w-4" />
          Message
        </>
      )}
    </Button>
  );
};