import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Ensures the user has a valid session before performing an operation.
 * Will attempt to refresh the session if it's expired.
 * @returns The valid session or null if authentication fails
 */
export async function ensureAuthenticated() {
  try {
    // First, check if we have a session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Error getting session:', sessionError);
      throw new Error('Authentication check failed');
    }

    if (!session) {
      console.warn('No active session found');

      // Try to refresh the session
      const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError || !newSession) {
        console.error('Failed to refresh session:', refreshError);
        toast({
          title: "Authentication Required",
          description: "Please sign in to continue",
          variant: "destructive",
        });
        return null;
      }

      console.log('Session refreshed successfully');
      return newSession;
    }

    // Check if the session is expired
    const expiresAt = session.expires_at;
    if (expiresAt && new Date(expiresAt * 1000) < new Date()) {
      console.warn('Session expired, attempting refresh...');

      const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError || !newSession) {
        console.error('Failed to refresh expired session:', refreshError);
        toast({
          title: "Session Expired",
          description: "Please sign in again",
          variant: "destructive",
        });
        return null;
      }

      return newSession;
    }

    return session;
  } catch (error) {
    console.error('Authentication error:', error);
    toast({
      title: "Authentication Error",
      description: "An error occurred while verifying your session",
      variant: "destructive",
    });
    return null;
  }
}

/**
 * Wrapper function to execute database operations with authentication check
 * @param operation The async operation to perform
 * @returns The result of the operation or null if authentication fails
 */
export async function withAuth<T>(
  operation: () => Promise<T>
): Promise<T | null> {
  const session = await ensureAuthenticated();

  if (!session) {
    console.error('Cannot perform operation: No valid session');
    return null;
  }

  try {
    return await operation();
  } catch (error: any) {
    console.error('Operation failed:', error);

    // Check if it's a 403 error (permission denied)
    if (error?.code === '403' || error?.message?.includes('403') || error?.message?.includes('policy')) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to perform this action. Try signing out and back in.",
        variant: "destructive",
      });

      // Try to refresh the session
      await supabase.auth.refreshSession();
    } else {
      toast({
        title: "Operation Failed",
        description: error?.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }

    return null;
  }
}

/**
 * Gets the current authenticated user ID
 * @returns The user ID or null if not authenticated
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await ensureAuthenticated();
  return session?.user?.id || null;
}

/**
 * Checks if the current session is valid without showing toasts
 * @returns true if the session is valid, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return false;
    }

    // Check if the session is expired
    const expiresAt = session.expires_at;
    if (expiresAt && new Date(expiresAt * 1000) < new Date()) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}