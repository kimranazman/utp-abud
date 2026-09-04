import { useAuth } from '@/hooks/useAuth';
import { Navigate, useSearchParams } from 'react-router-dom';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { NotificationPermission } from '@/components/NotificationPermission';

const Chat = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const initialConversationId = searchParams.get('c') ?? undefined;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/abud/auth" replace />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">
          Connect and network with your fellow alumni
        </p>
      </div>

      <NotificationPermission />

      <ChatInterface initialConversationId={initialConversationId} />
    </div>
  );
};

export default Chat;