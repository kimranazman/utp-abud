import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReviewSkeleton } from './ProfileSectionSkeletons';

interface ReviewStepProps {
  profile: any;
  onComplete: () => void;
}

const ReviewStep = ({ profile, onComplete }: ReviewStepProps) => {
  const { user } = useAuth();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [stats, setStats] = useState({
    careerHistory: 0,
    achievements: 0,
    contributions: 0,
    businesses: 0,
    links: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    setIsInitialLoading(true);
    try {
      const [careerHistory, achievements, contributions, businesses, links] = await Promise.all([
        supabase.from('career_history').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('achievements').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('contributions').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('user_businesses').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('user_links').select('id', { count: 'exact' }).eq('user_id', user.id),
      ]);

      setStats({
        careerHistory: careerHistory.count || 0,
        achievements: achievements.count || 0,
        contributions: contributions.count || 0,
        businesses: businesses.count || 0,
        links: links.count || 0,
      });
    } catch (error: any) {
      toast({
        title: "Error fetching profile stats",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsInitialLoading(false);
    }
  };

  const getCompletionScore = () => {
    let score = 0;
    const maxScore = 11;

    // Basic profile completeness (5 points)
    if (profile?.full_name) score += 1;
    if (profile?.bio) score += 1;
    if (profile?.course) score += 1;
    if (profile?.graduation_year) score += 1;
    if (profile?.birthday) score += 1;

    // Additional sections (6 points)
    if (stats.careerHistory > 0) score += 1;
    if (stats.achievements > 0) score += 1;
    if (stats.contributions > 0) score += 1;
    if (stats.businesses > 0) score += 1;
    if (stats.links > 0) score += 1;
    if (profile?.profile_visibility) score += 1;

    return Math.round((score / maxScore) * 100);
  };

  const completionScore = getCompletionScore();

  const profileSections = [
    {
      title: 'Personal Details',
      items: [
        { label: 'Full Name', value: profile?.full_name, required: true },
        { label: 'Bio', value: profile?.bio, required: false },
        { label: 'Course', value: profile?.course, required: true },
        { label: 'Graduation Year', value: profile?.graduation_year, required: true },
        { label: 'Birthday', value: profile?.birthday, required: false },
        { label: 'Profile Visibility', value: profile?.profile_visibility, required: true },
      ]
    },
    {
      title: 'Professional Information',
      items: [
        { label: 'Career History', value: `${stats.careerHistory} entries`, required: false },
        { label: 'Achievements', value: `${stats.achievements} entries`, required: false },
        { label: 'Contributions', value: `${stats.contributions} entries`, required: false },
        { label: 'Businesses', value: `${stats.businesses} entries`, required: false },
        { label: 'Links & Social', value: `${stats.links} entries`, required: false },
      ]
    }
  ];

  // Show skeleton during initial loading
  if (isInitialLoading) {
    return <ReviewSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mb-4">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-2xl font-bold text-white mb-2 ${
            completionScore >= 80 ? 'bg-green-500' : completionScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
          }`}>
            {completionScore}%
          </div>
          <h3 className="text-lg font-semibold">Profile Completion Score</h3>
          <p className="text-muted-foreground">
            {completionScore >= 80 
              ? "Excellent! Your profile is comprehensive and will help other alumni find you easily."
              : completionScore >= 60 
              ? "Good! Consider adding more information to help other alumni discover you."
              : "Your profile could use more information to help other alumni connect with you."
            }
          </p>
        </div>
      </div>

      {profileSections.map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle className="text-lg">{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {section.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.label}</span>
                  <div className="flex items-center space-x-2">
                    {item.value ? (
                      <>
                        <span className="text-sm text-muted-foreground">
                          {typeof item.value === 'boolean' ? (item.value ? 'Yes' : 'No') : item.value}
                        </span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-muted-foreground">Not provided</span>
                        {item.required && <Badge variant="secondary">Required</Badge>}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Ready to Complete Your Profile!
            </h3>
            <p className="text-green-700 text-sm">
              Once you complete your profile, other alumni will be able to find and connect with you. 
              You can always update your information later in your profile settings.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          By completing your profile, you agree that your information will be visible to other verified UTP alumni 
          according to your privacy settings. Your profile will be subject to admin approval.
        </p>
      </div>
    </div>
  );
};

export default ReviewStep;