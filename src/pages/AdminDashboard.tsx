import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Users,
  Building,
  MessageSquare,
  TrendingUp,
  Shield,
  Eye,
  Trash2,
  Settings
} from 'lucide-react';
import { DevelopmentModeToggle } from '@/components/admin/DevelopmentModeToggle';
import { LandingStatsConfig } from '@/components/admin/LandingStatsConfig';
import { Separator } from '@/components/ui/separator';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useDashboardCharts } from '@/hooks/useDashboardCharts';
import { useAlumniManagement, AlumniProfile } from '@/hooks/useAlumniManagement';
import { AlumniFilters } from '@/components/admin/AlumniFilters';
import { AlumniDataTable } from '@/components/admin/AlumniDataTable';
import { useBusinessManagement, BusinessWithOwner } from '@/hooks/useBusinessManagement';
import { BusinessFilters } from '@/components/admin/BusinessFilters';
import { BusinessDataTable } from '@/components/admin/BusinessDataTable';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

// Chart colors for pie chart
const CHART_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300',
  '#00C49F', '#FFBB28', '#FF8042', '#0088FE', '#cccccc'
];

// Interfaces for data types
interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  is_verified: boolean;
  profile_completed: boolean;
  course: string;
  graduation_year: number;
  created_at: string;
  location: string;
  profile_visibility: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  assigned_at: string;
}

interface Business {
  id: string;
  business_name: string;
  user_id: string;
  industry: string;
  location: string;
  website: string;
  description: string;
  created_at: string;
}

interface DashboardStats {
  totalUsers: number;
  verifiedUsers: number;
  pendingVerification: number;
  totalBusinesses: number;
  totalMessages: number;
  activeConversations: number;
  profileCompletionRate: number;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Use the centralized stats hook for weighted profile completion
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();

  // Use the charts hook for graduation year and location distribution
  const { data: chartData, isLoading: chartsLoading } = useDashboardCharts();

  // Alumni management hook
  const {
    alumni,
    totalCount,
    page,
    totalPages,
    setPage,
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    filterOptions,
    isLoading: alumniLoading,
    refetch: refetchAlumni
  } = useAlumniManagement();

  // Business management hook
  const {
    businesses: managedBusinesses,
    totalCount: businessTotalCount,
    page: businessPage,
    totalPages: businessTotalPages,
    setPage: setBusinessPage,
    filters: businessFilters,
    updateFilter: updateBusinessFilter,
    resetFilters: resetBusinessFilters,
    hasActiveFilters: hasActiveBusinessFilters,
    filterOptions: businessFilterOptions,
    isLoading: businessLoading,
    refetch: refetchBusinesses
  } = useBusinessManagement();

  const [isDeletingBusiness, setIsDeletingBusiness] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) return;

    try {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError || !roleData) {
        toast.error('Access denied. Admin privileges required.');
        return;
      }

      await fetchDashboardData();
    } catch (error) {
      console.error('Error checking admin access:', error);
      toast.error('Error verifying admin access');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all necessary data in parallel
      const [profilesResult, rolesResult, businessesResult, messagesResult, conversationsResult] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('*'),
        supabase.from('user_businesses').select('*').order('created_at', { ascending: false }),
        supabase.from('messages').select('id, created_at').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('conversations').select('id, updated_at').gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ]);

      if (profilesResult.error) throw profilesResult.error;
      if (rolesResult.error) throw rolesResult.error;
      if (businessesResult.error) throw businessesResult.error;

      const profilesData = profilesResult.data || [];
      const rolesData = rolesResult.data || [];
      const businessesData = businessesResult.data || [];
      const messagesData = messagesResult.data || [];
      const conversationsData = conversationsResult.data || [];

      setProfiles(profilesData);
      setUserRoles(rolesData);
      setBusinesses(businessesData);

      // Calculate real metrics
      const verifiedUsers = profilesData.filter(p => p.is_verified).length;
      const pendingVerification = profilesData.filter(p => !p.is_verified).length;
      const completedProfiles = profilesData.filter(p => p.profile_completed).length;
      const profileCompletionRate = profilesData.length > 0 ? (completedProfiles / profilesData.length) * 100 : 0;

      // Generate recent activity from real data
      const recentActivity = [
        ...profilesData.slice(0, 3).map(p => ({
          type: 'user_signup',
          description: `${p.full_name || 'New user'} joined`,
          timestamp: p.created_at
        })),
        ...businessesData.slice(0, 2).map(b => ({
          type: 'business_added',
          description: `New business: ${b.business_name}`,
          timestamp: b.created_at
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

      const dashboardStats: DashboardStats = {
        totalUsers: profilesData.length,
        verifiedUsers,
        pendingVerification,
        totalBusinesses: businessesData.length,
        totalMessages: messagesData.length,
        activeConversations: conversationsData.length,
        profileCompletionRate,
        recentActivity
      };

      setStats(dashboardStats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateProfileVerification = async (profileId: string, userId: string, isVerified: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: isVerified })
        .eq('id', profileId);

      if (error) throw error;

      // If user is being verified, automatically assign alumni role
      if (isVerified) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: 'alumni' })
          .eq('user_id', userId);

        if (roleError) {
          console.error('Error updating role:', roleError);
          // Still show success for verification even if role update fails
        } else {
          // Update local state for roles
          setUserRoles(prev => prev.map(r => 
            r.user_id === userId ? { ...r, role: 'alumni' } : r
          ));
        }
      }

      setProfiles(prev => prev.map(p => 
        p.id === profileId ? { ...p, is_verified: isVerified } : p
      ));

      toast.success(`Profile ${isVerified ? 'verified and granted alumni access' : 'unverified'} successfully`);
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error('Failed to update verification status');
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'alumni' | 'pending') => {
    try {
      const { error } = await supabase.rpc('admin_update_user_role', {
        target_user_id: userId,
        new_role: newRole
      });

      if (error) throw error;

      setUserRoles(prev => prev.map(r =>
        r.user_id === userId ? { ...r, role: newRole } : r
      ));

      toast.success('User role updated successfully');
      refetchAlumni();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    }
  };

  const deleteBusiness = async (businessId: string) => {
    if (!confirm('Are you sure you want to delete this business?')) return;

    try {
      const { error } = await supabase
        .from('user_businesses')
        .delete()
        .eq('id', businessId);

      if (error) throw error;

      setBusinesses(prev => prev.filter(b => b.id !== businessId));
      toast.success('Business deleted successfully');
    } catch (error) {
      console.error('Error deleting business:', error);
      toast.error('Failed to delete business');
    }
  };

  const deleteBusinessItem = async (business: BusinessWithOwner) => {
    if (!user) return;

    try {
      setIsDeletingBusiness(true);

      // Log to audit
      const { error: auditError } = await supabase
        .from('security_audit_log')
        .insert({
          event_type: 'business_deletion',
          user_id: user.id,
          resource_type: 'business',
          resource_id: business.id,
          action: 'admin_deleted_business',
          metadata: {
            deleted_business_name: business.business_name,
            deleted_business_owner: business.owner_name || business.owner_email,
            deleted_by_admin_id: user.id,
            timestamp: new Date().toISOString()
          }
        });

      if (auditError) {
        console.error('Error logging to audit:', auditError);
      }

      // Delete the business
      const { error } = await supabase
        .from('user_businesses')
        .delete()
        .eq('id', business.id);

      if (error) throw error;

      toast.success(`Business "${business.business_name}" has been deleted`);
      refetchBusinesses();
    } catch (error) {
      console.error('Error deleting business:', error);
      toast.error('Failed to delete business');
    } finally {
      setIsDeletingBusiness(false);
    }
  };

  const deleteUser = async (profile: Profile | AlumniProfile) => {
    if (!user) return;

    try {
      setIsDeleting(true);

      // First, log the deletion to audit log
      const { error: auditError } = await supabase
        .from('security_audit_log')
        .insert({
          event_type: 'user_deletion',
          user_id: user.id,
          resource_type: 'user',
          resource_id: profile.user_id,
          action: 'admin_deleted_user',
          metadata: {
            deleted_user_email: profile.email,
            deleted_user_name: profile.full_name,
            deleted_by_admin_id: user.id,
            timestamp: new Date().toISOString()
          }
        });

      if (auditError) {
        console.error('Error logging to audit:', auditError);
        // Continue with deletion even if audit logging fails
      }

      // Delete the profile (CASCADE will handle related data)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', profile.user_id);

      if (error) throw error;

      // Update local state
      setProfiles(prev => prev.filter(p => p.user_id !== profile.user_id));
      setUserRoles(prev => prev.filter(r => r.user_id !== profile.user_id));

      toast.success(`User ${profile.full_name || profile.email} has been deleted`);
      refetchAlumni();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleForUser = (userId: string) => {
    const userRole = userRoles.find(r => r.user_id === userId);
    return userRole?.role || 'pending';
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'alumni': return 'default';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Badge variant="destructive" className="gap-2">
          <Shield className="h-4 w-4" />
          Admin Access
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.verifiedUsers || 0} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Businesses</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBusinesses || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active listings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages (7d)</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMessages || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeConversations || 0} active chats
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : `${dashboardStats?.avgProfileCompletion || 0}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              {(dashboardStats?.avgProfileCompletion || 0) >= 75
                ? 'Excellent completion'
                : (dashboardStats?.avgProfileCompletion || 0) >= 50
                ? 'Good completion'
                : 'Needs improvement'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      {chartsLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graduation Year Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Alumni by Graduation Year</CardTitle>
              <CardDescription>Distribution of alumni across graduation years</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData?.graduationYears.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.graduationYears}>
                    <XAxis dataKey="year" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" name="Alumni" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No graduation year data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Alumni by Location</CardTitle>
              <CardDescription>Geographic distribution of alumni</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData?.locations.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.locations}
                      dataKey="count"
                      nameKey="country"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ country, percent }) => `${country} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {chartData.locations.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No location data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest platform activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-primary rounded-full" />
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) || <p className="text-muted-foreground">No recent activity</p>}
          </div>
        </CardContent>
      </Card>

      {/* Management Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="businesses">Business Management</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Alumni Management
              </CardTitle>
              <CardDescription>
                Search, filter, and manage alumni accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AlumniFilters
                filters={filters}
                filterOptions={filterOptions}
                updateFilter={updateFilter}
                resetFilters={resetFilters}
                hasActiveFilters={hasActiveFilters}
                totalCount={totalCount}
              />
              <AlumniDataTable
                alumni={alumni}
                isLoading={alumniLoading}
                currentUserId={user?.id}
                onDelete={deleteUser}
                onUpdateRole={updateUserRole}
                isDeleting={isDeleting}
                page={page}
                totalPages={totalPages}
                totalCount={totalCount}
                onPageChange={setPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="businesses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Business Management
              </CardTitle>
              <CardDescription>
                Search, filter, and manage business listings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <BusinessFilters
                filters={businessFilters}
                filterOptions={businessFilterOptions}
                updateFilter={updateBusinessFilter}
                resetFilters={resetBusinessFilters}
                hasActiveFilters={hasActiveBusinessFilters}
                totalCount={businessTotalCount}
              />
              <BusinessDataTable
                businesses={managedBusinesses}
                isLoading={businessLoading}
                onDelete={deleteBusinessItem}
                isDeleting={isDeletingBusiness}
                page={businessPage}
                totalPages={businessTotalPages}
                totalCount={businessTotalCount}
                onPageChange={setBusinessPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure system-wide settings and development options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <DevelopmentModeToggle />
              <Separator />
              <LandingStatsConfig />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}