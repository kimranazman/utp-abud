import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalAlumni: number;
  verifiedAlumni: number;
  avgProfileCompletion: number;
  totalBusinesses: number;
  messagesLast7Days: number;
  activeConversations: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Parallel fetch all stats
      const [
        profilesResult,
        avgCompletionResult,
        businessesResult,
        messagesResult,
        conversationsResult
      ] = await Promise.all([
        supabase.from('profiles').select('is_verified', { count: 'exact' }),
        supabase.rpc('get_average_profile_completion'),
        supabase.from('user_businesses').select('*', { count: 'exact', head: true }),
        supabase.from('messages').select('id', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('conversations').select('id', { count: 'exact', head: true })
          .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ]);

      const profiles = profilesResult.data || [];
      const verifiedCount = profiles.filter(p => p.is_verified).length;

      return {
        totalAlumni: profilesResult.count || 0,
        verifiedAlumni: verifiedCount,
        avgProfileCompletion: avgCompletionResult.data || 0,
        totalBusinesses: businessesResult.count || 0,
        messagesLast7Days: messagesResult.count || 0,
        activeConversations: conversationsResult.count || 0
      };
    },
    staleTime: 60000, // 1 minute cache
    refetchOnWindowFocus: false
  });
}
