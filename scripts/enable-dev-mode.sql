-- Script to enable development mode for testing
-- Run this in Supabase SQL Editor to enable development mode

-- Enable development mode
UPDATE public.app_config
SET 
  value = '{"enabled": true}'::jsonb,
  updated_at = now()
WHERE key = 'development_mode';

-- Check current status
SELECT 
  key,
  value,
  description,
  updated_at
FROM public.app_config
WHERE key = 'development_mode';

-- Check development status view
SELECT * FROM public.development_status;