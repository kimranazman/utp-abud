import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  verifySession: () => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get the initial session first
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (mounted) {
          console.log('Get session result:', session, error);
          if (error) {
            console.error('Error getting session:', error);
          }
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false); // Only set loading false here for initial load
        }
      })
      .catch((error) => {
        if (mounted) {
          console.error('Error in getSession:', error);
          setLoading(false);
        }
      });

    // Set up auth state listener for subsequent changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (mounted) {
          console.log('Auth state change:', event, session);
          setSession(session);
          setUser(session?.user ?? null);
          // Don't set loading here - only for initial getSession
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/abud/auth`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link.",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Sign in failed", 
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/abud/auth`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const verifySession = async (): Promise<boolean> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        console.error('Session verification failed:', error);
        return false;
      }

      // Check if the session is expired
      const expiresAt = session.expires_at;
      if (expiresAt && new Date(expiresAt * 1000) < new Date()) {
        console.warn('Session has expired');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error verifying session:', error);
      return false;
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      console.log('Attempting to refresh session...');
      const { data: { session }, error } = await supabase.auth.refreshSession();

      if (error || !session) {
        console.error('Session refresh failed:', error);
        toast({
          title: "Session Expired",
          description: "Please sign in again to continue",
          variant: "destructive",
        });
        return false;
      }

      console.log('Session refreshed successfully');
      setSession(session);
      setUser(session.user);
      return true;
    } catch (error) {
      console.error('Error refreshing session:', error);
      toast({
        title: "Authentication Error",
        description: "Unable to refresh session. Please sign in again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      verifySession,
      refreshSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};