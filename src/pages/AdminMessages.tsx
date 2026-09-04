import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, TrendingUp, Users, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Badge } from '@/components/ui/badge';

interface MessageStats {
  total_messages: number;
  total_conversations: number;
  messages_today: number;
  messages_this_week: number;
  messages_this_month: number;
  daily_messages: Array<{ date: string; count: number; }>;
  hourly_messages: Array<{ hour: string; count: number; }>;
  top_users: Array<{ user_id: string; full_name: string; message_count: number; }>;
}

interface RecentMessage {
  id: string;
  created_at: string;
  sender: {
    full_name: string;
  };
  conversation: {
    is_group: boolean;
    participant_count: number;
  };
}

export default function AdminMessages() {
  const [stats, setStats] = useState<MessageStats | null>(null);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessageStats();
    fetchRecentMessages();
  }, []);

  const fetchMessageStats = async () => {
    try {
      // Basic counts
      const [messagesResult, conversationsResult] = await Promise.all([
        supabase.from('messages').select('id', { count: 'exact' }),
        supabase.from('conversations').select('id', { count: 'exact' })
      ]);

      // Time-based counts
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      monthAgo.setHours(0, 0, 0, 0);

      const [todayMsgs, weekMsgs, monthMsgs, dailyMsgs] = await Promise.all([
        supabase.from('messages').select('id', { count: 'exact' }).gte('created_at', today.toISOString()),
        supabase.from('messages').select('id', { count: 'exact' }).gte('created_at', weekAgo.toISOString()),
        supabase.from('messages').select('id', { count: 'exact' }).gte('created_at', monthAgo.toISOString()),
        supabase.from('messages').select('created_at').gte('created_at', monthAgo.toISOString()).order('created_at', { ascending: true })
      ]);

      // Get top users by message count (anonymized)
      const { data: topUsersData } = await supabase
        .from('messages')
        .select(`
          sender_id,
          profiles:sender_id (
            full_name
          )
        `)
        .gte('created_at', monthAgo.toISOString());

      // Process top users
      const userCounts = new Map();
      topUsersData?.forEach(msg => {
        const userId = msg.sender_id;
        const currentCount = userCounts.get(userId) || 0;
        userCounts.set(userId, {
          count: currentCount + 1,
          user: msg.profiles
        });
      });

      const topUsers = Array.from(userCounts.entries())
        .map(([userId, data]) => ({
          user_id: userId,
          full_name: data.user?.full_name || 'Unknown',
          message_count: data.count
        }))
        .sort((a, b) => b.message_count - a.message_count)
        .slice(0, 5);

      // Process daily data
      const dailyMessages = [];
      const dateMap = new Map();

      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dateMap.set(dateStr, 0);
      }

      dailyMsgs.data?.forEach(message => {
        const dateStr = message.created_at.split('T')[0];
        if (dateMap.has(dateStr)) {
          dateMap.set(dateStr, dateMap.get(dateStr) + 1);
        }
      });

      dateMap.forEach((count, date) => {
        dailyMessages.push({ 
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
          count 
        });
      });

      // Process hourly data for today
      const hourlyMessages = [];
      const hourMap = new Map();
      
      for (let i = 0; i < 24; i++) {
        hourMap.set(i, 0);
      }

      const { data: todayMessagesData } = await supabase
        .from('messages')
        .select('created_at')
        .gte('created_at', today.toISOString());

      todayMessagesData?.forEach(message => {
        const hour = new Date(message.created_at).getHours();
        hourMap.set(hour, hourMap.get(hour) + 1);
      });

      hourMap.forEach((count, hour) => {
        hourlyMessages.push({ 
          hour: `${hour.toString().padStart(2, '0')}:00`, 
          count 
        });
      });

      setStats({
        total_messages: messagesResult.count || 0,
        total_conversations: conversationsResult.count || 0,
        messages_today: todayMsgs.count || 0,
        messages_this_week: weekMsgs.count || 0,
        messages_this_month: monthMsgs.count || 0,
        daily_messages: dailyMessages,
        hourly_messages: hourlyMessages,
        top_users: topUsers
      });
    } catch (error) {
      console.error('Error fetching message stats:', error);
    }
  };

  const fetchRecentMessages = async () => {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('id, created_at, sender_id, conversation_id')
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch profiles and conversations separately (privacy-compliant)
      const [profilesResult, conversationsResult] = await Promise.all([
        supabase.from('profiles').select('user_id, full_name'),
        supabase.from('conversations').select('id, is_group')
      ]);

      if (error) throw error;

      // Get participant counts for conversations
      const conversationIds = messages?.map(m => m.conversation_id) || [];
      const { data: participantCounts } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .in('conversation_id', conversationIds);

      const participantCountMap = new Map();
      participantCounts?.forEach(pc => {
        const count = participantCountMap.get(pc.conversation_id) || 0;
        participantCountMap.set(pc.conversation_id, count + 1);
      });

      setRecentMessages(messages?.map(msg => {
        const profile = profilesResult.data?.find(p => p.user_id === msg.sender_id);
        const conversation = conversationsResult.data?.find(c => c.id === msg.conversation_id);
        return {
          id: msg.id,
          created_at: msg.created_at,
          sender: {
            full_name: profile?.full_name || 'Anonymous User'
          },
          conversation: {
            is_group: conversation?.is_group || false,
            participant_count: participantCountMap.get(msg.conversation_id) || 1
          }
        };
      }) || []);
    } catch (error) {
      console.error('Error fetching recent messages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading message analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Message Analytics</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_messages}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_conversations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Messages Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.messages_today}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Messages This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.messages_this_week}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Daily Messages (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.daily_messages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Hourly Activity (Today)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.hourly_messages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Users & Recent Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Most Active Users (This Month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.top_users.map((user, index) => (
                <div key={user.user_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{user.message_count} messages</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <p className="text-sm text-muted-foreground">
              Privacy-compliant message activity overview (content not displayed)
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentMessages.map((message) => (
                <div key={message.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{message.sender?.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {message.conversation.is_group ? 'Group Chat' : 'Direct Message'}
                    </Badge>
                    <span>•</span>
                    <span>{message.conversation.participant_count} participants</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}