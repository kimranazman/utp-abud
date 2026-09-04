import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { onboardingPersistence, OnboardingProgress, StepProgress } from '@/lib/onboardingPersistence';
import { toast } from 'sonner';

interface UseOnboardingPersistenceOptions {
  autoSave?: boolean;
  autoSaveInterval?: number;
  syncWithDatabase?: boolean;
}

interface UseOnboardingPersistenceReturn {
  progress: OnboardingProgress | null;
  isLoading: boolean;
  isSaving: boolean;
  saveProgress: (updates: Partial<OnboardingProgress>) => void;
  saveDraft: (stepIndex: number, data: any) => void;
  getDraft: (stepIndex: number) => any | null;
  markStepCompleted: (stepIndex: number, stepName: string) => Promise<void>;
  clearProgress: () => void;
  syncWithDatabase: () => Promise<void>;
  startStepTimer: (stepIndex: number) => void;
  getTimeSpent: (stepIndex: number) => number;
}

export function useOnboardingPersistence(
  options: UseOnboardingPersistenceOptions = {}
): UseOnboardingPersistenceReturn {
  const {
    autoSave = true,
    autoSaveInterval = 30000, // 30 seconds
    syncWithDatabase = true
  } = options;

  const { user } = useAuth();
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveCallbackRef = useRef<() => void>();
  const lastSyncTime = useRef<Date>(new Date());

  // Load initial progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      setIsLoading(true);
      try {
        if (user && syncWithDatabase) {
          // Merge local and database progress
          const merged = await onboardingPersistence.mergeLocalAndDatabaseProgress(user.id);
          setProgress(merged);
          onboardingPersistence.saveLocalProgress(merged);
        } else {
          // Load only local progress
          const local = onboardingPersistence.getLocalProgress();
          if (local) {
            setProgress(local);
          } else {
            // Initialize new progress
            const newProgress: OnboardingProgress = {
              currentStep: 0,
              completedSteps: new Set(),
              stepDrafts: {},
              lastSaved: new Date(),
              sessionId: sessionStorage.getItem('onboarding_session_id') || 'new'
            };
            setProgress(newProgress);
          }
        }
      } catch (error) {
        console.error('Error loading onboarding progress:', error);
        toast.error('Failed to load your progress. Starting fresh.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [user, syncWithDatabase]);

  // Save progress to local storage
  const saveProgress = useCallback((updates: Partial<OnboardingProgress>) => {
    const updatedProgress = {
      ...progress,
      ...updates,
      lastSaved: new Date()
    } as OnboardingProgress;

    setProgress(updatedProgress);
    onboardingPersistence.saveLocalProgress(updatedProgress);
  }, [progress]);

  // Save draft for a specific step
  const saveDraft = useCallback((stepIndex: number, data: any) => {
    onboardingPersistence.saveStepDraft(stepIndex, data);

    // Update progress state
    if (progress) {
      const updatedProgress = {
        ...progress,
        stepDrafts: {
          ...progress.stepDrafts,
          [stepIndex]: true
        }
      };
      setProgress(updatedProgress);
    }
  }, [progress]);

  // Get draft for a specific step
  const getDraft = useCallback((stepIndex: number): any | null => {
    return onboardingPersistence.getStepDraft(stepIndex);
  }, []);

  // Mark step as completed
  const markStepCompleted = useCallback(async (stepIndex: number, stepName: string) => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Update database
      await onboardingPersistence.markStepCompleted(user.id, stepIndex, stepName);

      // Update local progress
      const updatedCompletedSteps = new Set(progress?.completedSteps || []);
      updatedCompletedSteps.add(stepIndex);

      const updatedProgress: OnboardingProgress = {
        currentStep: Math.min(stepIndex + 1, 7), // Move to next step
        completedSteps: updatedCompletedSteps,
        stepDrafts: progress?.stepDrafts || {},
        lastSaved: new Date(),
        sessionId: progress?.sessionId || 'new'
      };

      setProgress(updatedProgress);
      onboardingPersistence.saveLocalProgress(updatedProgress);

      toast.success('Step completed successfully!');
    } catch (error) {
      console.error('Error marking step as completed:', error);
      toast.error('Failed to save progress. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [user, progress]);

  // Clear all progress
  const clearProgress = useCallback(() => {
    onboardingPersistence.clearAllProgress();
    setProgress({
      currentStep: 0,
      completedSteps: new Set(),
      stepDrafts: {},
      lastSaved: new Date(),
      sessionId: 'new'
    });
  }, []);

  // Sync with database
  const syncProgressToDatabase = useCallback(async () => {
    if (!user || !progress) return;

    const now = new Date();
    const timeSinceLastSync = now.getTime() - lastSyncTime.current.getTime();

    // Throttle syncs to prevent too frequent updates
    if (timeSinceLastSync < 5000) return; // 5 seconds minimum between syncs

    setIsSaving(true);
    try {
      // Sync current step draft if it exists
      const currentDraft = getDraft(progress.currentStep);
      if (currentDraft) {
        const stepName = getStepName(progress.currentStep);
        await onboardingPersistence.syncProgressToDatabase(
          user.id,
          progress.currentStep,
          stepName,
          currentDraft
        );
      }

      lastSyncTime.current = now;
    } catch (error) {
      console.error('Error syncing with database:', error);
    } finally {
      setIsSaving(false);
    }
  }, [user, progress, getDraft]);

  // Auto-save setup
  useEffect(() => {
    if (!autoSave || !user) return;

    autoSaveCallbackRef.current = async () => {
      if (syncWithDatabase) {
        await syncProgressToDatabase();
      }
    };

    // Schedule auto-save
    onboardingPersistence.scheduleAutoSave(() => {
      if (autoSaveCallbackRef.current) {
        autoSaveCallbackRef.current();
      }
    }, autoSaveInterval);

    return () => {
      onboardingPersistence.cancelAutoSave();
    };
  }, [autoSave, autoSaveInterval, syncWithDatabase, syncProgressToDatabase, user]);

  // Track page visibility to save on hide
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && autoSaveCallbackRef.current) {
        autoSaveCallbackRef.current();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Track beforeunload to save before leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (progress?.stepDrafts && Object.keys(progress.stepDrafts).length > 0) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';

        // Try to save before leaving
        if (autoSaveCallbackRef.current) {
          autoSaveCallbackRef.current();
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [progress]);

  // Time tracking methods
  const startStepTimer = useCallback((stepIndex: number) => {
    onboardingPersistence.startStepTimer(stepIndex);
  }, []);

  const getTimeSpent = useCallback((stepIndex: number): number => {
    return onboardingPersistence.getTimeSpentOnStep(stepIndex);
  }, []);

  return {
    progress,
    isLoading,
    isSaving,
    saveProgress,
    saveDraft,
    getDraft,
    markStepCompleted,
    clearProgress,
    syncWithDatabase: syncProgressToDatabase,
    startStepTimer,
    getTimeSpent
  };
}

// Helper function to get step name
function getStepName(stepIndex: number): string {
  const steps = [
    'personal_details',
    'education',
    'businesses',
    'career_history',
    'achievements',
    'contributions',
    'links_social',
    'review'
  ];
  return steps[stepIndex] || `step_${stepIndex}`;
}