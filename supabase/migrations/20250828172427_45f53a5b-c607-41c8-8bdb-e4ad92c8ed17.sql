-- Create tables for profile onboarding data

-- Career history table
CREATE TABLE public.career_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  current_position BOOLEAN DEFAULT false,
  description TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date_achieved DATE,
  organization TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Contributions table
CREATE TABLE public.contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_name TEXT NOT NULL,
  role TEXT,
  description TEXT,
  start_date DATE,
  end_date DATE,
  current_contribution BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User links table (social media, portfolio, etc)
CREATE TABLE public.user_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  display_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User businesses table
CREATE TABLE public.user_businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_name TEXT NOT NULL,
  position TEXT NOT NULL,
  ownership_type TEXT, -- founder, co-founder, owner, partner, etc
  start_date DATE,
  end_date DATE,
  current_business BOOLEAN DEFAULT false,
  description TEXT,
  industry TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.career_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_businesses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for career_history
CREATE POLICY "Users can view their own career history" 
ON public.career_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own career history" 
ON public.career_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own career history" 
ON public.career_history 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own career history" 
ON public.career_history 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Alumni can view career history of visible profiles" 
ON public.career_history 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = career_history.user_id 
    AND (
      (p.profile_visibility = 'public'::profile_visibility) OR 
      (p.profile_visibility = 'alumni_only'::profile_visibility AND has_role(auth.uid(), 'alumni'::user_role))
    )
  )
);

-- Create RLS policies for achievements
CREATE POLICY "Users can view their own achievements" 
ON public.achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" 
ON public.achievements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" 
ON public.achievements 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own achievements" 
ON public.achievements 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Alumni can view achievements of visible profiles" 
ON public.achievements 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = achievements.user_id 
    AND (
      (p.profile_visibility = 'public'::profile_visibility) OR 
      (p.profile_visibility = 'alumni_only'::profile_visibility AND has_role(auth.uid(), 'alumni'::user_role))
    )
  )
);

-- Create RLS policies for contributions
CREATE POLICY "Users can view their own contributions" 
ON public.contributions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contributions" 
ON public.contributions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contributions" 
ON public.contributions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contributions" 
ON public.contributions 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Alumni can view contributions of visible profiles" 
ON public.contributions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = contributions.user_id 
    AND (
      (p.profile_visibility = 'public'::profile_visibility) OR 
      (p.profile_visibility = 'alumni_only'::profile_visibility AND has_role(auth.uid(), 'alumni'::user_role))
    )
  )
);

-- Create RLS policies for user_links
CREATE POLICY "Users can view their own links" 
ON public.user_links 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own links" 
ON public.user_links 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own links" 
ON public.user_links 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own links" 
ON public.user_links 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Alumni can view links of visible profiles" 
ON public.user_links 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = user_links.user_id 
    AND (
      (p.profile_visibility = 'public'::profile_visibility) OR 
      (p.profile_visibility = 'alumni_only'::profile_visibility AND has_role(auth.uid(), 'alumni'::user_role))
    )
  )
);

-- Create RLS policies for user_businesses
CREATE POLICY "Users can view their own businesses" 
ON public.user_businesses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own businesses" 
ON public.user_businesses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own businesses" 
ON public.user_businesses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own businesses" 
ON public.user_businesses 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Alumni can view businesses of visible profiles" 
ON public.user_businesses 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = user_businesses.user_id 
    AND (
      (p.profile_visibility = 'public'::profile_visibility) OR 
      (p.profile_visibility = 'alumni_only'::profile_visibility AND has_role(auth.uid(), 'alumni'::user_role))
    )
  )
);

-- Add admin policies for all tables
CREATE POLICY "Admins can manage all career history" 
ON public.career_history 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can manage all achievements" 
ON public.achievements 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can manage all contributions" 
ON public.contributions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can manage all user links" 
ON public.user_links 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can manage all user businesses" 
ON public.user_businesses 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role));

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_career_history_updated_at
BEFORE UPDATE ON public.career_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at
BEFORE UPDATE ON public.achievements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contributions_updated_at
BEFORE UPDATE ON public.contributions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_links_updated_at
BEFORE UPDATE ON public.user_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_businesses_updated_at
BEFORE UPDATE ON public.user_businesses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();