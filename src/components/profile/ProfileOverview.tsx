import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Briefcase, 
  Award, 
  Heart, 
  Building, 
  Link, 
  Edit3, 
  Plus,
  Calendar,
  MapPin,
  Mail,
  GraduationCap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface ProfileOverviewProps {
  profile: any;
  onEditSection: (sectionId: string) => void;
  isMobile?: boolean;
  completedStepIds?: string[];
  requiredStepIds?: string[];
}

// Function to shorten programme names
const shortenProgrammeName = (programmeName: string): string => {
  if (!programmeName) return '';
  
  // First remove "with Honours" from the programme name
  let cleanedName = programmeName.replace(/ with Honours/gi, '');
  
  // Define mappings for common programme patterns
  const patterns = [
    { pattern: /Bachelor of Engineering \(Honours\) - (.+)/, replacement: '$1' },
    { pattern: /Bachelor of (.+) Engineering/, replacement: '$1 Engineering' },
    { pattern: /Bachelor of Engineering \(Honours\)/, replacement: 'Engineering' },
    { pattern: /Bachelor of (.+) \(Hon(?:our)?s?\)/, replacement: '$1' },
    { pattern: /Bachelor of Science \(Hon(?:our)?s?\) in (.+)/, replacement: '$1' },
    { pattern: /Bachelor of (.+)/, replacement: '$1' },
    { pattern: /MSc in (.+)/, replacement: 'MSc $1' },
    { pattern: /PhD in (.+)/, replacement: 'PhD $1' },
    { pattern: /Master of (.+)/, replacement: 'Master $1' },
    { pattern: /MBA in (.+)/, replacement: 'MBA $1' },
    { pattern: /MPhil in (.+)/, replacement: 'MPhil $1' },
  ];

  for (const { pattern, replacement } of patterns) {
    if (pattern.test(cleanedName)) {
      return cleanedName.replace(pattern, replacement);
    }
  }

  return cleanedName;
};

const SECTION_TITLES: Record<string, string> = {
  personal: 'Personal Details',
  education: 'Education',
  career: 'Career History',
  achievements: 'Achievements',
  contributions: 'Contributions',
  businesses: 'Businesses',
  links: 'Links',
  review: 'Review'
};

const ProfileOverview = ({
  profile,
  onEditSection,
  isMobile = false,
  completedStepIds = [],
  requiredStepIds = []
}: ProfileOverviewProps) => {
  const navigate = useNavigate();
  const [education, setEducation] = useState<any[]>([]);
  const [careerHistory, setCareerHistory] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);

  const completedSet = new Set(completedStepIds);
  const missingRequiredSections = requiredStepIds.length
    ? requiredStepIds.filter(step => !completedSet.has(step))
    : [];
  const hasAllRequired = requiredStepIds.length > 0
    ? missingRequiredSections.length === 0
    : false;
  const profileComplete = Boolean(
    profile?.profile_completed ||
    profile?.required_steps_completed ||
    hasAllRequired
  );

  useEffect(() => {
    if (profile) {
      fetchProfileData();
    }
  }, [profile]);

  const fetchProfileData = async () => {
    if (!profile?.user_id) return;

    const [educationRes, careerRes, achievementsRes, contributionsRes, businessesRes, linksRes] = await Promise.all([
      supabase.from('user_education').select('*').eq('user_id', profile.user_id).order('is_primary', { ascending: false }),
      supabase.from('career_history').select('*').eq('user_id', profile.user_id).order('start_date', { ascending: false }),
      supabase.from('achievements').select('*').eq('user_id', profile.user_id).order('date_achieved', { ascending: false }),
      supabase.from('contributions').select('*').eq('user_id', profile.user_id).order('start_date', { ascending: false }),
      supabase.from('user_businesses').select('*').eq('user_id', profile.user_id).order('start_date', { ascending: false }),
      supabase.from('user_links').select('*').eq('user_id', profile.user_id).order('platform')
    ]);

    if (educationRes.data) setEducation(educationRes.data);
    if (careerRes.data) setCareerHistory(careerRes.data);
    if (achievementsRes.data) setAchievements(achievementsRes.data);
    if (contributionsRes.data) setContributions(contributionsRes.data);
    if (businessesRes.data) setBusinesses(businessesRes.data);
    if (linksRes.data) setLinks(linksRes.data);
  };

  // Calculate contribution totals
  const totalContributionValue = contributions.reduce((sum, contrib) => {
    if (!contrib.value_private && contrib.value_amount) {
      return sum + parseFloat(contrib.value_amount);
    }
    return sum;
  }, 0);

  const monetaryContributions = contributions.filter(c => c.contribution_type === 'monetary');
  const nonMonetaryContributions = contributions.filter(c => c.contribution_type === 'non_monetary');

  // Calculate career experience
  const totalYearsExperience = careerHistory.reduce((years, career) => {
    const startYear = new Date(career.start_date).getFullYear();
    const endYear = career.end_date ? new Date(career.end_date).getFullYear() : new Date().getFullYear();
    return years + (endYear - startYear);
  }, 0);

  // Get current position
  const currentPosition = careerHistory.find(c => c.current_position);

  // Get primary education
  const primaryEducation = education.find(e => e.is_primary) || education[0];

  const sections = [
    {
      id: 'personal',
      title: 'Personal Details',
      icon: User,
      data: profile,
      count: profile ? 1 : 0,
      preview: profile ? `${profile.full_name || 'Name not set'}` : 'No personal details',
      customContent: profile && (
        <div className="space-y-2">
          {primaryEducation && (
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span>{shortenProgrammeName(primaryEducation.programme_name)} • Class of {primaryEducation.graduation_year}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Graduated {primaryEducation?.graduation_year || profile.graduation_year || 'N/A'}</span>
          </div>
          {profile.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{profile.email}</span>
            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            <Badge variant={profileComplete ? 'default' : 'secondary'} className="text-xs">
              {profileComplete ? 'Complete' : 'Incomplete'}
            </Badge>
            {profile.is_verified && (
              <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                Verified
              </Badge>
            )}
          </div>
          {!profileComplete && missingRequiredSections.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Missing required sections: {missingRequiredSections.map(section => SECTION_TITLES[section] || section).join(', ')}
            </p>
          )}
        </div>
      )
    },
    {
      id: 'education',
      title: 'Education',
      icon: GraduationCap,
      data: education,
      count: education.length,
      preview: education.length > 0 ? `${shortenProgrammeName(primaryEducation?.programme_name)} (${primaryEducation?.graduation_year})` : 'No education added',
      customContent: education.length > 0 && (
        <div className="space-y-2">
          <div className="p-2 bg-blue-50 rounded-md border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={primaryEducation?.programme_level === 'undergraduate' ? 'default' : 'secondary'} className="text-xs">
                {primaryEducation?.programme_level === 'undergraduate' ? 'Undergraduate' : 'Postgraduate'}
              </Badge>
              {primaryEducation?.is_primary && (
                <Badge variant="outline" className="text-xs">Primary</Badge>
              )}
            </div>
            <p className="text-sm font-medium text-blue-800 line-clamp-2">{shortenProgrammeName(primaryEducation?.programme_name)}</p>
            <p className="text-xs text-blue-600">Class of {primaryEducation?.graduation_year}</p>
          </div>
          {education.length > 1 && (
            <p className="text-xs text-muted-foreground">
              +{education.length - 1} more programme{education.length > 2 ? 's' : ''}
            </p>
          )}
        </div>
      )
    },
    {
      id: 'businesses',
      title: 'Businesses',
      icon: Building,
      data: businesses,
      count: businesses.length,
      preview: businesses.length > 0 ? `${businesses[0].position} at ${businesses[0].business_name}` : 'No businesses added',
      customContent: businesses.length > 0 && (
        <div className="space-y-2">
          {businesses.slice(0, 3).map((business, index) => (
            <div key={business.id} className="p-2 bg-blue-50 rounded-md border border-blue-200">
              <div className="flex items-center gap-2">
                {business.logo_url && (
                  <img src={business.logo_url} alt="" className="h-6 w-6 rounded object-cover" />
                )}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-sm font-medium text-blue-800 truncate">{business.business_name}</p>
                  <p className="text-xs text-blue-600 truncate">{business.position}</p>
                </div>
                <div className="flex items-center gap-1">
                  {business.current_business && (
                    <Badge variant="outline" className="text-xs text-blue-600 border-blue-600">
                      Current
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/abud/business/${business.id}/edit`)}
                    className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                    title="Edit business"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {businesses.length > 3 && (
            <p className="text-xs text-muted-foreground">
              +{businesses.length - 3} more business{businesses.length > 4 ? 'es' : ''}
            </p>
          )}
          <div className="pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/abud/business/new')}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Business
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'career',
      title: 'Career History',
      icon: Briefcase,
      data: careerHistory,
      count: careerHistory.length,
      preview: careerHistory.length > 0 ? `${careerHistory[0].position} at ${careerHistory[0].company_name}` : 'No career history added',
      customContent: careerHistory.length > 0 && (
        <div className="space-y-2">
          {currentPosition && (
            <div className="p-2 bg-primary/10 rounded-md">
              <p className="text-sm font-medium text-primary">{currentPosition.position}</p>
              <p className="text-xs text-muted-foreground">{currentPosition.company_name}</p>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Briefcase className="h-4 w-4" />
            <span>{totalYearsExperience} years experience</span>
          </div>
          {careerHistory.length > 1 && (
            <p className="text-xs text-muted-foreground">
              +{careerHistory.length - 1} more position{careerHistory.length > 2 ? 's' : ''}
            </p>
          )}
        </div>
      )
    },
    {
      id: 'achievements',
      title: 'Achievements',
      icon: Award,
      data: achievements,
      count: achievements.length,
      preview: achievements.length > 0 ? achievements[0].title : 'No achievements added',
      customContent: achievements.length > 0 && (
        <div className="space-y-2">
          <div className="p-2 bg-orange-50 rounded-md border border-orange-200">
            <p className="text-sm font-medium text-orange-800">{achievements[0].title}</p>
            {achievements[0].organization && (
              <p className="text-xs text-orange-600">{achievements[0].organization}</p>
            )}
            {achievements[0].date_achieved && (
              <p className="text-xs text-muted-foreground">
                {new Date(achievements[0].date_achieved).getFullYear()}
              </p>
            )}
          </div>
          {achievements.length > 1 && (
            <p className="text-xs text-muted-foreground">
              +{achievements.length - 1} more achievement{achievements.length > 2 ? 's' : ''}
            </p>
          )}
        </div>
      )
    },
    {
      id: 'contributions',
      title: 'Contributions',
      icon: Heart,
      data: contributions,
      count: contributions.length,
      preview: contributions.length > 0 ? `${contributions[0].role} at ${contributions[0].organization_name}` : 'No contributions added',
      customContent: contributions.length > 0 && (
        <div className="space-y-2">
          {totalContributionValue > 0 && (
            <div className="p-2 bg-green-50 rounded-md border border-green-200">
              <p className="text-sm font-medium text-green-800">
                ${totalContributionValue.toLocaleString()} Total Value
              </p>
              <div className="flex gap-2 text-xs text-green-600">
                <span>{monetaryContributions.length} monetary</span>
                <span>•</span>
                <span>{nonMonetaryContributions.length} non-monetary</span>
              </div>
            </div>
          )}
          <div className="p-2 bg-muted/50 rounded-md">
            <p className="text-sm font-medium">{contributions[0].organization_name}</p>
            <p className="text-xs text-muted-foreground">{contributions[0].role}</p>
          </div>
          {contributions.length > 1 && (
            <p className="text-xs text-muted-foreground">
              +{contributions.length - 1} more contribution{contributions.length > 2 ? 's' : ''}
            </p>
          )}
        </div>
      )
    },
    {
      id: 'links',
      title: 'Links',
      icon: Link,
      data: links,
      count: links.length,
      preview: links.length > 0 ? `${links.length} link${links.length > 1 ? 's' : ''} added` : 'No links added',
      customContent: links.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {links.slice(0, 4).map((link, index) => (
              <Badge key={link.id} variant="outline" className="text-xs">
                {link.platform}
              </Badge>
            ))}
            {links.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{links.length - 4}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            Platforms: {links.map(l => l.platform).join(', ')}
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Profile Summary Card - Compact on mobile */}
      <Card>
        <CardHeader className={isMobile ? "p-3" : ""}>
          <div className="flex items-start gap-3 sm:gap-4">
            <Avatar className={isMobile ? "h-12 w-12" : "h-16 w-16"}>
              <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || 'User'} />
              <AvatarFallback className={isMobile ? "text-sm" : "text-lg"}>
                {profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className={isMobile ? "text-lg" : "text-2xl"}>
                    {profile?.full_name || 'Name not set'}
                  </CardTitle>
                  {!isMobile && primaryEducation?.programme_name && (
                    <CardDescription className="text-base">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        {shortenProgrammeName(primaryEducation.programme_name)} • Class of {primaryEducation.graduation_year || 'N/A'}
                      </span>
                    </CardDescription>
                  )}
                </div>
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "sm"}
                  onClick={() => onEditSection('personal')}
                  className={isMobile ? "h-7 w-7 p-0" : "gap-2"}
                >
                  <Edit3 className={isMobile ? "h-3.5 w-3.5" : "h-4 w-4"} />
                  {!isMobile && "Edit"}
                </Button>
              </div>
              {isMobile ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge variant={profileComplete ? 'default' : 'secondary'} className="text-xs">
                    {profileComplete ? 'Complete' : 'Incomplete'}
                  </Badge>
                  {profile?.is_verified && (
                    <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  {profile?.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {profile.email}
                    </span>
                  )}
                  <Badge variant={profileComplete ? 'default' : 'secondary'}>
                    {profileComplete ? 'Profile Complete' : 'Profile Incomplete'}
                  </Badge>
                  {profile?.is_verified && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Verified
                    </Badge>
                  )}
                </div>
              )}
              {!profileComplete && missingRequiredSections.length > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Missing required sections: {missingRequiredSections.map(section => SECTION_TITLES[section] || section).join(', ')}
                </p>
              )}
            </div>
          </div>
          {profile?.bio && !isMobile && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm">{profile.bio}</p>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Profile Sections Grid - Compact on mobile */}
      {isMobile ? (
        /* Mobile: Compact list view */
        <div className="space-y-2">
          {sections.map((section) => {
            const IconComponent = section.icon;
            return (
              <Card
                key={section.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onEditSection(section.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm">{section.title}</h3>
                          <Badge variant="outline" className="text-xs ml-2">
                            {section.count}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {section.preview}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditSection(section.id);
                      }}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Desktop: Original grid layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => {
            const IconComponent = section.icon;
            return (
              <Card key={section.id} className="hover:shadow-md transition-shadow overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{section.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {section.count} item{section.count !== 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditSection(section.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {section.customContent || (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {section.preview}
                    </p>
                  )}
                  <div className="flex justify-between items-center mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditSection(section.id)}
                      className="gap-2"
                    >
                      <Edit3 className="h-3 w-3" />
                      Edit
                    </Button>
                    {section.count === 0 && section.id === 'businesses' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/abud/business/new')}
                        className="gap-2 text-primary"
                      >
                        <Plus className="h-3 w-3" />
                        Add
                      </Button>
                    ) : section.count === 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditSection(section.id)}
                        className="gap-2 text-primary"
                      >
                        <Plus className="h-3 w-3" />
                        Add
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProfileOverview;
