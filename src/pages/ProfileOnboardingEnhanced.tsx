import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingPersistence } from '@/hooks/useOnboardingPersistence';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  CheckCircle,
  Save,
  Clock,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Home,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import PersonalDetailsStep from '@/components/onboarding/PersonalDetailsStep';
import EducationStep from '@/components/onboarding/EducationStep';
import CareerHistoryStep from '@/components/onboarding/CareerHistoryStep';
import AchievementsStep from '@/components/onboarding/AchievementsStep';
import ContributionsStep from '@/components/onboarding/ContributionsStep';
import BusinessesStep from '@/components/onboarding/BusinessesStep';
import LinksStep from '@/components/onboarding/LinksStep';
import ReviewStep from '@/components/onboarding/ReviewStep';

import { StepIndicator, CompactStepProgress, Step } from '@/components/onboarding/StepIndicator';

const STEP_CONFIG = [
  {
    id: 'personal',
    title: 'Personal Details',
    subtitle: 'Basic information',
    description: 'Your name, bio, and profile picture',
    required: true,
    estimatedTime: '2 min',
    group: 'identity'
  },
  {
    id: 'education',
    title: 'Education',
    subtitle: 'UTP programmes',
    description: 'Your academic background and qualifications',
    required: true,
    estimatedTime: '3 min',
    group: 'identity'
  },
  {
    id: 'businesses',
    title: 'Businesses',
    subtitle: 'Companies founded',
    description: 'Organizations you own or co-founded',
    required: true,
    estimatedTime: '3 min',
    group: 'professional'
  },
  {
    id: 'career',
    title: 'Career History',
    subtitle: 'Work experience',
    description: 'Your professional journey and positions',
    required: false,
    estimatedTime: '5 min',
    group: 'professional'
  },
  {
    id: 'achievements',
    title: 'Achievements',
    subtitle: 'Awards & recognition',
    description: 'Notable accomplishments and honors',
    required: false,
    estimatedTime: '3 min',
    group: 'additional'
  },
  {
    id: 'contributions',
    title: 'Contributions',
    subtitle: 'Community involvement',
    description: 'Your impact and organizational roles',
    required: false,
    estimatedTime: '3 min',
    group: 'additional'
  },
  {
    id: 'links',
    title: 'Links & Social',
    subtitle: 'Online presence',
    description: 'Social media and professional profiles',
    required: false,
    estimatedTime: '2 min',
    group: 'additional'
  },
  {
    id: 'review',
    title: 'Review & Submit',
    subtitle: 'Final check',
    description: 'Review all information before submission',
    required: false,
    estimatedTime: '1 min',
    group: 'review'
  },
];

const STEP_GROUPS = [
  { title: 'Identity', steps: [0, 1] },
  { title: 'Professional', steps: [2, 3] },
  { title: 'Additional', steps: [4, 5, 6] },
  { title: 'Review', steps: [7] }
];

const ProfileOnboardingEnhanced = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set<number>());
  const [profile, setProfile] = useState<any>(null);
  const [requiredStepsCompleted, setRequiredStepsCompleted] = useState(false);
  const [canAccessDirectory, setCanAccessDirectory] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  // Persistence hooks
  const {
    progress,
    isLoading: isLoadingProgress,
    isSaving,
    saveProgress,
    saveDraft,
    getDraft,
    markStepCompleted,
    clearProgress,
    startStepTimer,
    getTimeSpent
  } = useOnboardingPersistence({
    autoSave: true,
    autoSaveInterval: 30000,
    syncWithDatabase: true
  });

  // Initialize from persisted progress
  useEffect(() => {
    if (progress && !isLoadingProgress) {
      setCurrentStep(progress.currentStep || 0);
      setCompletedSteps(progress.completedSteps || new Set());
    }
  }, [progress, isLoadingProgress]);

  // Start timer for current step
  useEffect(() => {
    startStepTimer(currentStep);
  }, [currentStep, startStepTimer]);

  // Auth check
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

      // Check if user can access directory
      if (data.required_steps_completed) {
        setCanAccessDirectory(true);
      }
    } catch (error: any) {
      toast.error("Error fetching profile: " + error.message);
    }
  };

  const handleStepComplete = useCallback(async (stepIndex: number) => {
    const newCompletedSteps = new Set([...completedSteps, stepIndex]);
    setCompletedSteps(newCompletedSteps);

    // Update persistence
    saveProgress({
      currentStep: stepIndex,
      completedSteps: newCompletedSteps
    });

    // Mark step as completed in database
    if (user) {
      await markStepCompleted(stepIndex, STEP_CONFIG[stepIndex].id);
    }

    // Show success animation
    toast.success(
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4" />
        <span>{STEP_CONFIG[stepIndex].title} completed!</span>
      </div>
    );
  }, [completedSteps, saveProgress, markStepCompleted, user]);

  // Check if all required steps are completed
  useEffect(() => {
    const requiredStepIndices = STEP_CONFIG
      .map((step, index) => ({ step, index }))
      .filter(({ step }) => step.required)
      .map(({ index }) => index);

    const allRequiredCompleted = requiredStepIndices.every(index => completedSteps.has(index));
    setRequiredStepsCompleted(allRequiredCompleted);
  }, [completedSteps]);

  const navigateToStep = useCallback(async (targetStep: number) => {
    if (targetStep === currentStep) return;

    setIsTransitioning(true);

    // Save current step draft before navigating
    const currentStepElement = document.querySelector('[data-step-form]');
    if (currentStepElement) {
      const formData = new FormData(currentStepElement as HTMLFormElement);
      const data = Object.fromEntries(formData);
      saveDraft(currentStep, data);
    }

    // Update progress
    saveProgress({
      currentStep: targetStep,
      completedSteps
    });

    setTimeout(() => {
      setCurrentStep(targetStep);
      setIsTransitioning(false);
    }, 300);
  }, [currentStep, completedSteps, saveProgress, saveDraft]);

  const handleNext = () => {
    if (currentStep < STEP_CONFIG.length - 1) {
      navigateToStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      navigateToStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to completed steps or the next available step
    const canNavigate = completedSteps.has(stepIndex) ||
                       stepIndex === Array.from(completedSteps).sort((a, b) => a - b).pop()! + 1 ||
                       stepIndex === 0;

    if (canNavigate) {
      navigateToStep(stepIndex);
    } else {
      toast.error("Complete previous steps first");
    }
  };

  const handleSaveAndContinueLater = async () => {
    // Force save current progress
    saveProgress({
      currentStep,
      completedSteps
    });

    toast.success("Progress saved! You can continue anytime.");
    navigate('/abud');
  };

  const handleCompleteRequired = async () => {
    try {
      await supabase
        .from('profiles')
        .update({ required_steps_completed: true })
        .eq('user_id', user?.id);

      toast.success(
        <div>
          <p className="font-semibold">Required information completed!</p>
          <p className="text-sm">You can now access the directory. Complete optional sections for better visibility.</p>
        </div>
      );

      navigate('/abud');
    } catch (error: any) {
      toast.error("Error updating profile: " + error.message);
    }
  };

  const handleCompleteProfile = async () => {
    try {
      await supabase
        .from('profiles')
        .update({
          profile_completed: true,
          required_steps_completed: true
        })
        .eq('user_id', user?.id);

      // Clear local progress
      clearProgress();

      toast.success("Profile completed! Welcome to the UTP Alumni Network.");
      navigate('/abud');
    } catch (error: any) {
      toast.error("Error completing profile: " + error.message);
    }
  };

  // Convert config to Step format for indicator
  const steps: Step[] = STEP_CONFIG.map((config, index) => ({
    index,
    title: config.title,
    subtitle: config.subtitle,
    isRequired: config.required,
    isCompleted: completedSteps.has(index),
    isCurrent: index === currentStep,
    isAvailable: index === 0 || completedSteps.has(index - 1),
    estimatedTime: config.estimatedTime
  }));

  const requiredSteps = STEP_CONFIG
    .map((step, index) => ({ step, index }))
    .filter(({ step }) => step.required)
    .map(({ index }) => index);

  if (loading || !user || isLoadingProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    const stepId = STEP_CONFIG[currentStep].id;
    const complete = () => handleStepComplete(currentStep);
    const draft = getDraft(currentStep);

    const StepComponent = () => {
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
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <StepComponent />
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Complete Your Profile
          </h1>

          {!canAccessDirectory && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 max-w-2xl mx-auto">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">
                  Complete personal details, education, and business info to access the directory
                </p>
              </div>
            </div>
          )}

          <p className="text-muted-foreground">
            Help other alumni find and connect with you
          </p>

          {/* Time estimate */}
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Estimated time: ~15 minutes total</span>
          </div>
        </motion.div>

        {/* Progress Indicators */}
        <div className="mb-8">
          {/* Desktop Step Indicator */}
          <div className="hidden lg:block">
            <StepIndicator
              steps={steps}
              onStepClick={handleStepClick}
              orientation="horizontal"
              showEstimatedTime={true}
              showConnectors={true}
              groupedSteps={STEP_GROUPS}
            />
          </div>

          {/* Mobile Compact Progress */}
          <div className="lg:hidden">
            <CompactStepProgress
              currentStep={currentStep}
              totalSteps={STEP_CONFIG.length}
              completedSteps={completedSteps}
              requiredSteps={requiredSteps}
              onStepClick={handleStepClick}
            />
          </div>
        </div>

        {/* Auto-save indicator */}
        {isSaving && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-3 flex items-center gap-2 z-50"
          >
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            <span className="text-sm">Saving progress...</span>
          </motion.div>
        )}

        {/* Main Content Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {STEP_CONFIG[currentStep].title}
                  {STEP_CONFIG[currentStep].required && (
                    <span className="ml-2 text-red-500">*</span>
                  )}
                </CardTitle>
                <CardDescription className="mt-1">
                  {STEP_CONFIG[currentStep].description}
                </CardDescription>
              </div>

              {/* Step timer */}
              <div className="text-right">
                <p className="text-sm text-gray-500">Time on step</p>
                <p className="text-lg font-mono">
                  {Math.floor(getTimeSpent(currentStep) / 60)}:
                  {String(getTimeSpent(currentStep) % 60).padStart(2, '0')}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div data-step-form>
              {renderStep()}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-white rounded-lg shadow-md"
        >
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex-1 sm:flex-initial"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <Button
              variant="ghost"
              onClick={handleSaveAndContinueLater}
              className="flex-1 sm:flex-initial"
            >
              <Save className="h-4 w-4 mr-2" />
              Save & Exit
            </Button>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {/* Skip button for optional steps */}
            {!STEP_CONFIG[currentStep].required && currentStep < STEP_CONFIG.length - 1 && (
              <Button
                variant="ghost"
                onClick={handleNext}
                className="flex-1 sm:flex-initial"
              >
                Skip for now
              </Button>
            )}

            {/* Continue to Directory button */}
            {requiredStepsCompleted && !canAccessDirectory && (
              <Button
                onClick={handleCompleteRequired}
                className="bg-amber-600 hover:bg-amber-700 flex-1 sm:flex-initial"
              >
                <Home className="h-4 w-4 mr-2" />
                Continue to Directory
              </Button>
            )}

            {/* Next/Complete button */}
            {currentStep < STEP_CONFIG.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={STEP_CONFIG[currentStep].required && !completedSteps.has(currentStep)}
                className="flex-1 sm:flex-initial"
              >
                {STEP_CONFIG[currentStep].required ? 'Next (Required)' : 'Next'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleCompleteProfile}
                disabled={!Array.from({ length: STEP_CONFIG.length }).every((_, i) =>
                  !STEP_CONFIG[i].required || completedSteps.has(i)
                )}
                className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-initial"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Profile
              </Button>
            )}
          </div>
        </motion.div>

        {/* Mobile Quick Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t lg:hidden p-2">
          <div className="flex justify-around">
            {STEP_GROUPS.map((group, index) => (
              <button
                key={index}
                onClick={() => {
                  const firstStepInGroup = group.steps[0];
                  if (completedSteps.has(firstStepInGroup) || firstStepInGroup === 0) {
                    navigateToStep(firstStepInGroup);
                  }
                }}
                className={`p-2 text-xs ${
                  group.steps.includes(currentStep)
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-500'
                }`}
              >
                {group.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOnboardingEnhanced;