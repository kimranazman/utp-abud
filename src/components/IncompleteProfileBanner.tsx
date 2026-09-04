import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { calculateProfileCompletion, getNextProfileAction, type ProfileCompletionResult } from '@/utils/profileCompletion';
import { AlertCircle, X, TrendingUp } from 'lucide-react';

interface IncompleteProfileBannerProps {
  className?: string;
}

export const IncompleteProfileBanner = ({ className }: IncompleteProfileBannerProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completionData, setCompletionData] = useState<ProfileCompletionResult | null>(null);

  useEffect(() => {
    const checkProfileStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Check if banner was dismissed in this session
      const dismissedKey = `profile-banner-dismissed-${user.id}`;
      if (sessionStorage.getItem(dismissedKey) === 'true') {
        setDismissed(true);
        setLoading(false);
        return;
      }

      const evaluateCompletion = (profileWithCounts: any) => {
        const completion = calculateProfileCompletion(profileWithCounts);
        setCompletionData(completion);

        const basicRequirements = completion.breakdown.find(
          category => category.category === 'Basic Requirements'
        );
        const requiredSectionsCompleted = basicRequirements
          ? basicRequirements.completed === basicRequirements.total
          : false;

        const baselineComplete = Boolean(
          profileWithCounts.profile_completed ||
          profileWithCounts.required_steps_completed ||
          requiredSectionsCompleted
        );

        setShowBanner(!baselineComplete && completion.percentage < 100);
      };

      try {
        // Fetch comprehensive profile data including counts from related tables
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`
            *,
            user_education!user_education_user_id_fkey(count),
            user_businesses!user_businesses_user_id_fkey(count),
            career_history!career_history_user_id_fkey(count),
            achievements!achievements_user_id_fkey(count),
            user_links!user_links_user_id_fkey(count),
            contributions!contributions_user_id_fkey(count)
          `)
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          // Fallback to simpler query if the complex one fails
          const { data: simpleProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (simpleProfile) {
            // Fetch counts separately
            const [education, businesses, career, achievements, links, contributions] = await Promise.all([
              supabase.from('user_education').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
              supabase.from('user_businesses').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
              supabase.from('career_history').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
              supabase.from('achievements').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
              supabase.from('user_links').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
              supabase.from('contributions').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
            ]);

            const profileWithCounts = {
              ...simpleProfile,
              education_count: education.count || 0,
              business_count: businesses.count || 0,
              career_count: career.count || 0,
              achievement_count: achievements.count || 0,
              links_count: links.count || 0,
              contribution_count: contributions.count || 0
            };

            evaluateCompletion(profileWithCounts);
          }
        } else if (profileData) {
          // Parse the complex query results
          const profileWithCounts = {
            ...profileData,
            education_count: (profileData.user_education as any)?.[0]?.count || 0,
            business_count: (profileData.user_businesses as any)?.[0]?.count || 0,
            career_count: (profileData.career_history as any)?.[0]?.count || 0,
            achievement_count: (profileData.achievements as any)?.[0]?.count || 0,
            links_count: (profileData.user_links as any)?.[0]?.count || 0,
            contribution_count: (profileData.contributions as any)?.[0]?.count || 0
          };

          evaluateCompletion(profileWithCounts);
        }
      } catch (error) {
        console.error('Error checking profile status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkProfileStatus();
  }, [user]);

  const handleDismiss = () => {
    setDismissed(true);
    setShowBanner(false);
    if (user) {
      sessionStorage.setItem(`profile-banner-dismissed-${user.id}`, 'true');
    }
  };

  const handleCompleteProfile = () => {
    // Navigate based on completion level
    if (completionData && completionData.percentage < 30) {
      navigate('/abud/onboarding'); // Go to onboarding for basic requirements
    } else {
      navigate('/abud/profile/edit'); // Go to profile edit for enhancements
    }
  };

  if (loading || !showBanner || dismissed || !completionData) {
    return null;
  }

  // Determine banner color based on completion
  const bannerColorClasses = {
    red: 'bg-red-50 border-red-200',
    amber: 'bg-amber-50 border-amber-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    green: 'bg-green-50 border-green-200'
  };

  const iconColorClasses = {
    red: 'text-red-600',
    amber: 'text-amber-600',
    yellow: 'text-yellow-600',
    green: 'text-green-600'
  };

  const buttonColorClasses = {
    red: 'bg-red-600 hover:bg-red-700',
    amber: 'bg-amber-600 hover:bg-amber-700',
    yellow: 'bg-yellow-600 hover:bg-yellow-700',
    green: 'bg-green-600 hover:bg-green-700'
  };

  const progressColorClasses = {
    red: '[&>*:last-child]:bg-red-500',
    amber: '[&>*:last-child]:bg-amber-500',
    yellow: '[&>*:last-child]:bg-yellow-500',
    green: '[&>*:last-child]:bg-green-500'
  };

  const nextAction = getNextProfileAction(completionData.breakdown);

  return (
    <div className={`w-full ${bannerColorClasses[completionData.color]} border-b ${className}`}>
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <Alert className="bg-transparent border-0 p-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            {/* Left side - Icon and content */}
            <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1">
              <AlertCircle className={`h-4 w-4 sm:h-5 sm:w-5 mt-0.5 sm:mt-0 flex-shrink-0 ${iconColorClasses[completionData.color]}`} />
              <div className="flex-1 min-w-0">
                {/* Main message and percentage on same line for mobile */}
                <div className="flex items-center justify-between sm:block">
                  <AlertDescription className="font-medium text-gray-900 text-sm sm:text-base">
                    {completionData.message}
                  </AlertDescription>
                  <span className="text-sm font-semibold text-gray-700 sm:hidden ml-2">
                    {completionData.percentage}%
                  </span>
                </div>
                {/* Progress bar and next action */}
                <div className="mt-1.5 sm:mt-2 space-y-1 sm:space-y-2">
                  <div className="flex items-center gap-2">
                    <Progress
                      value={completionData.percentage}
                      className={`h-1.5 sm:h-2 flex-1 ${progressColorClasses[completionData.color]}`}
                    />
                    <span className="hidden sm:inline text-sm font-semibold text-gray-700 min-w-[45px]">
                      {completionData.percentage}%
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                    <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span className="truncate">Next: {nextAction}</span>
                  </p>
                </div>
              </div>
            </div>
            {/* Right side - Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-auto">
              <Button
                size="sm"
                variant="default"
                onClick={handleCompleteProfile}
                className={`text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 h-7 sm:h-8 ${buttonColorClasses[completionData.color]}`}
              >
                {completionData.percentage < 30 ? 'Complete Required Steps' : 'Enhance Profile'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-7 w-7 sm:h-8 sm:w-8 p-0"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </Alert>
      </div>
    </div>
  );
};
