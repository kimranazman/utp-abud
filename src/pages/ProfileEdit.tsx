import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Check, Settings, User, LayoutGrid, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ProfileOverview from '@/components/profile/ProfileOverview';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Import onboarding step components
import PersonalDetailsStep from '@/components/onboarding/PersonalDetailsStep';
import EducationStep from '@/components/onboarding/EducationStep';
import CareerHistoryStep from '@/components/onboarding/CareerHistoryStep';
import AchievementsStep from '@/components/onboarding/AchievementsStep';
import ContributionsStep from '@/components/onboarding/ContributionsStep';
import BusinessesStep from '@/components/onboarding/BusinessesStep';
import LinksStep from '@/components/onboarding/LinksStep';
import ReviewStep from '@/components/onboarding/ReviewStep';

const REQUIRED_STEPS = ['personal', 'education', 'businesses'] as const;

const STEPS = [
  { id: 'personal', title: 'Personal Details', description: 'Basic information about you' },
  { id: 'education', title: 'Education', description: 'Your UTP programmes and studies' },
  { id: 'businesses', title: 'Businesses', description: 'Business ventures and enterprises' },
  { id: 'career', title: 'Career History', description: 'Your professional journey' },
  { id: 'achievements', title: 'Achievements', description: 'Your accomplishments and awards' },
  { id: 'contributions', title: 'Contributions', description: 'Community and volunteer work' },
  { id: 'links', title: 'Links', description: 'Social media and professional links' },
  { id: 'review', title: 'Review', description: 'Review your profile information' },
];

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [profile, setProfile] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'steps'>('overview');
  const [completionLoaded, setCompletionLoaded] = useState(false);

  // Centralized section data state
  const [sectionData, setSectionData] = useState({
    education: [],
    careerHistory: [],
    achievements: [],
    contributions: [],
    businesses: [],
    teamMemberships: [],
    links: []
  });
  const [sectionDataLoading, setSectionDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/abud/auth');
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, loading, navigate]);

  // Determine initial view mode based on profile completion
  useEffect(() => {
    if (!profile) return;

    // Show dashboard when the profile is marked complete, when required steps are flagged, or when we detect the required sections are filled.
    const hasRequiredSections = REQUIRED_STEPS.every(step => completedSteps.has(step));
    const hasBusinessIntent = profile.business_intent !== null && profile.business_intent !== undefined; // Check for non-owners
    const hasBasicProfile = Boolean(profile.full_name && profile.email); // Has basic profile info
    const shouldShowOverview = Boolean(
      profile.profile_completed ||
      profile.required_steps_completed ||
      hasRequiredSections ||
      hasBusinessIntent || // Non-owners who selected business intent should see overview
      hasBasicProfile // Users with basic profile info can see overview
    );

    setViewMode(shouldShowOverview ? 'overview' : 'steps');
  }, [profile, completedSteps]);

  // Update profile completion flags in database when steps are completed
  useEffect(() => {
    const updateCompletionFlags = async () => {
      if (!profile || !user || !completionLoaded) {
        return;
      }

      const hasRequiredSections = REQUIRED_STEPS.every(step => completedSteps.has(step));
      const hasAllSections = completedSteps.size === STEPS.length;

      console.log('[Profile Completion] Status:', {
        completedCount: completedSteps.size,
        totalSteps: STEPS.length,
        hasRequiredSections,
        hasAllSections,
        currentFlags: {
          profile_completed: profile.profile_completed,
          required_steps_completed: profile.required_steps_completed
        }
      });

      // Update required_steps_completed flag if not already set
      if (hasRequiredSections && !profile.required_steps_completed) {
        console.log('[Profile Completion] Updating required_steps_completed to true...');
        try {
          const { error } = await supabase
            .from('profiles')
            .update({ required_steps_completed: true })
            .eq('user_id', user.id);

          if (error) {
            console.error('[Profile Completion] Error updating required_steps_completed:', error);
          } else {
            console.log('[Profile Completion] Successfully updated required_steps_completed');
            // Update local profile state
            setProfile(prev => prev ? { ...prev, required_steps_completed: true } : null);
          }
        } catch (error) {
          console.error('[Profile Completion] Exception updating required_steps_completed:', error);
        }
      }

      // Update profile_completed flag if all sections are done and not already set
      if (hasAllSections && !profile.profile_completed) {
        console.log('[Profile Completion] Updating profile_completed to true...');
        try {
          const { error } = await supabase
            .from('profiles')
            .update({ profile_completed: true })
            .eq('user_id', user.id);

          if (error) {
            console.error('[Profile Completion] Error updating profile_completed:', error);
          } else {
            console.log('[Profile Completion] Successfully updated profile_completed');
            // Update local profile state
            setProfile(prev => prev ? { ...prev, profile_completed: true } : null);
          }
        } catch (error) {
          console.error('[Profile Completion] Exception updating profile_completed:', error);
        }
      }
    };

    updateCompletionFlags();
  }, [completedSteps, profile, user, completionLoaded]);

  // One-time migration: Fix existing users with 100% completion but flag not set
  useEffect(() => {
    const fixExistingCompletedProfiles = async () => {
      // Only run once when completion data is first loaded
      if (!profile || !user || !completionLoaded) return;

      const hasAllSections = completedSteps.size === STEPS.length;

      // If user has completed all sections but the flag isn't set, update it immediately
      if (hasAllSections && !profile.profile_completed) {
        console.log('[Migration] Detected 100% complete profile without flag set. Updating...');

        try {
          const { error } = await supabase
            .from('profiles')
            .update({
              profile_completed: true,
              required_steps_completed: true // Also set required steps as complete
            })
            .eq('user_id', user.id);

          if (error) {
            console.error('[Migration] Error updating profile completion flags:', error);
          } else {
            console.log('[Migration] Successfully updated profile_completed flag');
            // Update local profile state
            setProfile(prev => prev ? {
              ...prev,
              profile_completed: true,
              required_steps_completed: true
            } : null);
          }
        } catch (error) {
          console.error('[Migration] Exception updating profile completion flags:', error);
        }
      }
    };

    fixExistingCompletedProfiles();
    // Only run when completionLoaded changes from false to true
  }, [completionLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for custom events from sidebar to edit specific sections
  useEffect(() => {
    const handleEditSection = (event: CustomEvent) => {
      const sectionId = event.detail;
      const stepIndex = STEPS.findIndex(step => step.id === sectionId);
      if (stepIndex !== -1) {
        setCurrentStep(stepIndex);
        setViewMode('steps');
      }
    };

    window.addEventListener('editProfileSection', handleEditSection as EventListener);
    return () => {
      window.removeEventListener('editProfileSection', handleEditSection as EventListener);
    };
  }, []);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);

      // Fetch all section data after profile is fetched
      if (data) {
        await fetchAllSectionData(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    }
  };

  // Fetch all section data in parallel for better performance
  const fetchAllSectionData = async (profileData: any) => {
    if (!user) return;

    setSectionDataLoading(true);
    try {
      // Fetch all data in parallel for maximum efficiency
      const [educationRes, careerRes, achievementsRes, contributionsRes, businessesRes, teamMembershipsRes, linksRes] = await Promise.all([
        supabase.from('user_education').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
        supabase.from('career_history').select('*').eq('user_id', user.id).order('start_date', { ascending: false }),
        supabase.from('achievements').select('*').eq('user_id', user.id).order('date_achieved', { ascending: false, nullsFirst: false }),
        supabase.from('contributions').select('*').eq('user_id', user.id).order('start_date', { ascending: false }),
        supabase.from('user_businesses').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('business_team_members').select('*, user_businesses(*)').eq('user_id', user.id),
        supabase.from('user_links').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);

      // Update section data state
      const newSectionData = {
        education: educationRes.data || [],
        careerHistory: careerRes.data || [],
        achievements: achievementsRes.data || [],
        contributions: contributionsRes.data || [],
        businesses: businessesRes.data || [],
        teamMemberships: teamMembershipsRes.data || [],
        links: linksRes.data || []
      };
      setSectionData(newSectionData);

      // Determine completion based on fetched data
      const completed = new Set<string>();

      // Check personal details - require full_name as minimum
      if (profileData?.full_name) {
        completed.add('personal');
      }

      // Check education entries
      if (newSectionData.education.length > 0) {
        completed.add('education');
      }

      // Check career history
      if (newSectionData.careerHistory.length > 0) {
        completed.add('career');
      }

      // Check achievements
      if (newSectionData.achievements.length > 0) {
        completed.add('achievements');
      }

      // Check contributions
      if (newSectionData.contributions.length > 0) {
        completed.add('contributions');
      }

      // Check businesses or business_intent for non-owners
      if (newSectionData.businesses.length > 0 || profileData?.business_intent) {
        completed.add('businesses');
      }

      // Check links
      if (newSectionData.links.length > 0) {
        completed.add('links');
      }

      // Review step is considered complete if all required steps are done
      const hasAllRequired = REQUIRED_STEPS.every(step => completed.has(step));
      if (hasAllRequired) {
        completed.add('review');
      }

      setCompletedSteps(completed);
      setCompletionLoaded(true);
    } catch (error) {
      console.error('Error fetching section data:', error);
      toast.error('Failed to load profile sections');
      setCompletionLoaded(true);
    } finally {
      setSectionDataLoading(false);
    }
  };

  // Check which steps are already completed based on existing data
  const checkExistingCompletion = async (profileData: any) => {
    if (!user) return;

    const completed = new Set<string>();

    try {
      // Check personal details - require full_name as minimum
      if (profileData?.full_name) {
        completed.add('personal');
      }

      // Check education entries
      const { count: eduCount } = await supabase
        .from('user_education')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (eduCount && eduCount > 0) {
        completed.add('education');
      }

      // Check career history
      const { count: careerCount } = await supabase
        .from('career_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (careerCount && careerCount > 0) {
        completed.add('career');
      }

      // Check achievements
      const { count: achievementCount } = await supabase
        .from('achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (achievementCount && achievementCount > 0) {
        completed.add('achievements');
      }

      // Check contributions
      const { count: contributionCount } = await supabase
        .from('contributions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (contributionCount && contributionCount > 0) {
        completed.add('contributions');
      }

      // Check businesses or business_intent for non-owners
      const { count: businessCount } = await supabase
        .from('user_businesses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Non-owners with business_intent are also considered complete for this step
      if ((businessCount && businessCount > 0) || profileData?.business_intent) {
        completed.add('businesses');
      }

      // Check links
      const { count: linkCount } = await supabase
        .from('user_links')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (linkCount && linkCount > 0) {
        completed.add('links');
      }

      // Review step is considered complete if all required steps are done
      const hasAllRequired = REQUIRED_STEPS.every(step => completed.has(step));
      if (hasAllRequired) {
        completed.add('review');
      }

      setCompletedSteps(completed);
      setCompletionLoaded(true); // Signal that completion check is done
    } catch (error) {
      console.error('Error checking existing completion:', error);
      setCompletionLoaded(true); // Even on error, signal we're done
    }
  };

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set(prev).add(stepId));
  };

  // Check if a specific step is complete based on current data
  const checkStepCompletion = async (stepId: string) => {
    if (!user || !profile) return;

    try {
      let isComplete = false;

      switch (stepId) {
        case 'personal':
          isComplete = !!profile.full_name;
          break;
        case 'education':
          const { count: eduCount } = await supabase
            .from('user_education')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          isComplete = (eduCount || 0) > 0;
          break;
        case 'career':
          const { count: careerCount } = await supabase
            .from('career_history')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          isComplete = (careerCount || 0) > 0;
          break;
        case 'achievements':
          const { count: achievementCount } = await supabase
            .from('achievements')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          isComplete = (achievementCount || 0) > 0;
          break;
        case 'contributions':
          const { count: contributionCount } = await supabase
            .from('contributions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          isComplete = (contributionCount || 0) > 0;
          break;
        case 'businesses':
          const { count: businessCount } = await supabase
            .from('user_businesses')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          isComplete = (businessCount || 0) > 0;
          break;
        case 'links':
          const { count: linkCount } = await supabase
            .from('user_links')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          isComplete = (linkCount || 0) > 0;
          break;
        case 'review':
          // Review is complete if required steps are done
          const requiredComplete = completedSteps.has('personal') &&
                                  completedSteps.has('education') &&
                                  completedSteps.has('businesses');
          isComplete = requiredComplete;
          break;
      }

      if (isComplete && !completedSteps.has(stepId)) {
        setCompletedSteps(prev => new Set(prev).add(stepId));
      }
    } catch (error) {
      console.error(`Error checking completion for step ${stepId}:`, error);
    }
  };

  // Re-check completion when switching steps (for real-time validation)
  useEffect(() => {
    if (profile && currentStep >= 0) {
      // Re-validate current step completion when navigating
      checkStepCompletion(STEPS[currentStep].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, profile]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveAndExit = async () => {
    toast.success('Profile changes saved successfully!');
    if (viewMode === 'steps' && !profile?.profile_completed) {
      // For incomplete profiles in steps mode, switch to overview
      handleBackToOverview();
    } else {
      // Navigate to dashboard instead of profile page
      navigate('/abud');
    }
  };

  const handleEditSection = (sectionId: string) => {
    const stepIndex = STEPS.findIndex(step => step.id === sectionId);
    if (stepIndex !== -1) {
      setCurrentStep(stepIndex);
      setViewMode('steps');
    }
  };

  const handleBackToOverview = () => {
    setViewMode('overview');
  };

  // Callback handlers for data updates from step components
  const handleDataUpdate = {
    education: (data: any[]) => {
      setSectionData(prev => ({ ...prev, education: data }));
    },
    careerHistory: (data: any[]) => {
      setSectionData(prev => ({ ...prev, careerHistory: data }));
    },
    achievements: (data: any[]) => {
      setSectionData(prev => ({ ...prev, achievements: data }));
    },
    contributions: (data: any[]) => {
      setSectionData(prev => ({ ...prev, contributions: data }));
    },
    businesses: (data: any[]) => {
      setSectionData(prev => ({ ...prev, businesses: data }));
    },
    links: (data: any[]) => {
      setSectionData(prev => ({ ...prev, links: data }));
    },
  };

  const renderStep = () => {
    const stepId = STEPS[currentStep].id;
    const commonProps = {
      profile,
      onComplete: () => handleStepComplete(stepId),
    };

    switch (stepId) {
      case 'personal':
        return <PersonalDetailsStep {...commonProps} />;
      case 'education':
        return (
          <EducationStep
            onComplete={() => handleStepComplete(stepId)}
            initialData={sectionData.education}
            isDataLoading={sectionDataLoading}
            onDataUpdate={handleDataUpdate.education}
          />
        );
      case 'career':
        return (
          <CareerHistoryStep
            {...commonProps}
            initialData={sectionData.careerHistory}
            isDataLoading={sectionDataLoading}
            onDataUpdate={handleDataUpdate.careerHistory}
          />
        );
      case 'achievements':
        return (
          <AchievementsStep
            {...commonProps}
            initialData={sectionData.achievements}
            isDataLoading={sectionDataLoading}
            onDataUpdate={handleDataUpdate.achievements}
          />
        );
      case 'contributions':
        return (
          <ContributionsStep
            {...commonProps}
            initialData={sectionData.contributions}
            isDataLoading={sectionDataLoading}
            onDataUpdate={handleDataUpdate.contributions}
          />
        );
      case 'businesses':
        return (
          <BusinessesStep
            {...commonProps}
            initialData={sectionData.businesses}
            isDataLoading={sectionDataLoading}
            onDataUpdate={handleDataUpdate.businesses}
          />
        );
      case 'links':
        return (
          <LinksStep
            {...commonProps}
            initialData={sectionData.links}
            isDataLoading={sectionDataLoading}
            onDataUpdate={handleDataUpdate.links}
          />
        );
      case 'review':
        return <ReviewStep {...commonProps} />;
      default:
        return <PersonalDetailsStep {...commonProps} />;
    }
  };

  if (loading || viewMode === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Calculate actual completion progress based on completed steps
  const actualProgress = (completedSteps.size / STEPS.length) * 100;
  const navigationPosition = currentStep + 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-4 max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              {viewMode === 'steps' && profile?.profile_completed && !isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToOverview}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Overview</span>
                </Button>
              )}
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 sm:h-8 sm:w-8 bg-primary rounded-lg flex items-center justify-center">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                </div>
                <h1 className="text-base sm:text-xl font-bold">Edit Profile</h1>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-4">
              {!isMobile && (
                <div className="text-sm text-muted-foreground hidden md:block">
                  {user.user_metadata?.full_name || user.email}
                </div>
              )}
              {!isMobile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/abud/profile/${user.id}`)}
                  className="gap-2"
                >
                  <User className="h-4 w-4" />
                  View Profile
                </Button>
              )}
              {profile?.profile_completed && (
                <Button
                  variant={viewMode === 'overview' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'overview' ? 'steps' : 'overview')}
                  className="gap-1 sm:gap-2 px-2 sm:px-3"
                >
                  <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{viewMode === 'overview' ? 'Edit Mode' : 'Overview'}</span>
                  <span className="sm:hidden">{viewMode === 'overview' ? 'Edit' : 'View'}</span>
                </Button>
              )}
              {viewMode === 'steps' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveAndExit}
                  className="gap-1 sm:gap-2 px-2 sm:px-3"
                >
                  <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Save & Exit</span>
                  <span className="sm:hidden">Save</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
        {viewMode === 'overview' ? (
          /* Overview Mode - Dashboard style for completed profiles */
          <div>
            <div className="mb-4 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Profile Overview</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage and update different sections of your profile
              </p>
            </div>
            <ProfileOverview
              profile={profile}
              onEditSection={handleEditSection}
              isMobile={isMobile}
              completedStepIds={Array.from(completedSteps)}
              requiredStepIds={Array.from(REQUIRED_STEPS)}
            />
          </div>
        ) : (
          /* Steps Mode - Original onboarding style */
          <div className="flex gap-6">
            {/* Mini Sidebar for completed profiles - Quick navigation without checkmarks */}
            {profile?.profile_completed && !isMobile && (
              <div className="w-64 flex-shrink-0">
                <div className="sticky top-24">
                  <h3 className="font-semibold mb-4">Profile Sections</h3>
                  <nav className="space-y-1">
                    {STEPS.slice(0, -1).map((step, index) => (
                      <button
                        key={step.id}
                        onClick={() => setCurrentStep(index)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          index === currentStep
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{step.title}</div>
                            <div className="text-xs text-muted-foreground">{step.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            )}

            {/* Mobile navigation for completed profiles - Clean dropdown without checkmarks */}
            {profile?.profile_completed && isMobile && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-muted-foreground">
                    Navigate Sections
                  </span>
                </div>
                <Select
                  value={currentStep.toString()}
                  onValueChange={(value) => setCurrentStep(parseInt(value))}
                >
                  <SelectTrigger className="w-full">
                    <div className="flex items-center justify-between w-full">
                      <span>{STEPS[currentStep].title}</span>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {STEPS.slice(0, -1).map((step, index) => (
                      <SelectItem key={step.id} value={index.toString()}>
                        <span>{step.title}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1">
              {/* Progress Section - Only for new profiles */}
              {!profile?.profile_completed && (
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl sm:text-2xl font-bold">
                      {completedSteps.size === STEPS.length ? 'Edit Profile' : 'Complete Profile'}
                    </h2>
                    <Badge variant="secondary" className="text-xs sm:text-sm">
                      Step {navigationPosition} of {STEPS.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {completedSteps.size} of {STEPS.length} sections completed
                      </span>
                      <span className="font-medium">
                        {Math.round(actualProgress)}%
                      </span>
                    </div>
                    <Progress
                      value={actualProgress}
                      className={`h-2 sm:h-3 ${
                        actualProgress === 100 ? '[&>*:last-child]:bg-green-500' :
                        actualProgress >= 75 ? '[&>*:last-child]:bg-blue-500' :
                        actualProgress >= 50 ? '[&>*:last-child]:bg-yellow-500' :
                        '[&>*:last-child]:bg-orange-500'
                      }`}
                    />
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground mt-2">
                    {completedSteps.size === 0
                      ? 'Start by filling out your personal details'
                      : completedSteps.size === STEPS.length
                      ? 'All sections complete! Review and save your profile'
                      : `Continue filling out the remaining sections`}
                  </p>
                </div>
              )}

            {/* Steps Overview - Compact on mobile */}
            {!profile?.profile_completed && (
              <>
                {isMobile ? (
                  /* Mobile: Compact dropdown selector */
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Navigate ({completedSteps.size}/{STEPS.length} complete):
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        Step {navigationPosition} / {STEPS.length}
                      </Badge>
                    </div>
                    <Select
                      value={currentStep.toString()}
                      onValueChange={(value) => setCurrentStep(parseInt(value))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STEPS.map((step, index) => (
                          <SelectItem key={step.id} value={index.toString()}>
                            <div className="flex items-center gap-2">
                              {completedSteps.has(step.id) ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <span className="w-3 h-3 rounded-full border border-muted-foreground" />
                              )}
                              <span>{step.title}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  /* Desktop: Original grid layout */
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-8">
                    {STEPS.map((step, index) => (
                      <div
                        key={step.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          index === currentStep
                            ? 'border-primary bg-primary/5'
                            : index < currentStep || completedSteps.has(step.id)
                            ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setCurrentStep(index)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {index < currentStep || completedSteps.has(step.id) ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm font-medium">{step.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Current Step Content */}
            <Card className="mb-4 sm:mb-8">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">{STEPS[currentStep].title}</CardTitle>
                <CardDescription className="text-sm">{STEPS[currentStep].description}</CardDescription>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                {renderStep()}
              </CardContent>
            </Card>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="gap-1 sm:gap-2"
                >
                  <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </Button>

                <div className="flex gap-1 sm:gap-2">
                  {!isMobile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveAndExit}
                      className="gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Save & Exit
                    </Button>
                  )}
                  {currentStep < STEPS.length - 1 && (
                    <Button
                      size={isMobile ? "sm" : "default"}
                      onClick={handleNext}
                      className="gap-1 sm:gap-2"
                    >
                      <span>Next</span>
                      <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileEdit;
