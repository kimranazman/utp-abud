import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HandCoins, TrendingUp, DollarSign, Users, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';

interface ContributionStats {
  total_contributions: number;
  total_monetary_value: number;
  total_non_monetary_value: number;
  monetary_contributions: number;
  non_monetary_contributions: number;
  top_contributors: Array<{
    user_id: string;
    full_name: string;
    total_value: number;
    contribution_count: number;
  }>;
  contribution_types: Array<{
    type: string;
    count: number;
    total_value: number;
  }>;
  monthly_contributions: Array<{
    month: string;
    monetary: number;
    non_monetary: number;
  }>;
}

interface RecentContribution {
  id: string;
  organization_name: string;
  role: string;
  value_amount: number;
  contribution_type: string;
  created_at: string;
  contributor: {
    full_name: string;
  };
}

export default function AdminContributions() {
  const [stats, setStats] = useState<ContributionStats | null>(null);
  const [recentContributions, setRecentContributions] = useState<RecentContribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContributionStats();
    fetchRecentContributions();
  }, []);

  const fetchContributionStats = async () => {
    try {
      // Basic counts and totals
      const { data: contributions, error } = await supabase
        .from('contributions')
        .select('*');

      // Fetch profiles separately
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, email');

      if (error) throw error;

      const totalContributions = contributions?.length || 0;
      const monetaryContributions = contributions?.filter(c => c.contribution_type === 'monetary').length || 0;
      const nonMonetaryContributions = contributions?.filter(c => c.contribution_type === 'non_monetary').length || 0;
      
      const totalMonetaryValue = contributions
        ?.filter(c => c.contribution_type === 'monetary' && !c.value_private)
        ?.reduce((sum, c) => sum + (c.value_amount || 0), 0) || 0;
      
      const totalNonMonetaryValue = contributions
        ?.filter(c => c.contribution_type === 'non_monetary' && !c.value_private)
        ?.reduce((sum, c) => sum + (c.value_amount || 0), 0) || 0;

      // Top contributors
      const userContributions = new Map();
      contributions?.forEach(contrib => {
        const userId = contrib.user_id;
        const profile = profilesData?.find(p => p.user_id === userId);
        const existing = userContributions.get(userId) || {
          full_name: profile?.full_name || 'Unknown',
          total_value: 0,
          contribution_count: 0
        };
        
        userContributions.set(userId, {
          ...existing,
          total_value: existing.total_value + (contrib.value_private ? 0 : contrib.value_amount || 0),
          contribution_count: existing.contribution_count + 1
        });
      });

      const topContributors = Array.from(userContributions.entries())
        .map(([userId, data]) => ({
          user_id: userId,
          ...data
        }))
        .sort((a, b) => b.total_value - a.total_value)
        .slice(0, 5);

      // Contribution types
      const contributionTypes = [
        {
          type: 'Monetary',
          count: monetaryContributions,
          total_value: totalMonetaryValue
        },
        {
          type: 'Non-Monetary',
          count: nonMonetaryContributions,
          total_value: totalNonMonetaryValue
        }
      ];

      // Monthly data (last 6 months)
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStr = date.toISOString().slice(0, 7); // YYYY-MM
        
        const monthContribs = contributions?.filter(c => 
          c.created_at.startsWith(monthStr)
        ) || [];
        
        const monetary = monthContribs
          .filter(c => c.contribution_type === 'monetary' && !c.value_private)
          .reduce((sum, c) => sum + (c.value_amount || 0), 0);
        
        const nonMonetary = monthContribs
          .filter(c => c.contribution_type === 'non_monetary' && !c.value_private)
          .reduce((sum, c) => sum + (c.value_amount || 0), 0);

        monthlyData.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          monetary,
          non_monetary: nonMonetary
        });
      }

      setStats({
        total_contributions: totalContributions,
        total_monetary_value: totalMonetaryValue,
        total_non_monetary_value: totalNonMonetaryValue,
        monetary_contributions: monetaryContributions,
        non_monetary_contributions: nonMonetaryContributions,
        top_contributors: topContributors,
        contribution_types: contributionTypes,
        monthly_contributions: monthlyData
      });
    } catch (error) {
      console.error('Error fetching contribution stats:', error);
    }
  };

  const fetchRecentContributions = async () => {
    try {
      const { data: contributions, error } = await supabase
        .from('contributions')
        .select('id, organization_name, role, value_amount, contribution_type, created_at, value_private, user_id')
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch profiles separately
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name');

      if (error) throw error;

      setRecentContributions(contributions?.map(contrib => {
        const profile = profilesData?.find(p => p.user_id === contrib.user_id);
        return {
          id: contrib.id,
          organization_name: contrib.organization_name,
          role: contrib.role || 'Not specified',
          value_amount: contrib.value_private ? 0 : contrib.value_amount || 0,
          contribution_type: contrib.contribution_type,
          created_at: contrib.created_at,
          contributor: { full_name: profile?.full_name || 'Unknown' }
        };
      }) || []);
    } catch (error) {
      console.error('Error fetching recent contributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))'];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading contribution analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <HandCoins className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Contribution Analytics</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_contributions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monetary Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats?.total_monetary_value || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.monetary_contributions} contributions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Non-Monetary Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats?.total_non_monetary_value || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.non_monetary_contributions} contributions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency((stats?.total_monetary_value || 0) + (stats?.total_non_monetary_value || 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Contribution Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.monthly_contributions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="monetary" stackId="a" fill="hsl(var(--primary))" name="Monetary" />
                <Bar dataKey="non_monetary" stackId="a" fill="hsl(var(--secondary))" name="Non-Monetary" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Contribution Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.contribution_types}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, count }) => `${type}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats?.contribution_types.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Contributors & Recent Contributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Contributors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.top_contributors.map((contributor, index) => (
                <div key={contributor.user_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{contributor.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {contributor.contribution_count} contributions
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {formatCurrency(contributor.total_value)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentContributions.map((contribution) => (
                <div key={contribution.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{contribution.contributor?.full_name}</p>
                    <Badge variant={contribution.contribution_type === 'monetary' ? 'default' : 'secondary'}>
                      {contribution.contribution_type}
                    </Badge>
                  </div>
                  <p className="text-sm">{contribution.organization_name}</p>
                  <p className="text-xs text-muted-foreground">{contribution.role}</p>
                  {contribution.value_amount > 0 && (
                    <p className="text-sm font-medium text-green-600">
                      {formatCurrency(contribution.value_amount)}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(contribution.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}