import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Briefcase,
  Award,
  Heart,
  ExternalLink,
  Building2,
  Edit,
  Settings,
  Globe,
  Linkedin,
  Github,
  Twitter,
  Facebook,
  Instagram,
  GraduationCap,
  EyeOff
} from 'lucide-react';
import { StartChatButton } from '@/components/chat/StartChatButton';
import { toast } from 'sonner';
import { formatCourseName } from '@/lib/courseUtils';
import { LocationBadge } from '@/components/ui/location-badge';

const ProfileView = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Define fetchProfile BEFORE it's used in useEffect
  const fetchProfile = useCallback(async (targetUserId: string) => {
    try {
      setLoading(true);

      // For "me" route, ensure we have authentication
      if (userId === 'me' && !user) {
        console.error('No user found for /profile/me route');
        throw new Error('Authentication required');
      }

      // Debug log the userId parameter
      console.log('Fetching profile for targetUserId:', targetUserId);
      console.log('Current authenticated user:', user?.id);

      // Optimize: Fetch only the specific profile instead of all profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }

      if (!profileData) {
        console.log('No profile found for targetUserId:', targetUserId);
        // Special handling for "me" route
        if (userId === 'me' && user) {
          console.log('Creating profile redirect for authenticated user without profile');
          // User is authenticated but has no profile - redirect to onboarding
          navigate('/abud/onboarding');
          return;
        }
        setProfile(null);
        return;
      }

      // Check privacy settings
      const isOwnProfile = user?.id === targetUserId;
      const visibility = profileData.profile_visibility || 'public';

      // If private and not owner, deny access
      if (visibility === 'private' && !isOwnProfile) {
        toast.error('This profile is private');
        navigate('/abud/directory/alumni');
        return;
      }

      // If alumni_only and not authenticated, deny access
      if (visibility === 'alumni_only' && !user) {
        toast.error('Please sign in to view this profile');
        navigate('/abud/auth');
        return;
      }

      // Fetch career history
      const { data: careerHistory } = await supabase
        .from('career_history')
        .select('*')
        .eq('user_id', targetUserId)
        .order('start_date', { ascending: false });

      // Fetch businesses
      const { data: businesses } = await supabase
        .from('user_businesses')
        .select('*')
        .eq('user_id', targetUserId)
        .order('start_date', { ascending: false });

      // Fetch achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', targetUserId)
        .order('date_achieved', { ascending: false });

      // Fetch contributions
      const { data: contributions } = await supabase
        .from('contributions')
        .select('*')
        .eq('user_id', targetUserId)
        .order('start_date', { ascending: false });

      // Fetch education
      const { data: education } = await supabase
        .from('user_education')
        .select('*')
        .eq('user_id', targetUserId)
        .order('is_primary', { ascending: false });

      // Fetch links
      const { data: userLinks } = await supabase
        .from('user_links')
        .select('*')
        .eq('user_id', targetUserId);

      setProfile({
        ...profileData,
        career_history: careerHistory || [],
        businesses: businesses || [],
        achievements: achievements || [],
        contributions: contributions || [],
        education: education || [],
        user_links: userLinks || []
      });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      if (error?.message === 'Authentication required') {
        toast.error('Please sign in to view this profile');
        navigate('/abud/auth');
      } else {
        toast.error('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, userId]); // Add dependencies for error handling

  // Add auth loading check
  useEffect(() => {
    // Don't fetch if we're waiting for auth to determine the actualUserId
    if (userId === 'me' && !user) {
      // Auth is still loading, wait for it
      return;
    }

    // Calculate actualUserId AFTER confirming user exists
    const actualUserId = userId === 'me' ? user?.id : userId;

    if (actualUserId) {
      fetchProfile(actualUserId);
    }
  }, [userId, user, fetchProfile]); // Fixed dependencies

  // Handle "me" route by using current user's ID for render logic
  const actualUserId = userId === 'me' ? user?.id : userId;
  const isOwnProfile = user?.id === actualUserId;

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        toast.error('Profile loading timed out. Please refresh the page.');
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  const formatDate = (date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getPlatformIcon = (platform: string) => {
    const iconMap: { [key: string]: any } = {
      linkedin: Linkedin,
      github: Github,
      twitter: Twitter,
      facebook: Facebook,
      instagram: Instagram,
      website: Globe,
      portfolio: ExternalLink,
    };

    const Icon = iconMap[platform.toLowerCase()] || ExternalLink;
    return <Icon className="h-4 w-4" />;
  };

  // Hidden field indicator for own profile
  const HiddenIndicator = () => (
    <Badge variant="outline" className="ml-2 text-xs text-muted-foreground gap-1">
      <EyeOff className="h-3 w-3" />
      Hidden
    </Badge>
  );

  // Show auth loading state when waiting for user authentication
  if (userId === 'me' && !user) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Profile not found</h3>
          <p className="text-muted-foreground mb-4">
            This profile may not exist or is not accessible.
          </p>
          <Button asChild>
            <Link to="/abud/directory/alumni">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Directory
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      {/* Back Button */}
      <Button variant="ghost" className="mb-6" asChild>
        <Link to="/abud/directory/alumni">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Alumni Directory
        </Link>
      </Button>

      {/* Profile Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start gap-3 sm:gap-6">
            <Avatar className="h-16 w-16 sm:h-24 sm:w-24">
              <AvatarImage src={profile.avatar_url || ""} alt={profile.full_name} />
              <AvatarFallback className="text-lg sm:text-2xl">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg sm:text-2xl mb-2 min-w-0 flex-1">{profile.full_name}</CardTitle>
                {isOwnProfile && (
                  <div className="flex gap-1 sm:gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/abud/profile/edit')}
                      className="gap-1 sm:gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="hidden sm:inline">Edit Profile</span>
                      <span className="sm:hidden">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/abud/settings')}
                      className="gap-1 sm:gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="hidden sm:inline">Settings</span>
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                {profile.education && profile.education.length > 0 && (
                  <Badge variant="secondary" className="max-w-[120px] sm:max-w-[200px]">
                    <span className="truncate">
                      {formatCourseName(profile.education.find((e: any) => e.is_primary)?.programme_name || profile.education[0]?.programme_name || profile.course)}
                    </span>
                  </Badge>
                )}
                {/* Graduation Year - respect privacy */}
                {(profile.education?.[0]?.graduation_year || profile.graduation_year) &&
                  (isOwnProfile || !profile.hide_graduation_year) && (
                  <div className="flex items-center">
                    <Badge variant="outline" className="gap-1 whitespace-nowrap shrink-0">
                      <Calendar className="h-3 w-3" />
                      <span className="whitespace-nowrap">Class of {profile.education?.[0]?.graduation_year || profile.graduation_year}</span>
                    </Badge>
                    {isOwnProfile && profile.hide_graduation_year && <HiddenIndicator />}
                  </div>
                )}
                {/* Location - respect privacy */}
                {(isOwnProfile || !profile.hide_location) && (
                  <div className="flex items-center">
                    <LocationBadge
                      city={profile.location_city}
                      state={profile.location_state}
                      country={profile.location_country}
                      directoryType="alumni"
                      size="default"
                      truncateMaxWidth="max-w-[100px] sm:max-w-[140px]"
                      className="shrink-0"
                    />
                    {isOwnProfile && profile.hide_location && <HiddenIndicator />}
                  </div>
                )}
              </div>
              {profile.bio && (
                <CardDescription className="text-base">
                  {profile.bio}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        {profile.user_links && profile.user_links.length > 0 && (
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.user_links.map((link: any, index: number) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  asChild
                >
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {getPlatformIcon(link.platform)}
                  </a>
                </Button>
              ))}
              <StartChatButton 
                targetUserId={actualUserId as string}
                variant="default" 
                size="sm" 
                className="gap-2"
              />
            </div>
          </CardContent>
        )}
      </Card>

      <div className="space-y-8">
        {/* Education */}
        {profile.education && profile.education.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.education.map((education: any) => (
                  <div key={education.id} className="flex items-start justify-between p-4 rounded-lg border bg-card/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={education.programme_level === 'undergraduate' ? 'default' : 'secondary'}>
                          {education.programme_level === 'undergraduate' ? 'Undergraduate' : 'Postgraduate'}
                        </Badge>
                        {education.is_primary && (
                          <Badge variant="outline">Primary</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {formatCourseName(education.programme_name)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Class of {education.graduation_year}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Businesses - respect privacy */}
        {profile.businesses && profile.businesses.length > 0 && (isOwnProfile || !profile.hide_businesses) && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Businesses</h2>
              {isOwnProfile && profile.hide_businesses && <HiddenIndicator />}
            </div>
            <div className="space-y-4">
              {profile.businesses.map((business: any) => (
                <div
                  key={business.id}
                  className="p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors cursor-pointer hover:shadow-md"
                  onClick={() => navigate(`/abud/business/${business.id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {business.business_name}
                      </h3>
                      <p className="text-muted-foreground font-medium">{business.position}</p>
                    </div>
                    {business.current_business && (
                      <Badge variant="default">Current</Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {business.industry && (
                      <Badge variant="outline" className="text-xs">
                        {business.industry}
                      </Badge>
                    )}
                    <LocationBadge
                      city={business.location_city}
                      state={business.location_state}
                      country={business.location_country}
                      directoryType="business"
                      size="sm"
                    />
                  </div>

                  {business.description && (
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                      {business.description}
                    </p>
                  )}

                  {business.website && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <a href={business.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Visit Website
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Career History Timeline */}
        {profile.career_history && profile.career_history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Career History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>
                
                {/* Timeline items */}
                <div className="space-y-8">
                  {profile.career_history.map((career: any, index: number) => (
                    <div key={career.id} className="relative flex items-start gap-6">
                      {/* Timeline dot */}
                      <div className="relative z-10 flex h-12 w-12 items-center justify-center">
                        <div className={`h-4 w-4 rounded-full border-2 ${
                          career.current_position 
                            ? 'bg-primary border-primary' 
                            : 'bg-background border-border'
                        }`}></div>
                        {career.current_position && (
                          <div className="absolute h-6 w-6 rounded-full bg-primary/20 animate-pulse"></div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0 pb-8">
                        <div className="flex items-start justify-between mb-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-semibold text-foreground">
                              {career.position}
                            </h3>
                            <h4 className="text-base font-medium text-primary">
                              {career.company_name}
                            </h4>
                          </div>
                          {career.current_position && (
                            <Badge variant="default" className="ml-2 shrink-0">
                              Current Role
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Calendar className="h-3 w-3" />
                            {formatDate(career.start_date)} - {career.end_date ? formatDate(career.end_date) : 'Present'}
                          </Badge>
                          <LocationBadge
                            city={career.location_city}
                            state={career.location_state}
                            country={career.location_country}
                            directoryType="alumni"
                            size="sm"
                          />
                        </div>
                        
                        {career.description && (
                          <p className="text-muted-foreground leading-relaxed">
                            {career.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Achievements */}
        {profile.achievements && profile.achievements.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <Award className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Achievements</h2>
            </div>
            <div className="space-y-3">
              {profile.achievements.map((achievement: any) => (
                <div key={achievement.id} className="py-3 border-b border-border/50 last:border-0">
                  <h3 className="font-semibold text-foreground mb-1">
                    {achievement.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-muted-foreground">
                    {achievement.organization && (
                      <span className="font-medium">{achievement.organization}</span>
                    )}
                    {achievement.date_achieved && (
                      <>
                        {achievement.organization && <span>•</span>}
                        <span>{new Date(achievement.date_achieved).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                  {achievement.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {achievement.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contributions */}
        {profile.contributions && profile.contributions.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <Heart className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Contributions</h2>
            </div>
            <div className="space-y-3">
              {profile.contributions.map((contribution: any) => (
                <div key={contribution.id} className="py-3 border-b border-border/50 last:border-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-foreground">
                      {contribution.organization_name}
                    </h3>
                    {contribution.current_contribution && (
                      <Badge variant="default" className="text-xs ml-2">Current</Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-muted-foreground">
                    {contribution.role && (
                      <span className="font-medium">{contribution.role}</span>
                    )}
                    {contribution.start_date && (
                      <>
                        {contribution.role && <span>•</span>}
                        <span>
                          {formatDate(contribution.start_date)} - {contribution.end_date ? formatDate(contribution.end_date) : 'Present'}
                        </span>
                      </>
                    )}
                  </div>
                  
                  {contribution.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {contribution.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;