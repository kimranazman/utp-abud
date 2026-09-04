import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';

import PersonalDetailsStep from '@/components/onboarding/PersonalDetailsStep';
import EducationStep from '@/components/onboarding/EducationStep';
import CareerHistoryStep from '@/components/onboarding/CareerHistoryStep';
import AchievementsStep from '@/components/onboarding/AchievementsStep';
import ContributionsStep from '@/components/onboarding/ContributionsStep';
import BusinessesStep from '@/components/onboarding/BusinessesStep';
import LinksStep from '@/components/onboarding/LinksStep';
import ReviewStep from '@/components/onboarding/ReviewStep';

const STEPS = [
  { id: 'personal', title: 'Personal Details', description: 'Basic information about you', required: true },
  { id: 'education', title: 'Education', description: 'Your UTP programmes and studies', required: true },
  { id: 'businesses', title: 'Businesses', description: 'Companies you own or founded', required: true },
  { id: 'career', title: 'Career History', description: 'Your professional experience', required: false },
  { id: 'achievements', title: 'Achievements', description: 'Your accomplishments and awards', required: false },
  { id: 'contributions', title: 'Contributions', description: 'Your involvement in organizations', required: false },
  { id: 'links', title: 'Links & Social', description: 'Your online presence', required: false },
  { id: 'review', title: 'Review', description: 'Review and finalize your profile', required: false },
];

const ProfileOnboarding = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set<number>());
  const [profile, setProfile] = useState<any>(null);
  const [requiredStepsCompleted, setRequiredStepsCompleted] = useState(false);
  const [canAccessDirectory, setCanAccessDirectory] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/abud/auth');
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, loading, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      setProfile(data);

      // Check if profile is already completed
      if (data.profile_completed) {
        navigate('/abud');
      }
    } catch (error: any) {
      toast({
        title: "Error fetching profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStepComplete = (stepIndex: number) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
  };

  // Check if all required steps are completed
  useEffect(() => {
    const requiredStepIndices = STEPS
      .map((step, index) => ({ step, index }))
      .filter(({ step }) => step.required)
      .map(({ index }) => index);

    const allRequiredCompleted = requiredStepIndices.every(index => completedSteps.has(index));
    setRequiredStepsCompleted(allRequiredCompleted);

    // Check if user can access directory (has completed required steps in database)
    if (profile?.required_steps_completed) {
      setCanAccessDirectory(true);
    }
  }, [completedSteps, profile]);

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

  const handleCompleteRequired = async () => {
    try {
      await supabase
        .from('profiles')
        .update({ required_steps_completed: true })
        .eq('user_id', user?.id);

      toast({
        title: "Required information completed!",
        description: "Thanks for filling up the required details. Once your account has been verified, you will also appear in the directory.",
      });

      navigate('/abud');
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleComplete = async () => {
    try {
      await supabase
        .from('profiles')
        .update({
          profile_completed: true,
          required_steps_completed: true
        })
        .eq('user_id', user?.id);

      toast({
        title: "Profile completed!",
        description: "Your profile has been successfully set up.",
      });

      navigate('/abud');
    } catch (error: any) {
      toast({
        title: "Error completing profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    const stepId = STEPS[currentStep].id;
    const complete = () => handleStepComplete(currentStep);

    switch (stepId) {
      case 'personal':
        return <PersonalDetailsStep profile={profile} onComplete={complete} />;
      case 'education':
        return <EducationStep onComplete={complete} />;
      case 'businesses':
        return <BusinessesStep onComplete={complete} />;
      case 'career':
        return <CareerHistoryStep onComplete={complete} />;
      case 'achievements':
        return <AchievementsStep onComplete={complete} />;
      case 'contributions':
        return <ContributionsStep onComplete={complete} />;
      case 'links':
        return <LinksStep onComplete={complete} />;
      case 'review':
        return <ReviewStep profile={profile} onComplete={complete} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
          {!canAccessDirectory && (
            <p className="text-amber-600 font-medium mb-2">
              Please fill in the personal details, education and business information to view the directory.
            </p>
          )}
          <p className="text-muted-foreground">
            Help other alumni find and connect with you by completing your profile
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-8">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`text-center p-2 rounded-lg border ${
                index === currentStep
                  ? 'bg-primary text-primary-foreground border-primary'
                  : completedSteps.has(index)
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                {completedSteps.has(index) ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-semibold">{index + 1}</span>
                )}
              </div>
              <p className="text-xs font-medium">
                {step.title}
                {step.required && <span className="text-red-500">*</span>}
              </p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep].title}</CardTitle>
            <CardDescription>{STEPS[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </Button>

          <div className="flex gap-2">
            {/* Show "Skip" button for optional steps */}
            {!STEPS[currentStep].required && currentStep < STEPS.length - 1 && (
              <Button variant="ghost" onClick={handleNext}>
                Skip
              </Button>
            )}

            {/* Show "Continue to Directory" when required steps are complete */}
            {requiredStepsCompleted && !canAccessDirectory && (
              <Button
                onClick={handleCompleteRequired}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Continue to Directory
              </Button>
            )}

            {currentStep < STEPS.length - 1 ? (
              <Button onClick={handleNext}>
                {STEPS[currentStep].required ? 'Next (Required)' : 'Next'}
              </Button>
            ) : (
              <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                Complete Full Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOnboarding;