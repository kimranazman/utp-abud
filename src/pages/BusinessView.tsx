import { useState, useEffect } from 'react';
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
  ExternalLink,
  Mail,
  Building2,
  Globe,
  User,
  Users,
  Shield,
  Settings,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';

const BusinessView = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [business, setBusiness] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBusinessAdmin, setIsBusinessAdmin] = useState(false);

  useEffect(() => {
    if (businessId) {
      fetchBusiness();
    }
  }, [businessId]);

  const fetchBusiness = async () => {
    try {
      setLoading(true);

      // Fetch business details
      const { data: businessData, error: businessError } = await supabase
        .from('user_businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (businessError) throw businessError;

      // Fetch owner profile
      const { data: ownerData, error: ownerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', businessData.user_id)
        .eq('is_verified', true)
        .single();

      if (ownerError) throw ownerError;

      // Fetch owner's links
      const { data: ownerLinks } = await supabase
        .from('user_links')
        .select('*')
        .eq('user_id', businessData.user_id);

      // Fetch team members
      const { data: teamData, error: teamError } = await supabase
        .from('business_team_members')
        .select(`
          *,
          profiles!inner(
            user_id,
            full_name,
            course,
            graduation_year,
            bio
          )
        `)
        .eq('business_id', businessId);

      if (teamError) {
        console.error('Error fetching team members:', teamError);
        // Don't throw error for team members, just set empty array
        setTeamMembers([]);
      } else {
        setTeamMembers(teamData || []);
      }

      // Fetch business services
      const { data: servicesData, error: servicesError } = await supabase
        .from('business_services')
        .select('*')
        .eq('business_id', businessId)
        .order('display_order', { ascending: true });

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
        setServices([]);
      } else {
        setServices(servicesData || []);
      }

      setBusiness(businessData);
      setOwner({
        ...ownerData,
        user_links: ownerLinks || []
      });

      // Check if current user is business admin
      if (user) {
        const isOwner = businessData.user_id === user.id;
        const isTeamAdmin = teamData?.some(member => 
          member.user_id === user.id && member.is_business_admin
        );
        setIsBusinessAdmin(isOwner || isTeamAdmin);
      }
    } catch (error) {
      console.error('Error fetching business:', error);
      toast.error('Failed to load business details');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!business || !owner) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Business not found</h3>
          <p className="text-muted-foreground mb-4">
            This business may not exist or is not accessible.
          </p>
          <Button asChild>
            <Link to="/abud/directory/business">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Business Directory
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      {/* Header with Back Button and Edit Button */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" asChild>
          <Link to="/abud/directory/business">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Business Directory
          </Link>
        </Button>
        
        {isBusinessAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/abud/business/${businessId}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Business
            </Button>
            <Button variant="outline" onClick={() => navigate(`/abud/business/${businessId}/members`)}>
              <Users className="h-4 w-4 mr-2" />
              Manage Members
            </Button>
          </div>
        )}
      </div>

      {/* Business Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start gap-6">
            <div className="h-24 w-24 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
              {business.logo_url ? (
                <img 
                  src={business.logo_url} 
                  alt={`${business.business_name} logo`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="h-12 w-12 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{business.business_name}</CardTitle>
              <div className="flex flex-wrap gap-2 mb-3">
                {business.industry && (
                  <Badge 
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => navigate(`/abud/directory/business?industry=${encodeURIComponent(business.industry)}`)}
                  >
                    {business.industry}
                  </Badge>
                )}
                {business.location && (
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    {business.location}
                  </Badge>
                )}
                {business.ownership_type && (
                  <Badge variant="outline">
                    {business.ownership_type}
                  </Badge>
                )}
                {business.current_business && (
                  <Badge variant="default">Active</Badge>
                )}
              </div>
              <CardDescription className="text-lg font-medium mb-2">
                {business.position}
              </CardDescription>
              {business.description && (
                <CardDescription className="text-base">
                  {business.description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {business.website && (
              <Button variant="outline" className="gap-2" asChild>
                <a href={business.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4" />
                  Visit Website
                </a>
              </Button>
            )}
            <Button variant="default" className="gap-2">
              <Mail className="h-4 w-4" />
              Contact Business
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Duration</h4>
                <p className="text-sm">
                  {formatDate(business.start_date)} - {business.end_date ? formatDate(business.end_date) : 'Present'}
                </p>
              </div>
              
              {business.industry && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Industry</h4>
                  <p className="text-sm">{business.industry}</p>
                </div>
              )}
              
              {business.ownership_type && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Ownership Type</h4>
                  <p className="text-sm">{business.ownership_type}</p>
                </div>
              )}
              
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Role</h4>
                <p className="text-sm">{business.position}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Owner Information */}
        <Link to={`/abud/profile/${owner.user_id}`} className="block">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-4 w-4" />
                Business Owner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={owner.avatar_thumbnail_url || owner.avatar_url || ""} alt={owner.full_name} />
                  <AvatarFallback className="text-sm">
                    {getInitials(owner.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-base truncate">{owner.full_name}</h4>
                  <p className="text-sm text-muted-foreground">{business.position}</p>
                  <div className="flex gap-2 mt-1">
                    {owner.course && (
                      <Badge variant="secondary" className="text-xs">
                        {owner.course}
                      </Badge>
                    )}
                    {owner.graduation_year && (
                      <Badge variant="outline" className="text-xs">
                        {owner.graduation_year}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Team Members Section */}
      {teamMembers.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members ({teamMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member) => (
                <Link
                  key={member.id}
                  to={`/abud/profile/${member.user_id}`}
                  className="block"
                >
                  <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.profiles.avatar_thumbnail_url || member.profiles.avatar_url || ""} alt={member.profiles.full_name} />
                          <AvatarFallback className="text-xs">
                            {getInitials(member.profiles.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm truncate">
                              {member.profiles.full_name}
                            </h4>
                            {member.is_business_admin && (
                              <div title="Business Admin">
                                <Shield className="h-3 w-3 text-primary" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{member.role}</p>
                          <div className="flex gap-1">
                            {member.profiles.course && (
                              <Badge variant="secondary" className="text-xs">
                                {member.profiles.course}
                              </Badge>
                            )}
                            {member.profiles.graduation_year && (
                              <Badge variant="outline" className="text-xs">
                                {member.profiles.graduation_year}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services Section */}
      {services.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Services ({services.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <Card key={service.id} className="border">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-base mb-2">{service.service_name}</h4>
                    {service.description && (
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BusinessView;