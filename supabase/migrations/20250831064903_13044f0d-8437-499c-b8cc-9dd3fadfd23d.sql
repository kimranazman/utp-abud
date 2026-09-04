-- Add development mode functionality
-- This migration adds the ability to toggle development mode on/off
-- When enabled, seed profiles with is_seed_data=true become visible without authentication

-- Create app_config table to store application settings
CREATE TABLE IF NOT EXISTS public.app_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on app_config
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Only admins can access app_config
CREATE POLICY "Admins can manage app config"
ON public.app_config
FOR ALL
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- Add is_seed_data column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_seed_data BOOLEAN DEFAULT false;

-- Insert default development mode setting (disabled by default)
INSERT INTO public.app_config (key, value)
VALUES ('development_mode', '{"enabled": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Create function to check if development mode is enabled
CREATE OR REPLACE FUNCTION public.is_development_mode()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT (value->>'enabled')::boolean 
     FROM public.app_config 
     WHERE key = 'development_mode'), 
    false
  );
$$;

-- Create view to get development status and counts
CREATE OR REPLACE VIEW public.development_status AS
SELECT 
  is_development_mode() as is_enabled,
  (SELECT COUNT(*) FROM public.profiles WHERE is_seed_data = true)::integer as seed_profiles_count,
  (SELECT COUNT(*) FROM public.profiles WHERE is_seed_data = false OR is_seed_data IS NULL)::integer as real_profiles_count;

-- Create function to toggle development mode
CREATE OR REPLACE FUNCTION public.toggle_development_mode(enabled BOOLEAN)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  UPDATE public.app_config 
  SET value = jsonb_build_object('enabled', enabled),
      updated_at = now()
  WHERE key = 'development_mode';
$$;

-- Update profiles RLS policies to include development mode logic
-- Drop existing policies to recreate them with development mode support
DROP POLICY IF EXISTS "Authenticated users can view visible profiles" ON public.profiles;

-- Recreate the policy with development mode support
CREATE POLICY "Authenticated users can view visible profiles"
ON public.profiles
FOR SELECT
USING (
  -- Regular visibility rules
  (profile_visibility = 'public'::profile_visibility) 
  OR 
  ((profile_visibility = 'alumni_only'::profile_visibility) AND (auth.uid() IS NOT NULL))
  OR
  -- Development mode: show seed profiles to everyone when enabled
  (is_seed_data = true AND is_development_mode())
);

-- Grant necessary permissions
GRANT SELECT ON public.development_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_development_mode(BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_development_mode() TO authenticated;