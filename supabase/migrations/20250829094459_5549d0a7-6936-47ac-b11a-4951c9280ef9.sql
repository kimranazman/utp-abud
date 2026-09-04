-- Update the handle_new_user function to automatically assign alumni role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  
  -- Assign alumni role by default (everyone is an alumnus)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'alumni');
  
  RETURN NEW;
END;
$function$;

-- Update existing users who only have 'pending' role to have 'alumni' role
UPDATE public.user_roles 
SET role = 'alumni' 
WHERE role = 'pending';

-- Update profiles table policies to allow any authenticated user to view public profiles
DROP POLICY IF EXISTS "Alumni can view public and alumni-only profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view visible profiles" 
ON public.profiles 
FOR SELECT 
USING (
  (profile_visibility = 'public'::profile_visibility) OR 
  (profile_visibility = 'alumni_only'::profile_visibility AND auth.uid() IS NOT NULL)
);

-- Update other table policies to work with authenticated users instead of just alumni role
DROP POLICY IF EXISTS "Alumni can view achievements of visible profiles" ON public.achievements;
CREATE POLICY "Authenticated users can view achievements of visible profiles" 
ON public.achievements 
FOR SELECT 
USING (EXISTS ( 
  SELECT 1
  FROM profiles p
  WHERE p.user_id = achievements.user_id 
    AND auth.uid() IS NOT NULL
    AND ((p.profile_visibility = 'public'::profile_visibility) OR (p.profile_visibility = 'alumni_only'::profile_visibility))
));

DROP POLICY IF EXISTS "Alumni can view career history of visible profiles" ON public.career_history;
CREATE POLICY "Authenticated users can view career history of visible profiles" 
ON public.career_history 
FOR SELECT 
USING (EXISTS ( 
  SELECT 1
  FROM profiles p
  WHERE p.user_id = career_history.user_id 
    AND auth.uid() IS NOT NULL
    AND ((p.profile_visibility = 'public'::profile_visibility) OR (p.profile_visibility = 'alumni_only'::profile_visibility))
));

DROP POLICY IF EXISTS "Alumni can view contributions of visible profiles" ON public.contributions;
CREATE POLICY "Authenticated users can view contributions of visible profiles" 
ON public.contributions 
FOR SELECT 
USING (EXISTS ( 
  SELECT 1
  FROM profiles p
  WHERE p.user_id = contributions.user_id 
    AND auth.uid() IS NOT NULL
    AND ((p.profile_visibility = 'public'::profile_visibility) OR (p.profile_visibility = 'alumni_only'::profile_visibility))
));

DROP POLICY IF EXISTS "Alumni can view links of visible profiles" ON public.user_links;
CREATE POLICY "Authenticated users can view links of visible profiles" 
ON public.user_links 
FOR SELECT 
USING (EXISTS ( 
  SELECT 1
  FROM profiles p
  WHERE p.user_id = user_links.user_id 
    AND auth.uid() IS NOT NULL
    AND ((p.profile_visibility = 'public'::profile_visibility) OR (p.profile_visibility = 'alumni_only'::profile_visibility))
));

DROP POLICY IF EXISTS "Alumni can view businesses of visible profiles" ON public.user_businesses;
CREATE POLICY "Authenticated users can view businesses of visible profiles" 
ON public.user_businesses 
FOR SELECT 
USING (EXISTS ( 
  SELECT 1
  FROM profiles p
  WHERE p.user_id = user_businesses.user_id 
    AND auth.uid() IS NOT NULL
    AND ((p.profile_visibility = 'public'::profile_visibility) OR (p.profile_visibility = 'alumni_only'::profile_visibility))
));

-- Update business-related policies for authenticated users
DROP POLICY IF EXISTS "Users can view images of accessible businesses" ON public.business_images;
CREATE POLICY "Users can view images of accessible businesses" 
ON public.business_images 
FOR SELECT 
USING (
  (EXISTS ( SELECT 1 FROM user_businesses ub WHERE ub.id = business_images.business_id AND ub.user_id = auth.uid())) OR 
  (auth.uid() IS NOT NULL AND EXISTS ( 
    SELECT 1
    FROM (user_businesses ub JOIN profiles p ON p.user_id = ub.user_id)
    WHERE ub.id = business_images.business_id 
      AND ((p.profile_visibility = 'public'::profile_visibility) OR (p.profile_visibility = 'alumni_only'::profile_visibility)) 
      AND p.is_verified = true
  )) OR 
  has_role(auth.uid(), 'admin'::user_role)
);

DROP POLICY IF EXISTS "Users can view services of accessible businesses" ON public.business_services;
CREATE POLICY "Users can view services of accessible businesses" 
ON public.business_services 
FOR SELECT 
USING (
  (EXISTS ( SELECT 1 FROM user_businesses ub WHERE ub.id = business_services.business_id AND ub.user_id = auth.uid())) OR 
  (auth.uid() IS NOT NULL AND EXISTS ( 
    SELECT 1
    FROM (user_businesses ub JOIN profiles p ON p.user_id = ub.user_id)
    WHERE ub.id = business_services.business_id 
      AND ((p.profile_visibility = 'public'::profile_visibility) OR (p.profile_visibility = 'alumni_only'::profile_visibility)) 
      AND p.is_verified = true
  )) OR 
  has_role(auth.uid(), 'admin'::user_role)
);

DROP POLICY IF EXISTS "Alumni can view team members of visible businesses" ON public.business_team_members;
CREATE POLICY "Authenticated users can view team members of visible businesses" 
ON public.business_team_members 
FOR SELECT 
USING (
  (auth.uid() = user_id) OR
  (EXISTS ( SELECT 1 FROM user_businesses ub WHERE ub.id = business_team_members.business_id AND ub.user_id = auth.uid())) OR
  (auth.uid() IS NOT NULL AND EXISTS ( 
    SELECT 1
    FROM (user_businesses ub JOIN profiles p ON p.user_id = ub.user_id)
    WHERE ub.id = business_team_members.business_id 
      AND ((p.profile_visibility = 'public'::profile_visibility) OR (p.profile_visibility = 'alumni_only'::profile_visibility))
  )) OR
  has_role(auth.uid(), 'admin'::user_role)
);