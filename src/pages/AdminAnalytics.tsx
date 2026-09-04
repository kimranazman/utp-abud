import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Building, MessageCircle, Calendar, Award, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

interface AnalyticsData {
  user_growth: Array<{ month: string; total: number; new_users: number; }>;
  business_growth: Array<{ month: string; total: number; new_businesses: number; }>;
  message_activity: Array<{ month: string; messages: number; conversations: number; }>;
  contribution_trends: Array<{ month: string; monetary: number; non_monetary: number; total_value: number; }>;
  graduation_year_distribution: Array<{ year: number; count: number; }>;
  location_distribution: Array<{ location: string; count: number; }>;
  industry_distribution: Array<{ industry: string; count: number; }>;
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch all required data
      const [
        profilesResult,
        businessesResult,
        messagesResult,
        conversationsResult,
        contributionsResult
      ] = await Promise.all([
        supabase.from('profiles').select('created_at, graduation_year, location'),
        supabase.from('user_businesses').select('created_at, industry'),
        supabase.from('messages').select('created_at'),
        supabase.from('conversations').select('created_at'),
        supabase.from('contributions').select('created_at, contribution_type, value_amount, value_private')
      ]);

      // Process user growth (last 12 months)
      const userGrowth = [];
      let cumulativeUsers = 0;
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStr = date.toISOString().slice(0, 7);
        
        const newUsers = profilesResult.data?.filter(p => 
          p.created_at.startsWith(monthStr)
        ).length || 0;
        
        cumulativeUsers += newUsers;
        
        userGrowth.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          total: cumulativeUsers,
          new_users: newUsers
        });
      }

      // Process business growth
      const businessGrowth = [];
      let cumulativeBusinesses = 0;
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStr = date.toISOString().slice(0, 7);
        
        const newBusinesses = businessesResult.data?.filter(b => 
          b.created_at.startsWith(monthStr)
        ).length || 0;
        
        cumulativeBusinesses += newBusinesses;
        
        businessGrowth.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          total: cumulativeBusinesses,
          new_businesses: newBusinesses
        });
      }

      // Process message activity
      const messageActivity = [];
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStr = date.toISOString().slice(0, 7);
        
        const messages = messagesResult.data?.filter(m => 
          m.created_at.startsWith(monthStr)
        ).length || 0;
        
        const conversations = conversationsResult.data?.filter(c => 
          c.created_at.startsWith(monthStr)
        ).length || 0;
        
        messageActivity.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          messages,
          conversations
        });
      }

      // Process contribution trends
      const contributionTrends = [];
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStr = date.toISOString().slice(0, 7);
        
        const monthContribs = contributionsResult.data?.filter(c => 
          c.created_at.startsWith(monthStr)
        ) || [];
        
        const monetary = monthContribs
          .filter(c => c.contribution_type === 'monetary' && !c.value_private)
          .reduce((sum, c) => sum + (c.value_amount || 0), 0);
        
        const nonMonetary = monthContribs
          .filter(c => c.contribution_type === 'non_monetary' && !c.value_private)
          .reduce((sum, c) => sum + (c.value_amount || 0), 0);
        
        contributionTrends.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          monetary,
          non_monetary: nonMonetary,
          total_value: monetary + nonMonetary
        });
      }

      // Process graduation year distribution
      const graduationYearMap = new Map();
      profilesResult.data?.forEach(profile => {
        if (profile.graduation_year) {
          const count = graduationYearMap.get(profile.graduation_year) || 0;
          graduationYearMap.set(profile.graduation_year, count + 1);
        }
      });
      
      const graduationYearDistribution = Array.from(graduationYearMap.entries())
        .map(([year, count]) => ({ year, count }))
        .sort((a, b) => a.year - b.year);

      // Process location distribution (top 10)
      const locationMap = new Map();
      profilesResult.data?.forEach(profile => {
        if (profile.location) {
          const count = locationMap.get(profile.location) || 0;
          locationMap.set(profile.location, count + 1);
        }
      });
      
      const locationDistribution = Array.from(locationMap.entries())
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Process industry distribution (top 10)
      const industryMap = new Map();
      businessesResult.data?.forEach(business => {
        if (business.industry) {
          const count = industryMap.get(business.industry) || 0;
          industryMap.set(business.industry, count + 1);
        }
      });
      
      const industryDistribution = Array.from(industryMap.entries())
        .map(([industry, count]) => ({ industry, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setAnalytics({
        user_growth: userGrowth,
        business_growth: businessGrowth,
        message_activity: messageActivity,
        contribution_trends: contributionTrends,
        graduation_year_distribution: graduationYearDistribution,
        location_distribution: locationDistribution,
        industry_distribution: industryDistribution
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Advanced Analytics</h1>
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Growth (12 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics?.user_growth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} name="Total Users" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Business Growth (12 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics?.business_growth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" fillOpacity={0.3} name="Total Businesses" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity & Contribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Message Activity (12 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.message_activity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="messages" stroke="hsl(var(--primary))" strokeWidth={2} name="Messages" />
                <Line type="monotone" dataKey="conversations" stroke="hsl(var(--secondary))" strokeWidth={2} name="Conversations" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Contribution Value Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.contribution_trends}>
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
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Graduation Years
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics?.graduation_year_distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.location_distribution.map((location, index) => (
                <div key={location.location} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-sm truncate font-medium">{location.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ 
                          width: `${Math.min((location.count / (analytics?.location_distribution[0]?.count || 1)) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold min-w-[30px] text-right">{location.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Industries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.industry_distribution.map((industry, index) => (
                <div key={industry.industry} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-secondary"></div>
                    <span className="text-sm truncate font-medium">{industry.industry}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-secondary transition-all duration-300"
                        style={{ 
                          width: `${Math.min((industry.count / (analytics?.industry_distribution[0]?.count || 1)) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold min-w-[30px] text-right">{industry.count}</span>
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