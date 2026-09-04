import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { useLandingStats } from '@/hooks/useLandingStats';
import {
  Users,
  Building2,
  MessageCircle,
  Search,
  Award,
  TrendingUp,
  Globe,
  Calendar
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const { data: landingStats, isLoading: statsLoading } = useLandingStats();

  // Check profile completion for authenticated users only
  useEffect(() => {
    const checkUserProfile = async () => {
      if (!loading) {
        // Allow public access to landing page
        if (!user) {
          setCheckingProfile(false);
          return;
        }

        // Check if required steps are completed for authenticated users
        try {
          // Force a fresh fetch to avoid stale data
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('profile_completed, required_steps_completed, full_name, business_intent')
            .eq('user_id', user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
            navigate('/abud/onboarding');
            return;
          }

          // If profile doesn't exist, redirect to onboarding
          if (!profile) {
            console.log('No profile found, redirecting to onboarding...');
            navigate('/abud/onboarding');
            return;
          }

          // Check if flag is already true - no need to redirect
          if (profile.required_steps_completed === true) {
            setCheckingProfile(false);
            return;
          }

          // If flag is false or null, check actual requirements
          // This handles cases where users completed requirements but flag wasn't set
          const hasFullName = profile.full_name && profile.full_name.trim() !== '';

          // Check for education entries
          const { data: educationData } = await supabase
            .from('user_education')
            .select('id')
            .eq('user_id', user.id)
            .limit(1);

          const hasEducation = educationData && educationData.length > 0;

          // Check for business entries
          const { data: businessData } = await supabase
            .from('user_businesses')
            .select('id')
            .eq('user_id', user.id)
            .limit(1);

          const hasBusiness = businessData && businessData.length > 0;
          const hasBusinessIntent = profile.business_intent !== null && profile.business_intent !== undefined;
          const hasBusinessOrIntent = hasBusiness || hasBusinessIntent;

          // If user has all requirements, update the flag and continue
          if (hasFullName && hasEducation && hasBusinessOrIntent) {
            console.log('User has completed requirements, updating flag...');
            await supabase
              .from('profiles')
              .update({ required_steps_completed: true })
              .eq('user_id', user.id);

            setCheckingProfile(false);
            return;
          }

          // Only redirect if actually missing requirements
          console.log('Missing requirements:', { hasFullName, hasEducation, hasBusiness, hasBusinessIntent });
          navigate('/abud/onboarding');

        } catch (error) {
          console.error('Error checking profile:', error);
          // If there's an error checking profile, redirect to onboarding to be safe
          navigate('/abud/onboarding');
        }
      }
    };

    checkUserProfile();
  }, [user, loading, navigate]);

  if (loading || (user && checkingProfile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Users,
      title: "Alumni Network",
      description: "Connect with thousands of UTP alumni worldwide"
    },
    {
      icon: Building2,
      title: "Business Directory",
      description: "Discover alumni-owned businesses and opportunities"
    },
    {
      icon: MessageCircle,
      title: "Networking",
      description: "Direct messaging and connection requests"
    },
    {
      icon: Search,
      title: "Advanced Search",
      description: "Find alumni by batch, industry, location and more"
    }
  ];

  // Stats for the landing page (from useLandingStats hook)
  const stats = [
    { value: landingStats?.alumni || 0, label: 'Alumni', icon: Users, suffix: '+' },
    { value: landingStats?.businesses || 0, label: 'Businesses', icon: Building2, suffix: '+' },
    { value: landingStats?.countries || 0, label: 'Countries', icon: Globe, suffix: '+' },
    { value: landingStats?.years || 27, label: 'Years', icon: Calendar, suffix: '+' }
  ];

  return (
    <>
      <SEO
        title="UTP Alumni Business Directory - Connect, Network, Grow"
        description="Join thousands of UTP alumni worldwide. Discover businesses, build connections, and grow your professional network with fellow Universiti Teknologi PETRONAS graduates."
        canonical="/"
      />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <HeroSection
          badge="Alumni Business Directory"
          headline="Connect. Network. Grow."
          subheadline="Join the largest community of UTP alumni. Discover opportunities, build connections, and grow your professional network with fellow graduates."
          primaryCta={{ label: "Join the Network", href: "/abud/auth" }}
          secondaryCta={{ label: "Sign In", href: "/abud/auth" }}
        />

        {/* Stats Section */}
        <StatsSection stats={stats} loading={statsLoading} />

        {/* Features Section */}
        <section className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Everything you need to network</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Powerful tools to help you connect with alumni, discover opportunities, and build lasting professional relationships.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-lg hover:border-utp-blue/30 transition-all">
                  <CardHeader>
                    <div className="mx-auto h-12 w-12 bg-utp-blue/10 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-utp-blue" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-utp-blue to-utp-blue/80 text-white">
          <div className="container mx-auto text-center">
            <Award className="h-16 w-16 mx-auto mb-6 text-utp-gold" />
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              {user
                ? "Complete your profile and start connecting with fellow UTP alumni today."
                : "Join thousands of UTP alumni and start building your professional network today."
              }
            </p>
            <Button
              size="lg"
              variant="gold"
              className="gap-2"
              onClick={() => navigate(user ? '/abud/profile/edit' : '/abud/auth')}
            >
              <TrendingUp className="h-4 w-4" />
              {user ? "Edit Your Profile" : "Join Now"}
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 bg-muted/30">
          <div className="container mx-auto text-center text-muted-foreground">
            <p>&copy; 2024 UTP Alumni Business Directory. All rights reserved.</p>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <Link to="/abud/privacy" className="hover:text-utp-blue transition-colors">Privacy Policy</Link>
              <Link to="/abud/terms" className="hover:text-utp-blue transition-colors">Terms of Service</Link>
              <a href="#" className="hover:text-utp-blue transition-colors">Help & Support</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
