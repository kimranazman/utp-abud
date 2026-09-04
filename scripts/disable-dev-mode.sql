-- Script to disable development mode for production
-- Run this in Supabase SQL Editor to disable development mode

-- Disable development mode
UPDATE public.app_config
SET 
  value = '{"enabled": false}'::jsonb,
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