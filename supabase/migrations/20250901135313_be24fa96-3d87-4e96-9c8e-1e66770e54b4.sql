-- Create business_contact table for contact methods
CREATE TABLE public.business_contact (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.user_businesses(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('phone', 'email', 'whatsapp', 'telegram', 'linkedin', 'website')),
  contact_value TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Only one primary contact per business per type
  UNIQUE(business_id, contact_type, is_primary) DEFERRABLE INITIALLY DEFERRED
);

-- Create business_achievements table for awards/achievements
CREATE TABLE public.business_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.user_businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  icon_type TEXT DEFAULT 'award' CHECK (icon_type IN ('award', 'certificate', 'milestone')),
  achieved_date DATE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_contact ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_achievements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for business_contact
CREATE POLICY "Users can view business contact info"
ON public.business_contact
FOR SELECT
USING (
  is_public = true OR
  business_id IN (
    SELECT id FROM public.user_businesses WHERE user_id = auth.uid()
  ) OR
  business_id IN (
    SELECT business_id FROM public.business_team_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Business owners and admins can manage contact info"
ON public.business_contact
FOR ALL
USING (
  business_id IN (
    SELECT id FROM public.user_businesses WHERE user_id = auth.uid()
  ) OR
  business_id IN (
    SELECT business_id FROM public.business_team_members 
    WHERE user_id = auth.uid() AND is_business_admin = true
  )
);

-- Create RLS policies for business_achievements
CREATE POLICY "Users can view business achievements"
ON public.business_achievements
FOR SELECT
USING (true);

CREATE POLICY "Business owners and admins can manage achievements"
ON public.business_achievements
FOR ALL
USING (
  business_id IN (
    SELECT id FROM public.user_businesses WHERE user_id = auth.uid()
  ) OR
  business_id IN (
    SELECT business_id FROM public.business_team_members 
    WHERE user_id = auth.uid() AND is_business_admin = true
  )
);

-- Create update triggers
CREATE TRIGGER update_business_contact_updated_at
BEFORE UPDATE ON public.business_contact
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_achievements_updated_at
BEFORE UPDATE ON public.business_achievements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();