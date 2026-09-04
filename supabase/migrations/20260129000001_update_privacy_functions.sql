-- Update search_public_profiles to respect privacy settings
CREATE OR REPLACE FUNCTION public.search_public_profiles(search_term text DEFAULT '', limit_count integer DEFAULT 50)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  course text,
  graduation_year integer,
  location_city text,
  location_state text,
  location_country text,
  bio text,
  avatar_url text,
  avatar_thumbnail_url text,
  tags text[],
  is_verified boolean,
  hide_location boolean,
  hide_graduation_year boolean
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.user_id,
    p.full_name,
    p.course,
    -- Conditionally hide graduation year
    CASE
      WHEN p.hide_graduation_year = true AND p.user_id != auth.uid() THEN NULL
      ELSE p.graduation_year
    END as graduation_year,
    -- Conditionally hide location
    CASE
      WHEN p.hide_location = true AND p.user_id != auth.uid() THEN NULL
      ELSE p.location_city
    END as location_city,
    CASE
      WHEN p.hide_location = true AND p.user_id != auth.uid() THEN NULL
      ELSE p.location_state
    END as location_state,
    CASE
      WHEN p.hide_location = true AND p.user_id != auth.uid() THEN NULL
      ELSE p.location_country
    END as location_country,
    p.bio,
    p.avatar_url,
    p.avatar_thumbnail_url,
    p.tags,
    p.is_verified,
    -- Return privacy flags for owner display
    CASE WHEN p.user_id = auth.uid() THEN COALESCE(p.hide_location, false) ELSE false END as hide_location,
    CASE WHEN p.user_id = auth.uid() THEN COALESCE(p.hide_graduation_year, false) ELSE false END as hide_graduation_year
  FROM profiles p
  WHERE
    (
      (p.profile_visibility = 'public'::profile_visibility)
      OR (p.profile_visibility = 'alumni_only'::profile_visibility AND auth.uid() IS NOT NULL)
      OR (p.is_seed_data = true AND is_development_mode())
    )
    AND p.is_verified = true
    AND (
      search_term = ''
      OR p.full_name ILIKE '%' || search_term || '%'
      OR p.course ILIKE '%' || search_term || '%'
      OR p.bio ILIKE '%' || search_term || '%'
    )
  ORDER BY p.created_at DESC
  LIMIT limit_count;
$$;

-- Update get_public_profiles similarly
CREATE OR REPLACE FUNCTION public.get_public_profiles()
RETURNS TABLE (
  user_id uuid,
  full_name text,
  course text,
  graduation_year integer,
  location_city text,
  location_state text,
  location_country text,
  bio text,
  avatar_url text,
  avatar_thumbnail_url text,
  tags text[],
  profile_visibility profile_visibility,
  is_verified boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  email text,
  is_own_profile boolean,
  hide_email boolean,
  hide_location boolean,
  hide_graduation_year boolean,
  hide_businesses boolean
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.user_id,
    p.full_name,
    p.course,
    CASE
      WHEN p.hide_graduation_year = true AND auth.uid() != p.user_id AND NOT has_role(auth.uid(), 'admin'::user_role) THEN NULL
      ELSE p.graduation_year
    END as graduation_year,
    CASE
      WHEN p.hide_location = true AND auth.uid() != p.user_id AND NOT has_role(auth.uid(), 'admin'::user_role) THEN NULL
      ELSE p.location_city
    END as location_city,
    CASE
      WHEN p.hide_location = true AND auth.uid() != p.user_id AND NOT has_role(auth.uid(), 'admin'::user_role) THEN NULL
      ELSE p.location_state
    END as location_state,
    CASE
      WHEN p.hide_location = true AND auth.uid() != p.user_id AND NOT has_role(auth.uid(), 'admin'::user_role) THEN NULL
      ELSE p.location_country
    END as location_country,
    p.bio,
    p.avatar_url,
    p.avatar_thumbnail_url,
    p.tags,
    p.profile_visibility,
    p.is_verified,
    p.created_at,
    p.updated_at,
    CASE
      WHEN (auth.uid() = p.user_id OR has_role(auth.uid(), 'admin'::user_role))
           AND (p.hide_email IS NULL OR p.hide_email = false OR auth.uid() = p.user_id) THEN p.email
      ELSE NULL
    END as email,
    (auth.uid() = p.user_id) as is_own_profile,
    COALESCE(p.hide_email, false) as hide_email,
    COALESCE(p.hide_location, false) as hide_location,
    COALESCE(p.hide_graduation_year, false) as hide_graduation_year,
    COALESCE(p.hide_businesses, false) as hide_businesses
  FROM profiles p
  WHERE
    (p.profile_visibility = 'public'::profile_visibility)
    OR (p.profile_visibility = 'alumni_only'::profile_visibility AND auth.uid() IS NOT NULL)
    OR (p.is_seed_data = true AND is_development_mode())
    OR (auth.uid() = p.user_id)
    OR has_role(auth.uid(), 'admin'::user_role);
$$;
