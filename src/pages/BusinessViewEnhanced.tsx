import { useState, useEffect, useRef } from 'react';
import type { ComponentType, ReactNode } from 'react';
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
  Edit,
  Phone,
  MessageSquare,
  Award,
  TrendingUp,
  Target,
  Package,
  CheckCircle,
  BarChart3,
  FileText,
  Share2,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Github
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCourseName } from '@/lib/courseUtils';
import { locations } from '@/data/locations';
import { LocationBadge } from '@/components/ui/location-badge';

const BusinessViewEnhanced = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [business, setBusiness] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [businessLinks, setBusinessLinks] = useState<any[]>([]);
  const [contactMethods, setContactMethods] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBusinessAdmin, setIsBusinessAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'services' | 'team'>('overview');

  const overviewRef = useRef<HTMLDivElement | null>(null);
  const servicesRef = useRef<HTMLDivElement | null>(null);
  const teamRef = useRef<HTMLDivElement | null>(null);

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
        .single();

      if (ownerError) throw ownerError;

      // Fetch owner's links
      const { data: ownerLinks } = await supabase
        .from('user_links')
        .select('*')
        .eq('user_id', businessData.user_id);

      // Fetch team members
      const { data: teamData } = await supabase
        .from('business_team_members')
        .select(`
          *,
          profiles!inner(
            user_id,
            full_name,
            course,
            graduation_year,
            bio,
            avatar_url
          )
        `)
        .eq('business_id', businessId);

      // Fetch business services with categories
      const { data: servicesData } = await supabase
        .from('business_services')
        .select(`
          *,
          service_categories (
            id,
            name,
            slug,
            icon
          )
        `)
        .eq('business_id', businessId)
        .order('display_order', { ascending: true });

      // Fetch business links
      const { data: businessLinksData } = await supabase
        .from('business_links')
        .select('*')
        .eq('business_id', businessId);

      // Fetch contact methods
      const { data: contactData } = await supabase
        .from('business_contact')
        .select('*')
        .eq('business_id', businessId)
        .order('is_primary', { ascending: false });

      // Fetch achievements
      const { data: achievementsData } = await supabase
        .from('business_achievements')
        .select('*')
        .eq('business_id', businessId)
        .order('display_order', { ascending: true });

      // Fetch business metrics
      const { data: metricsData } = await supabase
        .from('business_metrics')
        .select('*')
        .eq('business_id', businessId)
        .order('display_order', { ascending: true });

      setBusiness(businessData);
      setOwner({ ...ownerData, links: ownerLinks || [] });
      setTeamMembers(teamData || []);
      setServices(servicesData || []);
      setBusinessLinks(businessLinksData || []);
      setContactMethods(contactData || []);
      setAchievements(achievementsData || []);
      setMetrics(metricsData || []);

      // Check if current user is the business owner
      if (user?.id === businessData.user_id) {
        setIsBusinessAdmin(true);
      }
    } catch (error) {
      console.error('Error fetching business:', error);
      toast.error('Failed to load business details');
    } finally {
      setLoading(false);
    }
  };

  const getSocialIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    switch (platformLower) {
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      case 'twitter': return <Twitter className="h-4 w-4" />;
      case 'facebook': return <Facebook className="h-4 w-4" />;
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'youtube': return <Youtube className="h-4 w-4" />;
      case 'github': return <Github className="h-4 w-4" />;
      case 'website': return <Globe className="h-4 w-4" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };


  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section-id');
            if (sectionId === 'overview' || sectionId === 'services' || sectionId === 'team') {
              setActiveSection(sectionId);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-50% 0px -40% 0px',
        threshold: 0
      }
    );

    const register = (element: HTMLDivElement | null, sectionId: 'overview' | 'services' | 'team') => {
      if (!element) return;
      element.setAttribute('data-section-id', sectionId);
      observer.observe(element);
    };

    register(overviewRef.current, 'overview');
    register(servicesRef.current, 'services');
    register(teamRef.current, 'team');

    return () => {
      observer.disconnect();
    };
  }, [loading, services.length, teamMembers.length]);

  // Early returns after hooks to comply with React Rules of Hooks
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!business || !owner) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Business not found</p>
            <Button onClick={() => navigate('/abud/directory/business')} className="mt-4">
              Back to Directory
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Process metrics data for display
  const getMetricValue = (type: string) => {
    const metric = metrics.find(m => m.metric_type === type);
    return metric ? metric.metric_value : null;
  };

  // Helper function to format location display
  const formatLocationDisplay = (locationValue: string): string => {
    if (!locationValue) return '';

    // Try to find the location in our locations data
    const location = locations.find(loc => loc.value === locationValue);
    if (location) {
      return location.label;
    }

    // If not found in locations data, try to format it nicely
    // Handle slug format like "kuala-lumpur-malaysia"
    if (locationValue.includes('-')) {
      const parts = locationValue.split('-');
      // Capitalize each part and join with appropriate separators
      const formatted = parts.map((part, index) => {
        // Capitalize first letter of each word
        const capitalized = part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();

        // Add comma before the last part if it looks like a country
        if (index === parts.length - 1 && parts.length > 1) {
          // Common country names that might appear
          const countries = ['malaysia', 'singapore', 'usa', 'uk', 'australia', 'canada', 'japan'];
          if (countries.includes(part.toLowerCase())) {
            return `, ${capitalized}`;
          }
        }
        return capitalized;
      }).join(' ');

      return formatted;
    }

    // Return as-is if no special formatting needed
    return locationValue;
  };

  const formatWhatsappUrl = (value: string) => {
    const digitsOnly = value.replace(/[^\d]/g, '');
    return `https://wa.me/${digitsOnly}`;
  };

  // Helper function to format contact URLs for clickable links
  const formatContactUrl = (type: string, value: string): string => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return '#';

    switch(type) {
      case 'whatsapp':
        return formatWhatsappUrl(trimmedValue);
      case 'telegram':
        // Support username (with or without @) or phone number
        if (trimmedValue.startsWith('@')) {
          return `https://t.me/${trimmedValue.substring(1)}`;
        } else if (trimmedValue.match(/^[a-zA-Z0-9_]+$/)) {
          // Looks like a username without @
          return `https://t.me/${trimmedValue}`;
        } else {
          // Assume it's a phone number
          const phoneDigits = trimmedValue.replace(/[^\d]/g, '');
          return `https://t.me/+${phoneDigits}`;
        }
      case 'phone':
        return `tel:${trimmedValue}`;
      case 'email':
        return `mailto:${trimmedValue}`;
      case 'linkedin':
        // Handle both full URLs and usernames
        if (trimmedValue.includes('linkedin.com')) {
          return trimmedValue.match(/^https?:\/\//) ? trimmedValue : `https://${trimmedValue}`;
        }
        return `https://linkedin.com/in/${trimmedValue}`;
      case 'website':
        // Add https:// if no protocol specified
        return trimmedValue.match(/^https?:\/\//) ? trimmedValue : `https://${trimmedValue}`;
      default:
        return trimmedValue;
    }
  };

  const businessMetrics = {
    established: business.year_established || (business.start_date ? new Date(business.start_date).getFullYear() : null),
    employees: getMetricValue('employees') || teamMembers.length + 1,
    projects: getMetricValue('projects'),
    clients: getMetricValue('clients'),
    revenue_growth: getMetricValue('revenue_growth'),
    market_share: getMetricValue('market_share'),
    customer_satisfaction: getMetricValue('customer_satisfaction')
  };

  const heroDescription = business.tagline
    || business.short_description
    || (business.description
      ? `${business.description.slice(0, 160)}${business.description.length > 160 ? '…' : ''}`
      : null);

  const primaryContact = contactMethods.find((contact) => contact.is_primary) || contactMethods[0];
  const primaryEmail = contactMethods.find((contact) => contact.contact_type === 'email');
  const primaryPhone = contactMethods.find((contact) => contact.contact_type === 'phone');
  const whatsappContact = contactMethods.find((contact) => contact.contact_type === 'whatsapp');
  const primaryContactMethod = primaryEmail || primaryPhone || whatsappContact || primaryContact;
  const websiteUrl = business.website || (businessLinks[0]?.url ?? null);
  const formattedWebsite = websiteUrl ? websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') : null;

  type SnapshotItem = {
    icon: ComponentType<{ className?: string }>;
    label: string;
    value: ReactNode | null;
  };

  const formatBusinessLocation = () => {
    const parts = [];
    if (business.location_city) parts.push(business.location_city);
    if (business.location_state) parts.push(business.location_state);
    if (business.location_country) parts.push(business.location_country);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  const snapshotItems: SnapshotItem[] = [
    { icon: MapPin, label: 'Headquarters', value: formatBusinessLocation() },
    { icon: Briefcase, label: 'Industry', value: business.industry },
    { icon: Shield, label: 'Ownership', value: business.ownership_type },
    { icon: Calendar, label: 'Founded', value: businessMetrics.established },
    { icon: Users, label: 'Team Size', value: business.employee_count_range ? `${business.employee_count_range} employees` : null },
    {
      icon: Globe,
      label: 'Website',
      value: formattedWebsite ? (
        <a
          href={websiteUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-primary hover:underline"
        >
          {formattedWebsite}
        </a>
      ) : null
    },
    {
      icon: User,
      label: 'Founder',
      value: owner.full_name ? (
        <Link to={`/abud/profile/${owner.user_id}`} className="text-sm font-medium text-primary hover:underline">
          {owner.full_name}
        </Link>
      ) : null
    }
  ];

  const hasSnapshotItems = snapshotItems.some((item) => item.value);

  const sections = [
    { id: 'overview' as const, label: 'Overview', icon: FileText, ref: overviewRef },
    { id: 'services' as const, label: 'Services', icon: Package, ref: servicesRef },
    { id: 'team' as const, label: 'Team', icon: Users, ref: teamRef }
  ];

  const scrollToSection = (sectionId: 'overview' | 'services' | 'team') => {
    const targetRef = sections.find(section => section.id === sectionId)?.ref;
    const element = targetRef?.current;
    if (!element) return;

    const offset = 96; // account for fixed header
    const elementTop = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: elementTop - offset, behavior: 'smooth' });
    setActiveSection(sectionId);
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') return;

    const shareUrl = window.location.href;
    const shareMessage = `Explore ${business.business_name} on UTP Alumni Connect`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: business.business_name,
          text: shareMessage,
          url: shareUrl,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard');
      } else {
        throw new Error('Sharing not supported');
      }
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        return;
      }
      toast.error('Unable to share this business right now.');
    }
  };

  const handlePrimaryContact = () => {
    if (typeof window === 'undefined' || !primaryContactMethod) {
      return;
    }

    const value = (primaryContactMethod.contact_value || '').trim();

    if (!value) {
      toast.info('Contact details will be available soon.');
      return;
    }

    switch (primaryContactMethod.contact_type) {
      case 'email':
        window.location.href = `mailto:${value}`;
        return;
      case 'phone':
        window.location.href = `tel:${value}`;
        return;
      case 'whatsapp':
        window.open(formatWhatsappUrl(value), '_blank', 'noopener,noreferrer');
        return;
      case 'telegram':
        window.open(value.startsWith('http') ? value : `https://t.me/${value.replace(/^@/, '')}`, '_blank', 'noopener,noreferrer');
        return;
      default:
        if (value.includes('@')) {
          window.location.href = `mailto:${value}`;
        } else if (/^https?:/i.test(value)) {
          window.open(value, '_blank', 'noopener,noreferrer');
        } else {
          window.location.href = `tel:${value}`;
        }
    }
  };

  const contactButtonCopy = (() => {
    switch (primaryContactMethod?.contact_type) {
      case 'email':
        return 'Email Business';
      case 'phone':
        return 'Call Business';
      case 'whatsapp':
        return 'Chat on WhatsApp';
      case 'telegram':
        return 'Message on Telegram';
      default:
        return 'Contact Business';
    }
  })();

  const contactType = primaryContactMethod?.contact_type ?? '';

  const showWhatsappButton = Boolean(
    whatsappContact && primaryContactMethod && whatsappContact.id !== primaryContactMethod.id
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Banner */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        {/* Banner Image or Gradient Background */}
        {business.banner_url ? (
          <div className="absolute inset-0">
            <img
              src={business.banner_thumbnail_url || business.banner_url}
              alt={`${business.business_name} banner`}
              className="w-full h-full object-cover"
              loading="lazy"
              onLoad={(e) => {
                // Load full resolution after thumbnail loads
                if (business.banner_thumbnail_url && business.banner_url !== e.currentTarget.src) {
                  e.currentTarget.src = business.banner_url;
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-background" />
            <div className="absolute inset-0 bg-grid-white/10 bg-grid" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </>
        )}

        {/* Back Button */}
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/abud/directory/business')}
            className="gap-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </Button>
        </div>

        {/* Business Admin Actions */}
        {isBusinessAdmin && (
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/abud/business/${businessId}/edit`)}
              className="gap-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            >
              <Edit className="h-4 w-4" />
              Edit Business
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/abud/business/${businessId}/members`)}
              className="gap-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            >
              <Users className="h-4 w-4" />
              Manage Team
            </Button>
          </div>
        )}
      </div>

      {/* Business Logo & Info - Positioned to overlap banner */}
      <div className="container mx-auto px-4 -mt-12 md:-mt-16 relative z-10">
        <div className="flex items-start gap-4 md:gap-6 pb-6">
          {/* Logo */}
          <div className="h-24 w-24 md:h-32 md:w-32 rounded-lg bg-background border-4 border-background shadow-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            {business.logo_url ? (
              <img
                src={business.logo_url}
                alt={business.business_name}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <Building2 className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground" />
            )}
          </div>

          {/* Business Info */}
          <div className="flex-1 pt-2 min-w-0">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 break-words">
              {business.business_name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {/* Display categories */}
              {business.business_category_mapping?.map((mapping: any) => {
                const isPrimary = mapping.is_primary;
                const category = mapping.business_categories;
                const subcategory = mapping.business_subcategories;

                return (
                  <Badge
                    key={mapping.category_id + (mapping.subcategory_id || '')}
                    variant={isPrimary ? "default" : "outline"}
                    style={{
                      backgroundColor: isPrimary ? category?.color : undefined,
                      borderColor: category?.color
                    }}
                    className="gap-1"
                  >
                    {category?.icon && <span className="text-xs">{category.icon}</span>}
                    {category?.name}
                    {subcategory && ` > ${subcategory.name}`}
                  </Badge>
                );
              })}

              <LocationBadge
                city={business.location_city}
                state={business.location_state}
                country={business.location_country}
                directoryType="business"
                size="sm"
              />

              {business.ownership_type && (
                <Badge variant="outline" className="gap-1">
                  <Shield className="h-3 w-3" />
                  {business.ownership_type}
                </Badge>
              )}

              {business.business_size && (
                <Badge variant="outline" className="gap-1">
                  <Users className="h-3 w-3" />
                  {business.business_size.charAt(0).toUpperCase() + business.business_size.slice(1)}
                </Badge>
              )}

              {business.employee_count_range && (
                <Badge variant="outline" className="gap-1">
                  <Users className="h-3 w-3" />
                  {business.employee_count_range} employees
                </Badge>
              )}
              {business.current_business && (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Active
                </Badge>
              )}
            </div>
            {/* Display tags if available */}
            {business.tags && business.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {business.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            {heroDescription && (
              <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-3xl">
                {heroDescription}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile section navigation - sticky */}
      <div className="sticky top-14 z-20 bg-background/95 backdrop-blur-sm border-b shadow-sm lg:hidden">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-2 pt-2 scrollbar-hide">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? 'default' : 'outline'}
                  size="sm"
                  className="flex items-center gap-2 whitespace-nowrap"
                  onClick={() => scrollToSection(section.id)}
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">

          <div className="grid grid-cols-1 xl:grid-cols-[220px_minmax(0,2fr)_minmax(0,1fr)] gap-8">
            {/* Desktop section navigation */}
            <div className="hidden xl:block">
              <Card className="border-none shadow-lg sticky top-24">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Browse Sections</CardTitle>
                  <CardDescription>Jump to key details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                          activeSection === section.id
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {section.label}
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Main Column */}
            <div className="space-y-12">
              <section
                id="overview"
                ref={overviewRef}
                data-section-id="overview"
                className="space-y-6 scroll-mt-24"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Overview</h2>
                </div>

                <div className="flex flex-wrap gap-3">
                  {websiteUrl && (
                    <Button
                      onClick={() => window.open(websiteUrl, '_blank', 'noopener,noreferrer')}
                      className="gap-2"
                    >
                      <Globe className="h-4 w-4" />
                      Visit Website
                    </Button>
                  )}
                  {primaryContactMethod && (
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={handlePrimaryContact}
                    >
                      {contactType === 'email' ? (
                        <Mail className="h-4 w-4" />
                      ) : contactType === 'phone' ? (
                        <Phone className="h-4 w-4" />
                      ) : contactType === 'whatsapp' ? (
                        <MessageSquare className="h-4 w-4" />
                      ) : contactType === 'telegram' ? (
                        <MessageSquare className="h-4 w-4" />
                      ) : (
                        <MessageSquare className="h-4 w-4" />
                      )}
                      {contactButtonCopy}
                    </Button>
                  )}
                  {showWhatsappButton && whatsappContact && (
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => window.open(formatWhatsappUrl(whatsappContact.contact_value), '_blank', 'noopener,noreferrer')}
                    >
                      <MessageSquare className="h-4 w-4" />
                      WhatsApp
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                    aria-label="Share business"
                    title="Share business"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                {hasSnapshotItems && (
                  <Card className="border-none shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-semibold">Business Snapshot</h3>
                        </div>
                        {business.current_business && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {snapshotItems.filter((item) => item.value).map((item) => {
                          const Icon = item.icon;
                          return (
                            <div key={item.label} className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <Icon className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-xs uppercase text-muted-foreground tracking-wide">{item.label}</p>
                                <div className="text-sm font-medium mt-1 text-foreground">
                                  {item.value}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {(businessMetrics.established || businessMetrics.employees || businessMetrics.projects || businessMetrics.clients) && (
                  <Card className="border-none shadow-lg">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {businessMetrics.established && (
                          <div className="text-center">
                            <div className="text-3xl font-bold text-primary">{businessMetrics.established}</div>
                            <div className="text-sm text-muted-foreground">Established</div>
                          </div>
                        )}
                        {businessMetrics.employees && (
                          <div className="text-center">
                            <div className="text-3xl font-bold text-primary">{businessMetrics.employees}+</div>
                            <div className="text-sm text-muted-foreground">Team Members</div>
                          </div>
                        )}
                        {businessMetrics.projects && (
                          <div className="text-center">
                            <div className="text-3xl font-bold text-primary">{businessMetrics.projects}</div>
                            <div className="text-sm text-muted-foreground">Projects Completed</div>
                          </div>
                        )}
                        {businessMetrics.clients && (
                          <div className="text-center">
                            <div className="text-3xl font-bold text-primary">{businessMetrics.clients}+</div>
                            <div className="text-sm text-muted-foreground">Happy Clients</div>
                          </div>
                        )}
                        {businessMetrics.revenue_growth && (
                          <div className="text-center">
                            <div className="text-3xl font-bold text-primary">{businessMetrics.revenue_growth}%</div>
                            <div className="text-sm text-muted-foreground">Revenue Growth</div>
                          </div>
                        )}
                        {businessMetrics.customer_satisfaction && (
                          <div className="text-center">
                            <div className="text-3xl font-bold text-primary">{businessMetrics.customer_satisfaction}%</div>
                            <div className="text-sm text-muted-foreground">Satisfaction</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      About {business.business_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {business.description || "No description available."}
                    </p>
                  </CardContent>
                </Card>

                {achievements.length > 0 && (
                  <Card className="border-none shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Key Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {achievements.map((achievement) => {
                          const getIcon = () => {
                            switch (achievement.icon_type) {
                              case 'certificate':
                                return <CheckCircle className="h-4 w-4 text-primary" />;
                              case 'milestone':
                                return <Target className="h-4 w-4 text-primary" />;
                              case 'growth':
                                return <TrendingUp className="h-4 w-4 text-primary" />;
                              default:
                                return <Award className="h-4 w-4 text-primary" />;
                            }
                          };
                          return (
                            <div key={achievement.id} className="flex items-start gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                {getIcon()}
                              </div>
                              <div>
                                <p className="font-semibold">{achievement.title}</p>
                                {achievement.description && (
                                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                                )}
                                {achievement.achievement_date && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(achievement.achievement_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </section>

              <section
                id="services"
                ref={servicesRef}
                data-section-id="services"
                className="space-y-6 scroll-mt-24"
              >
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Services</h2>
                </div>

                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Our Services
                    </CardTitle>
                    <CardDescription>
                      Comprehensive solutions tailored to your needs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {services.length > 0 ? (
                      <div className="grid gap-4">
                        {services.map((service, index) => (
                          <div
                            key={service.id || index}
                            className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Package className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-semibold mb-1">{service.service_name}</h4>
                                    {service.service_categories && (
                                      <Badge variant="secondary" className="text-xs mb-2">
                                        {service.service_categories.name}
                                      </Badge>
                                    )}
                                  </div>
                                  {service.price_range && (
                                    <span className="text-sm font-medium text-muted-foreground">
                                      {service.price_range}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {service.description}
                                </p>
                                {service.delivery_method && service.delivery_method.length > 0 && (
                                  <div className="flex gap-2 mt-2">
                                    {service.delivery_method.map((method: string) => (
                                      <Badge key={method} variant="outline" className="text-xs">
                                        {method.charAt(0).toUpperCase() + method.slice(1)}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No services listed yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>

              <section
                id="team"
                ref={teamRef}
                data-section-id="team"
                className="space-y-6 scroll-mt-24"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Team</h2>
                </div>

                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Our Team
                    </CardTitle>
                    <CardDescription>
                      Meet the talented people behind our success
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={owner.avatar_url} />
                            <AvatarFallback>
                              {owner.full_name?.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{owner.full_name}</h4>
                              <Badge variant="default" className="text-xs">Founder</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{business.position}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatCourseName(owner.course)} • Class of {owner.graduation_year}
                            </p>
                          </div>
                          <Link to={`/abud/profile/${owner.user_id}`}>
                            <Button variant="outline" size="sm">
                              View Profile
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {teamMembers.map((member) => (
                        <div key={member.id} className="p-4 rounded-lg border bg-card">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={member.profiles?.avatar_url} />
                              <AvatarFallback>
                                {member.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-semibold">{member.profiles?.full_name}</h4>
                              <p className="text-sm text-muted-foreground">{member.role}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatCourseName(member.profiles?.course)} • Class of {member.profiles?.graduation_year}
                              </p>
                            </div>
                            <Link to={`/abud/profile/${member.profiles?.user_id}`}>
                              <Button variant="outline" size="sm">
                                View Profile
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
            {/* Business Owner Card */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Business Owner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={owner.avatar_url} />
                      <AvatarFallback>
                        {owner.full_name?.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{owner.full_name}</p>
                      <p className="text-sm text-muted-foreground">{business.position}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      {formatCourseName(owner.course)}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Class of {owner.graduation_year}
                    </div>
                  </div>
                  <Link to={`/abud/profile/${owner.user_id}`} className="block">
                    <Button variant="outline" className="w-full">
                      View Full Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {business.website && (
                  <a 
                    href={business.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                  >
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{business.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
                {contactMethods.map((contact) => {
                  const getContactIcon = () => {
                    switch (contact.contact_type) {
                      case 'phone': return <Phone className="h-4 w-4 text-muted-foreground" />;
                      case 'email': return <Mail className="h-4 w-4 text-muted-foreground" />;
                      case 'whatsapp': return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
                      case 'telegram': return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
                      case 'linkedin': return <Globe className="h-4 w-4 text-muted-foreground" />;
                      case 'website': return <Globe className="h-4 w-4 text-muted-foreground" />;
                      default: return <Globe className="h-4 w-4 text-muted-foreground" />;
                    }
                  };

                  const contactUrl = formatContactUrl(contact.contact_type, contact.contact_value);
                  const isClickable = contact.contact_value && contactUrl !== '#';

                  return (
                    <div key={contact.id} className="flex items-center gap-3 text-sm">
                      {getContactIcon()}
                      {isClickable ? (
                        <a
                          href={contactUrl}
                          target={contact.contact_type === 'phone' || contact.contact_type === 'email' ? '_self' : '_blank'}
                          rel="noopener noreferrer"
                          className="truncate hover:text-primary transition-colors flex items-center gap-2"
                        >
                          <span className="truncate">
                            {contact.contact_value}
                          </span>
                          {contact.is_primary && (
                            <Badge variant="outline" className="text-xs">Primary</Badge>
                          )}
                        </a>
                      ) : (
                        <span className="truncate">
                          {contact.contact_value || 'Not provided'}
                          {contact.is_primary && (
                            <Badge variant="outline" className="ml-2 text-xs">Primary</Badge>
                          )}
                        </span>
                      )}
                    </div>
                  );
                })}
                <LocationBadge
                  city={business.location_city}
                  state={business.location_state}
                  country={business.location_country}
                  directoryType="business"
                  size="default"
                />
              </CardContent>
            </Card>

            {/* Business Links */}
            {businessLinks.length > 0 && (
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ExternalLink className="h-5 w-5" />
                    Business Links
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {businessLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted transition-colors"
                      >
                        {getSocialIcon(link.platform)}
                        <span className="text-sm truncate">{link.title || link.platform}</span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Owner's Social Links */}
            {owner.links && owner.links.length > 0 && (
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Share2 className="h-5 w-5" />
                    Owner's Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {owner.links.map((link: any) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted transition-colors"
                      >
                        {getSocialIcon(link.platform)}
                        <span className="text-sm truncate">{link.platform}</span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Business Info Summary */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {business.year_established && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Year Established</p>
                    <p className="text-sm font-medium">{business.year_established}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Duration</p>
                  <p className="text-sm font-medium">
                    {business.start_date ? 
                      `${new Date(business.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - ${business.current_business ? 'Present' : (business.end_date ? new Date(business.end_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Present')}` 
                      : 'Not specified'}
                  </p>
                </div>
                {business.industry && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Industry</p>
                    <p className="text-sm font-medium">{business.industry}</p>
                  </div>
                )}
                {business.ownership_type && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Ownership Type</p>
                    <p className="text-sm font-medium">{business.ownership_type}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Role</p>
                  <p className="text-sm font-medium">{business.position}</p>
                </div>
                {business.business_registration_number && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Registration Number</p>
                    <p className="text-sm font-medium">{business.business_registration_number}</p>
                  </div>
                )}
                {business.employee_count_range && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Company Size</p>
                    <p className="text-sm font-medium">{business.employee_count_range} employees</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessViewEnhanced;
