import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'utp_onboarding_progress';
const DRAFT_KEY_PREFIX = 'utp_onboarding_draft_';

export interface OnboardingProgress {
  currentStep: number;
  completedSteps: Set<number>;
  stepDrafts: Record<number, any>;
  lastSaved: Date;
  sessionId: string;
}

export interface StepProgress {
  stepName: string;
  stepIndex: number;
  isCompleted: boolean;
  isValidated: boolean;
  draftData: any;
  timeSpentSeconds: number;
  startedAt?: Date;
  completedAt?: Date;
}

class OnboardingPersistenceService {
  private sessionId: string;
  private saveTimer: NodeJS.Timeout | null = null;
  private stepStartTime: Map<number, number> = new Map();

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('onboarding_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('onboarding_session_id', sessionId);
    }
    return sessionId;
  }

  // Local Storage Methods
  getLocalProgress(): OnboardingProgress | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const progress = JSON.parse(stored);
      // Convert completedSteps array back to Set
      progress.completedSteps = new Set(progress.completedSteps);
      progress.lastSaved = new Date(progress.lastSaved);

      return progress;
    } catch (error) {
      console.error('Error loading onboarding progress:', error);
      return null;
    }
  }

  saveLocalProgress(progress: Partial<OnboardingProgress>): void {
    try {
      const existing = this.getLocalProgress();
      const updated = {
        ...existing,
        ...progress,
        completedSteps: Array.from(progress.completedSteps || existing?.completedSteps || new Set()),
        lastSaved: new Date(),
        sessionId: this.sessionId
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving onboarding progress:', error);
    }
  }

  saveStepDraft(stepIndex: number, data: any): void {
    try {
      const key = `${DRAFT_KEY_PREFIX}${stepIndex}`;
      localStorage.setItem(key, JSON.stringify({
        data,
        savedAt: new Date(),
        sessionId: this.sessionId
      }));

      // Update progress with draft reference
      const progress = this.getLocalProgress() || {
        currentStep: stepIndex,
        completedSteps: new Set(),
        stepDrafts: {},
        lastSaved: new Date(),
        sessionId: this.sessionId
      };

      progress.stepDrafts[stepIndex] = true;
      this.saveLocalProgress(progress);
    } catch (error) {
      console.error('Error saving step draft:', error);
    }
  }

  getStepDraft(stepIndex: number): any | null {
    try {
      const key = `${DRAFT_KEY_PREFIX}${stepIndex}`;
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const draft = JSON.parse(stored);
      return draft.data;
    } catch (error) {
      console.error('Error loading step draft:', error);
      return null;
    }
  }

  clearStepDraft(stepIndex: number): void {
    const key = `${DRAFT_KEY_PREFIX}${stepIndex}`;
    localStorage.removeItem(key);

    const progress = this.getLocalProgress();
    if (progress?.stepDrafts) {
      delete progress.stepDrafts[stepIndex];
      this.saveLocalProgress(progress);
    }
  }

  clearAllProgress(): void {
    // Remove main progress
    localStorage.removeItem(STORAGE_KEY);

    // Remove all drafts
    for (let i = 0; i < 8; i++) {
      localStorage.removeItem(`${DRAFT_KEY_PREFIX}${i}`);
    }

    // Clear session
    sessionStorage.removeItem('onboarding_session_id');
  }

  // Database Methods
  async syncProgressToDatabase(userId: string, stepIndex: number, stepName: string, data?: any): Promise<void> {
    try {
      const timeSpent = this.getTimeSpentOnStep(stepIndex);

      const { error } = await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: userId,
          step_name: stepName,
          step_index: stepIndex,
          draft_data: data,
          time_spent_seconds: timeSpent,
          is_completed: false,
          is_validated: false,
          last_saved_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,step_name'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error syncing progress to database:', error);
      throw error;
    }
  }

  async markStepCompleted(userId: string, stepIndex: number, stepName: string): Promise<void> {
    try {
      const timeSpent = this.getTimeSpentOnStep(stepIndex);

      const { error } = await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: userId,
          step_name: stepName,
          step_index: stepIndex,
          is_completed: true,
          is_validated: true,
          time_spent_seconds: timeSpent,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,step_name'
        });

      if (error) throw error;

      // Clear local draft after successful completion
      this.clearStepDraft(stepIndex);

      // Track analytics event
      await this.trackEvent(userId, 'step_completed', stepName, stepIndex, {
        timeSpent,
        sessionId: this.sessionId
      });
    } catch (error) {
      console.error('Error marking step as completed:', error);
      throw error;
    }
  }

  async loadDatabaseProgress(userId: string): Promise<StepProgress[]> {
    try {
      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', userId)
        .order('step_index', { ascending: true });

      if (error) throw error;

      return (data || []).map(row => ({
        stepName: row.step_name,
        stepIndex: row.step_index,
        isCompleted: row.is_completed,
        isValidated: row.is_validated,
        draftData: row.draft_data,
        timeSpentSeconds: row.time_spent_seconds || 0,
        startedAt: row.started_at ? new Date(row.started_at) : undefined,
        completedAt: row.completed_at ? new Date(row.completed_at) : undefined
      }));
    } catch (error) {
      console.error('Error loading database progress:', error);
      return [];
    }
  }

  async getUserOnboardingStatus(userId: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_user_onboarding_status', { p_user_id: userId });

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error getting onboarding status:', error);
      return null;
    }
  }

  // Analytics Methods
  async trackEvent(
    userId: string,
    eventType: string,
    stepName?: string,
    stepIndex?: number,
    metadata?: any
  ): Promise<void> {
    try {
      const deviceInfo = {
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        isMobile: /Mobile|Android|iPhone/i.test(navigator.userAgent)
      };

      const { error } = await supabase
        .from('onboarding_analytics')
        .insert({
          user_id: userId,
          event_type: eventType,
          step_name: stepName,
          step_index: stepIndex,
          metadata,
          session_id: this.sessionId,
          device_info: deviceInfo
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking analytics event:', error);
    }
  }

  // Time Tracking Methods
  startStepTimer(stepIndex: number): void {
    this.stepStartTime.set(stepIndex, Date.now());
  }

  getTimeSpentOnStep(stepIndex: number): number {
    const startTime = this.stepStartTime.get(stepIndex);
    if (!startTime) return 0;

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    return timeSpent;
  }

  // Auto-save Methods
  scheduleAutoSave(callback: () => void, delayMs: number = 30000): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = setTimeout(() => {
      callback();
      // Reschedule for continuous auto-save
      this.scheduleAutoSave(callback, delayMs);
    }, delayMs);
  }

  cancelAutoSave(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
  }

  // Utility Methods
  async mergeLocalAndDatabaseProgress(userId: string): Promise<OnboardingProgress> {
    const localProgress = this.getLocalProgress();
    const dbProgress = await this.loadDatabaseProgress(userId);

    // Merge completed steps from both sources
    const completedSteps = new Set<number>();

    // Add locally completed steps
    if (localProgress?.completedSteps) {
      localProgress.completedSteps.forEach(step => completedSteps.add(step));
    }

    // Add database completed steps
    dbProgress.forEach(step => {
      if (step.isCompleted) {
        completedSteps.add(step.stepIndex);
      }
    });

    // Determine current step (first incomplete step)
    let currentStep = 0;
    for (let i = 0; i < 8; i++) {
      if (!completedSteps.has(i)) {
        currentStep = i;
        break;
      }
    }

    // Merge drafts
    const stepDrafts: Record<number, any> = {};
    dbProgress.forEach(step => {
      if (step.draftData && !step.isCompleted) {
        stepDrafts[step.stepIndex] = step.draftData;
      }
    });

    // Local drafts take precedence (more recent)
    if (localProgress?.stepDrafts) {
      Object.keys(localProgress.stepDrafts).forEach(key => {
        const stepIndex = parseInt(key);
        const draft = this.getStepDraft(stepIndex);
        if (draft) {
          stepDrafts[stepIndex] = draft;
        }
      });
    }

    return {
      currentStep,
      completedSteps,
      stepDrafts,
      lastSaved: new Date(),
      sessionId: this.sessionId
    };
  }
}

// Export singleton instance
export const onboardingPersistence = new OnboardingPersistenceService();