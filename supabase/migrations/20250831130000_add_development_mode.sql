-- Create app configuration table for storing global settings
CREATE TABLE IF NOT EXISTS public.app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on app_config
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Only admins can modify app config
CREATE POLICY "Admins can manage app config"
ON public.app_config
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Everyone can read app config (needed for RLS policies to check)
CREATE POLICY "Anyone can read app config"
ON public.app_config
FOR SELECT
USING (true);

-- Insert development mode setting (default to false for production)
INSERT INTO public.app_config (key, value, description)
VALUES (
  'development_mode',
  '{"enabled": false}'::jsonb,
  'Enables development mode features like showing seed data without authentication'
)
ON CONFLICT (key) DO NOTHING;

-- Add is_seed_data flag to profiles table to mark test data
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_seed_data BOOLEAN DEFAULT FALSE;

-- Create a function to check if development mode is enabled
CREATE OR REPLACE FUNCTION public.is_development_mode()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT (value->>'enabled')::boolean 
     FROM public.app_config 
     WHERE key = 'development_mode'),
    false
  )
$$;

-- Update the existing RLS policies for profiles to include development mode
-- First, drop the existing policies
DROP POLICY IF EXISTS "Alumni can view public and alumni-only profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Recreate policies with development mode support
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id
  OR (is_seed_data = true AND public.is_development_mode())
);

CREATE POLICY "Alumni can view public and alumni-only profiles"
ON public.profiles
FOR SELECT
USING (
  -- Development mode: show seed data
  (is_seed_data = true AND public.is_development_mode())
  OR
  -- Normal mode: existing visibility rules
  (
    is_seed_data = false AND (
      profile_visibility = 'public' OR 
      (profile_visibility = 'alumni_only' AND public.has_role(auth.uid(), 'alumni')) OR
      (profile_visibility = 'alumni_only' AND public.has_role(auth.uid(), 'admin'))
    )
  )
);

-- Update seed data to mark it as such
UPDATE public.profiles 
SET is_seed_data = true
WHERE full_name IN (
  'Ahmad Rizwan bin Mohd Yusof',
  'Siti Nurhaliza binti Abdul Rahman',
  'Rajesh Kumar a/l Muthu',
  'Mei Ling Tan',
  'Muhammad Faisal bin Ibrahim',
  'Priya Devi a/p Subramaniam',
  'Hassan Ali bin Omar',
  'Jennifer Wong Siew Min',
  'Arjun Nair a/l Krishnan',
  'Fatimah binti Zainal Abidin'
);

-- Create a function to toggle development mode (admin only)
CREATE OR REPLACE FUNCTION public.toggle_development_mode(enabled BOOLEAN)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can toggle development mode';
  END IF;

  -- Update the config
  UPDATE public.app_config
  SET 
    value = jsonb_build_object('enabled', enabled),
    updated_at = now()
  WHERE key = 'development_mode';

  RETURN enabled;
END;
$$;

-- Create a view to easily check current development mode status
CREATE OR REPLACE VIEW public.development_status AS
SELECT 
  public.is_development_mode() as is_enabled,
  (SELECT COUNT(*) FROM public.profiles WHERE is_seed_data = true) as seed_profiles_count,
  (SELECT COUNT(*) FROM public.profiles WHERE is_seed_data = false) as real_profiles_count;

-- Grant access to the view
GRANT SELECT ON public.development_status TO authenticated;
GRANT SELECT ON public.development_status TO anon;