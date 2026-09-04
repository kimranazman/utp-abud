import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { IncompleteProfileBanner } from './IncompleteProfileBanner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireCompleteProfile?: boolean;
  requireAdmin?: boolean;
  showBanner?: boolean;
}

export const ProtectedRoute = ({
  children,
  requireCompleteProfile = false,
  requireAdmin = false,
  showBanner = true
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      // Wait for auth to load
      if (loading) return;

      // Redirect to auth if not authenticated
      if (!user) {
        navigate('/abud/auth');
        return;
      }

      // Check admin role if required
      if (requireAdmin) {
        try {
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .maybeSingle();

          if (roleError || !roleData) {
            console.warn('Access denied: Admin privileges required');
            navigate('/abud');
            return;
          }

          setIsAdmin(true);
        } catch (error) {
          console.error('Error checking admin role:', error);
          navigate('/abud');
          return;
        }
      }

      // Check profile completion status
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('required_steps_completed, profile_completed')
          .eq('user_id', user.id)
          .single();

        if (!error && profile) {
          setProfileComplete(profile.profile_completed || false);

          // Check if basic requirements are met first
          // Only redirect if explicitly false, not null or undefined
          if (profile.required_steps_completed === false) {
            navigate('/abud/onboarding');
            return;
          }

          // If full profile is required and it's not complete, redirect to profile edit
          if (requireCompleteProfile && !profile.profile_completed) {
            navigate('/abud/profile/edit');
            return;
          }
        } else if (error) {
          // If there's an error getting the profile, assume incomplete
          setProfileComplete(false);
          if (requireCompleteProfile) {
            navigate('/abud/onboarding');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        setProfileComplete(false);
        if (requireCompleteProfile) {
          navigate('/abud/onboarding');
        }
      } finally {
        setCheckingProfile(false);
      }
    };

    checkAccess();
  }, [user, loading, navigate, requireCompleteProfile, requireAdmin]);

  // Show loading while checking auth and profile
  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  // Render children with optional banner
  return (
    <>
      {showBanner && profileComplete === false && <IncompleteProfileBanner />}
      {children}
    </>
  );
};